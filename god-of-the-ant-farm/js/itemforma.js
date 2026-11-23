'use strict';
// ============================================================
//  ItemForma: the recipes of the things' shapes (G.Itens) — pure
//  numbers, the same on every machine and in every world: no
//  world, no chance (a hash of the place gives the grain and the
//  knapped facets), no THREE (G.ItemArt wraps the numbers in
//  three.js geometry). Each recipe builds a thing in its frame
//  (D-337: metres; the origin at the main hand's grip; +Y along
//  the handle to the business end; +Z its front — the edge, the
//  face; +X = Y × Z) at a level of detail (0 near, 1 mid, 2 far)
//  out of a small kit: the loft (a section swept along a path:
//  handles, blades, heads, bands), the grid (a surface over two
//  parameters: a shield's face, a helmet, a cuirass), and the
//  colours of each material — wood with its grain, the knapped
//  stone's facets, the bronze's warm and the iron's grey with
//  their honed edges, leather, rope, wicker — with the shine the
//  material carries (metal, gloss, paint: G.ItemArt.material
//  reads it). A thing that hangs (pega 'alca', the sling) has its
//  bail through the fist along Y and hangs toward +Z, where the
//  arm points (D-386). Worn things are in the frame of the bone
//  they sit on (D-387).
// ============================================================
(function (G) {
  const F = G.ItemForma = {};

  // ------------------------------ small math ------------------------------
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = a => Math.hypot(a[0], a[1], a[2]);
  const nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  // (a hash of three integers to 0..1, and a value noise over it: the grain, the mottling, the facets — the same everywhere)
  const hs = (a, b, c) => { let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x2545f491); h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, z) {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z); let fx = x - X, fy = y - Y, fz = z - Z; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const c = (i, j, k) => hs(X + i, Y + j, Z + k);
    const a = lerp(lerp(c(0, 0, 0), c(1, 0, 0), fx), lerp(c(0, 1, 0), c(1, 1, 0), fx), fy), b = lerp(lerp(c(0, 0, 1), c(1, 0, 1), fx), lerp(c(0, 1, 1), c(1, 1, 1), fx), fy);
    return lerp(a, b, fz);
  }
  const hpos = (p, s) => hs(Math.round(p[0] * 2000) + s * 7, Math.round(p[1] * 2000), Math.round(p[2] * 2000));
  F.hash = hs; F.noise = vn;

  // ------------------------------ the materials ------------------------------
  // the colour each material gives (sRGB, the world's palette ranges: arte/BIBLIA.md §2.2), its grain and its shine
  // (m metal 0..1, g gloss 0..1, p paint: the people's colour may replace it — G.ItemArt.material); edge: the honed or worn
  // edge's colour; c2: a second tone the grain wanders to
  const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const PAL = F.PAL = {
    madeira: { c: hex('#7c5a3b'), c2: hex('#634528'), grain: 'wood', g: 0.12 }, // ash and oak: the handles, the shafts
    escura: { c: hex('#5c3f26'), c2: hex('#4a321e'), grain: 'wood', g: 0.14 }, // the hard dark wood: a club, a staff
    clara: { c: hex('#a4835b'), c2: hex('#8a6c48'), grain: 'wood', g: 0.1 }, // pale split wood: a bucket's staves, an oar
    pedra: { c: hex('#5f5b54'), c2: hex('#7a6e5c'), edge: hex('#a49b8a'), grain: 'flint', g: 0.32 }, // knapped flint and chert
    seixo: { c: hex('#74716a'), c2: hex('#55534e'), grain: 'pebble', g: 0.08 }, // a pecked cobble
    bronze: { c: hex('#8d6436'), c2: hex('#6a4a28'), edge: hex('#d8ae68'), grain: 'metal', m: 1, g: 0.7 },
    ferro: { c: hex('#4f5257'), c2: hex('#43454a'), edge: hex('#a9aeb5'), grain: 'metal', m: 1, g: 0.55 },
    rebite: { c: hex('#8a8d92'), edge: hex('#c4c8cc'), grain: 'metal', m: 1, g: 0.6 }, // a bright iron rivet head
    couro: { c: hex('#74482a'), c2: hex('#5e3920'), grain: 'leather', g: 0.22 },
    cru: { c: hex('#b08c62'), c2: hex('#987548'), grain: 'leather', g: 0.15 }, // rawhide and sinew lashings
    corda: { c: hex('#a08a5e'), c2: hex('#7e6a44'), grain: 'rope', g: 0.05 },
    linha: { c: hex('#d6ccb4'), grain: 'rope', g: 0.05 }, // a fishing line, a bowstring
    vime: { c: hex('#b49866'), c2: hex('#86693f'), grain: 'wicker', g: 0.08 },
    pano: { c: hex('#7d6a52'), c2: hex('#5e4e3c'), grain: 'cloth', g: 0.04 }, // a torch's rag
    piche: { c: hex('#2f271e'), c2: hex('#1f1a14'), grain: 'cloth', g: 0.5 }, // pitch on the rag
    pena: { c: hex('#e2dccf'), c2: hex('#b9b1a2'), grain: 'feather', g: 0.08 },
    penaT: { c: hex('#9a3a28'), c2: hex('#7a2c1e'), grain: 'feather', g: 0.08 }, // the cock feather, dyed
    rede: { c: hex('#b9a67e'), c2: hex('#5c4e38'), grain: 'net', g: 0.04 },
    chumbo: { c: hex('#6a6c70'), grain: 'metal', m: 0.6, g: 0.3 }, // a net's lead weights
    tinta: { c: hex('#9c3c28'), c2: hex('#7c2e1e'), grain: 'paint', g: 0.2, p: 1 }, // red ochre: a shield's face, a crest
    crina: { c: hex('#9a3022'), c2: hex('#6e1e16'), grain: 'hair', g: 0.1, p: 1 }, // a helmet's dyed horsehair crest
    // (22c, D-612: the pottery's fired clay, its slip band; the iron of a shackle, rough from the forge, not honed)
    barro: { c: hex('#a35a37'), c2: hex('#8c4a2c'), grain: 'pebble', g: 0.18 },
    barroE: { c: hex('#5a3322'), c2: hex('#4a2a1c'), grain: 'pebble', g: 0.3 },
    ferroB: { c: hex('#47494d'), c2: hex('#3a3b3e'), edge: hex('#7d8288'), grain: 'metal', m: 0.85, g: 0.38 },
  };
  // the material a thing is made in (the catalog's mats) → the palette of its working part; an unknown one reads as iron
  F.MATS = { pedra: 'pedra', bronze: 'bronze', ferro: 'ferro', madeira: 'madeira', vime: 'vime', corda: 'corda', couro: 'couro', barro: 'barro' };
  const metal = mat => PAL[F.MATS[mat] || 'ferro'] || PAL.ferro;

  // ------------------------------ the mesh being built ------------------------------
  function Mesh(q) { return { q, P: [], C: [], S: [], N: [], I: [], inf: [], parts: [], part: null, occ: [], marks: {} }; }
  // (a part: a run of the index — the handle, the head, a binding — named for the tests and for the drawer)
  function part(M, name) { if (M.part) M.part.i1 = M.I.length; M.part = { name, i0: M.I.length, i1: 0 }; M.parts.push(M.part); }
  // (a contact shadow: things meeting darken each other there — the haft under the head, a binding's ends)
  const dark = (M, c, r, k) => M.occ.push([c, r, k]);
  function vert(M, p, inf) { M.P.push(p[0], p[1], p[2]); M.inf.push(inf); return M.P.length / 3 - 1; }
  function tri(M, a, b, c) { M.I.push(a, b, c); }
  // (the normals of the triangles from i0 on: area-weighted, each vertex its own faces — the creases are duplicate vertices)
  function normals(M, v0, i0) {
    const n = M.P.length / 3, acc = new Float64Array((n - v0) * 3);
    for (let i = i0; i < M.I.length; i += 3) {
      const a = M.I[i], b = M.I[i + 1], c = M.I[i + 2]; const A = [M.P[a * 3], M.P[a * 3 + 1], M.P[a * 3 + 2]], B = [M.P[b * 3], M.P[b * 3 + 1], M.P[b * 3 + 2]], C = [M.P[c * 3], M.P[c * 3 + 1], M.P[c * 3 + 2]];
      const f = crs(sub(B, A), sub(C, A)); for (const v of [a, b, c]) if (v >= v0) { acc[(v - v0) * 3] += f[0]; acc[(v - v0) * 3 + 1] += f[1]; acc[(v - v0) * 3 + 2] += f[2]; }
    }
    for (let v = v0; v < n; v++) { let x = acc[(v - v0) * 3], y = acc[(v - v0) * 3 + 1], z = acc[(v - v0) * 3 + 2]; const l = Math.hypot(x, y, z); if (l > 1e-12) { x /= l; y /= l; z /= l; } else { x = 0; y = 1; z = 0; } M.N[v * 3] = x; M.N[v * 3 + 1] = y; M.N[v * 3 + 2] = z; }
  }
  // (one face, one normal: a primitive made flat — each triangle its own three vertices — the knapped stone, the far shapes)
  function flatten(M, v0, i0) {
    const I = M.I.splice(i0), P = M.P.slice(v0 * 3), inf = M.inf.slice(v0); M.P.length = v0 * 3; M.inf.length = v0;
    for (let i = 0; i < I.length; i += 3) for (let k = 0; k < 3; k++) { const v = I[i + k] - v0; const o = Object.assign({}, inf[v]); o.face = (o.face || 0) * 131 + i / 3 + 1; M.I.push(vert(M, [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]], o)); }
  }
  // (the triangles from i0 turned to face away from a point inside — for the open surfaces whose winding is not obvious)
  function orient(M, i0, inside, out, dir) {
    let s = 0;
    for (let i = i0; i < M.I.length; i += 3) { const a = M.I[i], b = M.I[i + 1], c = M.I[i + 2]; const A = [M.P[a * 3], M.P[a * 3 + 1], M.P[a * 3 + 2]], B = [M.P[b * 3], M.P[b * 3 + 1], M.P[b * 3 + 2]], C = [M.P[c * 3], M.P[c * 3 + 1], M.P[c * 3 + 2]]; const f = crs(sub(B, A), sub(C, A)); const ce = mul(add(add(A, B), C), 1 / 3); s += dir ? dot(f, dir(ce)) : out ? dot(f, out) : dot(f, sub(ce, inside)); }
    if (s < 0) for (let i = i0; i < M.I.length; i += 3) { const t = M.I[i + 1]; M.I[i + 1] = M.I[i + 2]; M.I[i + 2] = t; }
  }
  // (a primitive is done: its winding checked, flat if asked, its normals made)
  function done(M, v0, i0, o) { if (o.inside || o.out || o.dir) orient(M, i0, o.inside, o.out, o.dir); if (o.flat) flatten(M, v0, i0); normals(M, v0, i0); }

  // ------------------------------ the kit ------------------------------
  // loft: a section swept along a path. path: [[x,y,z], …] (two points at least); sec(k, t) → [[u, v, flag], …], the same
  // count every row (flag: 's' a crease, 'e' the honed edge, 'k' a worn corner — they may be joined: 'se'); the section's u
  // lies along the frame's X (o.ax, +X by default, made square to the path), its v along X × T (for a path along +Y: +Z).
  // o: axis (a fixed tangent: a lathe, a straight extrusion), open (the section is not a loop), loop (the path is a loop),
  // cap0 / cap1 (close an end: true flat, or a point [x,y,z] the end narrows to), flat, jit (the knapped facets' depth, a
  // fraction of the section), m(k, t, j) (a material a vertex), f(k, t, j, u, v, p) (more for the colour: ao, e, w, gl)
  function loft(M, path, sec, m, o = {}) {
    const v0 = M.P.length / 3, i0 = M.I.length, nr = path.length;
    let L = 0; const Ls = [0]; for (let k = 1; k < nr; k++) { L += len(sub(path[k], path[k - 1])); Ls.push(L); }
    const S0 = sec(0, 0); const ns = S0.length; const closedS = !o.open;
    // (which way the section turns: its area in (u, v) — the triangles face out either way)
    let area = 0; for (let j = 0; j < ns; j++) { const a = S0[j], b = S0[(j + 1) % ns]; area += a[0] * b[1] - b[0] * a[1]; }
    const pos = closedS ? area >= 0 : !o.flip;
    // (the columns: a crease point is two of them — one for the faces before it, one for those after)
    const colIn = [], colOut = []; let nc = 0;
    for (let j = 0; j < ns; j++) { colIn[j] = nc; colOut[j] = /s/.test(S0[j][2] || '') ? nc + 1 : nc; nc = colOut[j] + 1; }
    const rows = [];
    for (let k = 0; k < nr; k++) {
      const t = L > 0 ? Ls[k] / L : k / Math.max(1, nr - 1);
      let T = o.axis || (o.loop ? sub(path[(k + 1) % nr], path[(k + nr - 1) % nr]) : sub(path[Math.min(nr - 1, k + 1)], path[Math.max(0, k - 1)])); T = nrm(T);
      let ref = o.ax || (Math.abs(T[0]) > 0.9 ? [0, 0, 1] : [1, 0, 0]); let X = sub(ref, mul(T, dot(ref, T))); if (len(X) < 1e-6) X = Math.abs(T[1]) < 0.9 ? crs([0, 1, 0], T) : crs([1, 0, 0], T); X = nrm(X);
      const Z = crs(X, T); const S = k ? sec(k, t) : S0; const row = [];
      for (let j = 0; j < ns; j++) {
        let [u, v, fl] = S[j]; fl = fl || '';
        if (o.jit) { const p0 = add(path[k], add(mul(X, u), mul(Z, v))); const h = hpos(p0, 3), h2 = hpos(p0, 5); u *= 1 + o.jit * (h - 0.5) * 2; v *= 1 + o.jit * (h2 - 0.5) * 1.2; }
        const p = add(path[k], add(mul(X, u), mul(Z, v)));
        const inf = { m: o.m ? o.m(k, t, j) : m, L: Ls[k], a: j / ns, u, v, e: /e/.test(fl) ? 1 : 0, kc: /k/.test(fl) ? 1 : 0, t };
        if (o.f) Object.assign(inf, o.f(k, t, j, u, v, p));
        const a = vert(M, p, inf); if (colOut[j] !== colIn[j]) vert(M, p, Object.assign({}, inf));
        row.push(a);
      }
      rows.push(row);
    }
    const id = (k, c) => v0 + k * nc + c;
    const nseg = closedS ? ns : ns - 1, nrow = o.loop ? nr : nr - 1;
    for (let k = 0; k < nrow; k++) { const k1 = (k + 1) % nr;
      for (let j = 0; j < nseg; j++) { const j1 = (j + 1) % ns;
        const a = id(k, colOut[j]), b = id(k, colIn[j1]), c = id(k1, colIn[j1]), d = id(k1, colOut[j]);
        if (pos) { tri(M, a, d, c); tri(M, a, c, b); } else { tri(M, a, c, d); tri(M, a, b, c); } } }
    // (the ends: a flat fan of their own — a crease all round — or narrowing to a point)
    const cap = (k, end, c) => {
      const ring = []; const ctr = [0, 0, 0]; for (let j = 0; j < ns; j++) { const v = id(k, colIn[j]); const p = [M.P[v * 3], M.P[v * 3 + 1], M.P[v * 3 + 2]]; ring.push(p); ctr[0] += p[0] / ns; ctr[1] += p[1] / ns; ctr[2] += p[2] / ns; }
      const pt = Array.isArray(c), tip = pt ? c : ctr; const inf0 = M.inf[id(k, 0)];
      const cv = vert(M, tip, Object.assign({}, inf0, { a: 0, u: 0, v: 0, e: pt && o.tipEdge ? 1 : 0, cap: 1 }));
      const rv = pt ? ring.map((p, j) => id(k, colIn[j])) : ring.map((p, j) => vert(M, p, Object.assign({}, M.inf[id(k, colIn[j])], { cap: 1 })));
      const fwd = end ? pos : !pos;
      for (let j = 0; j < nseg; j++) { const j1 = (j + 1) % ns; const a = pt ? id(k, colOut[j]) : rv[j], b = pt ? id(k, colIn[j1]) : rv[j1]; if (fwd) tri(M, cv, b, a); else tri(M, cv, a, b); }
    };
    if (!o.loop) { if (o.cap0) cap(0, false, o.cap0); if (o.cap1) cap(nr - 1, true, o.cap1); }
    done(M, v0, i0, o);
    return { v0, i0 };
  }
  // grid: a surface over (s, t) in [0, 1]²: fn(s, t) → [x, y, z]; nu × nv cells; o: loopU (s wraps round), apex0 (t = 0 is
  // one point), inside / out (which side faces out), flat, m(s, t), f(s, t, p) (more for the colour)
  function grid(M, nu, nv, fn, m, o = {}) {
    const v0 = M.P.length / 3, i0 = M.I.length; const cols = o.loopU ? nu : nu + 1; const id = [];
    for (let i = 0; i <= nv; i++) { const t = i / nv; const row = [];
      if (i === 0 && o.apex0) { const p = fn(0, 0); const v = vert(M, p, Object.assign({ m: o.m ? o.m(0, 0) : m, L: 0, a: 0, u: 0, v: 0, e: 0, kc: 0, t: 0, s: 0 }, o.f ? o.f(0, 0, p) : {})); for (let j = 0; j < cols; j++) row.push(v); id.push(row); continue; }
      for (let j = 0; j < cols; j++) { const s = j / nu; const p = fn(s, t); row.push(vert(M, p, Object.assign({ m: o.m ? o.m(s, t) : m, L: t, a: s, u: s, v: t, e: 0, kc: 0, t, s }, o.f ? o.f(s, t, p) : {}))); }
      id.push(row); }
    for (let i = 0; i < nv; i++) for (let j = 0; j < nu; j++) { const j1 = o.loopU ? (j + 1) % nu : j + 1;
      const a = id[i][j], b = id[i][j1], c = id[i + 1][j1], d = id[i + 1][j];
      if (i === 0 && o.apex0) tri(M, a, d, c); else { tri(M, a, d, c); tri(M, a, c, b); } }
    done(M, v0, i0, o);
    return { v0, i0 };
  }
  // (sections: a circle, an ellipse; a rounded rectangle; a blade's lens with its two edges, or with one and a spine)
  const circ = (r, n, rz, ph) => { const o = []; for (let j = 0; j < n; j++) { const a = (j / n + (ph || 0)) * TAU; o.push([Math.cos(a) * r, Math.sin(a) * (rz === undefined ? r : rz), '']); } return o; };
  function rrect(w, h, r, n, fl) {
    r = Math.min(r, w * 0.95, h * 0.95); const o = []; const cs = [[w - r, h - r, 0], [-w + r, h - r, 1], [-w + r, -h + r, 2], [w - r, -h + r, 3]];
    for (const [cx, cy, q] of cs) for (let i = 0; i <= n; i++) { const a = (q + i / Math.max(1, n)) * Math.PI / 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, n === 0 ? 's' + (fl || '') : fl || '']); if (n === 0) break; }
    return o;
  }
  // (a blade: its width along v, from −w to +w, its thickness along u — t at the middle —; e0, e1: honed edges at −w and +w
  // (or a rounded spine there); n points along each face; rib: a mid-rib raised along the middle)
  function blade(w, t, n, e0, e1, rib) {
    n = Math.max(2, n);
    // (an edge thins to nothing; a spine keeps its thickness nearly to the end and rounds off there)
    const prof = x => { const ed = x < 0 ? e0 : e1; const a = Math.max(0, 1 - Math.abs(x)); const r = ed ? Math.pow(a, 0.8) : Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), 5)), 0.5);
      return rib ? t * (0.55 * r + 0.45 * Math.pow(a, 2.2)) * (1 + rib * Math.exp(-x * x * 40)) : t * r; };
    const o = [];
    for (let i = 0; i <= n; i++) { const x = -1 + 2 * i / n; const end = i === 0 ? e0 : i === n ? e1 : null; if (end === null) o.push([prof(x), x * w, rib && i * 2 === n ? 's' : '']); else o.push([0, x * w, end ? 'se' : '']); }
    for (let i = n - 1; i >= 1; i--) { const x = -1 + 2 * i / n; o.push([-prof(x), x * w, rib && i * 2 === n ? 's' : '']); }
    return o;
  }
  const bez = (p0, p1, p2, p3, n) => { const o = []; for (let k = 0; k <= n; k++) { const t = k / n, s = 1 - t; o.push([0, 1, 2].map(i => s * s * s * p0[i] + 3 * s * s * t * p1[i] + 3 * s * t * t * p2[i] + t * t * t * p3[i])); } return o; };
  // lathe: a profile [[r, y], …] (r may be [rx, rz]) turned round Y (or round o.at / o.axis): ends closed with o.cap0 / cap1
  function lathe(M, prof, n, m, o = {}) {
    const at = o.at || [0, 0, 0]; const ax = o.axis || [0, 1, 0]; const path = prof.map(([, y]) => add(at, mul(ax, y)));
    return loft(M, path, k => { const r = prof[k][0]; const rx = Array.isArray(r) ? r[0] : r, rz = Array.isArray(r) ? r[1] : r; return circ(rx, n, rz, o.ph); }, m, Object.assign({ axis: ax }, o));
  }
  // tube: a round section of radius r (or r(t)) along a path
  const tube = (M, path, r, n, m, o = {}) => loft(M, path, (k, t) => circ(typeof r === 'function' ? r(t, k) : r, n, undefined, o.ph), m, o);
  // ball: a sphere (or an ellipsoid [rx, ry, rz]) at c
  function ball(M, c, r, n, m, o = {}) {
    const [rx, ry, rz] = Array.isArray(r) ? r : [r, r, r]; const ax = o.axis || [0, 1, 0]; const alongZ = Math.abs(ax[2]) > 0.9;
    const L = alongZ ? rz : ry, A = alongZ ? [rx, ry] : [rx, rz]; const rows = Math.max(2, Math.round(n / 2)); const prof = [];
    for (let i = 1; i < rows; i++) { const a = Math.PI * i / rows; prof.push([[Math.sin(a) * A[0], Math.sin(a) * A[1]], -Math.cos(a) * L]); }
    return lathe(M, prof, n, m, Object.assign({ at: c, cap0: add(c, mul(ax, -L)), cap1: add(c, mul(ax, L)) }, o));
  }
  // box: a block of half sizes [hx, hy, hz] at c, its edges worn round (r) — along Y, or along o.along ('x' or 'z')
  function box(M, c, h, r, m, o = {}) {
    const q = M.q; const n = q === 0 ? (o.n === undefined ? 1 : o.n) : 0; const al = o.along || 'y';
    const [a, b, w] = al === 'y' ? [h[0], h[2], h[1]] : al === 'z' ? [h[0], h[1], h[2]] : [h[2], h[1], h[0]];
    const axis = al === 'y' ? [0, 1, 0] : al === 'z' ? [0, 0, 1] : [1, 0, 0]; const ax = al === 'y' ? [1, 0, 0] : al === 'z' ? [-1, 0, 0] : [0, 0, -1];
    const bev = q === 0 && r > 0 ? Math.min(r, w * 0.4) : 0; const path = []; const secs = [];
    const S = (s, inset) => rrect(Math.max(1e-4, a * s - inset), Math.max(1e-4, b * s - inset), Math.max(0, r - inset), n, 'k');
    if (bev) { path.push(add(c, mul(axis, -w)), add(c, mul(axis, -w + bev)), add(c, mul(axis, w - bev)), add(c, mul(axis, w))); secs.push(S(1, bev * 0.7), S(1, 0), S(o.taper || 1, 0), S(o.taper || 1, bev * 0.7)); }
    else { path.push(add(c, mul(axis, -w)), add(c, mul(axis, w))); secs.push(S(1, 0), S(o.taper || 1, 0)); }
    return loft(M, path, k => secs[k], m, Object.assign({ axis, ax, cap0: true, cap1: true }, o));
  }

  // ------------------------------ the parts every thing uses ------------------------------
  // a handle of wood along +Y from y0 (the butt) to y1, radius r0 → r1; o: knob (the butt swells, ×), bend ([dx, dz] at the
  // middle), oval (Z / X), grip ([ya, yb]: the zone the hand has worn smooth and dark), wood (the palette), top (the end
  // rounds off: false for one that goes into a head)
  function haft(M, y0, y1, r0, r1, o = {}) {
    const q = M.q, n = o.n || [10, 6, 4][q]; const m = PAL[o.wood || 'madeira']; const Lh = y1 - y0;
    const knob = o.knob || 0, bend = o.bend || [0, 0], ov = o.oval || 1;
    const rad = t => { const r = lerp(r0, r1, t); const kb = knob ? 1 + knob * Math.exp(-Math.pow((t * Lh - 0.012) / 0.03, 2)) : 1; return r * kb; };
    const at = t => [bend[0] * Math.sin(Math.PI * t), lerp(y0, y1, t), bend[1] * Math.sin(Math.PI * t)];
    // (rows only where the shape changes: the rounded ends, the knob, the curve; a straight shaft is long between them)
    const ts = [0, 1]; const add1 = m0 => { const t = m0 / Lh; if (t > 0 && t < 1) ts.push(t); };
    if (q === 0) { add1(0.006); add1(0.016); if (o.top !== false) add1(Lh - 0.01); if (knob) { add1(0.03); add1(0.05); add1(0.075); } }
    else if (q === 1 && knob) add1(0.03);
    const step = q === 2 ? 9 : (bend[0] || bend[1] ? [0.09, 0.22][q] : [0.3, 0.6][q]);
    const nb = Math.max(1, Math.round(Lh / step)); for (let k = 1; k < nb; k++) ts.push(k / nb);
    ts.sort((a, b) => a - b); const T = ts.filter((t, i) => i === 0 || t - ts[i - 1] > 1e-4);
    const path = T.map(at), R = T.map(rad);
    if (q === 0) { R[0] *= 0.6; R[1] *= 0.93; if (o.top !== false) R[R.length - 1] *= 0.75; }
    const g = o.grip || [-0.06, 0.07];
    return loft(M, path, k => circ(R[k], n, R[k] * ov, 0.5 / n), m, { cap0: true, cap1: true, ax: o.ax,
      f: (k, t, j, u, v, p) => { const w = sstep(g[0] - 0.03, g[0], p[1]) * (1 - sstep(g[1], g[1] + 0.03, p[1])); return { ao: 1 - 0.14 * w, gl: 1 + 1.6 * w }; } });
  }
  // a band round a handle at y: a ferrule, a collar, a binding's ring (h tall, r out)
  function collar(M, y, h, r, m, o = {}) { const n = o.n || [12, 7, 4][M.q]; const e = M.q === 0 ? h * 0.18 : 0; const prof = e ? [[r - e, y - h / 2], [r, y - h / 2 + e], [r, y + h / 2 - e], [r - e, y + h / 2]] : [[r, y - h / 2], [r, y + h / 2]]; return lathe(M, prof, n, m, Object.assign({ cap0: true, cap1: true }, o)); }
  // a wrap round a handle from y0 to y1: leather strips or cord, in turns that stand proud (the hand's grip, a lashing)
  function wrap(M, y0, y1, r, m, o = {}) {
    const prev = M.part && M.part.name; if (prev !== 'amarra') part(M, 'amarra'); const out = wrap0(M, y0, y1, r, m, o); if (prev && prev !== 'amarra') part(M, prev); return out;
  }
  function wrap0(M, y0, y1, r, m, o) {
    const q = M.q; if (q === 2) return collar(M, (y0 + y1) / 2, y1 - y0, r + 0.001, m, o);
    const turns = o.turns || Math.max(2, Math.round((y1 - y0) / 0.012)); const per = q === 0 ? 2 : 0; const prof = [];
    const n = o.n || [9, 6][q];
    if (per) { for (let i = 0; i <= turns * per; i++) { const y = lerp(y0, y1, i / (turns * per)); prof.push([r + (i % 2 ? 0.0016 : 0.0002), y]); } }
    else prof.push([r + 0.001, y0], [r + 0.001, y1]);
    return lathe(M, prof, n, m, Object.assign({ cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ wrap: (y1 - y0) / turns, ao: 1 - 0.18 * (q === 0 && k % 2 === 0 ? 1 : 0) }) }, o));
  }
  // a rivet's head: a small dome at p, facing n
  function rivet(M, p, n, r) { if (M.q > 0) return; const ax = nrm(n); lathe(M, [[r, 0], [r * 0.62, r * 0.5]], 5, PAL.rebite, { at: p, axis: ax, cap1: add(p, mul(ax, r * 0.75)) }); }

  // ------------------------------ the recipes ------------------------------
  // R[kind](M, mat, q): build the thing; M.marks gets its named points (ponta: the far point; centro: the business end's
  // middle; chama, linha, corda…); M.grip its off-hand place (two hands), M.stowLen how far it reaches along +Y
  const R = F.R = {};
  const seg = (M, a, b, c) => [a, b, c][M.q];

  // the axe: a haft with a fawn-foot butt and a gentle curve; the head as each age made it
  R.machado = (M, mat) => {
    const q = M.q; part(M, 'cabo');
    if (mat === 'pedra') {
      // (a polished-and-knapped celt through a mortise in the swollen top of the haft, lashed with rawhide above and below)
      haft(M, -0.14, 0.6, 0.0175, 0.0165, { knob: 0.35, bend: [0, -0.012] });
      if (q < 2) lathe(M, [[0.019, 0.47], [0.026, 0.51], [0.028, 0.55], [0.025, 0.6], [0.017, 0.625]], seg(M, 10, 6), PAL.madeira, { cap0: true, cap1: true });
      part(M, 'cabeca');
      const zs = q === 0 ? [-0.045, -0.025, 0.0, 0.03, 0.06, 0.09, 0.115, 0.132] : q === 1 ? [-0.04, 0.02, 0.08, 0.132] : [-0.04, 0.132];
      loft(M, zs.map(z => [0, 0.545, z]), (k, t) => { const z = zs[k]; const s = sstep(-0.045, 0.132, z); return blade(lerp(0.03, 0.046, s), lerp(0.022, 0.003, Math.pow(s, 0.85)), q === 0 ? 4 : q === 1 ? 3 : 2, true, true); },
        PAL.pedra, { axis: [0, 0, 1], ax: [-1, 0, 0], flat: true, jit: q === 0 ? 0.14 : 0, cap0: true, cap1: [0, 0.545, 0.14], f: (k, t, j, u, v, p) => ({ e: sstep(0.1, 0.13, p[2]) }) });
      if (q < 2) { part(M, 'amarra'); wrap(M, 0.495, 0.52, 0.026, PAL.cru, { turns: 3 }); wrap(M, 0.57, 0.597, 0.027, PAL.cru, { turns: 3 }); }
      dark(M, [0, 0.545, 0.0], 0.05, 0.35); M.marks.centro = [0, 0.545, 0.06]; M.marks.ponta = [0, 0.545, 0.14];
      return;
    }
    const br = mat === 'bronze', me = metal(mat);
    haft(M, -0.15, 0.6, 0.0175, 0.0155, { knob: 0.4, bend: [0, -0.014], top: true });
    part(M, 'cabeca');
    if (br) {
      // (a cast shaft-hole axe: a socket tube down the haft, the blade flaring to a crescent edge, a rib down its middle)
      lathe(M, [[0.021, 0.475], [0.024, 0.485], [0.0235, 0.585], [0.02, 0.595]], seg(M, 12, 7, 4), me, { cap0: true, cap1: true });
      const zs = q === 0 ? [0.0, 0.025, 0.05, 0.075, 0.095, 0.108, 0.116] : q === 1 ? [0.0, 0.045, 0.09, 0.116] : [0.0, 0.116];
      loft(M, zs.map(z => [0, 0.535, z]), (k) => { const z = zs[k], s = clamp(z / 0.116, 0, 1); return blade(lerp(0.028, 0.068, Math.pow(s, 1.6)), lerp(0.011, 0.002, s), seg(M, 5, 3, 2), true, true, q === 0 ? 0.35 : 0); },
        me, { axis: [0, 0, 1], ax: [-1, 0, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ e: sstep(0.095, 0.116, p[2]) }) });
      if (q < 2) box(M, [0, 0.535, -0.03], [0.014, 0.018, 0.012], 0.006, me, { along: 'z' });
      M.marks.centro = [0, 0.535, 0.07]; M.marks.ponta = [0, 0.535, 0.116];
    } else {
      // (a bearded iron head: the eye round the haft, the poll behind, the blade dropping in a beard to a long edge)
      lathe(M, [[0.021, 0.5], [0.023, 0.508], [0.023, 0.582], [0.021, 0.59]], seg(M, 12, 7, 4), me, { cap0: true, cap1: true, at: [0, 0, -0.002], f: () => ({ ao: 0.9 }) });
      const zs = q === 0 ? [-0.034, -0.02, 0.0, 0.022, 0.045, 0.065, 0.085, 0.1, 0.11, 0.116] : q === 1 ? [-0.034, 0.0, 0.045, 0.085, 0.116] : [-0.03, 0.116];
      const top = z => 0.588 + 0.008 * sstep(0.03, 0.116, z), bot = z => z < 0.025 ? 0.505 : lerp(0.505, 0.425, Math.pow(sstep(0.025, 0.116, z), 1.4));
      const th = z => (z < 0.012 ? 0.02 : lerp(0.014, 0.0016, Math.pow(sstep(0.012, 0.116, z), 0.75)));
      loft(M, zs.map(z => [0, (top(z) + bot(z)) / 2, z]), (k) => { const z = zs[k]; const h = (top(z) - bot(z)) / 2; return blade(h, th(z), seg(M, 5, 3, 2), z >= 0.01, z >= 0.01); },
        me, { axis: [0, 0, 1], ax: [-1, 0, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ e: sstep(0.1, 0.116, p[2]) * 0.9 }) });
      M.marks.centro = [0, 0.52, 0.07]; M.marks.ponta = [0, 0.5, 0.116];
    }
    dark(M, [0, 0.545, 0], 0.05, 0.3);
  };

  // the pick: both hands at the haft's foot, the head across its top — the point forward (+Z)
  R.picareta = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.24, 0.74, 0.0185, 0.019, { knob: 0.25, grip: [-0.24, 0.06] }); M.grip = [0, -0.19, 0];
    part(M, 'cabeca'); const y = 0.7;
    if (mat === 'pedra') {
      // (a long pecked point lashed across the haft's split top in a figure of eight)
      const zs = q === 0 ? [-0.09, -0.06, -0.02, 0.03, 0.08, 0.13, 0.17, 0.2] : q === 1 ? [-0.09, -0.02, 0.08, 0.2] : [-0.09, 0.2];
      loft(M, zs.map(z => [0, y + 0.012 - 0.03 * sstep(0.05, 0.2, z), z]), (k) => { const z = zs[k]; const s = clamp((z + 0.09) / 0.29, 0, 1); const r = 0.026 * Math.sin(Math.PI * Math.min(1, 0.25 + s * 0.85)) + 0.004; return circ(r, seg(M, 7, 5, 4), r * 0.82); },
        PAL.pedra, { axis: [0, 0, 1], flat: true, jit: q === 0 ? 0.25 : 0, cap0: [0, y + 0.012, -0.1], cap1: [0, y - 0.022, 0.215] });
      if (q < 2) { part(M, 'amarra'); wrap(M, y - 0.04, y + 0.04, 0.02, PAL.cru, { turns: 5 }); loft(M, [[0, y - 0.035, -0.035], [0, y, 0.0], [0, y + 0.035, 0.035]], () => circ(0.006, 5), PAL.cru, { cap0: true, cap1: true }); }
      M.marks.ponta = [0, y - 0.022, 0.215];
    } else {
      const me = metal(mat), br = mat === 'bronze';
      // (the eye round the haft, a long point forward curving down; behind, a chisel (iron) or a hammer butt (bronze))
      box(M, [0, y, 0], [0.023, 0.032, 0.026], 0.007, me, { along: 'z' });
      const zf = q === 0 ? [0.02, 0.06, 0.1, 0.14, 0.18, 0.22, 0.25] : q === 1 ? [0.02, 0.11, 0.2, 0.25] : [0.02, 0.25];
      loft(M, zf.map(z => [0, y - 0.045 * Math.pow(clamp((z - 0.02) / 0.23, 0, 1), 2), z]), (k) => { const s = clamp((zf[k] - 0.02) / 0.23, 0, 1); const r = lerp(0.016, 0.004, Math.pow(s, 0.9)); return rrect(r, r * 1.15, r * 0.5, seg(M, 1, 1, 0)); },
        me, { axis: [0, 0, 1], cap0: true, cap1: [0, y - 0.045, br ? 0.255 : 0.262], tipEdge: true, f: (k, t, j, u, v, p) => ({ e: sstep(0.2, 0.26, p[2]) }) });
      if (br && q < 2) lathe(M, [[0.017, -0.02], [0.02, -0.07], [0.022, -0.095], [0.019, -0.1]], seg(M, 10, 6, 4), me, { at: [0, y, 0], axis: [0, 0, 1], cap0: true, cap1: true });
      else if (!br) { const zb = q === 0 ? [-0.02, -0.07, -0.12, -0.16, -0.18] : [-0.02, -0.11, -0.18]; loft(M, zb.map(z => [0, y + 0.02 * sstep(-0.06, -0.18, z), z]), (k) => { const s = clamp((-zb[k] - 0.02) / 0.16, 0, 1); return rrect(lerp(0.015, 0.024, s), lerp(0.016, 0.0025, s), 0.003, seg(M, 1, 1, 0)); }, me, { axis: [0, 0, -1], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ e: sstep(-0.15, -0.18, p[2]) }) }); }
      M.marks.ponta = [0, y - 0.045, 0.26];
    }
    M.marks.centro = [0, y, 0.05]; dark(M, [0, y, 0], 0.05, 0.3);
  };

  // the spade: the main hand on the shaft, the other on the T at its top (−Y); the blade at +Y, its face to +Z
  R.pa = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.52, 0.42, 0.0165, 0.017, { grip: [-0.06, 0.06], top: false }); M.grip = [0, -0.555, 0];
    lathe(M, [[0.016, -0.066], [0.0185, -0.05], [0.0185, 0.05], [0.016, 0.066]], seg(M, 8, 6, 4), PAL.madeira, { axis: [1, 0, 0], at: [0, -0.548, 0], cap0: true, cap1: true, ph: 0.5 / 8 }); // (the T's crossbar across X)
    part(M, 'cabeca');
    const wood = mat === 'madeira', me = metal(mat);
    const yb = 0.42, ye = 0.72; const ys = q === 0 ? [yb, 0.45, 0.5, 0.56, 0.62, 0.67, 0.7, ye] : q === 1 ? [yb, 0.5, 0.62, ye] : [yb, ye];
    const wOf = y => { const t = (y - yb) / (ye - yb); return lerp(0.085, 0.095, sstep(0, 0.25, t)) * (t > 0.82 ? Math.sqrt(Math.max(0.05, 1 - Math.pow((t - 0.82) / 0.18, 2) * 0.55)) : 1); };
    const dish = (x) => -0.012 * (x / 0.1) * (x / 0.1);
    const blad = (thk, mm, y0, y1, o2) => { const yy = ys.filter(y => y >= y0 - 1e-9 && y <= y1 + 1e-9); return loft(M, yy.map(y => [0, y, 0]), (k) => { const y = yy[k]; const w = wOf(y); const t = thk * lerp(1, 0.55, (y - yb) / (ye - yb)); const s = blade(w, t, seg(M, 6, 3, 1), false, false); return s.map(([u, v, f]) => [v, u + dish(v), f]); }, mm, Object.assign({ axis: [0, 1, 0], cap0: true, cap1: true }, o2)); };
    if (wood || mat === 'bronze') {
      // (a blade of split wood; the bronze one shod at its foot with a sheath of bronze)
      blad(0.011, PAL.clara, yb, ye, { f: (k, t, j, u, v, p) => ({ ao: 1 - 0.25 * sstep(0.62, 0.72, p[1]) }) });
      if (!wood && q < 2) { const ys2 = q === 0 ? [0.63, 0.66, 0.7, ye + 0.006] : [0.63, ye + 0.006]; loft(M, ys2.map(y => [0, y, 0]), (k) => { const y = Math.min(ys2[k], ye); const s = blade(wOf(y) + 0.003, 0.0085, seg(M, 6, 3, 1), false, false); return s.map(([u, v, f]) => [v, u * 1.05 + dish(v), f]); }, me, { axis: [0, 1, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ e: sstep(0.69, 0.725, p[1]) }) }); }
      if (q < 2) wrap(M, 0.395, 0.44, 0.019, PAL.cru, { turns: 4 });
    } else {
      // (a forged blade with its tread rolled at the shoulders, on a socket round the shaft)
      if (q < 2) collar(M, 0.39, 0.07, 0.0205, me);
      blad(0.0045, me, yb, ye, { f: (k, t, j, u, v, p) => ({ e: sstep(0.68, 0.72, p[1]) }) });
      if (q === 0) loft(M, [[-0.095, yb + 0.004, 0], [0.095, yb + 0.004, 0]], () => circ(0.005, 6), me, { cap0: true, cap1: true });
    }
    M.marks.centro = [0, 0.58, 0]; M.marks.ponta = [0, ye, 0];
  };

  // the hoe: the shaft long, the blade at its top bent back toward the user (+Z and down)
  R.enxada = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.36, 0.96, 0.0165, 0.0165, { grip: [-0.34, 0.06], bend: [0, 0.01] }); M.grip = [0, -0.3, 0];
    part(M, 'cabeca'); const wood = mat === 'madeira', me = wood ? PAL.escura : metal(mat);
    const d = nrm([0, -0.4, 1]); const o0 = [0, 0.935, 0.012];
    if (!wood) lathe(M, [[0.021, 0.905], [0.0235, 0.912], [0.0235, 0.955], [0.021, 0.962]], seg(M, 10, 6, 4), me, { cap0: true, cap1: true });
    else if (q < 2) wrap(M, 0.88, 0.95, 0.019, PAL.corda, { turns: 6 });
    const ts = q === 0 ? [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1] : q === 1 ? [0, 0.4, 0.8, 1] : [0, 1];
    const Lb = 0.16, th = wood ? 0.014 : mat === 'bronze' ? 0.007 : 0.005;
    loft(M, ts.map(t => add(o0, mul(d, t * Lb))), (k, t) => { const tt = ts[k]; const w = lerp(0.03, 0.085, Math.pow(tt, 0.7)); const s = blade(w, th * lerp(1.4, 0.45, tt), seg(M, 5, 3, 1), false, false); return s.map(([u, v, f]) => [v, u, f]); },
      me, { ax: [1, 0, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ e: wood ? 0 : sstep(0.85, 1, ts[k]) }) });
    M.marks.ponta = add(o0, mul(d, Lb)); M.marks.centro = add(o0, mul(d, Lb * 0.6)); dark(M, [0, 0.93, 0.01], 0.04, 0.3);
  };

  // the sickle: a short handle; the blade rises from it and curves forward in a crescent, its edge on the inside
  R.foice = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.07, 0.085, 0.0165, 0.0145, { knob: 0.3, grip: [-0.07, 0.085] });
    const C = [0, 0.19, 0.115], Rr = 0.125; const th0 = 200, th1 = -15; const na = seg(M, 14, 7, 3);
    const arc = []; for (let i = 0; i <= na; i++) { const a = (th0 + (th1 - th0) * i / na) * Math.PI / 180; arc.push([0, C[1] + Math.sin(a) * Rr, C[2] + Math.cos(a) * Rr]); }
    const path = [[0, 0.08, 0.0], [0, 0.11, 0.0]].concat(arc.slice(1));
    const wOf = t => (t < 0.08 ? 0.012 : lerp(0.016, 0.0015, Math.pow(clamp((t - 0.08) / 0.92, 0, 1), 1.6)));
    if (mat === 'pedra') {
      // (a crescent of wood with a row of flint teeth set in its inner edge)
      part(M, 'cabeca');
      loft(M, path, (k, t) => circ(0.011 * (1 - 0.6 * t), seg(M, 6, 5, 4), 0.016 * (1 - 0.5 * t)), PAL.madeira, { ax: [1, 0, 0], cap0: true, cap1: true });
      if (q < 2) for (let i = 2; i < arc.length - 1; i += (q === 0 ? 2 : 3)) { const p = arc[i]; const toC = nrm(sub(C, p)); const c0 = add(p, mul(toC, 0.014)); loft(M, [add(c0, mul(toC, -0.006)), add(c0, mul(toC, 0.006))], (k) => blade(k ? 0.005 : 0.009, 0.004, 2, true, true), PAL.pedra, { flat: true, cap0: true, cap1: add(c0, mul(toC, 0.011)), tipEdge: true }); }
    } else {
      const me = metal(mat);
      if (q < 2) collar(M, 0.085, 0.018, 0.0165, me);
      part(M, 'cabeca');
      // (the blade: its back on the outside of the curve, the honed edge on the inside, toward the curve's middle)
      loft(M, path, (k, t) => { const w = wOf(t); const s = blade(w, mat === 'bronze' ? 0.0035 : 0.0026, seg(M, 4, 2, 1), false, true, mat === 'bronze' && q === 0 ? 0.25 : 0); return s; },
        me, { ax: [1, 0, 0], cap0: true, cap1: [0, arc[na][1] - 0.002, arc[na][2] - 0.004], f: (k, t, j, u, v) => ({ e: v > 0.0 ? sstep(0, 0.6, v / Math.max(1e-4, wOf(t))) : 0 }) });
    }
    M.marks.ponta = arc[na]; M.marks.centro = [0, C[1] + 0.08, C[2]];
  };

  // the hammer: a head across the haft's top, its face forward (+Z)
  R.martelo = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.11, 0.345, 0.0155, 0.0145, { knob: 0.25, oval: 1.15 });
    part(M, 'cabeca'); const y = 0.31;
    if (mat === 'pedra') {
      // (a river cobble, pecked round, lashed in the split top of the haft)
      ball(M, [0, y, 0.008], [0.034, 0.036, 0.064], seg(M, 12, 8, 4), PAL.seixo, { axis: [0, 0, 1] });
      if (q < 2) { part(M, 'amarra'); wrap(M, y - 0.05, y - 0.025, 0.019, PAL.cru, { turns: 3 }); loft(M, [[0.036, y + 0.03, -0.012], [0.036, y - 0.03, 0.012]], () => circ(0.005, 5), PAL.cru, { cap0: true, cap1: true }); loft(M, [[-0.036, y + 0.03, -0.012], [-0.036, y - 0.03, 0.012]], () => circ(0.005, 5), PAL.cru, { cap0: true, cap1: true }); }
      M.marks.ponta = [0, y, 0.072];
    } else {
      const me = metal(mat), br = mat === 'bronze';
      const zs = q === 0 ? (br ? [-0.06, -0.054, -0.04, 0.0, 0.04, 0.054, 0.06] : [-0.07, -0.05, -0.02, 0.0, 0.03, 0.05, 0.058, 0.064]) : q === 1 ? [-0.065, 0.0, 0.06] : [-0.065, 0.062];
      loft(M, zs.map(z => [0, y, z]), (k) => { const z = zs[k]; let h = 0.022; if (br) h = 0.021 + 0.004 * sstep(0.035, 0.06, Math.abs(z)); else { if (z < -0.02) h = lerp(0.022, 0.004, sstep(-0.02, -0.07, z)); if (z > 0.05) h = 0.022 - 0.003 * sstep(0.05, 0.064, z); }
        const hx = br ? h : z < -0.02 ? 0.022 : h; return rrect(hx, h, Math.min(hx, h) * 0.32, seg(M, 1, 1, 0)); }, me, { axis: [0, 0, 1], ax: [-1, 0, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ e: sstep(0.045, 0.062, Math.abs(p[2])) * (br ? 0.8 : p[2] > 0 ? 0.9 : 0.5) }) });
      if (br && q < 2) collar(M, y - 0.03, 0.014, 0.019, me);
      M.marks.ponta = [0, y, 0.064];
    }
    M.marks.centro = [0, y, 0]; dark(M, [0, y, 0], 0.045, 0.3);
  };

  // the knife: the handle, a bolster, a blade of about fifteen centimetres — its edge at +Z, its spine at −Z
  R.faca = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.065, 0.062, 0.0125, 0.0115, { oval: 1.25, knob: 0.15, wood: mat === 'pedra' ? 'madeira' : 'escura', grip: [-0.065, 0.062] });
    const me = mat === 'pedra' ? PAL.pedra : metal(mat);
    if (mat !== 'pedra' && q < 2) { part(M, 'cabo'); lathe(M, [[0.0118, 0.054], [0.0135, 0.058], [0.0135, 0.07], [0.011, 0.074]], seg(M, 10, 6, 4), me, { cap0: true, cap1: true }); }
    part(M, 'cabeca');
    const y0 = 0.07, y1 = mat === 'pedra' ? 0.2 : 0.225; const ys = q === 0 ? [0, 0.12, 0.3, 0.5, 0.68, 0.82, 0.92] : q === 1 ? [0, 0.35, 0.7, 0.9] : [0, 0.9];
    const sha = (t) => {
      if (mat === 'ferro') { const sp = t < 0.62 ? -0.011 : lerp(-0.011, 0.006, sstep(0.62, 1, t)); const ed = lerp(0.014, 0.008, Math.pow(t, 3)) - 0.006 * sstep(0.8, 1, t); return [sp, ed]; } // (a broken back: the spine angles down to the point)
      if (mat === 'bronze') { const w = 0.012 + 0.004 * Math.sin(Math.PI * Math.min(1, t * 1.6)) - 0.01 * sstep(0.6, 1, t); return [-w, w]; } // (leaf-shaped)
      const w = 0.012 * (1 - Math.pow(t, 1.8)) + 0.002; return [-w * 0.9, w];
    };
    loft(M, ys.map(t => { const [a, b] = sha(t); return [0, lerp(y0, y1, t), (a + b) / 2]; }), (k) => { const t = ys[k]; const [a, b] = sha(t); const w = (b - a) / 2; return blade(w, mat === 'pedra' ? 0.0045 : 0.0032 * (1 - 0.4 * t), seg(M, 4, 2, 1), mat !== 'ferro', true, mat === 'bronze' && q === 0 ? 0.3 : 0); },
      me, { axis: [0, 1, 0], ax: [1, 0, 0], flat: mat === 'pedra', jit: mat === 'pedra' && q === 0 ? 0.15 : 0, cap0: true, cap1: [0, y1, mat === 'ferro' ? 0.0045 : 0.001], tipEdge: true, f: (k, t, j, u, v) => ({ e: v > 0 ? 0.85 : mat === 'ferro' ? 0 : 0.5 }) });
    if (mat === 'pedra' && q < 2) { part(M, 'amarra'); wrap(M, 0.05, 0.08, 0.0128, PAL.cru, { turns: 3 }); }
    M.marks.ponta = [0, y1, 0.002]; M.marks.centro = [0, (y0 + y1) / 2, 0.003];
  };

  // the fishing rod: a cane of nodes, long and whippy, the line along it from the winder at the butt to the tip
  R.vara = (M) => {
    const q = M.q; part(M, 'cabo');
    const y0 = -0.3, y1 = 2.3; const rad = y => lerp(0.0165, 0.0032, Math.pow((y - y0) / (y1 - y0), 0.85));
    const pts = []; const n = seg(M, 26, 9, 2); for (let k = 0; k <= n; k++) { const t = k / n; const y = lerp(y0, y1, t); pts.push([0, y, 0.035 * t * t]); }
    const nodes = [0.25, 0.62, 1.0, 1.38, 1.76];
    const cane = pp => loft(M, pp, (k, t) => { const y = pp[k][1]; let r = rad(y); if (q === 0) for (const nd of nodes) r *= 1 + 0.18 * Math.exp(-Math.pow((y - nd) / 0.018, 2)); return circ(r, seg(M, 8, 5, 4)); }, PAL.clara, { cap0: true, cap1: true,
      f: (k, t, j, u, v, p) => { let nd = 0; for (const z of nodes) nd = Math.max(nd, Math.exp(-Math.pow((p[1] - z) / 0.02, 2))); return { ao: 1 - 0.3 * nd, gl: 1.5 }; } });
    // (two lengths of cane meeting at the node at 1 m — the hand's half, and the tip's: the working end)
    const mid = [0, 1.0, 0.035 * Math.pow((1.0 - y0) / (y1 - y0), 2)];
    cane(pts.filter(p => p[1] < 0.999).concat([mid])); part(M, 'cabeca'); cane([mid].concat(pts.filter(p => p[1] > 1.001)));
    if (q < 2) { part(M, 'amarra'); wrap(M, -0.08, 0.1, 0.017, PAL.corda, { turns: 8 }); }
    if (q === 0) {
      part(M, 'corda');
      // (the line wound on the winder above the grip, and along the cane to its tip)
      lathe(M, [[0.019, 0.12], [0.0235, 0.125], [0.0235, 0.155], [0.019, 0.16]], 10, PAL.linha, { cap0: true, cap1: true });
      loft(M, [[0, 0.16, 0.019], [0, 1.2, 0.009 + 0.035 * 0.36], [0, y1, 0.0035 + 0.035]], () => circ(0.0011, 3), PAL.linha, { cap0: true, cap1: true });
    }
    M.marks.linha = [0, y1, 0.035]; M.marks.ponta = M.marks.linha; M.marks.centro = [0, 1.0, 0.01];
  };

  // the cast net, gathered in the hand: the hand line's loop at the grip, the neck bound, the net in folds below with its
  // lead weights round the foot; near, the twine itself in a diamond lattice over the dark of the folds inside; the other
  // hand takes the bundle halfway down
  R.rede = (M) => {
    const q = M.q; part(M, 'cabo');
    lathe(M, [[0.012, -0.03], [0.022, -0.01], [0.026, 0.02], [0.03, 0.08], [0.034, 0.12]], seg(M, 10, 6, 4), PAL.corda, { cap0: [0, -0.04, 0], cap1: true, f: () => ({ wrap: 0.01 }) });
    part(M, 'cabeca');
    const nf = 7, nu = seg(M, 24, 16, 7), nv = seg(M, 11, 6, 2);
    const rOf = (s, t) => { const base = lerp(0.032, 0.19, Math.pow(t, 0.8)); const fold = 1 + (0.24 * t + 0.05) * Math.cos(s * TAU * nf + t * 1.6 + 0.4 * Math.sin(s * 9)) + 0.07 * Math.sin(s * TAU * 3 + 1.3) * t; return base * fold; };
    const yOf = (s, t) => lerp(0.11, 0.92, t) + 0.04 * t * Math.sin(s * TAU * 2 + 0.5);
    const at = (s, t, o) => { const r = rOf(s, t) + (o || 0); return [Math.cos(s * TAU) * r, yOf(s, t), Math.sin(s * TAU) * r * 0.85]; };
    const fold = (s, t) => 0.5 + 0.5 * Math.cos(s * TAU * nf + t * 1.6 + 0.4 * Math.sin(s * 9));
    grid(M, nu, nv, (s, t) => at(s, t), PAL.rede, { loopU: true, inside: [0, 0.5, 0], f: (s, t) => ({ ao: (q === 0 ? 0.42 : 0.62) + (q === 0 ? 0.2 : 0.38) * fold(s, t), w: q === 0 ? -1 : Math.cos((s * 9 + t * 4) * TAU) * Math.cos((s * 9 - t * 4) * TAU) }) });
    // (the foot of the net closed: the bundle is one mass to the drawer, the weights round it)
    grid(M, nu, 2, (s, t) => { const r = rOf(s, 1) * t; return [Math.cos(s * TAU) * r, yOf(s, 1) + 0.02 * (1 - t), Math.sin(s * TAU) * r * 0.85]; }, PAL.rede, { loopU: true, apex0: true, inside: [0, 0.5, 0], f: () => ({ ao: 0.4 }) });
    if (q === 0) {
      // (the twine: two families of strands winding round the bundle, crossing in diamonds — each a narrow ribbon over the folds)
      const ns = 12, nk = 12, turn = 0.3, w = 0.0055;
      for (const d of [1, -1]) for (let i = 0; i < ns; i++) grid(M, 1, nk, (u, t) => { const tt = lerp(0.03, 0.99, t); const s0 = i / ns + d * tt * turn; const p = at(s0, tt, 0.005), p2 = at(s0 + d * 0.01 * turn, tt + 0.01, 0.005); const T = nrm(sub(p2, p)); const side = nrm(crs(T, [Math.cos(s0 * TAU), 0, Math.sin(s0 * TAU)])); return add(p, mul(side, (u - 0.5) * w)); },
        PAL.rede, { inside: [0, 0.5, 0], f: () => ({ w: 1, ao: 1 }) });
    }
    if (q < 2) { part(M, 'amarra'); const nw = q === 0 ? 10 : 6; for (let i = 0; i < nw; i++) { const s = (i + 0.5) / nw; const r = rOf(s, 1) + 0.004; ball(M, [Math.cos(s * TAU) * r, yOf(s, 1) + 0.008, Math.sin(s * TAU) * r * 0.85], [0.011, 0.014, 0.011], 5, PAL.chumbo); } }
    M.grip = [0, 0.5, 0]; M.marks.centro = [0, 0.55, 0]; M.marks.ponta = [0, 0.92, 0];
  };

  // the oar: the other hand at the handle's end (−Y), the main on the loom; the blade at +Y, its face to +Z
  R.remo = (M) => {
    const q = M.q; part(M, 'cabo');
    const prof = q === 2 ? [[0.019, -0.62], [0.021, 1.12]] : [[0.012, -0.64], [0.0175, -0.63], [0.0185, -0.6], [0.0175, -0.5], [0.021, -0.44], [0.0225, -0.1], [0.022, 0.4], [0.02, 0.85], [0.018, 1.12], [0.017, 1.18]];
    lathe(M, prof, seg(M, 10, 6, 4), PAL.clara, { cap0: true, cap1: true, f: (k, t, j, u, v, p) => { const w = 1 - sstep(-0.5, -0.45, p[1]) + (1 - sstep(0.06, 0.1, Math.abs(p[1]))); return { ao: 1 - 0.12 * Math.min(1, w), gl: 1 + 1.4 * Math.min(1, w) }; } });
    if (q < 2) wrap(M, 0.3, 0.44, 0.0222, PAL.couro, { turns: 1 });
    M.grip = [0, -0.57, 0];
    part(M, 'cabeca');
    const ys = q === 0 ? [1.12, 1.2, 1.3, 1.42, 1.55, 1.66, 1.72, 1.75] : q === 1 ? [1.12, 1.3, 1.6, 1.75] : [1.12, 1.75];
    const wOf = y => { const t = (y - 1.12) / 0.63; return lerp(0.018, 0.074, sstep(0, 0.35, t)) * (t > 0.85 ? Math.sqrt(Math.max(0.1, 1 - Math.pow((t - 0.85) / 0.15, 2) * 0.7)) : 1); };
    loft(M, ys.map(y => [0, y, 0]), (k) => { const y = ys[k]; const w = wOf(y); const t = lerp(0.017, 0.0065, sstep(1.12, 1.3, y)); const s = blade(w, t, seg(M, 6, 3, 1), false, false, q === 0 ? 0.4 * sstep(1.2, 1.12, y) + 0.25 : 0); return s.map(([u, v, f]) => [v, u, f]); },
      PAL.clara, { axis: [0, 1, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ ao: 1 - 0.18 * sstep(1.6, 1.75, p[1]) }) });
    M.marks.centro = [0, 1.45, 0]; M.marks.ponta = [0, 1.75, 0];
  };

  // the elder's staff: as tall as the shoulder, gnarled, gripped near its knobbed top
  R.cajado = (M) => {
    const q = M.q; part(M, 'cabo'); const n = seg(M, 26, 9, 2); const pts = [];
    for (let k = 0; k <= n; k++) { const t = k / n; const y = lerp(-1.32, 0.24, t); pts.push([0.01 * Math.sin(t * 7.1 + 1) + 0.006 * Math.sin(t * 17), y, 0.012 * Math.sin(t * 5.3 + 2) + 0.005 * Math.cos(t * 13)]); }
    const knots = [0.12, 0.43, 0.71, 0.9];
    loft(M, pts, (k, t) => { let r = lerp(0.0165, 0.02, t); if (q === 0) for (const kn of knots) r *= 1 + 0.16 * Math.exp(-Math.pow((t - kn) / 0.012, 2)); return circ(r, seg(M, 9, 6, 4), r * 0.94); }, PAL.escura, { cap0: true, cap1: false,
      f: (k, t, j, u, v, p) => { let kn = 0; for (const z of knots) kn = Math.max(kn, Math.exp(-Math.pow((t - z) / 0.014, 2))); const w = sstep(-0.09, -0.05, p[1]) * (1 - sstep(0.06, 0.1, p[1])); return { ao: 1 - 0.28 * kn - 0.1 * w, gl: 1 + 1.8 * w }; } });
    part(M, 'cabeca');
    ball(M, add(pts[n], [0, 0.022, 0]), [0.031, 0.033, 0.029], seg(M, 12, 8, 4), PAL.escura, { f: () => ({ gl: 2 }) });
    M.marks.ponta = [pts[0][0], -1.32, pts[0][2]]; M.marks.centro = add(pts[n], [0, 0.02, 0]);
  };

  // the torch: a stick, and at its top the rag wound tight and soaked in pitch; the flame is the drawer's (marks.chama)
  R.tocha = (M) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.22, 0.3, 0.0155, 0.0175, { top: false });
    part(M, 'cabeca');
    const prof = q === 2 ? [[0.024, 0.28], [0.03, 0.4], [0.02, 0.47]] : [[0.019, 0.272], [0.026, 0.285], [0.029, 0.32], [0.032, 0.37], [0.031, 0.42], [0.026, 0.455], [0.018, 0.475]];
    lathe(M, q === 0 ? prof.flatMap(([r, y], i) => (i % 2 ? [[r, y]] : [[r, y], [r * 0.95, y + 0.012]])).sort((a, b) => a[1] - b[1]) : prof, seg(M, 11, 7, 4), PAL.piche, { cap0: true, cap1: [0, 0.484, 0],
      m: (k, t) => (t < 0.35 ? PAL.pano : PAL.piche), f: (k, t, j, u, v, p) => ({ ao: 0.8 + 0.2 * Math.cos(p[1] * 260 + j), wrap: 0.012 }) });
    if (q < 2) collar(M, 0.282, 0.008, 0.0205, PAL.corda);
    M.marks.chama = [0, 0.5, 0]; M.marks.ponta = M.marks.chama; M.marks.centro = [0, 0.38, 0];
  };

  // the basket: an arched handle of bound withies through the fist (along Y); the basket hangs toward +Z, its mouth to the
  // hand — the stakes and the woven rows of the wicker, its rolled rim
  R.cesto = (M) => {
    const q = M.q; part(M, 'cabo');
    const nh = seg(M, 14, 7, 2); const hp = []; for (let i = 0; i <= nh; i++) { const a = Math.PI * i / nh; hp.push([0, -Math.cos(a) * 0.175, 0.165 - Math.sin(a) * 0.17]); }
    tube(M, hp, 0.011, seg(M, 8, 5, 4), PAL.vime, { cap0: true, cap1: true, f: () => ({ wrap: 0.014 }) });
    part(M, 'cabeca');
    const nu = seg(M, 28, 14, 6), rows = seg(M, 11, 4, 1);
    const rim = 0.165, bot = 0.44, RY = z => lerp(0.19, 0.145, Math.pow((z - rim) / (bot - rim), 1.6)), RX = z => RY(z) * 0.74;
    const weave = (s, t) => (q === 0 ? (((Math.floor(s * 32) + Math.floor(t * 11)) % 2) ? 1 : -1) : 0);
    // (the outside, then the inside a little smaller and darker, the floor, and the rim rolled over the two)
    grid(M, nu, rows, (s, t) => { const z = lerp(rim + 0.012, bot, t); const w = q === 0 ? 0.0025 * weave(s, t) : 0; return [Math.sin(s * TAU) * (RX(z) + w), Math.cos(s * TAU) * (RY(z) + w), z]; }, PAL.vime, { loopU: true, inside: [0, 0, 0.3], f: (s, t) => ({ w: weave(s, t), ao: 1 - 0.18 * t }) });
    grid(M, nu, 1, (s, t) => [Math.sin(s * TAU) * RX(bot) * t, Math.cos(s * TAU) * RY(bot) * t, bot], PAL.vime, { loopU: true, apex0: true, out: [0, 0, 1], f: () => ({ ao: 0.7 }) });
    if (q < 2) { const zf = bot - 0.012; grid(M, nu, 2, (s, t) => { const z = lerp(rim + 0.012, zf, t); return [Math.sin(s * TAU) * (RX(z) - 0.008), Math.cos(s * TAU) * (RY(z) - 0.008), z]; }, PAL.vime, { loopU: true, dir: c => [-c[0], -c[1], 0], f: (s, t) => ({ ao: 0.5 - 0.16 * t }) });
      grid(M, nu, 1, (s, t) => [Math.sin(s * TAU) * (RX(zf) - 0.008) * t, Math.cos(s * TAU) * (RY(zf) - 0.008) * t, zf], PAL.vime, { loopU: true, apex0: true, out: [0, 0, -1], f: () => ({ ao: 0.32 }) }); }
    const rp = []; const nr = seg(M, 28, 14, 6); for (let i = 0; i < nr; i++) { const s = i / nr; rp.push([Math.sin(s * TAU) * (RX(rim) - 0.003), Math.cos(s * TAU) * (RY(rim) - 0.003), rim + 0.006]); }
    tube(M, rp, 0.0095, seg(M, 5, 4, 3), PAL.vime, { loop: true, f: () => ({ wrap: 0.01 }) });
    M.marks.centro = [0, 0, 0.3]; M.marks.ponta = [0, 0, bot];
  };

  // the bucket: staves bound by two iron hoops, two ears and a rope bail through the fist; it hangs toward +Z
  R.balde = (M) => {
    const q = M.q; part(M, 'cabo');
    const nh = seg(M, 14, 7, 2); const hp = []; for (let i = 0; i <= nh; i++) { const a = Math.PI * i / nh; hp.push([0, -Math.cos(a) * 0.148, 0.21 - Math.sin(a) * 0.212]); }
    tube(M, hp, 0.0085, seg(M, 7, 5, 4), PAL.corda, { cap0: true, cap1: true, f: () => ({ wrap: 0.008 }) });
    part(M, 'cabeca');
    const rim = 0.2, bot = 0.47, R0 = 0.132, R1 = 0.118; const nu = seg(M, 24, 12, 6);
    const staves = 12; const seam = s => { const f = (s * staves + 0.5) % 1; return Math.min(f, 1 - f) * 2; };
    const rOf = z => lerp(R0, R1, (z - rim) / (bot - rim));
    lathe(M, q === 0 ? [[R1 - 0.012, bot - 0.025], [R0 - 0.012, rim], [R0, rim], [rOf(0.25), 0.25], [rOf(0.33), 0.33], [rOf(0.41), 0.41], [R1, bot - 0.01], [R1 - 0.004, bot]] : [[R1 - 0.012, bot - 0.025], [R0 - 0.012, rim], [R0, rim], [R1, bot]], nu, PAL.clara,
      { axis: [0, 0, 1], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ ao: (k < 1 ? 0.22 : k < 2 ? 0.42 : 1) * (0.72 + 0.28 * sstep(0, 0.35, seam(j / nu))), w: 0 }) });
    if (q < 2) for (const z of [0.255, 0.425]) { const r = rOf(z) + 0.0035; lathe(M, [[r - 0.003, z - 0.011], [r, z - 0.009], [r, z + 0.009], [r - 0.003, z + 0.011]], nu, PAL.ferro, { axis: [0, 0, 1], cap0: true, cap1: true }); }
    // (the ears the bail is tied to: two staves standing up past the rim)
    if (q < 2) for (const sy of [-1, 1]) box(M, [0, sy * (R0 - 0.004), rim - 0.022], [0.016, 0.008, 0.026], 0.004, PAL.clara, { along: 'z' });
    M.marks.centro = [0, 0, 0.33]; M.marks.ponta = [0, 0, bot];
  };

  // the sword: the grip wrapped in cord, the pommel and the guard; the bronze a leaf-shaped blade with a rib, the iron a
  // straight one with a fuller — its edges at ±Z
  R.espada = (M, mat) => {
    const q = M.q, br = mat === 'bronze', me = metal(mat); part(M, 'cabo');
    if (br) {
      // (a cast hilt: the flanged grip in one with the blade, a lens pommel, the shoulders)
      lathe(M, [[0.0125, -0.055], [0.0148, -0.02], [0.0135, 0.03], [0.0152, 0.075]], seg(M, 10, 6, 4), PAL.escura, { cap0: true, cap1: true, ph: 0.05 });
      if (q < 2) wrap(M, -0.045, 0.07, 0.0148, PAL.couro, { turns: 9 });
      ball(M, [0, -0.07, 0], [0.012, 0.012, 0.026], seg(M, 10, 6, 4), me);
      box(M, [0, 0.088, 0], [0.012, 0.014, 0.03], 0.008, me, { taper: 0.8 });
    } else {
      lathe(M, [[0.0128, -0.052], [0.0142, -0.03], [0.0145, 0.03], [0.0132, 0.074]], seg(M, 10, 6, 4), PAL.escura, { cap0: true, cap1: true });
      if (q < 2) wrap(M, -0.048, 0.072, 0.0145, PAL.couro, { turns: 10 });
      // (a lobed pommel and a straight guard across the blade's edges)
      if (q === 0) { box(M, [0, -0.063, 0], [0.013, 0.011, 0.034], 0.006, me); for (const z of [-0.022, 0, 0.022]) ball(M, [0, -0.077, z], [0.012, 0.012, 0.011], 8, me); }
      else if (q === 1) box(M, [0, -0.068, 0], [0.013, 0.016, 0.032], 0.006, me);
      box(M, [0, 0.083, 0], [0.012, 0.009, 0.062], 0.005, me, { along: 'z' });
    }
    part(M, 'cabeca');
    const y0 = br ? 0.1 : 0.092, y1 = br ? 0.79 : 0.84; const ys = q === 0 ? [0, 0.08, 0.2, 0.35, 0.5, 0.62, 0.72, 0.82, 0.9, 0.96] : q === 1 ? [0, 0.3, 0.62, 0.88] : [0, 0.88];
    const wOf = t => (br ? (0.016 + 0.005 * Math.sin(Math.PI * clamp((t - 0.25) / 0.6, 0, 1)) - 0.002 * Math.sin(Math.PI * clamp(t / 0.25, 0, 1))) * (t > 0.82 ? Math.max(0.05, 1 - Math.pow((t - 0.82) / 0.18, 1.5)) : 1) : lerp(0.025, 0.02, t) * (t > 0.84 ? Math.max(0.05, 1 - Math.pow((t - 0.84) / 0.16, 1.4)) : 1));
    loft(M, ys.map(t => [0, lerp(y0, y1, t), 0]), (k) => { const t = ys[k]; const w = wOf(t); const th = br ? lerp(0.0055, 0.003, t) : lerp(0.0045, 0.0028, t); let s = blade(w, th, seg(M, 6, 3, 1), true, true, br && q < 2 ? 0.25 : 0);
      if (!br && q === 0 && t < 0.78) s = s.map(([u, v, f]) => [u * (1 - 0.42 * Math.exp(-Math.pow(v / (w * 0.32), 2))), v, f]); // (the fuller: a groove down each face)
      return s; }, me, { axis: [0, 1, 0], ax: [1, 0, 0], cap0: true, cap1: [0, y1 + 0.004, 0], tipEdge: true, f: (k, t, j, u, v) => ({ e: Math.abs(v) / Math.max(1e-4, wOf(ys[k])) > 0.55 ? 0.95 : 0 }) });
    dark(M, [0, y0, 0], 0.03, 0.25);
    M.marks.ponta = [0, y1 + 0.004, 0]; M.marks.centro = [0, lerp(y0, y1, 0.6), 0];
  };

  // the spear: an ash shaft of two metres gripped a little under its middle, the other hand half a metre behind; a binding
  // at each hand; the head — a knapped leaf, a socketed bronze leaf with its rib, a long iron leaf
  R.lanca = (M, mat) => {
    const q = M.q; part(M, 'cabo'); haft(M, -1.02, 0.88, 0.0148, 0.0138, { grip: [-0.5, 0.06] }); M.grip = [0, -0.46, 0];
    if (q < 2) { wrap(M, -0.055, 0.075, 0.0148, PAL.couro, { turns: 7, n: 8 }); if (q === 0) wrap(M, -0.52, -0.41, 0.0148, PAL.couro, { turns: 5, n: 8 }); }
    const me = mat === 'pedra' ? PAL.pedra : metal(mat);
    if (mat !== 'pedra' && q < 2) { lathe(M, [[0.014, -1.02], [0.0155, -1.04], [0.011, -1.1], [0.004, -1.13]], seg(M, 8, 5, 4), me, { cap0: [0, -1.135, 0], cap1: true }); }
    part(M, 'cabeca');
    let y0 = 0.88, y1;
    if (mat === 'pedra') {
      y1 = 1.07; if (q < 2) { part(M, 'amarra'); wrap(M, 0.84, 0.9, 0.0152, PAL.cru, { turns: 5 }); part(M, 'cabeca'); }
      const ys = q === 0 ? [0, 0.15, 0.35, 0.55, 0.75, 0.9] : q === 1 ? [0, 0.4, 0.8] : [0, 0.8];
      loft(M, ys.map(t => [0, lerp(y0 - 0.02, y1, t), 0]), (k) => { const t = ys[k]; const w = 0.023 * Math.sin(Math.PI * Math.min(1, 0.18 + t * 0.92)) + 0.002; return blade(w, 0.0068 * (1 - 0.5 * t), seg(M, 3, 2, 1), true, true); },
        me, { axis: [0, 1, 0], ax: [1, 0, 0], flat: true, jit: q === 0 ? 0.22 : 0, cap0: true, cap1: [0, y1, 0], tipEdge: true, f: (k, t, j, u, v) => ({ e: 0.4 }) });
    } else {
      const br = mat === 'bronze'; y1 = br ? 1.17 : 1.2;
      lathe(M, [[0.0145, 0.855], [0.0168, 0.86], [0.0162, 0.92], [0.0135, br ? 0.95 : 0.96]], seg(M, 10, 6, 4), me, { cap0: true, cap1: true });
      if (q === 0) { rivet(M, [0.016, 0.885, 0], [1, 0, 0], 0.0035); rivet(M, [-0.016, 0.885, 0], [-1, 0, 0], 0.0035); }
      const yb = br ? 0.93 : 0.945; const ys = q === 0 ? [0, 0.1, 0.25, 0.42, 0.6, 0.76, 0.9] : q === 1 ? [0, 0.35, 0.7, 0.9] : [0, 0.9];
      loft(M, ys.map(t => [0, lerp(yb, y1, t), 0]), (k) => { const t = ys[k]; const w = br ? 0.027 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.95)), 0.8) + 0.002 : 0.021 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.92)) + 0.0018; return blade(w, br ? 0.0075 * (1 - 0.6 * t) + 0.002 : 0.0062 * (1 - 0.5 * t) + 0.0015, seg(M, 5, 3, 1), true, true, q < 2 ? (br ? 0.55 : 0.9) : 0); },
        me, { axis: [0, 1, 0], ax: [1, 0, 0], cap0: true, cap1: [0, y1, 0], tipEdge: true, f: (k, t, j, u, v) => ({ e: Math.abs(v) > 0.012 ? 0.9 : 0 }) });
    }
    M.marks.ponta = [0, y1, 0]; M.marks.centro = [0, lerp(y0, y1, 0.55), 0]; dark(M, [0, 0.87, 0], 0.03, 0.25);
  };

  // the club: a thin grip swelling into a heavy knobbed head of root-wood
  R.clava = (M) => {
    const q = M.q; part(M, 'cabo'); haft(M, -0.12, 0.25, 0.0155, 0.019, { knob: 0.45, wood: 'escura', top: false });
    part(M, 'cabeca'); const n = seg(M, 13, 8, 4); const ys = q === 0 ? [0.22, 0.3, 0.38, 0.45, 0.52, 0.58, 0.63, 0.67, 0.69] : q === 1 ? [0.22, 0.36, 0.5, 0.62, 0.69] : [0.22, 0.45, 0.69];
    const rOf = y => { const t = (y - 0.22) / 0.47; return lerp(0.019, 0.054, sstep(0.05, 0.7, t)) * (t > 0.74 ? Math.sqrt(Math.max(0.12, 1 - Math.pow((t - 0.74) / 0.26, 2))) : 1); };
    loft(M, ys.map(y => [0, y, 0.006 * Math.sin(y * 9)]), (k) => { const y = ys[k]; const r = rOf(y); return circ(r, n).map(([u, v], j) => { const a = j / n * TAU; const kn = q === 0 ? 1 + 0.3 * Math.pow(Math.max(0, Math.sin(a * 3 + y * 31)) * Math.max(0, Math.sin(y * 40 + a)), 2) * sstep(0.33, 0.48, y) : 1; return [u * kn, v * kn, '']; }); },
      PAL.escura, { axis: [0, 1, 0], cap0: false, cap1: [0, 0.705, 0.004], f: (k, t, j, u, v, p) => ({ ao: 0.8 + 0.2 * Math.sin(j * 2.1 + k), gl: 1.5 }) });
    M.marks.centro = [0, 0.55, 0]; M.marks.ponta = [0, 0.7, 0];
  };

  // the bow: the bow hand on the riser (the origin), the limbs to ±Y bending back to the tips; the string behind the grip
  // (−Z) where the other hand draws it; the arrow flies +Z. Yew: pale sapwood on the back (+Z), dark heartwood on the belly
  R.arco = (M) => {
    const q = M.q; const ty = 0.74, tz = -0.165; part(M, 'cabo');
    const zOf = y => tz * Math.pow(Math.abs(y) / ty, 1.75);
    const n = seg(M, 22, 9, 3); const ys = []; for (let k = 0; k <= n; k++) ys.push(lerp(-ty, ty, k / n));
    if (q === 0) { ys.push(-0.075, 0.075, -0.06, 0.06); ys.sort((a, b) => a - b); }
    const wOf = y => { const a = Math.abs(y); return a < 0.06 ? 0.018 : lerp(0.02, 0.0085, Math.pow(sstep(0.06, ty, a), 0.9)); }, tOf = y => { const a = Math.abs(y); return a < 0.06 ? 0.03 : lerp(0.024, 0.011, sstep(0.06, ty, a)); };
    loft(M, ys.map(y => [0, y, zOf(y)]), (k) => { const y = ys[k]; return rrect(wOf(y), tOf(y) / 2, Math.min(wOf(y), tOf(y) / 2) * 0.85, seg(M, 2, 1, 0)); }, PAL.madeira, { ax: [1, 0, 0], cap0: true, cap1: true,
      m: (k, t, j) => PAL.madeira, f: (k, t, j, u, v) => ({ bow: v }) });
    if (q < 2) { part(M, 'amarra'); wrap(M, -0.065, 0.065, 0.0185, PAL.couro, { turns: 7 }); }
    part(M, 'corda');
    tube(M, [[0, -ty + 0.012, tz + 0.004], [0, 0, tz + 0.004], [0, ty - 0.012, tz + 0.004]], 0.0022, seg(M, 4, 3, 3), PAL.linha, { cap0: true, cap1: true });
    if (q === 0) for (const s of [-1, 1]) ball(M, [0, s * (ty - 0.015), zOf(ty - 0.015) + 0.002], [0.0085, 0.013, 0.0085], 6, PAL.escura);
    M.grip = [0, 0.01, tz + 0.004]; M.marks.corda = M.grip; M.marks.centro = [0, 0, 0]; M.marks.ponta = [0, ty, tz];
  };

  // the arrow: the nock at the origin (the drawing hand's), the shaft along +Y, three vanes — the cock dyed — and the head
  R.flecha = (M, mat) => {
    const q = M.q; part(M, 'cabo'); const y1 = 0.7;
    lathe(M, [[0.0035, -0.008], [0.0048, 0.0], [0.0043, 0.03], [0.0042, y1]], seg(M, 6, 5, 3), PAL.madeira, { cap0: [0, -0.01, 0], cap1: true, f: (k, t, j, u, v, p) => ({ ao: p[1] < 0.006 ? 0.55 : 1 }) });
    if (q < 2) { part(M, 'amarra');
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + Math.PI / 2; const d = [Math.cos(a), 0, Math.sin(a)]; const ys = q === 0 ? [0.03, 0.06, 0.1, 0.14, 0.165] : [0.03, 0.165]; const hOf = y => 0.012 * Math.sin(Math.PI * clamp((y - 0.03) / 0.135, 0, 1) * 0.85 + 0.15);
        const mm = i === 0 ? PAL.penaT : PAL.pena;
        loft(M, ys.map(y => [0, y, 0]), (k) => { const y = ys[k], h = hOf(y); return [[0.0045, -0.0005, ''], [0.0045 + h, -0.0003, 's'], [0.0045 + h, 0.0003, 's'], [0.0045, 0.0005, '']]; }, mm, { axis: [0, 1, 0], ax: d, cap0: true, cap1: true });
      } }
    part(M, 'cabeca'); const me = mat === 'pedra' ? PAL.pedra : metal(mat);
    if (mat !== 'pedra' && q < 2) collar(M, y1 - 0.004, 0.022, 0.0052, me);
    if (mat === 'pedra' && q < 2) wrap(M, y1 - 0.025, y1 + 0.004, 0.0046, PAL.cru, { turns: 3 });
    const yb = y1, ye = y1 + (mat === 'pedra' ? 0.05 : mat === 'bronze' ? 0.045 : 0.055); const ys = q === 0 ? [0, 0.2, 0.45, 0.7, 0.9] : [0, 0.5, 0.9];
    const wOf = t => (mat === 'ferro' ? lerp(0.006, 0.0045, t) * (t > 0.6 ? 1 - (t - 0.6) / 0.42 : 1) : mat === 'bronze' ? (0.0045 + 0.007 * sstep(0, 0.25, t)) * (1 - t * 0.98) : 0.0095 * (1 - t * 0.98) + 0.001);
    loft(M, ys.map(t => [0, lerp(yb, ye, t), 0]), (k) => { const t = ys[k]; return mat === 'ferro' ? rrect(wOf(t), wOf(t), wOf(t) * 0.2, seg(M, 1, 0, 0)) : blade(wOf(t), 0.0022 * (1 - 0.5 * t) + 0.0008, seg(M, 2, 1, 1), true, true, q === 0 && mat === 'bronze' ? 0.5 : 0); },
      me, { axis: [0, 1, 0], ax: [1, 0, 0], flat: mat === 'pedra', cap0: true, cap1: [0, ye, 0], tipEdge: true });
    M.marks.ponta = [0, ye, 0]; M.marks.centro = [0, y1 + 0.02, 0];
  };

  // the sling: the finger loop and the release knot in the hand (the origin), the two cords hanging toward +Z to the
  // leather pouch cradling a stone
  R.funda = (M) => {
    const q = M.q; part(M, 'cabo'); ball(M, [0, 0, 0.004], [0.009, 0.012, 0.009], seg(M, 8, 6, 4), PAL.corda);
    if (q < 2) tube(M, (() => { const o = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; o.push([Math.cos(a) * 0.011, 0.004 + Math.sin(a) * 0.011, -0.006]); } return o; })(), 0.0025, 4, PAL.corda, { loop: true, ax: [0, 0, 1] });
    part(M, 'corda'); const zp = 0.47;
    for (const s of [-1, 1]) tube(M, bez([0, s * 0.003, 0.008], [s * 0.004, s * 0.006, 0.16], [0, s * 0.035, 0.32], [0, s * 0.05, zp - 0.006], seg(M, 10, 4, 1)), 0.0024, seg(M, 4, 3, 3), PAL.corda, { cap0: true, cap1: true });
    part(M, 'cabeca');
    grid(M, seg(M, 8, 4, 2), seg(M, 6, 3, 1), (s, t) => { const y = lerp(-0.055, 0.055, s); const a = lerp(-1.1, 1.1, t) * (1 - 0.5 * Math.pow(Math.abs(s - 0.5) * 2, 2)); const r = 0.03 + 0.004 * Math.pow(Math.abs(s - 0.5) * 2, 2); return [Math.sin(a) * r * 1.05, y, zp + 0.026 - Math.cos(a) * r * 0.2]; }, PAL.couro, { out: [0, 0, 1] });
    grid(M, seg(M, 8, 4, 2), seg(M, 6, 3, 1), (s, t) => { const y = lerp(-0.055, 0.055, s); const a = lerp(-1.1, 1.1, t) * (1 - 0.5 * Math.pow(Math.abs(s - 0.5) * 2, 2)); const r = 0.03 + 0.004 * Math.pow(Math.abs(s - 0.5) * 2, 2); return [Math.sin(a) * r * 1.05, y, zp + 0.0255 - Math.cos(a) * r * 0.2]; }, PAL.couro, { out: [0, 0, -1], f: () => ({ ao: 0.6 }) });
    ball(M, [0, 0, zp + 0.02], 0.022, seg(M, 9, 6, 4), PAL.seixo);
    M.marks.centro = [0, 0, zp + 0.02]; M.marks.ponta = M.marks.centro;
  };

  // the shield: a centre grip — the fist round a bar behind the boss, the board before it (+Z), its top at +Y. Wood: planks,
  // the face painted in quarters (the people's colour), a rawhide rim, an iron boss; bronze: a dished bronze face with its
  // rolled rim and rings, the painted blazon in its middle, the wooden core behind
  R.escudo = (M, mat) => {
    const q = M.q, br = mat === 'bronze'; const Rr = br ? 0.45 : 0.42, dish = br ? 0.07 : 0.025;
    part(M, 'cabo'); box(M, [0, 0, -0.002], [0.014, 0.11, 0.011], 0.006, PAL.madeira, { n: 1 });
    part(M, 'cabeca');
    const zf = r => 0.03 + dish * (1 - (r / Rr) * (r / Rr)); // (the face: dished forward)
    const nu = seg(M, 28, 14, 8), nr = seg(M, br ? 7 : 7, 3, 1); const hole = 0.07;
    const plank = x => { const f = ((x + Rr) / 0.12) % 1; return Math.min(f, 1 - f); };
    if (!br) {
      // (four quarters, each its own patch so the paint stops on a line: two painted, two the bare planks)
      for (let qd = 0; qd < 4; qd++) grid(M, Math.max(2, Math.round(nu / 4)), nr, (s, t) => { const a = (qd + s) / 4 * TAU; const r = lerp(hole, Rr - 0.01, t); return [Math.cos(a) * r, Math.sin(a) * r, zf(r)]; }, qd % 2 ? PAL.clara : PAL.tinta,
        { out: [0, 0, 1], f: (s, t, p) => ({ ao: 0.8 + 0.2 * sstep(0, 0.01, plank(p[0])), plank: 1 }) });
    } else {
      const prof = r => zf(r) + (q === 0 ? 0.006 * Math.exp(-Math.pow((r - 0.3) / 0.012, 2)) + 0.006 * Math.exp(-Math.pow((r - 0.36) / 0.01, 2)) : 0);
      grid(M, nu, nr, (s, t) => { const a = s * TAU; const r = lerp(0.17, Rr - 0.05, t); return [Math.cos(a) * r, Math.sin(a) * r, prof(r)]; }, PAL.bronze, { loopU: true, out: [0, 0, 1] });
      grid(M, nu, seg(M, 2, 1, 1), (s, t) => { const a = s * TAU; const r = lerp(hole, 0.17, t); return [Math.cos(a) * r, Math.sin(a) * r, zf(r) + 0.002]; }, PAL.tinta, { loopU: true, out: [0, 0, 1] });
      // (the rim: a flat band turned back, rolled at its edge)
      grid(M, nu, seg(M, 2, 1, 1), (s, t) => { const a = s * TAU; const r = lerp(Rr - 0.05, Rr, t); return [Math.cos(a) * r, Math.sin(a) * r, zf(Rr - 0.05) + 0.004 - 0.014 * t]; }, PAL.bronze, { loopU: true, out: [0, 0, 1], f: (s, t) => ({ e: 0.35 * t }) });
    }
    // (the back: the bare boards; the edge between the two)
    grid(M, nu, seg(M, 3, 1, 1), (s, t) => { const a = s * TAU; const r = lerp(hole, Rr, t); return [Math.cos(a) * r, Math.sin(a) * r, zf(r) - 0.014 - (br ? 0.004 : 0)]; }, PAL.madeira, { loopU: true, out: [0, 0, -1], f: () => ({ ao: 0.75 }) });
    const rp = []; for (let i = 0; i < nu; i++) { const a = i / nu * TAU; rp.push([Math.cos(a) * (Rr - 0.003), Math.sin(a) * (Rr - 0.003), zf(Rr) - (br ? 0.012 : 0.007)]); }
    if (q < 2) tube(M, rp, br ? 0.009 : 0.0095, seg(M, 4, 4, 3), br ? PAL.bronze : PAL.cru, { loop: true, ax: [0, 0, 1], ph: 0.125, f: () => ({ e: br ? 0.3 : 0, wrap: 0.02 }) });
    // (the boss over the fist, and its flange; its rivets)
    const bz = zf(0.08); const bm = br ? PAL.bronze : PAL.ferro; const bp = [];
    const nb = seg(M, 6, 3, 2); for (let i = 0; i <= nb; i++) { const a = (Math.PI / 2) * i / nb; bp.push([Math.max(0.004, Math.cos(a) * 0.074), bz - 0.006 + Math.sin(a) * (br ? 0.05 : 0.068)]); }
    lathe(M, q === 2 ? [[0.085, bz - 0.006], [0.07, bz + 0.02]] : [[0.088, bz - 0.01], [0.09, bz - 0.004]].concat(bp.map(([r, z], i) => [i === 0 ? 0.075 : r, z])), seg(M, 14, 10, 6), bm, { axis: [0, 0, 1], cap0: true, cap1: [0, 0, bz - 0.006 + (br ? 0.05 : 0.068) + 0.003], f: (k, t) => ({ e: 0.25 * t }) });
    if (q === 0) for (let i = 0; i < 6; i++) { const a = (i + 0.5) / 6 * TAU; rivet(M, [Math.cos(a) * 0.082, Math.sin(a) * 0.082, bz - 0.002], [0, 0, 1], 0.0045); }
    dark(M, [0, 0, 0.0], 0.11, 0.25);
    M.marks.centro = [0, 0, bz + 0.04]; M.marks.ponta = [0, Rr, zf(Rr)]; M.tint = 1;
  };

  // ---------------- worn things: the helmet on the head bone, the cuirass on the chest bone (D-387) ----------------
  // the head of a 1.75 m body: its bone at 1.54 m; the skull's box (bodymesh, both bodies) x ±0.104, y 0…0.28, z −0.124…0.143
  // (the nose): a dome of radii 0.128 × 0.142 × 0.146 round (0, 0.165, 0.006) clears it and the hair; below the dome's
  // equator the shell goes straight down (the cheek guards, the neck guard), coming in a little toward the jaw
  const HC = [0, 0.165, 0.01], HR = [0.13, 0.144, 0.152], QL = 0.2;
  const domeAt = (th, d, k) => { const s = 1 + (k || 0);
    if (d <= QL) { const ph = d / QL * Math.PI / 2; return [HC[0] + Math.sin(ph) * Math.sin(th) * HR[0] * s, HC[1] + Math.cos(ph) * HR[1], HC[2] + Math.sin(ph) * Math.cos(th) * HR[2] * s]; }
    const dy = d - QL, tp = 1 - 0.07 * Math.min(1, dy / 0.13); return [HC[0] + Math.sin(th) * HR[0] * s * tp, HC[1] - dy, HC[2] + Math.cos(th) * HR[2] * s * tp]; };
  const dOf = y => (y >= HC[1] ? QL * Math.acos(clamp((y - HC[1]) / HR[1], -1, 1)) / (Math.PI / 2) : QL + (HC[1] - y));
  const wrapA = th => Math.abs(((th % TAU) + TAU + Math.PI) % TAU - Math.PI); // (0 the front, π the nape)
  F.head = { HC, HR }; // (for the proof of the fit)
  R.elmo = (M, mat) => {
    const q = M.q; part(M, 'cabeca'); const nu = seg(M, 30, 16, 8), nv = seg(M, 10, 5, 3);
    // the rim's height round the head: the brow, the cheek guards, the ears, the nape
    let rimY;
    if (mat === 'bronze') rimY = th => { const a = wrapA(th); return a < 0.5 ? 0.128 + 0.008 * Math.cos(a * 3) : a < 1.3 ? lerp(0.128, -0.03, sstep(0.5, 0.68, a)) : a < 1.75 ? lerp(-0.03, 0.06, sstep(1.3, 1.5, a)) : lerp(0.06, 0.0, sstep(1.75, 2.4, a)); };
    else if (mat === 'ferro') rimY = th => lerp(0.124, 0.08, sstep(0.3, 2.6, wrapA(th)));
    else rimY = th => { const a = wrapA(th); return lerp(0.132, 0.06, sstep(0.6, 2.4, a)) - 0.045 * Math.exp(-Math.pow((a - 1.6) / 0.28, 2)); };
    const flare = (th, t) => { const a = wrapA(th); return mat === 'bronze' ? 0.16 * sstep(0.8, 1, t) * sstep(1.9, 2.7, a) : mat === 'couro' ? 0.03 * sstep(0.88, 1, t) : 0.0; };
    const P = (s, t) => { const th = s * TAU; const d = dOf(rimY(th)) * t; const p = domeAt(th, d, flare(th, t));
      if (mat === 'ferro' && d < QL) { const k = 1 - d / QL; p[1] += 0.045 * k * k; } return p; }; // (the spangenhelm's point)
    const mm = mat === 'couro' ? PAL.couro : metal(mat);
    grid(M, nu, nv, P, mm, { loopU: true, apex0: true, inside: HC, f: (s, t) => { const th = s * TAU; let seam = 0; if (mat === 'couro') seam = Math.pow(Math.max(0, Math.cos(th * 2)), 60) + Math.pow(Math.max(0, -Math.cos(th * 2)), 60); return { ao: 1 - 0.35 * seam, kc: mat === 'couro' ? 0 : 0.25 * (1 - t) }; } });
    // (the inside: the same shell a little smaller and in its own shade — seen under the rim)
    if (q < 2) grid(M, nu, seg(M, 3, 2), (s, t) => { const p = P(s, lerp(0.45, 1, t)); return add(HC, mul(sub(p, HC), 0.955)); }, mm, { loopU: true, inside: [0, 0.6, 0], f: () => ({ ao: 0.36 }) });
    // (the rim rolled, or the leather's stitched edge)
    const rp = []; for (let i = 0; i < nu; i++) rp.push(P(i / nu, 1));
    if (mat !== 'ferro' || q === 2) tube(M, rp, mat === 'couro' ? 0.006 : 0.005, seg(M, 5, 4, 3), mat === 'couro' ? PAL.cru : mm, { loop: true, f: () => ({ e: mat === 'couro' ? 0 : 0.45 }) });
    if (mat === 'ferro' && q < 2) {
      // (the brow band, the four bands from the brow to the point and their rivets, the nasal)
      const bp = []; for (let i = 0; i < nu; i++) { const s = i / nu; const p = P(s, 0.965); bp.push(add(p, mul(nrm(sub(p, HC)), 0.003))); }
      tube(M, bp, 0.0085, 4, mm, { loop: true, ph: 0.125, f: () => ({ e: 0.3 }) });
      for (let b = 0; b < 4; b++) { const s = (b + 0.5) / 4; const th = s * TAU; const pts = []; const nb = seg(M, 7, 3); for (let i = 0; i <= nb; i++) { const t = 0.04 + i / nb * 0.86; const p = P(s, t); pts.push(add(p, mul(nrm(sub(p, HC)), 0.003))); }
        loft(M, pts, () => rrect(0.011, 0.0022, 0.002, 0), mm, { ax: [Math.cos(th), 0, -Math.sin(th)], cap0: true, cap1: true, f: () => ({ e: 0.35 }) });
        if (q === 0) for (const t of [0.3, 0.55, 0.8]) { const p = P(s, t); rivet(M, add(p, mul(nrm(sub(p, HC)), 0.005)), sub(p, HC), 0.0032); } }
      const nz = P(0, 1)[2] + 0.005; loft(M, [[0, 0.13, nz - 0.002], [0, 0.085, nz + 0.004], [0, 0.035, nz + 0.007]], (k) => rrect(k === 2 ? 0.008 : 0.011, 0.003, 0.002, 0), mm, { ax: [1, 0, 0], cap0: true, cap1: true, f: () => ({ e: 0.4 }) });
    }
    if (mat === 'bronze' && q < 2) {
      // (the brow ridge over the eyes, and the horsehair crest on its holder from front to back — the people's colour dyes it)
      const ep = []; for (let i = 0; i <= 8; i++) { const s = lerp(-0.075, 0.075, i / 8); ep.push(add(P(s, 0.9), [0, 0.002, 0.004])); }
      tube(M, ep, 0.0055, 5, PAL.bronze, { cap0: true, cap1: true, f: () => ({ e: 0.6 }) });
      part(M, 'enfeite'); const np = seg(M, 12, 6); const cp = []; for (let i = 0; i <= np; i++) { const a = lerp(0.45, -2.2, i / np); cp.push([0, HC[1] + Math.cos(a) * HR[1] + 0.006, HC[2] + Math.sin(a) * HR[2] * 1.02]); }
      loft(M, cp, (k, t) => { const h = 0.085 * Math.sin(Math.PI * clamp(t * 1.05, 0, 1) * 0.88 + 0.18) + 0.01; const w = 0.014; return [[w * 0.45, -0.004, ''], [w, h * 0.45, ''], [w * 0.55, h, 'k'], [-w * 0.55, h, 'k'], [-w, h * 0.45, ''], [-w * 0.45, -0.004, '']]; }, PAL.crina,
        { ax: [1, 0, 0], cap0: true, cap1: true, f: (k, t, j, u, v, p) => ({ ao: 0.72 + 0.28 * Math.sin(p[1] * 310 + p[2] * 520) }) });
      M.marks.ponta = cp[Math.round(np * 0.3)];
    }
    if (mat === 'couro' && q < 2) { ball(M, [0, HC[1] + HR[1] + 0.004, HC[2]], [0.015, 0.009, 0.015], 8, PAL.couro); }
    M.marks.centro = HC.slice(); if (!M.marks.ponta) M.marks.ponta = [0, HC[1] + HR[1] + (mat === 'ferro' ? 0.045 : 0.008), 0];
    M.tint = mat === 'bronze' ? 1 : 0;
  };

  // the cuirass: a front plate and a back plate joined at the sides and over the shoulders, round the chest of a 1.75 m
  // body on its chest bone (0.98 m); the body's half-width and its front and back there (bodymesh, both bodies, the larger)
  const TY = [-0.06, 0.0, 0.06, 0.14, 0.22, 0.3, 0.38, 0.46, 0.5, 0.54];
  const TW = [0.143, 0.153, 0.145, 0.137, 0.177, 0.184, 0.197, 0.193, 0.206, 0.138], TF = [0.112, 0.114, 0.113, 0.103, 0.1, 0.127, 0.124, 0.108, 0.078, 0.05], TB = [-0.136, -0.105, -0.096, -0.098, -0.121, -0.128, -0.118, -0.114, -0.099, -0.076];
  const tbl = (A, y) => { if (y <= TY[0]) return A[0]; for (let i = 1; i < TY.length; i++) if (y <= TY[i]) return lerp(A[i - 1], A[i], (y - TY[i - 1]) / (TY[i] - TY[i - 1])); return A[A.length - 1]; };
  F.torso = { TY, TW, TF, TB }; // (for the proof of the fit)
  R.couraca = (M, mat) => {
    const q = M.q; const mg = 0.026; const me = mat === 'couro' ? PAL.couro : metal(mat);
    const yb = -0.045, ya = 0.235, yS = 0.5; const AO = 0.69; // (the foot, the armpits, the shoulders' line; the plates' half-span at the top)
    // (the envelope: a rounded section round the body's, a margin out; it flares a little over the hips at the foot)
    const fl = mat === 'bronze' ? 0.02 : 0.012;
    const W = y => Math.max(tbl(TW, Math.min(y, 0.44)), 0.16) + mg + fl * sstep(0.05, -0.045, y), Zf = y => Math.max(tbl(TF, y), 0.1) + mg + fl * 0.8 * sstep(0.04, -0.045, y), Zb = y => Math.min(tbl(TB, y), -0.11) - mg;
    const muscle = (x, y, front) => {
      if (mat !== 'bronze' || q > 0) return 0; if (!front) return 0.009 * Math.exp(-Math.pow((Math.abs(x) - 0.08) / 0.045, 2) - Math.pow((y - 0.36) / 0.07, 2)) - 0.006 * Math.exp(-Math.pow(x / 0.014, 2));
      let d = 0.024 * Math.exp(-Math.pow((Math.abs(x) - 0.075) / 0.05, 2) - Math.pow((y - 0.33) / 0.055, 2)); // (the pectorals)
      for (const ry of [0.06, 0.13, 0.2]) d += 0.013 * Math.exp(-Math.pow((Math.abs(x) - 0.04) / 0.024, 2) - Math.pow((y - ry) / 0.026, 2)); // (the abdominals)
      d -= 0.008 * Math.exp(-Math.pow(x / 0.012, 2)) * sstep(0.29, 0.0, y); d -= 0.005 * Math.exp(-(x * x + Math.pow(y - 0.005, 2)) / 0.00015); return d;
    };
    const HH = (ya - yb) / 5; const hoop = y => (mat === 'ferro' && q === 0 && y < ya - 1e-6 ? 0.009 * (1 - Math.min(1, ((y - yb) / HH) % 1 / 0.9)) : 0); // (the girth hoops, each over the one below)
    // the point of the envelope at an angle a (0 the front, π/2 the body's left) and height y, pushed out by `extra`
    const env = (a, y, extra) => { const c = Math.cos(a), s = Math.sin(a); const e = 2.6; const sx = Math.sign(s) * Math.pow(Math.abs(s), 2 / e), cz = Math.sign(c) * Math.pow(Math.abs(c), 2 / e);
      const zr = c >= 0 ? Zf(y) : -Zb(y); const x = sx * W(y), z = cz * zr; const n = nrm([x / (W(y) * W(y)), 0, z / (zr * zr)]); const d = (extra || 0) + muscle(x, y, c >= 0) + hoop(y); return [x + n[0] * d, y, z + n[2] * d]; };
    // (the neckline: low at the middle of the front, higher behind, up to the shoulders' line under the straps)
    const topY = a => { const c = Math.cos(a), x = Math.abs(Math.sin(a)); return lerp(c >= 0 ? 0.425 : 0.475, yS, sstep(0.2, 0.42, x)); };
    part(M, 'cabeca');
    const nu = seg(M, 24, 12, 8), nl = seg(M, mat === 'bronze' ? 9 : 7, 3, 1), nh = seg(M, mat === 'bronze' ? 9 : 7, 3, 1);
    // (the lower ring, whole round, from the foot to the armpits)
    const hoops = mat === 'ferro' && q === 0; const rowY = t => { if (!hoops) return lerp(yb, ya, t); const i = Math.round(t * 10); return yb + Math.floor(i / 2) * HH + (i % 2) * HH * 0.9 - (i === 10 ? HH * 0.0 : 0); };
    grid(M, nu, hoops ? 10 : nl, (s, t) => env(s * TAU, Math.min(ya, rowY(t))), me, { loopU: true, inside: [0, 0.1, 0], f: (s, t, p) => ({ ao: hoops ? (Math.round(t * 10) % 2 ? 0.62 : 1) : 1 }) });
    // (above the armpits the front and the back plates: the armholes cut in from the sides up to the straps)
    const angle = (fb, s, t) => { const h = lerp(Math.PI / 2, AO, Math.pow(t, 0.8)); return (fb ? Math.PI : 0) + lerp(-h, h, s); };
    const plate = (fb, s, t) => { const a = angle(fb, s, t); return env(a, lerp(ya, topY(a), t)); };
    for (const fb of [0, 1]) grid(M, Math.max(2, nu / 2), nh, (s, t) => plate(fb, s, t), me, { inside: [0, 0.35, 0] });
    // (the straps over the shoulders, from the front plate's top to the back's — they start where the plates end)
    for (const sd of [-1, 1]) { const a0 = 0.3, a1 = AO; const nk = seg(M, 6, 3, 1);
      grid(M, 2, nk, (u, t) => { const a = sd * lerp(a0, a1, u); const P0 = env(a, topY(a)), P1 = env(Math.PI - a, topY(Math.PI - a)); const C = [(P0[0] + P1[0]) / 2 * 1.04, yS + 0.075, (P0[2] + P1[2]) / 2 - 0.004];
        const s1 = 1 - t; return [0, 1, 2].map(i => s1 * s1 * P0[i] + 2 * s1 * t * C[i] + t * t * P1[i]); }, mat === 'couro' ? PAL.couro : me, { inside: [sd * 0.13, 0.4, 0] }); }
    // (the edges: the foot, the armholes and the neckline rolled — or stitched, the leather)
    if (q < 2) {
      const rimM = mat === 'couro' ? PAL.cru : me; const rr = mat === 'couro' ? 0.006 : 0.0055; const nn = seg(M, 6, 3);
      const foot = []; for (let i = 0; i < nu; i++) foot.push(env(i / nu * TAU, yb, 0.002)); tube(M, foot, rr * 1.25, 4, rimM, { loop: true, ph: 0.125, f: () => ({ e: 0.35 }) });
      if (q === 0) for (const fb of [0, 1]) { const pts = [];
        for (let i = 0; i <= nn; i++) { const t = i / nn; const a = angle(fb, 0, t); pts.push(env(a, lerp(ya, topY(a), t), 0.002)); }
        for (let i = 1; i < nn * 2; i++) { const a = angle(fb, i / (nn * 2), 1); pts.push(env(a, topY(a), 0.002)); }
        for (let i = nn; i >= 0; i--) { const t = i / nn; const a = angle(fb, 1, t); pts.push(env(a, lerp(ya, topY(a), t), 0.002)); }
        tube(M, pts, rr, 4, rimM, { cap0: true, cap1: true, ph: 0.125, f: () => ({ e: 0.35 }) }); }
    }
    if (mat === 'couro' && q < 2) {
      // (a row of short leather tabs round the foot, flaring a little)
      part(M, 'enfeite'); const nt = q === 0 ? 12 : 6;
      for (let i = 0; i < nt; i++) { const a = (i + 0.5) / nt * TAU; const p0 = env(a, yb + 0.006), p1 = env(a, yb - 0.07, 0.014);
        loft(M, [p0, mix3(p0, p1, 0.5), p1], () => rrect(0.025, 0.0035, 0.003, 0), PAL.couro, { ax: [Math.cos(a), 0, -Math.sin(a)], cap0: true, cap1: true, f: () => ({ ao: 0.85 }) }); }
    }
    if (mat === 'ferro' && q < 2) {
      // (the shoulder guards: curved plates over each other on each shoulder, over the strap)
      part(M, 'enfeite');
      for (const sd of [-1, 1]) for (let b = 0; b < (q === 0 ? 2 : 1); b++) { const pts = []; const np = seg(M, 6, 4); const sl = nrm([sd, -0.62, 0]); const o = add([sd * 0.175, yS + 0.042, -0.006], mul(sl, b * 0.042));
        for (let i = 0; i <= np; i++) { const a = lerp(-1.2, 1.2, i / np); pts.push(add(o, [sd * (1 - Math.cos(a)) * 0.012, (Math.cos(a) - 1) * 0.04 + 0.018 * Math.cos(a), Math.sin(a) * (0.128 + b * 0.008)])); }
        loft(M, pts, () => rrect(0.032, 0.0032, 0.002, 0), me, { ax: sl, cap0: true, cap1: true, f: () => ({ e: 0.3 }) }); }
    }
    M.marks.centro = [0, 0.22, 0]; M.marks.ponta = [0, yS + 0.075, 0]; M.tint = 0;
  };

  // ------------------------------ the things of daily life (22c, D-612) ------------------------------
  // the cup: held by its handle (the origin: the fist round the handle's bar, along Y), its body beside the handle toward +X —
  // the palm's side, where a cup held by its handle sits —, its mouth up (+Y). Of wood: carved from a block, the grain round it;
  // of fired clay: thrown on the wheel, a dark slip band under the rim
  R.caneca = (M, mat) => {
    const q = M.q, clay = mat === 'barro'; const pal = clay ? PAL.barro : PAL.clara;
    const xc = 0.058, y0 = -0.05, y1 = 0.058, r0 = clay ? 0.036 : 0.04, r1 = clay ? 0.042 : 0.041, w = clay ? 0.005 : 0.007; const C = [xc, 0, 0];
    part(M, 'cabo');
    // (the handle: a loop out of the wall toward −X, its bar through the fist)
    const nh = seg(M, 10, 5, 2); const hp = []; for (let i = 0; i <= nh; i++) { const a = Math.PI * i / nh; hp.push([0.018 - Math.sin(a) * 0.022, 0.038 - (1 - Math.cos(a)) * 0.034, 0]); }
    tube(M, hp, clay ? 0.0065 : 0.0075, seg(M, 7, 5, 3), pal, { cap0: true, cap1: true, f: () => ({ ao: 0.9 }) });
    part(M, 'cabeca');
    const n = seg(M, 16, 9, 5); const rOf = y => lerp(r0, r1, (y - y0) / (y1 - y0));
    // (the outside, from the foot to the rim; the slip band under a clay cup's rim)
    const out = q === 0 ? [[r0 * 0.92, y0], [r0, y0 + 0.006], [rOf(-0.01), -0.01], [rOf(0.03), 0.03], [r1, y1 - 0.004], [r1 - 0.002, y1]] : q === 1 ? [[r0 * 0.95, y0], [rOf(0.0), 0.0], [r1, y1]] : [[r0, y0], [r1, y1]];
    lathe(M, out, n, pal, { at: C, cap0: [xc, y0, 0], m: (k) => (clay && out[k] && out[k][1] > 0.03 ? PAL.barroE : pal), f: (k, t, j, u, v, p) => ({ ao: 0.78 + 0.22 * sstep(y0, y0 + 0.03, p[1]) }) });
    // (the inside: the wall's thickness in, down to the floor, darker the deeper; the rim's flat ring between)
    if (q < 2) { const yi = y0 + (clay ? 0.008 : 0.014); lathe(M, [[r1 - w, y1], [rOf(0.0) - w, 0.0], [r0 - w, yi]], n, pal, { at: C, cap1: [xc, yi, 0], dir: c => [xc - c[0], 0, -c[2]], f: (k, t, j, u, v, p) => ({ ao: 0.35 + 0.4 * sstep(yi, y1, p[1]) }) });
      grid(M, n, 1, (s0, t) => { const a = s0 * TAU, r = lerp(r1 - w, r1 - 0.002, t); return [xc + Math.cos(a) * r, y1, Math.sin(a) * r]; }, clay ? PAL.barroE : pal, { loopU: true, out: [0, 1, 0], f: () => ({ ao: 0.95 }) }); }
    M.marks.centro = [xc, 0.005, 0]; M.marks.boca = [xc, y1, 0]; M.marks.ponta = [xc, y1, 0];
  };

  // the plate (P7, D-768): held by the lug of its rim (the origin: the fist round the lug), the plate toward +X — the palm's side, as
  // the cup's body —, flat, its face up (+Y), the meal on it: a mound of cooked grain and a few bits of what went in with it. Of wood:
  // turned on the lathe, the grain round it; of fired clay: thrown on the wheel, a dark slip band on its rim
  const COMIDA = { c: hex('#d6c08f'), c2: hex('#b39660'), grain: 'pebble', g: 0.1 };
  const PEDACO = [{ c: hex('#7a4026'), c2: hex('#5e2f1b'), grain: 'pebble', g: 0.12 }, { c: hex('#5f6f2e'), c2: hex('#4a5822'), grain: 'pebble', g: 0.1 }];
  R.prato = (M, mat) => {
    const q = M.q, clay = mat === 'barro'; const pal = clay ? PAL.barro : PAL.clara; const rim = clay ? PAL.barroE : pal;
    const Rr = 0.085, xc = 0.011 + Rr; const C = [xc, 0, 0];
    part(M, 'cabo');
    // (the lug: a short tab out of the rim toward −X, the fist round it)
    if (q < 2) box(M, [0.004, -0.0005, 0], [0.012, 0.0035, 0.015], 0.003, pal);
    part(M, 'cabeca');
    const n = seg(M, 22, 12, 8);
    // (the outside, from the foot ring to the rim; the inside, the wall's thickness down to the floor, darker toward it)
    const out = q === 0 ? [[0.040, -0.016], [0.046, -0.0145], [0.050, -0.012], [0.066, -0.007], [0.080, 0.0], [Rr, 0.005], [Rr - 0.0015, 0.0068]]
      : q === 1 ? [[0.044, -0.016], [0.066, -0.008], [Rr, 0.005]] : [[0.05, -0.014], [Rr, 0.005]];
    lathe(M, out, n, pal, { at: C, cap0: [xc, out[0][1], 0], cap1: q === 2 ? [xc, 0.005, 0] : undefined, m: k => (clay && out[k] && out[k][1] > 0.001 ? rim : pal), f: (k, t, j, u, v, p) => ({ ao: 0.8 + 0.2 * sstep(-0.016, 0.0, p[1]) }) });
    if (q < 2) { const yi = -0.0075; const ins = q === 0 ? [[Rr - 0.005, 0.0066], [0.074, 0.0], [0.058, -0.0055], [0.040, yi]] : [[Rr - 0.005, 0.005], [0.05, yi]];
      lathe(M, ins, n, pal, { at: C, cap1: [xc, yi, 0], dir: c => [xc - c[0], 0, -c[2]], m: k => (clay && k === 0 ? rim : pal), f: (k, t, j, u, v, p) => ({ ao: 0.55 + 0.45 * sstep(yi, 0.006, p[1]) }) }); }
    // (the meal: a mound of the grain, the bits of the stew half sunk in it)
    part(M, 'enfeite');
    ball(M, [xc, -0.004, 0], [0.056, 0.026, 0.056], seg(M, 14, 8, 6), COMIDA, { f: (k, t, j, u, v, p) => ({ ao: 0.72 + 0.28 * sstep(-0.006, 0.02, p[1]) }) });
    if (q === 0) for (let i = 0; i < 4; i++) { const a = 0.3 + i * 1.55, r = 0.024; const y = -0.004 + 0.026 * Math.sqrt(1 - (r / 0.056) ** 2) - 0.003;
      ball(M, [xc + Math.cos(a) * r, y, Math.sin(a) * r], 0.0095 + 0.002 * (i % 2), 6, PEDACO[i % 2], { f: () => ({ ao: 0.9 }) }); }
    M.marks.centro = [xc, 0.0, 0]; M.marks.boca = [xc, 0.022, 0]; M.marks.ponta = [xc + Rr, 0.005, 0];
  };

  // the ball: held in the palm (the origin: the grip, a little inside the ball), the ball toward +X — the palm's side. Of
  // wicker: woven withies; of leather: panels sewn over a stuffing, the seams standing out
  R.bola = (M, mat) => {
    const q = M.q, hide = mat === 'couro'; const r = 0.072; const C = [r - 0.012, 0, 0];
    part(M, 'cabeca');
    const n = seg(M, 16, 10, 6);
    ball(M, C, r, n, hide ? PAL.couro : PAL.vime, { f: (k, t, j, u, v, p) => {
      const d = sub(p, C); const la = Math.atan2(d[1], Math.hypot(d[0], d[2])), lo = Math.atan2(d[2], d[0]);
      if (hide) { const seam = Math.pow(Math.max(0, Math.cos(lo * 3)), 40) + Math.pow(Math.max(0, Math.cos(la * 2)), 60); return { ao: 1 - 0.32 * Math.min(1, seam) }; }
      return { w: q === 0 ? ((Math.floor((lo + Math.PI) / TAU * 12) + Math.floor((la + 1.6) / 3.2 * 8)) % 2 ? 1 : -1) : 0, wrap: 0.02, ao: 0.85 + 0.15 * Math.cos(la * 6) }; } });
    M.marks.centro = C.slice(); M.marks.ponta = [C[0] + r, 0, 0];
  };

  // the bonds of the hands joined: in the right fist's frame (the origin: the right palm; the forearm goes back toward −Z, the
  // palm's side is +X) the right wrist's ring and the left wrist's beside it, toward the palm, the left palm where the other hand
  // goes (M.grip). Two pieces — the right ring and its half of what joins them (the parts before 'outra'), the left ring and its
  // half ('outra') —, each drawn on its own wrist (G.People3D). Of cord: a loop round each wrist, a twisted cord between; of iron:
  // two cuffs and the chain between them
  const WR = [-0.027, 0, -0.096], WL = [0.078, 0, -0.096];
  F.cuffs = { WR, WL }; // (for the proof: where the wrists are, in the thing's frame)
  R.grilhoes = (M, mat) => {
    const q = M.q, iron = mat === 'ferro';
    const ring = (c, rx, rz, np) => { const o = []; for (let i = 0; i < np; i++) { const a = i / np * TAU; o.push([c[0] + Math.cos(a) * rx, c[1] + Math.sin(a) * rz, c[2]]); } return o; };
    const RX = iron ? 0.039 : 0.039, side = sg => (sg < 0 ? WR : WL);
    for (const sg of [-1, 1]) { const c = side(sg); part(M, sg < 0 ? 'cabeca' : 'outra');
      // (the ring round the wrist: an iron band flat and wide along the forearm, or a loop of cord)
      if (iron) loft(M, ring(c, RX, 0.033, seg(M, 16, 10, 4)), () => rrect(0.012, 0.0045, 0.003, seg(M, 1, 0, 0)), PAL.ferroB, { loop: true, ax: [0, 0, 1], f: () => ({ e: 0.2 }) });
      else tube(M, ring(c, RX, 0.034, seg(M, 14, 8, 5)), 0.0062, seg(M, 6, 4, 3), PAL.corda, { loop: true, f: () => ({ wrap: 0.011 }) });
      if (q < 2) { part(M, 'amarra');
        // (its half of the join, from the ring's near side toward the other: one iron link, or a twist of cord)
        const x0 = c[0] - sg * RX, xm = (WR[0] + WL[0]) / 2;
        if (iron) { const cx = lerp(x0, xm, 0.55), np = seg(M, 10, 6); const lk = []; for (let j = 0; j < np; j++) { const a = j / np * TAU; lk.push(sg < 0 ? [cx + Math.cos(a) * 0.011, 0, c[2] + Math.sin(a) * 0.007] : [cx + Math.cos(a) * 0.011, Math.sin(a) * 0.007, c[2]]); }
          tube(M, lk, 0.0028, seg(M, 5, 3), PAL.ferroB, { loop: true }); }
        else { const np = seg(M, 6, 3); const pts = []; for (let j = 0; j <= np; j++) { const t = j / np; pts.push([lerp(x0, xm + sg * 0.004, t), 0.004 * Math.sin(t * 9 + sg), c[2] + 0.004 * Math.cos(t * 9)]); }
          tube(M, pts, 0.0058, seg(M, 6, 4), PAL.corda, { cap0: true, cap1: true, f: () => ({ wrap: 0.011 }) }); }
      }
    }
    M.grip = [WL[0] - 0.027, 0, 0]; M.marks.centro = [(WR[0] + WL[0]) / 2, 0, WR[2]]; M.marks.ponta = M.grip.slice(); M.marks.argolaD = WR.slice(); M.marks.argolaE = WL.slice();
  };

  // the crutch: a staff gripped by the hand (the origin), its top (+Y) the crosspiece padded with cloth under the armpit, its foot
  // (−Y) on the ground; the crosspiece along Z, the body's way. For a body of 1.75 m: the pad at the armpit, the foot at the sole
  R.muleta = (M) => {
    const q = M.q; part(M, 'cabo');
    haft(M, -0.86, 0.43, 0.0145, 0.0165, { wood: 'madeira', grip: [-0.05, 0.06] });
    if (q < 2) collar(M, -0.845, 0.03, 0.0175, PAL.couro); // (the foot shod in leather)
    part(M, 'cabeca');
    // (the crosspiece, a little curved to the armpit, and the cloth wound over it)
    const nb = seg(M, 8, 4, 2); const cp = []; for (let i = 0; i <= nb; i++) { const t = i / nb; cp.push([0, 0.445 + 0.012 * Math.pow(2 * t - 1, 2), lerp(-0.085, 0.085, t)]); }
    loft(M, cp, () => rrect(0.016, 0.013, 0.008, seg(M, 2, 1, 0)), PAL.madeira, { ax: [1, 0, 0], cap0: true, cap1: true });
    if (q < 2) { const pp = []; for (let i = 0; i <= nb; i++) { const t = lerp(0.18, 0.82, i / nb); pp.push([0, 0.447 + 0.012 * Math.pow(2 * t - 1, 2) + 0.004, lerp(-0.085, 0.085, t)]); }
      loft(M, pp, () => rrect(0.02, 0.016, 0.012, seg(M, 2, 1)), PAL.pano, { ax: [1, 0, 0], cap0: true, cap1: true, f: () => ({ ao: 0.9 }) }); }
    M.marks.centro = [0, 0.45, 0]; M.marks.ponta = [0, -0.86, 0]; M.marks.pe = [0, -0.86, 0]; M.marks.axila = [0, 0.46, 0];
  };

  // ------------------------------ the instruments (P7, D-764) ------------------------------
  // the lyre: held by the peg at the foot of its sound box (the origin: the fist round the peg, along Y — the thing of one hand: the
  // other plucks), the box above it and the arms and the yoke above that (+Y), its face (+Z) where the strings are. The box a rounded
  // shell of wood with the rawhide stretched over its face; the two arms of dark wood rising from its shoulders and leaning out, the
  // yoke across their tops; the seven strings of gut from the tailpiece at the foot of the face to the yoke
  R.lira = (M) => {
    const q = M.q; const wb = 0.17, yb0 = 0.045, yb1 = 0.235, zb = 0.045;
    part(M, 'cabo');
    // (the peg under the box: turned wood, the hand round it)
    haft(M, -0.05, yb0 + 0.01, 0.014, 0.016, { wood: 'escura', top: false, grip: [-0.04, 0.03] });
    part(M, 'cabeca');
    // (the box: a deep rounded rectangle along Z, its back of wood, its face of hide)
    box(M, [0, (yb0 + yb1) / 2, -0.008], [wb, (yb1 - yb0) / 2, zb - 0.008], 0.05, PAL.madeira, { along: 'z', n: seg(M, 3, 1, 0), f: (k, t) => ({ ao: 0.85 + 0.15 * t }) });
    if (q < 2) grid(M, 1, 1, (s, t) => [lerp(-wb + 0.02, wb - 0.02, s), lerp(yb0 + 0.02, yb1 - 0.02, t), zb + 0.0015], PAL.cru, { out: [0, 0, 1], f: () => ({ ao: 0.95 }) });
    // (the arms: from the box's shoulders up and out, a little forward)
    const na = seg(M, 8, 4, 2); const arm = sx => bez([sx * (wb - 0.03), yb1 - 0.02, 0], [sx * (wb + 0.04), yb1 + 0.12, 0.01], [sx * (wb + 0.02), yb1 + 0.26, 0.02], [sx * (wb - 0.03), yb1 + 0.36, 0.015], na);
    const L = arm(-1), Rr = arm(1);
    // (the ends of the arms and of the yoke closed near and mid; far, too small to see)
    const cp = q < 2;
    tube(M, L, t => lerp(0.016, 0.011, t), seg(M, 7, 5, 3), PAL.escura, { cap0: cp, cap1: cp });
    tube(M, Rr, t => lerp(0.016, 0.011, t), seg(M, 7, 5, 3), PAL.escura, { cap0: cp, cap1: cp });
    // (the yoke across the arms' tops, standing a little past them)
    const yy = yb1 + 0.33; tube(M, [[L[L.length - 1][0] - 0.02, yy, 0.015], [Rr[Rr.length - 1][0] + 0.02, yy, 0.015]], 0.012, seg(M, 8, 5, 3), PAL.madeira, { cap0: cp, cap1: cp });
    if (q < 2) { part(M, 'corda');
      // (the strings: gut, from the tailpiece to the yoke, fanning a little)
      const ns = seg(M, 7, 5, 0); box(M, [0, yb0 + 0.025, zb + 0.004], [0.05, 0.006, 0.004], 0.002, PAL.couro, { n: 0 }); // (the tailpiece)
      for (let i = 0; i < ns; i++) { const s = ns > 1 ? i / (ns - 1) : 0.5; const x0 = lerp(-0.045, 0.045, s), x1 = lerp(-0.1, 0.1, s); tube(M, [[x0, yb0 + 0.025, zb + 0.006], [x1, yy - 0.008, 0.028]], 0.0012, 3, PAL.linha, {}); } }
    M.marks.centro = [0, (yb0 + yb1) / 2, zb]; M.marks.ponta = [0, yy, 0.015]; M.marks.cordas = [0, (yb1 + yy) / 2, 0.03];
  };
  // the drum (the huehuetl): held by the carved handle of its foot (the origin: the fist round it, along Y — a thing of one hand),
  // the body above it (+Y); a log of wood hollowed and carved, its three feet notched out of its foot, the hide stretched over its
  // mouth and laced with cord below the rim
  R.tambor = (M) => {
    const q = M.q; const r = 0.15, y0 = 0.05, y1 = 0.55; const C = [0, 0, 0];
    part(M, 'cabo');
    haft(M, -0.05, y0 + 0.01, 0.02, 0.022, { wood: 'escura', top: false, grip: [-0.04, 0.03] });
    part(M, 'cabeca');
    const n = seg(M, 16, 10, 6);
    // (the body: a little waisted, the rim thick; the feet cut from its foot — three tongues where the log is notched)
    const prof = q === 0 ? [[r * 0.9, y0], [r * 0.95, y0 + 0.12], [r * 0.9, y0 + 0.2], [r * 0.96, y1 - 0.14], [r, y1 - 0.015], [r * 1.02, y1]] : [[r * 0.92, y0], [r * 0.92, y1 - 0.14], [r, y1]];
    lathe(M, prof, n, PAL.madeira, { at: C, cap0: [0, y0, 0], f: (k, t, j, u, v, p) => ({ ao: 0.72 + 0.28 * sstep(y0, y0 + 0.2, p[1]) }) });
    if (q === 0) for (let i = 0; i < 3; i++) { const a = (i / 3 + 1 / 6) * TAU; box(M, [Math.cos(a) * r * 0.93, y0 + 0.06, Math.sin(a) * r * 0.93], [0.03, 0.06, 0.008], 0.004, PAL.escura, { n: 0 }); }
    // (the hide over the mouth, its edge turned down over the rim)
    grid(M, n, 1, (s, t) => { const a = s * TAU, rr = lerp(0, r * 1.02, t); return [Math.cos(a) * rr, y1 + 0.003 * (1 - t), Math.sin(a) * rr]; }, PAL.cru, { loopU: true, apex0: true, out: [0, 1, 0] });
    if (q < 2) { part(M, 'amarra'); collar(M, y1 - 0.03, 0.02, r * 1.025, PAL.corda, { at: C, n }); }
    M.marks.centro = [0, y1, 0]; M.marks.ponta = [0, y1, 0]; M.marks.pe = [0, y0, 0];
  };

  // ------------------------------ building a thing ------------------------------
  // the colour of a vertex: the material's base, its grain (from where the vertex is), its edge, its shade; its shine
  function shade(inf, p, n) {
    const m = inf.m || PAL.madeira; let c = m.c.slice(); let k = 1;
    switch (m.grain) {
      case 'wood': { const g = vn(inf.u * 70 + 3.1, inf.v * 70 + 1.7, inf.L * 4.5) * 0.65 + vn(inf.u * 240 + 9, inf.v * 240, inf.L * 16) * 0.35; c = mix3(m.c, m.c2 || m.c, sstep(0.35, 0.75, g)); k *= 0.9 + 0.18 * g; if (inf.plank) k *= 1; if (inf.bow !== undefined) c = mix3(hex('#7a4426'), hex('#c8a26a'), sstep(-0.002, 0.004, inf.bow)); break; }
      case 'flint': { const h = hs(inf.face || 1, 11, 3), h2 = hs(inf.face || 1, 5, 9); c = mix3(m.c, m.c2, 0.25 + h2 * 0.6); k *= 0.9 + 0.2 * h; if (m.edge) c = mix3(c, m.edge, 0.6 * clamp(inf.e || 0, 0, 1)); break; }
      case 'pebble': { const g = vn(p[0] * 300, p[1] * 300, p[2] * 300); c = mix3(m.c, m.c2, sstep(0.55, 0.8, g)); k *= 0.92 + 0.14 * vn(p[0] * 60, p[1] * 60, p[2] * 60); break; }
      case 'metal': { const g = vn(p[0] * 80, p[1] * 80, p[2] * 80); c = mix3(m.c, m.c2 || m.c, g * 0.6); k *= 0.95 + 0.1 * vn(p[0] * 220, p[1] * 30, p[2] * 220); if (m.edge) { c = mix3(c, m.edge, clamp(inf.e || 0, 0, 1)); c = mix3(c, m.edge, 0.25 * (inf.kc || 0)); } break; }
      case 'leather': { const g = vn(p[0] * 140, p[1] * 140, p[2] * 140); c = mix3(m.c, m.c2 || m.c, g); k *= 0.9 + 0.14 * vn(p[0] * 400, p[1] * 400, p[2] * 400); break; }
      case 'rope': { const pitch = inf.wrap || 0.014; const ph = (inf.a || 0) * 3 + (inf.L || p[1]) / pitch; const b = 0.5 + 0.5 * Math.cos(ph * TAU); c = mix3(m.c2 || m.c, m.c, b); k *= 0.82 + 0.22 * b; break; }
      case 'wicker': { const w = inf.w || 0; const g = vn(p[0] * 120, p[1] * 120, p[2] * 30); c = mix3(m.c2, m.c, 0.55 + 0.35 * w + 0.1 * g); if (inf.wrap) { const b = 0.5 + 0.5 * Math.cos(((inf.a || 0) * 4 + (inf.L || 0) / inf.wrap) * TAU); k *= 0.84 + 0.2 * b; } break; }
      case 'cloth': { const g = vn(p[0] * 200, p[1] * 200, p[2] * 200); c = mix3(m.c, m.c2 || m.c, g); break; }
      case 'feather': { c = mix3(m.c, m.c2, sstep(0.3, 0.8, vn(p[1] * 300, p[0] * 900, p[2] * 900))); break; }
      case 'net': { const w = inf.w || 0; c = mix3(m.c2, m.c, 0.62 + 0.38 * w); break; }
      case 'paint': { const g = vn(p[0] * 50, p[1] * 50, p[2] * 50); c = mix3(m.c, m.c2, g * 0.7); if (inf.plank) { const f = ((p[0] + 0.42) / 0.12) % 1; k *= 0.82 + 0.18 * sstep(0, 0.08, Math.min(f, 1 - f)); } break; }
      case 'hair': { const g = vn(p[0] * 30, p[1] * 400, p[2] * 400); c = mix3(m.c, m.c2, g); break; }
    }
    if (inf.plank && m.grain === 'wood') { const f = ((p[0] + 0.42) / 0.12) % 1; k *= 0.8 + 0.2 * sstep(0, 0.08, Math.min(f, 1 - f)); }
    if (m.grain === 'leather' && inf.e) k *= 0.85;
    k *= inf.ao === undefined ? 1 : inf.ao;
    return [[c[0] * k, c[1] * k, c[2] * k], [m.m || 0, clamp((m.g || 0) * (inf.gl || 1), 0, 1), m.p || 0]];
  }
  // build a thing: kind and material and level → the plain arrays (position, normal, colour in linear light, shine, index),
  // its parts, its marks, its off-hand grip; null for a kind without a recipe
  const srgb = x => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  F.build = function (kind, mat, q) {
    const r = R[kind]; if (!r) return null; const M = Mesh(q); r(M, mat, q); if (M.part) M.part.i1 = M.I.length;
    const n = M.P.length / 3; const P = new Float32Array(M.P), N = new Float32Array(n * 3), C = new Float32Array(n * 3), S = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) {
      const p = [M.P[v * 3], M.P[v * 3 + 1], M.P[v * 3 + 2]], nn = [M.N[v * 3], M.N[v * 3 + 1], M.N[v * 3 + 2]]; N.set(nn, v * 3);
      let [c, s] = shade(M.inf[v], p, nn);
      for (const [o, rr, kk] of M.occ) { const d = len(sub(p, o)) / rr; if (d < 1) { const f = 1 - kk * (1 - d) * (1 - d); c = mul(c, f); } }
      C[v * 3] = srgb(clamp(c[0], 0, 1)); C[v * 3 + 1] = srgb(clamp(c[1], 0, 1)); C[v * 3 + 2] = srgb(clamp(c[2], 0, 1)); S.set(s, v * 3);
    }
    const I = n > 65535 ? new Uint32Array(M.I) : new Uint16Array(M.I);
    return { pos: P, nor: N, col: C, shine: S, idx: I, parts: M.parts.map(p => ({ name: p.name, start: p.i0, count: p.i1 - p.i0 })), marks: M.marks, off: M.grip || null, tint: M.tint || 0 };
  };
})(window.G);
