import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { useState } from 'react';
import { act, create } from 'react-test-renderer';
import { initialNotes, initialCollections, initialFolders, type AppData } from '../src/data';
import { useDropboxSync, type DropboxSync } from '../src/cloud/use-dropbox-sync';
import type { useDropboxAuth } from '../src/cloud/use-dropbox-auth';
import { recoveryCopies } from '../src/cloud/recovery-storage';
import { activeSyncProvider, selectSyncProvider, withSyncLock } from '../src/cloud/sync-coordinator';
import { appEnvironment } from './helpers/app-environment';
import { hoursToMs, readSyncInterval, syncAttemptKey, syncIntervalKey } from '../src/cloud/dropbox-sync-schedule';

const personal = (title: string): AppData => ({ notes: [{ ...initialNotes[0], id: 'personal', title }], collections: [], folders: [], profile: { name: 'Nome', photo: '' } });
const empty = (): AppData => ({ notes: [], collections: [], folders: [] });
const clone = <T,>(value: T): T => structuredClone(value);
async function setup(t: TestContext, local: AppData, cloud: AppData | null = null) {
  const env = appEnvironment('/library', null);
  let lock = Promise.resolve<unknown>(undefined);
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_name: string, task: () => Promise<unknown>) => {
    const result = lock.then(task); lock = result.catch(() => {}); return result;
  } } });
  let revision = 1, remote = cloud ? { revision: '1', snapshot: { schemaVersion: 1, updatedAt: 100, data: clone(cloud) } } : null;
  let data = local, sync: DropboxSync, edit!: (data: AppData) => void;
  let fail: string | null = null, beforeRead: (() => Promise<void>) | null = null, beforeUpload: (() => void | Promise<void>) | null = null;
  const writes: AppData[] = [], reads: string[] = [];
  const auth: ReturnType<typeof useDropboxAuth> = {
    checking: false, state: { status: 'connected' }, linked: true, appKey: 'syntheticKey', setAppKey() {},
    revocationPending: false, callbackUri: '', serviceMessage: null, syncReady: true, connectionId: 'testConnection',
    async connect() {}, async disconnect() {}, async verifyPermissions() {},
    async request(path: string, body?: any) {
      if (fail) throw Object.assign(new Error(fail), { kind: fail });
      if (path === 'download') { reads.push(path); const callback = beforeRead; beforeRead = null; await callback?.(); return clone(remote); }
      assert.equal(path, 'upload'); await beforeUpload?.(); beforeUpload = null;
      if (body.revision !== (remote?.revision ?? null)) throw Object.assign(new Error('revision conflict'), { kind: 'conflict' });
      writes.push(clone(body.snapshot.data));
      remote = { revision: String(++revision), snapshot: clone(body.snapshot) };
      return { revision: remote.revision };
    },
  };
  function Harness() {
    const [current, setData] = useState(local); data = current; edit = setData;
    sync = useDropboxSync(current, setData, auth); return null;
  }
  let renderer: ReturnType<typeof create>;
  const mount = async () => { await act(async () => { renderer = create(<Harness />); }); };
  await mount();
  t.after(async () => { await act(async () => renderer.unmount()); env.restore(); });
  const settle = async () => {
    for (let turn = 0; turn < 10; turn++) {
      const pending = lock;
      await act(async () => { await pending; });
      if (pending === lock) return;
    }
    throw new Error('Unexpected repeated synchronization');
  };
  const syncNow = async () => { await act(async () => { await sync!.syncNow(); }); };
  return { env, auth, writes, reads, settle, data: () => data, sync: () => sync!, remote: () => clone(remote),
    async activate() { await act(async () => sync!.activate()); await syncNow(); }, syncNow,
    async edit(next: AppData) { await act(async () => edit(next)); },
    async choose(choice: 'local' | 'remote') { await act(async () => sync!.resolveConflict(choice)); },
    changeRemote(next: AppData | null) { remote = next ? { revision: String(++revision), snapshot: { schemaVersion: 1, updatedAt: 100, data: clone(next) } } : null; },
    fail(value: string | null) { fail = value; },
    beforeRead(value: () => Promise<void>) { beforeRead = value; }, beforeUpload(value: () => void | Promise<void>) { beforeUpload = value; },
    async reload(force = true) { local = clone(data); await act(async () => renderer.unmount()); await mount(); if (force) await syncNow(); await settle(); },
    async reopenAfter(ms: number) { local = clone(data); await act(async () => renderer.unmount()); await env.advance(ms); await mount(); await settle(); },
    async advance(ms: number) { await env.advance(ms); await settle(); },
    async schedule(hours: Parameters<DropboxSync['setIntervalHours']>[0]) { await act(async () => sync!.setIntervalHours(hours)); await settle(); },
    async fire(type: string, event?: unknown) { await act(async () => env.listeners.get(type)?.forEach(listener => (listener as any)(event))); await settle(); },
    async rerender() { await act(async () => renderer.update(<Harness />)); },
  };
}

