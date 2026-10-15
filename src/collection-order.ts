import type { Notebook } from './data';

export function orderCollections(collections: Notebook[]): Notebook[] {
  // Older collections were appended without a creation date.
  return collections.map((collection, index) => ({ collection, index }))
    .sort((a, b) => Number(!!b.collection.pinned) - Number(!!a.collection.pinned)
      || (b.collection.createdAt ?? 0) - (a.collection.createdAt ?? 0)
      || b.index - a.index)
    .map(({ collection }) => collection);
}
