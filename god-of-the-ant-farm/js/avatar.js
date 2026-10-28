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
// ============================================================
(function (G) {
  const W = G.W; const T = G.T;
  const Av = G.Avatar = { on: false };
  const TAU = Math.PI * 2;
  // what the feel is made of (every number here is a knob: the dev panel and the menu can turn them)
  const TUNE = Av.TUNE = {
    accel: 15, brake: 19, airAccel: 3.5, turn: 10, gravity: 21, coyote: 0.12, buffer: 0.14, stepUp: 0.6, radius: 0.32,
    runDrain: 20, staminaRegen: 16, jumpCost: 9, sneak: 0.45, wade: 0.58, road: 1.12, hurtFall: 6.5, step: 1 / 60,
    climbMax: 2.6, climbWait: 0.22, stoneStep: 0.35,
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
  const VACT = new Set(['swim', 'dance', 'chop', 'mine', 'gather', 'eat', 'pray', 'fish', 'lift', 'arrange', 'give']);
  G.worldHooks.push(() => { b = null; Av.on = false; });
  Av.state = () => b;
  // the player's wishes, filled by the input each frame (axes relative to the camera)
  const IN = Av.input = { mx: 0, mz: 0, run: false, jump: false, sneak: false, camYaw: 0 };

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
      const len = dx ? r[2] - r[0] : r[3] - r[1]; const lad = s.kind === 'escada-de-mao'; const y0 = lvY(s.lv0), y1 = lvY(s.lv1);
      const T = lad ? Math.abs(y1 - y0) / 0.55 : Math.hypot(len, y1 - y0) / Math.max(0.6, b.caps.walk * 0.55);
      const foot = at(0), top = at(len), land = [s.b[0], s.b[1]]; const W3 = (q, y) => [B.x * L + q[0], B.y * L + q[1], y];
      let P = null, lv = s.lv0;
      if (b.lv === s.lv0 && atFoot(s) && along > 0.4) { P = [[b.X, b.Z, b.Y], W3(foot, y0), W3(top, y1), W3(land, y1)]; lv = s.lv1; }
      else if (b.lv === s.lv1 && wx === 0 && wz === 0 && past(s, x, z, 1.4)) { P = [[b.X, b.Z, b.Y], W3(land, y1), W3(top, y1), W3(foot, y0), W3(s.a, y0)]; lv = s.lv0; }
      if (!P) continue;
      // (the times along it: steps on the level at a walk, the flight in its own time)
      const wk = Math.max(0.5, b.caps.walk * 0.6); P[0][3] = 0;
      for (let k = 1; k < P.length; k++) { const flat = Math.abs(P[k][2] - P[k - 1][2]) < 0.05; P[k][3] = P[k - 1][3] + (flat ? Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]) / wk : T); }
      b.flight = { P, T: P[P.length - 1][3], t: 0, lv, s: s.id, lad, up: lv === s.lv1, along: +along.toFixed(2), from: [+x.toFixed(2), +z.toFixed(2)] }; b.loco = 'stair'; Av.lastFlight = b.flight; b.yaw = Math.atan2(dz * (lv === s.lv1 ? 1 : -1), dx * (lv === s.lv1 ? 1 : -1)); b.vx = b.vz = 0;
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
    const ins = indoorAt(b.X, b.Z);
    if (!ins) { b.inB = null; b.inP = null; b.lv = undefined; b.stair = null; b.stairF = 0; b.inShell = false; }
    else { b.inB = ins.b; b.inP = ins.p; b.lv = ins.lv; b.inShell = ins.shell; b.stair = G.Space.stairIn(ins.p, ins.lv, ins.x, ins.z); b.stairF = b.stair ? stairF(b.stair, ins.x, ins.z) : 0; b.crawl = (ins.p.levels.find(q => q.lv === ins.lv) || {}).kind === 'jirau'; }
    const want = ins && ins.shell ? ins.b.id : 0;
    if (b.inAsk && b.inAsk.res) b.inAsk = null;
    // (the world has it indoors only by the door: a room of the building it came in by — Possess.cameBy; going out is free, L-175)
    if (!b.inAsk && want !== (v.inside || 0)) { const id = want; b.inAsk = G.Possess.apply(w => { if (id && (!G.S.buildings.has(id) || !G.Possess.cameBy(id))) return { ok: false, why: '' }; w.inside = id; return { ok: true }; }); }
    G.Possess.setLevel(ins && ins.shell && v.inside === ins.b.id ? ins.lv : null); // (once the world has it indoors)
  }
  Av.indoors = () => (b && b.inB && b.inShell ? { b: b.inB, p: b.inP, lv: b.lv, crawl: !!b.crawl } : null); // (for the camera and the 3D)
  // (the flight the body is going up or down now — the stair's id, its building's, how far along: the 3D lifts its lid)
  Av.flight = () => (b && b.loco === 'stair' && b.flight && b.inB ? { s: b.flight.s, b: b.inB.id, k: b.flight.T > 0 ? b.flight.t / b.flight.T : 1, up: !!b.flight.up } : null);
  // lying down on a bed of the plan (the world has the body asleep: Possess.sleep): on its sleeping place, the head to its wall
  Av.lieAt = function (B, it, sp) {
    const v = G.Possess.body(); const e = B && G.Space.planEntry(B.id); if (!b || !v || !e || !e.p) return false;
    const L = TL(); b.X = b.pX = B.x * L + sp.x; b.Z = b.pZ = B.y * L + sp.z; b.Y = b.pY = e.y0 + (e.p.levels.find(q => q.lv === it.lv) || { y: 0 }).y + sp.y + G.Space.FLOOR_UP;
    b.yaw = sp.ry + Math.PI / 2; b.bed = { b: B.id, it: it.id }; b.loco = 'sleep'; b.vx = b.vz = b.vy = 0; b.ground = true;
    v.x = b.wx = b.X / L; v.y = b.wy = b.Z / L; return true;
  };
  // (up from the bed: the nearest point of the room the body can stand on, all round it — one the house's door reaches on foot,
  // Interiors' own walk from the entrance: never a nook shut in by the furniture)
  function offBed() {
    const reached = (q) => { const R = q.p.reach && q.p.reach[q.lv]; if (!R) return true; const n = q.p.grid.n, cs = q.p.grid.cs; return !!R[Math.floor(q.z / cs) * n + Math.floor(q.x / cs)]; };
    const fits = (X, Z) => { const c = indoorAt(X, Z); if (!c || !c.walk || !c.shell || !reached(c)) return false; return RIM.every(([dx, dz]) => { const q = indoorAt(X + dx * TUNE.radius, Z + dz * TUNE.radius); return q && q.walk && q.shell; }); };
    for (let r = 0.3; r <= 1.8; r += 0.15) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; const X = b.X + Math.cos(a) * r, Z = b.Z + Math.sin(a) * r;
      if (fits(X, Z)) { b.X = b.pX = X; b.Z = b.pZ = Z; b.Y = b.pY = indoorAt(X, Z).y; return true; } }
    return false;
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
      lv: G.Possess.level(), inB: null, inP: null, inShell: false, stair: null, stairF: 0, crawl: false, inAsk: null,
    };
    { const B = v.inside && G.S.buildings.get(v.inside); if (B && G.Space.plan(B)) { b.inB = B; b.inP = G.Space.plan(B); } b.Y = b.pY = floorAt(X, Z); indoorAfter(v);
      // (indoors on a piece of furniture — a game loaded with the body in its bed —: up beside it)
      if (b.inShell && !v.sleeping) { const q = indoorAt(b.X, b.Z); if (!q || !q.walk) offBed(); } }
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
      for (const q of b.inP.stairs) { if (q.kind === 'degraus' || q.lv0 !== b.lv) continue; const r = q.r; if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) { b.stairHit = q; return 'stair'; } } }
    const ins = indoorAt(X, Z);
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
    return null;
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
      if (!rr) continue;
      const ddx = X + ox - cx, ddz = Z + oz - cz; const d = Math.hypot(ddx, ddz); const m = rr + TUNE.radius;
      if (d < m && d > 1e-4) { ox += ddx / d * (m - d); oz += ddz / d * (m - d); }
    }
    return [ox, oz];
  }

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
        if (c.t >= c.T) { b.lv = c.lv; b.loco = 'ground'; b.flight = null; b.fallFrom = b.Y; }
      },
    },
    // busy with the hands (chopping, picking, eating): the feet keep still until it is done
    // (an act with a place to be — the arms round someone — first takes the step or two to it, by the feet's own rules)
    busy: {
      step(v, h, caps) {
        const a = b.act; let went = false;
        if (a && a.to && a.tr < a.toT) { const dx = a.to[0] - b.X, dz = a.to[1] - b.Z, d = Math.hypot(dx, dz);
          if (d > 0.04) { const s = Math.min(d, caps.walk * 1.1 * h); const nx = b.X + dx / d * s, nz = b.Z + dz / d * s; if (!blocked(nx, nz, b.Y, Math.sign(dx), Math.sign(dz))) { b.X = nx; b.Z = nz; went = true; } } }
        if (!went) { b.vx *= Math.exp(-12 * h); b.vz *= Math.exp(-12 * h); }
        settle(h); if (!b.act) b.loco = 'ground';
      },
    },
  };
  Av.addLoco = (name, def) => { LOCO[name] = def; };

  function wish() {
    // the wish is camera-relative: forward is where the camera looks
    const cy = Math.cos(IN.camYaw), sy = Math.sin(IN.camYaw);
    let wx = cy * IN.mz - sy * IN.mx, wz = sy * IN.mz + cy * IN.mx; const l = Math.hypot(wx, wz);
    if (l > 1) { wx /= l; wz /= l; }
    return [wx, wz, Math.min(1, l)];
  }
  function move(v, h, caps, onGround) {
    const S = G.S;
    const [wx, wz, wl] = wish();
    const here = G.Space.surface(b.X, b.Z);
    // how fast the body wants to go: the person's walk, the run if there is breath, a road, a ford, a slope, hunger and tiredness
    let sp = caps.walk;
    const running = IN.run && caps.run > 1 && b.stamina > 1 && wl > 0.2 && !IN.sneak;
    if (running) sp *= caps.run;
    if (IN.sneak || b.crawl) sp *= TUNE.sneak;
    if (b.inShell && b.stair && b.stair.kind === 'escada-de-mao') sp *= 0.55; // (a ladder: hand over hand)
    // (water to the shins slows a little, to the thighs a lot)
    if (b.wade > 0.05) sp *= Math.max(0.4, 1 - b.wade * TUNE.wadeDrag); else if (here.road) sp *= TUNE.road;
    if (v.energy < 8) sp *= 0.7; if (v.hunger >= 100) sp *= 0.8; if (v.carry && v.carry.n >= 4) sp *= 0.9;
    // (uphill is slower, as for everyone of the world)
    if (wl > 0.1) { const a = floorAt(b.X + wx * 0.6, b.Z + wz * 0.6) - floorAt(b.X, b.Z); if (a > 0) sp *= 1 / (1 + a * 0.9); }
    const tx = wx * sp * wl, tz = wz * sp * wl;
    const rate = onGround ? (wl > 0.05 ? TUNE.accel : TUNE.brake) : TUNE.airAccel;
    const k = 1 - Math.exp(-rate * h);
    b.vx += (tx - b.vx) * k; b.vz += (tz - b.vz) * k;
    // the body turns toward where it goes (a quick ease, not a snap)
    if (wl > 0.08) {
      const want = Math.atan2(wz, wx); let da = want - b.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      if (Math.abs(da) > 1.4 && b.speed < 0.6) b.turnT = 0.3;
      b.yaw += da * (1 - Math.exp(-TUNE.turn * h));
    }
    if (b.turnT > 0) b.turnT -= h;
    // breath: running spends it, walking and standing give it back
    if (running && b.speed > caps.walk * 1.2) b.stamina = Math.max(0, b.stamina - TUNE.runDrain * h);
    else b.stamina = Math.min(caps.stamina, b.stamina + TUNE.staminaRegen * h * (wl > 0.1 ? 0.6 : 1));
    // the jump: pressed a moment early (the buffer) or a moment after the ground went away (coyote) still counts
    if (IN.jump) { b.buffer = TUNE.buffer; IN.jump = false; } else b.buffer = Math.max(0, b.buffer - h);
    if (b.buffer > 0 && (b.ground || b.coyote > 0) && caps.jump > 0 && b.stamina >= TUNE.jumpCost * 0.5 && !v.sleeping && !b.inShell) {
      b.vy = Math.sqrt(2 * TUNE.gravity * caps.jump); b.ground = false; b.coyote = 0; b.buffer = 0; b.loco = 'air'; b.fallFrom = b.Y; b.stamina = Math.max(0, b.stamina - TUNE.jumpCost);
      G.Audio && G.Audio.play && G.Audio.play('swish');
    }
    // the feet: along each axis, sliding along what blocks (a wall stops the part of the move that goes into it)
    const nx = b.X + b.vx * h, nz = b.Z + b.vz * h;
    const feet = b.Y + (b.ground ? 0 : 0.0);
    let hit = null;
    if (nx === b.X || !(hit = blocked(nx, b.Z, feet, Math.sign(b.vx), 0))) b.X = nx; else { b.vx = 0; b.block = hit; b.blockT = 0.4; }
    let hz = null;
    if (nz === b.Z || !(hz = blocked(b.X, nz, feet, 0, Math.sign(b.vz)))) b.Z = nz; else { b.vz = 0; b.block = hz; b.blockT = 0.4; }
    // (trunks and boulders: pushed round them, unless that would put the body somewhere solid)
    const [ox, oz] = pushRound(b.X, b.Z);
    if ((ox || oz) && !blocked(b.X + ox, b.Z + oz, feet, Math.sign(ox), Math.sign(oz))) { b.X += ox; b.Z += oz; }
    const L = TL(); b.X = G.clamp(b.X, 0.5 * L, (G.N - 0.5) * L); b.Z = G.clamp(b.Z, 0.5 * L, (G.N - 0.5) * L);
    if (b.blockT > 0) b.blockT -= h; else b.block = null;
    // (pushing against a ledge too high to step on: after a moment — or at once with the jump — the body climbs it)
    if (onGround && (hit === 'stair' || hz === 'stair') && wl > 0.3 && takeFlight(wx, wz)) return;
    b.stairHit = null;
    if (onGround && !b.inShell && (hit === 'ledge' || hz === 'ledge') && wl > 0.3) { b.ledgeT += h; if (b.ledgeT > TUNE.climbWait || b.buffer > 0) tryClimb(wx, wz); } else b.ledgeT = 0;
    if (b.loco === 'climb') return;
    settle(h);
    // (how deep the water is round the legs; deep enough, the feet leave the bed and the body swims)
    b.wade = Math.max(0, waterAt(b.X, b.Z) - floorAt(b.X, b.Z));
    if (b.ground && b.caps.swim && b.wade > TUNE.swimIn * b.h) { b.loco = 'swim'; b.swimK = G.clamp(b.speed / 1.2, 0, 1); b.vy = 0; b.landT = 0; G.Audio && G.Audio.play && G.Audio.play('splash'); }
    void S;
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
  // a ledge ahead, within the reach of the arms: where the hands take it and where the feet will stand on top
  function tryClimb(wx, wz) {
    const l = Math.hypot(wx, wz); if (l < 0.1) return false; const dx = wx / l, dz = wz / l; const feet = b.Y;
    for (let d = 0.3; d <= 1.3; d += 0.1) {
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
        b.yaw = Math.atan2(dz, dx); b.stamina = Math.max(0, b.stamina - 6);
        return true;
      }
      return false;
    }
    return false;
  }
  // gravity and the ground: falling, landing, staying on a slope going down
  function settle(h) {
    const gY = floorAt(b.X, b.Z);
    if (!b.ground) {
      b.vy -= TUNE.gravity * h; b.Y += b.vy * h;
      if (b.vy < 0 && b.Y <= gY) { b.Y = gY; land(); }
      else b.coyote = Math.max(0, b.coyote - h);
      if (b.vy > 0 && b.Y > b.fallFrom) b.fallFrom = b.Y;
    } else {
      // (walking down a slope or a small step: the feet follow the ground; a real drop starts a fall)
      if (gY < b.Y - 0.45) { b.ground = false; b.loco = 'air'; b.coyote = TUNE.coyote; b.vy = 0; b.fallFrom = b.Y; }
      else b.Y = gY;
    }
    // (never under the ground: the world moved under the feet — an earthquake, a crater — and the body stands on it)
    if (b.Y < gY - 0.05) { b.Y = gY; if (b.vy < 0) b.vy = 0; }
  }
  function land() {
    const drop = b.fallFrom - b.Y;
    b.vy = 0; b.ground = true; b.loco = 'ground'; b.coyote = TUNE.coyote;
    if (drop > 1.1) b.landT = Math.min(0.35, 0.12 + drop * 0.05);
    if (drop > 0.5) G.Audio && G.Audio.play && G.Audio.play('thud');
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
  Av.act = function (o) {
    if (!b) return false;
    b.act = { anim: o.anim || 'interact', dur: o.dur || 1, t: 0, tr: 0, lock: o.lock !== false, done: o.done || null, at: o.at || null, face: o.face, to: o.to || null, toT: o.toT || 0.7, free: !!o.free, keep: o.keep || null,
      world: !!o.world, op: o.op || null, contact: o.contact !== undefined ? o.contact : o.at ? o.at[0] : o.dur || 1, then: o.then || null, fail: o.fail || null, cut: o.cut || null, reach: o.reach || null, asked: null, res: null, vact: o.vact || '' };
    if (b.act.lock) b.loco = 'busy';
    if (o.face !== undefined) b.faceTo = o.face;
    b.wc = G.S.clock;
    return true;
  };
  Av.actNow = () => (b && b.act ? b.act : null); // (for the tests and the HUD: the act in course, read only)
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
  Av.cancelAct = () => { if (b && b.act) { cutAct(); b.loco = 'ground'; } };
  // (an act cut short: what it had asked of the world and the world has not yet done is let go — it never happens)
  function cutAct() { const a = b.act; if (a && a.asked && !a.asked.res) a.asked.cancel = true; b.act = null; b.faceTo = undefined; if (b.loco === 'busy') b.loco = 'ground'; if (a && a.cut && !a.res) a.cut(); }

  // ------------------------------ the step and the frame ------------------------------
  function step(v, h) {
    // the world moved the body (a building rose where it stood, a load, the world's own push): the world is right
    // (and what the hands were doing there is left undone: the fish in that water, the hug of the one left behind)
    if (Math.abs(v.x - b.wx) > 1e-6 || Math.abs(v.y - b.wy) > 1e-6) { b.X = b.pX = v.x * TL(); b.Z = b.pZ = v.y * TL(); b.lv = G.Possess.level(); b.inB = null; b.inP = null; b.stair = null; b.Y = b.pY = floorAt(b.X, b.Z); indoorAfter(v); b.vx = b.vz = b.vy = 0; b.ground = true; b.loco = 'ground'; b.climb = null; cutAct(); }
    b.pX = b.X; b.pY = b.Y; b.pZ = b.Z;
    if ((b.capsT -= h) <= 0 || !b.caps) { b.caps = G.Possess.caps(v); b.capsT = 0.5; b.h = 1.75 * (G.People3D ? G.People3D.look(v).s : 1); }
    if (v.sleeping && b.loco !== 'sleep') { cutAct(); b.loco = 'sleep'; if (b.inShell) toBed(v); }
    // (sitting, the body gets up as soon as the player walks or jumps)
    // (and a free act — a prayer, a meal — is left there: what it had asked of the world and the world had not yet done never happens)
    if (b.act && (b.act.sit || b.act.free) && (Math.abs(IN.mx) + Math.abs(IN.mz) > 0.2 || b.buffer > 0 || IN.jump)) { cutAct(); b.loco = 'ground'; }
    if (b.act && b.act.keep && !b.act.keep()) cutAct();
    // (the act's own time is counted once a frame — tickAct: the world's or the body's; here only the feet's and the turn)
    if (b.act) {
      b.act.tr += h;
      if (b.faceTo !== undefined) { let da = b.faceTo - b.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.yaw += da * (1 - Math.exp(-8 * h)); }
    }
    (LOCO[b.loco] || LOCO.ground).step(v, h, b.caps);
    indoorAfter(v);
    if (b.landT > 0) b.landT -= h;
    const dX = b.X - b.pX, dZ = b.Z - b.pZ; const d = Math.hypot(dX, dZ);
    b.speed = d / h;
    // the world's record of the body: where it is (tiles), that it walks, which way it faces
    const S = G.S; const nxT = b.X / TL(), nyT = b.Z / TL();
    v.x = nxT; v.y = nyT; b.wx = nxT; b.wy = nyT;
    v.moving = b.speed > 0.2 && (b.ground || b.loco === 'swim');
    // (in the water where the world does not walk, the world is told the body is the player's swimmer — it leaves it there;
    // the god sees it swim. A building that rose on the water is no water to swim in: the world moves the body out — L-150)
    const afl = !W.walkableXY(v.x, v.y) && !(W.inb(v.x, v.y) && W.blocked(W.idx(v.x, v.y))) && waterAt(b.X, b.Z) > -Infinity; if (afl !== G.Possess.afloat(v)) G.Possess.setAfloat(afl);
    // (and what it does that the world's people answer: swimming, dancing — the dancers round it stop when it stops —, the axe
    // at the tree, the hands in the bush: the act's own vact, until it ends)
    const va = b.loco === 'swim' ? 'swim' : b.act ? b.act.vact || (b.act.anim === 'dance' ? 'dance' : '') : '';
    if (va) v.act = va; else if (VACT.has(v.act)) v.act = '';
    if (d > 0.001) { v.walkPh += (d / TL()) * 8.5; G.faceTo(v, dX, dZ); }
    // (feet wear the paths, as everybody's do — counted here, worn by the world in its step: Av.frame)
    if (v.moving) { const i = W.idx(v.x, v.y); if (S.type[i] >= T.SAND) { const k = b.wear.length; if (k && b.wear[k - 2] === i) b.wear[k - 1] += (d / TL()) * 1.3; else b.wear.push(i, (d / TL()) * 1.3); } }
    animate(v, h);
  }
  // the animation the body is in: from what it really does (Part 25: no walking in place, no sliding in idle)
  function animate(v, h) {
    const caps = b.caps; const carry = !!(v.carry && v.carry.n > 0);
    let st;
    if (b.loco === 'sleep') st = 'sleep';
    else if (b.loco === 'climb') st = 'climb';
    else if (b.loco === 'stair') st = b.flight && b.flight.lad ? 'climb' : 'walk';
    else if (b.loco === 'swim') st = b.stamina <= 0 ? 'drown' : b.swimK > 0.5 ? 'swim' : 'tread';
    else if (b.act && b.act.to && b.act.tr < b.act.toT && b.speed > 0.22) st = 'walk';
    else if (b.act && (b.act.lock || b.speed < 0.22)) st = b.act.anim;
    else if (!b.ground) st = b.vy > 0.4 ? 'jump' : 'fall';
    else if (b.landT > 0) st = 'land';
    else if (b.speed > 0.22) st = IN.sneak || b.crawl ? 'sneak' : b.speed > caps.walk * 1.3 ? 'run' : carry ? 'carryWalk' : (b.wade > 0.35 ? 'wade' : 'walk');
    else if (b.turnT > 0) st = 'turn';
    else st = carry ? 'carry' : 'idle';
    if (st !== b.anim) { b.anim = st; b.animT = 0; }
    b.animT += h;
    const loc = st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak' || st === 'wade' || st === 'turn';
    // (the stride in step with the ground: the rate the rig's own legs need for this speed and this body's size)
    if (loc) b.ph += h * (st === 'turn' ? 1.2 * 2.6 : b.speed * G.Anim3D.rate(st, b.speed, b.h / 1.75));
    else if (st === 'swim' || st === 'tread' || st === 'drown') { b.ph += h * (st === 'swim' ? 2.2 + b.speed * 1.4 + (b.stroke > 0 ? 3 : 0) : st === 'drown' ? 5 : 1.6); }
    const wet = st === 'swim' || st === 'tread' || st === 'drown';
    // (a stroke of the world's time: one swing a stroke, the blow landing at the stroke's contact — when the world counts it)
    if (b.loco === 'stair' && b.flight && !b.flight.lad) b.ph += h * 2.4 * G.Anim3D.rate('walk', 1, b.h / 1.75);
    let tc = loc || wet || (b.loco === 'stair' && b.flight && !b.flight.lad) ? b.ph : st === 'climb' && b.climb ? b.climb.t / b.climb.dur : st === 'climb' && b.flight ? (b.flight.t * 1.6) % 1 : b.animT;
    if ((st === 'swing' || st === 'fight') && b.act && b.act.world && b.act.dur > 0) { const u = G.clamp(b.act.t / b.act.dur, 0, 1), c = G.clamp(b.act.contact / b.act.dur, 0.2, 0.95); tc = (u <= c ? -Math.PI / 2 + Math.PI * u / c : Math.PI / 2 + Math.PI * (u - c) / (1 - c)) / 5.5; }
    const want = G.Anim3D.pose(st, tc, b.speed);
    // (the weight of what the hands hold, and the hands reaching — the same layer as for everyone drawn)
    if (b.L && G.Anim3D.hold) G.Anim3D.hold(want, b.L, st, tc, b.speed);
    // (moving, the body leans into its turns and forward as it speeds up, back as it stops; standing, the head follows the
    // eye of the camera a little, as a person looks where they mean to go)
    let dy = b.yaw - b.yawP; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; b.yawP = b.yaw;
    const acc = (b.speed - b.spP) / h; b.spP = b.speed;
    b.bank += (G.clamp(dy / h * b.speed * 0.03, -0.22, 0.22) - b.bank) * (1 - Math.exp(-8 * h));
    if (loc && b.ground) { want.sway = (want.sway || 0) + b.bank; want.lean = (want.lean || 0) + G.clamp(acc * 0.025, -0.18, 0.22); }
    if (st === 'idle' || st === 'walk' || st === 'carry') { let la = IN.camYaw - b.yaw; while (la > Math.PI) la -= TAU; while (la < -Math.PI) la += TAU; want.lookY = Math.abs(la) < 1.9 ? -G.clamp(la, -1, 1) * 0.55 : 0; }
    G.Anim3D.blend(b.pose, want, h, st === 'land' || st === 'jump' || st === 'climb' ? 20 : wet ? 7 : 12);
    if (want.lookY !== undefined) b.pose.lookY = (b.pose.lookY || 0) + ((want.lookY || 0) - (b.pose.lookY || 0)) * (1 - Math.exp(-5 * h));
  }
  Av.frame = function (rdt) {
    const v = G.Possess.body(); if (!b || !v || v.id !== b.id) return;
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
      const L = P3.look(v);
      // (the hands: an act's own reach for a point of the world; a load waiting on the ground while the hands work at something)
      const a = b.act; L.reach = a && a.reach ? a.reach(a) : null;
      if (L.held && a && HANDS_AT.has(a.anim)) L.held = P3.setDown(L.held);
      b.L = L;
      P3.avatar = { id: v.id, X: G.lerp(b.pX, b.X, f), Y: G.lerp(b.pY, b.Y, f) - (b.wade > 0 ? 0 : 0), Z: G.lerp(b.pZ, b.Z, f), yaw: b.yaw, pose: b.pose, look: L, sp: b.speed, wade: b.wade, ground: b.ground, act: b.act, swim: b.loco === 'swim', swimK: b.swimK, drown: b.drown, stroke: b.stroke > 0 };
    } // (its speed, its wading and footing: for the dust and the splashes it raises)
  };
  // where the body is, for the camera (interpolated)
  // (in the water the eye looks at the head over the face of the water, wherever the body floats)
  Av.pos = function () {
    if (!b) return null; const f = b.acc / TUNE.step; const Y = G.lerp(b.pY, b.Y, f); const X = G.lerp(b.pX, b.X, f), Z = G.lerp(b.pZ, b.Z, f);
    const wy = b.loco === 'swim' ? waterAt(X, Z) : -Infinity;
    return { X, Y, Z, yaw: b.yaw, speed: b.speed, ground: b.ground, vy: b.vy, h: b.h, head: wy > -Infinity ? wy + 0.38 - Y : undefined };
  };
  Av.swimming = () => !!(b && b.loco === 'swim');
  // (tests and the dev panel: put the body somewhere, by the world's rules)
  Av.place = function (x, y) { const v = G.Possess.body(); if (!v || !b || !W.walkableXY(x, y)) return false; v.x = x; v.y = y; return true; };
})(window.G);
