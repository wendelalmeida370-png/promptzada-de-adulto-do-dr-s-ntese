// fidelidade-lib: as duas vistas de um prédio lado a lado, por números (a biblioteca do qa/visual/fidelidade.js).
// O desenho do deus gravado enquanto ele pinta (o contexto 2D trocado por um que anota cada polígono e a sua cor), o 3D do
// Modo Encarnado projetado pela câmera da descida (D-016: a cena achatada em 0,62, vista a 30° com 5,657 px por metro — o
// mesmo P(dx, dy, z) do deus, com z = Y × 3,04), as duas figuras pintadas na mesma grade e medidas do mesmo jeito: a
// silhueta, a altura do alto, a largura por faixa, a linha do chão, as aberturas (as manchas escuras das faces) e a figura
// de longe. Só lê o jogo: nada aqui escreve no mundo (o mundo é o de mentira que a prova monta à mão).
//   const F = require('./fidelidade-lib.js'); const { G } = F.load();   F.blank(); const b = F.put('maravilha', 'romano', 7);
//   const god = F.god(b), near = F.near(b), far = F.far(b);   F.compare(god, near)
'use strict';
const path = require('path');
const F = module.exports = {};
const ZPX = F.ZPX = 3.04; // (one metre of height is 3.04 px of the god's picture: the descent's 5.657 px/m × cos 30° × 0.62)
const RES = F.RES = 3; // (cells of the grid per pixel of the god's picture: the game paints its sprites at 3×, Art's SPR)
let G = null, THREE = null;

// ------------------------------ the game, code only ------------------------------
F.load = function (o) {
  const T = require(path.join(__dirname, 'tres-node.js'));
  const r = T.load(Object.assign({ qa: false }, o || {})); G = r.G; THREE = r.THREE; F.G = G; return r;
};
// a world of nothing but flat grass, made by hand (no generation, no life): the buildings the proof puts are all there is
F.blank = function (h) {
  const S = G.newState(7); S.N = G.N; S.H.fill(h === undefined ? 4 : h); S.type.fill(G.T.GRASS); S.biome.fill(0);
  S.clock = 0; S.day = 30; S.time = 0.3; G.S = S;
  G.newWorld(); // (every module starts over, as a new world does)
  return S;
};
// a building of a type and a people, built, on the lot (x, y) of the blank world — its record made by hand, as the world
// makes it at the founding (the door to the south: the god's picture's door face), its id the dice of its looks
F.put = function (type, style, id, o) {
  o = o || {}; const S = G.S, In = G.Interiors, def = G.BDEF[type];
  const x = o.x === undefined ? 20 : o.x, y = o.y === undefined ? 20 : o.y;
  const b = { id, type, style, x, y, w: def.w, h: def.h, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: o.v === undefined ? id % 3 : o.v, set: 0, wd: o.wd || null, crops: null, graves: def.graves ? [] : undefined, blocks: !!def.blocks, ip: null };
  if (type === 'cemetery') b.graves = [];
  S.buildings.set(id, b);
  if (def.blocks) for (let yy = y; yy < y + b.h; yy++) for (let xx = x; xx < x + b.w; xx++) S.occ[yy * G.N + xx] = id;
  if (In && In.TYPES[type] && o.record !== false) {
    const ctx = Object.assign({ t: type, c: style, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << b.w) - 1 }, o.ctx || {});
    b.ip = In.newRecord(b, ctx);
  }
  return b;
};
F.drop = function (b) { const S = G.S; S.buildings.delete(b.id); for (let i = 0; i < S.occ.length; i++) if (S.occ[i] === b.id) S.occ[i] = 0; };

