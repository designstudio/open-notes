import { initialFolders, type AppData } from '../data';
import { readProfile } from '../profile';

export const DATABASE_NAME = 'open-notes';
export const DATABASE_VERSION = 2;
export const NOTES_STORE = 'notes';
export const METADATA_STORE = 'metadata';
export const WORKSPACE_STORE = 'workspace';
export const LEGACY_KEY = 'open-notes-v1';

export function normalizeData(value: unknown): AppData {
  const parsed = value as AppData | null;
  if (!parsed || !Array.isArray(parsed.notes) || !Array.isArray(parsed.collections)) {
    throw new Error('Não foi possível ler os dados salvos. A cópia original foi preservada.');
  }
  const ids = new Set<string>();
  for (const note of parsed.notes) {
    if (!note || typeof note.id !== 'string' || !note.id || ids.has(note.id)) {
      throw new Error('Há notas com identificadores inválidos. A cópia original foi preservada.');
    }
    ids.add(note.id);
  }
  return {
    notes: parsed.notes,
    collections: parsed.collections,
    folders: Array.isArray(parsed.folders) ? parsed.folders : initialFolders,
    ...(parsed.profile ? { profile: readProfile(parsed.profile) } : {}),
  };
}

export function workspaceMetadata(data: AppData) {
  return {
    noteOrder: data.notes.map(note => note.id),
    collections: data.collections,
    folders: data.folders,
    profile: data.profile,
  };
}

export type Metadata = ReturnType<typeof workspaceMetadata>;
export const METADATA_KEYS = ['noteOrder', 'collections', 'folders', 'profile'] as const;
