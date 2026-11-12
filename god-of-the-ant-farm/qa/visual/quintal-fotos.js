// quintal-fotos: figures of what lies about the buildings of a ready world (D-186), in Node, by a software picture as the
// proofs make them (qa/visual/fidelidade-lib.js: the 3D's own geometry, its triangles painted flat) — no browser, no textures:
//   node qa/visual/quintal-fotos.js <saida.png> <mundo> <prédio: id | tipo[:n] | lenhador[:n] | bebida[:n] | pescador[:n]> [vista] [W H]
//   vista: frente (before its door, default) | lado (from its left) | canto (from a front corner) | rua (along its street)
//          | cima (from over it) | olho:dx,dz,dy,tx,tz,ty,fov (metres from its lot's middle; y over its floor)
//          | coisa[:k[:dist[:viés[:fov[:alvo]]]]] (before the k-th thing about it, from the street: dist metres out, viés
//            along; alvo: the point looked at, metres along from the thing)
//   SEM=1 the picture without what lies about the buildings (Props3D put aside): the «antes»
//   PAR=1 the two side by side in one picture: without (left) and with (right) what lies about the buildings
//   CORPO=dx,dz a body of 1.75 m standing there (a dark figure), for the scale
// Only reads the game: the world is the ready one, nothing is lived nor written.
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const T = require('./tres-node.js');
const { G, M } = T.load({ qa: false });
const out = process.argv[2], world = process.argv[3] || 'metropole', pick = process.argv[4] || 'house', view = process.argv[5] || 'frente';
const W = +(process.argv[6] || 960), H = +(process.argv[7] || 600);
M.pronto(world); G.Realm.setQuality('alta'); // (all of the decoration: the preset's share whole)
const S = G.S, B3 = G.Build3D, At = G.Atmos, L = G.Space.TILE, HM = G.Space.HM, N = G.N;
const built = [...S.buildings.values()].filter(b => b.built && b.type !== 'ruin').sort((a, b) => a.id - b.id);
const res = b => [...S.villagers.values()].filter(v => v.home === b.id);
// which building: an id, the n-th of a type, the n-th house of a trade, the n-th house with drink
const [what, nth] = pick.split(':'); const k = +(nth || 0);
let b = null;
if (/^\d+$/.test(what)) b = S.buildings.get(+what);
else if (what === 'bebida') b = built.filter(q => At.about(q).cask > 0)[k];
else if (G.BDEF[what]) b = built.filter(q => q.type === what)[k];
else b = built.filter(q => G.BDEF[q.type].housing && At.about(q).roles.includes(what))[k];
if (!b) { console.log('nenhum prédio para ' + pick); process.exit(2); }
// (VINHO=n: n kinds of drink given to it by the picture's hand — the cask by the door, where no house of the world has one now)
if (process.env.VINHO) { const I = b.inv || (b.inv = {}); ['vinho', 'azeite', 'mel'].slice(0, +process.env.VINHO).forEach(q => { I[q] = 2; }); At.flush(); }
const side = B3.doorSide(b); const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[side];
const cx = (b.x + b.w / 2) * L, cz = (b.y + b.h / 2) * L, y0 = G.Space.plinth(b).y0, half = b.w * L / 2;
const r = [-o[1], o[0]]; // (to the door's left hand, seen from the street)
let eye, at, fov = 55;
if (view === 'lado') { eye = [cx + r[0] * (half + 5.5) + o[0] * 2.5, y0 + 1.7, cz + r[1] * (half + 5.5) + o[1] * 2.5]; at = [cx + r[0] * half, y0 + 1.0, cz + r[1] * half]; }
else if (view === 'canto') { eye = [cx + o[0] * (half + 4.5) + r[0] * (half + 3.5), y0 + 1.8, cz + o[1] * (half + 4.5) + r[1] * (half + 3.5)]; at = [cx + o[0] * half * 0.6, y0 + 1.0, cz + o[1] * half * 0.6]; }
else if (view === 'rua') { eye = [cx + o[0] * (half + 2.2) + r[0] * (half + 9), y0 + 1.5, cz + o[1] * (half + 2.2) + r[1] * (half + 9)]; at = [cx + o[0] * (half + 0.6) - r[0] * 6, y0 + 1.2, cz + o[1] * (half + 0.6) - r[1] * 6]; fov = 60; }
else if (view === 'cima') { eye = [cx + o[0] * 0.01, y0 + half * 5 + 6, cz + o[1] * 0.01 + 0.02]; at = [cx, y0, cz]; fov = 45; }
else if (/^olho:/.test(view)) { const a = view.slice(5).split(',').map(Number); eye = [cx + a[0], y0 + a[2], cz + a[1]]; at = [cx + a[3], y0 + a[5], cz + a[4]]; if (a[6]) fov = a[6]; }
else if (/^coisa/.test(view)) { const a = view.split(':'); const pcs = G.Props3D.pieces(b); const p = pcs[+(a[1] || 0)]; if (!p) { console.log('sem coisas em volta de ' + b.type + '#' + b.id); process.exit(3); }
  const so = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[p.side || side]; const sr = [-so[1], so[0]]; const px = b.x * L + (p.x0 + p.x1) / 2, pz = b.y * L + (p.z0 + p.z1) / 2; const d = +(a[2] || 4.2), v = +(a[3] || 1.4);
  // (the eye on open ground: nearer, until its tile is no building's)
  const free = q => { const tx = Math.floor(q[0] / L), ty = Math.floor(q[2] / L); return tx >= 0 && ty >= 0 && tx < N && ty < N && !S.occ[ty * N + tx]; };
  let dd = d; for (;;) { eye = [px + so[0] * dd + sr[0] * v, y0 + 1.25, pz + so[1] * dd + sr[1] * v]; if (free(eye) || dd <= 2.5) break; dd -= 0.5; }
  at = [px + sr[0] * (+(a[5] || 0)), y0 + 0.75, pz + sr[1] * (+(a[5] || 0))]; fov = +(a[4] || 50); }
