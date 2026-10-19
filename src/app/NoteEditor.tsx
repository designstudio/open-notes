import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { Note } from '../data';
import { RedoCircle, Trash2 } from '../icons';
import { DeleteNoteDialog } from '../DeleteNoteDialog';
import { NoteCover } from '../NoteCover';
import { NoteIconPicker } from '../NoteIconPicker';
import { NotePageOptions, noteFieldVisible } from '../NotePageOptions';
import './note-loading.css';

let loadedRichNote: typeof import('../RichNote').RichNote | undefined;
export const preloadRichNote = () => import('../RichNote').then(module => {
  loadedRichNote = module.RichNote;
  return module;
});
const LazyRichNote = lazy(() => preloadRichNote().then(module => ({ default: module.RichNote })));

export function NoteEditor({ note, onUpdate, onPermanentDelete, findOpen, onFindOpenChange }: { note: Note; onUpdate: (patch: Partial<Note>) => void; onPermanentDelete: () => void; findOpen: boolean; onFindOpenChange: (open: boolean) => void }) {
  // A prepared editor can mount synchronously, without Suspense's reveal delay.
  // Keep the choice stable for this note so later saves preserve its instance.
  const [RichNote] = useState(() => loadedRichNote ?? LazyRichNote);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
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
  }, [note.title, ready]);
  useLayoutEffect(() => {
    if (ready && !note.title) titleRef.current?.focus();
  }, [ready]);
  return <div className="note-editor-stage" data-ready={ready} aria-busy={!ready}>
    {!ready && <div className="note-loading" role="status" aria-label="Carregando nota"><span className="note-loading-icon" aria-hidden="true" /></div>}
    <div className="note-editor-content" inert={!ready}>
    <Suspense fallback={null}>
    <div className="editor" data-page-width={note.pageWidth ?? 'narrow'} data-has-cover={noteFieldVisible(note, 'cover')} data-has-icon={noteFieldVisible(note, 'icon')}>
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
      <RichNote content={note.body} noteTitle={note.title} document={note.document} showOutline={note.showOutline !== false} findOpen={findOpen} onFindOpenChange={onFindOpenChange} onReady={onReady} onChange={(body, document) => onUpdate({ body, document })} />
      <div className="editor-footer"><span>{note.body.trim() ? note.body.trim().split(/\s+/).length : 0} palavras<span className="footer-dot">·</span>Markdown</span><span>Salvo neste navegador</span></div>
    </div>
    </div>
    </Suspense>
    </div>
  </div>;
}
