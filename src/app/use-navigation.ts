import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { AppData } from '../data';
import type { SidebarState } from './use-sidebar';
import { routeFromLocation, hrefForRoute, type AppRoute, type HistoryMode } from './navigation';

type NavigationOptions = Pick<SidebarState, 'setSidebar' | 'setExpandedCollections'> & {
  setSearch: Dispatch<SetStateAction<string>>;
};

export function useNavigation(data: AppData, { setSidebar, setExpandedCollections, setSearch }: NavigationOptions) {
  const initialRoute = useRef<AppRoute | null>(null);
  if (!initialRoute.current) initialRoute.current = routeFromLocation(data);
  const [view, setView] = useState(initialRoute.current.view);
  const [selected, setSelected] = useState<string | null>(initialRoute.current.selected);
  const [activeFolder, setActiveFolder] = useState<string | null>(initialRoute.current.activeFolder);
  useLayoutEffect(() => {
    document.querySelector('.app-shell')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view, selected, activeFolder]);
  const dataRef = useRef(data);
  dataRef.current = data;
  useEffect(() => {
    const applyLocation = () => {
      const route = routeFromLocation(dataRef.current);
      setView(route.view);
      setSelected(route.selected);
      setActiveFolder(route.activeFolder);
      const routedNote = route.selected ? dataRef.current.notes.find(item => item.id === route.selected) : null;
      const routedCollection = dataRef.current.collections.some(item => item.id === route.view)
        ? route.view
        : routedNote && dataRef.current.collections.some(item => item.id === routedNote.collection)
        ? routedNote.collection
        : null;
      if (routedCollection) {
        setExpandedCollections(current => {
          if (current.has(routedCollection)) return current;
          const next = new Set(current);
          next.add(routedCollection);
          return next;
        });
      }
      setSearch('');
      setSidebar(false);
    };
    const currentRoute = routeFromLocation(dataRef.current);
    if (currentRoute.view !== 'not-found') {
      const canonical = hrefForRoute(currentRoute);
      if (`${window.location.pathname}${window.location.search}` !== canonical) {
        window.history.replaceState(null, '', canonical);
      }
    }
    window.addEventListener('popstate', applyLocation);
    return () => window.removeEventListener('popstate', applyLocation);
  }, []);
  function commitRoute(route: AppRoute, mode: HistoryMode = 'push') {
    const href = hrefForRoute(route);
    if (`${window.location.pathname}${window.location.search}` !== href) {
      window.history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', href);
    }
    setView(route.view);
    setSelected(route.selected);
    setActiveFolder(route.activeFolder);
    setSearch('');
    setSidebar(false);
  }
  function navigate(next: string, mode: HistoryMode = 'push') {
    commitRoute({ view: next, selected: null, activeFolder: null }, mode);
  }
  function openNote(id: string, mode: HistoryMode = 'push') {
    const target = data.notes.find(item => item.id === id);
    if (!target) return;
    const collectionExists = data.collections.some(item => item.id === target.collection);
    const targetView = target.deleted ? 'trash' : target.archived ? 'archive' : collectionExists ? target.collection : 'all';
    if (collectionExists && !target.deleted && !target.archived) {
      setExpandedCollections(current => {
        if (current.has(target.collection)) return current;
        const next = new Set(current);
        next.add(target.collection);
        return next;
      });
    }
    commitRoute({ view: targetView, selected: target.id, activeFolder: target.folder || null }, mode);
  }
  function openCollection(collectionId: string, folderId: string | null = null, mode: HistoryMode = 'push') {
    setExpandedCollections(current => {
      if (current.has(collectionId)) return current;
      const next = new Set(current);
      next.add(collectionId);
      return next;
    });
    commitRoute({ view: collectionId, selected: null, activeFolder: folderId }, mode);
  }
  function toggleCollection(collectionId: string) {
    const isCollectionHome = view === collectionId && !selected && !activeFolder;
    if (!isCollectionHome) {
      openCollection(collectionId);
      return;
    }
    setExpandedCollections(current => {
      const next = new Set(current);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
    commitRoute({ view: collectionId, selected: null, activeFolder: null });
  }
  return { view, selected, activeFolder, commitRoute, navigate, openNote, openCollection, toggleCollection };
}
