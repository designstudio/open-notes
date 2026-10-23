import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { StrictMode, useState } from 'react';
import { act, create } from 'react-test-renderer';
import { initialNotes, initialCollections, initialFolders, type AppData } from '../src/data';
import { useGoogleDriveSync, type GoogleDriveSync } from '../src/cloud/use-google-drive-sync';
import { connectionDecision, dataFingerprint } from '../src/cloud/sync-policy';
import { isDriveSnapshot } from '../src/cloud/google-drive';
import { readProfile, profileInitials, prepareProfilePhoto } from '../src/profile';
import { IDBFactory } from 'fake-indexeddb';
import { recoveryCopies } from '../src/cloud/recovery-storage';
import { selectSyncProvider } from '../src/cloud/sync-coordinator';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const examples = (): AppData => structuredClone({ notes: initialNotes, collections: initialCollections, folders: initialFolders });
const personal = (title: string): AppData => ({ notes: [{ ...initialNotes[0], id: `own-${title}`, title }], collections: [], folders: [] });
let renderer: ReturnType<typeof create>;
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); });

async function setup(local: AppData, remoteData: AppData | null, quota = false, readFails = false, initialTimestamp?: number, localStorageFull = false) {
  globalThis.indexedDB = new IDBFactory();
  if (quota) {
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = (...args) => {
      const request = open(...args);
      request.addEventListener('success', () => {
        const database = request.result;
        const transaction = database.transaction.bind(database);
        database.transaction = (...input) => {
          const result = transaction(...input);
          if (input[1] === 'readwrite') result.abort();
          return result;
        };
      });
      return request;
    };
  }
  const storage = new Map<string, string>();
  if (initialTimestamp) storage.set('open-notes-local-updated-at', String(initialTimestamp));
  const timers = new Map<number, () => void>();
  let timerId = 0;
  let writes = 0;
  let currentData = local;
  let sync: GoogleDriveSync;
  let edit: (value: AppData) => void;
  let remote = remoteData ? { schemaVersion: 1, updatedAt: 1, data: remoteData } : null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (localStorageFull) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      storage.set(key, value);
    }, removeItem: (key: string) => storage.delete(key),
  } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  globalThis.window = {
    setTimeout: (callback: () => void) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id: number) => timers.delete(id),
    addEventListener() {}, removeEventListener() {},
    google: { accounts: { oauth2: {
      initTokenClient: ({ callback }) => ({ requestAccessToken: () => callback({ access_token: 'fake-token' }) }),
      revoke() {},
    } } },
  } as any;
  globalThis.fetch = async (url, init) => {
    if (init?.method === 'PATCH' || init?.method === 'POST') {
      writes++;
      if (init.method === 'PATCH') remote = JSON.parse(init.body as string);
      else {
        const multipart = await (init.body as Blob).text();
        remote = JSON.parse(multipart.split('\r\n').find(line => line.startsWith('{"schemaVersion":'))!);
      }
      return new Response(JSON.stringify({ id: 'file-1' }));
    }
    if (readFails) return new Response(JSON.stringify({ error: { message: 'Read failed' } }), { status: 500 });
    return new Response(JSON.stringify(String(url).includes('alt=media') ? remote : { files: remote ? [{ id: 'file-1' }] : [] }));
  };
  function Harness() {
    const [data, setData] = useState(local);
    currentData = data;
    edit = setData;
    sync = useGoogleDriveSync(data, setData);
    return null;
  }
  await act(async () => { renderer = create(<StrictMode><Harness /></StrictMode>); });
  return {
    storage, data: () => currentData, sync: () => sync!, writes: () => writes, remote: () => remote?.data,
    connect: () => act(async () => sync!.connect()),
    choose: (choice: 'local' | 'remote') => act(async () => sync!.resolveConflict(choice)),
    edit: (data: AppData) => act(async () => edit!(data)),
    changeRemote: (data: AppData) => { remote = { schemaVersion: 1, updatedAt: Date.now(), data }; },
    flush: () => act(async () => { const callbacks = [...timers.values()]; timers.clear(); for (const cb of callbacks) cb(); if (callbacks.length) await sync!.syncNow(); }),
  };
}

