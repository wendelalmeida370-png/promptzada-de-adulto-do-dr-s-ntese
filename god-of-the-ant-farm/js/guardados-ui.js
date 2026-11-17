'use strict';
// ============================================================
//  GuardUI: the screen of what is kept (20e, D-402) — the bag on
//  one side and, on the other, what the body's hands can reach:
//  a house's things (its chest, its jars, its shelves — 'h:'), a
//  building's shelf ('b:'), a stall's counter ('z:'), the people's
//  store ('f:': the tools and weapons its goods make, its goods),
//  or someone to give a thing to. In the look of the bag's screen
//  (inv-ui.js): on a PC a thing is dragged from one side to the
//  other (or to the ground), a double click sends it across; on a
//  phone a tap chooses it and a tap on the other side does it.
//  Only seen: it reads the bag (G.Inv), the holder (G.Depot) and
//  asks every change of the world through the body's hands —
//  G.Possess.apply(w => G.Interact.fetch / stash / give, G.Inv.drop)
//  —, by the depot's rule of who may take and put (G.Depot.may):
//  the world does it in its step, in the ledger, and the screen
//  tells its answer. Opened by the verbs of interact.js (a chest,
//  a store's door, a person's F); it shuts when the holder is gone
//  (the house burnt), out of reach, or the one to give to is gone.
// ============================================================
(function (G) {
  const UI = G.GuardUI = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const It = () => G.Itens, Inv = () => G.Inv, D = () => G.Depot;
  let panel = null, open = false, spec = null, sel = null, hover = null, press = null, drag = null, ghost = null, lastClick = { k: null, side: null, t: 0 }, sig = '', upT = 0, closer = false;
  G.worldHooks.push(() => { if (open) hide(); spec = null; sel = null; hover = null; sig = ''; });
  UI.isOpen = () => open;
  UI.spec = () => (spec ? Object.assign({}, spec) : null);
  const sign = k => (G.InvUI && G.InvUI.sign ? G.InvUI.sign(k) : `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" fill="#c8a878"/></svg>`);
  const nm = (k, n) => It().nome(k, n);
  const txt = (k, n) => (G.Interact && G.Interact.thingTxt ? G.Interact.thingTxt(k, n) : nm(k, n));
  const r2 = x => Math.round(x * 100) / 100;

  // ------------------------------ what the other side is ------------------------------
  // (the holder's words: its name, whose it is — and the building, the piece, the one to give to)
  function other(v) {
    if (!spec) return null; const S = G.S;
    if (spec.kind === 'dar') { const o = S.villagers.get(spec.id); return o ? { kind: 'dar', o, title: `Dar a ${G.Possess.knows.call(v, o)}` } : null; }
    const ref = spec.ref; if (!D().exists(ref)) return null; const [k] = D().parse(ref); const b = spec.b ? S.buildings.get(spec.b) : null;
    const piece = spec.it !== undefined && b && G.Space.plan ? ((G.Space.plan(b) || { items: [] }).items.find(q => q.id === spec.it) || null) : null;
    const pn = piece ? ((G.Interiors.ITEMS || {})[piece.kind] || {}).name : null;
    const bn = b ? G.Village.buildName(b) : '';
    const title = k === 'f' ? `O armazém do seu povo${b && b.type !== 'storehouse' ? ' — ' + bn.toLowerCase() : ''}` : k === 'h' ? `${pn ? pn + ' — ' : ''}a sua casa` : k === 'z' ? `${pn || 'A banca'}` : `${pn ? pn + ' — ' : ''}${bn}`;
    return { kind: k, ref, b, piece, title: G.cap(title) };
  }
  // (what the other side holds, as cells: { k, n, can (may be taken now), why, make (a kind the store makes) })
  function cellsOf(v, o) {
    const out = [];
    if (o.kind === 'dar') { const h = Inv().held(o.o); for (const s of It().SLOTS) if (h[s]) out.push({ k: h[s], n: 1, can: false, why: 'É de quem leva.', worn: s }); return out; }
    const may = D().may(v, o.ref, 'take');
    if (o.kind === 'f') {
      // (the people's store: what its goods make now — the tools and the weapons, in what it has: Inv.offer, 20h —, and its goods)
      for (const kind of Object.keys(It().KINDS)) { const f = Inv().offer(v, kind); if (!f.k) continue; out.push({ k: f.k, n: f.n || 1, can: !!f.can && may.ok, why: f.can ? may.why || '' : f.why, make: kind, need: f.need }); }
      const L = D().list(o.ref); for (const k of Object.keys(L).sort()) { if (k === 'moedas' || k === 'water' || !It().def(k) || !(L[k] >= 1)) continue; out.push({ k, n: Math.floor(L[k] * 100) / 100, can: may.ok, why: may.why || '', good: 1 }); }
      return out;
    }
    if (!may.ok) return out; // (a holder one may only put into: what it holds is not one's to see)
    const L = D().list(o.ref); for (const k of Object.keys(L).sort()) { if (k === 'moedas' || k === 'water' || !It().def(k)) continue; const n = D().free(o.ref, k); if (!(n > 1e-6)) continue; out.push({ k, n: r2(n), can: true, why: '', good: It().isThing(k) ? 0 : 1 }); }
    return out;
  }

  // ------------------------------ the hands' asking ------------------------------
  function tell(ask, ok) { G.IncUI.when(ask, r => { if (ok) G.IncUI.toast(typeof ok === 'function' ? ok(r) : ok, 2.6); sig = ''; }, r => { if (r.why) G.IncUI.toast(r.why, 2.8); sig = ''; }); }
  // (a thing across: from the bag to the other side, or from the other side to the bag; to the ground)
  function act(k, from, to) {
    const v = G.Possess.body(); const o = v && other(v); if (!k || !o || from === to) return;
    const one = It().isThing(k);
    if (to === 'chao' && from === 'bag') { const n = one ? 1 : Inv().count(v, k); tell(G.Possess.apply(w => G.Inv.drop(w, k, n)), `Você larga ${txt(k, n)} no chão.`); return; }
    if (from === 'bag' && to === 'other') {
      if (o.kind === 'dar') { const id = o.o.id; const n = one ? 1 : Inv().count(v, k); tell(G.Possess.apply(w => { const t = G.S.villagers.get(id); return t ? G.Interact.give(w, t, k, n) : { ok: false, why: 'Não está mais aqui.' }; }), r => `Você dá ${txt(r.k || k, r.n)} a ${G.Possess.knows.call(v, o.o)}.`); return; }
      const n = one ? 1 : Inv().count(v, k); const ref = o.ref;
      tell(G.Possess.apply(w => G.Interact.stash(w, ref, k, n)), r => (ref[0] === 'f' && one ? `Você devolve ${txt(k, 1)} ao armazém.` : `Você guarda ${txt(k, r.n || n)}.`)); return;
    }
    if (from === 'other' && to === 'bag') {
      if (o.kind === 'dar') return; const c = cellsOf(v, o).find(q => q.k === k); if (!c) return; if (!c.can) { G.IncUI.toast(c.why || 'Não dá.', 2.6); return; }
      const ref = o.ref; const n = c.make ? c.n : one ? 1 : c.n;
      tell(G.Possess.apply(w => G.Interact.fetch(w, ref, k, n)), r => `Você pega ${txt(r.k || k, r.n || n)}.`);
    }
  }

  // ------------------------------ the panel ------------------------------
  function build() {
    const root = G.IncUI && G.IncUI.root && G.IncUI.root(); if (!root) return false; if (panel) return true;
    panel = document.createElement('div'); panel.id = 'guard-panel'; panel.className = 'panel hidden'; root.appendChild(panel);
    panel.addEventListener('pointerdown', onDown);
    panel.addEventListener('pointerover', e => { const t = e.target.closest('[data-k]'); if (t && !drag) { hover = { k: t.dataset.k, side: t.dataset.side }; card(); } });
    panel.addEventListener('pointerleave', () => { if (!drag) { hover = null; card(); } });
    panel.addEventListener('click', onClick);
    panel.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', () => endDrag());
    if (!closer) { closer = true; G.IncUI.closers.push(() => { if (open) hide(); }); }
    return true;
  }
  // open the screen for a holder ({ kind: 'guardados', ref, b, it }) or someone to give to ({ kind: 'dar', id }): true when open
  UI.open = function (s) {
    const v = G.Possess.body(); if (!G.Modes.inc() || !v || !s || !build()) return false;
    spec = Object.assign({}, s); if (!other(v)) { spec = null; return false; }
    G.IncUI.closeAll(); G.Modes.setPanel('guardados'); G.Input3D.free(); // (the cursor for the screen; the mouse comes back when it shuts — rule 122)
    open = true; sel = null; hover = null; sig = ''; panel.classList.remove('hidden'); render(true);
    return true;
  };
  function hide() {
    open = false; endDrag(); sel = null; hover = null; if (panel) panel.classList.add('hidden');
    if (G.Modes.panelIs('guardados')) G.Modes.setPanel(null);
  }
  UI.close = () => { if (open) hide(); };
  function cellHTML(c, side) {
    const cls = ['gd-cell', sel && sel.k === c.k && sel.side === side ? 'sel' : '', side === 'other' && !c.can ? 'off' : ''].filter(Boolean).join(' ');
    const n = c.n > 1 + 1e-6 ? `<b>${Math.round(c.n * 100) / 100}</b>` : ''; const label = c.make ? It().def(c.k).nome : nm(c.k, 1);
    return `<div class="${cls}" data-k="${esc(c.k)}" data-side="${side}" title="${esc(G.cap(c.make ? txt(c.k, c.n) : txt(c.k, c.n)) + (side === 'other' && !c.can && c.why ? ' — ' + c.why : ''))}"><span class="ic">${sign(c.k)}</span>${n}${c.on ? '<i></i>' : ''}<small>${esc(label)}</small></div>`;
  }
  function render(force) {
    const v = G.Possess.body(); if (!panel || !v) return; const o = other(v); if (!o) { hide(); return; }
    const bag = Inv().list(v).map(x => ({ k: x.k, n: x.n, on: x.on.length > 0, can: true })); const oc = cellsOf(v, o);
    const s = JSON.stringify([bag.map(c => [c.k, c.n, c.on]), oc.map(c => [c.k, c.n, c.can, c.why]), sel, spec, Inv().weight(v)]);
    if (!force && s === sig) return; sig = s;
    const w = Inv().weight(v), cap = Inv().cap(v); const touch = !!G.Input3D.touch;
    const mayPut = o.kind === 'dar' ? G.Interact.canGive(v, o.o) : D().may(v, o.ref, 'put');
    const head = o.kind === 'dar' ? 'Escolha o que dar' : o.kind === 'f' ? 'Pegue uma ferramenta, uma arma ou o que o armazém guarda; devolva o que não usa' : 'O que está guardado aqui';
    let h = `<button class="x" data-a="close" title="Fechar (Esc ou ${esc(G.Input3D.label('interagir'))})">×</button>
      <div class="iv-head"><h3>${esc(o.title)}</h3><div class="sub">${esc(head)}</div></div>
      <div class="gd-cols">
        <div class="gd-side" data-drop="bag"><label>Na mochila <b>${String(r2(w)).replace('.', ',')} / ${String(cap).replace('.', ',')} kg</b></label><div class="gd-grid">${bag.length ? bag.map(c => cellHTML(c, 'bag')).join('') : '<div class="gd-none">A mochila está vazia.</div>'}</div></div>
        <div class="gd-side" data-drop="other"><label>${esc(o.kind === 'dar' ? 'Com ' + G.Possess.knows.call(v, o.o) : o.kind === 'f' ? 'No armazém' : 'Guardado')} ${mayPut.ok ? '' : `<b title="${esc(mayPut.why || '')}">só para ver</b>`}</label><div class="gd-grid">${oc.length ? oc.map(c => cellHTML(c, 'other')).join('') : `<div class="gd-none">${o.kind === 'dar' ? 'Arraste para cá o que quer dar.' : D().may(v, o.ref, 'take').ok ? 'Nada guardado aqui.' : 'Você não sabe o que há aí dentro.'}</div>`}</div></div>
      </div>
      <div class="gd-foot"><div class="gd-zone" data-drop="chao">Largar no chão</div><div class="gd-hint">${touch ? 'Toque numa coisa e depois no outro lado, ou no chão.' : 'Arraste de um lado para o outro · clique duplo passa para o outro lado'} · <kbd>Esc</kbd> fecha</div></div>
      <div class="gd-card"></div>`;
    const top = panel.scrollTop; panel.innerHTML = h; panel.scrollTop = top; card();
  }
  // the card of the thing the pointer is over (or the one chosen): what it is, and what can be done with it here
  function card() {
    if (!panel) return; const c = panel.querySelector('.gd-card'); if (!c) return; const v = G.Possess.body(); const o = v && other(v);
    const it = (sel && sel.k ? sel : hover); if (!v || !o || !it || !It().def(it.k)) { c.innerHTML = ''; return; }
    const k = it.k; const d = It().def(k); const rows = [];
    rows.push(`<b>${esc(G.cap(nm(k, 1)))}</b> · ${String(r2(d.peso)).replace('.', ',')} kg`);
    if (d.coisa) { const u = It().usos(k); if (u.length) rows.push('serve para ' + esc(u.join(', '))); }
    let btn = '';
    if (it.side === 'bag') btn = `<button data-a="move" data-k2="${esc(k)}" data-from="bag" data-to="other">${o.kind === 'dar' ? 'Dar' : o.kind === 'f' && d.coisa ? 'Devolver ao armazém' : 'Guardar aqui'}</button><button data-a="move" data-k2="${esc(k)}" data-from="bag" data-to="chao">Largar no chão</button>`;
    else if (o.kind !== 'dar') { const cc = cellsOf(v, o).find(q => q.k === k); if (cc) { if (cc.make && cc.need) rows.push('feito de ' + esc(cc.need.map(x => `${r2(x.n)} de ${G.Eco.name(x.k)}`).join(' e '))); btn = `<button data-a="move" data-k2="${esc(k)}" data-from="other" data-to="bag"${cc.can ? '' : ` disabled title="${esc(cc.why || '')}"`}>Pegar</button>${cc.can ? '' : ` <span class="gd-note">${esc(cc.why || '')}</span>`}`; } }
    c.innerHTML = `<div>${rows.join(' · ')}</div><div class="btns">${btn}</div>`;
  }
  function onClick(e) {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'close') { hide(); return; }
    if (a === 'move') { act(b.dataset.k2, b.dataset.from, b.dataset.to); sel = null; sig = ''; render(); }
  }

  // ------------------------------ the pointer: drag on a PC, two taps on a phone ------------------------------
  const zoneAt = (x, y) => { const el = document.elementFromPoint(x, y); const t = el && el.closest ? el.closest('#guard-panel [data-drop]') : null; return t ? t.dataset.drop : null; };
  function onDown(e) {
    const t = e.target.closest('[data-k]'); if (!t || e.button > 0) return;
    press = { k: t.dataset.k, side: t.dataset.side, x: e.clientX, y: e.clientY, id: e.pointerId, touch: e.pointerType !== 'mouse' };
    if (!press.touch) e.preventDefault();
  }
  function onMove(e) {
    if (!press || e.pointerId !== press.id) return;
    if (!drag && !press.touch && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) {
      drag = press; sel = { k: drag.k, side: drag.side }; ghost = document.createElement('div'); ghost.className = 'gd-ghost'; ghost.innerHTML = sign(drag.k); G.IncUI.root().appendChild(ghost); panel.classList.add('dragging'); mark();
    }
    if (drag && ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; const z = zoneAt(e.clientX, e.clientY); for (const el of panel.querySelectorAll('.over')) el.classList.remove('over'); const el = z && panel.querySelector(`[data-drop="${z}"]`); if (el && z !== drag.side) el.classList.add('over'); }
  }
  function onUp(e) {
    if (!press || e.pointerId !== press.id) return; const p = press; press = null;
    if (drag) { const z = zoneAt(e.clientX, e.clientY); const d = drag; endDrag(); sel = null; if (z && z !== d.side) act(d.k, d.side, z); sig = ''; render(); return; }
    // (a click, a tap: the thing is chosen — a second click on it soon sends it across)
    const now = performance.now();
    if (!p.touch && lastClick.k === p.k && lastClick.side === p.side && now - lastClick.t < 360) { lastClick.k = null; sel = null; act(p.k, p.side, p.side === 'bag' ? 'other' : 'bag'); sig = ''; render(); return; }
    lastClick = { k: p.k, side: p.side, t: now };
    sel = sel && sel.k === p.k && sel.side === p.side ? null : { k: p.k, side: p.side }; sig = ''; render(); mark();
  }
  // (a tap on the other side, or the ground, with a thing chosen: it goes there)
  function tapZone(e) {
    if (!sel || press || drag) return false; const t = e.target.closest('[data-drop]'); if (!t || e.target.closest('[data-k]') || e.target.closest('[data-a]')) return false;
    const z = t.dataset.drop; if (z === sel.side) return false; e.stopPropagation(); e.preventDefault(); const s = sel; sel = null; act(s.k, s.side, z); sig = ''; render(); mark(); return true;
  }
  function mark() { if (!panel) return; for (const el of panel.querySelectorAll('[data-drop]')) el.classList.toggle('can', !!sel && el.dataset.drop !== sel.side && (el.dataset.drop !== 'chao' || sel.side === 'bag')); }
  function endDrag() { drag = null; if (ghost) { ghost.remove(); ghost = null; } if (panel) { panel.classList.remove('dragging'); for (const el of panel.querySelectorAll('.over')) el.classList.remove('over'); } }
  document.addEventListener('click', e => { if (open && panel && panel.contains(e.target)) tapZone(e); }, true);

  // ------------------------------ the frame ------------------------------
  // (a few times a second, from the body's screen — IncUI's prompt frame —: drawn again when what it shows changed; shut when the
  // holder is gone, out of the hands' reach, or the one to give to is gone or too far)
  UI.frame = function (rdt) {
    if (!open) return; if (!G.Modes.inc() || !G.Modes.panelIs('guardados')) { hide(); return; }
    upT -= rdt || 0; if (upT > 0) return; upT = 0.15;
    const v = G.Possess.body(); if (!v) { hide(); return; } const o = other(v);
    if (!o) { G.IncUI.toast(spec && spec.kind === 'dar' ? 'Não está mais aqui.' : 'Isso não existe mais.', 2.6); hide(); return; }
    const far = o.kind === 'dar' ? !G.Interact.canGive(v, o.o).ok && G.dist(v.x, v.y, o.o.x, o.o.y) * G.Space.TILE > 3.8 : !Inv().reaches(v, o.ref);
    if (far) { G.IncUI.toast('Longe demais: os guardados ficaram para trás.', 2.6); hide(); return; }
    render();
  };
})(window.G);
