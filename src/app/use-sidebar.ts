import { useEffect, useState } from 'react';
import { readSidebarState, saveSidebarState } from '../sidebar-state';
import { useSidebarResize } from '../hooks/use-sidebar-resize';

export function useSidebar() {
  const [initialSidebarState] = useState(readSidebarState);
  const [collapsed, setCollapsed] = useState(initialSidebarState.collapsed);
  const sidebarResize = useSidebarResize();
  const [sidebar, setSidebar] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(() => new Set(initialSidebarState.expandedCollections));
  const [collectionsOpen, setCollectionsOpen] = useState(initialSidebarState.collectionsOpen);
  const [pinnedOpen, setPinnedOpen] = useState(initialSidebarState.pinnedOpen);
  const [recentOpen, setRecentOpen] = useState(initialSidebarState.recentOpen);
  useEffect(() => {
    saveSidebarState({ collapsed, collectionsOpen, pinnedOpen, recentOpen, expandedCollections: [...expandedCollections] });
  }, [collapsed, collectionsOpen, pinnedOpen, recentOpen, expandedCollections]);
  function toggleSidebar(nextCollapsed: boolean) {
    setCollapsed(nextCollapsed);
    setSidebar(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(
      matchMedia('(max-width:700px)').matches ? '.mobile-menu' : nextCollapsed ? '.sidebar-rail-toggle' : '.sidebar-collapse-toggle'
    )?.focus({ preventScroll: true }));
  }
  return { collapsed, setCollapsed, sidebar, setSidebar, sidebarResize, expandedCollections, setExpandedCollections, collectionsOpen, setCollectionsOpen, pinnedOpen, setPinnedOpen, recentOpen, setRecentOpen, toggleSidebar };
}
export type SidebarState = ReturnType<typeof useSidebar>;
