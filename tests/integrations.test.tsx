import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, create } from 'react-test-renderer';
import { useState } from 'react';
import { TextSwap } from '../src/Feedback';
import { CloudStorageSettings } from '../src/CloudStorageSettings';
import { DropboxIntegration, DropboxIntegrationRow } from '../src/DropboxIntegration';
import { DropboxSyncSettings } from '../src/DropboxSyncSettings';
import type { DropboxSync } from '../src/cloud/use-dropbox-sync';
import { useDropboxAuth } from '../src/cloud/use-dropbox-auth';
import type { GoogleDriveSync } from '../src/cloud/use-google-drive-sync';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function drive(overrides: Partial<GoogleDriveSync> = {}): GoogleDriveSync {
  const unexpected = () => { throw new Error('Rendering integrations must not initiate Drive operations'); };
  return {
    status: 'disconnected', connected: false, wasConnected: false,
    lastSyncedAt: null, error: null, conflict: null,
    connect: unexpected, disconnect: unexpected, syncNow: unexpected,
    resolveConflict: unexpected, ...overrides,
  };
}
function dropbox(overrides: Partial<ReturnType<typeof useDropboxAuth>> = {}): ReturnType<typeof useDropboxAuth> {
  const unexpected = () => { throw new Error('Navigation must not authorize or revoke Dropbox'); };
  return { state: { status: 'disconnected' }, checking: false, appKey: '', setAppKey: unexpected,
    linked: false, revocationPending: false, callbackUri: '', serviceMessage: null,
    syncReady: false, connectionId: '', request: async () => { throw new Error('Unexpected file request'); },
    connect: unexpected, disconnect: unexpected, verifyPermissions: unexpected, ...overrides };
}
function browserMocks() {
  globalThis.window = { setInterval: () => 1, clearInterval() {}, addEventListener() {}, removeEventListener() {}, open: () => null } as any;
  globalThis.document = { addEventListener() {}, removeEventListener() {} } as any;
  globalThis.matchMedia = (() => ({ matches: true, addEventListener() {}, removeEventListener() {} })) as any;
}
const nodeMock = () => ({ textContent: '', classList: { remove() {} }, focus() {} });

test('Dropbox details fail closed when the local credential service is unavailable', () => {
  const markup = renderToStaticMarkup(<DropboxIntegration notify={() => {}} auth={dropbox({ state: { status: 'unavailable', reason: 'local-service-required' } })} />);
  assert.match(markup, /Integração com o Dropbox/);
  assert.match(markup, /cofre de credenciais do Windows/);
  assert.doesNotMatch(markup, /<form|Vincular Dropbox/);
  assert.doesNotMatch(markup, /<input/);
  assert.match(markup, /Sincronização do seu espaço/);
  assert.doesNotMatch(markup, /Conta do Dropbox/);
});

test('the integration list presents matching provider rows without exposing the Dropbox setup form', () => {
  const cases: [Partial<GoogleDriveSync>, string][] = [
    [{}, 'Vincular'], [{ wasConnected: true }, 'Vincular novamente'],
    [{ connected: true, status: 'synced' }, 'Vinculado'],
    [{ connected: true, status: 'conflict', conflict: { localNotes: 1, remoteNotes: 2 } }, 'Revisar cópias'],
  ];
  for (const [state, label] of cases) {
    const markup = renderToStaticMarkup(<CloudStorageSettings sync={drive(state)} onNavigate={() => {}}>
      <DropboxIntegrationRow auth={dropbox()} onNavigate={() => {}} />
    </CloudStorageSettings>);
    assert.match(markup, /Google Drive/); assert.match(markup, new RegExp(label));
    assert.match(markup, /Dropbox/);
    assert.equal((markup.match(/<button\b/g) || []).length, 2);
    assert.doesNotMatch(markup, /Sua Dropbox App Key|<input/);
  }
});

test('selecting Dropbox navigates to details without invoking OAuth or revocation', async () => {
  browserMocks();
  let visits = 0;
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<DropboxIntegrationRow auth={dropbox()} onNavigate={() => visits++} />, { createNodeMock: nodeMock }); });
  try {
    await act(async () => renderer!.root.findByType('button').props.onClick());
    assert.equal(visits, 1);
    assert.equal(renderer!.root.findByType('button').props['data-provider'], 'dropbox');
  } finally { await act(async () => renderer!.unmount()); }
});

