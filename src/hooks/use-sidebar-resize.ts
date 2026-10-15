import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

const STORAGE_KEY = 'open-notes-sidebar-width';
const MIN_WIDTH = 220;
const DEFAULT_WIDTH = 258;

function maxWidth() {
  if (window.innerWidth <= 700) return 480;
  return Math.max(MIN_WIDTH, Math.min(480, window.innerWidth - 360));
}

function clampWidth(width: number) {
  return Math.round(Math.min(maxWidth(), Math.max(MIN_WIDTH, width)));
}

export function useSidebarResize() {
  const [width, setWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (saved > 0 && Number.isFinite(saved)) return clampWidth(saved);
    } catch { /* Resizing remains available without storage. */ }
    return clampWidth(window.innerWidth > 700 && window.innerWidth <= 800 ? 240 : DEFAULT_WIDTH);
  });
  const [resizing, setResizing] = useState(false);
  const drag = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(width)); } catch { /* Keep the session preference. */ }
  }, [width]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 700) setWidth(current => clampWidth(current));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!resizing) return;
    document.body.classList.add('sidebar-is-resizing');
    return () => document.body.classList.remove('sidebar-is-resizing');
  }, [resizing]);

  function endDrag() {
    drag.current = null;
    setResizing(false);
  }

  return {
    resizing,
    style: { '--sidebar-preferred-width': `${width}px` } as CSSProperties,
    separatorProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-label': 'Redimensionar menu lateral',
      'aria-orientation': 'vertical' as const,
      'aria-valuemin': MIN_WIDTH,
      'aria-valuemax': maxWidth(),
      'aria-valuenow': width,
      'aria-valuetext': `${width} pixels`,
      onPointerDown(event: PointerEvent<HTMLDivElement>) {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width };
        setResizing(true);
      },
      onPointerMove(event: PointerEvent<HTMLDivElement>) {
        if (drag.current?.pointerId !== event.pointerId) return;
        setWidth(clampWidth(drag.current.startWidth + event.clientX - drag.current.startX));
      },
      onPointerUp(event: PointerEvent<HTMLDivElement>) {
        if (drag.current?.pointerId !== event.pointerId) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        endDrag();
      },
      onPointerCancel: endDrag,
      onLostPointerCapture: endDrag,
      onDoubleClick: () => setWidth(clampWidth(DEFAULT_WIDTH)),
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const step = event.shiftKey ? 32 : 8;
        const next = event.key === 'ArrowLeft' ? width - step
          : event.key === 'ArrowRight' ? width + step
          : event.key === 'Home' ? MIN_WIDTH
          : event.key === 'End' ? maxWidth()
          : null;
        if (next === null) return;
        event.preventDefault();
        setWidth(clampWidth(next));
      },
    },
  };
}
