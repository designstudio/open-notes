import { useEffect, useState } from 'react';
import { type AppData, type Note, type Notebook } from './data';
import { readProfile } from './profile';
import { noteSaveStatus } from './save-feedback';
import { newNoteFieldDefaults } from './note-field-state';
import { ToastStack } from './Feedback';
import { useGoogleDriveSync } from './cloud/use-google-drive-sync';
import { useNoteDrag } from './hooks/use-note-drag';
import { AppSidebar } from './app/AppSidebar';
import { NotesLibrary } from './app/NotesLibrary';
import { NoteEditor } from './app/NoteEditor';
import { NoteToolbar } from './app/NoteToolbar';
import { AppDialogs } from './app/AppDialogs';
import { useNavigation } from './app/use-navigation';
import { selectWorkspace } from './app/workspace-selectors';
import { exportMarkdown, exportPdf } from './app/note-export';
import { useToasts } from './app/use-toasts';
import { useAppearance } from './app/use-appearance';
import { useNotesListPreferences } from './app/use-notes-list-preferences';
import { useSidebar } from './app/use-sidebar';
import { useAppDialogs } from './app/use-app-dialogs';
import { useLocalPersistence } from './app/use-local-persistence';
import { useWorkspaceData } from './app/use-workspace-data';
import './styles.css';
import './feedback.css';
import './motion.css';
import './sidebar.css';
import './buttons.css';
import './folders.css';
import './note-actions.css';
import './themes.css';
import './input-focus.css';
import './component-states.css';

