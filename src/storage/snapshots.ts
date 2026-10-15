import type { AppData, Note } from '../data';
import { METADATA_KEYS, workspaceMetadata, type Metadata } from './schema';

type Captured<T> = { value: T; signature: string | undefined };
export type WorkspaceSnapshot = {
  notes: Map<string, Captured<Note>>;
  metadata: { [Key in keyof Metadata]: Captured<Metadata[Key]> };
};

const objects = new WeakMap<object, Captured<unknown>>();
function capture<T>(value: T): Captured<T> {
  // App state is immutable. Reuse snapshots of unchanged entities so typing
  // in one note does not clone or serialize every other document and photo.
  if (value !== null && typeof value === 'object') {
    const cached = objects.get(value);
    if (cached) return cached as Captured<T>;
    const captured = { value: structuredClone(value), signature: JSON.stringify(value) };
    objects.set(value, captured);
    return captured;
  }
  return { value, signature: JSON.stringify(value) };
}

export function captureWorkspace(data: AppData): WorkspaceSnapshot {
  const notes = new Map<string, Captured<Note>>();
  for (const note of data.notes) {
    if (!note || typeof note.id !== 'string' || !note.id || notes.has(note.id)) {
      throw new Error('Não foi possível salvar: há notas com identificadores inválidos.');
    }
    notes.set(note.id, capture(note));
  }
  const values = workspaceMetadata(data);
  const metadata = Object.fromEntries(METADATA_KEYS.map(key => [key, capture(values[key])])) as WorkspaceSnapshot['metadata'];
  return { notes, metadata };
}