test('Dropbox authorization alone never uploads; activation writes a full snapshot and records its time', async t => {
  const app = await setup(t, personal('Local'));
  assert.equal(app.writes.length, 0); assert.equal(app.sync().lastSyncedAt, null);
  await app.activate();
  assert.equal(activeSyncProvider(), 'dropbox'); assert.equal(app.sync().status, 'synced');
  assert.deepEqual(app.remote()?.snapshot.data, app.data()); assert.ok(app.sync().lastSyncedAt);
  assert.equal((await recoveryCopies()).filter(copy => copy.key.startsWith('open-notes-dropbox-recovery-')).length, 1);
});
test('Dropbox replaces untouched examples only after backing them up and never uploads them', async t => {
  const examples = clone({ notes: initialNotes, collections: initialCollections, folders: initialFolders });
  const app = await setup(t, examples); await app.activate();
  assert.deepEqual(app.writes, [empty()]); assert.deepEqual((await recoveryCopies())[0].local, examples);
});
test('Dropbox imports into a fresh workspace and preserves complete local and remote recovery copies', async t => {
  const remote = personal('Remote'), app = await setup(t, empty(), remote); await app.activate();
  assert.deepEqual(app.data(), remote); assert.equal(app.writes.length, 0);
  const copy = (await recoveryCopies())[0]; assert.deepEqual(copy.local, empty()); assert.deepEqual(copy.remote, remote);
});
for (const choice of ['local', 'remote'] as const) test(`Dropbox pauses different personal workspaces; choosing ${choice} preserves both versions`, async t => {
  const local = personal('Local'), remote = personal('Remote'), app = await setup(t, local, remote); await app.activate();
  assert.equal(app.sync().status, 'conflict'); assert.equal(app.writes.length, 0);
  await app.edit(personal('Edited during conflict')); await app.syncNow(); assert.equal(app.writes.length, 0);
  await app.choose(choice);
  assert.equal(app.sync().status, 'synced');
  assert.equal(app.data().notes[0].title, choice === 'local' ? 'Edited during conflict' : 'Remote');
  const copy = (await recoveryCopies())[0]; assert.equal(copy.local.notes[0].title, 'Edited during conflict'); assert.deepEqual(copy.remote, remote);
});
test('Dropbox checks the revision again when a conflict choice is confirmed', async t => {
  const app = await setup(t, personal('Local'), personal('Remote')); await app.activate();
  app.changeRemote(personal('Changed while choosing')); await app.choose('local');
  assert.equal(app.writes.length, 0); assert.equal(app.sync().status, 'conflict'); assert.match(app.sync().error!, /mudou/);
});
test('Dropbox resumes after reload, uploads local edits, and imports remote-only changes automatically', async t => {
  const app = await setup(t, personal('Local')); await app.activate(); const time = app.sync().lastSyncedAt;
  await app.edit(personal('Updated')); await app.reload();
  assert.equal(app.sync().status, 'synced'); assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Updated');
  assert.ok(app.sync().lastSyncedAt! >= time!);
  app.changeRemote(personal('Other device')); await app.reload();
  assert.equal(app.data().notes[0].title, 'Other device'); assert.equal(app.writes.length, 2);
});
test('Dropbox detects independent edits on both sides after reload instead of overwriting', async t => {
  const app = await setup(t, personal('Local')); await app.activate();
  await app.edit(personal('Local edit')); app.changeRemote(personal('Remote edit')); await app.reload();
  assert.equal(app.sync().status, 'conflict'); assert.equal(app.writes.length, 1); assert.equal(app.data().notes[0].title, 'Local edit');
});
test('Dropbox refuses to recreate a deleted snapshot after a successful sync', async t => {
  const app = await setup(t, personal('Local')); await app.activate(); app.changeRemote(null); await app.syncNow();
  assert.equal(app.sync().status, 'error'); assert.match(app.sync().error!, /removida/); assert.equal(app.writes.length, 1);
});
test('Dropbox keeps edits offline and sends them when online again', async t => {
  const app = await setup(t, personal('Local')); await app.activate();
  await app.edit(personal('Offline edit')); app.fail('network'); await app.env.network(false); await app.syncNow();
  assert.equal(app.sync().status, 'offline'); assert.equal(app.writes.length, 1);
  app.fail(null); await app.env.network(true); await app.syncNow();
  assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Offline edit');
});
test('Dropbox never substitutes a local workspace if IndexedDB recovery storage fails', async t => {
  const app = await setup(t, empty(), personal('Remote'));
  const original = indexedDB.open;
  indexedDB.open = (() => { throw new Error('quota'); }) as any;
  try { await app.activate(); assert.equal(app.sync().status, 'error'); assert.deepEqual(app.data(), empty()); assert.equal(app.writes.length, 0); }
  finally { indexedDB.open = original; }
});
test('Dropbox ignores read results after unlink and requires new permissions for old authorizations', async t => {
  const app = await setup(t, personal('Local')); app.auth.syncReady = false; await app.activate();
  assert.equal(app.writes.length, 0);
  app.auth.syncReady = true; app.beforeRead(async () => { app.auth.state = { status: 'disconnected' }; });
  await app.syncNow(); assert.equal(app.writes.length, 0); assert.equal(app.sync().lastSyncedAt, null);
});
test('provider changes wait for the in-flight operation and block the previous provider across all tabs', async t => {
  const app = await setup(t, personal('Local'));
  let release!: () => void, started!: () => void;
  const gate = new Promise<void>(done => { release = done; }), entered = new Promise<void>(done => { started = done; });
  const work = withSyncLock('google-drive', async () => { started(); await gate; });
  await entered;
  const switching = selectSyncProvider('dropbox');
  assert.equal(activeSyncProvider(), 'google-drive'); release(); await work; await act(async () => switching);
  let ran = false; await withSyncLock('google-drive', async () => { ran = true; }); assert.equal(ran, false);
  await app.syncNow(); assert.equal(app.sync().status, 'synced');
  await act(async () => selectSyncProvider('google-drive'));
  await app.edit(personal('Paused Dropbox')); await app.syncNow();
  assert.equal(app.writes.length, 1); assert.equal(app.sync().enabled, false);
});
test('Dropbox activation fails closed without Web Locks or durable provider preferences', async t => {
  const app = await setup(t, personal('Local'));
  const locks = navigator.locks; Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined });
  await app.activate(); assert.equal(app.sync().status, 'error'); assert.equal(app.writes.length, 0);
  Object.defineProperty(navigator, 'locks', { configurable: true, value: locks });
  const storage = localStorage;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: storage.getItem.bind(storage), setItem() { throw new Error('storage blocked'); }, removeItem: storage.removeItem.bind(storage),
  } });
  try { await app.activate(); assert.equal(app.sync().status, 'error'); assert.equal(app.writes.length, 0); }
  finally { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage }); }
});

