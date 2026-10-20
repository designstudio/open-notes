import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { benchmarkFingerprints } from '../benchmarks/fingerprint.mjs';

const git = (root, ...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
async function put(root, file, contents) {
  await mkdir(dirname(join(root, file)), { recursive: true });
  await writeFile(join(root, file), contents);
}
async function fixture() {
  // Intentionally retained in OS temp: this preparation task forbids deletion.
  const root = await mkdtemp(join(tmpdir(), 'open-notes-fingerprint-test-'));
  git(root, 'init', '--quiet');
  git(root, 'config', 'core.autocrlf', 'false');
  for (const [file, content] of Object.entries({
    '.gitignore': '*.log\nnode_modules/\ndist/\n',
    'src/main.ts': 'export const value = 1;\n',
    'src/nota com espaço.ts': 'export const title = "Olá";\n',
    'package.json': '{"name":"fixture"}\n',
    'package-lock.json': '{}\n',
    'vite.config.ts': 'export default {};\n',
    'index.html': '<div id="root"></div>\n',
    'benchmarks/run.mjs': '// runner\n',
    'benchmarks/fixtures.ts': '// synthetic data\n',
    'benchmarks/browser.ts': '// browser harness\n',
    'benchmarks/fingerprint.mjs': '// fingerprint implementation\n',
  })) await put(root, file, content);
  return root;
}

test('hashes each sorted application path once, with no benchmark files', async () => {
  const root = await fixture();
  git(root, 'add', '.');
  await put(root, 'src/main.ts', 'export const value = 2;\n');
  const hash = createHash('sha256').update('open-notes:fingerprint:2:application\0');
  for (const file of ['src/main.ts', 'src/nota com espaço.ts', 'package.json', 'package-lock.json', 'vite.config.ts', 'index.html'].sort()) {
    const bytes = await readFile(join(root, file));
    hash.update(file).update('\0').update(String(bytes.length)).update('\0').update(bytes);
  }
  assert.equal((await benchmarkFingerprints(root)).codeSha256, hash.digest('hex'));
});

test('new, staged and partially staged contents have the same identity', async () => {
  const root = await fixture();
  const untracked = await benchmarkFingerprints(root);
  git(root, 'add', '.');
  assert.deepEqual(await benchmarkFingerprints(root), untracked);
  await put(root, 'src/main.ts', 'export const value = 2;\n');
  await put(root, 'benchmarks/run.mjs', '// changed runner\n');
  const unstaged = await benchmarkFingerprints(root);
  git(root, 'add', '--', 'src/main.ts');
  assert.deepEqual(await benchmarkFingerprints(root), unstaged);
  git(root, 'add', '--', 'benchmarks/run.mjs');
  assert.deepEqual(await benchmarkFingerprints(root), unstaged);
});

test('application changes affect only codeSha256', async () => {
  const root = await fixture();
  const before = await benchmarkFingerprints(root);
  await put(root, 'src/main.ts', '// changed app\n');
  const after = await benchmarkFingerprints(root);
  assert.notEqual(after.codeSha256, before.codeSha256);
  assert.equal(after.runnerSha256, before.runnerSha256);
  assert.equal(after.fingerprintVersion, 2);
});

test('runner, harness, fixture and fingerprint changes affect only runnerSha256', async () => {
  const root = await fixture();
  let before = await benchmarkFingerprints(root);
  for (const file of ['benchmarks/run.mjs', 'benchmarks/browser.ts', 'benchmarks/fixtures.ts', 'benchmarks/fingerprint.mjs']) {
    await put(root, file, `// changed ${file}\n`);
    const after = await benchmarkFingerprints(root);
    assert.equal(after.codeSha256, before.codeSha256, file);
    assert.notEqual(after.runnerSha256, before.runnerSha256, file);
    before = after;
  }
});

test('a new source changes the hash before staging and keeps it after staging', async () => {
  const root = await fixture();
  git(root, 'add', '.');
  const before = await benchmarkFingerprints(root);
  await put(root, 'src/new.ts', '// new application source\n');
  const after = await benchmarkFingerprints(root);
  assert.notEqual(after.codeSha256, before.codeSha256);
  git(root, 'add', '--', 'src/new.ts');
  assert.deepEqual(await benchmarkFingerprints(root), after);
});

test('ignored files and unrelated reports do not change either identity', async () => {
  const root = await fixture();
  const before = await benchmarkFingerprints(root);
  for (const file of ['src/debug.log', 'benchmarks/debug.log', 'node_modules/package.js', 'dist/app.js', 'docs/benchmarks/report.json', 'scratch.ts']) {
    await put(root, file, '// unrelated\n');
  }
  assert.deepEqual(await benchmarkFingerprints(root), before);
});

test('source removal has the same identity before and after staging', async () => {
  const root = await fixture();
  git(root, 'add', '.');
  const before = await benchmarkFingerprints(root);
  // Move the file out of the source scope; nothing is deleted from disk.
  await rename(join(root, 'src/main.ts'), join(root, 'saved-main.ts'));
  const after = await benchmarkFingerprints(root);
  assert.notEqual(after.codeSha256, before.codeSha256);
  git(root, 'add', '-A', '--', 'src/');
  assert.deepEqual(await benchmarkFingerprints(root), after);
});

test('identical repositories in different directories have identical fingerprints', async () => {
  assert.deepEqual(await benchmarkFingerprints(await fixture()), await benchmarkFingerprints(await fixture()));
});
