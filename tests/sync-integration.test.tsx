import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act } from 'react-test-renderer';
import { IDBObjectStore } from 'fake-indexeddb';
import { loadLocalData } from '../src/local-data';
import { recoveryCopies } from '../src/cloud/recovery-storage';
import { eventually, personalSpace, setupApp } from './helpers/app-harness';

function otherDevice() {
  const data = personalSpace();
  data.notes[0] = { ...data.notes[0], id: 'drive-note', title: 'Nota do outro dispositivo', body: 'Versão do Drive', document: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Versão do Drive' }] }] } };
  data.profile = { name: 'Perfil do Drive', photo: 'data:image/jpeg;base64,YQ==' };
  return data;
}

test('App creates the first personal Drive copy with full notes and metadata through the real multipart API client', async t => {
  const original = personalSpace();
  const app = await setupApp(t, original);
  await app.connect();
  assert.equal(app.sync().status, 'synced');
  assert.equal(app.environment.uploads.length, 1);
  assert.ok(app.environment.requests.some(request => request.method === 'POST'));
  assert.deepEqual(app.environment.remote(), original);
  assert.deepEqual(await loadLocalData(), original);
});

test('App debounces rapid edits, sends the latest state once and retains the previous cloud copy for recovery', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  assert.equal(app.environment.uploads.length, 0);
  await app.edit({ title: 'Primeira edição' });
  await app.environment.advance(800);
  await app.edit({ body: 'Último texto', tags: ['teste'] });
  await app.environment.advance(1199);
  assert.equal(app.environment.uploads.length, 0);
  await app.environment.advance(1);
  await eventually(() => app.environment.uploads.length === 1 && app.sync().status === 'synced', 'latest edit should sync after the debounce');
  assert.deepEqual(app.environment.remote(), app.data());
  assert.deepEqual(await loadLocalData(), app.data());
  const backup = (await recoveryCopies()).find(copy => copy.key === 'open-notes-drive-last-upload-recovery')!;
  assert.deepEqual(backup.remote, initial);
  assert.deepEqual(backup.local, app.data());
});

test('App synchronizes note creation, trash, restoration and permanent deletion with IndexedDB and Drive', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { remote: initial });
  await app.connect();
  const note = await app.create();
  await app.edit({ title: 'Nova nota sincronizada', body: 'Conteúdo para sincronizar' });
  async function flush() {
    const count = app.environment.uploads.length;
    await app.environment.advance(1200);
    await eventually(() => app.environment.uploads.length > count && app.sync().status === 'synced', 'the mutation should reach Drive');
    assert.deepEqual(app.environment.remote(), await loadLocalData());
  }
  await flush();
  await app.trash(note.id);
  await flush();
  assert.equal(app.environment.remote()!.notes.find(item => item.id === note.id)!.deleted, true);
  await app.openNote(note.id);
  await app.edit({ deleted: false });
  await flush();
  assert.equal(app.environment.remote()!.notes.find(item => item.id === note.id)!.deleted, false);
  await app.trash(note.id);
  await app.openNote(note.id);
  await act(async () => app.editor().onPermanentDelete());
  await app.settle();
  await flush();
  assert.equal(app.environment.remote()!.notes.some(item => item.id === note.id), false);
  assert.deepEqual(app.environment.remote()!.notes, initial.notes);
});

