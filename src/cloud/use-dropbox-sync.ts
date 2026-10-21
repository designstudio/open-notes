import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppData } from '../data';
import type { useDropboxAuth } from './use-dropbox-auth';
import { isDriveSnapshot, type DriveSnapshot } from './google-drive';
import { connectionDecision, dataFingerprint, isExampleSpace } from './sync-policy';
import { saveRecoveryCopy } from './recovery-storage';
import { activeSyncProvider, selectSyncProvider, subscribeSyncProvider, withSyncLock } from './sync-coordinator';
import { hoursToMs, isSyncIntervalHours, nextScheduledSync, readSyncInterval, syncAttemptKey, syncIntervalKey, type SyncIntervalHours } from './dropbox-sync-schedule';

type Remote = { revision: string; snapshot: DriveSnapshot };
type Base = { revision: string; hash: string; at: number };
export type DropboxSync = {
  status: 'paused' | 'scheduled' | 'syncing' | 'synced' | 'offline' | 'error' | 'conflict';
  lastSyncedAt: number | null; error: string | null; enabled: boolean;
  intervalHours: SyncIntervalHours; nextSyncAt: number | null;
  setIntervalHours: (hours: SyncIntervalHours) => void;
  conflict: { localNotes: number; remoteNotes: number } | null;
  syncNow: () => Promise<void>; activate: () => Promise<void>;
  resolveConflict: (choice: 'local' | 'remote') => Promise<void>;
};
const digest = async (text: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
function baseKey(connection: string) { return `open-notes-dropbox-base-${connection}`; }
function readBase(connection: string): Base | null {
  try {
    const base = JSON.parse(localStorage.getItem(baseKey(connection)) || 'null');
    return base && typeof base.revision === 'string' && /^[a-f0-9]{64}$/.test(base.hash) && Number.isFinite(base.at) ? base : null;
  } catch { return null; }
}
function validRemote(value: unknown): value is Remote {
  const remote = value as Remote;
  const unique = (items: { id: string }[]) => items.every(item => item && typeof item.id === 'string' && item.id.length > 0)
    && new Set(items.map(item => item.id)).size === items.length;
  return !!remote && typeof remote.revision === 'string' && !!remote.revision && isDriveSnapshot(remote.snapshot)
    && Number.isFinite(remote.snapshot.updatedAt)
    && unique(remote.snapshot.data.notes) && unique(remote.snapshot.data.collections) && unique(remote.snapshot.data.folders)
    && remote.snapshot.data.notes.every(note => note && typeof note.title === 'string' && typeof note.body === 'string'
      && typeof note.collection === 'string' && typeof note.icon === 'string' && Number.isFinite(note.updated)
      && ['favorite', 'archived', 'deleted'].every(key => typeof note[key as keyof typeof note] === 'boolean')
      && Array.isArray(note.tags) && note.tags.every(tag => typeof tag === 'string'))
    && remote.snapshot.data.collections.every(item => item && typeof item.id === 'string' && typeof item.name === 'string')
    && remote.snapshot.data.folders.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.collectionId === 'string');
}
export function useDropboxSync(data: AppData, setData: Dispatch<SetStateAction<AppData>>, auth: ReturnType<typeof useDropboxAuth>): DropboxSync {
  const [enabled, setEnabled] = useState(activeSyncProvider() === 'dropbox');
  const [status, setStatus] = useState<DropboxSync['status']>('paused');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<DropboxSync['conflict']>(null);
  const [intervalHours, setIntervalHoursState] = useState(readSyncInterval);
  const [nextSyncAt, setNextSyncAt] = useState<number | null>(null);
  const [scheduleVersion, setScheduleVersion] = useState(0);
  const latest = useRef({ data, auth }); latest.current = { data, auth };
  // Keep each tab's own baseline. Reading the shared preference on every run
  // would misclassify another tab's successful upload as our own old revision.
  const baseline = useRef({ connection: auth.connectionId, value: readBase(auth.connectionId) });
  if (baseline.current.connection !== auth.connectionId) baseline.current = { connection: auth.connectionId, value: readBase(auth.connectionId) };
  const mounted = useRef(false), epoch = useRef(0), pending = useRef<Remote | null>(null);
  const collided = useRef(false);
  const confirmedFingerprint = useRef<string | null>(null);
  const previousConnection = useRef(auth.connectionId);
  const forceActivation = useRef(false), retryNotBefore = useRef(0);
  const flight = useRef<Promise<void> | null>(null), timer = useRef(0);
  const run = useCallback(async (choice?: 'local' | 'remote', automatic = false) => {
    if (flight.current) return flight.current;
    const initial = latest.current.auth;
    if (activeSyncProvider() !== 'dropbox' || initial.state.status !== 'connected' || !initial.syncReady || !initial.connectionId) return;
    if (!navigator.locks) { setStatus('error'); setError('Este navegador não oferece a coordenação entre abas necessária para sincronizar com Dropbox.'); return; }
    if (pending.current && !choice) return;
    const version = epoch.current, connection = initial.connectionId;
    let refreshConflict = false;
    const live = () => mounted.current && version === epoch.current && activeSyncProvider() === 'dropbox'
      && latest.current.auth.state.status === 'connected' && latest.current.auth.connectionId === connection && !latest.current.auth.revocationPending;
    const operation = withSyncLock('dropbox', async () => {
      if (!live()) return;
      // Recheck under the cross-tab lock: another tab may have just synced.
      const due = Math.max(retryNotBefore.current, nextScheduledSync(connection, readBase(connection)?.at));
      if (automatic && due > Date.now()) return;
      if (automatic && !navigator.onLine) { setStatus('offline'); return; }
      const startedAt = Date.now();
      retryNotBefore.current = startedAt + hoursToMs(readSyncInterval());
      try { localStorage.setItem(syncAttemptKey(connection), String(startedAt)); }
      catch { throw new Error('Não foi possível salvar o agendamento da sincronização. Suas notas continuam neste navegador.'); }
      setStatus('syncing'); setError(null);
      const value: unknown = await initial.request('download');
      if (!live()) return;
      if (value !== null && !validRemote(value)) throw new Error('A cópia do Dropbox não está em um formato reconhecido. Nenhum dado foi substituído.');
      const remote = value as Remote | null;
      const pause = () => {
        pending.current = remote;
        setConflict({ localNotes: latest.current.data.notes.length, remoteNotes: remote!.snapshot.data.notes.length });
        setStatus('conflict');
      };
      if (choice && (!remote || pending.current?.revision !== remote.revision)) {
        if (remote) { pause(); setError('A cópia do Dropbox mudou enquanto você escolhia. Confira sua escolha novamente.'); return; }
        throw new Error('A cópia do Dropbox foi removida. Nenhuma versão foi substituída.');
      }
      const base = baseline.current.value;
      if (collided.current) {
        collided.current = false;
        if (remote) { pause(); return; }
        throw new Error('A cópia do Dropbox mudou durante o envio. Nenhuma versão foi sobrescrita. Tente comparar novamente.');
      }
      const localFingerprint = dataFingerprint(latest.current.data);
      const localHash = await digest(localFingerprint);
      if (!live()) return;
      let decision: 'same' | 'remote' | 'local' | 'conflict';
      if (choice) decision = choice;
      else if (!remote) {
        if (base) throw new Error('A cópia do Dropbox foi removida. Restaure open-notes-snapshot.json no Dropbox antes de continuar.');
        decision = 'local';
      } else if (dataFingerprint(remote.snapshot.data) === localFingerprint) decision = 'same';
      else if (isExampleSpace(latest.current.data)) decision = connectionDecision(latest.current.data, remote.snapshot.data) === 'remote' ? 'remote' : 'conflict';
      else if (base?.revision === remote.revision) decision = 'local';
      else if (base?.hash === localHash) decision = 'remote';
      else decision = connectionDecision(latest.current.data, remote.snapshot.data) === 'remote' ? 'remote' : 'conflict';
      if (decision === 'conflict') { pause(); return; }
      let synced: AppData;
      let revision: string;
      if (decision === 'remote') {
        await saveRecoveryCopy(latest.current.data, remote!.snapshot.data, `open-notes-dropbox-recovery-${crypto.randomUUID()}`);
        if (!live()) return;
        if (dataFingerprint(latest.current.data) !== localFingerprint) { pause(); return; }
        synced = remote!.snapshot.data; revision = remote!.revision;
        latest.current.data = synced; setData(synced);
      } else if (decision === 'local') {
        await saveRecoveryCopy(latest.current.data, remote?.snapshot.data, remote && !choice
          ? 'open-notes-dropbox-last-upload-recovery' : `open-notes-dropbox-recovery-${crypto.randomUUID()}`);
        if (!live()) return;
        // Never send starter examples as someone's workspace.
        if (!remote && isExampleSpace(latest.current.data)) {
          const empty: AppData = { notes: [], collections: [], folders: [], ...(latest.current.data.profile ? { profile: latest.current.data.profile } : {}) };
          latest.current.data = empty; setData(empty);
        }
        synced = structuredClone(latest.current.data);
        const result = await initial.request('upload', { revision: remote?.revision ?? null,
          snapshot: { schemaVersion: 1, updatedAt: Date.now(), data: synced } });
        if (!live()) return;
        if (typeof result?.revision !== 'string' || !result.revision) throw new Error('O Dropbox não confirmou a gravação. Compare novamente.');
        revision = result.revision;
      } else { synced = remote!.snapshot.data; revision = remote!.revision; }
      const hash = await digest(dataFingerprint(synced));
      if (!live()) return;
      const at = Date.now();
      // Only revisions, hashes and timestamps persist here, never notes or credentials.
      localStorage.setItem(baseKey(connection), JSON.stringify({ revision, hash, at }));
      baseline.current.value = { revision, hash, at };
      retryNotBefore.current = 0;
      pending.current = null; setConflict(null); setLastSyncedAt(at);
      confirmedFingerprint.current = dataFingerprint(synced);
      setStatus(dataFingerprint(latest.current.data) === confirmedFingerprint.current ? 'synced' : 'scheduled');
    }).catch((reason: unknown) => {
      if (!live()) return;
      const kind = (reason as { kind?: string })?.kind;
      setStatus(!navigator.onLine ? 'offline' : 'error');
      setError(reason instanceof Error ? reason.message : 'Não foi possível sincronizar com Dropbox.');
      // A conditional write failed. Read the new revision before offering a choice.
      if (kind === 'conflict') {
        collided.current = true;
        refreshConflict = true;
        pending.current = null;
      }
    }).finally(() => {
      if (flight.current === operation) flight.current = null;
      if (mounted.current) setScheduleVersion(value => value + 1);
      // One immediate reread exposes a conditional-write conflict, never a retry loop.
      if (refreshConflict && live()) void run();
    });
    flight.current = operation; return operation;
  }, [setData]);
  useEffect(() => {
    mounted.current = true;
    const changed = () => {
      epoch.current++; pending.current = null; setConflict(null); window.clearTimeout(timer.current);
      if (activeSyncProvider() !== 'dropbox') forceActivation.current = false;
      setEnabled(activeSyncProvider() === 'dropbox'); setStatus('paused');
    };
    const unsubscribe = subscribeSyncProvider(changed);
    return () => { mounted.current = false; epoch.current++; window.clearTimeout(timer.current); unsubscribe(); };
  }, []);
  useEffect(() => {
    epoch.current++; pending.current = null; setConflict(null);
    if (previousConnection.current !== auth.connectionId) {
      previousConnection.current = auth.connectionId;
      retryNotBefore.current = 0; collided.current = false; confirmedFingerprint.current = null;
    }
    const base = auth.connectionId ? readBase(auth.connectionId) : null;
    setLastSyncedAt(base?.at ?? null);
    if (enabled && auth.state.status === 'connected' && auth.syncReady) {
      const force = forceActivation.current; forceActivation.current = false;
      setStatus('scheduled');
      if (force || nextScheduledSync(auth.connectionId, base?.at) <= Date.now()) void run(undefined, !force);
    } else setStatus('paused');
  }, [enabled, auth.state.status, auth.syncReady, auth.connectionId, run]);
  useEffect(() => {
    // Editing remains local until the chosen interval or an explicit sync.
    if (enabled && dataFingerprint(data) !== confirmedFingerprint.current) setStatus(current => current === 'synced' ? 'scheduled' : current);
  }, [data, enabled]);
  useEffect(() => {
    if (!enabled || auth.state.status !== 'connected' || !auth.syncReady || auth.revocationPending || conflict || !navigator.locks) {
      setNextSyncAt(null); return;
    }
    const connection = auth.connectionId;
    const resume = () => {
      window.clearTimeout(timer.current);
      if (pending.current) { setNextSyncAt(null); return; }
      const due = Math.max(retryNotBefore.current, nextScheduledSync(connection, readBase(connection)?.at));
      setNextSyncAt(due);
      if (!navigator.onLine) return;
      const delay = Math.max(0, due - Date.now());
      if (delay > 0) setStatus(current => current === 'offline' ? 'scheduled' : current);
      timer.current = window.setTimeout(() => { void run(undefined, true); }, delay);
    };
    const storage = (event: StorageEvent) => {
      if (event.key === syncIntervalKey || event.key === null) {
        retryNotBefore.current = 0;
        setIntervalHoursState(readSyncInterval());
      }
      if (event.key === syncIntervalKey || event.key === syncAttemptKey(connection) || event.key === baseKey(connection) || event.key === null) resume();
    };
    const visible = () => { if (document.visibilityState === 'visible') resume(); };
    const offline = () => { window.clearTimeout(timer.current); setStatus('offline'); };
    resume();
    window.addEventListener('online', resume); window.addEventListener('focus', resume);
    window.addEventListener('offline', offline); window.addEventListener('storage', storage);
    document.addEventListener?.('visibilitychange', visible);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener('online', resume); window.removeEventListener('focus', resume);
      window.removeEventListener('offline', offline); window.removeEventListener('storage', storage);
      document.removeEventListener?.('visibilitychange', visible);
    };
  }, [enabled, auth.state.status, auth.syncReady, auth.connectionId, auth.revocationPending, intervalHours, lastSyncedAt, conflict, scheduleVersion, run]);
  useEffect(() => {
    const changed = (event: StorageEvent) => { if (event.key === syncIntervalKey || event.key === null) setIntervalHoursState(readSyncInterval()); };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  const setIntervalHours = useCallback((hours: SyncIntervalHours) => {
    if (!isSyncIntervalHours(hours)) return;
    try {
      localStorage.setItem(syncIntervalKey, String(hours));
      retryNotBefore.current = 0;
      setIntervalHoursState(hours);
    } catch { setError('Não foi possível salvar a periodicidade. O intervalo anterior foi mantido.'); }
  }, []);
  const activate = useCallback(async () => {
    try { forceActivation.current = !enabled; await selectSyncProvider('dropbox'); if (enabled) await run(); }
    catch (reason) { setStatus('error'); setError(reason instanceof Error ? reason.message : 'Não foi possível ativar Dropbox.'); }
  }, [enabled, run]);
  return { status, lastSyncedAt, error, conflict, enabled, activate, syncNow: run, intervalHours, setIntervalHours, nextSyncAt,
    resolveConflict: useCallback((choice: 'local' | 'remote') => run(choice), [run]) };
}
