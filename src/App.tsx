import { NoteActions } from './NoteActions';
import { ExportMenu } from './ExportMenu';
import { IconButton } from './IconButton';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/tiptap-ui-primitive/tooltip/tooltip';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Archive, ArrowDownUp, ArrowUpRight, BookOpen, Library, Check, ChevronDown, DocumentText, FileText, Folder, FolderOpen, Menu, Moon, PanelRightOpen, PanelRightClose, Plus, Search, Settings2, SquarePen, Star, Sun, Trash2, RedoCircle, X } from './icons';
import { useNoteDrag } from './hooks/use-note-drag';
import { useSidebarResize } from './hooks/use-sidebar-resize';
import { readSidebarState, saveSidebarState } from './sidebar-state';
import { readNotesListState, saveNotesListState } from './notes-list-state';
import { FavoriteButton } from './FavoriteButton';
import { AnimatedDialog } from './AnimatedDialog';
import { DeleteNoteDialog } from './DeleteNoteDialog';
import { ViewSwitch } from './ViewSwitch';
import { CollectionActions } from './CollectionActions';
import { FolderActions } from './FolderActions';
import { RichNote } from './RichNote';
import { NotePageOptions, noteFieldVisible } from './NotePageOptions';
import { NoteCover } from './NoteCover';
import { NoteIconPicker } from './NoteIconPicker';
import { ToastStack, TextSwap, type ToastEvent } from './Feedback';
import { excerpt, relativeTime, noteListTime, type AppData, type Note, type NoteDefaults, type Notebook, type Folder as FolderType } from './data';
import { CollectionNoteDefaults } from './CollectionNoteDefaults';
import { SidebarScrollArea } from './SidebarScrollArea';
import { newNoteFieldDefaults } from './note-field-state';
import { Preferences } from './Preferences';
import { UserAvatar } from './UserProfile';
import { readProfile } from './profile';
import { saveLocalData } from './local-data';
import { noteSaveStatus, profileSaveMessage } from './save-feedback';
import { DocumentStack } from './DocumentStack';
import { PageEmptyState } from './PageEmptyState';
import { orderCollections } from './collection-order';
import { LibraryTabs } from './LibraryTabs';
import { CreateMenu } from './CreateMenu';
import { accentTextColor, readCustomAccent, readPalette, type Palette } from './themes';
import { useGoogleDriveSync } from './cloud/use-google-drive-sync';
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

type AppRoute = { view: string; selected: string | null; activeFolder: string | null };
type HistoryMode = 'push' | 'replace';

function routeFromLocation(data: AppData): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  if (path === '/' || path === '/library') {
    const tab = params.get('tab');
    return { view: tab === 'favorites' ? 'favorites' : 'all', selected: null, activeFolder: null };
  }
  if (path === '/archive') return { view: 'archive', selected: null, activeFolder: null };
  if (path === '/deleted') return { view: 'trash', selected: null, activeFolder: null };

  const noteMatch = path.match(/^\/n\/([^/]+)$/);
  if (noteMatch) {
    const id = decodeURIComponent(noteMatch[1]);
    const note = data.notes.find(item => item.id === id);
    if (!note) return { view: 'not-found', selected: null, activeFolder: null };
    const collectionExists = data.collections.some(item => item.id === note.collection);
    const view = note.deleted ? 'trash' : note.archived ? 'archive' : collectionExists ? note.collection : 'all';
    return { view, selected: note.id, activeFolder: note.folder || null };
  }

  const collectionMatch = path.match(/^\/c\/([^/]+)$/);
  if (collectionMatch) {
    const id = decodeURIComponent(collectionMatch[1]);
    const collection = data.collections.find(item => item.id === id);
    if (!collection) return { view: 'not-found', selected: null, activeFolder: null };
    const requestedFolder = params.get('folder');
    const folder = requestedFolder
      ? data.folders.find(item => item.id === requestedFolder && item.collectionId === collection.id)
      : null;
    if (requestedFolder && !folder) return { view: 'not-found', selected: null, activeFolder: null };
    return { view: collection.id, selected: null, activeFolder: folder?.id || null };
  }

  return { view: 'not-found', selected: null, activeFolder: null };
}

function hrefForRoute(route: AppRoute) {
  if (route.selected) return `/n/${encodeURIComponent(route.selected)}`;
  if (route.view === 'favorites') return '/library?tab=favorites';
  if (route.view === 'all') return '/library?tab=collections';
  if (route.view === 'archive') return '/archive';
  if (route.view === 'trash') return '/deleted';
  if (route.view === 'not-found') return '/library?tab=collections';
  const folder = route.activeFolder ? `?folder=${encodeURIComponent(route.activeFolder)}` : '';
  return `/c/${encodeURIComponent(route.view)}${folder}`;
}

function handleInternalLink(event: ReactMouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate();
}

