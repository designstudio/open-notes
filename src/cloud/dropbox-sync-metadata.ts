import { openLocalDatabase } from '../local-data';

export const syncMetadataChannel = 'open-notes-dropbox-sync-metadata';
const storageError = () => new Error('Não foi possível salvar ou ler o controle da sincronização no navegador. Verifique o espaço disponível e as permissões de armazenamento. Suas notas foram preservadas.');

// Only revisions, hashes and timestamps belong here. Reuse the existing store;
// never move notes, credentials or backups, and retain legacy metadata on disk.
export async function readSyncMetadata<T>(key: string): Promise<T | null> {
  try {
    const database = await openLocalDatabase();
    try {
      const value = await new Promise<T | undefined>((resolve, reject) => {
        const transaction = database.transaction('workspace', 'readonly');
        const request = transaction.objectStore('workspace').get(key);
        transaction.oncomplete = () => resolve(request.result);
        transaction.onabort = () => reject(transaction.error);
      });
      if (value !== undefined) return value;
    } finally { database.close(); }
  } catch { throw storageError(); }
  // Existing installations can still read their old baseline and attempt time.
  try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null; }
  catch { return null; }
}

export async function writeSyncMetadata(key: string, value: unknown): Promise<void> {
  try {
    const database = await openLocalDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction('workspace', 'readwrite');
        transaction.objectStore('workspace').put(value, key);
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error);
      });
    } finally { database.close(); }
  } catch { throw storageError(); }
  // IndexedDB has no storage event. Notify peers; the Web Lock still determines
  // which tab may sync and rechecks the persisted timestamp before any request.
  if (typeof window.BroadcastChannel === 'function') {
    try {
      const channel = new window.BroadcastChannel(syncMetadataChannel);
      try { channel.postMessage(key); } finally { channel.close(); }
    } catch { /* Persistence succeeded. Peers still recheck under the Web Lock. */ }
  }
}
