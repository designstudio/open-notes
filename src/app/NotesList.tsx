import type { Dispatch, SetStateAction } from 'react';
import { excerpt, noteListTime, type AppData, type Note } from '../data';
import { Archive, ArrowDownUp, ChevronDown, DocumentText, Search, Star, Trash2, X } from '../icons';
import { IconButton } from '../IconButton';
import { NoteActions } from '../NoteActions';
import { PageEmptyState } from '../PageEmptyState';
import { ViewSwitch } from '../ViewSwitch';
import { TextSwap } from '../Feedback';
import { noteFieldVisible } from '../NotePageOptions';
import type { Navigation, UpdateNote } from './types';
import type { NotesListPreferences } from './use-notes-list-preferences';

type NotesListProps = {
  data: AppData;
  view: string;
  title: string;
  filtered: Note[];
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  preferences: NotesListPreferences;
  openNote: Navigation['openNote'];
  update: UpdateNote;
  moveNoteToTrash: (id: string) => void;
  createNote: () => void;
  openNewFolder: (collectionId: string) => void;
};

export function NotesList({ data, view, title, filtered, search, setSearch, preferences, openNote, update, moveNoteToTrash, createNote, openNewFolder }: NotesListProps) {
  const { layout, setLayout, sort, setSort } = preferences;
  return <section className="notes-section">{(filtered.length > 0 || search) && <><div className="notes-heading"><div className="section-heading-title"><h2>{view === 'favorites' ? 'Favoritos' : title}</h2><span className="total-pill">{filtered.length}</span></div><div className="list-controls"><button className="text-button sort-button" onClick={() => setSort(s => s === 'recent' ? 'title' : 'recent')}><ArrowDownUp size={14} /><span><TextSwap text={sort === 'recent' ? 'Mais recentes' : 'Título A–Z'} /></span><ChevronDown size={12} /></button><ViewSwitch value={layout} onChange={setLayout} /></div></div>
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
          onUpdate={patch => update(n.id, patch)}
          onDelete={() => moveNoteToTrash(n.id)}
          onNewFolder={openNewFolder}
        /></div>}</div>)}</div>}
        </section>;
}