test('Dropbox details accept a personal App Key and keep authorization guarded by readiness and validation', async () => {
  browserMocks();
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (url: any) => {
    requests.push(String(url));
    return Response.json({ status: 'disconnected', message: null, appKey: '', linked: false, revocationPending: false,
      callbackUri: 'http://127.0.0.1:5173/api/dropbox/callback', csrf: 'synthetic-csrf' });
  };
  function Harness() { const auth = useDropboxAuth(); return <DropboxIntegration auth={auth} notify={() => {}} />; }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />, { createNodeMock: nodeMock }); });
  try {
    const submit = () => renderer!.root.findByProps({ 'aria-label': 'Conectar' });
    assert.equal(submit().props.disabled, true);
    await act(async () => renderer!.root.findByType('input').props.onChange({ target: { value: 'personalTestApp' } }));
    assert.equal(submit().props.disabled, false);
    assert.equal(submit().parent!.props.className, 'dropbox-connect-row');
    await act(async () => renderer!.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.match(renderer!.root.findByProps({ role: 'alert' }).props.children, /Permita a janela/);
    assert.deepEqual(requests, ['/api/dropbox/session']);
  } finally { await act(async () => renderer!.unmount()); globalThis.fetch = originalFetch; }
});

test('Dropbox connects explicitly from the redirect row without confirm or cancel controls in the input', async () => {
  browserMocks();
  let connects = 0;
  function Harness() {
    const [appKey, setAppKey] = useState('previousPersonalKey');
    return <DropboxIntegration notify={() => {}} auth={dropbox({ appKey, setAppKey, connect: async () => { connects++; } })} />;
  }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />, { createNodeMock: nodeMock }); });
  try {
    const change = async (value: string) => { await act(async () => renderer!.root.findByType('input').props.onChange({ target: { value } })); };
    await change('newPersonalKey');
    assert.equal(renderer!.root.findByType('input').props.value, 'newPersonalKey');
    const editor = renderer!.root.findByProps({ className: 'dropbox-key-editor' });
    assert.equal(editor.findAllByType('button').length, 2, 'input only contains reveal and copy actions');
    assert.equal(renderer!.root.findAllByProps({ 'aria-label': 'Cancelar edição da App Key' }).length, 0);
    assert.equal(connects, 0);
    await change('confirmedPersonalKey');
    await act(async () => renderer!.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    assert.equal(connects, 1);
    const cards = renderer!.root.findAllByProps({ className: 'cloud-detail-card' });
    assert.equal(cards[0].findByProps({ 'aria-label': 'Conectar' }).props.type, 'submit');
    assert.equal(cards[1].findByProps({ className: 'secondary-button cloud-sync-button' }).props.disabled, true);
    let prevented = false;
    renderer!.root.findByType('input').props.onKeyDown({ key: 'Enter', nativeEvent: { isComposing: true }, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  } finally { await act(async () => renderer!.unmount()); }
});

test('Dropbox APP Key is masked, can be revealed and copied, and remasks when leaving details', async () => {
  browserMocks();
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const copied: string[] = [], notifications: { text: string; kind?: string }[] = [];
  let clipboardFails = false;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: {
    async writeText(text: string) { if (clipboardFails) throw new Error('denied'); copied.push(text); },
  } } });
  const auth = dropbox({ appKey: 'syntheticAppKey', callbackUri: 'http://127.0.0.1:5173/api/dropbox/callback' });
  const notify = (text: string, kind?: 'success' | 'error') => { notifications.push({ text, kind }); };
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<DropboxIntegration auth={auth} notify={notify} />, { createNodeMock: nodeMock }); });
  try {
    assert.equal(renderer!.root.findByType('input').props.type, 'password');
    await act(async () => renderer!.root.findByProps({ 'aria-label': 'Mostrar App Key' }).props.onClick());
    assert.equal(renderer!.root.findByType('input').props.type, 'text');
    assert.equal(renderer!.root.findByProps({ 'aria-label': 'Ocultar App Key' }).props['aria-pressed'], true);
    await act(async () => renderer!.root.findByProps({ 'aria-label': 'Copiar App Key' }).props.onClick());
    await act(async () => renderer!.root.findByProps({ 'aria-label': 'Copiar URL de redirecionamento' }).props.onClick());
    assert.deepEqual(copied, ['syntheticAppKey', auth.callbackUri]);
    assert.deepEqual(notifications.map(item => item.text), ['Chave copiada', 'URL copiada']);
    clipboardFails = true;
    await act(async () => renderer!.root.findByProps({ 'aria-label': 'Copiar URL de redirecionamento' }).props.onClick());
    assert.equal(notifications.at(-1)!.kind, 'error');
    assert.match(notifications.at(-1)!.text, /Não foi possível copiar/);
    await act(async () => renderer!.update(<DropboxIntegration auth={auth} notify={notify} active={false} />));
    assert.equal(renderer!.root.findByType('input').props.type, 'password');
    const link = renderer!.root.findByType('a');
    assert.equal(link.props.href, 'https://www.dropbox.com/developers/apps?utm_source=opennotes');
    assert.equal(link.props.rel, 'noopener noreferrer');
    const markup = renderToStaticMarkup(<DropboxIntegration auth={auth} notify={notify} />);
    assert.match(markup, /APP Key/);
    assert.match(markup, /Uma cópia privada no Dropbox/);
    assert.match(markup, /O Open Notes só tem acesso à pasta criada especialmente para o aplicativo no seu Dropbox\. Seus outros arquivos permanecem privados e não podem ser acessados\./);
    assert.doesNotMatch(markup, /Acesso limitado no Dropbox/);
  } finally {
    await act(async () => renderer!.unmount());
    if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

test('Google Drive details retain their sync and conflict controls without Dropbox content', () => {
  const markup = renderToStaticMarkup(<CloudStorageSettings
    sync={drive({ connected: true, status: 'conflict', conflict: { localNotes: 1, remoteNotes: 2 } })}
    details onNavigate={() => {}}
  />);
  assert.match(markup, /Usar cópia do Drive/); assert.match(markup, /Usar cópia deste navegador/);
  assert.match(markup, /Desvincular/); assert.match(markup, /Sincronizar agora/);
  assert.doesNotMatch(markup, /Dropbox/);
});

test('Dropbox UI distinguishes linked authorization from completed sync and exposes last sync and conflict choices', () => {
  const sync: DropboxSync = { intervalHours: 1, nextSyncAt: null, setIntervalHours() {}, status: 'paused', enabled: false, error: null, lastSyncedAt: null, conflict: null,
    async activate() {}, async syncNow() {}, async resolveConflict() {} };
  const paused = renderToStaticMarkup(<DropboxSyncSettings sync={sync} authorized />);
  assert.match(paused, /Nenhuma sincronização concluída/); assert.match(paused, /Ativar sincronização/);
  assert.doesNotMatch(paused, /Seu espaço está sincronizado/);
  const synced = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'synced', enabled: true, lastSyncedAt: 1792600000000 }} authorized />);
  assert.match(synced, /Última sincronização:/); assert.match(synced, /Sincronizar agora/);
  const conflicting = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'conflict', enabled: true, conflict: { localNotes: 2, remoteNotes: 3 } }} authorized />);
  assert.match(conflicting, /Usar cópia do Dropbox/); assert.match(conflicting, /Usar cópia deste navegador/);
  const oldGrant = renderToStaticMarkup(<DropboxIntegration notify={() => {}} auth={dropbox({ state: { status: 'connected' }, linked: true, syncReady: false })} sync={sync} />);
  assert.match(oldGrant, /desvincule e conecte novamente/);
  assert.match(oldGrant, /Verificar permissões/);
});

