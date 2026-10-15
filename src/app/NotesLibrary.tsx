import { NotesList } from './NotesList';
import { type Dispatch, type SetStateAction } from 'react';
import { type AppData } from '../data';
import { BookOpen, Folder, Menu } from '../icons';
import { IconButton } from '../IconButton';
import { CollectionActions } from '../CollectionActions';
import { FolderActions } from '../FolderActions';
import { DocumentStack } from '../DocumentStack';
import { PageEmptyState } from '../PageEmptyState';
import { LibraryTabs } from '../LibraryTabs';
import { CreateMenu } from '../CreateMenu';
import type { NotesListPreferences } from './use-notes-list-preferences';
import type { Navigation, CollectionCommands, SetAppData, UpdateNote } from './types';
import type { Workspace } from './workspace-selectors';
import type { AppDialogsState } from './use-app-dialogs';
import type { Notify } from './use-toasts';

type NotesLibraryProps = {
  listPreferences: NotesListPreferences;
  data: AppData;
  setData: SetAppData;
  view: string;
  activeFolder: string | null;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  workspace: Workspace;
  navigation: Navigation;
  collections: CollectionCommands;
  dialogs: Pick<AppDialogsState, 'openNewFolder' | 'openRenameFolder'>;
  update: UpdateNote;
  moveNoteToTrash: (id: string) => void;
  createNote: () => void;
  setToast: Notify;
  onOpenSidebar: () => void;
};

