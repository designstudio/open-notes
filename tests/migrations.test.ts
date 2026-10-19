import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { openLocalDatabase } from '../src/storage/database';
import { DatabaseCompatibilityError, openVersionedDatabase, type DatabaseMigration } from '../src/storage/migration-runner';
import { LOCAL_MIGRATIONS } from '../src/storage/migrations';
import { DATABASE_VERSION, type Metadata } from '../src/storage/schema';
import { FUTURE_MIGRATIONS, inspectDatabase, migrationSpace, seedDatabase } from './helpers/migration-fixtures';

const name = 'migration-tests';
const open = (factory: IDBFactory, version = 4, migrations = FUTURE_MIGRATIONS) =>
  openVersionedDatabase(factory, { name, version, migrations: migrations.slice(0, version) });

test('production stays at v2 and a fresh install retains uninitialized stores', async () => {
  const factory = new IDBFactory();
  const database = await openLocalDatabase(factory);
  assert.equal(DATABASE_VERSION, 2);
  assert.deepEqual(LOCAL_MIGRATIONS.map(step => step.version), [1, 2]);
  assert.equal(database.version, 2);
  database.close();
  const stored = await inspectDatabase(factory, 'open-notes');
  assert.deepEqual(Object.keys(stored.stores).sort(), ['metadata', 'notes', 'workspace']);
  assert.deepEqual(stored.stores.metadata.values, []);
  assert.deepEqual(stored.stores.notes.values, []);
});

for (const source of [1, 2] as const) {
  test(`v${source} upgrades sequentially to simulated v4 without losing 5,000 rich notes, metadata or recovery copies`, async () => {
    const factory = new IDBFactory();
    const data = migrationSpace(5000);
    await seedDatabase(factory, name, source, data);
    const before = await inspectDatabase(factory, name);
    const calls: number[] = [];
    const migrations = FUTURE_MIGRATIONS.map(step => ({ ...step, upgrade(context, done) {
      calls.push(step.version);
      step.upgrade(context, done);
    } } satisfies DatabaseMigration));
    (await open(factory, 4, migrations)).close();
    assert.deepEqual(calls, source === 1 ? [2, 3, 4] : [3, 4]);
    const after = await inspectDatabase(factory, name);
    assert.equal(after.version, 4);
    assert.deepEqual(after.stores.workspace, before.stores.workspace);
    const byId = new Map(data.notes.map(note => [note.id, note]));
    assert.equal(after.stores.notes.values.length, 5000);
    for (const record of after.stores.notes.values as (typeof data.notes[number] & { backlinks: string[]; revision: number })[]) {
      const { backlinks, revision, ...original } = record;
      assert.deepEqual(backlinks, []);
      assert.equal(revision, 1);
      assert.deepEqual(original, byId.get(record.id));
    }
    const metadata = Object.fromEntries(after.stores.metadata.keys.map((key, index) => [String(key), after.stores.metadata.values[index]]));
    assert.equal(metadata.schema, 4);
    for (const key of ['profile', 'collections', 'folders'] as const) assert.deepEqual(metadata[key], data[key]);
    assert.deepEqual(metadata.noteOrder, data.notes.map(note => note.id));
    assert.deepEqual(after.stores.notes.indexes, ['by-backlink']);
  });
}

test('separate v2 → v3 → v4 openings run only pending steps', async () => {
  const factory = new IDBFactory();
  await seedDatabase(factory, name, 2, migrationSpace());
  (await open(factory, 3)).close();
  const atThree = await inspectDatabase(factory, name);
  assert.equal(atThree.version, 3);
  (await open(factory)).close();
  assert.equal((await inspectDatabase(factory, name)).version, 4);
});

test('opening the current version performs no migration, validation scan or write', async () => {
  const factory = new IDBFactory();
  await seedDatabase(factory, name, 2, migrationSpace());
  const before = await inspectDatabase(factory, name);
  const forbidden = LOCAL_MIGRATIONS.map(step => ({ ...step,
    upgrade() { throw new Error('Unexpected migration'); },
    validate() { throw new Error('Unexpected validation'); },
  }));
  (await open(factory, 2, forbidden)).close();
  assert.deepEqual(await inspectDatabase(factory, name), before);
});

test('an empty uninitialized v2 can upgrade without becoming an explicitly empty workspace', async () => {
  const factory = new IDBFactory();
  (await open(factory, 2)).close();
  (await open(factory)).close();
  const stored = await inspectDatabase(factory, name);
  assert.deepEqual(stored.stores.metadata.keys, []);
  assert.deepEqual(stored.stores.notes.keys, []);
});

