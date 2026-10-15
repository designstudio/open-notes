import assert from 'node:assert/strict';
import test from 'node:test';
import { readSidebarState, saveSidebarState } from '../src/sidebar-state';

test('sidebar expansion and explicitly closed sections survive a reload', () => {
  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
  } as Storage;
  const state = {
    collapsed: true, collectionsOpen: false, pinnedOpen: false, recentOpen: false,
    expandedCollections: ['collection-a', 'collection-b'],
  };
  saveSidebarState(state);
  assert.deepEqual(readSidebarState(), state);
  saveSidebarState({ ...state, expandedCollections: [] });
  assert.deepEqual(readSidebarState().expandedCollections, [], 'closed collections stay closed');
});

test('invalid or unavailable sidebar storage does not prevent the app from opening', () => {
  globalThis.localStorage = { getItem: () => '{broken' } as unknown as Storage;
  assert.equal(readSidebarState().collectionsOpen, true);
  globalThis.localStorage = {
    getItem: () => JSON.stringify({ collectionsOpen: false, expandedCollections: ['a', null, 12, 'a'] }),
  } as unknown as Storage;
  assert.deepEqual(readSidebarState().expandedCollections, ['a']);
  assert.equal(readSidebarState().collectionsOpen, false);
  assert.equal(readSidebarState().pinnedOpen, true, 'older saved states default to showing pinned collections');
  globalThis.localStorage = {
    getItem: () => { throw new Error('Blocked'); },
    setItem: () => { throw new Error('Blocked'); },
  } as unknown as Storage;
  assert.doesNotThrow(() => saveSidebarState(readSidebarState()));
});
