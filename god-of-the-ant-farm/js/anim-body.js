'use strict';
// ============================================================
//  The body's animator (20a, D-341 to D-344): one for everyone
//  drawn whole — the people of the world and the body the player
//  lives. Each frame it makes the pose from what the body is
//  doing, in layers:
//   · the base: the stride (G.Gait: the walk, the jog, the run,
//     blended phase to phase, the cadence and the stride of the
//     speed) or a posture (standing with its weight shifts and
//     its breath, seated, kneeling, lying, swimming…);
//   · the hands: what they hold and how (Anim.hold: the loads by
//     their grip, the thing in the hand by its catalog's pega);
//   · the action: a clip (anim-clips.js) — the whole body, or
//     only the top over the stride —, its contact on the world's;
//   · the additive: the drink, the tiredness, a limp, the breath.
//  A change of state is eased by the difference it makes, decaying
//  (inertialization): the new pose moves as itself from the first
//  frame, never filtered — the stride is never eaten by a blend.
//  The feet: in the stride they plant and leave by the stride's
//  own clock (the rig, people3d.js); standing they stay where
//  they stand, and step when the body has turned or moved off
//  them — a turn on the spot is steps, never a slide.
//  And the people of the world, as the view draws them (D-338):
//  the corner of a way rounded ahead of it (their v.path, read),
//  the start and the stop eased, the turn with its lean, a change
//  of place inside a building walked — never where they are in
//  the world. Only seen (rule 113): nothing here writes the world
//  or draws from its chance.
// ============================================================
(function (G) {
  const Anim = G.Anim3D, Ga = G.Gait; const TAU = Math.PI * 2;
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x), lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const wrapA = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  // the states of the stride, and the postures whose feet are free (seated, kneeling, lying, in the water, in the air, dancing)
  const LOCO = Anim.LOCO = { walk: 1, run: 1, carryWalk: 1, sneak: 1, wade: 1 };
  // (the stances under which the idle's little things come: standing, seated, resting — the hands free)
  const IDLE = Anim.IDLE = new Set(['idle', 'sit', 'rest']);
  const FREE = Anim.FREE = new Set(['sit', 'eat', 'rock', 'pray', 'rest', 'eatg', 'rockg', 'sleep', 'sick', 'swim', 'tread', 'drown', 'jump', 'fall', 'climb', 'knocked', 'rise', 'crumple', 'dance', 'bound', 'cook']);
  // the channels a change of state eases (the stride's own clocks — the stance, the swing, the foot's pitch on the ground — are
  // the stride's: never eased)
  const CH = ['bob', 'crouch', 'lean', 'twist', 'neck', 'shLp', 'shLr', 'shRp', 'shRr', 'elL', 'elR', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR', 'pelY', 'pelR', 'pelP', 'shift', 'sway', 'lie', 'grip', 'gripL', 'wrist', 'wristL', 'holdW', 'adL', 'adR', 'hyL', 'hyR', 'tyL', 'tyR', 'offW', 'shLy', 'shRy', 'talk', 'breath', 'tilt', 'headR'];
  const NC = CH.length; Anim.CH = CH;
  const REST = Anim.POSE0();
  const RAW = ['stL', 'stR', 'swL', 'swR', 'pgL', 'pgR', 'pitL', 'pitR', 'rel', 'tool', 'prone'];
  // a body's animator memory (the view's own, a body each)
  Anim.memory = () => ({ base: '', st: '', clip: null, t: 0, sinceT: 0, ph: 0, run: false, rw: 0, sp: 0, lastSp: 0, stop: 0, prev: new Float32Array(NC), off: new Float32Array(NC), offT: 1, offD: 0.25, has: false,
    over: null, ok: 0, ow: 0, ck: 0, pu: 0, stepK: 0, stepWait: 0, lean: 0, bank: 0 });
  const TMP = Anim.POSE0();

  // ------------------------------ the base: a posture or the stride ------------------------------
  const RK = Object.keys(REST), RV = RK.map(k => REST[k]); // (the rest pose's keys, listed once: a reset a body a frame is a plain loop)
  function reset(out) { for (let i = 0; i < RK.length; i++) out[RK[i]] = RV[i]; }
  // (a posture of the old table — Anim.pose, ST — copied in, its feet standing: the stance's clocks say both on the ground)
  function posture(out, st, t, sp) { reset(out); const p = Anim.pose(st, t, sp); for (const k in p) out[k] = p[k]; out.stL = out.stR = 1; out.swL = out.swR = -1; out.pgL = out.pgR = -1; return out; }
  // the stride at the mind's phase and speed, and what its kind adds: crouched to sneak, the knees high to wade
  function stride(out, a, st, sp, s, I, go) {
    reset(out);
    Ga.pose(out, a.ph, sp, s, a.rw, go);
    if (st === 'sneak') { out.crouch += 0.2; out.lean += 0.32; out.neck -= 0.12; out.shLp -= 0.35; out.shRp -= 0.3; out.elL += 0.65; out.elR += 0.7; out.shLr += 0.1; out.shRr -= 0.1; out.grip = 0.4; }
    else if (st === 'wade') { const lift = 0.5 * Math.max(0, Math.sin(TAU * a.ph)); out.knL += out.stL ? 0 : 0.5; out.knR += out.stR ? 0 : 0.5; out.shLr += 0.4; out.shRr -= 0.4; out.elL += 0.35; out.elR += 0.35; out.lean += 0.1 + lift * 0; }
    // (leaning into a turn and into the speed it gains — the hips swing out of a curve, the trunk bows as it speeds up)
    out.sway += a.bank; out.lean += a.lean;
    return out;
  }

  // ------------------------------ the feet standing: steps, never a slide ------------------------------
  // where a foot stands at rest under a body facing yaw at X, Z: its ankle a hand to its side, the toes a little out; its heel
  // point and its way, for the rig (L.plant: x, z, dx, dz, y)
  const REST_W = 0.1, TOE_OUT = 0.12;
  function restOf(k, X, Z, yaw, s, wide, fwd, o) {
    const sd = k ? -1 : 1, c = Math.cos(yaw), n = Math.sin(yaw); // (the body's forward (c, n); its left (n, −c))
    const lat = sd * (wide || REST_W) * s, f = (fwd || 0) * s, ax = X + c * f + n * lat, az = Z + n * f - c * lat;
    const fy = yaw + sd * TOE_OUT; o.dx = Math.cos(fy); o.dz = Math.sin(fy); o.x = ax - o.dx * 0.062 * s; o.z = az - o.dz * 0.062 * s; return o;
  }
  const RO = { x: 0, z: 0, dx: 0, dz: 0 };
  function feetStanding(a, L, I, dt, mode, stance) {
    const P = L.plant; if (!P) return;
    const s = I.s, wide = stance ? stance[0] : 0, fA = stance ? stance[1] : 0, fB = stance ? stance[2] : 0;
    for (let k = 0; k < 2; k++) P[k].mode = mode;
    if (mode !== 'plant') { for (const ft of P) ft.step = null; return; }
    // (a step under way: on to its end, then the foot stands where it went)
    for (let k = 0; k < 2; k++) { const ft = P[k]; if (!ft.step) continue; ft.step.t += dt / ft.step.dur;
      if (ft.step.t >= 1) { const q = ft.step; ft.step = null; ft.on = 1; ft.off = 0; ft.x = q.x; ft.z = q.z; ft.dx = q.dx; ft.dz = q.dz; ft.y = q.y; ft.pmin = -9; ft.gp = q.gp || 0; a.stepWait = 0.06; } }
    if (P[0].step || P[1].step) return;
    if ((a.stepWait -= dt) > 0) return;
    // (the foot most off its place steps — from where it stands, or from where it hangs if it is in the air)
    let best = -1, bad = 0;
    for (let k = 0; k < 2; k++) {
      const ft = P[k]; restOf(k, I.X, I.Z, I.yaw, s, wide, k ? fB : fA, RO);
      let e;
      if (!ft.on) e = 9; else { const d = Math.hypot(ft.x - RO.x, ft.z - RO.z), da = Math.abs(wrapA(Math.atan2(ft.dz, ft.dx) - Math.atan2(RO.dz, RO.dx))); e = Math.max(d / (0.2 * s), da / 0.6); }
      if (e > 1 && e > bad) { bad = e; best = k; }
    }
    if (best < 0) return;
    const ft = P[best]; restOf(best, I.X, I.Z, I.yaw, s, wide, best ? fB : fA, RO);
    const ax = ft.cx !== undefined ? ft.cx : RO.x, ay = ft.cy !== undefined ? ft.cy : (I.ground || 0) + 0.044 * s, az = ft.cz !== undefined ? ft.cz : RO.z;
    const gy = L.gnd ? L.gnd(RO.x, RO.z) : undefined; const y = Number.isFinite(gy) ? gy : I.ground || 0;
    const dist = Math.hypot(RO.x - ax, RO.z - az);
    // (and the ground's slope along it, where it stands)
    const gb = L.gnd ? L.gnd(RO.x + RO.dx * 0.184 * s, RO.z + RO.dz * 0.184 * s) : undefined, gp = Number.isFinite(gb) ? Math.atan2(y - gb, 0.184 * s) : 0;
    ft.step = { t: 0, dur: clamp(0.24 + dist * 0.35, 0.26, 0.42), ax, ay, az, adx: ft.on ? ft.dx : ft.cdx || RO.dx, adz: ft.on ? ft.dz : ft.cdz || RO.dz, x: RO.x, z: RO.z, dx: RO.dx, dz: RO.dz, y, gp: Math.abs(gp) < 0.6 ? gp : 0, h: clamp(0.03 + dist * 0.12, 0.035, 0.08) };
    ft.on = 0; ft.off = 0;
  }
  Anim.restOf = restOf;

  // ------------------------------ a frame of a body ------------------------------
  // I (the caller's, reused): st (the state: a stride's, a posture's, a clip's), t (a posture's own clock, s), sp (m/s), yaw,
  // yawV (rad/s), acc (m/s², forward), X, Z, ground, s (size), run (1: the stride is a run whatever the speed), over (a clip
  // played over the top of the body, whatever the base), clipK (the clip's time from the world: 0..1, or undefined: its own),
  // tired, drunk, id; L: the look (its plant: the feet, its gnd). Writes the pose into `out`
  Anim.drive = function (a, I, out, L, dt) {
    dt = Math.max(0, Math.min(dt || 0, 0.1)); a.t += dt;
    const s = I.s || 1, sp = Math.max(0, I.sp || 0); let st = I.st || 'idle';
    // (the stride's size is the leg's: a child's short legs step as short legs do — the cadence and the stride of their length, by
    // the Froude number, and the foot standing still under them; D-639, D-614)
    const sg = s * (L && L.legK > 0 ? L.legK : 1);
    // (the clip of the state — the left-handed one's twin where it has one: I.lefty, D-596)
    const C = Anim.CLIPS && ((I.lefty && Anim.CLIPS[st + '~m']) || Anim.CLIPS[st]);
    // (the porte the reader gives — eased in the memory — and the stride's options it asks: the legs and the pace go by the stride)
    if (Anim.porteEase) Anim.porteEase(a, I, dt);
    // (away from another in step with them — the reader's I.push, −1..1, eased in a third of a second: the stride by its cadence, a
    // gesture by its clock; D-599)
    a.pu = (a.pu || 0) + ((I.push || 0) - (a.pu || 0)) * (1 - Math.exp(-dt / 0.3)); if (Math.abs(a.pu) < 1e-3) a.pu = 0;
    const go = Anim.gaitOpts ? Anim.gaitOpts(a, I) : I.tired ? { arms: 1 - 0.45 * I.tired, lean: 0.06 * I.tired } : null;
    // (the body's lean into its turns and into the speed it gains or loses — eased, only seen)
    a.bank += (clamp((I.yawV || 0) * sp * 0.035, -0.2, 0.2) - a.bank) * (1 - Math.exp(-8 * dt));
    a.lean += (clamp((I.acc || 0) * 0.03, -0.14, 0.18) - a.lean) * (1 - Math.exp(-6 * dt));
    // the base: the stride, a posture, or a clip's own base — and its stop: a stride that ends goes on until its swinging foot
    // is down, its speed easing out, the last step a short one under the body
    let base = LOCO[st] && sp > 0.08 ? 'move' : C ? C.base || 'idle' : st;
    if (base !== 'move' && a.base === 'move') {
      const P = L.plant, down = !P || (P[0].on && P[1].on) || a.stop > 0.7 || FREE.has(base) || st === 'jump' || st === 'fall' || st === 'swim';
      if (!down) { base = 'move'; a.stop += dt; } else a.stop = 0;
    } else a.stop = 0;
    const was = a.base, wasClip = a.clip; a.base = base; a.st = st; a.clip = C || null;
    // the stride: its gait (the run past its margin, the walk under its own, a crossfade of a third of a second between, phase to
    // phase), its speed (easing out in a stop), its phase at the cadence of that speed
    if (base === 'move') {
      const goal = I.run ? true : I.walk ? false : Ga.mode(a.run, sp, sg); a.run = goal;
      a.rw += ((goal ? 1 : 0) - a.rw) * (1 - Math.exp(-dt / 0.12)); if (Math.abs(a.rw - (goal ? 1 : 0)) < 1e-3) a.rw = goal ? 1 : 0;
      // (the speed the stride is made for: the body's, eased — a speed that jumps (a road's edge, a sprint let go) is a stride that
      // grows or shortens over a step, never in a frame)
      const tv = a.stop > 0 ? Math.max(0.25, a.lastSp * Math.exp(-a.stop * 6)) : sp; if (was !== 'move') a.vs = tv;
      a.vs = clamp(tv, (a.vs || 0) - 7 * dt, (a.vs || 0) + 6 * dt); const v = a.vs; a.sp = v; if (!a.stop) a.lastSp = sp;
      if (was !== 'move') {
        // (a start: the foot behind leads — the one further back along the way the body goes; the stride's phase where that
        // foot's swing begins)
        const P = L.plant; let k = 1;
        if (P && P[0].on && P[1].on) { const c = Math.cos(I.yaw), n = Math.sin(I.yaw); k = (P[0].x - I.X) * c + (P[0].z - I.Z) * n < (P[1].x - I.X) * c + (P[1].z - I.Z) * n ? 0 : 1; }
        // (and a little on or back by the id: two who set off in the same frame do not walk in step — D-599)
        a.ph = Ga.startPhase(k, Math.max(v, 0.8), sg, a.rw) + 0.12 * (G.hash((I.id || 0) * 59 + 11) - 0.5);
      }
      a.ph += Ga.freq(v, sg, a.rw) * Ga.cad(go) * dt;
      stride(out, a, st, v, sg, I, go);
    } else {
      // (a posture's own clock — its breath, its weight shifts —, or the clip's base standing)
      posture(out, base, I.t !== undefined ? I.t : a.t, sp);
      if (C) playClip(out, a, C, I, dt, 1);
    }
    // the hands: the loads by their grip and the reach for a point (Anim.hold — the rig takes the hands there)
    if (Anim.hold) Anim.hold(out, L, base === 'move' ? (st === 'run' ? 'run' : st === 'carryWalk' ? 'carryWalk' : 'walk') : st, base === 'move' ? a.ph * TAU : I.t !== undefined ? I.t : a.t, a.sp || sp);
    // a clip over the top (a wave, a word while walking; the next wave's blows): faded in and out by its own times — or, standing,
    // seated or resting with the hands free and nothing else over it, the little thing of this moment (the idle: anim-ocio.js, its
    // time on the world's clock, I.ctx the reader's weights; D-599)
    let ovk = I.over, ovu = I.overK; a.oc = null;
    if (!ovk && I.ctx && Anim.ocioAt && !C && IDLE.has(base)) { const o = Anim.ocioAt(I.id || 0, I.clock || 0, I.ctx, I.lod || 0); if (o) { ovk = Anim.ocioClip ? Anim.ocioClip(o.k, I.id || 0, L) : o.k; ovu = o.u; a.oc = ovk; a.ocU = o.u; } }
    const O = ovk && Anim.CLIPS ? (I.lefty && Anim.CLIPS[ovk + '~m']) || Anim.CLIPS[ovk] : null;
    // (the clip over the top on a clock of its own, a.ok: a wave over a seated meal does not start the meal's clip again — L-1771)
    if (O && O !== a.over) { a.over = O; a.ok = 0; }
    a.ow = clamp(a.ow + (O ? dt / Math.max(0.01, O.bin) : -dt / Math.max(0.01, a.over ? a.over.bout : 0.2)), 0, 1);
    if (a.over && a.ow > 0) { const u = ovu !== undefined && O ? ovu : (a.ok += dt / a.over.dur); Anim.playClip(out, a.over, u, sstep(0, 1, a.ow)); }
    if (!O && a.ow <= 0) a.over = null;
    // the additive: the porte (the years, the cold, the grief… — anim-porte.js), the drink in the body (Anim.stagger), the tiredness
    if (Anim.porte && a.pz) Anim.porte(a, I, out, base, C);
    if (I.drunk > 0 && Anim.stagger) Anim.stagger(out, a.t, I.id || 0, I.drunk, base === 'move' ? 'walk' : st);
    if (I.tired > 0 && base !== 'move') { out.lean += 0.06 * I.tired; out.neck += 0.1 * I.tired; }
    // a change of state: the difference it makes, eased out (the new pose moving as itself from the first frame)
    if (a.has && (base !== was || (C || null) !== wasClip)) {
      const D = base === 'move' || was === 'move' ? 0.22 : C ? C.bin : wasClip ? wasClip.bout : FREE.has(base) || FREE.has(was) ? 0.4 : 0.3;
      for (let i = 0; i < NC; i++) { const j = CH[i]; a.off[i] = a.prev[i] + a.off[i] * fall(a.offT / a.offD) - (out[j] || 0); }
      a.offT = 0; a.offD = D;
    }
    if (a.offT < a.offD) { a.offT += dt; const f = fall(a.offT / a.offD); for (let i = 0; i < NC; i++) if (a.off[i]) out[CH[i]] += a.off[i] * f; }
    for (let i = 0; i < NC; i++) a.prev[i] = out[CH[i]] || 0;
    a.has = true;
    // the feet: the stride's own clock in a stride; standing, kept where they stand, stepping when the body has left them
    const feet = base === 'move' ? 'gait' : C ? C.feet : FREE.has(base) ? 'free' : 'plant';
    if (feet === 'gait') { if (L.plant) for (const ft of L.plant) { ft.mode = 'gait'; ft.step = null; } }
    else feetStanding(a, L, I, dt, feet, C ? C.stance : null);
    return out;
  };
  // (how much of a change of state is left t of the way through it: 1 → 0, a quintic — eased in and out)
  const fall = t => (t >= 1 ? 0 : t <= 0 ? 1 : 1 - t * t * t * (t * (t * 6 - 15) + 10));
  // a clip on the base: its time from the world (I.clipK) or its own clock
  // (a gesture of no world's stroke goes at each one's own pace — I.tempo, the reader's — and never quite even: a little quicker,
  // a little slower, in a swell of three to six seconds of the world's clock that is each one's own by the id; two people never
  // move in step for long, D-599 — and drawing away from another in step with them, a.pu; the world's strokes keep the world's clock)
  function playClip(out, a, C, I, dt, w) {
    let u; if (I.clipK !== undefined) u = I.clipK; else { const id = I.id || 0; const j = I.tempo ? (1 + 0.03 * (I.tempo - 1) / 0.08) * (1 + 0 * Math.sin(TAU * (I.clock || 0) / (3 + 3 * G.hash(id * 41 + 1)) + TAU * G.hash(id * 43 + 2))) : 1; a.ck = (a.ck || 0) + dt / C.dur * (j + 0.5 * (a.pu || 0)); u = a.ck; }
    Anim.playClip(out, C, u, w); out.tool = C.item ? 1 : out.tool;
  }

  // ------------------------------ the people of the world, as the view draws them ------------------------------
  // Where someone is drawn, from where the world has them (X, Z, metres): the same place, but for what the drawing smooths —
  // a corner of their way rounded ahead of it (their path, read), a start eased in (a little behind them for a moment, then
  // caught up), a stop eased out (slowing to where the way ends, never past it), a change of place inside a building walked.
  // Never more than ~0.6 m from the world's place; a jump of the world (a teleport, a load) is drawn as a jump. Writes the
  // view's memory s: X, Z, vx, vz, sp, yaw, yawV, acc
  const HN = 64;
  Anim.track = function (s, v, X, Z, inside, dt, TL) {
    dt = Math.max(1e-4, Math.min(dt, 0.1));
    let tr = s.tr;
    // (the first frame, or the world moved them far in one — a teleport, a load, a change of storey —: drawn where the world has
    // them, the way begun again from there)
    const jump = tr ? Math.hypot(X - tr.wx, Z - tr.wz) : 0;
    if (!tr || jump > (inside ? 6 : 4) || s.snap) {
      s.snap = 0; tr = s.tr = tr || { hx: new Float32Array(HN), hz: new Float32Array(HN), hd: new Float64Array(HN), n: 0, dw: 0, dd: 0, vd: 0, wx: X, wz: Z, ws: 0 };
      tr.n = 1; tr.hx[0] = X; tr.hz[0] = Z; tr.hd[0] = 0; tr.dw = tr.dd = 0; tr.vd = 0; tr.wx = X; tr.wz = Z; tr.ws = 0; s.X = X; s.Z = Z; s.vx = s.vz = 0; s.sp = 0; s.acc = 0; return s;
    }
    // (the world's way so far: where they were, with how far along it each point is — the drawn place goes along it, behind)
    // (the world's speed, smoothed: the world loses a bit of a step at each point of a way — the drawing keeps the pace)
    tr.dw += jump; tr.wx = X; tr.wz = Z; tr.ws = (tr.ws === undefined ? jump / dt : tr.ws + (jump / dt - tr.ws) * (1 - Math.exp(-dt / 0.12))); const ws = tr.ws;
    const li = (tr.n - 1) % HN; if (Math.hypot(X - tr.hx[li], Z - tr.hz[li]) > 0.02) { const i = tr.n % HN; tr.hx[i] = X; tr.hz[i] = Z; tr.hd[i] = tr.dw; tr.n++; }
    // (how far the world's way still goes: where it ends they stop — the drawing slows to it in time)
    let rem = Infinity; const TLs = TL || 4;
    if (!inside && v.path && v.pi < v.path.length) { rem = 0; let px = X / TLs, py = Z / TLs; for (let i = v.pi; i < v.path.length && rem < 4; i++) { const q = v.path[i]; rem += Math.hypot(q[0] - px, q[1] - py) * TLs; px = q[0]; py = q[1]; } }
    else if (!inside && (!v.moving || (v.path && v.path.length && Math.hypot(v.path[v.path.length - 1][0] * TLs - X, v.path[v.path.length - 1][1] * TLs - Z) < 0.05))) rem = 0; // (stopped, or on the last point of a way gone through)
    // (the drawn speed: the world's, catching up what it is behind, never faster than a stop allows, never a jump in speed; a
    // change of place inside a building at a walk)
    const A_UP = 3.2, A_DN = 4.5, lag = tr.dw - tr.dd;
    let want = ws + 2.4 * (lag - Math.min(0.06, 0.03 * ws)); // (a few centimetres behind, always: the world's little stops are not drawn)
    // (to the way's end: braking at half what a stop allows, and the last hand's breadth eased in — a speed that falls with the
    // distance left, never braking harder than a stop can: the body never arrives still moving and halts in a frame, L-1113)
    if (rem < Infinity) { const dE = Math.max(0, rem + lag); want = Math.min(want, Math.sqrt(A_DN * dE), 6 * dE); }
    if (inside) want = Math.min(want, 1.35);
    let vd = clamp(want, tr.vd - A_DN * dt, tr.vd + A_UP * dt); vd = Math.max(0, vd);
    tr.dd = Math.min(tr.dw, tr.dd + vd * dt);
    // (never more than ~0.6 m behind out of doors: caught up at once beyond — the world's place is the truth)
    const MAXL = inside ? 6 : 0.6; if (tr.dw - tr.dd > MAXL) tr.dd = tr.dw - MAXL;
    tr.vd = vd;
    // (the drawn place: on the world's way, as far along it as the drawn has come)
    let px = X, pz = Z; const oldest = Math.max(0, tr.n - HN);
    if (tr.dd < tr.dw - 1e-5) {
      // (the points of the way, oldest to newest, and the world's place now after them: the segment the drawn distance falls in)
      if (tr.dd <= tr.hd[oldest % HN]) { px = tr.hx[oldest % HN]; pz = tr.hz[oldest % HN]; tr.dd = tr.hd[oldest % HN]; }
      else {
        let j = tr.n - 1; while (j > oldest && tr.hd[j % HN] > tr.dd) j--;
        const a = j % HN, last = j === tr.n - 1; const d0 = tr.hd[a], d1 = last ? tr.dw : tr.hd[(j + 1) % HN];
        const bx = last ? X : tr.hx[(j + 1) % HN], bz = last ? Z : tr.hz[(j + 1) % HN]; const f = d1 > d0 ? clamp((tr.dd - d0) / (d1 - d0), 0, 1) : 1;
        px = tr.hx[a] + (bx - tr.hx[a]) * f; pz = tr.hz[a] + (bz - tr.hz[a]) * f;
      }
    }
    // (a corner of the way rounded: within a stride of a corner of their path, the drawn place is on a curve from before it to
    // after it — the body turning into it ahead, as people do)
    if (!inside && v.path && v.path.length > 1) { const o = Math.max(0, tr.n - HN) % HN; RA[0] = tr.hx[o] / TLs; RA[1] = tr.hz[o] / TLs; const r = roundCorner(v, px / TLs, pz / TLs, TLs, RA); if (r) { px = r[0] * TLs; pz = r[1] * TLs; } }
    // (the drawn velocity, speed, turn: what the legs and the lean must show)
    const vx = (px - s.X) / dt, vz = (pz - s.Z) / dt, sp = Math.hypot(vx, vz);
    s.acc = (sp - (s.sp || 0)) / dt; s.X = px; s.Z = pz; s.vx = vx; s.vz = vz; s.sp = sp;
    return s;
  };
  // (the corner of a path near a point (tiles): its rounded place, or null. The corners are the path's own points; r a stride)
  const RC = [0, 0], RA = [0, 0];
  function roundCorner(v, x, y, TL, A0) {
    const P = v.path; const r = 0.75 / TL; let best = null, bd = r;
    for (let i = Math.max(0, v.pi - 2); i <= Math.min(P.length - 2, v.pi + 1); i++) {
      const C = P[i], A = i > 0 ? P[i - 1] : A0, B = P[i + 1]; // (the way's first corner: the way in is the one they came by)
      const ax = C[0] - A[0], ay = C[1] - A[1], la = Math.hypot(ax, ay), bx = B[0] - C[0], by = B[1] - C[1], lb = Math.hypot(bx, by);
      if (la < 1e-4 || lb < 1e-4) continue;
      const rr = Math.min(r, i > 0 ? la * 0.45 : r, lb * 0.45); // (the way in they came by: only its direction counts)
      const d = Math.hypot(x - C[0], y - C[1]); if (d > rr || d > bd) continue;
      const ux = ax / la, uy = ay / la, wx = bx / lb, wy = by / lb; if (ux * wx + uy * wy > 0.995) continue; // (straight on: no corner)
      // (which side of the corner the point is on: before it along the way in, or after it along the way out)
      const din = (C[0] - x) * ux + (C[1] - y) * uy, dout = (x - C[0]) * wx + (y - C[1]) * wy;
      const t = (rr - clamp(din, 0, rr) + clamp(dout, 0, rr)) / (2 * rr); // (continuous through the corner itself)
      const Ex = C[0] - ux * rr, Ey = C[1] - uy * rr, Xx = C[0] + wx * rr, Xy = C[1] + wy * rr, q = 1 - t;
      const qx = q * q * Ex + 2 * t * q * C[0] + t * t * Xx, qy = q * q * Ey + 2 * t * q * C[1] + t * t * Xy;
      if (!G.W.walkableXY || G.W.walkableXY(qx, qy)) { RC[0] = qx; RC[1] = qy; best = RC; bd = d; }
    }
    return best;
  }
  // the way someone faces as the view draws them: where they go when they go (eased, a turn a few radians a second at most);
  // standing, where the world turns them (their fx, fy — to the one they talk to), or the place's own turn
  Anim.face = function (s, v, place, dt) {
    let want = null, rate = 7;
    if (place) { want = place.yaw; rate = 5; }
    else if (s.sp > 0.12) want = Math.atan2(s.vz, s.vx);
    else if (v && (v.fx || v.fy) && !v.moving) { want = Math.atan2(v.fy, v.fx); rate = 3.5; }
    const y0 = s.yaw; if (want === null) { s.yawV = 0; return s.yaw; }
    const da = wrapA(want - s.yaw), k = 1 - Math.exp(-(place ? 12 : 9) * dt), step = clamp(da * k, -rate * dt, rate * dt);
    s.yaw = wrapA(s.yaw + step); s.yawV = dt > 0 ? wrapA(s.yaw - y0) / dt : 0; return s.yaw;
  };
})(window.G);
