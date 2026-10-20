'use strict';
// ============================================================
//  Modes: the one place that knows whether the player is a god
//  or a body, and the way between the two.
//    GOD ──enter(v)──► TO_INC ──► INC ──leave()──► TO_GOD ──► GOD
//                                  │  └─ the body dies ─► DYING ─► TO_GOD
//                                  └─ switchTo(o) (another body, a quick fade)
//  It decides which picture is drawn (the god's canvas, the 3D
//  one, or both blending), where the keys and the mouse go,
//  which interface shows, how fast the world's time runs for
//  the player, and who the body is. Nothing else in the game
//  keeps an "am I incarnated?" of its own: it asks here.
//  The descent (D-016): the god's camera centres and draws in
//  on the person; the 3D eye starts exactly where the god's eye
//  is — the same angle, from far off, with a narrow lens, so
//  the two pictures line up — the two blend, and then the lens
//  opens, the world gains its depth and the eye comes down in
//  an arc to behind the person's back. Going back up is the
//  same flight the other way. The world never stops: it goes
//  on living through all of it.
// ============================================================
(function (G) {
  const M3 = G.Modes = { state: 'GOD', t: 0, n: 0 };
  // (the beats of the descent and of the ascent, seconds: the two pictures are the same now — the god's colours and
  // houses in the 3D — so they melt into each other a little longer, 0,8 s)
  const TIN = [0.9, 1.7, 3.6], TOUT = [1.7, 2.5, 3.3];
  let god = null;        // the god's camera and speed before going down (given back on the way up)
  let fromPose = null, toPose = null, person = 0, dying = null, msg = '', menuOpen = false, panel = null, sleepK = 1, quickT = 0;
  const ease = t => t * t * t * (t * (t * 6 - 15) + 10); // (smootherstep)
  M3.is = s => M3.state === s;
  M3.god = () => M3.state === 'GOD';
  M3.inc = () => M3.state === 'INC';
  M3.panel = () => !!(panel || menuOpen);
  M3.setPanel = p => { panel = p || null; };
  // ------------------------------ can it be done ------------------------------
  // (asked of the browser without making anything: the god's view never holds a 3D context of its own — the real one is
  // made at the first descent, G.Realm.ready, and a browser that cannot is told so then)
  M3.webgl = () => !!(window.WebGL2RenderingContext || window.WebGLRenderingContext) && !(G.Realm && G.Realm.failed);
  M3.can = function (v) {
    if (!window.THREE || !M3.webgl()) return { ok: false, why: 'Este navegador não consegue desenhar em 3D (WebGL).' };
    if (!M3.god()) return { ok: false, why: 'Espere a transição terminar.' };
    if (G.Main.mode !== 'game' || (G.Skip && G.Skip.on)) return { ok: false, why: 'Agora não.' };
    return G.Possess.can(v);
  };

  // ------------------------------ the god's eye, as a 3D pose ------------------------------
  // where the 3D eye must be to see what the god's canvas shows: the same direction (the projection's own gradient,
  // whatever way the god's view is turned), 30° above the ground, and far enough with a narrow lens to frame the same
  // stretch of the world at this zoom
  const ISO_FOV = 9;
  function isoPose(x, y, zoom, sy) {
    const R = G.Render; const L = G.Space.TILE, H = G.Space.HM;
    const h = G.W.groundH(x, y);
    const p0 = R.proj(x, y, h), px = R.proj(x + 1, y, h), py = R.proj(x, y + 1, h);
    let fx = px[1] - p0[1], fz = py[1] - p0[1]; const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; // (toward the viewer)
    const el = Math.PI / 6;
    const vpH = window.innerHeight / Math.max(0.05, zoom) / 5.657; // (the height of the picture, in metres of the view plane)
    const D = vpH / (2 * Math.tan(ISO_FOV * Math.PI / 360));
    const gY = h * H * sy;
    // (the god's eye centres a little above the feet: 8 px of its picture)
    const up = 8 / 5.657; // (world pixels are the same at every zoom: 8 of them are 1.4 m of the view plane)
    const at = [x * L - fx * Math.sin(el) * up, gY + Math.cos(el) * up, y * L - fz * Math.sin(el) * up];
    return { pos: [at[0] + fx * Math.cos(el) * D, at[1] + Math.sin(el) * D, at[2] + fz * Math.cos(el) * D], at, fov: ISO_FOV, D, yaw: Math.atan2(-fz, -fx) };
  }
  M3.isoPose = isoPose;
  // a pose between two: the eye travels round the point it looks at (angles and log-distance), the lens opening
  function between(a, b, k) {
    const ra = sph(a), rb = sph(b);
    let dy = rb.yaw - ra.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
    const at = [G.lerp(a.at[0], b.at[0], k), G.lerp(a.at[1], b.at[1], k), G.lerp(a.at[2], b.at[2], k)];
    const yaw = ra.yaw + dy * k, pitch = G.lerp(ra.pitch, rb.pitch, k), d = Math.exp(G.lerp(Math.log(ra.d), Math.log(rb.d), k));
    const fov = Math.exp(G.lerp(Math.log(a.fov), Math.log(b.fov), Math.pow(k, 0.8)));
    return { pos: [at[0] - Math.cos(pitch) * Math.cos(yaw) * d, at[1] + Math.sin(pitch) * d, at[2] - Math.cos(pitch) * Math.sin(yaw) * d], at, fov };
  }
  function sph(p) { const dx = p.at[0] - p.pos[0], dy = p.pos[1] - p.at[1], dz = p.at[2] - p.pos[2]; const d = Math.hypot(dx, dy, dz); return { yaw: Math.atan2(dz, dx), pitch: Math.asin(G.clamp(dy / d, -1, 1)), d }; }
  function place(cam, p) { cam.position.set(p.pos[0], p.pos[1], p.pos[2]); cam.fov = p.fov; cam.near = Math.max(0.12, Math.min(6, sph(p).d * 0.02)); cam.far = Math.max(1600, sph(p).d * 3); cam.updateProjectionMatrix(); cam.lookAt(p.at[0], p.at[1], p.at[2]); }
  // the resting pose of the eye behind the body, as Cam3D will hold it (asked of Cam3D itself, on a stand-in camera)
  function restPose(body) {
    const fake = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000 };
    for (let k = 0; k < 40; k++) G.Cam3D.update(0.05, body, fake);
    return G.Cam3D.pose();
  }

  // ------------------------------ going down ------------------------------
  M3.enter = function (v) {
    const c = M3.can(v); if (!c.ok) { G.UI.notice(c.why, 'eye'); return false; }
    if (!G.Realm.ready()) { G.UI.notice('Este navegador não consegue desenhar em 3D (WebGL).', 'eye'); return false; }
    const R = G.Render; const cam = R.cam;
    god = { x: cam.x, y: cam.y, zoom: cam.tz, follow: cam.follow, speed: G.speed || 0, sel: G.UI.selected ? G.UI.selected.id : 0 };
    G.UI.select(null); G.UI.setPower(null); G.UI.closeModal && G.UI.closeModal();
    if (G.Cinema.on) G.Cinema.stop(); if (G.Photo.on) G.Photo.stop();
    const r = G.Possess.take(v); if (!r.ok) { G.UI.notice(r.why, 'eye'); return false; }
    person = v.id; M3.n++;
    begin3D(v);
    cam.follow = v.id; cam.tz = G.clamp(Math.max(cam.tz, 2.2), G.Render.minZoom(), 3.2);
    M3.state = 'TO_INC'; M3.t = 0;
    document.body.classList.add('inc-ui');
    G.IncUI.show(false);
    G.Audio && G.Audio.play && G.Audio.play('whoosh');
    return true;
  };
  function begin3D(v) {
    G.Realm.start(); G.Input3D.init(G.Realm.canvas()); G.IncUI.init();
    const iso = isoPose(v.x, v.y, G.Render.cam.zoom, 1);
    G.Avatar.attach(v, iso.yaw);
    G.Cam3D.attach(G.Avatar.pos(), iso.yaw);
    G.Realm.setOpacity(0); G.Realm.setDepth(0.62);
    G.Input3D.clear(); menuOpen = false; panel = null; sleepK = 1;
  }
  // a save made in the body opens in the body (no long descent: one wakes into it)
  M3.wake = function () {
    const v = G.Possess.body(); if (!v || !window.THREE || !M3.webgl() || !G.Realm.ready()) { if (G.S.avatar) G.Possess.release('deus'); return; }
    const cam = G.Render.cam;
    god = { x: cam.x, y: cam.y, zoom: Math.min(cam.tz, 1.6), follow: 0, speed: 1, sel: 0 };
    person = v.id; M3.n++;
    begin3D(v); G.Realm.setDepth(1); G.Realm.setOpacity(1);
    G.UI.select(null);
    document.body.classList.add('inc-ui', 'inc-on');
    M3.state = 'INC'; M3.t = 0; quickT = 0.9;
    G.IncUI.show(true); G.IncUI.fade(1, 0, 0.9); G.IncUI.toast(`Você desperta no corpo de ${v.name}.`);
  };
  // ------------------------------ going back up ------------------------------
  // (the body stays where it was left while the eye goes up — still, the player's — and goes back to its own life only
  // when the god's view is back: the god sees it exactly there, and sees it take up its life again)
  let giveBack = null;
  M3.leave = function (why, text) {
    if (M3.state !== 'INC' && M3.state !== 'TO_INC') return false;
    const v = G.Possess.body() || G.S.villagers.get(person);
    if (G.S.avatar) { giveBack = why || 'deus'; if (v) { v.moving = false; v.act = ''; } }
    up(v, text);
    return true;
  };
  function up(v, text) {
    G.Input3D.unlock(); G.Input3D.clear(); menuOpen = false; panel = null; G.IncUI.closeAll();
    const cam3 = G.Realm.camera(); fromPose = G.Cam3D.pose() || { pos: [cam3.position.x, cam3.position.y, cam3.position.z], at: [cam3.position.x + 1, cam3.position.y, cam3.position.z], fov: cam3.fov };
    G.Avatar.detach();
    // the god's canvas waits where the eye will arrive: on the person, at a near zoom
    const cam = G.Render.cam;
    cam.follow = v && G.S.villagers.has(v.id) ? v.id : 0;
    if (v) { const [sx, sy] = G.Render.proj(v.x, v.y, G.W.groundH(v.x, v.y)); cam.x = sx; cam.y = sy - 8; }
    cam.tz = cam.zoom = 2.2;
    msg = text || '';
    M3.state = 'TO_GOD'; M3.t = 0;
    G.IncUI.show(false);
    if (msg) G.IncUI.banner(msg, 2.6);
  }
  // the body died: the eye rises slowly over it, the name and the cause, then the flight up
  function die(rec, cause) {
    G.Input3D.unlock(); G.Input3D.clear(); menuOpen = false; panel = null; G.IncUI.closeAll(); G.IncUI.show(false);
    const p = G.Avatar.pos(); const st = G.Avatar.state();
    dying = { rec, cause, X: p ? p.X : rec.x * G.Space.TILE, Y: p ? p.Y : 0, Z: p ? p.Z : rec.y * G.Space.TILE, yaw: p ? p.yaw : 0, pose: st ? st.pose : G.Anim3D.POSE0(), look: G.People3D.look(rec.skin ? rec : { ...rec, age: rec.age || 30, g: rec.g || 'm' }) };
    G.Avatar.detach();
    M3.state = 'DYING'; M3.t = 0;
    G.IncUI.death(rec, cause);
    G.Audio && G.Audio.play && G.Audio.play('death');
  }
  G.Possess.onEnd.push((why, v, detail, a) => {
    if (M3.state === 'GOD' || why === 'troca' || why === 'deus') return;
    if (why === 'morte') { die(v, detail); return; }
    // the world took the body back (prison, the sea, a ship, the god's hand): up again, saying why
    const W2 = { aboard: 'Um navio levou o corpo para o mar', embark: 'Um navio levou o corpo para o mar', jail: 'A justiça prendeu', cela: 'A justiça prendeu', condemned: 'A justiça condenou', escorted: 'Inimigos capturaram', swim: 'A água arrastou', held: 'Mãos divinas tomaram', migrate: 'O povo partiu em migração e levou', scene: 'A história chamou' };
    const nm = v ? v.name : 'o corpo'; const w = W2[detail] || 'O mundo tomou de volta';
    up(v, `${w} ${nm}. Você volta a ser deus.`);
    void a;
  });
  // another body, from inside one (the card of the person spoken to): a quick fade, no flight
  M3.switchTo = function (o) {
    if (M3.state !== 'INC') return false;
    const c = G.Possess.can(o); if (!c.ok) { G.IncUI.toast(c.why); return false; }
    G.IncUI.closeAll(); panel = null;
    G.IncUI.fade(0, 1, 0.35, () => {
      if (M3.state !== 'INC') return;
      const r = G.Possess.take(o); if (!r.ok) { G.IncUI.toast(r.why); G.IncUI.fade(1, 0, 0.4); return; }
      person = o.id; M3.n++;
      const yaw = G.Cam3D.yaw; G.Avatar.attach(o, yaw); G.Cam3D.attach(G.Avatar.pos(), yaw);
      G.IncUI.fade(1, 0, 0.5); G.IncUI.toast(`Agora você vive a vida de ${o.name}.`);
    });
    return true;
  };

  // ------------------------------ the frame ------------------------------
  M3.cover = () => M3.state === 'INC' || M3.state === 'DYING' || (M3.state === 'TO_INC' && M3.t >= TIN[1]) || (M3.state === 'TO_GOD' && M3.t < TOUT[0]);
  M3.menu = function (on) { if (M3.state !== 'INC') return; menuOpen = on; if (on) { G.Input3D.unlock(); G.Input3D.clear(); } G.IncUI.menu(on); };
  M3.menuOpen = () => menuOpen;
  // the world's pace, for the main loop: the god's speed, the body's pace (D-015), or a night that passes quickly
  M3.timeScale = function (godSp) {
    const T = G.Space.TIME; const g = god ? god.speed : godSp;
    const v = G.Possess.body(); sleepK = v && v.sleeping ? 14 : 1;
    switch (M3.state) {
      case 'TO_INC': return G.lerp(g, T, ease(G.clamp(M3.t / TIN[1], 0, 1)));
      case 'INC': return menuOpen ? 0 : T * sleepK;
      case 'DYING': return T * 0.5;
      case 'TO_GOD': return G.lerp(T, g, ease(G.clamp(M3.t / TOUT[2], 0, 1)));
      default: return godSp;
    }
  };
  // a save holding a body opens into it (the save hook only says who; the eye comes here)
  function pollWake() { if (G.S && G.S.avatar && G.Main.mode === 'game' && !(G.Skip && G.Skip.on) && !G.Main.modalOpen) M3.wake(); }
  M3.frame = function (rdt) {
    if (M3.state === 'GOD') { pollWake(); return; }
    M3.t += rdt;
    const R3 = G.Realm, cam = R3.camera(), IN = G.Avatar.input;
    // the hands: only in the body, with no panel open
    if (M3.state === 'INC' && !M3.panel()) { const a = G.Input3D.axes(); IN.mx = a.mx; IN.mz = a.mz; IN.run = a.run; IN.sneak = a.sneak; IN.camYaw = G.Cam3D.yaw; }
    else { IN.mx = IN.mz = 0; IN.run = IN.sneak = false; IN.jump = false; IN.camYaw = G.Cam3D.yaw; }
    // (the menu open, the world stands still — and the body with it: no fall, no swim, no breath spent while nobody plays)
    if (!menuOpen) G.Avatar.frame(rdt);
    let focus = null;
    const body = G.Avatar.pos();
    if (M3.state === 'TO_INC') {
      const v = G.Possess.body(); if (!v) { if (M3.state === 'TO_INC') up(G.S.villagers.get(person)); return; }
      const k = M3.t;
      const b = body || { X: v.x * 4, Y: 0, Z: v.y * 4, yaw: 0, speed: 0, ground: true };
      focus = b;
      if (k < TIN[1]) {
        // (1) the god's eye draws in; the 3D eye shadows it exactly, unseen, then (2) the two pictures blend
        const iso = isoPose(v.x, v.y, G.Render.cam.zoom, 0.62); place(cam, iso); fromPose = iso;
        if (k >= TIN[0]) R3.setOpacity(ease((k - TIN[0]) / (TIN[1] - TIN[0])));
        if (k > 0.25) document.body.classList.add('inc-on');
      } else {
        // (3) the lens opens, the world gains depth, the eye comes down behind the back
        if (!toPose) toPose = restPose(b);
        const u = ease(G.clamp((k - TIN[1]) / (TIN[2] - TIN[1]), 0, 1));
        R3.setOpacity(1); R3.setDepth(G.lerp(0.62, 1, u));
        place(cam, between(fromPose, toPose, u));
        if (k >= TIN[2]) { M3.state = 'INC'; toPose = null; G.IncUI.show(true); G.IncUI.hello(v); }
      }
    } else if (M3.state === 'INC') {
      if (body) { G.Cam3D.update(rdt, Object.assign({ h: (G.Possess.body() ? G.People3D.look(G.Possess.body()).s * 1.75 : 1.75) }, body), cam); focus = body; }
      if (quickT > 0) quickT -= rdt;
    } else if (M3.state === 'DYING') {
      const d = dying; focus = d;
      G.Anim3D.blend(d.pose, G.Anim3D.pose('sleep', M3.t, 0), rdt, 3);
      G.People3D.avatar = { id: d.rec.id, X: d.X, Y: d.Y, Z: d.Z, yaw: d.yaw, pose: d.pose, look: d.look };
      const u = ease(G.clamp(M3.t / 3.2, 0, 1));
      place(cam, { pos: [d.X - Math.cos(d.yaw) * (3 + u * 9), d.Y + 2 + u * 14, d.Z - Math.sin(d.yaw) * (3 + u * 9)], at: [d.X, d.Y + 0.4, d.Z], fov: 50 });
      if (M3.t > 3.6) { const p = G.Cam3D.pose(); void p; G.People3D.avatar = null; fromPose = { pos: [cam.position.x, cam.position.y, cam.position.z], at: [d.X, d.Y + 0.4, d.Z], fov: 50 }; const x = d.X / G.Space.TILE, y = d.Z / G.Space.TILE; const c2 = G.Render.cam; const [sx, sy] = G.Render.proj(x, y, G.W.groundH(x, y)); c2.follow = 0; c2.x = sx; c2.y = sy - 8; c2.tz = c2.zoom = 2.2; M3.state = 'TO_GOD'; M3.t = 0; dying.done = true; }
    } else if (M3.state === 'TO_GOD') {
      const v = G.S.villagers.get(person) || (dying && dying.rec);
      const L = G.Space.TILE; const x = dying ? dying.X / L : v ? v.x : 0, y = dying ? dying.Z / L : v ? v.y : 0;
      focus = { X: x * G.Space.TILE, Y: 0, Z: y * G.Space.TILE };
      const k = M3.t;
      if (k < TOUT[0]) {
        const u = ease(k / TOUT[0]);
        const iso = isoPose(x, y, G.Render.cam.zoom, 0.62);
        R3.setDepth(G.lerp(1, 0.62, u));
        place(cam, between(fromPose, iso, u));
      } else if (k < TOUT[1]) {
        place(cam, isoPose(x, y, G.Render.cam.zoom, 0.62));
        R3.setOpacity(1 - ease((k - TOUT[0]) / (TOUT[1] - TOUT[0])));
        document.body.classList.remove('inc-on');
      } else {
        R3.setOpacity(0);
        if (!M3._zoomed) { M3._zoomed = true; G.Render.cam.tz = G.clamp(god ? Math.min(god.zoom, 1.8) : 1.4, G.Render.minZoom(), 3.2); }
        if (k >= TOUT[2]) finish(v);
      }
    }
    // (the plans asked for round the body made, a few ms a frame — Interiors' own line: the frame never makes a whole one)
    if (M3.state !== 'GOD') { G.Space.pump(M3.state === 'INC' ? 3 : 2); R3.frame(rdt, focus, M3.state === 'INC' ? 6 : 12); G.IncUI.frame(rdt); }
  };
  function finish(v) {
    M3._zoomed = false;
    if (giveBack && G.S.avatar && G.S.avatar.id === person) G.Possess.release(giveBack);
    giveBack = null;
    G.Realm.stop(); G.Avatar.detach(); G.People3D.avatar = null;
    document.body.classList.remove('inc-ui', 'inc-on');
    M3.state = 'GOD'; M3.t = 0; fromPose = toPose = null;
    const sp = god ? god.speed : 1; G.UI.setSpeed(sp);
    // (the god sees at once the one they lived: selected and followed)
    if (v && !v.dead && G.S.villagers.has(v.id)) { G.UI.select(v); G.Render.cam.follow = v.id; }
    else if (dying && dying.rec) { G.UI.select(G.S.dead.get(dying.rec.id) || null); G.Render.cam.follow = 0; }
    dying = null; god = null; msg = '';
    G.IncUI.closeAll();
  }
  // a new world, or a save opened: whatever the eye was doing stops, the god's view comes back
  G.worldHooks.push(() => {
    if (M3.state === 'GOD') return;
    G.Input3D && G.Input3D.unlock(); G.Realm && G.Realm.stop(); G.Avatar && G.Avatar.detach();
    document.body.classList.remove('inc-ui', 'inc-on');
    M3.state = 'GOD'; M3.t = 0; fromPose = toPose = null; dying = null; god = null; menuOpen = false; panel = null; M3._zoomed = false; giveBack = null;
    G.IncUI && G.IncUI.closeAll(); G.IncUI && G.IncUI.show(false);
  });

  // ------------------------------ the keys ------------------------------
  // (main.js gives every key here first; true when it belonged to the body)
  M3.key = function (e, down) {
    if (M3.state === 'GOD') return false;
    if (e.key === 'F2') return false; // (the workbench stays a workbench)
    if (M3.state !== 'INC') { e.preventDefault && e.key !== 'F5' && e.key !== 'F12' && e.preventDefault(); return true; }
    if (G.IncUI.keyCapture(e, down)) return true;
    G.Input3D.key(e, down);
    return true;
  };
  // what the actions do (the controller only hears the feet and the jump)
  G.Input3D.onAction = function (a) {
    if (M3.state !== 'INC') return;
    if (a === 'menu') { if (panel) { G.IncUI.closeAll(); panel = null; } else M3.menu(!menuOpen); return; }
    if (menuOpen) return;
    if (a === 'deus') { M3.leave('deus'); return; }
    if (a === 'ficha') { if (panel === 'self') { G.IncUI.closeAll(); panel = null; } else { G.IncUI.selfCard(); } return; }
    if (a === 'sentar') { G.Avatar.sit(); return; }
    // (a wave of the hand: those standing near turn to it and wave back — the hello of the people, only seen)
    // (a dance: whoever is free and merry near the body joins in — the world's people, stopping a while to dance with it)
    // (what the world does about it — the deed counted, the people joining — the world does in its step: Possess.apply)
    if (a === 'dancar') { if (G.Avatar.dance()) G.Possess.apply(() => { G.Possess.deed('danca'); G.Interact.danceJoin(); return { ok: true }; }); return; }
    if (a === 'acenar') { if (G.Avatar.wave()) { G.Possess.apply(() => { G.Possess.deed('aceno'); return { ok: true }; }); const p = G.Avatar.pos(); if (p && G.People3D.greet) G.People3D.greet(p.X, p.Z); } return; }
    if (a === 'interagir') {
      if (panel) { G.IncUI.closeAll(); panel = null; return; }
      const v = G.Possess.body(); if (v && v.sleeping) { G.Possess.apply(w => { G.Possess.wake(w); return { ok: true }; }); return; }
      G.IncUI.use();
    }
  };
  // a key in the god's view: I — live someone near the middle of the screen (the quick way; the panel's button is the main one)
  M3.quick = function () {
    const R = G.Render; const [cx, cy] = R.screenToTile(window.innerWidth / 2, window.innerHeight / 2);
    let best = null, bd = 1e9;
    for (const v of G.S.villagers.values()) { if (v.age < 14 || !G.Possess.can(v).ok) continue; const d = G.dist2(v.x, v.y, cx, cy); if (d < bd) { bd = d; best = v; } }
    if (!best || bd > 30 * 30) { G.UI.notice('Ninguém por perto para encarnar. Aproxime a câmera de uma vila.', 'eye'); return false; }
    return M3.enter(best);
  };
})(window.G);
