'use strict';
// ============================================================
//  The tavern's fourth wave (T6, D-870 to D-879; the contract:
//  planos/taverna-onda4.md): the gesture of each new act of the
//  night, with its mirror for the left-handed where the gesture is
//  of either hand — the door barred, the call in to shelter, the
//  door forced (with the weapon in the hand, or the shoulder), the
//  speech of who gives the feast (the cup raised where the hand has
//  one), the drink thrown in a face and the one who gets it, the
//  drunk's song, the faint and the body on the floor, the one who
//  drags it out and the one dragged, the vat stirred, the pot
//  stirred at a stove, the dice and the cards at a table (the thing
//  of the game in the hand: G.Inv.held — no dice, no throw), the
//  quick hand of the cheat, the arm wrestle; and the life of the
//  room that the one who sits and looks sees: the elbow on the
//  board and the chin in the hand, the lean back, the laugh of the
//  whole body, the story told with the hands, the applause at the
//  end of the music, the keeper drying a cup with his cloth, and
//  the drunk who reaches for the board to keep his feet.
//  Only seen (rule 113): clips of the one animator; what a hand
//  holds is the inventory's (or the house's: the keeper's cloth,
//  G.Dentro3D.ombro), never mimed; when a gesture is made is the
//  world's (its act, its clock) — the reader chooses (vida3d.js).
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => { Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef && !def.noMirror) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  const D = 180 / Math.PI;
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0, twist: 0, headR: 0, tilt: 0, talk: 0, wrist: 0, wristL: 0,
    crouch: 0, hipL: 0, hipR: 0, knL: 3, knR: 3, anL: 0, anR: 0, shift: 0, sway: 0, bob: 0, pelR: 0, breath: 0, lie: 0, chew: 0 };
  const at = (side, key, nudge) => { const q = (G.Anim3D && G.Anim3D.REACH && G.Anim3D.REACH[key]) || [0, 0, 0.2, 0]; const R = side > 0; const o = {};
    o[R ? 'shRp' : 'shLp'] = q[0] * D; o[R ? 'shRr' : 'shLr'] = (R ? q[1] : -q[1]) * D; o[R ? 'elR' : 'elL'] = q[2] * D; o[R ? 'shRy' : 'shLy'] = (R ? q[3] : -q[3]) * D;
    if (nudge) for (const j in nudge) o[j] = (o[j] !== undefined ? o[j] : REST[j] || 0) + nudge[j]; return o; };
  const mix = (...a) => Object.assign({}, ...a);
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  const loopOf = (...poses) => poses.map((p, i) => [i / poses.length, p]).concat([[1, poses[0]]]);
  const U = 'upper';
  const c = (id, dur, mask, list, o) => K(id, Object.assign({ dur, mask, in: 0.35, out: 0.4, events: { contact: 0.5 }, keys: keysOf(list) }, o || {}));
  const left = p => { const o = {}; for (const j in p) { const m = { shRp: 'shLp', shRr: 'shLr', elR: 'elL', shRy: 'shLy', grip: 'gripL', wrist: 'wristL' }[j]; if (m) o[m] = j === 'shRr' || j === 'shRy' ? -p[j] : p[j]; } return o; };
  // (the left forearm on the board, the palm kept on it as the trunk bows — found on the rig: mesa-clips.js)
  const board = l => { const k = Math.max(0, Math.min(1, (l || 0) / 24)); return { shLp: -17 + 10 * k, shLr: -3 + 5 * k, elL: 79 + 41 * k, shLy: 4, gripL: 0.25 }; };
  const T = p => (p.shLp !== undefined ? p : mix(board(p.lean), p));
  // (seated on a bench the trunk bows at most some 18° over the board, and the head does the rest: bowed deeper, the belly folds a leather
  // cuirass's tabs into the thighs — vestir, L-2083)
  const SEAT = { base: 'sit', feet: 'free' };

  // ============================== T1: the tavern in the world that happens ==============================
  // the door barred: the bar lifted from beside the door, up to the brackets, dropped in and pushed home; held a moment
  c('trancar', 2.6, U, [
    [0, { shRp: -38, shRr: -6, elR: 64, grip: 0.9, shLp: -38, shLr: 6, elL: 64, gripL: 0.9, lean: 26, neck: 18 }],
    [0.3, { shRp: -76, shRr: -8, elR: 46, grip: 1, shLp: -76, shLr: 8, elL: 46, gripL: 1, lean: 6, neck: 2 }],
    [0.48, { shRp: -84, shRr: -10, elR: 28, grip: 1, shLp: -84, shLr: 10, elL: 28, gripL: 1, lean: 8, neck: 0 }],
    [0.6, { shRp: -72, shRr: -10, elR: 22, grip: 1, shLp: -72, shLr: 10, elL: 22, gripL: 1, lean: 12, neck: 4 }],
    [0.75, { shRp: -70, shRr: -12, elR: 18, grip: 0.6, shLp: -70, shLr: 12, elL: 18, gripL: 0.6, lean: 14, neck: 4 }],
    [1, { shRp: -38, shRr: -6, elR: 64, grip: 0.9, shLp: -38, shLr: 6, elL: 64, gripL: 0.9, lean: 26, neck: 18 }],
  ], { acts: ['trancar'], events: { contact: 0.6 } });
  // the call in to shelter: the arm sweeping in from the street — «venham, para dentro!» —, the other on the door, the head turning
  c('abrigar', 1.8, U, loopOf(
    { shRp: -100, shRr: -36, elR: 18, grip: 0.05, shLp: -56, shLr: 34, elL: 30, gripL: 0.8, talk: 0.9, neck: -6, lookY: 22 },
    { shRp: -64, shRr: 18, elR: 112, grip: 0.1, shLp: -56, shLr: 34, elL: 30, gripL: 0.8, talk: 0.6, neck: -4, lookY: 8 },
    { shRp: -104, shRr: -40, elR: 14, grip: 0.05, shLp: -56, shLr: 34, elL: 30, gripL: 0.8, talk: 0.95, neck: -8, lookY: -16 },
    { shRp: -62, shRr: 20, elR: 116, grip: 0.1, shLp: -56, shLr: 34, elL: 30, gripL: 0.8, talk: 0.5, neck: -4, lookY: -4 }),
    { acts: ['abrigar'] });
  // the door forced: the weapon in the hand brought down on it two-handed, the body after it (the weapon of G.Inv.held — the reader
  // chooses the shoulder where the hand has none)
  c('arrombar', 1.3, 'full', [
    [0, { shRp: -158, shRr: -10, elR: 40, grip: 1, shLp: -150, shLr: 10, elL: 44, gripL: 1, lean: -6, neck: -6, crouch: 0.04, knL: 14, knR: 10 }],
    [0.4, { shRp: -40, shRr: -6, elR: 10, grip: 1, shLp: -46, shLr: 8, elL: 14, gripL: 1, lean: 22, neck: 8, crouch: 0.08, knL: 22, knR: 14 }],
    [0.55, { shRp: -46, shRr: -6, elR: 16, grip: 1, shLp: -50, shLr: 8, elL: 20, gripL: 1, lean: 20, neck: 6, crouch: 0.07, knL: 20, knR: 12 }],
    [1, { shRp: -158, shRr: -10, elR: 40, grip: 1, shLp: -150, shLr: 10, elL: 44, gripL: 1, lean: -6, neck: -6, crouch: 0.04, knL: 14, knR: 10 }],
  ], { acts: ['arrombar'], item: { hand: 'mao' }, noMirror: true, feet: 'plant', events: { contact: 0.42 } }); // (the weapon is drawn in the right hand: L-2080)
  // (and the shoulder: the body thrown at the door side-on, the arm tucked, again and again)
  c('arrombar-ombro', 1.1, 'full', [
    [0, { twist: 24, lean: 4, shLp: -18, shLr: -16, elL: 112, gripL: 1, shRp: -30, shRr: -24, elR: 60, grip: 0.8, crouch: 0.06, knL: 18, knR: 24, neck: 4, headR: -8 }],
    [0.35, { twist: 34, lean: 18, shLp: -10, shLr: -20, elL: 118, gripL: 1, shRp: -40, shRr: -30, elR: 54, grip: 1, crouch: 0.1, knL: 30, knR: 14, neck: 10, headR: -12 }],
    [0.45, { twist: 30, lean: 14, shLp: -12, shLr: -18, elL: 116, gripL: 1, shRp: -36, shRr: -28, elR: 56, grip: 1, crouch: 0.08, knL: 24, knR: 16, neck: 8, headR: -10 }],
    [1, { twist: 24, lean: 4, shLp: -18, shLr: -16, elL: 112, gripL: 1, shRp: -30, shRr: -24, elR: 60, grip: 0.8, crouch: 0.06, knL: 18, knR: 24, neck: 4, headR: -8 }],
  ], { feet: 'plant', events: { contact: 0.38 } });
  // the speech of who gives the feast: the cup raised high — the reason said to the room —, the other arm open, the eyes going round;
  // with no cup in the hand, the open hand raised (discurso-mao, the reader's)
  const SPEAK = (cup) => loopOf(
    mix(cup ? { shRp: -150, shRr: -8, elR: 22, shRy: 6, wrist: 52, grip: 1 } : { shRp: -138, shRr: -18, elR: 30, grip: 0.05 }, { shLp: -62, shLr: 58, elL: 22, gripL: 0.05, talk: 0.85, neck: -8, lookY: -18 }),
    mix(cup ? { shRp: -156, shRr: -6, elR: 16, shRy: 6, wrist: 54, grip: 1 } : { shRp: -146, shRr: -14, elR: 22, grip: 0.05 }, { shLp: -70, shLr: 62, elL: 18, gripL: 0.05, talk: 0.65, neck: -10, lookY: 0 }),
    mix(cup ? { shRp: -150, shRr: -8, elR: 22, shRy: 6, wrist: 52, grip: 1 } : { shRp: -138, shRr: -18, elR: 30, grip: 0.05 }, { shLp: -62, shLr: 58, elL: 22, gripL: 0.05, talk: 0.9, neck: -8, lookY: 18 }));
  c('discurso', 3.2, U, SPEAK(true), { acts: ['discurso'], item: { hand: 'mao' }, noMirror: true });
  c('discurso-mao', 3.2, U, SPEAK(false), {});

  // ============================== T2: the drink ==============================
  // the drink thrown in a face: the cup brought back low, swung up and out, the wrist tipping it — the insult said with it; the cup
  // of the hand (G.Inv.held), as the sip's: in the right hand of everyone
  const CUP = { wrist: -30 }, HOLD = mix(at(1, 'barriga', { elR: -20 }), CUP);
  c('jogar-bebida', 1.5, U, [
    [0, mix(HOLD, { grip: 0.9, lean: 2, neck: 0, talk: 0.5 })],
    [0.25, { shRp: -6, shRr: -14, elR: 70, shRy: 0, wrist: -26, grip: 1, lean: -4, twist: 10, talk: 0.8, neck: -4 }],
    [0.42, { shRp: -84, shRr: -6, elR: 14, shRy: 4, wrist: -70, grip: 1, lean: 10, twist: -8, talk: 0.9, neck: -6 }],
    [0.58, { shRp: -78, shRr: -8, elR: 18, wrist: -60, grip: 1, lean: 8, twist: -6, talk: 0.4 }],
    [1, mix(HOLD, { grip: 0.9, lean: 2, neck: 0, talk: 0.3 })],
  ], { acts: ['jogar-bebida'], item: { hand: 'mao' }, noMirror: true, events: { contact: 0.42 } });
  // and the one who gets it: the flinch back with the arms up, the head turned away, then the face wiped with both hands, the head shaken
  // (both palms down the face with the elbows out to the sides — found on the rig: the forearms off a blouse's breast; the palms drawn down the face: shRp)
  const WIPE = d => ({ shRp: -30 + d, shRr: -40, shRy: 50, elR: 135, grip: 0.1, shLp: -30 + d, shLr: 40, shLy: -50, elL: 135, gripL: 0.1 });
  c('molhado', 1.8, U, [
    [0, { lean: 0, neck: 0 }],
    [0.12, { shRp: -96, shRr: -16, elR: 100, shLp: -96, shLr: 16, elL: 100, grip: 0.3, gripL: 0.3, lean: -10, twist: -12, neck: -10, lookY: -30, talk: 0.5 }],
    [0.4, mix(WIPE(0), { lean: -4, twist: -6, neck: 8, lookY: -10, talk: 0 })],
    [0.56, mix(WIPE(14), { lean: -2, twist: 0, neck: 10, lookY: 12 })],
    [0.66, mix(WIPE(0), { lean: -2, neck: 6, lookY: -12 })],
    [0.82, { shRp: 9, shRr: -12, shRy: 0, elR: 80, wrist: 40, grip: 0, shLp: 9, shLr: 12, shLy: 0, elL: 80, wristL: 40, gripL: 0, lean: 0, neck: 2, lookY: 14, talk: 0.4 }], // (the water shaken off the hands)
    [0.9, { shRp: 6, shRr: -14, elR: 70, wrist: -30, shLp: 6, shLr: 14, elL: 70, wristL: -30, neck: 2, lookY: -8, talk: 0.6 }],
    [1, mix(REST, { lean: 0, neck: 2, talk: 0.6 })],
  ], { acts: ['molhado'], loop: false, noMirror: true, events: { contact: 0.12 } }); // (the head turned always to the same side: the flick of the wrists has no twin within a centimetre — gestos-vida g8)
  // the drunk's song, loud and alone: the head thrown back, the mouth wide, an arm swaying out wide, the other hand on the chest
  c('cantoria', 2.4, U, loopOf(
    mix(at(-1, 'peito'), { shRp: -112, shRr: -42, elR: 30, grip: 0.1, talk: 0.95, neck: -18, tilt: 3, twist: 5, headR: 5 }),
    mix(at(-1, 'peito'), { shRp: -78, shRr: -52, elR: 40, grip: 0.1, talk: 0.75, neck: -14, tilt: -2, twist: -3, headR: -4 }),
    mix(at(-1, 'peito'), { shRp: -120, shRr: -30, elR: 24, grip: 0.1, talk: 0.95, neck: -20, tilt: 4, twist: 4, headR: 7 })), // (the sway in the head more than the trunk: a rigid cuirass's edge — vestir)
    { acts: ['cantoria'] });
  // the faint: the knees going, the body folding and down to the floor, then lying sprawled, the eyes shut — held there
  // (the crouch of each moment found on the rig, the soles on the floor while the knees go and the body tips over — the knees kept bent
  // until it is nearly down)
  c('desmaio', 2.2, 'full', [
    [0, { neck: 10, lean: 6, crouch: 0, knL: 6, knR: 6, shRp: 4, shLp: 4, elR: 12, elL: 12 }],
    [0.22, { neck: 24, lean: 22, crouch: 0.425, hipL: -40, hipR: -36, knL: 70, knR: 64, shRp: 10, shLp: 6, elR: 20, elL: 24, tilt: 6 }],
    [0.4, { neck: 22, lean: 26, crouch: 0.215, hipL: -60, hipR: -56, knL: 100, knR: 94, lie: 0, shRp: -10, shLp: -6, shRr: -24, shLr: 24, elR: 30, elL: 30, tilt: 4 }],
    [0.46, { neck: 16, lean: 20, crouch: 0.085, hipL: -60, hipR: -56, knL: 100, knR: 94, lie: 0.3, shRp: -6, shLp: -6, shRr: -30, shLr: 28, elR: 28, elL: 32 }],
    [0.5, { neck: 8, lean: 10, crouch: 0.025, hipL: -60, hipR: -56, knL: 110, knR: 100, lie: 0.5, shRp: -4, shLp: -6, shRr: -36, shLr: 32, elR: 28, elL: 34 }],
    [0.54, { neck: 0, lean: 4, crouch: 0.01, hipL: -50, hipR: -46, knL: 90, knR: 80, lie: 0.8, shRp: 0, shLp: -4, shRr: -42, shLr: 36, elR: 26, elL: 38 }],
    [0.62, { neck: -8, lean: 0, crouch: 0, hipL: -14, hipR: -4, knL: 22, knR: 8, lie: 1, shRp: 2, shLp: -4, shRr: -48, shLr: 38, elR: 24, elL: 40, tilt: 0 }],
    [0.75, { neck: -10, lean: 0, crouch: 0, hipL: -14, hipR: -4, knL: 22, knR: 8, lie: 1, shRp: 2, shLp: -4, shRr: -48, shLr: 38, elR: 24, elL: 40, breath: 0.3 }],
    [1, { neck: -10, lean: 0, crouch: 0, hipL: -14, hipR: -4, knL: 22, knR: 8, lie: 1, shRp: 2, shLp: -4, shRr: -48, shLr: 38, elR: 24, elL: 40, breath: 0.3 }],
  ], { acts: ['desmaio'], base: 'idle', feet: 'free', loop: false, eyes: 'shut', in: 0.25, out: 0.6 });
  // the one dragged out: on the back on the floor, the arms up over the head where the hands hold the wrists, the heels trailing
  c('arrastado', 1.6, 'full', loopOf(
    { lie: 1, shRp: -168, shLp: -168, shRr: 8, shLr: -8, elR: 8, elL: 8, grip: 0.4, gripL: 0.4, neck: -14, headR: 10, hipL: -10, hipR: -16, knL: 16, knR: 24 },
    { lie: 1, shRp: -170, shLp: -166, shRr: 10, shLr: -6, elR: 6, elL: 10, grip: 0.4, gripL: 0.4, neck: -12, headR: 4, hipL: -14, hipR: -12, knL: 22, knR: 18 }),
    { acts: ['arrastado'], base: 'idle', feet: 'free', eyes: 'shut', noMirror: true, in: 0.3, out: 0.6 }); // (from the floor: the faint before it)
  // and who drags: bent over the one on the floor, the arms down to their wrists, the weight thrown back — over the stride (walking
  // backward: the world's), and standing at the door
  c('arrastar', 1.4, U, loopOf(
    { lean: 38, neck: 10, shRp: -50, shRr: -6, elR: 8, grip: 1, shLp: -50, shLr: 6, elL: 8, gripL: 1, talk: 0.2 },
    { lean: 34, neck: 6, shRp: -44, shRr: -6, elR: 14, grip: 1, shLp: -44, shLr: 6, elL: 14, gripL: 1, talk: 0 }),
    { acts: ['arrastar'], noMirror: true });

  // ============================== T3: the house's own work ==============================
  // the vat stirred: both fists on the paddle stood in the vat (the vat's own — the furniture's), one over the other, the trunk going
  // round with the stroke
  c('mexer-cuba', 2.4, U, loopOf(
    { shRp: -58, shRr: -4, elR: 72, grip: 1, shLp: -38, shLr: 10, elL: 48, gripL: 1, lean: 16, twist: 14, neck: 14 },
    { shRp: -50, shRr: 6, elR: 64, grip: 1, shLp: -30, shLr: 16, elL: 40, gripL: 1, lean: 24, twist: 0, neck: 18 },
    { shRp: -58, shRr: -4, elR: 72, grip: 1, shLp: -38, shLr: 10, elL: 48, gripL: 1, lean: 16, twist: -14, neck: 14 },
    { shRp: -66, shRr: -10, elR: 80, grip: 1, shLp: -44, shLr: 4, elL: 56, gripL: 1, lean: 10, twist: 0, neck: 10 }),
    { acts: ['mexer-cuba'] });
  // the pot stirred at a stove of the tavern standing (the act cook of the house's fire at a hearth is the posture crouched at it):
  // bent over the pot, the right hand going round in it, the left steadying it by its handle, the face over the steam
  c('cozinhar-pe', 2.2, U, loopOf(
    { shRp: -11, shRr: 7, elR: 69, shRy: 10, grip: 0.8, shLp: -4, shLr: -6, elL: 76, shLy: 6, gripL: 0.8, lean: 20, neck: 25 },
    { shRp: 1, shRr: -3, elR: 79, shRy: 10, grip: 0.8, shLp: -4, shLr: -6, elL: 76, shLy: 6, gripL: 0.8, lean: 20, neck: 26 },
    { shRp: -6, shRr: -8, elR: 74, shRy: 4, grip: 0.8, shLp: -4, shLr: -6, elL: 76, shLy: 6, gripL: 0.8, lean: 21, neck: 25 },
    { shRp: -14, shRr: 2, elR: 66, shRy: 12, grip: 0.8, shLp: -4, shLr: -6, elL: 76, shLy: 6, gripL: 0.8, lean: 20, neck: 24 }),
    { noMirror: true });

  // ============================== T4, T5: the games at a table ==============================
  // the dice: the cup shaken by the ear, brought down and thrown on the board, leaned over and looked at — the count said —, swept up
  // (the dice of G.Inv.held in the hand: no dice, no throw)
  const SHAKE = { shRp: -3, shRr: 15, elR: 127, shRy: 6, grip: 1 }; // (the cupped fist before the chest: clear of a toga's drape)
  c('jogo-dados', 3.6, U, [
    [0, T(mix(SHAKE, { lean: 6, neck: -2, headR: 8 }))],
    [0.06, T(mix(SHAKE, { shRp: -10, lean: 6, neck: -2, headR: 8 }))],
    [0.12, T(mix(SHAKE, { shRp: 2, lean: 6, neck: -2, headR: 8 }))],
    [0.18, T(mix(SHAKE, { shRp: -10, lean: 6, neck: -2, headR: 8 }))],
    [0.32, T({ shRp: -40, shRr: 17, elR: 77, shRy: 4, grip: 0, lean: 18, neck: 28 })],
    [0.42, T({ shRp: -17, shRr: 5, elR: 104, shRy: 0, grip: 0.1, lean: 18, neck: 38 })],
    [0.52, T({ shRp: -17, shRr: 5, elR: 102, shRy: 0, grip: 0.1, lean: 18, neck: 36, talk: 0.55 })],
    [0.59, T({ shRp: -36, shRr: 10, elR: 84, shRy: 0, grip: 0.2, lean: 18, neck: 34 })], // (the hand out to where the dice rolled before it sweeps them in: the elbow off the belly, clear of a toga's drape — T-1980)
    [0.66, T({ shRp: -19, shRr: 32, elR: 91, shRy: 0, grip: 0.4, lean: 15, neck: 32 })], // (the dice swept to the near edge in the one hand: an arm across the chest goes through a toga's drape)
    [0.78, T({ shRp: -22, shRr: 25, elR: 95, shRy: 20, grip: 0.8, lean: 18, neck: 28 })],
    [0.9, T(mix(SHAKE, { lean: 8, neck: 0 }))],
    [1, T(mix(SHAKE, { lean: 6, neck: -2, headR: 8 }))],
  ], Object.assign({ acts: ['jogo-dados'], item: { hand: 'mao' }, noMirror: true, events: { contact: 0.32 } }, SEAT)); // (the dice in the right hand, where the thing is drawn: L-2080)
  // the cards: the hand of them fanned in the left before the chest, the right picking one, playing it on the board, back; the head
  // over them, the eyes on the others' faces between (the deck of G.Inv.held — the reader asks for it in either hand)
  const FAN = { shLp: 21, shLr: -83, elL: 124, shLy: -10, gripL: 0.8 };
  c('jogo-cartas', 4, U, [
    [0, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 10, neck: 14 })],
    [0.2, mix(FAN, { shRp: -9, shRr: 33, elR: 113, shRy: 30, grip: 0.7, lean: 10, neck: 16 })],
    [0.3, mix(FAN, { shRp: -9, shRr: 30, elR: 110, shRy: 30, grip: 0.9, lean: 10, neck: 12, lookY: 14 })],
    [0.46, mix(FAN, { shRp: -30, shRr: 22, elR: 88, shRy: 6, grip: 0.9, lean: 18, neck: 18 })],
    [0.52, mix(FAN, { shRp: -30, shRr: 22, elR: 86, shRy: 6, grip: 0.1, lean: 18, neck: 18 })],
    [0.66, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 12, neck: 10, lookY: -16, talk: 0.3 })],
    [0.85, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 10, neck: 12, lookY: 10 })],
    [1, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 10, neck: 14 })],
  ], Object.assign({ acts: ['jogo-cartas'], noMirror: true, events: { contact: 0.5 } }, SEAT));
  // the winner's slap on the board: the hand up and down flat on it, the cards laid out, the laugh, back in the seat
  c('jogo-cartas-ganha', 2.4, U, [
    [0, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 10, neck: 14 })],
    [0.25, mix(FAN, { shRp: -32, shRr: -2, elR: 119, shRy: 10, grip: 0.05, lean: 4, neck: -6, talk: 0.7 })],
    [0.34, mix(FAN, { shRp: -18, shRr: 13, elR: 97, shRy: 6, grip: 0.05, lean: 16, neck: 8, talk: 0.9 })],
    [0.5, mix(FAN, { shRp: -18, shRr: 13, elR: 97, shRy: 6, grip: 0.05, lean: 12, neck: -4, talk: 0.8 })],
    [0.75, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 0, neck: -10, talk: 0.5 })],
    [1, mix(FAN, { shRp: -13, shRr: 4, elR: 88, grip: 0.2, lean: 10, neck: 14 })],
  ], Object.assign({ acts: ['jogo-cartas-ganha'], noMirror: true, loop: false, events: { contact: 0.34 } }, SEAT));
  // the cheat's quick hand (trapaca): an ordinary moment at the board, then the right hand quick to the left sleeve — the die changed, the
  // card hidden — and back, small, the eyes going to the others first
  c('trapaca', 2.4, U, [
    [0, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.3, lean: 10, neck: 12 })],
    [0.3, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.3, lean: 10, neck: 6, lookY: 18 })],
    [0.42, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.3, lean: 10, neck: 6, lookY: -18 })],
    [0.5, T({ shRp: -31, shRr: 13, elR: 76, shRy: 40, grip: 0.8, lean: 12, neck: 8, lookY: -8 })],
    [0.56, T({ shRp: -30, shRr: 14, elR: 78, shRy: 40, grip: 0.5, lean: 12, neck: 8, lookY: 6 })],
    [0.64, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.3, lean: 10, neck: 10, lookY: 0 })],
    [1, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.3, lean: 10, neck: 12 })],
  ], Object.assign({ acts: ['trapaca'], events: { contact: 0.53 } }, SEAT));
  // the arm wrestle (queda-de-braco, the same part for the two — Anim.DUO): the right elbows on the board, the hands locked between, the
  // strain shaking in them, the left hand gripping the board's edge, the face of the effort
  const WR = { shRp: -29, shRr: 42, elR: 112, shRy: 20, grip: 1, shLp: -17, shLr: -3, elL: 79, shLy: 4, gripL: 1, lean: 18, neck: 10 };
  const shake = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12, s = (i % 2 ? 1 : -1); shake.push([u, mix(WR, { shRr: 42 + s * 2.5, elR: 112 - s * 2, lean: 18 + s * 0.8, neck: 10 + s * 1.5, talk: i % 4 === 1 ? 0.25 : 0 })]); }
  c('queda-de-braco', 1.2, U, shake, Object.assign({ acts: ['queda-de-braco'], noMirror: true }, SEAT));
  // (and the arm that gives: the locked hands going down to the board on the loser's side)
  c('queda-de-braco-cede', 1.6, U, [[0, WR], [0.5, mix(WR, { shRp: -22, shRr: 24, elR: 112, shRy: 14, lean: 16 })], [1, mix(WR, { shRp: -12, shRr: -3, elR: 111, shRy: 4, lean: 14, neck: 14 })]],
    Object.assign({ acts: ['queda-de-braco-cede'], noMirror: true, loop: false }, SEAT));

  // ============================== the life of the room ==============================
  // the elbow on the board and the chin in the hand, the eyes on the room; and the lean back, the arms crossed over the belly
  c('mesa-queixo', 6, U, loopOf(
    T(mix(at(1, 'rosto', { elR: 6 }), { grip: 0.4, lean: 17, neck: 13, headR: 6 })), T(mix(at(1, 'rosto', { elR: 8 }), { grip: 0.4, lean: 18, neck: 15, headR: 8, lookY: 10 })),
    T(mix(at(1, 'rosto', { elR: 6 }), { grip: 0.4, lean: 17, neck: 13, headR: 5, lookY: -8 }))), Object.assign({ noMirror: true }, SEAT));
  c('mesa-recostar', 7, U, loopOf(mix(at(1, 'barriga', { elR: -10 }), at(-1, 'barriga', { elL: -10 }), { lean: -8, neck: -4, grip: 0.3, gripL: 0.3 }),
    mix(at(1, 'barriga', { elR: -8 }), at(-1, 'barriga', { elL: -8 }), { lean: -9, neck: -2, lookY: 12 }), mix(at(1, 'barriga', { elR: -10 }), at(-1, 'barriga', { elL: -10 }), { lean: -8, neck: -6, lookY: -10 })), SEAT);
  // the laugh of the whole body: the trunk thrown back and shaking, the head back, a hand slapping the board (or the thigh), the other
  // on the belly — over a seat or standing
  const LAUGH = { talk: 0.8, neck: -20, lean: -3 }; // (the head thrown back more than the trunk: a rigid cuirass's edge — vestir, L-2083)
  c('riso-corpo', 1.6, U, [
    [0, mix(at(-1, 'barriga'), LAUGH, { shRp: -30, shRr: -10, elR: 60, grip: 0.05, breath: 0.6 })],
    [0.2, mix(at(-1, 'barriga'), LAUGH, { shRp: -18, shRr: 13, elR: 97, grip: 0.05, lean: 5, neck: 6, breath: 0.2, talk: 0.9 })],
    [0.36, mix(at(-1, 'barriga'), LAUGH, { shRp: -30, shRr: -10, elR: 60, grip: 0.05, lean: -5, neck: -23, breath: 0.7 })], // (thrown back by the head more than the trunk: a rigid cuirass's edge)
    [0.52, mix(at(-1, 'barriga'), LAUGH, { shRp: -26, shRr: -8, elR: 66, lean: -3, neck: -15, breath: 0.3, talk: 0.7 })],
    [0.7, mix(at(-1, 'barriga'), LAUGH, { shRp: -18, shRr: 13, elR: 97, lean: 6, neck: 10, breath: 0.2, talk: 0.9 })],
    [1, mix(at(-1, 'barriga'), LAUGH, { shRp: -30, shRr: -10, elR: 60, grip: 0.05, breath: 0.6 })],
  ], { takes: ['laugh'] });
  // the story told with the hands: the hands shaping the thing — so big, so far, then it came —, the trunk leaning in, the eyes on the
  // ones who listen
  c('contar-historia', 4.2, U, [
    [0, { shRp: -44, shRr: -14, elR: 96, grip: 0.1, shLp: -44, shLr: 14, elL: 96, gripL: 0.1, lean: 8, neck: 0, talk: 0.6, lookY: -10 }],
    [0.22, { shRp: -60, shRr: -38, elR: 50, grip: 0.05, shLp: -60, shLr: 38, elL: 50, gripL: 0.05, lean: 4, neck: -6, talk: 0.8, lookY: 0 }],
    [0.42, { shRp: -74, shRr: -10, elR: 40, grip: 0.1, shLp: -30, shLr: 12, elL: 80, gripL: 0.2, lean: 12, neck: 2, talk: 0.7, lookY: 12 }],
    [0.6, { shRp: -40, shRr: 8, elR: 110, grip: 0.6, shLp: -40, shLr: -8, elL: 110, gripL: 0.6, lean: 16, neck: 6, talk: 0.5, lookY: 6 }],
    [0.78, { shRp: -84, shRr: -22, elR: 24, grip: 0.05, shLp: -36, shLr: 14, elL: 90, gripL: 0.1, lean: 6, neck: -4, talk: 0.9, lookY: -6 }],
    [1, { shRp: -44, shRr: -14, elR: 96, grip: 0.1, shLp: -44, shLr: 14, elL: 96, gripL: 0.1, lean: 8, neck: 0, talk: 0.6, lookY: -10 }],
  ], { acts: ['tell'] });
  // the applause at the end of the music: quick claps raised a little, the head up and the face glad
  const CL1 = { shRp: -32, shRr: 3, elR: 99, shRy: 26, grip: 0.05 }, CL2 = { shRp: -27, shRr: -23, elR: 108, shRy: 22, grip: 0.05 };
  c('aplauso', 0.8, U, [[0, mix(CL1, left(CL1), { neck: -6, talk: 0.3 })], [0.25, mix(CL2, left(CL2), { neck: -4 })], [0.5, mix(CL1, left(CL1), { neck: -6, talk: 0.5 })], [0.75, mix(CL2, left(CL2), { neck: -4 })], [1, mix(CL1, left(CL1), { neck: -6, talk: 0.3 })]], {});
  // the keeper drying a cup at his counter: the cup in the left hand before the belly, the cloth in the right going round in it, the head
  // bent to it — now and then a look at the room (the cup the house's ware, the cloth the keeper's: the reader's, never mimed)
  c('enxugar-caneca', 3, U, [
    [0, { shLp: 11, shLr: -22, elL: 106, shLy: -20, gripL: 0.85, shRp: 2, shRr: 8, elR: 107, shRy: 30, grip: 0.6, neck: 22, lean: 4 }],
    [0.25, { shLp: 11, shLr: -22, elL: 106, shLy: -20, gripL: 0.85, shRp: -4, shRr: 14, elR: 102, shRy: 36, grip: 0.6, neck: 22, lean: 4 }],
    [0.5, { shLp: 11, shLr: -22, elL: 106, shLy: -20, gripL: 0.85, shRp: 6, shRr: 4, elR: 110, shRy: 24, grip: 0.6, neck: 20, lean: 4, lookY: 10 }],
    [0.75, { shLp: 11, shLr: -22, elL: 106, shLy: -20, gripL: 0.85, shRp: -2, shRr: 10, elR: 104, shRy: 32, grip: 0.6, neck: 8, lean: 2, lookY: 22 }],
    [1, { shLp: 11, shLr: -22, elL: 106, shLy: -20, gripL: 0.85, shRp: 2, shRr: 8, elR: 107, shRy: 30, grip: 0.6, neck: 22, lean: 4 }],
  ], { noMirror: true, item: { hand: 'outra' } });
  // the drunk on his feet: an arm out for the board or the wall, the head heavy — the stagger of the legs is the stride's own (Anim.stagger);
  // the drunk seated: the elbow on the board, the head heavy in the hand, slipping
  c('bebado-apoio', 2.6, U, loopOf({ shLp: -44, shLr: 48, elL: 22, gripL: 0.3, shRp: -10, shRr: -20, elR: 30, neck: 16, headR: 12, tilt: 4 },
    { shLp: -52, shLr: 40, elL: 16, gripL: 0.6, shRp: -14, shRr: -26, elR: 36, neck: 20, headR: -8, tilt: -3 }), {});
  c('bebado-mesa', 4, U, loopOf(T(mix(at(1, 'rosto', { elR: 6 }), { grip: 0.2, lean: 16, neck: 18, headR: 16, tilt: 5 })), T(mix(at(1, 'rosto', { elR: 8 }), { grip: 0.2, lean: 18, neck: 21, headR: 8, tilt: -2 })),
    T(mix(at(1, 'rosto', { elR: 6 }), { grip: 0.2, lean: 17, neck: 19, headR: 20, tilt: 4 }))), Object.assign({ eyes: 'half', noMirror: true }, SEAT));

  // ============================== the names the sound gave (T8): the contest, the crowd round it, the cheat caught ==============================
  // the drinking contest (concurso-bebida): the cup up to the lips and tipped high, the head back and the throat working, swallow after
  // swallow, slammed down on the board, the back of the left hand across the mouth and the shout — the sip's own numbers (mesa-clips.js:
  // the rim meets the lips on the rig), the cup of the inventory in the hand (V3.NEEDS: no cup, no contest)
  const SIP1 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 30 }, SIP2 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 14 };
  const SET = { shRp: -13, shRr: 3, elR: 100, shRy: 4, wrist: -22, grip: 0.8 }; // (CUP and HOLD: the cup at the belly, as the speech's)
  const LWIPE1 = mix(at(-1, 'boca', { elL: 2, shLy: 10 }), { wristL: -38, gripL: 0.5 }), LWIPE2 = mix(at(-1, 'boca', { elL: -6, shLy: -22, shLr: 6 }), { wristL: -38, gripL: 0.5 });
  c('concurso-bebida', 3.6, U, [
    [0, T(mix(SET, { grip: 0.9, neck: 6, lean: 10, talk: 0 }))],
    [0.08, T(mix(HOLD, { grip: 0.95, neck: 4, lean: 8 }))],
    [0.18, T(mix(SIP1, { grip: 1, neck: -12, lean: 4 }))],
    [0.28, T(mix(SIP2, { neck: -21, lean: 1, tilt: -2 }))],
    [0.36, T(mix(SIP2, { wrist: 6, neck: -24, lean: 0 }))],
    [0.44, T(mix(SIP2, { wrist: 2, neck: -22, lean: 0 }))],
    [0.52, T(mix(SIP2, { wrist: -2, neck: -25, lean: -1 }))],
    [0.6, T(mix(SIP2, { wrist: -4, neck: -23, lean: -1 }))],
    [0.68, T(mix(HOLD, { neck: -2, lean: 8 }))],
    [0.75, T(mix(SET, { grip: 1, neck: 6, lean: 12, talk: 0.3 }))],
    [0.83, mix(SET, LWIPE1, { neck: 2, lean: 8, talk: 0.2 })],
    [0.91, mix(SET, LWIPE2, { neck: -4, lean: 4, talk: 0.9 })],
    [1, T(mix(SET, { grip: 0.9, neck: 6, lean: 10, talk: 0 }))],
  ], Object.assign({ acts: ['concurso-bebida'], item: { hand: 'mao' }, noMirror: true, events: { contact: 0.75 } }, SEAT));
  // the crowd round a contest and an arm wrestle (torcer): the fist pumping up and pulled down, the other hand cupped by the mouth, shouting
  // — seated or standing, the fist of either hand
  const PUMPU = { shRp: -150, shRr: -22, elR: 30, shRy: 0, grip: 1 }, PUMPD = { shRp: -104, shRr: -34, elR: 104, shRy: 8, grip: 1 };
  const CALL = mix(at(-1, 'boca', { elL: 4, shLy: 6 }), { gripL: 0.35 });
  c('torcer', 1.6, U, loopOf(mix(PUMPU, CALL, { talk: 0.9, neck: -8 }), mix(PUMPD, CALL, { talk: 0.6, neck: -4 }), mix(PUMPU, CALL, { shRr: -18, talk: 0.95, neck: -9, lookY: 6 }), mix(PUMPD, CALL, { talk: 0.5, neck: -4, lookY: -4 })),
    { acts: ['torcer'], events: { contact: 0.25 } });
  // the cheat caught (trapaca-pega): both open hands up before the shoulders — «não fui eu!» —, leaning back from the board, the head
  // shaking, talking fast (the head drawn back more than the trunk: a rigid cuirass's edge, vestir)
  const NOT = { shRp: -70, shRr: -35, elR: 95, shRy: 0, grip: 0, shLp: -70, shLr: 35, elL: 95, shLy: 0, gripL: 0 };
  c('trapaca-pega', 1.8, U, loopOf(mix(NOT, { lean: -3, neck: -10, talk: 0.85, lookY: 14 }), mix(NOT, { shRp: -62, shLp: -62, elR: 100, elL: 100, lean: -4, neck: -8, talk: 0.5, lookY: -14 }),
    mix(NOT, { shRp: -74, shLp: -74, lean: -3, neck: -10, talk: 0.9, lookY: 12 }), mix(NOT, { shRp: -60, shLp: -60, elR: 102, elL: 102, lean: -3, neck: -7, talk: 0.6, lookY: -10 })),
    { acts: ['trapaca-pega'] });
})(window.G);