function SidebarRailToggle({ onExpand }: { onExpand: () => void }) {
  const [active, setActive] = useState(false);
  return (
    <IconButton
      tooltipPlacement="right"
      className="icon-button sidebar-rail-toggle"
      aria-label="Expandir menu lateral"
      title="Expandir menu lateral"
      aria-expanded="false"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={event => setActive(event.currentTarget.matches(':focus-visible'))}
      onFocus={event => setActive(event.currentTarget.matches(':focus-visible'))}
      onBlur={() => setActive(false)}
      onClick={onExpand}
    >
      <span className="t-icon-swap sidebar-rail-brand-swap" data-state={active ? 'b' : 'a'} aria-hidden="true">
        <span className="t-icon sidebar-rail-logo" data-icon="a"><img src="/favicon.svg" alt="" draggable="false" /></span>
        <span className="t-icon sidebar-rail-expand-icon" data-icon="b"><PanelRightClose size={18} /></span>
      </span>
    </IconButton>
  );
}
export default function App({ initialData }: { initialData: AppData }) {
  const [data, setData] = useState(initialData);
  const profile = readProfile(data.profile);
  const driveSync = useGoogleDriveSync(data, setData);
  const initialRoute = useRef<AppRoute | null>(null);
  if (!initialRoute.current) initialRoute.current = routeFromLocation(data);
  const [view, setView] = useState(initialRoute.current.view);
  const [selected, setSelected] = useState<string | null>(initialRoute.current.selected);
  const [findOpen, setFindOpen] = useState(false);
  useEffect(() => { setFindOpen(false); }, [selected]);
  const [initialSidebarState] = useState(readSidebarState);
  const [collapsed, setCollapsed] = useState(initialSidebarState.collapsed);
  const sidebarResize = useSidebarResize();
  const [search, setSearch] = useState('');
  const [initialNotesListState] = useState(readNotesListState);
  const [layout, setLayout] = useState(initialNotesListState.layout);
  const [sort, setSort] = useState(initialNotesListState.sort);
  useEffect(() => { saveNotesListState({ layout, sort }); }, [layout, sort]);
  const [sidebar, setSidebar] = useState(false);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('open-notes-theme') || 'light'; } catch { return 'light'; } });
  const [palette, setPalette] = useState<Palette>(readPalette);
  const [customAccent, setCustomAccent] = useState(readCustomAccent);
  const [savedData, setSavedData] = useState(initialData);
  const [saveFailed, setSaveFailed] = useState(false);
  const savedProfile = useRef(readProfile(initialData.profile));
  const [toasts, setToasts] = useState<ToastEvent[]>([]);
  const toastId = useRef(0);
  function setToast(message: string, kind: 'success' | 'error' = 'success', action?: ToastEvent['action']) {
    const event = { id: ++toastId.current, message, kind, createdAt: Date.now(), action };
    setToasts([event]);
  }
  const dismissToast = useCallback((id: number) => setToasts(current => current.filter(event => event.id !== id)), []);
  const [modal, setModal] = useState<'collection' | 'collection-settings' | 'search' | 'settings' | 'new-folder' | 'edit-folder' | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionNoteDefaults, setCollectionNoteDefaults] = useState<NoteDefaults>({});
  const [editingCollection, setEditingCollection] = useState<Notebook | null>(null);
  const [targetCollectionForFolder, setTargetCollectionForFolder] = useState('');
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [folderName, setFolderName] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [searchScrolled, setSearchScrolled] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(initialRoute.current.activeFolder);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(() => new Set(initialSidebarState.expandedCollections));
  const [collectionsOpen, setCollectionsOpen] = useState(initialSidebarState.collectionsOpen);
  const [pinnedOpen, setPinnedOpen] = useState(initialSidebarState.pinnedOpen);
  const [recentOpen, setRecentOpen] = useState(initialSidebarState.recentOpen);
  useEffect(() => {
    saveSidebarState({ collapsed, collectionsOpen, pinnedOpen, recentOpen, expandedCollections: [...expandedCollections] });
  }, [collapsed, collectionsOpen, pinnedOpen, recentOpen, expandedCollections]);
  useLayoutEffect(() => {
    document.querySelector('.app-shell')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view, selected, activeFolder]);
  const dataRef = useRef(data);
  dataRef.current = data;
  const note = data.notes.find(n => n.id === selected);
  const saveStatus = noteSaveStatus(note, savedData.notes.find(n => n.id === selected), saveFailed);
  useEffect(() => {
    setSaveFailed(false);
    let active = true;
    // Start immediately so photos and edits do not depend on an unload callback.
    void saveLocalData(data).then(() => {
      if (!active) return;
      setSavedData(data);
      const currentProfile = readProfile(data.profile);
      const message = profileSaveMessage(currentProfile, savedProfile.current);
      savedProfile.current = currentProfile;
      if (message) setToast(message);
    }).catch(() => {
      if (!active) return;
      setSaveFailed(true);
      setToast('Não foi possível salvar as alterações neste navegador. Tente novamente.', 'error');
    });
    return () => { active = false; };
  }, [data]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    // Commit theme colors together before paint, then restore normal hover motion.
    root.classList.add('theme-changing');
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    void root.offsetHeight;
    root.classList.remove('theme-changing');
    try { localStorage.setItem('open-notes-theme', theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--custom-accent', customAccent);
    document.documentElement.style.setProperty('--custom-accent-text', accentTextColor(customAccent));
    try { localStorage.setItem('open-notes-custom-accent', customAccent); } catch { /* Color still works for this session. */ }
  }, [customAccent]);
  useEffect(() => {
    document.documentElement.dataset.palette = palette;
    try { localStorage.setItem('open-notes-palette', palette); } catch { /* The palette still works for this session. */ }
  }, [palette]);
  useEffect(() => { function key(e: KeyboardEvent) { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setModalSearch(''); setSearchScrolled(false); setModal('search'); } } window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, []);
  useEffect(() => {
    const applyLocation = () => {
      const route = routeFromLocation(dataRef.current);
      setView(route.view);
      setSelected(route.selected);
      setActiveFolder(route.activeFolder);
      const routedNote = route.selected ? dataRef.current.notes.find(item => item.id === route.selected) : null;
      const routedCollection = dataRef.current.collections.some(item => item.id === route.view)
        ? route.view
        : routedNote && dataRef.current.collections.some(item => item.id === routedNote.collection)
        ? routedNote.collection
        : null;
      if (routedCollection) {
        setExpandedCollections(current => {
          if (current.has(routedCollection)) return current;
          const next = new Set(current);
          next.add(routedCollection);
          return next;
        });
      }
      setSearch('');
      setSidebar(false);
    };
    const currentRoute = routeFromLocation(dataRef.current);
    if (currentRoute.view !== 'not-found') {
      const canonical = hrefForRoute(currentRoute);
      if (`${window.location.pathname}${window.location.search}` !== canonical) {
        window.history.replaceState(null, '', canonical);
      }
    }
    window.addEventListener('popstate', applyLocation);
    return () => window.removeEventListener('popstate', applyLocation);
  }, []);
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
  function toggleSidebar(nextCollapsed: boolean) {
    setCollapsed(nextCollapsed);
    setSidebar(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
      matchMedia('(max-width:700px)').matches ? '.mobile-menu' : nextCollapsed ? '.sidebar-rail-toggle' : '.sidebar-collapse-toggle'
    )?.focus({ preventScroll: true }));
  }
  function commitRoute(route: AppRoute, mode: HistoryMode = 'push') {
    const href = hrefForRoute(route);
    if (`${window.location.pathname}${window.location.search}` !== href) {
      window.history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', href);
    }
    setView(route.view);
    setSelected(route.selected);
    setActiveFolder(route.activeFolder);
    setSearch('');
    setSidebar(false);
  }
  function navigate(next: string, mode: HistoryMode = 'push') {
    commitRoute({ view: next, selected: null, activeFolder: null }, mode);
  }
  function openSearch() {
    setModalSearch('');
    setSearchScrolled(false);
    setModal('search');
  }
  function openNote(id: string, mode: HistoryMode = 'push') {
    const target = data.notes.find(item => item.id === id);
    if (!target) return;
    const collectionExists = data.collections.some(item => item.id === target.collection);
    const targetView = target.deleted ? 'trash' : target.archived ? 'archive' : collectionExists ? target.collection : 'all';
    if (collectionExists && !target.deleted && !target.archived) {
      setExpandedCollections(current => {
        if (current.has(target.collection)) return current;
        const next = new Set(current);
        next.add(target.collection);
        return next;
      });
    }
    commitRoute({ view: targetView, selected: target.id, activeFolder: target.folder || null }, mode);
  }
  function openCollection(collectionId: string, folderId: string | null = null, mode: HistoryMode = 'push') {
    setExpandedCollections(current => {
      if (current.has(collectionId)) return current;
      const next = new Set(current);
      next.add(collectionId);
      return next;
    });
    commitRoute({ view: collectionId, selected: null, activeFolder: folderId }, mode);
  }
  function toggleCollection(collectionId: string) {
    const isCollectionHome = view === collectionId && !selected && !activeFolder;
    if (!isCollectionHome) {
      openCollection(collectionId);
      return;
    }
    setExpandedCollections(current => {
      const next = new Set(current);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
    commitRoute({ view: collectionId, selected: null, activeFolder: null });
  }
  function openNewCollection() {
    setEditingCollection(null);
    setCollectionName('');
    setCollectionDescription('');
    setCollectionNoteDefaults({});
    setModal('collection');
  }
  function openCollectionSettings(collection: Notebook) {
    setEditingCollection(collection);
    setCollectionName(collection.name);
    setCollectionDescription(collection.description || '');
    setCollectionNoteDefaults({ ...collection.noteDefaults });
    setModal('collection-settings');
  }
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
  function exportNote(n: Note) { const blob = new Blob([`# ${n.title || 'Sem título'}\n\n${n.body}`], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(n.title || 'Sem título').replace(/[<>:"/\\|?*]/g, '-')}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setToast('Nota exportada em Markdown'); }
  function exportPdf(n: Note) {
    const previousTitle = document.title;
    document.title = (n.title || 'Sem título').replace(/[<>:"/\\|?*]/g, '-');
    const restoreTitle = () => { document.title = previousTitle; };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    setToast('Escolha “Salvar como PDF” na janela de impressão');
    window.print();
    window.setTimeout(() => {
      if (document.title !== previousTitle) restoreTitle();
    }, 1000);
  }
  const archivedCollectionIds = new Set(data.collections.filter(c => c.archived).map(c => c.id));
  const visibleCollections = orderCollections(data.collections.filter(c => !c.archived));
  const listedCollections = view === 'archive' ? orderCollections(data.collections.filter(c => c.archived)) : visibleCollections;
  const active = data.notes.filter(n => !n.deleted && !n.archived && !archivedCollectionIds.has(n.collection));
  const recent = [...active].sort((a, b) => b.updated - a.updated);
  const modalSearchResults = (modalSearch.trim() ? active : recent)
    .filter(n => !modalSearch.trim() || `${n.title} ${n.body} ${n.tags.join(' ')}`.toLocaleLowerCase().includes(modalSearch.toLocaleLowerCase()))
    .slice(0, 10);
  const collectionIds = new Set(data.collections.map(c => c.id));
  const sidebarRecent = recent.filter(n => !collectionIds.has(n.collection));
  const isLibraryView = view === 'all' || view === 'favorites';
  function sidebarNote(n: Note, nested = false) {
    return <a key={n.id} href={`/n/${encodeURIComponent(n.id)}`} className={`recent-note ${nested ? 'collection-note' : ''} ${selected === n.id ? 'active' : ''} ${noteDrag.draggingId === n.id ? 'is-dragging' : ''}`}
      {...noteDrag.sourceProps(n.id)} aria-describedby="note-drag-help" aria-current={selected === n.id ? 'page' : undefined}
      onClick={event => handleInternalLink(event, () => openNote(n.id))}>{noteFieldVisible(n, 'icon') && <span className="note-inline-icon" aria-hidden="true">{n.pageIcon || '📝'}</span>}{n.title || 'Sem título'}</a>;
  }
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
  function navItem(id: string, label: string, Icon: typeof FileText, count?: number) {
    const isActive = !selected && (id === 'all' ? isLibraryView : view === id);
    const href = hrefForRoute({ view: id, selected: null, activeFolder: null });
    return <a href={href} className={`nav-item ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined} onClick={event => handleInternalLink(event, () => navigate(id))}><Icon size={18} /><span>{label}</span>{count !== undefined && <span className="count">{count}</span>}</a>;
  }
  function sidebarCollectionTree(collections: Notebook[]) {
    return (
        <ul className="collection-tree">
          {collections.map(c => {
            const isExpanded = expandedCollections.has(c.id);
            const collectionNotesId = `collection-notes-${c.id}`;
            return (
              <li key={c.id} className="t-acc" data-open={isExpanded}>
                <div className={`collection-row ${noteDrag.overCollection === c.id ? 'is-drop-target' : ''}`} {...noteDrag.targetProps(c.id)}>
                  <a
                    href={`/c/${encodeURIComponent(c.id)}`}
                    className={`nav-item t-acc-head ${!selected && view === c.id ? 'active' : ''}`}
                    aria-expanded={isExpanded}
                    aria-controls={collectionNotesId}
                    onClick={event => handleInternalLink(event, () => toggleCollection(c.id))}
                  >
                    {isExpanded ? <FolderOpen size={17} className={c.color} /> : <Folder size={17} className={c.color} />}
                    <span>{c.name}</span>
                    <span className="count">{active.filter(n => n.collection === c.id).length}</span>
                  </a>
                  <CollectionActions collection={c} onSettings={() => openCollectionSettings(c)} onDelete={() => deleteCollection(c)} onTogglePin={() => toggleCollectionPin(c)} onToggleArchive={() => toggleCollectionArchive(c)} />
                </div>
                <div className="t-acc-panel" id={collectionNotesId} aria-hidden={!isExpanded}>
                  <div className="t-acc-panel-inner" inert={!isExpanded}>
                    <ul className="collection-notes" aria-label={`Notas de ${c.name}`}>
                      {recent.filter(n => n.collection === c.id).map(n => <li key={n.id}>{sidebarNote(n, true)}</li>)}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
    );
  }
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''} ${sidebarResize.resizing ? 'is-sidebar-resizing' : ''}`} style={sidebarResize.style}>
    {sidebar && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setSidebar(false)} />}
    <aside data-open={sidebar} className={`sidebar t-panel-slide t-resize ${sidebar ? 'is-open' : ''}`}>
      <div className="sidebar-expanded" inert={collapsed}>
      <div className="sidebar-brand"><a className="brand" href="/library?tab=collections" onClick={event => handleInternalLink(event, () => navigate('all'))}>Open Notes</a><div><IconButton className="icon-button" aria-label="Buscar notas" title="Buscar notas" shortcut="Ctrl+K" onClick={openSearch}><Search size={18} /></IconButton><IconButton className="icon-button sidebar-collapse-toggle" aria-label="Recolher menu lateral" aria-expanded={!collapsed} onClick={() => toggleSidebar(true)}><PanelRightOpen size={18} /></IconButton></div></div>
      <button className="new-note" onClick={createNote}><SquarePen size={18} />Nova nota</button>
      <button className="nav-item search-trigger" onClick={openSearch}><Search size={18} /><span>Buscar notas</span><kbd>Ctrl K</kbd></button>
      <nav aria-label="Navegação principal">{navItem('all', 'Biblioteca', Library)}{navItem('archive', 'Arquivo', Archive)}{navItem('trash', 'Lixeira', Trash2)}</nav>
      <SidebarScrollArea>
      {visibleCollections.some(c => c.pinned) && <>
        <div className="sidebar-heading"><button className="sidebar-section-toggle" aria-expanded={pinnedOpen} aria-controls="sidebar-pinned" onClick={() => setPinnedOpen(open => !open)}>Fixados<ChevronDown size={12} aria-hidden="true" /></button></div>
        <div id="sidebar-pinned" className="sidebar-section-panel" data-open={pinnedOpen} aria-hidden={!pinnedOpen}>
          <div className="sidebar-section-inner" inert={!pinnedOpen}>
            <nav aria-label="Fixados">{sidebarCollectionTree(visibleCollections.filter(c => c.pinned))}</nav>
          </div>
        </div>
      </>}
      <div className="sidebar-heading sidebar-collections-heading"><button className="sidebar-section-toggle" aria-expanded={collectionsOpen} aria-controls="sidebar-collections" onClick={() => setCollectionsOpen(open => !open)}>Coleções<ChevronDown size={12} aria-hidden="true" /></button><button className="icon-button" aria-label="Criar coleção" onClick={openNewCollection}><Plus size={15} /></button></div>
      <div id="sidebar-collections" className="sidebar-section-panel" data-open={collectionsOpen} aria-hidden={!collectionsOpen}>
      <div className="sidebar-section-inner" inert={!collectionsOpen}>
      <nav aria-label="Coleções">
        {sidebarCollectionTree(visibleCollections.filter(c => !c.pinned))}
      </nav>
      </div>
      </div>
      <p id="note-drag-help" className="sr-only">Arraste uma nota para uma coleção. Você também pode abrir a nota e usar Opções da nota, Mover para coleção.</p>
      {sidebarRecent.length > 0 && <>
      <div className="sidebar-heading recent-heading"><button className="sidebar-section-toggle" aria-expanded={recentOpen} aria-controls="sidebar-recent" onClick={() => setRecentOpen(open => !open)}>Notas recentes<ChevronDown size={12} aria-hidden="true" /></button></div>
      <div id="sidebar-recent" className="sidebar-section-panel" data-open={recentOpen} aria-hidden={!recentOpen}>
      <div className="sidebar-section-inner" inert={!recentOpen}>
      <nav className="recent-notes" aria-label="Notas recentes">{sidebarRecent.map(n => sidebarNote(n))}</nav>
      </div>
      </div>
      </>}
      </SidebarScrollArea>
      <div className="sidebar-bottom"><button type="button" className="profile" aria-label="Preferências" onClick={() => setModal('settings')}><UserAvatar profile={profile} /><span className="profile-label">{profile.name || 'Meu espaço'}</span><span className="profile-settings-icon" aria-hidden="true"><Settings2 size={17} /></span></button></div>
      </div>
      <div className="sidebar-rail" inert={!collapsed}>
        <SidebarRailToggle onExpand={() => toggleSidebar(false)} />
        <div className="sidebar-rail-actions">
          <IconButton tooltipPlacement="right" className="icon-button" aria-label="Nova nota" title="Nova nota" onClick={createNote}><SquarePen size={18} /></IconButton>
          <nav aria-label="Navegação compacta">
            {([{ id: 'all', label: 'Biblioteca', Icon: Library }, { id: 'archive', label: 'Arquivo', Icon: Archive }, { id: 'trash', label: 'Lixeira', Icon: Trash2 }]).map(({ id, label, Icon }) => {
              const isActive = !selected && (id === 'all' ? isLibraryView : view === id);
              return <IconButton tooltipPlacement="right" key={id} className={`icon-button ${isActive ? 'active' : ''}`} aria-label={label} title={label} aria-current={isActive ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} /></IconButton>;
            })}
          </nav>
          <IconButton tooltipPlacement="right" className="icon-button" aria-label="Buscar notas" title="Buscar notas" shortcut="Ctrl+K" onClick={openSearch}><Search size={18} /></IconButton>
        </div>
        <button type="button" className="icon-button sidebar-rail-profile" aria-label="Preferências" onClick={() => setModal('settings')}><UserAvatar profile={profile} /></button>
      </div>
    </aside>
    {!collapsed && <Tooltip placement="right" followCursor open={sidebarResize.resizing ? false : undefined}>
      <TooltipTrigger asChild>
        <div className="sidebar-resize-handle" aria-description="Arraste para redimensionar. Clique duas vezes para restaurar." {...sidebarResize.separatorProps} />
      </TooltipTrigger>
      <TooltipContent>
        <span className="sidebar-resize-tooltip">
          <span>Arraste para redimensionar</span>
          <span className="sidebar-resize-tooltip-secondary">Clique duas vezes para restaurar</span>
        </span>
      </TooltipContent>
    </Tooltip>}
    <main>
      {note && <header className="topbar">
        <div className="breadcrumb">
          <IconButton className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => { setSidebar(true); setCollapsed(false); }}><Menu size={19} /></IconButton>
          <span className="breadcrumb-current">
            {(() => {
              const noteCol = data.collections.find(c => c.id === note.collection);
              const noteFld = data.folders.find(f => f.id === note.folder);
              return (
                <>
                  {noteCol && (
                    <>
                      <button
                        type="button"
                        className="breadcrumb-link"
                        onClick={() => openCollection(noteCol.id)}
                      >
                        {noteCol.name}
                      </button>
                      <span className="breadcrumb-sep">/</span>
                    </>
                  )}
                  {noteFld && (
                    <>
                      <button
                        type="button"
                        className="breadcrumb-link"
                        onClick={() => openCollection(noteCol!.id, noteFld.id)}
                      >
                        {noteFld.name}
                      </button>
                      <span className="breadcrumb-sep">/</span>
                    </>
                  )}
                  <span>{note.title || 'Sem título'}</span>
                </>
              );
            })()}
          </span>
        </div>
        <div className="topbar-right">
          <span className={`save-status ${saveStatus === 'error' ? 'error' : ''}`} role="status" aria-live="polite" title={saveStatus === 'saved' ? `Última atualização: ${new Date(note.updated).toLocaleString('pt-BR')}` : undefined}>
            {saveStatus === 'error' ? <X size={14} /> : saveStatus === 'saving' ? <span className="saving-indicator" aria-hidden="true" /> : <Check size={14} />}
            <TextSwap text={saveStatus === 'error' ? 'Falha ao salvar — exporte sua nota' : saveStatus === 'saving' ? 'Salvando…' : `Atualizado ${relativeTime(note.updated).toLowerCase()}`} />
          </span>
          <div className="editor-actions">
            <IconButton className="icon-button" aria-label="Buscar nesta nota" title="Buscar nesta nota (Ctrl+F)" aria-expanded={findOpen} onClick={() => setFindOpen(value => !value)}><Search size={18} /></IconButton>
            <FavoriteButton key={`favorite-${note.id}`} favorite={note.favorite} onChange={favorite => update(note.id, { favorite })} />
            <ExportMenu onMarkdown={() => exportNote(note)} onPdf={() => exportPdf(note)} />
            {!note.deleted && (
              <NoteActions
                key={`actions-${note.id}`}
                note={note}
                collections={data.collections}
                folders={data.folders}
                onUpdate={patch => {
                  update(note.id, patch);
                  if ('collection' in patch) {
                    setToast(patch.collection ? `Nota movida para ${data.collections.find(c => c.id === patch.collection)?.name}` : 'Nota removida da coleção');
                  } else if ('folder' in patch) {
                    setToast(patch.folder ? `Nota movida para ${data.folders.find(f => f.id === patch.folder)?.name}` : 'Nota movida para a raiz da coleção');
                  }
                }}
                onDelete={() => moveNoteToTrash(note.id)}
                onNewFolder={colId => {
                  setTargetCollectionForFolder(colId);
                  setFolderName('');
                  setModal('new-folder');
                }}
              />
            )}
          </div>
        </div>
      </header>}
      {note ? <Editor key={note.id} note={note} findOpen={findOpen} onFindOpenChange={setFindOpen} onUpdate={patch => {
        update(note.id, patch);
        if (note.deleted && patch.deleted === false) setToast('Nota restaurada');
      }} onPermanentDelete={() => { setData(d => ({ ...d, notes: d.notes.filter(n => n.id !== note.id) })); navigate('trash', 'replace'); setToast('Nota excluída permanentemente'); }} /> : <div className="library">
        <section className="welcome">
          <div>
            <div className="library-title-row">
              <IconButton className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => { setSidebar(true); setCollapsed(false); }}><Menu size={19} /></IconButton>
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
                setTargetCollectionForFolder(currentCollection ? currentCollection.id : (data.collections[0]?.id || ''));
                setFolderName('');
                setModal('new-folder');
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
                            setEditingFolder(f);
                            setFolderName(f.name);
                            setModal('edit-folder');
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
        {!['all', 'not-found'].includes(view) && !(view === 'archive' && listedCollections.length > 0 && filtered.length === 0 && !search) && <section className="notes-section">{(filtered.length > 0 || search) && <><div className="notes-heading"><div className="section-heading-title"><h2>{view === 'favorites' ? 'Favoritos' : title}</h2><span className="total-pill">{filtered.length}</span></div><div className="list-controls"><button className="text-button sort-button" onClick={() => setSort(s => s === 'recent' ? 'title' : 'recent')}><ArrowDownUp size={14} /><span><TextSwap text={sort === 'recent' ? 'Mais recentes' : 'Título A–Z'} /></span><ChevronDown size={12} /></button><ViewSwitch value={layout} onChange={setLayout} /></div></div>
        <div className="inline-search"><Search size={18} /><input aria-label="Filtrar notas" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar notas" />{search && <IconButton className="icon-button" aria-label="Limpar busca" onClick={() => setSearch('')}><X size={14} /></IconButton>}</div></>}
        {filtered.length === 0 ? <PageEmptyState
          icon={search ? <Search size={24} /> : view === 'favorites' ? <Star size={24} /> : view === 'archive' ? <Archive size={24} /> : view === 'trash' ? <Trash2 size={24} /> : <DocumentText size={24} />}
          title={search ? 'Nenhuma nota encontrada' : view === 'favorites' ? 'Suas favoritas, sempre por perto' : view === 'archive' ? 'Nenhuma nota arquivada' : view === 'trash' ? 'Sua lixeira está vazia' : 'Uma ideia pode começar aqui'}
          description={search ? 'Tente buscar por outro título, palavra ou etiqueta.' : view === 'favorites' ? 'Marque uma nota com estrela para encontrá-la neste espaço.' : view === 'archive' ? 'As notas que você arquivar ficam aqui para consultar depois.' : view === 'trash' ? 'As notas excluídas aparecem aqui. Você pode restaurá-las quando precisar.' : 'Crie sua primeira nota e dê espaço ao que você está pensando.'}
          action={search ? { label: 'Limpar busca', onClick: () => setSearch('') } : !['trash', 'archive', 'favorites'].includes(view) ? { label: 'Criar nota', onClick: createNote } : undefined}
        /> : <div className={layout === 'grid' ? 'notes-grid' : 'notes-list'}>{filtered.map(n => <div key={n.id} className="note-row"><button className="note-row-main" onClick={() => openNote(n.id)}><span className="row-text"><span className="row-title">{noteFieldVisible(n, 'icon') && <span className="note-inline-icon" aria-hidden="true">{n.pageIcon || '📝'}</span>}{n.title || 'Sem título'}{n.favorite && <Star size={11} className="row-star" />}</span><span className="row-excerpt">{excerpt(n.body) || 'Sua próxima ideia começa aqui.'}</span></span><time dateTime={new Date(n.updated).toISOString()}>{noteListTime(n.updated)}</time></button>{!n.deleted && <div className="row-more" onClick={e => e.stopPropagation()}><NoteActions
          note={n}
          collections={data.collections}
          folders={data.folders}
          onUpdate={patch => {
            update(n.id, patch);
            if ('collection' in patch) {
              setToast(patch.collection ? `Nota movida para ${data.collections.find(c => c.id === patch.collection)?.name}` : 'Nota removida da coleção');
            } else if ('folder' in patch) {
              setToast(patch.folder ? `Nota movida para ${data.folders.find(f => f.id === patch.folder)?.name}` : 'Nota movida para a raiz da coleção');
            }
          }}
          onDelete={() => moveNoteToTrash(n.id)}
          onNewFolder={colId => {
            setTargetCollectionForFolder(colId);
            setFolderName('');
            setModal('new-folder');
          }}
        /></div>}</div>)}</div>}
        </section>}{(view === 'all' ? visibleCollections.length > 0 : filtered.length > 0 || displayFolders.length > 0 || view === 'archive' && listedCollections.length > 0) && <footer className="library-footer">Suas notas são salvas automaticamente neste navegador.</footer>}
      </div>}
    </main>
    <ToastStack events={toasts} onDismiss={dismissToast} />
    <AnimatedDialog open={modal !== null} onDismiss={() => setModal(null)} className={modal === 'search' ? 'search-dialog' : modal === 'settings' ? 'settings-dialog' : ''} aria-labelledby="dialog-title" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
    {modal !== 'search' && modal !== 'settings' && <div className="dialog-header"><h2 id="dialog-title">{modal === 'collection' ? 'Nova coleção' : modal === 'collection-settings' ? 'Editar coleção' : modal === 'new-folder' ? 'Nova pasta' : modal === 'edit-folder' ? 'Renomear pasta' : 'Preferências'}</h2><IconButton className="icon-button" aria-label="Fechar" onClick={() => setModal(null)}><X size={19} /></IconButton></div>}
    {modal === 'collection' && (
      <form className="collection-settings-form" onSubmit={e => {
        e.preventDefault();
        if (!collectionName.trim()) return;
        const collection: Notebook = {
          id: crypto.randomUUID(),
          name: collectionName.trim(),
          description: collectionDescription.trim(),
          noteDefaults: collectionNoteDefaults,
          createdAt: Date.now(),
          color: ['sage', 'blue', 'amber'][data.collections.length % 3],
        };
        setData(d => ({ ...d, collections: [collection, ...d.collections] }));
        setCollectionName('');
        setCollectionDescription('');
        setModal(null);
        openCollection(collection.id);
      }}>
        <label htmlFor="collection-name">Nome da coleção</label>
        <input id="collection-name" autoFocus maxLength={40} value={collectionName} onChange={e => setCollectionName(e.target.value)} placeholder="Ex.: Meu próximo projeto" required />
        <label htmlFor="collection-description">Descrição da coleção</label>
        <textarea id="collection-description" maxLength={180} rows={2} value={collectionDescription} onChange={e => setCollectionDescription(e.target.value)} placeholder="Explique o que você organiza nesta coleção" />
        <CollectionNoteDefaults value={collectionNoteDefaults} onChange={setCollectionNoteDefaults} />
        <div className="collection-settings-footer">
          <button className="primary-button" type="submit"><Plus size={15} />Criar coleção</button>
        </div>
      </form>
    )}
    {modal === 'collection-settings' && editingCollection && (
      <form className="collection-settings-form" onSubmit={e => {
        e.preventDefault();
        const updatedName = collectionName.trim();
        if (!updatedName) return;
        const updatedDescription = collectionDescription.trim();
        setData(d => ({
          ...d,
          collections: d.collections.map(collection => collection.id === editingCollection.id
            ? { ...collection, name: updatedName, description: updatedDescription, noteDefaults: collectionNoteDefaults }
            : collection),
        }));
        setEditingCollection(null);
        setCollectionName('');
        setCollectionDescription('');
        setModal(null);
        setToast('Coleção atualizada');
      }}>
        <label htmlFor="edit-collection-name">Nome da coleção</label>
        <input
          id="edit-collection-name"
          autoFocus
          maxLength={40}
          value={collectionName}
          onChange={e => setCollectionName(e.target.value)}
          placeholder="Nome da coleção"
          required
        />
        <label htmlFor="edit-collection-description">Descrição da coleção</label>
        <textarea
          id="edit-collection-description"
          maxLength={180}
          rows={2}
          value={collectionDescription}
          onChange={e => setCollectionDescription(e.target.value)}
          placeholder="Explique o que você organiza nesta coleção"
        />
        <CollectionNoteDefaults value={collectionNoteDefaults} onChange={setCollectionNoteDefaults} />
        <div className="collection-settings-footer">
          <button className="primary-button" type="submit">Salvar alterações</button>
        </div>
      </form>
    )}
    {modal === 'new-folder' && (
      <form onSubmit={e => {
        e.preventDefault();
        if (!folderName.trim()) return;
        const targetCol = targetCollectionForFolder || currentCollection?.id || data.collections[0]?.id;
        if (!targetCol) return;
        const colName = data.collections.find(c => c.id === targetCol)?.name;
        const f: FolderType = {
          id: crypto.randomUUID(),
          name: folderName.trim(),
          collectionId: targetCol,
        };
        setData(d => ({ ...d, folders: [...d.folders, f] }));
        setFolderName('');
        setModal(null);
        openCollection(targetCol, f.id);
        setToast(`Pasta “${f.name}” criada em ${colName}`);
      }}>
        <p>
          {currentCollection
            ? <>Organize as notas da coleção <strong>{currentCollection.name}</strong>.</>
            : <>Escolha a coleção e dê um nome para a pasta.</>
          }
        </p>
        {!currentCollection && (
          <div style={{ marginBottom: 'var(--space-14)' }}>
            <label htmlFor="target-folder-col">Coleção</label>
            <select
              id="target-folder-col"
              value={targetCollectionForFolder || data.collections[0]?.id || ''}
              onChange={e => setTargetCollectionForFolder(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-9) var(--space-12)',
                borderRadius: 'var(--input-radius)',
                border: '1px solid var(--input-border)',
                background: 'var(--input-bg)',
                color: 'var(--input-text)',
                fontSize: 'var(--font-size-14)',
                marginTop: 'var(--space-6)'
              }}
            >
              {data.collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <label htmlFor="new-folder-name">Nome da pasta</label>
        <input
          id="new-folder-name"
          autoFocus
          maxLength={40}
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Ex.: Projetos, Reuniões, Leituras..."
          required
        />
        <button className="primary-button" type="submit">
          <Plus size={16} />Criar pasta
        </button>
      </form>
    )}
    {modal === 'edit-folder' && editingFolder && (
      <form onSubmit={e => {
        e.preventDefault();
        if (!folderName.trim()) return;
        const updatedName = folderName.trim();
        setData(d => ({
          ...d,
          folders: d.folders.map(f => f.id === editingFolder.id ? { ...f, name: updatedName } : f)
        }));
        setEditingFolder(null);
        setFolderName('');
        setModal(null);
        setToast(`Pasta renomeada para “${updatedName}”`);
      }}>
        <label htmlFor="edit-folder-name">Nome da pasta</label>
        <input
          id="edit-folder-name"
          autoFocus
          maxLength={40}
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Nome da pasta"
          required
        />
        <button className="primary-button" type="submit">
          Salvar alterações
        </button>
      </form>
    )}
    {modal === 'search' && <>
      <div className={`search-dialog-header ${searchScrolled ? 'is-scrolled' : ''}`}>
        <h2 id="dialog-title" className="sr-only">Buscar notas</h2>
        <input autoFocus aria-label="Buscar em todas as notas" placeholder="Pesquisar…" value={modalSearch} onChange={e => setModalSearch(e.target.value)} />
        <IconButton className="icon-button search-dialog-close" aria-label="Fechar pesquisa" onClick={() => setModal(null)}><X size={19} /></IconButton>
      </div>
      <div className="search-dialog-body" onScroll={event => setSearchScrolled(event.currentTarget.scrollTop > 0)}>
        <p className="search-results-label">{modalSearch.trim() ? 'Resultados' : 'Notas recentes'}</p>
        <div className="search-results" aria-label={modalSearch.trim() ? 'Resultados da pesquisa' : 'Notas recentes'}>
          {modalSearchResults.map(n => {
            const resultCollection = data.collections.find(c => c.id === n.collection);
            const resultFolder = data.folders.find(f => f.id === n.folder);
            const location = [resultCollection?.name, resultFolder?.name].filter(Boolean).join(' / ');
            return <button key={n.id} onClick={() => { openNote(n.id); setModal(null); }}>
              <span className="search-result-icon">{noteFieldVisible(n, 'icon') ? <span aria-hidden="true">{n.pageIcon || '📝'}</span> : <DocumentText size={18} />}</span>
              <span className="search-result-copy">
                <span className="search-result-title">{n.title || 'Sem título'}</span>
                <small>{location || 'Sem coleção'}{modalSearch.trim() && excerpt(n.body) ? ` · ${excerpt(n.body).slice(0, 72)}` : ''}</small>
              </span>
              <ArrowUpRight className="search-result-arrow" size={15} />
            </button>;
          })}
          {modalSearchResults.length === 0 && <div className="search-results-empty"><Search size={20} /><p>Nenhuma nota encontrada</p><span>Tente buscar por outro título, palavra ou etiqueta.</span></div>}
        </div>
      </div>
    </>}
    {modal === 'settings' && <Preferences profile={profile} onProfileUpdate={patch => setData(current => ({ ...current, profile: { ...readProfile(current.profile), ...patch } }))} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} palette={palette} onPaletteChange={setPalette} customAccent={customAccent} onCustomAccentChange={color => { setCustomAccent(color); setPalette('custom'); }} onDismiss={() => setModal(null)} sync={driveSync} />}
    </AnimatedDialog>
  </div>;
}

function Editor({ note, onUpdate, onPermanentDelete, findOpen, onFindOpenChange }: { note: Note; onUpdate: (patch: Partial<Note>) => void; onPermanentDelete: () => void; findOpen: boolean; onFindOpenChange: (open: boolean) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const resize = () => {
      el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`;
      el.parentElement?.style.setProperty('--note-title-line-height', getComputedStyle(el).lineHeight);
    };
    resize();
    let previousWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth !== previousWidth) { previousWidth = el.clientWidth; resize(); }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [note.title]);
  return <div className="editor" data-page-width={note.pageWidth ?? 'narrow'} data-has-cover={noteFieldVisible(note, 'cover')} data-has-icon={noteFieldVisible(note, 'icon')}>
    {note.deleted && <div className="note-banner note-banner-trash">Esta nota está na lixeira.<button onClick={() => onUpdate({ deleted: false })}><RedoCircle className="restore-note-icon" size={14} aria-hidden="true" />Restaurar nota</button><button className="danger" onClick={() => setConfirmDelete(true)}><Trash2 size={14} aria-hidden="true" />Excluir permanentemente</button></div>}
    <DeleteNoteDialog open={confirmDelete} title={note.title} onDismiss={() => setConfirmDelete(false)} onDelete={onPermanentDelete} />
    {note.archived && !note.deleted && <div className="note-banner">Esta nota está arquivada.<button onClick={() => onUpdate({ archived: false })}>Trazer de volta</button></div>}
    {noteFieldVisible(note, 'cover') && <NoteCover key={`cover-${note.id}`} note={note} onUpdate={onUpdate} />}
    <div className="editor-paper">
      <div className="note-heading">
      <NotePageOptions note={note} onUpdate={onUpdate} />
      <div className="note-title-row">
      {noteFieldVisible(note, 'icon') && <NoteIconPicker note={note} onUpdate={onUpdate} />}
      <h1 className="print-note-title">{note.title || 'Sem título'}</h1>
      <textarea ref={titleRef} rows={1} className="editor-title" aria-label="Título da nota" autoFocus={!note.title} placeholder="Sem título" value={note.title} onChange={e => onUpdate({ title: e.target.value.replace(/\n/g, ' ') })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.querySelector<HTMLElement>('[aria-label="Conteúdo da nota"]')?.focus(); } }} />
      </div>
      {noteFieldVisible(note, 'subtitle') && <h2 className="note-subtitle-heading"><input className="note-subtitle" aria-label="Subtítulo da nota" placeholder="Comece a escrever um subtítulo para sua nota…" value={note.subtitle ?? ''} onChange={event => onUpdate({ subtitle: event.target.value })} /></h2>}
      </div>
      <RichNote content={note.body} noteTitle={note.title} document={note.document} showOutline={note.showOutline !== false} findOpen={findOpen} onFindOpenChange={onFindOpenChange} onChange={(body, document) => onUpdate({ body, document })} />
      <div className="editor-footer"><span>{note.body.trim() ? note.body.trim().split(/\s+/).length : 0} palavras<span className="footer-dot">·</span>Markdown</span><span>Salvo neste navegador</span></div>
    </div>
  </div>;
}


