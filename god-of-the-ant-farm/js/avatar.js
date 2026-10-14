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
  };
  try { const o = JSON.parse(localStorage.getItem('gotaf-tune') || 'null'); if (o && typeof o === 'object') for (const k in o) if (k in TUNE && Number.isFinite(o[k]) && k !== 'step') TUNE[k] = o[k]; } catch (e) { }
  Av.saveTune = () => { try { localStorage.setItem('gotaf-tune', JSON.stringify(TUNE)); } catch (e) { } };

  let b = null; // the body's motion (the view's memory of a moving body; the person's place is the world's)
  G.worldHooks.push(() => { b = null; Av.on = false; });
  Av.state = () => b;
  // the player's wishes, filled by the input each frame (axes relative to the camera)
  const IN = Av.input = { mx: 0, mz: 0, run: false, jump: false, sneak: false, camYaw: 0 };

  const TL = () => G.Space.TILE, HM = () => G.Space.HM;
  // the ground the feet stand on at a point: a bridge's deck over the water, the bed of a ford, the land
  function floorAt(X, Z) {
    const S = G.S; const x = X / TL(), y = Z / TL();
    if (!W.inb(x, y)) return W.hAt(G.clamp(x, 0, G.N), G.clamp(y, 0, G.N)) * HM();
    const i = W.idx(x, y); const h = W.hAt(x, y) * HM();
    if (S.type[i] === T.RIVER && (S.road[i] || (S.ice && S.ice[i]))) return Math.max(h, S.wl[i] * HM() + (S.road[i] ? 0.17 : 0.1));
    // (a boulder is ground too: the feet stand on its faces)
    const st = G.Space.stoneTop(X, Z);
    return st > h ? st : h;
  }
  Av.floorAt = floorAt;

  // ------------------------------ attach / detach ------------------------------
  Av.attach = function (v, yaw) {
    const X = v.x * TL(), Z = v.y * TL(); const Y = floorAt(X, Z);
    b = {
      id: v.id, X, Y, Z, pX: X, pY: Y, pZ: Z, vx: 0, vy: 0, vz: 0, yaw: yaw === undefined ? (v.face > 0 ? 0 : Math.PI) : yaw, ground: true, coyote: 0, buffer: 0,
      loco: 'ground', anim: 'idle', animT: 0, ph: 0, pose: G.Anim3D.POSE0(), landT: 0, fallFrom: Y, hurt: 0, stamina: 100, acc: 0, wx: v.x, wy: v.y,
      act: null, speed: 0, turnT: 0, block: null, blockT: 0, capsT: 0, caps: null, wade: 0, climb: null, ledgeT: 0, yawP: 0, spP: 0, bank: 0,
    };
    Av.on = true;
    return b;
  };
  Av.detach = function () { b = null; Av.on = false; if (G.People3D) G.People3D.avatar = null; };

  // ------------------------------ collisions ------------------------------
  // (a point is solid for the body if the world says nobody stands there, or if the ground there rises above a step)
  function solidAt(X, Z, feet) {
    const s = G.Space.surface(X, Z); if (!s.walk) return s.kind;
    return ledge(X, Z, feet, floorAt(X, Z)) ? 'ledge' : null;
  }
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
  // round things one walks around: the trunks of grown trees (a boulder is ground one climbs: floorAt)
  function pushRound(X, Z) {
    const S = G.S; const L = TL(); const x0 = Math.floor(X / L), y0 = Math.floor(Z / L); let ox = 0, oz = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = x0 + dx, y = y0 + dy; if (!W.inb(x, y)) continue; const i = y * G.N + x;
      let cx = 0, cz = 0, rr = 0;
      const tid = S.treeAt[i]; const t = tid && S.trees.get(tid);
      if (t && t.stage !== 'stump' && t.stage !== 'log' && t.stage !== 'fall' && t.size >= 0.3) { cx = t.x * L; cz = t.y * L; rr = 0.28 + 0.32 * Math.min(1.2, t.size); }
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
    // asleep: the body lies where it lay down; the world's needs (villagers.js) give the strength back
    sleep: {
      step(v, h) { b.vx = b.vz = 0; b.speed = 0; if (!v.sleeping) b.loco = 'ground'; void h; },
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
    // busy with the hands (chopping, picking, eating): the feet keep still until it is done
    busy: {
      step(v, h, caps) { b.vx *= Math.exp(-12 * h); b.vz *= Math.exp(-12 * h); settle(h); if (!b.act) b.loco = 'ground'; void caps; },
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
    if (IN.sneak) sp *= TUNE.sneak;
    if (here.kind === 'shallow') sp *= TUNE.wade; else if (here.road) sp *= TUNE.road;
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
    if (b.buffer > 0 && (b.ground || b.coyote > 0) && caps.jump > 0 && b.stamina >= TUNE.jumpCost * 0.5 && !v.sleeping) {
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
    if (onGround && (hit === 'ledge' || hz === 'ledge') && wl > 0.3) { b.ledgeT += h; if (b.ledgeT > TUNE.climbWait || b.buffer > 0) tryClimb(wx, wz); } else b.ledgeT = 0;
    if (b.loco === 'climb') return;
    settle(h);
    b.wade = here.kind === 'shallow' ? Math.max(0, (S.wl[here.i] || 0) * HM() - floorAt(b.X, b.Z)) : 0;
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
  // Av.act({ anim, dur, lock, at, done }) — the animation plays, the feet keep still if lock, done() runs at the end
  Av.act = function (o) {
    if (!b) return false;
    b.act = { anim: o.anim || 'interact', dur: o.dur || 1, t: 0, lock: o.lock !== false, done: o.done || null, at: o.at || null, face: o.face };
    if (b.act.lock) b.loco = 'busy';
    if (o.face !== undefined) b.faceTo = o.face;
    return true;
  };
  Av.busy = () => !!(b && b.act);
  // sitting down where the body stands (until the player walks); and a wave of the hand to those around
  Av.sit = function () { if (!b) return false; if (b.act && b.act.sit) { b.act = null; b.loco = 'ground'; return true; } if (!b.ground || b.loco !== 'ground' || b.act) return false; Av.act({ anim: 'rest', dur: 1e9, lock: true }); b.act.sit = true; return true; };
  Av.wave = function () { if (!b || b.loco !== 'ground') return false; return Av.act({ anim: 'wave', dur: 1.6, lock: false }); };
  Av.climbing = () => !!(b && b.climb);
  Av.rest = () => { if (b && b.caps) b.stamina = b.caps.stamina; }; // (a drink of water: the breath comes back)
  Av.cancelAct = () => { if (b && b.act) { b.act = null; b.loco = 'ground'; } };

  // ------------------------------ the step and the frame ------------------------------
  function step(v, h) {
    // the world moved the body (a building rose where it stood, a load, the world's own push): the world is right
    if (Math.abs(v.x - b.wx) > 1e-6 || Math.abs(v.y - b.wy) > 1e-6) { b.X = b.pX = v.x * TL(); b.Z = b.pZ = v.y * TL(); b.Y = b.pY = floorAt(b.X, b.Z); b.vx = b.vz = b.vy = 0; b.ground = true; b.loco = 'ground'; b.climb = null; }
    b.pX = b.X; b.pY = b.Y; b.pZ = b.Z;
    if ((b.capsT -= h) <= 0 || !b.caps) { b.caps = G.Possess.caps(v); b.capsT = 0.5; }
    if (v.sleeping && b.loco !== 'sleep') { b.loco = 'sleep'; b.act = null; }
    // (sitting, the body gets up as soon as the player walks or jumps)
    if (b.act && b.act.sit && (Math.abs(IN.mx) + Math.abs(IN.mz) > 0.2 || b.buffer > 0 || IN.jump)) { b.act = null; b.loco = 'ground'; }
    if (b.act) {
      b.act.t += h;
      if (b.faceTo !== undefined) { let da = b.faceTo - b.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; b.yaw += da * (1 - Math.exp(-8 * h)); }
      if (b.act.at && b.act.t >= b.act.at[0] && !b.act.atDone) { b.act.atDone = true; b.act.at[1](); }
      if (b.act.t >= b.act.dur) { const d = b.act.done; b.act = null; b.faceTo = undefined; if (b.loco === 'busy') b.loco = 'ground'; if (d) d(); if (!b) return; }
    }
    (LOCO[b.loco] || LOCO.ground).step(v, h, b.caps);
    if (b.landT > 0) b.landT -= h;
    const dX = b.X - b.pX, dZ = b.Z - b.pZ; const d = Math.hypot(dX, dZ);
    b.speed = d / h;
    // the world's record of the body: where it is (tiles), that it walks, which way it faces
    const S = G.S; const nxT = b.X / TL(), nyT = b.Z / TL();
    v.x = nxT; v.y = nyT; b.wx = nxT; b.wy = nyT;
    v.moving = b.speed > 0.2 && b.ground;
    if (d > 0.001) { v.walkPh += (d / TL()) * 8.5; G.faceTo(v, dX, dZ); }
    // (feet wear the paths, as everybody's do)
    if (v.moving) { const i = W.idx(v.x, v.y); if (S.type[i] >= T.SAND) { const lv = G.pathLevel(S.wear[i]); S.wear[i] = Math.min(G.WEAR_MAX, S.wear[i] + (d / TL()) * 1.3); if (G.pathLevel(S.wear[i]) !== lv) G.Nature.markDirty(i); } }
    animate(v, h);
    if (b.hurt > 0) { const hh = b.hurt; b.hurt = 0; G.Vg.damage(v, hh, 'queda', false); }
  }
  // the animation the body is in: from what it really does (Part 25: no walking in place, no sliding in idle)
  function animate(v, h) {
    const caps = b.caps; const carry = !!(v.carry && v.carry.n > 0);
    let st;
    if (b.loco === 'sleep') st = 'sleep';
    else if (b.loco === 'climb') st = 'climb';
    else if (b.act && (b.act.lock || b.speed < 0.22)) st = b.act.anim;
    else if (!b.ground) st = b.vy > 0.4 ? 'jump' : 'fall';
    else if (b.landT > 0) st = 'land';
    else if (b.speed > 0.22) st = IN.sneak ? 'sneak' : b.speed > caps.walk * 1.3 ? 'run' : carry ? 'carryWalk' : (b.wade > 0.35 ? 'wade' : 'walk');
    else if (b.turnT > 0) st = 'turn';
    else st = carry ? 'carry' : 'idle';
    if (st !== b.anim) { b.anim = st; b.animT = 0; }
    b.animT += h;
    const loc = st === 'walk' || st === 'run' || st === 'carryWalk' || st === 'sneak' || st === 'wade' || st === 'turn';
    if (loc) b.ph += h * Math.max(b.speed, st === 'turn' ? 1.2 : 0) * (st === 'run' ? 1.9 : 2.6);
    const want = G.Anim3D.pose(st, loc ? b.ph : st === 'climb' && b.climb ? b.climb.t / b.climb.dur : b.animT, b.speed);
    // (moving, the body leans into its turns and forward as it speeds up, back as it stops; standing, the head follows the
    // eye of the camera a little, as a person looks where they mean to go)
    let dy = b.yaw - b.yawP; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; b.yawP = b.yaw;
    const acc = (b.speed - b.spP) / h; b.spP = b.speed;
    b.bank += (G.clamp(dy / h * b.speed * 0.03, -0.22, 0.22) - b.bank) * (1 - Math.exp(-8 * h));
    if (loc && b.ground) { want.sway = (want.sway || 0) + b.bank; want.lean = (want.lean || 0) + G.clamp(acc * 0.025, -0.18, 0.22); }
    if (st === 'idle' || st === 'walk' || st === 'carry') { let la = IN.camYaw - b.yaw; while (la > Math.PI) la -= TAU; while (la < -Math.PI) la += TAU; want.lookY = Math.abs(la) < 1.9 ? -G.clamp(la, -1, 1) * 0.55 : 0; }
    G.Anim3D.blend(b.pose, want, h, st === 'land' || st === 'jump' || st === 'climb' ? 20 : 12);
    if (want.lookY !== undefined) b.pose.lookY = (b.pose.lookY || 0) + ((want.lookY || 0) - (b.pose.lookY || 0)) * (1 - Math.exp(-5 * h));
  }
  Av.frame = function (rdt) {
    const v = G.Possess.body(); if (!b || !v || v.id !== b.id) return;
    b.acc = Math.min(0.25, b.acc + rdt);
    while (b && b.acc >= TUNE.step) { b.acc -= TUNE.step; step(v, TUNE.step); }
    if (!b) return; // (the step ended the body: a fall killed it, the world took it)
    // the picture between two steps (interpolated: smooth at any frame rate)
    const f = b.acc / TUNE.step;
    const P3 = G.People3D; if (P3) { const L = P3.look(v); P3.avatar = { id: v.id, X: G.lerp(b.pX, b.X, f), Y: G.lerp(b.pY, b.Y, f) - (b.wade > 0 ? 0 : 0), Z: G.lerp(b.pZ, b.Z, f), yaw: b.yaw, pose: b.pose, look: L, sp: b.speed, wade: b.wade, ground: b.ground, act: b.act }; } // (its speed, its wading and footing: for the dust and the splashes it raises)
  };
  // where the body is, for the camera (interpolated)
  Av.pos = function () { if (!b) return null; const f = b.acc / TUNE.step; return { X: G.lerp(b.pX, b.X, f), Y: G.lerp(b.pY, b.Y, f), Z: G.lerp(b.pZ, b.Z, f), yaw: b.yaw, speed: b.speed, ground: b.ground, vy: b.vy }; };
  // (tests and the dev panel: put the body somewhere, by the world's rules)
  Av.place = function (x, y) { const v = G.Possess.body(); if (!v || !b || !W.walkableXY(x, y)) return false; v.x = x; v.y = y; return true; };
})(window.G);
