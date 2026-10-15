import { useLayoutEffect, useRef, type ComponentProps, type ReactNode } from 'react';

type Props = Omit<ComponentProps<'dialog'>, 'open' | 'onCancel' | 'onClose' | 'children'> & {
  open: boolean;
  onDismiss: () => void;
  onAfterClose?: () => void;
  children: ReactNode;
};

function canScrollModal(target: EventTarget | null, delta: number) {
  const modals = document.querySelectorAll<HTMLDialogElement>('dialog:modal');
  const modal = modals[modals.length - 1];
  if (!modal) return true;
  let element = target instanceof Element ? target : null;
  if (!element || !modal.contains(element)) return false;
  while (element) {
    const overflow = getComputedStyle(element).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && element.scrollHeight > element.clientHeight) {
      if (delta < 0 && element.scrollTop > 0) return true;
      if (delta > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) return true;
    }
    if (element === modal) break;
    element = element.parentElement;
  }
  return false;
}

export function AnimatedDialog({ open, onDismiss, onAfterClose, children, className = '', ...props }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef(children);
  const retainedClassName = useRef(className);
  if (open) {
    content.current = children;
    retainedClassName.current = className;
  }

  useLayoutEffect(() => {
    // Native dialog makes the background inert, but wheel/touch can still scroll it.
    // Keep these guards through the closing animation; :modal is the source of truth.
    let touchY = 0;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !canScrollModal(event.target, event.deltaY)) event.preventDefault();
    };
    const touchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const touchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const nextY = event.touches[0].clientY;
      if (!canScrollModal(event.target, touchY - nextY)) event.preventDefault();
      touchY = nextY;
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === ' ' && event.target instanceof Element && event.target.closest('button')) return;
      const direction = ['ArrowDown', 'PageDown', 'End', ' '].includes(event.key) ? 1
        : ['ArrowUp', 'PageUp', 'Home'].includes(event.key) ? -1 : 0;
      if (direction && !canScrollModal(event.target, event.key === ' ' && event.shiftKey ? -1 : direction)) event.preventDefault();
    };
    document.addEventListener('wheel', wheel, { passive: false });
    document.addEventListener('touchstart', touchStart, { passive: true });
    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('keydown', keyDown);
    return () => {
      document.removeEventListener('wheel', wheel);
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('keydown', keyDown);
    };
  }, []);

  useLayoutEffect(() => {
    const element = dialog.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let timer = 0;
    const finish = () => {
      element.close();
      element.classList.remove('is-open', 'is-closing');
    };
    if (open) {
      element.classList.remove('is-closing');
      if (!element.open) element.showModal();
      void element.offsetHeight;
      if (motion.matches) element.classList.add('is-open');
      else frame = requestAnimationFrame(() => element.classList.add('is-open'));
    } else if (element.open) {
      element.classList.remove('is-open');
      element.classList.add('is-closing');
      const duration = getComputedStyle(element).getPropertyValue('--modal-close-dur').trim();
      const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
      if (motion.matches) finish();
      else timer = window.setTimeout(finish, milliseconds || 150);
    }
    const onMotion = () => {
      if (!motion.matches) return;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      if (open) element.classList.add('is-open');
      else if (element.open) finish();
    };
    motion.addEventListener('change', onMotion);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      motion.removeEventListener('change', onMotion);
    };
  }, [open]);

  return <dialog {...props} ref={dialog} className={`t-modal ${open ? className : retainedClassName.current}`}
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClose={onAfterClose}>
    {open ? children : content.current}
  </dialog>;
}
