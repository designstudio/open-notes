// Real layout regression with synthetic notes in disposable browser profiles.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium, firefox } from 'playwright';
import { preview } from 'vite';

const collections = Array.from({ length: 12 }, (_, index) => ({
  id: `scroll-collection-${index}`, name: `Coleção de teste ${index + 1}`, color: 'sage', pinned: index === 0,
}));
const notes = collections.flatMap(collection => Array.from({ length: 9 }, (_, index) => ({
  id: `${collection.id}-note-${index}`, title: `Nota de teste ${index + 1}`, body: 'Conteúdo sintético',
  collection: collection.id, tags: [], favorite: false, archived: false, deleted: false, updated: index + 1, icon: 'leaf',
})));
const server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } });
const origin = server.resolvedUrls.local[0];
try {
  for (const engine of [chromium, firefox]) {
    if (engine === firefox && !existsSync(engine.executablePath())) {
      console.log(`${engine.name()}: skipped (browser not installed)`);
      continue;
    }
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(origin).origin) return route.abort();
        if (url.pathname.startsWith('/api/dropbox/')) return route.fulfill({ status: 503, json: { message: 'Synthetic unavailable service' } });
        return route.continue();
      });
      await context.addInitScript(({ collections, notes }) => {
        localStorage.setItem('open-notes-v1', JSON.stringify({ collections, notes, folders: [], profile: { name: 'Perfil de teste', photo: '' } }));
        localStorage.setItem('open-notes-sidebar-state', JSON.stringify({
          collapsed: false, collectionsOpen: true, pinnedOpen: true, recentOpen: true,
          expandedCollections: collections.map(collection => collection.id),
        }));
      }, { collections, notes });
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const [width, height] of [[1440, 900], [800, 600], [1000, 400], [390, 844], [390, 400]]) {
        await page.setViewportSize({ width, height });
        await page.goto(`${origin}library?tab=collections`);
        await page.locator('.collection-card').first().waitFor();
        if (width <= 700) await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
        const metrics = await page.locator('.sidebar-expanded').evaluate(element => {
          const scrollable = [element.parentElement, element, ...element.querySelectorAll('*')].filter(node => {
            const style = getComputedStyle(node);
            return style.visibility !== 'hidden' && node.clientHeight > 0 &&
              /^(auto|scroll)$/.test(style.overflowY) && node.scrollHeight - node.clientHeight > 1;
          }).map(node => node.className);
          const profile = element.querySelector('.sidebar-bottom').getBoundingClientRect();
          const brand = element.querySelector('.sidebar-brand').getBoundingClientRect();
          return { scrollable, profileBottom: profile.bottom, brandTop: brand.top,
            outerHeight: element.clientHeight, outerContent: element.scrollHeight,
            frames: ['.sidebar-scroll-frame', '.sidebar-library', '.sidebar-scroll-content'].map(selector => {
              const node = element.querySelector(selector), style = getComputedStyle(node);
              return { selector, height: node.clientHeight, content: node.scrollHeight, overflow: style.overflowY, top: node.getBoundingClientRect().top };
            }) };
        });
        assert.deepEqual(metrics.scrollable, ['sidebar-library'], `${engine.name()} ${width}x${height}: ${JSON.stringify(metrics)}`);
        assert.ok(metrics.profileBottom <= height + 1, 'profile remains visible');
        const library = page.getByRole('region', { name: 'Notas e coleções', exact: true });
        await library.hover();
        await page.mouse.wheel(0, 1000);
        await page.waitForFunction(() => document.querySelector('.sidebar-library').scrollTop > 0);
        assert.equal(await page.locator('.sidebar-expanded').evaluate(element => element.scrollTop), 0, 'only the library scrolls');
        assert.equal(await page.locator('.sidebar-brand').evaluate(element => element.getBoundingClientRect().top), metrics.brandTop, 'header stays fixed');
        await library.press('End');
        await page.waitForFunction(() => {
          const library = document.querySelector('.sidebar-library');
          return library.scrollTop + library.clientHeight >= library.scrollHeight - 1;
        });
        assert.equal(await library.getAttribute('aria-label'), 'Notas e coleções');
        if (process.argv.includes('--screenshots')) await page.screenshot({ path: join(tmpdir(), `open-notes-sidebar-scroll-${engine.name()}-${width}-${height}.png`) });
      }
      assert.deepEqual(errors, []);
      console.log(`${engine.name()}: one sidebar scrollbar, fixed header/profile and keyboard scrolling passed at five viewport sizes`);
      await context.close();
    } finally { await browser.close(); }
  }
} finally { await new Promise(resolve => server.httpServer.close(resolve)); }
