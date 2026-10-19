import { lazy, Suspense } from 'react';
import type { Note } from './data';
import { NotePopover } from './NotePopover';
import { NoteEmoji } from './NoteEmoji';
import { noteFieldPatch } from './note-field-state';

const EmojiPicker = lazy(() => import('./NoteEmojiPicker'));

export function NoteIconPicker({ note, onUpdate }: { note: Note; onUpdate: (patch: Partial<Note>) => void }) {
  return <NotePopover label="Escolher ícone da nota" className="note-icon-picker" trigger={(props) => <button {...props} type="button" className="note-page-icon" aria-label="Editar ícone da nota"><NoteEmoji value={note.pageIcon || '📝'} /></button>}>
    {close => <Suspense fallback={<p className="note-picker-help" role="status">Carregando emojis…</p>}>
      <EmojiPicker value={note.pageIcon} onChoose={emoji => { onUpdate({ pageIcon: emoji }); close(); }} onRemove={() => { onUpdate(noteFieldPatch('icon', false)); close(); }} />
    </Suspense>}
  </NotePopover>;
}
