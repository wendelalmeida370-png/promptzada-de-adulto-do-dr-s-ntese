'use strict';
// ============================================================
//  IncUI: what the player sees over the body's eyes. Little and
//  clean: who one is (name, age, trade), the body's state as the
//  world keeps it (life, hunger, sleep — v.hp, v.hunger, v.energy
//  — and the breath for running), where one is (the town, the
//  quarter, the ground), the hour, a compass; the one thing that
//  can be done right now ("E — Conversar com Aelia"); the calls
//  of the world (the war, a fire); the news that reach the ears;
//  and the cards: a person, a building, a thing, oneself. The
//  pause menu holds the way back up, saving, the keys and the
//  picture's quality. Built once, the first time the body is
//  entered, and only shown or hidden after (nothing piles up).
//  What it says of the world it asks of Possess.knows: the name
//  of a quarter, of a person, the coins of a house, only where
//  the person lived could say them — else what is seen (D-170).
//  The key H puts all of it away: the place must say what it is
//  by itself (D-173).
//  Its look is the god's gold and letters, quieter: small type,
//  dark glass that reads over snow and a white sky, the compass
//  across the top, words that fade out (arte/BIBLIA.md, a HUD).
// ============================================================
(function (G) {
  const IU = G.IncUI = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  let hurtEl = null, hurt = { k: 0, low: 0, ang: 0, side: 0, beat: 0, hp0: -1, ghostT: 0 }; // (the red of a blow at the picture's edges, D-333)
  let root = null, hud = null, card = null, menu = null, fadeEl = null, banner = null, deathEl = null, label = null, stickEl = null, leadEl = null, markEl = null;
  let best = null, bestT = 0, upT = 0, toasts = [], news = [], fade = null, hintT = 0, bannerT = 0, repeatT = 0, slowT = 0, slowSaid = false;
  let swimTold = false, lowTold = false, drownTold = false; // (the water's words: said once, and again each time it comes back)
  let waits = []; // (what was asked of the world from here — a click, a key —, waiting for its answer to be told)
  let lead = null, leadT = 0; // (the lead to the work near: Interact.lead, asked a few times a second)
  G.worldHooks.push(() => { swimTold = lowTold = drownTold = false; news = []; waits = []; lead = null; leadT = 0; lastBody = 0; if (root) renderNews(); });   // (the old world's news go with it)
  IU.best = () => best;
  IU.lead = () => lead; // (for the tests: the lead shown, and where its mark is — IU.markAt)
  // the screen put away (D-173): the place has to say what it is by itself — who goes by and how they are dressed, what
  // sounds, the smoke, the lights. Put away: who one is, the place, the hour, the compass, the news, the calls, the lead, what
  // can be done, the name over a head. Kept: the words people say (they are the world's), what the world answers to the hands
  // (a refusal has to be heard), the word for waking, the fingers' buttons; the cards, the menu, the death and the way back up
  // open as ever — nothing of the game is lost, E still does what the hands reach. Kept in this browser, like the keys
  let hudOff = false, lastBody = 0;
  try { hudOff = localStorage.getItem('gotaf-tela') === 'off'; } catch (e) { }
  IU.hudOff = () => hudOff;
  IU.setHud = function (on, quiet) {
    hudOff = !on; try { localStorage.setItem('gotaf-tela', on ? 'on' : 'off'); } catch (e) { }
    if (!root) return;
    root.classList.toggle('hud-off', hudOff); upT = 0; bestT = 0;
    if (hudOff) { label.classList.add('hidden'); G.People3D.highlight = 0; }
    if (!quiet) IU.toast(hudOff ? `Tela desligada — ${G.Input3D.label('tela')} liga de novo.` : 'Tela ligada.', 3);
  };
  const bar = (k, txt) => `<div class="ih-bar ${k}"><span class="ih-bl">${txt}</span><i>${k === 'hp' ? '<s></s>' : ''}<b></b></i></div>`; // (the life's bar: the chunk a blow took lingers behind it, s)

  IU.init = function () {
    if (root) return;
    root = document.createElement('div'); root.id = 'inc-root';
    root.innerHTML = `
      <div id="inc-hud" class="hidden">
        <canvas id="inc-air"></canvas>
        <div class="ih-who panel"><div class="ih-name"></div><div class="ih-sub"></div>
          <div class="ih-bars">${bar('hp', 'Vida')}${bar('st', 'Fôlego')}${bar('fo', 'Fome')}${bar('en', 'Sono')}</div><div class="ih-carry"></div></div>
        <div class="ih-clock panel"><div class="ih-time"></div><div class="ih-place"></div></div>
        <div class="ih-compass"><div class="ih-strip"></div><i></i></div>
        <div class="ih-news"></div>
        <div class="ih-calls"></div>
        <div class="ih-lead hidden"><i></i><span></span></div>
        <div class="ih-mark hidden"><i></i><u></u><b></b></div>
        <div class="ih-prompt hidden"><div class="ih-main"><kbd>E</kbd><span></span></div><i class="ih-alt hidden"><kbd>F</kbd><b></b></i><i class="ih-hold hidden"><kbd>E</kbd><u class="ih-ring"></u><em>segurar</em><b></b></i><i class="ih-cyc hidden"><kbd>Roda</kbd><b></b></i></div>
        <div class="ih-hotbar"></div>
        <div class="ih-reticle"></div>
        <div class="ih-lockmark hidden"><i></i></div>
        <div class="ih-hint panel"></div>
        <div class="ih-corner"><button class="ih-diary" title="Diário de Vida">${(G.ICON && G.ICON.book) || ''}<span>Diário</span></button><button class="ih-god" title="Voltar ao Modo Deus">${(G.ICON && G.ICON.eye) || ''}<span>Modo Deus</span></button></div>
        <div class="ih-toasts"></div>
        <div class="ih-sleep hidden">Dormindo… <small>o tempo passa depressa · <kbd>E</kbd> para acordar</small></div>
        <div class="ih-touch hidden"><div class="ih-stick"><i></i></div><div class="ih-tb"></div></div>
      </div>
      <div id="inc-label" class="hidden"></div>
      <div id="inc-card" class="panel hidden"></div>
      <div id="inc-menu" class="panel hidden"></div>
      <div id="inc-banner" class="hidden"></div>
      <div id="inc-hurt"><i></i></div>
      <div id="inc-death" class="hidden"></div>
      <div id="inc-fade"></div>`;
    document.body.appendChild(root);
    hurtEl = $('#inc-hurt'); hud = $('#inc-hud'); card = $('#inc-card'); menu = $('#inc-menu'); fadeEl = $('#inc-fade'); banner = $('#inc-banner'); deathEl = $('#inc-death'); label = $('#inc-label'); stickEl = $('.ih-stick', hud);
    leadEl = $('.ih-lead', hud); markEl = $('.ih-mark', hud);
    root.classList.toggle('hud-off', hudOff);
    $('.ih-god', hud).onclick = () => G.Modes.leave('deus');
    $('.ih-diary', hud).onclick = () => G.Input3D.press('diario'); // (the same as its key)
    touchBuild();
    // (20e: the prompt is a button for the fingers — its E line the E, its F line the F)
    { const pr = $('.ih-prompt', hud); pr.addEventListener('click', e => { if (!G.Modes.is('INC') || G.Modes.panel()) return; e.stopPropagation(); if (e.target.closest('.ih-alt')) IU.useVerb('outra'); else if (e.target.closest('.ih-hold')) IU.useVerb('segurar'); else if (e.target.closest('.ih-cyc')) IU.cycle(1); else { IU.press(); IU.release(); } }); }
    card.addEventListener('click', onCardClick); menu.addEventListener('click', onMenuClick); menu.addEventListener('input', onMenuInput);
    // (the cards and the menu are the mouse's: a click there is not a look-around)
    for (const el of [card, menu]) el.addEventListener('mousedown', e => e.stopPropagation());
  };
  IU.show = function (on) { if (!root) return; hud.classList.toggle('hidden', !on); if (on) { hintT = 14; } if (!on) { label.classList.add('hidden'); } };
  IU.touchOn = () => { if (root) hud.querySelector('.ih-touch').classList.remove('hidden'); };
  // (the thumb's knob where the thumb is, to the ring's edge; past the ring — the sprint — the ring glows)
  IU.stick = function (s) { if (!stickEl) return; stickEl.classList.toggle('on', !!s); if (s) { stickEl.style.left = (s.ox - 60) + 'px'; stickEl.style.top = (s.oy - 60) + 'px'; stickEl.firstChild.style.transform = `translate(${(s.vx !== undefined ? s.vx : s.x) * 40}px, ${(s.vy !== undefined ? s.vy : s.y) * 40}px)`; stickEl.classList.toggle('run', !!s.run); } };
  // ------------------------------ the fingers' buttons (20b, D-355) ------------------------------
  // built from Input3D's registry of buttons (each action brings its own: the jump, the hands, the sprint, the dodge, the crouch,
  // the target; the second wave the blow and the guard), shown when their moment is — asked a few times a second —, laid round
  // the right thumb in the order they come; the menu in the corner. A held one is pressed and let go with the finger; a toggle
  // shows whether it is on
  let tbVer = -1, tbT = 0; const tbEls = new Map();
  const ARC = [[22, 110], [98, 146], [94, 64], [166, 100], [170, 22], [22, 192], [100, 226], [176, 178]];
  function touchBuild() {
    const In = G.Input3D, box = root && $('.ih-tb', hud); if (!box || tbVer === In.btnVer) return; tbVer = In.btnVer;
    box.innerHTML = ''; tbEls.clear();
    for (const d of In.BUTTONS) {
      const el = document.createElement('button'); el.dataset.k = d.a; el.className = 'ih-tbtn' + (d.slot === 'canto' ? ' canto' : '') + (d.a === 'pular' ? ' main' : '');
      el.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); if (G.Audio && G.Audio.init) G.Audio.init();
        if (d.a === 'correr') In.touchRun(); else if (d.hold) In.press(d.a, true); else In.press(d.a); tbT = 0; }, { passive: false });
      el.addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); if (d.hold) In.press(d.a, false); }, { passive: false });
      el.addEventListener('touchcancel', () => { if (d.hold) In.press(d.a, false); });
      box.appendChild(el); tbEls.set(d.a, { el, d, vis: null, lab: null, on: null });
    }
    tbT = 0;
  }
  // (the foot of the screen — the hotbar and the corner's buttons — is theirs: the fingers' buttons stand above it; and on a narrow
  // or short screen (a phone, upright or lying) they are smaller and in a tight grid at the right edge — two columns upright, four
  // lying —, clear of the body in the middle — on the owner's phone they fell over the hotbar and the body: L-1246)
  function footBand() {
    let top = innerHeight;
    for (const s of ['.ih-hotbar', '.ih-corner']) { const e = $(s, hud); if (!e) continue; const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && r.top < top) top = r.top; }
    return Math.max(0, Math.round(innerHeight - top));
  }
  IU.compactTouch = () => innerWidth < 600 || innerHeight < 500;
  function touchFrame(rdt) {
    if (!root || !G.Input3D.touch) return; touchBuild(); tbT -= rdt; if (tbT > 0) return; tbT = 0.25;
    let k = 0; const foot = footBand(), tight = IU.compactTouch();
    for (const [, q] of tbEls) {
      const d = q.d; const vis = !d.when || !!d.when();
      if (vis !== q.vis) { q.vis = vis; q.el.classList.toggle('hidden', !vis); }
      if (!vis) continue;
      const lab = typeof d.label === 'function' ? d.label() : d.label; if (lab !== q.lab) { q.lab = lab; q.el.textContent = lab; }
      const on = d.toggle && d.on ? !!d.on() : false; if (on !== q.on) { q.on = on; q.el.classList.toggle('on', on); }
      if (d.slot !== 'canto') {
        let r, b; if (tight) { const cols = innerWidth < 600 ? 2 : 4; r = 8 + (k % cols) * 52; b = foot + 8 + Math.floor(k / cols) * 52; } else { const p = ARC[Math.min(k, ARC.length - 1)]; r = p[0]; b = foot + 8 + p[1] - 22; }
        k++; const st = `${r}px|${b}px`; if (q.el._at !== st) { q.el._at = st; q.el.style.right = `calc(${r}px + env(safe-area-inset-right, 0px))`; q.el.style.bottom = b + 'px'; } }
    }
  }
  IU.touchButtons = () => [...tbEls.values()].filter(q => q.vis).map(q => q.d.a); // (for the proofs: the buttons shown now)
  // (the target held, marked where the 3D draws it — a diamond over it —, and the reticle of the aim: only the eye's, D-369)
  let lockEl = null; IU.lockAt = null;
  function lockFrame() {
    if (!hud) return; if (!lockEl) lockEl = $('.ih-lockmark', hud);
    hud.classList.toggle('aiming', !!(G.Modes.inc() && G.Cam3D.aiming && G.Cam3D.aiming()));
    const t = G.Modes.inc() && G.Cam3D.locked ? G.Cam3D.locked() : null; const cam = t && G.Realm.camera && G.Realm.camera();
    if (!t || !cam || !window.THREE) { if (!lockEl.classList.contains('hidden')) lockEl.classList.add('hidden'); IU.lockAt = null; return; }
    const q = IU._lv || (IU._lv = new window.THREE.Vector3()); q.set(t.X, t.Y + 0.35, t.Z); q.project(cam);
    if (q.z > 1) { lockEl.classList.add('hidden'); IU.lockAt = null; return; }
    const x = (q.x * 0.5 + 0.5) * window.innerWidth, y = (-q.y * 0.5 + 0.5) * window.innerHeight;
    lockEl.classList.remove('hidden'); lockEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`; IU.lockAt = { x, y };
  }

  // ------------------------------ words of the moment ------------------------------
  IU.toast = function (txt, dur) {
    if (!root) return; const el = document.createElement('div'); el.className = 'ih-toast'; el.textContent = txt;
    $('.ih-toasts', hud).appendChild(el); toasts.push({ el, t: dur || 3.6 });
    while (toasts.length > 4) { const o = toasts.shift(); o.el.remove(); }
  };
  // (what the world answers to something asked of it here — Possess.apply's ask —, told when it has answered: ok(res), or no(res))
  IU.when = function (ask, ok, no) { if (ask) waits.push({ ask, ok, no }); };
  // (while the banner speaks the news step back: on a narrow screen they sit right behind it)
  IU.banner = function (txt, dur) { if (!root) return; banner.textContent = txt; banner.classList.remove('hidden'); root.classList.add('ib-on'); bannerT = dur || 2.6; };
  IU.hello = function (v) {
    if (hudOff) return; // (the screen put away: no word of who and where)
    const id = G.Possess.identity(v); const w = G.Possess.knows.where(v);
    IU.banner(`${id.name} · ${id.age} ${id.age === 1 ? 'ano' : 'anos'} · ${id.role}${w.town || w.near ? ' · ' + (w.town || 'perto de ' + w.near) : ''}`, 3.4);
  };
  // the fade (to and from black): from, to in 0..1, seconds, and what to do at the end
  IU.fade = function (a, b, d, done) { if (!root) return; fade = { a, b, d: Math.max(0.01, d), t: 0, done }; fadeEl.style.opacity = a; };
  // a blow taken (D-333, from the body's controller): the edges of the picture go red — the side it came from the redder —, the life
  // bar drops at once, the chunk it lost lingering a moment behind it. src: where it came from (metres), or nothing (a fall)
  IU.hurt = function (e, src) {
    if (!root) return; const amt = e && e.amt || 0; const big = !!(e && e.big);
    hurt.k = Math.min(1, Math.max(hurt.k, 0.35 + amt / 40 + (big ? 0.3 : 0)));
    const p = G.Avatar && G.Avatar.pos();
    if (src && p) { let a = Math.atan2(src.Z - p.Z, src.X - p.X) - G.Cam3D.yaw; while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; hurt.ang = a; hurt.side = 1; } else hurt.side = 0;
    const v = G.Possess.body(); if (v && hud) { const e2 = $('.ih-bar.hp', hud); if (e2) { const s2 = e2.querySelector('s'), b2 = e2.querySelector('b'); const was = hurt.hp0 >= 0 ? hurt.hp0 : v.hp + amt;
      s2.style.transition = 'none'; s2.style.width = G.clamp(was, 0, 100) + '%'; b2.style.width = G.clamp(v.hp, 0, 100) + '%'; void s2.offsetWidth; s2.style.transition = ''; hurt.ghostT = 0.55; e2.classList.remove('hit'); void e2.offsetWidth; e2.classList.add('hit'); } }
    hurt.hp0 = v ? v.hp : -1;
  };
  // (every frame: the red fades; with the life low it stays at the edges and beats with the heart)
  function hurtFrame(rdt) {
    if (!hurtEl) return; const v = G.Modes.inc() ? G.Possess.body() : null;
    hurt.k = Math.max(0, hurt.k - rdt * 1.6);
    const low = v ? G.clamp((35 - v.hp) / 30, 0, 1) : 0; hurt.low += (low - hurt.low) * (1 - Math.exp(-3 * rdt));
    if (low > 0.05) { hurt.beat -= rdt; if (hurt.beat <= 0) { hurt.beat = 1.05 - 0.35 * low; G.Audio && G.Audio.play && G.Audio.play('heartbeat', 0.25 + 0.5 * low); } }
    const pulse = hurt.low * (0.55 + 0.45 * Math.max(0, Math.sin(performance.now() / 1000 * Math.PI * 2 / Math.max(0.6, 1.05 - 0.35 * low))));
    const o = Math.min(1, hurt.k + pulse * 0.6); const op = o.toFixed(3);
    if (hurtEl._o !== op) { hurtEl._o = op; hurtEl.style.opacity = op; }
    const side = hurt.side && hurt.k > 0.05 ? hurt.k : 0; const i = hurtEl.firstChild;
    if (side > 0) { const x = 50 + Math.sin(hurt.ang) * 46, y = 50 - Math.cos(hurt.ang) * 46; i.style.background = `radial-gradient(circle at ${x.toFixed(0)}% ${y.toFixed(0)}%, rgba(200,10,10,${(0.75 * side).toFixed(2)}) 0%, rgba(160,0,0,0) 45%)`; i.style.opacity = '1'; }
    else if (i.style.opacity !== '0') i.style.opacity = '0';
    if (hurt.ghostT > 0) { hurt.ghostT -= rdt; if (hurt.ghostT <= 0 && hud) { const e2 = $('.ih-bar.hp', hud); if (e2 && v) e2.querySelector('s').style.width = G.clamp(v.hp, 0, 100) + '%'; } }
    if (!v) { hurt.hp0 = -1; } else if (hurt.ghostT <= 0) hurt.hp0 = v.hp;
  }
  IU.hurtNow = () => ({ k: hurt.k, low: hurt.low, side: hurt.side, ang: hurt.ang }); // (for the proofs)
  // what took a life, in the few words the death says first: «Morto por um hipopótamo»
  const KILL = { queda: 'numa queda', drown: 'afogad', fire: 'pelo fogo', lightning: 'por um raio', hunger: 'de fome', sick: 'pela doença', old: 'de velhice', war: 'em combate', arrow: 'por uma flecha', wolf: 'por lobos', boar: 'por um javali', dragon: 'pelo dragão', quake: 'no terremoto', meteor: 'por um meteoro', execution: 'pela justiça', riot: 'no motim', brawl: 'numa briga' };
  IU.killLine = function (rec, cause, beast) {
    const o = rec && rec.g === 'f' ? 'a' : 'o'; const D = beast && G.Animals && G.Animals.DEF[beast];
    if ((cause === 'beast' || cause === 'wolf' || cause === 'boar') && D) return `Mort${o} por ${D.nameA}`;
    if (cause === 'old') return 'Morreu de velhice'; if (cause === 'drown') return `Afogad${o}`;
    return KILL[cause] ? `Mort${o} ${KILL[cause]}` : '';
  };
  IU.death = function (rec, cause, beast) {
    if (!root) return;
    const txt = G.Village.deathText({ ...rec, cause: cause || rec.cause, lastBeast: beast || rec.lastBeast }); const kill = IU.killLine(rec, cause || rec.cause, beast);
    deathEl.innerHTML = `${kill ? `<div class="d-kill">${esc(kill)}</div>` : ''}<div class="d-name">${esc(rec.name)}</div><div class="d-cause">${esc(G.cap ? G.cap(txt) : txt)}.</div><div class="d-sub">A vida terminou. O mundo segue — e a história lembra.</div>`;
    IU.lastDeath = { kill, txt }; // (for the proofs)
    if (banner) { banner.classList.add('hidden'); root.classList.remove('ib-on'); bannerT = 0; } // (the words of the moment give way to the death's)
    deathEl.classList.remove('hidden'); deathEl.classList.add('show');
  };
  // the death's words go as the eye flies back up to the god (Modes, at the end of the dying)
  IU.deathOff = function () {
    if (!deathEl || !deathEl.classList.contains('show')) return;
    deathEl.classList.remove('show'); setTimeout(() => { if (!deathEl.classList.contains('show')) deathEl.classList.add('hidden'); }, 900);
  };
  // the chronicle reaches the ears: a line of news (the world goes on beyond the body)
  G.Possess.onLog.push((e, v) => {
    if (!root || !G.Modes.inc()) return;
    const near = v && Number.isFinite(e.x) && G.dist(e.x, e.y, v.x, v.y) < 30;
    // (what happens far away reaches the ears only from where the person could have heard of: Possess.knows.hears, D-171)
    if (!near && !(G.Possess.knows.hearsNow || G.Possess.knows.hears)(v, e)) return; // (22b: of another town, as the talk brings it)
    // (the same thing happening in several places at once — the games of three cities, the feast of two — is one line,
    // with how many more places: the view stays open)
    const same = news.find(n => alike(n.txt, e.txt));
    if (same) { same.more++; same.t = 9; same.far = same.far && !near; }
    else { news.push({ txt: e.txt, far: !near, t: 9, more: 0 }); if (news.length > 2) news.shift(); }
    renderNews();
  });
  // (two lines alike: they end the same way for most of their length — only the place they begin with differs)
  function alike(a, b) {
    if (a === b) return true; let k = 0; const n = Math.min(a.length, b.length);
    while (k < n && a[a.length - 1 - k] === b[b.length - 1 - k]) k++;
    return k >= 24 && k >= n * 0.6;
  }
  IU._alike = alike;
  // (what comes from afar carries a small label instead of a word in front of it: the eye reads the news, not the label)
  function renderNews() { $('.ih-news', hud).innerHTML = news.map(n => `<div class="${n.far ? 'far' : ''}">${n.far ? '<b>Notícia</b>' : ''}${esc(n.txt)}${n.more ? ` <small>— e em mais ${n.more} ${n.more > 1 ? 'lugares' : 'lugar'}</small>` : ''}</div>`).join(''); }
  // (words that go away fade out over their last moments instead of blinking off)
  const fadeOut = (el, t, d) => { const o = t < d ? (Math.max(0, t) / d).toFixed(2) : ''; if (el._o !== o) { el._o = o; el.style.opacity = o; } };

  // ------------------------------ the frame ------------------------------
  const hourOf = t => { const h = t >= 0.02 && t <= 0.73 ? 6 + (t - 0.02) / 0.71 * 13 : (19 + (((t - 0.73) + 1) % 1) / 0.29 * 11) % 24; const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
  const DIRS = ['L', 'SE', 'S', 'SO', 'O', 'NO', 'N', 'NE']; // (east first: yaw 0 looks east, +yaw turns south)
  // (the parts' own screens on the body's beat — the second wave's contract, D-462: a part's HUD lives in its own file and is
  // drawn by its hook here, the same frame, the same pause)
  IU.frames = [];
  IU.frame = function (rdt) {
    if (!root) return;
    for (const f of IU.frames) f(rdt);
    const S = G.S;
    // the world's answers to what was asked of it
    for (let k = waits.length - 1; k >= 0; k--) { const w = waits[k]; const r = w.ask.res; if (!r) continue; waits.splice(k, 1); if (r.dropped) continue; if (r.ok) { if (w.ok) w.ok(r); } else if (w.no) w.no(r); }
    // fades, banners, toasts, news
    if (fade) { fade.t += rdt; const k = Math.min(1, fade.t / fade.d); fadeEl.style.opacity = G.lerp(fade.a, fade.b, k); if (k >= 1) { const d = fade.done; fade = null; d && d(); } }
    if (bannerT > 0) { bannerT -= rdt; if (bannerT <= 0) { banner.classList.add('hidden'); root.classList.remove('ib-on'); } }
    hurtFrame(rdt); touchFrame(rdt); lockFrame();
    for (let k = toasts.length - 1; k >= 0; k--) { const o = toasts[k]; o.t -= rdt; if (o.t <= 0) { o.el.remove(); toasts.splice(k, 1); } else fadeOut(o.el, o.t, 0.5); }
    let nd = false; for (let k = news.length - 1; k >= 0; k--) { news[k].t -= rdt; if (news[k].t <= 0) { news.splice(k, 1); nd = true; } } if (nd) renderNews();
    { const els = $('.ih-news', hud).children; for (let k = 0; k < news.length && k < els.length; k++) fadeOut(els[k], news[k].t, 0.8); }
    if (hintT > 0) { hintT -= rdt; }
    fadeOut($('.ih-hint', hud), hintT, 1.2);
    if (!G.Modes.inc()) { label.classList.add('hidden'); markEl.classList.add('hidden'); return; }
    drawAir(); tapHook();
    const v = G.Possess.body(); if (!v) return;
    // (another body: what reached the ears of the one before is not this one's)
    if (v.id !== lastBody) { lastBody = v.id; if (news.length) { news = []; renderNews(); } }
    // (the diary's page, while it is open: read again once a second — the world goes on while one reads)
    if (G.Modes.panelIs('diario')) { diaryT -= rdt; if (diaryT <= 0) { diaryT = 1; renderDiary(); } }
    // the best thing to do, a few times a second (the world is asked, not the picture) — the target the screen shows, firm, the
    // others one may switch to, its verbs on their keys, the ring of the E held, the prompt by the target (20e: aimFrame)
    aimFrame(rdt, v);
    // holding the key repeats the work (stroke after stroke on the same tree) — where E held is no verb of the target's own
    if (G.Input3D.down.interagir && best && best.ok && !hold && !aim.hv && !G.Avatar.busy() && !G.Modes.panel() && (best.id === 'arvore' || best.id === 'pedra')) { repeatT -= rdt; if (repeatT <= 0) { repeatT = 0.15; IU.use(); } } else repeatT = 0.3;
    // the name over the one the body faces
    placeLabel();
    // the lead to the work near (only read from the world, a few times a second), and its mark over the place, every frame
    leadT -= rdt;
    if (leadT <= 0) { leadT = 0.25; const p = G.Avatar.pos(); lead = G.Modes.panel() || v.sleeping || !p ? null : G.Interact.lead(v, p.X, p.Z, lead && lead.op); renderLead(); }
    placeMark();
    // (a machine that cannot keep up: said once, with the way out — the lighter picture in the menu)
    if (G.Realm.fps && G.Realm.fps < 22 && G.Realm.q !== 'baixa') { slowT += rdt; if (slowT > 8 && !slowSaid) { slowSaid = true; IU.toast(`O 3D está pesado neste computador (${Math.round(G.Realm.fps)} quadros por segundo): no menu (${G.Input3D.label('menu')}) → Gráficos → Leve.`, 7); } } else slowT = 0;
    upT -= rdt; if (upT > 0) return; upT = 0.1;
    // (where one is, as the person can say it: the quarter and the town by name when they know them, else what is seen there)
    const id = G.Possess.identity(v); const w = G.Possess.knows.where(v); const st = G.Avatar.state(); const caps = G.Possess.caps(v);
    $('.ih-name', hud).textContent = id.name + (id.epithet ? ', ' + id.epithet : '');
    $('.ih-sub', hud).textContent = `${id.age} ${id.age === 1 ? 'ano' : 'anos'} · ${id.role}${id.set ? ' · ' + id.set : ''}`;
    const setBar = (k, val, warn) => { const e = $('.ih-bar.' + k, hud); e.querySelector('b').style.width = G.clamp(val, 0, 100) + '%'; e.classList.toggle('warn', !!warn); };
    setBar('hp', v.hp, v.hp < 30); if (hurt.ghostT <= 0) { const g2 = $('.ih-bar.hp s', hud); if (g2) g2.style.width = G.clamp(v.hp, 0, 100) + '%'; } setBar('st', st ? st.stamina / Math.max(1, caps.stamina) * 100 : 100, st && st.stamina < 15); setBar('fo', 100 - v.hunger, v.hunger > 80); setBar('en', v.energy, v.energy < 15);
    // (in the water: what the breath is doing — the first time how it works, then only when it runs low or out)
    const sw = G.Avatar.swimming && G.Avatar.swimming();
    if (sw && !swimTold) { swimTold = true; IU.toast(`Nadando: na água o fôlego vai acabando. ${G.Input3D.label('pular')} dá uma braçada forte; chegue à margem antes que ele acabe.`, 6); }
    if (sw && st && st.stamina > 0 && st.stamina < caps.stamina * 0.25 && !lowTold) { lowTold = true; IU.toast('O fôlego está acabando — nade para a margem!', 4); }
    if (sw && st && st.stamina <= 0 && !drownTold) { drownTold = true; IU.toast('Sem fôlego: você está se afogando!', 4); }
    if (!sw) { lowTold = false; drownTold = false; }
    hud.classList.toggle('drowning', !!(sw && st && st.stamina <= 0));
    $('.ih-carry', hud).textContent = v.carry && v.carry.n > 0 ? `Carregando ${v.carry.n} de ${G.Eco ? G.Eco.name(v.carry.k) : v.carry.k}` : '';
    $('.ih-time', hud).textContent = `Dia ${S.day} · ${hourOf(S.time)}${S.weather && S.weather.rain > 0.2 ? ' · chuva' : ''}`;
    $('.ih-place', hud).textContent = w.txt;
    // the compass: the strip turns with the eye
    const yaw = G.Cam3D.yaw; const deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
    // (a tick every 15°, the eight winds at every 45° — the four great ones bigger, the north in gold —, 1.4 px a degree)
    const strip = $('.ih-strip', hud); const half = (strip.parentNode.clientWidth || 260) / 2, ppd = 1.4; let html = '';
    for (let a = Math.ceil((deg - half / ppd) / 15) * 15; a <= deg + half / ppd; a += 15) {
      const x = ((a - deg) * ppd + half).toFixed(1);
      if (a % 45) { html += `<u style="left:${x}px"></u>`; continue; }
      const d = DIRS[(((a / 45) % 8) + 8) % 8]; html += `<span class="${d.length > 1 ? 'mn' : ''}${d === 'N' ? ' n' : ''}" style="left:${x}px">${d}</span>`;
    }
    strip.innerHTML = html;
    // the calls of the world
    // (drawn again only when they change: a call that comes in fades in once, the others stay still)
    const calls = G.Possess.calls(); const ch = calls.slice(-3).map(q => `<div>${esc(q.txt)}${q.n > 1 ? ` <small>×${q.n}</small>` : ''}</div>`).join('');
    const ce = $('.ih-calls', hud); if (ce._h !== ch) { ce._h = ch; ce.innerHTML = ch; }
    $('.ih-sleep', hud).classList.toggle('hidden', !v.sleeping);
    hud.classList.toggle('asleep', !!v.sleeping);
    const h = $('.ih-hint', hud); h.classList.toggle('hidden', hintT <= 0);
    if (hintT > 0) h.innerHTML = [['frente', 'trotar'], ['correr', 'disparar'], ['andar', 'andar devagar'], ['pular', 'pular'], ['esquivar', 'esquivar'], ['agachar', 'agachar'], ['interagir', 'interagir'], ['outra', 'outra ação'], ['travar', 'travar a mira'], ['ficha', 'quem sou eu'], ['diario', 'diário'], ['tela', 'esconder a tela'], ['deus', 'Modo Deus'], ['menu', 'menu']].map(([a, t]) => `<span><kbd>${esc(a === 'frente' ? (G.Input3D.device === 'pad' ? 'Bastão' : 'WASD') : G.Input3D.label(a))}</kbd> ${t}</span>`).join('') + `<span><kbd>${G.Input3D.device === 'pad' ? 'Bastão direito' : 'Mouse'}</kbd> olhar</span>`;
  };
  // the words over the heads and the little texts of the world: what the god's view draws over it, over the body's eyes too —
  // the words said (G.Talk: a bubble over the one who speaks, typed out by the world's clock; the same bubble by the same hand,
  // Talk.paint) and the little texts that rise where something happens (G.FX.floaters: a load put in the store, the coins of a
  // sale, a catch landed). Only read: both lists are the god's view's own; each head where the 3D draws it (People3D.visOf), the
  // body's where it stands (L-211)
  // (for the tests: what was drawn this frame — a bubble { id, txt, t0, n, x, y, box }: t0 when it was said, n the letters typed,
  // x y the point over the head, box [x, y, w, h] where it was painted, pixels of the screen; a text { text, x, y })
  IU.airAt = [];
  let airC = null, airInk = false; // (airInk: something is painted on the layer — wiped only then: an empty layer is left alone)
  function drawAir() {
    const cv = $('#inc-air', hud); IU.airAt = []; if (!cv) return;
    const Wd = window.innerWidth, Ht = window.innerHeight; const S = G.S, cam = G.Realm.camera && G.Realm.camera();
    // (near, the size the god's view gives them; farther, a little smaller — three-quarters at thirty metres: from above, all are
    // about as far from the eye)
    const size = d => G.clamp(1.25 - d / 48, 0.72, 1);
    const items = [], texts = [];
    if (S && cam) {
      const q = IU._aq || (IU._aq = new window.THREE.Vector3()); const TL = G.Space.TILE, cx = cam.position.x, cz = cam.position.z;
      const at = (X, Y, Z) => { q.set(X, Y, Z); q.project(cam); return q.z > 1 || q.z < -1 ? null : [(q.x * 0.5 + 0.5) * Wd, (-q.y * 0.5 + 0.5) * Ht]; };
      const me = G.Possess.body(), av = G.Avatar.pos();
      if (G.Talk) for (const b of G.Talk.list) {
        if (S.clock > b.until) continue; const v = S.villagers.get(b.id); if (!v) continue;
        const s = me && v.id === me.id ? av : G.People3D.visOf(v.id); if (!s || s.cull) continue;
        const d = Math.hypot(s.X - cx, s.Z - cz); if (d > 40) continue;
        // (over the head — over the sign above it, when there is one, as in the god's view; over the name of the one the body
        // faces, too)
        const k = G.People3D.look(v).s, hl = G.People3D.highlight === v.id; const up = Math.max(v.emo && v.emo.k ? 2.2 * k + 0.32 : 2.02 * k, hl ? 2.25 * k : 0);
        const p = at(s.X, s.Y + up, s.Z); if (!p) continue;
        items.push({ b, hx: p[0], hy: p[1] - (hl ? 20 : 0), s: size(d), d });
      }
      if (G.FX) for (const f of G.FX.floaters) {
        const X = f.x * TL, Z = f.y * TL; const d = Math.hypot(X - cx, Z - cz); if (d > 32) continue;
        const p = at(X, G.Space.drawnAt(f.x, f.y) + 1.75 + (f.z - 16) * 0.035, Z); if (p) texts.push({ f, p, d });
      }
    }
    if (!items.length && !texts.length && !airInk) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(Wd * dpr), h = Math.round(Ht * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const c = airC || (airC = cv.getContext('2d')); if (!c) return;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); airInk = false;
    if (!items.length && !texts.length) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    items.sort((a, b) => a.d - b.d);
    const boxes = items.length ? G.Talk.paint(c, items, 1) : [];
    for (const it of items) { const bx = boxes.find(q => q[0] === it.b); if (bx) IU.airAt.push({ id: it.b.id, txt: it.b.txt, t0: it.b.t0, n: G.Talk.typed(it.b), x: +it.hx.toFixed(1), y: +it.hy.toFixed(1), box: bx.slice(1).map(q => +q.toFixed(1)) }); }
    for (const { f, p, d } of texts) {
      c.globalAlpha = Math.min(1, f.life / f.max * 2); c.font = `800 ${Math.round(14 * size(d))}px Nunito, sans-serif`; c.textAlign = 'center';
      c.lineWidth = 3; c.strokeStyle = 'rgba(20,15,10,0.6)'; c.strokeText(f.text, p[0], p[1]); c.fillStyle = f.c; c.fillText(f.text, p[0], p[1]);
      IU.airAt.push({ text: f.text, x: +p[0].toFixed(1), y: +p[1].toFixed(1) });
    }
    c.globalAlpha = 1; airInk = true;
  }
  function placeLabel() {
    const id = G.People3D.highlight; const o = id && G.S.villagers.get(id); const s = id && G.People3D.visOf(id);
    if (!o || !s) { label.classList.add('hidden'); return; }
    const cam = G.Realm.camera(); const THREE = window.THREE; const p = IU._v || (IU._v = new THREE.Vector3());
    p.set(s.X, G.W.groundH(o.x, o.y) * G.Space.HM + 2.25 * G.People3D.look(o).s, s.Z); p.project(cam);
    if (p.z > 1) { label.classList.add('hidden'); return; }
    // (the name of someone the body knows; of a stranger, what is seen: Possess.knows)
    const me = G.Possess.body(); const k = G.Possess.kin(me, o);
    label.textContent = G.Possess.knows.name(me, o) + (k ? ' · ' + k : ''); label.classList.remove('hidden');
    label.style.transform = `translate(${(p.x * 0.5 + 0.5) * window.innerWidth}px, ${(-p.y * 0.5 + 0.5) * window.innerHeight}px) translate(-50%, -100%)`;
  }

  // the lead's line: what the work near asks, and how far it is
  function renderLead() {
    hud.classList.toggle('has-lead', !!lead);
    if (!lead) { leadEl.classList.add('hidden'); leadEl._h = ''; return; }
    const h = `${esc(lead.txt)} <small>· ${Math.max(1, Math.round(lead.d))} m</small>`;
    if (leadEl._h !== h) { leadEl._h = h; leadEl.querySelector('span').innerHTML = h; }
    leadEl.classList.remove('hidden');
  }
  // the lead's mark: over the place, with how far it is; out of sight, an arrow on the edge of the picture toward it (behind the
  // eye, the way to turn); at arm's length the prompt speaks for it
  const EDGE = { x: 34, top: 66, bottom: 74 };
  IU.markAt = null; // (for the tests: where the mark was put — { x, y, off, angle } — or null)
  function placeMark() {
    const p = G.Avatar.pos(); const cam = G.Realm.camera && G.Realm.camera(); const d = lead && p ? Math.hypot(lead.X - p.X, lead.Z - p.Z) : 0;
    if (!lead || !p || !cam || d < 2.6) { markEl.classList.add('hidden'); IU.markAt = null; return; }
    const q = IU._mv || (IU._mv = new window.THREE.Vector3()); q.set(lead.X, lead.Y, lead.Z); q.project(cam);
    const Wd = window.innerWidth, Ht = window.innerHeight; let x = (q.x * 0.5 + 0.5) * Wd, y = (-q.y * 0.5 + 0.5) * Ht; const behind = q.z > 1;
    const off = behind || x < EDGE.x || x > Wd - EDGE.x || y < EDGE.top || y > Ht - EDGE.bottom; let ang = 0;
    if (off) {
      let dx = x - Wd / 2, dy = y - Ht / 2; if (behind) { dx = -dx; dy = -dy; } if (Math.abs(dx) + Math.abs(dy) < 1e-3) dy = 1;
      const k = Math.min(dx > 0 ? (Wd / 2 - EDGE.x) / dx : dx < 0 ? (Wd / 2 - EDGE.x) / -dx : 1e9, dy > 0 ? (Ht / 2 - EDGE.bottom) / dy : dy < 0 ? (Ht / 2 - EDGE.top) / -dy : 1e9);
      x = Wd / 2 + dx * k; y = Ht / 2 + dy * k; ang = Math.atan2(dy, dx); markEl.querySelector('u').style.transform = `rotate(${ang.toFixed(3)}rad)`;
    }
    markEl.classList.toggle('off', off); markEl.classList.remove('hidden');
    markEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, ${off ? '-50%' : '-100%'})`;
    const t = `${Math.max(1, Math.round(d))} m`; const b = markEl.querySelector('b'); if (b.textContent !== t) b.textContent = t;
    IU.markAt = { x, y, off, angle: ang };
  }

  // ------------------------------ the target and its verbs (20e, D-395 to D-400) ------------------------------
  // The target the screen shows is firm (D-398): what I.best gives, kept while it is still in reach until another one has been the
  // best on two looks in a row — never one that blinks between two at the edge of their scores — at once when the shown one is
  // gone; or the one the player switched to (the wheel, the cross, a touch on it: D-397), held while it is in reach and I.best's
  // own choice stays the same. Its verbs on their keys: E, F and E held — the ring fills while E is held over a target that has a
  // verb for it, and a tap is the E (D-396). The prompt is by the target on the screen, its keys and verbs stacked beside it; where
  // the target is off the picture, at the foot of the screen as before (D-400). The 3D mark round the target is Mira3D's (only seen)
  IU.HOLD_T = 0.45; // (seconds of E held for the held verb; the ring shows from a tap's length on)
  IU.RING_FROM = 0.12;
  let aim = { key: '', cands: [], pin: '', pinBest: '', want: '', wantN: 0, hv: false, verbs: null, pt: null, sx: NaN, sy: NaN, at: false };
  let hold = null; // ({ key, t, b }: E held over a target with a held verb, since t)
  G.worldHooks.push(() => { aim = { key: '', cands: [], pin: '', pinBest: '', want: '', wantN: 0, hv: false, verbs: null, pt: null, sx: NaN, sy: NaN, at: false }; hold = null; });
  IU.aim = () => ({ key: aim.key, pin: aim.pin, cands: aim.cands.map(c => ({ id: c.id, key: c.key, label: c.label, ok: c.ok, ang: +c.ang.toFixed(3), d: +c.d.toFixed(2) })), verbs: aim.verbs, at: aim.at, x: aim.sx, y: aim.sy, hold: hold ? hold.t : 0 }); // (for the proofs)
  IU.holding = () => (hold ? Math.min(1, hold.t / IU.HOLD_T) : 0);
  IU.cands = () => aim.cands.slice(); // (for the proofs: the targets in reach as the screen has them, with their targets of the world)
  // (the choice of a candidate, as I.run takes it: I.best's own answer for the first — its rules' words —, the provider's for another)
  const choiceOf = (c, b0) => (!c ? null : c.first && b0 ? b0 : G.Interact.asChoice(c));
  function look(v) {
    const I = G.Interact; const blind = G.Modes.panel() || v.sleeping || G.Avatar.busy();
    const sn = blind ? null : I.scan(); const b0 = sn ? I.best(sn) : null; const cands = b0 ? I.candidates(sn) : [];
    const firstKey = b0 ? I.keyOf(b0) : ''; aim.cands = cands;
    const has = k => !!k && cands.some(c => c.key === k);
    // (the player's choice holds while it is in reach and the best one is the one it was chosen beside)
    if (aim.pin && (!has(aim.pin) || aim.pinBest !== firstKey)) aim.pin = '';
    let key = aim.pin;
    if (!key) {
      if (!firstKey) key = '';
      else if (!has(aim.key) || aim.key === firstKey) { key = firstKey; aim.want = ''; aim.wantN = 0; }
      else { if (aim.want === firstKey) aim.wantN++; else { aim.want = firstKey; aim.wantN = 1; } key = aim.wantN >= 2 ? firstKey : aim.key; if (key === firstKey) { aim.want = ''; aim.wantN = 0; } }
    }
    if (key !== aim.key) { aim.key = key; aim.sx = NaN; aim.sy = NaN; aim.side = 0; if (hold && hold.key !== key) hold = null; }
    const c = cands.find(q => q.key === key) || null; best = choiceOf(c, b0);
    if (!best && key) aim.key = '';
    return c;
  }
  // (the prompt's words: E, F and E held, each with what it does — or why not —; how many there are to switch to)
  function renderPrompt(c) {
    const pr = $('.ih-prompt', hud); const I = G.Interact;
    G.People3D.highlight = best && best.id === 'pessoa' && !hudOff ? best.t.o.id : 0; // (the mark over the one faced is the screen's)
    if (!best) { pr.classList.add('hidden'); aim.verbs = null; aim.hv = false; return; }
    pr.classList.remove('hidden'); pr.classList.toggle('no', !best.ok);
    pr.querySelector('kbd').textContent = G.Input3D.label('interagir'); pr.querySelector('span').textContent = best.ok ? best.label : `${best.label} — ${best.why}`;
    const o = I.offer ? I.offer(best) : null; aim.verbs = o ? o.verbs.map(x => ({ k: x.k, label: x.label, ok: x.ok, why: x.why })) : null;
    // (the target's second verb, F — the second wave's contract, D-460: shown beside the E when the target has one)
    { const al = $('.ih-alt', pr); const x = o && o.verbs.find(q => q.k === 'outra'); al.classList.toggle('hidden', !x); if (x) { al.querySelector('kbd').textContent = G.Input3D.label('outra'); al.querySelector('b').textContent = x.ok ? x.label : `${x.label} — ${x.why}`; al.classList.toggle('no', !x.ok); } }
    { const hl = $('.ih-hold', pr); const x = o && o.verbs.find(q => q.k === 'segurar'); aim.hv = !!x; hl.classList.toggle('hidden', !x); if (x) { hl.querySelector('kbd').textContent = G.Input3D.label('interagir'); hl.querySelector('b').textContent = x.ok ? x.label : `${x.label} — ${x.why}`; hl.classList.toggle('no', !x.ok); } }
    { const cy = $('.ih-cyc', pr); const n = aim.cands.length; cy.classList.toggle('hidden', n < 2); if (n >= 2) { const i = Math.max(0, aim.cands.findIndex(q => q.key === aim.key)); const pad = G.Input3D.device === 'pad', touch = G.Input3D.device === 'touch';
      cy.querySelector('kbd').textContent = pad ? '← →' : touch ? 'Toque' : (G.Input3D.keyLabel('alvoProx') && /Roda/.test(G.Input3D.keyLabel('alvoProx')) ? 'Roda' : G.Input3D.keyLabel('alvoProx') || 'Roda'); cy.querySelector('b').textContent = `${i + 1} de ${n} · trocar de alvo`; } }
    void c;
  }
  function aimFrame(rdt, v) {
    // (a panel over the middle of the screen — the bag, the things kept —: what lies behind it, the news, the hint, the prompt,
    // steps out of sight, and the world's answers rise above it: the panel is read, not the screen behind it)
    { const on = !!(G.Modes.panelIs('mochila') || G.Modes.panelIs('guardados')); if (root._po !== on) { root._po = on; root.classList.toggle('panel-on', on); } }
    if (G.GuardUI) G.GuardUI.frame(rdt); // (the screen of what is kept, on the body's beat: guardados-ui.js)
    bestT -= rdt;
    if (bestT <= 0) { bestT = 0.12; const c = look(v); renderPrompt(c); }
    // (E held: the ring fills; at its end the held verb — the target still the one it was held over —; let go before, the E)
    if (hold) {
      if (G.Modes.panel() || !G.Modes.is('INC')) hold = null;
      else { hold.t += rdt; if (hold.t >= IU.HOLD_T) { const h = hold; hold = null; IU.useVerb('segurar', h.b); } }
    }
    placePrompt(rdt);
    // (the 3D mark round what is shown: firm, crossfaded by Mira3D — only seen; nothing with the screen put away)
    if (G.Mira3D) G.Mira3D.set(best && !hudOff && !G.Modes.panel() ? { key: aim.key, id: best.id, t: best.t, ok: best.ok } : null);
  }
  // (the prompt by the target: to its right at the height of its middle, kept on the picture, eased so it never jitters; with the
  // target off the picture or behind the eye, or with nothing in the 3D to point at, at the foot of the screen)
  function placePrompt(rdt) {
    const pr = $('.ih-prompt', hud); const r = hold ? Math.min(1, hold.t / IU.HOLD_T) : 0; const show = hold && hold.t >= IU.RING_FROM ? r : 0;
    const rs = show.toFixed(3); if (pr._r !== rs) { pr._r = rs; pr.style.setProperty('--hold', rs); pr.classList.toggle('holding', show > 0); }
    if (!best || pr.classList.contains('hidden')) { aim.at = false; return; }
    const A = G.Mira3D && G.Mira3D.anchor ? G.Mira3D.anchor() : null; const cam = G.Realm.camera && G.Realm.camera(); let at = false, x = 0, y = 0;
    if (A && cam && window.THREE && A.key === aim.key) {
      const q = IU._pq || (IU._pq = new window.THREE.Vector3()); q.set(A.X, A.Y, A.Z); q.project(cam);
      const Wd = window.innerWidth, Ht = window.innerHeight; x = (q.x * 0.5 + 0.5) * Wd; y = (-q.y * 0.5 + 0.5) * Ht;
      at = q.z < 1 && x > 24 && x < Wd - 24 && y > 70 && y < Ht - 60;
      // (on the side of the target away from the middle of the picture, where the body is: never over the body itself; the side
      // kept while the target stays near the middle, so the box does not jump across it)
      if (at) { const w = pr.offsetWidth || 260, h = pr.offsetHeight || 60; const c = Wd / 2; aim.side = Math.abs(x - c) < 40 && aim.side ? aim.side : x < c ? -1 : 1;
        x = G.clamp(aim.side < 0 ? x - 34 - w : x + 34, 12, Wd - w - 12); y = G.clamp(y - h / 2, 64, Ht - h - (G.Input3D.touch ? 240 : 96)); }
    }
    if (at !== aim.at) { aim.at = at; pr.classList.toggle('at', at); if (!at) { pr.style.transform = ''; aim.sx = NaN; } }
    if (!at) return;
    const k = Number.isFinite(aim.sx) ? 1 - Math.exp(-16 * Math.max(0, rdt)) : 1; aim.sx = Number.isFinite(aim.sx) ? aim.sx + (x - aim.sx) * k : x; aim.sy = Number.isFinite(aim.sy) ? aim.sy + (y - aim.sy) * k : y;
    const tr = `translate(${aim.sx.toFixed(1)}px, ${aim.sy.toFixed(1)}px)`; if (pr._tr !== tr) { pr._tr = tr; pr.style.transform = tr; }
  }
  // switching to the next target in reach, toward the right (dir 1) or the left (-1) of the one shown — the order they stand in
  // before the body; true when there was another to go to (the wheel's fallback is the eye's zoom)
  IU.cycle = function (dir) {
    const v = G.Possess.body(); if (!v || !G.Modes.is('INC') || G.Modes.panel() || v.sleeping) return false;
    const L = aim.cands; if (L.length < 2) return false; let i = L.findIndex(c => c.key === aim.key); if (i < 0) i = 0;
    const c = L[(i + (dir < 0 ? L.length - 1 : 1)) % L.length]; IU.pick(c.key); return true;
  };
  // (the player's own choice of a target in reach, by its key: shown now and held — the eye of the screen, never the world's)
  IU.pick = function (key) {
    const c = aim.cands.find(q => q.key === key); if (!c) return false;
    const first = aim.cands.find(q => q.first); aim.pin = c.first ? '' : key; aim.pinBest = first ? first.key : ''; aim.key = key; aim.want = ''; aim.wantN = 0; aim.sx = NaN;
    hold = null; best = choiceOf(c, c.first ? G.Interact.best() : null); renderPrompt(c); G.Audio && G.Audio.play && G.Audio.play('click', 0.6); return true;
  };
  // (a finger's tap on the picture: the target drawn nearest to it — 64 px at most — is chosen; on the one already shown, its E)
  IU.tapAt = function (x, y) {
    const cam = G.Realm.camera && G.Realm.camera(); if (!cam || !window.THREE || !aim.cands.length) return false;
    const q = IU._tq || (IU._tq = new window.THREE.Vector3()); let bk = '', bd = 64;
    for (const c of aim.cands) { const p = (G.Mira3D && G.Mira3D.pointOf ? G.Mira3D.pointOf(c) : null) || { X: c.t.X, Y: (G.Avatar.pos() || { Y: 0 }).Y + 0.9, Z: c.t.Z }; q.set(p.X, p.Y, p.Z); q.project(cam); if (q.z > 1) continue;
      const d = Math.hypot((q.x * 0.5 + 0.5) * window.innerWidth - x, (-q.y * 0.5 + 0.5) * window.innerHeight - y); if (d < bd) { bd = d; bk = c.key; } }
    if (!bk) return false; if (bk === aim.key) { IU.press(); IU.release(); return true; } return IU.pick(bk);
  };
  let tapOn = false, tap0 = null;
  function tapHook() {
    const cv = G.Realm.canvas && G.Realm.canvas(); if (tapOn || !cv) return; tapOn = true;
    cv.addEventListener('touchstart', e => { const t = e.changedTouches[0]; if (t && e.touches.length === 1 && t.clientX > window.innerWidth * 0.45) tap0 = { id: t.identifier, x: t.clientX, y: t.clientY, t: performance.now() }; else tap0 = null; }, { passive: true });
    cv.addEventListener('touchmove', e => { if (!tap0) return; for (const t of e.changedTouches) if (t.identifier === tap0.id && Math.hypot(t.clientX - tap0.x, t.clientY - tap0.y) > 12) tap0 = null; }, { passive: true });
    cv.addEventListener('touchend', e => { const s = tap0; tap0 = null; if (!s || !G.Modes.is('INC') || G.Modes.panel()) return; for (const t of e.changedTouches) if (t.identifier === s.id && performance.now() - s.t < 300) IU.tapAt(t.clientX, t.clientY); }, { passive: true });
  }
  // ------------------------------ doing ------------------------------
  // E pressed (modes.js, the E's dispatch — 20e): over a target with a held verb, wait — let go soon it is the E, held the ring's
  // time it is the held verb —; over any other, the E at once (as it always was: a tree's stroke on the key's press)
  IU.press = function () {
    const b = best || G.Interact.best(); if (!b) return;
    if (aim.hv && !G.Avatar.busy()) { hold = { key: aim.key || G.Interact.keyOf(b), t: 0, b }; return; }
    IU.use(b);
  };
  IU.release = function () { const h = hold; if (!h) return; hold = null; if (h.t < IU.HOLD_T) IU.use(h.b); };
  // what a verb's answer opens on the screen: a card, a word, or the screen of what is kept (G.GuardUI: the bag and a holder, or the
  // bag and someone to give to)
  function answer(r) {
    if (r.knock) G.Audio && G.Audio.play && G.Audio.play('knock');
    if (r.panel && G.GuardUI) { const ok = G.GuardUI.open(r.panel); if (!ok && r.panel.why) IU.toast(r.panel.why, 2.4); }
    else if (r.card) IU.card(r.card, r.said);
    else if (r.msg) IU.toast(r.msg, 2.4);
    if (r.ask) IU.when(r.ask, () => r.msgOk && IU.toast(r.msgOk, 2.4));
  }
  IU.use = function (b0) {
    const b = b0 || best || G.Interact.best(); if (!b) return;
    if (!b.ok) { IU.toast(b.why); G.Audio && G.Audio.play && G.Audio.play('deny'); return; }
    const r = G.Interact.run(b); if (!r) return;
    if (!r.ok) { IU.toast(r.msg || 'Não dá.'); return; }
    answer(r);
    bestT = 0;
  };

  // the target's second verb (F) or another of its verbs: as IU.use (the second wave's contract, D-460); vid: one verb by its id
  IU.useVerb = function (k, b0, vid) {
    const b = b0 || best || G.Interact.best(); if (!b || !G.Interact.runVerb) return false;
    const r = G.Interact.runVerb(k, b, vid); if (!r) return false;
    if (!r.ok) { IU.toast(r.msg || 'Não dá.'); G.Audio && G.Audio.play && G.Audio.play('deny'); return true; }
    // (a hug's answer is the world's: told when the one hugged has answered — Interact.hug's ask)
    if (r.ask && r.msg && !r.card && !r.panel) { IU.when(r.ask, () => IU.toast(r.msg, 2.4)); bestT = 0; return true; }
    answer(r);
    bestT = 0; return true;
  };
  // (F: the second verb of what the body faces — only in the body, with no panel open, awake)
  G.Input3D.on('outra', () => { if (!G.Modes.is('INC') || G.Modes.panel() || G.Avatar.busy()) return false; const v = G.Possess.body(); if (!v || v.sleeping) return false; return IU.useVerb('outra'); });
  // (E let go: the end of a hold — heard whatever the state, as every letting go)
  G.Input3D.onUp('interagir', () => IU.release());
  // (the wheel switches between the targets in reach — and where there is no other, it is the eye's zoom, as it was: D-397; the
  // fingers' E is held and let go as the key)
  G.Input3D.def('alvoProx', 'Próximo alvo (vários ao alcance)', ['wheeldown']);
  G.Input3D.def('alvoAnt', 'Alvo anterior (vários ao alcance)', ['wheelup']);
  G.Input3D.on('alvoProx', () => { if (!IU.cycle(1)) G.Cam3D.zoom(100); return true; });
  G.Input3D.on('alvoAnt', () => { if (!IU.cycle(-1)) G.Cam3D.zoom(-100); return true; });
  G.Input3D.button('interagir', { label: () => G.Input3D.keyLabel('interagir') || 'E', hold: true, order: 12 });
  // (the cross of the controller, ← and →, switches while there are several in reach and the controller is in the hands: the quick
  // things of 2 and 4 wait for them to go — modes.js asks here before the quick things hear it)
  // (the press of a controller's button reaches here before the poll says the controller is the one in the hands — its first press
  // after the keyboard —: a controller connected is asked, not the device of the last input — L-1243)
  IU.padCycle = function (a) { if (!(G.Input3D.pad && G.Input3D.pad()) || aim.cands.length < 2 || !best) return false; if (a === 'rapido2') return IU.cycle(1); if (a === 'rapido4') return IU.cycle(-1); return false; };

  // ------------------------------ cards ------------------------------
  IU.card = function (c, said) {
    if (!root) return; G.Modes.setPanel('card'); G.Input3D.free(); card.classList.remove('diario');
    let h = `<button class="x" data-c="close">×</button>`;
    if (c.kind === 'person') {
      const o = G.S.villagers.get(c.id);
      h += `<div class="ic-head"><div><h3>${esc(c.name)}</h3><div class="sub">${esc(c.sub)}${c.kin ? ` · <b class="gold">${esc(c.kin)}</b>` : ''}</div></div></div>`;
      if (said) h += `<div class="ic-said">“${esc(said)}”</div>`;
      // (as much of them as the body knows — Interact.personCard, by Possess.knows —, and how it knows them)
      const rows = [];
      if (c.why) rows.push(['Você conhece', c.why]);
      if (c.from) rows.push([c.first ? 'Despertou em' : 'Natural de', c.from]);
      if (c.set) rows.push(['Vive em', c.set + (c.fac ? ` (${c.fac})` : '')]);
      if (c.parents.length) rows.push([c.parents.length > 1 ? 'Filh' + (o && o.g === 'f' ? 'a' : 'o') + ' de' : 'Filiação', c.parents.join(' e ')]);
      if (c.partner) rows.push(['Companheir' + (o && o.g === 'f' ? 'o' : 'a'), c.partner]);
      if (c.kids.length) rows.push(['Filhos', c.kids.join(', ')]);
      if (c.home) rows.push(['Mora', c.home]);
      if (c.traits.length) rows.push(['Jeito', c.traits.join(', ')]);
      rows.push(['Agora', c.doing]);
      if (c.kills) rows.push(['Em combate', `${c.kills} ${c.kills > 1 ? 'inimigos derrubados' : 'inimigo derrubado'}`]);
      h += `<table class="ic-rows">${rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>`;
      if (c.stories.length) h += `<div class="ic-stories"><label>Histórias em andamento</label>${c.stories.map(s => `<div>${esc(s)}</div>`).join('')}</div>`;
      if (c.bio.length) h += `<div class="ic-bio"><label>Memórias</label>${c.bio.map(e => `<div><em>${e.age} ${e.age === 1 ? 'ano' : 'anos'}</em> ${esc(e.txt)}</div>`).join('')}</div>`;
      const can = o ? G.Possess.can(o) : { ok: false };
      // (one's own, or anyone in mourning: a hug)
      const hug = o ? G.Interact.canHug(G.Possess.body(), o) : { ok: false };
      // (20e, D-395: the verbs of this person that lost their key — another part's took it — are buttons here)
      const chosen = best && best.id === 'pessoa' && best.t.o.id === c.id ? best : null; const of = chosen && G.Interact.offer ? G.Interact.offer(chosen) : null;
      const more = of ? of.more.filter(x => x.id !== 'abraco') : []; // (the hug has its own button above)
      const vb = more.map(x => `<button data-c="verb" data-vk="${esc(x.k)}" data-v="${esc(x.id)}"${x.ok ? '' : ` disabled title="${esc(x.why)}"`}>${esc(x.label)}</button>`).join('');
      h += `<div class="btns">${hug.label ? `<button data-c="hug" data-id="${c.id}"${hug.ok ? '' : ` disabled title="${esc(hug.why)}"`}>${esc(hug.label)}</button>` : ''}${vb}${can.ok ? `<button data-c="swap" data-id="${c.id}">${(G.ICON && G.ICON.eye) || ''} Encarnar ${esc(c.knows === 0 ? 'esta pessoa' : o.name)}</button>` : ''}<button data-c="close">Fechar <kbd>E</kbd></button></div>`;
    } else {
      h += `<div class="ic-head"><div><h3>${esc(c.name)}</h3><div class="sub">${esc(c.sub || '')}</div></div></div>`;
      if (c.desc) h += `<div class="ic-desc">${esc(c.desc)}</div>`;
      if (c.rows && c.rows.length) h += `<table class="ic-rows">${c.rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>`;
      h += `<div class="btns"><button data-c="close">Fechar <kbd>E</kbd></button></div>`;
    }
    card.innerHTML = h; card.classList.remove('hidden');
  };
  // oneself: what an adventure will ask of the body (Possess.context): who, where, the stories, the duties, what was seen
  IU.selfCard = function () {
    const c = G.Possess.context(); if (!c) return;
    const v = G.Possess.body(); const pc = G.Interact.personCard(v, null);
    G.Modes.setPanel('self'); G.Input3D.free(); card.classList.remove('diario');
    const caps = c.caps; const kind = (G.Possess.KINDS[c.kind] || {}).label || c.kind;
    let h = `<button class="x" data-c="close">×</button><div class="ic-head"><div><h3>${esc(pc.name)}</h3><div class="sub">${esc(pc.sub)} · ${esc(kind)}</div></div></div>`;
    const rows = [];
    rows.push(['Onde', c.where.txt]); // (as the person can say it: Possess.knows.where)
    if (pc.from) rows.push([pc.first ? 'Despertou em' : 'Natural de', pc.from]);
    if (pc.parents.length) rows.push(['Pais', pc.parents.join(' e ')]); if (pc.partner) rows.push(['Companhia', pc.partner]); if (pc.kids.length) rows.push(['Filhos', pc.kids.join(', ')]); if (pc.home) rows.push(['Mora', pc.home]);
    rows.push(['O corpo', `anda ${caps.walk.toFixed(1)} m/s${caps.run > 1 ? ', corre' : ', não corre'}${caps.jump > 0 ? ', pula' : ', não pula'}; nadar, escalar e planar: ainda não`]);
    h += `<table class="ic-rows">${rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>`;
    if (c.stories.length) h += `<div class="ic-stories"><label>Histórias que te envolvem</label>${c.stories.map(s => `<div>${esc(s.title)}${s.protag ? ' <small>(protagonista)</small>' : ''}</div>`).join('')}</div>`;
    if (c.goals.length) h += `<div class="ic-stories"><label>O que esperam de você</label>${c.goals.map(g => `<div>${esc(g.txt)}</div>`).join('')}</div>`;
    const dd = Object.keys(c.deeds).filter(k => c.deeds[k] > 0).map(k => { const D = G.Possess.DEED[k]; return D ? `${D[0]} ${Math.round(c.deeds[k])} ${Math.round(c.deeds[k]) === 1 ? D[1] : D[2]}` : null; }).filter(Boolean);
    if (dd.length) h += `<div class="ic-bio"><label>Desde que você chegou</label><div>${esc(G.cap ? G.cap(dd.join(', ')) : dd.join(', '))}.</div></div>`;
    if (c.witnessed.length) h += `<div class="ic-bio"><label>O que você presenciou</label>${c.witnessed.slice(-4).reverse().map(e => `<div>${esc(e.txt)}</div>`).join('')}</div>`;
    if (pc.bio.length) h += `<div class="ic-bio"><label>Memórias de ${esc(v.name)}</label>${pc.bio.map(e => `<div><em>${e.age} ${e.age === 1 ? 'ano' : 'anos'}</em> ${esc(e.txt)}</div>`).join('')}</div>`;
    h += `<div class="btns">${v.energy < 70 && !v.sleeping ? '<button data-c="sleep">Dormir aqui</button>' : ''}${G.DiarioUI ? `<button data-c="diary">${(G.ICON && G.ICON.book) || ''} Diário de Vida <kbd>${esc(G.Input3D.label('diario'))}</kbd></button>` : ''}<button data-c="close">Fechar <kbd>${esc(G.Input3D.label('ficha'))}</kbd></button></div>`;
    card.innerHTML = h; card.classList.remove('hidden');
  };
  // the diary of the life (DiarioUI: the page; here its panel): only read — a goal let go is asked of the world by the body's
  // hands (DiarioUI.ask → Possess.apply), and told when the world has done it in its step
  let diaryLines = [], diaryT = 0, diaryH = '';
  IU.diary = function () {
    if (!root || !G.DiarioUI || !G.Possess.body()) return;
    G.Modes.setPanel('diario'); G.Input3D.free();
    card.classList.add('diario'); diaryT = 1; renderDiary(true); card.scrollTop = 0; card.classList.remove('hidden'); // (opened: from its top)
  };
  IU.diaryLines = () => diaryLines; // (for the tests: the lines of the page as it was drawn, in the order of their data-i)
  function renderDiary(force) {
    const v = G.Possess.body(); if (!v || !card) return; const pg = G.DiarioUI.page(v, { mine: true });
    const h = `<button class="x" data-c="close">×</button><div class="ic-head"><div><h3>Diário de Vida</h3><div class="sub">${esc(v.name)}</div></div></div>${pg.html}<div class="btns"><button data-c="self">Quem sou eu <kbd>${esc(G.Input3D.label('ficha'))}</kbd></button><button data-c="close">Fechar <kbd>${esc(G.Input3D.label('diario'))}</kbd></button></div>`;
    diaryLines = pg.lines; if (!force && h === diaryH) return; diaryH = h;
    const top = card.scrollTop; card.innerHTML = h; card.scrollTop = top;
  }
  function onCardClick(e) {
    const b = e.target.closest('[data-c]'); if (!b) return; const c = b.dataset.c;
    if (c === 'close') { IU.closeAll(); G.Modes.setPanel(null); }
    else if (c === 'verb') { const k = b.dataset.vk, id = b.dataset.v; IU.closeAll(); G.Modes.setPanel(null); IU.useVerb(k, null, id); }
    else if (c === 'hug') { const o = G.S.villagers.get(+b.dataset.id); IU.closeAll(); G.Modes.setPanel(null); const r = o ? G.Interact.hug(o) : null; if (r && r.ok) IU.when(r.ask, () => IU.toast(r.msg, 2.4)); else if (r) IU.toast(r.msg || 'Agora não dá.', 2.4); }
    else if (c === 'swap') { const o = G.S.villagers.get(+b.dataset.id); IU.closeAll(); G.Modes.setPanel(null); if (o) G.Modes.switchTo(o); }
    else if (c === 'diary') IU.diary();
    else if (c === 'self') IU.selfCard();
    // (a goal let go: the body changes its mind — the world decides it in its step, by its own rule)
    else if (c === 'drop') { const ask = G.DiarioUI.ask(diaryLines[+b.dataset.i]); if (!ask) { IU.toast('Isso não se deixa de lado.', 2.4); return; } b.disabled = true;
      IU.when(ask, r => { IU.toast(r.msg || 'Deixado de lado.', 3.4); if (G.Modes.panelIs('diario')) renderDiary(true); }, r => { IU.toast(r.why || 'Agora não dá.', 3); if (G.Modes.panelIs('diario')) renderDiary(true); }); }
    // (lying down where one stands: the world lays the body down in its step, and it is said once it has)
    else if (c === 'sleep') { IU.closeAll(); G.Modes.setPanel(null); IU.when(G.Possess.apply(w => { if (!G.Possess.sleep(w)) return { ok: false, why: '' }; G.Possess.deed('sono'); return { ok: true }; }), () => IU.toast('Você se deita no chão e dorme.')); }
  }
  // (the panels a module opens — the bag: D-336 — close with the cards: each module puts its closer here)
  IU.closers = [];
  IU.closeAll = function () { if (!root) return; card.classList.add('hidden'); menu.classList.add('hidden'); for (const f of IU.closers) f(); };
  // (the screen's places, for the modules that draw on it: the HUD, the root)
  IU.hud = () => hud; IU.root = () => root;
  // (keys while a card or the menu is open: E and Esc close it)
  IU.keyCapture = function (e, down) {
    if (!root || !down) return false;
    const a = G.Input3D.actionOf((e.key || '').toLowerCase());
    if (!card.classList.contains('hidden')) {
      // (the diary's key over a card: to the diary, or closes it; the self's key over the diary: to the self's card)
      if (a === 'diario') { e.preventDefault(); if (G.Modes.panelIs('diario')) { IU.closeAll(); G.Modes.setPanel(null); } else IU.diary(); return true; }
      if (a === 'ficha' && G.Modes.panelIs('diario')) { e.preventDefault(); IU.selfCard(); return true; }
      if (a === 'interagir' || a === 'menu' || (a === 'ficha' && G.Modes.panel())) { e.preventDefault(); IU.closeAll(); G.Modes.setPanel(null); return true; }
      // (the feet's keys pressed over a card go on to the hands' table — held, they walk once it shuts: L-1142)
      if (a === 'frente' || a === 'tras' || a === 'esquerda' || a === 'direita' || a === 'correr') return false;
      return a !== null;
    }
    return false;
  };

  // ------------------------------ the menu ------------------------------
  let tab = 'jogo';
  IU.menu = function (on) {
    if (!root) return;
    if (!on) { menu.classList.add('hidden'); return; }
    renderMenu(); menu.classList.remove('hidden');
  };
  function renderMenu() {
    const q = G.Realm.q; const O = G.Cam3D.OPT;
    let h = `<div class="im-tabs">${[['jogo', 'Jogo'], ['controles', 'Controles'], ['grafico', 'Gráficos']].map(([k, t]) => `<button data-m="tab" data-t="${k}" class="${tab === k ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    if (tab === 'jogo') {
      h += `<div class="im-title">Pausa</div><div class="im-col">
        <button data-m="resume" class="big">Continuar</button>
        <button data-m="god" class="big gold">Voltar ao Modo Deus</button>
        <button data-m="save">Salvar o jogo</button></div>
        <div class="im-row"><label><input type="checkbox" data-h="tela" ${hudOff ? '' : 'checked'}> Mostrar a tela — nome, lugar, hora, avisos <kbd>${esc(G.Input3D.label('tela'))}</kbd></label></div>
        <div class="im-note">Enquanto você vive esta vida, o mundo segue no mesmo relógio — só que no passo de uma pessoa (o tempo corre a ${String(G.Space.TIME).replace(".", ",")}× da velocidade normal do Modo Deus).</div>`;
    } else if (tab === 'controles') {
      // (20b: each action with its keys and mouse buttons and its controller button — a click on either and the next key, button
      // of the mouse or of the controller is it —; the eye's choices for the mouse, the controller and the fingers)
      const In = G.Input3D;
      h += `<div class="im-title">Controles</div><table class="im-keys"><tr><th></th><th>Teclado e mouse</th><th>Controle</th></tr>${In.ACTIONS.map(([a, t]) => `<tr><td>${esc(t)}</td><td><button data-m="bind" data-a="${a}">${esc(In.keyLabel(a) || '—')}</button></td><td><button data-m="bind" data-pad="1" data-a="${a}">${esc(In.padLabel(a) || '—')}</button></td></tr>`).join('')}</table>
        <div class="im-note">W A S D trotam; ${esc(In.keyLabel('correr'))} dispara (o fôlego acaba e volta); ${esc(In.keyLabel('andar'))} anda devagar, ao passo das pessoas; ${esc(In.keyLabel('esquivar'))} esquiva. No controle e no toque, o quanto se empurra o bastão é a velocidade.</div>
        <div class="im-row"><label>Sensibilidade do mouse <input type="range" min="0.3" max="2.5" step="0.05" value="${O.sens}" data-o="sens"></label></div>
        <div class="im-row"><label>Sensibilidade do controle <input type="range" min="0.3" max="2.5" step="0.05" value="${O.padSens}" data-o="padSens"></label></div>
        <div class="im-row"><label>Sensibilidade do toque <input type="range" min="0.3" max="2.5" step="0.05" value="${O.touchSens}" data-o="touchSens"></label></div>
        <div class="im-row"><label>Campo de visão <input type="range" min="45" max="80" step="1" value="${O.fov}" data-o="fov"></label></div>
        <div class="im-row"><label><input type="checkbox" data-o="invertY" ${O.invertY ? 'checked' : ''}> Inverter o eixo vertical</label></div>
        <div class="im-row"><label><input type="checkbox" data-o="follow" ${O.follow ? 'checked' : ''}> A câmera vai devagar para trás das costas quando você anda reto para a frente</label></div>
        <div class="im-row"><label><input type="checkbox" data-o="side" ${O.side < 0 ? 'checked' : ''}> Câmera sobre o ombro esquerdo <kbd>${esc(In.keyLabel('ombro'))}</kbd></label></div>
        <div class="im-col"><button data-m="resetkeys">Restaurar teclas</button></div>`;
    } else {
      const Q = G.Realm.Q();
      // (the presets come from the realm, in its order and with its names — the Ultra among them; the sliders reach the
      // farthest of them, so a preset's own value is never cut by the slider)
      const QN = G.Realm.QNAMES || [['baixa', 'Leve'], ['media', 'Média'], ['alta', 'Alta']];
      const most = k => Math.max(...Object.values(G.Realm.QUAL || {}).map(p => p[k] || 0), Q[k] || 0);
      h += `<div class="im-title">Gráficos</div><div class="im-seg">${QN.map(([k, t]) => `<button data-m="q" data-q="${k}" class="${q === k ? 'on' : ''}">${t}</button>`).join('')}</div>
        <div class="im-row"><label>Distância de visão <input type="range" min="180" max="${Math.max(800, most('view'))}" step="20" value="${Q.view}" data-g="view"></label></div>
        <div class="im-row"><label>Pessoas desenhadas por perto <input type="range" min="8" max="${Math.max(90, most('npcs'))}" step="2" value="${Q.npcs}" data-g="npcs"></label></div>
        <div class="im-row"><label>Resolução <input type="range" min="0.5" max="1" step="0.05" value="${Q.scale}" data-g="scale"></label></div>
        <div class="im-row"><label><input type="checkbox" data-g="shadows" ${Q.shadows ? 'checked' : ''}> Sombras</label> <label><input type="checkbox" data-g="grass" ${Q.grass ? 'checked' : ''}> Capim e flores</label></div>
        <div class="im-note">Agora: ${G.Realm.fps ? Math.round(G.Realm.fps) + ' quadros por segundo · ' : ''}${G.Realm.memory() ? G.Realm.memory().calls + ' chamadas de desenho' : ''}</div>`;
    }
    menu.innerHTML = h;
  }
  function onMenuClick(e) {
    const b = e.target.closest('[data-m]'); if (!b) return; const m = b.dataset.m;
    if (m === 'tab') { tab = b.dataset.t; renderMenu(); }
    else if (m === 'resume') G.Modes.menu(false);
    else if (m === 'god') { G.Modes.menu(false); G.Modes.leave('deus'); }
    else if (m === 'save') { G.Save.save(); IU.toast('Jogo salvo — no corpo de ' + (G.Possess.body() || {}).name + '.'); }
    else if (m === 'bind') { b.textContent = b.dataset.pad ? 'Aperte um botão do controle…' : 'Aperte uma tecla ou um botão do mouse…'; G.Input3D.listen(b.dataset.a, () => renderMenu()); }
    else if (m === 'resetkeys') { G.Input3D.resetBinds(); renderMenu(); }
    else if (m === 'q') { G.Realm.setQuality(b.dataset.q); renderMenu(); }
  }
  function onMenuInput(e) {
    const t = e.target; const O = G.Cam3D.OPT;
    if (t.dataset.h === 'tela') IU.setHud(t.checked, true);
    if (t.dataset.o) { const k = t.dataset.o; O[k] = k === 'side' ? (t.checked ? -1 : 1) : t.type === 'checkbox' ? t.checked : +t.value; G.Cam3D.saveOpt(); }
    // (a box turned back on returns to what the preset itself has — the Ultra's shadows are 4096, not 1024; a preset that
    // has none, the Leve, gets the middle size)
    if (t.dataset.g) { const k = t.dataset.g; const P = (G.Realm.QUAL || {})[G.Realm.q] || {}; G.Realm.setOver(k, t.type === 'checkbox' ? (t.checked ? (P[k] || (k === 'shadows' ? 1024 : 1)) : 0) : +t.value); }
  }
  // ------------------------------ 22b: what is said around (D-623) ------------------------------
  // the rumours the lived person comes to know — by the talk of the town, by someone who brings them, by what they saw —, in the
  // version they heard, a line of the news each, once; what they knew when the god came into the body is not news
  let heard = new Set(), heardFor = 0, heardT = 0;
  G.worldHooks.push(() => { heard = new Set(); heardFor = 0; heardT = 0; });
  IU.frames.push(rdt => {
    if (!G.Modes.inc() || !G.Possess.knows.boatos) return;
    heardT -= rdt; if (heardT > 0) return; heardT = 1.5;
    const v = G.Possess.body(); if (!v) return;
    const ls = G.Possess.knows.boatos(v);
    if (heardFor !== v.id) { heardFor = v.id; heard = new Set(ls.map(n => n.key)); return; }
    for (const n of ls) {
      if (heard.has(n.key)) continue; heard.add(n.key);
      if (!news.some(q => q.txt === n.txt)) { news.push({ txt: n.txt, far: true, t: 11, more: 0 }); if (news.length > 2) news.shift(); renderNews(); }
    }
  });
})(window.G);