// ------------------------------ colours ------------------------------
const hexOf = s => { s = s.trim(); if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]; const n = parseInt(s.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]; };
function parseCol(c) {
  if (!c) return null;
  if (typeof c === 'object' && c.stops) { // (a gradient: the mean of its stops — the picture's colour, near enough)
    if (!c.stops.length) return null; const s = [0, 0, 0, 0]; for (const q of c.stops) { const k = parseCol(q); if (!k) continue; for (let i = 0; i < 4; i++) s[i] += k[i]; }
    return s.map(v => v / c.stops.length);
  }
  if (typeof c !== 'string') return null; const t = c.trim().toLowerCase();
  if (t[0] === '#') return hexOf(t);
  let m = t.match(/^rgba?\(([^)]*)\)/); if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  m = t.match(/^hsla?\(([^)]*)\)/); if (m) { const p = m[1].split(',').map(s => parseFloat(s)); const h = p[0] / 360, s = p[1] / 100, l = p[2] / 100;
    const f = n => { const k = (n + h * 12) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return [f(0) * 255, f(8) * 255, f(4) * 255, p.length > 3 ? p[3] : 1]; }
  if (t === 'transparent') return [0, 0, 0, 0]; if (t === 'white') return [255, 255, 255, 1]; if (t === 'black') return [0, 0, 0, 1];
  return null;
}
F.parseCol = parseCol;
const lum = c => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
const toSrgb = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;

