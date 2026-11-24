'use strict';
// ============================================================
//  Avatar: the body under the player's hands — the character
//  controller. It moves the real person (v.x, v.y are written
//  here, in tiles, every step: the god sees them walk where the
//  player walks) by the world's own rules of where one can
//  stand (Space.surface → W.walkable), on the world's own ground
//  (W.hAt; a bridge's deck; a ford's bed), at the person's own
//  pace (Possess.caps: their age, a lost leg, sickness; the run
//  and the jump are capabilities, not assumptions).
//  It runs on a fixed step of its own (1/60 s, an accumulator;
//  the picture is interpolated between steps), so the feel of
//  it does not change with the frame rate. A body is in one
//  locomotion state at a time — on the ground, in the air,
//  asleep, busy with its hands — each a small table of what it
//  does; swimming, climbing and gliding will be new rows of that
//  table, not a new controller.
//  Feel (Part 22): acceleration and braking, a body that turns
//  toward where it goes instead of snapping, coyote time and a
//  jump buffer, gravity with weight, a landing that bends the
//  knees, sliding along walls instead of sticking to them, and
//  steps small enough to walk up without jumping.
//  The movement of a third-person game (20b, D-355 to D-369):
//  three gaits — the walk, the jog the keys give, the sprint
//  that tires and ends gently —, analog on a stick; a body that
//  speeds up, brakes and curves with its weight but never late,
//  that turns quickly standing and wide running, and pivots on a
//  reversal; strafing round a target held or while aiming; the
//  crouch, the dodge; corners slid round, trees and posts slid
//  past, a ledge taken only when the player jumps at it; and the
//  picture smooth between steps — the yaw interpolated, a step
//  up or down eased in the drawn height (where the feet stand in
//  the world unchanged). What the animation reads: Av.motion().
// ============================================================
(function (G) {
  const W = G.W; const T = G.T;
  const Av = G.Avatar = { on: false };
  const TAU = Math.PI * 2;
  const wrap = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  // what the feel is made of (every number here is a knob: the dev panel and the menu can turn them)
  const TUNE = Av.TUNE = {
    accel: 15, brake: 19, airAccel: 3.5, turn: 10, gravity: 21, coyote: 0.12, buffer: 0.14, stepUp: 0.6, radius: 0.32,
    runDrain: 20, staminaRegen: 16, jumpCost: 9, sneak: 0.45, wade: 0.58, road: 1.12, hurtFall: 6.5, step: 1 / 60,
    climbMax: 2.6, climbWait: 0.22, stoneStep: 0.35,
    // (the furniture, D-734: how far the body's circle — the shoulders', 0.32 — may stand in a piece: a hair in a tall one; in one under
    // pieceLowH, where the hips meet it — half as wide as the shoulders —, the circle's rim beyond them)
    pieceSlack: 0.03, pieceLow: 0.12, pieceLowH: 1.1,
    // (the gaits, 20b: the jog and the sprint as times the walk of an adult — the young and the old less, Possess.caps.run —;
    // the rates at a standstill and near the sprint's top; the turn's top speed standing and sprinting, rad/s; the sideways
    // part of a change of way, near the top: a curve, not a snap)
    jog: 1.7, sprint: 2.95, accelHi: 6, brakeHi: 10, lateral: 18, lateralHi: 7, turnSlow: 13, turnFast: 4.4, turnAir: 0.45,
    // (the breath: the sprint spends it, the jog does not; it comes back after a moment, slower on the jog; spent out, no
    // sprint again until this share of it is back — the hysteresis; the last share of it slows the sprint down to the jog)
    sprintDrain: 13, regen: 20, regenJog: 9, regenDelay: 0.6, winded: 0.4, tire: 0.2,
    // (the fall heavier than the rise; the crouch's pace; the dodge — its costs and the moment after it; the drawn height eased
    // over a step — a spring with no bounce, rad/s: half of a step in 0,08 s, all of it in 0,25 —; a reversal at speed pivots)
    fallGrav: 1.4, crouch: 0.5, rollCost: 16, sideCost: 11, backCost: 9, dodgeCD: 0.22, stepEase: 22, pivotT: 0.3,
    // (the water: how deep — in body heights — before the feet leave the bed and the body swims, and before they find it again;
    // the swim's pace, the breath it spends — swimming, racing, treading water — and how quickly one out of breath drowns)
    swimIn: 0.66, swimOut: 0.56, swimSpeed: 0.56, swimFast: 1.6, swimDrain: 2.2, swimFastDrain: 6.5, treadDrain: 1.1, strokeCost: 6, drownHurt: 9, wadeDrag: 0.5,
  };
  try { const o = JSON.parse(localStorage.getItem('gotaf-tune') || 'null'); if (o && typeof o === 'object') for (const k in o) if (k in TUNE && Number.isFinite(o[k]) && k !== 'step') TUNE[k] = o[k]; } catch (e) { }
  Av.saveTune = () => { try { localStorage.setItem('gotaf-tune', JSON.stringify(TUNE)); } catch (e) { } };

  let b = null; // the body's motion (the view's memory of a moving body; the person's place is the world's)
  // (the acts whose hands are at something else: what was held waits on the ground beside the body)
  const HANDS_AT = new Set(['swing', 'fight', 'low', 'pray', 'sit', 'rest', 'hug', 'dance', 'sleep', 'climb', 'throw', 'eat', 'drink']);
  // (the body's doings the controller writes — v.act — and so takes back when the act ends; another's — a fight's — stays. An act's
  // vact is one of these)
  const VACT = new Set(['swim', 'dance', 'chop', 'mine', 'gather', 'eat', 'pray', 'fish', 'lift', 'arrange', 'give', 'sneak']);
  Av.VACT = VACT; // (the second wave's works add the vacts of their acts: trabalho.js — the minimum, D-463)
  G.worldHooks.push(() => { b = null; Av.on = false; });
  Av.state = () => b;
  // the player's wishes, filled by the input each frame (axes relative to the camera)
  // (20b: mx, mz analog — the length of the push is how fast, up to the jog; run the sprint held; walk the walk kept to; jump,
  // dodge and crouch one press each, taken by the step; aim the aim held; lock the point of the target held — Cam3D —, metres;
  // sneak is the crouch the body is in, written back for the drawing)
  const IN = Av.input = { mx: 0, mz: 0, run: false, jump: false, sneak: false, camYaw: 0, walk: false, dodge: false, crouch: false, aim: false, lock: null };

  const TL = () => G.Space.TILE, HM = () => G.Space.HM;
  // the ground the feet stand on at a point: a bridge's deck over the water, the bed of a ford, the land
  function floorAt(X, Z) {
    const x = X / TL(), y = Z / TL();
    // (in a building whose plan is made — and on its doorstep: the plan's floor, on the storey the body would be on there)
    const ins = indoorAt(X, Z); if (ins) return ins.y;
    // (the land, a bridge's deck or the ice, the bed of a river or a lake under its water: the world's one rule for the ground
    // the feet stand on — Space.footAt, the one the steps before a door are reckoned from, L-325)
    const h = G.Space.footAt(x, y); if (!W.inb(x, y)) return h;
    // (the steps before a door that come down into the street are ground the feet stand on — L-163 —, on a bridge's deck too)
    const sp = G.Space.stepTop(X, Z);
    if (G.Space.deckAt(x, y) > -Infinity) return Math.max(h, sp); // (a bridge's deck, the ice)
    // (a boulder is ground too: the feet stand on its faces)
    const st = Math.max(G.Space.stoneTop(X, Z), sp);
    return st > h ? st : h;
  }
  Av.floorAt = floorAt;
  // ------------------------------ indoors: a building's plan (G.Interiors, through Space) ------------------------------
  // (a point of a building whose plan is made, as this body meets it: on the storey it would be on there — Space.indoor)
  function indoorAt(X, Z) { return G.Space.indoor ? G.Space.indoor(X, Z, b ? lvTo(X, Z) : undefined, b && b.inB ? b.inB.id : 0) : null; }
  // the storey a point is reached on from where the body is (b.lv, the one it stands on): off the top of the flight it climbs,
  // the storey above; from a landing onto the flight that comes up to it, down that flight; else its own
  function lvTo(X, Z) {
    void X; void Z; return b.lv;
  }
  // down a flight by hand (the hatch opened over it): from near its landing, on the storey it comes up to — its id; false when
  // the body is not there
  Av.down = function (id) { if (!b || !b.inP) return false; const s = b.inP.stairs.find(q => q.id === id); if (!s || s.lv1 !== b.lv) return false; b.stairHit = s; return takeFlight(0, 0); };
  // up a flight by hand, from its foot
  Av.up = function (id) { if (!b || !b.inP) return false; const s = b.inP.stairs.find(q => q.id === id); if (!s || s.lv0 !== b.lv || !atFoot(s)) return false; b.stairHit = s; return takeFlight(s.dir[0], s.dir[1]); };
  Av.ups = function () { if (!b || !b.inP || !b.inB || b.loco !== 'ground') return []; return b.inP.stairs.filter(q => q.kind !== 'degraus' && q.lv0 === b.lv && atFoot(q)); };
  // (the flights the body could go down from where it stands: on their upper storey, by their landing)
  Av.downs = function () { if (!b || !b.inP || !b.inB || b.loco !== 'ground') return []; const L = TL(); const x = b.X - b.inB.x * L, z = b.Z - b.inB.y * L; return b.inP.stairs.filter(q => q.kind !== 'degraus' && q.lv1 === b.lv && past(q, x, z, 1.4)); };
  // (a point past a flight's top end — beyond its far edge along the climb, across its width — within d of it)
  function past(s, x, z, d) {
    const r = s.r, dx = s.dir[0], dz = s.dir[1];
    if (dx) { const e = dx > 0 ? x - r[2] : r[0] - x; return e >= -0.02 && e < d && z > r[1] - 0.12 && z < r[3] + 0.12; }
    const e = dz > 0 ? z - r[3] : r[1] - z; return e >= -0.02 && e < d && x > r[0] - 0.12 && x < r[2] + 0.12;
  }
  // the flight the body pushes into, taken: from its foot along its climb, up; from its landing against it, down — the path
  // (the foot, the top, the landing — Interiors' a and b) and its time: a stair at a walk, a ladder hand over hand
  function takeFlight(wx, wz) {
    const B = b.inB, p = b.inP; if (!B || !p || b.loco !== 'ground') return false; const L = TL(); const x = b.X - B.x * L, z = b.Z - B.y * L; const e = G.Space.planEntry(B.id); if (!e) return false;
    const lvY = lv => e.y0 + (p.levels.find(q => q.lv === lv) || { y: 0 }).y + G.Space.FLOOR_UP;
    // (the flight the body ran into, only: up from its foot along its climb, or down from its landing)
    for (const s of p.stairs) {
      if (s.kind === 'degraus' || s !== b.stairHit) continue; const along = wx * s.dir[0] + wz * s.dir[1]; const r = s.r, dx = s.dir[0], dz = s.dir[1];
      const mid = dx ? [(r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2]; const at = t => (dx ? [(dx > 0 ? r[0] : r[2]) + dx * t, mid[0]] : [mid[0], (dz > 0 ? r[1] : r[3]) + dz * t]);
      // (by its class, D-086: a ladder hand over hand; a steep stair climbed facing it, a hand on the steps, slower than a
      // stair; a stair and steps at a walk — the class the plan gives it, the kind where an older plan has none)
      const len = dx ? r[2] - r[0] : r[3] - r[1]; const cls = s.cls || (s.kind === 'escada-de-mao' ? 'mao' : 'escada'); const lad = cls === 'mao' || cls === 'ingreme'; const y0 = lvY(s.lv0), y1 = lvY(s.lv1);
      const T = cls === 'mao' ? Math.abs(y1 - y0) / 0.55 : cls === 'ingreme' ? Math.abs(y1 - y0) / 0.45 + 0.4 : Math.hypot(len, y1 - y0) / Math.max(0.6, b.caps.walk * 0.55);
      const foot = at(0), top = at(len), land = [s.b[0], s.b[1]]; const W3 = (q, y) => [B.x * L + q[0], B.y * L + q[1], y];
      let P = null, lv = s.lv0;
      if (b.lv === s.lv0 && atFoot(s) && along > 0.4) { P = [[b.X, b.Z, b.Y], W3(foot, y0), W3(top, y1), W3(land, y1)]; lv = s.lv1; }
      else if (b.lv === s.lv1 && ((wx === 0 && wz === 0) || (along < -0.4 && G.Interiors && G.Interiors.grandWell && G.Interiors.grandWell(s))) && past(s, x, z, 1.4)) { P = [[b.X, b.Z, b.Y], W3(land, y1), W3(top, y1), W3(foot, y0), W3(s.a, y0)]; lv = s.lv0; }
      if (!P) continue;
      // (the times along it: steps on the level at a walk, the flight in its own time)
      const wk = Math.max(0.5, b.caps.walk * 0.6); P[0][3] = 0;
      for (let k = 1; k < P.length; k++) { const flat = Math.abs(P[k][2] - P[k - 1][2]) < 0.05; P[k][3] = P[k - 1][3] + (flat ? Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]) / wk : T); }
      b.flight = { P, T: P[P.length - 1][3], t: 0, lv, s: s.id, lad, up: lv === s.lv1, along: +along.toFixed(2), from: [+x.toFixed(2), +z.toFixed(2)] }; b.loco = 'stair'; Av.lastFlight = b.flight; { const f = lad || lv === s.lv1 ? 1 : -1; turnTo(Math.atan2(dz * f, dx * f), 12); } b.vx = b.vz = 0; // (down a ladder or a steep stair, facing it — turned to it, never snapped: D-358)
      return true;
    }
    return false;
  }
  // (the body at the foot of a flight, before its first step, across its width)
  function atFoot(s) {
    const B = b.inB; if (!B || s.kind === 'degraus') return false; const L = TL(); const x = b.X - B.x * L, z = b.Z - B.y * L; const r = s.r, dx = s.dir[0], dz = s.dir[1];
    if (dx) { const e = dx > 0 ? r[0] - x : x - r[2]; return e >= -0.05 && e < 0.7 && z > r[1] - 0.05 && z < r[3] + 0.05; }
    const e = dz > 0 ? r[1] - z : z - r[3]; return e >= -0.05 && e < 0.7 && x > r[0] - 0.05 && x < r[2] + 0.05;
  }
  // (how far up its flight a point is: 0 at its foot, 1 at its top)
  function stairF(s, x, z) { const r = s.r; const len = s.dir[0] ? r[2] - r[0] : r[3] - r[1]; const t = s.dir[0] ? (s.dir[0] > 0 ? x - r[0] : r[2] - x) : (s.dir[1] > 0 ? z - r[1] : r[3] - z); return G.clamp(t / (len || 1), 0, 1); }
  // after each step: the building the body is in (or on the doorstep of), its storey, the flight under it; the world's record
  // of it — v.inside while within its walls, asked of the world in its step; the storey, with the body's record (Possess.level)
  function indoorAfter(v) {
    let ins = indoorAt(b.X, b.Z);
    // (the plan made over under the body — a work done, the house become another —: never left in what the new plan has where it
    // stood, a wall or a piece; up beside it, where the feet stand and the door's walk reaches, as a game loaded with the plan made
    // over has it (L-391). The hut#2221 of the generation-19 «cidade», done into a house with the body inside: a piece of the
    // house where it stood, and the body in it — L-695)
    if (ins && ins.shell && !ins.walk && ins.door < 0 && b.loco === 'ground' && !b.seat && offBed()) ins = indoorAt(b.X, b.Z); // (a door shut on it is the door's: never a piece)
    if (!ins) { b.inB = null; b.inP = null; b.lv = undefined; b.stair = null; b.stairF = 0; b.inShell = false; }
    else { b.inB = ins.b; b.inP = ins.p; b.lv = ins.lv; b.inShell = ins.shell; b.stair = G.Space.stairIn(ins.p, ins.lv, ins.x, ins.z); b.stairF = b.stair ? stairF(b.stair, ins.x, ins.z) : 0; b.crawl = (ins.p.levels.find(q => q.lv === ins.lv) || {}).kind === 'jirau'; }
    // (an open ground — a square, a fair — is walked on as the town's: the world has the body in it only by a place of it,
    // Possess.use, and while it is on it)
    const open = !!(ins && ins.shell && ins.p.shell.kind === 'aberta');
    const want = ins && ins.shell && !(open && v.inside !== ins.b.id) ? ins.b.id : 0;
    if (b.inAsk && b.inAsk.res) b.inAsk = null;
    // (the world has it indoors only by the door: a room of the building it came in by — Possess.cameBy; going out is free, L-175)
    if (!b.inAsk && want !== (v.inside || 0)) { const id = want; b.inAsk = G.Possess.apply(w => { if (id && (!G.S.buildings.has(id) || !G.Possess.cameBy(id))) return { ok: false, why: '' }; w.inside = id; return { ok: true }; }); }
    // (once the world has it indoors — and on an open ground of storeys come into by its way in, the storey it stands on: the arena
    // and the podium of the amphitheatre over its substructure, which the world's step asks the plan on, L-550)
    G.Possess.setLevel(ins && ins.shell && (v.inside === ins.b.id || (open && G.Possess.cameBy(ins.b.id))) ? ins.lv : null);
  }
  Av.indoors = () => (b && b.inB && b.inShell ? { b: b.inB, p: b.inP, lv: b.lv, crawl: !!b.crawl } : null); // (for the camera and the 3D)
  // (the flight the body is going up or down now — the stair's id, its building's, how far along: the 3D lifts its lid)
  Av.flight = () => (b && b.loco === 'stair' && b.flight && b.inB ? { s: b.flight.s, b: b.inB.id, k: b.flight.T > 0 ? b.flight.t / b.flight.T : 1, up: !!b.flight.up } : null);
  // lying down on a bed of the plan (the world has the body asleep: Possess.sleep): on its sleeping place, the head to its wall
  // — turned as the people of the world are laid on theirs (the plan's ry is the way one faces; the rig's yaw, π/2 − ry), on
  // what one lies on (Interiors.rootY): L-284
  Av.lieAt = function (B, it, sp) {
    const v = G.Possess.body(); const e = B && G.Space.planEntry(B.id); if (!b || !v || !e || !e.p) return false;
    const L = TL(); b.X = b.pX = B.x * L + sp.x; b.Z = b.pZ = B.y * L + sp.z; b.Y = b.pY = e.y0 + (e.p.levels.find(q => q.lv === it.lv) || { y: 0 }).y + G.Interiors.rootY(it, sp, 'sleep') + G.Space.FLOOR_UP;
    b.yaw = Math.PI / 2 - sp.ry; b.bed = { b: B.id, it: it.id }; b.loco = 'sleep'; b.vx = b.vz = b.vy = 0; b.ground = true;
    v.x = b.wx = b.X / L; v.y = b.wy = b.Z / L; return true;
  };
  // (up from the bed: the nearest point of the room the body can stand on, all round it — one the house's door reaches on foot,
  // Interiors' own walk from the entrance: never a nook shut in by the furniture)
  const reached = (q) => { const R = q.p.reach && q.p.reach[q.lv]; if (!R) return true; const n = q.p.grid.n, cs = q.p.grid.cs; return !!R[Math.floor(q.z / cs) * n + Math.floor(q.x / cs)]; };
  // (nor in the footprint of a flight on the storey it goes up from: the body takes a flight whole, from its foot — solidAt —,
  // and put down in one it could never step out: L-391)
  const onFlight = q => q.p.stairs.some(s => s.kind !== 'degraus' && s.lv0 === q.lv && inBox(flightCells(s.r), q.x, q.z));
  // (a flight's footprint on the storey it goes up from as the plan's grid has it — the cells whose middle it covers, Interiors'
  // own rule for its flight's cells —: the body is barred by a flight where the walk of the plan is, and the people of the world,
  // the one rule of the body in a plan (In.BODY, Possess.onPlan). Barred by the flight's drawn outline instead, the body met the
  // ladder of the house#18346 of the generation-17 metropole a little past its cells, in the way the walk has between it and a
  // chest — 0,61 m there for a body of 0,64 —, and put up from the bed on the far side it never came back to the stairs down;
  // the plan's side — every cell the outline touches — would have moved the furniture of many houses, and the world: L-645)
  function flightCells(r) { const cs = G.Interiors.CS; return [Math.ceil(r[0] / cs - 0.5) * cs, Math.ceil(r[1] / cs - 0.5) * cs, (Math.floor(r[2] / cs - 0.5) + 1) * cs, (Math.floor(r[3] / cs - 0.5) + 1) * cs]; }
  const inBox = (r, x, z) => x > r[0] && x < r[2] && z > r[1] && z < r[3];
  Av.flightBox = flightCells; // (for the proofs: what of a flight's outline bars the body — visual/pe-da-escada 1b)
  const fits = (X, Z) => { const c = indoorAt(X, Z); if (!c || !c.walk || !c.shell || !reached(c) || onFlight(c)) return false; return RIM.every(([dx, dz]) => { const q = indoorAt(X + dx * TUNE.radius, Z + dz * TUNE.radius); return q && q.walk && q.shell && !onFlight(q); }); };
  function floorNear(X0, Z0) {
    for (let r = 0.3; r <= 1.8; r += 0.15) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; const X = X0 + Math.cos(a) * r, Z = Z0 + Math.sin(a) * r; if (fits(X, Z)) return [X, Z]; }
    return null;
  }
  function offBed() { const q = floorNear(b.X, b.Z); if (!q) return false; b.X = b.pX = q[0]; b.Z = b.pZ = q[1]; b.Y = b.pY = indoorAt(q[0], q[1]).y; return true; }
  // at a place of a plan the world has given the body's hands (Possess.use — Interact's verb 'lugar'): from where one gets onto
  // it (pl.at, metres of the lot) to the place itself, a moment's ease as one sits down; turned as the place is (the plan's ry is
  // the way one faces; the rig's yaw, π/2 − ry), on what one sits or stands on (Interiors.rootY: pl.y); held there until the
  // player walks — or the world lets the place go (a renovation, the body put out) —, and up again where it got on (now: at once,
  // a game loaded with the body seated)
  const SEAT_T = 0.45, RISE_T = 0.35;
  Av.seatAt = function (B, pl, now, v0) {
    const v = v0 || G.Possess.body(); const e = B && G.Space.planEntry(B.id); if (!b || !v || !e || !e.p || !pl) return false;
    const L = TL(); const y = e.y0 + (e.p.levels.find(q => q.lv === pl.lv) || { y: 0 }).y + G.Space.FLOOR_UP;
    const at = pl.at || [pl.x, pl.z]; const yaw1 = Math.PI / 2 - pl.ry;
    b.seat = { b: B.id, it: pl.item, q: pl.q, st: pl.st || 'sit', X0: B.x * L + at[0], Z0: B.y * L + at[1], Y0: now ? y : b.Y, X1: B.x * L + pl.x, Z1: B.y * L + pl.z, Y1: y + (pl.y || 0), yaw0: b.yaw, yaw1, k: now ? 1 : 0, out: false };
    b.loco = 'seat'; b.vx = b.vz = b.vy = 0; b.ground = true; b.bed = null;
    if (now) { const s = b.seat; b.X = b.pX = s.X1; b.Z = b.pZ = s.Z1; b.Y = b.pY = s.Y1; b.yaw = yaw1; v.x = b.wx = b.X / L; v.y = b.wy = b.Z / L; }
    return true;
  };
  Av.seated = () => !!(b && b.seat && !b.seat.out); // (for the verbs and the HUD: at a place, not getting up)
  Av.seatNow = () => (b && b.seat ? { b: b.seat.b, it: b.seat.it, q: b.seat.q, st: b.seat.st, out: b.seat.out, k: b.seat.k } : null); // (for the tests)
  // (up from a place: back where it got onto it — where that is no floor any more, the nearest open floor about it —, the world
  // letting the place go in its step (ask); at once, when an act takes the body away from it)
  function standUp(ask, now) {
    const s = b.seat; if (!s) return;
    if (!s.out) { if (!fits(s.X0, s.Z0)) { const q = floorNear(s.X1, s.Z1); if (q) { s.X0 = q[0]; s.Z0 = q[1]; } } s.Y0 = floorAt(s.X0, s.Z0); s.yaw0 = s.yaw1; s.out = true;
      if (ask) G.Possess.apply(w => { G.Possess.unuse(w); return { ok: true }; }); }
    if (now) { b.X = b.pX = s.X0; b.Z = b.pZ = s.Z0; b.Y = b.pY = s.Y0; b.seat = null; b.loco = 'ground'; b.fallFrom = b.Y; }
  }
  // (the world laid the body to sleep indoors, in its own house: into its own bed, if it is there by it)
  function toBed(v) {
    const bd = G.Interiors && G.Interiors.bedOf ? G.Interiors.bedOf(v) : null; if (!bd || !b.inB || bd.b !== b.inB) return false;
    const L = TL(); if (Math.hypot(b.X - (bd.b.x * L + bd.spot.x), b.Z - (bd.b.y * L + bd.spot.z)) > 2.6) return false;
    return Av.lieAt(bd.b, bd.item, bd.spot);
  }
  // the face of the water at a point (metres) — the sea, a lake, a river — or -Infinity where there is none to be in
  // (dry land, a bridge's deck, the ice, the bed of a parted sea)
  function waterAt(X, Z) {
    const S = G.S; const x = X / TL(), y = Z / TL(); if (!W.inb(x, y)) return -Infinity;
    const i = W.idx(x, y); const t = S.type[i];
    if (t > T.RIVER || (S.dry && S.dry[i]) || (S.ice && S.ice[i]) || (t === T.RIVER && S.road[i])) return -Infinity;
    return W.waterH(x, y) * HM();
  }
  Av.waterAt = waterAt;

  // ------------------------------ attach / detach ------------------------------
  Av.attach = function (v, yaw) {
    const X = v.x * TL(), Z = v.y * TL();
    if (v.inside && G.Space.planNow) G.Space.planNow(G.S.buildings.get(v.inside));
    b = null; const Y = floorAt(X, Z);
    b = {
      id: v.id, X, Y, Z, pX: X, pY: Y, pZ: Z, vx: 0, vy: 0, vz: 0, yaw: yaw === undefined ? (v.face > 0 ? 0 : Math.PI) : yaw, ground: true, coyote: 0, buffer: 0,
      loco: 'ground', anim: 'idle', animT: 0, ph: 0, pose: G.Anim3D.POSE0(), landT: 0, fallFrom: Y, hurt: 0, stamina: 100, acc: 0, wx: v.x, wy: v.y,
      act: null, speed: 0, turnT: 0, block: null, blockT: 0, capsT: 0, caps: null, wade: 0, climb: null, ledgeT: 0, yawP: 0, spP: 0, bank: 0,
      h: 1.75, swimK: 0, stroke: 0, drown: 0, drownHurt: 0, wear: [],
      kx: 0, kz: 0, hitN: lastHit(), missT: G.S.clock, hitT: 0, hitK: 0, hitX: 0, hitZ: 0, downB: 0, rise: 0, dodgeT: 0,
      lv: G.Possess.level(), inB: null, inP: null, inShell: false, stair: null, stairF: 0, crawl: false, inAsk: null,
      // (the movement, 20b — JOGABILIDADE.md §4.4: the gait, the push of the step, the turn, the strafe and the aim, the crouch,
      // the dodge, the pivot; the yaw and the drawn height between steps; the breath's pause and its spent-out mark)
      gait: 'parado', accX: 0, accZ: 0, turnV: 0, strafe: false, aimYaw: 0, crouch: false, dodge: null, dodgeCD: 0, dodgeBuf: 0, pivot: null,
      pYaw: 0, yOff: 0, pyOff: 0, yOffV: 0, faceGoal: undefined, faceRate: 0, winded: false, regenT: 0, sprintK: 0, jumpT: 9, crouchBuf: 0,
      pvx: 0, pvz: 0, airT: 0, yawV: 0, sprint: false,
    };
    b.pYaw = b.yaw;
    { const B = v.inside && G.S.buildings.get(v.inside); if (B && G.Space.plan(B)) { b.inB = B; b.inP = G.Space.plan(B); } b.Y = b.pY = floorAt(X, Z); indoorAfter(v);
      // (at the place its hands held — a game loaded with the body seated: Possess's load holds it again —: on it again; else,
      // indoors on a piece of furniture — a game loaded with the body in its bed —, or where the plan of now has a wall, a piece
      // or a flight going up — a game saved before the plan was made over (L-391), or on its way up a flight —: up beside it)
      const u = G.Possess.useOf(); const pl = u && B && b.inB === B && !v.sleeping && G.Interiors.placeFor ? G.Interiors.placeFor(B, u.it, u.q, X - B.x * TL(), Z - B.y * TL()) : null;
      if (pl && u.st) pl.st = u.st;
      if (!(pl && Av.seatAt(B, pl, true, v)) && b.inShell && !v.sleeping) { const q = indoorAt(b.X, b.Z); if (!q || !q.walk || onFlight(q)) offBed(); } }
    // (thrown down by the world when the body is taken up again — a game loaded under a lion's leap: down still, as the world says)
    if (v.downT > G.S.clock && !v.sleeping && !v.inside && b.loco === 'ground') b.loco = 'down';
    Av.on = true;
    return b;
  };
  Av.detach = function () { b = null; Av.on = false; if (G.People3D) G.People3D.avatar = null; };

  // ------------------------------ collisions ------------------------------
  // (a point is solid for the body if the world says nobody stands there, or if the ground there rises above a step)
  function solidAt(X, Z, feet) {
    // (indoors the plan says: its walls, its furniture, a door the world has shut, the edge of a loft; along the flight the
    // body is on, its steps; onto one from the side, as high as it is there, a ledge)
    // (a flight's footprint on the storey it goes up from is taken whole, from its foot: takeFlight; on the storey it comes up
    // to, its hatch shut is floor — one goes down it by hand: Avatar.down)
    if (b && b.inB && b.inP) { const L = TL(); const x = X - b.inB.x * L, z = Z - b.inB.y * L;
      for (const q of b.inP.stairs) { if (q.kind === 'degraus' || q.lv0 !== b.lv) continue; if (inBox(flightCells(q.r), x, z)) { b.stairHit = q; return 'stair'; } }
      // (a grand stair's well, open — no lid over it, its rail round it, void in the plan's grid: Interiors.grandWell, L-562 —:
      // never walked over; from its landing, down the flight as one walks — takeFlight)
      const gw = G.Interiors && G.Interiors.grandWell;
      if (gw) for (const q of b.inP.stairs) { if (q.lv1 !== b.lv || !gw(q)) continue; const r = q.hole; if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) { b.stairHit = q; return 'stair'; } } }
    const ins = indoorAt(X, Z);
    // (and a flight of another building, at the point — an open ground's, with no wall round it: the rostra of a square —, as
    // solid: taken only from within its building, at its foot; never where the feet land climbing up to it — L-411)
    if (ins && ins.b !== (b && b.inB)) for (const q of ins.p.stairs) { if (q.kind === 'degraus' || q.lv0 !== ins.lv) continue; if (inBox(flightCells(q.r), ins.x, ins.z)) return 'stair'; }
    if (ins) { if (!ins.walk) return ins.shell ? 'wall' : 'building'; return ins.y > feet + TUNE.stepUp ? 'ledge' : null; }
    const s = G.Space.surface(X, Z);
    // (water the world does not walk — the sea, a lake, a deep river — is no wall to a body that swims: in it goes)
    if (!s.walk && !(s.kind === 'deep' && b && b.caps && b.caps.swim)) return s.kind;
    // (an open gate: the world walks its whole tile, the body only its passage — its piers are the stones the drawing puts there
    // and the eye keeps out of, Build3D.wallSolid; a body already in them, a gate raised where it stood, steps out freely — L-308)
    if (inGate(X, Z, feet) && !(b && inGate(b.X, b.Z, feet))) return 'wall';
    return ledge(X, Z, feet, floorAt(X, Z)) ? 'ledge' : null;
  }
  const inGate = (X, Z, feet) => { const x = Math.floor(X / TL()), y = Math.floor(Z / TL()); return W.inb(x, y) && G.S.wall[y * G.N + x] === 2 && !!G.Build3D && G.Build3D.wallSolid(X, feet + 0.3, Z, 0); };
  // too high for a step: more than a stair's rise — or a boulder's steep face standing high over the earth, which is
  // climbed with the hands and not walked (a low stone is just stepped on)
  function ledge(X, Z, feet, f) {
    if (f > feet + TUNE.stepUp) return true;
    return f > feet + TUNE.stoneStep && f - W.hAt(X / TL(), Z / TL()) * HM() > TUNE.stepUp && G.Space.stoneTop(X, Z) >= f;
  }
  // the body is a circle on the ground: its centre, and the points of its rim on the side it moves toward, must stand
  // on open ground (only the leading side: a body touching a wall can always step away from it — it never sticks)
  const RIM = [[1, 0], [0.707, 0.707], [0, 1], [-0.707, 0.707], [-1, 0], [-0.707, -0.707], [0, -1], [0.707, -0.707]];
  function blocked(X, Z, feet, mx, mz) {
    const r = TUNE.radius;
    const c = solidAt(X, Z, feet); if (c) return c;
    for (const [dx, dz] of RIM) { if (dx * mx + dz * mz <= 0.05) continue; const k = solidAt(X + dx * r, Z + dz * r, feet); if (k) return k; }
    // (and the furniture by its own outline: a move that takes the body's circle deeper into a piece is stopped — one that takes it
    // out of it or along it never: it never sticks)
    if (b && b.inB && b.inP) { const then = pieceDepth(X, Z); if (then > 0 && then > pieceDepth(b.X, b.Z) + 1e-4) return 'wall'; }
    return null;
  }
  // how deep the body's circle at a point stands in the furniture of the storey it is on past what each piece allows (metres; 0 or
  // less, as far as it may) — each piece by its rectangle on the plan, as it is drawn (D-734). The plan's grid marks a piece only on
  // the cells whose middle it covers (a table stands up to 12 cm past them: Interiors' stampItems, the world's own rule, P3's), and the
  // rim's eight points are 45° apart: the circle went 19 cm into the corner of a table of the tavern#5763, 17–19% of the frames of a
  // walk round its hall over 5 cm (the agent D). Held to the shoulders' circle at a table's height, the plan's own ways — the cells
  // the world walks — shut on the body (the hall of the tavern#9358): at the hips the circle's rim is air
  function pieceDepth(X, Z, raw) {
    const B = b.inB, p = b.inP, L = TL(), r = TUNE.radius; const x = X - B.x * L, z = Z - B.y * L; let worst = 0;
    for (const it of p.items) {
      if (it.lv !== b.lv || it.niche) continue; const slack = raw ? 0 : it.h < TUNE.pieceLowH ? TUNE.pieceLow : TUNE.pieceSlack;
      // (a piece in parts — the masonry counter in an L, D-721 — is its arms: the keeper stands inside the L, the body too)
      for (const R of (it.parts && it.parts.length ? it.parts : [it.r])) {
        if (x < R[0] - r || x > R[2] + r || z < R[1] - r || z > R[3] + r) continue;
        const dx = Math.max(R[0] - x, 0, x - R[2]), dz = Math.max(R[1] - z, 0, z - R[3]); const d = Math.hypot(dx, dz);
        const k = (d > 0 ? r - d : r + Math.min(x - R[0], R[2] - x, z - R[1], R[3] - z)) - slack; if (k > worst) worst = k;
      }
    }
    return worst;
  }
  Av.pieceDepth = (X, Z, raw) => (b && b.inB && b.inP ? pieceDepth(X, Z, raw) : 0); // (for the proofs: past what the pieces allow — raw: the circle's own depth)
  // the feet's move of one step (metres), sliding: along each axis, a wall stopping the part of the move that goes into it —
  // and, where only the edge of a corner is in the way (a quina, a door's jamb, the end of a stall), the body slips round it
  // sideways instead of stopping dead: the nearest free side within a hand of where it pushes, as far each step as it goes
  // forward (D-359). Returns what stopped it on each axis, or null
  const CORNER = [0.05, 0.1, 0.15, 0.2, 0.25];
  const HIT = { x: null, z: null };
  function collide(dx, dz, feet, push) {
    HIT.x = HIT.z = null; const big = Math.abs(dx) >= Math.abs(dz);
    // (the main axis first: the slip round a corner is reckoned for it)
    const along = (ax) => {
      const d = ax ? dx : dz; if (d === 0) return;
      const nX = b.X + (ax ? d : 0), nZ = b.Z + (ax ? 0 : d);
      const k = blocked(nX, nZ, feet, ax ? Math.sign(d) : 0, ax ? 0 : Math.sign(d)); if (!k) { b.X = nX; b.Z = nZ; return; }
      // (the slip: only pushing on, mostly along this axis, past the edge of a wall — never round a flight, which is taken whole,
      // nor water; past a ledge only where the shoulder clips it, the way straight ahead open: pushed at squarely, a boulder or a
      // plinth stops the body, and the jump climbs it)
      const other = ax ? dz : dx;
      const square = k === 'ledge' && !!solidAt(nX + (ax ? Math.sign(d) * TUNE.radius : 0), nZ + (ax ? 0 : Math.sign(d) * TUNE.radius), feet);
      if (push && (ax === big) && Math.abs(other) < Math.abs(d) * 0.6 && (k === 'wall' || k === 'building' || k === 'cliff' || (k === 'ledge' && !square))) {
        const pref = Math.sign(other) || Math.sign(ax ? b.vz : b.vx) || 0;
        for (const e of CORNER) for (const s of pref ? [pref, -pref] : [1, -1]) {
          const sx = ax ? 0 : s * e, sz = ax ? s * e : 0;
          if (blocked(nX + sx, nZ + sz, feet, ax ? Math.sign(d) : 0, ax ? 0 : Math.sign(d)) || blocked(b.X + sx, b.Z + sz, feet, ax ? 0 : s, ax ? s : 0)) continue;
          // (never down off what the feet are on: a narrow tread along a wall, slipped from, dropped the body to the ground beside the
          // steps of the workshop#4236 of the metropole, and the flight was a ledge from there — soleira 4b)
          const m = Math.min(e, Math.max(Math.abs(d), 0.012)), qx = b.X + (ax ? 0 : s * m), qz = b.Z + (ax ? s * m : 0);
          if (floorAt(qx, qz) < floorAt(b.X, b.Z) - 0.12) continue;
          b.X = qx; b.Z = qz; b.corner = (b.corner || 0) + 1; return;
        }
      }
      if (ax) HIT.x = k; else HIT.z = k;
    };
    along(big); along(!big);
    return HIT;
  }
  // round things one walks around: the trunks of grown trees, the fountain of a square (a boulder is ground one climbs: floorAt)
  function pushRound(X, Z) {
    const S = G.S; const L = TL(); const x0 = Math.floor(X / L), y0 = Math.floor(Z / L); let ox = 0, oz = 0; let sq = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const i = y * G.N + x;
      let cx = 0, cz = 0, rr = 0;
      const tid = S.treeAt[i]; const t = tid && S.trees.get(tid); const tr = G.Space.trunk(t); // (the rule the steps before a door keep from: L-197)
      if (tr) { cx = t.x * L; cz = t.y * L; rr = tr; }
      else if (S.occ[i] && S.occ[i] !== sq) { const B = S.buildings.get(S.occ[i]); if (B && B.type === 'praca' && B.built) { sq = B.id; cx = (B.x + B.w / 2) * L; cz = (B.y + B.h / 2) * L; rr = 1.4; } }
      // (21a: the forest's hard stems — a tree fern, a young tree, a slim palm, bamboo —, walked round as a trunk is: Space.stems, D-473)
      for (const st of G.Space.stems(i)) { const sx = X + ox - st[0], sz = Z + oz - st[1]; const d = Math.hypot(sx, sz); const m = st[2] + TUNE.radius; if (d < m && d > 1e-4) { ox += sx / d * (m - d); oz += sz / d * (m - d); } }
      if (!rr) continue;
      const ddx = X + ox - cx, ddz = Z + oz - cz; const d = Math.hypot(ddx, ddz); const m = rr + TUNE.radius;
      if (d < m && d > 1e-4) { ox += ddx / d * (m - d); oz += ddz / d * (m - d); }
    }
    return [ox, oz];
  }

  // the bodies the body walks round (D-330): the beasts by their footprint — hard, as the world's own (G.Corpo: a capsule along
  // the way each faces, the small ones stepped round or over) —, and the people out of doors by their own circle — soft: they
  // jostle past, the body slips by, and a doorway with someone in it is never shut by them. [ox, oz] the way out of the beasts,
  // [px, pz] the people's nudge, [nx, nz] the beasts' outward normal (to take the move into them off the velocity), all metres
  const PB = [0, 0, 0, 0, 0, 0];
  function pushBodies(X, Z, people) {
    PB[0] = PB[1] = PB[2] = PB[3] = PB[4] = PB[5] = 0; const Co = G.Corpo; if (!Co || !G.Animals || !G.Animals.near) return PB;
    const L = TL(); const x = X / L, y = Z / L; const R = TUNE.radius / L;
    G.Animals.near(x, y, 4, a => {
      if (!Co.stands(a)) return; const f = Co.foot(a); const px = x + PB[0] / L, py = y + PB[1] / L; const q = Co.near(f, px, py); const over = f[4] + R - q[2]; if (over <= 0) return;
      let ux = px - q[0], uy = py - q[1]; const l = Math.hypot(ux, uy);
      if (l > 1e-6) { ux /= l; uy /= l; } else { const h = Math.hypot(a.fx || 0, a.fy || 0); ux = h > 1e-9 ? -(a.fy || 0) / h : 1; uy = h > 1e-9 ? (a.fx || 0) / h : 0; } // (dead on its spine: out to its side)
      PB[0] += ux * over * L; PB[1] += uy * over * L; PB[4] += ux; PB[5] += uy;
    });
    if (people && G.Animals.nearMan) { const me = G.Possess.id();
      G.Animals.nearMan(x, y, 1.5, o => {
        if (o.id === me || o.inside || o.held || o.air || o.aboard || o.carried || o.age < 2) return;
        const r = (o.age < 12 ? 0.2 : 0.27) / L; const dx = x - o.x, dy = y - o.y, d = Math.hypot(dx, dy); const over = r + R - d; if (over <= 0 || d < 1e-6) return;
        PB[2] += dx / d * over * L * 0.35; PB[3] += dy / d * over * L * 0.35;
      }); }
    return PB;
  }
  const NUDGE = 1.4; // (m/s: the most the people's nudge moves the body)
  // (after the feet moved: out of the beasts — never into a wall for it: then the step is not taken —, and past the people)
  function outOfBodies(feet, moving) {
    const p = pushBodies(b.X, b.Z, moving);
    if (p[0] || p[1]) {
      if (!blocked(b.X + p[0], b.Z + p[1], feet, Math.sign(p[0]), Math.sign(p[1]))) { b.X += p[0]; b.Z += p[1]; }
      else { b.X = b.pX; b.Z = b.pZ; }
      const l = Math.hypot(p[4], p[5]); if (l > 1e-6) { const nx = p[4] / l, nz = p[5] / l; let vn = b.vx * nx + b.vz * nz; if (vn < 0) { b.vx -= nx * vn; b.vz -= nz * vn; } vn = b.kx * nx + b.kz * nz; if (vn < 0) { b.kx -= nx * vn; b.kz -= nz * vn; } }
      b.block = 'beast'; b.blockT = 0.4;
    }
    // (the people's nudge, gentle: never much faster than the body itself goes, nor than a step aside — someone the world puts inside
    // the body, out of a door it stands in, eases it away and does not throw it 16 cm in a step: L-1141; walked into at a run, it
    // keeps up with the run)
    if (p[2] || p[3]) { const n = Math.hypot(p[2], p[3]), m = Math.max(NUDGE, Math.hypot(b.vx, b.vz) * 1.25) * TUNE.step; if (n > m) { p[2] *= m / n; p[3] *= m / n; } }
    if ((p[2] || p[3]) && !blocked(b.X + p[2], b.Z + p[3], feet, Math.sign(p[2]), Math.sign(p[3]))) { b.X += p[2]; b.Z += p[3]; }
  }
  Av.bodiesAt = (X, Z) => pushBodies(X, Z, true).slice(); // (for the proofs: how far out of the bodies a point is pushed)

  // ------------------------------ locomotion states ------------------------------
  // (each: what the body does in one step; a new way of moving — swimming, climbing — is a new entry here)
  const LOCO = Av.LOCO = {
    // standing, walking, running, wading
    ground: {
      step(v, h, caps) { move(v, h, caps, true); },
    },
    // jumping, falling: the hands barely steer
    air: {
      step(v, h, caps) { move(v, h, caps, false); },
    },
    // asleep: the body lies where it lay down — in its bed, indoors —; the world's needs (villagers.js) give the strength back;
    // awake, it gets up beside the bed (the nearest open floor of the room)
    sleep: {
      step(v, h) { b.vx = b.vz = 0; b.speed = 0; if (!v.sleeping) { b.loco = 'ground'; if (b.bed) { b.bed = null; offBed(); } } void h; },
    },
    // at a place of a plan (Av.seatAt): eased onto it, still on it — the hands may work there, the feet do not move —; up as
    // the player walks or jumps, or as the world lets the place go once it had it; eased back to where it got on, on its feet
    seat: {
      step(v, h) {
        const s = b.seat; if (!s) { b.loco = 'ground'; return; }
        b.vx = b.vz = b.vy = 0; b.ground = true;
        if (!s.out) {
          const u = G.Possess.useOf(); const lost = !u || u.b !== s.b || u.it !== s.it || u.q !== s.q;
          const go = Math.abs(IN.mx) + Math.abs(IN.mz) > 0.2 || IN.jump; IN.jump = false;
          if (go || lost) standUp(!lost);
        }
        s.k = G.clamp(s.k + (s.out ? -h / RISE_T : h / SEAT_T), 0, 1); const e = G.smooth(0, 1, s.k);
        b.X = G.lerp(s.X0, s.X1, e); b.Z = G.lerp(s.Z0, s.Z1, e); b.Y = G.lerp(s.Y0, s.Y1, e);
        let da = s.yaw1 - s.yaw0; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.yaw = s.yaw0 + da * e;
        if (s.out && s.k <= 0) { b.seat = null; b.loco = 'ground'; b.fallFrom = b.Y; }
      },
    },
    // climbing a ledge (Breath of the Wild's way: pushing against it, the hands take the edge and the body pulls itself
    // up and over). From one tile the world walks to the next one the world walks on: the world sees a step
    climb: {
      step(v, h) {
        const c = b.climb; if (!c) { b.loco = 'ground'; return; }
        c.t += h; const u = G.clamp(c.t / c.dur, 0, 1);
        const up = G.smooth(0.05, 0.62, u), fw = G.smooth(0.42, 1, u);
        b.X = G.lerp(c.X0, c.X1, fw); b.Z = G.lerp(c.Z0, c.Z1, fw); b.Y = G.lerp(c.Y0, c.Y1 + 0.04, up);
        b.vx = b.vz = b.vy = 0; b.ground = true;
        if (u >= 1) { b.Y = floorAt(b.X, b.Z); b.loco = 'ground'; b.climb = null; b.fallFrom = b.Y; G.Possess.deed('escalada'); }
      },
    },
    // swimming (Breath of the Wild's way: the body floats and the breath goes; out of breath it goes under). Any water of the
    // world — the sea, a lake, a deep river; out again where the bed comes up under the feet, or up a bank with the hands
    swim: {
      step(v, h, caps) { swim(v, h, caps); },
    },
    // up or down a flight of the plan, whole (as one goes up a stair, a hand on a ladder's rungs): from its foot to its landing
    // above, or back — the feet on the steps, the storey changing at the top; what the world sees is the body's place on it
    stair: {
      step(v, h) {
        const c = b.flight; if (!c) { b.loco = 'ground'; return; }
        c.t = Math.min(c.T, c.t + h); let k = 0; while (k < c.P.length - 2 && c.t > c.P[k + 1][3]) k++;
        const A = c.P[k], B = c.P[k + 1]; const u = B[3] > A[3] ? G.clamp((c.t - A[3]) / (B[3] - A[3]), 0, 1) : 1;
        b.X = G.lerp(A[0], B[0], u); b.Z = G.lerp(A[1], B[1], u); b.Y = G.lerp(A[2], B[2], u); b.vx = b.vz = b.vy = 0; b.ground = true;
        // (past the flight's top — up: on to its landing; down: on to its steps — the body is on the storey it goes to: on the way
        // from the top of the subsolo's flight to its landing over the arena, the world asked the storey below, stone, L-550)
        if (k >= 2) b.lv = c.lv;
        if (c.t >= c.T) { b.lv = c.lv; b.loco = 'ground'; b.flight = null; b.fallFrom = b.Y; }
      },
    },
    // knocked down by a blow (a giant's, the leap of a cat, the jaws of a crocodile — D-333): thrown back along the ground, on its
    // back; up again when the world lets it (v.downT) and its own time of it is over — the getting up takes its moment, then
    // the feet are the player's again
    down: {
      step(v, h) {
        b.vx = b.vz = 0; IN.jump = false; b.buffer = 0;
        const feet = b.Y; const nx = b.X + b.kx * h, nz = b.Z + b.kz * h;
        if (nx !== b.X && !blocked(nx, b.Z, feet, Math.sign(b.kx), 0)) b.X = nx; else b.kx = 0;
        if (nz !== b.Z && !blocked(b.X, nz, feet, 0, Math.sign(b.kz))) b.Z = nz; else b.kz = 0;
        outOfBodies(feet, false); settle(h); b.ground = true;
        b.downB = Math.max(0, b.downB - h);
        if (b.downB <= 0 && !(v.downT > G.S.clock)) { b.loco = 'ground'; b.rise = RISE_UP; b.fallFrom = b.Y; }
      },
    },
    // busy with the hands (chopping, picking, eating): the feet keep still until it is done
    // (an act with a place to be — the arms round someone — first takes the step or two to it, by the feet's own rules)
    busy: {
      step(v, h, caps) {
        const a = b.act; let went = false;
        if (a && a.to && a.tr < a.toT) { const dx = a.to[0] - b.X, dz = a.to[1] - b.Z, d = Math.hypot(dx, dz);
          if (d > 0.04) { const s = Math.min(d, caps.walk * 1.1 * h); const nx = b.X + dx / d * s, nz = b.Z + dz / d * s; if (!blocked(nx, nz, b.Y, Math.sign(dx), Math.sign(dz))) { b.X = nx; b.Z = nz; went = true; } } }
        // (an act that moves the body — the drive of its own gesture, the feet the player keeps in it: JOGABILIDADE.md §4.5)
        if (a && !went && (a.drive || a.moveScale > 0)) { move(v, h, caps, b.ground, a); if (!b.act && b.loco === 'busy') b.loco = 'ground'; return; }
        if (!went) { b.vx *= Math.exp(-12 * h); b.vz *= Math.exp(-12 * h); }
        settle(h); if (!b.act) b.loco = 'ground';
      },
    },
    // the dodge (D-363): its speeds over its time along its way — the roll turned along it, the step aside facing what is held —,
    // walls and bodies stopping it as they stop the feet; off an edge it falls; then a moment before the next
    dodge: {
      step(v, h) {
        const d = b.dodge; if (!d) { b.loco = 'ground'; return; }
        d.t += h; d.u = Math.min(1, d.t / d.dur);
        const s = curveAt(d.curve, d.u) * d.k; b.vx = Math.cos(d.yaw) * s; b.vz = Math.sin(d.yaw) * s;
        if (d.kind === 'passo' && b.strafe && IN.lock) d.face = Math.atan2(IN.lock.Z - b.Z, IN.lock.X - b.X);
        steer(d.face, d.kind === 'rolar' ? 18 : 14, h);
        const feet = b.Y; const H = collide((b.vx + b.kx) * h, (b.vz + b.kz) * h, feet, true);
        if (H.x) { b.vx = 0; b.kx = 0; b.block = H.x; b.blockT = 0.4; } if (H.z) { b.vz = 0; b.kz = 0; b.block = H.z; b.blockT = 0.4; }
        outOfBodies(feet, true);
        const L = TL(); b.X = G.clamp(b.X, 0.5 * L, (G.N - 0.5) * L); b.Z = G.clamp(b.Z, 0.5 * L, (G.N - 0.5) * L);
        settle(h); b.wade = Math.max(0, waterAt(b.X, b.Z) - floorAt(b.X, b.Z));
        if (b.loco !== 'dodge') { b.dodge = null; b.dodgeCD = TUNE.dodgeCD; return; } // (off an edge: falling now)
        if (d.u >= 1 || (H.x && H.z)) { b.dodge = null; b.loco = 'ground'; b.dodgeCD = TUNE.dodgeCD; }
      },
    },
  };
  Av.addLoco = (name, def) => { LOCO[name] = def; };

  function wish() {
    if (b && b.rise > 0) return [0, 0, 0]; // (getting up from a fall: the feet are not yet the player's)
    // the wish is camera-relative: forward is where the camera looks
    const cy = Math.cos(IN.camYaw), sy = Math.sin(IN.camYaw);
    let wx = cy * IN.mz - sy * IN.mx, wz = sy * IN.mz + cy * IN.mx; const l = Math.hypot(wx, wz);
    if (l > 1) { wx /= l; wz /= l; }
    return [wx, wz, Math.min(1, l)];
  }
  // the body's paces now, metres a second (20b, D-355): the walk the world gives this person — the road, a ford, a ladder, a
  // slope, hunger and tiredness, a load —, and the jog and the sprint from it (Possess.caps.run: the young and the old less, a
  // lost leg none). Indoors one walks: the jog and the sprint are for the street and the field (an open ground — a square, an
  // arena — is the street's); a heavy load, deep water, the crouch: no sprint
  const PACE = { walk: 0, jog: 0, sprint: 0 };
  // (the jog and the sprint are the body's own, not the world's pace: reckoned from this person's walk at the body's time they were
  // tuned on, D-015's 0,35 — so the slower time of the body of D-365 (Space.TIME 0,27) slows the walk with the world's people and
  // leaves the jog and the sprint as they were)
  const REF_TIME = 0.35;
  Av.refWalk = caps => caps.walk * REF_TIME / (G.Space.TIME || REF_TIME);
  function paces(v, caps, here, wx, wz, wl) {
    let e = 1;
    if (b.inShell && b.stair && (b.stair.cls ? b.stair.cls === 'mao' || b.stair.cls === 'ingreme' : b.stair.kind === 'escada-de-mao')) e *= 0.55; // (a ladder, a steep stair: hand over hand)
    // (water to the shins slows a little, to the thighs a lot)
    if (b.wade > 0.05) e *= Math.max(0.4, 1 - b.wade * TUNE.wadeDrag); else if (here.road) e *= TUNE.road;
    if (v.energy < 8) e *= 0.7; if (v.hunger >= 100) e *= 0.8; if (v.carry && v.carry.n >= 4) e *= 0.9;
    // (uphill is slower, as for everyone of the world)
    if (wl > 0.1) { const l = Math.hypot(wx, wz); const a = floorAt(b.X + wx / l * 0.6, b.Z + wz / l * 0.6) - floorAt(b.X, b.Z); if (a > 0) e *= 1 / (1 + a * 0.9); }
    const r = G.clamp((caps.run - 1) / 1.05, 0, 1.2), w = caps.walk * e, ref = Av.refWalk(caps) * e;
    PACE.walk = w; PACE.jog = Math.max(w, ref * (1 + (TUNE.jog - 1) * r)); PACE.sprint = Math.max(PACE.jog, ref * (1 + (TUNE.sprint - 1) * r));
    const indoors = b.inShell && !(b.inP && b.inP.shell && b.inP.shell.kind === 'aberta');
    if (indoors) PACE.jog = PACE.sprint = w;
    if ((v.carry && v.carry.n >= 4) || b.wade > 0.35 || b.crawl) PACE.sprint = PACE.jog;
    return PACE;
  }
  Av.paces = () => (b && b.caps ? Object.assign({}, PACE) : null); // (for the proofs and the HUD)
  // (a way the body turns to by itself — up a flight, onto a ledge, thrown down by a blow —: at rate, rad/s, in the states the
  // player's feet are not in; never a snap of the yaw, D-358)
  function turnTo(yaw, rate) { b.faceGoal = yaw; b.faceRate = rate || 12; }
  // the body turns toward a way at a top speed of turn (rad/s): quickly standing, wide running — eased in and out, never past it,
  // never a snap (D-358). No way: the turn it had dies away
  function steer(goal, top, h) {
    if (goal === null || goal === undefined) { b.yawV *= Math.exp(-18 * h); if (Math.abs(b.yawV) < 0.01) b.yawV = 0; }
    else {
      const e = wrap(goal - b.yaw); const want = G.clamp(e * 14, -top, top); b.yawV += (want - b.yawV) * (1 - Math.exp(-28 * h));
      if (Math.abs(b.yawV * h) > Math.abs(e) && Math.sign(b.yawV) === Math.sign(e)) b.yawV = e / h;
    }
    b.yaw += b.yawV * h;
  }
  // (a curve of speeds over an act's or a dodge's time — [[u, m/s], …], u from 0 to 1 — or a function of u)
  function curveAt(c, u) {
    if (typeof c === 'function') return c(u) || 0;
    if (!c || !c.length) return 0; if (u <= c[0][0]) return c[0][1];
    for (let k = 1; k < c.length; k++) if (u <= c[k][0]) { const a = c[k - 1], q = c[k]; return G.lerp(a[1], q[1], (u - a[0]) / Math.max(1e-6, q[0] - a[0])); }
    return c[c.length - 1][1];
  }
  Av.curveAt = curveAt;
  // the dodge (D-363): a roll along the way pushed, a quick step aside round a target held (or aiming), a step back with no way
  // pushed — its speeds over its time, an adult's (the young and the old shorter, by their walk); what it costs of the breath
  const DODGE = Av.DODGE = {
    rolar: { dur: 0.56, v: [[0, 7.2], [0.3, 6.6], [0.72, 3.2], [1, 1.2]] },
    passo: { dur: 0.32, v: [[0, 8], [0.5, 5.6], [1, 0.6]] },
    recuo: { dur: 0.36, v: [[0, 6.5], [0.45, 4.6], [1, 0.4]] },
  };
  function startDodge(v, caps, wx, wz, wl) {
    if (caps.run <= 1 || b.inShell || b.crawl || v.sleeping || b.wade > 0.45) { b.dodgeBuf = 0; return false; }
    const kind = b.strafe ? 'passo' : wl > 0.2 ? 'rolar' : 'recuo';
    const cost = kind === 'rolar' ? TUNE.rollCost : kind === 'passo' ? TUNE.sideCost : TUNE.backCost;
    if (b.stamina < cost * 0.5) { b.dodgeBuf = 0; G.Audio && G.Audio.play && G.Audio.play('gasp', 0.35); return false; } // (out of breath: no dodge, and one hears why)
    const yaw = kind === 'recuo' ? b.yaw + Math.PI : Math.atan2(wz, wx); const D = DODGE[kind];
    b.dodge = { kind, t: 0, dur: D.dur, yaw, curve: D.v, k: G.clamp(Av.refWalk(caps) / 1.89, 0.6, 1.1), face: kind === 'rolar' ? yaw : kind === 'passo' ? b.aimYaw : b.yaw, u: 0 };
    b.stamina = Math.max(0, b.stamina - cost); b.regenT = TUNE.regenDelay; b.dodgeBuf = 0; b.crouch = false; b.pivot = null; b.loco = 'dodge';
    G.Audio && G.Audio.play && G.Audio.play('swish', 0.7);
    return true;
  }
  // a step of the feet on the ground or in the air (and, with act, of an act that still lets the feet go — its drive, its
  // moveScale: JOGABILIDADE.md §4.5)
  function move(v, h, caps, onGround, act) {
    let [wx, wz, wl] = wish();
    // (the drink in the body: the way the hands want swayed to one side and the other — the turn stays the controller's: G.EbrioCorpo, T2)
    { const q = G.EbrioCorpo ? G.EbrioCorpo.puxa(wx, wz, wl, h) : null; if (q) { wx = q[0]; wz = q[1]; wl = q[2]; } }
    const here = G.Space.surface(b.X, b.Z);
    const P = paces(v, caps, here, wx, wz, wl);
    // the target held or the aim: the body faces it and steps round it (the sprint breaks the strafe — D-364)
    const lk = IN.lock, aim = !!IN.aim; const sprintAsk = IN.run && wl > 0.5;
    b.strafe = !!(aim || (lk && !sprintAsk));
    b.aimYaw = aim ? IN.camYaw : lk ? Math.atan2(lk.Z - b.Z, lk.X - b.X) : IN.camYaw;
    // the crouch: one press down, one up; the sprint and the jump stand it up (D-362)
    if (b.crouchBuf > 0 && onGround && !act) { b.crouch = !b.crouch; b.crouchBuf = 0; }
    if (b.crouch && (sprintAsk || b.wade > 0.45)) b.crouch = false;
    // how fast the body wants to go: the length of the push — a little of it the walk, all of it the jog —, the walk kept to,
    // the crouch; the sprint while the breath lasts, slowing to the jog over its last share
    const m = wl; let tgt;
    if (b.crouch || b.crawl) tgt = P.walk * (b.crawl ? TUNE.sneak : TUNE.crouch) * G.clamp(m / 0.8, 0, 1);
    else if (IN.walk) tgt = P.walk * G.clamp(m / 0.9, 0, 1);
    else tgt = m < 0.55 ? P.walk * m / 0.55 : P.walk + (P.jog - P.walk) * (m - 0.55) / 0.45;
    const canSprint = sprintAsk && !b.strafe && !b.crouch && !b.winded && b.stamina > 0 && P.sprint > P.jog + 0.05 && !act;
    if (canSprint) tgt = P.jog + (P.sprint - P.jog) * G.smooth(0, 1, b.stamina / Math.max(1, caps.stamina * TUNE.tire));
    if (b.strafe) tgt = Math.min(tgt, aim ? P.walk : P.jog * 0.85);
    if (b.landT > 0) tgt *= 1 - 0.45 * G.clamp(b.landT / 0.35, 0, 1); // (a hard landing: a moment to get the legs back)
    if (act) tgt *= G.clamp(act.moveScale || 0, 0, 1);
    let tx = 0, tz = 0; if (wl > 0.05 && tgt > 0) { const l = Math.hypot(wx, wz); tx = wx / l * tgt; tz = wz / l * tgt; }
    const sNow = Math.hypot(b.vx, b.vz), top = Math.max(1, P.sprint), q = G.clamp(sNow / top, 0, 1);
    // a reversal at speed: the body pivots — brakes, turns through, and goes the other way (D-358; the animation draws it)
    if (!b.pivot && onGround && !act && !b.strafe && wl > 0.5 && sNow > P.jog * 0.6 && Math.abs(wrap(Math.atan2(tz, tx) - Math.atan2(b.vz, b.vx))) > 2.35) {
      const e = wrap(Math.atan2(tz, tx) - b.yaw); b.pivot = { t: 0, dur: TUNE.pivotT * (sNow > P.jog * 1.1 ? 1.35 : 1), dir: Math.sign(e) || 1, u: 0 };
    }
    if (b.pivot) { const p = b.pivot; p.t += h; p.u = Math.min(1, p.t / p.dur); if (p.u >= 1 || wl < 0.2 || !onGround) b.pivot = null; else if (p.u < 0.45) tx = tz = 0; }
    // the push of the step: along the way the body goes, speeding up — quickly from a standstill, slowly near the top — or
    // braking; across it, a curve whose sharpness falls with the speed: the weight of a body, never a lag (D-357)
    if (!onGround) { const k = 1 - Math.exp(-TUNE.airAccel * h); b.vx += (tx - b.vx) * k; b.vz += (tz - b.vz) * k; }
    else {
      const dX = tx - b.vx, dZ = tz - b.vz; let ux, uz;
      if (sNow > 0.3) { ux = b.vx / sNow; uz = b.vz / sNow; } else { const tl = Math.hypot(tx, tz); if (tl > 1e-6) { ux = tx / tl; uz = tz / tl; } else { ux = 1; uz = 0; } }
      const par = dX * ux + dZ * uz; const pX = ux * par, pZ = uz * par;
      const rPar = (tx * ux + tz * uz > sNow && (tx || tz)) ? G.lerp(TUNE.accel, TUNE.accelHi, q) : G.lerp(TUNE.brake, TUNE.brakeHi, q) * (b.pivot ? 1.4 : 1);
      const rPerp = sNow > 0.3 ? G.lerp(TUNE.lateral, TUNE.lateralHi, q) : rPar;
      const k1 = 1 - Math.exp(-rPar * h), k2 = 1 - Math.exp(-rPerp * h);
      b.vx += pX * k1 + (dX - pX) * k2; b.vz += pZ * k1 + (dZ - pZ) * k2;
    }
    // the body turns toward where it goes, or toward what it holds or aims at; through a pivot quickly, the way it began
    { let goal = null, topT = G.lerp(TUNE.turnSlow, TUNE.turnFast, q);
      if (b.strafe) { goal = b.aimYaw; topT = TUNE.turnSlow * 0.8; }
      else if (wl > 0.08 && (!act || act.turn)) goal = Math.atan2(wz, wx);
      if (b.pivot) { topT = 15; const e = wrap(goal - b.yaw); if (Math.sign(e) !== b.pivot.dir && Math.abs(e) > 2.6) goal = b.yaw + b.pivot.dir * (Math.abs(e) + 0.2); }
      if (act && act.turn && goal !== null && !b.strafe) topT = Math.min(topT, act.turn);
      if (!onGround) topT *= TUNE.turnAir;
      if (goal !== null && Math.abs(wrap(goal - b.yaw)) > 1.4 && b.speed < 0.6 && !b.strafe) b.turnT = 0.3;
      if (!act || act.turn || b.strafe) steer(goal, topT, h); }
    if (b.turnT > 0) b.turnT -= h;
    // breath: the sprint spends it; after a moment it comes back — slower on the jog —; spent out, the body is winded and does not
    // sprint again until a share of it is back (D-361: no flicker between the sprint and the jog)
    const sprinting = canSprint && b.speed > P.walk * 1.15; // (asked and going: it spends to the end — the fade above slows it first)
    if (sprinting) { b.stamina = Math.max(0, b.stamina - TUNE.sprintDrain * h); b.regenT = TUNE.regenDelay; if (b.stamina <= 0 && !b.winded) { b.winded = true; G.Audio && G.Audio.play && G.Audio.play('gasp', 0.5); } }
    else if (b.regenT > 0) b.regenT -= h;
    else b.stamina = Math.min(caps.stamina, b.stamina + (b.speed > P.walk * 1.15 ? TUNE.regenJog : TUNE.regen) * h);
    if (b.winded && b.stamina >= caps.stamina * TUNE.winded) b.winded = false;
    b.sprintK = sprinting ? G.clamp((b.speed - P.jog) / Math.max(0.1, P.sprint - P.jog), 0, 1) : 0; b.sprint = canSprint; // (the sprint asked and given: through a turn too)
    // the dodge, pressed a moment early still counts (D-363)
    if (b.dodgeBuf > 0 && onGround && !act && b.dodgeCD <= 0 && startDodge(v, caps, wx, wz, wl)) return;
    // the jump: pressed a moment early (the buffer) or a moment after the ground went away (coyote) still counts; crouched, it
    // stands up; before a ledge within the arms' reach, the hands take it instead — the only way a ledge is climbed (D-360)
    if (IN.jump) { b.buffer = TUNE.buffer; IN.jump = false; } else b.buffer = Math.max(0, b.buffer - h);
    if (b.buffer > 0 && (b.ground || b.coyote > 0) && !act) {
      if (b.crouch) { b.crouch = false; b.buffer = 0; }
      else if (caps.jump > 0 && b.stamina >= TUNE.jumpCost * 0.5 && !v.sleeping && !b.inShell) {
        if (onGround) { const l = wl > 0.3 ? wl : 0; const fx = l ? wx / l : Math.cos(b.yaw), fz = l ? wz / l : Math.sin(b.yaw); if (tryClimb(fx, fz, 0.95)) return; }
        b.vy = Math.sqrt(2 * TUNE.gravity * caps.jump); b.ground = false; b.coyote = 0; b.buffer = 0; b.loco = 'air'; b.fallFrom = b.Y; b.stamina = Math.max(0, b.stamina - TUNE.jumpCost); b.regenT = TUNE.regenDelay; b.jumpT = 0;
        G.Audio && G.Audio.play && G.Audio.play('swish', b.crouch ? 0.4 : 1);
      }
    }
    // the feet: sliding along what blocks and round the edge of a corner (collide), the act's own drive along the way the body
    // faces, and a blow's push, its own: it fades as the feet catch the body — D-333
    let ddx = 0, ddz = 0; if (act && act.drive) { const s = curveAt(act.drive, G.clamp(act.t / Math.max(1e-6, act.dur), 0, 1)); ddx = Math.cos(b.yaw) * s; ddz = Math.sin(b.yaw) * s; }
    const feet = b.Y;
    const H = collide((b.vx + b.kx + ddx) * h, (b.vz + b.kz + ddz) * h, feet, wl > 0.3);
    const hit = H.x, hz = H.z;
    if (hit) { b.vx = 0; b.kx = 0; b.block = hit; b.blockT = 0.4; }
    if (hz) { b.vz = 0; b.kz = 0; b.block = hz; b.blockT = 0.4; }
    // (trunks and the fountain: pushed round them, unless that would put the body somewhere solid — and the push into them taken
    // off the velocity, so the body slides past instead of grinding; straight at one, round it on the side the wish leans to)
    const [ox, oz] = pushRound(b.X, b.Z);
    if ((ox || oz) && !blocked(b.X + ox, b.Z + oz, feet, Math.sign(ox), Math.sign(oz))) {
      b.X += ox; b.Z += oz; const l = Math.hypot(ox, oz), nx = ox / l, nz = oz / l; const vn = b.vx * nx + b.vz * nz;
      if (vn < 0) { b.vx -= nx * vn; b.vz -= nz * vn; const tX = -nz, tZ = nx; const vt = b.vx * tX + b.vz * tZ;
        if (wl > 0.3 && Math.abs(vt) < -vn * 0.35) { const s = Math.sign(wx * tX + wz * tZ) || Math.sign(vt) || 1; b.vx += tX * -vn * 0.5 * s; b.vz += tZ * -vn * 0.5 * s; } }
    }
    // (the beasts and the people: walked round, D-330)
    outOfBodies(feet, wl > 0.1);
    const L = TL(); b.X = G.clamp(b.X, 0.5 * L, (G.N - 0.5) * L); b.Z = G.clamp(b.Z, 0.5 * L, (G.N - 0.5) * L);
    if (b.blockT > 0) b.blockT -= h; else b.block = null;
    // (a flight of the plan pushed into is taken whole)
    if (onGround && !act && (hit === 'stair' || hz === 'stair') && wl > 0.3 && takeFlight(wx, wz)) return;
    b.stairHit = null;
    // (in the air after a jump, pushing at a ledge within reach: the hands take its edge — the jump was the asking)
    if (!onGround && (hit === 'ledge' || hz === 'ledge') && wl > 0.3 && b.jumpT < 0.8 && !b.inShell && tryClimb(wx, wz)) return;
    b.ledgeT = 0;
    if (b.loco === 'climb') return;
    settle(h);
    // (how deep the water is round the legs; deep enough, the feet leave the bed and the body swims)
    b.wade = Math.max(0, waterAt(b.X, b.Z) - floorAt(b.X, b.Z));
    if (b.ground && b.caps.swim && b.wade > TUNE.swimIn * b.h) { b.loco = 'swim'; b.crouch = false; b.swimK = G.clamp(b.speed / 1.2, 0, 1); b.vy = 0; b.landT = 0; G.Audio && G.Audio.play && G.Audio.play('splash'); }
  }
  // a stroke of the swim (the controller's own step in the water)
  function swim(v, h, caps) {
    const [wx, wz, wl] = wish(); const wy = waterAt(b.X, b.Z);
    // (the water went from under the body — the sea parted, the ice came: on its feet again)
    if (wy === -Infinity) { b.loco = 'ground'; b.ground = false; b.vy = 0; b.fallFrom = b.Y; b.drown = 0; return; }
    const out = b.stamina <= 0;
    const fast = IN.run && b.stamina > 4 && wl > 0.2 && !out;
    let sp = caps.walk * TUNE.swimSpeed * (fast ? TUNE.swimFast : 1) * (out ? 0.3 : 1) * (v.energy < 8 ? 0.7 : 1);
    const heavy = !!(v.carry && v.carry.n > 0); if (heavy) sp *= 0.75;
    const k = 1 - Math.exp(-(wl > 0.05 ? 3.2 : 2.0) * h);
    b.vx += (wx * sp * wl - b.vx) * k; b.vz += (wz * sp * wl - b.vz) * k;
    // (a push of the arms — the jump in the water: a burst forward, paid in breath)
    if (IN.jump) { IN.jump = false; if (!out && b.stamina > TUNE.strokeCost) { const f = wl > 0.1 ? 1 : 0; const fx = f ? wx / wl : Math.cos(b.yaw), fz = f ? wz / wl : Math.sin(b.yaw); b.vx += fx * caps.walk * 0.9; b.vz += fz * caps.walk * 0.9; b.stamina -= TUNE.strokeCost; b.stroke = 0.45; } }
    if (b.stroke > 0) b.stroke -= h;
    if (wl > 0.08) { const want = Math.atan2(wz, wx); let da = want - b.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.yaw += da * (1 - Math.exp(-TUNE.turn * 0.45 * h)); }
    // the breath: swimming spends it, racing more, treading water less; nothing gives it back in the water
    if (!out) b.stamina = Math.max(0, b.stamina - (wl > 0.1 ? (fast ? TUNE.swimFastDrain : TUNE.swimDrain) : TUNE.treadDrain) * h * (heavy ? 1.6 : 1));
    // the arms move the body across the water: a bank or a wall stops it as on land, a bank low enough is climbed out of
    const feet = wy - 0.45; let hit = null, hz = null;
    const nx = b.X + b.vx * h, nz = b.Z + b.vz * h;
    if (nx === b.X || !(hit = blocked(nx, b.Z, feet, Math.sign(b.vx), 0))) b.X = nx; else b.vx = 0;
    if (nz === b.Z || !(hz = blocked(b.X, nz, feet, 0, Math.sign(b.vz)))) b.Z = nz; else b.vz = 0;
    outOfBodies(feet, wl > 0.1); // (a hippo in its river is no water to swim through, D-330)
    const L = TL(); b.X = G.clamp(b.X, 0.5 * L, (G.N - 0.5) * L); b.Z = G.clamp(b.Z, 0.5 * L, (G.N - 0.5) * L);
    if ((hit === 'ledge' || hz === 'ledge') && wl > 0.3 && !out) { b.ledgeT += h; if (b.ledgeT > TUNE.climbWait || b.stroke > 0) { const y0 = b.Y; b.Y = feet; if (tryClimb(wx, wz)) { b.drown = 0; return; } b.Y = y0; } } else b.ledgeT = 0;
    // floating: moving, flat at the face of the water; still, upright with the head out; out of breath, going under
    b.swimK += (((b.speed > 0.3 || b.stroke > 0) ? 1 : 0) - b.swimK) * (1 - Math.exp(-3 * h));
    if (out) { b.drown += h; b.drownHurt += h * TUNE.drownHurt; } else b.drown = Math.max(0, b.drown - h * 3);
    const wy2 = waterAt(b.X, b.Z); const fl = floorAt(b.X, b.Z);
    if (wy2 === -Infinity) { b.loco = 'ground'; b.Y = fl; b.ground = true; b.fallFrom = b.Y; b.drown = 0; return; }
    const want = G.lerp(wy2 - 1.42 * b.h / 1.75, wy2 - 0.32, b.swimK) - Math.min(1.6, b.drown * 0.3) + Math.sin(b.animT * 1.9) * 0.035;
    b.Y += (want - b.Y) * (1 - Math.exp(-6 * h)); b.vy = 0; b.ground = false;
    // (the bed comes up under the feet: standing again, wading out)
    // (and one going under touches the bottom without being saved by it: only where the head is out of the water)
    if (wy2 - fl < TUNE.swimOut * b.h || (fl > b.Y && !out && b.drown <= 0)) { b.loco = 'ground'; b.Y = fl; b.ground = true; b.fallFrom = b.Y; b.drown = 0; b.wade = wy2 - fl; }
    if (b.Y < fl) b.Y = fl;
  }
  // a ledge ahead, within the reach of the arms (far: how far ahead its face may be): where the hands take it and where the feet
  // will stand on top
  function tryClimb(wx, wz, far) {
    const l = Math.hypot(wx, wz); if (l < 0.1) return false; const dx = wx / l, dz = wz / l; const feet = b.Y;
    for (let d = 0.3; d <= (far || 1.3) + 1e-9; d += 0.1) {
      const ex = b.X + dx * d, ez = b.Z + dz * d; const top = floorAt(ex, ez);
      if (!ledge(ex, ez, feet, top)) continue;
      if (top - feet > TUNE.climbMax) return false; // (too high to reach)
      // (where the feet go: a little beyond the edge, on open ground of the world, up there and with nothing higher right
      // behind — a narrow stone is stood on nearer its edge)
      for (const o of [0.45, 0.3, 0.6, 0.2]) {
        const tx = b.X + dx * (d + o), tz = b.Z + dz * (d + o); const sf = G.Space.surface(tx, tz);
        if (!sf.walk || sf.kind !== 'ground') continue;
        const ty = floorAt(tx, tz); if (ty - feet > TUNE.climbMax || ty < top - 0.6) continue;
        if (blocked(tx, tz, ty, dx, dz)) continue;
        b.climb = { X0: b.X, Z0: b.Z, Y0: b.Y, X1: tx, Z1: tz, Y1: ty, t: 0, dur: 0.45 + (ty - feet) * 0.22 }; b.loco = 'climb'; b.ledgeT = 0; b.buffer = 0; b.vx = b.vz = 0;
        turnTo(Math.atan2(dz, dx), 14); b.stamina = Math.max(0, b.stamina - 6); b.regenT = TUNE.regenDelay; b.crouch = false; // (turned to the ledge, not snapped: D-358)
        return true;
      }
      return false;
    }
    return false;
  }
  // gravity and the ground: falling, landing, staying on a slope going down
  function settle(h) {
    let gY = floorAt(b.X, b.Z);
    if (!b.ground) {
      b.vy -= TUNE.gravity * (b.vy < 0 ? TUNE.fallGrav : 1) * h; b.Y += b.vy * h; // (the fall heavier than the rise: a jump that lands, D-365)
      if (b.vy < 0 && unwedge(Math.max(b.Y, gY))) gY = floorAt(b.X, b.Z);
      if (b.vy < 0 && b.Y <= gY) { b.Y = gY; land(); }
      else b.coyote = Math.max(0, b.coyote - h);
      if (b.vy > 0 && b.Y > b.fallFrom) b.fallFrom = b.Y;
    } else {
      // (walking down a slope or a small step: the feet follow the ground; a real drop starts a fall)
      // (a step up or down — more than a slope gives in a step —: where the feet stand changes at once, the drawn height eases
      // over it, yOff: D-356)
      if (gY < b.Y - 0.45) { b.ground = false; b.loco = 'air'; b.coyote = TUNE.coyote; b.vy = 0; b.fallFrom = b.Y; }
      else { const d = gY - b.Y; if (Math.abs(d) > 0.06) b.yOff = G.clamp(b.yOff - d, -0.7, 0.7); b.Y = gY; }
    }
    // (never under the ground: the world moved under the feet — an earthquake, a crater — and the body stands on it)
    if (b.Y < gY - 0.05) { b.Y = gY; if (b.vy < 0) b.vy = 0; }
  }
  // falling past a ledge the rim hangs over — a jump that fell short of a square's plinth, the rim carried over its edge while
  // the feet were within a step of its top —: the body slides out along the face as far as it was in, never left inside the
  // stone (climbed from there, the feet went through the edge: the e6 «plano» of the generation 17, L-653). The rim's points
  // over a floor too high for the feet push it back; caught between two such, or with nowhere free behind, it is left. Out
  // along the face and down, never up: onto ground no higher than the feet — pushed back onto the floor it walked off, a body
  // falls off it again, and again: the feira#11718 of the generation-18 metropole, its floor 0.35 m under the street, a strip
  // of the lot's own ground 0.48 m lower between them, and the body never got back to the street — L-669)
  function unwedge(feet) {
    const r = TUNE.radius, hit0 = b.stairHit; let px = 0, pz = 0;
    for (const [dx, dz] of RIM) if (solidAt(b.X + dx * r, b.Z + dz * r, feet) === 'ledge') { px -= dx; pz -= dz; }
    const l = Math.hypot(px, pz); let out = false;
    if (l > 0.5) { px /= l; pz /= l;
      for (let s = 0.02; s < r + 0.03 && !out; s += 0.02) { const X = b.X + px * s, Z = b.Z + pz * s;
        if (floorAt(X, Z) > feet + 0.1 || blocked(X, Z, feet, px, pz) || RIM.some(([dx, dz]) => solidAt(X + dx * r, Z + dz * r, feet) === 'ledge')) continue;
        b.X = X; b.Z = Z; out = true; const vn = b.vx * px + b.vz * pz; if (vn < 0) { b.vx -= px * vn; b.vz -= pz * vn; } } }
    b.stairHit = hit0; // (asking is not running into a flight)
    return out;
  }
  function land() {
    const drop = b.fallFrom - b.Y;
    b.vy = 0; b.ground = true; b.loco = b.act && b.act.lock ? 'busy' : 'ground'; b.coyote = TUNE.coyote; b.airT = 0;
    if (drop > 1.1) b.landT = Math.min(0.35, 0.12 + drop * 0.05);
    if (drop > 0.5) G.Audio && G.Audio.play && G.Audio.play('thud', b.crouch ? 0.5 : 1);
    // a real fall hurts as the world hurts: the world's damage, the world's death — dealt at the end of the step, when
    // the body's motion is done with (a death ends the body, and nothing of the step may come after it)
    if (drop > TUNE.hurtFall) b.hurt += (drop - TUNE.hurtFall) * 14;
    b.fallFrom = b.Y;
  }

  // ------------------------------ the body's act (an interaction's hands) ------------------------------
  // Av.act({ anim, dur, lock, at, done, keep, face, to, toT, free, world, op, contact, then, fail, reach }) — the animation
  // plays, the feet keep still if lock, done() runs at the end; keep(), when given, is asked every step: false, and the act stops
  // there, undone (the one in the arms walked away).
  //  · world: its clock is the world's own (S.clock): with the world stopped — the menu — it waits; and it lasts the world
  //    seconds the same act lasts for anyone of the world (the stroke of an axe, the berries of a load, a meal at the store)
  //  · op(v): what it does to the world — asked at its contact (contact, or at[0]), done by the world in its own step
  //    (Possess.apply), its answer { ok, why, … } read back: ok → then(res), not → fail(res); the act ends only once the world
  //    has answered, and done(res) has the answer. Before the contact nothing has happened: an act cut short changes nothing
  //  · cut(): the act cut short before the world answered its contact (a step away, the world's push, sleep, keep false): what
  //    it had begun in the world at its start is let go there (the crate held for the hands from the key: Act.abort)
  //  · reach(a) → { X, Y, Z, w, wid }: where the hands go meanwhile (a point of the world, how far) — only seen
  //  · vact: what the world sees the body doing meanwhile (v.act: the axe at the tree, the hands in the bush — the god's view
  //    draws it, and the people round it see it), as the body's place is the world's (written by the controller, as v.x)
  //  · the acts that move (20b, JOGABILIDADE.md §4.5): drive — the push of the gesture itself along the way the body faces, a
  //    curve of speeds over the act's time ([[u, m/s], …] or u → m/s) —; moveScale — how much of the player's walk the feet
  //    keep during it (0: none, the feet still; 1: all) —; turn — how fast the body may turn meanwhile, rad/s (toward face, or
  //    with moveScale toward where the player pushes) —; face: 'lock' — turned to the target held (Cam3D.lockOn) the whole act —;
  //    cancelAt — the windows of its time ([[u0, u1], …]) in which another act or a dodge may cut it: outside them a new act is
  //    refused (force: true takes it anyway); an act with none may be cut at any time, as before
  Av.act = function (o) {
    if (!b) return false;
    if (b.act && !o.force && !cuttable(b.act)) return false; // (an act in its committed part: not cut — D-366)
    // (at a place the hands work where the body is: the feet stay, the place held — but an act with a walk to it gets up first)
    if (b.seat && o.to) standUp(true, true);
    if (b.loco === 'dodge') { b.dodge = null; b.loco = 'ground'; } // (an act out of a dodge: the dodge ends there)
    b.act = { anim: o.anim || 'interact', dur: o.dur || 1, t: 0, tr: 0, lock: o.lock !== false, done: o.done || null, at: o.at || null, face: o.face === 'lock' ? undefined : o.face, to: o.to || null, toT: o.toT || 0.7, free: !!o.free, keep: o.keep || null,
      world: !!o.world, op: o.op || null, contact: o.contact !== undefined ? o.contact : o.at ? o.at[0] : o.dur || 1, then: o.then || null, fail: o.fail || null, cut: o.cut || null, reach: o.reach || null, asked: null, res: null, vact: o.vact || '',
      drive: o.drive || null, moveScale: Number.isFinite(o.moveScale) ? G.clamp(o.moveScale, 0, 1) : 0, turn: Number.isFinite(o.turn) ? Math.max(0, o.turn) : 0, faceLock: o.face === 'lock', cancelAt: Array.isArray(o.cancelAt) ? o.cancelAt : null };
    if (b.act.lock && b.loco !== 'seat') b.loco = 'busy';
    if (o.face !== undefined && o.face !== 'lock') b.faceTo = o.face; else if (b.act.faceLock && IN.lock) b.faceTo = Math.atan2(IN.lock.Z - b.Z, IN.lock.X - b.X);
    b.wc = G.S.clock;
    return true;
  };
  Av.actNow = () => (b && b.act ? b.act : null); // (for the tests and the HUD: the act in course, read only)
  // (an act may be cut now: one with no windows at any time; one with cancelAt only inside one of them — u, its share of its time)
  function cuttable(a) { if (!a || !a.cancelAt) return true; const u = a.dur > 0 ? a.t / a.dur : 1; return u >= 1 || a.cancelAt.some(w => u >= w[0] && u <= w[1]); }
  Av.cuttable = () => !!(b && cuttable(b.act));
  // the act's time, once a frame: the world's seconds for an act of the world, the body's own for the rest; the contact asks the
  // world (and plays its beat), the answer is read when the world has given it, and the act ends after its time and its answer
  function tickAct(v, dr, dw) {
    const a = b.act; if (!a) return;
    a.t += a.world ? dw : dr;
    if (a.at && !a.atDone && a.t >= a.at[0]) { a.atDone = true; if (a.at[1]) a.at[1](); }
    // (asked from where the body stands: if the world moves it before doing it — a building rising there, a push —, what the
    // hands meant there is not done)
    if (a.op && !a.asked && a.t >= a.contact) { const op = a.op, x0 = v.x, y0 = v.y, lock = a.lock; a.asked = G.Possess.apply(w => (lock && (w.x !== x0 || w.y !== y0) ? { ok: false, why: '' } : op(w))); }
    if (a.asked && !a.res && a.asked.res) { a.res = a.asked.res; if (a.res.dropped) { b.act = null; b.faceTo = undefined; if (b.loco === 'busy') b.loco = 'ground'; return; } if (a.res.ok) { if (a.then) a.then(a.res); } else if (a.fail) a.fail(a.res); }
    if (a.t >= a.dur && (!a.asked || a.res)) { const d = a.done, r = a.res; b.act = null; b.faceTo = undefined; if (b.loco === 'busy') b.loco = 'ground'; if (d) d(r); }
  }
  Av.busy = () => !!(b && b.act);
  // sitting down where the body stands (until the player walks); and a wave of the hand to those around
  Av.sit = function () { if (!b) return false; if (b.act && b.act.sit) { cutAct(); b.loco = 'ground'; return true; } if (!b.ground || b.loco !== 'ground' || b.act) return false; Av.act({ anim: 'rest', dur: 1e9, lock: true }); b.act.sit = true; return true; };
  Av.wave = function () { if (!b || b.loco !== 'ground') return false; return Av.act({ anim: 'wave', dur: 1.6, lock: false }); };
  // a dance where the body stands, until the player walks (or presses the key again)
  Av.dance = function () { if (!b) return false; if (b.act && b.act.anim === 'dance') { cutAct(); b.loco = 'ground'; return false; } if (!b.ground || b.loco !== 'ground' || b.act) return false; return Av.act({ anim: 'dance', dur: 1e9, lock: true, free: true }); };
  Av.dancing = () => !!(b && b.act && b.act.anim === 'dance');
  // how deep the water is round the legs (metres; 0 on dry ground)
  Av.wade = () => (b && b.loco !== 'swim' ? b.wade : 0);
  Av.climbing = () => !!(b && b.climb);
  Av.rest = () => { if (b && b.caps) b.stamina = b.caps.stamina; }; // (a drink of water: the breath comes back)
  // (the fight's doors, 20f: the breath a blow, the guard or a parry takes — false, and nothing taken, with none left; n 0 only
  // holds its coming back —; and the weight of a blow that lands, the body's own time all but stopped for s seconds)
  Av.spend = function (n) { if (!b || !b.caps) return false; if (n > 0 && b.stamina < 1) return false; b.stamina = Math.max(0, b.stamina - Math.max(0, n || 0)); b.regenT = TUNE.regenDelay; return true; };
  Av.hitstop = s => { if (b) b.stopT = Math.max(b.stopT || 0, G.clamp(s || 0, 0, 0.2)); };
  // (at a place the act is cut and the body stays on it: a verb asked over a sip at the tavern's table put the seated body «on the ground» —
  // the place's own step never ran again, and getting up never let the place go — L-2177)
  Av.cancelAct = () => { if (b && b.act) { cutAct(); if (b.loco !== 'seat') b.loco = 'ground'; } };
  // (an act cut short: what it had asked of the world and the world has not yet done is let go — it never happens)
  function cutAct() { const a = b.act; if (a && a.asked && !a.asked.res) a.asked.cancel = true; b.act = null; b.faceTo = undefined; if (b.loco === 'busy') b.loco = 'ground'; if (a && a.cut && !a.res) a.cut(); }

  // ------------------------------ a blow taken (D-333) ------------------------------
  // what the world dealt the body (Possess.hits, noted in the world's step by the one door of a hurt, Vg.damage): the body
  // answers it as a body would — a flinch away from it, a push along it (the bigger the blow, the farther), thrown down by a big
  // one (a giant's, the leap of a cat — the world's own downT keeps it down as long as the world says); the eye shakes and turns
  // toward what struck (Cam3D), the edges of the picture go red on the side it came from and the life bar drops where it can be
  // seen (IncUI), the blow and the breath are heard. And the blow that missed — a step back in time: the jaws shut on the air
  const RISE_UP = 0.75; // (seconds of getting up from a fall)
  const lastHit = () => { const H = G.Possess.hits(); return H.length ? H[H.length - 1].n : 0; };
  function takeHits(v) {
    const H = G.Possess.hits(); for (const e of H) { if (e.n <= b.hitN) continue; b.hitN = e.n; react(v, e); }
    const M = G.Corpo ? G.Corpo.misses() : null; if (M) for (const m of M) { if (m.t <= b.missT) continue; b.missT = m.t; dodged(v, m); }
  }
  Av.react = (v, e) => (b ? react(v || G.Possess.body(), e) : null); // (the proofs: a blow answered as the world would deal it)
  function react(v, e) {
    if (!v || e.cause === 'drown') return; // (the water's own hurt: the drowning has its own signs)
    const L = TL(); let ux = 0, uz = 0;
    if (e.from) { let dx = v.x - e.from[0], dy = v.y - e.from[1]; let l = Math.hypot(dx, dy);
      if (l < 0.05 && e.from.length > 3) { dx = e.from[2]; dy = e.from[3]; l = Math.hypot(dx, dy); } // (on it: the way the beast came)
      if (l > 1e-6) { ux = dx / l; uz = dy / l; } }
    const amt = e.amt || 0, big = !!e.big; const fall = e.cause === 'queda';
    const K = fall || !(ux || uz) ? 0 : big ? 3.4 : G.clamp(0.5 + amt * 0.06, 0.6, 2.2);
    if (b.loco === 'swim') { b.vx += ux * K * 0.6; b.vz += uz * K * 0.6; } else { b.kx += ux * K; b.kz += uz * K; }
    b.hitT = 0.55; b.hitK = G.clamp(amt / 28, 0.35, 1); b.hitX = ux; b.hitZ = uz;
    // (thrown down: from the feet, the hands at work, a seat; never off a flight, a ledge, the water)
    if ((big || e.down > 0) && !fall && (b.loco === 'ground' || b.loco === 'air' || b.loco === 'busy' || b.loco === 'seat' || b.loco === 'down' || b.loco === 'dodge')) {
      if (b.seat) standUp(true, true); cutAct();
      if (b.loco !== 'down' && (ux || uz)) turnTo(Math.atan2(-uz, -ux), 16); // (facing what struck it: it goes down on its back, away from it — twisted round as it falls, never snapped: D-358)
      b.dodge = null; b.pivot = null; b.crouch = false; b.loco = 'down'; b.downB = Math.max(b.downB, e.down > 0 ? 0.35 : 1.25); b.rise = 0; b.vx = b.vz = 0; b.ground = true;
    } else if (b.act && !b.act.sit && b.loco === 'busy' && amt >= 6) cutAct(); // (a blow stops the hands)
    const src = e.from ? { X: e.from[0] * L, Z: e.from[1] * L } : null;
    G.Cam3D && G.Cam3D.shake && G.Cam3D.shake(big ? 1 : G.clamp(0.3 + amt / 45, 0.3, 0.85), src);
    G.IncUI && G.IncUI.hurt && G.IncUI.hurt(e, src);
    if (G.Audio && G.Audio.play) { G.Audio.play(big ? 'thud' : 'hit', big ? 1 : G.clamp(0.5 + amt / 40, 0.5, 1)); if (amt >= 4) G.Audio.play('gasp', 0.55); }
  }
  function dodged(v, m) {
    const L = TL(); G.Cam3D && G.Cam3D.shake && G.Cam3D.shake(0.18, { X: m.x * L, Z: m.y * L });
    G.Audio && G.Audio.play && G.Audio.play('swish', 0.8);
    if (b.dodgeT <= 0 && G.IncUI && G.IncUI.toast) { b.dodgeT = 8; G.IncUI.toast('Escapou por pouco!', 1.6); }
    void v;
  }
  Av.hurtNow = () => (b ? { loco: b.loco, downB: b.downB, rise: b.rise, hitT: b.hitT, kx: b.kx, kz: b.kz, hitN: b.hitN, yaw: b.yaw, anim: b.anim } : null); // (for the proofs)

  // ------------------------------ the step and the frame ------------------------------
  function step(v, h) {
    // the world moved the body (a building rose where it stood, a load, the world's own push): the world is right
    // (and what the hands were doing there is left undone: the fish in that water, the hug of the one left behind)
    // (and a place it held is let go there: the world's step lets it go too, out of the building — Possess.update)
    if (Math.abs(v.x - b.wx) > 1e-6 || Math.abs(v.y - b.wy) > 1e-6) { if (b.seat) { b.seat = null; G.Possess.apply(w => { G.Possess.unuse(w); return { ok: true }; }); } b.X = b.pX = v.x * TL(); b.Z = b.pZ = v.y * TL(); b.lv = G.Possess.level(); b.inB = null; b.inP = null; b.stair = null; b.Y = b.pY = floorAt(b.X, b.Z); indoorAfter(v); b.vx = b.vz = b.vy = 0; b.ground = true; b.loco = 'ground'; b.climb = null; cutAct(); b.dodge = null; b.pivot = null; b.yOff = b.yOffV = 0; b.faceGoal = undefined; }
    b.pX = b.X; b.pY = b.Y; b.pZ = b.Z; b.pYaw = b.yaw; b.pyOff = b.yOff; b.pvx = b.velX || 0; b.pvz = b.velZ || 0;
    if ((b.capsT -= h) <= 0 || !b.caps) { b.caps = G.Possess.caps(v); b.capsT = 0.5; b.h = 1.75 * (G.People3D ? G.People3D.look(v).s : 1); }
    // (the blows the world dealt the body since the last step, and the ones it missed: answered now — D-333)
    takeHits(v);
    { const f = Math.exp(-(b.loco === 'down' ? 3.2 : 6.5) * h); b.kx *= f; b.kz *= f; if (Math.abs(b.kx) + Math.abs(b.kz) < 0.02) b.kx = b.kz = 0; }
    if (b.hitT > 0) b.hitT = Math.max(0, b.hitT - h); if (b.rise > 0) b.rise = Math.max(0, b.rise - h); if (b.dodgeT > 0) b.dodgeT -= h;
    if (b.dodgeCD > 0) b.dodgeCD -= h; b.jumpT += h; if (!b.ground) b.airT += h;
    // (the presses of the dodge and the crouch, kept a moment for the step that can take them — and then gone: a press made while
    // the hands are busy is not a dodge a second later)
    if (IN.dodge) { b.dodgeBuf = 0.18; IN.dodge = false; } else if (b.dodgeBuf > 0) b.dodgeBuf -= h;
    if (IN.crouch) { b.crouchBuf = 0.15; IN.crouch = false; } else if (b.crouchBuf > 0) b.crouchBuf -= h;
    // (asleep — the world's sleep —: off the place it was at, into its bed)
    if (v.sleeping && b.loco !== 'sleep') { cutAct(); if (b.seat) standUp(true, true); b.loco = 'sleep'; if (b.inShell) toBed(v); }
    // (sitting, the body gets up as soon as the player walks or jumps)
    // (and a free act — a prayer, a meal — is left there: what it had asked of the world and the world had not yet done never happens;
    // at a place, the place's own step gets it up)
    if (b.act && (b.act.sit || b.act.free) && b.loco !== 'down' && (Math.abs(IN.mx) + Math.abs(IN.mz) > 0.2 || b.buffer > 0 || IN.jump || b.dodgeBuf > 0)) { cutAct(); if (b.loco !== 'seat') b.loco = 'ground'; }
    if (b.act && b.act.keep && !b.act.keep()) cutAct();
    // (a dodge asked during an act: the act is let go where it may be — in its windows, cancelAt; one with none, at any time —
    // and the body dodges: JOGABILIDADE.md §4.5)
    if (b.act && !b.act.sit && b.dodgeBuf > 0 && b.loco !== 'seat' && b.loco !== 'down' && cuttable(b.act)) { cutAct(); if (b.loco === 'busy') b.loco = 'ground'; }
    // (the act's own time is counted once a frame — tickAct: the world's or the body's; here only the feet's and the turn: toward
    // what it faces — the target held, for an act that turns to it —, at its own rate when it has one)
    if (b.act) {
      const a = b.act; a.tr += h;
      if (a.faceLock && IN.lock) b.faceTo = Math.atan2(IN.lock.Z - b.Z, IN.lock.X - b.X);
      if (b.faceTo !== undefined && !(a.moveScale > 0 && a.turn)) { if (a.turn) steer(b.faceTo, a.turn, h); else { const da = wrap(b.faceTo - b.yaw); b.yaw += da * (1 - Math.exp(-8 * h)); } }
    }
    // (a way the body turns to by itself, where the player's feet are not: up a flight, onto a ledge, thrown down)
    if (b.faceGoal !== undefined) { if (b.loco === 'ground' || b.loco === 'air' || b.loco === 'dodge' || b.loco === 'swim') b.faceGoal = undefined; else { steer(b.faceGoal, b.faceRate, h); if (Math.abs(wrap(b.faceGoal - b.yaw)) < 0.005) { b.faceGoal = undefined; b.yawV = 0; } } }
    (LOCO[b.loco] || LOCO.ground).step(v, h, b.caps);
    if (b.dodge && b.loco !== 'dodge') b.dodge = null; if (b.pivot && b.loco !== 'ground') b.pivot = null; // (taken out of them by anything else: over)
    // (the drawn height eases back to the feet over a step: a spring with no bounce — D-356)
    { const w = TUNE.stepEase; b.yOffV += (-w * w * b.yOff - 2 * w * b.yOffV) * h; b.yOff += b.yOffV * h; if (Math.abs(b.yOff) < 1e-4 && Math.abs(b.yOffV) < 1e-3) b.yOff = b.yOffV = 0; }
    indoorAfter(v);
    if (b.landT > 0) b.landT -= h;
    const dX = b.X - b.pX, dZ = b.Z - b.pZ; const d = Math.hypot(dX, dZ);
    b.speed = d / h;
    // (what the animation reads, JOGABILIDADE.md §4.4: the push of the step — eased, m/s² —, the turn, the gait; the crouch for
    // the drawing of before)
    b.velX = dX / h; b.velZ = dZ / h; { const k = 1 - Math.exp(-20 * h); b.accX += ((b.velX - b.pvx) / h - b.accX) * k; b.accZ += ((b.velZ - b.pvz) / h - b.accZ) * k; }
    b.turnV = wrap(b.yaw - b.pYaw) / h; b.gait = gaitOf(); IN.sneak = b.crouch;
    // the world's record of the body: where it is (tiles), that it walks, which way it faces
    const S = G.S; const nxT = b.X / TL(), nyT = b.Z / TL();
    v.x = nxT; v.y = nyT; b.wx = nxT; b.wy = nyT;
    v.moving = b.speed > 0.2 && (b.ground || b.loco === 'swim');
    // (in the water where the world does not walk, the world is told the body is the player's swimmer — it leaves it there;
    // the god sees it swim. A building that rose on the water is no water to swim in: the world moves the body out — L-150)
    const afl = !W.walkableXY(v.x, v.y) && !(W.inb(v.x, v.y) && W.blocked(W.idx(v.x, v.y))) && waterAt(b.X, b.Z) > -Infinity; if (afl !== G.Possess.afloat(v)) G.Possess.setAfloat(afl);
    // (and what it does that the world's people answer: swimming, dancing — the dancers round it stop when it stops —, the axe
    // at the tree, the hands in the bush: the act's own vact, until it ends)
    const va = b.loco === 'swim' ? 'swim' : b.act ? b.act.vact || (b.act.anim === 'dance' ? 'dance' : '') : b.crouch ? 'sneak' : '';
    if (va) v.act = va; else if (VACT.has(v.act)) v.act = '';
    if (d > 0.001) { v.walkPh += (d / TL()) * 8.5; G.faceTo(v, dX, dZ); }
    // (feet wear the paths, as everybody's do — counted here, worn by the world in its step: Av.frame)
    if (v.moving) { const i = W.idx(v.x, v.y); if (S.type[i] >= T.SAND) { const k = b.wear.length; if (k && b.wear[k - 2] === i) b.wear[k - 1] += (d / TL()) * 1.3; else b.wear.push(i, (d / TL()) * 1.3); } }
    animate(v, h);
  }
  // (the states of the 3D one is seated in, the low ones of the floor and the fire, and a seated gesture's state on the ground —
  // where there is no seat: eating with the bowl in the lap, rocking the child —, as Interiors gives them out: ON_GROUND)
  const SEATED_ST = { sit: 1, eat: 1, rock: 1 }, LOW_ST = { rest: 1, pray: 1, cook: 1, low: 1, sleep: 1, sick: 1, eatg: 1, rockg: 1 };
  const GROUND_ST = { sit: 'rest', sittalk: 'rest', eat: 'eatg', rock: 'rockg' };
  // (at a place: its own state — Anim3D.resolve: a state, or an act of the world's people —; an act of the hands there shows
  // as it is where one stands at the place, and seated only if it is a seated one — eating at the table —, else the seat's
  // own; getting up, standing)
  function seatSt() {
    const s = b.seat; if (s.out) return 'idle';
    const own = G.Anim3D.resolve(s.st); const a = b.act; if (!a) return own;
    const an = G.Anim3D.resolve(a.anim);
    if (!SEATED_ST[own] && !LOW_ST[own]) return an;
    return SEATED_ST[own] && seatedClip(an) ? an : own;
  }
  // (a seated gesture: the household's, or a clip made on the seat — base 'sit': the meal and the sip at a tavern's table, P7 D-769)
  const seatedClip = st => !!SEATED_ST[st] || !!(G.Anim3D.CLIPS && G.Anim3D.CLIPS[st] && G.Anim3D.CLIPS[st].base === 'sit');
  // the animation the body is in: from what it really does (Part 25: no walking in place, no sliding in idle) — its state, for the
  // world's proofs, the camera and the sounds. The pose is no longer made here, on the fixed step: the body's animator makes it in
  // every frame drawn, from the motion of that frame (People3D → Anim3D.drive, the same as for everyone: 20a, D-345)
  function animate(v, h) {
    const caps = b.caps; const carry = !!(v.carry && v.carry.n > 0);
    let st;
    if (b.loco === 'down') st = 'knocked';
    else if (b.rise > 0) st = 'rise';
    else if (b.loco === 'sleep') st = 'sleep';
    else if (b.loco === 'seat') st = seatSt();
    else if (b.loco === 'climb') st = 'climb';
    else if (b.loco === 'stair') st = b.flight && b.flight.lad ? 'climb' : 'walk';
    else if (b.loco === 'swim') st = b.stamina <= 0 ? 'drown' : b.swimK > 0.5 ? 'swim' : 'tread';
    else if (b.act && b.act.to && b.act.tr < b.act.toT && b.speed > 0.22) st = 'walk';
    else if (b.act && (b.act.lock || b.speed < 0.22)) st = GROUND_ST[b.act.anim] || b.act.anim; // (a seated gesture with no seat: on the ground)
    else if (!b.ground) st = b.vy > 0.4 ? 'jump' : 'fall';
    else if (b.landT > 0) st = 'land';
    else if (b.speed > 0.22) st = IN.sneak || b.crawl ? 'sneak' : b.speed > caps.walk * 1.3 ? 'run' : carry ? 'carryWalk' : (b.wade > 0.35 ? 'wade' : 'walk');
    else if (b.turnT > 0) st = 'turn';
    else st = carry ? 'carry' : 'idle';
    if (st !== b.anim) { b.anim = st; b.animT = 0; }
    b.animT += h;
  }
  // ------------------------------ the body's pose in each frame drawn (20a) ------------------------------
  // What the animator reads of the body, for the frame: its state, its speed, its turn and its gain of speed, the act of its
  // hands and that act's own time (its contact on the world's), what the controller says of its gait (20b's motion, read with
  // care: JOGABILIDADE.md 4.4), the flinch of a blow and the look after the camera's eye. One object, filled each frame
  const ANIM_ACT = { swing: 1, low: 1, interact: 1, fight: 1 };
  function drawState(st, a) {
    const C = G.Anim3D.CLIPS || {};
    if (st === 'turn') return 'idle'; // (a turn on the spot is steps: the animator's)
    // (a gesture of the hands at the world's work: the clip of that work — the axe at the tree, the pick, the hands in the bush, the rod)
    if (a && ANIM_ACT[st] && a.vact) { const k = G.Anim3D.CLIP_OF && G.Anim3D.CLIP_OF[a.vact]; if (k && C[k]) return k; }
    return st;
  }
  function frameDrive(v, L, rdt, f) {
    const A3 = G.Anim3D; const F = b.anf || (b.anf = { I: {}, ph: 0, yaw: b.yaw, sp: b.speed, acc: 0 }); const I = F.I;
    const m = Av.motion ? Av.motion() : null; // (20b's motion of the body, where it has it)
    const yaw = m && Number.isFinite(m.yaw) ? m.yaw : b.yaw, sp = m && Number.isFinite(m.speed) ? m.speed : b.speed;
    const dt = Math.max(1e-4, rdt); let dy = yaw - F.yaw; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; F.yaw = yaw;
    const acc = m && Number.isFinite(m.accX) && Number.isFinite(m.accZ) ? m.accX * Math.cos(yaw) + m.accZ * Math.sin(yaw) : (sp - F.sp) / dt; F.sp = sp; F.acc += (G.clamp(acc, -12, 12) - F.acc) * (1 - Math.exp(-10 * dt));
    const a = b.act; const st = drawState(b.anim, a); const C = A3.CLIPS ? A3.CLIPS[st] : null;
    I.st = st; I.sp = b.loco === 'swim' ? 0 : sp; I.yaw = yaw; I.yawV = m && Number.isFinite(m.turnV) ? m.turnV : dy / dt; I.acc = F.acc;
    const g = (m && m.gait) || b.gait; I.run = b.anim === 'run' || g === 'trote' || g === 'disparada' ? 1 : 0; I.walk = g === 'andar' && sp < 2.6 ? 1 : 0;
    // (a posture's own clock: the swim's stroke, the climb's height, the seconds of the rest; the act's clip in the act's own time)
    if (b.anim === 'swim' || b.anim === 'tread' || b.anim === 'drown') { F.ph += dt * (b.anim === 'swim' ? 2.2 + b.speed * 1.4 + (b.stroke > 0 ? 3 : 0) : b.anim === 'drown' ? 5 : 1.6); I.t = F.ph; }
    else if (b.anim === 'climb') I.t = b.climb ? b.climb.t / b.climb.dur : b.flight ? (b.flight.t * 1.6) % 1 : b.animT;
    else I.t = b.animT;
    I.clipK = undefined; I.over = null; I.overK = undefined;
    if (C && a && a.dur > 0 && a.dur < 1e8) { const k = G.clamp(a.t / a.dur, 0, 1); I.clipK = a.world && a.contact > 0 ? A3.warpTime(C, k, G.clamp(a.contact / a.dur, 0.05, 0.95)) : C.loop ? undefined : k; }
    // (a gesture of the hands while the feet go on: on the top of the body, over the stride)
    if (a && !a.lock && b.speed > 0.22 && A3.CLIPS && A3.CLIPS[a.anim]) { I.over = a.anim; I.overK = a.dur > 0 && a.dur < 1e8 ? G.clamp(a.t / a.dur, 0, 1) : undefined; }
    I.drunk = L.drunk || 0; I.tired = b.caps && b.caps.stamina > 0 ? G.clamp(1 - b.stamina / (b.caps.stamina * 0.35), 0, 1) * 0.6 : 0; I.id = v.id;
    // (what the layers' end needs of the body, read now: the feed is whole in itself — drawn after the body is gone, it is the
    // last frame's, never a read of a body that is no more, L-1112)
    const st2 = b.anim, wet = st2 === 'swim' || st2 === 'tread' || st2 === 'drown';
    let ly = 0; if (st2 === 'idle' || st2 === 'walk' || st2 === 'carry') { let la = IN.camYaw - b.yaw; while (la > Math.PI) la -= TAU; while (la < -Math.PI) la += TAU; ly = Math.abs(la) < 1.9 ? -G.clamp(la, -1, 1) * 0.55 : 0; }
    I.ly = ly; I.fl = b.hitT > 0 && st2 !== 'knocked' && st2 !== 'sleep' && !wet ? b.hitK * G.smooth(0, 0.2, b.hitT) : 0;
    { const c = Math.cos(b.yaw), sn = Math.sin(b.yaw); I.fw = (b.hitX || 0) * c + (b.hitZ || 0) * sn; I.sd = -(b.hitX || 0) * sn + (b.hitZ || 0) * c; }
    I.post = post;
    return I;
  }
  // (after the layers: the look after the camera's eye, standing and walking; and a blow's flinch over what the body does —
  // thrown the way the blow pushes it, the arms up before the face, the head back)
  function post(out, dt, I) {
    out.lookY = (out.lookY || 0) + (I.ly - (out.lookY || 0)) * (1 - Math.exp(-5 * dt));
    const fl = I.fl;
    if (fl > 0) { const fw = I.fw, sd = I.sd;
      const mix = (j, x) => { out[j] = G.lerp(out[j] || 0, x, fl); }; const add = (j, x) => { out[j] = (out[j] || 0) + x * fl; };
      add('lean', fw * 0.55); add('sway', sd * 0.32); add('twist', -sd * 0.25); add('neck', -0.35); add('crouch', 0.12); add('knL', 0.3); add('knR', 0.25);
      mix('shLp', -1.85); mix('shRp', -1.7); mix('shLr', 0.35); mix('shRr', -0.35); mix('elL', 1.75); mix('elR', 1.6); }
  }
  Av.frame = function (rdt) {
    const v = G.Possess.body(); if (!b || !v || v.id !== b.id) return;
    if (b.stopT > 0) { const k = Math.min(rdt, b.stopT); b.stopT -= k; rdt -= k * 0.9; } // (a blow's weight: the body's own time all but stops a moment — Av.hitstop, 20f)
    b.acc = Math.min(0.25, b.acc + rdt);
    while (b && b.acc >= TUNE.step) { b.acc -= TUNE.step; step(v, TUNE.step); }
    if (!b) return; // (the step ended the body: the world took it)
    // (a real fall hurts as the world hurts, out of breath under the water the world drowns: the world's damage and the world's
    // death, dealt by the world in its own step — Possess.apply — as every other change the body makes to the world)
    if (b.hurt > 0 || b.drownHurt > 0) { const f = b.hurt, d = b.drownHurt; b.hurt = b.drownHurt = 0; G.Possess.apply(w => { if (f > 0) G.Vg.damage(w, f, 'queda', false); if (d > 0 && G.S.villagers.has(w.id)) G.Vg.damage(w, d, 'drown', false); return { ok: true }; }); }
    // (the paths the feet wore since the last frame: worn by the world in its step, as everybody's)
    if (b.wear.length) { const m = b.wear.slice(); b.wear.length = 0; G.Possess.apply(() => { const S = G.S; for (let k = 0; k < m.length; k += 2) { const i = m[k]; const lv = G.pathLevel(S.wear[i]); S.wear[i] = Math.min(G.WEAR_MAX, S.wear[i] + m[k + 1]); if (G.pathLevel(S.wear[i]) !== lv) G.Nature.markDirty(i); } return { ok: true }; }); }
    // (the act's time: the world's seconds since the last frame — none with the world stopped — or the body's own)
    { const dw = Math.max(0, G.S.clock - (b.wc === undefined ? G.S.clock : b.wc)); b.wc = G.S.clock; tickAct(v, rdt, dw); if (!b) return; }
    // the picture between two steps (interpolated: smooth at any frame rate)
    const f = b.acc / TUNE.step;
    const P3 = G.People3D; if (P3) {
      // (its look, kept and filled again each frame — nothing made but what changes, L-1105)
      const L = P3.lookInto ? P3.lookInto(b.L0 || (b.L0 = {}), v) : P3.look(v);
      // (the hands: an act's own reach for a point of the world; a load waiting on the ground while the hands work at something)
      const a = b.act; L.reach = a && a.reach ? a.reach(a) : null;
      if (L.held && a && HANDS_AT.has(a.anim)) L.held = P3.setDown(L.held);
      b.L = L;
      // (and what the body's animator reads: this frame's motion — the pose is made in the frame drawn, from it: 20a)
      const D = G.Anim3D && G.Anim3D.drive ? frameDrive(v, L, rdt, f) : null;
      const o = b.feed || (b.feed = {});
      o.id = v.id; o.X = G.lerp(b.pX, b.X, f); o.Y = G.lerp(b.pY, b.Y, f); o.Z = G.lerp(b.pZ, b.Z, f); o.yaw = D ? D.yaw : b.yaw; o.pose = b.pose; o.look = L; o.sp = b.speed; o.wade = b.wade; o.ground = b.ground;
      o.act = b.act; o.swim = b.loco === 'swim'; o.swimK = b.swimK; o.drown = b.drown; o.stroke = b.stroke > 0; o.drive = D; o.gnd = Av.floorAt;
      P3.avatar = o;
    } // (its speed, its wading and footing: for the dust and the splashes it raises)
  };
  // the body as the picture has it now, between two steps (D-356): the place and the yaw interpolated, the drawn height with a
  // step eased (yOff — where the feet stand is the world's, b.Y); written into the body state for the drawing (drawX, drawY,
  // drawZ, drawYaw) and read by the camera, the animation (Av.motion) and the hands
  function drawn() {
    const f = G.clamp(b.acc / TUNE.step, 0, 1);
    b.drawX = G.lerp(b.pX, b.X, f); b.drawZ = G.lerp(b.pZ, b.Z, f); b.drawY = G.lerp(b.pY + (b.pyOff || 0), b.Y + (b.yOff || 0), f);
    b.drawYaw = b.pYaw + wrap(b.yaw - b.pYaw) * f; b.drawF = f;
    return b;
  }
  // where the body is, for the camera (interpolated; the step eased)
  // (in the water the eye looks at the head over the face of the water, wherever the body floats)
  // (the camera's own: the gait, and whether the player pushes ahead — the eye only swings behind a body that goes where it looks)
  Av.pos = function () {
    if (!b) return null; drawn(); const X = b.drawX, Y = b.drawY, Z = b.drawZ;
    const wy = b.loco === 'swim' ? waterAt(X, Z) : -Infinity; const il = Math.hypot(IN.mx, IN.mz);
    return { X, Y, Z, yaw: b.drawYaw, speed: b.speed, ground: b.ground, vy: b.vy, h: b.h, head: wy > -Infinity ? wy + 0.38 - Y : undefined, gait: b.gait, strafe: b.strafe, inFwd: il > 0.05 ? IN.mz / il : 0, sprintK: b.sprintK, loco: b.loco };
  };
  // what the animation reads (JOGABILIDADE.md §4.4, D-367): one object, filled again at each call — read it, copy what must be
  // kept; nothing of the body is written by reading it. A field the animation does not know it leaves alone
  const MOT = { id: 0, X: 0, Y: 0, Z: 0, yaw: 0, floorY: 0, yOff: 0, vx: 0, vz: 0, vy: 0, speed: 0, fwd: 0, side: 0, gait: 'parado', accX: 0, accZ: 0, accF: 0, accS: 0, turnV: 0, strafe: false, aimYaw: 0, crouch: false, dodge: null, pivot: null, ground: true, loco: 'ground', wade: 0, swim: false, stamina: 1, winded: false, sprintK: 0, landT: 0, airT: 0, jumpT: 9, act: null, actU: 0, paces: null, step: 1 / 60, f: 0 };
  const MOT_D = { kind: '', u: 0, yaw: 0, t: 0, dur: 0 }, MOT_P = { u: 0, dir: 0 }, MOT_A = { anim: '', u: 0, t: 0, dur: 0, drive: 0, moveScale: 0 };
  Av.motion = function () {
    if (!b) return null; drawn(); const M = MOT;
    M.id = b.id; M.X = b.drawX; M.Y = b.drawY; M.Z = b.drawZ; M.yaw = b.drawYaw; M.floorY = b.Y; M.yOff = b.drawY - G.lerp(b.pY, b.Y, b.drawF); M.f = b.drawF;
    M.vx = b.velX || 0; M.vz = b.velZ || 0; M.vy = b.vy; M.speed = b.speed;
    const c = Math.cos(b.yaw), sn = Math.sin(b.yaw); M.fwd = M.vx * c + M.vz * sn; M.side = -M.vx * sn + M.vz * c; // (the velocity in the body's frame: ahead, to its right — +Z the way it faces, D-337's frame)
    M.accX = b.accX; M.accZ = b.accZ; M.accF = b.accX * c + b.accZ * sn; M.accS = -b.accX * sn + b.accZ * c;
    M.gait = b.gait; M.turnV = b.turnV; M.strafe = b.strafe; M.aimYaw = b.aimYaw; M.crouch = b.crouch;
    if (b.dodge) { const d = b.dodge; MOT_D.kind = d.kind; MOT_D.u = d.u; MOT_D.yaw = d.yaw; MOT_D.t = d.t; MOT_D.dur = d.dur; M.dodge = MOT_D; } else M.dodge = null;
    if (b.pivot) { MOT_P.u = b.pivot.u; MOT_P.dir = b.pivot.dir; M.pivot = MOT_P; } else M.pivot = null;
    M.ground = b.ground; M.loco = b.loco; M.wade = b.wade; M.swim = b.loco === 'swim'; M.stamina = b.caps ? b.stamina / Math.max(1, b.caps.stamina) : 1; M.winded = b.winded; M.sprintK = b.sprintK;
    M.landT = b.landT; M.airT = b.airT; M.jumpT = b.jumpT;
    if (b.act) { const a = b.act; MOT_A.anim = a.anim; MOT_A.t = a.t; MOT_A.dur = a.dur; MOT_A.u = a.dur > 0 ? G.clamp(a.t / a.dur, 0, 1) : 1; MOT_A.drive = a.drive ? curveAt(a.drive, MOT_A.u) : 0; MOT_A.moveScale = a.moveScale; M.act = MOT_A; M.actU = MOT_A.u; } else { M.act = null; M.actU = 0; }
    M.paces = PACE; M.step = TUNE.step;
    return M;
  };
  // (the drawn body's place and yaw, between two steps — for a drawing line that does not read Av.motion itself: set on the
  // body the 3D draws, once a frame after Av.frame — Modes. A line that does read it marks People3D.avatar.drawn and is left alone)
  Av.present = function () {
    const P3 = G.People3D; const av = P3 && P3.avatar; if (!b || !av || av.id !== b.id || av.drawn) return;
    drawn(); av.X = b.drawX; av.Y = b.drawY; av.Z = b.drawZ; av.yaw = b.drawYaw;
  };
  Av.crouched = () => !!(b && b.crouch);
  Av.dodging = () => (b && b.dodge ? { kind: b.dodge.kind, u: b.dodge.u, yaw: b.dodge.yaw } : null); // (for the fight of the second wave: which part of a dodge the body is in)
  // the crouch from outside — a button of the screen (on true, off false, a toggle with nothing)
  Av.crouch = function (on) { if (!b) return false; const w = on === undefined ? !b.crouch : !!on; if (w !== b.crouch) IN.crouch = true; return w; };
  // (the gait from the speed against the paces, with a band each way: no flicker at a border — D-361)
  function gaitOf() {
    const sp = b.speed, g = b.gait, P = PACE;
    if (b.crouch && b.loco !== 'swim') return 'agachado';
    if (sp < (g === 'parado' ? 0.2 : 0.12) || b.loco === 'sleep' || b.loco === 'seat' || b.loco === 'down') return 'parado';
    if (!P.walk) return 'andar';
    const wj = P.walk * 1.12, js = (P.jog + P.sprint) / 2;
    if (P.sprint > P.jog + 0.05 && sp > js * (g === 'disparada' ? 0.94 : 1.04)) return 'disparada';
    if (P.jog > P.walk + 0.05 && sp > wj * (g === 'trote' || g === 'disparada' ? 0.94 : 1.04)) return 'trote';
    return 'andar';
  }
  Av.swimming = () => !!(b && b.loco === 'swim');
  // (tests and the dev panel: put the body somewhere, by the world's rules)
  Av.place = function (x, y) { const v = G.Possess.body(); if (!v || !b || !W.walkableXY(x, y)) return false; v.x = x; v.y = y; return true; };
})(window.G);
