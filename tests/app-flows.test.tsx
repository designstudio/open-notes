import assert from 'node:assert/strict';
import { test } from 'node:test';
import { useState } from 'react';
import { act, create } from 'react-test-renderer';
import { IDBObjectStore } from 'fake-indexeddb';
import { loadLocalData, openLocalDatabase } from '../src/local-data';
import { recoveryCopies, saveRecoveryCopy } from '../src/cloud/recovery-storage';
import { DeleteNoteDialog } from '../src/DeleteNoteDialog';
import { AnimatedDialog } from '../src/AnimatedDialog';
import { setupApp, personalSpace } from './helpers/app-harness';

test('App creates distinct notes, applies collection defaults and restores their location after reload', async t => {
  const original = personalSpace();
  const app = await setupApp(t, original, { path: '/c/collection?folder=folder' });
  const first = await app.create();
  assert.ok(first.id);
  assert.equal(first.collection, 'collection');
  assert.equal(first.folder, 'folder');
  assert.equal(first.title, '');
  assert.equal(first.body, '');
  assert.equal(first.subtitle, '');
  assert.equal(first.pageIcon, '📝');
  assert.equal(first.showOutline, false);
  assert.equal(first.pageWidth, 'wide');
  assert.equal(app.toolbar().saveStatus, 'saved');
  await app.reload();
  assert.deepEqual(app.editor().note, first);
  const second = await app.create();
  assert.notEqual(second.id, first.id);
  assert.equal((await loadLocalData()).notes.length, 3);
  assert.deepEqual(app.data().notes.find(note => note.id === original.notes[0].id), original.notes[0]);
});

test('App edits title, rich content and optional fields without changing another note; everything survives reload', async t => {
  const original = personalSpace();
  const app = await setupApp(t, original);
  const created = await app.create();
  const document = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Texto com acentuação e 💡', marks: [{ type: 'bold' }] }] }] };
  await app.edit({ title: 'Capítulo novo', body: '**Texto com acentuação e 💡**', document });
  await app.edit({ subtitle: 'Subtítulo', pageIcon: '📚', favorite: true, tags: ['escrita'], cover: 'data:image/png;base64,YQ==', showCover: true });
  const expected = structuredClone(app.editor().note);
  await app.reload();
  assert.equal(app.editor().note.id, created.id);
  assert.deepEqual(app.editor().note, expected);
  assert.deepEqual(app.data().notes.find(note => note.id === original.notes[0].id), original.notes[0]);
  assert.equal(app.toolbar().saveStatus, 'saved');
});

test('App moves a note to trash and restores the complete document from trash across reloads', async t => {
  const original = personalSpace();
  const app = await setupApp(t, original, { path: '/n/personal-note' });
  await app.trash('personal-note');
  assert.equal(app.library().view, 'trash');
  await app.reload();
  assert.equal(app.library().view, 'trash');
  const deleted = (await loadLocalData()).notes[0];
  assert.equal(deleted.deleted, true);
  assert.equal(deleted.body, original.notes[0].body);
  await app.openNote(deleted.id);
  await app.edit({ deleted: false });
  assert.equal(app.toasts().at(-1)?.message, 'Nota restaurada');
  await app.reload();
  const restored = app.editor().note;
  assert.deepEqual({ ...restored, updated: original.notes[0].updated }, original.notes[0]);
});

test('App undo notification restores a trashed note and persists the result', async t => {
  const app = await setupApp(t, personalSpace(), { path: '/n/personal-note' });
  await app.trash('personal-note');
  const action = app.toasts().at(-1)?.action;
  assert.equal(action?.label, 'Restaurar');
  await act(async () => action!.onClick());
  await app.settle();
  await app.reload('/n/personal-note');
  assert.equal(app.editor().note.deleted, false);
  assert.equal((await loadLocalData()).notes[0].deleted, false);
});

