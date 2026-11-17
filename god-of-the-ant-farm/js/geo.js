'use strict';
// ============================================================
//  Geo: the rock under the land (NATUREZA.md §3.2, §3.4; D-466,
//  D-467, D-490 to D-499). What stone each place is made of and
//  the layers it lies in — their heights, their colours, how hard
//  each one stands out —, the same band at the same height from
//  one face of rock to the next (what makes a canyon look like
//  one); the shape a face of cliff is drawn in (its ledges and
//  breaks, carved only inside the tiles no one walks: nothing at
//  any edge with a tile someone stands on); the formations that
//  stand on those faces; and the land beyond the map's edge where
//  the map's own land runs toward it.
//  A pure source: it reads the world (the heights to the hundredth
//  the save keeps, the cliffs, the biomes, the ranges of
//  S.relief, the kind of map, the seed) and never writes it; no
//  chance at all — neither the world's nor the view's: the same
//  world, the same rock, before and after a save. Phase A: only
//  the drawing reads it (the 3D, the god's view); the world never
//  asks (the guard's rule 176).
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Ge = G.Geo = {};
  // (the Space's metre: a tile is 4 m, a unit of height 1.5 m — this file loads before space.js, and the world's metre never changes)
  const TL = 4, HM = 1.5;
  const TAU = Math.PI * 2;

  // ------------------------------ the rocks ------------------------------
  // five stones, each with the colours of its layers (sRGB, the BIBLE's stone: nearly without colour, the sandstone warmer), how thick its
  // layers lie (m), the period its table of layers repeats over (m), how much its hard layers stand out of the soft (0..1), its joints
  // (0 blocks — the granite's square joints; 1 the schist's thin sheets; 2 the sandstone's beds; 3 the limestone's flutes; 4 the basalt's
  // columns), and the sand the sea grinds out of it (the colour of its beaches)
  const ROCKS = Ge.ROCKS = [
    { id: 'granito', name: 'granito', col: [150, 145, 138], pal: [[160, 153, 145], [142, 137, 131], [171, 163, 153], [131, 127, 123], [153, 142, 134]], t: [2.6, 7.5], L: 64, hard: 0.35, joint: 0, sand: [206, 196, 176] },
    { id: 'xisto', name: 'xisto', col: [110, 113, 118], pal: [[106, 110, 116], [124, 124, 126], [94, 98, 105], [134, 130, 124], [114, 118, 112]], t: [0.35, 1.4], L: 24, hard: 0.5, joint: 1, sand: [156, 152, 144] },
    { id: 'arenito', name: 'arenito', col: [184, 130, 92], pal: [[196, 140, 98], [170, 110, 78], [212, 168, 118], [158, 98, 72], [202, 150, 104], [222, 192, 150]], t: [0.8, 3.6], L: 48, hard: 0.9, joint: 2, sand: [224, 182, 132] },
    { id: 'calcario', name: 'calcário', col: [178, 170, 152], pal: [[190, 182, 162], [168, 160, 142], [202, 194, 174], [152, 146, 132], [184, 172, 150]], t: [0.9, 3.1], L: 40, hard: 0.6, joint: 3, sand: [234, 226, 204] },
    { id: 'basalto', name: 'basalto', col: [92, 88, 90], pal: [[86, 82, 86], [102, 95, 92], [76, 74, 80], [116, 100, 88], [94, 90, 96]], t: [1.8, 6], L: 48, hard: 0.5, joint: 4, sand: [98, 94, 94] },
  ];
  const GRANITO = 0, XISTO = 1, ARENITO = 2, CALCARIO = 3, BASALTO = 4;
  Ge.K = { GRANITO, XISTO, ARENITO, CALCARIO, BASALTO };

  // ------------------------------ the seed's noises (made once per world) ------------------------------
  let nzSeed = NaN, nzA = null, nzB = null, nzC = null, nzD = null, nzE = null;
  function noises() {
    const sd = G.S.seed | 0; if (sd === nzSeed) return;
    nzA = G.makeNoise(sd + 5101); nzB = G.makeNoise(sd + 5203); nzC = G.makeNoise(sd + 5309); nzD = G.makeNoise(sd + 5407); nzE = G.makeNoise(sd + 5501); nzSeed = sd;
  }

  // ------------------------------ the table of layers of each rock ------------------------------
  // (each rock lies in bands that repeat over its period, the same in a world and in the same world saved and loaded: the seed only —
  // so a band seen on one face is the same band on the face across the valley at the same height. 256 samples a period: the colour
  // (sRGB), how hard the band is (0..255: the hard ones stand out as ledges); a thin dark line at each joint between two bands)
  const TS = Ge.TS = 256;
  let tabFor = NaN, tab = null, bounds = null, bidx = null;
  function tables() {
    const sd = G.S.seed | 0; if (tab && tabFor === sd) return;
    tab = new Uint8Array(TS * ROCKS.length * 4); bounds = []; bidx = [];
    ROCKS.forEach((R, r) => {
      const b = []; let s = 0, k = 0;
      // (the bands: their thickness from the rock's range, hard and soft alternating, a colour of its palette)
      while (s < R.L - 0.01) {
        const h = G.hash((sd & 0xffff) * 7919 + r * 104729 + k * 31 + 1); let t = R.t[0] + (R.t[1] - R.t[0]) * h;
        if (R.L - (s + t) < R.t[0] * 0.6) t = R.L - s;
        const hard = G.clamp((k % 2 ? 0.25 : 0.75) + (G.hash((sd & 0xffff) * 31 + r * 977 + k * 13 + 5) - 0.5) * 0.5, 0, 1);
        const ci = Math.floor(G.hash((sd & 0xffff) * 13 + r * 211 + k * 7 + 9) * R.pal.length) % R.pal.length;
        b.push({ s0: s, t, hard, col: R.pal[ci] }); s += t; k++;
      }
      bounds.push(b); const bi = new Int16Array(TS); bidx.push(bi);
      for (let j = 0; j < TS; j++) {
        const sm = (j + 0.5) / TS * R.L; let q = 0; while (q < b.length - 1 && sm >= b[q].s0 + b[q].t) q++; const B = b[q]; bi[j] = q;
        const edge = Math.min(sm - B.s0, B.s0 + B.t - sm); const dark = edge < 0.14 ? 0.8 + edge / 0.14 * 0.2 : 1;
        const o = (r * TS + j) * 4; tab[o] = Math.round(B.col[0] * dark); tab[o + 1] = Math.round(B.col[1] * dark); tab[o + 2] = Math.round(B.col[2] * dark); tab[o + 3] = Math.round(B.hard * 255);
      }
    });
    tabFor = sd;
  }
  // the table of the layers of all the rocks (rows of TS samples, RGBA: colour, hardness) — the 3D reads it as a picture
  Ge.table = () => { tables(); return tab; };
  // the band of a rock at a height of its layers s (metres): { s0, t, hard, col, f } — f how far up the band the point is (0..1)
  Ge.bandOf = function (r, s) {
    tables(); const R = ROCKS[r] || ROCKS[0]; const b = bounds[r] || bounds[0]; const L = R.L; const p = Math.floor(s / L); const sm = s - p * L;
    // (the band of the sample, then a step either way: a sample may straddle a joint)
    let q = (bidx[r] || bidx[0])[Math.min(TS - 1, Math.max(0, Math.floor(sm / L * TS)))]; while (q > 0 && sm < b[q].s0) q--; while (q < b.length - 1 && sm >= b[q].s0 + b[q].t) q++; const B = b[q];
    return { s0: p * L + B.s0, t: B.t, hard: B.hard, col: B.col, f: G.clamp((sm - B.s0) / B.t, 0, 1) };
  };
  // (the colour and hardness of a rock's layer at s, as the table reads it — the god's view and the 3D draw the same sample)
  Ge.sample = function (r, s, out) {
    tables(); const R = ROCKS[r] || ROCKS[0]; let u = s / R.L; u -= Math.floor(u); const j = Math.min(TS - 1, Math.floor(u * TS)); const o = ((r | 0) * TS + j) * 4;
    out = out || [0, 0, 0, 0]; out[0] = tab[o]; out[1] = tab[o + 1]; out[2] = tab[o + 2]; out[3] = tab[o + 3]; return out;
  };

  // ------------------------------ the heights, as the save keeps them ------------------------------
  // (a corner's height in hundredths of a unit: the same number in a world and in the same world saved and loaded — save.js keeps S.H
  // to the hundredth)
  const V = () => N + 1;
  const hq = (vx, vy) => Math.round(G.S.H[vy * V() + vx] * 100);
  const tileQ = (x, y) => (hq(x, y) + hq(x + 1, y) + hq(x, y + 1) + hq(x + 1, y + 1)) / 400; // (units)
  // the highest land of the map (units over the sea), for the rock of the heights: made again when the ground changes
  let topFor = '', top = 1;
  function topOf() {
    const S = G.S; const key = (S.typeVer | 0) + ':' + (S.seed | 0) + ':' + N; if (key === topFor) return top;
    let m = 0; const H = S.H; for (let k = 0; k < H.length; k++) { const v = Math.round(H[k] * 100); if (v > m) m = v; }
    top = Math.max(1, m / 100 - G.SEA); topFor = key; return top;
  }

  // ------------------------------ the ranges: the spine of each ------------------------------
  // (how far each tile is from the spine of the nearest range of S.relief, in widths of that range — the ranges are the world's, kept in
  // the save: the cores of granite, the flanks of schist, the layers arched over the core. Made once a world)
  let spFor = '', spD = null, spPk = null;
  function spine() {
    const S = G.S; const rs = (S.relief && S.relief.ranges) || [];
    const key = (S.seed | 0) + ':' + N + ':' + rs.length + ':' + rs.map(R => (R.pts ? R.pts.length : 0) + ',' + (+R.w || 0).toFixed(2)).join(';');
    if (key === spFor && spD) return;
    spD = new Float32Array(N * N).fill(99); spPk = new Float32Array(N * N);
    for (const R of rs) {
      if (!R.pts || !(R.w > 0)) continue; const rad = Math.ceil(R.w * 3.2);
      for (const p of R.pts) {
        const px = p[0], py = p[1];
        for (let ty = Math.max(0, Math.floor(py - rad)); ty <= Math.min(N - 1, Math.ceil(py + rad)); ty++) for (let tx = Math.max(0, Math.floor(px - rad)); tx <= Math.min(N - 1, Math.ceil(px + rad)); tx++) {
          const d = Math.hypot(tx + 0.5 - px, ty + 0.5 - py) / R.w; const i = ty * N + tx; if (d < spD[i]) { spD[i] = d; spPk[i] = +R.peak || 0; }
        }
      }
    }
    spFor = key;
  }
  Ge.spine = i => { spine(); return spD[i]; };

  // ------------------------------ the rock of a place ------------------------------
  // (the cores of the ranges granite — basalt on the highest peaks, here and there —; their flanks schist where it is cold, else
  // schist or limestone; the dry lands sandstone (a field of basalt now and then); the wet and hot ones limestone (sandstone here and
  // there); the cold ones granite and schist; the temperate a mix. The borders between them wander (a noise bent by another: never
  // along the grid); a coast of basalt here and there. By the biome the save keeps)
  Ge.rockAt = function (i) {
    const S = G.S; if (!S || !S.H || i < 0 || i >= N * N) return GRANITO; noises(); spine();
    const x = i % N, y = (i / N) | 0; const e = tileQ(x, y) - G.SEA; const r = e / topOf(); const b = S.biome ? S.biome[i] : 0;
    const wx = G.fbm(nzA, x * 0.035, y * 0.035, 2), q = G.fbm(nzB, x * 0.05 + wx * 1.6, y * 0.05 - wx * 1.6, 3);
    const ds = spD[i];
    if (ds < 1.15 && r > 0.3) return r > 0.72 && q > 0.18 ? BASALTO : GRANITO;
    if (ds < 2.6 && r > 0.15) return b === 1 || b === 2 || q > 0.12 ? XISTO : CALCARIO;
    if (r < 0.3 && G.fbm(nzE, x * 0.04, y * 0.04, 2) > 0.33 && b !== 5 && b !== 6) return BASALTO;
    if (b === 5 || b === 6) return q < -0.42 ? BASALTO : ARENITO;
    if (b === 4 || b === 3) return q > 0.38 ? ARENITO : CALCARIO;
    if (b === 1 || b === 2) return q > 0.05 ? GRANITO : XISTO;
    return q > 0.22 ? CALCARIO : q < -0.3 ? ARENITO : q < -0.12 ? GRANITO : CALCARIO;
  };
  Ge.rock = i => ROCKS[Ge.rockAt(i)];

  // ------------------------------ the fold of the layers ------------------------------
  // (how far the layers are lifted at a tile, in metres — the layer seen at a height Y lies at Y + fold: over the core of a range they
  // arch up (the same band higher on its flanks), over the land they dip gently one way (a few metres in a hundred, by the seed), and
  // bend slowly over a few hundred metres. Smooth: read between the middles of the tiles it is the same band from face to face)
  let fdFor = '', fd = null;
  function foldTile(x, y) {
    const S = G.S; const i = y * N + x; const sd = S.seed | 0;
    const a = G.hash(sd * 3 + 17) * TAU, m = 0.012 + G.hash(sd * 7 + 23) * 0.03;
    const arch = spD[i] < 6 ? -(4 + spPk[i] * 0.45) * Math.exp(-((spD[i] / 1.7) ** 2)) : 0;
    return arch + (Math.cos(a) * (x + 0.5) + Math.sin(a) * (y + 0.5)) * TL * m + 7 * G.fbm(nzC, x * 0.012, y * 0.012, 2);
  }
  Ge.foldAt = function (i) {
    const S = G.S; noises(); spine(); const key = (S.seed | 0) + ':' + N + ':' + spFor;
    if (key !== fdFor || !fd || fd.length !== N * N) { fd = new Float32Array(N * N).fill(NaN); fdFor = key; }
    let v = fd[i]; if (v !== v) { v = fd[i] = foldTile(i % N, (i / N) | 0); } return v;
  };
  // (between the middles of the tiles, as the 3D's shader reads it: the same fold everywhere)
  Ge.fold = function (x, y) {
    const u = G.clamp(x - 0.5, 0, N - 1.001), v = G.clamp(y - 0.5, 0, N - 1.001); const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
    const x1 = Math.min(N - 1, x0 + 1), y1 = Math.min(N - 1, y0 + 1);
    return (Ge.foldAt(y0 * N + x0) * (1 - fx) + Ge.foldAt(y0 * N + x1) * fx) * (1 - fy) + (Ge.foldAt(y1 * N + x0) * (1 - fx) + Ge.foldAt(y1 * N + x1) * fx) * fy;
  };
  // the layer at a point of the world (tiles; Y in metres): its rock, its height in the rock's layers, the band
  Ge.layerAt = function (x, y, Y) { const i = W.idx(G.clamp(x, 0, N - 1), G.clamp(y, 0, N - 1)); const r = Ge.rockAt(i); const s = Y + Ge.fold(x, y); return Object.assign(Ge.bandOf(r, s), { rock: r, s }); };

  // ------------------------------ the carving of the faces of cliff ------------------------------
  // (a tile the drawing may carve: a cliff of the land with nothing of the world on it — no stone, no building, no road, no wall,
  // no cave's mouth — and nobody stands on a cliff: W.walkable)
  let carveMemo = null; // (only inside a batch: the same tile asked again and again while one stretch is carved)
  Ge.carves = function (i) {
    const S = G.S; if (i < 0 || i >= N * N || !S.cliff[i] || S.type[i] < T.SAND) return false;
    if (carveMemo) { const m = carveMemo.get(i); if (m !== undefined) return m; }
    const v = !S.objAt[i] && !S.occ[i] && !S.road[i] && !S.wall[i] && !(S.ice && S.ice[i]) && !(G.Caves && G.Caves.isMouth && S.ug && G.Caves.isMouth(i));
    if (carveMemo) carveMemo.set(i, v); return v;
  };
  // (a stretch carved in one go: what a tile is carved asked once — the world does not change inside one call of the drawing)
  Ge.batch = function (fn) { const was = carveMemo; if (!was) carveMemo = new Map(); try { return fn(); } finally { if (!was) carveMemo = null; } };
  // (how far a point lies from every tile that is not carved — in tiles, at most 2: the carving fades to nothing at their edge)
  function reach(x, y) {
    const tx = Math.floor(x), ty = Math.floor(y); let d = 2;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const X = tx + dx, Y = ty + dy; if (W.inb(X, Y) && Ge.carves(Y * N + X)) continue;
      const ex = Math.max(X - x, 0, x - (X + 1)), ey = Math.max(Y - y, 0, y - (Y + 1)); const q = Math.hypot(ex, ey); if (q < d) d = q;
    }
    return d;
  }
  Ge.reach = reach;
  // the shape the drawing gives a face of cliff at a point (tiles in, metres out): [dv, ox, oz] — how far the drawn face lies under or
  // over the world's ramp there (dv), and how far it is pushed out of the slope (ox, oz: down it). Inside the tiles Ge.carves only, and
  // nothing at all at the edge of any other tile (the world's ground meets it there to the centimetre: the feet, the doors, the steps).
  // The layers make it: each band flat at its foot and steep at its top — benches and risers, the hard bands crisper —, the top of a hard
  // band jutting out a little (its cornice), and the face broken over a couple of metres. Monotonic up the slope: the face never folds
  // over itself. Pure: the heights, the fold, the rock
  const K0 = [0, 0, 0];
  Ge.cliffAt = function (x, y, out) {
    out = out || [0, 0, 0]; out[0] = out[1] = out[2] = 0;
    const S = G.S; if (!S || !W.inb(x, y)) return out; const i = W.idx(x, y); if (!Ge.carves(i)) return out;
    const m = G.smooth(0, 0.42, reach(x, y)); if (m <= 0) return out; noises();
    const h = W.hAt(x, y) * HM; const r = Ge.rockAt(i); const B = Ge.bandOf(r, h + Ge.fold(x, y));
    const R = ROCKS[r]; const p = 1.5 + 1.6 * B.hard * R.hard; const f = B.f; const g = Math.pow(f, p);
    let dv = (g - f) * B.t * 0.95;
    // (the breaks: the face uneven over a couple of metres, more in the blocky granite and the columned basalt)
    dv += 0.35 * (R.joint === 0 || R.joint === 4 ? 1.3 : 1) * G.fbm(nzD, x * 2.2, y * 2.2, 2);
    // (down the slope there: the way a cornice juts)
    const e = 0.18; const gx = W.hAt(x + e, y) - W.hAt(x - e, y), gz = W.hAt(x, y + e) - W.hAt(x, y - e); const gl = Math.hypot(gx, gz);
    let push = 0; if (B.hard > 0.55 && gl > 1e-4) push = (B.hard - 0.55) * 1.1 * G.smooth(0.72, 0.97, f) * (1 - G.smooth(0.97, 1, f)) * R.hard;
    out[0] = dv * m; if (gl > 1e-4) { out[1] = -gx / gl * push * m; out[2] = -gz / gl * push * m; }
    return out;
  };
  // (for the feet of those that stand on a cliff — the climbers, the nests: the drawn face's height at a point, metres; the world's ramp
  // where nothing is carved)
  Ge.cliffY = (x, y) => W.hAt(x, y) * HM + Ge.cliffAt(x, y, K0)[0];

  // ------------------------------ the formations ------------------------------
  // (what stands on the faces of a region of 16 × 16 tiles, by its tiles only: kind — 'bloco' a block jutting from a hard layer,
  // 'pilar' a column (the basalt's prism, the sandstone's and limestone's hoodoo), 'matacao' a boulder resting on a bench, 'arco' an
  // arch of rock standing off a long face —, where (X, Y, Z metres: the foot), its turn (yaw: the way out of the face), its size
  // (sx along the face, sy up, sz out of it, m), the rock, the tile. All inside the column of a carved tile, clear of the edges of the
  // tiles one walks — and an arch over carved tiles only. Made whole when asked; again when what it is made of changes)
  const RG = Ge.R = 16;
  let fmMemo = new Map(), fmFor = '';
  G.worldHooks.push(() => { fmMemo = new Map(); fmFor = ''; });
  function regionSig(rx, ry) {
    const S = G.S; let s = 7; const x0 = rx * RG, y0 = ry * RG;
    for (let y = Math.max(0, y0 - 2); y <= Math.min(N, y0 + RG + 2); y++) for (let x = Math.max(0, x0 - 2); x <= Math.min(N, x0 + RG + 2); x++) s = (s * 31 + hq(x, y)) | 0;
    for (let y = Math.max(0, y0 - 2); y < Math.min(N, y0 + RG + 2); y++) for (let x = Math.max(0, x0 - 2); x < Math.min(N, x0 + RG + 2); x++) { const i = y * N + x; s = (s * 7 + (Ge.carves(i) ? 1 : 0) + (S.biome ? S.biome[i] : 0) * 3) | 0; }
    return s;
  }
  // (the drop of a carved tile: its highest corner over its lowest, metres; and the way down it — the unit vector of the slope)
  function dropOf(x, y) { const a = hq(x, y), b = hq(x + 1, y), c = hq(x, y + 1), d = hq(x + 1, y + 1); return (Math.max(a, b, c, d) - Math.min(a, b, c, d)) / 100 * HM; }
  function downOf(x, y) { const gx = W.hAt(x + 0.2, y) - W.hAt(x - 0.2, y), gz = W.hAt(x, y + 0.2) - W.hAt(x, y - 0.2); const l = Math.hypot(gx, gz) || 1; return [-gx / l, -gz / l]; }
  // (the point of the slope of a tile, from its middle along its fall, where the ground stands at a height: halves the fall, in tiles)
  function pointAt(x, y, d, Y) {
    let lo = -0.5, hi = 0.5; const cx = x + 0.5, cy = y + 0.5; const f = t => W.hAt(cx + d[0] * t, cy + d[1] * t) * HM;
    if ((f(lo) - Y) * (f(hi) - Y) > 0) return null;
    for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if ((f(m) - Y) * (f(lo) - Y) <= 0) hi = m; else lo = m; }
    const t = (lo + hi) / 2; return [cx + d[0] * t, cy + d[1] * t];
  }
  // (a footprint clear of every tile that is not carved: its middle at least its half-width plus a margin from their edge)
  const fits = (x, y, half) => reach(x, y) >= half / TL + 0.12;
  function makeForms(rx, ry) {
    const S = G.S; const out = []; const sd = S.seed | 0; noises();
    for (let y = ry * RG; y < Math.min(N, ry * RG + RG); y++) for (let x = rx * RG; x < Math.min(N, rx * RG + RG); x++) {
      const i = y * N + x; if (!Ge.carves(i)) continue;
      const drop = dropOf(x, y); if (drop < 4) continue; const r = Ge.rockAt(i); const R = ROCKS[r]; const d = downOf(x, y); const yaw = Math.atan2(d[1], d[0]);
      const h0 = G.hash(i * 7 + sd * 13 + 1), h1 = G.hash(i * 11 + sd * 5 + 3), h2 = G.hash(i * 17 + sd * 3 + 7);
      const lo = Math.min(hq(x, y), hq(x + 1, y), hq(x, y + 1), hq(x + 1, y + 1)) / 100 * HM, hi = lo + drop;
      // a block jutting from a hard layer: at the top of the hardest band crossing the face
      if (h0 < 0.55) {
        let best = null; for (let Y = lo + 0.6; Y < hi - 0.6; Y += 0.5) { const B = Ge.bandOf(r, Y + Ge.fold(x + 0.5, y + 0.5)); if (B.hard > 0.6 && (!best || B.hard > best.hard)) best = { Y: B.s0 + B.t - Ge.fold(x + 0.5, y + 0.5), hard: B.hard }; }
        if (best && best.Y > lo + 0.8 && best.Y < hi - 0.4) { const p = pointAt(x, y, d, best.Y); const w = 0.9 + h1 * 1.3;
          if (p && fits(p[0], p[1], w * 0.6)) out.push({ kind: 'bloco', x: p[0], y: p[1], X: p[0] * TL, Y: best.Y - 0.35, Z: p[1] * TL, yaw, sx: w, sy: 0.4 + h2 * 0.45, sz: 0.5 + best.hard * 0.6, rock: r, i }); }
      }
      // a column: the basalt's prisms, the hoodoo of the soft layers — on a tall face
      if ((r === BASALTO || r === ARENITO || r === CALCARIO) && drop > 7 && h1 < (r === BASALTO ? 0.5 : 0.22)) {
        const Yf = lo + drop * 0.12; const p = pointAt(x, y, d, Yf + 0.3); const rad = r === BASALTO ? 0.45 + h2 * 0.25 : 0.55 + h2 * 0.35;
        if (p && fits(p[0], p[1], rad * 1.2)) out.push({ kind: 'pilar', x: p[0], y: p[1], X: p[0] * TL, Y: Yf, Z: p[1] * TL, yaw: yaw + h0 * 1.2, sx: rad * 2, sy: drop * (0.55 + h0 * 0.35), sz: rad * 2, rock: r, i });
      }
      // a boulder fallen onto a bench of the face
      if (h2 < 0.35 && drop > 5) {
        const Yb = lo + drop * (0.3 + h1 * 0.4); const B = Ge.bandOf(r, Yb + Ge.fold(x + 0.5, y + 0.5)); const Yr = B.s0 - Ge.fold(x + 0.5, y + 0.5) + B.t * 0.08; const p = pointAt(x, y, d, Yr);
        const s = 0.45 + h0 * 0.6; if (p && Yr > lo + 0.3 && fits(p[0], p[1], s)) out.push({ kind: 'matacao', x: p[0], y: p[1], X: p[0] * TL, Y: Ge.cliffY(p[0], p[1]) - s * 0.25, Z: p[1] * TL, yaw: h1 * TAU, sx: s * 1.3, sy: s, sz: s * 1.1, rock: r, i });
      }
      // an arch of rock standing off a long face: three carved tiles in a line along it, tall enough
      if (drop > 9 && h0 > 0.9) {
        const ax = Math.abs(d[0]) > Math.abs(d[1]) ? [0, 1] : [1, 0]; const a = [x - ax[0], y - ax[1]], b = [x + ax[0], y + ax[1]];
        if (W.inb(a[0], a[1]) && W.inb(b[0], b[1]) && Ge.carves(a[1] * N + a[0]) && Ge.carves(b[1] * N + b[0]) && dropOf(a[0], a[1]) > 6 && dropOf(b[0], b[1]) > 6) {
          const Ym = lo + drop * 0.25; const p = pointAt(x, y, d, Ym + drop * 0.3);
          if (p && reach(p[0], p[1]) > 0.3) out.push({ kind: 'arco', x: p[0], y: p[1], X: p[0] * TL, Y: Ym, Z: p[1] * TL, yaw: Math.atan2(ax[1], ax[0]), sx: TL * 1.7, sy: drop * 0.42, sz: 1.1 + h1 * 0.6, rock: r, i });
        }
      }
    }
    return out;
  }
  Ge.forms = function (rx, ry) {
    const S = G.S; const key = (S.seed | 0) + ':' + N; if (key !== fmFor) { fmMemo = new Map(); fmFor = key; }
    const k = ry * 4096 + rx; const sg = regionSig(rx, ry); const m = fmMemo.get(k);
    if (m && m.sig === sg) return m.list; const list = makeForms(rx, ry); if (fmMemo.size > 2000) fmMemo.clear(); fmMemo.set(k, { sig: sg, list }); return list;
  };

  // ------------------------------ the land beyond the edge ------------------------------
  // (D-467: the land goes on past the map only where the map's own land runs toward the edge — a continent, an isthmus; the island maps
  // end in the sea, as the expeditions find it. How much each stretch of each side has land toward it: 1 where the land comes within a
  // tenth of the map of the edge, nothing past a third; the stretches smoothed along the side. Sides: 0 west, 1 east, 2 north, 3 south)
  let byFor = '', by = null, byClim = null;
  const LAND_TYPES = { continente: 1, istmo: 1 };
  function beyondOf() {
    const S = G.S; const key = (S.seed | 0) + ':' + N + ':' + (S.typeVer | 0) + ':' + S.mapType; if (key === byFor && by) return by;
    by = new Float32Array(4 * N); byClim = new Float32Array(4 * 7); const gate = LAND_TYPES[S.mapType] ? 1 : 0;
    const R0 = N * 0.1, R1 = N * 0.34; const raw = new Float32Array(N);
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < N; p++) {
        let k = 0; for (; k < N / 2; k++) { const x = s === 0 ? k : s === 1 ? N - 1 - k : p, y = s === 2 ? k : s === 3 ? N - 1 - k : p; const i = y * N + x; if (S.type[i] >= T.SAND) { if (S.biome) byClim[s * 7 + S.biome[i]] += 1; break; } }
        raw[p] = gate * (1 - G.smooth(R0, R1, k));
      }
      // (smoothed along the side: two passes of a window of nine tiles)
      const a = new Float32Array(N); for (let pass = 0; pass < 2; pass++) { const src = pass ? a.slice() : raw; for (let p = 0; p < N; p++) { let sm = 0, n = 0; for (let q = -4; q <= 4; q++) { const j = p + q; if (j < 0 || j >= N) continue; sm += src[j]; n++; } a[p] = sm / n; } }
      by.set(a, s * N);
    }
    byFor = key; return by;
  }
  // how much land lies beyond a stretch of a side (0..1), read between the tiles; and the biome the side's land mostly is
  Ge.beyondLand = function (side, p) { const b = beyondOf(); const u = G.clamp(p, 0, N - 1.001); const k = Math.floor(u), f = u - k; return b[side * N + k] * (1 - f) + b[side * N + Math.min(N - 1, k + 1)] * f; };
  Ge.beyondBiome = function (side) { beyondOf(); let best = 0, bn = -1; for (let b = 0; b < 7; b++) if (byClim[side * 7 + b] > bn) { bn = byClim[side * 7 + b]; best = b; } return best; };
  Ge.beyondAny = function () { const b = beyondOf(); for (let k = 0; k < b.length; k++) if (b[k] > 0.02) return true; return false; };
  // (how much land lies toward a point beyond the edge, metres: the side or sides it faces, the profile read wider the farther out it is
  // — the land of the far ranges spreads past the stretch it rises from)
  function landToward(X, Z) {
    const L = N * TL; const cx = G.clamp(X, 0, L), cz = G.clamp(Z, 0, L); const d = Math.hypot(X - cx, Z - cz); const spread = Math.min(N * 0.4, d / TL * 0.35);
    const read = (side, p) => { let s = 0; for (let q = -2; q <= 2; q++) s += Ge.beyondLand(side, p + q * spread * 0.5); return s / 5; };
    let w = 0, s = 0;
    if (X < 0) { const k = -X; s += read(0, cz / TL) * k; w += k; } if (X > L) { const k = X - L; s += read(1, cz / TL) * k; w += k; }
    if (Z < 0) { const k = -Z; s += read(2, cx / TL) * k; w += k; } if (Z > L) { const k = Z - L; s += read(3, cx / TL) * k; w += k; }
    return { land: w > 0 ? s / w : 0, d };
  }
  // the height of the land beyond the edge at a point (metres, the world's own scale; under the sea where there is none): a shore some
  // tens of metres out, hills, then ranges — ridges of crests that grow with the distance, hundreds of metres high a few kilometres out
  // (D-467: far off they may be grand, they spend no ground of the world). Inside the map: -Infinity (the map's own land)
  Ge.beyondH = function (X, Z) {
    const S = G.S; const L = N * TL; if (X >= 0 && Z >= 0 && X <= L && Z <= L) return -Infinity; noises();
    const sea = G.SEA * HM; const t = landToward(X, Z); if (t.land <= 0.005) return sea - 8;
    const d = t.d; const shore = 50 + 40 * (G.fbm(nzA, X / 220, Z / 220, 2) + 0.5);
    const up = G.smooth(shore - 30, shore + 160, d);
    // (the ridges: a noise folded at its zero — sharp crests, wide valleys —, octave on octave, each weighted by the one before)
    let rid = 0, amp = 1, wgt = 1, f = 1 / 900;
    for (let o = 0; o < 5; o++) { let n = 1 - Math.abs(nzB(X * f + o * 17.3, Z * f - o * 9.1)); n *= n; n *= wgt; wgt = G.clamp(n * 1.6, 0, 1); rid += n * amp; amp *= 0.5; f *= 2.05; }
    rid /= 1.94;
    const lift = 18 + Math.min(1400, d * 0.24); const land = G.smooth(0.05, 0.65, t.land);
    return sea - 8 + up * land * (12 + 8 + lift * rid * (0.45 + 0.55 * G.smooth(0.2, 0.9, t.land)));
  };
  // (the snow's line beyond the edge, metres: low over a cold side, high over a hot one — by the biome the side's land mostly is)
  Ge.snowLine = function (side) { const b = Ge.beyondBiome(side); return b === 1 ? 70 : b === 2 ? 160 : b === 6 || b === 5 ? 720 : b === 4 || b === 3 ? 640 : 380; };
  Ge.sideOf = function (X, Z) { const L = N * TL; const ox = X < 0 ? -X : X > L ? X - L : 0, oz = Z < 0 ? -Z : Z > L ? Z - L : 0; if (ox >= oz) return X < 0 ? 0 : 1; return Z < 0 ? 2 : 3; };

  // ------------------------------ the mouths of the caves ------------------------------
  // (a mouth as the drawing cuts it into the hill: where (metres, its foot), the way into the slope (yaw), its width and height, how deep
  // the dark goes in, the rock it is cut in — from the cave's own kind: a wall's mouth tall, a shelter wide and low, a fissure narrow)
  Ge.mouthOf = function (m, kind) {
    const S = G.S; const i = W.idx(m.x, m.y);
    const hx = W.hAt(m.x + 1.5, m.y + 0.5) - W.hAt(m.x - 0.5, m.y + 0.5), hz = W.hAt(m.x + 0.5, m.y + 1.5) - W.hAt(m.x + 0.5, m.y - 0.5);
    const yaw = m.fx || m.fy ? Math.atan2(-m.fy, -m.fx) : Math.atan2(hz, hx);
    const w = kind === 'fenda' ? 1.4 : kind === 'abrigo' ? 4.4 : 3, h = kind === 'fenda' ? 3.4 : kind === 'abrigo' ? 2.1 : 2.8;
    // (cut into a face: the tile the way in leads to is a carved cliff — the drawing opens a hole in it for the throat)
    const ix = Math.round(m.x + Math.cos(yaw)), iy = Math.round(m.y + Math.sin(yaw)); const carve = W.inb(ix, iy) && Ge.carves(iy * N + ix);
    return { X: (m.x + 0.5) * TL, Y: W.hAt(m.x + 0.5, m.y + 0.5) * HM, Z: (m.y + 0.5) * TL, yaw, w, h, deep: kind === 'abrigo' ? 2.2 : 5, rock: Ge.rockAt(i), kind, carve };
  };
  Ge.version = 1;
})(window.G);