test('Dropbox sync icon uses linear cloud check for success and linear cloud cross for errors', () => {
  const sync: DropboxSync = { intervalHours: 1, nextSyncAt: null, setIntervalHours() {}, status: 'synced', enabled: true, error: null, lastSyncedAt: 1792600000000, conflict: null,
    async activate() {}, async syncNow() {}, async resolveConflict() {} };
  const success = renderToStaticMarkup(<DropboxSyncSettings sync={sync} authorized />);
  assert.match(success, /solar-cloud-check-linear/); assert.doesNotMatch(success, /solar-cloud-cross-linear/);
  const scheduled = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'scheduled' }} authorized />);
  assert.match(scheduled, /solar-cloud-check-linear/); assert.doesNotMatch(scheduled, /solar-folder-cloud/);
  const firstSync = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'scheduled', lastSyncedAt: null }} authorized />);
  assert.doesNotMatch(firstSync, /solar-cloud-check-linear/);
  const scheduledError = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'scheduled', error: 'Falha de rede' }} authorized />);
  assert.match(scheduledError, /solar-cloud-cross-linear/); assert.doesNotMatch(scheduledError, /solar-cloud-check-linear/);
  const error = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'error', error: 'Falha de rede' }} authorized />);
  assert.match(error, /solar-cloud-cross-linear/); assert.doesNotMatch(error, /solar-cloud-check-linear/);
  const permission = renderToStaticMarkup(<DropboxSyncSettings sync={sync} authorized={false} needsPermissions />);
  assert.match(permission, /solar-cloud-cross-linear/); assert.doesNotMatch(permission, /solar-cloud-check-linear/);
  const authError = renderToStaticMarkup(<DropboxSyncSettings sync={sync} authorized={false} notice="Autorização expirada" noticeIsError />);
  assert.match(authError, /solar-cloud-cross-linear/);
  const paused = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, enabled: false, status: 'paused' }} authorized />);
  assert.doesNotMatch(paused, /solar-cloud-(check|cross)-linear/);
  const syncing = renderToStaticMarkup(<DropboxSyncSettings sync={{ ...sync, status: 'syncing' }} authorized />);
  assert.doesNotMatch(syncing, /solar-cloud-check-linear/);
});

