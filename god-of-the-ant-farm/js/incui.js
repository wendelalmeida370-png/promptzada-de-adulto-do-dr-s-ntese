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
//  Its look is the god's gold and letters, quieter: small type,
//  dark glass that reads over snow and a white sky, the compass
//  across the top, words that fade out (arte/BIBLIA.md, a HUD).
// ============================================================
(function (G) {
  const IU = G.IncUI = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (sel, r) => (r || document).querySelector(sel);
  let root = null, hud = null, card = null, menu = null, fadeEl = null, banner = null, deathEl = null, label = null, stickEl = null, leadEl = null, markEl = null;
  let best = null, bestT = 0, upT = 0, toasts = [], news = [], fade = null, hintT = 0, bannerT = 0, repeatT = 0, slowT = 0, slowSaid = false;
  let swimTold = false, lowTold = false, drownTold = false; // (the water's words: said once, and again each time it comes back)
  let waits = []; // (what was asked of the world from here — a click, a key —, waiting for its answer to be told)
  let lead = null, leadT = 0; // (the lead to the work near: Interact.lead, asked a few times a second)
  G.worldHooks.push(() => { swimTold = lowTold = drownTold = false; news = []; waits = []; lead = null; leadT = 0; if (root) renderNews(); });   // (the old world's news go with it)
  IU.best = () => best;
  IU.lead = () => lead; // (for the tests: the lead shown, and where its mark is — IU.markAt)
  const bar = (k, txt) => `<div class="ih-bar ${k}"><span class="ih-bl">${txt}</span><i><b></b></i></div>`;

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
        <div class="ih-prompt hidden"><kbd>E</kbd><span></span></div>
        <div class="ih-reticle"></div>
        <div class="ih-hint panel"></div>
        <button class="ih-god" title="Voltar ao Modo Deus">${(G.ICON && G.ICON.eye) || ''}<span>Modo Deus</span></button>
        <div class="ih-toasts"></div>
        <div class="ih-sleep hidden">Dormindo… <small>o tempo passa depressa · <kbd>E</kbd> para acordar</small></div>
        <div class="ih-touch hidden"><div class="ih-stick"><i></i></div><button data-k="pular">Pular</button><button data-k="correr">Correr</button><button data-k="interagir">E</button><button data-k="menu">☰</button></div>
      </div>
      <div id="inc-label" class="hidden"></div>
      <div id="inc-card" class="panel hidden"></div>
      <div id="inc-menu" class="panel hidden"></div>
      <div id="inc-banner" class="hidden"></div>
      <div id="inc-death" class="hidden"></div>
      <div id="inc-fade"></div>`;
    document.body.appendChild(root);
    hud = $('#inc-hud'); card = $('#inc-card'); menu = $('#inc-menu'); fadeEl = $('#inc-fade'); banner = $('#inc-banner'); deathEl = $('#inc-death'); label = $('#inc-label'); stickEl = $('.ih-stick', hud);
    leadEl = $('.ih-lead', hud); markEl = $('.ih-mark', hud);
    $('.ih-god', hud).onclick = () => G.Modes.leave('deus');
    for (const b of hud.querySelectorAll('.ih-touch button')) {
      const k = b.dataset.k;
      b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); if (k === 'correr') G.Input3D.press(k, !G.Input3D.down.correr); else G.Input3D.press(k); }, { passive: false });
    }
    card.addEventListener('click', onCardClick); menu.addEventListener('click', onMenuClick); menu.addEventListener('input', onMenuInput);
    // (the cards and the menu are the mouse's: a click there is not a look-around)
    for (const el of [card, menu]) el.addEventListener('mousedown', e => e.stopPropagation());
  };
  IU.show = function (on) { if (!root) return; hud.classList.toggle('hidden', !on); if (on) { hintT = 14; } if (!on) { label.classList.add('hidden'); } };
  IU.touchOn = () => { if (root) hud.querySelector('.ih-touch').classList.remove('hidden'); };
  IU.stick = function (s) { if (!stickEl) return; stickEl.classList.toggle('on', !!s); if (s) { stickEl.style.left = (s.ox - 60) + 'px'; stickEl.style.top = (s.oy - 60) + 'px'; stickEl.firstChild.style.transform = `translate(${s.x * 40}px, ${s.y * 40}px)`; } };

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
    const id = G.Possess.identity(v); const w = G.Possess.where(v);
    IU.banner(`${id.name} · ${id.age} ${id.age === 1 ? 'ano' : 'anos'} · ${id.role}${w.town || w.near ? ' · ' + (w.town || 'perto de ' + w.near) : ''}`, 3.4);
  };
  // the fade (to and from black): from, to in 0..1, seconds, and what to do at the end
  IU.fade = function (a, b, d, done) { if (!root) return; fade = { a, b, d: Math.max(0.01, d), t: 0, done }; fadeEl.style.opacity = a; };
  IU.death = function (rec, cause) {
    if (!root) return;
    const txt = G.Village.deathText({ ...rec, cause: cause || rec.cause });
    deathEl.innerHTML = `<div class="d-name">${esc(rec.name)}</div><div class="d-cause">${esc(G.cap ? G.cap(txt) : txt)}.</div><div class="d-sub">A vida terminou. O mundo segue — e a história lembra.</div>`;
    deathEl.classList.remove('hidden'); deathEl.classList.add('show');
    setTimeout(() => { deathEl.classList.remove('show'); setTimeout(() => deathEl.classList.add('hidden'), 900); }, 4200);
  };
  // the chronicle reaches the ears: a line of news (the world goes on beyond the body)
  G.Possess.onLog.push((e, v) => {
    if (!root || !G.Modes.inc()) return;
    const near = v && Number.isFinite(e.x) && G.dist(e.x, e.y, v.x, v.y) < 30;
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
  IU.frame = function (rdt) {
    if (!root) return;
    const S = G.S;
    // the world's answers to what was asked of it
    for (let k = waits.length - 1; k >= 0; k--) { const w = waits[k]; const r = w.ask.res; if (!r) continue; waits.splice(k, 1); if (r.dropped) continue; if (r.ok) { if (w.ok) w.ok(r); } else if (w.no) w.no(r); }
    // fades, banners, toasts, news
    if (fade) { fade.t += rdt; const k = Math.min(1, fade.t / fade.d); fadeEl.style.opacity = G.lerp(fade.a, fade.b, k); if (k >= 1) { const d = fade.done; fade = null; d && d(); } }
    if (bannerT > 0) { bannerT -= rdt; if (bannerT <= 0) { banner.classList.add('hidden'); root.classList.remove('ib-on'); } }
    for (let k = toasts.length - 1; k >= 0; k--) { const o = toasts[k]; o.t -= rdt; if (o.t <= 0) { o.el.remove(); toasts.splice(k, 1); } else fadeOut(o.el, o.t, 0.5); }
    let nd = false; for (let k = news.length - 1; k >= 0; k--) { news[k].t -= rdt; if (news[k].t <= 0) { news.splice(k, 1); nd = true; } } if (nd) renderNews();
    { const els = $('.ih-news', hud).children; for (let k = 0; k < news.length && k < els.length; k++) fadeOut(els[k], news[k].t, 0.8); }
    if (hintT > 0) { hintT -= rdt; }
    fadeOut($('.ih-hint', hud), hintT, 1.2);
    if (!G.Modes.inc()) { label.classList.add('hidden'); markEl.classList.add('hidden'); return; }
    drawAir();
    const v = G.Possess.body(); if (!v) return;
    // the best thing to do, a few times a second (the world is asked, not the picture)
    bestT -= rdt;
    if (bestT <= 0) {
      bestT = 0.12;
      best = G.Modes.panel() || v.sleeping || G.Avatar.busy() ? null : G.Interact.best();
      G.People3D.highlight = best && best.id === 'pessoa' ? best.t.o.id : 0;
      const pr = $('.ih-prompt', hud);
      if (best) { pr.classList.remove('hidden'); pr.classList.toggle('no', !best.ok); pr.querySelector('kbd').textContent = G.Input3D.label('interagir'); pr.querySelector('span').textContent = best.ok ? best.label : `${best.label} — ${best.why}`; }
      else pr.classList.add('hidden');
    }
    // holding the key repeats the work (stroke after stroke on the same tree)
    if (G.Input3D.down.interagir && best && best.ok && !G.Avatar.busy() && !G.Modes.panel() && (best.id === 'arvore' || best.id === 'pedra')) { repeatT -= rdt; if (repeatT <= 0) { repeatT = 0.15; IU.use(); } } else repeatT = 0.3;
    // the name over the one the body faces
    placeLabel();
    // the lead to the work near (only read from the world, a few times a second), and its mark over the place, every frame
    leadT -= rdt;
    if (leadT <= 0) { leadT = 0.25; const p = G.Avatar.pos(); lead = G.Modes.panel() || v.sleeping || !p ? null : G.Interact.lead(v, p.X, p.Z, lead && lead.op); renderLead(); }
    placeMark();
    // (a machine that cannot keep up: said once, with the way out — the lighter picture in the menu)
    if (G.Realm.fps && G.Realm.fps < 22 && G.Realm.q !== 'baixa') { slowT += rdt; if (slowT > 8 && !slowSaid) { slowSaid = true; IU.toast(`O 3D está pesado neste computador (${Math.round(G.Realm.fps)} quadros por segundo): no menu (${G.Input3D.label('menu')}) → Gráficos → Leve.`, 7); } } else slowT = 0;
    upT -= rdt; if (upT > 0) return; upT = 0.1;
    const id = G.Possess.identity(v); const w = G.Possess.where(v); const st = G.Avatar.state(); const caps = G.Possess.caps(v);
    $('.ih-name', hud).textContent = id.name + (id.epithet ? ', ' + id.epithet : '');
    $('.ih-sub', hud).textContent = `${id.age} ${id.age === 1 ? 'ano' : 'anos'} · ${id.role}${id.set ? ' · ' + id.set : ''}`;
    const setBar = (k, val, warn) => { const e = $('.ih-bar.' + k, hud); e.querySelector('b').style.width = G.clamp(val, 0, 100) + '%'; e.classList.toggle('warn', !!warn); };
    setBar('hp', v.hp, v.hp < 30); setBar('st', st ? st.stamina / Math.max(1, caps.stamina) * 100 : 100, st && st.stamina < 15); setBar('fo', 100 - v.hunger, v.hunger > 80); setBar('en', v.energy, v.energy < 15);
    // (in the water: what the breath is doing — the first time how it works, then only when it runs low or out)
    const sw = G.Avatar.swimming && G.Avatar.swimming();
    if (sw && !swimTold) { swimTold = true; IU.toast(`Nadando: na água o fôlego vai acabando. ${G.Input3D.label('pular')} dá uma braçada forte; chegue à margem antes que ele acabe.`, 6); }
    if (sw && st && st.stamina > 0 && st.stamina < caps.stamina * 0.25 && !lowTold) { lowTold = true; IU.toast('O fôlego está acabando — nade para a margem!', 4); }
    if (sw && st && st.stamina <= 0 && !drownTold) { drownTold = true; IU.toast('Sem fôlego: você está se afogando!', 4); }
    if (!sw) { lowTold = false; drownTold = false; }
    hud.classList.toggle('drowning', !!(sw && st && st.stamina <= 0));
    $('.ih-carry', hud).textContent = v.carry && v.carry.n > 0 ? `Carregando ${v.carry.n} de ${G.Eco ? G.Eco.name(v.carry.k) : v.carry.k}` : '';
    $('.ih-time', hud).textContent = `Dia ${S.day} · ${hourOf(S.time)}${S.weather && S.weather.rain > 0.2 ? ' · chuva' : ''}`;
    $('.ih-place', hud).textContent = w.district ? `${w.district}, ${w.town || w.near}` : w.town ? w.town : w.near ? `${w.ground === 'estrada' ? 'Na estrada' : w.ground === 'bosque' ? 'No bosque' : w.ground === 'mar' ? 'No mar' : w.ground === 'rio' ? 'Na água' : 'No campo'}, ${w.nearD > 2 ? w.nearD * 4 + ' m de ' : 'perto de '}${w.near}` : 'Terras selvagens';
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
    if (hintT > 0) h.innerHTML = [['frente', 'andar'], ['correr', 'correr'], ['pular', 'pular'], ['interagir', 'interagir'], ['ficha', 'quem sou eu'], ['deus', 'Modo Deus'], ['menu', 'menu']].map(([a, t]) => `<span><kbd>${esc(a === 'frente' ? 'WASD' : G.Input3D.label(a))}</kbd> ${t}</span>`).join('') + '<span><kbd>Mouse</kbd> olhar</span>';
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
    const k = G.Possess.kin(G.Possess.body(), o);
    label.textContent = o.name + (k ? ' · ' + k : ''); label.classList.remove('hidden');
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

  // ------------------------------ doing ------------------------------
  IU.use = function () {
    const b = best || G.Interact.best(); if (!b) return;
    if (!b.ok) { IU.toast(b.why); G.Audio && G.Audio.play && G.Audio.play('deny'); return; }
    const r = G.Interact.run(b); if (!r) return;
    if (!r.ok) { IU.toast(r.msg || 'Não dá.'); return; }
    if (r.knock) G.Audio && G.Audio.play && G.Audio.play('knock');
    if (r.card) IU.card(r.card, r.said);
    else if (r.msg) IU.toast(r.msg, 2.4);
    bestT = 0;
  };

  // ------------------------------ cards ------------------------------
  IU.card = function (c, said) {
    if (!root) return; G.Modes.setPanel('card'); G.Input3D.unlock(); G.Input3D.clear();
    let h = `<button class="x" data-c="close">×</button>`;
    if (c.kind === 'person') {
      const o = G.S.villagers.get(c.id);
      h += `<div class="ic-head"><div><h3>${esc(c.name)}</h3><div class="sub">${esc(c.sub)}${c.kin ? ` · <b class="gold">${esc(c.kin)}</b>` : ''}</div></div></div>`;
      if (said) h += `<div class="ic-said">“${esc(said)}”</div>`;
      const rows = [];
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
      h += `<div class="btns">${hug.label ? `<button data-c="hug" data-id="${c.id}"${hug.ok ? '' : ` disabled title="${esc(hug.why)}"`}>${esc(hug.label)}</button>` : ''}${can.ok ? `<button data-c="swap" data-id="${c.id}">${(G.ICON && G.ICON.eye) || ''} Encarnar ${esc(o.name)}</button>` : ''}<button data-c="close">Fechar <kbd>E</kbd></button></div>`;
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
    G.Modes.setPanel('self'); G.Input3D.unlock(); G.Input3D.clear();
    const caps = c.caps; const kind = (G.Possess.KINDS[c.kind] || {}).label || c.kind;
    let h = `<button class="x" data-c="close">×</button><div class="ic-head"><div><h3>${esc(pc.name)}</h3><div class="sub">${esc(pc.sub)} · ${esc(kind)}</div></div></div>`;
    const rows = [];
    rows.push(['Onde', c.where.district ? `${c.where.district}, ${c.where.town}` : c.where.town || (c.where.near ? 'perto de ' + c.where.near : 'terras selvagens')]);
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
    h += `<div class="btns">${v.energy < 70 && !v.sleeping ? '<button data-c="sleep">Dormir aqui</button>' : ''}<button data-c="close">Fechar <kbd>${esc(G.Input3D.label('ficha'))}</kbd></button></div>`;
    card.innerHTML = h; card.classList.remove('hidden');
  };
  function onCardClick(e) {
    const b = e.target.closest('[data-c]'); if (!b) return; const c = b.dataset.c;
    if (c === 'close') { IU.closeAll(); G.Modes.setPanel(null); }
    else if (c === 'hug') { const o = G.S.villagers.get(+b.dataset.id); IU.closeAll(); G.Modes.setPanel(null); const r = o ? G.Interact.hug(o) : null; if (r && r.ok) IU.when(r.ask, () => IU.toast(r.msg, 2.4)); else if (r) IU.toast(r.msg || 'Agora não dá.', 2.4); }
    else if (c === 'swap') { const o = G.S.villagers.get(+b.dataset.id); IU.closeAll(); G.Modes.setPanel(null); if (o) G.Modes.switchTo(o); }
    // (lying down where one stands: the world lays the body down in its step, and it is said once it has)
    else if (c === 'sleep') { IU.closeAll(); G.Modes.setPanel(null); IU.when(G.Possess.apply(w => { if (!G.Possess.sleep(w)) return { ok: false, why: '' }; G.Possess.deed('sono'); return { ok: true }; }), () => IU.toast('Você se deita no chão e dorme.')); }
  }
  IU.closeAll = function () { if (!root) return; card.classList.add('hidden'); menu.classList.add('hidden'); };
  // (keys while a card or the menu is open: E and Esc close it)
  IU.keyCapture = function (e, down) {
    if (!root || !down) return false;
    const a = G.Input3D.actionOf((e.key || '').toLowerCase());
    if (!card.classList.contains('hidden')) {
      if (a === 'interagir' || a === 'menu' || (a === 'ficha' && G.Modes.panel())) { e.preventDefault(); IU.closeAll(); G.Modes.setPanel(null); return true; }
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
        <div class="im-note">Enquanto você vive esta vida, o mundo segue no mesmo relógio — só que no passo de uma pessoa (o tempo corre a 0,35× da velocidade normal do Modo Deus).</div>`;
    } else if (tab === 'controles') {
      h += `<div class="im-title">Controles</div><table class="im-keys">${G.Input3D.ACTIONS.map(([a, t]) => `<tr><td>${esc(t)}</td><td><button data-m="bind" data-a="${a}">${esc(G.Input3D.label(a))}</button></td></tr>`).join('')}</table>
        <div class="im-row"><label>Sensibilidade do mouse <input type="range" min="0.3" max="2.5" step="0.05" value="${O.sens}" data-o="sens"></label></div>
        <div class="im-row"><label>Campo de visão <input type="range" min="45" max="80" step="1" value="${O.fov}" data-o="fov"></label></div>
        <div class="im-row"><label><input type="checkbox" data-o="invertY" ${O.invertY ? 'checked' : ''}> Inverter o eixo vertical</label></div>
        <div class="im-row"><label><input type="checkbox" data-o="follow" ${O.follow ? 'checked' : ''}> Câmera volta para trás das costas ao andar</label></div>
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
    else if (m === 'bind') { b.textContent = 'Aperte uma tecla…'; G.Input3D.listen(b.dataset.a, () => renderMenu()); }
    else if (m === 'resetkeys') { G.Input3D.resetBinds(); renderMenu(); }
    else if (m === 'q') { G.Realm.setQuality(b.dataset.q); renderMenu(); }
  }
  function onMenuInput(e) {
    const t = e.target; const O = G.Cam3D.OPT;
    if (t.dataset.o) { const k = t.dataset.o; O[k] = t.type === 'checkbox' ? t.checked : +t.value; G.Cam3D.saveOpt(); }
    // (a box turned back on returns to what the preset itself has — the Ultra's shadows are 4096, not 1024; a preset that
    // has none, the Leve, gets the middle size)
    if (t.dataset.g) { const k = t.dataset.g; const P = (G.Realm.QUAL || {})[G.Realm.q] || {}; G.Realm.setOver(k, t.type === 'checkbox' ? (t.checked ? (P[k] || (k === 'shadows' ? 1024 : 1)) : 0) : +t.value); }
  }
})(window.G);
