'use strict';
// ============================================================
//  UI: HUD, power bar, inspector, chronicle, family tree,
//  statistics, menus, toasts & notices
// ============================================================
(function (G) {
  const UI = G.UI = {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (inner, vb) => `<svg viewBox="${vb || '0 0 24 24'}" aria-hidden="true">${inner}</svg>`;
  const ST = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const ICON = G.ICON = {
    pop: svg('<circle cx="9" cy="7.5" r="3.4" fill="currentColor"/><path d="M2.5 20.5c0-3.8 2.9-6.6 6.5-6.6s6.5 2.8 6.5 6.6z" fill="currentColor"/><circle cx="17.3" cy="8.6" r="2.6" fill="currentColor" opacity=".75"/><path d="M16.2 13.6c3.3 0 5.6 2.4 5.6 6.2h-4.6" fill="currentColor" opacity=".75"/>'),
    food: svg('<path d="M12 22V8" ' + ST + '/><path d="M12 9c-2.6-.4-4-2.2-4-4.8 2.6.4 4 2.2 4 4.8zm0 0c2.6-.4 4-2.2 4-4.8-2.6.4-4 2.2-4 4.8zm0 5c-2.6-.4-4-2.2-4-4.8 2.6.4 4 2.2 4 4.8zm0 0c2.6-.4 4-2.2 4-4.8-2.6.4-4 2.2-4 4.8zm0 5c-2.6-.4-4-2.2-4-4.8 2.6.4 4 2.2 4 4.8zm0 0c2.6-.4 4-2.2 4-4.8-2.6.4-4 2.2-4 4.8z" fill="currentColor"/>'),
    wood: svg('<rect x="2.5" y="7.5" width="15" height="9" rx="4.5" fill="currentColor"/><ellipse cx="18" cy="12" rx="3.5" ry="4.5" fill="currentColor" opacity=".55"/><ellipse cx="18" cy="12" rx="1.5" ry="2" fill="none" stroke="currentColor" stroke-width="1.2"/>'),
    stone: svg('<path d="M3 18.5l2.8-7.5 5.2-3.6 6.2 2.2 3.8 8.9z" fill="currentColor"/><path d="M11 7.4l1.6 5.2 7.6 5.9M5.8 11l6.8 1.6" stroke="rgba(0,0,0,.25)" stroke-width="1.2" fill="none"/>'),
    faith: svg('<circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" ' + ST + '/>'),
    pause: svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>'),
    scroll: svg('<path d="M6 3h11a2 2 0 0 1 2 2v12M6 3a2 2 0 0 0-2 2v2h4M6 3a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2h-11v2a2 2 0 0 1-2 2" ' + ST + '/><path d="M12 8h4M12 12h4" ' + ST + '/>'),
    stats: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" ' + ST + '/>'),
    sound: svg('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" ' + ST + '/>'),
    mute: svg('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6" ' + ST + '/>'),
    menu: svg('<path d="M4 6h16M4 12h16M4 18h16" ' + ST + '/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18" ' + ST + '/>'),
    eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" ' + ST + '/><circle cx="12" cy="12" r="3" fill="currentColor"/>'),
    tree: svg('<rect x="9" y="2.5" width="6" height="4.5" rx="1" fill="currentColor"/><rect x="2.5" y="16" width="6" height="4.5" rx="1" fill="currentColor"/><rect x="15.5" y="16" width="6" height="4.5" rx="1" fill="currentColor"/><path d="M12 7v4.5M5.5 16v-4.5h13V16" ' + ST + '/>'),
    rain: svg('<path d="M7 15.5a4.2 4.2 0 0 1 .3-8.4A5.8 5.8 0 0 1 18.4 8a3.8 3.8 0 0 1-.4 7.5z" fill="currentColor"/><path d="M8 18.5l-1 2.5M12 18.5l-1 2.5M16 18.5l-1 2.5" ' + ST + '/>'),
    growth: svg('<path d="M12 21.5v-9" ' + ST + '/><path d="M12 13C12 8.6 9 6 4 6c0 4.4 3 7 8 7zM12 10.5c0-4.4 3-7 8-7 0 4.4-3 7-8 7z" fill="currentColor"/>'),
    heal: svg('<path d="M12 21s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="currentColor"/><path d="M12 8.5v6M9 11.5h6" stroke="#1a1410" stroke-width="2" stroke-linecap="round"/>'),
    fertility: svg('<circle cx="12" cy="6.5" r="3.4" fill="currentColor"/><circle cx="17.2" cy="10.3" r="3.4" fill="currentColor"/><circle cx="15.2" cy="16.4" r="3.4" fill="currentColor"/><circle cx="8.8" cy="16.4" r="3.4" fill="currentColor"/><circle cx="6.8" cy="10.3" r="3.4" fill="currentColor"/><circle cx="12" cy="11.8" r="2.6" fill="#1a1410"/>'),
    lightning: svg('<path d="M13.5 2L4.5 13.5h6.2L9.5 22l9.5-12.2h-6.4z" fill="currentColor"/>'),
    meteor: svg('<circle cx="15.5" cy="15.5" r="5.5" fill="currentColor"/><path d="M2.5 3.5l8 8M6.5 2.5l6.5 6.5M2.5 7.5L9 14" ' + ST + '/>'),
    wolves: svg('<ellipse cx="12" cy="16.2" rx="4.6" ry="3.9" fill="currentColor"/><ellipse cx="5.6" cy="10.8" rx="2.1" ry="2.7" fill="currentColor"/><ellipse cx="18.4" cy="10.8" rx="2.1" ry="2.7" fill="currentColor"/><ellipse cx="9.2" cy="6.4" rx="2.1" ry="2.8" fill="currentColor"/><ellipse cx="14.8" cy="6.4" rx="2.1" ry="2.8" fill="currentColor"/>'),
    hand: svg('<path d="M8 11.5V5a1.6 1.6 0 0 1 3.2 0v6M11.2 5V3.9a1.6 1.6 0 0 1 3.2 0V11M14.4 5.4a1.6 1.6 0 0 1 3.2 0V12.5c0 5-2.9 8.5-7 8.5-3.1 0-5.1-1.9-6-4.8l-1.2-4a1.6 1.6 0 0 1 3-1l1.4 3.2" ' + ST + '/>'),
    hammer: svg('<path d="M14.5 5.5l4 4-2.5 2.5-4-4z" fill="currentColor"/><path d="M13 10.5L4.5 19" ' + ST + '/><path d="M12 6.5l3-3 3.5 1" ' + ST + '/>'),
    flame: svg('<path d="M12 22c-4.2 0-7-2.8-7-6.6 0-3.6 2.6-5.4 3.4-9.4 2 1.2 3.2 3 3.4 5.4 1-1 1.6-2.4 1.6-4.4 3 2.2 5.6 5 5.6 8.6 0 3.8-2.8 6.4-7 6.4z" fill="currentColor"/>'),
    heart: svg('<path d="M12 21s-8.5-5-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 16 12 21 12 21z" fill="currentColor"/>'),
    cross: svg('<path d="M10 3h4v5h5v4h-5v9h-4v-9H5V8h5z" fill="currentColor"/>'),
    star: svg('<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor"/>'),
    cloud: svg('<path d="M7 18.5a4.6 4.6 0 0 1 .3-9.2A6 6 0 0 1 18.7 10a4.3 4.3 0 0 1-.5 8.5z" fill="currentColor"/>'),
    sun: svg('<circle cx="12" cy="12" r="4.6" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" ' + ST + '/>'),
    leaf: svg('<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" fill="currentColor"/><path d="M5 19c3-4 6-7 10-9" stroke="#1a1410" stroke-width="1.5" fill="none"/>'),
    boat: svg('<path d="M3 15h18l-3 5H6z" fill="currentColor"/><path d="M12 3v11" ' + ST + '/><path d="M12.8 4c4 2.6 5.2 6 4.6 9h-4.6z" fill="currentColor"/>'),
    save: svg('<path d="M5 3h11l3 3v15H5z" ' + ST + '/><path d="M8 3v5h7V3M8 21v-6h8v6" ' + ST + '/>'),
    home: svg('<path d="M3 11l9-7 9 7v10H3z" fill="currentColor"/>'),
    grave: svg('<path d="M6 21v-10a6 6 0 0 1 12 0v10z" fill="currentColor"/><path d="M12 9v6M9.5 11.5h5" stroke="#1a1410" stroke-width="1.6"/>'),
  };
  const LOGICON = {
    hut: ['hammer', 'gold'], house: ['hammer', 'gold'], storehouse: ['hammer', 'gold'], farm: ['food', 'gold'], well: ['hammer', 'gold'], workshop: ['hammer', 'gold'],
    temple: ['faith', 'gold'], monument: ['star', 'gold'], campfire: ['flame', 'orange'], fire: ['flame', 'red'], bolt: ['lightning', 'blue'], meteor: ['meteor', 'red'],
    baby: ['heart', 'pink'], heart: ['heart', 'pink'], grave: ['grave', 'grey'], skull: ['grave', 'red'], era: ['star', 'gold'], pop: ['pop', 'gold'], settle: ['home', 'gold'],
    eye: ['eye', 'gold'], rain: ['rain', 'blue'], storm: ['cloud', 'blue'], sun: ['sun', 'orange'], wolf: ['wolves', 'brown'], deer: ['wolves', 'green'], sick: ['heal', 'green'],
    heal: ['heal', 'green'], food: ['leaf', 'green'], stone: ['stone', 'grey'], boat: ['boat', 'blue'], flower: ['fertility', 'pink'], info: ['leaf', 'green'],
  };
  UI.selected = null;
  let hudBuilt = false, tUpd = 0, tInsp = 0, lastLogCount = 0;

  // ------------------------------ setup ------------------------------
  UI.init = function () {
    $('#ic-pop').innerHTML = ICON.pop; $('#ic-food').innerHTML = ICON.food; $('#ic-wood').innerHTML = ICON.wood; $('#ic-stone').innerHTML = ICON.stone; $('#ic-faith').innerHTML = ICON.faith;
    $('#btn-pause').innerHTML = ICON.pause;
    $('#btn-chron').innerHTML = ICON.scroll; $('#btn-stats').innerHTML = ICON.stats; $('#btn-menu').innerHTML = ICON.menu;
    $('#btn-sound').innerHTML = G.Audio.sfxOn || G.Audio.musicOn ? ICON.sound : ICON.mute;
    // powers
    const bar = $('#powerbar');
    bar.innerHTML = G.POWERS.map(p => `<button class="pw ${p.good === true ? 'good' : p.good === false ? 'bad' : 'neutral'}" data-power="${p.id}"><span class="key">${p.key}</span><span class="pic">${ICON[p.id]}</span><span class="cost">${p.cost ? p.cost : 'grátis'}</span></button>`).join('');
    bar.addEventListener('click', e => { const b = e.target.closest('.pw'); if (!b) return; G.Audio.init(); UI.setPower(G.Input.power === b.dataset.power ? null : b.dataset.power); });
    bar.addEventListener('mouseover', e => { const b = e.target.closest('.pw'); if (!b) return; showPowerTip(b); G.Audio.play('hover'); });
    bar.addEventListener('mouseout', e => { const b = e.target.closest('.pw'); if (b && !b.contains(e.relatedTarget)) hideTip(); });
    // speed
    $('#speed').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; G.Audio.play('click'); UI.setSpeed(+b.dataset.speed); });
    $('#btn-chron').onclick = () => { G.Audio.play('click'); $('#chronicle').classList.toggle('collapsed'); };
    $('#chron-toggle').onclick = () => { G.Audio.play('click'); $('#chronicle').classList.toggle('collapsed'); };
    $('#btn-stats').onclick = () => { G.Audio.play('click'); UI.openStats(); };
    $('#prayer').onclick = () => {
      const p = G.S && G.S.prayer; if (!p) return;
      G.Audio.play('click'); G.Render.cam.follow = 0; G.Render.panTo(p.x, p.y);
      UI.setPower(G.Events.PRAYER[p.kind].powers[0]);
    };
    $('#btn-menu').onclick = () => { G.Audio.play('click'); UI.openPause(); };
    $('#btn-sound').onclick = () => { G.Audio.play('click'); UI.openSound(); };
    $('#chron-list').addEventListener('click', e => {
      const it = e.target.closest('.ch-item'); if (!it || it.dataset.x === undefined || it.dataset.x === '') return;
      G.Render.cam.follow = 0; G.Render.panTo(+it.dataset.x, +it.dataset.y); G.Audio.play('click');
    });
    $('#inspector').addEventListener('click', e => {
      const a = e.target.closest('[data-pid]');
      if (a) { const p = G.person(+a.dataset.pid); if (p) { UI.select(p); if (!p.dead) { G.Render.cam.follow = 0; G.Render.panTo(p.x, p.y); } } return; }
      const b = e.target.closest('[data-act]'); if (!b) return;
      G.Audio.play('click');
      if (b.dataset.act === 'close') UI.select(null);
      else if (b.dataset.act === 'follow') { const s = UI.selected; if (s && !s.dead) { G.Render.cam.follow = G.Render.cam.follow === s.id ? 0 : s.id; renderInspector(true); } }
      else if (b.dataset.act === 'tree') UI.openTree(UI.selected.id);
    });
    $('#modal-bg').addEventListener('click', e => { if (e.target.id === 'modal-bg') UI.closeModal(); });
    $('#modal').addEventListener('click', e => {
      const c = e.target.closest('[data-tree]'); if (c) { G.Audio.play('click'); UI.openTree(+c.dataset.tree); return; }
      const b = e.target.closest('[data-m]'); if (!b) return;
      G.Audio.play('click');
      const m = b.dataset.m;
      if (m === 'close' || m === 'resume') UI.closeModal();
      else if (m === 'save') { G.Save.save(); UI.closeModal(); }
      else if (m === 'load') { UI.closeModal(); G.Main.continueGame(); }
      else if (m === 'new') UI.confirm('Criar um novo mundo? O mundo atual será substituído.', () => G.Main.newGame());
      else if (m === 'mainmenu') { G.Save.save(true); UI.closeModal(); G.Main.toMenu(); }
      else if (m === 'help') UI.openHelp();
      else if (m === 'sfx') { G.Audio.setSfx(!G.Audio.sfxOn); UI.openSound(); }
      else if (m === 'music') { G.Audio.init(); G.Audio.setMusic(!G.Audio.musicOn); UI.openSound(); }
      else if (m === 'amb') { G.Audio.setAmb(!G.Audio.ambOn); UI.openSound(); }
      else if (m === 'yes') { const f = UI._confirm; UI.closeModal(); f && f(); }
      else if (m === 'person') { const p = G.person(+b.dataset.id); if (p) { UI.closeModal(); UI.select(p); if (!p.dead) G.Render.panTo(p.x, p.y); } }
    });
    document.querySelectorAll('button').forEach(b => b.addEventListener('mouseenter', () => G.Audio.play('hover')));
    hudBuilt = true;
  };
  UI.showHUD = function (on) { $('#hud').classList.toggle('hidden', !on); if (on) { rebuildChronicle(); UI.update(1, true); } };

  UI.setSpeed = function (s) {
    G.speed = s;
    document.querySelectorAll('#speed button').forEach(b => b.classList.toggle('on', +b.dataset.speed === s));
    $('#paused-badge').classList.toggle('hidden', s !== 0);
  };
  UI.setPower = function (id) {
    G.Input.power = id;
    document.querySelectorAll('.pw').forEach(b => b.classList.toggle('sel', b.dataset.power === id));
    const hint = $('#power-hint');
    if (id) {
      const p = G.Powers.byId(id);
      hint.innerHTML = id === 'hand' ? `<b>${p.name}</b> — clique e segure sobre alguém; solte para largar, arraste rápido para arremessar · <kbd>Esc</kbd> cancela`
        : `<b>${p.name}</b> — clique no mapa para lançar · <kbd>botão direito</kbd> ou <kbd>Esc</kbd> cancela`;
      hint.classList.remove('hidden');
      G.Audio.play('power');
    } else { hint.classList.add('hidden'); G.Render.preview = null; }
    document.body.classList.toggle('casting', !!id && id !== 'hand');
    document.body.classList.toggle('handmode', id === 'hand');
  };

  // ------------------------------ tooltips ------------------------------
  function showPowerTip(b) {
    const p = G.Powers.byId(b.dataset.power);
    const tip = $('#tooltip');
    const afford = G.S && G.S.faith >= p.cost;
    tip.innerHTML = `<div class="tt-title">${ICON[p.id]}<b>${p.name}</b><span class="tt-key">${p.key}</span></div><div class="tt-desc">${p.desc}</div><div class="tt-cost ${afford ? '' : 'no'}">${ICON.faith}${p.cost ? p.cost + ' de fé' : 'Grátis'}${afford ? '' : ' — fé insuficiente'}</div>`;
    tip.classList.remove('hidden');
    const r = b.getBoundingClientRect();
    const tw = tip.offsetWidth;
    tip.style.left = Math.max(8, Math.min(innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px';
    tip.style.top = (r.top - tip.offsetHeight - 12) + 'px';
  }
  function hideTip() { $('#tooltip').classList.add('hidden'); }
  UI.hideTip = hideTip;

  // ------------------------------ per-frame ------------------------------
  UI.update = function (dt, force) {
    if (!hudBuilt || !G.S) return;
    tUpd -= dt; tInsp -= dt;
    if (tUpd > 0 && !force) return;
    tUpd = 0.2;
    const S = G.S; const pop = S.villagers.size; const cap = G.Village.cap();
    setText('#v-pop', pop);
    setText('#v-food', Math.floor(S.stock.food)); setText('#c-food', '/' + cap);
    setText('#v-wood', Math.floor(S.stock.wood)); setText('#c-wood', '/' + cap);
    setText('#v-stone', Math.floor(S.stock.stone)); setText('#c-stone', '/' + cap);
    setText('#v-faith', Math.floor(S.faith));
    setText('#r-faith', '+' + G.Village.faithRate.toFixed(2) + '/s');
    $('#res-food').classList.toggle('warn', S.stock.food < pop * 0.8);
    setText('#day', 'Dia ' + S.day);
    setText('#era', G.ERAS[S.era] || '');
    const [pt, pk] = G.Village.perception();
    const pe = $('#perception'); pe.innerHTML = `Eles te veem como <b class="pc-${pk}">${pt}</b>`;
    drawDial();
    document.querySelectorAll('.pw').forEach(b => { const p = G.Powers.byId(b.dataset.power); b.classList.toggle('poor', S.faith < p.cost); });
    const pr = $('#prayer');
    if (S.prayer) {
      const P = G.Events.PRAYER[S.prayer.kind]; const set = S.settlements.get(S.prayer.set);
      const pw = G.Powers.byId(P.powers[0]);
      const html = `<i class="ci gold">${ICON.eye}</i><span>${P.ask}${set ? ' em <b>' + esc(set.name) + '</b>' : ''} — use <b>${P.powers.map(k => G.Powers.byId(k).name).join(' ou ')}</b></span><span class="pr-bar"><span style="width:${Math.max(0, S.prayer.t / S.prayer.max * 100)}%"></span></span>`;
      if (pr.dataset.k !== S.prayer.kind + S.prayer.set) { pr.dataset.k = S.prayer.kind + S.prayer.set; pr.innerHTML = html; pr.classList.remove('hidden'); }
      else pr.querySelector('.pr-bar span').style.width = Math.max(0, S.prayer.t / S.prayer.max * 100) + '%';
      document.querySelectorAll('.pw').forEach(b => b.classList.toggle('asked', P.powers.includes(b.dataset.power)));
    } else if (!pr.classList.contains('hidden')) { pr.classList.add('hidden'); pr.dataset.k = ''; document.querySelectorAll('.pw').forEach(b => b.classList.remove('asked')); }
    const w = S.weather;
    const wl = $('#weather'); const txt = w.storm > 0 ? 'Tempestade' : w.drought > 0 ? 'Seca' : S.clouds.some(c => c.kind === 'natural') ? 'Chuvisco' : '';
    wl.textContent = txt; wl.classList.toggle('hidden', !txt);
    if (S.history.length !== lastLogCount) rebuildChronicle();
    if (UI.selected && tInsp <= 0) { tInsp = 0.25; renderInspector(); }
  };
  function setText(sel, v) { const e = $(sel); if (e && e.textContent !== String(v)) e.textContent = v; }
  function drawDial() {
    const c = $('#dial'); if (!c) return; const x = c.getContext('2d');
    const S = G.S; const d = 2; const W = 36 * d;
    if (c.width !== W) { c.width = W; c.height = W; }
    x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, 36, 36);
    const nf = G.Render.nightness();
    const g = x.createLinearGradient(0, 0, 0, 36);
    g.addColorStop(0, G.rgb(G.lerpColor([120, 190, 235], [20, 30, 70], nf))); g.addColorStop(1, G.rgb(G.lerpColor([240, 210, 160], [40, 40, 90], nf)));
    x.fillStyle = g; x.beginPath(); x.arc(18, 18, 16, 0, Math.PI * 2); x.fill();
    const a = S.time * Math.PI * 2 - Math.PI * 0.62;
    const sx = 18 + Math.cos(a - Math.PI / 2) * 10, sy = 22 + Math.sin(a - Math.PI / 2) * 10;
    const night = G.isNight();
    x.fillStyle = night ? '#f2f0e0' : '#ffd24a';
    x.beginPath(); x.arc(sx, sy, 4, 0, Math.PI * 2); x.fill();
    if (night) { x.fillStyle = G.rgb(G.lerpColor([120, 190, 235], [20, 30, 70], nf)); x.beginPath(); x.arc(sx + 1.8, sy - 1.2, 3.4, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = 'rgba(40,60,30,0.85)'; x.fillRect(2, 24, 32, 12);
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1.2; x.beginPath(); x.arc(18, 18, 16.4, 0, Math.PI * 2); x.stroke();
  }

  // ------------------------------ chronicle ------------------------------
  function logItem(e) {
    const [ic, col] = LOGICON[e.ic] || LOGICON.info;
    return `<div class="ch-item ${e.x !== undefined ? 'loc' : ''}" data-x="${e.x !== undefined ? e.x : ''}" data-y="${e.y !== undefined ? e.y : ''}"><span class="ch-day">Dia ${e.d}</span><i class="ci ${col}">${ICON[ic]}</i><span class="ch-txt">${esc(e.txt)}</span></div>`;
  }
  function rebuildChronicle() {
    const S = G.S; if (!S) return;
    lastLogCount = S.history.length;
    const list = S.history.slice(-90).reverse();
    $('#chron-list').innerHTML = list.map(logItem).join('') || '<div class="ch-empty">A história ainda não começou.</div>';
    $('#chron-count').textContent = S.history.length;
  }
  UI.onLog = function (e) { /* rebuilt lazily in update */ if (G.Main && G.Main.mode === 'game') { const el = $('#chronicle'); if (el.classList.contains('collapsed')) { el.classList.add('ping'); setTimeout(() => el.classList.remove('ping'), 900); } } };

  // ------------------------------ notices & toasts ------------------------------
  UI.notice = function (text, icon) {
    if (!G.Main || G.Main.mode === 'menu') return;
    const box = $('#notices');
    const [ic, col] = LOGICON[icon] || LOGICON.info;
    const d = document.createElement('div'); d.className = 'notice';
    d.innerHTML = `<i class="ci ${col}">${ICON[ic] || ICON.leaf}</i><span>${esc(text)}</span>`;
    box.appendChild(d);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    setTimeout(() => d.classList.add('out'), 6500);
    setTimeout(() => d.remove(), 7400);
  };
  const toastQ = []; let toastBusy = false;
  UI.toast = function (title, sub, icon) {
    if (!G.Main || G.Main.mode === 'menu') return;
    toastQ.push([title, sub, icon]); while (toastQ.length > 3) toastQ.shift(); if (!toastBusy) nextToast();
  };
  function nextToast() {
    const t = toastQ.shift(); if (!t) { toastBusy = false; return; }
    toastBusy = true;
    const [ic, col] = LOGICON[t[2]] || ['star', 'gold'];
    const el = $('#toast');
    el.innerHTML = `<i class="ci ${col}">${ICON[ic] || ICON.star}</i><div><div class="t-title">${esc(t[0])}</div><div class="t-sub">${esc(t[1])}</div></div>`;
    el.classList.remove('hidden', 'out'); void el.offsetWidth; el.classList.add('in');
    setTimeout(() => { el.classList.add('out'); el.classList.remove('in'); }, 4200);
    setTimeout(() => { el.classList.add('hidden'); nextToast(); }, 4900);
  }

  // ------------------------------ inspector ------------------------------
  UI.select = function (o) {
    UI.selected = o;
    if (!o && G.Render.cam.follow) G.Render.cam.follow = 0;
    $('#inspector').classList.toggle('hidden', !o);
    if (o) { G.Audio.play('select'); renderInspector(true); }
  };
  function bar(label, v, cls, txt) {
    return `<div class="bar"><span class="bl">${label}</span><span class="bt"><span class="bf ${cls}" style="width:${G.clamp(v, 0, 100)}%"></span></span><span class="bv">${txt !== undefined ? txt : Math.round(v) + '%'}</span></div>`;
  }
  const plink = id => { const p = G.person(id); return p ? `<a data-pid="${p.id}" class="${p.dead ? 'dead' : ''}">${esc(p.name)}${p.dead ? ' †' : ''}</a>` : null; };
  function portrait(v) {
    const c = document.createElement('canvas'); const d = 2; c.width = 64 * d; c.height = 64 * d;
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    const g = x.createRadialGradient(32, 28, 4, 32, 32, 34); g.addColorStop(0, '#f4e6c8'); g.addColorStop(1, '#b89a6a');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    x.save(); x.translate(32, 50); x.scale(3.4, 3.4);
    const pv = Object.assign({}, v, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null });
    if (v.dead) { pv.role = v.role; pv.skin = '#c8c0b0'; pv.hair = '#9a948a'; pv.kidCloth = '#8a8a8a'; }
    if (pv.age >= 2) G.Art.villager(x, pv, 0, 0, 0, false);
    x.restore();
    return c;
  }
  let lastPortraitKey = '';
  function renderInspector(full) {
    const o = UI.selected; const el = $('#inspector'); if (!o) return;
    const S = G.S;
    let html = '';
    if (o.type && G.BDEF[o.type]) html = buildingHTML(o);
    else if (o.kind) {
      if (!S.animals.has(o.id)) { UI.select(null); return; }
      const d = G.Animals.DEF[o.kind];
      const st = o.dead ? 'Morto' : o.state === 'flee' ? 'Fugindo' : o.state === 'chase' ? 'Caçando!' : o.state === 'eat' ? 'Comendo' : o.state === 'leave' ? 'Indo embora' : o.state === 'charge' ? 'Atacando!' : o.state === 'wander' ? 'Vagando' : 'Pastando';
      html = `<div class="insp-head"><div class="insp-title"><h3>${d.name}${o.summoned ? ' (invocado)' : ''}</h3><div class="sub">${o.kind === 'wolf' ? 'Predador' : 'Animal selvagem · fonte de alimento'}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
        ${bar('Vida', o.hp / o.maxHp * 100, 'hp')}<div class="doing">Atualmente: <b>${st}</b></div>`;
    } else {
      const p = o.dead ? o : S.villagers.get(o.id);
      if (!p) { const d = S.dead.get(o.id); if (d) { UI.selected = d; return renderInspector(true); } UI.select(null); return; }
      html = personHTML(p);
    }
    el.innerHTML = html;
    if (!o.type && !o.kind) {
      const holder = el.querySelector('.portrait');
      if (holder) holder.appendChild(portrait(o.dead ? o : S.villagers.get(o.id)));
    }
  }
  function personHTML(v) {
    const S = G.S;
    const f = v.g === 'f';
    const age = Math.floor(v.age);
    let fam = [];
    const parents = [plink(v.mother), plink(v.father)].filter(Boolean);
    if (parents.length) fam.push(`${f ? 'Filha' : 'Filho'} de ${parents.join(' e ')}`);
    if (v.partner) { const l = plink(v.partner); if (l) fam.push(`${f ? 'Parceira' : 'Parceiro'} de ${l}`); }
    else if (v.widow) { const l = plink(v.widow); if (l) fam.push(`${f ? 'Viúva' : 'Viúvo'} de ${l}`); }
    const kids = (v.kids || []).map(plink).filter(Boolean);
    if (kids.length) fam.push(`${kids.length > 1 ? 'Filhos' : (G.person(v.kids[0]) && G.person(v.kids[0]).g === 'f' ? 'Filha' : 'Filho')}: ${kids.join(', ')}`);
    const traits = (v.traits || []).map(t => `<span class="trait">${G.traitName(v, t)}</span>`).join('');
    if (v.dead) {
      const cause = { old: 'Velhice', hunger: 'Fome', wolf: 'Atacad' + (f ? 'a' : 'o') + ' por lobos', boar: 'Atacad' + (f ? 'a' : 'o') + ' por um javali', fire: 'Incêndio', lightning: 'Raio', meteor: 'Meteoro', sick: 'Doença', fall: 'Queda', drown: 'Afogamento' }[v.cause] || 'Desconhecida';
      return `<div class="insp-head"><div class="portrait dead"></div><div class="insp-title"><h3>${esc(v.name)} †</h3><div class="sub">Viveu ${age} anos · Dia ${Math.max(1, Math.round(v.born))} – Dia ${v.died}</div><div class="traits">${traits}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
        <div class="doing">Causa da morte: <b>${cause}</b></div>
        <div class="family">${fam.map(x => `<div>${x}</div>`).join('') || '<div class="muted">Sem família conhecida.</div>'}</div>
        <div class="btns"><button data-act="tree">${ICON.tree} Árvore genealógica</button></div>`;
    }
    const role = G.roleName(v);
    const set = S.settlements.get(v.set);
    const home = S.buildings.get(v.home);
    const status = [];
    if (v.preg > 0) status.push('<span class="st pink">Grávida</span>');
    if (v.sick > 0) status.push('<span class="st green">Doente</span>');
    if (v.mourn > 0) status.push('<span class="st grey">De luto</span>');
    if (v.fear > 55) status.push('<span class="st red">Aterrorizad' + (f ? 'a' : 'o') + '</span>');
    if (v.hunger >= 95) status.push('<span class="st red">Faminto</span>');
    if (!v.home && v.age >= 16) status.push('<span class="st grey">Sem casa</span>');
    const feats = [];
    if (v.st.wood) feats.push(`${v.st.wood} de madeira`); if (v.st.food) feats.push(`${v.st.food} de comida`); if (v.st.stone) feats.push(`${v.st.stone} de pedra`); if (v.st.built) feats.push(`${v.st.built} ${v.st.built > 1 ? 'obras concluídas' : 'obra concluída'}`);
    const following = G.Render.cam.follow === v.id;
    return `<div class="insp-head"><div class="portrait"></div><div class="insp-title"><h3>${esc(v.name)}</h3><div class="sub">${age} ${age === 1 ? 'ano' : 'anos'} · ${role}</div><div class="traits">${traits}</div></div><button class="x" data-act="close">${ICON.close}</button></div>
      <div class="bars">${bar('Vida', v.hp, 'hp')}${bar('Fome', v.hunger, 'hunger')}${bar('Energia', v.energy, 'energy')}${bar('Devoção', v.devotion, 'dev')}${bar('Medo', v.fear, 'fear')}</div>
      ${status.length ? `<div class="status">${status.join('')}</div>` : ''}
      <div class="family">${fam.map(x => `<div>${x}</div>`).join('') || '<div class="muted">Sem laços familiares ainda.</div>'}</div>
      <div class="doing">Atualmente: <b>${esc(G.Vg.taskText(v))}</b></div>
      <div class="meta">${set ? esc(set.name) : ''}${home ? ' · mora numa ' + (home.type === 'hut' ? 'cabana' : 'casa') : ''}${feats.length ? '<br>Contribuiu com ' + feats.join(', ') : ''}</div>
      <div class="btns"><button data-act="follow" class="${following ? 'on' : ''}">${ICON.eye} ${following ? 'Seguindo' : 'Seguir'}</button><button data-act="tree">${ICON.tree} Família</button></div>`;
  }
  function buildingHTML(b) {
    const S = G.S; const def = G.BDEF[b.type];
    if (!S.buildings.has(b.id)) { UI.select(null); return ''; }
    const set = S.settlements.get(b.set);
    let body = '';
    let title = G.Village.buildName(b);
    if (b.type === 'ruin') { title = 'Ruínas'; body = `<div class="doing">Restos de ${G.BDEF[b.origType] ? G.BDEF[b.origType].name.toLowerCase() : 'uma construção'}. O mato vai tomar conta.</div>`; }
    else if (!b.built) {
      const al = G.Vg.allowedProgress(b);
      const miss = [];
      if (b.need.wood > 0) miss.push(`${Math.ceil(b.need.wood)} madeira`);
      if (b.need.stone > 0) miss.push(`${Math.ceil(b.need.stone)} pedra`);
      let builders = 0; for (const v of S.villagers.values()) if (v.task && v.task.type === 'build' && v.task.id === b.id) builders++;
      body = `${bar('Obra', b.progress * 100, 'energy')}${bar('Material', al * 100, 'dev')}<div class="doing">${miss.length ? 'Faltam: <b>' + miss.join(', ') + '</b>' : 'Materiais completos.'}<br>${builders ? builders + (builders > 1 ? ' pessoas trabalhando' : ' pessoa trabalhando') : 'Ninguém trabalhando agora.'}</div>`;
    } else {
      body = `<div class="desc">${G.BDESC[b.type] || ''}</div>`;
      if (b.hp < b.maxHp && b.type !== 'cemetery') body += bar('Estrutura', b.hp / b.maxHp * 100, 'hp');
      if (def.housing) {
        const res = [...S.villagers.values()].filter(v => v.home === b.id);
        body += `<div class="family"><div>Moradores (${res.length}/${def.housing}):</div><div>${res.map(v => plink(v.id)).join(', ') || '<span class="muted">vazia</span>'}</div></div>`;
      }
      if (b.type === 'farm') {
        const st = [0, 0, 0, 0]; for (const c of b.crops) st[c.s]++;
        body += `<div class="doing">${st[3]} prontos para colher · ${st[1] + st[2]} crescendo · ${st[0]} por plantar</div>`;
      }
      if (b.type === 'storehouse' || b.type === 'campfire') body += `<div class="doing">Capacidade de estoque: <b>${G.Village.cap()}</b> de cada recurso.</div>`;
      if (b.type === 'temple') body += `<div class="doing">Gera fé continuamente. Os sacerdotes rezam aqui.</div>`;
      if (b.type === 'cemetery') {
        const gs = b.graves.map(id => S.dead.get(id)).filter(Boolean);
        body += `<div class="graves">${gs.map(p => `<a data-pid="${p.id}" class="dead">${esc(p.name)} <span>${Math.floor(p.age)} anos · dia ${p.died}</span></a>`).join('') || '<span class="muted">Ninguém ainda.</span>'}</div>`;
      }
    }
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(title)}</h3><div class="sub">${set ? esc(set.name) : ''}${!b.built && b.type !== 'ruin' ? ' · em construção' : ''}</div></div><button class="x" data-act="close">${ICON.close}</button></div>${body}`;
  }

  // ------------------------------ modals ------------------------------
  UI.openModal = function (html, cls) {
    $('#modal').className = 'panel ' + (cls || '');
    $('#modal').innerHTML = html;
    $('#modal-bg').classList.remove('hidden');
    G.Main.modalOpen = true;
  };
  UI.closeModal = function () { $('#modal-bg').classList.add('hidden'); G.Main.modalOpen = false; };
  UI.confirm = function (text, yes) {
    UI._confirm = yes;
    UI.openModal(`<h2>Tem certeza?</h2><p>${esc(text)}</p><div class="mbtns"><button data-m="close">Cancelar</button><button class="primary" data-m="yes">Confirmar</button></div>`, 'small');
  };
  UI.openPause = function () {
    UI.openModal(`<h2>Pausa divina</h2><p class="muted">O mundo é salvo automaticamente.</p>
      <div class="mlist"><button class="primary" data-m="resume">Continuar</button><button data-m="save">${ICON.save} Salvar agora</button><button data-m="load">Carregar último save</button><button data-m="new">Novo mundo</button><button data-m="help">Como jogar</button><button data-m="mainmenu">Menu principal</button></div>
      <div class="keys"><span><kbd>Espaço</kbd> pausar</span><span><kbd>1</kbd>–<kbd>8</kbd> poderes</span><span><kbd>WASD</kbd> mover</span><span><kbd>F</kbd> seguir</span><span><kbd>H</kbd> crônica</span><span><kbd>+</kbd>/<kbd>−</kbd> velocidade</span></div>`, 'small');
  };
  UI.openSound = function () {
    const A = G.Audio;
    UI.openModal(`<h2>Som</h2><div class="mlist">
      <button data-m="sfx" class="${A.sfxOn ? 'on' : ''}">Efeitos: <b>${A.sfxOn ? 'ligados' : 'desligados'}</b></button>
      <button data-m="amb" class="${A.ambOn ? 'on' : ''}">Ambiente: <b>${A.ambOn ? 'ligado' : 'desligado'}</b></button>
      <button data-m="music" class="${A.musicOn ? 'on' : ''}">Música: <b>${A.musicOn ? 'ligada' : 'desligada'}</b></button>
      <button class="primary" data-m="close">Fechar</button></div>`, 'small');
    $('#btn-sound').innerHTML = A.sfxOn || A.musicOn || A.ambOn ? ICON.sound : ICON.mute;
  };
  UI.openHelp = function () {
    UI.openModal(`<h2>Como jogar</h2>
      <div class="help">
      <p class="lead">Você é o deus de uma pequena ilha. Os habitantes vivem por conta própria: coletam, constroem, se apaixonam, têm filhos, envelhecem e morrem. <b>Você não dá ordens</b> — você interfere.</p>
      <h4>Câmera</h4><ul><li><b>Arrastar</b> com o mouse (ou botão direito) move o mapa · <b>WASD</b>/setas também</li><li><b>Roda do mouse</b> dá zoom · <b>clique</b> num habitante ou construção para ver detalhes · <b>duplo clique</b> segue alguém</li></ul>
      <h4>Poderes divinos</h4><ul>
        <li><b>1 Chuva</b> — rega plantações, apaga incêndios, encerra secas</li>
        <li><b>2 Crescimento</b> — árvores, frutos e plantações crescem na hora</li>
        <li><b>3 Cura</b> — cura feridos e doentes</li>
        <li><b>4 Fertilidade</b> — dois dias de colheitas e nascimentos abundantes</li>
        <li><b>5 Raio</b> · <b>6 Meteoro</b> · <b>7 Matilha</b> — destruição, medo… e às vezes pedra</li>
        <li><b>8 Mão Divina</b> — pegue alguém, solte ou arremesse</li></ul>
      <h4>Fé</h4><p>Poderes custam <b>fé</b>. A fé nasce da <b>devoção</b> (quando você ajuda) e do <b>medo</b> (quando você castiga). Medo também rende fé, mas deixa o povo lento, triste e menos fértil — e quem perde parentes para a sua fúria perde a devoção. Templos e sacerdotes geram fé constante.</p>
      <h4>Preces</h4><p>Em momentos difíceis — seca, incêndio, doença, fome, lobos — a vila <b>reza pedindo algo específico</b>. Um aviso dourado aparece acima da barra de poderes: clique nele para ir até lá. Atender as preces faz a devoção disparar; ignorá-las tem um preço.</p>
      <h4>A vila evolui sozinha</h4><p>Fogueira → cabanas → armazém → fazendas → oficina e casas de pedra → templo → monumento. Com gente o bastante, grupos partem para fundar novos assentamentos.</p>
      <h4>Dicas</h4><ul><li>Clique nos eventos da <b>Crônica</b> para ir até onde aconteceram.</li><li>Na seca, a chuva vale ouro. Num incêndio, também.</li><li>Tudo é salvo automaticamente no navegador.</li></ul>
      </div><div class="mbtns"><button class="primary" data-m="close">Entendi</button></div>`, 'wide');
  };
  UI.openStats = function () {
    const S = G.S; const st = S.stats;
    let homes = 0, bld = 0; for (const b of S.buildings.values()) { if (b.built && G.BDEF[b.type].housing) homes++; if (b.built && b.type !== 'cemetery' && b.type !== 'ruin') bld++; }
    const pw = st.powers || {};
    const card = (l, v, s) => `<div class="stat"><div class="sv">${v}</div><div class="sl">${l}</div>${s ? `<div class="ss">${s}</div>` : ''}</div>`;
    UI.openModal(`<h2>Estatísticas da civilização</h2>
      <canvas id="pop-chart" width="720" height="140"></canvas>
      <div class="stats">
      ${card('População atual', S.villagers.size)}${card('Máxima histórica', st.maxPop)}${card('Idade da civilização', (S.day - 1) + ' anos')}
      ${card('Nascimentos', st.births)}${card('Mortes', st.deaths)}${card('Mortos por você', st.godKills, st.godKills ? 'mortes por ações divinas' : 'mãos limpas… por enquanto')}
      ${card('Casas', homes)}${card('Construções', bld)}${card('Assentamentos', S.settlements.size)}
      ${card('Comida produzida', Math.floor(st.foodProduced))}${card('Madeira coletada', Math.floor(st.woodProduced))}${card('Pedra extraída', Math.floor(st.stoneProduced))}
      ${card('Maior idade', Math.floor(st.oldest) + ' anos', esc(st.oldestName || ''))}${card('Árvores cortadas', st.treesFelled)}${card('Imigrantes', st.immigrants)}
      ${card('Fé gasta', Math.floor(st.faithSpent))}${card('Poderes usados', Object.values(pw).reduce((a, b) => a + b, 0), Object.entries(pw).map(([k, n]) => (G.Powers.byId(k) || { name: k }).name + ' ' + n).join(' · '))}${card('Era', G.ERAS[S.era])}
      </div><div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide');
    drawPopChart();
  };
  function drawPopChart() {
    const c = $('#pop-chart'); if (!c) return; const x = c.getContext('2d');
    const S = G.S; const h = (S.popHist || []).concat([S.villagers.size]);
    const W = c.width, H = c.height;
    x.clearRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(0, 0, W, H);
    const max = Math.max(10, ...h);
    x.strokeStyle = 'rgba(255,255,255,0.08)'; x.lineWidth = 1;
    for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(0, H * k / 4); x.lineTo(W, H * k / 4); x.stroke(); }
    if (h.length < 2) { x.fillStyle = 'rgba(255,255,255,0.5)'; x.font = '14px Nunito, sans-serif'; x.fillText('O gráfico aparece a partir do segundo dia.', 20, H / 2); return; }
    const px = k => 10 + (W - 20) * k / (h.length - 1), py = v => H - 12 - (H - 30) * v / max;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(245,200,107,0.45)'); g.addColorStop(1, 'rgba(245,200,107,0)');
    x.beginPath(); x.moveTo(px(0), H); h.forEach((v, k) => x.lineTo(px(k), py(v))); x.lineTo(px(h.length - 1), H); x.closePath(); x.fillStyle = g; x.fill();
    x.beginPath(); h.forEach((v, k) => k ? x.lineTo(px(k), py(v)) : x.moveTo(px(k), py(v))); x.strokeStyle = '#f5c86b'; x.lineWidth = 2; x.stroke();
    x.fillStyle = 'rgba(255,240,210,0.8)'; x.font = '12px Nunito, sans-serif'; x.fillText('População por dia · pico ' + Math.max(...h), 14, 18);
  }
  UI.openTree = function (id) {
    const S = G.S; const p = G.person(id); if (!p) return;
    const card = (q, big) => {
      if (!q) return '';
      const f = q.g === 'f';
      const sub = q.dead ? `† aos ${Math.floor(q.age)} · dia ${q.died}` : `${Math.floor(q.age)} anos · ${G.roleName(q)}`;
      return `<button class="ft-card ${f ? 'f' : 'm'} ${q.dead ? 'dead' : ''} ${big ? 'big' : ''}" data-tree="${q.id}"><b>${esc(q.name)}</b><span>${sub}</span></button>`;
    };
    const P = i => G.person(i);
    const parents = [P(p.mother), P(p.father)].filter(Boolean);
    const gp = []; for (const q of parents) { if (P(q.mother)) gp.push(P(q.mother)); if (P(q.father)) gp.push(P(q.father)); }
    const kids = (p.kids || []).map(P).filter(Boolean);
    const gk = []; for (const k of kids) for (const i of (k.kids || [])) { const q = P(i); if (q) gk.push(q); }
    const sibs = [];
    const all = [...S.villagers.values(), ...S.dead.values()];
    for (const q of all) if (q.id !== p.id && ((p.mother && q.mother === p.mother) || (p.father && q.father === p.father))) sibs.push(q);
    const partner = P(p.partner) || P(p.widow);
    const row = (label, list) => list.length ? `<div class="ft-row"><label>${label}</label><div class="ft-cards">${list.map(q => card(q)).join('')}</div></div>` : '';
    UI.openModal(`<h2>Família de ${esc(p.name)}</h2>
      <div class="ft">
      ${row('Avós', gp)}${row('Pais', parents)}
      <div class="ft-row main"><label>${p.dead ? 'Em memória' : 'Hoje'}</label><div class="ft-cards">${card(p, true)}${partner ? '<span class="ft-heart">' + ICON.heart + '</span>' + card(partner, true) : ''}</div></div>
      ${row('Irmãos', sibs)}${row('Filhos', kids)}${row('Netos', gk)}
      ${!gp.length && !parents.length && !kids.length && !sibs.length ? '<p class="muted center">Uma árvore ainda sem galhos. Talvez um dia.</p>' : ''}
      </div><div class="mbtns"><button data-m="person" data-id="${p.id}">Ver ${esc(p.name)}</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide');
  };
})(window.G);