test('Dropbox uses an accessible interval menu, separates scheduling and shows last and next synchronization times', async () => {
  browserMocks();
  const sync: DropboxSync = { status: 'scheduled', enabled: true, error: null, lastSyncedAt: 1792600000000,
    nextSyncAt: 1792610800000, intervalHours: 3, setIntervalHours() {}, conflict: null,
    async activate() {}, async syncNow() {}, async resolveConflict() {} };
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<DropboxSyncSettings sync={sync} authorized active={false} />, { createNodeMock: nodeMock }); });
  try {
    const trigger = () => renderer!.root.findByProps({ className: 'secondary-button dropbox-sync-interval' });
    assert.equal(trigger().props.disabled, false);
    assert.equal(trigger().props['aria-haspopup'], 'menu');
    const labels = trigger().props['aria-labelledby'].split(' ');
    assert.equal(renderer!.root.findByProps({ id: labels[0] }).props.children, 'Sincronização automática');
    assert.equal(renderer!.root.findByProps({ id: labels[1] }).props.children, '3 horas');
    assert.match(renderer!.root.findByProps({ id: trigger().props['aria-describedby'] }).props.children, /salvamento local é imediato/);
    assert.equal(renderer!.root.findAllByType('select').length, 0);
    assert.equal(renderer!.root.findByProps({ className: 'dropbox-sync-schedule' }).findAllByProps({ className: 'cloud-sync-button' }).length, 0);
    await act(async () => renderer!.update(<DropboxSyncSettings sync={{ ...sync, status: 'syncing' }} authorized active={false} />));
    assert.equal(trigger().props.disabled, true);
    await act(async () => renderer!.update(<DropboxSyncSettings authorized active={false} />));
    assert.equal(trigger().props.disabled, true);
    const markup = renderToStaticMarkup(<DropboxSyncSettings sync={sync} authorized />);
    assert.match(markup, /Última sincronização:/); assert.match(markup, /Próxima sincronização prevista:/);
    assert.match(markup, /Sincronizar agora/); assert.match(markup, /O salvamento local é imediato/);
  } finally { await act(async () => renderer!.unmount()); }
});

