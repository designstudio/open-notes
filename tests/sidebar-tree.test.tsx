import assert from 'node:assert/strict';
import { test } from 'node:test';
import { useState } from 'react';
import { act, create, type ReactTestInstance } from 'react-test-renderer';
import type { AppSidebar as Sidebar } from '../src/app/AppSidebar';
import type { selectWorkspace as SelectWorkspace } from '../src/app/workspace-selectors';
import type { useNoteDrag as UseNoteDrag } from '../src/hooks/use-note-drag';
import { initialNotes, type AppData, type Note } from '../src/data';
import { renderNode, withBrowserGlobals } from './helpers/sidebar-environment';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Tooltips, portals and dropdowns read window/document while their module
// graph is evaluated, so the real sidebar modules load after the browser
// globals exist (this is the real component, not the app-flows stub).
let AppSidebar!: typeof Sidebar;
let selectWorkspace!: typeof SelectWorkspace;
let useNoteDrag!: typeof UseNoteDrag;
test.before(async () => {
  await withBrowserGlobals(async () => {
    ({ AppSidebar } = await import('../src/app/AppSidebar'));
    ({ selectWorkspace } = await import('../src/app/workspace-selectors'));
    ({ useNoteDrag } = await import('../src/hooks/use-note-drag'));
  });
});

const now = 1_792_080_000_000;
const note = (id: string, collection: string): Note => ({
  ...initialNotes[0], id, title: `Nota ${id}`, collection, tags: [], favorite: false,
  archived: false, deleted: false, updated: now - Number(id),
});
const collections = [
  { id: 'a', name: 'Coleção A', color: 'sage' },
  { id: 'b', name: 'Coleção B', color: 'blue' },
];
const data: AppData = {
  collections,
  folders: [],
  notes: [note('1', 'a'), note('2', 'a'), note('3', 'b'), note('4', 'b'), note('5', 'b')],
};

function Harness({ initial, data: dataOverride = data, onOpenCollection }: { initial: string[]; data?: AppData; onOpenCollection?: (id: string) => void }) {
  const [expandedCollections, setExpandedCollections] = useState(() => new Set(initial));
  const noteDrag = useNoteDrag(() => {});
  return <AppSidebar
    view="all"
    selected={null}
    profile={{ name: '', photo: '' }}
    state={{
      collapsed: false, setCollapsed() {}, sidebar: false, setSidebar() {},
      sidebarResize: { resizing: false, separatorProps: {} } as never,
      expandedCollections, setExpandedCollections,
      collectionsOpen: true, setCollectionsOpen() {}, pinnedOpen: true, setPinnedOpen() {},
      recentOpen: true, setRecentOpen() {}, toggleSidebar() {},
    } as never}
    workspace={selectWorkspace(dataOverride, 'all')}
    navigation={{ view: 'all', selected: null, activeFolder: null, navigate() {}, openNote() {}, openCollection: (id: string) => onOpenCollection?.(id) } as never}
    collections={{ openNewCollection() {}, openCollectionSettings() {}, deleteCollection() {}, toggleCollectionPin() {}, toggleCollectionArchive() {} }}
    noteDrag={noteDrag}
    toggleCollection={id => setExpandedCollections(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    })}
    createNote={() => {}}
    openSearch={() => {}}
    openSettings={() => {}}
  />;
}

// Radix dropdowns own the trigger ref and Floating UI checks refs with
// instanceof, so every node mock is a real Element instance.
const nodeMock = renderNode();
const mount = (initial: string[], dataOverride?: AppData, onOpenCollection?: (id: string) => void) =>
  create(<Harness initial={initial} data={dataOverride} onOpenCollection={onOpenCollection} />, { createNodeMock: () => nodeMock });
const byTestId = (renderer: ReactTestInstance, id: string) => renderer.root.findAll(node =>
  typeof node.type === 'string' && node.props.id === id)[0];
const list = (renderer: ReactTestInstance) => renderer.root.findAll(node => node.type === 'ul'
  && typeof node.props['aria-label'] === 'string' && node.props['aria-label'].startsWith('Notas de '));
const linksIn = (renderer: ReactTestInstance, panelId: string) => {
  const panel = byTestId(renderer, panelId);
  return panel.findAll(node => node.type === 'a' && node.props.href?.startsWith('/n/'));
};
const countOf = (renderer: ReactTestInstance, panelId: string) => {
  const head = renderer.root.findAll(node => node.type === 'a'
    && node.props['aria-controls'] === panelId)[0];
  // The sidebar renders the number as a text child, so compare as a number.
  return Number(head.findAll(node => node.props.className === 'count')[0].children[0]);
};

