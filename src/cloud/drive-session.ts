import type { DriveSnapshot } from './google-drive';
import { dataFingerprint } from './sync-policy';

export type DriveRecording = {
  fingerprint: string;
  /** false when the snapshot came from the Drive file instead of an upload. */
  uploaded: boolean;
};

export type DriveSession = {
  /** Access token kept only in memory, with its expiry. */
  accessToken: string | null;
  expiresAt: number;
  connected: boolean;
  fileId: string | null;
  /** The Drive file was located; `null` means it does not exist yet. */
  located: boolean;
  lastSyncedAt: number | null;
  /** Last snapshot this tab read or wrote, used as the comparison base. */
  baseRemote: string | null;
  baseRemoteAt: number;
  recording: DriveRecording | null;
  /** Remote copy waiting for the user's choice; never uploaded automatically. */
  pendingRemote: DriveSnapshot | null;
  /** The user linked a Drive copy at some point in this tab. */
  linkedBefore: boolean;
  /** In-flight reconnection attempts, shared across remounts. */
  pending: Record<string, Map<string, Promise<unknown>> | undefined>;
};

export type DriveSessionCache = { session?: DriveSession };

export function createDriveSession(): DriveSession {
  return {
    accessToken: null, expiresAt: 0, connected: false,
    fileId: null, located: false, lastSyncedAt: null,
    baseRemote: null, baseRemoteAt: 0, recording: null, pendingRemote: null,
    linkedBefore: false, pending: {},
  };
}

export function hasLiveDriveToken(session: DriveSession) {
  return Boolean(session.accessToken) && Date.now() < session.expiresAt;
}

export function clearDriveAuthorization(session: DriveSession) {
  session.accessToken = null;
  session.expiresAt = 0;
  session.connected = false;
}

export function clearDriveConnection(session: DriveSession) {
  clearDriveAuthorization(session);
  session.fileId = null;
  session.located = false;
  session.baseRemote = null;
  session.baseRemoteAt = 0;
  session.recording = null;
  session.pendingRemote = null;
}

/** Keeps an authorization in memory together with the moment it expires. */
export function setDriveAuthorization(session: DriveSession, grant: { token: string; expiresAt: number }) {
  session.accessToken = grant.token;
  session.expiresAt = grant.expiresAt;
}

/**
 * Reuses a valid authorization without any Google request or Drive upload. The
 * token itself stays valid; only the comparison base is dropped when the
 * workspace changed outside this tab.
 */
export function restoreDriveSession(session: DriveSession, currentFingerprint: string) {
  const keptBase = Boolean(session.baseRemote) && session.baseRemote === currentFingerprint;
  session.connected = keptBase;
  if (keptBase) {
    if (session.fileId !== null) session.located = true;
    return true;
  }
  // Uploading on restore would be an unexpected write, so the next
  // synchronization compares the workspace with Drive first.
  session.baseRemote = null;
  session.baseRemoteAt = 0;
  session.recording = null;
  session.fileId = null;
  session.located = false;
  return false;
}

export type DriveRecordingCheck = { type: 'match' } | { type: 'conflict' };

/**
 * Recognizes the snapshot this tab produced, so a remount can reuse the token
 * and the located file without another upload. Anything else demands a choice.
 */
export function classifyDriveRecording(
  session: DriveSession,
  remote: { fingerprint: string; refreshedAt?: number },
  settled: (refreshedAt?: number) => boolean,
): DriveRecordingCheck | null {
  const recording = session.recording;
  if (!recording) return null;
  if (!recording.uploaded) {
    if (recording.fingerprint === remote.fingerprint) session.recording = null;
    return settled(remote.refreshedAt) ? { type: 'match' } : { type: 'conflict' };
  }
  if (!settled(remote.refreshedAt)) return null;
  if (recording.fingerprint !== remote.fingerprint) return { type: 'conflict' };
  session.recording = null;
  return { type: 'match' };
}

export function rememberDriveSync(session: DriveSession, snapshot: DriveSnapshot, uploaded: boolean) {
  // Always the same canonical fingerprint the rest of the synchronization uses.
  session.recording = { fingerprint: dataFingerprint(snapshot.data), uploaded };
  session.baseRemote = session.recording.fingerprint;
  session.baseRemoteAt = snapshot.updatedAt;
  session.located = true;
  session.lastSyncedAt = Date.now();
}

export function setDriveBase(session: DriveSession, fingerprint: string | null, at = Date.now()) {
  session.baseRemote = fingerprint;
  session.baseRemoteAt = at;
}

/**
 * Remounts (StrictMode, Fast Refresh) and concurrent callers share one pending
 * request, so restoring a connection never authorizes twice.
 */
export function singleFlight<T>(session: DriveSession, key: string, run: () => Promise<T>) {
  const pending = (session.pending[key] ??= new Map<string, Promise<unknown>>()).get(key);
  if (pending) return pending as Promise<T>;
  const promise = run().finally(() => { session.pending[key]?.delete(key); });
  session.pending[key]!.set(key, promise);
  return promise;
}

/**
 * Vite keeps `hot.data` when a module is replaced, so the session, including the
 * access token, survives a Fast Refresh. Nothing is written to localStorage,
 * sessionStorage or IndexedDB, and a full page load starts without it.
 */
export function driveCacheFor(hot: { data: Record<string, unknown> } | undefined): DriveSessionCache | null {
  if (!hot) return null;
  return (hot.data.driveSessionCache as DriveSessionCache | undefined) ??= {};
}

export const driveSessionCache = driveCacheFor(import.meta.hot);

export function getDriveSession(cache: DriveSessionCache) {
  return cache.session ??= createDriveSession();
}
