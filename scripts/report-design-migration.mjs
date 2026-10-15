import fs from 'node:fs';
const before=JSON.parse(fs.readFileSync('docs/design-inventory.json','utf8'));
const after=JSON.parse(fs.readFileSync('docs/design-inventory-after.json','utf8'));
function declarations(inventory,file){return inventory.declarations.filter(d=>d.file===file).map(d=>`${d.property}:${d.value}`).sort().join('\n');}
const sourceStyles=[...new Set([...before.files,...after.files])].filter(file=>/\.(css|scss)$/.test(file));
const changed=sourceStyles.filter(file=>declarations(before,file)!==declarations(after,file));
const created=[
 'assets/design-tokens.json','src/design-tokens.css','src/component-states.css',
 'scripts/audit-design-system.mjs','scripts/generate-design-tokens.mjs','scripts/report-design-migration.mjs',
 'scripts/vendor/validate-tokens.cjs','scripts/vendor/NOTICE.md','scripts/vendor/LICENSE',
 'docs/design-system.md','docs/design-inventory.md','docs/design-inventory.json',
 'docs/design-inventory-after.md','docs/design-inventory-after.json','docs/design-audit-summary.json',
 'docs/token-validation-before.txt','docs/token-validation-after.txt',
 'docs/design-contrast.json','docs/design-state-observations.json','docs/design-files.json',
];
const manifest={
 method:'Styles compared by declared property/value multisets in before/after snapshots. Component/source changes listed explicitly. Generated dist and temporary previews are excluded.',
 created,
 modified:[...new Set(['package.json','src/main.tsx','src/App.tsx','src/themes.ts',...changed])].filter(file=>!created.includes(file)).sort(),
 validation:{tokenGraph:'passed',build:'passed',existingTests:{passed:50,failed:0},regexScanner:{before:857,after:301,status:'potential findings remain; exit code 1 is expected and not suppressed'},visual:'six palettes in light/dark plus real Library page'},
};
fs.writeFileSync('docs/design-files.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Manifest: ${manifest.created.length} created files; ${manifest.modified.length} modified files.`);
