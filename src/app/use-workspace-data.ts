import { useState, useSyncExternalStore } from 'react';
import type { AppData } from '../data';
import { createWorkspaceSession, getWorkspaceSession, type WorkspaceSessionCache } from './workspace-session';

// Vite retains hot.data when replacing modules. Keep this outside App so
// changing App's hooks cannot reset edits to main.tsx's initial snapshot.
const developmentCache: WorkspaceSessionCache | null = import.meta.hot
  ? (import.meta.hot.data.workspaceSessionCache ??= {})
  : null;

export function useWorkspaceData(initialData: AppData) {
  const [session] = useState(() => developmentCache
    ? getWorkspaceSession(developmentCache, initialData)
    : createWorkspaceSession(initialData));
  const data = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return [data, session.setData] as const;
}