else { eye = [cx + o[0] * (half + 6.5) + r[0] * 1.2, y0 + 1.6, cz + o[1] * (half + 6.5) + r[1] * 1.2]; at = [cx, y0 + 1.1, cz]; }
// (the eye never under the ground it stands over: a body's height above it at the least, but from above)
if (view !== 'cima') { const gy = G.Space.drawnAt(Math.min(N - 0.001, Math.max(0, eye[0] / L)), Math.min(N - 0.001, Math.max(0, eye[2] / L))); if (eye[1] < gy + 1.5) eye[1] = gy + 1.5; }
// ------------------------------ the triangles: the ground, the buildings round it ------------------------------
const toSrgb = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
function trisOf(geo, plain, ds) {
  const outp = []; if (!geo) return outp;
  const P = geo.attributes.position.array, C = geo.attributes.color ? geo.attributes.color.array : null, Nn = geo.attributes.normal ? geo.attributes.normal.array : null;
  for (let q = 0; q + 8 < P.length; q += 9) {
    const col = plain ? plain : C ? [toSrgb((C[q] + C[q + 3] + C[q + 6]) / 3), toSrgb((C[q + 1] + C[q + 4] + C[q + 7]) / 3), toSrgb((C[q + 2] + C[q + 5] + C[q + 8]) / 3)] : [200, 200, 200];
    const n = Nn ? [(Nn[q] + Nn[q + 3] + Nn[q + 6]) / 3, (Nn[q + 1] + Nn[q + 4] + Nn[q + 7]) / 3, (Nn[q + 2] + Nn[q + 5] + Nn[q + 8]) / 3] : [0, 1, 0];
    outp.push({ v: [P[q], P[q + 1], P[q + 2], P[q + 3], P[q + 4], P[q + 5], P[q + 6], P[q + 7], P[q + 8]], col, n, ds: !!ds });
  }
  return outp;
}
const R = 9; // (tiles round it)
const P3 = G.Props3D; let near = 0;
function sceneOf(sem) {
const all = []; if (sem) G.Props3D = null; near = 0;
for (const q of built) {
  if (Math.abs(q.x + q.w / 2 - (b.x + b.w / 2)) > R + 3 || Math.abs(q.y + q.h / 2 - (b.y + b.h / 2)) > R + 3) continue;
  if (G.Space.planNow) G.Space.planNow(q); // (its plan made, as when the body is near: the shell the same, the yard's pieces with it)
  const g = B3.nearGeo(q.x, q.y, 1); near++;
  for (const t of trisOf(g.solid)) all.push(t); for (const t of trisOf(g.glass, [28, 38, 48])) all.push(t); for (const t of trisOf(g.plants, null, true)) all.push(t);
  for (const kk of ['solid', 'glass', 'plants', 'water']) if (g[kk]) g[kk].dispose();
}
G.Props3D = P3;
// (the ground as its mesh draws it: a point every half tile, each cell cut from its +x corner to its +y corner; the tile's colour)
const gcol = (x, y) => { const tx = Math.min(N - 1, Math.floor(x)), ty = Math.min(N - 1, Math.floor(y)); const i = ty * N + tx; if (S.road[i]) return [150, 132, 104]; const c = G.Ground3D && G.Ground3D.tileCol ? G.Ground3D.tileCol(i, tx, ty) : [118, 150, 84]; return [c[0], c[1], c[2]]; };
const hAt = (x, y) => G.Space.drawnAt(Math.min(N - 0.001, x), Math.min(N - 0.001, y));
for (let ty = Math.max(0, b.y - R - 3); ty < Math.min(N, b.y + b.h + R + 3); ty += 0.5) for (let tx = Math.max(0, b.x - R - 3); tx < Math.min(N, b.x + b.w + R + 3); tx += 0.5) {
  const a = [tx * L, hAt(tx, ty), ty * L], bb = [(tx + 0.5) * L, hAt(tx + 0.5, ty), ty * L], c = [tx * L, hAt(tx, ty + 0.5), (ty + 0.5) * L], d = [(tx + 0.5) * L, hAt(tx + 0.5, ty + 0.5), (ty + 0.5) * L]; const col = gcol(tx + 0.25, ty + 0.25);
  all.push({ v: [...a, ...c, ...bb], col, n: [0, 1, 0], ds: true }, { v: [...bb, ...c, ...d], col, n: [0, 1, 0], ds: true });
}
// (a body for the scale: a box of 0.5 × 1.75 × 0.3)
if (process.env.CORPO) { const [dx, dz] = process.env.CORPO.split(',').map(Number); const X = cx + dx, Z = cz + dz, Y = hAt(X / L, Z / L); const box = (x0, y0b, z0, x1, y1, z1, col) => { const q = (a, b2, c, d2, n) => all.push({ v: [...a, ...b2, ...c], col, n, ds: true }, { v: [...a, ...c, ...d2], col, n, ds: true });
  q([x0, y0b, z0], [x1, y0b, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]); q([x0, y0b, z1], [x1, y0b, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]); q([x0, y0b, z0], [x0, y0b, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]); q([x1, y0b, z0], [x1, y0b, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0]); q([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]); };
  box(X - 0.22, Y, Z - 0.14, X + 0.22, Y + 1.45, Z + 0.14, [70, 60, 90]); box(X - 0.12, Y + 1.45, Z - 0.12, X + 0.12, Y + 1.75, Z + 0.12, [200, 160, 130]); }
return all; }
// ------------------------------ the picture ------------------------------
const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const nrm = v => { const l = Math.hypot(...v) || 1; return v.map(q => q / l); };
const fw = nrm(sub(at, eye)); const rt = nrm(cross(fw, [0, 1, 0])); const up = cross(rt, fw); const f = (H / 2) / Math.tan(fov * Math.PI / 360);
const SS = 2, W2 = W * SS, H2 = H * SS, f2 = f * SS; // (drawn at twice the size and averaged down: the thin things keep their edges)
function paint(all) {
const img = new Float32Array(W2 * H2 * 3); const zb = new Float32Array(W2 * H2).fill(1e9);
for (let j = 0; j < H2; j++) for (let i = 0; i < W2; i++) { const q = (j * W2 + i) * 3; const t = j / H2; img[q] = 150 + 60 * t; img[q + 1] = 190 + 40 * t; img[q + 2] = 235; }
const LIGHT = nrm([-0.35, 0.8, 0.45]); const NEARZ = 0.15;
const cam = p => { const d = sub(p, eye); return [dot(d, rt), dot(d, up), dot(d, fw)]; };
const clipNear = poly => { const o2 = []; for (let q = 0; q < poly.length; q++) { const A = poly[q], Bq = poly[(q + 1) % poly.length]; const ia = A[2] >= NEARZ, ib = Bq[2] >= NEARZ; if (ia) o2.push(A); if (ia !== ib) { const t = (NEARZ - A[2]) / (Bq[2] - A[2]); o2.push([A[0] + (Bq[0] - A[0]) * t, A[1] + (Bq[1] - A[1]) * t, NEARZ]); } } return o2; };
for (const t of all) {
  const P = [cam([t.v[0], t.v[1], t.v[2]]), cam([t.v[3], t.v[4], t.v[5]]), cam([t.v[6], t.v[7], t.v[8]])];
  if (!t.ds) { const g = cross(sub(P[1], P[0]), sub(P[2], P[0])); if (dot(g, P[0]) <= 0) continue; }
  const poly = clipNear(P); if (poly.length < 3) continue;
  const sh = 0.6 + 0.4 * Math.max(0, dot(t.n, LIGHT)); const col = [t.col[0] * sh, t.col[1] * sh, t.col[2] * sh];
  const Sp = poly.map(p => [W2 / 2 + p[0] * f2 / p[2], H2 / 2 - p[1] * f2 / p[2], 1 / p[2]]);
  for (let q = 1; q + 1 < Sp.length; q++) { const A = Sp[0], Bq = Sp[q], C = Sp[q + 1];
    const den = (Bq[1] - C[1]) * (A[0] - C[0]) + (C[0] - Bq[0]) * (A[1] - C[1]); if (Math.abs(den) < 1e-9) continue;
    const i0 = Math.max(0, Math.floor(Math.min(A[0], Bq[0], C[0]))), i1 = Math.min(W2 - 1, Math.ceil(Math.max(A[0], Bq[0], C[0])));
    const j0 = Math.max(0, Math.floor(Math.min(A[1], Bq[1], C[1]))), j1 = Math.min(H2 - 1, Math.ceil(Math.max(A[1], Bq[1], C[1])));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const px = i + 0.5, py = j + 0.5;
      const l1 = ((Bq[1] - C[1]) * (px - C[0]) + (C[0] - Bq[0]) * (py - C[1])) / den, l2 = ((C[1] - A[1]) * (px - C[0]) + (A[0] - C[0]) * (py - C[1])) / den, l3 = 1 - l1 - l2;
      if (l1 < -1e-5 || l2 < -1e-5 || l3 < -1e-5) continue; const iz = l1 * A[2] + l2 * Bq[2] + l3 * C[2]; const z = 1 / iz; const p = j * W2 + i; if (z >= zb[p]) continue;
      zb[p] = z; const fog = Math.min(0.3, z / 300); img[p * 3] = col[0] * (1 - fog) + 190 * fog; img[p * 3 + 1] = col[1] * (1 - fog) + 205 * fog; img[p * 3 + 2] = col[2] * (1 - fog) + 225 * fog; } }
}
const px = Buffer.alloc(W * H * 3);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) for (let c = 0; c < 3; c++) { let s = 0; for (let dj = 0; dj < SS; dj++) for (let di = 0; di < SS; di++) s += img[((j * SS + dj) * W2 + i * SS + di) * 3 + c]; px[(j * W + i) * 3 + c] = Math.max(0, Math.min(255, Math.round(s / (SS * SS)))); }
return px; }
// (one picture, or the two side by side with a white line between them)
const pics = process.env.PAR ? [paint(sceneOf(true)), paint(sceneOf(false))] : [paint(sceneOf(!!process.env.SEM))]; const tris = near;
const GAP = 8, WT = W * pics.length + GAP * (pics.length - 1);
const raw = Buffer.alloc((WT * 3 + 1) * H, 255);
for (let j = 0; j < H; j++) { raw[j * (WT * 3 + 1)] = 0; pics.forEach((px, k) => { px.copy(raw, j * (WT * 3 + 1) + 1 + k * (W + GAP) * 3, j * W * 3, (j + 1) * W * 3); }); }
const crcT = []; for (let q = 0; q < 256; q++) { let c = q; for (let e = 0; e < 8; e++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[q] = c >>> 0; }
const crc = buf => { let c = 0xffffffff; for (const v of buf) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(WT, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
const A = At.about(b); const pcs = process.env.SEM ? [] : P3.pieces(b);
console.log(`${out}: ${b.type}#${b.id} (${B3.styleOf ? B3.styleOf(b) : ''}, porta ${side}) · ${res(b).length} moradores, ofícios ${A.roles.join(',') || '—'}, lenha ${A.wood}, bebida ${A.cask}, potes ${A.pots}, barris ${A.casks} · ${pcs.length} coisas: ${pcs.map(p => (p.thing || '?') + (p.thin ? '(fina)' : '')).join(', ') || '—'} · ${tris} prédios em volta · ${M.limpo() ? 'sem erros' : 'ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
