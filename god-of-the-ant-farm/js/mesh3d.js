'use strict';
// ============================================================
//  Mesh3D: the shapes made outside the game — modelled in
//  Blender, written by arte/blender/exporta.py as data files
//  (js/mesh-<name>.js → G.MESH3D[name]: base64 arrays, so the
//  game still opens from the disk with nothing to fetch) — read
//  back into three.js geometry, once, when first asked.
//  Metres, Y up, the front toward +Z. Two forms: the floats (v 1,
//  the exporter's) and the 16 bits (v 2: the interiors' libraries,
//  arte/blender/pacotes.py — the points and the uv as whole numbers
//  over their boxes, the normals octahedral in two bytes, the light
//  a point gives itself one grey byte; D-1021). Each material of
//  the model is a part (one run of the index), so a builder can
//  paint each its own colour and pattern:
//    g.put(G.Mesh3D.part('dragao', 'madeira'), R3.mat(...), cor)
//  Only seen: nothing here touches the world.
// ============================================================
(function (G) {
  const M3 = G.Mesh3D = {};
  G.MESH3D = G.MESH3D || {};
  const geos = new Map(), parts = new Map();
  const T = () => (G.Realm && G.Realm.three && G.Realm.three()) || window.THREE;
  // (base64 to a typed array of the kind the exporter wrote: little-endian, as every machine that runs a browser is)
  function arr(b64, Kind) {
    const s = atob(b64); const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return new Kind(u.buffer, 0, u.byteLength / Kind.BYTES_PER_ELEMENT);
  }
  // (sRGB 0..255 to the linear floats the vertex colours of the 3D are kept in)
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  M3.has = name => !!G.MESH3D[name];
  M3.list = () => Object.keys(G.MESH3D);
  M3.info = function (name) {
    const d = G.MESH3D[name]; if (!d) return null;
    return { n: d.n, t: d.t, box: d.box.slice(), parts: d.parts.map(p => p[0]), uv: !!(d.uv || d.u16), col: !!(d.col || d.cg), skin: !!d.skin };
  };
  M3.box = name => { const d = G.MESH3D[name]; return d ? { lo: d.box.slice(0, 3), hi: d.box.slice(3) } : null; };
  // (the 16-bit form — v 2, the interiors' libraries of models, D-1021 (arte/blender/pacotes.py writes it) —: whole numbers of 16
  // bits over a box back to the metres they stand for; a normal's two bytes (octahedral) back to the unit vector — the fauna's own)
  const over = (q, b, k, s) => { const out = new Float32Array(q.length); const sc = []; for (let a = 0; a < k; a++) sc.push((b[a + s] - b[a]) / 65535);
    for (let i = 0; i < q.length; i += k) for (let a = 0; a < k; a++) out[i + a] = b[a] + q[i + a] * sc[a]; return out; };
  function unoct(o) {
    const nf = new Float32Array(o.length / 2 * 3);
    for (let i = 0, j = 0; i < o.length; i += 2, j += 3) { let x = o[i] / 127, y = o[i + 1] / 127; const z = 1 - Math.abs(x) - Math.abs(y);
      if (z < 0) { const ax = Math.abs(x), ay = Math.abs(y); x = (1 - ay) * (x >= 0 ? 1 : -1); y = (1 - ax) * (y >= 0 ? 1 : -1); }
      const l = Math.hypot(x, y, z) || 1; nf[j] = x / l; nf[j + 1] = y / l; nf[j + 2] = z / l; }
    return nf;
  }
  // the whole model as one geometry (position, normal, index; uv, color, skinIndex/skinWeight when it has them; a
  // group for each part) — shared: do not dispose it, clone it to change it
  M3.geo = function (name) {
    let g = geos.get(name); if (g) return g;
    const d = G.MESH3D[name]; const THREE = T(); if (!d || !THREE) return null;
    g = new THREE.BufferGeometry();
    if (d.v === 2) {
      g.setAttribute('position', new THREE.BufferAttribute(over(arr(d.p16, Uint16Array), d.box, 3, 3), 3));
      g.setAttribute('normal', new THREE.BufferAttribute(unoct(arr(d.n8, Int8Array)), 3));
      if (d.u16) g.setAttribute('uv', new THREE.BufferAttribute(over(arr(d.u16, Uint16Array), d.ub, 2, 2), 2));
      if (d.cg) { const c8 = arr(d.cg, Uint8Array), cf = new Float32Array(c8.length * 3); for (let i = 0; i < c8.length; i++) cf[i * 3] = cf[i * 3 + 1] = cf[i * 3 + 2] = lin(c8[i]); g.setAttribute('color', new THREE.BufferAttribute(cf, 3)); }
    } else {
      g.setAttribute('position', new THREE.BufferAttribute(arr(d.pos, Float32Array), 3));
      const n8 = arr(d.nor, Int8Array), nf = new Float32Array(n8.length);
      for (let i = 0; i < n8.length; i += 3) { const x = n8[i], y = n8[i + 1], z = n8[i + 2], l = Math.hypot(x, y, z) || 1; nf[i] = x / l; nf[i + 1] = y / l; nf[i + 2] = z / l; }
      g.setAttribute('normal', new THREE.BufferAttribute(nf, 3));
      if (d.uv) g.setAttribute('uv', new THREE.BufferAttribute(arr(d.uv, Float32Array), 2));
    }
    g.setIndex(new THREE.BufferAttribute(arr(d.idx, d.i32 ? Uint32Array : Uint16Array), 1));
    if (d.col) { const c8 = arr(d.col, Uint8Array), cf = new Float32Array(c8.length); for (let i = 0; i < c8.length; i++) cf[i] = lin(c8[i]); g.setAttribute('color', new THREE.BufferAttribute(cf, 3)); }
    if (d.skin) { g.setAttribute('skinIndex', new THREE.BufferAttribute(arr(d.skin.j, Uint8Array), 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(arr(d.skin.w, Uint8Array), 4, true)); }
    d.parts.forEach((p, k) => g.addGroup(p[1], p[2], k));
    g.computeBoundingBox(); g.computeBoundingSphere();
    geos.set(name, g); return g;
  };
  // one part of a model (its own run of the index over the same points): what the chunk builder's put() takes, one
  // colour to a part — shared as well
  M3.part = function (name, part) {
    const key = name + '/' + part; let g = parts.get(key); if (g) return g;
    const all = M3.geo(name); const d = G.MESH3D[name]; if (!all) return null;
    const p = d.parts.find(q => q[0] === part); if (!p) return null;
    g = new (T().BufferGeometry)();
    for (const k in all.attributes) g.setAttribute(k, all.attributes[k]);
    const I = all.index.array; g.setIndex(new (T().BufferAttribute)(I.slice(p[1], p[1] + p[2]), 1));
    g.computeBoundingSphere();
    parts.set(key, g); return g;
  };
  M3.parts = name => { const d = G.MESH3D[name]; return d ? d.parts.map(p => p[0]) : []; };
  // its own proof: every model decodes to what its file says — the counts, the index inside the points, no NaN, the
  // normals of length one, the box the points' own, the parts covering every triangle once
  M3.check = function () {
    const bad = [];
    for (const name of M3.list()) {
      const d = G.MESH3D[name]; let g;
      try { g = M3.geo(name); } catch (e) { bad.push(`${name}: não decodifica (${e.message})`); continue; }
      if (!g) { bad.push(`${name}: sem geometria (sem THREE?)`); continue; }
      const P = g.attributes.position.array, N = g.attributes.normal.array, I = g.index.array;
      if (P.length !== d.n * 3 || N.length !== d.n * 3) bad.push(`${name}: ${P.length / 3} pontos e ${N.length / 3} normais, o arquivo diz ${d.n}`);
      if (I.length !== d.t * 3) bad.push(`${name}: ${I.length / 3} triângulos, o arquivo diz ${d.t}`);
      let nan = 0, out = 0, unit = 0; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      for (let i = 0; i < P.length; i++) { if (!Number.isFinite(P[i])) nan++; const a = i % 3; lo[a] = Math.min(lo[a], P[i]); hi[a] = Math.max(hi[a], P[i]); }
      for (let i = 0; i < N.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]); if (!(Math.abs(l - 1) < 0.02)) unit++; }
      for (let i = 0; i < I.length; i++) if (I[i] >= d.n) out++;
      if (nan) bad.push(`${name}: ${nan} coordenadas que não são números`);
      if (unit) bad.push(`${name}: ${unit} normais sem comprimento 1`);
      if (out) bad.push(`${name}: ${out} índices fora dos pontos`);
      for (let a = 0; a < 3; a++) if (Math.abs(lo[a] - d.box[a]) > 1e-3 || Math.abs(hi[a] - d.box[a + 3]) > 1e-3) { bad.push(`${name}: a caixa não é a dos pontos`); break; }
      let cover = 0, next = 0; for (const p of d.parts) { if (p[1] !== next || p[2] % 3) bad.push(`${name}: a parte ${p[0]} não segue a anterior`); next = p[1] + p[2]; cover += p[2]; }
      if (cover !== I.length) bad.push(`${name}: as partes cobrem ${cover / 3} de ${I.length / 3} triângulos`);
    }
    return bad;
  };
})(window.G);
