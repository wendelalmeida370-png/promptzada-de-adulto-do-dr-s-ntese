// urb2: node urb2.js [semente] — the life of the town, provoked on purpose (UR-B to UR-E)
//  1 cargo on the quay: crates carried into the warehouse, and only then in the store
//  2 the tavern brews the drink of its people, rounds cost coin, too many weigh on the morning
//  3 the gardens of the houses at the airy edge of town: tended, harvested, food in the families' pantries
//  4 a house burns: its family sleeps in the street (for that reason), raises a shack, and leaves it for a house
//  5 a thief with a reason steals coin at night; the watchman sees it, takes him to the jail; the coin goes back home
//  6 the prisoner stays in his cell through a save, and walks out when the law says
//  7 the checker finds nothing wrong, before and after the save
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
  // years of a blessed life, until the biggest town has a few streets' worth of grown-ups (a tavern keeper and a watch are not for a hamlet)
  await page.evaluate(() => {
    const S = G.S; let bt = 0, chk = 0, A = 0; S.blessed = true;
    const grown = () => { const s = G.Village.mainSettlement(); let n = 0; if (s) for (const v of S.villagers.values()) if (v.set === s.id && v.age >= 18 && !v.captive) n++; return n; };
    while (S.day < 12 || (S.day < 40 && A < 20)) { G.debug.step(0.1); if ((chk -= 0.1) <= 0) { chk = 5; A = grown(); } if ((bt -= 0.1) <= 0) { bt = 2; S.divinePeace = G.DAY_LEN; S.weather.fertility = G.DAY_LEN; } }
    window.__set = G.Village.mainSettlement(); const set = window.__set;
    const f = G.Fac.get(set.fac); G.Civ.learn && !G.Civ.has(f.id, 'moeda') && G.Civ.learn(f, 'moeda', 'teste');
    f.stock.food += 400; f.stock.wood += 200; f.stock.stone += 200;
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
    sh.goods = { k: 'tecido', n: 12 }; G.Harbor.land(dock, sh.goods, sh);
    const cloth = (dock.crates || []).filter(c => c.k === 'tecido').length;
    return { dock: dock.id, w: w.id, hand: hand.id, crates: cloth };
  });
  if (q.skip) ok('1 a carga do navio desce no cais e vai a pé ao armazém', true, `(sem prova: ${q.skip})`);
  else {
    // (the case's own cargo: its cloth crates off the quay, and the cloth in the store by the porters' hands; the quay of a
    // busy port has other crates on it all the time)
    await page.evaluate(() => { window.__cloth = o => { const d = G.S.buildings.get(o.dock); return { left: (d.crates || []).filter(c => c.k === 'tecido').length, inn: Math.round(window.__clothIn * 100) / 100 }; }; });
    await until(o => { const r = window.__cloth(o); return r.left === 0 && r.inn >= 12 - 1e-6 ? 1 : null; }, 400, q);
    const fin = await page.evaluate(o => window.__cloth(o), q);
    ok('1 a carga do navio desce no cais e vai a pé ao armazém', q.crates > 0 && fin.left === 0 && fin.inn >= 12 - 1e-6, `${q.crates} caixas de tecido no cais; depois: ${fin.left} no cais, ${fin.inn} medidas entraram no estoque pelas mãos dos estivadores`);
  }

  // 2 the tavern
  const tv = await page.evaluate(() => {
    const S = G.S; const set = window.__set; const f = G.Fac.get(set.fac);
    const t = window.__put('taverna', set.cx, set.cy); if (!t) return { skip: 'sem lugar' };
    t.inv = { food: 10 };
    const drinkers = window.__adults().filter(v => v.home && v.role !== 'taverneiro' && v.role !== 'estivador' && v.role !== 'pescador' && !(v.task && v.task.type === 'fest')).slice(0, 4);
    for (const v of drinkers) { const h = G.S.buildings.get(v.home); if (h) h.coin = (h.coin || 0) + 10; }
    return { t: t.id, drinkers: drinkers.map(v => v.id), drink: G.Tavern.DRINK[f.civ || 'classico'].k, civ: f.civ };
  });
  if (tv.skip) ok('2 a taverna faz a bebida do seu povo e cobra cada rodada', false, tv.skip);
  else {
    // (the town gives the tavern its keeper; the keeper brews when the shelf is low)
    const kp = await until(o => [...G.S.villagers.values()].find(v => v.job === o.t) ? 1 : 0, 200, tv);
    // (a people that brews its drink waits for the first vat; one whose drink comes from the stores waits for the shelf)
    await until(o => { const b = G.S.buildings.get(o.t); return ['cerveja', 'pulque'].includes(o.drink) ? (b.brewed || 0) > 0 : (b.brewed || 0) > 0 || G.Tavern.onShelf(b); }, 400, tv);
    // the evening (not a feast night: the feast takes everyone to the square): the drinkers, fed and rested, go to the tavern
    // (a storm, a fire, a call can spoil an evening: up to three evenings)
    let r2 = null, r3 = null;
    for (let k = 0; k < 3 && !(r3 && r3.drinks.some(n => n >= 1)); k++) {
      if (k) await until(() => G.S.time > 0.55 && G.S.time < 0.6 ? 1 : 0, 220);
      await until(() => !G.Fest.active(window.__set.id), 300);
      r2 = await page.evaluate(o => {
        const S = G.S; const b = S.buildings.get(o.t); const I = b.inv || (b.inv = {});
        if (!G.Tavern.onShelf(b)) { I.cerveja = 6; } // (a people whose drink comes from the stores: the shelf filled by hand)
        if ((I.food || 0) < 4) I.food = 10;
        const coin0 = o.drinkers.map(id => { const v = S.villagers.get(id); const h = v && S.buildings.get(v.home); return h ? h.coin : 0; }).reduce((a, n) => a + n, 0);
        S.time = 0.62;
        for (const id of o.drinkers) { const v = S.villagers.get(id); if (!v || v.aboard) continue; G.Vg.endTask(v); v.sleeping = false; v.inside = 0; v.hunger = Math.min(v.hunger, 10); v.energy = Math.max(v.energy, 85); if (!(v.traits || []).includes('Sociável')) v.traits = (v.traits || []).concat(['Sociável']); G.Vg.setTask(v, { type: 'tavern', id: b.id, pri: 0.9 }); }
        return { coin0, brewed: b.brewed || 0, shelf: G.Tavern.onShelf(b), take0: b.takings || 0 };
      }, tv);
      await step(60);
      r3 = await page.evaluate(o => { const S = G.S; const take1 = S.buildings.get(o.t).takings || 0; const coin1 = o.drinkers.map(id => { const v = S.villagers.get(id); const h = v && S.buildings.get(v.home); return h ? h.coin : 0; }).reduce((a, n) => a + n, 0); return { take1, coin1, drinks: o.drinkers.map(id => (S.villagers.get(id) || {}).drinks || 0) }; }, tv);
    }
    ok('2 a taverna faz a bebida do seu povo e cobra cada rodada', (r2.brewed > 0 || ['vinho', 'mel'].includes(tv.drink)) && r3.drinks.some(n => n >= 1) && r3.take1 > r2.take0, `${tv.civ || 'clássico'}: bebe ${tv.drink}; ${kp ? 'a cidade deu um taverneiro' : 'sem taverneiro'}; feitas ${r2.brewed} medidas na casa; rodadas ${r3.drinks.join('/')}; a taverna recebeu ${(r3.take1 - r2.take0).toFixed(1)} moedas (casas dos que beberam: ${r2.coin0.toFixed(1)} → ${r3.coin1.toFixed(1)}, com os salários do dia)`);
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
    const out = () => fams.filter(id => { const v = S.villagers.get(id); return v && !v.home && v.age >= 16 && !v.aboard; }).length;
    for (const h of homes) {
      G.Village.forceUpdate(); if (out() >= 4) break;
      for (const v of S.villagers.values()) if (v.home === h.id && !fams.includes(v.id)) fams.push(v.id);
      G.Village.destroyBuilding(h, 'fire');
    }
    G.Village.forceUpdate();
    return { fams, homes: homes.length };
  }, prev);
  // (no wood, no stone, at every step: the town cannot rebuild what burned)
  const dry = secs => page.evaluate(n => { const ff = G.Fac.get(window.__set.fac); for (let k = 0; k < n; k++) { G.debug.step(0.1); ff.stock.wood = Math.min(ff.stock.wood, 0.5); ff.stock.stone = Math.min(ff.stock.stone, 0.5); } }, Math.round(secs * 10));
  const untilDry = async (fn, maxSecs, arg) => { for (let k = 0; k < maxSecs / 5; k++) { const r = await page.evaluate(fn, arg); if (r) return r; await dry(5); } return page.evaluate(fn, arg); };
  let fr = { fams: [] }, sh = null, rounds = 0;
  for (; rounds < 3 && !sh; rounds++) {
    fr = await burn(fr.fams);
    sh = await untilDry(o => { const S = G.S; const vs = o.fams.map(id => S.villagers.get(id)).filter(Boolean); const why = vs.filter(v => v.ruaWhy === 'fogo').length; const inShack = vs.filter(v => v.home && (S.buildings.get(v.home) || {}).type === 'barraco').length; return inShack ? { why, inShack } : null; }, 700, fr);
  }
  const why = await page.evaluate(o => o.fams.map(id => G.S.villagers.get(id)).filter(Boolean).map(v => v.ruaWhy || (v.home ? (G.S.buildings.get(v.home) || {}).type : '-')), fr);
  if (!sh) console.log('RUA ' + JSON.stringify(await page.evaluate(() => { const S = G.S; const set = window.__set; return { tier: set.tier, hi: G.Village.housingInfo(set.id), rua: [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 16 && !v.home).map(v => [v.name, v.rua, v.ruaWhy, v.task && v.task.type, v.task && v.task.pri]).slice(0, 8), day: S.day }; })));
  let left = null;
  if (sh) {
    await page.evaluate(() => { const ff = G.Fac.get(window.__set.fac); ff.stock.wood += 300; ff.stock.stone += 200; });
    // (who was in a shack, and later sleeps under a real roof: in a house with room, or in the shack turned into a hut)
    const inS = await page.evaluate(o => o.fams.filter(id => { const v = G.S.villagers.get(id); return v && v.home && (G.S.buildings.get(v.home) || {}).type === 'barraco'; }), fr);
    left = await until(ids => { const S = G.S; const out = ids.map(id => S.villagers.get(id)).filter(v => v && v.home && S.buildings.get(v.home) && S.buildings.get(v.home).type !== 'barraco' && G.BDEF[S.buildings.get(v.home).type].housing).length; return out ? out : null; }, 1200, inS);
  }
  ok('4 a casa queima: a família vai para a rua (por isso), levanta um barraco e depois sai dele', !!sh && !!left, sh ? `${rounds > 1 ? `(${rounds} incêndios) ` : ''}${sh.inShack} da família num barraco (motivos: ${[...new Set(why)].join(', ')}); ${left ? left + ' saíram do barraco para uma casa' : 'ninguém saiu do barraco'}` : `sem barraco em ${rounds} incêndios de 700 s; estado: ${[...new Set(why)].join(', ')}`);

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
    // the night falls; the guard stands watch by the door, awake (back and forth, for the night)
    S.time = 0.76;
    const [dx, dy] = G.Vg.door(rich); guard.x = dx + 1.2; guard.y = dy + 0.8; guard.sleeping = false; guard.inside = 0; G.Vg.setTask(guard, { type: 'ronda', pts: Array.from({ length: 40 }, (_, k) => k % 2 ? [dx - 1.2, dy + 0.8] : [dx + 1.5, dy + 0.6]), k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' });
    thief.sleeping = false; thief.inside = 0; G.Vg.endTask(thief);
    G.Vg.setTask(thief, { type: 'furto', house: rich.id, pri: 2.05, st: 0, kind: 'furto' });
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
        S.time = 0.76; r.coin = o.coin0; const [dx, dy] = G.Vg.door(r);
        G.Vg.endTask(t); t.sleeping = false; t.inside = 0; G.Vg.setTask(t, { type: 'furto', house: r.id, pri: 2.05, st: 0, kind: 'furto' });
        if (g) { G.Vg.endTask(g); g.sleeping = false; g.inside = 0; g.x = dx + 1.2; g.y = dy + 0.8; G.Vg.setTask(g, { type: 'ronda', pts: Array.from({ length: 40 }, (_, i) => i % 2 ? [dx - 1.2, dy + 0.8] : [dx + 1.5, dy + 0.6]), k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' }); }
      }, th);
      const before = await page.evaluate(o => (G.S.crimes || []).filter(q => q.thief === o.thief).length, th);
      stole = await until(o => { const l = (G.S.crimes || []).filter(q => q.thief === o.thief); const c = l.length > o.before ? l[l.length - 1] : null; return c ? { id: c.id, n: c.n, seen: c.seen.length, flag: !!c.flag } : null; }, 60, Object.assign({ before }, th));
    }
    if (stole) th.crime = stole.id;
    const caught = await until(o => { const v = G.S.villagers.get(o.thief); return v && v.jail ? { jail: v.jail, until: v.jailUntil, task: v.task && v.task.type } : null; }, 200, th);
    const after = await page.evaluate(o => { const S = G.S; const c = (S.crimes || []).find(q => q.id === o.crime); const v = S.villagers.get(o.thief); return { st: c && c.st, how: c && c.how, coin: (S.buildings.get(o.rich) || {}).coin, purse: v ? v.purse : null }; }, th);
    ok('5 o roubo: a moeda muda de casa, o guarda vê, prende e leva à cadeia', !!stole && stole.seen >= 1 && !!caught && after.coin >= th.coin0 - 0.01, stole ? `roubou ${stole.n} moedas (${stole.seen} testemunha${stole.seen > 1 ? 's' : ''}${stole.flag ? ', o guarda viu' : ''}); ${caught ? `preso até o ano ${caught.until} (${caught.task})` : 'não foi preso'}; ${after.how || ''}; a casa: ${th.coin0} → ${after.coin && after.coin.toFixed(1)} moedas` : 'não roubou');
    // 6 the cell through a save
    const A = await page.evaluate(() => QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg));
    await page.evaluate(() => G.Save.save(true));
    await page.evaluate(() => { G.Main.continueGame(); G.UI.setSpeed(0); });
    const kept = await page.evaluate(o => { const v = G.S.villagers.get(o.thief); return v ? { jail: v.jail, task: v.task && v.task.type, until: v.jailUntil } : null; }, th);
    const out = await until(o => { const v = G.S.villagers.get(o.thief); return v && !v.jail && G.S.day >= (o.until || 0) ? { day: G.S.day } : null; }, 1400, Object.assign({}, th, { until: caught ? caught.until : 0 }));
    const B = await page.evaluate(() => QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg));
    ok('6 o preso continua na cela depois do save e sai quando a lei manda', !!caught && kept && kept.jail === caught.jail && kept.task === 'cela' && !!out, `depois do save: ${kept ? `cadeia ${kept.jail}, ${kept.task}` : 'sumiu'}; ${out ? `solto no ano ${out.day}` : 'não saiu'}`);
    ok('7 o verificador não vê nada errado', !A.length && !B.length, `antes: ${A.slice(0, 3).join('; ') || 'nada'} · depois: ${B.slice(0, 3).join('; ') || 'nada'}`);
  }
  const news = await page.evaluate(() => G.S.history.filter(h => /barraco|roub|prend|cadeia|horta|estivador|caixa|taverna|cela/i.test(h.txt)).slice(-8).map(h => h.d + ': ' + h.txt));
  console.log(`== urb2 semente ${seed}`); console.log('  crônica: ' + news.join(' | ').slice(0, 900));
  for (const l of res) console.log(l);
  console.log(`fim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 6).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
