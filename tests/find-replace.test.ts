import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSchema } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { EditorState } from '@tiptap/pm/state';
import { history, closeHistory, undo } from '@tiptap/pm/history';
import { createFindPlugin, findKey, findMatches, replaceMatches } from '../src/FindReplace';

const schema = getSchema([StarterKit, TableKit]);
const paragraph = (text: string) => schema.node('paragraph', null, text ? schema.text(text) : undefined);
const document = (...blocks: ReturnType<typeof paragraph>[]) => schema.node('doc', null, blocks);
function search(doc: ReturnType<typeof document>, query: string) {
  const state = EditorState.create({ doc, plugins: [createFindPlugin(), history()] });
  return state.apply(state.tr.setMeta(findKey, { query }));
}

test('find is literal, case insensitive, and keeps Unicode document offsets', () => {
  const doc = document(paragraph('İ Bento bento BENTO [a]. 🙂 Bento'));
  assert.equal(findMatches(doc, 'bento').length, 4);
  const [literal] = findMatches(doc, '[a].');
  assert.equal(doc.textBetween(literal.from, literal.to), '[a].');
  assert.equal(findMatches(doc, '').length, 0);
  const [unicode] = findMatches(doc, '🙂 Bento');
  assert.equal(doc.textBetween(unicode.from, unicode.to), '🙂 Bento');
});

test('find crosses marks but never crosses blocks or hard breaks', () => {
  const doc = document(schema.node('paragraph', null, [
    schema.text('Ben', [schema.mark('bold')]), schema.text('to'),
    schema.node('hardBreak'), schema.text('Bento'),
  ]), paragraph('Ben'), paragraph('to'));
  assert.equal(findMatches(doc, 'Bento').length, 2);
  assert.equal(findMatches(doc, 'BentoBento').length, 0);
  assert.equal(findMatches(doc, 'BentoBen').length, 0);
});

test('query and navigation are decorations and never modify the saved document', () => {
  const doc = document(paragraph('Bento Bento'));
  let state = search(doc, 'Bento');
  state = state.apply(state.tr.setMeta(findKey, { active: 1 }));
  assert.equal(state.doc, doc);
  assert.equal(findKey.getState(state)?.active, 1);
  assert.equal(findKey.getState(state)?.decorations.find().length, 2);
  state = state.apply(state.tr.setMeta(findKey, { query: '' }));
  assert.equal(findKey.getState(state)?.decorations.find().length, 0);
});

test('replace uses literal text and preserves surrounding marks and block structure', () => {
  const doc = document(schema.node('paragraph', null, [
    schema.text('Bento', [schema.mark('bold')]), schema.text(' e '),
    schema.text('Bento', [schema.mark('italic')]),
  ]), schema.node('heading', { level: 2 }, schema.text('Bento')));
  let state = search(doc, 'bento');
  state = state.apply(replaceMatches(state, '<b>$&</b>', true)!);
  assert.equal(state.doc.child(0).textContent, '<b>$&</b> e <b>$&</b>');
  assert.equal(state.doc.child(0).child(0).marks[0].type.name, 'bold');
  assert.equal(state.doc.child(0).lastChild?.marks[0].type.name, 'italic');
  assert.equal(state.doc.child(1).type.name, 'heading');
  assert.equal(findKey.getState(state)?.matches.length, 0);
});

test('replace current proceeds to next result, even when replacement contains the query', () => {
  let state = search(document(paragraph('Bento Bento')), 'Bento');
  state = state.apply(replaceMatches(state, 'Bento!', false)!);
  const found = findKey.getState(state)!;
  assert.equal(state.doc.textContent, 'Bento! Bento');
  assert.equal(found.active, 1);
  assert.equal(state.doc.textBetween(found.matches[found.active].from, found.matches[found.active].to), 'Bento');
});

test('empty replacement removes all matches and replace all is one undo step', () => {
  const doc = document(paragraph('Bento Bento'), paragraph('Bento'));
  let state = search(doc, 'Bento');
  state = state.apply(replaceMatches(state, '', true)!);
  state = state.apply(closeHistory(state.tr).setMeta('addToHistory', false));
  assert.equal(state.doc.child(0).textContent, ' ');
  assert.equal(state.doc.child(1).textContent, '');
  assert.equal(state.doc.childCount, 2);
  assert.equal(undo(state, tr => { state = state.apply(tr); }), true);
  assert.deepEqual(state.doc.toJSON(), doc.toJSON());
  assert.equal(findKey.getState(state)?.matches.length, 3);
});

test('find follows edits and safely handles no matches', () => {
  let state = search(document(paragraph('Bento')), 'Bento');
  state = state.apply(state.tr.insertText('Bento ', 1));
  assert.equal(findKey.getState(state)?.matches.length, 2);
  state = state.apply(state.tr.setMeta(findKey, { query: 'ausente' }));
  assert.equal(findKey.getState(state)?.active, -1);
  assert.equal(replaceMatches(state, 'x', false), null);
});

test('replacement history stays separate from typing before and after it', () => {
  const doc = document(paragraph('Bento Bento'));
  let state = search(doc, 'Bento');
  state = state.apply(state.tr.insertText('!', state.doc.content.size - 1));
  const beforeReplace = state.doc.toJSON();
  state = state.apply(replaceMatches(state, 'Ana', true)!);
  state = state.apply(closeHistory(state.tr).setMeta('addToHistory', false));
  const afterReplace = state.doc.toJSON();
  state = state.apply(state.tr.insertText('?', state.doc.content.size - 1));
  undo(state, tr => { state = state.apply(tr); });
  assert.deepEqual(state.doc.toJSON(), afterReplace);
  undo(state, tr => { state = state.apply(tr); });
  assert.deepEqual(state.doc.toJSON(), beforeReplace);
  undo(state, tr => { state = state.apply(tr); });
  assert.deepEqual(state.doc.toJSON(), doc.toJSON());
});

test('find and replace traverse lists and tables without changing their structure', () => {
  const doc = document(
    schema.node('bulletList', null, schema.node('listItem', null, paragraph('Bento'))),
    schema.node('table', null, schema.node('tableRow', null, [
      schema.node('tableCell', null, paragraph('Bento')),
      schema.node('tableCell', null, paragraph('Bento')),
    ])),
  );
  let state = search(doc, 'Bento');
  assert.equal(findKey.getState(state)?.matches.length, 3);
  state = state.apply(replaceMatches(state, 'Ana', true)!);
  assert.equal(state.doc.child(0).type.name, 'bulletList');
  assert.equal(state.doc.child(0).textContent, 'Ana');
  assert.equal(state.doc.child(1).type.name, 'table');
  assert.equal(state.doc.child(1).child(0).childCount, 2);
  assert.equal(state.doc.child(1).textContent, 'AnaAna');
});
