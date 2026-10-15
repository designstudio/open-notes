import assert from 'node:assert/strict';
import type { TestContext } from 'node:test';
import { StrictMode, type ComponentProps } from 'react';
import { act, create } from 'react-test-renderer';
import App from '../../src/App';
import { initialNotes, type AppData, type Note } from '../../src/data';
import { AppSidebar } from '../../src/app/AppSidebar';
import { NoteEditor } from '../../src/app/NoteEditor';
import { NoteToolbar } from '../../src/app/NoteToolbar';
import { NotesLibrary } from '../../src/app/NotesLibrary';
import { AppDialogs } from '../../src/app/AppDialogs';
import { ToastStack } from '../../src/Feedback';
import { loadLocalData, saveLocalData } from '../../src/local-data';
import { appEnvironment } from './app-environment';

export const personalSpace = (): AppData => ({
  notes: [{ ...structuredClone(initialNotes[0]), id: 'personal-note', title: 'Nota pessoal', body: 'Texto original', updated: 1000, collection: 'collection', folder: 'folder' }],
  collections: [{ id: 'collection', name: 'Escrita', color: 'sage', noteDefaults: { showSubtitle: true, showPageIcon: true, showOutline: false, pageWidth: 'wide' } }],
  folders: [{ id: 'folder', name: 'Capítulos', collectionId: 'collection' }],
  profile: { name: 'Pessoa de teste', photo: '' },
});

export async function eventually(condition: () => boolean, description: string) {
  for (let turn = 0; turn < 200; turn++) {
    if (condition()) return;
    await act(async () => { await new Promise<void>(resolve => setImmediate(resolve)); });
  }
  assert.ok(condition(), description);
}

export async function setupApp(t: TestContext, initial: AppData = personalSpace(), options: { path?: string; remote?: AppData | null } = {}) {
  const environment = appEnvironment(options.path || '/library', options.remote ?? null);
  let renderer: ReturnType<typeof create> | undefined;
  t.after(async () => {
    try { if (renderer) await act(async () => renderer!.unmount()); }
    finally { environment.restore(); }
  });
  await saveLocalData(initial);
  async function mount(data: AppData) {
    await act(async () => { renderer = create(<StrictMode><App initialData={data} /></StrictMode>); });
    await settle();
  }
  async function settle() { await act(async () => { await loadLocalData(); }); }
  function props<T extends (props: any) => any>(component: T): ComponentProps<T> {
    return renderer!.root.findByType(component).props;
  }
  await mount(initial);
  const app = {
    environment, settle,
    data: () => props(AppDialogs).data,
    sync: () => props(AppDialogs).driveSync,
    editor: () => props(NoteEditor),
    toolbar: () => props(NoteToolbar),
    library: () => props(NotesLibrary),
    toasts: () => props(ToastStack).events,
    async reload(path?: string) {
      await settle();
      await act(async () => renderer!.unmount());
      renderer = undefined;
      if (path) environment.locate(path);
      await mount(await loadLocalData());
    },
    async create() {
      await act(async () => props(AppSidebar).createNote());
      await settle();
      return props(NoteEditor).note;
    },
    async edit(patch: Partial<Note>) {
      await act(async () => props(NoteEditor).onUpdate(patch));
      await settle();
    },
    async openNote(id: string) {
      await act(async () => props(AppSidebar).navigation.openNote(id));
    },
    async trash(id: string) {
      await act(async () => props(NoteToolbar).onDelete(id));
      await settle();
    },
    async connect() {
      await act(async () => props(AppDialogs).driveSync.connect());
      await settle();
    },
    async choose(choice: 'local' | 'remote') {
      await act(async () => props(AppDialogs).driveSync.resolveConflict(choice));
      await settle();
    },
    async syncNow() {
      await act(async () => props(AppDialogs).driveSync.syncNow());
      await settle();
    },
    async disconnect() { await act(async () => props(AppDialogs).driveSync.disconnect()); },
  };
  return app;
}
