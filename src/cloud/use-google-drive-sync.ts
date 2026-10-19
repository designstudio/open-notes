import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppData } from '../data';
import { connectionDecision, dataFingerprint, isExampleSpace } from './sync-policy';
import { saveRecoveryCopy } from './recovery-storage';
import {
  createDriveSnapshot,
  downloadDriveSnapshot,
  DriveRequestError,
  findDriveFile,
  isDriveSnapshot,
  requestDriveAccess,
  revokeDriveAccess,
  updateDriveSnapshot,
  type DriveSnapshot,
} from './google-drive';

const LOCAL_UPDATED_KEY = 'open-notes-local-updated-at';
const LAST_SYNC_KEY = 'open-notes-google-drive-last-sync';
const CONNECTION_KEY = 'open-notes-google-drive-connected';

export type DriveSyncStatus = 'disconnected' | 'connecting' | 'syncing' | 'synced' | 'offline' | 'error' | 'unavailable' | 'conflict';

export type GoogleDriveSync = {
  status: DriveSyncStatus;
  connected: boolean;
  wasConnected: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  conflict: { localNotes: number; remoteNotes: number } | null;
  resolveConflict: (choice: 'local' | 'remote') => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  syncNow: () => Promise<void>;
};

function readNumber(key: string) {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch { return null; }
}

