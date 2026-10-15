import type { AppData } from '../data';
import type { SetAppData } from './types';

export function createWorkspaceSession(initialData: AppData) {
  let data = initialData;
  const listeners = new Set<() => void>();
  const setData: SetAppData = update => {
    const next = typeof update === 'function' ? update(data) : update;
    if (Object.is(next, data)) return;
    data = next;
    listeners.forEach(listener => listener());
  };
  return {
    getSnapshot: () => data,
    setData,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}

export type WorkspaceSessionCache = { session?: ReturnType<typeof createWorkspaceSession> };

export function getWorkspaceSession(cache: WorkspaceSessionCache, initialData: AppData) {
  // A remount may receive the snapshot loaded hours earlier by main.tsx.
  // Once editing starts, the live session must take precedence over that prop.
  return cache.session ??= createWorkspaceSession(initialData);
}
