import { build as bundle } from 'esbuild';
import { build as buildApp } from 'vite';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir, platform, arch, cpus, totalmem } from 'node:os';
import { join, resolve, extname, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { benchmarkFingerprints } from './fingerprint.mjs';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
const allowed = new Set(['--sizes', '--repetitions', '--output', '--skip-ui']);
for (let i = 0; i < args.length; i++) {
  if (!allowed.has(args[i])) throw new Error(`Unknown option: ${args[i]}`);
  if (args[i] !== '--skip-ui') {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value: ${args[i]}`);
    i++;
  }
}
const sizes = option('--sizes', '1000,5000,10000').split(',').map(Number);
const repetitions = Number(option('--repetitions', '5'));
if (!sizes.length || sizes.some(n => !Number.isInteger(n) || n < 100 || n > 10000 || n % 100)) throw new Error('Sizes must be multiples of 100 from 100 to 10000.');
if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 30) throw new Error('Repetitions must be between 1 and 30.');
const output = resolve(option('--output', 'docs/benchmarks/latest.json'));
const skipUI = args.includes('--skip-ui');
const fingerprints = await benchmarkFingerprints();
const temporary = await mkdtemp(join(tmpdir(), 'open-notes-benchmark-'));
const appDir = join(temporary, 'app');
let browser;
let server;
const summary = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = p => sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)];
  return { n: values.length, min: sorted[0], median: sorted.length % 2 ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2,
  p95: percentile(0.95), max: sorted.at(-1) };
};
const twoFrames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
async function uiRound(page, origin, count, iteration) {
  const samples = {};
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/library?tab=collections`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelectorAll('.collection-card').length === 1);
  await page.evaluate(twoFrames);
  samples.libraryStartup = await page.evaluate(() => performance.now());
  // Counted before any collection opens: at this point the sidebar is the only
  // place where note rows can exist, so the number tracks how much of the DOM
  // collapsed collections keep mounted.
  const startupDomNodes = await page.locator('*').count();
  async function mark() { await page.evaluate(() => { window.__benchStart = performance.now(); }); }
  async function finish(name) {
    await page.evaluate(twoFrames);
    samples[name] = await page.evaluate(() => performance.now() - window.__benchStart);
  }
  await mark();
  await page.locator('.collection-card').click();
  await page.waitForFunction(n => document.querySelectorAll('.note-row').length === n, count);
  await finish('renderAllNotes');
  const domNodes = await page.locator('*').count();
  await mark();
  await page.getByRole('textbox', { name: 'Filtrar notas', exact: true }).fill('agulha-benchmark');
  await page.waitForFunction(n => document.querySelectorAll('.note-row').length === n / 100, count);
  await finish('searchRare');
  await mark();
  await page.getByRole('textbox', { name: 'Filtrar notas', exact: true }).fill('');
  await page.waitForFunction(n => document.querySelectorAll('.note-row').length === n, count);
  await finish('clearSearch');
  await mark();
  await page.locator('.note-row-main').first().click();
  await page.getByRole('textbox', { name: 'Título da nota', exact: true }).waitFor();
  await page.locator('[contenteditable="true"]').first().waitFor();
  await finish('openEditor');
  const id = decodeURIComponent(new URL(page.url()).pathname.split('/').at(-1));
  const title = `Edição sintética ${iteration}`;
  await mark();
  await page.getByRole('textbox', { name: 'Título da nota', exact: true }).fill(title);
  await page.waitForFunction(async ({ id, title }) => {
    return new Promise(resolve => {
      const request = indexedDB.open('open-notes', 2);
      request.onerror = () => resolve(false);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('notes', 'readonly');
        const note = transaction.objectStore('notes').get(id);
        transaction.oncomplete = () => { database.close(); resolve(note.result?.title === title); };
        transaction.onabort = () => { database.close(); resolve(false); };
      };
    });
  }, { id, title });
  await finish('editTitleToPersistence');
  if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
  return { samples, domNodes, startupDomNodes };
}

