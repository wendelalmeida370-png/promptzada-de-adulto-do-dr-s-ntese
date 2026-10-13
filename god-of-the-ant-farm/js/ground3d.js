'use strict';
// ============================================================
//  Ground3D: the ground of the body's view, painted the way the
//  god's view paints it. Every tile of the map is one texel of a
//  small picture (its colour — the very tileColor of the god's
//  canvas, roads and fields included — and its kind of ground);
//  the land's shader reads the four tiles around each point and
//  blends them softly, so there are no seams of triangles, and
//  lays over each kind the grain the god's view draws with
//  strokes: blades in the meadows, grains of sand, pebbles on
//  stony ground, glints on the snow, puddles in the swamp, the
//  ripples of the dunes, pavers on the paved streets, furrows in
//  the fields, layers of rock on the steep faces. The picture of
//  the tiles is kept up to date around the body, a few rows a
//  frame. Only seen: it reads the world and writes nothing.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const G3 = G.Ground3D = {};
  // the kinds of ground (the alpha of a tile's texel)
  const K = G3.K = { grass: 0, meadow: 1, sand: 2, dune: 3, rocky: 4, snow: 5, swamp: 6, savanna: 7, jungle: 8, path: 9, gravel: 10, paved: 11, highway: 12, burnt: 13, field: 14, bed: 15, rock: 16, taiga: 17, wet: 18 };
  let THREE = null, map = null, data = null, det = null, mat = null, size = 0, dirtyAll = true, row = 0, gmap = null, gdata = null;
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
    if (t <= T.RIVER) k = K.bed;
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
  G3.grassMap = () => gmap;
  G3.map = () => map;
  // a band of rows of the picture made again from the world; true when something changed
  const px = [0, 0, 0, 0], gx = [0, 0, 0, 0];
  function rows(y0, y1, x0, x1) {
    if (!data) return false; let ch = false, gch = false;
    for (let y = Math.max(0, y0); y < Math.min(N, y1); y++) for (let x = Math.max(0, x0); x < Math.min(N, x1); x++) {
      const i = y * N + x; paint(i, x, y, px); const o = i * 4;
      if (data[o] !== px[0] || data[o + 1] !== px[1] || data[o + 2] !== px[2] || data[o + 3] !== px[3]) { data[o] = px[0]; data[o + 1] = px[1]; data[o + 2] = px[2]; data[o + 3] = px[3]; ch = true; }
      grassOf(i, px[3], gx); if (gdata[o] !== gx[0] || gdata[o + 1] !== gx[1] || gdata[o + 2] !== gx[2] || gdata[o + 3] !== gx[3]) { gdata[o] = gx[0]; gdata[o + 1] = gx[1]; gdata[o + 2] = gx[2]; gdata[o + 3] = gx[3]; gch = true; }
    }
    if (gch && gmap) gmap.needsUpdate = true;
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
    }
    rows(0, N, 0, N); map.needsUpdate = true; dirtyAll = false; row = 0;
    U.uMap.value = map; U.uN.value = N;
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
  // lag a moment behind, the rows are made again a few a frame)
  G3.check = function (fx, fy, R, n) {
    if (!data || size !== N) return { n: 0, bad: 0 }; let bad = 0, k = 0; const x0 = Math.floor(fx), y0 = Math.floor(fy);
    for (let q = 0; q < n; q++) { const x = x0 + Math.floor((G.hash(q * 7 + 1) - 0.5) * 2 * R), y = y0 + Math.floor((G.hash(q * 13 + 5) - 0.5) * 2 * R); if (!W.inb(x, y)) continue; k++;
      const i = y * N + x; paint(i, x, y, px); const o = i * 4; if (data[o] !== px[0] || data[o + 1] !== px[1] || data[o + 2] !== px[2] || data[o + 3] !== px[3]) bad++; }
    return { n: k, bad };
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
  const U = { uMap: { value: null }, uDet: { value: null }, uN: { value: 128 }, uTL: { value: 4 }, uCN: { value: null }, uCO: { value: null }, uCC: { value: 0 }, uCS: { value: 0 } };
  const FRAG = `
uniform sampler2D uMap; uniform sampler2D uDet; uniform float uN; uniform float uTL; uniform sampler2D uCN; uniform vec2 uCO; uniform float uCC; uniform float uCS;
varying vec3 vGP; varying vec3 vGN;
float gHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 gShade(vec4 t, vec4 d, float m1, float m2) {
  vec3 c = t.rgb; float k = floor(t.a * 255.0 + 0.5);
  c *= 1.0 + (m1 - 0.5) * 0.22;
#ifdef GDETAIL
  if (k < 1.5 || k == 17.0 || (k > 5.5 && k < 8.5)) {
    c *= 1.0 + (d.r - 0.5) * (k == 7.0 ? 0.55 : 0.45);
    if (k == 6.0) c = mix(c, vec3(0.022, 0.05, 0.05), smoothstep(0.56, 0.62, m2) * 0.85);
  } else if (k == 2.0 || k == 15.0) { c *= 1.0 + (d.g - 0.5) * 0.24;
  } else if (k == 3.0) { c *= 1.0 + (d.g - 0.5) * 0.14 + 0.07 * sin(vGP.x * 1.9 + vGP.z * 0.7 + d.g * 2.0);
  } else if (k == 4.0) { c *= 0.75 + d.b * 0.6;
  } else if (k == 5.0) { c *= 1.0 + (d.a - 0.5) * 0.16; c += step(0.97, d.a) * 0.5;
  } else if (k == 9.0 || k == 10.0) { c *= 1.0 + (d.g - 0.5) * 0.42; c *= mix(1.0, 0.8 + d.b * 0.4, 0.5);
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
vec3 groundCol() {
  vec2 u = vGP.xz / uTL - 0.5; vec2 i0 = floor(u); vec2 f = u - i0;
  ivec2 a = ivec2(i0); ivec2 hi = ivec2(int(uN) - 1);
#ifdef GDETAIL
  vec4 d = texture2D(uDet, vGP.xz / 1.7); float m1 = texture2D(uDet, vGP.xz / 37.0).r; float m2 = texture2D(uDet, vGP.xz / 9.0).g;
#else
  vec4 d = vec4(0.5); float m1 = 0.5; float m2 = 0.5;
#endif
  vec4 t00 = texelFetch(uMap, clamp(a, ivec2(0), hi), 0), t10 = texelFetch(uMap, clamp(a + ivec2(1, 0), ivec2(0), hi), 0);
  vec4 t01 = texelFetch(uMap, clamp(a + ivec2(0, 1), ivec2(0), hi), 0), t11 = texelFetch(uMap, clamp(a + ivec2(1, 1), ivec2(0), hi), 0);
  // (the land melts from one kind into the next with a ragged edge; a street or a field keeps its line)
  float hard = max(max(gHard(t00), gHard(t10)), max(gHard(t01), gHard(t11)));
  float B = mix(0.27, 0.035, hard);
  vec2 s = smoothstep(0.5 - B, 0.5 + B, f + (m2 - 0.5) * 0.4 * (1.0 - hard));
  vec3 c = mix(mix(gShade(t00, d, m1, m2), gShade(t10, d, m1, m2), s.x), mix(gShade(t01, d, m1, m2), gShade(t11, d, m1, m2), s.x), s.y);
  // (the kerb where a street meets the rest)
  float r = mix(mix(gRoad(t00), gRoad(t10), s.x), mix(gRoad(t01), gRoad(t11), s.x), s.y);
  c *= 1.0 - (1.0 - abs(r * 2.0 - 1.0)) * 0.32 * hard;
  // (the shadows of the clouds sliding over the land, as the god sees them pass)
#ifdef GDETAIL
  vec2 cu = vGP.xz / 520.0 + uCO; float cn = texture2D(uCN, cu).r * 0.68 + texture2D(uCN, cu * 3.1 + 0.37).g * 0.32;
  c *= 1.0 - smoothstep(0.98 - uCC, 1.18 - uCC, cn) * uCS;
#endif
  // (a steep face shows its layers of rock, whatever the tiles say)
  float steep = 1.0 - smoothstep(0.55, 0.8, vGN.y);
#ifdef GDETAIL
  c = mix(c, c * (0.84 + 0.16 * sin(vGP.y * 3.6 + d.g * 3.0)) * (0.8 + d.b * 0.4), steep * 0.8);
#endif
  return c;
}
`;
  G3.init = function (three) {
    THREE = three; det = makeDetail(); U.uDet.value = det; U.uTL.value = G.Space.TILE; U.uCO.value = new THREE.Vector2(); U.uCN.value = G3.cloudNoise();
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vGP; varying vec3 vGN;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vGP = (modelMatrix * vec4(transformed, 1.0)).xyz; vGN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + FRAG).replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( groundCol(), opacity );');
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
})(window.G);
