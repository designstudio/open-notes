import type { AppData } from '../data';
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
