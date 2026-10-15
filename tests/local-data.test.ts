import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { loadLocalData, saveLocalData } from '../src/local-data';
import { initialNotes, type AppData } from '../src/data';
import { recoveryCopies, saveRecoveryCopy } from '../src/cloud/recovery-storage';
import { noteSaveStatus, profileSaveMessage } from '../src/save-feedback';
import { noteFieldPatch, newNoteFieldDefaults } from '../src/note-field-state';

let legacy: string | null;
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  legacy = null;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: () => legacy,
    setItem: () => { throw new DOMException('Storage full', 'QuotaExceededError'); },
    removeItem: () => { throw new Error('The migration must preserve the legacy copy'); },
  } });
});
const space = (): AppData => ({ notes: [{ ...initialNotes[0], title: 'Minha nota' }], collections: [], folders: [] });

test('page options persist per note and disabling fields clears their content across reloads', async () => {
  const original = space();
  const options = { cover: 'data:image/png;base64,YQ==', coverPosition: 30, pageIcon: '💡', subtitle: 'Ideias para amanhã', showCover: true, showPageIcon: true, showSubtitle: true, showOutline: false, pageWidth: 'wide' as const };
  const data: AppData = { ...original, notes: [{ ...original.notes[0], ...options }, { ...original.notes[0], id: 'other' }] };
  await saveLocalData(data);
  const restored = await loadLocalData();
  assert.deepEqual(restored, data);
  assert.equal(restored.notes[1].pageWidth, undefined);
  assert.equal(restored.notes[0].body, original.notes[0].body);
  restored.notes[0] = { ...restored.notes[0], ...noteFieldPatch('cover', false), ...noteFieldPatch('icon', false), ...noteFieldPatch('subtitle', false), showOutline: true, pageWidth: 'narrow' };
  await saveLocalData(restored);
  assert.deepEqual(await loadLocalData(), restored);
  const hidden = (await loadLocalData()).notes[0];
  assert.equal(hidden.cover, undefined);
  assert.equal(hidden.coverGradient, undefined);
  assert.equal(hidden.coverPosition, undefined);
  assert.equal(hidden.pageIcon, undefined);
  assert.equal(hidden.subtitle, undefined);
  restored.notes[0] = { ...hidden, ...noteFieldPatch('cover', true), ...noteFieldPatch('icon', true), ...noteFieldPatch('subtitle', true) };
  await saveLocalData(restored);
  const visible = (await loadLocalData()).notes[0];
  assert.equal(visible.cover, undefined);
  assert.equal(visible.coverPosition, undefined);
  assert.equal(visible.coverGradient, 'coast');
  assert.equal(visible.pageIcon, '📝');
  assert.equal(visible.subtitle, '');
});

test('persists collection status and new-note defaults without changing notes or folders', async () => {
  const data: AppData = { ...space(), collections: [{ id: 'pessoal', name: 'Pessoal', color: 'blue', pinned: true, archived: true, noteDefaults: { showCover: true, showPageIcon: true, showSubtitle: true, showOutline: false, pageWidth: 'wide' } }], folders: [{ id: 'folder', name: 'Pasta', collectionId: 'pessoal' }] };
  await saveLocalData(data);
  assert.deepEqual(await loadLocalData(), data);
  const restored = { ...data, collections: data.collections.map(c => ({ ...c, archived: false })) };
  await saveLocalData(restored);
  assert.deepEqual(await loadLocalData(), restored);
});

test('new notes receive their collection defaults with fresh fields and independent options', () => {
  assert.deepEqual(newNoteFieldDefaults(), {});
  const defaults = { showCover: true, showPageIcon: true, showSubtitle: true, showOutline: false, pageWidth: 'wide' as const };
  const first = { ...space().notes[0], ...newNoteFieldDefaults(defaults) };
  const second = { ...space().notes[0], ...newNoteFieldDefaults(defaults) };
  assert.equal(first.coverGradient, 'coast');
  assert.equal(first.pageIcon, '📝');
  assert.equal(first.subtitle, '');
  assert.equal(first.showOutline, false);
  assert.equal(first.pageWidth, 'wide');
  Object.assign(first, noteFieldPatch('icon', false));
  assert.equal(second.pageIcon, '📝');
  assert.equal(defaults.showPageIcon, true);
  assert.equal(newNoteFieldDefaults({}).showOutline, true);
  assert.equal(newNoteFieldDefaults({}).pageWidth, 'narrow');
});

