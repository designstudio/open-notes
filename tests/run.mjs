import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const folder = await mkdtemp(join(tmpdir(), 'open-notes-sync-tests-'));
try {
  const outputs = ['drive-sync.test', 'find-replace.test', 'local-data.test', 'toasts.test', 'sidebar-resize.test', 'sidebar-state.test', 'collection-order.test', 'themes.test'].map(name => join(folder, `${name}.mjs`));
  await build({
    entryPoints: ['tests/drive-sync.test.tsx', 'tests/find-replace.test.ts', 'tests/local-data.test.ts', 'tests/toasts.test.tsx', 'tests/sidebar-resize.test.tsx', 'tests/sidebar-state.test.ts', 'tests/collection-order.test.ts', 'tests/themes.test.ts'], outdir: folder, outExtension: { '.js': '.mjs' },
    bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
    define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('test-client') },
    plugins: [{ name: 'external-react', setup(builder) {
      builder.onResolve({ filter: /^(react|react-test-renderer)(\/.*)?$/ }, args => ({
        path: pathToFileURL(resolve('node_modules', args.path === 'react/jsx-runtime' ? 'react/jsx-runtime.js' : `${args.path}/index.js`)).href, external: true,
      }));
    } }],
  });
  const result = spawnSync(process.execPath, ['--test', ...outputs], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally { await rm(folder, { recursive: true, force: true }); }
