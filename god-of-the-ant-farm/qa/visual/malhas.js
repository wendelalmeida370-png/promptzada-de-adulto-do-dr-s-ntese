// malhas: the meshes made outside (js/mesh-*.js, read by js/mesh3d.js) checked without a browser — G.Mesh3D.check() itself
// (the counts, the index inside the points, no NaN, unit normals, the box, the parts), and the art bible's budget (§6, §8):
// each file ≤ 60 KB, all ≤ 1 MB, the triangles of each, every one loaded by a <script> of index.html. And the library of the
// furniture of the interiors (js/movelmesh.js, made by arte/blender/moveis.py, read by js/movel3d.js — the interiors 2.0, the
// front P2, D-715): a category of its own, as the people's and the beasts' meshes are — its whole file ≤ 5 MB, each model ≤ 70 KB
// of the file, loaded by index.html before js/movel3d.js; and G.Movel3D.check(): every model of the vocabulary's parts, inside its
// rectangle and on its floor, ≤ 1,500 triangles (the hero pieces ≤ 3,000), its middle level ≤ 45 % of it (or ≤ 260 triangles),
// its anchors within it, every people with a model of every kind:
//   node qa/visual/malhas.js [PASTA_DO_JOGO]         → exit 1 if something fails (a FALHA line)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const js = f => path.join(ROOT, 'js', f);
const files = fs.readdirSync(path.join(ROOT, 'js')).filter(f => /^mesh-[\w-]+\.js$/.test(f)).sort();
const ctx = { console, atob: s => Buffer.from(s, 'base64').toString('binary'), Math, Float32Array, Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Uint8ClampedArray, ArrayBuffer, DataView };
ctx.window = ctx; ctx.self = ctx; ctx.G = {}; vm.createContext(ctx);
const fails = [], info = [];
try { vm.runInContext(fs.readFileSync(js('lib/three.min.js'), 'utf8'), ctx, { filename: 'three.min.js' }); } catch (e) { fails.push('three.min.js não carrega: ' + e.message); }
for (const f of ['mesh3d.js', ...files]) { try { vm.runInContext(fs.readFileSync(js(f), 'utf8'), ctx, { filename: f }); } catch (e) { fails.push(`${f} não carrega: ${e.message}`); } }
const M = ctx.G.Mesh3D; const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let total = 0;
for (const f of files) {
  const kb = fs.statSync(js(f)).size / 1024; total += kb;
  if (kb > 60) fails.push(`${f}: ${kb.toFixed(0)} KB (cada malha ≤ 60 KB)`);
  if (!html.includes(`src="js/${f}"`)) fails.push(`${f}: nenhum <script> do index.html o carrega`);
}
if (total > 1024) fails.push(`as malhas juntas têm ${(total / 1024).toFixed(2)} MB (≤ 1 MB)`);
if (M && typeof M.check === 'function') {
  for (const e of M.check()) fails.push('Mesh3D.check(): ' + e);
  for (const name of M.list()) { const i = M.info ? M.info(name) : null; const d = ctx.G.MESH3D[name]; info.push(`${name}: ${d ? d.t : '?'} triângulos, ${d ? d.n : '?'} pontos, partes ${M.parts(name).join(', ')}${i && i.box ? ` · caixa ${i.box.map(v => (+v).toFixed(2)).join(' ')}` : ''}`); }
} else fails.push('G.Mesh3D.check não existe');
console.log(`MALHAS — ${ROOT} · ${files.length} arquivos, ${total.toFixed(0)} KB (orçamento: 60 KB cada, 1 MB juntas)`);
for (const l of info) console.log('  ' + l);

