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
  P3.clear = function () { vis.clear(); for (const sp of emoPool) sp.visible = false; if (mesh) for (const m of mesh) { m.count = 0; m.instanceMatrix.needsUpdate = true; } if (beastMesh) for (const m of beastMesh) { m.count = 0; } if (crowd) { crowd.count = crowdHead.count = crowdHair.count = crowdLegs[0].count = crowdLegs[1].count = 0; } P3.count = 0; P3.crowd = 0; };
  G.worldHooks.push(() => vis.clear());

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
    mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0) * 0.2;\n#include <opaque_fragment>'); };
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
  };
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
    return { s, skin: v.skin || '#d8a888', hair: hair ? '#' + hair.map(q => Math.round(q).toString(16).padStart(2, '0')).join('') : v.hair || '#3a2a1a', cloth, pants: darker(cloth, 0.62), feet: '#3a2a1e', belt: darker(cloth, 0.38), brow: darker(v.hair || '#3a2a1a', 0.8), nose: darker(v.skin || '#d8a888', 0.88), lips: darker(v.skin || '#d8a888', 0.62), robe, fem: v.g === 'f' && ad >= 13, bun: v.g === 'f' && ad >= 16 && v.id % 3 === 1, beard: v.g === 'm' && ad >= 26 && v.id % 3 === 0, long: v.g === 'f' && ad >= 8 && v.id % 3 !== 1, bald: v.g === 'm' && ad >= 55 && v.id % 4 === 0, carry: !!(v.carry && v.carry.n > 0), tool: v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'vigia', torch: torchOf(v), lantern: !!v.lantern && !v.inside, strap: ad >= 14 && (v.role === 'cacador' || v.role === 'guerreiro' || v.role === 'mercador' || v.role === 'explorador' || (G.Possess && G.Possess.body && G.Possess.body() === v)) };
  };
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
  const POSE0 = () => ({ bob: 0, crouch: 0, lean: 0, twist: 0, neck: 0, shLp: 0, shLr: 0, shRp: 0, shRr: 0, elL: 0.15, elR: 0.15, hipL: 0, hipR: 0, knL: 0.05, knR: 0.05, anL: 0, anR: 0, pelY: 0, pelR: 0, pelP: 0, shift: 0, sway: 0, breath: 0, lie: 0, tool: 0 });
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
    swing: (t) => { const k = (Math.sin(t * 5.5) + 1) / 2; return { shRp: -2.7 + k * 2.2, shLp: -2.4 + k * 2, elR: 0.3, elL: 0.4, lean: k * 0.35, hipL: -0.15, hipR: 0.2, knL: 0.2, knR: 0.1, tool: 1 }; },
    low: (t) => ({ crouch: 0.32, lean: 0.95, hipL: -1.0, hipR: -0.8, knL: 1.3, knR: 1.1, shLp: -1.0 + Math.sin(t * 3) * 0.25, shRp: -1.1 - Math.sin(t * 3) * 0.25, elL: 0.3, elR: 0.3, neck: 0.3 }),
    carry: (t) => ({ ...ST.idle(t), shLp: -0.95, shRp: -0.95, shLr: 0.25, shRr: -0.25, elL: 0.95, elR: 0.95 }),
    carryWalk: (t, sp) => ({ ...ST.walk(t, sp), shLp: -0.95, shRp: -0.95, shLr: 0.25, shRr: -0.25, elL: 0.95, elR: 0.95 }),
    pray: (t) => ({ crouch: 0.45, hipL: -0.1, hipR: -0.1, knL: 1.65, knR: 1.65, shLp: -2.6 + Math.sin(t * 1.2) * 0.15, shRp: -2.6 + Math.sin(t * 1.2) * 0.15, shLr: 0.3, shRr: -0.3, elL: 0.2, elR: 0.2, neck: -0.3, lean: -0.05 }),
    sit: (t) => ({ crouch: 0.46, hipL: -1.5, hipR: -1.5, knL: 1.5, knR: 1.5, shLp: -0.5, shRp: -0.5 + Math.sin(t * 2) * 0.1, elL: 0.8, elR: 0.9, lean: 0.1 }),
    talk: (t) => ({ ...ST.idle(t), shRp: -0.5 - Math.max(0, Math.sin(t * 2.6)) * 0.6, shRr: -0.25, elR: 0.9 + Math.sin(t * 3.3) * 0.3, twist: Math.sin(t * 1.1) * 0.08, neck: Math.sin(t * 2.2) * 0.08 }),
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
  function gait(ph, sp, run) {
    const s = Math.sin(ph), c = Math.cos(ph), A = run ? G.clamp(sp / 5, 0.62, 1.05) * 0.85 : G.clamp(sp / 1.9, 0.3, 1) * 0.5;
    const sa = Math.sin(ph - 0.3); // (the arms a beat behind the legs)
    const leg = (sg) => { // (one leg: sg 1 for the left, -1 for the right — the same stride half a turn apart)
      const ls = s * sg, lc = c * sg; // (ls > 0: this leg is behind; lc > 0: it stands, lc < 0: it swings)
      const swing = Math.pow(Math.max(0, -lc), 1.3) * (run ? 2.0 * A : 0.45 + A);
      const give = run ? 0.42 * Math.max(0, lc) : 0.2 * Math.max(0, lc) * Math.max(0, -ls) * 2;
      const push = (run ? 0.6 : 0.45) * Math.pow(Math.max(0, ls), 3) * G.clamp(lc * 3 + 1, 0, 1);
      const heel = -(run ? 0.12 : 0.28) * Math.pow(Math.max(0, -ls), 3) * G.clamp(1 - lc * 3, 0, 1);
      return { hip: ls * A - (run ? 0.12 : 0.03), kn: 0.07 + swing + give, an: push + heel - 0.1 * Math.max(0, -lc) };
    };
    const L = leg(1), R = leg(-1);
    return {
      bob: run ? 0.055 * (0.5 - c * c) - 0.04 : 0.045 * (c * c - 0.5) - 0.01, hipL: L.hip, hipR: R.hip, knL: L.kn, knR: R.kn, anL: L.an, anR: R.an,
      pelY: 0.11 * s * (run ? 1.2 : 0.7 + A), pelR: 0.05 * c * (run ? 0.6 : 1), shift: 0.025 * c * (run ? 0.5 : 1), sway: 0, twist: -0.05 * s,
      shLp: -sa * A * (run ? 1.0 : 1.1), shRp: sa * A * (run ? 1.0 : 1.1), shLr: run ? 0.12 : 0.08, shRr: run ? -0.12 : -0.08,
      elL: run ? 1.3 + Math.max(0, sa) * 0.25 : 0.25 + Math.max(0, sa) * 0.5, elR: run ? 1.3 + Math.max(0, -sa) * 0.25 : 0.25 + Math.max(0, -sa) * 0.5,
      lean: run ? 0.36 : 0.085 + 0.02 * (c * c - 0.5), pelP: run ? 0.12 : 0.03, neck: run ? -0.2 : 0.03 + 0.02 * (c * c - 0.5), breath: Math.sin(ph * 0.5) * (run ? 1 : 0.4),
    };
  }
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
  // a whole body at a place, facing yaw (0 = east, π/2 = south), in a pose, with a look
  P3.body = function (idx, X, Y, Z, yaw, pose, L, marker) {
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
  };

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
    let idx = 0, emoN = 0; P3.walkers.length = 0; P3.flames.length = 0;
    if (av) { P3.body(idx++, av.X, av.Y, av.Z, av.yaw, av.pose, av.look, null); }
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
      if (dist > 6) s.sp = 0; // (a jump of the world — a teleport, a load — is not a step)
      s.X = X; s.Z = Z; s.t += dt;
      let st = Anim.stateOf(v, s.sp);
      // (waved at by the body: those standing or strolling near wave back, a moment later — only seen)
      if (s.greetT > 0) { if ((s.greetD -= dt) <= 0) { s.greetT -= dt; if (st === 'idle' || st === 'walk' || st === 'talk') st = 'wave'; } }
      if (st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak') s.ph += dt * s.sp * (st === 'run' ? 1.9 : 2.6); else s.ph += dt * 4;
      Anim.blend(s.pose, Anim.pose(st, st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak' ? s.ph : s.t, s.sp), dt, 10);
      // (someone standing near the body turns their head to it — and back when it goes; a blink now and then)
      const look = P3.lookFor(s.yaw, X, Z, av, st);
      s.pose.lookY = (s.pose.lookY || 0) + (look - (s.pose.lookY || 0)) * (1 - Math.exp(-4 * dt));
      s.pose.blink = (s.t + (v.id % 13) * 0.37) % 4.1 < 0.12 ? 0.12 : 1;
      s.st = st;
      P3.body(idx++, X, Y, Z, s.yaw, s.pose, P3.look(v), P3.highlight === v.id ? '#ffd76a' : null);
      if (P3.walkers.length < 40) P3.walkers.push([X, Y, Z, s.sp, st, v.act, s.yaw, v.id]); // (for the dust and the chips they raise)
      if (v.emo && v.emo.k && emoN < emoPool.length) { const tx = emoMap(v.emo.k); if (tx) { const sp = emoPool[emoN++]; if (sp.material.map !== tx) { sp.material.map = tx; sp.material.needsUpdate = true; } const L2 = P3.look(v).s; sp.position.set(X, Y + 2.2 * L2 + Math.sin(s.t * 3) * 0.03, Z); sp.scale.set(0.42, 0.45, 1); sp.visible = true; } }
    }
    for (const id of vis.keys()) if (!seen.has(id) && !(av && id === av.id)) vis.delete(id);
    for (let k = emoN; k < emoPool.length; k++) emoPool[k].visible = false; P3.emos = emoN;
    // the dead of the world where they fell — until they are buried, burnt or only bones (the carnage keeps them)
    const Cg = G.Carnage && G.Carnage.view ? G.Carnage.view() : null; P3.dead = 0;
    if (Cg) for (const c of Cg.corpses) {
      if (idx >= MAX) break; const X = c.x * TL, Z = c.y * TL; if ((X - focus.X) ** 2 + (Z - focus.Z) ** 2 > R2) continue;
      const stg = G.Carnage.stage(c); if (stg === 'bones') continue;
      const L = P3.look(c.look); if (stg !== 'fresh') L.skin = stg === 'rot' ? '#8a8a6a' : '#7a6a5a';
      P3.body(idx++, X, W.groundH(c.x, c.y) * HM, Z, G.hash(c.id) * TAU, DEAD[c.id % DEAD.length], L, null); P3.dead++;
    }
    // the crowd: everyone else in reach, simply (where the world has them; no animation of their own but a step's bob)
    mats(); let c = 0; const tnow = performance.now() / 1000;
    for (let k = n; k < near.length && c < MAXC; k++) {
      const v = near[k][1]; const L = P3.look(v); const s = L.s; const X = v.x * TL, Z = v.y * TL; const st = Math.sin(tnow * 7 + v.id) * (v.moving ? 1 : 0); const Y = W.groundH(v.x, v.y) * HM + Math.abs(st) * 0.04;
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
    P3.count = idx;
    beasts(focus, R2, dt);
  };
  P3.visOf = id => vis.get(id);
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
    scan(mesh, P3.count, 'pessoas'); scan(beastMesh, P3.beasts, 'bichos'); return out;
  };

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
  function beasts(focus, R2, dt) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; let idx = 0; mats();
    const list = [];
    for (const a of S.animals.values()) { if (a.dead || a.held) continue; const X = a.x * TL, Z = a.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; if (d2 < R2 * 0.7) list.push([d2, a]); }
    list.sort((p, q) => p[0] - q[0]);
    for (const [, a] of list) {
      if (idx >= MAXA) break;
      const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls === 'water') continue;
      const X = a.x * TL, Z = a.y * TL; let s = bvis.get(a.id); if (!s) { s = { X, Z, Y: 0, yaw: 0, ph: a.id % 5, t: 0, graze: 0, v: 0 }; bvis.set(a.id, s); }
      const dx = X - s.X, dz = Z - s.Z; const dist = Math.hypot(dx, dz); if (dist > 0.002 && dist < 6) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-8 * dt)); }
      const v = dt > 0 && dist < 6 ? dist / dt : 0; s.v += (v - s.v) * (1 - Math.exp(-6 * dt)); s.t += dt; s.X = X; s.Z = Z;
      const F = formOf(sp, a.kind); const air = sp.cls === 'air' && (a.z || 0) > 0.3;
      const u = (0.5 + (sp.size || 1) * 0.9) / 4 * (a.big || 1) * (a.age !== undefined && a.age < 1 ? 0.6 : 1); // (metres to the god's unit)
      const run = G.clamp(s.v / 3, 0, 1.4); s.ph += dt * (F.biped ? (s.v * 6 / Math.max(0.4, F.leg * u * 2) + 0.4) : (s.v * 0.55 / Math.max(0.4, F.leg * u * 2) + 0.06)); // (four legs: strides; two: radians)
      const col = F.col, dark = darker(col, 0.78), bel = F.belly || darker(col, 1.12);
      // (over a boulder's tile the feet go up onto the stone, as the people's do)
      const Yf = sp.cls === 'water' || air || a.swim ? W.groundH(a.x, a.y) * HM : Math.max(groundY(a.x, a.y), G.Space.stoneTop(X, Z)); s.Y = Math.abs(Yf - s.Y) > 3 ? Yf : s.Y + (Yf - s.Y) * (1 - Math.exp(-14 * dt));
      const Y = s.Y + (air ? Math.max(0.5, (a.z || 0) * 0.22) : 0) + (sp.cls === 'amph' && W.waterH && S.type[W.idx(Math.floor(a.x), Math.floor(a.y))] <= G.T.RIVER ? -0.3 : 0);
      const m = M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-s.yaw); m.multiply(M.b);
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
    for (const m of beastMesh) { m.count = idx; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.beasts = idx;
    if (bvis.size > 400) bvis.clear();
  }
})(window.G);