test('an explicitly empty legacy workspace stays initialized and empty through all versions', async () => {
  const factory = new IDBFactory();
  await seedDatabase(factory, name, 1, { notes: [], collections: [], folders: [] });
  (await open(factory)).close();
  const stored = await inspectDatabase(factory, name);
  const schemaIndex = stored.stores.metadata.keys.indexOf('schema');
  assert.equal(stored.stores.metadata.values[schemaIndex], 4);
  assert.deepEqual(stored.stores.notes.values, []);
});

for (const failure of ['upgrade exception', 'validation exception', 'explicit interruption', 'request error', 'missing done', 'missing validation done', 'double done', 'async upgrade', 'async callback'] as const) {
  test(`${failure} rolls back every pending step, added index, records and version; retry succeeds`, async () => {
    const factory = new IDBFactory();
    await seedDatabase(factory, name, 2, migrationSpace(20));
    const before = await inspectDatabase(factory, name);
    const last = FUTURE_MIGRATIONS[3];
    const failing: DatabaseMigration = { ...last };
    if (failure === 'validation exception') failing.validate = () => { throw new Error('Invalid converted data'); };
    else if (failure === 'missing validation done') failing.validate = context => {
      context.request(context.transaction.objectStore('notes').getAll(), () => {});
    };
    else failing.upgrade = (context, done) => {
      context.transaction.objectStore('notes').put({ ...migrationSpace().notes[0], body: 'Must be rolled back' });
      if (failure === 'explicit interruption') context.transaction.abort();
      else if (failure === 'request error') { context.transaction.objectStore('notes').add(migrationSpace().notes[0]); done(); }
      else if (failure === 'missing done') return;
      else if (failure === 'double done') { done(); done(); }
      else if (failure === 'async upgrade') return Promise.resolve() as unknown as void;
      else if (failure === 'async callback') context.request(context.transaction.objectStore('notes').getAll(), async () => { done(); });
      else throw new Error('Simulated interruption');
    };
    await assert.rejects(open(factory, 4, [...FUTURE_MIGRATIONS.slice(0, 3), failing]));
    assert.deepEqual(await inspectDatabase(factory, name), before);
    (await open(factory)).close();
    assert.equal((await inspectDatabase(factory, name)).version, 4);
  });
}

const corruptions: [string, (data: ReturnType<typeof migrationSpace>) => void][] = [
  ['duplicate note IDs', data => { data.notes[1].id = data.notes[0].id; }],
  ['missing note ID', data => { data.notes[0].id = ''; }],
  ['missing note body', data => { delete (data.notes[0] as Partial<typeof data.notes[number]>).body; }],
  ['duplicate collection IDs', data => { data.collections.push({ ...data.collections[0] }); }],
  ['duplicate folder IDs', data => { data.folders.push({ ...data.folders[0] }); }],
  ['orphan collection reference', data => { data.notes[0].collection = 'missing'; }],
  ['orphan folder reference', data => { data.notes[0].folder = 'missing'; }],
  ['folder in a different collection', data => {
    data.collections.push({ id: 'other', name: 'Outra', color: 'blue' });
    data.folders[0].collectionId = 'other';
  }],
  ['orphan folder collection', data => { data.folders[0].collectionId = 'missing'; }],
  ['invalid rich document', data => { data.notes[0].document = { type: 'invalid' }; }],
  ['invalid profile', data => { data.profile = { name: 123, photo: '' } as unknown as typeof data.profile; }],
  ['incomplete arrays', data => { delete (data as Partial<typeof data>).collections; }],
];
for (const [label, corrupt] of corruptions) {
  test(`legacy ${label} aborts conversion and preserves all original records`, async () => {
    const factory = new IDBFactory();
    const data = migrationSpace();
    corrupt(data);
    await seedDatabase(factory, name, 1, data);
    const before = await inspectDatabase(factory, name);
    await assert.rejects(open(factory));
    assert.deepEqual(await inspectDatabase(factory, name), before);
  });
}

for (const [key, value] of [
  ['schema', 9], ['collections', null], ['folders', undefined],
  ['profile', { name: 123, photo: '' }], ['noteOrder', ['note-0', 'note-0', 'note-2']],
  ['noteOrder', ['note-0']], ['noteOrder', ['note-0', 'note-1', 'missing']],
] as [keyof Metadata | 'schema', unknown][]) {
  test(`corrupt v2 ${key}=${JSON.stringify(value)} is rejected before running v3`, async () => {
    const factory = new IDBFactory();
    await seedDatabase(factory, name, 2, migrationSpace());
    const database = await open(factory, 2);
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('metadata', 'readwrite');
      if (value === undefined) transaction.objectStore('metadata').delete(key);
      else transaction.objectStore('metadata').put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
    const before = await inspectDatabase(factory, name);
    let ran = false;
    const step = { ...FUTURE_MIGRATIONS[2], upgrade() { ran = true; throw new Error('Should not run'); } };
    await assert.rejects(open(factory, 3, [...LOCAL_MIGRATIONS, step]), /Integridade inválida/);
    assert.equal(ran, false);
    assert.deepEqual(await inspectDatabase(factory, name), before);
  });
}