// ------------------------------ the furniture's library (D-715) ------------------------------
const LIB = 'movelmesh.js', LIB_MB = 5, LIB_KB = 70;
{
  const before = new Set(Object.keys(ctx.G.MESH3D || {}));
  try { vm.runInContext(fs.readFileSync(js(LIB), 'utf8'), ctx, { filename: LIB }); vm.runInContext(fs.readFileSync(js('movel3d.js'), 'utf8'), ctx, { filename: 'movel3d.js' }); } catch (e) { fails.push(`${LIB} ou movel3d.js não carrega: ${e.message}`); }
  const src = fs.readFileSync(js(LIB), 'utf8'); const mb = src.length / 1048576;
  const names = Object.keys(ctx.G.MESH3D || {}).filter(n => !before.has(n));
  if (!/made in Blender by arte\/blender\/moveis\.py/.test(src.split('\n').slice(0, 4).join('\n'))) fails.push(`${LIB}: sem o cabeçalho de quem o gera (arte/blender/moveis.py)`);
  if (mb > LIB_MB) fails.push(`${LIB}: ${mb.toFixed(2)} MB (a biblioteca dos móveis ≤ ${LIB_MB} MB)`);
  const iL = html.indexOf(`src="js/${LIB}"`), iV = html.indexOf('src="js/movel3d.js"'), iM = html.indexOf('src="js/mesh3d.js"');
  if (iL < 0 || iV < 0 || !(iM < iL && iL < iV)) fails.push(`${LIB}: o index.html não o carrega entre o mesh3d.js e o movel3d.js`);
  let tris = 0, big = 0;
  for (const l of src.split('\n')) { const m = l.match(/^ {2}M\["([^"]+)"\] = /); if (!m) continue; const kb = l.length / 1024; if (kb > LIB_KB) { fails.push(`${m[1]}: ${kb.toFixed(0)} KB (cada modelo ≤ ${LIB_KB} KB)`); big++; } }
  for (const n of names) { if (!/^movel-[\w~-]+-\d+x\d+x\d+(@1)?$/.test(n)) fails.push(`${LIB}: o nome ${n} não é movel-<peça>-<povo>-<larg>x<fundo>x<alt>`); tris += (ctx.G.MESH3D[n].t || 0); }
  const V = ctx.G.Movel3D;
  if (V && typeof V.check === 'function') for (const e of V.check()) fails.push('Movel3D.check(): ' + e); else fails.push('G.Movel3D.check não existe');
  // (the Mesh3D proof over the library too: every model decodes to what its file says)
  if (M && typeof M.check === 'function') for (const e of M.check()) if (/^movel-/.test(e)) fails.push('Mesh3D.check(): ' + e);
  console.log(`MÓVEIS — ${LIB}: ${names.length} modelos (os dois níveis), ${tris} triângulos, ${mb.toFixed(2)} MB (orçamento: ${LIB_MB} MB, ${LIB_KB} KB cada) · ${V ? V.kinds().length : 0} tipos`);
}
// ------------------------------ the things the interiors show (D-743, D-745, D-748) ------------------------------
// js/decomesh.js, made by arte/blender/deco.py, read by js/dentro3d.js: a category of its own — the decoration, the dishes and the drinks
// ('deco-…', 'comida-…', 'bebida-…') —, its file in its budget (G.DECO.budget.arquivo), each model in its triangles (a thing, a big
// thing, a dish or a drink), its middle level ≤ 70 % of it (or ≤ 200), every model decoding to what its file says
{
  const before = new Set(Object.keys(ctx.G.MESH3D || {}));
  try { vm.runInContext(fs.readFileSync(js('decomesh.js'), 'utf8'), ctx, { filename: 'decomesh.js' }); } catch (e) { fails.push(`decomesh.js não carrega: ${e.message}`); }
  const names = Object.keys(ctx.G.MESH3D || {}).filter(n => !before.has(n)); const DE = ctx.G.DECO; const B = DE ? DE.budget : null; const mb = fs.statSync(js('decomesh.js')).size / 1048576;
  if (!B) fails.push('decomesh.js sem o G.DECO (o orçamento)');
  else {
    if (mb > B.arquivo) fails.push(`decomesh.js: ${mb.toFixed(2)} MB (orçamento ${B.arquivo} MB)`);
    for (const n of names) { if (/@1$/.test(n)) continue; const d = ctx.G.MESH3D[n], d1 = ctx.G.MESH3D[n + '@1']; const lim = /^(comida|bebida)-/.test(n) ? B.prato : DE.big.includes(d.kind) ? B.grande : B.coisa;
      if (d.t > lim) fails.push(`${n}: ${d.t} triângulos (orçamento ${lim})`); if (!d1) fails.push(`${n} sem o nível do meio`); else if (d1.t > Math.max(d.t * B.meio, B.meioMin)) fails.push(`${n}@1: ${d1.t} triângulos de ${d.t}`); }
  }
  if (M && typeof M.check === 'function') for (const e of M.check()) if (/^(deco|comida|bebida)-/.test(e)) fails.push('Mesh3D.check(): ' + e);
  if (!html.includes('src="js/decomesh.js"')) fails.push('decomesh.js: nenhum <script> do index.html o carrega');
  let tris = 0; for (const n of names) tris += ctx.G.MESH3D[n].t || 0;
  console.log(`DECORAÇÃO — decomesh.js: ${names.length} modelos (os dois níveis; ${names.filter(n => /^comida-/.test(n)).length} de pratos, ${names.filter(n => /^bebida-/.test(n)).length} de bebidas), ${tris} triângulos, ${mb.toFixed(2)} MB (orçamento: ${B ? B.arquivo : '?'} MB)`);
}
for (const f of fails) console.log('FALHA: ' + f);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
