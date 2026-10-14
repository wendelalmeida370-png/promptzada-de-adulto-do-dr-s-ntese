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
  G.worldHooks.push(() => { dirtyAll = true; row = 0; sweep = 0; });
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
  function paint(i, x, y, out) {
    const S = G.S; const t = S.type[i];
    let c = G3.tileCol(i, x, y), k = K.grass;
    const b = S.occ[i] && S.buildings.get(S.occ[i]);
    if (t <= T.RIVER) k = t === T.RIVER ? K.river : K.bed; // (the sea's bed of sand, a river's of gravel)
    else if (S.scar[i] > 0 || S.burnt[i] > 0) k = K.burnt;
    else if (S.road[i]) { const r = Math.min(3, S.road[i]); c = ROADC[r]; k = r === 1 ? K.gravel : r === 2 ? K.paved : K.highway; }
    else if (b && FARM[b.type]) {
      // (the god's field: turned earth, or the water of a rice paddy; half dug while it is still being made)
      const gr = G.Estates && b.built && G.Estates.grainOf ? G.Estates.grainOf(b) : null;
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
    // (the edge of the water: the sand is wet and dark, the grass a little darker)
    if (k !== K.bed && k < K.path && k !== K.snow) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.type[ny * N + nx] <= T.RIVER && !(S.dry && S.dry[ny * N + nx])) { if (k === K.sand || k === K.dune) k = K.wet; else c = [c[0] * 0.9, c[1] * 0.92, c[2] * 0.9]; break; } } }
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
    // (where the cold whitens the ground the grass is under the snow: thinner as it whitens, none where it lies deep)
    const snow = S.temp ? G.clamp((0.235 - S.temp[i] / 255) / 0.07, 0, 1) : 0; if (snow > 0.45) { out[0] = out[1] = out[2] = out[3] = 0; return out; }
    out[0] = Math.round(g[0] * worn * (1 - snow * 1.6)); out[1] = g[1]; out[2] = g[2]; out[3] = g[3];
    return out;
  }
  // the floor of a tile, for the stuff that lies on it (the land's shader, the small things round the body — Grass3D):
  // R the leaves and needles the trees round it drop, G whether small things may lie here (255; 0 on a road, a house, a
  // field, a wall, the water), B how wet the bank is (next to a river, a lake, the sea)
  function floorOf(i, x, y, out) {
    const S = G.S; const t = S.type[i]; const free = !(S.occ[i] || S.wall[i] || S.road[i] || t <= T.RIVER);
    let lit = 0, wet = 0;
    if (free) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx;
      const tid = S.treeAt[j]; const tr = tid && S.trees.get(tid);
      if (tr && tr.stage === 'grow' && tr.size > 0.3) lit += (dx || dy ? 0.42 : 1) * Math.min(1, tr.size);
      if (S.type[j] <= T.RIVER && !(S.dry && S.dry[j]) && !(S.ice && S.ice[j])) wet = Math.max(wet, dx && dy ? 0.55 : 1);
    }
    out[0] = Math.round(G.clamp(lit / 1.5, 0, 1) * 255); out[1] = free ? 255 : 0; out[2] = Math.round(wet * 255); out[3] = 255;
    return out;
  }
  G3.grassMap = () => gmap;
  G3.map = () => map;
  G3.floorMap = () => fmap;
  // a band of rows of the picture made again from the world; true when something changed
  const px = [0, 0, 0, 0], gx = [0, 0, 0, 0], fx4 = [0, 0, 0, 0];
  function rows(y0, y1, x0, x1) {
    if (!data) return false; let ch = false, gch = false, fch = false;
    for (let y = Math.max(0, y0); y < Math.min(N, y1); y++) for (let x = Math.max(0, x0); x < Math.min(N, x1); x++) {
      const i = y * N + x; paint(i, x, y, px); const o = i * 4;
      if (data[o] !== px[0] || data[o + 1] !== px[1] || data[o + 2] !== px[2] || data[o + 3] !== px[3]) { data[o] = px[0]; data[o + 1] = px[1]; data[o + 2] = px[2]; data[o + 3] = px[3]; ch = true; }
      grassOf(i, px[3], gx); if (gdata[o] !== gx[0] || gdata[o + 1] !== gx[1] || gdata[o + 2] !== gx[2] || gdata[o + 3] !== gx[3]) { gdata[o] = gx[0]; gdata[o + 1] = gx[1]; gdata[o + 2] = gx[2]; gdata[o + 3] = gx[3]; gch = true; }
      floorOf(i, x, y, fx4); if (fdata[o] !== fx4[0] || fdata[o + 1] !== fx4[1] || fdata[o + 2] !== fx4[2]) { fdata[o] = fx4[0]; fdata[o + 1] = fx4[1]; fdata[o + 2] = fx4[2]; fdata[o + 3] = fx4[3]; fch = true; }
    }
    if (gch && gmap) gmap.needsUpdate = true;
    if (fch && fmap) fmap.needsUpdate = true;
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
      gmap = new THREE.DataTexture(gdata, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); gmap.magFilter = gmap.minFilter = THREE.NearestFilter; gmap.generateMipmaps = false; gmap.flipY = false;
      // (the floor read smoothly: the leaves thin out from tree to tree, the wet fades up the bank)
      if (fmap) fmap.dispose(); fdata = new Uint8Array(N * N * 4);
      fmap = new THREE.DataTexture(fdata, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); fmap.magFilter = fmap.minFilter = THREE.LinearFilter; fmap.generateMipmaps = false; fmap.flipY = false;
    }
    rows(0, N, 0, N); map.needsUpdate = true; fmap.needsUpdate = true; dirtyAll = false; row = 0;
    U.uMap.value = map; U.uFMap.value = fmap; U.uN.value = N;
  };
  // every frame: a few rows of the land round the body made again (the paths worn, the fields growing, the fire, the snow),
  // and one row of the whole map (the far land changes too: a town grows on the horizon)
  let sweep = 0;
  G3.tick = function (focus) {
    if (!THREE) return; if (dirtyAll || !map) { G3.full(); return; }
    let ch = rows(sweep, sweep + 1, 0, N); sweep = (sweep + 1) % N;
    if (focus) { const L = G.Space.TILE; const cx = Math.floor(focus.X / L), cy = Math.floor(focus.Z / L); const R = 40; const y = cy - R + row; row = (row + 4) % (R * 2); if (rows(y, y + 4, cx - R, cx + R)) ch = true; }
    if (ch) map.needsUpdate = true;
  };
  // (for the verifier: of n tiles round a point, how many the picture paints otherwise than the world is now — a few may
  // lag a moment behind, the rows are made again a few a frame; fbad: the same for the floor — the leaves where the trees
  // are, nothing loose on a road, a house or the water)
  G3.check = function (fx, fy, R, n) {
    if (!data || size !== N) return { n: 0, bad: 0, fbad: 0 }; let bad = 0, fbad = 0, k = 0; const x0 = Math.floor(fx), y0 = Math.floor(fy);
    for (let q = 0; q < n; q++) { const x = x0 + Math.floor((G.hash(q * 7 + 1) - 0.5) * 2 * R), y = y0 + Math.floor((G.hash(q * 13 + 5) - 0.5) * 2 * R); if (!W.inb(x, y)) continue; k++;
      const i = y * N + x; paint(i, x, y, px); const o = i * 4; if (data[o] !== px[0] || data[o + 1] !== px[1] || data[o + 2] !== px[2] || data[o + 3] !== px[3]) bad++;
      if (fdata) { floorOf(i, x, y, fx4); if (fdata[o] !== fx4[0] || fdata[o + 1] !== fx4[1] || fdata[o + 2] !== fx4[2]) fbad++; } }
    return { n: k, bad, fbad };
  };
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
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.magFilter = THREE.LinearFilter; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.generateMipmaps = true; tx.anisotropy = 4; tx.needsUpdate = true;
    return tx;
  }

  // ------------------------------ the land's material ------------------------------
  const U = { uMap: { value: null }, uDet: { value: null }, uFMap: { value: null }, uN: { value: 128 }, uTL: { value: 4 }, uCN: { value: null }, uCO: { value: null }, uCC: { value: 0 }, uCS: { value: 0 }, uTime: { value: 0 }, uSeaY: { value: 3 }, uSkyH: { value: null } };
  const FRAG = `
uniform sampler2D uMap; uniform sampler2D uDet; uniform sampler2D uFMap; uniform float uN; uniform float uTL; uniform sampler2D uCN; uniform vec2 uCO; uniform float uCC; uniform float uCS; uniform float uTime; uniform float uSeaY; uniform vec3 uSkyH;
// (the light of the waves on a bed under the water: a net of bright lines that drifts and folds)
float gCaus(vec2 p, float t) {
  vec2 q = p * 0.55; float c = 0.0;
  for (int i = 0; i < 3; i++) { float fi = float(i); q += vec2(sin(q.y * 1.3 + t * (0.6 + fi * 0.2) + fi), cos(q.x * 1.1 - t * (0.5 + fi * 0.15) - fi)) * 0.55; c += abs(sin(q.x * 1.6 + q.y * 0.4)); }
  return pow(clamp(1.0 - c / 3.0, 0.0, 1.0), 3.0) * 2.4;
}
float gBed(vec4 t) { float k = floor(t.a * 255.0 + 0.5); return k == 15.0 || k == 19.0 ? 1.0 : 0.0; }
// (how rough each kind of ground is to the light: stone and gravel most, the snow and the sand least)
float gRough(vec4 t) { float k = floor(t.a * 255.0 + 0.5); return (k == 4.0 || k == 10.0 || k == 16.0) ? 1.0 : (k == 9.0 || k == 13.0 || k == 14.0) ? 0.7 : (k == 2.0 || k == 3.0 || k == 5.0 || k == 15.0 || k == 19.0) ? 0.3 : 0.5; }
vec2 gBumpV = vec2(0.0);
float gHgt = 0.0; // (the height of the stuff of the ground at this point, in metres: the light reads its slopes)
varying vec3 vGP; varying vec3 vGN;
float gHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 gShade(vec4 t, vec4 d, float m1, float m2) {
  vec3 c = t.rgb; float k = floor(t.a * 255.0 + 0.5);
  c *= 1.0 + (m1 - 0.5) * 0.34;
#ifdef GDETAIL
  if (k < 1.5 || k == 17.0 || (k > 5.5 && k < 8.5)) {
    // (the grass: blades light and dark, darker clumps, patches gone yellow in the sun)
    c *= 1.0 + (d.r - 0.5) * (k == 7.0 ? 0.7 : 0.6);
    c *= 1.0 - smoothstep(0.5, 0.75, d.b) * 0.16;
    c = mix(c, c * vec3(1.14, 1.06, 0.66), smoothstep(0.58, 0.8, m2) * (k == 6.0 ? 0.0 : 0.45));
    if (k == 6.0) c = mix(c, vec3(0.022, 0.05, 0.05), smoothstep(0.56, 0.62, m2) * 0.85);
  } else if (k == 2.0 || k == 15.0 || k == 19.0) { c *= 1.0 + (d.g - 0.5) * 0.36 + (d.b - 0.5) * 0.1;
  } else if (k == 3.0) { c *= 1.0 + (d.g - 0.5) * 0.14 + 0.07 * sin(vGP.x * 1.9 + vGP.z * 0.7 + d.g * 2.0);
  } else if (k == 4.0) { c *= 0.75 + d.b * 0.6;
  } else if (k == 5.0) { c *= 1.0 + (d.a - 0.5) * 0.2; c *= mix(vec3(0.84, 0.9, 1.04), vec3(1.0), smoothstep(0.25, 0.7, m1)); c += step(0.97, d.a) * 0.5; // (the snow: drifts, blue in its hollows, glints)
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
float gLay(float k) {
  if (k == 2.0 || k == 3.0 || k == 15.0 || k == 18.0) return M3_SAND;
  if (k == 4.0) return M3_STONY;
  if (k == 16.0) return M3_ROCK;
  if (k == 5.0) return M3_SNOW;
  if (k == 9.0) return M3_TRAIL;
  if (k == 10.0) return M3_GRAVEL;
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
  if (L == M3_PEBBLES) return M3S_PEBBLES; if (L == M3_STONY) return M3S_STONY; if (L == M3_TRAIL) return M3S_TRAIL; return 0.25;
}
// (how high the stuff of each picture stands, in metres, for the light: rock and cobbles most, sand and snow least)
float gAmp(float L) {
  if (L == M3_ROCK) return 0.1; if (L == M3_COBBLE || L == M3_SLAB || L == M3_STONY) return 0.05; if (L == M3_GRAVEL || L == M3_PEBBLES) return 0.045; if (L == M3_MUD || L == M3_TRAIL) return 0.02;
  if (L == M3_SAND || L == M3_SNOW) return 0.025; return 0.035;
}
// (the open green land: where the trees drop their leaves, and the bare earth shows here and there)
float gGrassy(float k) { return (k < 1.5 || k == 6.0 || k == 7.0 || k == 8.0 || k == 17.0) ? 1.0 : 0.0; }
// (what each kind shows over many metres, on its own colour: patches gone yellow in the sun, the swamp's pools, the blue
// hollows of the snow, the furrows of a field, the dark of the sand the water wets)
vec3 gTint(vec3 c, float k, float mP) {
  if (k < 1.5 || k == 7.0 || k == 17.0) c = mix(c, c * vec3(1.12, 1.05, 0.68), smoothstep(0.56, 0.74, mP) * 0.34);
  else if (k == 6.0) c = mix(c, vec3(0.03, 0.05, 0.045), smoothstep(0.6, 0.66, mP) * 0.8);
  else if (k == 5.0) c *= mix(vec3(0.88, 0.92, 1.03), vec3(1.0), smoothstep(0.32, 0.6, mP));
  else if (k == 14.0) { float r = abs(fract(vGP.z) - 0.5) * 2.0; c *= 0.74 + 0.26 * (1.0 - smoothstep(0.35, 0.9, r)); }
  else if (k == 18.0) c *= 0.72;
  return c;
}
// (a stuff laid over the land in its own colour — the leaves under the trees, bare earth, mud: the picture's own colour, as
// bright as the god's colour there (times k), with a little of its hue)
vec3 gOwn(vec3 m, vec3 c, float k) { float lc = dot(c, vec3(0.3, 0.59, 0.11)), lm = dot(m, vec3(0.3, 0.59, 0.11)); return mix(m * (lc / max(lm, 1e-4)), c, 0.18) * k; }
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
  gAdd(gLay(k00), c00, w00); gAdd(gLay(k10), c10, w10); gAdd(gLay(k01), c01, w01); gAdd(gLay(k11), c11, w11);
  vec3 cAll = c00 * w00 + c10 * w10 + c01 * w01 + c11 * w11;
  float g00 = gGrassy(k00) * w00, g10 = gGrassy(k10) * w10, g01 = gGrassy(k01) * w01, g11 = gGrassy(k11) * w11;
  // (snow lying on any ground, where the god's view paints it white — and over it, no leaves, no bare earth)
  float snowy = smoothstep(0.6, 0.8, min(cAll.r, min(cAll.g, cAll.b)));
  float gs = (g00 + g10 + g01 + g11) * (1.0 - snowy * 0.9);
  if (gs > 0.01) {
    vec3 cg = (c00 * g00 + c10 * g10 + c01 * g01 + c11 * g11) / (g00 + g10 + g01 + g11);
    // (under the trees: their fallen leaves over the moss, darker than the grass — the needles, in the taiga)
    float tg = (k00 == 17.0 ? g00 : 0.0) + (k10 == 17.0 ? g10 : 0.0) + (k01 == 17.0 ? g01 : 0.0) + (k11 == 17.0 ? g11 : 0.0);
    gAdd(M3_FOREST, gOwn(GM_FOREST, cg, 0.62), fm.r * (gs - tg) * 2.2);
    gAdd(M3_NEEDLES, gOwn(GM_NEEDLES, cg, 0.6), fm.r * tg * 2.2);
    // (here and there the earth shows, worn bare)
    gAdd(M3_DIRT, gOwn(GM_DIRT, cg, 0.72), smoothstep(0.66, 0.86, mB) * 0.85 * gs);
    // (down a bank to the water, and in the pools of a swamp, mud)
    float sw = (k00 == 6.0 ? g00 : 0.0) + (k10 == 6.0 ? g10 : 0.0) + (k01 == 6.0 ? g01 : 0.0) + (k11 == 6.0 ? g11 : 0.0);
    gAdd(M3_MUD, gOwn(GM_MUD, cg, 0.5), fm.b * gs * 0.8 + smoothstep(0.55, 0.65, mP) * sw * 1.4);
  }
  gAdd(M3_SNOW, cAll, snowy * 2.2);
  // (a steep face is bare rock, whatever the tiles say)
  gAdd(M3_ROCK, gRockish(cAll), gStp * 2.0);
  // the heights decide where each stuff shows: the higher stands out of the lower
  vec4 T[GMX]; float mx = -9.0;
  for (int i = 0; i < GMX; i++) { if (i >= gN) break; T[i] = gTex(gL[i]); mx = max(mx, T[i].a + gW[i] * 2.0); }
  vec3 col = vec3(0.0); float sum = 0.0, hg = 0.0;
  for (int i = 0; i < GMX; i++) { if (i >= gN) break; float b = max(T[i].a + gW[i] * 2.0 - mx + 0.24, 0.0); col += gC[i] / gW[i] * m3col(T[i]) * b; hg += T[i].a * gAmp(gL[i]) * b; sum += b; }
  gHgt = hg / max(sum, 1e-4);
  return col / max(sum, 1e-4);
}
#endif
vec3 groundCol() {
  vec2 u = vGP.xz / uTL - 0.5; vec2 i0 = floor(u); vec2 f = u - i0;
  ivec2 a = ivec2(i0); ivec2 hi = ivec2(int(uN) - 1);
#ifdef GDETAIL
  vec4 d = texture2D(uDet, vGP.xz / 1.7); float m1 = texture2D(uDet, vGP.xz / 37.0).r; float m2 = texture2D(uDet, vGP.xz / 9.0).g; float m3 = texture2D(uDet, vGP.xz / 91.0 + 0.4).g;
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
  vec3 c; float mB = 0.5; vec4 fm = vec4(0.0); float near = 1.0; // (near: how near the water — the floor's wet bank — the wash of the waves reaches only there)
#ifdef GDETAIL
  if (tex > 0.5) {
    // (soft noises of the land, over ten, fifteen and forty metres: where the earth shows bare, which copy of a picture
    // shows, where the meadow has gone yellow, where a swamp pools)
    mB = texture2D(uCN, vGP.xz / 140.0 + 0.13).g; float mT = texture2D(uCN, vGP.xz / 61.0 + 0.61).r; float mP = texture2D(uCN, vGP.xz / 170.0 + 0.41).r;
    gP = vGP.xz; gP2 = mat2(0.454, -0.891, 0.891, 0.454) * vGP.xz * 0.41 + vec2(0.37, 0.71);
    gWX = smoothstep(0.3, 0.7, abs(vGN.x) / (abs(vGN.x) + abs(vGN.z) + 1e-4));
    gAT = mT; gStp = steep;
    fm = texture2D(uFMap, vGP.xz / (uTL * uN)); near = smoothstep(0.08, 0.6, fm.b);
    c = gStack(t00, t10, t01, t11, s, mP, mB, fm);
  } else
#endif
  c = mix(mix(gShade(t00, d, m1, m2), gShade(t10, d, m1, m2), s.x), mix(gShade(t01, d, m1, m2), gShade(t11, d, m1, m2), s.x), s.y);
#ifdef GDETAIL
  // (the land a little warmer here, a little cooler there, over a hundred metres: no two fields the same green)
  c *= mix(vec3(1.05, 1.0, 0.9), vec3(0.93, 1.0, 1.07), m3);
  if (tex < 0.5) {
  // (snow that fell on any ground: drifts, blue in the hollows, a glint now and then — not a flat white)
  float snowy = smoothstep(0.62, 0.8, min(c.r, min(c.g, c.b)));
  c = mix(c, c * mix(vec3(0.82, 0.89, 1.04), vec3(1.0), smoothstep(0.25, 0.7, m1)) * (1.0 + (d.a - 0.5) * 0.22) + step(0.975, d.a) * 0.35, snowy);
  // (the grain lit by the sun: the little slopes of the pebbles, the tufts, the ridges of the sand)
  { float e = 0.02; vec4 dx = texture2D(uDet, vGP.xz / 1.7 + vec2(e, 0.0)), dz = texture2D(uDet, vGP.xz / 1.7 + vec2(0.0, e));
    float h0 = d.b * 0.6 + d.r * 0.4, hx = dx.b * 0.6 + dx.r * 0.4, hz = dz.b * 0.6 + dz.r * 0.4;
    float rough = mix(mix(gRough(t00), gRough(t10), s.x), mix(gRough(t01), gRough(t11), s.x), s.y) * (1.0 - snowy * 0.6) * (1.0 - smoothstep(25.0, 70.0, length(cameraPosition - vGP)));
    gBumpV = vec2(hx - h0, hz - h0) / e * 0.012 * rough; }
  } else gHgt *= 1.0 - smoothstep(25.0, 75.0, length(cameraPosition - vGP)); // (the relief of the stuff fades far off, where it would only shimmer)
#endif
  // (the kerb where a street meets the rest)
  float r = mix(mix(gRoad(t00), gRoad(t10), s.x), mix(gRoad(t01), gRoad(t11), s.x), s.y);
  c *= 1.0 - (1.0 - abs(r * 2.0 - 1.0)) * mix(0.32, 0.16, tex) * hard;
  // (the shadows of the clouds sliding over the land, as the god sees them pass)
#ifdef GDETAIL
  vec2 cu = vGP.xz / 520.0 + uCO; float cn = texture2D(uCN, cu).r * 0.68 + texture2D(uCN, cu * 3.1 + 0.37).g * 0.32;
  c *= 1.0 - smoothstep(0.98 - uCC, 1.18 - uCC, cn) * uCS;
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
  }
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
      sh.vertexShader = 'varying vec3 vGP; varying vec3 vGN;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vGP = (modelMatrix * vec4(transformed, 1.0)).xyz; vGN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + G3.texGLSL() + gMeans() + FRAG).replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( groundCol(), opacity );')
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
  G3.quality = function () { if (!mat) return; const q = G.Realm.Q(); const want = q.detail !== 0; const has = !!(mat.defines && mat.defines.GDETAIL); if (want !== has) { mat.defines = want ? { GDETAIL: 1 } : {}; mat.needsUpdate = true; } };
  G3.material = () => mat;
  // (the clouds over the land: their offset as the wind carries them, how much of the sky they cover, how dark their shadow)
  G3.clouds = function (ox, oz, cover, k) { if (!U.uCO.value) U.uCO.value = new THREE.Vector2(); U.uCN.value = G3.cloudNoise(); U.uCO.value.set(ox, oz); U.uCC.value = cover; U.uCS.value = k; };
  // a soft noise for the clouds (R: the big shapes, G: the small; tiling) — made once
  let cloudTx = null;
  G3.cloudNoise = function () {
    if (cloudTx) return cloudTx; const S = 128; const out = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = y * S + x; out[i * 4] = fbmS(S, x, y, 4, 5, 21) * 255; out[i * 4 + 1] = fbmS(S, x, y, 16, 3, 33) * 255; out[i * 4 + 2] = 128; out[i * 4 + 3] = 255; }
    cloudTx = new THREE.DataTexture(out, S, S, THREE.RGBAFormat, THREE.UnsignedByteType);
    cloudTx.wrapS = cloudTx.wrapT = THREE.RepeatWrapping; cloudTx.magFilter = THREE.LinearFilter; cloudTx.minFilter = THREE.LinearMipmapLinearFilter; cloudTx.generateMipmaps = true; cloudTx.needsUpdate = true;
    return cloudTx;
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
    texArr.wrapS = texArr.wrapT = THREE.RepeatWrapping; texArr.magFilter = THREE.LinearFilter; texArr.minFilter = THREE.LinearMipmapLinearFilter; texArr.generateMipmaps = true; texArr.anisotropy = 4; texArr.needsUpdate = true;
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
vec2 m3slope(float L, vec2 uv, float h0) { float e = 0.006; return vec2(texture(uTex3, vec3(uv + vec2(e, 0.0), L)).a - h0, texture(uTex3, vec3(uv + vec2(0.0, e), L)).a - h0) / e; }
`;
  };
})(window.G);
