import { useLayoutEffect, useRef, useState } from 'react';
import type { Note } from './data';
import { NotePopover } from './NotePopover';
import { NoteEmoji } from './NoteEmoji';
import { ForbiddenCircle } from './icons';
import { noteFieldPatch } from './note-field-state';

const icons = [
  ['📝','Nota escrita'], ['📄','Documento'], ['📚','Livros leitura'], ['📖','Livro história'], ['💡','Ideia'], ['⭐','Estrela favorito'], ['🎯','Meta objetivo'], ['🌱','Planta crescimento'],
  ['☕','Café'], ['🎨','Arte pintura'], ['🎬','Filme roteiro'], ['🎵','Música'], ['🧠','Cérebro pensamento'], ['💼','Trabalho'], ['📌','Alfinete'], ['❤️','Coração'],
  ['🌙','Lua'], ['✨','Brilho'], ['📅','Calendário'], ['🏡','Casa'], ['🌍','Mundo viagem'], ['🏔️','Montanha'], ['📷','Fotografia'], ['🔬','Pesquisa ciência'],
  ['💻','Computador tecnologia'], ['🔖','Marcador'], ['🧩','Quebra-cabeça'], ['🚀','Foguete projeto'], ['🌻','Flor'], ['🎓','Estudo'], ['🗂️','Arquivos'], ['🎭','Personagens teatro'],
];
function IconChoices({ note, onChoose, onRemove }: { note: Note; onChoose: (emoji: string) => void; onRemove: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasAbove, setHasAbove] = useState(false);
  function updateFade() {
    const el = scrollRef.current;
    if (el) {
      setHasMore(el.scrollHeight - el.clientHeight - el.scrollTop > 1);
      setHasAbove(el.scrollTop > 1);
    }
  }
  useLayoutEffect(() => {
    updateFade();
    const observer = new ResizeObserver(updateFade);
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);
  return <div className="note-icon-scroll-frame" data-has-scroll={hasMore} data-has-scroll-above={hasAbove}>
    <div ref={scrollRef} className="note-icon-scroll" role="region" aria-label="Emojis disponíveis" tabIndex={0} onScroll={updateFade}>
      <div className="note-icon-grid">
        {(note.showPageIcon ?? Boolean(note.pageIcon)) && <button type="button" className="note-emoji-option note-icon-remove-option" aria-label="Remover ícone" title="Remover ícone" onClick={onRemove}><ForbiddenCircle size={22} aria-hidden="true" /></button>}
        {icons.map(([emoji, label]) => <button type="button" key={emoji} className="note-emoji-option" aria-label={label} aria-pressed={note.pageIcon === emoji} onClick={() => onChoose(emoji)}><NoteEmoji value={emoji} size={22} opticalOffset={false} /></button>)}
      </div>
    </div>
  </div>;
}
export function NoteIconPicker({ note, onUpdate }: { note: Note; onUpdate: (patch: Partial<Note>) => void }) {
  return <NotePopover label="Escolher ícone da nota" className="note-icon-picker" trigger={(props) => <button {...props} type="button" className="note-page-icon" aria-label="Editar ícone da nota"><NoteEmoji value={note.pageIcon || '📝'} /></button>}>
    {close => <>
      <IconChoices note={note} onChoose={emoji => { onUpdate({ pageIcon: emoji }); close(); }} onRemove={() => { onUpdate(noteFieldPatch('icon', false)); close(); }} />
    </>}
  </NotePopover>;
}
