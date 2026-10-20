import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DocumentText, Folder, Plus } from './icons';
import './create-menu.css';

/* Adapted from Bencho's MIT-licensed Create menu (bencho.dev/licence).
   One shape, and no filter on it — the other studies fuse two
   or more shapes, this has exactly one, so a blur could only
   damage it. The liquid here is entirely in the timing: the
   press sinks, and the spread starts while the sink is still
   running so there is never a still frame.

   The pill's width is measured from its own label and written
   back as --pill-w, so the label can change without the shape
   jumping. */

/* The elastic, as specified: ζ = 14 / (2·√(220·0.5)) ≈ 0.67,
   so it overshoots about 6% before it settles. A deliberate
   bounce, not a wobble. */
const LIQUID = { type: 'spring' as const, stiffness: 220, damping: 14, mass: 0.5 };

/* For shapes whose corner radius is animating: a spring that
   passes its target drags the radius past it too, and corners
   that dip under and come back read as a wobble rather than
   as a bounce.
   Stiffness comes up with the damping instead, which holds ζ
   at 1.03 — no overshoot, and it lands in about 180ms. */
const LIQUID_STILL = { ...LIQUID, stiffness: 420, damping: 30 };

type Props = {
  onNote: () => void;
  onContainer: () => void;
  containerLabel: 'Nova coleção' | 'Nova pasta';
};

export function CreateMenu({ onNote, onContainer, containerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [sink, setSink] = useState(false);
  const [sayW, setSayW] = useState(32);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const say = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const beat = useRef(0);
  const openingIndex = useRef(0);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const closeToken = getComputedStyle(document.documentElement).getPropertyValue('--dropdown-close-dur').trim();
  const closeDuration = closeToken.endsWith('ms') ? parseFloat(closeToken) / 1000 : parseFloat(closeToken);

  /* MEASURE TWICE: ONCE NOW, ONCE THE FONT IS REAL.
     offsetWidth is an integer and the label is not. The +1
     covers the rounding error. Measure again when fonts are
     ready so the fallback face cannot clip the final letter. */
  useLayoutEffect(() => {
    let live = true;
    const measure = () => { if (live && say.current) setSayW(say.current.offsetWidth + 1); };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => () => window.clearTimeout(beat.current), []);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => items.current[openingIndex.current]?.focus({ preventScroll: true }));
    /* Anywhere but the visible menu puts it away. Register
       only while open so the press that opened it cannot
       close it on the same click. */
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('pointerdown', away); };
  }, [open]);

  function close(returnFocus = false) {
    window.clearTimeout(beat.current);
    setSink(false);
    setOpen(false);
    if (returnFocus) trigger.current?.focus({ preventScroll: true });
  }
  function press(index = 0) {
    openingIndex.current = index;
    window.clearTimeout(beat.current);
    if (reducedMotion) { setOpen(true); return; }
    setSink(true);
    /* 60ms handoff against a 120ms sink: the spread begins
       while the press is still running. There is no still frame. */
    beat.current = window.setTimeout(() => { setSink(false); setOpen(true); }, 60);
  }

  /* Glyph + gap + label + the padding either side. */
  const pillW = 18 + 8 + sayW + 28;
  const options = [
    { label: 'Nova nota', icon: DocumentText, action: onNote },
    { label: containerLabel, icon: Folder, action: onContainer },
  ];
  /* Concentric corners: the panel's 24px less its 10px inset.
     The shut pill is 38px tall, so 19px is fully round. */
  return <div ref={root} className="crt-stage" data-open={open || undefined} data-sink={sink || undefined}
    style={{ '--pill-w': `${pillW}px`, '--panel-h': `${24 + options.length * 34 + (options.length - 1) * 2}px`, '--crt-row-r': '14px' } as CSSProperties}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
    }}>
    <div className="crt-blobs" aria-hidden="true">
      {/* LIQUID_STILL, not LIQUID. A spring past the target
          takes the corner radius with it — the corners dip
          and come back, which is a wobble, not a bounce. */}
      <motion.div className="crt-body" initial={false}
        animate={{ width: open ? 160 : pillW, height: open ? 94 : 38, borderRadius: open ? 24 : 19 }}
        transition={reducedMotion ? { duration: 0 } : open ? LIQUID_STILL : { duration: Number.isFinite(closeDuration) ? closeDuration : 0.15, ease: [0.22, 1, 0.36, 1] }} />
    </div>
    <button ref={trigger} type="button" className="crt-pill" aria-label="Novo item" aria-haspopup="menu" aria-expanded={open} aria-controls={id}
      tabIndex={open ? -1 : 0} onClick={() => open ? close(true) : press()}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); press(event.key === 'ArrowUp' ? options.length - 1 : 0); }
      }}>
      <span className="crt-glyph" aria-hidden="true"><Plus size={15} /></span>
      <span className="crt-say" style={{ width: sayW }}><span ref={say}>Novo</span></span>
    </button>
    <div className="crt-panel" inert={!open} aria-hidden={!open}>
      {/* Each row lights its own wash; nothing travels between them. */}
      <ul id={id} className="crt-menu" role="menu" aria-label="Criar novo item">
        {options.map((option, index) => <li key={option.label} className="crt-item" role="none"
          style={{ transitionDelay: open && !reducedMotion ? `${30 + index * 40}ms` : '0ms' }}>
          <button ref={element => { items.current[index] = element; }} type="button" role="menuitem" tabIndex={open ? 0 : -1}
            onClick={() => { close(true); option.action(); }}
            onKeyDown={event => {
              const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
              if (direction || event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + direction + options.length) % options.length;
                items.current[next]?.focus();
              }
            }}>
            <option.icon size={16} aria-hidden="true" />{option.label}
          </button>
        </li>)}
      </ul>
    </div>
  </div>;
}
