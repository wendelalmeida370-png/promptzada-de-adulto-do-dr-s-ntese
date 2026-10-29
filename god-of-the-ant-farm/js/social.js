'use strict';
// ============================================================
//  Who has a roof, and who does not. A grown-up without a home
//  in a town is counted, and the reason is kept: the house burnt
//  or fell in a war, it was pulled down for a great work, or the
//  town simply has no room for one more. When the street fills,
//  the homeless raise shacks of scraps on the cheapest ground at
//  the edge of town — by the river, by the docks — and a quarter
//  of shacks can grow there. A family leaves the shack for a
//  real house when one has room, or turns it into a hut of its
//  own when it has saved the coin; an empty shack falls down.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W; G.mapHooks.push(n => { N = n; });
  const U = G.Urban; const So = G.Social = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // ------------------------------ the shack ------------------------------
  Object.assign(G.BDEF, { barraco: { name: 'Barraco', w: 1, h: 1, cost: {}, work: 6, housing: 3, blocks: true, hp: 40 } });
  G.BDESC.barraco = 'Tábuas, barro e palha juntados por quem ficou sem casa. Abriga uma família até ela achar coisa melhor.';
  U.KINDS.informal = { name: 'Barracos', col: '#9a7a62', what: 'um bairro de barracos' };
  U.addWeight('barraco', { informal: 2.4 });
  U.addName('informal', (set, ctx) => ctx.river ? ['Palafitas do Rio', 'as'] : ctx.has('doca') ? ['Barracos do Cais', 'os'] : ctx.low ? ['Vila da Lama', 'a'] : ['Vila dos Barracos', 'a']);
  U.addBirth('informal', (s, d) => `Quem não achou casa em ${s.name} juntou tábuas e barro na borda da cidade: nasceu ${U.theName(d)}.`);

  // ------------------------------ why someone sleeps in the street ------------------------------
  // (the reason is kept on the person while it lasts: the house that burnt, the house pulled down, no room)
  const oldDestroy = G.Village.destroyBuilding;
  G.Village.destroyBuilding = function (b, cause) {
    if (b && G.BDEF[b.type] && G.BDEF[b.type].housing) for (const v of G.S.villagers.values()) if (v.home === b.id) v.lost = { day: G.S.day, why: cause === 'fire' ? 'fogo' : cause === 'quake' ? 'terremoto' : cause === 'meteor' || cause === 'lightning' ? 'raio' : cause === 'war' || cause === 'siege' || cause === 'raid' ? 'guerra' : 'ruína' };
    return oldDestroy(b, cause);
  };
  const WHY = { fogo: 'a casa pegou fogo', terremoto: 'a casa caiu no terremoto', raio: 'a casa foi destruída por um raio', guerra: 'a casa foi destruída na guerra', 'ruína': 'a casa virou ruína', obra: 'a casa foi derrubada para uma obra', barraco: 'o barraco caiu', lotada: 'a cidade não tem casa para todos', chegou: 'chegou à cidade e não achou lugar' };
  So.whyText = v => (v && v.rua ? WHY[v.ruaWhy] || WHY.lotada : null);
  function homeless(set) { const out = []; for (const v of G.S.villagers.values()) if (v.set === set.id && !v.captive && v.age >= 16 && !v.home && !v.aboard && !v.ug) out.push(v); return out; }

  // ------------------------------ a day in the street ------------------------------
  let lastDay = -1, cur = 0;
  G.worldHooks.push(() => { lastDay = -1; cur = 0; }); // (a new world, or a save loaded: it starts over)
  So.update = function (dt) {
    const S = G.S; if (!S) return;
    So.daylight(dt || 0);
    if (S.day !== lastDay) { lastDay = S.day; cur = 0; }
    const sets = [...S.settlements.values()].sort((a, b) => a.id - b.id);
    if (cur >= sets.length) return;
    const set = sets[cur++];
    // who lost the roof, and why
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || v.captive || v.age < 16) continue;
      if (v.home) { if (v.rua) { if (S.day - v.rua >= 3) v.ruaEnd = { from: v.rua, to: S.day, why: v.ruaWhy }; v.rua = 0; v.ruaWhy = null; } v.hh = v.home; continue; }
      if (v.aboard || v.ug) continue;
      if (!v.rua) {
        const had = v.hh && S.buildings.get(v.hh);
        v.ruaWhy = v.lost && S.day - v.lost.day <= 2 ? v.lost.why : v.hh ? (!had ? (v.hhType === 'barraco' ? 'barraco' : 'obra') : had.type === 'ruin' ? 'ruína' : 'lotada') : (v.age < 18 ? 'lotada' : 'chegou');
        v.rua = S.day; v.lost = null;
      }
    }
    for (const v of S.villagers.values()) if (v.set === set.id && v.home) { const h = S.buildings.get(v.home); v.hhType = h ? h.type : null; }
    shacks(set);
    moveUp(set);
  };
  // ------------------------------ the dear land goes to those who can pay for it ------------------------------
  // once a day in each city: the richest family living on cheap ground buys the house of a plainer family on dear ground
  // (the same size or bigger for both; the savings, the pantry, the goods and a merchant's house go with each family, and the price changes hands)
  const PRICE = 12;
  // (what the trade pays for a house: at least what it cost the family that has it — its materials and its ground, the coins
  // the buying or the work took: b.custo, act-casa.js —; the family that had just paid for its new sobrado was bought out the
  // next morning for twelve coins, L-236)
  const cost = b => (Number.isFinite(b.custo) && b.custo > 0 ? b.custo : 0);
  const priceOf = b => Math.max(PRICE, Math.round(cost(b) * 100) / 100);
  function moveUp(set) {
    const S = G.S; if ((set.tier || 0) < 3) return; const body = S.avatar ? S.avatar.id : 0;
    const sn = U.peek(set.id); if (!sn) return;
    const res = new Map(); for (const v of S.villagers.values()) if (v.set === set.id && v.home && !v.captive) { const l = res.get(v.home); if (l) l.push(v); else res.set(v.home, [v]); }
    const homes = [];
    for (const b of S.buildings.values()) {
      if (b.set !== set.id || !b.built || b.type === 'barraco' || !G.BDEF[b.type].housing || b.upgradeFrom) continue;
      const l = res.get(b.id); if (!l || !l.length || l.some(v => v.jail || v.aboard)) continue;
      const [cx, cy] = G.Village.center(b); const o = sn.cells.get(U.cellOf(cx, cy)); if (!o) continue;
      // (a family trades only a house of its own, where its owner lives: a let house is its owner's, not its tenants' to sell
      // or to give away — and the house of the god's body is the player's to leave, as in D-098 —, L-236)
      const own = l.some(v => v.id === b.dono) && !l.some(v => v.id === body);
      homes.push({ b, l, val: o.value, cap: G.BDEF[b.type].housing, own, rich: !!(b.elite || (b.coin || 0) >= 30 || l.some(v => v.grp === 'nobreza')) });
    }
    if (homes.length < 8) return;
    const vals = homes.map(h => h.val).sort((a, b) => a - b); const mid = vals[vals.length >> 1], high = vals[Math.floor(vals.length * 0.75)];
    let best = null, gain = 8;
    for (const r of homes) {
      if (!r.own || !r.rich || r.val >= mid || (r.b.coin || 0) < PRICE) continue;
      for (const p of homes) {
        if (!p.own || p.rich || p.val < high || (p.b.coin || 0) >= 10 || p.b.elite || p.cap < r.l.length || r.cap < p.l.length) continue;
        if ((r.b.coin || 0) + 1e-6 < priceOf(p.b)) continue; // (a rich family short of what the house cost does not buy it)
        if (p.val - r.val > gain) { gain = p.val - r.val; best = [r, p]; }
      }
    }
    if (!best) return;
    const [r, p] = best; const hr = r.b, hp = p.b;
    // the families trade roofs; what they own goes with them, through the ledger: the seller's things to the cheap house
    // first, then the buyer's (what was counted before) to the dear one, then the price from the buyer to the seller
    // (a merchant house — its banner, its trade — is the family's, not the walls': it moves too)
    const D = G.Depot; const listOf = b => Object.assign({}, D.list('h:' + b.id));
    const kr = listOf(hr), kp = listOf(hp);
    // (each family takes all of its own, as every move does — on the floor where the other house's chests and pantry are full,
    // D-059: the dear house's pantry no longer has to fit in the cheap one's before they trade, L-314)
    const by = (r.l.find(v => v.age >= 18) || r.l[0]).id;
    const price = priceOf(hp), gave = cost(hr);
    for (const [k, n] of Object.entries(kp)) if (n > 1e-6) D.move('h:' + hp.id, 'h:' + hr.id, k, n, { code: 'mudança', by, part: true, floor: true });
    for (const [k, n] of Object.entries(kr)) if (n > 1e-6) D.move('h:' + hr.id, 'h:' + hp.id, k, n, { code: 'mudança', by, part: true, floor: true });
    D.move('h:' + hp.id, 'h:' + hr.id, 'moedas', price, { code: 'compra-casa', by, part: true });
    // (what each house cost the family that has it now: the buyer, the price and the house it gave for it; the seller was paid
    // at least what its own had cost it — the cheap house costs it nothing)
    hp.custo = Math.round((price + gave) * 100) / 100; hr.custo = 0;
    const ke = b => ({ elite: b.elite || null, trade: b.trade || 0, tradeGood: b.tradeGood || null });
    const er = ke(hr), ep = ke(hp);
    hp.elite = er.elite; hp.trade = er.trade; hp.tradeGood = er.tradeGood; hr.elite = ep.elite; hr.trade = ep.trade; hr.tradeGood = ep.tradeGood;
    hp.dono = by; hr.dono = (p.l.find(v => v.age >= 18) || p.l[0]).id;
    for (const v of r.l) { v.home = hp.id; v.hhType = hp.type; }
    for (const v of p.l) { v.home = hr.id; v.hhType = hr.type; }
    const dTo = U.districtAt(hp.x + 0.5, hp.y + 0.5), dFrom = U.districtAt(hr.x + 0.5, hr.y + 0.5);
    const at = d => (d ? ' n' + U.theName(d).replace(/^(a|o|as|os) /, (m, x) => x + ' ') : '');
    const a = r.l.find(v => v.age >= 18) || r.l[0], q = p.l.find(v => v.age >= 18) || p.l[0];
    note(set, a, `comprou uma casa${at(dTo)} e se mudou com a família`);
    bio(a, `Comprou uma casa${at(dTo)}, em terra mais cara, e se mudou com a família.`, `Juntei o bastante para comprar uma casa${at(dTo)}`);
    note(set, q, `vendeu a casa${at(dTo)} e foi morar${at(dFrom) || ' na borda'}, com moedas no bolso`);
    bio(q, `Vendeu a casa${at(dTo)} e foi morar${at(dFrom) || ' mais longe do centro'}, com moedas no bolso.`, `Vendi a nossa casa${at(dTo)} — o centro tinha ficado caro demais para nós`);
  }
  // (the shacks themselves go up in daylight: once a day in each town, when the homeless are awake)
  let tR = 0;
  G.worldHooks.push(() => { tR = 0; });
  So.daylight = function (dt) {
    const S = G.S; tR += dt; if (tR < 6) return; tR = 0;
    if (S.time < 0.08 || S.time > 0.55) return;
    for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) raise(set);
  };

  // ------------------------------ the shacks ------------------------------
  function shacks(set) {
    const S = G.S; const t = set.tier || 0;
    const mine = []; for (const b of S.buildings.values()) if (b.set === set.id && b.type === 'barraco') mine.push(b);
    const res = new Map(); for (const v of S.villagers.values()) if (v.set === set.id && v.home) { const l = res.get(v.home); if (l) l.push(v); else res.set(v.home, [v]); }
    // a family that can, leaves: for a real house with room, or it builds walls of its own
    const space = new Map(); for (const b of S.buildings.values()) if (b.set === set.id && b.built && G.BDEF[b.type].housing && b.type !== 'barraco') space.set(b.id, G.BDEF[b.type].housing - (res.get(b.id) || []).length);
    for (const b of mine) {
      const l = res.get(b.id) || [];
      // (what was left in a shack that falls — a family gone, dead or taken — goes to the people's store, in the ledger)
      if (!l.length) { b.empty = (b.empty || 0) + 1; if (b.empty >= 2) { for (const [k, n] of Object.entries(G.Depot.list('h:' + b.id))) if (n > 1e-6) G.Depot.store('h:' + b.id, G.Village.facOfSet(set.id), k, n, { code: 'ruína' }); G.Village.removeBuilding(b); } continue; }
      b.empty = 0;
      let to = null; for (const [id, n] of space) if (n >= l.length) { to = id; break; }
      // (the family's things go with it to the house with room: the shack's coins and goods, in the ledger — all of them, on
      // the floor where the furniture is full: the shack left behind would give them to the people, D-059)
      if (to) { const by = (l.find(v => v.age >= 16) || l[0]).id; for (const [k, n] of Object.entries(G.Depot.list('h:' + b.id))) if (n > 1e-6) G.Depot.move('h:' + b.id, 'h:' + to, k, n, { code: 'mudança', by, part: true, floor: true }); for (const v of l) { v.home = to; v.hhType = S.buildings.get(to).type; } space.set(to, space.get(to) - l.length); if (S.day - (b.born || 0) >= 3) { note(set, l[0], `deixou o barraco e foi morar numa casa de verdade`); for (const v of l) if (v.age >= 16) bio(v, 'Deixou o barraco e foi morar numa casa de verdade.', 'Morei num barraco de tábuas até conseguir uma casa de verdade'); } continue; }
      const coin = b.coin || 0;
      // (the walls of a hut are the people's wood, paid at the treasury: through the ledger; no wood in the store, no hut. The
      // walls up, the plan is told at once, as when a work is done — the record stayed a shack's until the next turn of the
      // day, and the hut had the shack's plan and room the rest of that day, L-350)
      const f = G.Fac.get(G.Village.facOfSet(set.id)); const wood = G.BDEF.hut.cost.wood || 10;
      if (coin >= 12 && l.some(v => v.age >= 18) && f && G.Depot.free('f:' + f.id, 'wood') >= wood && G.Depot.move('h:' + b.id, 'f:' + f.id, 'moedas', 8, { code: 'obra-casa', by: l[0].id }).ok) { G.Depot.use('f:' + f.id, 'wood', wood, { code: 'obra-casa', by: l[0].id }); b.type = 'hut'; b.hp = b.maxHp = G.BDEF.hut.hp; b.dono = (l.find(v => v.age >= 18) || l[0]).id; b.custo = 8; W.touchWalk(); G.Interiors && G.Interiors.complete(b); note(set, l[0], 'juntou moedas e trocou o barraco por uma cabana de paredes firmes'); bio(l[0], 'Juntou moedas e trocou o barraco por uma cabana de paredes firmes.', 'Juntei moeda por moeda e troquei o barraco por uma cabana de paredes firmes'); }
    }
  }
  // the street is full: whoever has slept there two nights raises a shack (one or two a day, on the cheapest ground at the edge)
  // (an attempt cut short — a feast, a meal, the night — is tried again later the same day)
  function raise(set) {
    const S = G.S;
    if ((set.tier || 0) < 1) return;
    const all = homeless(set); if (!all.length) return;
    let room = 2 - (set.shackD === S.day ? set.shackN || 0 : 0) - all.filter(v => v.task && v.task.type === 'barraco').length;
    if (room <= 0) return;
    const hl = all.filter(v => S.day - (v.rua || S.day) >= 2 && !(v.task && v.task.pri >= 1.15) && !(v.shackTry && S.clock - v.shackTry < 30));
    for (const v of hl) {
      if (room <= 0) break;
      const p = siteFor(set); if (!p) break;
      if (G.Vg.give(v, { type: 'barraco', x: p[0], y: p[1], pri: 1.15, st: 0, kind: 'barraco' })) { v.shackTry = S.clock; room--; }
    }
  }
  // the cheapest ground at the edge: low land, by the water, near other shacks, never on a street
  function siteFor(set) {
    const S = G.S; const sn = U.peek(set.id); if (!sn) return null;
    let best = null, bs = -1e9;
    // (the edge of town is as far as its houses go)
    let far = 4; for (const b of S.buildings.values()) if (b.set === set.id && G.BDEF[b.type] && G.BDEF[b.type].housing) far = Math.max(far, G.dist(b.x + 0.5, b.y + 0.5, set.cx, set.cy));
    const shacksAt = []; for (const b of S.buildings.values()) if (b.set === set.id && b.type === 'barraco') shacksAt.push([b.x, b.y]);
    for (const o of sn.cells.values()) {
      if (!o.n || o.tiles / 36 > 0.5) continue;
      const [x0, y0] = U.cellXY(o.c);
      for (let y = y0; y < y0 + U.C; y++) for (let x = x0; x < x0 + U.C; x++) {
        if (x < 2 || y < 2 || x >= N - 2 || y >= N - 2) continue;
        const i = y * N + x; const tt = S.type[i];
        if (tt < T.SAND || S.occ[i] || S.objAt[i] || S.treeAt[i] || S.road[i] || S.wall[i] || S.fire[i] > 0 || (G.City && G.City.onStreet(set, i))) continue;
        if (W.slope(x, y, 1, 1) > 1.2) continue;
        let open = 0, block = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const j = (y + dy) * N + x + dx; const ob = S.occ[j] && S.buildings.get(S.occ[j]); if (ob && ob.blocks) block++; else if (W.walkable(j) && (dx === 0 || dy === 0)) open++; }
        if (open < 3 || block) continue; // (a ring of open ground around it, as for any house)
        const d = G.dist(x + 0.5, y + 0.5, set.cx, set.cy);
        let near = 99; for (const [sx, sy] of shacksAt) near = Math.min(near, Math.hypot(sx - x, sy - y));
        const sc = -o.value * 0.15 + (o.flood ? 2 : 0) + (o.river || o.sea ? 1 : 0) - Math.abs(d - far * 1.1) * 0.25 + (near < 99 ? -Math.abs(near - 2) * 0.6 : 0) + G.R() * 0.5;
        if (sc > bs) { bs = sc; best = [x, y]; }
      }
    }
    return best;
  }
  // raising the shack: an hour of hammering scraps together (and the family moves in)
  function runBarraco(v, t, dt, H) {
    const S = G.S;
    if (v.home) return H.end(v);
    if (t.st === 0) { if (!H.goto(v, t.x + 0.5, t.y + 1.3, false, 4000)) return H.end(v); t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt)) { t.st = 2; v.actT = 0; } else if (t.walk > 60) H.end(v); return; }
    G.faceTo(v, t.x + 0.5 - v.x, t.y + 0.5 - v.y); v.act = 'build';
    if (G.R() < dt * 0.8) { G.FX && G.FX.dust(t.x + 0.5, t.y + 0.5, 1); G.Audio && G.Audio.at(t.x, t.y, 'hammer'); }
    if (v.actT < 10) return;
    const i = t.y * N + t.x;
    if (S.occ[i] || S.objAt[i] || S.treeAt[i] || S.road[i] || S.wall[i]) return H.end(v);
    const b = G.Village.addBuilding('barraco', t.x, t.y, v.set, true);
    W.touchWalk(); v.shackTry = 0;
    const st = S.settlements.get(v.set); if (st) { if (st.shackD !== S.day) { st.shackD = S.day; st.shackN = 0; } st.shackN++; }
    v.home = b.id; v.hhType = 'barraco';
    const p = v.partner && S.villagers.get(v.partner); if (p && p.set === v.set && !p.home) p.home = b.id;
    for (const id of v.kids || []) { const k = S.villagers.get(id); if (k && k.set === v.set && k.age < 16 && !k.home) k.home = b.id; }
    const set = S.settlements.get(v.set);
    const why = So.whyText(v); bio(v, `Ficou sem casa${why ? ' (' + why + ')' : ''} e levantou um barraco de tábuas na borda de ${set ? set.name : 'uma cidade'}.`, `Dormi na rua${why ? ' quando ' + why.replace(/^a cidade não tem/, 'a cidade não tinha') : ''}, e levantei um barraco com as minhas mãos`);
    if (set && (set.tier || 0) >= 3 && !(set.urb && set.urb.shackNews >= S.day - 4)) { (set.urb || (set.urb = { d: [], names: [] })).shackNews = S.day; log(`${v.name} ${So.whyText(v) ? 'ficou sem casa — ' + So.whyText(v) + ' — e' : ''} levantou um barraco de tábuas na borda de ${set.name}.`, 'city', t.x, t.y); }
    H.end(v);
  }
  // the moments of a life that change its standing go into the person's story
  const bio = (v, third, first) => G.Life && G.Life.bio(v, 'note', third, first);
  function note(set, v, what) {
    const S = G.S; (v.moves || (v.moves = [])).push([S.day, what]); if (v.moves.length > 6) v.moves.shift();
    if ((set.tier || 0) >= 3 && G.R() < 0.35 && !(set.urb && set.urb.moveNews >= S.day - 3)) { (set.urb || (set.urb = { d: [], names: [] })).moveNews = S.day; log(`Em ${set.name}, ${v.name} ${what}.`, 'city', v.x, v.y); }
  }
  const E = G.Eco; const oldRun = E.run, oldText = E.taskText;
  E.run = function (v, t, dt, H) { if (t.type === 'barraco') return runBarraco(v, t, dt, H), true; return oldRun(v, t, dt, H); };
  E.taskText = function (v, t) { if (t.type === 'barraco') return 'Levantando um barraco de tábuas para dormir sob um teto'; return oldText(v, t); };

  // ------------------------------ how a shack looks ------------------------------
  if (G.Arch && G.Arch.kit) {
    const { P, poly, box, ln } = G.Arch.kit();
    G.Arch.EXT.barraco = { maxz: 26, draw(c, m, p, st, v) {
      const wood = ['#8a6a48', '#7a5a3a', '#9a7a52'][v % 3];
      box(c, -0.38, -0.34, 0.36, 0.34, 0, 8, wood, '#5e452e', '#a08060');
      for (let k = 1; k < 5; k++) ln(c, P(-0.38 + k * 0.15, 0.34, 0), P(-0.38 + k * 0.15, 0.34, 8), 'rgba(40,26,14,0.45)', 0.4);
      // a lean-to roof of straw or a patched cloth
      const roofC = st === 'nordico' ? '#6a7a4a' : v % 2 ? '#c8a860' : '#a8604a';
      poly(c, [P(-0.46, -0.42, 11), P(0.44, -0.42, 11), P(0.44, 0.44, 7.6), P(-0.46, 0.44, 7.6)], roofC);
      poly(c, [P(-0.1, 0.0, 9.8), P(0.2, 0.0, 9.8), P(0.2, 0.25, 8.5), P(-0.1, 0.25, 8.5)], 'rgba(90,70,50,0.6)');
      poly(c, [P(-0.12, 0.345, 0), P(0.1, 0.345, 0), P(0.1, 0.345, 5.5), P(-0.12, 0.345, 5.5)], '#3a2a1c');
      return 13;
    } };
  }
})(window.G);
