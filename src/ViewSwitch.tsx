import { IconButton } from './IconButton';
import { useLayoutEffect, useRef } from 'react';
import { Grid2X2, List } from './icons';
import type { NotesLayout } from './notes-list-state';

export function ViewSwitch({ value, onChange }: { value: NotesLayout; onChange: (value: NotesLayout) => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  useLayoutEffect(() => {
    const element = bar.current!;
    const pill = element.querySelector<HTMLElement>('.t-tabs-pill')!;
    const move = (animate: boolean) => {
      const active = element.querySelector<HTMLButtonElement>('[aria-pressed="true"]')!;
      if (!animate) pill.style.transition = 'none';
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
      pill.style.height = `${active.offsetHeight}px`;
      pill.style.top = `${active.offsetTop}px`;
      if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
    };
    move(initialized.current);
    initialized.current = true;
    const onResize = () => move(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [value]);
  return <div ref={bar} className="view-switch t-tabs" role="group" aria-label="Visualização das notas">
    <span className="t-tabs-pill" aria-hidden="true" />
    <IconButton className="t-tab" aria-label="Visualização em lista" aria-pressed={value === 'list'} onClick={() => onChange('list')}><List size={16} /></IconButton>
    <IconButton className="t-tab" aria-label="Visualização em grade" aria-pressed={value === 'grid'} onClick={() => onChange('grid')}><Grid2X2 size={15} /></IconButton>
  </div>;
}
