export type SyncProvider = 'google-drive' | 'dropbox';
export const providerKey = 'open-notes-sync-provider';
const listeners = new Set<() => void>();
let fallback: Promise<unknown> = Promise.resolve();
export function activeSyncProvider(): SyncProvider {
  try { return localStorage.getItem(providerKey) === 'dropbox' ? 'dropbox' : 'google-drive'; }
  catch { return 'google-drive'; }
}
export function subscribeSyncProvider(listener: () => void) {
  listeners.add(listener);
  const storageChanged = (event: StorageEvent) => { if (event.key === providerKey || event.key === null) listener(); };
  window.addEventListener('storage', storageChanged);
  return () => { listeners.delete(listener); window.removeEventListener('storage', storageChanged); };
}
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request('open-notes-cloud-sync', task);
  // Preserve legacy Drive support. Dropbox activation fails closed without Web Locks.
  const result = fallback.then(task); fallback = result.catch(() => {}); return result;
}
export function withSyncLock<T>(provider: SyncProvider, task: () => Promise<T>): Promise<T | undefined> {
  return exclusive(async () => activeSyncProvider() === provider ? task() : undefined);
}
export function selectSyncProvider(provider: SyncProvider) {
  return exclusive(async () => {
    if (provider === 'dropbox' && !navigator.locks) throw new Error('Este navegador não oferece a coordenação entre abas necessária para sincronizar com Dropbox. Use uma versão atual do Chrome, Edge ou Firefox.');
    const changed = activeSyncProvider() !== provider;
    localStorage.setItem(providerKey, provider);
    if (changed) listeners.forEach(listener => listener());
  });
}
