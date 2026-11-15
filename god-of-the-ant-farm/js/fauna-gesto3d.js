'use strict';
// ============================================================
//  FaunaGesto: the gesture on the body (D-280). What a beast does
//  now — the world's word for it (G.Gestos: a.gest, a.gestT,
//  a.gestD, a.gestO, a.gestV), the old states that still speak
//  (the stalk, the kill eaten, the death roll, the coils), its
//  mind (fear, anger, the breath it has left), its wounds, its
//  death — posed on the one skeleton of G.FaunaAnim as layers:
//  the body (lowered, on its chest or its side, reared, the rump
//  up, pitched, rolled, bent, shifted), the legs (folded under,
//  kicking, striking, pawing, thrashing, limp), the neck and the
//  head (down, up, forward, turned, aimed at a point of another
//  beast — its throat, its nape, its rump, a carcass), the mouth,
//  the ears, the tail, the trunk, the wings, the coils. Each
//  gesture is a recipe that adds to the layers with a weight —
//  eased in and out on the view's own clock, so two gestures
//  cross-fade and a gesture rides on the gait —; the solvers of
//  each family turn the layers into the bones' turns. Two bodies
//  meet: the holder's mouth reaches the point of the held one,
//  the held one reads its holder. Only seen: reads the world and
//  the view's memory of each beast (the bvis of People3D), writes
//  nothing of the world, draws from no chance (G.hash, the clock).
// ============================================================
(function (G) {
  const FA = G.FaunaAnim; if (!FA || !FA.K) return;
  const FG = FA.Gest = {};
  const K = FA.K, E = K.E, OFF = K.OFF, SC = K.SC, B = K.B, NB = K.NB, R = K.R, LEGS = K.LEGS, P0w = K.P0w;
  const TAU = Math.PI * 2, clamp = K.clamp, rz = K.rz, ry = K.ry;
  const sst = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const ramp = (u, a, b) => sst((u - a) / (b - a)); // (0 before a, 1 after b, smooth between)
  const bell = (u, a, m, b) => (u < m ? ramp(u, a, m) : 1 - ramp(u, m, b));
  const osc = (t, hz, p) => Math.sin(t * hz * TAU + (p || 0));
  const hz = x => x * TAU;

  // ------------------------------ the layers ------------------------------
  // (each a number; a recipe adds to them with its weight. Body: DROP lowered (× half the leg) · LIE on its chest · REAR the
  // front up on the hind legs · KICKP the rump up over the forefeet · BOW the front down · PITCH (+ nose down) · ROLL (+ to its
  // left side) · YAW the body curled (+ head to its left) · ARCH the back humped (− sagged) · FWD, LAT, LIFT the body moved
  // (× its length, its width, its leg) · GROUND settled on the ground · LIMP the legs limp · THRASH their kicking · STILL the walk
  // stopped · SIT. The head: NDOWN to the ground · NUP up · NFWD stretched forward · NYAW turned · HPITCH, HROLL, HYAW the head ·
  // AIM reaching to the target point · JAW · CHEW · BITE (the snap). Ears: EARB back · EARF pricked · EARO out · EARY turning ·
  // EARD drooped. Tail: TUP · TTUCK · TLASH · TWAG · TCURL. Trunk: TRUP · TRDN · TRFWD · TRCURL. Breath: BREATH deeper · BRATE
  // faster · PANT. EYE shut. SAC the throat puffed. Wings: WOPEN · WFLAP · WDROOP · WFOLD · WLIFT. The coils: COIL · PILE ·
  // RAISE · WRITHE · STRIKE · DROLL. HIGH the sprawler up on its legs; SWIM; SPLAY the forelegs apart; STIFF stiff legs; SHIV.)
  const NAMES = ['DROP', 'LIE', 'REAR', 'KICKP', 'BOW', 'PITCH', 'ROLL', 'YAW', 'ARCH', 'FWD', 'LAT', 'LIFT', 'GROUND', 'LIMP', 'THRASH', 'STILL', 'SIT',
    'NDOWN', 'NUP', 'NFWD', 'NYAW', 'HPITCH', 'HROLL', 'HYAW', 'AIM', 'JAW', 'CHEW', 'BITE',
    'EARB', 'EARF', 'EARO', 'EARY', 'EARD', 'TUP', 'TTUCK', 'TLASH', 'TWAG', 'TCURL', 'TRUP', 'TRDN', 'TRFWD', 'TRCURL',
    'BREATH', 'BRATE', 'PANT', 'EYE', 'SAC', 'WOPEN', 'WFLAP', 'WDROOP', 'WFOLD', 'WLIFT', 'COIL', 'PILE', 'RAISE', 'WRITHE', 'STRIKE', 'DROLL',
    'HIGH', 'SWIM', 'SPLAY', 'STIFF', 'SHIV', 'TFAN', 'LEGF', 'DEAD', 'TSIDE'];
  const I = {}; NAMES.forEach((n, k) => { I[n] = k; });
  const P = new Float32Array(NAMES.length);
  FG.I = I; FG.P = P; FG.NAMES = NAMES;
  // (the legs a gesture takes: each its target — the foot's joint, from where it stands, in leg lengths —, the bend of its
  // lower joint, the turn of its foot, how much it is taken, and how far it is swung out)
  const LW = new Float32Array(4), LZ = new Float32Array(4), LY = new Float32Array(4), LK = new Float32Array(4), LF = new Float32Array(4), LAB = new Float32Array(4);
  let kk = 1; // (the weight of the recipe adding now)
  const add = (i, v) => { P[i] += v * kk; };
  const mx = (i, v) => { const w = v * kk; if (w > P[i]) P[i] = w; };
  function leg(k, dz, dy, kap, ft) { LW[k] += kk; LZ[k] += dz * kk; LY[k] += dy * kk; LK[k] += (kap || 0) * kk; LF[k] += (ft || 0) * kk; }
  const ab = (k, v) => { LAB[k] += v * kk; };

  // ------------------------------ who is who ------------------------------
  // (the ways of each kind's body, from the vocabulary's groups: a cat crouches and grips, a horse rears and kicks, a cow lies
  // on its folded legs, a dog lies like a sphinx and curls, an elephant has a trunk)
  const STY = {};
  function styleOf(kind) {
    let s = STY[kind]; if (s) return s;
    const GR = (G.Gestos && G.Gestos.GROUPS) || {}; const has = (g, k) => !!(GR[g] && GR[g].indexOf(k) >= 0);
    s = { kind, cat: has('cat', kind), canid: has('canid', kind), bear: has('bear', kind), equid: has('equid', kind), rumin: has('ruminant', kind), antler: has('antler', kind), horned: has('horned', kind),
      pachy: has('pachy', kind), swine: has('swine', kind), small: has('small', kind), kicker: has('kicker', kind), eleph: kind === 'elephant', giraffe: kind === 'giraffe', rhino: kind === 'rhino', hippo: kind === 'hippo',
      monkey: kind === 'monkey', sloth: kind === 'sloth', rabbit: kind === 'rabbit' || kind === 'hare', otter: kind === 'otter', beaver: kind === 'beaver', camel: kind === 'camel', croc: kind === 'croc', raptor: has('raptor', kind),
      wader: has('wader', kind), ground: has('groundbird', kind), penguin: kind === 'penguin', ostrich: kind === 'ostrich' };
    // (how it lies: on its folded legs — the hoofed, the great —, like a sphinx — the cats, the dogs, the bears, the small; and
    // which sleep on their side)
    s.fold = !!(s.equid || s.rumin || s.pachy || s.swine || s.camel || kind === 'tapir');
    s.sphinx = !s.fold;
    s.hunter = s.cat || s.canid || s.bear;
    s.hoof = s.fold && !s.eleph;
    return (STY[kind] = s);
  }
  FG.styleOf = styleOf;

  // ------------------------------ the gesture's clock ------------------------------
  // the view keeps its own smooth clock of the gesture of each beast (in its memory s — People3D's bvis —, never in the
  // beast): restarted when the gesture changes or the world's clock of it drops (the same gesture begun again), eased in and
  // out; the gesture before fades while the new one comes in. impl: the gesture the old states mean when the world gives none
  FG.track = function (s, a, dt, impl) {
    const n = a.gest || impl || null;
    const wt = a.gest ? a.gestT || 0 : 0;
    if (n !== s.gn || (a.gest && wt < (s.gT || 0) - 0.15)) {
      if (s.gn && s.gk > 0.04) { s.pn = s.gn; s.pt = s.gt; s.pk = s.gk; s.pd = s.gd; s.pv = s.gv; } else { s.pn = null; s.pk = 0; }
      s.gn = n; s.gt = a.gest ? wt : 0; s.gk = 0;
    }
    s.gT = wt;
    const R0 = n ? REC[n] : null;
    s.gd = a.gest ? (a.gestD || 0) : (R0 && R0.d0) || 0; s.gv = a.gest ? a.gestV || 0 : 0; s.go = a.gest ? a.gestO || 0 : 0;
    if (n) {
      s.gt += dt; if (a.gest && Math.abs(s.gt - wt) > 0.6) s.gt += (wt - s.gt) * 0.5; // (kept near the world's clock: a load, a coarse step)
      const tin = R0 ? R0.in : 0.3; s.gk = Math.min(1, s.gk + dt / Math.max(0.05, tin));
    }
    if (s.pn) { s.pt += dt; const R1 = REC[s.pn]; s.pk -= dt / Math.max(0.05, R1 ? R1.out : 0.35); if (s.pk <= 0) { s.pn = null; s.pk = 0; } }
    return n;
  };
  // (the weight of a gesture at u seconds of its d: in by its clock, out before its end)
  function wOf(Rr, w, u, d) { if (d > 0 && Rr && Rr.out > 0 && !Rr.keep) w = Math.min(w, clamp((d - u) / Rr.out, 0, 1)); return sst(w); } // (keep: the end of it holds until the next — the fall)

  // ------------------------------ the context of the beast being posed ------------------------------
  const C = { kind: '', s: null, fam: '', t: 0, id: 0, side: 1, var: 0, young: 0, H: 1, L: 1, LL: 1, aim: false, held: null, sx: 1, f: 0, g: 0, en: 1, st: 1, ex: 0, dead: 0, v: 0, moving: false, hold: 0 };
  FG.C = C;
  // the layers of this beast now, from its gestures, its state, its mind and its death; returns how much it may walk
  FG.begin = function (fam, form, sp, st, LL) {
    P.fill(0); LW.fill(0); LZ.fill(0); LY.fill(0); LK.fill(0); LF.fill(0); LAB.fill(0);
    const gx = st.gx; const s0 = styleOf(st.kind || ''); C.s = s0; C.kind = s0.kind; C.fam = fam;
    C.t = st.t || 0; C.id = st.id || 0; C.young = st.young || 0; C.H = form.meta.H; C.L = form.meta.L; C.LL = LL || form.meta.H * 0.5; C.v = st.v || 0; C.moving = C.v > 0.08;
    C.aim = !!st.aim; C.held = st.held || null; C.hold = st.holdK || 0;
    const md = st.mood; C.sx = md ? md[4] : 1; C.f = md ? md[0] : 0; C.g = md ? md[1] : 0; C.en = md ? md[2] : 1; C.st = md ? md[3] : 1; C.ex = st.exert || 0;
    C.dead = st.dead || 0; C.sideDef = st.side || 0; C.down = st.down || 0; C.rollWith = st.rollWith || 0; C.tree = !!st.tree;
    C.aimSide = st.aim ? (st.aim[0] >= 0 ? 1 : -1) : 0;
    // the gestures: the one now and the one fading
    if (gx) {
      if (gx.pn && gx.pk > 0) run(gx.pn, fam, wOf(REC[gx.pn], gx.pk, gx.pt, gx.pd), gx.pt, gx.pd, gx.pv);
      if (gx.gn && gx.gk > 0) run(gx.gn, fam, wOf(REC[gx.gn], gx.gk, gx.gt, gx.gd), gx.gt, gx.gd, gx.gv);
    }
    // the states of old that speak without a gesture of the world (the stalk, the leap)
    if (st.crouch > 0) { kk = st.crouch; stalk(fam); }
    if (st.pounce > 0) { kk = 1; leap(fam, st.pounce); }
    // dead: lying on its side, limp — entered from the last pose (st.dead eases from 0 to 1)
    if (C.dead > 0) { kk = C.dead; const f = DEAD[fam]; if (f) f(st); }
    else if (st.hang) { kk = 1; const f = DEAD[fam]; if (f) f(st); P[I.EYE] *= 0.3; } // (alive and carried: limp in the jaws)
    // (the body follows the reach: lowered to a point below the mouth, reared to one above it — the throat of a prey still on
    // its feet, a moose's rump; the head does the rest)
    if (fam === 'quad' && st.aim && gx && gx.gn && REC[gx.gn] && REC[gx.gn].body && gx.gk > 0) {
      const w = sst(gx.gk) * clamp(P[I.AIM], 0, 1); mouthOf(form, Pm); const dy = (st.aim[1] - Pm[1]) / C.H, s = C.s;
      if (dy > 0.04 && (s.cat || s.canid || s.bear || s.equid || s.monkey)) { kk = w; add(I.REAR, clamp(dy * 1.5, 0, 0.9)); add(I.DROP, -P[I.DROP] * clamp(dy * 3, 0, 1) / Math.max(kk, 1e-3)); }
      else if (dy < -0.04) { kk = w; add(I.DROP, clamp(-dy * 1.1, 0, 0.9)); add(I.NDOWN, clamp(-dy * 0.9, 0, 0.8)); }
      const dz = (st.aim[2] - Pm[2]) / C.L; kk = w; add(I.FWD, clamp(dz * 0.6, -0.12, 0.12)); // (a step nearer, or back)
    } else if (fam === 'sprawl' && st.aim && gx && gx.gn && REC[gx.gn] && REC[gx.gn].body && gx.gk > 0 && !(P[I.DROLL] > 0)) { // (the crocodile up on its legs, the head raised, to the throat it holds — not in the roll: it turns about its own length, the jaws where they are)
      const w = sst(gx.gk); mouthOf(form, Pm); const dy = (st.aim[1] - Pm[1]) / C.H, dz = (st.aim[2] - Pm[2]) / C.L; kk = w;
      if (dy > 0.05) { add(I.HIGH, clamp(dy * 1.5, 0, 1)); add(I.PITCH, -clamp(dy * 0.35, 0, 0.45)); }
      add(I.FWD, clamp(dz * 0.7, -0.15, 0.15));
    }
    kk = 1; mood(fam, st);
    return 1 - clamp(P[I.STILL], 0, 1);
  };
  function run(n, fam, w, u, d, v) {
    const Rr = REC[n]; if (!Rr || w <= 0.001) return;
    const f = Rr[fam] || Rr.any; if (!f) return;
    C.var = v || 0; C.side = v > 0 ? 1 : v < 0 ? -1 : (st0side());
    kk = w; f(u, d || Rr.d0 || 0, w);
    if (Rr.still) { kk = w; add(I.STILL, Rr.still); }
  }
  // (the side a beast falls to or turns to when the world says none: away from the one that holds it, or its own)
  function st0side() { return C.sideDef || (G.hash(C.id * 13 + 5) < 0.5 ? 1 : -1); }
  FG.sideOf = id => (G.hash(id * 13 + 5) < 0.5 ? 1 : -1);
  // the mind on the body: fear (the ears back, the tail tucked or the flag raised, the head up), anger (the ears pinned,
  // the mouth open, the head low, the hackles up), the rest left (droopy, slow), the breath left (panting) — never over
  // a gesture that says otherwise: they add little, the gesture leads
  function mood(fam, st) {
    const s = C.s, f = C.f, g = C.g, tired = 1 - C.en, blown = Math.max(1 - C.st, C.ex);
    if (f > 0.05) { add(I.EARB, f * 0.8); add(I.NUP, f * 0.25); if (s.canid || s.cat) add(I.TTUCK, f * 0.7); else if (s.rumin || s.equid) add(I.TUP, f * 0.5); add(I.BRATE, f * 0.8); }
    if (g > 0.05) { add(I.EARB, g * (s.canid ? 0.6 : 1)); add(I.JAW, g * (s.hunter ? 0.35 : 0.1)); add(I.NFWD, g * 0.25); add(I.HPITCH, g * 0.15); if (s.canid || s.cat) { add(I.ARCH, g * 0.06); add(I.TUP, s.canid ? g * 0.45 : 0); add(I.TLASH, s.cat ? g * 0.6 : 0); } }
    if (tired > 0.3) { const k = (tired - 0.3) / 0.7; add(I.NUP, -k * 0.25); add(I.EARD, k * 0.6); add(I.BRATE, -k * 0.3); add(I.TLASH, -k * 0.3); }
    if (blown > 0.25) { const k = (blown - 0.25) / 0.75; add(I.PANT, k); add(I.JAW, k * (s.hunter ? 0.5 : s.fold ? 0.18 : 0.3)); add(I.NUP, -k * 0.2); add(I.BRATE, k * 2.2); add(I.BREATH, k * 1.5); }
    // (a young one's bounce now and then, when it stands about: the life in it)
    if (C.young > 0.4 && !C.moving && P[I.STILL] < 0.5 && !C.dead) { const q = osc(C.t, 0.11, C.id); if (q > 0.85) { const u = (q - 0.85) / 0.15; add(I.LIFT, Math.abs(Math.sin(C.t * 9)) * 0.12 * u); add(I.TWAG, u); } }
  }

  // ------------------------------ the recipes ------------------------------
  // REC[name] = { in, out (seconds to ease in and out), still (how far it stops the walk), d0 (its length when the old states
  // speak it), wing (a bird of the air spreads the wings of its flight mesh), quad / bird / snake / sprawl / frog / seal / any:
  // f(u seconds into it, d its length) adding to the layers }
  const REC = FG.REC = {};
  const def = (n, o) => { REC[n] = Object.assign({ in: 0.3, out: 0.35, still: 0 }, REC[n] || {}, o); };
  FG.def = def;
  // (the shared moves the recipes are made of)
  function stalk(fam) { add(I.DROP, 0.85); add(I.NFWD, 0.6); add(I.NUP, -0.15); add(I.EARF, 0.4); add(I.TUP, -0.1); add(I.TLASH, 0.3); }
  function leap(fam, p) { // (the cat in the air at the end of the pounce: stretched, the forelegs reaching, the hind ones trailing)
    const a = Math.sin(clamp(p, 0, 1) * Math.PI);
    add(I.LIFT, a * 0.55); add(I.PITCH, -0.12 * a); add(I.NFWD, 0.6); add(I.JAW, 0.8); add(I.EARB, 0.6);
    if (fam === 'quad') { for (const k of [0, 1]) leg(k, 0.9, 0.45, 0.2, -0.6); for (const k of [2, 3]) leg(k, -0.7, 0.2, -0.3, 0.6); }
  }
  // (lying on the chest: the legs folded under — or the forelegs out in front, like a sphinx —, the head up)
  function lieDown(w) {
    const s = C.s; const k0 = kk; kk *= w;
    if (s.eleph) { kk = k0; sideDown(w, C.sideDef || FG.sideOf(C.id)); return; } // (an elephant lies down on its side)
    add(I.LIE, 1); add(I.STILL, 1); add(I.GROUND, 1);
    if (s.fold) { for (const k of [0, 1]) leg(k, -0.15, -0.06, 2.75, 1.2); for (const k of [2, 3]) { leg(k, 0.0, -0.045, -1.7, -0.3); ab(k, 0.22); } ab(0, 0.05); ab(1, 0.05); }
    else { for (const k of [0, 1]) leg(k, 0.62, 0, 0.15, 0); for (const k of [2, 3]) { leg(k, 0.5, 0.0, -2.3, 0); ab(k, 0.32); } }
    kk = k0;
  }
  // (on its side: rolled over, the legs limp, the head on the ground)
  function sideDown(w, sd) {
    const k0 = kk; kk *= w; add(I.ROLL, sd * 1.42); add(I.GROUND, 1); add(I.LIMP, 1); add(I.STILL, 1); add(I.NYAW, -sd * 0.25); add(I.NDOWN, 0.15); kk = k0;
  }
  // (a hind kick at full stretch: the weight on the forelegs, the rump up, the hind legs thrown back)
  function hindKick(f, both, sd) {
    const e = bell(f, 0.05, 0.38, 0.85), x = bell(f, 0.2, 0.42, 0.7);
    add(I.KICKP, e); add(I.NDOWN, e * 0.45); add(I.EARB, e); add(I.TUP, e * 0.6);
    const one = both ? -1 : sd > 0 ? 2 : 3;
    for (const k of [2, 3]) if (both || k === one) { const kk0 = kk; kk *= Math.max(e * 0.6, x); leg(k, -1.05 * x - 0.2, 0.55 * x + 0.12, -0.35 * (1 - x), 0.9 * x); kk = kk0; }
  }
  // (a strike with the forefeet: up, and down hard)
  function foreStrike(f, both, sd, up) {
    const r = bell(f, 0.0, 0.35, 0.8), s = ramp(f, 0.35, 0.5) * (1 - ramp(f, 0.7, 0.95));
    add(I.REAR, r * (up || 0.45)); add(I.NUP, r * 0.3);
    for (const k of [0, 1]) if (both || k === (sd > 0 ? 0 : 1)) { const k0 = kk; kk *= r; leg(k, 0.55 - s * 0.35, 0.65 - s * 0.6, 1.8 * (1 - s), -0.5); kk = k0; }
  }
  FG.moves = { stalk, leap, lieDown, sideDown, hindKick, foreStrike };
  FG.add = add; FG.mx = mx; FG.leg = leg; FG.ab = ab; FG.ease = { sst, ramp, bell, osc, hz };
  FG.w = () => kk; FG.setW = w => { kk = w; };

  // ------------------------------ the families' solvers ------------------------------
  let FORM = null, J = null, LLc = 1;
  // the body as the gesture holds it (before the legs, which reach from it)
  FG.body = function (J0, form, st, LL, sL, fy) {
    J = J0; FORM = form; LLc = LL; const t = C.t, id = C.id; const gx = st.gx;
    // the breath: its own phase in the view's memory — quicker and deeper after a run, a pant short and fast, slow asleep
    const rate = 1.7 * Math.max(0.25, 1 + P[I.BRATE] + P[I.PANT] * 3) * (1 - P[I.EYE] * 0.45);
    let bph = t * 1.7 + id; if (gx) { gx.bph = (gx.bph === undefined ? bph : gx.bph) + (st.dt || 0) * rate; bph = gx.bph; }
    const dep = (1 + P[I.BREATH]) * (1 - P[I.PANT] * 0.4);
    E[B.spine * 3] += Math.sin(bph) * 0.008 * dep; E[B.chest * 3] -= Math.sin(bph) * 0.006 * dep;
    if (P[I.PANT] > 0) E[B.chest * 3] -= Math.sin(bph) * 0.012 * P[I.PANT];
    const r = B.root * 3, H = form.meta.H;
    OFF[1] -= P[I.DROP] * LL * 0.5;
    if (P[I.LIE] > 0) OFF[1] -= P[I.LIE] * (C.s.fold ? Math.max(0, J0[B.flL1 * 3 + 1] - LL * 0.11) : Math.max(0, bellyOf(form) - H * 0.015)); // (down until the chest rests on the folded forearms — or the belly on the ground)
    if (P[I.REAR] > 0) { const ang = rearAng(); E[r] -= P[I.REAR] * ang; OFF[1] -= P[I.REAR] * LL * 0.06; }
    if (P[I.KICKP] > 0) pivot(J0, B.flL0, P[I.KICKP] * 0.42);
    if (P[I.BOW] > 0) { E[r] += P[I.BOW] * 0.32; OFF[1] -= P[I.BOW] * LL * 0.12; }
    E[r] += P[I.PITCH]; E[r + 2] += P[I.ROLL];
    const yw = P[I.YAW]; if (yw) { E[B.spine * 3 + 1] += yw * 0.35; E[B.chest * 3 + 1] += yw * 0.3; E[r + 1] -= yw * 0.15; }
    const ar = P[I.ARCH]; if (ar) { E[r] -= ar * 0.45; E[B.spine * 3] += ar * 0.8; E[B.chest * 3] -= ar * 0.3; }
    OFF[2] += P[I.FWD] * form.meta.L; OFF[0] += P[I.LAT] * H * 0.3; OFF[1] += P[I.LIFT] * LL;
    if (P[I.SHIV] > 0) { const q = P[I.SHIV]; E[r + 2] += Math.sin(t * 61 + id) * 0.012 * q; E[B.spine * 3] += Math.sin(t * 47) * 0.01 * q; }
  };
  // (how far up the hind legs a kind rears: a bear and a monkey stand, a horse goes up high, an elephant half)
  function rearAng() { const s = C.s; return s.bear || s.monkey ? 1.2 : s.equid ? 0.95 : s.eleph ? 0.5 : s.giraffe ? 0.35 : s.cat || s.canid ? 0.85 : s.beaver || s.rabbit || s.otter ? 0.9 : 0.8; }
  // (the body pitched by ang about a point of it — the shoulders: the rump goes up over the forefeet, which stay)
  function pivot(J0, bone, ang) {
    const r = B.root * 3, i = bone * 3; const dz = J0[i + 2] - J0[r + 2], dy = J0[i + 1] - J0[r + 1]; const C0 = E[r];
    const z0 = rz(dz, dy, C0), y0 = ry(dz, dy, C0), z1 = rz(dz, dy, C0 + ang), y1 = ry(dz, dy, C0 + ang);
    E[r] += ang; OFF[2] += z0 - z1; OFF[1] += y0 - y1;
  }
  // (the height of the belly as modelled: the lowest of the trunk's skin — the chest down on it when lying)
  function bellyOf(form) {
    if (form._belly !== undefined) return form._belly; let lo = 1e9; const h = form.hull;
    if (h) for (const bn of ['root', 'spine', 'chest']) { const b = B[bn]; if (!h.has[b]) continue; for (let j = 0; j < 14; j++) lo = Math.min(lo, h.p[(b * h.nd + j) * 3 + 1]); }
    if (lo > 1e8) lo = form.J[B.flL1 * 3 + 1] * 1.05;
    return (form._belly = lo);
  }
  // the legs the gesture takes: each to its target (folded under, out in front, thrown back, raised to strike), blended from
  // where the stride or the stance has it; limp (on its side, dead) and thrashing (held, dying)
  FG.legs = function (J0, form, st, LL, sL, fy, lg, LT) {
    const t = C.t;
    for (let k = 0; k < 4; k++) {
      const L = LEGS[k], sd = L[2] === 'L' ? 1 : -1, w = Math.min(1, LW[k]);
      if (w > 0.002) {
        const g = lg[k], o = k * 5, iw = 1 / LW[k], gy = g.y3 * sL + (fy ? fy[k] : 0);
        const tz = g.z + LZ[k] * iw * LL, ty = gy + LY[k] * iw * LL, kp = LK[k] * iw, ft = LF[k] * iw;
        const Tz = LT[o] + (tz - LT[o]) * w, Ty = LT[o + 1] + (ty - LT[o + 1]) * w, Kp = LT[o + 2] + (kp - LT[o + 2]) * w, Ft = LT[o + 3] + (ft - LT[o + 3]) * w;
        const Cp = K.legTop(J0, L);
        if (LT[o + 4] && Ty < gy + LL * 0.05) K.legToP(J0, L, Cp, Tz, Ty, Ft, sL); else K.legTo(J0, L, Cp, Tz, Ty, Kp, Ft, sL);
      }
      if (LAB[k]) E[B[L + '0'] * 3 + 2] += sd * LAB[k];
    }
    // (limp: each joint let go, hanging a little bent; thrashing: the legs kick and paddle, each its own beat)
    const lm = clamp(P[I.LIMP], 0, 1), th = P[I.THRASH];
    if (lm > 0 || th > 0) for (let k = 0; k < 4; k++) {
      const L = LEGS[k], front = k < 2, i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3, i2 = B[L + '2'] * 3, i3 = B[L + '3'] * 3;
      if (lm > 0) {
        const up = (L[2] === 'L') === (P[I.ROLL] < 0); // (the legs of the upper side lie over the lower ones, a little apart)
        const a0 = front ? -0.45 : 0.5, a1 = front ? 0.35 : -0.45, a2 = front ? 0.35 : 0.4, a3 = front ? 0.3 : 0.25;
        E[i0] += (a0 - E[i0]) * lm; E[i1] += (a1 - E[i1]) * lm; E[i2] += (a2 - E[i2]) * lm; E[i3] += (a3 - E[i3]) * lm;
        E[i0 + 2] += (up ? 0.22 : -0.05) * (L[2] === 'L' ? 1 : -1) * lm;
      }
      if (th > 0) {
        const f = (st.thrashHz || 2.6) * (1 + 0.13 * k), p = k * 1.9 + C.id;
        E[i0] += Math.sin(hz(f) * t + p) * 0.55 * th; E[i1] += Math.sin(hz(f) * t + p + 0.9) * 0.45 * th * (front ? 1 : -1);
        E[i2] += Math.sin(hz(f) * t + p + 1.7) * 0.4 * th; E[i3] += Math.sin(hz(f) * t + p + 2.2) * 0.3 * th;
      }
    }
  };
  FG.sitK = () => clamp(P[I.SIT], 0, 1);
  // the neck and the head: down to the ground, up, stretched forward, turned; the mouth open, chewing, the snap of a bite
  FG.head = function (J0, form, st, LL) {
    const t = C.t, n0 = B.neck0 * 3, n1 = B.neck1 * 3, n2 = B.neck2 * 3, h = B.head * 3;
    const nd = (clamp(P[I.NDOWN], 0, 1.3) - (st.graze || 0) * 0.9) * (form.meta.trunk ? 0.3 : 1); // (an elephant reaches the ground with its trunk)
    if (nd > 0.001) {
      const nose = form.meta.nose; const yr = nose[1] - J0[n0 + 1], zr = nose[2] - J0[n0 + 2]; const Rr = Math.hypot(yr, zr), p0 = Math.atan2(yr, zr);
      const want = (0.04 - J0[n0 + 1] - OFF[1]) / Rr; const th = (p0 - Math.asin(clamp(want, -1, 1))) * (form.meta.hop ? 0.5 : 1) * Math.min(1, nd) + Math.max(0, nd - 1) * 0.6;
      E[n0] += th * 0.62; E[n1] += th * 0.24; E[n2] += th * 0.14; E[h] -= th * 0.12;
    }
    const nu = P[I.NUP]; if (nu) { E[n0] -= nu * 0.5; E[n1] -= nu * 0.3; E[n2] -= nu * 0.15; E[h] -= nu * 0.25; }
    const nf = P[I.NFWD]; if (nf) { E[n0] += nf * 0.55; E[n1] += nf * 0.2; E[h] -= nf * 0.55; }
    const ny = P[I.NYAW]; if (ny) { E[n0 + 1] += ny * 0.4; E[n1 + 1] += ny * 0.3; E[n2 + 1] += ny * 0.2; E[h + 1] += ny * 0.15; }
    E[h] += P[I.HPITCH]; E[h + 2] += P[I.HROLL]; E[h + 1] += P[I.HYAW];
    const jw = B.jaw * 3; const open = clamp(P[I.JAW], 0, 1.4) + Math.max(0, Math.sin(t * hz(1.6) + C.id)) * P[I.CHEW] * 0.2 + P[I.BITE];
    if (open > 0) E[jw] = Math.max(E[jw], open * jawMax(form));
    if (P[I.CHEW] > 0) E[jw + 1] += Math.sin(t * hz(1.6) + C.id) * 0.04 * P[I.CHEW] * (C.s.rumin ? 1 : 0.3);
    if (P[I.SAC] > 0) SC[B.jaw] = 1 + P[I.SAC] * 0.6;
  };
  const jawMax = form => (C.fam === 'sprawl' ? 0.75 : C.s.hippo ? 1.1 : C.s.cat || C.s.bear ? 0.7 : C.s.canid ? 0.6 : 0.45);
  FG.ears = function (st) {
    const eb = P[I.EARB], ef = P[I.EARF], eo = P[I.EARO], ey = P[I.EARY], ed = P[I.EARD], t = C.t;
    if (!(eb || ef || eo || ey || ed)) return;
    const l = B.earL * 3, r = B.earR * 3, sw = ey ? Math.sin(t * hz(0.7) + C.id) * ey : 0;
    E[l] += eb * 0.7 - ef * 0.35 + ed * 0.4; E[r] += eb * 0.7 - ef * 0.35 + ed * 0.4;
    E[l + 2] += -eb * 0.25 - eo * 0.9 - ed * 0.5; E[r + 2] += eb * 0.25 + eo * 0.9 + ed * 0.5;
    E[l + 1] += sw * 0.6 + eo * 0.4; E[r + 1] += -sw * 0.6 - eo * 0.4;
  };
  FG.tail = function (st) {
    const tu = P[I.TUP] + P[I.REAR] * 0.7, tt = P[I.TTUCK], tl = P[I.TLASH], tw = P[I.TWAG], tc = P[I.TCURL], t = C.t; // (reared, the tail held up off the ground)
    if (!(tu || tt || tl || tw || tc || P[I.TSIDE])) return;
    for (let k = 0; k < 4; k++) {
      const b = B['tail' + k] * 3;
      E[b] += -tu * (k === 0 ? 0.85 : 0.18) + tt * (k === 0 ? 0.6 : 0.3) - tc * 0.45;
      E[b + 1] += Math.sin(t * hz(0.9) - k * 0.7 + C.id) * tl * (0.15 + k * 0.12) + Math.sin(t * hz(4.5) - k * 0.5) * tw * (0.12 + k * 0.08) + P[I.TSIDE] * (0.3 + k * 0.12);
    }
  };
  FG.trunk = function (st) {
    const up = P[I.TRUP], dn = P[I.TRDN], fw = P[I.TRFWD], cu = P[I.TRCURL];
    if (!(up || dn || fw || cu)) return;
    for (let k = 0; k < 3; k++) { const b = B['trunk' + k] * 3; E[b] += -up * (0.55 + k * 0.25) + dn * (0.35 - k * 0.05) - fw * (0.45 - k * 0.2) - cu * (k === 2 ? 1.1 : 0.5); }
  };
  // ------------------------------ the end: the reach to the other, the body on the ground ------------------------------
  const AIMB = [B.chest, B.neck0, B.neck1, B.neck2, B.head], AIMW = [0.12, 0.42, 0.32, 0.26, 0.32], AIMBS = [B.neck0, B.neck1, B.neck2, B.head], AIMWS = [0.45, 0.35, 0.3, 0.3]; // (the sprawlers and the birds reach with the neck alone: a crocodile does not stand up on its chest)
  const T3 = new Float32Array(3), Pm = new Float32Array(3);
  FG.end = function (J0, form, st) {
    J = J0; FORM = form;
    const aw = clamp(P[I.AIM], 0, 1);
    if (aw > 0.01 && st.aim) { const R0 = st.gx && st.gx.gn ? REC[st.gx.gn] : null; if (R0 && R0.eff === 'brow') browOf(form, Pm); else mouthOf(form, Pm); const nk = C.fam === 'sprawl' || C.fam === 'bird'; reach(J0, B.head, Pm, st.aim, aw, nk ? AIMBS : AIMB, nk ? AIMWS : AIMW, 6); if (C.fam === 'sprawl') for (const bi of AIMBS) { E[bi * 3] = clamp(E[bi * 3], -0.6, 0.5); E[bi * 3 + 1] = clamp(E[bi * 3 + 1], -0.7, 0.7); } }
    const gk = clamp(P[I.GROUND], 0, 1); if (gk > 0.01 && form.hull && !st.hang && !st.tree) settle(J0, form, gk, st.fy);
    // (no gesture puts the body into the ground: a body turned, lowered, rolled, kicking is lifted until its skin is out of it —
    // the poses that go under on purpose, the burrow, the dive, the swim, the coils, the death roll in the water, excepted)
    if (form.hull && !st.hang && !st.tree && !(C.fam === 'bird' && form.meta.fly && !st.ground) && P[I.LIFT] >= -0.01 && !(P[I.SWIM] > 0) && !(P[I.DROLL] > 0) && !(P[I.COIL] > 0) &&
      ((C.fam !== 'quad' && st.gx && st.gx.gn) || P[I.ROLL] || P[I.LIE] || P[I.DROP] > 0.2 || P[I.KICKP] || P[I.BOW] || P[I.LIMP] || P[I.THRASH] || P[I.ARCH] || P[I.SIT] || P[I.WDROOP] || P[I.HIGH] || P[I.GROUND] || P[I.RAISE] || P[I.WRITHE] || P[I.STRIKE] || P[I.PILE] || C.dead)) {
      const g = st.fy ? Math.min(st.fy[0], st.fy[1], st.fy[2], st.fy[3]) : 0; const lo = lowest(J0, form); if (lo < g) OFF[1] += g - lo + FORM.meta.H * 0.006; // (a hair over: the support points miss a little of the skin)
    }
  };
  // (the point a beast bites with: most of the way from the hinge of its jaw to the tip of its nose — on the head's bone)
  function mouthOf(form, out) { const J0 = form.J, jw = B.jaw * 3, n = form.meta.nose; out[0] = 0; out[1] = J0[jw + 1] + (n[1] - J0[jw + 1]) * 0.75; out[2] = J0[jw + 2] + (n[2] - J0[jw + 2]) * 0.75; return out; }
  FG.mouthOf = mouthOf;
  // (the brow: over the eyes, a little forward of them — where two rivals meet head to head; the horns and the antlers are above it)
  function browOf(form, out) { const e = form.meta.eye, n = form.meta.nose; out[0] = 0; out[1] = e[1] + (e[1] - n[1]) * 0.25; out[2] = e[2] + (n[2] - e[2]) * 0.1; return out; }
  FG.browOf = browOf;
  // bring the point p (as modelled, on the bone eb) to T (the beast's own frame) by turning the bones of the chain — each by its
  // share, from the tip back, a few times over: the yaw about the parent's up, the pitch about its side
  function reach(J0, eb, p, T, w, bones, share, iters) {
    const PAR = FA.PARENT;
    for (let it = 0; it < iters; it++) {
      for (let q = bones.length - 1; q >= 0; q--) {
        const bi = bones[q]; K.chainI(J0);
        const e = R[eb].elements, x = p[0] - J0[eb * 3], y = p[1] - J0[eb * 3 + 1], z = p[2] - J0[eb * 3 + 2];
        const ex = e[0] * x + e[4] * y + e[8] * z + e[12], ey = e[1] * x + e[5] * y + e[9] * z + e[13], ez = e[2] * x + e[6] * y + e[10] * z + e[14];
        const f = R[bi].elements, px = f[12], py = f[13], pz = f[14]; const pr = PAR[bi] >= 0 ? R[PAR[bi]].elements : null;
        let ax = ex - px, ay = ey - py, az = ez - pz, bx = T[0] - px, by = T[1] - py, bz = T[2] - pz;
        if (pr) { // (into the parent's axes: the bone's turns are about them)
          const a0 = pr[0] * ax + pr[1] * ay + pr[2] * az, a1 = pr[4] * ax + pr[5] * ay + pr[6] * az, a2 = pr[8] * ax + pr[9] * ay + pr[10] * az;
          const b0 = pr[0] * bx + pr[1] * by + pr[2] * bz, b1 = pr[4] * bx + pr[5] * by + pr[6] * bz, b2 = pr[8] * bx + pr[9] * by + pr[10] * bz;
          ax = a0; ay = a1; az = a2; bx = b0; by = b1; bz = b2;
        }
        let dyaw = Math.atan2(bx, bz) - Math.atan2(ax, az); while (dyaw > Math.PI) dyaw -= TAU; while (dyaw < -Math.PI) dyaw += TAU;
        const dp = Math.atan2(ay, Math.hypot(ax, az)) - Math.atan2(by, Math.hypot(bx, bz));
        const s = share[q] * w, lim = 0.5;
        E[bi * 3 + 1] += clamp(dyaw * s, -lim, lim); E[bi * 3] += clamp(dp * s, -lim, lim);
      }
    }
    for (const bi of bones) { E[bi * 3] = clamp(E[bi * 3], -1.6, 1.8); E[bi * 3 + 1] = clamp(E[bi * 3 + 1], -1.4, 1.4); }
  }
  FG.reach = reach;
  // (how low the skin goes now: the lowest of each bone's support points — the extremes of its skin as modelled — moved as the
  // bone is; the body set down so that it touches the ground, by w)
  function lowest(J0, form) {
    K.chainI(J0); const h = form.hull; let lo = 1e9; const n = h.qn, q = h.q, qi = h.qi, qw = h.qw;
    for (let i = 0; i < n; i++) { const o = i * 3, x = q[o], y0 = q[o + 1], z = q[o + 2]; let y = 0;
      for (let k = 0; k < 4; k++) { const w = qw[i * 4 + k]; if (!w) continue; const b = qi[i * 4 + k], e = R[b].elements; y += w * (e[1] * (x - J0[b * 3]) + e[5] * (y0 - J0[b * 3 + 1]) + e[9] * (z - J0[b * 3 + 2]) + e[13]); }
      if (y < lo) lo = y; }
    return lo;
  }
  FG.lowest = lowest;
  function settle(J0, form, w, fy) {
    const g = fy ? (fy[0] + fy[1] + fy[2] + fy[3]) * 0.25 : 0;
    for (let it = 0; it < 2; it++) { const lo = lowest(J0, form); const d = (g + FORM.meta.H * 0.006 - lo) * w; if (Math.abs(d) < 1e-4) break; OFF[1] += d; }
  }
  // the support points of each bone's skin, from the mesh (once a form): the farthest point of the skin each bone moves most,
  // along many directions — the 14 first by name (±x, ±y, ±z, the corners: where a throat, a nape, a back is), then 64 spread
  // over the sphere —, each kept once and skinned as the shader skins it (its four bones and weights): the lowest of them is,
  // within a hair, the lowest of the skin whatever the pose
  const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]; for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) DIRS.push([a * 0.577, b * 0.577, c * 0.577]);
  const NDN = DIRS.length; for (let i = 0; i < 64; i++) { const y = 1 - (i + 0.5) / 32, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996; DIRS.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
  FG.hullOf = function (u) {
    const ND = DIRS.length, n = NB * ND, best = new Float32Array(n).fill(-1e9), idx = new Int32Array(n).fill(-1), p = new Float32Array(NB * NDN * 3), has = new Uint8Array(NB);
    for (let i = 0; i < u.n; i++) {
      let b = u.bi[i * 4], w0 = u.bw[i * 4]; for (let k = 1; k < 4; k++) if (u.bw[i * 4 + k] > w0) { w0 = u.bw[i * 4 + k]; b = u.bi[i * 4 + k]; }
      const x = u.pos[i * 3], y = u.pos[i * 3 + 1], z = u.pos[i * 3 + 2]; has[b] = 1;
      for (let j = 0; j < ND; j++) { const d = DIRS[j]; const s = x * d[0] + y * d[1] + z * d[2]; const q = b * ND + j; if (s > best[q]) { best[q] = s; idx[q] = i; } }
    }
    const seen = new Set(); for (let b = 0; b < NB; b++) for (let j = 0; j < ND; j++) { const i = idx[b * ND + j]; if (i < 0) continue; seen.add(i);
      if (j < NDN) { const o = (b * NDN + j) * 3; p[o] = u.pos[i * 3]; p[o + 1] = u.pos[i * 3 + 1]; p[o + 2] = u.pos[i * 3 + 2]; } }
    const list = [...seen].sort((a, b) => a - b), qn = list.length, q = new Float32Array(qn * 3), qi = new Uint8Array(qn * 4), qw = new Float32Array(qn * 4);
    list.forEach((i, k) => { q[k * 3] = u.pos[i * 3]; q[k * 3 + 1] = u.pos[i * 3 + 1]; q[k * 3 + 2] = u.pos[i * 3 + 2]; for (let m = 0; m < 4; m++) { qi[k * 4 + m] = u.bi[i * 4 + m]; qw[k * 4 + m] = u.bw[i * 4 + m] / 255; } });
    return { p, has, nd: NDN, q, qi, qw, qn };
  };

  // ------------------------------ the birds ------------------------------
  // afoot: crouched or sitting on the folded legs (the feet where they stand), the neck and the head, the wings opened,
  // flapping, drooped; a leg kicking out (the ostrich). In the air (the flight mesh): the wings folded back for the stoop, the
  // legs thrown forward with the talons; on the ground with the flight mesh (the mantle, the wings spread to the sun): the legs
  // standing, the wings drooped over the prey
  const NECK = [B.neck0 * 3, B.neck1 * 3, B.neck2 * 3, B.head * 3];
  function neckLayers() {
    const n0 = NECK[0], n1 = NECK[1], n2 = NECK[2], h = NECK[3];
    const nu = P[I.NUP]; if (nu) { E[n0] -= nu * 0.5; E[n1] -= nu * 0.3; E[n2] -= nu * 0.15; E[h] -= nu * 0.25; }
    const nf = P[I.NFWD]; if (nf) { E[n0] += nf * 0.6; E[n1] += nf * 0.25; E[h] -= nf * 0.6; }
    const ny = P[I.NYAW]; if (ny) { E[n0 + 1] += ny * 0.4; E[n1 + 1] += ny * 0.3; E[n2 + 1] += ny * 0.2; E[h + 1] += ny * 0.15; }
    E[h] += P[I.HPITCH]; E[h + 2] += P[I.HROLL]; E[h + 1] += P[I.HYAW];
    const jw = B.jaw * 3, open = clamp(P[I.JAW], 0, 1.4) + Math.max(0, Math.sin(C.t * hz(1.6) + C.id)) * P[I.CHEW] * 0.2 + P[I.BITE];
    if (open > 0) E[jw] = Math.max(E[jw], open * (C.fam === 'bird' ? 0.45 : C.fam === 'snake' ? 0.9 : C.fam === 'sprawl' ? 0.75 : 0.5));
    if (P[I.SAC] > 0) SC[B.jaw] = 1 + P[I.SAC] * (C.fam === 'frog' ? 1.2 : 0.4);
  }
  FG.bird = function (J0, form, st, fly) {
    J = J0; FORM = form; const t = C.t, r = B.root * 3, hipY = J0[B.hlL0 * 3 + 1];
    const ground = !!st.ground || !fly;
    if (fly && ground) { // (the flight mesh on the ground: standing on its legs as modelled, the wings held as the layers say)
      for (const s of 'LR') for (let k = 0; k < 4; k++) { E[B['hl' + s + k] * 3] = 0; E[B['hl' + s + k] * 3 + 2] = 0; }
      for (const s of 'LR') for (let k = 0; k < 3; k++) { const i = B['fl' + s + k] * 3; E[i] *= 0.15; E[i + 1] *= 0.15; E[i + 2] *= 0.15; }
      OFF[1] = 0; E[r] = 0; E[r + 2] = 0;
    }
    const down = clamp(P[I.DROP] * 0.45 + P[I.LIE], 0, 1.1); if (ground && P[I.LIE] > 0) P[I.GROUND] = Math.max(P[I.GROUND], clamp(P[I.LIE], 0, 1)); // (sat down: the breast on the ground)
    if (ground && (down > 0 || P[I.LEGF] > 0 || P[I.PITCH] || P[I.LIFT])) {
      OFF[1] += -down * hipY * 0.8 + P[I.LIFT] * hipY; E[r] += P[I.PITCH];
      const kf = P[I.LEGF], ks = C.side > 0 ? 'L' : 'R';
      for (const s of 'LR') { const L = 'hl' + s, i3 = B[L + '3'] * 3, Cp = K.legTop(J0, L); const kick = s === ks ? kf : 0;
        K.legToB(J0, L, Cp, J0[i3 + 2] + kick * hipY * 0.7, J0[i3 + 1] + kick * hipY * 0.45, kick * -0.6); }
    } else if (!ground) E[r] += P[I.PITCH];
    E[r + 2] += P[I.ROLL];
    if (P[I.NDOWN] > 0) { const nd = Math.min(1.2, P[I.NDOWN]); E[r] += nd * (fly ? 0.2 : 0.55); E[NECK[0]] += nd * 0.7; E[NECK[1]] += nd * 0.3; E[NECK[2]] += nd * 0.15; }
    neckLayers();
    // (the wings: opened out from the body, flapping, drooped down over the ground, folded back tight)
    const wo = P[I.WOPEN], wf = P[I.WFLAP], wd = P[I.WDROOP], wk = clamp(P[I.WFOLD], 0, 1), wl = P[I.WLIFT];
    const beat = Math.sin(t * hz(fly ? 2.4 : 5.5) + C.id);
    for (const s of 'LR') { const sd = s === 'L' ? 1 : -1, f0 = B['fl' + s + '0'] * 3, f1 = B['fl' + s + '1'] * 3, f2 = B['fl' + s + '2'] * 3;
      if (wk > 0) { E[f0] *= 1 - wk; E[f0 + 1] *= 1 - wk; E[f0 + 2] *= 1 - wk; E[f1 + 2] *= 1 - wk; E[f2 + 2] *= 1 - wk;
        E[f0 + 1] -= sd * 1.05 * wk; E[f0 + 2] -= sd * 0.25 * wk; E[f1 + 1] += sd * 0.9 * wk; E[f2 + 1] -= sd * 0.9 * wk; }
      if (!fly) { E[f0 + 2] += sd * (wo * 1.0 + wf * (0.55 + 0.55 * beat) + wl * 0.7); E[f1 + 1] -= sd * wo * 0.5; E[f2 + 1] += sd * wo * 0.6; E[f0] -= wl * 0.4; }
      else { E[f0 + 2] += sd * (wf * 0.6 * beat - wd * 0.5 + wl * 0.5); E[f0 + 1] += sd * wd * 0.3; E[f2 + 2] -= sd * wd * 0.25; }
    }
    // (the legs in the air: thrown forward with the talons open, or hanging to grip what is carried)
    if (fly && !ground && P[I.LEGF] > 0) { const k = P[I.LEGF]; for (const s of 'LR') { const a0 = B['hl' + s + '0'] * 3, a1 = B['hl' + s + '1'] * 3, a2 = B['hl' + s + '2'] * 3, a3 = B['hl' + s + '3'] * 3;
      E[a0] += (-1.1 - E[a0]) * k; E[a1] += (-0.2 - E[a1]) * k; E[a2] += (0.3 - E[a2]) * k; E[a3] += (0.5 - E[a3]) * k; } }
    // (thrashing on its side: the legs kick, the wings beat the ground)
    if (P[I.THRASH] > 0) { const th = P[I.THRASH]; for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['hl' + s + '1'] * 3] += Math.sin(t * hz(3) + sd) * 0.6 * th; E[B['hl' + s + '2'] * 3] += Math.sin(t * hz(3) + sd + 1) * 0.5 * th; E[B['fl' + s + '0'] * 3 + 2] += sd * (0.5 + 0.5 * Math.sin(t * hz(4.5) + sd)) * th; } }
    // (the tail raised and fanned, the body puffed — the turkey, the displays)
    if (P[I.TFAN] > 0 || P[I.TUP]) { E[B.tail0 * 3] -= (P[I.TFAN] * 1.1 + P[I.TUP] * 0.4); E[B.tail1 * 3] -= P[I.TFAN] * 0.3; }
    if (P[I.TFAN] > 0) SC[B.chest] = 1 + P[I.TFAN] * 0.1;
    if (P[I.SHIV] > 0) E[r + 2] += Math.sin(t * 61) * 0.015 * P[I.SHIV];
  };
  // ------------------------------ the snakes ------------------------------
  // the front raised in an S (the threat, the strike drawn back), the strike's lunge, the coiled pile (asleep, against the
  // cold), the coils round a prey (a loop round its body, the head at its head), the writhing (held, dying); the jaws
  const SN = ['tail3', 'tail2', 'tail1', 'tail0', 'root', 'spine', 'chest', 'neck0', 'neck1', 'neck2', 'head'], LOOP = ['tail2', 'tail1', 'tail0', 'root', 'spine', 'chest', 'neck0'];
  FG.snake = function (J0, form, st) {
    J = J0; FORM = form; const t = C.t, H = form.meta.H;
    const pl = clamp(P[I.PILE], 0, 1), co = clamp(P[I.COIL], 0, 1), rs = P[I.RAISE], sk = P[I.STRIKE], wr = P[I.WRITHE];
    const calm = Math.max(pl, co); if (calm > 0) for (const n of SN) { const b = B[n] * 3; E[b + 1] *= 1 - calm; E[b] *= 1 - calm; }
    if (pl > 0) { // (a flat spiral, tighter inward, the head resting on top in the middle)
      for (let k = 0; k < SN.length; k++) { const b = B[SN[k]] * 3, a = (0.62 + k * 0.045) * pl; E[b + 1] += k < 4 ? -a : a; }
      E[B.neck2 * 3] -= 0.35 * pl; E[B.head * 3] += 0.3 * pl; E[B.neck1 * 3] -= 0.2 * pl;
    }
    if (co > 0) { // (the loop round the prey's body: each bone turned about the snake's side axis, a little along it; the neck out of the coils, to the prey's head)
      const R0 = st.coilR || H * 1.4, l = Math.abs(J0[B.spine * 3 + 2] - J0[B.root * 3 + 2]) || 0.3, d = 2 * Math.asin(clamp(l / (2 * (R0 + H * 0.5)), 0.05, 0.95)), e = 0.13;
      // (the root's two sides leave its joint in one line — no joint can turn there —: the spine and the first of the tail take half a turn more each, and the loop closes round one centre)
      for (const n of ['spine', 'chest', 'neck0']) { const b = B[n] * 3, k = n === 'spine' ? 1.5 : 1; E[b] += d * k * co; E[b + 1] += e * co; }
      for (const n of ['tail0', 'tail1', 'tail2', 'tail3']) { const b = B[n] * 3, k = n === 'tail0' ? 1.5 : 1; E[b] -= d * k * co; E[b + 1] -= e * co; }
      E[B.neck1 * 3] -= 1.9 * co; E[B.neck1 * 3 + 1] += 1.1 * co * C.side; E[B.neck2 * 3] -= 0.5 * co; E[B.head * 3] += 0.55 * co; // (out of the loop, along the prey toward its head)
      const Rl = l / (2 * Math.sin(d / 2)); OFF[1] += ((st.coilY !== undefined ? st.coilY : Rl) + Rl - J0[B.root * 3 + 1]) * co; // (the root at the top of the loop, the loop round the prey's middle)
      const sq = 0.5 + 0.5 * Math.sin(t * hz(0.35)); SC[B.chest] = 1 + 0.04 * sq * co; // (the squeeze, breath by breath)
      // (the loop's middle at the prey's middle: the snake's root above where the prey's body is, at the prey's height)
      K.chainI(J0); const a1 = R[B.spine].elements, a2 = R[B.chest].elements, a3 = R[B.neck0].elements; // (the circle through three joints of the loop: its centre)
      const ay = a1[13], az = a1[14], by = a2[13], bz = a2[14], cy0 = a3[13], cz0 = a3[14], dd = 2 * (ay * (bz - cz0) + by * (cz0 - az) + cy0 * (az - bz)) || 1e-6;
      const s1 = ay * ay + az * az, s2 = by * by + bz * bz, s3 = cy0 * cy0 + cz0 * cz0;
      let cy = (s1 * (bz - cz0) + s2 * (cz0 - az) + s3 * (az - bz)) / dd, cz = (s1 * (cy0 - by) + s2 * (ay - cy0) + s3 * (by - ay)) / dd;
      if (!(Math.abs(dd) > 1e-5) || Math.hypot(cy - by, cz - bz) > Rl * 3) { cy = (ay + by + cy0) / 3 - Rl * 0.5; cz = (az + bz + cz0) / 3; } // (a straight run: no centre — about where it would be)
      OFF[1] += ((st.coilY !== undefined ? st.coilY : Rl) - cy) * co; OFF[2] += (J0[B.root * 3 + 2] - cz) * co;
    }
    if (rs > 0) { E[B.chest * 3] -= 0.35 * rs; E[B.neck0 * 3] -= 0.55 * rs; E[B.neck1 * 3] += 0.35 * rs; E[B.neck2 * 3] += 0.45 * rs; E[B.head * 3] += 0.15 * rs;
      E[B.neck0 * 3 + 1] += 0.5 * rs; E[B.neck1 * 3 + 1] -= 0.9 * rs; E[B.neck2 * 3 + 1] += 0.6 * rs; } // (the S drawn back, the head level)
    if (sk > 0) { E[B.neck0 * 3 + 1] -= 0.5 * sk; E[B.neck1 * 3 + 1] += 0.9 * sk; E[B.neck2 * 3 + 1] -= 0.6 * sk; E[B.neck1 * 3] -= 0.35 * sk; E[B.neck2 * 3] -= 0.45 * sk; OFF[2] += sk * form.meta.L * 0.12; } // (the S thrown straight at the prey)
    if (wr > 0) for (let k = 0; k < SN.length; k++) { const b = B[SN[k]] * 3; E[b + 1] += Math.sin(t * hz(1.8) - k * 0.7) * 0.45 * wr * (k < 4 ? -1 : 1); E[b + 2] += Math.sin(t * hz(1.1) - k * 0.5) * 0.08 * wr; E[b] -= Math.max(0, Math.sin(t * hz(1.3) - k * 0.9)) * 0.12 * wr; } // (the body thrown about, arching off the ground)
    E[B.root * 3 + 2] += P[I.ROLL]; OFF[1] += P[I.LIFT] * H; OFF[2] += P[I.FWD] * form.meta.L;
    neckLayers();
  };
  // ------------------------------ the sprawlers: the crocodile, the lizard ------------------------------
  // up on its legs (the high walk), flat on its belly, the head and the tail raised (the bellow), the jaws; the death roll —
  // the whole body turning about its long axis, the legs drawn in along it —; swimming with the legs laid back and the tail
  // sculling; the lunge from the water
  const SPL = ['flL', 'flR', 'hlL', 'hlR'];
  FG.sprawl = function (J0, form, st) {
    J = J0; FORM = form; const t = C.t, H = form.meta.H, r = B.root * 3;
    const hi = P[I.HIGH], fl = clamp(P[I.LIE] + P[I.DROP] * 0.5, 0, 1), sw = clamp(P[I.SWIM], 0, 1), dr = P[I.DROLL];
    const tuck = Math.max(sw, clamp(dr, 0, 1)); if (fl > 0 && !(dr > 0)) P[I.GROUND] = Math.max(P[I.GROUND], fl); // (flat on its belly — rolling, it turns about its own length where it is: no settling, or it would bob)
    for (const L of SPL) { const sd = L[2] === 'L' ? 1 : -1, i0 = B[L + '0'] * 3, i1 = B[L + '1'] * 3;
      if (hi > 0) { E[i0 + 2] -= sd * 0.55 * hi; E[i1 + 2] += sd * 0.35 * hi; }
      if (fl > 0) { E[i0 + 2] += sd * 0.25 * fl; E[i0 + 1] += (L[0] === 'f' ? -sd : sd) * 0.3 * fl; }
      if (tuck > 0) { E[i0 + 1] += (sd * (L[0] === 'f' ? 1.1 : -1.1) - E[i0 + 1]) * tuck; E[i0 + 2] *= 1 - tuck; E[i1 + 2] *= 1 - tuck; } }
    OFF[1] += hi * H * 0.32 - fl * H * 0.18 - sw * H * 0.35 + P[I.LIFT] * H;
    if (sw > 0) for (let k = 0; k < 4; k++) E[B['tail' + k] * 3 + 1] += Math.sin(t * hz(1.1) - 0.8 - k * 0.8) * 0.3 * sw * (0.6 + k * 0.25);
    if (dr > 0) { E[r + 2] += st.rollA !== undefined ? st.rollA : t * hz(1.25) * C.side * clamp(dr, 0, 1); for (let k = 0; k < 4; k++) E[B['tail' + k] * 3 + 1] += C.side * 0.25 * clamp(dr, 0, 1); } // (the death roll)
    E[r] += P[I.PITCH]; E[r + 2] += P[I.ROLL]; OFF[2] += P[I.FWD] * form.meta.L;
    if (P[I.ARCH]) { const a = P[I.ARCH]; E[B.spine * 3] += a * 0.5; E[B.chest * 3] += a * 0.3; for (let k = 0; k < 4; k++) E[B['tail' + k] * 3] -= a * 0.25; } // (− the head and the tail up, the belly down)
    const tc = P[I.TCURL]; if (tc) for (let k = 0; k < 4; k++) E[B['tail' + k] * 3 + 1] += tc * 0.35 * C.side;
    const tu = P[I.TUP]; if (tu) { E[B.tail0 * 3] -= tu * 0.3; E[B.tail1 * 3] -= tu * 0.2; }
    if (P[I.SHIV] > 0) E[r + 2] += Math.sin(t * 57) * 0.02 * P[I.SHIV];
    if (P[I.YAW]) { E[B.spine * 3 + 1] += P[I.YAW] * 0.35; E[B.chest * 3 + 1] += P[I.YAW] * 0.3; E[r + 1] -= P[I.YAW] * 0.2; }
    if (P[I.THRASH] > 0) for (const L of SPL) { const i0 = B[L + '0'] * 3; E[i0 + 1] += Math.sin(t * hz(3) + i0) * 0.5 * P[I.THRASH]; E[i0 + 2] += Math.sin(t * hz(2.3) + i0) * 0.4 * P[I.THRASH]; }
    if (P[I.NDOWN] > 0) { E[B.neck0 * 3] += P[I.NDOWN] * 0.25; E[B.head * 3] += P[I.NDOWN] * 0.2; }
    neckLayers();
  };
  // ------------------------------ the frog ------------------------------
  // crouched flat, up on its forelegs (alert), the throat puffed (the call), the leap, the kick of the hind legs, on its back
  FG.frog = function (J0, form, st) {
    J = J0; FORM = form; const t = C.t, H = form.meta.H, r = B.root * 3;
    const cr = clamp(P[I.DROP] * 0.5 + P[I.LIE], 0, 1); OFF[1] -= cr * H * 0.25; E[r] += P[I.PITCH] - P[I.NUP] * 0.4;
    for (const s of 'LR') { const sd = s === 'L' ? 1 : -1; E[B['fl' + s + '0'] * 3] -= P[I.NUP] * 0.5; E[B['fl' + s + '0'] * 3 + 2] += sd * cr * 0.3; }
    OFF[1] += P[I.LIFT] * form.meta.L; E[r + 2] += P[I.ROLL];
    if (P[I.THRASH] > 0) for (const s of 'LR') { const q = Math.sin(t * hz(3.5) + (s === 'L' ? 0 : 1.6)); E[B['hl' + s + '0'] * 3] += -0.8 * P[I.THRASH] * (0.5 + 0.5 * q); E[B['hl' + s + '1'] * 3] += 1.2 * P[I.THRASH] * (0.5 + 0.5 * q); E[B['fl' + s + '0'] * 3] += -0.5 * P[I.THRASH] * q; }
    if (P[I.LEGF] > 0) for (const s of 'LR') { E[B['hl' + s + '0'] * 3] -= 1.0 * P[I.LEGF]; E[B['hl' + s + '1'] * 3] += 1.4 * P[I.LEGF]; E[B['hl' + s + '2'] * 3] -= 1.0 * P[I.LEGF]; }
    neckLayers();
  };
  // ------------------------------ the seals ------------------------------
  // the chest up on the fore flippers (alert, the bark), the banana (the head and the tail flippers raised, basking), on its
  // side (asleep, nursing), the flipper waved, swimming
  FG.seal = function (J0, form, st) {
    J = J0; FORM = form; const t = C.t, H = form.meta.H, r = B.root * 3;
    const up = P[I.NUP] > 0 ? P[I.NUP] : 0, ba = P[I.ARCH] < 0 ? -P[I.ARCH] : 0, sw = clamp(P[I.SWIM], 0, 1);
    E[r] -= up * 0.25; E[B.spine * 3] -= up * 0.25; E[B.chest * 3] -= up * 0.2; E[B.neck0 * 3] += up * 0.2;
    for (const s of 'LR') { E[B['fl' + s + '0'] * 3] -= up * 0.5; E[B['fl' + s + '0'] * 3 + 2] += (s === 'L' ? 1 : -1) * P[I.WOPEN] * (0.6 + 0.4 * Math.sin(t * hz(1.2))); }
    if (ba > 0) { E[B.chest * 3] -= ba * 0.3; E[B.neck0 * 3] -= ba * 0.3; for (let k = 0; k < 4; k++) E[B['tail' + k] * 3] -= ba * 0.25; for (const s of 'LR') E[B['hl' + s + '0'] * 3] -= ba * 0.5; }
    if (sw > 0) { OFF[1] -= sw * H * 0.45; for (const s of 'LR') { E[B['hl' + s + '0'] * 3 + 1] += Math.sin(t * hz(1.2) + (s === 'L' ? 0 : Math.PI)) * 0.4 * sw; E[B['fl' + s + '0'] * 3 + 2] -= (s === 'L' ? 1 : -1) * 0.3 * sw; } }
    E[r] += P[I.PITCH]; E[r + 2] += P[I.ROLL]; OFF[1] += P[I.LIFT] * H; OFF[2] += P[I.FWD] * form.meta.L;
    if (P[I.YAW]) { E[B.spine * 3 + 1] += P[I.YAW] * 0.35; E[B.chest * 3 + 1] += P[I.YAW] * 0.3; }
    if (P[I.THRASH] > 0) for (const s of 'LR') { E[B['fl' + s + '0'] * 3 + 2] += Math.sin(t * hz(3) + (s === 'L' ? 0 : 2)) * 0.5 * P[I.THRASH]; E[B['hl' + s + '0'] * 3 + 1] += Math.sin(t * hz(2.5)) * 0.4 * P[I.THRASH]; }
    if (P[I.NDOWN] > 0) { E[B.neck0 * 3] += P[I.NDOWN] * 0.45; E[B.head * 3] += P[I.NDOWN] * 0.25; }
    neckLayers();
  };

  // ------------------------------ the dead ------------------------------
  // (on its side, limp, the eyes shut, the head on the ground; a carcass a leopard took up a tree drapes over the branch — the
  // front and the hind quarters hanging)
  const DEAD = {};
  DEAD.quad = st => {
    if (st.tree || st.hang) { add(I.STILL, 1); add(I.EYE, 1); add(I.ARCH, 1.3); add(I.NDOWN, 1.3); add(I.JAW, 0.25); add(I.TTUCK, 0.8); P[I.DEAD] = 1;
      for (let k = 0; k < 4; k++) leg(k, k < 2 ? -0.2 : 0.2, -0.6, 0.2, 0.3); return; }
    sideDown(1, C.sideDef || FG.sideOf(C.id)); add(I.JAW, 0.22); add(I.EYE, 1); add(I.TTUCK, 0.3); add(I.NDOWN, 0.2); add(I.EARD, 1); P[I.DEAD] = 1;
  };
  DEAD.bird = () => { add(I.ROLL, (C.sideDef || FG.sideOf(C.id)) * 1.35); add(I.GROUND, 1); add(I.EYE, 1); add(I.WOPEN, 0.4); add(I.NDOWN, 0.6); add(I.NYAW, 0.6); add(I.LIE, 0.6); };
  DEAD.snake = () => { add(I.ROLL, (C.sideDef || FG.sideOf(C.id)) * 2.0); add(I.GROUND, 1); add(I.EYE, 1); add(I.JAW, 0.3); };
  DEAD.sprawl = () => { add(I.ROLL, Math.PI * 0.92 * (C.sideDef || FG.sideOf(C.id))); add(I.GROUND, 1); add(I.EYE, 1); add(I.JAW, 0.2); add(I.LIE, 1); };
  DEAD.frog = () => { add(I.ROLL, Math.PI * 0.95); add(I.GROUND, 1); add(I.EYE, 1); add(I.LEGF, 0.6); };
  DEAD.seal = () => { add(I.ROLL, (C.sideDef || FG.sideOf(C.id)) * 1.4); add(I.GROUND, 1); add(I.EYE, 1); add(I.NDOWN, 0.4); };
  FG.DEAD = DEAD;
})(window.G);
