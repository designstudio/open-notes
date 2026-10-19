import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { initialNotes, type AppData } from '../src/data';
import { loadLocalData, saveLocalData, openLocalDatabase } from '../src/storage/local-data';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null } });
});

const space = (): AppData => ({
  notes: initialNotes.slice(0, 3).map(note => ({ ...structuredClone(note), collection: 'pessoal', folder: 'folder' })),
  collections: [{ id: 'pessoal', name: 'Pessoal', color: 'blue' }],
  folders: [{ id: 'folder', collectionId: 'pessoal', name: 'Pasta' }],
  profile: { name: 'Alex', photo: 'data:image/jpeg;base64,YQ==' },
});

async function seedOldDatabase(data: unknown, backup?: unknown) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('open-notes', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('workspace');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction('workspace', 'readwrite');
    transaction.objectStore('workspace').put(data, 'current');
    if (backup) transaction.objectStore('workspace').put(backup, 'open-notes-drive-recovery-test');
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function inspectDatabase() {
  const database = await openLocalDatabase();
  try {
    return await new Promise<{ notes: AppData['notes']; metadata: Record<string, unknown>; original: unknown; backup: unknown }>((resolve, reject) => {
      const transaction = database.transaction(['notes', 'metadata', 'workspace'], 'readonly');
      const notes = transaction.objectStore('notes').getAll();
      const values = transaction.objectStore('metadata').getAll();
      const keys = transaction.objectStore('metadata').getAllKeys();
      const original = transaction.objectStore('workspace').get('current');
      const backup = transaction.objectStore('workspace').get('open-notes-drive-recovery-test');
      transaction.oncomplete = () => resolve({
        notes: notes.result,
        metadata: Object.fromEntries(keys.result.map((key, index) => [String(key), values.result[index]])),
        original: original.result,
        backup: backup.result,
      });
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
}

async function observeWrites(action: () => Promise<unknown>) {
  const put = IDBObjectStore.prototype.put;
  const remove = IDBObjectStore.prototype.delete;
  const clear = IDBObjectStore.prototype.clear;
  const writes: { store: string; key: unknown; operation: string }[] = [];
  IDBObjectStore.prototype.put = function (value, key) {
    writes.push({ store: this.name, key: key ?? value?.id, operation: 'put' });
    return put.call(this, value, key);
  };
  IDBObjectStore.prototype.delete = function (key) {
    writes.push({ store: this.name, key, operation: 'delete' });
    return remove.call(this, key);
  };
  IDBObjectStore.prototype.clear = function () {
    writes.push({ store: this.name, key: undefined, operation: 'clear' });
    return clear.call(this);
  };
  try { await action(); return writes; }
  finally {
    IDBObjectStore.prototype.put = put;
    IDBObjectStore.prototype.delete = remove;
    IDBObjectStore.prototype.clear = clear;
  }
}

test('v1 migration atomically creates individual notes and retains the original and Drive backups', async () => {
  const data = space();
  const backup = { key: 'open-notes-drive-recovery-test', savedAt: 1, local: data, remote: data };
  await seedOldDatabase(data, backup);
  assert.deepEqual(await loadLocalData(), data);
  const stored = await inspectDatabase();
  assert.equal(stored.notes.length, data.notes.length);
  assert.equal(stored.metadata.schema, 2);
  assert.deepEqual(stored.original, data);
  assert.deepEqual(stored.backup, backup);
  assert.deepEqual(stored.metadata.noteOrder, data.notes.map(note => note.id));
  const changed = { ...data, notes: [{ ...data.notes[0], body: 'Texto depois da migração' }, ...data.notes.slice(1)] };
  await saveLocalData(changed);
  assert.deepEqual(await loadLocalData(), changed);
  assert.deepEqual((await inspectDatabase()).original, data, 'original stays a frozen recovery source');
});

test('editing one note writes only that note, even with a photo and many other documents', async () => {
  const data = space();
  data.notes = Array.from({ length: 100 }, (_, index) => ({ ...data.notes[0], id: `note-${index}`, body: `Documento ${index}` }));
  await saveLocalData(data);
  const edited = { ...data, notes: data.notes.map(note => note.id === 'note-37' ? { ...note, body: 'Somente esta mudou' } : note) };
  const writes = await observeWrites(() => saveLocalData(edited));
  assert.deepEqual(writes, [{ store: 'notes', key: 'note-37', operation: 'put' }]);
  assert.deepEqual(await loadLocalData(), edited);
  assert.deepEqual(await observeWrites(() => saveLocalData(structuredClone(edited))), [], 'equivalent data causes no writes');
});

test('profile, collections, folders and ordering save independently without rewriting notes', async () => {
  let data = space();
  await saveLocalData(data);
  const cases = [
    { key: 'profile', change: () => ({ ...data, profile: { name: 'Novo nome', photo: '' } }) },
    { key: 'collections', change: () => ({ ...data, collections: data.collections.map(collection => ({ ...collection, archived: true })) }) },
    { key: 'folders', change: () => ({ ...data, folders: data.folders.map(folder => ({ ...folder, name: 'Renomeada' })) }) },
    { key: 'noteOrder', change: () => ({ ...data, notes: [...data.notes].reverse() }) },
  ];
  for (const item of cases) {
    data = item.change();
    assert.deepEqual(await observeWrites(() => saveLocalData(data)), [{ store: 'metadata', key: item.key, operation: 'put' }]);
    assert.deepEqual(await loadLocalData(), data);
  }
});

test('new notes, trash, restore and permanent removal affect only the relevant record', async () => {
  let data = space();
  await saveLocalData(data);
  const added = { ...data.notes[0], id: 'new-note', body: 'Nova nota' };
  data = { ...data, notes: [added, ...data.notes] };
  assert.deepEqual(await observeWrites(() => saveLocalData(data)), [
    { store: 'notes', key: 'new-note', operation: 'put' },
    { store: 'metadata', key: 'noteOrder', operation: 'put' },
  ]);
  for (const deleted of [true, false]) {
    data = { ...data, notes: data.notes.map(note => note.id === added.id ? { ...note, deleted } : note) };
    assert.deepEqual(await observeWrites(() => saveLocalData(data)), [{ store: 'notes', key: 'new-note', operation: 'put' }]);
    assert.deepEqual(await loadLocalData(), data);
  }
  data = { ...data, notes: data.notes.filter(note => note.id !== added.id) };
  assert.deepEqual(await observeWrites(() => saveLocalData(data)), [
    { store: 'notes', key: 'new-note', operation: 'delete' },
    { store: 'metadata', key: 'noteOrder', operation: 'put' },
  ]);
  assert.deepEqual(await loadLocalData(), data);
});

test('a failed edit/add/delete batch rolls back notes and metadata, and the next save retries all changes', async () => {
  const data = space();
  await saveLocalData(data);
  const changed = {
    ...data,
    notes: [{ ...data.notes[0], body: 'Edição pendente' }, { ...data.notes[1], id: 'new' }],
    profile: { name: 'Perfil pendente', photo: '' },
  };
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    const result = put.call(this, value, key);
    if (this.name === 'metadata') this.transaction.abort();
    return result;
  };
  try { await assert.rejects(saveLocalData(changed)); }
  finally { IDBObjectStore.prototype.put = put; }
  assert.deepEqual((await inspectDatabase()).notes.sort((a, b) => a.id.localeCompare(b.id)), [...data.notes].sort((a, b) => a.id.localeCompare(b.id)));
  assert.deepEqual((await inspectDatabase()).metadata.profile, data.profile);
  await saveLocalData(changed);
  assert.deepEqual(await loadLocalData(), changed);
});

test('failed schema migrations keep the v1 schema and original data intact for retry', async () => {
  const data = space();
  await seedOldDatabase(data);
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (this.name === 'notes') throw new DOMException('Storage full', 'QuotaExceededError');
    return put.call(this, value, key);
  };
  try { await assert.rejects(loadLocalData(), /Storage full/); }
  finally { IDBObjectStore.prototype.put = put; }
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('open-notes', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    assert.deepEqual([...database.objectStoreNames], ['workspace']);
    const original = await new Promise((resolve, reject) => {
      const request = database.transaction('workspace').objectStore('workspace').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    assert.deepEqual(original, data);
  } finally { database.close(); }
  assert.deepEqual(await loadLocalData(), data);
});

test('invalid or duplicate legacy note IDs abort migration rather than dropping documents', async () => {
  const data = space();
  data.notes[1].id = data.notes[0].id;
  await seedOldDatabase(data);
  await assert.rejects(loadLocalData(), /identificadores inválidos/);
});

test('queued saves capture changed notes immediately and preserve the latest document and photo removal', async () => {
  const data = space();
  await saveLocalData(data);
  const first = { ...data, notes: [{ ...data.notes[0], body: 'Primeira edição' }, ...data.notes.slice(1)] };
  const pending = saveLocalData(first);
  first.notes[0].body = 'Mutação depois de solicitar o salvamento';
  await pending;
  assert.equal((await loadLocalData()).notes[0].body, 'Primeira edição');
  const second = { ...data, notes: [{ ...data.notes[0], body: 'Última edição' }, ...data.notes.slice(1)], profile: { name: 'Alex', photo: '' } };
  await Promise.all([saveLocalData(data), saveLocalData(second)]);
  assert.deepEqual(await loadLocalData(), second);
});

test('editing one note does not overwrite a different note updated by another database client', async () => {
  const data = space();
  await saveLocalData(data);
  const database = await openLocalDatabase();
  const external = { ...data.notes[1], body: 'Alterado por outra aba' };
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('notes', 'readwrite');
      transaction.objectStore('notes').put(external);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
  const local = { ...data.notes[0], body: 'Minha alteração' };
  await saveLocalData({ ...data, notes: [local, ...data.notes.slice(1)] });
  const restored = await loadLocalData();
  assert.deepEqual(restored.notes[0], local);
  assert.deepEqual(restored.notes[1], external);
});

test('an explicitly empty workspace stays empty and never reloads the retained v1 backup', async () => {
  await seedOldDatabase(space());
  await loadLocalData();
  const empty: AppData = { notes: [], collections: [], folders: [] };
  await saveLocalData(empty);
  assert.deepEqual(await loadLocalData(), empty);
  assert.deepEqual((await inspectDatabase()).original, space());
});

test('replacing the whole workspace reconciles notes and metadata atomically as required by Drive imports', async () => {
  const local = space();
  await saveLocalData(local);
  const remote: AppData = {
    notes: [{ ...local.notes[0], id: 'remote-note', body: 'Documento do Drive' }],
    collections: [{ id: 'remote-collection', name: 'Outra coleção', color: 'sage' }],
    folders: [],
  };
  await saveLocalData(remote);
  assert.deepEqual(await loadLocalData(), remote);
  assert.deepEqual((await inspectDatabase()).notes, remote.notes);
});

test('partial or corrupt metadata reports failure instead of falling back to examples or an older source', async () => {
  const database = await openLocalDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('metadata', 'readwrite');
      transaction.objectStore('metadata').put([], 'noteOrder');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
  await assert.rejects(loadLocalData(), /cópias existentes foram preservadas/);
});

test('a recreated database cannot use the cached baseline to skip unchanged notes and metadata', async () => {
  const data = space();
  await saveLocalData(data);
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('open-notes');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  const changed = { ...data, notes: [{ ...data.notes[0], body: 'Ainda na sessão aberta' }, ...data.notes.slice(1)] };
  await saveLocalData(changed);
  assert.deepEqual(await loadLocalData(), changed);
});
