import type { NoteDefaults } from './data';
import { FieldSwitch } from './NotePageOptions';
import { NoteWidthTabs } from './NoteWidthTabs';
import { Gallery, SmileCircle, Subtitle, List, PageWidth, ChevronDown } from './icons';

export function CollectionNoteDefaults({ value, onChange }: { value: NoteDefaults; onChange: (value: NoteDefaults) => void }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="collection-advanced t-acc" data-open={open}>
    <button type="button" className="collection-advanced-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(current => !current)}>Opções avançadas<ChevronDown className="t-acc-chevron" size={14} aria-hidden="true" /></button>
    <div id={id} className="t-acc-panel" aria-hidden={!open} inert={!open}>
    <div className="t-acc-panel-inner">
    <fieldset className="collection-note-defaults">
    <legend>Padrão das novas notas</legend>
    <p>Aplicado às notas criadas nesta coleção. Você pode ajustar cada nota depois.</p>
    <FieldSwitch label="Capa" icon={Gallery} checked={value.showCover === true} onChange={showCover => onChange({ ...value, showCover })} />
    <FieldSwitch label="Ícone" icon={SmileCircle} checked={value.showPageIcon === true} onChange={showPageIcon => onChange({ ...value, showPageIcon })} />
    <FieldSwitch label="Subtítulo" icon={Subtitle} checked={value.showSubtitle === true} onChange={showSubtitle => onChange({ ...value, showSubtitle })} />
    <FieldSwitch label="Navegação por títulos" icon={List} checked={value.showOutline !== false} onChange={showOutline => onChange({ ...value, showOutline })} />
    <div className="collection-note-width-row">
    <div className="collection-note-width-label"><PageWidth size={18} /><span>Largura da página</span></div>
    <NoteWidthTabs value={value.pageWidth} onChange={pageWidth => onChange({ ...value, pageWidth })} />
    </div>
    </fieldset>
    </div>
    </div>
  </div>;
}
import { useId, useState } from 'react';
