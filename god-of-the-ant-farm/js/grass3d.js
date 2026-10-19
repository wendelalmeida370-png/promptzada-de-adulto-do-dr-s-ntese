'use strict';
// ============================================================
//  Grass3D: the field of grass round the body — thousands of
//  blades drawn by the graphics card from one small clump, set
//  on a grid that stays put in the world while the eye moves
//  over it (no blade swims). Where each clump grows, how thick
//  and tall it is and whether it flowers is the world's own
//  ground (the Ground3D's grass picture: meadow, savanna gold,
//  reeds of the swamp, the short grass of the taiga; nothing on
//  roads, houses, fields, water, rock, snow or ash); its colour
//  is the god's colour of that tile, darker at the root and
//  lighter, sun-bleached, at the tip, each blade its own shade.
//  The wind of the world leans it and runs over it in gusts —
//  waves of light crossing the meadow — and the body and the
//  people walking part it. It thins out toward the edge of its
//  circle, where the ground's own picture takes over.
//  And nearer still, the small things lying on the ground: a
//  pebble, a leaf fallen under the trees, a twig, a pine cone,
//  a flower on its stem, a shell on the beach, a mushroom in the
//  wet wood — each where the hash of its place puts it, of the
//  ground's own kind, never on a road, a house, a field or the
//  water (the Ground3D's floor picture says where).
//  Only seen: nothing here touches the world.
// ============================================================
(function (G) {
  const GR = G.Grass3D = { on: false, clumps: 0, bits: 0 };
  let THREE = null, R3 = null, mesh = null, geo = null, mat = null, hTex = null, hFor = null, hT = 0, side = 0;
  let lmesh = null, lgeo = null, lmat = null, lside = 0;
  const CELL = 0.5, PUSH = 6, LCELL = 1, LR = 13;
  let cell = CELL; // (the spacing of the clumps now: the preset's density of grass, grassDen, spaces them wider — fewer, fuller tufts)
  const U = { uMask: { value: null }, uGMap: { value: null }, uFMap: { value: null }, uH: { value: null }, uGust: { value: null }, uN: { value: 1 }, uOrigin: { value: null }, uLOrigin: { value: null }, uEye: { value: null }, uR: { value: 20 }, uLR: { value: LR }, uPush: { value: [] }, uCell: { value: CELL } };
  G.worldHooks.push(() => { hFor = null; });
  // (a hash of a cell of the world, the same in every shader that reads it)
  const GH = `float gh(vec2 c, uint s) { uvec2 q = uvec2(ivec2(c) + 65536) * uvec2(1597334673u, 3812015801u); uint n = (q.x ^ q.y ^ (s * 2654435761u)) * 1597334673u; n ^= n >> 15; n *= 2246822519u; n ^= n >> 13; return float(n & 0xffffffu) / 16777216.0; }
        float gNy = 1.0; // (the up of the land's normal at the last point hAt read: its slope, from the same four corners)
        float hAt(vec2 t) { t = clamp(t, vec2(0.0), vec2(uN - 0.001)); ivec2 i = ivec2(floor(t)); vec2 f = t - vec2(i);
          float a = texelFetch(uH, i, 0).r, b = texelFetch(uH, i + ivec2(1, 0), 0).r, c = texelFetch(uH, i + ivec2(0, 1), 0).r, d = texelFetch(uH, i + ivec2(1, 1), 0).r;
          vec2 gr = vec2(mix(b - a, d - c, f.y), mix(c - a, d - b, f.x)) * (1.5 / 4.0); gNy = inversesqrt(1.0 + dot(gr, gr));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
        // (the snow the land's shader lays at a point of the ground: Ground3D's own rule, the floor read as smoothly)
        ${G.Ground3D && G.Ground3D.snowGLSL ? G.Ground3D.snowGLSL() : 'float gSnowE(vec4 fm, float ny, vec2 xz, sampler2D nz) { return 0.0; }'}`;

  GR.init = function (three, realm) {
    THREE = three; R3 = realm;
    U.uOrigin.value = new THREE.Vector2(); U.uLOrigin.value = new THREE.Vector2(); U.uEye.value = new THREE.Vector3(); for (let k = 0; k < PUSH; k++) U.uPush.value.push(new THREE.Vector4());
    U.uGust.value = G.Ground3D.cloudNoise();
    // the clump: five blades from one root, each leaning its own way, three segments narrowing to a point
    const P = [], N = [], AU = [], AB = [], IDX = [];
    const B = 5, SG = 3;
    for (let b = 0; b < B; b++) {
      const a = b / B * Math.PI * 2 + 0.4 * b, lean = 0.12 + 0.1 * ((b * 7) % 3), ox = Math.cos(a) * 0.07, oz = Math.sin(a) * 0.07;
      const px = -Math.sin(a), pz = Math.cos(a); // (across the blade)
      const base = P.length / 3;
      for (let s = 0; s <= SG; s++) {
        const u = s / SG; const w = 0.03 * (1 - u * 0.9) * (b % 2 ? 0.85 : 1.15);
        const cx = ox + Math.cos(a) * lean * u, cz = oz + Math.sin(a) * lean * u;
        for (const sd of [-1, 1]) { P.push(cx + px * w * sd, u, cz + pz * w * sd); N.push(Math.cos(a), 0.3, Math.sin(a)); AU.push(u); AB.push(b); }
      }
      for (let s = 0; s < SG; s++) { const q = base + s * 2; IDX.push(q, q + 1, q + 3, q, q + 3, q + 2); }
    }
    geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    geo.setAttribute('aU', new THREE.Float32BufferAttribute(AU, 1)); geo.setAttribute('aB', new THREE.Float32BufferAttribute(AB, 1)); geo.setIndex(IDX);
    mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    mat.defines = { RIM: 0.3 };
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U, { uTime: R3.U.time, uWind: R3.U.wind, uBody: R3.U.body });
      sh.vertexShader = `attribute vec2 aCell; attribute float aU; attribute float aB;
        uniform sampler2D uMask; uniform sampler2D uGMap; uniform sampler2D uH; uniform sampler2D uGust; uniform sampler2D uFMap;
        uniform float uN; uniform vec2 uOrigin; uniform vec3 uEye; uniform float uR; uniform float uTime; uniform vec3 uWind; uniform vec4 uBody; uniform vec4 uPush[${PUSH}]; uniform float uCell;
        varying vec3 vGC; varying float vGU;
        ${GH}
        ` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
        // (one clump: where it stands in the world, what grows there, how the wind and the walkers bend it)
        vec2 gcell = uOrigin + aCell;
        float r1 = gh(gcell, 1u), r2 = gh(gcell, 2u), r3 = gh(gcell, 3u), r4 = gh(gcell, 4u);
        vec2 root = (gcell + vec2(r1, r2) * 0.92) * uCell;
        vec2 tile = root / 4.0; ivec2 ti = clamp(ivec2(floor(tile)), ivec2(0), ivec2(int(uN) - 1));
        vec4 mk = texelFetch(uMask, ti, 0); float kind = floor(mk.a * 255.0 + 0.5);
        // (no grass on this tile — a road, a roof, the snow, the water, most of a town: the clump is left out at once, nothing
        // more read for it; it would be drawn flat and out of sight anyway)
        if (mk.r <= 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        float gy = hAt(tile) * 1.5;
        float dist = length(vec3(root.x, gy, root.y) - uEye);
        // (thinning toward the edge of the circle; and gone right at the eye, where a blade would fill the picture)
        float fade = (1.0 - smoothstep(uR * 0.6, uR, dist)) * smoothstep(1.3, 3.4, dist);
        // (and none where the snow lies over its root — a few blades poking out of the very edge of it)
        vec4 sfm = mk.r > 0.0 ? texture2D(uFMap, tile / uN) : vec4(0.0); float snowE = sfm.a > 0.004 ? gSnowE(sfm, gNy, root, uGust) : 0.0;
        // (how thick it grows here: the tile's own, thinning toward a tile without grass with a ragged edge — tufts, and the
        // earth showing between them — never spilling over it; the jungle's undergrowth thinner in the deep shade of the trees)
        float th = mk.r > 0.0 ? min(mk.r, texture2D(uMask, tile / uN).r + (texture2D(uGust, root / 7.0 + 0.3).g - 0.5) * 0.7 + (r2 - 0.5) * 0.18) : 0.0;
        float Hh = (0.1 + mk.g * 1.5) * (0.7 + r4 * 0.6) * step(r3, th * (kind == 3.0 ? 1.0 - sfm.r * 0.5 : 1.0)) * fade * (1.0 - smoothstep(0.44, 0.52, snowE));
        if (Hh <= 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; } // (thinned out, out of the circle, under the snow: the same)
        float ang = r1 * 6.2832 + r3 * 2.0; float ca = cos(ang), sa = sin(ang);
        vec2 wd = uWind.xy; float ws = length(wd) + 1e-4; wd /= ws;
        float gust = smoothstep(0.42, 0.86, texture2D(uGust, (root - uWind.xy * uTime * 1.7) / 52.0).r);
        float sway = sin(uTime * (1.9 + uWind.z) + root.x * 0.35 + root.y * 0.27 + aB * 1.7 + r2 * 3.0) * 0.13;
        vec2 bend = wd * (0.16 + uWind.z * 0.22 + gust * (0.38 + uWind.z * 0.3)) + vec2(sway, sway * 0.6);
        vec2 push = vec2(0.0); float flt = 0.0;
        { vec2 dv = root - uBody.xz; float dd = length(dv); float k = uBody.w * (1.0 - smoothstep(0.3, 1.15, dd)); push += dv / max(dd, 1e-3) * k; flt = max(flt, k); }
        for (int j = 0; j < ${PUSH}; j++) { vec2 dv = root - uPush[j].xz; float dd = length(dv); float k = uPush[j].w * (1.0 - smoothstep(0.28, 0.85, dd)); push += dv / max(dd, 1e-3) * k * 0.8; flt = max(flt, k * 0.8); }
        vec3 bn = vec3(ca * normal.x - sa * normal.z, normal.y, sa * normal.x + ca * normal.z);
        // (lit as the ground it grows from is lit, mostly from above: a meadow in the shade is the shade's green, not black)
        vec3 objectNormal = normalize(vec3(bn.x * 0.28, 1.0, bn.z * 0.28));`)
        .replace('#include <begin_vertex>', `
        vec3 transformed;
        { vec2 lp = position.xz; float arch = 0.0;
          // (the jungle's undergrowth: each blade of the clump a broad leaf, three times as wide, arching out from the root)
          if (kind == 3.0) { float ab = aB / 5.0 * 6.2832 + 0.4 * aB; vec2 dr = vec2(cos(ab), sin(ab)), ac = vec2(-dr.y, dr.x);
            lp = dr * (dot(lp, dr) * 1.9 + aU * 0.24) + ac * dot(lp, ac) * 3.2; arch = 0.38; }
          // (the dunes' and the beach's grass: thin blades, a few leaning far)
          else if (kind == 5.0) { float ab = aB / 5.0 * 6.2832 + 0.4 * aB; vec2 dr = vec2(cos(ab), sin(ab)), ac = vec2(-dr.y, dr.x);
            lp = dr * (dot(lp, dr) * (1.0 + r1 * 1.4)) + ac * dot(lp, ac) * 0.42; arch = 0.12 + r2 * 0.2; }
          // (the clump as wide as its cell is: fewer clumps, each fuller — the blades wider and spread farther, the meadow as green)
          vec2 pp = vec2(ca * lp.x - sa * lp.y, sa * lp.x + ca * lp.y) * (0.75 + r2 * 0.5) * (0.55 + 0.45 * fade) * (uCell / ${CELL.toFixed(2)});
          float u2 = aU * aU; vec2 off = (bend * 0.55 + push * 0.65) * u2 * Hh * (1.0 - arch * 0.6);
          transformed = vec3(root.x + pp.x + off.x, gy + aU * Hh * (1.0 - flt * 0.55 - aU * arch) - 0.03 - u2 * length(bend) * 0.12 * Hh, root.y + pp.y + off.y); }
        // (its colour: the god's colour of the tile, darker at the root, lighter and warmer at the tip, every blade its own
        // shade — one greener, one drier; brighter in a gust; the savanna's gold, the reeds' grey-green; a flower now and
        // then on the meadow)
        { vec3 tc = texelFetch(uGMap, ti, 0).rgb; float bv = fract(r2 * 13.7 + aB * 0.61 + r4 * 3.1);
          vec3 tip = tc * mix(vec3(1.0, 1.04, 0.9), vec3(1.08, 1.04, 0.8), bv) + vec3(0.015, 0.016, 0.004);
          if (kind == 1.0) tip = mix(tip, vec3(0.74, 0.6, 0.28), 0.7); else if (kind == 2.0) tip = mix(tip, vec3(0.36, 0.42, 0.22), 0.6); else if (kind == 4.0) tip *= 0.88; else if (kind == 3.0) tip *= 0.86; else if (kind == 5.0) tip = mix(tip, mix(vec3(0.62, 0.6, 0.36), vec3(0.42, 0.48, 0.3), bv), 0.6);
          vec3 c = mix(tc * mix(0.62, 0.78, bv), tip, smoothstep(0.0, 1.0, aU)) * (1.0 + gust * 0.22 * aU);
          if (aB > 2.5 && r4 < mk.b * 1.2 && aU > 0.66) { float fk = fract(r2 * 7.0); c = fk < 0.25 ? vec3(0.95, 0.88, 0.3) : fk < 0.5 ? vec3(0.95, 0.95, 0.92) : fk < 0.75 ? vec3(0.85, 0.42, 0.55) : vec3(0.5, 0.45, 0.9); }
          // (a little quieter than the god's flat green: moss and meadow, not lime — the tone curve lifts it again)
          c = mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, 0.86);
          vGC = c; vGU = aU; }`);
      sh.fragmentShader = 'varying vec3 vGC; varying float vGU;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = vGC;')
        // (both faces of a blade lit alike: three.js turns the normal of a back face down, into the dark — turned back here;
        // it was the black blades of the meadow in the shade)
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normal * faceDirection;')
        .replace('#include <opaque_fragment>', `
        #if NUM_DIR_LIGHTS > 0
        // (the sun behind the blades shines through them)
        { float bl = saturate(dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += vGC * directionalLights[0].color * pow(bl, 3.0) * 0.35 * vGU; }
        #endif
        // (the light that the blades pass to one another in a thick meadow: never darker than the ground in their shade)
        outgoingLight += vGC * 0.05 * (0.4 + vGU);
        #include <opaque_fragment>`);
    };
    mat.customProgramCacheKey = () => 'grass3d';
    mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.receiveShadow = true; mesh.castShadow = false; mesh.visible = false;
    realm.scene().add(mesh);
    littleInit(realm);
  };
  // ------------------------------ the small things on the ground ------------------------------
  // the shapes, all in one piece (each point knows which shape it belongs to; a cell shows one, or none): 0 a pebble, 1 three
  // pebbles, 2 a fallen leaf, 3 a twig, 4 a flower on its stem, 5 a pine cone, 6 a shell, 7 a mushroom. A metre is 1.
  function littleShapes() {
    const P = [], Nn = [], S = [], Y = [];
    // (a triangle of a shape, lit along its own normal turned out from the shape's heart — or up, for what lies flat)
    let heart = null;
    const tri = (s, a, b, c, ya, yb, yc) => { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1;
      const out = heart ? nx * ((a[0] + b[0] + c[0]) / 3 - heart[0]) + ny * ((a[1] + b[1] + c[1]) / 3 - heart[1]) + nz * ((a[2] + b[2] + c[2]) / 3 - heart[2]) : ny; const f = out < 0 ? -1 / l : 1 / l;
      for (const [p, y] of [[a, ya], [b, yb], [c, yc]]) { P.push(p[0], p[1], p[2]); Nn.push(nx * f, ny * f, nz * f); S.push(s); Y.push(y === undefined ? p[1] : y); } };
    // (a stone: a ring of six points round a lifted top)
    const stone = (s, x, z, r, h, tw) => { heart = [x, 0, z]; const top = [x + r * 0.15, h, z - r * 0.1]; const ring = []; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + tw; const rr = r * (0.8 + 0.25 * ((k * 5) % 3) / 2); ring.push([x + Math.cos(a) * rr, h * 0.22 * (k % 2), z + Math.sin(a) * rr * 0.8]); }
      for (let k = 0; k < 6; k++) tri(s, top, ring[(k + 1) % 6], ring[k]); heart = null; };
    stone(0, 0, 0, 0.5, 0.42, 0);
    stone(1, -0.3, 0.1, 0.32, 0.3, 0.4); stone(1, 0.28, -0.12, 0.26, 0.24, 1.2); stone(1, 0.05, 0.36, 0.2, 0.2, 2.1);
    // (a leaf lying on the ground, curled up a little along its middle)
    tri(2, [0, 0.02, -0.5], [0.24, 0.05, 0], [0, 0.07, 0.05]); tri(2, [0, 0.02, -0.5], [0, 0.07, 0.05], [-0.24, 0.05, 0]); tri(2, [0, 0.07, 0.05], [0.24, 0.05, 0], [0, 0.03, 0.5]); tri(2, [0, 0.07, 0.05], [0, 0.03, 0.5], [-0.24, 0.05, 0]);
    // (a twig: two bent pieces of a thin three-sided stick, and a side shoot)
    const stick = (s, a, b, r) => { heart = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + r * 0.5, (a[2] + b[2]) / 2]; const d = [b[0] - a[0], b[2] - a[2]]; const l = Math.hypot(d[0], d[1]) || 1; const px = -d[1] / l * r, pz = d[0] / l * r;
      const A = [[a[0] + px, a[1], a[2] + pz], [a[0] - px, a[1], a[2] - pz], [a[0], a[1] + r * 1.6, a[2]]], B2 = [[b[0] + px, b[1], b[2] + pz], [b[0] - px, b[1], b[2] - pz], [b[0], b[1] + r * 1.6, b[2]]];
      for (let k = 0; k < 3; k++) { const j = (k + 1) % 3; tri(s, A[k], B2[k], B2[j]); tri(s, A[k], B2[j], A[j]); } heart = null; };
    stick(3, [-0.5, 0.01, 0.05], [0.02, 0.02, -0.04], 0.022); stick(3, [0.02, 0.02, -0.04], [0.5, 0.01, 0.06], 0.017); stick(3, [0.05, 0.02, -0.03], [0.22, 0.015, -0.3], 0.012);
    // (a flower: a thin stem, a head of two crossed petals' cards and a heart; the head is what sways)
    tri(4, [-0.02, 0, 0], [0.02, 0, 0], [0.01, 1, 0], 0, 0, 1);
    for (const [a, b] of [[[-0.16, 1, 0], [0.16, 1, 0]], [[0, 1, -0.16], [0, 1, 0.16]]]) { tri(4, a, b, [b[0] * 0.2, 1.12, b[2] * 0.2], 1, 1, 1); tri(4, a, [b[0] * 0.2, 1.12, b[2] * 0.2], [a[0] * 0.2, 1.12, a[2] * 0.2], 1, 1, 1); tri(4, b, a, [-b[0] * 0.2, 0.9, -b[2] * 0.2], 1, 1, 1); }
    // (a pine cone: a spindle of scales lying on its side)
    { heart = [0, 0.36, 0]; const R = [[-0.5, 0], [-0.25, 0.32], [0.1, 0.36], [0.5, 0]]; for (let k = 0; k < 5; k++) { const a0 = k / 5 * Math.PI * 2, a1 = (k + 1) / 5 * Math.PI * 2; for (let j = 0; j < 3; j++) { const p = (x, r, a) => [x, 0.36 + Math.sin(a) * r, Math.cos(a) * r]; tri(5, p(R[j][0], R[j][1], a0), p(R[j + 1][0], R[j + 1][1], a0), p(R[j + 1][0], R[j + 1][1], a1)); tri(5, p(R[j][0], R[j][1], a0), p(R[j + 1][0], R[j + 1][1], a1), p(R[j][0], R[j][1], a1)); } } heart = null; }
    // (a shell: a little fan, ribbed)
    for (let k = 0; k < 4; k++) { const a0 = -1.1 + k * 0.55, a1 = a0 + 0.55; tri(6, [0, 0.05, -0.4], [Math.sin(a1) * 0.5, 0.02 + (k % 2) * 0.05, Math.cos(a1) * 0.5 - 0.3], [Math.sin(a0) * 0.5, 0.02 + ((k + 1) % 2) * 0.05, Math.cos(a0) * 0.5 - 0.3]); }
    // (a mushroom: its stem and a cap)
    heart = [0, 0.35, 0]; for (let k = 0; k < 4; k++) { const a0 = k / 4 * Math.PI * 2, a1 = (k + 1) / 4 * Math.PI * 2; const r = 0.12; tri(7, [Math.cos(a0) * r, 0, Math.sin(a0) * r], [Math.cos(a1) * r, 0, Math.sin(a1) * r], [Math.cos(a1) * r * 0.8, 0.7, Math.sin(a1) * r * 0.8], 0, 0, 0); tri(7, [Math.cos(a0) * r, 0, Math.sin(a0) * r], [Math.cos(a1) * r * 0.8, 0.7, Math.sin(a1) * r * 0.8], [Math.cos(a0) * r * 0.8, 0.7, Math.sin(a0) * r * 0.8], 0, 0, 0); }
    heart = [0, 0.72, 0]; for (let k = 0; k < 7; k++) { const a0 = k / 7 * Math.PI * 2, a1 = (k + 1) / 7 * Math.PI * 2; tri(7, [0, 1, 0], [Math.cos(a1) * 0.5, 0.62, Math.sin(a1) * 0.5], [Math.cos(a0) * 0.5, 0.62, Math.sin(a0) * 0.5], 1, 1, 1); tri(7, [Math.cos(a0) * 0.5, 0.62, Math.sin(a0) * 0.5], [Math.cos(a1) * 0.5, 0.62, Math.sin(a1) * 0.5], [0, 0.66, 0], 1, 1, 1); }
    heart = null; return { P, Nn, S, Y };
  }
  function littleInit(realm) {
    const L = littleShapes();
    lgeo = new THREE.InstancedBufferGeometry();
    lgeo.setAttribute('position', new THREE.Float32BufferAttribute(L.P, 3)); lgeo.setAttribute('normal', new THREE.Float32BufferAttribute(L.Nn, 3));
    lgeo.setAttribute('aS', new THREE.Float32BufferAttribute(L.S, 1)); lgeo.setAttribute('aY', new THREE.Float32BufferAttribute(L.Y, 1));
    lmat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    lmat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U, { uTime: R3.U.time, uWind: R3.U.wind });
      sh.vertexShader = `attribute vec2 aCell; attribute float aS; attribute float aY;
        uniform sampler2D uMask; uniform sampler2D uGMap; uniform sampler2D uFMap; uniform sampler2D uH; uniform sampler2D uGust;
        uniform float uN; uniform vec2 uLOrigin; uniform vec3 uEye; uniform float uLR; uniform float uTime; uniform vec3 uWind;
        varying vec3 vLC;
        ${GH}
        ` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
        // (one cell of a metre: what lies in it, if anything — the kind of the ground, the leaves of the trees round it, how
        // near the water, and the hash of the place decide)
        vec2 lcell = uLOrigin + aCell;
        float q1 = gh(lcell, 21u), q2 = gh(lcell, 22u), q3 = gh(lcell, 23u), q4 = gh(lcell, 24u), q5 = gh(lcell, 25u);
        vec2 root = (lcell + vec2(0.1 + q1 * 0.8, 0.1 + q2 * 0.8)) * ${LCELL.toFixed(1)};
        vec2 tile = root / 4.0; ivec2 ti = clamp(ivec2(floor(tile)), ivec2(0), ivec2(int(uN) - 1));
        vec4 tk = texelFetch(uGMap, ti, 0); float kind = floor(tk.a * 255.0 + 0.5); vec4 fl = texelFetch(uFMap, ti, 0); vec4 mk = texelFetch(uMask, ti, 0);
        float pick = -1.0; float lit = fl.r, wet = fl.b;
        if (fl.g > 0.5 && !(kind > 9.5 && kind < 12.5) && kind != 15.0 && kind != 19.0) {
          bool green = kind < 1.5 || kind == 7.0 || kind == 17.0 || kind == 6.0 || kind == 8.0;
          if (green && q3 < mk.b * 0.9) pick = 4.0;                                                     // (a flower of the meadow)
          else if (green && lit > 0.25 && q3 < lit * (kind == 17.0 ? 0.12 : 0.45)) pick = kind == 17.0 ? 5.0 : 2.0; // (a leaf, a cone, under the trees)
          else if (green && lit > 0.4 && q3 > 0.94) pick = q4 < 0.5 && kind != 17.0 && kind != 7.0 ? 7.0 : 3.0;  // (a twig; a mushroom in the wet wood)
          else if (kind == 2.0 || kind == 3.0 || kind == 18.0) { if (q3 < 0.02 + wet * 0.1) pick = 6.0; else if (q3 > 0.975) pick = 0.0; } // (a shell where the sea reaches, a pebble now and then)
          else if (kind == 4.0 && q3 < 0.45) pick = q4 < 0.5 ? 1.0 : 0.0;                               // (the stones of stony ground)
          else if (kind != 5.0 && kind != 13.0 && q3 > 0.9 - (kind == 9.0 || kind == 16.0 ? 0.12 : 0.0)) pick = q4 < 0.25 ? 1.0 : 0.0; // (a pebble anywhere)
          else if (kind == 7.0 && q3 > 0.84) pick = 3.0;                                                 // (dry twigs in the savanna)
        }
        // (nothing lies here, or this point is of another of the shapes than the one that lies here: left out at once — each
        // cell holds every shape, and all but one would be drawn as a point)
        if (pick < -0.5 || abs(aS - pick) > 0.5) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        float gy = hAt(tile) * 1.5;
        // (nothing loose lying on the snow: under it)
        { vec4 sfm = pick > -0.5 ? texture2D(uFMap, tile / uN) : vec4(0.0); if (sfm.a > 0.004 && gSnowE(sfm, gNy, root, uGust) > 0.47) pick = -1.0; }
        float dist = length(vec3(root.x, gy, root.y) - uEye);
        float fade = 1.0 - smoothstep(uLR * 0.7, uLR, dist);
        float on = step(abs(aS - pick), 0.5) * fade;
        if (on <= 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; } // (under the snow, or out of the circle: the same)
        // (how big: a pebble of five to twelve centimetres, a leaf of eight, a twig of a forearm, a flower to the knee)
        float sz = pick == 0.0 ? 0.05 + q5 * 0.07 : pick == 1.0 ? 0.07 + q5 * 0.06 : pick == 2.0 ? 0.07 + q5 * 0.05 : pick == 3.0 ? 0.25 + q5 * 0.2 : pick == 4.0 ? 0.22 + q5 * 0.2 : pick == 5.0 ? 0.06 + q5 * 0.03 : pick == 6.0 ? 0.035 + q5 * 0.025 : 0.06 + q5 * 0.07;
        float ang = q4 * 6.2832 + q5 * 3.0; float ca = cos(ang), sa = sin(ang);
        vec3 objectNormal = vec3(ca * normal.x - sa * normal.z, normal.y, sa * normal.x + ca * normal.z);`)
        .replace('#include <begin_vertex>', `
        vec3 transformed;
        { vec3 p = position * sz * on; vec2 pr = vec2(ca * p.x - sa * p.z, sa * p.x + ca * p.z);
          // (the head of a flower nods in the wind)
          vec2 sw = pick == 4.0 ? uWind.xy * (sin(uTime * 2.1 + root.x * 0.7 + root.y * 0.5) * 0.5 + 0.6) * 0.05 * aY * on : vec2(0.0);
          transformed = vec3(root.x + pr.x + sw.x, gy + p.y - (pick == 0.0 || pick == 1.0 ? sz * 0.12 : 0.0), root.y + pr.y + sw.y); }
        // (its colour: stones grey and brown with the ground's tint, leaves from green to the browns of autumn, the cones
        // and twigs brown, the flowers of the meadow, the shells pale, the mushrooms red or brown with pale stems)
        { vec3 tc = tk.rgb; vec3 c;
          if (pick < 1.5) c = mix(vec3(0.3, 0.29, 0.27), vec3(0.2, 0.17, 0.13), q5) * mix(vec3(1.0), tc * 2.2, 0.25);
          else if (pick == 2.0) c = mix(mix(tc * 0.8, vec3(0.2, 0.1, 0.035), 0.55 + q1 * 0.4), vec3(0.3, 0.2, 0.05), step(0.72, q2) * 0.6);
          else if (pick == 3.0 || pick == 5.0) c = vec3(0.22, 0.14, 0.08) * (0.8 + q1 * 0.4);
          else if (pick == 4.0) { float fk = fract(q5 * 7.0); vec3 fc = fk < 0.25 ? vec3(0.95, 0.85, 0.2) : fk < 0.5 ? vec3(0.95, 0.95, 0.92) : fk < 0.75 ? vec3(0.85, 0.35, 0.5) : vec3(0.5, 0.42, 0.9); c = mix(tc * 0.7, fc, step(0.5, aY)); }
          else if (pick == 6.0) c = mix(vec3(0.85, 0.8, 0.72), vec3(0.8, 0.62, 0.55), q1);
          else c = mix(vec3(0.75, 0.7, 0.62), q1 < 0.5 ? vec3(0.6, 0.1, 0.06) : vec3(0.42, 0.26, 0.12), step(0.5, aY));
          vLC = c; }`);
      sh.fragmentShader = 'varying vec3 vLC;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = vLC;')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normal * faceDirection;');
    };
    lmat.customProgramCacheKey = () => 'grass3d-little';
    lmesh = new THREE.Mesh(lgeo, lmat); lmesh.frustumCulled = false; lmesh.receiveShadow = true; lmesh.castShadow = false; lmesh.visible = false;
    realm.scene().add(lmesh);
  }
  // the grid of clumps round the eye: side × side cells of half a metre
  function layout(R) {
    const n = Math.ceil(R * 2 / cell); if (n === side) return; side = n;
    const a = new Float32Array(n * n * 2); let k = 0; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { a[k++] = i; a[k++] = j; }
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(a, 2)); geo.instanceCount = n * n;
  }
  // (the grid of the small things: cells of a metre, round the body, a little nearer than the grass — its circle as wide as
  // the preset's share of the decoration (props) has it: the same things in the same places, the far ones left out)
  const littleR = q => LR * (Number.isFinite(q.props) ? Math.sqrt(G.clamp(q.props, 0.1, 1)) : 1);
  function layoutLittle(R) {
    const n = Math.ceil(R * 2 / LCELL); if (n === lside) return; lside = n;
    const a = new Float32Array(n * n * 2); let k = 0; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { a[k++] = i; a[k++] = j; }
    lgeo.setAttribute('aCell', new THREE.InstancedBufferAttribute(a, 2)); lgeo.instanceCount = n * n;
  }
  // the heights of the land as the world keeps them (its grid of corners, S.H) — read straight from it, sent again now and then
  function heights() {
    const S = G.S; const V = G.N + 1;
    if (hFor !== S || !hTex || hTex.image.width !== V) {
      if (hTex) hTex.dispose(); hFor = S;
      hTex = new THREE.DataTexture(S.H, V, V, THREE.RedFormat, THREE.FloatType); hTex.magFilter = hTex.minFilter = THREE.NearestFilter; hTex.generateMipmaps = false; hTex.flipY = false; hTex.needsUpdate = true;
      U.uH.value = hTex; hT = 0;
    }
  }
  GR.update = function (dt, focus, cam) {
    if (!mesh) return; const q = R3.Q();
    const R = q.grass ? q.field || 0 : 0; GR.on = R > 0 && !!G.Ground3D.grassMap();
    mesh.visible = GR.on; if (lmesh) lmesh.visible = GR.on && !!G.Ground3D.floorMap();
    if (!GR.on) { GR.clumps = 0; GR.bits = 0; return; }
    heights(); if ((hT += dt) > 3) { hT = 0; hTex.needsUpdate = true; } // (a change of the land — an earthquake, a reshaping — reaches it within seconds)
    // (the preset's density of the meadow — grassDen, the A5's: the share of the clumps drawn, each the fuller for it; a preset
    // without it draws them all, as before. What the grass costs goes with the count of its clumps, not with what each draws)
    const den = Number.isFinite(q.grassDen) ? G.clamp(q.grassDen, 0.25, 1) : 1; if (CELL / Math.sqrt(den) !== cell) { cell = CELL / Math.sqrt(den); side = 0; }
    U.uCell.value = cell;
    layout(R);
    U.uMask.value = G.Ground3D.grassMap(); U.uGMap.value = G.Ground3D.map(); U.uFMap.value = G.Ground3D.floorMap(); U.uN.value = G.N; U.uR.value = R;
    const e = cam ? cam.position : { x: focus.X, y: focus.Y, z: focus.Z }; U.uEye.value.set(e.x, e.y, e.z);
    U.uOrigin.value.set(Math.floor(e.x / cell) - side / 2, Math.floor(e.z / cell) - side / 2);
    if (lmesh && lmesh.visible) { const lr = littleR(q); U.uLR.value = lr; layoutLittle(lr); U.uLOrigin.value.set(Math.floor(e.x / LCELL) - lside / 2, Math.floor(e.z / LCELL) - lside / 2); GR.bits = lside * lside; } else GR.bits = 0;
    // (the people walking nearest part it too)
    const W3 = (G.People3D && G.People3D.walkers) || []; let j = 0;
    for (const w of W3) { if (j >= PUSH) break; if ((w[0] - e.x) ** 2 + (w[2] - e.z) ** 2 > R * R) continue; U.uPush.value[j++].set(w[0], w[1], w[2], 1); }
    for (; j < PUSH; j++) U.uPush.value[j].set(0, -1e4, 0, 0);
    GR.clumps = side * side;
  };
  // (for the tests: what is wrong in the drawing — a grid that does not cover its circle, an origin not a number, the small
  // things drawn without the floor picture that says where they may lie)
  GR.check = function () {
    const out = []; if (!mesh || !GR.on) return out;
    if (side * cell < U.uR.value * 2) out.push(`capim: a grade de ${side} casas não cobre o raio ${U.uR.value}`);
    for (const k of ['uOrigin', 'uLOrigin']) { const v = U[k].value; if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) out.push(`capim: ${k} não é número`); }
    if (lmesh && lmesh.visible && !U.uFMap.value) out.push('miudezas: desenhadas sem a pintura do chão');
    if (lmesh && lmesh.visible && lside * LCELL < U.uLR.value * 2) out.push(`miudezas: a grade de ${lside} não cobre o raio ${U.uLR.value}`);
    return out;
  };
})(window.G);
