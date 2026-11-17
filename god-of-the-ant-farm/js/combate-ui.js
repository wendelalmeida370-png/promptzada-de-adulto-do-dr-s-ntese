'use strict';
// ============================================================
//  The hands of the fight (20f, D-410 to D-424): what the keys,
//  the buttons and the fingers ask of the body in a fight, and
//  the fight's screen. The blow (atacar: a press a light one,
//  more in a row; held, the heavy one charging), the guard
//  (defender held — and in time, the parry), the bow (defender
//  the aim over the shoulder, atacar drawn and let go), the
//  weapon put away or drawn (guardar), the target held changed
//  by a push of the mouse or the stick, the duel asked with F.
//  The body moves by its own doors (Avatar.act: the gesture,
//  its push, its windows; Avatar.spend: the breath); what the
//  world does — the blow landing, the guard, the arrow, the
//  challenge — it does in its step (Possess.apply → Combate).
//  The screen (G.IncUI.frames, D-462): the breath of the fight
//  round the reticle, the charge, the draw, the guard, the
//  duel; the weight of a blow that lands (Avatar.hitstop, the
//  eye's shake, the flash: combate3d.js). Only the hands' and
//  the eye's: nothing here writes the world.
// ============================================================
(function (G) {
  const U = G.CombateUI = {};
  const Cb = G.Combate, In = G.Input3D, Av = G.Avatar, C3 = G.Cam3D;
  if (!Cb || !In || !Av) return;
  const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  const DRAW = U.DRAW = 0.7; // (seconds of the body a bow takes to full draw)
  // the hands' state: what they do now, the row of light blows, the keys held
  let mode = 'idle', chain = 0, chainT = 9, buf = -1, atkDown = false, atkT = 0, defDown = false, chargeT = 0, drawT = 0, cur = null, evSeen = 0, flickAcc = 0, guardOn = false, hud = null;
  const reset = () => { mode = 'idle'; chain = 0; chainT = 9; buf = -1; atkDown = false; defDown = false; chargeT = 0; drawT = 0; cur = null; flickAcc = 0; guardOn = false; };
  G.worldHooks.push(() => { reset(); evSeen = 0; });
  U.state = () => ({ mode, chain, chargeT, drawT, guard: guardOn, cur: cur ? Object.assign({}, cur) : null, atkDown, defDown }); // (for the proofs)
  const body = () => (G.Possess && G.Possess.body ? G.Possess.body() : null);
  U.proof = false; // (for the proofs in Node: the hands live with no 3D modes round them)
  const live = () => !!((U.proof || (G.Modes && G.Modes.is && G.Modes.is('INC') && !G.Modes.panel() && !(G.Modes.menuOpen && G.Modes.menuOpen()))) && body() && Av.state());
  // (the fight is possible where the body stands: on its feet, out of the water, not asleep, not thrown down)
  const able = () => { const b = Av.state(); const v = body(); return !!(b && v && !v.sleeping && !(v.carry && v.carry.n > 0) && b.ground && b.loco !== 'swim' && b.loco !== 'down' && b.loco !== 'climb' && b.loco !== 'stair' && b.loco !== 'seat' && b.loco !== 'dodge' && !(b.rise > 0)); }; // (the hands under a load fight nothing; in the air, in a dodge, the blow waits)
  const later = () => { const b = Av.state(); return !!(b && (b.loco === 'dodge' || b.loco === 'air' || !b.ground)); }; // (pressed in a dodge or a jump: kept for when the feet are down)
  const toast = (t, d) => G.IncUI && G.IncUI.toast && G.IncUI.toast(t, d || 1.6);
  const play = (s, v) => G.Audio && G.Audio.play && G.Audio.play(s, v);
  const weapon = () => { const v = body(); return v ? Cb.weapon(v) : null; };
  // the way a blow goes: the target held; else the nearest one ahead within reach (as the player means it: where the feet are
  // pushed, or where the body faces) — the soft lock of a game of swords —; else where it is pushed, or straight on
  function faceFor(reach) {
    if (C3.locked && C3.locked()) return 'lock';
    const b = Av.state(); const ax = In.axes(); const cy = Math.cos(C3.yaw), sy = Math.sin(C3.yaw);
    const wx = cy * ax.mz - sy * ax.mx, wz = sy * ax.mz + cy * ax.mx; const want = Math.hypot(wx, wz) > 0.25 ? Math.atan2(wz, wx) : b.yaw;
    const v = body(); const T = Cb.targets(v, want, reach + 1.4, 140);
    for (const t of T) { const o = t.o || t.a; if (t.o && Cb.dueling && !Cb.dueling(v, t.o) && t.o.age < 14) continue; return Math.atan2(o.y - v.y, o.x - v.x); }
    return want;
  }

  // ------------------------------ the blows ------------------------------
  // a light blow (i: its place in the row) or the heavy one (i -1, k its charge): the gesture with its push and its windows, the
  // breath paid, the world asked at its contact — where the body faces then
  function blow(i, k, force) {
    const v = body(); const w = weapon(); if (!v || !w) return false;
    const mv = Cb.move(w.cls, i); const heavy = i < 0;
    // (the breath: a light one needs some left; the heavy one already paid the light one it came from)
    const cost = heavy ? Math.max(0, mv.fol - Cb.move(w.cls, 0).fol) : mv.fol;
    if (!heavy && !Av.spend(cost)) { play('gasp', 0.5); toast('Sem fôlego.', 1); return false; }
    if (heavy) Av.spend(cost);
    const sp = { i, k: heavy ? k : 0, yaw: null };
    const ok = Av.act({ anim: mv.clip, dur: mv.dur, lock: true, vact: 'golpe', contact: mv.dur * mv.hit, face: faceFor(Cb.reachOf(w, mv)), turn: heavy ? 5 : 9, drive: mv.drive, force,
      cancelAt: heavy ? [[mv.cut, 1]] : [[0, 0.14], [mv.cut, 1]],
      at: [mv.dur * mv.hit, () => { const b = Av.state(); if (b) sp.yaw = b.yaw; }],
      op: wv => Cb.strike(wv, sp) });
    if (!ok) return false;
    if (guardOn) setGuard(false);
    cur = { kind: 'golpe', i, cls: w.cls, mv, act: Av.actNow(), t0: 0 }; mode = heavy ? 'pesado' : 'golpe'; chainT = 0;
    return true; // (the blow is heard at its contact, by the world's hand: the swish of a miss, the hit, the metal of a guard)
  }
  // the heavy one charging: the windup held while the key is
  function charge() {
    const w = weapon(); if (!w) return false;
    const ok = Av.act({ anim: `cb-${w.cls === 'clava' ? 'machado' : w.cls}-carga`, dur: 1e9, lock: true, moveScale: 0.22, turn: 5, face: C3.locked && C3.locked() ? 'lock' : undefined, vact: 'golpe', force: true });
    if (!ok) return false;
    cur = { kind: 'carga', cls: w.cls, act: Av.actNow() }; mode = 'carga'; chargeT = 0; return true;
  }
  const actIs = a => !!(a && Av.actNow() === a);
  const uOf = a => (a && a.dur > 0 ? a.t / a.dur : 1);

  // ------------------------------ the guard ------------------------------
  function guardClip(w) { return w.shield ? 'cb-guarda-escudo' : w.cls === 'punho' ? 'cb-guarda-punho' : w.two ? 'cb-guarda-duas' : 'cb-guarda-arma'; }
  function setGuard(on) {
    if (on === guardOn) return; guardOn = on;
    G.Possess.apply(wv => Cb.guard(wv, on));
  }
  function raise() {
    const w = weapon(); if (!w || !able()) return false;
    if (Av.busy() && !Av.cuttable()) return false;
    const ok = Av.act({ anim: guardClip(w), dur: 1e9, lock: false, moveScale: 0.55, turn: 7, face: C3.locked && C3.locked() ? 'lock' : undefined, vact: 'guarda' });
    if (!ok) return false;
    cur = { kind: 'guarda', act: Av.actNow() }; mode = 'guarda'; setGuard(true); return true;
  }
  function lower() { if (cur && cur.kind === 'guarda' && actIs(cur.act)) Av.cancelAct(); setGuard(false); if (mode === 'guarda') { mode = 'idle'; cur = null; } }

  // ------------------------------ the bow ------------------------------
  const hasArrows = () => { const v = body(); return !!(v && Cb.arrowOf(v)); };
  function aim(on) {
    if (on) { C3.aim(true); if (!(Av.busy() && mode === 'puxar')) { Av.act({ anim: 'cb-arco-mirar', dur: 1e9, lock: false, moveScale: 0.45, turn: 12, vact: 'mirar' }); cur = { kind: 'mirar', act: Av.actNow() }; mode = 'mirar'; } }
    else { C3.aim(false); if (cur && (cur.kind === 'mirar' || cur.kind === 'puxar') && actIs(cur.act)) Av.cancelAct(); if (mode === 'mirar' || mode === 'puxar') { mode = 'idle'; cur = null; } drawT = 0; }
  }
  function pull() {
    if (!hasArrows()) { toast('Sem flechas na mochila.', 1.6); play('gasp', 0.3); return false; }
    if (!Av.spend(4)) { play('gasp', 0.5); return false; }
    const ok = Av.act({ anim: 'cb-arco-puxar', dur: 1e9, lock: false, moveScale: 0.3, turn: 12, vact: 'mirar', force: true, face: C3.aiming() ? undefined : C3.locked && C3.locked() ? 'lock' : C3.yaw });
    if (!ok) return false;
    cur = { kind: 'puxar', act: Av.actNow() }; mode = 'puxar'; drawT = 0; play('creak', 0.5); return true;
  }
  // where the arrow goes: through the middle of the picture (the aim) — or at the target held, or straight on — from the bow's
  // place on the body, lifted for its fall over the way (at full draw it lands where the reticle is)
  U.aimPoint = function () {
    const p = Av.pos(); if (!p) return null; const TL = G.Space.TILE;
    const lk = C3.locked && C3.locked(); if (lk && !C3.aiming()) return { X: lk.X, Y: lk.Y, Z: lk.Z };
    const r = C3.aimRay ? C3.aimRay() : null;
    if (!r) return { X: p.X + Math.cos(p.yaw) * 25, Y: p.Y + 1.4, Z: p.Z + Math.sin(p.yaw) * 25 };
    for (let d = 2; d <= 80; d += 0.5) { const X = r.from[0] + r.dir[0] * d, Y = r.from[1] + r.dir[1] * d, Z = r.from[2] + r.dir[2] * d; if (Y <= G.Space.groundY(X, Z) || !G.W.inb(X / TL, Z / TL)) return { X, Y, Z }; }
    return { X: r.from[0] + r.dir[0] * 80, Y: r.from[1] + r.dir[1] * 80, Z: r.from[2] + r.dir[2] * 80 };
  };
  U.shot = function (k) {
    const p = Av.pos(); const v = body(); if (!p || !v) return null; const s = (G.People3D && G.People3D.look ? G.People3D.look(v).s : 1) || 1;
    const yaw = p.yaw; const from = [p.X + Math.cos(yaw) * 0.25 - Math.sin(yaw) * 0.12, p.Y + 1.42 * s, p.Z + Math.sin(yaw) * 0.25 + Math.cos(yaw) * 0.12];
    const T = U.aimPoint() || { X: from[0] + Math.cos(yaw) * 20, Y: from[1], Z: from[2] + Math.sin(yaw) * 20 };
    const dx = T.X - from[0], dy = T.Y - from[1], dz = T.Z - from[2]; const dh = Math.max(0.5, Math.hypot(dx, dz));
    const sp = Cb.SPEED * (0.55 + 0.45 * k); const t = dh / sp; const vy = (dy + 0.5 * Cb.GRAV * t * t) / t;
    const n = Math.hypot(dx / t, vy, dz / t) || 1; return { from, dir: [dx / t / n, vy / n, dz / t / n], k };
  };
  function loose() {
    const k = Math.min(1, drawT / DRAW); const sp = U.shot(k); if (!sp) return;
    G.Possess.apply(wv => Cb.shoot(wv, sp));
    play('arrow', 0.8); C3.shake && C3.shake(0.12);
    Av.act({ anim: 'cb-arco-soltar', dur: 0.38, lock: false, moveScale: 0.45, turn: 12, vact: 'mirar', force: true });
    cur = { kind: 'soltar', act: Av.actNow() }; mode = 'soltar'; drawT = 0;
  }

  // ------------------------------ the keys ------------------------------
  In.on('atacar', () => {
    if (!live()) return false; atkDown = true; atkT = 0; if (!able()) { if (later()) buf = 0; return true; }
    const w = weapon(); if (!w) return true;
    if (w.bow) { if (mode !== 'puxar') pull(); return true; }
    if ((mode === 'golpe' || mode === 'pesado') && cur && actIs(cur.act)) { buf = 0; return true; } // (pressed in a blow: the next one in the row, when the window opens)
    if (mode === 'carga') return true;
    if (Av.busy() && !Av.cuttable()) { buf = 0; return true; }
    chain = chainT < 0.75 ? (chain + 1) % Cb.chain(w.cls) : 0; blow(chain, 0); return true;
  });
  In.onUp('atacar', () => {
    atkDown = false;
    if (mode === 'carga' && cur && actIs(cur.act)) { const k = Math.min(1, chargeT / Cb.CHARGE); blow(-1, k, true); chain = 0; return; }
    if (mode === 'puxar' && cur && actIs(cur.act)) loose();
  });
  In.on('defender', () => {
    if (!live()) return false; defDown = true; if (!able()) return true;
    const w = weapon(); if (!w) return true;
    if (w.bow) { aim(true); return true; }
    if (mode !== 'golpe' && mode !== 'pesado' && mode !== 'carga') raise();
    return true;
  });
  In.onUp('defender', () => { defDown = false; const w = weapon(); if (w && w.bow) aim(false); else lower(); });
  // (the weapon put away or drawn: the inventory's door, in the world's step)
  In.on('guardar', () => { if (!live()) return false; const v = body(); if (!v) return true; G.Possess.apply(wv => G.Inv.toggle(wv)); return true; });
  // the fingers' buttons (D-355): the blow and the guard, held — the aim with a bow in the hand
  const bowNow = () => { const w = live() ? weapon() : null; return !!(w && w.bow); };
  In.button('atacar', { label: () => (bowNow() ? 'Atirar' : 'Golpe'), hold: true, order: 14, when: () => live() && able() });
  In.button('defender', { label: () => (bowNow() ? 'Mirar' : 'Defesa'), hold: true, order: 16, when: () => live() && able() });

  // ------------------------------ the change of target held ------------------------------
  // (a push of the mouse or the right stick to a side while a target is held: the next one that side, among those ahead — as
  // the lock-on's key would choose them, Modes.lockCandidate's reach)
  U.FLICK = 140;
  function switchTarget(dir) {
    const lk = C3.locked(); const p = Av.pos(); const me = body(); if (!lk || !p || !me) return false;
    const TL = G.Space.TILE; const a0 = Math.atan2(lk.Z - p.Z, lk.X - p.X); let best = null, bs = 1e9;
    const consider = (o, beast) => { if (o.id === lk.id) return; const X = o.x * TL, Z = o.y * TL; const d = Math.hypot(X - p.X, Z - p.Z); if (d > 18 || d < 0.3) return;
      const off = wrap(Math.atan2(Z - p.Z, X - p.X) - a0); if (Math.sign(off) !== Math.sign(dir) || Math.abs(off) > 1.6) return; const sc = Math.abs(off) * 3 + d * 0.05; if (sc < bs) { bs = sc; best = o; } void beast; };
    const x = p.X / TL, y = p.Z / TL;
    if (G.Animals && G.Animals.near) G.Animals.near(x, y, 4.6, a => { if (!a.dead && !a.held && !a.air) consider(a, true); });
    for (const o of G.S.villagers.values()) if (Math.abs(o.x - x) < 4.6 && Math.abs(o.y - y) < 4.6 && o.id !== me.id && !o.inside && !o.aboard && !o.held && !o.air) consider(o, false);
    if (!best) return false; C3.lockOn(best); play('click', 0.3); return true;
  }

  // ------------------------------ the frame: the hands' work and the screen ------------------------------
  U.frame = function (rdt) {
    if (!hud) build();
    const on = live(); const v = body();
    if (!on || !v) { if (mode !== 'idle' || guardOn) { if (C3.aiming && C3.aiming()) C3.aim(false); if (guardOn && v) setGuard(false); reset(); } draw(null, rdt); return; }
    const w = weapon(); chainT += rdt;
    if (atkDown) atkT += rdt;
    // (the act the hands began is no longer the body's — a blow taken, a dodge, the world's push: the hands let it go)
    if (cur && !actIs(cur.act) && mode !== 'idle') {
      if (mode === 'guarda') setGuard(false);
      if (mode === 'mirar' || mode === 'puxar' || mode === 'soltar') { if (!defDown && C3.aiming()) C3.aim(false); }
      mode = 'idle'; cur = null;
    }
    // the light blow held becomes the heavy one charging — before its contact, the first of a press
    if (mode === 'golpe' && cur && atkDown && atkT >= Cb.HOLD && cur.act && cur.act.t < cur.act.contact && !(cur.act.asked)) charge();
    if (mode === 'carga') { chargeT += rdt; Av.spend(0); if (chargeT > Cb.CHARGE + 0.8) { blow(-1, 1, true); chain = 0; } }
    // the next blow of the row, pressed in time: when the window of this one opens
    if (buf >= 0) { buf += rdt; if (buf > 0.4) buf = -1; else if ((!Av.busy() || Av.cuttable()) && w && !w.bow && able() && mode !== 'carga') { const n = (chain + 1) % Cb.chain(w.cls); if (blow(n, 0, true)) { chain = n; } buf = -1; } }
    // the guard, back up when the blow is done and the key still held; its breath held while it is
    if (defDown && w && !w.bow && mode === 'idle' && !Av.busy() && able()) raise();
    if (guardOn) Av.spend(0);
    // the bow: drawn while held, the arms tiring after full draw; the aim back after the loosing while the key is held
    if (mode === 'puxar') { drawT += rdt; if (drawT > DRAW + 1.5) Av.spend(4 * rdt); }
    if (mode === 'idle' && defDown && w && w.bow && able()) aim(true);
    if (C3.aiming && C3.aiming() && !(w && w.bow) && mode !== 'mirar' && mode !== 'puxar' && mode !== 'soltar') C3.aim(false);
    // the target held: changed by a push to a side
    if (C3.locked && C3.locked()) { flickAcc = flickAcc * Math.exp(-6 * rdt) + (C3.flick ? C3.flick() : 0); if (Math.abs(flickAcc) > U.FLICK) { switchTarget(Math.sign(flickAcc)); flickAcc = 0; } } else { flickAcc = 0; if (C3.flick) C3.flick(); }
    feel(rdt);
    draw(w, rdt);
  };
  // the world's answers, felt: the weight of a blow that lands (the body's time all but stopped a moment, the eye's shake), a
  // parry's ring, a guard that held paid in breath — broken when the breath is gone —, an escape in the dodge's window
  function feel() {
    const E = Cb.events(); const me = body(); if (!me) return;
    for (const e of E) {
      if (e.n <= evSeen) continue; evSeen = e.n;
      if (e.kind === 'acerto' && e.by === me.id && e.arrow) play('hit', 0.4); // (an arrow home, far off: heard, not felt)
      else if (e.kind === 'acerto' && e.by === me.id) { const big = e.amt >= 18 || e.killed; Av.hitstop(e.killed ? 0.11 : big ? 0.085 : 0.055); C3.shake && C3.shake(big ? 0.32 : 0.16); G.Combate3D && G.Combate3D.flash(e, e.blocked ? 'bloqueio' : 'acerto'); if (e.killed) play('thud', 0.7); }
      else if (e.kind === 'aparo') { Av.hitstop(0.12); C3.shake && C3.shake(0.25); play('clang', 1); toast('Aparou!', 1.2); G.Combate3D && G.Combate3D.flash(e, 'aparo'); Av.spend(3); }
      else if (e.kind === 'bloqueio') { play('clang', 0.7); C3.shake && C3.shake(0.18); G.Combate3D && G.Combate3D.flash(e, 'bloqueio');
        const b = Av.state(); const left = b ? b.stamina : 0; Av.spend(e.cost || 6);
        if (left < (e.cost || 6) || e.giant) { lower(); play('gasp', 0.7); toast('A guarda cedeu!', 1.4); Av.act({ anim: 'cb-tranco', dur: 0.6, lock: true, force: true }); } }
      else if (e.kind === 'esquiva') { play('swish', 0.8); toast('Escapou!', 1); }
      else if (e.kind === 'recusa' && e.id) toast('Recusou o desafio.', 1.6);
      else if (e.kind === 'duelo') toast('Duelo! Até um dos dois se render.', 2.4);
      else if (e.kind === 'fim') toast(e.how === 'rendeu' ? (e.won === me.id ? 'Venceu o duelo!' : 'Você se rendeu.') : 'O duelo acabou.', 2.4);
    }
  }

  // ------------------------------ the screen ------------------------------
  // (in the body's HUD, its own element: the breath of the fight round the reticle — shown while it is spent or short —, the
  // ring of the charge and of the draw, the mark of the guard, the duel's line)
  function build() {
    const H = G.IncUI && G.IncUI.hud ? G.IncUI.hud() : null; if (!H || !H.appendChild || typeof document === 'undefined' || !document.createElement) return;
    hud = document.createElement('div'); hud.className = 'cb-hud';
    hud.innerHTML = '<svg class="cb-ring" viewBox="0 0 64 64"><circle class="cb-st" cx="32" cy="32" r="27"></circle><circle class="cb-ch" cx="32" cy="32" r="22"></circle></svg><div class="cb-guard hidden"></div><div class="cb-duel hidden"></div>';
    H.appendChild(hud);
  }
  let shown = { st: -1, ch: -1, g: null, d: null, on: null };
  const C1 = 2 * Math.PI * 27, C2 = 2 * Math.PI * 22;
  function draw(w, rdt) {
    if (!hud || !hud.querySelector) return; void rdt;
    const m = Av.motion ? Av.motion() : null; const fight = !!(w && (mode !== 'idle' || guardOn || (C3.locked && C3.locked()) || (m && m.stamina < 0.995) || Cb.duel()));
    if (shown.on !== fight) { hud.classList.toggle('on', fight); shown.on = fight; }
    if (!fight) return;
    const st = m ? Math.round(G.clamp(m.stamina, 0, 1) * 100) / 100 : 1;
    if (st !== shown.st) { const c = hud.querySelector('.cb-st'); c.style.strokeDasharray = `${(C1 * st).toFixed(1)} ${C1.toFixed(1)}`; c.classList.toggle('low', st < 0.25); shown.st = st; }
    const ch = mode === 'carga' ? Math.min(1, chargeT / Cb.CHARGE) : mode === 'puxar' ? Math.min(1, drawT / DRAW) : 0; const chr = Math.round(ch * 50) / 50;
    if (chr !== shown.ch) { const c = hud.querySelector('.cb-ch'); c.style.strokeDasharray = `${(C2 * chr).toFixed(1)} ${C2.toFixed(1)}`; c.classList.toggle('full', chr >= 1); shown.ch = chr; }
    const g = guardOn ? (w && w.shield ? 'escudo' : 'arma') : null;
    if (g !== shown.g) { const e = hud.querySelector('.cb-guard'); e.classList.toggle('hidden', !g); e.textContent = g === 'escudo' ? '⛨' : g ? '⚔' : ''; shown.g = g; }
    const d = Cb.duel(); const me = body(); let dt = null;
    if (d && me) { const o = G.S.villagers.get(d.a === me.id ? d.o : d.a); const nm = o && G.Possess.knows ? G.Possess.knows.name(me, o) : o ? o.name : ''; dt = `Duelo com ${nm} — rende-se quem cair abaixo de ${Cb.YIELD} de vida`; }
    if (dt !== shown.d) { const e = hud.querySelector('.cb-duel'); e.classList.toggle('hidden', !dt); e.textContent = dt || ''; shown.d = dt; }
  }
  if (G.IncUI && G.IncUI.frames) G.IncUI.frames.push(rdt => U.frame(rdt));

  // ------------------------------ the challenge: the F on a person ------------------------------
  // (a verb of the person provider — the second wave's contract, D-460: «Desafiar», the duel; the world answers in its step)
  function addVerb() {
    const I = G.Interact; const p = I && I.list && I.list.find(q => q.id === 'pessoa'); if (!p || p.verbs && p.verbs.combate) return;
    const v0 = p.verbs;
    const mine = {
      k: 'outra', label: (ctx, t) => `Desafiar ${G.Possess.knows ? G.Possess.knows.call(ctx.v, t.o) : t.o.name} para um duelo`,
      can(ctx, t) { const o = t.o; if (!G.S.villagers.has(o.id)) return { ok: false, why: 'Não está mais aqui.' }; if (Cb.duel()) return { ok: false, why: 'Já há um duelo.' }; if (o.age < 16) return { ok: false, why: 'Uma criança não duela.' }; if (o.sleeping) return { ok: false, why: 'Está dormindo.' }; return { ok: true }; },
      run(ctx, t) {
        const o = t.o; const ask = G.Possess.apply(wv => { const r = Cb.challenge(wv, o); if (G.Possess.meet(o.id)) G.Possess.deed('conversa'); return r; }); // (asked face to face: the two meet — Possess.knows)
        Av.act({ anim: 'talk', dur: 1.2, lock: false, face: Math.atan2(t.Z - ctx.Z, t.X - ctx.X) });
        if (G.IncUI && G.IncUI.when) G.IncUI.when(ask, () => { const w = weapon(); if (w && !w.bow && !(Av.busy() && !Av.cuttable())) { if (C3.lockOn) C3.lockOn(o); } }, r => r && r.why && toast(r.why, 2));
        return { ok: true };
      },
    };
    p.verbs = (ctx, t) => (v0 ? v0(ctx, t) || [] : []).concat([mine]);
    p.verbs.combate = true;
  }
  addVerb();
  U.addVerb = addVerb; // (for the proofs, and for a provider made again)
})(window.G);