test('Dropbox sends edits only at the scheduled time and retains only the last routine-upload backup', async t => {
  const app = await setup(t, personal('Local')); await app.activate();
  await app.edit(personal('Automatic')); await app.advance(1200); assert.equal(app.writes.length, 1);
  await app.advance(hoursToMs(1) - 1200);
  assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Automatic');
  await app.edit(personal('Another automatic')); await app.advance(hoursToMs(1));
  const copies = await recoveryCopies();
  assert.equal(copies.filter(copy => copy.key === 'open-notes-dropbox-last-upload-recovery').length, 1);
  assert.equal(app.writes.length, 3);
});
test('Dropbox does not adopt a different tab baseline and overwrite that tab’s newer upload', async t => {
  const app = await setup(t, personal('Original')); await app.activate();
  const newRemote = personal('Other tab'); app.changeRemote(newRemote);
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((await import('../src/cloud/sync-policy')).dataFingerprint(newRemote)));
  const hash = [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  localStorage.setItem('open-notes-dropbox-base-testConnection', JSON.stringify({ revision: app.remote()!.revision, hash, at: Date.now() }));
  await app.syncNow();
  assert.equal(app.writes.length, 1); assert.deepEqual(app.data(), newRemote);
});
test('Dropbox preserves edits made during the download instead of replacing the edited workspace', async t => {
  const app = await setup(t, empty(), personal('Remote'));
  app.beforeRead(async () => { await app.edit(personal('New local note')); });
  await app.activate();
  assert.equal(app.sync().status, 'conflict'); assert.equal(app.writes.length, 0); assert.equal(app.data().notes[0].title, 'New local note');
});
test('Dropbox rejects malformed remote notes and does not create a success timestamp', async t => {
  const broken = personal('Broken'); broken.notes.push(clone(broken.notes[0]));
  const app = await setup(t, empty(), broken); await app.activate();
  assert.equal(app.sync().status, 'error'); assert.equal(app.sync().lastSyncedAt, null); assert.deepEqual(app.data(), empty());
});
test('Dropbox refreshes a conditional-write conflict once then waits for an explicit choice', async t => {
  const app = await setup(t, personal('Local')); await app.activate(); await app.edit(personal('Local edit'));
  app.beforeUpload(() => app.changeRemote(personal('Concurrent remote edit')));
  await app.syncNow(); await app.settle();
  assert.equal(app.sync().status, 'conflict'); assert.equal(app.writes.length, 1); assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Concurrent remote edit');
});

