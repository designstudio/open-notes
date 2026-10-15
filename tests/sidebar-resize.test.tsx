import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act, create } from 'react-test-renderer';
import { useSidebarResize } from '../src/hooks/use-sidebar-resize';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test('sidebar supports bounded dragging, keyboard resizing, persistence and cancellation', async () => {
  const storage = new Map<string, string>();
  const classes = new Set<string>();
  let resizeWindow = () => {};
  globalThis.window = {
    innerWidth: 1200,
    addEventListener: (_: string, callback: () => void) => { resizeWindow = callback; },
    removeEventListener() {},
  } as any;
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } as any;
  globalThis.document = { body: { classList: {
    add: (name: string) => classes.add(name),
    remove: (name: string) => classes.delete(name),
  } } } as any;
  let state!: ReturnType<typeof useSidebarResize>;
  function Harness() { state = useSidebarResize(); return null; }
  let renderer!: ReturnType<typeof create>;
  const mount = () => act(async () => { renderer = create(<Harness />); });
  const pointer = (x: number, id = 1) => ({
    clientX: x, pointerId: id, button: 0, isPrimary: true, preventDefault() {},
    currentTarget: { focus() {}, setPointerCapture() {}, releasePointerCapture() {} },
  }) as any;
  const width = () => state.separatorProps['aria-valuenow'];
  await mount();
  assert.equal(width(), 258);
  await act(async () => state.separatorProps.onPointerDown(pointer(258)));
  assert.equal(classes.has('sidebar-is-resizing'), true);
  await act(async () => state.separatorProps.onPointerMove(pointer(350, 2)));
  assert.equal(width(), 258, 'other pointers do not affect the active drag');
  await act(async () => state.separatorProps.onPointerMove(pointer(350)));
  assert.equal(width(), 350);
  await act(async () => state.separatorProps.onPointerMove(pointer(900)));
  assert.equal(width(), 480);
  await act(async () => state.separatorProps.onPointerMove(pointer(100)));
  assert.equal(width(), 220);
  await act(async () => state.separatorProps.onPointerCancel());
  assert.equal(state.resizing, false);
  assert.equal(classes.size, 0);
  await act(async () => state.separatorProps.onPointerMove(pointer(400)));
  assert.equal(width(), 220);
  await act(async () => state.separatorProps.onKeyDown({ key: 'ArrowRight', shiftKey: true, preventDefault() {} } as any));
  assert.equal(width(), 252);
  await act(async () => renderer.unmount());
  await mount();
  assert.equal(width(), 252, 'width survives remount');
  await act(async () => state.separatorProps.onDoubleClick());
  assert.equal(width(), 258);
  await act(async () => state.separatorProps.onKeyDown({ key: 'End', preventDefault() {} } as any));
  window.innerWidth = 768;
  await act(async () => resizeWindow());
  assert.equal(width(), 408, 'leave at least 360px for the document');
  window.innerWidth = 390;
  await act(async () => resizeWindow());
  assert.equal(width(), 408, 'mobile drawer preserves the desktop preference');
  await act(async () => state.separatorProps.onPointerDown(pointer(408)));
  await act(async () => renderer.unmount());
  assert.equal(classes.size, 0, 'unmount restores the cursor and text selection');
});
