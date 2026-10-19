import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Native IndexedDB verification: temporary origin/profile, no real user data.
const temporary = await mkdtemp(join(tmpdir(), 'open-notes-migrations-'));
let server;
let browser;
try {
  const bundle = join(temporary, 'migration-checks.js');
  await build({ entryPoints: ['tests/helpers/migration-browser.ts'], outfile: bundle,
    bundle: true, platform: 'browser', format: 'esm', target: 'es2022' });
  const code = await readFile(bundle);
  server = createServer((request, response) => {
    if (request.url === '/migration-checks.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript' });
      response.end(code);
    } else if (request.url === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><title>Isolated migration checks</title><script type="module" src="/migration-checks.js"></script>');
    } else { response.writeHead(404); response.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.waitForFunction(() => typeof window.migrationChecks === 'function');
  const results = await page.evaluate(() => window.migrationChecks());
  if (errors.length) throw new Error(errors.join('\n'));
  for (const result of results) console.log(`PASS: ${result}`);
  console.log(`${results.length} native IndexedDB scenarios passed.`);
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
