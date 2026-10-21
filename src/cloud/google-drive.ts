import type { AppData } from '../data';
import { isUserProfile } from '../profile';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_FILE_NAME = 'open-notes.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

type TokenResponse = {
  access_token?: string;
  expires_in?: string | number;
  error?: string;
  error_description?: string;
};
// Google Identity Services documents the fields below, but its TypeScript
// surface is not published in this project's types.
type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};
type AuthorizationFailure = { type?: 'popup_failed_to_open' | 'popup_closed' | 'unknown' };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: AuthorizationFailure) => void;
          }) => TokenClient;
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

export type DriveAuthorization = {
  token: string;
  /** `Date.now()` value at which the token stops being usable. */
  expiresAt: number;
  /** True when Google answered without showing account or consent screens. */
  silent: boolean;
};

export type AuthorizationMode = {
  /** `''` reuses an existing permission; the other values require interaction. */
  prompt: '' | 'select_account' | 'consent';
};

/**
 * Failures of the authorization request itself (closed popup, blocked popup,
 * denied access). They are not HTTP responses from the Drive API.
 */
export class DriveAuthorizationError extends Error {
  constructor(message: string, readonly instruction: 'denied' | 'popup_closed' | 'popup_failed_to_open' | 'unavailable') {
    super(message);
  }
}

const MAX_TOKEN_LIFETIME_MS = 3600_000;
const DENIAL_REASONS = new Set([
  'insufficientFilePermissions', 'insufficientPermissions', 'forbidden',
  'appNotAuthorizedToFile', 'domainPolicy', 'sharingRateLimitExceeded',
]);
const QUOTA_REASONS = new Set([
  'quotaExceeded', 'storageQuotaExceeded', 'userRateLimitExceeded', 'rateLimitExceeded',
  'dailyLimitExceeded', 'backendError',
]);

export type DriveSnapshot = {
  schemaVersion: 1;
  updatedAt: number;
  data: AppData;
};

export type DriveFile = {
  id: string;
  modifiedTime?: string;
  version?: string;
};

/**
 * `expired` means the API answered 401: the token is no longer valid.
 * `denied` and `quota` are 403 responses that must not discard the token.
 */
export type DriveErrorKind = 'expired' | 'denied' | 'quota' | 'request';

export class DriveRequestError extends Error {
  constructor(message: string, readonly status: number, readonly kind?: DriveErrorKind) {
    super(message);
  }
}

let identityPromise: Promise<void> | null = null;

export function loadGoogleIdentity() {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  if (identityPromise) return identityPromise;
  identityPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    const script = existing || document.createElement('script');
    const onLoad = () => window.google?.accounts.oauth2
      ? resolve()
      : reject(new Error('O Google Identity não ficou disponível.'));
    const onError = () => reject(new Error('Não foi possível carregar a conexão com o Google.'));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      document.head.appendChild(script);
    }
  });
  return identityPromise;
}

function tokenLifetime(response: TokenResponse) {
  const reported = Number(response.expires_in);
  const lifetime = Number.isFinite(reported) && reported > 0 ? reported * 1000 : MAX_TOKEN_LIFETIME_MS;
  return Math.min(lifetime, MAX_TOKEN_LIFETIME_MS);
}

function authorizationError(error: AuthorizationFailure) {
  if (error.type === 'popup_failed_to_open') return new DriveAuthorizationError(
    'O navegador bloqueou a janela de autorização do Google. Permita janelas pop-up para este site e tente novamente.',
    'popup_failed_to_open');
  if (error.type === 'popup_closed') return new DriveAuthorizationError(
    'A janela de autorização do Google foi fechada. Tente novamente quando quiser vincular a conta.',
    'popup_closed');
  return new DriveAuthorizationError('A conexão com o Google foi cancelada.', 'denied');
}

/**
 * Requests an access token. `prompt: ''` only succeeds when Google can reuse a
 * permission already granted to this client for the account in this browser;
 * it never replaces the account chooser. Identity Services then answers with
 * `interaction_required` or `access_denied`, and the caller asks for a visible
 * authorization instead. No path forces a silent authorization.
 */
