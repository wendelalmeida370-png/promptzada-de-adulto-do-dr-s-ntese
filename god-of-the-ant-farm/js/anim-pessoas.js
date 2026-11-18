'use strict';
// ============================================================
//  The acting of the people (22c, SOCIEDADE.md §3.9, D-590): the
//  postures of the old table (standing with its breath and its
//  weight shifts, seated, kneeling, lying, swimming…), the acts of
//  the world as postures, the drink in the body, the weight of
//  what is held — cut from js/people3d.js without a change. Pure
//  (rule 113): numbers of the frame in, a pose out; nothing here
//  reads the world or draws from a chance. Who reads the world for
//  it is the reader, js/vida3d.js.
// ============================================================
(function (G) {
  const Anim = G.Anim3D = G.Anim3D || {};
  const TAU = Math.PI * 2;
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
    walk: (t, sp) => Anim.gaitPose(t, sp, false),
    // (a run: a flight between the steps — highest in the air, lowest over the bent standing leg — the heel kicked up
    // behind, the trunk leaning in, the elbows bent and pumping)
    run: (t, sp) => Anim.gaitPose(t, sp, true),
    sneak: (t, sp) => { const ph = t, A = 0.35; return { crouch: 0.2, lean: 0.45, hipL: Math.sin(ph) * A - 0.3, hipR: -Math.sin(ph) * A - 0.3, knL: 0.7 + Math.max(0, -Math.cos(ph)) * 0.5, knR: 0.7 + Math.max(0, Math.cos(ph)) * 0.5, shLp: -0.5, shRp: -0.4, elL: 0.9, elR: 0.9 }; },
    jump: () => ({ hipL: -0.9, hipR: -0.3, knL: 1.4, knR: 0.6, shLp: -2.4, shRp: -2.2, shLr: 0.3, shRr: -0.3, elL: 0.3, elR: 0.3, lean: -0.05 }),
    fall: (t) => ({ hipL: -0.25, hipR: 0.15, knL: 0.5, knR: 0.35, shLp: -0.4, shRp: -0.4, shLr: 1.1 + Math.sin(t * 9) * 0.1, shRr: -1.1 - Math.sin(t * 9) * 0.1, elL: 0.4, elR: 0.4, neck: -0.15 }),
    land: () => ({ crouch: 0.28, lean: 0.35, hipL: -0.8, hipR: -0.8, knL: 1.5, knR: 1.5, shLp: -0.6, shRp: -0.6, elL: 0.6, elR: 0.6 }),
    // (a swing: the tool raised over the head, the wrist cocked back; brought down, the wrist turning it forward to strike)
    swing: (t) => { const k = (Math.sin(t * 5.5) + 1) / 2; return { shRp: -2.7 + k * 2.2, shLp: -2.4 + k * 2, elR: 0.3, elL: 0.4, lean: k * 0.35, hipL: -0.15, hipR: 0.2, knL: 0.2, knR: 0.1, tool: 1, wrist: -0.5 + 2.0 * Math.pow(k, 1.5), grip: 1 }; },
    low: (t) => ({ crouch: 0.32, lean: 0.95, hipL: -1.0, hipR: -0.8, knL: 1.3, knR: 1.1, shLp: -1.0 + Math.sin(t * 3) * 0.25, shRp: -1.1 - Math.sin(t * 3) * 0.25, elL: 0.3, elR: 0.3, neck: 0.3 }),
    carry: (t) => ({ ...ST.idle(t), shLp: -0.95, shRp: -0.95, shLr: 0.25, shRr: -0.25, elL: 0.95, elR: 0.95 }),
    carryWalk: (t, sp) => ({ ...ST.walk(t, sp), shLp: -0.95, shRp: -0.95, shLr: 0.25, shRr: -0.25, elL: 0.95, elR: 0.95 }),
    pray: (t) => ({ crouch: 0.45, hipL: -0.1, hipR: -0.1, knL: 1.65, knR: 1.65, shLp: -2.6 + Math.sin(t * 1.2) * 0.15, shRp: -2.6 + Math.sin(t * 1.2) * 0.15, shLr: 0.3, shRr: -0.3, elL: 0.2, elR: 0.2, neck: -0.3, lean: -0.05 }),
    sit: (t) => ({ crouch: 0.46, hipL: -1.5, hipR: -1.5, knL: 1.5, knR: 1.5, shLp: -0.5, shRp: -0.5 + Math.sin(t * 2) * 0.1, elL: 0.8, elR: 0.9, lean: 0.1 }),
    // (at the table: seated, the right hand from the bowl to the mouth and back, a pause between mouthfuls)
    eat: (t) => { const k = Math.pow(Math.max(0, Math.sin(t * 1.6)), 2); return { ...ST.sit(t), shRp: -0.55 - k * 0.7, shRr: -0.15, elR: 1.0 + k * 1.1, shLp: -0.45, elL: 0.95, neck: 0.12 - k * 0.1, lean: 0.18 }; },
    // (at the fire: down on the heels, leaning in, the right hand stirring the pot round, the left on the knee)
    cook: (t) => ({ crouch: 0.5, lean: 0.55, hipL: -1.35, hipR: -1.25, knL: 1.85, knR: 1.75, shRp: -1.05 + Math.sin(t * 2.2) * 0.18, shRr: -0.2 + Math.cos(t * 2.2) * 0.15, elR: 0.7, shLp: -0.6, shLr: 0.2, elL: 1.1, neck: 0.35 }),
    // (rocking a child: seated, the arms cradling it before the chest, the trunk swaying slowly from side to side)
    rock: (t) => ({ ...ST.sit(t), shLp: -0.75, shRp: -0.75, shLr: -0.35, shRr: 0.35, elL: 1.5, elR: 1.5, twist: Math.sin(t * 1.3) * 0.1, neck: 0.3 }),
    // (sick in bed, awake: lying, a hand on the chest, the head turning a little now and then)
    sick: (t) => ({ ...ST.sleep(t), shRp: -0.9, shRr: -0.2, elR: 1.9, neck: Math.sin(t * 0.4) * 0.12 }),
    // (the same sitting on the ground, where there is no seat: eating with the bowl in the lap, rocking the child)
    eatg: (t) => { const k = Math.pow(Math.max(0, Math.sin(t * 1.6)), 2); return { ...ST.rest(t), shRp: -0.45 - k * 0.75, shRr: -0.15, elR: 1.1 + k * 1.05, shLp: -0.5, elL: 1.2, neck: 0.18 - k * 0.12 }; },
    rockg: (t) => ({ ...ST.rest(t), shLp: -1.25, shRp: -1.25, shLr: -0.25, shRr: 0.25, elL: 1.85, elR: 1.85, twist: Math.sin(t * 1.3) * 0.1, neck: 0.3 }), // (the child at the chest, over the knees)
    talk: (t) => ({ ...ST.idle(t), shRp: -0.5 - Math.max(0, Math.sin(t * 2.6)) * 0.6, shRr: -0.25, elR: 0.9 + Math.sin(t * 3.3) * 0.3, twist: Math.sin(t * 1.1) * 0.08, neck: Math.sin(t * 2.2) * 0.08, talk: Math.max(0, Math.sin(t * 9.0) * Math.sin(t * 2.3 + 1)) * 0.8 }),
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
    // (bound: the hands joined before the belly, as led — the bonds the inventory's, the left hand on their other ring: 22c, D-612)
    bound: () => ({ shLp: -0.38, shRp: -0.38, shLr: -0.1, shRr: 0.1, elL: 1.12, elR: 1.12, neck: 0.25, grip: 0.6, gripL: 0.6, offW: 1 }),
    interact: (t) => ({ ...ST.idle(t), shRp: -1.35, shRr: -0.1, elR: 0.25, lean: 0.12 }),
    // (playing the lute — the tavern's song, G.Act.ANIM.tocar, as the god's view draws it: the left hand up the neck, the right
    // strumming at the belly, the head bent to the strings; it danced before — L-432)
    strum: (t) => ({ ...ST.idle(t), shLp: -0.9, shLr: 0.1, elL: 1.3, shRp: -0.5, shRr: -0.15, elR: 1.35 + Math.sin(t * 9) * 0.15, neck: 0.15, lean: 0.04 }),
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
    // (thrown down by a blow, D-333: on the back, the head up off the ground, the arms before the face, the legs drawn up and
    // kicking at what is over it; getting up: up on one knee, a hand pushing off the ground; and the last fall — the knees give)
    knocked: (t) => { const k = Math.sin(t * 5.2), q = Math.sin(t * 3.1 + 1); return { lie: 1, neck: 0.5 + q * 0.06, hipL: -1.0 + k * 0.25, hipR: -0.55 - k * 0.2, knL: 1.35 - k * 0.3, knR: 0.95 + k * 0.25, shLp: -2.15 + q * 0.12, shRp: -1.95 - q * 0.1, shLr: 0.45, shRr: -0.45, elL: 1.6, elR: 1.5, twist: q * 0.08 }; },
    rise: () => ({ crouch: 0.55, lean: 0.55, hipL: -1.45, hipR: 0.15, knL: 1.65, knR: 1.85, shLp: -0.7, shRp: 0.25, shLr: 0.15, shRr: -0.3, elL: 0.45, elR: 0.25, neck: 0.25 }),
    crumple: () => ({ crouch: 0.62, lean: 0.55, hipL: -0.95, hipR: -0.7, knL: 1.85, knR: 1.6, shLp: -0.35, shRp: -0.15, shLr: 0.3, shRr: -0.25, elL: 0.7, elR: 0.5, neck: 0.55 }),
  };
  // what someone of the world is doing, as an animation (their act, their move, their burden)
  const ACT = Anim.ACT = {
    chop: 'swing', mine: 'swing', hammer: 'swing', build: 'swing', forge: 'swing', dig: 'swing', stab: 'fight', beat: 'swing', fight: 'fight', brandish: 'fight', cut: 'swing', butcher: 'swing', skin: 'low', mend: 'low', craft: 'low', shear: 'low', drill: 'talk',
    pick: 'low', gather: 'low', plant: 'low', harvest: 'low', rake: 'swing', fill: 'low', feed: 'low', milk: 'low', catch: 'low', salt: 'low', sweep: 'low', weave: 'sit', pottery: 'sit', fish: 'interact', reel: 'interact',
    haul: 'carry', lift: 'carry', drag: 'carry', hold: 'carry', pray: 'pray', kneel: 'pray', swear: 'pray', beg: 'pray', weepk: 'pray',
    sit: 'sit', sittalk: 'sit', story: 'sit', read: 'sit', write: 'sit', eat: 'eat', drink: 'talk', listen: 'talk', cook: 'cook', rock: 'rock',
    talk: 'talk', chat: 'talk', call: 'talk', shout: 'talk', wave: 'talk', point: 'talk', question: 'talk', sell: 'talk', buy: 'talk', serve: 'talk',
    dance: 'dance', joy: 'dance', play: 'strum', mourn: 'mourn', weep: 'mourn', sad: 'mourn', cower: 'mourn', sick: 'mourn',
    hug: 'hug', embrace: 'hug', sleep: 'sleep', zzz: 'sleep', throw: 'throw', swim: 'swim', dive: 'swim', bound: 'bound', sneak: 'sneak', run: 'run', climb: 'interact', knock: 'interact', look: 'idle',
    // (the gestures of the activities, G.Act.ANIM, as the body makes them — Interact.GEST —: paying and taking the coins, the
    // hand out; haggling, talking; looking the goods over and counting the crates at the door, the hand to them; waiting,
    // standing; the second pair of hands under a heavy crate, a carrier's arms — L-205, L-210; the clothes off and on at the
    // pegs of the baths, the hand to them — L-429)
    pay: 'interact', haggle: 'talk', examine: 'interact', count: 'interact', wait: 'idle', carry2: 'carry', undress: 'interact',
    // (22c: the smoke at the hives and the fish racks, tended down on the heels as the fire of the pot is — D-602)
    smoke: 'cook',
  };
  // (the acts that carry what the world has in someone else's hands: walking, a carrier's walk — the helper of a pair)
  const CARRY_ACTS = Anim.CARRY_ACTS = new Set(['carry2']);
  // blending: every joint eases toward the wanted pose (a quick spring: no snapping, no lag you can see)
  Anim.blend = function (pose, want, dt, rate) {
    const k = 1 - Math.exp(-(rate || 12) * dt);
    for (const j in want) { if (j === 'tool') { pose.tool = want.tool; continue; } pose[j] += (want[j] - pose[j]) * k; }
    for (const j in pose) if (!(j in want) && j !== 'tool' && j !== 'lookY' && j !== 'blink') pose[j] += ((j === 'elL' || j === 'elR' ? 0.15 : j === 'knL' || j === 'knR' ? 0.05 : 0) - pose[j]) * k; // (the look and the blink have their own clocks)
    if (!('tool' in want)) pose.tool = 0;
  };
  // the pose of a state by its name, at its clock t and speed sp: a posture of the table, or a clip on its base (anim-clips.js: the
  // clip at the time t, in seconds of its own pace)
  Anim.pose = (state, t, sp) => {
    const c = Anim.CLIPS && Anim.CLIPS[state]; if (!c) return (ST[state] || ST.idle)(t, sp || 0);
    const out = Object.assign(Anim.POSE0(), (ST[c.base] || ST.idle)(t, sp || 0)); Anim.playClip(out, c, (t || 0) / c.dur, 1); out.stL = out.stR = 1; return out;
  };
  // the drink in the body (k: how drunk, 0 to 1 — Atmos.drunk): standing or walking, the trunk leans from side to side and the
  // hips go after it, the knee gives on the side one leans to, the head hangs and rolls, the arms come out for a balance that
  // is always late, one bows forward and catches oneself. Only the pose: the feet stay where the world has them — the same
  // weave the god's view gives its drunks (Court.sway). t: the view's own clock; id: each one on their own beat
  const WEAVE = new Set(['idle', 'walk', 'carryWalk', 'carry', 'talk', 'turn', 'wave', 'interact']);
  Anim.stagger = function (want, t, id, k, st) {
    if (!(k > 0) || !WEAVE.has(st)) return want;
    const a = Math.sin(t * 2.3 + id), b = Math.sin(t * 1.3 + id * 1.7), c = Math.sin(t * 0.7 + id * 0.3);
    const add = (j, x) => { want[j] = (want[j] || 0) + x; };
    add('sway', a * 0.2 * k); add('shift', a * 0.07 * k); add('pelR', -a * 0.06 * k);
    add('lean', (0.07 + b * 0.09) * k); add('twist', c * 0.25 * k); add('neck', (0.18 + b * 0.12) * k);
    add('shLr', (0.12 + a * 0.1) * k); add('shRr', (-0.12 + a * 0.1) * k); add('elL', 0.2 * k); add('elR', 0.2 * k);
    add('knL', Math.max(0, a) * 0.18 * k); add('knR', Math.max(0, -a) * 0.18 * k);
    return want;
  };
  // (the way a drunk faces as they walk: weaving a little to each side of the way they go — drawn, never walked)
  Anim.weave = (t, id, k) => (k > 0 ? Math.sin(t * 0.9 + id * 0.7) * 0.24 * k : 0);
  // the state of a place inside a building (Interiors.places: its st — a state of the 3D, or an act of the world's people, as
  // the household's rule gives it): the state itself, else the act's, else standing
  Anim.resolve = st => (st && (ST[st] || (Anim.CLIPS && Anim.CLIPS[st])) ? st : st && Anim.CLIP_OF && Anim.CLIPS && Anim.CLIPS[Anim.CLIP_OF[st]] ? Anim.CLIP_OF[st] : st && ACT[st] && ACT[st] !== 'run' ? ACT[st] : 'idle');
  // the weight of what is held, in the body — by the load's weight against the body's strength, not by the good's name: under a
  // load before the chest the trunk leans back over the hips and the knees give; carried low and heavy, more; under a load on
  // the back the trunk bends forward and the strap pulls the head back; a bucket at the side tips the trunk away from it and
  // stills that arm; a jar on the head keeps the head and the trunk upright; on the shoulder the trunk leans a little from it.
  // The hand on the load reaches it in the rig (holdW: how much); the free hand goes on with the step. And to reach a point low
  // before the feet — a crate on the ground, the shelf — the body bends at the knees and the hips as deep as the point is low
  // (want: the pose the state wants, changed here before it is blended; t, sp: the state's clock and speed)
  // (how deep a body goes for a point hy metres over its feet: the squat, the bow; a heavy thing is lifted with the legs, a light
  // one with a bow — the same numbers for the pose and for the path of the thing held)
  function reachDepth(H, L, hy, w) { const q = G.clamp((1.05 - hy) / 0.85, 0, 1) * G.smooth(0, 1, w); const hv = H ? G.clamp(H.kg / (28 * (L.str || 1)), 0, 1) : 0; return { q, sq: q * (0.75 + 0.25 * hv), bw: q * (1 - 0.35 * hv) }; }
  Anim.reachDepth = reachDepth;
  Anim.hold = function (want, L, st, t, sp) {
    const walk = st === 'walk' || st === 'carryWalk' || st === 'run' || st === 'sneak' || st === 'wade';
    // (a crate between two, at the hips: both hands of each on their end of it — the rig's — and the step a little heavier)
    if (L.pair) { want.holdW = 1; if (walk) want.bob = (want.bob || 0) * 0.75; return want; }
    const H = L.held, r = L.reach && L.reach.w > 0.001 ? L.reach : null; if (!H && !r) return want;
    if (H && H.grip !== 'chao') {
      const k = G.clamp(H.kg / (28 * (L.str || 1)), 0, 1.6), g = H.grip; want.holdW = 1;
      // (the free arm: the step's own swing, not the 'carry' state's arms held out)
      if (st === 'carry' || st === 'carryWalk') { const base = (st === 'carryWalk' ? ST.walk : ST.idle)(t, sp || 0); for (const q of H.hands.includes('L') ? [] : ['shLp', 'shLr', 'elL']) want[q] = base[q]; for (const q of H.hands.includes('R') ? [] : ['shRp', 'shRr', 'elR']) want[q] = base[q]; }
      const add = (j, v) => { want[j] = (want[j] || 0) + v; };
      if (g === 'peito' || g === 'abraco' || g === 'bracos') { add('lean', -0.06 - 0.11 * k); add('knL', 0.07 * k); add('knR', 0.07 * k); add('neck', -0.05); add('crouch', 0.015 * k); }
      else if (g === 'baixo') { add('lean', -0.1 - 0.14 * k); add('knL', 0.14 * k); add('knR', 0.14 * k); add('crouch', 0.04 * k); }
      else if (g === 'costas') { add('lean', 0.16 + 0.2 * k); add('neck', -0.12); add('knL', 0.1 * k); add('knR', 0.1 * k); }
      else if (g === 'ombro') { add('sway', -0.05 * k); add('lean', 0.02 + 0.03 * k); add('knL', 0.04 * k); add('knR', 0.04 * k); }
      else if (g === 'cabeca') { want.lean = (want.lean || 0) * 0.3; want.neck = 0; want.twist = (want.twist || 0) * 0.4; want.lookY = 0; }
      else if (g === 'lado') { want.shRp = 0.04 + (walk ? Math.sin((t || 0)) * 0.03 : 0); want.shRr = -0.2 - 0.07 * k; want.elR = 0.1; add('sway', -0.1 * k); }
      if (walk) want.bob = (want.bob || 0) * (1 - 0.32 * Math.min(1, k));
    }
    if (r) {
      // (how low the point is under the hips of a standing body: a squat and a bow as deep as it needs)
      const hy = r.Y - (L.ground !== undefined ? L.ground : r.Y - 1); const { q, sq, bw } = reachDepth(H, L, hy, r.w);
      const add = (j, v) => { want[j] = (want[j] || 0) + v; };
      add('crouch', 0.72 * sq); add('lean', 1.05 * bw + (want.lean < 0 ? -want.lean * q : 0)); add('hipL', -1.3 * sq); add('hipR', -1.2 * sq); add('knL', 1.85 * sq); add('knR', 1.7 * sq); add('neck', 0.3 * q);
      want.bob = (want.bob || 0) * (1 - q);
    }
    return want;
  };
  // the gait's rate: radians of its phase per metre walked — the cadence of the speed (G.Gait) over the speed: the standing foot
  // keeps still on the ground at any speed because the stride is what that speed and that cadence leave (sneak: its own)
  const GAIT_OF = { walk: 0, carryWalk: 0, wade: 0, run: 1 };
  Anim.rate = function (st, sp, s) { const w = GAIT_OF[st]; if (w === undefined || !G.Gait) return 2.6; const v = Math.max(0.3, sp || 0); return TAU * G.Gait.freq(v, s || 1, w) / v; };
  Anim.ST = ST;
  // the mirror of a clip's definition (22c, D-596): the same gesture on the other side — the left-handed one's —: each joint of one
  // side keyed on the other, the turns and the rolls the other way, the stance's feet swapped. A twin registered beside a clip
  // (`id~m`) is the clip of the left-handed; the animator plays it for them (I.lefty)
  const SWAP = { shLp: 'shRp', shRp: 'shLp', elL: 'elR', elR: 'elL', grip: 'gripL', gripL: 'grip', wrist: 'wristL', wristL: 'wrist', hipL: 'hipR', hipR: 'hipL', knL: 'knR', knR: 'knL', anL: 'anR', anR: 'anL' };
  const SWAPN = { shLr: 'shRr', shRr: 'shLr', shLy: 'shRy', shRy: 'shLy', adL: 'adR', adR: 'adL', hyL: 'hyR', hyR: 'hyL' };
  const NEG = new Set(['twist', 'sway', 'tilt', 'headR', 'lookY', 'gazeX', 'pelY', 'pelR', 'shift']);
  const MASKM = { armR: 'armL', armL: 'armR' };
  Anim.mirrorJoint = j => SWAP[j] || SWAPN[j] || j;
  Anim.mirrorDef = function (def) {
    const keys = {};
    for (const j in def.keys) { const k = def.keys[j], to = SWAP[j] || SWAPN[j] || j, neg = !!SWAPN[j] || NEG.has(j); keys[to] = neg ? k.map(p => [p[0], -p[1]]) : k.map(p => [p[0], p[1]]); }
    const out = Object.assign({}, def, { keys, acts: null, takes: null });
    if (Array.isArray(def.mask)) out.mask = def.mask.map(j => SWAP[j] || SWAPN[j] || j); else if (MASKM[def.mask]) out.mask = MASKM[def.mask];
    if (def.stance) out.stance = [def.stance[0], def.stance[2], def.stance[1]];
    return out;
  };
  // the points of the body a hand reaches (22c, D-597): the right arm's angles — the shoulder's pitch, roll and yaw, the elbow —
  // that put its palm there, found on the rig itself (a search over the angles, the palm within 2 cm of the point; the left arm the
  // mirror: the roll and the yaw the other way); the hands joined, on the waist and behind the back over the belt, where the skirts and the
  // capes leave them. Radians: [shRp, shRr, elR, shRy]
  Anim.REACH = { peito: [0.40, 0.20, 2.30, 0.80], peitoAlto: [0.30, -0.40, 2.40, 0.80], abraco: [-0.10, -0.10, 1.90, 1.40], barriga: [0.30, -0.20, 1.70, 1.00], juntas: [0.40, 0.50, 1.50, 0.20],
    costas: [0.70, 0.80, 1.90, 1.60], ladoBarriga: [0.70, -0.60, 1.70, 1.40], rosto: [-0.80, 0.00, 2.30, 1.00], testa: [-1.10, 0.60, 2.10, 0.80], nuca: [-1.10, 0.80, 2.10, 1.60], cabeca: [-1.70, 0.20, 1.70, 1.40], cintura: [0.70, 0.00, 1.70, 0.20],
    boca: [-0.60, 0.80, 2.30, 0.80], olhos: [-0.90, 0.70, 2.20, 0.80], alto: [-2.90, 0.20, 0.40, -1.60], ombro: [0.10, 1.40, 2.00, 1.00] };
  // (an arm eased toward a point of the body by w, 0..1: side 1 the right, −1 the left)
  Anim.reachArm = function (out, side, key, w) {
    if (!(w > 0)) return out; const q = Anim.REACH[key]; if (!q) return out; const k = w > 1 ? 1 : w; const R = side > 0;
    const set = (j, x) => { out[j] = (out[j] || 0) + (x - (out[j] || 0)) * k; };
    set(R ? 'shRp' : 'shLp', q[0]); set(R ? 'shRr' : 'shLr', R ? q[1] : -q[1]); set(R ? 'elR' : 'elL', q[2]); set(R ? 'shRy' : 'shLy', R ? q[3] : -q[3]);
    return out;
  };
  // (every state the drawing knows: the postures first, as they were, and the clips after them — anim-clips.js adds its own)
  { const STATES = Anim.STATES || (Anim.STATES = []); const rest = STATES.filter(k => !(k in ST)); STATES.length = 0; STATES.push(...Object.keys(ST), ...rest); }
})(window.G);
