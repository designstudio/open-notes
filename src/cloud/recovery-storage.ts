import type { AppData } from '../data';
import { openLocalDatabase } from '../local-data';

export type RecoveryCopy = { key: string; savedAt: number; local: AppData; remote?: AppData };
const isRecoveryKey = (key: string) => key.startsWith('open-notes-drive-recovery-') || key === 'open-notes-drive-last-upload-recovery';

export async function saveRecoveryCopy(local: AppData, remote?: AppData, key = `open-notes-drive-recovery-${crypto.randomUUID()}`) {
  try {
    const copy: RecoveryCopy = structuredClone({ key, savedAt: Date.now(), local, remote });
    const database = await openLocalDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction('workspace', 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error);
        transaction.objectStore('workspace').put(copy, key);
      });
    } finally { database.close(); }
  } catch {
    throw new Error('Não foi possível preservar uma cópia de segurança neste navegador. A sincronização foi interrompida e nenhuma cópia foi substituída.');
  }
}

export async function recoveryCopies(): Promise<RecoveryCopy[]> {
  const copies = new Map<string, RecoveryCopy>();
  // Keep backups from older versions available without rewriting or deleting them.
  try {
    for (const key of Object.keys(localStorage).filter(isRecoveryKey)) {
      try { copies.set(key, { ...JSON.parse(localStorage.getItem(key)!), key }); }
      catch { /* One malformed legacy backup does not hide the other copies. */ }
    }
  } catch { /* IndexedDB backups remain available if localStorage is blocked. */ }
  const database = await openLocalDatabase();
  try {
    const saved = await new Promise<RecoveryCopy[]>((resolve, reject) => {
      const transaction = database.transaction('workspace', 'readonly');
      const request = transaction.objectStore('workspace').getAll();
      transaction.oncomplete = () => resolve(request.result.filter(item => typeof item?.key === 'string' && isRecoveryKey(item.key)));
      transaction.onabort = () => reject(transaction.error);
    });
    saved.forEach(copy => copies.set(copy.key, copy));
    return [...copies.values()].sort((a, b) => b.savedAt - a.savedAt);
  } finally { database.close(); }
}
