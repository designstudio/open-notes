import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Note, Notebook, UserProfile } from '../data';
import { Archive, ChevronDown, FileText, Folder, FolderOpen, Library, PanelRightClose, PanelRightOpen, Plus, Search, Settings2, SquarePen, Trash2 } from '../icons';
import { IconButton } from '../IconButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/tiptap-ui-primitive/tooltip/tooltip';
import { CollectionActions } from '../CollectionActions';
import { SidebarScrollArea } from '../SidebarScrollArea';
import { UserAvatar } from '../UserProfile';
import { noteFieldVisible } from '../NotePageOptions';
import type { useNoteDrag } from '../hooks/use-note-drag';
import { handleInternalLink, hrefForRoute } from './navigation';
import type { SidebarState } from './use-sidebar';
import type { Navigation, CollectionCommands } from './types';
import type { Workspace } from './workspace-selectors';
import { groupNotesByCollection } from './workspace-selectors';

// Expanded collections preview at most this many note rows; longer collections
// get a “Ver todas” link that opens the full list in the library. The limit is
// applied before creating row components so very large collections stay cheap
// to expand, while the counters keep showing the full totals.
const COLLECTION_PREVIEW_LIMIT = 8;

function CollectionNotesPanel({ expanded, id, children }: { expanded: boolean; id: string; children: () => ReactNode }) {
  const [retained, setRetained] = useState(expanded);
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (expanded) { setRetained(true); return; }
    if (!retained) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => setRetained(false);
    if (motion.matches) { finish(); return; }
    const token = getComputedStyle(panel.current!).getPropertyValue('--acc-collapse').trim();
    const duration = parseFloat(token) * (token.endsWith('ms') ? 1 : 1000);
    // Also release rows if a hidden ancestor prevents transitionend from firing.
    const timer = window.setTimeout(finish, (Number.isFinite(duration) ? duration : 250) + 50);
    const onMotion = () => { if (motion.matches) finish(); };
    motion.addEventListener('change', onMotion);
    return () => { window.clearTimeout(timer); motion.removeEventListener('change', onMotion); };
  }, [expanded, retained]);
  return <div ref={panel} className="t-acc-panel" id={id} aria-hidden={!expanded}
    onTransitionEnd={event => {
      if (!expanded && event.target === event.currentTarget && event.propertyName === 'grid-template-rows') setRetained(false);
    }}>
    <div className="t-acc-panel-inner" inert={!expanded}>
      {(expanded || retained) && children()}
    </div>
  </div>;
}

type AppSidebarProps = {
  view: string;
  selected: string | null;
  profile: UserProfile;
  state: SidebarState;
  workspace: Workspace;
  navigation: Navigation;
  collections: CollectionCommands;
  noteDrag: ReturnType<typeof useNoteDrag>;
  toggleCollection: (id: string) => void;
  createNote: () => void;
  openSearch: () => void;
  openSettings: () => void;
};

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

export function AppSidebar({ view, selected, profile, state, workspace, navigation, collections, noteDrag, toggleCollection, createNote, openSearch, openSettings }: AppSidebarProps) {
  const { collapsed, sidebar, sidebarResize, expandedCollections, collectionsOpen, setCollectionsOpen, pinnedOpen, setPinnedOpen, recentOpen, setRecentOpen, toggleSidebar } = state;
  const { recent, visibleCollections, sidebarRecent } = workspace;
  const { navigate, openNote, openCollection } = navigation;
  const { openNewCollection, openCollectionSettings, deleteCollection, toggleCollectionPin, toggleCollectionArchive } = collections;
  const isLibraryView = view === 'all' || view === 'favorites';
  function sidebarNote(n: Note, nested = false) {
    return <a key={n.id} href={`/n/${encodeURIComponent(n.id)}`} className={`recent-note ${nested ? 'collection-note' : ''} ${selected === n.id ? 'active' : ''} ${noteDrag.draggingId === n.id ? 'is-dragging' : ''}`}
      {...noteDrag.sourceProps(n.id)} aria-describedby="note-drag-help" aria-current={selected === n.id ? 'page' : undefined}
      onClick={event => handleInternalLink(event, () => openNote(n.id))}>{noteFieldVisible(n, 'icon') && <span className="note-inline-icon" aria-hidden="true">{n.pageIcon || '📝'}</span>}{n.title || 'Sem título'}</a>;
  }
  function navItem(id: string, label: string, Icon: typeof FileText, count?: number) {
    const isActive = !selected && (id === 'all' ? isLibraryView : view === id);
    const href = hrefForRoute({ view: id, selected: null, activeFolder: null });
    return <a href={href} className={`nav-item ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined} onClick={event => handleInternalLink(event, () => navigate(id))}><Icon size={18} /><span>{label}</span>{count !== undefined && <span className="count">{count}</span>}</a>;
  }
  // One pass over the recent notes (the sidebar ordering) feeds every counter
  // and every visible collection list; filtering per collection would walk the
  // whole workspace once for each row in the tree.
  const notesByCollection = groupNotesByCollection(recent);
  function sidebarCollectionTree(collections: Notebook[]) {
    return (
        <ul className="collection-tree">
          {collections.map(c => {
            const isExpanded = expandedCollections.has(c.id);
            const collectionNotes = notesByCollection.get(c.id) ?? [];
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
                    <span className="count">{collectionNotes.length}</span>
                  </a>
                  <CollectionActions collection={c} onSettings={() => openCollectionSettings(c)} onDelete={() => deleteCollection(c)} onTogglePin={() => toggleCollectionPin(c)} onToggleArchive={() => toggleCollectionArchive(c)} />
                </div>
                {/* Keep rows inert through collapse, then unmount them. The
                    panel stays mounted so aria-controls keeps resolving. */}
                <CollectionNotesPanel expanded={isExpanded} id={collectionNotesId}>
                    {() => (
                      <ul className="collection-notes" aria-label={`Notas de ${c.name}`}>
                        {collectionNotes.slice(0, COLLECTION_PREVIEW_LIMIT).map(n => <li key={n.id}>{sidebarNote(n, true)}</li>)}
                        {collectionNotes.length > COLLECTION_PREVIEW_LIMIT && (
                          <li>
                            <a href={`/c/${encodeURIComponent(c.id)}`} className="recent-note collection-note collection-notes-more"
                              aria-label={`Ver todas as notas de ${c.name}`}
                              onClick={event => handleInternalLink(event, () => openCollection(c.id))}>Ver todas</a>
                          </li>
                        )}
                      </ul>
                    )}
                </CollectionNotesPanel>
              </li>
            );
          })}
        </ul>
    );
  }
  return <>
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
      <div className="sidebar-bottom"><button type="button" className="profile" aria-label="Preferências" onClick={openSettings}><UserAvatar profile={profile} /><span className="profile-label">{profile.name || 'Meu espaço'}</span><span className="profile-settings-icon" aria-hidden="true"><Settings2 size={17} /></span></button></div>
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
        <button type="button" className="icon-button sidebar-rail-profile" aria-label="Preferências" onClick={openSettings}><UserAvatar profile={profile} /></button>
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
  </>;
}