test('newer database versions are rejected with a compatibility error and no downgrade or data changes', async () => {
  const factory = new IDBFactory();
  const plan = { name: 'open-notes', version: 4, migrations: FUTURE_MIGRATIONS };
  await seedDatabase(factory, plan.name, 2, migrationSpace());
  (await openVersionedDatabase(factory, plan)).close();
  const before = await inspectDatabase(factory, plan.name);
  await assert.rejects(openLocalDatabase(factory), (error: unknown) => error instanceof DatabaseCompatibilityError && /mais recente/.test(error.message));
  assert.deepEqual(await inspectDatabase(factory, plan.name), before);
});

for (const versions of [[1, 3], [1, 2, 2], [2, 1], [1]]) {
  test(`invalid migration registry ${versions} is rejected before opening the database`, async () => {
    const factory = new IDBFactory();
    const migrations = versions.map(version => ({ ...FUTURE_MIGRATIONS[version - 1] }));
    await assert.rejects(openVersionedDatabase(factory, { name, version: 2, migrations }), /Plano de migração inválido/);
    assert.deepEqual(await factory.databases(), []);
  });
}

test('blocked upgrade reports the other tab and cannot migrate later after its caller has given up', async () => {
  const factory = new IDBFactory();
  await seedDatabase(factory, name, 1, migrationSpace());
  const before = await inspectDatabase(factory, name);
  const blocker = await new Promise<IDBDatabase>(resolve => {
    const request = factory.open(name, 1);
    request.onsuccess = () => resolve(request.result);
  });
  try { await assert.rejects(open(factory), /Feche outras abas/); }
  finally { blocker.close(); }
  assert.deepEqual(await inspectDatabase(factory, name), before);
  (await open(factory)).close();
});

test('connections opened by the runner close on versionchange so a later client can upgrade', async () => {
  const factory = new IDBFactory();
  const old = await open(factory, 2);
  const next = await open(factory, 3);
  assert.throws(() => old.transaction('notes'), { name: 'InvalidStateError' });
  next.close();
});

test('a failure in the last simulated step rolls v1 back to its original single-store format', async () => {
  const factory = new IDBFactory();
  await seedDatabase(factory, name, 1, migrationSpace());
  const before = await inspectDatabase(factory, name);
  const failing = { ...FUTURE_MIGRATIONS[3], validate() { throw new Error('Fail after v2 and v3'); } };
  await assert.rejects(open(factory, 4, [...FUTURE_MIGRATIONS.slice(0, 3), failing]), /Fail after/);
  assert.deepEqual(await inspectDatabase(factory, name), before);
});

for (const problem of ['deleted note', 'invalid backlink', 'wrong schema marker'] as const) {
  test(`read-back validation detects ${problem} introduced during conversion and aborts`, async () => {
    const factory = new IDBFactory();
    await seedDatabase(factory, name, 2, migrationSpace());
    const before = await inspectDatabase(factory, name);
    const original = FUTURE_MIGRATIONS[2];
    const corrupt: DatabaseMigration = { ...original, upgrade(context, done) {
      original.upgrade(context, () => {
        if (problem === 'deleted note') context.transaction.objectStore('notes').delete('note-0');
        else if (problem === 'wrong schema marker') context.transaction.objectStore('metadata').put(2, 'schema');
        else context.transaction.objectStore('notes').put({ ...migrationSpace().notes[0], backlinks: ['missing'] });
        done();
      });
    } };
    await assert.rejects(open(factory, 3, [...LOCAL_MIGRATIONS, corrupt]));
    assert.deepEqual(await inspectDatabase(factory, name), before);
  });
}

test('an unexpected source store key prevents conversion instead of rebuilding over existing data', async () => {
  const factory = new IDBFactory();
  await new Promise<void>((resolve, reject) => {
    const request = factory.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('workspace', { keyPath: 'id' });
    request.onsuccess = () => { request.result.close(); resolve(); };
    request.onerror = () => reject(request.error);
  });
  const before = await inspectDatabase(factory, name);
  await assert.rejects(open(factory), /chave do store workspace/);
  assert.deepEqual(await inspectDatabase(factory, name), before);
});

test('empty stores with a retained legacy workspace are incomplete data, not a fresh install', async () => {
  const factory = new IDBFactory();
  await seedDatabase(factory, name, 2, migrationSpace());
  const database = await open(factory, 2);
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(['notes', 'metadata'], 'readwrite');
    transaction.objectStore('notes').clear();
    transaction.objectStore('metadata').clear();
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
  const before = await inspectDatabase(factory, name);
  await assert.rejects(open(factory), /metadados ausentes/);
  assert.deepEqual(await inspectDatabase(factory, name), before);
});
