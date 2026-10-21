import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { useState } from 'react';
import { act, create } from 'react-test-renderer';
import { initialNotes, type AppData } from '../src/data';
import { useGoogleDriveSync, type GoogleDriveSync } from '../src/cloud/use-google-drive-sync';
import { DriveRequestError } from '../src/cloud/google-drive';
import type { DriveSessionCache } from '../src/cloud/drive-session';
import { IDBFactory } from 'fake-indexeddb';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const personal = (title: string): AppData => ({ notes: [{ ...initialNotes[0], id: `own-${title}`, title }], collections: [], folders: [] });

type Failure = { kind: 'list' | 'read' | 'write'; status: number; reason?: string };

// A minimal Google Drive double: authorization, list, read and write requests
// are recorded so the tests can prove what the app did not do.
function environment(local: AppData, remoteData: AppData | null) {
  const storage = new Map<string, string>();
  const timers = new Map<number, () => void>();
  let timerId = 0;
  let remote: { schemaVersion: number; updatedAt: number; data: AppData } | null = remoteData
    ? { schemaVersion: 1, updatedAt: 1, data: remoteData }
    : null;
  let failure: Failure | undefined;
  let silentFails = false;
  const prompts: string[] = [];
  const hints: (string | undefined)[] = [];
  const requests: string[] = [];
  const uploads: AppData[] = [];
  let revoked: string | null = null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => storage.delete(key),
  } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: new IDBFactory() });
  globalThis.window = {
    setTimeout: (callback: () => void) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id: number) => timers.delete(id),
    addEventListener() {}, removeEventListener() {},
    google: { accounts: { oauth2: {
      initTokenClient: ({ callback }: { callback: (response: object) => void }) => ({
        requestAccessToken: ({ prompt, hint }: { prompt?: string; hint?: string } = {}) => {
          prompts.push(prompt ?? '');
          hints.push(hint);
          if (silentFails && prompt === '') {
            callback({ error: 'interaction_required', error_description: 'Interação necessária' });
            return;
          }
          callback({ access_token: `token-${prompts.length}`, expires_in: 3600 });
        },
      }),
      revoke: (token: string) => { revoked = token; },
    } } },
  } as any;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method || 'GET';
    const kind = method === 'POST' || method === 'PATCH' ? 'write' : url.searchParams.get('alt') === 'media' ? 'read' : 'list';
    requests.push(kind);
    if (failure?.kind === kind) {
      const { status, reason } = failure;
      failure = undefined;
      return new Response(JSON.stringify({ error: {
        message: `Simulated HTTP ${status}`,
        ...(reason ? { errors: [{ reason }] } : {}),
      } }), { status });
    }
    if (method === 'PATCH') { remote = JSON.parse(init.body as string); uploads.push(remote!.data); return new Response(JSON.stringify({ id: 'file-1' })); }
    if (method === 'POST') {
      const text = await (init.body as Blob).text();
      remote = JSON.parse(text.split('\r\n').find(line => line.startsWith('{"schemaVersion":'))!);
      uploads.push(remote!.data);
      return new Response(JSON.stringify({ id: 'file-1' }));
    }
    return new Response(JSON.stringify(kind === 'read' ? remote : { files: remote ? [{ id: 'file-1' }] : [] }));
  };
  return {
    storage, prompts, hints, requests, uploads,
    revoked: () => revoked,
    remote: () => remote?.data,
    failNext: (next: Failure) => { failure = next; },
    failSilentAuthorization: () => { silentFails = true; },
    editRemote: (data: AppData) => { remote = { schemaVersion: 1, updatedAt: 9, data }; },
    flush: () => act(async () => { const callbacks = [...timers.values()]; timers.clear(); for (const callback of callbacks) callback(); }),
  };
}

let renderer: ReturnType<typeof create> | undefined;
let sync: GoogleDriveSync | undefined;
let setWorkspace: ((value: AppData) => void) | undefined;
afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  sync = undefined;
  setWorkspace = undefined;
});

// Each mount is a new component instance. Passing the same cache reproduces a
// Fast Refresh remount; a new cache reproduces a full page reload.
async function mount(data: AppData, cache: DriveSessionCache | null) {
  function Harness() {
    const [workspace, setData] = useState(data);
    setWorkspace = setData;
    sync = useGoogleDriveSync(workspace, setData, cache);
    return null;
  }
  await act(async () => { renderer = create(<Harness />); });
  return { sync: () => sync!, edit: (value: AppData) => act(async () => setWorkspace!(value)) };
}

