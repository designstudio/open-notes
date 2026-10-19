import { initialNotes, type AppData } from '../../src/data';
import { LOCAL_MIGRATIONS } from '../../src/storage/migrations';
import type { DatabaseMigration, MigrationContext } from '../../src/storage/migration-runner';
import { validateGranularDatabase } from '../../src/storage/integrity';
import { workspaceMetadata } from '../../src/storage/schema';

// Deliberately outside src/: these versions never enter the production plan.
export const migrationSpace = (count = 3): AppData => ({
  notes: Array.from({ length: count }, (_, index) => ({
    ...structuredClone(initialNotes[0]), id: `note-${index}`, title: `Nota ${index}`,
    collection: 'collection', folder: 'folder', updated: 1000 + index,
    document: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `Documento ${index}` }] }] },
  })),
  collections: [{ id: 'collection', name: 'Coleção', color: 'sage' }],
  folders: [{ id: 'folder', name: 'Pasta', collectionId: 'collection' }],
  profile: { name: 'Perfil sintético', photo: 'data:image/png;base64,YQ==' },
});

function rewriteNotes(context: MigrationContext, version: number, patch: Record<string, unknown>, done: () => void) {
  const notes = context.transaction.objectStore('notes');
  const metadata = context.transaction.objectStore('metadata');
  context.request(notes.getAll(), values => {
    for (const value of values) notes.put({ ...value, ...patch });
    context.request(metadata.get('schema'), schema => {
      if (schema !== undefined) metadata.put(version, 'schema');
      done();
    });
  });
}

function validateFuture(context: MigrationContext, version: number, done: () => void) {
  validateGranularDatabase(context, version, () => {
    context.request(context.transaction.objectStore('notes').getAll(), values => {
      const ids = new Set(values.map(note => note.id));
      for (const note of values) {
        if (!Array.isArray(note.backlinks) || note.backlinks.some((id: unknown) => typeof id !== 'string' || !ids.has(id))) {
          throw new Error('Backlink inválido na migração simulada.');
        }
        if (version >= 4 && note.revision !== 1) throw new Error('Revisão inválida na migração simulada.');
      }
      const index = context.transaction.objectStore('notes').index('by-backlink');
      if (index.keyPath !== 'backlinks' || !index.multiEntry || index.unique) throw new Error('Índice de backlinks inválido.');
      done();
    });
  });
}

export const FUTURE_MIGRATIONS: readonly DatabaseMigration[] = [
  ...LOCAL_MIGRATIONS,
  {
    version: 3, name: 'Backlinks simulados',
    upgrade(context, done) {
      context.transaction.objectStore('notes').createIndex('by-backlink', 'backlinks', { multiEntry: true });
      rewriteNotes(context, 3, { backlinks: [] }, done);
    },
    validate(context, done) { validateFuture(context, 3, done); },
  },
  {
    version: 4, name: 'Revisões simuladas',
    upgrade(context, done) { rewriteNotes(context, 4, { revision: 1 }, done); },
    validate(context, done) { validateFuture(context, 4, done); },
  },
];

export async function seedDatabase(factory: IDBFactory, name: string, version: 1 | 2, data: AppData) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(name, version);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('workspace');
      if (version === 2) {
        request.result.createObjectStore('notes', { keyPath: 'id' });
        request.result.createObjectStore('metadata');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([...database.objectStoreNames], 'readwrite');
    transaction.objectStore('workspace').put(data, 'current');
    transaction.objectStore('workspace').put({ savedAt: 1, local: data, remote: data }, 'recovery-copy');
    if (version === 2) {
      for (const note of data.notes) transaction.objectStore('notes').put(note);
      for (const [key, value] of Object.entries(workspaceMetadata(data))) transaction.objectStore('metadata').put(value, key);
      transaction.objectStore('metadata').put(2, 'schema');
    }
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

export async function inspectDatabase(factory: IDBFactory, name: string) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    const stores: Record<string, { keyPath: string | string[] | null; indexes: string[]; keys: IDBValidKey[]; values: unknown[] }> = {};
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([...database.objectStoreNames]);
      for (const name of database.objectStoreNames) {
        const store = transaction.objectStore(name);
        const keys = store.getAllKeys();
        const values = store.getAll();
        values.onsuccess = () => { stores[name] = { keyPath: store.keyPath, indexes: [...store.indexNames], keys: keys.result, values: values.result }; };
      }
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    return { version: database.version, stores };
  } finally { database.close(); }
}
