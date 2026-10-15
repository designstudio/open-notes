import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StrictMode, useCallback, useState } from 'react';
import { act, create } from 'react-test-renderer';
import { ToastStack, type ToastEvent } from '../src/Feedback';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

async function setup(kinds: ToastEvent['kind'][] = ['success'], reduced = true, action?: ToastEvent['action']) {
  let now = 10_000, timerId = 0, popoverOpen = false;
  const timers = new Map<number, { at: number; callback: () => void }>();
  const originalNow = Date.now;
  Date.now = () => now;
  globalThis.window = {
    setTimeout(callback: () => void, delay: number) { timers.set(++timerId, { at: now + delay, callback }); return timerId; },
    clearTimeout(id: number) { timers.delete(id); },
  } as any;
  globalThis.matchMedia = (() => ({ matches: reduced, addEventListener() {}, removeEventListener() {} })) as any;
  globalThis.cancelAnimationFrame = () => {};
  globalThis.document = { documentElement: {} } as any;
  globalThis.getComputedStyle = (() => ({ getPropertyValue: (token: string) => token === '--stack-open' ? '450ms' : token === '--stack-hold' ? '200ms' : '250ms' })) as any;
  let send: (message: string, action?: ToastEvent['action']) => void;
  let nextId = kinds.length;
  function Harness() {
    const [events, setEvents] = useState(kinds.map((kind, id) => ({ id, kind, message: `Mensagem ${id}`, createdAt: 0, action: id === 0 ? action : undefined })));
    const dismiss = useCallback((id: number) => setEvents(current => current.filter(event => event.id !== id)), []);
    send = (message, action) => setEvents([{ id: nextId++, kind: 'success', message, createdAt: now, action }]);
    return <ToastStack events={events} onDismiss={dismiss} />;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<StrictMode><Harness /></StrictMode>, { createNodeMock: () => ({
    matches: () => popoverOpen,
    contains: () => false,
    querySelectorAll: () => [],
    style: { setProperty() {} },
    showPopover: () => { popoverOpen = true; },
    hidePopover: () => { popoverOpen = false; },
  }) }); });
  const advance = async (ms: number) => {
    const end = now + ms;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at;
      timers.delete(next[0]);
      await act(async () => next[1].callback());
    }
    now = end;
  };
  return {
    messages: () => renderer!.root.findAll(node => node.props.className === 'toast-message').map(node => node.props.children),
    stack: () => renderer!.root.findByProps({ className: 'toast-position' }),
    banners: () => renderer!.root.findAll(node => node.props['data-depth'] !== undefined),
    buttons: () => renderer!.root.findAllByType('button'),
    send: (message: string, action?: ToastEvent['action']) => act(async () => send(message, action)),
    emit: (message: string) => send(message),
    advance,
    cleanup: async () => { await act(async () => renderer!.unmount()); assert.equal(timers.size, 0); Date.now = originalNow; },
  };
}

test('only the latest notification is shown, with no backlog', async () => {
  const app = await setup(['success', 'success', 'success']);
  try {
    assert.deepEqual(app.messages(), ['Mensagem 2']);
    await app.advance(3000);
    assert.deepEqual(app.messages(), []);
  } finally { await app.cleanup(); }
});

test('replacement pushes the old banner back before retiring it, with no access to it', async () => {
  const app = await setup(['success'], false, { label: 'Restaurar', onClick: () => {} });
  try {
    await app.send('Nova mensagem');
    assert.deepEqual(app.messages(), ['Mensagem 0', 'Nova mensagem']);
    assert.equal(app.banners()[0].props['aria-hidden'], true);
    assert.equal(app.banners()[0].props.inert, true);
    assert.equal(app.banners()[0].props['data-depth'], 1);
    assert.equal(app.banners()[1].props['data-depth'], 0);
    assert.ok(!app.banners()[0].props.className.includes('is-leaving'));
    assert.ok(app.buttons().filter(button => button.props.children === 'Restaurar').every(button => button.props.disabled));
    await app.advance(649);
    assert.equal(app.messages().length, 2);
    await app.advance(1);
    assert.ok(app.banners()[0].props.className.includes('is-leaving'));
    await app.advance(249);
    assert.equal(app.messages().length, 2);
    await app.advance(1);
    assert.deepEqual(app.messages(), ['Nova mensagem']);
    await app.advance(2100);
    await app.advance(250);
    assert.deepEqual(app.messages(), []);
  } finally { await app.cleanup(); }
});

test('rapid arrivals retain only the latest toast and its immediate predecessor', async () => {
  const app = await setup(['success'], false);
  try {
    await app.send('Segunda');
    await app.send('Terceira');
    await app.send('Quarta');
    assert.deepEqual(app.messages(), ['Terceira', 'Quarta']);
    await app.advance(900);
    assert.deepEqual(app.messages(), ['Quarta']);
  } finally { await app.cleanup(); }
});

test('reduced motion replaces immediately and entry does not rely on frame callbacks', async () => {
  const app = await setup();
  try {
    await app.send('Nova mensagem');
    await app.advance(0);
    assert.deepEqual(app.messages(), ['Nova mensagem']);
    assert.ok(app.banners().every(node => !node.props.className.includes('is-enter')));
  } finally { await app.cleanup(); }
});

test('hover pauses the current toast but does not stop replacement', async () => {
  const app = await setup(['success'], false);
  try {
    await app.advance(1000);
    await act(async () => app.stack().props.onMouseEnter());
    await app.advance(10_000);
    assert.equal(app.messages().length, 1);
    await app.send('Nova mensagem');
    await app.advance(900);
    assert.deepEqual(app.messages(), ['Nova mensagem']);
    await act(async () => app.stack().props.onMouseLeave());
    await app.advance(2999);
    assert.equal(app.messages().length, 1);
    await app.advance(251);
    assert.equal(app.messages().length, 0);
  } finally { await app.cleanup(); }
});

test('keyboard focus pauses errors until focus leaves', async () => {
  const app = await setup(['error']);
  try {
    await act(async () => app.stack().props.onFocus());
    await app.advance(10_000);
    assert.equal(app.messages().length, 1);
    await act(async () => app.stack().props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null }));
    await app.advance(4999);
    assert.equal(app.messages().length, 1);
    await app.advance(1);
    assert.equal(app.messages().length, 0);
  } finally { await app.cleanup(); }
});

test('restore runs once and its confirmation replaces the previous toast', async () => {
  let restores = 0;
  let sendConfirmation: () => void;
  const app = await setup(['success'], false, { label: 'Restaurar', onClick: () => { restores++; sendConfirmation(); } });
  try {
    sendConfirmation = () => app.emit('Nota restaurada');
    const restore = app.buttons().find(button => button.props.className === 'toast-action')!;
    await act(async () => { restore.props.onClick(); restore.props.onClick(); });
    assert.equal(restores, 1);
    await app.advance(900);
    assert.deepEqual(app.messages(), ['Nota restaurada']);
  } finally { await app.cleanup(); }
});

test('closing the latest toast does not reveal an earlier notification', async () => {
  const app = await setup();
  try {
    await app.send('Nova mensagem');
    await app.advance(0);
    await act(async () => app.buttons().find(button => button.props.className === 'toast-dismiss')!.props.onClick());
    await app.advance(0);
    assert.deepEqual(app.messages(), []);
  } finally { await app.cleanup(); }
});
