import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { Placement } from '@floating-ui/react';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/tiptap-ui-primitive/tooltip/tooltip';

type Props = ComponentPropsWithoutRef<'button'> & { tooltipPlacement?: Placement; shortcut?: string };

/** Keeps the native button and its layout; the tooltip is rendered in a portal. */
export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { title, children, type = 'button', tooltipPlacement = 'top', shortcut, ...props }, ref,
) {
  const label = title || props['aria-label'];
  return <Tooltip placement={tooltipPlacement}>
    <TooltipTrigger asChild>
      <button {...props} ref={ref} type={type}>{children}</button>
    </TooltipTrigger>
    <TooltipContent>{shortcut ? <span className="icon-button-tooltip"><span>{label}</span><kbd className="icon-button-tooltip-shortcut">{shortcut}</kbd></span> : label}</TooltipContent>
  </Tooltip>;
});