test('StrictMode initialization does not timestamp examples as edits', async () => {
  const app = await setup(examples(), personal('Drive'));
  assert.equal(app.storage.has('open-notes-local-updated-at'), false);
});

for (const provider of ['google-drive', 'dropbox'] as const) test(`Drive avoids reading unrelated notes while disconnected with ${provider} selected`, async () => {
  const local = personal('Local');
  let contentReads = 0;
  const unrelated = { ...local.notes[0], id: 'unrelated' };
  Object.defineProperty(unrelated, 'body', { enumerable: true, get() { contentReads++; return 'Unchanged text'; } });
  local.notes.push(unrelated);
  const app = await setup(local, null);
  app.storage.set('open-notes-sync-provider', provider);
  contentReads = 0;
  await app.edit({ ...local, notes: [{ ...local.notes[0], title: 'Typing' }, unrelated] });
  assert.equal(contentReads, 0, 'an inactive provider must not scan every document per key');
  assert.ok(app.storage.has('open-notes-local-updated-at'));
  assert.equal(app.writes(), 0);
});
test('connected Drive defers full comparisons until sync instead of scanning notes on each key', async () => {
  const local = personal('Local');
  let contentReads = 0;
  const unrelated = { ...local.notes[0], id: 'unrelated' };
  Object.defineProperty(unrelated, 'body', { enumerable: true, get() { contentReads++; return 'Unchanged text'; } });
  local.notes.push(unrelated);
  const app = await setup(local, structuredClone(local));
  await app.connect();
  contentReads = 0;
  for (const title of ['T', 'Ty', 'Typing']) {
    await app.edit({ ...local, notes: [{ ...local.notes[0], title }, unrelated] });
  }
  assert.equal(contentReads, 0, 'even the active provider must not scan other notes per key');
  assert.equal(app.writes(), 0);
  await app.flush();
  assert.ok(contentReads > 0, 'the sync operation compares the complete workspace');
  assert.equal(app.remote()?.notes[0].title, 'Typing');
});

test('new browser imports Drive and never uploads examples, even with a contaminated timestamp', async () => {
  const cloud = personal('Drive');
  const app = await setup(examples(), cloud, false, false, Date.now() + 999999);
  await app.connect(); await app.flush();
  assert.deepEqual(app.data(), cloud);
  assert.equal(app.writes(), 0);
  assert.equal(app.sync().status, 'synced');
});
test('different personal notes pause without replacing either side', async () => {
  const local = personal('Local');
  const app = await setup(local, personal('Drive'));
  await app.connect();
  assert.equal(app.sync().status, 'conflict');
  assert.deepEqual(app.data(), local);
  await app.edit(personal('Edited during conflict')); await app.flush();
  await act(async () => app.sync().syncNow());
  assert.equal(app.writes(), 0);
});
test('choosing Drive preserves both versions before replacing local notes', async () => {
  const local = personal('Local'), remote = personal('Drive');
  const app = await setup(local, remote);
  await app.connect(); await app.choose('remote'); await app.flush();
  assert.deepEqual(app.data(), remote);
  assert.equal(app.writes(), 0);
  const backup = (await recoveryCopies()).find(copy => copy.key.startsWith('open-notes-drive-recovery-'))!;
  assert.deepEqual(backup.local, local);
  assert.deepEqual(backup.remote, remote);
});
test('choosing local explicitly uploads and preserves the previous Drive copy', async () => {
  const local = personal('Local'), remote = personal('Drive');
  const app = await setup(local, remote);
  await app.connect(); await app.choose('local');
  assert.equal(app.writes(), 1);
  assert.deepEqual((await recoveryCopies()).find(copy => copy.key === 'open-notes-drive-last-upload-recovery')!.remote, remote);
});
test('backup failure aborts the replacement', async () => {
  const local = personal('Local');
  const app = await setup(local, personal('Drive'), true);
  await app.connect(); await app.choose('remote');
  assert.deepEqual(app.data(), local);
  assert.equal(app.writes(), 0);
  assert.equal(app.sync().status, 'error');
});

