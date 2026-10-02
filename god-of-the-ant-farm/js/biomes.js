'use strict';
// ============================================================
//  Biomes: a climate (temperature by latitude and altitude,
//  moisture from noise, rivers and coasts) decides where there
//  is snow, taiga, temperate woods, swamp, jungle, savanna and
//  desert — their ground, their trees, how fertile and how
//  easy to cross they are, and which animals live there.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const B = G.Biome = {};
  const ID = B.ID = { TEMP: 0, NEVE: 1, TAIGA: 2, PANTANO: 3, SELVA: 4, SAVANA: 5, DESERTO: 6 };
  // trees: [kind, weight]; dens: chance inside a forest patch; sparse: chance outside; patch: forest-noise threshold
  G.BIOMES = [
    { id: 'temperado', to: 'à floresta temperada', name: 'Floresta Temperada', adj: 'temperada', fert: 1, cost: 1, speed: 1, trees: [['oak', 5], ['pine', 2], ['birch', 2]], dens: 0.58, sparse: 0.035, patch: 0.07, bush: 0.07, fire: 1, grow: 1 },
    { id: 'neve', to: 'à tundra gelada', name: 'Tundra Gelada', adj: 'gelada', fert: 0.3, cost: 1.15, speed: 0.8, trees: [['snowpine', 1]], dens: 0.22, sparse: 0.02, patch: 0.1, bush: 0.012, fire: 0, grow: 0.45 },
    { id: 'taiga', to: 'à taiga', name: 'Taiga', adj: 'boreal', fert: 0.62, cost: 1.05, speed: 0.9, trees: [['pine', 3], ['snowpine', 2], ['birch', 1]], dens: 0.62, sparse: 0.05, patch: 0.02, bush: 0.035, fire: 0.8, grow: 0.75 },
    { id: 'pantano', to: 'ao pântano', name: 'Pântano', adj: 'pantanosa', fert: 0.9, cost: 1.4, speed: 0.68, trees: [['willow', 1]], dens: 0.32, sparse: 0.09, patch: 0.0, bush: 0.08, fire: 0.15, grow: 1.1 },
    { id: 'selva', to: 'à floresta tropical', name: 'Floresta Tropical', adj: 'tropical', fert: 1.22, cost: 1.12, speed: 0.85, trees: [['jungle', 5], ['palm', 1]], dens: 0.82, sparse: 0.16, patch: -0.06, bush: 0.1, fire: 0.45, grow: 1.4 },
    { id: 'savana', to: 'à savana', name: 'Savana', adj: 'da savana', fert: 0.78, cost: 1, speed: 1, trees: [['acacia', 5], ['baobab', 1]], dens: 0.13, sparse: 0.025, patch: 0.12, bush: 0.035, fire: 1.5, grow: 0.8 },
    { id: 'deserto', to: 'ao deserto', name: 'Deserto', adj: 'do deserto', fert: 0.22, cost: 1.08, speed: 0.9, trees: [['cactus', 4], ['palm', 1]], dens: 0.05, sparse: 0.012, patch: 0.15, bush: 0.006, fire: 0, grow: 0.5 },
  ];
  B.CLIMAS = {
    variado: { name: 'Variado', desc: 'Neve ao norte, trópicos ao sul — mapas pequenos pegam uma faixa sorteada.' },
    frio: { name: 'Frio', desc: 'Tundra, taiga e florestas de pinheiros.', band: [-0.02, 0.44] },
    temperado: { name: 'Temperado', desc: 'Bosques, campos floridos e pântanos.', band: [0.3, 0.62] },
    tropical: { name: 'Tropical', desc: 'Selvas, savanas e pântanos quentes.', band: [0.6, 1.0], wet: 0.12 },
    arido: { name: 'Árido', desc: 'Desertos, savanas e oásis ao longo dos rios.', band: [0.55, 1.02], wet: -0.3 },
  };
  B.of = i => (G.S.biome ? G.S.biome[i] : 0);
  B.at = (x, y) => (W.inb(x, y) ? B.of(W.idx(x, y)) : 0);
  B.def = i => G.BIOMES[B.of(i)] || G.BIOMES[0];
  B.cold = i => { const b = B.of(i); return b === ID.NEVE || b === ID.TAIGA; };

  // ------------------------------ climate ------------------------------
  // deterministic from the seed and the terrain, so a save only stores biomes
  B.climate = function (S) {
    const n = G.makeNoise(S.seed + 404), m = G.makeNoise(S.seed + 505);
    const cl = B.CLIMAS[S.clima] ? S.clima : 'variado';
    let band = B.CLIMAS[cl].band;
    if (!band) {
      if (N >= 96) band = [-0.04, 1.04];
      else { const r = G.mulberry32(S.seed * 7 + 9)(); const w = N >= 80 ? 0.78 : 0.66; const c = 0.3 + r * 0.4; band = [c - w / 2, c + w / 2]; }
    }
    const wet = B.CLIMAS[cl].wet || 0;
    S.temp = new Uint8Array(N * N); S.moist = new Uint8Array(N * N);
    // distance to rivers & lakes (fresh water feeds the land around it)
    const dR = new Int16Array(N * N).fill(99); const q = [];
    for (let i = 0; i < N * N; i++) if (S.type[i] === T.RIVER) { dR[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) {
      const a = q[h]; if (dR[a] >= 8) continue; const x = a % N, y = (a / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (dR[j] > dR[a] + 1) { dR[j] = dR[a] + 1; q.push(j); } }
    }
    const dO = G.dOcean;
    // stretch the latitudes over the land itself: the north tip is always the coldest
    let l0 = 1, l1 = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (S.type[y * N + x] >= T.RIVER) { const l = (x + y) / (2 * (N - 1)); if (l < l0) l0 = l; if (l > l1) l1 = l; }
    if (l1 - l0 < 0.2) { l0 = 0; l1 = 1; }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const lat = G.clamp(((x + y) / (2 * (N - 1)) - l0) / (l1 - l0), 0, 1);
      const th = W.tileH(i);
      let t = band[0] + (band[1] - band[0]) * lat + G.fbm(n, x * 0.032, y * 0.032, 3) * 0.2 - Math.max(0, th - G.SEA - 2.2) * 0.027;
      let mo = 0.5 + G.fbm(m, x * 0.042 + 13, y * 0.042 - 7, 3) * 1.25 + (dR[i] < 6 ? (6 - dR[i]) * 0.075 : 0) + (dO && dO[i] < 4 ? (4 - dO[i]) * 0.03 : 0) + wet;
      S.temp[i] = Math.round(G.clamp(t, 0, 1) * 255); S.moist[i] = Math.round(G.clamp(mo, 0, 1) * 255);
    }
  };
  B.classify = function (t, m, th) {
    if (t < 0.17) return ID.NEVE;
    if (t < 0.31) return m < 0.22 ? ID.NEVE : ID.TAIGA;
    if (t < 0.6) {
      if (m > 0.74 && th < G.SEA + 1.9) return ID.PANTANO;
      if (m < 0.24 && t > 0.48) return ID.SAVANA;
      return ID.TEMP;
    }
    if (m > 0.8 && th < G.SEA + 1.7) return ID.PANTANO;
    if (m > 0.58) return ID.SELVA;
    if (m > 0.36) return ID.SAVANA;
    return ID.DESERTO;
  };
  B.tileBiome = function (i) { const S = G.S; return B.classify(S.temp[i] / 255, S.moist[i] / 255, W.tileH(i)); };
  // settle a tile's terrain type to match its biome (dunes, snow fields...)
  B.fitType = function (i) {
    const S = G.S; const b = S.biome[i]; const t = S.type[i];
    if (t < T.SAND) return;
    if (b === ID.DESERTO && (t === T.GRASS || t === T.MEADOW)) S.type[i] = T.SAND;
    else if ((b === ID.NEVE || b === ID.SAVANA) && t === T.MEADOW) S.type[i] = T.GRASS;
    else if (b !== ID.DESERTO && t === T.SAND && G.dOcean && G.dOcean[i] > 3) S.type[i] = T.GRASS;
  };
  // first pass after the world's shape is known
  B.assign = function (S) {
    S.biome = new Uint8Array(N * N);
    B.climate(S);
    for (let i = 0; i < N * N; i++) {
      const b = B.tileBiome(i); S.biome[i] = b;
      if (S.type[i] < T.SAND) continue;
      const wasSand = S.type[i] === T.SAND;
      B.fitType(i);
      S.fert[i] = G.clamp(S.fert[i] * G.BIOMES[b].fert * (wasSand ? 1 : 1) + (b === ID.PANTANO ? 0.1 : 0), 0, 1);
    }
  };
  // after terraforming or biome-changing miracles
  B.refresh = function (i, forced) {
    const S = G.S; if (!S.biome) return;
    const b = forced !== undefined ? forced : B.tileBiome(i);
    const old = S.biome[i]; S.biome[i] = b;
    if (S.type[i] >= T.SAND) { B.fitType(i); if (old !== b) S.fert[i] = G.clamp(S.fert[i] / Math.max(0.2, G.BIOMES[old].fert) * G.BIOMES[b].fert, 0, 1); }
  };

  // ------------------------------ vegetation ------------------------------
  B.pickTree = function (b, rnd) {
    const L = G.BIOMES[b].trees; let tot = 0; for (const [, w] of L) tot += w;
    let r = (rnd ? rnd() : G.R()) * tot; for (const [k, w] of L) { r -= w; if (r <= 0) return k; } return L[0][0];
  };
  // can a tree of this kind take root here?
  const HOME = { oak: [0, 2], birch: [0, 2], pine: [0, 2, 1], snowpine: [1, 2], willow: [3], jungle: [4], palm: [4, 6, 5], acacia: [5], baobab: [5], cactus: [6] };
  B.canGrow = function (kind, i) {
    const S = G.S; const t = S.type[i]; const b = B.of(i);
    if (t < T.SAND || t === T.RIVER) return false;
    if (kind === 'palm') return (t === T.SAND && ((G.dOcean && G.dOcean[i] <= 3) || (S.moist && S.moist[i] > 150))) || b === ID.SELVA;
    if (t === T.SAND && kind !== 'cactus') return false;
    return (HOME[kind] || [0]).includes(b);
  };
  B.grassFire = i => B.def(i).fire;

  // ------------------------------ ground colours ------------------------------
  // grass colour on a temperature x moisture grid, blended smoothly
  const GRID = [
    [[222, 230, 238], [234, 240, 247], [228, 237, 246]],   // frozen: dry, mid, wet
    [[150, 152, 116], [106, 138, 100], [88, 124, 92]],      // boreal
    [[168, 176, 98], [118, 172, 78], [96, 152, 70]],        // temperate
    [[222, 196, 134], [198, 178, 98], [74, 154, 60]],       // tropical
  ];
  const TT = [0.1, 0.32, 0.55, 0.82], MM = [0.15, 0.5, 0.85];
  function seg(v, P) { if (v <= P[0]) return [0, 0]; for (let k = 0; k < P.length - 1; k++) if (v <= P[k + 1]) return [k, (v - P[k]) / (P[k + 1] - P[k])]; return [P.length - 2, 1]; }
  const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  B.grassColor = function (t, m) {
    let [ti, tf] = seg(t, TT); const [mi, mf] = seg(m, MM);
    if (ti === 0) tf = G.smooth(0.55, 1, tf); // crisp snow line
    const c0 = mix(GRID[ti][mi], GRID[ti][mi + 1], mf), c1 = mix(GRID[ti + 1][mi], GRID[ti + 1][mi + 1], mf);
    return mix(c0, c1, tf);
  };
  B.groundColor = function (i, type, base) {
    const S = G.S; if (!S.temp || !S.biome) return base;
    const t = S.temp[i] / 255, m = S.moist[i] / 255; const b = S.biome[i];
    if (type === T.SAND) {
      if (b === ID.DESERTO) return mix([236, 212, 158], [224, 186, 132], G.hash(i * 3 + 1) * 0.5 + (1 - m) * 0.3);
      if (t < 0.2) return mix(base, [226, 232, 238], 0.7);
      if (t < 0.32) return mix(base, [196, 196, 186], 0.5);
      return base;
    }
    if (type === T.ROCKY) {
      if (t < 0.24) return mix(base, [232, 238, 246], 0.78);
      if (b === ID.DESERTO || b === ID.SAVANA) return mix(base, [184, 142, 108], 0.55);
      return base;
    }
    let c = B.grassColor(t, m);
    if (b === ID.PANTANO) c = mix(c, [82, 106, 66], 0.55);
    if (b === ID.SAVANA) c = mix(c, [206, 184, 104], 0.25);
    return c;
  };
  // does this tile draw grass blades? (snow and dunes don't)
  B.style = i => { const b = B.of(i); return b === ID.NEVE ? 'snow' : b === ID.DESERTO ? 'dune' : b === ID.PANTANO ? 'swamp' : b === ID.SAVANA ? 'savanna' : b === ID.SELVA ? 'jungle' : b === ID.TAIGA ? 'taiga' : 'grass'; };

  // pick peoples for the start spots they would feel at home in
  const CIVHOME = { nordico: [1, 2], grego: [0, 5], romano: [0], egipcio: [6, 5], asteca: [4, 3] };
  B.matchCivs = function (civs, starts) {
    const S = G.S; if (!S.biome || civs.length < 2) return civs;
    const bi = starts.map(([x, y]) => { const c = {}; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const tx = Math.floor(x + dx), ty = Math.floor(y + dy); if (!W.inb(tx, ty) || S.type[ty * N + tx] < T.SAND) continue; const b = S.biome[ty * N + tx]; c[b] = (c[b] || 0) + 1; } return c; });
    const score = (civ, k) => { const home = CIVHOME[civ]; if (!home) return 0; let s = 0; for (const b of home) s += bi[k][b] || 0; return s; };
    // best permutation (at most 4! = 24)
    const idx = civs.map((_, k) => k); let best = null, bs = -1;
    const perm = (arr, l) => { if (l === arr.length) { let s = 0; for (let k = 0; k < arr.length; k++) s += score(civs[arr[k]], k); if (s > bs) { bs = s; best = arr.slice(); } return; } for (let k = l; k < arr.length; k++) { [arr[l], arr[k]] = [arr[k], arr[l]]; perm(arr, l + 1); [arr[l], arr[k]] = [arr[k], arr[l]]; } };
    perm(idx, 0);
    return best ? best.map(k => civs[k]) : civs;
  };
  B.nameAt = (x, y) => G.BIOMES[B.at(x, y)].name;
  B.toAt = (x, y) => (W.inb(x, y) && G.S.type[W.idx(x, y)] <= T.SEA ? 'ao mar' : G.BIOMES[B.at(x, y)].to);

  // ------------------------------ save ------------------------------
  const rle = a => { const o = []; let v = a[0], n = 0; for (let k = 0; k < a.length; k++) { if (a[k] === v) n++; else { o.push(v, n); v = a[k]; n = 1; } } o.push(v, n); return o; };
  const unrle = (o, into) => { let p = 0; for (let k = 0; k < o.length; k += 2) { into.fill(o[k], p, p + o[k + 1]); p += o[k + 1]; } };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { const S = G.S; if (S.biome) { out.biome = rle(S.biome); out.clima = S.clima || 'variado'; } },
    load(o) {
      const S = G.S; S.clima = o.clima || 'variado';
      B.climate(S);
      S.biome = new Uint8Array(N * N);
      if (o.biome) unrle(o.biome, S.biome);
      else { S.temp = null; S.moist = null; } // old worlds keep their plain green
    },
  });
})(window.G);
