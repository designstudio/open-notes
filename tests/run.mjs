import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const unitEntries = [
  'granular-storage.test.ts', 'app-modules.test.tsx', 'drive-sync.test.tsx',
  'find-replace.test.ts', 'local-data.test.ts', 'toasts.test.tsx',
  'sidebar-resize.test.tsx', 'sidebar-state.test.ts', 'collection-order.test.ts', 'themes.test.ts',
];
const integrationEntries = ['app-flows.test.tsx', 'sync-integration.test.tsx'];
const reactRuntime = {
  name: 'external-react',
  setup(builder) {
    builder.onResolve({ filter: /^(react|react-test-renderer)(\/.*)?$/ }, args => ({
      path: pathToFileURL(resolve('node_modules', args.path === 'react/jsx-runtime'
        ? 'react/jsx-runtime.js' : `${args.path}/index.js`)).href,
      external: true,
    }));
  },
};
const uiBoundaries = {
  name: 'integration-ui-boundaries',
  setup(builder) {
    const names = [
      'app/AppSidebar', 'app/NotesLibrary', 'app/NoteEditor', 'app/NoteToolbar',
      'app/AppDialogs', 'Feedback', 'AnimatedDialog', 'IconButton',
    ];
    const paths = new Set(names.map(name => resolve('src', name)));
    builder.onResolve({ filter: /^\./ }, args => paths.has(resolve(args.resolveDir, args.path).replace(/\.tsx?$/, ''))
      ? { path: resolve('tests/helpers/app-ui.tsx') } : undefined);
  },
};

const folder = await mkdtemp(join(tmpdir(), 'open-notes-tests-'));
try {
  const options = {
    outdir: folder, outExtension: { '.js': '.mjs' }, bundle: true,
    platform: 'node', format: 'esm', jsx: 'automatic',
    define: { 'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('test-client') },
  };
  await build({ ...options, entryPoints: unitEntries.map(name => `tests/${name}`), plugins: [reactRuntime] });
  // Keep UI substitutions scoped to the integration bundles, so the existing
  // component tests continue to exercise their real implementations.
  await build({
    ...options, entryPoints: integrationEntries.map(name => `tests/${name}`),
    loader: { '.css': 'empty', '.scss': 'empty' },
    define: { ...options.define, 'import.meta.hot': 'undefined' },
    plugins: [uiBoundaries, reactRuntime],
  });
  const outputs = [...unitEntries, ...integrationEntries].map(name =>
    join(folder, `${basename(name).replace(/\.tsx?$/, '')}.mjs`));
  const result = spawnSync(process.execPath, ['--test', '--test-timeout=15000', ...outputs], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { await rm(folder, { recursive: true, force: true }); }
