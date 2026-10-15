import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Check, X } from './icons';

function duration(element: Element, token: string) {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  return (parseFloat(value) || 0) * (value.endsWith('ms') ? 1 : 1000);
}

export function TextSwap({ text }: { text: string }) {
  const initial = useRef(text);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let timer = 0;
    const settle = () => {
      clearTimeout(timer);
      el.textContent = text;
      el.classList.remove('is-exit', 'is-enter-start');
    };
    const onPreference = () => { if (motion.matches) settle(); };
    if (motion.matches || el.textContent === text) settle();
    else {
      el.classList.remove('is-enter-start');
      el.classList.add('is-exit');
      timer = window.setTimeout(() => {
        el.textContent = text;
        el.classList.remove('is-exit');
        el.classList.add('is-enter-start');
        void el.offsetHeight;
        el.classList.remove('is-enter-start');
      }, duration(el, '--text-swap-dur'));
    }
    motion.addEventListener('change', onPreference);
    return () => { clearTimeout(timer); motion.removeEventListener('change', onPreference); };
  }, [text]);
  // Only this component owns the visual text node. The live region receives
  // the real state immediately, independent of the animation's timing.
  return <><span className="sr-only">{text}</span><span ref={ref} className="t-text-swap" aria-hidden="true">{initial.current}</span></>;
}

export type ToastEvent = { id: number; message: string; kind: 'success' | 'error'; createdAt: number; action?: { label: string; onClick: () => void } };
type ToastItemProps = { event: ToastEvent; replaced: boolean; paused: boolean; reduced: boolean; onDismiss: (id: number) => void };
function ToastItem({ event, replaced, paused, reduced, onDismiss }: ToastItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [entering, setEntering] = useState(!reduced);
  const [closing, setClosing] = useState(false);
  const [actionUsed, setActionUsed] = useState(false);
  const remaining = useRef(event.kind === 'error' || event.action ? 5000 : 3000);
  const actionExecuted = useRef(false);
  const leaving = closing;
  const inactive = leaving || replaced;
  useEffect(() => {
    // Commit the entry pose even when the frame clock is throttled.
    if (ref.current) void ref.current.offsetHeight;
    setEntering(false);
  }, []);
  useEffect(() => {
    if (paused || inactive) return;
    const started = Date.now();
    const timer = window.setTimeout(() => setClosing(true), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [paused, inactive]);
  useEffect(() => {
    if (!replaced || closing) return;
    // First push the old banner back to depth 1 while the new one enters.
    // Hold it briefly behind the new banner after the stacking motion completes.
    if (reduced) { setClosing(true); return; }
    const timer = window.setTimeout(() => setClosing(true), duration(document.documentElement, '--stack-open') + duration(document.documentElement, '--stack-hold'));
    return () => window.clearTimeout(timer);
  }, [replaced, closing, reduced]);
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => onDismiss(event.id), reduced ? 0 : duration(document.documentElement, '--stack-close'));
    return () => window.clearTimeout(timer);
  }, [leaving, reduced, event.id, onDismiss]);
  return <div ref={ref} className={`t-stack-banner${entering ? ' is-enter' : ''}${leaving ? ' is-leaving' : ''}`} data-depth={replaced ? 1 : 0} aria-hidden={inactive || undefined} inert={inactive || undefined}>
    <div className="toast-content" data-kind={event.kind}>
      <span className="toast-icon" aria-hidden="true">{event.kind === 'error' ? <X size={16} /> : <Check size={16} />}</span>
      <span className="toast-message" role={event.kind === 'error' ? 'alert' : 'status'} aria-atomic="true">{event.message}</span>
      {event.action && <button type="button" className="toast-action" disabled={inactive || actionUsed} onClick={() => {
        if (inactive || actionExecuted.current) return;
        actionExecuted.current = true;
        setActionUsed(true);
        event.action!.onClick();
      }}>{event.action.label}</button>}
      <button type="button" className="toast-dismiss" aria-label={`Fechar notificação: ${event.message}`} onClick={() => setClosing(true)} disabled={inactive}><X size={14} /></button>
    </div>
  </div>;
}

export function ToastStack({ events, onDismiss }: { events: ToastEvent[]; onDismiss: (id: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const candidate = events.at(-1);
  const newestId = useRef(-1);
  if (candidate && candidate.id > newestId.current) newestId.current = candidate.id;
  // Dismissing the current toast must never bring an older event back.
  const latest = candidate?.id === newestId.current ? candidate : undefined;
  const [visible, setVisible] = useState<ToastEvent[]>(() => latest ? [latest] : []);
  useLayoutEffect(() => {
    setVisible(current => {
      if (!latest) return [];
      if (current.at(-1)?.id === latest.id) return current;
      const previous = current.at(-1);
      return previous ? [previous, latest] : [latest];
    });
  }, [latest]);
  const removeToast = useCallback((id: number) => {
    setVisible(current => current.filter(event => event.id !== id));
    onDismiss(id);
  }, [onDismiss]);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReduced(preference.matches);
    preference.addEventListener('change', changed);
    return () => preference.removeEventListener('change', changed);
  }, []);
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    setFocused(element.contains(document.activeElement));
    if (visible.length && !element.matches(':popover-open')) element.showPopover();
    else if (!visible.length) {
      if (element.matches(':popover-open')) element.hidePopover();
      setHovered(false);
      setFocused(false);
    }
  }, [visible.length, latest?.id]);
  useLayoutEffect(() => {
    const element = stack.current;
    if (!element) return;
    const measure = () => {
      const banners = [...element.querySelectorAll<HTMLElement>('.t-stack-banner')];
      const frontHeight = banners.at(-1)?.offsetHeight || 52;
      element.style.setProperty('--stack-front-height', `${frontHeight}px`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    for (const banner of element.querySelectorAll('.t-stack-banner')) observer.observe(banner);
    return () => observer.disconnect();
  }, [visible]);
  return <div ref={container} popover="manual" className="toast-position" aria-label="Notificações" tabIndex={visible.length ? 0 : -1}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="toast-stack">
      <div ref={stack} className="t-stack">
      {visible.map(event => <ToastItem key={event.id} event={event} replaced={event.id !== latest?.id} reduced={reduced} paused={hovered || focused} onDismiss={removeToast} />)}
    </div></div>
  </div>;
}
