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
//  is the god's colour of that tile, dark at the root and bright
//  at the tip. The wind of the world leans it and runs over it
//  in gusts — waves of light crossing the meadow — and the body
//  and the people walking part it. It thins out toward the edge
//  of its circle, where the ground's own grain takes over.
//  Only seen: nothing here touches the world.
// ============================================================
(function (G) {
  const GR = G.Grass3D = { on: false, clumps: 0 };
  let THREE = null, R3 = null, mesh = null, geo = null, mat = null, hTex = null, hFor = null, hT = 0, side = 0;
  const CELL = 0.5, PUSH = 6;
  const U = { uMask: { value: null }, uGMap: { value: null }, uH: { value: null }, uGust: { value: null }, uN: { value: 1 }, uOrigin: { value: null }, uEye: { value: null }, uR: { value: 20 }, uPush: { value: [] } };
  G.worldHooks.push(() => { hFor = null; });

  GR.init = function (three, realm) {
    THREE = three; R3 = realm;
    U.uOrigin.value = new THREE.Vector2(); U.uEye.value = new THREE.Vector3(); for (let k = 0; k < PUSH; k++) U.uPush.value.push(new THREE.Vector4());
    U.uGust.value = G.Ground3D.cloudNoise();
    // the clump: four blades from one root, each leaning its own way, three segments narrowing to a point
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
        uniform sampler2D uMask; uniform sampler2D uGMap; uniform sampler2D uH; uniform sampler2D uGust;
        uniform float uN; uniform vec2 uOrigin; uniform vec3 uEye; uniform float uR; uniform float uTime; uniform vec3 uWind; uniform vec4 uBody; uniform vec4 uPush[${PUSH}];
        varying vec3 vGC; varying float vGU;
        float gh(vec2 c, uint s) { uvec2 q = uvec2(ivec2(c) + 65536) * uvec2(1597334673u, 3812015801u); uint n = (q.x ^ q.y ^ (s * 2654435761u)) * 1597334673u; n ^= n >> 15; n *= 2246822519u; n ^= n >> 13; return float(n & 0xffffffu) / 16777216.0; }
        float hAt(vec2 t) { t = clamp(t, vec2(0.0), vec2(uN - 0.001)); ivec2 i = ivec2(floor(t)); vec2 f = t - vec2(i);
          float a = texelFetch(uH, i, 0).r, b = texelFetch(uH, i + ivec2(1, 0), 0).r, c = texelFetch(uH, i + ivec2(0, 1), 0).r, d = texelFetch(uH, i + ivec2(1, 1), 0).r;
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
        ` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
        // (one clump: where it stands in the world, what grows there, how the wind and the walkers bend it)
        vec2 gcell = uOrigin + aCell;
        float r1 = gh(gcell, 1u), r2 = gh(gcell, 2u), r3 = gh(gcell, 3u), r4 = gh(gcell, 4u);
        vec2 root = (gcell + vec2(r1, r2) * 0.92) * ${CELL.toFixed(2)};
        vec2 tile = root / 4.0; ivec2 ti = clamp(ivec2(floor(tile)), ivec2(0), ivec2(int(uN) - 1));
        vec4 mk = texelFetch(uMask, ti, 0); float kind = floor(mk.a * 255.0 + 0.5);
        float gy = hAt(tile) * 1.5;
        float dist = length(vec3(root.x, gy, root.y) - uEye);
        // (thinning toward the edge of the circle; and gone right at the eye, where a blade would fill the picture)
        float fade = (1.0 - smoothstep(uR * 0.6, uR, dist)) * smoothstep(1.3, 3.4, dist);
        float Hh = (0.1 + mk.g * 1.5) * (0.7 + r4 * 0.6) * step(r3, mk.r) * fade;
        float ang = r1 * 6.2832 + r3 * 2.0; float ca = cos(ang), sa = sin(ang);
        vec2 wd = uWind.xy; float ws = length(wd) + 1e-4; wd /= ws;
        float gust = smoothstep(0.42, 0.86, texture2D(uGust, (root - uWind.xy * uTime * 1.7) / 52.0).r);
        float sway = sin(uTime * (1.9 + uWind.z) + root.x * 0.35 + root.y * 0.27 + aB * 1.7 + r2 * 3.0) * 0.13;
        vec2 bend = wd * (0.16 + uWind.z * 0.22 + gust * (0.38 + uWind.z * 0.3)) + vec2(sway, sway * 0.6);
        vec2 push = vec2(0.0); float flt = 0.0;
        { vec2 dv = root - uBody.xz; float dd = length(dv); float k = uBody.w * (1.0 - smoothstep(0.3, 1.15, dd)); push += dv / max(dd, 1e-3) * k; flt = max(flt, k); }
        for (int j = 0; j < ${PUSH}; j++) { vec2 dv = root - uPush[j].xz; float dd = length(dv); float k = uPush[j].w * (1.0 - smoothstep(0.28, 0.85, dd)); push += dv / max(dd, 1e-3) * k * 0.8; flt = max(flt, k * 0.8); }
        vec3 bn = vec3(ca * normal.x - sa * normal.z, normal.y, sa * normal.x + ca * normal.z);
        vec3 objectNormal = normalize(vec3(bn.x * 0.35, 1.0, bn.z * 0.35));`)
        .replace('#include <begin_vertex>', `
        vec3 transformed;
        { vec2 pp = vec2(ca * position.x - sa * position.z, sa * position.x + ca * position.z) * (0.75 + r2 * 0.5) * (0.55 + 0.45 * fade);
          float u2 = aU * aU; vec2 off = (bend * 0.55 + push * 0.65) * u2 * Hh;
          transformed = vec3(root.x + pp.x + off.x, gy + aU * Hh * (1.0 - flt * 0.55) - 0.03 - u2 * length(bend) * 0.12 * Hh, root.y + pp.y + off.y); }
        // (its colour: the god's colour of the tile, dark at the root and bright and warm at the tip; brighter in a gust;
        // the savanna's gold, the reeds' grey-green; a flower now and then on the meadow)
        { vec3 tc = texelFetch(uGMap, ti, 0).rgb; vec3 tip = tc * vec3(1.16, 1.22, 0.84) + vec3(0.025, 0.035, 0.0);
          if (kind == 1.0) tip = mix(tip, vec3(0.74, 0.6, 0.28), 0.7); else if (kind == 2.0) tip = mix(tip, vec3(0.36, 0.42, 0.22), 0.6); else if (kind == 4.0) tip *= 0.85; else if (kind == 5.0) tip = mix(tip, vec3(0.62, 0.6, 0.36), 0.6);
          vec3 c = mix(tc * 0.5, tip, smoothstep(0.0, 1.0, aU)) * (1.0 + gust * 0.24 * aU);
          if (aB > 2.5 && r4 < mk.b * 1.2 && aU > 0.66) { float fk = fract(r2 * 7.0); c = fk < 0.25 ? vec3(0.95, 0.88, 0.3) : fk < 0.5 ? vec3(0.95, 0.95, 0.92) : fk < 0.75 ? vec3(0.85, 0.42, 0.55) : vec3(0.5, 0.45, 0.9); }
          vGC = c; vGU = aU; }`);
      sh.fragmentShader = 'varying vec3 vGC; varying float vGU;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = vGC;')
        .replace('#include <opaque_fragment>', `
        #if NUM_DIR_LIGHTS > 0
        // (the sun behind the blades shines through them)
        { float bl = saturate(dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += vGC * directionalLights[0].color * pow(bl, 3.0) * 0.35 * vGU; }
        #endif
        #include <opaque_fragment>`);
    };
    mat.customProgramCacheKey = () => 'grass3d';
    mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.receiveShadow = true; mesh.castShadow = false; mesh.visible = false;
    realm.scene().add(mesh);
  };
  // the grid of clumps round the eye: side × side cells of half a metre
  function layout(R) {
    const n = Math.ceil(R * 2 / CELL); if (n === side) return; side = n;
    const a = new Float32Array(n * n * 2); let k = 0; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { a[k++] = i; a[k++] = j; }
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(a, 2)); geo.instanceCount = n * n;
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
    mesh.visible = GR.on; if (!GR.on) { GR.clumps = 0; return; }
    heights(); if ((hT += dt) > 3) { hT = 0; hTex.needsUpdate = true; } // (a change of the land — an earthquake, a reshaping — reaches it within seconds)
    layout(R);
    U.uMask.value = G.Ground3D.grassMap(); U.uGMap.value = G.Ground3D.map(); U.uN.value = G.N; U.uR.value = R;
    const e = cam ? cam.position : { x: focus.X, y: focus.Y, z: focus.Z }; U.uEye.value.set(e.x, e.y, e.z);
    U.uOrigin.value.set(Math.floor(e.x / CELL) - side / 2, Math.floor(e.z / CELL) - side / 2);
    // (the people walking nearest part it too)
    const W3 = (G.People3D && G.People3D.walkers) || []; let j = 0;
    for (const w of W3) { if (j >= PUSH) break; if ((w[0] - e.x) ** 2 + (w[2] - e.z) ** 2 > R * R) continue; U.uPush.value[j++].set(w[0], w[1], w[2], 1); }
    for (; j < PUSH; j++) U.uPush.value[j].set(0, -1e4, 0, 0);
    GR.clumps = side * side;
  };
})(window.G);
