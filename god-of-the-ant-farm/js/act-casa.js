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
  // (a house that serves to live in — standing, or being raised further over its family: its owner, its rent, its household's
  // coins, its heir and its need go on through the works — G.Village.livable —; its beds, the house it is becoming, as the
  // town's housing counts them: L-371)
  const lived = b => G.Village.livable(b);
  const P = id => (id && G.S.villagers.get(id)) || null;
  const r2 = x => Math.round(x * 100) / 100;
  const bio = (v, third, first) => G.Life && G.Life.bio(v, 'note', third, first);
  const coinPeople = set => E.coinage(set.fac);
  const NOTE = { src: 'casa' }; // (where a line of the diary came from: the house — the diary's page says it)
  K.MAX_WAIT = 3;   // days a family waits for a house it paid for before the people give it back the coins
  K.RENT = 0.04;    // the rent of a day (a year of the people's calendar), of what the house would cost
  K.OWE_DAYS = 5;   // days of rent owed before the owner gives the house up to the people
  K.KEEP = 2;       // the little a family keeps for itself when it pays for a roof
  K.HANDS_DAYS = 2; // days a family too many for its beds saves without reaching the price before it raises a hut with its hands
  K.MAX_HANDS = 1;  // huts of families' own hands going up in a town at a time (a site of the town's while it stands: the planner counts it)

  // ------------------------------ who owns a house ------------------------------
  // b.dono: the owner's id; 0 = the people's. A house of an older world (or one the planner filled) gets its owner the day
  // the world first looks: the eldest grown person living in it — the founders' houses are their families'
  // b.custo: what the house cost the family that has it — the price it was bought for, the materials and the ground of the
  // work it paid —; the dear land's trade pays at least that (social.js moveUp, L-236). A house of an older world, one the
  // planner filled, the people's: nothing
  K.owner = b => (lived(b) ? b.dono || 0 : 0);
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
  K.landlord = b => { const o = lived(b) && b.dono ? P(b.dono) : null; return o && o.home !== b.id ? o : null; };
  K.tenant = (v, h) => { if (!h || !h.aluga) return null; const o = K.landlord(h); return o && !kin(o, v) ? o : null; };

  // ------------------------------ who needs a house, and how much it costs ------------------------------
  // (the head of a family: a grown person; the reason, or null)
  const need0 = function (v) {
    if (!v || v.age < 18 || v.captive || v.jail || v.aboard) return null;
    const S = G.S; if (!v.home) return v.rua ? 'rua' : null;
    const h = S.buildings.get(v.home); if (!lived(h) || !housing(h)) return null; // (who lives in the seat needs no house: D-205)
    if (h.type === 'barraco') return 'barraco';
    const cap = G.BDEF[h.type].housing, res = h.res || 0;
    const p = P(v.partner);
    // (a household that rents the house it lives in is a tenant — «de aluguel» —, even when its own family fills the beds: the
    // couple in others' full house is the one living with kin for nothing, L-316)
    if (K.tenant(v, h)) return res > cap ? 'lotada' : 'aluga';
    if (p && p.home === v.home && h.dono !== v.id && h.dono !== p.id && res >= cap) return 'casal';
    if (res > cap) return 'lotada';
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
  const WHY = { rua: 'sem teto', barraco: 'num barraco', casal: 'na casa de outros, cheia', lotada: 'gente demais para as camas', aluga: 'de aluguel', rica: 'uma casa à altura da família' };
  const URGENT = { rua: 0, barraco: 1, lotada: 2, casal: 3, aluga: 4 };
  // (the family too many for the beds of the house it lives in, or the couple in others' full house: the ones the other road is for — L-718)
  const crowded = w => w === 'lotada' || w === 'casal';
  const beds = b => G.BDEF[b.type].housing;
  // (how crowded one lives: the people of the house over its beds — out of doors, nothing is worse)
  const crowdOf = (v, occ) => { const h = v.home && G.S.buildings.get(v.home); return h && lived(h) && housing(h) ? (occ.get(h.id) || 0) / beds(h) : Infinity; };
  // (another family in the house one lives in: a grown one of it, none of this family, with a partner or little ones of their
  // own there. The family's own grown single ones are of its household — with them alone, there is nobody to leave: D-098)
  const shares = (v, fam) => { if (!v.home) return false; for (const o of G.S.villagers.values()) if (o.home === v.home && !o.captive && o.age >= 16 && !fam.includes(o) && K.family(o).length > 1) return true; return false; };
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
  // (step: the step of the type's ladder it is raised at — the rich house —: its bill and its lot, G.Escala)
  // (the materials alone, at the town's prices: the least a house costs anywhere — the ground is never less than nothing)
  const goods = (type, step) => { let n = 0; const cost = step ? G.Escala.bill(type, step).cost : G.BDEF[type || 'house'].cost; for (const k in cost) n += (cost[k] || 0) * (E.PRICE[k] || 0.3); return n; };
  K.price = function (set, type, pos, step) {
    const def = G.BDEF[type || 'house']; const n = goods(type, step); const w = step ? step.n : def.w;
    const at = pos ? [pos[0] + w / 2, pos[1] + w / 2] : [set.cx, set.cy];
    const land = G.Urban && G.Urban.valueAt && (set.tier || 0) >= 2 ? G.Urban.valueAt(set, at[0], at[1]) * 0.12 : 2;
    return r2(n + land);
  };
  K.rentOf = (set, type) => Math.max(0.5, r2(K.price(set, type) * K.RENT));
  const homeRef = v => (v.home && lived(G.S.buildings.get(v.home)) ? 'h:' + v.home : null);
  // what the family has to pay with (the coins of the house it lives in — the household's — or the purse in the street)
  K.savings = v => { const r = homeRef(v); return r ? D.get(r, 'moedas') : v.purse || 0; };

  // ------------------------------ the day of each town ------------------------------
  // once a day per town, in the world's step: owners settled, the rents paid, the families in need looked at — saving,
  // buying, renting, raising
  // (the day's round among the towns is the world's — G.mod, in the save —: a load gave every town a second day, L-694)
  let tAcc = 0;
  G.worldHooks.push(() => { tAcc = 0; });
  A.hooks.tick.push(function (step) {
    const S = G.S; if (S.day !== G.mod('casa.day')) { G.mod('casa.day', S.day); G.mod('casa.cur', 0); }
    tAcc += step || 1; if (tAcc + 1e-9 < 2) return; tAcc = 0; // (every other second of the world: a town)
    const sets = [...S.settlements.values()].sort((a, b) => a.id - b.id); const cur = G.mod('casa.cur'); if (cur >= sets.length) return;
    G.mod('casa.cur', cur + 1); day(sets[cur]);
  });
  // (K.day: the day of one town, as the world's step runs it — the scenario's hand calls it at once)
  K.day = set => day(set);
  function day(set) {
    const S = G.S; const res = new Map();
    for (const v of S.villagers.values()) if (v.set === set.id && v.home && !v.captive) { const l = res.get(v.home); if (l) l.push(v); else res.set(v.home, [v]); }
    const homes = []; for (const b of S.buildings.values()) if (b.set === set.id && housing(b)) homes.push(b);
    for (const b of homes) if (lived(b)) { settleOwner(b, res.get(b.id) || []); rent(b, set, res.get(b.id) || []); }
    handsDay(set); // (a family's own work with no grown hands of the family left: the people's builders', D-222)
    // a house paid for and not built: after a few days with no hands for it, the people give back what the family paid
    for (const b of homes) if (b.encomenda && !b.built && S.day - b.encomenda.d > K.MAX_WAIT && !b.progress) refund(b, set);
    // the families in need, the most urgent first (one decision a day per town — the dear ground of a city moves slowly); the
    // body's family is the body's to decide (its offer at the store), whoever of its grown ones heads it in the queue — with the
    // partner at the head, the day moved the body to a house the player never chose (L-452)
    for (const [v] of K.queue(set)) { if (K.family(v).some(m => m.age >= 16 && A.isBody(m))) continue; const r = K.order(v); if (r.ok) break; }
    // (and a rich family may ask for the rich house — one of them under way in a town at a time, after the families in need:
    // the builders' second paid work is never a second rich house. T-447)
    if (!richUnderWay(set)) for (const v of K.rich(set)) { if (K.family(v).some(m => m.age >= 16 && A.isBody(m))) continue; if (K.orderRich(v).ok) break; }
  }
  const richUnderWay = set => { for (const b of G.S.buildings.values()) if (b.set === set.id && !b.built && b.encomenda && b.encomenda.why === 'rica') return true; return false; };
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
    const keep = o && o.now ? 0 : K.KEEP; // (a family keeps a little for itself; the god's body decides for it)
    const coin = coinPeople(set), has = K.savings(v);
    if (coin && has + EPS < plan.price + keep) {
      // (the house it leaves keeps no mark of its saving, as with a house bought or raised — L-696)
      const left = () => { if (h && h.poupa && fam.some(m => m.id === h.poupa.by)) h.poupa = null; };
      // short of coin, and too many for the beds it has: the people's empty house, given for what the family has (L-718)
      const rd = K.road(v, { fam, set, occ, plan, why, now: !!(o && o.now) });
      if (rd.kind === 'cede' && cede(v, fam, rd.b, set, rd.pays, why)) { left(); return { ok: true, b: rd.b, ceded: 1, price: rd.pays }; }
      // short of coin for a roof of its own: an empty house its owner lets, rented — three days of rent in hand
      if (plan.lease && has + EPS >= plan.rent * 3) { lease(v, fam, plan.lease, set, plan.rent, why); left(); return { ok: true, b: plan.lease, rented: 1, rent: plan.rent }; }
      // and, days of saving without the price, a hut raised with the family's own hands (L-718)
      let chao = 0; // (the day the town had no ground for the hut: said in the diary, tried again tomorrow)
      if (rd.kind === 'maos' && !rd.wait) { const b = raiseByHand(v, fam, set, rd.type, rd.pays, why); if (b) { left(); return { ok: true, b, hands: 1, price: b.encomenda.paid }; } chao = S.day; }
      if (h) { h.poupa = { by: v.id, alvo: r2(plan.price + keep), d: h.poupa && h.poupa.by === v.id ? h.poupa.d : S.day, why }; if (chao) h.poupa.chao = chao; }
      return { ok: false, why: `Falta dinheiro: uma casa custa ${plan.price} moedas e a família tem ${Math.floor(has)}.`, saving: 1 };
    }
    if (plan.free) { const ok = buy(v, fam, plan.free, set, plan.price, why); if (ok && h) h.poupa = null; return ok ? { ok: true, b: plan.free, bought: 1, price: plan.price } : { ok: false, why: 'A compra não deu.' }; }
    const no = K.cannotRaise(set, plan.type); if (no) return { ok: false, why: no };
    const b = raise(v, fam, set, plan.type, why); if (b && h) h.poupa = null;
    return b ? { ok: true, b, price: b.encomenda ? b.encomenda.paid : 0 } : { ok: false, why: 'A cidade não achou lugar para mais uma casa agora.' };
  };
  // what is open to a family now (read only): the people's empty house, the price of a new one, a house to rent
  K.plan = function (v, fam, set, occ, why) {
    const S = G.S; occ = occ || occupancy(); fam = fam || K.family(v);
    // (an empty house with beds for the family — or, where none has, one where it would live less crowded than it does: of a
    // house of fifteen for six beds, the family of seven takes the empty house of six beside it. Asked for beds for all of it,
    // the families of seven and eight of Ribe lived fifteen in a house of six with two houses of the people's empty, L-718)
    // (the family that shares its house with another: no more crowded there than where it is; the one alone in the house it
    // has — with its grown single ones —: a house with more beds, never one the same)
    const now = crowdOf(v, occ); const room = b => beds(b) >= fam.length; const share = shares(v, fam);
    const home = v.home ? S.buildings.get(v.home) : null; const mine = home && lived(home) && housing(home) ? beds(home) : 0;
    const fits = b => b.set === set.id && built(b) && b.type !== 'barraco' && !occ.get(b.id) && b.id !== v.home && (room(b) || (share ? fam.length / beds(b) <= now + EPS : beds(b) > mine));
    // (one with beds for all before one without; of those without, the one with most beds)
    const better = (a, b) => room(a) !== room(b) ? room(b) : !room(a) && beds(a) !== beds(b) ? beds(b) > beds(a) : null; // (b over a: true, false, or null — the same)
    let free = null, let_ = null, letR = 0;
    for (const b of S.buildings.values()) {
      if (!fits(b)) continue;
      if (!b.dono) { const w = free ? better(free, b) : true; if (w === true || (w === null && b.id < free.id)) free = b; }
      // (of the houses to let, the one of the lowest rent — the family short of coin rents what it can pay —, then the first:
      // L-312)
      // (an owner who is kin of none of the family — the partner's sister lets no house to her brother's household: the day's
      // rent would end the lease at once, and they would live there for free, L-315)
      else if (K.landlord(b) && !fam.some(m => kin(K.landlord(b), m)) && coinPeople(set) && (why || K.need(v)) !== 'aluga') {
        const rb = K.rentOf(set, b.type); const w = let_ ? better(let_, b) : true;
        if (w === true || (w === null && (rb < letR - EPS || (Math.abs(rb - letR) <= EPS && b.id < let_.id)))) { let_ = b; letR = rb; }
      }
    }
    const type = free ? free.type : wantType(set);
    const price = free ? r2(K.price(set, free.type, [free.x, free.y]) * 0.8) : K.price(set, type);
    return { free, type, price, lease: let_, rent: let_ ? K.rentOf(set, let_.type) : 0, share };
  };
  // ------------------------------ short of coin: the people's empty house, the family's own hands (L-718) ------------------------------
  // A family too many for the beds of the house it lives in — or the couple in others' full house — that cannot pay for a roof
  // was left where it was: fifteen, twenty-two in a house of six, beside empty houses. Two roads for it, in a people with coin:
  //   the people's empty house (D-221) — given at once, before any house is raised, for what the family's share of the pot has
  //   past the little it keeps (in the ledger, as a house bought); a family that lived alone in a house of its own leaves that
  //   one to the people in exchange;
  //   its own hands (D-222) — K.HANDS_DAYS days of saving without the price, and the family raises a hut itself: its grown ones
  //   are the builders (none of the builders' two paid works), the wood is the people's to spare (K.spare), the ground the
  //   cheaper half of the town's (handSite), and the hut is its own; what it has past the little it keeps pays the wood.
  // Only for a family that shares the house with another, and where it would live no more crowded than it does; one alone
  // in the house it has — with its grown single ones — has nobody to leave: nothing by hand, and of the people's empty
  // houses only one with more beds.
  // (the people's wood a family's hands may take: what is free in the store — past the timber its ships keep, G.Fac.free, and
  // what its operations hold, D.free — less what the huts of other families' hands still wait for)
  K.spare = function (set, k) {
    const S = G.S; const fid = set.fac; let wait = 0;
    for (const b of S.buildings.values()) if (!b.built && b.encomenda && b.encomenda.maos && b.need && G.Village.facOfSet(b.set) === fid) wait += Math.max(0, (b.need[k] || 0) - ((b.incoming && b.incoming[k]) || 0));
    return Math.max(0, Math.min(G.Fac.free(set.id, k), D.free('f:' + fid, k)) - wait);
  };
  const HAND = 'hut';
  // (why a family raises nothing with its hands now — '' when it can: read only)
  function noHands(v, fam, set, occ, share) {
    const S = G.S; const now = crowdOf(v, occ);
    if (!share) return 'so';                                                      // (alone in the house it has: nobody to leave)
    if (!(fam.length / G.BDEF[HAND].housing <= now + EPS)) return 'pequena';      // (more crowded in a hut than where it is)
    let open = 0; for (const b of S.buildings.values()) if (b.set === set.id && !b.built && b.encomenda && b.encomenda.maos) open++;
    if (open >= K.MAX_HANDS) return 'obras';
    const cost = G.BDEF[HAND].cost; for (const k in cost) if (K.spare(set, k) + EPS < cost[k]) return 'madeira';
    return '';
  }
  // the other road of a family, as it stands now (read only — the diary, the offer, the day's decision): { kind: 'cede', b,
  // pays } the people's empty house; { kind: 'maos', type, pays, wait } its own hands, in `wait` days; { kind: '', why } none —
  // 'so', 'pequena', 'obras', 'madeira' (noHands), or nothing: not a family the road is for
  K.road = function (v, o) {
    o = o || {}; const S = G.S; const why = o.why || K.need(v); const set = o.set || S.settlements.get(v.set);
    if (!set || !crowded(why) || !coinPeople(set)) return { kind: '' };
    const fam = o.fam || K.family(v); const occ = o.occ || occupancy(); const plan = o.plan || K.plan(v, fam, set, occ, why);
    const pays = n => r2(Math.min(n, Math.max(0, shareOf(v, fam) - K.KEEP)));
    if (plan.free) return { kind: 'cede', b: plan.free, pays: pays(plan.price) };
    const no = noHands(v, fam, set, occ, plan.share); if (no) return { kind: '', why: no };
    const h = S.buildings.get(v.home); const mine = !!h && !!h.poupa && fam.some(m => m.id === h.poupa.by); const since = mine ? h.poupa.d : S.day;
    // (chao: the town had no ground for it at the family's last try — today's or yesterday's)
    return { kind: 'maos', type: HAND, pays: pays(r2(goods(HAND))), wait: o.now ? 0 : Math.max(0, K.HANDS_DAYS - (S.day - since)), chao: mine && S.day - (h.poupa.chao || -9) <= 1 };
  };
  // (the other road, said in the family's own words: the diary; '' when there is none to say)
  const ROAD_NO = { obras: 'há cabanas demais sendo levantadas na cidade agora', madeira: 'o povo não tem madeira de sobra para uma cabana agora' };
  K.roadSays = function (rd) {
    if (rd.kind === 'cede') return 'não temos o preço, mas o povo tem uma casa vazia e a dá a quem não cabe mais onde está';
    if (rd.kind === 'maos') return rd.wait > 0 ? `se em ${rd.wait} dia${rd.wait > 1 ? 's' : ''} não juntarmos o preço, levantamos a nossa cabana com as nossas mãos` : rd.chao ? 'não juntamos o preço, e a cidade não tem chão livre para levantarmos a nossa cabana' : 'não juntamos o preço: vamos levantar a nossa cabana com as nossas mãos';
    return ROAD_NO[rd.why] ? `não juntamos o preço, e ${ROAD_NO[rd.why]}` : '';
  };
  // (the family's house, still being raised: a commission any of the family is written in — the one asked now may not be the
  // one who ordered it. A partner who came to the house after the order is not written in it, and at the head of the town's
  // queue ordered a second house with the first one of the family in it: «#17292 espera duas casas encomendadas», L-719)
  K.waiting = v => {
    let ids = null;
    for (const b of G.S.buildings.values()) {
      if (!b.encomenda || b.built) continue; if (b.encomenda.fam.includes(v.id)) return b;
      if (!ids) ids = K.family(v).map(m => m.id);
      if (ids.length > 1 && b.encomenda.fam.some(id => ids.includes(id))) return b;
    }
    return null;
  };
  // why the people cannot raise a new house now (read only; '' when they can): their builders take two paid houses at a time,
  // and a people without coin raises one from its own store. One rule for the town's day and for the body's offer — the offer
  // lit while the builders were full let the body pay with its hands and be refused, again and again (L-451)
  K.MAX_WORKS = 2;
  K.cannotRaise = function (set, type) {
    // (a hut a family raises with its own hands takes none of the builders' two: D-222)
    let open = 0; for (const b of G.S.buildings.values()) if (b.set === set.id && b.encomenda && !b.encomenda.maos && !b.built) open++;
    if (open >= K.MAX_WORKS) return 'Os construtores do povo já têm casas demais para levantar agora.';
    if (!coinPeople(set)) { const f = G.Fac.get(set.fac); const def = G.BDEF[type]; if (!f || Object.keys(def.cost).some(k => (f.stock[k] || 0) < def.cost[k] * 1.5)) return 'O povo não tem madeira e pedra que cheguem para uma casa agora.'; }
    return '';
  };

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
    b.dono = v.id; b.custo = coinPeople(set) ? price : 0; move(fam, b, 'comprou');
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
  // the lease of a house as it is lived in now: made for a household that is no kin of an owner who lives elsewhere, undone
  // otherwise — the town's day keeps it
  function leaseNow(b, set, L) {
    const S = G.S; const o = K.landlord(b);
    if (!o || !L.length || !coinPeople(set) || L.some(v => kin(o, v))) { if (b.aluga) b.aluga = null; return null; }
    return b.aluga || (b.aluga = { d: S.day, pago: S.day, deve: 0, por: (L.find(v => v.age >= 16) || L[0]).id });
  }
  // (K.lease: who changes the household of a let house asks at once — the family that sells its house to one that rented its
  // roof goes to live in the house that one leaves, social.js, D-159; anew: the lease of the household that left is over)
  K.lease = function (b, anew) {
    const set = b && G.S.settlements.get(b.set); if (!set || !lived(b)) return null;
    if (anew && b.aluga) b.aluga = null;
    return leaseNow(b, set, residents(b));
  };
  // the rent of a day, paid by the household of a let house to the owner's, in the ledger ('aluguel'): what it cannot pay
  // is owed, and paid first when there is coin; too much owed and the owner gives the house up — the people buy it
  function rent(b, set, L) {
    const S = G.S; const o = K.landlord(b); const a = leaseNow(b, set, L);
    if (!a || a.pago >= S.day) return;
    const per = K.rentOf(set, b.type); const due = r2(per * (S.day - a.pago) + (a.deve || 0));
    const head = L.filter(v => v.age >= 16).sort((x, y) => y.age - x.age || x.id - y.id)[0] || L[0];
    const to = o.home && lived(S.buildings.get(o.home)) ? 'h:' + o.home : 'p:' + o.id;
    const n = r2(Math.min(due, D.get('h:' + b.id, 'moedas')));
    if (n > EPS) D.move('h:' + b.id, to, 'moedas', n, { code: 'aluguel', by: head.id });
    a.deve = r2(Math.max(0, due - n)); a.pago = S.day;
    if (a.deve > EPS && a.deve + EPS >= per * K.OWE_DAYS) {
      // (the owner gives up: the people buy the house, for what they can pay of half its worth; the debt goes with it)
      // (paid in coin only to a people that knows it: the owner of another people — a town that rose and became its own, the
      // Freed People of the world war — gives the house up for the debt, and no coin is born in a house that has no use for it, L-586)
      const rb = to[0] === 'h' ? S.buildings.get(o.home) : null; const rf = rb ? G.Village.facOfSet(rb.set) : G.Fac.idOfV(o);
      const f = 'f:' + set.fac; const worth = E.coinage(rf) ? r2(Math.min(K.price(set, b.type) * 0.5, D.get(f, 'moedas'))) : 0;
      if (worth > EPS) D.move(f, to, 'moedas', worth, { code: 'venda-casa', by: o.id });
      A.note(o, 'memory', `${head.name} não pagava o aluguel: vendi a casa ao povo${worth > EPS ? ` por ${worth} moedas` : ''}.`, NOTE);
      for (const m of L) if (m.age >= 16) A.note(m, 'memory', `Devíamos o aluguel a ${o.name}: a casa passou ao povo.`, NOTE);
      b.dono = 0; b.aluga = null; b.custo = 0;
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
  // the people's empty house, given to a family too many for its beds and short of its price (D-221): what the family pays —
  // its share of the pot past the little it keeps — goes to the people's treasury as a house bought; the house is its own
  function cede(v, fam, b, set, pays, why) {
    const S = G.S; const from = v.home ? S.buildings.get(v.home) : null;
    // (a family alone in a house of its own gives that one to the people for the bigger one: an exchange, not a second house)
    const swap = !!from && lived(from) && fam.some(m => m.id === from.dono) && residents(from).every(m => fam.includes(m));
    if (pays > EPS && !pay(v, set, pays, 'compra-casa')) return false;
    b.dono = v.id; b.custo = pays > EPS ? pays : 0; move(fam, b, 'cedida');
    if (swap) { from.dono = 0; from.custo = 0; from.aluga = null; from.poupa = null; }
    const nm = G.Village.buildName(b).toLowerCase();
    bio(v, `Recebeu do povo ${art(nm)} ${nm} que estava vazia${pays > EPS ? `, pelas ${pays} moedas que tinha` : ''}, e se mudou com a família (${WHY[why]})${swap ? '; a casa que tinha ficou para o povo' : ''}.`, `O povo nos deu a casa que tinha vazia — não cabíamos mais onde estávamos`);
    A.note(v, 'memory', `Não tínhamos o preço de uma casa: o povo nos deu a que tinha vazia (${nm})${pays > EPS ? `, pelas ${pays} moedas que tínhamos` : ''}.`, NOTE);
    return true;
  }
  // a hut raised with the family's own hands (D-222): the city says where — a house's lot by the planner's rules, on the cheaper
  // half of a city's ground —, the family's grown ones raise it (K.handsTask), the wood comes from the people's store as for
  // any work. What the family has past the little it keeps is set aside in the site, as for a house paid: the people's when
  // the hut stands, the family's again when it never does
  function handSite(set, type) {
    const V = G.Village; let cheap = null;
    if ((set.tier || 0) >= 2 && G.Urban && G.Urban.valueAt) {
      const vals = []; for (const b of G.S.buildings.values()) if (b.set === set.id && built(b)) vals.push(G.Urban.valueAt(set, b.x + b.w / 2, b.y + b.h / 2));
      if (vals.length >= 4) { vals.sort((a, c) => a - c); const mid = vals[vals.length >> 1]; cheap = (x, y) => G.Urban.valueAt(set, x + 0.5, y + 0.5) <= mid; }
    }
    let pos = null;
    if (cheap) {
      // (no cheap lot today is not «no lot today»: the planner's own search of the day is not told so)
      const memo = set._noSite ? set._noSite[type] : undefined;
      pos = V.findSite(set, type, cheap);
      if (!pos && set._noSite && set._noSite[type] !== memo) { if (memo === undefined) delete set._noSite[type]; else set._noSite[type] = memo; }
    }
    if (!pos) pos = V.findSite(set, type);
    return pos && !pos.demolish ? pos : null;
  }
  function raiseByHand(v, fam, set, type, pays, why) {
    const pos = handSite(set, type); if (!pos) return null;
    const b = G.Village.startProject(set, type, pos); if (!b) return null;
    if (pays > EPS && !D.move(homeRef(v) || 'p:' + v.id, 'h:' + b.id, 'moedas', pays, { code: 'obra-casa', by: v.id }).ok) { G.Village.removeBuilding(b); return null; }
    // (maos: the family's own work — its grown ones raise it, never the people's builders)
    b.dono = v.id; b.encomenda = { fam: fam.map(m => m.id), d: G.S.day, paid: pays > EPS ? pays : 0, by: v.id, why, fac: set.fac, maos: 1 };
    HW = null;
    const nm = G.Village.buildName(b).toLowerCase().replace(/ \(obra\)$/, '');
    bio(v, `Sem o preço de uma casa, começou a levantar ${art(nm)} ${nm} com as próprias mãos, da madeira do povo, na beira de ${set.name} (${WHY[why]}).`, `Não juntamos o preço de uma casa: levantamos a nossa com as nossas mãos`);
    for (const m of fam) if (m.age >= 16) A.note(m, 'memory', `Não juntamos o preço: vamos levantar a nossa ${nm} com as nossas mãos.`, NOTE);
    return b;
  }
  // The hands of a family's own work (D-222): a grown one of the family works on it before the trade of the day — the working
  // day asks (villagers.js, workTask) —, while there is something to do there: a material it waits for free in the people's
  // store, or strokes its materials allow (the builders' own rule). The people's builders never take it (villagers.js,
  // buildTask): with no grown one of the family left in the town, it passes to them — a paid house's work like any other
  let HW = null; // (the families' works under way, by the id of each one of the family: found again from the world)
  G.worldHooks.push(() => { HW = null; });
  const handWorks = () => { if (!HW) { HW = new Map(); for (const b of G.S.buildings.values()) if (b.encomenda && b.encomenda.maos && !b.built) for (const id of b.encomenda.fam) HW.set(id, b.id); } return HW; };
  // (the family of a commission as it is now: those written in it, and the partner who came to live with one of them after
  // it was ordered — one house for a family, by any door: L-719)
  const famNow = o => { const out = o.fam.map(P).filter(Boolean); for (const m of out.slice()) { const p = P(m.partner); if (p && !p.captive && !!m.home && p.home === m.home && !out.includes(p)) out.push(p); } return out; };
  const hands = b => famNow(b.encomenda).filter(m => m.age >= 16 && !m.captive && m.set === b.set);
  // (whether one may work on a family's own work: one of the family, as it is now — the checker asks)
  K.ownHands = (b, v) => !!(b && b.encomenda && b.encomenda.maos && famNow(b.encomenda).includes(v));
  K.handsTask = function (v) {
    // (the work one is written in, or the one the partner one lives with is written in)
    const q = v.partner ? P(v.partner) : null;
    const id = handWorks().get(v.id) || (q && q.home === v.home ? handWorks().get(q.id) : 0); const b = id ? G.S.buildings.get(id) : null;
    if (!b || b.built || !b.encomenda || !b.encomenda.maos || b.set !== v.set || v.age < 16 || v.captive) return null;
    if (b.unreach && G.S.clock - b.unreachT < 30) return null; // (no way to it just now: the builders' own wait)
    // (a load in the hands goes to its place first — the wood a woodcutter of the family brings from the forest is the
    // people's, for the store: what the hut takes is taken from the store, in the ledger, where the people's spare is counted)
    if (v.carry && v.carry.n > EPS) return null;
    let mat = false; for (const k in b.need) if (b.need[k] - ((b.incoming && b.incoming[k]) || 0) > 0 && G.Fac.free(b.set, k) >= 1) { mat = true; break; }
    if (!mat && !G.Vg.canWork(b)) return null;
    return G.Vg.setTask(v, { type: 'build', id: b.id, pri: 1, st: 0 });
  };
  // (the family's works of a town, once a day: one with no grown hands of its family left there is the people's builders' now)
  function handsDay(set) {
    for (const b of G.S.buildings.values()) if (b.set === set.id && !b.built && b.encomenda && b.encomenda.maos && !hands(b).length) { b.encomenda.maos = 0; HW = null; }
  }

  // ------------------------------ the rich house (T-447, D-177) ------------------------------
  // a family with coins to spare asks for the rich house — the house's bigger step, a family's own choice (G.Escala: the step
  // marked familia, never the planner's) —, on dear land (the city says where: G.Urban.valueAt), paid by the ledger as any house
  // a family raises: one a day in a town, after the families in need, and one under way in a town at a time. The family: the owner of the house it lives in,
  // grown, with — past the price, out of its own share of the house's pot — what keeps its house a rich one in the city's eyes
  // (K.RICH, the coins of a rich household: urban.js); never one already in a rich house, in a house of the people's mark
  // (elite) or in the ruler's palace, never one in need or waiting for a house. A city only (its land has a price), of a people
  // with coin that knows the step. The house it leaves stays its own: let to who needs one, as any house an owner leaves
  K.RICH = 40; K.RICH_LAND = 40;
  K.richStep = function (set) {
    if (!set || (set.tier || 0) < 2 || !coinPeople(set) || !(G.Urban && G.Urban.valueAt)) return null;
    const st = G.Escala.choose(set, 'house', { familia: true })[0]; return st && st.familia ? st : null;
  };
  const isRich = b => !!b && ((b.type === 'house' && b.w !== G.Escala.n0('house')) || !!b.elite || !housing(b));
  // (the family's share of the coins of the house it lives in: the pot is everyone's in it)
  const shareOf = (v, fam) => { const h = G.S.buildings.get(v.home); const all = h ? h.res || fam.length : fam.length; return K.savings(v) * Math.min(1, fam.length / Math.max(1, all)); };
  // the families of a town that would ask for the rich house now, the richest first (read only): their heads
  K.rich = function (set) {
    const S = G.S; const st = K.richStep(set); if (!st) return [];
    // (the price is the materials and the ground: a house that could not pay the materials is out before anything is asked,
    // and the town is asked what its ground is worth — its look — only for an owner living in a house that could. T-805)
    const floor = r2(goods('house', st)) + K.RICH; let least = -1; const out = [];
    for (const b of S.buildings.values()) {
      if (b.set !== set.id || !built(b) || isRich(b) || b.type === 'barraco' || !b.dono || (b.coin || 0) + EPS < floor) continue;
      const v = P(b.dono); if (!v || v.home !== b.id || v.set !== set.id || v.age < 18 || v.captive || v.jail || v.aboard) continue;
      if (least < 0) least = K.price(set, 'house', null, st) + K.RICH;
      if ((b.coin || 0) + EPS < least) continue;
      const fam = K.family(v); if (fam.length > G.BDEF.house.housing || shareOf(v, fam) + EPS < least) continue;
      if (K.need(v) || K.waiting(v) || K.gaveUp(v)) continue;
      out.push(v);
    }
    return out.sort((a, c) => K.savings(c) - K.savings(a) || a.id - c.id);
  };
  // the rich house ordered: the city says where (dear land only), the family pays its materials and its ground, the people's
  // builders raise it. → { ok, b, price } or { ok: false, why }
  K.orderRich = function (v) {
    const S = G.S; const set = v && S.settlements.get(v.set); const st = set && K.richStep(set); if (!st) return { ok: false, why: 'Aqui ninguém levanta uma casa rica.' };
    const h = S.buildings.get(v.home); if (!lived(h) || isRich(h)) return { ok: false, why: 'A família já mora numa casa rica.' };
    if (K.waiting(v)) return { ok: false, why: 'A casa da família já está sendo levantada.' };
    const no = K.cannotRaise(set, 'house'); if (no) return { ok: false, why: no };
    const fam = K.family(v);
    const dear = (x, y) => G.Urban.valueAt(set, x + st.n / 2, y + st.n / 2) >= K.RICH_LAND;
    const pos = G.Village.findSite(set, 'house', dear, st.n); if (!pos || pos.demolish) return { ok: false, why: 'A cidade não tem terra cara livre para uma casa rica agora.' };
    const price = K.price(set, 'house', pos, st);
    if (shareOf(v, fam) + EPS < price + K.RICH) return { ok: false, why: `Falta dinheiro: a casa rica custa ${price} moedas ali.` };
    const b = G.Village.startProject(set, 'house', pos, st); if (!b) return { ok: false, why: 'A cidade não achou lugar para a casa rica.' };
    if (!D.move('h:' + h.id, 'h:' + b.id, 'moedas', price, { code: 'obra-casa', by: v.id }).ok) { G.Village.removeBuilding(b); return { ok: false, why: 'O pagamento não deu.' }; }
    b.dono = v.id; b.encomenda = { fam: fam.map(m => m.id), d: S.day, paid: price, by: v.id, why: 'rica', fac: set.fac };
    const nm = G.Escala.of(b).nome.toLowerCase() || 'casa rica';
    bio(v, `Pagou ${price} moedas pelos materiais e pelo chão de uma ${nm} para a família, em terra cara de ${set.name}; os construtores começaram a obra.`, 'Juntamos o bastante para uma casa à nossa altura');
    A.note(v, 'memory', `Pagamos ${price} moedas por uma ${nm} em terra cara.`, NOTE);
    return { ok: true, b, price };
  };
  // a commission that never started (no hands, no ground): the coins come back to the household that paid, in the ledger; and
  // what its builders had already brought to the site — the people's — goes back to the people's store before the work leaves
  // the ground, as a work given up does (V.siteBack, L-246). It went with the work, unwritten: a house of Birka paid for on day
  // 66, with the 4 of wood a builder of the family brought on day 69 and no stroke after it, was given back on day 70 — the
  // mundial of the generation 12, L-474
  function refund(b, set) {
    const o = b.encomenda; const v = P(o.by) || o.fam.map(P).find(Boolean);
    const kept = D.get('h:' + b.id, 'moedas');
    if (kept > EPS) { const to = v ? homeRef(v) || 'p:' + v.id : 'f:' + set.fac; D.move('h:' + b.id, to, 'moedas', kept, { code: 'obra-devolvida', by: v ? v.id : 0, part: true }); }
    if (v) A.note(v, 'memory', 'A obra da nossa casa nunca começou: as moedas voltaram para nós.', NOTE);
    b.encomenda = null; b.dono = 0;
    if (!b.progress) { G.Village.siteBack(b, 'obra-largada'); G.Village.removeBuilding(b); }
  }
  // moving: the family's people to the new house, and what is theirs with them — all of it when the whole household goes,
  // its share of the pantry, the goods and the coins when it leaves others behind (the house's pot is everyone's in it):
  // what the new furniture has no room for comes too, on the floor (D-059: the house left behind would give it to the
  // people). Then the family puts its things in order (the note; the house's own furniture is the interiors')
  function move(fam, b, how) {
    const S = G.S; const from = fam[0].home && S.buildings.get(fam[0].home);
    const left = from && lived(from) ? residents(from).filter(v => !fam.includes(v)) : [];
    const brought = [];
    if (from && lived(from) && from.id !== b.id) {
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
    const said = { comprou: 'comprou uma casa e se mudou', alugou: 'alugou uma casa e se mudou', levantou: 'mudou para a casa que levantou', cedida: 'recebeu do povo uma casa vazia e se mudou', maos: 'mudou para a cabana que levantou com as próprias mãos', paco: 'foi morar na casa de quem governa', voltou: 'voltou para a casa que tinha', saiu: 'deixou a casa de quem governa' }[how];
    (fam[0].moves || (fam[0].moves = [])).push([S.day, said]); if (fam[0].moves.length > 6) fam[0].moves.shift();
    A.note(fam[0], 'memory', `Arrumamos a casa nova${brought.length ? ': trouxemos ' + brought.slice(0, 4).join(', ') : ''}.`, NOTE);
  }
  const S_ = () => G.S;
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
    // (who moves: the family as it is now — the partner who came to the house after the order goes with it, L-719: the
    // family's new house may have no bed left for one who would follow later)
    const fam = famNow(o).filter(v => !v.captive && v.set === b.set);
    if (!fam.length) { b.dono = 0; b.custo = 0; return r; }
    if (!P(b.dono)) b.dono = fam[0].id;
    b.custo = o.paid || 0; // (the materials and the ground the family paid for: L-236)
    // (a family that lives in the seat meanwhile — one of it rules — keeps the house it paid for, and stays where it is: D-206)
    if (fam.some(v => isSeat(S_().buildings.get(v.home)))) return r;
    move(fam, b, o.maos ? 'maos' : 'levantou');
    const v = fam[0]; const nm = G.Village.buildName(b).toLowerCase();
    if (o.maos) bio(v, `Mudou-se com a família para ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} que levantou com as próprias mãos.`, `Nos mudamos para a nossa casa — levantada com as nossas mãos`);
    else bio(v, `Mudou-se com a família para ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} que mandou levantar.`, `Nos mudamos para a nossa casa — levantada com o que juntamos`);
    for (const m of fam) A.note(m, 'memory', o.maos ? 'Mudamos para a casa que levantamos com as nossas mãos.' : `Mudamos para a nossa casa nova.`, NOTE);
    HW = null;
    return r;
  };

  // ------------------------------ the house of who rules: the seat (D-205 to D-207) ------------------------------
  // Who rules a people lives in its seat — the best palace standing in its capital, the chief's house where there is no more
  // (G.Court.seatOf) — with the household: the partner and the children of the house with no partner of their own, and the
  // little ones of those. The seat is no house of the town's: nobody owns it, buys it, rents it or is given it — only this door
  // puts a household in it and takes one out, always whole, with what is its own by the ledger ('mudança': move, above). The
  // house the family had stays its own — let to who needs one, as any house an owner leaves —, and the merchants' banner goes
  // with the family (trade.js). Asked every other second of the world, and at once when a seat is finished, falls, is taken down
  // or becomes a work again (the enlargement):
  //   out — whoever lives in a seat that is not the seat of its people's ruler, or is none of the ruler's family (K.ofCourt): the
  //   family of the one who ruled before, a town taken in war. To a house of its own with room for it, else to an empty house of
  //   the people's, else to the house of the town with most room (the town's own rule; the owner's rent as the day has it,
  //   D-159), else out of doors with its coins;
  //   in — the ruler of the seat's town, not living in it yet, with the household;
  //   called — the ruler who lives in another town of the people comes to the capital with the household (D-207): only who the
  //   town can send (G.Vg.canSend), the family whole, by land (W.reachesTown), asked once a day.
  // Never the god's body nor its household: the body's house is the player's (D-098, L-452). Nothing is kept: who should live
  // where is read from the world each time — the same after a load
  const isSeat = b => !!b && !housing(b) && G.Village.bedsOf(b) > 0;
  K.isSeat = isSeat;
  K.seatOf = f => (G.Court && G.Court.seatOf ? G.Court.seatOf(f) : null);
  // (the ruler whose seat a building is — its people's, living in it or not — or null: a seat in works, fallen, of a town that
  // is not its people's capital, or below a better one, is nobody's)
  K.lordOf = function (b) {
    if (!isSeat(b) || !lived(b)) return null; const f = G.Fac.get(G.Village.facOfSet(b.set)); if (!f || !f.alive) return null;
    const r = G.Politics.ruler(f); return r && !r.captive && K.seatOf(f) === b ? r : null;
  };
  // the household that goes with the ruler: of those who live with them now, the partner, the children of either with no
  // partner of their own — of any age: the grown one who married lives with the house they made —, and those children's little ones
  K.court = function (r) {
    const out = [r]; const h = r.home || 0; const at = o => !!o && !o.captive && (o.home || 0) === h && o.set === r.set && !out.includes(o);
    const p = P(r.partner); if (at(p)) out.push(p);
    const heads = out.slice();
    for (const q of heads) for (const id of q.kids || []) { const k = P(id); if (at(k) && !k.partner) out.push(k); }
    for (const q of out.slice(heads.length)) for (const id of q.kids || []) { const k = P(id); if (at(k) && k.age < 16) out.push(k); }
    return out;
  };
  // who may live in the ruler's seat: the ruler's family and the partner's — parents, brothers and sisters, children —, who is
  // married to one of them, and their children (the grandchildren, the nephews): the dead ones' children too
  K.ofCourt = function (v, r) {
    if (!v || !r) return false; const p = P(r.partner); const fam = o => !!o && (kin(r, o) || (!!p && kin(p, o)));
    if (fam(v) || fam(P(v.partner)) || fam(P(v.mother)) || fam(P(v.father))) return true;
    const kids = (r.kids || []).concat(p ? p.kids || [] : []);
    return (!!v.mother && kids.includes(v.mother)) || (!!v.father && kids.includes(v.father));
  };
  const hasBody = L => L.some(m => A.isBody(m));
  const eldest = L => L.slice().sort((a, c) => (c.age >= 16) - (a.age >= 16) || c.age - a.age || a.id - c.id)[0];
  const headFirst = (L, h) => [h].concat(L.filter(m => m !== h));
  const theName = b => { const nm = G.Village.buildName(b); return (G.gen(nm) === 'a' ? 'a ' : 'o ') + nm; };
  // (where a household that leaves the seat goes, in its town: [house, how] or null)
  function rehouse(fam, set, kin) {
    const S = G.S; const occ = occupancy(); const ids = new Set(fam.map(m => m.id).concat(kin || [])); let own = null, free = null, best = null, bs = 0;
    for (const b of S.buildings.values()) {
      if (b.set !== set.id || !built(b) || b.type === 'barraco') continue;
      const n = occ.get(b.id) || 0; const room = G.BDEF[b.type].housing - n; if (room < fam.length) continue;
      if (ids.has(b.dono)) { if (!own || b.id < own.id) own = b; }
      else if (!b.dono && !n) { if (!free || b.id < free.id) free = b; }
      else if (!best || room > bs || (room === bs && b.id < best.id)) { best = b; bs = room; }
    }
    return own ? [own, 'voltou'] : free ? [free, 'saiu'] : best ? [best, 'saiu'] : null;
  }
  const WHY_OUT = { cheia: 'não há camas para todos', governo: 'outro governa agora', queda: 'veio abaixo', obra: 'entrou em obras', desfeita: 'já não existe', sede: 'já não é a sede do governo' };
  // a household leaves the seat: whole, with its share of what the seat keeps
  function leave(b, L, why, kin) {
    const S = G.S; const set = S.settlements.get(b.set); if (!set || !L.length || hasBody(L)) return false;
    const head = eldest(L); const to = rehouse(L, set, kin);
    if (to) { move(headFirst(L, head), to[0], to[1]); K.lease(to[0]); }
    else {
      // (no house of the town has room for it: out of doors, the coins of its share in the head's purse — the town's housing
      // and the family's own need take it from there)
      const all = residents(b).length; const n = r2(D.get('h:' + b.id, 'moedas') * L.length / Math.max(1, all));
      if (n > EPS) D.move('h:' + b.id, 'p:' + head.id, 'moedas', n, { code: 'mudança', by: head.id, part: true });
      for (const m of L) m.home = 0; b.res = Math.max(0, (b.res || 0) - L.length);
      (head.moves || (head.moves = [])).push([S.day, 'deixou a casa de quem governa']); if (head.moves.length > 6) head.moves.shift();
    }
    const where = !to ? 'ainda sem teto' : to[1] === 'voltou' ? 'de volta à casa que tinha' : 'numa casa da cidade';
    bio(head, `Deixou ${theName(b)} de ${set.name}${L.length > 1 ? ' com a família' : ''} (${WHY_OUT[why] || WHY_OUT.sede}): ${where}.`, `Deixamos ${theName(b)}`);
    for (const m of L) if (m.age >= 16) A.note(m, 'memory', `Deixamos ${theName(b)}: ${WHY_OUT[why] || WHY_OUT.sede}.`, NOTE);
    // (the chronicle: a household that leaves the seat — not the grown one more who goes to the family's house for want of a bed)
    const [x, y] = G.Village.center(b);
    if (why !== 'cheia') G.Village.log(`${head.name}${L.length > 1 ? ' e a família deixaram' : ' deixou'} ${theName(b)} de ${set.name}: ${WHY_OUT[why] || WHY_OUT.sede}. ${L.length > 1 ? 'Estão' : 'Está'} ${where}.`, 'crown', x, y);
    return true;
  }
  // The seat's beds (D-206). Who must live with who rules, whatever its beds: the ruler and the partner, their parents, who is
  // under eighteen, who has little ones of their own there, who minds its little ones (K.tied). Of the household, they come —
  // and, while the seat has beds, its grown single ones, the eldest first: the others stay in the house the family has (K.comes).
  // And from a seat with more people than beds, they leave until it has them (crowd): first the households of the family that
  // are not the ruler's own — a married child's, a brother's, with their little ones —, the youngest first; then the grown
  // single ones, the youngest first (D-098) — to the family's own house where it has room, as anyone who leaves a seat
  const tied = (v, r, L) => { const p = P(r.partner); return v.id === r.id || v.id === r.partner || v.age < 18 || v.id === r.mother || v.id === r.father || (!!p && (v.id === p.mother || v.id === p.father)) || K.minds(v) || L.some(k => k.age < 16 && (k.mother === v.id || k.father === v.id)); };
  K.tied = tied;
  K.comes = function (b, r) {
    const fam = K.court(r); const room = G.Village.bedsOf(b) - residents(b).length; const must = fam.filter(v => tied(v, r, fam));
    const rest = fam.filter(v => !must.includes(v)).sort((a, c) => c.age - a.age || a.id - c.id);
    return must.concat(rest.slice(0, Math.max(0, room - must.length)));
  };
  function crowd(b, r) {
    const beds = G.Village.bedsOf(b); let L = residents(b); if (L.length <= beds || hasBody(L)) return;
    const p = P(r.partner); const kin = [r.id].concat(p ? [p.id] : []);
    // (the ruler's own: the two, their parents — and who a parent is married to now)
    const own = v => !!v && (v.id === r.id || v.id === r.partner || v.id === r.mother || v.id === r.father || (!!p && (v.id === p.mother || v.id === p.father))); const core = v => own(v) || own(P(v.partner));
    const heads = L.filter(v => v.age >= 16 && !core(v) && !!v.partner && L.some(o => o.id === v.partner)).sort((a, c) => a.age - c.age || a.id - c.id);
    for (const h of heads) { if (L.length <= beds) return; if (!L.includes(h)) continue; const g = K.court(h).filter(v => L.includes(v) && !core(v)); if (leave(b, g, 'cheia', kin)) L = L.filter(v => !g.includes(v)); }
    for (const v of L.filter(o => o.age >= 18 && !o.partner).sort((a, c) => a.age - c.age || a.id - c.id)) { if (L.length <= beds) return; if (tied(v, r, L)) continue; if (leave(b, [v], 'cheia', kin)) L = L.filter(o => o !== v); }
  }
  // the ruler's household comes to live in the seat
  function enter(b, r, f, fam) {
    const S = G.S; const set = S.settlements.get(b.set); const from = r.home ? S.buildings.get(r.home) : null;
    if (from && from.poupa && fam.some(m => m.id === from.poupa.by)) from.poupa = null; // (it saves for no house now)
    move(headFirst(fam, r), b, 'paco');
    if (from && built(from)) K.lease(from); // (who stayed in the house it leaves, as the day would have it: D-159)
    const who = G.Politics.styled(f, r); const [x, y] = G.Village.center(b);
    bio(r, `Foi morar n${theName(b)} de ${set.name}${fam.length > 1 ? ' com a família' : ''}.`, `Mudamos para ${theName(b)}: é a casa de quem governa`);
    for (const m of fam) if (m.age >= 16) A.note(m, 'memory', `Mudamos para ${theName(b)}.`, NOTE);
    G.Village.log(`${who} foi morar n${theName(b)} de ${set.name}${fam.length > 1 ? `, com a família (${fam.length})` : ''}.`, 'crown', x, y);
  }
  // (why the ruler's household does not come to the seat now — '' when it can: the body's house is the player's; from another
  // town, only who the town can send, by land, once a day)
  function held(b, r, f, fam) {
    if (hasBody(fam)) return 'corpo';
    if (r.set === b.set) return '';
    const cap = G.S.settlements.get(b.set);
    if (!fam.every(m => G.W.reachesTown(m, cap))) return 'sem caminho';
    if (!fam.every(m => G.Vg.canSend(m))) return 'ocupado';
    return G.mod('casa.corte.' + f.id) === G.S.day ? 'chamado' : '';
  }
  // (the ruler of another town of the people called to the capital: the household on its way there, its home the seat already)
  function call(b, r, f, fam) {
    const S = G.S; const cap = S.settlements.get(b.set); const old = S.settlements.get(r.set);
    G.mod('casa.corte.' + f.id, S.day);
    enter(b, r, f, fam);
    for (const m of fam) { G.Vg.endTask(m); m.set = cap.id; m.sleeping = false; m.inside = 0; G.Vg.setTask(m, { type: 'migrate', pri: 1.6, kind: 'migrate' }); G.Life && G.Life.bio(m, 'moved', cap.name); }
    if (old) G.Village.log(`${r.name} deixou ${old.name}${fam.length > 1 ? ' com a família' : ''}: quem governa ${f.name} mora em ${cap.name}.`, 'crown', old.cx, old.cy);
  }
  K.reign = function () {
    const S = G.S; if (!G.Court || !G.Court.seatOf) return;
    const seats = []; for (const b of S.buildings.values()) if (isSeat(b)) seats.push(b);
    if (!seats.length) return;
    const res = new Map();
    for (const v of S.villagers.values()) { if (!v.home || v.captive) continue; const b = S.buildings.get(v.home); if (isSeat(b)) { const l = res.get(b.id); if (l) l.push(v); else res.set(b.id, [v]); } }
    for (const b of seats) {
      const L = res.get(b.id); if (!L) continue; const r = K.lordOf(b);
      const out = r ? L.filter(v => !K.ofCourt(v, r)) : L; if (out.length) leave(b, out, r ? 'governo' : !lived(b) ? 'obra' : 'sede');
    }
    for (const f of G.Fac.all()) {
      const b = K.seatOf(f); const r = G.Politics.ruler(f); if (!b || !lived(b) || !r || r.captive || r.home === b.id) continue;
      if (held(b, r, f, K.court(r))) continue; const fam = K.comes(b, r);
      if (r.set === b.set) enter(b, r, f, fam); else call(b, r, f, fam);
    }
    for (const b of seats) { const r = K.lordOf(b); if (r && r.home === b.id) crowd(b, r); }
  };
  // (a seat that falls, is taken down or becomes a work again: its household out first, with what is its own)
  K.vacate = function (b, why) { if (!isSeat(b) || !lived(b)) return; const L = residents(b); if (L.length) leave(b, L, why); };
  // where the people's ruler stands with the seat, for the panel and the proofs (reads only): { seat, ruler, home, why }.
  // Asked from outside the world's step — a panel —, the household of another town is only said to live there: the map of
  // reach is the step's to ask
  K.seatState = function (f) {
    const b = K.seatOf(f); const r = G.Politics.ruler(f); if (!b) return null;
    if (!r || r.captive) return { seat: b, ruler: null, home: false, why: 'sem governante' };
    if (r.home === b.id) return { seat: b, ruler: r, home: true, why: '' };
    const fam = K.court(r);
    return { seat: b, ruler: r, home: false, why: !lived(b) ? 'obra' : (G.inSim || r.set === b.set || hasBody(fam) ? held(b, r, f, fam) : 'outra cidade') || 'a caminho' };
  };
  const SAYS = { 'outra cidade': 'mora noutra cidade do povo', corpo: 'o deus vive nessa família, e a casa dela é dele para escolher', 'sem caminho': 'não há caminho por terra até aqui', ocupado: 'alguém da família não pode partir agora', chamado: 'a família foi chamada hoje', 'a caminho': 'está de mudança', 'sem governante': 'o povo está sem governante', obra: 'está em obras' };
  K.seatSays = function (b, plink, esc) {
    if (!isSeat(b)) return ''; const f = G.Fac.get(G.Village.facOfSet(b.set)); const st = f && K.seatOf(f) === b ? K.seatState(f) : null;
    const ros = G.Lar && G.Lar.roster ? G.Lar.roster(b).filter(q => q.lives) : [];
    if (ros.length) return `<div class="family"><div>Mora aqui a casa de quem governa (${ros.length}/${G.Village.bedsOf(b)}):</div>${ros.map(q => `<div>${plink(q.id)} <span class="muted">— ${esc(q.why)}</span></div>`).join('')}</div>`;
    if (!st) return '<div class="doing">Ninguém mora aqui: não é a sede do governo.</div>';
    const set = st.ruler ? G.S.settlements.get(st.ruler.set) : null;
    return `<div class="doing">Ninguém mora aqui agora${st.ruler ? `: ${plink(st.ruler.id)}${set && set.id !== b.set ? `, que mora em ${esc(set.name)},` : ''} ainda não veio — ${esc(SAYS[st.why] || st.why)}` : `: ${esc(SAYS[st.why] || st.why)}`}.</div>`;
  };
  let tSeat = 0;
  G.worldHooks.push(() => { tSeat = 0; });
  A.hooks.tick.push(function (step) { tSeat += step || 1; if (tSeat + 1e-9 < 2) return; tSeat = 0; K.reign(); });
  {
    const V = G.Village;
    const complete1 = V.completeBuilding; V.completeBuilding = function (b) { const r = complete1.apply(this, arguments); if (isSeat(b) && G.inSim) K.reign(); return r; };
    const destroy1 = V.destroyBuilding; V.destroyBuilding = function (b) { if (b && b.built) K.vacate(b, 'queda'); return destroy1.apply(this, arguments); };
    const remove1 = V.removeBuilding; V.removeBuilding = function (b) { if (b && b.built) K.vacate(b, 'desfeita'); return remove1.apply(this, arguments); };
    const enlarge1 = V.enlarge; V.enlarge = function (b, step, pos) { if (b && b.built && step && step.n > b.w && pos) K.vacate(b, 'obra'); return enlarge1.apply(this, arguments); };
  }

  // ------------------------------ the god's body: the same decision, taken by the player ------------------------------
  // (read only: what the decision would say now — for the offer the body sees)
  K.can = function (v) {
    const S = G.S; const why = K.need(v); if (!why) return { ok: false, why: 'A família tem onde morar.' };
    const set = S.settlements.get(v.set); if (!set) return { ok: false, why: '' };
    if (K.waiting(v)) return { ok: false, why: 'A casa da família já está sendo levantada.' };
    { const d = K.gaveUp(v); if (d) return { ok: false, why: `A família deixou a casa nova para depois: volta a pensar nisso no dia ${d}.` }; }
    const plan = K.plan(v, null, set, null, why); const has = K.savings(v);
    if (coinPeople(set) && has + EPS < plan.price) {
      // (short of coin: the other road, as the decision takes it — the people's empty house, a house to rent, the family's own
      // hands; the ground of a hut is the decision's to find, L-451)
      const rd = K.road(v, { set, plan, why, now: true });
      if (rd.kind === 'cede') return { ok: true, price: rd.pays, ceded: rd.b, why };
      if (plan.lease && has + EPS >= plan.rent * 3) return { ok: true, price: plan.price, rent: plan.rent, lease: plan.lease, why };
      if (rd.kind === 'maos') return { ok: true, price: rd.pays, hands: rd.type, why };
      return { ok: false, why: `Falta dinheiro: uma casa custa uns ${Math.ceil(plan.price)} moedas e a família tem ${Math.floor(has)}.`, price: plan.price };
    }
    // (a new house: the people must be able to raise it now, as the decision asks — L-451)
    if (!plan.free) { const no = K.cannotRaise(set, plan.type); if (no) return { ok: false, why: no, price: plan.price }; }
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
        : c.ceded ? `Pedir ao povo a casa que ele tem vazia (${c.price > EPS ? Math.ceil(c.price) + ' moedas: o que a família tem' : 'a família não tem com que pagar'})`
        : c.hands ? `Levantar a nossa cabana com as nossas mãos (a madeira do povo${c.price > EPS ? ', ' + Math.ceil(c.price) + ' moedas' : ''})`
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
          if (r.ceded) return { ok: true, msg: `O povo dá à família ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm} que tinha vazia${r.price > EPS ? ` (${r.price} moedas)` : ''}: a família muda hoje.` };
          if (r.hands) return { ok: true, msg: `A família vai levantar ${art(nm)} ${nm} com as próprias mãos, da madeira do povo${r.price > EPS ? ` (${r.price} moedas)` : ''}: a obra está marcada.` };
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
        const heir = lived(b) ? heirOf(b, v) : null;
        b.dono = heir ? heir.id : 0;
        if (!b.dono) { b.aluga = null; b.custo = 0; }
        if (heir) { bio(heir, `Herdou a casa de ${v.name}.`, `Herdei a casa de ${v.name}`); A.note(heir, 'memory', `Herdei a casa de ${v.name}.`, NOTE); }
      }
      if (b.encomenda && b.encomenda.fam.includes(v.id)) {
        b.encomenda.fam = b.encomenda.fam.filter(id => id !== v.id); if (b.encomenda.by === v.id) b.encomenda.by = b.encomenda.fam[0] || 0; if (!b.encomenda.fam.length) b.dono = 0;
        // (a family's own work with no grown hands of the family left: the people's builders' from now, D-222)
        // (and while it is the family's own, the work is of the one of it who answers for it now)
        if (b.encomenda.maos && !b.built) { if (!hands(b).length) b.encomenda.maos = 0; else if (!b.encomenda.fam.includes(b.dono)) b.dono = b.encomenda.by; HW = null; }
      }
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
    // (the family's own hands: said so, and what the work waits for — D-223)
    if (w && w.encomenda.maos) { const nm = G.Village.buildName(w).toLowerCase().replace(/ \(obra\)$/, ''); const lack = Object.keys(w.need || {}).some(k => w.need[k] > EPS && G.Fac.free(w.set, k) < 1); out.goals.push({ id: w.id, kind: 'goal', src: 'casa-nova', txt: `Não juntamos o preço de uma casa: estamos levantando a nossa ${nm} com as nossas mãos (${Math.round((w.progress || 0) * 100)}%)${lack ? ' — falta madeira no armazém do povo' : ''}.`, day: w.encomenda.d, prog: w.progress || 0 }); return; }
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
    // (short of the price and too many for the beds: the other road, with its cause — D-223)
    const more = has + EPS < alvo ? K.roadSays(K.road(v, { set, why })) : '';
    out.goals.push({ id: v.id, kind: 'goal', src: 'casa-nova', txt: `Uma casa para a família (${WHY[why]}): ${said}${more ? ' — ' + more : ''}.`, day: h && h.poupa ? h.poupa.d : G.S.day, prog: Math.min(1, has / alvo), drop: 'casa-nova' });
  });
  // a house that saves buys no luxury (act-compras.js asks)
  K.saving = h => !!(h && h.poupa && P(h.poupa.by) && P(h.poupa.by).home === h.id);

  // ------------------------------ the house's card: why it is full (D-223) ------------------------------
  // a house with more people than beds says who the town's day asks to leave it — its youngest family (K.queue) — and what
  // keeps that family there today: the price, the turn, the wood, the work under way. Reads only (the god's card: it knows all)
  K.fullSays = function (b, plink, esc) {
    const S = G.S; if (!built(b) || b.type === 'barraco') return '';
    const L = residents(b); const cap = beds(b); if (L.length <= cap) return '';
    const set = S.settlements.get(b.set); if (!set) return '';
    const seen = new Set(); let fams = 0, lone = 0;
    for (const v of L) { if (v.age < 16 || seen.has(v.id)) continue; const fm = K.family(v); for (const m of fm) seen.add(m.id); if (fm.length > 1) fams++; else lone++; }
    const who = `${fams > 1 ? fams + ' famílias' : fams ? 'uma família' : ''}${fams && lone ? ' e ' : ''}${lone ? (lone > 1 ? lone + ' crescidos solteiros' : 'um crescido solteiro') : ''}`;
    const head = `Casa cheia: ${L.length} moradores para ${cap} camas${who ? ' — ' + who : ''}.`;
    const e = K.queue(set).find(q => q[0].home === b.id);
    if (!e) return `<div class="doing">${head} Ninguém daqui tem de sair hoje${lone ? ': os crescidos solteiros se mudam quando outra casa tiver lugar' : ''}.</div>`;
    const v = e[0]; const fam = K.family(v); const de = `A família de ${plink(v.id)} (${fam.length})`;
    const w = K.waiting(v); let txt;
    if (w) txt = w.encomenda.maos ? `${de} está levantando a sua cabana com as próprias mãos (${Math.round((w.progress || 0) * 100)}%).` : `${de} espera a casa que pagou ficar pronta (${Math.round((w.progress || 0) * 100)}%).`;
    else if (K.gaveUp(v)) txt = `${de} deixou a casa nova para depois.`;
    else if (!coinPeople(set)) { const plan = K.plan(v, fam, set, null, e[1]); const no = plan.free ? '' : K.cannotRaise(set, plan.type); txt = no ? `${de} pediu uma casa ao povo: ${esc(no.charAt(0).toLowerCase() + no.slice(1))}` : `${de} espera a vez de pedir uma casa ao povo.`; }
    else {
      const plan = K.plan(v, fam, set, null, e[1]); const has = K.savings(v); const preco = `${Math.floor(has)} de ${Math.ceil(plan.price + K.KEEP)} moedas`;
      if (has + EPS >= plan.price + K.KEEP) { const no = plan.free ? '' : K.cannotRaise(set, plan.type); txt = no ? `${de} tem o preço de outra casa, mas ${esc(no.charAt(0).toLowerCase() + no.slice(1))}` : `${de} tem o preço de outra casa e espera a vez (a cidade decide uma casa por dia).`; }
      else {
        const rd = K.road(v, { fam, set, plan, why: e[1] });
        txt = rd.kind === 'cede' ? `${de} não tem o preço de outra casa (${preco}): o povo vai dar-lhe a que tem vazia.`
          : rd.kind === 'maos' ? (rd.wait > 0 ? `${de} junta o preço de outra casa (${preco}); em ${rd.wait} dia${rd.wait > 1 ? 's' : ''} sem ele, levanta a sua cabana com as próprias mãos.` : rd.chao ? `${de} não juntou o preço de outra casa (${preco}), e a cidade não tem chão livre para ela levantar a sua cabana.` : `${de} não juntou o preço de outra casa (${preco}): vai levantar a sua cabana com as próprias mãos.`)
            : rd.why === 'madeira' ? `${de} não junta o preço de outra casa (${preco}), e o povo não tem madeira de sobra para ela levantar a sua cabana.`
              : rd.why === 'obras' ? `${de} não junta o preço de outra casa (${preco}), e já há cabanas demais sendo levantadas na cidade.`
                : rd.why === 'pequena' ? `${de} não junta o preço de outra casa (${preco}), e numa cabana viveria mais apertada do que aqui.`
                  : `${de} é grande demais para as camas que tem e não junta o preço de uma casa maior (${preco}).`;
      }
    }
    return `<div class="doing">${head} ${txt}</div>`;
  };
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) { return oldHTML.apply(this, arguments) + (b && b.built && housing(b) ? K.fullSays(b, plink, esc) : ''); };
})(window.G);
