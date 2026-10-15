import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve('src');
const after=process.argv.includes('--after');
const outputName=after?'design-inventory-after':'design-inventory';
if(!after && fs.existsSync('docs/design-inventory.json'))throw new Error('The pre-migration snapshot already exists. Use --after to audit the current source without overwriting history.');
function files(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const groups = {colors:{}, typography:{}, spacing:{}, radius:{}, shadows:{}, motion:{}, dimensions:{}};
const variables = [];
const declarations = [];
const sourceFiles = files(root).filter(file => /\.(css|scss|tsx|ts)$/.test(file) && !file.endsWith('design-tokens.css'));
function add(group, value, file, line, property) {
  (groups[group][value] ??= []).push({file, line, property});
}
for (const absolute of sourceFiles) {
  const source = fs.readFileSync(absolute, 'utf8');
  const file = path.relative(process.cwd(), absolute).replaceAll('\\','/');
  // Keep original line positions while removing comments.
  const text = source.replace(/\/\*[\s\S]*?\*\//g, value => value.replace(/[^\n]/g,' '));
  for (const match of text.matchAll(/#[\da-f]{3,8}\b|(?:rgba?|hsla?|oklch)\([^)]*\)/gi)) {
    add('colors',match[0],file,text.slice(0,match.index).split('\n').length,'literal');
  }
  if (!/\.(css|scss)$/.test(file)) {
    const tree=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    function inspect(node) {
      if(ts.isJsxAttribute(node) && node.name.getText(tree)==='style' && node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isObjectLiteralExpression(node.initializer.expression)) {
        for(const prop of node.initializer.expression.properties) if(ts.isPropertyAssignment(prop)) {
          const property=prop.name.getText(tree).replace(/["']/g,'').replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
          let value=prop.initializer.getText(tree);
          if(ts.isNumericLiteral(prop.initializer) && !/^(opacity|z-index|line-height|font-weight|flex)/.test(property))value+='px';
          const group=/^(font|line-height|letter-spacing)/.test(property)?'typography':/^(padding|margin|gap)/.test(property)?'spacing':/radius/.test(property)?'radius':/shadow/.test(property)?'shadows':/^(width|height|min-|max-)/.test(property)?'dimensions':null;
          if(group)add(group,value,file,tree.getLineAndCharacterOfPosition(prop.getStart(tree)).line+1,property);
        }
      }
      ts.forEachChild(node,inspect);
    }
    inspect(tree);
    continue;
  }
  for (const match of text.matchAll(/(?:^|[;{}])\s*([\w-]+)\s*:\s*([^;{}]+)/g)) {
    const property=match[1], value=match[2].trim();
    const line=text.slice(0,match.index).split('\n').length;
    const declaration={file,line,property,value};
    declarations.push(declaration);
    if(property.startsWith('--')) variables.push(declaration);
    const group = /^(font|line-height|letter-spacing)/.test(property) ? 'typography'
      : /^(padding|margin|gap|row-gap|column-gap)/.test(property) ? 'spacing'
      : /radius/.test(property) ? 'radius' : /shadow/.test(property) ? 'shadows'
      : /^(transition|animation|transform|filter)/.test(property) ? 'motion'
      : /^(min-|max-)?(width|height)$/.test(property) ? 'dimensions' : null;
    if(group) add(group,value,file,line,property);
  }
}
fs.mkdirSync('docs',{recursive:true});
const inventory={method:'Literal colors in CSS/SCSS/TSX/TS; declaration values in CSS/SCSS. Static inventory, not computed cascade. Comments excluded; authored content colors included.',files:sourceFiles.map(file=>path.relative(process.cwd(),file).replaceAll('\\','/')),groups,variables,declarations};
fs.writeFileSync(`docs/${outputName}.json`,JSON.stringify(inventory,null,2)+'\n');
const labels={colors:'Cores literais',typography:'Tipografia',spacing:'Spacing',radius:'Raios',shadows:'Sombras',motion:'Motion',dimensions:'Dimensões'};
let md=`# Inventário do design existente — ${after?'depois':'antes'} da migração\n\nCSS global + SCSS do editor; sem Tailwind, CSS Modules ou styled-components. Inventário estático de valores declarados: inclui overrides, tokens e cores do conteúdo editorial; não representa sozinho o estilo final computado. Localização completa no JSON adjacente. CSS gerado é excluído; estilos inline literais e expressões são listados separadamente dos valores computados.\n\n`;
for(const [group,values] of Object.entries(groups)) {
  md+=`## ${labels[group]} (${Object.keys(values).length} valores distintos)\n\n| Valor | Ocorrências | Exemplo |\n|---|---:|---|\n`;
  for(const [value,uses] of Object.entries(values).sort((a,b)=>b[1].length-a[1].length)) md+=`| \`${value.replaceAll('|','\\|')}\` | ${uses.length} | ${uses[0].file}:${uses[0].line} · ${uses[0].property} |\n`;
  md+='\n';
}
md+='## Variáveis existentes\n\n| Variável | Valor | Arquivo |\n|---|---|---|\n';
for(const v of variables) md+=`| \`${v.property}\` | \`${v.value}\` | ${v.file}:${v.line} |\n`;
fs.writeFileSync(`docs/${outputName}.md`,md);
console.log(JSON.stringify({files:sourceFiles.length,variables: variables.length,groups:Object.fromEntries(Object.entries(groups).map(([key,values])=>[key,Object.keys(values).length])),fontSizes:[...new Set(declarations.filter(d=>d.property==='font-size').map(d=>d.value))],radius:[...new Set(declarations.filter(d=>d.property==='border-radius').map(d=>d.value))]},null,2));
