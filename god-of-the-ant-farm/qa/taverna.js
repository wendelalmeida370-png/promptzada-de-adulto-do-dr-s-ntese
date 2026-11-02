// taverna: a taverna de ponta a ponta num mundo pronto (G.Taverna; o exemplo B, D-077), em Node, pelo qa/nodemundo.js — o
// mundo de verdade: o taverneiro e os fregueses pelas tarefas deles, a hora deles, o dinheiro das casas e o estoque do povo.
//  t1 uma noite inteira: a taverna abre na hora dela, com o taverneiro; vem gente da cidade, com vontade e (num povo de
//     moeda) dinheiro — nunca mais fregueses que lugares —, cada rodada servida da prateleira e paga, o caixa do dia é o
//     que o livro diz; fecha na hora, e ninguém fica lá dentro
//  t2 um save no meio da noite, carregado duas vezes, vive o mesmo futuro
//  t3 o taverneiro morre no meio da noite: meio minuto sem ninguém (ou outro taverneiro), os fregueses saem, nada some
//  t4 ninguém servido do nada: o que se serviu numa noite cabe no que a prateleira tinha e no que o taverneiro comprou
//  t5 o deus derruba a taverna no meio da noite: o dia acaba ali, a prateleira sai pelo livro ('ruina'), os fregueses saem
//  t6 sem demanda: as casas da cidade sem moeda não vêm — a taverna aberta e vazia não é defeito (o verificador limpo)
//  e nenhum erro de módulo nem aviso no console.
//   node qa/taverna.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/taverna.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, T = G.Taverna, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
// (the snapshot after the trades the world's own step deals out once the world is open — a load gives them back as they
// were saved, L-419, and the ready worlds of the generation 7 are older than the trades of the Patch 2, which the load of
// before dealt at once; the twelve seconds stay for any world, a save of before too, T-298)
M.pronto(world); M.viver(12);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
// (the trades' rules of the checker — the tavern's among them —, alone, every five seconds)
const rule = QA.oficio; // (the trades' rule by its name: oficio-inv.js has more than one)
const watch = bad => rule((sys, sev, msg) => { if (sys === 'oficio' && sev <= 2 && bad.length < 6 && !bad.includes(`S${sev} ${msg}`)) bad.push(`S${sev} ${msg}`); }, S());
const liveSec = (sec, until, bad, each) => { for (let k = 0; k < sec; k++) { M.viver(1); if (each) each(); if (bad && k % 5 === 4) watch(bad); if (until && until()) return true; } return false; };
// (what the ledger writes, as it is written, from the start of each case)
const seen = []; D.onMove.push(e => { seen.push(e); });
G.inSim++;
// the tavern of the tests: one with its keeper, in the most peopled town of coin (else of any)
function pick() {
  let best = null;
  for (const b of S().buildings.values()) {
    if (b.type !== 'taverna' || !b.built || !T.keeperOf(b)) continue;
    const sc = (T.withCoin(b) ? 1e6 : 0) + V.pop(b.set);
    if (!best || sc > best.sc) best = { b, sc };
  }
  return best && best.b;
}
const P = pick();
if (!P) { console.log(`FALHOU | taverna mundo | ${world}: nenhuma taverna com taverneiro`); process.exit(1); }
const town = () => S().settlements.get(P.set);
console.log(`${world}: ${V.buildName(P)} #${P.id} de ${town().name} (${(G.Fac.get(V.facOfSet(P.set)) || {}).civ}, ${V.pop(P.set)} habitantes, ${T.withCoin(P) ? 'de moeda' : 'sem moeda'}); abre ${T.horas(P).abre}, fecha ${T.horas(P).fecha}`);
// the shelf with meals and the people's drink, the afternoon before the opening
function ready(b) {
  const ref = 'b:' + b.id; const f = G.Fac.get(V.facOfSet(b.set)); const L = G.Tavern && G.Tavern.DRINK; const dk = ((L && (L[f.civ || 'classico'] || L.classico)) || { k: 'cerveja' }).k;
  if (D.free(ref, 'food') < 6) D.make(ref, 'food', 6 - D.free(ref, 'food'), { code: 'teste', part: true });
  if (D.free(ref, dk) < 2) D.make(ref, dk, 2 - D.free(ref, dk), { code: 'teste', part: true });
  S().time = T.horas(b).abre - 0.02; S().weather.rain = 0; if (S().weather.storm) S().weather.storm = 0;
  return f;
}
// (the places: the plan's points to eat and to sit, where the interiors' allotter is — In.freePlace, P4 —; with no plan, the count)
const seats = b => (G.Interiors && G.Interiors.freePlace && G.Interiors.table && G.Interiors.table(b) ? G.Interiors.slots(b, 'sentar').length + G.Interiors.slots(b, 'comer').length : T.SEATS);
const atTables = op => Object.keys(op.data.mesa).length;
const insideOf = b => [...S().villagers.values()].filter(v => v.inside === b.id && v.task && v.task.type === 'tavern');
const digest = op => JSON.stringify([op.st, op.data.servidos, op.data.receita, op.data.gasto, op.data.faltas, op.data.recusas, Object.keys(op.data.mesa).sort(), op.data.fila, S().rng]);

