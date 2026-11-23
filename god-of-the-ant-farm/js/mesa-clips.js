'use strict';
// ============================================================
//  The gestures of a tavern's table (P7, D-769): the meal eaten
//  from the plate on the table — the right hand down to it, a
//  scoop, up to the mouth, the chewing while it goes down again,
//  the left forearm resting on the board, the trunk leaning over
//  the plate and the eyes on it —, and the cup to the lips seated,
//  the left hand on the board. Seated (base 'sit'): the top of the
//  body only, over the seat. The meal shows the act 'dine' (the
//  guests of the world and the god's body: act-taverna.js), with
//  its mirror for the left-handed; the seated sip is the god's
//  body's own (its hands' act, cardapio-ui.js) — the cup in the
//  right hand of everyone, as the standing sip, no twin. Only seen
//  (rule 113): clips of the one animator; what a hand holds is the
//  inventory's (the cup, G.Inv.held) — the plate is on the table,
//  where the world put it (atmos.js, dentro3d.js), never in a hand.
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => { Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef && !def.noMirror) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  const D = 180 / Math.PI;
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0, twist: 0, headR: 0, tilt: 0, talk: 0, wrist: 0 };
  // (a hand at a point of the body — Anim3D.REACH, D-597 —, the right's or the left's mirrored, with a nudge)
  const at = (side, key, nudge) => { const q = (G.Anim3D && G.Anim3D.REACH && G.Anim3D.REACH[key]) || [0, 0, 0.2, 0]; const R = side > 0; const o = {};
    o[R ? 'shRp' : 'shLp'] = q[0] * D; o[R ? 'shRr' : 'shLr'] = (R ? q[1] : -q[1]) * D; o[R ? 'elR' : 'elL'] = q[2] * D; o[R ? 'shRy' : 'shLy'] = (R ? q[3] : -q[3]) * D;
    if (nudge) for (const j in nudge) o[j] = (o[j] !== undefined ? o[j] : REST[j] || 0) + nudge[j]; return o; };
  const mix = (...a) => Object.assign({}, ...a);
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  const U = 'upper';
  const c = (id, dur, list, o) => K(id, Object.assign({ dur, mask: U, base: 'sit', feet: 'free', in: 0.35, out: 0.4, keys: keysOf(list) }, o || {}));

  // the left forearm on the board, the hand open by the plate
  const BOARD = { shLp: -34, shLr: 10, elL: 72, shLy: 4, gripL: 0.25 };
  // the right hand at the plate (the fingers round a morsel, a spoon of bread), the trunk over it, the eyes on it
  const PLATE = { shRp: -36, shRr: -12, elR: 72, shRy: 6, grip: 0.55, lean: 18, neck: 20 };
  // the meal: at the plate, a scoop, up to the mouth (Anim3D.REACH: the hand at the lips), the mouthful taken, down again chewing
  c('mesa-comer', 2.8, [
    [0, mix(BOARD, PLATE, { talk: 0 })],
    [0.1, mix(BOARD, PLATE, { shRp: -31, shRr: -18, elR: 63, neck: 23, lean: 20 })],
    [0.2, mix(BOARD, PLATE, { shRp: -38, shRr: -10, elR: 78, neck: 18 })],
    [0.38, mix(BOARD, at(1, 'boca', { elR: -4 }), { grip: 0.6, lean: 12, neck: 4, talk: 0.45 })],
    [0.48, mix(BOARD, at(1, 'boca', { elR: -2 }), { grip: 0.6, lean: 11, neck: 3, talk: 0 })],
    [0.62, mix(BOARD, PLATE, { shRp: -40, elR: 86, neck: 10, lean: 14, talk: 0.3 })],
    [0.74, mix(BOARD, PLATE, { neck: 14, lean: 16, talk: 0.05 })],
    [0.86, mix(BOARD, PLATE, { neck: 17, talk: 0.25 })],
    [1, mix(BOARD, PLATE, { talk: 0 })],
  ], { acts: ['dine'], events: { contact: 0.46 } });

  // the sip seated: the cup upright at the belly — the wrist turned to keep it so —, its rim to the lips, tipped toward the face as
  // the head goes back, and down again (the standing sip's own numbers, social-clips.js «ato-beber», 22c T-1622: the rim meets the
  // lips on the rig); the left hand on the board
  const CUP = { wrist: -30 }, SIP1 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 30 }, SIP2 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 18 };
  const HOLD = mix(at(1, 'barriga', { elR: -20 }), CUP);
  c('mesa-beber', 2.6, [
    [0, mix(HOLD, BOARD, { grip: 0.8, neck: 6, lean: 8 })],
    [0.3, mix(SIP1, BOARD, { neck: -14, lean: 4 })],
    [0.55, mix(SIP2, BOARD, { neck: -18, lean: 3 })],
    [0.8, mix(HOLD, BOARD, { neck: 4, lean: 8 })],
    [1, mix(HOLD, BOARD, { neck: 6, lean: 8 })],
  ], { item: { hand: 'mao' }, noMirror: true, events: { contact: 0.42 } });
})(window.G);