for (const choice of ['local', 'remote'] as const) {
  test(`conflict choice ${choice} persists the selected space and preserves both complete versions`, async t => {
    const local = personalSpace(), remote = otherDevice();
    const app = await setupApp(t, local, { remote });
    await app.connect();
    assert.equal(app.sync().status, 'conflict');
    assert.deepEqual(await loadLocalData(), local);
    assert.deepEqual(app.environment.remote(), remote);
    assert.equal(app.environment.uploads.length, 0);
    await app.choose(choice);
    const expected = choice === 'local' ? local : remote;
    assert.equal(app.sync().status, 'synced');
    assert.deepEqual(app.data(), expected);
    assert.deepEqual(await loadLocalData(), expected);
    assert.deepEqual(app.environment.remote(), expected);
    const backup = (await recoveryCopies()).find(copy => copy.key.startsWith('open-notes-drive-recovery-'))!;
    assert.deepEqual(backup.local, local);
    assert.deepEqual(backup.remote, remote);
    assert.deepEqual(JSON.parse(JSON.stringify(backup)).remote.notes[0].document, remote.notes[0].document);
    const requestCount = app.environment.requests.length;
    await app.reload();
    assert.deepEqual(app.data(), expected);
    assert.equal(app.environment.requests.length, requestCount, 'reload does not silently authorize another Drive session');
  });

  test(`conflict choice ${choice} requires renewed review if another device changes Drive`, async t => {
    const local = personalSpace(), remote = otherDevice();
    const app = await setupApp(t, local, { remote });
    await app.connect();
    const newer = { ...remote, notes: [{ ...remote.notes[0], body: 'Outra mudança do outro dispositivo' }] };
    app.environment.changeRemote(newer);
    await app.choose(choice);
    assert.equal(app.sync().status, 'conflict');
    assert.match(app.sync().error!, /mudou/);
    assert.deepEqual(await loadLocalData(), local);
    assert.deepEqual(app.environment.remote(), newer);
    assert.equal(app.environment.uploads.length, 0);
    await app.choose(choice);
    assert.equal(app.sync().status, 'synced');
    assert.deepEqual(await loadLocalData(), choice === 'local' ? local : newer);
  });

  test(`backup failure blocks conflict choice ${choice} while local editing remains available`, async t => {
    const local = personalSpace(), remote = otherDevice();
    const app = await setupApp(t, local, { path: '/n/personal-note', remote });
    await app.connect();
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (this.name === 'workspace') throw new DOMException('Backup storage full', 'QuotaExceededError');
      return put.call(this, value, key);
    };
    try { await app.choose(choice); }
    finally { IDBObjectStore.prototype.put = put; }
    assert.equal(app.sync().status, 'error');
    assert.match(app.sync().error!, /cópia de segurança/);
    assert.deepEqual(await loadLocalData(), local);
    assert.deepEqual(app.environment.remote(), remote);
    assert.equal(app.environment.uploads.length, 0);
    await app.edit({ body: 'Continuo escrevendo depois da falha' });
    assert.equal((await loadLocalData()).notes[0].body, 'Continuo escrevendo depois da falha');
    assert.equal(app.toolbar().saveStatus, 'saved');
  });
}

test('edits made while the conflict dialog is pending are included in the recovery copy before choosing Drive', async t => {
  const app = await setupApp(t, personalSpace(), { path: '/n/personal-note', remote: otherDevice() });
  await app.connect();
  await app.edit({ body: 'Escrito depois de abrir o conflito' });
  const beforeChoice = structuredClone(app.data());
  await app.choose('remote');
  const backup = (await recoveryCopies()).find(copy => copy.key.startsWith('open-notes-drive-recovery-'))!;
  assert.deepEqual(backup.local, beforeChoice);
  assert.deepEqual(await loadLocalData(), otherDevice());
});

test('creating a local note during an initial Drive read pauses for conflict instead of replacing that note', async t => {
  const empty = { notes: [], collections: [], folders: [] };
  const app = await setupApp(t, empty, { remote: otherDevice() });
  const gate = app.environment.pauseNext('read');
  let connecting!: Promise<void>;
  await act(async () => { connecting = app.sync().connect(); await gate.started; });
  try {
    const note = await app.create();
    await app.edit({ title: 'Escrita durante a conexão', body: 'Este texto não pode desaparecer' });
    await act(async () => { gate.release(); await connecting; });
    await app.settle();
    assert.equal(app.sync().status, 'conflict');
    assert.equal((await loadLocalData()).notes[0].id, note.id);
    assert.equal((await loadLocalData()).notes[0].body, 'Este texto não pode desaparecer');
    assert.equal(app.environment.uploads.length, 0);
  } finally { gate.release(); }
});

