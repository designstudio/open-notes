import { makeWorkspace } from './fixtures';
import { loadLocalData, saveLocalData, openLocalDatabase } from '../src/storage/local-data';
import { DATABASE_NAME } from '../src/storage/schema';
import { selectWorkspace } from '../src/app/workspace-selectors';
import { connectionDecision, dataFingerprint } from '../src/cloud/sync-policy';
import { saveRecoveryCopy, recoveryCopies } from '../src/cloud/recovery-storage';
import type { AppData } from '../src/data';

const content = (data: AppData) => JSON.stringify([data.notes, data.collections, data.folders, data.profile]);

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function reset() {
  check(location.pathname === '/__benchmark', 'Benchmark must run on its isolated page.');
  localStorage.clear();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Benchmark database blocked.'));
  });
}

async function inspect() {
  const database = await openLocalDatabase();
  try {
    return await new Promise<{ count: number; first: unknown }>((resolve, reject) => {
      const transaction = database.transaction('notes', 'readonly');
      const count = transaction.objectStore('notes').count();
      const first = transaction.objectStore('notes').get('bench-0');
      transaction.oncomplete = () => resolve({ count: count.result, first: first.result });
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
}

async function storage(count: number, repetitions: number) {
  const samples: Record<string, number[]> = {};
  const writes: Record<string, { puts: number; deletes: number; clears: number }[]> = {};
  let recording: { puts: number; deletes: number; clears: number } | undefined;
  const prototype = IDBObjectStore.prototype;
  const originals = { put: prototype.put, delete: prototype.delete, clear: prototype.clear };
  prototype.put = function (...args: Parameters<IDBObjectStore['put']>) {
    if (recording && this.name === 'notes') recording.puts++;
    return originals.put.apply(this, args);
  };
  prototype.delete = function (...args: Parameters<IDBObjectStore['delete']>) {
    if (recording && this.name === 'notes') recording.deletes++;
    return originals.delete.apply(this, args);
  };
  prototype.clear = function () {
    if (recording && this.name === 'notes') recording.clears++;
    return originals.clear.call(this);
  };
  async function measure<T>(name: string, iteration: number, action: () => T | Promise<T>) {
    const counters = { puts: 0, deletes: 0, clears: 0 };
    recording = counters;
    const start = performance.now();
    try {
      const result = await action();
      const elapsed = performance.now() - start;
      if (iteration >= 0) {
        (samples[name] ??= []).push(elapsed);
        (writes[name] ??= []).push(counters);
      }
      return result;
    } finally { recording = undefined; }
  }
  const fixture = makeWorkspace(count);
  const bytes = new TextEncoder().encode(JSON.stringify(fixture)).length;
  try {
    // One whole round is warm-up. Reset outside timing between independent rounds.
    for (let iteration = -1; iteration < repetitions; iteration++) {
      await reset();
      let data = makeWorkspace(count);
      await measure('initialSave', iteration, () => saveLocalData(data));
      const loaded = await measure('load', iteration, () => loadLocalData());
      check(content(loaded) === content(data), 'Load changed fixture content/order.');
      data = loaded;
      await measure('unchangedSave', iteration, () => saveLocalData(data));
      data = { ...data, notes: data.notes.map((note, i) => i === 0 ? { ...note, title: `${note.title} editada`, updated: note.updated + 1 } : note) };
      await measure('editOne', iteration, () => saveLocalData(data));
      const edited = await inspect();
      check(JSON.stringify(edited.first) === JSON.stringify(data.notes[0]), 'Edit not persisted.');
      const added = { ...data.notes[0], id: 'bench-created', title: 'Nota criada' };
      data = { ...data, notes: [added, ...data.notes] };
      await measure('createOne', iteration, () => saveLocalData(data));
      check((await inspect()).count === count + 1, 'Creation not persisted.');
      data = { ...data, notes: data.notes.filter(note => note.id !== added.id) };
      await measure('deleteOne', iteration, () => saveLocalData(data));
      check((await inspect()).count === count, 'Deletion not persisted.');
      check(content(await loadLocalData()) === content(data), 'CRUD changed unrelated notes.');
      const selected = await measure('selectWorkspace', iteration, () => selectWorkspace(data, 'benchmark'));
      check(selected.active.length === count, 'Selector omitted notes.');
      const fingerprint = await measure('fingerprint', iteration, () => dataFingerprint(data));
      check(fingerprint.length > 0, 'Empty fingerprint.');
      const remote = structuredClone(data);
      check(await measure('compareSame', iteration, () => connectionDecision(data, remote)) === 'same', 'Equal data reported as conflict.');
      remote.notes[0].title += ' remota';
      check(await measure('compareConflict', iteration, () => connectionDecision(data, remote)) === 'conflict', 'Conflict undetected.');
      const serialized = await measure('serializeUpload', iteration, () => JSON.stringify({ schemaVersion: 1, updatedAt: 1_760_000_000_000, data }));
      check(JSON.parse(serialized).data.notes.length === count, 'Invalid upload.');
      await measure('backupTwoCopies', iteration, () => saveRecoveryCopy(data, remote, 'open-notes-drive-recovery-benchmark'));
      const copies = await recoveryCopies();
      check(copies.length === 1 && JSON.stringify(copies[0].local) === JSON.stringify(data)
        && JSON.stringify(copies[0].remote) === JSON.stringify(remote), 'Recovery copy changed content.');
      if (iteration >= 0) {
        const expected = { initialSave: [count, 0], unchangedSave: [0, 0], editOne: [1, 0], createOne: [1, 0], deleteOne: [0, 1] };
        for (const [name, [puts, deletes]] of Object.entries(expected)) {
          const observed = writes[name].at(-1)!;
          check(observed.puts === puts && observed.deletes === deletes && observed.clears === 0, `Unexpected write amplification: ${name}`);
        }
      }
    }
    return { count, bytes, samples, writes, checks: 'passed' };
  } finally { Object.assign(prototype, originals); }
}

async function seed(count: number) {
  await reset();
  await saveLocalData(makeWorkspace(count));
}

Object.assign(window, { benchmark: { storage, seed } });
