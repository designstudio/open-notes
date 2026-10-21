import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const unitEntries = [
  'integrations.test.tsx',
  'dropbox-sync.test.tsx',
  'migrations.test.ts',
  'granular-storage.test.ts', 'app-modules.test.tsx', 'drive-sync.test.tsx', 'drive-session.test.tsx',
  'find-replace.test.ts', 'local-data.test.ts', 'toasts.test.tsx',
  'sidebar-resize.test.tsx', 'sidebar-state.test.ts', 'sidebar-tree.test.tsx', 'collection-order.test.ts', 'themes.test.ts',
];
const integrationEntries = ['app-flows.test.tsx', 'sync-integration.test.tsx'];
const reactRuntime = (asFileUrl = true) => ({
  name: 'external-react',
  setup(builder) {
    // Component tests render real implementations, which reach react-dom
    // through tooltips and portals. Keep both runtimes external so the
    // bundled copy never mixes with react-test-renderer's React.
    builder.onResolve({ filter: /^(react|react-dom|react-test-renderer)(\/.*)?$/ }, args => {
      const id = resolve('node_modules', args.path === 'react-dom/server' ? 'react-dom/server.node.js' : args.path === 'react/jsx-runtime'
        ? 'react/jsx-runtime.js' : args.path === 'react/jsx-dev-runtime' ? 'react/jsx-dev-runtime.js'
        : args.path.endsWith('.js') ? args.path : `${args.path}/index.js`);
      return { path: asFileUrl ? pathToFileURL(id).href : id, external: true };
    });
  },
});
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
  // Component tests render real implementations, which may import stylesheet
  // modules (e.g. AppSidebar → tooltip.scss) or CJS-only dependencies
  // (@radix-ui, react-remove-scroll). Styles resolve to an empty module and
  // the unit bundles stay CommonJS so those packages' `require('react')` calls
  // share the external React instead of hitting esbuild's ESM shim.
  await build({ ...options, format: 'cjs', outExtension: { '.js': '.cjs' }, entryPoints: unitEntries.map(name => `tests/${name}`), loader: { '.css': 'empty', '.scss': 'empty', '.svg': 'dataurl' }, plugins: [reactRuntime(false)] });
  // Keep UI substitutions scoped to the integration bundles, so the existing
  // component tests continue to exercise their real implementations.
  await build({
    ...options, entryPoints: integrationEntries.map(name => `tests/${name}`),
    loader: { '.css': 'empty', '.scss': 'empty', '.svg': 'dataurl' },
    define: { ...options.define, 'import.meta.hot': 'undefined' },
    plugins: [uiBoundaries, reactRuntime()],
  });
  const outputs = [
    resolve('tests/dropbox-auth.test.mjs'), resolve('tests/dropbox-files.test.mjs'), resolve('tests/credential-vault.test.mjs'),
    ...unitEntries.map(name => join(folder, `${basename(name).replace(/\.tsx?$/, '')}.cjs`)),
    ...integrationEntries.map(name => join(folder, `${basename(name).replace(/\.tsx?$/, '')}.mjs`)),
  ];
  const result = spawnSync(process.execPath, ['--test', '--test-timeout=15000', ...outputs], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { await rm(folder, { recursive: true, force: true }); }
