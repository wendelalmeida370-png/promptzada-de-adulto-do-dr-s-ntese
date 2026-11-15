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
  let THREE = null; const R = []; let Mb = null, Eu = null, Tm = null;
  const E = new Float32Array(NB * 3); // (each bone's turn about its joint: x pitch — + bows a forward-pointing bone down, swings a hanging one back —, y yaw, z roll)
  const OFF = new Float32Array(3);    // (the root's shift: the body's rise and fall)
  function start(three) { THREE = three; for (let b = 0; b < NB; b++) R.push(new THREE.Matrix4()); Mb = new THREE.Matrix4(); Eu = new THREE.Euler(0, 0, 0, 'YXZ'); Tm = new THREE.Matrix4(); }
  // the bones' frames in the world: m the beast's own frame (where it stands, which way it faces — its +Z forward —, its
  // size), J its joints as modelled
  function chain(m, J) {
    for (let b = 0; b < NB; b++) {
      const p = FA.PARENT[b]; Eu.set(E[b * 3], E[b * 3 + 1], E[b * 3 + 2], 'YXZ'); Mb.makeRotationFromEuler(Eu);
      if (p < 0) { Mb.setPosition(J[0] + OFF[0], J[1] + OFF[1], J[2] + OFF[2]); R[b].multiplyMatrices(m, Mb); }
      else { Mb.setPosition(J[b * 3] - J[p * 3], J[b * 3 + 1] - J[p * 3 + 1], J[b * 3 + 2] - J[p * 3 + 2]); R[b].multiplyMatrices(R[p], Mb); }
    }
    return R;
  }
  FA.R = () => R;
  // gaits: the offset of each leg in the stride (left fore, right fore, left hind, right hind), how long a foot stays down,
  // how far the body goes in one stride (× the leg's length), how far a leg folds as it swings
  const GAITS = {
    walk: { off: [0.25, 0.75, 0.0, 0.5], duty: 0.62, stride: 1.25, fold: 0.8 },
    trot: { off: [0.0, 0.5, 0.5, 0.0], duty: 0.46, stride: 1.9, fold: 1.0 },
    gallop: { off: [0.55, 0.45, 0.0, 0.1], duty: 0.34, stride: 3.0, fold: 1.25 },
    hop: { off: [0.5, 0.55, 0.0, 0.04], duty: 0.36, stride: 2.6, fold: 1.1 },
  };
  FA.gaitOf = (v, legLen, pillar, hop) => hop ? 'hop' : FA.gaitOf0(v, legLen, pillar);
  FA.gaitOf0 = (v, legLen, pillar) => { const fr = v / Math.sqrt(9.8 * Math.max(0.05, legLen)); return fr < 0.42 || (pillar && fr < 1.6) ? 'walk' : fr < 1.25 || pillar ? 'trot' : 'gallop'; };
  FA.strideOf = (gait, legLen) => GAITS[gait].stride * Math.max(0.05, legLen);
  // the pose of a beast on four legs. st: { v (m/s), ph (the stride's phase, in strides), t (the view's clock), graze (0..1),
  // look (-1..1), id, ears (0 up, 1 back), tail (0 down, 1 up), jaw (0 shut, 1 open), sit, crouch }
  FA.quad = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0);
    const legF = J[B.flL0 * 3 + 1], legH = J[B.hlL0 * 3 + 1], LL = (legF + legH) * 0.5;
    const pillar = !!form.meta.pillar, dig = !!form.meta.dig;
    const gait = st.v < 0.04 ? null : form.meta.hop ? 'hop' : FA.gaitOf(st.v, LL, pillar); const G0 = gait ? GAITS[gait] : null;
    const go = gait ? Math.min(1, st.v / 0.25) : 0; // (from standing into the stride: the legs begin to swing)
    const ph = st.ph, t = st.t, id = st.id || 0;
    if (G0) {
      const S = FA.strideOf(gait, LL); const A = Math.asin(Math.min(0.72, S * G0.duty * 0.5 / Math.max(0.05, LL))) * go; const fk = G0.fold * go;
      for (let k = 0; k < 4; k++) {
        const front = k < 2, s = k % 2 ? 'R' : 'L'; let f = ph + G0.off[k]; f -= Math.floor(f);
        let ang, flex;
        if (f < G0.duty) { const u = f / G0.duty; ang = A * (1 - 2 * u); flex = 0.06 * Math.sin(Math.PI * u); }
        else { const u = (f - G0.duty) / (1 - G0.duty); ang = -A + 2 * A * sstep(u); flex = Math.sin(Math.PI * Math.min(1, u * 1.15)); }
        const L = (front ? 'fl' : 'hl') + s;
        if (front) {
          E[B[L + '0'] * 3] = -ang - flex * 0.25 * fk; E[B[L + '1'] * 3] = -flex * 0.35 * fk;
          E[B[L + '2'] * 3] = flex * (pillar ? 0.5 : dig ? 1.1 : 1.6) * fk; E[B[L + '3'] * 3] = flex * (pillar ? 0.1 : 0.7) * fk;
        } else {
          E[B[L + '0'] * 3] = -ang - flex * 0.2 * fk; E[B[L + '1'] * 3] = flex * (pillar ? 0.25 : 0.75) * fk;
          E[B[L + '2'] * 3] = -flex * (pillar ? 0.3 : 1.15) * fk; E[B[L + '3'] * 3] = flex * (pillar ? 0.1 : 0.6) * fk;
        }
      }
      // (the body: a little rise and fall twice a stride in the walk and the trot; in the gallop it rocks, nose up and down,
      // and a cat's back bends and stretches)
      if (gait === 'hop') { OFF[1] = Math.max(0, Math.sin(ph * TAU + 0.6)) * LL * 0.35; E[B.root * 3] = Math.sin(ph * TAU + 1.4) * 0.22; }
      else if (gait === 'gallop') { E[B.root * 3] = Math.sin(ph * TAU + 1.0) * 0.07; OFF[1] = Math.sin(ph * TAU) * LL * 0.05; if (form.meta.flex) { E[B.spine * 3] = Math.sin(ph * TAU) * 0.12; E[B.chest * 3] = -Math.sin(ph * TAU) * 0.1; } }
      else OFF[1] = -Math.abs(Math.sin(ph * TAU * 2)) * LL * (gait === 'trot' ? 0.03 : 0.012) * go;
      // (the head nods with the steps: twice a stride in the walk, with the forelegs in the gallop)
      const nod = gait === 'gallop' ? Math.sin(ph * TAU + 0.6) * 0.14 : Math.sin(ph * TAU * 2 + 0.4) * (gait === 'walk' ? 0.05 : 0.03);
      E[B.neck0 * 3] += nod * go; E[B.head * 3] -= nod * 0.5 * go;
    } else {
      // standing: the weight shifts now and then from foot to foot
      const w = Math.sin(t * 0.31 + id) * 0.02; E[B.flL0 * 3] = w; E[B.flR0 * 3] = -w; E[B.hlL0 * 3] = -w; E[B.hlR0 * 3] = w;
    }
    // (the breath)
    E[B.spine * 3] += Math.sin(t * 1.7 + id) * 0.008; E[B.chest * 3] -= Math.sin(t * 1.7 + id) * 0.006;
    // grazing: the neck bows until the muzzle is at the grass (as far as the neck reaches); the jaw chews
    if (st.graze > 0.001) {
      const n0 = B.neck0 * 3, nose = form.meta.nose; const yr = nose[1] - J[n0 + 1], zr = nose[2] - J[n0 + 2];
      const Rr = Math.hypot(yr, zr), p0 = Math.atan2(yr, zr); const want = (0.04 - J[n0 + 1]) / Rr;
      const th = (p0 - Math.asin(Math.max(-1, Math.min(1, want)))) * (sp.browse ? 0.45 : 1) * st.graze;
      E[n0] += th * 0.62; E[B.neck1 * 3] += th * 0.24; E[B.neck2 * 3] += th * 0.14; E[B.head * 3] -= th * 0.12;
      E[B.jaw * 3] = Math.max(0, Math.sin(t * 5.5 + id)) * 0.07 * st.graze;
    }
    // looking about: the neck and the head turn together
    const look = st.look || 0; E[B.neck0 * 3 + 1] += look * 0.35; E[B.neck1 * 3 + 1] += look * 0.25; E[B.head * 3 + 1] += look * 0.3;
    // the jaw (a predator's open mouth), the ears (up and flicking, or laid back), the tail (swishing, raised in the gallop)
    if (st.jaw) E[B.jaw * 3] = Math.max(E[B.jaw * 3], st.jaw * 0.45);
    const flick = (k) => { const q = Math.sin(t * 0.9 + id * 1.7 + k * 2.1); return q > 0.93 ? (q - 0.93) * 8 : 0; };
    const back = st.ears || 0;
    E[B.earL * 3] = back * 0.9 + flick(0) * 0.25; E[B.earL * 3 + 2] = -back * 0.3 + flick(1) * 0.3;
    E[B.earR * 3] = back * 0.9 + flick(2) * 0.25; E[B.earR * 3 + 2] = back * 0.3 - flick(3) * 0.3;
    const sw = (gait ? 0.12 : 0.3) * (sp.swish === undefined ? 1 : sp.swish);
    for (let k = 0; k < 4; k++) {
      const b = B['tail' + k] * 3; E[b + 1] = Math.sin(t * 1.6 - k * 0.55 + id) * sw * (0.5 + k * 0.25);
      E[b] = -(st.tail || 0) * (k === 0 ? 0.55 : 0.2) + (gait ? Math.sin(ph * TAU * 2 - k * 0.5) * 0.06 : 0);
    }
    if (form.meta.trunk) { for (let k = 0; k < 3; k++) { E[B['trunk' + k] * 3] = Math.sin(t * 0.8 + id - k * 0.6) * 0.12 + st.graze * 0.25; E[B['trunk' + k] * 3 + 1] = Math.sin(t * 0.53 + id * 2 - k * 0.5) * 0.15; } }
    if (st.sit) sit(form, st.sit);
    return chain(m, J);
  };
  // sitting down (a dog, a cat at rest): the hind legs folded under, the body raised in front
  function sit(form, k) {
    E[B.root * 3] -= 0.6 * k; E[B.spine * 3] -= 0.08 * k; E[B.neck0 * 3] += 0.45 * k; E[B.head * 3] += 0.18 * k;
    for (const s of 'LR') { E[B['hl' + s + '0'] * 3] += -0.25 * k; E[B['hl' + s + '1'] * 3] += 1.55 * k; E[B['hl' + s + '2'] * 3] += -1.5 * k; E[B['hl' + s + '3'] * 3] += 0.55 * k;
      E[B['fl' + s + '0'] * 3] += 0.66 * k; }
    for (let b = 0; b < 4; b++) E[B['tail' + b] * 3] += 0.3 * k;
    const legH = form.J[B.hlL0 * 3 + 1]; OFF[1] -= legH * 0.36 * k; OFF[2] -= legH * 0.12 * k;
  }

  // ------------------------------ the other families ------------------------------
  // a bird: afoot (walking with the head thrust forward at each step, pecking, looking about) or in the air (the fly mesh:
  // the wings beating — slow and deep for the big ones, fast for the small —, gliding with the tips up, the legs tucked)
  FA.bird = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0);
    const t = st.t, id = st.id || 0, ph = st.ph;
    if (form.meta.fly) {
      const big = form.meta.H > 0.6, f = big ? 2.2 : 4.5; const flap = st.glide ? 0 : 1;
      const w = t * f * TAU + id; const a = Math.sin(w) * 0.62 * flap + (st.glide ? 0.12 : 0.05);
      for (const s of 'LR') { const sd = s === 'L' ? 1 : -1;
        E[B['fl' + s + '0'] * 3 + 2] = sd * a; E[B['fl' + s + '1'] * 3 + 2] = sd * Math.sin(w - 0.6) * 0.25 * flap; E[B['fl' + s + '2'] * 3 + 2] = sd * Math.sin(w - 1.1) * 0.3 * flap;
        E[B['fl' + s + '2'] * 3 + 1] = -sd * Math.max(0, Math.cos(w)) * 0.35 * flap; // (the hand swept back on the upstroke)
        E[B['hl' + s + '0'] * 3] = 1.1; E[B['hl' + s + '1'] * 3] = 0.9; E[B['hl' + s + '2'] * 3] = -0.6; E[B['hl' + s + '3'] * 3] = 1.2; }
      OFF[1] = -Math.sin(w) * form.meta.H * 0.03 * flap; E[B.root * 3] = (st.pitch || 0) * 0.5; E[B.root * 3 + 2] = -(st.bank || 0) * 0.6;
      E[B.neck0 * 3] = -0.25; E[B.head * 3] = 0.25 + (st.pitch || 0) * -0.3; E[B.tail1 * 3 + 1] = (st.bank || 0) * 0.3;
      return chain(m, J);
    }
    const walk = st.v > 0.03 ? Math.min(1, st.v / 0.15) : 0;
    for (const s of 'LR') {
      const sd = s === 'L' ? 0 : 0.5; let f = ph + sd; f -= Math.floor(f); const duty = 0.6;
      let ang, flex; if (f < duty) { const u = f / duty; ang = 0.42 * (1 - 2 * u); flex = 0; } else { const u = (f - duty) / (1 - duty); ang = -0.42 + 0.84 * sstep(u); flex = Math.sin(Math.PI * u); }
      ang *= walk; flex *= walk;
      E[B['hl' + s + '1'] * 3] = -ang * 0.6; E[B['hl' + s + '2'] * 3] = -ang * 0.5 + flex * 0.6; E[B['hl' + s + '3'] * 3] = flex * 0.9 - (form.meta.upright ? 0 : 0.05);
    }
    if (form.meta.upright) { E[B.root * 3 + 2] = Math.sin(ph * TAU) * 0.12 * walk; E[B.spine * 3 + 2] = -Math.sin(ph * TAU) * 0.04 * walk; } // (the penguin's waddle)
    // (the head: thrust at each step, a peck at the ground now and then, turning to look; a shuffle of the wings)
    const nod = Math.sin(ph * TAU * 2) * 0.12 * walk;
    const peck = st.graze > 0.01 ? Math.max(0, Math.sin(t * 2.6 + id)) * st.graze : 0;
    E[B.neck0 * 3] += nod + peck * 0.9; E[B.neck1 * 3] += peck * 0.5; E[B.neck2 * 3] -= nod * 0.6 + peck * 0.2; E[B.head * 3] -= nod * 0.4 - peck * 0.3;
    const look = st.look || 0; E[B.neck1 * 3 + 1] = look * 0.4; E[B.head * 3 + 1] = look * 0.6;
    const sh = Math.max(0, Math.sin(t * 0.7 + id * 1.9) - 0.96) * 12; for (const s of 'LR') E[B['fl' + s + '0'] * 3 + 2] = (s === 'L' ? 1 : -1) * sh * 0.25;
    E[B.tail1 * 3] = Math.sin(t * 1.2 + id) * 0.05 - walk * Math.sin(ph * TAU * 2) * 0.05;
    E[B.jaw * 3] = st.jaw ? 0.3 : 0;
    return chain(m, J);
  };
  // a snake: the wave running back along its bones as it goes; at rest it lies in a lazy curve, the head raised a little
  FA.snake = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0);
    const order = ['tail3', 'tail2', 'tail1', 'tail0', 'root', 'spine', 'chest', 'neck0', 'neck1', 'neck2', 'head'];
    const go = Math.min(1, st.v / 0.1); const A = 0.32 * (0.35 + 0.65 * go);
    for (let k = 0; k < order.length; k++) {
      const b = B[order[k]] * 3, u = k / (order.length - 1); const w = Math.sin((st.ph - u * 1.6) * TAU) * A * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, u * 1.1)));
      // (the chain grows both ways from the root: the head's side turns as it is, the tail's the other way)
      E[b + 1] = (k < 4 ? -1 : 1) * (w - (k > 0 ? Math.sin((st.ph - (k - 1) / (order.length - 1) * 1.6) * TAU) * A * 0.0 : 0)) * 0.55;
    }
    E[B.head * 3 + 1] = -E[B.neck2 * 3 + 1] * 0.8; E[B.neck2 * 3] = -0.12 * (1 - go * 0.5); E[B.head * 3] = 0.1;
    E[B.jaw * 3] = st.jaw ? 0.5 : 0;
    return chain(m, J);
  };
  // the sprawling (the crocodile, the lizard): the legs out to the side swing forward and back in diagonal pairs, lifted at
  // the elbow; the body bends from side to side with them and the tail sweeps
  FA.sprawl = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0);
    const go = Math.min(1, st.v / 0.12), ph = st.ph;
    const off = { flL: 0, hlR: 0, flR: 0.5, hlL: 0.5 };
    for (const L of ['flL', 'flR', 'hlL', 'hlR']) {
      const sd = L[2] === 'L' ? 1 : -1; let f = ph + off[L]; f -= Math.floor(f); const duty = 0.55;
      let ang, lift; if (f < duty) { const u = f / duty; ang = 0.55 * (1 - 2 * u); lift = 0; } else { const u = (f - duty) / (1 - duty); ang = -0.55 + 1.1 * sstep(u); lift = Math.sin(Math.PI * u); }
      E[B[L + '0'] * 3 + 1] = -sd * ang * go; E[B[L + '0'] * 3 + 2] = sd * lift * 0.45 * go; E[B[L + '1'] * 3 + 2] = -sd * lift * 0.25 * go;
    }
    const bend = Math.sin(ph * TAU) * 0.16 * go; E[B.spine * 3 + 1] = bend; E[B.chest * 3 + 1] = -bend * 0.6; E[B.root * 3 + 1] = -bend * 0.5;
    for (let k = 0; k < 4; k++) E[B['tail' + k] * 3 + 1] = Math.sin(ph * TAU - 0.9 - k * 0.7) * 0.18 * go + Math.sin(st.t * 0.4 + st.id + k) * 0.05;
    E[B.head * 3 + 1] = (st.look || 0) * 0.3 - bend * 0.5; E[B.jaw * 3] = st.jaw ? 0.6 : Math.max(0, Math.sin(st.t * 0.13 + st.id) - 0.9) * 4 * 0.5; // (the gape in the sun)
    return chain(m, J);
  };
  // the frog: sitting, its throat pulsing; going, it hops — the hind legs straighten, the body flies forward and lands
  FA.frog = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0);
    if (st.v > 0.02) {
      let f = st.ph; f -= Math.floor(f); const air = f < 0.55 ? Math.sin(Math.PI * f / 0.55) : 0, push = f < 0.25 ? Math.sin(Math.PI * f / 0.25) : 0;
      OFF[1] = air * form.meta.L * 0.5; E[B.root * 3] = -0.35 * air;
      for (const s of 'LR') { E[B['hl' + s + '0'] * 3] = -1.0 * (push + air * 0.6); E[B['hl' + s + '1'] * 3] = 1.4 * (push + air * 0.7); E[B['hl' + s + '2'] * 3] = -1.0 * (push + air * 0.5); E[B['fl' + s + '0'] * 3] = -0.6 * air; }
    }
    E[B.jaw * 3] = Math.max(0, Math.sin(st.t * 5 + st.id)) * 0.04;
    return chain(m, J);
  };
  // the seal: on land it humps along — the body arching and stretching, the fore flippers pushing; at rest it lifts its head
  FA.seal = function (three, m, form, sp, st) {
    if (!THREE) start(three);
    const J = form.J; E.fill(0); OFF.fill(0);
    const go = Math.min(1, st.v / 0.15), w = st.ph * TAU;
    E[B.spine * 3] = Math.sin(w) * 0.18 * go; E[B.chest * 3] = -Math.sin(w) * 0.14 * go; E[B.root * 3] = -Math.sin(w + 0.8) * 0.1 * go; OFF[1] = Math.max(0, Math.sin(w)) * form.meta.H * 0.12 * go;
    for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '0'] * 3] = Math.sin(w) * 0.5 * go; E[B['hl' + s + '1'] * 3] = -0.2 - Math.sin(w) * 0.15 * go; E[B['hl' + s + '1'] * 3 + 2] = sd * 0.1; }
    E[B.neck0 * 3] = -0.15 + Math.sin(w) * 0.1 * go; E[B.head * 3 + 1] = (st.look || 0) * 0.5; E[B.neck1 * 3 + 1] = (st.look || 0) * 0.3;
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
    const J = form.J; E.fill(0); OFF.fill(0);
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
    const J = form.J; E.fill(0); OFF.fill(0);
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
    tiger: { pat: 3, sc: 3.6, con: 1, belA: 1, th: '#f6ecda', thA: 1, mz: '#f6ecda', mzA: 0.7, ear: '#1e1a18', earA: 0.6, iris: '#d8a83a', fwd: 0.75, nose: 0.5, mane: '#1e1a18', tipA: 0.6 },
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
    dolphin: { pat: 15, col: '#76889a', bel: '#e6eaec', belA: 0.22, back: '#4f5d6c', backA: 0.85, dk: '#5a6a7a', sc: 4, con: 0.15, mz: '#647585', mzA: 0.4, iris: '#2a1e18', fwd: 0.1, grain: 0, tailFrom: 0.95 },
    orca: { pat: 15, col: '#131317', bel: '#f2f2ee', belA: 0, back: '#131317', backA: 0, mask: '#8a9096', maskA: 0.9, dk: '#131317', sc: 3, con: 0, iris: '#2a1e18', fwd: 0.08, grain: 0, tailFrom: 0.95 },
    whale: { pat: 15, col: '#38424f', bel: '#e0e3e2', belA: 0.04, back: '#2e3743', backA: 0.4, dk: '#2a323c', sc: 5, con: 0.9, ear: '#8e979e', earA: 0.7, iris: '#1a1410', fwd: 0.05, grain: 0, tailFrom: 0.95 },
    shark: { pat: 15, col: '#6c7884', bel: '#eef0ec', belA: 0.02, back: '#56626e', backA: 0.5, dk: '#58636f', sc: 6, con: 0.35, ear: '#262c34', earA: 0.85, sock: '#1c2026', sockA: 0.85, iris: '#0b0b0d', fwd: 0.18, grain: 0, tailFrom: 0.95 },
    turtle: { pat: 16, col: '#5a6246', bel: '#d2c896', belA: 0.85, dk: '#3a2a16', sc: 12, wing: '#7c6638', beak: '#b4a474', hoof: '#3a3428', iris: '#1a1410', fwd: 0.15, grain: 0 },
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
