import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppData } from '../data';
import { connectionDecision, dataFingerprint, isExampleSpace } from './sync-policy';
import { saveRecoveryCopy } from './recovery-storage';
import { activeSyncProvider, subscribeSyncProvider, withSyncLock } from './sync-coordinator';
import {
  createDriveSnapshot,
  downloadDriveSnapshot,
  DriveAuthorizationError,
  DriveRequestError,
  findDriveFile,
  isDriveSnapshot,
  requestDriveAccess,
  revokeDriveAccess,
  updateDriveSnapshot,
  type AuthorizationMode,
  type DriveSnapshot,
} from './google-drive';
import {
  classifyDriveRecording,
  clearDriveAuthorization,
  clearDriveConnection,
  driveSessionCache,
  getDriveSession,
  hasLiveDriveToken,
  rememberDriveSync,
  restoreDriveSession,
  setDriveAuthorization,
  setDriveBase,
  singleFlight,
  type DriveSession,
  type DriveSessionCache,
} from './drive-session';

const LOCAL_UPDATED_KEY = 'open-notes-local-updated-at';
const LAST_SYNC_KEY = 'open-notes-google-drive-last-sync';
const CONNECTION_KEY = 'open-notes-google-drive-connected';

export type DriveSyncStatus = 'disconnected' | 'connecting' | 'syncing' | 'synced' | 'offline' | 'error' | 'unavailable' | 'conflict';

