// termas-fotos: as figuras das termas grandes para o relatório do dono (T-784, D-183) — em Node, sem navegador, pelo desenho por
// software das provas (visual/fidelidade-lib.js): à esquerda o deus pelo pintor gravado, à direita os triângulos do Build3D na
// câmera da descida; as vistas «do olho» são os mesmos triângulos em perspectiva, com o interior que o 3D desenha quando se está
// dentro (Build3D.interior) e a água das piscinas. Cor chapada, sem os padrões das pedras nem as sombras: servem para ver a
// forma, não o acabamento. Os bonecos cinzentos de 1,75 m são só a régua (não são gente do jogo). Não é prova: só desenha.
//   node qa/visual/termas-fotos.js <pasta de saída> [nome,nome…]
'use strict';
const path = require('path'), fs = require('fs'), zlib = require('zlib');
const F = require('./fidelidade-lib.js');
const { G } = F.load(); const Fo = G.Forma, B3 = G.Build3D, In = G.Interiors;
const OUT = path.resolve(process.argv[2] || '.'); const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const want = k => !ONLY || ONLY.includes(k);
const toS = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
const GLASS = [28, 38, 48], WATER = [74, 150, 190];
// (the triangles of a geometry the 3D built, their colours in sRGB)
function trisOf(geo, plain, ds) {
  const out = []; if (!geo || !geo.attributes || !geo.attributes.position) return out;
  const P = geo.attributes.position.array, C = geo.attributes.color ? geo.attributes.color.array : null, N = geo.attributes.normal ? geo.attributes.normal.array : null;
  for (let k = 0; k + 8 < P.length; k += 9) {
    const col = plain || (C ? [toS((C[k] + C[k + 3] + C[k + 6]) / 3), toS((C[k + 1] + C[k + 4] + C[k + 7]) / 3), toS((C[k + 2] + C[k + 5] + C[k + 8]) / 3)] : [200, 200, 200]);
    const n = N ? [(N[k] + N[k + 3] + N[k + 6]) / 3, (N[k + 1] + N[k + 4] + N[k + 7]) / 3, (N[k + 2] + N[k + 5] + N[k + 8]) / 3] : [0, 1, 0];
    out.push({ v: Array.from(P.slice(k, k + 9)), col, n, ds: !!ds });
  }
  return out;
}
// a building of a step on the blank world, its record as the world makes it at the founding (the door to the south)
function put(type, st, n) {
  F.blank(); const def = G.BDEF[type]; const x = 20, y = 20, id = 4242;
  const b = { id, type, style: st, x, y, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, wd: null, crops: null, blocks: !!def.blocks, ip: null };
  G.S.buildings.set(id, b); for (let yy = y; yy < y + n; yy++) for (let xx = x; xx < x + n; xx++) G.S.occ[yy * G.N + xx] = id;
  b.ip = In.newRecord(b, { t: type, c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << Math.min(n, 30)) - 1, n });
  return b;
}
// (the outside as its chunk draws it, with the water of its pools; the inside as the 3D draws it when one is in)
function outside(b) {
  const P3 = G.Props3D; G.Props3D = null; let r; try { r = B3.nearGeo(b.x, b.y, 1); } finally { G.Props3D = P3; }
  const tris = trisOf(r.solid).concat(trisOf(r.glass, GLASS), trisOf(r.plants, null, true), trisOf(r.water, WATER, true));
  for (const k of ['solid', 'glass', 'plants', 'water']) if (r[k] && r[k].dispose) r[k].dispose();
  return tris;
}
function inside(b, noRoof) {
  const plan = In.plan(b); const I3 = B3.interior(plan, b, { fine: true }); const out = [];
  const add = geo => { if (geo && !geo.empty) for (const t of trisOf(geo.build())) out.push(t); };
  for (const k in I3.lv) add(I3.lv[k]); if (!noRoof) add(I3.roof);
  return out;
}
// (a figure of 1.75 m for the eye's measure: a body and a head, grey — not the game's people)
function boneco(W3, u, v, y) {
  const out = []; const box = (c, hx, hy, hz, col) => { const [x, y0, z] = c; const P = (dx, dy, dz) => [x + dx * hx, y0 + dy * hy, z + dz * hz];
    const Q = (a, b2, c2, d, n) => { out.push({ v: [...a, ...b2, ...c2], col, n, ds: true }, { v: [...a, ...c2, ...d], col, n, ds: true }); };
    Q(P(-1, 0, 1), P(1, 0, 1), P(1, 2, 1), P(-1, 2, 1), [0, 0, 1]); Q(P(1, 0, -1), P(-1, 0, -1), P(-1, 2, -1), P(1, 2, -1), [0, 0, -1]);
    Q(P(1, 0, 1), P(1, 0, -1), P(1, 2, -1), P(1, 2, 1), [1, 0, 0]); Q(P(-1, 0, -1), P(-1, 0, 1), P(-1, 2, 1), P(-1, 2, -1), [-1, 0, 0]); Q(P(-1, 2, 1), P(1, 2, 1), P(1, 2, -1), P(-1, 2, -1), [0, 1, 0]); };
  const c = W3(u, v, y); box(c, 0.22, 0.74, 0.13, [120, 120, 126]); box([c[0], c[1] + 1.5, c[2]], 0.11, 0.125, 0.11, [150, 140, 134]);
  return out;
}
// ------------------------------ the pictures ------------------------------
function png(file, W, H, img) {
  const raw = Buffer.alloc((W * 3 + 1) * H); for (let j = 0; j < H; j++) { raw[j * (W * 3 + 1)] = 0; for (let i = 0; i < W * 3; i++) raw[j * (W * 3 + 1) + 1 + i] = Math.max(0, Math.min(255, Math.round(img[j * W * 3 + i]))); }
  const crcT = []; for (let k = 0; k < 256; k++) { let c = k; for (let q = 0; q < 8; q++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[k] = c >>> 0; }
  const crc = buf => { let c = 0xffffffff; for (const v of buf) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
  console.log('  ' + path.relative(process.cwd(), file));
}
// a perspective picture, the tool's own: the eye and what it looks at in the lot's frame (u across, v from the back — the
// street at v = L —, y over the lot's ground), the faces seen from their front only, as the game's material
function olho(file, b, tris, eye, at, fov, o) {
  o = o || {}; const W = o.W || 1200, H = o.H || 750; const n = b.w;
  const hi = G.W.maxH(b.x, b.y, b.w, b.h) * G.Space.HM, X0 = b.x * 4, Z0 = b.y * 4; const W3 = (u, v, y) => [X0 + u, hi + y, Z0 + v];
  const E = W3(eye[0], eye[1], eye[2]), T = W3(at[0], at[1], at[2]);
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const nrm = v => { const l = Math.hypot(...v) || 1; return v.map(q => q / l); };
  const fw = nrm(sub(T, E)); const rt = nrm(cross(fw, [0, 1, 0])); const up = cross(rt, fw); const f = (H / 2) / Math.tan(fov * Math.PI / 360);
  const img = new Float32Array(W * H * 3); const zb = new Float32Array(W * H).fill(1e9);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = (j * W + i) * 3; const t = j / H; img[q] = 150 + 60 * t; img[q + 1] = 190 + 40 * t; img[q + 2] = 235; }
  const LIGHT = nrm(o.luz || [-0.3, 0.8, 0.5]); const AMB = o.amb === undefined ? 0.62 : o.amb; const NEARZ = 0.15; const cam = p => { const d = sub(p, E); return [dot(d, rt), dot(d, up), dot(d, fw)]; };
  const all = tris.slice();
  { const yy = hi - 0.02, x0 = X0 - 200, z0 = Z0 - 200, x1 = X0 + n * 4 + 200, z1 = Z0 + n * 4 + 200, col = [112, 150, 84];
    all.push({ v: [x0, yy, z0, x0, yy, z1, x1, yy, z1], col, n: [0, 1, 0], ds: true }, { v: [x0, yy, z0, x1, yy, z1, x1, yy, z0], col, n: [0, 1, 0], ds: true }); }
  for (const q of o.bonecos || []) for (const t of boneco(W3, q[0], q[1], q[2])) all.push(t);
  const clipNear = poly => { const outp = []; for (let k = 0; k < poly.length; k++) { const A = poly[k], Bq = poly[(k + 1) % poly.length]; const ia = A[2] >= NEARZ, ib = Bq[2] >= NEARZ; if (ia) outp.push(A); if (ia !== ib) { const t = (NEARZ - A[2]) / (Bq[2] - A[2]); outp.push([A[0] + (Bq[0] - A[0]) * t, A[1] + (Bq[1] - A[1]) * t, NEARZ]); } } return outp; };
  for (const t of all) {
    const P = [cam([t.v[0], t.v[1], t.v[2]]), cam([t.v[3], t.v[4], t.v[5]]), cam([t.v[6], t.v[7], t.v[8]])];
    if (!t.ds) { const g = cross(sub(P[1], P[0]), sub(P[2], P[0])); if (dot(g, P[0]) <= 0) continue; }
    const poly = clipNear(P); if (poly.length < 3) continue;
    // (lit by the sun; a face turned from it in the shade — and, seen from both sides, by the side the eye sees)
    let l = dot(t.n, LIGHT); if (t.ds) l = Math.abs(l); const sh = AMB + (1 - AMB) * Math.max(0, l); const col = [t.col[0] * sh, t.col[1] * sh, t.col[2] * sh];
    const S = poly.map(p => [W / 2 + p[0] * f / p[2], H / 2 - p[1] * f / p[2], 1 / p[2]]);
    for (let k = 1; k + 1 < S.length; k++) { const A = S[0], Bq = S[k], C = S[k + 1];
      const den = (Bq[1] - C[1]) * (A[0] - C[0]) + (C[0] - Bq[0]) * (A[1] - C[1]); if (Math.abs(den) < 1e-9) continue;
      const i0 = Math.max(0, Math.floor(Math.min(A[0], Bq[0], C[0]))), i1 = Math.min(W - 1, Math.ceil(Math.max(A[0], Bq[0], C[0])));
      const j0 = Math.max(0, Math.floor(Math.min(A[1], Bq[1], C[1]))), j1 = Math.min(H - 1, Math.ceil(Math.max(A[1], Bq[1], C[1])));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const px = i + 0.5, py = j + 0.5;
        const l1 = ((Bq[1] - C[1]) * (px - C[0]) + (C[0] - Bq[0]) * (py - C[1])) / den, l2 = ((C[1] - A[1]) * (px - C[0]) + (A[0] - C[0]) * (py - C[1])) / den, l3 = 1 - l1 - l2;
        if (l1 < -1e-5 || l2 < -1e-5 || l3 < -1e-5) continue; const z = 1 / (l1 * A[2] + l2 * Bq[2] + l3 * C[2]); const q = j * W + i; if (z >= zb[q]) continue;
        zb[q] = z; const fog = Math.min(0.3, z / 500); img[q * 3] = col[0] * (1 - fog) + 190 * fog; img[q * 3 + 1] = col[1] * (1 - fog) + 205 * fog; img[q * 3 + 2] = col[2] * (1 - fog) + 225 * fog; } }
  }
  png(file, W, H, img);
}
// (the god's picture and the 3D's side by side, a row a building, all at one scale)
function folha(file, list, scale) {
  const rows = [], lots = [];
  for (const [type, st, n] of list) { const b = put(type, st, n); const god = F.god(b); const near = { tris: outside(b), fr: F.framer(b) }; const mk = F.gridFor(god, near); rows.push([F.paintGod(god, mk()), F.paint3D(near, mk())]); lots.push([n, n]); }
  F.png(file, rows, lots, scale || 1); console.log('  ' + path.relative(process.cwd(), file));
}
// (the plan from above: each room in its colour, the walls dark, the ways through light, the water blue, the pieces brown)
const ROOM = { vestiario: [222, 205, 170], frio: [168, 204, 222], morno: [236, 214, 150], quente: [232, 160, 120], fornalha: [176, 140, 110], servico: [196, 180, 160], suadouro: [226, 186, 150], portico: [214, 210, 200], palestra: [206, 222, 180] };
function planta(file, b, k) {
  const p = In.plan(b); const N = p.grid.n, g = p.grid.lv[0], cs = p.grid.cs; const W = N * k, H = N * k; const img = new Float32Array(W * H * 3).fill(238);
  const set = (x, z, c) => { for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const q = ((z * k + j) * W + x * k + i) * 3; img[q] = c[0]; img[q + 1] = c[1]; img[q + 2] = c[2]; } };
  const roomAt = (x, z) => p.rooms.find(m => x >= m.r[0] && x <= m.r[2] && z >= m.r[1] && z <= m.r[3]);
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { const c = g[z * N + x]; if (!c) continue; const m = roomAt((x + 0.5) * cs, (z + 0.5) * cs); const fl = (m && ROOM[m.fn]) || [220, 214, 204];
    set(x, z, c === 2 ? [86, 78, 70] : c === 6 ? [250, 248, 240] : c === 7 ? [200, 196, 188] : fl); }
  const rect = (r, c) => { const x0 = Math.round(r[0] / cs * k), x1 = Math.round(r[2] / cs * k), z0 = Math.round(r[1] / cs * k), z1 = Math.round(r[3] / cs * k); for (let j = z0; j < z1; j++) for (let i = x0; i < x1; i++) { if (i < 0 || j < 0 || i >= W || j >= H) continue; const q = (j * W + i) * 3; img[q] = c[0]; img[q + 1] = c[1]; img[q + 2] = c[2]; } };
  const COR = { piscina: [70, 150, 200], 'fornalha-banho': [200, 70, 40], cabide: [120, 84, 52], banco: [150, 112, 72], lenha: [110, 80, 50], solido: [150, 146, 138] };
  for (const it of p.items) { const c = COR[it.kind] || [130, 110, 90]; if (it.kind === 'piscina') { rect(it.r, [196, 190, 178]); rect([it.r[0] + 0.16, it.r[1] + 0.16, it.r[2] - 0.16, it.r[3] - 0.16], c); } else rect(it.r, c); }
  png(file, W, H, img);
}

