import type { AppData } from '../data';
import { isUserProfile } from '../profile';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_FILE_NAME = 'open-notes.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

type TokenResponse = { access_token?: string; error?: string; error_description?: string };
type TokenClient = { requestAccessToken: (options?: { prompt?: string }) => void };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type?: string }) => void;
          }) => TokenClient;
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

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

export class DriveRequestError extends Error {
  constructor(message: string, readonly status: number) {
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

export async function requestDriveAccess(clientId: string) {
  await loadGoogleIdentity();
  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: response => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error_description || response.error || 'A conexão com o Google foi cancelada.'));
      },
      error_callback: () => reject(new Error('A conexão com o Google foi cancelada.')),
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}

export function revokeDriveAccess(accessToken: string) {
  window.google?.accounts.oauth2.revoke(accessToken);
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
    try {
      const payload = await response.json() as { error?: { message?: string } };
      if (payload.error?.message) message = payload.error.message;
    } catch { /* Keep the friendly fallback. */ }
    throw new DriveRequestError(message, response.status);
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
