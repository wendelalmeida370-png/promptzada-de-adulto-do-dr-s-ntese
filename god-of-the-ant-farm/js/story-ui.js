'use strict';
// ============================================================
//  Stories, presented: the panel (a collection of stories, not a quest log), the line on a person's
//  card, the old telling finished stories by the fire, and the shots the cinema may take.
//  (Presentation only: what a story IS lives in stories.js and story-lib.js.)
// ============================================================
(function (G) {
  const St = G.Stories;
  const P = id => (id ? G.person(id) : null);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const trim = (s, n) => (s && s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s || '');
  const facName = id => { const f = G.Fac.get(id); return f ? f.name : ''; };
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : ''; };
  const ROLE = { victim: 'Por quem', target: 'O alvo', captive: 'Cativ{o}', teller: 'Quem contou', lost: 'Por quem reza', ruler: 'Governante', antes: 'Carregou antes' };
  const TONE_CLS = { feliz: 'happy', tragico: 'tragic', agridoce: 'bitter', sereno: 'calm' };
  const ic = name => (G.ICON && G.ICON[name]) || (G.ICON && G.ICON.saga) || '';
  St._ui = { open: false, view: 'list', tab: 'ativas', id: 0 };

  function who(p) {
    if (!p) return 'alguém';
    if (p.dead) return `${esc(p.name)} †`;
    const f = G.Fac.idOfV(p);
    return `${esc(p.name)} · ${Math.floor(p.age)} ${Math.floor(p.age) === 1 ? 'ano' : 'anos'}${p.captive ? ' · cativ' + (p.g === 'f' ? 'a' : 'o') : ''}${f ? ' · ' + esc(facName(f)) : ''}`;
  }
  function stateLine(s) {
    if (s.st === 'fim') return `<span class="sg-end ${TONE_CLS[s.end.tone] || ''}">${St.END[s.end.k] || s.end.k} · ${St.TONE[s.end.tone] || s.end.tone}</span> <em>dia ${s.end.d}</em>`;
    const d = St.DEF[s.type]; const st = d.status ? d.status(s, St.ctx(s)) : '';
    return esc(trim(st, 150));
  }
  function card(s) {
    const d = St.DEF[s.type]; const p = P(s.protag);
    const first = s.chapters[0] ? s.chapters[0].txt : '';
    return `<button class="sg-card ${s.st === 'fim' ? 'done ' + (TONE_CLS[s.end.tone] || '') : ''}" data-m="saga-open" data-id="${s.id}">
      <i class="sg-ic">${ic(d.icon)}</i>
      <div class="sg-body">
        <div class="sg-top"><b>${esc(s.title)}</b><span>dia ${s.born}</span></div>
        <div class="sg-who">${who(p)}${s.gen > 1 ? ` · ${s.gen}ª geração` : ''}</div>
        <div class="sg-sum">${esc(trim(first, 170))}</div>
        <div class="sg-now">${stateLine(s)}</div>
        <div class="sg-tags">${[d.name].concat(s.tags.filter(t => t.toLowerCase() !== d.name.toLowerCase()).slice(0, 2)).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div></button>`;
  }
  St.open = function (tab) {
    const s = St.state(); const ui = St._ui; ui.open = true; ui.view = 'list'; if (tab) ui.tab = tab;
    const act = s.stories.filter(x => x.st === 'ativa').sort((a, b) => b.born - a.born);
    const done = s.stories.filter(x => x.st === 'fim').sort((a, b) => b.end.d - a.end.d);
    const list = ui.tab === 'ativas' ? act : done;
    const empty = ui.tab === 'ativas'
      ? '<p class="muted center">Nenhuma história em andamento. O mundo ainda não juntou fatos fortes o bastante — uma morte vista de perto, alguém levado acorrentado, uma cidade perdida, um conto que uma criança não esquece.</p>'
      : '<p class="muted center">Nenhuma história terminou ainda.</p>';
    G.UI.openModal(`<h2 class="bk-title">${ic('saga')}<span>Histórias</span></h2>
      <p class="muted sg-lead">Ninguém escreveu estas histórias: são feitas do que aconteceu de verdade neste mundo. O diretor só escolhe quais vale a pena acompanhar.</p>
      <div class="bk-tabs"><button data-m="saga-tab" data-tab="ativas" class="${ui.tab === 'ativas' ? 'on' : ''}">Em andamento <em>${act.length}</em></button><button data-m="saga-tab" data-tab="fim" class="${ui.tab === 'fim' ? 'on' : ''}">Concluídas <em>${done.length}</em></button></div>
      <div class="bk-page sg-list">${list.length ? list.map(card).join('') : empty}</div>
      <div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide book saga');
  };
  St.openStory = function (id) {
    const s = St.get(id); if (!s) return St.open();
    const ui = St._ui; ui.open = true; ui.view = 'story'; ui.id = id;
    const d = St.DEF[s.type]; const ctx = St.context(id); const p = P(s.protag);
    // why: the first fact and the war it happened in, if any
    const f0 = St.fact(s.origin[0]); let why = '';
    if (f0 && f0.src) { const w = St.fact(f0.src); if (w && w.k === 'guerra') why = `Aconteceu na guerra entre ${esc(w.n.fa)} e ${esc(w.n.fb)}, declarada no dia ${w.d}${w.why === 'reconquista' ? ' para retomar uma cidade perdida' : ''}.`; }
    const know = p && f0 ? St.knows(p.id, f0.id) : null;
    const KNOW = { viu: 'viu com os próprios olhos', soube: 'soube pela família', ouviu: 'ouviu contar', boato: 'sabe pelo que todos dizem' };
    const parts = ctx.participants.map(q => `<div class="sg-part"><label>${(ROLE[q.role] || q.role).replace('{o}', P(q.id) && P(q.id).g === 'f' ? 'a' : 'o')}</label><button data-m="person" data-id="${q.id}">${esc(q.name)}${q.alive ? '' : ' †'}</button><span>${q.alive ? (q.captive ? 'cativ' + (P(q.id).g === 'f' ? 'a' : 'o') + ' em ' + esc(setName(q.set)) : esc(setName(q.set) || '')) : 'morreu'}</span></div>`).join('');
    const others = new Map();
    for (const q of [p].concat(ctx.participants.map(x => P(x.id)))) if (q) for (const o of St.of(q.id)) if (o.id !== s.id) others.set(o.id, o);
    const place = s.place && s.place.name ? `<div class="sg-place">Lugar: <b>${esc(s.place.name)}</b>${s.place.x !== undefined ? ` <button data-m="saga-place" data-id="${s.id}">Ir até</button>` : ''}</div>` : '';
    G.UI.openModal(`<h2 class="bk-title">${ic(d.icon)}<span>${esc(s.title)}</span></h2>
      <div class="sg-meta">${esc(d.name)} · começou no dia ${s.born}${s.gen > 1 ? ` · ${s.gen}ª geração` : ''} · ${s.st === 'fim' ? stateLine(s) : '<span class="sg-live">em andamento</span>'}</div>
      <div class="bk-page sg-page">
        <div class="sg-prot"><label>${s.prev.length ? 'Quem a carrega agora' : 'Protagonista'}</label><b>${who(p)}</b>
          <div class="sg-btns"><button data-m="person" data-id="${s.protag}">Ver personagem</button>${p && !p.dead ? `<button data-m="saga-follow" data-id="${s.id}">Seguir</button><button data-m="saga-go" data-id="${s.id}">Ir até</button>` : ''}</div></div>
        <h4>O que ${s.st === 'fim' ? 'queria' : 'quer'}</h4><p>${esc(ctx.goal)}</p>
        ${why || know ? `<p class="facts">${why}${know ? ` ${esc(p.name)} ${KNOW[know] || know} o que aconteceu.` : ''}</p>` : ''}
        ${place}
        ${parts ? `<h4>Quem mais está nela</h4><div class="sg-parts">${parts}</div>` : ''}
        <h4>Capítulos</h4><ol class="sg-tl">${s.chapters.map(ch => `<li class="${ch.big ? 'big' : ''}"><span>Dia ${ch.d}</span>${esc(ch.txt)}${ch.x !== undefined ? ` <button class="sg-pin" data-m="saga-at" data-x="${ch.x}" data-y="${ch.y}" title="Ir até">◎</button>` : ''}</li>`).join('')}</ol>
        ${s.st === 'ativa' ? `<h4>Agora</h4><p>${esc(ctx.situation)}</p>${ctx.obstacles.length ? `<p class="facts">No caminho: ${ctx.obstacles.map(esc).join(' · ')}</p>` : ''}${ctx.open.length ? `<p class="facts">Ainda pode acontecer: ${ctx.open.map(esc).join(' · ')}</p>` : ''}` : ''}
        ${others.size ? `<h4>Histórias que se cruzam com esta</h4><div class="sg-cross">${[...others.values()].map(o => `<button data-m="saga-open" data-id="${o.id}">${esc(o.title)}</button>`).join('')}</div>` : ''}
      </div>
      <div class="mbtns"><button data-m="saga-tab" data-tab="${s.st === 'fim' ? 'fim' : 'ativas'}">Voltar</button><button class="primary" data-m="close">Fechar</button></div>`, 'wide book saga');
  };
  St.refresh = function () {
    const m = document.querySelector('#modal'); if (!m || !m.classList.contains('saga') || !G.Main.modalOpen) { St._ui.open = false; return; }
    if (St._ui.view === 'story') St.openStory(St._ui.id); else St.open();
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
  // on a person's card: the stories they are in
  St.personLine = function (v) {
    const s = St.state(); const mine = s.stories.filter(x => x.protag === v.id || x.prev.includes(v.id) || (x.st === 'ativa' && St.of(v.id).includes(x)));
    if (!mine.length) return '';
    const role = x => (x.protag === v.id ? (x.st === 'fim' ? 'viveu' : 'vive') : x.prev.includes(v.id) ? 'começou' : 'está em');
    return `<div class="sg-line"><label>${G.ICON.saga || ''}Histórias</label>${mine.slice(-3).map(x => `<button data-act="saga" data-id="${x.id}">${esc(x.title)}<em>${role(x)}</em></button>`).join('')}</div>`;
  };
  // by the fire: the finished stories of this people, told by the old
  St.talesFor = function (set) {
    const out = []; const S = G.S;
    for (const x of St.state().stories) {
      if (x.st !== 'fim' || S.day - x.end.d < 1 || x.fac !== set.fac || x.chapters.length < 2) continue;
      const first = x.chapters[0].txt, last = x.chapters[x.chapters.length - 1].txt;
      out.push({ w: 2.5, txt: `${x.title}. ${first} ${last}`, mood: x.end.tone === 'tragico' ? 'sad' : x.end.tone === 'feliz' ? 'happy' : 'awe', d: x.born });
    }
    return out;
  };
  // the cinema: a climax deserves a shot; a journey's end too (not every chapter)
  St.shots = function (out) {
    const S = G.S;
    for (const h of St.hotList) {
      if (S.clock > h.until) continue; const s = St.get(h.story); if (!s) continue;
      out.push({ key: 'saga:' + s.id + ':' + Math.round(h.born), kind: 'saga', score: 92, zoom: 2.4, dur: 13, drift: 1, pos: () => [h.x, h.y, 6], alive: () => S.clock < h.until, kick: 'Uma história', title: s.title, sub: trim(h.txt, 150) });
    }
    for (const s of St.state().stories) {
      if (s.st !== 'ativa') continue; const p = P(s.protag); if (!p || p.dead || !p.task || p.task.type !== 'saga' || p.task.st !== 2) continue;
      out.push({ key: 'saga-at:' + s.id + ':' + S.day, kind: 'saga', score: 62, zoom: 2.6, dur: 10, mark: 1, pos: () => [p.x, p.y, 4], alive: () => !!(p.task && p.task.type === 'saga'), kick: s.title, title: p.name, subFn: () => G.Vg.taskText(p) });
    }
  };
})(window.G);
