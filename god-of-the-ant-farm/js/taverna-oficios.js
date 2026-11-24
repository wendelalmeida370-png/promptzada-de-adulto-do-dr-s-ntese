'use strict';
// ============================================================
//  A cadeia da taverna (G.TavernaOficios; a quarta onda, T3 —
//  D-840 a D-849). A casa que cresce contrata: pela procura das
//  noites e pelo tamanho dela, a taverna pede um cozinheiro e um
//  cervejeiro, e quem vem é gente da cidade, pelo repartidor de
//  ofícios (E.demand / E.place; a memória do ofício, a mão mais
//  nova — nunca o v.role à mão). Quem trabalha nela recebe o soldo
//  do dia do bolso do taverneiro, pelo livro. O cervejeiro compra o
//  grão (ou o mel) no armazém do povo, que um carregador à porta —
//  de preferência quem o produziu — leva à tulha da casa, e faz a
//  cerveja na cuba: o grão de molho, o malte, a mosturação na água
//  quente (com a lenha da casa), dois dias de fermentação, os
//  jarros; o hidromel do mel onde o povo é do hidromel. A cerveja
//  melhora com os dias de ofício dele, e os fregueses sentem. O
//  cozinheiro compra o que a receita do povo pede e cozinha a
//  panelada no fogo da taverna; os pratos vão à prateleira, que é o
//  que o cardápio lê. Nada vem do nada: a cerveja só do cereal que
//  entrou, o prato só da comida que se comprou, cada coisa pelo
//  livro (G.Depot), com a sua origem (G.Origem). O vinho é do
//  vinhateiro (o vinhedo pisa as uvas, estates.js); o pulque, do
//  maguey que o mundo ainda não tem (ORIGEM.md §6 C).
//  As portas: G.TavernaOficios.staff(b) → { cozinheiro, cervejeiro }
//  (quem trabalha na casa); TO.casa(b, k) → { n, q } (a bebida da
//  casa na prateleira e a mão dela); TO.boa(b) (a cerveja das
//  melhores da cidade); TO.desc(b, k, t) (a linha da carta).
//  Só este arquivo escreve b.tvo, b.despensa, b.tulha, b.adega e
//  b.prato (o guard.js cobra, regra 371).
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco, T = G.Taverna, O = G.Oficio; if (!A || !D || !E || !T || !O) return;
  const TO = G.TavernaOficios = {};
  const EPS = 1e-6;
  const r1 = x => Math.round(x * 10) / 10;
  const r2 = x => Math.round(x * 100) / 100;
  const r4 = x => Math.round(x * 1e4) / 1e4;
  const live = A.live;
  const S_ = () => G.S;
  const AN = A.ANIM;
  const OR = () => G.Origem;

  // ------------------------------ the numbers (D-841 to D-845) ------------------------------
  TO.ROLES = ['cozinheiro', 'cervejeiro'];
  const MINE = { cozinheiro: 1, cervejeiro: 1 };
  TO.SZ = { taberna: 0, taverna: 1, hospedaria: 2 }; // (the step of the house: G.Escala)
  TO.K = 1 / 3;        // (the weight of last night in the house's memory of its nights: about three nights)
  TO.NIGHTS = 3;       // (nights the memory needs before it takes anyone: the busy nights in a row)
  TO.RONDA = 32;       // (seconds of the world a guest at the table takes over a round and the talk after it, T.CUP and T.TALK: the round the
                       //  dry guest-time of a night would have asked)
  TO.COOK_HI = 7;      // (meals a night, by the memory, at which a taberna takes a cook — a taverna at 5, a hospedaria at 3: the keeper alone
                       //  buys and serves about six a night, act-taverna.js — the busiest tabernas of the ready metrópole sell five or six,
                       //  and keep him alone)
  TO.BREW_HI = 7;      // (rounds a night of the house's own drink at which it takes a brewer — 5, 3: the keeper's small vat gives eight a batch)
  TO.STEP = 2;         // (what each step of the house takes off those marks)
  TO.LO = 0.55;        // (of the mark: below it, the one taken is let go)
  TO.SEM = 0.35;       // (the least share of the night the shelf had the plate — or the drink — counted: what was sold, over the time there was some)
  TO.FECHADA = 4;      // (days in a row the house did not open — a feast, the keeper ill, nothing to serve —: it lets its people go)
  TO.SOLDO = 0.5;      // (a day's wage of the cook and of the brewer, from the keeper's coins — the sailor's is 0,6 a voyage)
  TO.RESERVA = 3;      // (days of the wages the keeper must have to take one more)
  TO.DEVE = 2;         // (days of wages owed: the house lets its people go)
  TO.PAUSA = 3;        // (and takes nobody again for these days)
  TO.FRETE = 0.06;     // (the porter's fee for a load to the tavern's door)
  TO.PORTE = 5;        // (tiles from the store's door a porter is found in)
  TO.DESP = 24;        // (the room of the kitchen's pantry, and of the brewer's store: TO.TULHA)
  TO.TULHA = 24;
  TO.BREW_N = 6;       // (the grain of a batch of beer: six jars; the honey of a batch of mead: TO.MEAD_N)
  TO.MEAD_N = 3;
  TO.MALTE = 60;       // (seconds of the world the grain sprouts and dries: the malt)
  TO.FERM = 400;       // (seconds the wort ferments in the vat: two days)
  TO.FERM_MEL = 500;   // (the mead: two days and a half)
  TO.LENHA_MOSTO = 0.25; // (wood a unit of the mash takes: the hot water)
  TO.LENHA_N = 2;      // (wood the brewer and the cook keep: what they buy at a time)
  TO.POT = 4;          // (portions of a pot)
  TO.FERVE = 25;       // (seconds the pot simmers on the fire)
  TO.LENHA_POT = 0.15; // (wood a portion takes on the fire)
  TO.EXP = 15;         // (days of the trade over which the brewer's hand comes to its best)
  TO.BOA = 0.7;        // (the hand said «das melhores da cidade», when no other house of the town brews better)
  TO.PULL = 0.12;      // (what a house of good beer on its shelf adds to the night's wish of who could go there)
  TO.AZEDA = 0.2;      // (the share of the jars that sour, at the worst hand; none at the best)
  TO.FOME = 16;        // (the people's food under which the house buys none: as the keeper, act-taverna.js)

  // ------------------------------ the trades, by the repartidor ------------------------------
  Object.assign(G.ROLE, { cozinheiro: ['Cozinheiro', 'Cozinheira'], cervejeiro: ['Cervejeiro', 'Cervejeira'] });
  for (const r of TO.ROLES) if (!E.JOB_ROLES.includes(r)) E.JOB_ROLES.push(r);
  // (under the ceiling of the trades — E.share: last of the first hands, by the rank of a trade not in its list — and first to go in
  // the cut of the minimum rest: the cook and the brewer of a house before its keeper)
  for (const r of TO.ROLES.slice().reverse()) if (E.CUT && !E.CUT.includes(r)) E.CUT.unshift(r);
  if (G.Art && G.Art.CLOTH) Object.assign(G.Art.CLOTH, { cozinheiro: '#d8d0bc', cervejeiro: '#8a6a3a' });
  const taverns = setId => E.byType(setId, 'taverna');
  const memo = b => b.tvo || (b.tvo = { n: 0, ref: 0, rb: 0, sc: 0, sb: 0, ck: 0, cv: 0, dev: 0, pausa: 0, fecha: 0, hoje: { g: 0, sc: 0, sb: 0, cp: 0, fr: 0 } });
  // what a tavern asks of each trade now: the house's decision of the day (b.tvo, below) — pure
  TO.want = function (b) { const o = b && b.type === 'taverna' && b.built ? b.tvo : null; return { cozinheiro: o && o.ck ? 1 : 0, cervejeiro: o && o.cv ? 1 : 0 }; };
  const demand0 = E.demand;
  E.demand = function (set, fac, Ad) {
    const out = demand0(set, fac, Ad);
    for (const b of taverns(set.id)) { const w = TO.want(b); for (const r of TO.ROLES) if (w[r]) out[r] = (out[r] || 0) + w[r]; }
    return out;
  };
  // (and kept as the open services are, D-102: with the people's food safe, the hands a busy house asks are not cut from it by the
  // ceiling of the trades nor by the minimum rest — a kitchen the nights need is part of the service the town has open; with the food at
  // risk, the cook and the brewer go first)
  const service0 = E.kept;
  if (service0) E.kept = function (set, fac, ask) {
    let k = service0.apply(this, arguments);
    if (!(G.Village.foodSafe && G.Village.foodSafe(fac.id))) return k;
    for (const r of TO.ROLES) if (ask && ask[r] > 0) (k || (k = {}))[r] = ask[r];
    return k;
  };
  // the posts (the dealing of the day, E.place): a worker of the house keeps the tavern he works in while it asks for him, else
  // the nearest that asks — as the workplaces of one role each. The old dealing knows one role a building: it let these go, and
  // they are given back here, in the same call
  const place0 = E.place;
  E.place = function (set) {
    const S = S_(); const mine = [];
    for (const v of S.villagers.values()) if (v.set === set.id && MINE[v.role] && !v.captive) mine.push([v, v.job]);
    place0(set);
    const slots = [];
    for (const b of taverns(set.id)) { const w = TO.want(b); for (const r of TO.ROLES) if (w[r]) slots.push({ b, role: r, left: w[r] }); }
    const ok = new Set(); const ws = [];
    for (const [v, j] of mine) {
      if (G.Naval && G.Naval.away(v)) { v.job = 0; continue; } // (away on a voyage: the post is not held from the sea — L-683)
      const s = j ? slots.find(q => q.b.id === j && q.role === v.role && q.left > 0) : null;
      if (s) { s.left--; v.job = j; ok.add(v.id); } else v.job = 0;
      ws.push(v);
    }
    for (const v of ws) {
      if (ok.has(v.id)) continue;
      let best = null, bd = Infinity; for (const s of slots) { if (s.left <= 0 || s.role !== v.role) continue; const d = G.dist2(v.x, v.y, s.b.x, s.b.y); if (d < bd) { bd = d; best = s; } }
      if (best) { v.job = best.b.id; best.left--; }
    }
    stIdx = null;
  };
  // who works in a house now: { cozinheiro, cervejeiro } — the people, or null (counted once a clock of the world; only read)
  let stIdx = null, stS = null, stT = -1;
  G.worldHooks.push(() => { stIdx = null; stS = null; stT = -1; });
  function staffIdx() {
    const S = S_(); if (stIdx && stS === S && stT === S.clock) return stIdx;
    stIdx = new Map(); stS = S; stT = S.clock;
    for (const v of S.villagers.values()) {
      if (!MINE[v.role] || !v.job || v.captive) continue; const b = S.buildings.get(v.job); if (!b || b.type !== 'taverna') continue;
      let e = stIdx.get(b.id); if (!e) stIdx.set(b.id, e = { cozinheiro: null, cervejeiro: null }); if (!e[v.role]) e[v.role] = v;
    }
    return stIdx;
  }
  TO.staff = function (b) { const e = b ? staffIdx().get(b.id || b) : null; return { cozinheiro: (e && e.cozinheiro) || null, cervejeiro: (e && e.cervejeiro) || null }; };
  const staffN = b => { const s = TO.staff(b); return (s.cozinheiro ? 1 : 0) + (s.cervejeiro ? 1 : 0); };
  // (the keeper's purse is the house's: what it pays and what it buys with — the people's treasury where it has no coin)
  const coin = b => E.coinage(G.Village.facOfSet(b.set));
  const keeper = b => T.keeperOf(b);
  const purseOf = b => { const k = keeper(b); return k ? E.coinRef(k) : null; };
  const cash = b => { const p = purseOf(b); return p ? D.get(p, 'moedas') : 0; };

  // ------------------------------ the pantries: the kitchen's and the brewer's ------------------------------
  // The raw goods the house bought are not on the shelf the menu reads: the kitchen's pantry ('k:' and the tavern's id —
  // b.despensa: the fish, the grain of the bread, the garden's, the wood of the fire) and the brewer's store ('e:' — b.tulha: the
  // grain of the beer, the honey of the mead, the wood of the mash). What is ready — the dishes, the jars — goes to the shelf
  // ('b:'). The food keeps its parts in both (G.Origem): the fish is fish of the catch it was, at every holder
  function pantry(field, cap) {
    return {
      obj: id => { const b = S_().buildings.get(id); return b && b.type === 'taverna' && b.built ? b : null; },
      get: (b, k) => (b[field] && b[field][k]) || 0,
      room: (b, k) => { if (k === 'moedas' || k === 'water') return 0; let n = 0; const L = b[field] || {}; for (const q in L) n += L[q] || 0; return Math.max(0, cap - n); },
      take: (b, k, n) => { const L = b[field]; L[k] = r4((L[k] || 0) - n); if (L[k] <= EPS) delete L[k]; },
      put: (b, rec) => { const L = b[field] || (b[field] = {}); L[rec.k] = r4((L[rec.k] || 0) + rec.n); },
      list: b => b[field] || {},
      owner: b => ({ fac: G.Village.facOfSet(b.set), bld: b.id }),
      place: b => b,
      all: () => [...S_().buildings.values()].filter(b => b.type === 'taverna' && b.built && b[field]),
    };
  }
  D.addKind('k', pantry('despensa', TO.DESP));
  D.addKind('e', pantry('tulha', TO.TULHA));
  // (a tavern that falls, is left to the wind or pulled down: what its pantries kept is lost with it, in the ledger — L-377's rule)
  const kept0 = G.Village.keptGone;
  G.Village.keptGone = function (b, code) {
    if (b && b.type === 'taverna') for (const ref of ['k:' + b.id, 'e:' + b.id]) { if (!D.exists(ref)) continue; D.unclaim(ref); const L = D.list(ref); for (const k of Object.keys(L).sort()) if (L[k] > EPS) D.use(ref, k, L[k], { code, mine: true }); }
    return kept0.apply(this, arguments);
  };

  // ------------------------------ what the house brews ------------------------------
  // the drink of the house's vat, by its people (tavern.js): the beer of the grain where the people drinks beer; the mead where it
  // drinks mead and there is honey to be had (else the beer of its barley); the beer of the maize where the pulque would be — the
  // world has no maguey yet; the beer of a people of wine only when its store has no wine for the shelf. Null: nothing to brew
  const cereal = () => (OR() ? OR().CEREAL : null);
  const grainAt = ref => (OR() ? OR().free(ref, 'food', OR().CEREAL) : 0);
  TO.bebida = function (b, f) {
    const L = G.Tavern && G.Tavern.DRINK; const d = (L && (L[(f && f.civ) || 'classico'] || L.classico)) || { k: 'cerveja' };
    const honey = f && (D.free('f:' + f.id, 'mel') >= 1 - EPS || D.free('e:' + b.id, 'mel') >= 1 - EPS);
    if (d.k === 'mel') return honey ? 'mel' : d.alt === 'cerveja' ? 'cerveja' : null;
    if (d.k === 'cerveja' || d.k === 'pulque') return 'cerveja';
    if (d.alt === 'cerveja' && f && (f.stock[d.k] || 0) < 2) return 'cerveja';
    return null;
  };
  // (and whether the people has where to take it from: the cereal of its fields in the store or in the house's store; the honey)
  const source = (b, f, k) => (k === 'mel' ? D.free('f:' + f.id, 'mel') + D.free('e:' + b.id, 'mel') >= 1 - EPS : grainAt('f:' + f.id) + grainAt('e:' + b.id) >= 2 - EPS);

  // ------------------------------ the house's memory of its nights, and its decision (D-841) ------------------------------
  // Once a second, while a day of the tavern is open with guests at its tables: how long the shelf had no plate, and how long none of
  // the house's own drink — the night's hunger and thirst the house did not meet. Once a day, the night before folds into the memory
  // (a slow mean of about three nights: the meals served, the rounds of the drink, the shares without), and the house decides: the
  // cook when the meals pass the mark of its size — or the plates ran out —, the brewer when the rounds of the drink it brews do — or
  // the drink ran out —, each kept until the memory falls under the lower mark; nobody it cannot pay (the keeper's coins for TO.RESERVA
  // days of the wages), nobody while it owes them, nobody while the keeper is the god's body (the house is the player's)
  const DRINKS = ['vinho', 'mel', 'cerveja', 'pulque'];
  const houseK = b => { const f = G.Fac.get(G.Village.facOfSet(b.set)); return f ? TO.bebida(b, f) : null; };
  A.hooks.tick.push(function (step) {
    const S = S_(); if (!G.inSim) return;
    for (const set of S.settlements.values()) for (const b of taverns(set.id)) {
      const op = T.dia(b); if (!op || !T.aberta(b)) continue;
      let g = 0; for (const id in op.data.mesa) if (!op.data.mesa[id].corpo) g++; if (!g) continue;
      const h = memo(b).hoje || (b.tvo.hoje = { g: 0, sc: 0, sb: 0, cp: 0, fr: 0 });
      h.g = r2((h.g || 0) + step);
      if (D.free('b:' + b.id, 'food') < 1 - EPS) h.sc = r2((h.sc || 0) + step);
      // (and the thirst: the guests at the tables while the house's drink was out — guest-seconds)
      const k = houseK(b); if (k && D.free('b:' + b.id, k) < T.DOSE[k] - EPS) { h.sb = r2((h.sb || 0) + step); h.sd = r2((h.sd || 0) + g * step); }
    }
    if (G.mod('tvof.day') === S.day) return; G.mod('tvof.day', S.day); // (the world's, in the save: no second day on a load, L-694)
    for (const set of S.settlements.values()) for (const b of taverns(set.id)) day(b, set);
  });
  function day(b, set) {
    const S = S_(); const o = memo(b); const f = G.Fac.get(G.Village.facOfSet(b.set)); if (!f) return;
    const h = o.hoje || {}; const fdy = S.day - 1;
    const op = A.all().find(x => x.def === 'taverna' && x.at === b.id && x.data && x.data.day === fdy) || null;
    // (the accounts of the day that ended: what the house sold, what it bought — its keeper's and its people's purchases —, the fees)
    const paid = wages(b, f, o);
    o.conta = { dia: fdy, venda: op ? r2(op.data.receita || 0) : 0, compras: r2((h.cp || 0) + (op ? op.data.gasto || 0 : 0)), soldos: paid, frete: r2(h.fr || 0) };
    if (op) {
      const vd = op.data.vendas || {}; let rb = 0; const k = TO.bebida(b, f);
      for (const q of DRINKS) if (vd[q] && q === k) rb += vd[q] / T.DOSE[q];
      const g = h.g || 0; const sc = g > 1 ? Math.min(1, (h.sc || 0) / g) : 0, sb = g > 1 ? Math.min(1, (h.sb || 0) / g) : 0;
      const w = o.n ? TO.K : 1;
      o.ref = r2(o.ref + ((vd.food || 0) - o.ref) * w); o.rb = r2(o.rb + (rb - o.rb) * w);
      o.sc = r2(o.sc + (sc - o.sc) * w); o.sb = r2(o.sb + (sb - o.sb) * w); o.rl = r2((o.rl || 0) + ((h.sd || 0) / TO.RONDA - (o.rl || 0)) * w);
      o.n = Math.min(99, o.n + 1); o.fecha = 0;
    } else o.fecha = (o.fecha || 0) + 1;
    o.hoje = { g: 0, sc: 0, sb: 0, cp: 0, fr: 0 };
    decide(b, f, o);
  }
  // the day's wages: each of the house's people who held the post, from the keeper's coins to the house of the one paid, by the
  // ledger («soldo-taverna»); a house that has not the coins owes the day (o.dev) — a worker of the keeper's own house is paid
  // by nobody: the family's business. A people with no coin pays no wage: its tavern is the people's (D-077). → what was paid
  function wages(b, f, o) {
    if (!coin(b)) { o.dev = 0; return 0; }
    const from = purseOf(b); const s = TO.staff(b); let paid = 0, owed = 0;
    for (const r of TO.ROLES) {
      const v = s[r]; if (!v || v.jail || (G.Naval && G.Naval.away(v))) continue;
      const to = E.coinRef(v); if (from && to === from) continue;
      const ok = from && D.get(from, 'moedas') + EPS >= TO.SOLDO && D.move(from, to, 'moedas', TO.SOLDO, { code: 'soldo-taverna', by: keeper(b) ? keeper(b).id : 0, key: 'tvs:' + b.id + ':' + v.id + ':' + S_().day }).ok;
      if (ok) { paid = r2(paid + TO.SOLDO); v.unpaid = 0; } else { owed++; v.unpaid = (v.unpaid || 0) + 1; }
    }
    o.dev = owed ? (o.dev || 0) + 1 : 0;
    return paid;
  }
  // (the proofs' door: the house decides now, from its memory as it is — nothing of the world calls it: the guard, rule 377)
  TO.decideNow = function (b) { const f = b && G.Fac.get(G.Village.facOfSet(b.set)); if (!f || b.type !== 'taverna' || !b.built) return null; decide(b, f, memo(b)); return TO.want(b); };
  function decide(b, f, o) {
    const sz = TO.SZ[b.esc] || 0; const k = keeper(b); const was = { ck: o.ck, cv: o.cv };
    const hiC = Math.max(2, TO.COOK_HI - TO.STEP * sz), hiB = Math.max(2, TO.BREW_HI - TO.STEP * sz);
    // (what the nights asked: of the plate, what was sold and as much more as the shelf was out of it — a night out of food half the time
    // asked twice what it sold; of the house's drink, what was sold and the rounds the guests at the tables while it was out would have
    // drunk — «com a cerveja que falta, o cervejeiro»: the dry nights of a full room ask him, even with nothing sold)
    const needC = o.ref / Math.max(TO.SEM, 1 - o.sc);
    const bk = TO.bebida(b, f); const needB = bk ? o.rb + (o.rl || 0) : 0;
    let ck = o.ck ? (needC >= hiC * TO.LO ? 1 : 0) : (o.n >= TO.NIGHTS && needC >= hiC ? 1 : 0);
    let cv = !bk || !source(b, f, bk) ? 0 : o.cv ? (needB >= hiB * TO.LO ? 1 : 0) : (o.n >= TO.NIGHTS && needB >= hiB ? 1 : 0);
    let why = '';
    if (!k) { ck = cv = 0; why = 'sem taverneiro'; }
    else if (A.isBody(k)) { ck = cv = 0; why = 'a casa é do corpo do deus'; }
    else if (o.fecha >= TO.FECHADA) { ck = cv = 0; why = 'fechada'; }
    else if (o.dev >= TO.DEVE) { ck = cv = 0; o.pausa = TO.PAUSA; o.dev = 0; why = 'sem como pagar'; }
    else if (o.pausa > 0) { o.pausa--; if (!was.ck) ck = 0; if (!was.cv) cv = 0; why = 'pagando o que devia'; }
    // (nobody new the house cannot pay for some days)
    if (coin(b) && k) { const want = TO.SOLDO * TO.RESERVA * (1 + (ck && !was.ck ? 1 : 0) + (cv && !was.cv ? 1 : 0)); if (cash(b) + EPS < want) { if (!was.ck) ck = 0; if (!was.cv) cv = 0; } }
    o.ck = ck; o.cv = cv; o.why = why || null;
    // (the keeper remembers the change, with its cause)
    if (k && !A.isBody(k) && (ck !== was.ck || cv !== was.cv)) {
      const nm = G.Village.buildName(b).toLowerCase(); const L = [];
      if (ck && !was.ck) L.push('a casa precisa de um cozinheiro: as noites pedem mais prato do que dou conta');
      if (cv && !was.cv) L.push(`a casa precisa de um cervejeiro: ${bk === 'mel' ? 'o hidromel' : 'a cerveja'} não chega para as noites`);
      if (!ck && was.ck) L.push(why ? `a cozinha fecha (${why})` : 'a cozinha fecha: as noites não pedem mais tanto prato');
      if (!cv && was.cv) L.push(why ? `a cuba para (${why})` : 'a cuba para: as noites não pedem mais tanta bebida');
      if (L.length) A.note(k, 'memory', G.cap(L.join('; ')) + ` (${nm}).`);
    }
  }

  // ------------------------------ the brewer's hand (D-843) ------------------------------
  // the quality of a batch is the hand of who began it: his days in the trade (G.Village.tenure), a third of the best for the new one,
  // nearly all of it after a month — and barley, the grain of the beer, a little better. The jars that sour are the share of the bad hand,
  // counted by the batch and the jar (G.hash), never the world's chance
  TO.mao = function (v, de) {
    const days = v && G.Village.tenure ? G.Village.tenure(v) : 0;
    let q = 0.3 + 0.6 * (1 - Math.exp(-days / TO.EXP));
    if (de) { let all = 0, ce = 0; for (const t in de) { all += de[t]; if (t === 'cevada') ce += de[t]; } if (all > EPS) q += 0.08 * ce / all; }
    return r2(Math.max(0, Math.min(1, q)));
  };
  // the house's own drink on its shelf (b.adega: the jars the vat made and their quality, a pour taking its share — the jars of the
  // store bought by the keeper are not the house's): → { n, q }
  TO.casa = function (b, k) { const a = b && b.adega && b.adega[k]; if (!a) return { n: 0, q: 0 }; return { n: r2(Math.min(a.n, D.get('b:' + b.id, k))), q: a.q }; };
  // the house's beer «das melhores da cidade»: its own on the shelf, of a good hand, and no house of the town brewing better
  TO.boa = function (b, k) {
    k = k || 'cerveja'; const c = TO.casa(b, k); if (c.n < (T.DOSE[k] || 0.25) - EPS || c.q < TO.BOA) return false;
    for (const o of taverns(b.set)) if (o !== b) { const x = TO.casa(o, k); if (x.n >= (T.DOSE[k] || 0.25) - EPS && x.q > c.q + 0.02) return false; }
    return true;
  };
  // (the ledger: a batch's jars made on the shelf put their quality there; a pour out of the shelf takes its share of the house's)
  D.onMove.push(adega);
  function adega(e) {
    const k = e[5]; if (k !== 'cerveja' && k !== 'mel' && k !== 'food') return; const S = S_(); const from = e[3], to = e[4];
    const tav = ref => { if (typeof ref !== 'string' || ref.charCodeAt(0) !== 98 || ref[1] !== ':') return null; const b = S.buildings.get(+ref.slice(2)); return b && b.type === 'taverna' ? b : null; };
    const bt = tav(to), bf = tav(from);
    if (k !== 'food' && bt && bt !== bf && from === '@mundo' && e[8] === 'fornada') { const op = A.get(e[7]); if (op && op.def === 'brassagem') { const M = bt.adega || (bt.adega = {}); const a = M[k] || (M[k] = { n: 0, q: 0 }); const n = e[6]; a.q = r2((a.q * a.n + op.data.qual * n) / Math.max(EPS, a.n + n)); a.n = r4(a.n + n); } }
    if (bf && bf !== bt) {
      const left = D.get(from, k); const f0 = left + e[6] > EPS ? Math.max(0, Math.min(1, left / (left + e[6]))) : 0;
      if (k === 'food') { const P = bf.prato; if (P) for (const t of Object.keys(P)) { P[t] = r4(P[t] * f0); if (P[t] <= EPS) delete P[t]; } }
      else if (bf.adega && bf.adega[k]) { const a = bf.adega[k]; a.n = r4(a.n * f0); if (a.n <= EPS) delete bf.adega[k]; }
    }
  }

  // ------------------------------ the vat: a batch of the brewer (D-842) ------------------------------
  // A batch is an operation of the world ('brassagem'): the grain set aside in the house's store, steeped in the vat, the malt
  // sprouting, the mash in the hot water (the house's wood), the fermentation of two days, the jars filled — the batch keeps the
  // parts of the grain it took (op.data.de: the beer says its grain, D-802) and the hand of who began it (op.data.qual). The mead:
  // the honey in the water of the vat, two days and a half, the pots. A save, the death of the brewer, the god's body in his place
  // undo nothing and repeat nothing; what waits waits by the world's clock. One batch that wants hands at a time, two at most
  A.addAnim('mexerCuba', { act: 'mexer-cuba', dur: 4, contact: 3.6, hands: 2 });
  const BREW = TO.BREW = {
    cerveja: { k: 'cerveja', in: 'food', of: true, n: TO.BREW_N, min: 3, name: 'jarras de cerveja', one: 'jarra de cerveja', st: [
      { id: 'grao', kind: 'busca', name: 'esperando o grão na tulha' },
      // (take: what a unit — a gesture — works of its pool; give: what it gives of the next, or of the jars: the grain all at once into the
      // water, the mash stirred half at a time on the hot water — a quarter of wood a grain —, two jars filled a gesture: a jar of a grain)
      { id: 'molho', kind: 'mao', anim: 'mexerCuba', take: TO.BREW_N, to: 'molho', give: TO.BREW_N, name: 'o grão de molho na cuba' },
      { id: 'malte', kind: 'espera', wait: TO.MALTE, name: 'o grão brotando: o malte' },
      { id: 'mosto', kind: 'mao', anim: 'mexerCuba', from: 'molho', take: 3, to: 'mosto', give: 4.5, wood: 3 * TO.LENHA_MOSTO, name: 'a mosturação, na água quente' },
      { id: 'fermentar', kind: 'espera', wait: TO.FERM, name: 'fermentando na cuba' },
      { id: 'encher', kind: 'mao', anim: 'encher', from: 'mosto', take: 3, give: 2, make: 1, name: 'enchendo os jarros' },
    ] },
    mel: { k: 'mel', in: 'mel', of: false, n: TO.MEAD_N, min: 2, name: 'potes de hidromel', one: 'pote de hidromel', st: [
      { id: 'mel', kind: 'busca', name: 'esperando o mel na tulha' },
      { id: 'diluir', kind: 'mao', anim: 'mexerCuba', take: TO.MEAD_N, to: 'mosto', give: 2 * TO.MEAD_N, name: 'o mel na água da cuba' },
      { id: 'fermentar', kind: 'espera', wait: TO.FERM_MEL, name: 'o hidromel fermentando' },
      { id: 'encher', kind: 'mao', anim: 'encher', from: 'mosto', take: 2, give: 2, make: 1, name: 'enchendo os potes' },
    ] },
  };
  const BREW_DO = { molho: 'Pôr o grão de molho na cuba', mosto: 'Mexer a cuba: a mosturação', diluir: 'Mexer o mel na água da cuba', encher: 'Encher os jarros da cuba' };
  const POT_DO = { cozinhar: 'Cozinhar a panelada', servir: 'Pôr os pratos na prateleira' };
  const rxB = op => (op && op.data ? BREW[op.data.k] || null : null);
  const stB = op => { const R = rxB(op); return R ? R.st[op.data.s] || null : null; };
  const brews = b => { const id = b && (b.id || b); const out = []; for (const op of A.all()) if (op.def === 'brassagem' && live(op) && op.at === id) out.push(op); return out; };
  TO.brews = brews;
  // (what of the batch's input is in the house's store, free: the cereal of the beer — only the cereal: 20h —, the honey of the mead)
  const inFree = (b, R, opId) => (R.of && OR() ? OR().free('e:' + b.id, 'food', OR().CEREAL, opId) : D.free('e:' + b.id, R.in, opId));
  function setRsv(op, ref, k, n) {
    if (n !== undefined) op.data.got = Math.max(0, r2(n));
    D.unreserve(op.id, ref, k);
    if (op.data.got > EPS && !D.reserve(ref, k, op.data.got, op.id)) { op.data.got = r2(Math.max(0, Math.min(op.data.got, D.free(ref, k, op.id)))); if (op.data.got > EPS) D.reserve(ref, k, op.data.got, op.id); }
  }
  // (a new batch only once the ones under way want no hands: one in the vat fermenting, one being made — and the store's room)
  function canStartB(b) { const L = brews(b); if (L.length >= 2) return false; for (const op of L) { const s = stB(op); if (s && s.kind !== 'espera') return false; } return true; }
  function startB(b, k, v) {
    const R = BREW[k]; if (!R || !G.inSim || !canStartB(b)) return null;
    const f = G.Fac.get(G.Village.facOfSet(b.set)); if (!f) return null;
    // (the batch's size: what the house's store and the people's store have of it, up to a full one)
    const have = inFree(b, R) + (R.of ? grainAt('f:' + f.id) : D.free('f:' + f.id, R.in));
    const n = Math.min(R.n, Math.floor(have + EPS)); if (n < R.min) return null;
    const op = A.start('brassagem', { at: b.id, set: b.set, fac: f.id, to: 'b:' + b.id, why: k, by: v ? v.id : 0, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { k, n, s: 0, t: 0, got: 0, u: 0, molho: 0, mosto: 0, feito: 0, azedas: 0, usado: 0, lenha: 0, de: {}, qual: 0, mestre: v ? v.id : 0 } });
    if (op) A.log(op, 'brassagem', k, n);
    return op;
  }
  function nextB(op) {
    const R = rxB(op); const d = op.data; d.s++; d.t = 0;
    if (op.st === 'wait') A.resume(op);
    if (d.s >= R.st.length) return endB(op);
    A.log(op, 'etapa', R.st[d.s].id);
  }
  function endB(op) {
    const S = S_(); const R = rxB(op); const d = op.data; const b = S.buildings.get(op.at);
    if (b) setRsv(op, 'e:' + b.id, R.in, 0);
    A.end(op, 'ok', `${d.feito} ${R.name}${d.azedas ? `, ${d.azedas} azedos` : ''}`);
    const v = S.villagers.get(d.mestre);
    if (v && !A.isBody(v)) A.note(v, 'memory', `Enchemos ${d.feito} ${d.feito === 1 ? R.one : R.name} da cuba${d.azedas ? ` (${d.azedas} ${d.azedas > 1 ? 'azedaram' : 'azedou'})` : ''}${b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : ''}.`);
  }
  // (what a batch still held when it was cut short — the steeped grain, the wort — is lost with it, and said)
  function cutB(op, st, why) {
    const S = S_(); const d = op.data; const b = S.buildings.get(op.at); const R = rxB(op);
    d.perdido = r2((d.molho || 0) + (d.mosto || 0)); d.molho = 0; d.mosto = 0;
    if (b && R) setRsv(op, 'e:' + b.id, R.in, 0); d.got = 0;
    A.end(op, st, why);
  }
  TO.cutBrew = (op, why) => { if (op && live(op) && G.inSim) cutB(op, 'int', why || 'interrompida'); };
  const poolB = (op, s) => (s.from ? op.data[s.from] || 0 : op.data.got || 0);
  function canUnitB(op, v) {
    if (!op || !live(op)) return { ok: false, why: 'A brassagem acabou.' };
    const S = S_(); const b = S.buildings.get(op.at); const R = rxB(op); const s = stB(op);
    if (!b || !R || !s) return { ok: false, why: 'A brassagem acabou.' };
    if (s.kind !== 'mao') return { ok: false, why: s.kind === 'espera' ? `A cuba está ${s.name}.` : `Ainda falta ${R.in === 'mel' ? 'mel' : 'grão'} na tulha para esta brassagem.` };
    if (poolB(op, s) < EPS) return { ok: false, why: 'Esta etapa terminou.' };
    if (s.wood && D.free('e:' + b.id, 'wood') + EPS < s.wood) return { ok: false, why: 'Falta lenha na tulha para esquentar a água.' };
    if (s.make && D.room('b:' + b.id, R.k) < 1 - EPS) return { ok: false, why: 'A prateleira está cheia.' };
    if (v && !A.able(v) && !A.isBody(v)) return { ok: false, why: 'Agora não dá.' };
    return { ok: true, b, R, s };
  }
  TO.canUnitBrew = canUnitB;
  // one unit at the vat (the world's people and the god's body, the same door): the grain used by the ledger with the parts it takes
  // (of: the cereal), the wood of the hot water used, a pool of the batch filled — or the jars made on the shelf, by the batch's hand
  function unitB(op, v) {
    const c = canUnitB(op, v); if (!c.ok) return c;
    const { b, R, s } = c; const d = op.data; const key = 'tb:' + op.id + ':' + d.s + ':' + d.u;
    let taken = Math.min(s.take, poolB(op, s)); if (s.make) taken = Math.min(taken, Math.floor(D.room('b:' + b.id, R.k) + EPS) * s.take / s.give);
    if (!(taken > EPS)) return { ok: false, why: 'Esta etapa terminou.' };
    if (s.wood) { const w = r4(s.wood * taken / s.take); const r = D.use('e:' + b.id, 'wood', w, { op: op.id, code: 'cuba-lenha', by: v.id, key: key + ':w' }); if (!r.ok) return { ok: false, why: 'Falta lenha na tulha para esquentar a água.' }; d.lenha = r2(d.lenha + r.n); }
    if (!s.from) {
      const r = D.use('e:' + b.id, R.in, taken, { op: op.id, code: R.in === 'mel' ? 'cuba-mel' : 'cuba-grao', by: v.id, key, mine: true, of: R.of ? cereal() : undefined });
      if (!r.ok) return { ok: false, why: `Sumiu ${R.in === 'mel' ? 'o mel' : 'o grão'} separado para esta brassagem.` };
      taken = r.n; d.usado = r2(d.usado + taken); setRsv(op, 'e:' + b.id, R.in, d.got - taken);
      if (R.of && r.parts) for (const t in r.parts) if (r.parts[t] > EPS) d.de[t] = r2((d.de[t] || 0) + r.parts[t]);
      // (the hand of the batch: whoever began it, by the grain it took)
      { const m = S_().villagers.get(d.mestre) || v; d.qual = TO.mao(m, R.of ? d.de : null); }
    } else d[s.from] = r2(d[s.from] - taken);
    d.u++;
    const out = r2(taken * s.give / s.take);
    let msg = '';
    if (s.make) {
      const n = Math.round(out); let sour = 0; for (let j = 0; j < n; j++) if (G.hash(Math.imul(op.id | 0, 7919) + (d.feito + d.azedas + j) * 31 + 17) < TO.AZEDA * (1 - (d.qual || 0))) sour++;
      const good = r2(out - sour);
      if (good > EPS) { const r = D.make('b:' + b.id, R.k, good, { op: op.id, code: 'fornada', by: v.id, key: key + ':m' }); if (r.ok) { d.feito = r2(d.feito + r.n); if (G.Urban) G.Urban.noteB(b, 'oficio', 1); } }
      d.azedas = r2(d.azedas + sour);
      msg = `${Math.round(good)} ${Math.round(good) === 1 ? R.one : R.name} na prateleira${sour ? `, ${sour} azedo${sour > 1 ? 's' : ''}` : ''}.`;
    } else { d[s.to] = r2((d[s.to] || 0) + out); msg = ({ molho: 'Você põe o grão de molho na cuba.', mosto: 'Você mexe o malte na água quente.', diluir: 'Você mexe o mel na água da cuba.' })[s.id] || 'Feito.'; }
    const me = op.roles && op.roles[v.id]; if (me) me.n = (me.n || 0) + 1;
    op.upd = S_().clock;
    if (poolB(op, s) < EPS) nextB(op);
    return { ok: true, n: out, msg };
  }
  TO.unitBrew = (op, v) => (G.inSim ? unitB(op, v) : { ok: false, why: '' });
  function tickB(op, step) {
    const S = S_(); const b = S.buildings.get(op.at); const R = rxB(op); const d = op.data;
    if (!R) return A.end(op, 'cancel', 'sem receita');
    if (!b || b.type !== 'taverna' || !b.built) return cutB(op, 'int', 'a taverna caiu');
    if (G.Village.facOfSet(b.set) !== op.fac) return cutB(op, 'int', 'a taverna mudou de dono');
    const s = R.st[d.s]; let why = '';
    if (s.kind === 'busca') {
      const free = inFree(b, R, op.id) - d.got;
      if (free > EPS && d.got < d.n - EPS) setRsv(op, 'e:' + b.id, R.in, Math.min(d.n, d.got + free));
      if (d.got + EPS >= d.n) return nextB(op);
      why = 'insumo';
    } else if (s.kind === 'espera') {
      op.upd = S.clock; d.t = r2(Math.min(s.wait, d.t + step)); if (d.t + EPS >= s.wait) return nextB(op); // (the vat working by itself is no batch let go: the clock of the abandon counts only a stage that wants hands)
    } else if (s.kind === 'mao') {
      if (!s.from && d.got > EPS && D.get('e:' + b.id, R.in) + EPS < d.got) setRsv(op, 'e:' + b.id, R.in, D.get('e:' + b.id, R.in)); // (taken by another hand: the god's)
      if (poolB(op, s) < EPS) return nextB(op);
      if (s.wood && D.free('e:' + b.id, 'wood') + EPS < s.wood) why = 'lenha';
    }
    if (why) { if (op.st !== 'wait' || op.wait !== why) A.pause(op, why); } else if (op.st === 'wait') A.resume(op);
    // (a batch nobody touched in two days, with no brewer at the house: let go — the wort spoils in the vat)
    if (s.kind !== 'espera' && S.clock - (op.upd || 0) > G.DAY_LEN * 2 && !TO.staff(b).cervejeiro) cutB(op, 'cancel', 'abandonada');
  }

  // ------------------------------ the kitchen: a pot of the cook (D-844) ------------------------------
  // A pot is an operation of the world ('panelada'): what goes into it set aside in the kitchen's pantry (the food bought, with its
  // parts), cooked portion by portion at the tavern's fire (the gesture 'cozinhar', the same as at home: act-lar.js; the pantry's wood
  // burnt), simmered, and the dishes put on the shelf — moved, never made: the plate of fish is the fish that was bought, its origin
  // kept (a move carries its parts, G.Origem). The menu of the house (act-taverna.js) reads the shelf: what the cook made is on it
  const POT = TO.POT_ST = [
    { id: 'separar', kind: 'busca', name: 'separando o que vai à panela' },
    { id: 'cozinhar', kind: 'mao', anim: 'cozinhar', use: 'cozinhar', take: 2, to: 'panela', give: 2, wood: 2 * TO.LENHA_POT, name: 'cozinhando no fogo da taverna' },
    { id: 'ferver', kind: 'espera', wait: TO.FERVE, name: 'a panela no fogo' },
    { id: 'servir', kind: 'mao', anim: 'servir', use: 'cozinhar', from: 'panela', take: 2, move: 1, name: 'pondo os pratos na prateleira' },
  ];
  const stP = op => (op && op.data ? POT[op.data.s] || null : null);
  const pots = b => { const id = b && (b.id || b); const out = []; for (const op of A.all()) if (op.def === 'panelada' && live(op) && op.at === id) out.push(op); return out; };
  TO.pots = pots;
  function canStartP(b) { for (const op of pots(b)) { const s = stP(op); if (s && s.kind !== 'espera') return false; } return pots(b).length < 2; }
  function startP(b, v) {
    if (!G.inSim || !canStartP(b)) return null;
    const n = Math.min(TO.POT, Math.floor(D.free('k:' + b.id, 'food') + EPS)); if (n < 2) return null;
    const op = A.start('panelada', { at: b.id, set: b.set, fac: G.Village.facOfSet(b.set), to: 'b:' + b.id, why: 'prato', by: v ? v.id : 0, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { n, s: 0, t: 0, got: 0, u: 0, panela: 0, feito: 0, lenha: 0, mestre: v ? v.id : 0 } });
    if (op) A.log(op, 'panelada', n);
    return op;
  }
  function nextP(op) { const d = op.data; d.s++; d.t = 0; if (op.st === 'wait') A.resume(op); if (d.s >= POT.length) return endP(op); A.log(op, 'etapa', POT[d.s].id); }
  function endP(op) {
    const S = S_(); const d = op.data; const b = S.buildings.get(op.at);
    if (b) setRsv(op, 'k:' + b.id, 'food', 0);
    A.end(op, 'ok', `${d.feito} pratos`);
    const v = S.villagers.get(d.mestre); if (v && !A.isBody(v) && d.feito >= 2) A.note(v, 'memory', `Saíram ${d.feito} pratos da panela${b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : ''}.`);
  }
  function cutP(op, st, why) { const S = S_(); const d = op.data; const b = S.buildings.get(op.at); d.perdido = r2(d.panela || 0); if (b) setRsv(op, 'k:' + b.id, 'food', 0); d.got = 0; d.panela = 0; A.end(op, st, why); }
  TO.cutPot = (op, why) => { if (op && live(op) && G.inSim) cutP(op, 'int', why || 'interrompida'); };
  const poolP = (op, s) => (s.from ? op.data[s.from] || 0 : Math.max(0, (op.data.got || 0) - (op.data.panela || 0)));
  function canUnitP(op, v) {
    if (!op || !live(op)) return { ok: false, why: 'A panela acabou.' };
    const S = S_(); const b = S.buildings.get(op.at); const s = stP(op);
    if (!b || !s) return { ok: false, why: 'A panela acabou.' };
    if (s.kind !== 'mao') return { ok: false, why: s.kind === 'espera' ? 'A panela está no fogo.' : 'Ainda falta o que pôr na panela.' };
    if (poolP(op, s) < EPS) return { ok: false, why: 'Esta etapa terminou.' };
    if (s.wood && D.free('k:' + b.id, 'wood') + EPS < s.wood) return { ok: false, why: 'Falta lenha na despensa para o fogo.' };
    if (s.move && D.room('b:' + b.id, 'food') < 1 - EPS) return { ok: false, why: 'A prateleira está cheia.' };
    if (v && !A.able(v) && !A.isBody(v)) return { ok: false, why: 'Agora não dá.' };
    return { ok: true, b, s };
  }
  TO.canUnitPot = canUnitP;
  function unitP(op, v) {
    const c = canUnitP(op, v); if (!c.ok) return c;
    const { b, s } = c; const d = op.data; const key = 'tp:' + op.id + ':' + d.s + ':' + d.u;
    let n = Math.min(s.take, poolP(op, s));
    if (s.move) n = Math.min(n, Math.floor(D.room('b:' + b.id, 'food') + EPS));
    if (!(n > EPS)) return { ok: false, why: 'Esta etapa terminou.' };
    if (s.wood) { const w = r4(s.wood * n / s.take); const r = D.use('k:' + b.id, 'wood', w, { op: op.id, code: 'cozinha-lenha', by: v.id, key: key + ':w' }); if (!r.ok) return { ok: false, why: 'Falta lenha na despensa para o fogo.' }; d.lenha = r2(d.lenha + r.n); }
    let msg = 'Feito.';
    if (s.move) {
      // (the dishes out of the pot onto the shelf: the food set aside moved, its parts with it — and the house's record of them)
      const before = OR() ? OR().parts('k:' + b.id, 'food') : {};
      const r = D.move('k:' + b.id, 'b:' + b.id, 'food', n, { op: op.id, code: 'cozinha', by: v.id, key, part: true });
      if (!r.ok) return { ok: false, why: 'Sumiu o que estava na panela.' };
      const after = OR() ? OR().parts('k:' + b.id, 'food') : {}; const P = b.prato || (b.prato = {});
      for (const t of Object.keys(before)) { const m = r4((before[t] || 0) - (after[t] || 0)); if (m > EPS) P[t] = r4((P[t] || 0) + m); }
      d.panela = r2(d.panela - r.n); d.feito = r2(d.feito + r.n); setRsv(op, 'k:' + b.id, 'food', d.got - r.n);
      if (G.Urban) G.Urban.noteB(b, 'oficio', 1);
      msg = `${Math.round(r.n)} ${Math.round(r.n) === 1 ? 'prato' : 'pratos'} na prateleira.`;
    } else { d.panela = r2(d.panela + n); msg = 'Você cozinha uma porção na panela.'; }
    d.u++; const me = op.roles && op.roles[v.id]; if (me) me.n = (me.n || 0) + 1; op.upd = S_().clock;
    if (poolP(op, s) < EPS) nextP(op);
    return { ok: true, n, msg };
  }
  TO.unitPot = (op, v) => (G.inSim ? unitP(op, v) : { ok: false, why: '' });
  function tickP(op, step) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data;
    if (!b || b.type !== 'taverna' || !b.built) return cutP(op, 'int', 'a taverna caiu');
    if (G.Village.facOfSet(b.set) !== op.fac) return cutP(op, 'int', 'a taverna mudou de dono');
    const s = POT[d.s]; let why = '';
    if (s.kind === 'busca') {
      const free = D.free('k:' + b.id, 'food', op.id) - d.got;
      if (free > EPS && d.got < d.n - EPS) setRsv(op, 'k:' + b.id, 'food', Math.min(d.n, d.got + free));
      if (d.got + EPS >= d.n) return nextP(op);
      why = 'insumo';
    } else if (s.kind === 'espera') { op.upd = S.clock; d.t = r2(Math.min(s.wait, d.t + step)); if (d.t + EPS >= s.wait) return nextP(op); }
    else if (s.kind === 'mao') {
      if (d.got > EPS && D.get('k:' + b.id, 'food') + EPS < d.got) { setRsv(op, 'k:' + b.id, 'food', D.get('k:' + b.id, 'food')); if (d.panela > d.got) d.panela = d.got; }
      if (poolP(op, s) < EPS) return nextP(op);
      if (s.wood && D.free('k:' + b.id, 'wood') + EPS < s.wood) why = 'lenha';
    }
    if (why) { if (op.st !== 'wait' || op.wait !== why) A.pause(op, why); } else if (op.st === 'wait') A.resume(op);
    if (s.kind !== 'espera' && S.clock - (op.upd || 0) > G.DAY_LEN * 2 && !TO.staff(b).cozinheiro) cutP(op, 'cancel', 'abandonada');
  }

  // ------------------------------ the purchases of the day (D-845) ------------------------------
  // what the house needs, by its menu and its stock: the brewer the grain (or the honey) of the next batch and the wood of the mash; the
  // cook the food the recipe of his people asks — the main of the dish, whatever of it the store has, and the grain of the bread or the
  // porridge — and the wood of the fire. From the people's store, at the wholesale price, paid from the keeper's coins (a people with no
  // coin: the store gives, its tavern is the people's), never past the wages of the day; never while the people's food is short
  TO.RECEITA = {
    romano: { main: ['peixe', 'carne', 'ovos', 'horta', 'leite'], base: ['trigo', 'cevada'] },
    grego: { main: ['peixe', 'carne', 'horta', 'leite', 'ovos'], base: ['cevada', 'trigo'] },
    egipcio: { main: ['peixe', 'horta', 'carne', 'fruta', 'ovos'], base: ['trigo', 'cevada', 'sorgo'] },
    nordico: { main: ['peixe', 'carne', 'leite', 'ovos', 'horta'], base: ['cevada', 'trigo'] },
    asteca: { main: ['carne', 'peixe', 'horta', 'ovos'], base: ['milho'] },
    classico: { main: ['carne', 'peixe', 'horta', 'ovos', 'leite'], base: ['trigo', 'cevada', 'arroz', 'milho', 'sorgo'] },
  };
  // (what each people's kitchen makes of each part — the line of the menu under the dish's own name, which the menu gives by the part:
  // the cook's way with it, D-846. Only what the dish is made of and how it was cooked: no oil, no herb, no honey the house did not buy)
  TO.PRATO = {
    romano: { peixe: 'peixe cozido no caldo', carne: 'carne assada no forno', ovos: 'ovos cozidos', horta: 'sopa dos legumes da horta', leite: 'coalhada fresca', trigo: 'pão de trigo, com caldo', cevada: 'puls de cevada, o caldo grosso', arroz: 'arroz cozido', milho: 'papa de milho', sorgo: 'mingau de sorgo', fruta: 'frutas', marisco: 'mariscos cozidos no caldo' },
    grego: { peixe: 'peixe grelhado na brasa', carne: 'carne assada no espeto', horta: 'sopa de legumes', leite: 'coalhada fresca', ovos: 'ovos cozidos', cevada: 'caldo grosso de cevada', trigo: 'pão de trigo, com caldo', fruta: 'frutas', marisco: 'polvo cozido' },
    egipcio: { peixe: 'peixe do rio assado na brasa', horta: 'sopa de cebola e alho-poró', carne: 'carne assada na brasa', fruta: 'frutas', ovos: 'ovos cozidos', trigo: 'pão de trigo do forno, com caldo', cevada: 'caldo de cevada, com o pão do forno', sorgo: 'mingau de sorgo', marisco: 'mariscos do rio cozidos' },
    nordico: { peixe: 'peixe defumado no fogo da casa', carne: 'carne cozida no caldeirão', leite: 'skyr, a coalhada do norte', ovos: 'ovos cozidos', horta: 'caldo de nabos', cevada: 'caldo grosso de cevada', trigo: 'pão chato de trigo, com caldo', marisco: 'mariscos no caldeirão' },
    asteca: { carne: 'carne cozida na panela de barro', peixe: 'peixe do lago assado no comal', horta: 'sopa de abóbora e feijão', ovos: 'ovos cozidos', milho: 'tortilhas de milho, quentes do comal', fruta: 'frutas', marisco: 'mariscos do lago' },
    classico: { peixe: 'peixe cozido', carne: 'carne assada', horta: 'sopa de legumes', ovos: 'ovos cozidos', leite: 'coalhada', trigo: 'pão de trigo, com caldo', cevada: 'caldo de cevada', arroz: 'arroz cozido', milho: 'tortilhas de milho', sorgo: 'mingau de sorgo', fruta: 'frutas', marisco: 'mariscos cozidos' },
  };
  const recipeOf = f => TO.RECEITA[(f && f.civ) || 'classico'] || TO.RECEITA.classico;
  // (the coins the house can spend now: the keeper's, less the wages of the day)
  const spare = b => Math.max(0, cash(b) - TO.SOLDO * staffN(b) * 2); // (two days of the wages kept back: the house's family spends the same coins)
  const WHOLE = 0.6; // (the wholesale price of the store, as the keeper's: act-taverna.js)
  const priceOf = (k, n) => r2((E.PRICE[k] || 0.3) * n * WHOLE);
  const hungry = f => (f.stock.food || 0) < TO.FOME;
  // the next purchase of the brewer: { k, n, of, to } or null
  function brewNeed(b, f, v) {
    if (v.carry && v.carry.n > EPS) return null;
    const e = 'e:' + b.id; const wait = brews(b).find(op => { const s = stB(op); return s && s.kind === 'busca'; });
    const k = wait ? wait.data.k : TO.bebida(b, f); if (!k) return null;
    // (what the batch takes in all, against what of it the house's store has for it — its own reservation counted)
    const R = BREW[k]; const want = wait ? wait.data.n : (pickBrew(b, f) ? R.n : 0);
    const have = inFree(b, R, wait ? wait.id : undefined);
    if (want > EPS && have < want - EPS) {
      if (R.of) { if (!hungry(f) && grainAt('f:' + f.id) >= 1) return { k: 'food', n: Math.ceil(want - have - EPS), of: cereal(), to: e }; }
      else if (D.free('f:' + f.id, 'mel') >= 1) return { k: 'mel', n: Math.ceil(want - have - EPS), of: null, to: e };
    }
    // (the wood of the mash, before the batch reaches it)
    if (k === 'cerveja' && D.get(e, 'wood') < TO.LENHA_MOSTO * TO.BREW_N - EPS && (wait || brews(b).length || pickBrew(b, f)) && D.free('f:' + f.id, 'wood') >= 4) return { k: 'wood', n: TO.LENHA_N, of: null, to: e };
    return null;
  }
  // (the beer the house would brew now: its drink, the shelf low by what the batches under way will still give, the people not hungry)
  const target = (b, k) => (k === 'mel' ? 6 : 8) + 4 * (TO.SZ[b.esc] || 0);
  function pickBrew(b, f) {
    const k = TO.bebida(b, f); if (!k || !canStartB(b)) return null; if (k === 'cerveja' && hungry(f)) return null;
    let coming = 0; for (const op of brews(b)) { const d = op.data; coming += op.data.k === k ? Math.max(0, d.n - d.feito - d.azedas) : 0; }
    return D.free('b:' + b.id, k) + coming < target(b, k) && source(b, f, k) ? k : null;
  }
  // the next purchase of the cook: the wood of the fire; the food of the recipe, as much as two pots, while the shelf and the
  // pantry hold less than the nights ask
  function cookNeed(b, f, v) {
    if (v.carry && v.carry.n > EPS) return null;
    const k = 'k:' + b.id; const fr = 'f:' + f.id;
    if (D.get(k, 'wood') < TO.LENHA_POT * TO.POT - EPS && D.free(fr, 'wood') >= 4) return { k: 'wood', n: TO.LENHA_N, of: null, to: k };
    if (hungry(f)) return null;
    const dishes = D.free('b:' + b.id, 'food') + D.free(k, 'food'); const o = b.tvo || {};
    const want = Math.max(6 + 3 * (TO.SZ[b.esc] || 0), Math.ceil((o.ref || 0) * 1.2));
    if (dishes >= want || D.free(k, 'food') >= TO.POT * 2 - EPS) return null;
    // (the recipe: the main of the people's dish — of its parts the store has, what spoils first by the rule of the parts —, and the
    // grain of the bread or the porridge when the pantry has less of it than a quarter)
    const R = recipeOf(f); const O1 = OR(); if (!O1) return { k: 'food', n: TO.POT, of: null, to: k };
    const pk = O1.parts(k, 'food'); let base = 0, all = 0; for (const t in pk) { all += pk[t]; if (R.base.includes(t)) base += pk[t]; }
    const list = base < all * 0.25 ? R.base : R.main;
    const has = list.filter(t => O1.free(fr, 'food', t) >= 1);
    if (!has.length) { const alt = (list === R.base ? R.main : R.base).filter(t => O1.free(fr, 'food', t) >= 1); if (!alt.length) return null; return { k: 'food', n: Math.min(TO.POT, Math.ceil(want - dishes)), of: alt, to: k }; }
    return { k: 'food', n: Math.min(TO.POT, Math.max(2, Math.ceil(want - dishes))), of: has, to: k };
  }
  // the porter at the store's door (D-847): a hand of the town there with nothing pressing — the one who brought that good first (the
  // fisherman the fish, the farmer the grain, the bee-keeper the honey, the woodcutter the wood), then the store's carriers (the docker, the
  // forager) —, by the distance and the id: no chance. He takes the sacks to the tavern's door, by the walk of the world, for the fee
  const PRODUZ = { peixe: ['pescador', 'mergulhador'], marisco: ['pescador', 'mergulhador', 'coletor'], carne: ['cacador', 'acougueiro', 'pastor'], leite: ['pastor'], ovos: ['pastor'], horta: ['agricultor', 'coletor'], fruta: ['fruticultor', 'coletor'], trigo: ['agricultor'], cevada: ['agricultor'], arroz: ['agricultor'], milho: ['agricultor'], sorgo: ['agricultor'], mel: ['apicultor'], wood: ['lenhador'] };
  const CARREGA = ['estivador', 'coletor', 'lenhador'];
  TO.porter = function (store, b, buyer, k, of) {
    const S = S_(); const [fx, fy] = G.Village.frontTile(store); const dr = G.Vg.door(b);
    const parts = k === 'food' ? [].concat(of || []) : [k]; const prod = new Set(); for (const p of parts) for (const r of PRODUZ[p] || []) prod.add(r);
    let best = null, bs = Infinity;
    for (const v of S.villagers.values()) {
      if (v === buyer || v.set !== buyer.set || v.age < 16 || v.age >= 62 || !A.able(v) || A.isBody(v) || v.sleeping || v.inside || v.air) continue;
      const rank = prod.has(v.role) ? 0 : CARREGA.includes(v.role) ? 1 : -1; if (rank < 0) continue;
      if ((v.carry && v.carry.n > EPS) || (v.task && (v.task.pri || 0) >= 1) || v.hunger > 70 || v.energy < 30) continue;
      const d = G.dist(v.x, v.y, fx, fy); if (d > TO.PORTE) continue;
      if (G.Vg.handsBusy(v) || G.Vg.busy(v, { type: 'carga', pri: 1 })) continue;
      if (!G.W.reaches(v, dr[0], dr[1])) continue;
      const sc = rank * 100 + d; if (sc < bs - EPS || (Math.abs(sc - bs) <= EPS && best && v.id < best.id)) { bs = sc; best = v; }
    }
    return best;
  };
  // the purchase at the store's door: the goods into the porter's arms (or the buyer's), marked for the pantry, and the coins from the
  // keeper's purse to the treasury — both or neither; the fee to the porter. → { ok, n, porter | why }
  function buy(v, b, f, t, store) {
    const fr = 'f:' + f.id; const dest = t.to; const k = t.k; const of = t.of || undefined;
    let n = Math.floor(Math.min(t.n, of && OR() ? OR().free(fr, k, of) : D.free(fr, k), D.room(dest, k)) + EPS);
    if (n < 1) return { ok: false, why: 'O armazém não tem, ou não cabe.' };
    const pay = coin(b) ? purseOf(b) : null; if (coin(b) && !pay) return { ok: false, why: 'A casa não tem taverneiro para pagar.' };
    if (coin(b)) { const can = Math.floor((spare(b) + EPS) / Math.max(0.01, priceOf(k, 1))); n = Math.min(n, can); if (n < 1) return { ok: false, why: 'Falta dinheiro na casa para comprar.' }; }
    let porter = TO.porter(store, b, v, k, of);
    if (porter && Math.floor(D.room('v:' + porter.id, k, { to: dest }) + EPS) < Math.min(n, 2)) porter = null;
    if (porter && coin(b) && spare(b) + EPS < priceOf(k, n) + TO.FRETE) porter = null;
    const hands = porter || v;
    n = Math.min(n, Math.floor(D.room('v:' + hands.id, k, { to: dest }) + EPS)); if (n < 1) return { ok: false, why: 'Não dá para carregar.' };
    const cost = coin(b) ? priceOf(k, n) : 0;
    const r = coin(b) ? D.swap([fr, 'v:' + hands.id, k, n], [pay, fr, 'moedas', cost], { code: 'compra-taverna', by: v.id, to: dest, of })
      : D.move(fr, 'v:' + hands.id, k, n, { code: 'taverna-povo', by: v.id, to: dest, of });
    if (!r.ok) return r;
    const o = memo(b); const h = o.hoje || (o.hoje = { g: 0, sc: 0, sb: 0, cp: 0, fr: 0 });
    if (cost) { E.ensure(f); f.eco.sales += cost; h.cp = r2((h.cp || 0) + cost); }
    if (porter) {
      if (coin(b) && D.move(pay, E.coinRef(porter), 'moedas', TO.FRETE, { code: 'frete', by: v.id }).ok) h.fr = r2((h.fr || 0) + TO.FRETE);
      G.Vg.give(porter, { type: 'carga', to: dest, pri: 1, st: 0 }); // (and if he cannot go now, the load knows where it goes: Act.resumeCarry)
      o.fretes = (o.fretes || 0) + 1;
    }
    return { ok: true, n, cost, porter };
  }

  // ------------------------------ the day of the house's people ------------------------------
  // the brewer: a hand at the vat when a batch wants one; the grain, the honey or the wood the next step needs, bought; a new batch when
  // the shelf runs low. The cook: a hand at the fire when a pot wants one; the wood and the food of the recipe, bought; a new pot when
  // the shelf has fewer dishes than the nights ask. Nothing to do: the day's other work (villagers.js)
  TO.task = function (v, b, f, H) {
    if (v.carry && v.carry.n > EPS) { const bd = A.boundOf(v.carry); return bd && bd !== 'op' ? H.setTask(v, { type: 'carga', to: bd, pri: 1, st: 0 }) : null; }
    const stay = v.inside === b.id ? b.id : undefined;
    if (v.role === 'cervejeiro') {
      for (const op of brews(b)) { const s = stB(op); if (s && s.kind === 'mao' && canUnitB(op, v).ok) { A.join(op, v, 'cervejeiro'); return H.setTask(v, { type: 'tavoficio', do: 'cuba', op: op.id, b: b.id, s: op.data.s, use: 'mexer', pri: 1, st: 0, n: 0, stay }); } }
      const need = brewNeed(b, f, v); if (need) return H.setTask(v, { type: 'tavoficio', do: 'comprar', b: b.id, k: need.k, n: need.n, of: need.of || undefined, to: need.to, pri: 1, st: 0 });
      const k = G.inSim ? pickBrew(b, f) : null;
      if (k && inFree(b, BREW[k]) >= BREW[k].min) { const op = startB(b, k, v); if (op) return TO.task(v, b, f, H); }
      return null;
    }
    if (v.role === 'cozinheiro') {
      for (const op of pots(b)) { const s = stP(op); if (s && s.kind === 'mao' && canUnitP(op, v).ok) { A.join(op, v, 'cozinheiro'); return H.setTask(v, { type: 'tavoficio', do: 'panela', op: op.id, b: b.id, s: op.data.s, use: 'cozinhar', pri: 1, st: 0, n: 0, stay }); } }
      const need = cookNeed(b, f, v); if (need) return H.setTask(v, { type: 'tavoficio', do: 'comprar', b: b.id, k: need.k, n: need.n, of: need.of || undefined, to: need.to, pri: 1, st: 0 });
      const o = b.tvo || {}; const want = Math.max(6 + 3 * (TO.SZ[b.esc] || 0), Math.ceil((o.ref || 0) * 1.2));
      if (G.inSim && D.free('b:' + b.id, 'food') < want && D.free('k:' + b.id, 'wood') >= TO.LENHA_POT * 2) { const op = startP(b, v); if (op) return TO.task(v, b, f, H); }
      return null;
    }
    return null;
  };
  const job0 = E.jobTask;
  E.jobTask = function (v, H) {
    if (MINE[v.role]) { const S = S_(); const b = v.job && S.buildings.get(v.job); const f = G.Fac.ofV(v); if (!b || !b.built || b.type !== 'taverna' || !f) return null; E.ensure(f); return TO.task(v, b, f, H); }
    return job0(v, H);
  };
  // (to a building's door, as the deliveries go)
  function walkB(v, t, b, dt, H, front) {
    const key = 'b' + b.id; const at = front ? G.Village.frontTile(b) : G.Vg.door(b);
    if (t.wk !== key) { t.wk = key; if (!(front ? G.Vg.gotoB(v, b, 0.2) : H.goto(v, at[0], at[1], false) || H.goto(v, at[0], at[1], true))) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const near = front ? G.dist(v.x, v.y, at[0], at[1]) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h) : G.dist(v.x, v.y, at[0], at[1]) < 0.75; if (near) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  function runTask(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.b); const f = G.Fac.ofV(v);
    if (!b || !b.built || b.type !== 'taverna' || !f) return H.end(v);
    if (t.do === 'comprar') {
      if (t.st === 0) { const s = G.Village.nearestDropoff(v.x, v.y, v.set); if (!s) return H.end(v); t.store = s.id; const r = walkB(v, t, s, dt, H, true); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
      v.act = AN.examinar.act; if (v.actT < AN.examinar.contact) return;
      const s = S.buildings.get(t.store) || G.Village.nearestDropoff(v.x, v.y, v.set); if (!s) return H.end(v);
      const r = buy(v, b, f, t, s); if (!r.ok) return H.end(v);
      if (r.porter) return H.end(v); // (the porter takes the sacks to the tavern's door: the buyer goes back to the house's work)
      return H.setTask(v, { type: 'carga', to: t.to, pri: 1, st: 0 });
    }
    // a hand at the vat or at the fire: in by the door to the place of the work (In.places, t.use), a few units, out
    const cuba = t.do === 'cuba'; const op = t.op ? A.get(t.op) : null;
    if (!op || !live(op)) return H.end(v);
    if (t.st === 0) {
      if (v.inside === b.id) { t.st = 1; v.actT = 0; return; }
      const r = walkB(v, t, b, dt, H, false); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; G.Vg.enter(v, b, t); } return;
    }
    if (G.Vg.entering(v)) { v.act = ''; return; }
    const s = cuba ? stB(op) : stP(op); if (!s || s.kind !== 'mao' || op.data.s !== t.s) return H.end(v);
    const g = AN[s.anim]; if (!g) return H.end(v);
    v.act = g.act; if (v.actT < g.dur) return;
    const r = cuba ? unitB(op, v) : unitP(op, v); if (!r.ok) return H.end(v);
    v.actT = 0; t.n++;
    if (t.n >= 4 || op.data.s !== t.s || !(cuba ? canUnitB(op, v) : canUnitP(op, v)).ok) return H.end(v); // (four gestures an errand)
  }
  const run0 = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'tavoficio') { runTask(v, t, dt, H); return true; } return run0(v, t, dt, H); };
  const text0 = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'tavoficio') {
      const b = G.S.buildings.get(t.b); const nm = b ? G.Village.buildName(b).toLowerCase() : 'a taverna';
      if (t.do === 'comprar') { const what = t.k === 'wood' ? 'lenha' : t.k === 'mel' ? 'mel' : t.to && t.to[0] === 'e' ? 'grão para a cuba' : 'comida para a cozinha'; return t.st < 1 ? `Indo ao armazém comprar ${what}` : `Comprando ${what} para ${nm}`; }
      const op = t.op ? A.get(t.op) : null; const s = t.do === 'cuba' ? stB(op) : stP(op);
      return s ? G.cap(s.name) : t.do === 'cuba' ? 'Trabalhando na cuba' : 'Cozinhando';
    }
    if (t.type === 'carga' && typeof t.to === 'string' && (t.to[0] === 'k' || t.to[0] === 'e') && t.to[1] === ':') { const c = v.carry; return `Levando ${c ? (c.k === 'wood' ? 'lenha' : c.k === 'mel' ? 'mel' : t.to[0] === 'e' ? 'grão' : 'comida') : 'a compra'} para a taverna`; }
    return text0(v, t);
  };

  // ------------------------------ the operations (and the god's body at the vat and at the fire) ------------------------------
  // (who may work the house's vat and fire with the body's own hands: the body that works at this tavern)
  const mayWork = (v, b) => !!(v && b && v.job === b.id && v.age >= 14 && G.Village.facOfSet(b.set) === G.Fac.idOfV(v) && !v.captive);
  function offers(kind, v, x, y, r) {
    const S = S_(); const out = [];
    for (const b of S.buildings.values()) {
      if (b.type !== 'taverna' || !b.built) continue; const at = G.Vg.door(b);
      if (G.dist(x, y, at[0], at[1]) > r + 1.5 || !mayWork(v, b) || (v.carry && v.carry.n > EPS)) continue;
      const L = kind === 'cuba' ? brews(b) : pots(b);
      for (const op of L) {
        const s = kind === 'cuba' ? stB(op) : stP(op); if (!s || s.kind !== 'mao') continue; const c = kind === 'cuba' ? canUnitB(op, v) : canUnitP(op, v);
        out.push({ id: (kind === 'cuba' ? 'brassagem' : 'panelada') + '.unidade:' + op.id, act: 'unidade', op: op.id, s: op.data.s, label: kind === 'cuba' ? BREW_DO[s.id] || s.name : POT_DO[s.id] || s.name, at, anim: s.anim, hands: 2, ok: c.ok, why: c.why || '' });
      }
      const f = G.Fac.ofV(v); if (!f) continue;
      if (kind === 'cuba' && v.role === 'cervejeiro') { const k = pickBrew(b, f); if (k && inFree(b, BREW[k]) >= BREW[k].min) out.push({ id: 'brassagem.comecar:' + b.id, act: 'comecar', b: b.id, k, label: `Começar uma brassagem de ${BREW[k].name}`, at, anim: 'apontar', hands: 0 }); }
      if (kind === 'panela' && v.role === 'cozinheiro' && canStartP(b) && D.free('k:' + b.id, 'food') >= 2) out.push({ id: 'panelada.comecar:' + b.id, act: 'comecar', b: b.id, label: 'Começar uma panelada', at, anim: 'apontar', hands: 0 });
    }
    return out;
  }
  const acts = (kind) => ({
    unidade: {
      deed: 'trabalho',
      can(v, o) { const op = A.get(o.op); if (!op || op.data.s !== o.s) return { ok: false, why: 'Já está em outra etapa.' }; return kind === 'cuba' ? canUnitB(op, v) : canUnitP(op, v); },
      begin(v, o) { const op = A.get(o.op); A.join(op, v, v.role); return { ok: true }; },
      run(v, o) { const op = A.get(o.op); return kind === 'cuba' ? unitB(op, v) : unitP(op, v); },
    },
    comecar: {
      can(v, o) { const b = S_().buildings.get(o.b); if (!b || v.job !== b.id) return { ok: false, why: 'Só quem trabalha aqui começa.' }; return (kind === 'cuba' ? canStartB(b) : canStartP(b)) ? { ok: true } : { ok: false, why: 'Já há uma que ainda pede mãos.' }; },
      run(v, o) { const b = S_().buildings.get(o.b); const op = kind === 'cuba' ? startB(b, o.k, v) : startP(b, v); if (!op) return { ok: false, why: 'Não deu para começar.' }; A.join(op, v, v.role); return { ok: true, msg: kind === 'cuba' ? `Você começa uma brassagem de ${BREW[o.k].name}.` : 'Você começa uma panelada.' }; },
    },
  });
  A.def('brassagem', {
    name: 'Brassagem', conserve: false, many: false,
    purpose: 'Fazer a cerveja da taverna na cuba, do grão que o cervejeiro comprou (o grão de molho, o malte, a mosturação na água quente, dois dias de fermentação, os jarros) — ou o hidromel do mel, onde o povo o bebe.',
    needs: 'uma taverna com cervejeiro, o grão (ou o mel) na tulha da casa, a lenha da mosturação',
    title(op) { const b = S_().buildings.get(op.at); const s = stB(op); const R = rxB(op); return `Brassagem de ${R ? R.name : 'cerveja'}${b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : ''}${s ? ` (${op.st === 'wait' ? 'parada' : s.name})` : ''}`; },
    tick: tickB,
    offers: (v, x, y, r) => offers('cuba', v, x, y, r),
    acts: acts('cuba'),
    onEnd(op) { if (op.data && op.st !== 'ok' && op.data.perdido > EPS) A.log(op, 'perdido', op.data.perdido); },
  });
  A.def('panelada', {
    name: 'Panelada', conserve: false, many: false,
    purpose: 'Cozinhar os pratos da taverna no fogo dela, com o que o cozinheiro comprou pela receita do povo, e pô-los na prateleira que o cardápio lê.',
    needs: 'uma taverna com cozinheiro, a comida na despensa da casa, a lenha do fogo',
    title(op) { const b = S_().buildings.get(op.at); const s = stP(op); return `Panelada${b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : ''}${s ? ` (${op.st === 'wait' ? 'parada' : s.name})` : ''}`; },
    tick: tickP,
    offers: (v, x, y, r) => offers('panela', v, x, y, r),
    acts: acts('panela'),
    onEnd(op) { if (op.data && op.st !== 'ok' && op.data.perdido > EPS) A.log(op, 'perdido', op.data.perdido); },
  });

  // ------------------------------ the keeper, the vat of before, the night's wish, the menu (the doors of act-taverna.js) ------------------------------
  // (with a brewer at the house and his batch in the vat, the keeper's own small vat — act-taverna.js — waits: one vat a house; with
  // no batch of the brewer under way — no grain to be had, the brewer away —, the keeper brews his small one as before)
  { const R = O.DEFS.taverna; if (R && R.pick) { const pick0 = R.pick; R.pick = function (b, f) { return TO.staff(b).cervejeiro && brews(b).length ? null : pick0.apply(this, arguments); }; } }
  // what the keeper still buys himself (act-taverna.js restockPick asks): with a cook, no food — the cook buys it, and cooks it; with a
  // brewer, no grain for the vat and no honey for the shelf where the house brews its mead
  // — while they keep it: the cook with dishes on the shelf or a pot on the fire, the brewer with a batch in the vat; a day they do
  // not (a feast, the cook away, the grain short), the keeper buys and serves as he always did, and the house is not left dry
  TO.keeperBuys = function (b, cands) {
    const s = TO.staff(b); if (!s.cozinheiro && !s.cervejeiro) return cands;
    const f = G.Fac.get(G.Village.facOfSet(b.set)); const bk = f ? TO.bebida(b, f) : null;
    const cooks = !!s.cozinheiro && (D.free('b:' + b.id, 'food') >= 2 - EPS || pots(b).some(op => { const st = stP(op); return !!st && st.kind !== 'busca'; }));
    const brewing = !!s.cervejeiro && brews(b).length > 0;
    return cands.filter(c => !(cooks && c.k === 'food') && !(brewing && bk === 'mel' && c.k === 'mel')).map(c => (brewing && c.k === 'food' && c.of ? Object.assign({}, c, { of: null }) : c));
  };
  // (the house of good beer pulls the night: the wish of who could go there, a little more — pure)
  const wish0 = T.wish;
  T.wish = function (v, b) { const w = wish0.apply(this, arguments); return TO.boa(b) ? Math.min(1, w + TO.PULL) : w; };
  // the line of the menu for what the house made itself (act-taverna.js cartaOf asks): the beer of its vat — of its grain, «das
  // melhores da cidade» when it is so —, the mead of its honey, the cook's dish by the recipe of the people; null: not the house's
  TO.desc = function (b, k, t) {
    if (!b) return null;
    if (k === 'cerveja' || k === 'mel') {
      const c = TO.casa(b, k); if (c.n < (T.DOSE[k] || 0.25) - EPS) return null; const best = TO.boa(b, k);
      if (k === 'mel') return `hidromel da casa, do mel fermentado na cuba${best ? ', dos melhores da cidade' : ''}`;
      const g = T.malte ? T.malte(b) : null; const nm = g && OR() && OR().FOOD[g] ? OR().FOOD[g].nome : '';
      return `cerveja ${nm ? 'de ' + nm + ' ' : ''}da casa${best ? ', das melhores da cidade' : ', feita pelo cervejeiro'}`;
    }
    if (k === 'food' && t) {
      const P = b.prato; const n = P && P[t] ? Math.min(P[t], OR() ? OR().amount('b:' + b.id, 'food', t) : 0) : 0; if (n < 1 - EPS) return null;
      const f = G.Fac.get(G.Village.facOfSet(b.set)); const L = TO.PRATO[(f && f.civ) || 'classico'] || TO.PRATO.classico; const nm = L[t] || TO.PRATO.classico[t];
      return nm ? `${nm}, da cozinha da casa` : null;
    }
    return null;
  };

  // ------------------------------ the panel ------------------------------
  const html0 = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = html0(b, plink, esc);
    if (b.type !== 'taverna' || !b.built) return h;
    const s = TO.staff(b); const n = 1 + (s.cozinheiro ? 1 : 0) + (s.cervejeiro ? 1 : 0); const w = TO.want(b);
    h = h.replace(/Trabalham aqui \((\d+)\/1\)/, (m, a) => `Trabalham aqui (${a}/${1 + w.cozinheiro + w.cervejeiro})`);
    const who = []; if (s.cozinheiro) who.push(`${s.cozinheiro.g === 'f' ? 'a cozinheira' : 'o cozinheiro'} ${plink(s.cozinheiro.id)}`); if (s.cervejeiro) who.push(`${s.cervejeiro.g === 'f' ? 'a cervejeira' : 'o cervejeiro'} ${plink(s.cervejeiro.id)}`);
    if (n > 1) h += `<div class="doing">A casa: ${who.join(', ')}.</div>`;
    const L = [];
    for (const op of brews(b)) { const sd = stB(op); const R = rxB(op); const pct = sd && sd.kind === 'espera' ? ` ${Math.round(op.data.t / sd.wait * 100)}%` : ''; L.push(`${esc(R.name)}: ${op.st === 'wait' ? 'parada' : esc(sd ? sd.name : '')}${pct}`); }
    for (const op of pots(b)) { const sd = stP(op); L.push(`panela de ${op.data.n}: ${op.st === 'wait' ? 'parada' : esc(sd ? sd.name : '')}`); }
    if (L.length) h += `<div class="doing">Na cuba e no fogo: ${L.join(' · ')}</div>`;
    const ds = D.list('k:' + b.id), tl = D.list('e:' + b.id); const pr = []; for (const [k, q] of Object.entries(Object.assign({}, ds))) if (q >= 1) pr.push(`${Math.floor(q)} de ${k === 'food' ? 'comida' : esc(E.name(k))} na despensa`); for (const [k, q] of Object.entries(tl)) if (q >= 1) pr.push(`${Math.floor(q)} de ${k === 'food' ? 'grão' : esc(E.name(k))} na tulha`);
    if (pr.length) h += `<div class="doing">${pr.join(', ')}.</div>`;
    const c = TO.casa(b, 'cerveja'); if (c.n >= 1) h += `<div class="doing">Cerveja da casa na prateleira: ${Math.floor(c.n)} ${Math.floor(c.n) === 1 ? 'jarra' : 'jarras'}${TO.boa(b) ? ', das melhores da cidade' : ''}.</div>`;
    const o = b.tvo; if (o && o.conta && coin(b) && (o.conta.venda || o.conta.compras || o.conta.soldos)) h += `<div class="doing">Ontem: vendeu ${esc(String(o.conta.venda).replace('.', ','))}, comprou ${esc(String(o.conta.compras).replace('.', ','))}${o.conta.soldos ? `, pagou ${esc(String(o.conta.soldos).replace('.', ','))} de soldo` : ''}${o.conta.frete ? ` e ${esc(String(o.conta.frete).replace('.', ','))} de frete` : ''}.</div>`;
    return h;
  };

  // ------------------------------ the save and the checker's round trip ------------------------------
  // (the house's memory, its pantries and its record of what it made, as they were — a damaged one mended, never trusted; the batches
  // and the pots are operations of the world (S.acts), their reservations with them; the errands are not saved: the house's people
  // take up the next step from what is confirmed. The load decides nothing: L-419)
  const num = x => Number.isFinite(x) ? x : 0;
  const cleanL = (M, ok) => { const out = {}; if (M && typeof M === 'object' && !Array.isArray(M)) for (const k of Object.keys(M)) if (Number.isFinite(M[k]) && M[k] > EPS && ok(k)) out[k] = r4(M[k]); return out; };
  (G.saveHooks = G.saveHooks || []).push({ save() {}, load() {
    const S = S_();
    for (const b of S.buildings.values()) {
      if (b.type !== 'taverna') { delete b.tvo; delete b.despensa; delete b.tulha; delete b.adega; delete b.prato; continue; }
      if (b.tvo !== undefined) { const o = b.tvo && typeof b.tvo === 'object' ? b.tvo : {}; const h = o.hoje && typeof o.hoje === 'object' ? o.hoje : {};
        b.tvo = { n: Math.max(0, Math.min(99, num(o.n) | 0)), ref: Math.max(0, num(o.ref)), rb: Math.max(0, num(o.rb)), rl: Math.max(0, num(o.rl)), sc: Math.max(0, Math.min(1, num(o.sc))), sb: Math.max(0, Math.min(1, num(o.sb))), ck: o.ck ? 1 : 0, cv: o.cv ? 1 : 0, dev: Math.max(0, num(o.dev) | 0), pausa: Math.max(0, num(o.pausa) | 0), fecha: Math.max(0, num(o.fecha) | 0), hoje: { g: Math.max(0, num(h.g)), sc: Math.max(0, num(h.sc)), sb: Math.max(0, num(h.sb)), sd: Math.max(0, num(h.sd)), cp: Math.max(0, num(h.cp)), fr: Math.max(0, num(h.fr)) }, why: typeof o.why === 'string' ? o.why : null, fretes: Math.max(0, num(o.fretes) | 0) };
        if (o.conta && typeof o.conta === 'object') b.tvo.conta = { dia: num(o.conta.dia) | 0, venda: num(o.conta.venda), compras: num(o.conta.compras), soldos: num(o.conta.soldos), frete: num(o.conta.frete) }; }
      if (b.despensa !== undefined) b.despensa = cleanL(b.despensa, k => k !== 'moedas');
      if (b.tulha !== undefined) b.tulha = cleanL(b.tulha, k => k !== 'moedas');
      if (b.prato !== undefined) b.prato = cleanL(b.prato, k => !!(OR() && OR().FOOD[k]));
      if (b.adega !== undefined) { const M = b.adega && typeof b.adega === 'object' ? b.adega : {}; b.adega = {}; for (const k of ['cerveja', 'mel']) { const a = M[k]; if (a && Number.isFinite(a.n) && a.n > EPS) b.adega[k] = { n: r4(a.n), q: Math.max(0, Math.min(1, num(a.q))) }; } }
    }
    for (const op of A.all()) {
      if ((op.def !== 'brassagem' && op.def !== 'panelada') || !live(op)) continue; const d = op.data || (op.data = {});
      for (const k of ['s', 't', 'got', 'u', 'molho', 'mosto', 'feito', 'azedas', 'usado', 'lenha', 'qual', 'panela', 'n']) if (d[k] !== undefined && !Number.isFinite(d[k])) d[k] = 0;
      if (op.def === 'brassagem' && (!d.de || typeof d.de !== 'object')) d.de = {};
    }
    stIdx = null;
  } });
  A.hooks.canon.push(['tavcadeia', () => {
    const S = S_(); const out = [];
    for (const b of S.buildings.values()) if (b.type === 'taverna' && (b.tvo || b.despensa || b.tulha || b.adega)) out.push([b.id, b.tvo ? [b.tvo.n, b.tvo.ck, b.tvo.cv, b.tvo.dev, r2(b.tvo.ref), r2(b.tvo.rb)] : 0, JSON.stringify(b.despensa || {}), JSON.stringify(b.tulha || {}), JSON.stringify(b.adega || {})]);
    for (const op of A.all()) if ((op.def === 'brassagem' || op.def === 'panelada') && live(op)) out.push([op.id, op.def, op.at, op.data.s, r2(op.data.got), r2(op.data.molho || 0), r2(op.data.mosto || 0), r2(op.data.panela || 0), r2(op.data.feito), r2(op.data.t)]);
    return out;
  }]);
})(window.G);
