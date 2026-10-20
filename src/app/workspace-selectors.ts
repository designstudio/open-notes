import type { AppData, Note } from '../data';
import { orderCollections } from '../collection-order';

export function selectWorkspace(data: AppData, view: string) {
  const archivedCollectionIds = new Set(data.collections.filter(c => c.archived).map(c => c.id));
  const visibleCollections = orderCollections(data.collections.filter(c => !c.archived));
  const listedCollections = view === 'archive' ? orderCollections(data.collections.filter(c => c.archived)) : visibleCollections;
  const active = data.notes.filter(n => !n.deleted && !n.archived && !archivedCollectionIds.has(n.collection));
  const recent = [...active].sort((a, b) => b.updated - a.updated);
  const collectionIds = new Set(data.collections.map(c => c.id));
  const sidebarRecent = recent.filter(n => !collectionIds.has(n.collection));
  return { archivedCollectionIds, visibleCollections, listedCollections, active, recent, sidebarRecent };
}
export type Workspace = ReturnType<typeof selectWorkspace>;

/** Single pass over the workspace for the sidebar counters and expanded lists. */
export function groupNotesByCollection(notes: readonly Note[]) {
  const grouped = new Map<string, Note[]>();
  for (const note of notes) {
    const bucket = grouped.get(note.collection);
    if (bucket) bucket.push(note);
    else grouped.set(note.collection, [note]);
  }
  return grouped;
}
