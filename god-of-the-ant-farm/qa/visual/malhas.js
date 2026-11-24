// malhas: the meshes made outside (js/mesh-*.js, read by js/mesh3d.js) checked without a browser — G.Mesh3D.check() itself
// (the counts, the index inside the points, no NaN, unit normals, the box, the parts), and the art bible's budget (§6, §8):
// each file ≤ 60 KB, all ≤ 1 MB, the triangles of each, every one loaded by a <script> of index.html. And the two libraries of the
// interiors' models — the furniture (js/movelmesh.js, made by arte/blender/moveis.py, read by js/movel3d.js — the interiors 2.0, the
// front P2, D-715) and the decoration (js/decomesh.js, arte/blender/deco.py, js/dentro3d.js — P5, D-743) —, a category of their own,
// as the people's and the beasts' meshes are, each an index and its packs (the interiors 3, the front X: D-1020 to D-1022): the index
// in index.html (the furniture's before js/movel3d.js, the decoration's before js/dentro3d.js), no pack there; every pack of the
// index its file and every file of the library the index's; each file of the generator, in the 16-bit form, in its budget (the
// index, each pack, all — the budget the index says); every model in one file only, the pack of its kind's family (the base in the
// index); each model ≤ 70 KB of its file; and G.Movel3D.check(): every model of the vocabulary's parts, inside its rectangle and on
// its floor, ≤ 1,500 triangles (the hero pieces ≤ 3,000), its middle level ≤ 45 % of it (or ≤ 260 triangles), its anchors within it,
// every people with a model of every kind; each thing of the decoration in its triangles:
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

