import { useEffect, useLayoutEffect, useRef } from 'react';

type View = 'favorites' | 'all';
const tabs = [{ view: 'favorites', label: 'Favoritos' }, { view: 'all', label: 'Coleções' }] as const;

export function LibraryTabs({ active, onChange }: { active: View; onChange: (view: View) => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const initialized = useRef(false);

  function position(animate: boolean) {
    const tab = bar.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    const indicator = pill.current;
    if (!tab || !indicator) return;
    const previous = indicator.style.transition;
    if (!animate) indicator.style.transition = 'none';
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    indicator.style.width = `${tab.offsetWidth}px`;
    if (!animate) { void indicator.offsetWidth; indicator.style.transition = previous; }
  }

  useLayoutEffect(() => {
    position(initialized.current);
    initialized.current = true;
  }, [active]);

  useEffect(() => {
    let live = true;
    const snap = () => { if (live) position(false); };
    document.fonts?.ready.then(snap).catch(() => {});
    window.addEventListener('resize', snap);
    return () => { live = false; window.removeEventListener('resize', snap); };
  }, []);

  return <div ref={bar} className="library-tabs" role="tablist" aria-label="Seções da Biblioteca">
    <span ref={pill} className="t-tabs-pill" aria-hidden="true" />
    {tabs.map((tab, index) => <button key={tab.view} className="t-tab" type="button" role="tab"
      aria-selected={active === tab.view} tabIndex={active === tab.view ? 0 : -1}
      onClick={() => onChange(tab.view)} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        onChange(tabs[next].view);
        bar.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
      }}>{tab.label}</button>)}
  </div>;
}
