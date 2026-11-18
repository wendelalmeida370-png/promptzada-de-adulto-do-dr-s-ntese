'use strict';
// ============================================================
//  The gestures of two (22c onda 2, fase 4, D-605): each one's
//  part of an act between two — the embrace (one high, one low),
//  the kiss, the hand on the shoulder of one who weeps, the hand
//  in hand, the child taken up and the child's arms up, the cups
//  raised together, the hand shaken, the forearm gripped, the bow,
//  the head down to the higher, the push and the one who parts
//  two. One go each, the act's length (the world's: G.SocAtos);
//  where the hands meet the other is anim-duo.js's, by the arms'
//  reach (the rig): the clip brings the arms near, the reach puts
//  the hands there. Only seen (rule 113); no mirror — the hand
//  of a greeting and of a toast is the right one for everyone.
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => Q.push([id, Object.assign({ noMirror: true }, def)]);
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0, twist: 0, headR: 0, tilt: 0,
    crouch: 0, hipL: 0, hipR: 0, knL: 3, knR: 3, anL: 0, anR: 0 };
  const mix = (...a) => Object.assign({}, ...a);
  // (keys from poses at times: where a pose does not name a joint, the last that did, or the rest)
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  // (one go: from the rest to the pose, held, back to the rest — the pose's joints only)
  const go = (pose, a, b, hold) => { const r = {}; for (const j in pose) r[j] = REST[j] !== undefined ? REST[j] : 0; const L = [[0, r], [a, pose]]; if (hold) L.push(...hold); L.push([b, pose], [1, r]); return L; };
  const c = (id, dur, mask, list, o) => K(id, Object.assign({ dur, mask, loop: false, in: 0.25, out: 0.3, events: { contact: 0.5 }, keys: keysOf(list) }, o || {}));
  const U = 'upper';
  // the embrace: the arms open and forward round the other, the head to one side — one high (a), one low (b)
  const HUG = { shLp: -72, shRp: -72, shLr: 4, shRr: -4, elL: 62, elR: 62, lean: 6, neck: 4, grip: 0.3, gripL: 0.3 };
  c('duo-abraco', 3, U, go(mix(HUG, { headR: 12 }), 0.22, 0.82, [[0.5, mix(HUG, { headR: 14, lean: 7 })]]));
  c('duo-abraco-b', 3, U, go(mix(HUG, { shLp: -48, shRp: -48, elL: 74, elR: 74, headR: -12 }), 0.22, 0.82, [[0.5, mix(HUG, { shLp: -48, shRp: -48, elL: 74, elR: 74, headR: -14, lean: 7 })]]));
  // the kiss: the hands to the other's arms (a) or waist (b), the trunk and the head toward them, the heads to opposite sides
  c('duo-beijo', 2.5, U, go({ shLp: -62, shRp: -62, shLr: 14, shRr: -14, elL: 70, elR: 70, lean: 7, neck: 12, headR: 14, grip: 0.2, gripL: 0.2 }, 0.2, 0.85));
  c('duo-beijo-b', 2.5, U, go({ shLp: -38, shRp: -38, shLr: 10, shRr: -10, elL: 64, elR: 64, lean: 4, neck: -6, headR: -14, grip: 0.3, gripL: 0.3 }, 0.2, 0.85));
  // the comfort: the right hand on the other's shoulder, the head bent toward them
  c('duo-consolar', 4, U, go({ shRp: -88, shRr: -8, elR: 44, lean: 5, neck: 14, headR: 10, grip: 0.3 }, 0.15, 0.9, [[0.5, { shRp: -88, shRr: -8, elR: 44, lean: 6, neck: 16, headR: 12 }]]));
  // the hand in hand: the near hand forward and down to the other's
  c('duo-mao-dada', 6, U, go({ shRp: -24, shRr: -6, elR: 22, grip: 0.7, neck: 4 }, 0.1, 0.95));
  c('duo-mao-dada-b', 6, U, go({ shLp: -24, shLr: 6, elL: 22, gripL: 0.7, neck: 4 }, 0.1, 0.95));
  // the child taken up: down on the knees a little, bent to them, the hands under their arms; the child's arms up to the neck
  c('duo-colo', 6, 'full', go({ crouch: 0.12, knL: 24, knR: 24, hipL: -18, hipR: -18, lean: 26, neck: 8, shLp: -58, shRp: -58, shLr: 8, shRr: -8, elL: 30, elR: 30, grip: 0.5, gripL: 0.5 }, 0.2, 0.95), { feet: 'plant' });
  c('duo-colo-b', 6, U, go({ shLp: -150, shRp: -150, shLr: 12, shRr: -12, elL: 40, elR: 40, neck: -16, grip: 0.4, gripL: 0.4 }, 0.2, 0.95));
  // the toast: the cup raised forward to the other's, a nod
  // (each one's cup, G.Inv.held — the wrist keeps it upright as it is raised: D-612)
  c('duo-brinde', 2, U, go({ shRp: -82, shRr: -4, elR: 58, wrist: 50, grip: 1, neck: -4 }, 0.3, 0.6, [[0.45, { shRp: -88, shRr: -4, elR: 54, wrist: 52, grip: 1, neck: 4 }]]), { item: { hand: 'mao' } });
  // the greeting: the hand shaken (a little up and down), the forearm gripped, the bow, the head down
  c('duo-aperto', 1.5, U, go({ shRp: -40, shRr: -2, elR: 36, grip: 0.9, neck: 6 }, 0.25, 0.75, [[0.4, { shRp: -44, shRr: -2, elR: 38, grip: 0.9, neck: 8 }], [0.55, { shRp: -36, shRr: -2, elR: 34, grip: 0.9, neck: 6 }]]));
  c('duo-antebraco', 1.5, U, go({ shRp: -56, shRr: -4, elR: 30, grip: 0.9, lean: 3, neck: 4 }, 0.25, 0.75));
  c('duo-reverencia', 2, 'full', go({ lean: 30, neck: 18, shRp: -40, shRr: 6, elR: 96, shRy: 30, shLp: 6, elL: 10, grip: 0.1 }, 0.3, 0.7), { feet: 'plant' });
  c('duo-cabeca-baixa', 2, U, go({ neck: 30, lean: 9, shLp: -34, shRp: -34, shLr: -12, shRr: 12, elL: 78, elR: 78, shLy: -60, shRy: 60, grip: 0.4, gripL: 0.4 }, 0.25, 0.8));
  // the push on the chest; the one who parts two, the hands held on the other's chest
  c('duo-empurrar', 1, U, go({ shLp: -76, shRp: -76, shLr: 6, shRr: -6, elL: 26, elR: 26, lean: 12, neck: -4, grip: 0.1, gripL: 0.1 }, 0.25, 0.5, [[0.35, { shLp: -80, shRp: -80, shLr: 6, shRr: -6, elL: 8, elR: 8, lean: 16, neck: -6 }]]));
  c('duo-apartar', 2, U, go({ shLp: -66, shRp: -66, shLr: 8, shRr: -8, elL: 40, elR: 40, lean: 6, neck: -2, grip: 0.1, gripL: 0.1 }, 0.2, 0.9));
})(window.G);
