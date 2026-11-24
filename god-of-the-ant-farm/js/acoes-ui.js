'use strict';
// ============================================================
//  Ações — what the body can do now, seen and reached (the wave
//  4 I, D-915 to D-929). Seated at a tavern's table, the bar of
//  the table is always in sight, in the house's own look: the
//  menu and the keeper, a round for the table, the dice, the
//  Tabuletas, the bones, a song, a coin to the musician, and
//  getting up — each with its key on the PC (the quick keys
//  while one sits: the bar takes the place of the quick things)
//  and one tap on the phone; what cannot be done now is there,
//  greyed, with the world's own why. The list of actions (the
//  «Ações» button of the fingers, a key on the PC, a button of
//  the controller) is everything about one target — a person,
//  the table, a door —, the others in reach to switch to by
//  their names. The first time at a tavern's table a word shows
//  the bar, and never again once it is used.
//  Only seen: it reads the verbs as the world says them (the
//  doors of G.Interact: verbsOf, here, candidates; the names by
//  G.Possess.knows) and does each by the verbs' own doors
//  (IncUI.use / useVerb → Interact.run / runVerb), never asking
//  the world itself; the two verbs it brings (the coin to the
//  musician from the table, the dice with someone at it) are
//  verbs of the registry, asked by the hands (G.Possess.apply).
// ============================================================
(function (G) {
  const UI = G.AcoesUI = {};
  const I = G.Interact; if (!I || !G.Possess || !G.Input3D || !G.IncUI) return;
  const P = () => G.Possess, T = () => G.Taverna, In = G.Input3D;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const toast = (t, d) => { if (t && G.IncUI.toast) G.IncUI.toast(t, d || 2.6); };
  const play = (k, v) => { if (G.Audio && G.Audio.play) G.Audio.play(k, v); };
  const deny = why => { if (why) toast(why, 2.6); play('deny'); };
  const who = (v, o) => P().knows.call(v, o), ao = (v, o) => P().knows.ao(v, o); // (ao: after «a» — «ao músico», «a Thyra»)
  let bar = null, sheet = null, dica = null, built = false, open = false, sel = -1, rows = [], sheetSig = '', barSig = '', upT = 0, sheetT = 0;
  let model = null, cur = null, curKey = '', hint = { i: -1, t: 0 }, dicaOn = false, mesaOn = false, keyed = false, barH = 0;
  G.worldHooks.push(() => { if (open) hide(); model = null; cur = null; curKey = ''; barSig = ''; sheetSig = ''; sel = -1; hint = { i: -1, t: 0 }; });
  UI.isOpen = () => open;

  // ------------------------------ the two verbs this file brings (the registry: rule 141) ------------------------------
  // the coin to the musician from the table: who plays tonight, wherever the stage is in the room (the person's own verb, tv-gorjeta,
  // asks to be in reach of him: from the table he was never in reach — L-2176). The musician is the one the house's door says can be
  // tipped (G.Taverna.gorjetaCan: the stage's, or a bard of the feast), the price and the why the house's own
  const musician = v => { if (!v || !v.inside || !T() || !T().gorjetaCan) return null; let best = null;
    for (const o of G.S.villagers.values()) { if (o.inside !== v.inside || o === v) continue; const c = T().gorjetaCan(v, o); if (c.ok || c.why) { if (!best || (c.ok && !best.c.ok) || (c.ok === best.c.ok && o.id < best.o.id)) best = { o, c }; } }
    return best; };
  I.verb('taverna', { id: 'tv-gorjeta-mesa', k: 'outra', ord: 4,
    label: (ctx, t) => { if (t.bal) return ''; const m = musician(ctx.v); return m ? `Dar uma gorjeta ${ao(ctx.v, m.o)}${m.c.ok && m.c.price ? ` (${m.c.price})` : ''}` : ''; },
    can: ctx => { const m = musician(ctx.v); return m ? { ok: !!m.c.ok, why: m.c.why || '' } : { ok: false, why: 'Ninguém está tocando agora.' }; },
    run: ctx => { const m = musician(ctx.v); if (!m || !m.c.ok) return { ok: false, msg: (m && m.c.why) || 'Ninguém está tocando agora.' }; play('coin', 0.5); const id = m.o.id;
      const ask = G.Possess.apply(w => T().gorjeta(w, id)); return { ok: true, ask, get msg() { return (ask.res && (ask.res.msg || ask.res.why)) || '…'; } }; } });
  // the dice with someone of one's table (the person's list: «Jogar dados com …»): the table's own call to the dice — its words, its can
  // and its run are the table's verb's (jd-dados, the dice's own file; the J's, D-920), the call going to all at the table, that one among
  // them. Only at the body's own table: the one at it, by the share-out's tables (G.Interiors.groupOf)
  const sameTable = (v, o) => { const In2 = G.Interiors; const u = P().useOf(); if (!u || !o || o.inside !== v.inside || !In2 || !In2.placeOf || !In2.groupOf) return false; const b = G.S.buildings.get(u.b); const pl = In2.placeOf(o); return !!b && !!pl && !!pl.item && In2.groupOf(b, pl.item) === In2.groupOf(b, u.it); };
  const diceOf = () => { const tb = I.here('taverna'); const x = tb ? I.verbsOf(tb, true, 'jd-dados')[0] : null; return x ? { tb, x } : null; };
  I.verb('pessoa', { id: 'pe-dados', k: 'outra', ord: 8,
    label: (ctx, t) => { const d = diceOf(); if (!d || !d.x.label || !sameTable(ctx.v, t.o)) return ''; return /^Chamar/.test(d.x.label) ? `Jogar dados com ${who(ctx.v, t.o)}` : d.x.label; },
    can: (ctx, t) => { const d = diceOf(); if (!d) return { ok: false, why: 'Sente-se a uma mesa da taverna.' }; if (!sameTable(ctx.v, t.o)) return { ok: false, why: `${cap(who(ctx.v, t.o))} não está à sua mesa.` }; return { ok: d.x.ok, why: d.x.why, sub: d.x.sub }; },
    run: () => { const d = diceOf(); return d ? I.runVerb('outra', d.tb, 'jd-dados') || { ok: false, msg: 'Agora não dá.' } : { ok: false, msg: 'Sente-se a uma mesa da taverna.' }; } });

  // ------------------------------ the drawings (only seen) ------------------------------
  // (each a small figure of a stroke, in the ink of the look it is in: currentColor)
  const PATH = {
    pedir: '<path d="M6 8h9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M15 11h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><path d="M6.5 8c0-2.2 1.6-3.4 4-3.4s4 1.2 4 3.4"/><path d="M9 11v6M12 11v6"/>',
    comer: '<ellipse cx="12" cy="14" rx="8" ry="4.2"/><path d="M6.6 13.2c1.2-2.4 3-3.4 5.4-3.4s4.2 1 5.4 3.4"/><path d="M19 4v5M19 9c1.4 0 1.6-1.6 1.6-3"/>',
    rodada: '<path d="M3.5 9h5v8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17z"/><path d="M9.5 7h5v10a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9.5 17z"/><path d="M15.5 9h5v8a1.5 1.5 0 0 1-1.5 1.5h-2a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M2.5 21h19"/>',
    dados: '<rect x="3" y="9" width="9" height="9" rx="2" transform="rotate(-12 7.5 13.5)"/><rect x="12" y="5" width="9" height="9" rx="2" transform="rotate(14 16.5 9.5)"/><circle cx="6" cy="12" r=".9" fill="currentColor"/><circle cx="9" cy="15.2" r=".9" fill="currentColor"/><circle cx="16.5" cy="9.5" r=".9" fill="currentColor"/><circle cx="14.6" cy="7.4" r=".9" fill="currentColor"/><circle cx="18.4" cy="11.6" r=".9" fill="currentColor"/>',
    tabuletas: '<rect x="3.5" y="6" width="9" height="13" rx="1.6" transform="rotate(-10 8 12.5)"/><rect x="11" y="4" width="9" height="13" rx="1.6" transform="rotate(9 15.5 10.5)"/><path d="M14.2 8.5l1.6 2.6 1.6-2.6M13.9 13h3.2"/>',
    ossinhos: '<path d="M6 8.5c-1.8-.6-3-2-2.4-3.4.6-1.4 2.2-1.6 3.4-.8.4-1.4 2-2.2 3.2-1.4s1 2.6-.2 3.6l4.8 4.8c1-1.2 2.8-1.4 3.6-.2s0 2.8-1.4 3.2c.8 1.2.6 2.8-.8 3.4-1.4.6-2.8-.6-3.4-2.4z"/><path d="M5 19.5l3-3"/>',
    musica: '<path d="M7 4c-2 4-2 9 1 13h8c3-4 3-9 1-13"/><path d="M6.5 4h3M14.5 4h3M10 7v10M12 6.5v10.5M14 7v10M8 17h8v2.5H8z"/>',
    gorjeta: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="4.2"/><path d="M12 9.6v4.8M10.6 11h2.8"/>',
    levantar: '<path d="M12 18V5M7.5 9.5L12 5l4.5 4.5"/><path d="M5 20h14"/>',
    conversar: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 9h8M8 12h5"/>',
    dar: '<rect x="4.5" y="10" width="15" height="9.5" rx="1.4"/><path d="M3.5 7h17v3h-17zM12 7v12.5"/><path d="M12 7c-1.2-3-5-3.4-5-1.2C7 7 10 7 12 7c2 0 5 0 5-1.2 0-2.2-3.8-1.8-5 1.2"/>',
    abraco: '<circle cx="8.5" cy="6.5" r="2.4"/><circle cx="15.5" cy="6.5" r="2.4"/><path d="M4 20v-4.5A4.5 4.5 0 0 1 8.5 11h7a4.5 4.5 0 0 1 4.5 4.5V20"/><path d="M6.5 14.5c2 1.6 9 1.6 11 0"/>',
    cumprimentar: '<path d="M8 13V5.6a1.4 1.4 0 0 1 2.8 0V11M10.8 10V4.4a1.4 1.4 0 0 1 2.8 0V10.5M13.6 10.5V5.4a1.4 1.4 0 0 1 2.8 0v6.2M16.4 10.6V8.4a1.4 1.4 0 0 1 2.8 0V14a7 7 0 0 1-7 7 6.2 6.2 0 0 1-5.4-3.2L4.4 13.6a1.4 1.4 0 0 1 2.4-1.4L8 14"/>',
    elogiar: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    beijar: '<path d="M12 20s-7.5-4.6-7.5-10A4.4 4.4 0 0 1 12 7.4 4.4 4.4 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    discutir: '<path d="M3.5 5.5A2 2 0 0 1 5.5 3.5h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8.5l-3 2.5v-2.5h0a2 2 0 0 1-2-2z"/><path d="M14.5 9.5h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2v2.5l-3-2.5h-3a2 2 0 0 1-2-2v-1"/><path d="M9 6v2.4M9 9.6v.2"/>',
    insultar: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M13 6.5l-3 3.4h4l-3 3.6"/>',
    ameacar: '<path d="M7 11V8.6a1.6 1.6 0 0 1 3.2 0V10M10.2 9.4V7.8a1.6 1.6 0 0 1 3.2 0V9.6M13.4 9.6V8.4a1.6 1.6 0 0 1 3.2 0v4.4A7.2 7.2 0 0 1 9.4 20h-.2A4.6 4.6 0 0 1 4.6 15.4v-2.2A2.2 2.2 0 0 1 6.8 11H10"/>',
    beber: '<path d="M7 5h8v9a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z"/><path d="M15 8h1.6a2.4 2.4 0 0 1 0 4.8H15"/><path d="M8 20h7M11 17v3M4 4l2 1.5M19.5 3.5L17.6 5"/>',
    ajuda: '<path d="M3.5 15.5l3.6-2.6a3 3 0 0 1 3.2-.2l3.2 1.6a1.6 1.6 0 0 1-1.4 2.9L9.5 16"/><path d="M3.5 20.5l3-2h8.2a3 3 0 0 0 2.2-1l3.6-4a1.6 1.6 0 0 0-2.3-2.2l-3 2.6"/><circle cx="14" cy="6" r="2.6"/>',
    novidades: '<path d="M15 5.5a6 6 0 0 0-9.6 4.8c0 2.4 1.4 3.4 1.8 5.2.4 1.6 0 3 1.8 3.8 1.6.7 3-.4 3.2-2"/><path d="M8.6 10.2a2.4 2.4 0 0 1 4.6-.9M17.5 9a3 3 0 0 1 0 4M19.6 7a6 6 0 0 1 0 8"/>',
    casar: '<circle cx="9" cy="13.5" r="5"/><circle cx="15" cy="13.5" r="5"/><path d="M13.6 6.2l1.4-2.2 1.4 2.2"/>',
    pazes: '<path d="M4 20c4-1 9-5 12-12"/><path d="M8.5 16.5c-2.6-.2-3.6-1.8-3.4-3.6 2.2-.2 3.6.8 3.4 3.6zM12 13c-2-1.2-2.4-3-1.6-4.6 2 .6 2.8 2.2 1.6 4.6zM14.6 9.6c2.6.2 3.6 1.8 3.4 3.6-2.2.2-3.6-.8-3.4-3.6zM16.4 6.4c-.6-2.2.4-3.6 2-4 .8 2 .2 3.4-2 4z"/>',
    adotar: '<circle cx="9" cy="5.5" r="2.4"/><circle cx="16" cy="10" r="1.8"/><path d="M5 20v-5.5A4 4 0 0 1 9 10.5h0a4 4 0 0 1 3.4 1.9"/><path d="M12.5 20v-3a3.5 3.5 0 0 1 7 0v3"/>',
    desafiar: '<path d="M5 4l9.5 9.5M4 5l1-1 3 1-2 2zM14.5 13.5l2 2-1 1-2-2zM16.5 15.5l3 3-1 1-3-3"/><path d="M19 4L9.5 13.5M20 5l-1-1-3 1 2 2zM9.5 13.5l-2 2 1 1 2-2zM7.5 15.5l-3 3 1 1 3-3"/>',
    porta: '<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M4 21h16"/><circle cx="14.8" cy="12.5" r="1" fill="currentColor"/>',
    mao: '<path d="M8 13V6.6a1.4 1.4 0 0 1 2.8 0V11M10.8 11V5a1.4 1.4 0 0 1 2.8 0v6M13.6 11V6.4a1.4 1.4 0 0 1 2.8 0V13a7 7 0 0 1-7 7 6 6 0 0 1-5-2.8l-1.6-2.6a1.4 1.4 0 0 1 2.4-1.4L8 15"/>',
    mais: '<circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/>',
    mesa: '<path d="M3 9.5h18M5 9.5l-1.5 9M19 9.5l1.5 9M8 9.5v4.5M16 9.5V14"/><path d="M7.5 6.5h3M13.5 6.5h3"/><path d="M9 6.5V5M15 6.5V5"/>',
    comprar: '<path d="M8.5 7.5C7 5.6 8 3.5 12 3.5s5 2.1 3.5 4"/><path d="M6.5 9.5c-2 2.4-2.6 5.4-1.6 7.8C6 19.8 8.6 20.5 12 20.5s6-.7 7.1-3.2c1-2.4.4-5.4-1.6-7.8z"/><path d="M8 7.5h8"/><circle cx="12" cy="14.2" r="2.4"/>',
  };
  const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATH[k] || PATH.mao}</svg>`;
  UI.svg = svg;
  // (the drawing of a verb: by its id — the social ones of soc-verbos by theirs —, the E by what it is to)
  const ICON = { dar: 'dar', abraco: 'abraco', desafiar: 'desafiar', 'pe-cartas': 'tabuletas', 'pe-dados': 'dados', 'tv-gorjeta': 'gorjeta', 'tv-gorjeta-mesa': 'gorjeta',
    'tv-rodada': 'rodada', 'tv-musica': 'musica', 'tv-jogo': 'ossinhos', 'jd-dados': 'dados', 'tv-cartas': 'tabuletas',
    'soc-cumprimentar': 'cumprimentar', 'soc-elogiar': 'elogiar', 'soc-beijar': 'beijar', 'soc-discutir': 'discutir', 'soc-insultar': 'insultar', 'soc-ameacar': 'ameacar',
    'soc-beber': 'beber', 'soc-ajuda': 'ajuda', 'soc-novidades': 'novidades', 'soc-casar': 'casar', 'soc-pazes': 'pazes', 'soc-adotar': 'adotar', chave: 'porta', bater: 'porta', armazem: 'porta',
    'jc-dados-compra': 'comprar', 'jc-baralho-compra': 'comprar' };
  const iconOf = (x, pid) => (x.id ? ICON[x.id] || 'mao' : pid === 'pessoa' ? 'conversar' : pid === 'taverna' ? 'pedir' : /porta/i.test(pid) ? 'porta' : 'mao');
  // (the price or the stake a verb says at the end of its words, in brackets — «Pagar uma rodada para a mesa (0,6 prata)»)
  const paren = s => { const m = /\(([^()]+)\)\s*$/.exec(s || ''); return m ? m[1] : ''; };
  const bare = s => String(s || '').replace(/\s*\([^()]+\)\s*$/, '');
  // (where the game of a verb comes from, in a few words, under its name — on the bar «aluguel 0,1 · dados da casa, emprestados», the
  // price first and the coin's name left to the round beside it (two short lines on the phone); on the list in whole words, «aluguel 0,1
  // denário · dados da casa, emprestados»; «o seu baralho e o dele» —, and, with none free, the wait: the games' own doors say it,
  // G.JogoDados.verbo and G.Cartas.podeCorpo (de, aluguel, aposta, espera — the J's, D-933 to D-935); their words keep the verb's name,
  // the part before the dash: «Chamar a mesa para os dados»)
  const GAME = { 'jd-dados': 'dados', 'pe-dados': 'dados', 'tv-cartas': 'baralho', 'pe-cartas': 'baralho' };
  const BUY = { dados: 'jc-dados-compra', baralho: 'jc-baralho-compra' }; // (buying one's own, of the keeper: the J's verbs, D-936)
  const head = s => bare(s).split(' — ')[0];
  const priceAt = (v, n) => { const b = v && v.inside ? G.S.buildings.get(v.inside) : null; return b && G.Cartas && G.Cartas.preco ? G.Cartas.preco(b, n) : String(n); };
  const num = n => String(Math.round(n * 10) / 10).replace('.', ',');
  function gameOf(id, v, o) {
    const t = GAME[id]; if (!t || !v) return null;
    const x = t === 'dados' ? (G.JogoDados && G.JogoDados.verbo ? G.JogoDados.verbo(v) : null) : (G.Cartas && G.Cartas.podeCorpo ? G.Cartas.podeCorpo(v, o ? o.id : undefined) : null);
    if (!x) return null;
    if (x.espera) return { tipo: t, bar: '', row: '', est: t === 'dados' ? 'esperando um jogo livre' : 'esperando um baralho livre' };
    const al = x.aluguel > 1e-6 ? x.aluguel : 0, ap = x.k === 'entrar' && x.aposta > 1e-6 ? x.aposta : 0;
    return { tipo: t, est: '', bar: [ap ? `aposta ${num(ap)}` : '', al ? `aluguel ${num(al)}` : '', bare(x.de || '')].filter(Boolean).join(' · '),
      row: [al ? `aluguel ${priceAt(v, al)}` : '', x.de || ''].filter(Boolean).join(' · ') };
  }

  // ------------------------------ the bar of the table: what it shows (only read) ------------------------------
  // The slots of the table, in their order: the table's own E (the menu, the keeper called, the cup, the plate), the round, the dice,
  // the Tabuletas, the bones, a song, the coin to the musician; a verb another part brings to the table after them, by its words; and
  // getting up. A slot is there greyed, with the world's why, while it cannot be done now — and away only where it is nothing of this
  // table now (no words and no why: the body is the musician)
  const SLOT = {
    '': { nome: 'Pedir', icon: 'pedir' },
    'tv-rodada': { nome: 'Rodada', icon: 'rodada', dft: 'Pagar uma rodada para a mesa' },
    'jd-dados': { nome: 'Dados', icon: 'dados', dft: 'Chamar a mesa para os dados' },
    'tv-cartas': { nome: 'Tabuletas', icon: 'tabuletas', dft: 'Jogar tabuletas' },
    'tv-jogo': { nome: 'Ossinhos', icon: 'ossinhos', dft: 'Entrar no jogo de ossinhos' },
    'tv-musica': { nome: 'Música', icon: 'musica', dft: 'Pedir uma música' },
    'tv-gorjeta-mesa': { nome: 'Gorjeta', icon: 'gorjeta', dft: 'Dar uma gorjeta ao músico' },
  };
  UI.ORDER = ['', 'tv-rodada', 'jd-dados', 'tv-cartas', 'tv-jogo', 'tv-musica', 'tv-gorjeta-mesa'];
  UI.KEYS = 8; // (the keys of the bar and of the list: the quick keys 1 to 5, and 6 to 8 of this file's own)
  // (the key of the slot i, as the screen says it: the quick keys while one sits, then this file's three; getting up is the jump)
  const keyOf = (i, id) => (id === 'levantar' ? In.label('pular') : i < 5 ? In.label('rapido' + (i + 1)) : i < UI.KEYS ? In.label('acao' + (i + 1)) : '');
  // (a game's slot: its source under its name, or the wait for one free — and, waiting, the keeper's own to buy, when he sells one: buy)
  const slotOf = (x, d, s, v, by) => {
    let nome = d.nome; if (!x.id && s && s.hold) nome = s.hold.food ? 'Comer' : 'Beber';
    const g = gameOf(x.id, v); const label = (g ? head(x.label) : x.label) || d.dft || ''; const why = x.ok ? '' : x.why || (x.label ? '' : 'Agora não.');
    const sub = g ? g.bar : [paren(x.label), x.sub].filter(Boolean).join(' · ') || (!x.id ? bare(x.label) : '');
    const bv = g && g.est && by ? by.get(BUY[g.tipo]) : null;
    return { id: x.id, k: x.k, nome, icon: !x.id && s && s.hold && s.hold.food ? 'comer' : d.icon, label, sub, est: g ? g.est : '', buy: bv && bv.label ? bv.id : '', ok: !!x.ok, why };
  };
  // (the verbs that are the list's only: buying a game — the bar keeps its slots; a game waiting for one free opens the list at it)
  const LIST_ONLY = new Set(Object.values(BUY));
  UI.mesa = function () {
    const v = P().body(); const s = v && T() && T().corpo ? T().corpo(v) : null; if (!s || !s.open || !s.seat || v.sleeping) return null;
    const tb = I.here('taverna'); if (!tb) return null;
    const L = I.verbsOf(tb, true); const by = new Map(L.map(x => [x.id, x])); const out = [];
    for (const id of UI.ORDER) { const x = by.get(id); if (!x || (!x.label && !x.why)) continue; out.push(slotOf(x, SLOT[id], s, v, by)); }
    for (const x of L) if (!(x.id in SLOT) && !LIST_ONLY.has(x.id) && x.label) out.push(slotOf(x, { nome: cap(bare(x.label)).split(' ').slice(0, 2).join(' '), icon: 'mais' }, s, v, by)); // (another part's verb at the table: by its own words)
    out.push({ id: 'levantar', k: 'levantar', nome: 'Levantar', icon: 'levantar', label: 'Levantar da mesa', sub: '', ok: true, why: '' });
    out.forEach((q, i) => { q.key = keyOf(i, q.id); });
    const b = G.S.buildings.get(s.b); return { b: s.b, tema: b ? T().look(b).tema : 'classico', nome: b ? G.Village.buildName(b) : 'A taverna', items: out };
  };

  // ------------------------------ the list of actions: what it shows (only read) ------------------------------
  // the target's every verb — the E first —, each with its words, a short line under it, and the why where it cannot be done now; and the
  // others in reach to switch to (I.candidates), by their names. The slots a list keeps greyed while they have no words now: the giving
  // (the bag empty, D-922), and at the tavern's table the games with someone — the Tabuletas and the dice
  // (each kept slot: its words while it has none of its own, and whether it is kept only at a tavern's table — the games with someone)
  const KEEP = { pessoa: { dar: [(v, o) => `Dar algo ${ao(v, o)}`], 'pe-cartas': [(v, o) => `Desafiar ${who(v, o)} para as tabuletas`, 1], 'pe-dados': [(v, o) => `Jogar dados com ${who(v, o)}`, 1] },
    taverna: Object.fromEntries(Object.keys(SLOT).filter(k => k).map(k => [k, [() => SLOT[k].dft]])) };
  let subMemo = { id: 0, sub: '' }; // (the line under a person's name, made once a list: what the body knows of them — Interact.personCard)
  const atTable = v => { const s = v && T() && T().corpo ? T().corpo(v) : null; return !!(s && s.open && s.seat); };
  // (a building by its name: «a taverna», «o armazém»; its plan's door, «a porta da taverna»)
  const bname = b => (b ? G.Village.buildName(b).toLowerCase() : '');
  const nameOf = (v, c) => (!c ? '' : c.id === 'pessoa' && c.t.o ? cap(who(v, c.t.o)) : c.id === 'taverna' ? (c.t.bal ? 'O balcão' : 'A mesa')
    : c.id === 'portaPlanta' && c.t.b ? `A porta d${G.gen(bname(c.t.b)) === 'a' ? 'a' : 'o'} ${bname(c.t.b)}` : c.id === 'porta' && c.t.b ? cap(bname(c.t.b)) : cap(bare(c.label)));
  // (the rows of one target: its verbs, the kept slots greyed with why; ch, the target each row is done on)
  function rowsOf(v, c) {
    const L = I.verbsOf(c, true); const keep = KEEP[c.id] || {}; const games = atTable(v); const out = [];
    for (const x of L) {
      const dft = keep[x.id]; if (!x.label && !(dft && x.why && (!dft[1] || games) && (c.t.o || c.id !== 'pessoa'))) continue;
      const g = gameOf(x.id, v, c.t.o); const label = (g ? head(x.label) : x.label) || dft[0](v, c.t.o);
      const sub = g ? [paren(head(x.label)), g.row || g.est].filter(Boolean).join(' · ') : [paren(x.label), x.sub].filter(Boolean).join(' · ');
      out.push({ k: x.k, id: x.id, label, sub, ok: !!x.ok && !!x.label, why: x.ok && x.label ? '' : x.why || 'Agora não.', icon: iconOf(x, c.id), ch: c });
    }
    return out;
  }
  // c2: the companion of a door — the building's own offer and its plan's door, one list: before a door shut or locked, opening it or
  // knocking first, the look at the building after (T-2061)
  UI.lista = function (c, c2) {
    const v = P().body(); if (!v || !c || !c.p) return null;
    let out = rowsOf(v, c);
    if (c2 && c2.p) { const door = c.id === 'portaPlanta' ? c : c2.id === 'portaPlanta' ? c2 : null; const st = door && G.Interiors.doorState ? G.Interiors.doorState(door.t.b, door.t.d.id) : null;
      const shut = !!st && (st.state === 'fechada' || st.state === 'trancada'); const more = rowsOf(v, c2); out = (shut ? door === c : door !== c) ? out.concat(more) : more.concat(out); }
    // (what can be done now first — the E always at the head —, what cannot after it, each in its order)
    out = out.map((q, i) => [q, i]).sort((a, b) => (a[0].k === 'usar' && a[1] === 0 ? -1 : 0) - (b[0].k === 'usar' && b[1] === 0 ? -1 : 0) || (b[0].ok ? 1 : 0) - (a[0].ok ? 1 : 0) || a[1] - b[1]).map(e => e[0]);
    // (at the table one sits at, getting up too — the jump of the feet, as on the bar)
    if (c.id === 'taverna' && !c.t.bal && atTable(v)) out.push({ k: 'levantar', id: 'levantar', label: 'Levantar da mesa', sub: '', ok: true, why: '', icon: 'levantar' });
    out.forEach((q, i) => { q.key = q.id === 'levantar' ? In.label('pular') : i < UI.KEYS ? (i < 5 ? In.label('rapido' + (i + 1)) : In.label('acao' + (i + 1))) : ''; });
    const o = c.id === 'pessoa' ? c.t.o : null; const k = o ? P().kin(v, o) : null;
    if (o && subMemo.id !== o.id) { const card = I.personCard ? I.personCard(o, v) : null; subMemo = { id: o.id, sub: card ? card.sub : '' }; }
    const dk = c.id === 'portaPlanta' || c.id === 'porta' ? (c2 && c2.id === 'portaPlanta' ? c2 : c) : null; // (a door and its building: named by the door)
    return { key: I.keyOf(c), id: c.id, nome: nameOf(v, dk && dk.id === 'portaPlanta' ? dk : c), sub: o ? [k, subMemo.sub].filter(Boolean).join(' · ') : c.id === 'taverna' ? (c.t.bal ? 'onde se pede' : 'onde você está sentad' + (v.g === 'f' ? 'a' : 'o')) : '', o: o ? o.id : 0, icon: o ? 'conversar' : c.id === 'taverna' ? 'mesa' : iconOf({ id: '' }, c.id), verbs: out };
  };
  // (the targets in reach, as the list offers them: one a thing, by its name — the table, a person —, the one shown marked)
  function others(v) {
    const sn = I.scan(); if (!sn) return { sn: null, L: [] };
    const L = I.candidates(sn).map(c => ({ key: c.key, id: c.id, c, nome: nameOf(v, c) }));
    return { sn, L };
  }

  // ------------------------------ the screen: the bar, the list, the word of the first time ------------------------------
  function build() {
    const hud = G.IncUI.hud && G.IncUI.hud(), root = G.IncUI.root && G.IncUI.root(); if (!hud || !root) return false; if (built) return true; built = true;
    bar = document.createElement('div'); bar.className = 'ac-mesa hidden'; bar.innerHTML = '<div class="ac-cap"><i class="ac-emb"></i><span class="ac-tit"></span><span class="ac-say"></span></div><div class="ac-row"></div>';
    hud.appendChild(bar);
    bar.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; e.stopPropagation(); doSlot(+b.dataset.i, true); });
    bar.addEventListener('pointerover', e => { const b = e.target.closest('[data-i]'); if (b && !In.touch) say(+b.dataset.i, 0); });
    bar.addEventListener('pointerleave', () => { if (!In.touch) say(-1, 0); });
    bar.addEventListener('touchstart', e => e.stopPropagation(), { passive: true }); // (the bar's touch is the bar's: never the stick nor the eye)
    bar.addEventListener('mousedown', e => e.stopPropagation());
    dica = document.createElement('div'); dica.className = 'ac-dica hidden'; hud.appendChild(dica);
    dica.addEventListener('click', e => { if (e.target.closest('[data-a="ok"]')) { e.stopPropagation(); dicaDone(); } });
    dica.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
    sheet = document.createElement('div'); sheet.id = 'acoes-panel'; sheet.className = 'ac hidden';
    sheet.innerHTML = `<div class="ac-card"><div class="ac-band"></div><button class="x" data-a="close" aria-label="Fechar" title="Fechar (Esc)">×</button>
      <header class="ac-top"><span class="ac-face"><canvas width="128" height="128"></canvas><i></i></span><span class="ac-who"><b></b><small></small></span></header>
      <div class="ac-tabs"></div><div class="ac-list"></div><div class="ac-foot"></div></div>`;
    root.appendChild(sheet);
    sheet.addEventListener('click', onSheet); sheet.addEventListener('contextmenu', e => e.preventDefault());
    sheet.addEventListener('pointerover', e => { const r = e.target.closest('[data-r]'); if (r && !In.touch) { const i = +r.dataset.r; if (i !== sel) { sel = i; mark(); } } });
    for (const el of [sheet]) el.addEventListener('mousedown', e => e.stopPropagation());
    G.IncUI.closers.push(() => { if (open) hide(); });
    return true;
  }
  // (the word the bar says over its buttons: the house's name; over one of them, what it does in whole and why not — a moment)
  function say(i, t) { hint = { i, t: t || 0 }; barSig = ''; }

  // ------------------------------ doing ------------------------------
  // a slot of the bar: by the verb's own door (the E of the table: IncUI.use; a verb: IncUI.useVerb — the world asked by the hands,
  // the answer told as any verb's); getting up, the jump — as the feet do it —; one greyed, its why said
  function doSlot(i, tapped) {
    const m = model || UI.mesa(); const q = m && m.items[i]; if (!q) return false;
    if (q.id === 'levantar') { dicaDone(); In.press('pular'); return true; }
    if (!q.ok) { say(i, 3.5); deny(q.why || 'Agora não dá.'); if (q.buy) UI.open(I.here('taverna'), q.buy); return true; }
    const tb = I.here('taverna'); if (!tb) return false;
    dicaDone(); play('click', 0.35); void tapped;
    // (the table's E while a sip is under way: the sip gives way where it may — as a verb does, Interact.runVerb)
    if (q.k === 'usar') { if (G.Avatar.busy() && G.Avatar.cuttable && G.Avatar.cuttable()) G.Avatar.cancelAct(); G.IncUI.use(tb); }
    else G.IncUI.useVerb(q.k, tb, q.id);
    barSig = ''; upT = 0; return true;
  }
  UI.faz = i => doSlot(i, false); // (for the proofs: the slot i of the bar, as a key does it)
  // a row of the list: the list shuts and the verb is done on the target it is of (the screen's own choice of a candidate — the one
  // the player switched to — held as the screen holds it: IncUI.pick, D-397)
  function doRow(i) {
    const q = rows[i]; if (!q) return false;
    if (!q.ok) { sel = i; mark(); deny(q.why || 'Agora não dá.'); return true; }
    if (q.k === 'levantar') { hide(); dicaDone(); In.press('pular'); return true; }
    const c = cur; hide(); if (!c) return true; dicaDone();
    const ch = q.ch && q.ch !== c.choice ? I.asChoice(q.ch) || q.ch : I.asChoice(c.cand || c.choice) || c.choice;
    if (q.k === 'usar') G.IncUI.use(ch); else G.IncUI.useVerb(q.k, ch, q.id);
    return true;
  }
  // (for the proofs: the row i of the list — of the list open, or of a target's own, as the list would show it)
  UI.lado = (i, c, c2) => { if (c) { cur = { key: I.keyOf(c), choice: c, cand: null, pair: c2 || null }; curKey = cur.key; const m = UI.lista(c, c2); rows = m ? m.verbs : []; } return doRow(i); };

  // ------------------------------ the list: open, shut, drawn ------------------------------
  // (open over the target the screen shows — or, seated at a tavern's table with no one faced, over the table —; ch: a choice of the
  // screen's own, a candidate of I.candidates)
  UI.open = function (ch, rowId) {
    const v = P().body(); if (!G.Modes.inc() || !v || v.sleeping || !build()) return false;
    let c = ch || G.IncUI.best();
    if (!ch && !(c && c.id === 'pessoa') && atTable(v)) c = I.here('taverna') || c;
    G.IncUI.closeAll(); G.Modes.setPanel('acoes'); In.free(); G.IncUI.root().classList.add('ac-on');
    open = true; sel = -1; keyed = false; sheetSig = ''; subMemo = { id: 0, sub: '' }; setCur(c, v);
    sheet.className = `ac ${themeOf(v)}`; void sheet.offsetWidth; render(true); play('rustle', 0.35);
    if (rowId) { const i = rows.findIndex(q => q.id === rowId); if (i >= 0) { sel = i; keyed = true; render(true); } } // (opened at a row: the one the bar sent to)
    return true;
  };
  UI.close = () => { if (open) hide(); };
  function hide() {
    open = false; sel = -1; if (sheet) sheet.classList.add('hidden'); const r = G.IncUI.root && G.IncUI.root(); if (r) r.classList.remove('ac-on');
    if (G.Modes.panelIs('acoes')) G.Modes.setPanel(null);
  }
  const themeOf = v => { const s = v && T() && T().corpo ? T().corpo(v) : null; const b = s && G.S.buildings.get(s.b); return b ? `t-${T().look(b).tema}` : 't-hud'; };
  // (the target held by the list: a candidate's key and its choice; null when nothing is in reach)
  function setCur(c, v) { cur = c ? { key: I.keyOf(c), choice: c, cand: null } : null; curKey = cur ? cur.key : ''; void v; }
  // (the list's target found again in a new look, by its key; gone from reach: the first one in reach, said so)
  function refresh(v) {
    const o = others(v); let c = o.L.find(q => q.key === curKey) || null; let gone = '';
    // (the table one sits at is the list's while it is there, among the most meant or not)
    if (!c && cur && cur.choice && o.sn) { const h = I.here(cur.choice.id, o.sn); if (h && I.keyOf(h) === curKey) { cur = { key: curKey, choice: h, cand: null, pair: null }; return { L: o.L, gone }; } }
    if (!c && curKey) { gone = cur && cur.choice ? nameOf(v, cur.choice) : ''; c = o.L[0] || null; }
    else if (!c && !curKey && o.L.length) c = o.L.find(q => q.c.first) || o.L[0]; // (opened with nothing shown: the one meant most in reach)
    if (c) { const ch = c.c.first && o.sn ? I.best(o.sn) : I.asChoice(c.c); cur = { key: c.key, choice: ch, cand: c.c }; curKey = c.key; } else cur = null;
    if (cur) cur.pair = pairOf(cur.choice, o.L);
    return { L: o.L, gone };
  }
  UI.par = ch => { const v = P().body(); return v ? pairOf(ch, others(v).L) : null; }; // (for the proofs: the companion the list joins)
  // (a door's companion in reach: the plan's door of the building whose offer it is, or that building's offer — from outside, T-2061)
  function pairOf(ch, L) {
    if (!ch || !ch.t || !ch.t.b || (ch.id !== 'porta' && ch.id !== 'portaPlanta') || ch.t.dentro) return null;
    const q = L.find(x => x.id === (ch.id === 'porta' ? 'portaPlanta' : 'porta') && x.c.t.b === ch.t.b && !x.c.t.dentro); return q ? I.asChoice(q.c) : null;
  }
  function render(force) {
    const v = P().body(); if (!sheet || !v) return;
    const { L, gone } = refresh(v); const m = cur && cur.choice ? UI.lista(cur.choice, cur.pair) : null; rows = m ? m.verbs : [];
    if (sel >= rows.length) sel = rows.length - 1; if (sel < 0 && rows.length && (keyed || !In.touch)) { const f = rows.findIndex(q => q.ok); sel = f >= 0 ? f : 0; }
    const touch = !!In.touch;
    const st = JSON.stringify([m && m.key, m && m.nome, m && m.sub, rows.map(q => [q.id, q.label, q.sub, q.ok, q.why, q.key]), L.map(q => [q.key, q.nome]), sel, touch, gone]);
    if (!force && st === sheetSig) return; sheetSig = st;
    const top = sheet.querySelector('.ac-top'); top.querySelector('b').textContent = m ? m.nome : 'Nada ao alcance'; top.querySelector('small').textContent = m ? m.sub : 'Chegue perto de alguém ou de alguma coisa.';
    const fc = top.querySelector('.ac-face'); const o = m && m.o ? G.S.villagers.get(m.o) : null; fc.classList.toggle('pic', !!o); fc.querySelector('i').innerHTML = o ? '' : svg(m ? m.icon : 'mao');
    if (o && fc._o !== o.id) { fc._o = o.id; face(fc.querySelector('canvas'), o); } if (!o) fc._o = 0;
    // (the others in reach, by their names: the one shown marked; a tap switches the list to it)
    sheet.querySelector('.ac-tabs').innerHTML = L.length > 1 ? `<span class="ac-tl">Ao alcance</span>${L.map(q => `<button class="ac-tab${q.key === curKey ? ' on' : ''}" data-t="${esc(q.key)}">${q.id === 'pessoa' ? '' : `<i>${svg(q.id === 'taverna' ? 'mesa' : iconOf({ id: '' }, q.id))}</i>`}${esc(q.nome)}</button>`).join('')}` : '';
    sheet.querySelector('.ac-list').innerHTML = (gone ? `<div class="ac-gone">${esc(cap(gone))} não está mais ao alcance.</div>` : '') + (rows.length ? rows.map((q, i) => `<button class="ac-r${q.ok ? '' : ' off'}${i === sel ? ' sel' : ''}" data-r="${i}"${q.ok ? '' : ` aria-disabled="true"`}>${q.key && !touch ? `<kbd>${esc(q.key)}</kbd>` : ''}<span class="ic">${svg(q.icon)}</span><span class="nm"><b>${esc(cap(bare(q.label)) || cap(q.label))}</b>${q.sub ? `<small>${esc(q.sub)}</small>` : ''}${q.ok ? '' : `<em>${esc(q.why)}</em>`}</span></button>`).join('') : '<div class="ac-none">Nada a fazer aqui agora.</div>');
    sheet.querySelector('.ac-foot').innerHTML = touch ? '<button class="ac-fecha" data-a="close">Fechar</button>' : `<span><kbd>↑</kbd><kbd>↓</kbd> escolhe · <kbd>1</kbd>–<kbd>${UI.KEYS}</kbd> faz · <kbd>${esc(In.label('interagir'))}</kbd> faz · <kbd>Esc</kbd> fecha</span>`;
    if (keyed) { keyed = false; const r = sheet.querySelector('.ac-r.sel'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'nearest' }); }
  }
  function mark() { if (!sheet) return; for (const el of sheet.querySelectorAll('.ac-r')) el.classList.toggle('sel', +el.dataset.r === sel); }
  function onSheet(e) {
    const a = e.target.closest('[data-a]'); if (a && a.dataset.a === 'close') { hide(); return; }
    const t = e.target.closest('[data-t]'); if (t) { const v = P().body(); const o = others(v).L.find(q => q.key === t.dataset.t); if (o) { setCur(o.c.first ? I.best() : I.asChoice(o.c), v); sel = -1; render(true); play('click', 0.4); } return; }
    const r = e.target.closest('[data-r]'); if (r) doRow(+r.dataset.r);
  }
  // (the face of a person on the list: the 3D's portrait where it can be made, else the god's drawing — as the menu's keeper, D-645)
  function face(canvas, o) {
    const x = canvas.getContext && canvas.getContext('2d'); if (!x) return; x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, 64, 64);
    const g = x.createRadialGradient(32, 26, 4, 32, 32, 36); g.addColorStop(0, '#f6e4bd'); g.addColorStop(1, '#a8834f'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    if (G.Retrato3D && G.Retrato3D.into(canvas, o)) return;
    if (G.Art && G.Art.villager && o.age >= 2) { x.save(); x.translate(32, 54); x.scale(3.6, 3.6); G.Art.villager(x, Object.assign({}, o, { act: '', moving: false, face: 1, sleeping: false, inside: 0, hurt: 0, torch: false, emo: null }), 0, 0, 0, false); x.restore(); }
  }
  // (the list's rows by the keys: up and down, the hands' key does the one chosen)
  function step(d) { if (!rows.length) return; sel = sel < 0 ? (d > 0 ? 0 : rows.length - 1) : (sel + d + rows.length) % rows.length; keyed = true; sheetSig = ''; render(); play('hover', 0.5); }

  // ------------------------------ the bar: drawn ------------------------------
  function drawBar(m, v) {
    const touch = !!In.touch; const it = m.items;
    const sig = JSON.stringify([m.tema, m.nome, it.map(q => [q.id, q.nome, q.sub, q.est, q.ok, q.why, q.key, q.icon]), touch, hint.i]);
    if (sig === barSig) return; barSig = sig;
    bar.className = `ac-mesa t-${m.tema}${touch ? ' touch' : ''}`;
    const h = hint.i >= 0 && it[hint.i] ? it[hint.i] : null;
    bar.querySelector('.ac-emb').innerHTML = svg('mesa'); bar.querySelector('.ac-tit').textContent = 'Mesa';
    bar.querySelector('.ac-say').innerHTML = h ? `${esc(cap(bare(h.label)))}${h.ok ? (h.sub ? ` <small>${esc(h.sub)}</small>` : '') : ` — <em>${esc(h.why)}</em>`}` : esc(m.nome);
    bar.querySelector('.ac-row').innerHTML = it.map((q, i) => `<button class="ac-b${q.ok ? '' : ' off'}${q.id === 'levantar' ? ' up' : ''}${i === hint.i ? ' hov' : ''}" data-i="${i}" title="${esc(q.ok ? cap(q.label) : `${cap(bare(q.label))} — ${q.why}`)}"${q.ok ? '' : ' aria-disabled="true"'}>${q.key && !touch ? `<kbd>${esc(q.key)}</kbd>` : ''}<span class="ic">${svg(q.icon)}</span><b>${esc(q.nome)}</b><small>${esc(q.ok ? q.sub : q.est || q.why)}</small></button>`).join('');
    void v;
  }
  // (the word of the first time at a tavern's table: shows the bar; gone for good once the bar is used, or «Entendi» — kept in this
  // browser, with try: a private window says nothing, and the word shows again — D-923)
  const DICA = 'gotaf-dica-mesa';
  const dicaSeen = () => { try { return localStorage.getItem(DICA) === '1'; } catch (e) { return false; } };
  let dicaMem = false; // (with no storage at all: once this session)
  function dicaDone() { if (dicaMem && !dicaOn) return; dicaMem = true; dicaOn = false; if (dica) dica.classList.add('hidden'); try { localStorage.setItem(DICA, '1'); } catch (e) { } }
  UI.dicaVista = () => dicaMem || dicaSeen(); // (for the proofs)
  function drawDica(v) {
    if (dicaOn) return; dicaOn = true; const touch = !!In.touch; const oa = v.g === 'f' ? 'a' : 'o';
    dica.innerHTML = `<b>Sentad${oa} à mesa</b><p>Tudo o que dá para fazer aqui está nesta barra: pedir, pagar uma rodada, os dados, as tabuletas, uma música. ${touch ? 'Toque numa ação.' : `Cada uma tem a sua tecla (<kbd>${esc(In.label('rapido1'))}</kbd> a <kbd>${esc(In.label('acao7') || '7')}</kbd>).`} O que está apagado diz por que não dá agora.</p><p>Para falar com alguém da mesa, ${touch ? 'toque em <b>Ações</b>' : `aperte <kbd>${esc(In.label('acoes'))}</kbd>`}: lá está tudo o que dá para fazer com cada um.</p><button data-a="ok">Entendi</button>`;
    dica.className = `ac-dica t-${(model && model.tema) || 'classico'}`;
  }

  // ------------------------------ the keys, the controller, the fingers ------------------------------
  // (the list's own action — a key of its own, a button of the controller —, the bar's sixth to eighth keys; the «Ações» of the fingers)
  In.def('acoes', 'Ações: tudo o que dá para fazer agora', ['y'], ['pad16']);
  for (let i = 6; i <= UI.KEYS; i++) In.def('acao' + i, `Ação ${i} (da barra da mesa e da lista)`, [String(i)]);
  In.button('acoes', { label: 'Ações', order: 13 });
  const barLive = () => !!(mesaOn && model && G.Modes.inc() && !G.Modes.panel());
  In.on('acoes', () => { if (!G.Modes.inc()) return false; if (open) { hide(); return true; } if (G.Modes.panel()) return false; UI.open(); return true; });
  for (let i = 6; i <= UI.KEYS; i++) In.on('acao' + i, () => { if (open) { doRow(i - 1); return true; } if (barLive()) { doSlot(i - 1); return true; } return false; });
  In.on('frente', () => { if (!open) return false; step(-1); return true; });
  In.on('tras', () => { if (!open) return false; step(1); return true; });
  In.on('interagir', () => { if (!open) return false; if (sel >= 0) doRow(sel); else hide(); return true; });
  // (the quick keys: over the list its rows; seated at the table the bar's slots — the bar takes the place of the quick things, as a
  // person's card does, D-628 —; the controller's cross ↑ ↓ goes up and down the list, and at the table ↓ opens it)
  { const ck0 = G.IncUI.cardKey; G.IncUI.cardKey = function (i) {
    const pad = In.device === 'pad';
    if (open) { if (pad) { if (i === 0) step(-1); else if (i === 2) step(1); } else doRow(i); return true; }
    if (barLive()) { if (pad) { if (i === 2) { UI.open(); return true; } return ck0 ? ck0.apply(this, arguments) : false; } doSlot(i); return true; }
    return ck0 ? ck0.apply(this, arguments) : false; }; }

  // ------------------------------ the frame ------------------------------
  // (a few times a second, from the body's screen: the bar shown while the body sits at an open tavern's table with no panel over the
  // screen and nothing to fight, drawn again when what it shows changed; the list kept with the world; the word of the first time)
  UI.frame = function (rdt) {
    if (!G.Modes.inc()) { if (open) hide(); if (mesaOn) setMesa(false); return; }
    if (!build()) return; const v = P().body(); if (!v) return;
    if (open && !G.Modes.panelIs('acoes')) { open = false; sheet.classList.add('hidden'); G.IncUI.root().classList.remove('ac-on'); } // (another panel took the screen)
    if (hint.t > 0) { hint.t -= rdt || 0; if (hint.t <= 0) { hint = { i: -1, t: 0 }; barSig = ''; } }
    upT -= rdt || 0; sheetT -= rdt || 0;
    if (open && sheetT <= 0) { sheetT = 0.25; render(); }
    if (upT > 0) return; upT = 0.2;
    const fight = G.IncUI.fightNear ? G.IncUI.fightNear(v) : false; const off = G.IncUI.hudOff && G.IncUI.hudOff() && !In.touch;
    model = fight ? null : UI.mesa();
    const on = !!model && !G.Modes.panel() && !off;
    setMesa(on); if (on) { drawBar(model, v); const r = bar.getBoundingClientRect(); const hgt = Math.max(0, Math.round(innerHeight - r.top)); if (hgt && hgt !== barH) { barH = hgt; G.IncUI.root().style.setProperty('--ac-h', hgt + 'px'); } } // (how far up the bar stands: the word of the first time and the prompt over it)
    // (the word of the first time, over the bar)
    if (on && !dicaMem && !dicaSeen()) drawDica(v); else if (dicaOn && (!on || dicaMem)) { dicaOn = false; dica.classList.add('hidden'); }
    if (!on && dicaOn) { dicaOn = false; dica.classList.add('hidden'); }
  };
  function setMesa(on) {
    if (on === mesaOn) return; mesaOn = on; const r = G.IncUI.root && G.IncUI.root(); if (r) r.classList.toggle('mesa-on', on);
    if (bar) bar.classList.toggle('hidden', !on); if (!on && dica) { dica.classList.add('hidden'); dicaOn = false; } if (!on) hint = { i: -1, t: 0 };
  }
  UI.mesaOn = () => mesaOn; UI.alto = () => (mesaOn ? barH : 0); // (the screen asks: the bar is up, and how far up it stands)
  // (how the hands reach a slot of the bar now, in words, for another part's word to the player — «toque em «Dados» na barra da mesa», «a
  // tecla 3 («Dados», na barra da mesa)»; '' away from a table — the bar of the table one sits at, shown or under a panel for a moment (the
  // menu the keeper brought): the dice's call said «F: entrar», and at the table the F is the round — L-2183)
  UI.how = id => { const m = UI.mesa(); const q = m ? m.items.find(x => x.id === id) : null; if (!q) return ''; return In.touch ? `toque em «${q.nome}» na barra da mesa` : q.key ? `a tecla ${q.key} («${q.nome}», na barra da mesa)` : `«${q.nome}», na barra da mesa`; };
  UI.shown = () => ({ mesa: mesaOn, dica: dicaOn, lista: open, sel, itens: model ? model.items.map(q => ({ id: q.id, nome: q.nome, ok: q.ok, why: q.why, key: q.key, sub: q.sub, est: q.est, buy: q.buy })) : [], rows: rows.map(q => ({ id: q.id, k: q.k, label: q.label, sub: q.sub, ok: q.ok, why: q.why, key: q.key })), alvo: curKey }); // (for the proofs)
  const frame0 = G.IncUI.frame;
  G.IncUI.frame = function (rdt) { const r = frame0.apply(this, arguments); UI.frame(rdt); return r; };
})(window.G);
