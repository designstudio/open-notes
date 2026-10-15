const STORAGE_KEY = 'open-notes-sidebar-state';

export type SidebarState = {
  collapsed: boolean;
  collectionsOpen: boolean;
  pinnedOpen: boolean;
  recentOpen: boolean;
  expandedCollections: string[];
};

export function readSidebarState(): SidebarState {
  const defaults: SidebarState = {
    collapsed: false, collectionsOpen: true, pinnedOpen: true, recentOpen: true, expandedCollections: [],
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return defaults;
    return {
      collapsed: typeof saved.collapsed === 'boolean' ? saved.collapsed : defaults.collapsed,
      collectionsOpen: typeof saved.collectionsOpen === 'boolean' ? saved.collectionsOpen : defaults.collectionsOpen,
      pinnedOpen: typeof saved.pinnedOpen === 'boolean' ? saved.pinnedOpen : defaults.pinnedOpen,
      recentOpen: typeof saved.recentOpen === 'boolean' ? saved.recentOpen : defaults.recentOpen,
      expandedCollections: Array.isArray(saved.expandedCollections)
        ? [...new Set<string>(saved.expandedCollections.filter((id: unknown) => typeof id === 'string'))]
        : [],
    };
  } catch {
    return defaults;
  }
}

export function saveSidebarState(state: SidebarState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* Sidebar controls still work when storage is unavailable. */ }
}
