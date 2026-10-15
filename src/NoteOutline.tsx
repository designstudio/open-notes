import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { Editor } from '@tiptap/react';

type OutlineHeading = {
  id: string;
  level: number;
  title: string;
};

const headingSelector = 'h1, h2, h3, h4, h5, h6';

export function NoteOutline({ editor, noteTitle }: { editor: Editor; noteTitle: string }) {
  const [contentHeadings, setHeadings] = useState<OutlineHeading[]>([]);
  const headings = useMemo(() => [{ id: 'note-title', level: 1, title: noteTitle.trim() || 'Sem título' }, ...contentHeadings], [noteTitle, contentHeadings]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pointerRatio, setPointerRatio] = useState<number | null>(null);
  const frame = useRef<number | null>(null);

  const updateActiveHeading = useCallback(() => {
    const elements = Array.from(editor.view.dom.querySelectorAll<HTMLElement>(headingSelector)).filter(element => element.textContent?.trim());

    const readingLine = Math.min(160, window.innerHeight * 0.28);
    let activeIndex = 0;
    elements.forEach((element, index) => {
      if (element.getBoundingClientRect().top <= readingLine) activeIndex = index + 1;
    });
    const page = editor.view.dom.closest<HTMLElement>('.app-shell');
    if (page && page.scrollTop <= 1) {
      activeIndex = 0;
    } else if (page && page.scrollHeight > page.clientHeight + 2 &&
      page.clientHeight + page.scrollTop >= page.scrollHeight - 2) {
      activeIndex = headings.length - 1;
    }
    setActiveId(headings[activeIndex]?.id ?? null);
  }, [editor, headings]);

  useEffect(() => {
    const collectHeadings = () => {
      const next: OutlineHeading[] = [];
      editor.state.doc.descendants((node, position) => {
        if (node.type.name !== 'heading') return;
        const title = node.textContent.trim();
        if (!title) return;
        next.push({
          id: `heading-${position}`,
          level: Number(node.attrs.level) || 2,
          title,
        });
      });
      setHeadings(current => current.length === next.length && current.every((heading, index) =>
        heading.id === next[index].id && heading.level === next[index].level && heading.title === next[index].title
      ) ? current : next);
    };

    collectHeadings();
    editor.on('update', collectHeadings);
    return () => { editor.off('update', collectHeadings); };
  }, [editor]);

  useEffect(() => {
    const scheduleUpdate = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        updateActiveHeading();
      });
    };
    scheduleUpdate();
    const page = editor.view.dom.closest<HTMLElement>('.app-shell');
    page?.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      page?.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [updateActiveHeading]);

  if (headings.length < 2) return null;

  const density = headings.length > 24 ? 'dense' : headings.length > 12 ? 'compact' : 'regular';

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointerRatio(Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)));
  }

  function jumpToHeading(index: number) {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (index === 0) {
      editor.view.dom.closest<HTMLElement>('.app-shell')?.scrollTo({ top: 0, behavior });
      return;
    }
    const target = Array.from(editor.view.dom.querySelectorAll<HTMLElement>(headingSelector)).filter(element => element.textContent?.trim())[index - 1];
    if (!target) return;
    target.scrollIntoView({
      behavior,
      block: 'start',
    });
  }

  return (
    <div className="note-outline-slot">
      <nav
        className="note-outline"
        data-density={density}
        aria-label="Navegação pelos títulos da nota"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setPointerRatio(null)}
      >
        {headings.map((heading, index) => {
          const pointerIndex = pointerRatio === null ? null : pointerRatio * headings.length - 0.5;
          const proximity = pointerIndex === null ? 0 : Math.max(0, 1 - Math.abs(pointerIndex - index) / 3);
          const baseWidth = heading.level === 1 ? 16 : heading.level === 2 ? 12 : heading.level === 3 ? 10 : 8;
          const isActive = activeId === heading.id;
          const width = Math.max(isActive ? 20 : 0, Math.round(baseWidth + proximity * 18));
          const style = {
            '--outline-width': `${width}px`,
          } as CSSProperties;

          return (
            <button
              key={heading.id}
              type="button"
              className={`note-outline-item ${isActive ? 'is-active' : ''}`}
              style={style}
              aria-label={`Ir para o título “${heading.title}”`}
              aria-current={isActive ? 'location' : undefined}
              onClick={() => jumpToHeading(index)}
            >
              <span className="note-outline-mark" aria-hidden="true" />
              <span className="note-outline-tooltip t-tt" aria-hidden="true">{heading.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
