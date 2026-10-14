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
  const Anim = G.Anim3D = {};
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
  let beastMesh = null, crowd = null, crowdHead = null, crowdHair = null, crowdLegs = null;
  const vis = new Map(); // id → the view's own memory of someone: where they were, which way they face, their walk, their pose
  P3.clear = function () { vis.clear(); if (G.Body3D && G.Body3D.clear) G.Body3D.clear(); for (const sp of emoPool) sp.visible = false; if (mesh) for (const m of mesh) { m.count = 0; m.instanceMatrix.needsUpdate = true; } if (beastMesh) for (const m of beastMesh) { m.count = 0; } if (crowd) { crowd.count = crowdHead.count = crowdHair.count = crowdLegs[0].count = crowdLegs[1].count = 0; } P3.count = 0; P3.crowd = 0; };
  let avFeet = null;
  G.worldHooks.push(() => { vis.clear(); avFeet = null; seenAt[0] = seenAt[1] = 0; cLod.clear(); });

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
    for (const m of [crowd, crowdHead, crowdHair, ...crowdLegs]) { m.count = 0; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); }
    // (a feeling over a head: the god's little bubble with its sign — fear, joy, love, anger, a question)
    emoPool = []; for (let k = 0; k < 20; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); sp.visible = false; sp.renderOrder = 4; scene.add(sp); emoPool.push(sp); }

    // (what the hands hold: one instanced mesh a kind of tool, its wood and iron in the vertex colours)
    tools = makeTools(mat);
    // (the body as one skin, if it starts; the pieces of old stay for the props — and for everything, if it does not)
    skin = !!(G.Body3D && G.Body3D.init(THREE, R3));
    if (skin) PARTS.forEach((p, k) => { if (!PROPS.has(p[0])) mesh[k].visible = false; });
  };
  // ------------------------------ what the hands hold ------------------------------
  // Each kind a geometry of its own, made once — the grip at the origin, along +Y the way its head points (People3D.rig's
  // 'tool' frame is the hole of the closed fist, its +Y the fist's axis) — the wood and the iron in the vertex colours; one
  // instanced mesh a kind, drawn only for those who hold one.
  let tools = null; const toolN = {};
  const TOOL_OF = { chop: 'machado', cut: 'machado', mine: 'picareta', dig: 'pa', hammer: 'martelo', build: 'martelo', forge: 'martelo', beat: 'martelo', rake: 'enxada', butcher: 'faca', skin: 'faca', stab: 'espada', fight: 'espada', brandish: 'espada', fish: 'vara', reel: 'vara' };
  function makeTools(baseMat) {
    const WOOD = [0.36, 0.25, 0.15], DARK = [0.26, 0.17, 0.1], IRON = [0.42, 0.43, 0.45], EDGE = [0.66, 0.67, 0.7], ROPE = [0.6, 0.52, 0.36];
    const cyl = (r0, r1, y0, y1, n, col) => { const g = new THREE.CylinderGeometry(r1, r0, y1 - y0, n || 7, 1); g.translate(0, (y0 + y1) / 2, 0); return [g, col]; };
    const box = (sx, sy, sz, x, y, z, col, rz, rx) => { const g = new THREE.BoxGeometry(sx, sy, sz); if (rx) g.rotateX(rx); if (rz) g.rotateZ(rz); g.translate(x, y, z); return [g, col]; };
    const merge = list => {
      let nv = 0, ni = 0; for (const [g] of list) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), cl = new Float32Array(nv * 3), idx = new Uint16Array(ni); let o = 0, oi = 0;
      for (const [g, col] of list) {
        const P = g.attributes.position, N = g.attributes.normal;
        for (let i = 0; i < P.count; i++) { pos[(o + i) * 3] = P.getX(i); pos[(o + i) * 3 + 1] = P.getY(i); pos[(o + i) * 3 + 2] = P.getZ(i); nor[(o + i) * 3] = N.getX(i); nor[(o + i) * 3 + 1] = N.getY(i); nor[(o + i) * 3 + 2] = N.getZ(i); cl[(o + i) * 3] = col[0]; cl[(o + i) * 3 + 1] = col[1]; cl[(o + i) * 3 + 2] = col[2]; }
        if (g.index) for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.getX(i) + o; else for (let i = 0; i < P.count; i++) idx[oi + i] = o + i;
        oi += g.index ? g.index.count : P.count; o += P.count; g.dispose();
      }
      const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.BufferAttribute(cl, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1)); return out;
    };
    const oct = (sx, sy, sz, y, col) => { const g = new THREE.OctahedronGeometry(1, 0); g.scale(sx, sy, sz); g.translate(0, y, 0); return [g, col]; };
    const ball = (r, y, col) => { const g = new THREE.SphereGeometry(r, 7, 5); g.translate(0, y, 0); return [g, col]; };
    const G0 = {
      // (a spear: an ash shaft of two metres gripped a little under its middle, a binding where the hand holds it, a leaf of iron)
      lanca: merge([cyl(0.015, 0.014, -1.02, 0.86, 7, WOOD), cyl(0.017, 0.016, 0.86, 0.95, 7, IRON), oct(0.028, 0.15, 0.008, 1.08, EDGE), cyl(0.0165, 0.0165, -0.05, 0.06, 7, ROPE)]),
      // (an axe: a haft, a bearded head of iron, its edge brighter)
      machado: merge([cyl(0.016, 0.014, -0.16, 0.56, 7, WOOD), box(0.024, 0.07, 0.11, 0, 0.53, 0.045, IRON), box(0.026, 0.12, 0.03, 0, 0.51, 0.1, EDGE), box(0.03, 0.05, 0.04, 0, 0.53, -0.03, IRON)]), // (its edge the way it strikes: +Z)
      // (a hammer: a short haft, a square head across it)
      martelo: merge([cyl(0.014, 0.012, -0.1, 0.34, 7, WOOD), box(0.05, 0.05, 0.13, 0, 0.34, 0, IRON)]),
      // (a pick: a long haft, a head of iron pointed at both ends, curving)
      picareta: merge([cyl(0.016, 0.014, -0.14, 0.62, 7, WOOD), box(0.03, 0.034, 0.2, 0, 0.6, 0.06, IRON, 0, 0.12), box(0.028, 0.03, 0.16, 0, 0.6, -0.07, IRON, 0, -0.14), box(0.04, 0.05, 0.05, 0, 0.6, 0, IRON)]),
      // (a spade: gripped at the top of the haft, the blade below)
      pa: merge([cyl(0.015, 0.015, -0.86, 0.08, 7, WOOD), box(0.08, 0.03, 0.03, 0, 0.08, 0, DARK), box(0.19, 0.26, 0.016, 0, -0.98, 0, IRON), box(0.19, 0.03, 0.02, 0, -0.84, 0, IRON)]),
      // (a hoe: a long haft, its blade turned down at the end)
      enxada: merge([cyl(0.015, 0.014, -0.25, 0.95, 7, WOOD), box(0.17, 0.11, 0.012, 0, 0.92, 0.05, IRON, 0, 1.2)]),
      // (an elder's staff: as tall as the shoulder, gripped near its top, a knob)
      cajado: merge([cyl(0.019, 0.016, -0.97, 0.2, 7, DARK), ball(0.03, 0.22, DARK)]),
      // (a fishing rod: long, thin)
      vara: merge([cyl(0.014, 0.011, -0.2, 0.7, 6, WOOD), cyl(0.011, 0.006, 0.7, 1.6, 5, WOOD), cyl(0.006, 0.003, 1.6, 2.3, 4, WOOD)]),
      // (a knife: a short blade on a handle)
      faca: merge([cyl(0.013, 0.012, -0.05, 0.07, 6, DARK), box(0.03, 0.17, 0.006, 0.006, 0.155, 0, EDGE)]),
      // (a sword: the grip and its pommel, the guard, a long blade)
      espada: merge([cyl(0.014, 0.013, -0.06, 0.07, 6, DARK), ball(0.022, -0.08, IRON), box(0.16, 0.022, 0.03, 0, 0.08, 0, IRON), box(0.045, 0.62, 0.009, 0, 0.4, 0, EDGE), oct(0.0225, 0.07, 0.0045, 0.74, EDGE)]),
    };
    const tm = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }); tm.onBeforeCompile = baseMat.onBeforeCompile; tm.customProgramCacheKey = () => 'people3d-tool';
    const out = {}; for (const k in G0) { const m = new THREE.InstancedMesh(G0[k], tm, MAX); m.count = 0; m.visible = false; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); out[k] = m; toolN[k] = 0; }
    return out;
  }
  // (which tool someone holds: the one their work takes, as they swing it; or the one they carry — a spear, a staff)
  function toolKind(L, pose) { if (pose.tool) return TOOL_OF[L.act] || (L.toolK === 'lanca' && L.tool ? 'lanca' : 'machado'); return L.tool ? (L.toolK || 'lanca') : null; }
  function toolPut(R, L, pose) { const k = toolKind(L, pose); const m = k && tools && tools[k]; if (!m || toolN[k] >= MAX) return false; m.setMatrixAt(toolN[k]++, R[B.tool]); return true; }
  function toolsBegin() { if (tools) for (const k in tools) toolN[k] = 0; }
  function toolsEnd() { if (tools) for (const k in tools) { const m = tools[k]; m.count = toolN[k]; m.visible = toolN[k] > 0; m.instanceMatrix.needsUpdate = true; } }
  P3.tools = () => (tools ? Object.keys(tools).filter(k => toolN[k]).map(k => [k, toolN[k]]) : []); // (for the tests: who holds what this frame)
  P3.toolGeo = k => (tools && tools[k] ? tools[k].geometry : null); // (for the tests: a tool's shape, read only)

  let emoPool = []; const emoTex = new Map();
  function emoMap(k) { let t = emoTex.get(k); if (t === undefined) { const s = G.Art && G.Art.icon ? G.Art.icon(k) : null; t = s && s.c ? new THREE.CanvasTexture(s.c) : null; if (t) t.colorSpace = THREE.SRGBColorSpace; emoTex.set(k, t); } return t; }

  // ------------------------------ looks ------------------------------
  const C3 = {};
  function color(hex) { let c = C3[hex]; if (!c) { c = new THREE.Color(); c.set(hex || '#888888'); C3[hex] = c; } return c; }
  const darker = (hex, f) => { const r = G.hex2rgb(hex); return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0')).join(''); };
  // a person's look, from the world's own record of them
  P3.look = function (v) {
    const fac = G.Fac.ofV ? G.Fac.ofV(v) : null;
    const facHex = fac ? G.Fac.hex(fac.id) : null;
    let cloth = v.captive ? '#8b8478' : v.age < 16 ? (v.kidCloth || '#4fa0d8') : v.role === 'guerreiro' ? (facHex || '#8a3a2a') : ((G.Art && G.Art.CLOTH && G.Art.CLOTH[v.role]) || '#c9763a');
    const ad = v.age;
    const h = ad < 2 ? 0.55 : ad < 16 ? 0.75 + (ad / 16) * 0.9 : ad >= 70 ? 1.68 : 1.75;
    const s = (h / 1.75) * (v.g === 'f' && ad >= 14 ? 0.95 : 1);
    const robe = v.role === 'sacerdote' || v.role === 'anciao' || v.role === 'escriba' || (v.g === 'f' && ad >= 12 && (v.id % 3 !== 0));
    const hair = ad >= 62 ? G.lerpColor(G.hex2rgb(v.hair || '#3a2a1a'), [214, 210, 204], G.clamp((ad - 62) / 18, 0, 0.85)) : null;
    const L = { s, skin: v.skin || '#d8a888', hair: hair ? '#' + hair.map(q => Math.round(q).toString(16).padStart(2, '0')).join('') : v.hair || '#3a2a1a', cloth, pants: darker(cloth, 0.62), feet: '#3a2a1e', belt: darker(cloth, 0.38), brow: darker(v.hair || '#3a2a1a', 0.8), nose: darker(v.skin || '#d8a888', 0.88), lips: darker(v.skin || '#d8a888', 0.62), robe, fem: v.g === 'f' && ad >= 13, bun: v.g === 'f' && ad >= 16 && v.id % 3 === 1, beard: v.g === 'm' && ad >= 26 && v.id % 3 === 0, long: v.g === 'f' && ad >= 8 && v.id % 3 !== 1, bald: v.g === 'm' && ad >= 55 && v.id % 4 === 0, carry: !!(v.carry && v.carry.n > 0), tool: v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'vigia' || (v.role === 'anciao' && ad >= 60), toolK: v.role === 'anciao' ? 'cajado' : 'lanca', act: v.act, torch: torchOf(v), lantern: !!v.lantern && !v.inside, strap: ad >= 14 && (v.role === 'cacador' || v.role === 'guerreiro' || v.role === 'mercador' || v.role === 'explorador' || (G.Possess && G.Possess.body && G.Possess.body() === v)) };
    L.id = v.id || 0; // (only for the drawing's own clocks: each one's cloth moves on its own beat)
    if (skin) {
      L.out = outfitOf(v, L, fac); L.headK = L.out.headK; L.armOut = L.out.skirt === 'saiaL' || L.out.cloakM || L.out.topM ? 0.07 : 0;
      // (the face's mood, from the world's feeling: joy smiles with the eyes, love too and blushes; grief frowns with the
      // brows' inner ends raised and the lids drooping; fear and awe open the eyes wide and the mouth; anger draws the brows
      // down and in and glares; a question lifts the brows; sickness and sleep half close the eyes; a calm face a little warm)
      const e = v.emo && v.emo.k; const grief = v.mourn > 0 || e === 'sad'; L.mood = MOOD[grief ? 'sad' : e] || MOOD.calm;
    }
    return L;
  };

  // (the faces of the feelings: smile (−1 frown .. 1), brows up, anger, grief, eyes wide, eyes smiling, the jaw open, blush)
  const MOOD = {
    calm: { smile: 0.12 }, chat: { smile: 0.3 }, food: { smile: 0.3 }, fish: { smile: 0.35 }, wood: { smile: 0.2 }, star: { smile: 0.7, wide: 0.35, up: 0.3 },
    happy: { smile: 0.9, squint: 0.55, jaw: 0.25 }, joy: { smile: 1, squint: 0.6, jaw: 0.4 }, heart: { smile: 0.65, squint: 0.35, blush: 0.4 },
    sad: { smile: -0.6, up: 0.15, sad: 1 }, angry: { smile: -0.45, angry: 1, squint: 0.3, jaw: 0.08 }, fear: { smile: -0.3, up: 1, wide: 1, jaw: 0.45 }, fire: { smile: -0.3, up: 1, wide: 1, jaw: 0.4 },
    awe: { smile: 0.1, up: 0.9, wide: 0.6, jaw: 0.35 }, question: { up: 0.65, smile: -0.05 }, sick: { smile: -0.35, sad: 0.6, squint: 0.45 }, zzz: { squint: 0.75 }, pray: { squint: 0.8, smile: 0.1 },
  };
  const FACE = ['smile', 'up', 'angry', 'sad', 'wide', 'squint', 'jaw', 'blush'];
  // (a face moves from one feeling to the next in a third of a second or so, never at once — the view's own memory)
  function easeMood(s, md, dt) { const m = s.mood || (s.mood = {}); const k = 1 - Math.exp(-6 * (dt || 0)); for (const f of FACE) { const w = md[f] || 0; m[f] = m[f] === undefined ? w : m[f] + (w - m[f]) * k; } return m; }

  // ------------------------------ clothes ------------------------------
  // What a person wears, from who they are: their people (the north's tunic and wrapped legs, the apron-dress with its
  // brooches; the Greek and Roman chiton and sandals; the Egyptian kilt and broad collar; the Aztec cloak and huipil),
  // their trade (the smith's leather apron, the farmer's straw hat, the priest's robe, the warrior's helmet), their sex
  // and age, their wealth (a cloak, a brooch of gold, trims of a dyed thread), the ruler's crown, the captive's undyed
  // rags. The colour of their trade is the god's (Art.CLOTH), only softened to a dyed wool's. Every choice by the
  // person's id (G.hash): the same person always the same — never a roll. Kept a while per person (only seen).
  const OUT = new Map(); G.worldHooks.push(() => OUT.clear());
  const mixHex = (a, b, t) => { const p = G.hex2rgb(a), q = G.hex2rgb(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const wool = hex => mixHex(hex, '#8a7d6a', 0.28); // (a trade's colour, as a dyed wool would show it: never a neon)
  const LEATHER = ['#5a3e28', '#6b4a2e', '#4a3322', '#7a5634'], METAL = { bronze: '#b08a4a', gold: '#d8b04a', iron: '#8a8e96', silver: '#c8ccd2' };
  const IRIS = ['#4a3020', '#5a3a22', '#3a2a1a', '#4a6a8a', '#5a7a9a', '#6a7a5a', '#7a6a3a'];
  const HAIRS = { m: ['curto', 'curto', 'rabo', 'longo', 'curto'], f: ['trancas', 'coque', 'longo', 'trancas', 'coque'] };
  function outfitOf(v, L, fac) {
    const S = G.S; const id = v.id || 0; const now = S ? S.clock : 0;
    const civ = (fac && fac.civ) || v._civ || v.civ || 'nordico'; const CV = (G.CIVS && G.CIVS[civ]) || {};
    const home = G.Eco && G.Eco.homeOf && v.home ? G.Eco.homeOf(v) : null;
    const ruler = !!(fac && fac.leader && fac.leader === v.id);
    const wealth = v.captive ? 0 : ruler ? 3 : !home ? (v.home ? 1 : 0) : home.type === 'barraco' ? 0 : home.type === 'hut' ? 1 + ((home.coin || 0) > 25 ? 1 : 0) : 2 + ((home.coin || 0) > 40 || home.type === 'sobrado' ? 1 : 0);
    const sig = `${v.role}|${Math.floor(v.age)}|${civ}|${v.captive ? 1 : 0}|${ruler ? 1 : 0}|${wealth}|${v.robe || ''}|${v.unmask ? 1 : 0}|${v.g}|${L.cloth}|${L.hair}`;
    let o = OUT.get(id); if (o && o.sig === sig) return o;
    o = { sig, t: now };
    const hh = k => G.hash(id * 13 + k * 7919); // (this person's own coin flips, always the same)
    const ad = v.age, fem = v.g === 'f', kid = ad < 13, role = v.role || '';
    o.body = fem && ad >= 11 ? 'corpoF' : 'corpoM';
    o.headK = kid ? 1 + 0.32 * G.clamp(1 - ad / 13, 0, 1) : 1;
    // (the colours: the trade's, softened; the people's trim; the trousers and boots of leather and wool)
    const base = v.captive ? '#8b8478' : kid ? (v.kidCloth || '#4fa0d8') : role === 'guerreiro' ? (L.cloth) : L.cloth;
    o.cloth = wool(base); o.trim = CV.trim ? mixHex(CV.trim, ['#b33a2a', '#3f6fb0', '#c8a040', '#2f7a5a'][Math.floor(hh(1) * 4)], hh(2) * 0.5) : '#9a3a2a';
    o.pants = v.captive ? '#6a645a' : ['#4a4038', '#3e3a34', '#5a4a3a', '#4a4a44'][Math.floor(hh(3) * 4)];
    o.boots = LEATHER[Math.floor(hh(4) * LEATHER.length)]; o.belt = darker(LEATHER[Math.floor(hh(5) * LEATHER.length)], 0.8);
    o.metal = ruler ? METAL.gold : wealth >= 3 ? (hh(6) < 0.5 ? METAL.gold : METAL.silver) : METAL.bronze;
    o.over = o.cloth; o.beads = ['#c87a2a', '#d89a3a', '#b8582a'][Math.floor(hh(7) * 3)]; o.cloak = wool(darker(base, 0.75)); o.hat = o.cloth;
    o.iris = IRIS[(Math.floor(hh(8) * 7) + (G.hex2rgb(L.skin)[0] < 170 ? 0 : 0)) % IRIS.length];
    if (G.hex2rgb(L.skin)[0] < 175) o.iris = IRIS[Math.floor(hh(8) * 3)]; // (dark skin, dark eyes)
    o.lips = mixHex(L.skin, '#a8524a', fem ? 0.42 : 0.28);
    // (the cut: sleeves to the wrist, the round neckline, shoes to the ankle, trousers, the belt at the waist)
    o.sleeve = 0.585; o.neck = 0; o.bootTop = 0.11; o.legs = 1; o.beltY = 1.01; o.beltH = 0.017; o.overK = 0; o.strap = L.strap ? 1 : 0;
    o.torso = 0; o.motif = wealth >= 2 && hh(9) < 0.7 ? 1 : 0; o.feetK = 0; o.hem = 1; o.cloakTrim = wealth >= 2 ? 1 : 0;
    o.skirt = null; o.cloakM = null; o.hatM = null; o.beard = null; o.topM = null;
    o.hairM = ad >= 55 && !fem && hh(10) < 0.35 ? 'careca' : HAIRS[fem ? 'f' : 'm'][Math.floor(hh(11) * 5)];
    if (!fem && ad >= 22 && hh(12) < (civ === 'nordico' ? 0.62 : civ === 'grego' ? 0.5 : 0.22)) o.beard = hh(13) < 0.55 ? 'barba' : hh(13) < 0.8 ? 'curta' : 'bigode';
    o.blush = fem || kid ? 0.25 : 0.06;
    if (kid) { o.skirt = fem ? 'saiaL' : 'saiaC'; o.legs = fem ? 0 : 1; o.feetK = hh(14) < 0.45 ? 1 : 0; o.hairM = fem ? (hh(15) < 0.5 ? 'trancas' : 'longo') : 'curto'; o.motif = 0; o.sleeve = 0.45; }
    else if (civ === 'nordico') {
      if (fem) { o.skirt = 'saiaL'; o.over = wool(base); o.cloth = ['#e8e0cc', '#d8cfb8', '#c8b898'][Math.floor(hh(16) * 3)]; o.overK = 1; o.legs = 0; if (hh(17) < 0.38 && ad >= 18) o.hatM = 'lenco', o.hat = ['#e8e2d0', '#c8b898', '#9a3a2a'][Math.floor(hh(18) * 3)]; }
      else { o.skirt = 'saiaC'; o.legs = hh(19) < 0.7 ? 2 : 1; if (hh(20) < 0.3) o.hatM = 'gorro', o.hat = wool(['#7a3a2a', '#3a4a6a', '#5a5a3a', '#6a4a3a'][Math.floor(hh(21) * 4)]); }
      if (wealth >= 2 && hh(22) < 0.6 || ad >= 50 && hh(22) < 0.5) o.cloakM = 'capa';
      o.bootTop = hh(23) < 0.4 ? 0.2 : 0.11;
    } else if (civ === 'grego' || civ === 'romano' || civ === 'classico') {
      o.cloth = mixHex(CV.cloth || '#efe9dc', o.cloth, kid ? 0.6 : 0.35); o.sleeve = 0.16; o.legs = 0; o.feetK = 2; o.skirt = fem ? 'saiaL' : 'saiaC'; o.bootTop = 0.0;
      if (fem) o.hairM = hh(24) < 0.7 ? 'coque' : 'longo'; else o.hairM = 'curto';
      // (a Greek woman's chiton falls doubled at the top: its overfold, a loose blouse; a rich man's mantle is a toga — of
      // white wool for a Roman — or a himation of colour; a rich woman's, a palla over the shoulders)
      if (fem && civ === 'grego' && ad >= 13) o.topM = 'bata';
      if (wealth >= 2) { if (fem) o.cloakM = 'capa', o.cloak = wool(darker(base, 0.9)); else o.cloakM = 'toga', o.cloak = civ === 'romano' ? '#ebe5d5' : wool(darker(base, 0.9)); }
    } else if (civ === 'egipcio') {
      o.cloth = '#f1ead6'; o.legs = 0; o.feetK = hh(25) < 0.5 ? 1 : 2; o.bootTop = 0; o.skirt = fem ? 'saiaL' : 'saiaC';
      if (!fem) { o.torso = wealth >= 2 || role === 'sacerdote' ? 2 : 1; o.beltY = 0.98; } else { o.sleeve = 0.04; o.torso = wealth >= 2 ? 0 : 0; }
      o.hairM = role === 'sacerdote' ? 'careca' : wealth >= 2 || (fem && hh(30) < 0.5) ? 'peruca' : 'chanel'; o.trim = CV.trim || '#2f8f8a'; o.beard = null;
    } else if (civ === 'asteca') {
      o.cloth = mixHex('#e8dcc0', o.cloth, 0.3); o.legs = 0; o.feetK = 2; o.bootTop = 0; o.trim = CV.trim || '#2fae8f'; o.motif = 1;
      // (a woman: the huipil — a loose blouse with its woven panel — over the cueitl, a wrapped skirt of a dyed cotton; a man:
      // the maxtlatl, the loincloth, and the tilmatli knotted over the shoulder)
      if (fem) { o.skirt = 'saiaL'; o.topM = 'bata'; o.overK = 3; o.over = ['#3a5a7a', '#8a3a2a', '#e8dcc0', '#4a6a3a', '#6a4a7a'][Math.floor(hh(31) * 5)]; o.sleeve = 0.18; o.hairM = hh(26) < 0.6 ? 'trancas' : 'longo'; }
      else { o.skirt = 'tanga'; o.torso = 1; o.cloakM = 'capa'; o.cloak = mixHex('#e8dcc0', base, 0.5); o.hairM = 'chanel'; }
    }
    // (the trades: the robe of the priest and the elder, the scribe's; aprons; the hats)
    if (!kid) {
      // (the robe is of the trade's wool — a woman of the north takes off her apron-dress for it, not down to her linen)
      const south = civ === 'romano' || civ === 'grego';
      if (role === 'sacerdote' || role === 'anciao' || role === 'escriba') { if (o.overK === 1) o.cloth = o.over; o.skirt = 'saiaL'; o.legs = 0; o.overK = 0; o.topM = null; o.sleeve = 0.585; if (role === 'anciao') o.cloakM = south && !fem ? 'toga' : 'capa'; if (role === 'sacerdote' && civ !== 'egipcio') { if (south) o.hatM = 'louro', o.hat = '#4a6a2a'; else o.hatM = hh(27) < 0.5 ? 'capuz' : null, o.cloak = o.cloth; } }
      if (role === 'ferreiro' || role === 'acougueiro' || role === 'taverneiro' || role === 'oleiro' || role === 'feirante') { o.overK = 2; o.over = role === 'ferreiro' ? '#5a3a24' : role === 'oleiro' ? '#b8946a' : '#e8e0cc'; o.sleeve = role === 'ferreiro' ? 0.2 : 0.42; }
      if (role === 'agricultor' || role === 'pastor' || role === 'vinhateiro' || role === 'lavrador') { o.hatM = 'chapeu'; o.hat = '#d8b86a'; o.sleeve = 0.4; }
      if (role === 'cacador' && hh(28) < 0.5) { o.hatM = 'capuz'; o.cloak = wool('#5a4a2a'); }
      // (the warriors' helmets: the crested galea of the south — its crest of red horsehair —, a lord's feathers in the jungle,
      // none on the Nile, the iron helmet of the north)
      if (role === 'guerreiro') { o.hatM = south || civ === 'classico' ? 'galea' : civ === 'asteca' ? (wealth >= 2 ? 'penacho' : null) : civ === 'egipcio' ? null : 'elmo'; o.hat = civ === 'grego' ? METAL.bronze : METAL.iron; if (o.hatM === 'galea') o.trim = '#8a2418'; o.cloth = wool(base); o.cloakM = civ === 'asteca' ? o.cloakM : wealth >= 2 || hh(29) < 0.4 ? 'capa' : o.cloakM; o.bootTop = south || civ === 'asteca' || civ === 'egipcio' ? 0 : 0.22; }
      if (role === 'pescador') { o.hatM = civ === 'nordico' ? 'gorro' : 'chapeu'; o.hat = civ === 'nordico' ? wool('#5a5a4a') : '#d8b86a'; o.sleeve = 0.3; }
      if (role === 'contrabandista') { o.cloakM = 'capa'; o.hatM = 'capuz'; o.cloak = '#2a2430'; }
      if (role === 'mercador' || role === 'ourives') { o.cloakM = 'capa'; o.motif = 1; }
    }
    if (v.robe && !v.hood) { o.cloakM = 'capa'; o.cloak = v.robe; o.hatM = v.unmask ? o.hatM : 'capuz'; }
    // (a ruler: the crown and the cloak of the people's colour — the laurel of gold and a toga of purple in the south, the nemes
    // on the Nile with the bare chest and its collar, the feathers and the turquoise cloak of the jungle)
    if (ruler && ad >= 10) { o.hatM = 'coroa'; o.cloakM = 'capa'; o.cloak = wool(darker(fac && G.Fac.hex ? G.Fac.hex(fac.id) : '#8a2a2a', 0.85)); o.metal = METAL.gold; o.motif = 1; o.cloakTrim = 1;
      if (civ === 'romano' || civ === 'grego') { o.hatM = 'louro'; o.hat = '#c8a040'; if (!fem) o.cloakM = 'toga', o.cloak = civ === 'romano' ? '#5a2048' : o.cloak; }
      else if (civ === 'egipcio') { o.hatM = 'nemes'; o.cloakM = null; if (!fem) o.torso = 2; }
      else if (civ === 'asteca') { o.hatM = 'penacho'; o.cloak = '#2f7a8a'; } }
    if (v.captive) { o.cloakM = null; o.hatM = null; o.motif = 0; o.overK = 0; o.feetK = 1; o.trim = o.cloth; o.belt = '#6a5a4a'; o.cloakTrim = 0; }
    // (what the clothes are made of: wool in the north and on soldiers, linen and cotton in the south, on the Nile and in the
    // jungle — a northern woman's dress of linen under her apron-dress of wool; an apron of leather on the smith)
    o.fab = (civ === 'nordico' && !(fem && o.overK === 1)) || role === 'guerreiro' ? 1 : 2; o.fabO = o.overK === 2 ? (role === 'ferreiro' ? 3 : 2) : o.overK === 3 ? 2 : 1;
    // (a northern cloak has a collar of fur — white on a ruler's —; every other cloak, a collar of its own cloth)
    o.fur = o.cloakM === 'capa' && civ === 'nordico' && !v.robe ? (ruler ? 2 : 1) : 0;
    // (nobody naked: the hips always under a skirt, a kilt or trousers — and no cloth the colour of its wearer's skin: a linen
    // as pale as the skin is dyed a little darker, until it reads as cloth; Body3D.bare is the verifier's own rule)
    if (!o.skirt && !(o.legs >= 1)) o.skirt = 'saiaC';
    const linOf = () => { o.lin = {}; for (const k of ['cloth', 'trim', 'pants', 'boots', 'belt', 'metal', 'over', 'beads', 'cloak', 'hat', 'iris', 'lips']) { const c = color(o[k]); o.lin[k] = [c.r, c.g, c.b]; } };
    linOf(); // (the colours once, as the graphics card wants them: linear)
    for (let k = 0; k < 3 && G.Body3D && G.Body3D.bare && G.Body3D.bare(o, L.skin); k++) { for (const q of ['cloth', 'over', 'pants']) o[q] = mixHex(o[q], '#5a4030', 0.3); linOf(); }
    OUT.set(id, o); if (OUT.size > 2000) OUT.clear();
    return o;
  }
  P3.outfit = v => outfitOf(v, P3.look(v), G.Fac.ofV ? G.Fac.ofV(v) : null);
  // (who carries a torch: the god's own rule — at night, walking, one in three grown people, those whose errand asks for one,
  // and those the scenes hand one to; and the body, at night, always: the player has to see)
  function torchOf(v) {
    if (v.inside || v.sleeping) return false; if (v.holdTorch) return true;
    if (G.Render.nightness() <= 0.5) return false;
    if (G.Possess && G.Possess.body && G.Possess.body() === v) return true;
    return !!(v.moving && v.age >= 14 && ((v.task && v.task.torch) || v.id % 3 === 0));
  }

  // ------------------------------ poses ------------------------------
  // a pose: the angles of the joints, and the hips' height and lean (radians, metres)
  // (and for the skin: the stance of each foot, the grip of the hands, the mouth, the eyes' look, the cloth's swing)
  const POSE0 = () => ({ bob: 0, crouch: 0, lean: 0, twist: 0, neck: 0, shLp: 0, shLr: 0, shRp: 0, shRr: 0, elL: 0.15, elR: 0.15, hipL: 0, hipR: 0, knL: 0.05, knR: 0.05, anL: 0, anR: 0, pelY: 0, pelR: 0, pelP: 0, shift: 0, sway: 0, breath: 0, lie: 0, tool: 0, stL: 0, stR: 0, pitL: 0, pitR: 0, grip: 0, talk: 0, gazeX: 0, gazeY: 0, cloth: 0, clothS: 0, clothB: 0, clothV: 0, wrist: 0 });
  Anim.POSE0 = POSE0;
  // (the dead lie as they fell: on the back or face down, the limbs thrown out)
  const DEAD = [
    Object.assign(POSE0(), { lie: 1, hipL: 0.35, hipR: -0.25, knL: 0.3, knR: 0.6, shLp: -1.7, shRp: 0.5, shLr: 0.7, shRr: -0.6, elL: 0.4, elR: 0.2, neck: 0.3 }),
    Object.assign(POSE0(), { lie: 1, prone: 1, hipL: -0.2, hipR: 0.3, knL: 0.9, knR: 0.2, shLp: -2.6, shRp: -0.4, shLr: 0.3, shRr: -1.0, elL: 0.6, elR: 0.9, neck: -0.4 }),
    Object.assign(POSE0(), { lie: 1, hipL: -0.6, hipR: -0.1, knL: 1.2, knR: 0.1, shLp: 0.3, shRp: -1.2, shLr: 1.2, shRr: -0.3, elL: 1.4, elR: 0.3, neck: 0.5 }),
  ];
  // every state: a function of its own clock and of the speed (m/s) → the pose it wants
  const ST = {
    // (standing: breathing, the weight shifting from one leg to the other now and then, a look round)
    // (standing: breathing in the chest, the weight passed from one leg to the other now and then — the hip dropping on the
    // free side, its knee easing — the arms hanging and swaying a little, a look round)
    idle: (t) => { const ws = Math.sin(t * 0.21), w = G.smooth(0.15, 0.55, Math.abs(ws)) * Math.sign(ws), br = Math.sin(t * 1.7);
      return { bob: br * 0.006 - Math.abs(w) * 0.012, breath: br, shLp: 0.04 + br * 0.015, shRp: 0.04 - br * 0.01, shLr: 0.09 + br * 0.01, shRr: -0.09 - br * 0.01, elL: 0.18, elR: 0.2, neck: Math.sin(t * 0.4) * 0.05, sway: w * 0.05, shift: w * 0.03, twist: Math.sin(t * 0.13) * 0.14, knL: 0.05 + Math.max(0, -w) * 0.22, knR: 0.05 + Math.max(0, w) * 0.22, hipL: Math.max(0, -w) * -0.08, hipR: Math.max(0, w) * -0.08, anL: Math.max(0, -w) * 0.1, anR: Math.max(0, w) * 0.1, pelR: -w * 0.04 }; },
    // (a walk: the pelvis lowest when the legs are apart and highest over the standing leg, turning with the leg that
    // swings and dropping a little on its side; the shoulders turning the other way, the head kept still; the knee bent
    // in the swing and giving at the heel's strike; the heel striking with the toes up, the toes pushing off at the end;
    // the arms swinging against the legs, a beat behind, the elbow bending as it comes forward)
    walk: (t, sp) => gait(t, sp, false),
    // (a run: a flight between the steps — highest in the air, lowest over the bent standing leg — the heel kicked up
    // behind, the trunk leaning in, the elbows bent and pumping)
    run: (t, sp) => gait(t, sp, true),
    sneak: (t, sp) => { const ph = t, A = 0.35; return { crouch: 0.2, lean: 0.45, hipL: Math.sin(ph) * A - 0.3, hipR: -Math.sin(ph) * A - 0.3, knL: 0.7 + Math.max(0, -Math.cos(ph)) * 0.5, knR: 0.7 + Math.max(0, Math.cos(ph)) * 0.5, shLp: -0.5, shRp: -0.4, elL: 0.9, elR: 0.9 }; },
    jump: () => ({ hipL: -0.9, hipR: -0.3, knL: 1.4, knR: 0.6, shLp: -2.4, shRp: -2.2, shLr: 0.3, shRr: -0.3, elL: 0.3, elR: 0.3, lean: -0.05 }),
    fall: (t) => ({ hipL: -0.25, hipR: 0.15, knL: 0.5, knR: 0.35, shLp: -0.4, shRp: -0.4, shLr: 1.1 + Math.sin(t * 9) * 0.1, shRr: -1.1 - Math.sin(t * 9) * 0.1, elL: 0.4, elR: 0.4, neck: -0.15 }),
    land: () => ({ crouch: 0.28, lean: 0.35, hipL: -0.8, hipR: -0.8, knL: 1.5, knR: 1.5, shLp: -0.6, shRp: -0.6, elL: 0.6, elR: 0.6 }),
    // (a swing: the tool raised over the head, the wrist cocked back; brought down, the wrist turning it forward to strike)
    swing: (t) => { const k = (Math.sin(t * 5.5) + 1) / 2; return { shRp: -2.7 + k * 2.2, shLp: -2.4 + k * 2, elR: 0.3, elL: 0.4, lean: k * 0.35, hipL: -0.15, hipR: 0.2, knL: 0.2, knR: 0.1, tool: 1, wrist: -0.5 + 2.0 * Math.pow(k, 1.5), grip: 1 }; },
    low: (t) => ({ crouch: 0.32, lean: 0.95, hipL: -1.0, hipR: -0.8, knL: 1.3, knR: 1.1, shLp: -1.0 + Math.sin(t * 3) * 0.25, shRp: -1.1 - Math.sin(t * 3) * 0.25, elL: 0.3, elR: 0.3, neck: 0.3 }),
    carry: (t) => ({ ...ST.idle(t), shLp: -0.95, shRp: -0.95, shLr: 0.25, shRr: -0.25, elL: 0.95, elR: 0.95 }),
    carryWalk: (t, sp) => ({ ...ST.walk(t, sp), shLp: -0.95, shRp: -0.95, shLr: 0.25, shRr: -0.25, elL: 0.95, elR: 0.95 }),
    pray: (t) => ({ crouch: 0.45, hipL: -0.1, hipR: -0.1, knL: 1.65, knR: 1.65, shLp: -2.6 + Math.sin(t * 1.2) * 0.15, shRp: -2.6 + Math.sin(t * 1.2) * 0.15, shLr: 0.3, shRr: -0.3, elL: 0.2, elR: 0.2, neck: -0.3, lean: -0.05 }),
    sit: (t) => ({ crouch: 0.46, hipL: -1.5, hipR: -1.5, knL: 1.5, knR: 1.5, shLp: -0.5, shRp: -0.5 + Math.sin(t * 2) * 0.1, elL: 0.8, elR: 0.9, lean: 0.1 }),
    talk: (t) => ({ ...ST.idle(t), shRp: -0.5 - Math.max(0, Math.sin(t * 2.6)) * 0.6, shRr: -0.25, elR: 0.9 + Math.sin(t * 3.3) * 0.3, twist: Math.sin(t * 1.1) * 0.08, neck: Math.sin(t * 2.2) * 0.08, talk: Math.max(0, Math.sin(t * 9.0) * Math.sin(t * 2.3 + 1)) * 0.8 }),
    dance: (t) => ({ bob: Math.abs(Math.sin(t * 4)) * 0.09, twist: Math.sin(t * 2) * 0.35, shLp: -2.4 + Math.sin(t * 4) * 0.5, shRp: -2.4 - Math.sin(t * 4) * 0.5, shLr: 0.5, shRr: -0.5, elL: 0.6, elR: 0.6, hipL: Math.sin(t * 4) * 0.3, hipR: -Math.sin(t * 4) * 0.3, knL: 0.3, knR: 0.3 }),
    mourn: (t) => ({ neck: 0.65, lean: 0.25, shLp: -0.6, shRp: -0.6, shLr: 0.35, shRr: -0.35, elL: 1.7, elR: 1.7, bob: Math.sin(t * 5) * 0.006 }),
    hug: () => ({ shLp: -1.35, shRp: -1.35, shLr: -0.5, shRr: 0.5, elL: 1.0, elR: 1.0, lean: 0.12 }),
    sleep: () => ({ lie: 1, hipL: 0.1, hipR: -0.05, knL: 0.25, knR: 0.1, shLp: 0.2, shRp: -0.1, elL: 0.6, elR: 0.3 }),
    // (in the water: a stroke with the head out — the arms reaching and pulling in turn, the body rolling with them, the
    // legs kicking twice to a stroke; treading water upright, the hands sculling and the legs pedalling; out of breath,
    // the arms beating at the water and the head thrown back)
    swim: (t) => { const a = Math.sin(t), c = Math.cos(t), kk = Math.sin(t * 2); return { lie: 0.8, prone: 1, neck: -0.6, twist: a * 0.2, shLp: -Math.PI + a * 1.45, shRp: -Math.PI - a * 1.45, shLr: 0.3 + Math.max(0, c) * 0.35, shRr: -0.3 - Math.max(0, -c) * 0.35, elL: 0.3 + Math.max(0, -a) * 0.9, elR: 0.3 + Math.max(0, a) * 0.9, hipL: kk * 0.3, hipR: -kk * 0.3, knL: 0.2 + Math.max(0, kk) * 0.35, knR: 0.2 + Math.max(0, -kk) * 0.35 }; },
    tread: (t) => { const a = Math.sin(t * 2), p = Math.sin(t * 1.6), q = Math.cos(t * 1.6); return { bob: a * 0.025, neck: -0.12, shLp: -0.4, shRp: -0.4, shLr: 0.95 + a * 0.35, shRr: -0.95 - a * 0.35, elL: 0.6 + Math.sin(t * 2 + 1) * 0.3, elR: 0.6 + Math.sin(t * 2 + 1) * 0.3, hipL: -0.55 + p * 0.45, hipR: -0.55 - p * 0.45, knL: 0.9 + q * 0.5, knR: 0.9 - q * 0.5, lean: 0.1 }; },
    drown: (t) => ({ lie: 0.12, neck: -0.7, lean: -0.15, shLp: -2.7 + Math.sin(t * 1.7) * 0.7, shRp: -2.5 - Math.sin(t * 2.1) * 0.8, shLr: 0.55 + Math.sin(t * 2.6) * 0.3, shRr: -0.55 - Math.sin(t * 2.3) * 0.3, elL: 0.5 + Math.abs(Math.sin(t * 1.3)) * 0.8, elR: 0.5 + Math.abs(Math.cos(t * 1.5)) * 0.8, hipL: -0.6 + Math.sin(t * 2.4) * 0.5, hipR: -0.6 - Math.sin(t * 2.4) * 0.5, knL: 1.0, knR: 0.8 }),
    throw: (t) => { const k = (t * 1.6) % 1; return { shRp: -2.8 + k * 3, elR: 0.4, shLp: -0.6, lean: k * 0.3 - 0.1, twist: -0.4 + k * 0.6 }; },
    bound: () => ({ shLp: 0.55, shRp: 0.55, shLr: -0.35, shRr: 0.35, elL: 1.2, elR: 1.2, neck: 0.25 }),
    interact: (t) => ({ ...ST.idle(t), shRp: -1.35, shRr: -0.1, elR: 0.25, lean: 0.12 }),
    fight: (t) => ({ ...ST.swing(t), crouch: 0.08, hipL: -0.35, hipR: 0.35, knL: 0.45, knR: 0.25, tool: 1 }),
    // (turning on the spot: small steps in place, the body leading)
    turn: (t) => ({ hipL: Math.sin(t) * 0.2, hipR: -Math.sin(t) * 0.2, knL: Math.max(0, -Math.cos(t)) * 0.4 + 0.08, knR: Math.max(0, Math.cos(t)) * 0.4 + 0.08, shLp: 0.05, shRp: 0.05, shLr: 0.08, shRr: -0.08, elL: 0.22, elR: 0.22, twist: 0.14 }),
    // (sitting on the ground, the knees up and the arms round them; climbing a ledge: the hands up to the edge, then
    // pushing down on it as the knee comes over — its clock is how far up it is, 0 to 1; a wave of the hand)
    rest: (t) => ({ crouch: 0.82, hipL: -1.45, hipR: -1.35, knL: 1.95, knR: 1.85, shLp: -0.75, shRp: -0.7, shLr: 0.15, shRr: -0.15, elL: 1.05, elR: 1.0, lean: 0.12 + Math.sin(t * 1.3) * 0.015, neck: Math.sin(t * 0.37) * 0.08 }),
    climb: (u) => { const a = G.clamp(u * 1.8, 0, 1), k = G.clamp((u - 0.4) * 1.8, 0, 1); return { shLp: -2.85 + k * 2.3, shRp: -2.85 + k * 2.3, shLr: 0.22, shRr: -0.22, elL: 0.35 + a * 0.5 - k * 0.5, elR: 0.35 + a * 0.5 - k * 0.5, hipL: -1.3 * a + k * 1.0, hipR: -0.35 * a + k * 0.25, knL: 1.7 * a - k * 1.4, knR: 0.6 * a - k * 0.4, lean: 0.3 + a * 0.15 - k * 0.2, crouch: 0.12 * a * (1 - k) }; },
    wave: (t) => ({ ...ST.idle(t), shRp: -2.55, shRr: -0.55 + Math.sin(t * 9) * 0.3, elR: 0.5 + Math.sin(t * 9) * 0.25, neck: -0.05 }),
    // (wading through a ford: arms out for balance, the steps high)
    wade: (t, sp) => ({ ...ST.walk(t, sp), shLr: 0.5, shRr: -0.5, elL: 0.55, elR: 0.55, lean: 0.12, knL: Math.max(0, -Math.cos(t)) * 0.9 + 0.15, knR: Math.max(0, Math.cos(t)) * 0.9 + 0.15 }),
  };
  // The stride, from how people really walk and run: one leg's cycle u from the heel striking the ground (0) — the foot
  // planted, the body going over it, the heel rising, the toes pushing off — through the swing (the knee folding to clear
  // the ground, the leg reaching forward, the knee straightening only at the end) to the next strike. The other leg half
  // a cycle behind. Keys in degrees (the hip: minus is forward; the knee: its bend; the foot: its pitch to the ground,
  // plus is the toes down — the ankle is what makes it), smoothly joined round the cycle. A walk stands 60% of its cycle,
  // a run 38% and flies between its steps. A slower step is a shorter one (the angles scale), never a slower slide.
  const GK = {
    walk: { hip: [[0, -27], [0.15, -20], [0.3, -7], [0.45, 7], [0.58, 15], [0.66, 10], [0.78, -12], [0.9, -29], [1, -27]],
      knee: [[0, 3], [0.12, 16], [0.27, 9], [0.42, 4], [0.52, 13], [0.62, 36], [0.71, 60], [0.79, 56], [0.9, 24], [0.97, 4], [1, 3]],
      foot: [[0, -16], [0.06, -4], [0.12, 0], [0.42, 0], [0.52, 9], [0.6, 30], [0.66, 30], [0.74, 4], [0.86, -6], [0.95, -14], [1, -16]] },
    run: { hip: [[0, -30], [0.12, -15], [0.26, 4], [0.38, 19], [0.5, 10], [0.66, -26], [0.82, -44], [0.93, -36], [1, -30]],
      knee: [[0, 22], [0.11, 40], [0.25, 26], [0.38, 14], [0.5, 62], [0.62, 104], [0.74, 96], [0.86, 52], [0.95, 26], [1, 22]],
      foot: [[0, -6], [0.08, 0], [0.22, 4], [0.32, 18], [0.4, 44], [0.5, 32], [0.66, 6], [0.84, -8], [1, -6]] },
  };
  const GT = {}; // (each curve sampled round its cycle, radians)
  for (const g in GK) { GT[g] = {}; for (const c in GK[g]) { const K = GK[g][c]; const T = new Float32Array(129);
    for (let i = 0; i <= 128; i++) { const u = i / 128; let k = 0; while (k < K.length - 2 && K[k + 1][0] <= u) k++;
      const P = j => K[(j + K.length - 1) % (K.length - 1)]; const p0 = P(k - 1), p1 = K[k], p2 = K[k + 1], p3 = P(k + 2);
      const t = (u - p1[0]) / Math.max(1e-6, p2[0] - p1[0]); const t2 = t * t, t3 = t2 * t;
      T[i] = (0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)) * Math.PI / 180; }
    GT[g][c] = T; } }
  const gcur = (T, u) => { u = (u % 1 + 1) % 1; const x = u * 128, i = Math.floor(x), f = x - i; return T[i] + (T[i + 1] - T[i]) * f; };
  function gait(ph, sp, run) {
    const T = run ? GT.run : GT.walk;
    // (how long the stride is: a slow walk short and low, a fast run long; the swing's fold never below what clears the ground)
    const A = run ? G.clamp(0.62 + (sp - 3) * 0.1, 0.62, 1.0) : G.clamp(0.2 + sp * 0.45, 0.34, 0.95);
    const u0 = ph / TAU; const out = {};
    for (let k = 0; k < 2; k++) {
      const u = u0 + k * 0.5; const hip = gcur(T.hip, u) * A, kn = gcur(T.knee, u) * (0.45 + 0.55 * A), pitch = gcur(T.foot, u) * (0.6 + 0.4 * A);
      // (the stance weight: 1 while the foot is on the ground — for the skin's feet; it eases at the strike and at the push-off)
      const uu = (u % 1 + 1) % 1, st = run ? (uu < 0.38 ? 1 : 0) : (uu < 0.62 ? 1 : 0);
      if (k) { out.hipR = hip; out.knR = kn; out.anR = pitch - hip - kn; out.stR = st; out.pitR = pitch; } else { out.hipL = hip; out.knL = kn; out.anL = pitch - hip - kn; out.stL = st; out.pitL = pitch; }
    }
    // (the hips: as high as the standing foot lets them be — measured from the legs themselves, so the standing foot is on
    // the ground and no lower: highest over it, lowest as the weight passes from one foot to the other; in a run's flight a
    // leap's arc — then turning with the swinging leg, dropping a little on its side, moving over the standing foot)
    const c2 = Math.cos(TAU * 2 * (u0 - (run ? 0.42 : 0.27))), cs = Math.cos(TAU * u0), sn = Math.sin(TAU * u0 + 0.3);
    out.bob = gaitBob ? gaitBob(run ? 'run' : 'walk', u0, sp) : 0;
    out.pelY = -(run ? 0.1 : 0.075) * cs * A; out.pelR = 0.035 * sn * (run ? 0.6 : 1) * A; out.shift = 0.02 * sn * (run ? 0.4 : 1) * A; out.sway = 0; out.twist = 0;
    // (the arms against the legs, a beat behind; the elbow bending as the arm comes forward; a run's elbows bent and pumping)
    const aL = Math.cos(TAU * (u0 - 0.06)), aw = (run ? 0.62 : 0.34) * A;
    const ab = run ? 0.3 : 0.06; // (the swing centred a little behind: the trunk leans, the arms still hang from the shoulders)
    out.shLp = aL * aw + ab; out.shRp = -aL * aw + ab; out.shLr = run ? 0.14 : 0.09; out.shRr = run ? -0.14 : -0.09;
    out.elL = run ? 1.35 + Math.max(0, -aL) * 0.25 : 0.22 + Math.max(0, -aL) * 0.45 * A; out.elR = run ? 1.35 + Math.max(0, aL) * 0.25 : 0.22 + Math.max(0, aL) * 0.45 * A;
    out.lean = run ? 0.22 + 0.05 * A : 0.06 + 0.012 * c2; out.pelP = run ? 0.1 : 0.03; out.neck = run ? -0.14 : 0.03; out.breath = Math.sin(ph * 0.5) * (run ? 1 : 0.4);
    out.grip = run ? 0.55 : 0.12;
    return out;
  }
  // the hips' height through a stride, for each speed: in each moment of it, the height at which the standing foot (the
  // lower of the two, when both stand) touches the ground — the legs' own reach; smoothed round the cycle (a table made
  // once, from the rig: the legs are what they are, the hips follow)
  const BOBT = {}; let gaitBob = null;
  function bobTable(g, sp) {
    const N = 64, out = new Float32Array(N + 1), need = new Float32Array(N), has = new Uint8Array(N); const p = POSE0(); const run = g === 'run';
    const save = gaitBob; gaitBob = null;
    for (let i = 0; i < N; i++) {
      Object.assign(p, gait(i / N * TAU, sp, run)); const R = P3.rig(0, 0, 0, Math.PI / 2, p, { s: 1 });
      let lift = 1e9;
      for (let k = 0; k < 2; k++) { if (!(k ? p.stR : p.stL)) continue; const F = R[B.ftL + k]; const lo = Math.min(ptY(F, 0, -LEG.sole, -LEG.heel), ptY(F, 0, -LEG.sole, LEG.ball)); lift = Math.min(lift, -lo); has[i] = 1; }
      need[i] = lift;
    }
    gaitBob = save;
    // (no foot on the ground — a run's flight: an arc from the push-off's height to the next strike's, rising over it)
    for (let i = 0; i < N; i++) if (!has[i]) {
      let a = i, b = i; while (!has[(a + N - 1) % N] && a > i - N) a--; while (!has[(b + 1) % N] && b < i + N) b++;
      const ha = need[(a - 1 + N) % N], hb = need[(b + 1) % N], t = (i - a + 1) / (b - a + 2);
      need[i] = G.lerp(ha, hb, t) + 0.035 * Math.sin(Math.PI * t) * G.clamp(sp / 4, 0.5, 1.4);
    }
    for (let i = 0; i < N; i++) { let v = 0; for (let d = -2; d <= 2; d++) v += need[(i + d + N) % N] * [0.1, 0.2, 0.4, 0.2, 0.1][d + 2]; out[i] = v; }
    out[N] = out[0]; return out;
  }
  gaitBob = function (g, u, sp) {
    const X = RATE_SP[g]; let T = BOBT[g]; if (!T) { if (!THREE) return 0; T = BOBT[g] = X.map(v => bobTable(g, v)); }
    let j = 0; while (j < X.length - 2 && X[j + 1] < sp) j++; const f = G.clamp((sp - X[j]) / (X[j + 1] - X[j]), 0, 1);
    u = (u % 1 + 1) % 1; const x = u * 64, i = Math.floor(x), q = x - i; const at = t => t[i] + (t[i + 1] - t[i]) * q;
    return G.lerp(at(T[j]), at(T[j + 1]), f);
  };
  Anim.STATES = Object.keys(ST);
  // what someone of the world is doing, as an animation (their act, their move, their burden)
  const ACT = {
    chop: 'swing', mine: 'swing', hammer: 'swing', build: 'swing', forge: 'swing', dig: 'swing', stab: 'fight', beat: 'swing', fight: 'fight', brandish: 'fight', cut: 'swing', butcher: 'swing', skin: 'low', mend: 'low', craft: 'low', shear: 'low', drill: 'talk',
    pick: 'low', gather: 'low', plant: 'low', harvest: 'low', rake: 'swing', fill: 'low', feed: 'low', milk: 'low', catch: 'low', salt: 'low', sweep: 'low', weave: 'sit', pottery: 'sit', fish: 'interact', reel: 'interact',
    haul: 'carry', lift: 'carry', drag: 'carry', hold: 'carry', pray: 'pray', kneel: 'pray', swear: 'pray', beg: 'pray', weepk: 'pray',
    sit: 'sit', sittalk: 'sit', story: 'sit', read: 'sit', write: 'sit', eat: 'sit', drink: 'talk', listen: 'talk',
    talk: 'talk', chat: 'talk', call: 'talk', shout: 'talk', wave: 'talk', point: 'talk', question: 'talk', sell: 'talk', buy: 'talk', serve: 'talk',
    dance: 'dance', joy: 'dance', play: 'dance', mourn: 'mourn', weep: 'mourn', sad: 'mourn', cower: 'mourn', sick: 'mourn',
    hug: 'hug', embrace: 'hug', sleep: 'sleep', zzz: 'sleep', throw: 'throw', swim: 'swim', dive: 'swim', bound: 'bound', sneak: 'sneak', run: 'run', climb: 'interact', knock: 'interact', look: 'idle',
  };
  // the state an NPC is in: from the world, every frame
  Anim.stateOf = function (v, sp) {
    if (v.task && v.task.type === 'swim') return 'swim';
    if (v.sleeping) return 'sleep';
    if (sp > 0.25) { if (v.act === 'sneak') return 'sneak'; if (v.carry && v.carry.n > 0) return 'carryWalk'; return sp > 3.1 || v.act === 'run' ? 'run' : 'walk'; }
    if (v.downT && v.downT > G.S.clock) return 'sleep';
    const a = ACT[v.act]; if (a && a !== 'run') return a;
    if (v.carry && v.carry.n > 0) return 'carry';
    return 'idle';
  };
  // blending: every joint eases toward the wanted pose (a quick spring: no snapping, no lag you can see)
  Anim.blend = function (pose, want, dt, rate) {
    const k = 1 - Math.exp(-(rate || 12) * dt);
    for (const j in want) { if (j === 'tool') { pose.tool = want.tool; continue; } pose[j] += (want[j] - pose[j]) * k; }
    for (const j in pose) if (!(j in want) && j !== 'tool' && j !== 'lookY' && j !== 'blink') pose[j] += ((j === 'elL' || j === 'elR' ? 0.15 : j === 'knL' || j === 'knR' ? 0.05 : 0) - pose[j]) * k; // (the look and the blink have their own clocks)
    if (!('tool' in want)) pose.tool = 0;
  };
  Anim.pose = (state, t, sp) => (ST[state] || ST.idle)(t, sp || 0);
  // the gait's rate: radians of its phase per metre walked, so that the standing foot keeps still on the ground at any
  // speed. Measured once from the rig itself (how far back the lower foot goes per radian of the stride, the legs' own
  // angles at each speed): a change to a gait stays in step without a number to retune
  const RATE = {}; const RATE_SP = { walk: [0.3, 0.6, 0.9, 1.2, 1.5, 1.9, 2.4, 3.1], run: [2.4, 3.1, 4, 5, 6, 7.5, 9], sneak: [0.3, 0.6, 1, 1.5, 2.2] };
  const GAIT_OF = { walk: 'walk', carryWalk: 'walk', wade: 'walk', run: 'run' };
  // (metres walked per radian of the stride: the heel strikes at the start of the stance and the foot rolls onto its
  // ball, which leaves the ground at its end — the body must have gone, meanwhile, from over the one to over the other)
  const STANCE = { walk: 0.62, run: 0.38, sneak: 0.62 };
  function strideOf(st, sp) {
    const p = POSE0(); const zAt = (u, heel) => { Object.assign(p, ST[st](u * TAU, sp)); const e = P3.rig(0, 0, 0, Math.PI / 2, p, { s: 1 })[B.ftL].elements; return heel ? e[14] - e[6] * LEG.sole - e[10] * LEG.heel : e[14] - e[6] * LEG.sole + e[10] * LEG.ball; };
    const f = STANCE[st] || 0.6; const went = zAt(0, true) + LEG.heel + LEG.ball - zAt(f, false);
    return went > 0.05 ? went / (f * TAU) : 0.2;
  }
  Anim.rate = function (st, sp, s) {
    const g = GAIT_OF[st]; if (!g || !THREE) return 2.6;
    let T = RATE[g]; if (!T) { T = RATE[g] = RATE_SP[g].map(v => strideOf(g, v)); }
    const X = RATE_SP[g]; let per;
    if (sp <= X[0]) per = T[0]; else if (sp >= X[X.length - 1]) per = T[T.length - 1];
    else { let k = 1; while (X[k] < sp) k++; per = G.lerp(T[k - 1], T[k], (sp - X[k - 1]) / (X[k] - X[k - 1])); }
    return 1 / Math.max(0.03, per * (s || 1));
  };

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
      if (sd < 0) { if (pose.tool || L.tool) put('tool', idx, F.hd, 0, 0, 0, pose.tool ? -Math.PI / 2 : 0, 0, 0, 0, pose.tool ? 0.3 : -0.25, 0, 0.04, 0.95, 0.04, '#7a5a3a'); else hide('tool', idx); }
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
    if (L.carry) put('carry', idx, F.trunk, 0, 0.3, 0.26, 0, 0, 0, 0, 0, 0, 0.34, 0.26, 0.3, '#9a7a4a'); else hide('carry', idx);
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
  // where a foot must be. A foot in a stride is in one of three states: swinging (where the pose has it — kept out of the
  // ground), standing (from the moment it strikes: it stays where its heel struck, and rolls on it — on the heel while
  // the toes come down, flat, then on the ball as the heel rises and the toes push off — the ankle where that roll puts
  // it), or leaving (pushed off: from where it stood it goes after the swing the pose has, as it lifts)
  function footFK(R, pose, k, out) {
    const sd = k ? -1 : 1; const hp = k ? pose.hipR : pose.hipL, kn = k ? pose.knR : pose.knL, an = (k ? pose.anR : pose.anL) || 0;
    fr(M.a, R[B.pel], sd * 0.095, -0.04, 0, hp, 0, 0); fr(M.c2, M.a, 0, -LEG.L1, 0, kn, 0, 0); return fr(out, M.c2, 0, -RIG.shin, 0.02, an, 0, 0);
  }
  function strike(ft, e) { ft.on = 1; ft.x = e[12] - (e[4] * LEG.sole + e[8] * LEG.heel); ft.z = e[14] - (e[6] * LEG.sole + e[10] * LEG.heel); const l = Math.hypot(e[8], e[10]) || 1; ft.dx = e[8] / l; ft.dz = e[10] / l; ft.off = 0; }
  function footWant(R, pose, L, k, s) {
    const ft = L.plant ? L.plant[k] : null; if (!ft) return null; const stw = (k ? pose.stR : pose.stL) || 0;
    const e = footFK(R, pose, k, M.a).elements; const p = (k ? pose.pitR : pose.pitL) || 0; const T = M.t[k];
    if (ft.on) {
      if (stw > 0.5) ft.early = 0;
      // (the push-off: the stride's stance is over — unless the strike came early, before it began)
      if (stw <= 0.5 && !ft.early) { ft.on = 0; ft.off = 1; ft.rx = ft.ax; ft.ry = ft.ay; ft.rz = ft.az; ft.rp = ft.ap; }
    } else if (stw > 0.5 && !ft.off) strike(ft, e);
    if (ft.on) {
      const c = Math.cos(p), sn = Math.sin(p); let px = ft.x, pz = ft.z, oy, oz;
      if (p <= 0) { oy = LEG.sole * c - LEG.heel * sn; oz = LEG.sole * sn + LEG.heel * c; }
      else { const bl = (LEG.heel + LEG.ball) * s; px += ft.dx * bl; pz += ft.dz * bl; oy = LEG.sole * c + LEG.ball * sn; oz = LEG.sole * sn - LEG.ball * c; }
      T.set(px + ft.dx * oz * s, L.ground + oy * s, pz + ft.dz * oz * s);
      // (the body went too far from it — a turn on the spot, a push of the world: the foot lifts where it is)
      if ((T.x - e[12]) ** 2 + (T.z - e[14]) ** 2 > 0.36 * s * s) { ft.on = 0; ft.off = 0; return null; }
      ft.ax = T.x; ft.ay = T.y; ft.az = T.z; ft.ap = p;
      return { T, p, w: 1 };
    }
    if (ft.off) {
      // (leaving: from the push-off's place toward the swing, as the stance weight runs out)
      const r = G.smooth(0, 1, 1 - stw / 0.5); if (r >= 0.999 || stw > 0.5) { ft.off = 0; return null; }
      T.set(G.lerp(ft.rx, e[12], r), Math.max(G.lerp(ft.ry, e[13], r), L.ground + LEG.sole * s), G.lerp(ft.rz, e[14], r));
      return { T, p: G.lerp(ft.rp, p, r), w: 1, leaving: 1 };
    }
    return null;
  }
  // (how much lower the hips must be for the leg to reach T: 0 if it does; -1 if no lowering would do)
  function dropFor(R, T) {
    M.k.copy(R[B.pel]).invert(); M.v.copy(T).applyMatrix4(M.k);
    const vy = M.v.y + 0.04, vz = M.v.z, Lm = (LEG.L1 + Math.hypot(RIG.shin, 0.02)) * 0.995;
    if (vy * vy + vz * vz <= Lm * Lm) return 0;
    if (vz * vz >= Lm * Lm) return -1;
    return -Math.sqrt(Lm * Lm - vz * vz) - vy;
  }
  // a leg: from the pose, then reaching where its foot must be (two bones in the leg's own plane, in the pelvis's frame),
  // the foot set to its pitch on the ground, the toes flat as the heel lifts
  function leg(R, pose, L, k, s, grounded, want) {
    const sd = k ? -1 : 1; let hp = k ? pose.hipR : pose.hipL, kn = k ? pose.knR : pose.knL; let an = (k ? pose.anR : pose.anL) || 0;
    fr(R[B.thL + k], R[B.pel], sd * 0.095, -0.04, 0, hp, 0, 0); fr(R[B.snL + k], R[B.thL + k], 0, -LEG.L1, 0, kn, 0, 0); fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0);
    let toe = -Math.max(0, an) * 0.8;
    if (grounded) {
      const amin = L.ground + (LEG.sole + 0.003) * s; const e = R[B.ftL + k].elements;
      let T = null;
      if (want) T = want.T; else if (e[13] < amin) T = M.t[k].set(e[12], amin, e[14]);
      // (the swing's end: the heel coming down in front reaches the ground — that is the strike; next frame it stands)
      const ft = L.plant ? L.plant[k] : null;
      if (!want && ft && !ft.on && !ft.off && ((k ? pose.pitR : pose.pitL) || 0) < 0) {
        const hh = ptY(R[B.ftL + k], 0, -LEG.sole, -LEG.heel); M.k.copy(R[B.pel]).invert(); M.v.set(e[12], e[13], e[14]).applyMatrix4(M.k);
        if (hh < L.ground + 0.006 && M.v.z > -0.01) { strike(ft, e); ft.early = 1; }
      }
      if (T) {
        M.k.copy(R[B.pel]).invert(); M.v.copy(T).applyMatrix4(M.k);
        const dy = M.v.y + 0.04, dz = M.v.z, L1 = LEG.L1, L2 = Math.hypot(RIG.shin, 0.02), dl = Math.atan2(0.02, RIG.shin);
        const d = Math.min(Math.hypot(dy, dz), L1 + L2 - 1e-4);
        const ke = Math.acos(G.clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
        const phi = Math.atan2(-dz, -dy), beta = Math.atan2(L2 * Math.sin(ke), L1 + L2 * Math.cos(ke));
        const hp2 = phi - beta, kn2 = ke + dl;
        an += (hp + kn) - (hp2 + kn2); hp = hp2; kn = kn2; // (the foot keeps its pitch in the world)
        fr(R[B.thL + k], R[B.pel], sd * 0.095, -0.04, 0, hp, 0, 0); fr(R[B.snL + k], R[B.thL + k], 0, -LEG.L1, 0, kn, 0, 0); fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0);
      }
      if (want) {
        // (planted: the foot at the stride's pitch to the ground — its forward axis measured, the ankle turned by the difference)
        const f = R[B.ftL + k].elements; const cur = Math.atan2(-f[9], Math.hypot(f[8], f[10])); const p = G.lerp(cur, want.p, want.w);
        an += p - cur; fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0); toe = -Math.max(0, p);
      } else {
        // (free: where the heel or the ball would go into the ground, the ankle turns to set it on it instead)
        for (let it = 0; it < 2; it++) {
          const hh = ptY(R[B.ftL + k], 0, -LEG.sole, -LEG.heel), hb = ptY(R[B.ftL + k], 0, -LEG.sole, LEG.ball);
          const lo = Math.min(hh, hb); if (lo >= L.ground - 0.004) break;
          const a = Math.asin(G.clamp((L.ground - lo) / s / (hh < hb ? 0.075 : 0.13), 0, 0.8));
          an += hh < hb ? a : -a; an = G.clamp(an, -0.9, 1.1); fr(R[B.ftL + k], R[B.snL + k], 0, -RIG.shin, 0.02, an, 0, 0);
        }
        toe = -Math.max(0, an) * 0.8;
        fr(R[B.toeL + k], R[B.ftL + k], 0, RIG.toeY, RIG.toe, toe, 0, 0);
        const tt = ptY(R[B.toeL + k], 0, -0.004, 0.07); if (tt < L.ground) toe -= Math.asin(G.clamp((L.ground - tt) / s / 0.07, 0, 0.9));
      }
    }
    fr(R[B.toeL + k], R[B.ftL + k], 0, RIG.toeY, RIG.toe, toe, 0, 0);
    fr(R[B.hpHL + k], R[B.pel], sd * 0.095, -0.04, 0, hp / 2, 0, 0); fr(R[B.knHL + k], R[B.thL + k], 0, -LEG.L1, 0, kn / 2, 0, 0);
  }
  P3.rig = function (X, Y, Z, yaw, pose, L) {
    mats(); if (!RF) { RF = BONES.map(() => new THREE.Matrix4()); Q.a = new THREE.Quaternion(); Q.b = new THREE.Quaternion(); M.k = M.k || new THREE.Matrix4(); M.c2 = new THREE.Matrix4(); M.t = [new THREE.Vector3(), new THREE.Vector3()]; }
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
    const grounded = L.ground !== undefined && !lie;
    const want = [null, null];
    if (grounded) {
      let drop = 0;
      for (let k = 0; k < 2; k++) { want[k] = footWant(R, pose, L, k, s); if (want[k] && !want[k].leaving) { const d = dropFor(R, want[k].T); if (d < 0) { L.plant[k].on = 0; want[k] = null; } else drop = Math.max(drop, d); } }
      if (drop > 0) { hipY -= Math.min(0.08, drop); pelvis(); }
    }
    const tx = pose.lean, ty = pose.twist * 0.7 - pel * 1.7, tz = -(pose.sway || 0) * 0.6 - prl * 0.8;
    fr(R[B.chest], R[B.pel], 0, 0.06, 0, tx, ty, tz); fr(R[B.spine], R[B.pel], 0, 0.06, 0, tx / 2, ty / 2, tz / 2);
    const nx = pose.neck, ny = (pose.lookY || 0) - (pose.twist - pel * 0.7) * 0.85;
    fr(R[B.head], R[B.chest], 0, 0.56, 0, nx, ny, 0); fr(R[B.neck], R[B.chest], 0, 0.56, 0, nx / 2, ny / 2, 0);
    // (a child's head is big for the body; the grip of the hands: what they hold, the run's fists, the wave's open palm)
    if (L.headK && L.headK !== 1) { M.b.makeScale(L.headK, L.headK, L.headK); R[B.head].multiply(M.b); }
    const hold = (L.torch || L.lantern) && !lie && !L.bind;
    const grip = pose.grip || 0;
    for (let k = 0; k < 2; k++) {
      const sd = k ? -1 : 1;
      let sp = k ? pose.shRp : pose.shLp, sr = k ? pose.shRr : pose.shLr, el = k ? pose.elR : pose.elL;
      if (hold && sd > 0) { sp = -1.05; sr = 0.12; el = 1.25; }
      // (a spear or a staff carried — not swung —: the upper arm by the side, the forearm forward, the shaft upright)
      if (k && L.tool && !pose.tool && !lie && !L.bind && upright(pose)) { sp = 0.05; sr = -0.08; el = 1.05; }
      const jz = G.clamp(-sp, -1, 1) * 0.03, roll = sr + sd * (0.05 + (L.armOut || 0)); // (a wide skirt or a cape: the arms a little out)
      fr(R[B.shL + k], R[B.chest], sd * 0.235, 0.46, jz, sp, 0, roll);
      frHalf(R[B.shHL + k], R[B.chest], sd * 0.235, 0.46, jz * 0.5, 0, 0, sd * RIG.roll, sp, 0, roll);
      fr(R[B.faL + k], R[B.shL + k], 0, -0.3, 0, -el, 0, 0); fr(R[B.elHL + k], R[B.shL + k], 0, -0.3, 0, -el / 2, 0, 0);
      fr(R[B.hdL + k], R[B.faL + k], 0, -0.29, 0, 0, 0, 0);
      const g = (hold && sd > 0) || (k && (pose.tool || L.tool)) || (L.carry && !lie) ? 1 : grip; // (both hands close on a swung haft: the swing's own grip)
      fr(R[B.fgL + k], R[B.hdL + k], 0, -RIG.knuckle, 0, 0, 0, -sd * g * 0.95);
      fr(R[B.tbL + k], R[B.hdL + k], -sd * 0.0076, -0.0238, 0.0324, 0, -sd * g * 0.55, -sd * g * 0.25);
    }
    for (let k = 0; k < 2; k++) leg(R, pose, L, k, s, grounded, want[k]);
    // (the skirt: its front follows the leg that is most forward, its back the one most behind, its sides their own leg)
    const hl = pose.hipL, hr = pose.hipR, cl = pose.cloth || 0, cs = pose.clothS || 0;
    // (a thigh raised far — sitting, crouching — carries the cloth over it nearly all the way: in a step, four fifths)
    const fk = a => a * (0.8 + 0.17 * G.clamp(-a - 0.6, 0, 1)), sk = a => a * (0.75 + 0.2 * G.clamp(-a - 0.6, 0, 1));
    fr(R[B.skF], R[B.pel], 0, -0.04, 0, fk(Math.min(hl, hr, 0)) + Math.min(0, cl) * 0.5, 0, cs * 0.3);
    // (its back: the foot most behind — the thigh and half the knee's fold: the heel kicked up in the swing stays inside)
    fr(R[B.skB], R[B.pel], 0, -0.04, 0, Math.max(hl + pose.knL * 0.5, hr + pose.knR * 0.5, 0) * 0.85 + Math.max(0, cl) * 0.5 - Math.min(hl, hr, 0) * 0.12, 0, cs * 0.3); // (seated, drawn back over the buttocks)
    fr(R[B.skL], R[B.pel], 0.095, -0.04, 0, sk(hl) + cl * 0.3, 0, cs * 0.4); fr(R[B.skR], R[B.pel], -0.095, -0.04, 0, sk(hr) + cl * 0.3, 0, cs * 0.4);
    fr(R[B.clk1], R[B.chest], 0, 0.46, -0.11, Math.max(0, cl) * 0.6, 0, cs * 0.3); fr(R[B.clk2], R[B.clk1], 0, -0.45, 0, Math.max(0, cl) * 0.5, 0, cs * 0.3);
    // (what is held: the torch upright in the left hand whatever the arm does; the tool in the right; the load at the chest)
    M.v.setFromMatrixPosition(R[B.hdL]); R[B.torch].makeRotationY(-yaw + Math.PI / 2); R[B.torch].setPosition(M.v.x, M.v.y, M.v.z); M.b.makeScale(s, s, s); R[B.torch].multiply(M.b);
    // (the tool: through the hole of the closed fist — toward the palm, under the knuckles — along the fist's axis; a shaft
    // carried kept upright by the wrist; a swung tool bent down by the wrist as it strikes)
    const carried = L.tool && !pose.tool && !lie && upright(pose);
    fr(R[B.tool], R[B.hdR], 0.027, -0.076, 0, Math.PI / 2 + (carried ? -Math.PI / 2 + 1.0 : pose.tool ? (pose.wrist || 0) : 0), 0, 0);
    fr(R[B.carry], R[B.chest], 0, 0.3, 0.26, 0, 0, 0);
    return R;
  };
  // (standing, walking, talking, turning: a shaft can be carried upright — not lying, swimming, sitting, crouching)
  function upright(pose) { return !(pose.lie > 0.05) && !(pose.crouch > 0.25); }
  // the body as one skin: the rig's bones and the look to Body3D; the things held and the marker as before
  let skin = false;
  function bodySkin(idx, X, Y, Z, yaw, pose, L, marker) {
    const R = P3.rig(X, Y, Z, yaw, pose, L);
    L.face = faceOf(pose, L);
    G.Body3D.put(idx, R, pose, L, X, Y, Z);
    const s = L.s, lie = pose.lie || 0;
    if ((L.torch || L.lantern) && !lie) {
      put('torch', idx, R[B.torch], 0, 0, 0, 0.12, 0, 0, 0, L.lantern ? -0.1 : 0.18, 0, 0.045, L.lantern ? 0.2 : 0.55, 0.045, L.lantern ? '#3a2a1a' : '#5a3c22');
      M.v.setFromMatrixPosition(R[B.torch]); if (P3.flames.length < 40) P3.flames.push([M.v.x, M.v.y + (L.lantern ? -0.18 : 0.47) * s, M.v.z, L.lantern ? 0.5 : 0.85]);
    } else hide('torch', idx);
    if ((pose.tool || L.tool) && !toolPut(R, L, pose)) put('tool', idx, R[B.hdR], 0, 0, 0, pose.tool ? -Math.PI / 2 : 0, 0, 0, 0, pose.tool ? 0.3 : -0.25, 0, 0.04, 0.95, 0.04, '#7a5a3a'); else hide('tool', idx);
    if (L.carry) put('carry', idx, R[B.chest], 0, 0.3, 0.26, 0, 0, 0, 0, 0, 0, 0.34, 0.26, 0.3, '#9a7a4a'); else hide('carry', idx);
    if (marker) put('marker', idx, M.root, 0, 2.15 + Math.sin(performance.now() / 300) * 0.04, 0, 0, performance.now() / 600, 0, 0, 0, 0, 0.16, 0.22, 0.16, marker); else hide('marker', idx); // (M.root: the rig's root)
  }
  // the face: the blink (0 open .. 1 shut), where the eyes look (they go ahead of the head), the mouth
  function faceOf(pose, L) {
    const f = L.face || {}; const b = pose.blink === undefined ? 1 : pose.blink; const md = L.mood || MOOD.calm;
    f.closed = G.clamp((1 - b) / 0.88, 0, 1); f.gx = G.clamp(pose.gazeX || 0, -0.45, 0.45); f.gy = G.clamp(pose.gazeY || 0, -0.3, 0.3);
    f.mouth = Math.max(pose.talk || 0, md.jaw || 0);
    f.smile = md.smile || 0; f.up = md.up || 0; f.angry = md.angry || 0; f.sad = md.sad || 0; f.wide = md.wide || 0; f.squint = md.squint || 0; f.blush = md.blush || 0;
    return f;
  }
  // the parts the skin replaces (the props stay: the torch, the tool, the load, the marker over a head)
  const PROPS = new Set(['torch', 'tool', 'carry', 'marker']);

  // (where the feet of someone walking stand: the ground — and, crossing a ford, the bed under the water, not its face)
  function groundY(x, y) { const S = G.S; const i = W.idx(x, y); if (S.type[i] === G.T.RIVER && !S.road[i] && !(S.ice && S.ice[i])) return W.hAt(x, y) * G.Space.HM - G.Space.bedAt(x, y); return W.groundH(x, y) * G.Space.HM; }
  // ------------------------------ the frame ------------------------------
  P3.avatar = null; // (set by the body's controller: { X, Y, Z, yaw, pose, look })
  P3.flames = []; // (the flames of the torches and lanterns in the hands drawn this frame: [X, Y, Z, size] — for FX3D)
  P3.walkers = []; // (the people drawn whole this frame: [X, Y, Z, speed, state, act, yaw, id] — only seen)
  P3.highlight = 0; // (the one the body is looking at, to talk to)
  P3.update = function (dt, focus) {
    if (!mesh || !focus) return;
    const S = G.S; const q = R3.Q(); const TL = G.Space.TILE, HM = G.Space.HM;
    // (the eye: how far each one is from it picks the fine body or the lighter one — the camera, not the body it follows)
    const cam = R3.camera ? R3.camera() : null; seenAt[0] = cam ? cam.position.x : focus.X; seenAt[1] = cam ? cam.position.z : focus.Z; field(cam, q);
    { const sk = R3.LT && R3.LT.sky; if (sk) RIM.value = 0.2 * G.clamp((0.3 * sk[0] + 0.6 * sk[1] + 0.1 * sk[2]) / 1.2, 0.15, 1); }
    const R = q.view * 0.22; const R2 = R * R; const RC = q.view * 0.55, RC2 = RC * RC; // (full bodies near; the crowd out to here)
    const av = P3.avatar;
    // the nearest people first, as many as the machine is told to carry
    const near = [];
    for (const v of S.villagers.values()) {
      if (av && v.id === av.id) continue;
      if (v.inside || v.aboard || v.ug || v.held || (v.age < 2 && v.carried)) continue;
      const X = v.x * TL, Z = v.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; if (d2 > RC2) continue;
      near.push([d2, v]);
    }
    near.sort((a, b) => a[0] - b[0]);
    let n = Math.min(near.length, q.npcs, MAX - 1); while (n > 0 && near[n - 1][0] > R2) n--;
    let idx = 0, emoN = 0, culled = 0; P3.walkers.length = 0; P3.flames.length = 0;
    if (skin && G.Body3D.broken(R3.renderer && R3.renderer())) { skin = false; G.Body3D.clear(); PARTS.forEach((p, k) => { mesh[k].visible = true; }); }
    if (skin) G.Body3D.begin(); toolsBegin();
    if (av) {
      // (the body's feet: where they stand in its stride — the view's own memory, a new one for a new body or after a jump)
      if (!avFeet || avFeet.id !== av.id || Math.hypot(av.X - avFeet.X, av.Z - avFeet.Z) > 4) avFeet = { id: av.id, f: [{ on: 0 }, { on: 0 }] }; avFeet.X = av.X; avFeet.Z = av.Z;
      av.look.ground = av.ground === false || av.swim ? undefined : av.Y; av.look.plant = avFeet.f;
      avFeet.t = (avFeet.t || 0) + dt; av.pose.blink = blinkAt(avFeet.t, av.id); cloth(avFeet, av.X, av.Z, av.yaw, dt, av.pose); if (av.look.mood) av.look.mood = easeMood(avFeet, av.look.mood, dt);
      P3.body(idx++, av.X, av.Y, av.Z, av.yaw, av.pose, av.look, null);
    }
    const seen = new Set();
    for (let k = 0; k < n; k++) {
      const v = near[k][1]; seen.add(v.id);
      let s = vis.get(v.id);
      const X = v.x * TL, Z = v.y * TL; const swim = v.task && v.task.type === 'swim';
      // (the world walks them over a boulder's tile: the feet go up onto the stone and down again, a quick step — never through it)
      const Yf = swim ? W.waterH(v.x, v.y) * HM - 0.32 : Math.max(groundY(v.x, v.y), G.Space.stoneTop(X, Z));
      if (!s) { s = { X, Z, Y: Yf, yaw: v.face > 0 ? 0 : Math.PI, ph: (v.id % 7), pose: POSE0(), t: 0, sp: 0, st: 'idle' }; vis.set(v.id, s); }
      s.Y = Math.abs(Yf - s.Y) > 3 ? Yf : s.Y + (Yf - s.Y) * (1 - Math.exp(-14 * dt));
      const Y = s.Y + (v.z ? v.z * 0.22 : 0);
      // (the speed and direction of their steps since the last frame: what their legs must show)
      const dx = X - s.X, dz = Z - s.Z; const dist = Math.hypot(dx, dz);
      const sp = dt > 0 ? dist / dt : 0; s.sp += (Math.min(sp, 9) - s.sp) * (1 - Math.exp(-8 * dt));
      if (dist > 0.002) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-10 * dt)); }
      if (dist > 6) { s.sp = 0; if (s.plant) s.plant[0].on = s.plant[1].on = 0; } // (a jump of the world — a teleport, a load — is not a step)
      s.X = X; s.Z = Z; s.t += dt;
      let st = Anim.stateOf(v, s.sp);
      // (waved at by the body: those standing or strolling near wave back, a moment later — only seen)
      if (s.greetT > 0) { if ((s.greetD -= dt) <= 0) { s.greetT -= dt; if (st === 'idle' || st === 'walk' || st === 'talk') st = 'wave'; } }
      const Lv = P3.look(v);
      // (the stride in step with the ground: the phase at the rate the rig's own legs need for this speed and this size)
      if (st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak') s.ph += dt * s.sp * Anim.rate(st, s.sp, Lv.s); else s.ph += dt * 4;
      Anim.blend(s.pose, Anim.pose(st, st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak' ? s.ph : s.t, s.sp), dt, 10);
      // (someone standing near the body turns their head to it — and back when it goes; a blink now and then)
      const look = P3.lookFor(s.yaw, X, Z, av, st);
      s.pose.lookY = (s.pose.lookY || 0) + (look - (s.pose.lookY || 0)) * (1 - Math.exp(-4 * dt));
      s.pose.gazeX = G.clamp((look - s.pose.lookY) * 0.9, -0.42, 0.42); // (the eyes go first, the head follows)
      s.pose.blink = blinkAt(s.t, v.id); cloth(s, X, Z, s.yaw, dt, s.pose); if (Lv.mood) Lv.mood = easeMood(s, Lv.mood, dt);
      s.st = st;
      s.lod = lodAt(s.lod, (X - seenAt[0]) ** 2 + (Z - seenAt[1]) ** 2);
      Lv.ground = swim || v.z > 0.05 ? undefined : Y; Lv.plant = s.plant || (s.plant = [{ on: 0 }, { on: 0 }]); Lv.lod = s.lod;
      if (P3.walkers.length < 40) P3.walkers.push([X, Y, Z, s.sp, st, v.act, s.yaw, v.id]); // (for the dust and the chips they raise, the grass they part)
      // (outside the eye's field, their shadow too: not drawn this frame — their steps go on; a torch they hold still burns
      // and lights round it, about where their hand is)
      s.cull = seen(X, Y, Z, Lv.s) ? 0 : 1;
      if (s.cull) { culled++; if ((Lv.torch || Lv.lantern) && P3.flames.length < 40) { const c = Math.cos(s.yaw), n = Math.sin(s.yaw), k = Lv.s; P3.flames.push([X + (c * 0.28 + n * 0.2) * k, Y + (Lv.lantern ? 0.85 : 1.6) * k, Z + (n * 0.28 - c * 0.2) * k, Lv.lantern ? 0.5 : 0.85]); } continue; }
      P3.body(idx++, X, Y, Z, s.yaw, s.pose, Lv, P3.highlight === v.id ? '#ffd76a' : null);
      if (v.emo && v.emo.k && emoN < emoPool.length) { const tx = emoMap(v.emo.k); if (tx) { const sp = emoPool[emoN++]; if (sp.material.map !== tx) { sp.material.map = tx; sp.material.needsUpdate = true; } const L2 = P3.look(v).s; sp.position.set(X, Y + 2.2 * L2 + Math.sin(s.t * 3) * 0.03, Z); sp.scale.set(0.42, 0.45, 1); sp.visible = true; } }
    }
    for (const id of vis.keys()) if (!seen.has(id) && !(av && id === av.id)) vis.delete(id);
    for (let k = emoN; k < emoPool.length; k++) emoPool[k].visible = false; P3.emos = emoN;
    // the dead of the world where they fell — until they are buried, burnt or only bones (the carnage keeps them)
    const Cg = G.Carnage && G.Carnage.view ? G.Carnage.view() : null; P3.dead = 0;
    if (Cg) for (const c of Cg.corpses) {
      if (idx >= MAX) break; const X = c.x * TL, Z = c.y * TL; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > R2) continue;
      const stg = G.Carnage.stage(c); if (stg === 'bones') continue;
      P3.dead++; const Y = W.groundH(c.x, c.y) * HM; if (!seen(X, Y, Z, 1)) { culled++; continue; } // (in reach: counted, drawn where seen)
      const L = P3.look(c.look); if (stg !== 'fresh') L.skin = stg === 'rot' ? '#8a8a6a' : '#7a6a5a'; L.lod = lodAt(cLod.get(c.id) || 0, (X - seenAt[0]) ** 2 + (Z - seenAt[1]) ** 2); cLod.set(c.id, L.lod);
      P3.body(idx++, X, Y, Z, G.hash(c.id) * TAU, DEAD[c.id % DEAD.length], L, null);
    }
    if (cLod.size > 400) cLod.clear();
    // the crowd: everyone else in reach, simply (where the world has them; no animation of their own but a step's bob)
    mats(); let c = 0; const tnow = performance.now() / 1000;
    for (let k = n; k < near.length && c < MAXC; k++) {
      const v = near[k][1]; const X = v.x * TL, Z = v.y * TL; const Y0 = W.groundH(v.x, v.y) * HM; if (!seen(X, Y0, Z, 1)) continue;
      const L = P3.look(v); const s = L.s; const st = Math.sin(tnow * 7 + v.id) * (v.moving ? 1 : 0); const Y = Y0 + Math.abs(st) * 0.04;
      const pp = v.path && v.pi < v.path.length ? v.path[v.pi] : null; const yaw = pp ? Math.atan2(pp[1] - v.y, pp[0] - v.x) : (v.face > 0 ? 0 : Math.PI);
      M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-yaw + Math.PI / 2); M.root.multiply(M.b); M.b.makeScale(s, s, s); M.root.multiply(M.b);
      M.a.copy(M.root); M.b.makeTranslation(0, 0.72, 0); M.a.multiply(M.b); M.c.makeScale(1, 0.92, 0.72); M.a.multiply(M.c); crowd.setMatrixAt(c, M.a); crowd.setColorAt(c, color(L.cloth));
      M.a.copy(M.root); M.b.makeTranslation(0, 1.62, 0.01); M.a.multiply(M.b); crowdHead.setMatrixAt(c, M.a); crowdHead.setColorAt(c, color(L.skin));
      M.a.copy(M.root); M.b.makeTranslation(0, 1.64, -0.01); M.a.multiply(M.b); M.c.makeRotationX(-0.6); M.a.multiply(M.c); crowdHair.setMatrixAt(c, M.a); crowdHair.setColorAt(c, color(L.hair));
      for (const sd of [0, 1]) { M.a.copy(M.root); M.b.makeTranslation(sd ? -0.09 : 0.09, 0.86, 0); M.a.multiply(M.b); M.c.makeRotationX((sd ? -st : st) * 0.45); M.a.multiply(M.c); crowdLegs[sd].setMatrixAt(c, M.a); crowdLegs[sd].setColorAt(c, color(L.robe ? L.cloth : L.pants)); }
      c++;
    }
    crowd.count = crowdHead.count = crowdHair.count = crowdLegs[0].count = crowdLegs[1].count = c; for (const m of [crowd, crowdHead, crowdHair, ...crowdLegs]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.crowd = c;
    for (const m of mesh) { m.count = idx; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.count = idx; P3.culled = culled;
    if (skin) G.Body3D.end(); toolsEnd();
    beasts(focus, R2, dt);
  };
  // (a blink: the lids down and up in a sixth of a second, every four seconds or so — each person on their own beat)
  function blinkAt(t, id) { const q = (t + (id % 13) * 0.37) % (3.4 + (id % 5) * 0.3); return q < 0.16 ? 1 - Math.sin(q / 0.16 * Math.PI) * 0.92 : 1; }
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
  P3.skin = () => skin; // (the bodies drawn as one skin — Body3D — or as the pieces of old)
  P3.greet = function (X, Z) { let n = 0; for (const [id, s] of vis) if ((s.X - X) ** 2 + (s.Z - Z) ** 2 < 81) { s.greetT = 1.3 + (id % 5) * 0.15; s.greetD = 0.25 + (id % 7) * 0.08; n++; } return n; };
  // the turn of the head someone wants toward the body: facing yaw at (X, Z), the body av, their state — only when they
  // stand, talk, carry or walk, the body within 6 m and somewhere in front of them (not behind their back)
  P3.lookFor = function (yaw, X, Z, av, st) {
    if (!av || !(st === 'idle' || st === 'talk' || st === 'carry' || st === 'interact' || st === 'walk')) return 0;
    const ax = av.X - X, az = av.Z - Z, ad = Math.hypot(ax, az); if (ad >= 6 || ad <= 0.3) return 0;
    let da = Math.atan2(az, ax) - yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    return Math.abs(da) < 1.9 ? -G.clamp(da, -1.05, 1.05) : 0;
  };
  // (for the verifier: every matrix of a body or a beast drawn this frame is made of numbers)
  P3.check = function () {
    const out = []; const scan = (list, n, what) => { for (const m of list || []) { const a = m.instanceMatrix.array; for (let k = 0; k < Math.min(n, m.count) * 16; k++) if (!Number.isFinite(a[k])) { out.push(`${what}: matriz inválida no desenho`); return; } } };
    scan(mesh, P3.count, 'pessoas'); scan(beastMesh, P3.beasts, 'bichos');
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
  function seen(X, Y, Z, r) {
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
  function beasts(focus, R2, dt) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; let idx = 0; mats(); P3.bculled = 0;
    const list = [];
    for (const a of S.animals.values()) { if (a.dead || a.held) continue; const X = a.x * TL, Z = a.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; if (d2 < R2 * 0.7) list.push([d2, a]); }
    list.sort((p, q) => p[0] - q[0]);
    let nNear = 0; // (the beasts near enough to the eye for their eyes and hooves: the nearest first, so the first rows)
    for (const [d2, a] of list) {
      if (idx >= MAXA) break;
      const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls === 'water') continue;
      const X = a.x * TL, Z = a.y * TL; let s = bvis.get(a.id); if (!s) { s = { X, Z, Y: null, yaw: 0, ph: a.id % 5, t: 0, graze: 0, v: 0 }; bvis.set(a.id, s); }
      const dx = X - s.X, dz = Z - s.Z; const dist = Math.hypot(dx, dz); if (dist > 0.002 && dist < 6) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-8 * dt)); }
      const v = dt > 0 && dist < 6 ? dist / dt : 0; s.v += (v - s.v) * (1 - Math.exp(-6 * dt)); s.t += dt; s.X = X; s.Z = Z;
      const F = formOf(sp, a.kind); const air = sp.cls === 'air' && (a.z || 0) > 0.3;
      const u = (0.5 + (sp.size || 1) * 0.9) / 4 * (a.big || 1) * (a.age !== undefined && a.age < 1 ? 0.6 : 1); // (metres to the god's unit)
      const run = G.clamp(s.v / 3, 0, 1.4); s.ph += dt * (F.biped ? (s.v * 6 / Math.max(0.4, F.leg * u * 2) + 0.4) : (s.v * 0.55 / Math.max(0.4, F.leg * u * 2) + 0.06)); // (four legs: strides; two: radians)
      const col = F.col, dark = darker(col, 0.78), bel = F.belly || darker(col, 1.12);
      // (over a boulder's tile the feet go up onto the stone, as the people's do)
      const Yf = sp.cls === 'water' || air || a.swim ? W.groundH(a.x, a.y) * HM : Math.max(groundY(a.x, a.y), G.Space.stoneTop(X, Z));
      // (a beast first seen stands where the ground is — not rising to it from the height 0, out of the ground, as before)
      s.Y = s.Y === null || Math.abs(Yf - s.Y) > 3 ? Yf : s.Y + (Yf - s.Y) * (1 - Math.exp(-14 * dt));
      const Y = s.Y + (air ? Math.max(0.5, (a.z || 0) * 0.22) : 0) + (sp.cls === 'amph' && W.waterH && S.type[W.idx(Math.floor(a.x), Math.floor(a.y))] <= G.T.RIVER ? -0.3 : 0);
      if (!seen(X, Y, Z, Math.max(0.6, F.len * u))) { P3.bculled++; continue; } // (outside the eye's field: not drawn)
      if (d2 < 576) nNear = idx + 1;
      const m = M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-s.yaw); m.multiply(M.b);
      // (on a slope a beast of four legs lies along it: pitched by the ground under its fore and hind feet, rolled by the ground
      // at its sides — its feet neither in the air nor in the ground; eased, so it never snaps)
      if (!air && !a.swim && !F.biped) {
        const hl = F.len * u * 0.42, hw = hl * 0.45, c = Math.cos(s.yaw), n = Math.sin(s.yaw), k = 1 / TL;
        const gf = groundY(a.x + c * hl * k, a.y + n * hl * k), gb = groundY(a.x - c * hl * k, a.y - n * hl * k), gl = groundY(a.x - n * hw * k, a.y + c * hw * k), gr = groundY(a.x + n * hw * k, a.y - c * hw * k);
        const wp = G.clamp(Math.atan2(gf - gb, 2 * hl), -0.5, 0.5), wr = G.clamp(Math.atan2(gl - gr, 2 * hw), -0.4, 0.4), e = 1 - Math.exp(-8 * dt);
        s.tp = s.tp === undefined || dt <= 0 ? wp : s.tp + (wp - s.tp) * e; s.tr = s.tr === undefined || dt <= 0 ? wr : s.tr + (wr - s.tr) * e;
        M.c.makeRotationZ(s.tp); m.multiply(M.c); M.c.makeRotationX(-s.tr); m.multiply(M.c);
      }
      // (grazing: a beast that eats grass lowers its head now and then while it stands)
      const grazer = sp.diet === 'herb' || sp.diet === 'browse'; const wantG = grazer && s.v < 0.15 && Math.sin(s.t * 0.35 + a.id) > 0.1 ? 1 : 0; s.graze += (wantG - s.graze) * (1 - Math.exp(-2 * dt));
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
    P3.beasts = idx;
    if (bvis.size > 400) bvis.clear();
  }
})(window.G);
