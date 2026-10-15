import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export function SidebarScrollArea({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ above: false, below: false });
  function refresh() {
    const el = scrollRef.current;
    if (!el) return;
    const above = el.scrollTop > 1;
    const below = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
    setEdges(previous => previous.above === above && previous.below === below ? previous : { above, below });
  }
  useLayoutEffect(() => {
    refresh();
    const observer = new ResizeObserver(refresh);
    if (scrollRef.current) observer.observe(scrollRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);
  return <div className="sidebar-scroll-frame" data-has-scroll={edges.below} data-has-scroll-above={edges.above}>
    <div className="sidebar-library" ref={scrollRef} onScroll={refresh} role="region" aria-label="Notas e coleções" tabIndex={0}>
      <div className="sidebar-scroll-content" ref={contentRef}>{children}</div>
    </div>
  </div>;
}
