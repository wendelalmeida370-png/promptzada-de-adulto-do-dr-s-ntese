'use strict';
// ============================================================
//  Geo3D: the relief in the round (Modo Encarnado; NATUREZA.md
//  §4 21b, D-490 to D-499) — from the rock the G.Geo says each
//  place is made of:
//   · the faces of cliff carved in their layers — benches and
//     risers, the cornice of a hard band, the face broken — in the
//     tiles no one walks, meeting the world's ground to the
//     centimetre at every edge of a tile someone stands on;
//   · the stones of the world (S.rocks, the very faces the feet
//     stand on: G.Space.stones) and the formations on the faces —
//     blocks, columns, boulders, arches — by instancing, in the
//     bands of their rock, with the moss of the wet lands (the
//     forest's G.Mata) and the snow of the cold;
//   · the mouths of the caves cut into the hill;
//   · the land beyond the edge, where the map's own land runs
//     toward it (D-467): its shore and hills, and the ranges with
//     their snow and glaciers kilometres out.
//  Only seen: nothing here touches the world (the guard's 168).
//  The chunks, the frame and the scene stay in realm3d.js and
//  call here.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const G3D = G.Geo3D = { stats: { carved: 0, tris: 0, inst: 0, hor: 0, mouths: 0 } };
  const TAU = Math.PI * 2;
  let THREE = null, R3 = null; const MAT = {};

  // ------------------------------ the qualities ------------------------------
  // (each pillar adds its fields to the presets from its own file — R3.qualAdd, never the table, D-466): geoCarve, the faces of cliff
  // carved in steps a tile, in the chunks within geoCarveR metres of the body (half beyond it; 0 none: the Leve keeps the world's ramp);
  // geoForm, how far the formations and the stones' kit are drawn (m; the stones of the world always are); geoFar, the step of the
  // far picture's grid in tiles where the relief is rough (the silhouette of the ranges: the plain land keeps its 2); geoHor, the land
  // beyond the edge — 0 none, 1 the far ranges coarse, 2 the near land and the ranges, 3 finer
  G3D.qual = function () {
    if (!G.Realm || !G.Realm.qualAdd) return; const qa = G.Realm.qualAdd;
    qa('geoCarve', { baixa: 0, media: 4, alta: 8, ultra: 8 });
    qa('geoCarveR', { baixa: 0, media: 70, alta: 130, ultra: 220 });
    qa('geoForm', { baixa: 0, media: 110, alta: 240, ultra: 400 });
    qa('geoFar', { baixa: 2, media: 1, alta: 1, ultra: 0.5 });
    qa('geoHor', { baixa: 1, media: 2, alta: 2, ultra: 3 });
  };
  G3D.qual();
  const Q = () => (G.Realm && G.Realm.Q ? G.Realm.Q() : {});
  const Ge = () => G.Geo;

  // ------------------------------ the carving of the faces ------------------------------
  // (how finely a chunk's faces are carved: the preset's steps within its reach of the body by the chunk's nearest edge, half of them
  // beyond; nothing on the Leve — asked by the chunk's signature, so the chunk is made again when it changes. Only seen)
  const lodOf = new Map(); G.worldHooks.push(() => { lodOf.clear(); });
  G3D.lod = function (x0, y0, n) {
    const q = Q(); const k = q.geoCarve | 0; if (!k || !Ge()) return 0;
    const f = G.Possess && G.Possess.body ? G.Possess.body() : null; if (!f) return k;
    const L = G.Space.TILE, X = f.x * L, Z = f.y * L; const D = q.geoCarveR || 0; const key = x0 + ',' + y0;
    const d = Math.hypot(Math.max(x0 * L - X, 0, X - (x0 + n) * L), Math.max(y0 * L - Z, 0, Z - (y0 + n) * L));
    const was = lodOf.get(key); const fine = was === k ? d < D + 10 : d < D; const v = fine ? k : Math.max(2, k >> 1); lodOf.set(key, v); return v;
  };
  // (whether the formations of a chunk are drawn: within the preset's reach of the body by the chunk's nearest edge — once drawn, until the
  // body is 12 m further; with no body, all of them)
  const formOf = new Map(); G.worldHooks.push(() => { formOf.clear(); });
  G3D.formsOn = function (x0, y0, n) {
    const q = Q(); const R = q.geoForm || 0; if (R <= 0) return 0; const f = G.Possess && G.Possess.body ? G.Possess.body() : null; if (!f) return 1;
    const L = G.Space.TILE, X = f.x * L, Z = f.y * L; const key = x0 + ',' + y0; const d = Math.hypot(Math.max(x0 * L - X, 0, X - (x0 + n) * L), Math.max(y0 * L - Z, 0, Z - (y0 + n) * L));
    const on = formOf.get(key) ? d < R + 12 : d < R; formOf.set(key, on); return on ? 1 : 0;
  };
  // (what the carving of a chunk is made of, as a number: the carved tiles and the mouths in it, and its steps — for the chunk's signature)
  G3D.sig = function (x0, y0, n) {
    if (!Ge()) return 0; const S = G.S; let s = G3D.farStep(x0, y0, n) * 7 + 1, cl = 0;
    for (let y = Math.max(0, y0 - 2); y < Math.min(N, y0 + n + 2); y++) for (let x = Math.max(0, x0 - 2); x < Math.min(N, x0 + n + 2); x++) { const i = y * N + x; if (S.cliff[i]) { cl = 1; s = (s * 31 + (Ge().carves(i) ? 3 : 1) + i) | 0; } }
    if (cl) s = (s * 13 + G3D.lod(x0, y0, n)) | 0; // (the steps only where there is a face to carve: no chunk of plain land made again as the body walks)
    let st = 0; for (let y = y0; y < Math.min(N, y0 + n) && !st; y++) for (let x = x0; x < Math.min(N, x0 + n); x++) { const o = S.objAt[y * N + x]; if (o && S.rocks.get(o)) { st = 1; break; } }
    if (cl || st) s = (s * 5 + G3D.formsOn(x0, y0, n)) | 0; // (the formations and the stones' kit within reach)
    if (G.Caves && S.ug) for (const cv of G.Caves.all()) for (const m of cv.mouths) if (m.x >= x0 - 2 && m.y >= y0 - 2 && m.x < x0 + n + 2 && m.y < y0 + n + 2) s = (s * 17 + m.x * 3 + m.y * 7 + 1) | 0;
    return s;
  };
  // (the tiles of a chunk whose ground the carving draws: the land's own picture leaves them out — 1 a tile)
  G3D.skipOf = function (x0, y0, n) {
    const k = G3D.lod(x0, y0, n); if (!k) return null; const out = new Uint8Array(n * n); let any = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const X = x0 + x, Y = y0 + y; if (W.inb(X, Y) && Ge().carves(Y * N + X)) { out[y * n + x] = 1; any = 1; } }
    return any ? out : null;
  };
  // a point of a carved face (tiles in, metres out): the world's ramp moved by the G.Geo's carving; on the edge of the chunk the carving
  // is read at the half tiles only and drawn straight between them — the chunk beside it, carved as finely or not, meets it there
  const CV = [0, 0, 0];
  function carvedAt(x, y, x0, y0, n, out) {
    const TL = G.Space.TILE, HM = G.Space.HM; const g = Ge();
    const onX = x <= x0 + 1e-9 || x >= x0 + n - 1e-9, onY = y <= y0 + 1e-9 || y >= y0 + n - 1e-9;
    if ((onX || onY) && !(onX && onY)) {
      const u = onX ? y : x; const a = Math.floor(u * 2) / 2, b = a + 0.5, f = (u - a) * 2;
      const A = onX ? g.cliffAt(x, a, [0, 0, 0]) : g.cliffAt(a, y, [0, 0, 0]), B = onX ? g.cliffAt(x, b, [0, 0, 0]) : g.cliffAt(b, y, [0, 0, 0]);
      CV[0] = A[0] + (B[0] - A[0]) * f; CV[1] = A[1] + (B[1] - A[1]) * f; CV[2] = A[2] + (B[2] - A[2]) * f;
    } else g.cliffAt(x, y, CV);
    out[0] = x * TL + CV[1]; out[1] = W.hAt(x, y) * HM + CV[0]; out[2] = y * TL + CV[2]; out[3] = CV[0];
    return out;
  }
  // the carved faces of a chunk, one geometry for the land's material (the land's shader paints them: the bands, the joints, the moss) —
  // and the holes the mouths of the caves cut in them
  G3D.carveGeo = function (x0, y0, n, holes) {
    const k = G3D.lod(x0, y0, n); if (!k || !THREE) return null; const g = Ge(); return g.batch(() => carveGeoIn(x0, y0, n, holes, k, g));
  };
  function carveGeoIn(x0, y0, n, holes, k, g) {
    const P = [], NR = [], C = [], I = []; let tiles = 0; const p = [0, 0, 0, 0];
    const M = k + 3; const gp = new Float32Array(M * M * 4); const seen = new Map(); // (each point of the chunk's grid made once: the tiles side by side share their edges and rings)
    for (let ty = y0; ty < Math.min(N, y0 + n); ty++) for (let tx = x0; tx < Math.min(N, x0 + n); tx++) {
      if (!g.carves(ty * N + tx)) continue; tiles++;
      // (the points of the tile and a ring round it, for the slopes of the light)
      for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) { const gx = tx * k + i - 1, gy = ty * k + j - 1; const key = gy * 65536 + gx; let q = seen.get(key);
        if (!q) { q = carvedAt(G.clamp(gx / k, 0, N), G.clamp(gy / k, 0, N), x0, y0, n, [0, 0, 0, 0]); seen.set(key, q); }
        const o = (j * M + i) * 4; gp[o] = q[0]; gp[o + 1] = q[1]; gp[o + 2] = q[2]; gp[o + 3] = q[3]; }
      const base = P.length / 3;
      for (let j = 1; j <= k + 1; j++) for (let i = 1; i <= k + 1; i++) {
        const o = (j * M + i) * 4; P.push(gp[o], gp[o + 1], gp[o + 2]);
        const l = (j * M + i - 1) * 4, r = (j * M + i + 1) * 4, u = ((j - 1) * M + i) * 4, d = ((j + 1) * M + i) * 4;
        const ax = gp[r] - gp[l], ay = gp[r + 1] - gp[l + 1], az = gp[r + 2] - gp[l + 2], bx = gp[d] - gp[u], by = gp[d + 1] - gp[u + 1], bz = gp[d + 2] - gp[u + 2];
        const nx = by * az - bz * ay, ny = bz * ax - bx * az, nz = bx * ay - by * ax; const nl = Math.hypot(nx, ny, nz) || 1; // (b × a: up on a slope, out and down under a cornice)
        NR.push(nx / nl, ny / nl, nz / nl);
        // (the shade of a recess: the sky reaches less into the back of a bench)
        const sh = G.clamp(1 + gp[o + 3] * 0.16, 0.66, 1.04); C.push(sh * sh, sh * sh, sh * sh);
      }
      for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
        const a = base + j * (k + 1) + i, b = a + 1, c = a + k + 1, d = c + 1;
        // (a mouth's hole: the cells whose middle is inside its arch)
        if (holes && holes.length) { const cx = (P[a * 3] + P[d * 3]) / 2, cy = (P[a * 3 + 1] + P[d * 3 + 1]) / 2, cz = (P[a * 3 + 2] + P[d * 3 + 2]) / 2; if (holes.some(hl => inArch(hl, cx, cy, cz))) continue; }
        I.push(a, c, b, b, c, d);
      }
    }
    if (!tiles) return null;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(NR, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); geo.setIndex(I); geo.computeBoundingSphere();
    geo.userData.tiles = tiles; return geo;
  }

  // ------------------------------ the mouths of the caves ------------------------------
  // (a mouth cut into the hill: its arch in the plane across the way in, and whether a point is inside it — the hole in the carved face)
  function inArch(m, X, Y, Z) {
    const c = Math.cos(m.yaw), s = Math.sin(m.yaw); const dx = X - m.X, dz = Z - m.Z; const along = dx * c + dz * s, across = -dx * s + dz * c;
    if (along < -0.4 || along > m.deep + 0.5) return false; const u = across / (m.w * 0.5), v = (Y - m.Y) / m.h; return v > -0.2 && u * u + v * v < 1;
  }
  // (the mouths in a chunk, with their arches)
  function mouthsIn(x0, y0, n) {
    const out = []; const S = G.S; if (!G.Caves || !S.ug) return out;
    for (const cv of G.Caves.all()) for (const m of cv.mouths) {
      if (m.kind === 'mina' || m.x < x0 || m.y < y0 || m.x >= x0 + n || m.y >= y0 + n) continue;
      const kind = G.Caves.mouthKind ? G.Caves.mouthKind(m, cv) : m.kind; if (kind === 'poco' || kind === 'poço' || kind === 'dolina') continue;
      out.push(Ge().mouthOf(m, kind));
    }
    return out;
  }
  G3D.mouthsIn = mouthsIn;
  // (the throat of a mouth: the arch's rim running into the hill, its rock going dark as it goes in — and the dark at its end; a
  // geometry of the chunk's, in the vertex colours of the rock)
  function throatInto(P, C, m) {
    const g = Ge(); const R = g.ROCKS[m.rock] || g.ROCKS[0]; const col = R.col.map(v => Math.pow(v / 255, 2.2));
    const c = Math.cos(m.yaw), s = Math.sin(m.yaw); const K = 12, D = m.carve ? 6 : 2; const deep = m.carve ? m.deep : 0.9;
    // (cut into a face of cliff the throat runs in; on a slope one walks, only its lip and the dark a step inside it — the hill is not cut)
    const at = (a, t) => { const r = 1 - t * 0.35; const across = Math.cos(a) * m.w * 0.5 * r, up = Math.max(0, Math.sin(a)) * m.h * r; const along = -0.6 + t * (deep + 0.6); return [m.X + along * c - across * s, m.Y + up - t * (m.carve ? 0.6 : 0.1), m.Z + along * s + across * c]; };
    for (let d = 0; d < D; d++) for (let q = 0; q < K; q++) {
      const a0 = q / K * Math.PI, a1 = (q + 1) / K * Math.PI, t0 = d / D, t1 = (d + 1) / D;
      const v = [at(a0, t0), at(a1, t0), at(a1, t1), at(a0, t1)]; const k0 = Math.pow(1 - t0, 2.2) * 0.55, k1 = Math.pow(1 - t1, 2.2) * 0.55;
      for (const [vi, kk] of [[0, k0], [2, k1], [1, k0], [0, k0], [3, k1], [2, k1]]) { P.push(...v[vi]); C.push(col[0] * kk, col[1] * kk, col[2] * kk); }
    }
    // (the dark at its end)
    const e = [m.X + deep * c, m.Y - (m.carve ? 0.6 : 0.1), m.Z + deep * s]; const r = m.carve ? 0.65 : 1;
    for (let q = 0; q < K; q++) { const a0 = q / K * Math.PI, a1 = (q + 1) / K * Math.PI; const p0 = [e[0] - Math.cos(a0) * m.w * 0.5 * r * s, e[1] + Math.sin(a0) * m.h * r, e[2] + Math.cos(a0) * m.w * 0.5 * r * c], p1 = [e[0] - Math.cos(a1) * m.w * 0.5 * r * s, e[1] + Math.sin(a1) * m.h * r, e[2] + Math.cos(a1) * m.w * 0.5 * r * c];
      P.push(...e, ...p1, ...p0); for (let k = 0; k < 3; k++) C.push(0.003, 0.003, 0.004); }
  }

  // ------------------------------ the kit of rock: the shapes, made once ------------------------------
  // (each a little irregular, its facets broken by the G.hash of its vertex — the same every time; faceted, as broken stone is; three
  // variants of most, so no two neighbours are one stone)
  let KIT = null;
  function jitter(geo, amt, sd, keepBase) {
    const p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k); const h = G.hash(Math.round(x * 97) * 7919 + Math.round(y * 89) * 104729 + Math.round(z * 83) * 31 + sd);
      const f = 1 + (h - 0.5) * amt; p.setXYZ(k, x * f, keepBase && y <= 1e-4 ? y : y * (1 + (G.hash(k * 13 + sd) - 0.5) * amt * 0.5), z * f); }
    const g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals(); return g;
  }
  function kit() {
    if (KIT) return KIT; KIT = {};
    KIT.bloco = [0, 1, 2].map(v => { const g = new THREE.BoxGeometry(1, 1, 1, 2, 1, 2); g.translate(0, 0.5, 0); return jitter(g, 0.32, 11 + v * 7); });
    KIT.pilar = [0, 1].map(v => { const g = new THREE.CylinderGeometry(0.47, 0.52, 1, 6, 3); g.translate(0, 0.5, 0); return jitter(g, 0.12, 31 + v * 5, true); });
    // (the hoodoo: a column waisted under a wider cap)
    KIT.toco = [0].map(v => { const g = new THREE.LatheGeometry([[0.5, 0], [0.42, 0.25], [0.32, 0.6], [0.36, 0.8], [0.62, 0.86], [0.55, 0.97], [0.1, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 7); return jitter(g, 0.14, 41, true); });
    KIT.matacao = [0, 1, 2].map(v => jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.34, 61 + v * 3));
    // (an arch: a span of rock along X from one foot to the other, its crown at the top — its section a rough slab)
    KIT.arco = [0].map(() => { const pts = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; pts.push(new THREE.Vector3(-Math.cos(a) * 0.5, Math.sin(a) * 0.92, 0)); }
      const path = new THREE.CatmullRomCurve3(pts); const g = new THREE.TubeGeometry(path, 14, 0.12, 5, false); return jitter(g, 0.18, 71); });
    // (a stone of the world: the dodecahedron the feet stand on — the Space's own, G.Space.stones)
    KIT.pedra = [new THREE.DodecahedronGeometry(0.5, 0)]; KIT.pedra[0].computeVertexNormals(); // (three's polyhedra come unindexed: faceted)
    return KIT;
  }
  G3D.kit = () => (THREE ? kit() : null);

  // ------------------------------ the material of the rock ------------------------------
  // (the pieces' own: lit as everything is (Lambert, the light's patch), the stone's picture from the three sides, the bands of its rock at
  // the height of its layers (aGeo.x the rock, aGeo.w the fold where it stands), the moss of the wet lands on its top and its shaded side
  // (aGeo.y), the snow of the cold on its top (aGeo.z), the colour of the instance its tint)
  function rockMat() {
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const U = G.Ground3D.U3(); const stm = { value: G.Ground3D.strataMap ? G.Ground3D.strataMap() : null };
    m.onBeforeCompile = sh => {
      stm.value = G.Ground3D.strataMap ? G.Ground3D.strataMap() : stm.value;
      Object.assign(sh.uniforms, U, { uStrata: stm, uCN: { value: G.Ground3D.cloudNoise() } });
      const R = Ge().ROCKS; const n = R.length;
      sh.vertexShader = 'attribute vec4 aGeo; varying vec4 vGeo; varying vec3 vRP; varying vec3 vRN;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vGeo = aGeo; vec4 rq = modelMatrix * instanceMatrix * vec4(transformed, 1.0); vRP = rq.xyz; vRN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);`);
      sh.fragmentShader = `varying vec4 vGeo; varying vec3 vRP; varying vec3 vRN; uniform sampler2D uStrata; uniform sampler2D uCN; float rHgt = 0.0;
        const float RSTL[${n}] = float[${n}](${R.map(r => r.L.toFixed(1)).join(', ')});
        ` + sh.fragmentShader.replace('#include <common>', '#include <common>\n' + G.Ground3D.texGLSL() + `
        #ifdef M3_CRAG
        #define RROCK M3_CRAG
        #define RROCK_S M3S_CRAG
        #else
        #define RROCK M3_ROCK
        #define RROCK_S M3S_ROCK
        #endif
        #ifdef M3_MOSS
        #define RMOSS M3_MOSS
        #define RMOSS_S M3S_MOSS
        #else
        #define RMOSS M3_GRASS
        #define RMOSS_S M3S_GRASS
        #endif`).replace('#include <color_fragment>', `#include <color_fragment>
        {
          vec3 n = normalize(vRN); int rk = int(clamp(vGeo.x, 0.0, ${n - 1}.0)); float sL = vRP.y + vGeo.w;
          float aa = smoothstep(0.25, 1.1, fwidth(sL) * 1.4);
          vec4 b = texture2D(uStrata, vec2(sL / RSTL[rk], (float(rk) + 0.5) / ${n}.0));
          vec3 bc = mix(b.rgb, vec3(dot(b.rgb, vec3(0.33))), aa * 0.4);
          float fine = 1.0 - smoothstep(60.0, 120.0, length(vViewPosition));
          vec3 w = pow(abs(n), vec3(4.0)); w /= w.x + w.y + w.z + 1e-4;
          vec4 r = vec4(0.5);
          if (uTexOn > 0.5) r = m3raw(RROCK, vRP.zy * RROCK_S * 1.4) * w.x + m3raw(RROCK, vRP.xz * RROCK_S * 1.4 + 0.31) * w.y + m3raw(RROCK, vRP.xy * RROCK_S * 1.4 + 0.57) * w.z;
          vec3 rc = diffuseColor.rgb * bc * mix(vec3(1.0), m3col(r), fine * uTexOn) * (0.86 + 0.14 * b.a);
          // (each facet its own tone, as a stone broken along its planes)
          { vec3 fn = normalize(cross(dFdx(vRP), dFdy(vRP))); float fh = fract(sin(dot(floor(fn * 3.0 + 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453); rc *= 0.88 + fh * 0.22; }
          float top = smoothstep(0.2, 0.85, n.y);
          float mz = vGeo.y * (top * 0.9 + smoothstep(0.0, 0.6, -n.z) * 0.5) * smoothstep(0.36, 0.62, texture2D(uCN, vRP.xz / 5.0 + vRP.y * 0.07).g + (vGeo.y - 0.5) * 0.4);
          vec4 mt = uTexOn > 0.5 ? m3raw(RMOSS, vRP.xz * RMOSS_S * 1.5) : vec4(0.5);
          rc = mix(rc, vec3(0.055, 0.095, 0.032) * mix(vec3(1.0), m3col(mt), fine * uTexOn) * 1.15, clamp(mz, 0.0, 0.9));
          float sn = vGeo.z * smoothstep(0.35, 0.75, n.y + (texture2D(uCN, vRP.xz / 3.0).r - 0.5) * 0.3);
          rc = mix(rc, vec3(0.78, 0.835, 0.9), clamp(sn, 0.0, 1.0));
          rHgt = (r.a * 0.07 * (1.0 - mz) + mt.a * 0.015 * mz) * fine * uTexOn;
          diffuseColor.rgb = rc;
        }`).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 dpx = dFdx(vRP), dpy = dFdy(vRP); float hx = dFdx(rHgt), hy = dFdy(rHgt); vec3 nw = normalize(vRN); vec3 r1 = cross(dpy, nw), r2 = cross(nw, dpx); float det = dot(dpx, r1); vec3 gr = sign(det) * (hx * r1 + hy * r2); normal = normalize((viewMatrix * vec4(normalize(abs(det) * nw - gr), 0.0)).xyz); }`);
      m.userData.shader = sh;
    };
    return m;
  }

  // ------------------------------ the pieces of the near chunks, by instancing ------------------------------
  // (every stone and formation of the near chunks in one instanced mesh a shape — a few calls for the whole ring round the body: each chunk
  // keeps its own list, given when its picture is made and taken back when its picture is thrown away)
  const PIECES = new Map(); // (chunk key → its pieces)
  let IM = null, imDirty = false;
  const STRIDE = 20; // (a piece: the matrix's 16, then the rock, the moss, the snow, the fold)
  function meshes() {
    if (IM) return IM; IM = {}; const K = kit(); MAT.rock = MAT.rock || rockMat();
    for (const k in K) K[k].forEach((geo, v) => { const m = new THREE.InstancedMesh(geo, MAT.rock, 16); m.count = 0; m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; m.name = 'geo:' + k + v; m.matrixAutoUpdate = false; m.visible = false; IM[k + v] = m; R3.scene().add(m); });
    return IM;
  }
  // (all the pieces into the instanced meshes again: when a chunk's list comes or goes)
  function fill() {
    if (!IM) return; imDirty = false; const by = {}; let total = 0;
    for (const list of PIECES.values()) for (const p of list) (by[p.shape] = by[p.shape] || []).push(p);
    for (const key in IM) {
      const L = by[key] || []; let m = IM[key];
      if (L.length > m.instanceMatrix.count) { const cap = Math.ceil(L.length * 1.5) + 8; const nm = new THREE.InstancedMesh(m.geometry, m.material, cap); nm.frustumCulled = false; nm.castShadow = true; nm.receiveShadow = true; nm.name = m.name; nm.matrixAutoUpdate = false; R3.scene().remove(m); m.dispose && m.dispose(); R3.scene().add(nm); IM[key] = m = nm; }
      if (!m.geometry.attributes.aGeo || m.geometry.attributes.aGeo.count < m.instanceMatrix.count) m.geometry.setAttribute('aGeo', new THREE.InstancedBufferAttribute(new Float32Array(m.instanceMatrix.count * 4), 4));
      const A = m.instanceMatrix.array, B = m.geometry.attributes.aGeo.array;
      for (let k = 0; k < L.length; k++) { const p = L[k]; A.set(p.m, k * 16); B[k * 4] = p.rock; B[k * 4 + 1] = p.moss; B[k * 4 + 2] = p.snow; B[k * 4 + 3] = p.fold; m.setColorAt(k, CO.setRGB(p.c[0], p.c[1], p.c[2])); }
      m.count = L.length; m.visible = L.length > 0; m.instanceMatrix.needsUpdate = true; m.geometry.attributes.aGeo.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; total += L.length;
    }
    G3D.stats.inst = total;
  }
  let CO = null, M4 = null, QT = null, V3 = null, E3 = null, S3 = null;
  // (a piece: its shape, its matrix — at (X, Y, Z), turned yaw about the vertical, sized sx, sy, sz —, its rock, moss, snow and fold)
  function piece(list, shape, X, Y, Z, yaw, sx, sy, sz, rock, i, tilt) {
    const g = Ge(); E3.set(tilt ? tilt[0] : 0, -yaw, tilt ? tilt[1] : 0, 'YXZ'); QT.setFromEuler(E3); M4.compose(V3.set(X, Y, Z), QT, S3.set(sx, sy, sz));
    const S = G.S; let moss = 0; if (G.Mata && G.Mata.floor && i >= 0) { const f = G.Mata.floor(i); moss = G.clamp((f.umid - 0.4) * 1.8, 0, 1) * 0.9 + f.musgo * 0.4; }
    const snow = i >= 0 && G.Ground3D ? G.clamp(G.Ground3D.snowAt(i) * 1.4, 0, 1) : 0; if (snow > 0.3) moss *= 0.3;
    const tint = 0.9 + G.hash(Math.round(X * 7) * 31 + Math.round(Z * 7)) * 0.2;
    list.push({ shape, m: Array.from(M4.elements), rock, moss: G.clamp(moss, 0, 1), snow, fold: g.fold(X / G.Space.TILE, Z / G.Space.TILE), c: [tint, tint * (0.98 + G.hash(rock * 7) * 0.04), tint] });
  }
  // the pieces of a chunk: the stones of the world (always — the feet stand on them) and, within the preset's reach of the body, the
  // formations of its faces and the stones round each mouth's lip
  function piecesOf(x0, y0, n) {
    const S = G.S; const g = Ge(); const list = []; const TL = G.Space.TILE, HM = G.Space.HM; kit();
    for (let y = y0; y < Math.min(N, y0 + n); y++) for (let x = x0; x < Math.min(N, x0 + n); x++) {
      const i = y * N + x; const o = S.objAt[i]; const r = o && S.rocks.get(o); if (!r) continue;
      // (the shape is the Space's: the feet stand on these very faces — the meteor's black stone kept black)
      const rock = r.meteor ? 4 : g.rockAt(i); for (const st of G.Space.stones(r)) { piece(list, 'pedra0', st.X, st.Y, st.Z, st.ry, st.sx, st.sy, st.sz, rock, i); if (r.meteor) list[list.length - 1].c = [0.42, 0.32, 0.3]; }
    }
    if (G3D.formsOn(x0, y0, n)) {
      // (the stones broken off each boulder lying round its foot, sunk in the ground — never on a road)
      for (let y = y0; y < Math.min(N, y0 + n); y++) for (let x = x0; x < Math.min(N, x0 + n); x++) {
        const i = y * N + x; const o = S.objAt[i]; const r = o && S.rocks.get(o); if (!r) continue; const big = G.Space.stones(r)[0]; const rock = r.meteor ? 4 : g.rockAt(i);
        for (let k = 0; k < 5; k++) { const a = G.hash(o * 7 + k) * TAU, dd = big.sx * (0.55 + G.hash(o * 11 + k) * 0.5), sz = 0.08 + G.hash(o * 13 + k) * 0.12; const px = big.X + Math.cos(a) * dd, pz = big.Z + Math.sin(a) * dd;
          if (!W.inb(px / TL, pz / TL) || S.road[W.idx(px / TL, pz / TL)]) continue; piece(list, 'pedra0', px, G.Space.floorY(px, pz) - sz * 0.3, pz, a * 3, sz * 1.3, sz * 0.8, sz, rock, i); }
      }
      for (const fm of g.forms(Math.floor(x0 / g.R), Math.floor(y0 / g.R))) {
        if (fm.x < x0 || fm.y < y0 || fm.x >= x0 + n || fm.y >= y0 + n) continue; const v = G.hash(fm.i * 3 + 1);
        if (fm.kind === 'bloco') piece(list, 'bloco' + (Math.floor(v * 3) % 3), fm.X, fm.Y, fm.Z, fm.yaw + Math.PI / 2, fm.sx, fm.sy, fm.sz, fm.rock, fm.i);
        else if (fm.kind === 'pilar') piece(list, fm.rock === 4 ? 'pilar' + (Math.floor(v * 2) % 2) : 'toco0', fm.X, fm.Y, fm.Z, fm.yaw, fm.sx, fm.sy, fm.sz, fm.rock, fm.i);
        else if (fm.kind === 'matacao') piece(list, 'matacao' + (Math.floor(v * 3) % 3), fm.X, fm.Y, fm.Z, fm.yaw, fm.sx, fm.sy, fm.sz, fm.rock, fm.i);
        else if (fm.kind === 'arco') piece(list, 'arco0', fm.X, fm.Y, fm.Z, fm.yaw, fm.sx, fm.sy, fm.sz * 4, fm.rock, fm.i);
      }
      // (the lip of each mouth: blocks round its arch, set into the hill)
      for (const m of mouthsIn(x0, y0, n)) {
        const c = Math.cos(m.yaw), s = Math.sin(m.yaw);
        for (let j = 0; j < 7; j++) { const a = j / 6 * Math.PI; const across = Math.cos(a) * m.w * 0.56, up = Math.sin(a) * m.h * 0.98; const X = m.X - 0.35 * c - across * s, Z = m.Z - 0.35 * s + across * c;
          const gy = W.hAt(X / TL, Z / TL) * HM; const sz = 0.75 + G.hash(j * 3 + m.X) * 0.5; const Y = j === 0 || j === 6 ? gy - sz * 0.3 : Math.max(m.Y + up - sz * 0.45, gy - sz * 0.3);
          piece(list, 'bloco' + (j % 3), X, Y, Z, m.yaw + Math.PI / 2 + (G.hash(j + m.Z) - 0.5) * 0.6, sz * 1.1, sz * 0.8, sz * 0.9, m.rock, W.idx(G.clamp(X / TL, 0, N - 1), G.clamp(Z / TL, 0, N - 1))); }
        // (the lintel: a slab of the hard layer over the arch)
        piece(list, 'bloco1', m.X - 0.5 * c, m.Y + m.h * 0.92, m.Z - 0.5 * s, m.yaw + Math.PI / 2, m.w * 1.2, 0.55, 1.3, m.rock, W.idx(m.X / TL, m.Z / TL));
      }
    }
    return list;
  }
  G3D.piecesOf = (x0, y0, n) => (THREE ? (kit(), piecesOf(x0, y0, n)) : []);
  // (what the pieces of a chunk are made of — its stones and their sizes, the formations' reach — for the part's signature)
  G3D.pieceSig = function (x0, y0, n) {
    const S = G.S; let s = 3; for (let y = y0; y < Math.min(N, y0 + n); y++) for (let x = x0; x < Math.min(N, x0 + n); x++) { const o = S.objAt[y * N + x]; const r = o && S.rocks.get(o); if (r) s = (s * 31 + o + G.Space.stoneSize(r)) | 0; }
    return s;
  };
  // the part of a near chunk the relief draws (realm3d's makePart 'geo'): its pieces into the instanced meshes, and the throats of its
  // mouths; a token geometry in the part's group gives them back when the part is thrown away (its geometry disposed)
  G3D.partInto = function (grp, x0, y0, n) {
    if (!THREE) return; meshes(); const key = y0 * 4096 + x0;
    PIECES.set(key, piecesOf(x0, y0, n)); fill();
    const tok = new THREE.BufferGeometry(); tok.addEventListener('dispose', () => { if (PIECES.get(key) && tok.userData.live) { PIECES.delete(key); fill(); } }); tok.userData.live = true;
    const tm = new THREE.Mesh(tok, MAT.rock); tm.visible = false; tm.matrixAutoUpdate = false; grp.add(tm);
    // (a newer part of the same chunk replaces this one's list: its token must not take the newer list away)
    const prev = TOK.get(key); if (prev) prev.userData.live = false; TOK.set(key, tok);
    const ms = mouthsIn(x0, y0, n); G3D.stats.mouths = ms.length;
    if (ms.length) { const P = [], C = []; for (const m of ms) throatInto(P, C, m); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); g.computeBoundingSphere();
      const mm = new THREE.Mesh(g, MAT.mouth); mm.matrixAutoUpdate = false; mm.receiveShadow = true; grp.add(mm); }
  };
  const TOK = new Map();
  G.worldHooks.push(() => { PIECES.clear(); TOK.clear(); if (IM) fill(); });

  // ------------------------------ the far picture ------------------------------
  // (the step of a chunk's far grid: the preset's finer one where the relief is rough — a drop of over six metres in a tile somewhere in
  // it —, the plain land's two tiles elsewhere: the ranges keep their silhouette from far)
  G3D.farStep = function (x0, y0, n) {
    const q = Q(); const st = q.geoFar || 2; if (st >= 2) return 2; const S = G.S; const V = N + 1; let mx = 0;
    for (let y = y0; y < Math.min(N, y0 + n); y++) for (let x = x0; x < Math.min(N, x0 + n); x++) { const H = S.H; const a = H[y * V + x], b = H[y * V + x + 1], c = H[(y + 1) * V + x], d = H[(y + 1) * V + x + 1]; const r = Math.max(a, b, c, d) - Math.min(a, b, c, d); if (r > mx) mx = r; }
    const m = mx * G.Space.HM; return m > 9 ? st : m > 4.5 ? Math.max(1, st) : 2;
  };

  // ------------------------------ the land beyond the edge ------------------------------
  // (D-467: only where the map's own land runs toward the edge — G.Geo.beyondH; the island maps have none. Two pictures: the near land,
  // from the edge out to where the eye's far end reaches from anywhere in the map — at its own place, its own depth, so the map's sea and
  // the map's land in front of it hide it as they should —, and the far ranges past it, kilometres out, drawn before the scene as a copy
  // shrunk toward the eye (the same view as the true one: a copy scaled round the eye looks the same, and fits inside the far end). Lit by
  // the light of the hour, in the haze of the sky's own colour toward the horizon — but never all haze: the far ranges are seen as the
  // blue of the distance, paler the farther; their snow and their glaciers by the side's climate. Remade when the map, its ground or the
  // preset changes)
  let HOR = null, horFor = '';
  function horMat(far) {
    const GX = (G.Realm && G.Realm.GX) || {}; const HZ = (G.Realm && G.Realm.GLSL && G.Realm.GLSL.haze) || 'uniform vec3 gxSunW; uniform vec3 gxHor; uniform vec3 gxGlow; uniform vec3 gxBelt; vec3 gxHaze(vec3 d) { return gxHor; }';
    const u = Object.assign({ uSunD: { value: new THREE.Vector3(0, 1, 0) }, uSunC: { value: new THREE.Color(1, 1, 1) }, uSky: { value: new THREE.Color(0.5, 0.6, 0.7) }, uBnc: { value: new THREE.Color(0.1, 0.1, 0.08) },
      uEye: { value: new THREE.Vector3() }, uK: { value: 1 }, uRain: { value: 0 }, uAirK: { value: 0.003 }, uCN: { value: G.Ground3D.cloudNoise() } }, GX);
    return new THREE.ShaderMaterial({ uniforms: u, fog: false, depthWrite: !far, side: THREE.FrontSide,
      vertexShader: `attribute vec4 aHor; varying vec3 vC; varying vec3 vN; varying vec3 vT; varying vec4 vH; uniform vec3 uEye; uniform float uK;
        void main() { vC = color; vN = normal; vH = aHor; vT = position; vec4 p = modelMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * viewMatrix * p; }`,
      fragmentShader: `${HZ}
        varying vec3 vC; varying vec3 vN; varying vec3 vT; varying vec4 vH; uniform vec3 uSunD; uniform vec3 uSunC; uniform vec3 uSky; uniform vec3 uBnc; uniform vec3 uEye; uniform float uRain; uniform float uAirK; uniform sampler2D uCN;
        void main() {
          vec3 n = normalize(vN); vec3 a = vC;
          // (the snow over its line, off the steep faces; the glaciers in the high hollows — a blue-white tongue)
          float sl = vH.x + (texture2D(uCN, vT.xz / 900.0).r - 0.5) * 140.0;
          float sn = smoothstep(sl - 25.0, sl + 25.0, vT.y) * smoothstep(0.42, 0.7, n.y + vH.y * 0.25);
          float gl = smoothstep(sl - 90.0, sl + 10.0, vT.y) * vH.y * smoothstep(0.55, 0.8, n.y);
          a = mix(a, vec3(0.62, 0.74, 0.86), clamp(gl, 0.0, 1.0) * 0.8); a = mix(a, vec3(0.8, 0.84, 0.9), clamp(sn, 0.0, 1.0));
          float nl = dot(n, uSunD); float dl = smoothstep(-0.06, 0.4, nl) * 0.8 + clamp(nl, 0.0, 1.0) * 0.2;
          vec3 c = a * (uSunC * dl + mix(uBnc, uSky, n.y * 0.5 + 0.5)) * 0.3183;
          // (the haze: the sky's own colour toward the horizon, deeper with the distance — the near land as the air has it, the far
          // ranges never all gone: paler the farther; more in the rain)
          vec3 fr = vT - uEye; float d = length(fr);
          float h1 = 1.0 - exp(-d * uAirK * 0.55); float cap = mix(0.62, 0.9, smoothstep(1500.0, 8000.0, d)) + uRain * 0.08;
          float ff = min(h1, cap);
          c = mix(c, gxHaze(normalize(vec3(fr.x, max(fr.y, 0.0) * 0.25, fr.z) / max(d, 1.0))), ff);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`, vertexColors: true });
  }
  // (the albedo of the land beyond a side: the lowland's green or tan by the side's climate, the forest's dark band, the bare rock up the
  // steep and the high)
  const LOWC = [[86, 110, 62], [150, 156, 150], [66, 92, 60], [76, 98, 58], [52, 92, 48], [156, 140, 86], [190, 160, 112]];
  const FORC = [[48, 74, 44], [120, 128, 120], [38, 62, 46], [52, 72, 42], [36, 70, 36], [118, 112, 66], [170, 140, 96]];
  function horGeo(r0, r1, nr, na, sky) {
    const g = Ge(); const L = N * G.Space.TILE, cx = L / 2, cz = L / 2; const sea = G.SEA * G.Space.HM;
    const nv = (nr + 1) * na; const P = new Float32Array(nv * 3), C = new Float32Array(nv * 3), H = new Float32Array(nv * 4); const hh = new Float32Array(nv);
    const lin = v => Math.pow(v / 255, 2.2);
    for (let j = 0; j <= nr; j++) { const r = r0 * Math.pow(r1 / r0, j / nr); for (let k = 0; k < na; k++) { const a = k / na * TAU; const X = cx + Math.cos(a) * r, Z = cz + Math.sin(a) * r; const h = g.beyondH(X, Z); const v = j * na + k; hh[v] = h === -Infinity ? sea - 8 : h; P[v * 3] = X; P[v * 3 + 1] = hh[v]; P[v * 3 + 2] = Z; } }
    const NR = new Float32Array(nv * 3); const I = [];
    for (let j = 0; j <= nr; j++) for (let k = 0; k < na; k++) {
      const v = j * na + k; const vl = j * na + (k + na - 1) % na, vr = j * na + (k + 1) % na, vd = Math.max(0, j - 1) * na + k, vu = Math.min(nr, j + 1) * na + k;
      const ax = P[vr * 3] - P[vl * 3], ay = P[vr * 3 + 1] - P[vl * 3 + 1], az = P[vr * 3 + 2] - P[vl * 3 + 2], bx = P[vu * 3] - P[vd * 3], by = P[vu * 3 + 1] - P[vd * 3 + 1], bz = P[vu * 3 + 2] - P[vd * 3 + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; } const l = Math.hypot(nx, ny, nz) || 1; NR[v * 3] = nx / l; NR[v * 3 + 1] = ny / l; NR[v * 3 + 2] = nz / l;
      const X = P[v * 3], Z = P[v * 3 + 2]; const side = g.sideOf(X, Z); const bi = g.beyondBiome(side); const up = hh[v] - sea; const steep = 1 - G.smooth(0.55, 0.85, ny / l);
      let c = G.lerpColor(LOWC[bi] || LOWC[0], FORC[bi] || FORC[0], G.smooth(25, 90, up) * (1 - G.smooth(260, 420, up)));
      c = G.lerpColor(c, [118, 112, 104], Math.max(steep, G.smooth(300, 520, up)));
      C[v * 3] = lin(c[0]); C[v * 3 + 1] = lin(c[1]); C[v * 3 + 2] = lin(c[2]);
      // (aHor: the snow's line of the side, how hollow the place is — a glacier's bed —, -, -)
      const hol = G.clamp(((hh[vl] + hh[vr] + hh[vd] + hh[vu]) / 4 - hh[v]) / 18, 0, 1);
      H[v * 4] = g.snowLine(side); H[v * 4 + 1] = hol;
    }
    for (let j = 0; j < nr; j++) for (let k = 0; k < na; k++) {
      const a = j * na + k, b = j * na + (k + 1) % na, c = (j + 1) * na + k, d = (j + 1) * na + (k + 1) % na;
      if (Math.max(hh[a], hh[b], hh[c], hh[d]) < sea + 0.4) continue; I.push(a, b, c, b, d, c);
    }
    if (!I.length) return null;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(NR, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('aHor', new THREE.BufferAttribute(H, 4)); geo.setIndex(I); geo.computeBoundingSphere();
    return geo;
  }
  let lightK = null, lightH = null;
  function horLight(mat, cam) {
    const u = mat.uniforms; const sc = R3.scene(); if (!lightK) for (const o of sc.children) { if (o.isDirectionalLight && !lightK) lightK = o; if (o.isHemisphereLight && !lightH) lightH = o; }
    if (lightK) { u.uSunD.value.copy(lightK.position).sub(lightK.target.position).normalize(); u.uSunC.value.copy(lightK.color).multiplyScalar(lightK.intensity); }
    if (lightH) { u.uSky.value.copy(lightH.color).multiplyScalar(lightH.intensity); u.uBnc.value.copy(lightH.groundColor).multiplyScalar(lightH.intensity); }
    u.uRain.value = G.clamp(((G.S.weather && G.S.weather.rain) || 0), 0, 1); u.uAirK.value = R3.GX && R3.GX.gxAir ? R3.GX.gxAir.value.x : 0.003;
  }
  G3D.horizon = function () {
    if (!THREE || !R3 || !R3.scene()) return; const q = Q(); const lv = q.geoHor | 0; const far = G.clamp(2.4 * (q.view || 360), 500, 1600); // (the preset's far end, not the camera's: the rain shortens that one)
    const key = (G.S.seed | 0) + ':' + N + ':' + (G.S.typeVer | 0) + ':' + G.S.mapType + ':' + lv + ':' + Math.round(far / 50);
    if (key === horFor) return HOR; horFor = key;
    if (HOR) { for (const m of [HOR.near, HOR.far]) if (m) { m.geometry.dispose(); R3.scene().remove(m); } HOR = null; }
    G3D.stats.hor = 0; if (!lv || !Ge() || !Ge().beyondAny()) return null;
    const L = N * G.Space.TILE; const half = L / 2;
    // (the near land reaches as far from the middle as the far end of the eye reaches from the map's farthest corner)
    const rA = Math.max(half + 40, far * 0.94 - half * Math.SQRT2), rB = 9000;
    const na = lv >= 3 ? 512 : lv >= 2 ? 360 : 200;
    HOR = {};
    if (lv >= 2 && rA > half + 60) { const g = horGeo(half * 0.98, rA, lv >= 3 ? 40 : 28, na); if (g) { const m = new THREE.Mesh(g, horMat(false)); m.matrixAutoUpdate = false; m.frustumCulled = false; m.name = 'geo:horizonte-perto';
      m.onBeforeRender = (rn, sc, cm) => { horLight(m.material, cm); m.material.uniforms.uEye.value.copy(cm.position); }; R3.scene().add(m); HOR.near = m; G3D.stats.hor += g.index.count / 3; } }
    { const r0 = HOR.near ? rA : half * 0.98; const g = horGeo(r0, rB, lv >= 3 ? 36 : lv >= 2 ? 28 : 18, na); if (g) { const m = new THREE.Mesh(g, horMat(true)); m.matrixAutoUpdate = false; m.frustumCulled = false; m.renderOrder = -0.4; m.name = 'geo:horizonte-longe';
      // (a copy shrunk toward the eye: what it is from where the eye stands, inside the far end of the view)
      m.onBeforeRender = (rn, sc, cm) => { const e = cm.position; const k = Math.min(1, cm.far * 0.9 / (rB + Math.hypot(e.x - half, e.z - half))); m.matrixWorld.makeScale(k, k, k).setPosition(e.x * (1 - k), e.y * (1 - k), e.z * (1 - k)); m.modelViewMatrix.multiplyMatrices(cm.matrixWorldInverse, m.matrixWorld); m.normalMatrix.getNormalMatrix(m.modelViewMatrix);
        horLight(m.material, cm); m.material.uniforms.uEye.value.copy(e); };
      R3.scene().add(m); HOR.far = m; G3D.stats.hor += g.index.count / 3; } }
    return HOR;
  };

  // ------------------------------ starting ------------------------------
  G3D.init = function (three, realm) {
    THREE = three; R3 = realm; CO = new THREE.Color(); M4 = new THREE.Matrix4(); QT = new THREE.Quaternion(); V3 = new THREE.Vector3(); E3 = new THREE.Euler(); S3 = new THREE.Vector3();
    MAT.rock = rockMat(); MAT.mouth = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    G3D.mats = MAT;
  };
  // (for the tests in Node: the builders without a scene — the shapes and the carving are only numbers)
  G3D.node = function (three) { THREE = three; CO = new THREE.Color(); M4 = new THREE.Matrix4(); QT = new THREE.Quaternion(); V3 = new THREE.Vector3(); E3 = new THREE.Euler(); S3 = new THREE.Vector3(); };
  G3D.horGeo = (r0, r1, nr, na) => horGeo(r0, r1, nr, na);

  // ------------------------------ the checks ------------------------------
  // (for the proofs and the photos: what is wrong in the relief's drawing — a carved face not meeting the world's ground at the edge of a
  // tile one walks, a point that is not a number, a piece standing over a tile one walks lower than 2.5 m or out of its tile's column)
  G3D.check = function (x0, y0, n) {
    const out = []; if (!Ge() || !G.S) return out; const S = G.S; const g = Ge(); const o = [0, 0, 0];
    const X0 = x0 === undefined ? 0 : x0, Y0 = y0 === undefined ? 0 : y0, NN = n === undefined ? N : n; let bad = 0, nan = 0;
    for (let y = Y0; y < Math.min(N, Y0 + NN); y++) for (let x = X0; x < Math.min(N, X0 + NN); x++) {
      const i = y * N + x; if (!g.carves(i)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (y + dy) * N + x + dx; if (W.inb(x + dx, y + dy) && g.carves(j)) continue;
        for (let k = 0; k <= 8; k++) { const u = k / 8; const px = dx === 1 ? x + 1 : dx === -1 ? x : x + u, py = dy === 1 ? y + 1 : dy === -1 ? y : y + u; g.cliffAt(px, py, o); if (!Number.isFinite(o[0] + o[1] + o[2])) nan++; else if (Math.abs(o[0]) + Math.abs(o[1]) + Math.abs(o[2]) > 1e-6) bad++; } }
    }
    if (bad) out.push(`relevo: ${bad} ponto(s) da borda de um penhasco entalhado fora do chão do mundo`);
    if (nan) out.push(`relevo: ${nan} ponto(s) do entalhe que não são número`);
    let low = 0; for (const list of PIECES.values()) for (const p of list) { if (!p.m.every(Number.isFinite)) { low++; continue; } }
    if (low) out.push(`relevo: ${low} peça(s) de rocha com matriz inválida`);
    return out;
  };
})(window.G);
