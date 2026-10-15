import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Editor } from '@tiptap/react';
import { closeHistory } from '@tiptap/pm/history';
import { ArrowDown, ArrowUp, Replace, X } from './icons';
import { IconButton } from './IconButton';
import { findKey, replaceMatches } from './FindReplace';
import './note-find.css';

export function NoteFind({ editor, open, onOpenChange }: {
  editor: Editor; open: boolean; onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [result, setResult] = useState({ total: 0, active: -1 });
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    const target = returnFocus.current;
    if (target?.isConnected) target.focus({ preventScroll: true });
    else editor.commands.focus();
  }, [editor, onOpenChange]);

  useEffect(() => {
    function handleKey(event: globalThis.KeyboardEvent) {
      // Other dialogs and menus retain their own keyboard behavior.
      if (document.querySelector('dialog[open], [role="dialog"], [role="menu"]')) return;
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        if (!open) returnFocus.current = document.activeElement as HTMLElement;
        onOpenChange(true);
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (open && event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editor, open, close, onOpenChange]);

  useEffect(() => {
    if (open) {
      if (!panelRef.current?.contains(document.activeElement)) returnFocus.current = document.activeElement as HTMLElement;
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [open]);

  useEffect(() => {
    editor.view.dispatch(editor.state.tr.setMeta(findKey, { query: open ? query : '' }));
    setAnnouncement('');
  }, [editor, open, query]);

  useEffect(() => {
    function sync() {
      const state = findKey.getState(editor.state);
      const total = state?.matches.length ?? 0;
      const active = state?.active ?? -1;
      setResult(current => current.total === total && current.active === active ? current : { total, active });
    }
    sync();
    editor.on('transaction', sync);
    return () => { editor.off('transaction', sync); };
  }, [editor]);

  useEffect(() => {
    if (!open || !result.total) return;
    const current = editor.view.dom.querySelector<HTMLElement>('.note-find-match.is-current');
    if (!current) return;
    const bounds = current.getBoundingClientRect();
    const panelBottom = panelRef.current?.getBoundingClientRect().bottom ?? 160;
    if (bounds.top < panelBottom + 16 || bounds.bottom > window.innerHeight - 32) {
      current.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [editor, open, query, result.active, result.total, showReplace]);

  function navigate(direction: number) {
    const state = findKey.getState(editor.state);
    if (!state?.matches.length) return;
    const active = (state.active + direction + state.matches.length) % state.matches.length;
    editor.view.dispatch(editor.state.tr.setMeta(findKey, { active }));
  }

  function replace(all: boolean) {
    const total = findKey.getState(editor.state)?.matches.length ?? 0;
    const tr = replaceMatches(editor.state, replacement, all);
    if (!tr) return;
    editor.view.dispatch(tr);
    editor.view.dispatch(closeHistory(editor.state.tr).setMeta('addToHistory', false));
    if (!findKey.getState(editor.state)?.matches.length) inputRef.current?.focus();
    setAnnouncement(all && total > 1 ? `${total} ocorrências substituídas.` : 'Ocorrência substituída.');
  }

  function searchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      navigate(event.shiftKey ? -1 : 1);
    }
  }

  if (!open) return null;
  const noResults = Boolean(query) && result.total === 0;
  return <div ref={panelRef} className="note-find" role="region" aria-label="Buscar e substituir na nota">
    <div className="note-find-row">
      <input ref={inputRef} aria-label="Buscar no conteúdo da nota" placeholder="Buscar na nota…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={searchKey} />
      <span className="note-find-count" role="status" aria-live="polite" aria-atomic="true">{query ? result.total ? `${result.active + 1} de ${result.total}` : 'Não encontrado' : ''}</span>
      {!noResults && <>
      <IconButton className="note-find-icon" aria-label="Ocorrência anterior" title="Anterior (Shift+Enter)" disabled={!result.total} onClick={() => navigate(-1)}><ArrowUp size={16} /></IconButton>
      <IconButton className="note-find-icon" aria-label="Próxima ocorrência" title="Próxima (Enter)" disabled={!result.total} onClick={() => navigate(1)}><ArrowDown size={16} /></IconButton>
      <IconButton className="note-find-icon" aria-label="Mostrar substituição" title="Substituir" aria-expanded={showReplace} aria-controls="note-find-replace" aria-pressed={showReplace} onClick={() => setShowReplace(value => !value)}><Replace size={16} /></IconButton>
      </>}
      <IconButton className="note-find-icon" aria-label="Fechar busca na nota" title="Fechar (Esc)" onClick={close}><X size={16} /></IconButton>
    </div>
    {showReplace && !noResults && <div id="note-find-replace" className="note-find-replace">
      <input aria-label="Substituir por" placeholder="Substituir por…" value={replacement} onChange={event => setReplacement(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); replace(false); }
      }} />
      <div className="note-find-actions">
        <button type="button" disabled={!result.total} onClick={() => replace(true)}>Substituir tudo</button>
        <button type="button" className="note-find-primary" disabled={!result.total} onClick={() => replace(false)}>Substituir</button>
      </div>
    </div>}
    <span className="note-find-announcement" role="status" aria-live="polite">{announcement}</span>
  </div>;
}