test('migrates notes and profile without modifying the original localStorage copy', async () => {
  const data = { ...space(), profile: { name: 'Alex', photo: '' } };
  legacy = JSON.stringify(data);
  const original = legacy;
  assert.deepEqual(await loadLocalData(), data);
  assert.equal(legacy, original);
  legacy = JSON.stringify(space());
  assert.deepEqual(await loadLocalData(), data, 'uses IndexedDB after migration');
});

test('saves and reloads photos even when localStorage is full', async () => {
  const data = { ...space(), profile: { name: 'Alex', photo: `data:image/jpeg;base64,${'a'.repeat(100000)}` } };
  await saveLocalData(data);
  assert.deepEqual(await loadLocalData(), data);
});

test('overlapping saves persist the latest snapshot, including photo removal', async () => {
  const data = space();
  await Promise.all([
    saveLocalData({ ...data, profile: { name: 'Antes', photo: 'data:image/jpeg;base64,YQ==' } }),
    saveLocalData({ ...data, profile: { name: 'Depois', photo: '' } }),
  ]);
  assert.deepEqual((await loadLocalData()).profile, { name: 'Depois', photo: '' });
});

test('unreadable legacy data is preserved and never replaced by examples', async () => {
  legacy = '{broken';
  await assert.rejects(loadLocalData());
  assert.equal(legacy, '{broken');
  legacy = JSON.stringify(space());
  assert.deepEqual(await loadLocalData(), space());
});

test('migration failure preserves the original workspace and reports failure', async () => {
  legacy = JSON.stringify(space());
  const original = legacy;
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
  await assert.rejects(loadLocalData());
  assert.equal(legacy, original);
});

test('recovery export includes old backups and IndexedDB copies without touching the workspace', async () => {
  const data = space();
  await saveLocalData(data);
  const key = 'open-notes-drive-recovery-old';
  const value = JSON.stringify({ savedAt: 1, local: data });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    [key]: value,
    'open-notes-drive-recovery-broken': '{bad',
    getItem: (item: string) => item === key ? value : '{bad',
  } });
  await saveRecoveryCopy(data, data, 'open-notes-drive-last-upload-recovery');
  const copies = await recoveryCopies();
  assert.equal(copies.length, 2);
  assert.deepEqual(copies.find(copy => copy.key === key)!.local, data);
  assert.deepEqual(copies.find(copy => copy.key === 'open-notes-drive-last-upload-recovery')!.remote, data);
  assert.deepEqual(await loadLocalData(), data);
});

test('profile-only changes or save failures do not affect the saved note status', () => {
  const note = space().notes[0];
  assert.equal(noteSaveStatus(note, structuredClone(note), false), 'saved');
  assert.equal(noteSaveStatus(note, structuredClone(note), true), 'saved');
  assert.equal(noteSaveStatus(undefined, undefined, true), 'saved');
});

test('note status reports pending and failed edits until that note is persisted', () => {
  const saved = space().notes[0];
  const edited = { ...saved, body: 'Texto novo', updated: saved.updated + 1 };
  assert.equal(noteSaveStatus(edited, saved, false), 'saving');
  assert.equal(noteSaveStatus(edited, saved, true), 'error');
  assert.equal(noteSaveStatus(edited, structuredClone(edited), true), 'saved');
});

test('profile notifications identify photo and name changes and skip unchanged saves', () => {
  const saved = { name: 'Alex', photo: '' };
  assert.equal(profileSaveMessage({ ...saved }, saved), null);
  assert.equal(profileSaveMessage({ ...saved, name: 'Alex Silva' }, saved), 'Nome atualizado');
  assert.equal(profileSaveMessage({ ...saved, photo: 'data:image/jpeg;base64,YQ==' }, saved), 'Foto atualizada');
  assert.equal(profileSaveMessage({ name: 'Novo', photo: 'data:image/jpeg;base64,YQ==' }, saved), 'Perfil atualizado');
});