async function unmount() {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  sync = undefined;
}

test('a Fast Refresh remount keeps the connection without authorizing or uploading again', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const first = await mount(data, cache);
  await act(async () => first.sync().connect());
  assert.equal(first.sync().status, 'synced');
  assert.equal(first.sync().connected, true);
  assert.equal(cloud.prompts.length, 1);
  assert.equal(cloud.requests.length, 2, 'one list and one read on the first connection');
  assert.equal(cloud.uploads.length, 0);

  await unmount();
  const second = await mount(data, cache);
  assert.equal(second.sync().connected, true);
  assert.equal(second.sync().status, 'synced');
  assert.equal(second.sync().error, null);
  assert.equal(cloud.prompts.length, 1, 'no new authorization');
  assert.equal(cloud.requests.length, 2, 'no new Drive request');
  assert.equal(cloud.uploads.length, 0, 'no new upload');
});

test('a full page reload starts without a token and without claiming the account is connected', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const first = await mount(data, {});
  await act(async () => first.sync().connect());
  assert.equal(first.sync().connected, true);

  await unmount();
  // A reload drops the in-memory session; only the "was connected" flag remains.
  const reloaded = await mount(data, {});
  assert.equal(reloaded.sync().connected, false);
  assert.equal(reloaded.sync().status, 'disconnected');
  assert.equal(reloaded.sync().wasConnected, true);
  assert.equal(cloud.prompts.length, 1, 'mounting never authorizes on its own');
  assert.equal(cloud.uploads.length, 0);
});

test('an expired token is not reused and the file stays located for the next authorization', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const first = await mount(data, cache);
  await act(async () => first.sync().connect());
  const before = cloud.requests.length;

  await unmount();
  cache.session!.expiresAt = Date.now() - 1;
  const second = await mount(data, cache);
  assert.equal(second.sync().connected, false);
  assert.equal(second.sync().status, 'error');
  assert.match(second.sync().error!, /expirou/);
  assert.equal(cloud.requests.length, before, 'an expired token is not sent to Drive');
  assert.equal(cache.session!.fileId, 'file-1', 'the located file is remembered');
});

test('HTTP 401 expires the authorization and stops automatic uploads', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const app = await mount(data, cache);
  await act(async () => app.sync().connect());
  await app.edit(personal('Edited'));
  cloud.failNext({ kind: 'read', status: 401 });
  await act(async () => app.sync().syncNow());
  assert.equal(app.sync().status, 'error');
  assert.equal(app.sync().connected, false);
  assert.match(app.sync().error!, /expirou/);
  assert.equal(cache.session!.accessToken, null);
  const requests = cloud.requests.length;
  await app.edit(personal('Edited again'));
  await cloud.flush();
  assert.equal(cloud.requests.length, requests, 'no automatic retry after the expiry');
  assert.equal(cloud.uploads.length, 0);
});

test('HTTP 403 for quota keeps the authorization and allows a later retry', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const app = await mount(data, cache);
  await act(async () => app.sync().connect());
  await app.edit(personal('Edited'));
  cloud.failNext({ kind: 'write', status: 403, reason: 'quotaExceeded' });
  await act(async () => app.sync().syncNow());
  assert.equal(app.sync().status, 'error');
  assert.match(app.sync().error!, /limite de uso/);
  assert.equal(app.sync().connected, true, 'a quota problem does not unlink the account');
  assert.ok(cache.session!.accessToken, 'the token is preserved');

  await act(async () => app.sync().syncNow());
  assert.equal(app.sync().status, 'synced');
  assert.equal(app.sync().error, null);
  assert.equal(cloud.prompts.length, 1, 'the retry did not authorize again');
  assert.equal(cloud.uploads.length, 1);
});

test('HTTP 403 for permission is reported without discarding the token', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const app = await mount(data, cache);
  await act(async () => app.sync().connect());
  await app.edit(personal('Edited'));
  cloud.failNext({ kind: 'write', status: 403, reason: 'insufficientFilePermissions' });
  await act(async () => app.sync().syncNow());
  assert.equal(app.sync().status, 'error');
  assert.match(app.sync().error!, /recusou/);
  assert.equal(app.sync().connected, true);
  assert.ok(cache.session!.accessToken);
});