test('reconnecting to Drive succeeds with localStorage full and preserves recovery copies', async () => {
  const remote = personal('Drive');
  const app = await setup(examples(), remote, false, false, undefined, true);
  await app.connect();
  assert.equal(app.sync().status, 'synced');
  assert.deepEqual(app.data(), remote);
  assert.equal(app.writes(), 0);
  const copies = await recoveryCopies();
  assert.deepEqual(copies[0].remote, remote);
  assert.deepEqual(copies[0].local, examples());
});

test('uploading and resolving conflicts succeeds even when localStorage is full', async () => {
  const local = personal('Local'), remote = personal('Drive');
  const app = await setup(local, remote, false, false, undefined, true);
  await app.connect(); await app.choose('local');
  assert.equal(app.sync().status, 'synced');
  assert.deepEqual(app.remote(), local);
  assert.equal(app.writes(), 1);
  assert.deepEqual((await recoveryCopies()).find(copy => copy.key === 'open-notes-drive-last-upload-recovery')!.remote, remote);
});

test('first connection can create the Drive copy with localStorage full', async () => {
  const app = await setup(examples(), null, false, false, undefined, true);
  await app.connect();
  assert.equal(app.sync().status, 'synced');
  assert.deepEqual(app.remote(), { notes: [], collections: [], folders: [] });
  assert.equal((await recoveryCopies()).length, 1);
});

test('backup failure prevents overwriting the Drive copy', async () => {
  const remote = personal('Drive');
  const app = await setup(personal('Local'), remote, true);
  await app.connect(); await app.choose('local');
  assert.equal(app.sync().status, 'error');
  assert.equal(app.writes(), 0);
  assert.deepEqual(app.remote(), remote);
  assert.match(app.sync().error!, /cópia de segurança/);
});
test('Drive changes during a choice require another review', async () => {
  const app = await setup(personal('Local'), personal('Drive'));
  await app.connect(); app.changeRemote(personal('Other device'));
  await app.choose('local');
  assert.equal(app.sync().status, 'conflict');
  assert.equal(app.writes(), 0);
});
test('read failure blocks automatic uploads', async () => {
  const app = await setup(personal('Local'), personal('Drive'), false, true);
  await app.connect(); await app.edit(personal('New edit')); await app.flush();
  assert.equal(app.writes(), 0);
  assert.equal(app.sync().status, 'error');
});
test('another device changing Drive pauses a later automatic upload', async () => {
  const remote = personal('Same');
  const app = await setup(remote, remote);
  await app.connect(); app.changeRemote(personal('Other device'));
  await app.edit(personal('My edit')); await app.flush();
  assert.equal(app.writes(), 0);
  assert.equal(app.sync().status, 'conflict');
});
test('an edited example is treated as personal notes and requires a choice', async () => {
  const local = examples(); local.notes[0].body += '\nMy own text';
  const app = await setup(local, personal('Drive'));
  await app.connect();
  assert.equal(app.sync().status, 'conflict');
  assert.equal(app.writes(), 0);
  assert.deepEqual(app.data(), local);
});
test('first Drive connection without a copy starts empty rather than uploading samples', async () => {
  const app = await setup(examples(), null);
  await app.connect(); await app.flush();
  assert.deepEqual(app.data(), { notes: [], collections: [], folders: [] });
  assert.equal(app.writes(), 1);
});
test('identical personal spaces connect without uploading', async () => {
  const same = personal('Same');
  const app = await setup(same, structuredClone(same));
  await app.connect(); await app.flush();
  assert.equal(app.sync().status, 'synced');
  assert.equal(app.writes(), 0);
});