const toggle = (renderer: ReactTestInstance, id: string) => {
  const head = renderer.root.findAll(node => node.type === 'a'
    && node.props['aria-controls'] === `collection-notes-${id}`)[0];
  head.props.onClick({ button: 0, preventDefault() {} });
};

test('collapsing retains inert rows until the panel finishes, and reopening keeps them mounted', async () => {
  let renderer!: ReturnType<typeof create>;
  await act(async () => { renderer = mount(['a']); });
  const id = 'collection-notes-a';
  const target = {};
  const end = (propertyName: string, child = false) => byTestId(renderer, id).props.onTransitionEnd({
    propertyName, target: child ? {} : target, currentTarget: target,
  });
  try {
    await act(async () => toggle(renderer, 'a'));
    assert.equal(byTestId(renderer, id).props['aria-hidden'], true);
    assert.equal(byTestId(renderer, id).findAll(node => node.props.inert === true).length, 1);
    assert.equal(linksIn(renderer, id).length, 2, 'rows preserve panel height during collapse');
    await act(async () => { end('opacity'); end('grid-template-rows', true); });
    assert.equal(linksIn(renderer, id).length, 2, 'unrelated and bubbled transitions cannot remove rows');
    await act(async () => toggle(renderer, 'a'));
    await act(async () => end('grid-template-rows'));
    assert.equal(linksIn(renderer, id).length, 2, 'a late close event cannot remove reopened content');
    await act(async () => toggle(renderer, 'a'));
    await act(async () => end('grid-template-rows'));
    assert.equal(linksIn(renderer, id).length, 0, 'rows unmount after the closing transition');
    assert.ok(byTestId(renderer, id), 'aria-controls target remains mounted');
  } finally { await act(async () => renderer.unmount()); }
});

test('collapsing with reduced motion unmounts note rows immediately', async () => {
  const original = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ ...original(''), matches: true });
  let renderer!: ReturnType<typeof create>;
  try {
    await act(async () => { renderer = mount(['a']); });
    await act(async () => toggle(renderer, 'a'));
    assert.equal(linksIn(renderer, 'collection-notes-a').length, 0);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    globalThis.matchMedia = original;
  }
});

test('collapse cleanup uses the CSS duration when no transitionend arrives', async () => {
  const original = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '0.01s' }) as CSSStyleDeclaration;
  let renderer!: ReturnType<typeof create>;
  try {
    await act(async () => { renderer = mount(['a']); });
    await act(async () => toggle(renderer, 'a'));
    assert.equal(linksIn(renderer, 'collection-notes-a').length, 2);
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 90)); });
    assert.equal(linksIn(renderer, 'collection-notes-a').length, 0);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    globalThis.getComputedStyle = original;
  }
});

test('collapsed collections mount no note links while the panel and controls stay addressable', async () => {
  let renderer!: ReturnType<typeof create>;
  await act(async () => { renderer = mount([]); });
  try {
    assert.equal(list(renderer).length, 0, 'no collection lists are mounted');
    for (const id of ['a', 'b']) {
      const panel = byTestId(renderer, `collection-notes-${id}`);
      assert.ok(panel, 'aria-controls target exists');
      assert.equal(panel.props['aria-hidden'], true);
      assert.equal(linksIn(renderer, `collection-notes-${id}`).length, 0);
      assert.equal(panel.findAll(node => node.props.inert === true).length, 1, 'collapsed content stays inert');
    }
    assert.equal(countOf(renderer, 'collection-notes-a'), 2, 'counters come from the grouped notes');
    assert.equal(countOf(renderer, 'collection-notes-b'), 3);
    const heads = renderer.root.findAll(node => node.type === 'a'
      && typeof node.props['aria-controls'] === 'string');
    assert.deepEqual(heads.map(head => head.props['aria-expanded']), [false, false]);
  } finally { await act(async () => renderer.unmount()); }
});

test('only expanded collections render their notes, in workspace order', async () => {
  let renderer!: ReturnType<typeof create>;
  await act(async () => { renderer = mount(['b']); });
  try {
    assert.equal(list(renderer).length, 1);
    assert.equal(list(renderer)[0].props['aria-label'], 'Notas de Coleção B');
    assert.deepEqual(linksIn(renderer, 'collection-notes-b').map(link =>
      decodeURIComponent(link.props.href.split('/').at(-1))), ['3', '4', '5']);
    assert.equal(linksIn(renderer, 'collection-notes-a').length, 0);
    const head = renderer.root.findAll(node => node.type === 'a'
      && node.props['aria-controls'] === 'collection-notes-b')[0];
    assert.equal(head.props['aria-expanded'], true);
    assert.equal(byTestId(renderer, 'collection-notes-b').props['aria-hidden'], false);
    assert.equal(countOf(renderer, 'collection-notes-b'), 3);
  } finally { await act(async () => renderer.unmount()); }
});

