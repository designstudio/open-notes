import {
  DATABASE_NAME, DATABASE_VERSION, NOTES_STORE, METADATA_STORE, WORKSPACE_STORE,
  normalizeData, workspaceMetadata,
} from './schema';

export function openLocalDatabase(factory: IDBFactory = indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let abandoned = false;
    let migrationError: unknown;
    const request = factory.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      const transaction = request.transaction!;
      if (!database.objectStoreNames.contains(WORKSPACE_STORE)) database.createObjectStore(WORKSPACE_STORE);
      if (!database.objectStoreNames.contains(NOTES_STORE)) database.createObjectStore(NOTES_STORE, { keyPath: 'id' });
      if (!database.objectStoreNames.contains(METADATA_STORE)) database.createObjectStore(METADATA_STORE);
      const original = transaction.objectStore(WORKSPACE_STORE).get('current');
      original.onsuccess = () => {
        if (original.result === undefined) return;
        try {
          const data = normalizeData(original.result);
          const notes = transaction.objectStore(NOTES_STORE);
          for (const note of data.notes) notes.put(note);
          const metadata = transaction.objectStore(METADATA_STORE);
          for (const [key, value] of Object.entries(workspaceMetadata(data))) metadata.put(value, key);
          metadata.put(DATABASE_VERSION, 'schema');
          // Keep workspace/current unchanged as the pre-migration backup.
          // The schema upgrade and all new records commit or abort together.
        } catch (error) {
          migrationError = error;
          transaction.abort();
        }
      };
    };
    request.onsuccess = () => {
      const database = request.result;
      if (abandoned) { database.close(); return; }
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(migrationError || request.error);
    request.onblocked = () => {
      abandoned = true;
      reject(new Error('Feche outras abas do Open Notes e tente novamente.'));
    };
  });
}
