'use strict';
// ============================================================
//  Dragon3D: the dragons of the world (dragon.js) seen from the
//  body — the same beast the god watches: where it flies (d.x,
//  d.y, d.h) and which way (d.hd), what it does (d.st: coming
//  down out of the sky, hunting, a run over a town breathing
//  fire, asleep on its hoard, fighting the climbers at its lair,
//  falling, dead), its colours (its hue) and its breath (fire;
//  frost for the white one), the arrows shot up at it, the fires
//  it leaves on the ground, the gold under it while it sleeps,
//  and the bones of the slain. It banks into its turns and dips
//  its nose when it dives; its wings beat slow and heavy, glide
//  in a run, fold along its back on the ground and glow where
//  the sun shines through them.
//  Only seen: nothing here is saved, nothing touches the world;
//  what flickers draws from the view's own chance (G.VR).
// ============================================================
(function (G) {
  const W = G.W; const TAU = Math.PI * 2;
  const D3 = G.Dragon3D = { drawn: 0, arrows: 0, coins: 0, bones: 0, breath: 0 };
  let THREE = null, R3 = null, scene = null;
  const MAXAR = 48, MAXC = 160;
  // (the god's dragon is measured in tiles of its own picture; here one of them is 3.2 m — a beast of some 18 m, wings of 22)
  const SC = 3.2;
  const SEG = 38, RING = 10, S0 = -2.1, S1 = 1.36, NSP = 15;
  const rigs = []; // the meshes of each dragon drawn, kept and given to the next one when it goes
  const vis = new Map(); // d.id → the view's memory of it: its heading and height a frame ago, its bank, its pitch
  let arrows = null, coins = null, light = null, blob = null, MAT = null, M = null;
  const boneG = new Map(); // a skeleton on the ground → its group
  G.worldHooks.push(() => { vis.clear(); for (const g of boneG.values()) dropGroup(g); boneG.clear(); for (const r of rigs) r.root.visible = false; });
  function dropGroup(g) { g.traverse(o => { if (o.geometry && o.geometry.userData.own) o.geometry.dispose(); }); if (g.parent) g.parent.remove(g); }

  D3.init = function (three, realm) {
    THREE = three; R3 = realm; scene = realm.scene();
    M = { a: new THREE.Matrix4(), b: new THREE.Matrix4(), q: new THREE.Quaternion(), v: new THREE.Vector3(), w: new THREE.Vector3(), u: new THREE.Vector3(), s: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), c: new THREE.Color(), z: new THREE.Matrix4().makeScale(0, 0, 0) };
    // (scales: rows of overlapping plates over the body, darker at their rims; a soft light on the edges against the sky)
    const skin = new THREE.MeshLambertMaterial({ vertexColors: true });
    skin.onBeforeCompile = sh => {
      sh.vertexShader = 'attribute vec2 aUV; varying vec2 vUV;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vUV = aUV;');
      sh.fragmentShader = 'varying vec2 vUV;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec2 q = vUV; q.x += step(1.0, mod(floor(q.y), 2.0)) * 0.5; vec2 f = fract(q) - vec2(0.5, 0.15);
        float sc = smoothstep(0.38, 0.5, length(f * vec2(1.0, 1.3))); diffuseColor.rgb *= 1.0 - sc * 0.22;`)
        .replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * 0.4;\n#include <opaque_fragment>');
    };
    // (the wings: thin skin — the sun behind them shows through, red and warm)
    const wing = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    wing.onBeforeCompile = sh => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
        #if NUM_DIR_LIGHTS > 0
        { float bl = max(0.0, dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += diffuseColor.rgb * vec3(1.0, 0.6, 0.4) * directionalLights[0].color * pow(bl, 2.0) * 0.55; }
        #endif
        #include <opaque_fragment>`);
    };
    const plain = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const eye = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bone = new THREE.MeshLambertMaterial({ color: 0xe8e0cc });
    const gold = new THREE.MeshPhongMaterial({ color: 0xf2c14e, specular: 0xfff0b0, shininess: 90, emissive: 0x3a2400 });
    const arrow = new THREE.MeshLambertMaterial({ color: 0x5a3c22 });
    MAT = { skin, wing, plain, eye, bone, gold, arrow };
    // the arrows shot up at it, the coins of its hoard (instanced: a few dozen of each)
    const ag = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4); ag.rotateZ(-Math.PI / 2);
    arrows = new THREE.InstancedMesh(ag, arrow, MAXAR); coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 10), gold, MAXC);
    for (const m of [arrows, coins]) { m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); }
    coins.castShadow = false;
    // (the fire lights what is under it)
    light = new THREE.PointLight(0xff8a3a, 0, 70, 1.3); scene.add(light);
    // (without the sun's shadows, its shadow on the ground is a dark shape under it, fainter the higher it flies)
    blob = new THREE.Mesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0a0c14, transparent: true, opacity: 0.3, depthWrite: false }));
    blob.renderOrder = 2; blob.visible = false; scene.add(blob);
  };

  // ------------------------------ one dragon's meshes ------------------------------
  function dyn(n, uv) {
    const g = new THREE.BufferGeometry(); g.userData.own = 1;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    if (uv) g.setAttribute('aUV', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    return g;
  }
  function painted(geo, hex) { const g = geo.clone(); g.userData.own = 1; const n = g.attributes.position.count; const c = new Float32Array(n * 3); const col = new THREE.Color(hex); for (let k = 0; k < n; k++) { c[k * 3] = col.r; c[k * 3 + 1] = col.g; c[k * 3 + 2] = col.b; } g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g; }
  const WING_N = 3 * 26; // (a fan of triangles from the wrist)
  function rig() {
    const root = new THREE.Group(); root.visible = false; scene.add(root);
    // the body: a tube along the spine, from the tip of the tail to the back of the head
    const bodyG = dyn(SEG * RING + 2, true);
    const idx = [];
    for (let i = 0; i < SEG - 1; i++) for (let j = 0; j < RING; j++) { const a = i * RING + j, b = i * RING + (j + 1) % RING, c = (i + 1) * RING + (j + 1) % RING, d = (i + 1) * RING + j; idx.push(a, d, c, a, c, b); }
    const tip = SEG * RING, end = tip + 1;
    for (let j = 0; j < RING; j++) { idx.push(tip, j, (j + 1) % RING); idx.push(end, (SEG - 1) * RING + (j + 1) % RING, (SEG - 1) * RING + j); }
    bodyG.setIndex(idx);
    const body = new THREE.Mesh(bodyG, MAT.skin); body.castShadow = true; body.frustumCulled = false; root.add(body);
    // the spines of its back and the spade of its tail: thin fins standing on the spine
    const spG = dyn(NSP * 3 + 6); const spikes = new THREE.Mesh(spG, MAT.plain); spikes.castShadow = true; spikes.frustumCulled = false; root.add(spikes);
    // the wings: the skin between the fingers, made again each frame as they beat
    const wings = [-1, 1].map(() => { const g = dyn(WING_N); const m = new THREE.Mesh(g, MAT.wing); m.castShadow = true; m.frustumCulled = false; root.add(m); return m; });
    // the bones of the wings and the legs: capsules placed each frame (in the dragon's own frame)
    const cap = new THREE.CapsuleGeometry(0.5, 1, 2, 6); cap.translate(0, 0.5, 0); cap.userData.own = 1;
    cap.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cap.attributes.position.count * 3).fill(1), 3)); cap.setAttribute('aUV', new THREE.BufferAttribute(new Float32Array(cap.attributes.position.count * 2), 2));
    const limbs = new THREE.InstancedMesh(cap, MAT.skin, 26); limbs.castShadow = true; limbs.frustumCulled = false; limbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); root.add(limbs);
    limbs.setColorAt(0, new THREE.Color(1, 1, 1));
    // the head: skull, the upper jaw, the lower one (it opens to breathe), horns, eyes that burn, the ridge over them
    const head = new THREE.Group(); head.matrixAutoUpdate = false; root.add(head);
    const jaw = new THREE.Group(); jaw.position.set(0.04, -0.02, 0); head.add(jaw); // (it opens at its hinge, under the ear)
    return { root, body, bodyG, spikes, spG, wings, limbs, head, jaw, hue: -1, parts: null };
  }
  // the head's parts, painted in a hue (made when a rig first draws a dragon of that hue)
  function dressHead(r, C) {
    if (r.hue === C) return; r.hue = C;
    if (r.parts) for (const m of r.parts) { m.geometry.dispose(); m.parent.remove(m); }
    const sph = new THREE.SphereGeometry(0.5, 12, 9), cone = new THREE.ConeGeometry(0.5, 1, 7); cone.translate(0, 0.5, 0);
    const mk = (geo, hex, parent, x, y, z, sx, sy, sz, rx, ry, rz, mat) => { const m = new THREE.Mesh(painted(geo, hex), mat || MAT.skin); if (!m.geometry.attributes.aUV) m.geometry.setAttribute('aUV', new THREE.BufferAttribute(new Float32Array(m.geometry.attributes.position.count * 2), 2)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; parent.add(m); r.parts.push(m); return m; };
    r.parts = [];
    const L = C;
    mk(sph, L.body, r.head, 0.12, 0.05, 0, 0.36, 0.24, 0.27);
    mk(sph, L.body, r.head, 0.36, 0.01, 0, 0.36, 0.13, 0.19);
    mk(sph, L.dark, r.head, 0.5, 0.04, 0, 0.1, 0.06, 0.12); // (the nose)
    mk(sph, L.dark, r.head, 0.2, 0.12, 0, 0.26, 0.05, 0.26); // (the ridge over the eyes)
    mk(sph, L.belly, r.jaw, 0.16, -0.01, 0, 0.36, 0.08, 0.16);
    for (const sd of [-1, 1]) {
      mk(cone, L.belly, r.head, 0.0, 0.12, sd * 0.09, 0.07, 0.42, 0.07, sd * 0.35, 0, 1.15);
      mk(cone, L.belly, r.head, 0.08, 0.05, sd * 0.13, 0.04, 0.2, 0.04, sd * 1.1, 0, 0.9);
      for (let k = 0; k < 3; k++) mk(cone, '#f4efe0', r.head, 0.42 - k * 0.07, -0.03, sd * 0.07, 0.02, 0.05, 0.02, Math.PI, 0, 0); // (the teeth of the upper jaw)
    }
    r.eyes = [-1, 1].map(sd => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial({ color: L.eye })); m.geometry.userData.own = 1; m.position.set(0.26, 0.1, sd * 0.125); m.scale.set(0.06, 0.04, 0.03); r.head.add(m); r.parts.push(m); return m; });
  }

  // ------------------------------ the spine, as the god's picture draws it ------------------------------
  // (in its own frame: f forward, u up, r to its right, in tiles of its picture; t the clock, k the size)
  function shape(d, mode, t, K) {
    const sleeping = mode === 'sleep', fallen = mode === 'dead', fly = mode === 'fly';
    const sway = s => (sleeping || fallen ? Math.sin(s * 2.2 + 1) * 0.55 * (s < 0 ? -s : 0) : Math.sin(t * 2.2 + s * 2.4 + d.id) * 0.16 * (1 - s));
    const width = s => s < -1.5 ? 0.02 + (s + 2.1) * 0.03 : s < 0 ? 0.04 + (s + 1.5) / 1.5 * 0.3 : s < 0.55 ? 0.34 - s * 0.32 : s < 1.05 ? 0.15 : 0.15 + (s - 1.05) * 0.2;
    // (in the air the neck lifts the head a little and the body rolls in a slow wave; on the ground it lies on its legs)
    const lift = s => fly ? (s > 0.6 ? (s - 0.6) * 0.22 : 0) + Math.sin(t * 1.7 + s * 1.8 + d.id) * 0.05 * (1 - s * 0.3)
      : 0.25 + (s > 0.6 && !sleeping && !fallen ? (s - 0.6) * 1.3 : 0) + (sleeping && s > 0.6 ? -0.15 : 0) + (sleeping ? Math.sin(t * 0.9) * 0.012 : 0);
    return { sway, width, lift, K };
  }
  // the pose of the wings: the god's seven points of a bat's wing, beating; folded along the back on the ground
  function wingPts(mode, beat, K) {
    if (mode === 'fly' || mode === 'fight' || mode === 'dead') {
      const up = mode === 'dead' ? -0.12 : beat;
      return [[0.35, 0.15, 0], [0.25, 1.0, up * 0.45], [0.15, 1.75, up * 0.95], [-0.5, 2.25, up * 1.15], [-0.7, 1.65, up * 0.9], [-0.62, 1.0, up * 0.5], [-0.25, 0.16, 0]].map(q => [q[0] * K, q[1] * K, q[2] * K]);
    }
    return [[0.35, 0.16, 0.1], [0.15, 0.45, 0.42], [0.05, 0.5, 0.5], [-0.5, 0.56, 0.36], [-0.75, 0.42, 0.26], [-0.88, 0.24, 0.16], [-0.3, 0.12, 0.1]].map(q => [q[0] * K, q[1] * K, q[2] * K + 0.18 * K]);
  }

  function place(r, d, C, t, dt) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM;
    const landed = d.st === 'dorme' || d.st === 'luta'; const dead = d.st === 'morre' && d.fallen;
    const mode = dead ? 'dead' : d.st === 'luta' ? 'fight' : landed ? 'sleep' : 'fly';
    const K = mode === 'fly' ? 1.55 : 1.35;
    let s = vis.get(d.id); if (!s) { s = { hd: d.hd, h: d.h, bank: 0, pitch: 0, tum: 0 }; vis.set(d.id, s); }
    // (it banks into a turn and dips its nose in a dive — from how the world moved it since the last frame)
    let dh = d.hd - s.hd; while (dh > Math.PI) dh -= TAU; while (dh < -Math.PI) dh += TAU;
    const turn = dt > 0 ? dh / dt : 0, vy = dt > 0 ? (d.h - s.h) * HM / dt : 0; s.hd = d.hd; s.h = d.h;
    const kk = 1 - Math.exp(-3 * dt);
    s.bank += ((mode === 'fly' ? G.clamp(turn * 0.55, -0.75, 0.75) : 0) - s.bank) * kk;
    s.pitch += ((mode === 'fly' ? G.clamp(vy * 0.035, -0.55, 0.4) : 0) - s.pitch) * kk;
    if (d.st === 'morre' && !d.fallen) s.tum += dt * 1.6; // (falling out of the sky: it rolls over as it drops)
    const gY = (W.inb(d.x, d.y) ? W.groundH(d.x, d.y) : G.SEA) * HM;
    const Y = mode === 'fly' ? d.h * HM : gY;
    r.root.position.set(d.x * TL, Y, d.y * TL);
    r.root.rotation.set(dead ? 1.25 : s.bank + s.tum, -d.hd, s.pitch, 'YZX');
    r.root.visible = true;
    dressHead(r, C);
    const P = shape(d, mode, t, K);
    // ---- the body
    const pos = r.bodyG.attributes.position.array, nor = r.bodyG.attributes.normal.array, col = r.bodyG.attributes.color.array, uv = r.bodyG.attributes.aUV.array;
    const cb = new THREE.Color(C.body), cd = new THREE.Color(C.dark), cbe = new THREE.Color(C.belly);
    const spine = [];
    for (let i = 0; i < SEG; i++) { const sv = S0 + (S1 - S0) * i / (SEG - 1); spine.push([sv * K * SC, P.lift(sv) * SC, P.sway(sv) * K * SC, P.width(sv) * K * SC, sv]); }
    for (let i = 0; i < SEG; i++) {
      const a = spine[Math.max(0, i - 1)], b = spine[Math.min(SEG - 1, i + 1)], p = spine[i];
      M.v.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); // (along the spine)
      M.s.crossVectors(M.v, M.up).normalize(); M.u.crossVectors(M.s, M.v).normalize(); // (to its right, and up)
      const rw = p[3], rh = p[3] * 0.92;
      for (let j = 0; j < RING; j++) {
        const an = j / RING * TAU, ca = Math.cos(an), sa = Math.sin(an); const o = (i * RING + j) * 3;
        pos[o] = p[0] + M.s.x * ca * rw + M.u.x * sa * rh; pos[o + 1] = p[1] + M.s.y * ca * rw + M.u.y * sa * rh; pos[o + 2] = p[2] + M.s.z * ca * rw + M.u.z * sa * rh;
        M.w.set(M.s.x * ca / rw + M.u.x * sa / rh, M.s.y * ca / rw + M.u.y * sa / rh, M.s.z * ca / rw + M.u.z * sa / rh).normalize();
        nor[o] = M.w.x; nor[o + 1] = M.w.y; nor[o + 2] = M.w.z;
        // (the belly lighter, the ridge of the back darker)
        M.c.copy(cb).lerp(cbe, G.smooth(-0.15, -0.75, sa)).lerp(cd, G.smooth(0.55, 0.98, sa) * 0.65);
        col[o] = M.c.r; col[o + 1] = M.c.g; col[o + 2] = M.c.b;
        uv[(i * RING + j) * 2] = j * 1.5; uv[(i * RING + j) * 2 + 1] = p[4] * 9;
      }
    }
    { const a = spine[0], o = SEG * RING * 3; pos[o] = a[0] - 0.3; pos[o + 1] = a[1]; pos[o + 2] = a[2]; nor[o] = -1; nor[o + 1] = 0; nor[o + 2] = 0; col[o] = cd.r; col[o + 1] = cd.g; col[o + 2] = cd.b; }
    { const a = spine[SEG - 1], o = (SEG * RING + 1) * 3; pos[o] = a[0] + 0.2; pos[o + 1] = a[1]; pos[o + 2] = a[2]; nor[o] = 1; nor[o + 1] = 0; nor[o + 2] = 0; col[o] = cb.r; col[o + 1] = cb.g; col[o + 2] = cb.b; }
    r.bodyG.attributes.position.needsUpdate = r.bodyG.attributes.normal.needsUpdate = r.bodyG.attributes.color.needsUpdate = r.bodyG.attributes.aUV.needsUpdate = true;
    r.bodyG.computeBoundingSphere();
    // ---- the spines along the back, and the spade at the end of the tail
    { const sp = r.spG.attributes.position.array, sc = r.spG.attributes.color.array, sn = r.spG.attributes.normal.array; let o = 0;
      const at = sv => { const i = G.clamp(Math.round((sv - S0) / (S1 - S0) * (SEG - 1)), 0, SEG - 1); return spine[i]; };
      const put = (x, y, z) => { sp[o * 3] = x; sp[o * 3 + 1] = y; sp[o * 3 + 2] = z; sc[o * 3] = cd.r; sc[o * 3 + 1] = cd.g; sc[o * 3 + 2] = cd.b; sn[o * 3] = 0; sn[o * 3 + 1] = 0; sn[o * 3 + 2] = 1; o++; };
      for (let k = 0; k < NSP; k++) { const sv = -1.7 + k * 0.18; const p = at(sv), q = at(sv - 0.12); const hgt = (0.1 + 0.16 * Math.max(0, 1 - Math.abs(sv + 0.2) / 1.6)) * K * SC; put(p[0], p[1] + p[3] * 0.85, p[2]); put(q[0], q[1] + q[3] * 0.85, q[2]); put((p[0] + q[0]) / 2 - 0.15 * K, p[1] + p[3] * 0.85 + hgt, (p[2] + q[2]) / 2); }
      const tp = spine[0], tq = spine[2]; const w = 0.22 * K * SC;
      put(tp[0] - 0.35 * K * SC, tp[1], tp[2]); put(tq[0], tq[1], tq[2] - w); put(tq[0], tq[1], tq[2] + w);
      put(tq[0], tq[1], tq[2] + w); put(tq[0], tq[1], tq[2] - w); put(tp[0] - 0.35 * K * SC, tp[1], tp[2]);
      r.spG.attributes.position.needsUpdate = true; r.spG.attributes.color.needsUpdate = true; r.spG.computeVertexNormals(); r.spG.computeBoundingSphere(); }
    // ---- the head, at the end of the neck, looking along it
    const hEnd = spine[SEG - 1], hPrev = spine[SEG - 3];
    M.v.set(hEnd[0] - hPrev[0], hEnd[1] - hPrev[1], hEnd[2] - hPrev[2]).normalize();
    if (mode === 'fight' || mode === 'fly') M.v.y += mode === 'fight' ? 0.25 : -0.12; M.v.normalize();
    M.s.crossVectors(M.v, M.up).normalize(); M.u.crossVectors(M.s, M.v).normalize();
    const hs = K * SC * 1.05; M.a.makeBasis(M.v, M.u, M.s); M.a.scale(M.w.set(hs, hs, hs)); M.a.setPosition(hEnd[0], hEnd[1], hEnd[2]); r.head.matrix.copy(M.a); r.head.matrixWorldNeedsUpdate = true;
    const breathing = (mode === 'fly' && d.breath) || (mode === 'fight' && S.clock - (d.ft || -9) < 0.8);
    r.jaw.rotation.z = -(breathing ? 0.42 : mode === 'fight' ? 0.12 + Math.sin(t * 5) * 0.08 : 0.02);
    for (const e of r.eyes) { e.scale.y = mode === 'sleep' || mode === 'dead' ? 0.006 : 0.04; e.material.color.set(mode === 'dead' ? '#1a1a1a' : mode === 'sleep' ? C.dark : C.eye); }
    // ---- the wings
    const beat = mode === 'fly' ? Math.sin(t * (d.st === 'passe' ? 3 : 4.6) + d.id) * (d.st === 'passe' ? 0.35 : 1) * (d.st === 'morre' ? 0.25 : 1) : mode === 'fight' ? 0.9 + Math.sin(t * 6) * 0.3 : 0;
    const WP = wingPts(mode, beat, K); const cw = new THREE.Color(C.wing);
    r.wings.forEach((m, wi) => {
      const sd = wi ? 1 : -1; const g = m.geometry; const a = g.attributes.position.array, c = g.attributes.color.array;
      // (the god's points, in metres, at the chest's height on the spine; the skin between the fingers sags in scallops)
      const ch = spine[Math.round((0 - S0) / (S1 - S0) * (SEG - 1))];
      const pt = q => [q[0] * SC, ch[1] + ch[3] * 0.45 + q[2] * SC, ch[2] + sd * q[1] * SC];
      const p = WP.map(pt);
      const out = [p[3]];
      const scallop = (A, B, ia, ib) => { const qa = WP[ia], qb = WP[ib]; const cq = [((qa[0] + qb[0]) / 2 + 0.16 * 1.55) , (qa[1] + qb[1]) / 2 * 0.84, (qa[2] + qb[2]) / 2 - 0.04]; const Cp = pt(cq); for (let k = 1; k <= 4; k++) { const u = k / 4; out.push([0, 1, 2].map(n => (1 - u) * (1 - u) * A[n] + 2 * (1 - u) * u * Cp[n] + u * u * B[n])); } };
      scallop(p[3], p[4], 3, 4); scallop(p[4], p[5], 4, 5); scallop(p[5], p[6], 5, 6); out.push(p[0], p[1]);
      let o = 0; const fill = (q, sh) => { a[o * 3] = q[0]; a[o * 3 + 1] = q[1]; a[o * 3 + 2] = q[2]; M.c.copy(cw).multiplyScalar(sh); c[o * 3] = M.c.r; c[o * 3 + 1] = M.c.g; c[o * 3 + 2] = M.c.b; o++; };
      for (let k = 0; k + 1 < out.length && o + 3 <= WING_N; k++) { fill(p[2], 0.8); fill(sd > 0 ? out[k] : out[k + 1], 1.08); fill(sd > 0 ? out[k + 1] : out[k], 1.08); }
      while (o < WING_N) fill(p[2], 1);
      g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
      r['wp' + wi] = p;
    });
    // ---- bones of the wings, the legs (folded under it in the air), the claws
    let li = 0; const lim = (A, B, rad, hex) => { M.v.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]); const len = M.v.length(); if (len < 1e-4) return; M.v.divideScalar(len); M.q.setFromUnitVectors(M.up, M.v); M.a.compose(M.w.set(A[0], A[1], A[2]), M.q, M.u.set(rad, len, rad)); r.limbs.setMatrixAt(li, M.a); r.limbs.setColorAt(li, M.c.set(hex)); li++; };
    for (const wi of [0, 1]) { const p = r['wp' + wi]; const rad = 0.07 * K; lim(p[0], p[1], rad * 1.3, C.dark); lim(p[1], p[2], rad, C.dark); for (const f of [3, 4, 5]) lim(p[2], p[f], rad * 0.6, C.dark); }
    for (const [f, rr] of [[0.45, -0.36], [0.45, 0.36], [-0.45, -0.32], [-0.45, 0.32]]) {
      const sv = f; const i = G.clamp(Math.round((sv - S0) / (S1 - S0) * (SEG - 1)), 0, SEG - 1); const p = spine[i];
      const hip = [p[0], p[1] - p[3] * 0.4, p[2] + Math.sign(rr) * p[3] * 0.6];
      let foot;
      if (mode === 'fly') foot = [hip[0] - 0.55 * K * SC * 0.45, hip[1] - 0.12 * K * SC, hip[2] + Math.sign(rr) * 0.05 * SC]; // (tucked back in flight)
      else foot = [p[0] + 0.05 * SC, -0.02 - (mode === 'dead' ? 0 : 0), p[2] + rr * K * SC * 0.95];
      const knee = [(hip[0] + foot[0]) / 2 + (mode === 'fly' ? -0.2 : 0.35) * K, (hip[1] + foot[1]) / 2 + 0.1 * K, (hip[2] + foot[2]) / 2 + Math.sign(rr) * 0.25 * K];
      lim(hip, knee, 0.2 * K, C.body); lim(knee, foot, 0.13 * K, C.body); lim(foot, [foot[0] + 0.32 * K, foot[1] + 0.02, foot[2]], 0.07 * K, C.dark);
    }
    for (let k = li; k < 26; k++) r.limbs.setMatrixAt(k, M.z);
    r.limbs.count = 26; r.limbs.instanceMatrix.needsUpdate = true; if (r.limbs.instanceColor) r.limbs.instanceColor.needsUpdate = true;
    r.root.updateMatrixWorld(true);
    // (where its mouth is in the world, for the breath and the smoke of its sleep)
    M.v.set(0.58, 0.0, 0).applyMatrix4(r.head.matrixWorld); r.mouth = [M.v.x, M.v.y, M.v.z];
    r.mode = mode; r.breathing = breathing; r.K = K;
    return r;
  }

  // ------------------------------ the frame ------------------------------
  const emitT = new Map(); G.worldHooks.push(() => emitT.clear());
  function every(key, rate, dt) { let t = (emitT.get(key) || 0) + dt * rate; let n = 0; while (t >= 1) { t -= 1; n++; } emitT.set(key, t); return n; }
  D3.update = function (dt, focus) {
    if (!scene || !focus) return;
    const S = G.S; const P = G.Powers; const TL = G.Space.TILE, HM = G.Space.HM;
    const L = (S.dragons || []); const t = R3.time ? R3.time() : 0; const q = R3.Q();
    const R = q.view + 120; let n = 0, lightK = 0, lx = 0, ly = 0, lz = 0, ice = false;
    const F3 = G.FX3D;
    let blobDone = false;
    for (const d of L) {
      const X = d.x * TL, Z = d.y * TL; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > R * R) continue;
      if (!rigs[n]) rigs[n] = rig();
      const r = place(rigs[n], d, P.dragonLook(d), t, dt); n++;
      const C = P.dragonLook(d); ice = C.breath === 'gelo';
      // the breath: a cone of fire (or frost) from the jaws to the ground ahead, and the light of it
      if (r.breathing && F3) {
        const ahead = r.mode === 'fight' ? 2.4 : 1.8; const tx = (d.x + Math.cos(d.hd) * ahead) * TL, tz = (d.y + Math.sin(d.hd) * ahead) * TL; const ty = (W.inb(tx / TL, tz / TL) ? W.groundH(tx / TL, tz / TL) : G.SEA) * HM;
        const m = r.mouth; const k = every('br' + d.id, 110, dt);
        for (let j = 0; j < k; j++) {
          const u = 0.8 + G.VR() * 0.4, sp = 1.4; const T = 0.5 + G.VR() * 0.2;
          F3.spawn({ x: m[0], y: m[1], z: m[2], vx: (tx - m[0]) / T * u + G.vrr(-sp, sp), vy: (ty - m[1]) / T * u + G.vrr(-sp, sp) * 0.6, vz: (tz - m[2]) / T * u + G.vrr(-sp, sp), life: T, s0: 0.35, s1: 2.6 + G.VR() * 1.4, c: ice ? (G.VR() < 0.5 ? [0.85, 0.96, 1] : [0.45, 0.78, 1]) : (G.VR() < 0.35 ? [1, 0.92, 0.6] : G.VR() < 0.7 ? [1, 0.58, 0.18] : [0.9, 0.28, 0.08]), a: 0.9, sh: 0, drag: 0.6, fade: 1 }, true);
        }
        if (G.VR() < dt * 14) F3.spawn({ x: tx + G.vrr(-2, 2), y: ty + 0.5, z: tz + G.vrr(-2, 2), vx: 0, vy: 1.6, vz: 0, life: 2.2, s0: 1.2, s1: 4.2, c: ice ? [0.85, 0.9, 0.95] : [0.28, 0.26, 0.25], a: 0.5, sh: 0, drag: 0.4, fade: 1 });
        lightK = Math.max(lightK, 1); lx = (m[0] + tx) / 2; ly = (m[1] + ty) / 2 + 1; lz = (m[2] + tz) / 2;
      }
      // (asleep: a thread of smoke from its nostrils now and then)
      if (r.mode === 'sleep' && F3 && every('sl' + d.id, 0.7, dt)) { const m = r.mouth; F3.spawn({ x: m[0], y: m[1] + 0.2, z: m[2], vx: Math.cos(d.hd) * 0.3, vy: 0.5, vz: Math.sin(d.hd) * 0.3, life: 2.6, s0: 0.25, s1: 1.4, c: [0.55, 0.55, 0.55], a: 0.45, sh: 0, drag: 0.5, fade: 1 }); }
      // (its shadow, where the sun's shadows are not drawn)
      if (!q.shadows && !blobDone && r.mode === 'fly') { const g = (W.inb(d.x, d.y) ? W.groundH(d.x, d.y) : G.SEA) * HM; const alt = d.h * HM - g; blob.position.set(X, g + 0.08, Z); const s = (7 + Math.min(alt, 60) * 0.1); blob.scale.set(s, 1, s * 0.6); blob.rotation.y = -d.hd; blob.material.opacity = G.clamp(0.42 - alt * 0.006, 0.08, 0.42); blob.visible = true; blobDone = true; }
    }
    for (let k = n; k < rigs.length; k++) rigs[k].root.visible = false;
    if (!blobDone) blob.visible = false;
    D3.drawn = n;
    // the fires it left on the ground burn a moment; the arrows fly up at it
    const shots = P.dragonShots ? P.dragonShots() : []; let na = 0;
    for (const s of shots) {
      if (s.k === 'breath') {
        if (F3 && G.VR() < dt * 9) { const X = s.x * TL, Z = s.y * TL; const Y = W.groundH(s.x, s.y) * HM; F3.spawn({ x: X + G.vrr(-1, 1), y: Y + 0.2, z: Z + G.vrr(-1, 1), vx: 0, vy: 2 + G.VR() * 1.5, vz: 0, life: 0.7, s0: 0.6, s1: 1.8, c: ice ? [0.6, 0.85, 1] : [1, 0.55, 0.15], a: 0.85, sh: 0, drag: 0.8, fade: 1 }, true); }
        continue;
      }
      if (s.k !== 'arrow' || na >= MAXAR) continue;
      const u = G.clamp(s.t / 0.6, 0, 1); const ax = (s.x0 + (s.x1 - s.x0) * u) * TL, az = (s.y0 + (s.y1 - s.y0) * u) * TL, ay = (s.h0 + (s.h1 - s.h0) * u) * HM + Math.sin(u * Math.PI) * 2;
      M.v.set((s.x1 - s.x0) * TL, (s.h1 - s.h0) * HM + Math.cos(u * Math.PI) * 4, (s.y1 - s.y0) * TL).normalize(); M.q.setFromUnitVectors(M.w.set(1, 0, 0), M.v);
      M.a.compose(M.u.set(ax, ay, az), M.q, M.s.set(1, 1, 1)); arrows.setMatrixAt(na++, M.a);
    }
    arrows.count = na; arrows.instanceMatrix.needsUpdate = true; D3.arrows = na;
    // the hoard under a sleeping one: gold heaped round it, a glint now and then
    let nc = 0;
    for (const d of L) {
      if (!(d.st === 'dorme' || d.st === 'luta') || !(d.hoard > 0)) continue;
      const X = d.x * TL, Z = d.y * TL; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > 140 * 140) continue;
      const m = Math.min(MAXC - nc, Math.round(10 + d.hoard * 0.6)); const gy = W.groundH(d.x, d.y) * HM;
      for (let j = 0; j < m; j++) {
        const a = G.hash(j * 7 + d.id) * TAU, rr = Math.sqrt(G.hash(j * 13 + d.id)) * 5.5; const cx = X + Math.cos(a) * rr, cz = Z + Math.sin(a) * rr; const heap = Math.max(0, 1 - rr / 5.5) * 0.5;
        M.q.setFromAxisAngle(M.v.set(G.hash(j * 3 + 1) - 0.5, 0, G.hash(j * 5 + 2) - 0.5).normalize(), 0.5 * G.hash(j * 11));
        M.a.compose(M.u.set(cx, gy + 0.03 + heap * G.hash(j * 17), cz), M.q, M.s.set(1, 1, 1)); coins.setMatrixAt(nc++, M.a);
        if (F3 && G.VR() < dt * 0.25) F3.spawn({ x: cx, y: gy + 0.2, z: cz, vx: 0, vy: 0.1, vz: 0, life: 0.5, s0: 0.25, s1: 0.05, c: [1, 0.95, 0.7], a: 1, sh: 0, fade: 1 }, true);
      }
    }
    coins.count = nc; coins.instanceMatrix.needsUpdate = true; D3.coins = nc;
    // the light of the fire
    light.color.set(ice ? 0x8ad0ff : 0xff8a3a); light.intensity = lightK ? 34 * (0.8 + G.VR() * 0.4) : 0; light.position.set(lx, ly, lz);
    D3.breath = lightK;
    // the bones of the slain, where they fell
    const keep = new Set(); let nb = 0;
    for (const b of S.dragonBones || []) {
      const X = b.x * TL, Z = b.y * TL; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > R * R) continue;
      keep.add(b); nb++; if (!boneG.has(b)) boneG.set(b, skeleton(b));
    }
    for (const [b, g] of boneG) if (!keep.has(b)) { dropGroup(g); boneG.delete(b); }
    D3.bones = nb;
  };
  // a skeleton on the ground: the spine winding, ribs arching over it, the long bones of the wings, the skull and its horns
  function skeleton(b) {
    const TL = G.Space.TILE, HM = G.Space.HM; const grp = new THREE.Group(); const K = 1.35 * SC;
    const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 6); cyl.translate(0, 0.5, 0);
    const parts = [];
    const lim = (A, B, rad) => { M.v.set(B[0] - A[0], B[1] - A[1], B[2] - A[2]); const len = M.v.length(); M.v.divideScalar(len); M.q.setFromUnitVectors(M.up, M.v); parts.push(new THREE.Matrix4().compose(new THREE.Vector3(A[0], A[1], A[2]), M.q.clone(), new THREE.Vector3(rad, len, rad))); };
    const sp = s => [s * K, 0.12, Math.sin(s * 2) * 0.3 * K];
    for (let s = -2; s < 1.2; s += 0.15) lim(sp(s), sp(s + 0.15), 0.12);
    for (let s = -0.6; s <= 0.6; s += 0.2) for (const sd of [-1, 1]) { const a = sp(s); const m = [a[0] - 0.05 * K, 0.38 * K, a[2] + sd * 0.32 * K], c = [a[0] - 0.1 * K, 0.04, a[2] + sd * 0.42 * K]; lim(a, m, 0.07); lim(m, c, 0.06); }
    for (const sd of [-1, 1]) { const a = [0.25 * K, 0.1, sd * 0.2 * K]; for (const [f, r] of [[0.1, 1.8], [-0.5, 2.1], [-0.7, 1.4]]) lim(a, [f * K, 0.05, sd * r * K], 0.09); }
    const im = new THREE.InstancedMesh(cyl, MAT.bone, parts.length); parts.forEach((m, k) => im.setMatrixAt(k, m)); im.castShadow = true; grp.add(im);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), MAT.bone); skull.geometry.userData.own = 1; const s0 = sp(1.4); skull.position.set(s0[0], 0.5, s0[2]); skull.scale.set(1.6, 0.8, 1.0); skull.castShadow = true; grp.add(skull);
    cyl.userData.own = 1;
    grp.position.set(b.x * TL, W.groundH(b.x, b.y) * HM, b.y * TL); grp.rotation.y = -(b.hd || 0); scene.add(grp);
    return grp;
  }
  // (for the tests and the checker: every dragon in sight has a body where the world says it is, and no part a broken number)
  D3.check = function () {
    const out = []; if (!scene) return out;
    for (const r of rigs) {
      if (!r.root.visible) continue;
      const p = r.root.position; if (!Number.isFinite(p.x + p.y + p.z)) out.push('o dragão do 3D está num lugar inválido');
      const a = r.bodyG.attributes.position.array; for (let k = 0; k < a.length; k += 7) if (!Number.isFinite(a[k])) { out.push('o corpo do dragão do 3D tem um ponto inválido'); break; }
    }
    return out;
  };
  // (for the tests: where each drawn dragon is, its pose and whether it breathes)
  D3.drawnList = () => rigs.filter(r => r.root.visible).map(r => ({ X: r.root.position.x, Y: r.root.position.y, Z: r.root.position.z, mode: r.mode, breathing: !!r.breathing, mouth: r.mouth }));
  D3.clear = function () { for (const r of rigs) r.root.visible = false; if (arrows) arrows.count = 0; if (coins) coins.count = 0; if (light) light.intensity = 0; if (blob) blob.visible = false; };
})(window.G);