// ------------------------------ the god's picture, recorded ------------------------------
// a 2D context that paints nothing and writes down what would be painted: each fill as its polygons (the curves cut in
// short lines, the transform applied) and its colour with the alpha; each stroke as its segments, its width and colour
function recorder() {
  const ops = []; let path = [], cur = null, start = null; let M = [1, 0, 0, 1, 0, 0]; const stack = [];
  const st = { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1 };
  const tp = (x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
  const scaleOf = () => Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2])) || 1;
  const pt = (x, y) => { const p = tp(x, y); if (!cur) { cur = [p]; path.push(cur); start = p; } else cur.push(p); };
  const arcPts = (cx, cy, rx, ry, rot, a0, a1, ccw) => {
    let sw = a1 - a0; const full = Math.PI * 2;
    if (!ccw) { if (sw >= full) sw = full; else { while (sw < 0) sw += full; } } else { if (-sw >= full) sw = -full; else { while (sw > 0) sw -= full; } }
    const n = Math.max(4, Math.ceil(Math.abs(sw) / (Math.PI / 24))); const cr = Math.cos(rot), sr = Math.sin(rot);
    for (let k = 0; k <= n; k++) { const a = a0 + sw * k / n; const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry; pt(cx + ex * cr - ey * sr, cy + ex * sr + ey * cr); }
  };
  let last = [0, 0]; // (the last point in the sprite's own frame: the curves start from it)
  const c = {
    canvas: { width: 0, height: 0 },
    get fillStyle() { return st.fillStyle; }, set fillStyle(v) { st.fillStyle = v; },
    get strokeStyle() { return st.strokeStyle; }, set strokeStyle(v) { st.strokeStyle = v; },
    get lineWidth() { return st.lineWidth; }, set lineWidth(v) { st.lineWidth = v; },
    get globalAlpha() { return st.globalAlpha; }, set globalAlpha(v) { st.globalAlpha = v; },
    lineJoin: 'round', lineCap: 'round', font: '', textAlign: 'left', imageSmoothingEnabled: true, imageSmoothingQuality: 'high', globalCompositeOperation: 'source-over',
    save() { stack.push([M.slice(), Object.assign({}, st)]); },
    restore() { const s = stack.pop(); if (s) { M = s[0]; Object.assign(st, s[1]); } },
    translate(x, y) { M = [M[0], M[1], M[2], M[3], M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]; },
    scale(a, d) { M = [M[0] * a, M[1] * a, M[2] * d, M[3] * d, M[4], M[5]]; },
    rotate(r) { const cs = Math.cos(r), sn = Math.sin(r); M = [M[0] * cs + M[2] * sn, M[1] * cs + M[3] * sn, -M[0] * sn + M[2] * cs, -M[1] * sn + M[3] * cs, M[4], M[5]]; },
    setTransform(a, b, cc, d, e, f) { M = [a, b, cc, d, e, f]; }, resetTransform() { M = [1, 0, 0, 1, 0, 0]; },
    beginPath() { path = []; cur = null; },
    moveTo(x, y) { const p = tp(x, y); cur = [p]; path.push(cur); start = p; last = [x, y]; },
    lineTo(x, y) { pt(x, y); last = [x, y]; },
    closePath() { if (cur && cur.length) { cur.closed = true; const s = cur[0]; cur = [s]; path.push(cur); } },
    rect(x, y, w, h) { c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); },
    arc(x, y, r, a0, a1, ccw) { arcPts(x, y, r, r, 0, a0, a1, ccw); last = [x + Math.cos(a1) * r, y + Math.sin(a1) * r]; },
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) { arcPts(x, y, rx, ry, rot, a0, a1, ccw); const ex = Math.cos(a1) * rx, ey = Math.sin(a1) * ry; last = [x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)]; },
    arcTo(x1, y1, x2, y2) { pt(x1, y1); last = [x1, y1]; void x2; void y2; },
    quadraticCurveTo(cx, cy, x, y) { const [x0, y0] = last; for (let k = 1; k <= 10; k++) { const t = k / 10, u = 1 - t; pt(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y); } last = [x, y]; },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { const [x0, y0] = last; for (let k = 1; k <= 14; k++) { const t = k / 14, u = 1 - t; pt(u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x, u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y); } last = [x, y]; },
    fill() { const col = parseCol(st.fillStyle); if (!col) return; const polys = path.filter(p => p.length >= 3).map(p => p.slice()); if (polys.length) ops.push({ f: 1, polys, col: [col[0], col[1], col[2], col[3] * st.globalAlpha] }); },
    stroke() { const col = parseCol(st.strokeStyle); if (!col) return; const w = st.lineWidth * scaleOf(); const segs = [];
      for (const p of path) { for (let k = 0; k + 1 < p.length; k++) segs.push([p[k], p[k + 1]]); if (p.closed && p.length > 2) segs.push([p[p.length - 1], p[0]]); }
      if (segs.length) ops.push({ f: 0, segs, w, col: [col[0], col[1], col[2], col[3] * st.globalAlpha] }); },
    fillRect(x, y, w, h) { const col = parseCol(st.fillStyle); if (!col) return; ops.push({ f: 1, polys: [[tp(x, y), tp(x + w, y), tp(x + w, y + h), tp(x, y + h)]], col: [col[0], col[1], col[2], col[3] * st.globalAlpha] }); },
    strokeRect(x, y, w, h) { const col = parseCol(st.strokeStyle); if (!col) return; const P = [tp(x, y), tp(x + w, y), tp(x + w, y + h), tp(x, y + h)]; ops.push({ f: 0, segs: [[P[0], P[1]], [P[1], P[2]], [P[2], P[3]], [P[3], P[0]]], w: st.lineWidth * scaleOf(), col: [col[0], col[1], col[2], col[3] * st.globalAlpha] }); },
    clearRect() { }, fillText() { }, strokeText() { }, drawImage() { }, setLineDash() { }, clip() { },
    measureText: () => ({ width: 0 }),
    createLinearGradient() { const g = { stops: [], addColorStop(o, cc) { g.stops.push(cc); } }; return g; },
    createRadialGradient() { const g = { stops: [], addColorStop(o, cc) { g.stops.push(cc); } }; return g; },
    createPattern: () => null, getImageData: () => ({ data: [] }), putImageData() { },
  };
  return { c, ops };
}
// the god's picture of a building, as the god's view would paint it (Art.building: the sprite of its type, variant and
// people), in the god's pixels from the anchor — the middle of the lot on its highest ground; ops: what was painted, in
// order. Art's cache is put aside for the call: the picture is painted anew, and the game's cache stays as it was
F.god = function (b) {
  const Art = G.Art; const doc0 = global.document; let rec = null;
  global.document = new Proxy(doc0, { get(t, k) { if (k === 'createElement') return tag => { if (tag !== 'canvas') return doc0.createElement(tag); const R = recorder(); rec = R; const cv = { width: 0, height: 0, getContext: () => R.c }; R.c.canvas = cv; return cv; }; return t[k]; } });
  const keep = Art.clear; let spr = null;
  try { Art.clear(); spr = Art.building(b.type, b.v, b.style, b.wd); } finally { global.document = doc0; void keep; }
  if (!spr || !rec) return { ops: [], none: true };
  // (the recorder's frame is the canvas's: scale(3) then translate(ax, ay) — back to the god's pixels from the anchor)
  const un = p => [p[0] / 3 - spr.ax, p[1] / 3 - spr.ay];
  const ops = rec.ops.map(o => o.f ? { f: 1, col: o.col, polys: o.polys.map(P => P.map(un)) } : { f: 0, col: o.col, w: o.w / 3, segs: o.segs.map(s => [un(s[0]), un(s[1])]) });
  Art.clear(); // (the game's sprites are painted again on demand: nothing of the recorder stays in the cache)
  return { ops, spr: { w: spr.w, h: spr.h, ax: spr.ax, ay: spr.ay } };
};

