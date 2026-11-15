'use strict';
// ============================================================
//  FaunaAnim: how an animal moves and what it wears, for
//  Fauna3D. The skeleton every beast shares (the bones of
//  arte/fauna_forma.py, in its order), posed from where the
//  world has the beast and how fast it goes: a walk of four
//  beats, a trot in diagonal pairs, a gallop — the stride
//  measured from the legs, so a hoof stays where it was set
//  down while the body passes over it —, each leg folding at
//  its own joints as it swings; the head nodding with the
//  steps, lowered to graze, turning to look; the ears, the
//  tail, the breath. And the coat of each kind: the colours
//  the god's view paints it with (Animals.DEF), its pattern,
//  its eyes. Only seen: reads the world, writes nothing in it,
//  draws from no chance of it (G.hash and the view's clock).
// ============================================================
(function (G) {
  const FA = G.FaunaAnim = {};
  FA.BONES = ['root', 'spine', 'chest', 'neck0', 'neck1', 'neck2', 'head', 'jaw', 'earL', 'earR',
    'tail0', 'tail1', 'tail2', 'tail3',
    'flL0', 'flL1', 'flL2', 'flL3', 'flR0', 'flR1', 'flR2', 'flR3',
    'hlL0', 'hlL1', 'hlL2', 'hlL3', 'hlR0', 'hlR1', 'hlR2', 'hlR3',
    'trunk0', 'trunk1', 'trunk2'];
  const NB = FA.BONES.length; const B = {}; FA.BONES.forEach((n, i) => { B[n] = i; });
  const PAR = { spine: 'root', chest: 'spine', neck0: 'chest', neck1: 'neck0', neck2: 'neck1', head: 'neck2', jaw: 'head', earL: 'head', earR: 'head',
    tail0: 'root', tail1: 'tail0', tail2: 'tail1', tail3: 'tail2', trunk0: 'head', trunk1: 'trunk0', trunk2: 'trunk1' };
  for (const s of 'LR') { PAR['fl' + s + '0'] = 'chest'; PAR['hl' + s + '0'] = 'root'; for (let k = 1; k < 4; k++) { PAR['fl' + s + k] = 'fl' + s + (k - 1); PAR['hl' + s + k] = 'hl' + s + (k - 1); } }
  FA.PARENT = FA.BONES.map(n => (PAR[n] ? B[n === 'root' ? 'root' : PAR[n]] : -1));
  FA.B = B;
  const TAU = Math.PI * 2;
  const sstep = u => u * u * (3 - 2 * u);

  // ------------------------------ the pose ------------------------------
  let THREE = null; const R = []; let Mb = null, Eu = null, Tm = null, Vs = null, I4 = null;
  const E = new Float32Array(NB * 3); // (each bone's turn about its joint: x pitch — + bows a forward-pointing bone down, swings a hanging one back —, y yaw, z roll)
  const OFF = new Float32Array(3);    // (the root's shift: the body's rise and fall)
  const SC = new Float32Array(NB).fill(1); // (each bone's size, its children growing with it: the young's bigger head, longer legs)
  function start(three) { THREE = three; for (let b = 0; b < NB; b++) R.push(new THREE.Matrix4()); Mb = new THREE.Matrix4(); Eu = new THREE.Euler(0, 0, 0, 'YXZ'); Tm = new THREE.Matrix4(); Vs = new THREE.Vector3(); I4 = new THREE.Matrix4(); }
  // the bones' frames in the world: m the beast's own frame (where it stands, which way it faces — its +Z forward —, its
  // size), J its joints as modelled
  function chain(m, J) {
    for (let b = 0; b < NB; b++) {
      const p = FA.PARENT[b]; Eu.set(E[b * 3], E[b * 3 + 1], E[b * 3 + 2], 'YXZ'); Mb.makeRotationFromEuler(Eu); if (SC[b] !== 1) Mb.scale(Vs.set(SC[b], SC[b], SC[b]));
      if (p < 0) { Mb.setPosition(J[0] + OFF[0], J[1] + OFF[1], J[2] + OFF[2]); R[b].multiplyMatrices(m, Mb); }
      else { Mb.setPosition(J[b * 3] - J[p * 3], J[b * 3 + 1] - J[p * 3 + 1], J[b * 3 + 2] - J[p * 3 + 2]); R[b].multiplyMatrices(R[p], Mb); }
    }
    return R;
  }
  FA.R = () => R;
  // (the bone frames of a pose in the beast's own frame, the frame of the form — for the gesture's layers, js/fauna-gesto3d.js:
  // where the mouth is now, how low the skin goes)
  function chainI(J) { return chain(I4, J); }
  // gaits:the offset of each leg in the stride (left fore, right fore, left hind, right hind), how long a foot stays down,
  // how far the body goes in one stride (× the leg's length), how far a leg folds as it swings, how high the foot is lifted
  const GAITS = {
    walk: { off: [0.25, 0.75, 0.0, 0.5], duty: 0.62, stride: 1.25, fold: 0.8, lift: 0.1 },
    trot: { off: [0.0, 0.5, 0.5, 0.0], duty: 0.46, stride: 1.9, fold: 1.0, lift: 0.15 },
    gallop: { off: [0.55, 0.45, 0.0, 0.1], duty: 0.34, stride: 3.0, fold: 1.25, lift: 0.2 },
    hop: { off: [0.5, 0.55, 0.0, 0.04], duty: 0.36, stride: 2.6, fold: 1.1, lift: 0.18 },
  };
  FA.gaitOf = (v, legLen, pillar, hop) => hop ? 'hop' : FA.gaitOf0(v, legLen, pillar);
  FA.gaitOf0 = (v, legLen, pillar) => { const fr = v / Math.sqrt(9.8 * Math.max(0.05, legLen)); return fr < 0.42 || (pillar && fr < 1.6) ? 'walk' : fr < 1.25 || pillar ? 'trot' : 'gallop'; };
  FA.strideOf = (gait, legLen) => GAITS[gait].stride * Math.max(0.05, legLen);
  // ------------------------------ the legs: set by where the foot goes ------------------------------
  // (in the beast's side plane a point is (z forward, y up); a pitch t turns it as the bones turn — + takes forward to down)
  const rz = (z, y, t) => y * Math.sin(t) + z * Math.cos(t), ry = (z, y, t) => y * Math.cos(t) - z * Math.sin(t);
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const LEGS = ['flL', 'flR', 'hlL', 'hlR'];
  // where the top of a leg is now (P0w), and how far its parent has turned — the hind legs hang from the root, the fore from
  // the chest
  const P0w = [0, 0];
  function legTop(J, L) {
    const i0 = B[L + '0'] * 3, C0 = E[0];
    let z = J[2] + OFF[2], y = J[1] + OFF[1];
    if (L[0] === 'h') { const dz = J[i0 + 2] - J[2], dy = J[i0 + 1] - J[1]; P0w[0] = z + rz(dz, dy, C0); P0w[1] = y + ry(dz, dy, C0); return C0; }
    const sp = B.spine * 3, ch = B.chest * 3; let dz = J[sp + 2] - J[2], dy = J[sp + 1] - J[1]; z += rz(dz, dy, C0); y += ry(dz, dy, C0);
    const C1 = C0 + E[sp]; dz = J[ch + 2] - J[sp + 2]; dy = J[ch + 1] - J[sp + 1]; z += rz(dz, dy, C1); y += ry(dz, dy, C1);
    const C2 = C1 + E[ch]; dz = J[i0 + 2] - J[ch + 2]; dy = J[i0 + 1] - J[ch + 1]; P0w[0] = z + rz(dz, dy, C2); P0w[1] = y + ry(dz, dy, C2); return C2;
  }
  // a leg brought to its target: the joint of its foot (the fetlock, the ankle) to (Tz, Ty) by the upper two bones, the lower
  // joint (the knee, the hock) bent by kap, the foot lying at the turn ft (0: flat, as it stands); s the size of the leg below the
  // elbow or the stifle (the young's). Returns whether the foot reached.
  function legTo(J, L, Cp, Tz, Ty, kap, ft, s) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3;
    const a1z = J[i1 + 2] - J[i0 + 2], a1y = J[i1 + 1] - J[i0 + 1], a2z = J[i2 + 2] - J[i1 + 2], a2y = J[i2 + 1] - J[i1 + 1], a3z = J[i3 + 2] - J[i2 + 2], a3y = J[i3 + 1] - J[i2 + 1];
    const cz = (a2z + rz(a3z, a3y, kap)) * s, cy = (a2y + ry(a3z, a3y, kap)) * s; // (below the middle joint, as one piece)
    const l1 = Math.hypot(a1z, a1y), l2 = Math.hypot(cz, cy), b1 = Math.atan2(a1y, a1z), b2 = Math.atan2(cy, cz);
    const dz = Tz - P0w[0], dy = Ty - P0w[1], al = Math.atan2(dy, dz); let d = Math.hypot(dz, dy); const dmax = (l1 + l2) * 0.999; const reach = d <= dmax;
    d = clamp(d, Math.abs(l1 - l2) * 1.001 + 1e-5, dmax);
    const sg = a1z * (a1y + a2y + a3y) - a1y * (a1z + a2z + a3z) >= 0 ? -1 : 1; // (the middle joint bends the way it is modelled)
    const p1 = al + sg * Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const ez = P0w[0] + l1 * Math.cos(p1), ey = P0w[1] + l1 * Math.sin(p1); const p2 = Math.atan2(P0w[1] + d * Math.sin(al) - ey, P0w[0] + d * Math.cos(al) - ez);
    const t0 = b1 - p1 - Cp, t1 = b2 - p2 - Cp - t0;
    E[i0] = t0; E[i1] = t1; E[i2] = kap; E[i3] = ft - (Cp + t0 + t1 + kap);
    return reach;
  }
  // a bird's leg: it steps with the knee and the heel, the thigh kept still against the body — the foot's joint to (Tz, Ty) by
  // the drumstick and the shank, the foot at the turn ft
  function legToB(J, L, Cp, Tz, Ty, ft) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3;
    const a2z = J[i2 + 2] - J[i1 + 2], a2y = J[i2 + 1] - J[i1 + 1], a3z = J[i3 + 2] - J[i2 + 2], a3y = J[i3 + 1] - J[i2 + 1];
    const kz = P0w[0] + rz(J[i1 + 2] - J[i0 + 2], J[i1 + 1] - J[i0 + 1], Cp), ky = P0w[1] + ry(J[i1 + 2] - J[i0 + 2], J[i1 + 1] - J[i0 + 1], Cp);
    const l1 = Math.hypot(a2z, a2y), l2 = Math.hypot(a3z, a3y), b1 = Math.atan2(a2y, a2z), b2 = Math.atan2(a3y, a3z);
    const dz = Tz - kz, dy = Ty - ky, al = Math.atan2(dy, dz); const d = clamp(Math.hypot(dz, dy), Math.abs(l1 - l2) * 1.001 + 1e-5, (l1 + l2) * 0.999);
    const sg = a2z * (a2y + a3y) - a2y * (a2z + a3z) >= 0 ? -1 : 1;
    const p1 = al + sg * Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const ez = kz + l1 * Math.cos(p1), ey = ky + l1 * Math.sin(p1); const p2 = Math.atan2(ky + d * Math.sin(al) - ey, kz + d * Math.cos(al) - ez);
    E[i0] = 0; E[i1] = b1 - p1 - Cp; E[i2] = b2 - p2 - Cp - E[i1]; E[i3] = ft - (Cp + E[i1] + E[i2]);
  }
  // a plantigrade leg (the bear's, the hare's hind one): its whole sole, heel to toes, lies on the ground — the hock brought where
  // the sole puts it by the two bones above, the sole turned by ft (0: flat, as it stands)
  function legToP(J, L, Cp, Tz, Ty, ft, s) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3;
    const a1z = J[i1 + 2] - J[i0 + 2], a1y = J[i1 + 1] - J[i0 + 1], a2z = (J[i2 + 2] - J[i1 + 2]) * s, a2y = (J[i2 + 1] - J[i1 + 1]) * s;
    const hz = Tz + rz((J[i2 + 2] - J[i3 + 2]) * s, (J[i2 + 1] - J[i3 + 1]) * s, ft), hy = Ty + ry((J[i2 + 2] - J[i3 + 2]) * s, (J[i2 + 1] - J[i3 + 1]) * s, ft);
    const l1 = Math.hypot(a1z, a1y), l2 = Math.hypot(a2z, a2y), b1 = Math.atan2(a1y, a1z), b2 = Math.atan2(a2y, a2z);
    const dz = hz - P0w[0], dy = hy - P0w[1], al = Math.atan2(dy, dz); const d = clamp(Math.hypot(dz, dy), Math.abs(l1 - l2) * 1.001 + 1e-5, (l1 + l2) * 0.999);
    const sg = a1z * (a1y + a2y) - a1y * (a1z + a2z) >= 0 ? -1 : 1;
    const p1 = al + sg * Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const ez = P0w[0] + l1 * Math.cos(p1), ey = P0w[1] + l1 * Math.sin(p1); const p2 = Math.atan2(P0w[1] + d * Math.sin(al) - ey, P0w[0] + d * Math.cos(al) - ez);
    E[i0] = b1 - p1 - Cp; E[i1] = b2 - p2 - Cp - E[i0]; E[i2] = ft - (Cp + E[i0] + E[i1]); E[i3] = 0;
  }
  // (how far a leg reaches from its top to its foot's joint, the lower joint bent by kap)
  function reachOf(J, L, kap, s) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3;
    const a3z = J[i3 + 2] - J[i2 + 2], a3y = J[i3 + 1] - J[i2 + 1];
    return (Math.hypot(J[i1 + 2] - J[i0 + 2], J[i1 + 1] - J[i0 + 1]) + Math.hypot(J[i2 + 2] - J[i1 + 2] + rz(a3z, a3y, kap), J[i2 + 1] - J[i1 + 1] + ry(a3z, a3y, kap)) * s) * 0.999;
  }
  // (how high the lower joint of a leg — the knee, the hock — is, as legTo left it)
  function lowJoint(J, L, Cp, s) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3; const C0 = Cp + E[i0], C1 = C0 + E[i1];
    return P0w[1] + ry(J[i1 + 2] - J[i0 + 2], J[i1 + 1] - J[i0 + 1], C0) + ry(J[i2 + 2] - J[i1 + 2], J[i2 + 1] - J[i1 + 1], C1) * s;
  }
  // a foot that is down at z: flat on the ground — or, where the leg cannot reach it so (the ends of the stride), rolled up on its
  // toe (behind) or its heel (in front), as a hoof is. Gives where its joint goes and its turn.
  const ST = [0, 0, 0];
  function downAt(J, L, z, y3, rf, s) {
    ST[0] = z; ST[1] = y3; ST[2] = 0;
    const R2 = reachOf(J, L, 0, s); if (Math.hypot(z - P0w[0], y3 - P0w[1]) <= R2) return ST;
    const back = z < P0w[0], pz = z + (back ? rf : -rf), vz = back ? -rf : rf; let lo = 0, hi = 1.1;
    for (let k = 0; k < 10; k++) { const mid = (lo + hi) * 0.5, tt = back ? mid : -mid; if (Math.hypot(pz + rz(vz, y3, tt) - P0w[0], ry(vz, y3, tt) - P0w[1]) <= R2) hi = mid; else lo = mid; }
    const tt = back ? hi : -hi; ST[0] = pz + rz(vz, y3, tt); ST[1] = ry(vz, y3, tt); ST[2] = tt; return ST;
  }
  // (each kind's feet as modelled: the foot joint's height, where it stands, the foot's half length — read once a form)
  function legsOf(form) {
    if (form._legs) return form._legs; const J = form.J, H = form.meta.H;
    const ft = form.meta.foot || (form.meta.dig ? 'paw' : 'hoof'), k = ft === 'bearpaw' ? 6.0 : ft === 'paw' ? 2.9 : ft === 'pad' ? 1.6 : ft === 'pillar' ? 2.0 : 0.9; // (a paw's toes reach far ahead of its joint; a hoof is short)
    form._legs = LEGS.map(L => { const i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3; const y3 = J[i3 + 1];
      const plant = Math.abs(J[i3 + 2] - J[i2 + 2]) > 0.8 * Math.abs(J[i2 + 1] - J[i3 + 1]); // (the sole from the hock or the wrist runs more forward than down)
      return { z: J[i3 + 2], y3, rf: y3 * k + H * 0.01, plant }; });
    return form._legs;
  }
  // the pose of a beast on four legs. st: { v (m/s), ph (the stride's phase, in strides), t (the view's clock), graze (0..1),
  // look (-1..1), id, ears (0 up, 1 back), tail (0 down, 1 up), jaw (0 shut, 1 open), sit, young (0 grown .. 1 newborn), fy (the
  // ground under each foot — left fore, right fore, left hind, right hind — over the frame's plane, in the beast's measure) }
  // (each leg's last target, as the stride or the stance set it: the gesture's layers blend from it — FaunaAnim.Gest)
  const LT = new Float32Array(20);
  function put(k, L, Cp, Tz, Ty, kap, ft, s, plant) {
    const o = k * 5; LT[o] = Tz; LT[o + 1] = Ty; LT[o + 2] = kap; LT[o + 3] = ft; LT[o + 4] = plant ? 1 : 0;
    return plant ? legToP(J0, L, Cp, Tz, Ty, ft, s) : legTo(J0, L, Cp, Tz, Ty, kap, ft, s);
  }
  let J0 = null; // (the joints of the form being posed, for put)
  FA.quad = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1); J0 = J;
    const legF = J[B.flL0 * 3 + 1], legH = J[B.hlL0 * 3 + 1], LL = (legF + legH) * 0.5;
    const pillar = !!form.meta.pillar, dig = !!form.meta.dig;
    // (the gesture: its layers read now — js/fauna-gesto3d.js; a body down on the ground does not walk)
    const GX = st.gx && FA.Gest ? FA.Gest : null; const vv = GX ? st.v * GX.begin('quad', form, sp, st, LL) : st.v;
    const gait = vv < 0.04 ? null : form.meta.hop ? 'hop' : FA.gaitOf(vv, LL, pillar); const G0 = gait ? GAITS[gait] : null;
    const go = gait ? Math.min(1, vv / 0.25) : 0; // (from standing into the stride: the legs begin to swing)
    const ph = st.ph, t = st.t, id = st.id || 0;
    // the young: the head bigger, the legs longer below the elbow and the stifle (the hoofed most: a foal is all legs), the body
    // raised by as much
    const yg = st.young || 0, hoofed = form.meta.foot ? /hoof|cloven|pad/.test(form.meta.foot) : !dig && !pillar;
    const sL = 1 + yg * (hoofed ? 0.24 : 0.06);
    if (yg) { SC[B.head] = 1 + yg * (hoofed ? 0.26 : 0.34); SC[B.trunk0] = (1 - yg * 0.3) / SC[B.head]; for (const L of LEGS) SC[B[L + '1']] = sL; OFF[1] += (sL - 1) * (J[B.flL1 * 3 + 1] + J[B.hlL1 * 3 + 1]) * 0.5; } // (a calf's trunk is short)
    const lg = legsOf(form), fy = st.fy || null; // (fy: the ground under each foot, over or under the frame's plane)
    if (fy) OFF[1] += Math.min(0, fy[0], fy[1], fy[2], fy[3]) * (pillar ? 0.8 : 0.5); // (settling over a dip: the straight legs of a pillar most)
    if (GX) GX.body(J, form, st, LL, sL, fy); // (the body as the gesture holds it: lowered, lying, reared, rolled — before the legs, which reach from it)
    else { E[B.spine * 3] += Math.sin(t * 1.7 + id) * 0.008; E[B.chest * 3] -= Math.sin(t * 1.7 + id) * 0.006; } // (the breath)
    if (G0) {
      // (the body: a little rise and fall twice a stride in the walk and the trot, lower as the legs reach further; in the
      // gallop it rocks, nose up and down, and a cat's back bends and stretches)
      const S = FA.strideOf(gait, LL) * go, half = S * G0.duty * 0.5;
      OFF[1] -= 0.45 * (LL - Math.sqrt(Math.max(LL * LL - half * half, LL * LL * 0.3)));
      if (gait === 'hop') { // (the body flies between the feet: after the hind feet push off, and after the forefeet leave — down while they are on the ground)
        const fl = (a, b, h) => { let q = ph - a; q -= Math.floor(q); const w = b - a; return q < w ? Math.sin(Math.PI * q / w) * h : 0; };
        OFF[1] += (fl(0.34, 0.52, 0.3) + fl(0.84, 1.02, 0.14)) * LL * go; E[B.root * 3] += (Math.sin(ph * TAU + 2.2) * 0.16) * go;
      }
      else if (gait === 'gallop') { E[B.root * 3] += Math.sin(ph * TAU + 1.0) * 0.07; OFF[1] += Math.sin(ph * TAU) * LL * 0.05; if (form.meta.flex) { E[B.spine * 3] += Math.sin(ph * TAU) * 0.12; E[B.chest * 3] -= Math.sin(ph * TAU) * 0.1; } }
      else OFF[1] -= Math.abs(Math.sin(ph * TAU * 2)) * LL * (gait === 'trot' ? 0.03 : 0.012) * go;
      // each leg: a foot that is down stays where it was set while the body goes over it (rolling up on its toe at the end);
      // a foot that swings is lifted, the knee and the hock folding, and brought forward to where it will be set
      const fk = G0.fold * go;
      for (let k = 0; k < 4; k++) {
        const L = LEGS[k], front = k < 2, g = lg[k]; let f = ph + G0.off[k]; f -= Math.floor(f);
        const Cp = legTop(J, L), y3 = g.y3 * sL + (fy ? fy[k] : 0), rf = g.rf * sL;
        if (f < G0.duty) { const u = f / G0.duty; const q = downAt(J, L, g.z + half * (1 - 2 * u), y3, rf, sL);
          // (lame, a.wnd.l: the hurt leg barely set down, the weight off it — the head jerks up as it lands)
          const lame = st.limp > 0.05 && k === (st.limpLeg || 2) ? st.limp * Math.sin(Math.PI * u) : 0; if (lame) { q[1] += lame * LL * 0.09; E[B.neck0 * 3] -= lame * 0.16; OFF[1] -= lame * LL * 0.03; }
          put(k, L, Cp, q[0], q[1], 0, q[2], sL, g.plant); }
        else {
          const u = (f - G0.duty) / (1 - G0.duty), w = sstep(u), sn = Math.sin(Math.PI * u);
          const q0 = downAt(J, L, g.z - half, y3, rf, sL); const z0 = q0[0], y0 = q0[1], t0 = q0[2];
          const q1 = downAt(J, L, g.z + half, y3, rf, sL); const z1 = q1[0], y1 = q1[1], t1 = q1[2];
          const kap = sn * fk * (front ? (pillar ? 0.5 : dig ? 1.1 : 1.6) : -(pillar ? 0.3 : 1.15));
          const foot = t0 + (t1 - t0) * w + sn * fk * (front ? (pillar ? 0.1 : 0.7) : (pillar ? 0.1 : 0.6));
          // (the foot leaves the ground going back as fast as it went while down, and comes down so: no skate at either end)
          const mv = -2 * half / G0.duty * (1 - G0.duty), u2 = u * u, u3 = u2 * u;
          const zz = (2 * u3 - 3 * u2 + 1) * z0 + (u3 - 2 * u2 + u) * mv + (3 * u2 - 2 * u3) * z1 + (u3 - u2) * mv;
          // (the foot as it turns keeps its toe and its heel off the ground; the knee or the hock too, folded)
          let yy = y0 + (y1 - y0) * w + sn * LL * G0.lift * go;
          yy = Math.max(yy, -Math.min(ry(rf, -y3, foot), ry(-rf, -y3, foot)) + (fy ? fy[k] : 0) + y3 * 0.04 + sn * LL * G0.lift * go * 0.6);
          if (g.plant) { const yh = Math.max(yy, y3 + sn * LL * 0.12 * go); put(k, L, Cp, zz, yh, 0, foot * 0.7, sL, true); } // (a plantigrade lifts its heel and swings the whole sole)
          else {
            put(k, L, Cp, zz, yy, kap, foot, sL, false);
            for (let it = 0; it < 4; it++) { // (the knee or the hock kept off the ground — the point of the hock sticks out behind and below its joint)
              const lo2 = lowJoint(J, L, Cp, sL) - (fy ? fy[k] : 0) - g.y3 * sL * (front ? 1.5 : 2.4); if (lo2 >= -1e-4) break;
              yy -= lo2 * 1.3; put(k, L, Cp, zz, yy, kap, foot, sL, false);
            }
          }
        }
      }
      // (the head nods with the steps: twice a stride in the walk, with the forelegs in the gallop)
      const nod = gait === 'gallop' ? Math.sin(ph * TAU + 0.6) * 0.14 : Math.sin(ph * TAU * 2 + 0.4) * (gait === 'walk' ? 0.06 : 0.03);
      E[B.neck0 * 3] += nod * go; E[B.head * 3] -= nod * 0.5 * go;
    } else {
      // standing: the weight shifts now and then from foot to foot — the body sways over the feet, which stay where they are
      OFF[2] += Math.sin(t * 0.31 + id) * form.meta.L * 0.012; OFF[1] -= (0.5 + 0.5 * Math.sin(t * 0.62 + id * 2)) * LL * 0.006;
      if (form.meta.hop && st.graze > 0.001) { E[B.root * 3] += 0.2 * st.graze; OFF[1] -= LL * 0.14 * st.graze; } // (a hare grazes crouched, its front down — not bowing a neck it hardly has)
      for (let k = 0; k < 4; k++) { const L = LEGS[k], g = lg[k]; const Cp = legTop(J, L); put(k, L, Cp, g.z, g.y3 * sL + (fy ? fy[k] : 0), 0, 0, sL, g.plant); }
    }
    if (GX) GX.legs(J, form, st, LL, sL, fy, lg, LT); // (the legs the gesture takes: folded under, kicking, striking, thrashing)
    const sitK = GX ? Math.max(st.sit || 0, GX.sitK()) : st.sit;
    if (sitK) sit(form, J, sitK, sL, fy);
    // grazing: the neck bows until the muzzle is at the grass (as far as the neck reaches); the jaw chews
    if (st.graze > 0.001 && !(st.sit > 0.5)) {
      const n0 = B.neck0 * 3, nose = form.meta.nose; const yr = nose[1] - J[n0 + 1], zr = nose[2] - J[n0 + 2];
      const Rr = Math.hypot(yr, zr), p0 = Math.atan2(yr, zr); const want = (0.04 - J[n0 + 1] - OFF[1]) / Rr;
      const th = (p0 - Math.asin(Math.max(-1, Math.min(1, want)))) * (sp.browse ? 0.45 : 1) * (form.meta.hop ? 0.5 : 1) * st.graze;
      E[n0] += th * 0.62; E[B.neck1 * 3] += th * 0.24; E[B.neck2 * 3] += th * 0.14; E[B.head * 3] -= th * 0.12;
      E[B.jaw * 3] = Math.max(0, Math.sin(t * 5.5 + id)) * 0.07 * st.graze;
    }
    // looking about: the neck and the head turn together
    const look = st.look || 0; E[B.neck0 * 3 + 1] += look * 0.35; E[B.neck1 * 3 + 1] += look * 0.25; E[B.head * 3 + 1] += look * 0.3;
    if (GX) GX.head(J, form, st, LL); // (the neck, the head and the mouth of the gesture)
    // the jaw (a predator's open mouth), the ears (up and flicking, or laid back), the tail (swishing, raised in the gallop)
    if (st.jaw) E[B.jaw * 3] = Math.max(E[B.jaw * 3], st.jaw * 0.45);
    const flick = (k) => { const q = Math.sin(t * 0.9 + id * 1.7 + k * 2.1); return q > 0.93 ? (q - 0.93) * 8 : 0; };
    const back = st.ears || 0;
    E[B.earL * 3] = back * 0.9 + flick(0) * 0.25; E[B.earL * 3 + 2] = -back * 0.3 + flick(1) * 0.3;
    E[B.earR * 3] = back * 0.9 + flick(2) * 0.25; E[B.earR * 3 + 2] = back * 0.3 - flick(3) * 0.3;
    if (GX) GX.ears(st);
    const sw = (gait ? 0.12 : 0.3) * (sp.swish === undefined ? 1 : sp.swish) * (1 - 0.7 * (st.sit || 0));
    for (let k = 0; k < 4; k++) {
      const b = B['tail' + k] * 3; E[b + 1] += Math.sin(t * 1.6 - k * 0.55 + id) * sw * (0.5 + k * 0.25);
      E[b] += -(st.tail || 0) * (k === 0 ? 0.55 : 0.2) + (gait ? Math.sin(ph * TAU * 2 - k * 0.5) * 0.06 * (1 + k * 0.3) : 0);
    }
    if (GX) GX.tail(st);
    tailOver(J, Math.max(form.meta.H * 0.03, (form.meta.tailR || form.meta.H * 0.05) * 0.95) + (fy ? Math.max(0, (fy[2] + fy[3]) * 0.5) : 0)); // (a long tail never drags through the ground)
    if (form.meta.trunk) {
      for (let k = 0; k < 3; k++) { E[B['trunk' + k] * 3] = Math.sin(t * 0.8 + id - k * 0.6) * 0.12 + st.graze * 0.25; E[B['trunk' + k] * 3 + 1] = Math.sin(t * 0.53 + id * 2 - k * 0.5) * 0.15; }
      if (GX) GX.trunk(st);
      // (the trunk's end kept off the ground: curled forward when the head's nod or the step would put it in)
      const nz = form.meta.nose, t2 = B.trunk2 * 3, clear = form.meta.H * 0.02 + (fy ? Math.max(fy[0], fy[1]) : 0);
      for (let it = 0; it < 3; it++) { chain(I4, J); const e = R[B.trunk2].elements; const y = e[1] * (nz[0] - J[t2]) + e[5] * (nz[1] - J[t2 + 1]) + e[9] * (nz[2] - J[t2 + 2]) + e[13];
        if (y >= clear) break; const d = Math.min(0.6, (clear - y) / Math.max(0.05, form.meta.H * 0.15)); E[t2] -= d; E[B.trunk1 * 3] -= d * 0.5; }
    }
    if (GX) GX.end(J, form, st); // (the reach to the other — the throat, the nape, the carcass —, the body settled on the ground)
    return chain(m, J);
  };
  // sitting down (a dog, a cat, a wolf, a lion at rest), blended in by k: the rump on the ground, the back raised until the
  // forelegs stand straight under the chest — the forefeet staying where they were —, the hind legs folded under the body
  // (the thigh forward, the hock on the ground behind, the foot flat), the head kept level, the tail lying behind
  const SE = new Float32Array(NB * 3), SO = new Float32Array(3), KE = new Float32Array(NB * 3), KO = new Float32Array(3);
  // (the tail kept over the ground: each of its bones, from the root out, raised just enough that its end stays at clear —
  // the tail then lies along the ground behind)
  function tailOver(J, clear) {
    let C = E[0], z = J[2] + OFF[2], y = J[1] + OFF[1]; const t0 = B.tail0 * 3; let dz = J[t0 + 2] - J[2], dy = J[t0 + 1] - J[1]; z += rz(dz, dy, C); y += ry(dz, dy, C);
    for (let k = 0; k < 4; k++) {
      const b = B['tail' + k] * 3, n = k < 3 ? B['tail' + (k + 1)] * 3 : b, p = k < 3 ? b : B.tail2 * 3; C += E[b];
      dz = (J[n + 2] - J[p + 2]) * (k < 3 ? 1 : 0.9); dy = (J[n + 1] - J[p + 1]) * (k < 3 ? 1 : 0.9); if (k === 3) { dz = (J[b + 2] - J[p + 2]) * 0.9; dy = (J[b + 1] - J[p + 1]) * 0.9; }
      const l = Math.hypot(dz, dy); if (l < 1e-5) continue;
      let ey = y + ry(dz, dy, C);
      if (ey < clear) { const want = Math.PI - Math.asin(clamp((clear - y) / l, -1, 1)); let c2 = Math.atan2(dy, dz) - want; while (c2 - C > Math.PI) c2 -= TAU; while (c2 - C < -Math.PI) c2 += TAU; E[b] += c2 - C; C = c2; ey = y + ry(dz, dy, C); }
      z += rz(dz, dy, C); y = ey;
    }
  }
  // (a hind leg folded under the body: the hock to the ground behind the hip — at yh —, the cannon forward along the ground, the
  // foot flat; whatever the hip's height — sitting, lying)
  function hindFold(J, L, yh, sL) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3; const Cp = legTop(J, L);
    const a1z = J[i1 + 2] - J[i0 + 2], a1y = J[i1 + 1] - J[i0 + 1], a2z = (J[i2 + 2] - J[i1 + 2]) * sL, a2y = (J[i2 + 1] - J[i1 + 1]) * sL;
    const l1 = Math.hypot(a1z, a1y), l2 = Math.hypot(a2z, a2y), b1 = Math.atan2(a1y, a1z), b2 = Math.atan2(a2y, a2z), b3 = Math.atan2(J[i3 + 1] - J[i2 + 1], J[i3 + 2] - J[i2 + 2]);
    const Tz = P0w[0] - l2 * 0.32, dz = Tz - P0w[0], dy = yh - P0w[1], al = Math.atan2(dy, dz); const d = clamp(Math.hypot(dz, dy), Math.abs(l1 - l2) * 1.02 + 1e-4, (l1 + l2) * 0.999);
    const sg = a1z * (a1y + a2y) - a1y * (a1z + a2z) >= 0 ? -1 : 1;
    const p1 = al + sg * Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const ez = P0w[0] + l1 * Math.cos(p1), ey = P0w[1] + l1 * Math.sin(p1); const p2 = Math.atan2(P0w[1] + d * Math.sin(al) - ey, P0w[0] + d * Math.cos(al) - ez);
    E[i0] = b1 - p1 - Cp; E[i1] = b2 - p2 - Cp - E[i0]; E[i2] = b3 - Cp - E[i0] - E[i1]; E[i3] = -b3;
  }
  // (a foreleg folded under the chest, as the hoofed lie: the forearm along the ground forward from the elbow, the knee — at yk
  // — in front, the cannon folded back under it)
  function foreFold(J, L, yk, sL) {
    const i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3; const Cp = legTop(J, L);
    const a1z = J[i1 + 2] - J[i0 + 2], a1y = J[i1 + 1] - J[i0 + 1], a2z = (J[i2 + 2] - J[i1 + 2]) * sL, a2y = (J[i2 + 1] - J[i1 + 1]) * sL;
    const l1 = Math.hypot(a1z, a1y), l2 = Math.hypot(a2z, a2y), b1 = Math.atan2(a1y, a1z), b2 = Math.atan2(a2y, a2z), b3 = Math.atan2(J[i3 + 1] - J[i2 + 1], J[i3 + 2] - J[i2 + 2]);
    const Tz = P0w[0] + l2 * 0.55, dz = Tz - P0w[0], dy = yk - P0w[1], al = Math.atan2(dy, dz); const d = clamp(Math.hypot(dz, dy), Math.abs(l1 - l2) * 1.02 + 1e-4, (l1 + l2) * 0.999);
    const sg = a1z * (a1y + a2y) - a1y * (a1z + a2z) >= 0 ? -1 : 1;
    const p1 = al + sg * Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const ez = P0w[0] + l1 * Math.cos(p1), ey = P0w[1] + l1 * Math.sin(p1); const p2 = Math.atan2(P0w[1] + d * Math.sin(al) - ey, P0w[0] + d * Math.cos(al) - ez);
    E[i0] = b1 - p1 - Cp; E[i1] = b2 - p2 - Cp - E[i0]; E[i2] = b3 - Cp - E[i0] - E[i1] - Math.PI * 0.94; E[i3] = 1.1;
  }
  function sit(form, J, k, sL, fy) {
    KE.set(E); KO.set(OFF); const lg = legsOf(form); const r = B.root * 3, sp = B.spine * 3, ch = B.chest * 3;
    const rump = form.meta.rump ? form.meta.rump * 1.15 : J[r + 1] * 0.36; OFF[0] = KO[0]; OFF[1] = rump - J[r + 1]; OFF[2] = 0;
    const g = lg[0], y3 = g.y3 * sL, Rf = reachOf(J, 'flL', 0, sL) * 0.965, dF = J[B.flL0 * 3 + 1] * 0.08;
    // (how far the back is raised: until the forelegs, straight, just reach the ground under the shoulder)
    const pose = a => { E[r] = KE[r] - 0.52 * a; E[sp] = KE[sp] - 0.3 * a; E[ch] = KE[ch] - 0.18 * a; return legTop(J, 'flL'); };
    let lo = 0, hi = 1.35;
    for (let n = 0; n < 14; n++) { const a = (lo + hi) * 0.5; pose(a); if (P0w[1] - y3 < Math.sqrt(Math.max(0, Rf * Rf - dF * dF))) lo = a; else hi = a; }
    const a = lo; pose(a);
    OFF[2] = g.z - (P0w[0] + dF); // (the forefeet stay where they stood)
    for (let q = 0; q < 2; q++) { const L = LEGS[q]; const Cp = legTop(J, L); legTo(J, L, Cp, P0w[0] + dF, y3 + (fy ? fy[q] : 0), 0, 0, sL); }
    for (let q = 2; q < 4; q++) hindFold(J, LEGS[q], lg[q].y3 * sL * 1.5 + (fy ? fy[q] : 0), sL);
    // (the head kept level and up; the tail lifted off the ground behind, its end lying back along it)
    E[B.neck0 * 3] += 0.5 * a; E[B.neck1 * 3] += 0.12 * a; E[B.head * 3] += 0.32 * a;
    E[B.tail0 * 3] += 0.72 * a - 0.35; E[B.tail1 * 3] += 0.3; E[B.tail2 * 3] += 0.25; E[B.tail3 * 3] += 0.2;
    tailOver(J, Math.max(form.meta.H * 0.03, (form.meta.tailR || form.meta.H * 0.05) * 0.95));
    SE.set(E); SO.set(OFF);
    for (let i = 0; i < NB * 3; i++) E[i] = KE[i] + (SE[i] - KE[i]) * k;
    for (let i = 0; i < 3; i++) OFF[i] = KO[i] + (SO[i] - KO[i]) * k;
  }

  // ------------------------------ the other families ------------------------------
  // a bird: afoot (walking with the head thrust forward at each step, pecking, looking about) or in the air (the fly mesh:
  // the wings beating — slow and deep for the big ones, fast for the small —, gliding with the tips up, the legs tucked)
  FA.bird = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1); if (st.young) SC[B.head] = 1 + st.young * 0.35; // (a chick: all head)
    const t = st.t, id = st.id || 0, ph = st.ph;
    const GX = st.gx && FA.Gest ? FA.Gest : null; if (GX) GX.begin('bird', form, sp, st, J[B.hlL0 * 3 + 1]); // (the gesture's layers: js/fauna-gesto3d.js)
    if (form.meta.fly) {
      const big = form.meta.H > 0.6, f = big ? 2.2 : 4.5; const flap = st.glide ? 0 : 1;
      const w = t * f * TAU + id; const a = Math.sin(w) * 0.62 * flap + (st.glide ? 0.12 : 0.05);
      for (const s of 'LR') { const sd = s === 'L' ? 1 : -1;
        E[B['fl' + s + '0'] * 3 + 2] = sd * a; E[B['fl' + s + '1'] * 3 + 2] = sd * Math.sin(w - 0.6) * 0.25 * flap; E[B['fl' + s + '2'] * 3 + 2] = sd * Math.sin(w - 1.1) * 0.3 * flap;
        E[B['fl' + s + '2'] * 3 + 1] = -sd * Math.max(0, Math.cos(w)) * 0.35 * flap; // (the hand swept back on the upstroke)
        E[B['hl' + s + '0'] * 3] = 1.1; E[B['hl' + s + '1'] * 3] = 0.9; E[B['hl' + s + '2'] * 3] = -0.6; E[B['hl' + s + '3'] * 3] = 1.2; }
      OFF[1] = -Math.sin(w) * form.meta.H * 0.03 * flap; E[B.root * 3] = (st.pitch || 0) * 0.5; E[B.root * 3 + 2] = -(st.bank || 0) * 0.6;
      E[B.neck0 * 3] = -0.25; E[B.head * 3] = 0.25 + (st.pitch || 0) * -0.3; E[B.tail1 * 3 + 1] = (st.bank || 0) * 0.3;
      if (GX) { GX.bird(J, form, st, true); GX.end(J, form, st); }
      return chain(m, J);
    }
    const walk = st.v > 0.03 ? Math.min(1, st.v / 0.15) : 0;
    // (the peck: the body tipped forward over the feet, which stay, and the neck bowed the rest of the way, until the tip of the
    // beak is at the ground — as low as the neck reaches)
    const peck = st.graze > 0.01 ? Math.max(0, Math.sin(t * 2.6 + id)) * st.graze : 0; let pth = 0;
    if (peck) {
      const r = 0, n0 = B.neck0 * 3, nose = form.meta.nose, ch = B.chest * 3, tilted = J[ch + 1] - J[r + 1] > 0.6 * Math.abs(J[ch + 2] - J[r + 2]); // (a perching bird sits upright: it tips further)
      const bp = (tilted ? 1.2 : 0.8) * peck * (form.meta.upright ? 0.3 : 1); E[B.root * 3] += bp;
      OFF[1] -= peck * J[B.hlL0 * 3 + 1] * (form.meta.upright ? 0.05 : 0.22); // (and crouched on its legs)
      const qz = J[n0 + 2] - J[r + 2], qy = J[n0 + 1] - J[r + 1], nz = nose[2] - J[r + 2], ny = nose[1] - J[r + 1];
      const n0z = rz(qz, qy, bp), n0y = J[r + 1] + OFF[1] + ry(qz, qy, bp), tz = rz(nz, ny, bp), ty = J[r + 1] + OFF[1] + ry(nz, ny, bp);
      const Rr = Math.hypot(ty - n0y, tz - n0z); pth = Math.max(0, Math.atan2(ty - n0y, tz - n0z) - Math.asin(clamp((0.01 - n0y) / Rr, -1, 1))) * peck / Math.max(peck, 1e-3);
    }
    // (each foot set down and left where it is while the body goes on over it — a stride as long as the leg, as the 3D counts
    // it —; lifted, the heel folding and the toes curling, and brought forward to where it will be set)
    const hipY = J[B.hlL0 * 3 + 1], half = FA.birdStride(form) * walk * 0.6 * 0.5, duty = 0.6;
    for (const s of 'LR') {
      const L = 'hl' + s, i3 = B[L + '3'] * 3, z3 = J[i3 + 2], y3 = J[i3 + 1]; let f = ph + (s === 'L' ? 0 : 0.5); f -= Math.floor(f);
      const Cp = legTop(J, L);
      if (f < duty) { const u = f / duty; legToB(J, L, Cp, z3 + half * (1 - 2 * u), y3, 0); }
      else {
        const u = (f - duty) / (1 - duty), u2 = u * u, u3 = u2 * u, sn = Math.sin(Math.PI * u), mv = -2 * half / duty * (1 - duty);
        const zz = (2 * u3 - 3 * u2 + 1) * (z3 - half) + (u3 - 2 * u2 + u) * mv + (3 * u2 - 2 * u3) * (z3 + half) + (u3 - u2) * mv;
        const ft = sn * 0.55 * walk, rf = hipY * 0.32; // (the toes curled as the foot swings, kept well off the ground)
        legToB(J, L, Cp, zz, Math.max(y3 + sn * hipY * 0.24 * walk, -Math.min(ry(rf, -y3, ft), ry(-rf * 0.5, -y3, ft)) + y3 + sn * hipY * 0.1 * walk), ft);
      }
    }
    if (form.meta.upright) { E[B.root * 3 + 2] = Math.sin(ph * TAU) * 0.12 * walk; E[B.spine * 3 + 2] = -Math.sin(ph * TAU) * 0.04 * walk; } // (the penguin's waddle)
    // (the head: thrust at each step, a peck at the ground now and then, turning to look; a shuffle of the wings)
    const nod = Math.sin(ph * TAU * 2) * 0.12 * walk;
    E[B.neck0 * 3] += nod + pth * 0.62; E[B.neck1 * 3] += pth * 0.28; E[B.neck2 * 3] += -nod * 0.6 + pth * 0.1; E[B.head * 3] -= nod * 0.4;
    if (peck > 0.01) { // (the neck's bones turn about their own joints: a few steps more until the beak is where it should be)
      const nz = form.meta.nose, jh = B.head * 3, want = 0.01, k0 = 1, bp0 = E[B.root * 3];
      for (let it = 0; it < 4; it++) { chain(I4, J); const e = R[B.head].elements; const y = e[1] * (nz[0] - J[jh]) + e[5] * (nz[1] - J[jh + 1]) + e[9] * (nz[2] - J[jh + 2]) + e[13];
        const dth = (y - want) / Math.max(0.05, Math.hypot(nz[1] - J[B.neck0 * 3 + 1], nz[2] - J[B.neck0 * 3 + 2])) * k0; if (Math.abs(dth) < 0.005) break;
        const d = Math.min(dth, Math.max(0, 2.5 - pth - Math.min(bp0, 0.8))); pth += d; E[B.neck0 * 3] += d * 0.62; E[B.neck1 * 3] += d * 0.28; E[B.neck2 * 3] += d * 0.1; } // (never bowed past straight down)
    }
    const look = st.look || 0; E[B.neck1 * 3 + 1] = look * 0.4; E[B.head * 3 + 1] = look * 0.6;
    const sh = Math.max(0, Math.sin(t * 0.7 + id * 1.9) - 0.96) * 12; for (const s of 'LR') E[B['fl' + s + '0'] * 3 + 2] = (s === 'L' ? 1 : -1) * sh * 0.25;
    E[B.tail1 * 3] = Math.sin(t * 1.2 + id) * 0.05 - walk * Math.sin(ph * TAU * 2) * 0.05;
    E[B.jaw * 3] = st.jaw ? 0.3 : 0;
    if (GX) { GX.bird(J, form, st, false); GX.end(J, form, st); }
    return chain(m, J);
  };
  // (how far a bird goes in one stride: most of its leg's length, thigh, shank and foot — read once a form)
  FA.birdStride = form => { if (form._bs) return form._bs; const J = form.J; let l = 0;
    for (let k = 0; k < 3; k++) { const a = B['hlL' + k] * 3, b = B['hlL' + (k + 1)] * 3; l += Math.hypot(J[b] - J[a], J[b + 1] - J[a + 1], J[b + 2] - J[a + 2]); }
    form._bs = Math.max(0.03, l * 0.7); return form._bs; };
  // a snake: the wave running back along its bones as it goes; at rest it lies in a lazy curve, the head raised a little
  FA.snake = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1);
    const GX = st.gx && FA.Gest ? FA.Gest : null; const vv = GX ? st.v * GX.begin('snake', form, sp, st, form.meta.H) : st.v; // (the gesture's layers: js/fauna-gesto3d.js)
    const order = ['tail3', 'tail2', 'tail1', 'tail0', 'root', 'spine', 'chest', 'neck0', 'neck1', 'neck2', 'head'];
    const go = Math.min(1, vv / 0.1); const A = 0.32 * (0.35 + 0.65 * go);
    for (let k = 0; k < order.length; k++) {
      const b = B[order[k]] * 3, u = k / (order.length - 1); const w = Math.sin((st.ph - u * 1.6) * TAU) * A * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, u * 1.1)));
      // (the chain grows both ways from the root: the head's side turns as it is, the tail's the other way)
      E[b + 1] = (k < 4 ? -1 : 1) * (w - (k > 0 ? Math.sin((st.ph - (k - 1) / (order.length - 1) * 1.6) * TAU) * A * 0.0 : 0)) * 0.55;
    }
    E[B.head * 3 + 1] = -E[B.neck2 * 3 + 1] * 0.8; E[B.neck2 * 3] = -0.12 * (1 - go * 0.5); E[B.head * 3] = 0.1;
    E[B.jaw * 3] = st.jaw ? 0.5 : 0;
    if (GX) { GX.snake(J, form, st, order); GX.end(J, form, st); }
    return chain(m, J);
  };
  // the sprawling (the crocodile, the lizard): the legs out to the side swing forward and back in diagonal pairs, lifted at
  // the elbow; the body bends from side to side with them and the tail sweeps
  FA.sprawl = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1);
    const GX = st.gx && FA.Gest ? FA.Gest : null; const vv = GX ? st.v * GX.begin('sprawl', form, sp, st, form.meta.H * 0.6) : st.v; // (the gesture's layers: js/fauna-gesto3d.js)
    const go = Math.min(1, vv / 0.12), ph = st.ph;
    const off = { flL: 0, hlR: 0, flR: 0.5, hlL: 0.5 };
    for (const L of ['flL', 'flR', 'hlL', 'hlR']) {
      const sd = L[2] === 'L' ? 1 : -1; let f = ph + off[L]; f -= Math.floor(f); const duty = 0.55;
      let ang, lift; if (f < duty) { const u = f / duty; ang = 0.55 * (1 - 2 * u); lift = 0; } else { const u = (f - duty) / (1 - duty); ang = -0.55 + 1.1 * sstep(u); lift = Math.sin(Math.PI * u); }
      E[B[L + '0'] * 3 + 1] = -sd * ang * go; E[B[L + '0'] * 3 + 2] = sd * lift * 0.45 * go; E[B[L + '1'] * 3 + 2] = -sd * lift * 0.25 * go;
    }
    const bend = Math.sin(ph * TAU) * 0.16 * go; E[B.spine * 3 + 1] = bend; E[B.chest * 3 + 1] = -bend * 0.6; E[B.root * 3 + 1] = -bend * 0.5;
    for (let k = 0; k < 4; k++) E[B['tail' + k] * 3 + 1] = Math.sin(ph * TAU - 0.9 - k * 0.7) * 0.18 * go + Math.sin(st.t * 0.4 + st.id + k) * 0.05;
    E[B.head * 3 + 1] = (st.look || 0) * 0.3 - bend * 0.5; E[B.jaw * 3] = st.jaw ? 0.6 : Math.max(0, Math.sin(st.t * 0.13 + st.id) - 0.9) * 4 * 0.5; // (the gape in the sun)
    if (GX) { GX.sprawl(J, form, st); GX.end(J, form, st); }
    return chain(m, J);
  };
  // the frog: sitting, its throat pulsing; going, it hops — the hind legs straighten, the body flies forward and lands
  FA.frog = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1);
    const GX = st.gx && FA.Gest ? FA.Gest : null; const vv = GX ? st.v * GX.begin('frog', form, sp, st, form.meta.H) : st.v; // (the gesture's layers: js/fauna-gesto3d.js)
    if (vv > 0.02) {
      let f = st.ph; f -= Math.floor(f); const air = f < 0.55 ? Math.sin(Math.PI * f / 0.55) : 0, push = f < 0.25 ? Math.sin(Math.PI * f / 0.25) : 0;
      OFF[1] = air * form.meta.L * 0.5; E[B.root * 3] = -0.35 * air;
      for (const s of 'LR') { E[B['hl' + s + '0'] * 3] = -1.0 * (push + air * 0.6); E[B['hl' + s + '1'] * 3] = 1.4 * (push + air * 0.7); E[B['hl' + s + '2'] * 3] = -1.0 * (push + air * 0.5); E[B['fl' + s + '0'] * 3] = -0.6 * air; }
    }
    E[B.jaw * 3] = Math.max(0, Math.sin(st.t * 5 + st.id)) * 0.04;
    if (GX) { GX.frog(J, form, st); GX.end(J, form, st); }
    return chain(m, J);
  };
  // the seal: on land it humps along — the body arching and stretching, the fore flippers pushing; at rest it lifts its head
  FA.seal = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1);
    const GX = st.gx && FA.Gest ? FA.Gest : null; const vv = GX ? st.v * GX.begin('seal', form, sp, st, form.meta.H) : st.v; // (the gesture's layers: js/fauna-gesto3d.js)
    const go = Math.min(1, vv / 0.15), w = st.ph * TAU;
    E[B.spine * 3] = Math.sin(w) * 0.18 * go; E[B.chest * 3] = -Math.sin(w) * 0.14 * go; E[B.root * 3] = -Math.sin(w + 0.8) * 0.1 * go; OFF[1] = Math.max(0, Math.sin(w)) * form.meta.H * 0.12 * go;
    for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '0'] * 3] = Math.sin(w) * 0.5 * go; E[B['hl' + s + '1'] * 3] = -0.2 - Math.sin(w) * 0.15 * go; E[B['hl' + s + '1'] * 3 + 2] = sd * 0.1; }
    E[B.neck0 * 3] = -0.15 + Math.sin(w) * 0.1 * go; E[B.head * 3 + 1] = (st.look || 0) * 0.5; E[B.neck1 * 3 + 1] = (st.look || 0) * 0.3;
    if (GX) { GX.seal(J, form, st); GX.end(J, form, st); }
    return chain(m, J);
  };
  // the swimmers of the sea (D-267): the wave runs back down the body to the tail — up and down for the dolphin, the orca and
  // the whale (the flukes beat, the stock bends most, the head rides a little against it, the body heaves), from side to side
  // for the shark (its head swinging against its tail) —, faster and deeper the faster it goes, a slow sway as it lies at the
  // surface; it bends into its turns, the inner fin dipping; the whole body pitched and rolled about its middle (the leap's
  // arc, the whale's dive — st.arch bows its back as it goes over —, a bank in a turn); the jaw open on the chase. st: { v
  // (m/s), ph (the beats, counted), t, id, pitch (+ nose up), bank, arch (0..1), turn (-1..1, + to its left), jaw (0..1) }
  FA.swim = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1); // (the scale of each bone: a young one posed before it must not pass it on)
    const sw = form.meta.swim || {}; const t = st.t, id = st.id || 0, w = st.ph * TAU;
    const go = Math.min(1, st.v / Math.max(0.3, form.meta.L * 0.4)); const amp = 0.05 + 0.13 * go, arch = st.arch || 0, turn = st.turn || 0;
    const TL = [B.tail0, B.tail1, B.tail2, B.tail3], FR = [B.spine, B.chest, B.neck0, B.neck1, B.neck2, B.head];
    if (sw.beat === 'h') {
      for (let k = 0; k < 4; k++) E[TL[k] * 3 + 1] = Math.sin(w - (k + 1) * 0.7) * amp * (0.5 + k * 0.35);
      E[B.root * 3 + 1] = Math.sin(w) * amp * 0.25; E[B.chest * 3 + 1] = -Math.sin(w + 0.5) * amp * 0.25; E[B.head * 3 + 1] = -Math.sin(w + 0.9) * amp * 0.3;
    } else {
      for (let k = 0; k < 4; k++) E[TL[k] * 3] = Math.sin(w - k * 0.75) * amp * (0.3 + k * 0.32);
      E[B.chest * 3] = -Math.sin(w + 0.6) * amp * 0.12; E[B.head * 3] = Math.sin(w + 1.1) * amp * 0.1;
      OFF[1] = Math.sin(w + 1.6) * (sw.R || 0.2) * 0.07 * go;
    }
    // (the turn: the body curves into it, head and tail toward its inside)
    for (let k = 0; k < 4; k++) E[TL[k] * 3 + 1] -= turn * 0.09; for (let k = 0; k < 4; k++) E[FR[k] * 3 + 1] += turn * 0.06;
    // (the back bowed over — the leap's top, the whale going down: the head and the flukes lower than the middle)
    for (let k = 0; k < 4; k++) E[TL[k] * 3] -= arch * 0.14; E[B.chest * 3] += arch * 0.12; E[B.neck0 * 3] += arch * 0.1;
    E[B.root * 3] -= st.pitch || 0; E[B.root * 3 + 2] += st.bank || 0;
    // (the pectoral fins: held out a little, tilting with the beat and the bank, the inner one down in a turn; the shark's stiff)
    const stiff = sw.beat === 'h' ? 0.35 : 1;
    for (const s of 'LR') { const sd = s === 'L' ? 1 : -1;
      E[B['fl' + s + '0'] * 3 + 2] = sd * (Math.sin(t * 0.7 + id + sd) * 0.08 - Math.sin(w) * 0.06 * go) * stiff + turn * 0.25 * stiff;
      E[B['fl' + s + '0'] * 3] = (Math.sin(t * 0.5 + id * 1.3) * 0.08 - (st.pitch || 0) * 0.2) * stiff; E[B['fl' + s + '2'] * 3 + 2] = sd * Math.sin(t * 0.7 + id + sd - 0.6) * 0.05 * stiff;
      E[B['hl' + s + '0'] * 3 + 2] = sd * Math.sin(t * 0.6 + id) * 0.05; }
    if (st.jaw) { E[B.jaw * 3] = st.jaw * 0.42; E[B.head * 3] -= st.jaw * 0.12; }
    return chain(m, J);
  };
  // the sea turtle: the long front flippers fly — down and back with the blade turned, up and forward edge first, the tip
  // lagging —, the hind ones steer; floating at the surface it paddles slowly; the head lifts to breathe (st.lift) and looks
  FA.turtle = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1);
    const t = st.t, id = st.id || 0, w = st.ph * TAU; const go = 0.3 + 0.7 * Math.min(1, st.v / Math.max(0.2, form.meta.L * 0.5));
    for (const s of 'LR') { const sd = s === 'L' ? 1 : -1;
      E[B['fl' + s + '0'] * 3 + 2] = sd * (Math.cos(w) * 0.55 * go + 0.05); E[B['fl' + s + '0'] * 3 + 1] = sd * (-Math.cos(w - 0.6) * 0.32 * go + 0.1);
      E[B['fl' + s + '1'] * 3] = Math.sin(w) * 0.45 * go; E[B['fl' + s + '2'] * 3 + 2] = sd * Math.cos(w - 0.7) * 0.28 * go;
      E[B['hl' + s + '0'] * 3 + 1] = sd * (Math.sin(t * 0.8 + id + sd) * 0.15 + (st.turn || 0) * 0.3 * sd); E[B['hl' + s + '1'] * 3 + 2] = sd * Math.sin(w + 1.2) * 0.12 * go; }
    OFF[1] = -Math.cos(w) * (form.meta.H || 0.4) * 0.04 * go;
    const lift = st.lift || 0; E[B.neck0 * 3] = -0.15 - lift * 0.35 + Math.sin(w) * 0.04 * go; E[B.neck1 * 3] = -lift * 0.15; E[B.head * 3] = 0.1 + lift * 0.2;
    E[B.neck1 * 3 + 1] = (st.look || 0) * 0.35; E[B.head * 3 + 1] = (st.look || 0) * 0.3;
    E[B.jaw * 3] = Math.max(0, Math.sin(t * 0.37 + id) - 0.96) * 6;
    E[B.tail0 * 3 + 1] = Math.sin(t * 0.9 + id) * 0.2;
    E[B.root * 3] -= st.pitch || 0; E[B.root * 3 + 2] += st.bank || 0;
    return chain(m, J);
  };

  // ------------------------------ the dragon (D-270) ------------------------------
  // the dragon of the god's power (js/dragon3d.js poses it from what the world's dragon does: st.pose). In the air (the mesh
  // with the wings spread): the deep slow strokes of a great wing — the downstroke quicker than the upstroke, the arm and the
  // hand half folding on the way up, the fingers' tips lagging, the body rising as the wings come down —; the glide on still
  // wings; the run over a town on wings half swept back, the neck stretched down to breathe; the stoop on wings folded back,
  // the claws thrown forward at the bottom; the flare to land and the strokes to take off, the legs reaching for the ground;
  // the fight reared up on its feet, the wings raised; the fall. On the ground (the wings folded): asleep, curled round on its
  // hoard, breathing slowly. Dead: lying on its spread wings. st: { pose ('voo', 'planeio', 'rasante', 'mergulho', 'pouso',
  // 'decola', 'luta', 'queda', 'dorme', 'morto'), ph (the wingbeat, in strokes), t (the view's clock), id, jaw (0 shut, 1
  // wide), k (how far into a landing, a takeoff, the grab at a dive's bottom, the fall: 0..1), look (-1..1), tum (the fall's
  // turning), ground and sc (the ground's height and the scale: the poses on its feet stand on it) }
  const DQ = { q: null, e: null, v: null };
  function hinge(bone, ax, ang, sd) { // (the fingers bend about the line of their knuckles — an axis of the bind, mirrored on the right)
    if (!DQ.q) { DQ.q = new THREE.Quaternion(); DQ.e = new THREE.Euler(); DQ.v = new THREE.Vector3(); }
    DQ.q.setFromAxisAngle(DQ.v.set(ax[0] * sd, ax[1], ax[2]).normalize(), ang * sd); DQ.e.setFromQuaternion(DQ.q, 'YXZ');
    E[bone * 3] = DQ.e.x; E[bone * 3 + 1] = DQ.e.y; E[bone * 3 + 2] = DQ.e.z;
  }
  // (a stroke: w the phase — 0 the wings up —, A how deep, fold how far the arm and the hand are drawn in, sw how far swept back)
  function stroke(w, A, fold, sw, ax) {
    const f = w + 0.38 * Math.sin(w), c = Math.cos(f), sn = Math.sin(f), up = Math.max(0, -sn);
    for (const s of 'LR') {
      const sd = s === 'L' ? 1 : -1; const f0 = B['fl' + s + '0'] * 3, f1 = B['fl' + s + '1'] * 3, f2 = B['fl' + s + '2'] * 3;
      E[f0 + 2] = sd * (A * c + 0.1); E[f0 + 1] = sd * (sw - 0.16 * sn * A); E[f0] = 0.14 * sn * A;
      E[f1 + 1] = sd * (fold + 0.34 * up * A); E[f2 + 1] = sd * (fold * 1.15 + 0.42 * up * A); E[f2 + 2] = sd * 0.22 * A * Math.cos(f - 0.7);
      hinge(B['fl' + s + '3'], ax, 0.26 * A * Math.cos(f - 1.4) + 0.04, sd);
    }
    return c;
  }
  function legs(tuck, reach) { // (in the air the legs drawn back under the tail; reaching forward and down to land, to grab, to stand)
    for (const s of 'LR') {
      E[B['hl' + s + '0'] * 3] += 2.0 * tuck + 0.3 * reach; E[B['hl' + s + '1'] * 3] += -1.2 * tuck - 0.1 * reach;
      E[B['hl' + s + '2'] * 3] += 1.0 * tuck + 0.2 * reach; E[B['hl' + s + '3'] * 3] += 0.8 * tuck - 0.3 * reach;
    }
  }
  function lash(t, id, a, side) { // (the tail: a slow wave down it; side: curled to one side)
    for (let k = 0; k < 4; k++) { const b = B['tail' + k] * 3; E[b + 1] += Math.sin(t * 0.9 + id - k * 0.8) * a * (0.5 + k * 0.3) + (side || 0); E[b] += Math.sin(t * 0.67 + id * 1.3 - k * 0.6) * a * 0.35; }
  }
  FA.dragon = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0); SC.fill(1);
    const t = st.t, id = st.id || 0, w = (st.ph || 0) * TAU, ax = form.meta.wing3 || [0, 0, -1], k = st.k || 0, pose = st.pose;
    if (pose === 'dorme') {
      // asleep: the body down on its folded legs, the neck round to its flank and the head on the ground, the tail round the
      // other way to meet it, the wings close along it; the slow breath
      const br = Math.sin(t * 1.25 + id);
      OFF[1] = -1.5 + br * 0.035; E[B.spine * 3] = br * 0.014; E[B.chest * 3] = -0.05 - br * 0.012;
      for (const s of 'LR') {
        const sd = s === 'L' ? 1 : -1;
        E[B['hl' + s + '0'] * 3] = -0.8; E[B['hl' + s + '1'] * 3] = 0.9; E[B['hl' + s + '2'] * 3] = -0.55; E[B['hl' + s + '3'] * 3] = 0.45; E[B['hl' + s + '0'] * 3 + 2] = sd * 0.1;
        E[B['fl' + s + '0'] * 3 + 2] = sd * 0.12; E[B['fl' + s + '0'] * 3] = 0.5; E[B['fl' + s + '1'] * 3] = -0.7; E[B['fl' + s + '2'] * 3] = 0.2;
      }
      E[B.neck0 * 3] = 1.25; E[B.neck1 * 3] = 0.25; E[B.neck2 * 3] = -0.3; E[B.head * 3] = -1.4;
      E[B.neck0 * 3 + 1] = 0.45; E[B.neck1 * 3 + 1] = 0.55; E[B.neck2 * 3 + 1] = 0.5; E[B.head * 3 + 1] = 0.35; E[B.head * 3 + 2] = -0.12;
      lash(t * 0.3, id, 0.015, -0.42); E[B.tail0 * 3] += -0.06; E[B.tail1 * 3] += 0.38; E[B.tail2 * 3] += -0.02; E[B.tail3 * 3] += -0.16;
      for (const s of 'LR') E[B['ear' + s] * 3] = 0.35;
      // (just landed, k from 0 to 1: it lies down from where it stood, the wings folded)
      const kd = st.k === undefined ? 1 : st.k; if (kd < 1) { for (let i = 0; i < E.length; i++) E[i] *= kd; OFF[1] *= kd; }
      return chain(m, J);
    }
    if (pose === 'morto') {
      // dead: down on its belly on its spread wings, their tips on the ground, the neck stretched out and the head on its side
      OFF[1] = -1.4; E[B.root * 3 + 2] = 0.12;
      for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '0'] * 3 + 2] = -sd * 0.16; E[B['fl' + s + '1'] * 3 + 1] = sd * 0.12; E[B['fl' + s + '2'] * 3 + 2] = -sd * 0.12; hinge(B['fl' + s + '3'], ax, -0.12, sd);
        E[B['hl' + s + '0'] * 3] = -0.8; E[B['hl' + s + '0'] * 3 + 2] = sd * 0.3; E[B['hl' + s + '1'] * 3] = 0.9; E[B['hl' + s + '2'] * 3] = -0.55; E[B['hl' + s + '3'] * 3] = 0.6; E[B['ear' + s] * 3] = 0.5; }
      E[B.neck0 * 3] = 0.62; E[B.neck1 * 3] = 0.22; E[B.neck1 * 3 + 1] = 0.3; E[B.neck2 * 3 + 1] = 0.35; E[B.head * 3 + 1] = 0.2; E[B.head * 3 + 2] = 1.0;
      lash(0, id, 0, 0.16); E[B.tail0 * 3] = -0.3; E[B.tail1 * 3] += 0.22; E[B.tail2 * 3] += 0.06; E[B.jaw * 3] = 0.3;
      return chain(m, J);
    }
    if (pose === 'luta') {
      // the fight at its lair: reared on its feet, the wings raised and spread, beating slowly to threaten, the neck bent down to
      // the climbers and the jaws snapping, the tail lashing
      const c = stroke(w, 0.3, 0.25, 0.1, ax);
      for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '0'] * 3 + 2] += sd * 0.45; }
      E[B.root * 3] = -0.5; E[B.spine * 3] = -0.05 + c * 0.02;
      for (const s of 'LR') { E[B['hl' + s + '0'] * 3] = 0.5; E[B['hl' + s + '0'] * 3 + 2] = (s === 'L' ? 1 : -1) * 0.08; } // (the legs straight under it, as it rears on the hips)
      E[B.neck0 * 3] = 0.25; E[B.neck1 * 3] = 0.4; E[B.neck2 * 3] = 0.3; E[B.head * 3] = 0.05;
      const look = st.look || 0; E[B.neck1 * 3 + 1] = look * 0.3 + Math.sin(t * 0.8 + id) * 0.12; E[B.head * 3 + 1] = look * 0.3;
      lash(t * 2.4, id, 0.14, 0); E[B.tail0 * 3] += 0.42; E[B.tail1 * 3] += 0.1;
      for (const s of 'LR') E[B['ear' + s] * 3] = -0.2 + Math.sin(t * 3 + (s === 'L' ? 0 : 1)) * 0.1;
    } else if (pose === 'queda') {
      // the fall: the wings thrown about, the neck and the tail whipping
      stroke(w * 1.7, 0.55, 0.3, 0.2, ax);
      for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '1'] * 3 + 1] += sd * Math.sin(t * 5.1 + (sd > 0 ? 0 : 2)) * 0.35; }
      E[B.neck0 * 3] = Math.sin(t * 3.3) * 0.35; E[B.neck1 * 3 + 1] = Math.sin(t * 2.7) * 0.4; E[B.head * 3 + 2] = Math.sin(t * 2.1) * 0.5;
      lash(t * 4, id, 0.3, 0); legs(0.3, 0.4); E[B.jaw * 3] = 0.35;
    } else {
      // in the air: the strokes (and the glide between them), the stoop, the run, the flare to land and the climb to take off
      let A = st.amp === undefined ? 0.74 : st.amp, fold = 0, sw = 0, tuck = 1, reach = 0; // (amp: how deep, eased by the drawer between strokes and glide)
      if (pose === 'planeio') { A = 0.06; sw = 0.05; }
      else if (pose === 'rasante') { A = 0.12; sw = 0.18; fold = 0.08; }
      else if (pose === 'mergulho') { A = 0.08 + 0.6 * k; sw = 0.55 * (1 - k); fold = 0.85 * (1 - k); tuck = 1 - k; reach = k; }
      else if (pose === 'pouso') { A = 0.85; sw = -0.3; tuck = 0; reach = 1; }
      else if (pose === 'decola') { A = 0.9; sw = -0.15; tuck = k; reach = 1 - k; }
      const c = stroke(w, A, fold, sw, ax);
      if (pose === 'mergulho') for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '0'] * 3 + 2] += sd * 0.28 * (1 - k); }
      OFF[1] = -c * 0.32 * A; E[B.spine * 3] = c * 0.03 * A; E[B.neck0 * 3] = c * 0.05 * A - 0.05; E[B.head * 3] = -c * 0.04 * A + 0.05;
      if (pose === 'rasante') { E[B.neck0 * 3] += 0.22; E[B.neck1 * 3] += 0.16; E[B.neck2 * 3] += 0.1; E[B.head * 3] += 0.1; }
      if (pose === 'pouso' || pose === 'decola') { const f = pose === 'pouso' ? 1 : 1 - k; E[B.root * 3] = -0.55 * f; E[B.neck0 * 3] -= 0.25 * f; E[B.neck1 * 3] += 0.2 * f; E[B.tail0 * 3] += 0.42 * f; E[B.tail1 * 3] += 0.12 * f; }
      legs(tuck, reach);
      if (pose === 'mergulho') for (const s of 'LR') E[B['hl' + s + '0'] * 3] -= 0.8 * k; // (the claws thrown forward at the bottom)
      const look = st.look || 0; E[B.neck1 * 3 + 1] = look * 0.25; E[B.neck2 * 3 + 1] = look * 0.2; E[B.head * 3 + 1] = look * 0.25;
      lash(t, id, pose === 'mergulho' ? 0.02 : 0.07, 0);
      for (const s of 'LR') E[B['ear' + s] * 3] = (pose === 'mergulho' ? 0.5 : 0.15) + Math.sin(t * 7 + (s === 'L' ? 0 : 1.3)) * 0.06;
    }
    E[B.jaw * 3] = Math.max(E[B.jaw * 3], (st.jaw || 0) * 0.62);
    let R = chain(m, J);
    if (st.plant) { // (its feet on the ground: the body shifted until the lower foot stands on it)
      const sc = st.sc || 1; const low = Math.min(R[B.hlL3].elements[13], R[B.hlR3].elements[13]);
      OFF[1] += (st.ground + J[B.hlL3 * 3 + 1] * sc - low) / sc; R = chain(m, J);
    }
    return R;
  };
  // (a point of the beast as it was modelled, where its bone has it now — the dragon's mouth, for its breath)
  FA.point = function (R, form, bone, p, out) {
    const b = B[bone], e = R[b].elements, J = form.J; const x = p[0] - J[b * 3], y = p[1] - J[b * 3 + 1], z = p[2] - J[b * 3 + 2];
    out[0] = e[0] * x + e[4] * y + e[8] * z + e[12]; out[1] = e[1] * x + e[5] * y + e[9] * z + e[13]; out[2] = e[2] * x + e[6] * y + e[10] * z + e[14];
    return out;
  };
  // the dragon's coat, of its hue (dragon.js HUES: the body, the dark, the wings, the belly, the eyes; the breath, fire or
  // frost): the scales of its body darker at their rims, the plates down its belly, the darker line of its back and its
  // spines, the horns of old bone, the black claws, the membrane of its wings — the sun shows through it —, the eyes of fire
  // with their slit (shut: the lid), the mouth red and glowing when it breathes. o: { shut, eye (the eyes' light), mouth
  // (the mouth's glow) }; out: the coat to fill (the dragon's own: it changes as it breathes)
  const DHORN = { Rubro: '#e6d6b4', Verde: '#d6cfa4', Negro: '#4a4250', Branco: '#a8b4c4', Dourado: '#f4e6b8' };
  const dcoat = new Map(); G.worldHooks.push(() => dcoat.clear());
  FA.dragonCoat = function (three, look, o, out) {
    if (!Cc) Cc = new three.Color();
    const key = look.n + ':' + look.body; let C = dcoat.get(key);
    if (!C) {
      const frost = look.breath === 'gelo', H = G.Fauna3D && G.Fauna3D.form('dragon') ? G.Fauna3D.form('dragon').meta.H : 3.4;
      C = [
        [...lin(look.body), 15], [...lin(look.belly), 0.9], [...lin(mixHex(look.body, look.dark, 0.6)), 10],
        [...lin(mixHex(look.body, look.dark, 0.45)), 0.45], [...lin(mixHex(look.body, look.dark, 0.2)), 0.3],
        [...lin(look.dark), 0], [...lin(DHORN[look.n] || '#e6d6b4'), 0], [...lin(frost ? '#2a3440' : '#1a1512'), 0],
        [...lin(frost ? '#b4e6ff' : '#ff9a38'), 0.55], [...lin(look.eye), 1], [...lin(look.dark), 0.45], [...lin(look.dark), 0.5],
        [...lin(look.belly), 0], [0.55, (look.n.charCodeAt(0) * 7) % 40, 0, 0.32], [...lin(look.dark), 0], [...lin(look.wing), 0],
        [0, H, 0, 1], [...lin(frost ? '#284a66' : '#5a1810'), 0],
      ];
      dcoat.set(key, C);
    }
    if (!out) out = C.map(c => c.slice());
    for (let k = 0; k < C.length; k++) { const a = C[k], b = out[k]; b[0] = a[0]; b[1] = a[1]; b[2] = a[2]; b[3] = a[3]; }
    out[9][3] = o && o.shut ? 3 : 1; out[7][3] = o && !o.shut ? (o.eye === undefined ? 0.6 : o.eye) : 0; out[17][3] = (o && o.mouth) || 0;
    return out;
  };

  // (the kernel the gesture's layers pose with — js/fauna-gesto3d.js: the turns, the root's shift, the sizes, the bones, the
  // legs reached by their feet, the frames)
  FA.K = { E, OFF, SC, B, NB, LEGS, P0w, chainI, chain, legTop, legTo, legToP, legToB, reachOf, lowJoint, legsOf, tailOver, hindFold, foreFold, rz, ry, clamp, sstep, R };
  FA.ready3 = three => { if (!THREE) start(three); };
  // ------------------------------ the coat ------------------------------
  // (each kind's paint over the colours the god's view gives it — col, bel (the belly), dk (the pattern's dark, a bird's wing
  // tips), pat (0 plain · 1 the giraffe · 2 the zebra · 3 the tiger · 4 rosettes · 5 spots · 6 patches · 7 the tabby · 8 scutes ·
  // 9 saddles · 10 wool · 11 feathers · 12 dapples · 13 the forequarters dark · 14 wrinkled hide), sc its scale, con its
  // strength; sock (the legs), mz (the muzzle), nose (its leather), mane (the mane, the tail's tip — a bird's tail), tip (how
  // much of the tail), horn, hoof (a bird's legs), beak, iris, pupil (0 round 1 slit 2 bar), ear (the ear tips; a bird's wing
  // tips: its amount), back (the back's line), th (throat and breast), mask (the face; a bird's head), wing, bars, band (the
  // flank's dark band), grain (the fur), fwd (the eyes forward), inner (the inside of the ear; the comb and the wattle))
  const PAINT = {
    deer: { pupil: 2, mz: '#3a2c22', mzA: 0.5, back: '#7a4a28', backA: 0.35, th: '#efe4d0', thA: 0.6, sockA: 0.25, ear: '#4a3424', earA: 0.4, belA: 0.8, horn: '#d8c8a8' },
    reindeer: { pupil: 2, th: '#f0ece4', thA: 0.85, mz: '#3a3028', mzA: 0.5, sock: '#5a4a3a', sockA: 0.35, horn: '#c8b898' },
    moose: { pupil: 2, sock: '#9a8a78', sockA: 0.7, mz: '#2a1e16', mzA: 0.4, horn: '#c8b898', mane: '#2a1e16', belA: 0.4 },
    muskox: { pupil: 2, back: '#8a7a64', backA: 0.6, sock: '#d8d0c0', sockA: 0.85, horn: '#d8ccb0', mane: '#3a2c22', grain: 1.4 },
    bison: { pupil: 2, pat: 13, dk: '#2e2016', sc: 0.12, con: 1, mane: '#2e2016', tipA: 1, horn: '#2a2420', grain: 1.4 },
    ibex: { pupil: 2, horn: '#6a5a48', back: '#6a5038', backA: 0.4, sock: '#5a4a3a', sockA: 0.4, mane: '#5a4632', iris: '#a87a3a' },
    boar: { col: '#5a4636', bel: '#4a3a2c', mane: '#2e241c', mz: '#3a2e26', mzA: 0.5, nose: 0.7, grain: 1.3, iris: '#2a1a10' },
    capybara: { mz: '#4a3220', mzA: 0.5, nose: 0.6 },
    tapir: { ear: '#e8e4e0', earA: 1, mz: '#2e2a30', mzA: 0.4, grain: 0.5 },
    zebra: { pat: 2, sc: 3.2, con: 1, mz: '#1a1a1a', mzA: 0.9, belA: 0, tipA: 1, pupil: 2 },
    gazelle: { belA: 1, band: 0.9, mz: '#3a2a20', mzA: 0.3, th: '#f2e6d0', thA: 0.5, horn: '#3a3028', mane: '#2a2018', tipA: 1, pupil: 2 },
    gnu: { mask: '#3a3a40', maskA: 0.8, pat: 2, con: 0.25, dk: '#3a3a40', sc: 2.5, horn: '#2a2622', tipA: 1, pupil: 2 },
    giraffe: { col: '#ecd09a', pat: 1, dk: '#8a5226', sc: 3.4, con: 1, bel: '#f0e0c0', belA: 0.5, sock: '#f0e4cc', sockA: 0.7, mane: '#5a3a1e', tipA: 1, mz: '#d8c0a0', mzA: 0.4 },
    elephant: { col: '#8a8884', bel: '#7a7874', grain: 0.25, pat: 14, sc: 3, con: 0.6, inner: '#9a7a7a', iris: '#2a1a10' },
    rhino: { col: '#8a8680', bel: '#7e7a74', grain: 0.25, pat: 14, sc: 3, con: 0.5, horn: '#a8a090', iris: '#2a1a10' },
    hippo: { belA: 0.9, mz: '#c8a0a8', mzA: 0.4, grain: 0.2, pat: 14, sc: 2.5, con: 0.3, inner: '#c8a0a8' },
    buffalo: { horn: '#2a2420', grain: 0.8, mz: '#2a2420', mzA: 0.3 },
    camel: { mane: '#a8804a', mz: '#a8885a', mzA: 0.3 },
    vaca: { pupil: 2, pat: 6, sc: 1.7, con: 1, mz: '#d8a8a0', mzA: 0.6, nose: 0.5, horn: '#d8ccb0', belA: 0.4, mane: '#3a2a20', tipA: 1, grain: 0.4, inner: '#e8b0a8' },
    ovelha: { pat: 10, sc: 6, mask: '#4a403a', maskA: 1, sock: '#3a322c', sockA: 0.95, ear: '#4a403a', earA: 0.9, mz: '#3a322c', mzA: 0.6, grain: 0, pupil: 2, iris: '#a88a3a' },
    cabra: { horn: '#6a5a48', pupil: 2, iris: '#c8a040', mane: '#5a4632', back: '#6a5038', backA: 0.4 },
    porco: { mz: '#e89888', mzA: 0.6, nose: 0.2, grain: 0.3, inner: '#e89080', belA: 0.5 },
    cavalo: { pupil: 2, mz: '#3a2c26', mzA: 0.65, sockA: 0.55, sock: '#2a1e16', belA: 0.2, mane: '#2a1a10', grain: 0.6 },
    fox: { belA: 1, th: '#f4ece0', thA: 1, sock: '#2a1e18', sockA: 0.9, ear: '#2a1e18', earA: 0.9, mane: '#f4ece0', tipA: 1, mz: '#f4ece0', mzA: 0.3, nose: 1, iris: '#c8962e', fwd: 0.7, pupil: 1 },
    arcticfox: { nose: 1, iris: '#c8962e', fwd: 0.7 },
    fennec: { th: '#f8ecd4', thA: 0.8, mane: '#4a3020', tipA: 0.8, inner: '#e8b8a0', nose: 1, iris: '#3a2a1a', fwd: 0.7 },
    wolf: { col: '#7e7a72', bel: '#c8c2b6', iris: '#c8962e', fwd: 0.7, back: '#4a4644', backA: 0.5, th: '#e8e2d6', thA: 0.7, mz: '#d8d2c6', mzA: 0.45, nose: 1, ear: '#3a3634', earA: 0.5, belA: 0.75, mask: '#d8d2c8', maskA: 0.2, mane: '#3a3634', tipA: 0.6 },
    hyena: { pat: 5, sc: 4, mane: '#3a2a1e', tipA: 1, mz: '#2a2018', mzA: 0.6, sock: '#8a7448', sockA: 0.3, nose: 1, ear: '#3a2a1e', earA: 0.4, fwd: 0.6 },
    bear: { mz: '#a07a58', mzA: 0.5, nose: 1, grain: 1.4, iris: '#2a1a10', fwd: 0.6 },
    polarbear: { nose: 1, mz: '#e8e4d8', mzA: 0.3, iris: '#2a1a10', fwd: 0.6 },
    lion: { belA: 0.7, mane: '#8a5a2a', tipA: 1, mz: '#f0e0c0', mzA: 0.4, th: '#f0dcb8', thA: 0.5, nose: 0.6, ear: '#3a2a1e', earA: 0.6, iris: '#c8962e', fwd: 0.75 },
    tiger: { pat: 3, sc: 4.8, con: 1, belA: 1, th: '#f6ecda', thA: 1, mz: '#f6ecda', mzA: 0.7, ear: '#1e1a18', earA: 0.6, iris: '#d8a83a', fwd: 0.75, nose: 0.5, mane: '#1e1a18', tipA: 0.6 },
    jaguar: { pat: 4, sc: 5, belA: 1, th: '#f2dcae', thA: 0.6, iris: '#c8a040', fwd: 0.75, nose: 0.5 },
    leopard: { pat: 4, sc: 5.5, belA: 1, th: '#f2e2b8', thA: 0.6, iris: '#c8a040', fwd: 0.75, nose: 0.5 },
    snowleopard: { pat: 4, sc: 4.2, belA: 1, iris: '#8ab0a0', fwd: 0.75, nose: 0.5 },
    cao: { nose: 1, iris: '#5a3a1e', fwd: 0.55, thA: 0.4, mzA: 0.25 },
    gato: { iris: '#b8a030', pupil: 1, fwd: 0.8, nose: 0.8, mz: '#f0e4d4', mzA: 0.35, th: '#f2e8da', thA: 0.4, belA: 0.6 },
    rabbit: { bel: '#e8dccc', belA: 0.9, mane: '#f4f0ea', tipA: 1, ear: '#6a5a4a', earA: 0.3, inner: '#d8a8a0', iris: '#2a1a10', fwd: 0.1, nose: 0.4 },
    hare: { ear: '#1e1a18', earA: 1, mane: '#ffffff', tipA: 1, iris: '#a87a3a', fwd: 0.1 },
    beaver: { col: '#6a4a30', bel: '#7a5a3e', mane: '#2a2420', tipA: 1, tailFrom: 0.1, beak: '#d8783a', nose: 1, iris: '#1a1410' },
    otter: { col: '#5a4030', bel: '#a08a6a', th: '#c8b090', thA: 0.7, nose: 1, mz: '#a08a6a', mzA: 0.4, iris: '#1a1410' },
    monkey: { mz: '#dcaa8c', mzA: 1, mask: '#c8946e', maskA: 0.25, ear: '#d8a888', earA: 0.5, iris: '#5a3a1e', fwd: 0.9 },
    sloth: { col: '#8a7a5a', bel: '#9a8a6a', mask: '#e8dcc0', maskA: 0.7, hoof: '#3a3028', iris: '#2a1a10', fwd: 0.8 },
    frog: { col: '#4a8a3a', bel: '#d8d8a0', belA: 1, pat: 5, dk: '#2a4a1e', sc: 9, con: 0.8, iris: '#c8a03a', pupil: 2, grain: 0 },
    lizard: { pat: 5, dk: '#5a4a2a', sc: 10, con: 0.6, grain: 0, iris: '#a87a2a', belA: 0.9 },
    croc: { col: '#4a5a2a', bel: '#a8a070', belA: 1, pat: 8, dk: '#2e3a1a', sc: 8, con: 0.7, grain: 0, iris: '#b8a040', pupil: 1 },
    python: { col: '#c8b04a', dk: '#4a6a2a', bel: '#e8dcb0', belA: 1, pat: 9, sc: 3, con: 1, grain: 0, iris: '#c8a040', pupil: 1 },
    viper: { col: '#a8844a', dk: '#6a4a2a', bel: '#d8c8a0', belA: 1, pat: 9, sc: 5, con: 1, grain: 0, iris: '#c8a040', pupil: 1 },
    anaconda: { col: '#3e4c2a', dk: '#1e2414', bel: '#c8a43a', belA: 1, pat: 5, sc: 3, con: 0.9, grain: 0, iris: '#8a7a3a', pupil: 1 },
    seal: { col: '#7a7a78', bel: '#a8a8a2', pat: 5, dk: '#5a5a58', sc: 6, con: 0.4, nose: 0.8, iris: '#1a1410', fwd: 0.5, grain: 0.3 },
    walrus: { col: '#8a6a58', bel: '#a07a68', mz: '#a8887a', mzA: 0.6, grain: 0.3, pat: 14, sc: 2, con: 0.4, iris: '#1a1410' },
    penguin: { col: '#1c1c22', bel: '#f2f2ee', belA: 1, mask: '#1c1c22', maskA: 1, th: '#f0c048', thA: 0.5, beak: '#e8a83a', hoof: '#2a2a2a', grain: 0, wing: '#1c1c22', mane: '#1c1c22' },
    gull: { bel: '#f4f4f0', earA: 1, mane: '#f4f4f0', hoof: '#e8b8a0', iris: '#d8c83a', grain: 0 },
    eagle: { mask: '#f2efe6', maskA: 1, mane: '#f2efe6', hoof: '#f2c23a', iris: '#d8b83a', earA: 0.6, grain: 0, fwd: 0.5, pat: 11, sc: 6, con: 0.25 },
    vulture: { mask: '#d8a0a0', maskA: 1, th: '#e8e0d8', thA: 0.5, hoof: '#8a8a8a', mane: '#2e2622', earA: 0.5, grain: 0 },
    raven: { mane: '#1e1e26', hoof: '#2a2a2a', grain: 0, pat: 11, sc: 6, con: 0.25, iris: '#1a1410' },
    parrot: { mask: '#f0e8e0', maskA: 0.4, mane: '#d8302a', hoof: '#5a5a5a', earA: 0.8, grain: 0, iris: '#e8d8a0' },
    heron: { mane: '#f6f6f2', hoof: '#3a3a3a', grain: 0, iris: '#e8d83a' },
    stork: { mane: '#f6f4ee', hoof: '#e05a3a', earA: 1, grain: 0 },
    flamingo: { mane: '#f49aa8', hoof: '#e87a8a', earA: 1, grain: 0, iris: '#e8d83a' },
    goose: { mask: '#2a2622', maskA: 1, bel: '#e8e4dc', belA: 0.8, hoof: '#2a2622', mane: '#2a2622', grain: 0, pat: 11, sc: 7, con: 0.3 },
    toucan: { th: '#f6e8a0', thA: 1, mane: '#18181c', hoof: '#4a6ab0', iris: '#3a8a6a', grain: 0 },
    owl: { pat: 11, sc: 7, con: 0.4, mask: '#e8dcc8', maskA: 0.7, iris: '#f2c23a', fwd: 1.0, hoof: '#d8c890', mane: '#8a6a4a', grain: 0 },
    ostrich: { col: '#2a2622', wing: '#f2efe8', mask: '#c8a8a0', maskA: 1, mane: '#f2efe8', hoof: '#d8b0a0', sock: '#d8b0a0', sockA: 1, beak: '#d8b88a', grain: 0 },
    galinha: { inner: '#d23a2a', beak: '#e8b83a', hoof: '#e8b83a', grain: 0, pat: 11, sc: 9, con: 0.2 },
    peru: { col: '#4a3a2e', wing: '#5a4a3a', dk: '#2a2018', pat: 11, sc: 6, con: 0.5, mask: '#a8c0d8', maskA: 1, inner: '#c8303a', beak: '#c8b08a', hoof: '#c8a08a', mane: '#5a4a3a', bars: 1, grain: 0 },
    pombo: { th: '#6a9a8a', thA: 0.6, bars: 1, beak: '#3a3a3a', hoof: '#c86a6a', dk: '#3a3a40', earA: 0.7, grain: 0 },
    // the sea (D-267; pat 15: the swimmers' coat, f3sea — belA how soft the belly's line, back the cape, mask the orca's saddle,
    // ear the stripes (gill slits, throat grooves), sock the fins' tips, dk and con the mottle; pat 16: the turtle's skin in scales
    // parted by its belly's pale, wing its shell's colour, dk its shell's streaks — the colours the god's view gives them)
    dolphin: { pat: 16, col: '#76889a', bel: '#e6eaec', belA: 0.22, back: '#4f5d6c', backA: 0.85, dk: '#5a6a7a', sc: 4, con: 0.15, mz: '#647585', mzA: 0.4, iris: '#2a1e18', fwd: 0.1, grain: 0, tailFrom: 0.95 },
    orca: { pat: 16, col: '#131317', bel: '#f2f2ee', belA: 0, back: '#131317', backA: 0, mask: '#8a9096', maskA: 0.9, dk: '#131317', sc: 3, con: 0, iris: '#2a1e18', fwd: 0.08, grain: 0, tailFrom: 0.95 },
    whale: { pat: 16, col: '#38424f', bel: '#e0e3e2', belA: 0.04, back: '#2e3743', backA: 0.4, dk: '#2a323c', sc: 5, con: 0.9, ear: '#8e979e', earA: 0.7, iris: '#1a1410', fwd: 0.05, grain: 0, tailFrom: 0.95 },
    shark: { pat: 16, col: '#6c7884', bel: '#eef0ec', belA: 0.02, back: '#56626e', backA: 0.5, dk: '#58636f', sc: 6, con: 0.35, ear: '#262c34', earA: 0.85, sock: '#1c2026', sockA: 0.85, iris: '#0b0b0d', fwd: 0.18, grain: 0, tailFrom: 0.95 },
    turtle: { pat: 17, col: '#5a6246', bel: '#d2c896', belA: 0.85, dk: '#3a2a16', sc: 12, wing: '#7c6638', beak: '#b4a474', hoof: '#3a3428', iris: '#1a1410', fwd: 0.15, grain: 0 },
  };
  const DOG = [['#8a5a34', '#c8a070'], ['#2a2420', '#5a4a40'], ['#e8e0d0', '#8a6a4a'], ['#c89a4a', '#e8c890'], ['#6a6a70', '#b8b8c0']];
  const CAT = [['#d8843a', '#f0b878'], ['#6a6a72', '#9a9aa2'], ['#1e1c20', '#3a3640'], ['#f0ece4', '#d8c8b0'], ['#8a6a4a', '#c8a878']];
  const HEN = ['#f2eee4', '#b8683a', '#6a4a32']; const PIGEON = ['#8a8c98', '#e8e4dc', '#6a6660', '#8a8a94'];
  let Cc = null; const coatCache = new Map(); G.worldHooks.push(() => coatCache.clear());
  function lin(hex, k) { Cc.set(hex || '#888888'); if (k !== undefined) Cc.multiplyScalar(k); return [Cc.r, Cc.g, Cc.b]; }
  FA.coat = function (three, a) {
    if (!Cc) Cc = new three.Color();
    const kind = a.kind; const key = kind + ':' + (a.coat || 0) + ':' + (a.morph || '') + ':' + (a.age !== undefined && a.age < 1 ? 1 : 0) + ':' + (a.rooster ? 1 : 0);
    let C = coatCache.get(key); if (C) return C;
    const sp = G.Animals.DEF[kind] || {}; const q = sp.q || {}; const bd = sp.b || {}; const P = Object.assign({}, PAINT[kind] || {});
    let base = P.col || q.col || (sp.col && sp.col[0]) || bd.col || '#8a7a5a', belly = P.bel || q.belly || (sp.col && sp.col[1]) || base;
    let dk = P.dk || bd.tip || q.stripes || q.rosettes || q.spots || mixHex(base, '#000000', 0.5);
    let wing = P.wing || bd.wing || base, mask = P.mask || bd.head || belly;
    if (kind === 'cao') { const c = DOG[(a.coat || 0) % DOG.length]; base = c[0]; belly = c[1]; }
    if (kind === 'gato') { const c = CAT[(a.coat || 0) % CAT.length]; base = c[0]; belly = c[1]; if ((a.coat || 0) % 5 !== 2 && (a.coat || 0) % 5 !== 3) { P.pat = 7; P.sc = 4.5; P.con = 0.55; dk = mixHex(base, '#000000', 0.45); } }
    if (kind === 'galinha') { base = HEN[(a.coat || 0) % 3]; belly = base; wing = mixHex(base, '#000000', 0.12); dk = mixHex(base, '#000000', 0.3); P.mane = a.rooster ? '#1e2a22' : mixHex(base, '#000000', 0.2); }
    if (kind === 'pombo') { base = PIGEON[(a.coat || 0) % 4]; belly = base; wing = mixHex(base, '#ffffff', 0.12); P.mane = mixHex(base, '#000000', 0.25); }
    if (P.pat === undefined) P.pat = q.stripes ? (kind === 'zebra' ? 2 : 3) : q.rosettes ? 4 : q.spots ? 5 : q.wool ? 10 : 0;
    let iris = P.iris || (q.pred ? '#c8962e' : '#2e1e14'), mane = P.mane || q.mane || mixHex(base, '#000000', 0.45);
    if (a.morph === 'albino') { base = '#f2efe8'; belly = '#faf8f4'; dk = q.stripes && kind === 'tiger' ? '#3e3836' : '#d6cfc6'; mane = '#e8e2d8'; iris = '#c86a6a'; wing = base; mask = base; }
    else if (a.morph === 'melanico') { base = '#1e1c22'; belly = '#26242a'; dk = '#101012'; mane = '#121014'; wing = base; mask = base; }
    const young = a.age !== undefined && a.age < 1;
    const size = G.Fauna3D && G.Fauna3D.form(kind) ? Math.max(0.05, G.Fauna3D.form(kind).meta.H) : 1;
    C = [
      [...lin(base), P.pat], [...lin(belly), P.belA === undefined ? 0.75 : P.belA], [...lin(dk), P.sc || 2.2],
      [...lin(P.sock || mixHex(base, '#000000', 0.25)), P.sockA === undefined ? 0.2 : P.sockA], [...lin(P.mz || mixHex(base, '#000000', 0.3)), P.mzA === undefined ? 0.3 : P.mzA],
      [...lin(mane), P.tipA || 0], [...lin(P.horn || '#cfc4ae'), P.nose || 0], [...lin(P.hoof || bd.leg || '#2a2420'), 0], [...lin(P.beak || bd.beak || '#d8a83a'), 0],
      [...lin(iris), P.pupil || 0], [...lin(P.ear || mixHex(base, '#000000', 0.4)), P.earA || 0], [...lin(P.back || mixHex(base, '#000000', 0.2)), P.backA === undefined ? 0.15 : P.backA],
      [...lin(P.th || belly), P.thA || 0], [P.con === undefined ? 0.9 : P.con, (kind.charCodeAt(0) * 7 + kind.length * 13) % 40, P.grain === undefined ? 1 : P.grain, P.fwd || 0.22],
      [...lin(mask), P.maskA || 0], [...lin(wing), P.bars || 0], [young ? 1 : 0, size, P.band || 0, P.tailFrom === undefined ? 0.72 : P.tailFrom], [...lin(P.inner || '#c8968a'), 0],
    ];
    coatCache.set(key, C); return C;
  };
  function mixHex(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = s => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k); return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1); }
  FA.mixHex = mixHex;
  FA.paint = kind => PAINT[kind] || null;
  FA.paintKinds = () => Object.keys(PAINT);
})(window.G);
