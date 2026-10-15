import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('assets/design-tokens.json','utf8'));
const layers=['primitive','semantic','component'];
const definitions = new Map();
for(const layer of layers) for(const [name,token] of Object.entries(config[layer])) definitions.set(`${layer}.${name}`,token);
function reference(key) {
  const token=definitions.get(key);
  if(!token) throw new Error(`Unknown token: ${key}`);
  return `var(--${key.startsWith('primitive.')?'primitive-':''}${key.split('.').slice(1).join('-')})`;
}
function value(token, key) {
  const raw=String(token.$value);
  if(!key.startsWith('primitive.') && !raw.includes('{')) throw new Error(`Non-primitive raw value: ${key}`);
  return raw.replace(/\{([\w.-]+)\}/g,(_,ref)=>reference(ref));
}
function visit(key,trail=[]) {
  if(trail.includes(key))throw new Error(`Cyclic token: ${[...trail,key].join(' -> ')}`);
  const token=definitions.get(key);
  if(!token)throw new Error(`Unknown token: ${key}`);
  for(const match of String(token.$value).matchAll(/\{([\w.-]+)\}/g))visit(match[1],[...trail,key]);
}
for(const key of definitions.keys()) {
  visit(key);
  const layer=key.split('.')[0];
  const refs=[...String(definitions.get(key).$value).matchAll(/\{([\w.-]+)\}/g)].map(match=>match[1]);
  if(layer==='primitive' && (refs.length || String(definitions.get(key).$value).includes('var(')))throw new Error(`Primitive must contain raw values only: ${key}`);
  if(layer==='semantic' && refs.some(ref=>ref.startsWith('component.')))throw new Error(`Semantic references a component: ${key}`);
  if(layer==='component' && refs.some(ref=>!ref.startsWith('semantic.')))throw new Error(`Component must reference semantics: ${key}`);
}
let output='/* Generated from assets/design-tokens.json. Run npm run tokens:generate. */\n';
for(const layer of layers) {
  output+=`\n/* ${layer.toUpperCase()} */\n:root {\n`;
  for(const [name,token] of Object.entries(config[layer]))output+=`  --${layer==='primitive'?'primitive-':''}${name}: ${value(token,`${layer}.${name}`)};\n`;
  output+='}\n';
}
for(const [selector,tokens] of Object.entries(config.themes)) {
  output+=`\n/* Scoped semantics: ${selector} */\n${selector} {\n`;
  for(const [name,token] of Object.entries(tokens))output+=`  --${name}: ${value(token,`semantic.${name}`)};\n`;
  output+='}\n';
}
if(process.argv.includes('--check')) {
  if(fs.readFileSync('src/design-tokens.css','utf8')!==output) throw new Error('Generated CSS is out of date. Run npm run tokens:generate.');
  console.log(`Token graph valid: ${definitions.size} tokens; references resolve without cycles; CSS matches JSON.`);
} else {
  fs.writeFileSync('src/design-tokens.css',output);
  console.log(`Generated src/design-tokens.css (${definitions.size} tokens).`);
}
