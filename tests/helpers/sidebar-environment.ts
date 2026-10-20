// Minimal browser surface for rendering real sidebar components with
// react-test-renderer. Floating UI, Radix and tooltips read window,
// document, matchMedia and node constructors during render.
export async function withBrowserGlobals<Module>(load: () => Promise<Module>) {
  const listeners = new Map<string, Set<() => void>>();
  const matchMedia = () => ({
    matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  });
  class MockNode {
    setAttribute() {}
    removeAttribute() {}
    getAttribute() { return null; }
    addEventListener() {}
    removeEventListener() {}
    contains() { return false; }
    style = {};
    dataset = {};
  }
  const ownerDocument = { defaultView: globalThis.window };
  Object.defineProperty(MockNode.prototype, 'ownerDocument', { get: () => ownerDocument });
  Object.assign(globalThis, {
    Element: MockNode, Node: MockNode, matchMedia,
    cancelAnimationFrame: () => {},
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  });
  globalThis.window = Object.assign({
    location: { pathname: '/library', search: '' },
    innerWidth: 1440,
    setTimeout,
    clearTimeout,
    matchMedia,
  }, {
    Element: MockNode,
    Node: MockNode,
    addEventListener(type: string, listener: () => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: () => void) { listeners.get(type)?.delete(listener); },
  }) as unknown as Window & typeof globalThis;
  const classes = { add() {}, remove() {}, toggle() {} };
  globalThis.document = Object.assign({
    documentElement: { classList: classes, dataset: {}, style: { setProperty() {} }, offsetHeight: 0 },
    body: { classList: classes },
    querySelector: () => null,
    addEventListener() {},
    removeEventListener() {},
  }, { defaultView: globalThis.window }) as unknown as Document;
  return load();
}

/** A mock render node accepted by Floating UI's typeof checks. */
export function renderNode() {
  return new (globalThis.Element as unknown as { new (): object })();
}
