import { useState, type ComponentType } from 'react';
import type { Note } from './data';
import { Gallery, Subtitle, PageWidth, List, SmileCircle } from './icons';
import { NotePopover } from './NotePopover';
import { NoteWidthTabs } from './NoteWidthTabs';
import { noteFieldPatch } from './note-field-state';
import './note-page-options.css';

export function noteFieldVisible(note: Note, field: 'cover' | 'icon' | 'subtitle') {
  if (field === 'cover') return note.showCover ?? Boolean(note.cover || note.coverGradient);
  if (field === 'icon') return note.showPageIcon ?? Boolean(note.pageIcon);
  return note.showSubtitle ?? note.subtitle !== undefined;
}
export function FieldSwitch({ label, icon: Icon, checked, onChange }: { label: string; icon: ComponentType<{ size?: number }>; checked: boolean; onChange: (checked: boolean) => void }) {
  const [initialized, setInitialized] = useState(false);
  return <button type="button" className="note-field-switch" role="switch" aria-checked={checked} onClick={() => { setInitialized(true); onChange(!checked); }}>
    <Icon size={18} /><span className="note-field-label">{label}</span>
    <span className={`t-toggle ${initialized ? 'is-init' : ''}`} data-on={checked} aria-hidden="true"><span className="t-toggle-thumb" /></span>
  </button>;
}
export function NotePageOptions({ note, onUpdate }: { note: Note; onUpdate: (patch: Partial<Note>) => void }) {
  return <NotePopover label="Opções da nota" className="note-page-options-menu" trigger={(props, open) => <button {...props} type="button" className="note-page-options-trigger" data-open={open}>Opções da nota</button>}>
    {() => <>
      <FieldSwitch label="Capa" icon={Gallery} checked={noteFieldVisible(note, 'cover')} onChange={enabled => onUpdate(noteFieldPatch('cover', enabled))} />
      <FieldSwitch label="Ícone" icon={SmileCircle} checked={noteFieldVisible(note, 'icon')} onChange={enabled => onUpdate(noteFieldPatch('icon', enabled))} />
      <FieldSwitch label="Subtítulo" icon={Subtitle} checked={noteFieldVisible(note, 'subtitle')} onChange={enabled => onUpdate(noteFieldPatch('subtitle', enabled))} />
      <FieldSwitch label="Navegação por títulos" icon={List} checked={note.showOutline !== false} onChange={showOutline => onUpdate({ showOutline })} />
      <div className="note-options-divider" />
      <div className="note-width-label"><PageWidth size={16} />Largura da página</div>
      <NoteWidthTabs value={note.pageWidth} onChange={pageWidth => onUpdate({ pageWidth })} />
    </>}
  </NotePopover>;
}
