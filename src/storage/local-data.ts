import { initialCollections, initialFolders, initialNotes, type AppData, type Note } from '../data';
import { openLocalDatabase } from './database';
import {
  DATABASE_VERSION, LEGACY_KEY, METADATA_KEYS, METADATA_STORE, NOTES_STORE,
  normalizeData, type Metadata,
} from './schema';
import { captureWorkspace, type WorkspaceSnapshot } from './snapshots';

export { openLocalDatabase } from './database';

type StorageSession = { pending: Promise<unknown>; committed?: WorkspaceSnapshot };
const sessions = new WeakMap<IDBFactory, StorageSession>();

function enqueue<T>(operation: (database: IDBDatabase, session: StorageSession) => Promise<T>): Promise<T> {
  const factory = indexedDB;
  let session = sessions.get(factory);
  if (!session) {
    session = { pending: Promise.resolve() };
    sessions.set(factory, session);
  }
  const current = session;
  const result = current.pending.then(async () => {
    const database = await openLocalDatabase(factory);
    try { return await operation(database, current); }
    finally { database.close(); }
  });
  current.pending = result.catch(() => {});
  return result;
}

async function readWorkspace(database: IDBDatabase): Promise<AppData | null> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([NOTES_STORE, METADATA_STORE], 'readonly');
    const notes = transaction.objectStore(NOTES_STORE).getAll();
    const store = transaction.objectStore(METADATA_STORE);
    const schema = store.get('schema');
    const requests = Object.fromEntries(METADATA_KEYS.map(key => [key, store.get(key)])) as Record<keyof Metadata, IDBRequest>;
    transaction.onabort = () => reject(transaction.error || new Error('Não foi possível ler as notas.'));
    transaction.oncomplete = () => {
      try {
        const values = Object.fromEntries(METADATA_KEYS.map(key => [key, requests[key].result])) as Metadata;
        if (schema.result === undefined && notes.result.length === 0 &&
            METADATA_KEYS.every(key => values[key] === undefined)) { resolve(null); return; }
        if (schema.result !== DATABASE_VERSION || !Array.isArray(values.noteOrder) ||
            !Array.isArray(values.collections) || !Array.isArray(values.folders)) {
          throw new Error('Não foi possível ler os dados salvos. As cópias existentes foram preservadas.');
        }
        const byId = new Map<string, Note>(notes.result.map((note: Note) => [note.id, note]));
        const ordered: Note[] = [];
        for (const id of values.noteOrder) {
          const note = byId.get(id);
          if (!note) throw new Error('Há uma nota ausente no armazenamento. As cópias existentes foram preservadas.');
          ordered.push(note);
          byId.delete(id);
        }
        // Include notes added by another tab, even if its ordering was not
        // present in the local snapshot that last changed metadata.
        ordered.push(...byId.values());
        resolve(normalizeData({ notes: ordered, collections: values.collections, folders: values.folders, profile: values.profile }));
      } catch (error) { reject(error); }
    };
  });
}

async function persistWorkspace(database: IDBDatabase, previous: WorkspaceSnapshot | undefined, next: WorkspaceSnapshot) {
  const changedNotes = [...next.notes].filter(([id, note]) => !previous?.notes.has(id) || previous.notes.get(id)!.signature !== note.signature);
  const removedIds = [...(previous?.notes.keys() ?? [])].filter(id => !next.notes.has(id));
  const changedMetadata = METADATA_KEYS.filter(key => !previous || previous.metadata[key].signature !== next.metadata[key].signature);
  const stores: string[] = [];
  if (changedNotes.length || removedIds.length) stores.push(NOTES_STORE);
  if (changedMetadata.length) stores.push(METADATA_STORE);
  if (!stores.length) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(stores, 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('Não foi possível salvar os dados.'));
    try {
      if (stores.includes(NOTES_STORE)) {
        const notes = transaction.objectStore(NOTES_STORE);
        for (const [, note] of changedNotes) notes.put(note.value);
        for (const id of removedIds) notes.delete(id);
      }
      if (stores.includes(METADATA_STORE)) {
        const metadata = transaction.objectStore(METADATA_STORE);
        for (const key of changedMetadata) metadata.put(next.metadata[key].value, key);
        if (!previous) metadata.put(DATABASE_VERSION, 'schema');
      }
    } catch (error) {
      transaction.abort();
      reject(error);
    }
  });
}

async function hasCurrentSchema(database: IDBDatabase): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(METADATA_STORE, 'readonly');
    const request = transaction.objectStore(METADATA_STORE).get('schema');
    transaction.oncomplete = () => resolve(request.result === DATABASE_VERSION);
    transaction.onabort = () => reject(transaction.error || new Error('Não foi possível ler os dados salvos.'));
  });
}

export function saveLocalData(data: AppData): Promise<void> {
  let snapshot: WorkspaceSnapshot;
  try { snapshot = captureWorkspace(data); }
  catch (error) { return Promise.reject(error); }
  return enqueue(async (database, session) => {
    // Browser storage may be removed while this module still has a cached
    // baseline. Never report a partial save into a newly empty database.
    if (session.committed && !await hasCurrentSchema(database)) session.committed = undefined;
    if (!session.committed) {
      const stored = await readWorkspace(database);
      if (stored) session.committed = captureWorkspace(stored);
    }
    await persistWorkspace(database, session.committed, snapshot);
    // Failed transactions never advance the baseline; the next save retries
    // every outstanding change, including deletes and profile/photo changes.
    session.committed = snapshot;
  });
}

export function loadLocalData(): Promise<AppData> {
  return enqueue(async (database, session) => {
    const stored = await readWorkspace(database);
    if (stored) {
      session.committed = captureWorkspace(stored);
      return stored;
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const data = normalizeData(JSON.parse(legacy));
      const snapshot = captureWorkspace(data);
      await persistWorkspace(database, undefined, snapshot);
      session.committed = snapshot;
      // Preserve the localStorage source just like workspace/current.
      return data;
    }
    return { notes: initialNotes, collections: initialCollections, folders: initialFolders };
  });
}