// ---------------- t1 a whole night ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = []; seen.length = 0;
  const opened = liveSec(30, () => !!T.dia(b), bad);
  const op = T.dia(b); let most = 0, strangers = 0; const who = new Set();
  if (op) liveSec(120, () => !A.live(op), bad, () => { if (!A.live(op)) return; most = Math.max(most, atTables(op)); for (const id of Object.keys(op.data.mesa)) { who.add(+id); const v = S().villagers.get(+id); if (v && v.set !== b.set && !op.data.mesa[id].body) strangers++; } });
  const paid = op ? r2(seen.filter(e => e[7] === op.id && e[8] === 'taverna' && e[5] === 'moedas').reduce((n, e) => n + e[6], 0)) : 0;
  const left = insideOf(b).length;
  ok('t1 uma-noite', opened && !!op && !A.live(op) && op.st === 'ok' && op.data.servidos >= 1 && most <= seats(b) && !strangers && !left && Math.abs(paid - (op.data.receita || 0)) < 0.01 && !bad.length,
    op ? `abriu às ${r2(T.horas(b).abre)}, fechou (${op.st}, ${op.end ? op.end.why : ''}): ${op.data.servidos} servidos a ${who.size} fregueses, ${most} à mesa no máximo de ${seats(b)} lugares${strangers ? `, ${strangers} de fora` : ''}; caixa ${op.data.receita}, o livro ${paid}; faltas ${op.data.faltas}, recusas ${op.data.recusas}, cheia ${op.data.cheia}; ${left} lá dentro depois; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'não abriu');
}
// ---------------- t2 a save in the middle of the night, loaded twice ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b);
  liveSec(30, () => !!T.dia(b)); const op = T.dia(b);
  if (op) liveSec(40, () => !A.live(op) || atTables(op) >= 2);
  const mid = op && A.live(op) ? G.Save.serialize() : null; const opId = op ? op.id : 0;
  const run = () => { M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; liveSec(30); const o = A.get(opId); return o ? digest(o) : 'sem o dia'; };
  const a = mid ? run() : '', c = mid ? run() : '';
  ok('t2 save-no-meio-da-noite', !!mid && a === c, !mid ? 'a noite não chegou ao meio' : a === c ? `o mesmo futuro (${a.slice(0, 120)})` : `${a} ≠ ${c}`);
}
// ---------------- t3 the keeper dies in the middle of the night ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = []; seen.length = 0;
  liveSec(30, () => !!T.dia(b)); const op = T.dia(b);
  if (op) liveSec(50, () => !A.live(op) || atTables(op) >= 1);
  const k = T.keeperOf(b); const kid = k ? k.id : 0; const had = op ? atTables(op) : 0;
  if (k && op && A.live(op)) V.kill(k, 'teste', true);
  const closed = op && liveSec(45, () => !A.live(op) || (T.keeperOf(b) && T.keeperOf(b).id !== kid), bad);
  const nk = T.keeperOf(b); const tables = op && A.live(op) ? atTables(op) : 0;
  const stuck = op && !A.live(op) ? insideOf(b).filter(v => v.task.op === op.id).length : 0;
  // (the day closes — half a minute with no keeper, or its hour, whichever comes first — or another keeper takes it)
  ok('t3 o-taverneiro-morre', !!op && !!kid && closed && (!A.live(op) ? !stuck : !!nk) && !bad.length, op && kid ? `${had} à mesa quando ${k.name} morreu: ${!A.live(op) ? `o dia fechou (${op.st}, ${op.end.why}), ${stuck} presos lá dentro` : `outro taverneiro assumiu (${nk.name}), ${tables} à mesa`}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'a noite não chegou a ter freguês');
}
// ---------------- t4 nobody served from nothing ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const ref = 'b:' + b.id; const bad = []; seen.length = 0;
  const shelf0 = D.list(ref);
  liveSec(30, () => !!T.dia(b)); const op = T.dia(b);
  if (op) liveSec(120, () => !A.live(op), bad);
  const into = {}, outOf = {};
  for (const e of seen) { if (e[4] === ref) into[e[5]] = r2((into[e[5]] || 0) + e[6]); if (e[3] === ref) outOf[e[5]] = r2((outOf[e[5]] || 0) + e[6]); }
  const served = op ? op.data.vendas : {};
  const over = Object.keys(served).filter(k => served[k] > (shelf0[k] || 0) + (into[k] || 0) + 0.01);
  const shelf1 = D.list(ref); const books = Object.keys(Object.assign({}, shelf0, shelf1, into, outOf)).filter(k => k !== 'moedas' && Math.abs((shelf0[k] || 0) + (into[k] || 0) - (outOf[k] || 0) - (shelf1[k] || 0)) > 0.01);
  ok('t4 ninguem-servido-do-nada', !!op && !over.length && !books.length && !bad.length, op ? `servido ${JSON.stringify(served)}; a prateleira tinha ${JSON.stringify(shelf0)}, entrou ${JSON.stringify(into)}, saiu ${JSON.stringify(outOf)}, tem ${JSON.stringify(shelf1)}${over.length ? ` — servido do nada: ${over.join(', ')}` : ''}${books.length ? ` — a prateleira não fecha com o livro: ${books.join(', ')}` : ''}` : 'não abriu');
}
// ---------------- t5 the god pulls the tavern down in the middle of the night ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const ref = 'b:' + b.id; seen.length = 0;
  liveSec(30, () => !!T.dia(b)); const op = T.dia(b);
  if (op) liveSec(50, () => !A.live(op) || atTables(op) >= 1);
  const had = op ? atTables(op) : 0; const shelf = D.list(ref); const L0 = seen.length;
  if (op && A.live(op)) { V.destroyBuilding(b, 'teste'); liveSec(3); }
  const ruin = seen.slice(L0).filter(e => e[3] === ref && e[8] === 'ruina'); const gone = {}; for (const e of ruin) gone[e[5]] = r2((gone[e[5]] || 0) + e[6]);
  const lost = Object.keys(shelf).filter(k => k !== 'moedas' && Math.abs((shelf[k] || 0) - (gone[k] || 0)) > 0.01);
  const stuck = [...S().villagers.values()].filter(v => v.task && v.task.type === 'tavern' && v.task.id === b.id).length;
  ok('t5 a-taverna-cai', !!op && !A.live(op) && op.st === 'int' && !stuck && !lost.length, op ? `${had} à mesa: o dia ${op.st} (${op.end ? op.end.why : ''}); a prateleira ${JSON.stringify(shelf)} saiu pelo livro ${JSON.stringify(gone)} ('ruina'); ${stuck} ainda a caminho ou lá dentro` : 'não abriu');
}
// ---------------- t6 no demand: no coin in the town's houses ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = [];
  if (!T.withCoin(b)) ok('t6 sem-demanda', true, `${town().name} não usa moeda: sem o caso`);
  else {
    // (the town's coins taken from its houses and purses, by the ledger, as a theft would — and kept away all along: a wage
    // that comes in, a pay of the quay, would be a reason to go; taken once, five came with their day's pay, T-d)
    const broke = () => { for (const h of S().buildings.values()) if (h.set === b.set && (h.coin || 0) > 0 && D.exists('h:' + h.id)) D.use('h:' + h.id, 'moedas', h.coin, { code: 'teste', mine: true }); for (const v of S().villagers.values()) if (v.set === b.set && (v.purse || 0) > 0) D.use('p:' + v.id, 'moedas', v.purse, { code: 'teste', mine: true }); };
    broke();
    liveSec(30, () => !!T.dia(b), null, broke); const op = T.dia(b);
    if (op) liveSec(120, () => !A.live(op), bad, broke);
    ok('t6 sem-demanda', !!op && op.data.servidos === 0 && !bad.length, op ? `as casas sem moeda: ${op.data.servidos} servidos, ${op.data.recusas} recusas (${op.st}); ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'não abriu');
  }
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TAVERNA: FALHOU (${fails.join(', ')})` : 'TAVERNA: ok');
process.exit(fails.length ? 1 : 0);