const photo = 'data:image/jpeg;base64,aGVsbG8=';
test('profile imports alongside notes from Drive on a new browser', async () => {
  const remote = { ...personal('Drive'), profile: { name: 'Alex Silva', photo } };
  const app = await setup(examples(), remote);
  await app.connect(); await app.flush();
  assert.deepEqual(app.data(), remote);
  assert.equal(app.writes(), 0);
});
test('profile edits and photo removal upload without changing notes', async () => {
  const same = personal('Same');
  const app = await setup(same, structuredClone(same));
  await app.connect();
  await app.edit({ ...same, profile: { name: 'Alex Silva', photo } }); await app.flush();
  assert.equal(app.writes(), 1);
  assert.deepEqual(app.remote()?.profile, { name: 'Alex Silva', photo });
  assert.deepEqual(app.remote()?.notes, same.notes);
  await app.edit({ ...same, profile: { name: 'Alex Silva', photo: '' } }); await app.flush();
  assert.equal(app.writes(), 2);
  assert.equal(app.remote()?.profile?.photo, '');
});
test('first connection keeps the profile while removing untouched sample notes', async () => {
  const profile = { name: 'Alex Silva', photo };
  const app = await setup({ ...examples(), profile }, null);
  await app.connect(); await app.flush();
  assert.deepEqual(app.data(), { notes: [], collections: [], folders: [], profile });
  assert.deepEqual(app.remote(), app.data());
});
test('conflicting profiles require a choice even when the notes are identical', async () => {
  const same = personal('Same');
  const local = { ...same, profile: { name: 'Local', photo } };
  const remote = { ...same, profile: { name: 'Drive', photo: '' } };
  const app = await setup(local, remote);
  await app.connect();
  assert.equal(app.sync().status, 'conflict');
  assert.deepEqual(app.data(), local);
  assert.equal(app.writes(), 0);
  await app.choose('remote');
  assert.deepEqual(app.data(), remote);
  const backup = (await recoveryCopies()).find(copy => copy.key.startsWith('open-notes-drive-recovery-'))!;
  assert.deepEqual(backup.local.profile, local.profile);
});
test('a customized local profile is not silently lost when importing Drive', () => {
  const local = { ...examples(), profile: { name: 'Local', photo } };
  assert.equal(connectionDecision(local, personal('Drive')), 'conflict');
  assert.equal(connectionDecision({ notes: [], collections: [], folders: [], profile: local.profile }, personal('Drive')), 'conflict');
});
test('old snapshots and an empty profile have the same fingerprint', () => {
  const old = personal('Old');
  assert.equal(dataFingerprint(old), dataFingerprint({ ...old, profile: { name: '', photo: '' } }));
  assert.equal(isDriveSnapshot({ schemaVersion: 1, updatedAt: 1, data: old }), true);
  assert.equal(isDriveSnapshot({ schemaVersion: 1, updatedAt: 1, data: { ...old, profile: { name: 'Name', photo: 'https://example.com/tracker.png' } } }), false);
});
test('profile initials and validation handle missing or malformed data', () => {
  assert.equal(profileInitials(' Alex Silva '), 'AS');
  assert.equal(profileInitials('Ana'), 'A');
  assert.equal(profileInitials(''), 'EU');
  assert.deepEqual(readProfile({ name: '  Ana  ', photo: '' }), { name: 'Ana', photo: '' });
  assert.deepEqual(readProfile({ name: 42, photo: '' }), { name: '', photo: '' });
});
test('photo upload rejects unsupported formats and oversized files before decoding', async () => {
  await assert.rejects(prepareProfilePhoto(new File(['bad'], 'photo.svg', { type: 'image/svg+xml' })), /JPG, PNG ou WebP/);
  await assert.rejects(prepareProfilePhoto(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'photo.png', { type: 'image/png' })), /10 MB/);
});

test('Drive pauses automatic writes while Dropbox is selected, then compares copies before resuming', async () => {
  const same = personal('Same'); const app = await setup(same, cloneSpace(same)); await app.connect();
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_name: string, task: () => Promise<unknown>) => task() } });
  await act(async () => selectSyncProvider('dropbox'));
  await app.edit(personal('Edited on another provider')); await app.flush(); assert.equal(app.writes(), 0);
  await act(async () => selectSyncProvider('google-drive'));
  await act(async () => app.sync().syncNow()); assert.equal(app.sync().status, 'conflict'); assert.equal(app.writes(), 0);
});
function cloneSpace(data: AppData) { return structuredClone(data); }
