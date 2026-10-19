import type { AppData } from '../src/data';

// Fixed content, IDs and dates make runs comparable. Never import a user export.
export function makeWorkspace(count: number): AppData {
  const paragraph = 'Conteúdo sintético para medir escrita, leitura e pesquisa no Open Notes. ';
  return {
    collections: [{ id: 'benchmark', name: 'Coleção sintética', color: 'blue' }],
    folders: Array.from({ length: 10 }, (_, i) => ({ id: `folder-${i}`, name: `Pasta ${i}`, collectionId: 'benchmark' })),
    notes: Array.from({ length: count }, (_, i) => {
      const title = `Nota sintética ${String(i).padStart(5, '0')}`;
      const body = `${i % 100 === 0 ? 'agulha-benchmark ' : ''}${paragraph.repeat(16)}`.slice(0, 1024);
      return {
        id: `bench-${i}`, title, body,
        document: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }] },
        collection: 'benchmark', folder: `folder-${i % 10}`, tags: ['benchmark', `grupo-${i % 20}`],
        favorite: i % 10 === 0, archived: false, deleted: false,
        updated: 1_760_000_000_000 - ((i * 7919) % count) * 1000, icon: 'file',
      };
    }),
  };
}