// ------------------------------ the libraries of the interiors' models: an index and its packs (D-715, D-743, D-1020 to D-1022) ------------------------------
// (a library read as the page and its loader read it: its index — in index.html, before its reader —, then its reader, then each pack
// its index names; what each file holds, its form, its budget, the family of each model)
function library(o) {
  const { lib, gen, reader, idx, name, kb } = o; const IDX = lib + '.js'; const out = { names: [], files: [] };
  const src = {}; const read = f => (src[f] = src[f] || fs.readFileSync(js(f), 'utf8'));
  const run = (f, label) => { try { vm.runInContext(read(f), ctx, { filename: f }); return true; } catch (e) { fails.push(`${label || f} não carrega: ${e.message}`); return false; } };
  const before = new Set(Object.keys(ctx.G.MESH3D || {})); const at = {}; const mark = f => { for (const n of Object.keys(ctx.G.MESH3D || {})) if (!before.has(n) && !(n in at)) at[n] = f; };
  run(IDX); mark(IDX); if (reader) run(reader);
  const P = idx(); if (!P || !P.packs || !P.of || !P.budget) { fails.push(`${IDX}: sem o índice dos pacotes (packs, of, budget: D-1020)`); return out; }
  const B = P.budget; const packs = Object.keys(P.packs).sort();
  // (every pack of the index its file; every file of the library the index's)
  for (const fam of packs) { const f = P.packs[fam].f.replace(/^js\//, ''); if (P.packs[fam].f !== `js/${lib}-${fam}.js`) fails.push(`${IDX}: o pacote ${fam} no arquivo ${P.packs[fam].f} (é o js/${lib}-${fam}.js)`); if (!fs.existsSync(js(f))) { fails.push(`${IDX}: o pacote ${fam} sem o seu arquivo js/${f}`); continue; } run(f); mark(f); out.files.push(f); }
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => new RegExp(`^${lib}-[\\w-]+\\.js$`).test(f))) if (!packs.includes(f.slice(lib.length + 1, -3))) fails.push(`js/${f}: um pacote que o índice ${IDX} não nomeia`);
  // (the index in index.html, before its reader; no pack there — a pack is the loader's to ask, never the page's start: rule 510)
  const iI = html.indexOf(`src="js/${IDX}"`), iR = html.indexOf(`src="js/${o.before}"`), iM = html.indexOf('src="js/mesh3d.js"');
  if (iI < 0 || iR < 0 || !(iM < iI && iI < iR)) fails.push(`${IDX}: o index.html não o carrega entre o mesh3d.js e o ${o.before}`);
  if (new RegExp(`src="js/${lib}-`).test(html)) fails.push(`${lib}: um pacote no index.html — carregaria no começo do jogo, sempre (D-1020)`);
  // (each file the generator's, in its budget; all of them in theirs)
  let tot = 0;
  for (const f of [IDX].concat(out.files)) { const s = read(f); const mb = Buffer.byteLength(s) / 1048576; tot += mb; const lim = f === IDX ? B.indice : B.arquivo;
    if (!new RegExp(`made in Blender by arte\\/blender\\/${gen}\\.py`).test(s.split('\n').slice(0, 4).join('\n'))) fails.push(`js/${f}: sem o cabeçalho de quem o gera (arte/blender/${gen}.py)`);
    if (!(mb <= lim)) fails.push(`js/${f}: ${mb.toFixed(2)} MiB (orçamento ${lim} MiB${f === IDX ? ', o índice' : ', cada pacote'})`);
    for (const l of s.split('\n')) { const m = l.match(/^ {2}M\["([^"]+)"\] = /); if (m && l.length / 1024 > kb) fails.push(`${m[1]}: ${(l.length / 1024).toFixed(0)} KB (cada modelo ≤ ${kb} KB)`); } }
  if (!(tot <= B.todos)) fails.push(`${lib}: ${tot.toFixed(2)} MiB juntos (orçamento ${B.todos} MiB)`);
  // (each model in one file, the pack of its kind's family — the base's in the index —, in the 16-bit form; the index's counts true)
  const names = out.names = Object.keys(at).filter(n => name.test(n.replace(/@1$/, '')) || /^(movel|deco|comida|bebida)-/.test(n));
  const seen = {}; for (const f of [IDX].concat(out.files)) for (const m of read(f).matchAll(/^ {2}M\["([^"]+)"\] = /gm)) { if (seen[m[1]]) fails.push(`${m[1]}: em dois arquivos (js/${seen[m[1]]} e js/${f})`); seen[m[1]] = f; }
  const per = {}; for (const n of names) { const d = ctx.G.MESH3D[n]; const fam = P.of[d.kind]; const f = at[n]; const want = fam === 'base' ? IDX : `${lib}-${fam}.js`; per[f] = (per[f] || 0) + 1;
    if (!name.test(n)) fails.push(`${IDX}: o nome ${n} não é como o ${gen}.py o escreve`);
    if (!fam) fails.push(`${n}: o tipo ${d.kind} sem a sua família no índice (of)`); else if (f !== want) fails.push(`${n}: no js/${f}, e a família do ${d.kind} é «${fam}» (js/${want})`);
    if (d.v !== 2 || !d.p16 || !d.n8) fails.push(`${n}: não está na forma de 16 bits (v 2, D-1021)`); }
  for (const k of Object.keys(P.of)) if (!names.some(n => ctx.G.MESH3D[n].kind === k)) fails.push(`${IDX}: o tipo ${k} no índice sem modelo nenhum`);
  for (const fam of packs) if (P.packs[fam].n !== (per[`${lib}-${fam}.js`] || 0)) fails.push(`${IDX}: o pacote ${fam} diz ${P.packs[fam].n} modelos e traz ${per[`${lib}-${fam}.js`] || 0}`);
  // (the Mesh3D proof over the library too: every model decodes to what its file says)
  if (M && typeof M.check === 'function') for (const e of M.check()) if (names.some(n => e.startsWith(n + ':'))) fails.push('Mesh3D.check(): ' + e);
  out.mb = tot; out.idxKb = Buffer.byteLength(read(IDX)) / 1024; out.per = per; out.P = P; out.B = B;
  out.sizes = [IDX].concat(out.files).map(f => `${f} ${(Buffer.byteLength(read(f)) / 1024).toFixed(0)} KB`);
  return out;
}
{
  const L = library({ lib: 'movelmesh', gen: 'moveis', reader: 'movel3d.js', before: 'movel3d.js', idx: () => ctx.G.MOVEIS, name: /^movel-[\w~-]+-\d+x\d+x\d+(@1)?$/, kb: 70 });
  const V = ctx.G.Movel3D;
  if (V && typeof V.check === 'function') for (const e of V.check()) fails.push('Movel3D.check(): ' + e); else fails.push('G.Movel3D.check não existe');
  let tris = 0; for (const n of L.names) tris += ctx.G.MESH3D[n].t || 0;
  console.log(`MÓVEIS — ${L.names.length} modelos (os dois níveis), ${tris} triângulos, ${(L.mb || 0).toFixed(2)} MiB em ${L.files.length + 1} arquivos: ${(L.sizes || []).join(', ')} (orçamento: o índice ${L.B && L.B.indice} MiB, cada pacote ${L.B && L.B.arquivo}, 70 KB cada modelo) · ${V ? V.kinds().length : 0} tipos`);
}
// ------------------------------ the things the interiors show (D-743, D-745, D-748) ------------------------------
// the decoration, the dishes and the drinks ('deco-…', 'comida-…', 'bebida-…'): each model in its triangles (a thing, a big thing, a dish
// or a drink), its middle level ≤ 70 % of it (or ≤ 200), every model decoding to what its file says
{
  const L = library({ lib: 'decomesh', gen: 'deco', reader: null, before: 'dentro3d.js', idx: () => ctx.G.DECO, name: /^(?:deco|comida|bebida)-[\w-]+(@1)?$/, kb: 70 });
  const DE = ctx.G.DECO; const B = DE ? DE.budget : null; const names = L.names || [];
  if (!B) fails.push('decomesh.js sem o G.DECO (o orçamento)');
  else for (const n of names) { if (/@1$/.test(n)) continue; const d = ctx.G.MESH3D[n], d1 = ctx.G.MESH3D[n + '@1']; const lim = /^(comida|bebida)-/.test(n) ? B.prato : DE.big.includes(d.kind) ? B.grande : B.coisa;
    if (d.t > lim) fails.push(`${n}: ${d.t} triângulos (orçamento ${lim})`); if (!d1) fails.push(`${n} sem o nível do meio`); else if (d1.t > Math.max(d.t * B.meio, B.meioMin)) fails.push(`${n}@1: ${d1.t} triângulos de ${d.t}`); }
  let tris = 0; for (const n of names) tris += ctx.G.MESH3D[n].t || 0;
  console.log(`DECORAÇÃO — ${names.length} modelos (os dois níveis; ${names.filter(n => /^comida-/.test(n)).length} de pratos, ${names.filter(n => /^bebida-/.test(n)).length} de bebidas), ${tris} triângulos, ${(L.mb || 0).toFixed(2)} MiB em ${(L.files || []).length + 1} arquivos: ${(L.sizes || []).join(', ')} (orçamento: o índice ${B ? B.indice : '?'} MiB, cada pacote ${B ? B.arquivo : '?'})`);
}
for (const f of fails) console.log('FALHA: ' + f);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
