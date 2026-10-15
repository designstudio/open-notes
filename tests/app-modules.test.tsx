import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StrictMode, useState, type MouseEvent } from 'react';
import { act, create } from 'react-test-renderer';
import { IDBFactory } from 'fake-indexeddb';
import { initialNotes, initialCollections, initialFolders, type AppData } from '../src/data';
import { handleInternalLink, hrefForRoute, routeFromLocation } from '../src/app/navigation';
import { useNavigation } from '../src/app/use-navigation';
import { useLocalPersistence } from '../src/app/use-local-persistence';
import { useToasts } from '../src/app/use-toasts';
import { loadLocalData } from '../src/local-data';
import { getWorkspaceSession, type WorkspaceSessionCache } from '../src/app/workspace-session';

test('development remounts retain both new notes instead of saving the initial snapshot again', async () => {
  globalThis.indexedDB = new IDBFactory();
  const initial = examples();
  const cache: WorkspaceSessionCache = {};
  const originalSession = getWorkspaceSession(cache, initial);
  const first = { ...initial.notes[0], id: 'new-first', title: 'Primeira nota nova', body: 'Texto escrito hoje' };
  const second = { ...initial.notes[0], id: 'new-second', title: 'Segunda nota nova', body: 'Outro texto de hoje' };
  originalSession.setData(current => ({ ...current, notes: [...current.notes, first, second] }));
  // Vite remounts App after hook order changes; main still supplies initial.
  const remountedSession = getWorkspaceSession(cache, initial);
  assert.equal(remountedSession, originalSession);
  assert.deepEqual(remountedSession.getSnapshot().notes.slice(-2), [first, second]);
  const { saveLocalData } = await import('../src/local-data');
  await saveLocalData(remountedSession.getSnapshot());
  assert.deepEqual((await loadLocalData()).notes.slice(-2), [first, second]);
});

