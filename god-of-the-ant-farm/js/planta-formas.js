'use strict';
// ============================================================
//  PlantaFormas: the shapes of the plants of the forest — the
//  ferns, the aroids and the heliconias, the seedlings, the
//  clumps of palms, the tree ferns, the shrubs, the bamboo, the
//  young trees, the slim palms, the embaúba of the gaps, the
//  fallen logs, the reeds, the thorn bushes, the tussocks — each
//  made once, by code, as plain arrays (no three.js: the 3D turns
//  them into its geometries; the tests read them in Node). The
//  same shape every time (G.hash): what makes two plants of a
//  kind differ is the instance — its size, turn, lean, the spread
//  of its leaves, its tint and its sway (Mata3D) — and where its
//  niche puts it (G.Mata). A metre is 1; the foot at the origin,
//  up is +Y. Per point: the sway it takes (0 at the root, 1 at a
//  leaf's tip), the colour along it (0 the dark of the base, 1 the
//  light of the tip) and its accent (a flower, a bract, a berry).
//  Pure: no chance, no world, no clock (the guard, rule 170).
// ============================================================
(function (G) {
  const PF = G.PlantaFormas = {};
  const TAU = Math.PI * 2, h = k => G.hash(k * 7 + 3);
  // a builder: points (P), normals (N), sway (K), colour along (C), accent (A), triangles (I)
  function mk() { return { P: [], N: [], K: [], C: [], A: [], I: [] }; }
  function v(b, x, y, z, nx, ny, nz, k, c, a) { const l = Math.hypot(nx, ny, nz) || 1; b.P.push(x, y, z); b.N.push(nx / l, ny / l, nz / l); b.K.push(k); b.C.push(c); b.A.push(a || 0); return b.P.length / 3 - 1; }
  const tri = (b, i, j, k) => b.I.push(i, j, k);
  const quad = (b, i, j, k, l) => { b.I.push(i, j, k, i, k, l); };
  // a leaf blade along a bending line: from its base (x, y, z) out along the bearing a, rising at e, its tip drooping by d (of its
  // length), n pieces, its outline by the function wf(u) (0..1 of the width w at u along it); lit mostly up and out (both faces
  // alike: the material turns the back face's normal back)
  function blade(b, x, y, z, a, e, L, w, n, d, wf, k0, k1, c0, c1, acc) {
    const ca = Math.cos(a), sa = Math.sin(a); const px = -sa, pz = ca; let prev = null;
    for (let s = 0; s <= n; s++) {
      const u = s / n; const el = e - d * u * u * 2.2; const r = L * u; const cx = x + ca * Math.cos(el) * r * 0.98, cy = y + Math.sin(e) * r - d * L * u * u, cz = z + sa * Math.cos(el) * r * 0.98;
      const hw = w * 0.5 * wf(u); const k = k0 + (k1 - k0) * u, c = c0 + (c1 - c0) * u;
      const nx = ca * -Math.sin(el) * 0.5, ny = 1, nz = sa * -Math.sin(el) * 0.5;
      // (the midrib a little raised: the two halves of the blade fold up from it, as a real leaf does)
      const l = v(b, cx + px * hw, cy - hw * 0.12, cz + pz * hw, nx + px * 0.3, ny, nz + pz * 0.3, k, c, acc), m = v(b, cx, cy + hw * 0.06, cz, nx, ny, nz, k, c, acc), rr = v(b, cx - px * hw, cy - hw * 0.12, cz - pz * hw, nx - px * 0.3, ny, nz - pz * 0.3, k, c, acc);
      if (prev) { quad(b, prev[0], prev[1], m, l); quad(b, prev[1], prev[2], rr, m); }
      prev = [l, m, rr];
    }
  }
  const wLeaf = u => Math.sin(Math.PI * Math.min(1, u * 1.05)) * (1 - u * 0.15); // (a pointed oval)
  const wHeart = u => (u < 0.15 ? 0.7 + u * 2 : Math.sin(Math.PI * (u * 0.85 + 0.15))); // (a heart: wide at its base)
  const wStrap = u => 1 - u * u * 0.85; // (a strap narrowing to its tip)
  const wPaddle = u => Math.pow(Math.sin(Math.PI * u), 0.6);
  // a fern's frond: a rachis bending out and down, its pinnae on both sides (one triangle each, alternating), shorter toward the tip
  function frond(b, x, y, z, a, e, L, pn, pl, d, k0, c0, up) {
    const ca = Math.cos(a), sa = Math.sin(a); const pts = [];
    for (let s = 0; s <= pn; s++) { const u = s / pn; const el = e - d * u * u * 2.4; pts.push([x + ca * Math.cos(el) * L * u, y + Math.sin(e) * L * u - d * L * u * u, z + sa * Math.cos(el) * L * u, u]); }
    // (the rachis: a thin strip)
    for (let s = 0; s < pn; s++) { const [x0, y0, z0, u0] = pts[s], [x1, y1, z1, u1] = pts[s + 1]; const ww = 0.012 * (1 - u0 * 0.7);
      const i0 = v(b, x0 - sa * ww, y0, z0 + ca * ww, 0, 1, 0, k0 + u0 * (1 - k0), c0 * 0.6, 0), i1 = v(b, x0 + sa * ww, y0, z0 - ca * ww, 0, 1, 0, k0 + u0 * (1 - k0), c0 * 0.6, 0), i2 = v(b, x1 + sa * ww, y1, z1 - ca * ww, 0, 1, 0, k0 + u1 * (1 - k0), c0 * 0.6, 0), i3 = v(b, x1 - sa * ww, y1, z1 + ca * ww, 0, 1, 0, k0 + u1 * (1 - k0), c0 * 0.6, 0); quad(b, i0, i1, i2, i3); }
    for (let s = 1; s < pn; s++) for (const sd of [-1, 1]) {
      const [x0, y0, z0, u] = pts[s]; const [x1, y1, z1] = pts[Math.min(pn, s + 1)]; const ln = pl * Math.sin(Math.PI * Math.min(1, u * 1.1 + 0.08)) * (1 - u * 0.35);
      const pa = a + sd * (1.25 - u * 0.35); const ex = x0 + Math.cos(pa) * ln, ez = z0 + Math.sin(pa) * ln, ey = y0 - ln * (0.18 + u * 0.3) + (up || 0) * ln;
      const kk = k0 + u * (1 - k0), cc = c0 + (1 - c0) * (0.4 + u * 0.6);
      const i0 = v(b, x0, y0, z0, 0, 1, 0, kk, cc * 0.85, 0), i1 = v(b, (x0 + x1) / 2 + (ex - x0) * 0.05, (y0 + y1) / 2, (z0 + z1) / 2 + (ez - z0) * 0.05, 0, 1, 0, kk, cc, 0), i2 = v(b, ex, ey, ez, sd * Math.cos(pa) * 0.3, 1, sd * Math.sin(pa) * 0.3, Math.min(1, kk + 0.15), cc, 0);
      tri(b, i0, i1, i2);
    }
  }
  // a tube from one point to another (a stem, a trunk, a culm): n sides, radius r0 to r1
  function tube(b, x0, y0, z0, x1, y1, z1, r0, r1, n, k0, k1, c0, c1, caps) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0; const L = Math.hypot(dx, dy, dz) || 1e-3; const ux = dx / L, uy = dy / L, uz = dz / L;
    let ax = Math.abs(uy) < 0.9 ? 0 : 1, ay = Math.abs(uy) < 0.9 ? 1 : 0, az = 0; let px = uy * az - uz * ay, py = uz * ax - ux * az, pz = ux * ay - uy * ax; let pl = Math.hypot(px, py, pz) || 1; px /= pl; py /= pl; pz /= pl;
    const qx = uy * pz - uz * py, qy = uz * px - ux * pz, qz = ux * py - uy * px; const base = b.P.length / 3;
    for (let s = 0; s < 2; s++) for (let k = 0; k < n; k++) { const t = k / n * TAU; const c = Math.cos(t), sn = Math.sin(t); const r = s ? r1 : r0; const nx = px * c + qx * sn, ny = py * c + qy * sn, nz = pz * c + qz * sn;
      v(b, (s ? x1 : x0) + nx * r, (s ? y1 : y0) + ny * r, (s ? z1 : z0) + nz * r, nx, ny, nz, s ? k1 : k0, s ? c1 : c0, 0); }
    for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; quad(b, base + k, base + k2, base + n + k2, base + n + k); }
    if (caps) { const t = v(b, x1, y1, z1, ux, uy, uz, k1, c1, 0); for (let k = 0; k < n; k++) tri(b, base + n + k, base + n + (k + 1) % n, t); }
  }
  // a soft lump of leaves (an icosahedron squashed), lit from its own heart
  const ICO = (() => { const t = (1 + Math.sqrt(5)) / 2; const P = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(p => { const l = Math.hypot(...p); return p.map(q => q / l); });
    const F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]]; return { P, F }; })();
  function lump(b, x, y, z, rx, ry, rz, k, seed, acc) {
    const base = b.P.length / 3;
    for (let q = 0; q < 12; q++) { const p = ICO.P[q]; const j = 0.82 + h(seed + q) * 0.36; v(b, x + p[0] * rx * j, y + p[1] * ry * j, z + p[2] * rz * j, p[0], p[1], p[2], k * (0.6 + 0.4 * Math.max(0, p[1])), 0.35 + 0.65 * (p[1] * 0.5 + 0.5), acc); }
    for (const f of ICO.F) tri(b, base + f[0], base + f[2], base + f[1]);
  }
  // (the outward winding of the lumps: their faces seen from out — the faces above were wound in; turned at the end)

  // ------------------------------ the shapes ------------------------------
  const DEF = {};
  // 0 a fern of the forest floor: a rosette of eight arching fronds, the young ones upright in the middle
  DEF.feto = () => { const b = mk(); for (let q = 0; q < 8; q++) { const a = q / 8 * TAU + h(q) * 0.5, L = 0.75 + h(q + 9) * 0.35; frond(b, 0, 0.04, 0, a, 0.95 - h(q + 17) * 0.25, L, 9, 0.17, 0.42, 0.1, 0.25); }
    for (let q = 0; q < 3; q++) frond(b, 0, 0.04, 0, q * 2.1 + 0.4, 1.32, 0.42, 6, 0.09, 0.08, 0.05, 0.45); return b; };
  // 1 the bracken of the temperate clearings: three tall fronds, flat and triangular, held out level
  DEF.samambaia = () => { const b = mk(); for (let q = 0; q < 3; q++) { const a = q * 2.2 + 0.3; tube(b, 0, 0, 0, Math.cos(a) * 0.1, 0.55, Math.sin(a) * 0.1, 0.008, 0.006, 3, 0, 0.2, 0.2, 0.4);
    frond(b, Math.cos(a) * 0.1, 0.55, Math.sin(a) * 0.1, a, 0.2, 0.7, 8, 0.24, 0.18, 0.2, 0.35, 0.15); } return b; };
  // 2 an aroid: big heart leaves on long stalks fanning out from the ground (the philodendron, the taioba)
  DEF.aracea = () => { const b = mk(); for (let q = 0; q < 6; q++) { const a = q / 6 * TAU + h(q + 30) * 0.6, st = 0.35 + h(q + 31) * 0.35; const sx = Math.cos(a) * st * 0.45, sz = Math.sin(a) * st * 0.45;
    tube(b, 0, 0, 0, sx, st, sz, 0.012, 0.009, 3, 0, 0.3, 0.15, 0.35); blade(b, sx, st, sz, a, -0.15 - h(q + 33) * 0.3, 0.42 + h(q + 32) * 0.18, 0.32, 4, 0.15, wHeart, 0.35, 1, 0.45, 1); } return b; };
  // 3 a heliconia: upright paddles of leaves on their stalks, and the hanging chains of red and gold bracts (the lobster claws)
  DEF.heliconia = () => { const b = mk(); for (let q = 0; q < 5; q++) { const a = q / 5 * TAU + h(q + 40) * 0.5, st = 0.6 + h(q + 41) * 0.5; const sx = Math.cos(a) * 0.12, sz = Math.sin(a) * 0.12;
      tube(b, 0, 0, 0, sx, st, sz, 0.014, 0.01, 3, 0, 0.35, 0.2, 0.4); blade(b, sx, st, sz, a, 1.0 - h(q + 42) * 0.35, 0.85, 0.24, 4, 0.12, wPaddle, 0.35, 1, 0.4, 1); }
    for (let q = 0; q < 2; q++) { const a = q * 3.1 + 0.8; const x0 = Math.cos(a) * 0.05, z0 = Math.sin(a) * 0.05, y0 = 1.05 + q * 0.2;
      for (let j = 0; j < 6; j++) { const y = y0 - j * 0.07, sd = j % 2 ? 1 : -1; const bx = x0 + Math.cos(a + sd * 1.3) * 0.02, bz = z0 + Math.sin(a + sd * 1.3) * 0.02; const ex = bx + Math.cos(a + sd * 0.7) * 0.11, ez = bz + Math.sin(a + sd * 0.7) * 0.11;
        const i0 = v(b, bx, y + 0.03, bz, 0, 1, 0, 0.5, 1, 1), i1 = v(b, bx, y - 0.04, bz, 0, 1, 0, 0.5, 1, 1), i2 = v(b, ex, y + 0.035, ez, Math.cos(a), 0.4, Math.sin(a), 0.55, 1, 1); tri(b, i0, i1, i2); } } return b; };
  // 4 a seedling of the forest floor: a thin stem and a few leaves (the next canopy, waiting for a gap)
  DEF.plantula = () => { const b = mk(); tube(b, 0, 0, 0, 0.02, 0.5, 0.01, 0.01, 0.006, 3, 0, 0.6, 0.2, 0.4);
    for (let q = 0; q < 6; q++) { const a = q * 2.4, y = 0.22 + q * 0.055; blade(b, 0.01, y, 0.005, a, 0.15, 0.16 + h(q + 50) * 0.06, 0.08, 2, 0.12, wLeaf, 0.5, 1, 0.5, 1); } return b; };
  // 5 a bromeliad on the ground: a rosette of stiff strap leaves round a red heart
  DEF.bromelia = () => { const b = mk(); for (let q = 0; q < 12; q++) { const a = q / 12 * TAU + (q % 2) * 0.26, e = q % 2 ? 0.75 : 0.45; blade(b, 0, 0.02, 0, a, e, 0.36 + h(q + 60) * 0.12, 0.07, 2, 0.25, wStrap, 0.2, 0.9, 0.3, 1, q < 3 ? 1 : 0); } return b; };
  // 6 a clump of palms of the undergrowth (the açaí, the geonoma): four thin stems leaning out, each with its crown of feathered fronds
  DEF.touceira = () => { const b = mk(); for (let s = 0; s < 4; s++) { const a = s * 1.7 + h(s + 70), lean = 0.18 + h(s + 71) * 0.12, H = 1.8 + h(s + 72) * 1.6; const tx = Math.cos(a) * H * lean, tz = Math.sin(a) * H * lean;
      tube(b, Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08, tx, H, tz, 0.035, 0.028, 4, 0, 0.12, 0.25, 0.35);
      for (let q = 0; q < 4; q++) frond(b, tx, H, tz, q / 4 * TAU + a, 0.65 - h(s * 5 + q) * 0.3, 1.1 + h(s * 7 + q) * 0.3, 7, 0.32, 0.4, 0.2, 0.35); } return b; };
  // 7 a tree fern: a dark fibrous trunk and its crown of great arching fronds, the young ones curled up in the middle
  DEF.fetoArbo = () => { const b = mk(); const H = 3.2; let px = 0, pz = 0; for (let s = 0; s < 4; s++) { const nx = px + 0.04 * (s % 2 ? 1 : -0.6), nz = pz + 0.03, y0 = s * H / 4, y1 = (s + 1) * H / 4; tube(b, px, y0, pz, nx, y1, nz, 0.13 - s * 0.012, 0.12 - s * 0.012, 6, 0, 0.04, 0.1, 0.2); px = nx; pz = nz; }
    for (let q = 0; q < 10; q++) frond(b, px, H, pz, q / 10 * TAU + h(q + 80) * 0.4, 0.55 - h(q + 81) * 0.25, 1.9 + h(q + 82) * 0.4, 9, 0.38, 0.45, 0.15, 0.3);
    for (let q = 0; q < 3; q++) frond(b, px, H, pz, q * 2.1, 1.3, 0.5, 5, 0.1, 0.05, 0.1, 0.5, 0.2); return b; };
  // 8 a broadleaf shrub: a few lumps of leaves on short stems, and loose leaves at its edge
  DEF.arbusto = () => { const b = mk(); for (let q = 0; q < 3; q++) { const a = q * 2.1; tube(b, 0, 0, 0, Math.cos(a) * 0.25, 0.55, Math.sin(a) * 0.25, 0.025, 0.015, 3, 0, 0.1, 0.15, 0.3); }
    lump(b, 0, 0.75, 0, 0.62, 0.48, 0.58, 0.25, 90); for (let q = 0; q < 3; q++) { const a = q * 2.1 + 0.5; lump(b, Math.cos(a) * 0.42, 0.55 + q * 0.08, Math.sin(a) * 0.42, 0.42, 0.36, 0.42, 0.3, 95 + q * 13); }
    for (let q = 0; q < 10; q++) { const a = q / 10 * TAU, y = 0.5 + h(q + 100) * 0.5; blade(b, Math.cos(a) * 0.55, y, Math.sin(a) * 0.55, a, 0.2, 0.18, 0.1, 1, 0.1, wLeaf, 0.4, 0.7, 0.6, 1); } return b; };
  // 9 a clump of bamboo: culms rising and arching out, with their sprays of narrow leaves
  DEF.bambu = () => { const b = mk(); for (let s = 0; s < 7; s++) { const a = s / 7 * TAU + h(s + 110) * 0.5, r = 0.08 + h(s + 111) * 0.12, H = 4.5 + h(s + 112) * 3, lean = 0.12 + h(s + 113) * 0.12;
      let px = Math.cos(a) * r, pz = Math.sin(a) * r, py = 0; for (let j = 0; j < 3; j++) { const u = (j + 1) / 3; const nx = Math.cos(a) * (r + H * lean * u * u), nz = Math.sin(a) * (r + H * lean * u * u), ny = H * u; tube(b, px, py, pz, nx, ny, nz, 0.035 - j * 0.006, 0.03 - j * 0.006, 4, j * 0.15, (j + 1) * 0.15, 0.55, 0.7); px = nx; py = ny; pz = nz;
        if (j) for (let q = 0; q < 2; q++) { const la = a + (q ? 1 : -1) * (0.9 + h(s * 3 + j + q) * 0.5); blade(b, px, py, pz, la, -0.1, 0.55, 0.06, 1, 0.3, wLeaf, 0.5, 1, 0.5, 1); blade(b, px, py - 0.25, pz, la + 0.6, 0.0, 0.45, 0.05, 1, 0.3, wLeaf, 0.45, 1, 0.5, 1); } } } return b; };
  // 10 a young tree of the undergrowth: a slim trunk and a small crown of lumps, the leaves of the shade broad and dark
  DEF.arvoreta = () => { const b = mk(); tube(b, 0, 0, 0, 0.05, 2.6, 0.03, 0.07, 0.045, 5, 0, 0.06, 0.1, 0.25); tube(b, 0.05, 2.6, 0.03, 0.1, 3.4, 0.0, 0.045, 0.03, 4, 0.06, 0.12, 0.25, 0.3);
    lump(b, 0.1, 3.5, 0.0, 0.85, 0.55, 0.8, 0.3, 120); lump(b, -0.35, 3.0, 0.3, 0.55, 0.4, 0.5, 0.3, 133); lump(b, 0.45, 3.05, -0.3, 0.55, 0.42, 0.55, 0.3, 147);
    for (let q = 0; q < 8; q++) { const a = q / 8 * TAU; blade(b, 0.1 + Math.cos(a) * 0.7, 3.2 + h(q + 150) * 0.5, Math.sin(a) * 0.7, a, -0.2, 0.32, 0.15, 2, 0.15, wLeaf, 0.45, 0.8, 0.6, 1); } return b; };
  // 11 a young spruce of the taiga: a thin trunk and tiers of boughs narrowing to its tip
  DEF.abeto = () => { const b = mk(); tube(b, 0, 0, 0, 0, 3.6, 0, 0.06, 0.02, 4, 0, 0.1, 0.1, 0.2);
    for (let t = 0; t < 5; t++) { const y = 0.5 + t * 0.62, r = 0.95 - t * 0.17; const top = v(b, 0, y + 0.55, 0, 0, 1, 0, 0.15, 0.85, 0); const n = 8, base = b.P.length / 3;
      for (let k = 0; k < n; k++) { const a = k / n * TAU + t * 0.4; const rr = r * (k % 2 ? 0.7 : 1); v(b, Math.cos(a) * rr, y - (k % 2 ? 0 : 0.08), Math.sin(a) * rr, Math.cos(a), 0.6, Math.sin(a), 0.25 + (1 - t / 5) * 0.1, 0.35, 0); }
      for (let k = 0; k < n; k++) tri(b, top, base + (k + 1) % n, base + k); } return b; };
  // 12 a slim palm of the forest (the juçara, the açaí alone): a thin grey ringed trunk to eleven metres, a small crown of drooping fronds
  DEF.palmeira = () => { const b = mk(); const H = 10; let px = 0, pz = 0; for (let s = 0; s < 5; s++) { const nx = px + 0.06 * Math.sin(s * 1.3), nz = pz + 0.05, y0 = s * H / 5, y1 = (s + 1) * H / 5; tube(b, px, y0, pz, nx, y1, nz, 0.11 - s * 0.008, 0.1 - s * 0.008, 5, s * 0.04, (s + 1) * 0.04, 0.55, 0.62); px = nx; pz = nz; }
    tube(b, px, H, pz, px, H + 0.9, pz, 0.1, 0.085, 5, 0.2, 0.25, 0.15, 0.25); for (let q = 0; q < 9; q++) frond(b, px, H + 0.85, pz, q / 9 * TAU + h(q + 160) * 0.3, 0.45 - h(q + 161) * 0.35, 2.3 + h(q + 162) * 0.5, 8, 0.5, 0.55, 0.3, 0.35); return b; };
  // 13 the embaúba of the gaps: a pale straight trunk with rings, branches like a candelabra, and its great hand-shaped leaves at their tips
  DEF.embauba = () => { const b = mk(); const H = 7; tube(b, 0, 0, 0, 0.05, H, 0.04, 0.12, 0.08, 6, 0, 0.08, 0.85, 0.95);
    for (let q = 0; q < 4; q++) { const a = q * 1.57 + 0.3; const ex = Math.cos(a) * 1.4, ez = Math.sin(a) * 1.4; tube(b, 0.05, H - 0.4, 0.04, ex, H + 0.9, ez, 0.05, 0.035, 4, 0.08, 0.18, 0.85, 0.95);
      // (the palmate leaf: seven lobes spread round the leaf's stalk, held out nearly level)
      for (let j = 0; j < 7; j++) { const la = a + (j - 3) * 0.42; blade(b, ex, H + 0.95, ez, la, -0.15, 0.75, 0.2, 2, 0.12, wLeaf, 0.4, 1, 0.35, 1); } }
    for (let j = 0; j < 7; j++) blade(b, 0.05, H + 0.1, 0.04, j * 0.9, -0.1, 0.65, 0.18, 2, 0.15, wLeaf, 0.4, 1, 0.35, 1); return b; };
  // 14 a fallen log: an old trunk lying half sunk, its broken end, moss on its back and a few bracket fungi (accent)
  DEF.tronco = () => { const b = mk(); tube(b, -2.2, 0.16, 0, 2.2, 0.12, 0.04, 0.26, 0.22, 7, 0, 0, 0.3, 0.3, false);
    for (let q = 0; q < 5; q++) { const x = -1.8 + q * 0.85, s = 0.1 + h(q + 170) * 0.06; const i0 = v(b, x, 0.36, 0.13, 0, 1, 0.4, 0, 0.9, 1), i1 = v(b, x + s * 2, 0.36, 0.14, 0, 1, 0.4, 0, 0.9, 1), i2 = v(b, x + s, 0.36, 0.13 + s * 1.4, 0, 1, 0.2, 0, 1, 1); tri(b, i0, i1, i2); }
    for (let q = 0; q < 6; q++) { const x = -2 + q * 0.75; lump(b, x, 0.36, 0.0, 0.32, 0.08, 0.2, 0, 180 + q * 7); } return b; };
  // 15 reeds and cattails of the wet ground: tall blades and three brown heads
  DEF.junco = () => { const b = mk(); for (let q = 0; q < 12; q++) { const a = q / 12 * TAU + h(q + 190), r = 0.05 + h(q + 191) * 0.08; blade(b, Math.cos(a) * r, 0, Math.sin(a) * r, a, 1.35 - h(q + 192) * 0.2, 1.2 + h(q + 193) * 0.5, 0.035, 3, 0.12, wStrap, 0, 1, 0.3, 1); }
    for (let q = 0; q < 3; q++) { const a = q * 2.1; const x = Math.cos(a) * 0.06, z = Math.sin(a) * 0.06; tube(b, x, 0, z, x, 1.5 + q * 0.1, z, 0.008, 0.006, 3, 0, 0.5, 0.3, 0.5); tube(b, x, 1.5 + q * 0.1, z, x, 1.72 + q * 0.1, z, 0.03, 0.028, 5, 0.5, 0.55, 0.0, 0.05, true); } return b; };
  // 16 a thorn bush of the dry lands: bare twisting twigs, a few small grey leaves
  DEF.espinho = () => { const b = mk(); const br = (x, y, z, a, e, L, d, s) => { const ex = x + Math.cos(a) * Math.cos(e) * L, ey = y + Math.sin(e) * L, ez = z + Math.sin(a) * Math.cos(e) * L; tube(b, x, y, z, ex, ey, ez, 0.022 * (3 - d) / 3 + 0.006, 0.012 * (3 - d) / 3 + 0.004, 3, d * 0.15, (d + 1) * 0.15, 0.1, 0.25);
      if (d < 1) for (let q = 0; q < 2; q++) br(ex, ey, ez, a + (q ? 0.7 : -0.6) + h(s + q) * 0.3, e - 0.2, L * 0.65, d + 1, s * 3 + q); else lump(b, ex, ey, ez, 0.16, 0.08, 0.16, 0.3, s); };
    for (let q = 0; q < 4; q++) br(0, 0, 0, q * 1.57 + 0.3, 0.9, 0.55, 0, 200 + q * 11); return b; };
  // 17 a tussock of the dry or the cold lands: stiff blades in a clump, the dead ones pale at the edge
  DEF.tufo = () => { const b = mk(); for (let q = 0; q < 14; q++) { const a = q / 14 * TAU + h(q + 220) * 0.4; blade(b, Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04, a, 1.0 + h(q + 221) * 0.4, 0.45 + h(q + 222) * 0.25, 0.025, 2, 0.25, wStrap, 0, 1, q % 3 ? 0.25 : 0.9, 1); } return b; };
  // 18 a low shrub of the taiga and the tundra (the bilberry, the dwarf willow): low lumps, a few red berries (accent)
  DEF.rasteiro = () => { const b = mk(); lump(b, 0, 0.16, 0, 0.42, 0.16, 0.38, 0.2, 230); lump(b, 0.32, 0.12, 0.18, 0.28, 0.12, 0.26, 0.2, 241); lump(b, -0.28, 0.1, -0.12, 0.26, 0.11, 0.3, 0.2, 252);
    for (let q = 0; q < 5; q++) { const a = q * 1.3; lump(b, Math.cos(a) * 0.32, 0.27, Math.sin(a) * 0.3, 0.035, 0.035, 0.035, 0.2, 260 + q, 1); } return b; };

  // 19 a termite mound of the savanna: a lumpy red-earth tower with buttresses and a chimney or two
  DEF.cupim = () => { const b = mk(); const n = 9; let prev = null;
    for (let s = 0; s <= 5; s++) { const u = s / 5, y = u * 2.2, r = 0.75 * (1 - u * 0.78) + 0.06; const ring = [];
      for (let k = 0; k < n; k++) { const a = k / n * TAU; const rr = r * (0.82 + h(s * 13 + k + 270) * 0.36) * (1 + 0.25 * Math.cos(a * 3 + s)); ring.push(v(b, Math.cos(a) * rr, y, Math.sin(a) * rr, Math.cos(a), 0.35, Math.sin(a), 0, 0.3 + u * 0.4, 0)); }
      if (prev) for (let k = 0; k < n; k++) quad(b, prev[k], ring[k], ring[(k + 1) % n], prev[(k + 1) % n]); prev = ring; }
    const top = v(b, 0.05, 2.45, 0.02, 0, 1, 0, 0, 0.75, 0); for (let k = 0; k < n; k++) tri(b, prev[k], top, prev[(k + 1) % n]);
    tube(b, 0.35, 0.4, 0.2, 0.42, 1.45, 0.26, 0.16, 0.06, 5, 0, 0, 0.35, 0.6, true); return b; };

  // ------------------------------ the catalogue ------------------------------
  // each shape: its name, the layer it lives in (r: the floor's — rasteira —, a: the shrubs' — arbustiva —, s: a hard stem), its
  // base colour (the dark of its base and the light of its tip are made from it), its accent and how much it gives to the wind
  PF.KINDS = [
    { id: 'feto', make: DEF.feto, layer: 'r', col: [62, 104, 50], acc: null, sway: 0.7 },
    { id: 'samambaia', make: DEF.samambaia, layer: 'r', col: [92, 120, 52], acc: null, sway: 0.6 },
    { id: 'aracea', make: DEF.aracea, layer: 'r', col: [46, 92, 44], acc: null, sway: 0.5 },
    { id: 'heliconia', make: DEF.heliconia, layer: 'r', col: [58, 104, 52], acc: [[196, 54, 36], [214, 150, 40], [200, 80, 40]], sway: 0.55 },
    { id: 'plantula', make: DEF.plantula, layer: 'r', col: [70, 116, 56], acc: null, sway: 0.6 },
    { id: 'bromelia', make: DEF.bromelia, layer: 'r', col: [84, 110, 58], acc: [[180, 40, 60], [200, 70, 50], [170, 60, 120]], sway: 0.2 },
    { id: 'touceira', make: DEF.touceira, layer: 'a', col: [56, 98, 50], acc: null, sway: 0.6 },
    { id: 'fetoArbo', make: DEF.fetoArbo, layer: 's', col: [60, 104, 52], acc: null, sway: 0.45, bark: [62, 48, 38] },
    { id: 'arbusto', make: DEF.arbusto, layer: 'a', col: [60, 100, 50], acc: null, sway: 0.4 },
    { id: 'bambu', make: DEF.bambu, layer: 's', col: [104, 132, 60], acc: null, sway: 0.5, bark: [120, 140, 70] },
    { id: 'arvoreta', make: DEF.arvoreta, layer: 's', col: [54, 92, 46], acc: null, sway: 0.3, bark: [96, 82, 64] },
    { id: 'abeto', make: DEF.abeto, layer: 's', col: [42, 84, 58], acc: null, sway: 0.25, bark: [80, 62, 46] },
    { id: 'palmeira', make: DEF.palmeira, layer: 's', col: [64, 106, 52], acc: null, sway: 0.5, bark: [128, 124, 112] },
    { id: 'embauba', make: DEF.embauba, layer: 's', col: [84, 118, 70], acc: null, sway: 0.4, bark: [196, 192, 178] },
    { id: 'tronco', make: DEF.tronco, layer: 'r', col: [88, 70, 52], acc: [[196, 160, 110], [214, 120, 60], [180, 170, 150]], sway: 0, moss: [58, 92, 40] },
    { id: 'junco', make: DEF.junco, layer: 'r', col: [96, 120, 62], acc: null, sway: 0.7 },
    { id: 'espinho', make: DEF.espinho, layer: 'a', col: [104, 96, 70], acc: null, sway: 0.2, bark: [96, 80, 62] },
    { id: 'tufo', make: DEF.tufo, layer: 'r', col: [150, 140, 92], acc: null, sway: 0.6 },
    { id: 'rasteiro', make: DEF.rasteiro, layer: 'r', col: [64, 92, 52], acc: [[150, 30, 50], [70, 60, 140], [170, 40, 40]], sway: 0.2 },
    { id: 'cupim', make: DEF.cupim, layer: 'a', col: [168, 104, 70], acc: null, sway: 0 },
  ];
  PF.BY = {}; PF.KINDS.forEach((k, n) => { k.n = n; PF.BY[k.id] = k; });
  // the shape of a kind, made once: plain typed arrays (P, N: xyz; K, C, A: one a point; I: the triangles), its bounds and its count
  const made = new Map();
  PF.shape = function (id) {
    let s = made.get(id); if (s) return s; const k = PF.BY[id]; if (!k) return null; const b = k.make();
    // (the lumps were wound in: every triangle wound so its face looks the way its points' normals do)
    for (let t = 0; t < b.I.length; t += 3) { const [i, j, l] = [b.I[t], b.I[t + 1], b.I[t + 2]]; const P = b.P, Nn = b.N;
      const ux = P[j * 3] - P[i * 3], uy = P[j * 3 + 1] - P[i * 3 + 1], uz = P[j * 3 + 2] - P[i * 3 + 2], wx = P[l * 3] - P[i * 3], wy = P[l * 3 + 1] - P[i * 3 + 1], wz = P[l * 3 + 2] - P[i * 3 + 2];
      const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx; if (nx * (Nn[i * 3] + Nn[j * 3] + Nn[l * 3]) + ny * (Nn[i * 3 + 1] + Nn[j * 3 + 1] + Nn[l * 3 + 1]) + nz * (Nn[i * 3 + 2] + Nn[j * 3 + 2] + Nn[l * 3 + 2]) < 0) { b.I[t + 1] = l; b.I[t + 2] = j; } }
    let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let q = 0; q < b.P.length; q += 3) for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], b.P[q + c]); hi[c] = Math.max(hi[c], b.P[q + c]); }
    s = { id, P: new Float32Array(b.P), N: new Float32Array(b.N), K: new Float32Array(b.K.map(x => x * k.sway)), C: new Float32Array(b.C), A: new Float32Array(b.A), I: new Uint16Array(b.I), tris: b.I.length / 3, verts: b.P.length / 3, lo, hi };
    made.set(id, s); return s;
  };
  // (the measure the tests read: every shape's triangles and points, and whether every number is a number)
  PF.check = function () {
    const out = [];
    for (const k of PF.KINDS) { const s = PF.shape(k.id); for (const a of [s.P, s.N, s.K, s.C, s.A]) for (const x of a) if (!Number.isFinite(x)) { out.push(`${k.id}: um número que não é número`); break; }
      for (const i of s.I) if (i >= s.verts) { out.push(`${k.id}: um triângulo aponta para fora dos pontos`); break; }
      if (s.lo[1] < -0.13) out.push(`${k.id}: abaixo do chão (${s.lo[1].toFixed(2)} m)`); if (s.tris > 700) out.push(`${k.id}: ${s.tris} triângulos (o teto de uma forma: 700)`); }
    return out;
  };
})(window.G);
