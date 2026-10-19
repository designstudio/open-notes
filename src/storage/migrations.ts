import type { DatabaseMigration } from './migration-runner';
import { validateGranularDatabase, validateStore } from './integrity';
import { NOTES_STORE, METADATA_STORE, WORKSPACE_STORE, normalizeData, workspaceMetadata } from './schema';
import { isUserProfile } from '../profile';

/** Append new steps; do not rewrite released formats or enable test versions. */
export const LOCAL_MIGRATIONS: readonly DatabaseMigration[] = [
  {
    version: 1,
    name: 'Espaço e cópias de recuperação',
    upgrade({ database }, done) {
      database.createObjectStore(WORKSPACE_STORE);
      done();
    },
    validate(context, done) {
      const store = validateStore(context, WORKSPACE_STORE, null);
      context.request(store.get('current'), original => {
        if (original !== undefined) {
          normalizeData(original);
          if (original.profile !== undefined && !isUserProfile(original.profile)) {
            throw new Error('Perfil inválido na origem da migração. A cópia original foi preservada.');
          }
        }
        done();
      });
    },
  },
  {
    version: 2,
    name: 'Notas individuais e metadados',
    upgrade(context, done) {
      const { database, transaction } = context;
      database.createObjectStore(NOTES_STORE, { keyPath: 'id' });
      database.createObjectStore(METADATA_STORE);
      context.request(transaction.objectStore(WORKSPACE_STORE).get('current'), original => {
        if (original !== undefined) {
          const data = normalizeData(original);
          const notes = transaction.objectStore(NOTES_STORE);
          for (const note of data.notes) notes.put(note);
          const metadata = transaction.objectStore(METADATA_STORE);
          for (const [key, value] of Object.entries(workspaceMetadata(data))) metadata.put(value, key);
          metadata.put(2, 'schema');
        }
        // Never update workspace/current or any recovery key.
        done();
      });
    },
    validate(context, done) { validateGranularDatabase(context, 2, done); },
  },
];