export function NotesLibrary({ listPreferences, data, setData, view, activeFolder, search, setSearch, workspace, navigation, collections, dialogs, update, moveNoteToTrash, createNote, setToast, onOpenSidebar }: NotesLibraryProps) {
  const { active, archivedCollectionIds, visibleCollections, listedCollections } = workspace;
  const { navigate, openNote, openCollection } = navigation;
  const { openNewCollection, openCollectionSettings, deleteCollection, toggleCollectionPin, toggleCollectionArchive } = collections;
  const { openNewFolder, openRenameFolder } = dialogs;
  const isLibraryView = view === 'all' || view === 'favorites';
  const { sort } = listPreferences;
  const filtered = data.notes.filter(n => {
    const statusMatch = view === 'trash' ? n.deleted : view === 'archive' ? n.archived && !n.deleted : !n.deleted && !n.archived;
    if (!statusMatch) return false;
    if (!['trash', 'archive', n.collection].includes(view) && archivedCollectionIds.has(n.collection)) return false;
    let viewMatch = false;
    if (['all', 'trash', 'archive'].includes(view)) {
      viewMatch = true;
    } else if (view === 'favorites') {
      viewMatch = n.favorite;
    } else if (view.startsWith('tag:')) {
      viewMatch = n.tags.includes(view.slice(4));
    } else {
      if (n.collection === view) {
        if (!activeFolder) {
          viewMatch = true;
        } else {
          viewMatch = n.folder === activeFolder;
        }
      }
    }
    if (!viewMatch) return false;
    if (!search) return true;
    return `${n.title} ${n.body} ${n.tags.join(' ')}`.toLocaleLowerCase().includes(search.toLocaleLowerCase());
  }).sort((a,b) => sort === 'recent' ? b.updated - a.updated : a.title.localeCompare(b.title));
  const currentCollection = data.collections.find(c => c.id === view);
  const displayFolders = currentCollection
    ? data.folders.filter(f => f.collectionId === view)
    : [];
  const title = view === 'all'
    ? 'Biblioteca'
    : view === 'favorites'
    ? 'Biblioteca'
    : view === 'archive'
    ? 'Arquivo'
    : view === 'trash'
    ? 'Lixeira'
    : view === 'not-found'
    ? 'Página não encontrada'
    : view.startsWith('tag:')
    ? `# ${view.slice(4)}`
    : currentCollection
    ? currentCollection.name
    : 'Notas';
  return <div className="library">
        <section className="welcome">
          <div>
            <div className="library-title-row">
              <IconButton className="icon-button mobile-menu" aria-label="Abrir menu" onClick={onOpenSidebar}><Menu size={19} /></IconButton>
              <h1>{title}</h1>
            </div>
            {view === 'not-found' ? <p>Este link não corresponde a uma nota, coleção ou pasta disponível.</p> : currentCollection?.description?.trim() && <p>{currentCollection.description.trim()}</p>}
          </div>
          {!['trash', 'archive', 'not-found'].includes(view) && (
            <div className="welcome-actions">
            <CreateMenu onNote={createNote} containerLabel={isLibraryView ? 'Nova coleção' : 'Nova pasta'} onContainer={() => {
              if (isLibraryView) {
                openNewCollection();
              } else {
                openNewFolder(currentCollection ? currentCollection.id : (data.collections[0]?.id || ''));
              }
            }} />
            {currentCollection && (
              <CollectionActions
                collection={currentCollection}
                placement="page"
                onSettings={() => openCollectionSettings(currentCollection)}
                onDelete={() => deleteCollection(currentCollection)}
                onTogglePin={() => toggleCollectionPin(currentCollection)}
                onToggleArchive={() => toggleCollectionArchive(currentCollection)}
              />
            )}
            </div>
          )}
        </section>
        {isLibraryView && (
          <LibraryTabs active={view === 'favorites' ? 'favorites' : 'all'} onChange={navigate} />
        )}
        {(view === 'all' || view === 'archive' && listedCollections.length > 0) && (
          <section className="library-collections" aria-label="Coleções">
            {listedCollections.length === 0 ? (
              <PageEmptyState icon={<Folder size={24} />} title="Sua primeira coleção começa aqui" description="Reúna notas e pastas em um espaço para suas ideias." action={{ label: 'Criar coleção', onClick: openNewCollection }} />
            ) : (
              <div className="folder-cards-grid">
                {listedCollections.map(collection => {
                  const count = data.notes.filter(n => !n.deleted && !n.archived && n.collection === collection.id).length;
                  return (
                    <div key={collection.id} className="collection-card-wrapper">
                    <button type="button" className="folder-card collection-card" onClick={() => openCollection(collection.id)}>
                      <span className="folder-card-box">
                        <DocumentStack count={count} />
                      </span>
                      <span className="folder-card-info">
                        <span className="folder-card-name" title={collection.name}>{collection.name}</span>
                        <span className="folder-card-count">{count === 1 ? '1 nota' : `${count} notas`}</span>
                      </span>
                    </button>
                    <div className="collection-card-menu"><CollectionActions collection={collection} placement="page" onSettings={() => openCollectionSettings(collection)} onDelete={() => deleteCollection(collection)} onTogglePin={() => toggleCollectionPin(collection)} onToggleArchive={() => toggleCollectionArchive(collection)} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {view === 'not-found' && (
          <section className="empty-state" aria-labelledby="not-found-title">
            <BookOpen size={30} />
            <h3 id="not-found-title">Não encontramos este conteúdo</h3>
            <p>Ele pode ter sido removido ou o endereço pode estar incompleto.</p>
            <button className="primary-button" type="button" onClick={() => navigate('all', 'replace')}>Voltar para a Biblioteca</button>
          </section>
        )}
        {displayFolders.length > 0 && !search && (
          <section className="collection-folders-section" aria-label="Pastas">
            <div className="collection-folders-header">
              <span className="collection-folders-title">Pastas</span>
              <button type="button" className={`text-button collection-folders-reset${activeFolder ? '' : ' is-inactive'}`} disabled={!activeFolder} onClick={() => openCollection(view)}>
                Ver todas as pastas
              </button>
            </div>
            <div className="folder-cards-grid" role="region" aria-label="Pastas">
              {displayFolders.map(f => {
                const count = active.filter(n => n.collection === f.collectionId && n.folder === f.id).length;
                const isActive = activeFolder === f.id;
                const col = data.collections.find(c => c.id === f.collectionId);
                return (
                  <div
                    key={f.id}
                    className={`folder-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => openCollection(f.collectionId, isActive ? null : f.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openCollection(f.collectionId, isActive ? null : f.id);
                      }
                    }}
                  >
                    <div className="folder-card-box">
                      <DocumentStack count={count} />
                      <div className="folder-card-actions" onClick={e => e.stopPropagation()}>
                        <FolderActions
                          folder={f}
                          onRename={() => {
                            openRenameFolder(f);
                          }}
                          onDelete={() => {
                            setData(d => ({
                              ...d,
                              folders: d.folders.filter(item => item.id !== f.id),
                              notes: d.notes.map(n => n.folder === f.id ? { ...n, folder: '' } : n),
                            }));
                            if (activeFolder === f.id) openCollection(f.collectionId, null, 'replace');
                            setToast(`Pasta “${f.name}” excluída. As notas foram preservadas.`);
                          }}
                        />
                      </div>
                    </div>
                    <div className="folder-card-info">
                      <span className="folder-card-name" title={f.name}>{f.name}</span>
                      <span className="folder-card-count">
                        {count === 1 ? '1 nota' : `${count} notas`}
                        {view === 'all' && col ? ` · ${col.name}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {!['all', 'not-found'].includes(view) && !(view === 'archive' && listedCollections.length > 0 && filtered.length === 0 && !search) && <NotesList data={data} view={view} title={title} filtered={filtered} search={search} setSearch={setSearch} preferences={listPreferences} openNote={openNote} update={update} moveNoteToTrash={moveNoteToTrash} createNote={createNote} openNewFolder={openNewFolder} />}{(view === 'all' ? visibleCollections.length > 0 : filtered.length > 0 || displayFolders.length > 0 || view === 'archive' && listedCollections.length > 0) && <footer className="library-footer">Suas notas são salvas automaticamente neste navegador.</footer>}
      </div>;
}