test('only 401 is classified as an expired token', async () => {
  const respond = (status: number, reason?: string) => async () => new Response(JSON.stringify({
    error: { message: 'x', ...(reason ? { errors: [{ reason }] } : {}) },
  }), { status });
  const { findDriveFile } = await import('../src/cloud/google-drive');
  const kindOf = async (status: number, reason?: string) => {
    globalThis.fetch = respond(status, reason) as typeof fetch;
    try { await findDriveFile('token'); } catch (reason_) { return (reason_ as DriveRequestError).kind; }
    return 'none';
  };
  assert.equal(await kindOf(401), 'expired');
  assert.equal(await kindOf(403, 'quotaExceeded'), 'quota');
  assert.equal(await kindOf(403, 'userRateLimitExceeded'), 'quota');
  assert.equal(await kindOf(403, 'insufficientFilePermissions'), 'denied');
  assert.equal(await kindOf(403), 'denied');
  assert.equal(await kindOf(500), 'request');
});

test('the Fast Refresh cache keeps one session in memory and never persists a token', async () => {
  const { createDriveSession, driveCacheFor, setDriveAuthorization } = await import('../src/cloud/drive-session');
  const hot = { data: {} as Record<string, unknown> };
  const first = driveCacheFor(hot)!;
  first.session = createDriveSession();
  setDriveAuthorization(first.session, { token: 'in-memory-token', expiresAt: Date.now() + 60_000 });
  // Re-evaluating the module reads the same object from `hot.data`.
  const second = driveCacheFor(hot)!;
  assert.equal(second, first);
  assert.equal(second.session!.accessToken, 'in-memory-token');
  // Without Vite hot data (production, full reload) there is no shared session.
  assert.equal(driveCacheFor(undefined), null);
});

test('unlinking revokes the token, clears the session and never uploads afterwards', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const app = await mount(data, cache);
  await act(async () => app.sync().connect());
  const token = cache.session!.accessToken!;
  await act(async () => app.sync().disconnect());
  assert.equal(cloud.revoked(), token, 'revocation happens only for the explicit unlink');
  assert.equal(app.sync().connected, false);
  assert.equal(app.sync().status, 'disconnected');
  assert.equal(app.sync().wasConnected, false);
  assert.equal(cloud.storage.has('open-notes-google-drive-connected'), false);
  assert.equal(cache.session!.accessToken, null);

  await app.edit(personal('Edited after unlink'));
  await cloud.flush();
  assert.equal(cloud.uploads.length, 0, 'no upload after unlinking');

  await unmount();
  const remounted = await mount(personal('Edited after unlink'), cache);
  assert.equal(remounted.sync().connected, false, 'the remount does not resurrect the session');
});

test('a remount with local changes does not upload or resolve the conflict by itself', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const first = await mount(data, cache);
  await act(async () => first.sync().connect());
  assert.equal(first.sync().status, 'synced');

  await unmount();
  const changed = personal('Changed while the page was open');
  const second = await mount(changed, cache);
  assert.equal(second.sync().status, 'error');
  assert.match(second.sync().error!, /comparadas/);
  assert.equal(cloud.uploads.length, 0, 'restoring never writes');

  await act(async () => second.sync().syncNow());
  assert.equal(cloud.uploads.length, 0, 'a comparison happens before any write');
  assert.equal(second.sync().status, 'conflict');
  assert.equal(second.sync().connected, true);
});

test('reconnecting to a Drive copy changed elsewhere pauses for a choice without uploading', async () => {
  const data = personal('Local');
  const cloud = environment(data, personal('Drive'));
  const app = await mount(data, {});
  await act(async () => app.sync().connect());
  assert.equal(app.sync().status, 'conflict');
  assert.equal(cloud.uploads.length, 0);
  assert.deepEqual(cloud.remote(), personal('Drive'));
});

test('an unavailable silent reuse falls back to a visible authorization', async () => {
  const data = personal('Same');
  const cloud = environment(data, structuredClone(data));
  const cache: DriveSessionCache = {};
  const first = await mount(data, cache);
  await act(async () => first.sync().connect());
  assert.deepEqual(cloud.prompts, ['']);

  await act(async () => first.sync().disconnect());
  cloud.failSilentAuthorization();
  await act(async () => first.sync().connect());
  assert.deepEqual(cloud.prompts.slice(1), ['', 'select_account']);
  assert.equal(first.sync().status, 'synced');
  assert.equal(first.sync().connected, true);
});
