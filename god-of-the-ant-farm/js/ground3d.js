'use strict';
// ============================================================
//  Ground3D: the ground of the body's view, painted the way the
//  god's view paints it. Every tile of the map is one texel of a
//  small picture (its colour — the very tileColor of the god's
//  canvas, roads and fields included — and its kind of ground);
//  the land's shader reads the four tiles around each point and
//  blends them softly, so there are no seams of triangles, and
//  lays over each kind the stuff it is made of — the pictures of
//  the stack (arte/texturas.py): grass, earth, sand, gravel,
//  cobbles, slabs, rock, snow, the leaves of the forest floor —
//  the world's colour times the picture, so the god's colours
//  stay. Where two kinds meet, the stuff that stands higher
//  shows (pebbles poking out of the grass, grass between the
//  stones of a street); under the trees their leaves lie; the
//  banks are wet; a steep face is rock; the waves wet the sand.
//  Until the stack is in, the grain the god's view draws with
//  strokes, as before. The picture of the tiles is kept up to
//  date around the body, a few rows a frame. Only seen: it reads
//  the world and writes nothing.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const G3 = G.Ground3D = {};
  // the kinds of ground (the alpha of a tile's texel)
  const K = G3.K = { grass: 0, meadow: 1, sand: 2, dune: 3, rocky: 4, snow: 5, swamp: 6, savanna: 7, jungle: 8, path: 9, gravel: 10, paved: 11, highway: 12, burnt: 13, field: 14, bed: 15, rock: 16, taiga: 17, wet: 18, river: 19 };
  let THREE = null, map = null, data = null, det = null, mat = null, size = 0, dirtyAll = true, row = 0, gmap = null, gdata = null, fmap = null, fdata = null;
  let emap = null, edata = null, stmap = null, stFor = NaN; // (21b: the rock of each tile, its fold, its moss and wet; the table of the layers)
  G.worldHooks.push(() => { dirtyAll = true; row = 0; sweep = 0; wBox = []; });
  // (the god's road colours: the same streets from both heights)
  const ROADC = [null, [184, 164, 128], [190, 182, 164], [146, 142, 134]];
  const FARM = { farm: 1, horta: 1, plantacao: 1, vinhedo: 1 };

  // ------------------------------ a tile: its colour and its kind ------------------------------
  G3.tileCol = function (i, x, y) {
    const S = G.S; const t = S.type[i];
    if (t <= T.SEA) { const d = G.clamp((G.SEA - W.tileH(i)) / 2.2, 0, 1); return G.lerpColor([214, 196, 150], [70, 96, 108], d); }
    if (t === T.RIVER) return G.lerpColor([150, 132, 98], [96, 104, 92], S.deep[i] ? 0.7 : 0.25);
    let c = G.Render.tileColor ? G.Render.tileColor(i, x, y) : [118, 172, 78];
    if (S.cliff[i] || S.slope[i] > 2.6) c = G.lerpColor(c, G.Render.rockColor ? G.Render.rockColor(i, S.slope[i]) : [140, 134, 124], S.cliff[i] ? 0.9 : 0.5);
    return c;
  };
  // ------------------------------ the snow ------------------------------
  // (how white the cold makes a tile in the god's view: the very curve his colours follow — the crisp snow line of
  // Biome.grassColor, the sand and the stony ground whitened under their own lines, the snow clinging to a cold crag. From
  // the temperature alone, with no hash: the climate is smooth, and so is the snow the 3D lays from it. The trees, the
  // bushes, the grass and the drawing's weather read it too — Realm.snowAt)
  G3.snowAt = function (i) {
    const S = G.S; if (!S.temp) return 0; const ty = S.type[i]; if (ty <= T.RIVER) return 0; const tp = S.temp[i] / 255;
    let w = ty === T.SAND ? (tp < 0.2 ? 0.7 : 0) : ty === T.ROCKY ? (tp < 0.24 ? 0.78 : 0) : 1 - G.smooth(0.55, 1, G.clamp((tp - 0.1) / 0.22, 0, 1));
    if (S.cliff[i] || S.slope[i] > 2.6) { const a = S.cliff[i] ? 0.9 : 0.5; w = w * (1 - a) + a * G.clamp((0.24 - tp) * 6, 0, 0.7) * (S.slope[i] > 3.5 ? 0.6 : 1); }
    return w;
  };
  // (the feet and the wheels press the snow away: as much as the god's view browns a path by its wear, the earth shows)
  const TREAD = [1, 0.62, 0.34, 0.12];
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // the snow lying on a tile, for the land's shader (the floor picture's alpha, read smoothly from tile to tile): the cold's,
  // trodden on the paths, a little less by the walls, none on a road, a field, the ash or the water; more in a hollow, less
  // on a crest (the shader adds the slope at each point, and an edge that wanders); and the god's sudden winter, fading in
  // and going as mud, as his view draws it (Powers: winter.js)
  function snowOf(i, x, y) {
    const S = G.S; const t = S.type[i];
    if (t <= T.RIVER || S.road[i] || S.scar[i] > 0 || S.burnt[i] > 0) return 0;
    const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && FARM[b.type]) return 0;
    let w = G3.snowAt(i);
    if (S.winters && S.winters.length) for (const q of S.winters) {
      const d = G.dist(x + 0.5, y + 0.5, q.x, q.y); if (d > q.r) continue; const LAST = G.DAY_LEN || 300;
      w = Math.max(w, G.clamp(q.t / 3, 0, 1) * G.clamp((LAST - q.t) / 6, 0, 1) * G.clamp((q.r - d) / 2, 0, 1) * 0.9);
    }
    if (w <= 0) return 0;
    w *= TREAD[G.pathLevel(S.wear[i])]; if (b || S.wall[i]) w *= 0.75;
    let m = 0, n = 0; for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny)) { m += W.tileH(ny * N + nx); n++; } }
    const cav = n ? (m / n - W.tileH(i)) * G.Space.HM : 0;
    w += G.clamp(cav * 0.5, -0.15, 0.2) * Math.min(1, w * 2.5);
    return G.clamp(w, 0, 1);
  }
  // (the ground under the snow, where the cold whitens the god's colour: the colour the land has just above the snow line —
  // the boreal green by its moisture, a little browned by the frost; the grey sand; the stony ground; the bare rock of a
  // crag — and browned by the feet as the god browns a path. The god's white is the snow itself: the shader lays it over)
  const DIRT = [176, 146, 102], WEARF = [0, 0.38, 0.66, 0.88];
  function bareOf(i, c0, w) {
    const S = G.S; const t = S.type[i]; let c;
    if (t === T.SAND) c = [214, 205, 173];
    else if (t === T.ROCKY) c = [150, 146, 132];
    else { c = G.Biome && G.Biome.grassColor ? G.Biome.grassColor(0.34, S.moist ? S.moist[i] / 255 : 0.5) : [106, 138, 100]; c = G.lerpColor(c, [128, 116, 88], 0.25); }
    const lv = G.pathLevel(S.wear[i]); if (lv) c = G.lerpColor(c, DIRT, WEARF[lv]);
    if (S.cliff[i] || S.slope[i] > 2.6) {
      const bi = S.biome ? S.biome[i] : -1; let r = bi === 4 ? [118, 116, 100] : [140, 134, 124];
      r = G.lerpColor(r, [r[0] * 0.86, r[1] * 0.9, r[2] * 0.96], G.hash(i * 13 + 7)); c = G.lerpColor(c, r, S.cliff[i] ? 0.9 : 0.5);
    }
    return G.lerpColor(c0, c, G.smooth(0, 0.4, w));
  }
  function paint(i, x, y, out) {
    const S = G.S; const t = S.type[i];
    let c = G3.tileCol(i, x, y), k = K.grass;
    const b = S.occ[i] && S.buildings.get(S.occ[i]);
    if (t <= T.RIVER) k = t === T.RIVER ? K.river : K.bed; // (the sea's bed of sand, a river's of gravel)
    else if (S.scar[i] > 0 || S.burnt[i] > 0) k = K.burnt;
    else if (S.road[i]) { const r = Math.min(3, S.road[i]); c = ROADC[r]; k = r === 1 ? K.gravel : r === 2 ? K.paved : K.highway; }
    else if (b && FARM[b.type]) {
      // (the god's field: turned earth, or the water of a rice paddy; half dug while it is still being made)
      const gr = G.Estates && b.built && G.Estates.grainFor ? G.Estates.grainFor(b) : null; // (read, never kept: L-394)
      const soil = gr && gr.flood ? [106, 122, 90] : [138, 100, 64];
      c = b.built ? soil : G.lerpColor(c, soil, 0.5); k = K.field;
    } else if (S.cliff[i] || S.slope[i] > 2.6) k = K.rock;
    else if (G.pathLevel(S.wear[i]) >= 2) k = K.path;
    else {
      const sty = S.temp && S.biome && G.Biome ? G.Biome.style(i) : 'grass';
      if (t === T.SAND) k = sty === 'dune' ? K.dune : K.sand;
      else if (t === T.ROCKY) k = K.rocky;
      else if (sty === 'snow') k = K.snow;
      else if (sty === 'swamp') k = K.swamp;
      else if (sty === 'savanna') k = K.savanna;
      else if (sty === 'jungle') k = K.jungle;
      else if (sty === 'taiga') k = K.taiga;
      else k = t === T.MEADOW ? K.meadow : K.grass;
    }
    // (under the snow, the ground: the snow itself is laid by the shader, from the floor's snow)
    if (k !== K.bed && k !== K.river && k !== K.field && k !== K.burnt && k !== K.gravel && k !== K.paved && k !== K.highway) { const w = G3.snowAt(i); if (w > 0) c = bareOf(i, c, w); }
    // (the edge of the water: the sand is wet and dark, the grass a little darker — the tundra's too, under its snow)
    if (k !== K.bed && k < K.path) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.type[ny * N + nx] <= T.RIVER && !(S.dry && S.dry[ny * N + nx])) { if (k === K.sand || k === K.dune) k = K.wet; else c = [c[0] * 0.9, c[1] * 0.92, c[2] * 0.9]; break; } } }
    out[0] = G.clamp(Math.round(c[0]), 0, 255); out[1] = G.clamp(Math.round(c[1]), 0, 255); out[2] = G.clamp(Math.round(c[2]), 0, 255); out[3] = k;
    return out;
  }
  G3.paint = (i, x, y) => paint(i, x, y, [0, 0, 0, 0]);
  // the grass of a tile, for the field of blades round the body (Grass3D): R how thick, G how tall (255 = 1.5 m), B how
  // many flowers, A its kind (0 green grass, 1 the gold of the savanna, 2 reeds, 3 the jungle's, 4 the short grass of the
  // taiga, 5 the few blades of the dunes). None on a road, a house, a field, a wall, the water, rock, snow or ash
  const GK = { 0: [215, 62, 10, 0], 1: [250, 80, 70, 0], 7: [200, 170, 6, 1], 8: [205, 125, 12, 3], 6: [165, 175, 0, 2], 17: [130, 38, 4, 4], 3: [22, 85, 0, 5], 2: [8, 60, 0, 5], 18: [36, 70, 0, 2], 9: [45, 34, 0, 0] };
  function grassOf(i, k, out) {
    const S = G.S; const g = GK[k];
    if (!g || S.occ[i] || S.wall[i] || S.road[i] || S.type[i] <= T.RIVER) { out[0] = out[1] = out[2] = out[3] = 0; return out; }
    const worn = G.pathLevel(S.wear[i]) === 1 ? 0.5 : 1;
    // (where the cold whitens the ground the grass is under the snow: thinner as it whitens, none where it lies deep — and in
    // between, the grass's own shader leaves out the tufts the snow covers, by the very snow the land's shader lays)
    const snow = G3.snowAt(i); if (snow > 0.92) { out[0] = out[1] = out[2] = out[3] = 0; return out; }
    out[0] = Math.round(g[0] * worn * (1 - snow * 0.55)); out[1] = g[1]; out[2] = g[2]; out[3] = g[3];
    return out;
  }
  // the floor of a tile, for the stuff that lies on it (the land's shader, the small things round the body — Grass3D):
  // R the leaves and needles the trees round it drop, G whether small things may lie here (255; 0 on a road, a house, a
  // field, a wall, the water), B how wet the bank is (next to a river, a lake, the sea), A the snow lying on it (snowOf)
  function floorOf(i, x, y, out) {
    const S = G.S; const t = S.type[i]; const free = !(S.occ[i] || S.wall[i] || S.road[i] || t <= T.RIVER);
    let lit = 0, wet = 0;
    if (free) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx;
      const tid = S.treeAt[j]; const tr = tid && S.trees.get(tid);
      if (tr && tr.stage === 'grow' && tr.size > 0.3) lit += (dx || dy ? 0.42 : 1) * Math.min(1, tr.size);
      if (S.type[j] <= T.RIVER && !(S.dry && S.dry[j]) && !(S.ice && S.ice[j])) wet = Math.max(wet, dx && dy ? 0.55 : 1);
    }
    out[0] = Math.round(G.clamp(lit / 1.5, 0, 1) * 255); out[1] = free ? 255 : 0; out[2] = Math.round(wet * 255); out[3] = Math.round(snowOf(i, x, y) * 255);
    return out;
  }
  // 21b: the rock of a tile, for the land's shader (G.Geo, D-490): R the rock (its index), G and B the fold of the layers there (16 bits:
  // (metres + 256) × 128), A the moss on the rock (its high four bits: the wet and shaded rock of the wet lands, from the forest's
  // moisture — G.Mata —, none in the cold, on the ash or a road) and how wet the rock is (its low four bits: the rain's wet of the world,
  // S.wet, and the spray at the foot of a fall of water). Read smoothly between the tiles by the shader, the fold the same as G.Geo.fold
  let mataR = null, mataK = -1; // (the forest's region last read: within one band of rows, the world does not change)
  // (the whole picture at once — the view opening — without the moss: the forest's regions of the whole map are not made in one frame; the
  // rows made again each frame bring it, round the body first, in a moment)
  let geoQuick = false;
  function geoOf(i, x, y, out) {
    const S = G.S; const Ge = G.Geo; if (!Ge) { out[0] = out[1] = out[2] = out[3] = 0; return out; }
    const r = Ge.rockAt(i); const v = G.clamp(Math.round((Ge.foldAt(i) + 256) * 128), 0, 65535);
    let moss = 0; const t = S.type[i];
    // (the forest's moisture and canopy where the rock is, from its region as the world is now — one region a band of tiles: the rows of
    // this picture read them in a row; under the snow lying there — the cold's, the god's winter — no moss shows)
    // (only where there is rock to grow on — a cliff, a steep face, the stony ground, a stone of the world: the rest never shows it)
    const rocky = S.cliff[i] || S.slope[i] > 2 || t === T.ROCKY || (S.objAt[i] && S.rocks.has(S.objAt[i]));
    if (rocky && !geoQuick && t >= T.SAND && !S.road[i] && !(S.burnt[i] > 0) && !(S.scar[i] > 0) && G.Mata && G.Mata.regionNow) {
      const Ma = G.Mata, rx = Math.floor(x / Ma.R), ry = Math.floor(y / Ma.R); if (mataK !== ry * 4096 + rx) { mataR = Ma.regionNow(rx, ry); mataK = ry * 4096 + rx; }
      if (mataR) { const k = (y - mataR.y0) * Ma.R + (x - mataR.x0); const um = mataR.umid[k] / 255, dl = mataR.dossel[k] / 255; moss = G.clamp((um - 0.42) * 1.7, 0, 1) * 0.85 + G.clamp(dl * um * 1.3 - 0.15, 0, 1) * 0.4; }
      moss *= 1 - G.clamp(snowOf(i, x, y) * 1.6, 0, 1); }
    // (the wet of the rock asked of the water's door — the rain that fell and falls, the spray round the foot of a fall: D-509, D-508)
    const wet = G.Agua ? G.clamp(Math.max(G.Agua.wet(i), G.Agua.spray(i)), 0, 1) : 0;
    // (the scree at the foot of a face: a tile one walks under a cliff of its own rock — the stones the face sheds lie there, more the taller
    // the face over it; in the high four bits of R)
    let tal = 0; if (t >= T.SAND && !S.cliff[i] && !S.road[i] && !S.occ[i]) { const h0 = W.tileH(i); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (S.cliff[j]) tal = Math.max(tal, (W.tileH(j) - h0) * G.Space.HM / ((dx && dy) ? 12 : 8)); } }
    out[0] = r | (Math.round(G.clamp(tal, 0, 1) * 15) << 4); out[1] = v >> 8; out[2] = v & 255; out[3] = (Math.round(G.clamp(moss, 0, 1) * 15) << 4) | Math.round(wet * 15);
    return out;
  }
  G3.geoOf = (i, x, y) => { mataK = -1; return geoOf(i, x, y, [0, 0, 0, 0]); };
  G3.snowOf = (i, x, y) => snowOf(i, x, y);
  // (the pictures of the rock and of the floor, for what lies on the ground and must match it — the relief's stones: their moss, their wet,
  // the snow on them read where they stand, as the ground under them has it; the same objects, by reference)
  G3.geoU = () => ({ uGeo: U.uGeo, uFMap: U.uFMap, uN: U.uN, uTL: U.uTL });
  G3.geoMap = () => emap;
  G3.grassMap = () => gmap;
  G3.map = () => map;
  G3.floorMap = () => fmap;
  // a band of rows of the picture made again from the world; true when something changed
  const px = [0, 0, 0, 0], gx = [0, 0, 0, 0], fx4 = [0, 0, 0, 0], ex4 = [0, 0, 0, 0];
  function rows(y0, y1, x0, x1) {
    if (!data) return false; let ch = false, gch = false, fch = false, ech = false; mataK = -1;
    for (let y = Math.max(0, y0); y < Math.min(N, y1); y++) for (let x = Math.max(0, x0); x < Math.min(N, x1); x++) {
      const i = y * N + x; paint(i, x, y, px); const o = i * 4;
      if (data[o] !== px[0] || data[o + 1] !== px[1] || data[o + 2] !== px[2] || data[o + 3] !== px[3]) { data[o] = px[0]; data[o + 1] = px[1]; data[o + 2] = px[2]; data[o + 3] = px[3]; ch = true; }
      grassOf(i, px[3], gx); if (gdata[o] !== gx[0] || gdata[o + 1] !== gx[1] || gdata[o + 2] !== gx[2] || gdata[o + 3] !== gx[3]) { gdata[o] = gx[0]; gdata[o + 1] = gx[1]; gdata[o + 2] = gx[2]; gdata[o + 3] = gx[3]; gch = true; }
      floorOf(i, x, y, fx4); if (fdata[o] !== fx4[0] || fdata[o + 1] !== fx4[1] || fdata[o + 2] !== fx4[2] || fdata[o + 3] !== fx4[3]) { fdata[o] = fx4[0]; fdata[o + 1] = fx4[1]; fdata[o + 2] = fx4[2]; fdata[o + 3] = fx4[3]; fch = true; }
      if (edata) { geoOf(i, x, y, ex4); if (edata[o] !== ex4[0] || edata[o + 1] !== ex4[1] || edata[o + 2] !== ex4[2] || edata[o + 3] !== ex4[3]) { edata[o] = ex4[0]; edata[o + 1] = ex4[1]; edata[o + 2] = ex4[2]; edata[o + 3] = ex4[3]; ech = true; } }
    }
    if (gch && gmap) gmap.needsUpdate = true;
    if (fch && fmap) fmap.needsUpdate = true;
    if (ech && emap) emap.needsUpdate = true;
    return ch;
  }
  // the whole picture (a new world, or the first descent)
  G3.full = function () {
    if (!THREE) return;
    if (!map || size !== N) {
      if (map) map.dispose();
      size = N; data = new Uint8Array(N * N * 4);
      map = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.UnsignedByteType);
      map.colorSpace = THREE.SRGBColorSpace; map.magFilter = map.minFilter = THREE.NearestFilter; map.generateMipmaps = false; map.flipY = false;
      if (gmap) gmap.dispose(); gdata = new Uint8Array(N * N * 4);
      // (read texel by texel for what grows where, and smoothly for how thick: the edge of a meadow frays — Grass3D)
      gmap = new THREE.DataTexture(gdata, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); gmap.magFilter = gmap.minFilter = THREE.LinearFilter; gmap.generateMipmaps = false; gmap.flipY = false;
      // (the floor read smoothly: the leaves thin out from tree to tree, the wet fades up the bank)
      if (fmap) fmap.dispose(); fdata = new Uint8Array(N * N * 4);
      fmap = new THREE.DataTexture(fdata, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); fmap.magFilter = fmap.minFilter = THREE.LinearFilter; fmap.generateMipmaps = false; fmap.flipY = false;
      // (21b: the rock of each tile, read texel by texel: the shader blends the four round a point itself)
      if (emap) emap.dispose(); edata = new Uint8Array(N * N * 4);
      emap = new THREE.DataTexture(edata, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); emap.magFilter = emap.minFilter = THREE.NearestFilter; emap.generateMipmaps = false; emap.flipY = false;
    }
    geoQuick = true; rows(0, N, 0, N); geoQuick = false; map.needsUpdate = true; fmap.needsUpdate = true; emap.needsUpdate = true; dirtyAll = false; row = 0;
    U.uMap.value = map; U.uFMap.value = fmap; U.uN.value = N; U.uGeo.value = emap; strataTex();
  };
  // every frame: a few rows of the land round the body made again (the paths worn, the fields growing, the fire, the snow),
  // and one row of the whole map (the far land changes too: a town grows on the horizon)
  // — and the circle of each sudden winter of the god's, whole, every frame while it lasts, wherever it is: its snow fades in
  // and melts away smoothly, and is gone with it the frame it ends (the frame after, for the circle of one just ended)
  let sweep = 0, wBox = [];
  G3.tick = function (focus) {
    if (!THREE) return; if (dirtyAll || !map) { G3.full(); return; }
    let ch = rows(sweep, sweep + 1, 0, N); sweep = (sweep + 1) % N;
    const L = G.S.winters; if (wBox.length || (L && L.length)) {
      const now = L && L.length ? L.map(q => [q.x, q.y, q.r]) : [];
      for (const b of wBox) if (!now.some(q => q[0] === b[0] && q[1] === b[1])) now.push(b);
      for (const [x, y, r] of now) if (rows(Math.floor(y - r) - 1, Math.ceil(y + r) + 2, Math.floor(x - r) - 1, Math.ceil(x + r) + 2)) ch = true;
      wBox = L && L.length ? L.map(q => [q.x, q.y, q.r]) : [];
    }
    if (focus) { const L = G.Space.TILE; const cx = Math.floor(focus.X / L), cy = Math.floor(focus.Z / L); const R = 40; const y = cy - R + row; row = (row + 4) % (R * 2); if (rows(y, y + 4, cx - R, cx + R)) ch = true; }
    if (ch) map.needsUpdate = true;
  };
  // (for the verifier: of n tiles round a point, how many the picture paints otherwise than the world is now — a few may
  // lag a moment behind, the rows are made again a few a frame; fbad: the same for the floor — the leaves where the trees
  // are, nothing loose on a road, a house or the water, the snow where the cold lays it; snowBad: snow in the picture on
  // the water, or where it is warm and no winter lies — never: the climate does not change from frame to frame, and a
  // winter's circle is made again every frame (only the god's Change of Climate lags a moment, as the rest of the picture));
  // paleBad: a pale, hueless texel (the god's white of the cold) under the kinds the grass's picture is laid on — never: the
  // green of that picture over a white turns mint and purple (the snow of the first wave); under the snow lies the bare ground
  G3.check = function (fx, fy, R, n) {
    if (!data || size !== N) return { n: 0, bad: 0, fbad: 0, snowBad: 0, paleBad: 0 }; let bad = 0, fbad = 0, snowBad = 0, paleBad = 0, k = 0; const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const S = G.S; const winter = !!(S.winters && S.winters.length);
    for (let q = 0; q < n; q++) { const x = x0 + Math.floor((G.hash(q * 7 + 1) - 0.5) * 2 * R), y = y0 + Math.floor((G.hash(q * 13 + 5) - 0.5) * 2 * R); if (!W.inb(x, y)) continue; k++;
      const i = y * N + x; paint(i, x, y, px); const o = i * 4; if (data[o] !== px[0] || data[o + 1] !== px[1] || data[o + 2] !== px[2] || data[o + 3] !== px[3]) bad++;
      if (GRASSY[data[o + 3]] && G3.pale(data[o], data[o + 1], data[o + 2])) paleBad++;
      if (fdata) { floorOf(i, x, y, fx4); if (fdata[o] !== fx4[0] || fdata[o + 1] !== fx4[1] || fdata[o + 2] !== fx4[2] || fdata[o + 3] !== fx4[3]) fbad++;
        if (fdata[o + 3] > 0 && (S.type[i] <= T.RIVER || (!winter && G3.snowAt(i) <= 0))) snowBad++; } }
    return { n: k, bad, fbad, snowBad, paleBad };
  };
  // (the kinds the land's shader lays the grass's picture on — gLay's last line; and a colour too pale to carry its green:
  // bright and nearly grey, as the god's white of the frozen land)
  const GRASSY = { [K.grass]: 1, [K.meadow]: 1, [K.snow]: 1, [K.swamp]: 1, [K.savanna]: 1, [K.jungle]: 1, [K.taiga]: 1 };
  G3.pale = (r, g, b) => { const hi = Math.max(r, g, b), lo = Math.min(r, g, b); return hi > 166 && hi - lo < hi * 0.15; };
  // (for the tests: the texel of a tile as the shader reads it)
  G3.texel = (x, y) => (data && W.inb(x, y) ? Array.from(data.subarray((y * N + x) * 4, (y * N + x) * 4 + 4)) : null);

  // ------------------------------ the grain: one small picture, four patterns ------------------------------
  // R: blades and tufts (the meadows); G: grains (sand, earth, gravel); B: pebbles; A: snow (drifts and glints).
  // Made once, the same every time (G.hash): tiled every 1.7 m on the ground.
  // (a tileable value noise of period P cells, and its sum over octaves, over a picture of side S)
  const vn = (x, y, P, sd) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; const h = (a, b) => G.hash((((a % P) + P) % P) * 7919 + (((b % P) + P) % P) * 104729 + sd * 1013);
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
  };
  const fbmS = (S, x, y, P, o, sd) => { let s = 0, a = 0.5, n = 0; for (let k = 0; k < o; k++) { s += vn(x * P / S * (1 << k), y * P / S * (1 << k), P * (1 << k), sd + k) * a; n += a; a *= 0.5; } return s / n; };
  function makeDetail() {
    const S = 256; const R = new Float32Array(S * S), Gc = new Float32Array(S * S), B = new Float32Array(S * S), A = new Float32Array(S * S);
    const wrap = v => ((v % S) + S) % S;
    const fbm = (x, y, P, o, sd) => fbmS(S, x, y, P, o, sd);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x;
      R[i] = 0.5 + (fbm(x, y, 8, 3, 1) - 0.5) * 0.5;
      Gc[i] = 0.5 + (G.hash(i * 3 + 7) - 0.5) * 0.55 + (fbm(x, y, 32, 2, 5) - 0.5) * 0.45;
      A[i] = 0.5 + (fbm(x, y, 4, 3, 9) - 0.5) * 0.45 + (G.hash(i * 5 + 11) > 0.991 ? 0.5 : 0);
    }
    // (blades: short strokes, darker and lighter, leaning the same way more or less — as the god draws them)
    for (let k = 0; k < 2600; k++) {
      const x = G.hash(k * 3 + 1) * S, y = G.hash(k * 3 + 2) * S, len = 3 + G.hash(k * 3 + 3) * 5, a = -1.2 + G.hash(k * 7) * 0.9, v = G.hash(k * 11) < 0.55 ? -0.32 : 0.3;
      for (let s = 0; s < len; s++) { const p = wrap(Math.round(x + Math.cos(a) * s)) + wrap(Math.round(y + Math.sin(a) * s)) * S; R[p] = G.clamp(R[p] + v * (1 - s / len * 0.5), 0, 1); }
    }
    // (pebbles: stones of a jittered grid, lit from above, with a dark rim)
    const C = 9, cell = S / C, pts = [];
    for (let cy = 0; cy < C; cy++) for (let cx = 0; cx < C; cx++) { const h = G.hash(cy * 31 + cx * 17 + 5); pts.push([(cx + 0.2 + G.hash(cy * 13 + cx * 7) * 0.6) * cell, (cy + 0.2 + G.hash(cy * 5 + cx * 29) * 0.6) * cell, cell * (0.22 + h * 0.2), 0.55 + G.hash(cx * 3 + cy * 41) * 0.4]); }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let best = 9, lit = 0.5;
      for (const p of pts) { let dx = x - p[0], dy = y - p[1]; if (dx > S / 2) dx -= S; if (dx < -S / 2) dx += S; if (dy > S / 2) dy -= S; if (dy < -S / 2) dy += S; const d = Math.hypot(dx, dy) / p[2]; if (d < best) { best = d; lit = p[3] - dy / p[2] * 0.12; } }
      const i = y * S + x; B[i] = best < 0.85 ? lit : best < 1.05 ? 0.22 : 0.45 + (Gc[i] - 0.5) * 0.4;
    }
    const out = new Uint8Array(S * S * 4);
    for (let i = 0; i < S * S; i++) { out[i * 4] = G.clamp(R[i] * 255, 0, 255); out[i * 4 + 1] = G.clamp(Gc[i] * 255, 0, 255); out[i * 4 + 2] = G.clamp(B[i] * 255, 0, 255); out[i * 4 + 3] = G.clamp(A[i] * 255, 0, 255); }
    const tx = new THREE.DataTexture(out, S, S, THREE.RGBAFormat, THREE.UnsignedByteType);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.magFilter = THREE.LinearFilter; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.generateMipmaps = true; tx.anisotropy = (G.Realm && G.Realm.Q ? G.Realm.Q().aniso : 0) || 4; tx.needsUpdate = true;
    return tx;
  }

  // ------------------------------ the land's material ------------------------------
  // the snow at a point of the land, shared by the land's shader and the grass's (a tuft never left standing in the snow,
  // nor missing from the bare ground beside it): past 0.5 the snow lies — the floor's snow (fm.a), less on a slope and gone
  // from a steep face (ny: the up of the land's normal there), thinner under the trees (fm.r: the needles show round the
  // trunks) and down a bank to the water (fm.b); its edge wandering over some eight metres and fraying over one (two
  // noises of the place, nz: the cloud noise)
  const SNOWGLSL = `float gSnowE(vec4 fm, float ny, vec2 xz, sampler2D nz) {
  float a = texture2D(nz, xz / 31.0 + 0.19).r, b = texture2D(nz, xz / 13.0 + 0.71).g;
  return fm.a * mix(0.25, 1.0, smoothstep(0.62, 0.9, ny)) - fm.r * 0.32 - fm.b * 0.45 + (a - 0.5) * 0.75 + (b - 0.5) * 0.4;
}
`;
  G3.snowGLSL = () => SNOWGLSL;
  const U = { uMap: { value: null }, uDet: { value: null }, uFMap: { value: null }, uN: { value: 128 }, uTL: { value: 4 }, uCN: { value: null }, uCO: { value: null }, uCC: { value: 0 }, uCS: { value: 0 }, uTime: { value: 0 }, uSeaY: { value: 3 }, uSkyH: { value: null }, uGeo: { value: null }, uStrata: { value: null } };
  // 21b: the rock of the land (G.Geo): the four tiles' rocks round a point and their bands at the height of the layers there (the
  // world's height plus the fold, read smoothly between the tiles — the same band on one face and on the face across the valley), the
  // band's colour and how hard it is (the table of the layers, a picture of a row a rock), the moss and the wet of the rock; and the
  // joints each rock is broken by (the granite's blocks, the schist's sheets, the sandstone's cross-beds, the limestone's flutes, the
  // basalt's columns). The rocks' periods and mean colours are the G.Geo's own, written into the shader
  const geoGLSL = () => { const R = G.Geo ? G.Geo.ROCKS : [{ L: 48, col: [140, 134, 124] }]; const n = R.length; const lin = v => Math.pow(v / 255, 2.2).toFixed(4);
    return `#define GROCKS ${n}.0
const float GSTL[${n}] = float[${n}](${R.map(r => r.L.toFixed(1)).join(', ')});
const vec3 GRMEAN[${n}] = vec3[${n}](${R.map(r => `vec3(${r.col.map(lin).join(', ')})`).join(', ')});
`; };
  const FRAG = () => geoGLSL() + `
uniform sampler2D uMap; uniform sampler2D uDet; uniform sampler2D uFMap; uniform float uN; uniform float uTL; uniform sampler2D uCN; uniform vec2 uCO; uniform float uCC; uniform float uCS; uniform float uTime; uniform float uSeaY; uniform vec3 uSkyH;
uniform sampler2D uGeo; uniform sampler2D uStrata;
// (the light of the waves on a bed under the water: a net of bright lines that drifts and folds)
float gCaus(vec2 p, float t) {
  vec2 q = p * 0.55; float c = 0.0;
  for (int i = 0; i < 3; i++) { float fi = float(i); q += vec2(sin(q.y * 1.3 + t * (0.6 + fi * 0.2) + fi), cos(q.x * 1.1 - t * (0.5 + fi * 0.15) - fi)) * 0.55; c += abs(sin(q.x * 1.6 + q.y * 0.4)); }
  return pow(clamp(1.0 - c / 3.0, 0.0, 1.0), 3.0) * 2.4;
}
float gBed(vec4 t) { float k = floor(t.a * 255.0 + 0.5); return k == 15.0 || k == 19.0 ? 1.0 : 0.0; }
// (how rough each kind of ground is to the light: stone and gravel most, the snow and the sand least)
float gRough(vec4 t) { float k = floor(t.a * 255.0 + 0.5); return (k == 4.0 || k == 10.0 || k == 16.0) ? 1.0 : (k == 9.0 || k == 13.0 || k == 14.0) ? 0.7 : (k == 2.0 || k == 3.0 || k == 15.0 || k == 19.0) ? 0.3 : 0.5; }
vec2 gBumpV = vec2(0.0);
float gHgt = 0.0; // (the height of the stuff of the ground at this point, in metres: the light reads its slopes)
float gHa = 0.5; // (and the same 0..1, as its pictures have it: where the snow fills the gaps first)
float gDune = 0.0; // (how much of this point is dune)
float gPool = 0.0; // (how much of this point is the still water of a swamp's pool)
float gWL = 0.0; // (how much this point is the line of the water on a shore: the band the waves roll their stones in)
// (the snow's own colour, linear: the god's white of the frozen land)
#define GSNOW vec3(0.78, 0.835, 0.9)
varying vec3 vGP; varying vec3 vGN;
float gFold = 0.0, gMoss = 0.0, gWet = 0.0, gRH = 0.5, gRD = 0.0, gWR = 0.0, gTal = 0.0; vec4 gRkI = vec4(0.0), gRkW = vec4(0.0); vec3 gRC = vec3(0.3);
float gFoldOf(vec4 g) { return (floor(g.g * 255.0 + 0.5) * 256.0 + floor(g.b * 255.0 + 0.5)) / 128.0 - 256.0; }
vec2 gMW(vec4 g) { float b = floor(g.a * 255.0 + 0.5); return vec2(floor(b / 16.0) / 15.0, mod(b, 16.0) / 15.0); }
vec4 gBand(float r, float sL) { int k = int(clamp(r, 0.0, GROCKS - 1.0)); return texture2D(uStrata, vec2(sL / GSTL[k], (float(k) + 0.5) / GROCKS)); }
// (the rock at this point: gRC its colour — the bands of the four tiles' rocks by the edge the ground blends with, far off their mean, so
// a band thinner than a pixel never shimmers —, gRH how hard the band is, gRD the rock most of the point is, the fold, the moss, the wet)
void gGeo(ivec2 a, ivec2 hi, vec2 f, vec2 s, float k00, float k10, float k01, float k11) {
  vec4 e00 = texelFetch(uGeo, clamp(a, ivec2(0), hi), 0), e10 = texelFetch(uGeo, clamp(a + ivec2(1, 0), ivec2(0), hi), 0);
  vec4 e01 = texelFetch(uGeo, clamp(a + ivec2(0, 1), ivec2(0), hi), 0), e11 = texelFetch(uGeo, clamp(a + ivec2(1, 1), ivec2(0), hi), 0);
  gFold = mix(mix(gFoldOf(e00), gFoldOf(e10), f.x), mix(gFoldOf(e01), gFoldOf(e11), f.x), f.y);
  vec2 m = mix(mix(gMW(e00), gMW(e10), f.x), mix(gMW(e01), gMW(e11), f.x), f.y); gMoss = m.x; gWet = m.y;
  vec4 rr = floor(vec4(e00.r, e10.r, e01.r, e11.r) * 255.0 + 0.5); gRkI = mod(rr, 16.0); vec4 tl = floor(rr / 16.0) / 15.0;
  gTal = mix(mix(tl.x, tl.y, f.x), mix(tl.z, tl.w, f.x), f.y);
  gRkW = vec4((1.0 - s.x) * (1.0 - s.y), s.x * (1.0 - s.y), (1.0 - s.x) * s.y, s.x * s.y);
  gWR = (k00 == 16.0 ? gRkW.x : 0.0) + (k10 == 16.0 ? gRkW.y : 0.0) + (k01 == 16.0 ? gRkW.z : 0.0) + (k11 == 16.0 ? gRkW.w : 0.0);
  float sL = vGP.y + gFold; float aa = smoothstep(0.25, 1.1, fwidth(sL) * 1.4);
  vec3 c = vec3(0.0); float h = 0.0, bw = -1.0;
  for (int k = 0; k < 4; k++) { float w = gRkW[k]; if (w < 0.004) continue; int r = int(clamp(gRkI[k], 0.0, GROCKS - 1.0)); vec4 b = gBand(float(r), sL);
    c += mix(b.rgb, GRMEAN[r], aa) * w; h += mix(b.a, 0.5, aa) * w; if (w > bw) { bw = w; gRD = float(r); } }
  gRC = c; gRH = h;
}
// (the joints of the rock most of the point is, across its face: 1 the face itself, less in a joint — read from the side the face
// looks to, as the pictures of the stack are; fading away with the distance)
float gJL(float u, float P, float w) { float q = (0.5 - abs(fract(u / P) - 0.5)) * P; return 1.0 - smoothstep(0.0, w, q); }
float gJoint0(float u, float sL, vec3 p) {
  if (gRD < 0.5) return 1.0 - 0.3 * gJL(u, 2.7, 0.08) - 0.12 * gJL(sL + u * 0.05, 3.9, 0.05);
  if (gRD < 1.5) return 1.0 - 0.13 * gJL(sL + u * 0.09, 0.19, 0.025);
  if (gRD < 2.5) return (1.0 - 0.1 * gJL(sL + u * 0.36, 0.42, 0.035)) * (1.0 - 0.24 * gJL(u, 5.3, 0.09));
  if (gRD < 3.5) return 1.0 - 0.17 * smoothstep(0.55, 0.95, sin(u * 2.3 + texture2D(uCN, vec2(u * 0.05, p.y * 0.01)).g * 5.0)) - 0.08 * gJL(sL, 2.1, 0.05);
  return 1.0 - 0.36 * gJL(u, 0.86, 0.055);
}
float gJoint(vec3 p, vec3 n, float sL) {
  float wx = smoothstep(0.35, 0.65, abs(n.x) / (abs(n.x) + abs(n.z) + 1e-4)); float u = mix(p.x, p.z, wx) + texture2D(uCN, p.xz / 23.0 + p.y * 0.013).r * 1.4;
  // (the streaks down a face: the dark the water leaves running down from each ledge, long and thin)
  float st = 1.0 - 0.14 * smoothstep(0.58, 0.82, texture2D(uCN, vec2(u * 0.11, p.y * 0.006 + 0.37)).g);
  return st * gJoint0(u, sL, p);
}
float gHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
${SNOWGLSL}
vec3 gShade(vec4 t, vec4 d, float m1, float m2) {
  vec3 c = t.rgb; float k = floor(t.a * 255.0 + 0.5);
  c *= 1.0 + (m1 - 0.5) * 0.34;
#ifdef GDETAIL
  if (k < 1.5 || k == 17.0 || (k > 4.5 && k < 8.5)) {
    // (the grass: blades light and dark, darker clumps, patches gone yellow in the sun — and the tundra's under its snow)
    c *= 1.0 + (d.r - 0.5) * (k == 7.0 ? 0.7 : 0.6);
    c *= 1.0 - smoothstep(0.5, 0.75, d.b) * 0.16;
    c = mix(c, c * vec3(1.14, 1.06, 0.66), smoothstep(0.58, 0.8, m2) * (k == 6.0 ? 0.0 : 0.45));
    if (k == 6.0) c = mix(c, vec3(0.022, 0.05, 0.05), smoothstep(0.56, 0.62, m2) * 0.85);
  } else if (k == 2.0 || k == 15.0 || k == 19.0) { c *= 1.0 + (d.g - 0.5) * 0.36 + (d.b - 0.5) * 0.1;
  } else if (k == 3.0) { c *= 1.0 + (d.g - 0.5) * 0.14 + 0.07 * sin(vGP.x * 1.9 + vGP.z * 0.7 + d.g * 2.0);
  } else if (k == 4.0) { c *= 0.75 + d.b * 0.6;
  } else if (k == 9.0 || k == 10.0) { c *= 1.0 + (d.g - 0.5) * 0.5; c *= mix(1.0, 0.72 + d.b * 0.5, 0.6);
  } else if (k == 11.0 || k == 12.0) {
    vec2 q = vGP.xz / (k == 12.0 ? 1.33 : 0.95); q.x += 0.5 * mod(floor(q.y), 2.0) * (k == 11.0 ? 1.0 : 0.0);
    vec2 f = fract(q); float j = smoothstep(0.0, 0.08, f.x) * smoothstep(0.0, 0.08, 1.0 - f.x) * smoothstep(0.0, 0.08, f.y) * smoothstep(0.0, 0.08, 1.0 - f.y);
    c *= mix(0.6, 0.9 + gHash(floor(q)) * 0.2, j) * (1.0 + (d.g - 0.5) * 0.18);
  } else if (k == 13.0) { c *= 0.55 + d.g * 0.8;
  } else if (k == 14.0) { float r = abs(fract(vGP.z) - 0.5) * 2.0; c *= (0.72 + 0.28 * (1.0 - smoothstep(0.35, 0.9, r))) * (1.0 + (d.g - 0.5) * 0.3);
  } else if (k == 16.0) { c *= (0.86 + 0.14 * sin(vGP.y * 3.6 + d.g * 3.0)) * (0.8 + d.b * 0.4);
  } else if (k == 18.0) { c *= (0.78 + (d.g - 0.5) * 0.2);
  }
#else
  if (k == 18.0) c *= 0.8;
#endif
  return c;
}
float gHard(vec4 t) { float k = floor(t.a * 255.0 + 0.5); return (k == 11.0 || k == 12.0 || k == 14.0) ? 1.0 : 0.0; }
float gRoad(vec4 t) { float k = floor(t.a * 255.0 + 0.5); return (k == 10.0 || k == 11.0 || k == 12.0) ? 1.0 : 0.0; }
#ifdef GDETAIL
// ---- the ground in the stuffs of the stack: the world's colour times the picture of what each kind is made of ----
// (the stuffs of arte/mat_natureza.py, where they are in the stack: the needles under the pines, the mud of the swamps and
// the banks, the round stones of a river's bed — without them, the nearest of the others)
#ifndef M3_NEEDLES
#define M3_NEEDLES M3_FOREST
#define M3S_NEEDLES M3S_FOREST
#define GM_NEEDLES GM_FOREST
#endif
#ifndef M3_MUD
#define M3_MUD M3_DIRT
#define M3S_MUD M3S_DIRT
#define GM_MUD GM_DIRT
#endif
#ifndef M3_PEBBLES
#define M3_PEBBLES M3_GRAVEL
#define M3S_PEBBLES M3S_GRAVEL
#endif
#ifndef M3_STONY
#define M3_STONY M3_GRAVEL
#define M3S_STONY M3S_GRAVEL
#endif
#ifndef M3_TRAIL
#define M3_TRAIL M3_DIRT
#define M3S_TRAIL M3S_DIRT
#endif
#ifndef M3_CRAG
#define M3_CRAG M3_ROCK
#define M3S_CRAG M3S_ROCK
#endif
float gLay(float k) {
  if (k == 2.0 || k == 3.0 || k == 15.0 || k == 18.0) return M3_SAND;
  if (k == 4.0) return M3_STONY;
  if (k == 16.0) return M3_CRAG;
  if (k == 9.0) return M3_TRAIL;
  if (k == 10.0) return M3_TRAIL; // (a road of the first rank: packed earth, gravel worked into it — gStack)
  if (k == 19.0) return M3_PEBBLES;
  if (k == 11.0) return M3_COBBLE;
  if (k == 12.0) return M3_SLAB;
  if (k == 13.0 || k == 14.0) return M3_SOIL;
  return M3_GRASS; // (grass, meadow, swamp, savanna, the jungle's, taiga)
}
float gScl(float L) {
  if (L == M3_GRASS) return M3S_GRASS; if (L == M3_SAND) return M3S_SAND; if (L == M3_ROCK) return M3S_ROCK; if (L == M3_SNOW) return M3S_SNOW;
  if (L == M3_FOREST) return M3S_FOREST; if (L == M3_DIRT) return M3S_DIRT; if (L == M3_GRAVEL) return M3S_GRAVEL; if (L == M3_COBBLE) return M3S_COBBLE;
  if (L == M3_SLAB) return M3S_SLAB; if (L == M3_SOIL) return M3S_SOIL; if (L == M3_NEEDLES) return M3S_NEEDLES; if (L == M3_MUD) return M3S_MUD;
  if (L == M3_PEBBLES) return M3S_PEBBLES; if (L == M3_STONY) return M3S_STONY; if (L == M3_TRAIL) return M3S_TRAIL; if (L == M3_CRAG) return M3S_CRAG; return 0.25;
}
// (the open green land: where the trees drop their leaves, and the bare earth shows here and there — the tundra's too)
float gGrassy(float k) { return (k < 1.5 || (k > 4.5 && k < 8.5) || k == 17.0) ? 1.0 : 0.0; }
// (how high the stuff of each picture stands, in metres, for the light: rock and cobbles most, sand and snow least)
float gAmp(float L) {
  if (L == M3_ROCK || L == M3_CRAG) return 0.1; if (L == M3_COBBLE || L == M3_SLAB || L == M3_STONY) return 0.05; if (L == M3_GRAVEL || L == M3_PEBBLES) return 0.045; if (L == M3_MUD || L == M3_TRAIL) return 0.02;
  if (L == M3_SAND || L == M3_SNOW) return 0.025; return 0.035;
}
// (what each kind shows over many metres, on its own colour: patches gone yellow in the sun, the swamp's pools, the
// furrows of a field, the dark of the sand the water wets)
vec3 gTint(vec3 c, float k, float mP) {
  if (k < 1.5 || k == 7.0 || k == 17.0) c = mix(c, c * vec3(1.12, 1.05, 0.68), smoothstep(0.56, 0.74, mP) * 0.34);
  else if (k == 6.0) c = mix(c, vec3(0.03, 0.05, 0.045), smoothstep(0.6, 0.66, mP) * 0.8);
  else if (k == 14.0) { float r = abs(fract(vGP.z) - 0.5) * 2.0; c *= 0.74 + 0.26 * (1.0 - smoothstep(0.35, 0.9, r)); }
  else if (k == 18.0) c *= 0.72;
  return c;
}
// (a stuff laid over the land in its own colour — the leaves under the trees, bare earth, mud: the picture's own colour, as
// bright as the god's colour there (times k), with a little of its hue)
vec3 gOwn(vec3 m, vec3 c, float k) { float lc = dot(c, vec3(0.3, 0.59, 0.11)), lm = dot(m, vec3(0.3, 0.59, 0.11)); return mix(m * (lc / max(lm, 1e-4)), c, 0.18) * k; }
// (the stones of a shore: the sand's colour greyed and darker)
vec3 gPeb(vec3 c) { float l = dot(c, vec3(0.3, 0.59, 0.11)); return mix(vec3(l) * vec3(0.98, 0.95, 0.9), c, 0.3) * 0.72; }
// (the ripples the wind leaves on a dune: three quarters of a metre apart, bending over it as the wind turns round its
// back — a long gentle slope to the wind, a short steep one away from it; 0..1, its height)
float gRip(vec2 p) {
  vec2 q = p + vec2(texture2D(uCN, p / 70.0).r, texture2D(uCN, p / 70.0 + 0.5).g) * 11.0;
  float r = fract(dot(q, vec2(0.86, 0.51)) / 0.75 + texture2D(uCN, p / 9.0).g * 0.35);
  return smoothstep(0.0, 0.72, r) * (1.0 - smoothstep(0.72, 1.0, r));
}
// (a steep face: the colour of the land there, greyed toward stone)
vec3 gRockish(vec3 c) { float l = dot(c, vec3(0.3, 0.55, 0.15)); return mix(vec3(l) * vec3(1.05, 1.0, 0.93), c, 0.35) * 0.92; }
// the stuffs at this point: a picture of the stack, its colour (summed by weight), its weight
const int GMX = 8;
float gL[GMX]; vec3 gC[GMX]; float gW[GMX]; int gN;
void gAdd(float L, vec3 c, float w) {
  if (w < 0.003) return;
  for (int i = 0; i < GMX; i++) { if (i >= gN) break; if (gL[i] == L) { gC[i] += c * w; gW[i] += w; return; } }
  if (gN < GMX) { gL[gN] = L; gC[gN] = c * w; gW[gN] = w; gN++; }
}
// (one picture at this point: the picture, and a second copy of it turned and two and a half times larger — the one whose
// stuff stands higher shows, chosen over some fifteen metres, so the land never repeats in a grid; on a steep face the
// picture is laid on it from the side, from the east or from the south as the face looks, never stretched)
vec2 gP, gP2; float gAT, gStp, gWX;
vec4 gTex(float L) {
  float S = gScl(L);
  vec4 a = m3raw(L, gP * S), b = m3raw(L, gP2 * S);
  a = mix(a, b, smoothstep(0.3, 0.7, gAT + (b.a - a.a) * 0.45));
  if (gStp > 0.02) a = mix(a, mix(m3raw(L, vGP.xy * S + 0.5), m3raw(L, vGP.zy * S), gWX), smoothstep(0.0, 0.75, gStp));
  return a;
}
// (the four tiles round the point, each its stuff; and what lies over them: the leaves under the trees, bare earth, the
// wet of a bank, snow, gravel between stones, the rock of a steep face — mixed by the heights of their pictures)
vec3 gStack(vec4 t00, vec4 t10, vec4 t01, vec4 t11, vec2 s, float mP, float mB, vec4 fm) {
  gN = 0;
  float k00 = floor(t00.a * 255.0 + 0.5), k10 = floor(t10.a * 255.0 + 0.5), k01 = floor(t01.a * 255.0 + 0.5), k11 = floor(t11.a * 255.0 + 0.5);
  float w00 = (1.0 - s.x) * (1.0 - s.y), w10 = s.x * (1.0 - s.y), w01 = (1.0 - s.x) * s.y, w11 = s.x * s.y;
  vec3 c00 = gTint(t00.rgb, k00, mP), c10 = gTint(t10.rgb, k10, mP), c01 = gTint(t01.rgb, k01, mP), c11 = gTint(t11.rgb, k11, mP);
  // (21b: a tile of cliff in the bands of its rock, a little of the god's colour of it kept — the white the cold leaves, the ash)
  if (k00 == 16.0) c00 = mix(gRC, c00, 0.22); if (k10 == 16.0) c10 = mix(gRC, c10, 0.22); if (k01 == 16.0) c01 = mix(gRC, c01, 0.22); if (k11 == 16.0) c11 = mix(gRC, c11, 0.22);
  gAdd(gLay(k00), c00, w00); gAdd(gLay(k10), c10, w10); gAdd(gLay(k01), c01, w01); gAdd(gLay(k11), c11, w11);
  gDune = (k00 == 3.0 ? w00 : 0.0) + (k10 == 3.0 ? w10 : 0.0) + (k01 == 3.0 ? w01 : 0.0) + (k11 == 3.0 ? w11 : 0.0);
  vec3 cAll = c00 * w00 + c10 * w10 + c01 * w01 + c11 * w11;
  float g00 = gGrassy(k00) * w00, g10 = gGrassy(k10) * w10, g01 = gGrassy(k01) * w01, g11 = gGrassy(k11) * w11;
  float gs = g00 + g10 + g01 + g11;
  if (gs > 0.01) {
    vec3 cg = (c00 * g00 + c10 * g10 + c01 * g01 + c11 * g11) / (g00 + g10 + g01 + g11);
    // (under the trees: their fallen leaves over the moss, darker than the grass — the needles, in the taiga)
    float tg = (k00 == 17.0 ? g00 : 0.0) + (k10 == 17.0 ? g10 : 0.0) + (k01 == 17.0 ? g01 : 0.0) + (k11 == 17.0 ? g11 : 0.0);
    gAdd(M3_FOREST, gOwn(GM_FOREST, cg, 0.62), fm.r * (gs - tg) * 2.2);
    gAdd(M3_NEEDLES, gOwn(GM_NEEDLES, cg, 0.6), fm.r * tg * 2.2);
    // (here and there the earth shows, worn bare — and much of it on the tundra, where the snow has gone from it)
    float tu = (k00 == 5.0 ? g00 : 0.0) + (k10 == 5.0 ? g10 : 0.0) + (k01 == 5.0 ? g01 : 0.0) + (k11 == 5.0 ? g11 : 0.0);
    gAdd(M3_DIRT, gOwn(GM_DIRT, cg, 0.72), smoothstep(0.66, 0.86, mB) * 0.85 * gs + tu * 0.75);
    // (down a bank to the water, and in the pools of a swamp, mud)
    float sw = (k00 == 6.0 ? g00 : 0.0) + (k10 == 6.0 ? g10 : 0.0) + (k01 == 6.0 ? g01 : 0.0) + (k11 == 6.0 ? g11 : 0.0);
    gAdd(M3_MUD, gOwn(GM_MUD, cg, 0.5), fm.b * gs * 0.8 + smoothstep(0.55, 0.65, mP) * sw * 1.4);
    gPool = smoothstep(0.6, 0.665, mP) * sw;
  }
  // (a road of the first rank: gravel worked into its packed earth)
  { float r0 = k00 == 10.0 ? w00 : 0.0, r1 = k10 == 10.0 ? w10 : 0.0, r2 = k01 == 10.0 ? w01 : 0.0, r3 = k11 == 10.0 ? w11 : 0.0; float rs = r0 + r1 + r2 + r3;
    if (rs > 0.003) gAdd(M3_GRAVEL, (c00 * r0 + c10 * r1 + c01 * r2 + c11 * r3) / rs, rs * 0.55); }
  // (21b: the scree at the foot of a face, in the mean colour of its rock — over the grass and the earth, under the snow)
  if (gTal > 0.02) gAdd(M3_STONY, GRMEAN[int(clamp(gRD, 0.0, GROCKS - 1.0))] * 0.88, smoothstep(0.0, 0.8, gTal) * 0.8 * (1.0 - gStp));
  // (the swash of a shore: the stones the waves roll, standing out of the sand)
  if (gWL > 0.01) gAdd(M3_PEBBLES, gPeb(cAll), gWL * 1.7);
  // (a steep face is bare rock, whatever the tiles say — in the bands of its rock: 21b)
  gAdd(M3_CRAG, mix(gRC, gRockish(cAll), 0.18), gStp * 2.0);
  // the heights decide where each stuff shows: the higher stands out of the lower
  vec4 T[GMX]; float mx = -9.0;
  for (int i = 0; i < GMX; i++) { if (i >= gN) break; T[i] = gTex(gL[i]); mx = max(mx, T[i].a + gW[i] * 2.0); }
  vec3 col = vec3(0.0); float sum = 0.0, hg = 0.0, ha = 0.0;
  for (int i = 0; i < GMX; i++) { if (i >= gN) break; float b = max(T[i].a + gW[i] * 2.0 - mx + 0.24, 0.0); vec3 bc = gC[i] / gW[i]; vec3 mc = m3col(T[i]);
    if (gL[i] == M3_CRAG) mc = mix(vec3(1.0), mc, 0.5); // (21b: the rock's own picture only its grain: the layers of the place show through it, not the picture's folds)
    col += bc * m3tint(mc, bc) * b; hg += T[i].a * gAmp(gL[i]) * b; ha += T[i].a * b; sum += b; }
  gHgt = hg / max(sum, 1e-4); gHa = ha / max(sum, 1e-4);
  col /= max(sum, 1e-4);
  // (the dunes: their ripples in the light, the crests a little paler, the hollows between them holding a shade)
  if (gDune > 0.01) { float rp = gRip(vGP.xz) * gDune; gHgt = gHgt * (1.0 - gDune * 0.6) + rp * 0.03; col *= 1.0 + (rp - 0.35 * gDune) * 0.08; }
  return col;
}
#endif
vec3 groundCol() {
  vec2 u = vGP.xz / uTL - 0.5; vec2 i0 = floor(u); vec2 f = u - i0;
  ivec2 a = ivec2(i0); ivec2 hi = ivec2(int(uN) - 1);
#ifdef GDETAIL
  // (the drawn grain, read only where it is drawn: before the pictures are in — once they are, only the warm and the cool
  // of a hundred metres; three reads a point fewer over all the land)
  vec4 d = vec4(0.5); float m1 = 0.5, m2 = 0.5;
  if (uTexOn < 0.5) { d = texture2D(uDet, vGP.xz / 1.7); m1 = texture2D(uDet, vGP.xz / 37.0).r; m2 = texture2D(uDet, vGP.xz / 9.0).g; }
  float m3 = texture2D(uDet, vGP.xz / 91.0 + 0.4).g;
#else
  vec4 d = vec4(0.5); float m1 = 0.5; float m2 = 0.5; float m3 = 0.5;
#endif
  vec4 t00 = texelFetch(uMap, clamp(a, ivec2(0), hi), 0), t10 = texelFetch(uMap, clamp(a + ivec2(1, 0), ivec2(0), hi), 0);
  vec4 t01 = texelFetch(uMap, clamp(a + ivec2(0, 1), ivec2(0), hi), 0), t11 = texelFetch(uMap, clamp(a + ivec2(1, 1), ivec2(0), hi), 0);
  // (the land melts from one kind into the next with a ragged edge; a street or a field keeps its line)
  float hard = max(max(gHard(t00), gHard(t10)), max(gHard(t01), gHard(t11)));
  float B = mix(0.27, 0.035, hard);
  // (the ragged edge: the drawn grain's, or once the pictures are in a soft noise of a metre or so)
  float nE = m2; float tex = 0.0;
#ifdef GDETAIL
  if (uTexOn > 0.5) { tex = 1.0; nE = 0.5 + (texture2D(uCN, vGP.xz / 14.0 + 0.27).g - 0.5) * 1.5; }
#endif
  vec2 s = smoothstep(0.5 - B, 0.5 + B, f + (nE - 0.5) * 0.4 * (1.0 - hard));
  float steep = 1.0 - smoothstep(0.55, 0.8, vGN.y);
  gGeo(a, hi, f, s, floor(t00.a * 255.0 + 0.5), floor(t10.a * 255.0 + 0.5), floor(t01.a * 255.0 + 0.5), floor(t11.a * 255.0 + 0.5)); // (21b)
  vec3 c; float mB = 0.5, mP = 0.5; float near = 1.0; // (near: how near the water — the floor's wet bank — the wash of the waves reaches only there)
  // (the floor, read smoothly from tile to tile: the leaves the trees drop, the wet of a bank, the snow lying)
  vec4 fm = texture2D(uFMap, vGP.xz / (uTL * uN));
#ifdef GDETAIL
  if (tex > 0.5) {
    // (soft noises of the land, over ten, fifteen and forty metres: where the earth shows bare, which copy of a picture
    // shows, where the meadow has gone yellow, where a swamp pools)
    mB = texture2D(uCN, vGP.xz / 140.0 + 0.13).g; float mT = texture2D(uCN, vGP.xz / 61.0 + 0.61).r; mP = texture2D(uCN, vGP.xz / 170.0 + 0.41).r;
    gP = vGP.xz; gP2 = mat2(0.454, -0.891, 0.891, 0.454) * vGP.xz * 0.41 + vec2(0.37, 0.71);
    gWX = smoothstep(0.3, 0.7, abs(vGN.x) / (abs(vGN.x) + abs(vGN.z) + 1e-4));
    gAT = mT; gStp = steep;
    near = smoothstep(0.08, 0.6, fm.b);
    // (the line of the water on a shore: a few decimetres round the sea's level, near the water — the stones of the swash,
    // here and there along it, not all the way: a beach of sand, then a stretch of shingle)
    if (near > 0.01) gWL = (1.0 - smoothstep(0.06, 0.26, abs(vGP.y - uSeaY - 0.03))) * near * smoothstep(0.38, 0.62, texture2D(uCN, vGP.xz / 47.0 + 0.83).r + 0.06);
    c = gStack(t00, t10, t01, t11, s, mP, mB, fm);
    // (a swamp's pools: still water, the sky in it the more one looks along it, smooth)
    if (gPool > 0.01) { float pf = pow(1.0 - clamp(dot(normalize(cameraPosition - vGP), vec3(0.0, 1.0, 0.0)), 0.0, 1.0), 3.0); c = mix(c, c * 0.55 + uSkyH * (0.08 + pf * 0.32), gPool * 0.8); gHgt *= 1.0 - gPool; }
  } else
#endif
  c = mix(mix(gShade(t00, d, m1, m2), gShade(t10, d, m1, m2), s.x), mix(gShade(t01, d, m1, m2), gShade(t11, d, m1, m2), s.x), s.y);
#ifdef GDETAIL
  // (the land a little warmer here, a little cooler there, over a hundred metres: no two fields the same green)
  c *= mix(vec3(1.05, 1.0, 0.9), vec3(0.93, 1.0, 1.07), m3);
#endif
  // ---- 21b: the rock (D-490, D-491): where the face is steep or the tile is cliff — its bands (the soft ones a little back in the
  // shade, the hard ones standing out as ledges in the light), its joints, the moss of the wet lands on its ledges and its faces turned
  // from the sun, the wet of the rain and of a fall's spray darkening it and giving it the sky's sheen ----
  { float rk = clamp(max(steep * 1.35, gWR), 0.0, 1.0);
    if (rk > 0.004) {
      float sL = vGP.y + gFold; float fd = 1.0 - smoothstep(45.0, 140.0, length(cameraPosition - vGP));
#ifdef GDETAIL
      if (tex < 0.5) c = mix(c, gRC * (0.8 + d.b * 0.4), rk * 0.85);
      c *= mix(1.0, (0.8 + 0.24 * gRH) * mix(1.0, gJoint(vGP, vGN, sL), fd), rk);
      if (tex > 0.5) gHgt += (gRH - 0.5) * 0.24 * rk * fd;
      float mz = gMoss * rk * (smoothstep(0.12, 0.7, vGN.y) * 0.9 + smoothstep(0.0, 0.6, -vGN.z) * 0.55);
      mz *= smoothstep(0.38, 0.62, texture2D(uCN, vGP.xz / 9.0 + vGP.y * 0.05).g + (gMoss - 0.5) * 0.5);
      c = mix(c, vec3(0.055, 0.095, 0.032) * (0.75 + texture2D(uCN, vGP.xz / 2.3 + vGP.y * 0.21).r * 0.6), clamp(mz, 0.0, 0.88));
      if (tex > 0.5) gHgt += mz * 0.012;
#else
      c = mix(c, gRC, rk * 0.85);
#endif
      float wt = gWet * rk; float fr = pow(1.0 - clamp(dot(normalize(cameraPosition - vGP), normalize(vGN)), 0.0, 1.0), 3.0);
      c = c * (1.0 - wt * 0.4) + uSkyH * fr * wt * 0.16;
    }
  }
  // (the kerb where a street meets the rest)
  float r = mix(mix(gRoad(t00), gRoad(t10), s.x), mix(gRoad(t01), gRoad(t11), s.x), s.y);
  // ---- the snow, laid over the ground: as much as the floor says lies here (the cold of the place, its hollows, the feet
  // that tread it, the god's sudden winter), less on a slope, none on a steep face; its edge wandering and fraying, filling
  // the gaps between the stones and the tufts first; never under the water nor where the waves run, swept off a street to
  // its kerb. The earth just outside it a little dark with the melt; at its very edge thin, the ground showing through ----
  float snow = 0.0, eS = 0.0;
  if (fm.a > 0.004) {
#ifdef GDETAIL
    // (the snow's own picture — its drifts, how high it stands —, read before its edge: the edge follows it)
    vec4 sT = vec4(0.5);
    if (tex > 0.5) sT = mix(m3raw(M3_SNOW, gP * M3S_SNOW), m3raw(M3_SNOW, gP2 * M3S_SNOW), smoothstep(0.3, 0.7, gAT));
    // (near, the edge breaks round the tufts and the stones of the ground's own picture and along the snow's drifts: the snow
    // lying in the gaps and in its drifts, the grass and the earth standing out of it clean — a thaw, not a smear; farther
    // off it would only glitter. The edge itself sharp: a few centimetres, not a metre of grey)
    eS = gSnowE(fm, vGN.y, vGP.xz, uCN) + ((0.5 - gHa) * 0.28 + (sT.a - 0.5) * 0.14) * tex * (1.0 - smoothstep(9.0, 30.0, length(cameraPosition - vGP))) - clamp((uSeaY - vGP.y) / 3.5, 0.0, 1.0) * 4.0 - (1.0 - smoothstep(uSeaY + 0.25, uSeaY + 0.6, vGP.y)) * near;
    float fw = max(fwidth(eS) * 0.6, 0.03); snow = smoothstep(0.5 - fw, 0.5 + fw, eS);
#else
    eS = fm.a * mix(0.25, 1.0, smoothstep(0.62, 0.9, vGN.y)) - fm.b * 0.45; snow = smoothstep(0.38, 0.62, eS);
#endif
    snow *= 1.0 - smoothstep(0.3, 0.6, r) * hard;
    vec3 sc = GSNOW;
#ifdef GDETAIL
    if (tex > 0.5) {
      sc *= m3col(sT) * mix(vec3(0.87, 0.92, 1.04), vec3(1.0), smoothstep(0.3, 0.62, mP)); // (blue in its wide hollows)
      gHgt = mix(gHgt, sT.a * 0.025 + 0.035, snow); // (a few centimetres thick: its edge catches the light)
    } else { sc *= (1.0 + (d.a - 0.5) * 0.22) * mix(vec3(0.84, 0.9, 1.04), vec3(1.0), smoothstep(0.25, 0.7, m1)); sc += step(0.975, d.a) * 0.3; }
    sc = mix(sc, c * 1.25 + 0.05, (1.0 - smoothstep(0.5, 0.64, eS)) * 0.12); // (at its very edge thin, the ground just showing through)
#endif
    c *= 1.0 - 0.08 * smoothstep(0.3, 0.5, eS) * (1.0 - snow); // (the earth just outside it a little darker with the melt)
    c = mix(c, sc, snow);
  }
#ifdef GDETAIL
  if (tex < 0.5) {
  // (the grain lit by the sun: the little slopes of the pebbles, the tufts, the ridges of the sand)
  { float e = 0.02; vec4 dx = texture2D(uDet, vGP.xz / 1.7 + vec2(e, 0.0)), dz = texture2D(uDet, vGP.xz / 1.7 + vec2(0.0, e));
    float h0 = d.b * 0.6 + d.r * 0.4, hx = dx.b * 0.6 + dx.r * 0.4, hz = dz.b * 0.6 + dz.r * 0.4;
    float rough = mix(mix(gRough(t00), gRough(t10), s.x), mix(gRough(t01), gRough(t11), s.x), s.y) * (1.0 - snow * 0.6) * (1.0 - smoothstep(25.0, 70.0, length(cameraPosition - vGP)));
    gBumpV = vec2(hx - h0, hz - h0) / e * 0.012 * rough; }
  } else gHgt *= 1.0 - smoothstep(25.0, 75.0, length(cameraPosition - vGP)); // (the relief of the stuff fades far off, where it would only shimmer)
#endif
  c *= 1.0 - (1.0 - abs(r * 2.0 - 1.0)) * mix(0.32, 0.16, tex) * hard;
  // (the shadows of the clouds sliding over the land, as the god sees them pass)
#ifdef GDETAIL
  if (uCS > 0.0) { vec2 cu = vGP.xz / 520.0 + uCO; float cn = texture2D(uCN, cu).r * 0.68 + texture2D(uCN, cu * 3.1 + 0.37).g * 0.32;
    c *= 1.0 - smoothstep(0.98 - uCC, 1.18 - uCC, cn) * uCS; } // (none read when the clouds cast no shadow)
#endif
#ifdef GDETAIL
  // (a steep face shows its layers of rock, whatever the tiles say — drawn, until the pictures are in)
  if (tex < 0.5) c = mix(c, c * (0.84 + 0.16 * sin(vGP.y * 3.6 + d.g * 3.0)) * (0.8 + d.b * 0.4), steep * 0.8);
  // (under the water: the waves' light dancing on the bed, the sea's blue over what lies deep; just above it, the sand is wet)
  float wb = mix(mix(gBed(t00), gBed(t10), s.x), mix(gBed(t01), gBed(t11), s.x), s.y);
  float under = clamp((uSeaY - vGP.y) / 3.5, 0.0, 1.0);
  c += vec3(0.8, 0.95, 0.9) * gCaus(vGP.xz, uTime) * wb * 0.14 * (1.0 - under * 0.7);
  c = mix(c, c * vec3(0.5, 0.74, 0.8), under);
  float wetB = (1.0 - smoothstep(uSeaY + 0.02, uSeaY + 0.6, vGP.y)) * step(uSeaY - 0.05, vGP.y) * (1.0 - wb) * near;
  c *= 1.0 - wetB * 0.32;
  if (tex > 0.5) {
    // (the waves run up the beach and back: the sand they wet darker and shining with the sky, a thin line of foam at
    // their edge — a little different all along the shore)
    float ph = uTime * 0.5 + dot(vGP.xz, vec2(0.045, 0.031)) + mB * 5.0; float run = uSeaY + 0.2 + 0.17 * sin(ph);
    float lap = (1.0 - smoothstep(run - 0.05, run + 0.02, vGP.y)) * step(uSeaY - 0.05, vGP.y) * (1.0 - wb) * near;
    float sheen = pow(1.0 - clamp(dot(normalize(cameraPosition - vGP), vec3(0.0, 1.0, 0.0)), 0.0, 1.0), 3.0);
    c = mix(c, c * 0.82 + uSkyH * sheen * 0.22, max(lap, wetB * 0.6));
    c = mix(c, vec3(0.86, 0.9, 0.9), smoothstep(run - 0.07, run - 0.015, vGP.y) * (1.0 - smoothstep(run - 0.015, run + 0.02, vGP.y)) * (1.0 - wb) * near * step(uSeaY, vGP.y) * (0.25 + 0.2 * cos(ph)));
    gHgt *= 1.0 - lap * 0.7; // (the wet sand lies smooth)
    // (the stones of the swash green with weed where the water covers them; and the line of the high water, just above the
    // waves' reach: dark strands of seaweed and wrack the sea left there, broken here and there)
    if (near > 0.01) {
      c = mix(c, c * vec3(0.62, 0.8, 0.48), gWL * (1.0 - smoothstep(uSeaY - 0.2, uSeaY + 0.08, vGP.y)) * 0.8);
      float wy = uSeaY + 0.46 + (mB - 0.5) * 0.14;
      float wk = (1.0 - smoothstep(0.025, 0.085, abs(vGP.y - wy))) * near * (1.0 - wb);
      if (wk > 0.001) { wk *= smoothstep(0.42, 0.58, texture2D(uCN, vGP.xz / 19.0 + 0.4).g + 0.04); float wst = smoothstep(0.5, 0.64, texture2D(uDet, vGP.xz / 0.85 + 0.31).r) * wk;
        c = mix(c, vec3(0.05, 0.052, 0.026) * (0.8 + texture2D(uDet, vGP.xz / 1.7).g * 0.5), wst * 0.85); gHgt += wst * 0.012; }
    }
  }
#endif
#ifdef AGUA_WET
  c = aguaWetGround(c, vGP, vGN, uAgSky, uTime, uDet); // (21c: the rain that wets — the water's picture of the wet, G.Agua3D)
#endif
  return c;
}
`;
  // (the mean colour of each picture of the stack, linear — for the stuffs drawn in their own colour)
  const gMeans = () => Object.keys(G.TEX3D || {}).map(n => `#define GM_${n.toUpperCase()} vec3(${G.TEX3D[n].mean.map(v => Math.pow(v, 2.2).toFixed(4)).join(', ')})`).join('\n') + '\n';
  G3.init = function (three) {
    THREE = three; det = makeDetail(); U.uDet.value = det; U.uTL.value = G.Space.TILE; U.uSeaY.value = G.SEA * G.Space.HM;
    U.uTime = G.Realm.U.time; // (the view's clock: the light on the beds moves with the waves)
    U.uCO.value = new THREE.Vector2(); U.uCN.value = G3.cloudNoise(); U.uSkyH.value = new THREE.Color(0.75, 0.82, 0.9);
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    mat.onBeforeCompile = sh => {
      // (the sky's colour at the horizon, for what shines with it: the wet sand)
      if (G.Realm.skyU) U.uSkyH = G.Realm.skyU.hor;
      Object.assign(sh.uniforms, U, G3.U3());
      if (G.Agua3D) Object.assign(sh.uniforms, G.Agua3D.wetU()); // (21c: the wet of the land and its puddles)
      sh.vertexShader = 'varying vec3 vGP; varying vec3 vGN;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vGP = (modelMatrix * vec4(transformed, 1.0)).xyz; vGN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + [G3.texGLSL(), gMeans(), G.Agua3D ? G.Agua3D.groundGLSL() : '', FRAG()].join('\n')).replace('#include <opaque_fragment>', '#ifdef AGUA_WET\n outgoingLight += gAgSheen;\n#endif\n#include <opaque_fragment>').replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( groundCol(), opacity );')
        // (the relief: from the stuff's heights once the pictures are in — the slopes of a pebble, a cobble, a tuft — and
        // from the drawn grain before)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        #ifdef GDETAIL
        if (uTexOn > 0.5) {
          vec3 dpx = dFdx(vGP), dpy = dFdy(vGP); vec3 nw = normalize(vGN); vec3 r1 = cross(dpy, nw), r2 = cross(nw, dpx); float det = dot(dpx, r1);
          vec3 gr = sign(det) * (dFdx(gHgt) * r1 + dFdy(gHgt) * r2);
          normal = normalize((viewMatrix * vec4(normalize(abs(det) * nw - gr), 0.0)).xyz);
        } else
        #endif
        normal = normalize(normal + (viewMatrix * vec4(-gBumpV.x, 0.0, -gBumpV.y, 0.0)).xyz);`);
      mat.userData.shader = sh;
    };
    G3.quality();
    dirtyAll = true;
  };
  // (the grain only where the machine can carry it)
  G3.quality = function () { if (!mat) return; const q = G.Realm.Q();
    // (the samples of the pictures read at a slant, by the preset — sent again to the card only when the quality changes, never per frame)
    { const an = q.aniso || 4; for (const t of [texArr, det]) if (t && t.anisotropy !== an) { t.anisotropy = an; t.needsUpdate = true; } }
    const want = q.detail !== 0; const has = !!(mat.defines && mat.defines.GDETAIL); if (want !== has) { mat.defines = want ? { GDETAIL: 1 } : {}; mat.needsUpdate = true; } };
  G3.material = () => mat;
  // 21b: the table of the layers of the rocks as a picture (a row a rock, 256 samples a period: the band's colour, how hard it is) — made
  // again when the world's seed changes; read smoothly along the layers, never between the rows
  function strataTex() {
    if (!THREE || !G.Geo || !G.S) return; const sd = G.S.seed | 0; if (stmap && stFor === sd) { U.uStrata.value = stmap; return; }
    const tb = G.Geo.table(); const n = G.Geo.ROCKS.length;
    if (!stmap || stmap.image.height !== n) { if (stmap) stmap.dispose(); stmap = new THREE.DataTexture(new Uint8Array(G.Geo.TS * n * 4), G.Geo.TS, n, THREE.RGBAFormat, THREE.UnsignedByteType);
      stmap.colorSpace = THREE.SRGBColorSpace; stmap.magFilter = stmap.minFilter = THREE.LinearFilter; stmap.wrapS = THREE.RepeatWrapping; stmap.wrapT = THREE.ClampToEdgeWrapping; stmap.generateMipmaps = false; stmap.flipY = false; }
    stmap.image.data.set(tb); stmap.needsUpdate = true; stFor = sd; U.uStrata.value = stmap;
  }
  G3.strataMap = () => { strataTex(); return stmap; };
  // (the clouds over the land: their offset as the wind carries them, how much of the sky they cover, how dark their shadow)
  G3.clouds = function (ox, oz, cover, k) { if (!U.uCO.value) U.uCO.value = new THREE.Vector2(); U.uCN.value = G3.cloudNoise(); U.uCO.value.set(ox, oz); U.uCC.value = cover; U.uCS.value = k; };
  // a soft noise for the clouds (R: the big shapes, G: the small; tiling) — made once
  let cloudTx = null, cloudData = null;
  G3.cloudNoise = function () {
    if (cloudTx) return cloudTx; const S = 128; const out = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = y * S + x; out[i * 4] = fbmS(S, x, y, 4, 5, 21) * 255; out[i * 4 + 1] = fbmS(S, x, y, 16, 3, 33) * 255; out[i * 4 + 2] = 128; out[i * 4 + 3] = 255; }
    cloudTx = new THREE.DataTexture(out, S, S, THREE.RGBAFormat, THREE.UnsignedByteType); cloudData = out;
    cloudTx.wrapS = cloudTx.wrapT = THREE.RepeatWrapping; cloudTx.magFilter = THREE.LinearFilter; cloudTx.minFilter = THREE.LinearMipmapLinearFilter; cloudTx.generateMipmaps = true; cloudTx.needsUpdate = true;
    return cloudTx;
  };
  // (a picture's channel read as the graphics card reads it, between its four texels: wrapping, or held at the edge)
  function bil(a, S, u, v, ch, wrap) {
    const x = u * S - 0.5, y = v * S - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const at = (i, j) => { if (wrap) { i = ((i % S) + S) % S; j = ((j % S) + S) % S; } else { i = i < 0 ? 0 : i >= S ? S - 1 : i; j = j < 0 ? 0 : j >= S ? S - 1 : j; } return a[(j * S + i) * 4 + ch]; };
    return ((at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy) / 255;
  }
  // the snow at a point of the world (metres) as the land's shader lays it — gSnowE, without the grain of the ground's own
  // pictures: past 0.5 there is snow there. For what the drawing puts on the ground (the prints of feet: in the snow, or in
  // the earth beside it) and for the tests
  G3.snowXZ = function (X, Z) {
    if (!fdata || !cloudData || size !== N) return 0; const TL = G.Space.TILE, u = X / (TL * N), v = Z / (TL * N);
    const cover = bil(fdata, N, u, v, 3, false); if (cover < 0.004) return 0;
    const x = X / TL, y = Z / TL, e = 0.25, HM = G.Space.HM; const gx = (W.hAt(x + e, y) - W.hAt(x - e, y)) * HM / (2 * e * TL), gz = (W.hAt(x, y + e) - W.hAt(x, y - e)) * HM / (2 * e * TL);
    const ny = 1 / Math.hypot(gx, 1, gz), flat = G.smooth(0.62, 0.9, ny);
    const a = bil(cloudData, 128, X / 31 + 0.19, Z / 31 + 0.19, 0, true), b = bil(cloudData, 128, X / 13 + 0.71, Z / 13 + 0.71, 1, true);
    return cover * (0.25 + 0.75 * flat) - bil(fdata, N, u, v, 0, false) * 0.32 - bil(fdata, N, u, v, 2, false) * 0.45 + (a - 0.5) * 0.75 + (b - 0.5) * 0.4;
  };
  G3.detail = () => det;

  // ------------------------------ the materials (arte/texturas.py → G.TEX3D) ------------------------------
  // every material of the 3D in one stack of pictures the graphics card reads at once (a texture array): wood, stone,
  // turf, thatch, tiles, plaster, the kinds of ground, bark. Each layer is the material's colour over its own mean (×0.5)
  // and its height in alpha: what a thing is multiplied by — the world's colour stays the world's colour, with the grain,
  // the joints and the tufts of the material round it. Until the pictures are decoded (a moment after the 3D opens) the
  // stack is one plain grey layer, and everything looks as it did before
  const TEXN = G.TEX3D ? Object.keys(G.TEX3D) : [];
  G3.TEXL = {}; TEXN.forEach((n, k) => { G3.TEXL[n] = k; });
  let texArr = null, texReady = false;
  G3.texReady = () => texReady;
  // (the uniforms every material shares by reference: the stack, and whether it is in yet)
  const U3 = { uTex3: { value: null }, uTexOn: { value: 0 } };
  G3.U3 = () => { U3.uTex3.value = G3.tex(); return U3; };
  // (decoded as soon as the game opens, quietly, into one buffer; the stack for the graphics card is made from it when the
  // 3D first asks, and sent again when the last picture is in)
  const TS = 512, TL3 = Math.max(1, TEXN.length);
  let texData = null;
  function decode() {
    if (texData) return; texData = new Uint8Array(TS * TS * 4 * TL3).fill(128);
    let left = TEXN.length; if (!left) { texReady = true; U3.uTexOn.value = 1; return; }
    const cv = document.createElement('canvas'); cv.width = cv.height = TS; const cx = cv.getContext('2d', { willReadFrequently: true });
    const done = () => { if (--left > 0) return; texReady = true; U3.uTexOn.value = 1; if (texArr) texArr.needsUpdate = true; };
    TEXN.forEach((n, k) => {
      const im = new Image();
      im.onload = () => { cx.clearRect(0, 0, TS, TS); cx.drawImage(im, 0, 0, TS, TS); texData.set(cx.getImageData(0, 0, TS, TS).data, k * TS * TS * 4); done(); };
      im.onerror = done; im.src = G.TEX3D[n].src;
    });
  }
  if (typeof document !== 'undefined') setTimeout(decode, 300);
  G3.tex = function () {
    if (texArr || !THREE) return texArr;
    decode();
    texArr = new THREE.DataArrayTexture(texData, TS, TS, TL3); texArr.format = THREE.RGBAFormat; texArr.type = THREE.UnsignedByteType;
    texArr.wrapS = texArr.wrapT = THREE.RepeatWrapping; texArr.magFilter = THREE.LinearFilter; texArr.minFilter = THREE.LinearMipmapLinearFilter; texArr.generateMipmaps = true; texArr.anisotropy = (G.Realm && G.Realm.Q ? G.Realm.Q().aniso : 0) || 4; texArr.needsUpdate = true;
    return texArr;
  };
  // the GLSL every material of the 3D includes to read the stack: m3(layer, uv in metres) — the colour factor (linear,
  // 1 on average) and the height; m3b — the slope of the height, for the light (finite differences over a few cm)
  G3.texGLSL = function () {
    let defs = ''; TEXN.forEach((n, k) => { defs += `#define M3_${n.toUpperCase()} ${k}.0\n#define M3S_${n.toUpperCase()} ${(1 / G.TEX3D[n].m).toFixed(5)}\n`; });
    return defs + `
uniform highp sampler2DArray uTex3; uniform float uTexOn;
vec4 m3raw(float L, vec2 uv) { return texture(uTex3, vec3(uv, L)); }
vec3 m3col(vec4 t) { return pow(max(t.rgb * 2.0, vec3(0.0)), vec3(2.2)); }
// (a picture's own hue only as much as the colour under it has one: on a pale, grey ground — the cold's white under a
// thin snow — the green of the grass's picture turned mint and its dark purple; on a green ground it stays as it is)
vec3 m3tint(vec3 t, vec3 base) { float hi = max(base.r, max(base.g, base.b)), lo = min(base.r, min(base.g, base.b)); float l = dot(t, vec3(0.2126, 0.7152, 0.0722)); return l + (t - l) * clamp((hi - lo) / max(hi, 1e-3) / 0.6, 0.0, 1.0); }
vec2 m3slope(float L, vec2 uv, float h0) { float e = 0.006; return vec2(texture(uTex3, vec3(uv + vec2(e, 0.0), L)).a - h0, texture(uTex3, vec3(uv + vec2(0.0, e), L)).a - h0) / e; }
`;
  };

  // ------------------------------ the insides' materials in high resolution (P8: arte/tex_alta.py → G.TEX3DA) ------------------------------
  // On the Alta and the Ultra the materials seen inside are read from pictures of their own (D-770 to D-773): the floors, the walls
  // and the furniture's wood (tier 1) and the stone, the clay, the mosaic, the frieze, the mat and the rug (tier 2) — photographs of
  // Poly Haven (CC0) neutralized as the stack's are (the world's colour multiplies them), with the normal of their relief and their
  // roughness. Two stacks of their own, never the world's 63 layers made bigger: X, the tier 1's brightness, relief and roughness
  // [luma, nx, ny, rough] at 2048 on the Ultra and 1024 on the Alta; Y, at half that, the tier 1's hue [cr, cb] and the tier 2's two
  // layers. Loaded only on those two qualities, in the background, a material at a time — its file by a script tag (the game opens
  // from the disk: a picture fetched would be refused by WebGL), its pictures decoded, its layers sent to the card one by one —; until
  // a material is in, the stack's 512 draws it as before (uHiOk). Only seen: nothing of the world read, nothing written
  const HI = G.TEX3DA && Array.isArray(G.TEX3DA.mats) ? G.TEX3DA : null; const HM = HI ? HI.mats : [];
  const H1 = HM.filter(m => m.t === 1), H2 = HM.filter(m => m.t !== 1);
  // (where each material's layers are: the tier 1's brightness in X and its hue in Y; the tier 2's both in Y, after the tier 1's hues)
  const HL = new Map(); H1.forEach((m, k) => HL.set(m.n, { x: 1, a: k, c: k })); H2.forEach((m, j) => HL.set(m.n, { x: 0, a: H1.length + 2 * j, c: H1.length + 2 * j + 1 }));
  const NX = Math.max(1, H1.length), NY = Math.max(1, H1.length + 2 * H2.length);
  G3.HI_SIZE = { alta: 1024, ultra: 2048 }; // (the tier 1's side by quality; the tier 2's and the hues', half that — D-772)
  const UH = { uHiX: { value: null }, uHiY: { value: null }, uHiOk: { value: new Array(Math.max(1, HM.length)).fill(0) } };
  G3.hiU = () => UH;
  let hs = null, hiGen = 0; const asked = new Set();
  // (for the proofs and the menu: the side being loaded, the materials in, the bytes on the card)
  G3.hiState = () => ({ size: hs ? hs.size : 0, in: HM.filter((m, k) => UH.uHiOk.value[k] > 0.5).map(m => m.n), of: HM.length, bytes: hs ? hiBytes(hs.size) : 0, err: hs ? hs.err.slice() : [] });
  G3.hiReady = () => !!hs && HM.length > 0 && UH.uHiOk.value.every(v => v > 0.5);
  const hiBytes = s => Math.round((s * s * NX + (s >> 1) * (s >> 1) * NY) * 4 * 4 / 3); // (with the mipmaps: a third more)
  function hiDrop() {
    hiGen++; if (hs) { hs.X.dispose(); hs.Y.dispose(); } hs = null;
    UH.uHiX.value = UH.uHiY.value = null; UH.uHiOk.value.fill(0);
  }
  // the quality's set wanted (its name, or nothing: the Média, the Leve — the cards' memory given back)
  G3.hiWant = function (q) {
    const size = (HM.length && typeof document !== 'undefined' && THREE && G3.HI_SIZE[q]) || 0;
    if (hs && hs.size === size) return; hiDrop(); if (!size) return;
    const R = G.Realm && G.Realm.renderer && G.Realm.renderer(); if (!R || R.capabilities.maxTextureSize < size) return;
    const an = (G.Realm.Q ? G.Realm.Q().aniso : 0) || 4;
    const mk = (s, n) => { const t = new THREE.DataArrayTexture(new Uint8Array(s * s * 4 * n), s, s, n); t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType;
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = an; return t; };
    hs = { size, X: mk(size, NX), Y: mk(size >> 1, NY), todo: HM.map(m => m.n), gen: ++hiGen, busy: false, err: [], R };
    // (two seconds after the 3D opens: the start of the game and of the body never wait for it)
    const g = hs.gen; setTimeout(() => hiPump(g), 2000);
  };
  if (HI) HI.got = () => { if (hs) { const g = hs.gen; setTimeout(() => hiPump(g), 0); } };
  // (a failure — a file not found, a picture not decoded — is counted where every module's is: G.modErr, a failure of the proofs)
  function hiErr(m, what) { if (!hs) return; hs.err.push(m.n + ': ' + what); G.modErr.TexAlta = (G.modErr.TexAlta || 0) + 1; console.error('[TexAlta]', m.n, what); }
  // one step at a time: the next material's file asked, or its pictures made into its layers
  function hiPump(gen) {
    if (!hs || hs.gen !== gen || hs.busy) return;
    const n = hs.todo[0]; if (!n) { hiDone(); return; } const m = HM.find(x => x.n === n);
    if (!HI.data[n]) {
      if (asked.has(n)) return; asked.add(n);
      const s = document.createElement('script'); s.src = m.f;
      s.onload = () => { s.remove(); if (!HI.data[n] && hs && hs.gen === gen) { hiErr(m, 'o arquivo não trouxe o material'); hs.todo.shift(); hiPump(gen); } };
      s.onerror = () => { s.remove(); asked.delete(n); if (hs && hs.gen === gen) { hiErr(m, 'o arquivo ' + m.f + ' não abriu'); hs.todo.shift(); hiPump(gen); } };
      document.head.appendChild(s); return;
    }
    hs.busy = true;
    hiMake(m, gen).then(ok => { if (!hs || hs.gen !== gen) return; hs.busy = false; if (!ok) hiErr(m, 'a figura não abriu'); hs.todo.shift(); setTimeout(() => hiPump(gen), 40); });
  }
  // (all in: the copies kept for the card are let go — the card has them; nothing sends them again)
  function hiDone() { if (!hs || hs.free) return; hs.free = true; hs.X.image.data = null; hs.Y.image.data = null; }
  const pause = ms => new Promise(r => setTimeout(r, ms || 16));
  const picture = uri => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = uri; });
  let cv = null, cx = null;
  function pixels(im, sx, sw, s) { if (!cv) { cv = document.createElement('canvas'); cx = cv.getContext('2d', { willReadFrequently: true }); }
    if (cv.width !== s || cv.height !== s) { cv.width = cv.height = s; } cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.clearRect(0, 0, s, s);
    cx.drawImage(im, sx, 0, sw, im.naturalHeight, 0, 0, s, s); return cx.getImageData(0, 0, s, s).data; }
  // (the colour's bytes back to the linear ratio, and the brightness to its byte: the stack's gamma 2.2 over ×0.5)
  const LIN = new Float32Array(256).map((_, v) => Math.pow(v / 255 * 2, 2.2));
  // (the hue — the red and the blue over the brightness — in log2 from a quarter to four: a step of 1 % near the neutral of the
  // photographs, and room for the mosaic's red tesserae and the rug's dyes)
  const HUE = q => Math.max(0, Math.min(255, Math.round((Math.log2(Math.max(q, 1e-3)) + 2) / 4 * 255))); const LUM = new Uint8Array(8192).map((_, i) => Math.round(Math.min(1, Math.pow(i / 2048, 1 / 2.2) * 0.5) * 255));
  // a material's pictures into its layers: the brightness [r], and the hue [r, g] at the hue's side; the relief and the roughness [g, b, a]
  async function hiMake(m, gen) {
    const L = HL.get(m.n), k = HM.indexOf(m), s = hs.size, sA = L.x ? s : s >> 1, sC = s >> 1, A = L.x ? hs.X : hs.Y, C = hs.Y;
    const d = HI.data[m.n]; const ic = await picture(d.c), ig = await picture(d.g); if (!ic || !ig) return false;
    const live = () => hs && hs.gen === gen;
    await pause(); if (!live()) return true;
    let px = pixels(ic, 0, ic.naturalWidth, sA); const a = A.image.data, oa = L.a * sA * sA * 4;
    for (let i = 0, j = oa, n = sA * sA; i < n; i++, j += 4) { const q = i * 4; a[j] = LUM[Math.min(8191, ((0.2126 * LIN[px[q]] + 0.7152 * LIN[px[q + 1]] + 0.0722 * LIN[px[q + 2]]) * 2048) | 0)]; }
    await pause(); if (!live()) return true;
    px = pixels(ic, 0, ic.naturalWidth, sC); const c = C.image.data, oc = L.c * sC * sC * 4;
    for (let i = 0, j = oc, n = sC * sC; i < n; i++, j += 4) { const q = i * 4; const r = LIN[px[q]], g = LIN[px[q + 1]], b = LIN[px[q + 2]], l = Math.max(1e-4, 0.2126 * r + 0.7152 * g + 0.0722 * b);
      c[j] = HUE(r / l); c[j + 1] = HUE(b / l); c[j + 2] = 128; c[j + 3] = 255; }
    const w3 = ig.naturalWidth / 3;
    for (let ch = 0; ch < 3; ch++) { await pause(); if (!live()) return true; px = pixels(ig, ch * w3, w3, sA);
      for (let i = 0, j = oa + 1 + ch, n = sA * sA; i < n; i++, j += 4) a[j] = px[i * 4]; }
    await pause(); if (!live()) return true;
    // (to the card, its layers only — three sends what it is told is new: the stacks are made on the card at the first, empty)
    A.addLayerUpdate(L.a); A.needsUpdate = true; hs.R.initTexture(A);
    C.addLayerUpdate(L.c); C.needsUpdate = true; hs.R.initTexture(C);
    UH.uHiX.value = hs.X; UH.uHiY.value = hs.Y; UH.uHiOk.value[k] = 1;
    return true;
  }
  // the GLSL the insides' material reads them with (inside M3HI: the Alta's and the Ultra's only), from the patterns' numbers
  // (Build3D.PAT): m3hiOf — the material a pattern reads, or -1; m3hiInfo — its layers, whether it is in, the metres its picture
  // covers, whether its repeat is broken; m3hiRead — its brightness (linear, 1 on average), its relief (the normal's x and y along
  // the picture's axes) and roughness, its hue; m3hiN — a smooth noise of the eye's own (never the world's chance)
  G3.hiGLSL = function (PAT) {
    if (!HM.length) return '';
    const num = p => PAT[p]; let of = '', info = '';
    HM.forEach((m, k) => {
      const ps = m.pats.map(num).filter(v => v !== undefined); const L = HL.get(m.n);
      if (ps.length) of += `  if (${ps.map(v => `p == ${v}.0`).join(' || ')}) return ${k};\n`;
      info += `  if (k == ${k}) { A = vec4(${L.x}.0, ${L.a}.0, ${L.c}.0, uHiOk[${k}]); S = vec4(${(1 / m.m[0]).toFixed(5)}, ${(1 / m.m[1]).toFixed(5)}, ${m.anti ? 1 : 0}.0, 0.0); return; }\n`;
    });
    const turn = HM.flatMap(m => (m.turn || []).map(num)).filter(v => v !== undefined);
    // (a piece of furniture reads its wood planed: the hewn beam's picture is the roof's, never the arm of a chair)
    const piece = HM.map((m, k) => m.movel ? `  if (k == ${k}) return ${HM.findIndex(x => x.n === m.movel)};\n` : '').join('');
    return `
#ifdef M3HI
uniform highp sampler2DArray uHiX; uniform highp sampler2DArray uHiY; uniform float uHiOk[${Math.max(1, HM.length)}];
int m3hiOf(float p) {
${of}  return -1;
}
int m3hiPiece(int k) {
${piece}  return k;
}
void m3hiInfo(int k, out vec4 A, out vec4 S) {
  A = vec4(0.0); S = vec4(1.0, 1.0, 0.0, 0.0);
${info}}
bool m3hiTurn(float p) { return ${turn.length ? turn.map(v => `p == ${v}.0`).join(' || ') : 'false'}; }
void m3hiRead(vec4 A, vec2 t, out float lum, out vec2 nxy, out float rough, out vec2 ch) {
  vec4 a = A.x > 0.5 ? texture(uHiX, vec3(t, A.y)) : texture(uHiY, vec3(t, A.y));
  vec4 c = texture(uHiY, vec3(t, A.z));
  lum = pow(a.r * 2.0, 2.2); nxy = a.gb * 2.0 - 1.0; rough = a.a; ch = exp2(c.rg * 4.0 - 2.0);
}
float m3hiH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float m3hiN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(m3hiH(i), m3hiH(i + vec2(1.0, 0.0)), f.x), mix(m3hiH(i + vec2(0.0, 1.0)), m3hiH(i + vec2(1.0, 1.0)), f.x), f.y); }
#endif
`;
  };
})(window.G);
