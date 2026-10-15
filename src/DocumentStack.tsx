import type { CSSProperties } from 'react';
import { DocumentTextIcon } from '@solar-icons/react/line-duotone/document-text';

/** Decorative document fan; the card itself owns focus and navigation. */
export function DocumentStack({ count }: { count: number }) {
  const visibleCount = Math.min(5, Math.max(1, Math.floor(count)));
  return <span className="document-stack" aria-hidden="true">
    {Array.from({ length: visibleCount }, (_, index) => {
      const depth = visibleCount - index - 1;
      const side = depth % 2 === 0 ? -1 : 1;
      const spread = Math.ceil(depth / 2);
      const style = {
        '--x': `${depth === 0 ? 0 : side * spread * 9}px`,
        '--y': `${depth === 0 ? -1 : spread * 3}px`,
        '--r': `${depth === 0 ? 0 : side * spread * 10}deg`,
        '--open-x': `${depth === 0 ? 0 : side * spread * 12}px`,
        '--open-y': `${depth === 0 ? -5 : (spread - 1) * 3}px`,
        '--open-r': `${depth === 0 ? 0 : side * spread * 12}deg`,
      } as CSSProperties;
      return <span key={depth} data-sheet={depth === 0 ? 'front' : depth % 2 ? 'side' : 'back'} className="document-sheet" style={style}>
        <DocumentTextIcon size={64} color="var(--muted)" secondaryColor="var(--line)" secondaryOpacity={1} />
      </span>;
    })}
  </span>;
}
