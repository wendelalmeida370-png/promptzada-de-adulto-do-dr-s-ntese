'use strict';
// ============================================================
//  People3D: the real people of the world, near the body, drawn
//  in three dimensions — and the body itself. Each one is the
//  same person the god sees: the same place (v.x, v.y), the same
//  skin and hair (v.skin, v.hair), the clothes of their trade
//  and the colour of their people (Art.clothOf), the height of
//  their age and sex, what they carry. What they are doing in the
//  world (moving, v.act) picks their animation; a small state
//  machine blends one pose into the next, so nobody slides with
//  their legs still and nobody snaps from one pose to another.
//  All the bodies share a few instanced meshes — one per part of
//  the body — so a crowd costs a dozen draw calls, not hundreds.
//  Nothing here is saved, nothing here changes the world: it is
//  only seen. The animals around are drawn the same way, simpler.
// ============================================================
(function (G) {
  const W = G.W;
  const P3 = G.People3D = { count: 0, beasts: 0 };
  const Anim = G.Anim3D = G.Anim3D || {};
  let THREE = null, R3 = null, scene = null;
  const TAU = Math.PI * 2;
  const MAX = 96, MAXA = 64, MAXC = 320; // (full bodies, beasts, and the simple figures of the crowd further off)
  // the parts of a body: [name, shape, x, y, z of its size]
  const PARTS = [
    ['pelvis', 'box', 0.34, 0.16, 0.2], ['torso', 'box', 0.38, 0.5, 0.22], ['head', 'sph', 0.24, 0.27, 0.25], ['hair', 'sph', 0.26, 0.22, 0.27], ['hairL', 'box', 0.22, 0.3, 0.07],
    ['uArmL', 'box', 0.095, 0.3, 0.095], ['uArmR', 'box', 0.095, 0.3, 0.095], ['fArmL', 'box', 0.085, 0.28, 0.085], ['fArmR', 'box', 0.085, 0.28, 0.085], ['handL', 'sph', 0.09, 0.09, 0.09], ['handR', 'sph', 0.09, 0.09, 0.09],
    ['thighL', 'box', 0.135, 0.44, 0.14], ['thighR', 'box', 0.135, 0.44, 0.14], ['shinL', 'box', 0.115, 0.44, 0.12], ['shinR', 'box', 0.115, 0.44, 0.12], ['footL', 'box', 0.1, 0.07, 0.24], ['footR', 'box', 0.1, 0.07, 0.24],
    ['skirt', 'cyl', 0.44, 0.42, 0.34], ['carry', 'box', 0.34, 0.26, 0.3], ['tool', 'box', 0.04, 0.95, 0.04], ['marker', 'cone', 0.14, 0.2, 0.14],
    ['neckP', 'cyl', 0.09, 0.08, 0.09], ['eyeL', 'sph', 0.04, 0.045, 0.03], ['eyeR', 'sph', 0.04, 0.045, 0.03], ['nose', 'sph', 0.045, 0.06, 0.05], ['belt', 'cyl', 0.37, 0.06, 0.24], ['brow', 'box', 0.17, 0.025, 0.03],
    ['torch', 'cyl', 0.05, 0.55, 0.05], ['hem', 'cyl', 0.44, 0.24, 0.34], ['bootL', 'cyl', 0.14, 0.24, 0.15], ['bootR', 'cyl', 0.14, 0.24, 0.15], ['strap', 'box', 0.05, 0.62, 0.27],
    ['torsoF', 'box', 0.38, 0.5, 0.22], ['earL', 'sph', 0.04, 0.06, 0.05], ['earR', 'sph', 0.04, 0.06, 0.05], ['mouth', 'box', 0.06, 0.012, 0.02], ['bun', 'sph', 0.18, 0.18, 0.18], ['beard', 'sph', 0.16, 0.12, 0.12],
  ];
  // (the shape of each part: rounded limbs, a torso with a waist and shoulders, a cap of hair — not crates)
  const SHAPE = { pelvis: 'ball', torso: 'torso', torsoF: 'torsoF', head: 'head', hair: 'cap', hairL: 'limb', uArmL: 'uarm', uArmR: 'uarm', fArmL: 'farm', fArmR: 'farm', thighL: 'thigh', thighR: 'thigh', shinL: 'shin', shinR: 'shin', footL: 'foot', footR: 'foot', neckP: 'cyl', eyeL: 'sph', eyeR: 'sph', nose: 'sph', belt: 'cyl', brow: 'box', earL: 'ball', earR: 'ball', bun: 'ball', beard: 'ball', handL: 'ball', handR: 'ball' };
  const PI = {}; PARTS.forEach((p, k) => { PI[p[0]] = k; });
  let mesh = null; // InstancedMesh per part
  let beastMesh = null, crowd = null, crowdHead = null, crowdHair = null, crowdLegs = null, crowdArms = null;
  const vis = new Map(); // id → the view's own memory of someone: where they were, which way they face, their walk, their pose
  P3.clear = function () { vis.clear(); if (G.Body3D && G.Body3D.clear) G.Body3D.clear(); if (G.Fauna3D && G.Fauna3D.clear) G.Fauna3D.clear(); for (const sp of emoPool) sp.visible = false; if (held) for (const k in held) for (const m of [held[k].a, held[k].t]) if (m) { m.count = 0; m.visible = false; } if (mesh) for (const m of mesh) { m.count = 0; m.instanceMatrix.needsUpdate = true; } if (beastMesh) for (const m of beastMesh) { m.count = 0; } if (crowd) { crowd.count = crowdHead.count = crowdHair.count = crowdLegs[0].count = crowdLegs[1].count = crowdArms[0].count = crowdArms[1].count = 0; } P3.count = 0; P3.crowd = 0; };
  let avFeet = null;
  // (a new world draws no body of the last one: the controller's feed goes with its world, L-1112)
  G.worldHooks.push(() => { vis.clear(); avFeet = null; seenAt[0] = seenAt[1] = 0; cLod.clear(); P3.avatar = null; });

  P3.init = function (three, realm) {
    THREE = three; R3 = realm; scene = realm.scene();
    const geo = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(0.5, 10, 8), cyl: new THREE.CylinderGeometry(0.42, 0.5, 1, 10), cone: new THREE.ConeGeometry(0.5, 1, 4) };
    geo.cone.rotateX(Math.PI); // (a marker over a head points down at it)
    // (a limb: a capsule one unit long; the torso turned on a lathe — waist, chest, shoulders; the head a little egg;
    // the hair a cap over its top and back; a foot a capsule lying along the step)
    geo.limb = new THREE.CapsuleGeometry(0.5, 1, 3, 9); geo.limb.scale(1, 0.5, 1);
    geo.ball = new THREE.SphereGeometry(0.5, 12, 8);
    geo.torso = new THREE.LatheGeometry([[0.0, 0], [0.4, 0.0], [0.43, 0.2], [0.47, 0.55], [0.5, 0.78], [0.44, 0.94], [0.2, 1.0], [0.0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y)), 14); geo.torso.translate(0, -0.5, 0);
    geo.head = new THREE.SphereGeometry(0.5, 16, 12);
    geo.cap = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    geo.foot = new THREE.CapsuleGeometry(0.5, 1, 3, 8); geo.foot.rotateX(Math.PI / 2); geo.foot.scale(1, 1, 0.5);
    // (limbs that narrow as real ones do: the thigh to the knee, the calf swelling below the knee and thinning to the ankle,
    // the forearm to the wrist; a woman's trunk with a waist, a bust and the hips)
    const taper = (r0, r1, bulge, at) => { const pts = [];
      for (let k = 0; k <= 4; k++) { const a = k / 4 * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * r0 * 0.5, 0.5 + Math.cos(a) * 0.1)); }
      for (let k = 1; k < 10; k++) { const u = k / 10; pts.push(new THREE.Vector2((G.lerp(r0, r1, u) + bulge * Math.exp(-((u - at) ** 2) / 0.05)) * 0.5, 0.5 - u)); }
      for (let k = 4; k >= 0; k--) { const a = k / 4 * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * r1 * 0.5, -0.5 - Math.cos(a) * 0.1)); }
      const g = new THREE.LatheGeometry(pts, 10); g.computeVertexNormals(); return g; };
    geo.thigh = taper(1.0, 0.76, 0.06, 0.22); geo.shin = taper(0.84, 0.6, 0.16, 0.26); geo.uarm = taper(1.0, 0.82, 0.06, 0.3); geo.farm = taper(0.96, 0.66, 0.08, 0.18);
    geo.torsoF = new THREE.LatheGeometry([[0.0, 0], [0.45, 0.0], [0.47, 0.17], [0.39, 0.46], [0.45, 0.66], [0.46, 0.78], [0.4, 0.93], [0.18, 1.0], [0.0, 1.0]].map(([r, y]) => new THREE.Vector2(r, y)), 14); geo.torsoF.translate(0, -0.5, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // (a soft light on the edges of a body, as the god's view outlines its little people: they read against the ground)
    // (its strength the sky's light of the hour: at night the outlines do not glow — G.Body3D.rim, set every frame)
    mat.onBeforeCompile = sh => { sh.uniforms.uRim = RIM; sh.fragmentShader = 'uniform float uRim;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * uRim;\n#include <opaque_fragment>'); };
    mat.customProgramCacheKey = () => 'people3d-rim';
    mesh = PARTS.map(p => { const m = new THREE.InstancedMesh(geo[SHAPE[p[0]] || p[1]], p[0] === 'marker' ? new THREE.MeshBasicMaterial({ color: 0xffffff }) : mat, MAX); m.count = 0; m.castShadow = p[0] !== 'marker' && p[0] !== 'eyeL' && p[0] !== 'eyeR' && p[0] !== 'brow' && p[0] !== 'nose'; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); return m; });
    // the beasts: a round body, a neck, a head with its snout and ears and eyes, four legs (or two), a tail, wings, horns,
    // a mane — each part one instanced mesh (BP names them)
    const cone = new THREE.ConeGeometry(0.5, 1, 6); cone.translate(0, 0.5, 0);
    beastMesh = BP.map(p => { const m = new THREE.InstancedMesh(p[1] === 'cone' ? cone : geo[p[1]], mat, MAXA); m.count = 0; m.castShadow = p[0] !== 'eye0' && p[0] !== 'eye1'; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); return m; });
    // the crowd further off: the same real people, drawn simply — a body in their clothes, a head, hair, two legs
    // stepping when they walk (the colours of their clothes, skin and hair)
    const body = new THREE.CapsuleGeometry(0.2, 0.42, 2, 8); body.translate(0, 0.5, 0);
    const leg = new THREE.CapsuleGeometry(0.075, 0.6, 2, 6); leg.translate(0, -0.37, 0);
    crowd = new THREE.InstancedMesh(body, mat, MAXC); crowdHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 10, 8), mat, MAXC);
    crowdHair = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat, MAXC);
    crowdLegs = [new THREE.InstancedMesh(leg, mat, MAXC), new THREE.InstancedMesh(leg, mat, MAXC)];
    // (the arms only of those in the crowd whose arms say something — raised, at the face: 22c fase 5, D-608)
    const arm = new THREE.CapsuleGeometry(0.055, 0.5, 2, 6); arm.translate(0, -0.3, 0); crowdArms = [new THREE.InstancedMesh(arm, mat, MAXC), new THREE.InstancedMesh(arm, mat, MAXC)];
    for (const m of [crowd, crowdHead, crowdHair, ...crowdLegs, ...crowdArms]) { m.count = 0; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); }
    // (a feeling over a head: the god's little bubble with its sign — fear, joy, love, anger, a question)
    emoPool = []; for (let k = 0; k < 20; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); sp.visible = false; sp.renderOrder = 4; scene.add(sp); emoPool.push(sp); }

    // (what the hands hold: one instanced mesh a kind of tool, its wood and iron in the vertex colours; and a mesh a form of load)
    makeTools(mat); held = makeHeld(mat);
    // (the body as one skin, if it starts; the pieces of old stay for the props — and for everything, if it does not)
    skin = !!(G.Body3D && G.Body3D.init(THREE, R3));
    if (skin) PARTS.forEach((p, k) => { if (!PROPS.has(p[0])) mesh[k].visible = false; });
    // (the beasts as one skin each, if it starts; a kind without its mesh — and every kind, if it does not — in the pieces of old)
    fauna = !!(G.Fauna3D && G.Fauna3D.init(THREE, R3));
  };
  // ------------------------------ what the hands hold, and what hangs on the body ------------------------------
  // What a person holds is what the inventory says — G.Inv.held(v), the one door (D-336): their own things, or their trade's kit
  // by their act (the axe at the tree, the rod at the water) —, never a table of the drawing's own (20a, L-1106). Each thing is
  // drawn in the thing's own frame (D-337: the origin at the main hand's grip, +Y along the handle to the end that works, +Z
  // its front): in the right hand by its catalog's grip (G.Itens' pega: a fist round a haft, a shaft, a rod's butt, the bow
  // hand, the shield on the forearm, a handle hanging, a torch upright), in the left the other hand's thing, and stowed on the
  // back and at the belt — frames from the chest and the hips, no bones of their own. Its shape is the item art's
  // (G.ItemArt.geo(key, level)), or, while that has none, the drawing's own shapes of old, kept as the fallback.
  // One instanced mesh a thing and a level, made the first time someone holds one.
  let toolMat = null; const IMESH = new Map(), IMN = new Map(); let fallback = null;
  function makeTools(baseMat) {
    // (the things' own light: the item art's material — the metal shining by its `shine`, as in the bag's pictures — over the
    // people's rim; with no item art, the people's plain Lambert, L-1115)
    if (G.ItemArt && G.ItemArt.material) toolMat = G.ItemArt.material(THREE, { onBeforeCompile: baseMat.onBeforeCompile, key: 'people3d' });
    else { toolMat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }); toolMat.onBeforeCompile = baseMat.onBeforeCompile; toolMat.customProgramCacheKey = () => 'people3d-tool'; }
    return true;
  }
  // (the fallback shapes, by kind and material: the wood, the stone, the bronze and the iron in the vertex colours)
  const MAT_COL = { ferro: [0.42, 0.43, 0.45], bronze: [0.62, 0.42, 0.2], pedra: [0.46, 0.44, 0.4], madeira: [0.36, 0.25, 0.15], corda: [0.6, 0.52, 0.36], vime: [0.62, 0.5, 0.3], couro: [0.42, 0.3, 0.18] };
  function fallbackGeo(kind, mat) {
    const WOOD = [0.36, 0.25, 0.15], DARK = [0.26, 0.17, 0.1], ROPE = [0.6, 0.52, 0.36], IRON = MAT_COL[mat] || MAT_COL.ferro, EDGE = IRON.map(c => Math.min(1, c * 1.5 + 0.03)), LEATH = [0.4, 0.27, 0.15], PITCH = [0.12, 0.09, 0.06];
    const cyl = (r0, r1, y0, y1, n, col) => { const g = new THREE.CylinderGeometry(r1, r0, y1 - y0, n || 7, 1); g.translate(0, (y0 + y1) / 2, 0); return [g, col]; };
    const box = (sx, sy, sz, x, y, z, col, rz, rx) => { const g = new THREE.BoxGeometry(sx, sy, sz); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); return [g, col]; };
    const oct = (sx, sy, sz, y, col) => { const g = new THREE.OctahedronGeometry(1, 0); g.scale(sx, sy, sz); g.translate(0, y, 0); return [g, col]; };
    const ball = (r, y, col) => { const g = new THREE.SphereGeometry(r, 7, 5); g.translate(0, y, 0); return [g, col]; };
    const arc = (R, r, a0, a1, col, n) => { const g = new THREE.TorusGeometry(R, r, 5, n || 10, a1 - a0); g.rotateZ(a0); return [g, col]; };
    const S = {
      // (a spear: an ash shaft of two metres gripped a little under its middle, a binding where the hand holds it, a leaf of metal)
      lanca: () => [cyl(0.015, 0.014, -1.02, 0.86, 7, WOOD), cyl(0.017, 0.016, 0.86, 0.95, 7, IRON), oct(0.028, 0.15, 0.008, 1.08, EDGE), cyl(0.0165, 0.0165, -0.05, 0.06, 7, ROPE)],
      // (an axe: a haft, a bearded head, its edge brighter — the edge the way it strikes: +Z)
      machado: () => [cyl(0.016, 0.014, -0.16, 0.56, 7, WOOD), box(0.024, 0.07, 0.11, 0, 0.53, 0.045, IRON), box(0.026, 0.12, 0.03, 0, 0.51, 0.1, EDGE), box(0.03, 0.05, 0.04, 0, 0.53, -0.03, IRON)],
      martelo: () => [cyl(0.014, 0.012, -0.1, 0.34, 7, WOOD), box(0.05, 0.05, 0.13, 0, 0.34, 0, IRON)],
      picareta: () => [cyl(0.016, 0.014, -0.14, 0.62, 7, WOOD), box(0.03, 0.034, 0.2, 0, 0.6, 0.06, IRON, 0, 0.12), box(0.028, 0.03, 0.16, 0, 0.6, -0.07, IRON, 0, -0.14), box(0.04, 0.05, 0.05, 0, 0.6, 0, IRON)],
      // (a spade gripped at the top of its haft, the blade below; a hoe, its blade turned down at the end)
      pa: () => [cyl(0.015, 0.015, -0.86, 0.08, 7, WOOD), box(0.08, 0.03, 0.03, 0, 0.08, 0, DARK), box(0.19, 0.26, 0.016, 0, -0.98, 0, IRON), box(0.19, 0.03, 0.02, 0, -0.84, 0, IRON)],
      enxada: () => [cyl(0.015, 0.014, -0.25, 0.95, 7, WOOD), box(0.17, 0.11, 0.012, 0, 0.92, 0.05, IRON, 0, 1.2)],
      cajado: () => [cyl(0.019, 0.016, -0.97, 0.2, 7, DARK), ball(0.03, 0.22, DARK)],
      // (a fishing rod, long and thin, its line coiled at the butt)
      vara: () => [cyl(0.014, 0.011, -0.2, 0.7, 6, WOOD), cyl(0.011, 0.006, 0.7, 1.6, 5, WOOD), cyl(0.006, 0.003, 1.6, 2.3, 4, WOOD), cyl(0.02, 0.02, 0.08, 0.13, 7, ROPE)],
      faca: () => [cyl(0.013, 0.012, -0.05, 0.07, 6, DARK), box(0.03, 0.17, 0.006, 0.006, 0.155, 0, EDGE)],
      espada: () => [cyl(0.014, 0.013, -0.06, 0.07, 6, DARK), ball(0.022, -0.08, IRON), box(0.16, 0.022, 0.03, 0, 0.08, 0, IRON), box(0.045, 0.62, 0.009, 0, 0.4, 0, EDGE), oct(0.0225, 0.07, 0.0045, 0.74, EDGE)],
      // (a sickle: a short handle, a curved blade; a club; a sling's cord)
      foice: () => [cyl(0.014, 0.013, -0.06, 0.14, 6, DARK), arc(0.13, 0.008, Math.PI * 0.1, Math.PI * 0.95, EDGE, 9).map((q, i) => (i === 0 ? (q.translate(0, 0.18, 0.1), q) : q))],
      clava: () => [cyl(0.016, 0.035, -0.08, 0.5, 7, DARK), ball(0.045, 0.52, DARK)],
      funda: () => [cyl(0.004, 0.004, -0.4, 0.05, 4, ROPE), box(0.05, 0.06, 0.012, 0, -0.42, 0, LEATH)],
      // (an oar: its loom, its blade at the end; a net bundled over the hand)
      remo: () => [cyl(0.02, 0.018, -0.7, 0.9, 6, WOOD), box(0.15, 0.5, 0.016, 0, 1.12, 0, WOOD)],
      rede: () => [cyl(0.012, 0.012, -0.05, 0.1, 5, ROPE), (() => { const g = new THREE.SphereGeometry(1, 8, 6); g.scale(0.16, 0.24, 0.1); g.translate(0, -0.2, 0); return [g, [0.78, 0.72, 0.54]]; })()],
      // (a torch: the stick and its wrapped head; a bow, its belly to the front, its string; a round shield, its boss)
      tocha: () => [cyl(0.018, 0.015, -0.18, 0.32, 6, DARK), cyl(0.032, 0.028, 0.3, 0.42, 7, PITCH)],
      arco: () => { const L = [arc(0.62, 0.012, -0.95, 0.95, WOOD, 14)]; L[0][0].rotateZ(-Math.PI / 2); L[0][0].rotateY(Math.PI / 2); L[0][0].translate(0, 0, -0.5); const st = cyl(0.002, 0.002, -0.5, 0.5, 3, ROPE); st[0].translate(0, 0, -0.5 + 0.62 * Math.cos(0.95) - 0.5 * 0); L.push(st); L.push(cyl(0.017, 0.017, -0.06, 0.06, 6, LEATH)); return L; },
      escudo: () => { const g = new THREE.CylinderGeometry(0.3, 0.3, 0.025, 16); g.rotateX(Math.PI / 2); g.translate(0, 0, 0.05); const b = new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); b.rotateX(Math.PI / 2); b.translate(0, 0, 0.062); return [[g, WOOD], [b, IRON], box(0.12, 0.02, 0.02, 0, 0, 0.02, LEATH)]; },
      // (a basket and a bucket on their handles, hanging from the fist)
      cesto: () => { const g = new THREE.CylinderGeometry(0.16, 0.12, 0.2, 10, 1, true); g.translate(0, -0.24, 0); return [[g, MAT_COL.vime], arc(0.15, 0.008, 0, Math.PI, MAT_COL.vime, 8).map((q, i) => (i === 0 ? (q.translate(0, -0.14, 0), q) : q))]; },
      balde: () => { const g = new THREE.CylinderGeometry(0.14, 0.12, 0.24, 10, 1, true); g.translate(0, -0.3, 0); return [[g, WOOD], arc(0.14, 0.006, 0, Math.PI, IRON, 8).map((q, i) => (i === 0 ? (q.translate(0, -0.18, 0), q) : q))]; },
    };
    const f = S[kind]; if (!f) return null;
    const list = f(); let nv = 0, ni = 0; for (const [g] of list) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), cl = new Float32Array(nv * 3), idx = new Uint16Array(ni); let o = 0, oi = 0;
    for (const [g, col] of list) {
      const P = g.attributes.position, Nn = g.attributes.normal;
      for (let i = 0; i < P.count; i++) { pos[(o + i) * 3] = P.getX(i); pos[(o + i) * 3 + 1] = P.getY(i); pos[(o + i) * 3 + 2] = P.getZ(i); nor[(o + i) * 3] = Nn.getX(i); nor[(o + i) * 3 + 1] = Nn.getY(i); nor[(o + i) * 3 + 2] = Nn.getZ(i); cl[(o + i) * 3] = col[0]; cl[(o + i) * 3 + 1] = col[1]; cl[(o + i) * 3 + 2] = col[2]; }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.getX(i) + o; else for (let i = 0; i < P.count; i++) idx[oi + i] = o + i;
      oi += g.index ? g.index.count : P.count; o += P.count; g.dispose();
    }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.BufferAttribute(cl, 3)); out.setAttribute('shine', new THREE.BufferAttribute(new Float32Array(nv * 3), 3)); out.setIndex(new THREE.BufferAttribute(idx, 1)); out.computeBoundingBox(); return out;
  }
  P3.FALLBACK = ['lanca', 'machado', 'martelo', 'picareta', 'pa', 'enxada', 'cajado', 'vara', 'faca', 'espada', 'foice', 'clava', 'funda', 'remo', 'rede', 'tocha', 'arco', 'escudo', 'cesto', 'balde'];
  // the mesh of a thing at a level of detail: the item art's shape, else the fallback — made the first time it is held (null: no shape)
  function itemMesh(key, lod) {
    const id = key + '|' + lod; let m = IMESH.get(id); if (m !== undefined) return m;
    const kind = G.Itens ? G.Itens.parse(key)[0] : key, mat = G.Itens && G.Itens.def(key) ? G.Itens.def(key).mat : null;
    let geo = G.ItemArt && G.ItemArt.geo ? G.ItemArt.geo(key, lod) : null; let own = false;
    if (!geo) { const fk = kind + '|' + (mat || ''); if (!fallback) fallback = new Map(); geo = fallback.get(fk); if (geo === undefined) { geo = fallbackGeo(kind, mat); fallback.set(fk, geo); } own = true; }
    if (!geo || !toolMat) { IMESH.set(id, null); return null; }
    m = new THREE.InstancedMesh(geo, toolMat, MAX); m.count = 0; m.visible = false; m.castShadow = lod < 2; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.userData.item = key; m.userData.fallback = own; scene.add(m);
    IMESH.set(id, m); IMN.set(m, 0); return m;
  }
  function itemPut(key, lod, F) { const m = itemMesh(key, Math.max(0, Math.min(2, lod | 0))); if (!m) return false; const n = IMN.get(m); if (n >= MAX) return false; m.setMatrixAt(n, F); IMN.set(m, n + 1); return true; }
  // (a cuirass' waist tabs — the leather's row of short tabs hanging below its foot: the part 'enfeite' of the item art that hangs
  // under the solid edge — are the cuirass' own shape cut in pieces, one mesh a tab, sharing its numbers: each turns out about
  // its top as the thigh under it is raised, as leather does, D-352. tabsOf(key, lod) → null, or { main, tabs: [{ m, a: anchor, t: axis, n: out }] })
  const TABS = new Map();
  function tabsOf(key, lod) {
    const id = key + '|' + lod; if (TABS.has(id)) return TABS.get(id);
    let out = null; const g = G.ItemArt && G.ItemArt.geo ? G.ItemArt.geo(key, lod) : null; const ud = g && g.userData, pt = ud && ud.parts ? ud.parts.find(p => p.name === 'enfeite') : null;
    if (g && pt && itemKind(key) === 'couraca' && toolMat) {
      const P = g.attributes.position.array, I = g.index.array; let lo = 9; for (let i = pt.start; i < pt.start + pt.count; i++) lo = Math.min(lo, P[I[i] * 3 + 1]);
      const nt = lod === 0 ? 12 : 6, K = pt.count / nt;
      if (lo < -0.07 && Number.isInteger(K) && K % 3 === 0) {
        const share = (start, count) => { const q = new THREE.BufferGeometry(); for (const k in g.attributes) q.setAttribute(k, g.attributes[k]); q.setIndex(g.index); q.setDrawRange(start, count); q.boundingSphere = g.boundingSphere; q.boundingBox = g.boundingBox; return q; };
        const mk = (q, tag) => { const m = new THREE.InstancedMesh(q, toolMat, MAX); m.count = 0; m.visible = false; m.castShadow = lod < 2; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.userData.item = key; m.userData.part = tag; scene.add(m); IMN.set(m, 0); return m; };
        out = { main: mk(share(0, pt.start), 'corpo'), tabs: [] };
        for (let j = 0; j < nt; j++) {
          const s0 = pt.start + j * K; let hi = -9; for (let i = s0; i < s0 + K; i++) hi = Math.max(hi, P[I[i] * 3 + 1]);
          const a = [0, 0, 0]; let n = 0; for (let i = s0; i < s0 + K; i++) { const v = I[i] * 3; if (P[v + 1] > hi - 0.006) { a[0] += P[v]; a[1] += P[v + 1]; a[2] += P[v + 2]; n++; } } a[0] /= n; a[1] /= n; a[2] /= n;
          const an = Math.atan2(a[0], a[2]); out.tabs.push({ m: mk(share(s0, K), 'aba'), a, t: [Math.cos(an), 0, -Math.sin(an)], n: [Math.sin(an), 0, Math.cos(an)] });
        }
      }
    }
    TABS.set(id, out); return out;
  }
  P3.tabsOf = tabsOf; // (for the tests: the tabs' meshes and their tops)
  function toolsBegin() { for (const m of IMN.keys()) IMN.set(m, 0); }
  function toolsEnd() { for (const [m, n] of IMN) { m.count = n; m.visible = n > 0; m.instanceMatrix.needsUpdate = true; } }
  P3.toolsReset = () => { toolsBegin(); toolsEnd(); }; // (for the tests: a body drawn alone, its things from the first instance)
  P3.tools = () => { const out = []; for (const [m, n] of IMN) if (n) out.push([m.userData.item, n, m.userData.fallback ? 'reserva' : 'arte']); return out; }; // (for the tests: who holds what this frame)
  P3.toolGeo = (k, lod) => { const m = itemMesh(k, lod || 0); return m ? m.geometry : null; }; // (for the tests: a thing's shape, read only)
  // how a thing is held when no gesture works it (its grip, from the catalog): a shaft upright by the side, a tool hanging from
  // the fist, a rod sloped back over the shoulder, a handle hanging, a torch up; and where it hangs stowed (the back, the belt)
  const SHAFT = new Set(['lanca', 'cajado', 'remo', 'pa', 'enxada', 'picareta']);
  function gripOf(key) { const d = G.Itens && G.Itens.def(key); return d ? d.pega : null; }
  P3.gripOf = gripOf;

  // ------------------------------ what is carried ------------------------------
  // The load in someone's hands is the world's own — v.carry (the good, how much, what it came in: a crate off the boat with
  // its fish, a jar, a basket of berries, a haunch of meat) and v.gear (the fisher's net, an oar) — drawn as the thing it is.
  // Each good has a form (a crate, a sack, a cask, an amphora…), a grip (at the chest with both hands, low and heavy, hugged,
  // cradled in the arms, on the shoulder, on the head, hanging from one hand, on the back by a strap over the brow) and a
  // weight the body's pose shows. What a people carries in, and how, is theirs: wine in amphorae where the amphora is how wine
  // travels and in casks in the north, loads on the back by the tumpline among the Aztecs, baskets on the head on the Nile —
  // the table's rule for every town, never a town's name. Only seen: the load is the world's, the hands only show it.
  // (a form: its size in metres — width across the carrier, height, depth away from them — and where the hands take it)
  const FORM = {
    caixa: { sz: [0.5, 0.38, 0.4] }, caixaPeixe: { sz: [0.5, 0.41, 0.4], tint: 1 }, saco: { sz: [0.36, 0.29, 0.62], tint: 1 }, barril: { sz: [0.44, 0.6, 0.44] },
    anfora: { sz: [0.36, 0.72, 0.36] }, jarro: { sz: [0.31, 0.41, 0.31] }, balde: { sz: [0.3, 0.43, 0.3] }, cesta: { sz: [0.48, 0.35, 0.48], tint: 1 },
    lenha: { sz: [0.86, 0.24, 0.24] }, pedra: { sz: [0.4, 0.26, 0.3] }, pedras: { sz: [0.5, 0.26, 0.32] }, peixe: { sz: [0.08, 0.58, 0.14], tint: 1 }, cambada: { sz: [0.2, 0.62, 0.16], tint: 1 },
    rede: { sz: [0.6, 0.34, 0.4] }, remo: { sz: [0.15, 0.06, 2.1] }, rolo: { sz: [0.18, 0.18, 0.76], tint: 1 }, potes: { sz: [0.42, 0.27, 0.21] },
    bolsa: { sz: [0.15, 0.17, 0.15] }, caixinha: { sz: [0.28, 0.17, 0.2] }, fardo: { sz: [0.62, 0.4, 0.42], tint: 1 }, queijo: { sz: [0.34, 0.13, 0.34] },
    carne: { sz: [0.22, 0.54, 0.2] }, marfim: { sz: [0.12, 0.3, 0.9] }, ferramentas: { sz: [0.16, 0.12, 1.0] },
  };
  P3.FORM = FORM;
  // the goods: [form, grip, kg a unit, kg of the vessel] — a unit of the world's stock is a load's share, not a kilogram, so
  // the weights are what a load of that good feels like in the arms
  const GOOD = {
    wood: ['lenha', 'bracos', 5.5, 0], stone: ['pedra', 'baixo', 9, 0], food: ['cesta', 'peito', 2, 1.2], water: ['balde', 'lado', 9, 1.5],
    sal: ['saco', 'ombro', 7, 0.5], guano: ['saco', 'ombro', 6, 0.5], cafe: ['saco', 'ombro', 6, 0.5], especiarias: ['saco', 'ombro', 3, 0.5], incenso: ['saco', 'ombro', 3, 0.5],
    minerio: ['cesta', 'baixo', 8, 1.5], argila: ['cesta', 'baixo', 7, 1.5], cacau: ['cesta', 'peito', 2, 1.2], tamaras: ['cesta', 'peito', 2, 1.2], camarao: ['cesta', 'peito', 2, 1.2],
    la: ['fardo', 'ombro', 2.5, 0], plumas: ['fardo', 'peito', 0.5, 0], carne_seca: ['fardo', 'ombro', 2, 0],
    tecido: ['rolo', 'ombro', 2.5, 0], seda: ['rolo', 'ombro', 1.5, 0], couro: ['rolo', 'ombro', 3, 0], peles: ['rolo', 'ombro', 3, 0], pele_rara: ['rolo', 'ombro', 3, 0], couro_exotico: ['rolo', 'ombro', 3, 0],
    ceramica: ['potes', 'peito', 2.5, 0], joias: ['caixinha', 'peito', 0.6, 0.8], perolas: ['caixinha', 'peito', 0.3, 0.8], cera: ['caixinha', 'peito', 2, 0.8],
    ouro: ['bolsa', 'lado', 1.5, 0.1], moedas: ['bolsa', 'lado', 0.25, 0.1], mel: ['jarro', 'peito', 2.5, 0.8],
    azeite: ['anfora', 'ombro', 9, 5], vinho: ['anfora', 'ombro', 9, 5], oleo: ['barril', 'abraco', 8, 4], queijo: ['queijo', 'peito', 3, 0],
    bacalhau: ['peixe', 'lado', 3, 0], atum: ['peixe', 'lado', 6, 0], marfim: ['marfim', 'ombro', 12, 0], chifre: ['marfim', 'ombro', 3, 0],
    ferramentas: ['ferramentas', 'ombro', 2.5, 0], armas: ['ferramentas', 'ombro', 3, 0],
    // (the pottery's bricks and adobe, P2's olaria: a stack held low before the body, as the stones)
    tijolo: ['pedras', 'baixo', 7, 0], adobe: ['pedras', 'baixo', 8, 0],
  };
  P3.GOOD = GOOD;
  // the peoples' own ways (a form replaced, a grip): the north keeps its wine and oil in casks; the Aztecs carry the heavy loads
  // on the back by the strap across the brow; on the Nile a basket rides on the head
  const WAYS = {
    nordico: { form: { anfora: 'barril' } }, classico: { form: { anfora: 'barril' } },
    asteca: { grip: { peito: 'costas', baixo: 'costas', bracos: 'costas', ombro: 'costas', abraco: 'costas' }, keep: { caixinha: 1, bolsa: 1, potes: 1, rede: 1, remo: 1, ferramentas: 1, rolo: 1, marfim: 1 } },
    egipcio: { grip: { cesta: 'cabeca' } },
  };
  // (the grips: which hands hold the thing)
  const HANDS = { peito: 'LR', baixo: 'LR', abraco: 'LR', bracos: 'LR', ombro: 'R', cabeca: 'L', lado: 'R', costas: 'LR', chao: '' };
  P3.HANDS = HANDS;
  // (the world's packaging — C1's Depot.form: caixa, saco, barril, anfora, cesta, fardo, pote, peixe, bolsa — and the form
  // here that is of that kind: where the world names the kind and the table a finer form of it, the finer one is drawn)
  const CLASS = { caixa: 'caixa', caixaPeixe: 'caixa', caixinha: 'caixa', saco: 'saco', barril: 'barril', anfora: 'anfora', jarro: 'pote', potes: 'pote', balde: 'pote', cesta: 'cesta', peixe: 'peixe', cambada: 'peixe', bolsa: 'bolsa',
    fardo: 'fardo', lenha: 'fardo', rolo: 'fardo', carne: 'fardo', marfim: 'fardo', ferramentas: 'fardo', pedra: 'fardo', pedras: 'fardo', queijo: 'fardo', rede: 'fardo', remo: 'fardo' };
  const GRIP_OF = { caixa: 'peito', saco: 'ombro', barril: 'abraco', anfora: 'ombro', cesta: 'peito', fardo: 'ombro', jarro: 'peito', peixe: 'lado', bolsa: 'lado' };
  P3.CLASS = CLASS; P3.GRIP_OF = GRIP_OF; // (when C1's depot is in the game, its packaging — Depot.form — picks the form through these)
  // (a colour of the sRGB hex as the graphics card wants it, linear — the conversion three.js makes, without three.js: the
  // load is read before the 3D is made)
  const s2l = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lc = hex => G.hex2rgb(hex).map(q => s2l(q / 255));
  // (the colour of what shows of a load: the fish in a crate and in the hand, the fruit in a basket, a cloth's bolt)
  const TINT = { berries: '#b8303a', shell: '#d8c8b0', leaves: '#5a8a3a', must: '#5a2a4a', grain: '#c8b07a', hay: '#d8b862', fruit: '#d8902a', meat: '#8a3a2a' };
  const heldMemo = new Map(); G.worldHooks.push(() => heldMemo.clear());
  // what someone holds: { form, grip, kg, tint, n, hands, size } — or null. From the world's record only (the load, its marks,
  // the gear, the people's ways); the same load always the same thing
  P3.held = function (v, civ) {
    const c = v.carry && v.carry.n > 0 ? v.carry : null; const gear = !c && v.gear ? v.gear : null;
    if (!c && !gear) return null;
    const key = c ? c : gear; const m = heldMemo.get(v.id);
    if (m && m.key === key && m.n === (c ? c.n : 0) && m.civ === civ) return m.out;
    const out = loadForm(c, gear, civ);
    heldMemo.set(v.id, { key, n: c ? c.n : 0, civ, out }); if (heldMemo.size > 3000) heldMemo.clear();
    return out;
  };
  // (a load — or the gear — as the thing it is, by the people who carry it)
  function loadForm(c, gear, civ) {
    let form = 'caixa', grip = 'peito', kg = 8, tint = null; const n = c ? c.n : 1;
    if (gear) { if (gear === 'rede') { form = 'rede'; grip = 'ombro'; kg = 6; } else if (gear === 'remo') { form = 'remo'; grip = 'ombro'; kg = 3; } else { form = 'caixa'; kg = 10; } }
    else {
      const g = GOOD[c.k] || GOOD.food; form = g[0]; grip = g[1]; kg = g[3] + g[2] * n;
      // (the marks the world put on the load say what it came in)
      // (a crate of fish open, its fish showing; any other crate — the cargo a ship brought — shut: a quay's crate always has a colour)
      if (c.crate) { form = c.fish ? 'caixaPeixe' : 'caixa'; grip = 'peito'; kg = 4 + 3 * n; if (c.fish) tint = c.fishCol || (G.Waters && G.Waters.FISH[c.fish] ? G.Waters.FISH[c.fish].col : null); }
      else if (c.jar) { form = 'jarro'; grip = 'cabeca'; kg = 4 + 9 * n; }
      else if (c.honey) { form = 'jarro'; grip = 'peito'; kg = 1 + 2.5 * n; }
      else if (c.meat) { form = 'carne'; grip = 'ombro'; kg = 3 * n + 2; tint = TINT.meat; }
      else if (c.hay) { form = 'fardo'; grip = 'ombro'; kg = 2.5 * n; tint = TINT.hay; }
      else if (c.grain) { form = 'saco'; grip = 'ombro'; kg = 4 * n + 0.5; tint = TINT.grain; }
      else if (c.fish) { const F = G.Waters && G.Waters.FISH[c.fish]; form = n >= 3 ? 'cambada' : 'peixe'; grip = 'lado'; kg = 1.2 * n; tint = F ? F.col : '#a8c0d0'; }
      else if (c.basket || c.berries || c.shell || c.leaves || c.must) { form = 'cesta'; grip = 'peito'; tint = typeof c.basket === 'string' ? c.basket : c.berries ? TINT.berries : c.shell ? TINT.shell : c.leaves ? TINT.leaves : c.must ? TINT.must : TINT.fruit; }
      else if (form === 'cesta') tint = TINT.fruit;
      if (c.k === 'stone' && n >= 3) form = 'pedras';
      if (!tint && FORM[form].tint) tint = (G.Eco && G.Eco.GOODS && G.Eco.GOODS[c.k] && G.Eco.GOODS[c.k].col) || (c.k === 'sal' ? '#ece8de' : '#c8b48a');
    }
    // (the people's own ways)
    const Wy = WAYS[civ]; if (Wy) { if (Wy.form && Wy.form[form]) form = Wy.form[form]; if (Wy.grip && !(Wy.keep && Wy.keep[form])) grip = (Wy.grip[form] || Wy.grip[grip] || grip); }
    if (form === 'barril' && grip === 'ombro') grip = 'abraco';
    return { form, grip, kg: +kg.toFixed(1), tint: tint ? lc(tint) : null, n, hands: HANDS[grip] || '', size: FORM[form].sz, gear: !!gear };
  }
  // the forms' shapes, made once — each in its own frame: its middle at the origin, +Y up, +Z away from the one who holds it,
  // +X to their left; the wood, the clay, the iron in the vertex colours (a part that shows what it holds — the fish, the
  // fruit, the cloth — white, to be painted by the instance's colour)
  let held = null; const heldN = {};
  function mergeParts(list) {
    let nv = 0, ni = 0; for (const [g] of list) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), cl = new Float32Array(nv * 3), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni); let o = 0, oi = 0;
    for (const [g, col] of list) {
      const P = g.attributes.position, N = g.attributes.normal;
      for (let i = 0; i < P.count; i++) { pos[(o + i) * 3] = P.getX(i); pos[(o + i) * 3 + 1] = P.getY(i); pos[(o + i) * 3 + 2] = P.getZ(i); nor[(o + i) * 3] = N.getX(i); nor[(o + i) * 3 + 1] = N.getY(i); nor[(o + i) * 3 + 2] = N.getZ(i); cl[(o + i) * 3] = col[0]; cl[(o + i) * 3 + 1] = col[1]; cl[(o + i) * 3 + 2] = col[2]; }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.getX(i) + o; else for (let i = 0; i < P.count; i++) idx[oi + i] = o + i;
      oi += g.index ? g.index.count : P.count; o += P.count; g.dispose();
    }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.BufferAttribute(cl, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
    out.computeBoundingBox(); return out;
  }
  function makeHeld(baseMat) {
    const WOOD = lc('#8a6a44'), DARK = lc('#5a4028'), OAK = lc('#6b4a2e'), IRON = lc('#4a4a4e'), CLAY = lc('#b8704a'), CLAYD = lc('#8a4a2a'), WICK = lc('#a8844c'), ROPE = lc('#b8a070'), BARK = lc('#6b4a2e'), PALE = lc('#d6b27a'),
      STONE = lc('#9a958c'), LEATH = lc('#7a5634'), GOLD = lc('#d8b04a'), WHITE = [0.92, 0.92, 0.92], CHEESE = lc('#e0b24a'), RIND = lc('#c8902a'), BONE = lc('#ece4d0'), IVORY = lc('#efe6cf'), NET = lc('#c8b88a'), RED = lc('#c8483a'), WATER = lc('#5a8ab8');
    // (the kit: a box, a cylinder — along Y, or turned to X or Z —, a lathe of [radius, height] points, an ellipsoid, a ring)
    const tr = (g, x, y, z, rx, ry, rz) => { if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); if (rz) g.rotateZ(rz); g.translate(x || 0, y || 0, z || 0); return g; };
    const box = (sx, sy, sz, x, y, z, col, rx, ry, rz) => [tr(new THREE.BoxGeometry(sx, sy, sz), x, y, z, rx, ry, rz), col];
    const cyl = (r0, r1, h, n, x, y, z, col, ax, open) => { const g = new THREE.CylinderGeometry(r1, r0, h, n || 8, 1, !!open); if (ax === 'x') g.rotateZ(-Math.PI / 2); else if (ax === 'z') g.rotateX(Math.PI / 2); return [tr(g, x, y, z), col]; };
    const lathe = (pts, n, col, x, y, z, rx, ry, rz) => [tr(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), n || 10), x, y, z, rx, ry, rz), col];
    const ell = (rx0, ry0, rz0, x, y, z, col, ws, hs, ax, ay, az) => { const g = new THREE.SphereGeometry(1, ws || 8, hs || 6); g.scale(rx0, ry0, rz0); return [tr(g, x, y, z, ax, ay, az), col]; };
    const ring = (r, t, x, y, z, col, rx, ry, rz, arc) => [tr(new THREE.TorusGeometry(r, t, 4, 12, arc || Math.PI * 2), x, y, z, rx, ry, rz), col];
    const disc = (r, n, x, y, z, col, ax) => { const g = new THREE.CircleGeometry(r, n || 8); if (ax === 'x') g.rotateY(Math.PI / 2); else if (ax === '-x') g.rotateY(-Math.PI / 2); else if (ax === 'y') g.rotateX(-Math.PI / 2); return [tr(g, x, y, z), col]; };
    const fishShape = (y, s, rz) => { const L = [[0, -0.25], [0.04, -0.15], [0.064, 0.0], [0.045, 0.15], [0, 0.25]]; const g = new THREE.LatheGeometry(L.map(([r, h]) => new THREE.Vector2(r * s, h * s)), 6); g.scale(0.55, 1, 1);
      const fin = box(0.006, 0.07 * s, 0.12 * s, 0, -0.28 * s, 0, WHITE); tr(fin[0], 0, y, 0, 0, 0, rz || 0); return [[tr(g, 0, y, 0, 0, 0, rz || 0), WHITE], fin]; };
    const G0 = {};
    // a crate of planks: its corner posts, the rims round its top and its foot, the joints of the planks; shut with its lid
    const crate = lid => { const L = [box(0.47, 0.35, 0.37, 0, 0, 0, WOOD), box(0.472, 0.012, 0.372, 0, 0.06, 0, DARK), box(0.472, 0.012, 0.372, 0, -0.06, 0, DARK)];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.push(box(0.04, 0.38, 0.04, sx * 0.23, 0, sz * 0.18, DARK));
      for (const y of [-0.17, 0.17]) { for (const s of [-1, 1]) { L.push(box(0.5, 0.035, 0.04, 0, y, s * 0.18, OAK)); L.push(box(0.04, 0.035, 0.4, s * 0.23, y, 0, OAK)); } }
      if (lid) { L.push(box(0.48, 0.03, 0.38, 0, 0.19, 0, WOOD)); L.push(box(0.04, 0.032, 0.38, 0, 0.205, 0, DARK)); } else L.push(box(0.44, 0.02, 0.34, 0, 0.12, 0, DARK)); // (open: the fish lie on the planks inside)
      return L; };
    G0.caixa = [crate(true)]; G0.caixaPeixe = [crate(false), [...fishShape(0.165, 0.85, Math.PI / 2 - 0.1).map(p => (tr(p[0], 0.02, 0, -0.07), p)), ...fishShape(0.17, 0.8, Math.PI / 2 + 0.25).map(p => (tr(p[0], -0.03, 0.01, 0.07), p)), ...fishShape(0.2, 0.75, Math.PI / 2 - 0.6).map(p => (tr(p[0], 0.06, 0.02, 0.01), p))]];
    // a sack lying along the shoulder: its belly, the neck tied
    G0.saco = [[], [(() => { const g = new THREE.LatheGeometry([[0, -0.31], [0.12, -0.3], [0.17, -0.25], [0.18, -0.1], [0.175, 0.08], [0.15, 0.2], [0.08, 0.27], [0.05, 0.29], [0.07, 0.31], [0.0, 0.33]].map(([r, h]) => new THREE.Vector2(r, h)), 10); g.rotateX(Math.PI / 2); g.scale(1, 0.8, 1); return [g, WHITE]; })(), box(0.12, 0.03, 0.03, 0, 0, 0.29, WHITE)]];
    // a cask of staves on its hoops
    { const prof = [[0, -0.3], [0.19, -0.3], [0.205, -0.2], [0.22, 0], [0.205, 0.2], [0.19, 0.3], [0, 0.3]]; const L = [lathe(prof, 12, OAK)];
      for (const [y, r] of [[-0.26, 0.198], [-0.12, 0.214], [0.12, 0.214], [0.26, 0.198]]) L.push(cyl(r + 0.006, r + 0.006, 0.03, 12, 0, y, 0, IRON, null, true));
      L.push(disc(0.19, 10, 0, 0.301, 0, PALE, 'y')); G0.barril = [L]; }
    // an amphora: its toe, the belly, the shoulder, the neck and its rim, two handles
    G0.anfora = [[lathe([[0, -0.36], [0.03, -0.35], [0.05, -0.3], [0.13, -0.18], [0.18, -0.02], [0.18, 0.08], [0.14, 0.18], [0.07, 0.24], [0.055, 0.3], [0.065, 0.34], [0.07, 0.36], [0.05, 0.36], [0, 0.35]], 10, CLAY),
      ring(0.055, 0.012, 0.085, 0.27, 0, CLAYD, 0, 0, Math.PI / 2, Math.PI), ring(0.055, 0.012, -0.085, 0.27, 0, CLAYD, 0, 0, -Math.PI / 2, Math.PI)]];
    // a water jar (and the small pot of honey: the same, smaller)
    G0.jarro = [[lathe([[0, -0.2], [0.09, -0.19], [0.14, -0.12], [0.155, 0], [0.13, 0.1], [0.075, 0.16], [0.065, 0.19], [0.08, 0.205], [0.06, 0.21], [0, 0.2]], 12, CLAY), ring(0.07, 0.008, 0, 0.2, 0, CLAYD, Math.PI / 2)]];
    // a bucket of staves, the water in it, its handle
    G0.balde = [[lathe([[0, -0.14], [0.12, -0.14], [0.15, 0.14], [0.138, 0.14], [0.11, -0.12], [0, -0.12]], 12, OAK), cyl(0.127, 0.127, 0.025, 12, 0, -0.1, 0, IRON, null, true), cyl(0.15, 0.15, 0.025, 12, 0, 0.11, 0, IRON, null, true),
      disc(0.13, 12, 0, 0.09, 0, WATER, 'y'), ring(0.15, 0.007, 0, 0.14, 0, IRON, 0, 0, 0, Math.PI)]];
    // a basket of wicker, its rim, and what is in it heaped in its mouth
    G0.cesta = [[lathe([[0, -0.12], [0.16, -0.12], [0.21, -0.02], [0.23, 0.12], [0.215, 0.12], [0.195, -0.0], [0.15, -0.1], [0, -0.1]], 12, WICK), ring(0.225, 0.016, 0, 0.12, 0, DARK, Math.PI / 2)],
      [ell(0.075, 0.07, 0.075, -0.08, 0.1, -0.05, WHITE, 6, 4), ell(0.07, 0.065, 0.07, 0.08, 0.1, -0.06, WHITE, 6, 4), ell(0.075, 0.07, 0.07, 0.0, 0.11, 0.07, WHITE, 6, 4), ell(0.065, 0.06, 0.065, -0.1, 0.09, 0.08, WHITE, 6, 4), ell(0.07, 0.07, 0.07, 0.03, 0.16, 0.0, WHITE, 6, 4)]];
    // firewood: four split logs across the arms, the pale of their ends, two ties
    { const L = []; for (const [y, z, x] of [[-0.055, -0.06, 0.02], [-0.055, 0.06, -0.02], [0.055, 0, 0.03], [0.05, 0.11, -0.04]]) { L.push(cyl(0.06, 0.06, 0.84, 7, x, y, z, BARK, 'x', true)); L.push(disc(0.058, 7, x + 0.42, y, z, PALE, 'x')); L.push(disc(0.058, 7, x - 0.42, y, z, PALE, '-x')); }
      for (const s of [-1, 1]) L.push(ring(0.13, 0.008, s * 0.24, 0, 0.03, ROPE, 0, Math.PI / 2, 0)); G0.lenha = [L]; }
    // a stone block (and two)
    const rock = (sx, sy, sz, x, y, z, ry) => { const g = new THREE.DodecahedronGeometry(1, 0); g.scale(sx, sy, sz); return [tr(g, x, y, z, 0, ry || 0), STONE]; };
    G0.pedra = [[rock(0.2, 0.13, 0.15, 0, 0, 0, 0.3)]]; G0.pedras = [[rock(0.14, 0.12, 0.15, -0.12, -0.01, 0, 0.2), rock(0.13, 0.11, 0.14, 0.13, 0, 0.01, 1.1)]];
    // a fish held by the gills, hanging; three on a cord
    G0.peixe = [[], fishShape(-0.02, 1, 0)]; // (head up, held by the gills: its middle under the fist)
    G0.cambada = [[cyl(0.004, 0.004, 0.12, 4, 0, 0.26, 0, ROPE)], [...fishShape(-0.04, 0.9, 0).map(p => (tr(p[0], -0.05, 0, 0), p)), ...fishShape(-0.08, 0.85, 0).map(p => (tr(p[0], 0.05, 0, 0.03), p)), ...fishShape(-0.02, 0.8, 0).map(p => (tr(p[0], 0, 0, -0.04), p))]];
    // a net bundled for the shoulder, its floats
    G0.rede = [[ell(0.3, 0.17, 0.2, 0, 0, 0, NET, 10, 6), ell(0.035, 0.035, 0.035, 0.18, 0.1, 0.1, RED, 6, 4), ell(0.035, 0.035, 0.035, -0.1, 0.13, -0.08, RED, 6, 4), ell(0.035, 0.035, 0.035, 0.05, 0.15, 0.12, PALE, 6, 4)]];
    // an oar: its loom forward of the shoulder, the blade behind
    G0.remo = [[cyl(0.022, 0.02, 1.6, 6, 0, 0, 0.25, WOOD, 'z'), box(0.15, 0.016, 0.5, 0, 0, -0.8, WOOD), cyl(0.026, 0.026, 0.12, 6, 0, 0, 1.02, DARK, 'z')]];
    // a bolt of cloth, a rolled hide (the colour of the good), its ties
    G0.rolo = [[ring(0.092, 0.006, 0, 0, 0.26, ROPE), ring(0.092, 0.006, 0, 0, -0.26, ROPE)], [cyl(0.09, 0.09, 0.76, 10, 0, 0, 0, WHITE, 'z'), disc(0.088, 10, 0, 0, 0.381, WHITE), disc(0.088, 10, 0, 0, -0.381, WHITE)]];
    // two pots against the chest
    { const pot = x => lathe([[0, -0.13], [0.07, -0.12], [0.1, -0.05], [0.105, 0.02], [0.08, 0.09], [0.055, 0.11], [0.065, 0.13], [0, 0.125]], 8, CLAY, x, 0, 0); G0.potes = [[pot(-0.11), pot(0.11), cyl(0.066, 0.066, 0.016, 8, -0.11, 0.124, 0, CLAYD, null, true), cyl(0.066, 0.066, 0.016, 8, 0.11, 0.124, 0, CLAYD, null, true)]]; }
    // a purse of coins hanging from the fist
    G0.bolsa = [[lathe([[0, -0.08], [0.06, -0.07], [0.075, -0.03], [0.062, 0.02], [0.025, 0.05], [0.035, 0.07], [0, 0.075]], 8, LEATH), ring(0.027, 0.006, 0, 0.05, 0, ROPE, Math.PI / 2)]];
    // a little chest bound in metal
    G0.caixinha = [[box(0.28, 0.12, 0.2, 0, -0.025, 0, DARK), cyl(0.1, 0.1, 0.28, 8, 0, 0.035, 0, OAK, 'x'), box(0.02, 0.17, 0.205, -0.1, 0, 0, GOLD), box(0.02, 0.17, 0.205, 0.1, 0, 0, GOLD), box(0.04, 0.04, 0.01, 0, 0.0, 0.105, GOLD)]];
    // a bale (wool, hay, feathers: the colour of the good)
    G0.fardo = [[ring(0.21, 0.01, -0.18, 0, 0, ROPE, 0, Math.PI / 2, 0), ring(0.21, 0.01, 0.18, 0, 0, ROPE, 0, Math.PI / 2, 0)], [(() => { const g = new THREE.CapsuleGeometry(0.2, 0.22, 3, 9); g.rotateZ(Math.PI / 2); g.scale(1, 0.95, 1.05); return [g, WHITE]; })()]];
    // a wheel of cheese
    G0.queijo = [[cyl(0.17, 0.17, 0.11, 14, 0, 0, 0, CHEESE), cyl(0.165, 0.165, 0.012, 14, 0, 0.06, 0, RIND), cyl(0.165, 0.165, 0.012, 14, 0, -0.06, 0, RIND)]];
    // a haunch with its bone
    G0.carne = [[cyl(0.02, 0.018, 0.13, 6, 0, 0.24, 0, BONE), ell(0.035, 0.03, 0.035, 0, 0.31, 0, BONE, 6, 4)], [ell(0.11, 0.19, 0.095, 0, 0, 0, WHITE, 8, 6)]];
    // a tusk, curved, over the shoulder
    G0.marfim = [[cyl(0.06, 0.05, 0.36, 8, 0, -0.06, -0.26, IVORY, 'z'), (() => { const g = new THREE.CylinderGeometry(0.03, 0.05, 0.34, 8); g.rotateX(Math.PI / 2 - 0.35); g.translate(0, 0.03, 0.06); return [g, IVORY]; })(), (() => { const g = new THREE.ConeGeometry(0.03, 0.26, 8); g.rotateX(Math.PI / 2 - 0.8); g.translate(0, 0.14, 0.3); return [g, IVORY]; })()]];
    // the hafts of a bundle of tools, their iron
    G0.ferramentas = [[cyl(0.016, 0.016, 1.0, 6, -0.03, 0, 0, WOOD, 'z'), cyl(0.016, 0.016, 0.95, 6, 0.03, 0.01, 0.02, WOOD, 'z'), cyl(0.016, 0.016, 0.9, 6, 0, 0.04, -0.03, OAK, 'z'), box(0.12, 0.05, 0.03, -0.03, 0, 0.5, IRON), box(0.03, 0.12, 0.05, 0.03, 0.02, 0.47, IRON), box(0.08, 0.02, 0.1, 0, 0.04, 0.44, IRON)]];
    // (one instanced mesh a form — its part of plain stuff, and its part painted the colour of what it holds)
    const tm = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }); tm.onBeforeCompile = baseMat.onBeforeCompile; tm.customProgramCacheKey = () => 'people3d-held';
    const out = {};
    for (const k in G0) {
      const [plain, tinted] = G0[k]; out[k] = {};
      if (plain && plain.length) { const m = new THREE.InstancedMesh(mergeParts(plain), tm, MAX); m.count = 0; m.visible = false; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); out[k].a = m; }
      if (tinted && tinted.length) { const m = new THREE.InstancedMesh(mergeParts(tinted), tm, MAX); m.count = 0; m.visible = false; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); out[k].t = m; }
      heldN[k] = 0;
    }
    return out;
  }
  const HC = { c: null }; // (a colour, reused)
  // (one held thing drawn: its frame — the rig's 'carry' bone, unscaled — and its colour)
  function heldPut(R, L) {
    const H = L.held; const f = H && held && held[H.form]; if (!f || heldN[H.form] >= MAX) return false;
    const i = heldN[H.form]++; if (f.a) f.a.setMatrixAt(i, R[B.carry]);
    if (f.t) { f.t.setMatrixAt(i, R[B.carry]); if (!HC.c) HC.c = new THREE.Color(); const t = H.tint || [0.8, 0.75, 0.6]; HC.c.setRGB(t[0], t[1], t[2]); f.t.setColorAt(i, HC.c); }
    return true;
  }
  function heldBegin() { if (held) for (const k in held) heldN[k] = 0; }
  function heldEnd() { if (held) for (const k in held) { const f = held[k]; for (const m of [f.a, f.t]) { if (!m) continue; m.count = heldN[k]; m.visible = heldN[k] > 0; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } } }
  P3.helds = () => (held ? Object.keys(held).filter(k => heldN[k]).map(k => [k, heldN[k]]) : []); // (for the tests: what is held this frame)
  P3.heldGeo = k => (held && held[k] ? [held[k].a && held[k].a.geometry, held[k].t && held[k].t.geometry].filter(Boolean) : null); // (for the tests: a form's shape, read only)

  // ------------------------------ the loads lying in the world ------------------------------
  // The crates set down on a quay — the world's own, b.crates (G.Depot's 'q:'), the same the god's view draws by the water
  // (fishers.js crateSpot) — and what someone dropped where they fell (S.loose, G.Depot's 'g:'): drawn as the forms carried, so
  // the crate a docker lifts is the crate that lay there, and the one set down lies there after. A crate keeps its place while
  // it is there (the view's memory of each quay, by the crate's name); a new one takes the first free place. Only seen: the
  // world is only read here
  const QSLOT = []; for (let r = 0; r < 2; r++) for (let a = 0; a < 5; a++) QSLOT.push([(a - 2) * 0.56, r * 0.5]); // (two rows of five, the first by the water)
  P3.QSLOT = QSLOT;
  P3.lying = []; // ([X, Y, Z, form, crate's name, quay's id, its place in the quay's list] drawn this frame: for the hands and the tests)
  let quays = new Map(), dockList = [], dockKey = '';
  G.worldHooks.push(() => { quays = new Map(); dockList = []; dockKey = ''; P3.lying.length = 0; });
  // (the quays: looked for again when a building comes or goes, and every few seconds of the world)
  const docksNow = () => { const S = G.S; const key = S.buildings.size + ':' + Math.floor(S.clock / 4); if (dockKey !== key) { dockKey = key; dockList = []; for (const b of S.buildings.values()) if (b.type === 'doca') dockList.push(b); } return dockList; };
  // (where the god's view lays a quay's crates — fishers.js crateSpot —, from the quay's own record, only read: the spot the
  // world chose in its step (b.cs, by the quay's own ground b.qs — L-138: a quay in a pocket keeps them on the town's side);
  // none chosen yet, the same rule from the quay's record; no record, none drawn)
  P3.crateSpot = function (b) { if (b.cs) return b.cs; const di = b._dock; const q = b.qs || (di && di.quay); if (!q) return null; const wd = b.wd || [1, 0]; const p = [q[0] - wd[0] * 0.9 + wd[1] * 0.8, q[1] - wd[1] * 0.9 - wd[0] * 0.8]; return W.walkableXY(p[0], p[1]) ? p : q; };
  // (the crates of a quay drawn this frame: for the hands, and for the lead to them)
  P3.lyingOf = id => P3.lying.filter(e => e[5] === id);
  const LM = { m: null, c: null }; const lcMemo = new Map();
  const lcOf = hex => { let c = lcMemo.get(hex); if (!c) { c = lc(hex); lcMemo.set(hex, c); } return c; };
  // (a form put down: its middle at X, Y, Z, its width along (ax, az), upright — or lying on its side, flat)
  function lyingPut(form, X, Y, Z, ax, az, tint, flat) {
    const f = held && held[form]; if (!f || heldN[form] >= MAX) return false;
    if (!LM.m) { LM.m = new THREE.Matrix4(); LM.c = new THREE.Color(); }
    if (flat) LM.m.set(ax, -az, 0, X, 0, 0, -1, Y, az, ax, 0, Z, 0, 0, 0, 1); else LM.m.set(ax, 0, -az, X, 0, 1, 0, Y, az, 0, ax, Z, 0, 0, 0, 1);
    const i = heldN[form]++; if (f.a) f.a.setMatrixAt(i, LM.m);
    if (f.t) { f.t.setMatrixAt(i, LM.m); const t = tint || [0.8, 0.75, 0.6]; LM.c.setRGB(t[0], t[1], t[2]); f.t.setColorAt(i, LM.c); }
    return true;
  }
  const FLAT = { peixe: 1, cambada: 1, remo: 1, ferramentas: 1, marfim: 1 }; // (what lies flat on the ground: it hangs or rides along in the hands)
  // (water one would stand in: a river not bridged nor frozen, the sea not parted)
  const wet = (x, y) => { const S = G.S; if (!W.inb(x, y)) return false; const i = W.idx(x, y); const t = S.type[i]; return (t === G.T.RIVER && !S.road[i] && !(S.ice && S.ice[i])) || (t <= G.T.SEA && !(S.dry && S.dry[i])); };
  function lyingDraw(focus, R2) {
    const S = G.S; const TL = G.Space.TILE; P3.lying.length = 0; if (!held) return;
    for (const b of docksNow()) {
      const L = b.crates; if (!b.built || !L || !L.length) { quays.delete(b.id); continue; }
      const p = P3.crateSpot(b); if (!p) continue; const wd = b.wd || [1, 0]; const ax = -wd[1], az = wd[0]; // (along the water's edge; the rows step back from it)
      // (on dry ground: where the god's view's spot falls in a ford, the crates stand back from the water, never under it)
      let X0 = p[0] * TL, Z0 = p[1] * TL; for (let q = 0; q < 6 && wet(X0 / TL, Z0 / TL); q++) { X0 -= wd[0] * 0.5; Z0 -= wd[1] * 0.5; }
      if ((X0 - focus.X) ** 2 + (Z0 - focus.Z) ** 2 > R2) continue;
      let mem = quays.get(b.id); if (!mem) quays.set(b.id, mem = new Map());
      // (the places of the crates gone are free again; a new crate takes the first free one)
      const here = new Set(); for (let i = 0; i < L.length; i++) here.add(L[i].id !== undefined ? L[i].id : 'i' + i);
      for (const id of [...mem.keys()]) if (!here.has(id)) mem.delete(id);
      const used = new Set(mem.values());
      for (let i = 0; i < L.length; i++) {
        const c = L[i]; const id = c.id !== undefined ? c.id : 'i' + i; let k = mem.get(id);
        if (k === undefined) { k = 0; while (used.has(k)) k++; if (k >= QSLOT.length) continue; mem.set(id, k); used.add(k); }
        const [a, n] = QSLOT[k]; let X = X0 + ax * a - wd[0] * n, Z = Z0 + az * a - wd[1] * n; for (let q = 0; q < 4 && wet(X / TL, Z / TL); q++) { X -= wd[0] * 0.5; Z -= wd[1] * 0.5; }
        const form = c.fish ? 'caixaPeixe' : 'caixa'; const Y = groundY(X / TL, Z / TL) + FORM[form].sz[1] / 2 + 0.005;
        if (lyingPut(form, X, Y, Z, ax, az, c.fish && c.col ? lcOf(c.col) : null)) P3.lying.push([X, Y, Z, form, id, b.id, i]);
      }
    }
    // (what fell from someone's arms: the load as it was carried, its form by the people who carried it)
    for (const o of S.loose || []) {
      const X = o.x * TL, Z = o.y * TL; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > R2) continue;
      const f = G.Fac.get(o.fac); const H = loadForm({ k: o.k, n: o.n, crate: o.cid ? 1 : 0, fish: o.fish || null, fishCol: o.col || null }, null, f ? f.civ : null); if (!H) continue;
      const a = G.hash(o.id * 7 + 3) * TAU; const flat = !!FLAT[H.form]; const Y = groundY(o.x, o.y) + (flat ? H.size[2] : H.size[1]) / 2 + 0.005;
      if (lyingPut(H.form, X, Y, Z, Math.cos(a), Math.sin(a), H.tint, flat)) P3.lying.push([X, Y, Z, H.form, o.id, 0, -1]);
    }
  }
  // the load the hands of someone at X, Z would take next (metres; r: how far): on the nearest quay with crates in reach, the
  // crate the world hands out first — the first of its list —; otherwise the nearest thing lying there. Its middle, or null
  P3.nearLoad = function (X, Z, r) {
    let best = null, bd = r * r, bq = null, bqd = r * r;
    for (const e of P3.lying) { const d = (e[0] - X) ** 2 + (e[2] - Z) ** 2; if (e[5] && e[6] === 0 && d < bqd) { bqd = d; bq = e; } if (d < bd) { bd = d; best = e; } }
    const e = bq || best; return e ? [e[0], e[1], e[2]] : null;
  };

  let emoPool = []; const emoTex = new Map();
  function emoMap(k) { let t = emoTex.get(k); if (t === undefined) { const s = G.Art && G.Art.icon ? G.Art.icon(k) : null; t = s && s.c ? new THREE.CanvasTexture(s.c) : null; if (t) t.colorSpace = THREE.SRGBColorSpace; emoTex.set(k, t); } return t; }

  // ------------------------------ looks ------------------------------
  const C3 = {};
  function color(hex) { let c = C3[hex]; if (!c) { c = new THREE.Color(); c.set(hex || '#888888'); C3[hex] = c; } return c; }
  const darker = (hex, f) => { const r = G.hex2rgb(hex); return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')).join(''); };
  // a person's look, from the world's own record of them — a new one for whoever asks (the tests, the interface); the frame keeps
  // one a person and fills it again (lookFill: nothing made each frame but what changed — L-1105). The look and the clothes are
  // js/look3d.js's (22a, G.Look3D.fill); the face's mood over them is the acting's, here
  P3.look = v => lookFill({}, v);
  P3.lookInto = (L, v) => lookFill(L, v);
  function lookFill(L, v) {
    G.Look3D.fill(L, v, skin);
    if (skin) {
      // (the face's mood, from the world's feeling: joy smiles with the eyes, love too and blushes; grief frowns with the
      // brows' inner ends raised and the lids drooping; fear and awe open the eyes wide and the mouth; anger draws the brows
      // down and in and glares; a question lifts the brows; sickness and sleep half close the eyes; a calm face a little warm;
      // and the drink shows on a face with no other feeling on it: flushed, the lids heavy, a loose smile)
      const e = v.emo && v.emo.k; const grief = v.mourn > 0 || e === 'sad'; L.mood = Anim.MOOD[grief ? 'sad' : e] || (L.drunk > 0 ? Anim.MOOD.drunk : Anim.MOOD.calm);
    }
    return L;
  }
  // (what is on a person's body when nothing is: the inventory's empty answer)
  const NO_INV = Object.freeze({ mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: false });
  P3.NO_INV = NO_INV;

  // ------------------------------ poses ------------------------------
  // a pose: the angles of the joints, and the hips' height and lean (radians, metres)
  // (and for the skin: the stance of each foot, the grip of the hands, the mouth, the eyes' look, the cloth's swing)
  const POSE0 = () => ({ bob: 0, crouch: 0, lean: 0, twist: 0, neck: 0, shLp: 0, shLr: 0, shRp: 0, shRr: 0, elL: 0.15, elR: 0.15, hipL: 0, hipR: 0, knL: 0.05, knR: 0.05, anL: 0, anR: 0, pelY: 0, pelR: 0, pelP: 0, shift: 0, sway: 0, breath: 0, lie: 0, tool: 0, stL: 0, stR: 0, pitL: 0, pitR: 0, grip: 0, talk: 0, gazeX: 0, gazeY: 0, cloth: 0, clothS: 0, clothB: 0, clothV: 0, wrist: 0, holdW: 0,
    // (20a: the hips' yaw and adduction, each foot's share of its swing — −1 standing —, the left hand's grip and wrist, the other
    // hand on a thing of two hands, the shoulders' yaw)
    adL: 0, adR: 0, hyL: 0, hyR: 0, tyL: 0, tyR: 0, swL: -1, swR: -1, pgL: -1, pgR: -1, rel: 0.33, esw: 0.86, gripL: 0, wristL: 0, offW: 0, shLy: 0, shRy: 0,
    // (22c: the chest's own roll — the trunk over a limping leg —, the head's tilt)
    tilt: 0, headR: 0 });
  Anim.POSE0 = POSE0;
  // (the dead lie as they fell: on the back or face down, the limbs thrown out)
  const DEAD = [
    Object.assign(POSE0(), { lie: 1, hipL: 0.35, hipR: -0.25, knL: 0.3, knR: 0.6, shLp: -1.7, shRp: 0.5, shLr: 0.7, shRr: -0.6, elL: 0.4, elR: 0.2, neck: 0.3 }),
    Object.assign(POSE0(), { lie: 1, prone: 1, hipL: -0.2, hipR: 0.3, knL: 0.9, knR: 0.2, shLp: -2.6, shRp: -0.4, shLr: 0.3, shRr: -1.0, elL: 0.6, elR: 0.9, neck: -0.4 }),
    Object.assign(POSE0(), { lie: 1, hipL: -0.6, hipR: -0.1, knL: 1.2, knR: 0.1, shLp: 0.3, shRp: -1.2, shLr: 1.2, shRr: -0.3, elL: 1.4, elR: 0.3, neck: 0.5 }),
  ];
  Anim.DEAD = DEAD; // (the ways the dead lie: the body's own fall ends in one of them, as its corpse will lie — D-334)
  // The stride — the walk, the jog, the run — is G.Gait's (js/anim-gait.js, D-340): the cadence and the stride of real people at
  // each speed (no cap), the legs' curves scaled until the foot on the ground keeps still under the body, the hips as high as the
  // standing leg lets them be — computed from the phase every frame, never filtered (the body's animator, anim-body.js, plays it
  // phase-matched between the walk and the run). A state's clock t is the phase in radians (one stride: 2π)
  function gaitPose(t, sp, run) { const out = POSE0(); return G.Gait ? G.Gait.pose(out, t / TAU, sp || 0, 1, run ? 1 : 0) : out; }
  Anim.gaitPose = gaitPose; // (the postures' walk and run — js/anim-pessoas.js —: the stride of the phase, rule 115)

  // ------------------------------ putting a body together ------------------------------
  // (the body's local frame: +Z forward, +Y up, +X its left. The signs: a negative pitch swings an arm or a leg
  // forward and up, a positive knee bends back, a positive elbow bends forward, a positive lean bows forward,
  // a positive neck looks down. In a walk the knee is bent while the leg swings forward, as in a real step)
  const M = {}, F = {};
  function mats() {
    if (M.root) return;
    for (const k of ['root', 'a', 'b', 'c', 'z']) M[k] = new THREE.Matrix4();
    for (const k of ['pel', 'trunk', 'neck', 'sh', 'fa', 'hd', 'th', 'sn']) F[k] = new THREE.Matrix4();
    M.eu = new THREE.Euler(); M.z.makeScale(0, 0, 0); M.v = new THREE.Vector3();
  }
  // a part: parent × (to the joint) × (its turn) — kept in `out`, the frame of the next part down the limb —
  // then × (half its length down the limb) × (its size), the matrix of its box
  function put(part, idx, parent, jx, jy, jz, rx, ry, rz, ox, oy, oz, sx, sy, sz, col, out) {
    const m = M.a.copy(parent); M.b.makeTranslation(jx, jy, jz); m.multiply(M.b);
    if (rx || ry || rz) { M.eu.set(rx || 0, ry || 0, rz || 0, 'YXZ'); M.c.makeRotationFromEuler(M.eu); m.multiply(M.c); }
    if (out) out.copy(m);
    M.b.makeTranslation(ox, oy, oz); m.multiply(M.b); M.c.makeScale(sx, sy, sz); m.multiply(M.c);
    const im = mesh[PI[part]]; im.setMatrixAt(idx, m); im.setColorAt(idx, color(col));
    return out;
  }
  function hide(part, idx) { mesh[PI[part]].setMatrixAt(idx, M.z); }
  // a whole body at a place, facing yaw (0 = east, π/2 = south), in a pose, with a look — one continuous skin over the
  // rig (Body3D), or, where it could not start, the pieces of old
  P3.body = function (idx, X, Y, Z, yaw, pose, L, marker) {
    if (skin) return bodySkin(idx, X, Y, Z, yaw, pose, L, marker);
    return bodyParts(idx, X, Y, Z, yaw, pose, L, marker);
  };
  function bodyParts(idx, X, Y, Z, yaw, pose, L, marker) {
    mats();
    const s = L.s; const lie = pose.lie || 0;
    const root = M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-yaw + Math.PI / 2); root.multiply(M.b);
    // (lying down: on the back to sleep, face down to swim)
    if (lie > 0.01) { const pr = pose.prone ? 1 : -1; M.b.makeTranslation(0, 0.16 * s * lie, 0); root.multiply(M.b); M.b.makeRotationX(pr * lie * Math.PI / 2); root.multiply(M.b); M.b.makeTranslation(0, -0.92 * s * lie, 0); root.multiply(M.b); }
    M.b.makeScale(s, s, s); root.multiply(M.b);
    const hipY = 0.92 - pose.crouch * 0.92 + pose.bob;
    // hips, then the trunk leaning and turning above them
    // (the pelvis turning with the stride and tilting to the free side; the trunk above it turning back, breathing)
    const pel = pose.pelY || 0, prl = pose.pelR || 0, brt = 1 + (pose.breath || 0) * 0.014;
    put('pelvis', idx, root, pose.shift || 0, hipY, 0, pose.pelP || 0, pose.twist * 0.3 + pel, (pose.sway || 0) + prl, 0, 0.02, 0, L.fem ? 0.39 : 0.36, 0.22, L.fem ? 0.26 : 0.24, L.robe ? L.cloth : L.pants, F.pel);
    put(L.fem ? 'torsoF' : 'torso', idx, F.pel, 0, 0.06, 0, pose.lean, pose.twist * 0.7 - pel * 1.7, -(pose.sway || 0) * 0.6 - prl * 0.8, 0, 0.27, 0, (L.fem ? 0.4 : 0.43) * brt, 0.56, (L.fem ? 0.25 : 0.25) * brt, L.cloth, F.trunk); hide(L.fem ? 'torso' : 'torsoF', idx);
    put('belt', idx, F.trunk, 0, 0.03, 0, 0, 0, 0, 0, 0, 0, 0.37, 0.06, 0.24, L.belt);
    put('neckP', idx, F.trunk, 0, 0.54, 0, 0, 0, 0, 0, 0.02, 0, 0.1, 0.1, 0.1, L.skin);
    // (the head keeps looking where it looks while the shoulders turn under it)
    F.neck.copy(F.trunk); M.b.makeTranslation(0, 0.56, 0); F.neck.multiply(M.b); M.eu.set(pose.neck, (pose.lookY || 0) - (pose.twist - pel * 0.7) * 0.85, 0, 'YXZ'); M.b.makeRotationFromEuler(M.eu); F.neck.multiply(M.b);
    put('head', idx, F.neck, 0, 0.14, 0.01, 0, 0, 0, 0, 0, 0, 0.23, 0.27, 0.25, L.skin);
    // (the face: two eyes that blink now and then, the brows over them, a nose)
    const bl = pose.blink || 1;
    put('eyeL', idx, F.neck, 0.052, 0.155, 0.122, 0, 0, 0, 0, 0, 0, 0.042, 0.048 * bl, 0.03, '#1c1612'); put('eyeR', idx, F.neck, -0.052, 0.155, 0.122, 0, 0, 0, 0, 0, 0, 0.042, 0.048 * bl, 0.03, '#1c1612');
    put('brow', idx, F.neck, 0, 0.2, 0.118, 0, 0, 0, 0, 0, 0, 0.17, 0.022, 0.03, L.brow);
    put('nose', idx, F.neck, 0, 0.12, 0.128, 0, 0, 0, 0, 0, 0, 0.045, 0.06, 0.05, L.nose);
    put('mouth', idx, F.neck, 0, 0.068, 0.118, 0, 0, 0, 0, 0, 0, 0.065, 0.013 + (pose.talk || 0) * 0.02, 0.02, L.lips);
    put('earL', idx, F.neck, 0.118, 0.13, -0.005, 0, 0, 0.2, 0, 0, 0, 0.035, 0.065, 0.05, L.nose); put('earR', idx, F.neck, -0.118, 0.13, -0.005, 0, 0, -0.2, 0, 0, 0, 0.035, 0.065, 0.05, L.nose);
    if (L.beard) put('beard', idx, F.neck, 0, 0.045, 0.075, 0.2, 0, 0, 0, 0, 0, 0.17, 0.13, 0.12, L.hair); else hide('beard', idx);
    if (L.bun) put('bun', idx, F.neck, 0, 0.22, -0.13, 0, 0, 0, 0, 0, 0, 0.12, 0.11, 0.11, L.hair); else hide('bun', idx);
    // (the hair: a cap tilted back, its edge over the brow in front and down to the nape behind; an old man's only behind)
    if (L.bald) put('hair', idx, F.neck, 0, 0.12, -0.02, -1.25, 0, 0, 0, 0, 0, 0.265, 0.3, 0.285, L.hair); else put('hair', idx, F.neck, 0, 0.13, -0.01, -0.6, 0, 0, 0, 0, 0, 0.27, 0.38, 0.29, L.hair);
    if (L.long) put('hairL', idx, F.neck, 0, 0.1, -0.11, 0.12, 0, 0, 0, -0.12, 0, 0.21, 0.36, 0.07, L.hair); else hide('hairL', idx);
    // arms: from the shoulders, down to the elbows, down to the hands (a roll above 0 opens the arm away from the body)
    // (facing +Z, the body's left hand is on +X: L at +X, R at -X; a roll toward one's own side opens the arm)
    const hold = (L.torch || L.lantern) && !lie; // (a torch or a lantern held up in the left hand, in front)
    for (const [sd, sp0, sr0, el0, u, f, h] of [[1, pose.shLp, pose.shLr, pose.elL, 'uArmL', 'fArmL', 'handL'], [-1, pose.shRp, pose.shRr, pose.elR, 'uArmR', 'fArmR', 'handR']]) {
      const sp = hold && sd > 0 ? -1.05 : sp0, sr = hold && sd > 0 ? 0.12 : sr0, el = hold && sd > 0 ? 1.25 : el0;
      put(u, idx, F.trunk, sd * 0.235, 0.46, G.clamp(-sp, -1, 1) * 0.03, sp, 0, sr + sd * 0.05, 0, -0.15, 0, 0.11, 0.34, 0.11, L.cloth, F.sh); // (the shoulder goes a little forward with the arm)
      put(f, idx, F.sh, 0, -0.3, 0, -el, 0, 0, 0, -0.14, 0, 0.09, 0.31, 0.09, L.skin, F.fa);
      put(h, idx, F.fa, 0, -0.29, 0, 0, 0, 0, 0, -0.02, 0, 0.085, 0.12, 0.058, L.skin, F.hd);
      if (sd > 0) {
        if (hold) {
          // (the stick upright in the hand whatever the arm does; its flame handed to the fire's drawing)
          M.v.setFromMatrixPosition(F.hd); M.c.makeRotationY(-yaw + Math.PI / 2); M.c.setPosition(M.v.x, M.v.y, M.v.z); M.b.makeScale(s, s, s); M.c.multiply(M.b);
          put('torch', idx, M.c, 0, 0, 0, 0.12, 0, 0, 0, L.lantern ? -0.1 : 0.18, 0, 0.045, L.lantern ? 0.2 : 0.55, 0.045, L.lantern ? '#3a2a1a' : '#5a3c22');
          if (P3.flames.length < 40) P3.flames.push([M.v.x, M.v.y + (L.lantern ? -0.18 : 0.47) * s, M.v.z, L.lantern ? 0.5 : 0.85]);
        } else hide('torch', idx);
      }
      if (sd < 0) { if (pose.tool || (L.inv && L.inv.mao)) put('tool', idx, F.hd, 0, 0, 0, pose.tool ? -Math.PI / 2 : 0, 0, 0, 0, pose.tool ? 0.3 : -0.25, 0, 0.04, 0.95, 0.04, '#7a5a3a'); else hide('tool', idx); }
    }
    // legs: from the hips, down to the knees, down to the feet
    for (const [sd, hp, kn, an, th, sn, ft] of [[1, pose.hipL, pose.knL, pose.anL || 0, 'thighL', 'shinL', 'footL'], [-1, pose.hipR, pose.knR, pose.anR || 0, 'thighR', 'shinR', 'footR']]) {
      put(th, idx, F.pel, sd * 0.095, -0.04, 0, hp, 0, 0, 0, -0.22, 0, 0.155, 0.48, 0.16, L.pants, F.th);
      put(sn, idx, F.th, 0, -0.44, 0, kn, 0, 0, 0, -0.22, 0, 0.125, 0.48, 0.13, L.pants, F.sn);
      put(ft, idx, F.sn, 0, -0.45, 0.02, an, 0, 0, 0, 0, 0.05, 0.12, 0.09, 0.26, L.feet); // (the ankle: the heel strikes toes up, the toes push off)
      // (boots of leather to the middle of the shin)
      put(sd > 0 ? 'bootL' : 'bootR', idx, F.sn, 0, -0.3, 0, 0, 0, 0, 0, -0.04, 0, 0.145, 0.24, 0.155, L.feet);
    }
    if (L.robe) put('skirt', idx, F.pel, 0, -0.2, 0, 0, 0, 0, 0, -0.06, 0, 0.46, 0.46, 0.36, L.cloth); else hide('skirt', idx);
    // (a tunic falls from the belt to the middle of the thigh, flaring a little; a strap across the chest for the bag)
    if (!L.robe && L.s > 0.8) put('hem', idx, F.pel, 0, -0.02, 0, 0, 0, 0, 0, -0.1, 0, 0.42 + Math.abs(pose.hipL - pose.hipR) * 0.08, 0.24, 0.33, L.cloth); else hide('hem', idx);
    if (L.strap) put('strap', idx, F.trunk, 0, 0.28, 0, 0, 0, 0.72, 0, 0, 0, 0.05, 0.62, 0.27, L.belt); else hide('strap', idx);
    if (L.held && heldPut(P3.rig(X, Y, Z, yaw, pose, L), L)) hide('carry', idx); else if (L.carry) put('carry', idx, F.trunk, 0, 0.3, 0.26, 0, 0, 0, 0, 0, 0, 0.34, 0.26, 0.3, '#9a7a4a'); else hide('carry', idx);
    if (marker) put('marker', idx, root, 0, 2.15 + Math.sin(performance.now() / 300) * 0.04, 0, 0, performance.now() / 600, 0, 0, 0, 0, 0.16, 0.22, 0.16, marker); else hide('marker', idx);
  }

  // ------------------------------ the rig: every bone's frame ------------------------------
  // The same chain P3.body always made — pelvis → trunk → head; shoulder → forearm → hand; hip → shin → foot — and the
  // bones the skin needs besides: the half joints (a bone turning half as much as the one below it: the waist, the neck,
  // the shoulders, the elbows, the hips, the knees bend without the skin collapsing), the fingers and the thumb (the
  // grip), the toes (flat on the ground as the heel lifts), the skirt (front, back and sides following the legs), the
  // cloak, and what the hands hold (the torch upright, the tool, the load). Frames in the world, metres.
  const BONES = (G.BODYMESH && G.BODYMESH.bones) || ['pel', 'spine', 'chest', 'neck', 'head', 'shL', 'shR', 'shHL', 'shHR', 'faL', 'faR', 'elHL', 'elHR', 'hdL', 'hdR', 'fgL', 'fgR', 'tbL', 'tbR', 'thL', 'thR', 'hpHL', 'hpHR', 'snL', 'snR', 'knHL', 'knHR', 'ftL', 'ftR', 'toeL', 'toeR', 'skF', 'skB', 'skL', 'skR', 'clk1', 'clk2', 'torch', 'tool', 'carry'];
  const B = {}; BONES.forEach((b, i) => { B[b] = i; });
  const RIG = { shin: (G.BODYMESH && G.BODYMESH.shin) || 0.4, knuckle: (G.BODYMESH && G.BODYMESH.knuckle) || 0.092, toe: (G.BODYMESH && G.BODYMESH.toe) || 0.118, toeY: (G.BODYMESH && G.BODYMESH.toeY) || -0.035, roll: (G.BODYMESH && G.BODYMESH.roll) || 0.6 };
  let RF = null; const Q = {};
  // (a frame: parent × (to the joint) × (its turn, YXZ as everywhere in the rig))
  function fr(out, parent, jx, jy, jz, rx, ry, rz) {
    out.copy(parent); M.b.makeTranslation(jx, jy, jz); out.multiply(M.b);
    if (rx || ry || rz) { M.eu.set(rx, ry, rz, 'YXZ'); M.c.makeRotationFromEuler(M.eu); out.multiply(M.c); }
    return out;
  }
  // (the height in the world of a point given in a frame)
  function ptY(F, x, y, z) { const e = F.elements; return e[1] * x + e[5] * y + e[9] * z + e[13]; }
  // (a half joint: halfway — a spherical blend — between the turn the bone was modelled in and the turn it has now)
  function frHalf(out, parent, jx, jy, jz, b0, b1, b2, rx, ry, rz) {
    out.copy(parent); M.b.makeTranslation(jx, jy, jz); out.multiply(M.b);
    M.eu.set(b0, b1, b2, 'YXZ'); Q.a.setFromEuler(M.eu); M.eu.set(rx, ry, rz, 'YXZ'); Q.b.setFromEuler(M.eu); Q.a.slerp(Q.b, 0.5);
    M.c.makeRotationFromQuaternion(Q.a); out.multiply(M.c); return out;
  }
  // (the legs' measures: thigh, the sole under the ankle, the heel behind it and the ball in front)
  const LEG = { L1: 0.44, sole: 0.044, heel: 0.062, ball: 0.122 };
  P3.LEG = LEG;
  // a leg's turn at the hip in the pose: its swing (pitch), the toes turned out (yaw) and how far in toward the line under the
  // body the leg is drawn (adduction: the steps a hand apart, as people walk — not two tracks under the hips, 20a)
  // (the thigh's turn in the pelvis: its swing's plane turned (hy, before the swing: the plane the leg swings in), swung (hp),
  // drawn in (ad), then turned about its own length (ty: the knee and the toes out) — the hips' rotation in a stride turns the
  // plane, not the foot's place)
  const hipYaw = (pose, k) => (k ? pose.hyR : pose.hyL) || 0, hipRoll = (pose, k) => (k ? 1 : -1) * ((k ? pose.adR : pose.adL) || 0), hipTwist = (pose, k) => (k ? pose.tyR : pose.tyL) || 0;
  function thighRot(out, hp, hy, hr, ty) { M.eu.set(hp, hy, hr, 'YXZ'); out.makeRotationFromEuler(M.eu); if (ty) { M.b.makeRotationY(ty); out.multiply(M.b); } return out; }
  function thighAt(out, R, sd, rot) { out.copy(R[B.pel]); M.b.makeTranslation(sd * 0.095, -0.04, 0); out.multiply(M.b); return out.multiply(rot); }
  // the ground under a foot: the person's own where nothing else is known (L.gnd: each foot its own — a slope, a step, a stone)
  const groundOf = (L, X, Z) => { const g = L.gnd ? L.gnd(X, Z) : undefined; return Number.isFinite(g) ? g : L.ground; };
  // where a foot must be. A foot in a stride is in one of three states: swinging (where the pose has it — kept out of the
  // ground), standing (from the moment it strikes: it stays where its heel struck, on that spot's own ground, and rolls on it —
  // on the heel while the toes come down, flat, then on the ball as the heel rises and the toes push off — the ankle where that
  // roll puts it), or leaving (pushed off: from where it stood it goes after the swing the pose has, within the first third of
  // the swing — its share of the swing from the pose's own clock, swL/swR: it always gets there, L-1100). The body's animator
  // also gives a foot its mode (L.plant[k].mode: 'gait' the stride's, 'plant' kept where it stands whatever the pose, 'free'
  // the pose's own — kneeling, lying, in the air) and its steps (L.plant[k].step: from where it stood to where it goes)
  function footFK(R, pose, k, out) {
    const sd = k ? -1 : 1; const hp = k ? pose.hipR : pose.hipL, kn = k ? pose.knR : pose.knL, an = (k ? pose.anR : pose.anL) || 0;
    thighAt(M.a, R, sd, thighRot(M.th, hp, hipYaw(pose, k), hipRoll(pose, k), hipTwist(pose, k))); fr(M.c2, M.a, 0, -LEG.L1, 0, kn, 0, 0); return fr(out, M.c2, 0, -RIG.shin, 0.02, an, 0, 0);
  }
  function strike(ft, e, L) {
    ft.on = 1; ft.x = e[12] - (e[4] * LEG.sole + e[8] * LEG.heel); ft.z = e[14] - (e[6] * LEG.sole + e[10] * LEG.heel); const l = Math.hypot(e[8], e[10]) || 1; ft.dx = e[8] / l; ft.dz = e[10] / l; ft.off = 0;
    ft.y = groundOf(L, ft.x, ft.z); ft.pmin = -9; // (a new stance: its heel down again)
    // (the ground's own slope along the foot, where each foot has its own ground: on a ladder of a hill the sole lies on it)
    const bx = ft.x + ft.dx * (LEG.heel + LEG.ball), bz = ft.z + ft.dz * (LEG.heel + LEG.ball), gb = L.gnd ? groundOf(L, bx, bz) : ft.y;
    ft.gp = Math.atan2(ft.y - gb, LEG.heel + LEG.ball);
    // (over the edge of a step — the heel and the ball on two levels —: the foot on the higher, as a foot on a stair's tread, its heel
    // over the edge; no slope)
    if (Math.abs(ft.y - gb) > 0.05) { ft.y = Math.max(ft.y, gb); ft.gp = 0; } else if (!(Math.abs(ft.gp) < 0.6)) ft.gp = 0;
  }
  P3.strike = strike; // (for the animator: a foot set down where it stands)
  // (the ankle of a foot standing on its spot, rolled to pitch p: on its heel while the toes are up, on its ball as the heel rises)
  function rollTo(T, ft, p, s) {
    // (on its heel while the toes are above the ground's own line under the foot, on its ball after: the pitch counted from it)
    const g = ft.gp || 0, c = Math.cos(p), sn = Math.sin(p); let px = ft.x, pz = ft.z, py = ft.y, oy, oz;
    if (p <= g) { oy = LEG.sole * c - LEG.heel * sn; oz = LEG.sole * sn + LEG.heel * c; }
    else { const bl = (LEG.heel + LEG.ball) * s; px += ft.dx * bl * Math.cos(g); pz += ft.dz * bl * Math.cos(g); py -= bl * Math.sin(g); oy = LEG.sole * c + LEG.ball * sn; oz = LEG.sole * sn - LEG.ball * c; }
    return T.set(px + ft.dx * oz * s, py + oy * s, pz + ft.dz * oz * s);
  }
  const DIR = [0, 0];
  function footWant(R, pose, L, k, s) {
    const ft = L.plant ? L.plant[k] : null; if (!ft) return null;
    if (ft.mode === 'free') { ft.on = 0; ft.off = 0; return null; }
    const e = footFK(R, pose, k, M.a).elements; const T = M.t[k];
    // (a step of the stance — a turn on the spot, squaring up, a nudge: from where the foot stood to where it goes, lifted on
    // the way and the heel first; set down flat on its spot's ground)
    if (ft.step) {
      const q = ft.step, t = G.clamp(q.t, 0, 1), w = G.smooth(0, 1, t);
      const bx = q.x + q.dx * LEG.heel * s, bz = q.z + q.dz * LEG.heel * s, by = q.y + LEG.sole * s;
      T.set(G.lerp(q.ax, bx, w), G.lerp(q.ay, by, w) + (q.h || 0.07) * s * Math.sin(Math.PI * t), G.lerp(q.az, bz, w));
      const a0 = Math.atan2(q.adz, q.adx), a1 = Math.atan2(q.dz, q.dx); let da = a1 - a0; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      DIR[0] = Math.cos(a0 + da * w); DIR[1] = Math.sin(a0 + da * w); ft.on = 0; ft.off = 0;
      return { T, p: 0.32 * Math.sin(Math.PI * Math.min(1, t * 1.25)), w: 1, dir: DIR, stepping: 1 };
    }
    const stw = ft.mode === 'plant' && ft.on ? 1 : (k ? pose.stR : pose.stL) || 0; const p = (ft.mode === 'plant' && !(k ? pose.stR : pose.stL) ? 0 : (k ? pose.pitR : pose.pitL) || 0) + (ft.on ? ft.gp || 0 : 0);
    if (ft.on) {
      if (stw > 0.5) ft.early = 0;
      // (the push-off: the stride's stance is over — unless the strike came early, before it began)
      // (the gap between where it stood and where the stride has it now is what eases out — the foot goes with the stride's own
      // motion from the first frame of its swing, never dragged from a point of the ground: L-1100)
      if (stw <= 0.5 && !ft.early) { ft.on = 0; ft.off = 1; ft.rx = ft.ax - e[12]; ft.ry = ft.ay - e[13]; ft.rz = ft.az - e[14]; ft.rp = ft.ap - p; }
    } else if (stw > 0.5 && !ft.off) {
      // (the strike when the heel meets its ground — or, not yet there, a little into the stance: never pulled down onto the
      // ground from above it, L-1103)
      const pg = k ? pose.pgR : pose.pgL, lo = Math.min(ptY(M.a, 0, -LEG.sole, -LEG.heel), ptY(M.a, 0, -LEG.sole, LEG.ball));
      if (!(pg >= 0) || pg > 0.12 || lo < groundOf(L, e[12], e[14]) + 0.006 * s) strike(ft, e, L);
    }
    if (ft.on) {
      // (the heel rises as the body goes on over the foot — as early and as far as the leg needs to keep its ball on the
      // ground, never less than the stride's own: the hips do not sink for a foot left behind, L-1104)
      let p2 = Math.max(p, ft.pmin === undefined ? -9 : ft.pmin);
      for (let it = 0; it < 8; it++) {
        rollTo(T, ft, p2, s);
        if (stw <= 0.5 || ft.mode === 'plant') break;
        M.k.copy(R[B.pel]).invert(); M.v.copy(T).applyMatrix4(M.k); const hx = M.v.x - (k ? -0.095 : 0.095), hy = M.v.y + 0.04, hz = M.v.z;
        if (hz > 0 || hx * hx + hy * hy + hz * hz <= REACH * REACH || p2 >= 1.0) break;
        p2 = Math.max(p2, ft.gp || 0) + 0.07;
      }
      if (p2 > p) ft.pmin = p2; const pUse = p2;
      // (the body went too far from it — a turn on the spot, a push of the world: the foot lifts where it is)
      if ((T.x - e[12]) ** 2 + (T.z - e[14]) ** 2 > 0.36 * s * s) { ft.on = 0; ft.off = 0; return null; }
      ft.ax = T.x; ft.ay = T.y; ft.az = T.z; ft.ap = pUse; DIR[0] = ft.dx; DIR[1] = ft.dz;
      return { T, p: pUse, w: 1, dir: DIR };
    }
    if (ft.off) {
      // (leaving: from the push-off's place toward the swing, over the first third of the swing — by the stride's own clock; a
      // pose with no clock of its swing lets it go at once)
      const sw = k ? pose.swR : pose.swL; const r0 = sw >= 0 ? G.clamp(sw / (pose.rel || 0.33), 0, 1) : 1, r = r0 * r0 * r0 * (r0 * (r0 * 6 - 15) + 10); // (eased in and out: no kick)
      if (r >= 0.999 || stw > 0.5) { ft.off = 0; return null; }
      const q = 1 - r; T.set(e[12] + ft.rx * q, Math.max(e[13] + ft.ry * q, groundOf(L, e[12], e[14]) + LEG.sole * s), e[14] + ft.rz * q);
      return { T, p: p + ft.rp * q, w: 1, leaving: 1, dir: null };
    }
    return null;
  }
  // (how much lower the hips must be for the leg to reach T with the knee a little bent: 0 if it does; -1 if no lowering would do)
  const REACH = Math.sqrt(LEG.L1 * LEG.L1 + (RIG.shin * RIG.shin + 0.0004) + 2 * LEG.L1 * Math.hypot(RIG.shin, 0.02) * Math.cos(0.1));
  function dropFor(R, T, k) {
    M.k.copy(R[B.pel]).invert(); M.v.copy(T).applyMatrix4(M.k);
    const vx = M.v.x - (k ? -0.095 : 0.095), vy = M.v.y + 0.04, vz = M.v.z, Lm = REACH, h2 = vx * vx + vz * vz;
    if (vy * vy + h2 <= Lm * Lm) return 0;
    if (h2 >= Lm * Lm) return -1;
    return -Math.sqrt(Lm * Lm - h2) - vy;
  }
  // a leg reaching its ankle to T (world): the thigh turned three ways at the hip, the knee bent in the plane the foot points along
  // (dir: the foot's way on the ground, in the world) — two bones; the shin's ankle a hair forward of its line, as the rig has it.
  // The thigh's turn in the rig's own order (YXZ) and the knee's bend
  const IKL = { rx: 0, ry: 0, rz: 0, kn: 0, ok: true, m: null };
  function legIK(R, k, T, dx0, dy0, dz0) {
    const sd = k ? -1 : 1; M.k.copy(R[B.pel]).invert(); M.v.copy(T).applyMatrix4(M.k);
    const L1 = LEG.L1, L2 = Math.hypot(RIG.shin, 0.02), dl = Math.atan2(0.02, RIG.shin);
    let dx = M.v.x - sd * 0.095, dy = M.v.y + 0.04, dz = M.v.z; let c = Math.hypot(dx, dy, dz); IKL.ok = true;
    if (c < 1e-5) { dx = 0; dy = -1; dz = 0; c = 1e-5; }
    const ux = dx / c, uy = dy / c, uz = dz / c; const cmax = (L1 + L2) * 0.9995, cmin = Math.abs(L1 - L2) + 0.02; if (c > cmax) { c = cmax; IKL.ok = false; } else if (c < cmin) c = cmin;
    // (the pole: the foot's way, turned into the pelvis's frame; its part across the hip-to-ankle line)
    V3.b.set(dx0, dy0, dz0).transformDirection(M.k); let px = V3.b.x, py = V3.b.y, pz = V3.b.z; const pd = px * ux + py * uy + pz * uz; px -= pd * ux; py -= pd * uy; pz -= pd * uz;
    let pl = Math.hypot(px, py, pz); if (pl < 1e-4) { px = 0; py = -uz; pz = uy; pl = Math.hypot(py, pz) || 1; } px /= pl; py /= pl; pz /= pl;
    const ca = G.clamp((L1 * L1 + c * c - L2 * L2) / (2 * L1 * c), -1, 1), sa = Math.sqrt(1 - ca * ca);
    const d1x = ca * ux + sa * px, d1y = ca * uy + sa * py, d1z = ca * uz + sa * pz; // (down the thigh)
    const Yx = -d1x, Yy = -d1y, Yz = -d1z, Zx = ca * px - sa * ux, Zy = ca * py - sa * uy, Zz = ca * pz - sa * uz; // (the thigh's frame: Y up it, Z the knee's front)
    const Xx = Yy * Zz - Yz * Zy, Xy = Yz * Zx - Yx * Zz, Xz = Yx * Zy - Yy * Zx;
    // (its swing in the leg's own plane — the pitch the skirt and the ankle follow; an Euler's pitch folds past a right angle)
    IKL.rx = Math.atan2(-d1z, -d1y); IKL.ry = Math.atan2(Zx, Zz); IKL.rz = Math.atan2(Xy, Yy);
    IKL.m.set(Xx, Yx, Zx, 0, Xy, Yy, Zy, 0, Xz, Yz, Zz, 0, 0, 0, 0, 1);
    IKL.kn = Math.PI - Math.acos(G.clamp((L1 * L1 + L2 * L2 - c * c) / (2 * L1 * L2), -1, 1)) + dl;
    return IKL;
  }
  P3.legIK = legIK; // (for the tests)
  // a leg: from the pose, then reaching where its foot must be, the foot set to its pitch on the ground, the toes flat as the
  // heel lifts; a free foot kept out of its own ground
  const LG = [0, 0, 0, 0], LGR = [0, 0]; // (each leg's hip and knee as the ground left them — the skirt follows the thighs as they are)
  function leg(R, pose, L, k, s, grounded, want) {
    const sd = k ? -1 : 1; let hp = k ? pose.hipR : pose.hipL, kn = k ? pose.knR : pose.knL; let an = (k ? pose.anR : pose.anL) || 0;
    thighRot(M.th, hp, hipYaw(pose, k), hipRoll(pose, k), hipTwist(pose, k));
    const chain = () => { thighAt(R[B.thL + k], R, sd, M.th); fr(R[B.snL + k], R[B.thL + k], 0, -LEG.L1, 0, kn, 0, 0); fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0); };
    chain();
    let toe = -Math.max(0, an) * 0.8; const ft = L.plant ? L.plant[k] : null;
    if (grounded) {
      const e = R[B.ftL + k].elements; const gy = groundOf(L, e[12], e[14]); const amin = gy + (LEG.sole + 0.003) * s;
      let T = null;
      if (want) T = want.T; else if (e[13] < amin) T = M.t[k].set(e[12], amin, e[14]);
      // (the swing's end: the heel coming down in front reaches the ground — that is the strike; next frame it stands)
      // (only late in the swing, where the stride's clock says it — a heel brushing the ground as the leg passes under the body
      // is no strike: planted there, the stride ran ahead of it, L-1102)
      const swk = k ? pose.swR : pose.swL;
      if (!want && ft && ft.mode !== 'free' && !ft.on && !ft.off && !ft.step && ((k ? pose.pitR : pose.pitL) || 0) < 0 && !(swk >= 0 && swk < (pose.esw || 0.86))) {
        const hh = ptY(R[B.ftL + k], 0, -LEG.sole, -LEG.heel); M.k.copy(R[B.pel]).invert(); M.v.set(e[12], e[13], e[14]).applyMatrix4(M.k);
        if (hh < gy + 0.006 && M.v.z > -0.01) { strike(ft, e, L); ft.early = 1; }
      }
      if (T) {
        // (the knee's way: a foot standing points it — the knee goes where the toes go; a free leg kept out of the ground keeps
        // its own knee's way, the thigh's front — kneeling, its foot behind it, the knee does not turn over)
        const th = R[B.thL + k].elements; let dX = th[8], dY = th[9], dZ = th[10]; if (want && want.dir) { dX = want.dir[0]; dY = 0; dZ = want.dir[1]; }
        const before = hp + kn; const o = legIK(R, k, T, dX, dY, dZ); hp = o.rx; kn = o.kn; M.th.copy(o.m); if (!want) an += before - (hp + kn);
        chain();
      }
      if (want) {
        // (planted: the foot at the stride's pitch to the ground — its forward axis measured, the ankle turned by the difference)
        const f = R[B.ftL + k].elements; const cur = Math.atan2(-f[9], Math.hypot(f[8], f[10])); const p = G.lerp(cur, want.p, want.w);
        an += p - cur; fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0); toe = -Math.max(0, p);
      } else {
        // (free: where the heel or the ball would go into the ground, the ankle turns to set it on it instead)
        for (let it = 0; it < 2; it++) {
          const hh = ptY(R[B.ftL + k], 0, -LEG.sole, -LEG.heel), hb = ptY(R[B.ftL + k], 0, -LEG.sole, LEG.ball);
          const lo = Math.min(hh, hb); if (lo >= gy - 0.004) break;
          const a = Math.asin(G.clamp((gy - lo) / s / (hh < hb ? 0.075 : 0.13), 0, 0.8));
          an += hh < hb ? a : -a; an = G.clamp(an, -0.9, 1.1); fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0);
        }
        toe = -Math.max(0, an) * 0.8;
        fr(R[B.toeL + k], R[B.ftL + k], 0, RIG.toeY, RIG.toe, toe, 0, 0);
        const tt = ptY(R[B.toeL + k], 0, -0.004, 0.07); if (tt < gy) toe -= Math.asin(G.clamp((gy - tt) / s / 0.07, 0, 0.9));
      }
    }
    fr(R[B.toeL + k], R[B.ftL + k], 0, RIG.toeY, RIG.toe, toe, 0, 0);
    { const H = R[B.hpHL + k]; H.copy(R[B.pel]); M.b.makeTranslation(sd * 0.095, -0.04, 0); H.multiply(M.b); Q.a.setFromRotationMatrix(M.th); Q.b.identity().slerp(Q.a, 0.5); M.c.makeRotationFromQuaternion(Q.b); H.multiply(M.c); }
    fr(R[B.knHL + k], R[B.thL + k], 0, -LEG.L1, 0, kn / 2, 0, 0);
    LG[k * 2] = hp; LG[k * 2 + 1] = kn; LGR[k] = M.th.elements[1]; // (and how far the thigh is drawn in or out: its down axis's side)
    // (where the ankle came to, for the animator's steps: from here a step begins)
    if (ft) { const f = R[B.ftL + k].elements; ft.cx = f[12]; ft.cy = f[13]; ft.cz = f[14]; const l = Math.hypot(f[8], f[10]) || 1; ft.cdx = f[8] / l; ft.cdz = f[10] / l; }
  }
  // ------------------------------ the hands on what they hold ------------------------------
  // The arm is two bones and a hand: from the shoulder 0.30 m to the elbow, then 0.29 m to the wrist and 0.076 m more to the
  // middle of the palm (a hair to the thumb's side of the forearm's line — the elbow's hinge carries it). armIK turns the
  // shoulder three ways and bends the elbow so the palm reaches a point, the elbow falling toward its pole (down and out, as a
  // real one goes): the shoulder's turn in the rig's own order (YXZ) and the elbow's bend. Points in the trunk's frame (body units)
  const AU = 0.3, AF = 0.366, AX = 0.027; // (the upper arm; the forearm to the palm; the palm off the elbow's plane, along its hinge)
  const IKO = { rx: 0, ry: 0, rz: 0, el: 0, ok: false, reach: 0 };
  function armIK(sd, S, T, pole) {
    // (the palm is off the arm's plane by AX along the hinge: reach for the point the plane must hold — twice, the hinge from
    // the turn found the first time)
    let hx = 1, hy = 0, hz = 0; // (the upper arm's own X: the hinge — for both arms the body's left as they hang)
    const ex = -sd * AX; let d1x = 0, d1y = -1, d1z = 0, d2x = 0, d2y = -1, d2z = 0, el = 0, ok = true, reach = 0;
    for (let it = 0; it < 2; it++) {
      const tx = T[0] - ex * hx - S[0], ty = T[1] - ex * hy - S[1], tz = T[2] - ex * hz - S[2]; let c = Math.hypot(tx, ty, tz); reach = c;
      if (c < 1e-5) { ok = false; break; }
      const ux = tx / c, uy = ty / c, uz = tz / c; const cmax = (AU + AF) * 0.998, cmin = Math.abs(AF - AU) + 0.02; if (c > cmax) { c = cmax; ok = false; } else if (c < cmin) c = cmin;
      const al = Math.acos(G.clamp((AU * AU + c * c - AF * AF) / (2 * AU * c), -1, 1)); el = Math.PI - Math.acos(G.clamp((AU * AU + AF * AF - c * c) / (2 * AU * AF), -1, 1));
      // (the elbow toward the pole: the pole's part across the shoulder-to-palm line)
      let px = pole[0], py = pole[1], pz = pole[2]; const pd = px * ux + py * uy + pz * uz; px -= pd * ux; py -= pd * uy; pz -= pd * uz; let pl = Math.hypot(px, py, pz);
      if (pl < 1e-5) { px = -uy; py = ux; pz = 0; pl = Math.hypot(px, py) || 1; } px /= pl; py /= pl; pz /= pl;
      const ca = Math.cos(al), sa = Math.sin(al); d1x = ca * ux + sa * px; d1y = ca * uy + sa * py; d1z = ca * uz + sa * pz;
      const Ex = d1x * AU, Ey = d1y * AU, Ez = d1z * AU; d2x = ux * c - Ex; d2y = uy * c - Ey; d2z = uz * c - Ez; const l2 = Math.hypot(d2x, d2y, d2z) || 1; d2x /= l2; d2y /= l2; d2z /= l2;
      // (the hinge, as the frame below has it: its X = Y × Z = −(d1 × d2) — the way that makes the bend a forward one)
      hx = d1z * d2y - d1y * d2z; hy = d1x * d2z - d1z * d2x; hz = d1y * d2x - d1x * d2y; const hl = Math.hypot(hx, hy, hz);
      if (hl < 1e-5) { hx = 1; hy = 0; hz = 0; } else { hx /= hl; hy /= hl; hz /= hl; }
    }
    // the upper arm's frame: Y up its bone (−d1), Z the way the forearm bends (d2 across d1), X their cross; then YXZ
    const Yx = -d1x, Yy = -d1y, Yz = -d1z; let Zx = d2x - (d2x * d1x + d2y * d1y + d2z * d1z) * d1x, Zy = d2y - (d2x * d1x + d2y * d1y + d2z * d1z) * d1y, Zz = d2z - (d2x * d1x + d2y * d1y + d2z * d1z) * d1z;
    let zl = Math.hypot(Zx, Zy, Zz); if (zl < 1e-4) { Zx = hy * Yz - hz * Yy; Zy = hz * Yx - hx * Yz; Zz = hx * Yy - hy * Yx; zl = Math.hypot(Zx, Zy, Zz) || 1; } Zx /= zl; Zy /= zl; Zz /= zl;
    const Xx = Yy * Zz - Yz * Zy, Xy = Yz * Zx - Yx * Zz;
    IKO.rx = Math.asin(-G.clamp(Zy, -1, 1)); IKO.ry = Math.atan2(Zx, Zz); IKO.rz = Math.atan2(Xy, Yy); IKO.el = el; IKO.ok = ok; IKO.reach = reach;
    return IKO;
  }
  P3.armIK = armIK; // (for the tests)
  // where a held thing sits, by its grip (the trunk's frame, body units: its middle, its tilt) and where the palms take it
  // (its own frame, metres); the elbows' poles
  const HOLDS = {
    peito: { at: (w, h, d, k) => [0, 0.2 - 0.06 * k, 0.135 + d / 2], palm: (w, h, d) => [[w / 2 + 0.012, -h * 0.15, 0.02], [-(w / 2 + 0.012), -h * 0.15, 0.02]], pole: [0.75, -1, -0.35] },
    baixo: { at: (w, h, d, k) => [0, -0.01 - 0.03 * k, 0.13 + d / 2], palm: (w, h, d) => [[w / 2 + 0.012, -h * 0.3, 0], [-(w / 2 + 0.012), -h * 0.3, 0]], pole: [0.8, -1, -0.4] },
    abraco: { at: (w, h, d, k) => [0, 0.1 - 0.04 * k, 0.13 + d / 2], palm: (w, h, d) => [[w * 0.33, 0.02, d * 0.4], [-w * 0.33, 0.02, d * 0.4]], pole: [0.9, -0.9, -0.2] },
    bracos: { at: (w, h, d, k) => [0, 0.16 - 0.04 * k, 0.15 + d / 2], palm: (w, h, d) => [[0.22, -h * 0.5 - 0.01, 0.03], [-0.22, -h * 0.5 - 0.01, 0.03]], pole: [0.8, -1, -0.3] },
    ombro: { at: (w, h, d, k) => [-0.15, 0.5 + h / 2 + 0.01, -0.02], tilt: 0.12, palm: (w, h, d, f) => [null, f === 'remo' ? [0, -0.03, 0.34] : f === 'marfim' ? [0, -0.06, 0.2] : f === 'ferramentas' ? [0, -0.04, 0.3] : [0.02, -h * 0.42, Math.min(0.3, d * 0.32)]], pole: [0.35, -1, 0.35] },
    cabeca: { at: (w, h, d, k) => [0, 0.86 + h / 2, 0.03], up: 1, palm: (w, h, d, f, k) => [[w * 0.47 + 0.01, -h * 0.05, 0], k > 0.55 ? [-(w * 0.47 + 0.01), -h * 0.05, 0] : null], pole: [1, -0.15, 0.25] },
    costas: { at: (w, h, d, k) => [0, 0.26, -(0.14 + d / 2)], strap: 1, palm: () => [null, null], pole: [0.8, -1, -0.2] },
  };
  const HANG = { balde: 0.29, peixe: 0.17, cambada: 0.31, bolsa: 0.07 }; // (a thing hanging from the fist: how far above its middle the fist is)
  const HP = { p: [0, 0, 0], t: [null, null], tw: [[0, 0, 0], [0, 0, 0]], pole: null, mode: '', up: 0 };
  const PL = [0, 0, 0], SH0 = [0, 0, 0]; // (the elbow's pole and the shoulder's joint, for one arm: reused)
  // (a point of the trunk's frame into the world and back; the trunk's inverse kept for the frame)
  const V3 = { a: null, b: null };
  function holdTargets(R, L, s) {
    const H = L.held; HP.t[0] = HP.t[1] = null; HP.mode = '';
    if (!H) { if (L.reach && L.reach.w > 0.001) reachEmpty(R, L, s); return; }
    const g = H.grip; const k = G.clamp(H.kg / (28 * (L.str || 1)), 0, 1.6);
    if (g === 'lado') { HP.mode = 'hand'; return; }
    if (g === 'chao') { HP.mode = 'ground'; return; }
    const D = HOLDS[g] || HOLDS.peito; const w = H.size[0] / s, h = H.size[1] / s, d = H.size[2] / s;
    const at = D.at(w, h, d, k); HP.p[0] = at[0]; HP.p[1] = at[1]; HP.p[2] = at[2]; HP.mode = D.up ? 'up' : 'trunk'; HP.tilt = D.tilt || 0;
    HP.pole = D.pole;
    // (the object's frame: in the trunk, or — reaching for a point of the world — on its way between there and that point)
    objFrame(R, L, s, H);
    if (D.strap) { HP.t[0] = [0.07, 0.4, 0.15]; HP.t[1] = [-0.07, 0.4, 0.15]; return; }
    const P = D.palm(H.size[0], H.size[1], H.size[2], H.form, k);
    for (let q = 0; q < 2; q++) { if (!P[q]) continue; V3.a.set(P[q][0], P[q][1], P[q][2]).applyMatrix4(R[B.carry]).applyMatrix4(M.ci); HP.t[q] = HP.tw[q]; HP.t[q][0] = V3.a.x; HP.t[q][1] = V3.a.y; HP.t[q][2] = V3.a.z; }
  }
  // (the held thing's frame in the world, unscaled: the rig's 'carry' bone)
  function objFrame(R, L, s, H) {
    const C = R[B.carry]; const r = L.reach; const up = HP.mode === 'up';
    // its place in the trunk, tilted with it (on the head and in a reach, upright)
    C.copy(R[B.chest]); M.b.makeTranslation(HP.p[0], HP.p[1], HP.p[2]); C.multiply(M.b); if (HP.tilt) { M.b.makeRotationX(HP.tilt); C.multiply(M.b); } M.b.makeScale(1 / s, 1 / s, 1 / s); C.multiply(M.b);
    if (up || (r && r.w > 0.001)) {
      const w = r && r.w > 0.001 ? G.smooth(0, 1, r.w) : 0;
      // (toward the point: in the trunk's own frame — the place in the trunk and the point are both in the arms' reach, and so
      // is all the way between them; the world sees the thing come up with the body that lifts it)
      if (w > 0) {
        // (where the point lies in the trunk of the body bent all the way down to it — the squat and the bow of reachDepth, from
        // the feet's own frame —, then, at the very end, the point itself in the trunk as it is)
        const ground = L.ground !== undefined ? L.ground : r.Y; const D = Anim.reachDepth(H, L, r.Y - ground, 1); const hipF = 0.92 - 0.72 * D.sq * 0.92 + 0.06, ln = 1.05 * D.bw;
        V3.b.set(r.X, r.Y, r.Z).applyMatrix4(M.k.copy(M.root).invert()); V3.b.y -= hipF; { const c = Math.cos(-ln), sn = Math.sin(-ln), y = V3.b.y, z = V3.b.z; V3.b.y = c * y - sn * z; V3.b.z = sn * y + c * z; }
        V3.a.set(HP.p[0], HP.p[1], HP.p[2]).lerp(V3.b, w);
        const e = G.smooth(0.88, 1, r.w); if (e > 0) { V3.b.set(r.X, r.Y, r.Z).applyMatrix4(M.ci); V3.a.lerp(V3.b, e); }
        V3.a.applyMatrix4(R[B.chest]);
      } else V3.a.setFromMatrixPosition(C);
      // (upright, facing as the body faces — or the trunk's tilt, eased out as it goes toward the point)
      Q.a.setFromRotationMatrix(M.b.extractRotation(C)); Q.b.setFromAxisAngle(M.yAx || (M.yAx = new THREE.Vector3(0, 1, 0)), L.yaw0 === undefined ? 0 : L.yaw0);
      if (!up) Q.a.slerp(Q.b, w); else Q.a.copy(Q.b);
      C.makeRotationFromQuaternion(Q.a); C.setPosition(V3.a);
    }
  }
  // (one of two under one crate — L.pair, its frame between them, from P3.update —: the crate's long side along the line from
  // the helper to the one ahead, and each one's palms on their own end of it, low on its face, near its corners — the one
  // ahead's behind him, the elbows out and back; the helper's before him, as at the chest — L-210)
  const POLE_BACK = [0.55, -1, -0.7];
  function pairTargets(L, PR) {
    const H = PR.H; const w = H.size[0], h = H.size[1], d = H.size[2]; const end = PR.lead === L.id ? 1 : -1;
    const ux = Math.cos(PR.yaw), uz = Math.sin(PR.yaw), along = end * (w / 2 - 0.02), half = d / 2 - 0.04;
    HP.mode = 'pair'; HP.pole = end > 0 ? POLE_BACK : HOLDS.peito.pole;
    for (let q = 0; q < 2; q++) { const sd = q ? -1 : 1; V3.a.set(PR.X + ux * along - uz * sd * half, PR.Y - h * 0.2, PR.Z + uz * along + ux * sd * half).applyMatrix4(M.ci); HP.t[q] = HP.tw[q]; HP.t[q][0] = V3.a.x; HP.t[q][1] = V3.a.y; HP.t[q][2] = V3.a.z; }
    // (the palm on the holder's left to the left arm: in the trunk's frame the left is +x)
    if (HP.t[0][0] < HP.t[1][0]) { const t = HP.tw[0]; HP.tw[0] = HP.tw[1]; HP.tw[1] = t; HP.t[0] = HP.tw[0]; HP.t[1] = HP.tw[1]; }
  }
  // (the hands of one of two in an act of two on the other: each one's point of the world in the trunk's frame — a hand with no point
  // keeps the gesture's own)
  function duoTargets(DU) {
    HP.mode = 'duo'; HP.pole = DU.pole;
    for (let q = 0; q < 2; q++) { if (!DU.on[q]) { HP.t[q] = null; continue; } const T = DU.T[q]; V3.a.set(T[0], T[1], T[2]).applyMatrix4(M.ci); HP.t[q] = HP.tw[q]; HP.t[q][0] = V3.a.x; HP.t[q][1] = V3.a.y; HP.t[q][2] = V3.a.z; }
  }
  // (the empty hands reaching for a point of the world: each palm a hand's width to its side)
  function reachEmpty(R, L, s) {
    const r = L.reach; HP.mode = 'reach'; HP.pole = [0.7, -0.5, -0.45];
    V3.a.set(r.X, r.Y, r.Z).applyMatrix4(M.ci); const half = (r.wid || 0.3) / 2 / s;
    for (let q = 0; q < 2; q++) { HP.t[q] = HP.tw[q]; HP.t[q][0] = V3.a.x + (q ? -half : half); HP.t[q][1] = V3.a.y; HP.t[q][2] = V3.a.z; }
  }
  // a held thing set down beside its holder while the hands work (the god's view draws it so too): on the ground at the right front
  const DOWN = new WeakMap();
  function setDown(H) { let d = DOWN.get(H); if (!d) { d = Object.assign({}, H, { grip: 'chao', hands: '' }); DOWN.set(H, d); } return d; }
  // (the acts that take the hands: what was held waits on the ground)
  const BUSY_HANDS = new Set(['chop', 'mine', 'build', 'fight', 'fish', 'mend', 'hammer', 'forge', 'dig', 'beat', 'cut', 'butcher', 'skin', 'craft', 'shear', 'stab', 'brandish', 'rake', 'reel', 'pick', 'gather', 'plant', 'harvest', 'milk', 'salt', 'sweep', 'feed', 'fill', 'weave', 'pottery', 'throw', 'climb', 'swim', 'dive', 'pray', 'kneel', 'dance', 'hug', 'embrace', 'sit', 'sleep', 'eat', 'drink']);
  P3.setDown = setDown; P3.BUSY_HANDS = BUSY_HANDS;
  P3.rig = function (X, Y, Z, yaw, pose, L) {
    mats(); if (!RF) { RF = BONES.map(() => new THREE.Matrix4()); M.th = new THREE.Matrix4(); IKL.m = new THREE.Matrix4(); Q.a = new THREE.Quaternion(); Q.b = new THREE.Quaternion(); M.k = M.k || new THREE.Matrix4(); M.c2 = new THREE.Matrix4(); M.t = [new THREE.Vector3(), new THREE.Vector3()]; M.ci = new THREE.Matrix4(); V3.a = new THREE.Vector3(); V3.b = new THREE.Vector3(); Q.c = new THREE.Quaternion(); Q.d = new THREE.Quaternion(); M.eu2 = new THREE.Euler(); M.ic = new THREE.Matrix4(); M.tb = new THREE.Matrix4(); M.tb2 = new THREE.Matrix4(); }
    const R = RF; const s = L.s; const lie = pose.lie || 0;
    const root = M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-yaw + Math.PI / 2); root.multiply(M.b);
    if (lie > 0.01) { const pr = pose.prone ? 1 : -1; M.b.makeTranslation(0, 0.16 * s * lie, 0); root.multiply(M.b); M.b.makeRotationX(pr * lie * Math.PI / 2); root.multiply(M.b); M.b.makeTranslation(0, -0.92 * s * lie, 0); root.multiply(M.b); }
    M.b.makeScale(s, s, s); root.multiply(M.b);
    let hipY = 0.92 - pose.crouch * 0.92 + pose.bob;
    const pel = pose.pelY || 0, prl = pose.pelR || 0;
    const pelvis = () => fr(R[B.pel], root, pose.shift || 0, hipY, 0, pose.pelP || 0, pose.twist * 0.3 + pel, (pose.sway || 0) + prl);
    pelvis();
    // the feet first: where each must be (planted in a stride, or kept out of the ground) — and the hips lowered as much as
    // a planted foot needs to be reached
    // (far off — the last level of detail, a figure a few tens of pixels high —: the legs as the pose puts them, no foot planted nor
    // reached, the hips where the stride has them; the feet's memory let go, so that coming near they strike afresh, D-347)
    const far = (L.lod | 0) >= 2 && !lie; if (far && L.plant) for (let k = 0; k < 2; k++) { const f = L.plant[k]; f.on = 0; f.step = null; f.off = 0; }
    const grounded = L.ground !== undefined && !lie && !far;
    const want = [null, null];
    if (grounded) {
      let drop = 0;
      // (a foot the hips would have to sink far for — left behind by a stride, a push — lifts instead: the hips sink for the ground,
      // not for a foot in the wrong place)
      for (let k = 0; k < 2; k++) { want[k] = footWant(R, pose, L, k, s); if (want[k] && !want[k].leaving && !want[k].stepping) { const d = dropFor(R, want[k].T, k); if (d < 0 || d > (L.plant[k].mode === 'gait' || !L.plant[k].mode ? 0.16 : 0.42) + Math.max(0, (L.ground || 0) - (L.plant[k].y === undefined ? L.ground || 0 : L.plant[k].y)) / s) { L.plant[k].on = 0; want[k] = null; } else drop = Math.max(drop, d); } }
      // (as low as a foot on the ground needs them — a slope, a step, a long stride —, never by a fixed cap: L-1101)
      if (drop > 0) { hipY -= Math.min(0.4, drop); pelvis(); L.drop = drop; } else L.drop = 0;
    }
    const tx = pose.lean, ty = pose.twist * 0.7 - pel * 1.7, tz = -(pose.sway || 0) * 0.6 - prl * 0.8 + (pose.tilt || 0);
    fr(R[B.chest], R[B.pel], 0, 0.06, 0, tx, ty, tz); fr(R[B.spine], R[B.pel], 0, 0.06, 0, tx / 2, ty / 2, tz / 2);
    const nx = pose.neck, ny = (pose.lookY || 0) - (pose.twist - pel * 0.7) * 0.85;
    const nz = pose.headR || 0; fr(R[B.head], R[B.chest], 0, 0.56, 0, nx, ny, nz); fr(R[B.neck], R[B.chest], 0, 0.56, 0, nx / 2, ny / 2, nz / 2);
    // (a child's head is big for the body; the grip of the hands: what they hold, the run's fists, the wave's open palm)
    if (L.headK && L.headK !== 1) { M.b.makeScale(L.headK, L.headK, L.headK); R[B.head].multiply(M.b); }
    const hold = (L.torch || L.lantern) && !lie && !L.bind;
    const grip = pose.grip || 0;
    // (what is held — or the empty hands reaching for a point —: where the thing sits and where the palms must be)
    const H = !lie && !L.bind ? L.held || null : null; const rch = !lie && !L.bind && L.reach && L.reach.w > 0.001 ? L.reach : null;
    const PR = !lie && !L.bind && L.pair ? L.pair : null; // (one of two under one crate)
    // (one of two in an act of two — L.duo, from P3.update: the hands to the other's body or to where two hands meet, D-605 —, when
    // the hands hold no load)
    const DU = !lie && !L.bind && !PR && !H && !rch && L.duo && L.duo.w > 0.001 ? L.duo : null;
    if (PR) { M.ci.copy(R[B.chest]).invert(); pairTargets(L, PR); }
    else if (H || rch) { L.yaw0 = -yaw + Math.PI / 2; M.ci.copy(R[B.chest]).invert(); holdTargets(R, L, s); if (hold && !H) HP.t[0] = null; }
    else if (DU) { M.ci.copy(R[B.chest]).invert(); duoTargets(DU); if (hold) HP.t[0] = null; }
    else HP.t[0] = HP.t[1] = null;
    const hw = PR ? 1 : H ? (rch ? 1 : G.clamp(pose.holdW || 0, 0, 1)) : rch ? G.clamp(rch.w, 0, 1) : DU ? G.clamp(DU.w, 0, 1) : 0;
    // (what the hands hold of their own — G.Inv.held, D-336: the thing in the right hand, the other hand's; a hand on a load holds
    // nothing else; and how each is held when no gesture works it: a shaft upright, a tool hanging from the fist, a shield on the
    // forearm, the bow at the side)
    const inv = L.inv || NO_INV, free = !lie && !L.bind && !PR; const busyR = !!(H && H.grip !== 'chao' && H.hands.includes('R')), busyL = !!(H && H.grip !== 'chao' && H.hands.includes('L'));
    const kR = free && !busyR ? inv.mao : null, kL = free && !busyL && !hold ? inv.outra : null; const gR = kR ? gripOf(kR) : null, gL = kL ? gripOf(kL) : null;
    const nR = kR ? itemKind(kR) : null, shaftR = !!kR && !pose.tool && upright(pose) && (gR === 'duas' || gR === 'vara' || SHAFT.has(nR));
    const offW = kR && !hold && !busyL && !kL ? G.clamp(pose.offW || 0, 0, 1) : 0; const off = offW > 0.001 ? offGrip(kR) : null;
    if (off) M.ci.copy(R[B.chest]).invert();
    for (let q = 0; q < 2; q++) {
      const k = 1 - q, sd = k ? -1 : 1; // (the right arm first: the thing in it places the other hand on a thing of two hands)
      let sp = k ? pose.shRp : pose.shLp, sr = k ? pose.shRr : pose.shLr, el = k ? pose.elR : pose.elL;
      if (hold && sd > 0) { sp = -1.05; sr = 0.12; el = 1.25; }
      // (a shaft carried — not swung —: the upper arm by the side, the forearm forward, the shaft upright)
      if (k && shaftR) { sp = 0.05; sr = -0.08; el = 1.05; }
      // (the other hand's thing: a shield before the body on the forearm, the bow at the side, a handle hanging)
      if (!k && kL && upright(pose)) { if (gL === 'escudo') { sp = -0.32; sr = 0.3; el = 1.5; } else if (gL === 'arco') { sp = 0.06; sr = 0.12; el = 0.3; } else if (gL === 'alca') { sp = 0.05; sr = 0.18; el = 0.1; } }
      let jz = G.clamp(-sp, -1, 1) * 0.03, roll = sr + sd * (0.05 + (L.armOut || 0)), ry = (k ? pose.shRy : pose.shLy) || 0; // (a wide skirt or a cape: the arms a little out; the yaw of the upper arm — across the body —, the pose's: 22c, D-597)
      // (the hand on what it holds: the arm that reaches it, eased in from the pose's own by the hold's weight — or the left hand
      // on the thing of two hands the right holds, where the thing's art says the other hand goes)
      let T = hw > 0.001 ? HP.t[k] : null, w = hw, pole0 = HP.pole;
      if (!k && off) { V3.a.set(off[0], off[1], off[2]).applyMatrix4(R[B.tool]).applyMatrix4(M.ci); OFFT[0] = V3.a.x; OFFT[1] = V3.a.y; OFFT[2] = V3.a.z; T = OFFT; w = offW; pole0 = POLE_TWO; }
      if (T) {
        const pole = PL; pole[0] = pole0[0] * sd; pole[1] = pole0[1]; pole[2] = pole0[2]; SH0[0] = sd * 0.235; SH0[1] = 0.46; SH0[2] = jz;
        let o = armIK(sd, SH0, T, pole); const jz2 = G.clamp(-o.rx, -1, 1) * 0.03; if (Math.abs(jz2 - jz) > 0.004) { SH0[2] = jz2; o = armIK(sd, SH0, T, pole); }
        if (w >= 0.999) { sp = o.rx; ry = o.ry; roll = o.rz; el = o.el; }
        else { M.eu.set(sp, 0, roll, 'YXZ'); Q.c.setFromEuler(M.eu); M.eu.set(o.rx, o.ry, o.rz, 'YXZ'); Q.d.setFromEuler(M.eu); Q.c.slerp(Q.d, w); M.eu2.setFromQuaternion(Q.c, 'YXZ'); sp = M.eu2.x; ry = M.eu2.y; roll = M.eu2.z; el = G.lerp(el, o.el, w); }
        jz = G.clamp(-sp, -1, 1) * 0.03;
      }
      fr(R[B.shL + k], R[B.chest], sd * 0.235, 0.46, jz, sp, ry, roll);
      frHalf(R[B.shHL + k], R[B.chest], sd * 0.235, 0.46, jz * 0.5, 0, 0, sd * RIG.roll, sp, ry, roll);
      fr(R[B.faL + k], R[B.shL + k], 0, -0.3, 0, -el, 0, 0); fr(R[B.elHL + k], R[B.shL + k], 0, -0.3, 0, -el / 2, 0, 0);
      fr(R[B.hdL + k], R[B.faL + k], 0, -0.29, 0, k ? 0 : (pose.wristL || 0), 0, 0);
      const onIt = !!PR || (H && H.hands.includes(k ? 'R' : 'L'));
      const g = (hold && sd > 0) || (k ? !!kR || pose.tool : !!kL || offW > 0.3) || onIt ? 1 : k ? grip : pose.gripL || grip; // (the hands close on what they hold)
      fr(R[B.fgL + k], R[B.hdL + k], 0, -RIG.knuckle, 0, 0, 0, -sd * g * 0.95);
      fr(R[B.tbL + k], R[B.hdL + k], -sd * 0.0076, -0.0238, 0.0324, 0, -sd * g * 0.55, -sd * g * 0.25);
      // (the thing in the right hand: through the hole of the closed fist — toward the palm, under the knuckles — along the fist's
      // axis; a shaft carried kept upright by the wrist, a tool carried hanging head down from the fist, a worked one turned by
      // the wrist as it strikes — the clip's wrist)
      if (k) fr(R[B.tool], R[B.hdR], 0.027, -0.076, 0, Math.PI / 2 + (pose.tool ? (pose.wrist || 0) : shaftR ? -Math.PI / 2 + 1.0 : kR && gR === 'punho' ? 1.25 : 0), 0, 0);
    }
    for (let k = 0; k < 2; k++) leg(R, pose, L, k, s, grounded, want[k]);
    // (the skirt: its front follows the leg that is most forward, its back the one most behind, its sides their own leg —
    // the legs as the ground bent them: sitting on the ground the thighs rise far past what the pose asked)
    const hl = LG[0], hr = LG[2], cl = pose.cloth || 0, cs = pose.clothS || 0;
    // (a thigh raised far — sitting, crouching, bent over the ground — carries the cloth over it all the way: in a step,
    // four fifths)
    const fk = a => a * (0.8 + 0.2 * G.clamp((-a - 0.4) * 3, 0, 1)), sk = a => a * (0.75 + 0.25 * G.clamp((-a - 0.4) * 3, 0, 1)); // (a run's long swing, all of it)
    fr(R[B.skF], R[B.pel], 0, -0.04, 0, fk(Math.min(hl, hr, 0)) + Math.min(0, cl) * 0.5, 0, cs * 0.3);
    // (its back: the foot most behind — the thigh and half the knee's fold: the heel kicked up in the swing stays inside)
    fr(R[B.skB], R[B.pel], 0, -0.04, 0, Math.max(hl + LG[1] * 0.5, hr + LG[3] * 0.5, 0) * 0.85 + Math.max(0, cl) * 0.5 - Math.min(hl, hr, 0) * (L.fem ? 0.2 : 0.12), 0, cs * 0.3); // (seated, drawn back over the buttocks — a woman's the fuller)
    // (its sides: their thigh's swing, and its way in or out — a stride's legs are drawn in under the body, 20a)
    fr(R[B.skL], R[B.pel], 0.095, -0.04, 0, sk(hl) + cl * 0.3, 0, cs * 0.4 + LGR[0] * 0.6); fr(R[B.skR], R[B.pel], -0.095, -0.04, 0, sk(hr) + cl * 0.3, 0, cs * 0.4 + LGR[1] * 0.6);
    fr(R[B.clk1], R[B.chest], 0, 0.46, -0.11, Math.max(0, cl) * 0.6, 0, cs * 0.3); fr(R[B.clk2], R[B.clk1], 0, -0.45, 0, Math.max(0, cl) * 0.5, 0, cs * 0.3);
    // (what is held: the torch upright in the left hand whatever the arm does; the tool in the right; the load at the chest)
    M.v.setFromMatrixPosition(R[B.hdL]); R[B.torch].makeRotationY(-yaw + Math.PI / 2); R[B.torch].setPosition(M.v.x, M.v.y, M.v.z); M.b.makeScale(s, s, s); R[B.torch].multiply(M.b);
    // (the things on the body this frame: the hands', the back's, the belt's — frames for the drawing, none of them a bone)
    itemFrames(R, L, pose, yaw, s, kR, gR, kL, gL, free);
    // (the crate of two: between them, its long side along their line; and, for the tests, where the palms came to on it)
    if (PR) { const C = R[B.carry]; C.makeRotationY(-PR.yaw); C.setPosition(PR.X, PR.Y, PR.Z); const p = P3.palms(R); (PR.palms || (PR.palms = {}))[PR.lead === L.id ? 'lead' : 'help'] = p.map(q => (q ? [q.x, q.y, q.z] : null)); }
    // (the held thing that hangs from the fist — upright, its handle in the palm —, or waits on the ground at the right front)
    else if (H && (HP.mode === 'hand' || HP.mode === 'ground')) {
      const C = R[B.carry];
      if (HP.mode === 'hand') { V3.a.set(0.027, -0.076, 0).applyMatrix4(R[B.hdR]); V3.a.y -= HANG[H.form] || H.size[1] * 0.5; }
      else { V3.a.set(-0.42, 0, 0.3).applyMatrix4(root); V3.a.y = (L.ground !== undefined ? L.ground : Y) + H.size[1] / 2; }
      C.makeRotationY(-yaw + Math.PI / 2); C.setPosition(V3.a);
    } else if (!H) fr(R[B.carry], R[B.chest], 0, 0.3, 0.26, 0, 0, 0);
    return R;
  };
  // ------------------------------ the things on the body: their frames ------------------------------
  // (a thing's kind; where the other hand takes a thing of two hands — the item art's grip (G.ItemArt.grip(key).off), else the
  // drawing's own: both hands near the butt of a pick, a hoe, an axe felling; down the haft of a spade; forward on a spear, an oar)
  const itemKind = key => (G.Itens ? G.Itens.parse(key)[0] : String(key));
  const OFF = { picareta: [0, -0.12, 0], enxada: [0, -0.14, 0], machado: [0, -0.12, 0], martelo: [0, -0.08, 0], pa: [0, -0.55, 0], lanca: [0, 0.42, 0], remo: [0, 0.62, 0], rede: [0.14, -0.08, 0], espada: [0, -0.1, 0], vara: [0, -0.16, 0], clava: [0, -0.06, 0], cajado: [0, -0.3, 0] };
  function offGrip(key) { const g = G.ItemArt && G.ItemArt.grip ? G.ItemArt.grip(key) : null; return (g && g.off) || OFF[itemKind(key)] || OFF.machado; }
  P3.offGrip = offGrip;
  const OFFT = [0, 0, 0], POLE_TWO = [0.7, -0.8, -0.25];
  // (the frames of this rig's things — reused, the drawing reads them right after the rig: RX.mao, outra, costas, cinto, and the keys)
  const RX = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, kR: null, kL: null, kB: null, kC: null, kH: null, kT: null, x: null, y: null, z: null, th: [[0, -1, 0], [0, -1, 0], 0.095, -0.095] };
  P3.RX = RX;
  // (a frame: the parent's (scaled), moved by p in it, turned to the basis whose Y is up the thing and Z its front)
  function frameOn(out, parent, px, py, pz, yx, yy, yz, zx, zy, zz) {
    RX.y.set(yx, yy, yz).normalize(); RX.z.set(zx, zy, zz); RX.z.addScaledVector(RX.y, -RX.z.dot(RX.y)).normalize(); RX.x.crossVectors(RX.y, RX.z);
    M.b.makeBasis(RX.x, RX.y, RX.z); M.b.setPosition(px, py, pz); return out.multiplyMatrices(parent, M.b);
  }
  // (upright in the world at a point, facing as the body faces — a basket hanging, a torch, the bow in its hand)
  function uprightAt(out, P, yaw, s, dy) { out.makeRotationY(-yaw + Math.PI / 2); out.setPosition(P.x, P.y + (dy || 0) * s, P.z); M.b.makeScale(s, s, s); return out.multiply(M.b); }
  // where the stowed thing hangs: on the back across it (a shaft from the hip to over the shoulder, a sword hilt up, a shield
  // flat), at the belt by the hip (a sword at the left, the tools at the right) — the item art's own place for it, where it has one
  const BLADE = new Set(['espada', 'faca']);
  // (the item art's place (G.ItemArt.stow: the bone, the grip's point `at` for a body of 1.75 m, the thing's Y and Z in the
  // bone's frame) — the bone's frame carries the body's size, a child's and an elder's alike; L-1116)
  function stowOn(out, R, st) { const a = st.at; return frameOn(out, R[st.bone === 'pel' ? B.pel : B.chest], a[0], a[1], a[2], st.y[0], st.y[1], st.y[2], st.z[0], st.z[1], st.z[2]); }
  function backFrame(out, R, key) {
    const st = G.ItemArt && G.ItemArt.stow ? G.ItemArt.stow(key, 'costas') : null; const k = itemKind(key);
    if (st && st.at && st.y && st.z) return stowOn(out, R, st);
    if (k === 'escudo') return frameOn(out, R[B.chest], 0, 0.27, -0.17, 0, 1, 0, 0, 0, -1);
    if (BLADE.has(k)) return frameOn(out, R[B.chest], -0.02, 0.36, -0.15, 0.38, -0.92, 0, 0, 0, -1); // (the hilt over the right shoulder, the blade down to the left)
    return frameOn(out, R[B.chest], 0, 0.28, -0.15, -0.42, 0.9, 0, 0, 0, -1); // (the business end over the right shoulder)
  }
  function beltFrame(out, R, key) {
    const st = G.ItemArt && G.ItemArt.stow ? G.ItemArt.stow(key, 'cinto') : null; const k = itemKind(key);
    if (st && st.at && st.y && st.z) return stowOn(out, R, st);
    const sd = k === 'espada' ? 1 : -1; // (a sword at the left hip, for the right hand to draw; the tools at the right)
    return frameOn(out, R[B.pel], sd * 0.175, 0.01, 0.03, 0, -0.94, -0.33, 0, -0.33, 0.94);
  }
  function itemFrames(R, L, pose, yaw, s, kR, gR, kL, gL, free) {
    if (!RX.mao) { RX.mao = new THREE.Matrix4(); RX.outra = new THREE.Matrix4(); RX.costas = new THREE.Matrix4(); RX.cinto = new THREE.Matrix4(); RX.cabeca = new THREE.Matrix4(); RX.corpo = new THREE.Matrix4(); RX.x = new THREE.Vector3(); RX.y = new THREE.Vector3(); RX.z = new THREE.Vector3(); }
    RX.kR = RX.kL = RX.kB = RX.kC = RX.kH = RX.kT = null; if (L.bind) return;
    const inv = L.inv || NO_INV;
    // (what is worn: the helmet on the head bone, the cuirass on the chest's — each made in its bone's frame for a body of
    // 1.75 m (D-387): the bone's frame, with the body's size and a child's bigger head in it, is the thing's, D-349)
    if (inv.cabeca) { RX.kH = inv.cabeca; RX.cabeca.copy(R[B.head]); }
    if (inv.corpo) { RX.kT = inv.corpo; RX.corpo.copy(R[B.chest]);
      // (the thighs, for the tabs: each one's direction from the hip to the knee and the hip's side, in the cuirass' frame)
      M.ic.copy(R[B.chest]).invert();
      for (let k = 0; k < 2; k++) { V3.a.setFromMatrixPosition(R[B.thL + k]).applyMatrix4(M.ic); V3.b.setFromMatrixPosition(R[B.snL + k]).applyMatrix4(M.ic); V3.b.sub(V3.a).normalize();
        RX.th[k][0] = V3.b.x; RX.th[k][1] = V3.b.y; RX.th[k][2] = V3.b.z; RX.th[k + 2] = V3.a.x; } }
    if (kR) {
      RX.kR = kR;
      if (gR === 'alca' || gR === 'tocha') { V3.a.set(0.027, -0.076, 0).applyMatrix4(R[B.hdR]); uprightAt(RX.mao, V3.a, yaw, s, gR === 'tocha' ? -0.02 : 0); }
      else RX.mao.copy(R[B.tool]);
    }
    if (kL && gL !== 'tocha') {
      RX.kL = kL;
      if (gL === 'escudo') frameOn(RX.outra, R[B.faL], 0.06, -0.17, 0.01, 0, -1, 0, 1, 0, 0); // (strapped on the forearm, its face out)
      else if (gL === 'arco' || gL === 'alca') { V3.a.set(-0.027, -0.076, 0).applyMatrix4(R[B.hdL]); uprightAt(RX.outra, V3.a, yaw, s, 0); }
      else fr(RX.outra, R[B.hdL], -0.027, -0.076, 0, Math.PI / 2 + 1.25, 0, 0);
    }
    // (stowed: what the body keeps on its back and at its belt — and the thing a load took out of the hand, put there)
    let kB = inv.costas, kC = inv.cinto;
    if (inv.mao && !kR && free && !pose.tool && G.Itens) { if (!kB && G.Itens.fits(inv.mao, 'costas')) kB = inv.mao; else if (!kC && G.Itens.fits(inv.mao, 'cinto')) kC = inv.mao; }
    if (kB && !(pose.lie > 0.4)) { RX.kB = kB; backFrame(RX.costas, R, kB); }
    if (kC) { RX.kC = kC; beltFrame(RX.cinto, R, kC); if ((L.lod | 0) < 2) keepOffThighs(RX.cinto, R, kC, s, L.fem); }
  }
  // (a thing at the belt kept off the thighs: the thigh that swings into it — a stride, a run, a crouch — turns it about where
  // it hangs, as far as the thigh asks, L-1117. The thighs as the body's are (their skin's radius down from the hip, the
  // bind mesh's, a woman's a little wider), the thing as its own points are)
  const THIGH_R = [[-0.05, 0.115], [0.07, 0.106], [0.15, 0.097], [0.3, 0.092], [0.4, 0.078], [0.44, 0.07]];
  const thighR = t => { const T = THIGH_R; if (t <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (t <= T[i][0]) { const a = T[i - 1], b = T[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); } return T[T.length - 1][1]; };
  const BELT_P = new Map();
  function beltPts(key) {
    let p = BELT_P.get(key); if (p !== undefined) return p;
    const b = G.ItemArt && G.ItemArt.raw ? G.ItemArt.raw(key, 0) : null; const src = b ? b.pos : (() => { const g = P3.toolGeo(key, 0); return g ? g.attributes.position.array : null; })();
    p = null; if (src) { const n = src.length / 3, step = Math.max(1, Math.ceil(n / 96)); p = []; for (let i = 0; i < n; i += step) p.push(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]); p = new Float32Array(p);
      // (where it hangs from the belt: the head of what hangs by its head through the belt — the axe, the hammer, the sickle, the
      // club, as the item art stows them —, else its grip)
      const S = G.ItemArt && G.ItemArt.stow ? G.ItemArt.stow(key, 'cinto') : null, c = b && b.marks && b.marks.centro;
      p.hang = S && S.y && S.y[1] > 0 && c ? c[1] : 0; }
    BELT_P.set(key, p); return p;
  }
  function keepOffThighs(F, R, key, s, fem) {
    const pts = beltPts(key); if (!pts) return; const e = F.elements;
    for (let it = 0; it < 4; it++) {
      let worst = 0, px = 0, py = 0, pz = 0, nx = 0, ny = 0, nz = 0;
      for (let k = 0; k < 2; k++) {
        const h = R[B.thL + k].elements, q = R[B.snL + k].elements; let ux = q[12] - h[12], uy = q[13] - h[13], uz = q[14] - h[14]; const Lk = Math.hypot(ux, uy, uz) || 1; ux /= Lk; uy /= Lk; uz /= Lk;
        for (let i = 0; i < pts.length; i += 3) { const x = pts[i], y = pts[i + 1], z = pts[i + 2];
          const X = e[0] * x + e[4] * y + e[8] * z + e[12], Y = e[1] * x + e[5] * y + e[9] * z + e[13], Z = e[2] * x + e[6] * y + e[10] * z + e[14];
          const dx = X - h[12], dy = Y - h[13], dz = Z - h[14]; const t = Math.max(0, Math.min(Lk, dx * ux + dy * uy + dz * uz));
          const vx = dx - ux * t, vy = dy - uy * t, vz = dz - uz * t; const d = Math.hypot(vx, vy, vz) || 1e-6; const pen = s * (thighR(t / s) + (fem ? 0.005 : 0) + 0.012) - d;
          if (pen > worst) { worst = pen; px = X; py = Y; pz = Z; nx = vx / d; ny = vy / d; nz = vz / d; } }
      }
      if (worst <= 0) return;
      // (turned about its hanging point: the deepest point pushed out along the thigh's outward normal)
      const hy = pts.hang, ox = e[4] * hy + e[12], oy = e[5] * hy + e[13], oz = e[6] * hy + e[14]; const ax = px - ox, ay = py - oy, az = pz - oz; const al = Math.hypot(ax, ay, az) || 1;
      V3.a.set(ay * nz - az * ny, az * nx - ax * nz, ax * ny - ay * nx); const sl = V3.a.length(); if (sl < 1e-6) return; V3.a.multiplyScalar(1 / sl);
      Q.a.setFromAxisAngle(V3.a, Math.min(0.6, worst / al * 1.15)); F.premultiply(M.tb.makeRotationFromQuaternion(Q.a));
      e[12] = ox - (e[4] * hy); e[13] = oy - (e[5] * hy); e[14] = oz - (e[6] * hy); // (the turn moved it about the world's origin: its hanging point put back)
    }
  }
  // the things drawn this frame, by the body's level of detail
  function itemsPut(L) { const lod = L.lod | 0; if (RX.kR) itemPut(RX.kR, lod, RX.mao); if (RX.kL) itemPut(RX.kL, lod, RX.outra); if (RX.kB) itemPut(RX.kB, lod, RX.costas); if (RX.kC) itemPut(RX.kC, lod, RX.cinto);
    if (RX.kH) itemPut(RX.kH, lod, RX.cabeca); if (RX.kT) cuirPut(RX.kT, Math.max(0, Math.min(2, lod)), RX.corpo); }
  // (the cuirass: whole, or its body and each of its tabs turned as the thighs push it — the lifts the rig left in RX.lift)
  function cuirPut(key, lod, F) {
    const T = tabsOf(key, lod); if (!T) { itemPut(key, lod, F); return; }
    const put = (m, X) => { const n = IMN.get(m); if (n < MAX) { m.setMatrixAt(n, X); IMN.set(m, n + 1); } };
    put(T.main, F);
    for (let j = 0; j < T.tabs.length; j++) { const tb = T.tabs[j], th = tabLift(tb); const a = tb.a;
      // (about the tab's top, along the cuirass' foot: out and up — F · T(a) · R(t, −θ) · T(−a))
      Q.a.setFromAxisAngle(RX.y.set(tb.t[0], tb.t[1], tb.t[2]), -th); M.tb.makeRotationFromQuaternion(Q.a);
      const e = M.tb.elements; e[12] = a[0] - (e[0] * a[0] + e[4] * a[1] + e[8] * a[2]); e[13] = a[1] - (e[1] * a[0] + e[5] * a[1] + e[9] * a[2]); e[14] = a[2] - (e[2] * a[0] + e[6] * a[1] + e[10] * a[2]);
      put(tb.m, M.tb2.multiplyMatrices(F, M.tb)); }
  }
  // (how far a tab turns: as far as the thigh under it is raised from hanging — toward the tab's own side and heading — less a
  // little give; the thighs' directions in the cuirass' frame, from the rig: RX.th)
  function tabLift(tb) {
    let th = 0;
    for (let k = 0; k < 2; k++) { const u = RX.th[k]; const phi = Math.acos(Math.max(-1, Math.min(1, -u[1]))); if (phi < 0.2) continue;
      const hl = Math.hypot(u[0], u[2]) || 1; const head = (u[0] * tb.n[0] + u[2] * tb.n[2]) / hl; const side = 1 - Math.abs(tb.a[0] - RX.th[k + 2]) / 0.3;
      const w = Math.max(0, Math.min(1, head * 2.5 + 0.2)) * Math.max(0, Math.min(1, side * 1.8)); th = Math.max(th, w * Math.min(2.8, (phi - 0.18) * 1.4)); }
    return th;
  }
  // (for the tests: where the palms of the hands are, in the world, from the rig's last frame)
  P3.palms = R => [V3.a ? new THREE.Vector3(-0.027, -0.076, 0).applyMatrix4(R[B.hdL]) : null, V3.a ? new THREE.Vector3(0.027, -0.076, 0).applyMatrix4(R[B.hdR]) : null];
  P3.B = B;
  // (standing, walking, talking, turning: a shaft can be carried upright — not lying, swimming, sitting, crouching)
  function upright(pose) { return !(pose.lie > 0.05) && !(pose.crouch > 0.25); }
  // the body as one skin: the rig's bones and the look to Body3D; the things held and the marker as before
  let skin = false, fauna = false;
  function bodySkin(idx, X, Y, Z, yaw, pose, L, marker) {
    const R = P3.rig(X, Y, Z, yaw, pose, L);
    L.face = Anim.faceOf(pose, L);
    G.Body3D.put(idx, R, pose, L, X, Y, Z);
    const s = L.s, lie = pose.lie || 0;
    if ((L.torch || L.lantern) && !lie) {
      put('torch', idx, R[B.torch], 0, 0, 0, 0.12, 0, 0, 0, L.lantern ? -0.1 : 0.18, 0, 0.045, L.lantern ? 0.2 : 0.55, 0.045, L.lantern ? '#3a2a1a' : '#5a3c22');
      M.v.setFromMatrixPosition(R[B.torch]); if (P3.flames.length < 40) P3.flames.push([M.v.x, M.v.y + (L.lantern ? -0.18 : 0.47) * s, M.v.z, L.lantern ? 0.5 : 0.85]);
    } else hide('torch', idx);
    // (the things on the body: in the hands, on the back, at the belt — G.Inv.held's, in their own shapes)
    itemsPut(L); hide('tool', idx);
    // (the load: the thing it is, where the rig put it — the old box only if its form could not be drawn)
    if (L.held && heldPut(R, L)) hide('carry', idx); else if (L.carry) put('carry', idx, R[B.chest], 0, 0.3, 0.26, 0, 0, 0, 0, 0, 0, 0.34, 0.26, 0.3, '#9a7a4a'); else hide('carry', idx);
    if (marker) put('marker', idx, M.root, 0, 2.15 + Math.sin(performance.now() / 300) * 0.04, 0, 0, performance.now() / 600, 0, 0, 0, 0, 0.16, 0.22, 0.16, marker); else hide('marker', idx); // (M.root: the rig's root)
  }
  // the parts the skin replaces (the props stay: the torch, the tool, the load, the marker over a head)
  const PROPS = new Set(['torch', 'tool', 'carry', 'marker']);

  // (where the feet of someone walking stand: the ground — and, over a river, where the body's own stand: the bed of a ford
  // under its water, a bridge's deck, the ice — Space.footAt; on the water's own level they stood under the deck, L-861)
  function groundY(x, y) { const S = G.S; const i = W.idx(x, y); if (S.type[i] === G.T.RIVER) return G.Space.footAt(x, y); if (S.cliff && S.cliff[i] && G.Space.cliffAt) return G.Space.cliffAt(x, y); return W.groundH(x, y) * G.Space.HM; } // (21b: on a cliff, the climbers on its face as it is drawn — D-492)
  // the hands of the world's people, as the view remembers them: while a gesture of the hands lasts (G.Act.ANIM's acts: 'lift'
  // — levantar, pousar, empilhar —, 'arrange' — porNaBanca, tirarDaBanca —, 'give' — entregar) the empty hands reach down for
  // the load — the crate drawn there, or before the feet —; when the world puts the load in the hands it rises from where the
  // hands held it; with the load in the hands the same gesture sets it down before the feet, and it leaves the hands where the
  // world takes it. Never ahead of the world: the load is drawn in the hands only while the world has it there (only seen)
  const LIFT_ACTS = new Set(['lift', 'arrange']), PUT_ACTS = new Set(['lift', 'arrange', 'give']);
  P3.LIFT_ACTS = LIFT_ACTS; P3.PUT_ACTS = PUT_ACTS;
  function reachOf(s, v, L, X, Y, Z, dt) {
    const H = L.held && L.held.grip !== 'chao' && L.held.grip !== 'lado' ? L.held : null; const c = Math.cos(s.yaw), n = Math.sin(s.yaw);
    // (a load just come to the hands, where they were reaching: lifted from there)
    if (H && !s.hk && s.rw > 0.25 && s.rP) s.lift = { X: s.rP[0], Y: s.rP[1], Z: s.rP[2], w: 1 };
    s.hk = H ? H.form : null;
    // (a gesture begun with empty hands is a lift to its end: the load it brought is not set down by it — 'lift' is both)
    if (!LIFT_ACTS.has(v.act) && !PUT_ACTS.has(v.act)) s.ga = null; else if (!H && LIFT_ACTS.has(v.act)) s.ga = v.act;
    let want = 0;
    if (!H && LIFT_ACTS.has(v.act)) {
      want = 1; const P = s.rP || (s.rP = [0, 0, 0]); const src = P3.nearLoad(X, Z, 1.8);
      if (src) { P[0] = src[0]; P[1] = src[1]; P[2] = src[2]; } else { P[0] = X + c * 0.55; P[1] = Y + 0.2; P[2] = Z + n * 0.55; }
    } else if (H && PUT_ACTS.has(v.act) && s.ga !== v.act) { want = 1; const P = s.rP || (s.rP = [0, 0, 0]); P[0] = X + c * 0.55; P[1] = Y + H.size[1] / 2 + 0.02; P[2] = Z + n * 0.55; }
    s.rw = G.clamp((s.rw || 0) + (want ? 1 : -1) * dt / 0.45, 0, 1);
    if (s.lift) { s.lift.w -= dt / 0.5; if (s.lift.w <= 0 || !H) s.lift = null; }
    const r = s.lift || (s.rw > 0.001 && s.rP ? (s.rq || (s.rq = {})) : null);
    if (r && r !== s.lift) { r.X = s.rP[0]; r.Y = s.rP[1]; r.Z = s.rP[2]; r.w = s.rw; }
    if (r) r.wid = H ? H.size[0] : 0.32;
    L.reach = r;
  }
  P3.reachOf = reachOf; // (for the tests)
  // ------------------------------ the frame ------------------------------
  P3.avatar = null; // (set by the body's controller: { X, Y, Z, yaw, pose, look })
  P3.flames = []; // (the flames of the torches and lanterns in the hands drawn this frame: [X, Y, Z, size] — for FX3D)
  P3.walkers = []; // (the people drawn whole this frame: [X, Y, Z, speed, state, act, yaw, id] — only seen)
  // (the crates of two drawn this frame: { lead, help, X, Y, Z, yaw, gap, H, palms: { lead, help } } — for the tests; only seen.
  // Two within 1.2 m — what both pairs of arms reach on a crate of half a metre — carry it between them; its middle 1.08 m
  // over the ground, the palms a little under it, at the belly — L-210)
  P3.pairs = []; const pairOf = new Map(); G.worldHooks.push(() => { pairOf.clear(); P3.pairs.length = 0; });
  const PAIR_NEAR = 1.2, PAIR_Y = 1.08;
  P3.highlight = 0; // (the one the body is looking at, to talk to)
  // (the ground under a foot of someone of the world: the land, a ford's bed, a deck — and a boulder's stone, the steps before a
  // door: as the body's own feet have it; metres in, metres out)
  function npcFloor(X, Z) { const TL = G.Space.TILE; return Math.max(groundY(X / TL, Z / TL), G.Space.stoneTop(X, Z), G.Space.stepTop(X, Z)); }
  P3.npcFloor = npcFloor;
  const INP = {}; // (the animator's input, one object for everyone: nothing made each frame)
  // (the clip of an act in step with the world's own clock of it: v.actT, the world seconds since the act — or its stroke — began;
  // a clip that names its stroke's period lands its contact where the world's stroke lands)
  function clipClock(v, st) { const C = Anim.CLIPS && Anim.CLIPS[st]; if (!C || !(C.period > 0)) return undefined; return Anim.loopTime(C, v.actT || 0, C.period); }
  P3.clipClock = clipClock;
  // (the frame's own lists and clocks, kept: the nearest people a frame — reused entries, nothing made each frame —, the frames
  // drawn and the view's seconds, for the beats of the far ones and the crowd's portraits)
  // (the chest of someone in an act of two, for the other's hands: the rig's own of this frame where the skin drew them, else their
  // standing chest where the view put them — D-605)
  let CH0 = null;
  function keepChest(s, Y, k) {
    const m = s.chM || (s.chM = new THREE.Matrix4());
    if (skin && RF) { m.copy(RF[B.chest]); return; }
    if (!CH0) { const L1 = { s: 1, plant: null, ground: undefined, held: null, reach: null, pair: null, duo: null, inv: NO_INV, lod: 2 }; CH0 = P3.rig(0, 0, 0, Math.PI / 2, POSE0(), L1)[B.chest].clone(); }
    M.dc = M.dc || new THREE.Matrix4(); m.makeTranslation(s.X, Y, s.Z); M.dc.makeRotationY(-s.yaw + Math.PI / 2); m.multiply(M.dc); M.dc.makeScale(k, k, k); m.multiply(M.dc); m.multiply(CH0);
  }
  // (where the hands go on the other, in the world: a point of the other's trunk — their chest's frame —, or a point between the two
  // where two hands meet — the middle of the two chests, x to my left, y from the lower chest, z toward the other; the rig takes the
  // hands there by the arms' reach, by the act's weight in its window, du.k)
  const POLE_DUO = [0.7, -0.6, -0.4];
  function duoAim(s, du, Y) {
    const e = du.e, o = du.o; if (!e.hands || !o.chM || !s.chM) return null;
    const r = s.duT || (s.duT = { T: [[0, 0, 0], [0, 0, 0]], on: [false, false], w: 0, pole: POLE_DUO });
    r.w = du.k; r.pole = e.pole || POLE_DUO;
    const me = DV.a || (DV.a = new THREE.Vector3()), ot = DV.b || (DV.b = new THREE.Vector3()), p = DV.c || (DV.c = new THREE.Vector3());
    me.setFromMatrixPosition(s.chM); ot.setFromMatrixPosition(o.chM);
    let fx = ot.x - me.x, fz = ot.z - me.z; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl; const lx = fz, lz = -fx; // (my left: the facing turned a quarter)
    for (let q = 0; q < 2; q++) {
      const h = e.hands[q]; r.on[q] = !!h; if (!h) continue;
      if (h[0] === 'b') p.set(h[1], h[2], h[3]).applyMatrix4(o.chM);
      else p.set((me.x + ot.x) / 2 + lx * h[1] + fx * h[3], Math.min(me.y, ot.y) + h[2], (me.z + ot.z) / 2 + lz * h[1] + fz * h[3]);
      r.T[q][0] = p.x; r.T[q][1] = p.y; r.T[q][2] = p.z;
    }
    return r;
  }
  const DV = {};
  P3.duoAim = duoAim; P3.keepChest = keepChest; // (for the tests)
  const NEAR = [], NEARP = [], INS = [], DRAWN = [], DRAWNP = []; const byD2 = (a, b) => a[0] - b[0]; let frameNo = 0, vt = 0;
  const IN_REACH = 60; // (metres: how far inside its building someone's place can be from where the world has them — the biggest lot, and more)
  const visAt = id => vis.get(id);
  // (the crowd's portraits: each one's look kept and made again every ¾ to 1¼ s — each one on their own beat, by their id —, not
  // every frame: the crowd's colours are the clothes of the one they are, and they change in seconds, not frames — D-591)
  const CROWD = new Map(); G.worldHooks.push(() => { CROWD.clear(); NEARP.length = 0; NEAR.length = 0; INS.length = 0; });
  // (the posture of one of the crowd, made again with their portrait: from the state the fine body would have — standing, seated,
  // kneeling, the arms raised, the hands at the face, lying —: the cheering crowd at the feast and the scaffold, the mourners on their
  // knees, the sleepers of a camp read from far off, D-608)
  const CROWD_DY = [0, -0.62, -0.45, 0, 0, 0.12];
  const POSE_OF = { sit: 1, rest: 1, eat: 1, eatg: 1, rockg: 1, rock: 1, 'ato-contar': 1, low: 1, cook: 1, pray: 2, 'ato-chorar-joelhos': 2, 'ato-implorar': 2, 'ato-condenado': 2, 'ato-propor': 2,
    'ato-esconder': 2, 'crianca-cao': 2, 'fam-festa': 3, 'ato-alegria': 3, 'ato-rito': 3, 'ato-motim': 3, 'ato-gritar': 3, 'ato-vaia': 3, mourn: 4, 'ato-luto-roda': 0, 'ato-desmascarar': 4, sleep: 5, sick: 5 };
  function crowdPose(v, L) { if (v.moving) return 0; const st = Anim.stateOf(v, 0, L); return POSE_OF[st] || 0; }
  P3.crowdPose = crowdPose;
  function crowdLook(v) {
    let e = CROWD.get(v.id); if (!e) { e = { L: {}, t: -1e9 }; CROWD.set(v.id, e); }
    if (vt - e.t > 0.75 + (v.id % 17) * 0.03) { const L = P3.lookInto(e.L, v); e.t = vt; e.cF = color(P3.farCol(L)); e.cS = color(L.skin); e.cH = color(L.hair); e.cL = color(L.robe ? L.cloth : L.pants); e.p = crowdPose(v, L); }
    return e;
  }
  P3.update = function (dt, focus) {
    if (!mesh || !focus) return;
    const S = G.S; const q = R3.Q(); const TL = G.Space.TILE, HM = G.Space.HM;
    // (the eye: how far each one is from it picks the fine body or the lighter one — the camera, not the body it follows)
    const cam = R3.camera ? R3.camera() : null; seenAt[0] = cam ? cam.position.x : focus.X; seenAt[1] = cam ? cam.position.z : focus.Z; field(cam, q);
    { const sk = R3.LT && R3.LT.sky; if (sk) RIM.value = 0.2 * G.clamp((0.3 * sk[0] + 0.6 * sk[1] + 0.1 * sk[2]) / 1.2, 0.15, 1); }
    const R = q.view * 0.22; const R2 = R * R; const RC = q.view * 0.55, RC2 = RC * RC; // (full bodies near; the crowd out to here)
    const av = P3.avatar; frameNo++; vt += dt;
    // the nearest people first, as many as the machine is told to carry
    const near = NEAR; near.length = 0;
    // (who the world has inside a building is drawn only where its inside is drawn, where Interiors puts them: Build3D.openPlace;
    // in one open to the sky — a fair —, always: where its plan puts them, or where the world has them before its plan is made.
    // Someone inside is drawn only whole — the crowd draws nobody inside —: one whose building is farther than the whole bodies
    // the people outdoors already fill is not asked where their place is, D-591)
    const placeOf = v => (v.inside && G.Build3D && G.Build3D.openPlace ? G.Build3D.openPlace(v) : null);
    const openSky = id => !!(G.Build3D && G.Build3D.openShell && G.Build3D.openShell(id));
    const ins = INS; ins.length = 0; const RIN2 = (R + IN_REACH) * (R + IN_REACH);
    for (const v of S.villagers.values()) {
      if (av && v.id === av.id) continue;
      if (v.aboard || v.ug || v.held || (v.age < 2 && v.carried)) continue;
      if (v.inside) { if ((v.x * TL - focus.X) ** 2 + (v.y * TL - focus.Z) ** 2 <= RIN2) ins.push(v); continue; }
      const X = v.x * TL, Z = v.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; if (d2 > RC2) continue;
      const e = NEARP[near.length] || (NEARP[near.length] = [0, null]); e[0] = d2; e[1] = v; near.push(e);
    }
    near.sort(byD2);
    { const cap = Math.min(q.npcs, MAX - 1), m = Math.min(near.length, cap); const cut = m === cap && m > 0 ? Math.min(R2, near[m - 1][0]) : R2; const cr = Math.sqrt(cut) + IN_REACH;
      let put = 0;
      for (const v of ins) {
        if ((v.x * TL - focus.X) ** 2 + (v.y * TL - focus.Z) ** 2 > cr * cr) continue;
        const pl = placeOf(v); if (!pl && !openSky(v.inside)) continue;
        const X = pl ? pl.X : v.x * TL, Z = pl ? pl.Z : v.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; if (d2 > RC2) continue;
        const e = NEARP[near.length] || (NEARP[near.length] = [0, null]); e[0] = d2; e[1] = v; near.push(e); put++;
      }
      if (put) near.sort(byD2); }
    let n = Math.min(near.length, q.npcs, MAX - 1); while (n > 0 && near[n - 1][0] > R2) n--;
    let idx = 0, emoN = 0, culled = 0; P3.walkers.length = 0; P3.flames.length = 0;
    if (skin && G.Body3D.broken(R3.renderer && R3.renderer())) { skin = false; G.Body3D.clear(); PARTS.forEach((p, k) => { mesh[k].visible = true; }); }
    if (skin) G.Body3D.begin(); toolsBegin(); heldBegin();
    if (av) {
      // (the body's feet: where they stand in its stride — the view's own memory, a new one for a new body or after a jump)
      if (!avFeet || avFeet.id !== av.id || Math.hypot(av.X - avFeet.X, av.Z - avFeet.Z) > 4) avFeet = { id: av.id, f: [{ on: 0 }, { on: 0 }], an: Anim.memory() }; avFeet.X = av.X; avFeet.Z = av.Z;
      av.look.ground = av.ground === false || av.swim ? undefined : av.Y; av.look.plant = avFeet.f; av.look.gnd = av.look.ground === undefined ? null : av.gnd || null;
      // (the body's pose, made in this frame by the same animator as everyone's, from the motion its controller gives — the
      // frame's own time, interpolated: smooth at 60, 120 or 144 frames a second, 20a; a pose given whole — the fall of a death —
      // is drawn as it is)
      // (the body the player lives carries itself as the people of the world do — the porte of its life, the little things when the
      // player leaves it standing, the living face —: the reader's numbers of the person it is, T-1614, D-609; the stride, the turn,
      // the act and the clips are the body's own, avatar.js's)
      const avv = S.villagers.get(av.id);
      if (av.drive) { const I = av.drive; I.X = av.X; I.Z = av.Z; I.ground = av.look.ground; I.s = av.look.s;
        if (avv) { avFeet.yaw = av.yaw; avFeet.sp = 0; I.porte = G.Vida3D.read(avFeet, avv, vt, DRAWN); I.clock = S.clock; I.id = av.id; I.tempo = G.Vida3D.tempo(avv); I.ctx = avFeet.ctx; I.lod = 0; I.tired = G.Vida3D.tired(avv); }
        Anim.drive(avFeet.an, I, av.pose, av.look, dt); if (I.post) I.post(av.pose, dt, I); }
      avFeet.t = (avFeet.t || 0) + dt; av.pose.blink = Anim.blinkAt(avFeet.t, av.id); cloth(avFeet, av.X, av.Z, av.yaw, dt, av.pose); if (av.look.mood) av.look.mood = Anim.easeMood(avFeet, av.look.mood, dt);
      if (avv && av.drive && Anim.faceMix) { av.drive.humor = G.Vida3D.humor(avv); Anim.faceMix(avFeet, av.drive, av.pose, av.look.mood, avFeet.an, dt); }
      av.look.lod = 0;
      P3.body(idx++, av.X, av.Y, av.Z, av.yaw, av.pose, av.look, null);
    }
    // (two under one crate — G.Act.pair: the one ahead holds it in the world, the helper behind takes its other end —, both
    // drawn whole, out of doors, and near enough for one crate to be in both pairs of hands: its frame between them, at the
    // belly, its long side along their line — L-210. Farther apart — a turn the world takes wide —, the crate at the chest of
    // the one ahead and the helper's arms a carrier's: no crate is drawn that the world does not have)
    P3.pairs.length = 0; pairOf.clear();
    if (G.Act && G.Act.pair) {
      const whole = new Set(); for (let k = 0; k < n; k++) whole.add(near[k][1].id);
      for (let k = 0; k < n; k++) {
        const v = near[k][1]; if (v.inside) continue; const p = G.Act.pair(v); if (!p || p.lead !== v.id) continue;
        const h = S.villagers.get(p.help); if (!h || h.inside || !whole.has(h.id)) continue;
        const q = G.Act.pair(h); if (!q || q.lead !== v.id) continue; // (the helper's own errand says so too: one called away holds nothing)
        const X1 = v.x * TL, Z1 = v.y * TL, X2 = h.x * TL, Z2 = h.y * TL; const gap = Math.hypot(X1 - X2, Z1 - Z2); if (gap > PAIR_NEAR || gap < 0.45) continue;
        const fc = G.Fac.ofV ? G.Fac.ofV(v) : null; const Hd = P3.held(v, (fc && fc.civ) || v._civ || v.civ || 'nordico'); if (!Hd || Hd.gear || Hd.grip === 'lado' || Hd.grip === 'cabeca') continue;
        const X = (X1 + X2) / 2, Z = (Z1 + Z2) / 2;
        const e = { lead: v.id, help: h.id, X, Y: groundY(X / TL, Z / TL) + PAIR_Y, Z, yaw: Math.atan2(Z1 - Z2, X1 - X2), gap: +gap.toFixed(3), H: Hd, palms: null };
        pairOf.set(v.id, e); pairOf.set(h.id, e); P3.pairs.push(e);
      }
    }
    const seen = new Set();
    // (who is drawn whole, where the view had them — for whom each one looks at: Vida3D.lookPick)
    DRAWN.length = 0; for (let k = 0; k < n; k++) { const w = vis.get(near[k][1].id); if (w) { const e = DRAWNP[DRAWN.length] || (DRAWNP[DRAWN.length] = [0, 0, 0]); e[0] = w === undefined ? 0 : near[k][1].id; e[1] = w.X; e[2] = w.Z; DRAWN.push(e); } }
    for (let k = 0; k < n; k++) {
      const v = near[k][1]; seen.add(v.id);
      let s = vis.get(v.id); const pl = placeOf(v);
      const Xw = pl ? pl.X : v.x * TL, Zw = pl ? pl.Z : v.y * TL; const swim = v.task && v.task.type === 'swim';
      // (each one's own clocks begun at their own place — the breath, the weight shifts, the gestures of no world's stroke —: two seen
      // first in the same frame never move in step, D-599)
      if (!s) { s = { X: Xw, Z: Zw, Y: undefined, yaw: v.face > 0 ? 0 : Math.PI, yawV: 0, pose: POSE0(), t: G.hash(v.id * 3 + 1) * 60, sp: 0, acc: 0, st: 'idle', an: Anim.memory(), plant: [{ on: 0 }, { on: 0 }], L: {} }; s.an.ck = G.hash(v.id * 5 + 2); s.an.ph = G.hash(v.id * 7 + 3); vis.set(v.id, s); }
      // (where the view draws them: where the world has them — the corner of their way rounded ahead, the start and the stop
      // eased, a change of place inside walked: Anim.track, D-344)
      const pX = s.X, pZ = s.Z; Anim.track(s, v, Xw, Zw, !!pl, dt, TL); const X = s.X, Z = s.Z;
      s.lod = lodAt(s.lod, (s.X - seenAt[0]) ** 2 + (s.Z - seenAt[1]) ** 2);
      // (far off — the last level of detail —, or out of the eye's field the last frame: the pose made again every second frame, or
      // every third farther than twice its edge or unseen, each one on their own beat by their id; between, the last pose goes along
      // with them — where they are and their turn are every frame's, the ground under them the last pose's. The time of the frames
      // between is the next pose's: the stride's phase never lags their way, D-591 — only while the frames are short: the animator takes
      // a tenth of a second at most a pose, and three frames of a slow machine would lose time to it, L-1772)
      const pr = pairOf.get(v.id) || null; s.dtA = (s.dtA || 0) + dt;
      const beat = (s.lod < 2 && !s.cull) || pr || !s.made || dt > 0.045 ? 1 : s.cull || (s.X - seenAt[0]) ** 2 + (s.Z - seenAt[1]) ** 2 > 4 * LODD[1] * LODD[1] ? 3 : 2;
      const fresh = beat === 1 || (frameNo + v.id) % beat === 0;
      // (the world walks them over a boulder's tile: the feet go up onto the stone and down again, a quick step — never through it;
      // inside, on the floor, the bed, the bench the plan has there)
      const Yf = pl ? pl.Y : swim ? W.waterH(X / TL, Z / TL) * HM - 0.32 : fresh || s.Yf === undefined ? (s.Yf = npcFloor(X, Z)) : s.Yf;
      if (s.Y === undefined || Math.abs(Yf - s.Y) > (pl ? 0.6 : 3)) { s.Y = Yf; if (pl) { s.snap = 1; Anim.track(s, v, Xw, Zw, true, dt, TL); } } else s.Y += (Yf - s.Y) * (1 - Math.exp(-14 * dt));
      const Y = s.Y + (v.z ? v.z * 0.22 : 0);
      // (a jump of the world — a teleport, a load — is not a step: the feet stand where they land)
      if (Math.hypot(s.X - pX, s.Z - pZ) > 3) { s.plant[0].on = s.plant[1].on = 0; s.plant[0].step = s.plant[1].step = null; }
      Anim.face(s, v, pl && s.sp < 0.2 ? pl : null, dt);
      s.t += dt * G.Vida3D.tempo(v); // (the breath and the weight shifts at each one's own pace)
      const Lv = fresh ? lookFill(s.L, v) : s.L; const dtA = fresh ? s.dtA : 0; if (fresh) s.dtA = 0;
      let st = pl && s.sp < 0.2 ? pl.st : fresh || !s.st ? Anim.stateOf(v, s.sp, Lv) : s.st;
      // (two in one gesture — the reader's Vida3D.duo, D-605: each one's part of the act and, in its window on the world's clock, the
      // hands on the other; the place is the world's — never moved here —, and too far apart each one plays the act alone)
      const du = pl ? null : fresh ? G.Vida3D.duo(s, v, visAt) : s.duOn ? s.du : null; s.duOn = !!du;
      if (du && du.clip) st = du.clip;
      // (waved at by the body: those standing or strolling near wave back, a moment later — only seen; and the act over the stride
      // of whoever walks: the prisoner's bound hands, the word said walking — the reader's, Vida3D.overOf)
      let over = null;
      if (s.greetT > 0) { if ((s.greetD -= dt) <= 0) { s.greetT -= dt; if (st === 'idle' || st === 'talk') st = 'wave'; else if (st === 'walk') over = 'wave'; } }
      if (!over) over = G.Vida3D.overOf(v, st);
      // (one of two under one crate: the frame between them; the crate is the one ahead's, drawn once, by his rig — both hands
      // of each on it: no torch, no thing in the hands)
      Lv.pair = pr;
      if (pr) { Lv.torch = false; Lv.lantern = false; Lv.inv = NO_INV; if (pr.help === v.id) { Lv.held = null; Lv.carry = false; } }
      // (the load in the hands and the hands reaching: the view's own memory of the lift and the setting down — reachOf)
      Lv.ground = swim || v.z > 0.05 ? undefined : Y; Lv.plant = s.plant; Lv.gnd = pl || swim ? null : npcFloor; if (fresh) reachOf(s, v, Lv, s.X, Y, s.Z, dtA);
      // (and the drink, where the world has them drunk and on their feet: the additive stagger — inside, at their place, they sit)
      const dk = pl ? 0 : Lv.drunk || 0; s.dk = dk;
      Lv.lod = s.lod; Lv.duo = du && du.k > 0.001 ? duoAim(s, du, Y) : null;
      if (fresh) {
        // the body's animator: the stride or the posture, the hands, the clip of the act in step with the world's own clock of it
        // (v.actT), the drink, the tiredness — the pose made from what they do (anim-body.js; the reader's numbers: vida3d.js)
        const I = INP; I.st = st; I.t = s.t; I.sp = s.sp; I.yaw = s.yaw; I.yawV = s.yawV; I.acc = s.acc; I.X = s.X; I.Z = s.Z; I.ground = Lv.ground; I.s = Lv.s;
        // (the gait is the world's intent, not the speed: whoever the world has walking walks — a long, quick stride on a road —, and
        // only one in a hurry runs: the world's own «run» — the chase, the flight, the charge — or faster than a walk goes; L-1119)
        I.run = st === 'run' ? 1 : 0; I.walk = st === 'walk' || st === 'carryWalk' || st === 'sneak' ? 1 : 0; I.over = over; I.overK = undefined; I.clipK = du && du.clip ? du.u : clipClock(v, st); I.drunk = dk; I.tired = G.Vida3D.tired(v); I.id = v.id;
        // (the porte: the reader's, made again about twice a second — the years, the cold, the grief… —; the world's clock for its tremor and
        // its breath; the hand one leads with)
        I.porte = G.Vida3D.read(s, v, vt, DRAWN); I.clock = S.clock; I.lefty = G.Vida3D.lefty(v);
        // (the idle's little things: the reader's context, near the eye — the middle level the big ones only, far off none)
        I.ctx = s.lod >= 2 ? null : s.ctx; I.lod = s.lod; I.tempo = G.Vida3D.tempo(v); I.push = G.Vida3D.apart(s, v.id, st, DRAWN, visAt, vt);
        Anim.drive(s.an, I, s.pose, Lv, dtA); s.made = 1; G.Vida3D.mark(s, st, vt);
        // (the look: the body, where it stands before them — and back when it goes —; else the one they are with; a blink now and then)
        const look = G.Vida3D.look(s, v, av, st, visAt);
        s.pose.lookY = (s.pose.lookY || 0) + (look - (s.pose.lookY || 0)) * (1 - Math.exp(-4 * dtA));
        s.pose.gazeX = G.clamp((look - s.pose.lookY) * 0.9, -0.42, 0.42); // (the eyes go first, the head follows)
        s.pose.blink = Anim.blinkAt(s.t, v.id); cloth(s, s.X, s.Z, s.yaw, dtA, s.pose); if (Lv.mood) Lv.mood = Anim.easeMood(s, Lv.mood, dtA);
        // (the living face: the channels of the face in the pose — the mood beneath, the feeling, the porte, the little thing, the
        // blink, the look, the speech; anim-rosto.js — near the eye; farther the face is a few pixels, and the old numbers do)
        if (s.lod < 2 && Anim.faceMix) { I.humor = G.Vida3D.humor(v); Anim.faceMix(s, I, s.pose, Lv.mood, s.an, dtA); } else s.pose.face = null;
      }
      s.st = st;
      if (P3.walkers.length < 40) P3.walkers.push([s.X, Y, s.Z, s.sp, st, v.act, s.yaw, v.id]); // (for the dust and the chips they raise, the grass they part)
      // (outside the eye's field, their shadow too: not drawn this frame — their steps go on; a torch they hold still burns
      // and lights round it, about where their hand is)
      s.cull = inField(s.X, Y, s.Z, Lv.s) ? 0 : 1;
      if (s.cull) { culled++; if ((Lv.torch || Lv.lantern) && P3.flames.length < 40) { const c = Math.cos(s.yaw), n = Math.sin(s.yaw), k = Lv.s; P3.flames.push([s.X + (c * 0.28 + n * 0.2) * k, Y + (Lv.lantern ? 0.85 : 1.6) * k, s.Z + (n * 0.28 - c * 0.2) * k, Lv.lantern ? 0.5 : 0.85]); } continue; }
      P3.body(idx++, s.X, Y, s.Z, s.yaw + (dk > 0 && (st === 'walk' || st === 'carryWalk') ? Anim.weave(s.t, v.id, dk) : 0), s.pose, Lv, P3.highlight === v.id ? '#ffd76a' : null);
      if (v.task && v.task.id && s.sp < 0.25) keepChest(s, Y, Lv.s); // (where their chest is, for the other's hands in an act of two)
      if (v.emo && v.emo.k && emoN < emoPool.length) { const tx = emoMap(v.emo.k); if (tx) { const sp = emoPool[emoN++]; if (sp.material.map !== tx) { sp.material.map = tx; sp.material.needsUpdate = true; } sp.position.set(s.X, Y + 2.2 * Lv.s + Math.sin(s.t * 3) * 0.03, s.Z); sp.scale.set(0.42, 0.45, 1); sp.visible = true; } }
    }
    for (const id of vis.keys()) if (!seen.has(id) && !(av && id === av.id)) vis.delete(id);
    for (let k = emoN; k < emoPool.length; k++) emoPool[k].visible = false; P3.emos = emoN;
    // the dead of the world where they fell — until they are buried, burnt or only bones (the carnage keeps them)
    const Cg = G.Carnage && G.Carnage.view ? G.Carnage.view() : null; P3.dead = 0;
    if (Cg) for (const c of Cg.corpses) {
      if (idx >= MAX) break; if (av && av.id === c.vid) continue; // (the body falling is drawn by its own pose, not twice: D-334)
      const fell = fallen.get(c.vid); // (and the body's corpse lies as its fall ended: the view's memory of it — dragged off, where it is held)
      if (fell && (c.x !== fell.cx || c.y !== fell.cy)) { fell.ox *= 0.9; fell.oz *= 0.9; }
      const X = c.x * TL + (fell ? fell.ox : 0), Z = c.y * TL + (fell ? fell.oz : 0); if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > R2) continue;
      const stg = G.Carnage.stage(c); if (stg === 'bones') continue;
      P3.dead++; const Y = W.groundH(c.x, c.y) * HM; if (!inField(X, Y, Z, 1)) { culled++; continue; } // (in reach: counted, drawn where seen)
      const L = P3.look(c.look); if (stg !== 'fresh') L.skin = stg === 'rot' ? '#8a8a6a' : '#7a6a5a'; L.lod = lodAt(cLod.get(c.id) || 0, (X - seenAt[0]) ** 2 + (Z - seenAt[1]) ** 2); cLod.set(c.id, L.lod);
      P3.body(idx++, X, Y, Z, fell ? fell.yaw : G.hash(c.id) * TAU, fell ? fell.pose : DEAD[c.id % DEAD.length], L, null);
    }
    if (cLod.size > 400) cLod.clear();
    // the crowd: everyone else in reach, simply (where the world has them; no animation of their own but a step's bob)
    mats(); let c = 0, ca = 0; const tnow = performance.now() / 1000;
    for (let k = n; k < near.length && c < MAXC; k++) {
      // (the ground under one of the crowd asked only of those in the eye's field: the field judged first by their last height — a
      // frame old, a ball a little wider —, D-611)
      const v = near[k][1]; if (v.inside) continue; const X = v.x * TL, Z = v.y * TL; const e0 = CROWD.get(v.id);
      if (e0 && e0.Y !== undefined && !inField(X, e0.Y, Z, 1.6)) continue;
      const Y0 = W.groundH(v.x, v.y) * HM; if (!inField(X, Y0, Z, 1)) continue;
      const e = crowdLook(v), L = e.L; e.Y = Y0; const s = L.s; const st = Math.sin(tnow * 7 + v.id) * (v.moving ? 1 : 0); const pz = e.p | 0; const Y = Y0 + Math.abs(st) * 0.04 + CROWD_DY[pz] * s;
      const pp = v.path && v.pi < v.path.length ? v.path[v.pi] : null; const yaw = pp ? Math.atan2(pp[1] - v.y, pp[0] - v.x) : (v.face > 0 ? 0 : Math.PI);
      M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-yaw + Math.PI / 2); M.root.multiply(M.b); M.b.makeScale(s, s, s); M.root.multiply(M.b);
      if (pz === 5) { M.b.makeRotationX(-Math.PI / 2); M.root.multiply(M.b); } // (lying on the ground: the whole body laid down)
      // (from afar, the colour of what they wear over all: the mantle of their standing, the apron-dress, the undyed fleece —
      // the same clothes the fine body has, so a street of nobles and a street of the plain people read apart from far off)
      // (the colours kept with the portrait: crowdLook)
      M.a.copy(M.root); M.b.makeTranslation(0, 0.72, 0); M.a.multiply(M.b); M.c.makeScale(1, 0.92, 0.72); M.a.multiply(M.c); crowd.setMatrixAt(c, M.a); crowd.setColorAt(c, e.cF);
      M.a.copy(M.root); M.b.makeTranslation(0, 1.62, 0.01); M.a.multiply(M.b); crowdHead.setMatrixAt(c, M.a); crowdHead.setColorAt(c, e.cS);
      M.a.copy(M.root); M.b.makeTranslation(0, 1.64, -0.01); M.a.multiply(M.b); M.c.makeRotationX(-0.6); M.a.multiply(M.c); crowdHair.setMatrixAt(c, M.a); crowdHair.setColorAt(c, e.cH);
      // (the legs by the posture: stepping; straight out before the seated; folded back under the kneeling)
      const lx = pz === 1 ? -1.5 : pz === 2 ? 1.45 : 0;
      for (let sd = 0; sd < 2; sd++) { M.a.copy(M.root); M.b.makeTranslation(sd ? -0.09 : 0.09, 0.86, 0); M.a.multiply(M.b); M.c.makeRotationX(lx + (sd ? -st : st) * 0.45); M.a.multiply(M.c); crowdLegs[sd].setMatrixAt(c, M.a); crowdLegs[sd].setColorAt(c, e.cL); }
      // (the arms: raised, or bent up to the face)
      if (pz === 3 || pz === 4) for (let sd = 0; sd < 2; sd++) { M.a.copy(M.root); M.b.makeTranslation(sd ? -0.22 : 0.22, 1.42, 0.02); M.a.multiply(M.b);
        if (pz === 3) M.c.makeRotationZ((sd ? -1 : 1) * (Math.PI - 0.3 - 0.12 * Math.sin(tnow * 3 + v.id + sd))); else { M.c.makeRotationX(-2.55); M.b.makeRotationZ((sd ? 1 : -1) * 0.45); M.c.premultiply(M.b); }
        M.a.multiply(M.c); crowdArms[sd].setMatrixAt(ca, M.a); crowdArms[sd].setColorAt(ca, e.cF); if (sd) ca++; }
      c++;
    }
    crowd.count = crowdHead.count = crowdHair.count = crowdLegs[0].count = crowdLegs[1].count = c; crowdArms[0].count = crowdArms[1].count = ca; for (const m of [crowd, crowdHead, crowdHair, ...crowdLegs, ...crowdArms]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.crowd = c; if (CROWD.size > 4 * MAXC) for (const [id, e] of CROWD) if (vt - e.t > 6) CROWD.delete(id); // (the portraits of those gone from the crowd: let go)
    for (const m of mesh) { m.count = idx; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.count = idx; P3.culled = culled;
    lyingDraw(focus, RC2);
    if (skin) G.Body3D.end(); toolsEnd(); heldEnd();
    beasts(focus, R2, dt);
  };
  // (the cloth's swing: a cape and a skirt lag behind the body — lifted back by the speed, flung by a start or a stop,
  // swung out in a turn — a spring, only seen)
  function cloth(s, X, Z, yaw, dt, pose) {
    if (!(dt > 0)) return; if (s.cx === undefined) { s.cx = X; s.cz = Z; s.cv = 0; s.ca = 0; s.cw = 0; s.cs = 0; s.cy = yaw; }
    const vx = (X - s.cx) / dt, vz = (Z - s.cz) / dt; s.cx = X; s.cz = Z; if (Math.hypot(vx, vz) > 20) return;
    const fw = vx * Math.cos(yaw) + vz * Math.sin(yaw); const acc = (fw - (s.cv || 0)) / dt; s.cv = fw;
    let dy = yaw - s.cy; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; s.cy = yaw;
    const want = G.clamp(Math.max(0, fw) * 0.1 + G.clamp(acc * 0.025, -0.25, 0.25), -0.2, 0.75), side = G.clamp(-dy / dt * Math.max(0.3, fw) * 0.06, -0.35, 0.35);
    const k = 40, c = 7; s.cw += ((want - s.ca) * k - s.cw * c) * dt; s.ca += s.cw * dt; s.cs += (side - s.cs) * (1 - Math.exp(-5 * dt));
    pose.cloth = G.clamp(s.ca, -0.3, 0.9); pose.clothS = s.cs;
    // (the rise and fall of the steps: the cloth's free part lags the hips — a spring of its own; and how fast it goes)
    const hy = (pose.bob || 0) + (pose.pelY || 0) - (pose.crouch || 0) * 0.92;
    if (s.cb === undefined || Math.abs(hy - s.cb) > 0.3) { s.cb = hy; s.cbv = 0; }
    s.cbv += ((hy - s.cb) * 90 - s.cbv * 9) * dt; s.cb += s.cbv * dt;
    pose.clothB = G.clamp(s.cb - hy, -0.06, 0.06); pose.clothV = Math.max(0, fw);
  }
  P3.visOf = id => vis.get(id);
  // (how the body the god lived lay when its fall ended — the pose, the way it lay, how far from where the world has its corpse:
  // the corpse is drawn so from then on, where the world moves it too; only the view's memory, D-334)
  const fallen = new Map(); G.worldHooks.push(() => fallen.clear());
  P3.fell = function (vid, X, Z, yaw, pose) { const c = G.Carnage && G.Carnage.byVid ? G.Carnage.byVid(vid) : null; if (!c) return false; const TL = G.Space.TILE; fallen.set(vid, { ox: X - c.x * TL, oz: Z - c.y * TL, cx: c.x, cy: c.y, yaw, pose: Object.assign({}, pose) }); if (fallen.size > 40) fallen.delete(fallen.keys().next().value); return true; };
  P3.fallenOf = vid => fallen.get(vid) || null; // (for the proofs)
  // where a beast's gesture at a person goes (D-332): the point of them its kind goes for — the throat and the shoulder for the
  // cats and the bears, the waist for a hippo, the thigh for the wolves and the crocodile, the ankle for the viper; a head-high
  // threat at the head —, on the side of them it comes from, as they are drawn this frame (the body, where its controller has it;
  // anyone else, where the view has them); down on the ground, the body lying there. False: nobody to aim at
  const MANH = { lion: 1.3, tiger: 1.25, jaguar: 1.15, leopard: 1.15, snowleopard: 1.1, bear: 1.25, polarbear: 1.3, wolf: 0.8, hyena: 0.85, cao: 0.65, fox: 0.4,
    croc: 0.5, viper: 0.12, python: 0.5, anaconda: 0.6, hippo: 0.95, elephant: 1.15, rhino: 0.95, buffalo: 1, bison: 1, boar: 0.6, monkey: 1.1 };
  const MANUP = { threat: 1.55, display: 1.55, stare: 1.6, alert: 1.6, curious: 1.6, roar: 1.6 };
  P3.manAim = function (n, a, id, X, Z, out) {
    const S = G.S; const v = S.villagers.get(id); if (!v) return false; const av = P3.avatar;
    let pX, pY, pZ, down = false;
    if (av && av.id === id) { pX = av.X; pY = av.Y; pZ = av.Z; down = !!(av.pose && av.pose.lie > 0.5); }
    else { const s = vis.get(id); if (s) { pX = s.X; pY = s.Y; pZ = s.Z; down = s.st === 'sleep'; } else { const TL = G.Space.TILE; pX = v.x * TL; pZ = v.y * TL; pY = groundY(v.x, v.y); down = !!v.sleeping; } }
    const k = P3.look(v).s; const h = down ? 0.25 : (MANUP[n] || MANH[a.kind] || 0.9) * k;
    const dx = X - pX, dz = Z - pZ, l = Math.hypot(dx, dz) || 1; const r = down ? 0.3 : 0.17 * k;
    out[0] = pX + dx / l * r; out[1] = pY + h; out[2] = pZ + dz / l * r; return true;
  };
  P3.skin = () => skin; // (the bodies drawn as one skin — Body3D — or as the pieces of old)
  P3.greet = function (X, Z) { let n = 0; for (const [id, s] of vis) if ((s.X - X) ** 2 + (s.Z - Z) ** 2 < 81) { s.greetT = 1.3 + (id % 5) * 0.15; s.greetD = 0.25 + (id % 7) * 0.08; n++; } return n; };
  // the turn of the head someone wants toward the body (the reader's: js/vida3d.js)
  P3.lookFor = (yaw, X, Z, av, st) => G.Vida3D.lookFor(yaw, X, Z, av, st);
  // (for the verifier: every matrix of a body or a beast drawn this frame is made of numbers)
  P3.check = function () {
    const out = []; const scan = (list, n, what) => { for (const m of list || []) { const a = m.instanceMatrix.array; for (let k = 0; k < Math.min(n, m.count) * 16; k++) if (!Number.isFinite(a[k])) { out.push(`${what}: matriz inválida no desenho`); return; } } };
    scan(mesh, P3.count, 'pessoas'); scan(beastMesh, P3.beasts, 'bichos');
    if (fauna) for (const e of G.Fauna3D.check()) out.push(e);
    // (each beast drawn as a skin at the level its distance from the eye and its size give it — D-322: none of the near level far
    // off, none of the far level close by; a metre of margin each side, as the edges have)
    if (fauna) for (const id of P3.bdrawn) { const s = bvis.get(id), a = G.S.animals.get(id); if (!s || !a || s.fl === undefined || s.f !== bframe || !G.Fauna3D.has(a.kind)) continue;
      const F3 = G.Fauna3D, size = F3.sizeOf(a.kind) * (a.big || 1) * (a.age !== undefined && a.age < 1 ? 0.55 + 0.45 * Math.max(0, a.age) : 1); const d2 = (s.X - seenAt[0]) ** 2 + (s.Z - seenAt[1]) ** 2;
      if (s.fl !== beastLod(0, d2, size) && s.fl !== beastLod(1, d2, size) && s.fl !== beastLod(2, d2, size)) { out.push(`bicho ${id}: desenhado no nível ${s.fl} a ${Math.sqrt(d2).toFixed(1)} m do olho (D-322)`); break; } }
    if (skin) {
      for (const e of G.Body3D.check()) out.push(e);
      // (the lighter bodies only far from the eye: nobody inside a level's edge, less its margin, drawn lighter)
      for (let r = 0; r < G.Body3D.rows; r++) { const a = G.Body3D.at(r); if (!a || !a[7]) continue; const d = Math.hypot(a[0] - seenAt[0], a[2] - seenAt[1]); if (d < LODD[a[7] - 1] - 1.5) { out.push(`corpo ${r}: o corpo de nível ${a[7]} a ${d.toFixed(1)} m do olho`); break; } }
    }
    // (who was left undrawn this frame was outside the eye's field: nobody standing in it)
    if (FR.on) for (const [id, s] of vis) if (s.cull) { FR.s.center.set(s.X, s.Y + 0.9, s.Z); FR.s.radius = 0.3; if (FR.f.intersectsSphere(FR.s)) { out.push(`pessoa ${id}: fora do desenho, mas à vista`); break; } }
    return out;
  };
  const seenAt = [0, 0]; // (where the eye was when the people were last drawn: what picks the lighter bodies, and the verifier's)
  // the levels of detail by the distance from the eye: the fine body near, a lighter one from LODD[0] metres, the lightest
  // (a few hundred triangles) from LODD[1] — a metre either side of each edge, so nobody standing on it flickers between two
  const LODD = [12, 26];
  function lodAt(prev, d2) { let l = 0; for (let k = 0; k < LODD.length; k++) { const e = LODD[k] + (prev > k ? -1 : 1); if (d2 > e * e) l = k + 1; } return l; }
  const cLod = new Map(); // (the corpses' levels: id → level)
  P3.LODD = LODD; P3.cull = true; P3.culled = 0; // (cull: off only to measure what it saves)
  // the eye's field this frame: who is outside it — and whose shadow is too — is not drawn (only seen: the world is the same)
  const FR = { on: false };
  function field(cam, q) {
    FR.on = !!cam && !!THREE && P3.cull; if (!FR.on) return;
    if (!FR.f) { FR.f = new THREE.Frustum(); FR.m = new THREE.Matrix4(); FR.s = new THREE.Sphere(); }
    cam.updateMatrixWorld(); FR.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); FR.f.setFromProjectionMatrix(FR.m);
    FR.cx = cam.position.x; FR.cz = cam.position.z;
    // (the shadows, where there are: how long a body's falls on the ground — up to 12 m when the light is low — and which way)
    const sd = q.shadows > 0 && R3.GX && R3.GX.gxSunW ? R3.GX.gxSunW.value : null; const hz = sd ? Math.hypot(sd.x, sd.z) : 0;
    FR.sh = sd && sd.y > 0.02 && hz > 1e-4 ? Math.min(12, 1.9 * hz / sd.y) : 0; FR.ux = FR.sh ? sd.x / hz : 0; FR.uz = FR.sh ? sd.z / hz : 0;
  }
  // (someone r metres tall standing at X, Y, Z: in the eye's field, or right by the eye, or their shadow in the field)
  function inField(X, Y, Z, r) { // (not 'seen': P3.update has a set of that name)
    if (!FR.on || (X - FR.cx) ** 2 + (Z - FR.cz) ** 2 < 36) return true;
    FR.s.center.set(X, Y + r * 0.8, Z); FR.s.radius = r + 0.5; if (FR.f.intersectsSphere(FR.s)) return true;
    if (!FR.sh) return false;
    FR.s.center.set(X - FR.ux * FR.sh * 0.5, Y, Z - FR.uz * FR.sh * 0.5); FR.s.radius = FR.sh * 0.5 + r * 0.5; return FR.f.intersectsSphere(FR.s);
  }
  const RIM = (G.Body3D && G.Body3D.rim) || { value: 0.2 }; // (the edge light, shared by the skin and the pieces)

  // ------------------------------ the beasts ------------------------------
  // (each kind's build, in the god's units — the same numbers its picture is drawn with (Animals.DEF[kind].q) where it
  // has them; the others here: length, height, legs, neck, colours, ears, tail, snout, horns; biped for the birds afoot)
  const ART3 = {
    quad: { len: 4, h: 4, leg: 3, neck: 1.5, col: '#8a7a5a', ear: 0.8, tail: 'thin' },
    wolf: { len: 4.2, h: 3.8, leg: 3, neck: 1.4, col: '#7e7a72', belly: '#b8b2a6', ear: 1.1, tail: 'bushy' },
    dog: { len: 3.4, h: 3.2, leg: 2.6, neck: 1.4, col: '#a87a4a', belly: '#d8c0a0', ear: 0.9, tail: 'wag' },
    cat: { len: 2.6, h: 2.4, leg: 1.9, neck: 0.9, col: '#c88a4a', belly: '#e8d0b0', ear: 1.1, tail: 'long' },
    boar: { len: 3.8, h: 3.2, leg: 1.8, neck: 0.5, col: '#5a4636', ear: 0.8, tail: 'thin', stout: 1, snout: 1.4, tusk: 1 },
    rabbit: { len: 1.6, h: 2, leg: 1, neck: 0.3, col: '#b89a7a', ear: 2.6, tail: 'puff', hop: 1 },
    monkey: { len: 2.2, h: 2.6, leg: 2.6, neck: 0.6, col: '#7a5230', belly: '#e8c8a0', ear: 0.7, tail: 'long' },
    giraffe: { len: 4.2, h: 6, leg: 6, neck: 9, col: '#d8a85a', belly: '#f0dcae', ear: 0.8, tail: 'tuft', horn: 'ossicone' },
    elephant: { len: 5, h: 5, leg: 3.8, neck: 0.4, col: '#8a8884', ear: 3.2, tail: 'thin', stout: 1.4, trunk: 1, tusk: 1 },
    rhino: { len: 5, h: 4, leg: 2.4, neck: 0.5, col: '#8a8680', ear: 0.7, tail: 'thin', stout: 1.5, snout: 0.8, horn: 'nose' },
    croc: { len: 5, h: 1.2, leg: 0.9, neck: 0.2, col: '#4a5a2a', belly: '#8a8a5a', ear: 0, tail: 'croc', snout: 3, low: 1 },
    lizard: { len: 2, h: 0.8, leg: 0.5, neck: 0.2, col: '#9a8a4a', ear: 0, tail: 'croc', snout: 1, low: 1 },
    snake: { len: 4, h: 0.5, leg: 0, neck: 0.1, col: '#4a6a2a', ear: 0, tail: 'croc', snout: 0.6, low: 1 },
    frog: { len: 1.4, h: 1, leg: 0.8, neck: 0, col: '#4a8a3a', ear: 0, tail: null, hop: 1 },
    beaver: { len: 2.6, h: 1.8, leg: 0.8, neck: 0.3, col: '#6a4a30', ear: 0.4, tail: 'flat', stout: 1 },
    otter: { len: 2.8, h: 1.4, leg: 0.7, neck: 0.6, col: '#5a4030', belly: '#a08a6a', ear: 0.3, tail: 'long' },
    sloth: { len: 2.2, h: 2, leg: 1.4, neck: 0.6, col: '#8a7a5a', ear: 0.2, tail: null },
    seal: { len: 3.6, h: 1.6, leg: 0, neck: 0.8, col: '#7a7a78', ear: 0, tail: 'flipper' },
    walrus: { len: 4.6, h: 2.4, leg: 0, neck: 0.4, col: '#8a6a58', ear: 0, tail: 'flipper', stout: 1.5, tusk: 1 },
    hen: { biped: 1, len: 1.6, h: 1.8, leg: 1, neck: 0.8, col: '#e8dcc8', beak: '#e8b83a', legc: '#e8b83a', comb: '#d23a2a', tail: 'fan' },
    pigeon: { biped: 1, len: 1.4, h: 1.4, leg: 0.6, neck: 0.6, col: '#8a8c98', beak: '#3a3a3a', legc: '#c86a6a', tail: 'fan', nod: 1 },
    turkey: { biped: 1, len: 2.2, h: 2.4, leg: 1.4, neck: 1.2, col: '#4a3a2e', beak: '#c8b08a', legc: '#c8a08a', comb: '#c8303a', tail: 'fan' },
    ostrich: { biped: 1, len: 2.6, h: 4, leg: 4.4, neck: 4.4, col: '#2a2622', beak: '#d8b88a', legc: '#d8b0a0', tail: 'fan' },
    penguin: { biped: 1, upright: 1, len: 1.4, h: 2.4, leg: 0.4, neck: 0.3, col: '#1c1c22', belly: '#f2f2ee', beak: '#e8a83a', legc: '#e8a83a', tail: null },
    wader: { biped: 1, len: 1.8, h: 2, leg: 3.4, neck: 2.6, col: '#f6f6f2', beak: '#e8c83a', legc: '#3a3a3a', tail: 'fan' },
    turtle: { len: 2.4, h: 1, leg: 0.4, neck: 0.4, col: '#5a6a3a', ear: 0, tail: null, shell: '#6a5a3a', low: 1 },
  };
  const BP = [['body', 'ball'], ['neck', 'limb'], ['head', 'ball'], ['snout', 'limb'], ['ear0', 'cone'], ['ear1', 'cone'], ['leg0', 'limb'], ['leg1', 'limb'], ['leg2', 'limb'], ['leg3', 'limb'], ['tail', 'limb'], ['wing0', 'box'], ['wing1', 'box'], ['horn0', 'cone'], ['horn1', 'cone'], ['mane', 'ball'], ['eye0', 'sph'], ['eye1', 'sph'], ['shin0', 'limb'], ['shin1', 'limb'], ['shin2', 'limb'], ['shin3', 'limb'], ['hoof0', 'ball'], ['hoof1', 'ball'], ['hoof2', 'ball'], ['hoof3', 'ball']];
  const BI = {}; BP.forEach((p, k) => { BI[p[0]] = k; });
  const formCache = new Map(); G.worldHooks.push(() => formCache.clear());
  function formOf(sp, kind) {
    let F = formCache.get(kind); if (F) return F;
    const q = sp.q; const art = sp.art === 'bird' || sp.cls === 'air' ? 'bird' : sp.art;
    if (q) F = { len: q.len, h: q.h, leg: q.leg, neck: q.neck, col: q.col, belly: q.belly, ear: q.ear === undefined ? 0.8 : q.ear, tail: q.noTail ? null : q.tail || 'thin', stout: q.stout || 0, snout: q.snout || 0, horn: q.antler ? 'antler' : q.horn || null, mane: q.mane || null, hump: q.hump || 0 };
    else if (art === 'bird') { const b = sp.b || {}; F = { bird: 1, len: 1.6, h: 1.4, leg: 0.6, neck: 0.4, col: b.col || '#6a6a6a', wingc: b.wing || b.col || '#5a5a5a', head: b.head, beak: b.beak || '#e8b83a', span: (b.span || 8) / 8, tail: 'fan', biped: 1 }; }
    else F = Object.assign({}, ART3[art] || ART3.quad, sp.col ? { col: sp.col[0], belly: sp.col[1] } : {});
    formCache.set(kind, F); return F;
  }
  const bvis = new Map(); G.worldHooks.push(() => bvis.clear());
  let bframe = 0; P3.bdrawn = []; // (the frames of the beasts' drawing, and the ids drawn in the last one — for the proofs)
  P3.memSize = () => bvis.size; // (how many beasts the view remembers — for the proofs)
  // (a part of a beast: in the frame m, at (x, y, z), turned by (rx, ry, rz) about its own base, sized (sx, sy, sz))
  function bput(name, idx, m, x, y, z, sx, sy, sz, col, rx, ry, rz) {
    M.a.copy(m); M.b.makeTranslation(x, y, z); M.a.multiply(M.b);
    if (rx || ry || rz) { M.eu.set(rx || 0, ry || 0, rz || 0, 'YXZ'); M.c.makeRotationFromEuler(M.eu); M.a.multiply(M.c); }
    M.c.makeScale(sx, sy, sz); M.a.multiply(M.c); const im = beastMesh[BI[name]]; im.setMatrixAt(idx, M.a); im.setColorAt(idx, color(col));
  }
  const bhide = (name, idx) => beastMesh[BI[name]].setMatrixAt(idx, M.z);
  // (a limb hanging from a joint: its base at the joint, swung by `a` about Z — forward and back — of length len)
  function limb(name, idx, m, x, y, z, len, r, a, col, rx) { M.a.copy(m); M.b.makeTranslation(x, y, z); M.a.multiply(M.b); M.eu.set(rx || 0, 0, a, 'XYZ'); M.c.makeRotationFromEuler(M.eu); M.a.multiply(M.c); M.b.makeTranslation(0, -len / 2, 0); M.a.multiply(M.b); M.c.makeScale(r, len, r); M.a.multiply(M.c); const im = beastMesh[BI[name]]; im.setMatrixAt(idx, M.a); im.setColorAt(idx, color(col)); }
  // (a leg of two bones: the upper from the shoulder or the hip, swung by a1; the lower from the knee or the hock, bent by
  // a2 back from it; a hoof or a paw at its end)
  function limb2(k, idx, m, x, y, z, l1, l2, r, a1, a2, col, foot) {
    M.a.copy(m); M.b.makeTranslation(x, y, z); M.a.multiply(M.b); M.eu.set(0, 0, a1, 'XYZ'); M.c.makeRotationFromEuler(M.eu); M.a.multiply(M.c);
    M.v.set(0, 0, 0); const j = M.k || (M.k = new THREE.Matrix4()); j.copy(M.a); M.b.makeTranslation(0, -l1, 0); j.multiply(M.b); M.eu.set(0, 0, a2, 'XYZ'); M.c.makeRotationFromEuler(M.eu); j.multiply(M.c);
    M.b.makeTranslation(0, -l1 / 2, 0); M.a.multiply(M.b); M.c.makeScale(r * 1.35, l1 * 1.12, r * 1.25); M.a.multiply(M.c); let im = beastMesh[BI['leg' + k]]; im.setMatrixAt(idx, M.a); im.setColorAt(idx, color(col));
    M.a.copy(j); M.b.makeTranslation(0, -l2 / 2, 0); M.a.multiply(M.b); M.c.makeScale(r * 0.72, l2 * 1.06, r * 0.72); M.a.multiply(M.c); im = beastMesh[BI['shin' + k]]; im.setMatrixAt(idx, M.a); im.setColorAt(idx, color(col));
    M.a.copy(j); M.b.makeTranslation(0.012, -l2, 0); M.a.multiply(M.b); M.c.makeScale(r * 1.1, r * 0.7, r * 1.0); M.a.multiply(M.c); im = beastMesh[BI['hoof' + k]]; im.setMatrixAt(idx, M.a); im.setColorAt(idx, color(foot));
  }
  // the gaits of a beast on four legs, by its speed: a walk of four beats (each foot alone: hind, fore, other hind, other
  // fore), a trot in diagonal pairs, a gallop (the hind feet together, the fore feet together, a beat apart). Each leg's
  // offset in the stride, and how far it swings
  const GAIT = { walk: [0, 0.5, 0.75, 0.25], trot: [0, 0.5, 0.5, 0], gallop: [0, 0.08, 0.55, 0.62] };
  const BFAR = new Set(['eye0', 'eye1', 'hoof0', 'hoof1', 'hoof2', 'hoof3']); // (the parts a far beast goes without)
  // a beast as one skin: its frame (its +Z forward, its size), its pose from how fast it goes and what it does, its coat
  const FMR = { m: null, r: null };
  const SITTERS = { cao: 1, gato: 1, wolf: 0.4, fox: 0.5, arcticfox: 0.5, fennec: 0.5, lion: 0.5, hyena: 0.3, tiger: 0.4, jaguar: 0.4, leopard: 0.45, snowleopard: 0.45 };
  P3.beastVis = id => bvis.get(id); P3.SITTERS = SITTERS; // (for the studio: the view's memory of a beast, read — and who sits)
  const OPENJAW = { chase: 0.5, lunge: 1, strike: 1, pounce: 1, stalk: 0.15 };
  let FEET = null; // (the feet's bones: left fore, right fore, left hind, right hind)
  // ------------------------------ the gesture on the body (D-280) ------------------------------
  // the gesture the old states mean when the world gives none (the kill eaten, the death roll, the coils, the held one)
  function impliedGest(a) {
    const Ge = G.Gestos; if (!Ge || a.dead) return null; const k = a.kind; const can = n => (Ge.can(k, n) ? n : null);
    if (a.down > 0 || a.caught) return can('struggle');
    switch (a.state) {
      case 'roll': return can('deathroll');
      case 'drown': return can('drag');
      case 'eat': case 'feedman': return can('tear') || can('chew');
      case 'cache': return can('carry') || can('drag');
      case 'mourn': return can('mourn');
      case 'lunge': return can('bite') || can('strike');
      case 'strike': return can('strike') || can('bite');
      case 'fish': return can('fish');
      case 'lurk': return can('hide');
    }
    if (a.grip > 0) return can('coil') || can('grip');
    if (a.bite > 0) return can('bite');
    if (a.swim) return can('swim');
    return null;
  }
  // (the other of a gesture: the world's a.gestO, or the one the old states point at)
  const otherOf = (a, n) => (a.gest ? a.gestO : n === 'struggle' ? a.caught : a.target) || 0;
  // which point of the other a gesture goes for ('auto': the throat from in front, the flank from the side, the rump from behind)
  const AIMAT = { throat: 'throat', nape: 'nape', grip: 'auto', bite: 'auto', tear: 'flank', nuzzle: 'head', allogroom: 'back', suckle: 'udder', clash: 'brow', spar: 'throat', gore: 'flank', toss: 'flank',
    pin: 'nape', maul: 'back', talons: 'back', mantle: 'back', coil: 'throat', deathroll: 'throat', drag: 'throat', carry: 'back', carryyoung: 'nape', shakekill: 'back', swallow: 'head', mourn: 'body',
    dominate: 'back', alert: 'head', stare: 'head', curious: 'head', threat: 'head', display: 'head', mate: 'nape', strike: 'throat', swipe: 'flank', stomp: 'back', court: 'rump', kick: 'body', buck: 'body' };
  // the holds that place the holder's body (its facing, how near it stands): the mouth at the point, the feet on the back, the coils round the body
  const HOLDGEO = { throat: 1, nape: 1, grip: 1, pin: 1, maul: 0.8, tear: 0.7, talons: 1, mantle: 0.8, coil: 1, deathroll: 1, suckle: 1, allogroom: 0.6, nuzzle: 0.6, mate: 1, clash: 1, spar: 0.7, mourn: 0.5, drag: 0.8, shakekill: 0.6, bite: 0.5 };
  // the small held one carried in the jaws (or under the feet in the air): drawn where the holder holds it
  const SNAP = { carry: 1, carryyoung: 1, shakekill: 1, swallow: 1, drag: 1, talons: 0.8 };
  // (small enough to be carried: to the jaws a part of the holder's size; to an eagle's talons more — its size is the bird standing,
  // not its wings)
  const snaps = (a, h, gn) => !!SNAP[gn] && G.Fauna3D.sizeOf(a.kind) < G.Fauna3D.sizeOf(h.kind) * (SNAP[gn] < 1 ? SNAP[gn] : 0.7);
  // (the bones whose frames a beast leaves in the view's memory, for the others to reach: the throat, the nape, the head, the
  // rump, the back, the withers, the hock)
  const KB = ['neck1', 'neck2', 'head', 'root', 'spine', 'chest', 'hlL2'];
  const KPB = { throat: 1, nape: 0, head: 2, brow: 2, rump: 3, haunch: 3, udder: 3, body: 4, flank: 4, back: 5, hock: 6 };
  const KPD = { throat: 3, nape: 2, brow: 2, rump: 2, udder: 3, back: 2, flank: 0, haunch: 9 }; // (the support direction of the skin there: −y, +y, +x; the haunch the low back corner of the rump, on the side of the one at it)
  const KQ = { m: null, v: null, w: null, inv: null };
  // a point of a beast as modelled (its form's joints and skin) — which: one of KPB; side: the flank's side (+ its left)
  function kpBind(form, which, side, out) {
    const B = G.FaunaAnim.B, J = form.J, b = B[KB[KPB[which]]]; const h = form.hull, dir = KPD[which];
    out[0] = J[b * 3]; out[1] = J[b * 3 + 1]; out[2] = J[b * 3 + 2];
    if (h && dir !== undefined && h.has[b]) { const o = (b * h.nd + (which === 'flank' && side < 0 ? 1 : which === 'haunch' && side < 0 ? 13 : dir)) * 3; out[0] = h.p[o]; out[1] = h.p[o + 1]; out[2] = which === 'flank' ? J[b * 3 + 2] : h.p[o + 2]; }
    if (which === 'udder') out[2] = J[b * 3 + 2] + Math.abs(J[B.spine * 3 + 2] - J[b * 3 + 2]) * 0.35;
    if (which === 'brow') G.FaunaAnim.Gest.browOf(form, out); // (over the eyes — not the tips of the horns)
    return out;
  }
  // where a point of the other is in the world: by the frames its last pose left in the view's memory, or — not drawn yet — by
  // where the world has it and the way it faces
  const KP = new Float32Array(3), SIDES = [1, -1], ONE = [1];
  function keyPoint(o, s2, which, fromX, fromZ, out) {
    const F3 = G.Fauna3D; const form = s2 && s2.kf ? s2.kf : F3.form(o.kind); if (!form) return null;
    if (s2 && s2.kb) { // (by the frames the last pose left: of a flank or a haunch, the side nearer the one coming at it)
      const bi = KPB[which] * 16, e = s2.kb, J = form.J, b = G.FaunaAnim.B[KB[KPB[which]]]; let best = 1e9;
      for (const side of (which === 'flank' || which === 'haunch' ? SIDES : ONE)) { kpBind(form, which, side, KP); const x = KP[0] - J[b * 3], y = KP[1] - J[b * 3 + 1], z = KP[2] - J[b * 3 + 2];
        const X = e[bi] * x + e[bi + 4] * y + e[bi + 8] * z + e[bi + 12], Y = e[bi + 1] * x + e[bi + 5] * y + e[bi + 9] * z + e[bi + 13], Z = e[bi + 2] * x + e[bi + 6] * y + e[bi + 10] * z + e[bi + 14];
        const d = (X - fromX) * (X - fromX) + (Z - fromZ) * (Z - fromZ); if (d < best) { best = d; out[0] = X; out[1] = Y; out[2] = Z; } }
      return out; }
    kpBind(form, which, 1, KP);
    const TL = G.Space.TILE, yaw = s2 ? s2.yaw : 0, sc = s2 && s2.ksc ? s2.ksc : F3.scaleOf(o.kind); const c = Math.cos(yaw), n = Math.sin(yaw);
    // (the frame: +Z of the form along the facing; X the form's left)
    out[0] = o.x * TL + (KP[2] * c + KP[0] * n) * sc; out[2] = o.y * TL + (KP[2] * n - KP[0] * c) * sc; out[1] = (s2 && s2.Y !== null && s2.Y !== undefined ? s2.Y : 0) + KP[1] * sc;
    return out;
  }
  // (which point the gesture goes for: 'auto' by where the attacker stands — in front the throat, beside the flank, behind the rump; a
  // much bigger prey by the rump or the hock)
  function aimWhich(n, a, o, s2) {
    let w = AIMAT[n]; if (w !== 'auto') return w;
    const yaw = s2 ? s2.yaw : 0; const dx = a.x - o.x, dz = a.y - o.y; const f = (dx * Math.cos(yaw) + dz * Math.sin(yaw)) / (Math.hypot(dx, dz) || 1);
    const fo = G.Fauna3D.form(o.kind), fa = G.Fauna3D.form(a.kind); const big = !!(fo && fa && fo.meta.H > fa.meta.H * 1.5); // (much taller: a wolf at a moose)
    return f > 0.5 ? (big ? 'flank' : 'throat') : f < -0.4 ? (big ? 'haunch' : 'rump') : 'flank'; // (a wolf on a moose: hanging from the haunch)
  }
  // the marks of a beast's body on its coat — the blood on the muzzle, the wounds by zone, what is eaten of a carcass and its bones,
  // the eyes shut, the water, the mud and the dust on it (Fauna3D's texels after the coat, D-283)
  function marksOf(a, sp, s, eye) {
    const mk = s.mk || (s.mk = new Float32Array(16)); mk.fill(0);
    mk[0] = G.clamp(a.blood || 0, 0, 1);
    if (a.dead) { const meat = sp.meat || 1; const e = G.clamp(1 - (a.meat === undefined ? meat : a.meat) / meat, 0, 1); mk[1] = Math.max(e, a.gore > 0 ? 0.15 : 0); mk[2] = a.meat !== undefined && a.meat <= 0 ? 1 : 0; }
    // (the eyes: shut asleep, dull dead — and a blink now and then, by the beast's own beat)
    const bl = Math.sin(s.t * 0.9 + a.id * 1.7) > 0.985 ? 1 : 0; mk[3] = a.dead ? 2 : Math.max(eye, bl);
    const w = a.wnd; if (w && w.z) for (let k = 0; k < 6; k++) mk[4 + k] = G.clamp(w.z[k] || 0, 0, 1);
    const me = a.meio; if (me) { mk[10] = G.clamp(me.wet || 0, 0, 1); mk[11] = G.clamp(me.mud || 0, 0, 1); mk[12] = G.clamp(me.dust || 0, 0, 1); mk[13] = G.clamp(me.cold || 0, 0, 1); }
    if (a.swim || a.sub > 0) mk[10] = Math.max(mk[10], 0.85);
    mk[14] = G.hash(a.id * 7919 + 11); // (its own: the pattern and the shade of this beast, not of its kind — D-324)
    return mk;
  }
  // the mind's numbers the body reads (a.mind of G.Mente; none yet: calm and fresh, the sex by the hash — the contract's rule)
  function moodOf(a, s) {
    const md = s.md || (s.md = new Float32Array(6)); const m = a.mind;
    if (m) { md[0] = m.f || 0; md[1] = m.g || 0; md[2] = m.en === undefined ? 1 : m.en; md[3] = m.st === undefined ? 1 : m.st; md[4] = m.sx === undefined ? (G.hash(a.id * 7 + 3) < 0.5 ? 0 : 1) : m.sx; md[5] = m.rk === undefined ? 0.5 : m.rk; }
    else { md[0] = 0; md[1] = 0; md[2] = 1; md[3] = 1; md[4] = G.hash(a.id * 7 + 3) < 0.5 ? 0 : 1; md[5] = 0.5; }
    if (a.angry > 0) md[1] = Math.max(md[1], 0.6);
    if (a.state === 'flee') md[0] = Math.max(md[0], 0.7);
    return md;
  }
  const BST = {}; // (the pose's input, one object for every beast: nothing made each frame)
  P3.keyPoint = (o, which, fromX, fromZ, out) => keyPoint(o, bvis.get(o.id), which, fromX, fromZ, out || new Float32Array(3)); P3.aimWhich = aimWhich; P3.AIMAT = AIMAT; // (for the tests: read only)
  const AIMV = new Float32Array(3), WP = new Float32Array(3);
  function beastSkin(a, sp, s, m, sc, d2, dt, row, X, Y, Z, air, ctx) {
    if (!FMR.m) { FMR.m = new THREE.Matrix4(); FMR.r = new THREE.Matrix4(); FMR.inv = new THREE.Matrix4(); FMR.v = new THREE.Vector3(); }
    const FA = G.FaunaAnim, fly = !!air; const form = fly ? G.Fauna3D.formFly(a.kind) : G.Fauna3D.form(a.kind); const J = form.J; const B = FA.B; const fam = form.meta.fam;
    if (!FEET) FEET = [B.flL3, B.flR3, B.hlL3, B.hlR3];
    const LL = (J[B.flL0 * 3 + 1] + J[B.hlL0 * 3 + 1]) * 0.5 * sc;
    // (the cycle: the phase goes as far as the body went, a stride's length a cycle — so a planted foot does not slide)
    let cyc;
    if (fam === 'quad') cyc = FA.strideOf(s.v < 0.04 ? 'walk' : FA.gaitOf(s.v, LL, form.meta.pillar, form.meta.hop), LL);
    else if (fam === 'bird') cyc = FA.birdStride(form) * sc;
    else if (fam === 'frog') cyc = form.meta.L * 2.2 * sc;
    else cyc = Math.max(0.1, form.meta.L * 0.5 * sc);
    s.fph = (s.fph === undefined ? (a.id % 7) / 7 : s.fph) + dt * s.v / cyc;
    const idle = s.v < 0.08;
    // (looking about while it stands; sitting down now and then, the dogs and the cats; the ears back and the tail up in flight)
    const lookT = idle ? Math.sin(s.t * 0.21 + a.id * 1.3) * 0.7 + Math.sin(s.t * 0.53 + a.id) * 0.25 : 0; s.look = (s.look || 0) + (lookT - (s.look || 0)) * (1 - Math.exp(-1.5 * dt));
    const busy = !!(s.gn && s.gk > 0.2) || a.dead; // (a gesture or death holds the body: no sitting about, no idle look)
    const sitW = SITTERS[a.kind] && idle && !s.graze && !busy && Math.sin(s.t * 0.045 + a.id * 2.3) > 1 - SITTERS[a.kind] * 0.9 ? 1 : 0; s.sit = (s.sit || 0) + (sitW - (s.sit || 0)) * (1 - Math.exp(-2.2 * dt));
    const flee = a.state === 'flee' || s.v > LL * 3.2; s.ears = (s.ears || 0) + ((flee ? 1 : 0) - (s.ears || 0)) * (1 - Math.exp(-4 * dt));
    // (the breath after a run: the exertion rises with the pace, falls slowly at rest — the flanks heave, the mouth opens)
    s.ex = G.clamp((s.ex || 0) + (s.v > LL * 2.4 ? dt * 0.12 : -dt * 0.04), 0, 1);
    // (in the air: the climb and the bank from how the bird moves; a big bird glides between its strokes)
    if (fly) { const dz = (a.z || 0) - (s.pz === undefined ? (a.z || 0) : s.pz); s.pz = a.z || 0; const pitch = G.clamp(dz / Math.max(dt, 1e-3) * 0.08, -0.5, 0.5); s.fp = (s.fp || 0) + (pitch - (s.fp || 0)) * (1 - Math.exp(-3 * dt));
      const dy = s.yaw - (s.py === undefined ? s.yaw : s.py); s.py = s.yaw; const bank = G.clamp(dy / Math.max(dt, 1e-3) * 0.25, -0.7, 0.7); s.fb = (s.fb || 0) + (bank - (s.fb || 0)) * (1 - Math.exp(-3 * dt)); }
    const glide = fly && form.meta.H > 0.6 && Math.sin(s.t * 0.4 + a.id) > -0.2 && (s.fp || 0) < 0.15;
    const st = BST; st.v = a.dead ? 0 : s.v / sc; st.ph = s.fph; st.t = s.t; st.graze = busy ? 0 : s.graze; st.look = busy ? 0 : s.look; st.id = a.id; st.ears = s.ears; st.tail = flee ? 0.6 : 0; st.jaw = OPENJAW[a.state] || 0;
    st.sit = s.sit; st.glide = glide; st.pitch = s.fp || 0; st.bank = s.fb || 0; st.young = a.age !== undefined && a.age < 1 ? G.clamp(1 - a.age, 0, 1) : 0; st.fy = null;
    // (the gesture: the view's clock of it, the mind, the breath, death, the one that holds it, the side it falls to; the reach)
    st.gx = s; st.kind = a.kind; st.mood = moodOf(a, s); st.exert = s.ex; st.dead = s.dk || 0; st.dt = dt; st.crouch = a.dead ? 0 : (a.crouch || (a.state === 'stalk' ? 1 : 0)); st.pounce = a.dead ? 0 : (a.pounce > 0 ? Math.min(1, a.pounce) : 0);
    const wd = a.wnd; st.limp = wd && wd.l > 0 ? Math.min(1, wd.l) : 0; st.limpLeg = wd && wd.z && (wd.z[2] || 0) > (wd.z[4] || 0) ? (a.id & 1) : 2 + (a.id & 1); // (lame: the leg of the worse quarters)
    st.held = ctx.held; st.side = ctx.side; st.down = a.down || 0; st.rollWith = ctx.rollWith || 0; st.tree = ctx.tree; st.ground = ctx.ground; st.hang = ctx.hang; st.coilR = ctx.coilR; st.coilY = ctx.coilY; st.rollA = undefined; st.aim = null;
    FMR.m.copy(m); FMR.r.makeRotationY(Math.PI / 2); FMR.m.multiply(FMR.r); FMR.r.makeScale(sc, sc, sc); FMR.m.multiply(FMR.r);
    if (ctx.aim) { FMR.inv.copy(FMR.m).invert(); FMR.v.set(ctx.aim[0], ctx.aim[1], ctx.aim[2]).applyMatrix4(FMR.inv); AIMV[0] = FMR.v.x; AIMV[1] = FMR.v.y; AIMV[2] = FMR.v.z; st.aim = AIMV; }
    if (s.gn === 'deathroll' && fam === 'sprawl') { s.rollA = (s.rollA || 0) + dt * Math.PI * 2 * 1.25 * (ctx.side || 1); st.rollA = s.rollA; } else s.rollA = 0; // (the turn of the death roll, in the view's memory: the held one rolls with it)
    // (each foot on the ground under it: the frame lies along the slope's plane; how far the real ground under each foot is from
    // that plane, in the beast's measure — the legs reach for it. Not for a beast in the water)
    if (fam === 'quad' && !air && !a.swim && Y > groundY(a.x, a.y) - 0.05) {
      const fy = FMR.fy || (FMR.fy = new Float32Array(4)), e = FMR.m.elements, TL = G.Space.TILE, lim = LL / sc * 0.3; st.fy = fy;
      for (let k = 0; k < 4; k++) { const b = FEET[k] * 3, x = J[b], z = J[b + 2]; const fX = e[0] * x + e[8] * z + e[12], fY = e[1] * x + e[9] * z + e[13], fZ = e[2] * x + e[10] * z + e[14];
        fy[k] = G.clamp((Math.max(groundY(fX / TL, fZ / TL), G.Space.stoneTop(fX, fZ)) - fY) / sc, -lim, lim); }
    }
    const spx = SPX; SPX.browse = sp.diet === 'browse'; SPX.swish = sp.diet === 'herb' || sp.diet === 'browse' ? 1 : 0.6;
    const R = (FA[fam] || FA.quad)(THREE, FMR.m, form, spx, st);
    // (what the others reach for: the frames of the throat, the nape, the head, the rump, the back — in the view's memory)
    const kb = s.kb || (s.kb = new Float32Array(KB.length * 16)); for (let k = 0; k < KB.length; k++) kb.set(R[B[KB[k]]].elements, k * 16);
    s.kf = form; s.ksc = sc; s.kfr = G.Fauna3D.frame;
    const GX = FA.Gest; const eye = GX ? GX.P[GX.I.EYE] : 0;
    s.fl = beastLod(s.fl || 0, (X - seenAt[0]) ** 2 + (Z - seenAt[1]) ** 2, G.Fauna3D.sizeOf(a.kind) * sc / G.Fauna3D.scaleOf(a.kind));
    G.Fauna3D.put(row, R, a.kind, FA.coat(THREE, a), s.fl, X, Y, Z, fly, marksOf(a, sp, s, G.clamp(eye, 0, 1)));
  }
  // (a beast's level of detail, D-322: the people's edges from the eye — LODD — as far again as the beast is bigger than a person, a
  // metre either side so nothing standing on an edge flickers; the small ones never fine past a few metres; the lightest preset sooner)
  function beastLod(prev, d2, size) {
    const k = Math.max(0.42, size / 1.75) * (G.Realm && G.Realm.Q && G.Realm.Q().lod < 0.7 ? 0.6 : 1); let l = 0;
    for (let i = 0; i < LODD.length; i++) { const e = LODD[i] * k + (prev > i ? -1 : 1); if (d2 > e * e) l = i + 1; }
    return l;
  }
  P3.beastLod = beastLod; // (for the tests)
  const SPX = { browse: false, swish: 1 };
  // the gesture of a beast before it is drawn (D-280): the view's clock of it (FaunaAnim.Gest.track — in the view's memory s, never
  // in the beast), death eased in from the last pose, the other it is made to and the point of it it goes for, the holder's body
  // placed (facing the point, near enough for the mouth — the coils round the body, the feet on the back), the small held one
  // drawn in the jaws; returns the context of the pose (ctx) and moves the frame (s.hx, s.hz, the yaw) by as much
  const CTX = { aim: null, held: null, side: 0, rollWith: 0, tree: false, ground: false, hang: false, coilR: undefined, coilY: undefined, snap: null };
  const AIMW = new Float32Array(3), SNP = new Float32Array(4);
  function gestureOf(a, sp, s, dt, X, Z, heldBy, air) {
    const ctx = CTX; ctx.aim = null; ctx.held = null; ctx.side = 0; ctx.rollWith = 0; ctx.tree = false; ctx.ground = false; ctx.hang = false; ctx.coilR = undefined; ctx.coilY = undefined; ctx.snap = null;
    const GX = G.FaunaAnim && G.FaunaAnim.Gest; if (!GX) return ctx;
    const n = GX.track(s, a, dt, impliedGest(a));
    // death: from the last pose to lying dead (first seen dead: dead already)
    if (a.dead) { s.dk = s.alive ? Math.min(1, (s.dk || 0) + dt / 0.85) : 1; s.alive = false; } else { s.dk = 0; s.alive = true; }
    if (a.dead && (a.z || 0) > 3) ctx.tree = true;
    if (s.side === undefined) s.side = GX.sideOf(a.id);
    if ((n === 'fall' || n === 'stagger') && a.gestV) s.side = a.gestV > 0 ? 1 : -1; // (the side a blow throws it to, when the world says it)
    ctx.side = s.side;
    // held: the holder's gesture, the side it lies to (its back to the holder), the turn of the death roll it rolls with
    const h = heldBy.get(a.id);
    if (h) { const hs = bvis.get(h.id); ctx.held = hs && hs.gn ? hs.gn : (h.state === 'roll' ? 'deathroll' : h.grip > 0 ? 'coil' : null); ctx.rollWith = hs && hs.rollA ? hs.rollA : 0;
      const yaw = s.yaw, dx = h.x - a.x, dz = h.y - a.y; ctx.side = (dz * Math.cos(yaw) - dx * Math.sin(yaw)) > 0 ? 1 : -1; if (!s.alive || a.dead) s.side = ctx.side;
      // (small, in the jaws or the talons: drawn where it is held, hanging)
      if (hs && hs.kb && snaps(a, h, hs.gn) && (hs.gn !== 'talons' || (h.z || 0) > 0.3)) {
        const ho = hs.gn === 'talons' ? 'feet' : 'mouth'; const hf = hs.kf; const J = hf.J, B = G.FaunaAnim.B;
        let bi, px, py, pz; if (ho === 'mouth') { GX.mouthOf(hf, AIMW); bi = 2; px = AIMW[0]; py = AIMW[1]; pz = AIMW[2]; } else { bi = 3; px = 0; py = J[B.hlL3 * 3 + 1]; pz = J[B.hlL3 * 3 + 2]; }
        const b = B[KB[bi]], e = hs.kb, o = bi * 16; const x = px - J[b * 3], y = py - J[b * 3 + 1], z = pz - J[b * 3 + 2];
        SNP[0] = e[o] * x + e[o + 4] * y + e[o + 8] * z + e[o + 12]; SNP[1] = e[o + 1] * x + e[o + 5] * y + e[o + 9] * z + e[o + 13]; SNP[2] = e[o + 2] * x + e[o + 6] * y + e[o + 10] * z + e[o + 14]; SNP[3] = hs.yaw + Math.PI / 2;
        ctx.snap = SNP; ctx.hang = true;
      }
    }
    // the other this gesture is made to, and the point of it
    const oid = n ? otherOf(a, n) : 0; const o = oid ? (G.S.animals.get(oid) || null) : null;
    if (o && o !== a && AIMAT[n]) {
      const s2 = bvis.get(o.id); const which = aimWhich(n, a, o, s2);
      if (keyPoint(o, s2, which, X, Z, AIMW)) {
        ctx.aim = AIMW;
        const hg = HOLDGEO[n] || 0;
        if (n === 'coil') { const pf = s2 && s2.kf ? s2.kf : G.Fauna3D.form(o.kind); if (pf && pf.hull) { const b = G.FaunaAnim.B.spine, h0 = pf.hull; const r0 = (h0.p[(b * h0.nd + 2) * 3 + 1] - h0.p[(b * h0.nd + 3) * 3 + 1]) * 0.5 * (s2 && s2.ksc ? s2.ksc : 1); ctx.coilR = r0 / Math.max(0.2, G.Fauna3D.scaleOf(a.kind)); } }
        if (hg > 0) holdBody(a, s, o, s2, n, hg, dt, X, Z);
      }
    } else if (oid && !o && AIMAT[n] && n !== 'coil' && P3.manAim(n, a, oid, X, Z, AIMW)) { ctx.aim = AIMW; const hg = HOLDGEO[n] || 0; if (hg > 0) holdBody(a, s, null, null, n, hg, dt, X, Z); } // (at a person: their point, D-332)
    if (!(ctx.aim && HOLDGEO[n])) { s.hx = (s.hx || 0) * Math.exp(-3 * dt); s.hz = (s.hz || 0) * Math.exp(-3 * dt); s.hon = 0; } // (the body back where the world has it)
    ctx.ground = !!(air === false && G.Animals.DEF[a.kind].cls === 'air' && n && GX.REC[n] && GX.REC[n].wing);
    return ctx;
  }
  // (the holder's body placed for the hold: turned toward the point, moved — at most a part of its size — so that what it holds
  // with reaches it: the mouth; for the coils the snake's middle at the prey's middle, across it; for the talons the feet on its back)
  const HB = new Float32Array(3);
  function holdBody(a, s, o, s2, n, hg, dt, X, Z) {
    const F3 = G.Fauna3D, form = F3.form(a.kind); if (!form) return; const sc = F3.scaleOf(a.kind) * (a.big || 1), TL = G.Space.TILE;
    let wantYaw, reach;
    if (n === 'coil') { // (across the prey's body, the loop round its middle)
      const oy = s2 ? s2.yaw : 0; wantYaw = oy + Math.PI / 2; keyPoint(o, s2, 'body', X, Z, HB); reach = form.J[G.FaunaAnim.B.root * 3 + 2] * sc;
      const pY = s2 && s2.Y !== null && s2.Y !== undefined ? s2.Y : 0; CTX.coilY = Math.max(0.05, (HB[1] - pY) / sc);
    } else if (n === 'talons' || n === 'mantle') { HB[0] = AIMW[0]; HB[1] = AIMW[1]; HB[2] = AIMW[2]; wantYaw = Math.atan2(HB[2] - Z, HB[0] - X); reach = 0; }
    else { HB[0] = AIMW[0]; HB[1] = AIMW[1]; HB[2] = AIMW[2]; wantYaw = Math.atan2(HB[2] - Z, HB[0] - X); const G0 = G.FaunaAnim.Gest; G0.mouthOf(form, KP); reach = KP[2] * sc * (n === 'nape' || n === 'pin' || n === 'maul' ? 0.55 : 0.82); }
    if (Math.hypot(HB[0] - X, HB[2] - Z) < 1e-3 && n !== 'coil') return;
    // (the hold turns the body on its own clock: the way the world drags the holder along does not turn it back each frame)
    if (!s.hon) s.hy = s.yaw; s.hon = 1;
    let da = wantYaw - s.hy; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.hy += da * (1 - Math.exp(-6 * dt));
    da = s.hy - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * hg;
    const c = Math.cos(s.yaw), sn = Math.sin(s.yaw); let wx = HB[0] - c * reach - X, wz = HB[2] - sn * reach - Z;
    const lim = F3.sizeOf(a.kind) * sc * 0.6, l = Math.hypot(wx, wz); if (l > lim) { wx *= lim / l; wz *= lim / l; }
    const e = 1 - Math.exp(-4 * dt); s.hx = (s.hx || 0) + (wx * hg - (s.hx || 0)) * e; s.hz = (s.hz || 0) + (wz * hg - (s.hz || 0)) * e;
  }
  // (a carcass is drawn where it fell — as a skin; one the sea took, or of the sea, is not: D-282)
  const carcass = a => { const sp = G.Animals.DEF[a.kind]; return !!sp && sp.cls !== 'water' && !a.sink; };
  // (who holds whom this frame — the world's a.caught, the holds of the gestures, the old states' prey — and the held put after
  // their holders in the list, so the holder's pose is there to be reached)
  const BHOLDS = { throat: 1, nape: 1, grip: 1, pin: 1, maul: 1, talons: 1, mantle: 1, coil: 1, deathroll: 1, drag: 1, carry: 1, carryyoung: 1, shakekill: 1, swallow: 1 };
  const HELD = new Map(), TAILB = [], HOLDR = new Set();
  function heldMap(list) {
    HELD.clear(); HOLDR.clear(); const S = G.S;
    // (every holder is ranked after the held — a pack on one prey: each wolf reaches for the moose as drawn this frame, L-996)
    for (let i = 0; i < list.length; i++) { const a = list[i][1];
      if (a.caught) { const h = S.animals.get(a.caught); if (h) { HELD.set(a.id, h); HOLDR.add(h.id); } }
      if (a.gest && a.gestO && BHOLDS[a.gest]) { HELD.set(a.gestO, a); HOLDR.add(a.id); }
      else if (!a.gest && a.target && (a.state === 'roll' || a.state === 'drown' || a.grip > 0)) { HELD.set(a.target, a); HOLDR.add(a.id); } }
    // (the order: the held first — their pose is there for the holder to reach this very frame; then the holders; last the small ones
    // carried in the jaws, drawn where the holder's mouth now is)
    if (HELD.size) {
      const rank = a => { const h = HELD.get(a.id); if (h && snaps(a, h, h.gest)) return 3; return HOLDR.has(a.id) ? 2 : h ? 1 : 0; };
      TAILB.length = 0; for (let g = 1; g <= 3; g++) for (let i = 0; i < list.length; i++) if (rank(list[i][1]) === g) TAILB.push(list[i]);
      let w = 0; for (let i = 0; i < list.length; i++) if (rank(list[i][1]) === 0) list[w++] = list[i]; for (let i = 0; i < TAILB.length; i++) list[w++] = TAILB[i]; }
    return HELD;
  }
  // (where a beast's frame stands: moved for a hold; the small held one with its middle where it is held, across the jaws)
  const FP = new Float32Array(3);
  function framePos(a, s, gc, X, Y, Z, fsc) {
    if (gc.snap) { const form = G.Fauna3D.form(a.kind), J = form.J, B = G.FaunaAnim.B; s.yaw = gc.snap[3]; const c = Math.cos(s.yaw), n = Math.sin(s.yaw), zz = J[B.spine * 3 + 2] * fsc;
      FP[0] = gc.snap[0] - c * zz; FP[2] = gc.snap[2] - n * zz; FP[1] = gc.snap[1] - J[B.spine * 3 + 1] * fsc * 0.95; return FP; }
    FP[0] = X + (s.hx || 0); FP[1] = Y; FP[2] = Z + (s.hz || 0); return FP;
  }
  function beasts(focus, R2, dt) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; let idx = 0, frow = 0; mats(); P3.bculled = 0;
    if (fauna && G.Fauna3D.broken(R3.renderer && R3.renderer())) { fauna = false; G.Fauna3D.clear(); }
    if (fauna) G.Fauna3D.begin();
    // (who is drawn: the nearest first — but one drawn last frame keeps its place against a newcomer only a little nearer, and
    // keeps being looked for a little past the edge of the sight: with more beasts in sight than rows, the farthest no longer
    // take each other's place every frame — they blinked, L-988; the dead lie drawn as skins too, D-282)
    const list = []; const bf = ++bframe;
    for (const a of S.animals.values()) {
      if ((a.dead && !(fauna && carcass(a))) || a.held) continue; const X = a.x * TL, Z = a.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2;
      const s0 = bvis.get(a.id); const was = !!s0 && s0.f === bf - 1;
      if (d2 < R2 * (was ? 0.77 : 0.7)) list.push([was ? d2 * 0.72 : d2, a, d2]);
    }
    list.sort((p, q) => p[0] - q[0]);
    const heldBy = heldMap(list); // (who holds whom: the held drawn after their holders — D-280)
    let nNear = 0; // (the beasts near enough to the eye for their eyes and hooves: the nearest first, so the first rows)
    const drawn = P3.bdrawn; drawn.length = 0;
    for (const [, a, d2] of list) {
      if (idx >= MAXA && frow >= MAXA) break;
      const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls === 'water') continue;
      const X = a.x * TL, Z = a.y * TL; let s = bvis.get(a.id); if (!s) { s = { X, Z, Y: null, yaw: 0, ph: a.id % 5, t: 0, graze: 0, v: 0, f: 0, u: 0 }; bvis.set(a.id, s); }
      s.u = bf; // (in sight's reach this frame: its memory is kept)
      const dx = X - s.X, dz = Z - s.Z; const dist = Math.hypot(dx, dz); if (dist > 0.002 && dist < 6) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-8 * dt)); }
      else if (dist <= 0.002 && !a.dead && (a.fx || a.fy) && !s.hon) { let da = Math.atan2(a.fy, a.fx) - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-4 * dt)); } // (standing, it turns as the world has it face — its body is the world's footprint, D-330)
      const v = dt > 0 && dist < 6 ? dist / dt : 0; s.v += (v - s.v) * (1 - Math.exp(-6 * dt)); s.t += dt; s.X = X; s.Z = Z;
      const F = formOf(sp, a.kind); const air = sp.cls === 'air' && (a.z || 0) > 0.3;
      // (drawn as one skin: G.Fauna3D, posed by G.FaunaAnim — while there are rows; past them, the farthest in sight as the pieces,
      // not left out: L-988; a dead one only as a skin)
      const fz = fauna && frow < MAXA && G.Fauna3D.has(a.kind) && (!air || G.Fauna3D.hasFly(a.kind));
      if (!fz && idx >= MAXA) continue;
      if (a.dead && !fz) continue; const gc = fz ? gestureOf(a, sp, s, dt, X, Z, heldBy, air) : null; // (the gesture, death, the hold: D-280)
      const u = (0.5 + (sp.size || 1) * 0.9) / 4 * (a.big || 1) * (a.age !== undefined && a.age < 1 ? 0.6 : 1); // (metres to the god's unit)
      const run = G.clamp(s.v / 3, 0, 1.4); s.ph += dt * (F.biped ? (s.v * 6 / Math.max(0.4, F.leg * u * 2) + 0.4) : (s.v * 0.55 / Math.max(0.4, F.leg * u * 2) + 0.06)); // (four legs: strides; two: radians)
      const col = F.col, dark = darker(col, 0.78), bel = F.belly || darker(col, 1.12);
      // (over a boulder's tile the feet go up onto the stone, as the people's do)
      const Yf = sp.cls === 'water' || air || a.swim ? W.groundH(a.x, a.y) * HM : Math.max(groundY(a.x, a.y), G.Space.stoneTop(X, Z));
      // (a beast first seen stands where the ground is — not rising to it from the height 0, out of the ground, as before)
      s.Y = s.Y === null || Math.abs(Yf - s.Y) > 3 ? Yf : s.Y + (Yf - s.Y) * (1 - Math.exp(-14 * dt));
      const Y = s.Y + (air ? Math.max(0.5, (a.z || 0) * 0.22) : !air && (a.z || 0) > 3 ? (G.Arvore3D ? G.Arvore3D.perchY(a) : Math.min(4, a.z * 0.22)) : 0) + (sp.cls === 'amph' && W.waterH && S.type[W.idx(Math.floor(a.x), Math.floor(a.y))] <= G.T.RIVER ? -0.3 : 0);
      const fsc = fz ? G.Fauna3D.scaleOf(a.kind) * (a.big || 1) * (a.age !== undefined && a.age < 1 ? 0.55 + 0.45 * Math.max(0, a.age) : 1) : 1;
      const fsize = fz ? G.Fauna3D.sizeOf(a.kind) * fsc / G.Fauna3D.scaleOf(a.kind) : 0;
      if (!inField(X, Y, Z, Math.max(0.6, fz ? fsize * 0.6 : F.len * u))) { P3.bculled++; continue; } // (outside the eye's field: not drawn)
      s.f = bf; drawn.push(a.id);
      if (d2 < 576 && !fz) nNear = idx + 1;
      const fp = gc ? framePos(a, s, gc, X, Y, Z, fsc) : null;
      const m = fp ? M.root.makeTranslation(fp[0], fp[1], fp[2]) : M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-s.yaw); m.multiply(M.b);
      // (on a slope a beast of four legs lies along it: pitched by the ground under its fore and hind feet, rolled by the ground
      // at its sides — its feet neither in the air nor in the ground; eased, so it never snaps)
      if (!air && !a.swim && !(gc && gc.snap) && (fz ? G.Fauna3D.form(a.kind).meta.fam !== 'bird' : !F.biped)) {
        const hl = (fz ? fsize * 0.4 : F.len * u * 0.42), hw = hl * 0.45, c = Math.cos(s.yaw), n = Math.sin(s.yaw), k = 1 / TL;
        const gf = groundY(a.x + c * hl * k, a.y + n * hl * k), gb = groundY(a.x - c * hl * k, a.y - n * hl * k), gl = groundY(a.x - n * hw * k, a.y + c * hw * k), gr = groundY(a.x + n * hw * k, a.y - c * hw * k);
        const wp = G.clamp(Math.atan2(gf - gb, 2 * hl), -0.5, 0.5), wr = G.clamp(Math.atan2(gl - gr, 2 * hw), -0.4, 0.4), e = 1 - Math.exp(-8 * dt);
        s.tp = s.tp === undefined || dt <= 0 ? wp : s.tp + (wp - s.tp) * e; s.tr = s.tr === undefined || dt <= 0 ? wr : s.tr + (wr - s.tr) * e;
        M.c.makeRotationZ(s.tp); m.multiply(M.c); M.c.makeRotationX(-s.tr); m.multiply(M.c);
      }
      // (grazing: a beast that eats grass lowers its head now and then while it stands)
      const grazer = sp.diet === 'herb' || sp.diet === 'browse' || (sp.diet === 'insect' && (sp.town || sp.dom)); const wantG = grazer && s.v < 0.15 && Math.sin(s.t * 0.35 + a.id) > 0.1 ? 1 : 0; s.graze += (wantG - s.graze) * (1 - Math.exp(-2 * dt));
      if (fz) { beastSkin(a, sp, s, m, fsc, d2, dt, frow, X, Y, Z, air || gc.ground, gc); frow++; continue; }
      for (const n of BP) bhide(n[0], idx);
      if (F.bird && air) {
        // a bird in the air: a body, wings beating (slower while it glides), a tail
        const L = F.len * u * 0.6, sw = F.span * u * 1.4; const fl = Math.sin(s.t * (sp.size > 1 ? 5 : 11) + a.id) * 0.7;
        bput('body', idx, m, 0, 0, 0, L, L * 0.45, L * 0.5, col); bput('head', idx, m, L * 0.5, L * 0.12, 0, L * 0.4, L * 0.38, L * 0.36, F.head || col); bput('snout', idx, m, L * 0.72, L * 0.1, 0, L * 0.09, L * 0.3, L * 0.09, F.beak, 0, 0, -Math.PI / 2);
        for (const sd of [-1, 1]) bput(sd < 0 ? 'wing0' : 'wing1', idx, m, 0, L * 0.05, sd * sw * 0.5 * Math.cos(fl), L * 0.55, 0.03, sw, F.wingc, sd * fl);
        bput('tail', idx, m, -L * 0.6, 0, 0, L * 0.35, L * 0.08, L * 0.3, F.wingc);
        idx++; continue;
      }
      if (F.biped) {
        // a bird afoot (a hen, a pigeon, an ostrich, a heron): two legs stepping, the head nodding with the steps
        const L = F.len * u * 0.7, legL = F.leg * u * 0.45, nk = F.neck * u * 0.45, H = F.h * u * 0.35; const bodyY = legL + H * 0.5;
        const step = Math.sin(s.ph) * 0.6 * G.clamp(s.v, 0, 1); const nod = (F.nod || s.v > 0.1 ? Math.sin(s.ph * 2) * 0.06 : 0) - s.graze * 0.0;
        if (F.upright) { bput('body', idx, m, 0, legL + H * 0.6, 0, H * 0.55, H * 1.1, H * 0.55, col); bput('mane', idx, m, H * 0.12, legL + H * 0.55, 0, H * 0.35, H * 0.9, H * 0.45, F.belly || col); }
        else bput('body', idx, m, 0, bodyY, 0, L, H, L * 0.62, col);
        const hx = (F.upright ? 0.05 : L * 0.42) + nod, hy = F.upright ? legL + H * 1.25 : bodyY + H * 0.3 + nk;
        if (!F.upright && nk > 0.05) bput('neck', idx, m, L * 0.35 + nod * 0.5, bodyY + H * 0.2 + nk * 0.5, 0, H * 0.28, nk + H * 0.2, H * 0.28, col, 0, 0, -0.25);
        const hr = Math.max(0.05, H * 0.42); bput('head', idx, m, hx, hy, 0, hr, hr, hr * 0.9, F.head || col);
        bput('snout', idx, m, hx + hr * 0.55, hy - hr * 0.08, 0, hr * 0.28, hr * 0.7, hr * 0.28, F.beak || '#e8b83a', 0, 0, -Math.PI / 2);
        if (F.comb) bput('mane', idx, m, hx, hy + hr * 0.5, 0, hr * 0.5, hr * 0.5, hr * 0.15, F.comb);
        for (const [n, sd] of [['eye0', -1], ['eye1', 1]]) bput(n, idx, m, hx + hr * 0.3, hy + hr * 0.15, sd * hr * 0.38, hr * 0.16, hr * 0.16, hr * 0.12, '#141210');
        for (const [n, sd] of [['leg0', -1], ['leg1', 1]]) limb(n, idx, m, 0, legL + 0.02, sd * L * 0.16, legL, Math.max(0.025, legL * 0.12), sd * step, F.legc || dark);
        if (F.tail === 'fan') bput('tail', idx, m, -L * 0.48, bodyY + H * 0.25, 0, L * 0.18, H * 0.75, L * 0.42, F.wingc || dark, 0, 0, 0.6);
        idx++; continue;
      }
      // a beast on four legs (or none: a seal, a snake): its body, neck and head; legs trotting in diagonal pairs
      const L = F.len * u, H = F.len * u * 0.36 * (1 + (F.stout || 0) * 0.22) * (F.low ? 0.45 : 1), Wd = H * (F.stout ? 0.95 : 0.78);
      const legL = F.leg * u * 0.62, nk = F.neck * u * 0.5; const bodyY = (F.low ? H * 0.55 : legL + H * 0.42) + (F.hop ? Math.abs(Math.sin(s.ph * TAU)) * 0.12 * run : (run > 0.95 ? Math.sin(s.ph * TAU) * 0.05 : Math.abs(Math.sin(s.ph * TAU * 2)) * 0.022 * G.clamp(run * 2, 0, 1)));
      // (the body breathes when it stands, rocks nose up and down in a gallop)
      const pitch = run > 0.95 ? Math.sin(s.ph * TAU + 1.2) * 0.09 : 0; const brb = 1 + Math.sin(s.t * 2.1 + a.id) * 0.012 * (1 - G.clamp(run * 3, 0, 1));
      bput('body', idx, m, 0, bodyY, 0, L, H * brb, Wd * brb, col, 0, 0, pitch);
      if (F.hump) bput('mane', idx, m, -L * 0.05, bodyY + H * 0.45, 0, L * 0.38, H * 0.55, Wd * 0.7, col);
      if (F.shell) bput('mane', idx, m, 0, bodyY + H * 0.2, 0, L * 0.9, H * 1.1, Wd * 1.05, F.shell);
      // (neck up and forward, lower while grazing; the head at its end)
      const na = (F.neck > 3 ? 0.35 : 0.9) + s.graze * 1.6 + Math.sin(s.ph * TAU * 2) * 0.07 * G.clamp(run * 2.5, 0, 1) * (run > 0.95 ? 0.4 : 1); const nx = L * 0.38, ny = bodyY + H * 0.2; // (the head nods with the steps)
      const hx = nx + Math.sin(na) * (nk + H * 0.2), hy = ny + Math.cos(na) * (nk + H * 0.2) - (F.low ? H * 0.3 : 0);
      if (nk > 0.04) bput('neck', idx, m, (nx + hx) / 2, (ny + hy) / 2 - nk * 0.15, 0, H * 0.42, nk + H * 0.35, Wd * 0.5, col, 0, 0, -na);
      const hr = H * (F.low ? 0.9 : 0.62) * (F.trunk ? 1.3 : 1); bput('head', idx, m, hx, hy, 0, hr * 1.05, hr * 0.85, hr * 0.8, col);
      const sn = (0.45 + (F.snout || 0) * 0.35) * hr; bput('snout', idx, m, hx + hr * 0.35 + sn * 0.4, hy - hr * 0.12 - s.graze * hr * 0.2, 0, hr * 0.5, sn, hr * 0.42, F.snout >= 2 || F.low ? col : darker(col, 0.92), 0, 0, -Math.PI / 2 - 0.25 * (1 - (F.low ? 1 : 0)));
      if (F.trunk) limb('tail', idx, m, hx + hr * 0.6, hy - hr * 0.1, 0, hr * 1.7, hr * 0.3, 0.25 + Math.sin(s.t * 1.3) * 0.15, col);
      for (const [n, sd] of [['eye0', -1], ['eye1', 1]]) bput(n, idx, m, hx + hr * 0.42, hy + hr * 0.18, sd * hr * 0.36, hr * 0.12, hr * 0.12, hr * 0.1, '#141210');
      if (F.ear) for (const [n, sd] of [['ear0', -1], ['ear1', 1]]) { const big = F.trunk ? 1 : 0; bput(n, idx, m, hx - hr * 0.15, hy + hr * (big ? 0 : 0.35), sd * hr * (big ? 0.6 : 0.3), hr * 0.32 * F.ear * (big ? 0.5 : 1), hr * 0.5 * Math.min(2.6, F.ear), hr * (big ? 0.9 : 0.16) * Math.min(1.5, F.ear), big ? darker(col, 0.9) : dark, sd * (big ? 1.3 : 0.25), 0, F.hop ? 0.1 : -0.2); }
      if (F.horn === 'antler') for (const [n, sd] of [['horn0', -1], ['horn1', 1]]) bput(n, idx, m, hx - hr * 0.1, hy + hr * 0.5, sd * hr * 0.25, hr * 0.12, hr * 1.6, hr * 0.12, '#d8c8a8', sd * 0.5, 0, -0.35);
      else if (F.horn === 'nose') bput('horn0', idx, m, hx + hr * 0.5, hy + hr * 0.15, 0, hr * 0.3, hr * 0.9, hr * 0.3, '#c8c0b0', 0, 0, -0.5);
      else if (F.horn === 'ossicone') for (const [n, sd] of [['horn0', -1], ['horn1', 1]]) bput(n, idx, m, hx - hr * 0.1, hy + hr * 0.5, sd * hr * 0.2, hr * 0.12, hr * 0.5, hr * 0.12, darker(col, 0.6));
      else if (F.horn) for (const [n, sd] of [['horn0', -1], ['horn1', 1]]) bput(n, idx, m, hx - hr * 0.05, hy + hr * 0.45, sd * hr * 0.3, hr * 0.1, hr * (F.horn === 'curl' ? 0.7 : 1.1), hr * 0.1, '#3a3028', sd * (F.horn === 'curl' ? 1.2 : 0.25), 0, 0.6);
      if (F.tusk) for (const [n, sd] of [['horn0', -1], ['horn1', 1]]) bput(n, idx, m, hx + hr * 0.55, hy - hr * 0.45, sd * hr * 0.25, hr * 0.1, hr * 0.7, hr * 0.1, '#f2ecd8', 0, 0, -1.1);
      if (F.mane) bput('mane', idx, m, hx - hr * 0.35, hy - hr * 0.1, 0, hr * 1.5, hr * 1.5, hr * 1.4, F.mane);
      // (legs: front and back, left and right, each of two bones; the gait by the speed — a walk, a trot, a gallop — each foot
      // lifted and folded as it swings forward, set down straight; a hopper's hind legs together)
      if (legL > 0.02) {
        const gait = run > 0.95 ? 'gallop' : run > 0.45 ? 'trot' : 'walk'; const OFF = GAIT[gait];
        const amp = (gait === 'gallop' ? 0.66 : gait === 'trot' ? 0.42 : 0.3) * G.clamp(run * 2.2, 0, 1); const lift = gait === 'gallop' ? 1.15 : gait === 'trot' ? 0.95 : 0.8;
        const l1 = (legL + H * 0.15) * 0.52, l2 = (legL + H * 0.15) * 0.5, rr = Math.max(0.03, Wd * 0.22);
        for (let k = 0; k < 4; k++) {
          const front = k < 2, sd = k % 2 ? 1 : -1; const th = (s.ph + (F.hop ? (front ? 0 : 0.5) : OFF[(front ? 0 : 2) + (sd > 0 ? 1 : 0)]) * TAU);
          const sw = Math.sin(th) * amp, fold = Math.max(0, Math.cos(th)) * amp * lift; // (forward swing while cos > 0: the foot in the air)
          const hs = Math.sin(s.ph * TAU); const a1 = F.hop ? (front ? 0.3 : -0.4) * hs * run : sw, a2 = F.hop ? (front ? -0.3 : 0.5) * Math.max(0, hs) * run : (front ? -fold * 1.1 : fold * 0.9);
          limb2(k, idx, m, (front ? 1 : -1) * L * 0.32, bodyY - H * 0.15, sd * Wd * 0.3, l1, l2, rr, a1 - (front ? 0 : a2 * 0.35), a2, front ? darker(col, 0.9) : dark, darker(col, 0.45));
        } }
      else if (F.tail === 'flipper') { for (const [n, sd] of [['leg0', -1], ['leg1', 1]]) bput(n, idx, m, L * 0.2, bodyY - H * 0.35, sd * Wd * 0.55, L * 0.3, 0.04, L * 0.15, dark, 0, sd * 0.4, 0); }
      // (the tail: wagging for a dog, hanging for most, flat for a beaver, long and low for a crocodile)
      if (F.tail && !F.trunk) {
        const tL = F.tail === 'croc' ? L * 0.8 : F.tail === 'long' ? L * 0.7 : F.tail === 'bushy' ? L * 0.55 : F.tail === 'puff' ? H * 0.4 : F.tail === 'flat' ? L * 0.35 : L * 0.4;
        const tr = F.tail === 'bushy' ? H * 0.3 : F.tail === 'puff' ? H * 0.4 : F.tail === 'croc' ? H * 0.5 : F.tail === 'flat' ? H * 0.35 : H * 0.12;
        const wag = F.tail === 'wag' ? Math.sin(s.t * 9) * 0.6 : F.tail === 'croc' ? Math.sin(s.ph * TAU) * 0.25 : Math.sin(s.t * 1.7 + a.id) * 0.15 + Math.sin(s.ph * TAU) * 0.12 * G.clamp(run, 0, 1);
        const ta = F.tail === 'croc' || F.tail === 'flat' ? -Math.PI / 2 - 0.05 : F.tail === 'wag' || F.tail === 'bushy' ? -2.2 : -0.35;
        limb('tail', idx, m, -L * 0.45, bodyY + (F.tail === 'croc' ? -H * 0.1 : H * 0.15), 0, tL, tr, ta, F.tail === 'puff' ? '#f4f0ea' : dark, wag);
      }
      idx++;
    }
    // (beyond 24 m the eyes and the hooves are a pixel: not drawn — a sixth of a beast's triangles)
    beastMesh.forEach((m, k) => { m.count = BFAR.has(BP[k][0]) ? Math.min(nNear, idx) : idx; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    if (fauna) G.Fauna3D.end();
    P3.beasts = idx + frow; P3.beastSkins = frow;
    // (the view's memory of the beasts out of sight's reach for a while is let go — not all of it at once: the standing beasts lost
    // which way they faced and turned all together to the east, L-989)
    if (bvis.size > 400) { for (const [id, s] of bvis) if (bf - (s.u || 0) > 90) bvis.delete(id); if (bvis.size > 1200) bvis.clear(); }
  }
})(window.G);
