'use strict';
// ============================================================
//  FX3D: what moves in the world around the body and is not a
//  person or a beast — the fires that burn (S.fire: a house on
//  fire in the world is on fire here too), the rain and the snow
//  of the weather the world is having (S.weather), and the real
//  ships of S.ships on the water, each with its people's colour
//  on the sail. Only seen: nothing here touches the world, and
//  what flickers or falls draws from the view's own chance (G.VR).
// ============================================================
(function (G) {
  const W = G.W;
  const F3 = G.FX3D = { fires: 0, ships: 0, drops: 0, smoke: [] }; // (smoke: the roofs smoking this frame — [building, what burns, puffs a second], for the proofs)
  const SMK = [0, 0, 0];
  let THREE = null, R3 = null, scene = null, flame = null, glow = null, rain = null, rainP = null, hull = null, mast = null, sail = null, deck = null, streaks = null, rainL = null;
  const MAXF = 140, MAXS = 40, NR = 1600;
  const TAU = Math.PI * 2;
  const svis = new Map(); G.worldHooks.push(() => { svis.clear(); F3.smoke.length = 0; for (const pl of [PA, PG]) if (pl) pl.n = 0; emit.clear(); leafT = 0; ripN = 0; fpN = 0; steps.clear(); for (const f of falling.values()) R3.dropMesh(f.m); falling.clear(); lmOn = false; F3.lmSources = 0; if (R3 && R3.GX) R3.GX.gxLMB.value.w = 0; if (blob) blob.count = 0; });
  // ------------------------------ particles ------------------------------
  // (two pools of soft points: smoke, dust, leaves, chips, splashes, drawn over what is behind them; sparks and
  // fireflies, glowing. Each point: where, how fast, how long it lives, its size from birth to death, its colour, its
  // shape — a puff, a drop, a flake of wood or a leaf — how the air slows it, how it falls)
  const NP = 1600;
  function pool(add) {
    const P = { n: 0, add, x: new Float32Array(NP), y: new Float32Array(NP), z: new Float32Array(NP), vx: new Float32Array(NP), vy: new Float32Array(NP), vz: new Float32Array(NP), t: new Float32Array(NP), life: new Float32Array(NP),
      s0: new Float32Array(NP), s1: new Float32Array(NP), r: new Float32Array(NP), g: new Float32Array(NP), b: new Float32Array(NP), a: new Float32Array(NP), sh: new Float32Array(NP), drag: new Float32Array(NP), grav: new Float32Array(NP), wob: new Float32Array(NP), fade: new Float32Array(NP) };
    P.pos = new Float32Array(NP * 3); P.col = new Float32Array(NP * 4); P.size = new Float32Array(NP); P.shape = new Float32Array(NP);
    return P;
  }
  let PA = null, PG = null; const emit = new Map(); let leafT = 0, ripN = 0; const falling = new Map();
  // a new point (o: x, y, z, vx, vy, vz, life, s0, s1, c [r, g, b 0..1], a, sh 0 puff · 1 drop · 2 flake, drag, grav, wob, fade 0 linear · 1 in and out)
  function spawn(P, o) {
    if (!P) return; let k = P.n; if (k >= NP) { k = (G.vri(0, NP - 1)); } else P.n++;
    P.x[k] = o.x; P.y[k] = o.y; P.z[k] = o.z; P.vx[k] = o.vx || 0; P.vy[k] = o.vy || 0; P.vz[k] = o.vz || 0; P.t[k] = 0; P.life[k] = o.life || 1;
    P.s0[k] = o.s0 || 0.3; P.s1[k] = o.s1 === undefined ? P.s0[k] : o.s1; P.r[k] = o.c[0]; P.g[k] = o.c[1]; P.b[k] = o.c[2]; P.a[k] = o.a === undefined ? 1 : o.a; P.sh[k] = o.sh || 0; P.drag[k] = o.drag || 0; P.grav[k] = o.grav || 0; P.wob[k] = o.wob || 0; P.fade[k] = o.fade || 0;
  }
  F3.spawn = (o, add) => spawn(add ? PG : PA, o);
  function stepPool(P, dt, wx, wz, t) {
    let k = 0;
    while (k < P.n) {
      P.t[k] += dt; if (P.t[k] >= P.life[k]) { const j = --P.n; for (const f of ['x', 'y', 'z', 'vx', 'vy', 'vz', 't', 'life', 's0', 's1', 'r', 'g', 'b', 'a', 'sh', 'drag', 'grav', 'wob', 'fade']) P[f][k] = P[f][j]; continue; }
      const dr = Math.exp(-P.drag[k] * dt); P.vx[k] = P.vx[k] * dr + wx * (1 - dr); P.vz[k] = P.vz[k] * dr + wz * (1 - dr); P.vy[k] = P.vy[k] * (P.drag[k] > 0 ? dr : 1) - P.grav[k] * dt;
      P.x[k] += P.vx[k] * dt + (P.wob[k] ? Math.sin(t * 2.7 + k) * P.wob[k] * dt : 0); P.y[k] += P.vy[k] * dt; P.z[k] += P.vz[k] * dt + (P.wob[k] ? Math.cos(t * 2.1 + k * 1.3) * P.wob[k] * dt : 0);
      const f = P.t[k] / P.life[k];
      P.pos[k * 3] = P.x[k]; P.pos[k * 3 + 1] = P.y[k]; P.pos[k * 3 + 2] = P.z[k];
      const al = P.fade[k] ? Math.min(1, f * 6) * (1 - f) * 1.4 : 1 - f;
      P.col[k * 4] = P.r[k]; P.col[k * 4 + 1] = P.g[k]; P.col[k * 4 + 2] = P.b[k]; P.col[k * 4 + 3] = P.a[k] * Math.min(1, al);
      P.size[k] = P.s0[k] + (P.s1[k] - P.s0[k]) * f; P.shape[k] = P.sh[k];
      k++;
    }
    P.geo.setDrawRange(0, P.n);
    for (const a of ['position', 'aCol', 'aSize', 'aShape']) { const at = P.geo.attributes[a]; at.needsUpdate = true; }
  }
  const PVERT = `attribute float aSize; attribute vec4 aCol; attribute float aShape; uniform float uScale; varying vec4 vCol; varying float vShape; varying float vRot; varying float vFog; uniform float uFogN; uniform float uFogF;
    void main() { vCol = aCol; vShape = aShape; vRot = position.x * 3.1 + position.z * 1.7 + position.y * 2.3; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(aSize * uScale / max(0.2, -mv.z), 0.0, 220.0); vFog = smoothstep(uFogN, uFogF, -mv.z); }`;
  // (the colours of the points are given as the eye sees them; drawn in the light of everything else — linear, through the
  // same tone curve — so they are the same straight to the screen and through the post-processing)
  const PFRAG = `varying vec4 vCol; varying float vShape; varying float vRot; varying float vFog; uniform vec3 uFogC; uniform float uLit; uniform float uAdd;
    void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float a;
      if (vShape < 0.5) a = smoothstep(1.0, 0.15, dot(p, p)) * (0.75 + 0.25 * sin(vRot * 7.0 + p.x * 3.0) * sin(vRot * 5.0 + p.y * 3.0));
      else if (vShape < 1.5) a = smoothstep(1.0, 0.55, dot(p, p));
      else { float c = cos(vRot), s = sin(vRot); vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y); a = smoothstep(1.0, 0.75, q.x * q.x * 0.55 + q.y * q.y * 3.2); }
      a *= vCol.a; if (a < 0.01) discard;
      vec3 col = uAdd > 0.5 ? vCol.rgb * 1.6 : vCol.rgb * uLit; col *= col;
      gl_FragColor = vec4(mix(col, uFogC, vFog * (uAdd > 0.5 ? 0.6 : 1.0)), a * (1.0 - vFog * uAdd * 0.5));
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  let PU = null, ring = null, ringT = null;
  const NR2 = 60;
  function makePools() {
    PU = { uScale: { value: 600 }, uFogC: { value: new THREE.Color() }, uFogN: { value: 100 }, uFogF: { value: 500 }, uLit: { value: 1 }, gxGr: R3.GX.gxGr, gxTn: R3.GX.gxTn }; // (gxGr, gxTn: the grade's and the curve's dials, shared with every material)
    for (const add of [false, true]) {
      const P = pool(add); const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(P.pos, 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aCol', new THREE.BufferAttribute(P.col, 4).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('aSize', new THREE.BufferAttribute(P.size, 1).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aShape', new THREE.BufferAttribute(P.shape, 1).setUsage(THREE.DynamicDrawUsage)); g.setDrawRange(0, 0);
      const m = new THREE.ShaderMaterial({ uniforms: Object.assign({}, PU, { uAdd: { value: add ? 1 : 0 } }), vertexShader: PVERT, fragmentShader: PFRAG, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 4; scene.add(pts); P.geo = g;
      if (add) PG = P; else PA = P;
    }
    // ripples on the water: flat rings that open and fade (each ring's age in aT)
    const rg = new THREE.RingGeometry(0.82, 1, 24); rg.rotateX(-Math.PI / 2);
    ringT = new THREE.InstancedBufferAttribute(new Float32Array(NR2), 1); ringT.setUsage(THREE.DynamicDrawUsage); rg.setAttribute('aT', ringT);
    ring = new THREE.InstancedMesh(rg, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uLit: PU.uLit, gxGr: PU.gxGr, gxTn: PU.gxTn },
      vertexShader: 'attribute float aT; varying float vT; void main(){ vT = aT; float s = 0.25 + aT * 1.6; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position * vec3(s, 1.0, s), 1.0); }',
      fragmentShader: 'varying float vT; uniform float uLit; void main(){ vec3 c = vec3(0.92, 0.96, 1.0) * uLit; gl_FragColor = vec4(c * c, (1.0 - vT) * 0.45);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }), NR2);
    ring.count = 0; ring.frustumCulled = false; ring.renderOrder = 3; ring.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(ring); ring.userData.age = new Float32Array(NR2); ring.userData.max = new Float32Array(NR2); ring.userData.pos = new Float32Array(NR2 * 3);
    makeFeet();
  }
  // footprints in the snow, the sand, the mud of a path, the earth of a field: little hollows that fade
  const NFP = 160; let fp = null, fpN = 0; const steps = new Map();
  function makeFeet() {
    const g = new THREE.PlaneGeometry(0.15, 0.3); g.rotateX(-Math.PI / 2);
    const aT = new THREE.InstancedBufferAttribute(new Float32Array(NFP), 1); const aC = new THREE.InstancedBufferAttribute(new Float32Array(NFP), 1); aT.setUsage(THREE.DynamicDrawUsage); aC.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aT', aT); g.setAttribute('aC', aC);
    fp = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, uniforms: { uLit: PU.uLit, gxGr: PU.gxGr, gxTn: PU.gxTn },
      vertexShader: 'attribute float aT; attribute float aC; varying float vT; varying float vC; varying vec2 vUv; void main(){ vT = aT; vC = aC; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying float vT; varying float vC; varying vec2 vUv; uniform float uLit; void main(){ vec2 p = vUv * 2.0 - 1.0; float a = smoothstep(1.0, 0.6, dot(p, p)) * (1.0 - vT) * 0.5; vec3 c = (vC < 0.5 ? vec3(0.62, 0.7, 0.82) : vec3(0.32, 0.25, 0.18)) * uLit; gl_FragColor = vec4(c * c, a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }), NFP);
    fp.count = 0; fp.frustumCulled = false; fp.renderOrder = 1; fp.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(fp); fp.userData = { age: new Float32Array(NFP), max: new Float32Array(NFP), aT, aC };
  }
  function footprint(x, y, z, yaw, kind, life) { if (!fp) return; const k = fpN < NFP ? fpN++ : (() => { let o = 0; for (let q = 1; q < fpN; q++) if (fp.userData.age[q] / fp.userData.max[q] > fp.userData.age[o] / fp.userData.max[o]) o = q; return o; })();
    M.a.makeRotationY(-yaw + Math.PI / 2); M.a.setPosition(x, y, z); fp.setMatrixAt(k, M.a); fp.userData.age[k] = 0; fp.userData.max[k] = life; fp.userData.aC.array[k] = kind; fp.userData.aC.needsUpdate = true; fp.instanceMatrix.needsUpdate = true; }
  function stepFeet(dt) {
    if (!fp) return; const u = fp.userData; let k = 0;
    while (k < fpN) { u.age[k] += dt; if (u.age[k] >= u.max[k]) { const j = --fpN; u.age[k] = u.age[j]; u.max[k] = u.max[j]; u.aC.array[k] = u.aC.array[j]; fp.getMatrixAt(j, M.b); fp.setMatrixAt(k, M.b); continue; } u.aT.array[k] = u.age[k] / u.max[k]; k++; }
    fp.count = fpN; fp.instanceMatrix.needsUpdate = true; u.aT.needsUpdate = true; u.aC.needsUpdate = true;
    if (steps.size > 400) steps.clear(); // (the memory of who walked where, kept small)
  }
  // (whether snow lies where a foot comes down: the snow the land's shader lays — trodden off the paths, none on a road —
  // or, where the land cannot say, the cold's)
  const snowUnder = (X, Z, snow) => (G.Ground3D && G.Ground3D.snowXZ ? G.Ground3D.snowXZ(X, Z) > 0.5 : snow > 0.4);
  // (a step: every 0.72 m a walker goes on soft ground, a print — left, right — beside the line of the walk: a blue hollow
  // in the snow, a dark one in the earth beside it, where the cold land's paths are trodden bare)
  function walkPrints(id, X, Y, Z, yaw) {
    const S = G.S; const L = G.Space.TILE; const x = Math.floor(X / L), y = Math.floor(Z / L); if (!W.inb(x, y)) return; const i = y * G.N + x; const ty = S.type[i];
    let st = steps.get(id); if (!st) { st = { X, Z, side: 1 }; steps.set(id, st); return; }
    const d = Math.hypot(X - st.X, Z - st.Z); if (d < 0.72) return; if (d > 4) { st.X = X; st.Z = Z; return; } st.X = X; st.Z = Z; st.side = -st.side;
    if (ty <= G.T.RIVER || S.road[i]) return; const snow = R3.snowAt ? R3.snowAt(i) : 0; const b = S.occ[i] && S.buildings.get(S.occ[i]);
    const ox = -Math.sin(yaw) * 0.12 * st.side, oz = Math.cos(yaw) * 0.12 * st.side;
    const soft = snowUnder(X + ox, Z + oz, snow) ? 0 : snow > 0.4 || ty === G.T.SAND || G.pathLevel(S.wear[i]) >= 2 || (b && (b.type === 'farm' || b.type === 'horta' || b.type === 'plantacao')) ? 1 : -1; if (soft < 0) return;
    footprint(X + ox, W.hAt((X + ox) / L, (Z + oz) / L) * G.Space.HM + 0.03, Z + oz, yaw, soft, soft === 0 ? 30 : 14);
  }
  function ripple(x, y, z, life) { if (!ring) return; const k = ripN < NR2 ? ripN++ : G.vri(0, NR2 - 1); const u = ring.userData; u.age[k] = 0; u.max[k] = life || 1.2; u.pos[k * 3] = x; u.pos[k * 3 + 1] = y; u.pos[k * 3 + 2] = z; }
  F3.ripple = ripple;
  // (for the verifier: the pools within bounds, every point where a number is; every tree drawn falling is falling)
  F3.check = function () {
    const out = []; for (const P of [PA, PG]) { if (!P) continue; if (P.n < 0 || P.n > NP) out.push(`partículas: ${P.n} num poço de ${NP}`); for (let k = 0; k < P.n; k++) if (!Number.isFinite(P.x[k] + P.y[k] + P.z[k] + P.t[k])) { out.push(`partícula ${k}: posição inválida`); break; } }
    if (ripN < 0 || ripN > NR2) out.push(`anéis na água: ${ripN}`);
    if (fpN < 0 || fpN > NFP) out.push(`pegadas: ${fpN}`);
    for (const id of falling.keys()) { const t = G.S.trees.get(id); if (!t || t.stage !== 'fall') out.push(`árvore#${id} desenhada caindo, mas no mundo ${t ? t.stage : 'não existe'}`); }
    // (the lamps: as many as the quality has, each a number in its range)
    if (R3 && scene) { const want = lampsOf(R3.Q()); if (lamps.length !== want) out.push(`luzes das chamas: ${lamps.length}, a qualidade pede ${want}`); for (const l of lamps) if (!Number.isFinite(l.intensity) || l.intensity < 0 || l.intensity > 40) out.push(`luz de chama com intensidade ${l.intensity}`); }
    // (and the light of the hour, the air, the water's bed, the post-processing: their own lists, with the drawing's)
    if (R3 && R3.lightCheck) out.push(...R3.lightCheck());
    if (R3 && R3.GX) out.push(...lightCheck());
    if (blob && (blob.count < 0 || blob.count > NBL)) out.push(`sombras sob os pés: ${blob.count}`);
    if (hN < 0 || hN > MAXF) out.push(`halos das chamas: ${hN}`);
    if (G.Post3D && G.Post3D.check) out.push(...G.Post3D.check());
    return out;
  };
  F3.fallingN = () => falling.size;
  // (and whether one tree is drawn falling: a felled tree's own picture, among the others the woodcutters fell round the eye, T-1200)
  F3.fallingOf = id => falling.has(id);
  // how many puffs a second rise over a building's roof: none without a fire under it (G.Atmos.fire — a batch burning in the
  // kiln, the forge hot, the furnace of the baths, the tavern open, someone at the house's fire; the campfire's column is
  // its own); a kiln more than a kitchen, a kitchen more than a hearth one sits by, a hearth more at night and in the snow
  F3.smokeRate = function (b, night, snow) {
    const fr = G.Atmos && b.type !== 'campfire' ? G.Atmos.fire(b) : null; if (!fr) return 0;
    const kiln = fr.why === 'fornada' || fr.why === 'forja';
    return (kiln ? (b.type === 'forja' ? 4 : 2.6) : 1.4 + (night || 0) + (snow ? 0.8 : 0)) * fr.k;
  };
  // the light out of a doorway at night, how bright (0: dark): only with someone awake inside — as its panes, Build3D.night
  F3.doorLit = b => (LIT[b.type] && (!G.Atmos || G.Atmos.lit(b)) ? LIT[b.type] : 0);
  function stepRings(dt) {
    if (!ring) return; const u = ring.userData; let k = 0;
    while (k < ripN) { u.age[k] += dt; if (u.age[k] >= u.max[k]) { const j = --ripN; u.age[k] = u.age[j]; u.max[k] = u.max[j]; u.pos[k * 3] = u.pos[j * 3]; u.pos[k * 3 + 1] = u.pos[j * 3 + 1]; u.pos[k * 3 + 2] = u.pos[j * 3 + 2]; continue; }
      M.a.makeTranslation(u.pos[k * 3], u.pos[k * 3 + 1], u.pos[k * 3 + 2]); ring.setMatrixAt(k, M.a); ringT.array[k] = u.age[k] / u.max[k]; k++; }
    ring.count = ripN; ring.instanceMatrix.needsUpdate = true; ringT.needsUpdate = true;
  }
  // (an emitter's clock: true when it is time for another puff, at `rate` a second)
  function every(key, rate, dt) { let t = (emit.get(key) || 0) + dt * rate; let n = 0; while (t >= 1) { t -= 1; n++; } emit.set(key, t); return n; }
  F3.init = function (three, realm) {
    THREE = three; R3 = realm; scene = realm.scene();
    // (the hot core inside each flame: a small cone glowing — the tongues round it are made with the pools, below)
    const cone = new THREE.ConeGeometry(0.5, 1, 6); cone.translate(0, 0.5, 0);
    glow = new THREE.InstancedMesh(cone, new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }), MAXF);
    glow.count = 0; glow.frustumCulled = false; glow.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(glow);
    F3.quality(realm.Q());
    // snow: soft flakes falling round the eye (the rain, below, in streaks)
    rainP = new Float32Array(NR * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(rainP, 3));
    rain = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xc8d8e8, size: 0.09, transparent: true, opacity: 0, depthWrite: false })); rain.frustumCulled = false; scene.add(rain);
    for (let k = 0; k < NR; k++) { rainP[k * 3] = (G.VR() - 0.5) * 60; rainP[k * 3 + 1] = G.VR() * 30; rainP[k * 3 + 2] = (G.VR() - 0.5) * 60; }
    // (rain falls in streaks, snow in flakes)
    rainL = new Float32Array(NR * 6); const gs = new THREE.BufferGeometry(); gs.setAttribute('position', new THREE.BufferAttribute(rainL, 3).setUsage(THREE.DynamicDrawUsage)); gs.setDrawRange(0, 0);
    streaks = new THREE.LineSegments(gs, new THREE.LineBasicMaterial({ color: 0xb8c6d4, transparent: true, opacity: 0, depthWrite: false })); streaks.frustumCulled = false; streaks.visible = false; scene.add(streaks);
    // ships: a hull, a deck house, a mast and a sail each (instanced, coloured by their people)
    const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
    const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 6); cyl.translate(0, 0.5, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // (a hull with a bow and a stern: the clinker-built one made in the Blender (G.MESH3D.casco: strakes overlapping down
    // the sides, the stem and the sternpost rising in scrolls) in the same unit frame — one long, one wide, the keel on the
    // frame's floor, the bow toward +x — and until it is loaded, the faceted one: wide amidships, drawn to a point forward,
    // rounder aft, narrower at the keel than at the gunwale)
    const hg = (G.Mesh3D && G.Mesh3D.geo && G.Mesh3D.geo('casco')) || (() => {
      const g = new THREE.BufferGeometry(); const P = [];
      const sec = [[-0.5, 0.32, 0.18], [-0.32, 0.46, 0.3], [0, 0.5, 0.34], [0.28, 0.44, 0.26], [0.42, 0.26, 0.1], [0.52, 0.02, 0.0]]; // [x, half-width at the gunwale, half-width at the keel]
      for (let k = 0; k < sec.length - 1; k++) { const a = sec[k], b = sec[k + 1];
        for (const sd of [-1, 1]) { const q = [[a[0], 1, sd * a[1]], [b[0], 1, sd * b[1]], [b[0], 0, sd * b[2]], [a[0], 0, sd * a[2]]]; const t = sd > 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]; for (const i of t) P.push(...q[i]); }
        P.push(a[0], 0, -a[2], b[0], 0, -b[2], b[0], 0, b[2], a[0], 0, -a[2], b[0], 0, b[2], a[0], 0, a[2]);
        P.push(a[0], 1, -a[1], a[0], 1, a[1], b[0], 1, b[1], a[0], 1, -a[1], b[0], 1, b[1], b[0], 1, -b[1]); }
      const a = sec[0]; P.push(a[0], 0, -a[2], a[0], 0, a[2], a[0], 1, a[1], a[0], 0, -a[2], a[0], 1, a[1], a[0], 1, -a[1]);
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); return g;
    })();
    // (a sail that bellies in the wind: a strip of a cylinder)
    const sg = new THREE.CylinderGeometry(1.6, 1.6, 1, 10, 1, true, -0.32, 0.64); sg.translate(0, 0.5, -1.6); sg.rotateY(Math.PI / 2); sg.scale(1, 1, 1);
    hull = new THREE.InstancedMesh(hg, new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), MAXS); deck = new THREE.InstancedMesh(box, mat, MAXS); mast = new THREE.InstancedMesh(cyl, mat, MAXS); sail = new THREE.InstancedMesh(sg, new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), MAXS);
    for (const m of [hull, deck, mast, sail]) { m.count = 0; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); }
    makePools(); makeBlobs(); makeHalos(); makeFlames(); makeWater(); // (makeWater: the water's own batches — 21c)
  };
  // ------------------------------ the flames ------------------------------
  // (a flame: tongues of fire on three crossed cards — torn at the edge by a noise rising through them, white-gold at the
  // heart and the foot, orange, then red where they thin out at the tips — each tongue its own seed, height and sway, the
  // hot core glowing inside; the campfire's embers drift up out of it. Lit by nothing: it is the light)
  let fSeed = null;
  function makeFlames() {
    const P = [], UV = [];
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI, c = Math.cos(a) * 0.5, s = Math.sin(a) * 0.5;
      const q = [[-c, 0, -s, 0, 0], [c, 0, s, 1, 0], [c, 1, s, 1, 1], [-c, 1, -s, 0, 1]];
      for (const i of [0, 1, 2, 0, 2, 3]) { P.push(q[i][0], q[i][1], q[i][2]); UV.push(q[i][3], q[i][4]); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    const sd = new THREE.InstancedBufferAttribute(fSeed = new Float32Array(MAXF), 1); sd.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aSeed', sd);
    flame = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, // (it adds its light and hides a little of what is behind it: seen by day, glowing by night)
      uniforms: { uT: R3.U.time, uFogN: PU.uFogN, uFogF: PU.uFogF, uFogC: PU.uFogC, gxGr: PU.gxGr, gxTn: PU.gxTn },
      vertexShader: `attribute float aSeed; uniform float uFogN; uniform float uFogF; varying vec2 vUv; varying float vSeed; varying float vFog;
        void main() { vUv = uv; vSeed = aSeed; vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vFog = smoothstep(uFogN, uFogF, -mv.z); }`,
      fragmentShader: `uniform float uT; uniform vec3 uFogC; varying vec2 vUv; varying float vSeed; varying float vFog;
        float fh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float fn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(fh(i), fh(i + vec2(1.0, 0.0)), f.x), mix(fh(i + vec2(0.0, 1.0)), fh(i + vec2(1.0, 1.0)), f.x), f.y); }
        void main() {
          float x = vUv.x - 0.5, y = vUv.y, t = uT * 2.4 + vSeed * 31.0;
          // (the noise rising through it, at two sizes; the tongue swaying more toward its tip, widest a little above its foot, to a point)
          float n = fn(vec2(x * 3.5 + vSeed * 7.0, y * 2.6 - t)) * 0.65 + fn(vec2(x * 8.0 - vSeed * 3.0, y * 5.5 - t * 1.6)) * 0.35;
          float sw = (fn(vec2(vSeed * 5.0, t * 0.35)) - 0.5) * 0.3 * y * y;
          float hw = 0.46 * pow(max(1.0 - y, 0.0), 0.75) * smoothstep(0.0, 0.12, y + 0.02);
          float e = abs(x - sw) / max(hw, 1e-3) + (n - 0.5) * (0.35 + y * 1.4);
          float a = (1.0 - smoothstep(0.6, 1.0, e)) * (1.0 - smoothstep(0.62, 1.0, y + (n - 0.5) * 0.45));
          if (a < 0.02) discard;
          // (its heat: white-gold at the heart and the foot, then orange, red at the thinning edges and the tips — brighter than
          // white only at the very heart, so the gradient shows and the glow of the high qualities still catches it)
          float h = clamp((1.0 - e) * 1.2 * (1.0 - y * 0.8) + (n - 0.5) * 0.35, 0.0, 1.0);
          vec3 c = mix(vec3(0.5, 0.05, 0.01), vec3(1.0, 0.34, 0.04), smoothstep(0.05, 0.45, h));
          c = mix(c, vec3(1.0, 0.8, 0.4), smoothstep(0.55, 0.95, h)) * (1.15 + h * 1.5);
          c = mix(c, uFogC, vFog * 0.6);
          gl_FragColor = vec4(c * a, a * (0.45 + 0.35 * h));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }), MAXF);
    flame.count = 0; flame.frustumCulled = false; flame.renderOrder = 4; flame.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(flame);
  }
  // (one tongue of a flame: its foot, its width, its height, turned by its seed — and the core glowing inside the first)
  function tongue(n, X, Y, Z, w, h, seed, core) {
    M.a.makeRotationY(seed * TAU); M.a.scale(M.v.set(w, h, w)); M.a.setPosition(X, Y, Z); flame.setMatrixAt(n, M.a); fSeed[n] = seed;
    if (core) { M.a.makeScale(w * 0.42, h * 0.55, w * 0.42); M.a.setPosition(X, Y, Z); glow.setMatrixAt(n, M.a); } else glow.setMatrixAt(n, M.z);
  }
  // ------------------------------ the lights of the flames ------------------------------
  // a few point lights — as many as the quality has (every material pays for each one, by day too) — given each frame to the
  // strongest light round the body: a fire, the torches and lanterns in hands, the campfires, and at night the doors and
  // windows of the houses near it; each eases out of one place before it goes to the next (no light jumps), and a flame's
  // flickers. Only seen: what lights the drawing is what the world has burning or lit
  let lamps = [];
  // (how many real lights the quality gives the flames: none in the lightest — the painted light carries them all there)
  const lampsOf = q => G.clamp(q && Number.isFinite(q.lights) ? q.lights | 0 : 2, 0, 6);
  const FIRE = [1, 0.54, 0.23], TORCH = [1, 0.63, 0.29], HEARTH = [1, 0.66, 0.36], CANDLE = [1, 0.76, 0.46];
  // (the houses whose windows the night lights, and how bright their doorways are)
  const LIT = { hut: 0.8, house: 1, sobrado: 1, insula: 1, quarteirao: 1, barraco: 0.5, taverna: 1.5, workshop: 0.8, forja: 1.3, olaria: 0.8, temple: 1.1, palacio: 1.3, paco: 1.2, administracao: 0.8, biblioteca: 0.8, cadeia: 0.6, quartel: 0.8, banhos: 0.9 };
  // (a real light falls off as the painted one does — with the square of the distance — and is as bright as it two metres
  // off: a flame handed from the painted light to a lamp, or back, keeps the size of its pool; a campfire lights the ring
  // round it, not the square beyond)
  const LAMP = F3.LAMP = { decay: 2, k: 1.4 }; // (dials, for the photos that compare)
  // (the first of them, in the Alta and the Ultra, with a picture of the shadows of what stands in the insides — the walls, the
  // pieces, the leaves: their meshes on the layer of the insides, G.Luz3D.LAYER —, only for a flame of an inside, made again when
  // its flame changes, a leaf turns or a fifth of a second has gone by, never more: D-707)
  F3.quality = function (q) {
    if (!scene) return; const n = lampsOf(q); const ns = Math.min(n, (q && q.shadows ? q.lshadow | 0 : 0));
    // (the lights with their pictures first — three.js orders them so: the masks follow its order — and as many as the quality says,
    // always: a picture more or less makes every material again)
    if (lamps.length !== n || lamps.filter(l => l.castShadow).length !== ns) { while (lamps.length) { const l = lamps.pop(); scene.remove(l); l.dispose(); } }
    while (lamps.length < n) { const l = new THREE.PointLight(0xffa04a, 0, 16, LAMP.decay); l.userData = { key: '', cur: 0, want: 0, X: 0, Y: -1e4, Z: 0, sh: lamps.length < ns };
      if (l.userData.sh) { l.castShadow = true; l.shadow.mapSize.set(512, 512); l.shadow.camera.near = 0.05; l.shadow.camera.far = 14; l.shadow.bias = -0.003; l.shadow.normalBias = 0.02; l.shadow.radius = 2; l.shadow.autoUpdate = false; l.shadow.needsUpdate = false;
        l.shadow.camera.layers.set(G.Luz3D ? G.Luz3D.LAYER : 6); }
      l.position.set(0, -1e4, 0); scene.add(l); lamps.push(l); }
  };
  let shadeT = 0;
  // (a light's picture of the shadows made again: when its flame or its place changed, when a leaf of a door turns, five times a second)
  function shadeLamps(rdt) {
    shadeT += rdt; const due = shadeT > 0.2 || (G.Build3D && G.Build3D.leavesMoving && G.Build3D.leavesMoving()); if (due) shadeT = 0;
    for (const l of lamps) { if (!l.castShadow) continue; const u = l.userData; const moved = u.shKey !== u.key || Math.abs((u.shX || 0) - u.X) + Math.abs((u.shZ || 0) - u.Z) > 0.02;
      if ((moved || due) && l.intensity > 0) { u.shDue = true; u.shKey = u.key; u.shX = u.X; u.shZ = u.Z; } }
  }
  // (the lights whose picture of the shadows is due this frame — the realm draws them in a pass of their own, with only the insides'
  // meshes casting: three.js's own pass would take the whole town round each light six times)
  F3.shadeDue = () => lamps.filter(l => l.castShadow && l.userData.shDue);
  F3.lamps = () => lamps.map(l => ({ key: l.userData.key, i: +l.intensity.toFixed(2), at: [+l.position.x.toFixed(1), +l.position.y.toFixed(1), +l.position.z.toFixed(1)] }));
  // the sources of this frame ([score, key, X, Y, Z, intensity, reach, colour, flicker]) to the lamps
  function lightUp(src, dt) {
    src.sort((a, b) => b[0] - a[0]); const top = src.slice(0, lamps.length); const used = new Set();
    // (a lamp keeps its source while it is still among the strongest — a torch that moved a little is the same torch)
    for (const l of lamps) { const u = l.userData; if (!u.key) continue;
      let m = top.find(s => !used.has(s) && s[1] === u.key); if (!m && u.key[0] === 't') m = top.find(s => !used.has(s) && s[1][0] === 't' && (s[2] - u.X) ** 2 + (s[4] - u.Z) ** 2 < 2.5);
      if (m) { used.add(m); u.key = m[1]; u.X = m[2]; u.Y = m[3]; u.Z = m[4]; u.want = m[5]; u.fl = m[8]; u.bid = m[9] || 0; u.spill = m[10] || 0; l.distance = m[6]; l.color.setRGB(m[7][0], m[7][1], m[7][2]); } else u.want = 0; }
    // (the new ones to the lamps that are free — a lamp still fading out of its old place waits)
    for (const s of top) { if (used.has(s)) continue; const free = q => !q.userData.key || (q.userData.want === 0 && q.userData.cur < 0.05);
      const l = s[9] ? lamps.find(q => q.userData.sh && free(q)) || lamps.find(q => !q.userData.sh && free(q)) : lamps.find(q => !q.userData.sh && free(q)); if (!l) continue;
      const u = l.userData; used.add(s); u.key = s[1]; u.X = s[2]; u.Y = s[3]; u.Z = s[4]; u.cur = 0; u.want = s[5]; u.fl = s[8]; u.bid = s[9] || 0; u.spill = s[10] || 0; l.distance = s[6]; l.color.setRGB(s[7][0], s[7][1], s[7][2]); }
    const k = 1 - Math.exp(-9 * dt);
    for (const l of lamps) { const u = l.userData; u.cur += (u.want - u.cur) * k; if (u.want === 0 && u.cur < 0.02) { u.cur = 0; u.key = ''; }
      l.position.set(u.X, u.Y, u.Z); l.decay = LAMP.decay; l.intensity = u.cur > 0.01 ? u.cur * LAMP.k * (1 + (G.VR() - 0.5) * 2 * (u.fl || 0)) : 0; }
    lampMasks(); shadeLamps(dt);
  }
  // (each point light of the scene says where its light may go — the sky's gxLamp, in three.js's own order of the lights: those
  // with a picture of the shadows first, then as they stand in the scene: a flame of an inside lights its own rooms, never the
  // street nor another building; every other light is of the open air, and comes into a room only through its openings —
  // G.Luz3D, D-701. And which insides have a real light on one of their flames: the baked fill carries less of their fire there)
  F3.litIn = new Set();
  function lampMasks() {
    const GX = R3.GX; if (!GX || !GX.gxLamp) return; const M = GX.gxLamp.value; const Lz = G.Luz3D; F3.litIn.clear();
    const pts = []; for (const o of scene.children) if (o.isPointLight) pts.push(o);
    pts.sort((a, c) => (c.castShadow ? 1 : 0) - (a.castShadow ? 1 : 0)); // (stable: three.js's own order)
    M.fill(-1); for (let k = 0; k < pts.length && k < 8; k++) { const u = pts[k].userData || {}; const s = u.bid && Lz && Lz.slotOf ? Lz.slotOf(u.bid) : -1;
      M[k * 4] = u.mask = u.bid ? (s >= 0 ? s : 9) : -1; M[k * 4 + 1] = pts[k].castShadow ? 1 : 0; if (u.bid && u.cur > 0.3) F3.litIn.add(u.bid);
      // (the light a lit doorway or window throws on the street is its room's light going out: never back in through its own openings)
      const sp = u.spill && Lz && Lz.slotOf ? Lz.slotOf(u.spill) : -1; M[k * 4 + 2] = sp; }
  }
  // (for the verifier: the flames' lights, the building each burns in and the volume its mask says)
  F3.lampsIn = () => lamps.map(l => ({ bid: l.userData.bid || 0, i: l.intensity, mask: l.userData.mask, sh: !!l.castShadow }));
  // ------------------------------ the light of every flame, painted ------------------------------
  // (every flame and lit doorway round the body lights what is round it — the pool of warm light round a campfire, the
  // street before a lit door, the wall by a torch — without a light of its own, which every material would pay for: their
  // light is painted here each frame into the realm's picture of it (R3.LM: a texel a metre over the land round the body;
  // its colour, and the light-weighted place it comes from) and every lit material reads it (realm3d: gxLM). The few real
  // lights still take the strongest and nearest — their flicker, their true direction on a face — and what a lamp holds is
  // taken out of the picture as it eases in: nothing is lit twice, nothing jumps)
  const LMAX = 16, LSPAN = 32; let lmAcc = null, lmOn = false;
  F3.lmOn = true; // (for the tests: the painted light can be switched off)
  function paintLight(src, focus) {
    const LM = R3.LM; if (!LM) return; const n = LM.n, s = LM.m, GX = R3.GX; const B = GX.gxLMB.value, Y = GX.gxLMY.value;
    if (!lmAcc || lmAcc.length !== n * n * 7) lmAcc = new Float32Array(n * n * 7);
    // (the picture follows the body a whole texel at a time: walking, the pools of light do not crawl)
    const x0 = (Math.round(focus.X / s) - n / 2) * s, z0 = (Math.round(focus.Z / s) - n / 2) * s, yr = (focus.Y || 0) + 1; // (heights kept from a little over the body's: LSPAN/2 above and below)
    let any = 0; const A = lmAcc;
    if (F3.lmOn && R3.scene().scale.y > 0.98) for (const q of src) {
      if (q[9]) continue; // (a flame of an inside: its light is the inside's own, baked with its walls — G.Luz3D)
      if (q[10] && G.Luz3D && G.Luz3D.slotOf(q[10]) >= 0) continue; // (the light out of a lit doorway or window of an inside drawn: its room's own, on the street the real lights carry it)
      let I = q[5]; for (const l of lamps) if (l.userData.key === q[1]) I -= l.userData.cur;
      I *= 1 + (G.VR() - 0.5) * 2 * q[8] * 0.6; if (I < 0.03) continue;
      const X = q[2], Z = q[4], c = q[7], R = q[6] * 0.85, R2 = R * R, dy = q[3] - yr;
      const i0 = Math.max(0, Math.floor((X - R - x0) / s)), i1 = Math.min(n - 1, Math.ceil((X + R - x0) / s)), j0 = Math.max(0, Math.floor((Z - R - z0) / s)), j1 = Math.min(n - 1, Math.ceil((Z + R - z0) / s));
      if (i0 > i1 || j0 > j1) continue;
      if (!any) A.fill(0); any++;
      const cl = c[0] * 0.3 + c[1] * 0.6 + c[2] * 0.1;
      for (let j = j0; j <= j1; j++) { const dz = Z - (z0 + (j + 0.5) * s);
        for (let i = i0; i <= i1; i++) { const dx = X - (x0 + (i + 0.5) * s); const d2 = dx * dx + dz * dz; if (d2 >= R2) continue;
          let w = 1 - d2 / R2; w *= w * I; const o = (j * n + i) * 7; const wl = w * cl;
          A[o] += c[0] * w; A[o + 1] += c[1] * w; A[o + 2] += c[2] * w; A[o + 3] += wl; A[o + 4] += wl * dx; A[o + 5] += wl * dy; A[o + 6] += wl * dz; } }
    }
    if (!any) { if (lmOn) { lmOn = false; B.w = 0; } return; }
    const D1 = LM.tex.image.data, D2 = LM.tex2.image.data; const enc = v => (v <= -0.5 ? 0 : v >= 0.5 ? 255 : Math.round((v + 0.5) * 255));
    for (let k = 0, o = 0, p = 0; k < n * n; k++, o += 7, p += 4) {
      const wl = A[o + 3];
      if (wl < 1e-5) { D1[p] = D1[p + 1] = D1[p + 2] = 0; D2[p] = D2[p + 1] = D2[p + 2] = 128; continue; }
      D1[p] = Math.min(255, Math.round(Math.sqrt(A[o] / LMAX) * 255)); D1[p + 1] = Math.min(255, Math.round(Math.sqrt(A[o + 1] / LMAX) * 255)); D1[p + 2] = Math.min(255, Math.round(Math.sqrt(A[o + 2] / LMAX) * 255));
      D2[p] = enc(A[o + 4] / wl / LSPAN); D2[p + 1] = enc(A[o + 6] / wl / LSPAN); D2[p + 2] = enc(A[o + 5] / wl / LSPAN);
    }
    LM.tex.needsUpdate = true; LM.tex2.needsUpdate = true; lmOn = true;
    B.x = x0; B.y = z0; B.z = 1 / (n * s); B.w = R3.scene().scale.y; Y.x = yr; Y.y = LMAX; Y.z = LSPAN;
    F3.lmSources = any;
  }
  // (for the verifier: the painted light where the body is, its numbers numbers)
  function lightCheck() {
    const out = []; const B = R3.GX.gxLMB.value, Y = R3.GX.gxLMY.value;
    for (const v of [B.x, B.y, B.z, B.w, Y.x, Y.y, Y.z]) if (!Number.isFinite(v)) { out.push('luz pintada: um número que não é número'); break; }
    const LM = R3.LM; if (LM && B.w > 0 && Math.abs(B.z * LM.n * LM.m - 1) > 1e-6) out.push(`luz pintada com o tamanho errado: 1/${(1 / B.z).toFixed(1)} m, a imagem tem ${LM.n * LM.m} m`);
    return out;
  }
  // ------------------------------ the glow round a flame ------------------------------
  // (the air round a flame glows — a soft warm halo, strong at night, faint by day; where the post-processing makes its own
  // glow of what is brighter than white, only a little: a torch carried down a dark street reads from far off)
  let haloPts = null, hN = 0; const hP = new Float32Array(MAXF * 3), hA = new Float32Array(MAXF * 4);
  function halo(X, Y, Z, size, k, seed) { if (hN >= MAXF) return; hP[hN * 3] = X; hP[hN * 3 + 1] = Y; hP[hN * 3 + 2] = Z; hA[hN * 4] = size; hA[hN * 4 + 1] = k; hA[hN * 4 + 2] = G.hash(seed * 7 + 1); hA[hN * 4 + 3] = 0; hN++; }
  function makeHalos() {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(hP, 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aH', new THREE.BufferAttribute(hA, 4).setUsage(THREE.DynamicDrawUsage)); g.setDrawRange(0, 0);
    haloPts = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uScale: PU.uScale, uFogN: PU.uFogN, uFogF: PU.uFogF, uT: R3.U.time, uK: { value: 1 }, uCol: { value: new THREE.Color(1, 0.5, 0.2) }, gxGr: PU.gxGr, gxTn: PU.gxTn },
      vertexShader: `attribute vec4 aH; uniform float uScale; uniform float uFogN; uniform float uFogF; uniform float uT; uniform float uK; varying float vI;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aH.x * uScale / max(0.4, -mv.z), 0.0, 420.0);
          vI = aH.y * uK * (0.88 + 0.12 * sin(uT * 13.0 + aH.z * 40.0)) * (1.0 - smoothstep(uFogN, uFogF, -mv.z)); }`,
      fragmentShader: `uniform vec3 uCol; varying float vI; void main() { vec2 p = gl_PointCoord * 2.0 - 1.0; float r2 = dot(p, p); if (r2 > 1.0) discard;
        float a = (exp(-r2 * 4.5) - 0.011) * vI; gl_FragColor = vec4(uCol * max(a, 0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }` }));
    haloPts.frustumCulled = false; haloPts.renderOrder = 5; scene.add(haloPts);
  }
  function stepHalos(nightK) {
    if (!haloPts) return; const q = R3.Q();
    haloPts.material.uniforms.uK.value = (0.12 + 0.88 * nightK) * (q.bloom ? 0.45 : 1);
    haloPts.geometry.setDrawRange(0, hN); haloPts.geometry.attributes.position.needsUpdate = true; haloPts.geometry.attributes.aH.needsUpdate = true;
  }
  // ------------------------------ the shade under the feet ------------------------------
  // (the ground right under a body is where neither the sky nor the sun reaches: a soft dark patch under the feet of each one
  // drawn whole — the sun's shadow says where the light comes from, this one that the feet stand on the ground. Darker where
  // the quality draws no shadows, as the people would float on the land without it)
  const NBL = 48; let blob = null;
  function makeBlobs() {
    const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2);
    blob = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, uniforms: { uK: { value: 0.3 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec2 vUv; uniform float uK; void main(){ vec2 p = vUv * 2.0 - 1.0; float a = exp(-dot(p, p) * 3.4) * uK * (1.0 - smoothstep(0.85, 1.0, length(p))); gl_FragColor = vec4(0.0, 0.0, 0.0, a); }' }), NBL);
    blob.count = 0; blob.frustumCulled = false; blob.renderOrder = 1; blob.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(blob);
  }
  function stepBlobs() {
    if (!blob) return; const sh = R3.renderer().shadowMap.enabled; let n = 0;
    blob.material.uniforms.uK.value = sh ? (R3.Q().ao ? 0.16 : 0.26) : 0.5; const sz = sh ? 0.95 : 1.25; // (lighter where the post's shade already gathers under them)
    const put = (X, Y, Z, k) => { if (n >= NBL || k <= 0.02) return; M.a.makeScale(sz * k, 1, sz * k); M.a.setPosition(X, Y + 0.03, Z); blob.setMatrixAt(n++, M.a); };
    const av = G.People3D && G.People3D.avatar;
    if (av && !av.swim && Number.isFinite(av.X)) { const g = W.hAt(av.X / G.Space.TILE, av.Z / G.Space.TILE) * G.Space.HM; const up = av.ground === false ? Math.max(0, (av.Y || 0) - g) : 0; put(av.X, av.ground === false ? g : av.Y || g, av.Z, 1 - up / 1.2); }
    if (G.People3D && G.People3D.walkers) for (const p of G.People3D.walkers) put(p[0], p[1], p[2], 1);
    blob.count = n; blob.instanceMatrix.needsUpdate = true;
  }
  const M = {}; const mats = () => { if (M.a) return; M.a = new THREE.Matrix4(); M.b = new THREE.Matrix4(); M.c = new THREE.Color(); M.v = new THREE.Vector3(); M.z = new THREE.Matrix4().makeScale(0, 0, 0); };
  // (ship sizes, metres: [length, beam, mast])
  const SHIP = { pesca: [5, 1.8, 4], canoa: [4, 1.1, 0], jangada: [3.5, 2.4, 2], explorador: [11, 3.2, 9], mercante: [13, 3.8, 10], guerra: [15, 4, 12], transporte: [13, 4, 10] };
  F3.update = function (rdt, focus) {
    if (!flame || !focus) return; mats();
    const S = G.S; const L = G.Space.TILE, H = G.Space.HM; const t = performance.now() / 1000;
    // ---- fire: the burning tiles near the eye
    let n = 0, best = 0, bx = 0, by = 0, bz = 0, bi = -1; const src = []; hN = 0;
    const near2 = (X, Z) => (X - focus.X) ** 2 + (Z - focus.Z) ** 2;
    const x0 = Math.floor(focus.X / L), y0 = Math.floor(focus.Z / L), R = 16;
    if (G.Nature && G.Nature.fireSet && G.Nature.fireSet.size) {
      for (const i of G.Nature.fireSet) {
        const f = S.fire[i]; if (f < 0.08) continue; const x = i % G.N, y = (i / G.N) | 0; if (Math.abs(x - x0) > R || Math.abs(y - y0) > R) continue;
        const top = G.Build3D ? G.Build3D.heightAt(i) : 0; const gY = W.maxH(x, y, 1, 1) * H + (top ? top * 0.75 : 0);
        for (let k = 0; k < 3 && n < MAXF; k++) {
          const px = (x + 0.25 + G.hash(i * 3 + k) * 0.5) * L, pz = (y + 0.25 + G.hash(i * 5 + k) * 0.5) * L; const fl = 0.75 + Math.sin(t * (7 + k) + i) * 0.18 + G.VR() * 0.12;
          const hgt = (1.2 + f * 2.6) * fl, wd = 0.7 + f * 1.2;
          tongue(n, px, gY, pz, wd * 1.1, hgt * 1.15, G.hash(i * 3 + k), k === 0); n++;
          if (k === 0) halo(px, gY + hgt * 0.45, pz, 2.6 + f * 3, 0.55, i);
        }
        if (f > best) { best = f; bx = (x + 0.5) * L; by = gY + 2; bz = (y + 0.5) * L; bi = i; }
      }
    }
    if (best > 0) src.push([18 * best / (1 + near2(bx, bz) / 900), 'f' + bi, bx, by, bz, 18 * best, 26, FIRE, 0.15]);
    // (night: how much the windows are lit — as the realm lights them)
    const nightK = G.clamp((G.Render.nightness() - 0.25) * 1.6, 0, 1);
    // (the campfires of the towns: burning, as the god sees them — flames, sparks, a column of smoke, their light — but on the
    // night of the New Fire, when every flame of the town is out; and at night the doorways of the houses round the body,
    // where the light of the hearth comes out)
    for (const b of S.buildings.values()) {
      if (nightK > 0.05 && b.built && F3.doorLit(b)) { const X = (b.x + b.w / 2) * L, Z = (b.y + b.h / 2) * L; const d2 = near2(X, Z); if (d2 < 2100) { const dr = G.Vg.door(b); const DX = dr[0] * L, DZ = dr[1] * L; const k = LIT[b.type] * nightK; src.push([2.6 * k / (1 + near2(DX, DZ) / 70), 'w' + b.id, DX + (DX - X) * 0.08, W.hAt(dr[0], dr[1]) * H + 1.7, DZ + (DZ - Z) * 0.08, 2.6 * k, 11, HEARTH, 0.03, 0, b.id]);
        // (and its lit windows, where the drawing of the houses says they are: [X, Y, Z, out x, out z] of each pane)
        const ps = G.Build3D && G.Build3D.lamps && G.Build3D.lamps.get(b.id); if (ps) for (let q = 0; q < ps.length && q < 8; q++) { const p = ps[q]; src.push([0.9 * k / (1 + near2(p[0], p[2]) / 40), 'p' + b.id + ':' + q, p[0] + p[3] * 0.35, p[1], p[2] + p[4] * 0.35, 0.9 * k, 7, HEARTH, 0.02, 0, b.id]); halo(p[0] + p[3] * 0.08, p[1], p[2] + p[4] * 0.08, 1.1, 0.28 * k, b.id * 13 + q); } } }
      if (b.type !== 'campfire' || !b.built || n >= MAXF - 2 || (G.Atmos && !G.Atmos.fire(b))) continue; const X = (b.x + b.w / 2) * L, Z = (b.y + b.h / 2) * L; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > 3600) continue;
      const gY = W.hAt(b.x + b.w / 2, b.y + b.h / 2) * H + 0.55;
      // (four tongues: the tall one in the middle with the core, three lower round it — each trembling, now taller, now shorter)
      for (let k = 0; k < 4 && n < MAXF; k++) { const s = G.hash(b.id * 7 + k); const fl = 0.78 + Math.sin(t * (7 + k * 2.3) + b.id + k) * 0.14 + G.VR() * 0.12;
        const ox = k ? Math.cos(s * TAU) * 0.18 : 0, oz = k ? Math.sin(s * TAU) * 0.18 : 0;
        tongue(n, X + ox, gY - 0.05, Z + oz, (k ? 0.55 : 0.8) * (0.9 + s * 0.2), (k ? 0.85 + s * 0.35 : 1.35) * fl, s + k * 0.37, k === 0); n++; }
      halo(X, gY + 0.55, Z, 2.8, 0.7, b.id);
      const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; src.push([13 / (1 + d2 / 300), 'c' + b.id, X, gY + 1.2, Z, 13, 22, FIRE, 0.14]);
      for (let k = every('cf' + b.id, 1.3, rdt); k > 0; k--) spawn(PA, { x: X, y: gY + 1.2, z: Z, vy: G.vrr(0.9, 1.4), life: G.vrr(3, 5), s0: 0.4, s1: 2.6, c: [0.6, 0.6, 0.6], a: 0.32, drag: 0.4, fade: 1 });
      for (let k = every('cs' + b.id, 3, rdt); k > 0; k--) spawn(PG, { x: X + G.vrr(-0.3, 0.3), y: gY + 0.4, z: Z + G.vrr(-0.3, 0.3), vx: G.vrr(-0.3, 0.3), vy: G.vrr(1.8, 3.4), vz: G.vrr(-0.3, 0.3), life: G.vrr(0.7, 1.4), s0: 0.12, s1: 0.03, c: [1, 0.72, 0.3], a: 1, sh: 1, drag: 0.6, wob: 1 });
      // (and embers: slower, redder, drifting up high on the warm air before they go out)
      for (let k = every('ce' + b.id, 1.6, rdt); k > 0; k--) spawn(PG, { x: X + G.vrr(-0.25, 0.25), y: gY + 0.2, z: Z + G.vrr(-0.25, 0.25), vx: G.vrr(-0.15, 0.15), vy: G.vrr(0.6, 1.2), vz: G.vrr(-0.15, 0.15), life: G.vrr(1.8, 3.2), s0: 0.06, s1: 0.025, c: [1, 0.42, 0.1], a: 1, sh: 1, drag: 0.25, wob: 0.7 });
    }
    // (the small flames the others hand over: torches and lanterns in people's hands, the lamps of carts and taverns, the
    // fires of camps and pyres, the hearths of the houses drawn open round the body — each a flame, a spark now and then,
    // and the nearest one lights round it)
    F3.torches = 0; let ti = 0;
    const inB = G.Possess && G.Possess.body && G.Possess.body() ? G.Possess.body().inside || 0 : 0;
    for (const fs of [G.People3D && G.People3D.flames, G.Things3D && G.Things3D.flames, G.Build3D && G.Build3D.flames]) if (fs) for (const q of fs) {
      if (n >= MAXF) break; const k = q[3]; const fl = 0.8 + Math.sin(t * 11 + q[0] * 3.1) * 0.15 + G.VR() * 0.1;
      tongue(n, q[0], q[1], q[2], 0.26 * k, 0.55 * k * fl, G.hash(ti * 13 + 5), true); n++; F3.torches++;
      halo(q[0], q[1] + 0.18 * k, q[2], 1.5 * k, 0.75, ti);
      // (a flame of an inside — Build3D's: its building and its own key —: the strongest lights go first to the room the body is in)
      if (q[4]) { src.push([8 * k / (1 + near2(q[0], q[2]) / 40) * (q[4] === inB ? 6 : 1), q[5], q[0], q[1] + 0.35, q[2], Math.min(8, 9 * k), 14, k < 0.4 ? CANDLE : HEARTH, k < 0.4 ? 0.06 : 0.12, q[4]]); ti++; }
      else src.push([8 * k / (1 + near2(q[0], q[2]) / 40), 't' + (ti++), q[0], q[1] + 0.35, q[2], Math.min(8, 9 * k), 16, TORCH, 0.12]);
      if (G.VR() < rdt * 1.6 * k) spawn(PG, { x: q[0], y: q[1] + 0.3 * k, z: q[2], vx: G.vrr(-0.2, 0.2), vy: G.vrr(0.8, 1.6), vz: G.vrr(-0.2, 0.2), life: G.vrr(0.5, 0.9), s0: 0.06, s1: 0.02, c: [1, 0.7, 0.3], a: 1, sh: 1, drag: 0.5, wob: 1 });
    }
    flame.count = glow.count = n; flame.instanceMatrix.needsUpdate = glow.instanceMatrix.needsUpdate = true; flame.geometry.attributes.aSeed.needsUpdate = true; F3.fires = n;
    stepHalos(nightK);
    lightUp(src, rdt);
    // (the painted light of every flame round the body: at night, and by day where a fire burns)
    if (nightK > 0.02 || best > 0) paintLight(src, focus); else if (lmOn) { lmOn = false; R3.GX.gxLMB.value.w = 0; F3.lmSources = 0; }
    stepBlobs();
    // ---- rain (or snow on the cold lands): round the eye, as much as the world's weather pours
    // (the weather's rain, or the rain of a cloud of the world passing over the body — the god's rain clouds are local)
    const cam = R3.camera(); const wr = Math.max(S.weather ? S.weather.rain || 0 : 0, G.Nature && G.Nature.rainAt ? G.Nature.rainAt(focus.X / L, focus.Z / L) : 0);
    const cold = G.Biome && G.Biome.cold ? G.Biome.cold(W.idx(G.clamp(focus.X / L, 0, G.N - 1), G.clamp(focus.Z / L, 0, G.N - 1))) : false;
    rain.material.opacity = cold ? G.clamp(wr * 1.4, 0, 0.75) : 0; rain.material.size = 0.16; rain.material.color.set(0xf4f8ff);
    streaks.material.opacity = cold ? 0 : G.clamp(wr * 0.9, 0, 0.5); rain.visible = cold; streaks.visible = !cold;
    if (wr > 0.05) {
      const sp = cold ? 2.2 : 16; const cnt = Math.floor(NR * G.clamp(wr * 1.5, 0.1, 1));
      // (the wind carries the drops: they fall leaning, and drift)
      const w = S.weather; const ws = G.clamp(w.windS || 0, 0, 2); const wx = Math.cos(w.windA || 0) * (0.4 + ws * 1.4), wz = Math.sin(w.windA || 0) * (0.4 + ws * 1.4);
      for (let k = 0; k < NR; k++) {
        let y = rainP[k * 3 + 1] - sp * rdt; if (cold) rainP[k * 3] += Math.sin(t + k) * rdt * 0.4; else { rainP[k * 3] += wx * rdt; rainP[k * 3 + 2] += wz * rdt; }
        if (y < -2 || k >= cnt) { y = 26 + G.VR() * 6; rainP[k * 3] = (G.VR() - 0.5) * 60; rainP[k * 3 + 2] = (G.VR() - 0.5) * 60; if (k >= cnt) y = -50; }
        rainP[k * 3 + 1] = y;
        // (a drop seen in the time of a glance: a streak from where it was a moment ago)
        if (!cold) { const o = k * 6; rainL[o] = rainP[k * 3]; rainL[o + 1] = y; rainL[o + 2] = rainP[k * 3 + 2]; rainL[o + 3] = rainP[k * 3] - wx * 0.045; rainL[o + 4] = y + sp * 0.045; rainL[o + 5] = rainP[k * 3 + 2] - wz * 0.045; }
      }
      rain.position.set(cam.position.x, cam.position.y - 12, cam.position.z); rain.geometry.attributes.position.needsUpdate = true;
      if (!cold) { streaks.position.copy(rain.position); streaks.geometry.attributes.position.needsUpdate = true; streaks.geometry.setDrawRange(0, cnt * 2); }
      F3.drops = cnt;
    } else F3.drops = 0;
    // ---- ships: where the world has them, heading the way they move, rocking on the water
    let m = 0; const seen = new Set();
    for (const s of S.ships) {
      if (m >= MAXS) break; const X = s.x * L, Z = s.y * L; if (Math.abs(X - focus.X) > 260 || Math.abs(Z - focus.Z) > 260) continue;
      const D = SHIP[s.kind] || SHIP.pesca; seen.add(s.id);
      let v = svis.get(s.id); if (!v) { v = { X, Z, yaw: s.face > 0 ? 0 : Math.PI }; svis.set(s.id, v); }
      const dx = X - v.X, dz = Z - v.Z; if (Math.hypot(dx, dz) > 0.01 && Math.hypot(dx, dz) < 8) { const want = Math.atan2(dz, dx); let da = want - v.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; v.yaw += da * (1 - Math.exp(-2 * rdt)); }
      v.X = X; v.Z = Z;
      // (21c: on the sea, the ship rides the wave the water draws — G.Agua.waveY, the shader's own sum —: its height, its pitch and its
      // roll from the wave under its bow, its stern and its sides; in the yard, on the land)
      const ride = s.st !== 'build' ? shipRide(X, Z, v.yaw, D) : null;
      const wy = ride ? G.SEA * H + ride[0] : W.hAt(s.x, s.y) * H; const rock = Math.sin(t * 1.3 + s.id) * 0.025 + (ride ? ride[2] : 0), bob = Math.sin(t * 0.9 + s.id) * 0.03, pitch = ride ? ride[1] : 0;
      v.wy = wy; v.D = D; v.moving = Math.hypot(dx, dz) / Math.max(rdt, 1e-3);
      const sink = s.sink ? -2.5 : 0; const hp = s.maxHp ? G.clamp(s.hp / s.maxHp, 0, 1) : 1;
      const col = G.Fac.hex(s.fac); const wood = s.kind === 'guerra' ? '#5a3a24' : '#7a5232';
      // (the ship's frame: at its place, turned to its heading — the length along its own X — rolling on the swell)
      const put = (im, ox, oy, oz, sx, sy, sz, c) => { M.a.makeTranslation(X, wy - 0.4 + bob + sink, Z); M.b.makeRotationY(-v.yaw); M.a.multiply(M.b); M.b.makeRotationZ(pitch); M.a.multiply(M.b); M.b.makeRotationX(rock); M.a.multiply(M.b); M.b.makeTranslation(ox, oy, oz); M.a.multiply(M.b); M.b.makeScale(sx, sy, sz); M.a.multiply(M.b); im.setMatrixAt(m, M.a); im.setColorAt(m, M.c.set(c)); };
      put(hull, 0, -0.1, 0, D[0], 1.25, D[1], wood);
      put(deck, -D[0] * 0.25, 1.1, 0, D[0] * 0.25, D[0] > 6 ? 1.3 : 0.01, D[1] * 0.7, '#8a6a44');
      if (D[2] && s.mast !== 0) { put(mast, 0, 1.1, 0, 0.25, D[2], 0.25, '#4a3424'); put(sail, 0.1, 1.1 + D[2] * 0.3, 0, 3, D[2] * 0.6 * G.clamp((s.sail || 100) / 100, 0.2, 1), D[1] * 1.3, hp < 0.4 ? '#8a8478' : col); }
      else { mast.setMatrixAt(m, M.z); sail.setMatrixAt(m, M.z); }
      m++;
    }
    for (const id of svis.keys()) if (!seen.has(id)) svis.delete(id);
    for (const im of [hull, deck, mast, sail]) { im.count = m; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
    F3.ships = m;
    // ---- the trees falling near the eye: each one its own picture, turned over on its foot as the world's tree falls,
    // with a burst of leaves and dust where it lands
    for (const tr of S.trees.values()) { if (tr.stage !== 'fall' || falling.has(tr.id)) continue; const X = tr.x * L, Z = tr.y * L; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > 90 * 90) continue; falling.set(tr.id, { m: R3.treeMesh(tr), landed: false }); R3.refreshAt(tr.x, tr.y); }
    for (const [id, f] of falling) {
      const tr = S.trees.get(id);
      if (!tr || tr.stage !== 'fall') { R3.dropMesh(f.m); falling.delete(id); if (tr) R3.refreshAt(tr.x, tr.y); continue; }
      const k = G.easeIn ? G.easeIn(Math.min(1, tr.fallT / 0.9)) : Math.min(1, tr.fallT / 0.9) ** 2; f.m.rotation.set(0, 0, -(tr.fallDir || 1) * k * Math.PI / 2 * 0.92); f.m.updateMatrixWorld();
      if (k > 0.9 && !f.landed) { f.landed = true; const X = tr.x * L + (tr.fallDir || 1) * (G.Mata ? G.Mata.tree(tr).cy * 0.95 : 5 * Math.max(0.4, tr.size)), /* (21a: the burst where its crown lands — a great tree of the south reaches far) */ Y = W.groundH(tr.x, tr.y) * H, Z = tr.y * L; const c = R3.crownOf(Object.assign({}, tr, { stage: 'grow' }));
        for (let q = 0; q < 14; q++) spawn(PA, { x: X + G.vrr(-2.5, 2.5), y: Y + 0.3, z: Z + G.vrr(-1.5, 1.5), vx: G.vrr(-1.2, 1.2), vy: G.vrr(0.4, 1.2), vz: G.vrr(-1.2, 1.2), life: G.vrr(1, 1.8), s0: 0.6, s1: 2.2, c: [0.7, 0.62, 0.5], a: 0.35, drag: 1.2 });
        if (c) for (let q = 0; q < 26; q++) spawn(PA, { x: X + G.vrr(-3, 3), y: Y + G.vrr(0.5, 2.5), z: Z + G.vrr(-2, 2), vx: G.vrr(-1.5, 1.5), vy: G.vrr(0.5, 2), vz: G.vrr(-1.5, 1.5), life: G.vrr(2, 4), s0: 0.17, s1: 0.17, c: c[4], a: 1, sh: 2, drag: 1.4, grav: 1.5, wob: 1.6 }); }
    }
    // ---- the small life of the air: smoke, sparks, dust, splashes, chips, leaves, fireflies
    emitters(rdt, focus, t);
    waterFX(rdt, focus); // (21c: the spray of the falls, the wakes)
    { const w = S.weather; const ws = G.clamp(w.windS || 0, 0, 2); const wx = Math.cos(w.windA || 0) * (0.4 + ws * 1.4), wz = Math.sin(w.windA || 0) * (0.4 + ws * 1.4);
      stepPool(PA, rdt, wx, wz, t); stepPool(PG, rdt, wx, wz, t); stepRings(rdt); stepFeet(rdt); }
    const cam2 = R3.camera(); const ren = R3.renderer(); PU.uScale.value = ren.domElement.height / (2 * Math.tan(cam2.fov * Math.PI / 360));
    // (the points fade into the same haze as everything: where the air's haze is light and where it is thick)
    const fog = R3.scene().fog; PU.uFogC.value.copy(fog.color); const A = R3.GX.gxAir.value, A2 = R3.GX.gxAir2.value; PU.uFogN.value = A2.x + 0.3 / A.x; PU.uFogF.value = A2.x + 1.7 / A.x;
    { const am = G.Render.ambient(); PU.uLit.value = G.clamp((am[0] + am[1] + am[2]) / 765, 0.3, 1); }
    F3.particles = PA.n + PG.n + (PW ? PW.n : 0); F3.rings = ripN;
  };
  // ------------------------------ what raises the particles ------------------------------
  let leaves = [];
  function leafList(focus) {
    const S = G.S; const L = G.Space.TILE; leaves = []; const x0 = Math.floor(focus.X / L), y0 = Math.floor(focus.Z / L);
    for (let y = y0 - 8; y <= y0 + 8; y++) for (let x = x0 - 8; x <= x0 + 8; x++) { if (!W.inb(x, y)) continue; const id = S.treeAt[y * G.N + x]; const t = id && S.trees.get(id); if (!t) continue; const c = R3.crownOf(t); if (c) leaves.push(c); if (leaves.length > 60) return; }
  }
  function emitters(dt, focus, t) {
    const S = G.S; const L = G.Space.TILE, H = G.Space.HM; const w = S.weather; const ws = G.clamp(w.windS || 0, 0, 2); const wx = Math.cos(w.windA || 0) * (0.4 + ws * 1.4), wz = Math.sin(w.windA || 0) * (0.4 + ws * 1.4);
    const night = G.clamp(G.Render.nightness(), 0, 1); const snowAt = R3.snowAt || (() => 0);
    // the smoke over a roof: only with a fire under it — a batch burning in the kiln, the forge hot, the furnace of the baths,
    // the tavern open, someone at the house's fire (G.Atmos.fire, the god's view asks the same); a building at rest does not
    // smoke (D-164). Out of its chimney where the picture has one, else through the roof; how much by what burns — a kiln
    // more than a hearth, a hearth more in the cold; the baths' white with the steam of their water
    F3.smoke.length = 0;
    if (G.Build3D && G.Atmos) for (const b of S.buildings.values()) {
      if (!b.built || b.type === 'campfire') continue; const X = (b.x + b.w / 2) * L, Z = (b.y + b.h / 2) * L; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > 6400) continue;
      const rate = F3.smokeRate(b, night, snowAt(W.idx(b.x, b.y)) > 0.3); if (!rate || S.fire[W.idx(b.x, b.y)] > 0.05) continue;
      let c = G.Build3D.chim.get(b.id); if (!c) { const top = G.Build3D.tops.get(b.id); if (top === undefined) continue; c = SMK; c[0] = X; c[1] = top + 0.1; c[2] = Z; }
      if (F3.smoke.length < 80) F3.smoke.push([b.id, +rate.toFixed(2)]);
      const steam = b.type === 'banhos';
      for (let k = every('c' + b.id, rate, dt); k > 0; k--) spawn(PA, { x: c[0] + G.vrr(-0.15, 0.15), y: c[1], z: c[2] + G.vrr(-0.15, 0.15), vx: G.vrr(-0.1, 0.1), vy: G.vrr(0.7, 1.1), vz: G.vrr(-0.1, 0.1), life: G.vrr(5, 7.5), s0: 0.5, s1: G.vrr(3, 4.4), c: b.type === 'forja' ? [0.34, 0.33, 0.34] : steam ? [0.9, 0.92, 0.94] : [0.68, 0.68, 0.7], a: 0.4, drag: 0.35, fade: 1 });
    }
    // fire: a column of smoke over each burning tile near the eye, and sparks flying up out of it
    if (G.Nature && G.Nature.fireSet && G.Nature.fireSet.size) { let m = 0; for (const i of G.Nature.fireSet) {
      if (m > 40) break; const f = S.fire[i]; if (f < 0.08) continue; const x = i % G.N, y = (i / G.N) | 0; const X = (x + 0.5) * L, Z = (y + 0.5) * L; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > 4900) continue; m++;
      const top = G.Build3D ? G.Build3D.heightAt(i) : 0; const Y = W.maxH(x, y, 1, 1) * H + (top ? top * 0.75 : 0) + 1.5;
      for (let k = every('fs' + i, 2.5 * f + 0.5, dt); k > 0; k--) spawn(PA, { x: X + G.vrr(-1.5, 1.5), y: Y + 1, z: Z + G.vrr(-1.5, 1.5), vy: G.vrr(1.6, 2.6), life: G.vrr(4, 6), s0: 1.2, s1: G.vrr(5, 7), c: [0.2, 0.19, 0.19], a: 0.5, drag: 0.25, fade: 1 });
      for (let k = every('fk' + i, 7 * f + 1, dt); k > 0; k--) spawn(PG, { x: X + G.vrr(-1.2, 1.2), y: Y, z: Z + G.vrr(-1.2, 1.2), vx: G.vrr(-0.6, 0.6), vy: G.vrr(2.5, 5), vz: G.vrr(-0.6, 0.6), life: G.vrr(0.8, 1.8), s0: 0.16, s1: 0.04, c: [1, 0.62, 0.22], a: 1, sh: 1, drag: 0.6, grav: -0.5, wob: 1.2 });
    } }
    // the steps of people: dust when they run (snow kicked up where it lies), rings and splashes in the water
    const av = G.People3D && G.People3D.avatar;
    const feet = (X, Y, Z, sp, id, wade) => {
      const x = Math.floor(X / L), y = Math.floor(Z / L); if (!W.inb(x, y)) return; const i = y * G.N + x; const ty = S.type[i];
      if (ty <= G.T.RIVER || wade > 0.05) {
        if (sp < 0.4) return; const wy = (ty === G.T.RIVER ? S.wl[i] : G.SEA) * H + 0.06;
        for (let k = every('w' + id, 2.5 + sp, dt); k > 0; k--) { ripple(X + G.vrr(-0.2, 0.2), Math.max(Y, wy), Z + G.vrr(-0.2, 0.2), 1.3); for (let q = 0; q < 3; q++) spawn(PA, { x: X, y: Math.max(Y, wy) + 0.1, z: Z, vx: G.vrr(-1, 1), vy: G.vrr(1.5, 2.6), vz: G.vrr(-1, 1), life: 0.55, s0: 0.09, s1: 0.05, c: [0.85, 0.92, 0.98], a: 0.8, sh: 1, grav: 9.8 }); }
        return;
      }
      if (sp < 2.4 && !(id === 'av' && sp > 0.9)) return;
      const snow = snowUnder(X, Z, snowAt(i)); const soft = (ty === G.T.GRASS || ty === G.T.MEADOW) && !S.road[i] && G.pathLevel(S.wear[i]) < 2 && !snow;
      if (soft && sp < 4) return; // (soft grass raises little)
      let c; if (snow) c = [0.94, 0.96, 1]; else { const g = G.Ground3D.tileCol(i, x, y); c = [Math.min(1, g[0] / 255 * 1.15), Math.min(1, g[1] / 255 * 1.12), Math.min(1, g[2] / 255 * 1.1)]; }
      // (a little puff at each stride, not a trail: low, quick, faint)
      for (let k = every('d' + id, sp > 2.4 ? sp * 0.8 : 1, dt); k > 0; k--) spawn(PA, { x: X + G.vrr(-0.15, 0.15), y: Y + 0.06, z: Z + G.vrr(-0.15, 0.15), vx: G.vrr(-0.3, 0.3), vy: G.vrr(0.15, 0.4), vz: G.vrr(-0.3, 0.3), life: G.vrr(0.5, 0.8), s0: 0.2, s1: G.vrr(0.55, 0.85), c, a: snow ? 0.42 : 0.2, drag: 2 });
    };
    if (av && !av.swim) { feet(av.X, av.Y, av.Z, av.sp || 0, 'av', av.wade || 0); if (av.ground !== false) walkPrints('av', av.X, av.Y, av.Z, av.yaw); }
    // (the swimmer: rings round the shoulders even when still, the arms' splashes at each stroke, a trail of foam behind;
    // going under, bubbles)
    if (av && av.swim && G.Avatar.waterAt) { const wy = G.Avatar.waterAt(av.X, av.Z); if (wy > -Infinity) {
      for (let k = every('sw', 1.1 + av.sp * 1.6, dt); k > 0; k--) ripple(av.X + G.vrr(-0.3, 0.3), wy + 0.04, av.Z + G.vrr(-0.3, 0.3), 1.7);
      if (av.sp > 0.3 || av.stroke) for (let k = every('ss', 1.6 + av.sp * 1.8 + (av.stroke ? 6 : 0), dt); k > 0; k--) {
        const a = av.yaw + G.vrr(-1, 1); const fx = Math.cos(a) * 0.5, fz = Math.sin(a) * 0.5;
        for (let q = 0; q < 5; q++) spawn(PA, { x: av.X + fx, y: wy + 0.08, z: av.Z + fz, vx: fx * 1.5 + G.vrr(-0.7, 0.7), vy: G.vrr(1.1, 2.4), vz: fz * 1.5 + G.vrr(-0.7, 0.7), life: 0.6, s0: 0.1, s1: 0.06, c: [0.88, 0.94, 1], a: 0.85, sh: 1, grav: 9.8 });
        spawn(PA, { x: av.X - Math.cos(av.yaw) * 0.9, y: wy + 0.03, z: av.Z - Math.sin(av.yaw) * 0.9, vx: G.vrr(-0.15, 0.15), vy: 0, vz: G.vrr(-0.15, 0.15), life: 1.4, s0: 0.35, s1: 0.8, c: [0.92, 0.96, 1], a: 0.45, drag: 2 });
      }
      if (av.drown > 0.3) for (let k = every('sb', 5, dt); k > 0; k--) spawn(PA, { x: av.X + G.vrr(-0.3, 0.3), y: wy - 0.25, z: av.Z + G.vrr(-0.3, 0.3), vy: G.vrr(0.7, 1.3), life: 0.45, s0: 0.07, s1: 0.13, c: [0.9, 0.96, 1], a: 0.75, sh: 1 });
    } }
    if (G.People3D) for (const p of G.People3D.walkers) {
      feet(p[0], p[1], p[2], p[3], p[7], 0); if (p[3] > 0.3) walkPrints(p[7], p[0], p[1], p[2], p[6]);
      // (the chips of the axe, the pick, the hammer, at the blow)
      const a = p[5]; if (a === 'chop' || a === 'mine' || a === 'build' || a === 'hammer' || a === 'dig') { const n = every('h' + p[7], 2.2, dt); const fx = Math.cos(p[6]) * 0.7, fz = Math.sin(p[6]) * 0.7; const wood = a === 'chop' || a === 'build';
        for (let k = 0; k < n * 4; k++) spawn(PA, { x: p[0] + fx, y: p[1] + (a === 'chop' ? 0.9 : 0.3), z: p[2] + fz, vx: fx * 2 + G.vrr(-1.2, 1.2), vy: G.vrr(1.5, 3.2), vz: fz * 2 + G.vrr(-1.2, 1.2), life: G.vrr(0.6, 1), s0: 0.09, s1: 0.07, c: wood ? [0.86, 0.72, 0.5] : a === 'dig' ? [0.5, 0.4, 0.3] : [0.62, 0.6, 0.58], a: 1, sh: 2, grav: 9.8 }); }
    }
    // leaves falling from the crowns round the eye, more in the wind (a few already turning)
    leafT -= dt; if (leafT <= 0) { leafT = 2; leafList(focus); }
    if (leaves.length) for (let k = every('leaf', (1.2 + ws * 5) * Math.min(1, leaves.length / 8), dt); k > 0; k--) { const tr = G.vpick(leaves); const au = G.VR() < 0.25 ? G.VR() * 0.6 : 0;
      spawn(PA, { x: tr[0] + G.vrr(-tr[3], tr[3]), y: tr[1] + G.vrr(-1, 1), z: tr[2] + G.vrr(-tr[3], tr[3]), vx: wx * 0.5, vy: -G.vrr(0.5, 0.9), vz: wz * 0.5, life: G.vrr(5, 8), s0: 0.17, s1: 0.17, c: [G.lerp(tr[4][0], 0.86, au), G.lerp(tr[4][1], 0.56, au), G.lerp(tr[4][2], 0.2, au)], a: 1, sh: 2, drag: 1.2, wob: 1.6 }); }
    // fireflies over the land on warm, dry nights
    const fi = W.idx(G.clamp(Math.floor(focus.X / L), 0, G.N - 1), G.clamp(Math.floor(focus.Z / L), 0, G.N - 1));
    if (night > 0.6 && !(w.rain > 0.1) && S.temp && S.temp[fi] / 255 > 0.36) for (let k = every('ff', 3.4, dt); k > 0; k--) { const X = focus.X + G.vrr(-14, 14), Z = focus.Z + G.vrr(-14, 14); const x = Math.floor(X / L), y = Math.floor(Z / L); if (!W.inb(x, y) || S.type[y * G.N + x] <= G.T.RIVER) continue;
      spawn(PG, { x: X, y: W.hAt(X / L, Z / L) * H + G.vrr(0.4, 1.8), z: Z, vx: G.vrr(-0.3, 0.3), vy: G.vrr(-0.08, 0.08), vz: G.vrr(-0.3, 0.3), life: G.vrr(6, 10), s0: 0.13, s1: 0.13, c: [0.78, 1, 0.38], a: 1, sh: 1, wob: 0.8, fade: 1 }); }
    // (the rain clouds of the world are the sky's: ceu3d.js draws each where the world has it, as a cloud with its curtain of rain — 21d)
    // rain: drops striking the ground, rings on the water (snow falls soft: nothing)
    const rain = Math.max(w.rain || 0, G.Nature && G.Nature.rainAt ? G.Nature.rainAt(focus.X / L, focus.Z / L) : 0);
    if (rain > 0.15 && snowAt(fi) < 0.3) for (let k = every('rn', rain * 60, dt); k > 0; k--) { const X = focus.X + G.vrr(-14, 14), Z = focus.Z + G.vrr(-14, 14); const x = Math.floor(X / L), y = Math.floor(Z / L); if (!W.inb(x, y)) continue; const i = y * G.N + x;
      if (S.type[i] <= G.T.RIVER) ripple(X, (S.type[i] === G.T.RIVER ? S.wl[i] : G.SEA) * H + 0.06, Z, 0.8);
      else spawn(PA, { x: X, y: W.hAt(X / L, Z / L) * H + 0.05, z: Z, vy: 0.8, life: 0.25, s0: 0.12, s1: 0.03, c: [0.85, 0.9, 0.95], a: 0.7, sh: 1, grav: 6 }); }
  }

  // ------------------------------ 21c: the water's part ------------------------------
  // The spray of the falls in a batch of its own (the shared pools carry the smoke, the leaves and the dust: a great fall would take
  // them): a fall throws it up where its sheet strikes the pool (G.Agua3D.sheetOf), as much as it drops and as wide as it is, and the
  // wind takes it; in it, with the sun behind the eye, the rainbow at its 42 degrees (the sky's, G.Ceu.rainbow, where it says so).
  // The wake of the ships: foam spreading behind each one that moves, and the spray at its bow. Only seen (G.VR)
  let PW = null, PWU = null, wake = null, wakeN = 0, wkT = 0; const NWK = 96; let fallsNear = [], fallsKey = '', fallsT = -1e9;
  const _wv = [0, 0, 0];
  // (the wind of the 3D, as the water's shader reads it)
  function windV() { const w = G.Realm.U.wind.value; _wv[0] = w ? w.x : 0; _wv[1] = w ? w.y : 0; _wv[2] = w ? w.z : 0; return _wv; }
  // (the drawn wave under a ship: [its height, its pitch, its roll] — what is on the water is drawn on it, D-506)
  function shipRide(X, Z, yaw, D) {
    const Ag = G.Agua; if (!Ag || !Ag.waveY) return [0, 0, 0]; const t = G.Realm.time(), w = windV(); const H = G.Space.HM, L = G.Space.TILE, sea = G.SEA * H;
    const at = (x, z) => { const dep = sea - (W.hAt(x / L, z / L) * H - G.Space.bedDrop(x / L, z / L)); return Ag.waveY(x, z, t, w, 1, dep); };
    const c = Math.cos(yaw), sn = Math.sin(yaw); const hl = D[0] * 0.45, hb = D[1] * 0.5;
    const y0 = at(X, Z), yb = at(X + c * hl, Z + sn * hl), ys = at(X - c * hl, Z - sn * hl), yr = at(X - sn * hb, Z + c * hb), yp = at(X + sn * hb, Z - c * hb);
    return [y0, Math.atan2(yb - ys, hl * 2), -Math.atan2(yr - yp, hb * 2)];
  }
  F3.shipRide = shipRide;
  const PVERTW = PVERT.replace('varying float vFog;', 'varying float vFog; uniform vec3 uSun; varying float vRb;').replace('void main() {', 'void main() { vRb = dot(normalize(position - cameraPosition), -uSun);');
  // (the rainbow: the light of the sun turned back by each drop at 40,5 to 42,5 degrees from the point opposite the sun — violet inside,
  // red outside — in the drops that are there)
  const PFRAGW = PFRAG.replace('uniform float uAdd;', 'uniform float uAdd; uniform float uRb; varying float vRb;').replace('col *= col;', `col *= col;
      if (uRb > 0.001) { float ang = degrees(acos(clamp(vRb, -1.0, 1.0))); float b = (ang - 40.5) / 2.0;
        if (b > 0.0 && b < 1.0) { vec3 rb = max(vec3(smoothstep(0.4, 0.95, b), 1.0 - abs(b - 0.48) * 2.3, 1.0 - smoothstep(0.08, 0.55, b)), 0.0); col += rb * uRb * (1.0 - abs(b * 2.0 - 1.0)) * 1.4; } }`);
  function makeWater() {
    PWU = Object.assign({}, PU, { uAdd: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uRb: { value: 0 } });
    const P = pool(false); const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P.pos, 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aCol', new THREE.BufferAttribute(P.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(P.size, 1).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aShape', new THREE.BufferAttribute(P.shape, 1).setUsage(THREE.DynamicDrawUsage)); g.setDrawRange(0, 0);
    const m = new THREE.ShaderMaterial({ uniforms: PWU, vertexShader: PVERTW, fragmentShader: PFRAGW, transparent: true, depthWrite: false });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 4; scene.add(pts); P.geo = g; PW = P;
    // (the wake: flat patches of foam on the water, each spreading and thinning as it is left behind)
    const cg = new THREE.CircleGeometry(1, 18); cg.rotateX(-Math.PI / 2);
    const aT = new THREE.InstancedBufferAttribute(new Float32Array(NWK), 1), aS = new THREE.InstancedBufferAttribute(new Float32Array(NWK), 1); aT.setUsage(THREE.DynamicDrawUsage); cg.setAttribute('aT', aT); cg.setAttribute('aS', aS);
    wake = new THREE.InstancedMesh(cg, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uLit: PU.uLit, gxGr: PU.gxGr, gxTn: PU.gxTn, uDet: { value: G.Ground3D.detail() } },
      vertexShader: 'attribute float aT; attribute float aS; varying float vT; varying vec2 vP; varying float vS; void main(){ vT = aT; vS = aS; vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying float vT; varying vec2 vP; varying float vS; uniform float uLit; uniform sampler2D uDet; void main(){ float r = length(vP); float n = texture2D(uDet, vP * 0.55 + vS * 7.3).b * 0.6 + texture2D(uDet, vP * 1.3 + vS * 3.1).r * 0.4; float a = smoothstep(1.0, 0.55, r) * smoothstep(0.3, 0.62, n + (1.0 - vT) * 0.3) * (1.0 - vT) * 0.75; if (a < 0.01) discard; vec3 c = vec3(0.92, 0.95, 0.97) * uLit; gl_FragColor = vec4(c * c, a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }), NWK);
    wake.count = 0; wake.frustumCulled = false; wake.renderOrder = 3; wake.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(wake);
    wake.userData = { age: new Float32Array(NWK), max: new Float32Array(NWK), x: new Float32Array(NWK), z: new Float32Array(NWK), vx: new Float32Array(NWK), vz: new Float32Array(NWK), r0: new Float32Array(NWK), r1: new Float32Array(NWK), aT, aS };
  }
  function wakeAt(X, Z, vx, vz, r0, r1, life) { if (!wake) return; const u = wake.userData; let k = wakeN; if (k < NWK) wakeN++; else { k = 0; for (let q = 1; q < NWK; q++) if (u.age[q] / u.max[q] > u.age[k] / u.max[k]) k = q; }
    u.age[k] = 0; u.max[k] = life; u.x[k] = X; u.z[k] = Z; u.vx[k] = vx; u.vz[k] = vz; u.r0[k] = r0; u.r1[k] = r1; u.aS.array[k] = G.VR(); }
  function stepWake(dt) {
    if (!wake) return; mats(); const u = wake.userData; let k = 0; const t = R3.time(), w = windV(); const sea = G.SEA * G.Space.HM;
    while (k < wakeN) {
      u.age[k] += dt; if (u.age[k] >= u.max[k]) { const j = --wakeN; for (const f of ['age', 'max', 'x', 'z', 'vx', 'vz', 'r0', 'r1']) u[f][k] = u[f][j]; u.aS.array[k] = u.aS.array[j]; continue; }
      const f = u.age[k] / u.max[k]; u.x[k] += u.vx[k] * dt; u.z[k] += u.vz[k] * dt; u.vx[k] *= Math.exp(-0.6 * dt); u.vz[k] *= Math.exp(-0.6 * dt);
      const r = u.r0[k] + (u.r1[k] - u.r0[k]) * Math.sqrt(f); const y = sea + (G.Agua ? G.Agua.waveY(u.x[k], u.z[k], t, w, 1, 9) : 0) + 0.05;
      M.a.makeScale(r, 1, r); M.a.setPosition(u.x[k], y, u.z[k]); wake.setMatrixAt(k, M.a); u.aT.array[k] = f; k++;
    }
    wake.count = wakeN; wake.visible = wakeN > 0; wake.instanceMatrix.needsUpdate = true; u.aT.needsUpdate = true; u.aS.needsUpdate = true;
  }
  const FALL = () => (G.Agua ? G.Agua.FALL : 1.2);
  function waterFX(dt, focus) {
    if (!PW || !G.Agua || !G.Agua3D) return; const S = G.S, L = G.Space.TILE, q = R3.Q(); const share = q.aguaSpray || 0;
    // (the falls round the eye: asked of the water again when the land changes or the body moves on)
    const fx = Math.floor(focus.X / L / 8), fz = Math.floor(focus.Z / L / 8); const key = fx + ':' + fz + ':' + (S.typeVer || 0) + ':' + (S.walkVer || 0);
    if (key !== fallsKey || R3.time() - fallsT > 4 || R3.time() < fallsT) { fallsKey = key; fallsT = R3.time(); fallsNear = G.Agua.steps(fx * 8 - 14, fz * 8 - 14, 36, 36).filter(s => s.drop >= 0.25 && !s.frozen).map(s => ({ s, sh: G.Agua3D.sheetOf(s) })); }
    let nearF = 0;
    if (share > 0) for (const o of fallsNear) {
      const s = o.s; const mx = (s.ax + s.bx) / 2 * L, mz = (s.ay + s.by) / 2 * L; const d2 = (mx - focus.X) ** 2 + (mz - focus.Z) ** 2; if (d2 > 75 * 75) continue; nearF++;
      const wid = Math.hypot(s.bx - s.ax, s.by - s.ay) * L; const far = d2 > 35 * 35 ? 0.5 : 1; const big = s.drop >= FALL();
      // (the droplets thrown up where it strikes, drifting as spray; the splash of a rapid)
      for (let k = every('wf' + s.i + ':' + s.j, (big ? 10 + s.drop * 7 : 3 + s.drop * 10) * wid / 4 * share * far, dt); k > 0; k--) {
        const u = G.vrr(0.15, 0.85), X = (s.ax + (s.bx - s.ax) * u) * L + s.nx * o.sh.sL, Z = (s.ay + (s.by - s.ay) * u) * L + s.ny * o.sh.sL; const up = Math.sqrt(Math.min(s.drop, 12) / 3);
        if (big) spawn(PW, { x: X, y: s.low + 0.15, z: Z, vx: s.nx * G.vrr(0.4, 1.8) + G.vrr(-0.6, 0.6), vy: G.vrr(1, 3.4) * up, vz: s.ny * G.vrr(0.4, 1.8) + G.vrr(-0.6, 0.6), life: G.vrr(1.4, 2.8), s0: 0.3, s1: G.vrr(1.4, 2.4), c: [0.9, 0.94, 0.97], a: G.vrr(0.18, 0.3), drag: 1.1, grav: 0.5, fade: 1 });
        else spawn(PW, { x: X, y: s.low + 0.06, z: Z, vx: s.nx * G.vrr(0.3, 1.2), vy: G.vrr(0.8, 2.2), vz: s.ny * G.vrr(0.3, 1.2), life: G.vrr(0.4, 0.8), s0: 0.08, s1: 0.05, c: [0.88, 0.94, 0.98], a: 0.7, sh: 1, grav: 9.8 });
      }
      // (and the clouds of spray of a great fall, rolling out over its pool)
      if (s.drop >= 3) for (let k = every('wm' + s.i + ':' + s.j, (0.8 + s.drop * 0.35) * wid / 4 * share * far, dt); k > 0; k--) {
        const u = G.vrr(0.2, 0.8), X = (s.ax + (s.bx - s.ax) * u) * L + s.nx * (o.sh.sL + G.vrr(0, 1.5)), Z = (s.ay + (s.by - s.ay) * u) * L + s.ny * (o.sh.sL + G.vrr(0, 1.5));
        spawn(PW, { x: X, y: s.low + G.vrr(0.3, 1.2), z: Z, vx: s.nx * G.vrr(0.3, 1.2), vy: G.vrr(0.3, 1.1), vz: s.ny * G.vrr(0.3, 1.2), life: G.vrr(3, 5.5), s0: 1.2, s1: G.vrr(3.5, 5.5), c: [0.92, 0.95, 0.97], a: G.vrr(0.08, 0.14), drag: 0.8, fade: 1 });
      }
    }
    A3S.falls = nearF;
    // (the wakes: each ship that moves leaves its foam, and throws spray at its bow)
    wkT += dt; const shipT = wkT >= 0.3; if (shipT) wkT = 0;
    for (const s of S.ships) { const v = svis.get(s.id); if (!v || !v.D || s.st === 'build') continue; v.sp = (v.sp || 0) * 0.92 + (v.moving || 0) * 0.08; if (!(v.sp > 0.3)) continue;
      const X = s.x * L, Z = s.y * L; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > 140 * 140) continue;
      const c = Math.cos(v.yaw), sn = Math.sin(v.yaw), D = v.D, sp = Math.min(v.sp, 6);
      if (shipT) { wakeAt(X - c * D[0] * 0.5, Z - sn * D[0] * 0.5, -c * sp * 0.15, -sn * sp * 0.15, D[1] * 0.5, D[1] * 1.6 + sp * 0.4, 7);
        for (const sd of [-1, 1]) wakeAt(X - c * D[0] * 0.2 - sn * sd * D[1] * 0.55, Z - sn * D[0] * 0.2 + c * sd * D[1] * 0.55, -sn * sd * sp * 0.25, c * sd * sp * 0.25, 0.4, 1.4 + sp * 0.2, 4.5); }
      if (share > 0) for (let k = every('wb' + s.id, sp * 3 * share, dt); k > 0; k--) { const bx = X + c * D[0] * 0.5, bz = Z + sn * D[0] * 0.5; const sd = G.VR() < 0.5 ? -1 : 1;
        spawn(PW, { x: bx, y: (v.wy || G.SEA * G.Space.HM) + 0.1, z: bz, vx: c * sp * 0.4 - sn * sd * G.vrr(0.6, 1.4), vy: G.vrr(0.8, 1.8), vz: sn * sp * 0.4 + c * sd * G.vrr(0.6, 1.4), life: G.vrr(0.5, 0.9), s0: 0.1, s1: 0.06, c: [0.9, 0.95, 1], a: 0.75, sh: 1, grav: 9.8 }); }
    }
    stepWake(dt);
    // (the rainbow in the spray: the sky's sun (G.Ceu.sun, through the dome's own uniform) up and lower than 42° — the bow's own angle —,
    // no rain to dim it; the cause is the spray itself, not the wet ground the sky's bow asks for (G.Ceu.rainbow: the bow in the sky
    // after a shower), so the drops ask only the sun)
    const sk = R3.skyU; if (sk) { const sd = G.Ceu.sun(S.time); PWU.uSun.value.set(sd.x, sd.y, sd.z); const alt = Math.asin(G.clamp(sd.y, -1, 1)) * 180 / Math.PI; const wr = S.weather ? S.weather.rain || 0 : 0;
      PWU.uRb.value = G.smooth(0.02, 0.08, sd.y) * (1 - G.smooth(36, 42, alt)) * (1 - G.clamp(wr * 1.5, 0, 1)) * 0.6; }
    // (the spray goes with the one wind of the world — the sky's, G.Ceu.wind)
    { const wd = G.Ceu.wind(); const ws = G.clamp(wd.s || 0, 0, 2); stepPool(PW, dt, wd.x * (0.4 + ws * 1.4), wd.y * (0.4 + ws * 1.4), R3.time()); }
    A3S.spray = PW.n; A3S.wake = wakeN;
  }
  const A3S = F3.water = { falls: 0, spray: 0, wake: 0 }; // (for the proofs and the measures: the falls throwing spray round the eye, the drops, the wake's patches)
  G.worldHooks.push(() => { if (PW) PW.n = 0; wakeN = 0; fallsNear = []; fallsKey = ''; if (wake) wake.count = 0; });
})(window.G);
