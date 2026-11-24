// pacotes: the libraries of the interiors' models — the furniture (js/movelmesh*.js, arte/blender/moveis.py) and the decoration
// (js/decomesh*.js, arte/blender/deco.py) — in the 16-bit form (the interiors 3, the front X — the F8 of planos/interiores-3.md;
// D-1020 to D-1029). In Node, no browser:
//   node qa/visual/pacotes.js [PASTA_DO_JOGO]     (BASE=commit: the libraries the 16 bits are set beside — by default 5c482ef, the
//                                                 last one of the floats; a commit of the 16 bits too: then every number the same)
//   p1. the 16 bits are the floats of before: every model of BASE's libraries decoded by the game's own reader (G.Mesh3D.geo) from
//       today's files — the same points (the count), the same triangles (the index, number for number), the same parts, the same
//       box (the numbers the file says); each point within a millimetre of before, each normal within a degree, each uv within a
//       millimetre; the same light it gives itself (the colours, byte for byte); the same kind, people, size, level, anchors, how it
//       rests and the broth's level; no model of before missing
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const BASE = process.env.BASE || '5c482ef';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | pacotes ${name} | ${info}`); if (!c) fails.push(name); };
const few = (a, n = 4) => (a.length ? ': ' + a.slice(0, n).join(' · ') + (a.length > n ? ` … (${a.length})` : '') : '');
const LIBS = ['movelmesh.js', 'decomesh.js'];

// ------------------------------ the libraries, read as the game reads them ------------------------------
// (a context of its own with three.js and the game's reader of the meshes — js/mesh3d.js —, the files run in it)
function context() {
  const ctx = { console, atob: s => Buffer.from(s, 'base64').toString('binary'), Math, Float32Array, Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Uint8ClampedArray, ArrayBuffer, DataView };
  ctx.window = ctx; ctx.self = ctx; ctx.G = {}; vm.createContext(ctx); return ctx;
}
const js = f => path.join(ROOT, 'js', f);
// (the files of a library: its index, and the packs it names — G.MOVEIS.packs, G.DECO.packs — when it has them)
function libFiles(read, f) {
  const out = [[f, read(f)]]; const c = context(); try { vm.runInContext(out[0][1], c, { filename: f }); } catch (e) { return out; }
  const P = f === 'movelmesh.js' ? c.G.MOVEIS : c.G.DECO;
  for (const k of Object.keys((P && P.packs) || {}).sort()) { const pf = P.packs[k].f.replace(/^js\//, ''); out.push([pf, read(pf)]); }
  return out;
}
// (base64 to a typed array, little-endian)
const arr = (b64, Kind) => { const b = Buffer.from(b64, 'base64'); const u = new Uint8Array(b.length); u.set(b); return new Kind(u.buffer, 0, u.length / Kind.BYTES_PER_ELEMENT); };
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };

// ------------------------------ p1: the 16 bits are the floats of before ------------------------------
{
  const show = f => cp.execFileSync('git', ['show', `${BASE}:god-of-the-ant-farm/js/${f}`], { cwd: ROOT, maxBuffer: 256 * 1048576, encoding: 'utf8' });
  let base = null; try { base = context(); for (const L of LIBS) for (const [f, s] of libFiles(show, L)) vm.runInContext(s, base, { filename: 'base:' + f }); } catch (e) { base = null; ok('p1 a base', false, `${BASE}: ${e.message.split('\n')[0]}`); }
  const now = context(); vm.runInContext(fs.readFileSync(js('lib/three.min.js'), 'utf8'), now, { filename: 'three.min.js' }); vm.runInContext(fs.readFileSync(js('mesh3d.js'), 'utf8'), now, { filename: 'mesh3d.js' });
  for (const L of LIBS) for (const [f, s] of libFiles(f => fs.readFileSync(js(f), 'utf8'), L)) vm.runInContext(s, now, { filename: f });
  if (base) {
    const B = base.G.MESH3D, N = now.G.MESH3D, M3 = now.G.Mesh3D; const bad = [], lost = []; let n = 0, v2 = 0; const worst = { pos: 0, nor: 0, uv: 0 }; const at = { pos: '', nor: '', uv: '' };
    const META = ['kind', 'civ', 'var', 'w', 'd', 'h', 'lod', 'anc', 'pousa', 'niv'];
    for (const name of Object.keys(B).filter(k => /^(movel|deco|comida|bebida)-/.test(k)).sort()) {
      const b = B[name], d = N[name]; if (!d) { lost.push(name); continue; } n++; if (d.v === 2) v2++;
      const fail = w => bad.push(`${name}: ${w}`);
      if (d.n !== b.n || d.t !== b.t) { fail(`${d.n} pontos e ${d.t} triângulos, antes ${b.n} e ${b.t}`); continue; }
      if (JSON.stringify(d.box) !== JSON.stringify(b.box)) fail(`a caixa ${JSON.stringify(d.box)}, antes ${JSON.stringify(b.box)}`);
      if (JSON.stringify(d.parts) !== JSON.stringify(b.parts)) fail('as partes não são as de antes');
      for (const k of META) if (JSON.stringify(d[k]) !== JSON.stringify(b[k])) fail(`o ${k} não é o de antes`);
      const g = M3.geo(name); if (!g) { fail('não decodifica'); continue; }
      // (before: the floats of the file, decoded as the reader of before did)
      const P0 = arr(b.pos, Float32Array), N0 = arr(b.nor, Int8Array), U0 = b.uv ? arr(b.uv, Float32Array) : null, C0 = b.col ? arr(b.col, Uint8Array) : null, I0 = arr(b.idx, b.i32 ? Uint32Array : Uint16Array);
      const P = g.attributes.position.array, Nn = g.attributes.normal.array, U = g.attributes.uv ? g.attributes.uv.array : null, C = g.attributes.color ? g.attributes.color.array : null, I = g.index.array;
      let dp = 0, dn = 0, du = 0, di = 0, dc = 0;
      for (let i = 0; i < P0.length; i++) dp = Math.max(dp, Math.abs(P[i] - P0[i]));
      for (let i = 0; i < N0.length; i += 3) { const l = Math.hypot(N0[i], N0[i + 1], N0[i + 2]) || 1; const c = (N0[i] * Nn[i] + N0[i + 1] * Nn[i + 1] + N0[i + 2] * Nn[i + 2]) / l; dn = Math.max(dn, Math.acos(Math.max(-1, Math.min(1, c))) * 180 / Math.PI); }
      if (!!U0 !== !!U) fail('o uv: um tem, o outro não'); else if (U0) for (let i = 0; i < U0.length; i++) du = Math.max(du, Math.abs(U[i] - U0[i]));
      if (!!C0 !== !!C) fail('a luz própria: um tem, o outro não'); else if (C0) for (let i = 0; i < C0.length; i++) if (C[i] !== Math.fround(lin(C0[i]))) dc++; // (the reader keeps it in 32 bits)
      if (I.length !== I0.length) di = 1; else for (let i = 0; i < I0.length; i++) if (I[i] !== I0[i]) { di++; break; }
      if (di) fail('os triângulos não são os de antes (o índice)'); if (dc) fail(`${dc} cores que não são as de antes`);
      if (dp > 0.001) fail(`um ponto a ${(dp * 1000).toFixed(3)} mm do de antes`); if (dn > 1) fail(`uma normal a ${dn.toFixed(3)}° da de antes`); if (du > 0.001) fail(`um uv a ${(du * 1000).toFixed(3)} mm do de antes`);
      for (const [k, v] of [['pos', dp], ['nor', dn], ['uv', du]]) if (v > worst[k]) { worst[k] = v; at[k] = name; }
    }
    ok(`p1 os 16 bits são os números de antes (${BASE}): os mesmos pontos, triângulos, partes, caixa, cor e dados; cada ponto a menos de 1 mm, cada normal a menos de 1°, cada uv a menos de 1 mm`,
      n > 300 && !bad.length && !lost.length, `${n} modelos comparados (${v2} na forma de 16 bits); o mais longe: ponto ${(worst.pos * 1000).toFixed(3)} mm (${at.pos}), normal ${worst.nor.toFixed(3)}° (${at.nor}), uv ${(worst.uv * 1000).toFixed(3)} mm (${at.uv})${few(bad)}${lost.length ? '; faltam ' + lost.length + few(lost) : ''}`);
  }
}

for (const f of fails) console.log('FALHA: ' + f);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
