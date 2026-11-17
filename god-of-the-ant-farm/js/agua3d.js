'use strict';
// ============================================================
//  Agua3D: the water of the Modo Encarnado (21c, NATUREZA.md §4;
//  D-505 to D-519) — taken out of the realm3d.js and made anew
//  by layers. The water of each chunk (the sea at its level,
//  every river and lake at its own, the shore and the banks the
//  water runs over, the ice of a sudden winter, the walls of a
//  parted sea), the sea beyond the map, and one material for all:
//  how deep it is read from the bed under it at every point; its
//  colour by its place (G.Agua.look: the tropics, the cold, the
//  mud, the reef, the glacier, the river turbid after the rain);
//  the current the river runs by (G.Agua.field), its ripples and
//  its foam carried down it in two phases; the foam with a cause
//  (the beach, the foot of a fall, a bank, a stone in the
//  current); the sky in its face with its clouds — and, where the
//  quality carries it, the scene in it and under it (the picture
//  of what is behind, read through the screen). The sheet of
//  every fall and every rapid the world has (G.Agua.steps), with
//  its foam at the foot; the rain that wets the land and the
//  roofs (the ground's and the buildings' shaders read its
//  picture: G.Agua3D.wetU). Only seen: G.Agua reads the world,
//  and nothing here writes to it.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const A3 = G.Agua3D = { stats: { sheets: 0, steps: 0, fallTris: 0, waterTris: 0, texMs: 0, sweep: 0, grab: 0 } };
  const TAU = Math.PI * 2;
  let THREE = null, MAT = null, U = null, skyU = null;
  const R3 = () => G.Realm;
  // the quality's share of the water (NATUREZA.md §3.3: each pillar adds its own fields — R3.qualAdd, never the table): aguaRefl,
  // what its face reflects (0 the sky's colour, 1 and its clouds, 2 and the scene through the screen with what is under it bent
  // by the waves, 3 the same, finer); aguaFall, the sheets of the falls (1 plain, 2 with their foam at the foot, 3 finer);
  // aguaSpray, the share of their spray drawn (0 none); aguaWet, the rain that wets the land and the roofs (0 none)
  A3.qual = function () {
    const qa = G.Realm && G.Realm.qualAdd; if (!qa) return;
    qa('aguaRefl', { baixa: 0, media: 1, alta: 2, ultra: 3 });
    qa('aguaFall', { baixa: 1, media: 2, alta: 3, ultra: 3 });
    qa('aguaSpray', { baixa: 0, media: 0.35, alta: 1, ultra: 1.6 });
    qa('aguaWet', { baixa: 0, media: 1, alta: 1, ultra: 1 });
  };
  A3.qual();

  // ------------------------------ the uniforms the water's materials share ------------------------------
  // the bed under it (its height every half tile), the key light on it, the sky's light on it, the colour of the deep, the world's
  // height on the screen (flatter in the descent); the pictures of the field (a texel a tile): the current, the look, the shore
  const WU = { bed: { value: null }, bedN: { value: null }, key: { value: null }, irr: { value: null }, deep: { value: null }, k: { value: 1 },
    flow: { value: null }, look: { value: null }, shore: { value: null }, fN: { value: 0 }, scene: { value: null }, depth: { value: null }, grab: { value: 0 }, proj: { value: null }, nf: { value: null }, scr: { value: null }, ssr: { value: 0 },
    mir: { value: null }, mirMat: { value: null }, mirOn: { value: 0 } };
  A3.WU = WU;
  // (the wet's picture and its strength, for the ground's and the buildings' shaders: R the rain on the land now, G where the rain
  // pools, B the spray of a fall)
  const WET = { uAgWet: { value: null }, uAgN: { value: 0 }, uAgK: { value: 0 }, uAgSky: { value: null } };
  A3.wetU = () => WET;
  // (the colour of the water where nothing says otherwise, sRGB: the shader reads its place's)
  const SHALLOW = [64, 162, 172];
  const DEEP_OUT = [18, 66, 120];

  // ------------------------------ the bed under the water ------------------------------
  // the bed as the 3D draws it — the land's own height, and the beds the Space carves into the rivers — one value every half tile
  // (the near land's own points): the water's shader reads how deep it is at each point from it. Made whole for a new world or a
  // changed land (S.typeVer), and a few rows a frame after that (a river's level changing)
  let bedTex = null, bedData = null, bedFor = null, bedVer = -1, bedRow = 0;
  function bedRows(j0, j1) {
    const n = 2 * N + 1, HM = G.Space.HM, sea = G.SEA * HM, half = THREE.DataUtils.toHalfFloat; let ch = false;
    for (let j = j0; j < j1; j++) for (let i = 0; i < n; i++) { const x = i / 2, y = j / 2; const o = j * n + i; const v = half(W.hAt(x, y) * HM - G.Space.bedDrop(x, y) - sea); if (bedData[o] !== v) { bedData[o] = v; ch = true; } }
    return ch;
  }
  function bedTick() {
    const S = G.S; const n = 2 * N + 1;
    if (!bedTex || bedTex.image.width !== n) {
      if (bedTex) bedTex.dispose(); bedData = new Uint16Array(n * n);
      bedTex = new THREE.DataTexture(bedData, n, n, THREE.RedFormat, THREE.HalfFloatType); bedTex.magFilter = bedTex.minFilter = THREE.LinearFilter; bedTex.generateMipmaps = false; bedTex.flipY = false;
      WU.bed.value = bedTex; WU.bedN.value.set(2 / G.Space.TILE, 1 / n); bedFor = null;
    }
    if (bedFor !== S || bedVer !== S.typeVer) { bedFor = S; bedVer = S.typeVer; bedRows(0, n); bedTex.needsUpdate = true; bedRow = 0; return; }
    const k = Math.min(n, bedRow + 8); if (bedRows(bedRow, k)) bedTex.needsUpdate = true; bedRow = k >= n ? 0 : k;
  }
  // (for the verifier: the bed the water reads, against the land's own height at a few points of the map)
  A3.bedCheck = function (n) {
    if (!bedData || bedFor !== G.S) return { n: 0, bad: 0 }; const m = 2 * N + 1, HM = G.Space.HM; let bad = 0, k = 0;
    for (let q = 0; q < (n || 64); q++) { const i = Math.floor(G.hash(q * 7 + 3) * m), j = Math.floor(G.hash(q * 11 + 5) * m); k++; const want = W.hAt(i / 2, j / 2) * HM - G.Space.bedDrop(i / 2, j / 2) - G.SEA * HM; if (Math.abs(THREE.DataUtils.fromHalfFloat(bedData[j * m + i]) - want) > 0.05 + Math.abs(want) * 0.002) bad++; }
    return { n: k, bad };
  };

  // ------------------------------ the pictures of the field ------------------------------
  // a texel a tile, read smoothly between the tiles' centres: the current (its way, as much as it rules over the wind; its speed;
  // the churn of a fall's foot carried down), the look (the colour of the water there and how clear), the shore (the distance to
  // the land, the way to it, the foam where the current meets a bank or a stone) — made whole when the field is made again (the
  // land changed); the look's turbid rivers, the wet of the land and its puddles swept a band of rows each frame (the rain comes
  // and goes in hours of the world). Land texels take the look of the water beside them: no dark seam where the two meet
  let flowTex = null, lookTex = null, shoreTex = null, wetTex = null, fieldFor = null, sweepY = 0, pzRow = null;
  const mkTex = (data, fmt, type, lin) => { const t = new THREE.DataTexture(data, N, N, fmt, type); t.magFilter = t.minFilter = lin === false ? THREE.NearestFilter : THREE.LinearFilter; t.generateMipmaps = false; t.flipY = false; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true; return t; };
  function makeFieldTex() {
    for (const t of [flowTex, lookTex, shoreTex, wetTex]) if (t) t.dispose();
    flowTex = mkTex(new Uint8Array(N * N * 4), THREE.RGBAFormat, THREE.UnsignedByteType); lookTex = mkTex(new Uint8Array(N * N * 4), THREE.RGBAFormat, THREE.UnsignedByteType);
    shoreTex = mkTex(new Uint16Array(N * N * 4), THREE.RGBAFormat, THREE.HalfFloatType); wetTex = mkTex(new Uint8Array(N * N * 4), THREE.RGBAFormat, THREE.UnsignedByteType);
    WU.flow.value = flowTex; WU.look.value = lookTex; WU.shore.value = shoreTex; WU.fN.value = 1 / (N * G.Space.TILE);
    WET.uAgWet.value = wetTex; WET.uAgN.value = 1 / (N * G.Space.TILE); fieldFor = null;
  }
  function fillField(f) {
    const S = G.S, Ag = G.Agua, half = THREE.DataUtils.toHalfFloat; const F = flowTex.image.data, H = shoreTex.image.data, Wt = wetTex.image.data;
    for (let i = 0; i < N * N; i++) {
      const o = i * 4; const riv = S.type[i] === T.RIVER && !(S.ice && S.ice[i]);
      const sp = riv ? f.sp[i] : 0; const rule = Math.min(1, sp / 0.8); const fo = riv ? Ag.foam(i) : null;
      F[o] = Math.round((f.dx[i] * rule * 0.5 + 0.5) * 255); F[o + 1] = Math.round((f.dz[i] * rule * 0.5 + 0.5) * 255); F[o + 2] = Math.round(G.clamp(sp / 3, 0, 1) * 255); F[o + 3] = fo ? Math.round(fo[0] * 255) : 0;
      H[o] = half(f.dist[i]); H[o + 1] = half(f.cx[i]); H[o + 2] = half(f.cz[i]); H[o + 3] = half(fo ? fo[1] : 0);
      Wt[o + 2] = Math.round(Ag.spray(i) * 255);
    }
    flowTex.needsUpdate = shoreTex.needsUpdate = wetTex.needsUpdate = true;
  }
  // (a band of rows: the look of the water — its place's colour, turbid after the rain —, the wet of the land now, its puddles)
  const lk = [0, 0, 0, 0];
  function lookOf(i, out) { const l = G.Agua.look(i); if (!l) return null; out[0] = l.col[0]; out[1] = l.col[1]; out[2] = l.col[2]; out[3] = G.clamp(l.clar / 1.25, 0, 1) * 255; return out; }
  function sweepRows(y0, y1) {
    const S = G.S, Ag = G.Agua; const L = lookTex.image.data, Wt = wetTex.image.data; const y1c = Math.min(N, y1);
    for (let y = Math.max(0, y0); y < y1c; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, o = i * 4;
      let c = lookOf(i, lk);
      if (!c) { // (land: the look of the water beside it, or the plain water's)
        let n = 0, r = 0, g = 0, b = 0, a = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (S.type[j] > T.RIVER) continue; const q = lookOf(j, lk); if (!q) continue; r += q[0]; g += q[1]; b += q[2]; a += q[3]; n++; }
        if (n) { lk[0] = r / n; lk[1] = g / n; lk[2] = b / n; lk[3] = a / n; } else { lk[0] = SHALLOW[0]; lk[1] = SHALLOW[1]; lk[2] = SHALLOW[2]; lk[3] = 160; } c = lk;
      }
      L[o] = c[0]; L[o + 1] = c[1]; L[o + 2] = c[2]; L[o + 3] = c[3];
      // (the wet now, and where the rain pools in this tile: the most of four points of it)
      Wt[o] = Math.round(Ag.wet(i) * 255);
      // (where the rain pools does not change with the rain: made once a row after the land changed)
      if (!pzRow[y]) Wt[o + 1] = S.type[i] <= T.RIVER ? 0 : Math.round(Math.max(Ag.puddle(x + 0.25, y + 0.25), Ag.puddle(x + 0.75, y + 0.25), Ag.puddle(x + 0.25, y + 0.75), Ag.puddle(x + 0.75, y + 0.75)) * 255);
    }
    for (let y = Math.max(0, y0); y < y1c; y++) pzRow[y] = 1;
    lookTex.needsUpdate = wetTex.needsUpdate = true;
  }
  function fieldTick() {
    const t0 = performance.now();
    if (!flowTex || flowTex.image.width !== N) makeFieldTex();
    const f = G.Agua.field();
    if (fieldFor !== f) { const whole = fieldFor === null || fieldFor.S !== f.S; fieldFor = f; pzRow = new Uint8Array(N); fillField(f); if (whole) { sweepRows(0, N); sweepY = 0; } }
    else { const B = Math.max(1, Math.ceil(N / 96)); sweepRows(sweepY, sweepY + B); sweepY = sweepY + B >= N ? 0 : sweepY + B; A3.stats.sweep++; }
    A3.stats.texMs = A3.stats.texMs * 0.9 + (performance.now() - t0) * 0.1;
  }
  // (for the proofs: the pictures as they stand — the current's, the look's, the shore's, the wet's)
  A3.tex = () => ({ flow: flowTex, look: lookTex, shore: shoreTex, wet: wetTex, bed: bedTex });
  // (for the proofs: all of the pictures made again now, whole)
  A3.fieldNow = function () { if (!THREE) THREE = window.THREE; if (!flowTex || flowTex.image.width !== N) makeFieldTex(); const f = G.Agua.field(); fieldFor = f; pzRow = new Uint8Array(N); fillField(f); sweepRows(0, N); sweepY = 0; };

  // ------------------------------ the light on the water, each frame ------------------------------
  // (the realm's light of the hour hands over the key light and the sky's light on the water; the pictures follow the world)
  A3.light = function (key, keyI, skyIrr, k) {
    if (!THREE) return;
    WU.key.value.setRGB(key[0] * keyI, key[1] * keyI, key[2] * keyI); WU.irr.value.setRGB(skyIrr[0], skyIrr[1], skyIrr[2]); WU.k.value = k;
    bedTick(); fieldTick();
    const q = R3().Q(); WET.uAgK.value = q.aguaWet ? 1 : 0;
  };

  // ------------------------------ the materials ------------------------------
  // the clouds of the sky's dome, read along the reflected ray: the sky's own sheet of clouds over its plane (gxCloud, the drift by
  // the world's clock, the cover: ceu3d.js, 21d) met where the ray from the water reaches it, as the dome meets it from the eye — the
  // water mirrors the sky that is drawn over it
  const CLOUDS = `uniform float uCover; uniform vec3 uCloudCol; uniform vec3 uCloudSh;
float aguaCloud(vec3 d, vec3 from, out float thick) {
  thick = 0.0; if (d.y <= 0.0) return 0.0;
  vec2 cp = from.xz + d.xz * ((gxCl2.x - from.y) / (d.y + 0.06));
  float n = gxCloud(cp);
  thick = smoothstep(0.98 - uCover, 1.5 - uCover, n);
  return smoothstep(0.98 - uCover, 1.18 - uCover, n) * smoothstep(0.0, 0.22, d.y);
}`;
  A3.materials = function (three, mats, u, sky) {
    THREE = three; MAT = mats; U = u; skyU = sky;
    WU.bedN.value = new THREE.Vector2(2 / G.Space.TILE, 1); WU.key.value = new THREE.Color(); WU.irr.value = new THREE.Color(); WU.deep.value = new THREE.Color(0.008, 0.04, 0.075);
    WET.uAgSky = skyU.hor; // (the sky at the horizon, for what shines wet: the same object the sky sets each frame)
    WU.proj.value = new THREE.Vector4(1, 1, 0, 0); WU.mirMat.value = new THREE.Matrix4(); WU.nf.value = new THREE.Vector2(0.1, 1600); WU.scr.value = new THREE.Vector2(1, 1);
    // water: the waves the god's view draws, in light — trains of waves running with the wind (long swells on the open sea, a chop
    // on the rivers, calm against the shore, still in a basin), down a river with its current; and what water is to the eye: how
    // deep it is, read at every point from the bed the 3D draws under it — clear over the sand at the shore, where it thins to
    // nothing on the land wherever the two meet; its place's colour, going dark as it deepens, the sooner in a muddy river; the
    // sky in its face as the angle asks (Fresnel), its clouds too; the key light glittering on the slopes of the waves; the crests
    // lit through; foam where it has a cause. (aShore, a corner's mark: 0 open water, 1 against the land, 2 the still water of a
    // basin, -1 the sea beyond the map; the alpha of its colour: the least it hides of what is under it — a paddy stays water)
    MAT.water = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 1, shininess: 60, specular: 0x1c2228, depthWrite: false });
    MAT.water.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uSky: U.sky, uSkyTop: skyU.top, uKeyDir: skyU.keyDir, uKeyCol: WU.key, uIrr: WU.irr, uDeep: WU.deep, uDet: { value: G.Ground3D.detail() }, uWind: U.wind, uSeaY: { value: G.SEA * G.Space.HM }, uBed: WU.bed, uBedN: WU.bedN, uK: WU.k,
        uFlow: WU.flow, uLook: WU.look, uShoreT: WU.shore, uFN: WU.fN, uCover: skyU.cover, uCloudCol: skyU.cloudCol, uCloudSh: skyU.cloudSh,
        uScene: WU.scene, uDepthT: WU.depth, uGrab: WU.grab, uProjK: WU.proj, uNF: WU.nf, uScr: WU.scr, uSSR: WU.ssr, uMir: WU.mir, uMirMat: WU.mirMat, uMirOn: WU.mirOn });
      sh.vertexShader = 'uniform float uTime; uniform vec3 uWind; uniform float uSeaY; uniform sampler2D uBed; uniform vec2 uBedN; uniform float uK; attribute float aShore; varying float vShore; varying float vSea; varying vec3 vWW;\n' + G.Agua.waveGLSL() + '\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp = modelMatrix * vec4(position, 1.0); float sea = 1.0 - step(0.15, abs(wp.y - uSeaY * uK)); float still = step(1.5, aShore);
        // (the swell dies where the water is shallow: a paddy, a ford, the last of the beach hardly move — G.Agua.waveY, the same sum)
        float dep = aShore < -0.5 ? 9.0 : (wp.y - (texture2D(uBed, (wp.xz * uBedN.x + 0.5) * uBedN.y).r + uSeaY) * uK) / max(uK, 0.3);
        transformed.y += aguaWaveY(wp.xz, uTime, uWind, sea, dep) * (1.0 - still);
        vShore = aShore; vSea = sea; vWW = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
      sh.fragmentShader = 'uniform float uTime; uniform vec3 uSky; uniform vec3 uSkyTop; uniform vec3 uKeyDir; uniform vec3 uKeyCol; uniform vec3 uIrr; uniform vec3 uDeep; uniform sampler2D uDet; uniform vec3 uWind; uniform float uSeaY; uniform sampler2D uBed; uniform vec2 uBedN; uniform float uK; uniform sampler2D uFlow; uniform sampler2D uLook; uniform sampler2D uShoreT; uniform float uFN; varying float vShore; varying float vSea; varying vec3 vWW;\n'
        + 'uniform sampler2D uScene; uniform sampler2D uDepthT; uniform float uGrab; uniform vec4 uProjK; uniform vec2 uNF; uniform vec2 uScr; uniform float uSSR; uniform sampler2D uMir; uniform mat4 uMirMat; uniform float uMirOn;\n#ifdef WSSR\nuniform mat4 projectionMatrix;\n#endif\n' + sh.fragmentShader.replace('#include <lights_pars_begin>', '#include <lights_pars_begin>\n' + CLOUDS)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        // (four trains of waves: their slopes summed, steeper with the wind, flatter on the rivers and against the land, none in a basin)
        vec2 wq = vWW.xz; float isSea = vSea; float still = step(1.5, vShore); float shore = clamp(vShore, 0.0, 1.0);
        vec2 wd = normalize(uWind.xy + vec2(0.001)); float ws = clamp(uWind.z, 0.0, 2.0);
        // (a river runs its own way — G.Agua.field: its waves and its ripples go down it, whatever the wind; the more it runs, the more it rules)
        vec2 fuv = vWW.xz * uFN; vec4 fw = texture2D(uFlow, fuv);
        vec2 fv = (fw.rg - 0.5) * 2.0 * (1.0 - isSea) * (1.0 - still); float fs = length(fv); float fsp = fw.b * 3.0 * (1.0 - isSea) * (1.0 - still);
        if (fs > 0.05) wd = normalize(mix(wd, fv / fs, smoothstep(0.05, 0.45, fs)));
        float calm = mix(0.4, 1.0, isSea) * (1.0 - shore * 0.55) * (0.65 + ws * 0.35) * (1.0 - still * 0.9);
        vec2 gw = vec2(0.0); float hw = 0.0;
        for (int i = 0; i < 4; i++) {
          float fi = float(i); float an = (fi - 1.5) * 0.55 + fi * 0.37; vec2 d = vec2(wd.x * cos(an) - wd.y * sin(an), wd.x * sin(an) + wd.y * cos(an));
          float L = 11.0 / (1.0 + fi * 1.15); float k = 6.2832 / L; float A = 0.05 * L / 6.0;
          float ph = dot(d, wq) * k - uTime * sqrt(9.8 * k) * 0.85 + fi * 1.7; float c = cos(ph);
          hw += A * sin(ph); gw += d * (A * k * c);
        }
        // (the breakers: near the beach the swell comes in square to it — the lines of equal distance to the land, G.Agua.shore —
        // shortening and steepening as the bed rises under it)
        vec4 sht = texture2D(uShoreT, fuv); float dS = sht.r; vec2 cdir = sht.gb; float cl = length(cdir);
        float swl = 0.0;
        if (isSea > 0.5 && cl > 0.3 && dS < 48.0 && vShore > -0.5) {
          vec2 cd = cdir / cl; float kS = 6.2832 / 7.5; float phS = dS * kS + uTime * 1.55 + texture2D(uDet, wq / 40.0).g * 2.0;
          float shoal = (1.0 - smoothstep(14.0, 46.0, dS)) * (0.55 + ws * 0.3);
          swl = shoal; float sc = 0.5 + 0.5 * cos(phS); float slopeS = -sin(phS) * pow(sc, 1.6) * 1.6;
          gw += -cd * slopeS * kS * 0.05 * shoal;
        }
        // (the ripples: on a river carried down its current in two phases half a beat apart — the water runs and never stretches;
        // on the sea and a lake drifting with the wind)
        vec2 dr = wd * 0.07 + vec2(0.012, 0.008);
        #ifdef WCHEAP
        float r1 = 0.0, r2 = 0.0, r3 = 0.0, r4 = 0.0; float ph0 = 0.0, bw = 0.0; vec2 adv = vec2(0.0); // (the lightest quality: the long waves only, no ripples read from the picture)
        #else
        float cyc = 1.7; float ph0 = fract(uTime / cyc), ph1 = fract(uTime / cyc + 0.5); float bw = abs(ph0 * 2.0 - 1.0);
        vec2 adv = (fs > 0.01 ? fv / fs : vec2(0.0)) * fsp * cyc;
        float r1, r2, r3, r4;
        if (fsp > 0.05) {
          vec2 qa = wq - adv * ph0, qb = wq - adv * ph1 + vec2(3.7, 1.3);
          r1 = mix(texture2D(uDet, qa / 6.5).r, texture2D(uDet, qb / 6.5).r, bw); r2 = mix(texture2D(uDet, qa / 3.2).g, texture2D(uDet, qb / 3.2).g, bw);
          r3 = mix(texture2D(uDet, (qa + 0.2) / 6.5).r, texture2D(uDet, (qb + 0.2) / 6.5).r, bw); r4 = mix(texture2D(uDet, (qa + vec2(0.0, 0.2)) / 3.2).g, texture2D(uDet, (qb + vec2(0.0, 0.2)) / 3.2).g, bw);
          r3 = r1 + (r3 - r1) * (1.0 + fsp * 0.4); r4 = r2 + (r4 - r2) * (1.0 + fsp * 0.4); // (a torrent is rougher)
        } else {
          r1 = texture2D(uDet, wq / 11.0 + dr * uTime).r; r2 = texture2D(uDet, wq / 6.5 - dr.yx * uTime * 1.3).r;
          r3 = texture2D(uDet, (wq + 0.2) / 11.0 + dr * uTime).r; r4 = texture2D(uDet, (wq + vec2(0.0, 0.2)) / 6.5 - dr.yx * uTime * 1.3).r;
        }
        #endif
        // (far off the small ripples blur into one sheen: only the long waves are seen, no glitter of noise)
        float wnear = 1.0 - smoothstep(22.0, 130.0, length(cameraPosition - vWW));
        // (still water — a lake, a pool, the slack of a wide river — lies calm in a light wind: a mirror of the shore; the wind roughens it)
        float lakeC = mix(0.28 + ws * 0.4, 1.0, max(isSea, smoothstep(0.05, 0.6, fsp)));
        gw = gw * calm * mix(0.45, 1.0, wnear) * mix(1.0, lakeC, 0.6) + vec2(r3 - r1, r4 - r2) * 0.7 * wnear * (1.0 - still * 0.75) * lakeC;
        vec3 nW = normalize(vec3(-gw.x, 1.0, -gw.y));
        normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);`)
        .replace('#include <opaque_fragment>', `
        // (the water's own key light, as much of it as reaches here — the clouds' shadow, the hills', the canopy: the sky's gxKS)
        vec3 keyC = uKeyCol * gxKS;
        // (how deep it is here: its face over the bed under it)
        vec2 bu = (vWW.xz * uBedN.x + 0.5) * uBedN.y; float b0 = texture2D(uBed, bu).r;
        float wD = vShore < -0.5 ? 40.0 : max(vWW.y - (b0 + uSeaY) * uK, 0.0) / max(uK, 0.3);
        // (how steeply the bed rises here: the surf breaks on a slope, not over a flat that is barely wet)
        float bSl = length(vec2(texture2D(uBed, bu + vec2(uBedN.y, 0.0)).r - b0, texture2D(uBed, bu + vec2(0.0, uBedN.y)).r - b0)) * uBedN.x;
        // (its place's colour — G.Agua.look —, or the colour a basin is given; how clear it is: a muddy river hides its bed in a
        // hand's depth, a clear sea shows its sand at many metres)
        vec4 lk = texture2D(uLook, fuv); float still2 = step(1.5, vShore);
        vec3 tint = mix(pow(lk.rgb, vec3(2.2)), diffuseColor.rgb, still2); float clar = mix(max(lk.a * 1.25, 0.12), 1.0, still2);
        // (its body: the colour of its place, clear over the sand, going to the deep's colour — darker and of its own hue — as it
        // deepens; lit softly by the sky and the key light, as water takes little light on itself; the torches by it a little)
        vec3 deepC = mix(uDeep, tint * 0.16, 0.45);
        vec3 body = mix(tint, deepC, 1.0 - exp(-wD * 0.32 / clar));
        vec3 lit = mix(body * (keyC * clamp(uKeyDir.y, 0.0, 1.0) * 0.55 + uIrr) * 0.3183, outgoingLight * (body / max(diffuseColor.rgb, vec3(0.02))), 0.2);
        // (how much of the bed it hides: nothing where it thins on the sand, all of it in the deep — and never less than its colour asks)
        float a = max(1.0 - exp(-wD * 0.9 / clar), diffuseColor.a);
        // (the sky in its face: the reflected ray's height picks the colour, as the sky's own dome has it — and its clouds)
        vec3 Vw = normalize(cameraPosition - vWW); vec3 Rw = reflect(-Vw, nW); float rel = max(Rw.y, 0.0);
        #ifdef USE_FOG
        vec3 skyR = mix(gxHaze(normalize(vec3(Rw.x, rel, Rw.z))), uSkyTop, pow(rel, 0.42));
        #else
        vec3 skyR = mix(uSky, uSkyTop, pow(rel, 0.42));
        #endif
        float clR = 0.0;
        #ifdef WCLOUD
        { float th; clR = aguaCloud(normalize(vec3(Rw.x, rel, Rw.z)), vWW, th);
          vec3 cc = mix(uCloudCol, uCloudSh, clamp(th * 0.55 + 0.1, 0.0, 1.0)); skyR = mix(skyR, cc, clR * 0.9); }
        #endif
        // (the shallows show the sand and the clear water more than the sky: broken by the swash, their face mirrors less)
        float fr = (0.02 + 0.98 * pow(1.0 - clamp(dot(nW, Vw), 0.0, 1.0), 5.0)) * mix(0.62, 1.0, smoothstep(0.15, 1.6, wD));
        // (where the quality carries it: what stands round the water in its face — the hill, the trees, the houses — found along the
        // reflected ray in the picture of what was drawn before the water; and under it, the bed and what lies there, bent by the
        // waves, read from the same picture; the sky where the ray leaves the picture)
        vec3 under = vec3(0.0); float haveU = 0.0;
        #ifdef WSSR
        if (uGrab > 0.5) {
          vec4 cp = projectionMatrix * viewMatrix * vec4(vWW, 1.0); vec2 suv = cp.xy / cp.w * 0.5 + 0.5;
          float zW = cp.w;
          // (refraction: the screen's point moved by the waves' slope, as deep as it lies; the bed behind the water only — never
          // what stands in front of it)
          vec2 ruv = suv + gw * (0.05 + min(wD, 3.0) * 0.012) * vec2(1.0, uScr.x / uScr.y);
          float zr = texture2D(uDepthT, ruv).r; float lzr = uNF.x * uNF.y / (uNF.y - zr * (uNF.y - uNF.x));
          if (lzr < zW) ruv = suv;
          under = texture2D(uScene, ruv).rgb; haveU = 1.0;
          // (reflection: march the reflected ray across the screen against the picture's depth; the first point it passes behind)
          vec3 vR = (viewMatrix * vec4(Rw, 0.0)).xyz; vec3 vP = (viewMatrix * vec4(vWW, 1.0)).xyz;
          // (the sea at the Ultra: its flat mirror — the scene drawn again from the eye's reflection in the sea's face, all of it, what the
          // screen does not hold too; the waves bend it)
          if (uMirOn > 0.5 && isSea > 0.5 && vShore > -0.5) { vec4 mp = uMirMat * vec4(vWW.x, uSeaY * uK, vWW.z, 1.0); vec2 muv = mp.xy / mp.w + gw * 0.035;
            vec2 me = min(muv, 1.0 - muv); skyR = mix(skyR, texture2D(uMir, muv).rgb, smoothstep(0.0, 0.03, min(me.x, me.y))); }
          else if (rel > 0.002 && vR.z < 0.3) {
            float stp = 0.6 + length(vP) * 0.04; vec3 pr = vP; float hit = 0.0; vec2 huv = vec2(0.0);
            for (int k = 0; k < 24; k++) {
              if (float(k) >= uSSR) break;
              pr += vR * stp; stp *= 1.18;
              vec4 pc = projectionMatrix * vec4(pr, 1.0); vec2 pu = pc.xy / pc.w * 0.5 + 0.5;
              if (pu.x < 0.0 || pu.y < 0.0 || pu.x > 1.0 || pu.y > 1.0 || pr.z > -0.1) break;
              float zs = texture2D(uDepthT, pu).r; float lz = uNF.x * uNF.y / (uNF.y - zs * (uNF.y - uNF.x));
              float dz = -pr.z - lz; if (dz > 0.05 && dz < stp * 2.5 + 1.5) { hit = 1.0; huv = pu; break; }
            }
            if (hit > 0.5) { vec2 ed = min(huv, 1.0 - huv); float fade = smoothstep(0.0, 0.08, min(ed.x, ed.y)); skyR = mix(skyR, texture2D(uScene, huv).rgb, fade * (1.0 - clR * 0.3)); }
          }
        }
        #endif
        // (the key light on the slopes of the waves: a hard glitter and a soft sheen round it — the sun's, or the moon's road — hidden
        // behind the clouds it is mirrored with)
        float rs = max(dot(Rw, uKeyDir), 0.0);
        vec3 col; float al;
        if (haveU > 0.5) {
          // (with the picture behind: the water is the bed seen through it, tinted and dimmed by its body as it deepens — no blend)
          float tr = exp(-wD * 0.9 / clar); vec3 seen = mix(lit, under * mix(vec3(1.0), tint * 1.6, 0.35), tr);
          col = seen * (1.0 - fr) + skyR * fr; al = 1.0;
        } else {
          col = lit * a * (1.0 - fr) + skyR * fr; al = 1.0 - (1.0 - a) * (1.0 - fr);
        }
        col += keyC * (pow(rs, 900.0) * 1.7 + pow(rs, 90.0) * 0.075) * step(0.0, uKeyDir.y) * (1.0 - clR * 0.85);
        // (the crests lit from within where the sun shines through them)
        col += vec3(0.02, 0.09, 0.08) * (smoothstep(-0.02, 0.05, hw) + swl * 0.6) * isSea * clamp(keyC.g * 0.33, 0.0, 1.0) * (1.0 - shore * 0.5) * a;
        // (the flames of the shore in the water at night: the reflected ray, where it rises to the height of the lights, finds them
        // in the painted light of the flames — a road of glitter under each lit door and each torch on the quay)
        #ifndef WCHEAP
        if (gxLMB.w > 0.0 && Rw.y > 0.015) {
          float yl = vWW.y + 1.8;
          for (int i = 0; i < 2; i++) {
            vec2 qx = vWW.xz + Rw.xz * ((yl - vWW.y) / Rw.y); vec2 lu = (qx - gxLMB.xy) * gxLMB.z;
            if (lu.x <= 0.0 || lu.y <= 0.0 || lu.x >= 1.0 || lu.y >= 1.0) break;
            vec4 m2 = texture2D(gxLM2, lu);
            if (i == 0) { yl = max((gxLMY.x + (m2.b - 0.5) * gxLMY.z) * gxLMB.w, vWW.y + 0.3); continue; }
            vec4 m1 = texture2D(gxLM, lu); vec2 off = (m2.rg - 0.5) * gxLMY.z;
            col += m1.rgb * m1.rgb * gxLMY.y * exp(-dot(off, off) * 0.8) * (0.05 + fr * 0.7) * 0.35;
          }
        }
        #endif
        // (foam, each with its cause: a lace of bubbles in a thin band at the water's edge where the sea runs up the land, coming
        // and going; the lines of the breakers rolling in over the slope of the beach; whitecaps on the open sea in a hard wind; the
        // churn at the foot of a fall or a rapid, carried down the river; the streaks where the current runs against a bank or a stone)
        float fn = texture2D(uDet, vWW.xz / 5.0 + uTime * 0.01).g;
        float run = sin(uTime * 0.9 + fn * 4.0 + (vWW.x + vWW.z) * 0.07) * 0.07;
        #ifdef WCHEAP
        float lace = 0.6, laceF = 0.6;
        #else
        float lace = smoothstep(0.38, 0.6, texture2D(uDet, vWW.xz / 1.7 + vec2(uTime * 0.018, -uTime * 0.013) + run * 0.6).b * 0.65 + texture2D(uDet, vWW.xz / 0.9 - uTime * 0.025).r * 0.35);
        // (the river's own lace, carried down it in the same two phases as its ripples — read only where a fall or a bank gives foam)
        float laceF = 0.0;
        if (fw.a + sht.a > 0.004 && isSea < 0.5) { vec2 la = vWW.xz - adv * ph0, lb = vWW.xz - adv * fract(ph0 + 0.5) + vec2(1.9, 0.7);
          laceF = smoothstep(0.36, 0.62, mix(texture2D(uDet, la / 1.5).b * 0.65 + texture2D(uDet, la / 0.8).r * 0.35, texture2D(uDet, lb / 1.5).b * 0.65 + texture2D(uDet, lb / 0.8).r * 0.35, bw)); }
        #endif
        float surf = (isSea + (1.0 - isSea) * shore * 0.45) * (1.0 - still) * step(-0.5, vShore) * smoothstep(0.012, 0.05, bSl);
        float edge = (1.0 - smoothstep(0.02, 0.11, wD + (fn - 0.5) * 0.06 + run * 0.5)) * smoothstep(0.0, 0.02, wD);
        float bp = fract(uTime * 0.11 + fn * 0.25 - dS * 0.012); float bdep = mix(0.42, 0.06, bp);
        float brk = (1.0 - smoothstep(0.0, 0.06 + bp * 0.05, abs(wD - bdep))) * (1.0 - bp * 0.8) * smoothstep(0.03, 0.08, bSl) * isSea;
        float foam = (edge * (0.55 + 0.45 * lace) + brk * lace * 0.75) * surf;
        foam = max(foam, smoothstep(0.06, 0.1, hw + (fn - 0.5) * 0.05) * smoothstep(0.9, 1.6, ws) * isSea * 0.7 * (0.5 + 0.5 * lace));
        float churn = fw.a * (1.0 - isSea) * (1.0 - still), bank = sht.a * (1.0 - isSea) * (1.0 - still);
        foam = max(foam, smoothstep(0.25, 0.85, laceF * 0.7 + churn * 0.75) * churn * 0.95);
        foam = max(foam, laceF * bank * 0.75 * smoothstep(0.0, 0.6, wD));
        col = mix(col, vec3(0.9, 0.94, 0.96) * (keyC * clamp(uKeyDir.y, 0.0, 1.0) * 0.6 + uIrr) * 0.3183, clamp(foam, 0.0, 0.88)); al = max(al, foam * 0.9);
        // (and where it thins to nothing it is gone — no sheen of a film of water over the sand, no flicker where the two meet; the
        // line wandering half a metre over the ground, as a wet edge does, not ruled along the slope of a bank)
        #ifdef WCHEAP
        float wE = wD;
        #else
        float wE = wD + (texture2D(uDet, vWW.xz / 2.7).g - 0.5) * min(0.14, bSl) * (1.0 - smoothstep(0.05, 0.2, wD));
        #endif
        float fade = smoothstep(0.0, 0.04, wE) * step(-0.5, vShore) + step(vShore, -0.5);
        if (haveU > 0.5) col = mix(under, col, fade); else al *= fade;
        outgoingLight = col / max(al, 0.001); diffuseColor.a = al;
        #include <opaque_fragment>`);
    };
    MAT.ice = new THREE.MeshPhongMaterial({ color: 0xdcecf6, shininess: 70, specular: 0x5a6672, transparent: true, opacity: 0.92 });
    // (the ice shows the sky in its face, more as one looks along it — as the water does, duller)
    MAT.ice.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uSkyTop: skyU.top });
      sh.vertexShader = 'varying vec3 vIW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vIW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform vec3 uSkyTop; varying vec3 vIW;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
        #ifdef USE_FOG
        { vec3 Vw = normalize(cameraPosition - vIW); vec3 Rw = reflect(-Vw, vec3(0.0, 1.0, 0.0)); float fr = 0.04 + 0.55 * pow(1.0 - clamp(Vw.y, 0.0, 1.0), 5.0);
          outgoingLight = mix(outgoingLight, mix(gxHaze(normalize(vec3(Rw.x, max(Rw.y, 0.0), Rw.z))), uSkyTop, pow(max(Rw.y, 0.0), 0.42)), fr); }
        #endif
        #include <opaque_fragment>`);
    };
    MAT.wallWater = new THREE.MeshPhongMaterial({ color: 0x3f9cbc, transparent: true, opacity: 0.6, shininess: 100, side: THREE.DoubleSide, depthWrite: false });
    // the sheet of a fall: aerated water pouring over the lip — streaks running down it faster as it falls, whiter as it breaks up
    // on its way, thin and clear at its lip, its edges fraying against the rock; at its foot an apron of foam boiling on the pool,
    // thinning as it spreads; frozen still in a sudden winter. Lit as everything is (the sun through it, the sky on it). aF: across
    // (0..1), along (0 the lip .. 1 the foot), its length (m), the kind (0 the sheet, 1 the apron, 2 frozen); aQ: its width (m),
    // the drop (m), the speed coming over (m/s), the discharge (0..1)
    MAT.fall = new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, shininess: 40, specular: 0x30383e });
    MAT.fall.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: U.time, uDet: { value: G.Ground3D.detail() } });
      sh.vertexShader = 'uniform float uTime; attribute vec4 aF; attribute vec4 aQ; varying vec4 vF; varying vec4 vQ; varying vec3 vFW;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        // (the sheet trembles as it pours; the apron and the ice lie still)
        transformed += objectNormal * sin(uTime * 6.3 + aF.x * 9.0 + aF.y * 5.0) * 0.025 * aF.y * step(aF.w, 0.5);
        vF = aF; vQ = aQ; vFW = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
      sh.fragmentShader = 'uniform float uTime; uniform sampler2D uDet; varying vec4 vF; varying vec4 vQ; varying vec3 vFW; vec3 gFallGlow = vec3(0.0);\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += gFallGlow * gxAmb.x;').replace('#include <color_fragment>', `#include <color_fragment>
        {
          float u = vF.x, v = vF.y, len = vF.z, kind = vF.w; float wid = vQ.x, drop = vQ.y, spd = vQ.z;
          float side = smoothstep(0.0, 0.09, u) * smoothstep(1.0, 0.91, u);
          vec3 c; float a;
          if (kind < 0.5) {
            // (the streaks: the picture's noise stretched down the sheet, sliding as fast as the water falls there)
            float fallV = 1.1 + spd * 0.35 + sqrt(max(drop, 0.1)) * 0.9;
            vec2 su = vec2(u * wid / 0.8, v * len / 2.6 - uTime * fallV);
            float n1 = texture2D(uDet, vec2(su.x, su.y * 0.22)).r, n2 = texture2D(uDet, vec2(su.x * 2.3 + 0.31, su.y * 0.55 - uTime * 0.4)).g;
            // (the heavier columns of water and the thinner veils between them, across the sheet; the streaks running down each)
            float col = smoothstep(0.25, 0.75, texture2D(uDet, vec2(u * wid / 3.2 + 0.17, 0.31)).b);
            float streak = smoothstep(0.38, 0.78, n1 * 0.6 + n2 * 0.4);
            // (a rapid is white water from its lip — the river broken over the stones; a tall fall pours clear from its lip and breaks as it falls)
            float aer = max(smoothstep(0.0, 0.7, v) * clamp(drop / 2.5, 0.45, 1.0) + smoothstep(0.7, 1.0, v) * 0.4, (1.0 - smoothstep(0.8, 1.6, drop)) * 0.7);
            // (aerated water is white: the light scattered in its bubbles — only the clear tongue at the lip shows the water's own colour)
            c = mix(diffuseColor.rgb * 0.9, vec3(0.94, 0.97, 0.99), clamp(0.3 + streak * 0.45 + aer * 0.75 + col * 0.15, 0.0, 1.0));
            a = clamp(0.5 + aer * 0.38 + streak * 0.22 + col * 0.12 - (1.0 - col) * 0.12 * (1.0 - aer), 0.0, 0.96) * side * smoothstep(-0.12, 0.04, v);
            gFallGlow = c * (0.1 + aer * 0.14) * a;
          } else if (kind < 1.5) {
            // (the apron: foam boiling out from where the sheet strikes, fading as it spreads)
            float r = v;
            float n = texture2D(uDet, vFW.xz / 1.5 + vec2(uTime * 0.05, -uTime * 0.32)).b * 0.6 + texture2D(uDet, vFW.xz / 0.7 - vec2(uTime * 0.21, uTime * 0.07)).r * 0.4;
            float f = smoothstep(0.32, 0.62, n * 0.8 + (1.0 - r) * 0.45) * pow(1.0 - r, 1.4);
            c = vec3(0.92, 0.95, 0.97); a = clamp(f, 0.0, 0.95) * side;
          } else {
            // (frozen: the fall held in ice, its streaks set in it)
            float n1 = texture2D(uDet, vec2(u * wid / 0.4, v * len / 6.0)).r;
            c = mix(vec3(0.74, 0.86, 0.94), vec3(0.95, 0.98, 1.0), smoothstep(0.35, 0.75, n1)); a = 0.92 * side;
          }
          diffuseColor = vec4(c, a);
        }`);
    };
  };
  // (the cheap ways where the quality draws no grain; the clouds in the face from the Média; the scene through the screen from the Alta)
  A3.quality = function (q) {
    if (!MAT || !MAT.water) return; const d = {};
    if (q.detail === 0) d.WCHEAP = 1; if ((q.aguaRefl | 0) >= 1) d.WCLOUD = 1; if ((q.aguaRefl | 0) >= 2) d.WSSR = 1;
    MAT.water.defines = d; MAT.water.needsUpdate = true; MAT.fall.needsUpdate = true;
    WU.ssr.value = (q.aguaRefl | 0) >= 3 ? 24 : (q.aguaRefl | 0) >= 2 ? 14 : 0;
  };

  // ------------------------------ the water's geometry ------------------------------
  // (a water surface: its colour and the least it hides at each corner, and the corner's mark — near the land, still, beyond)
  const lin = c => G.Realm.lin(c);
  class WGeo {
    constructor() { this.p = []; this.c = []; this.s = []; }
    quad(P, cols, al, sh) { for (const k of [0, 1, 2, 0, 2, 3]) { this.p.push(P[k][0], P[k][1], P[k][2]); const c = lin(cols[k]); this.c.push(c[0], c[1], c[2], al[k]); this.s.push(sh[k]); } }
    // a disc of still water (a basin, a fountain's bowl): its centre in the world (m), radius, colour and the least it hides
    disc(X, Y, Z, r, col, al, n) {
      const m = n || 18, c = lin(col), a = al === undefined ? 0.6 : al;
      for (let k = 0; k < m; k++) { const a0 = k / m * TAU, a1 = (k + 1) / m * TAU; this.p.push(X, Y, Z, X + Math.cos(a1) * r, Y, Z + Math.sin(a1) * r, X + Math.cos(a0) * r, Y, Z + Math.sin(a0) * r); for (let q = 0; q < 3; q++) { this.c.push(c[0], c[1], c[2], a); this.s.push(2); } }
    }
    get empty() { return !this.p.length; }
    build() {
      const g = new THREE.BufferGeometry(); const n = this.p.length / 3; const nr = new Float32Array(n * 3); for (let k = 0; k < n; k++) nr[k * 3 + 1] = 1;
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nr, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 4)); g.setAttribute('aShore', new THREE.Float32BufferAttribute(this.s, 1));
      g.computeBoundingSphere(); return g;
    }
  }
  A3.WGeo = () => new WGeo();
  // (how far below the water a corner's bed is, and whether land touches it)
  function wetCorner(x, y, lvl, river) {
    const S = G.S; let d = 0, n = 0, land = 0;
    for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) {
      const tx = x + dx, ty = y + dy; if (!W.inb(tx, ty)) continue; const i = ty * N + tx; const t = S.type[i];
      const wet = river ? t === T.RIVER || t <= T.SEA : t <= T.SEA && !(S.dry && S.dry[i]);
      if (!wet) { land = 1; continue; } d += lvl - W.tileH(i); n++;
    }
    return [n ? d / n : 0, land];
  }
  // (whether the open sea touches a tile, at a side or a corner)
  function seaBeside(x, y) {
    const S = G.S;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && W.inb(nx, ny)) { const j = ny * N + nx; if (S.type[j] <= T.SEA && !(S.dry && S.dry[j])) return true; } }
    return false;
  }
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // (a tile of land whose lowest corner dips under the sea's face)
  const lowShore = (x, y) => Math.min(W.vh(x, y), W.vh(x + 1, y), W.vh(x, y + 1), W.vh(x + 1, y + 1)) < G.SEA + 0.12;
  // (whether the sea runs over a tile of land that dips under it: beside it, or across two more such tiles — a wide flat beach is
  // wet as far as the sea goes over it, not to the side of its first tile)
  function seaReaches(x, y) {
    if (!lowShore(x, y)) return false; const S = G.S; let ring = [[x, y]]; const seen = new Set([y * N + x]);
    for (let step = 0; step < 3 && ring.length; step++) {
      const next = [];
      for (const [cx, cy] of ring) {
        if (seaBeside(cx, cy)) return true;
        for (const [dx, dy] of D4) { const nx = cx + dx, ny = cy + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (seen.has(j)) continue; seen.add(j); if (S.type[j] > T.RIVER && lowShore(nx, ny)) next.push([nx, ny]); }
      }
      ring = next;
    }
    return false;
  }
  // (a corner one of whose four tiles is a river with its face at the height L, give or take 10 cm)
  const riverCorner = (cx, cy, L) => { const S = G.S; for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const tx = cx + dx, ty = cy + dy; if (!W.inb(tx, ty)) continue; const j = ty * N + tx; if (S.type[j] === T.RIVER && Math.abs(S.wl[j] * G.Space.HM + 0.05 - L) <= 0.1) return true; } return false; };
  // (a bank: a tile of land beside a river whose ground the river's face runs over before the land rises out of it — the water's
  // edge is where the two meet inside the tile, not the tile's side, ruled straight. Only beside water lying level (a river
  // falling past the tile would leave a step in its face) and where every corner off the river stands out of the water: no sheet
  // of it left standing over a slope going down. The face's height, or null)
  function bankLevel(x, y) {
    const S = G.S, HM = G.Space.HM; let L = -Infinity, lo = Infinity;
    for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (S.type[j] === T.RIVER && !(S.ice && S.ice[j])) { const f = S.wl[j] * HM + 0.05; L = Math.max(L, f); lo = Math.min(lo, f); } }
    if (L === -Infinity || L - lo > 0.1) return null; let under = false;
    for (const [cx, cy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) { if (W.vh(cx, cy) * HM >= L) continue; if (!riverCorner(cx, cy, L)) return null; under = true; }
    return under ? L : null;
  }
  // the water of a chunk: the sea at its level, every river and lake at its own; the ice of a sudden winter; the walls of a parted
  // sea; and the sheets of its falls and rapids (the steps whose higher tile is in it — each drawn by one chunk only)
  A3.geo = function (x0, y0, w, h, far) {
    if (!THREE) THREE = window.THREE; // (the proofs in Node build the same chunks, with no graphics card)
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; const g = new WGeo(), ice = G.Realm.Geo(), walls = G.Realm.Geo();
    const sea = G.SEA * HM;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; const t = S.type[i];
      if (t <= T.SEA) {
        if (S.dry && S.dry[i]) {
          // (the bed of the parted sea: around it the water stands up in walls)
          if (far) continue;
          for (const [dx, dy] of D4) {
            const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (S.type[j] > T.SEA || (S.dry && S.dry[j])) continue;
            // (the side the two tiles share: along Z for a neighbour east or west, along X for one north or south)
            const ex = dx > 0 ? x + 1 : x, ez = dy > 0 ? y + 1 : y;
            const ax = dx !== 0 ? ex : x, az = dx !== 0 ? y : ez, bx = dx !== 0 ? ex : x + 1, bz = dx !== 0 ? y + 1 : ez;
            const fa = W.hAt(ax, az) * HM, fb = W.hAt(bx, bz) * HM, top = sea + 6.6;
            walls.quad([ax * TL, fa, az * TL], [bx * TL, fb, bz * TL], [bx * TL, top, bz * TL], [ax * TL, top, az * TL], '#2f7fa0', '#2f7fa0', '#8fd4e6', '#8fd4e6');
          }
          continue;
        }
        // (its colour and clearness come from its place and the depth the shader reads at each point; the corners only say where the land is)
        const C4 = [[x, y], [x, y + 1], [x + 1, y + 1], [x + 1, y]].map(([cx, cy]) => wetCorner(cx, cy, G.SEA, false));
        g.quad([[x * TL, sea, y * TL], [x * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, y * TL]],
          [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], C4.map(c => c[1]));
      } else if (t === T.RIVER) {
        const wl = S.wl[i] * HM + 0.05;
        if (S.ice && S.ice[i]) { ice.quad([x * TL, wl + 0.05, y * TL], [x * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, (y + 1) * TL], [(x + 1) * TL, wl + 0.05, y * TL], '#dcecf6'); continue; }
        const C4 = [[x, y], [x, y + 1], [x + 1, y + 1], [x + 1, y]].map(([cx, cy]) => wetCorner(cx, cy, S.wl[i], true)[1] * 0.85);
        g.quad([[x * TL, wl, y * TL], [x * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, (y + 1) * TL], [(x + 1) * TL, wl, y * TL]], [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], C4);
      } else if (!far && seaReaches(x, y)) {
        // (the shore: over a tile of land that dips toward the sea, the sea goes on until the land rises out of it — the water's edge
        // is where the two meet, wherever that is in the tile, not the tile's own edge; the land hides the rest)
        g.quad([[x * TL, sea, y * TL], [x * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, (y + 1) * TL], [(x + 1) * TL, sea, y * TL]], [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], [1, 1, 1, 1]);
      } else if (!far && !S.occ[i] && !S.road[i]) {
        // (a river's bank, the same way: its face goes on over the low edge of the land beside it — not under a building, which has
        // its own water if any, nor over the end of a road to a bridge)
        const L = bankLevel(x, y);
        if (L !== null) g.quad([[x * TL, L, y * TL], [x * TL, L, (y + 1) * TL], [(x + 1) * TL, L, (y + 1) * TL], [(x + 1) * TL, L, y * TL]], [SHALLOW, SHALLOW, SHALLOW, SHALLOW], [0, 0, 0, 0], [0.85, 0.85, 0.85, 0.85]);
      }
    }
    const falls = fallsGeo(x0, y0, w, h, far);
    return { water: g.empty ? null : g.build(), ice: ice.empty ? null : ice.build(), walls: walls.empty ? null : walls.build(), falls };
  };

  // ------------------------------ the sheets of the falls ------------------------------
  // For each step of the water (G.Agua.steps) whose higher tile is in the chunk: a sheet from the lip — the shared side, at the
  // higher face — falling as water thrown over it falls (a parabola) to where the land under it goes into the lower water; never
  // into the ground it pours over (lifted over a rock that stands in its way); its edges tucked into the banks. At its foot, on the
  // lower water, an apron of foam. Nothing over a bridge or a building (the steps are not drawn there), nothing past the lower tile.
  // The profile (in metres from the lip along the way out, and up): the same for the proofs (A3.sheetOf)
  A3.sheetOf = function (s) {
    const TL = G.Space.TILE; const mx = (s.ax + s.bx) / 2, my = (s.ay + s.by) / 2; const ground = d => G.Space.footAt(mx + s.nx * d / TL, my + s.ny * d / TL);
    // (where the land under the sheet goes into the lower water)
    let sL = 0.25; for (let d = 0.1; d <= 3.8; d += 0.1) { sL = d; if (ground(d) <= s.low - 0.02) break; }
    sL = G.clamp(sL, 0.25, 3.8);
    const R = 9, prof = [];
    for (let k = 0; k <= R; k++) { const d = sL * k / R; let y = s.top - s.drop * (k / R) * (k / R); const gy = ground(Math.max(0.02, d)) + 0.06; if (k > 0 && k < R && y < gy) y = Math.min(s.top, gy); prof.push([d, y]); }
    return { sL, prof };
  };
  function fallsGeo(x0, y0, w, h, far) {
    const S = G.S; const q = R3().Q(); const TL = G.Space.TILE;
    // (from afar only the great falls, and only where the quality carries it: a call a chunk — the Média keeps its calls for what is near)
    if (far && (q.aguaFall | 0) < 3) return null;
    const steps = G.Agua.steps(x0, y0, w, h).filter(s => !far || s.drop >= 1.5); if (!steps.length) return null;
    const P = [], Nn = [], Cc = [], F = [], Q = []; const fine = (q.aguaFall | 0) >= 3, apron = (q.aguaFall | 0) >= 2 && !far;
    const nU = far ? 2 : fine ? 6 : 4;
    const put = (x, y, z, nx, ny, nz, c, f, qq) => { P.push(x, y, z); Nn.push(nx, ny, nz); Cc.push(c[0], c[1], c[2]); F.push(f[0], f[1], f[2], f[3]); Q.push(qq[0], qq[1], qq[2], qq[3]); };
    const meta = [];
    for (const s of steps) {
      const lk = G.Agua.look(s.i); const c = lin(lk ? lk.col : SHALLOW); const kind = s.frozen ? 2 : 0;
      const sh = A3.sheetOf(s); const prof = far ? [sh.prof[0], sh.prof[3], sh.prof[6], sh.prof[9]] : fine ? sh.prof : sh.prof.filter((_, k) => k % 2 === 0 || k === 9);
      // (the sheet starts a little back over the higher water, so no gap shows between the two)
      const pr = [[-0.3, s.top]].concat(prof);
      const ax = s.ax * TL, az = s.ay * TL, bx = s.bx * TL, bz = s.by * TL; const wid = Math.hypot(bx - ax, bz - az); const nx = s.nx, nz = s.ny;
      let len = 0; const acc = [0]; for (let k = 1; k < pr.length; k++) { len += Math.hypot(pr[k][0] - pr[k - 1][0], pr[k][1] - pr[k - 1][1]); acc.push(len); }
      const qq = [wid, s.drop, s.sp, Math.min(1, Math.log2(1 + s.q) / 8)];
      const row = (k, u) => { const d = pr[k][0], y = pr[k][1]; const X = ax + (bx - ax) * u + nx * d, Z = az + (bz - az) * u + nz * d;
        // (its normal: square to the profile, out over the lower water)
        const k0 = Math.max(0, k - 1), k1 = Math.min(pr.length - 1, k + 1); const td = pr[k1][0] - pr[k0][0], ty = pr[k1][1] - pr[k0][1]; const tl = Math.hypot(td, ty) || 1;
        return [X, y, Z, nx * (-ty / tl), td / tl, nz * (-ty / tl)]; };
      for (let k = 0; k < pr.length - 1; k++) for (let j = 0; j < nU; j++) {
        const u0 = j / nU, u1 = (j + 1) / nU; const a = row(k, u0), b = row(k, u1), cc = row(k + 1, u1), d = row(k + 1, u0);
        const v0 = Math.max(0, acc[k] / len), v1 = acc[k + 1] / len; const fa = [u0, k ? v0 : -0.1, len, kind], fb = [u1, k ? v0 : -0.1, len, kind], fc = [u1, v1, len, kind], fd = [u0, v1, len, kind];
        for (const [p, f] of [[a, fa], [b, fb], [cc, fc], [a, fa], [cc, fc], [d, fd]]) put(p[0], p[1], p[2], p[3], p[4], p[5], c, f, qq);
      }
      // (the apron: foam on the lower water, from where the sheet strikes out over its tile)
      if (apron && !s.frozen && s.drop >= 0.15) {
        const r0 = sh.sL, r1 = Math.min(3.9, sh.sL + 0.9 + Math.min(2.2, s.drop * 0.35)); const yA = s.low + 0.035; const nA = 3;
        for (let k = 0; k < nA; k++) for (let j = 0; j < nU; j++) {
          const da = r0 + (r1 - r0) * k / nA, db = r0 + (r1 - r0) * (k + 1) / nA; const u0 = j / nU, u1 = (j + 1) / nU;
          const pt = (d, u) => [ax + (bx - ax) * u + nx * d, yA, az + (bz - az) * u + nz * d];
          const a = pt(da, u0), b = pt(da, u1), cc = pt(db, u1), d = pt(db, u0); const va = k / nA, vb = (k + 1) / nA;
          for (const [p, u, v] of [[a, u0, va], [b, u1, va], [cc, u1, vb], [a, u0, va], [cc, u1, vb], [d, u0, vb]]) put(p[0], p[1], p[2], 0, 1, 0, c, [u, v, r1 - r0, 1], qq);
        }
      }
      meta.push({ i: s.i, j: s.j, top: s.top, low: s.low, drop: s.drop, name: s.name, frozen: s.frozen, sL: sh.sL });
    }
    if (!P.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
    g.setAttribute('aF', new THREE.Float32BufferAttribute(F, 4)); g.setAttribute('aQ', new THREE.Float32BufferAttribute(Q, 4)); g.computeBoundingSphere();
    g.userData.steps = meta; return g;
  }

  // ------------------------------ the sea beyond the map ------------------------------
  // the sea to the horizon, past the edge of the map — a frame round it, at the sea's own level (inside the map the sea is its
  // chunks' own: one water over another would hide the shallows under a second, darker sea)
  let ocean = null;
  A3.ocean = function (scene) {
    A3.dropOcean(scene);
    const L = G.Space.size(), E = 1400, y = G.SEA * G.Space.HM; const P = [];
    const quad = (x0, z0, x1, z1) => P.push(x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0);
    quad(-E, -E, L + E, 0); quad(-E, L, L + E, L + E); quad(-E, 0, 0, L); quad(L, 0, L + E, L);
    const nv = P.length / 3; const c = lin(DEEP_OUT); const cl = new Float32Array(nv * 4), nr = new Float32Array(nv * 3);
    for (let k = 0; k < nv; k++) { cl[k * 4] = c[0]; cl[k * 4 + 1] = c[1]; cl[k * 4 + 2] = c[2]; cl[k * 4 + 3] = 0.94; nr[k * 3 + 1] = 1; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nr, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cl, 4)); g.setAttribute('aShore', new THREE.BufferAttribute(new Float32Array(nv).fill(-1), 1)); g.computeBoundingSphere();
    ocean = new THREE.Mesh(g, MAT.water); ocean.renderOrder = 1; ocean.frustumCulled = false; scene.add(ocean);
  };
  A3.dropOcean = function (scene) { if (!ocean) return; ocean.geometry.dispose(); (scene || ocean.parent) && (scene || ocean.parent).remove(ocean); ocean = null; };

  // ------------------------------ the picture behind the water (Alta, Ultra) ------------------------------
  // The water is drawn after all that is not see-through: the moment the first water of the frame is to be drawn, the picture of
  // what stands so far (its colours and its depth) is copied, and the water reads it — what is under its face, bent by the waves;
  // what stands round it, along the reflected ray. Only in the post-processing's own picture (the Alta's and the Ultra's)
  let grabFrame = -1, frameNo = 0;
  A3.frame = function () { frameNo++; WU.grab.value = 0; mirrorDraw(); };
  // ------------------------------ the sea's flat mirror (Ultra) ------------------------------
  // the scene drawn again, at half the picture's size, from the eye reflected in the sea's face (the near plane cut obliquely along the
  // face: nothing under the sea is in it), the water left out; read by the sea where it lies at its level. Its cost is a second scene a
  // frame, so only the Ultra draws it (aguaRefl 3), and only with the post-processing's own picture (the rest of the water's reading)
  let mir = null, mirCam = null, MV = null;
  function mirrorDraw() {
    WU.mirOn.value = 0; const R = R3(); const q = R.Q(); if ((q.aguaRefl | 0) < 3 || !THREE) return;
    const ren = R.renderer(), scene = R.scene(), cam = R.camera(); if (!ren || !scene || !cam || !G.Post3D || !G.Post3D.on) return;
    if (!MV) { MV = { v2: new THREE.Vector2(), p: new THREE.Vector3(), t: new THREE.Vector3(), u: new THREE.Vector3(), r: new THREE.Matrix4(), n: new THREE.Vector3(0, 1, 0), pl: new THREE.Plane(), c: new THREE.Vector4(), q: new THREE.Vector4(), o: new THREE.Vector3() }; mirCam = new THREE.PerspectiveCamera(); }
    const Y0 = G.SEA * G.Space.HM * scene.scale.y; if (cam.position.y < Y0 + 0.1) return;
    const sz = ren.getDrawingBufferSize(MV.v2); const w = Math.max(1, sz.x >> 1), h = Math.max(1, sz.y >> 1);
    if (!mir || mir.width !== w || mir.height !== h) { if (mir) mir.dispose(); mir = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: true }); WU.mir.value = mir.texture; }
    // (the eye, what it looks at and its up, reflected across the face)
    cam.updateMatrixWorld(); MV.r.extractRotation(cam.matrixWorld);
    MV.p.copy(cam.position); MV.p.y = 2 * Y0 - MV.p.y;
    MV.t.set(0, 0, -1).applyMatrix4(MV.r).add(cam.position); MV.t.y = 2 * Y0 - MV.t.y;
    MV.u.set(0, 1, 0).applyMatrix4(MV.r); MV.u.y = -MV.u.y;
    mirCam.position.copy(MV.p); mirCam.up.copy(MV.u); mirCam.lookAt(MV.t); mirCam.near = cam.near; mirCam.far = cam.far; mirCam.fov = cam.fov; mirCam.aspect = cam.aspect;
    mirCam.updateProjectionMatrix(); mirCam.updateMatrixWorld();
    WU.mirMat.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirCam.projectionMatrix).multiply(mirCam.matrixWorldInverse);
    // (the near plane along the sea's face, a hand under it: what lies under the water is not mirrored)
    MV.o.set(cam.position.x, Y0 - 0.12, cam.position.z); MV.pl.setFromNormalAndCoplanarPoint(MV.n, MV.o).applyMatrix4(mirCam.matrixWorldInverse);
    const P = mirCam.projectionMatrix.elements; MV.c.set(MV.pl.normal.x, MV.pl.normal.y, MV.pl.normal.z, MV.pl.constant);
    MV.q.set((Math.sign(MV.c.x) + P[8]) / P[0], (Math.sign(MV.c.y) + P[9]) / P[5], -1, (1 + P[10]) / P[14]); MV.c.multiplyScalar(2 / MV.c.dot(MV.q));
    P[2] = MV.c.x; P[6] = MV.c.y; P[10] = MV.c.z + 1; P[14] = MV.c.w; mirCam.projectionMatrixInverse.copy(mirCam.projectionMatrix).invert();
    // (drawn without the water and the sheets, without making the shadows again)
    const sm = ren.shadowMap, au = sm.autoUpdate, nu = sm.needsUpdate, prev = ren.getRenderTarget(), info = ren.info, ar = info.autoReset;
    MAT.water.visible = false; MAT.fall.visible = false; sm.autoUpdate = false; sm.needsUpdate = false; info.autoReset = false; const c0 = info.render.calls;
    try { ren.setRenderTarget(mir); ren.clear(); ren.render(scene, mirCam); }
    finally { ren.setRenderTarget(prev); MAT.water.visible = true; MAT.fall.visible = true; sm.autoUpdate = au; sm.needsUpdate = nu; A3.stats.mirCalls = info.render.calls - c0; info.autoReset = ar; }
    WU.mirOn.value = 1;
  }
  A3.grabHook = function (renderer, scene, camera) {
    const q = R3().Q(); if ((q.aguaRefl | 0) < 2 || grabFrame === frameNo) return;
    const rt = renderer.getRenderTarget(); if (!rt || !rt.depthTexture || !rt.samples) return;
    const gl = renderer.getContext(); const pr = renderer.properties.get(rt); const ms = pr.__webglMultisampledFramebuffer, fb = pr.__webglFramebuffer;
    if (!ms || !fb) return;
    grabFrame = frameNo;
    // (blit the picture drawn so far into the post-processing's own resolve target: its colour and its depth — the water reads them; the
    // last resolve of the frame overwrites them with the whole picture, as it always does)
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, ms); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb);
    gl.blitFramebuffer(0, 0, rt.width, rt.height, 0, 0, rt.width, rt.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.blitFramebuffer(0, 0, rt.width, rt.height, 0, 0, rt.width, rt.height, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, ms);
    WU.scene.value = rt.texture; WU.depth.value = rt.depthTexture; WU.grab.value = 1; A3.stats.grab++;
    const pm = camera.projectionMatrix.elements; WU.proj.value.set(pm[0], pm[5], pm[8], pm[9]); WU.nf.value.set(camera.near, camera.far); WU.scr.value.set(rt.width, rt.height);
  };
  // (every water mesh asks for the copy before it is drawn: the first of the frame makes it)
  A3.hook = function (mesh) { if (!mesh) return mesh; mesh.onBeforeRender = (renderer, scene, camera) => A3.grabHook(renderer, scene, camera); return mesh; };

  // ------------------------------ the rain that wets ------------------------------
  // the land and the roofs, wet: darker (the stuff soaks), shining with the sky as one looks along them, smooth where the water
  // pools (the puddles of the ground's own place, G.Agua.puddle) with the sky in them and the rain's rings; thin trickles running
  // down the steep faces in the rain; the rock round a fall's foot dark and glistening with its spray (G.Agua.spray). The ground's
  // and the buildings' shaders take this piece (their one line each: 21c, js/ground3d.js and js/build3d.js)
  const WETGLSL = `#define AGUA_WET 1
uniform sampler2D uAgWet; uniform float uAgN; uniform float uAgK; uniform vec3 uAgSky;
vec3 gAgSheen = vec3(0.0);
// (the ground: c its colour, P the point, Nn its normal, sky the sky's colour at the horizon, t the view's clock, det the detail picture)
vec3 aguaWetGround(vec3 c, vec3 P, vec3 Nn, vec3 sky, float t, sampler2D det) {
  if (uAgK < 0.5) return c;
  vec4 wt = texture2D(uAgWet, P.xz * uAgN); float wet = max(wt.r, wt.b * 0.9); if (wet < 0.02) return c;
  float up = clamp(Nn.y, 0.0, 1.0); vec3 V = normalize(cameraPosition - P); float fres = pow(1.0 - clamp(dot(V, normalize(Nn)), 0.0, 1.0), 3.0);
  // (the puddles: where the rain pools, as much as it has rained — their edges wandering with the ground's own grain)
  float pz = 0.0;
  // (patches of a metre or two, a quarter of the ground the place lets hold water at the most, in a heavy rain)
  if (wt.g > 0.01) { float n = texture2D(det, P.xz / 2.3 + 0.13).g * 0.6 + texture2D(det, P.xz / 0.9 + 0.37).r * 0.4; float th = 1.0 - 0.38 * wt.g * smoothstep(0.35, 0.9, wt.r);
    pz = smoothstep(th, th + 0.04, n) * smoothstep(0.85, 0.97, up); }
  // (the trickles: on a steep face in the rain, threads of water running down it)
  float steep = 1.0 - smoothstep(0.45, 0.85, up); float tr = 0.0;
  if (steep > 0.01 && wet > 0.35) { vec2 tg = normalize(vec2(Nn.x, Nn.z) + vec2(1e-4)); float s = dot(P.xz, vec2(-tg.y, tg.x)); float n = texture2D(det, vec2(s * 0.9, P.y * 0.25 + t * 0.35)).r; tr = smoothstep(0.78, 0.86, n) * steep * smoothstep(0.35, 0.8, wet); }
  c *= 1.0 - wet * 0.44 * (0.55 + 0.45 * up);
  c = mix(c, c * 0.4, pz);
  gAgSheen = sky * (wet * (0.05 + fres * 0.3) * (0.4 + 0.6 * up) + pz * (0.12 + fres * 0.45) + tr * 0.3);
  return c;
}
// (a building's face: roofs and paving wet as the land is, the walls less)
void aguaWetSolid(inout vec3 c, vec3 P, vec3 Nn, vec3 sky) {
  if (uAgK < 0.5) return;
  float wet = texture2D(uAgWet, P.xz * uAgN).r; if (wet < 0.02) return;
  float up = clamp(Nn.y, 0.0, 1.0); vec3 V = normalize(cameraPosition - P); float fres = pow(1.0 - clamp(dot(V, normalize(Nn)), 0.0, 1.0), 3.0);
  float k = wet * mix(0.35, 1.0, smoothstep(0.2, 0.6, up));
  c *= 1.0 - k * 0.38;
  gAgSheen = sky * k * (0.06 + fres * 0.38);
}
`; // (ends on a new line: the ground's piece after it starts with a #define — L-1673)
  A3.groundGLSL = () => WETGLSL;
  A3.solidGLSL = () => WETGLSL;

  // ------------------------------ for the verifier ------------------------------
  // (a near picture the world has changed under since the realm last looked at it — a house founded on a bank, a road laid over one, a
  // bridge over a step — is made again at its next look, a quarter of a second to a second and a half of the world's clock later (the
  // realm's stream; L-644): until then it is stale, not wrong, and is not judged; past that time it is judged as it stands — a picture
  // that never followed the world is still caught (T-1550)
  const RELOOK = 2;
  function stale(ch) {
    if (!ch || !ch.sig || !G.Realm.sigOf) return false; const s = G.Realm.sigOf(ch.cx, ch.cy);
    return !(s.a === ch.sig.a && s.b === ch.sig.b && s.c === ch.sig.c && s.d === ch.sig.d) && G.S.clock - ch.sigT <= RELOOK;
  }
  A3.stale = stale;
  // (in the near pictures, the water laid over a tile of land — the shore, a river's bank — only where the land dips under its
  // face, and a river's never over a building or the end of a road; how many quads, how many break it)
  A3.waterCheck = function () {
    const S = G.S, TL = G.Space.TILE, HM = G.Space.HM; let n = 0, bad = 0, ex = '', old = 0;
    G.Realm.eachNear((parts, ch) => {
      const g = parts.ground; if (!g) return; if (stale(ch)) { old++; return; }
      for (const m of g.children) {
        if (m.material !== MAT.water) continue; const P = m.geometry.attributes.position.array;
        for (let k = 0; k + 17 < P.length; k += 18) { // (a quad: two triangles, six points, square on its tile)
          let x0 = Infinity, z0 = Infinity; for (let q = 0; q < 6; q++) { x0 = Math.min(x0, P[k + q * 3]); z0 = Math.min(z0, P[k + q * 3 + 2]); }
          const x = Math.round(x0 / TL), y = Math.round(z0 / TL); if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] <= T.RIVER) continue;
          n++; const face = P[k + 1], sea = Math.abs(face - G.SEA * HM) < 1e-3;
          const lo = Math.min(W.vh(x, y), W.vh(x + 1, y), W.vh(x, y + 1), W.vh(x + 1, y + 1)) * HM;
          const why = lo > face + 0.12 * HM + 1e-3 ? 'sobre terra seca' : !sea && (S.occ[i] || S.road[i]) ? 'de rio sob prédio ou estrada' : '';
          if (why) { bad++; if (!ex) ex = `casa ${x},${y} ${why}`; }
        }
      }
    });
    return { n, bad, ex, stale: old };
  };
  // (every step of the water in the near pictures has its sheet, at the faces of its two tiles; no sheet over a bridge, a building or
  // the ice's own drawing out of place; none where the world has no step now; nothing past the lower tile)
  A3.fallCheck = function () {
    const S = G.S, TL = G.Space.TILE; const out = []; let n = 0, old = 0;
    G.Realm.eachNear((parts, ch) => {
      const g = parts.ground; if (!g) return; if (stale(ch)) { old++; return; } const x0 = ch.cx * 16, y0 = ch.cy * 16;
      const want = G.Agua.steps(x0, y0, 16, 16); const got = [];
      for (const m of g.children) if (m.material === MAT.fall && m.geometry.userData.steps) got.push(...m.geometry.userData.steps);
      n += got.length;
      const key = s => s.i + ':' + s.j; const gk = new Map(got.map(s => [key(s), s]));
      for (const s of want) { const d = gk.get(key(s)); if (!d) { if (out.length < 4) out.push(`degrau ${s.x},${s.y}→${s.tx},${s.ty} (${s.drop.toFixed(2)} m${s.name ? ', ' + s.name : ''}) sem lâmina`); continue; }
        if (Math.abs(d.top - s.top) > 0.05 || Math.abs(d.low - s.low) > 0.05) out.push(`a lâmina de ${s.x},${s.y} fora das faces da água`); }
      const wk = new Set(want.map(key)); for (const s of got) if (!wk.has(key(s))) { if (out.length < 4) out.push(`lâmina em ${s.i % N},${(s.i / N) | 0} onde o mundo não tem degrau`); }
      for (const s of got) for (const t of [s.i, s.j]) if (S.road[t] || S.occ[t]) out.push(`lâmina sobre ponte ou prédio em ${t % N},${(t / N) | 0}`);
      for (const m of g.children) if (m.material === MAT.fall) { const P = m.geometry.attributes.position.array; for (let k = 0; k < P.length; k += 3) { const x = P[k] / TL, y = P[k + 2] / TL; if (!(P[k + 1] === P[k + 1]) || x < x0 - 1.1 || y < y0 - 1.1 || x > x0 + 17.1 || y > y0 + 17.1) { out.push(`lâmina fora do seu pedaço (${x.toFixed(1)},${y.toFixed(1)})`); break; } } }
    });
    return { n, bad: out.length, out, stale: old };
  };
  A3.check = function () {
    const out = []; if (!MAT || !MAT.water) return out;
    const bc = A3.bedCheck(48); if (bc.bad > 2) out.push(`leito da água: ${bc.bad} de ${bc.n} pontos fora da altura do chão`);
    const wc = A3.waterCheck(); if (wc.bad) out.push(`água desenhada sobre a terra fora do lugar: ${wc.bad} de ${wc.n} (${wc.ex})`);
    const fc = A3.fallCheck(); if (fc.bad) out.push(...fc.out.slice(0, 3));
    return out;
  };
})(window.G);
