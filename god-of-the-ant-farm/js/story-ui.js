'use strict';
// ============================================================
//  Stories, presented: the panel (a book of stories, not a quest log), the card that slides in when
//  a story begins, climbs or ends, the map of a journey with its real trail, the line on a person's
//  card, the gold quill over those who carry a story, the old telling finished stories by the fire,
//  and the shots the cinema may take.
//  (Presentation only: what a story IS lives in stories.js and story-lib.js.)
// ============================================================
(function (G) {
  const St = G.Stories;
  const P = id => (id ? G.person(id) : null);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const trim = (s, n) => (s && s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s || '');
  const facName = id => { const f = G.Fac.get(id); return f ? f.name : ''; };
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : ''; };
  const ROLE = { victim: 'Por quem', target: 'O alvo', captive: 'Cativ{o}', teller: 'Quem contou', lost: 'Por quem reza', ruler: 'Governante', antes: 'Carregou antes', comp: 'Foi junto' };
  const TONE_CLS = { feliz: 'happy', tragico: 'tragic', agridoce: 'bitter', sereno: 'calm' };
  // each kind of story has its colour (the banner, the strip, the seal)
  const HUE = { vinganca: '#c8574b', resgate: '#d89a4a', volta: '#7fb36a', reconquista: '#a476d6', sonho: '#5ea9dc', peregrinacao: '#e3c46c', cacada: '#c27a3a', 'fera-rara': '#d8d2c4', caravana: '#c9a050', palacio: '#e6b84a', perola: '#6a7a9a', ninho: '#e8a0a8', migracao: '#b8a060', 'guerra-rica': '#a0603e' };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV'];
  const ic = name => (G.ICON && G.ICON[name]) || (G.ICON && G.ICON.saga) || '';
  const $ = s => document.querySelector(s);
  St._ui = { open: false, view: 'list', tab: 'ativas', id: 0 };

  // ============================== pieces ==============================
  // a little portrait of a person (the same drawing as the person's card)
  function portrait(v, size) {
    const c = document.createElement('canvas'); const d = Math.min(2, window.devicePixelRatio || 1) * 1.5; const S = size || 56;
    c.width = 64 * d; c.height = 64 * d; c.style.width = S + 'px'; c.style.height = S + 'px'; c.className = 'sg-face';
    const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    const g = x.createRadialGradient(32, 26, 4, 32, 32, 36); g.addColorStop(0, '#f2e2c0'); g.addColorStop(1, '#a88c5c');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    if (v) {
      x.save(); x.translate(32, 52); x.scale(3.3, 3.3);
      const pv = Object.assign({}, v, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null });
      if (v.dead) { pv.skin = '#c8c0b0'; pv.hair = '#9a948a'; pv.kidCloth = '#8a8a8a'; }
      try { if (pv.age >= 2) G.Art.villager(x, pv, 0, 0, 0, false); } catch { /* a portrait is never worth an error */ }
      x.restore();
    }
    return c;
  }
  function who(p, plain) {
    if (!p) return 'alguém';
    if (p.dead) { const a = Math.floor(p.age || 0); return `${plain ? esc(p.name) + ' · ' : ''}morreu${a ? ` aos ${a} ${a === 1 ? 'ano' : 'anos'}` : ''}${p.fac ? ' · ' + esc(facName(p.fac)) : ''}`; }
    const f = G.Fac.idOfV(p); const a = Math.floor(p.age);
    return `${plain ? esc(p.name) + ' · ' : ''}${a} ${a === 1 ? 'ano' : 'anos'}${p.captive ? ' · cativ' + (p.g === 'f' ? 'a' : 'o') : ''}${f ? ' · ' + esc(facName(f)) : ''}`;
  }
  const endTxt = s => `${St.END[s.end.k] || s.end.k} · ${St.TONE[s.end.tone] || s.end.tone}`;
  function stageOf(s) { const d = St.DEF[s.type]; if (!d.stages) return null; let k = d.stage ? d.stage(s) : 0; const failed = k < 0; if (failed) k = s.data.stg || 0; return { list: d.stages, k: Math.max(0, Math.min(d.stages.length - 1, k)), failed }; }
  function stageDots(s) {
    const g = stageOf(s); if (!g) return '';
    return `<div class="sg-dots">${g.list.map((x, i) => `<i class="${i < g.k ? 'done' : i === g.k ? (g.failed ? 'fail' : s.st === 'fim' ? 'done' : 'now') : ''}" title="${esc(x[1])}"></i>`).join('')}<span>${esc(g.failed ? 'interrompida em: ' + g.list[g.k][1] : g.list[g.k][1])}</span></div>`;
  }
  function stageTrack(s) {
    const g = stageOf(s); if (!g) return '';
    return `<ol class="sg-track">${g.list.map((x, i) => `<li class="${i < g.k ? 'done' : i === g.k ? (g.failed ? 'fail' : s.st === 'fim' ? 'done' : 'now') : ''}"><i></i><span>${esc(x[1])}</span></li>`).join('')}</ol>`;
  }
  const headingOf = ch => (ch.k === 'fim' ? 'Desfecho' : ch.k === 'heranca' ? 'A herança' : ch.k === 'epilogo' ? 'Depois' : (St.BEATS[ch.k] && St.BEATS[ch.k].h) || '');
  const lastCh = s => s.chapters[s.chapters.length - 1];
  const ago = d => { const n = G.S.day - d; return n <= 0 ? 'neste ano' : n === 1 ? 'há um ano' : `há ${n} anos`; };

  // ============================== the map of a story ==============================
  // the world (the minimap's picture) seen from the story's side: home, the goal, where the protagonist is,
  // and the road they really walked
  function drawMap(cv, s) {
    const S = G.S; const img = G.Minimap && G.Minimap.image ? G.Minimap.image() : null; if (!img) return false;
    const pts = []; const p = P(s.protag);
    const home = s.data.hx !== undefined ? [s.data.hx, s.data.hy] : (() => { const set = S.settlements.get(s.data.home || (p && p.set)); return set ? [set.cx, set.cy] : null; })();
    const marks = [];
    if (home) { pts.push(home); marks.push({ k: 'home', x: home[0], y: home[1], label: setName(s.data.home) || (p && setName(p.set)) || '' }); }
    if (s.place && s.place.x !== undefined) { pts.push([s.place.x, s.place.y]); marks.push({ k: 'goal', x: s.place.x, y: s.place.y, label: s.place.name || '' }); }
    const c = P(s.cast.captive); if (c && !c.dead) { pts.push([c.x, c.y]); marks.push({ k: 'chain', x: c.x, y: c.y, label: c.name }); }
    const t = P(s.cast.target); if (t && !t.dead) { pts.push([t.x, t.y]); marks.push({ k: 'foe', x: t.x, y: t.y, label: t.name }); }
    const b = s.cast.beast && S.animals.get(s.cast.beast); if (b && !b.dead) { pts.push([b.x, b.y]); marks.push({ k: 'beast', x: b.x, y: b.y, label: s.data.beastName || '' }); }
    const tr = s.data.trail || []; for (const q of tr) pts.push(q);
    // where each chapter happened (one numbered pin per spot)
    const chp = [];
    s.chapters.forEach((ch, i) => { if (ch.x === undefined || ch.y === undefined) return; if (chp.some(q => G.dist(q.x, q.y, ch.x, ch.y) < 2.5)) return; chp.push({ x: ch.x, y: ch.y, n: ROMAN[i + 1] || String(i + 1) }); });
    for (const q of chp) pts.push([q.x, q.y]);
    if (p && !p.dead) { pts.push([p.x, p.y]); marks.push({ k: 'me', x: p.x, y: p.y, label: p.name }); }
    if (pts.length < 2) return false;
    // fit the points, in the iso view (u = x - y across, w = x + y down)
    let u0 = 1e9, u1 = -1e9, w0 = 1e9, w1 = -1e9;
    for (const [x, y] of pts) { const u = x - y, w = x + y; if (u < u0) u0 = u; if (u > u1) u1 = u; if (w < w0) w0 = w; if (w > w1) w1 = w; }
    const m = 12; u0 -= m; u1 += m; w0 -= m; w1 += m;
    const W_ = cv.width, H_ = cv.height;
    let k = Math.min(W_ / Math.max(28, u1 - u0), (H_ * 2) / Math.max(28, w1 - w0));
    const ox = W_ / 2 - (u0 + u1) / 2 * k, oy = H_ / 2 - (w0 + w1) / 4 * k;
    const to = (x, y) => [ox + (x - y) * k, oy + (x + y) * k / 2];
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#16212b'; ctx.fillRect(0, 0, W_, H_);
    ctx.save(); ctx.setTransform(k, k / 2, -k, k / 2, ox, oy); ctx.imageSmoothingEnabled = true; ctx.drawImage(img, 0, 0); ctx.restore();
    // a warm wash and a vignette: an old map
    ctx.fillStyle = 'rgba(70,48,20,0.18)'; ctx.fillRect(0, 0, W_, H_);
    const vg = ctx.createRadialGradient(W_ / 2, H_ / 2, Math.min(W_, H_) * 0.35, W_ / 2, H_ / 2, Math.max(W_, H_) * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,8,6,0.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W_, H_);
    const dpr = W_ / (cv.clientWidth || W_);
    // the road planned (dotted), and the road walked (gold)
    if (home && s.place && s.place.x !== undefined) {
      const a = to(home[0], home[1]), z = to(s.place.x, s.place.y);
      ctx.setLineDash([3 * dpr, 5 * dpr]); ctx.strokeStyle = 'rgba(255,240,210,0.45)'; ctx.lineWidth = 1.4 * dpr;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(z[0], z[1]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (tr.length > 1) {
      ctx.strokeStyle = 'rgba(30,20,10,0.65)'; ctx.lineWidth = 4.2 * dpr; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      const line = () => { ctx.beginPath(); tr.forEach((q, i) => { const r = to(q[0], q[1]); if (i) ctx.lineTo(r[0], r[1]); else ctx.moveTo(r[0], r[1]); }); ctx.stroke(); };
      line(); ctx.strokeStyle = '#f5c86b'; ctx.lineWidth = 2.2 * dpr; line();
    }
    // the chapters' pins, under the marks
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const q of chp) {
      if (marks.some(mk => mk.k !== 'me' && G.dist(mk.x, mk.y, q.x, q.y) < 1.5)) continue;
      const [x, y] = to(q.x, q.y); const r = 7 * dpr;
      ctx.fillStyle = 'rgba(20,14,8,0.82)'; ctx.strokeStyle = HUE[s.type] || '#f5c86b'; ctx.lineWidth = 1.4 * dpr;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); ctx.stroke();
      ctx.font = `800 ${(q.n.length > 2 ? 6.5 : 8) * dpr}px Georgia, serif`; ctx.fillStyle = '#f6ead0'; ctx.fillText(q.n, x, y + 0.5 * dpr);
    }
    ctx.textBaseline = 'alphabetic';
    // the marks
    ctx.font = `700 ${11 * dpr}px Nunito, sans-serif`; ctx.textAlign = 'center';
    for (const mk of marks) {
      const [x, y] = to(mk.x, mk.y);
      const col = { home: '#f2e6c8', goal: HUE[s.type] || '#f5c86b', chain: '#e0a050', foe: '#e06a5a', beast: '#d08a4a', me: '#ffd27a' }[mk.k];
      ctx.save(); ctx.translate(x, y);
      if (mk.k === 'me') { ctx.fillStyle = 'rgba(255,210,122,0.25)'; ctx.beginPath(); ctx.arc(0, 0, 9 * dpr, 0, 6.28); ctx.fill(); ctx.fillStyle = col; ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.arc(0, 0, 4.2 * dpr, 0, 6.28); ctx.fill(); ctx.stroke(); }
      else if (mk.k === 'home') { ctx.fillStyle = col; ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); ctx.moveTo(-5 * dpr, 1 * dpr); ctx.lineTo(0, -5 * dpr); ctx.lineTo(5 * dpr, 1 * dpr); ctx.lineTo(5 * dpr, 5 * dpr); ctx.lineTo(-5 * dpr, 5 * dpr); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (mk.k === 'goal') { ctx.fillStyle = col; ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = (i % 2 ? 2.6 : 6.4) * dpr; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else if (mk.k === 'foe') { ctx.strokeStyle = col; ctx.lineWidth = 2.6 * dpr; ctx.beginPath(); ctx.moveTo(-4 * dpr, -4 * dpr); ctx.lineTo(4 * dpr, 4 * dpr); ctx.moveTo(4 * dpr, -4 * dpr); ctx.lineTo(-4 * dpr, 4 * dpr); ctx.stroke(); }
      else { ctx.fillStyle = col; ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 1.4 * dpr; ctx.beginPath(); ctx.arc(0, 0, 4 * dpr, 0, 6.28); ctx.fill(); ctx.stroke(); }
      ctx.restore();
      if (mk.label && mk.k !== 'me') { const ly = y + (mk.k === 'goal' ? -10 : 14) * dpr; ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(16,12,8,0.85)'; ctx.strokeText(trim(mk.label, 28), x, ly); ctx.fillStyle = '#f6ead0'; ctx.fillText(trim(mk.label, 28), x, ly); }
    }
    return true;
  }

  // ============================== the panel ==============================
  function card(s) {
    const d = St.DEF[s.type]; const p = P(s.protag); const last = lastCh(s);
    return `<button class="sg-card ${s.st === 'fim' ? 'done ' + (TONE_CLS[s.end.tone] || '') : 'live'}" data-m="saga-open" data-id="${s.id}" style="--hue:${HUE[s.type] || '#f5c86b'}">
      <span class="sg-pic" data-pid="${s.protag}"></span>
      <div class="sg-body">
        <div class="sg-top"><i class="sg-ic">${ic(d.icon)}</i><b>${esc(s.title)}</b><span>${s.st === 'fim' ? 'dia ' + s.born + '–' + s.end.d : ago(s.born)}</span></div>
        <div class="sg-who">${esc(p ? p.name : '?')} · ${who(p)}${s.gen > 1 ? ` · ${s.gen}ª geração` : ''}</div>
        ${s.log ? `<div class="sg-log">${esc(s.log)}</div>` : ''}
        ${last ? `<div class="sg-last"><em>${esc(headingOf(last) || 'Último capítulo')}</em> ${esc(trim(last.txt, 150))}</div>` : ''}
        <div class="sg-foot">${s.st === 'fim' ? `<span class="sg-end ${TONE_CLS[s.end.tone] || ''}">${esc(endTxt(s))}</span>` : stageDots(s)}<span class="sg-kind">${esc(d.name)}</span></div>
      </div></button>`;
  }
  function fillPics(root) { for (const el of root.querySelectorAll('.sg-pic[data-pid]')) { const v = P(+el.dataset.pid); el.appendChild(portrait(v, +(el.dataset.size || 52))); } }
  St.open = function (tab) {
    const s = St.state(); const ui = St._ui; ui.open = true; ui.view = 'list'; if (tab) ui.tab = tab;
    const act = s.stories.filter(x => x.st === 'ativa').sort((a, b) => (lastCh(b) ? lastCh(b).d : b.born) - (lastCh(a) ? lastCh(a).d : a.born));
    const done = s.stories.filter(x => x.st === 'fim').sort((a, b) => b.end.d - a.end.d);
    const list = ui.tab === 'ativas' ? act : done;
    const empty = ui.tab === 'ativas'
      ? '<div class="sg-empty"><p>Nenhuma história em andamento.</p><p class="muted">O mundo ainda não juntou fatos fortes o bastante — uma morte vista de perto, alguém levado acorrentado, uma cidade perdida, um conto que uma criança não esquece.</p></div>'
      : '<div class="sg-empty"><p class="muted">Nenhuma história terminou ainda.</p></div>';
    G.UI.openModal(`<div class="sg-head"><h2 class="bk-title">${ic('saga')}<span>Histórias</span></h2>
      <p class="sg-lead">Ninguém escreveu estas histórias. Elas são feitas do que aconteceu de verdade neste mundo — o diretor só escolhe quais vale a pena acompanhar.</p></div>
      <div class="bk-tabs"><button data-m="saga-tab" data-tab="ativas" class="${ui.tab === 'ativas' ? 'on' : ''}">Em andamento <em>${act.length}</em></button><button data-m="saga-tab" data-tab="fim" class="${ui.tab === 'fim' ? 'on' : ''}">Concluídas <em>${done.length}</em></button></div>
      <div class="bk-page sg-list">${list.length ? list.map(card).join('') : empty}</div>
      <div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide book saga');
    fillPics($('#modal'));
  };
  St.openStory = function (id) {
    const s = St.get(id); if (!s) return St.open();
    const ui = St._ui; ui.open = true; ui.view = 'story'; ui.id = id;
    const d = St.DEF[s.type]; const ctx = St.context(id); const p = P(s.protag); const hue = HUE[s.type] || '#f5c86b';
    // why: the first fact and the war it happened in, if any
    const f0 = St.fact(s.origin[0]); let why = '';
    if (f0 && f0.src) { const w = St.fact(f0.src); if (w && w.k === 'guerra') why = `Aconteceu na guerra entre ${esc(w.n.fa)} e ${esc(w.n.fb)}, declarada no dia ${w.d}${w.why === 'reconquista' ? ' para retomar uma cidade perdida' : ''}.`; }
    const know = p && f0 ? St.knows(p.id, f0.id) : null;
    const KNOW = { viu: n => `${n} viu com os próprios olhos o que aconteceu.`, soube: n => `${n} soube pela família o que aconteceu.`, ouviu: n => `${n} ouviu contar o que aconteceu.`, boato: n => `${n} só sabe o que aconteceu pelo que todos dizem.` };
    const parts = ctx.participants.map(q => `<button class="sg-part" data-m="person" data-id="${q.id}"><span class="sg-pic" data-pid="${q.id}" data-size="40"></span><span class="sg-pt"><label>${(ROLE[q.role] || q.role).replace('{o}', P(q.id) && P(q.id).g === 'f' ? 'a' : 'o')}</label><b>${esc(q.name)}${q.alive ? '' : ' †'}</b><small>${q.alive ? (q.captive ? 'cativ' + (P(q.id).g === 'f' ? 'a' : 'o') + ' em ' + esc(setName(q.set)) : esc(setName(q.set) || '')) : 'morreu'}</small></span></button>`).join('');
    const others = new Map();
    for (const q of [p].concat(ctx.participants.map(x => P(x.id)))) if (q) for (const o of St.of(q.id)) if (o.id !== s.id) others.set(o.id, o);
    const chs = s.chapters.map((ch, i) => `<li class="${ch.big ? 'big' : ''} ${ch.k === 'fim' ? 'fim' : ''}"><div class="sg-chh"><span class="sg-num">${ch.k === 'fim' ? '✦' : 'Capítulo ' + (ROMAN[i + 1] || i + 1)}</span>${headingOf(ch) ? `<b>${esc(headingOf(ch))}</b>` : ''}<em>dia ${ch.d}</em>${ch.x !== undefined ? `<button class="sg-pin" data-m="saga-at" data-x="${ch.x}" data-y="${ch.y}" title="Ir até onde aconteceu">◎</button>` : ''}</div><p>${esc(ch.txt)}</p></li>`).join('');
    const seal = s.st === 'fim' ? `<div class="sg-seal ${TONE_CLS[s.end.tone] || ''}"><i>${ic(d.icon)}</i><div><b>${esc(St.END[s.end.k] || s.end.k)}</b><span>${esc(St.TONE[s.end.tone] || '')} · dia ${s.end.d}</span></div></div>` : '';
    const place = s.place && s.place.name ? `<button class="sg-chip" data-m="saga-place" data-id="${s.id}">${ic('map')}${esc(s.place.name)}</button>` : '';
    G.UI.openModal(`<div class="sg-hero" style="--hue:${hue}"><div class="sg-emb">${ic(d.icon)}</div><div class="sg-ht"><div class="sg-kicker">${esc(d.name)}${s.gen > 1 ? ` · ${s.gen}ª geração` : ''} · desde o dia ${s.born}</div><h2>${esc(s.title)}</h2>${s.log ? `<p>${esc(s.log)}</p>` : ''}</div>${seal}</div>
      <div class="bk-page sg-page" style="--hue:${hue}">
        ${stageTrack(s)}
        <div class="sg-row">
          <div class="sg-prot"><span class="sg-pic" data-pid="${s.protag}" data-size="72"></span><div class="sg-pi"><label>${s.prev.length ? 'Quem a carrega agora' : 'Protagonista'}</label><b>${esc(p ? p.name : '?')}</b><small>${who(p)}</small>${p && (p.traits || []).length ? `<div class="sg-traits">${p.traits.slice(0, 3).map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
            <div class="sg-btns"><button data-m="person" data-id="${s.protag}">Ver personagem</button>${p && !p.dead ? `<button data-m="saga-follow" data-id="${s.id}">Seguir</button><button data-m="saga-go" data-id="${s.id}">Ir até</button>` : ''}</div></div></div>
          <div class="sg-map"><canvas class="sg-mapc"></canvas>${place}</div>
        </div>
        <div class="sg-want"><h4>${s.st === 'fim' ? 'O que queria' : 'O que quer'}</h4><p>${esc(ctx.goal)}</p>
          ${why || know ? `<p class="facts">${why}${know && KNOW[know] ? ' ' + KNOW[know](esc(p.name)) : ''}</p>` : ''}</div>
        ${s.st === 'ativa' ? `<div class="sg-now"><h4>Agora</h4><p>${esc(ctx.situation)}</p>${ctx.obstacles.length ? `<div class="sg-chips bad">${ctx.obstacles.map(o => `<span>${esc(o)}</span>`).join('')}</div>` : ''}${ctx.open.length ? `<div class="sg-chips"><label>Ainda pode acontecer</label>${ctx.open.map(o => `<span>${esc(o)}</span>`).join('')}</div>` : ''}</div>` : ''}
        ${parts ? `<h4>Quem mais está nela</h4><div class="sg-parts">${parts}</div>` : ''}
        <h4>Capítulos</h4><ol class="sg-tl" style="--hue:${hue}">${chs}</ol>
        ${others.size ? `<h4>Histórias que se cruzam com esta</h4><div class="sg-cross">${[...others.values()].map(o => `<button data-m="saga-open" data-id="${o.id}" style="--hue:${HUE[o.type] || '#f5c86b'}">${ic(St.DEF[o.type].icon)}<span>${esc(o.title)}</span></button>`).join('')}</div>` : ''}
      </div>
      <div class="mbtns"><button data-m="saga-tab" data-tab="${s.st === 'fim' ? 'fim' : 'ativas'}">Voltar</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide book saga story');
    const root = $('#modal'); fillPics(root);
    const cv = root.querySelector('.sg-mapc');
    if (cv) { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.max(200, Math.round((r.width || 320) * dpr)); cv.height = Math.max(120, Math.round((r.height || 170) * dpr)); if (!drawMap(cv, s)) { cv.parentNode.classList.add('nomap'); cv.parentNode.parentNode.classList.add('solo'); } }
  };
  St.refresh = function () {
    const m = $('#modal'); if (!m || !m.classList.contains('saga') || !G.Main.modalOpen) { St._ui.open = false; return; }
    const sc = m.querySelector('.bk-page') ? m.querySelector('.bk-page').scrollTop : 0;
    if (St._ui.view === 'story') St.openStory(St._ui.id); else St.open();
    const pg = $('#modal').querySelector('.bk-page'); if (pg) pg.scrollTop = sc;
  };
  // the buttons of the panel
  St.uiAct = function (m, b) {
    const R = G.Render;
    if (m === 'saga-tab') St.open(b.dataset.tab);
    else if (m === 'saga-open') St.openStory(+b.dataset.id);
    else if (m === 'saga-go' || m === 'saga-follow') {
      const s = St.get(+b.dataset.id); const p = s && P(s.protag); if (!p || p.dead) return;
      G.UI.closeModal(); R.cam.follow = m === 'saga-follow' ? p.id : 0; R.panTo(p.x, p.y); R.cam.tz = Math.max(R.cam.tz, 1.6);
      if (m === 'saga-follow') G.UI.select(p);
    } else if (m === 'saga-place') { const s = St.get(+b.dataset.id); if (s && s.place) { G.UI.closeModal(); R.cam.follow = 0; R.panTo(s.place.x, s.place.y); R.cam.tz = Math.max(R.cam.tz, 1.5); } }
    else if (m === 'saga-at') { G.UI.closeModal(); R.cam.follow = 0; R.panTo(+b.dataset.x, +b.dataset.y); R.cam.tz = Math.max(R.cam.tz, 1.5); }
  };

  // ============================== the card that slides in ==============================
  // a story begins, climbs, ends: a small illustrated card at the edge of the screen (not for every chapter)
  const queue = []; let busy = false;
  St._announce = function (s, kind, txt) {
    if (!G.Main || G.Main.mode === 'menu' || G.Main.mode === 'test') return;
    if (G.Skip && G.Skip.on) { if (kind !== 'beat') G.Skip.news(kind === 'start' ? 'Uma nova história: ' + s.title : s.title, kind === 'start' ? s.log || '' : txt || ''); return; }
    queue.push({ id: s.id, kind, txt }); while (queue.length > 3) queue.shift();
    if (!busy) next();
  };
  function next() {
    const q = queue.shift(); if (!q) { busy = false; return; }
    const s = St.get(q.id); if (!s) return next();
    busy = true;
    let el = $('#saga-card'); if (!el) { el = document.createElement('div'); el.id = 'saga-card'; document.body.appendChild(el); }
    const d = St.DEF[s.type]; const p = P(s.protag);
    const eyebrow = q.kind === 'start' ? 'Uma nova história' : q.kind === 'end' ? 'Fim · ' + (St.END[s.end ? s.end.k : ''] || '') : 'Uma história';
    const body = q.kind === 'start' ? s.log || (s.chapters[0] && s.chapters[0].txt) || '' : q.txt || '';
    el.className = 'sg-toast ' + q.kind + (s.end ? ' ' + (TONE_CLS[s.end.tone] || '') : ''); el.style.setProperty('--hue', HUE[s.type] || '#f5c86b');
    el.innerHTML = `<span class="sg-pic"></span><div class="sg-tb"><div class="sg-kicker">${ic(d.icon)}${esc(eyebrow)}</div><b>${esc(s.title)}</b><p>${esc(trim(body, 170))}</p><div class="sg-tbtn"><button data-a="read">Ler</button>${p && !p.dead ? '<button data-a="follow">Seguir</button>' : ''}</div></div><button class="sg-tx" data-a="x">✕</button>`;
    el.querySelector('.sg-pic').appendChild(portrait(p, 54));
    el.onclick = e => {
      const a = e.target.closest('[data-a]'); const act = a ? a.dataset.a : 'read';
      if (act === 'follow' && p && !p.dead) { const R = G.Render; R.cam.follow = p.id; R.panTo(p.x, p.y); R.cam.tz = Math.max(R.cam.tz, 1.6); G.UI.select(p); }
      else if (act === 'read') { G.Audio && G.Audio.play && G.Audio.play('click'); St.openStory(s.id); }
      hide();
    };
    el.classList.remove('out'); void el.offsetWidth; el.classList.add('in');
    if (q.kind !== 'beat') G.Audio && G.Audio.play && G.Audio.play(q.kind === 'end' ? 'sagaEnd' : 'saga');
    clearTimeout(el._t); el._t = setTimeout(hide, q.kind === 'beat' ? 7000 : 9500);
  }
  function hide() { const el = $('#saga-card'); if (!el) { busy = false; return; } el.classList.remove('in'); el.classList.add('out'); clearTimeout(el._t); setTimeout(() => { busy = false; next(); }, 600); }

  // ============================== on a person's card ==============================
  St.personLine = function (v) {
    const s = St.state(); const mine = s.stories.filter(x => x.protag === v.id || x.prev.includes(v.id) || (x.st === 'ativa' && St.of(v.id).includes(x)));
    if (!mine.length) return '';
    const role = x => (x.protag === v.id ? (x.st === 'fim' ? 'viveu' : 'vive') : x.prev.includes(v.id) ? 'começou' : 'está em');
    return `<div class="sg-line"><label>${G.ICON.saga || ''}Histórias</label>${mine.slice(-3).map(x => `<button data-act="saga" data-id="${x.id}" style="--hue:${HUE[x.type] || '#f5c86b'}">${ic(St.DEF[x.type].icon)}<span>${esc(x.title)}</span><em>${role(x)}</em></button>`).join('')}</div>`;
  };
  // by the fire: the finished stories of this people, told by the old
  St.talesFor = function (set) {
    const out = []; const S = G.S;
    for (const x of St.state().stories) {
      if (x.st !== 'fim' || S.day - x.end.d < 1 || x.fac !== set.fac || x.chapters.length < 2) continue;
      const first = x.chapters[0].txt, last = x.chapters[x.chapters.length - 1].txt;
      const c = { w: 2.5, txt: `${x.title}. ${first} ${last}`, mood: x.end.tone === 'tragico' ? 'sad' : x.end.tone === 'feliz' ? 'happy' : 'awe', d: x.born };
      // a journey told is a place the children can dream of
      if ((x.type === 'sonho' || x.type === 'peregrinacao') && x.place && x.place.x !== undefined && x.end.k === 'cumprida') Object.assign(c, { x: x.place.x, y: x.place.y, ic: { mar: 'sea', caverna: 'cave', oraculo: 'cave', maravilha: 'wonder' }[x.place.kind] || 'mountain' });
      out.push(c);
    }
    return out;
  };

  // ============================== the gold quill over a protagonist ==============================
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.air = G.renderHooks.air || [];
  G.renderHooks.air.push(function (ctx, proj, view, t) {
    const S = G.S; if (!S || !S.saga || G.Render.under) return;
    const z = G.Render.cam.zoom; if (z < 0.75) return;
    const s1 = 1 / Math.sqrt(z);
    for (const s of S.saga.stories) {
      if (s.st !== 'ativa') continue; const v = S.villagers.get(s.protag); if (!v || v.inside || v.ug || v.aboard) continue;
      const p = proj(v.x, v.y, G.W.groundH(v.x, v.y)); if (p[0] < view[0] - 20 || p[0] > view[2] + 20 || p[1] < view[1] - 40 || p[1] > view[3] + 40) continue;
      const sc = v.age < 16 ? 0.55 + (v.age / 16) * 0.42 : 1;
      const y = p[1] - (21 * sc + (v.emo ? 12 : 0) + 4) - Math.sin(t * 2.2 + s.id) * 1.2;
      ctx.save(); ctx.translate(p[0], y); ctx.scale(s1 * 1.05, s1 * 1.05);
      ctx.fillStyle = 'rgba(20,14,8,0.6)'; ctx.beginPath(); ctx.moveTo(0, -5.6); ctx.lineTo(4.4, 0); ctx.lineTo(0, 5.6); ctx.lineTo(-4.4, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = HUE[s.type] || '#f5c86b'; ctx.beginPath(); ctx.moveTo(0, -4.6); ctx.lineTo(3.5, 0); ctx.lineTo(0, 4.6); ctx.lineTo(-3.5, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a1c0c'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-1.4, 2.2); ctx.quadraticCurveTo(0.2, -0.2, 1.6, -2.4); ctx.stroke();
      ctx.restore();
    }
  });

  // ============================== the cinema ==============================
  // a climax deserves a shot; a journey's end too (not every chapter)
  St.shots = function (out) {
    const S = G.S;
    for (const h of St.hotList) {
      if (S.clock > h.until) continue; const s = St.get(h.story); if (!s) continue;
      out.push({ key: 'saga:' + s.id + ':' + Math.round(h.born), kind: 'saga', score: 92, zoom: 2.4, dur: 13, drift: 1, pos: () => [h.x, h.y, 6], alive: () => S.clock < h.until, kick: 'Uma história', title: s.title, sub: trim(h.txt, 150) });
    }
    for (const s of St.state().stories) {
      if (s.st !== 'ativa') continue; const p = P(s.protag); if (!p || p.dead || !p.task || p.task.type !== 'saga') continue;
      const t = p.task; const moment = t.st === 2 || t.st === 4 || t.st >= 6;
      if (!moment && !(t.j && t.st === 1 && (t.road || []).length)) continue;
      out.push({ key: 'saga-at:' + s.id + ':' + S.day + ':' + t.st, kind: 'saga', score: t.st >= 6 ? 80 : t.st === 4 ? 58 : 62, zoom: 2.6, dur: 10, mark: 1, pos: () => [p.x, p.y, 4], alive: () => !!(p.task && p.task.type === 'saga'), kick: s.title, title: p.name, subFn: () => G.Vg.taskText(p) });
    }
  };
})(window.G);
