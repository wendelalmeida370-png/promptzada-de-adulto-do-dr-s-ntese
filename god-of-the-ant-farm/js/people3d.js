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
  ];
  const PI = {}; PARTS.forEach((p, k) => { PI[p[0]] = k; });
  let mesh = null; // InstancedMesh per part
  let beastMesh = null, crowd = null, crowdHead = null;
  const vis = new Map(); // id → the view's own memory of someone: where they were, which way they face, their walk, their pose
  P3.clear = function () { vis.clear(); if (mesh) for (const m of mesh) { m.count = 0; m.instanceMatrix.needsUpdate = true; } if (beastMesh) for (const m of beastMesh) { m.count = 0; } if (crowd) { crowd.count = crowdHead.count = 0; } P3.count = 0; P3.crowd = 0; };
  G.worldHooks.push(() => vis.clear());

  P3.init = function (three, realm) {
    THREE = three; R3 = realm; scene = realm.scene();
    const geo = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(0.5, 10, 8), cyl: new THREE.CylinderGeometry(0.42, 0.5, 1, 10), cone: new THREE.ConeGeometry(0.5, 1, 4) };
    geo.cone.rotateX(Math.PI); // (a marker over a head points down at it)
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mesh = PARTS.map(p => { const m = new THREE.InstancedMesh(geo[p[1]], p[0] === 'marker' ? new THREE.MeshBasicMaterial({ color: 0xffffff }) : mat, MAX); m.count = 0; m.castShadow = p[0] !== 'marker'; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); return m; });
    // the beasts: body, head, four legs, tail
    const bp = [['body', 'sph'], ['bhead', 'sph'], ['leg0', 'box'], ['leg1', 'box'], ['leg2', 'box'], ['leg3', 'box'], ['tail', 'box'], ['wing0', 'box'], ['wing1', 'box']]; // (round bodies and heads: a beast, not a crate)
    beastMesh = bp.map(p => { const m = new THREE.InstancedMesh(geo[p[1]], mat, MAXA); m.count = 0; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); return m; });
    // the crowd further off: the same real people, drawn simply (a body and a head, the colours of their clothes and skin)
    const body = new THREE.CylinderGeometry(0.17, 0.22, 1, 6); body.translate(0, 0.5, 0);
    crowd = new THREE.InstancedMesh(body, mat, MAXC); crowdHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 6, 4), mat, MAXC);
    for (const m of [crowd, crowdHead]) { m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); }
  };

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
    return { s, skin: v.skin || '#d8a888', hair: v.hair || '#3a2a1a', cloth, pants: darker(cloth, 0.62), feet: '#3a2a1e', robe, long: v.g === 'f' && ad >= 8, carry: !!(v.carry && v.carry.n > 0), tool: v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'vigia' };
  };

  // ------------------------------ poses ------------------------------
  // a pose: the angles of the joints, and the hips' height and lean (radians, metres)
  const POSE0 = () => ({ bob: 0, crouch: 0, lean: 0, twist: 0, neck: 0, shLp: 0, shLr: 0, shRp: 0, shRr: 0, elL: 0.15, elR: 0.15, hipL: 0, hipR: 0, knL: 0.05, knR: 0.05, lie: 0, tool: 0 });
  Anim.POSE0 = POSE0;
  // every state: a function of its own clock and of the speed (m/s) → the pose it wants
  const ST = {
    idle: (t) => ({ bob: Math.sin(t * 1.7) * 0.008, shLp: 0.05, shRp: 0.05, shLr: 0.08, shRr: -0.08, elL: 0.2, elR: 0.2, neck: Math.sin(t * 0.4) * 0.05 }),
    walk: (t, sp) => { const ph = t, A = G.clamp(sp / 1.9, 0.25, 1) * 0.55; return { bob: Math.abs(Math.sin(ph)) * 0.035, hipL: Math.sin(ph) * A, hipR: -Math.sin(ph) * A, knL: Math.max(0, -Math.cos(ph)) * A * 1.4 + 0.08, knR: Math.max(0, Math.cos(ph)) * A * 1.4 + 0.08, shLp: -Math.sin(ph) * A * 0.75, shRp: Math.sin(ph) * A * 0.75, elL: 0.25, elR: 0.25, lean: 0.04, shLr: 0.06, shRr: -0.06 }; },
    run: (t, sp) => { const ph = t, A = G.clamp(sp / 5, 0.6, 1.1) * 0.85; return { bob: Math.abs(Math.sin(ph)) * 0.08 - 0.02, hipL: Math.sin(ph) * A, hipR: -Math.sin(ph) * A, knL: Math.max(0, -Math.cos(ph)) * A * 1.9 + 0.2, knR: Math.max(0, Math.cos(ph)) * A * 1.9 + 0.2, shLp: -Math.sin(ph) * A * 0.9, shRp: Math.sin(ph) * A * 0.9, elL: 1.25, elR: 1.25, lean: 0.24, shLr: 0.1, shRr: -0.1 }; },
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
    swim: (t) => ({ lie: 0.85, prone: 1, shLp: -Math.PI + Math.sin(t * 3) * 1.4, shRp: -Math.PI - Math.sin(t * 3) * 1.4, hipL: Math.sin(t * 6) * 0.3, hipR: -Math.sin(t * 6) * 0.3, knL: 0.2, knR: 0.2 }),
    throw: (t) => { const k = (t * 1.6) % 1; return { shRp: -2.8 + k * 3, elR: 0.4, shLp: -0.6, lean: k * 0.3 - 0.1, twist: -0.4 + k * 0.6 }; },
    bound: () => ({ shLp: 0.55, shRp: 0.55, shLr: -0.35, shRr: 0.35, elL: 1.2, elR: 1.2, neck: 0.25 }),
    interact: (t) => ({ ...ST.idle(t), shRp: -1.35, shRr: -0.1, elR: 0.25, lean: 0.12 }),
    fight: (t) => ({ ...ST.swing(t), crouch: 0.08, hipL: -0.35, hipR: 0.35, knL: 0.45, knR: 0.25, tool: 1 }),
    // (turning on the spot: small steps in place, the body leading)
    turn: (t) => ({ hipL: Math.sin(t) * 0.2, hipR: -Math.sin(t) * 0.2, knL: Math.max(0, -Math.cos(t)) * 0.4 + 0.08, knR: Math.max(0, Math.cos(t)) * 0.4 + 0.08, shLp: 0.05, shRp: 0.05, shLr: 0.08, shRr: -0.08, elL: 0.22, elR: 0.22, twist: 0.14 }),
    // (wading through a ford: arms out for balance, the steps high)
    wade: (t, sp) => ({ ...ST.walk(t, sp), shLr: 0.5, shRr: -0.5, elL: 0.55, elR: 0.55, lean: 0.12, knL: Math.max(0, -Math.cos(t)) * 0.9 + 0.15, knR: Math.max(0, Math.cos(t)) * 0.9 + 0.15 }),
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
    for (const j in pose) if (!(j in want) && j !== 'tool') pose[j] += ((j === 'elL' || j === 'elR' ? 0.15 : j === 'knL' || j === 'knR' ? 0.05 : 0) - pose[j]) * k;
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
    M.eu = new THREE.Euler(); M.z.makeScale(0, 0, 0);
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
    put('pelvis', idx, root, 0, hipY, 0, 0, pose.twist * 0.3, 0, 0, 0, 0, 0.34, 0.16, 0.2, L.robe ? L.cloth : L.pants, F.pel);
    put('torso', idx, F.pel, 0, 0.06, 0, pose.lean, pose.twist * 0.7, 0, 0, 0.27, 0, 0.38, 0.52, 0.22, L.cloth, F.trunk);
    F.neck.copy(F.trunk); M.b.makeTranslation(0, 0.54, 0); F.neck.multiply(M.b); M.b.makeRotationX(pose.neck); F.neck.multiply(M.b);
    put('head', idx, F.neck, 0, 0.13, 0.01, 0, 0, 0, 0, 0, 0, 0.24, 0.27, 0.25, L.skin);
    put('hair', idx, F.neck, 0, 0.18, -0.02, 0, 0, 0, 0, 0, 0, 0.265, 0.19, 0.275, L.hair);
    if (L.long) put('hairL', idx, F.neck, 0, 0.08, -0.12, 0.1, 0, 0, 0, -0.1, 0, 0.22, 0.32, 0.07, L.hair); else hide('hairL', idx);
    // arms: from the shoulders, down to the elbows, down to the hands (a roll above 0 opens the arm away from the body)
    // (facing +Z, the body's left hand is on +X: L at +X, R at -X; a roll toward one's own side opens the arm)
    for (const [sd, sp, sr, el, u, f, h] of [[1, pose.shLp, pose.shLr, pose.elL, 'uArmL', 'fArmL', 'handL'], [-1, pose.shRp, pose.shRr, pose.elR, 'uArmR', 'fArmR', 'handR']]) {
      put(u, idx, F.trunk, sd * 0.235, 0.47, 0, sp, 0, sr + sd * 0.05, 0, -0.15, 0, 0.095, 0.3, 0.095, L.cloth, F.sh);
      put(f, idx, F.sh, 0, -0.3, 0, -el, 0, 0, 0, -0.14, 0, 0.085, 0.28, 0.085, L.skin, F.fa);
      put(h, idx, F.fa, 0, -0.29, 0, 0, 0, 0, 0, 0, 0, 0.09, 0.09, 0.09, L.skin, F.hd);
      if (sd < 0) { if (pose.tool || L.tool) put('tool', idx, F.hd, 0, 0, 0, pose.tool ? -Math.PI / 2 : 0, 0, 0, 0, pose.tool ? 0.3 : -0.25, 0, 0.04, 0.95, 0.04, '#7a5a3a'); else hide('tool', idx); }
    }
    // legs: from the hips, down to the knees, down to the feet
    for (const [sd, hp, kn, th, sn, ft] of [[1, pose.hipL, pose.knL, 'thighL', 'shinL', 'footL'], [-1, pose.hipR, pose.knR, 'thighR', 'shinR', 'footR']]) {
      put(th, idx, F.pel, sd * 0.09, -0.04, 0, hp, 0, 0, 0, -0.22, 0, 0.135, 0.44, 0.14, L.pants, F.th);
      put(sn, idx, F.th, 0, -0.44, 0, kn, 0, 0, 0, -0.22, 0, 0.115, 0.44, 0.12, L.pants, F.sn);
      put(ft, idx, F.sn, 0, -0.45, 0.05, 0, 0, 0, 0, 0, 0, 0.1, 0.07, 0.24, L.feet);
    }
    if (L.robe) put('skirt', idx, F.pel, 0, -0.2, 0, 0, 0, 0, 0, -0.04, 0, 0.42, 0.42, 0.32, L.cloth); else hide('skirt', idx);
    if (L.carry) put('carry', idx, F.trunk, 0, 0.3, 0.26, 0, 0, 0, 0, 0, 0, 0.34, 0.26, 0.3, '#9a7a4a'); else hide('carry', idx);
    if (marker) put('marker', idx, root, 0, 2.15 + Math.sin(performance.now() / 300) * 0.04, 0, 0, performance.now() / 600, 0, 0, 0, 0, 0.16, 0.22, 0.16, marker); else hide('marker', idx);
  };

  // ------------------------------ the frame ------------------------------
  P3.avatar = null; // (set by the body's controller: { X, Y, Z, yaw, pose, look })
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
    let idx = 0;
    if (av) { P3.body(idx++, av.X, av.Y, av.Z, av.yaw, av.pose, av.look, null); }
    const seen = new Set();
    for (let k = 0; k < n; k++) {
      const v = near[k][1]; seen.add(v.id);
      let s = vis.get(v.id);
      const X = v.x * TL, Z = v.y * TL; const Y = (v.task && v.task.type === 'swim' ? G.SEA * HM - 0.5 : W.groundH(v.x, v.y) * HM) + (v.z ? v.z * 0.22 : 0);
      if (!s) { s = { X, Z, yaw: v.face > 0 ? 0 : Math.PI, ph: (v.id % 7), pose: POSE0(), t: 0, sp: 0, st: 'idle' }; vis.set(v.id, s); }
      // (the speed and direction of their steps since the last frame: what their legs must show)
      const dx = X - s.X, dz = Z - s.Z; const dist = Math.hypot(dx, dz);
      const sp = dt > 0 ? dist / dt : 0; s.sp += (Math.min(sp, 9) - s.sp) * (1 - Math.exp(-8 * dt));
      if (dist > 0.002) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-10 * dt)); }
      if (dist > 6) s.sp = 0; // (a jump of the world — a teleport, a load — is not a step)
      s.X = X; s.Z = Z; s.t += dt;
      const st = Anim.stateOf(v, s.sp);
      if (st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak') s.ph += dt * s.sp * (st === 'run' ? 1.9 : 2.6); else s.ph += dt * 4;
      Anim.blend(s.pose, Anim.pose(st, st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak' ? s.ph : s.t, s.sp), dt, 10);
      s.st = st;
      P3.body(idx++, X, Y, Z, s.yaw, s.pose, P3.look(v), P3.highlight === v.id ? '#ffd76a' : null);
    }
    for (const id of vis.keys()) if (!seen.has(id) && !(av && id === av.id)) vis.delete(id);
    // the crowd: everyone else in reach, simply (where the world has them; no animation of their own but a step's bob)
    mats(); let c = 0; const tnow = performance.now() / 1000;
    for (let k = n; k < near.length && c < MAXC; k++) {
      const v = near[k][1]; const L = P3.look(v); const s = L.s; const X = v.x * TL, Z = v.y * TL; const Y = W.groundH(v.x, v.y) * HM + (v.moving ? Math.abs(Math.sin(tnow * 7 + v.id)) * 0.05 : 0);
      M.a.makeScale(s, s * 1.38, s); M.a.setPosition(X, Y, Z); crowd.setMatrixAt(c, M.a); crowd.setColorAt(c, color(L.cloth));
      M.a.makeScale(s, s, s); M.a.setPosition(X, Y + 1.5 * s, Z); crowdHead.setMatrixAt(c, M.a); crowdHead.setColorAt(c, color(L.skin));
      c++;
    }
    crowd.count = crowdHead.count = c; for (const m of [crowd, crowdHead]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.crowd = c;
    for (const m of mesh) { m.count = idx; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.count = idx;
    beasts(focus, R2, dt);
  };
  P3.visOf = id => vis.get(id);

  // ------------------------------ the beasts ------------------------------
  const bvis = new Map(); G.worldHooks.push(() => bvis.clear());
  function bput(k, idx, m, x, y, z, sx, sy, sz, col) { M.a.copy(m); M.b.makeTranslation(x, y, z); M.a.multiply(M.b); M.c.makeScale(sx, sy, sz); M.a.multiply(M.c); beastMesh[k].setMatrixAt(idx, M.a); beastMesh[k].setColorAt(idx, color(col)); }
  function beasts(focus, R2, dt) {
    const S = G.S; const TL = G.Space.TILE, HM = G.Space.HM; let idx = 0;
    const list = [];
    for (const a of S.animals.values()) { if (a.dead || a.held) continue; const X = a.x * TL, Z = a.y * TL; const d2 = (X - focus.X) ** 2 + (Z - focus.Z) ** 2; if (d2 < R2 * 0.7) list.push([d2, a]); }
    list.sort((p, q) => p[0] - q[0]);
    for (const [, a] of list) {
      if (idx >= MAXA) break;
      const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls === 'water') continue;
      const X = a.x * TL, Z = a.y * TL; let s = bvis.get(a.id); if (!s) { s = { X, Z, yaw: 0, ph: a.id % 5 }; bvis.set(a.id, s); }
      const dx = X - s.X, dz = Z - s.Z; const dist = Math.hypot(dx, dz); if (dist > 0.002 && dist < 6) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-8 * dt)); }
      const v = dt > 0 && dist < 6 ? dist / dt : 0; s.ph += dt * (v * 3 + 0.5); s.X = X; s.Z = Z;
      const air = sp.cls === 'air'; const Y = W.groundH(a.x, a.y) * HM + (air ? Math.max(0.5, (a.z || 0) * 0.22) : 0);
      const col = (sp.q && sp.q.col) || (sp.col && sp.col[0]) || '#8a7a5a';
      const L = air ? 0.3 : sp.art === 'rabbit' ? 0.4 : (0.5 + (sp.size || 1) * 0.9) * (sp.q ? sp.q.len / 4 : 1) * (a.big || 1);
      const H = air ? 0.12 : L * (sp.q ? sp.q.h / 8 : 0.45);
      mats(); const m = M.root.makeTranslation(X, Y, Z); M.b.makeRotationY(-s.yaw); m.multiply(M.b);
      const legH = air ? 0 : H * 0.9; const sw = Math.sin(s.ph) * 0.35 * G.clamp(v, 0, 1);
      bput(0, idx, m, 0, legH + H / 2, 0, L, H, L * 0.42, col);
      bput(1, idx, m, L * 0.55, legH + H * 0.9, 0, L * 0.32, H * 0.6, L * 0.28, darker(col, 0.9));
      for (let k = 0; k < 4; k++) { const fx = k < 2 ? L * 0.35 : -L * 0.35, fz = (k % 2 ? 1 : -1) * L * 0.15; if (air) { beastMesh[2 + k].setMatrixAt(idx, M.z); continue; } M.a.copy(m); M.b.makeTranslation(fx, legH, fz); M.a.multiply(M.b); M.c.makeRotationZ((k % 2 ? sw : -sw) * (k < 2 ? 1 : -1)); M.a.multiply(M.c); M.b.makeTranslation(0, -legH / 2, 0); M.a.multiply(M.b); M.c.makeScale(L * 0.1, legH, L * 0.1); M.a.multiply(M.c); beastMesh[2 + k].setMatrixAt(idx, M.a); beastMesh[2 + k].setColorAt(idx, color(darker(col, 0.8))); }
      bput(6, idx, m, -L * 0.55, legH + H * 0.7, 0, L * 0.25, H * 0.15, H * 0.15, col);
      if (air) { const f = Math.sin(s.ph * 4) * 0.5; for (const k of [0, 1]) { M.a.copy(m); M.b.makeTranslation(0, legH + H / 2, (k ? 1 : -1) * L * 0.25); M.a.multiply(M.b); M.c.makeRotationX((k ? 1 : -1) * f); M.a.multiply(M.c); M.c.makeScale(L * 0.6, 0.03, L * 0.8); M.a.multiply(M.c); beastMesh[7 + k].setMatrixAt(idx, M.a); beastMesh[7 + k].setColorAt(idx, color(col)); } }
      else for (const k of [7, 8]) { beastMesh[k].setMatrixAt(idx, M.z); }
      idx++;
    }
    for (const m of beastMesh) { m.count = idx; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    P3.beasts = idx;
    if (bvis.size > 400) bvis.clear();
  }
})(window.G);
