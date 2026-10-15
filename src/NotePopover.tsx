import { useState, type ReactNode } from 'react';
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole, useTransitionStyles } from '@floating-ui/react';
import { useReducedMotion } from 'framer-motion';

export function NotePopover({ label, className = '', trigger, children }: {
  label: string; className?: string;
  trigger: (props: Record<string, unknown>, open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const { refs, floatingStyles, context } = useFloating({ open, onOpenChange: setOpen, placement: 'bottom-start', strategy: 'fixed', middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })], whileElementsMounted: autoUpdate });
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context)]);
  const tokens = getComputedStyle(document.documentElement);
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: reduced ? 0 : { open: parseFloat(tokens.getPropertyValue('--dropdown-open-dur')) || 250, close: parseFloat(tokens.getPropertyValue('--dropdown-close-dur')) || 150 },
    initial: { opacity: 0, transform: 'scale(var(--dropdown-pre-scale))' }, open: { opacity: 1, transform: 'scale(1)' }, close: { opacity: 0, transform: 'scale(var(--dropdown-closing-scale))' },
    common: ({ side }) => ({ transformOrigin: `${side === 'top' ? 'bottom' : 'top'} left`, transitionTimingFunction: 'var(--dropdown-ease)' }),
  });
  return <>
    {trigger({ ...getReferenceProps(), ref: refs.setReference, 'aria-expanded': open }, open)}
    {isMounted && <FloatingPortal><FloatingFocusManager context={context} modal={false} initialFocus={-1} closeOnFocusOut={false} disabled={!open}>
      <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="note-popover-positioner" aria-label={label} inert={!open} aria-hidden={!open}>
        <div className={`note-popover-surface ${className}`} style={styles}>{children(() => setOpen(false))}</div>
      </div>
    </FloatingFocusManager></FloatingPortal>}
  </>;
}
