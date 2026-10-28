'use strict';
// ============================================================
//  Um teto para chamar de meu (a atividade 01 do pedido). A casa tem
//  dono — quem a comprou, a levantou ou a herdou; a casa que fica sem
//  herdeiro volta ao povo. A família que precisa de casa (na rua, no
//  barraco, o casal que mora com os pais numa casa cheia, gente demais
//  para as camas, quem paga aluguel) põe isso no diário, junta moeda —
//  e deixa de comprar luxo enquanto junta — e, quando pode, compra a
//  casa vazia que o povo tem, aluga a que o dono deixou vazia ou paga
//  os materiais de uma casa nova: o lugar e a altura quem diz é a
//  cidade (G.Urban), quem levanta são os construtores do povo. Pronta
//  a casa, a família muda com o que é seu, pelo livro-razão. Quem mora
//  na casa de um dono que vive noutra paga-lhe aluguel. Num povo sem
//  moeda, a família pede ao povo, que levanta com o que tem no
//  armazém. Quem morre deixa a casa ao companheiro, ao filho mais
//  velho, a quem ficar nela — ou ao povo.
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco; if (!A || !D || !E) return;
  const K = G.Casa = {};
  const EPS = 1e-6;
  const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  const built = b => housing(b) && b.built && b.type !== 'ruin';
  const P = id => (id && G.S.villagers.get(id)) || null;
  const r2 = x => Math.round(x * 100) / 100;
  const bio = (v, third, first) => G.Life && G.Life.bio(v, 'note', third, first);
  const coinPeople = set => E.coinage(set.fac);
  const NOTE = { src: 'casa' }; // (where a line of the diary came from: the house — the diary's page says it)
  K.MAX_WAIT = 3;   // days a family waits for a house it paid for before the people give it back the coins
  K.RENT = 0.04;    // the rent of a day (a year of the people's calendar), of what the house would cost
  K.OWE_DAYS = 5;   // days of rent owed before the owner gives the house up to the people

  // ------------------------------ who owns a house ------------------------------
  // b.dono: the owner's id; 0 = the people's. A house of an older world (or one the planner filled) gets its owner the day
  // the world first looks: the eldest grown person living in it — the founders' houses are their families'
  K.owner = b => (built(b) ? b.dono || 0 : 0);
  const residents = b => { const out = []; for (const v of G.S.villagers.values()) if (v.home === b.id && !v.captive) out.push(v); return out; };
  // (how many live in each house, counted once for a decision)
  const occupancy = () => { const m = new Map(); for (const v of G.S.villagers.values()) if (v.home && !v.captive) m.set(v.home, (m.get(v.home) || 0) + 1); return m; };
  function settleOwner(b, L) {
    if (b.dono && P(b.dono)) return;
    const grown = (L || residents(b)).filter(v => v.age >= 16).sort((a, c) => c.age - a.age || a.id - c.id);
    b.dono = grown.length ? grown[0].id : 0;
  }
  // the heir of a house: the partner, the eldest living child (wherever they live), or — when the owner lived in it — the
  // eldest who lives in it; else the people
  const kin = (o, v) => v.id === o.id || v.id === o.partner || v.mother === o.id || v.father === o.id || o.mother === v.id || o.father === v.id || (!!o.mother && v.mother === o.mother) || (!!o.father && v.father === o.father);
  function heirOf(b, dead) {
    const ok = o => o && o.id !== dead.id && !o.captive && o.age >= 16;
    const p = P(dead.partner); if (ok(p)) return p;
    const kids = (dead.kids || []).map(P).filter(ok).sort((a, c) => c.age - a.age || a.id - c.id); if (kids.length) return kids[0];
    if (dead.home !== b.id) return null;
    const L = residents(b).filter(ok).sort((a, c) => c.age - a.age || a.id - c.id); return L[0] || null;
  }
  // a house is let when its owner lives elsewhere and no one of the owner's family lives in it: its household pays rent
  // (b.aluga, kept by the town's day — the mark that the household pays)
  K.landlord = b => { const o = built(b) && b.dono ? P(b.dono) : null; return o && o.home !== b.id ? o : null; };
  K.tenant = (v, h) => { if (!h || !h.aluga) return null; const o = K.landlord(h); return o && !kin(o, v) ? o : null; };

  // ------------------------------ who needs a house, and how much it costs ------------------------------
  // (the head of a family: a grown person; the reason, or null)
  const need0 = function (v) {
    if (!v || v.age < 18 || v.captive || v.jail || v.aboard) return null;
    const S = G.S; if (!v.home) return v.rua ? 'rua' : null;
    const h = S.buildings.get(v.home); if (!built(h)) return null;
    if (h.type === 'barraco') return 'barraco';
    const cap = G.BDEF[h.type].housing, res = h.res || 0;
    const p = P(v.partner);
    if (p && p.home === v.home && h.dono !== v.id && h.dono !== p.id && res >= cap) return 'casal';
    if (res > cap) return 'lotada';
    if (K.tenant(v, h)) return 'aluga';
    return null;
  };
  // (a house full, or too full, is left by the others first: its owner and the old one who minds its little ones there — with
  // their partners — stay; the owner's family leaves only when it is the one that does not fit the house, D-098)
  K.need = function (v) {
    const w = need0(v); if (w !== 'lotada' && w !== 'casal') return w;
    const h = G.S.buildings.get(v.home); const p = P(v.partner); const here = !!p && p.home === v.home;
    const keep = h.dono === v.id || (here && h.dono === p.id) || K.minds(v) || (here && K.minds(p));
    return keep && K.family(v).length <= G.BDEF[h.type].housing ? null : w;
  };
  K.minds = o => !!(G.Lar && G.Lar.minder && G.Lar.minder(o)); // (the old one of the house who minds its little ones, act-lar.js)
  const WHY = { rua: 'sem teto', barraco: 'num barraco', casal: 'na casa de outros, cheia', lotada: 'gente demais para as camas', aluga: 'de aluguel' };
  const URGENT = { rua: 0, barraco: 1, lotada: 2, casal: 3, aluga: 4 };
  // the family that would move: the person, the partner, the children under sixteen living with them
  K.family = function (v) {
    const out = [v]; const p = P(v.partner); if (p && p.home === v.home && !p.captive) out.push(p);
    for (const id of v.kids || []) { const k = P(id); if (k && k.age < 16 && k.home === v.home && !k.captive && !out.includes(k)) out.push(k); }
    return out;
  };
  // the house a family would raise: tall where the people build tall (the city lowers it on cheap ground), else a house
  // of stone where there is a workshop, else a hut
  function wantType(set) {
    if ((set.tier || 0) >= 2 && G.Civ.has(set.fac, 'alvenaria')) return 'sobrado';
    for (const b of G.S.buildings.values()) if (b.set === set.id && b.type === 'workshop' && b.built) return 'house';
    return 'hut';
  }
  // a house paid by the family: its materials at the town's prices, and the land it stands on (the city's value there)
  K.price = function (set, type, pos) {
    const def = G.BDEF[type || 'house']; let n = 0;
    for (const k in def.cost) n += (def.cost[k] || 0) * (E.PRICE[k] || 0.3);
    const at = pos ? [pos[0] + def.w / 2, pos[1] + def.h / 2] : [set.cx, set.cy];
    const land = G.Urban && G.Urban.valueAt && (set.tier || 0) >= 2 ? G.Urban.valueAt(set, at[0], at[1]) * 0.12 : 2;
    return r2(n + land);
  };
  K.rentOf = (set, type) => Math.max(0.5, r2(K.price(set, type) * K.RENT));
  const homeRef = v => (v.home && built(G.S.buildings.get(v.home)) ? 'h:' + v.home : null);
  // what the family has to pay with (the coins of the house it lives in — the household's — or the purse in the street)
  K.savings = v => { const r = homeRef(v); return r ? D.get(r, 'moedas') : v.purse || 0; };

  // ------------------------------ the day of each town ------------------------------
  // once a day per town, in the world's step: owners settled, the rents paid, the families in need looked at — saving,
  // buying, renting, raising
  let cur = 0, lastDay = -1, tAcc = 0;
  G.worldHooks.push(() => { cur = 0; lastDay = -1; tAcc = 0; });
  A.hooks.tick.push(function (step) {
    const S = G.S; if (S.day !== lastDay) { lastDay = S.day; cur = 0; }
    tAcc += step || 1; if (tAcc + 1e-9 < 2) return; tAcc = 0; // (every other second of the world: a town)
    const sets = [...S.settlements.values()].sort((a, b) => a.id - b.id); if (cur >= sets.length) return;
    day(sets[cur++]);
  });
  // (K.day: the day of one town, as the world's step runs it — the scenario's hand calls it at once)
  K.day = set => day(set);
  function day(set) {
    const S = G.S; const res = new Map();
    for (const v of S.villagers.values()) if (v.set === set.id && v.home && !v.captive) { const l = res.get(v.home); if (l) l.push(v); else res.set(v.home, [v]); }
    const homes = []; for (const b of S.buildings.values()) if (b.set === set.id && housing(b)) homes.push(b);
    for (const b of homes) if (built(b)) { settleOwner(b, res.get(b.id) || []); rent(b, set, res.get(b.id) || []); }
    // a house paid for and not built: after a few days with no hands for it, the people give back what the family paid
    for (const b of homes) if (b.encomenda && !b.built && S.day - b.encomenda.d > K.MAX_WAIT && !b.progress) refund(b, set);
    // the families in need, the most urgent first (one decision a day per town — the dear ground of a city moves slowly)
    for (const [v] of K.queue(set)) { if (A.isBody(v)) continue; const r = K.order(v); if (r.ok) break; }
  }
  // the families in need of a town, in the order the day asks them: [head, why], the most urgent first. Of a house too many
  // for its beds, or full with a couple of others, only its youngest family — its eldest grown one's age —: the old ones of
  // the house wait for the young to go (D-098); the house is as urgent as its most urgent family. Reads only
  K.queue = function (set) {
    const S = G.S; const heads = []; const seen = new Set();
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || seen.has(v.id)) continue; const why = K.need(v); if (!why) continue;
      for (const m of K.family(v)) seen.add(m.id); heads.push([v, why]);
    }
    const eldest = v => Math.max(v.age, ...K.family(v).filter(m => m.age >= 16).map(m => m.age));
    const asked = []; const byHouse = new Map();
    for (const e of heads) { if (e[1] !== 'lotada' && e[1] !== 'casal') { asked.push(e); continue; } const l = byHouse.get(e[0].home); if (l) l.push(e); else byHouse.set(e[0].home, [e]); }
    for (const l of byHouse.values()) { l.sort((a, b) => eldest(a[0]) - eldest(b[0]) || a[0].id - b[0].id); asked.push([l[0][0], l.some(e => e[1] === 'lotada') ? 'lotada' : 'casal']); }
    return asked.sort((a, b) => URGENT[a[1]] - URGENT[b[1]] || a[0].id - b[0].id);
  };
  // the family's decision, now: the people's empty house if there is one with beds for them (bought — or given, in a
  // people without coin), else a new one raised; short of coin, an empty house its owner lets, rented — or saving for it.
  // The god's body decides by the same rule
  K.order = function (v, o) {
    const S = G.S; const why = K.need(v); if (!why) return { ok: false, why: 'A família tem onde morar.' };
    const set = S.settlements.get(v.set); if (!set) return { ok: false, why: '' };
    if (K.waiting(v)) return { ok: false, why: 'A casa da família já está sendo levantada.' };
    // (a family that let the new house go, for now — the diary's choice: any of its grown ones —, is not asked again for a few
    // days, D-061)
    if (K.gaveUp(v)) return { ok: false, why: 'A família deixou a casa nova para depois.' };
    const r = homeRef(v); const h = r && S.buildings.get(+r.slice(2));
    const fam = K.family(v); const occ = occupancy();
    const plan = K.plan(v, fam, set, occ, why);
    const keep = o && o.now ? 0 : 2; // (a family keeps a little for itself; the god's body decides for it)
    const coin = coinPeople(set), has = K.savings(v);
    if (coin && has + EPS < plan.price + keep) {
      // short of coin for a roof of its own: an empty house its owner lets, rented — three days of rent in hand
      if (plan.lease && has + EPS >= plan.rent * 3) { lease(v, fam, plan.lease, set, plan.rent, why); return { ok: true, b: plan.lease, rented: 1, rent: plan.rent }; }
      if (h) h.poupa = { by: v.id, alvo: r2(plan.price + keep), d: h.poupa && h.poupa.by === v.id ? h.poupa.d : S.day, why };
      return { ok: false, why: `Falta dinheiro: uma casa custa ${plan.price} moedas e a família tem ${Math.floor(has)}.`, saving: 1 };
    }
    if (plan.free) { const ok = buy(v, fam, plan.free, set, plan.price, why); if (ok && h) h.poupa = null; return ok ? { ok: true, b: plan.free, bought: 1, price: plan.price } : { ok: false, why: 'A compra não deu.' }; }
    const open = [...S.buildings.values()].filter(b => b.set === set.id && b.encomenda && !b.built).length;
    if (open >= 2) return { ok: false, why: 'Os construtores do povo já têm casas demais para levantar agora.' };
    if (!coin) { const f = G.Fac.get(set.fac); const def = G.BDEF[plan.type]; if (!f || Object.keys(def.cost).some(k => (f.stock[k] || 0) < def.cost[k] * 1.5)) return { ok: false, why: 'O povo não tem madeira e pedra que cheguem para uma casa agora.' }; }
    const b = raise(v, fam, set, plan.type, why); if (b && h) h.poupa = null;
    return b ? { ok: true, b, price: b.encomenda ? b.encomenda.paid : 0 } : { ok: false, why: 'A cidade não achou lugar para mais uma casa agora.' };
  };
  // what is open to a family now (read only): the people's empty house, the price of a new one, a house to rent
  K.plan = function (v, fam, set, occ, why) {
    const S = G.S; occ = occ || occupancy(); fam = fam || K.family(v);
    const fits = b => b.set === set.id && built(b) && b.type !== 'barraco' && !occ.get(b.id) && G.BDEF[b.type].housing >= fam.length && b.id !== v.home;
    let free = null, let_ = null, letR = 0;
    for (const b of S.buildings.values()) {
      if (!fits(b)) continue;
      if (!b.dono) { if (!free || b.id < free.id) free = b; }
      // (of the houses to let, the one of the lowest rent — the family short of coin rents what it can pay —, then the first:
      // L-312)
      else if (K.landlord(b) && !kin(K.landlord(b), v) && coinPeople(set) && (why || K.need(v)) !== 'aluga') { const rb = K.rentOf(set, b.type); if (!let_ || rb < letR - EPS || (Math.abs(rb - letR) <= EPS && b.id < let_.id)) { let_ = b; letR = rb; } }
    }
    const type = free ? free.type : wantType(set);
    const price = free ? r2(K.price(set, free.type, [free.x, free.y]) * 0.8) : K.price(set, type);
    return { free, type, price, lease: let_, rent: let_ ? K.rentOf(set, let_.type) : 0 };
  };
  // (the family's house, still being raised)
  K.waiting = v => { for (const b of G.S.buildings.values()) if (b.encomenda && !b.built && b.encomenda.fam.includes(v.id)) return b; return null; };

  // ------------------------------ buying, renting, raising, moving ------------------------------
  // the coins of the household to the people's treasury, in the ledger (the house was the people's)
  function pay(v, set, price, code) {
    if (!coinPeople(set) || !(price > EPS)) return true;
    const from = homeRef(v) || 'p:' + v.id; const r = D.move(from, 'f:' + set.fac, 'moedas', price, { code, by: v.id });
    return r.ok;
  }
  const art = nm => (G.gen(nm) === 'a' ? 'uma' : 'um');
  function buy(v, fam, b, set, price, why) {
    if (!pay(v, set, price, 'compra-casa')) return false;
    b.dono = v.id; move(fam, b, 'comprou');
    const nm = G.Village.buildName(b).toLowerCase();
    bio(v, `Comprou ${art(nm)} ${nm} do povo${coinPeople(set) ? ' por ' + price + ' moedas' : ''} e se mudou com a família (${WHY[why]}).`, `Compramos ${art(nm)} ${nm} e nos mudamos — enfim um teto nosso`);
    A.note(v, 'memory', `Compramos uma casa: ${nm}.`, NOTE);
    return true;
  }
  // a house its owner left empty, rented: the family moves in; the rent goes each day to the owner's household
  function lease(v, fam, b, set, rent, why) {
    const o = K.landlord(b);
    move(fam, b, 'alugou');
    b.aluga = { d: G.S.day, pago: G.S.day, deve: 0, por: v.id };
    const nm = G.Village.buildName(b).toLowerCase();
    bio(v, `Alugou ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} de ${o.name}, por ${rent} moedas ao ano, e se mudou com a família (${WHY[why]}).`, `Alugamos ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} de ${o.name} — um teto, mesmo que não seja nosso`);
    A.note(v, 'memory', `Alugamos a casa de ${o.name}: ${rent} moedas ao ano.`, NOTE);
    A.note(o, 'memory', `Aluguei a minha casa vazia a ${v.name}.`, NOTE);
  }
  // the rent of a day, paid by the household of a let house to the owner's, in the ledger ('aluguel'): what it cannot pay
  // is owed, and paid first when there is coin; too much owed and the owner gives the house up — the people buy it
  function rent(b, set, L) {
    const S = G.S; const o = K.landlord(b);
    if (!o || !L.length || !coinPeople(set) || L.some(v => kin(o, v))) { if (b.aluga) b.aluga = null; return; }
    const a = b.aluga || (b.aluga = { d: S.day, pago: S.day, deve: 0, por: (L.find(v => v.age >= 16) || L[0]).id });
    if (a.pago >= S.day) return;
    const per = K.rentOf(set, b.type); const due = r2(per * (S.day - a.pago) + (a.deve || 0));
    const head = L.filter(v => v.age >= 16).sort((x, y) => y.age - x.age || x.id - y.id)[0] || L[0];
    const to = o.home && built(S.buildings.get(o.home)) ? 'h:' + o.home : 'p:' + o.id;
    const n = r2(Math.min(due, D.get('h:' + b.id, 'moedas')));
    if (n > EPS) D.move('h:' + b.id, to, 'moedas', n, { code: 'aluguel', by: head.id });
    a.deve = r2(Math.max(0, due - n)); a.pago = S.day;
    if (a.deve > EPS && a.deve + EPS >= per * K.OWE_DAYS) {
      // (the owner gives up: the people buy the house, for what they can pay of half its worth; the debt goes with it)
      const f = 'f:' + set.fac; const worth = r2(Math.min(K.price(set, b.type) * 0.5, D.get(f, 'moedas')));
      if (worth > EPS) D.move(f, to, 'moedas', worth, { code: 'venda-casa', by: o.id });
      A.note(o, 'memory', `${head.name} não pagava o aluguel: vendi a casa ao povo${worth > EPS ? ` por ${worth} moedas` : ''}.`, NOTE);
      for (const m of L) if (m.age >= 16) A.note(m, 'memory', `Devíamos o aluguel a ${o.name}: a casa passou ao povo.`, NOTE);
      b.dono = 0; b.aluga = null;
    }
  }
  // a new house: the city says where it goes and how tall; the people's builders raise it; the family paid the materials
  function raise(v, fam, set, want, why) {
    // (the city says where: the planner's own ground for a house — never over others' houses — and how tall: on dear
    // ground it builds tall, and the family pays what that building costs there, or waits and saves more)
    const pos = G.Village.findSite(set, want); if (!pos || pos.demolish) return false;
    const type = G.Urban && G.Urban.homeFor ? G.Urban.homeFor(set, want, pos) : want;
    const price = K.price(set, type, pos);
    const h = homeRef(v) && G.S.buildings.get(v.home);
    if (coinPeople(set) && K.savings(v) + EPS < price) { if (h) h.poupa = { by: v.id, alvo: r2(price + 2), d: G.S.day, why }; return false; }
    const b = G.Village.startProject(set, type, pos); if (!b) return false;
    // (the coins are set aside in the site itself, in the ledger: the people are paid when the house stands, and a work that
    // never stands gives them back whole — the treasury may have spent its own meanwhile)
    if (coinPeople(set) && !D.move(homeRef(v) || 'p:' + v.id, 'h:' + b.id, 'moedas', price, { code: 'obra-casa', by: v.id }).ok) { G.Village.removeBuilding(b); return false; }
    b.dono = v.id; b.encomenda = { fam: fam.map(m => m.id), d: G.S.day, paid: coinPeople(set) ? price : 0, by: v.id, why, fac: set.fac };
    const nm = G.Village.buildName(b).toLowerCase().replace(/ \(obra\)$/, '');
    bio(v, `${coinPeople(set) ? `Pagou ${price} moedas pelos materiais de` : 'Pediu ao povo'} ${art(nm)} ${nm} para a família (${WHY[why]}); os construtores começaram a obra.`, `${coinPeople(set) ? 'Juntamos o bastante e pagamos' : 'O povo nos deu'} a madeira e a pedra de uma casa nossa`);
    A.note(v, 'memory', coinPeople(set) ? `Pagamos ${price} moedas pelos materiais da nossa casa.` : 'O povo vai levantar a nossa casa.', NOTE);
    return b;
  }
  // a commission that never started (no hands, no ground): the coins come back to the household that paid, in the ledger
  function refund(b, set) {
    const o = b.encomenda; const v = P(o.by) || o.fam.map(P).find(Boolean);
    const kept = D.get('h:' + b.id, 'moedas');
    if (kept > EPS) { const to = v ? homeRef(v) || 'p:' + v.id : 'f:' + set.fac; D.move('h:' + b.id, to, 'moedas', kept, { code: 'obra-devolvida', by: v ? v.id : 0, part: true }); }
    if (v) A.note(v, 'memory', 'A obra da nossa casa nunca começou: as moedas voltaram para nós.', NOTE);
    b.encomenda = null; b.dono = 0;
    if (!b.progress) G.Village.removeBuilding(b);
  }
  // moving: the family's people to the new house, and what is theirs with them — all of it when the whole household goes,
  // its share of the pantry, the goods and the coins when it leaves others behind (the house's pot is everyone's in it):
  // what the new furniture has no room for comes too, on the floor (D-059: the house left behind would give it to the
  // people). Then the family puts its things in order (the note; the house's own furniture is the interiors')
  function move(fam, b, how) {
    const S = G.S; const from = fam[0].home && S.buildings.get(fam[0].home);
    const left = from && built(from) ? residents(from).filter(v => !fam.includes(v)) : [];
    const brought = [];
    if (from && built(from) && from.id !== b.id) {
      const share = left.length ? fam.length / (fam.length + left.length) : 1;
      for (const [k, n] of Object.entries(D.list('h:' + from.id))) {
        const q = r2(n * share); if (q > EPS) { const r = D.move('h:' + from.id, 'h:' + b.id, k, q, { code: 'mudança', by: fam[0].id, part: true, floor: true }); if (r.ok && r.n > EPS) brought.push(`${Math.round(r.n * 10) / 10} de ${E.name(k)}`); }
      }
      if (!left.length && from.type === 'barraco') from.empty = 2; // (the shack left behind falls down)
      if (from.aluga && !left.length) from.aluga = null;
      from.res = Math.max(0, (from.res || 0) - fam.length);
    }
    for (const m of fam) { m.home = b.id; m.hhType = b.type; m.rua = 0; m.ruaWhy = null; }
    b.res = (b.res || 0) + fam.length;
    const said = { comprou: 'comprou uma casa e se mudou', alugou: 'alugou uma casa e se mudou', levantou: 'mudou para a casa que levantou' }[how];
    (fam[0].moves || (fam[0].moves = [])).push([S.day, said]); if (fam[0].moves.length > 6) fam[0].moves.shift();
    A.note(fam[0], 'memory', `Arrumamos a casa nova${brought.length ? ': trouxemos ' + brought.slice(0, 4).join(', ') : ''}.`, NOTE);
  }
  // a site paid for that is lost before it stands (a fire, a war, the sea, a site nobody reaches, a town left): the people
  // give back what was not yet built of it, in the ledger
  function lost(b, how) {
    const o = b.encomenda; if (!o || b.built) return; b.encomenda = null; b.dono = 0;
    const v = P(o.by) || o.fam.map(P).find(Boolean); const fac = o.fac || G.Village.facOfSet(b.set);
    // (what was raised of it is the people's — their wood, their stone, their hands —; the rest of the coins set aside goes
    // back to the family; with no family left, all to the people)
    const kept = D.get('h:' + b.id, 'moedas'); const done = r2(kept * G.clamp(b.progress || 0, 0, 1)); const back = r2(kept - done);
    if (done > EPS && D.exists('f:' + fac)) D.move('h:' + b.id, 'f:' + fac, 'moedas', done, { code: 'obra-casa', by: v ? v.id : 0, part: true });
    if (back > EPS) D.move('h:' + b.id, v ? homeRef(v) || 'p:' + v.id : 'f:' + fac, 'moedas', back, { code: 'obra-devolvida', by: v ? v.id : 0, part: true });
    if (v) A.note(v, 'memory', `A obra da nossa casa se perdeu (${how})${back > EPS ? `: ${back} moedas voltaram para nós` : ''}.`, NOTE);
  }
  const remove0 = G.Village.removeBuilding;
  G.Village.removeBuilding = function (b) { if (b && b.encomenda) lost(b, 'o lugar foi desfeito'); return remove0.apply(this, arguments); };
  const destroy0 = G.Village.destroyBuilding;
  G.Village.destroyBuilding = function (b, cause) { if (b && b.encomenda && !b.built) lost(b, cause === 'fire' ? 'o fogo a levou' : 'foi destruída'); return destroy0.apply(this, arguments); };
  // a house raised for a family is finished: they move in (the ones still alive and still of the town)
  const complete0 = G.Village.completeBuilding;
  G.Village.completeBuilding = function (b) {
    const r = complete0.apply(this, arguments);
    const o = b && b.encomenda; if (!o) return r;
    b.encomenda = null;
    // (the house stands: the coins set aside go to the people who gave the materials and the hands)
    const kept = D.get('h:' + b.id, 'moedas'); const fac = o.fac || G.Village.facOfSet(b.set);
    if (kept > EPS && D.exists('f:' + fac)) D.move('h:' + b.id, 'f:' + fac, 'moedas', kept, { code: 'obra-casa', by: o.by || 0, part: true });
    const fam = o.fam.map(P).filter(v => v && !v.captive && v.set === b.set);
    if (!fam.length) { b.dono = 0; return r; }
    if (!P(b.dono)) b.dono = fam[0].id;
    move(fam, b, 'levantou');
    const v = fam[0]; const nm = G.Village.buildName(b).toLowerCase();
    bio(v, `Mudou-se com a família para ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} que mandou levantar.`, `Nos mudamos para a nossa casa — levantada com o que juntamos`);
    for (const m of fam) A.note(m, 'memory', `Mudamos para a nossa casa nova.`, NOTE);
    return r;
  };

  // ------------------------------ the god's body: the same decision, taken by the player ------------------------------
  // (read only: what the decision would say now — for the offer the body sees)
  K.can = function (v) {
    const S = G.S; const why = K.need(v); if (!why) return { ok: false, why: 'A família tem onde morar.' };
    const set = S.settlements.get(v.set); if (!set) return { ok: false, why: '' };
    if (K.waiting(v)) return { ok: false, why: 'A casa da família já está sendo levantada.' };
    { const d = K.gaveUp(v); if (d) return { ok: false, why: `A família deixou a casa nova para depois: volta a pensar nisso no dia ${d}.` }; }
    const plan = K.plan(v, null, set, null, why); const has = K.savings(v);
    if (coinPeople(set) && has + EPS < plan.price) {
      if (plan.lease && has + EPS >= plan.rent * 3) return { ok: true, price: plan.price, rent: plan.rent, lease: plan.lease, why };
      return { ok: false, why: `Falta dinheiro: uma casa custa uns ${Math.ceil(plan.price)} moedas e a família tem ${Math.floor(has)}.`, price: plan.price };
    }
    return { ok: true, price: plan.price, free: plan.free, why };
  };
  // ------------------------------ the new house let go, for now (D-061) ------------------------------
  // The family changes its mind: it stops saving for a house of its own and is not asked again for K.DROP_DAYS days — the
  // whole family: the note, with the day, goes into the diary of each grown one, and the plan reads any of them (K.order);
  // then the need comes back as a goal, and one may change one's mind again. Only in the world's step: the body asks it with
  // its hands (Possess.apply), from the diary's page
  K.DROP_DAYS = 3;
  const DROP = 'Deixamos a casa nova para depois.';
  // (the day the family's letting go ends — until then it is not asked —; 0 when it has not let it go)
  K.gaveUp = function (v) {
    const S = G.S; let until = 0; if (!v) return 0;
    for (const m of K.family(v)) for (const e of m.diary || []) if (e.src === 'casa' && e.dropped !== undefined && S.day - e.dropped < K.DROP_DAYS) until = Math.max(until, e.dropped + K.DROP_DAYS);
    return until;
  };
  K.giveUp = function (v) {
    const S = G.S; if (!v || !K.need(v)) return { ok: false, why: 'A família tem onde morar.' };
    if (K.waiting(v)) return { ok: false, why: 'A casa nova já está sendo levantada.' };
    if (K.gaveUp(v)) return { ok: false, why: 'A família já deixou a casa nova para depois.' };
    const fam = K.family(v);
    // (the saving stops — the household keeps its coins: nothing was paid, nothing is lost)
    const r = homeRef(v); const h = r && S.buildings.get(+r.slice(2)); if (h && h.poupa && fam.some(m => m.id === h.poupa.by)) h.poupa = null;
    // (the same note at the end of a diary is the same note told again: its day is today's)
    for (const m of fam) { if (m.age < 16) continue; const L = m.diary || []; const e = L[L.length - 1]; if (e && e.txt === DROP && e.src === 'casa') { e.day = S.day; e.dropped = S.day; } else A.note(m, 'memory', DROP, { src: 'casa', dropped: S.day }); }
    return { ok: true, msg: `Você deixa a casa nova para depois: a família para de juntar por ${K.DROP_DAYS} dias.` };
  };
  A.def('casa', {
    name: 'Um teto', conserve: false,
    purpose: 'Conseguir uma casa para a família: comprar a que o povo tem vazia, alugar a que o dono deixou vazia, ou pagar os materiais de uma nova e mudar quando ficar pronta.',
    needs: 'uma família que precisa de casa (na rua, num barraco, na casa cheia de outros, de aluguel) e com que pagar, num povo de moeda',
    offers(v, x, y, r) {
      if (!v || !K.need(v)) return [];
      // (at the people's store: the treasury of the people, where houses are paid)
      const d = G.Village.nearestDropoff(x, y, v.set); if (!d) return [];
      const [fx, fy] = G.Village.frontTile(d); if (G.dist(x, y, fx, fy) > r + 1) return [];
      const c = K.can(v); const set = G.S.settlements.get(v.set);
      const label = !coinPeople(set) ? 'Pedir ao povo uma casa para a família'
        : c.lease ? `Alugar a casa de ${K.landlord(c.lease).name} (${c.rent} moedas ao ano)`
          : c.free ? `Comprar a casa vazia do povo (${Math.ceil(c.price)} moedas)` : `Pagar uma casa para a família (uns ${Math.ceil(c.price || 0)} moedas)`;
      return [{ id: 'casa.encomendar:' + v.id, act: 'encomendar', label, at: [fx, fy], anim: 'pagar', hands: 1, ok: c.ok, why: c.ok ? '' : c.why }];
    },
    acts: {
      encomendar: {
        deed: 'casa',
        can(v) { return K.can(v); },
        run(v) {
          const r = K.order(v, { now: true }); if (!r.ok) return r;
          const nm = G.Village.buildName(r.b).toLowerCase().replace(/ \(obra\)$/, '');
          return { ok: true, msg: r.rented ? `Você aluga ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} (${r.rent} moedas ao ano): a família muda hoje.` : r.bought ? `Você compra a casa que o povo tinha vazia (${r.price} moedas): a família muda hoje.` : `Você paga ${r.price} moedas pelos materiais: os construtores vão levantar ${art(nm)} ${nm}.` };
        },
      },
    },
  });

  // ------------------------------ inheritance ------------------------------
  const kill0 = G.Village.kill;
  G.Village.kill = function (v) {
    if (v && G.S.villagers.has(v.id)) for (const b of G.S.buildings.values()) {
      // (what is left of a house that fell or was left to the wind — a ruin — keeps the owner it had, and is no one's to
      // inherit: with the owner gone, it is nobody's — L-304)
      if (!housing(b)) { if (b.dono === v.id) { b.dono = 0; b.aluga = null; } continue; }
      if (b.dono === v.id) {
        const heir = b.built ? heirOf(b, v) : null;
        b.dono = heir ? heir.id : 0;
        if (!b.dono) b.aluga = null;
        if (heir) { bio(heir, `Herdou a casa de ${v.name}.`, `Herdei a casa de ${v.name}`); A.note(heir, 'memory', `Herdei a casa de ${v.name}.`, NOTE); }
      }
      if (b.encomenda && b.encomenda.fam.includes(v.id)) { b.encomenda.fam = b.encomenda.fam.filter(id => id !== v.id); if (b.encomenda.by === v.id) b.encomenda.by = b.encomenda.fam[0] || 0; if (!b.encomenda.fam.length) b.dono = 0; }
      if (b.poupa && b.poupa.by === v.id) b.poupa = null;
    }
    return kill0.apply(this, arguments);
  };

  // ------------------------------ the diary ------------------------------
  // the family's own house in the diary of its people: what it lacks, what is saved of it, the work under way — a goal of
  // the family (it can be dropped: a richer house may come by another way), never a duty
  A.hooks.diary.push(function (v, out) {
    if (!out || !out.goals) return;
    const w = K.waiting(v);
    if (w) { out.goals.push({ id: w.id, kind: 'goal', src: 'casa-nova', txt: `A nossa casa está sendo levantada (${Math.round((w.progress || 0) * 100)}%).`, day: w.encomenda.d }); return; }
    const h = v.home && G.S.buildings.get(v.home); const why = K.need(v);
    if (!why) return;
    // (let go, for now: no goal these days — the need comes back after them, D-061)
    if (K.gaveUp(v)) return;
    const set = G.S.settlements.get(v.set); if (!set) return;
    // (a goal the person may let go: drop names the world's door for it, K.giveUp)
    if (!coinPeople(set)) { out.goals.push({ id: v.id, kind: 'goal', src: 'casa-nova', txt: `Uma casa para a família (${WHY[why]}): pedir ao povo.`, day: G.S.day, drop: 'casa-nova' }); return; }
    const alvo = h && h.poupa && h.poupa.by === v.id ? h.poupa.alvo : r2(K.price(set, wantType(set)) + 2);
    // (the coins enough already — the family has not decided yet —: said so, never «52 of 18 saved», L-218)
    const has = K.savings(v);
    const said = has + EPS >= alvo ? `já há moedas para ela (${Math.floor(has)} juntadas; bastam ${Math.ceil(alvo)})` : `juntadas ${Math.floor(has)} de ${Math.ceil(alvo)} moedas`;
    out.goals.push({ id: v.id, kind: 'goal', src: 'casa-nova', txt: `Uma casa para a família (${WHY[why]}): ${said}.`, day: h && h.poupa ? h.poupa.d : G.S.day, prog: Math.min(1, has / alvo), drop: 'casa-nova' });
  });
  // a house that saves buys no luxury (act-compras.js asks)
  K.saving = h => !!(h && h.poupa && P(h.poupa.by) && P(h.poupa.by).home === h.id);
})(window.G);