test('workspace session updates notify mounted subscribers and unsubscribe cleanly', () => {
  const session = getWorkspaceSession({}, examples());
  let notifications = 0;
  const unsubscribe = session.subscribe(() => notifications++);
  session.setData(current => ({ ...current, notes: [] }));
  assert.equal(notifications, 1);
  session.setData(current => current);
  assert.equal(notifications, 1);
  unsubscribe();
  session.setData(examples());
  assert.equal(notifications, 1);
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const examples = (): AppData => structuredClone({ notes: initialNotes, collections: initialCollections, folders: initialFolders });

function browser(path = '/') {
  const listeners = new Map<string, Set<() => void>>();
  const visits: string[] = [];
  const location = { pathname: '', search: '' };
  const locate = (path: string) => {
    const url = new URL(path, 'https://notes.test');
    Object.assign(location, { pathname: url.pathname, search: url.search });
  };
  locate(path);
  globalThis.window = {
    location,
    history: {
      pushState(_state: unknown, _unused: string, path: string) { visits.push(path); locate(path); },
      replaceState(_state: unknown, _unused: string, path: string) { locate(path); },
    },
    addEventListener(type: string, listener: () => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: () => void) { listeners.get(type)?.delete(listener); },
    scrollTo() {},
  } as any;
  globalThis.document = { querySelector: () => null } as any;
  return {
    visits,
    listeners,
    locate,
    pop(path: string) { locate(path); listeners.get('popstate')?.forEach(listener => listener()); },
  };
}

test('routes preserve library tabs, note status, folders and missing-content fallbacks', () => {
  const data = examples();
  const location = browser();
  const cases = [
    ['/library?tab=favorites', 'favorites', null, null],
    ['/archive', 'archive', null, null],
    ['/deleted', 'trash', null, null],
    ['/n/3', 'trabalho', '3', 'f-projetos'],
    ['/c/trabalho?folder=f-reunioes', 'trabalho', null, 'f-reunioes'],
    ['/c/trabalho?folder=f-rotina', 'not-found', null, null],
    ['/n/missing', 'not-found', null, null],
    ['/c/missing', 'not-found', null, null],
  ] as const;
  for (const [path, view, selected, activeFolder] of cases) {
    location.locate(path);
    const route = routeFromLocation(data);
    assert.deepEqual(route, { view, selected, activeFolder });
    if (view !== 'not-found') assert.equal(hrefForRoute(route), path);
  }
  data.notes[2].deleted = true;
  location.locate('/n/3');
  assert.equal(routeFromLocation(data).view, 'trash');
  data.notes[2].deleted = false;
  data.notes[2].archived = true;
  assert.equal(routeFromLocation(data).view, 'archive');
});

test('internal links keep modified clicks native and intercept ordinary navigation', () => {
  let prevented = 0, navigated = 0;
  const click = { button: 0, preventDefault: () => prevented++ };
  for (const modifier of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
    handleInternalLink({ ...click, [modifier]: true } as unknown as MouseEvent<HTMLAnchorElement>, () => navigated++);
  }
  handleInternalLink({ ...click, button: 1 } as unknown as MouseEvent<HTMLAnchorElement>, () => navigated++);
  assert.equal(navigated, 0);
  assert.equal(prevented, 0);
  handleInternalLink(click as unknown as MouseEvent<HTMLAnchorElement>, () => navigated++);
  assert.equal(navigated, 1);
  assert.equal(prevented, 1);
});

test('navigation resets transient UI and popstate resolves the latest data with listener cleanup', async () => {
  const environment = browser();
  let navigation: ReturnType<typeof useNavigation>;
  let state: { search: string; sidebar: boolean; expanded: Set<string> };
  let edit: (data: AppData) => void;
  function Harness() {
    const [data, setData] = useState(examples);
    const [search, setSearch] = useState('previous filter');
    const [sidebar, setSidebar] = useState(true);
    const [expanded, setExpandedCollections] = useState(new Set<string>());
    navigation = useNavigation(data, { setSearch, setSidebar, setExpandedCollections });
    state = { search, sidebar, expanded };
    edit = setData;
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<StrictMode><Harness /></StrictMode>); });
  try {
    assert.equal(window.location.pathname, '/library');
    await act(async () => navigation.openCollection('trabalho', 'f-projetos'));
    assert.equal(window.location.search, '?folder=f-projetos');
    assert.equal(state!.search, '');
    assert.equal(state!.sidebar, false);
    assert.ok(state!.expanded.has('trabalho'));
    await act(async () => navigation.openNote('3'));
    assert.equal(navigation!.selected, '3');
    const next = examples();
    next.notes.push({ ...next.notes[0], id: 'new-note', collection: 'ideias', folder: '' });
    await act(async () => edit(next));
    await act(async () => environment.pop('/n/new-note'));
    assert.equal(navigation!.selected, 'new-note');
    assert.equal(navigation!.view, 'ideias');
    assert.ok(state!.expanded.has('ideias'));
    const count = environment.visits.length;
    await act(async () => navigation.navigate('trash', 'replace'));
    assert.equal(environment.visits.length, count);
    assert.equal(window.location.pathname, '/deleted');
    await act(async () => environment.pop('/c/missing'));
    assert.equal(navigation!.view, 'not-found');
    assert.equal(environment.listeners.get('popstate')?.size, 1);
  } finally {
    await act(async () => renderer!.unmount());
    assert.equal(environment.listeners.get('popstate')?.size, 0);
  }
});

test('extracted persistence saves edits and profile feedback does not trigger another save', async () => {
  globalThis.indexedDB = new IDBFactory();
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  } });
  const initial = examples();
  let edit: (data: AppData) => void;
  let persistence: ReturnType<typeof useLocalPersistence>;
  let notifications: ReturnType<typeof useToasts>;
  function Harness() {
    const [data, setData] = useState(initial);
    notifications = useToasts();
    persistence = useLocalPersistence(data, initial, notifications.setToast);
    edit = setData;
    return null;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<StrictMode><Harness /></StrictMode>); });
  const settle = () => act(async () => { await loadLocalData(); });
  try {
    await settle();
    const updated = { ...examples(), profile: { name: 'Teste', photo: '' } };
    updated.notes[0].title = 'Edição salva';
    await act(async () => edit(updated));
    await settle();
    assert.deepEqual(await loadLocalData(), updated);
    assert.equal(persistence!.savedData, updated);
    assert.equal(persistence!.saveFailed, false);
    assert.equal(notifications!.toasts.at(-1)?.message, 'Nome atualizado');
    const callback = notifications!.setToast;
    const saved = persistence!.savedData;
    await act(async () => notifications.setToast('Outra ação'));
    assert.equal(notifications!.setToast, callback);
    assert.equal(persistence!.savedData, saved);
  } finally { await act(async () => renderer!.unmount()); }
});
