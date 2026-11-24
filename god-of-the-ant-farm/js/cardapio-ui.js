'use strict';
// ============================================================
//  The body at a tavern's table (P7, D-767, D-768): the hands at
//  the table and at the counter, and the menu of the house.
//  Seated at a tavern open for the evening, the keeper comes to
//  the table (act-taverna.js, the world's step) and the menu
//  opens by itself: what the house has now — the drinks of the
//  people, the dishes of the kitchen by what they are made of —,
//  each with the house's price or «não há», and the coins one
//  has (G.Possess.knows). The choice goes by the body's hands
//  (G.Possess.apply → G.Taverna.order): the keeper fetches it
//  and brings it to the table. Then the hands at the table — a
//  sip, a mouthful, the gestures of mesa-clips.js, the world
//  doing each at its contact (G.Taverna.bite) —; the plate eaten
//  to the end by itself, the cup a sip now and then; the keeper
//  called again for more. With nobody to come: the counter, and
//  the shelf's menu by one's own hands. Only seen: it reads the
//  world (G.Taverna.corpo / carta) and asks every change of it
//  through the body's hands; it never writes the tables.
// ============================================================
(function (G) {
  const UI = G.CardapioUI = {};
  const I = G.Interact; if (!I || !G.Possess) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = () => G.Taverna, P = () => G.Possess;
  const L = () => G.Space.TILE;
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const def = nm => String(nm || '').replace(/^um /, 'o ').replace(/^uma /, 'a '); // («um prato de arroz» → «o prato de arroz»)
  const toast = (txt, d) => { if (txt && G.IncUI && G.IncUI.toast) G.IncUI.toast(txt, d || 2.6); };
  const deny = r => { if (r && r.why) toast(r.why); if (G.Audio && G.Audio.play) G.Audio.play('deny'); };
  let panel = null, open = false, shown = { op: 0, ck: -1 }, sel = -1, sig = '', upT = 0, closer = false, items = [], busy = false, note = '';
  let auto = null, said = { so: 0, sem: 0, mao: 0, ch: 0, cv: '' };
  G.worldHooks.push(() => { if (open) hide(true); shown = { op: 0, ck: -1 }; sel = -1; sig = ''; auto = null; said = { so: 0, sem: 0, mao: 0, ch: 0, cv: '' }; });
  UI.isOpen = () => open;

  // ------------------------------ the hands at the table and at the counter ------------------------------
  // a sip of the round or a mouthful of the plate: the gesture of the table — seated, the meal's (mesa-comer) and the sip's
  // (mesa-beber); standing with the cup, the standing sip —, in the body's own time, the world doing it at the contact
  function bite(s) {
    const food = !!s.hold.food; const A3 = G.Anim3D; const anim = food ? 'mesa-comer' : s.seat ? 'mesa-beber' : 'ato-beber';
    const C = A3 && A3.CLIPS ? A3.CLIPS[anim] : null; const dur = C ? C.dur : 2.6; const contact = dur * (C && C.events ? C.events.contact : 0.45);
    return G.Avatar.act({ anim, dur, contact, vact: food ? 'dine' : 'drink', free: true,
      op: w => T().bite(w),
      then: r => { if (r.last) toast(r.food ? 'Você raspa o prato.' : 'Você esvazia a caneca e a deixa na mesa.', 2.4); },
      fail: r => { if (auto) auto.stop = true; deny(r); } });
  }
  const kname = id => { const o = G.S.villagers.get(id); return o ? P().knows.call(P().body(), o) : 'o taverneiro'; };
  const drinkWord = k => (G.Tavern && G.Tavern.NAME && G.Tavern.NAME[k] ? G.Tavern.NAME[k][0] : 'bebida');
  // (the one thing the hands mean at the table, by the moment: what the house brought; the menu open; the order on its way; the
  // keeper called — or no one to call, the counter's way)
  I.add({
    id: 'taverna', prio: 4.45, reach: 2.4,
    find(ctx) {
      const s = T() && T().corpo ? T().corpo(ctx.v) : null; if (!s || !s.open) return [];
      if (s.seat || s.hold) return [{ s, X: ctx.X + Math.cos(ctx.yaw) * 0.45, Z: ctx.Z + Math.sin(ctx.yaw) * 0.45, pref: 2 }];
      if (s.counter && s.atCounter) return [{ s, bal: 1, X: s.counter[0] * L(), Z: s.counter[1] * L(), pref: 1 }];
      return [];
    },
    label(ctx, t) {
      const s = t.s;
      if (t.bal) return s.serving && !s.mine ? 'Pedir no balcão' : 'Servir-se no balcão';
      if (s.hold) return s.hold.food ? `Comer ${def(s.hold.nome)}` : `Beber um gole de ${drinkWord(s.hold.k)}`;
      if (s.cv === 'carta') return 'Ver o cardápio';
      if (s.cv === 'pedido') return `Esperando ${def(s.pedido ? s.pedido.nome : 'o pedido')}`;
      if (s.cv === 'mesa') return s.mesa && s.mesa.aqui ? `${cap(def(s.mesa.nome))} na mesa` : 'O seu pedido está na outra mesa'; // (D-790)
      if (s.cv === 'chama') return s.can && !s.so ? `Esperando ${kname(s.keeper)}` : 'Ninguém para servir';
      return s.can ? `Chamar ${kname(s.keeper)}` : 'Ninguém para servir';
    },
    can(ctx, t) {
      const s = t.s;
      if (t.bal) return s.serving && !s.mine ? { ok: false, why: `Sente-se a uma mesa: ${kname(s.keeper)} serve à mesa.` } : { ok: true };
      if (s.hold) return s.hold.food && !s.seat ? { ok: false, why: 'Sente-se a uma mesa para comer.' } : { ok: true };
      if (s.cv === 'carta') return { ok: true };
      if (s.cv === 'pedido') return { ok: false, why: `${cap(kname(s.srv || s.keeper))} já vem.` };
      if (s.cv === 'mesa') return { ok: false, why: s.mesa && s.mesa.aqui ? 'Já vai para as suas mãos.' : 'Sente-se onde está o seu pedido: o lugar é seu.' };
      if (s.cv === 'chama' && s.can && !s.so) return { ok: false, why: `${cap(kname(s.keeper))} já vem à sua mesa.` };
      if (!s.can || s.so) return { ok: false, why: 'Não há quem sirva agora: vá ao balcão e sirva-se.' };
      return { ok: true };
    },
    run(ctx, t) {
      const s = t.s;
      if (t.bal) { G.IncUI.when(G.Possess.apply(w => T().counter(w, s.op)), () => { sig = ''; }, deny); return { ok: true }; }
      if (s.hold) { if (auto) auto.stop = false; bite(s); return { ok: true }; }
      if (s.cv === 'carta') { UI.open(true); return { ok: true }; }
      G.IncUI.when(G.Possess.apply(w => T().call(w, s.op)), r => toast(r.msg, 2.2), deny); return { ok: true };
    },
  });

  // ------------------------------ the body's verbs at the tavern (D-798) ------------------------------
  // (F and the card's keys, seated at a table: a round for the table, a song asked of the night's musician, the game of bones at the
  // table — each done by the world in its step, G.Possess.apply → G.Taverna, the answer told when it comes; the coin to the musician is
  // a verb of the person. Only read here: what can be done is G.Taverna.verbos)
  const vb = () => (T() && T().verbos ? T().verbos(P().body()) : null);
  const asked = fn => { const ask = G.Possess.apply(fn); return { ok: true, ask, get msg() { return (ask.res && (ask.res.msg || ask.res.why)) || '…'; } }; };
  const clip = id => !!(G.Anim3D && G.Anim3D.CLIPS && G.Anim3D.CLIPS[id]);
  I.verb('taverna', { id: 'tv-rodada', k: 'outra', ord: 1,
    label: (ctx, t) => { if (t.bal) return ''; const r = vb(); const x = r && r.rodada; return x && (x.ok || x.why !== 'Não há ninguém à sua mesa.') ? `Pagar uma rodada para a mesa${x.ok && x.p ? ` (${r.price(x.p)})` : ''}` : ''; },
    can: () => { const r = vb(); return r ? r.rodada : { ok: false }; },
    run: (ctx, t) => { if (G.Audio && G.Audio.play) G.Audio.play('coin', 0.5); return asked(w => T().rodada(w, t.s.op)); } });
  I.verb('taverna', { id: 'tv-musica', k: 'outra', ord: 2,
    label: (ctx, t) => { if (t.bal) return ''; const r = vb(); const x = r && r.musica; return x && (x.ok || x.why) ? `Pedir uma música${x.ok && x.p ? ` (${r.price(x.p)})` : ''}` : ''; },
    can: () => { const r = vb(); return r ? r.musica : { ok: false }; },
    run: (ctx, t) => asked(w => T().musica(w, t.s.op)) });
  I.verb('taverna', { id: 'tv-jogo', k: 'outra', ord: 3,
    label: (ctx, t) => { if (t.bal) return ''; const r = vb(); const x = r && r.jogo; if (!x || (!x.ok && !x.dentro && !x.j)) return ''; return x.dentro ? `Lançar os ossinhos${x.aposta ? ` (aposta de ${r.price(x.aposta)})` : ''}` : 'Entrar no jogo de ossinhos'; },
    can: () => { const r = vb(); return r ? r.jogo : { ok: false }; },
    run: (ctx, t) => { const r = vb(); if (r && r.jogo && r.jogo.dentro && clip('jogo-ossos') && !G.Avatar.busy()) G.Avatar.act({ anim: 'jogo-ossos', dur: 1.6, vact: 'jogo-ossos', free: true });
      return asked(w => T().jogar(w, t.s.op)); } });
  if (G.Interact.verb) G.Interact.verb('pessoa', { id: 'tv-gorjeta', k: 'outra', ord: 4,
    label: (ctx, t) => { const c = T() && T().gorjetaCan ? T().gorjetaCan(ctx.v, t.o) : null; return c && (c.ok || c.why) ? `Dar uma gorjeta a ${P().knows.call(ctx.v, t.o)}${c.ok ? ` (${c.price})` : ''}` : ''; },
    can: (ctx, t) => (T() && T().gorjetaCan ? T().gorjetaCan(ctx.v, t.o) : { ok: false }),
    run: (ctx, t) => { if (G.Audio && G.Audio.play) G.Audio.play('coin', 0.5); return asked(w => T().gorjeta(w, t.o.id)); } });

  // ------------------------------ the menu ------------------------------
  // (the vessel of each drink, as its people says it — the cup, the goblet, the horn, the gourd —; the dish on its plate, by what it
  // is made of — only drawn here, the colour of what is in them)
  const LIQ = { cerveja: ['#c98a2b', '#efe2bd'], vinho: ['#6b1a2b', null], mel: ['#d6a23a', null], pulque: ['#e9e3cf', null] };
  const MAT = { barro: ['#a35a37', '#5a3322'], madeira: ['#9a7650', '#6e5034'] };
  const FOODC = { peixe: '#b9b8ad', marisco: '#cc7c5c', carne: '#7e3c26', arroz: '#ece6d0', trigo: '#c08a4c', cevada: '#a8854e', milho: '#e1bd6c', sorgo: '#c49a66', horta: '#71783a', ovos: '#f2e8cf', leite: '#eeeadb', fruta: '#b33a2c', mel: '#d39b33', azeite: '#c7a24a', provisao: '#a07a50', '?': '#a07a50' };
  function cupSVG(k, mat) {
    const m = MAT[mat] || MAT.madeira; const l = LIQ[k] || LIQ.cerveja;
    if (k === 'vinho') return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="10" ry="2.6" fill="rgba(0,0,0,.28)"/><path d="M14 9 h20 q0 16 -10 18 q-10 -2 -10 -18z" fill="${m[0]}"/><path d="M15.5 12 h17 q-1 11 -8.5 12.5 q-7.5 -1.5 -8.5 -12.5z" fill="${l[0]}"/><ellipse cx="24" cy="12" rx="8.5" ry="2" fill="#8a2a3a"/><rect x="22.6" y="26" width="2.8" height="12" fill="${m[1]}"/><ellipse cx="24" cy="40" rx="8" ry="2.4" fill="${m[0]}"/><path d="M16 10 q1 9 5 13" stroke="rgba(255,255,255,.28)" stroke-width="1.4" fill="none"/></svg>`;
    if (k === 'mel') return `<svg viewBox="0 0 48 48"><defs><linearGradient id="mnHorn" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#5e4026"/><stop offset=".45" stop-color="#c9b083"/><stop offset="1" stop-color="#efe2c2"/></linearGradient></defs><ellipse cx="25" cy="42" rx="12" ry="2.4" fill="rgba(0,0,0,.28)"/><path d="M8 38 Q14 22 29 9 L41 19 Q24 30 8 38z" fill="url(#mnHorn)"/><path d="M27.6 10.6 L39.6 20.6" stroke="#b8912f" stroke-width="3"/><ellipse cx="35" cy="14" rx="7.6" ry="3.6" transform="rotate(40 35 14)" fill="#7a5a32"/><ellipse cx="35" cy="14" rx="6.2" ry="2.5" transform="rotate(40 35 14)" fill="${l[0]}"/><path d="M12 33 Q17 24 26 15" stroke="rgba(255,255,255,.3)" stroke-width="1.3" fill="none"/></svg>`;
    if (k === 'pulque') return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="42" rx="12" ry="2.6" fill="rgba(0,0,0,.28)"/><path d="M8 20 q16 -4 32 0 q0 18 -16 19 q-16 -1 -16 -19z" fill="#7a5a2a"/><ellipse cx="24" cy="20" rx="16" ry="4.2" fill="#9a7638"/><ellipse cx="24" cy="20" rx="13.5" ry="3" fill="${l[0]}"/><path d="M11 24 q4 9 12 11" stroke="rgba(255,255,255,.18)" stroke-width="1.5" fill="none"/></svg>`;
    return `<svg viewBox="0 0 48 48"><ellipse cx="22" cy="42" rx="12" ry="2.6" fill="rgba(0,0,0,.28)"/><path d="M33 17 q8 0 8 8 q0 8 -8 8" stroke="${m[1]}" stroke-width="3.4" fill="none"/><path d="M11 12 h22 v24 q0 5 -5 5 h-12 q-5 0 -5 -5z" fill="${m[0]}"/>${mat === 'barro' ? `<rect x="11" y="15.5" width="22" height="3" fill="${m[1]}" opacity=".85"/>` : `<path d="M15 14 v24 M21 14 v26 M27 14 v26" stroke="${m[1]}" stroke-width=".8" opacity=".5"/>`}<ellipse cx="22" cy="12" rx="11" ry="3" fill="${m[1]}"/><ellipse cx="22" cy="12.3" rx="9.4" ry="2.2" fill="${l[0]}"/>${l[1] ? `<path d="M12.6 12 q2 -4 5 -2 q2 -3 5 -1 q3 -3 6 0 q3 -1 4 3 q-5 2.4 -10 2.4 q-6 0 -10 -2.4z" fill="${l[1]}"/>` : ''}<path d="M14 16 v18" stroke="rgba(255,255,255,.22)" stroke-width="1.6"/></svg>`;
  }
  function plateSVG(of, mat) {
    const m = MAT[mat] || MAT.madeira; const t = Array.isArray(of) ? of[0] : of || '?'; const f = FOODC[t] || FOODC['?'];
    const base = `<ellipse cx="24" cy="38" rx="20" ry="4" fill="rgba(0,0,0,.3)"/><ellipse cx="24" cy="31" rx="21" ry="9" fill="${m[1]}"/><ellipse cx="24" cy="30" rx="21" ry="8.6" fill="${m[0]}"/><ellipse cx="24" cy="30" rx="15" ry="5.6" fill="${m[1]}" opacity=".55"/>`;
    let food = `<path d="M11 30 q2 -10 13 -10 q11 0 13 10 q-13 4 -26 0z" fill="${f}"/><path d="M15 25 q4 -4 9 -4" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/>`;
    if (t === 'peixe') food = `<path d="M10 29 q8 -8 20 -3 l6 -4 v10 l-6 -4 q-12 5 -20 1z" fill="${f}"/><circle cx="14" cy="27.5" r="1.1" fill="#2b2b2b"/><path d="M19 25.5 q2 3 0 6 M23 25 q2 3.5 0 7" stroke="#8a8a80" stroke-width="1" fill="none"/><path d="M12 31 q3 1 4 -1" stroke="#6a7a2a" stroke-width="1.6" fill="none"/>`;
    else if (t === 'carne') food = `<path d="M12 29 q1 -8 11 -9 q12 0 13 8 q-11 5 -24 1z" fill="${f}"/><path d="M15 26 q5 -3 11 -2" stroke="#a65a3c" stroke-width="1.6" fill="none"/><path d="M33 28 l5 -6" stroke="#e9dcc0" stroke-width="2.4" stroke-linecap="round"/>`;
    else if (t === 'fruta') food = `<circle cx="18" cy="26" r="5" fill="${f}"/><circle cx="27" cy="25" r="5" fill="#d8862e"/><circle cx="23" cy="29.5" r="4.6" fill="#6f3a7a"/><circle cx="16.5" cy="24.5" r="1.3" fill="rgba(255,255,255,.45)"/>`;
    else if (t === 'ovos') food = `<ellipse cx="18" cy="28" rx="6" ry="3.6" fill="#f6efdc"/><circle cx="18" cy="27.5" r="2.2" fill="#e8a52a"/><ellipse cx="29" cy="28.5" rx="6" ry="3.4" fill="#f6efdc"/><circle cx="29" cy="28" r="2.2" fill="#e8a52a"/>`;
    else if (t === 'trigo' || t === 'mel' || t === 'azeite') food = `<path d="M10 30 q1 -9 10 -10 q9 1 10 10z" fill="#c28a4a"/><path d="M13 25 l4 -3 M18 24 l4 -3 M23 25 l3 -2" stroke="#8a5a2a" stroke-width="1.2"/><path d="M27 30 q2 -6 6 -6 q4 0 5 6z" fill="${t === 'trigo' ? '#9a6a3a' : f}"/>`;
    else if (t === 'milho') food = `<ellipse cx="24" cy="29" rx="13" ry="4.4" fill="#e5c271"/><ellipse cx="24" cy="27" rx="13" ry="4.4" fill="#ecd08a"/><ellipse cx="24" cy="25" rx="13" ry="4.4" fill="${f}"/><circle cx="20" cy="24.5" r=".8" fill="#b88a3a"/><circle cx="27" cy="25.5" r=".8" fill="#b88a3a"/>`;
    else if (t === 'arroz' || t === 'leite') food += `<circle cx="20" cy="24" r="1" fill="#fff"/><circle cx="26" cy="23" r="1" fill="#fff"/><circle cx="23" cy="26" r="1" fill="#fff"/><path d="M28 27 q3 -1 4 1" stroke="#6a7a2a" stroke-width="1.6" fill="none"/>`;
    else if (t === 'horta') food += `<circle cx="19" cy="25" r="2" fill="#c0612a"/><circle cx="27" cy="24.5" r="1.8" fill="#9aa64a"/><circle cx="23" cy="27" r="1.6" fill="#d8b04a"/>`;
    else food += `<circle cx="19" cy="25.5" r="2" fill="#7a4026"/><circle cx="27" cy="25" r="1.8" fill="#5f6f2e"/>`;
    return `<svg viewBox="0 0 48 48">${base}${food}</svg>`;
  }
  // (the little drawing at the head of a rich house's menu, its people's own — the laurel of Rome, the amphora of the Greeks, the
  // lotus of Egypt, the horn of the North, the sun of the Aztecs, the goblet of the others —, in the ink of its theme)
  const EMBLEM = {
    romano: '<path d="M24 40c-9-3-15-11-15-21M24 40c9-3 15-11 15-21" stroke="currentColor" stroke-width="1.6" fill="none"/><g fill="currentColor"><ellipse cx="10" cy="22" rx="2.2" ry="4.4" transform="rotate(-25 10 22)"/><ellipse cx="12" cy="29" rx="2.2" ry="4.4" transform="rotate(-45 12 29)"/><ellipse cx="16.5" cy="35" rx="2.2" ry="4.4" transform="rotate(-65 16.5 35)"/><ellipse cx="38" cy="22" rx="2.2" ry="4.4" transform="rotate(25 38 22)"/><ellipse cx="36" cy="29" rx="2.2" ry="4.4" transform="rotate(45 36 29)"/><ellipse cx="31.5" cy="35" rx="2.2" ry="4.4" transform="rotate(65 31.5 35)"/></g><path d="M18 21h12c0 6-2.6 9-6 9s-6-3-6-9z" fill="currentColor"/><path d="M24 30v5M20 37h8" stroke="currentColor" stroke-width="1.8"/>',
    grego: '<path d="M18 8h12v3c0 2-2 3-2 5 6 2 9 8 9 14 0 7-5 12-13 12s-13-5-13-12c0-6 3-12 9-14 0-2-2-3-2-5z" fill="currentColor"/><path d="M13 18c-5 0-6 8-1 10M35 18c5 0 6 8 1 10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 30h24" stroke="var(--paper-hi,#e9b07a)" stroke-width="1.4"/><path d="M14 34h20" stroke="var(--paper-hi,#e9b07a)" stroke-width="1"/>',
    egipcio: '<path d="M24 40V22" stroke="currentColor" stroke-width="2"/><path d="M24 22c-3-6-3-12 0-16 3 4 3 10 0 16z" fill="currentColor"/><path d="M24 22c-6-2-11-7-12-13 6 1 10 6 12 13zM24 22c6-2 11-7 12-13-6 1-10 6-12 13z" fill="currentColor" opacity=".8"/><path d="M14 40h20" stroke="var(--acc2,#c9971f)" stroke-width="2"/>',
    nordico: '<path d="M8 34c6-1 14-6 22-18l7 5c-8 11-17 16-27 17z" fill="currentColor"/><path d="M29 15l8 6" stroke="var(--acc2,#d9a441)" stroke-width="3"/><path d="M10 37c2 2 6 2 9 0" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="10" r="2" fill="currentColor"/><circle cx="18" cy="7" r="1.4" fill="currentColor"/>',
    asteca: '<circle cx="24" cy="24" r="8" fill="currentColor"/><g stroke="currentColor" stroke-width="2.4"><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/></g><circle cx="24" cy="24" r="4" fill="var(--acc2,#1a9a90)"/>',
    classico: '<path d="M15 8h18c0 9-4 15-9 15s-9-6-9-15z" fill="currentColor"/><path d="M24 23v11M17 38h14" stroke="currentColor" stroke-width="2.2"/><path d="M18 11c1 5 3 8 5 9" stroke="rgba(255,255,255,.35)" stroke-width="1.2" fill="none"/>',
  };
  // (the words of the house: the slate chalked by hand, the board painted, the menu inked)
  const WORD = {
    lousa: { beber: 'Hoje tem', comer: 'Pra comer', vazio: 'Hoje não tem nada. Volte amanhã.', go: 'Pedir', none: 'Escolha na lousa' },
    quadro: { beber: 'Para beber', comer: 'Para comer', go: 'Pedir', none: 'Escolha o que pedir' },
    carta: { beber: 'Bebidas', comer: 'Pratos da casa', go: 'Fazer o pedido', none: 'Escolha na carta' },
  };
  // (the line under a name: what it is — the menu's own line —, and how many left when they are few)
  function subOf(it) { let s = it.desc || ''; if (it.ok && it.n <= 3) s += `${s ? ' · ' : ''}${it.n === 1 ? 'o último' : 'restam ' + it.n}`; return s; }
  // (the price as the people says it, the number large and the money small under it: «0,3» / «peças de prata»)
  const priceOf = (s, p) => { const t = s.price(p); const i = t.indexOf(' '); return i > 0 ? `<b>${esc(t.slice(0, i))}</b><small>${esc(t.slice(i + 1))}</small>` : `<b>${esc(t)}</b>`; };
  // (the coins one has, as one knows them: one's own purse, or the house's — G.Possess.knows.house —; a people with no coin, none)
  function purse(v, s) {
    if (!s.moeda) return { txt: 'O povo não usa moeda: a taverna serve a quem chega.', n: Infinity };
    const ref = G.Eco.coinRef(v); const home = ref[0] === 'h' ? G.S.buildings.get(+ref.slice(2)) : null;
    const n = !home || G.Possess.knows.house(v, home) ? G.Depot.get(ref, 'moedas') : null; if (n === null) return { txt: '', n: Infinity };
    return { txt: `${home ? 'Na bolsa da casa' : 'Na bolsa'}: <b>${esc(s.price(n))}</b>`, n };
  }
  // (who serves, as the body can say it — G.Possess.knows: «Tito, o taverneiro», or «o taverneiro» —, and the face: the 3D's portrait
  // where it can be made, else the god's drawing — G.Retrato3D, D-645)
  function face(canvas, o) {
    const x = canvas.getContext('2d'); x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, 64, 64);
    const g = x.createRadialGradient(32, 26, 4, 32, 32, 36); g.addColorStop(0, '#f6e4bd'); g.addColorStop(1, '#a8834f'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    if (!o) return;
    if (G.Retrato3D && G.Retrato3D.into(canvas, o)) return;
    if (G.Art && G.Art.villager && o.age >= 2) { x.save(); x.translate(32, 54); x.scale(3.6, 3.6); G.Art.villager(x, Object.assign({}, o, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null }), 0, 0, 0, false); x.restore(); }
  }
  let look = null, faceOf = 0, hov = -1, keyed = false; UI.force = null; // (UI.force: the photos' hand — a look shown for a picture, never the world's)
  function build() {
    const root = G.IncUI && G.IncUI.root && G.IncUI.root(); if (!root) return false; if (panel) return true;
    panel = document.createElement('div'); panel.id = 'menu-panel'; panel.className = 'mn hidden';
    panel.innerHTML = `<div class="mn-card"><div class="mn-light"></div><div class="mn-band mn-band-t"></div><button class="x" data-a="close" aria-label="Fechar" title="Agora não (Esc)">×</button>
      <header class="mn-top"><i class="mn-emb"></i><h3></h3><div class="mn-who"><span class="mn-face"><canvas width="128" height="128"></canvas></span><span class="mn-say"><q></q><small></small></span></div></header>
      <div class="mn-body"></div><div class="mn-band mn-band-b"></div></div>`;
    root.appendChild(panel);
    panel.addEventListener('click', onClick); panel.addEventListener('pointerover', e => { const r = e.target.closest('[data-i]'); if (r && !G.Input3D.touch) { const i = +r.dataset.i; if (i !== hov) { hov = i; mark(); } } });
    panel.addEventListener('pointerleave', () => { hov = -1; mark(); });
    panel.addEventListener('contextmenu', e => e.preventDefault());
    if (!closer) { closer = true; G.IncUI.closers.push(() => { if (open) hide(); }); }
    return true;
  }
  const play = (k, v) => { if (G.Audio && G.Audio.play) G.Audio.play(k, v); };
  // open the menu (the world's: the keeper at the table, or the counter, G.Taverna.corpo — cv 'carta'): true when open. With the
  // screen put away (H, G.IncUI.hudOff) it waits for the hands — «Ver o cardápio», E — and never opens by itself
  UI.open = function (force) {
    const v = P().body(); if (!G.Modes.inc() || !v || !build()) return false;
    const s = T().carta(v); if (!s || s.cv !== 'carta') return false;
    if (!force && (G.Modes.panel() || (G.IncUI.hudOff && G.IncUI.hudOff()))) return false;
    const b = G.S.buildings.get(s.b); look = Object.assign({}, T().look(b), UI.force || {});
    G.IncUI.closeAll(); G.Modes.setPanel('cardapio'); G.Input3D.free(); G.IncUI.root().classList.add('mn-on'); // (the cursor for the screen; the mouse back when it shuts — rule 122; the touch's sticks out of the way)
    panel.className = `mn t-${look.tema} p-${look.porte}`; // (a new class each time: the card unfolds again)
    open = true; shown = { op: s.op, ck: s.ck }; sel = -1; hov = -1; note = ''; busy = false; sig = ''; faceOf = 0; UI._sempre = null;
    void panel.offsetWidth; render(s);
    play(look.porte === 'lousa' ? 'scratch' : 'rustle', 0.45); // (the slate's chalk, the paper of the menu — once, as it opens)
    return true;
  };
  // (shut: by the player — «agora não», the world told, the keeper goes back —, or by the world — the menu over there: quiet)
  function hide(quiet) {
    const was = open; open = false; sel = -1; hov = -1; if (panel) panel.classList.add('hidden'); { const r = G.IncUI && G.IncUI.root && G.IncUI.root(); if (r) r.classList.remove('mn-on'); }
    if (G.Modes.panelIs('cardapio')) G.Modes.setPanel(null);
    if (was && !quiet) { const v = P().body(); const s = v && T().corpo(v); if (s && s.cv === 'carta') G.Possess.apply(w => T().dismiss(w, s.op)); }
  }
  UI.close = () => { if (open) hide(); };
  UI.look = () => (look ? Object.assign({}, look) : null); // (for the proofs: the look of the menu open)
  function render(s0) {
    const v = P().body(); if (!panel || !v) return; const s = s0 || T().carta(v); if (!s || s.cv !== 'carta') { hide(true); return; }
    const W = WORD[look.porte] || WORD.quadro, slate = look.porte === 'lousa';
    // (the slate has what the house has today, and nothing else)
    items = slate ? s.items.filter(x => x.ok) : s.items;
    const b = G.S.buildings.get(s.b); const pu = purse(v, s); const mat = (G.Inv && G.Inv.made ? G.Inv.made('prato', v) || '' : '').split('.')[1] || 'madeira';
    const kp = s.srv > 0 ? G.S.villagers.get(s.srv) : null; const touch = !!G.Input3D.touch;
    // the head: the house's name, who serves — the face, the name as the body can say it —, the word of welcome
    if (faceOf !== (kp ? kp.id : -1)) {
      faceOf = kp ? kp.id : -1; const top = panel.querySelector('.mn-top');
      const set = b && G.S.settlements.get(b.set); top.querySelector('h3').textContent = `${b ? G.Village.buildName(b) : 'A taverna'}${set && P().knows.town(v, set) ? ' de ' + set.name : ''}`;
      top.querySelector('.mn-emb').innerHTML = look.porte === 'carta' ? `<svg viewBox="0 0 48 48">${EMBLEM[look.tema] || EMBLEM.classico}</svg>` : '';
      top.querySelector('q').textContent = s.srv === -1 ? 'Ninguém no balcão: sirva-se do que a casa tem e deixe o pagamento.' : s.ola || 'O que vai ser?';
      top.querySelector('small').textContent = kp ? (P().knows.person(v, kp) ? `${kp.name}, ${kp.g === 'f' ? 'a taverneira' : 'o taverneiro'}` : cap(P().knows.call(v, kp))) : 'No balcão';
      const cv = top.querySelector('canvas'); top.querySelector('.mn-face').classList.toggle('none', !kp); face(cv, kp);
    }
    // (a regular of the house: «o de sempre» at the top — the line of the menu it is, chosen at once; out of it today, said so — D-794)
    const sp = s.sempre && s.sempre.key ? s.sempre : null; const us = sp ? items.findIndex(x => T().keyOf(x) === sp.key || (sp.k === 'food' && x.k === 'food' && [].concat(x.of || []).includes(sp.of))) : -1;
    if (sp && us >= 0 && items[us].ok && sel < 0 && !UI._sempre) { sel = us; UI._sempre = s.op + ':' + s.ck; }
    const st = JSON.stringify([items.map(x => [x.id, x.n, x.ok]), pu.n, sel, busy, note, touch, us]);
    if (st === sig) return; sig = st;
    const row = (it, i) => {
      const can = it.ok && pu.n + 1e-6 >= it.p; const why = !it.ok ? 'acabou' : !can ? 'falta dinheiro' : '';
      const k = i < 5 && !touch ? `<kbd>${i + 1}</kbd>` : '';
      const ic = slate ? '' : `<span class="ic">${it.sort === 'beber' ? cupSVG(it.k, mat) : plateSVG(it.of, mat)}</span>`;
      const pr = !it.ok ? '<i class="mn-out">acabou</i>' : s.moeda ? `${priceOf(s, it.p)}${can ? '' : '<em>falta dinheiro</em>'}` : '';
      return `<button class="mn-row${i === sel ? ' sel' : ''}${it.ok ? '' : ' out'}${can ? '' : ' off'}" data-i="${i}"${why ? ` title="${esc(cap(why))}"` : ''}>${k}${ic}<span class="nm"><b>${esc(cap(it.nome))}</b><small>${esc(subOf(it))}</small></span>${slate ? '<span class="dots"></span>' : ''}<span class="pr">${pr}</span></button>`;
    };
    const part = (sort, title) => { const L = items.map((it, i) => [it, i]).filter(([it]) => it.sort === sort); return L.length ? `<div class="mn-sec"><span>${esc(title)}</span></div>${L.map(([it, i]) => row(it, i)).join('')}` : ''; };
    const it = sel >= 0 ? items[sel] : null; const canIt = !!it && it.ok && pu.n + 1e-6 >= it.p;
    const sum = it ? `<div class="mn-sum"><span>Seu pedido</span><b>${esc(cap(it.nome))}</b>${s.moeda && it.ok ? `<em>${esc(s.price(it.p))}</em>` : ''}</div>` : `<div class="mn-sum none">${esc(W.none)}</div>`;
    const hint = touch ? '' : `<div class="mn-hint"><kbd>↑</kbd><kbd>↓</kbd> ou <kbd>1</kbd>–<kbd>5</kbd> escolhe · <kbd>${esc(G.Input3D.label('interagir'))}</kbd> pede · <kbd>Esc</kbd> fecha</div>`;
    const usual = sp ? (us >= 0 && items[us].ok ? `<button class="mn-row mn-sempre${us === sel ? ' sel' : ''}" data-i="${us}"><span class="star">★</span><span class="nm"><b>O de sempre</b><small>${esc(cap(items[us].nome))}</small></span><span class="pr">${s.moeda ? priceOf(s, items[us].p) : ''}</span></button>`
      : `<div class="mn-sempre out"><span class="star">★</span><span class="nm"><b>O de sempre</b><small>${esc(cap(sp.nome))}: acabou hoje</small></span></div>`) : '';
    panel.querySelector('.mn-body').innerHTML = `${usual}<div class="mn-list">${items.length ? part('beber', W.beber) + part('comer', W.comer) : `<div class="mn-empty">${esc(W.vazio || 'Não há nada agora.')}</div>`}</div>
      ${note ? `<div class="mn-note">${esc(note)}</div>` : ''}
      <div class="mn-foot">${sum}<div class="mn-purse">${pu.txt}</div>
        <div class="mn-btns"><button class="mn-no" data-a="close">Agora não</button><button class="mn-go" data-a="go"${canIt && !busy ? '' : ' disabled'}>${busy ? 'Pedindo…' : esc(W.go)}</button></div>${hint}</div>`;
    mark();
    if (keyed) { keyed = false; const r = panel.querySelector('.mn-row.sel'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'nearest' }); } // (moved by the keys: kept in sight)
  }
  function mark() { if (!panel) return; for (const el of panel.querySelectorAll('.mn-row')) el.classList.toggle('hov', +el.dataset.i === hov && +el.dataset.i !== sel); }
  // (the choice: a row chosen — again, or «Pedir»: asked of the world by the hands)
  function choose(i) {
    const it = items[i]; if (!it) return; const v = P().body(); const s = v && T().carta(v); if (!s) return;
    if (!it.ok) { note = `${cap(it.nome)}: acabou por hoje.`; sel = i; sig = ''; render(); play('deny', 0.6); return; }
    const pu = purse(v, s); if (pu.n + 1e-6 < it.p) { note = `Falta dinheiro: ${it.nome} custa ${s.price(it.p)}.`; sel = i; sig = ''; render(); play('deny', 0.6); return; }
    if (sel === i) { order(); return; }
    sel = i; note = ''; sig = ''; render(); play('click', 0.3);
  }
  // (the keys and the controller's cross go up and down the menu)
  function step(d) { if (!items.length) return; const i = sel < 0 ? (d > 0 ? 0 : items.length - 1) : (sel + d + items.length) % items.length; sel = i; note = ''; sig = ''; keyed = true; render(); play('hover', 0.6); }
  function order() {
    const it = items[sel]; const v = P().body(); const s = v && T().corpo(v); if (!it || !s || busy) return;
    if (!it.ok) { choose(sel); return; }
    busy = true; sig = ''; render();
    const k = it.k, of = it.of, op = s.op;
    G.IncUI.when(G.Possess.apply(w => T().order(w, op, k, of)), r => { busy = false; play('coin', 0.5); toast(r.msg, 2.8); hide(true); }, r => { busy = false; note = r.why || 'Agora não deu.'; sig = ''; render(); deny(r); });
  }
  function onClick(e) {
    const a = e.target.closest('[data-a]'); if (a) { if (a.dataset.a === 'close') hide(); else if (a.dataset.a === 'go') order(); return; }
    const r = e.target.closest('[data-i]'); if (r) choose(+r.dataset.i);
  }
  // (the number keys over the menu choose — the quick keys' own, as over a person's card: IncUI.cardKey —; the controller's cross ↑ ↓
  // (its quick keys 1 and 3) goes up and down; the feet's keys ↑ ↓ (W, S) too; the hands' key asks)
  { const ck0 = G.IncUI && G.IncUI.cardKey; if (G.IncUI) G.IncUI.cardKey = function (i) { if (open) { if (G.Input3D && G.Input3D.device === 'pad') { if (i === 0) step(-1); else if (i === 2) step(1); } else choose(i); return true; } return ck0 ? ck0.apply(this, arguments) : false; }; }
  if (G.Input3D && G.Input3D.on) {
    G.Input3D.on('interagir', () => { if (!open || sel < 0) return false; order(); return true; });
    G.Input3D.on('frente', () => { if (!open) return false; step(-1); return true; });
    G.Input3D.on('tras', () => { if (!open) return false; step(1); return true; });
  }

  // ------------------------------ the frame ------------------------------
  // (a few times a second, from the body's screen: the menu opened when the world opens it — the keeper at the table, the counter —
  // and drawn again when what it shows changed; shut when the world shut it; the words of the moment once; the meal eaten on)
  UI.frame = function (rdt) {
    if (!G.Modes || !G.Modes.inc()) { if (open) hide(true); return; }
    const v = P().body(); if (!v) return;
    if (open && !G.Modes.panelIs('cardapio')) { open = false; sel = -1; if (panel) panel.classList.add('hidden'); G.IncUI.root().classList.remove('mn-on'); } // (another panel took the screen)
    upT -= rdt || 0; if (upT > 0) return; upT = 0.15;
    const s = T() && T().corpo ? T().corpo(v) : null;
    if (open) { if (!s || s.cv !== 'carta') { hide(true); if (s && s.cv === 'chama' && s.falta) toast(`${cap(s.falta)}: acabou.`, 2.4); } else render(); }
    else if (s && s.cv === 'carta' && (s.op !== shown.op || s.ck !== shown.ck)) UI.open(false);
    if (!s) { auto = null; return; }
    // (the words of the moment, once each: nobody to come; no coin when it came; the hands full)
    if (s.so && s.so !== said.so) { said.so = s.so; toast('Ninguém vem atender: vá ao balcão e sirva-se.', 3.2); }
    if (s.sem && s.sem !== said.sem) { said.sem = s.sem; toast('Faltou dinheiro: o pedido voltou para o balcão.', 3); }
    if (s.mao && s.mao !== said.mao) { said.mao = s.mao; toast(s.cv === 'mesa' ? 'Com as mãos ocupadas: o pedido espera na mesa.' : 'Com as mãos ocupadas, o pedido voltou para o balcão.', 3); }
    // (the order set down at the body's seat: the keeper's call, said on the screen too — D-790; and back in the hands at the seat)
    if (s.ch && s.ch !== said.ch) { said.ch = s.ch; if (s.chegou) toast(`${cap(kname(s.keeper))}: «${s.chegou}»`, 3.6); }
    if (said.cv === 'mesa' && s.cv === 'servido') toast(s.frio ? 'O seu pedido esfriou na mesa — mas está aí.' : 'O seu pedido, ainda quente.', 2.6);
    said.cv = s.cv || '';
    // (just served at the table: the first sip or the first mouthful at once; the plate eaten to the end, a mouthful after another;
    // the cup a sip now and then — the hands the player's: a step, and it stops)
    if (s.hold && s.seat && s.cv === 'servido') {
      const key = s.op + ':' + s.cup; if (!auto || auto.key !== key) auto = { key, wait: 0.5, stop: false };
      if (!auto.stop && !G.Avatar.busy() && !G.Modes.panel()) { auto.wait -= 0.15; if (auto.wait <= 0) { auto.wait = s.hold.food ? 0.45 : 4.5; bite(s); } }
    } else if (!s.hold) auto = null;
  };
  const frame0 = G.IncUI && G.IncUI.frame;
  if (frame0) G.IncUI.frame = function (rdt) { const r = frame0.apply(this, arguments); UI.frame(rdt); return r; };
})(window.G);
