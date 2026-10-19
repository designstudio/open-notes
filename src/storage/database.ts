import { DATABASE_NAME, DATABASE_VERSION } from './schema';
import { openVersionedDatabase } from './migration-runner';
import { LOCAL_MIGRATIONS } from './migrations';

export function openLocalDatabase(factory: IDBFactory = indexedDB): Promise<IDBDatabase> {
  return openVersionedDatabase(factory, {
    name: DATABASE_NAME,
    version: DATABASE_VERSION,
    migrations: LOCAL_MIGRATIONS,
  });
}
