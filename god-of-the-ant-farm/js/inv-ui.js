'use strict';
// ============================================================
//  InvUI: the screen of the bag and the equipment, and the bar
//  of quick things (the hotbar) on the body's screen (D-336).
//  Only seen: it reads G.Inv and asks the world through the
//  body's doors (G.Possess.apply), never moves a thing itself
//  (the guard's rules 13, 111 and 129). It plugs into the body's
//  screen by its ports: the hotbar's place in the HUD
//  (G.IncUI.hud(), '.ih-hotbar'), the panel mark
//  (G.Modes.setPanel('mochila')), the closing of every panel
//  (G.IncUI.closers), the keys by action name (G.Input3D.on), the
//  beat of the body's screen (its frame, G.IncUI.frame, carries
//  this screen's).
//  The panel (D-377): the body with its six places, the bag as a
//  grid, the weight against the limit, the card of the thing the
//  mouse is over (or the finger chose), and — when the body is
//  at its people's store or by things on the ground — what can
//  be taken there. On a PC: drag a thing onto a place to wear or
//  hold it, back to the bag to take it off, onto the ground to
//  let it fall, onto a key of the bar to make it quick; a double
//  click puts it on or takes it off; a number key over a thing
//  gives it that key. On a phone: a tap chooses, a second tap on a
//  place, the bar or the ground does it. Opening it holds the body
//  still and lets the world go on (as the cards: D-036).
//  The picture of a thing is the art's (G.ItemArt.icon); until it
//  comes, a sign drawn here, in the thing's material.
// ============================================================
(function (G) {
  const UI = G.InvUI = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const It = () => G.Itens, Inv = () => G.Inv;
  const SLOT_AT = { cabeca: 'Cabeça', corpo: 'Corpo', mao: 'Mão', outra: 'Outra mão', costas: 'Costas', cinto: 'Cinto' };
  const WHERE = { mao: 'na mão', outra: 'na outra mão', costas: 'nas costas', cinto: 'no cinto', cabeca: 'na cabeça', corpo: 'no corpo' };
  const NQ = 5, CELLS = 24;
  let panel = null, bar = null, open = false, sel = null, hover = null, press = null, drag = null, ghost = null, lastClick = { k: null, t: 0 };
  let sig = '', barSig = '', upT = 0, lastBody = 0, told = new Set();

  // ------------------------------ the sign of a thing ------------------------------
  // (the art's picture when it has one; else a sign in a 48-unit square: the wood brown, the business end in the thing's material)
  const WOOD = '#8a5a34', DARK = 'rgba(0,0,0,.35)';
  const P = (d, f, s, w) => `<path d="${d}" fill="${f || 'none'}"${s ? ` stroke="${s}" stroke-width="${w || 3}"` : ''}/>`;
  const SIGN = {
    machado: m => P('M14 41L31 10', 0, WOOD, 3.6) + P('M27 8q11 1 13 13q-7-2-12 3z', m, DARK, 1),
    picareta: m => P('M13 41L29 13', 0, WOOD, 3.6) + P('M14 13Q27 3 41 13l-2 3Q27 9 16 16z', m, DARK, 1),
    pa: m => P('M24 4v26M19 5h10', 0, WOOD, 3.4) + P('M17 29h14v8q-7 8-14 0z', m, DARK, 1),
    enxada: m => P('M12 42L33 9', 0, WOOD, 3.4) + P('M29 6l11 6-3 5-10-5z', m, DARK, 1),
    foice: m => P('M13 41l7-10', 0, WOOD, 4) + P('M20 31Q7 17 22 8q16-5 18 10q-8-8-16-4q-8 6-2 17z', m, DARK, 1),
    martelo: m => P('M15 41l12-23', 0, WOOD, 3.6) + P('M21 10l15 7-4 8-15-7z', m, DARK, 1),
    faca: m => P('M11 39l8-8', 0, WOOD, 4.4) + P('M18 32L39 9q-2 12-17 25z', m, DARK, 1),
    vara: m => P('M8 42Q22 22 40 6', 0, WOOD, 2.2) + P('M40 6q3 14-2 24', 0, '#e8e0c8', 1) + P('M38 30q-1 5-5 2', 0, m, 1.6),
    rede: m => `<circle cx="24" cy="24" r="15" fill="none" stroke="${m}" stroke-width="2.4"/>` + P('M12 15h24M9 24h30M12 33h24M15 12v24M24 9v30M33 12v24', 0, m, 1.2),
    remo: () => P('M10 41L29 15', 0, WOOD, 3.2) + P('M27 17q6-13 15-11q0 9-10 13z', '#a8753f', DARK, 1),
    cajado: () => P('M20 44l6-34q2-6 8-4q3 4-2 7', 0, WOOD, 3.4),
    tocha: () => P('M24 44V22', 0, WOOD, 3.8) + P('M24 5q8 8 5 15q-5 5-10 0q-3-8 5-15z', '#f0a03a') + P('M24 11q4 5 2 9q-2 2-4 0q-2-4 2-9z', '#ffe08a'),
    cesto: m => P('M9 21h30l-4 19H13z', m, DARK, 1) + P('M14 21Q24 3 34 21', 0, m, 2.4) + P('M11 28h26M12 34h24', 0, DARK, 1),
    balde: m => P('M12 17h24l-3 23H15z', m, DARK, 1) + P('M12 17Q24 0 36 17', 0, '#6b6f75', 1.8) + P('M13 24h22M14 34h20', 0, '#6b6f75', 1.6),
    espada: m => P('M24 3l3 5-1 22h-4l-1-22z', m, DARK, 1) + P('M16 30h16v3H16z', '#b08a3a') + P('M22.5 33h3v7h-3z', WOOD) + '<circle cx="24" cy="42" r="2.2" fill="#b08a3a"/>',
    lanca: m => P('M8 43L35 13', 0, WOOD, 2.6) + P('M42 5l-10 6 5 5z', m, DARK, 1),
    clava: () => P('M14 41l13-23', 0, WOOD, 3.4) + P('M23 19q3-13 15-11q4 9-7 15z', '#6e4a2c', DARK, 1),
    arco: () => P('M15 4Q39 24 15 44', 0, WOOD, 3.2) + P('M15 4v40', 0, '#e8e0c8', 1),
    flecha: m => P('M8 40L36 12', 0, WOOD, 2) + P('M40 8l-9 3 6 6z', m) + P('M8 40l-1-6M8 40l6 1', 0, '#d8d0b8', 2),
    funda: () => P('M8 7q12 22 16 27M40 7q-12 22-16 27', 0, '#c2a676', 1.8) + '<ellipse cx="24" cy="35" rx="5" ry="3.2" fill="#8f5d35"/>',
    escudo: m => `<circle cx="24" cy="24" r="17" fill="${m}" stroke="${DARK}" stroke-width="1.4"/><circle cx="24" cy="24" r="13.5" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/><circle cx="24" cy="24" r="4.6" fill="#b9bec5" stroke="${DARK}" stroke-width="1"/>`,
    elmo: m => P('M9 29Q9 8 24 8t15 21z', m, DARK, 1.2) + P('M22.5 18h3v17h-3z', DARK) + P('M9 29h7v8H9z', m, DARK, 1) + P('M32 29h7v8h-7z', m, DARK, 1),
    couraca: m => P('M14 7h20l5 8-3 26H12L9 15z', m, DARK, 1.2) + P('M24 9v31M13 22h22M14 31h20', 0, DARK, 1),
  };
  const GOOD = c => P('M14 17q10-11 20 0l4 22q-14 6-28 0z', c, DARK, 1) + P('M18 15q6 3 12 0', 0, DARK, 1.4);
  const signs = new Map();
  UI.sign = function (k) {
    let s = signs.get(k); if (s) return s;
    const d = It().def(k); const art = G.ItemArt && G.ItemArt.icon ? G.ItemArt.icon(k) : null;
    if (art) s = `<img src="${esc(art)}" alt="" draggable="false">`;
    else { const f = d && d.coisa ? SIGN[d.kind] : null; s = `<svg viewBox="0 0 48 48" aria-hidden="true">${f ? f(d.cor || '#c8c8c8') : GOOD((d && d.cor) || '#c8a878')}</svg>`; }
    signs.set(k, s); return s;
  };
  G.worldHooks.push(() => { sel = null; hover = null; sig = ''; barSig = ''; lastBody = 0; told = new Set(); if (open) hide(); });

  // ------------------------------ the hands' asking ------------------------------
  // (the answer told when the world has answered: a refusal said, a success said only where it is not plain to see)
  function tell(ask, ok) { G.IncUI.when(ask, r => { if (ok) G.IncUI.toast(typeof ok === 'function' ? ok(r) : ok, 2.6); sig = ''; }, r => { if (r.why) G.IncUI.toast(r.why, 2.8); sig = ''; }); }
  const nm = k => It().nome(k);
  const Nm = k => G.cap(nm(k));
  // what each target does with the thing chosen (from: 'bag' or the place it is in)
  function act(k, from, to) {
    if (!k || !to) return;
    if (to.startsWith('slot:')) { const s = to.slice(5); if (from === s) return; tell(G.Possess.apply(w => G.Inv.equip(w, k, s))); return; }
    if (to === 'bag') { if (from && from !== 'bag' && !from.startsWith('q:')) tell(G.Possess.apply(w => G.Inv.unequip(w, from))); else if (from && from.startsWith('q:')) tell(G.Possess.apply(w => G.Inv.shortcut(w, +from.slice(2), null))); return; }
    if (to.startsWith('q:')) { const i = +to.slice(2); tell(G.Possess.apply(w => G.Inv.shortcut(w, i, k)), `${Nm(k)} no atalho ${i + 1}.`); return; }
    if (to === 'chao') { const n = It().def(k).coisa ? 1 : Inv().count(G.Possess.body(), k); tell(G.Possess.apply(w => G.Inv.drop(w, k, n)), `Você larga ${nm(k)} no chão.`); return; }
    if (to === 'armazem') tell(G.Possess.apply(w => G.Inv.unmake(w, k)), `Você devolve ${nm(k)} ao armazém.`);
  }
  // (on and off at once: a double click, a card's button)
  function wear(k) {
    const e = Inv().equipOf(G.Possess.body()); const on = It().SLOTS.find(s => e[s] === k);
    if (on) tell(G.Possess.apply(w => G.Inv.unequip(w, on)));
    else tell(G.Possess.apply(w => G.Inv.equip(w, k)));
  }

  // ------------------------------ the panel ------------------------------
  function build() {
    const root = G.IncUI && G.IncUI.root && G.IncUI.root(); if (!root || panel) return !!panel;
    panel = document.createElement('div'); panel.id = 'inv-panel'; panel.className = 'panel hidden';
    root.appendChild(panel);
    panel.addEventListener('pointerdown', onDown);
    panel.addEventListener('pointerover', e => { const t = e.target.closest('[data-k]'); if (t && !drag) { hover = t.dataset.k; card(); } });
    panel.addEventListener('pointerleave', () => { if (!drag) { hover = null; card(); } });
    panel.addEventListener('click', onClick);
    panel.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', () => endDrag());
    G.IncUI.closers.push(() => { if (open) hide(); });
    return true;
  }
  UI.isOpen = () => open;
  UI.open = function () {
    if (!G.Modes.inc() || !G.Possess.body() || !build()) return false;
    G.IncUI.closeAll(); G.Modes.setPanel('mochila'); G.Input3D.unlock(); G.Input3D.clear();
    open = true; sel = null; hover = null; sig = ''; panel.classList.remove('hidden'); render(true);
    return true;
  };
  function hide() {
    open = false; endDrag(); sel = null; hover = null;
    if (panel) panel.classList.add('hidden');
    if (G.Modes.panelIs('mochila')) G.Modes.setPanel(null); // (another panel that took the screen keeps its own mark)
    renderBar(true);
  }
  UI.close = () => { if (open) hide(); };
  UI.toggle = () => (open ? (hide(), false) : UI.open());

  // the body and its six places (the main hand on the left of the screen, as a body faced)
  const DOLL = '<svg class="iv-fig" viewBox="0 0 160 250" aria-hidden="true"><g fill="rgba(255,236,200,.07)" stroke="rgba(255,236,200,.22)" stroke-width="1.5"><circle cx="80" cy="34" r="19"/><path d="M50 62q30-12 60 0l10 64-12 4-6-46-2 54 4 98h-18l-6-82-6 82H56l4-98-2-54-6 46-12-4z"/></g></svg>';
  const POS = { cabeca: [50, 1], costas: [84, 4], corpo: [50, 29], mao: [15, 40], outra: [85, 40], cinto: [50, 57] }; // (the middle of each place, in % of the figure)
  function slotHTML(s, e, held, v) {
    const k = e[s]; const two = (s === 'outra' && e.mao && It().def(e.mao).maos >= 2) ? e.mao : (s === 'mao' && e.outra && It().def(e.outra).maos >= 2) ? e.outra : null;
    const busy = (s === 'mao' || s === 'outra') && v.carry && v.carry.n > 0;
    const cls = ['iv-slot', k ? 'full' : '', sel && sel.k && It().fits(sel.k, s) ? 'can' : '', two ? 'two' : '', busy ? 'busy' : ''].filter(Boolean).join(' ');
    const inner = k ? `<span class="ic" data-k="${esc(k)}" data-from="${s}">${UI.sign(k)}</span>` : two ? `<span class="ic ghost">${UI.sign(two)}</span>` : '';
    return `<div class="${cls}" data-drop="slot:${s}" style="left:${POS[s][0]}%;top:${POS[s][1]}%" title="${esc(SLOT_AT[s] + (k ? ': ' + G.cap(nm(k)) : ''))}">${inner}<label>${SLOT_AT[s]}</label></div>`;
  }
  function render(force) {
    const v = G.Possess.body(); if (!panel || !v) return;
    const I = Inv(); const list = I.list(v); const e = I.equipOf(v); const w = I.weight(v), cap = I.cap(v);
    const st = I.storeNear(v); const ground = I.near(v);
    const s = JSON.stringify([list.map(x => [x.k, x.n, x.on]), e, v.carry ? [v.carry.k, v.carry.n] : 0, st ? st.id : 0, ground.map(o => [o.g, o.k, o.n]), sel, cap, st ? G.Fac.get(G.Fac.idOfV(v)).stock.ferramentas + ':' + G.Fac.get(G.Fac.idOfV(v)).stock.armas : 0]);
    if (!force && s === sig) return; sig = s;
    const held = I.held(v);
    // (what is in no place: the grid; the placed ones show on the body, and in the grid dimmed with their count)
    const cells = list.map(x => { const free = x.n - x.on.length; const k = x.k; const d = x.d;
      return `<div class="iv-cell${sel && sel.k === k ? ' sel' : ''}${x.on.length && free < 1 - 1e-6 ? ' worn' : ''}" data-drop="bag"><span class="ic" data-k="${esc(k)}" data-from="bag">${UI.sign(k)}</span>${x.n > 1 + 1e-6 ? `<b>${Math.round(x.n * 100) / 100}</b>` : ''}${x.on.length ? `<i title="${esc(x.on.map(o => WHERE[o]).join(', '))}"></i>` : ''}<small>${esc(d.nome)}</small></div>`; });
    while (cells.length < CELLS || cells.length % 6) cells.push('<div class="iv-cell empty" data-drop="bag"></div>');
    const over = w > cap + 1e-6;
    let h = `<button class="x" data-a="close" title="Fechar (${esc(G.Input3D.label('inventario'))} ou Esc)">×</button>
      <div class="iv-head"><h3>Mochila e equipamento</h3><div class="sub">${esc(v.name)} · leva até ${String(cap).replace('.', ',')} kg${v.carry && v.carry.n > 0 ? ` · nas mãos: ${esc(G.Eco.name(v.carry.k))}` : ''}</div></div>
      <div class="iv-body"><div class="iv-doll">${DOLL}${It().SLOTS.map(s2 => slotHTML(s2, e, held, v)).join('')}</div>
      <div class="iv-bag"><div class="iv-wt${over ? ' over' : ''}"><span>Peso</span><i><b style="width:${Math.min(100, cap ? w / cap * 100 : 100).toFixed(1)}%"></b></i><span>${(Math.round(w * 10) / 10).toString().replace('.', ',')} / ${String(cap).replace('.', ',')} kg${over ? ' · pesado demais' : ''}</span></div>
      <div class="iv-grid" data-drop="bag">${cells.join('')}</div>
      <div class="iv-drops"><div class="iv-zone" data-drop="chao">Largar no chão</div>${st ? '<div class="iv-zone" data-drop="armazem">Devolver ao armazém</div>' : ''}</div></div>
      <div class="iv-card"></div></div>`;
    // (at the people's store — what one's own people keeps is one's to know, G.Possess.knows.stock —: what it can give)
    if (st && G.Possess.knows.stock(v, st)) {
      const f = G.Fac.get(G.Fac.idOfV(v)); const arts = I.artsOf(v); const have = g => Math.floor(((f && f.stock[g]) || 0) * 100) / 100;
      const kinds = ['machado', 'picareta', 'pa', 'enxada', 'foice', 'martelo', 'faca', 'vara', 'rede', 'remo', 'espada', 'lanca', 'clava', 'arco', 'flecha', 'escudo', 'elmo', 'couraca', 'cajado', 'tocha', 'cesto', 'balde'].filter(kd => It().can(kd, arts));
      h += `<div class="iv-store"><label>No armazém do seu povo — ferramentas ${have('ferramentas')}, armas ${have('armas')}, madeira ${Math.floor(have('wood'))}</label><div class="iv-take">${kinds.map(kd => { const k = It().best(kd, arts); const b = It().bemOf(k); const n = kd === 'flecha' ? 20 : 1; const can = b && have(b.k) + 1e-6 >= b.n * n;
        return `<button data-a="make" data-kind="${kd}"${can ? '' : ' disabled'} title="${esc(`${G.cap(It().nome(k, n))} — ${b ? Math.round(b.n * n * 100) / 100 + ' de ' + G.Eco.name(b.k) : ''}`)}">${UI.sign(k)}<span>${esc(kd === 'flecha' ? '20 flechas' : It().def(k).nome)}</span></button>`; }).join('')}</div></div>`;
    }
    if (ground.length) h += `<div class="iv-store"><label>No chão, ao alcance</label><div class="iv-take">${ground.slice(0, 8).map(o => `<button data-a="pick" data-g="${o.g}">${UI.sign(o.k)}<span>${esc(G.cap(It().nome(o.k, o.n)))}${o.n > 1 + 1e-6 ? ' ×' + Math.round(o.n * 100) / 100 : ''}</span></button>`).join('')}</div></div>`;
    h += `<div class="iv-hint">${G.Input3D.touch ? 'Toque numa coisa e depois num lugar do corpo, num atalho ou no chão.' : 'Arraste para o corpo, para um atalho ou para o chão · clique duplo equipa ou tira · 1–5 sobre uma coisa: atalho'} · <kbd>${esc(G.Input3D.label('inventario'))}</kbd> ou <kbd>Esc</kbd> fecha</div>`;
    const top = panel.scrollTop; panel.innerHTML = h; panel.scrollTop = top;
    card(); renderBar(true);
  }
  // the card of the thing the pointer is over (or the one chosen)
  function card() {
    if (!panel) return; const c = panel.querySelector('.iv-card'); if (!c) return;
    const v = G.Possess.body(); const k = (sel && sel.k) || hover; const I = Inv(), T = It();
    if (!v || !k || !T.def(k)) { c.innerHTML = `<div class="iv-none">${G.Input3D.touch ? 'Toque numa coisa para ver o que ela é.' : 'Passe o mouse sobre uma coisa para ver o que ela é.'}</div>`; return; }
    const d = T.def(k); const n = I.count(v, k); const e = I.equipOf(v); const on = T.SLOTS.filter(s => e[s] === k);
    const rows = [];
    rows.push(['Tipo', `${T.TIPO_NOME[d.tipo] || d.tipo}${d.coisa && d.maos ? ` · ${d.maos >= 2 ? 'duas mãos' : 'uma mão'}` : ''}`]);
    rows.push(['Peso', `${String(Math.round(d.peso * 100) / 100).replace('.', ',')} kg${n > 1 + 1e-6 ? ` cada (${Math.round(n * 100) / 100})` : ''}`]);
    const uses = T.usos(k); if (uses.length && d.coisa) rows.push(['Serve para', uses.join(', ')]);
    const meas = []; if (d.dano) meas.push(`golpe ${d.dano}`); if (d.alcance) meas.push(`alcance ${String(d.alcance).replace('.', ',')} m`); if (d.bloqueio) meas.push(`apara ${Math.round(d.bloqueio * 100)}%`); if (d.protecao) meas.push(`protege ${Math.round(d.protecao * 100)}%`);
    if (meas.length) rows.push(['Medidas', meas.join(' · ')]);
    const b = T.bemOf(k); if (d.coisa && b) rows.push(['No armazém', `vale ${Math.round(b.n * 100) / 100} de ${G.Eco.name(b.k)}`]);
    rows.push(['Onde', on.length ? on.map(s => WHERE[s]).join(', ') : 'na mochila']);
    const btn = [];
    if (d.coisa && (T.mao(k) || T.veste(k) || T.guarda(k))) btn.push(`<button data-a="wear" data-k2="${esc(k)}">${on.length ? 'Tirar' : T.veste(k) ? 'Vestir' : 'Equipar'}</button>`);
    if (on.some(s => s === 'mao' || s === 'outra')) btn.push(`<button data-a="stow">Guardar <kbd>${esc((T.guarda(k) && WHERE[T.guarda(k)]) || 'na mochila')}</kbd></button>`);
    btn.push(`<button data-a="drop" data-k2="${esc(k)}">Largar</button>`);
    btn.push(`<span class="iv-qs">${Array.from({ length: NQ }, (_, i) => `<button data-a="quickset" data-i="${i}" data-k2="${esc(k)}" class="${e.atalhos[i] === k ? 'on' : ''}" title="Atalho ${i + 1}">${i + 1}</button>`).join('')}</span>`);
    c.innerHTML = `<div class="iv-ch"><span class="ic big">${UI.sign(k)}</span><div><h4>${esc(G.cap(T.nome(k, n)))}</h4><div class="sub">${esc(d.coisa ? (d.mat && T.KINDS[d.kind].mats.length > 1 ? d.nomeMat.replace(/^de /, '') : T.TIPO_NOME[d.tipo]) : 'bem do armazém')}</div></div></div>${d.desc ? `<div class="iv-desc">${esc(d.desc)}</div>` : ''}<table class="ic-rows">${rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table><div class="btns">${btn.join('')}</div>`;
  }
  function onClick(e) {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'close') { hide(); return; }
    if (a === 'wear') wear(b.dataset.k2);
    else if (a === 'stow') tell(G.Possess.apply(w => G.Inv.stow(w)));
    else if (a === 'drop') act(b.dataset.k2, 'bag', 'chao');
    else if (a === 'quickset') { const i = +b.dataset.i, k = b.dataset.k2; const cur = Inv().equipOf(G.Possess.body()).atalhos[i]; tell(G.Possess.apply(w => G.Inv.shortcut(w, i, cur === k ? null : k))); }
    else if (a === 'make') { const kd = b.dataset.kind; tell(G.Possess.apply(w => G.Inv.make(w, kd)), r => `Você pega ${It().nome(r.k, r.n)} no armazém.`); }
    else if (a === 'pick') { const g = +b.dataset.g; tell(G.Possess.apply(w => G.Inv.pick(w, g)), r => `Você pega ${It().nome(r.k, r.n)} do chão.`); }
  }

  // ------------------------------ the pointer: drag on a PC, two taps on a phone ------------------------------
  const targetAt = (x, y) => { const el = document.elementFromPoint(x, y); const t = el && el.closest ? el.closest('[data-drop]') : null; return t ? t.dataset.drop : null; };
  function onDown(e) {
    const t = e.target.closest('[data-k]'); if (!t || e.button > 0) return;
    press = { k: t.dataset.k, from: t.dataset.from || 'bag', x: e.clientX, y: e.clientY, id: e.pointerId, touch: e.pointerType !== 'mouse' };
    if (!press.touch) e.preventDefault();
  }
  function onMove(e) {
    if (!press || e.pointerId !== press.id) return;
    if (!drag && !press.touch && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) {
      drag = press; sel = { k: drag.k, from: drag.from }; ghost = document.createElement('div'); ghost.className = 'iv-ghost'; ghost.innerHTML = UI.sign(drag.k);
      G.IncUI.root().appendChild(ghost); panel.classList.add('dragging'); markCan(); if (bar) bar.classList.add('dragging');
    }
    if (drag && ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; const to = targetAt(e.clientX, e.clientY); for (const el of document.querySelectorAll('#inc-root .over')) el.classList.remove('over'); const el = to && document.querySelector(`#inc-root [data-drop="${to}"]`); if (el && to !== 'bag') el.classList.add('over'); }
  }
  function onUp(e) {
    if (!press || e.pointerId !== press.id) return;
    const p = press; press = null;
    if (drag) { const to = targetAt(e.clientX, e.clientY); const d = drag; endDrag(); sel = null; act(d.k, d.from, to); sig = ''; return; }
    // (a click, a tap: the thing is chosen — a second click on it soon is a double click: on or off)
    const now = performance.now();
    if (!p.touch && lastClick.k === p.k && now - lastClick.t < 360) { lastClick.k = null; sel = null; wear(p.k); return; }
    lastClick = { k: p.k, t: now };
    sel = sel && sel.k === p.k && sel.from === p.from ? null : { k: p.k, from: p.from };
    sig = ''; render(); markCan();
  }
  // (a tap where something chosen can go: the place, the bag, a key of the bar, the ground)
  function tapTarget(e) {
    if (!sel || press || drag) return false;
    const t = e.target.closest('[data-drop]'); if (!t || e.target.closest('[data-k]')) return false;
    e.stopPropagation(); e.preventDefault(); const to = t.dataset.drop; const s = sel; sel = null; act(s.k, s.from, to); sig = ''; render(); markCan(); return true;
  }
  function markCan() { if (!panel) return; panel.classList.toggle('choosing', !!sel); for (const el of panel.querySelectorAll('.iv-slot')) { const s = el.dataset.drop.slice(5); el.classList.toggle('can', !!(sel && It().fits(sel.k, s))); } if (bar) bar.classList.toggle('choosing', !!sel); }
  function endDrag() { drag = null; if (ghost) { ghost.remove(); ghost = null; } if (panel) panel.classList.remove('dragging'); if (bar) bar.classList.remove('dragging'); for (const el of document.querySelectorAll('#inc-root .over')) el.classList.remove('over'); }
  document.addEventListener('click', e => { if (open && panel && (panel.contains(e.target) || (bar && bar.contains(e.target)))) tapTarget(e); }, true);

  // ------------------------------ the bar of quick things ------------------------------
  function buildBar() {
    const hud = G.IncUI && G.IncUI.hud && G.IncUI.hud(); if (!hud) return false; if (bar) return true;
    bar = hud.querySelector('.ih-hotbar'); if (!bar) return false;
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-q], [data-a]'); if (!b) return;
      if (b.dataset.a === 'bag') { UI.toggle(); return; }
      if (open && sel) return; // (a thing chosen in the bag goes to this key: the tap is the panel's)
      const i = +b.dataset.q; quick(i);
    });
    bar.addEventListener('contextmenu', e => { e.preventDefault(); const b = e.target.closest('[data-q]'); if (b) tell(G.Possess.apply(w => G.Inv.shortcut(w, +b.dataset.q, null))); });
    bar.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
    return true;
  }
  function quick(i) { tell(G.Possess.apply(w => G.Inv.quick(w, i)), r => (r.did === 'mao' ? `${Nm(r.k)} na mão.` : r.did === 'guardou' ? `${Nm(r.k)} guardad${G.gen && G.gen(It().def(r.k).nome) === 'a' ? 'a' : 'o'}.` : r.did === 'vestiu' ? `Você põe ${nm(r.k)}.` : `Você tira ${nm(r.k)}.`)); }
  function renderBar(force) {
    const v = G.Possess.body(); if (!bar || !v) return;
    const e = Inv().equipOf(v); const held = Inv().held(v);
    const s = JSON.stringify([e.atalhos, held, e.atalhos.map(k => (k ? Inv().count(v, k) : 0)), G.Input3D.touch, open]);
    if (!force && s === barSig) return; barSig = s;
    bar.classList.toggle('touch', !!G.Input3D.touch);
    bar.innerHTML = `<div class="iv-hot">${e.atalhos.map((k, i) => { const on = k && (held.mao === k || held.outra === k || held.cabeca === k || held.corpo === k); const n = k ? Inv().count(v, k) : 0;
      return `<button class="iv-q${k ? '' : ' empty'}${on ? ' on' : ''}" data-q="${i}" data-drop="q:${i}" title="${esc(k ? G.cap(nm(k)) : 'Atalho vazio')}"><kbd>${esc(G.Input3D.label('rapido' + (i + 1)) || i + 1)}</kbd>${k ? `<span class="ic"${n > 0 ? '' : ' style="opacity:.35"'}>${UI.sign(k)}</span>` : ''}${k && n > 1 + 1e-6 ? `<b>${Math.round(n)}</b>` : ''}</button>`; }).join('')}<button class="iv-q iv-bagbtn${open ? ' on' : ''}" data-a="bag" title="Mochila e equipamento (${esc(G.Input3D.label('inventario'))})"><kbd>${esc(G.Input3D.label('inventario'))}</kbd><svg viewBox="0 0 48 48" aria-hidden="true">${P('M15 17q0-9 9-9t9 9', 0, '#c9a464', 2.6)}${P('M10 17h28l-2 24H12z', '#7a5230', 'rgba(0,0,0,.4)', 1.2)}${P('M17 25h14v7H17z', '#9a6e44', 'rgba(0,0,0,.3)', 1)}</svg></button></div>`;
  }

  // ------------------------------ the keys ------------------------------
  // (the bag's key opens and shuts it; a quick key uses its thing — or, with the bag open and the pointer over a thing, gives it
  // that key)
  G.Input3D.on('inventario', () => { UI.toggle(); return true; });
  for (let i = 0; i < NQ; i++) G.Input3D.on('rapido' + (i + 1), () => {
    if (open && (hover || (sel && sel.k))) { const k = hover || sel.k; tell(G.Possess.apply(w => G.Inv.shortcut(w, i, k)), `${Nm(k)} no atalho ${i + 1}.`); return true; }
    if (!open) quick(i); return true;
  });

  // ------------------------------ the frame ------------------------------
  // (a few times a second: the bar and the panel drawn again when what they show has changed — only read from the world)
  UI.frame = function (rdt) {
    if (!G.Modes || !G.IncUI || !G.IncUI.hud || !G.IncUI.hud()) return;
    if (!G.Modes.inc()) { if (open) hide(); return; }
    buildBar(); build();
    const v = G.Possess.body(); if (!v) return;
    if (open && !G.Modes.panelIs('mochila')) hide(); // (another panel took the screen: the card of oneself, the diary)
    upT -= rdt || 0; if (upT > 0) return; upT = 0.15;
    // (the first time a life is lived with things: what the body carries, and how to open the bag — once a body)
    if (v.id !== lastBody) { lastBody = v.id; sig = ''; barSig = ''; }
    if (!told.has(v.id) && Inv().real(v)) { told.add(v.id); const L = Inv().list(v); if (L.length) G.IncUI.toast(`Você leva ${L.slice(0, 3).map(x => It().nome(x.k, x.n)).join(', ')}${L.length > 3 ? '…' : ''} — ${G.Input3D.label('inventario')} abre a mochila.`, 5); }
    renderBar(); if (open) render();
    // (the keys' hint of the first seconds of a life sits where the bar does: the bar comes in as it goes)
    const hint = G.IncUI.hud().querySelector('.ih-hint'); if (bar) bar.classList.toggle('later', !!hint && !hint.classList.contains('hidden') && hint.offsetParent !== null && !open);
  };
  // (the body's screen's own frame carries this one: the same beat, the same pause — the frames the proofs drive by hand too)
  const frame0 = G.IncUI.frame;
  G.IncUI.frame = function (rdt) { const r = frame0.apply(this, arguments); UI.frame(rdt); return r; };
})(window.G);