export function useGoogleDriveSync(data: AppData, setData: Dispatch<SetStateAction<AppData>>): GoogleDriveSync {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
  const [status, setStatus] = useState<DriveSyncStatus>(clientId ? 'disconnected' : 'unavailable');
  const [connected, setConnected] = useState(false);
  const [wasConnected, setWasConnected] = useState(() => {
    try { return localStorage.getItem(CONNECTION_KEY) === 'true'; } catch { return false; }
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() => readNumber(LAST_SYNC_KEY));
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<GoogleDriveSync['conflict']>(null);
  const accessToken = useRef<string | null>(null);
  const fileId = useRef<string | null>(null);
  const dataRef = useRef(data);
  const localUpdatedAt = useRef(readNumber(LOCAL_UPDATED_KEY) || 0);
  const observedData = useRef<string | null>(null);
  const observedWorkspace = useRef(data);
  if (observedData.current === null) observedData.current = dataFingerprint(data);
  const ready = useRef(false);
  const baseRemote = useRef<string | null>(null);
  const pendingRemote = useRef<DriveSnapshot | null>(null);
  const syncTimer = useRef(0);
  const syncing = useRef<Promise<void> | null>(null);
  dataRef.current = data;

  const rememberSync = useCallback((time: number) => {
    setLastSyncedAt(time);
    try { localStorage.setItem(LAST_SYNC_KEY, String(time)); } catch { /* Status remains available in memory. */ }
  }, []);

  const pauseForConflict = useCallback((remote: DriveSnapshot) => {
    ready.current = false;
    window.clearTimeout(syncTimer.current);
    pendingRemote.current = remote;
    setConflict({ localNotes: dataRef.current.notes.length, remoteNotes: remote.data.notes.length });
    setStatus('conflict');
  }, []);

  const applyRemote = useCallback(async (remote: DriveSnapshot) => {
    const original = dataFingerprint(dataRef.current);
    await saveRecoveryCopy(dataRef.current, remote.data);
    if (dataFingerprint(dataRef.current) !== original) { pauseForConflict(remote); return; }
    try { localStorage.setItem(LOCAL_UPDATED_KEY, String(remote.updatedAt)); } catch { /* Timestamp remains available in memory. */ }
    dataRef.current = remote.data;
    observedData.current = dataFingerprint(remote.data);
    baseRemote.current = observedData.current;
    localUpdatedAt.current = remote.updatedAt;
    pendingRemote.current = null;
    setConflict(null);
    ready.current = true;
    setData(remote.data);
    rememberSync(Date.now());
    setStatus('synced');
  }, [rememberSync, setData, pauseForConflict]);

  const handleFailure = useCallback((reason: unknown) => {
    const authExpired = reason instanceof DriveRequestError && (reason.status === 401 || reason.status === 403);
    if (authExpired) {
      accessToken.current = null;
      setConnected(false);
    }
    if (!navigator.onLine) {
      setStatus('offline');
      setError('Sem conexão. As alterações continuam salvas neste navegador.');
      return;
    }
    setStatus('error');
    setError(authExpired
      ? 'A autorização do Google expirou. Conecte novamente para continuar sincronizando.'
      : reason instanceof Error ? reason.message : 'Não foi possível sincronizar com o Google Drive.');
  }, []);

  const upload = useCallback(async () => {
    if (!accessToken.current || !ready.current) return;
    if (syncing.current) return syncing.current;
    let completed = false;
    const operation = (async () => {
      setStatus('syncing');
      setError(null);
      const updatedAt = Math.max(Date.now(), localUpdatedAt.current);
      const snapshot: DriveSnapshot = { schemaVersion: 1, updatedAt, data: dataRef.current };
      const existingId = fileId.current || (await findDriveFile(accessToken.current!))?.id || null;
      if (existingId) {
        const remote = await downloadDriveSnapshot(accessToken.current!, existingId);
        if (!isDriveSnapshot(remote)) throw new Error('A cópia do Google Drive não está em um formato reconhecido.');
        if (dataFingerprint(remote.data) !== baseRemote.current) {
          pauseForConflict(remote);
          return;
        }
        await saveRecoveryCopy(dataRef.current, remote.data, 'open-notes-drive-last-upload-recovery');
      }
      if (!ready.current || !accessToken.current) return;
      // Read after the network check so edits made during it are included.
      snapshot.data = dataRef.current;
      const result = existingId
        ? await updateDriveSnapshot(accessToken.current!, existingId, snapshot)
        : await createDriveSnapshot(accessToken.current!, snapshot);
      // A request already in flight may finish after the user disconnects.
      // Its completion must not restore the disconnected session's status.
      if (!accessToken.current || !ready.current) return;
      fileId.current = result.id;
      baseRemote.current = dataFingerprint(snapshot.data);
      localUpdatedAt.current = updatedAt;
      try { localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt)); } catch { /* Local content still saves separately. */ }
      const completedAt = Date.now();
      rememberSync(completedAt);
      setStatus('synced');
      completed = true;
    })().catch(handleFailure).finally(() => {
      syncing.current = null;
      // An edit's debounce can fire while this operation is in flight. That
      // callback shares the current promise, so explicitly schedule the dirty
      // state after success instead of leaving it local indefinitely.
      if (completed && accessToken.current && ready.current &&
          dataFingerprint(dataRef.current) !== baseRemote.current) {
        setStatus('syncing');
        window.clearTimeout(syncTimer.current);
        syncTimer.current = window.setTimeout(() => { void upload(); }, 1200);
      }
    });
    syncing.current = operation;
    return operation;
  }, [handleFailure, rememberSync, pauseForConflict]);

  const connect = useCallback(async () => {
    if (!clientId || syncing.current) return;
    ready.current = false;
    pendingRemote.current = null;
    setConflict(null);
    window.clearTimeout(syncTimer.current);
    setStatus('connecting');
    setError(null);
    try {
      const token = await requestDriveAccess(clientId);
      accessToken.current = token;
      setConnected(true);
      setWasConnected(true);
      try { localStorage.setItem(CONNECTION_KEY, 'true'); } catch { /* Connection still works for this session. */ }
      setStatus('syncing');
      const remoteFile = await findDriveFile(token);
      fileId.current = remoteFile?.id || null;
      if (!remoteFile) {
        // A first connection must not upload sample notes as the user's workspace.
        if (isExampleSpace(dataRef.current)) {
          const empty: AppData = { notes: [], collections: [], folders: [], ...(dataRef.current.profile ? { profile: dataRef.current.profile } : {}) };
          await saveRecoveryCopy(dataRef.current);
          if (!isExampleSpace(dataRef.current)) { baseRemote.current = null; ready.current = true; await upload(); return; }
          if (dataRef.current.profile) empty.profile = dataRef.current.profile;
          else delete empty.profile;
          observedData.current = dataFingerprint(empty);
          dataRef.current = empty;
          setData(empty);
        }
        baseRemote.current = null;
        ready.current = true;
        await upload();
        return;
      }
      const remote = await downloadDriveSnapshot(token, remoteFile.id);
      if (!isDriveSnapshot(remote)) throw new Error('A cópia do Google Drive não está em um formato reconhecido.');
      const decision = connectionDecision(dataRef.current, remote.data);
      if (decision === 'remote') await applyRemote(remote);
      else if (decision === 'same') {
        baseRemote.current = dataFingerprint(remote.data);
        ready.current = true;
        rememberSync(Date.now());
        setStatus('synced');
      } else pauseForConflict(remote);
    } catch (reason) {
      ready.current = false;
      accessToken.current = null;
      setConnected(false);
      handleFailure(reason);
    }
  }, [clientId, handleFailure, rememberSync, setData, upload, applyRemote, pauseForConflict]);

  const resolveConflict = useCallback(async (choice: 'local' | 'remote') => {
    if (!pendingRemote.current || !accessToken.current || !fileId.current) return;
    setStatus('syncing');
    setError(null);
    try {
      const remote = await downloadDriveSnapshot(accessToken.current, fileId.current);
      if (!isDriveSnapshot(remote)) throw new Error('A cópia do Google Drive não está em um formato reconhecido.');
      if (dataFingerprint(remote.data) !== dataFingerprint(pendingRemote.current.data)) {
        pauseForConflict(remote);
        setError('A cópia do Drive mudou enquanto você escolhia. Confira sua escolha novamente.');
        return;
      }
      if (choice === 'remote') await applyRemote(remote);
      else {
        await saveRecoveryCopy(dataRef.current, remote.data);
        baseRemote.current = dataFingerprint(remote.data);
        pendingRemote.current = null;
        setConflict(null);
        ready.current = true;
        await upload();
      }
    } catch (reason) { handleFailure(reason); }
  }, [applyRemote, pauseForConflict, upload, handleFailure]);

  const disconnect = useCallback(() => {
    if (accessToken.current) revokeDriveAccess(accessToken.current);
    accessToken.current = null;
    ready.current = false;
    pendingRemote.current = null;
    setConflict(null);
    fileId.current = null;
    setConnected(false);
    setWasConnected(false);
    setStatus(clientId ? 'disconnected' : 'unavailable');
    setError(null);
    window.clearTimeout(syncTimer.current);
    try { localStorage.removeItem(CONNECTION_KEY); } catch { /* UI state is still reset. */ }
  }, [clientId]);

  useEffect(() => {
    // The initial fingerprint was captured above. StrictMode also replays this
    // effect; neither pass needs to serialize the entire workspace again.
    if (observedWorkspace.current === data) return;
    const fingerprint = dataFingerprint(data);
    observedWorkspace.current = data;
    if (fingerprint === observedData.current) return;
    observedData.current = fingerprint;
    const changedAt = Date.now();
    localUpdatedAt.current = changedAt;
    try { localStorage.setItem(LOCAL_UPDATED_KEY, String(changedAt)); } catch { /* Existing local save reports its own error. */ }
    if (!accessToken.current || !ready.current) return;
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => { void upload(); }, 1200);
    return () => window.clearTimeout(syncTimer.current);
  }, [data, upload]);

  useEffect(() => {
    const online = () => {
      if (accessToken.current && status === 'offline') void upload();
    };
    const offline = () => {
      if (accessToken.current) {
        setStatus('offline');
        setError('Sem conexão. As alterações continuam salvas neste navegador.');
      }
    };
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, [status, upload]);

  return { status, connected, wasConnected, lastSyncedAt, error, conflict, resolveConflict, connect, disconnect, syncNow: upload };
}