export default function App({ initialData }: { initialData: AppData }) {
  const [data, setData] = useWorkspaceData(initialData);
  const driveSync = useGoogleDriveSync(data, setData);
  const profile = readProfile(data.profile);
  const { toasts, setToast, dismissToast } = useToasts();
  const { savedData, saveFailed } = useLocalPersistence(data, initialData, setToast);
  const appearance = useAppearance();
  const listPreferences = useNotesListPreferences();
  const sidebarState = useSidebar();
  const { collapsed, setCollapsed, sidebar, setSidebar, sidebarResize, setExpandedCollections } = sidebarState;
  const dialogs = useAppDialogs();
  const { setModal, openSearch, openNewCollection, openCollectionSettings } = dialogs;
  const [search, setSearch] = useState('');
  const { view, selected, activeFolder, commitRoute, navigate, openNote, openCollection, toggleCollection } = useNavigation(data, { setSidebar, setExpandedCollections, setSearch });
  const [findOpen, setFindOpen] = useState(false);
  useEffect(() => { setFindOpen(false); }, [selected]);
  const note = data.notes.find(n => n.id === selected);
  const saveStatus = noteSaveStatus(note, savedData.notes.find(n => n.id === selected), saveFailed);
  function update(id: string, patch: Partial<Note>) { setData(d => ({ ...d, notes: d.notes.map(n => n.id === id ? { ...n, ...patch, updated: Date.now() } : n) })); }
  function moveNoteToTrash(id: string) {
    update(id, { deleted: true });
    if (selected === id) navigate('trash');
    setToast('Nota movida para a lixeira', 'success', {
      label: 'Restaurar',
      onClick: () => {
        update(id, { deleted: false });
        setToast('Nota restaurada');
      },
    });
  }
  const noteDrag = useNoteDrag((noteId, collectionId) => {
    const movingNote = data.notes.find(n => n.id === noteId && !n.deleted && !n.archived);
    const collection = data.collections.find(c => c.id === collectionId);
    if (!movingNote || !collection) return;
    if (movingNote.collection === collectionId) {
      setToast(`A nota já está em ${collection.name}`);
      return;
    }
    update(noteId, { collection: collectionId, folder: '' });
    setToast(`Nota movida para ${collection.name}`);
  });
  function deleteCollection(collection: Notebook) {
    setExpandedCollections(current => {
      if (!current.has(collection.id)) return current;
      const next = new Set(current);
      next.delete(collection.id);
      return next;
    });
    setData(d => ({
      ...d,
      collections: d.collections.filter(item => item.id !== collection.id),
      folders: d.folders.filter(folder => folder.collectionId !== collection.id),
      notes: d.notes.map(note => note.collection === collection.id ? { ...note, collection: '', folder: '' } : note),
    }));
    if (view === collection.id) navigate('all', 'replace');
    setToast('Coleção excluída. Suas notas foram preservadas.');
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[aria-label="Criar coleção"]')?.focus());
  }
  function toggleCollectionPin(collection: Notebook) {
    setData(d => ({ ...d, collections: d.collections.map(c => c.id === collection.id ? { ...c, pinned: !c.pinned } : c) }));
    setToast(collection.pinned ? 'Coleção desafixada.' : 'Coleção fixada.');
  }
  function toggleCollectionArchive(collection: Notebook) {
    setData(d => ({ ...d, collections: d.collections.map(c => c.id === collection.id ? { ...c, archived: !c.archived } : c) }));
    if (!collection.archived && (view === collection.id || selected && data.notes.some(n => n.id === selected && n.collection === collection.id))) navigate('archive');
    setToast(collection.archived ? 'Coleção desarquivada.' : 'Coleção arquivada.');
  }
  function createNote() {
    const isCol = data.collections.some(c => c.id === view);
    const targetCol = isCol ? view : '';
    const targetFolder = isCol && activeFolder ? activeFolder : '';
    const n: Note = { id: crypto.randomUUID(), title: '', body: '', collection: targetCol, folder: targetFolder, tags: [], favorite: false, archived: false, deleted: false, updated: Date.now(), icon: 'file', ...newNoteFieldDefaults(data.collections.find(collection => collection.id === targetCol)?.noteDefaults) };
    setData(d => ({ ...d, notes: [n, ...d.notes] }));
    commitRoute({ view: targetCol || 'all', selected: n.id, activeFolder: targetFolder || null });
  }
  function updateWithFeedback(id: string, patch: Partial<Note>) {
    update(id, patch);
    if ('collection' in patch) {
      setToast(patch.collection ? `Nota movida para ${data.collections.find(c => c.id === patch.collection)?.name}` : 'Nota removida da coleção');
    } else if ('folder' in patch) {
      setToast(patch.folder ? `Nota movida para ${data.folders.find(f => f.id === patch.folder)?.name}` : 'Nota movida para a raiz da coleção');
    }
  }
  const navigation = { navigate, openNote, openCollection };
  const collections = { openNewCollection, openCollectionSettings, deleteCollection, toggleCollectionPin, toggleCollectionArchive };
  const workspace = selectWorkspace(data, view);
  function openSidebar() { setSidebar(true); setCollapsed(false); }
  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''} ${sidebarResize.resizing ? 'is-sidebar-resizing' : ''}`} style={sidebarResize.style}>
      {sidebar && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setSidebar(false)} />}
      <AppSidebar
        view={view}
        selected={selected}
        profile={profile}
        state={sidebarState}
        workspace={workspace}
        navigation={navigation}
        collections={collections}
        noteDrag={noteDrag}
        toggleCollection={toggleCollection}
        createNote={createNote}
        openSearch={openSearch}
        openSettings={() => setModal('settings')}
      />
      <main>
        {note && (
          <NoteToolbar
            data={data}
            note={note}
            saveStatus={saveStatus}
            findOpen={findOpen}
            setFindOpen={setFindOpen}
            openCollection={openCollection}
            onOpenSidebar={openSidebar}
            onUpdate={updateWithFeedback}
            onDelete={moveNoteToTrash}
            onNewFolder={dialogs.openNewFolder}
            onExportMarkdown={note => {
              exportMarkdown(note);
              setToast('Nota exportada em Markdown');
            }}
            onExportPdf={note => {
              setToast('Escolha “Salvar como PDF” na janela de impressão');
              exportPdf(note);
            }}
          />
        )}
        {note ? (
          <NoteEditor
            key={note.id}
            note={note}
            findOpen={findOpen}
            onFindOpenChange={setFindOpen}
            onUpdate={patch => {
              update(note.id, patch);
              if (note.deleted && patch.deleted === false) setToast('Nota restaurada');
            }}
            onPermanentDelete={() => {
              setData(d => ({ ...d, notes: d.notes.filter(n => n.id !== note.id) }));
              navigate('trash', 'replace');
              setToast('Nota excluída permanentemente');
            }}
          />
        ) : (
          <NotesLibrary
            listPreferences={listPreferences}
            data={data}
            setData={setData}
            view={view}
            activeFolder={activeFolder}
            search={search}
            setSearch={setSearch}
            workspace={workspace}
            navigation={navigation}
            collections={collections}
            dialogs={dialogs}
            update={updateWithFeedback}
            moveNoteToTrash={moveNoteToTrash}
            createNote={createNote}
            setToast={setToast}
            onOpenSidebar={openSidebar}
          />
        )}
      </main>
      <ToastStack events={toasts} onDismiss={dismissToast} />
      <AppDialogs
        data={data}
        setData={setData}
        view={view}
        dialogs={dialogs}
        appearance={appearance}
        navigation={navigation}
        workspace={workspace}
        driveSync={driveSync}
        setToast={setToast}
      />
    </div>
  );
}
