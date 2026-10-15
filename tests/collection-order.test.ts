import assert from 'node:assert/strict';
import { test } from 'node:test';
import { orderCollections } from '../src/collection-order';

test('keeps pinned collections first, then sorts by creation rather than position', () => {
  const collections = [
    { id: 'new', name: 'Nova', color: '', createdAt: 300 },
    { id: 'pin', name: 'Fixada', color: '', createdAt: 100, pinned: true },
    { id: 'old', name: 'Antiga', color: '', createdAt: 200 },
  ];
  assert.deepEqual(orderCollections(collections).map(c => c.id), ['pin', 'new', 'old']);
  assert.equal(collections[0].id, 'new');
});

test('uses the previous append order for collections without creation dates', () => {
  const collections = [
    { id: 'old', name: 'Antiga', color: '' },
    { id: 'new', name: 'Nova', color: '' },
    { id: 'pin', name: 'Fixada', color: '', pinned: true },
    { id: 'latest', name: 'Última', color: '', createdAt: 300 },
  ];
  assert.deepEqual(orderCollections(collections).map(c => c.id), ['pin', 'latest', 'new', 'old']);
});