export async function requestDriveAccess(clientId: string, mode: AuthorizationMode): Promise<DriveAuthorization> {
  await loadGoogleIdentity();
  return new Promise<DriveAuthorization>((resolve, reject) => {
    let settled = false;
    const finish = (result: DriveAuthorization | DriveAuthorizationError) => {
      if (settled) return;
      settled = true;
      if (result instanceof DriveAuthorizationError) reject(result);
      else resolve(result);
    };
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: response => {
        if (response.access_token) {
          finish({
            token: response.access_token,
            expiresAt: Date.now() + tokenLifetime(response),
            silent: mode.prompt === '',
          });
        } else finish(new DriveAuthorizationError(
          response.error_description || response.error || 'A conexão com o Google foi cancelada.', 'denied'));
      },
      error_callback: error => finish(authorizationError(error)),
    });
    try {
      client.requestAccessToken({ prompt: mode.prompt });
    } catch (reason) {
      finish(new DriveAuthorizationError(reason instanceof Error
        ? reason.message
        : 'Não foi possível abrir a autorização do Google.', 'unavailable'));
    }
  });
}

export function revokeDriveAccess(accessToken: string) {
  window.google?.accounts.oauth2.revoke(accessToken);
}

type DriveErrorPayload = { error?: { message?: string; errors?: { reason?: string }[] } };

function errorKind(status: number, reasons: string[]): DriveErrorKind {
  if (status === 401) return 'expired';
  if (status === 403) {
    if (reasons.some(reason => QUOTA_REASONS.has(reason))) return 'quota';
    // 403 without a known reason cannot prove the token expired either.
    return 'denied';
  }
  if (status === 429) return 'quota';
  return 'request';
}

async function driveFetch<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let message = 'O Google Drive não conseguiu concluir a sincronização.';
    let reasons: string[] = [];
    try {
      const payload = await response.json() as DriveErrorPayload;
      if (payload.error?.message) message = payload.error.message;
      reasons = (payload.error?.errors || []).flatMap(item => item.reason ? [item.reason] : []);
    } catch { /* Keep the friendly fallback. */ }
    if (response.status === 403 && reasons.some(reason => DENIAL_REASONS.has(reason))) {
      message = `O Google negou o acesso a esta operação: ${message}`;
    }
    throw new DriveRequestError(message, response.status, errorKind(response.status, reasons));
  }
  return response.json() as Promise<T>;
}

export async function findDriveFile(accessToken: string) {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${DRIVE_FILE_NAME}' and trashed = false`,
    fields: 'files(id,modifiedTime,version)',
    pageSize: '1',
  });
  const result = await driveFetch<{ files?: DriveFile[] }>(`${DRIVE_API}/files?${params}`, accessToken);
  return result.files?.[0] || null;
}

export function downloadDriveSnapshot(accessToken: string, fileId: string) {
  return driveFetch<DriveSnapshot>(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`, accessToken);
}

export async function createDriveSnapshot(accessToken: string, snapshot: DriveSnapshot) {
  const boundary = `open_notes_${crypto.randomUUID()}`;
  const metadata = JSON.stringify({
    name: DRIVE_FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: 'application/json',
  });
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(snapshot)}\r\n`,
    `--${boundary}--`,
  ], { type: `multipart/related; boundary=${boundary}` });
  return driveFetch<DriveFile>(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,modifiedTime,version`, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
}

export function updateDriveSnapshot(accessToken: string, fileId: string, snapshot: DriveSnapshot) {
  return driveFetch<DriveFile>(`${DRIVE_UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,modifiedTime,version`, accessToken, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(snapshot),
  });
}

export function isDriveSnapshot(value: unknown): value is DriveSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<DriveSnapshot>;
  return snapshot.schemaVersion === 1
    && typeof snapshot.updatedAt === 'number'
    && !!snapshot.data
    && Array.isArray(snapshot.data.notes)
    && Array.isArray(snapshot.data.collections)
    && Array.isArray(snapshot.data.folders)
    && (snapshot.data.profile === undefined || isUserProfile(snapshot.data.profile));
}