// ------------------------------ the 3D, projected by the camera of the descent ------------------------------
// (a point of the world, metres, to the god's pixels from the building's anchor: P(dx, dy, z) with dx, dy the tiles from the
// middle of the lot and z = (Y − the lot's highest ground) × 3.04; and how near the eye it is — the descent looks from the
// south-east, 30° down, at the world squashed in height by 0.62)
const TILE = 4;
function framer(b) {
  const L = TILE, cx = (b.x + b.w / 2) * L, cz = (b.y + b.h / 2) * L; const hi = G.W.maxH(b.x, b.y, b.w, b.h) * G.Space.HM;
  const k1 = Math.cos(Math.PI / 6) / Math.SQRT2, k2 = Math.sin(Math.PI / 6) * 0.62;
  return { cx, cz, hi, P: (X, Y, Z) => { const dx = (X - cx) / L, dy = (Z - cz) / L; return [(dx - dy) * 16, (dx + dy) * 8 - (Y - hi) * ZPX, (X - cx + Z - cz) * k1 + (Y - hi) * k2]; } };
}
F.framer = framer;
// (the triangles of a geometry the 3D built — a BufferGeometry or the builder's own lists — with their colours in sRGB)
function trisOf(geo, plain) {
  const out = []; if (!geo) return out;
  const P = geo.attributes ? geo.attributes.position.array : geo.p, C = geo.attributes ? (geo.attributes.color ? geo.attributes.color.array : null) : geo.c, Nn = geo.attributes ? (geo.attributes.normal ? geo.attributes.normal.array : null) : geo.n;
  for (let k = 0; k + 8 < P.length; k += 9) {
    const col = plain ? plain : C ? [toSrgb((C[k] + C[k + 3] + C[k + 6]) / 3), toSrgb((C[k + 1] + C[k + 4] + C[k + 7]) / 3), toSrgb((C[k + 2] + C[k + 5] + C[k + 8]) / 3)] : [200, 200, 200];
    const n = Nn ? [(Nn[k] + Nn[k + 3] + Nn[k + 6]) / 3, (Nn[k + 1] + Nn[k + 4] + Nn[k + 7]) / 3, (Nn[k + 2] + Nn[k + 5] + Nn[k + 8]) / 3] : [0, 1, 0];
    out.push({ v: [P[k], P[k + 1], P[k + 2], P[k + 3], P[k + 4], P[k + 5], P[k + 6], P[k + 7], P[k + 8]], col, n });
  }
  return out;
}
const GLASS = [28, 38, 48]; // (the panes: Build3D's glass, 0x1c2630)
// the near picture of a building as its chunk draws it (its body and its panes; what lies about it, Props3D, put aside:
// the building is measured, not its yard) — or, with o.props, the yard too
F.near = function (b, o) {
  o = o || {}; const B3 = G.Build3D; const P3 = G.Props3D; if (!o.props) G.Props3D = null;
  let r; try { r = B3.nearGeo(b.x, b.y, 1); } finally { G.Props3D = P3; }
  const tris = trisOf(r.solid).concat(trisOf(r.glass, GLASS), trisOf(r.plants));
  for (const k of ['solid', 'glass', 'plants', 'water']) if (r[k]) r[k].dispose();
  return { tris, fr: framer(b) };
};
// the far picture (the chunk's far figure, as one sees the building from afar)
F.far = function (b) { const B3 = G.Build3D; const geo = B3.farGeo(b.x, b.y, 1); const tris = trisOf(geo); if (geo) geo.dispose(); return { tris, fr: framer(b) }; };

