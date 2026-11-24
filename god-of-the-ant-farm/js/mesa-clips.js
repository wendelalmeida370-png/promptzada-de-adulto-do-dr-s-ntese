'use strict';
// ============================================================
//  The gestures of a tavern's table (P7, D-769; made stronger by
//  P6, D-795): the meal eaten from the plate on the table and the
//  cup drunk seated — what the player sees from nearest, on the
//  body it lives and on the guests of the world.
//  The meal: the right hand down to the plate (the fingers, or the
//  bread where the dish has it — no people of the world has a
//  spoon: the catalogue has none), a scoop, up to the mouth with
//  the head coming forward to meet it, the mouthful taken, and the
//  chewing (the face's own channel, chew: the jaw worked shut, the
//  lips pressed — G.Rosto) while the hand goes down again; the left
//  forearm on the board. The guests' whole plate (mesa-refeicao: a
//  plate is the world's T.MEAL, eight seconds — three mouthfuls,
//  the rest between with the chewing and a look round, the back of
//  the hand across the mouth, the last scraped up and the plate
//  pushed away, the trunk back, the hand on the belly), and the
//  same with a word in the rest for who speaks at the table now
//  (mesa-refeicao-fala, the reader's turn of the table). The
//  body's mouthful is one bite (mesa-comer: its hands' act, one
//  E a bite, cardapio-ui.js), the chewing after it.
//  The sip seated: the cup brought up, its rim to the lips, the
//  head going back as it tips, the swallow, and the cup set down
//  by the board (mesa-beber: the body's; mesa-gole: the guests',
//  and mesa-gole-limpar with the back of the left hand across the
//  mouth after it); the cup at rest in the hand on the board
//  between the sips (mesa-caneca). Seated (base 'sit'): the top of
//  the body only, over the seat. Only seen (rule 113): clips of the
//  one animator; what a hand holds is the inventory's (the cup,
//  G.Inv.held) — the plate is on the table, where the world put
//  it (atmos.js, dentro3d.js), never in a hand; the mouthful in the
//  fingers (morsel) is drawn only where the hands hold the food
//  the world served (people3d.js).
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => { Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef && !def.noMirror) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  const D = 180 / Math.PI;
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0, twist: 0, headR: 0, tilt: 0, talk: 0, chew: 0, morsel: 0, wrist: 0 };
  // (a hand at a point of the body — Anim3D.REACH, D-597 —, the right's or the left's mirrored, with a nudge)
  const at = (side, key, nudge) => { const q = (G.Anim3D && G.Anim3D.REACH && G.Anim3D.REACH[key]) || [0, 0, 0.2, 0]; const R = side > 0; const o = {};
    o[R ? 'shRp' : 'shLp'] = q[0] * D; o[R ? 'shRr' : 'shLr'] = (R ? q[1] : -q[1]) * D; o[R ? 'elR' : 'elL'] = q[2] * D; o[R ? 'shRy' : 'shLy'] = (R ? q[3] : -q[3]) * D;
    if (nudge) for (const j in nudge) o[j] = (o[j] !== undefined ? o[j] : REST[j] || 0) + nudge[j]; return o; };
  const mix = (...a) => Object.assign({}, ...a);
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  const U = 'upper';
  const c = (id, dur, list, o) => K(id, Object.assign({ dur, mask: U, base: 'sit', feet: 'free', in: 0.35, out: 0.4, keys: keysOf(list) }, o || {}));

  // ------------------------------ the poses of the table ------------------------------
  // (found on the rig itself — L-1910 —, the palm where it must be: the table's top 0,24 m over the seated pelvis, the plate 0,55 m before
  // it — the board of the taverns' tables, int-moveis.js: 0,74 m, the benches 0,45 m)
  // the left forearm on the board, the hand open by the plate — the elbow bending as the trunk bows, the palm kept on the board
  const board = l => { const k = Math.max(0, Math.min(1, (l || 0) / 24)); return { shLp: -17 + 10 * k, shLr: -3 + 5 * k, elL: 79 + 41 * k, shLy: 4, gripL: 0.25 }; };
  const T = p => (p.shLp !== undefined ? p : mix(board(p.lean), p));
  // the right hand at the plate (the fingers round a morsel, a piece of the bread), the trunk over it, the eyes on it
  const PLATE = { shRp: -27, shRr: 8, elR: 95, shRy: 6, grip: 0.55, lean: 18, neck: 20 };
  // the fingers gathering a mouthful: forward into the plate and back to the near edge of it
  const SCOOP1 = { shRp: -35, shRr: 10, elR: 88, shRy: 6, grip: 0.7, neck: 23, lean: 20 }, SCOOP2 = { shRp: -18, shRr: -1, elR: 105, shRy: 6, grip: 0.8, neck: 18, lean: 19 };
  // the last mouthful scraped up from the plate's floor: the fingers along it and round
  const SCRAPE1 = { shRp: -33, shRr: 9, elR: 90, shRy: 12, grip: 0.6, neck: 25, lean: 21 }, SCRAPE2 = { shRp: -19, shRr: 3, elR: 107, shRy: -2, grip: 0.7, neck: 24, lean: 21 };
  // the hand at the mouth (Anim3D.REACH: the fingers at the lips), the head forward to meet it — and the mouth open for it, a moment
  const MOUTH = mix(at(1, 'boca', { elR: -4 }), { grip: 0.75, lean: 13, neck: 9 }), MOUTHIN = mix(at(1, 'boca', { elR: -2 }), { grip: 0.75, lean: 12, neck: 6 });
  // the hand coming down from the mouth, and resting by the plate, the fingers loose, the head up while one chews
  const DOWN = { shRp: -1, shRr: 10, elR: 137, shRy: 20, grip: 0.45, lean: 10, neck: 3 }, RESTR = { shRp: -12, shRr: -2, elR: 98, shRy: 4, grip: 0.3, lean: 9, neck: 4 };
  // the back of the right hand across the mouth, the knuckles from one corner to the other (the wrist turned over)
  const WIPE1 = mix(at(1, 'boca', { elR: 2, shRy: -10 }), { wrist: -38, grip: 0.5, neck: 4, lean: 7 }), WIPE2 = mix(at(1, 'boca', { elR: -6, shRy: 22, shRr: -6 }), { wrist: -38, grip: 0.5, neck: 5, lean: 7 });
  // the plate pushed a little away (both hands on its rim, the arms reaching), then back in the seat, the hand on the belly
  const PUSH = { shRp: -43, shRr: 2, elR: 69, shRy: 10, grip: 0.35, shLp: -43, shLr: -2, elL: 69, shLy: -10, gripL: 0.35, lean: 14, neck: 12 };
  const SATED = mix(at(1, 'barriga', { elR: -6 }), board(0), { grip: 0.1, lean: -5, neck: -6, tilt: 2 });
  // (one mouthful: at the plate, the scoop, up to the mouth — the mouth opening, the morsel in the fingers on the way —, taken)
  const bite = (u0, scrape) => [
    [u0, T(mix(PLATE, { chew: 0.15, morsel: 0, talk: 0 }))],
    [u0 + 0.025, T(mix(scrape ? SCRAPE1 : SCOOP1, { chew: 0, morsel: 0 }))],
    [u0 + 0.05, T(mix(scrape ? SCRAPE2 : SCOOP2, { morsel: 1 }))],
    [u0 + 0.1, T(mix(MOUTH, { talk: 0.32, morsel: 1 }))],
    [u0 + 0.125, T(mix(MOUTHIN, { talk: 0, chew: 0.4, morsel: 0 }))],
  ];
  // (the chewing after it: the hand down, the head up, the jaw at work — a look aside, by the side asked)
  const chew = (u0, u1, look) => [
    [u0, T(mix(DOWN, { chew: 0.9 }))],
    [u0 + (u1 - u0) * 0.35, T(mix(RESTR, { chew: 1, lookY: look }))],
    [u1, T(mix(RESTR, { chew: 0.8, lookY: look * 0.4, neck: 7 }))],
  ];

  // ------------------------------ the body's mouthful (one E, one bite) ------------------------------
  c('mesa-comer', 2.8, [
    ...bite(0, false).map(([u, p]) => [u * 2.85, p]),
    ...chew(0.56, 0.9, 0),
    [1, T(mix(PLATE, { chew: 0.35 }))],
  ], { acts: ['dine'], events: { contact: 0.33 } });

  // ------------------------------ the guests' plate (the world's T.MEAL, a loop of it) ------------------------------
  const MEAL = (talking) => [
    ...bite(0, false),
    ...chew(0.16, 0.37, 10),
    ...bite(0.39, false),
    ...(talking
      // (the rest with a word: the mouth emptied first, then the word to the table — the right hand open, turned up — and back)
      ? [[0.55, T(mix(DOWN, { chew: 0.9 }))], [0.6, T(mix(RESTR, { chew: 0.6, lean: 6, neck: 0 }))], [0.63, T(mix(RESTR, { chew: 0, talk: 0.55, shRp: -44, shRr: -24, elR: 96, grip: 0.1, lean: 4, neck: -2 }))],
        [0.68, T(mix(RESTR, { talk: 0.6, shRp: -48, shRr: -16, elR: 90, grip: 0.08, lean: 4, neck: -3 }))], [0.715, T(mix(RESTR, { talk: 0.1, neck: 8 }))]]
      // (the rest: the chewing, the trunk back, the swallow — the chin up a moment —, a look round)
      : [[0.55, T(mix(DOWN, { chew: 0.9 }))], [0.6, T(mix(RESTR, { chew: 1, lean: 4, lookY: -12 }))], [0.66, T(mix(RESTR, { chew: 0.7, lean: 3, neck: -6, lookY: -6 }))],
        [0.7, T(mix(RESTR, { chew: 0.1, lean: 6, neck: 2 }))]]),
    // (the last mouthful scraped up, the back of the hand across the mouth, the plate pushed away, back in the seat sated)
    ...bite(0.72, true),
    [0.86, T(mix(DOWN, { chew: 1 }))],
    [0.885, T(mix(WIPE1, { chew: 0.8 }))],
    [0.91, T(mix(WIPE2, { chew: 0.6 }))],
    [0.94, mix(PUSH, { chew: 0.3 })],
    [0.975, mix(SATED, { chew: 0 })],
    [1, T(mix(PLATE, { chew: 0 }))],
  ];
  c('mesa-refeicao', 8, MEAL(false), { events: { contact: 0.125 } });
  c('mesa-refeicao-fala', 8, MEAL(true), { events: { contact: 0.125 } });

  // ------------------------------ the sip seated ------------------------------
  // the cup upright at the belly — the wrist turned to keep it so —, its rim to the lips, tipped toward the face as the head goes
  // back, the swallow, and down again to the board (the standing sip's own numbers, social-clips.js «ato-beber», 22c T-1622: the rim
  // meets the lips on the rig); the left hand on the board — or, after it, the back of the left hand across the mouth
  const CUP = { wrist: -30 }, SIP1 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 30 }, SIP2 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 14 };
  const HOLD = mix(at(1, 'barriga', { elR: -20 }), CUP);
  // (the cup set down by the board: the forearm out, the fist round it at the board's height)
  const SET = { shRp: -13, shRr: 3, elR: 100, shRy: 4, wrist: -22, grip: 0.8 };
  const LWIPE1 = mix(at(-1, 'boca', { elL: 2, shLy: 10 }), { wristL: -38, gripL: 0.5 }), LWIPE2 = mix(at(-1, 'boca', { elL: -6, shLy: -22, shLr: 6 }), { wristL: -38, gripL: 0.5 });
  const sip = (wipe) => [
    [0, T(mix(SET, { grip: 0.8, neck: 6, lean: 8 }))],
    [0.14, T(mix(HOLD, { grip: 0.85, neck: 4, lean: 6 }))],
    [0.3, T(mix(SIP1, { neck: -12, lean: 3 }))],
    [0.42, T(mix(SIP2, { neck: -20, lean: 1, tilt: -2 }))],
    // (the swallow: the head held back, the throat working)
    [0.52, T(mix(SIP2, { neck: -21, lean: 1, wrist: 18 }))],
    [0.62, T(mix(HOLD, { neck: -2, lean: 6 }))],
    ...(wipe
      ? [[0.7, T(mix(SET, { neck: 2, lean: 7 }))], [0.78, mix(SET, LWIPE1, { neck: 3, lean: 6 })], [0.86, mix(SET, LWIPE2, { neck: 4, lean: 6 })], [0.95, T(mix(SET, { neck: 6, lean: 8 }))]]
      : [[0.76, T(mix(SET, { neck: 4, lean: 8 }))], [0.9, T(mix(SET, { neck: 6, lean: 8 }))]]),
    [1, T(mix(SET, { neck: 6, lean: 8 }))],
  ];
  // (the cup in the right hand of everyone, as the standing sip — no twin)
  c('mesa-beber', 2.6, sip(false), { item: { hand: 'mao' }, noMirror: true, events: { contact: 0.42 } });
  c('mesa-gole', 2.6, sip(false), { item: { hand: 'mao' }, noMirror: true, events: { contact: 0.42 } });
  c('mesa-gole-limpar', 3.2, sip(true), { item: { hand: 'mao' }, noMirror: true, events: { contact: 0.34 } });
  // the cup at rest between the sips: on the board in the fist, turned a little now and then, the left forearm by it
  c('mesa-caneca', 6, [
    [0, T(mix(SET, { neck: 6, lean: 8 }))], [0.3, T(mix(SET, { wrist: -16, neck: 8, lean: 9 }))], [0.55, T(mix(SET, { wrist: -26, neck: 5, lean: 8, lookY: 8 }))],
    [0.8, T(mix(SET, { wrist: -20, neck: 6, lean: 8 }))], [1, T(mix(SET, { neck: 6, lean: 8 }))],
  ], { item: { hand: 'mao' }, noMirror: true });
})(window.G);