test('edits made during the pre-upload Drive read are included in that upload', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Primeira versão' });
  const gate = app.environment.pauseNext('read');
  let uploading!: Promise<void>;
  await act(async () => { uploading = app.sync().syncNow(); await gate.started; });
  try {
    await app.edit({ body: 'Última versão durante a leitura' });
    const expected = structuredClone(app.data());
    await act(async () => { gate.release(); await uploading; });
    assert.deepEqual(app.environment.uploads[0].data, expected);
    assert.deepEqual(await loadLocalData(), expected);
  } finally { gate.release(); }
});

test('edits made during an in-flight upload are sent automatically even if their debounce expires before it completes', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Versão A já em envio' });
  const gate = app.environment.pauseNext('write');
  let uploading!: Promise<void>;
  await act(async () => { uploading = app.sync().syncNow(); await gate.started; });
  try {
    await app.edit({ body: 'Versão B escrita durante o envio' });
    await app.environment.advance(1200);
    await act(async () => { gate.release(); await uploading; });
    assert.equal(app.environment.uploads.length, 1);
    assert.equal(app.environment.uploads[0].data.notes[0].body, 'Versão A já em envio');
    await app.environment.advance(1200);
    await eventually(() => app.environment.uploads.length === 2, 'the edit whose timer fired during upload must not be left unsynced');
    assert.equal(app.environment.remote()!.notes[0].body, 'Versão B escrita durante o envio');
    assert.deepEqual(app.environment.remote(), await loadLocalData());
  } finally { gate.release(); }
});

test('disconnecting during a pre-upload read cancels the write and later local edits remain local', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Alteração local' });
  const gate = app.environment.pauseNext('read');
  let uploading!: Promise<void>;
  await act(async () => { uploading = app.sync().syncNow(); await gate.started; });
  try {
    await app.disconnect();
    await act(async () => { gate.release(); await uploading; });
    await app.edit({ title: 'Continuo sem conexão ao Drive' });
    await app.environment.advance(1200);
    assert.equal(app.sync().status, 'disconnected');
    assert.equal(app.sync().connected, false);
    assert.equal(app.environment.uploads.length, 0);
    assert.deepEqual(app.environment.remote(), initial);
    assert.deepEqual(await loadLocalData(), app.data());
  } finally { gate.release(); }
});

test('disconnecting during a write keeps the session disconnected and never schedules another upload', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Envio já iniciado' });
  const gate = app.environment.pauseNext('write');
  let uploading!: Promise<void>;
  await act(async () => { uploading = app.sync().syncNow(); await gate.started; });
  try {
    await app.edit({ body: 'Esta edição continua local' });
    await app.environment.advance(1200);
    await app.disconnect();
    await act(async () => { gate.release(); await uploading; });
    await app.environment.advance(2400);
    assert.equal(app.sync().status, 'disconnected');
    assert.equal(app.sync().connected, false);
    assert.equal(app.environment.uploads.length, 1, 'the already-issued HTTP request may finish, but no new request is allowed');
    assert.equal(app.environment.remote()!.notes[0].body, 'Envio já iniciado');
    assert.equal((await loadLocalData()).notes[0].body, 'Esta edição continua local');
  } finally { gate.release(); }
});

