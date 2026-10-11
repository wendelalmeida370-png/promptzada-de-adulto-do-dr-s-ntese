'use strict';
// ============================================================
//  Following a story: never miss the moment.
//    THE TRACKER   a card at the top right while a story is followed: who, the
//                  step it is on, what they are doing right now, and what comes
//                  next — counted down in hours — with a button that runs the
//                  world fast until just before it, and slows down in time.
//    THE MARKER    where the next moment will happen: a column of light on the
//                  ground, and an arrow at the edge of the screen when it is off.
//    NOW           a scene of the followed story takes the screen by itself; a
//                  strong scene of any other story says so at the top — NOW,
//                  there — with one button to go and watch it.
//    MISSED        a scene that played while nobody watched leaves its pictures
//                  and words: the tracker offers to see it again.
// ============================================================
(function (G) {
  const Tk = G.Track = {};
  const St = G.Stories, Sn = G.Scene;
  if (!St || !Sn) return;
  const W = G.W;
  const TAU = Math.PI * 2;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = id => (id ? G.S.villagers.get(id) || null : null);
  const DAY = () => G.DAY_LEN;
  const ic = name => (G.ICON && (G.ICON[name] || G.ICON.saga)) || '';
  let el = null, alertEl = null, uiT = 0, skip = null, sig = '', alertSc = null, alertT = 0, flashT = 0, lastChN = -1;
  const missed = []; // records of scenes of the followed story that nobody watched

  // ============================== the card ==============================
  Tk.init = function () {
    const d = document.createElement('div'); d.id = 'saga-track'; d.className = 'hidden';
    document.body.appendChild(d); el = d;
    d.addEventListener('click', e => {
      const b = e.target.closest('[data-tk]'); if (!b) return;
      e.stopPropagation(); G.Audio && G.Audio.play('click');
      const id = St.followed(); const s = id && St.get(id);
      const a = b.dataset.tk;
      if (a === 'x') { St.follow(0); stopSkip(); }
      else if (a === 'open' && s) St.openStory(s.id);
      else if (a === 'see' && s) { const p = P(s.protag); if (p) { const R = G.Render; R.cam.follow = p.id; R.panTo(p.x, p.y); R.cam.tz = Math.max(R.cam.tz, 1.8); if (R.under && !p.ug) R.setUnder(0); } }
      else if (a === 'skip' && s) Tk.skipTo(s);
      else if (a === 'stop') stopSkip(true);
      else if (a === 'watch') { const sc = Sn.of(id); if (sc) Sn.show(sc); }
      else if (a === 'replay') { const r = Sn.record(+b.dataset.id); if (r) Tk.openReplay(r); }
      else if (a === 'where' && s && s.data.next && s.data.next.x !== undefined) { const R = G.Render; R.cam.follow = 0; R.panTo(s.data.next.x, s.data.next.y); R.cam.tz = Math.max(R.cam.tz, 1.6); }
    });
    for (const ev of ['pointerdown', 'mousedown', 'touchstart']) d.addEventListener(ev, e => e.stopPropagation(), { passive: true });
    // NOW, elsewhere: one click to go and watch
    const a = document.createElement('div'); a.id = 'now-alert'; a.className = 'hidden';
    a.innerHTML = `<span class="na-dot"></span><span class="na-txt"><b></b><small></small></span><button class="na-go">Assistir</button><button class="na-x" title="Fechar">×</button>`;
    document.body.appendChild(a); alertEl = a;
    a.querySelector('.na-go').onclick = e => { e.stopPropagation(); G.Audio && G.Audio.play('click'); const sc = alertSc; hideAlert(); if (sc && sc.st === 'run') Sn.show(sc); };
    a.querySelector('.na-x').onclick = e => { e.stopPropagation(); hideAlert(); };
  };
  function hideAlert() { if (alertEl) alertEl.classList.add('hidden'); alertSc = null; alertT = 0; }
  function nowAlert(sc) {
    if (!alertEl || Sn.watching) return;
    const st = sc.story && St.get(sc.story);
    alertSc = sc; alertT = 14;
    alertEl.querySelector('b').textContent = 'Agora · ' + (st ? st.title : sc.title);
    alertEl.querySelector('small').textContent = sc.kick || (st && P(st.protag) ? P(st.protag).name + ' — ' + (sc.title || 'um momento decisivo') : sc.title || '');
    alertEl.style.setProperty('--hue', st && St.hue ? St.hue(st.type) : '#f5c86b');
    alertEl.classList.remove('hidden'); alertEl.classList.remove('pop'); void alertEl.offsetWidth; alertEl.classList.add('pop');
    G.Audio && G.Audio.play('sting', 0.45);
  }

  // ============================== the scenes and the screen ==============================
  const prevStart = Sn.onStart, prevEnd = Sn.onEnd, prevShow = Sn.onShow;
  const prevReady = Sn.onReady;
  Sn.onReady = function (sc) { if (prevReady) prevReady(sc); Sn.onStart(sc, true); };
  Sn.onStart = function (sc, ready) {
    if (prevStart && !ready) prevStart(sc);
    if (!sc.ready) return;
    if (!G.Main || G.Main.mode !== 'game' || (G.Skip && G.Skip.on) || (G.Photo && G.Photo.on)) return;
    const fol = St.followed();
    if (skip && skip.story === sc.story) stopSkip();
    if (sc.story && sc.story === fol && sc.present !== false) { if (!Sn.watching || (Sn.watching.imp || 1) <= sc.imp) Sn.show(sc); return; }
    if (G.Cinema && G.Cinema.on && sc.imp >= 2 && !Sn.watching) { Sn.show(sc); return; }
    if (sc.imp >= 2) nowAlert(sc);
  };
  Sn.onShow = function (sc) { if (prevShow) prevShow(sc); sc.watched = 1; if (alertSc === sc) hideAlert(); };
  Sn.onEnd = function (sc) {
    if (prevEnd) prevEnd(sc);
    if (alertSc === sc) hideAlert();
    if (sc.story && sc.story === St.followed() && !sc.watched && Sn.record(sc.id)) { missed.push(sc.id); if (missed.length > 4) missed.shift(); sig = ''; }
  };
  St.onFollow = function (id) { missed.length = 0; sig = ''; uiT = 0; if (!id) stopSkip(); };

  // ============================== run the world fast, stop in time ==============================
  Tk.skipTo = function (s) {
    if (!s || s.st !== 'ativa') return;
    const nx = s.data.next;
    skip = { story: s.id, at: nx && nx.at > G.S.clock ? nx.at : 0, until: G.S.clock + DAY() * 2.5, prev: G.speed };
    G.UI.setSpeed(16); sig = '';
    G.UI.notice(nx && nx.at > G.S.clock ? `Avançando até: ${nx.label}.` : 'Avançando até o próximo momento desta história.', 'saga');
  };
  function stopSkip(byHand) {
    if (!skip) return;
    const s = St.get(skip.story); skip = null; sig = '';
    if (G.speed > 1) G.UI.setSpeed(1);
    if (!byHand && s) {
      // the camera goes where it will happen (or to whoever carries the story)
      const nx = s.data.next; const p = P(s.protag); const R = G.Render;
      if (nx && nx.x !== undefined) { R.cam.follow = 0; R.panTo(nx.x, nx.y); } else if (p) { R.cam.follow = p.id; R.panTo(p.x, p.y); }
      R.cam.tz = Math.max(R.cam.tz, 1.8);
      G.Audio && G.Audio.play('heartbeat', 0.8);
    }
  }
  Tk.skipping = () => !!skip;

  // ============================== per frame ==============================
  Tk.frame = function (rdt) {
    if (!el || !G.S) return;
    if (alertT > 0) { alertT -= rdt; if (alertT <= 0 || !alertSc || alertSc.st !== 'run' || Sn.watching) hideAlert(); }
    if (flashT > 0) flashT -= rdt;
    const id = St.followed(); const s = id && St.get(id);
    // the skip: stop just before the moment (or when the story ends, or after a while)
    if (skip) {
      const ss = St.get(skip.story);
      if (!ss || ss.st !== 'ativa' || G.S.clock > skip.until) stopSkip();
      else if (skip.at && G.S.clock >= skip.at - DAY() * 0.045) stopSkip();
      else if (!skip.at && ss.data.next && ss.data.next.at > G.S.clock) skip.at = ss.data.next.at;
      else if (G.speed !== 16 && G.speed !== 0) skip = null;
    }
    document.body.classList.toggle('tracking', !!s && !Sn.watching && !(G.Cinema && G.Cinema.on));
    if (!s || Sn.watching || (G.Cinema && G.Cinema.on) || G.Main.mode !== 'game') { if (!el.classList.contains('hidden')) el.classList.add('hidden'); return; }
    uiT -= rdt; if (uiT > 0) return; uiT = 0.3;
    // a new chapter: the card glows
    if (s.chapters.length !== lastChN) { if (lastChN >= 0 && s.chapters.length > lastChN) flashT = 2.5; lastChN = s.chapters.length; }
    render(s);
  };
  function hrs(at) { const h = (at - G.S.clock) / DAY() * 24; return h <= 0.6 ? 'agora' : h < 1.5 ? 'em 1 hora' : h < 36 ? `em ${Math.round(h)} horas` : `em ${Math.round(h / 24)} dias`; }
  function render(s) {
    const d = St.DEF[s.type]; const p = P(s.protag) || G.person(s.protag);
    const live = Sn.of(s.id);
    const nx = s.data.next && s.data.next.at > G.S.clock - DAY() * 0.02 ? s.data.next : null;
    const g = d.stages ? (() => { let k = d.stage ? d.stage(s) : 0; const failed = k < 0; if (failed) k = s.data.stg || 0; return { list: d.stages, k: Math.max(0, Math.min(d.stages.length - 1, k)), failed }; })() : null;
    const doing = p && !p.dead ? G.Vg.taskText(p) : '';
    const last = s.chapters[s.chapters.length - 1];
    const ms = missed.map(Sn.record).filter(Boolean).slice(-1)[0];
    const key = [s.id, s.st, g && g.k, doing, nx && nx.label, nx && hrs(nx.at), live && live.id, !!skip, ms && ms.id, s.chapters.length, flashT > 0].join('|');
    if (key === sig) return; sig = key;
    el.className = (flashT > 0 ? 'flash' : '') + (live ? ' live' : '');
    el.style.setProperty('--hue', St.hue ? St.hue(s.type) : '#f5c86b');
    el.innerHTML = `<div class="tk-head"><i>${ic(d.icon)}</i><b title="${esc(s.title)}">${esc(s.title)}</b><button data-tk="open" title="Abrir a história">📖</button><button data-tk="x" title="Parar de seguir">×</button></div>
      <div class="tk-who"><span class="tk-pic"></span><div><b>${esc(p ? p.name : '?')}</b>${g ? `<div class="tk-dots">${g.list.map((x, i) => `<i class="${i < g.k ? 'done' : i === g.k ? (g.failed ? 'fail' : s.st === 'fim' ? 'done' : 'now') : ''}"></i>`).join('')}<span>${esc(g.list[g.k][1])}</span></div>` : ''}</div><button data-tk="see" title="Ver ${esc(p ? p.name : '')}">◎</button></div>
      ${s.st !== 'ativa' ? `<div class="tk-now end">${esc(St.END[s.end.k] || '')} · ${esc(St.TONE[s.end.tone] || '')}</div>` : live ? `<div class="tk-live"><span class="na-dot"></span><span><b>Agora</b> ${esc(live.titleSeen || live.title || 'um momento decisivo')}</span><button data-tk="watch">Assistir</button></div>` : doing ? `<div class="tk-now"><em>Agora</em> ${esc(doing)}</div>` : ''}
      ${nx && s.st === 'ativa' ? `<div class="tk-next"><span>⏳ <b>${esc(nx.label)}</b> <em>${esc(hrs(nx.at))}</em></span>${nx.x !== undefined ? '<button data-tk="where" title="Onde vai ser">⌖</button>' : ''}${skip ? '<button data-tk="stop" class="on" title="Parar o avanço">⏸</button>' : '<button data-tk="skip" title="Avançar o tempo até pouco antes">⏩</button>'}</div>` : s.st === 'ativa' ? `<div class="tk-next soft"><span>${last ? esc(trim((last.k && St.BEATS[last.k] && St.BEATS[last.k].h ? St.BEATS[last.k].h + ': ' : '') + last.txt, 96)) : ''}</span>${skip ? '<button data-tk="stop" class="on" title="Parar o avanço">⏸</button>' : '<button data-tk="skip" title="Avançar o tempo até o próximo momento">⏩</button>'}</div>` : ''}
      ${ms ? `<div class="tk-missed"><span>Você perdeu: <b>${esc(ms.title || 'uma cena')}</b></span><button data-tk="replay" data-id="${ms.id}">Rever</button></div>` : ''}`;
    const pic = el.querySelector('.tk-pic'); if (pic && St.portrait) pic.appendChild(St.portrait(p, 34));
  }
  const trim = (t, n) => (t && t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t || '');

  // ============================== a scene, seen again ==============================
  Tk.openReplay = function (r) {
    const st = r.story && St.get(r.story); const hue = st && St.hue ? St.hue(st.type) : '#f5c86b';
    const panels = r.snaps.map(sn => `<figure><img src="${sn.img}" alt=""><figcaption>${esc(sn.cap || '')}</figcaption></figure>`).join('');
    const lines = r.lines.map(l => l[2] === 'cap' ? `<p class="rp-cap">${esc(l[1])}</p>` : `<p class="rp-l ${esc(l[2] || 'say')}"><b>${esc(l[0])}</b> ${esc(l[1])}</p>`).join('');
    G.UI.openModal(`<div class="rp-head" style="--hue:${hue}"><div class="rp-kick">${esc(st ? st.title : '')}${r.kick ? ' · ' + esc(r.kick) : ''} · dia ${r.d}</div><h2>${esc(r.title || 'A cena')}</h2></div>
      <div class="bk-page rp-page" style="--hue:${hue}">${panels ? `<div class="rp-panels">${panels}</div>` : ''}${lines ? `<div class="rp-lines">${lines}</div>` : '<p class="muted">Ninguém disse nada.</p>'}</div>
      <div class="mbtns">${st ? `<button data-m="saga-open" data-id="${st.id}">A história</button>` : ''}<button class="primary" data-m="close">Fechar</button></div>`, 'wide book saga replay');
    const k = missed.indexOf(r.id); if (k >= 0) { missed.splice(k, 1); sig = ''; }
  };

  // ============================== the marker in the world ==============================
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ground.push(function (c, proj) {
    if (!G.S || G.Render.under || Sn.watching) return;
    const id = St.followed(); const s = id && St.get(id); if (!s || s.st !== 'ativa') return;
    const nx = s.data.next; if (!nx || nx.x === undefined) return;
    const t = G.Render.time;
    const p = proj(nx.x, nx.y, W.groundH(G.clamp(nx.x, 0, G.N - 0.01), G.clamp(nx.y, 0, G.N - 0.01)));
    const hue = St.hue ? St.hue(s.type) : '#f5c86b';
    c.save(); c.translate(p[0], p[1]);
    const k = 0.5 + 0.5 * Math.sin(t * 2.4);
    c.strokeStyle = hue; c.globalAlpha = 0.5 + 0.3 * k; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(0, 0, 14 + k * 3, 7 + k * 1.5, 0, 0, TAU); c.stroke();
    c.globalAlpha = 0.25; c.beginPath(); c.ellipse(0, 0, 22 + k * 4, 11 + k * 2, 0, 0, TAU); c.stroke();
    // the column of light
    const g = c.createLinearGradient(0, 0, 0, -70); g.addColorStop(0, hue); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.globalAlpha = 0.28 + 0.12 * k; c.fillStyle = g; c.fillRect(-4, -70, 8, 70);
    c.restore();
  });
  // off the screen: an arrow at the edge, with what and when
  G.renderHooks.screen = G.renderHooks.screen || [];
  G.renderHooks.screen.push(function (c, w, h, t, nightF, dpr) {
    if (!G.S || G.Render.under || Sn.watching || (G.Cinema && G.Cinema.on) || G.Main.mode !== 'game') return;
    const id = St.followed(); const s = id && St.get(id); if (!s || s.st !== 'ativa') return;
    const R = G.Render;
    const marks = [];
    const nx = s.data.next; if (nx && nx.x !== undefined) marks.push({ x: nx.x, y: nx.y, label: nx.label + (nx.at > G.S.clock ? ' · ' + hrs(nx.at) : ''), k: 'next' });
    const p = P(s.protag); if (p && !p.ug && !p.aboard && R.cam.follow !== p.id) marks.push({ x: p.x, y: p.y, label: p.name, k: 'me' });
    const hue = St.hue ? St.hue(s.type) : '#f5c86b';
    for (const m of marks) {
      const [wx, wy] = R.proj(m.x, m.y, W.groundH(G.clamp(m.x, 0, G.N - 0.01), G.clamp(m.y, 0, G.N - 0.01)));
      let [sx, sy] = R.worldPxToScreen(wx, wy); sx *= dpr; sy *= dpr;
      const pad = 34 * dpr;
      if (sx > pad && sx < w - pad && sy > pad + 60 * dpr && sy < h - pad - 70 * dpr) continue;
      const cx = w / 2, cy = h / 2; const dx = sx - cx, dy = sy - cy;
      const sc = Math.min((w / 2 - pad) / Math.max(1, Math.abs(dx)), (h / 2 - pad - 60 * dpr) / Math.max(1, Math.abs(dy)));
      const ex = cx + dx * sc, ey = cy + dy * sc; const a = Math.atan2(dy, dx);
      c.save(); c.translate(ex, ey);
      c.fillStyle = m.k === 'next' ? hue : '#ffd27a'; c.strokeStyle = 'rgba(20,14,8,0.8)'; c.lineWidth = 2 * dpr;
      c.save(); c.rotate(a); c.beginPath(); c.moveTo(12 * dpr, 0); c.lineTo(-7 * dpr, -8 * dpr); c.lineTo(-3 * dpr, 0); c.lineTo(-7 * dpr, 8 * dpr); c.closePath(); c.stroke(); c.fill(); c.restore();
      c.font = `800 ${11 * dpr}px Nunito, sans-serif`; c.textAlign = Math.cos(a) > 0.3 ? 'right' : Math.cos(a) < -0.3 ? 'left' : 'center'; c.textBaseline = 'middle';
      const lx = -Math.cos(a) * 18 * dpr, ly = -Math.sin(a) * 18 * dpr;
      c.lineWidth = 3 * dpr; c.strokeText(m.label, lx, ly); c.fillStyle = '#fbf0d8'; c.fillText(m.label, lx, ly);
      c.restore();
    }
  });
  (G.saveHooks = G.saveHooks || []).push({ save() { }, load() { skip = null; missed.length = 0; sig = ''; hideAlert(); lastChN = -1; } });
})(window.G);