export type GoogleDriveSync = {
  paused?: boolean;
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

function readText(key: string) {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

export function useGoogleDriveSync(
  data: AppData,
  setData: Dispatch<SetStateAction<AppData>>,
  // Fast Refresh shares the in-memory session through `import.meta.hot.data`.
  // A full page load and production always start a fresh session.
  sessionCache: DriveSessionCache | null = driveSessionCache,
): GoogleDriveSync {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';
  const [status, setStatus] = useState<DriveSyncStatus>('disconnected');
  const [connected, setConnected] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<GoogleDriveSync['conflict']>(null);
  // The token lives only in this object, with the rest of the connection state,
  // so a remount can recover it without authorizing again.
  const cache = useRef<DriveSessionCache>(sessionCache ?? { session: undefined });
  const session = useRef<DriveSession>(getDriveSession(cache.current));
  const placed = useRef(false);
  const mounted = useRef(false);
  const ready = useRef(false);
  const dataRef = useRef(data);
  const localUpdatedAt = useRef(readNumber(LOCAL_UPDATED_KEY) || 0);
  const observedData = useRef<string | null>(null);
  const observedWorkspace = useRef(data);
  if (observedData.current === null) observedData.current = dataFingerprint(data);
  const syncing = useRef<Promise<void> | null>(null);
  const syncTimer = useRef(0);
  dataRef.current = data;

  if (!placed.current) {
    placed.current = true;
    const current = session.current;
    if (clientId && current.connected && hasLiveDriveToken(current)) {
      // Recovered from Fast Refresh: same token, same located file.
      ready.current = restoreDriveSession(current, dataFingerprint(data));
      if (ready.current) setStatus('synced');
      else {
        // The workspace changed outside this tab; compare before writing.
        setStatus('error');
        setError('A sincronização continua depois que as cópias forem comparadas.');
      }
    } else if (clientId && current.connected) {
      // The token expired while the page was open. Keep the Drive file located
      // so the next authorization does not start over.
      if (current.fileId !== null) current.located = true;
      clearDriveAuthorization(current);
      setStatus('error');
      setError('A autorização do Google expirou. Conecte novamente para continuar sincronizando.');
    } else if (!clientId) setStatus('unavailable');
    setConnected(Boolean(clientId) && current.connected);
    setWasConnected(Boolean(clientId) && (
      current.linkedBefore || current.located || current.fileId !== null
      || readText(CONNECTION_KEY) === 'true'
    ));
    setLastSyncedAt(current.lastSyncedAt ?? readNumber(LAST_SYNC_KEY));
  }

  const rememberSync = useCallback((time: number) => {
    session.current.lastSyncedAt = time;
    setLastSyncedAt(time);
    try { localStorage.setItem(LAST_SYNC_KEY, String(time)); } catch { /* Status remains available in memory. */ }
  }, []);

  const pauseForConflict = useCallback((remote: DriveSnapshot) => {
    ready.current = false;
    window.clearTimeout(syncTimer.current);
    session.current.recording = null;
    session.current.pendingRemote = remote;
    setConflict({ localNotes: dataRef.current.notes.length, remoteNotes: remote.data.notes.length });
    setStatus('conflict');
  }, []);

  const applyRemote = useCallback(async (remote: DriveSnapshot) => {
    return withSyncLock('google-drive', async () => {
      if (!session.current.accessToken) return;
      const original = dataFingerprint(dataRef.current);
      await saveRecoveryCopy(dataRef.current, remote.data);
      if (!session.current.accessToken) return;
      if (dataFingerprint(dataRef.current) !== original) { pauseForConflict(remote); return; }
      try { localStorage.setItem(LOCAL_UPDATED_KEY, String(remote.updatedAt)); } catch { /* Timestamp remains available in memory. */ }
      dataRef.current = remote.data;
      observedData.current = dataFingerprint(remote.data);
      setDriveBase(session.current, observedData.current, remote.updatedAt);
      rememberDriveSync(session.current, remote, false);
      localUpdatedAt.current = remote.updatedAt;
      setConflict(null);
      ready.current = true;
      setData(remote.data);
      rememberSync(Date.now());
      setStatus('synced');
    });
  }, [rememberSync, setData, pauseForConflict]);

  const handleFailure = useCallback((reason: unknown) => {
    const current = session.current;
    if (reason instanceof DriveAuthorizationError) {
      // A cancelled or blocked authorization is not an expired token. The
      // located file is kept so reconnecting resumes without starting over.
      clearDriveAuthorization(current);
      ready.current = false;
      if (current.fileId !== null || current.located) setWasConnected(true);
      setConnected(false);
      setStatus('error');
      setError(reason.message);
      return;
    }
    // Only HTTP 401 proves the access token is unusable. A 403 may be a
    // permission or quota problem, and discarding the token then would force a
    // new authorization for a mistake the user could still fix.
    const expired = reason instanceof DriveRequestError && reason.kind === 'expired';
    if (expired) {
      clearDriveAuthorization(current);
      ready.current = false;
      setConnected(false);
    }
    if (!navigator.onLine) {
      setStatus('offline');
      setError('Sem conexão. As alterações continuam salvas neste navegador.');
      return;
    }
    let message: string;
    if (expired) message = 'A autorização do Google expirou. Conecte novamente para continuar sincronizando.';
    else if (reason instanceof DriveRequestError && reason.kind === 'quota') {
      message = 'O Google Drive atingiu um limite de uso. Suas alterações continuam salvas neste navegador; tente sincronizar mais tarde.';
    } else if (reason instanceof DriveRequestError && reason.kind === 'denied') {
      message = 'O Google recusou esta operação no Drive. A conexão continua ativa; verifique a permissão do app e tente novamente.';
    } else message = reason instanceof Error ? reason.message : 'Não foi possível sincronizar com o Google Drive.';
    setStatus('error');
    setError(message);
  }, []);

  const upload = useCallback(async () => {
    const current = session.current;
    if (activeSyncProvider() !== 'google-drive' || !current.accessToken || !ready.current) return;
    if (syncing.current) return syncing.current;
    let completed = false;
    const operation = withSyncLock('google-drive', async () => {
      setStatus('syncing');
      setError(null);
      const updatedAt = Math.max(Date.now(), localUpdatedAt.current);
      const snapshot: DriveSnapshot = { schemaVersion: 1, updatedAt, data: dataRef.current };
      const token = current.accessToken!;
      const existingId = current.fileId || (await findDriveFile(token))?.id || null;
      current.located = true;
      if (existingId) {
        const remote = await downloadDriveSnapshot(token, existingId);
        // The read may finish after the user disconnects; its result must not
        // reopen a session that was already closed.
        if (!current.accessToken || !ready.current) return;
        if (!isDriveSnapshot(remote)) throw new Error('A cópia do Google Drive não está em um formato reconhecido.');
        if (dataFingerprint(remote.data) !== current.baseRemote) {
          pauseForConflict(remote);
          return;
        }
        await saveRecoveryCopy(dataRef.current, remote.data, 'open-notes-drive-last-upload-recovery');
      }
      if (!ready.current || !current.accessToken) return;
      // Read after the network check so edits made during it are included.
      snapshot.data = dataRef.current;
      const result = existingId
        ? await updateDriveSnapshot(token, existingId, snapshot)
        : await createDriveSnapshot(token, snapshot);
      // A request already in flight may finish after the user disconnects.
      // Its completion must not restore the disconnected session's status.
      if (!current.accessToken || !ready.current) return;
      current.fileId = result.id;
      current.located = true;
      rememberDriveSync(current, snapshot, true);
      localUpdatedAt.current = updatedAt;
      try { localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt)); } catch { /* Local content still saves separately. */ }
      const completedAt = Date.now();
      rememberSync(completedAt);
      setStatus('synced');
      completed = true;
    }).catch(handleFailure).finally(() => {
      syncing.current = null;
      // An edit's debounce can fire while this operation is in flight. That
      // callback shares the current promise, so explicitly schedule the dirty
      // state after success instead of leaving it local indefinitely.
      if (completed && current.accessToken && ready.current &&
          dataFingerprint(dataRef.current) !== current.baseRemote) {
        setStatus('syncing');
        window.clearTimeout(syncTimer.current);
        syncTimer.current = window.setTimeout(() => { void upload(); }, 1200);
      }
    });
    syncing.current = operation;
    return operation;
  }, [handleFailure, rememberSync, pauseForConflict]);

  // The account chooser is skipped only when Google can reuse the permission
  // already granted to this client for the account chosen in this tab. That
  // reuse never replaces an account choice: `prompt: ''` fails when Google
  // needs interaction, and the visible authorization runs right after.
  const authorize = useCallback(async (): Promise<string> => {
    const current = session.current;
    clearDriveAuthorization(current);
    // A visible authorization replaces the account chooser only when Google can
    // reuse the permission already granted in this browser; otherwise the
    // chooser is shown. `hint` is not used because the app never reads the
    // account e-mail.
    try {
      const grant = await requestDriveAccess(clientId, { prompt: '' });
      setDriveAuthorization(current, grant);
      return grant.token;
    } catch (error) {
      // `interaction_required`, `access_denied` or a closed popup: continue
      // with an authorization that asks the user when Google needs it.
      if (!(error instanceof DriveAuthorizationError)) throw error;
    }
    let failure: unknown = new DriveAuthorizationError('A conexão com o Google foi cancelada.', 'denied');
    for (const mode of [{ prompt: 'select_account' }, { prompt: 'consent' }] as AuthorizationMode[]) {
      try {
        const grant = await requestDriveAccess(clientId, mode);
        setDriveAuthorization(current, grant);
        return grant.token;
      } catch (error) {
        failure = error;
        if (!(error instanceof DriveAuthorizationError) || error.instruction !== 'denied') break;
      }
    }
    throw failure;
  }, [clientId]);

  const establish = useCallback(async () => {
    const current = session.current;
    // A token that is still valid is reused: authorizing again would ask the
    // user for something Google already granted.
    const token = hasLiveDriveToken(current) ? current.accessToken! : await authorize();
    if (activeSyncProvider() !== 'google-drive') return;
    // Google confirmed a usable authorization; only now the account is shown
    // as connected.
    current.connected = true;
    setConnected(true);
    setWasConnected(true);
    current.linkedBefore = true;
    try { localStorage.setItem(CONNECTION_KEY, 'true'); } catch { /* Connection still works for this session. */ }
    setStatus('syncing');
    const remoteFile = await findDriveFile(token);
    if (activeSyncProvider() !== 'google-drive' || !current.accessToken) return;
    current.fileId = remoteFile?.id || null;
    // `null` means the Drive copy does not exist yet; `located` records that.
    current.located = true;
    if (!remoteFile) {
      // A first connection must not upload sample notes as the user's workspace.
      if (isExampleSpace(dataRef.current)) {
        const empty: AppData = { notes: [], collections: [], folders: [], ...(dataRef.current.profile ? { profile: dataRef.current.profile } : {}) };
        await withSyncLock('google-drive', async () => {
          await saveRecoveryCopy(dataRef.current);
          if (!current.accessToken) return;
          if (!isExampleSpace(dataRef.current)) return;
          if (dataRef.current.profile) empty.profile = dataRef.current.profile;
          else delete empty.profile;
          observedData.current = dataFingerprint(empty);
          dataRef.current = empty;
          setData(empty);
        });
        if (activeSyncProvider() !== 'google-drive' || !current.accessToken) return;
      }
      setDriveBase(current, null);
      ready.current = true;
      await upload();
      return;
    }
    const remote = await downloadDriveSnapshot(token, remoteFile.id);
    if (activeSyncProvider() !== 'google-drive' || !current.accessToken) return;
    if (!isDriveSnapshot(remote)) throw new Error('A cópia do Google Drive não está em um formato reconhecido.');
    const recording = classifyDriveRecording(current, {
      fingerprint: dataFingerprint(remote.data),
      refreshedAt: remote.updatedAt,
    }, at => at !== undefined && at <= current.baseRemoteAt);
    if (recording?.type === 'match') {
      // This tab already wrote or read exactly this copy before a remount. It
      // is not a new device, so there is nothing to choose and nothing to send.
      const fingerprint = dataFingerprint(remote.data);
      setDriveBase(current, fingerprint, remote.updatedAt);
      const unchanged = dataFingerprint(dataRef.current) === fingerprint;
      ready.current = unchanged;
      current.connected = unchanged;
      if (unchanged) {
        rememberSync(Date.now());
        setStatus('synced');
        return;
      }
      // The workspace changed after that recording, so the comparison below
      // decides between importing, uploading or pausing for a choice.
    }
    const decision = recording?.type === 'conflict'
      ? 'conflict'
      : connectionDecision(dataRef.current, remote.data);
    if (decision === 'remote') await applyRemote(remote);
    else if (decision === 'same') {
      setDriveBase(current, dataFingerprint(remote.data), remote.updatedAt);
      rememberDriveSync(current, remote, false);
      ready.current = true;
      rememberSync(Date.now());
      setStatus('synced');
    } else pauseForConflict(remote);
  }, [authorize, rememberSync, setData, upload, applyRemote, pauseForConflict]);

  const connect = useCallback(async () => {
    if (activeSyncProvider() !== 'google-drive' || !clientId || syncing.current) return;
    const current = session.current;
    ready.current = false;
    setConflict(null);
    window.clearTimeout(syncTimer.current);
    setStatus('connecting');
    setError(null);
    try {
      // StrictMode and Fast Refresh replay handlers. Sharing the attempt avoids
      // two authorizations and a second Drive read.
      await singleFlight(current, 'connect', establish);
      if (current.accessToken && mounted.current) {
        setConnected(true);
        setWasConnected(true);
      }
    } catch (error) {
      ready.current = false;
      // A 403 is not proof that the token is unusable, so it is kept here and
      // `handleFailure` decides what to discard.
      setConnected(hasLiveDriveToken(current));
      handleFailure(error);
    }
  }, [clientId, establish, handleFailure]);

  const resolveConflict = useCallback(async (choice: 'local' | 'remote') => {
    const current = session.current;
    if (activeSyncProvider() !== 'google-drive' || !current.pendingRemote || !current.accessToken || current.fileId === null) return;
    setStatus('syncing');
    setError(null);
    try {
      const remote = await downloadDriveSnapshot(current.accessToken, current.fileId);
      if (activeSyncProvider() !== 'google-drive' || !current.accessToken) return;
      if (!isDriveSnapshot(remote)) throw new Error('A cópia do Google Drive não está em um formato reconhecido.');
      if (dataFingerprint(remote.data) !== dataFingerprint(current.pendingRemote.data)) {
        pauseForConflict(remote);
        setError('A cópia do Drive mudou enquanto você escolhia. Confira sua escolha novamente.');
        return;
      }
      if (choice === 'remote') await applyRemote(remote);
      else {
        await saveRecoveryCopy(dataRef.current, remote.data);
        if (activeSyncProvider() !== 'google-drive' || !current.accessToken) return;
        setDriveBase(current, dataFingerprint(remote.data), remote.updatedAt);
        current.pendingRemote = null;
        setConflict(null);
        ready.current = true;
        await upload();
      }
    } catch (reason) { handleFailure(reason); }
  }, [applyRemote, pauseForConflict, upload, handleFailure]);

  const disconnect = useCallback(() => {
    const current = session.current;
    // Revocation happens only here: an explicit unlink by the user.
    if (current.accessToken) revokeDriveAccess(current.accessToken);
    clearDriveConnection(current);
    ready.current = false;
    setConflict(null);
    setConnected(false);
    setWasConnected(false);
    setStatus(clientId ? 'disconnected' : 'unavailable');
    setError(null);
    window.clearTimeout(syncTimer.current);
    try {
      localStorage.removeItem(CONNECTION_KEY);
    } catch { /* UI state is still reset. */ }
  }, [clientId]);

  useEffect(() => {
    return subscribeSyncProvider(() => {
      if (activeSyncProvider() !== 'google-drive') {
        ready.current = false;
        window.clearTimeout(syncTimer.current);
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!clientId) setStatus('unavailable');
    return () => { mounted.current = false; };
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
    if (!session.current.accessToken || !ready.current) return;
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => { void upload(); }, 1200);
    return () => window.clearTimeout(syncTimer.current);
  }, [data, upload]);

  useEffect(() => {
    const online = () => {
      if (session.current.accessToken && status === 'offline') void upload();
    };
    const offline = () => {
      if (session.current.accessToken) {
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

  // An explicit request from the interface. When a restored session still has
  // to compare copies, it resumes that comparison instead of staying idle; the
  // comparison never writes before deciding.
  const syncNow = useCallback(async () => {
    if (!ready.current && hasLiveDriveToken(session.current)) return connect();
    return upload();
  }, [connect, upload]);

  return { status, connected, wasConnected, lastSyncedAt, error, conflict, resolveConflict, connect, disconnect, syncNow };
}