test('a failed in-flight write does not start a retry loop and an explicit retry sends the pending edit', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Envio que vai falhar' });
  const gate = app.environment.pauseNext('write');
  let uploading!: Promise<void>;
  await act(async () => { uploading = app.sync().syncNow(); await gate.started; });
  try {
    await app.edit({ body: 'Edição pendente durante a falha' });
    await app.environment.advance(1200);
    app.environment.failNext('write');
    await act(async () => { gate.release(); await uploading; });
    const count = app.environment.requests.length;
    await app.environment.advance(5000);
    assert.equal(app.sync().status, 'error');
    assert.equal(app.environment.requests.length, count);
    assert.deepEqual(app.environment.remote(), initial);
    assert.equal((await loadLocalData()).notes[0].body, 'Edição pendente durante a falha');
    await app.syncNow();
    assert.equal(app.sync().status, 'synced');
    assert.deepEqual(app.environment.remote(), await loadLocalData());
  } finally { gate.release(); }
});

for (const remoteChanges of [false, true]) {
  test(`offline edits persist locally and reconnect ${remoteChanges ? 'pauses when Drive changed' : 'uploads the latest state'}`, async t => {
    const initial = personalSpace();
    const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
    await app.connect();
    await app.environment.network(false);
    await app.edit({ body: 'Escrito sem internet' });
    await app.environment.advance(1200);
    await eventually(() => app.sync().status === 'offline', 'offline failure should remain explicit');
    assert.equal((await loadLocalData()).notes[0].body, 'Escrito sem internet');
    assert.equal(app.environment.uploads.length, 0);
    if (remoteChanges) app.environment.changeRemote(otherDevice());
    await app.environment.network(true);
    await eventually(() => app.sync().status === (remoteChanges ? 'conflict' : 'synced'), 'online event should retry or pause for review');
    if (remoteChanges) {
      assert.equal(app.environment.uploads.length, 0);
      assert.deepEqual(app.environment.remote(), otherDevice());
    } else assert.deepEqual(app.environment.remote(), await loadLocalData());
  });
}

test('HTTP upload failure preserves local and cloud copies and an explicit retry succeeds', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Texto salvo apenas localmente por enquanto' });
  app.environment.failNext('write');
  await app.syncNow();
  assert.equal(app.sync().status, 'error');
  assert.deepEqual(app.environment.remote(), initial);
  assert.equal((await loadLocalData()).notes[0].body, 'Texto salvo apenas localmente por enquanto');
  await app.syncNow();
  assert.equal(app.sync().status, 'synced');
  assert.equal(app.sync().error, null);
  assert.equal(app.environment.uploads.length, 1);
  assert.deepEqual(app.environment.remote(), await loadLocalData());
});

test('expired authorization stops automatic uploads while local edits continue to persist', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { path: '/n/personal-note', remote: initial });
  await app.connect();
  await app.edit({ body: 'Edição antes de expirar a autorização' });
  app.environment.failNext('read', 401);
  await app.syncNow();
  assert.equal(app.sync().status, 'error');
  assert.equal(app.sync().connected, false);
  assert.match(app.sync().error!, /expirou/);
  const count = app.environment.requests.length;
  await app.edit({ body: 'Edição local depois da expiração' });
  await app.environment.advance(1200);
  assert.equal(app.environment.requests.length, count);
  assert.equal((await loadLocalData()).notes[0].body, 'Edição local depois da expiração');
  assert.deepEqual(app.environment.remote(), initial);
});

test('cancelled Google authorization makes no Drive requests and preserves the persisted workspace', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { remote: otherDevice() });
  app.environment.denyAuth();
  await app.connect();
  assert.equal(app.sync().status, 'error');
  assert.equal(app.sync().connected, false);
  assert.equal(app.environment.requests.length, 0);
  assert.deepEqual(await loadLocalData(), initial);
});

test('an unsupported Drive snapshot is rejected without replacing local notes or uploading over it', async t => {
  const initial = personalSpace();
  const app = await setupApp(t, initial, { remote: otherDevice() });
  app.environment.corruptRemote({ schemaVersion: 999, updatedAt: 1, data: otherDevice() });
  await app.connect();
  assert.equal(app.sync().status, 'error');
  assert.match(app.sync().error!, /formato reconhecido/);
  assert.deepEqual(await loadLocalData(), initial);
  assert.equal(app.environment.uploads.length, 0);
});
