'use strict';
// ============================================================
//  Two in one gesture (22c onda 2, fase 4, D-605; the study §3.6).
//  Each act of the society's vocabulary between two (G.SocAtos)
//  has here its two parts: the gesture of each one (a clip of
//  duo-clips.js, or the act's own), where each hand goes on the
//  other — a point of the other's trunk, in their chest's frame,
//  or a point between the two where two hands meet —, when (the
//  window of the act's time, on the world's clock: the act begins
//  for both in the step the world puts them together) and how far
//  apart the hands can still meet. The place is the world's
//  (G.Convivio.place: the act's distance, facing): the view never
//  moves anyone; too far, each one plays their part alone.
//  The greeting by the people and the standing (D-606): the
//  Roman, the Greek and the classical grip the forearm, the
//  Egyptian and the Aztec bow, the north shakes the hand; the
//  lower bows the head to the noble, who nods.
//  Pure (rule 113): no world, no chance — the reader (vida3d.js)
//  says who is with whom, the frame (people3d.js) takes the hands.
// ============================================================
(function (G) {
  const Anim = G.Anim3D = G.Anim3D || {};
  // the hands: [left, right], each null (the clip's own) or
  //   ['b', x, y, z]  a point of the other's trunk: their chest's frame, their body's units (x their left, y up, z their front)
  //   ['m', x, y, z]  a point between the two: from the middle of the two chests (the chest's bone begins at the waist, ~1 m up in a
//                   grown one), x to my left, y up from the lower chest, z toward
  //                   the other (metres) — the other's part names the same point in their own frame
  // win: the part of the act the hands are there (fractions of the gesture's time); reach: the most metres between the two for the
  // hands to meet (farther, the gesture alone); pole: where the elbows fall (the trunk's frame, the right arm's; mirrored left)
  const BACK = (hi) => [['b', -0.09, hi, -0.115], ['b', 0.09, hi, -0.115]]; // (round the other's sides to their back: my left to their right)
  const P = (clip, hands, win, reach, pole) => Object.freeze({ clip, hands: hands || null, win: win || [0.25, 0.8], reach: reach || 0, pole: pole || null });
  const OUT = [0.85, -0.55, -0.3], DOWN = [0.6, -1, -0.2], FWD = [0.7, -0.8, -0.4];
  const DUO = Anim.DUO = {
    // (the affection: the embrace — one high, one low, so the arms go round each other —, the kiss, the comfort, the hand in hand)
    hug: { a: P('duo-abraco', BACK(0.3), [0.22, 0.82], 0.75, OUT), b: P('duo-abraco-b', BACK(0.1), [0.22, 0.82], 0.75, OUT) },
    kiss: { a: P('duo-beijo', [['b', -0.2, 0.36, 0.0], ['b', 0.2, 0.36, 0.0]], [0.2, 0.85], 0.6, DOWN), b: P('duo-beijo-b', [['b', -0.15, 0.04, 0.02], ['b', 0.15, 0.04, 0.02]], [0.2, 0.85], 0.6, DOWN) },
    console: { a: P('duo-consolar', [null, ['b', 0.17, 0.47, 0.02]], [0.15, 0.9], 0.95, FWD) },
    weep: { b: P(null) },
    handhold: { a: P('duo-mao-dada', [null, ['m', -0.13, -0.13, 0]], [0.1, 0.95], 0.8, DOWN), b: P('duo-mao-dada-b', [['m', 0.13, -0.13, 0], null], [0.1, 0.95], 0.8, DOWN) },
    // (the child taken up: the hands under the arms, the child's up to the neck — the lift itself is the world's)
    carry: { a: P('duo-colo', [['b', -0.16, 0.12, 0], ['b', 0.16, 0.12, 0]], [0.2, 0.95], 0.65, DOWN) },
    carried: { b: P('duo-colo-b', [['b', -0.17, 0.4, 0.07], ['b', 0.17, 0.4, 0.07]], [0.2, 0.95], 0.65, DOWN) },
    // (the feast: the cups meet between the two, side by side)
    toast: { a: P('duo-brinde', [null, ['m', -0.04, 0.25, 0]], [0.18, 0.42], 1.15, FWD), b: P('duo-brinde', [null, ['m', -0.04, 0.25, 0]], [0.18, 0.42], 1.15, FWD) },
    // (the tavern's toast — the world's «brinde»: the same cups meeting between the two; P6, D-795)
    brinde: { a: P('duo-brinde', [null, ['m', -0.04, 0.25, 0]], [0.18, 0.42], 1.15, FWD), b: P('duo-brinde', [null, ['m', -0.04, 0.25, 0]], [0.18, 0.42], 1.15, FWD) },
    // (the brawler put out of the tavern at its door — «expulsar»: the keeper's right hand round the other's left arm at the shoulder,
    // the left one fisted in their collar, pushing them back out; the one put out has no hand on the keeper, leaning back from him —
    // P6, D-797)
    // (the fourth wave, D-871: the drink thrown in a face and the one who gets it — from a step away, no hand on the other —; the one on the
    // floor dragged out by the wrists — each one's part, the world's distance —; the arm wrestle, the same for the two: the right hands
    // locked between them over the board)
    'jogar-bebida': { a: P('jogar-bebida'), b: P('molhado') }, molhado: { b: P('molhado') },
    arrastar: { a: P('arrastar'), b: P('arrastado') }, arrastado: { b: P('arrastado') },
    'queda-de-braco': { a: P('queda-de-braco', [null, ['m', 0, 0.41, 0]], [0, 1], 0.9, FWD), b: P('queda-de-braco', [null, ['m', 0, 0.41, 0]], [0, 1], 0.9, FWD) },
    expulsar: { a: P('expulsar-a', [['b', -0.07, 0.3, 0.12], ['b', 0.13, 0.3, 0.1]], [0.08, 0.92], 0.8, FWD), b: P('expulsar-b') },
    // (the conflict: the push on the chest, the one who parts two — the hands held on the other's chest)
    shove: { a: P('duo-empurrar', [['b', -0.1, 0.28, 0.12], ['b', 0.1, 0.28, 0.12]], [0.25, 0.5], 0.95, FWD) },
    separate: { a: P('duo-apartar', [['b', -0.1, 0.3, 0.12], ['b', 0.1, 0.3, 0.12]], [0.2, 0.9], 1, FWD) },
    // (the parts with no hand on the other: the gesture of each, the look at the other's face — the reader's)
    talk: { a: P(null), b: P(null) }, listen: { a: P(null), b: P(null) }, chat: { a: P(null), b: P(null) }, gossip: { a: P(null) }, tell: { a: P(null) },
    agree: { a: P(null) }, disagree: { a: P(null) }, argue: { a: P(null), b: P(null) }, insult: { a: P(null) }, threaten: { a: P(null) }, cower: { b: P(null) },
    spit: { a: P(null) }, stagger: { b: P(null) }, fight: { a: P(null), b: P(null) }, scold: { a: P(null) }, heed: { b: P(null) }, ask: { a: P(null) },
    offer: { a: P(null) }, propose: { a: P(null) }, plead: { a: P(null) }, help: { a: P(null) }, helped: { b: P(null) }, caress: { a: P(null) }, pet: { a: P(null) },
    dancepair: { a: P(null), b: P(null) }, shackle: { a: P(null) }, bound: { b: P(null) }, nod: { b: P(null) }, bow: { a: P('duo-reverencia') }, salute: { a: P(null) },
  };
  // the greeting (and the farewell): by the people and the standing — D-606
  const GREET = {
    aperto: P('duo-aperto', [null, ['m', -0.03, 0.02, 0]], [0.25, 0.75], 1.15, FWD), // (the hand shaken)
    antebraco: P('duo-antebraco', [null, ['m', -0.04, 0.12, 0.09]], [0.25, 0.75], 1.25, FWD), // (each one's hand on the other's forearm)
    reverencia: P('duo-reverencia'), // (the bow)
    baixa: P('duo-cabeca-baixa'), // (the head down to the higher)
    nobre: P('soc-acenar-cabeca'), // (the higher's nod)
  };
  const STAND = { nobreza: 3, sacerdotes: 2.5, mercadores: 1.5, militares: 1.5 };
  const rank = (grp, captive) => (captive ? 0 : STAND[grp] || 1);
  const WAY = { romano: 'antebraco', grego: 'antebraco', classico: 'antebraco', egipcio: 'reverencia', asteca: 'reverencia', nordico: 'aperto' };
  Anim.greetOf = function (ctx) {
    const me = rank(ctx.grp, ctx.captive), ot = rank(ctx.ogrp, ctx.ocaptive);
    if (ot - me >= 1.5) return 'baixa'; if (me - ot >= 1.5) return 'nobre';
    return WAY[ctx.civ] || 'aperto';
  };
  // the part of an act for a role ('a' who begins, 'b' the other), in a context (ctx: civ, grp, captive of me and of the other); null:
  // not a gesture of two (the act's own alone)
  Anim.duoFor = function (act, papel, ctx) {
    if (act === 'greet' || act === 'farewell') return GREET[Anim.greetOf(ctx || {})];
    const d = DUO[act]; if (!d) return null; return d[papel] || d.a || d.b || null;
  };
  Anim.GREET = GREET;
  // how much the hands are on the other at u (0..1 of the act): eased in a tenth of the act before the window, out a tenth after
  Anim.duoW = function (e, u) {
    if (!e || !e.hands) return 0; const a = e.win[0], b = e.win[1], r = 0.1;
    const k = u < a - r ? 0 : u < a ? (u - a + r) / r : u <= b ? 1 : u < b + r ? 1 - (u - b) / r : 0;
    return k * k * (3 - 2 * k);
  };
})(window.G);