test('Dropbox groups permission notices and badges inside the sync card and removes the account card', async () => {
  browserMocks();
  const auth = dropbox({ state: { status: 'connected' }, linked: true, syncReady: false, callbackUri: 'http://localhost:5173/api/dropbox/callback' });
  const sync: DropboxSync = { intervalHours: 1, nextSyncAt: null, setIntervalHours() {}, status: 'paused', enabled: false, error: null, lastSyncedAt: null, conflict: null,
    async activate() {}, async syncNow() {}, async resolveConflict() {} };
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<DropboxIntegration auth={auth} sync={sync} notify={() => {}} active={false} />, { createNodeMock: nodeMock }); });
  try {
    const cards = renderer!.root.findAllByProps({ className: 'cloud-detail-card' });
    assert.equal(cards.length, 3);
    assert.equal(cards[1].findByType('h4').props.children, 'Sincronização do seu espaço');
    assert.deepEqual(cards[1].findAllByType('code').map(node => [node.props.className, node.props.children]), [
      ['cloud-badge', 'files.content.read'], ['cloud-badge', 'files.content.write'],
    ]);
    const consoleLink = cards[1].findByType('a');
    assert.equal(consoleLink.props.className, 'cloud-badge dropbox-console-link');
    assert.equal(consoleLink.props.target, '_blank'); assert.equal(consoleLink.props.rel, 'noopener noreferrer');
    assert.equal(cards[0].findByProps({ 'aria-label': 'Copiar URL de redirecionamento' }).props.className, 'cloud-badge dropbox-callback-copy');
    assert.equal(cards[1].findByProps({ role: 'status' }).findByType(TextSwap).props.text, 'As permissões de sincronização deste vínculo ainda não foram confirmadas.');
    await act(async () => renderer!.update(<DropboxIntegration auth={{ ...auth, syncReady: true }} sync={sync} notify={() => {}} active={false} />));
    assert.equal(renderer!.root.findAllByProps({ className: 'cloud-badge dropbox-console-link' }).length, 0);
    assert.doesNotMatch(renderToStaticMarkup(<DropboxIntegration auth={auth} sync={sync} notify={() => {}} />), /Conta do Dropbox vinculada|Este vínculo não tem/);
  } finally { await act(async () => renderer!.unmount()); }
});

test('checking Dropbox permissions uses the protected endpoint, reports an unconfirmed grant and restores readiness when confirmed', async () => {
  browserMocks();
  const originalFetch = globalThis.fetch;
  let granted = false;
  const requests: string[] = [];
  globalThis.fetch = async (url: any, init?: RequestInit) => {
    requests.push(String(url));
    if (String(url).endsWith('/permissions')) assert.equal((init!.headers as Record<string, string>)['X-CSRF-Token'], 'test-csrf');
    else assert.equal(String(url), '/api/dropbox/session');
    return Response.json({ status: 'connected', message: null, appKey: 'testPersonalKey', linked: true,
      revocationPending: false, callbackUri: 'http://localhost:5173/api/dropbox/callback', csrf: 'test-csrf', syncReady: granted, connectionId: 'test-connection' });
  };
  const sync: DropboxSync = { intervalHours: 1, nextSyncAt: null, setIntervalHours() {}, status: 'paused', enabled: false, error: null, lastSyncedAt: null, conflict: null,
    async activate() { throw new Error('must not sync'); }, async syncNow() { throw new Error('must not sync'); }, async resolveConflict() {} };
  function Harness() { return <DropboxIntegration auth={useDropboxAuth()} sync={sync} notify={() => {}} active={false} />; }
  let renderer: ReturnType<typeof create>;
  await act(async () => { renderer = create(<Harness />, { createNodeMock: nodeMock }); });
  try {
    const button = () => renderer!.root.findByProps({ className: 'secondary-button cloud-sync-button' });
    assert.equal(button().findByType(TextSwap).props.text, 'Verificar permissões');
    await act(async () => button().props.onClick());
    assert.match(renderer!.root.findByProps({ role: 'status' }).findByType(TextSwap).props.text, /O Dropbox não confirmou/);
    granted = true;
    await act(async () => button().props.onClick());
    assert.equal(button().findByType(TextSwap).props.text, 'Ativar sincronização');
    assert.equal(button().props.disabled, false);
    assert.deepEqual(requests, ['/api/dropbox/session', '/api/dropbox/permissions', '/api/dropbox/permissions']);
  } finally { await act(async () => renderer!.unmount()); globalThis.fetch = originalFetch; }
});
