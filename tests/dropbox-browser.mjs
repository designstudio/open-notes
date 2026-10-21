// Real browser, disposable profiles, synthetic OAuth/vault. No Dropbox account is accessed.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';
import { createDropboxAuth } from '../local/dropbox-auth.mjs';
import { createDropboxMiddleware } from '../local/dropbox-middleware.mjs';
import { createDropboxFiles, snapshotPath } from '../local/dropbox-files.mjs';

const root = resolve('dist');
let stored = null, clock = Date.now(), refreshes = 0, revoked = 0;
let confirmedRefreshScope;
let remote = null, remoteRevision = 0, uploads = 0, downloads = 0;
const fileRequest = async (url, options) => {
  const args = JSON.parse(options.headers['Dropbox-API-Arg']);
  assert.equal(args.path, snapshotPath);
  if (url.endsWith('/download')) {
    downloads++;
    return remote ? new Response(JSON.stringify(remote), { headers: { 'Dropbox-API-Result': JSON.stringify({ rev: String(remoteRevision) }) } })
      : Response.json({ error: { '.tag': 'path', path: { '.tag': 'not_found' } } }, { status: 409 });
  }
  assert.equal(url, 'https://content.dropboxapi.com/2/files/upload');
  assert.equal(args.strict_conflict, true); assert.equal(args.autorename, false);
  if ((remote && args.mode.update !== String(remoteRevision)) || (!remote && args.mode['.tag'] !== 'add')) return Response.json({ error: { '.tag': 'path', path: { reason: { '.tag': 'conflict' } } } }, { status: 409 });
  remote = JSON.parse(options.body); remoteRevision++; uploads++;
  return Response.json({ rev: String(remoteRevision) });
};
const vault = { async probe() {}, async read() { return structuredClone(stored); }, async write(value) { stored = structuredClone(value); } };
function makeAuth() {
  return createDropboxAuth({ vault, now: () => clock, fetch: async (url, options) => {
    if (url.endsWith('/oauth2/token')) {
      assert.equal(options.body.has('client_secret'), false);
      if (options.body.get('grant_type') === 'refresh_token') refreshes++;
      return Response.json({ access_token: 'synthetic-browser-access', expires_in: 3600,
        ...(options.body.get('grant_type') === 'refresh_token' && confirmedRefreshScope ? { scope: confirmedRefreshScope } : {}),
        ...(options.body.get('grant_type') === 'authorization_code' ? { refresh_token: 'synthetic-browser-refresh', scope: 'files.metadata.read files.content.read files.content.write' } : {}) });
    }
    assert.equal(url, 'https://api.dropboxapi.com/2/auth/token/revoke'); revoked++;
    return new Response('', { status: 200 });
  } });
}
let auth = makeAuth(), server, browser;
try {
  server = createServer();
  let middleware;
  const replaceMiddleware = () => { middleware = createDropboxMiddleware({ auth, port: () => server.address().port, files: createDropboxFiles({ auth, fetch: fileRequest }) }); };
  replaceMiddleware();
  server.on('request', (req, res) => {
    void middleware(req, res, async () => {
      try {
        const pathname = new URL(req.url, 'http://local.test').pathname;
        let path = resolve(root, '.' + pathname);
        if (!path.startsWith(root + sep) && path !== root) { res.writeHead(403); return res.end(); }
        if (!extname(path)) path = join(root, 'index.html');
        const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
        res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
        res.end(await readFile(path));
      } catch { res.writeHead(404); res.end(); }
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  let context = await browser.newContext({ reducedMotion: 'reduce' });
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  const intercept = async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin || url.protocol === 'data:' || url.protocol === 'about:') return route.continue();
    if (url.origin !== 'https://www.dropbox.com') return route.fulfill({ status: 200, body: '', contentType: 'text/css' });
    assert.equal(url.pathname, '/oauth2/authorize');
    assert.equal(url.searchParams.get('client_id'), 'personalBrowserTestApp');
    const callback = new URL(url.searchParams.get('redirect_uri'));
    callback.search = new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-browser-code' });
    return route.fulfill({ status: 302, headers: { location: callback.href }, body: '' });
  };
  await context.route('**/*', intercept);
  let page = await context.newPage();
  await page.clock.install({ time: new Date(clock) });
  let capturedList = false;
  let profileInputStyle;
  const inputStyle = el => {
    const style = getComputedStyle(el);
    return [el.getBoundingClientRect().height, style.borderRadius, style.fontSize, style.paddingLeft, style.backgroundColor, style.borderColor];
  };
  const preferences = async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(origin);
    await page.getByRole('button', { name: 'Preferências', exact: true }).click();
    const menu = page.getByRole('navigation', { name: 'Seções das preferências' });
    assert.deepEqual(await menu.getByRole('button').allTextContents(), ['Geral', 'Integrações']);
    assert.equal(await page.locator('[data-provider="dropbox"]').isVisible(), false, 'integrations are not part of General');
    if (!profileInputStyle) {
      await page.getByRole('button', { name: 'Editar nome', exact: true }).click();
      await page.getByRole('textbox', { name: 'Seu nome', exact: true }).blur();
      profileInputStyle = await page.getByRole('textbox', { name: 'Seu nome', exact: true }).evaluate(inputStyle);
      await page.getByRole('button', { name: 'Cancelar edição do nome', exact: true }).click();
    }
    await menu.getByRole('button', { name: 'Integrações', exact: true }).click();
    if (process.argv.includes('--screenshots') && !capturedList) {
      for (const [width, height] of [[1440, 900], [320, 780]]) {
        await page.setViewportSize({ width, height });
        await page.screenshot({ path: join(tmpdir(), `open-notes-integrations-list-${width}.png`) });
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      capturedList = true;
    }
    await page.locator('[data-provider="dropbox"]').click();
    assert.equal(await page.locator('.t-page-slide').getAttribute('data-page'), '2');
    await page.getByRole('heading', { name: 'Integração com o Dropbox', exact: true }).waitFor();
    await page.locator('.dropbox-connect-row > button').waitFor();
  };
  await preferences();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  assert.equal(await page.getByRole('button', { name: 'Conectar', exact: true }).isDisabled(), true);
  await page.getByLabel('Sua Dropbox App Key').fill('personalBrowserTestApp');
  assert.equal(await page.getByLabel('Sua Dropbox App Key').getAttribute('type'), 'password');
  await page.getByRole('button', { name: 'Mostrar App Key', exact: true }).click();
  assert.equal(await page.getByLabel('Sua Dropbox App Key').getAttribute('type'), 'text');
  assert.equal(await page.getByRole('link', { name: /Criar uma App Key/ }).getAttribute('href'), 'https://www.dropbox.com/developers/apps?utm_source=opennotes');
  await page.getByRole('button', { name: 'Copiar URL de redirecionamento', exact: true }).click();
  await page.getByText('URL copiada', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), origin + '/api/dropbox/callback');
  await page.locator('.cloud-back').click();
  assert.equal(await page.locator('.t-page-slide').getAttribute('data-page'), '1');
  assert.equal(await page.locator(':focus').getAttribute('data-provider'), 'dropbox');
  await page.locator('[data-provider="google-drive"]').click();
  await page.getByRole('heading', { name: 'Integração com o Google Drive', exact: true }).waitFor();
  assert.equal(await page.locator('.t-page-slide').getAttribute('data-page'), '2');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const driveTransition = await page.locator('.t-page[data-page-id="2"]').evaluate(el => {
    const style = getComputedStyle(el); return [style.transitionProperty, style.transitionDuration];
  });
  assert.ok(driveTransition[0].includes('transform'));
  await page.locator('.cloud-back').click();
  assert.equal(await page.locator(':focus').getAttribute('data-provider'), 'google-drive');
  await page.locator('[data-provider="dropbox"]').click();
  assert.equal(await page.getByLabel('Sua Dropbox App Key').getAttribute('type'), 'password', 'leaving the details masks the key again');
  assert.deepEqual(await page.locator('.t-page[data-page-id="2"]').evaluate(el => {
    const style = getComputedStyle(el); return [style.transitionProperty, style.transitionDuration];
  }), driveTransition, 'both providers use identical page transitions');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.getByLabel('Sua Dropbox App Key').inputValue(), 'personalBrowserTestApp', 'draft survives provider navigation');
  assert.equal(stored, null, 'opening provider options never authorizes');
  for (const [width, height] of [[1440, 900], [320, 780]]) {
    await page.setViewportSize({ width, height });
    const editor = page.locator('.dropbox-key-editor');
    await editor.scrollIntoViewIfNeeded();
    assert.equal(await editor.evaluate(el => el.scrollWidth > el.clientWidth), false);
    const copyBox = await page.locator('.dropbox-key-copy').boundingBox();
    const editorBox = await editor.boundingBox();
    const inputBox = await page.getByLabel('Sua Dropbox App Key').boundingBox();
    assert.ok(Math.abs(inputBox.width - editorBox.width) < 1, 'input fills the entire right column without confirm or cancel buttons');
    const connectRow = page.locator('.dropbox-connect-row');
    const connectBox = await connectRow.getByRole('button', { name: 'Conectar', exact: true }).boundingBox();
    const instructionBox = await connectRow.locator('p').boundingBox();
    assert.equal(await connectRow.evaluate(el => getComputedStyle(el).borderTopStyle), 'solid');
    if (width > 760) {
      assert.ok(editorBox.x >= copyBox.x + copyBox.width, 'key editor sits to the right of its description');
      assert.ok(Math.abs(editorBox.y + editorBox.height / 2 - copyBox.y - copyBox.height / 2) < 1, 'both columns are vertically centered');
      const formBox = await page.locator('.dropbox-auth-form').boundingBox();
      assert.ok(Math.abs(editorBox.x + editorBox.width - formBox.x - formBox.width) < 1, 'editor aligns with the right edge of the card content');
      assert.ok(connectBox.x >= instructionBox.x + instructionBox.width, 'connect button sits to the right of the redirect instructions');
      assert.ok(Math.abs(connectBox.y + connectBox.height / 2 - instructionBox.y - instructionBox.height / 2) < 1);
    } else {
      assert.ok(editorBox.y >= copyBox.y + copyBox.height, 'narrow screens stack the editor below its description');
      assert.ok(connectBox.y >= instructionBox.y + instructionBox.height, 'narrow screens stack the connect action below the instructions');
    }
    const keyStyle = await page.getByLabel('Sua Dropbox App Key').evaluate(inputStyle);
    assert.equal(keyStyle[0], 36, 'key input has a slightly taller field');
    assert.deepEqual(keyStyle.slice(2), profileInputStyle.slice(2), 'key and profile name inputs retain the same typography, padding and colors');
    assert.ok(parseFloat(keyStyle[1]) >= keyStyle[0] / 2, 'key input has fully rounded pill ends');
    assert.equal(await page.locator('.dropbox-integration .cloud-detail-card').nth(1).getByRole('heading', { name: 'Sincronização do seu espaço', exact: true }).count(), 1);
    assert.equal(await page.getByRole('heading', { name: 'Conta do Dropbox vinculada', exact: true }).count(), 0);
    if (process.argv.includes('--screenshots')) await page.screenshot({ path: join(tmpdir(), `open-notes-dropbox-key-editor-${width}.png`) });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Conectar', exact: true }).click();
  const popup = await popupPromise;
  await popup.getByText('Dropbox autorizado. Nenhuma nota foi sincronizada.').waitFor();
  await page.getByRole('button', { name: 'Desvincular', exact: true }).waitFor();
  await popup.close();
  assert.equal(uploads, 0, 'authorization does not enable synchronization');
  const schedule = () => page.getByRole('button', { name: /^Sincronização automática / });
  const intervalMenu = () => page.getByRole('menu', { name: 'Sincronização automática', exact: true });
  assert.equal(await schedule().textContent(), '1 hora');
  await schedule().click();
  assert.deepEqual(await intervalMenu().getByRole('menuitemradio').allTextContents(), ['1 hora', '3 horas', '6 horas', '12 horas', '24 horas']);
  assert.equal(await intervalMenu().getByRole('menuitemradio', { name: '1 hora', exact: true }).getAttribute('aria-checked'), 'true');
  assert.equal(await intervalMenu().evaluate(el => Boolean(el.closest('dialog[open]'))), true, 'menu stays inside the dialog top layer');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.activeElement?.matches('.dropbox-sync-interval'));
  assert.equal(await schedule().evaluate(el => el === document.activeElement), true, 'Escape returns focus to the interval trigger');
  assert.equal(await page.locator('dialog.settings-dialog[open]').count(), 1, 'Escape closes only the menu');
  await schedule().press('ArrowDown');
  await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'menuitemradio');
  await page.keyboard.press('Home');
  await page.waitForFunction(() => document.activeElement?.textContent === '1 hora');
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => document.activeElement?.textContent === '3 horas');
  await page.keyboard.press('Enter');
  assert.equal(await schedule().textContent(), '3 horas', 'interval can be selected with the keyboard');
  await page.getByRole('button', { name: 'Ativar sincronização', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Seu espaço está sincronizado com o Dropbox.' }).waitFor();
  assert.equal(uploads, 1); assert.equal(remote.data.notes.length, 0, 'starter examples never reach Dropbox');
  await page.getByText(/Última sincronização:/).waitFor();
  await page.getByText(/Próxima sincronização prevista:/).waitFor();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Nova nota', exact: true }).click();
  const uploadedEdit = page.waitForResponse(response => response.url().endsWith('/api/dropbox/upload') && response.request().postData()?.includes('Nota sincronizada no teste'));
  await page.getByRole('textbox', { name: 'Título da nota', exact: true }).fill('Nota sincronizada no teste');
  clock += 60_000;
  await page.clock.fastForward(60_000);
  assert.equal(uploads, 1, 'edits remain local before the selected interval');
  await page.reload();
  await page.getByRole('textbox', { name: 'Título da nota', exact: true }).waitFor();
  assert.equal(await page.getByRole('textbox', { name: 'Título da nota', exact: true }).inputValue(), 'Nota sincronizada no teste', 'local persistence remains immediate before cloud sync');
  assert.equal(uploads, 1, 'reload cannot anticipate the selected interval');
  clock += 3 * 3600_000;
  await page.clock.fastForward(3 * 3600_000);
  await uploadedEdit;
  assert.equal(remote.data.notes[0].title, 'Nota sincronizada no teste');
  await preferences();
  await page.getByRole('status').filter({ hasText: 'Sincronização agendada.' }).waitFor();
  assert.equal(await schedule().textContent(), '3 horas', 'periodicity survives reload');
  const nextBefore = await page.getByText(/Próxima sincronização prevista:/).textContent();
  clock += 5 * 60_000;
  await page.clock.fastForward(5 * 60_000);
  const downloadsBefore = downloads;
  await page.getByRole('button', { name: 'Sincronizar agora', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Seu espaço está sincronizado com o Dropbox.' }).waitFor();
  assert.equal(downloads, downloadsBefore + 1, 'manual sync anticipates the selected interval');
  assert.notEqual(await page.getByText(/Próxima sincronização prevista:/).textContent(), nextBefore, 'manual success restarts the schedule');
  const backupCard = page.locator('.cloud-detail-card').filter({ has: page.getByRole('heading', { name: 'Cópias de segurança', exact: true }) });
  const backupDownload = page.waitForEvent('download');
  await backupCard.getByRole('button', { name: 'Exportar', exact: true }).click();
  const exportedBackup = await backupDownload;
  assert.equal(exportedBackup.suggestedFilename(), 'open-notes-copias-de-seguranca.json');
  const exportedCopies = JSON.parse(await readFile(await exportedBackup.path(), 'utf8')).copies;
  assert.ok(exportedCopies.length > 0 && exportedCopies.some(copy => copy.local.notes.some(note => note.title === 'Nota sincronizada no teste')), 'the export card downloads the preserved recovery copies');
  assert.equal(await page.getByRole('button', { name: 'Baixar cópias de segurança', exact: true }).count(), 0);
  for (const [width, height] of [[1440, 900], [320, 780]]) {
    await page.setViewportSize({ width, height });
    await page.locator('.dropbox-integration').scrollIntoViewIfNeeded();
    const overflow = await page.locator('.dropbox-integration').evaluate(el => el.scrollWidth > el.clientWidth);
    assert.equal(overflow, false);
    const field = await page.getByLabel('Sua Dropbox App Key').evaluate(el => {
      const style = getComputedStyle(el); return { height: el.getBoundingClientRect().height, radius: parseFloat(style.borderRadius), paddingRight: parseFloat(style.paddingRight) };
    });
    assert.equal(field.height, 36, 'key input keeps its taller height at every viewport');
    assert.ok(field.radius >= field.height / 2 && field.paddingRight >= 64, 'key input keeps its pill shape and space for its controls');
    if (process.argv.includes('--screenshots')) await page.screenshot({ path: join(tmpdir(), `open-notes-dropbox-auth-${width}.png`) });
    const syncCard = page.locator('.cloud-detail-card').filter({ has: page.getByRole('heading', { name: 'Sincronização do seu espaço', exact: true }) });
    await syncCard.scrollIntoViewIfNeeded();
    assert.equal(await syncCard.evaluate(el => el.scrollWidth > el.clientWidth), false, 'sync status, timestamp and actions fit the card at all viewports');
      assert.equal(await syncCard.locator('.dropbox-sync-schedule').evaluate(el => getComputedStyle(el).borderTopWidth), '1px', 'automatic sync uses the card divider');
      await schedule().click();
      await intervalMenu().getByRole('menuitemradio', { name: '3 horas', exact: true }).waitFor();
      const menuBox = await intervalMenu().boundingBox();
      assert.ok(menuBox.x >= 0 && menuBox.x + menuBox.width <= width, 'interval menu fits the viewport');
      assert.equal(await intervalMenu().getByRole('menuitemradio', { name: '3 horas', exact: true }).getAttribute('aria-checked'), 'true');
      if (process.argv.includes('--screenshots')) await page.screenshot({ path: join(tmpdir(), `open-notes-dropbox-interval-menu-${width}.png`) });
      await intervalMenu().getByRole('menuitemradio', { name: '6 horas', exact: true }).click();
      assert.equal(await schedule().textContent(), '6 horas', 'pointer selection updates the interval');
      await schedule().click();
      await intervalMenu().getByRole('menuitemradio', { name: '3 horas', exact: true }).click();
    if (process.argv.includes('--screenshots')) await page.screenshot({ path: join(tmpdir(), `open-notes-dropbox-sync-${width}.png`) });
  }
  await preferences(); // F5 / fresh document with the same cookie.
  await page.getByRole('button', { name: 'Desvincular', exact: true }).waitFor();
  assert.equal(await page.getByLabel('Sua Dropbox App Key').inputValue(), 'personalBrowserTestApp');
  await page.close(); page = await context.newPage(); await preferences(); // Browser tab closed and reopened.
  await page.getByRole('button', { name: 'Desvincular', exact: true }).waitFor();
  const browserState = await context.storageState({ indexedDB: true });
  await context.close(); await browser.close();
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ reducedMotion: 'reduce', storageState: browserState });
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  await context.route('**/*', intercept);
  page = await context.newPage(); await page.clock.install({ time: new Date(clock) }); await preferences(); // New process, same browser profile data.
  await page.getByRole('status').filter({ hasText: 'Sincronização agendada.' }).waitFor();
  assert.equal(await schedule().textContent(), '3 horas');
  assert.equal(remote.data.notes[0].title, 'Nota sincronizada no teste');
  await page.getByRole('button', { name: 'Desvincular', exact: true }).waitFor();
  auth.dispose(); auth = makeAuth(); replaceMiddleware(); // Local process/session state recreated, vault preserved.
  await preferences();
  await page.getByRole('button', { name: 'Desvincular', exact: true }).waitFor();
  assert.ok(refreshes >= 1);
  clock += 3600_000;
  await preferences();
  assert.ok(refreshes >= 2);
  const storage = await page.evaluate(async () => {
    const values = [JSON.stringify({ ...localStorage }), JSON.stringify({ ...sessionStorage })];
    for (const { name } of await indexedDB.databases()) {
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open(name); request.onsuccess = () => resolve(request.result); request.onerror = reject; });
      for (const store of db.objectStoreNames) {
        values.push(await new Promise((resolve, reject) => { const request = db.transaction(store).objectStore(store).getAll(); request.onsuccess = () => resolve(JSON.stringify(request.result)); request.onerror = reject; }));
      }
      db.close();
    }
    return values.join('\n');
  });
  assert.doesNotMatch(storage, /synthetic-browser-access|synthetic-browser-refresh|personalBrowserTestApp/);
  await page.getByRole('button', { name: 'Desvincular', exact: true }).click();
  await page.getByRole('button', { name: 'Conectar', exact: true }).waitFor();
  assert.equal(revoked, 1); assert.equal(stored.refreshToken, null);
  await preferences(); assert.equal(await page.getByRole('button', { name: 'Conectar', exact: true }).isVisible(), true);
  // Old vault entries may omit scopes even when the real grant already has them.
  // Console configuration alone must never enable writes; token responses can.
  stored = { ...stored, refreshToken: 'synthetic-browser-refresh', connectionId: 'old-test-connection' };
  delete stored.scopes;
  auth.dispose(); auth = makeAuth(); replaceMiddleware();
  await preferences();
  const permissionCard = page.locator('.cloud-detail-card').filter({ has: page.getByRole('heading', { name: 'Sincronização do seu espaço', exact: true }) });
  await permissionCard.getByRole('status').filter({ hasText: 'ainda não foram confirmadas' }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Conta do Dropbox vinculada', exact: true }).count(), 0);
  assert.equal(await permissionCard.getByRole('button', { name: 'Verificar permissões', exact: true }).isEnabled(), true);
  assert.deepEqual(await permissionCard.locator('code.cloud-badge').allTextContents(), ['files.content.read', 'files.content.write']);
  assert.equal(await permissionCard.getByRole('link', { name: 'App Console', exact: true }).getAttribute('rel'), 'noopener noreferrer');
  assert.equal(await page.getByRole('button', { name: 'Copiar URL de redirecionamento', exact: true }).evaluate(el => el.classList.contains('cloud-badge')), true);
  const badgeRadius = await permissionCard.locator('code.cloud-badge').first().evaluate(el => getComputedStyle(el).borderRadius);
  assert.equal(await page.getByRole('button', { name: 'Copiar URL de redirecionamento', exact: true }).evaluate(el => getComputedStyle(el).borderRadius), badgeRadius, 'URL button shares the actual computed badge radius');
  for (const [width, height] of [[1440, 900], [320, 780]]) {
    await page.setViewportSize({ width, height });
    await permissionCard.scrollIntoViewIfNeeded();
    assert.equal(await permissionCard.evaluate(el => el.scrollWidth > el.clientWidth), false);
    if (process.argv.includes('--screenshots')) await page.screenshot({ path: join(tmpdir(), `open-notes-dropbox-permissions-${width}.png`) });
  }
  confirmedRefreshScope = 'files.metadata.read files.content.read files.content.write';
  const previousRefreshes = refreshes;
  await page.getByRole('button', { name: 'Verificar permissões', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Seu espaço está sincronizado com o Dropbox.' }).waitFor();
  assert.equal(refreshes, previousRefreshes + 1, 'explicit verification refreshes a live token immediately');
  assert.equal(revoked, 1, 'permission verification never revokes the existing connection');
  assert.equal(await page.locator('code.cloud-badge').count(), 0, 'a confirmed grant clears the permissions notice');
  assert.deepEqual(errors, []);
  console.log('Dropbox browser: PKCE, personal key, hourly schedule, no early upload, scheduled/manual sync, next sync, reload, reopen, process restart, renewal, revocation and storage isolation passed.');
  await context.close();
} finally {
  auth.dispose(); await browser?.close();
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
