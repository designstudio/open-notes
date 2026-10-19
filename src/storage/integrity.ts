import type { MigrationContext } from './migration-runner';
import { METADATA_STORE, NOTES_STORE, WORKSPACE_STORE } from './schema';

type RecordValue = Record<string, unknown>;
function record(value: unknown, label: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Registro inválido: ${label}. As cópias existentes foram preservadas.`);
  return value as RecordValue;
}
function requireValue(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Integridade inválida: ${label}. As cópias existentes foram preservadas.`);
}
function entities(value: unknown, label: string): Map<string, RecordValue> {
  requireValue(Array.isArray(value), label);
  const items = new Map<string, RecordValue>();
  for (const item of value) {
    const entity = record(item, label);
    requireValue(typeof entity.id === 'string' && entity.id.trim() && !items.has(entity.id), `${label}: identificadores inválidos`);
    items.set(entity.id, entity);
  }
  return items;
}

/** Migration-only strict checks. Never repair or discard a record implicitly. */
export function validateWorkspaceIntegrity(notes: unknown, metadata: RecordValue, version: number) {
  requireValue(metadata.schema === version, 'versão dos metadados');
  const noteMap = entities(notes, 'notas');
  const collections = entities(metadata.collections, 'coleções');
  const folders = entities(metadata.folders, 'pastas');
  const order = metadata.noteOrder;
  requireValue(Array.isArray(order) && order.length === noteMap.size && new Set(order).size === order.length &&
    order.every(id => typeof id === 'string' && noteMap.has(id)), 'ordem das notas');
  for (const collection of collections.values()) {
    requireValue(typeof collection.name === 'string' && typeof collection.color === 'string', 'campos da coleção');
  }
  for (const folder of folders.values()) {
    requireValue(typeof folder.name === 'string' && typeof folder.collectionId === 'string' && collections.has(folder.collectionId), 'referência da pasta à coleção');
  }
  for (const note of noteMap.values()) {
    requireValue(typeof note.title === 'string' && typeof note.body === 'string' && typeof note.icon === 'string' &&
      typeof note.updated === 'number' && Number.isFinite(note.updated) &&
      Array.isArray(note.tags) && note.tags.every(tag => typeof tag === 'string') &&
      ['favorite', 'archived', 'deleted'].every(key => typeof note[key] === 'boolean'), 'campos da nota');
    requireValue(typeof note.collection === 'string' && (!note.collection || collections.has(note.collection)), 'referência da nota à coleção');
    requireValue(note.folder === undefined || typeof note.folder === 'string', 'campo pasta da nota');
    if (note.folder) requireValue(folders.get(note.folder as string)?.collectionId === note.collection, 'referência da nota à pasta');
    if (note.document !== undefined) {
      const document = record(note.document, 'documento formatado');
      requireValue(document.type === 'doc' && (document.content === undefined || Array.isArray(document.content)), 'documento formatado');
    }
  }
  if (metadata.profile !== undefined) {
    const profile = record(metadata.profile, 'perfil');
    requireValue(typeof profile.name === 'string' && typeof profile.photo === 'string', 'campos do perfil');
  }
}

export function validateStore(context: MigrationContext, name: string, keyPath: string | null) {
  requireValue(context.database.objectStoreNames.contains(name), `store ausente: ${name}`);
  const store = context.transaction.objectStore(name);
  requireValue(store.keyPath === keyPath && !store.autoIncrement, `chave do store ${name}`);
  return store;
}

/** Read the actual staged records, not just the objects used to write them. */
export function validateGranularDatabase(context: MigrationContext, version: number, done: () => void) {
  const notes = validateStore(context, NOTES_STORE, 'id');
  const metadata = validateStore(context, METADATA_STORE, null);
  validateStore(context, WORKSPACE_STORE, null);
  context.request(notes.getAll(), records => {
    context.request(metadata.getAllKeys(), keys => {
      context.request(metadata.getAll(), values => {
        requireValue(keys.every(key => typeof key === 'string'), 'chaves dos metadados');
        // An untouched DB still awaits first save or localStorage import.
        // A retained legacy workspace proves this is not a fresh install.
        if (!records.length && !keys.length) {
          context.request(context.transaction.objectStore(WORKSPACE_STORE).get('current'), original => {
            requireValue(original === undefined, 'metadados ausentes de um espaço já migrado');
            done();
          });
          return;
        }
        validateWorkspaceIntegrity(records, Object.fromEntries(keys.map((key, index) => [String(key), values[index]])), version);
        done();
      });
    });
  });
}
