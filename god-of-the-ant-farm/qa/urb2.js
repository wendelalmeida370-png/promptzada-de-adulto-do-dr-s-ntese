// urb2: node urb2.js [semente] — the life of the town, provoked on purpose (UR-B to UR-E)
//  1 cargo on the quay: crates carried into the warehouse, and only then in the store
//  2 the tavern brews the drink of its people, rounds cost coin, too many weigh on the morning
//  3 the gardens of the houses at the airy edge of town: tended, harvested, food in the families' pantries
//  4 a house burns: its family sleeps in the street (for that reason), raises a shack, and leaves it for a house
//  5 a thief with a reason steals coin at night; the watchman sees it, takes him to the jail; the coin goes back home
//  6 the prisoner stays in his cell through a save, and walks out when the law says
//  7 the checker finds nothing wrong, before and after the save
//  8 the theft on the night of the feast: the guard who saw it is at the feast, and arrests when it is over (D-126)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const seed = +(process.argv[2] || 7);
const GAME = process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(GAME); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  const t0 = Date.now(); const res = []; const ok = (n, c, d) => res.push(`${c ? 'PASSOU' : 'FALHOU'} | ${n} | ${d}`);
  await page.evaluate(seed => { G.Main.newGame({ type: 'continente', size: 112, tribes: 2, seed, temper: 'pacifico' }); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; }, seed);
  // years of a blessed life, until the biggest town has a few streets' worth of grown-ups (a tavern keeper and a watch are not
  // for a hamlet: thirty — with twenty, Hedeby's 6 fishermen, 4 builders, 4 farmers, 2 priests and 2 hunters left no hands for
  // wood and forage, and the cut of the minimum rest (D-090) took every trade of the town, the tavern's keeper with them, even
  // with the stores full, T-336)
  await page.evaluate(() => {
    const S = G.S; let bt = 0, chk = 0, A = 0; S.blessed = true;
    const grown = () => { const s = G.Village.mainSettlement(); let n = 0; if (s) for (const v of S.villagers.values()) if (v.set === s.id && v.age >= 18 && !v.captive) n++; return n; };
    while (S.day < 12 || (S.day < 40 && A < 30)) { G.debug.step(0.1); if ((chk -= 0.1) <= 0) { chk = 5; A = grown(); } if ((bt -= 0.1) <= 0) { bt = 2; S.divinePeace = G.DAY_LEN; S.weather.fertility = G.DAY_LEN; } }
    window.__set = G.Village.mainSettlement(); const set = window.__set;
    const f = G.Fac.get(set.fac); G.Civ.learn && !G.Civ.has(f.id, 'moeda') && G.Civ.learn(f, 'moeda', 'teste');
    f.stock.food += 400; f.stock.wood += 200; f.stock.stone += 200;
    // (and its stores of food, wood and stone full, so that it needs fewer hands for them: at thirty grown-ups, with the stores
    // as they were, the cut of the minimum rest (D-090) still took every trade, the keeper with them; with them full, the town
    // gives its tavern the keeper by its own sharing of the trades, T-336)
    const cap = G.Village.cap(f.id) * 0.95; for (const k of ['food', 'wood', 'stone']) f.stock[k] = Math.max(f.stock[k] || 0, cap);
  });
  const step = (secs) => page.evaluate(n => { for (let k = 0; k < n; k++) G.debug.step(0.1); }, Math.round(secs * 10));
  const until = async (fn, maxSecs, arg) => { for (let k = 0; k < maxSecs / 5; k++) { const r = await page.evaluate(fn, arg); if (r) return r; await step(5); } return page.evaluate(fn, arg); };
  // helpers in the page: a free spot near a point, a building put down finished, a person given a trade
  await page.evaluate(() => {
    window.__spot = (x, y, w, h, r) => { const S = G.S, N = G.N; for (let rr = 2; rr < (r || 14); rr++) for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; const bx = Math.floor(x + Math.cos(a) * rr), by = Math.floor(y + Math.sin(a) * rr); let okk = true; for (let ty = by - 1; ty < by + h + 1 && okk; ty++) for (let tx = bx - 1; tx < bx + w + 1; tx++) { if (!G.W.inb(tx, ty)) { okk = false; break; } const i = ty * N + tx; if (S.type[i] < G.T.SAND || S.occ[i] || S.objAt[i] || S.treeAt[i] || S.road[i] || S.wall[i]) { okk = false; break; } } if (okk) return [bx, by]; } return null; };
    window.__put = (type, x, y) => { const set = window.__set; const p = G.Village.findSite(set, type) || window.__spot(x, y, G.BDEF[type].w, G.BDEF[type].h, 18); if (!p) return null; const b = G.Village.addBuilding(type, p[0], p[1], set.id, true); G.W.touchWalk(); return b; };
    window.__adults = () => [...G.S.villagers.values()].filter(v => v.set === window.__set.id && !v.captive && v.age >= 18 && v.age < 55 && !v.aboard);
  });

  // 1 the quay
  const q = await page.evaluate(() => {
    const S = G.S; const set = window.__set; const f = G.Fac.get(set.fac);
    let dock = [...S.buildings.values()].find(b => b.type === 'doca' && b.set === set.id && b.built);
    if (!dock) { const p = G.City.dockSite(set); if (p) { dock = G.Village.addBuilding('doca', p[0], p[1], set.id, true); G.W.touchWalk(); } }
    if (!dock) return { skip: 'sem litoral' };
    let w = [...S.buildings.values()].find(b => b.type === 'armazem' && b.set === set.id && b.built) || window.__put('armazem', dock.x, dock.y);
    if (!w) return { skip: 'sem lugar para o armazém' };
    const hand = window.__adults().find(v => v.role !== 'guerreiro'); hand.role = 'estivador'; hand.job = w.id; G.Vg.endTask(hand);
    // (the cloth comes out of a ship's hold, as every cargo of the depot does — the porto's own cases' hand: a landing with no
    // ship lands nothing, and the case passed only while other ships' food emptied the quay and filled the imports; with
    // the final worlds the food never fitted the store, the unloading waited «cheio», and no cloth had come ashore, T-197)
    const sh = S.ships.find(s => s.kind === 'mercante') || S.ships[0]; if (!sh) return { skip: 'nenhum navio no mundo' };
    // (the cloth that the porters' hands put into the people's store — the ledger's «depositar», counted as it happens)
    window.__clothIn = 0; G.Depot.onMove.push(e => { if (e[5] === 'tecido' && e[4] === 'f:' + f.id && e[8] === 'depositar' && /^v:/.test(e[3])) window.__clothIn += e[6]; });
    // (what comes down on the quay: a quay with little room takes part of the hold — the rest stays aboard —, and the case is that
    // what came down walks to the store: the measures of the case's own crates, T-438)
    const cloth0 = (dock.crates || []).filter(c => c.k === 'tecido'); const n0 = cloth0.reduce((a, c) => a + (c.n || 0), 0);
    sh.goods = { k: 'tecido', n: 12 }; G.Harbor.land(dock, sh.goods, sh);
    const cl = (dock.crates || []).filter(c => c.k === 'tecido'); const cloth = cl.length - cloth0.length; const landed = Math.round((cl.reduce((a, c) => a + (c.n || 0), 0) - n0) * 100) / 100;
    return { dock: dock.id, w: w.id, hand: hand.id, crates: cloth, landed };
  });
  if (q.skip) ok('1 a carga do navio desce no cais e vai a pé ao armazém', true, `(sem prova: ${q.skip})`);
  else {
    // (the case's own cargo: its cloth crates off the quay, and the cloth in the store by the porters' hands; the quay of a
    // busy port has other crates on it all the time)
    await page.evaluate(() => { window.__cloth = o => { const d = G.S.buildings.get(o.dock); return { left: (d.crates || []).filter(c => c.k === 'tecido').length, inn: Math.round(window.__clothIn * 100) / 100 }; }; });
    await until(o => { const r = window.__cloth(o); return r.left === 0 && r.inn >= o.landed - 1e-6 ? 1 : null; }, 400, q);
    const fin = await page.evaluate(o => window.__cloth(o), q);
    ok('1 a carga do navio desce no cais e vai a pé ao armazém', q.crates > 0 && q.landed > 0 && fin.left === 0 && fin.inn >= q.landed - 1e-6, `${q.crates} caixas de tecido no cais (${q.landed} medidas das 12 do porão); depois: ${fin.left} no cais, ${fin.inn} medidas entraram no estoque pelas mãos dos estivadores`);
  }

  // 2 the tavern
  const tv = await page.evaluate(() => {
    const S = G.S; const home = window.__set;
    // (the town's own tavern, if it has one: under the ceiling of the trades a town gives its taverns the keepers its shares
    // ask (D-090), and a second tavern put down by the test stood empty beside the first, its keeper at the old one, T-336)
    const own = s => [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built && b.set === s.id).sort((a, b) => a.id - b.id)[0] || null;
    let set = home, t = own(home) || window.__put('taverna', home.cx, home.cy);
    // (and a town with no tavern and no room for one — its planner gives no site, and no free ground near its heart —: the
    // tavern the world has, of the most peopled town with one, its own people the drinkers, its people taught the coin as the
    // first town's was. Roma of the seed 7, of the coast, had a third of its circle under water and the rest built or wooded;
    // a tavern put down on its first free ground, 30 tiles out, served nobody in three evenings, T-382)
    if (!t) { const o = [...S.settlements.values()].map(s => ({ s, t: own(s) })).filter(o => o.t).sort((a, b) => G.Village.pop(b.s.id) - G.Village.pop(a.s.id) || a.s.id - b.s.id)[0]; if (o) { set = o.s; t = o.t; } }
    if (!t) return { skip: 'sem lugar' };
    window.__tset = set; const f = G.Fac.get(set.fac); G.Civ.learn && !G.Civ.has(f.id, 'moeda') && G.Civ.learn(f, 'moeda', 'teste');
    if (!t.inv) t.inv = {}; if ((t.inv.food || 0) < 10) G.Depot.make('b:' + t.id, 'food', 10 - (t.inv.food || 0), { code: 'teste' }); // (the meals of the house, by the ledger)
    const drinkers = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && v.age >= 18 && v.age < 55 && !v.aboard).filter(v => v.home && v.role !== 'taverneiro' && v.role !== 'estivador' && v.role !== 'pescador' && !(v.task && v.task.type === 'fest')).slice(0, 4);
    for (const v of drinkers) { const h = G.S.buildings.get(v.home); if (h) h.coin = (h.coin || 0) + 10; }
    return { t: t.id, drinkers: drinkers.map(v => v.id), drink: G.Tavern.DRINK[f.civ || 'classico'].k, civ: f.civ, town: set === home ? '' : set.name };
  });
  if (tv.skip) ok('2 a taverna faz a bebida do seu povo e cobra cada rodada', false, tv.skip);
  else {
    // (the town gives the tavern its keeper; the keeper brews when the shelf is low)
    const kp = await until(o => [...G.S.villagers.values()].find(v => v.job === o.t && v.role === 'taverneiro') ? 1 : 0, 200, tv);
    // (with none — a town at the ceiling of its trades, D-090, gives its tavern no keeper — a grown one of the tavern's town
    // takes up the trade by the god's hand, as one takes up a trade (lazer.js), and keeps it for the case: the town's board
    // would deal him back at its next pass. The tavern of the P2 (D-077) opens its day only with its keeper at hand, T-382)
    await page.evaluate(o => {
      const S = G.S; const set = window.__tset || window.__set;
      let k = [...S.villagers.values()].find(v => v.job === o.t && v.role === 'taverneiro');
      if (!k) { k = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v.aboard && v.age >= 18 && v.age < 55 && v.role !== 'guerreiro' && !o.drinkers.includes(v.id)).sort((a, c) => a.id - c.id)[0]; if (k) { k.role = 'taverneiro'; k.job = o.t; G.Vg.endTask(k); } }
      window.__kid = k ? k.id : 0; window.__step0 = G.debug.step;
      G.debug.step = dt => { window.__step0(dt); const v = G.S.villagers.get(window.__kid); if (v && (v.role !== 'taverneiro' || v.job !== o.t)) { v.role = 'taverneiro'; v.job = o.t; } };
    }, tv);
    // (a people that brews its drink waits for the first vat; one whose drink comes from the stores waits for the shelf)
    await until(o => { const b = G.S.buildings.get(o.t); return ['cerveja', 'pulque'].includes(o.drink) ? (b.brewed || 0) > 0 : (b.brewed || 0) > 0 || G.Tavern.onShelf(b); }, 400, tv);
    // the evening (not a feast night: the feast takes everyone to the square): the shelf stocked by the ledger, as qa/taverna.js
    // stocks it — the meals and the people's own drink —, the keeper at the counter just before the opening, the day opened by
    // the world at its hour; then the drinkers, fed and rested, brought to the street of the tavern and sent by the world's own
    // choice of a customer (G.Taverna.visitTask: an open tavern in reach, a seat, coin in the house). An errand given by hand
    // without the day carried no deal of the P2's tavern and was dropped at once: the case passed only when one of the four
    // went of his own will, T-382 (a storm, a fire, a call can spoil an evening: up to three evenings)
    let r2 = null, r3 = null;
    for (let k = 0; k < 3 && !(r3 && r3.paid > 0); k++) {
      if (k) await until(() => G.S.time > 0.3 && G.S.time < 0.45 ? 1 : 0, 220);
      await until(() => !G.Fest.active((window.__tset || window.__set).id), 300);
      // (and not a feast night: a town has its feast of the year at its hour — the jól of Hedeby at 0,81 —, and the feast takes
      // everyone free, the tavern's keeper among them: the evening of the case is one with the year's feast held, T-438)
      await page.evaluate(() => { const t = window.__tset || window.__set; t.festPlan = { day: G.S.day, key: null, done: true }; });
      r2 = await page.evaluate(o => {
        const S = G.S, T = G.Taverna, D = G.Depot; const b = S.buildings.get(o.t); const ref = 'b:' + b.id;
        if (D.free(ref, 'food') < 6) D.make(ref, 'food', 6 - D.free(ref, 'food'), { code: 'teste', part: true });
        if (D.free(ref, o.drink) < 2) D.make(ref, o.drink, 2 - D.free(ref, o.drink), { code: 'teste', part: true });
        const kv = S.villagers.get(window.__kid); const dr = G.Vg.door(b);
        if (kv) { G.Vg.endTask(kv); kv.sleeping = false; kv.inside = 0; kv.x = dr[0]; kv.y = dr[1]; kv.path = null; kv.hunger = Math.min(kv.hunger, 10); kv.energy = Math.max(kv.energy, 85); }
        S.time = T.horas(b).abre - 0.005; S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0;
        return { brewed: b.brewed || 0, shelf: G.Tavern.onShelf(b), keeper: !!kv };
      }, tv);
      const opened = await until(o => (G.Taverna.aberta(G.S.buildings.get(o.t)) ? 1 : 0), 30, tv);
      // (the drinkers go when the working day is over — the evening, G.isEvening, when the world's own choice offers the tavern:
      // sent at the opening, 0,575, the farmers of the seed 7 were taken back to their fields by their work, weightier than the
      // tavern's errand, and the tavern served the others — T-438)
      await until(() => (G.isEvening() ? 1 : 0), 30);
      const sent = await page.evaluate(o => {
        const S = G.S, T = G.Taverna; const b = S.buildings.get(o.t); const dr = G.Vg.door(b); let n = 0;
        const coin0 = o.drinkers.map(id => { const v = S.villagers.get(id); const h = v && S.buildings.get(v.home); return h ? h.coin : 0; }).reduce((a, x) => a + x, 0);
        for (const id of o.drinkers) {
          const v = S.villagers.get(id); if (!v || v.aboard || v.captive) continue;
          G.Vg.endTask(v); v.sleeping = false; v.inside = 0; v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 85);
          if (G.dist(v.x, v.y, dr[0], dr[1]) > 6) { v.x = dr[0] + 1.5; v.y = dr[1] + 1.5; v.path = null; }
          const t = T.visitTask(v, { setTask: (p, q) => G.Vg.setTask(p, q) }); if (t || (v.task && v.task.type === 'tavern')) n++;
        }
        return { n, coin0, L0: S.ledgerN };
      }, tv);
      r2 = Object.assign(r2, { opened: !!opened, sent: sent.n, coin0: sent.coin0, L0: sent.L0 });
      await step(60);
      // (what the rounds cost, by the ledger: the coins from the drinkers' houses (or purses) to the keeper's, in the deals of
      // the tavern's day, act-taverna.js — the tavern of the P2 keeps no «takings» of its own: the count of before was always 0,
      // T-336)
      r3 = await page.evaluate(o => { const S = G.S; const refs = new Set(o.drinkers.map(id => S.villagers.get(id)).filter(Boolean).map(v => G.Eco.coinRef(v))); const rows = G.Depot.ledger().filter(e => e[0] > o.L0 && e[8] === 'taverna' && e[5] === 'moedas' && refs.has(e[3])); const paid = rows.reduce((a, e) => a + e[6], 0), paidN = rows.length; const coin1 = o.drinkers.map(id => { const v = S.villagers.get(id); const h = v && S.buildings.get(v.home); return h ? h.coin : 0; }).reduce((a, n) => a + n, 0); return { paid, paidN, coin1 }; }, Object.assign({}, tv, { L0: r2.L0 }));
    }
    await page.evaluate(() => { if (window.__step0) { G.debug.step = window.__step0; window.__step0 = null; } });
    ok('2 a taverna faz a bebida do seu povo e cobra cada rodada', (r2.brewed > 0 || ['vinho', 'mel'].includes(tv.drink)) && r2.opened && r3.paid > 0, `${tv.town ? `a taverna de ${tv.town} (a cidade não tem lugar para uma) — ` : ''}${tv.civ || 'clássico'}: bebe ${tv.drink}; ${kp ? 'a cidade deu um taverneiro' : r2.keeper ? 'o taverneiro pela mão do deus' : 'sem taverneiro'}; feitas ${r2.brewed} medidas na casa; ${r2.opened ? 'aberta na hora dela' : 'NÃO ABRIU'}; ${r2.sent} de ${tv.drinkers.length} fregueses foram; pagas ${r3.paid.toFixed(1)} moedas pelo livro, em ${r3.paidN} contas da taverna (casas dos que beberam: ${r2.coin0.toFixed(1)} → ${r3.coin1.toFixed(1)}, com os salários do dia)`);
  }

  // 3 the gardens: the town gives its airy-edge houses a yard; the families tend them, pick them, and the food goes to their pantry
  const g0 = await page.evaluate(() => [...G.S.buildings.values()].filter(b => b.type === 'horta' && b.set === window.__set.id).length);
  const gw = await until(() => { const l = [...G.S.buildings.values()].filter(b => b.type === 'horta' && b.set === window.__set.id && (b.picked || 0) > 0 && (b.yield || 0) > 0 && G.S.buildings.get(b.home)); return l.length ? l.length : null; }, 1500);
  const gs = await page.evaluate(() => { const S = G.S; const l = [...S.buildings.values()].filter(b => b.type === 'horta' && b.set === window.__set.id); return { n: l.length, tended: l.filter(b => S.clock - (b.tend === undefined ? -1e9 : b.tend) < G.DAY_LEN * 1.5).length, picked: l.reduce((n, b) => n + (b.picked || 0), 0), food: l.reduce((n, b) => n + (b.yield || 0), 0), homes: l.filter(b => S.buildings.get(b.home)).length }; });
  ok('3 a horta do quintal: cuidada, colhida, comida na despensa', !!gw && gs.homes === gs.n, `${g0} hortas no começo, ${gs.n} agora (${gs.tended} cuidadas no último ano e meio); ${gs.picked} colheitas, ${gs.food} medidas de comida levadas às despensas; ${gs.n - gs.homes} sem casa`);

  // 4 the fire and the shack
  // houses burn, one after another, until the families that lost theirs cannot all find room (and there is no wood or stone to rebuild);
  // a crisis can also end another way — the homeless leave with a colony, die, marry into a house —: then more houses burn, up to three times
  const burn = prev => page.evaluate(prev => {
    const S = G.S; const set = window.__set;
    const ff = G.Fac.get(set.fac); ff.stock.wood = 0; ff.stock.stone = 0;
    const homes = [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type].housing && b.type !== 'barraco').sort((a, b) => a.id - b.id);
    const fams = prev.slice();
    // (out in the street of this town: one who left with settlers has no house here either, and is not the case's)
    const out = () => fams.filter(id => { const v = S.villagers.get(id); return v && v.set === set.id && !v.home && v.age >= 16 && !v.aboard; }).length;
    for (const h of homes) {
      G.Village.forceUpdate(); if (out() >= 4) break;
      for (const v of S.villagers.values()) if (v.home === h.id && !fams.includes(v.id)) fams.push(v.id);
      G.Village.destroyBuilding(h, 'fire');
    }
    G.Village.forceUpdate();
    return { fams, homes: homes.length };
  }, prev);
  // (no wood, no stone, at every step: the town cannot rebuild what burned. And it sends no settlers away while the case
  // runs — the crisis is the case: a city with its stone houses burnt falls back to a town after 36 looks (city.js), a
  // town that is no city sends a third of its people to found another (village.js checkExpansion), and the beds they
  // leave take the burnt families in before their second night in the street. With the final code, seed 7, Argos fell
  // back three minutes after the fire and sent sixteen away at the turn of the second day, in two fires of the three —
  // the young of the burnt houses among them —, T-215. So the god holds the city's standing and its patience for the
  // case, as he holds the wood and the stone)
  const dry = secs => page.evaluate(n => { const st = window.__set; const ff = G.Fac.get(st.fac); for (let k = 0; k < n; k++) { G.debug.step(0.1); ff.stock.wood = Math.min(ff.stock.wood, 0.5); ff.stock.stone = Math.min(ff.stock.stone, 0.5); st.tierLow = 0; st.fails = 0; } }, Math.round(secs * 10));
  const untilDry = async (fn, maxSecs, arg) => { for (let k = 0; k < maxSecs / 5; k++) { const r = await page.evaluate(fn, arg); if (r) return r; await dry(5); } return page.evaluate(fn, arg); };
  let fr = { fams: [] }, sh = null, rounds = 0; const day4 = await page.evaluate(() => G.S.day);
  for (; rounds < 3 && !sh; rounds++) {
    fr = await burn(fr.fams);
    sh = await untilDry(o => { const S = G.S; const vs = o.fams.map(id => S.villagers.get(id)).filter(Boolean); const why = vs.filter(v => v.ruaWhy === 'fogo').length; const inShack = vs.filter(v => v.home && (S.buildings.get(v.home) || {}).type === 'barraco').length; return inShack ? { why, inShack } : null; }, 700, fr);
  }
  const why = await page.evaluate(o => o.fams.map(id => G.S.villagers.get(id)).filter(Boolean).map(v => v.ruaWhy || (v.home ? (G.S.buildings.get(v.home) || {}).type : '-')), fr);
  // (settlers who left the town all the same, for the message: the hold is the case's premise)
  const went4 = await page.evaluate(d => { const nm = window.__set.name; return G.S.history.filter(h => h.d >= d && h.txt.includes('partiram de ' + nm + ' ')).map(h => h.d + ': ' + h.txt); }, day4);
  if (!sh) console.log('RUA ' + JSON.stringify(await page.evaluate(() => { const S = G.S; const set = window.__set; return { tier: set.tier, hi: G.Village.housingInfo(set.id), rua: [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 16 && !v.home).map(v => [v.name, v.rua, v.ruaWhy, v.task && v.task.type, v.task && v.task.pri]).slice(0, 8), day: S.day }; })));
  let left = null;
  if (sh) {
    await page.evaluate(() => { const ff = G.Fac.get(window.__set.fac); ff.stock.wood += 300; ff.stock.stone += 200; });
    // (who was in a shack, and later sleeps under a real roof: in a house with room, or in the shack turned into a hut)
    const inS = await page.evaluate(o => o.fams.filter(id => { const v = G.S.villagers.get(id); return v && v.home && (G.S.buildings.get(v.home) || {}).type === 'barraco'; }), fr);
    left = await until(ids => { const S = G.S; const out = ids.map(id => S.villagers.get(id)).filter(v => v && v.home && S.buildings.get(v.home) && S.buildings.get(v.home).type !== 'barraco' && G.BDEF[S.buildings.get(v.home).type].housing).length; return out ? out : null; }, 1200, inS);
  }
  ok('4 a casa queima: a família vai para a rua (por isso), levanta um barraco e depois sai dele', !!sh && !!left, sh ? `${rounds > 1 ? `(${rounds} incêndios) ` : ''}${sh.inShack} da família num barraco (motivos: ${[...new Set(why)].join(', ')}); ${left ? left + ' saíram do barraco para uma casa' : 'ninguém saiu do barraco'}` : `sem barraco em ${rounds} incêndios de 700 s; estado: ${[...new Set(why)].join(', ')}${went4.length ? `; a cidade mandou gente embora: ${went4.join(' · ')}` : ''}`);

  // 5 the theft
  const th = await page.evaluate(() => {
    const S = G.S; const set = window.__set; const f = G.Fac.get(set.fac);
    const rich = [...S.buildings.values()].find(b => b.set === set.id && b.built && G.BDEF[b.type].housing && b.type !== 'barraco'); if (!rich) return { skip: 'sem casa' };
    rich.coin = 40; f.gov = f.gov === 'tribo' || !f.gov ? 'reino' : f.gov;
    const ad = window.__adults(); const thief = ad.find(v => v.home && v.home !== rich.id && v.role !== 'guerreiro' && v.role !== 'pescador' && v.role !== 'estivador' && !(v.traits || []).includes('Devoto')); if (!thief) return { skip: 'sem ladrão' };
    const h = S.buildings.get(thief.home); if (h) h.coin = 0; thief.purse = 0; thief.thefts = 1; thief.traits = (thief.traits || []).filter(t => t !== 'Medroso');
    const guard = ad.find(v => v !== thief && (v.role === 'vigia' || v.role === 'guerreiro') && v.home !== rich.id) || ad.find(v => v !== thief && v.home !== rich.id); if (guard.role !== 'guerreiro') guard.role = 'vigia'; G.Vg.endTask(guard);
    // a jail with its jailer
    const jail = window.__put('cadeia', set.cx - 3, set.cy - 3) || (() => { const R = Math.max(8, set.radius || 8); for (const fr of [0.5, 0.8, 1.1]) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; const p = window.__spot(set.cx + Math.cos(a) * R * fr, set.cy + Math.sin(a) * R * fr, 2, 2, 8); if (p) { const b = G.Village.addBuilding('cadeia', p[0], p[1], set.id, true); G.W.touchWalk(); return b; } } return null; })();
    if (!jail) return { skip: 'sem lugar para a cadeia' };
    const jailer = ad.find(v => v !== thief && v !== guard && v.role !== 'taverneiro'); if (jail && jailer) { jailer.role = 'carcereiro'; jailer.job = jail.id; G.Vg.endTask(jailer); }
    // the night falls; the guard stands watch by the door, awake and rested (back and forth, for the night: at energy 20 the bed
    // came before the round, T-438)
    S.time = 0.76; set.festPlan = { day: S.day, key: null, done: true }; // (not a feast night: the feast of the year takes the watch from its round — T-438)
    const [dx, dy] = G.Vg.door(rich); guard.x = dx + 1.2; guard.y = dy + 0.8; guard.sleeping = false; guard.inside = 0; guard.energy = Math.max(guard.energy, 85); guard.hunger = Math.min(guard.hunger, 10); G.Vg.setTask(guard, { type: 'ronda', pts: Array.from({ length: 40 }, (_, k) => k % 2 ? [dx - 1.2, dy + 0.8] : [dx + 1.5, dy + 0.6]), k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' });
    thief.sleeping = false; thief.inside = 0; G.Vg.endTask(thief);
    G.Vg.setTask(thief, { type: 'furto', house: rich.id, pri: 2.05, st: 0, kind: 'furto' });
    // (the coins in and out of the thief's purse, as the ledger writes them: the house's own total moves with the day)
    window.__c5 = []; G.Depot.onMove.push(e => { if (e[5] === 'moedas' && (e[3] === 'p:' + thief.id || e[4] === 'p:' + thief.id)) window.__c5.push([e[3], e[4], e[6], e[8]]); });
    return { rich: rich.id, thief: thief.id, guard: guard.id, jail: jail ? jail.id : 0, coin0: rich.coin };
  });
  if (th.skip) ok('5 o roubo: a moeda muda de casa, o guarda vê, prende e leva à cadeia', false, th.skip);
  else {
    // (the night may be interrupted — a fire, a feast, an errand that takes the guard away —: if no one saw it, the thief tries again another night, up to five)
    let stole = null;
    for (let k = 0; k < 5 && !(stole && stole.seen >= 1); k++) {
      if (k) await page.evaluate(o => {
        const S = G.S; const t = S.villagers.get(o.thief), r = S.buildings.get(o.rich); if (!t || !r) return;
        let g = S.villagers.get(o.guard); const law = q => q && (q.role === 'vigia' || q.role === 'guerreiro'); if (!law(g) || (g.task && g.task.pri >= 3)) { g = window.__adults().find(v => law(v) && v !== t && !(v.task && v.task.pri >= 3)) || g; if (g && !law(g)) g.role = 'vigia'; if (g) o.guard = g.id; }
        S.time = 0.76; window.__set.festPlan = { day: S.day, key: null, done: true }; r.coin = o.coin0; const [dx, dy] = G.Vg.door(r);
        G.Vg.endTask(t); t.sleeping = false; t.inside = 0; G.Vg.setTask(t, { type: 'furto', house: r.id, pri: 2.05, st: 0, kind: 'furto' });
        if (g) { G.Vg.endTask(g); g.sleeping = false; g.inside = 0; g.energy = Math.max(g.energy, 85); g.hunger = Math.min(g.hunger, 10); g.x = dx + 1.2; g.y = dy + 0.8; G.Vg.setTask(g, { type: 'ronda', pts: Array.from({ length: 40 }, (_, i) => i % 2 ? [dx - 1.2, dy + 0.8] : [dx + 1.5, dy + 0.6]), k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' }); }
      }, th);
      const before = await page.evaluate(o => (G.S.crimes || []).filter(q => q.thief === o.thief).length, th);
      stole = await until(o => { const l = (G.S.crimes || []).filter(q => q.thief === o.thief); const c = l.length > o.before ? l[l.length - 1] : null; return c ? { id: c.id, n: c.n, seen: c.seen.length, flag: !!c.flag } : null; }, 60, Object.assign({ before }, th));
    }
    if (stole) th.crime = stole.id;
    const caught = await until(o => { const v = G.S.villagers.get(o.thief); return v && v.jail ? { jail: v.jail, until: v.jailUntil, task: v.task && v.task.type } : null; }, 200, th);
    const after = await page.evaluate(o => { const S = G.S; const c = (S.crimes || []).find(q => q.id === o.crime); const v = S.villagers.get(o.thief); return { st: c && c.st, how: c && c.how, coin: (S.buildings.get(o.rich) || {}).coin, purse: v ? v.purse : null }; }, th);
    // (the coin back home by its own line in the ledger — «devolvido», from the thief's purse to the house, what is left in
    // it of the theft —, not the house's total: a house of 40 coins buys at the market and pays its rounds the same day,
    // and with the final code, seed 7, the house went from 40 to 21,6 with the thief caught and the 6 given back, T-216)
    const coin5 = await page.evaluate(o => { const L = window.__c5 || [], P = 'p:' + o.thief, H = 'h:' + o.rich; const sum = f => Math.round(L.filter(f).reduce((a, e) => a + e[2], 0) * 100) / 100; return { took: sum(e => e[0] === H && e[1] === P && e[3] === 'roubo'), back: sum(e => e[0] === P && e[1] === H && e[3] === 'devolvido'), out: sum(e => e[0] === P && e[3] !== 'devolvido'), inn: sum(e => e[1] === P && e[3] !== 'roubo') }; }, th);
    const due5 = stole ? Math.min(stole.n, coin5.took + coin5.inn - coin5.out) : 0;
    ok('5 o roubo: a moeda muda de casa, o guarda vê, prende e leva à cadeia', !!stole && stole.seen >= 1 && !!caught && coin5.back > 0 && Math.abs(coin5.back - due5) < 0.01, stole ? `roubou ${stole.n} moedas (${stole.seen} testemunha${stole.seen > 1 ? 's' : ''}${stole.flag ? ', o guarda viu' : ''}); ${caught ? `preso até o ano ${caught.until} (${caught.task})` : 'não foi preso'}; ${after.how || ''}; de volta à casa pelo livro: ${coin5.back} de ${Math.round(due5 * 100) / 100}${coin5.out ? ` (o ladrão gastou ${coin5.out} antes)` : ''}; a casa: ${th.coin0} → ${after.coin && after.coin.toFixed(1)} moedas, com o dia dela` : 'não roubou');
    // 6 the cell through a save
    const A = await page.evaluate(() => QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg));
    await page.evaluate(() => G.Save.save(true));
    // (the load comes when the save has been read — the gzip is a promise —: the case waits for the new G.S, and then looks at
    // the town of now. The object of before is no longer the world's: a plan of the day marked on it is read by no one, and the
    // town's feast began at its hour — the jól of 0,81 in a night marked done, T-453)
    await page.evaluate(() => { window.__S0 = G.S; G.Main.continueGame(); });
    for (let k = 0; k < 400 && await page.evaluate(() => G.S === window.__S0); k++) await page.waitForTimeout(25);
    const loaded = await page.evaluate(() => { const n = G.S !== window.__S0; window.__S0 = null; G.UI.setSpeed(0); window.__set = G.S.settlements.get(window.__set.id) || window.__set; return n; });
    const kept = await page.evaluate(o => { const v = G.S.villagers.get(o.thief); return v ? { jail: v.jail, task: v.task && v.task.type, until: v.jailUntil } : null; }, th);
    const out = await until(o => { const v = G.S.villagers.get(o.thief); return v && !v.jail && G.S.day >= (o.until || 0) ? { day: G.S.day } : null; }, 1400, Object.assign({}, th, { until: caught ? caught.until : 0 }));
    const B = await page.evaluate(() => QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg));
    ok('6 o preso continua na cela depois do save e sai quando a lei manda', loaded && !!caught && kept && kept.jail === caught.jail && kept.task === 'cela' && !!out, `${loaded ? '' : 'O SAVE NÃO FOI CARREGADO; '}depois do save: ${kept ? `cadeia ${kept.jail}, ${kept.task}` : 'sumiu'}; ${out ? `solto no ano ${out.day}` : 'não saiu'}`);
    ok('7 o verificador não vê nada errado', !A.length && !B.length, `antes: ${A.slice(0, 3).join('; ') || 'nada'} · depois: ${B.slice(0, 3).join('; ') || 'nada'}`);
    // 8 the theft on the feast night (D-126): the feast of the year takes everyone, the watch too — the thieves' night —, and the
    // guard who saw the theft arrests after the feast (the arrest waits). The town's feast of the night begun at its hour, on the
    // town of now (the plan of the day kept by it: no second feast after it); case 5's guard on his round when it begins — the
    // feast takes him, or the case's guard is one of its people —; the same thief, out of the cell, not at the feast, poor again,
    // a few steps from the door on ground from which it is reached; a house standing, with its coins (the case 5's was going up
    // a floor by then — built false while the work lasts —, and a thief does not rob a work: the errand ended at its first step,
    // the way to the door was there, T-453). When the thief reaches in, the guard of the feast is by the door (the test's hand:
    // the feast passing by): he sees it, keeps the case and stays at the feast; when it is over, he goes after the thief
    await until(() => (G.Fest.active(window.__set.id) ? null : 1), 600);
    const f8 = await page.evaluate(o => {
      const S = G.S; const set = window.__set; const f = G.Fac.get(set.fac); const t = S.villagers.get(o.thief); if (!t || t.jail) return { skip: 'sem o ladrão solto' };
      let r = S.buildings.get(o.rich); if (!r || !r.built) r = [...S.buildings.values()].find(b => b.set === set.id && b.built && G.BDEF[b.type].housing && b.type !== 'barraco' && b.id !== t.home) || null;
      if (!r) return { skip: 'sem casa de pé' };
      // (the feasts of the night first: the theft is a night's)
      const all = G.Fest.of(f.civ).filter(k => !G.Fest.DEF[k].trigger); const keys = all.filter(k => G.Fest.DEF[k].at >= 0.6).concat(all.filter(k => G.Fest.DEF[k].at < 0.6));
      if (!keys.length) return { skip: `sem festa do povo (${f.civ})` };
      // (two to four steps from the door, on ground one walks, the door found from there: the guard of the feast stands there too)
      const [dx, dy] = G.Vg.door(r); let lugar = null; const probe = { x: 0, y: 0, inside: 0 };
      for (let rr = 2; rr <= 4 && !lugar; rr++) for (let k = 0; k < 16 && !lugar; k++) { const a = k / 16 * 6.283; const x = Math.floor(dx + Math.cos(a) * rr), y = Math.floor(dy + Math.sin(a) * rr); if (!G.W.inb(x, y) || !G.W.walkable(G.W.idx(x, y))) continue; probe.x = x + 0.5; probe.y = y + 0.5; if (G.W.reaches(probe, dx, dy) && G.W.findPath(probe.x, probe.y, dx, dy, false, 4000)) lugar = [x, y]; }
      if (!lugar) return { skip: 'nenhum chão perto da porta de onde se chegue a ela' };
      return { thief: t.id, guard: o.guard, rich: r.id, keys, lugar };
    }, th);
    if (f8.skip) ok('8 o roubo na noite da festa (D-126): o guarda que viu prende depois dela', false, f8.skip);
    else {
      const r8 = await page.evaluate(o => {
        const S = G.S, set = window.__set, F = G.Fest; const law = q => !!q && (q.role === 'vigia' || q.role === 'guerreiro');
        const awake = q => { q.sleeping = false; q.inside = 0; q.energy = Math.max(q.energy, 85); q.hunger = Math.min(q.hunger, 10); };
        // the night: case 5's guard on his round, where he is
        let g0 = S.villagers.get(o.guard); if (!(law(g0) && !g0.jail && !g0.aboard && !(g0.task && g0.task.pri >= 3))) g0 = null;
        if (g0) { G.Vg.endTask(g0); awake(g0); g0.hunt = 0; G.Vg.setTask(g0, { type: 'ronda', pts: Array.from({ length: 40 }, (_, i) => [g0.x + (i % 2 ? -1.5 : 1.5), g0.y]), k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' }); }
        // the feast of the night, at its hour
        let fe = null, key = null;
        for (const k of o.keys) { S.time = F.DEF[k].at + 0.002; set.festPlan = { day: S.day, key: null, done: true }; fe = F.start(set, k); if (fe) { key = k; break; } }
        if (!fe) return { skip: 'nenhuma festa do povo começou' };
        const on = () => { const a = F.active(set.id); return !!a && a.id === fe.id; };
        const inFest = q => !!q && !!q.task && q.task.type === 'fest' && q.task.fid === fe.id;
        const crowd = fe.parts.map(id => S.villagers.get(id)).filter(q => inFest(q) && q.task.role === 'crowd' && q.id !== o.thief && q.age >= 18 && q.age < 55);
        let g = null, how = '';
        if (inFest(g0)) { g = g0; how = 'a festa levou o guarda da ronda'; }
        else if ((g = crowd.find(law))) how = `a festa não levou o guarda da ronda; o guarda do caso é um ${g.role} da festa`;
        else if ((g = crowd[0])) { g.role = 'vigia'; how = 'a festa não levou o guarda da ronda; o guarda do caso é um da festa, feito vigia'; }
        if (!g) return { skip: 'nenhum adulto na festa para ser o guarda' };
        if (g0 && g0 !== g) G.Vg.endTask(g0); // (the round the feast did not take ends there: the case's guard is the feast's)
        g.hunt = 0;
        // the thief, away from the feast: his night is the other one
        const t = S.villagers.get(o.thief), r = S.buildings.get(o.rich); if (!t || t.jail || !r || !r.built) return { skip: 'sem o ladrão ou a casa' };
        r.coin = 40; const hm = S.buildings.get(t.home); if (hm) hm.coin = 0; t.purse = 0; t.thefts = 1; t.traits = (t.traits || []).filter(q => q !== 'Medroso');
        const go = () => { G.Vg.endTask(t); awake(t); t.x = o.lugar[0] + 0.5; t.y = o.lugar[1] + 0.5; t.path = null; G.Vg.setTask(t, { type: 'furto', house: r.id, pri: 2.05, st: 0, kind: 'furto' }); };
        go();
        const before = (S.crimes || []).filter(q => q.thief === o.thief).length;
        let crime = null, tries = 1;
        for (let k = 0; k < 900 && !crime && on(); k++) {
          if (!(t.task && t.task.type === 'furto')) { if (t.jail || tries >= 4) break; tries++; go(); }
          // (the guard of the feast by the door when the thief reaches in: the feast passing by)
          if (t.task && t.task.type === 'furto' && t.task.st === 2 && t.actT >= 2.7 && inFest(g)) { g.x = o.lugar[0] + 0.5; g.y = o.lugar[1] + 0.5; g.path = null; g.inside = 0; g.sleeping = false; }
          G.debug.step(0.1);
          const l = (S.crimes || []).filter(q => q.thief === o.thief); if (l.length > before) crime = l[l.length - 1];
        }
        if (!crime) return { skip: `o roubo não aconteceu durante a festa (${key}; ${tries} tentativas; o ladrão: ${t.task ? t.task.type + '/' + t.task.st : 'sem tarefa'}; a festa ${on() ? 'continua' : 'acabou'})` };
        const viu = crime.seen.includes(g.id), caca = g.hunt === crime.id;
        let s = 0, fim = null, preso = null, presoNaFesta = false, saiu = false;
        for (let k = 0; k < 6000 && preso === null; k++) {
          G.debug.step(0.1); s = Math.round((s + 0.1) * 10) / 10; const a = on();
          if (a && !inFest(g)) saiu = true;
          if (!a && fim === null) fim = s;
          if (t.jail) { preso = s; presoNaFesta = a; }
        }
        const c = (S.crimes || []).find(q => q.id === crime.id) || crime;
        const bad = QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg);
        return { key, how, tries, seen: crime.seen.length, viu, caca, saiu, fim, preso, presoNaFesta, by: c.by === g.id, bad };
      }, f8);
      ok('8 o roubo na noite da festa (D-126): o guarda que viu prende depois dela', !r8.skip && r8.viu && r8.caca && !r8.saiu && r8.fim !== null && r8.preso !== null && !r8.presoNaFesta && r8.preso >= r8.fim && r8.by && !r8.bad.length,
        r8.skip || `${r8.key}: ${r8.how}; o roubo na ${r8.tries}ª tentativa, ${r8.seen} testemunha${r8.seen > 1 ? 's' : ''} — o guarda ${r8.viu ? 'viu' : 'NÃO VIU'}, ${r8.caca ? 'guardou o caso' : 'NÃO GUARDOU o caso'} e ${r8.saiu ? 'SAIU DA FESTA' : 'ficou na festa'}; a festa acabou ${r8.fim === null ? 'NUNCA' : r8.fim + ' s depois'}; ${r8.preso === null ? 'o ladrão NÃO FOI PRESO' : r8.presoNaFesta ? `preso NA FESTA (${r8.preso} s)` : `preso ${Math.round((r8.preso - r8.fim) * 10) / 10} s depois dela, ${r8.by ? 'pelo guarda que viu' : 'POR OUTRO'}`}${r8.bad.length ? '; o verificador: ' + r8.bad.slice(0, 2).join('; ') : ''}`);
    }
  }
  const news = await page.evaluate(() => G.S.history.filter(h => /barraco|roub|prend|cadeia|horta|estivador|caixa|taverna|cela/i.test(h.txt)).slice(-8).map(h => h.d + ': ' + h.txt));
  console.log(`== urb2 semente ${seed}`); console.log('  crônica: ' + news.join(' | ').slice(0, 900));
  for (const l of res) console.log(l);
  console.log(`fim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 6).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
