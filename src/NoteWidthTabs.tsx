import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Note } from './data';

const widths = [{ value: 'narrow', label: 'Estreita' }, { value: 'wide', label: 'Ampla' }, { value: 'full', label: 'Completa' }] as const;
export function NoteWidthTabs({ value = 'narrow', onChange }: { value?: Note['pageWidth']; onChange: (value: Note['pageWidth']) => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const tokens = getComputedStyle(document.documentElement);
  const duration = (parseFloat(tokens.getPropertyValue('--tabs-dur')) || 250) / 1000;
  const curve = tokens.getPropertyValue('--tabs-ease').match(/cubic-bezier\(([^)]+)\)/)?.[1].split(',').map(Number);
  const ease: [number, number, number, number] = curve?.length === 4 && curve.every(Number.isFinite) ? [curve[0], curve[1], curve[2], curve[3]] : [.22, 1, .36, 1];
  const activeIndex = Math.max(0, widths.findIndex(width => width.value === value));
  return <div ref={bar} className="note-width-tabs t-tabs" role="tablist" aria-label="Largura da página">
    <motion.span className="note-width-pill" aria-hidden="true" initial={false} animate={{ x: `${activeIndex * 100}%` }} transition={{ duration: reducedMotion ? 0 : duration, ease }} />
    {widths.map((width, index) => <button type="button" role="tab" className="t-tab" key={width.value} aria-selected={value === width.value} tabIndex={value === width.value ? 0 : -1}
      onClick={() => onChange(width.value)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
        onChange(widths[next].value); bar.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
      }}>{width.label}</button>)}
  </div>;
}
