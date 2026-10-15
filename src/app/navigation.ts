import type { MouseEvent as ReactMouseEvent } from 'react';
import type { AppData } from '../data';

export type AppRoute = { view: string; selected: string | null; activeFolder: string | null };
export type HistoryMode = 'push' | 'replace';

export function routeFromLocation(data: AppData): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  if (path === '/' || path === '/library') {
    const tab = params.get('tab');
    return { view: tab === 'favorites' ? 'favorites' : 'all', selected: null, activeFolder: null };
  }
  if (path === '/archive') return { view: 'archive', selected: null, activeFolder: null };
  if (path === '/deleted') return { view: 'trash', selected: null, activeFolder: null };

  const noteMatch = path.match(/^\/n\/([^/]+)$/);
  if (noteMatch) {
    const id = decodeURIComponent(noteMatch[1]);
    const note = data.notes.find(item => item.id === id);
    if (!note) return { view: 'not-found', selected: null, activeFolder: null };
    const collectionExists = data.collections.some(item => item.id === note.collection);
    const view = note.deleted ? 'trash' : note.archived ? 'archive' : collectionExists ? note.collection : 'all';
    return { view, selected: note.id, activeFolder: note.folder || null };
  }

  const collectionMatch = path.match(/^\/c\/([^/]+)$/);
  if (collectionMatch) {
    const id = decodeURIComponent(collectionMatch[1]);
    const collection = data.collections.find(item => item.id === id);
    if (!collection) return { view: 'not-found', selected: null, activeFolder: null };
    const requestedFolder = params.get('folder');
    const folder = requestedFolder
      ? data.folders.find(item => item.id === requestedFolder && item.collectionId === collection.id)
      : null;
    if (requestedFolder && !folder) return { view: 'not-found', selected: null, activeFolder: null };
    return { view: collection.id, selected: null, activeFolder: folder?.id || null };
  }

  return { view: 'not-found', selected: null, activeFolder: null };
}

export function hrefForRoute(route: AppRoute) {
  if (route.selected) return `/n/${encodeURIComponent(route.selected)}`;
  if (route.view === 'favorites') return '/library?tab=favorites';
  if (route.view === 'all') return '/library?tab=collections';
  if (route.view === 'archive') return '/archive';
  if (route.view === 'trash') return '/deleted';
  if (route.view === 'not-found') return '/library?tab=collections';
  const folder = route.activeFolder ? `?folder=${encodeURIComponent(route.activeFolder)}` : '';
  return `/c/${encodeURIComponent(route.view)}${folder}`;
}

export function handleInternalLink(event: ReactMouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate();
}
