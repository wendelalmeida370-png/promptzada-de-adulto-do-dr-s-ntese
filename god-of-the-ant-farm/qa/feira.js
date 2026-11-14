// feira: a feira de ponta a ponta num mundo pronto, em Node, pelo qa/nodemundo.js — o mundo de verdade: o feirante pelas
// tarefas dele (economy.js: 'restock' e 'sell' da feira), as bancas da feira, o armazém do povo, a casa de quem compra e o livro.
// A feira é do povo: o feirante a abastece do armazém sem pagar, e o que se compra nela paga o tesouro.
//  f1 a manhã da feira: falta pano nas bancas; o feirante o traz do armazém (o livro: 'feira', marcado para a feira) e o põe
//     nelas ('entrega'): o que saiu do armazém é o que chegou às bancas
//  f2 a compra na feira: quem compra leva para casa pelo livro ('compra'), e as moedas vão ao tesouro do povo
//  f3 a feira fecha ao meio-dia: o feirante deixa a banca, e ninguém compra nas bancas fechadas — quem chega depois volta sem
//     (L-387: comprava nas bancas vazias)
//  f4 o feirante morre com a mercadoria a caminho das bancas: ela vai às bancas ('herdado')
//  f5 um save com a mercadoria a caminho: carregado, ela segue para as bancas (a carga marcada vai aonde é marcada)
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console.
//   node qa/feira.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/feira.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | feira ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
// (the snapshot after the trades the world's own step deals out once the world is open — a load gives them back as they
// were saved, L-419, and the ready worlds of the generation 7 are older than the trades of the Patch 2, which the load of
// before dealt at once; the twelve seconds stay for any world, a save of before too, T-298)
M.pronto(world); M.viver(12);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
const seen = []; D.onMove.push(e => { seen.push(e); });
G.inSim++;
const live = (sec, each, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (each) each(); if (until && until()) return true; } return false; };
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = B => QA.check().filter(q => q.sev <= 2 && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
const fit = v => v && !v.captive && !v.jail && !v.aboard && !v.held && v.age >= 16 && v.age < 60;
// (the fair with the most hands, in a town of coin if there is one)
function pick() {
  let best = null;
  for (const b of [...S().buildings.values()].sort((p, q) => p.id - q.id)) {
    if (b.type !== 'feira' || !b.built) continue;
    const ws = [...S().villagers.values()].filter(v => v.job === b.id && v.role === 'feirante' && fit(v)).length; if (!ws) continue;
    const sc = (E.coinage(V.facOfSet(b.set)) ? 100 : 0) + ws; if (!best || sc > best.sc) best = { id: b.id, sc };
  }
  return best && best.id;
}
const FAIR = pick();
if (!FAIR) { console.log(`FALHOU | feira mundo | ${world}: nenhuma feira com feirante`); process.exit(1); }
{ const b = S().buildings.get(FAIR); console.log(`${world}: a feira #${b.id} de ${S().settlements.get(b.set).name}${E.coinage(V.facOfSet(b.set)) ? ' (de moeda)' : ''}`); }
function setup(time) {
  fresh(); S().time = time; S().weather.rain = 0;
  const b = S().buildings.get(FAIR); const f = G.Fac.get(V.facOfSet(b.set));
  const crew = [...S().villagers.values()].filter(v => v.job === b.id && v.role === 'feirante' && fit(v)).sort((p, q) => p.id - q.id);
  if (D.free('f:' + f.id, 'tecido') < 8) D.make('f:' + f.id, 'tecido', 8, { code: 'teste', part: true });
  if (D.free('f:' + f.id, 'food') < 30) D.make('f:' + f.id, 'food', 30, { code: 'teste', part: true });
  return { b, f, crew, L0: seen.length, base: base() };
}
function send(v, at) {
  G.Vg.endTask(v); if (v.ug && G.Caves) G.Caves.exitNow(v); v.sleeping = false; v.inside = 0; v.energy = 95; v.hunger = 10;
  if (v.carry && v.carry.n > 1e-6 && v.carry.k !== 'water') G.Vg.toStore(v, G.Fac.idOfV(v), 'teste');
  if (at) { v.x = at[0] + 0.5; v.y = at[1] + 0.5; v.path = null; } v.think = 0;
  return G.Vg.H.workTask(v);
}
const lines = (P, f) => seen.slice(P.L0).filter(f);
const sum = L => r2(L.reduce((s, e) => s + e[6], 0));
const toFair = (v, P) => !!(v && v.carry && v.carry.to === 'b:' + P.b.id && v.carry.n > 1e-6);
// (the fair's tables without cloth, and a feirante sent until he brings it: the world's own door, a choice of his among his
// errands — the restock comes one time in two)
function restockNow(P) {
  const I = P.b.inv || (P.b.inv = {}); if (I.tecido > 0) D.use('b:' + P.b.id, 'tecido', I.tecido, { code: 'teste', mine: true });
  const st = V.nearestDropoff(P.b.x, P.b.y, P.b.set);
  for (let tries = 0; tries < 8; tries++) {
    for (const v of P.crew) if (!(v.task && v.task.type === 'restock') && !toFair(v, P)) send(v, st ? V.frontTile(st) : null);
    if (live(30, null, () => P.crew.some(v => toFair(v, P)))) return P.crew.find(v => toFair(v, P));
  }
  return null;
}
// a buyer of the town, with coins and room at home, sent to the fair for a good on its tables (the errand held above the
// day's leisure: at 0,35 a word in the street takes it — the test is the deal at the stall)
function buyer(P, k) {
  return [...S().villagers.values()].filter(o => o.set === P.b.set && fit(o) && o.home && !P.crew.includes(o) && D.get('h:' + o.home, 'moedas') >= 5 && D.room('h:' + o.home, k) >= 1).sort((a, c) => G.dist2(a.x, a.y, P.b.x, P.b.y) - G.dist2(c.x, c.y, P.b.x, P.b.y) || a.id - c.id)[0];
}
// (with free hands: what is in them put away first, as send() does — a purchase the two hands have no room for is not made, the
// world's rule (economy.js, runShop). In the Argos of the generation 16 the buyer, Jasão, had 3 of wood in his arms, and his
// errand ended at the stall without a word, «das bancas às mãos 0»)
// (and rested, as the feirante of send(): one worn out goes to bed over the errand — the sleep of one under 8 of energy, 2,5 —; in the
// Argos of the generation 18 the buyer, Clio, of the town's secret society, came from a night of it with no energy left, and went to
// bed at the first step, «das bancas às mãos 0», T-624)
const shopAt = (o, P, k) => { G.Vg.endTask(o); o.hunger = 10; o.energy = Math.max(o.energy, 95); o.sleeping = false; if (o.carry && o.carry.n > 1e-6 && o.carry.k !== 'water') G.Vg.toStore(o, G.Fac.idOfV(o), 'teste'); return G.Vg.H.setTask(o, { type: 'shop', id: P.b.id, k, pri: 1.05 }); };

// f1 the morning of the fair
{
  const P = setup(0.12); const v = restockNow(P);
  const n = v ? r2(v.carry.n) : 0; const kk = v ? v.carry.k : '-';
  if (v) live(90, null, () => !toFair(v, P));
  const out = sum(lines(P, e => e[8] === 'feira' && e[3] === 'f:' + P.f.id && v && e[4] === 'v:' + v.id));
  const put = sum(lines(P, e => v && e[3] === 'v:' + v.id && e[4] === 'b:' + P.b.id));
  const bad = newBad(P.base);
  ok('f1', !!v && n > 0 && Math.abs(out - n) < 0.01 && Math.abs(put - out) < 0.01 && !toFair(v, P) && !bad.length,
    `${v ? v.name : 'nenhum feirante'} trouxe ${n} de ${kk}: do armazém às mãos ('feira') ${out}, das mãos às bancas ${put}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// f2 a purchase at the fair: the coins to the people's treasury
{
  const P = setup(0.2); const k = 'food'; const I = P.b.inv || (P.b.inv = {}); if ((I[k] || 0) < 4) D.move('f:' + P.f.id, 'b:' + P.b.id, k, 6, { code: 'teste', part: true });
  // (the town calm for the purchase: its feast of the day kept for another day by the god's hand — festivals.js, the plan of
  // the day — and none under way: the feast calls the whole town, 3,2, over an errand to the fair. The Panathenaia of Argos
  // fall at 0,2, the hour of the case, and took Alcmena at the first step, on her way to the stall, T-327)
  { const s = S().settlements.get(P.b.set); s.festPlan = { day: S().day, key: null, done: true }; }
  const feast = G.Fest && G.Fest.active(P.b.set);
  const o = buyer(P, k); const t = o && shopAt(o, P, k); const coin = E.coinage(P.f.id);
  // (the tables kept with food for the case's buyer while he goes: the town's other shoppers of the hour buy there too, up to
  // six each — in the metropole of the generation 14 two of them took the six there before he reached the stall, and he went
  // home with nothing: T-489)
  const stocked = () => { if (D.free('b:' + P.b.id, k) < 6 && D.free('f:' + P.f.id, k) >= 6) D.move('f:' + P.f.id, 'b:' + P.b.id, k, 6, { code: 'teste', part: true }); };
  live(150, stocked, () => o && lines(P, e => e[8] === 'compra' && e[4] === 'v:' + o.id).length > 0);
  live(120, null, () => o && !(o.carry && o.carry.n > 1e-6));
  const goods = sum(lines(P, e => o && e[8] === 'compra' && e[3] === 'b:' + P.b.id && e[4] === 'v:' + o.id));
  // (the coins of his own purchase — by him, from a house —, and the purchase got home — to the house it was bought for, his
  // then —: counted by his house, the payment of another of it was taken for his. In the Argos of the generation 16 Jasão
  // moved to another house in the middle of the case, and a pot one of that house bought, 1,1 to the treasury, was told as his
  // payment, «pagou 1.1 ao tesouro», with nothing bought)
  const pay = lines(P, e => o && e[8] === 'compra' && e[5] === 'moedas' && e[9] === o.id && e[3][0] === 'h');
  const toState = sum(pay.filter(e => e[4] === 'f:' + P.f.id)); const elsewhere = sum(pay.filter(e => e[4] !== 'f:' + P.f.id));
  const home = sum(lines(P, e => o && e[8] === 'compra-em-casa' && e[3] === 'v:' + o.id && e[4][0] === 'h' && e[5] === k));
  const bad = newBad(P.base);
  ok('f2', !feast && !!o && !!t && goods > 0 && (coin ? toState > 0 : !pay.length) && !elsewhere && Math.abs(home - goods) < 0.01 && !bad.length,
    `${feast ? 'uma festa já em curso na cidade; ' : ''}${o ? o.name : 'ninguém'}: das bancas às mãos ${goods} de ${k}, à casa ${home}; pagou ${toState} ao tesouro${elsewhere ? ' e ' + elsewhere + ' a outro' : ''}${coin ? '' : ' (povo sem moeda)'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// f2b the stroll asks the hands (L-636): the same buyer with a common load in the arms — three of wood from the people's store,
// by the ledger — gets no shopping stroll (E.shopTask without the house's list), twenty times asked; the load put away, the
// stroll is given again (the stalls stocked with what the house lacks)
{
  const P = setup(0.2); const o = buyer(P, 'food');
  if (!o) ok('f2b', false, 'ninguém para o passeio');
  else {
    G.Vg.endTask(o); if (o.carry && o.carry.n > 1e-6) G.Vg.toStore(o, G.Fac.idOfV(o), 'teste');
    const h = E.homeOf(o); for (const k of ['tecido', 'ceramica']) { if (D.free('f:' + P.f.id, k) < 4) D.make('f:' + P.f.id, k, 6, { code: 'teste' }); D.move('f:' + P.f.id, 'b:' + P.b.id, k, 4, { code: 'teste', part: true }); const have = D.free('h:' + h.id, k); if (have > 0) D.use('h:' + h.id, k, have, { code: 'teste' }); }
    const ask = () => { let n = 0; for (let q = 0; q < 20; q++) { const t = G.Eco.shopTask(o, G.Vg.H); if (t) n++; } return n; };
    const free0 = ask();
    D.move('f:' + P.f.id, 'v:' + o.id, 'wood', 3, { code: 'teste', part: true }); const load = o.carry ? `${o.carry.n} de ${o.carry.k}` : 'NADA'; const full = ask();
    G.Vg.toStore(o, G.Fac.idOfV(o), 'teste'); const free1 = ask();
    ok('f2b o passeio de compras pergunta às mãos', free0 > 0 && !!o.carry === false && full === 0 && free1 > 0, `${o.name}: de mãos livres, ${free0} de 20 passeios dados; com ${load} nos braços, ${full}; a carga guardada, ${free1}`);
  }
}

// f3 noon: the fair closes — the feirante leaves the stall, and nobody buys at closed stalls
{
  const P = setup(0.47); const k = 'food'; const I = P.b.inv || (P.b.inv = {}); if ((I[k] || 0) < 4) D.move('f:' + P.f.id, 'b:' + P.b.id, k, 6, { code: 'teste', part: true });
  const v = P.crew[0]; send(v, V.frontTile(P.b)); if (!(v.task && v.task.type === 'sell')) G.Vg.H.setTask(v, { type: 'sell', id: P.b.id, pri: 1, dur: 60, fair: true });
  live(30, null, () => S().time >= 0.5);
  live(3); const selling = !!(v.task && v.task.type === 'sell' && v.task.id === P.b.id);
  // (a buyer who comes after the closing)
  const o = buyer(P, k); const L1 = seen.length; if (o) shopAt(o, P, k);
  live(120, null, () => o && !(o.task && o.task.type === 'shop'));
  const after = sum(seen.slice(L1).filter(e => o && e[8] === 'compra' && e[4] === 'v:' + o.id && e[5] === k));
  const bad = newBad(P.base);
  ok('f3', !selling && !!o && !after && !bad.length,
    `ao meio-dia ${v.name} ${selling ? 'ainda vendia' : 'deixou a banca'}; ${o ? o.name : 'ninguém'} chegou depois e ${after ? 'comprou ' + after + ' nas bancas fechadas' : 'não comprou'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// f4 the feirante dies with the goods on the way to the stalls
{
  const P = setup(0.12); const v = restockNow(P); const n = v ? r2(v.carry.n) : 0; const L1 = seen.length;
  if (v) V.kill(v, 'wolf'); live(2);
  const fair = sum(seen.slice(L1).filter(e => v && e[3] === 'v:' + v.id && e[4] === 'b:' + P.b.id && e[8] === 'herdado'));
  const else_ = sum(seen.slice(L1).filter(e => v && e[3] === 'v:' + v.id && e[4] !== 'b:' + P.b.id));
  const bad = newBad(P.base);
  ok('f4', !!v && n > 0 && Math.abs(fair - n) < 0.01 && !else_ && !bad.length,
    `${v ? v.name : 'nenhum feirante'} morreu com ${n} a caminho das bancas: às bancas ('herdado') ${fair}, a outro lugar ${else_}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// f5 a save with the goods on the way
{
  const P = setup(0.12); const v0 = restockNow(P); const id = v0 && v0.id; const n = v0 ? r2(v0.carry.n) : 0;
  M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1); const L1 = seen.length;
  const v = id && S().villagers.get(id); const kept = toFair(v, P);
  if (v) live(150, null, () => !toFair(v, P));
  const fair = sum(seen.slice(L1).filter(e => v && e[3] === 'v:' + id && e[4] === 'b:' + FAIR));
  const store = sum(seen.slice(L1).filter(e => v && e[3] === 'v:' + id && String(e[4]).startsWith('f:')));
  const bad = newBad(P.base);
  ok('f5', !!v && kept && Math.abs(fair - n) < 0.01 && !store && !bad.length,
    `save com ${n} a caminho das bancas: depois do load ${kept ? 'ainda nas mãos, marcado para a feira' : 'perdeu a marca'}; às bancas ${fair}, ao armazém ${store}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
const er = M.erros();
ok('erros', !Object.keys(er.mod).length && !er.console.length, `módulos: ${JSON.stringify(er.mod)}; console: ${er.console.slice(0, 2).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
