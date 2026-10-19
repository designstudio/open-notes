// Run with: node tests/startup-browser.mjs
// Uses disposable browser profiles and a temporary production build.
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, createServer, preview } from 'vite';
import { chromium } from 'playwright';

const temporary = await mkdtemp(join(tmpdir(), 'open-notes-startup-'));
let browser;
let server;
try {
  await build({
    logLevel: 'error', envPrefix: 'STARTUP_TEST_NO_ENV_',
    define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('') },
    build: { outDir: temporary, emptyOutDir: false },
  });
  browser = await chromium.launch();
  for (const mode of ['production', 'development']) {
    server = mode === 'production'
      ? await preview({ build: { outDir: temporary }, preview: { host: '127.0.0.1', port: 0, open: false } })
      : await createServer({
        envPrefix: 'STARTUP_TEST_NO_ENV_',
        define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('') },
        server: { host: '127.0.0.1', port: 0, open: false },
      });
    if (mode === 'development') await server.listen();
    const origin = server.resolvedUrls.local[0];
    const context = await browser.newContext();
    let releaseEditor;
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      const errors = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      // Hold the editor chunk to verify the entire note stays hidden.
      const editorGate = new Promise(resolve => { releaseEditor = resolve; });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(origin).origin) return route.abort();
        requests.push(url.pathname);
        if (/\/(?:assets\/)?RichNote[.-]/.test(url.pathname)) await editorGate;
        return route.continue();
      });
      await page.goto(`${origin}library`, { waitUntil: 'domcontentloaded' });
      await page.locator('.collection-card').first().waitFor();
      assert.ok(!requests.some(path => /\/(?:assets\/)?Preferences[.-]/.test(path)), 'preferences stay deferred');
      await page.goto(`${origin}n/1`, { waitUntil: 'domcontentloaded' });
      const title = page.getByRole('textbox', { name: 'Título da nota', exact: true });
      const loading = page.getByRole('status', { name: 'Carregando nota' });
      await loading.waitFor();
      assert.equal(await loading.innerText(), '', 'loading has no visible text');
      assert.equal(await title.isVisible(), false, 'title waits for the complete note');
      assert.ok(!(await page.locator('body').innerText()).includes('Abrindo seu espaço'));
      if (mode === 'production' && process.argv.includes('--screenshots')) {
        await mkdir('artifacts', { recursive: true });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.note-loading')).opacity === '1');
        await page.screenshot({ path: 'artifacts/note-loading-desktop.png' });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await page.locator('.note-loading-icon').evaluate(element => getComputedStyle(element).animationName), 'none');
        await page.screenshot({ path: 'artifacts/note-loading-mobile.png' });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.setViewportSize({ width: 1440, height: 900 });
      }
      releaseEditor();
      const body = page.getByRole('textbox', { name: 'Conteúdo da nota', exact: true });
      await body.waitFor();
      await loading.waitFor({ state: 'detached' });
      await title.fill('Título depois do carregamento');
      assert.match(await body.innerText(), /Um lembrete para os dias/);
      await body.fill('Texto salvo depois do carregamento');
      await page.waitForFunction(async () => new Promise(resolve => {
        const request = indexedDB.open('open-notes', 2);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction('notes');
          const note = transaction.objectStore('notes').get('1');
          transaction.oncomplete = () => {
            database.close();
            resolve(note.result?.body.includes('Texto salvo depois do carregamento'));
          };
        };
      }));
      await page.reload();
      await body.waitFor();
      assert.equal(await title.inputValue(), 'Título depois do carregamento');
      assert.match(await body.innerText(), /Texto salvo depois do carregamento/);
      await page.getByRole('button', { name: 'Preferências', exact: true }).first().click();
      await page.locator('.preferences-layout').waitFor();
      assert.ok(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]')), 'focus stays in preferences');
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
      await page.locator('dialog[open]').waitFor({ state: 'hidden' });
      // Return through SPA navigation: the idle-prepared component mounts
      // without suspending, and subsequent edits must keep its DOM instance.
      await page.locator('a[href="/library?tab=collections"]').first().click();
      await page.locator('.collection-card').first().waitFor();
      await page.locator('.collection-card').filter({ hasText: 'Pessoal' }).click();
      await page.locator('.note-row-main').filter({ hasText: 'Título depois do carregamento' }).click();
      await body.waitFor();
      await page.evaluate(() => { window.__editorNode = document.querySelector('[aria-label="Conteúdo da nota"]'); });
      await title.fill('Editor preparado');
      assert.ok(await page.evaluate(() => window.__editorNode === document.querySelector('[aria-label="Conteúdo da nota"]')), 'title edits preserve the editor instance');
      await page.getByRole('button', { name: 'Nova nota', exact: true }).click();
      await body.waitFor();
      assert.equal(await title.inputValue(), '');
      assert.ok(await title.evaluate(element => document.activeElement === element), 'a new note focuses its title after becoming ready');
      assert.deepEqual(errors, [], `${mode}: no browser exceptions`);
      console.log(`${mode}: startup, deferred editor, persistence, reload and preferences passed`);
    } finally { releaseEditor?.(); await context.close(); }
    const compatibilityContext = await browser.newContext();
    try {
      const page = await compatibilityContext.newPage();
      await compatibilityContext.route('**/*', route => new URL(route.request().url()).origin === new URL(origin).origin ? route.continue() : route.abort());
      await page.goto(`${origin}library`);
      await page.locator('.collection-card').first().waitFor();
      await page.evaluate(() => new Promise((resolve, reject) => {
        const request = indexedDB.open('open-notes', 3);
        request.onupgradeneeded = () => request.result.createObjectStore('future-test').put({ preserved: true }, 'marker');
        request.onsuccess = () => { request.result.close(); resolve(); };
        request.onerror = () => reject(request.error);
      }));
      await page.reload();
      await page.getByRole('heading', { name: 'Atualize o Open Notes', exact: true }).waitFor();
      const preserved = await page.evaluate(() => new Promise((resolve, reject) => {
        const request = indexedDB.open('open-notes', 3);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction(['future-test', 'notes']);
          const marker = transaction.objectStore('future-test').get('marker');
          const count = transaction.objectStore('notes').count();
          transaction.oncomplete = () => { database.close(); resolve(marker.result?.preserved && count.result > 0); };
        };
        request.onerror = () => reject(request.error);
      }));
      assert.ok(preserved, 'the older app preserves the newer database');
      console.log(`${mode}: newer database shows update guidance and remains intact`);
    } finally { await compatibilityContext.close(); }
    if (mode === 'development') await server.close();
    else await new Promise(resolve => server.httpServer.close(resolve));
    server = null;
  }
} finally {
  await browser?.close();
  if (server?.close) await server.close();
  else if (server) await new Promise(resolve => server.httpServer.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