// ------------------------------ the sheets ------------------------------
console.log('termas-fotos → ' + OUT);
const file = k => path.join(OUT, k + '.png');
for (const st of ['romano', 'grego']) if (want('antes-depois-' + st)) folha(file('antes-depois-' + st), [['banhos', st, 2], ['banhos', st, 5], ['banhos', st, 7]], 2);
if (want('classico-deus-3d')) folha(file('classico-deus-3d'), [['banhos', 'classico', 5], ['banhos', 'classico', 7]], 2);
for (const [st, n, nome] of [['romano', 5, 'termas-romano'], ['grego', 5, 'termas-grego'], ['romano', 7, 'grandes-termas-romano'], ['grego', 7, 'grandes-termas-grego']]) {
  const L = n * 4, c = L / 2; const R = In.riskOf(Fo.of('banhos', st, n)); let b = null, out = null; const get = () => { if (!b) { b = put('banhos', st, n); out = outside(b); } return out; };
  const gente = [[c - 1.2, R.Vp - 1.2, R.Hp], [c + 2.4, R.vP + 1.6, R.Hp], [c - 0.6, L + 2.5, 0]];
  if (want(nome + '-rua')) olho(file(nome + '-rua'), get() && b, out, [c - L * 0.42, L + L * 0.62, 1.7], [c + 0.5, c - 1, L * 0.2], 60, { bonecos: gente });
  if (want(nome + '-do-alto')) olho(file(nome + '-do-alto'), get() && b, out, [L + L * 0.45, L + L * 0.7, L * 0.75], [c, c + 1.5, 2], 50, { bonecos: gente });
  if (want(nome + '-planta')) { get(); planta(file(nome + '-planta'), b, n === 5 ? 7 : 6); }
  if (want(nome + '-palestra')) olho(file(nome + '-palestra'), get() && b, out, [c - L * 0.3, R.Vp - 0.6, R.Hp + 1.65], [c + L * 0.12, R.B[3], R.Hp + 2.6], 72, { bonecos: [[c + 1.5, R.vP - 1.0, R.Hp], [c + L * 0.22, R.vP + 2.0, R.Hp]] });
  // (indoors: the outside too — what is seen through the doors —, the inside as the 3D draws it there)
  const dentro = (k, eye, at, fov, o) => { if (!want(nome + '-' + k)) return; get(); olho(file(nome + '-' + k), b, out.concat(inside(b)), eye, at, fov, Object.assign({ amb: 0.78 }, o || {})); };
  const rm = fn => R.rooms.filter(m => m.fn === fn).map(m => m.r); const y = R.Hp + 1.65;
  if (n === 5) {
    const ve = rm('vestiario')[0], fr = rm('frio')[0], qu = rm('quente')[0], mo = rm('morno')[0];
    dentro('vestiario', [c + 2.6, ve[3] - 0.5, y], [c - 1.2, ve[1], R.Hp + 1.5], 78, { bonecos: [[c - 1.6, ve[1] + 0.7, R.Hp]] });
    dentro('frigidario', [fr[2] - 0.5, fr[3] - 0.5, y], [fr[0] + 1.2, fr[1] + 1.2, R.Hp + 0.6], 78, { bonecos: [[fr[0] + 0.7, fr[3] - 0.8, R.Hp]] });
    dentro('tepidario', [mo[2] - 0.5, mo[3] - 0.5, y], [mo[0] + 1.4, mo[1] + 1.4, R.Hp + 0.6], 78);
    dentro('caldario', [qu[0] + 0.6, qu[3] - 0.5, y], [qu[2] - 1.6, qu[1] + 1.2, R.Hp + 0.8], 80, { bonecos: [[qu[2] - 1.0, qu[3] - 1.2, R.Hp]] });
  } else {
    const ha = rm('frio')[0], qu = rm('quente')[0], mo = rm('morno')[0], ve = rm('vestiario')[0];
    dentro('grande-sala', [c, ha[3] - 0.6, y], [c, ha[1], R.Hp + 2.2], 82, { bonecos: [[c - 1.6, ha[1] + 4.6, R.Hp], [c + 4.4, ha[3] - 3.0, R.Hp]] });
    dentro('grande-sala-de-lado', [ha[0] + 0.6, ha[3] - 0.6, y], [ha[2] - 2.5, ha[1] + 1.5, R.Hp + 1.8], 82, { bonecos: [[c + 0.8, ha[1] + 4.4, R.Hp]] });
    dentro('caldario', [qu[0] + 0.6, qu[3] - 0.6, y], [qu[2] - 2.0, qu[1] + 1.5, R.Hp + 1.0], 84, { bonecos: [[c + 2.8, qu[3] - 0.9, R.Hp]] });
    dentro('tepidario', [mo[2] - 0.5, mo[3] - 0.5, y], [mo[0] + 1.4, mo[1] + 1.2, R.Hp + 0.6], 80);
    dentro('vestiario', [ve[2] - 0.5, ve[1] + 0.5, y], [ve[0] + 0.6, ve[3] - 0.8, R.Hp + 1.5], 80, { bonecos: [[ve[0] + 1.2, ve[3] - 1.2, R.Hp]] });
  }
}
const e = G.modErr && Object.keys(G.modErr).length ? JSON.stringify(G.modErr) : 'nenhum'; console.log('erros de módulo: ' + e);
