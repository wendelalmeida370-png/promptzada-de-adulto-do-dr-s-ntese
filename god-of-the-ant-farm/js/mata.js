'use strict';
// ============================================================
//  Mata: the forest as the world already keeps it — how thick
//  the growth between the ground and the crowns is at each tile,
//  how much the crowns close over it, how wet it is, where its
//  edges, its trails and its light gaps are — and the measures of
//  each tree of the world as it stands (its height, its crown),
//  the same for the drawing and for the map of the canopy that
//  the sky reads for the light under the trees (NATUREZA.md §3.2,
//  §8b; D-466, D-470).
//  A pure source: it reads the world (the biome, the climate, the
//  trees and their stages, the wear of the paths, the roads, the
//  buildings, the walls, the fire, the ash, the towns, the seed)
//  and never writes it; no chance at all — neither the world's
//  nor the view's: the same world, the same forest. What it keeps
//  is a memory of regions of 16 × 16 tiles (the 3D's chunks), each
//  made again at the moment it is read when what it is made of
//  has changed (its own tiles and its neighbours', read by their
//  signature) — never a little each frame: the world may read it
//  one day (phase B) and the leap and the step must see the same.
//  Phase A: only the drawing reads it (the 3D, the god's view).
// ============================================================
(function (G) {
  let N = G.N; const T = G.T;
  G.mapHooks.push(n => { N = n; });
  const Ma = G.Mata = {};
  const R = Ma.R = 16, M = 3; // (a region's side in tiles — the 3D's chunk —; how far round a tile its forest is read)
  const ID = () => (G.Biome && G.Biome.ID) || { SELVA: 4 };

  // ------------------------------ the trees of the world, as they stand ------------------------------
  // the shape each kind of tree is drawn in (the drawing's own table, kept here: the canopy and the drawing are one rule)
  const SHAPE = Ma.SHAPE = { oak: 'round', apple: 'round', mulberry: 'round', olive: 'round', cacao: 'round', coffee: 'bush', pepper: 'bush', birch: 'round', willow: 'willow', pine: 'cone', snowpine: 'cone',
    jungle: 'tall', acacia: 'flat', baobab: 'baobab', cactus: 'cactus', incense: 'bush', palm: 'palm', date: 'palm', acai: 'palm', banana: 'banana' };
  // (how much of the sky a crown of each shape hides where it hangs: a jungle crown nearly all, an acacia's lace half)
  const CLOSE = { tall: 0.96, round: 0.86, cone: 0.8, willow: 0.86, flat: 0.55, baobab: 0.62, palm: 0.5, banana: 0.48, bush: 0, cactus: 0 };
  // the four forms of the great trees of the south, by the tree's id (D-471): 0 the umbrella (a wide flat crown high up, the
  // angelim), 1 the tiers (crowns in storeys, the sapucaia), 2 the column (narrow and tall, the jequitibá young), 3 the fig (a
  // spreading crown lower, aerial roots hanging — the strangler fig); and one grown tree in about eleven an emergent, its
  // umbrella above the roof of the others (the kapok, the sumaúma)
  Ma.ARQ = ['guarda-chuva', 'camadas', 'coluna', 'figueira'];
  // the measures of a standing tree of the world, in metres from its foot: its height H, its crown's heart cy and radius r, how
  // flat the crown is (fl), the top of the crown, whether it is an emergent and its form — the same for its drawing (Arvore3D),
  // for the leaves it lets fall, for what perches on it and for the canopy's map. A grown tree of the temperate lands keeps the
  // measures it was drawn with before (5 + 7 × size metres); only the jungle's trees grew to the canopy of a real forest
  // (a tree's place and size as the save keeps them, to the hundredth: the forest of a world and of the same world saved and loaded
  // is the same forest, plant for plant)
  const r2 = v => Math.round(v * 100) / 100;
  Ma.r2 = r2;
  Ma.tree = function (t) {
    const shape = SHAPE[t.kind] || 'round'; const sz = G.clamp(r2(t.size), 0.15, 1.4); const h = G.hash(t.id * 7); const s = 0.85 + h * 0.3;
    if (shape === 'tall') {
      const arq = Math.floor(G.hash(t.id * 53 + 11) * 4); const emerg = sz >= 0.8 && G.hash(t.id * 41 + 7) < 0.09;
      let H = (9 + 14 * sz) * s; if (arq === 3) H *= 0.82; if (emerg) H *= 1.5;
      let r = arq === 0 ? 3.2 * sz + 1.6 : arq === 1 ? 2.8 * sz + 1.4 : arq === 2 ? 2.2 * sz + 1.1 : 3.8 * sz + 1.8; if (emerg) r *= 1.3;
      const cy = H * (arq === 0 ? 0.84 : arq === 1 ? 0.74 : arq === 2 ? 0.78 : 0.7), fl = arq === 0 ? 0.36 : arq === 1 ? 0.7 : arq === 2 ? 1.0 : 0.55;
      return { shape, sz, h, s, H, r, cy, fl, top: cy + r * fl * 0.85, emerg, arq, tall: 1, close: CLOSE.tall };
    }
    const H = (5 + 7 * sz) * s; let r = 2.6 * sz + 0.8, cy = H * 0.66, fl = 1, top = cy + r * 0.85;
    if (shape === 'cone') { r = ((3.5 * sz + 0.6) * 1.0) / 2 + 0.4; cy = H * 0.5; top = H * 1.04; }
    else if (shape === 'flat') { r = 3.5 * sz + 0.6; cy = H * 0.8; fl = 0.32; top = cy + r * 0.3; }
    else if (shape === 'willow') { r = 2.8 * sz + 0.9; cy = H * 0.62; fl = 0.78; top = cy + r * 0.7; }
    else if (shape === 'baobab') { r = H * 0.24 + 2.2 * sz * 0.5; cy = H * 0.84; fl = 0.5; top = cy + 1.2; }
    else if (shape === 'palm' || shape === 'banana') { r = (3.6 * sz + 1) * (shape === 'banana' ? 0.8 : 1); cy = H * 0.85; fl = 0.3; top = cy + 0.5; }
    else if (shape === 'bush') { r = sz + 0.45; cy = 0.6 + r * 0.35; fl = 0.8; top = cy + r * 0.8; }
    else if (shape === 'cactus') { r = 0.6; cy = 2.5 * sz + 0.8; fl = 1; top = cy + 0.4; }
    return { shape, sz, h, s, H, r, cy, fl, top, emerg: false, arq: -1, tall: 1, close: CLOSE[shape] || 0 };
  };
  // (a crown that hangs over the land: a grown tree, standing)
  const crowned = t => t && t.stage === 'grow' && t.size >= 0.3;

  // ------------------------------ the noise of the seed ------------------------------
  // (patches of forest shut thick, natural clearings, thickets of bamboo: a slow noise of the world's seed — the same seed, the
  // same patches; made once per seed)
  let nz = null, nzSeed = NaN;
  const noise = (x, y) => { const sd = (G.S.seed | 0) + 2110; if (sd !== nzSeed) { nz = G.makeNoise(sd); nzSeed = sd; } return G.fbm(nz, x * 0.07, y * 0.07, 3); };
  Ma.noise = (x, y) => (G.S ? noise(x, y) : 0);

  // ------------------------------ the regions and their signatures ------------------------------
  const STAGE = { grow: 1, fall: 2, log: 3, stump: 4, burnt: 5 };
  let memo = new Map(), memoFor = null, ownSig = new Map(); // (the regions as last made; their own tiles' signatures, per read)
  G.worldHooks.push(() => { memo = new Map(); memoFor = null; ownSig = new Map(); });
  const NR = () => Math.ceil(N / R);
  // (the towns: where people clear the growth round their houses — their places and reach)
  const townsOf = S => (S.settlements ? S.settlements.values() : []);
  function townSig() { let s = 0; for (const t of townsOf(G.S)) s = (s * 31 + Math.round((t.cx || 0) * 4) * 7 + Math.round((t.cy || 0) * 4) * 13 + Math.round((t.radius || 8) * 4)) | 0; return s; }
  // a region's own tiles, as a number: everything the forest of the tiles near it is made of
  function sigOwn(rx, ry) {
    const S = G.S; let s = 17; const x0 = rx * R, y0 = ry * R;
    for (let y = y0; y < y0 + R && y < N; y++) for (let x = x0; x < x0 + R && x < N; x++) {
      const i = y * N + x; const tid = S.treeAt[i];
      if (tid) { const t = S.trees.get(tid); if (t) s = (s * 31 + tid * 3 + (STAGE[t.stage] || 0) * 7 + Math.floor(t.size * 8)) | 0; }
      s = (s * 13 + S.type[i] * 5 + S.road[i] * 11 + (S.occ[i] ? 17 : 0) + S.wall[i] * 19 + G.pathLevel(S.wear[i]) * 23 + (S.burnt[i] > 0 ? 29 : 0) + (S.scar[i] > 0 ? 31 : 0) + (S.fire[i] > 0.05 ? 37 : 0) + (S.cliff[i] ? 41 : 0) + (S.objAt[i] ? 43 : 0)) | 0;
      if (S.biome) s = (s * 7 + S.biome[i]) | 0;
      if (S.moist) s = (s * 5 + (S.moist[i] >> 4) * 3 + (S.temp[i] >> 4)) | 0;
      if (S.dry && S.dry[i]) s = (s * 3 + 1) | 0;
    }
    return s;
  }
  // (the signature of everything a region's forest is read from: its own tiles, its eight neighbours', the towns)
  function sigAll(rx, ry, cache) {
    const n = NR(); let s = townSig();
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const qx = rx + dx, qy = ry + dy; if (qx < 0 || qy < 0 || qx >= n || qy >= n) continue; const k = qy * 4096 + qx;
      let o = cache ? cache.get(k) : undefined; if (o === undefined) { o = sigOwn(qx, qy); if (cache) cache.set(k, o); }
      s = (s * 1000003 + o) | 0;
    }
    return s;
  }

  // ------------------------------ making a region ------------------------------
  const FIELDS = Ma.FIELDS = ['dens', 'dossel', 'umid', 'borda', 'clar', 'alto', 'mata', 'agua'];
  // the forest of a region, made from the world: per tile (0..255)
  //  dens   how full the growth between the ground and the crowns is (0 bare, 255 shut, all but impassable)
  //  dossel how much of the sky the crowns of the trees of the world hide over it (the canopy: the sky's light under the trees)
  //  umid   how wet: the climate's moisture and the water beside it
  //  borda  the edge: of the forest against the open land, of a trail, of a clearing (where the light comes in from the side)
  //  clar   a light gap in the forest: a fallen tree's place, an opening in the canopy with the forest round it
  //  alto   the top of the canopy over it, a quarter of a metre a step (the forest's roof seen from far)
  //  mata   how much of a forest the place is (the trees round it, the patches of the seed): the drawing's choice of what grows
  //  agua   the water beside it: 255 on a bank, nothing three tiles from any water (the reeds, the banks' palms)
  function make(rx, ry) {
    const S = G.S; const x0 = rx * R, y0 = ry * R; const W0 = R + M * 2; const bx = x0 - M, by = y0 - M;
    const out = { rx, ry, x0, y0, sig: 0 }; for (const f of FIELDS) out[f] = new Uint8Array(R * R);
    // (the window: what each tile of it is — open land that cuts the growth, water, a tree's crown)
    const cut = new Float32Array(W0 * W0), wat = new Uint8Array(W0 * W0), crown = new Float32Array(W0 * W0), top = new Float32Array(W0 * W0), gap = new Float32Array(W0 * W0);
    const towns = []; for (const t of townsOf(S)) { const rr = (t.radius || 8) + 2; if (t.cx + rr >= bx && t.cy + rr >= by && t.cx - rr <= bx + W0 && t.cy - rr <= by + W0) towns.push([t.cx, t.cy, t.radius || 8]); }
    for (let wy = 0; wy < W0; wy++) for (let wx = 0; wx < W0; wx++) {
      const x = bx + wx, y = by + wy, w = wy * W0 + wx; if (x < 0 || y < 0 || x >= N || y >= N) { wat[w] = 1; cut[w] = 1; continue; }
      const i = y * N + x; const ty = S.type[i];
      if (ty <= T.RIVER && !(S.dry && S.dry[i])) { wat[w] = 1; cut[w] = 1; continue; }
      let c = 0;
      if (S.road[i] || S.occ[i] || S.wall[i] || S.cliff[i] || S.scar[i] > 0 || S.fire[i] > 0.05 || (S.dry && S.dry[i])) c = 1;
      else { const lv = G.pathLevel(S.wear[i]); if (lv >= 2) c = 1; else if (lv === 1) c = 0.65; if (S.burnt[i] > 0) c = Math.max(c, 0.95); }
      cut[w] = c;
      const tid = S.treeAt[i]; const t = tid && S.trees.get(tid);
      if (t && (t.stage === 'stump' || t.stage === 'log' || t.stage === 'burnt')) gap[w] = 1;
    }
    // (the crowns of the trees of the window over each tile: one minus what every crown lets through — the canopy closes where
    // crowns overlap, and the top of the roof is the highest crown over the tile)
    for (let wy = 0; wy < W0; wy++) for (let wx = 0; wx < W0; wx++) {
      const x = bx + wx, y = by + wy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const tid = S.treeAt[y * N + x]; const t = tid && S.trees.get(tid); if (!crowned(t)) continue;
      const D = Ma.tree(t); if (!D.close) continue; const rt = D.r / 4; const reach = Math.ceil(rt + 0.6);
      for (let qy = Math.max(0, wy - reach); qy <= Math.min(W0 - 1, wy + reach); qy++) for (let qx = Math.max(0, wx - reach); qx <= Math.min(W0 - 1, wx + reach); qx++) {
        const d = Math.hypot(bx + qx + 0.5 - r2(t.x), by + qy + 0.5 - r2(t.y)); const c = G.clamp((rt + 0.5 - d) / 1.0, 0, 1) * D.close; if (c <= 0) continue;
        const w = qy * W0 + qx; crown[w] = 1 - (1 - crown[w]) * (1 - c); const tp = D.top - (d > rt ? (d - rt) * 4 * 0.8 : 0); if (tp > top[w]) top[w] = tp;
      }
    }
    // (the water beside a tile, within three: the wet banks)
    const wetAt = (wx, wy) => { let b = 99; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const qx = wx + dx, qy = wy + dy; if (qx < 0 || qy < 0 || qx >= W0 || qy >= W0 || !wat[qy * W0 + qx]) continue; const d = Math.hypot(dx, dy); if (d < b) b = d; } return b; };
    const mataW = new Float32Array(W0 * W0);
    const recOf = b => (G.Biome && G.Biome.MATA && G.Biome.MATA[b]) || DEF;
    // (how much of a forest each tile of the window is: the canopy round it and, in the lands of the forests, the patches of the
    // seed — the jungle shut where the noise is high, open where it is low, whatever the world's trees there)
    for (let wy = 0; wy < W0; wy++) for (let wx = 0; wx < W0; wx++) {
      const x = bx + wx, y = by + wy, w = wy * W0 + wx; if (wat[w]) continue; const i = y * N + x; const b = S.biome ? S.biome[i] : 0; const rc = recOf(b);
      let m = 0, n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const qx = wx + dx, qy = wy + dy; if (qx < 0 || qy < 0 || qx >= W0 || qy >= W0) continue; m += crown[qy * W0 + qx] * (dx || dy ? 1 : 2); n += dx || dy ? 1 : 2; }
      const nv = noise(x, y); mataW[w] = G.clamp(Math.max(G.smooth(0.12, 0.7, m / n), G.smooth(rc.patch, rc.patch + 0.3, nv) * rc.wild), 0, 1);
    }
    for (let ly = 0; ly < R; ly++) for (let lx = 0; lx < R; lx++) {
      const x = x0 + lx, y = y0 + ly, k = ly * R + lx; if (x >= N || y >= N) continue;
      const wx = lx + M, wy = ly + M, w = wy * W0 + wx; const i = y * N + x;
      out.dossel[k] = Math.round(G.clamp(crown[w], 0, 1) * 255); out.alto[k] = Math.round(G.clamp(top[w] * 4, 0, 255));
      if (wat[w]) continue;
      const b = S.biome ? S.biome[i] : 0; const rc = recOf(b); const mo = S.moist ? S.moist[i] / 255 : 0.5;
      const wd = wetAt(wx, wy); out.agua[k] = Math.round(G.clamp(1 - (wd - 1) / 2.5, 0, 1) * 255); const um = G.clamp(mo * 0.85 + (wd < 4 ? (4 - wd) / 4 * 0.45 : 0), 0, 1); out.umid[k] = Math.round(um * 255);
      const f = mataW[w]; out.mata[k] = Math.round(f * 255);
      // (the edge: a forest tile with open land, a trail or a clearing near it — the most open of the tiles round it, nearer weighs more)
      let open = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { if (!dx && !dy) continue; const qx = wx + dx, qy = wy + dy; const q = qy * W0 + qx; const d = Math.max(Math.abs(dx), Math.abs(dy)); const o = Math.max(cut[q] > 0.5 ? 1 : 0, 1 - mataW[q] * 1.4, gap[q]) * (d === 1 ? 1 : 0.6); if (o > open) open = o; }
      out.borda[k] = Math.round(G.clamp(f * open, 0, 1) * 255);
      // (a light gap: a fallen tree's place, or the canopy open over a tile with the forest closed round it)
      let ring = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) ring += crown[(wy + dy) * W0 + wx + dx]; ring /= 25;
      const cl = G.clamp(Math.max(gap[w], (1 - crown[w]) * G.smooth(0.35, 0.75, ring) * 1.6) * (cut[w] >= 1 ? 0 : 1), 0, 1); out.clar[k] = Math.round(cl * 255);
      // the growth: the land's recipe in the open, under the forest and in a gap, wetter the fuller; cut by what is open land
      let d = rc.open + (rc.forest - rc.open) * f; d = Math.max(d, rc.gap * cl * Math.max(f, 0.5));
      d *= G.clamp(0.55 + um * 0.75, 0.35, 1.15);
      const ty = S.type[i]; if (ty === T.SAND) d *= 0.3; else if (ty === T.ROCKY) d *= 0.4;
      if (S.temp && S.temp[i] < 60) d *= 0.4; // (the cold: what lies under the snow is low and thin)
      d *= 1 - cut[w];
      // (round the houses people keep the growth down: in a town's reach, and beside a building or a wall)
      for (const [cx, cy, r] of towns) { const dd = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (dd < r + 2) d *= 0.15 + 0.85 * G.smooth(r * 0.6, r + 2, dd); }
      let nb = 0; for (let dy = -1; dy <= 1 && !nb; dy++) for (let dx = -1; dx <= 1; dx++) { const qx = x + dx, qy = y + dy; if (qx < 0 || qy < 0 || qx >= N || qy >= N) continue; const j = qy * N + qx; if (S.occ[j] || S.wall[j] || S.road[j] >= 2) { nb = 1; break; } }
      if (nb) d *= 0.45;
      out.dens[k] = Math.round(G.clamp(d, 0, 1) * 255);
    }
    return out;
  }
  // (a land with no recipe of its own: the temperate's)
  const DEF = { forest: 0.55, open: 0.12, gap: 0.8, stem: 0.1, patch: 0.25, wild: 0.6 };

  // ------------------------------ reading ------------------------------
  // a region (rx, ry in regions: 16 × 16 tiles from rx·16, ry·16), as the world is now: made again if what it is made of changed
  Ma.region = function (rx, ry, cache) {
    const S = G.S; if (!S || !S.treeAt || rx < 0 || ry < 0 || rx >= NR() || ry >= NR()) return null;
    if (memoFor !== S) { memo = new Map(); memoFor = S; }
    const k = ry * 4096 + rx; const sg = sigAll(rx, ry, cache || new Map()); const m = memo.get(k);
    if (m && m.sig === sg) return m;
    const r = make(rx, ry); r.sig = sg; memo.set(k, r); return r;
  };
  // the same, checked against the world at most once per instant of the world's clock (its clock, the versions of its ground and
  // of its ways, the count of its trees and of its things): what the body and the drawing read every frame — the world changes
  // only in its step, and a step moves the clock
  const nowKey = () => { const S = G.S; return S.clock + ':' + (S.typeVer || 0) + ':' + (S.walkVer || 0) + ':' + S.trees.size + ':' + S.nextId; };
  let nowMemo = new Map(), nowFor = '';
  G.worldHooks.push(() => { nowMemo = new Map(); nowFor = ''; });
  Ma.regionNow = function (rx, ry) {
    const key = nowKey(); if (key !== nowFor) { nowMemo = new Map(); nowFor = key; }
    const k = ry * 4096 + rx; let r = nowMemo.get(k); if (r === undefined) { r = Ma.region(rx, ry, nowMemo.sigs || (nowMemo.sigs = new Map())); nowMemo.set(k, r); } return r;
  };
  // one tile's forest, as numbers 0..1 (into out, or a new object): what the tests and the god's view read; the 3D reads whole regions
  Ma.at = function (i, out) {
    const x = i % N, y = (i / N) | 0; const r = Ma.region(Math.floor(x / R), Math.floor(y / R)); const o = out || {}; const k = (y - r.y0) * R + (x - r.x0);
    for (const f of FIELDS) o[f] = r ? r[f][k] / 255 : 0; o.alto = r ? r.alto[k] / 4 : 0; return o;
  };
  // the same, made from nothing (no memory): the verifier compares the two
  Ma.fresh = function (i) { const x = i % N, y = (i / N) | 0; const r = make(Math.floor(x / R), Math.floor(y / R)); const k = (y - r.y0) * R + (x - r.x0); const o = {}; for (const f of FIELDS) o[f] = r[f][k] / 255; o.alto = r.alto[k] / 4; return o; };
  // the floor of the forest at a tile (for the ground's picture, the god's view): the leaves lying under the canopy (litter) and
  // the moss of the wet shade, 0..1
  Ma.floor = function (i, out) { const a = Ma.at(i, out); const o = out || a; o.folhas = G.clamp(a.dossel * 0.9 + a.mata * 0.2, 0, 1); o.musgo = G.clamp(a.dossel * a.umid * 1.3 - 0.15, 0, 1); return o; };
  // THE MAP OF THE CANOPY seen from above (NATUREZA.md §8b): one byte a tile, N × N — how much of the sky the crowns of the trees
  // of the world hide over it (0 open, 255 a closed roof) —, made whole when asked (every region checked against the world now)
  // for the rectangle asked (tiles; the whole map without one). And its signature: the same number while nothing under it changed
  // — the sky makes its own picture again only when it moves
  Ma.canopy = function (x0, y0, w, h, field) {
    x0 = x0 | 0; y0 = y0 | 0; w = w === undefined ? N : w | 0; h = h === undefined ? N : h | 0; const fd = field || 'dossel';
    const data = new Uint8Array(w * h); const cache = new Map(); let sig = 7;
    for (let ry = Math.floor(Math.max(0, y0) / R); ry <= Math.floor((Math.min(N, y0 + h) - 1) / R); ry++) for (let rx = Math.floor(Math.max(0, x0) / R); rx <= Math.floor((Math.min(N, x0 + w) - 1) / R); rx++) {
      const r = Ma.region(rx, ry, cache); if (!r) continue; sig = (sig * 1000003 + r.sig) | 0;
      for (let ly = 0; ly < R; ly++) { const y = r.y0 + ly; if (y < y0 || y >= y0 + h || y >= N) continue; for (let lx = 0; lx < R; lx++) { const x = r.x0 + lx; if (x < x0 || x >= x0 + w || x >= N) continue; data[(y - y0) * w + (x - x0)] = r[fd][ly * R + lx]; } }
    }
    return { data, w, h, x0, y0, sig };
  };

  // ------------------------------ what grows where: the niches ------------------------------
  // the light of a point under the forest (0 deep shade, 1 open sky), the wet, the edge, the slope: what the drawing chooses its
  // plants by — each where its niche puts it, in patches, never strewn (D-472). Pure numbers of the region and the tile
  Ma.niche = function (r, lx, ly, x, y) {
    const k = ly * R + lx; const S = G.S; const i = y * N + x;
    const sl = S.slope ? S.slope[i] : 0;
    return { luz: 1 - r.dossel[k] / 255 * 0.85, umid: r.umid[k] / 255, agua: r.agua[k] / 255, borda: r.borda[k] / 255, clar: r.clar[k] / 255, dens: r.dens[k] / 255, mata: r.mata[k] / 255, encosta: sl, bioma: S.biome ? S.biome[i] : 0 };
  };

  // ------------------------------ the hard stems ------------------------------
  // the stems of the growth the body cannot walk through (a tree fern's trunk, a young tree, a slim palm, a clump of bamboo) —
  // only where the forest is thick enough for them, never on a road, a building's ground or near it, a wall, a trail, the water,
  // a cliff, beside land one cannot walk, nor on a tile with a bush or a boulder; each in its own cell of two metres with a little
  // play (so two are never nearer than 1,5 m), and far enough from the trunk of every tree of the world that the body (0,32 m)
  // always passes between: the space the body moves in keeps every way it had (NATUREZA.md §3.1, the body's exception; D-473).
  // [X, Z, radius, kind] in metres; kind: 0 a tree fern, 1 a young tree, 2 a slim palm, 3 bamboo, 4 a pioneer of the gaps (the
  // embaúba). Read by the 3D (it draws them there) and by the body (Space.stems): never by the world
  Ma.STEM_R = [0.13, 0.09, 0.12, 0.24, 0.11];
  Ma.STEM_GAP = 0.95; // (the body's breadth, 0,64 m, and play for its turning: what is left between a stem and a trunk)
  Ma.stemsOf = function (i, rr) {
    const S = G.S; const x = i % N, y = (i / N) | 0; const out = [];
    if (!S || !S.treeAt || x < 1 || y < 1 || x >= N - 1 || y >= N - 1) return out;
    const r = rr || Ma.region(Math.floor(x / R), Math.floor(y / R)); if (!r) return out; const k = (y - r.y0) * R + (x - r.x0);
    const dens = r.dens[k] / 255; const b = S.biome ? S.biome[i] : 0; const rc = (G.Biome && G.Biome.MATA && G.Biome.MATA[b]) || DEF; if (!rc.stem || dens < 0.35) return out;
    if (S.objAt[i] || S.road[i] || S.occ[i] || S.wall[i] || S.cliff[i] || G.pathLevel(S.wear[i]) >= 1 || S.type[i] <= T.RIVER || (G.Caves && G.Caves.isMouth && G.Caves.isMouth(i))) return out;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = (y + dy) * N + x + dx; if (j < 0 || j >= N * N) continue; if (S.occ[j] || S.wall[j] || S.road[j]) return out;
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && G.W && G.W.walkable && !G.W.walkable(j)) return out; }
    const TL = 4; const trunks = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * N + x + dx; const tid = S.treeAt[j]; const t = tid && S.trees.get(tid); if (!t) continue;
      // (the trunk the body meets — Space.trunk's rule, at the size the steps reckon a tree at, its next tenth: grown since, it still clears)
      const tr = t.stage !== 'stump' && t.stage !== 'log' && t.stage !== 'fall' ? 0.28 + 0.32 * Math.min(1.2, Math.ceil(Math.max(r2(t.size), 0.3) * 10 + 1e-9) / 10) : t.stage === 'log' || t.stage === 'fall' ? 2.6 : 0.4; trunks.push([r2(t.x) * TL, r2(t.y) * TL, tr + 0.03]); }
    const sh = rc.stem * (0.6 + dens * 0.8) * (r.clar[k] > 120 ? 1.4 : 1);
    for (let q = 0; q < 4; q++) {
      const hq = G.hash(i * 4 + q + (S.seed | 0) * 7 + 911); if (hq > sh) continue;
      const cx = (x + 0.25 + (q & 1) * 0.5) * TL + (G.hash(i * 8 + q + 31) - 0.5) * 0.5, cz = (y + 0.25 + (q >> 1) * 0.5) * TL + (G.hash(i * 8 + q + 77) - 0.5) * 0.5;
      const kind = stemKind(b, r, k, G.hash(i * 5 + q + 13)); const sr = Ma.STEM_R[kind];
      let ok = true; for (const [tx, tz, tr] of trunks) if (Math.hypot(cx - tx, cz - tz) < tr + sr + Ma.STEM_GAP) { ok = false; break; }
      if (ok) out.push([cx, cz, sr, kind]);
    }
    return out;
  };
  // (which hard stem a cell grows: the gap's pioneer where the light comes in, bamboo in the thickets of the seed and by the
  // water, the slim palm in the wet low ground, the tree fern on the wet slopes and in the shade, a young tree anywhere)
  function stemKind(b, r, k, h) {
    const id = ID(); if (b !== id.SELVA && b !== 3) return 1;
    if (r.clar[k] > 150 && h < 0.55) return 4;
    if (r.umid[k] > 190 && r.mata[k] < 170 && h < 0.3) return 3;
    if (r.umid[k] > 160 && h < 0.55) return 2;
    if (h < 0.75) return 0;
    return 1;
  }
})(window.G);