test('Dropbox keeps edits made during an upload for the next scheduled sync', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.edit(personal('First edit'));
  app.beforeUpload(async () => { await app.edit(personal('Edit during upload')); });
  await app.syncNow(); assert.equal(app.remote()?.snapshot.data.notes[0].title, 'First edit');
  assert.equal(app.sync().status, 'scheduled');
  await app.advance(1200); assert.equal(app.writes.length, 2);
  await app.advance(hoursToMs(1) - 1200);
  assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Edit during upload'); assert.equal(app.writes.length, 3);
});

for (const hours of [1, 3, 6, 12, 24] as const) test(`Dropbox waits ${hours}h before sending and receiving automatically`, async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.schedule(hours);
  const at = app.sync().lastSyncedAt!;
  assert.equal(app.sync().intervalHours, hours); assert.equal(app.sync().nextSyncAt, at + hoursToMs(hours));
  await app.edit(personal(`Edit waiting ${hours}h`));
  const reads = app.reads.length;
  await app.advance(hoursToMs(hours) - 1);
  assert.equal(app.writes.length, 1); assert.equal(app.reads.length, reads);
  await app.advance(1);
  assert.equal(app.writes.length, 2); assert.equal(app.remote()?.snapshot.data.notes[0].title, `Edit waiting ${hours}h`);
  assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(hours));
});

test('Dropbox receives remote changes only at the selected interval', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.schedule(3);
  app.changeRemote(personal('Other device'));
  await app.advance(hoursToMs(1)); await app.fire('focus');
  assert.equal(app.data().notes[0].title, 'Original');
  await app.advance(hoursToMs(2));
  assert.equal(app.data().notes[0].title, 'Other device'); assert.equal(app.writes.length, 1);
});

test('Dropbox manual sync anticipates the interval and restarts the schedule after success', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.schedule(6);
  await app.advance(hoursToMs(1)); await app.edit(personal('Manual edit')); await app.syncNow();
  assert.equal(app.writes.length, 2); assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(6));
  await app.advance(hoursToMs(5)); assert.equal(app.writes.length, 2);
});

test('Dropbox persists the interval across reloads without syncing before it is due', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.schedule(12);
  await app.edit(personal('Local unsent edit')); const before = app.reads.length, next = app.sync().nextSyncAt;
  await app.reload(false);
  assert.equal(app.reads.length, before); assert.equal(app.sync().intervalHours, 12); assert.equal(app.sync().nextSyncAt, next);
  assert.equal(app.data().notes[0].title, 'Local unsent edit'); assert.equal(app.writes.length, 1);
});

test('Dropbox runs one overdue sync after reopening instead of replaying every missed interval', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.edit(personal('Before closing'));
  const before = app.reads.length;
  await app.reopenAfter(hoursToMs(24) * 2 + 1);
  assert.equal(app.reads.length, before + 1); assert.equal(app.writes.length, 2);
  assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Before closing');
  assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(1));
});

test('Dropbox focus and network restoration cannot anticipate the interval', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.edit(personal('Waiting'));
  const before = app.reads.length;
  await app.advance(1200); await app.fire('focus'); await app.env.network(false); await app.env.network(true); await app.advance(0);
  assert.equal(app.reads.length, before); assert.equal(app.writes.length, 1);
});