// ------------------------------ the grid, painted ------------------------------
// a grid of cells over the god's pixels (RES to a pixel), each with its colour and how covered it is; x0, y0 its corner
function grid(x0, y0, x1, y1) {
  const W = Math.ceil((x1 - x0) * RES), H = Math.ceil((y1 - y0) * RES);
  return { x0, y0, W, H, r: new Float32Array(W * H), g: new Float32Array(W * H), b: new Float32Array(W * H), a: new Float32Array(W * H), z: null };
}
// (a polygon set filled by the nonzero rule at the cells' middles, its colour put over what is there)
function fillPolys(R, polys, col) {
  const a = Math.max(0, Math.min(1, col[3])); if (a <= 0) return;
  let ylo = 1e9, yhi = -1e9; for (const P of polys) for (const p of P) { if (p[1] < ylo) ylo = p[1]; if (p[1] > yhi) yhi = p[1]; }
  const j0 = Math.max(0, Math.floor((ylo - R.y0) * RES)), j1 = Math.min(R.H - 1, Math.ceil((yhi - R.y0) * RES));
  const xs = [];
  for (let j = j0; j <= j1; j++) {
    const y = R.y0 + (j + 0.5) / RES; xs.length = 0;
    for (const P of polys) for (let k = 0; k < P.length; k++) { const A = P[k], B = P[(k + 1) % P.length]; if ((A[1] <= y) === (B[1] <= y)) continue; const t = (y - A[1]) / (B[1] - A[1]); xs.push([A[0] + t * (B[0] - A[0]), B[1] > A[1] ? 1 : -1]); }
    if (xs.length < 2) continue; xs.sort((p, q) => p[0] - q[0]);
    let w = 0;
    for (let k = 0; k + 1 < xs.length; k++) { w += xs[k][1]; if (!w) continue;
      const i0 = Math.max(0, Math.ceil((xs[k][0] - R.x0) * RES - 0.5)), i1 = Math.min(R.W - 1, Math.floor((xs[k + 1][0] - R.x0) * RES - 0.5));
      for (let i = i0; i <= i1; i++) { const q = j * R.W + i; R.r[q] = col[0] * a + R.r[q] * (1 - a); R.g[q] = col[1] * a + R.g[q] * (1 - a); R.b[q] = col[2] * a + R.b[q] * (1 - a); R.a[q] = a + R.a[q] * (1 - a); } }
  }
}
// (a stroke: each segment a band of its width — the shape's lines that count: a mast, a pole, a spear; the hair-thin lines
// of tiles and planks, and the faint ones, are the picture's texture, not its shape)
function strokeSegs(R, segs, w, col) {
  if (w < 0.55 || col[3] < 0.5) return;
  const polys = []; for (const [A, B] of segs) { const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1; const nx = -dy / l * w / 2, ny = dx / l * w / 2; polys.push([[A[0] + nx, A[1] + ny], [B[0] + nx, B[1] + ny], [B[0] - nx, B[1] - ny], [A[0] - nx, A[1] - ny]]); }
  for (const P of polys) fillPolys(R, [P], col);
}
F.paintGod = function (god, R) { for (const o of god.ops) { if (o.f) fillPolys(R, o.polys, o.col); else strokeSegs(R, o.segs, o.w, o.col); } return R; };
// (the 3D's triangles with the depth of each cell: the nearest wins; lit as the god's picture shades its faces — the front-
// left face lighter, the front-right darker, the tops lightest)
const LIGHT = (() => { const v = [-0.3, 0.8, 0.5]; const l = Math.hypot(...v); return v.map(x => x / l); })();
F.paint3D = function (pic, R) {
  if (!R.z) { R.z = new Float32Array(R.W * R.H).fill(-1e9); }
  const fr = pic.fr;
  for (const t of pic.tris) {
    const A = fr.P(t.v[0], t.v[1], t.v[2]), B = fr.P(t.v[3], t.v[4], t.v[5]), C = fr.P(t.v[6], t.v[7], t.v[8]);
    const den = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]); if (Math.abs(den) < 1e-9) continue;
    const sh = 0.55 + 0.45 * Math.max(0, t.n[0] * LIGHT[0] + t.n[1] * LIGHT[1] + t.n[2] * LIGHT[2]);
    const cr = t.col[0] * sh, cg = t.col[1] * sh, cb = t.col[2] * sh;
    const i0 = Math.max(0, Math.floor((Math.min(A[0], B[0], C[0]) - R.x0) * RES)), i1 = Math.min(R.W - 1, Math.ceil((Math.max(A[0], B[0], C[0]) - R.x0) * RES));
    const j0 = Math.max(0, Math.floor((Math.min(A[1], B[1], C[1]) - R.y0) * RES)), j1 = Math.min(R.H - 1, Math.ceil((Math.max(A[1], B[1], C[1]) - R.y0) * RES));
    for (let j = j0; j <= j1; j++) { const y = R.y0 + (j + 0.5) / RES;
      for (let i = i0; i <= i1; i++) { const x = R.x0 + (i + 0.5) / RES;
        const l1 = ((B[1] - C[1]) * (x - C[0]) + (C[0] - B[0]) * (y - C[1])) / den, l2 = ((C[1] - A[1]) * (x - C[0]) + (A[0] - C[0]) * (y - C[1])) / den, l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const z = l1 * A[2] + l2 * B[2] + l3 * C[2]; const q = j * R.W + i; if (z <= R.z[q]) continue;
        R.z[q] = z; R.r[q] = cr; R.g[q] = cg; R.b[q] = cb; R.a[q] = 1; } }
  }
  return R;
};
// the bounds of what each picture covers, for a grid round both (god's pixels from the anchor)
function boundsGod(god) { const B = [1e9, 1e9, -1e9, -1e9]; for (const o of god.ops) { const L = o.f ? o.polys.flat() : o.segs.flat(); for (const p of L) { B[0] = Math.min(B[0], p[0]); B[1] = Math.min(B[1], p[1]); B[2] = Math.max(B[2], p[0]); B[3] = Math.max(B[3], p[1]); } } return B; }
function bounds3D(pic) { const B = [1e9, 1e9, -1e9, -1e9]; for (const t of pic.tris) for (let k = 0; k < 9; k += 3) { const p = pic.fr.P(t.v[k], t.v[k + 1], t.v[k + 2]); B[0] = Math.min(B[0], p[0]); B[1] = Math.min(B[1], p[1]); B[2] = Math.max(B[2], p[0]); B[3] = Math.max(B[3], p[1]); } return B; }
F.gridFor = function (...pics) {
  const B = [-40, -40, 40, 40]; for (const p of pics) { if (!p) continue; const q = p.ops ? boundsGod(p) : bounds3D(p); B[0] = Math.min(B[0], q[0]); B[1] = Math.min(B[1], q[1]); B[2] = Math.max(B[2], q[2]); B[3] = Math.max(B[3], q[3]); }
  return () => grid(Math.floor(B[0]) - 4, Math.floor(B[1]) - 4, Math.ceil(B[2]) + 4, Math.ceil(B[3]) + 4);
};

