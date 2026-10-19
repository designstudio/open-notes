import { useEffect, useId, useRef, useState } from 'react';
import type { SkinTone } from 'frimousse';

const options: { value: SkinTone; label: string; color: string }[] = [
  { value: 'none', label: 'Padrão', color: '#ffcc4d' },
  { value: 'light', label: 'Claro', color: '#f7dece' },
  { value: 'medium-light', label: 'Médio claro', color: '#f3d2a2' },
  { value: 'medium', label: 'Médio', color: '#d5ab88' },
  { value: 'medium-dark', label: 'Médio escuro', color: '#af7e57' },
  { value: 'dark', label: 'Escuro', color: '#7c533e' },
];

function ToneSwatch({ color }: { color: string }) {
  return <svg className="emoji-picker-swatch" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <circle cx="10" cy="10" r="8.5" fill={color} stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />
  </svg>;
}

export function EmojiSkinTonePicker({ value, onChange }: { value: SkinTone; onChange: (tone: SkinTone) => void }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = options.findIndex(option => option.value === value);
  useEffect(() => {
    if (!open) return;
    buttons.current[selected]?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open, selected]);
  function close() { setOpen(false); trigger.current?.focus(); }
  return <div className="emoji-picker-tone-control" ref={container} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  }}>
    <button ref={trigger} className="emoji-picker-tone" type="button" aria-label={`Tom de pele: ${options[selected].label}`} title="Alterar tom de pele" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}>
      <ToneSwatch color={options[selected].color} />
    </button>
    <div id={id} className="emoji-picker-tone-palette t-resize" data-open={open} inert={!open} aria-hidden={!open} role="radiogroup" aria-label="Tom de pele" onKeyDown={event => {
      const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
      if (!step && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault(); event.stopPropagation();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (selected + step + options.length) % options.length;
      onChange(options[index].value); buttons.current[index]?.focus();
    }}>
      <div className="emoji-picker-tone-options">
        {options.map((option, index) => <button key={option.value} ref={el => { buttons.current[index] = el; }} type="button" role="radio" aria-checked={value === option.value} aria-label={option.label} title={option.label} tabIndex={open && value === option.value ? 0 : -1} onClick={() => { onChange(option.value); close(); }}>
          <ToneSwatch color={option.color} />
        </button>)}
      </div>
    </div>
  </div>;
}
