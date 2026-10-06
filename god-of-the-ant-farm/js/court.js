'use strict';
// ============================================================
//  The court, the taxman and the tavern.
//  Every ruler has a vanity of their own: a modest chief lives
//  in a house a little bigger than the others; a proud king
//  raises a palace; a vain one a great palace with wings and
//  gardens; and the vainest of all — a king who wants the
//  greatest palace in the world — pulls half the town's
//  builders off every other work, raises the taxes and leaves
//  the fields waiting, until the golden thing stands outside
//  the town with its fountains and its avenue of statues.
//  Before coin there is tribute: collectors knock door to door
//  and carry sacks of what the houses have to the chief.
//  The tavern opens early; at night there is wine and music,
//  drunks weaving home, and now and then a fight.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Co = G.Court = {};
  const E = G.Eco, P = G.Politics;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // ------------------------------ vanity ------------------------------
  Co.vanity = function (v) {
    if (!v) return 0.4; const pe = P.persona(v);
    if (pe.vai === undefined) {
      const tr = v.traits || [];
      let x = 0.05 + G.hash(v.id * 977 + 11) * 0.7 + (pe.amb - 0.5) * 0.45;
      if (tr.includes('Glutão')) x += 0.1; if (tr.includes('Devoto')) x -= 0.08; if (tr.includes('Trabalhador')) x -= 0.06;
      pe.vai = Math.round(G.clamp(x, 0, 1) * 100) / 100;
    }
    return pe.vai;
  };
  const oldWords = P.personaWords;
  P.personaWords = function (v) {
    const w = oldWords(v); const x = Co.vanity(v); const f = v.g === 'f';
    if (x > 0.8) w.push(f ? 'ostentadora' : 'ostentador'); else if (x < 0.18) w.push(f ? 'modesta' : 'modesto');
    return w;
  };

  // ------------------------------ the seats of power ------------------------------
  Object.assign(G.BDEF, {
    paco: { name: 'Casa do Chefe', w: 2, h: 2, cost: { wood: 30, stone: 28 }, work: 46, blocks: true, hp: 240, civic: 1 },
    grande_palacio: { name: 'Grande Palácio', w: 4, h: 4, cost: { wood: 90, stone: 240 }, work: 260, blocks: true, hp: 700, civic: 1 },
    palacio_colossal: { name: 'Palácio Colossal', w: 5, h: 5, cost: { wood: 170, stone: 560 }, work: 720, blocks: true, hp: 1100, civic: 1 },
  });
  Object.assign(G.BDESC, {
    paco: 'A casa de quem governa: um pouco maior que as outras, com um estandarte na porta.',
    grande_palacio: 'Alas, pátio com fonte e jardins. Exige muitos construtores e muita pedra.',
    palacio_colossal: 'O sonho de um governante vaidoso: o maior palácio do mundo. Tira metade dos construtores de tudo o mais, aumenta os impostos e leva anos — mas quando fica pronto, ninguém esquece.',
  });
  Co.RANK = { paco: 1, palacio: 2, grande_palacio: 3, palacio_colossal: 4 };
  Co.isPalace = type => !!Co.RANK[type];
  if (G.City) Object.assign(G.City.IDEAL, { paco: 2.6, grande_palacio: 6, palacio_colossal: 10 });
  const NAMES = {
    paco: { grego: 'Casa do Basileu', romano: 'Domus do Magistrado', egipcio: 'Casa do Nomarca', asteca: 'Casa do Tlatoani', nordico: 'Salão do Chefe', classico: 'Casa do Chefe' },
    grande_palacio: { grego: 'Grande Palácio', romano: 'Palácio Imperial', egipcio: 'Grande Casa do Faraó', asteca: 'Grande Palácio do Tlatoani', nordico: 'Grande Salão do Rei', classico: 'Grande Palácio' },
    palacio_colossal: { grego: 'Palácio Dourado', romano: 'Domus Áurea', egipcio: 'Palácio de Milhões de Anos', asteca: 'Palácio dos Mil Jardins', nordico: 'Salão Dourado', classico: 'Palácio do Sol' },
  };
  const oldNameOf = G.Village.nameOf;
  G.Village.nameOf = function (type, b) {
    if (NAMES[type]) {
      const st = (b && b.style) || 'classico'; const base = NAMES[type][st] || NAMES[type].classico;
      if (b && b.patron && type !== 'paco') return `${base} de ${b.patron}`;
      return base;
    }
    if (type === 'coletoria' && b && b.set !== undefined) { const f = G.Fac.get(G.Village.facOfSet(b.set)); if (f && !E.coinage(f.id)) return 'Casa do Tributo'; }
    return oldNameOf(type, b);
  };
  // the metropolis counts a great palace as a palace
  const oldTier = G.City.tierOf;
  G.City.tierOf = function (set, c, pop) { c = c || {}; if (c.grande_palacio || c.palacio_colossal) c = Object.assign({}, c, { palacio: (c.palacio || 0) + (c.grande_palacio || 0) + (c.palacio_colossal || 0) }); return oldTier(set, c, pop); };

  // which palace this ruler wants
  function desired(f, set) {
    const r = P.ruler(f); const x = Co.vanity(r); const t = set.tier || 0; const pop = G.Village.pop(set.id);
    const big = ['reino', 'imperio', 'tirania', 'teocracia'].includes(f.gov);
    const all = G.Fac.pop(f.id);
    if (t < 2 || x < 0.25) return 'paco';
    if (x < 0.6) return t >= 3 || pop >= 45 ? 'palacio' : 'paco';
    if (x < 0.84 || !big || all < 40) return all >= 32 ? 'grande_palacio' : 'paco';
    return 'palacio_colossal';
  }
  function bestPalace(f) { let best = null; for (const b of G.S.buildings.values()) if (Co.RANK[b.type] && G.Village.facOfSet(b.set) === f.id && (!best || Co.RANK[b.type] > Co.RANK[best.type])) best = b; return best; }
  Co.bestPalace = bestPalace;
  const oldPlan = G.City.plan;
  G.City.plan = function (set, fac, c, want, pop) {
    oldPlan(set, fac, c, want, pop);
    // the city planner's plain palace is replaced by what the ruler wants
    for (let k = want.length - 1; k >= 0; k--) if (want[k] === 'palacio') want.splice(k, 1);
    const isCap = G.Fac.capitalOf(fac.id) === set; if (!isCap || fac.gov === 'tribo' || (set.tier || 0) < 2 || G.City.saving(set, fac)) return;
    for (const k in c.siteTypes) if (Co.RANK[k] || (G.BDEF[k] && G.BDEF[k].civic && k !== 'paco')) return;
    const st = fac.stock; const cur = bestPalace(fac); const want0 = desired(fac, set);
    const r = P.ruler(fac);
    if (cur && Co.RANK[cur.type] >= Co.RANK[want0]) return;
    // a new ruler gets settled first; a palace is only replaced by a far grander one
    if (cur && (!r || Co.vanity(r) < 0.62 || G.S.day - (fac.rulerSince || 0) < 2 || Co.RANK[want0] - Co.RANK[cur.type] < 1)) return;
    if ((want0 !== 'paco' && (set.tier || 0) < 3) || st.stone < (want0 === 'paco' ? 30 : 60) || pop < (want0 === 'paco' ? 20 : 26)) return;
    want.push(want0); fac._palaceWish = { type: want0, by: r ? r.id : 0, day: G.S.day };
  };
  // the vainest palaces go up outside the town, on open ground
  const oldSite = E.findSite;
  E.findSite = function (set, type) {
    if (type !== 'palacio_colossal' && type !== 'grande_palacio') return oldSite(set, type);
    const S = G.S; const def = G.BDEF[type]; const R = Math.round((set.radius || 8) + (type === 'palacio_colossal' ? 12 : 8));
    let best = null, bs = -1e9;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = Math.floor(set.cx) + dx - Math.floor(def.w / 2), y = Math.floor(set.cy) + dy - Math.floor(def.h / 2);
      if (x < 3 || y < 3 || x + def.w > N - 3 || y + def.h > N - 3) continue;
      const d = G.dist(x + def.w / 2, y + def.h / 2, set.cx, set.cy); if (d > R) continue;
      let ok = true, trees = 0;
      for (let ty = y - 1; ty <= y + def.h && ok; ty++) for (let tx = x - 1; tx <= x + def.w; tx++) {
        const i = ty * N + tx; const inside = tx >= x && ty >= y && tx < x + def.w && ty < y + def.h;
        if (S.occ[i]) { const o = S.buildings.get(S.occ[i]); if (inside || (o && o.blocks)) { ok = false; break; } }
        if (!inside) continue;
        const tt = S.type[i]; if (tt < T.SAND || tt === T.RIVER || S.objAt[i] || S.wall[i] || S.road[i] >= 2 || S.fire[i] > 0) { ok = false; break; }
        if (S.treeAt[i]) trees++;
      }
      if (!ok) continue;
      const sl = W.slope(x, y, def.w, def.h); if (sl > 1.3) continue;
      const ideal = (set.radius || 8) + (type === 'palacio_colossal' ? 5 : 2);
      const sc = -Math.abs(d - ideal) * 1.1 - trees * 0.4 - sl * 2 + G.R() * 0.6;
      if (sc > bs) { bs = sc; best = [x, y]; }
    }
    return best || oldSite(set, type);
  };
  const oldPlaced = E.onPlaced;
  E.onPlaced = function (b) {
    oldPlaced(b);
    if (!Co.RANK[b.type]) return;
    const f = G.Fac.get(G.Village.facOfSet(b.set)); const r = f && P.ruler(f); const set = G.S.settlements.get(b.set);
    if (r) { b.patron = r.name; b.patronId = r.id; }
    if (!f || !set) return;
    const [x, y] = G.Village.center(b);
    if (b.type === 'palacio_colossal') {
      log(`${r ? r.name : 'O governante'}, ${r && r.g === 'f' ? 'rainha' : 'rei'} de ${f.name}, não se contenta com pouco: mandou erguer, fora de ${set.name}, o maior palácio que o mundo já viu. Metade dos construtores vai carregar pedra para ele.`, 'crown', x, y);
      G.Stories && G.Stories.signal('palace', { who: r ? r.id : 0, fac: f.id, type: b.type, b: b.id, x, y });
    } else if (b.type === 'grande_palacio') G.Stories && G.Stories.signal('palace', { who: r ? r.id : 0, fac: f.id, type: b.type, b: b.id, x, y }), log(`${r ? r.name : 'O governante'} de ${f.name} quer um palácio à sua altura: começaram as obras ${G.gen(G.Village.buildName(b)) === 'a' ? 'da' : 'do'} ${G.Village.buildName(b)}, com alas e jardins.`, 'crown', x, y);
    else if (b.type === 'paco' && r && Co.vanity(r) < 0.18) log(`${r.name}, de ${f.name}, não quis palácio: mandou fazer uma casa só um pouco maior que as dos vizinhos.`, 'crown', x, y);
  };
  // builders: a great palace takes the town's hands
  Co.builders = function (set, fac, want, A) {
    let mx = 0;
    for (const b of G.S.buildings.values()) { if (b.built || b.set !== set.id) continue; if (b.type === 'palacio_colossal') mx = Math.max(mx, 0.5); else if (b.type === 'grande_palacio') mx = Math.max(mx, 0.3); }
    if (mx) want.construtor = Math.max(want.construtor, Math.floor(A * mx));
  };
  function buildingPalace(f) { for (const b of G.S.buildings.values()) if (!b.built && (b.type === 'palacio_colossal' || b.type === 'grande_palacio') && G.Village.facOfSet(b.set) === f.id) return b; return null; }
  Co.buildingPalace = buildingPalace;
  // and the treasury: taxes rise while the great work goes on, and the people mind
  const oldTax = E.taxRate;
  E.taxRate = function (f) { const r = oldTax(f); if (r <= 0) return r; const b = buildingPalace(f); return b ? Math.min(0.5, r + (b.type === 'palacio_colossal' ? 0.1 : 0.05)) : r; };
  const oldLoy = E.loyaltyMod;
  E.loyaltyMod = function (s, f) { let m = oldLoy(s, f); const b = buildingPalace(f); if (b) m -= b.type === 'palacio_colossal' ? 7 : 3; const done = bestPalace(f); if (done && done.built && done.type === 'palacio_colossal' && G.Fac.capitalOf(f.id) === s) m += 3; return m; };
  // finished
  const oldComplete = G.City.onComplete;
  G.City.onComplete = function (b, set) {
    if (!Co.RANK[b.type]) return oldComplete(b, set);
    const f = set && G.Fac.get(set.fac); if (!f) return true;
    const nm = G.Village.buildName(b); const [cx, cy] = G.Village.center(b);
    if (b.type === 'paco') log(`${f.name} tem agora ${G.gen(nm) === 'a' ? 'a sua' : 'o seu'} ${nm}, em ${set.name}.`, 'crown', cx, cy);
    else if (b.type === 'grande_palacio') { log(`Ficou pronto ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}: alas, um pátio com fonte, jardins. ${f.name} recebe ali os enviados dos outros povos.`, 'crown', cx, cy); f.legit = Math.min(100, (f.legit || 50) + 16); G.Stories && G.Stories.signal('palaceDone', { fac: f.id, b: b.id, x: cx, y: cy }); }
    else {
      const yrs = Math.max(1, G.S.day - (b.born || G.S.day));
      log(`Depois de ${yrs} ${yrs > 1 ? 'anos' : 'ano'}, ficou pronto ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}: telhados de ouro, fontes, uma avenida de estátuas e jardins até onde a vista alcança. Não há no mundo coisa igual.`, 'wonder', cx, cy);
      G.UI && G.UI.toast(nm, `${f.name} ergueu o maior palácio do mundo.`, 'crown');
      G.Village.milestone('colossal' + f.id, 'O maior palácio do mundo', `${nm} · ${set.name}.`, 'crown');
      G.FX && G.FX.ring(cx, cy, 0.5, 10, 2.6, 'rgba(255,225,140,0.95)', 3, true);
      f.legit = Math.min(100, (f.legit || 50) + 28); f.prestige = (f.prestige || 0) + 30;
      for (const o of G.Fac.all()) if (o.id !== f.id && G.Fac.rel(o.id, f.id)) { const r = G.Fac.rel(o.id, f.id); r.op = Math.min(100, (r.op || 0) + 4); }
      G.Lore && G.Lore.note('wonder', { set: set.id, fac: f.id, name: nm });
      G.Stories && G.Stories.signal('palaceDone', { fac: f.id, b: b.id, x: cx, y: cy });
    }
    if (b.patronId) { const v = G.person(b.patronId); if (v) v.palace = b.id; }
    G.Lore && G.Lore.note('build', { set: set.id, fac: f.id, type: b.type, name: nm });
    return true;
  };
  // while the great work goes on, the chronicle hears the grumbling
  function palaceNews() {
    const S = G.S;
    for (const f of G.Fac.all()) {
      const b = buildingPalace(f); if (!b || b.type !== 'palacio_colossal') continue;
      if (S.day - (b._news || b.born || 0) < 3) continue; b._news = S.day;
      const set = S.settlements.get(b.set); const p = Math.round(b.progress * 100); const [x, y] = G.Village.center(b);
      const hungry = f.stock.food < G.Fac.pop(f.id) * 2;
      const lines = [
        `${p}% do palácio de ${b.patron || f.name} está de pé. Em ${set ? set.name : f.name}, ${hungry ? 'os celeiros esvaziam: quem devia colher está carregando pedra' : 'os outros trabalhos esperam: as pedreiras não param'}.`,
        `Os construtores de ${f.name} voltam à noite com as costas em pedaço. O palácio de ${b.patron || 'seu governante'} vai em ${p}%.`,
        `Nas tavernas de ${set ? set.name : f.name} se resmunga: impostos mais altos, e tudo para o palácio de ${b.patron || 'quem manda'} (${p}%).`,
      ];
      log(G.pick(lines), 'crown', x, y);
    }
  }

  // ------------------------------ tribute before coin ------------------------------
  const TRIB = { chefia: 0.15, reino: 0.2, imperio: 0.25, teocracia: 0.2, tirania: 0.35, conselho: 0.1, livre: 0.05, parlamento: 0.16, feudal: 0.24, republica: 0.12, democracia: 0.1, oligarquia: 0.08, ditadura: 0.28, comuna: 0, anarquia: 0 };
  Co.tributeRate = f => (f && !E.coinage(f.id) ? (TRIB[f.gov] || 0) + (buildingPalace(f) ? 0.08 : 0) : 0);
  const oldEPlan = E.plan;
  E.plan = function (set, fac, c, want, pop) {
    oldEPlan(set, fac, c, want, pop);
    const t = set.tier || 0; const n = k => (c[k] || 0); const site = k => !!c.siteTypes[k];
    // the tavern opens as soon as there is a village to drink in
    if (t >= 3 && pop >= 18 && !n('taverna') && !site('taverna')) want.push('taverna');
    // a chief takes tribute long before there is coin
    if (t >= 2 && pop >= 24 && !G.City.saving(set, fac, 60) && !E.coinage(fac.id) && Co.tributeRate(fac) > 0 && !n('coletoria') && !site('coletoria')) want.push('coletoria');
  };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    const S = G.S;
    if (v.role === 'cobrador') {
      const f = G.Fac.ofV(v); const b = v.job && S.buildings.get(v.job);
      if (f && b && b.built && !E.coinage(f.id)) return tributeTask(v, b, f, H);
    }
    if (v.role === 'taverneiro') {
      const f = G.Fac.ofV(v); const b = v.job && S.buildings.get(v.job);
      if (f && b && b.built) { const I = b.inv || (b.inv = {}); const drink = f.civ === 'nordico' && (f.stock.mel || 0) >= 2 ? 'mel' : 'vinho'; if ((I[drink] || 0) < 3 && (f.stock[drink] || 0) >= 2 && G.R() < 0.5) return H.setTask(v, { type: 'restock', id: b.id, k: drink, pri: 1 }); }
    }
    return oldJob(v, H);
  };
  function tributeTask(v, b, f, H) {
    const S = G.S; const rate = Co.tributeRate(f);
    if (rate <= 0) return H.setTask(v, { type: 'desk', id: b.id, pri: 1, dur: 12 });
    const homes = [];
    for (const h of S.buildings.values()) if (h.set === v.set && h.built && G.BDEF[h.type].housing && !(h.taxT > S.clock)) homes.push(h);
    if (!homes.length) return H.setTask(v, { type: 'desk', id: b.id, pri: 1, dur: 12 });
    homes.sort((a, c) => G.dist2(a.x, a.y, b.x, b.y) - G.dist2(c.x, c.y, b.x, b.y));
    const route = homes.slice(0, 5).map(h => h.id);
    for (const id of route) S.buildings.get(id).taxT = S.clock + DAY() * 0.6;
    return H.setTask(v, { type: 'tribute', id: b.id, route, k: 0, bag: 0, goods: {}, pri: 1.05 });
  }
  function runTribute(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.id); if (!b || !b.built) return H.end(v);
    const f = G.Fac.ofV(v); if (!f) return H.end(v);
    if (t.k < t.route.length) {
      const h = S.buildings.get(t.route[t.k]);
      if (!h || !h.built) { t.k++; t.st = 0; t.gob = 0; return; }
      if (!t.st) { if (!t.gob) { t.gob = 1; if (!G.Vg.gotoB(v, h, 0.25)) { t.k++; t.gob = 0; return; } } if (H.move(v, dt)) { t.gob = 0; t.st = 1; v.actT = 0; } return; }
      v.act = 'knock'; const [cx, cy] = G.Village.center(h); G.faceTo(v, cx - v.x, cy - v.y);
      if (v.actT < 1.8) return;
      const rate = Co.tributeRate(f);
      const n = Math.floor((h.pantry || 0) * rate * 10) / 10; if (n > 0) { h.pantry -= n; t.bag += n; }
      // a share of what the house made or bought, too
      const I = h.inv || {}; const k = Object.keys(I).find(q => q !== 'food' && (I[q] || 0) >= 2 && G.R() < rate * 2);
      if (k) { I[k] -= 1; t.goods[k] = (t.goods[k] || 0) + 1; }
      if (rate > 0.22) { for (const o of S.villagers.values()) if (o.home === h.id && !o.inside && G.dist2(o.x, o.y, v.x, v.y) < 9 && G.R() < 0.5) G.Vg.emote(o, 'angry', 2); }
      else if (n > 0 && G.R() < 0.3) G.Vg.emote(v, 'chat', 1);
      t.k++; t.st = 0; return;
    }
    // with the sacks to the chief's house (or the common store)
    if (!t.dest) { const pal = bestPalace(f); const d = pal && pal.built && G.dist(pal.x, pal.y, v.x, v.y) < 30 ? pal : G.Village.nearestDropoff(v.x, v.y, v.set); t.dest = d ? d.id : -1; }
    const dest = S.buildings.get(t.dest);
    if (!dest) { v.carry = null; return H.end(v); }
    if (!t.carried) { t.carried = 1; const tot = t.bag + Object.values(t.goods).reduce((s, x) => s + x, 0); if (tot > 0) v.carry = { k: t.bag >= 1 ? 'food' : Object.keys(t.goods)[0] || 'food', n: Math.max(1, Math.round(tot)), tribute: 1 }; }
    if (!t.gob) { t.gob = 1; if (!G.Vg.gotoB(v, dest, 0.25)) { v.carry = null; return H.end(v); } }
    if (!H.move(v, dt)) return;
    if (Co.RANK[dest.type]) { const I = dest.inv || (dest.inv = {}); I.food = (I.food || 0) + t.bag; for (const k in t.goods) I[k] = (I[k] || 0) + t.goods[k]; }
    else { G.Village.addStock('food', t.bag, f.id); for (const k in t.goods) G.Village.addStock(k, t.goods[k], f.id); }
    f.eco.tax = (f.eco.tax || 0) + t.bag;
    if (t.bag + Object.keys(t.goods).length > 0) G.FX && G.FX.deposit(v.x, v.y, 'food', Math.round(t.bag * 10) / 10 || 1);
    if (!f._tribute && (t.bag > 0 || Object.keys(t.goods).length)) { f._tribute = S.day; log(`Os primeiros coletores de tributo de ${f.name} bateram de porta em porta e levaram sacos de grão e um pouco de tudo para ${Co.RANK[dest.type] ? G.Village.buildName(dest) : 'o armazém do chefe'}.`, 'trade', dest.x, dest.y); }
    v.carry = null; H.end(v);
  }
  // the court lives off what is brought in
  function courtTick(dt) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if (!Co.RANK[b.type] || !b.built || !b.inv) continue;
      const f = G.Fac.get(G.Village.facOfSet(b.set)); if (!f) continue;
      const I = b.inv; const eat = dt / DAY() * (2 + Co.RANK[b.type] * 2);
      I.food = Math.max(0, (I.food || 0) - eat);
      // what the court does not eat goes to the stores
      if ((I.food || 0) > 30) { const n = I.food - 20; I.food = 20; G.Village.addStock('food', n, f.id); }
      for (const k in I) if (k !== 'food' && I[k] >= 4) { G.Village.addStock(k, I[k] - 2, f.id); I[k] = 2; }
    }
  }

  // ------------------------------ the tavern at night ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'tribute') return runTribute(v, t, dt, H), true;
    const r = oldRun(v, t, dt, H);
    if (t.type === 'tavern' && v.task === t && t.st === 1) tavernLife(v, t, dt);
    return r;
  };
  const brawls = new Map();
  function tavernLife(v, t, dt) {
    const S = G.S; const b = S.buildings.get(t.id); if (!b) return;
    const I = b.inv || (b.inv = {});
    // the wine (or the mead) once paid for
    if (t.paid && !t.wine) {
      t.wine = 1; const drink = (I.vinho || 0) >= 0.5 ? 'vinho' : (I.mel || 0) >= 0.5 ? 'mel' : null;
      const heavy = (v.traits || []).includes('Glutão') || (v.traits || []).includes('Sociável');
      if (drink) { I[drink] -= 0.5; if (G.R() < (heavy ? 0.7 : 0.35)) v.drunk = S.clock + G.rr(40, 90); }
    }
    const night = G.isNight() || G.isEvening();
    // music: one plays when the room is full
    if (night && !b._music || (b._music && !S.villagers.has(b._music))) {
      let n = 0; let cand = null; for (const o of S.villagers.values()) if (o.task && o.task.type === 'tavern' && o.task.id === b.id && o.task.st === 1) { n++; if (!cand && ((o.traits || []).includes('Sociável') || o.id % 4 === 0)) cand = o; }
      if (n >= 3 && cand) b._music = cand.id;
    }
    if (b._music === v.id) {
      v.act = 'play'; G.faceTo(v, 1, 1);
      if (G.R() < dt * 0.8 && G.FX && G.FX.floater) G.FX.floater(v.x + G.rr(-0.2, 0.3), v.y - 0.1, G.pick(['♪', '♫']), '#ffe9a8', 1.6);
      if (!night || v.actT > 15) b._music = 0;
      return;
    }
    // a fight breaks out between two who drank too much
    const br = brawls.get(v.id);
    if (br) {
      const o = S.villagers.get(br.with);
      if (!o || br.t < S.clock) { brawls.delete(v.id); return; }
      v.act = 'fight'; G.faceTo(v, o.x - v.x, o.y - v.y);
      if (G.R() < dt * 1.5) { if (o.hp > 25) G.Vg.damage(o, 2, 'brawl'); o.stagT = S.clock + 0.3; G.Audio && G.Audio.at(v.x, v.y, 'hit'); }
      return;
    }
    if (v.drunk > S.clock && night && G.R() < dt * 0.006 && v.age >= 18) {
      let o = null; for (const q of S.villagers.values()) if (q !== v && q.drunk > S.clock && q.task && q.task.type === 'tavern' && q.task.id === b.id && !brawls.has(q.id)) { o = q; break; }
      if (o) {
        const until = S.clock + G.rr(4, 7);
        brawls.set(v.id, { with: o.id, t: until }); brawls.set(o.id, { with: v.id, t: until });
        G.Vg.emote(v, 'angry', 3); G.Vg.emote(o, 'angry', 3);
        const set = S.settlements.get(b.set);
        if (G.R() < 0.35 || !(set && set._brawl)) { if (set) set._brawl = S.day; log(G.pick([`Briga na taverna de ${set ? set.name : ''}: ${v.name} e ${o.name} beberam demais e saíram no braço.`, `${v.name} acusou ${o.name} de roubar no jogo de dados. A taverna de ${set ? set.name : ''} virou ringue.`, `Uma jarra voou na taverna de ${set ? set.name : ''}: ${v.name} e ${o.name}, bêbados, foram separados à força.`]), 'war', b.x, b.y); }
      }
    }
  }
  // the drunk weave home
  Co.sway = v => (v.drunk > G.S.clock ? Math.sin(G.S.clock * 2.3 + v.id) * 0.22 : 0);
  // a warm light and a sign at the tavern door at night
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const lampEnt = new WeakMap();
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S || zoom < 0.8 || !(G.isNight() || G.isEvening())) return;
    for (const b of S.buildings.values()) { if (b.type !== 'taverna' || !b.built) continue; let e = lampEnt.get(b); if (!e) lampEnt.set(b, e = { b, fn: drawLamp }); const [dx, dy] = G.Vg.door(b); add(dx + dy + 0.2, e, dx + 0.35, dy); }
  });
  function drawLamp(c, e, sx, sy, t, nightF) {
    const f = 0.7 + Math.sin(t * 7 + e.b.id) * 0.15 + Math.sin(t * 13) * 0.08;
    c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(sx, sy - 13); c.lineTo(sx, sy - 9.5); c.stroke();
    c.fillStyle = `rgba(255,200,110,${0.25 * f * (nightF || 1)})`; c.beginPath(); c.arc(sx, sy - 8.6, 6, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,220,140,${0.9 * f})`; c.fillRect(sx - 0.9, sy - 9.6, 1.8, 2);
  }

  // ------------------------------ update and save ------------------------------
  let tC = 0, tN = 0;
  Co.update = function (dt) {
    const S = G.S; if (!S) return;
    tC += dt; tN += dt;
    if (tC >= 3) { courtTick(tC); tC = 0; }
    if (tN >= 10) { tN = 0; palaceNews(); for (const f of G.Fac.all()) { const r = P.ruler(f); if (r && f._rulerId !== r.id) { f._rulerId = r.id; f.rulerSince = S.day; } } }
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'tribute') return t.k < t.route.length ? 'Cobrando o tributo de porta em porta' : 'Levando o tributo ao chefe';
    if (t.type === 'tavern') { if (G.S.buildings.get(t.id) && G.S.buildings.get(t.id)._music === v.id) return 'Tocando música na taverna'; if (brawls.has(v.id)) return 'Brigando na taverna'; if (v.drunk > G.S.clock) return 'Bebendo além da conta na taverna'; }
    return oldText(v, t);
  };
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    if (Co.RANK[b.type]) {
      const v = b.patronId && G.person(b.patronId);
      if (b.patron) h += `<div class="doing">Mandado construir por ${v ? plink(v.id) : esc(b.patron)}${v && !G.S.villagers.has(v.id) ? ' (já morto)' : ''}.${!b.built ? ` Obra em <b>${Math.round(b.progress * 100)}%</b>.` : ''}</div>`;
      if (b.inv && b.inv.food >= 1) h += `<div class="doing">A corte tem ${Math.floor(b.inv.food)} de comida do tributo.</div>`;
    }
    if (b.type === 'taverna' && b.inv) h += `<div class="doing">${b.inv.vinho >= 1 ? `${Math.floor(b.inv.vinho)} ânforas de vinho` : b.inv.mel >= 1 ? `${Math.floor(b.inv.mel)} potes de hidromel` : 'Só tem comida e água por enquanto.'}</div>`;
    return h;
  };
  // (rulerSince and the palace wish live on the faction, saved with it)
})(window.G);

// ------------------------------ the palaces, drawn ------------------------------
(function (G) {
  if (!G.Arch || !G.Arch.EXT) return;
  const K = G.Arch.kit(); const TAU = Math.PI * 2;
  const { P, poly, ln, walls, top, box, onL, shade, roof, colonnade, flag, palm, statue, dome, basin, band, plinth, winsL, winsR, longhouse, stepPyr } = K;
  const GOLD = ['#f2c14e', '#d8a63a', '#b8862a'];
  const at = (c, dx, dy, fn) => { const q = P(dx, dy, 0); c.save(); c.translate(q[0], q[1]); fn(); c.restore(); };
  // a wing of the palace: floors of windows, a cornice, the roof of the culture
  function block(c, m, p, st, x0, y0, x1, y1, z0, H, floors, o) {
    o = o || {};
    walls(c, x0, y0, x1, y1, z0, H, p.wl, p.wr, st === 'egipcio' ? 0.03 : 0);
    const fh = (H - z0) / floors;
    for (let f = 0; f < floors; f++) { const z = z0 + fh * f + fh * 0.3; const h = Math.min(3.4, fh * 0.48); winsL(c, m, p, y1, x0, x1, z, h, Math.max(1, Math.round((x1 - x0) * 2.4))); winsR(c, m, p, x1, y0, y1, z, h, Math.max(1, Math.round((y1 - y0) * 2.4))); }
    band(c, x0, y0, x1, y1, H - 1.3, H - 0.4, o.trim || p.trim);
    if (o.door) onL(c, y1, o.door - 0.12, o.door + 0.12, z0, z0 + Math.min(9, fh * 0.8), o.gold ? '#b8862a' : p.door);
    if (st === 'egipcio' || st === 'asteca') return roof(c, m, p, x0, y0, x1, y1, H, { kind: 'flat', par: 1.4 });
    if (st === 'nordico') return roof(c, m, p, x0, y0, x1, y1, H, { kind: 'turf', rh: o.rh });
    return roof(c, m, p, x0, y0, x1, y1, H, { kind: st === 'grego' ? 'gable' : 'hip', rh: o.rh, colors: o.gold ? GOLD : undefined });
  }
  const hedge = (c, x0, y0, x1, y1) => box(c, x0, y0, x1, y1, 0.3, 2.4, '#3f6a2a', '#2f5a22', '#4f7a34');
  function cypress(c, x, y, h) { const q = P(x, y, 0); c.fillStyle = '#2f5a2a'; c.beginPath(); c.ellipse(q[0], q[1] - h * 0.5, 1.7, h * 0.55, 0, 0, TAU); c.fill(); c.fillStyle = '#3f6a32'; c.beginPath(); c.ellipse(q[0] - 0.5, q[1] - h * 0.58, 0.8, h * 0.42, 0, 0, TAU); c.fill(); }
  function fountain(c, x, y, r, big) {
    basin(c, x, y, r, 0.6, '#5aaed0'); const q = P(x, y, 0.6);
    c.fillStyle = '#e0d8c8'; c.fillRect(q[0] - 0.9, q[1] - 6, 1.8, 6); if (big) { c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(q[0], q[1] - 7, 1.4, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(225,242,255,0.9)'; c.lineWidth = 0.6;
    for (const s of [-1, -0.5, 0.5, 1]) { c.beginPath(); c.moveTo(q[0], q[1] - 6.5); c.quadraticCurveTo(q[0] + s * 3.4 * r * 3, q[1] - 11, q[0] + s * 5.6 * r * 3, q[1] - 0.5); c.stroke(); }
    c.beginPath(); c.moveTo(q[0], q[1] - 6.5); c.lineTo(q[0], q[1] - (big ? 15 : 11)); c.stroke();
  }
  function fence(c, x0, x1, y, gold, gap) {
    const col = gold ? '#d8a63a' : '#4a4a50';
    const seg = (a, b) => { const n = Math.max(2, Math.round((b - a) * 6)); for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; ln(c, P(x, y, 0), P(x, y, 4.2), col, 0.55); } ln(c, P(a, y, 4.2), P(b, y, 4.2), gold ? '#f2c14e' : col, 0.8); ln(c, P(a, y, 1.6), P(b, y, 1.6), col, 0.5); };
    if (gap) { seg(x0, -gap); seg(gap, x1); for (const x of [-gap, gap]) { box(c, x - 0.08, y - 0.08, x + 0.08, y + 0.08, 0, 8, '#e0d8c8', '#c0b8a8', '#ece4d4'); if (gold) { const q = P(x, y, 8); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(q[0], q[1] - 0.8, 1, 0, TAU); c.fill(); } } }
    else seg(x0, x1);
  }
  function flowers(c, x0, y0, x1, y1, n, seed) { for (let k = 0; k < n; k++) { const x = x0 + G.hash(seed + k) * (x1 - x0), y = y0 + G.hash(seed * 3 + k) * (y1 - y0); const q = P(x, y, 0.4); c.fillStyle = ['#e84a6a', '#f2c14e', '#ffffff', '#b06ae8', '#ff8a3a'][k % 5]; c.fillRect(q[0] - 0.6, q[1] - 0.8, 1.2, 1.2); } }
  function obelisk(c, x, y, h) { const q = P(x, y, 0); c.fillStyle = '#d8c494'; c.beginPath(); c.moveTo(q[0] - 1.6, q[1]); c.lineTo(q[0] + 1.6, q[1]); c.lineTo(q[0] + 1, q[1] - h); c.lineTo(q[0], q[1] - h - 2.2); c.lineTo(q[0] - 1, q[1] - h); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + 1.6, q[1]); c.lineTo(q[0] + 1, q[1] - h); c.lineTo(q[0], q[1] - h - 2.2); c.fill(); c.fillStyle = '#f2c14e'; c.beginPath(); c.moveTo(q[0] - 1, q[1] - h); c.lineTo(q[0], q[1] - h - 2.2); c.lineTo(q[0] + 1, q[1] - h); c.fill(); }
  function pylon(c, p, x0, x1, y0, y1, H) {
    const b = 0.06; walls(c, x0, y0, x1, y1, 0, H, p.wl, p.wr, b);
    top(c, x0 + b, y0 + b, x1 - b, y1 - b, H, p.top); band(c, x0 + b, y0 + b, x1 - b, y1 - b, H - 2, H - 0.8, p.trim); band(c, x0 + b, y0 + b, x1 - b, y1 - b, H - 3.2, H - 2.2, p.trim2 || p.acc);
    c.fillStyle = 'rgba(60,40,20,0.25)'; const q = P((x0 + x1) / 2, y1, H * 0.55); c.fillRect(q[0] - 2, q[1] - 3, 4, 6);
  }

  // ---------------- the chief's house ----------------
  G.Arch.EXT.paco = {
    maxz: 54, draw(c, m, p, st) {
      if (st === 'nordico') { longhouse(c, m, p, 0.85, 0.55, 11, 15, true); m.fires.length = 0; at(c, 0.7, 0.75, () => flag(c, 0, 0, '#a23c2a', 24)); return 30; }
      if (st === 'asteca') {
        box(c, -0.95, -0.95, 0.95, 0.95, 0, 4, p.base[0], p.base[1], p.base[2]);
        poly(c, [P(-0.25, 1.1, 0), P(0.25, 1.1, 0), P(0.25, 0.95, 4), P(-0.25, 0.95, 4)], shade(p.base[2], 1.05));
        const z = block(c, m, p, st, -0.75, -0.75, 0.6, 0.45, 4, 14, 1, { door: 0 });
        for (const x of [-0.5, 0, 0.5]) { const q = P(x, 0.45, z); c.fillStyle = p.acc; c.fillRect(q[0] - 0.6, q[1] - 3, 1.2, 3); }
        at(c, 0.8, 0.8, () => flag(c, 0, 0, p.acc2 || '#b33a2a', 22)); return 26;
      }
      if (st === 'egipcio') {
        block(c, m, p, st, -0.9, -0.9, 0.55, 0.2, 0, 13, 1, { door: -0.2 });
        pylon(c, p, -0.7, -0.35, 0.35, 0.65, 15); pylon(c, p, 0.05, 0.4, 0.35, 0.65, 15);
        at(c, 0.75, 0.75, () => palm(c, 0, 0, 1)); return 24;
      }
      plinth(c, p, -0.92, -0.92, 0.92, 0.6, 1.5);
      const z = block(c, m, p, st, -0.85, -0.85, 0.6, 0.35, 1.5, 17, 2, { door: -0.12, rh: 8 });
      colonnade(c, p, -0.55, 0.35, 0.3, 0.55, 1.5, 9, 4, 0.04, 'L');
      box(c, -0.6, 0.33, 0.35, 0.6, 9, 10.5, p.col[0], p.col[1], p.col[0]);
      at(c, 0.8, 0.75, () => flag(c, 0, 0, p.acc2 || '#c83a2a', 24));
      return z + 4;
    },
  };

  // ---------------- the great palace and the colossal one ----------------
  function palace(c, m, p, st, e, lvl) {
    const gold = lvl >= 2;
    const ground = st === 'egipcio' ? '#dccb9c' : st === 'asteca' ? '#d8cfb4' : st === 'nordico' ? '#86a84e' : '#86b05a';
    top(c, -e, -e, e, e, 0.2, ground);
    if (st === 'asteca') return aztec(c, m, p, e, lvl);
    if (st === 'nordico') return norse(c, m, p, e, lvl);
    if (st === 'egipcio') return egypt(c, m, p, e, lvl);
    // a classical palace: the main block, two wings round a court of honour, gardens and a gate
    const back = -e + 0.15, mid = gold ? -0.9 : -0.55, wingFront = gold ? 1.0 : 0.85, wx = gold ? 0.8 : 0.75;
    const H = gold ? 26 : 22, Hw = gold ? 21 : 17;
    // the court of honour, paved
    top(c, -e + wx, mid, e - wx, wingFront + 0.4, 0.35, st === 'romano' ? '#d8cbb0' : '#e4dccb');
    // gardens in front: parterres of hedges and flowers
    for (const s of [-1, 1]) { const x0 = s < 0 ? -e + 0.15 : 0.35, x1 = s < 0 ? -0.35 : e - 0.15; const y0 = wingFront + 0.5, y1 = e - 0.3; if (y1 - y0 > 0.25) { hedge(c, x0, y0, x1, y0 + 0.08); hedge(c, x0, y1 - 0.08, x1, y1); hedge(c, x0, y0, x0 + 0.08, y1); flowers(c, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, gold ? 26 : 12, s > 0 ? 7 : 3); } }
    // main block (the corps de logis), with a central pavilion
    block(c, m, p, st, -e + 0.15, back, e - 0.15, mid, 0, H, gold ? 3 : 2, { door: 0, gold, rh: gold ? 12 : 10 });
    const cz = H + (gold ? 6 : 4);
    block(c, m, p, st, -0.45, back + 0.1, 0.45, mid + 0.12, 0, cz, gold ? 3 : 2, { door: 0, gold, rh: gold ? 6 : 8 });
    if (gold || st === 'romano') { const d = P(0, (back + mid) / 2, cz + (gold ? 6 : 8)); const tip = dome(c, d[0], d[1], gold ? 13 : 10, gold ? 16 : 12, gold ? '#f2d070' : '#d8c8a8', gold ? '#c8962a' : '#a8987a', '#f2c14e'); m.glow.push(tip); }
    colonnade(c, p, -0.4, mid + 0.12, 0.4, mid + 0.3, 0, H - 4, 6, 0.05, 'L');
    // the wings reaching forward
    block(c, m, p, st, -e + 0.15, mid, -e + 0.15 + wx, wingFront, 0, Hw, 2, { gold, rh: 8 });
    // the fountain in the court, statues along it
    fountain(c, 0, (mid + wingFront) / 2 + 0.2, gold ? 0.38 : 0.28, gold);
    if (gold) for (const y of [mid + 0.5, wingFront - 0.1]) for (const x of [-0.6, 0.6]) statue(c, x, y, 0.4, '#e8e0d0', 10);
    block(c, m, p, st, e - 0.15 - wx, mid, e - 0.15, wingFront, 0, Hw, 2, { gold, rh: 8 });
    if (gold) { // end pavilions with domes
      for (const x of [-e + 0.15 + wx / 2, e - 0.15 - wx / 2]) { box(c, x - 0.38, wingFront - 0.45, x + 0.38, wingFront + 0.05, 0, Hw + 5, p.wl, p.wr, p.top || p.wl); const d = P(x, wingFront - 0.2, Hw + 5); dome(c, d[0], d[1], 6, 7, '#f2d070', '#c8962a', '#f2c14e'); }
    }
    // cypresses and the gilded gate
    for (const x of [-e + 0.3, e - 0.3]) cypress(c, x, e - 0.25, gold ? 16 : 12);
    fence(c, -e + 0.1, e - 0.1, e - 0.08, gold, 0.3);
    // banners on the roof
    for (const x of gold ? [-e + 0.4, 0, e - 0.4] : [0]) { const q = P(x, back + 0.2, H + (x === 0 ? (gold ? 34 : 14) : 4)); flag(c, q[0], q[1], p.acc2 || '#c83a2a', 10); }
    return cz + (gold ? 34 : 22);
  }
  function egypt(c, m, p, e, lvl) {
    const gold = lvl >= 2;
    // a pool with palms, the halls behind, colossi and obelisks at the great pylons
    top(c, -e + 0.6, -0.2, e - 0.6, 0.9, 0.35, '#e8dcb4');
    block(c, m, p, 'egipcio', -e + 0.15, -e + 0.15, e - 0.15, -0.3, 0, gold ? 24 : 19, 2, { door: 0 });
    colonnade(c, p, -e + 0.3, -0.3, e - 0.3, -0.1, 0, gold ? 20 : 16, gold ? 10 : 8, 0.07, 'L', true);
    top(c, -e + 0.25, -0.35, e - 0.25, -0.05, gold ? 20 : 16, p.top);
    basin(c, 0, 0.35, gold ? 0.5 : 0.36, 0.5, '#4aa0c8');
    for (const x of [-e + 0.45, e - 0.45]) for (const y of [0, 0.7]) at(c, x, y, () => palm(c, 0, 0, gold ? 1.2 : 1));
    for (const x of [-0.55, 0.55]) statue(c, x, 1.15, 0.4, gold ? '#e8c24a' : '#d8c494', gold ? 16 : 11);
    pylon(c, p, -e + 0.25, -0.35, 1.3, e - 0.15, gold ? 28 : 22); pylon(c, p, 0.35, e - 0.25, 1.3, e - 0.15, gold ? 28 : 22);
    for (const x of [-0.25, 0.25]) obelisk(c, x, e - 0.1, gold ? 26 : 18);
    for (const x of [-e + 0.4, e - 0.4]) { const q = P(x, e - 0.1, gold ? 28 : 22); flag(c, q[0], q[1], '#e8b83a', 12); }
    return gold ? 60 : 48;
  }
  function aztec(c, m, p, e, lvl) {
    const gold = lvl >= 2;
    // a great stepped platform with the halls on top and the gardens below
    flowers(c, -e + 0.1, -e + 0.1, e - 0.1, e - 0.1, gold ? 40 : 20, 11);
    stepPyr(c, p, e - 0.3, e - 0.75, gold ? 4 : 3, 3.2, p.base[0], p.base[1], p.base[2], 0.35);
    const z = (gold ? 4 : 3) * 3.2; const q = e - 0.85;
    c.save(); const off = P(0, 0, z); c.translate(0, off[1]);
    const zz = block(c, m, p, 'asteca', -q, -q, q, -0.05, 0, gold ? 16 : 13, 1, { door: 0 });
    block(c, m, p, 'asteca', -q, 0.15, -0.3, q, 0, gold ? 12 : 10, 1, {});
    block(c, m, p, 'asteca', 0.3, 0.15, q, q, 0, gold ? 12 : 10, 1, {});
    for (let k = -2; k <= 2; k++) { const r = P(k * 0.3, -0.05, zz); c.fillStyle = gold ? '#f2c14e' : p.acc; c.fillRect(r[0] - 0.7, r[1] - 3.6, 1.4, 3.6); c.fillStyle = '#2fae8f'; c.beginPath(); c.ellipse(r[0], r[1] - 5, 0.8, 2.2, k * 0.2, 0, TAU); c.fill(); }
    c.restore();
    for (const x of [-e + 0.25, e - 0.25]) at(c, x, e - 0.25, () => palm(c, 0, 0, 1.1));
    const fq = P(0.9, e - 0.15, 0); flag(c, fq[0], fq[1], '#2fae8f', z + 22);
    return z + (gold ? 30 : 24);
  }
  function norse(c, m, p, e, lvl) {
    const gold = lvl >= 2;
    // the king's hall, side halls, a carved gate in the palisade
    at(c, 0, -e * 0.42, () => longhouse(c, m, p, e * 0.78, e * 0.32, gold ? 14 : 12, gold ? 22 : 18, true));
    if (gold) { const a = P(-e * 0.78, -e * 0.42, 36), b = P(e * 0.78, -e * 0.42, 36); ln(c, a, b, '#f2c14e', 1.4); }
    at(c, -e * 0.55, e * 0.35, () => longhouse(c, m, p, e * 0.3, e * 0.22, 9, 12, false));
    at(c, e * 0.55, e * 0.35, () => longhouse(c, m, p, e * 0.3, e * 0.22, 9, 12, false));
    for (let k = 0; k <= Math.round(e * 8); k++) { const x = -e + 0.1 + (2 * e - 0.2) * k / Math.round(e * 8); if (Math.abs(x) < 0.3) continue; const q = P(x, e - 0.1, 0); c.fillStyle = '#6a4a2c'; c.fillRect(q[0] - 0.8, q[1] - 7, 1.6, 7); c.beginPath(); c.moveTo(q[0] - 0.8, q[1] - 7); c.lineTo(q[0], q[1] - 8.6); c.lineTo(q[0] + 0.8, q[1] - 7); c.fill(); }
    for (const x of [-0.3, 0.3]) { const q = P(x, e - 0.1, 0); c.fillStyle = '#5a3a22'; c.fillRect(q[0] - 1, q[1] - 12, 2, 12); c.strokeStyle = gold ? '#f2c14e' : '#3a2616'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(q[0], q[1] - 12); c.quadraticCurveTo(q[0] + (x > 0 ? 2 : -2), q[1] - 15, q[0] + (x > 0 ? 3.4 : -3.4), q[1] - 14); c.stroke(); }
    const fq = P(0, -e * 0.42, 0); flag(c, fq[0], fq[1] - (gold ? 36 : 30), '#a23c2a', 10);
    m.fires.length = 0; // (no fire glowing on the roofs by day)
    return gold ? 56 : 46;
  }
  G.Arch.EXT.grande_palacio = { maxz: 78, draw(c, m, p, st) { return palace(c, m, p, st, 1.95, 1); } };
  G.Arch.EXT.palacio_colossal = { maxz: 104, draw(c, m, p, st) { return palace(c, m, p, st, 2.45, 2); } };
})(window.G);
