import { openLocalDatabase } from '../../src/storage/database';
import { DatabaseCompatibilityError, openVersionedDatabase, type DatabaseMigration } from '../../src/storage/migration-runner';
import { FUTURE_MIGRATIONS, inspectDatabase, migrationSpace, seedDatabase } from './migration-fixtures';

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const open = (name: string, migrations = FUTURE_MIGRATIONS) =>
  openVersionedDatabase(indexedDB, { name, version: migrations.length, migrations });

async function run() {
  const results: string[] = [];
  for (const version of [1, 2] as const) {
    const name = `native-from-${version}`;
    const data = migrationSpace(5000);
    await seedDatabase(indexedDB, name, version, data);
    const before = await inspectDatabase(indexedDB, name);
    (await open(name)).close();
    const after = await inspectDatabase(indexedDB, name);
    check(after.version === 4, 'Native version was not committed');
    check(same(after.stores.workspace, before.stores.workspace), 'Native recovery copies changed');
    check(after.stores.notes.values.length === 5000, 'Native record count changed');
    const original = new Map(data.notes.map(note => [note.id, note]));
    for (const record of after.stores.notes.values as (typeof data.notes[number] & { backlinks: unknown[]; revision: number })[]) {
      const { backlinks, revision, ...rest } = record;
      check(same(backlinks, []) && revision === 1 && same(rest, original.get(rest.id)), 'Native migration lost content');
    }
    const meta = Object.fromEntries(after.stores.metadata.keys.map((key, index) => [String(key), after.stores.metadata.values[index]]));
    check(meta.schema === 4 && same(meta.noteOrder, data.notes.map(note => note.id)) &&
      same(meta.profile, data.profile) && same(meta.collections, data.collections) && same(meta.folders, data.folders), 'Native metadata changed');
    results.push(`v${version} → v4: 5,000 notes, metadata and backups preserved`);
  }
  for (const mode of ['validation', 'abort', 'missing callback', 'request failure'] as const) {
    const name = `native-failure-${mode}`;
    await seedDatabase(indexedDB, name, 2, migrationSpace(20));
    const before = await inspectDatabase(indexedDB, name);
    const failing: DatabaseMigration = { ...FUTURE_MIGRATIONS[3] };
    if (mode === 'validation') failing.validate = () => { throw new Error('Simulated validation failure'); };
    else failing.upgrade = (context, done) => {
      context.transaction.objectStore('notes').put({ ...migrationSpace().notes[0], body: 'Partial write' });
      if (mode === 'abort') context.transaction.abort();
      else if (mode === 'request failure') {
        context.transaction.objectStore('notes').add(migrationSpace().notes[0]);
        done();
      }
    };
    let rejected = false;
    try { (await open(name, [...FUTURE_MIGRATIONS.slice(0, 3), failing])).close(); }
    catch { rejected = true; }
    check(rejected, `Native ${mode} unexpectedly succeeded`);
    check(same(await inspectDatabase(indexedDB, name), before), `Native ${mode} did not fully roll back`);
    (await open(name)).close();
    results.push(`${mode}: complete rollback, then successful retry`);
  }
  await seedDatabase(indexedDB, 'open-notes', 2, migrationSpace());
  (await open('open-notes')).close();
  const before = await inspectDatabase(indexedDB, 'open-notes');
  let incompatible = false;
  try { (await openLocalDatabase()).close(); }
  catch (error) { incompatible = error instanceof DatabaseCompatibilityError; }
  check(incompatible && same(before, await inspectDatabase(indexedDB, 'open-notes')), 'Newer database was not safely rejected');
  results.push('newer DB: compatibility error without data changes');
  return results;
}

Object.assign(window, { migrationChecks: run });