test('App permanently removes a trashed note from IndexedDB without affecting other notes or resurrecting it on reload', async t => {
  const original = personalSpace();
  const app = await setupApp(t, original);
  const created = await app.create();
  await app.edit({ title: 'Descartável', body: 'Texto para excluir' });
  await app.trash(created.id);
  await app.openNote(created.id);
  await act(async () => app.editor().onPermanentDelete());
  await app.settle();
  assert.equal(app.library().view, 'trash');
  assert.deepEqual((await loadLocalData()).notes, original.notes);
  const database = await openLocalDatabase();
  try {
    const value = await new Promise((resolve, reject) => {
      const request = database.transaction('notes').objectStore('notes').get(created.id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    assert.equal(value, undefined);
  } finally { database.close(); }
  await app.reload(`/n/${created.id}`);
  assert.equal(app.library().view, 'not-found');
  assert.deepEqual(app.data().notes, original.notes);
});

test('App keeps unsaved edits in memory, reports the error and persists all changes on the next successful edit', async t => {
  const original = personalSpace();
  const app = await setupApp(t, original, { path: '/n/personal-note' });
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (this.name === 'notes') throw new DOMException('Simulated quota failure', 'QuotaExceededError');
    return put.call(this, value, key);
  };
  try { await app.edit({ body: 'Edição ainda não salva' }); }
  finally { IDBObjectStore.prototype.put = put; }
  assert.equal(app.editor().note.body, 'Edição ainda não salva');
  assert.equal(app.toolbar().saveStatus, 'error');
  assert.equal(app.toasts().at(-1)?.kind, 'error');
  assert.deepEqual(await loadLocalData(), original);
  await app.edit({ title: 'Tentativa seguinte' });
  assert.equal(app.toolbar().saveStatus, 'saved');
  await app.reload();
  assert.equal(app.editor().note.body, 'Edição ainda não salva');
  assert.equal(app.editor().note.title, 'Tentativa seguinte');
});

test('recovery copies retain complete rich documents and can be exported after App permanently removes a note', async t => {
  const app = await setupApp(t);
  const created = await app.create();
  await app.edit({ body: 'Texto preservado no backup', document: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Texto preservado no backup' }] }] } });
  const saved = structuredClone(app.data());
  await saveRecoveryCopy(saved, undefined, 'open-notes-drive-recovery-note-flow');
  await app.trash(created.id);
  await app.openNote(created.id);
  await act(async () => app.editor().onPermanentDelete());
  await app.settle();
  await app.reload();
  const backup = (await recoveryCopies()).find(copy => copy.key === 'open-notes-drive-recovery-note-flow')!;
  const exported = JSON.parse(JSON.stringify(backup));
  assert.deepEqual(exported.local, saved);
  assert.deepEqual(exported.local.notes.find((note: { id: string }) => note.id === created.id).document, saved.notes[0].document);
  assert.equal((await loadLocalData()).notes.some(note => note.id === created.id), false, 'reading/exporting a backup never changes current notes');
});

test('permanent-delete confirmation cancels safely and deletes only once after an explicit confirmation finishes closing', async t => {
  const app = await setupApp(t);
  let deleted = 0, reopen: () => void;
  function Harness() {
    const [open, setOpen] = useState(true);
    reopen = () => setOpen(true);
    return <DeleteNoteDialog open={open} title="Nota de teste" onDismiss={() => setOpen(false)} onDelete={() => deleted++} />;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />); });
  try {
    const button = (text: string) => renderer!.root.findAllByType('button').find(node => node.props.children === text)!;
    await act(async () => button('Cancelar').props.onClick());
    await act(async () => renderer!.root.findByType(AnimatedDialog).props.onAfterClose());
    assert.equal(deleted, 0);
    await act(async () => reopen());
    const confirm = button('Excluir permanentemente').props.onClick;
    await act(async () => { confirm(); confirm(); });
    assert.equal(deleted, 0, 'confirmation waits for the closing callback');
    await act(async () => {
      renderer!.root.findByType(AnimatedDialog).props.onAfterClose();
      renderer!.root.findByType(AnimatedDialog).props.onAfterClose();
    });
    assert.equal(deleted, 1);
  } finally { await act(async () => renderer!.unmount()); }
  assert.equal(app.data().notes.length, 1);
});
