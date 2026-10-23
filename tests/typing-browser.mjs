// Disposable profile and synthetic notes; never uses the user's workspace.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false },
  envPrefix: 'TYPING_TEST_NO_ENV_', define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('') } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const origin = server.resolvedUrls.local[0];
  await page.route('**/api/dropbox/**', route => route.abort());
  await page.goto(`${origin}library`);
  await page.locator('.collection-card').first().waitFor();
  await page.evaluate(async () => {
    const { makeWorkspace } = await import('/benchmarks/fixtures.ts');
    const { saveLocalData } = await import('/src/local-data.ts');
    const data = makeWorkspace(500);
    const paragraphs = Array.from({ length: 200 }, (_, i) => ({ type: 'paragraph', content: [{ type: 'text', text: `Parágrafo ${i}. ` + 'Texto para medir a digitação. '.repeat(8) }] }));
    data.notes[0] = { ...data.notes[0], body: paragraphs.map(p => p.content[0].text).join('\n\n'), document: { type: 'doc', content: paragraphs } };
    await saveLocalData(data);
    localStorage.setItem('open-notes-sync-provider', 'dropbox');
  });
  await page.goto(`${origin}n/bench-0`);
  const editor = page.getByRole('textbox', { name: 'Conteúdo da nota', exact: true });
  await editor.waitFor();
  await editor.click();
  await page.keyboard.press('Control+End');
  await page.evaluate(() => {
    window.typingSamples = [];
    document.addEventListener('keydown', event => {
      if (event.key.length !== 1) return;
      const start = performance.now();
      requestAnimationFrame(() => window.typingSamples.push(performance.now() - start));
    });
  });
  const text = ' Texto digitado sem perder letras durante a escrita.';
  await page.keyboard.type(text, { delay: 20 });
  await page.waitForFunction(() => window.typingSamples.length >= 40);
  const samples = await page.evaluate(() => window.typingSamples.sort((a, b) => a - b));
  console.log(JSON.stringify({ fixture: '500 notes, active document with 200 paragraphs', samples: samples.length,
    medianMs: samples[Math.floor(samples.length / 2)], p95Ms: samples[Math.floor(samples.length * .95)] }));
  assert.ok((await editor.innerText()).endsWith(text), 'all keystrokes reach the document');
  // Leaving the editor immediately must preserve its last edit as well.
  await page.locator('a[href="/library?tab=collections"]').first().click();
  await page.waitForFunction(async () => {
    const { loadLocalData } = await import('/src/local-data.ts');
    return (await loadLocalData()).notes[0].body.endsWith('Texto digitado sem perder letras durante a escrita.');
  });
  await page.goto(`${origin}n/bench-0`);
  await editor.waitFor();
  assert.ok((await editor.innerText()).endsWith(text), 'typing survives navigation and reload');
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await server.close();
}
