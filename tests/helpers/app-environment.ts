import { act } from 'react-test-renderer';
import { IDBFactory } from 'fake-indexeddb';
import type { AppData } from '../../src/data';
import type { DriveSnapshot } from '../../src/cloud/google-drive';

type RequestKind = 'list' | 'read' | 'write';
type Gate = { kind: RequestKind; start: () => void; wait: Promise<void> };
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
};

export function appEnvironment(path: string, remoteData: AppData | null) {
  const originals = new Map<string, PropertyDescriptor | undefined>();
  function replace(key: string, value: unknown) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  let now = 1_792_080_000_000;
  const originalNow = Date.now;
  Date.now = () => now;
  let timerId = 0, online = true, authDenied = false;
  const timers = new Map<number, { at: number; callback: () => void }>();
  const listeners = new Map<string, Set<() => void>>();
  const location = { pathname: '', search: '' };
  function locate(path: string) {
    const url = new URL(path, 'https://notes.test');
    Object.assign(location, { pathname: url.pathname, search: url.search });
  }
  locate(path);
  const storage: Record<string, string> = {};
  Object.defineProperties(storage, {
    getItem: { value: (key: string) => storage[key] ?? null },
    setItem: { value: (key: string, value: string) => { storage[key] = String(value); } },
    removeItem: { value: (key: string) => { delete storage[key]; } },
  });
  replace('localStorage', storage);
  replace('indexedDB', new IDBFactory());
  replace('navigator', { get onLine() { return online; } });
  replace('IS_REACT_ACT_ENVIRONMENT', true);
  const classList = { add() {}, remove() {}, toggle() {} };
  replace('document', {
    documentElement: { classList, dataset: {}, style: { setProperty() {} }, offsetHeight: 0 },
    body: { classList }, querySelector: () => null,
  });
  replace('requestAnimationFrame', (callback: () => void) => { callback(); return 1; });
  replace('window', {
    innerWidth: 1440, location,
    history: {
      pushState(_state: unknown, _title: string, path: string) { locate(path); },
      replaceState(_state: unknown, _title: string, path: string) { locate(path); },
    },
    scrollTo() {},
    setTimeout(callback: () => void, delay: number) {
      timers.set(++timerId, { at: now + delay, callback });
      return timerId;
    },
    clearTimeout(id: number) { timers.delete(id); },
    addEventListener(type: string, listener: () => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: () => void) { listeners.get(type)?.delete(listener); },
    google: { accounts: { oauth2: {
      initTokenClient({ callback }: { callback: (response: object) => void }) {
        return { requestAccessToken: () => callback(authDenied
          ? { error: 'access_denied', error_description: 'Acesso cancelado no teste' }
          : { access_token: 'test-only-token' }) };
      },
      revoke() {},
    } } },
  });

  let remote: unknown = remoteData ? snapshot(remoteData) : null;
  let nextFailure: { kind: RequestKind; status: number } | undefined;
  let gate: Gate | undefined;
  const requests: { kind: RequestKind; method: string }[] = [];
  const uploads: DriveSnapshot[] = [];
  function snapshot(data: AppData): DriveSnapshot { return { schemaVersion: 1, updatedAt: now, data: structuredClone(data) }; }
  replace('fetch', async (input: string, init: RequestInit = {}) => {
    const url = new URL(String(input));
    if (url.origin !== 'https://www.googleapis.com') throw new Error('Unexpected network destination in test');
    const method = init.method || 'GET';
    const kind: RequestKind = method === 'POST' || method === 'PATCH' ? 'write' : url.searchParams.get('alt') === 'media' ? 'read' : 'list';
    requests.push({ kind, method });
    if (!online) throw new TypeError('Simulated offline network');
    let incoming: DriveSnapshot | undefined;
    if (method === 'PATCH') incoming = JSON.parse(init.body as string);
    if (method === 'POST') {
      const text = await (init.body as Blob).text();
      incoming = JSON.parse(text.split('\r\n').find(line => line.startsWith('{"schemaVersion":'))!);
    }
    if (gate?.kind === kind) {
      const current = gate;
      gate = undefined;
      current.start();
      await current.wait;
    }
    if (nextFailure?.kind === kind) {
      const { status } = nextFailure;
      nextFailure = undefined;
      return new Response(JSON.stringify({ error: { message: `Simulated HTTP ${status}` } }), { status });
    }
    if (incoming) {
      remote = structuredClone(incoming);
      uploads.push(structuredClone(incoming));
      return new Response(JSON.stringify({ id: 'test-drive-file' }));
    }
    return new Response(JSON.stringify(kind === 'read' ? remote : { files: remote ? [{ id: 'test-drive-file' }] : [] }));
  });

  return {
    storage, requests, uploads, listeners, timers, locate,
    remote: () => structuredClone((remote as DriveSnapshot | null)?.data),
    changeRemote: (data: AppData) => { remote = snapshot(data); },
    corruptRemote: (value: unknown) => { remote = value; },
    failNext: (kind: RequestKind, status = 500) => { nextFailure = { kind, status }; },
    denyAuth: () => { authDenied = true; },
    pauseNext(kind: RequestKind) {
      const started = deferred(), released = deferred();
      gate = { kind, start: started.resolve, wait: released.promise };
      return { started: started.promise, release: released.resolve };
    },
    async advance(ms: number) {
      const end = now + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        await act(async () => { next[1].callback(); });
      }
      now = end;
    },
    async network(available: boolean) {
      online = available;
      await act(async () => listeners.get(online ? 'online' : 'offline')?.forEach(listener => listener()));
    },
    restore() {
      Date.now = originalNow;
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    },
  };
}
