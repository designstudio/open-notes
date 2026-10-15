import { excerpt, type AppData } from '../data';
import { ArrowUpRight, DocumentText, Search, X } from '../icons';
import { IconButton } from '../IconButton';
import { noteFieldVisible } from '../NotePageOptions';
import type { AppDialogsState } from './use-app-dialogs';
import type { Workspace } from './workspace-selectors';
import type { Navigation } from './types';

type SearchDialogContentProps = {
  data: AppData;
  dialogs: AppDialogsState;
  workspace: Workspace;
  openNote: Navigation['openNote'];
};

export function SearchDialogContent({ data, dialogs, workspace, openNote }: SearchDialogContentProps) {
  const { modalSearch, setModalSearch, searchScrolled, setSearchScrolled, setModal } = dialogs;
  const { active, recent } = workspace;
  const modalSearchResults = (modalSearch.trim() ? active : recent)
    .filter(n => !modalSearch.trim() || `${n.title} ${n.body} ${n.tags.join(' ')}`.toLocaleLowerCase().includes(modalSearch.toLocaleLowerCase()))
    .slice(0, 10);
  return (
    <>
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
    </>
  );
}