test('collections with at most 8 notes mount every note and no Ver todas', async () => {
  const previewData: AppData = {
    collections: [
      { id: 'c0', name: 'Vazia', color: 'sage' },
      { id: 'c1', name: 'Uma', color: 'blue' },
      { id: 'c8', name: 'Oito', color: 'sage' },
    ],
    folders: [],
    notes: [note('u1', 'c1'), ...Array.from({ length: 8 }, (_, i) => note(String(100 + i), 'c8'))],
  };
  let renderer!: ReturnType<typeof create>;
  await act(async () => { renderer = mount(['c0', 'c1', 'c8'], previewData); });
  try {
    assert.equal(linksIn(renderer, 'collection-notes-c0').length, 0, 'empty collection mounts no links');
    assert.equal(linksIn(renderer, 'collection-notes-c1').length, 1);
    assert.equal(linksIn(renderer, 'collection-notes-c8').length, 8, 'exactly eight notes stay mounted');
    assert.equal(renderer.root.findAll(node => node.type === 'a'
      && typeof node.props.className === 'string'
      && node.props.className.includes('collection-notes-more')).length, 0, 'no Ver todas link');
  } finally { await act(async () => renderer.unmount()); }
});

test('collections with more than 8 notes preview eight and link to the full collection', async () => {
  const previewData: AppData = {
    collections: [
      { id: 'c9', name: 'Nove', color: 'blue' },
      { id: 'big', name: 'Grande', color: 'sage' },
    ],
    folders: [],
    notes: [
      ...Array.from({ length: 9 }, (_, i) => ({ ...note(`p${i}`, 'c9'), updated: now - i })),
      // Reversed data order proves rows follow the sidebar (recent) ordering,
      // not the order notes appear in the data.
      ...Array.from({ length: 10_000 }, (_, i) => ({ ...note(`n${i}`, 'big'), updated: now - i })).reverse(),
    ],
  };
  const opened: string[] = [];
  let renderer!: ReturnType<typeof create>;
  await act(async () => { renderer = mount(['c9', 'big'], previewData, id => opened.push(id)); });
  try {
    const nine = linksIn(renderer, 'collection-notes-c9');
    assert.equal(nine.length, 8, 'a nine-note collection previews eight rows');
    assert.deepEqual(nine.map(link => decodeURIComponent(link.props.href.split('/').at(-1))),
      Array.from({ length: 8 }, (_, i) => `p${i}`));
    const tenThousand = linksIn(renderer, 'collection-notes-big');
    assert.equal(tenThousand.length, 8, 'a ten-thousand-note collection previews eight rows');
    assert.deepEqual(tenThousand.map(link => decodeURIComponent(link.props.href.split('/').at(-1))),
      Array.from({ length: 8 }, (_, i) => `n${i}`), 'rows follow the sidebar ordering');
    assert.equal(countOf(renderer, 'collection-notes-c9'), 9, 'counters keep the full total');
    assert.equal(countOf(renderer, 'collection-notes-big'), 10_000);
    const moreLinks = renderer.root.findAll(node => node.type === 'a'
      && typeof node.props.className === 'string'
      && node.props.className.includes('collection-notes-more'));
    assert.equal(moreLinks.length, 2, 'one Ver todas per previewed collection');
    const nineMore = moreLinks.find(link => link.props.href === '/c/c9');
    assert.ok(nineMore, 'Ver todas targets the full collection view');
    assert.equal(nineMore!.props.children, 'Ver todas');
    assert.equal(nineMore!.props['aria-label'], 'Ver todas as notas de Nove');
    const bigMore = moreLinks.find(link => link.props.href === '/c/big');
    assert.ok(bigMore, 'Ver todas targets the full collection view');
    assert.equal(bigMore!.props.children, 'Ver todas');
    assert.equal(bigMore!.props['aria-label'], 'Ver todas as notas de Grande');
    assert.notEqual(nineMore!.props['aria-label'], bigMore!.props['aria-label'],
      'each Ver todas link names its own collection');
    await act(async () => {
      bigMore!.props.onClick({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, preventDefault() {} } as never);
    });
    assert.deepEqual(opened, ['big'], 'Ver todas opens the collection through the existing navigation');
  } finally { await act(async () => renderer.unmount()); }
});
