'use strict';
// ============================================================
//  The living tavern (P6, D-795 to D-799): the gestures of the acts
//  the world gives in a tavern's night (P7: act-taverna.js), each a
//  clip of the one animator with its mirror for the left-handed —
//  the toast seated (the cups raised, the clink, the draught), the
//  knucklebones thrown on the board, looked at and gathered (the
//  bones of G.Inv.held in the hand: without them, no game), the
//  dance on one's feet by the stage and the claps and the singing
//  along at the tables in the compass of the music (beats: a loop
//  of so many beats of the player's tune — vida3d.js gives the
//  time by the musician's own clock), the nap with the head on the
//  arms over the board (the eyes shut, the breath slow), the
//  keeper wiping a table (the cloth of G.Inv.held: no cloth, no
//  wiping), gathering the cups in the crook of his arms, sending
//  the house home at the closing, and leading the brawler out by
//  the arm (the two parts of «expulsar», Anim.DUO — anim-duo.js);
//  the coin thrown to the musician; the walk of who drank too much;
//  the keeper with a plate: carried level, set before the seated
//  one, or held while he calls the one it is for to their seat.
//  Only seen (rule 113): what a hand holds is the inventory's,
//  never mimed; the moment is the world's (its act, its clock).
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => { Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef && !def.noMirror) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  const D = 180 / Math.PI;
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0, twist: 0, headR: 0, tilt: 0, talk: 0, wrist: 0, wristL: 0,
    crouch: 0, hipL: 0, hipR: 0, knL: 3, knR: 3, anL: 0, anR: 0, shift: 0, sway: 0, bob: 0, pelR: 0, breath: 0 };
  const at = (side, key, nudge) => { const q = (G.Anim3D && G.Anim3D.REACH && G.Anim3D.REACH[key]) || [0, 0, 0.2, 0]; const R = side > 0; const o = {};
    o[R ? 'shRp' : 'shLp'] = q[0] * D; o[R ? 'shRr' : 'shLr'] = (R ? q[1] : -q[1]) * D; o[R ? 'elR' : 'elL'] = q[2] * D; o[R ? 'shRy' : 'shLy'] = (R ? q[3] : -q[3]) * D;
    if (nudge) for (const j in nudge) o[j] = (o[j] !== undefined ? o[j] : REST[j] || 0) + nudge[j]; return o; };
  const mix = (...a) => Object.assign({}, ...a);
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  const loopOf = (...poses) => poses.map((p, i) => [i / poses.length, p]).concat([[1, poses[0]]]);
  const U = 'upper';
  const c = (id, dur, mask, list, o) => K(id, Object.assign({ dur, mask, in: 0.35, out: 0.4, events: { contact: 0.5 }, keys: keysOf(list) }, o || {}));
  // (the right arm's pose mirrored to the left one — the claps, the cups held with both hands)
  const left = p => { const o = {}; for (const j in p) { const m = { shRp: 'shLp', shRr: 'shLr', elR: 'elL', shRy: 'shLy', grip: 'gripL', wrist: 'wristL' }[j]; if (m) o[m] = j === 'shRr' || j === 'shRy' ? -p[j] : p[j]; } return o; };
  // (the left forearm on the board — the palm kept on it as the trunk bows: the elbow bends; found on the rig, mesa-clips.js)
  const board = l => { const k = Math.max(0, Math.min(1, (l || 0) / 24)); return { shLp: -17 + 10 * k, shLr: -3 + 5 * k, elL: 79 + 41 * k, shLy: 4, gripL: 0.25 }; };
  const T = p => (p.shLp !== undefined ? p : mix(board(p.lean), p));

  // ------------------------------ the toast (brinde) ------------------------------
  // the cup up toward the middle of the table — «saúde!» —, the clink with the others' (the hands of two meet at the toast of two:
  // Anim.DUO.brinde, duo-brinde), back, the draught, the cup down; seated or standing, the top of the body only
  const CUP = { wrist: -30 }, SIP1 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 30 }, SIP2 = { shRp: -40, shRr: 38.3, elR: 124.3, shRy: 39.8, wrist: 14 };
  const HOLD = mix(at(1, 'barriga', { elR: -20 }), CUP);
  const UP = { shRp: -92, shRr: -4, elR: 52, shRy: 8, wrist: 52, grip: 1 }, CLINK = { shRp: -86, shRr: 2, elR: 46, shRy: 12, wrist: 50, grip: 1 };
  c('taverna-brinde', 3.4, U, [
    [0, T(mix(HOLD, { grip: 0.85, neck: 4, lean: 6 }))],
    [0.14, T(mix(UP, { talk: 0.7, neck: -8, lean: 10 }))],
    [0.26, T(mix(CLINK, { talk: 0.2, neck: -6, lean: 14 }))],
    [0.34, T(mix(UP, { talk: 0, neck: -6, lean: 9 }))],
    [0.48, T(mix(SIP1, { neck: -12, lean: 3 }))],
    [0.62, T(mix(SIP2, { neck: -22, lean: 0, tilt: -2 }))],
    [0.74, T(mix(SIP2, { neck: -18, lean: 1, wrist: 18 }))],
    [0.86, T(mix(HOLD, { neck: 2, lean: 6 }))],
    [1, T(mix(HOLD, { grip: 0.85, neck: 4, lean: 6 }))],
  ], { acts: ['brinde'], item: { hand: 'mao' }, noMirror: true, events: { contact: 0.26 } });

  // ------------------------------ the knucklebones (jogo-ossos) ------------------------------
  // the bones shaken in the cupped right hand over the board, thrown (the contact: they land), leaned over and looked at — the
  // count said —, swept up with both hands and back into the right one; the left forearm on the board the while
  const SHAKE = { shRp: -3, shRr: 15, elR: 127, shRy: 6, grip: 0.95 };
  c('jogo-ossos', 4.2, U, [
    [0, T(mix(SHAKE, { lean: 14, neck: 14 }))],
    [0.05, T(mix(SHAKE, { shRp: -9, lean: 14, neck: 14 }))],
    [0.1, T(mix(SHAKE, { shRp: 1, lean: 14, neck: 15 }))],
    [0.15, T(mix(SHAKE, { shRp: -9, lean: 15, neck: 15 }))],
    [0.22, T(mix(SHAKE, { shRp: -16, elR: 122, lean: 12, neck: 12 }))],
    // (the throw: the arm out and down, the hand opening over the board)
    [0.28, T({ shRp: -39, shRr: 20, elR: 85, shRy: 4, grip: 0, lean: 22, neck: 22 })],
    // (the bones looked at, the trunk over them, the count said)
    [0.36, T({ shRp: -14, shRr: 7, elR: 118, shRy: 0, grip: 0.1, lean: 26, neck: 28 })],
    [0.48, T({ shRp: -14, shRr: 7, elR: 116, shRy: 0, grip: 0.1, lean: 25, neck: 26, talk: 0.5 })],
    [0.56, T({ shRp: -16, shRr: 6, elR: 112, shRy: 0, grip: 0.1, lean: 22, neck: 22, talk: 0 })],
    // (swept up: the right hand along the board toward the left, the left cupped to take them)
    [0.64, { shRp: -15, shRr: 61, elR: 91, shRy: -4, grip: 0.4, shLp: -2, shLr: -23, elL: 122, shLy: -10, gripL: 0.5, lean: 24, neck: 24 }],
    [0.72, { shRp: -20, shRr: 36, elR: 94, shRy: 22, grip: 0.7, shLp: -2, shLr: -23, elL: 122, shLy: -10, gripL: 0.7, lean: 22, neck: 22 }],
    [0.82, { shRp: -8, shRr: 22, elR: 120, shRy: 14, grip: 0.9, shLp: -6, shLr: -18, elL: 118, shLy: -14, gripL: 0.6, lean: 16, neck: 16 }],
    [0.92, T(mix(SHAKE, { lean: 14, neck: 14 }))],
    [1, T(mix(SHAKE, { lean: 14, neck: 14 }))],
  ], { acts: ['jogo-ossos'], item: { hand: 'mao' }, events: { contact: 0.28 } });

  // ------------------------------ the music's compass: the dance, the claps, the song ------------------------------
  // (a loop of `beats` beats of the player's tune — the reader gives its time by the musician's own clock: the claps on the notes)
  // the dance on one's feet, by the stage: a step to each side on the beat, the knees giving, the hips and the shoulders after the
  // foot, the arms up in turn and the hands clapping on the off-beat — the feet free, the body danced in its place
  const STEPR = { shift: 0.05, sway: 0.1, pelR: 0.05, hipR: -4, knR: 14, anR: 6, hipL: -16, knL: 30, anL: 12, twist: 10, bob: -0.025 };
  const STEPL = { shift: -0.05, sway: -0.1, pelR: -0.05, hipL: -4, knL: 14, anL: 6, hipR: -16, knR: 30, anR: 12, twist: -10, bob: -0.025 };
  const RISE = { shift: 0, sway: 0, pelR: 0, hipL: -6, knL: 8, anL: 4, hipR: -6, knR: 8, anR: 4, twist: 0, bob: 0.02 };
  const ARMSR = { shRp: -150, shRr: -18, elR: 34, shRy: 10, grip: 0.3, shLp: -58, shLr: 36, elL: 44, shLy: -6, gripL: 0.3 };
  const ARMSL = { shLp: -150, shLr: 18, elL: 34, shLy: -10, gripL: 0.3, shRp: -58, shRr: -36, elR: 44, shRy: 6, grip: 0.3 };
  const CLAPHI = { shRp: -128, shRr: 22, elR: 40, shRy: 22, grip: 0.05, shLp: -128, shLr: -22, elL: 40, shLy: -22, gripL: 0.05 };
  c('danca', 2, 'full', [
    [0, mix(STEPR, ARMSR, { neck: -4, lookY: 8 })],
    [0.125, mix(RISE, CLAPHI, { neck: -8 })],
    [0.25, mix(STEPL, ARMSL, { neck: -4, lookY: -8 })],
    [0.375, mix(RISE, CLAPHI, { neck: -8 })],
    [0.5, mix(STEPR, ARMSR, { neck: -2, lookY: 10, twist: 14 })],
    [0.625, mix(RISE, CLAPHI, { neck: -6 })],
    [0.75, mix(STEPL, ARMSL, { neck: -2, lookY: -10, twist: -14 })],
    [0.875, mix(RISE, CLAPHI, { neck: -6 })],
    [1, mix(STEPR, ARMSR, { neck: -4, lookY: 8 })],
  ], { acts: ['danca'], base: 'idle', feet: 'free', beats: 4, in: 0.45, out: 0.45, events: { contact: 0.125 } });
  // the claps at a table, seated: the hands meeting before the chest on each beat, the head and the shoulders with it
  const CLAPIN = { shRp: -32, shRr: 3, elR: 99, shRy: 26, grip: 0.05, wrist: 0 }, CLAPOUT = { shRp: -27, shRr: -23, elR: 108, shRy: 22, grip: 0.05, wrist: 0 }; // (the hands well before the chest: clear of a toga's drape)
  c('palmas', 1, U, [
    [0, mix(CLAPIN, left(CLAPIN), { neck: 4, lean: 6, sway: 0.03 })],
    [0.25, mix(CLAPOUT, left(CLAPOUT), { neck: -2, lean: 5, sway: 0 })],
    [0.5, mix(CLAPIN, left(CLAPIN), { neck: 4, lean: 6, sway: -0.03 })],
    [0.75, mix(CLAPOUT, left(CLAPOUT), { neck: -2, lean: 5, sway: 0 })],
    [1, mix(CLAPIN, left(CLAPIN), { neck: 4, lean: 6, sway: 0.03 })],
  ], { acts: ['palmas'], base: 'sit', feet: 'free', beats: 2, events: { contact: 0 } });
  // the song sung along at the table: the mouth at the words (talk), the head up, the trunk swaying to the beat, a hand keeping it
  // on the board
  c('cantar-junto', 2, U, [
    [0, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.2, talk: 0.75, neck: -10, tilt: 4, twist: 5, lean: 2 })],
    [0.25, T({ shRp: -16, shRr: 2, elR: 84, talk: 0.6, neck: -14, tilt: 0, twist: 0, lean: 1 })],
    [0.5, T({ shRp: -13, shRr: 4, elR: 88, talk: 0.8, neck: -10, tilt: -4, twist: -5, lean: 2 })],
    [0.75, T({ shRp: -18, shRr: 0, elR: 80, talk: 0.65, neck: -16, tilt: 0, twist: 0, lean: 0 })],
    [1, T({ shRp: -13, shRr: 4, elR: 88, grip: 0.2, talk: 0.75, neck: -10, tilt: 4, twist: 5, lean: 2 })],
  ], { acts: ['cantar-junto'], base: 'sit', feet: 'free', beats: 4, events: { contact: 0 } });

  // ------------------------------ the nap at the table (cochilo) ------------------------------
  // the forearms folded on the board, the head down on them, the eyes shut, the back rising and falling slowly
  const FOLDR = { shRp: -5, shRr: 55, elR: 122, shRy: 50, grip: 0.2 }, NAP = mix(FOLDR, left(FOLDR), { lean: 44, neck: 46, tilt: 0, headR: 10 });
  c('cochilo', 5, U, loopOf(mix(NAP, { breath: 0 }), mix(NAP, { lean: 45.5, breath: 0.5, neck: 45 }), mix(NAP, { lean: 44.8, breath: 0.25 })),
    { acts: ['cochilo'], base: 'sit', feet: 'free', eyes: 'shut', in: 0.8, out: 0.6 });
  // (and for who wears something over the arms — a cape, a toga, a blouse, a long skirt: L.armOut —, that the folded arms would go
  // through: the head bowed over the right forearm along the board, the left forearm on the board, the trunk less bowed — on the right
  // arm for all: the left one across would go through the toga's drape over that shoulder)
  const NAPB = { shRp: -9, shRr: -12, elR: 118, shRy: 50, grip: 0.2, shLp: -13, shLr: -1, elL: 112, shLy: 4, gripL: 0.2, lean: 24, neck: 58, headR: 18 };
  c('cochilo-b', 5, U, loopOf(mix(NAPB, {}), mix(NAPB, { lean: 25, neck: 57 }), mix(NAPB, { lean: 24.5 })), { base: 'sit', feet: 'free', eyes: 'shut', in: 0.8, out: 0.6, noMirror: true });

  // ------------------------------ the keeper's work at the tables ------------------------------
  // the table wiped: bent over it, the cloth in the right hand in rounds on the board, the left on its edge (the cloth of the
  // inventory — linen or wool where the people weave, else a wisp of straw: G.Inv.held)
  const WIPEL = { shLp: -25, shLr: 1, elL: 44, shLy: 2, gripL: 0.6 };
  c('limpar-mesa', 2.4, U, loopOf(
    mix(WIPEL, { shRp: -46, shRr: 3, elR: 21, shRy: 8, grip: 0.8, lean: 30, neck: 18 }),
    mix(WIPEL, { shRp: -60, shRr: 2, elR: 6, shRy: 18, grip: 0.8, lean: 31, neck: 20 }),
    mix(WIPEL, { shRp: -54, shRr: -24, elR: 8, shRy: 26, grip: 0.8, lean: 30, neck: 20 }),
    mix(WIPEL, { shRp: -30, shRr: -10, elR: 43, shRy: 14, grip: 0.8, lean: 32, neck: 18 })),
    { acts: ['limpar-mesa'], item: { hand: 'mao' } });
  // the cups gathered: one taken from the board, brought to the stack in the crook of the left arm, the next — the stack of the
  // inventory's cups (L.cups: G.Inv.roundOf), never one more than the world has
  const CROOK = { shLp: -6, shLr: 0, elL: 92, shLy: -30, gripL: 0.9, wristL: -24 }; // (the forearm a hand off the belly: clear of a toga)
  c('recolher-canecas', 3, U, [
    [0, mix(CROOK, { shRp: -40, shRr: 2, elR: 36, shRy: 6, grip: 0.2, lean: 28, neck: 22 })],
    [0.2, mix(CROOK, { shRp: -40, shRr: 2, elR: 38, shRy: 6, grip: 1, lean: 28, neck: 22 })],
    [0.45, mix(CROOK, { shRp: -1, shRr: -2, elR: 100, shRy: 30, grip: 1, lean: 8, neck: 10 })],
    [0.6, mix(CROOK, { shRp: -2, shRr: 0, elR: 101, shRy: 30, grip: 0.3, lean: 8, neck: 10 })],
    [0.8, mix(CROOK, { shRp: -30, shRr: 2, elR: 50, shRy: 10, grip: 0.2, lean: 22, neck: 18, lookY: -10 })],
    [1, mix(CROOK, { shRp: -40, shRr: 2, elR: 36, shRy: 6, grip: 0.2, lean: 28, neck: 22 })],
  ], { acts: ['recolher-canecas'], item: { hand: 'mao' }, noMirror: true, events: { contact: 0.2 } });
  // the closing: «está fechando, todos para casa!» — the left hand at the mouth to call, the right arm sweeping toward the door
  c('fechar', 2.6, U, [
    [0, mix(at(-1, 'boca', { elL: -10 }), { shRp: -70, shRr: -40, elR: 34, shRy: -10, grip: 0.1, talk: 0.8, neck: -6, lookY: 14 })],
    [0.3, mix(at(-1, 'boca', { elL: -10 }), { shRp: -74, shRr: -12, elR: 26, shRy: 4, grip: 0.1, talk: 0.9, neck: -8, lookY: 0 })],
    [0.55, mix({ shLp: -14, shLr: 12, elL: 24 }, { shRp: -84, shRr: -50, elR: 20, shRy: -14, grip: 0.05, talk: 0.4, neck: -4, lookY: 18 })],
    [0.8, mix({ shLp: -14, shLr: 12, elL: 24 }, { shRp: -66, shRr: -20, elR: 40, grip: 0.1, talk: 0.7, neck: -6, lookY: 6 })],
    [1, mix(at(-1, 'boca', { elL: -10 }), { shRp: -70, shRr: -40, elR: 34, shRy: -10, grip: 0.1, talk: 0.8, neck: -6, lookY: 14 })],
  ], { acts: ['fechar'] });
  // the brawler led out (expulsar, an act of two — Anim.DUO): the keeper's right hand round the other's arm above the elbow, the left
  // on their back, the trunk pressing on; the one led out leaning back against it, the free arm thrown out, the head turned back,
  // shouting — on the way, over the stride (vida3d.js overOf), and at the door
  c('expulsar-a', 1.6, U, loopOf(
    { shRp: -76, shRr: -6, elR: 16, grip: 1, shLp: -78, shLr: 6, elL: 12, gripL: 1, lean: 14, neck: -4, talk: 0.5 },
    { shRp: -78, shRr: -6, elR: 10, grip: 1, shLp: -80, shLr: 6, elL: 8, gripL: 1, lean: 16, neck: -6, talk: 0.15 }),
    { acts: ['expulsar'] });
  c('expulsar-b', 1.4, U, loopOf(
    { shRp: -12, shRr: -10, elR: 30, grip: 0.4, shLp: -70, shLr: 40, elL: 36, gripL: 1, lean: 0, neck: -10, lookY: 50, talk: 0.8, twist: 5 },
    { shRp: -18, shRr: -6, elR: 36, grip: 0.4, shLp: -96, shLr: 30, elL: 24, gripL: 1, lean: 0, neck: -14, lookY: 40, talk: 0.5, twist: 4 }));

  // ------------------------------ the coin to the musician (gorjeta) ------------------------------
  // the hand to the purse at the belt, the coin taken, raised, and thrown with a flick toward the stage — the eyes after it
  c('gorjeta', 2.4, U, [
    [0, mix(at(1, 'cintura', { elR: -6 }), { grip: 0.5, neck: 8 })],
    [0.18, mix(at(1, 'cintura', { elR: 4 }), { grip: 1, neck: 10 })],
    [0.36, { shRp: -76, shRr: -10, elR: 96, shRy: 10, grip: 1, neck: -2, lookY: 6 }],
    [0.46, { shRp: -104, shRr: -6, elR: 24, shRy: 14, grip: 0, neck: -8, lookY: 6 }],
    [0.6, { shRp: -96, shRr: -6, elR: 28, grip: 0, neck: -8, lookY: 4, talk: 0.3 }],
    [0.82, { shRp: -40, shRr: -8, elR: 50, grip: 0.1, neck: 0, talk: 0 }],
    [1, mix(at(1, 'cintura', { elR: -6 }), { grip: 0.5, neck: 8 })],
  ], { acts: ['gorjeta'], events: { contact: 0.46 } });

  // ------------------------------ who drank too much (cambalear) ------------------------------
  // over the stride: the arms out from the sides for the balance, a hand reaching for what is not there, the head heavy and rolling;
  // the weave of the hips and the stagger of the legs are the stride's own (Anim.stagger, by G.Atmos.drunk)
  c('cambalear', 2.2, U, loopOf(
    { shRp: -10, shRr: -34, elR: 28, grip: 0.2, shLp: 6, shLr: 24, elL: 20, gripL: 0.2, neck: 14, headR: 12, tilt: 4 },
    { shRp: -30, shRr: -18, elR: 40, grip: 0.4, shLp: -4, shLr: 36, elL: 26, gripL: 0.2, neck: 18, headR: -6, tilt: -3 },
    { shRp: 2, shRr: -26, elR: 22, grip: 0.2, shLp: -16, shLr: 28, elL: 34, gripL: 0.4, neck: 12, headR: -14, tilt: -5 }),
    { acts: ['cambalear'] });

  // ------------------------------ the keeper with a plate ------------------------------
  // carried level by the lug of its rim before the chest, the forearm under it (the plate of G.Inv.held, the meal the world served
  // on it), the other arm with the stride; set before the seated one, the trunk bent, the left hand saying «aqui»; and held so while
  // the left one calls the one it is for to their seat — «sente-se, o seu pedido chegou»
  const PLATEUP = { shRp: 7, shRr: -3, elR: 87, shRy: 10, grip: 1, wrist: -6 };
  c('levar-prato', 2, ['shRp', 'shRr', 'shRy', 'elR', 'grip', 'wrist', 'neck'], loopOf(mix(PLATEUP, { neck: 4 }), mix(PLATEUP, { shRp: 4, neck: 5 })), { item: { hand: 'mao' }, noMirror: true });
  c('servir-prato', 2.2, U, [
    [0, mix(PLATEUP, { neck: 6, lean: 4 })],
    [0.35, mix({ shRp: -48, shRr: 1, elR: 14, shRy: 8, grip: 1, wrist: -4 }, { shLp: -30, shLr: 18, elL: 50, gripL: 0.05 }, { lean: 24, neck: 16, talk: 0.4 })],
    [0.6, mix({ shRp: -46, shRr: 1, elR: 10, shRy: 8, grip: 1, wrist: -4 }, { shLp: -36, shLr: 24, elL: 40, gripL: 0.05 }, { lean: 26, neck: 18, talk: 0.2 })],
    [1, mix(PLATEUP, { neck: 6, lean: 4 })],
  ], { item: { hand: 'mao' }, noMirror: true, events: { contact: 0.6 } });
  c('chamar-pedido', 2.2, U, loopOf(
    mix(PLATEUP, { shLp: -70, shLr: 26, elL: 64, shLy: -20, gripL: 0.2, talk: 0.8, neck: -4, lookY: -8 }),
    mix(PLATEUP, { shLp: -62, shLr: 18, elL: 96, shLy: -26, gripL: 0.6, talk: 0.5, neck: -2, lookY: -10 }),
    mix(PLATEUP, { shLp: -70, shLr: 26, elL: 64, shLy: -20, gripL: 0.2, talk: 0.7, neck: -4, lookY: -6 }),
    mix(PLATEUP, { shLp: -62, shLr: 18, elL: 96, shLy: -26, gripL: 0.6, talk: 0.3, neck: -2, lookY: -8 })),
    { acts: ['chamar-pedido'], item: { hand: 'mao' }, noMirror: true });
})(window.G);
