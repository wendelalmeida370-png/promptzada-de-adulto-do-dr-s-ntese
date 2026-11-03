// contrabando: o mercado clandestino e a vigia de ponta a ponta num mundo pronto, em Node, pelo qa/nodemundo.js — o mundo de
// verdade: o contrabandista e a ronda da noite pelas tarefas deles (economy.js: 'steal', 'sell'; crime.js: 'ronda'), o armazém
// do povo, a prateleira do mercado clandestino, a casa de quem compra e o livro.
//  k1 a noite do contrabandista: ele tira do armazém às escondidas (o livro: 'contrabando', marcado para o mercado e roubado) e
//     leva à prateleira do mercado ('contrabando'): o que saiu do armazém é o que chegou à prateleira
//  k2 o dia do mercado clandestino: quem compra leva para casa pelo livro ('compra'), e as moedas vão à casa do contrabandista,
//     não ao tesouro — sem imposto
//  k3 a ronda da noite — a do mundo, que o crime.js dá ao anoitecer ao vigia da cidade (ou, sem ele, a um soldado) — passa pela
//     porta do armazém quando ele sai com a mercadoria roubada nas mãos, e o flagra pela regra do posto do soldado
//     (E.spotSmuggler, L-405): ela volta ao armazém ('apreendido'), a casa dele paga a multa ('multa'), ele perde o ofício
//  k4 um save com a mercadoria roubada nas mãos: carregado, ela segue para a prateleira do mercado (a carga marcada vai aonde é
//     marcada), nunca para o armazém comum
//  k5 o contrabandista morre com a mercadoria roubada nas mãos: ela vai à prateleira do mercado ('herdado')
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console. (A segunda batida, que fecha o mercado com a
//  prateleira de volta ao armazém, é do qa/guardados.js, L-377.)
// Num mundo sem mercado clandestino, a prova o abre como o mundo abre (economy.js, considerBlackMarket): um beco da cidade, dois
// contrabandistas. O roubo é de noite: a cama da noite o cortava no primeiro olhar (L-386: a pergunta, G.Eco.prowls, no
// economy.js; a exceção ao sono no decide, do P1). E de noite o posto do soldado dorme: quem flagra é a ronda (L-405).
//   node qa/contrabando.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/contrabando.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | contrabando ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
// (the snapshot after the trades the world's own step deals out once the world is open — a load gives them back as they
// were saved, L-419, and the ready worlds of the generation 7 are older than the trades of the Patch 2, which the load of
// before dealt at once; the twelve seconds stay for any world, a save of before too, T-298)
M.pronto(world); M.viver(12);
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
G.inSim++;
const fit = v => v && !v.captive && !v.jail && !v.aboard && !v.held && v.age >= 18 && v.age < 55;
// (the black market of the world, or one opened as the world opens it, in the most peopled town that is a city)
function market() {
  for (const b of [...S().buildings.values()].sort((p, q) => p.id - q.id)) if (b.type === 'mercado_negro' && b.built && [...S().villagers.values()].filter(v => v.job === b.id && v.role === 'contrabandista' && fit(v)).length >= 2) return { id: b.id, opened: false };
  const set = [...S().settlements.values()].filter(s => (s.tier || 0) >= 2).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0]; if (!set) return null;
  const pos = V.findSite(set, 'mercado_negro'); if (!pos) return null;
  const b = V.addBuilding('mercado_negro', pos[0], pos[1], set.id, true);
  const crooks = [...S().villagers.values()].filter(v => v.set === set.id && fit(v) && v.role !== 'guerreiro' && !G.Fac.all().some(q => q.leader === v.id)).sort((a, c) => a.id - c.id).slice(0, 2);
  for (const v of crooks) { v.role = 'contrabandista'; v.job = b.id; }
  return { id: b.id, opened: true };
}
const MK = market();
if (!MK) { console.log(`FALHOU | contrabando mundo | ${world}: nenhuma cidade onde abrir um mercado clandestino`); process.exit(1); }
M.viver(1);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const seen = []; D.onMove.push(e => { seen.push(e); });
// (the smugglers' trade held by the god's hand while a case lasts — the town's board orders nobody into crime and cuts the
// smugglers first when it needs hands (D-090, village.js): in the generation-13 metropole both smugglers of Tebas' market had
// left the trade before the night of k3, and the sale of k2 paid the treasury, there being no smuggler of the market to pay,
// T-391 — until the law takes it: a seizure from his hands, k3)
let HOLD = null;
const hold = () => { if (!HOLD) return; for (const id of HOLD.ids.slice()) { if (seen.slice(HOLD.L0).some(e => e[8] === 'apreendido' && e[3] === 'v:' + id)) { HOLD.ids.splice(HOLD.ids.indexOf(id), 1); continue; } const v = S().villagers.get(id); if (v && fit(v) && (v.role !== 'contrabandista' || v.job !== HOLD.mk)) { v.role = 'contrabandista'; v.job = HOLD.mk; } } };
const live = (sec, each, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); hold(); if (each) each(); if (until && until()) return true; } return false; };
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = B => QA.check().filter(q => q.sev <= 2 && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
{ const b = S().buildings.get(MK.id); console.log(`${world}: o mercado clandestino #${b.id} de ${S().settlements.get(b.set).name}${MK.opened ? ' (aberto pela prova, como o mundo abre)' : ''}`); }
const GOODS = ['tecido', 'ceramica', 'joias', 'food', 'couro', 'ferramentas'];
// each case: the market, its two smugglers, the people's store with what to steal, the hour
function setup(time) {
  fresh(); S().time = time; S().weather.rain = 0;
  const b = S().buildings.get(MK.id); const f = G.Fac.get(V.facOfSet(b.set));
  const crew = [...S().villagers.values()].filter(v => v.job === b.id && v.role === 'contrabandista' && fit(v)).sort((p, q) => p.id - q.id);
  for (const k of ['tecido', 'ceramica']) if (D.free('f:' + f.id, k) < 6) D.make('f:' + f.id, k, 6, { code: 'teste', part: true });
  const I = b.inv || (b.inv = {}); for (const k of GOODS) if (I[k] > 0) D.use('b:' + b.id, k, I[k], { code: 'teste', mine: true });
  HOLD = { mk: b.id, ids: crew.map(v => v.id), L0: seen.length };
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
const stolenIn = v => !!(v && v.carry && v.carry.stolen && v.carry.n > 1e-6);
// (the night's theft, up to its load in the hands: the smuggler at the store, sent by the world's own door)
function stealNow(P, v) {
  const st = V.nearestDropoff(P.b.x, P.b.y, P.b.set); const t = send(v, st ? V.frontTile(st) : null);
  const got = live(120, null, () => stolenIn(v));
  return { t, got };
}

// k1 the smuggler's night
{
  const P = setup(0.75); const v = P.crew[0]; const { t, got } = stealNow(P, v);
  live(120, null, () => !stolenIn(v));
  const out = sum(lines(P, e => e[8] === 'contrabando' && e[3] === 'f:' + P.f.id && e[4] === 'v:' + v.id));
  const shelf = sum(lines(P, e => e[8] === 'contrabando' && e[3] === 'v:' + v.id && e[4] === 'b:' + P.b.id));
  const bad = newBad(P.base);
  ok('k1', !!t && t.type === 'steal' && got && out > 0 && Math.abs(out - shelf) < 0.01 && !stolenIn(v) && !bad.length,
    `${v.name} de noite (${t ? t.type : 'sem tarefa'}): do armazém às mãos ${out} (roubado, marcado para o mercado), das mãos à prateleira ${shelf}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// k2 a day of the black market: what a buyer pays goes to the smuggler's house
{
  const P = setup(0.35); const v = P.crew[0]; const k = 'tecido';
  D.move('f:' + P.f.id, 'b:' + P.b.id, k, 4, { code: 'teste', part: true });
  // (the payee as the shop finds it: the first of the world's people with this job, and that one's house)
  const seller = [...S().villagers.values()].find(o => o.job === P.b.id); const sh = seller && seller.home && S().buildings.get(seller.home);
  const buyer = [...S().villagers.values()].filter(o => o.set === P.b.set && fit(o) && o.home && !P.crew.some(c => c.home === o.home) && !P.crew.includes(o) && D.get('h:' + o.home, 'moedas') >= 5 && D.room('h:' + o.home, k) >= 1).sort((a, c) => G.dist2(a.x, a.y, P.b.x, P.b.y) - G.dist2(c.x, c.y, P.b.x, P.b.y))[0];
  const coin = E.coinage(P.f.id);
  // (the errand to the black market as the shop gives it, held above the calls from outside below 3 — the line of the D-094 —:
  // the test is the deal at the counter, not whether someone stops him on the way — at 0,35 a word in the street takes it, and
  // in the generation 7's Tenochtitlan the square's crowd (Po.crowd, 1,7) called the buyer from the counter at 0,40, while
  // the others bought the shelf: T-273)
  let t = null; if (buyer) { G.Vg.endTask(buyer); buyer.hunger = 10; t = G.Vg.H.setTask(buyer, { type: 'shop', id: P.b.id, k, pri: 2.9 }); }
  if (v && E.jobTask) send(v, V.frontTile(P.b)); // (the smuggler at the stall, selling: his day)
  live(150, null, () => buyer && lines(P, e => e[8] === 'compra' && e[4] === 'v:' + buyer.id).length > 0);
  live(120, null, () => buyer && !(buyer.carry && buyer.carry.n > 1e-6));
  const goods = sum(lines(P, e => e[8] === 'compra' && e[3] === 'b:' + P.b.id && buyer && e[4] === 'v:' + buyer.id));
  // (what the buyer paid for it — the line's who: in the branch joined with 624e83f another of his house bought at the
  // market twelve seconds later, 0,5 to the treasury, and it was counted as his, T-300)
  const pay = lines(P, e => e[8] === 'compra' && e[5] === 'moedas' && buyer && e[3] === 'h:' + buyer.home && e[9] === buyer.id);
  const toCrook = sum(pay.filter(e => sh ? e[4] === 'h:' + sh.id : String(e[4]).startsWith('p:')));
  const toState = sum(pay.filter(e => String(e[4]).startsWith('f:')));
  const home = sum(lines(P, e => buyer && e[3] === 'v:' + buyer.id && e[4] === 'h:' + buyer.home && e[5] === k));
  const bad = newBad(P.base);
  ok('k2', !!buyer && !!t && goods > 0 && (coin ? toCrook > 0 : !pay.length) && !toState && Math.abs(home - goods) < 0.01 && !bad.length,
    `${buyer ? buyer.name : 'ninguém para comprar'}: da prateleira às mãos ${goods} de ${k}, à casa ${home}; pagou ${toCrook} à casa do contrabandista e ${toState} ao tesouro${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// k3 the night round catches the smuggler with stolen goods in the hands (L-405)
// (the round is the world's: crime.js gives it at dusk to the town's watchman — or, with none, to a soldier — and it goes
// crossing to crossing till the sky lightens. The hand of the proof gives only tonight's route: the store's door, where the
// smuggler comes out with what he took — the watchman passing there —, and the market's, where he takes it. The old k3 put a
// soldier on guard at the market at night: the bed took him at the first look, as it took the theft before L-386)
{
  // (dusk, the clock turned back to it: this dusk's round not given yet — the world gives it at the crime's next look, in two
  // seconds —; the night a few seconds on, and the theft at once, as in the k1. Waiting for the next dusk, some 200 s, both
  // smugglers the proof set up had left the trade before the night came)
  const P = setup(0.7); const town = S().settlements.get(P.b.set); if (town && town.watchDay === S().day) town.watchDay = S().day - 1;
  const roundOf = () => [...S().villagers.values()].filter(o => o.set === P.b.set && o.task && o.task.type === 'ronda' && o.task.loop && !P.crew.includes(o)).sort((a, c) => a.id - c.id)[0];
  let w = null; live(30, null, () => { w = roundOf() || null; return !!w && G.isNight(); });
  const v = P.crew.find(c => S().villagers.has(c.id) && c.role === 'contrabandista' && fit(c)) || P.crew[0]; const crook0 = v.role === 'contrabandista';
  const h = v.home && S().buildings.get(v.home); const coins0 = h ? D.get('h:' + h.id, 'moedas') : 0;
  // (the catch is a chance with the smuggler in sight — a twentieth a step, the game's rule —: in the branch joined with
  // 624e83f the watchman walked beside him to the market for five seconds and the chance did not come. The case is that the
  // round catches him: up to three thefts, each with the watchman at his side, T-300)
  let got = false, n = 0, k = null, caught = false, byRound = false, tries = 0; const L1 = seen.length; const n0 = S().logN || 0;
  const seenIt = () => seen.slice(L1).some(e => e[8] === 'apreendido' && e[3] === 'v:' + v.id);
  while (tries < 3 && !caught && w && G.isNight() && crook0 && v.role === 'contrabandista' && S().villagers.has(v.id)) {
    const r = stealNow(P, v); if (!r.got) break; got = true; tries++; n = r2(v.carry.n); k = v.carry.k;
    if (!(w.task && w.task.type === 'ronda')) break;
    // (the round held at 3, above the town's calls below 3, the line of the D-094, and out of a feast's reach — festivals.js
    // takes who has a task below 3: in the generation 7's Tenochtitlan the people's assembly at the palace — Po.crowd, 1,7 —
    // took the watchman from the round at 0,75, eight steps after he met the smuggler at the store's door; and with the quay's
    // dockers of L-428, a Toxcatl begun at night took him for a priest's aide two seconds after, T-303; the case is the catch,
    // not who calls the watchman away)
    const [mx, my] = V.frontTile(P.b); w.x = v.x; w.y = v.y; w.path = null; w.inside = 0;
    Object.assign(w.task, { pts: [[mx + 0.5, my + 0.5]], k: 0, st: 0, pri: 3 });
    live(120, null, () => { const c = seenIt(); if (c) byRound = !!(w.task && w.task.type === 'ronda'); return c || !stolenIn(v); });
    caught = seenIt();
  }
  const seized = sum(seen.slice(L1).filter(e => e[8] === 'apreendido' && e[3] === 'v:' + v.id && e[4] === 'f:' + P.f.id));
  const fine = sum(seen.slice(L1).filter(e => e[8] === 'multa' && h && e[3] === 'h:' + h.id && e[4] === 'f:' + P.f.id));
  const said = S().history.filter(e => e.n > n0 && /flagrou/.test(e.txt) && w && e.txt.startsWith(w.name)).length;
  const stillCrook = S().villagers.has(v.id) && v.role === 'contrabandista'; const bad = newBad(P.base);
  ok('k3', !!w && got && caught && byRound && Math.abs(seized - n) < 0.01 && (coins0 < 0.02 || fine > 0) && said > 0 && !stillCrook && !bad.length,
    `${w ? `${w.name} #${w.id} (${w.role === 'vigia' ? 'o vigia' : 'um soldado'}) na ronda da noite, dada pelo mundo` : 'nenhuma ronda dada ao anoitecer'}; ${v.name} #${v.id}${crook0 ? '' : ' (JÁ SEM o ofício quando a noite veio)'} com ${n} de ${k || '-'} roubado nas mãos, saindo do armazém: ${caught ? 'flagrado' + (byRound ? ' na ronda' : ' fora da ronda') : 'não flagrado' + (got && !stolenIn(v) ? ' — chegou ao mercado' : '')}; ao armazém ('apreendido') ${seized}; multa da casa ${fine} (tinha ${r2(coins0)}); na crônica ${said ? 'sim' : 'não'}; ${S().villagers.has(v.id) ? (stillCrook ? 'ainda contrabandista' : 'perdeu o ofício') : 'executado'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// k4 a save with the stolen goods in the hands
{
  const P = setup(0.75); const id = P.crew[0].id; const { got } = stealNow(P, P.crew[0]); const n = got ? r2(P.crew[0].carry.n) : 0;
  M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1); const L1 = seen.length;
  const v = S().villagers.get(id); const kept = stolenIn(v) && v.carry.to === 'b:' + MK.id;
  live(150, null, () => !stolenIn(v));
  const shelf = sum(seen.slice(L1).filter(e => e[3] === 'v:' + id && e[4] === 'b:' + MK.id));
  const store = sum(seen.slice(L1).filter(e => e[3] === 'v:' + id && String(e[4]).startsWith('f:')));
  const bad = newBad(P.base);
  ok('k4', got && kept && Math.abs(shelf - n) < 0.01 && !store && !bad.length,
    `save com ${n} roubado nas mãos: depois do load ${kept ? 'ainda nas mãos, marcado para o mercado' : 'perdeu a marca'}; à prateleira ${shelf}, ao armazém comum ${store}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// k5 the smuggler dies with the stolen goods in the hands
{
  const P = setup(0.75); const v = P.crew[0]; const { got } = stealNow(P, v); const n = got ? r2(v.carry.n) : 0; const L1 = seen.length;
  if (got) V.kill(v, 'wolf'); live(2);
  const shelf = sum(seen.slice(L1).filter(e => e[3] === 'v:' + v.id && e[4] === 'b:' + MK.id && e[8] === 'herdado'));
  const else_ = sum(seen.slice(L1).filter(e => e[3] === 'v:' + v.id && e[4] !== 'b:' + MK.id));
  const bad = newBad(P.base);
  ok('k5', got && Math.abs(shelf - n) < 0.01 && !else_ && !bad.length,
    `${v.name} morreu com ${n} roubado nas mãos: à prateleira do mercado ('herdado') ${shelf}, a outro lugar ${else_}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
const er = M.erros();
ok('erros', !Object.keys(er.mod).length && !er.console.length, `módulos: ${JSON.stringify(er.mod)}; console: ${er.console.slice(0, 2).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