try {
  console.log('Building an isolated production app and benchmark harness…');
  await buildApp({
    logLevel: 'error', envPrefix: 'BENCHMARK_NO_ENV_',
    define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('') },
    build: { outDir: appDir, emptyOutDir: false },
  });
  await bundle({ entryPoints: ['benchmarks/browser.ts'], outfile: join(appDir, 'benchmark.js'),
    bundle: true, platform: 'browser', format: 'esm', target: 'es2022', minify: true });
  const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/__benchmark') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<!doctype html><title>Open Notes synthetic benchmark</title><script type="module" src="/benchmark.js"></script>');
        return;
      }
      const path = resolve(appDir, `.${pathname}`);
      if (!path.startsWith(appDir + sep) && path !== appDir) { response.writeHead(403); response.end(); return; }
      let data;
      let type;
      try { data = await readFile(path); type = types[extname(path)] || 'application/octet-stream'; }
      catch {
        if (extname(path)) { response.writeHead(404); response.end(); return; }
        data = await readFile(join(appDir, 'index.html')); type = 'text/html';
      }
      response.writeHead(200, { 'Content-Type': type }); response.end(data);
    } catch { response.writeHead(500); response.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const report = {
    schemaVersion: 1, complete: false, generatedAt: new Date().toISOString(),
    source: { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), ...fingerprints,
      dirty: !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim() },
    environment: { os: platform(), arch: arch(), cpu: cpus()[0]?.model, logicalCPUs: cpus().length,
      ramGiB: +(totalmem() / 1024 ** 3).toFixed(1), node: process.version, browser: browser.version(), headless: true },
    configuration: { sizes, repetitions, warmupRounds: 1, ui: !skipUI, noteBodyCharacters: 1024,
      richDocument: true, collectionCount: 1, folderCount: 10, externalNetwork: 'blocked',
      uiTiming: 'Browser wall time including Playwright dispatch, readiness polling and two animation frames; not INP.',
      storageTiming: 'performance.now through native IndexedDB transaction completion; write counters instrumented.' },
    results: [],
  };
  for (const count of sizes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    try {
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const harness = await context.newPage();
      harness.setDefaultTimeout(120_000);
      await harness.goto(`${origin}/__benchmark`);
      await harness.waitForFunction(() => !!window.benchmark);
      console.log(`${count} notes: native storage, selectors, sync preparation and recovery…`);
      const storage = await harness.evaluate(({ count, repetitions }) => window.benchmark.storage(count, repetitions), { count, repetitions });
      const result = { ...storage, summary: Object.fromEntries(Object.entries(storage.samples).map(([key, values]) => [key, summary(values)])) };
      if (!skipUI) {
        result.ui = { samples: {}, domNodes: [], startupDomNodes: [] };
        for (let iteration = -1; iteration < repetitions; iteration++) {
          await harness.evaluate(count => window.benchmark.seed(count), count);
          const page = await context.newPage();
          page.setDefaultTimeout(120_000);
          try {
            console.log(`${count} notes: full interface ${iteration < 0 ? 'warm-up' : `${iteration + 1}/${repetitions}`}…`);
            const round = await uiRound(page, origin, count, iteration);
            if (iteration >= 0) {
              for (const [name, value] of Object.entries(round.samples)) (result.ui.samples[name] ??= []).push(value);
              result.ui.domNodes.push(round.domNodes);
              result.ui.startupDomNodes.push(round.startupDomNodes);
            }
          } finally { await page.close(); }
        }
        result.ui.summary = Object.fromEntries(Object.entries(result.ui.samples).map(([key, values]) => [key, summary(values)]));
      }
      report.results.push(result);
      report.complete = report.results.length === sizes.length;
      await mkdir(resolve(output, '..'), { recursive: true });
      await writeFile(output, JSON.stringify(report, null, 2) + '\n');
      console.log(`${count} notes completed; edit median ${result.summary.editOne.median.toFixed(1)} ms.`);
    } finally { await context.close(); }
  }
  const names = Object.keys(report.results[0].summary);
  const rows = names.map(name => `| ${name} | ${report.results.map(r => `${r.summary[name].median.toFixed(1)} / ${r.summary[name].p95.toFixed(1)}`).join(' | ')} |`);
  if (!skipUI) for (const name of Object.keys(report.results[0].ui.summary)) {
    rows.push(`| UI: ${name} | ${report.results.map(r => `${r.ui.summary[name].median.toFixed(1)} / ${r.ui.summary[name].p95.toFixed(1)}`).join(' | ')} |`);
  }
  if (!skipUI) rows.push(`| UI DOM: nodes at library startup | ${report.results.map(r => r.ui.startupDomNodes[0]).join(' | ')} |`);
  const markdown = `# Benchmark Open Notes\n\nExecução: ${report.generatedAt}. Chromium ${report.environment.browser}, ${platform()} ${arch()}, ${repetitions} amostras após uma rodada de aquecimento.\n\nTempos em ms: **mediana / p95**. Com poucas amostras, p95 corresponde ao maior valor observado.\n\n| Operação | ${sizes.map(n => `${n} notas`).join(' | ')} |\n| --- | ${sizes.map(() => '---:').join(' | ')} |\n${rows.join('\n')}\n\nDados sintéticos; armazenamento nativo isolado; rede externa bloqueada. A interface usa build de produção. Tempos de UI incluem automação e dois frames, não são INP. A metodologia completa está em docs/benchmarks.md no repositório.\n`;
  await writeFile(output.replace(/\.json$/i, '') + '.md', markdown);
  console.log(`Report: ${output}`);
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
