import { useLayoutEffect, useState } from 'react';
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole, useTransitionStyles } from '@floating-ui/react';
import { useReducedMotion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { Check } from './icons';
import { normalizeHex, palettes, type Palette } from './themes';

type Props = {
  theme: string;
  palette: Palette;
  customAccent: string;
  onPaletteChange: (palette: Palette) => void;
  onCustomAccentChange: (hex: string) => void;
};

// Resolve the canonical tokens rather than duplicating palette colors here.
const colorTokens = {
  neutral: ['color-hex-0d0d0d', 'color-hex-fff'],
  blue: ['color-blue-accent', 'color-hex-a2d3ff'],
  aurora: ['color-purple-accent', 'color-hex-d8bfff'],
  mint: ['color-green-accent', 'color-hex-90e3c6'],
  rose: ['color-rose-accent', 'color-hex-ffb6bf'],
  peach: ['color-peach-accent', 'color-hex-febd99'],
};

export function AccentColorPicker({ theme, palette, customAccent, onPaletteChange, onCustomAccentChange }: Props) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(customAccent);
  const [draft, setDraft] = useState(customAccent);
  const [invalid, setInvalid] = useState(false);
  const reducedMotion = useReducedMotion();
  const label = palette === 'custom' ? color : palettes.find(option => option.id === palette)!.name;
  const boundary = document.querySelector('dialog[open]') ?? undefined;
  useLayoutEffect(() => {
    const token = palette === 'custom' ? null : colorTokens[palette][theme === 'dark' ? 1 : 0];
    const hex = token ? normalizeHex(getComputedStyle(document.documentElement).getPropertyValue(`--primitive-${token}`)) : customAccent;
    if (hex) { setColor(hex); setDraft(hex); setInvalid(false); }
  }, [palette, theme, customAccent]);
  const { refs, floatingStyles, context } = useFloating({
    open, onOpenChange: setOpen, placement: 'bottom-end', strategy: 'fixed',
    middleware: [offset(8), flip({ padding: 16, boundary }), shift({ padding: 16, boundary, crossAxis: true })], whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context), useDismiss(context, { escapeKey: false }), useRole(context, { role: 'dialog' }),
  ]);
  const motionTokens = getComputedStyle(document.documentElement);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: reducedMotion ? 0 : {
      open: Number.parseFloat(motionTokens.getPropertyValue('--dropdown-open-dur')) || 250,
      close: Number.parseFloat(motionTokens.getPropertyValue('--dropdown-close-dur')) || 150,
    },
    initial: { opacity: 0, transform: 'scale(var(--dropdown-pre-scale))' },
    open: { opacity: 1, transform: 'scale(1)' },
    close: { opacity: 0, transform: 'scale(var(--dropdown-closing-scale))' },
    common: ({ side }) => ({ transformOrigin: `${side === 'top' ? 'bottom' : 'top'} right`, transitionTimingFunction: 'var(--dropdown-ease)' }),
  });
  const apply = (value: string) => {
    const hex = normalizeHex(value);
    setInvalid(!hex);
    if (hex) { setColor(hex); setDraft(hex); onCustomAccentChange(hex); }
    return Boolean(hex);
  };
  return <div className="setting-row accent-setting">
    <span>Cor de destaque</span>
    <button ref={refs.setReference} className="secondary-button accent-color-pill" {...getReferenceProps()} aria-label={`Cor de destaque ${label}`}>
      <span className="accent-color-preview" style={{ background: color }} aria-hidden="true" />
      <span>{label}</span>
    </button>
    {isMounted && <FloatingPortal root={refs.domReference.current?.closest('dialog') ?? undefined}>
      <FloatingFocusManager context={context} modal={false} initialFocus={-1} disabled={!open}>
        <div ref={refs.setFloating} className="accent-color-popover" style={floatingStyles} {...getFloatingProps()} inert={!open} aria-hidden={!open} aria-label="Escolher cor de destaque" onKeyDownCapture={event => {
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); }
        }}>
          <div className="accent-color-surface" style={transitionStyles}>
          <HexColorPicker color={color} onChange={apply} aria-label="Selecionar cor" />
          <form className="accent-hex-form" onSubmit={event => { event.preventDefault(); if (apply(draft)) setOpen(false); }}>
            <label htmlFor="accent-hex">HEX</label>
            <input id="accent-hex" value={draft} maxLength={7} spellCheck={false} autoComplete="off" aria-invalid={invalid} aria-describedby={invalid ? 'accent-hex-error' : undefined} onChange={event => { setDraft(event.target.value); setInvalid(false); }} onBlur={() => { if (draft !== color) apply(draft); }} />
            <button type="submit" aria-label="Aplicar cor HEX"><Check size={20} /></button>
          </form>
          {invalid && <p id="accent-hex-error" role="alert">Use um HEX válido, como #3A472E.</p>}
          <span className="accent-presets-label">Cores padrão</span>
          <div className="accent-presets" role="group" aria-label="Cores padrão">
            {palettes.map(option => <button key={option.id} type="button" aria-label={option.name} title={option.name} aria-pressed={palette === option.id} onClick={() => onPaletteChange(option.id)}>
              <span className="accent-preset-color" style={{ background: option.gradient }} aria-hidden="true" />
              {palette === option.id && <Check size={20} />}
            </button>)}
          </div>
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>}
  </div>;
}
