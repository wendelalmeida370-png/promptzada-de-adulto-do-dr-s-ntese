// malhas: the meshes made outside (js/mesh-*.js, read by js/mesh3d.js) checked without a browser — G.Mesh3D.check() itself
// (the counts, the index inside the points, no NaN, unit normals, the box, the parts), and the art bible's budget (§6, §8):
// each file ≤ 60 KB, all ≤ 1 MB, the triangles of each, every one loaded by a <script> of index.html:
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
for (const f of fails) console.log('FALHA: ' + f);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