// ------------------------------ the measures ------------------------------
// (what a picture covers — a cell more than half covered —, its top and foot on the screen, its width band by band, its
// lowest line column by column, and its openings: the dark spots on its faces, darker than the faces round them)
F.measure = function (R, lot) {
  const { W, H } = R; const mask = new Uint8Array(W * H); let n = 0, ix0 = W, ix1 = -1, jy0 = H, jy1 = -1;
  for (let q = 0; q < W * H; q++) if (R.a[q] >= 0.5) { mask[q] = 1; n++; const i = q % W, j = (q / W) | 0; if (i < ix0) ix0 = i; if (i > ix1) ix1 = i; if (j < jy0) jy0 = j; if (j > jy1) jy1 = j; }
  const out = { mask, n, area: n / (RES * RES), R };
  if (!n) return out;
  out.top = -(R.y0 + jy0 / RES); out.foot = R.y0 + (jy1 + 1) / RES; out.left = R.x0 + ix0 / RES; out.right = R.x0 + (ix1 + 1) / RES;
  // (the lowest covered cell of each column: the line where the building meets the ground, seen from the front)
  out.low = new Float32Array(W).fill(NaN); for (let i = 0; i < W; i++) for (let j = H - 1; j >= 0; j--) if (mask[j * W + i]) { out.low[i] = R.y0 + (j + 1) / RES; break; }
  // (the openings: a cell darker than 0.7 of its faces round it — the mean of the covered cells 6 px about it —; a spot of
  // them at least a pixel each way and a pixel and a half big is an opening: a window, a door, an arch, a slit)
  const L = new Float32Array(W * H); for (let q = 0; q < W * H; q++) if (mask[q]) L[q] = lum([R.r[q], R.g[q], R.b[q]]);
  const S = new Float64Array((W + 1) * (H + 1)), C = new Float64Array((W + 1) * (H + 1));
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = j * W + i, s = (j + 1) * (W + 1) + i + 1; S[s] = L[q] + S[s - 1] + S[s - W - 1] - S[s - W - 2]; C[s] = mask[q] + C[s - 1] + C[s - W - 1] - C[s - W - 2]; }
  const rad = 6 * RES; const dark = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const q = j * W + i; if (!mask[q]) continue;
    const a0 = Math.max(0, i - rad), a1 = Math.min(W, i + rad + 1), b0 = Math.max(0, j - rad), b1 = Math.min(H, j + rad + 1);
    const s = S[b1 * (W + 1) + a1] - S[b0 * (W + 1) + a1] - S[b1 * (W + 1) + a0] + S[b0 * (W + 1) + a0], c = C[b1 * (W + 1) + a1] - C[b0 * (W + 1) + a1] - C[b1 * (W + 1) + a0] + C[b0 * (W + 1) + a0];
    if (c > 0 && L[q] < 0.7 * s / c) dark[q] = 1; }
  const seen = new Uint8Array(W * H); const spots = []; const st = [];
  for (let q0 = 0; q0 < W * H; q0++) { if (!dark[q0] || seen[q0]) continue; let m = 0, a0 = W, a1 = -1, b0 = H, b1 = -1; st.push(q0); seen[q0] = 1;
    while (st.length) { const q = st.pop(); m++; const i = q % W, j = (q / W) | 0; if (i < a0) a0 = i; if (i > a1) a1 = i; if (j < b0) b0 = j; if (j > b1) b1 = j;
      for (const d of [1, -1, W, -W]) { const r = q + d; if (r < 0 || r >= W * H || seen[r] || !dark[r]) continue; if ((d === 1 && r % W === 0) || (d === -1 && q % W === 0)) continue; seen[r] = 1; st.push(r); } }
    const area = m / (RES * RES), wx = (a1 - a0 + 1) / RES, hy = (b1 - b0 + 1) / RES;
    if (area >= 1.5 && wx >= 1 && hy >= 1) spots.push({ area, x: R.x0 + (a0 + a1 + 1) / 2 / RES, y: R.y0 + (b0 + b1 + 1) / 2 / RES, w: wx, h: hy }); }
  out.open = { n: spots.length, area: spots.reduce((s, p) => s + p.area, 0), spots };
  void lot; return out;
};
// ------------------------------ a picture of the pictures (for the eye: the report's images) ------------------------------
// the grids side by side on a light ground (rows of them: one row a building), the lot's diamond on the ground drawn in
// each, as a PNG file (zlib, no library)
F.png = function (file, rows, lot, scale) {
  const zlib = require('zlib'), fs = require('fs'); const k = scale || 1; const gap = 6;
  if (!Array.isArray(rows[0])) rows = [rows];
  const lots = Array.isArray(lot && lot[0]) ? lot : rows.map(() => lot);
  const rowW = r => r.reduce((s, R) => s + Math.ceil(R.W * k) + gap, gap), rowH = r => Math.max(...r.map(R => Math.ceil(R.H * k))) + gap;
  const W = Math.max(...rows.map(rowW)), H = rows.reduce((s, r) => s + rowH(r), gap);
  const img = Buffer.alloc(W * H * 3, 238); let oy = gap;
  rows.forEach((grids, ri) => { let ox = gap; const lt = lots[ri];
    for (const R of grids) {
      const w = Math.ceil(R.W * k), h = Math.ceil(R.H * k);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = Math.min(R.H - 1, (y / k) | 0) * R.W + Math.min(R.W - 1, (x / k) | 0); const a = R.a[q]; if (a <= 0) continue; const p = ((y + oy) * W + ox + x) * 3;
        img[p] = Math.round(R.r[q] + (1 - a) * 238); img[p + 1] = Math.round(R.g[q] + (1 - a) * 238); img[p + 2] = Math.round(R.b[q] + (1 - a) * 238); }
      if (lt) { const hw = lt[0] / 2, hh = lt[1] / 2; const C = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([dx, dy]) => [(dx - dy) * 16, (dx + dy) * 8]);
        for (let e = 0; e < 4; e++) { const A = C[e], B = C[(e + 1) % 4]; for (let t = 0; t <= 200; t++) { const X = A[0] + (B[0] - A[0]) * t / 200, Y = A[1] + (B[1] - A[1]) * t / 200; const x = Math.round((X - R.x0) * RES * k), y = Math.round((Y - R.y0) * RES * k); if (x < 0 || y < 0 || x >= w || y >= h) continue; const p = ((y + oy) * W + ox + x) * 3; img[p] = 220; img[p + 1] = 40; img[p + 2] = 40; } } }
      ox += w + gap;
    }
    oy += rowH(grids); });
  const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; img.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let q = 0; q < 8; q++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = buf => { let c = 0xffffffff; for (const v of buf) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2; ih[10] = 0; ih[11] = 0; ih[12] = 0;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
};
// the two pictures against each other: the silhouettes' overlap, the tops in metres, the width band by band over the
// height both reach, the foot line column by column, the openings — all in the god's pixels and metres
F.compare = function (a, b, lot) {
  const R = a.R; const W = R.W, H = R.H; let inter = 0, uni = 0;
  for (let q = 0; q < W * H; q++) { const x = a.mask[q], y = b.mask[q]; if (x && y) inter++; if (x || y) uni++; }
  const o = { iou: uni ? inter / uni : 1, areaA: a.area, areaB: b.area };
  if (!a.n || !b.n) return Object.assign(o, { empty: !a.n ? 'deus' : '3D' });
  o.topA = a.top / ZPX; o.topB = b.top / ZPX; o.dTop = o.topB - o.topA;
  // (eight bands from the lot's front corner on the ground up to the higher top: each band's width, a fraction of the lot's
  // own width on the screen)
  const footY = lot ? (lot[0] + lot[1]) * 4 : Math.max(a.foot, b.foot); const topY = -Math.max(a.top, b.top); const lw = lot ? (lot[0] + lot[1]) * 16 : (R.W / RES);
  const band = (m, k) => { const y0 = footY + (topY - footY) * (k + 1) / 8, y1 = footY + (topY - footY) * k / 8; const j0 = Math.max(0, Math.floor((y0 - R.y0) * RES)), j1 = Math.min(H, Math.ceil((y1 - R.y0) * RES)); let lo = W, hi = -1;
    for (let j = j0; j < j1; j++) for (let i = 0; i < W; i++) if (m.mask[j * W + i]) { if (i < lo) lo = i; if (i > hi) hi = i; } return hi < 0 ? 0 : (hi - lo + 1) / RES / lw; };
  o.profA = []; o.profB = []; for (let k = 0; k < 8; k++) { o.profA.push(band(a, k)); o.profB.push(band(b, k)); }
  o.dProf = o.profA.reduce((s, v, k) => s + Math.abs(v - o.profB[k]), 0) / 8;
  // (the foot line: the mean distance of the two lowest lines where both stand, in pixels; and how much of the width the
  // two do not share)
  let d = 0, nd = 0, only = 0, any = 0; for (let i = 0; i < W; i++) { const x = a.low[i], y = b.low[i]; const ha = !Number.isNaN(x), hb = !Number.isNaN(y); if (ha || hb) any++; if (ha && hb) { d += Math.abs(x - y); nd++; } else if (ha || hb) only++; }
  o.dFoot = nd ? d / nd : 0; o.footOnly = any ? only / any : 0;
  o.openA = a.open.n; o.openB = b.open.n; o.openAreaA = a.open.area; o.openAreaB = b.open.area;
  return o;
};