test('Dropbox runs an overdue offline sync when connectivity returns', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.edit(personal('Offline'));
  await app.env.network(false); const before = app.reads.length;
  await app.advance(hoursToMs(3)); assert.equal(app.reads.length, before);
  await app.env.network(true); await app.advance(0);
  assert.equal(app.writes.length, 2); assert.equal(app.remote()?.snapshot.data.notes[0].title, 'Offline');
});

test('Dropbox waits until the next interval after an automatic failure without retrying in a loop', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.edit(personal('Waiting after failure'));
  const synced = app.sync().lastSyncedAt;
  app.fail('network'); await app.advance(hoursToMs(1));
  assert.equal(app.sync().status, 'error'); assert.equal(app.sync().lastSyncedAt, synced);
  assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(1));
  app.fail(null); await app.advance(hoursToMs(1) - 1); assert.equal(app.writes.length, 1);
  await app.advance(1); assert.equal(app.writes.length, 2);
});

test('shortening an overdue interval synchronizes now, while extending it postpones the next run', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.schedule(6);
  await app.edit(personal('Waiting')); await app.advance(hoursToMs(2)); await app.schedule(1); await app.advance(0);
  assert.equal(app.writes.length, 2); assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(1));
  await app.schedule(24); const before = app.reads.length;
  await app.advance(hoursToMs(1)); assert.equal(app.reads.length, before);
});

test('Dropbox observes interval and attempt updates from another tab without adopting its workspace baseline', async t => {
  const app = await setup(t, personal('Original')); await app.activate();
  localStorage.setItem(syncIntervalKey, '3'); await app.fire('storage', { key: syncIntervalKey });
  assert.equal(app.sync().intervalHours, 3); assert.equal(app.sync().nextSyncAt, app.sync().lastSyncedAt! + hoursToMs(3));
  await app.advance(hoursToMs(1));
  localStorage.setItem(syncAttemptKey('testConnection'), String(Date.now()));
  await app.fire('storage', { key: syncAttemptKey('testConnection') });
  assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(3));
});

test('Dropbox interval selection accepts only supported values and safely defaults corrupt preferences to 1h', async t => {
  const app = await setup(t, personal('Original')); assert.equal(app.sync().intervalHours, 1);
  for (const invalid of ['0', '2', 'bad', 'Infinity', '-1', '25']) {
    localStorage.setItem(syncIntervalKey, invalid); assert.equal(readSyncInterval(), 1);
  }
  await app.schedule(3); await app.schedule(2 as any);
  assert.equal(app.sync().intervalHours, 3); assert.equal(localStorage.getItem(syncIntervalKey), '3'); assert.equal(app.reads.length, 0);
});

test('Dropbox does not auto-resolve a conflict when the next interval expires', async t => {
  const app = await setup(t, personal('Local'), personal('Remote')); await app.activate();
  const before = app.reads.length;
  assert.equal(app.sync().nextSyncAt, null); await app.advance(hoursToMs(24));
  assert.equal(app.reads.length, before); assert.equal(app.writes.length, 0); assert.equal(app.sync().status, 'conflict');
});

test('an automatic Dropbox sync queued behind another tab rechecks the shared due time under the lock', async t => {
  const app = await setup(t, personal('Original')); await app.activate(); await app.edit(personal('Waiting'));
  let release!: () => void;
  const gate = new Promise<void>(done => { release = done; });
  const otherTab = withSyncLock('dropbox', async () => {
    await gate;
    localStorage.setItem(syncAttemptKey('testConnection'), String(Date.now()));
  });
  await app.env.advance(hoursToMs(1));
  release(); await otherTab; await app.settle();
  assert.equal(app.writes.length, 1); assert.equal(app.sync().nextSyncAt, Date.now() + hoursToMs(1));
});

test('Dropbox ignores corrupt scheduling dates instead of overflowing or repeatedly running timers', async t => {
  const app = await setup(t, personal('Original')); await app.activate();
  localStorage.setItem(syncAttemptKey('testConnection'), '1e300');
  await app.fire('storage', { key: syncAttemptKey('testConnection') });
  assert.equal(app.sync().nextSyncAt, app.sync().lastSyncedAt! + hoursToMs(1));
  await app.advance(1000); assert.equal(app.writes.length, 1);
});
