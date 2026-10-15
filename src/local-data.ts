import { initialCollections, initialFolders, initialNotes, type AppData } from './data';
import { readProfile } from './profile';

const legacyKey = 'open-notes-v1';
const databaseName = 'open-notes';
const storeName = 'workspace';

export function openLocalDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Feche outras abas do Open Notes e tente novamente.'));
  });
}

function normalizeData(value: unknown): AppData {
  const parsed = value as AppData | null;
  if (!parsed || !Array.isArray(parsed.notes) || !Array.isArray(parsed.collections)) {
    throw new Error('Não foi possível ler os dados salvos. A cópia original foi preservada.');
  }
  return {
    notes: parsed.notes, collections: parsed.collections,
    folders: Array.isArray(parsed.folders) ? parsed.folders : initialFolders,
    ...(parsed.profile ? { profile: readProfile(parsed.profile) } : {}),
  };
}

let pendingSave: Promise<void> = Promise.resolve();
export function saveLocalData(data: AppData): Promise<void> {
  const snapshot = structuredClone(data);
  const save = pendingSave.then(() => commitLocalData(snapshot));
  pendingSave = save.catch(() => {});
  return save;
}

async function commitLocalData(data: AppData): Promise<void> {
  const database = await openLocalDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error || new Error('Não foi possível salvar os dados.'));
      transaction.objectStore(storeName).put(data, 'current');
    });
  } finally { database.close(); }
}

export async function loadLocalData(): Promise<AppData> {
  const database = await openLocalDatabase();
  let stored: unknown;
  try {
    stored = await new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly');
      const request = transaction.objectStore(storeName).get('current');
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
  if (stored !== undefined) return normalizeData(stored);
  const legacy = localStorage.getItem(legacyKey);
  if (legacy) {
    const data = normalizeData(JSON.parse(legacy));
    // Commit before opening the editor. Keep the old copy intact as a migration backup.
    await saveLocalData(data);
    return data;
  }
  return { notes: initialNotes, collections: initialCollections, folders: initialFolders };
}
