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
//  t7 a noite cai com gente à mesa: ninguém levado pelo trabalhinho da noite (L-591) — saem no sono, no fechar, na fome
//  t8 o taverneiro longe, a caminho do balcão: quem espera se serve no balcão e paga como ao taverneiro (L-592)
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
// the tavern of the tests: one with its keeper, in a town of coin (else of any), the one the most of its town's grown people
// have for the nearest — who goes out for a cup goes to the nearest tavern of the town within 30 tiles (G.Taverna.visitTask);
// the town's most peopled first. In Mênfis of the generation 15 the keeper's tavern stood at the town's edge, the nearest of 2
// of its 73 grown people — the others had the one of the middle —, and nobody came to it the whole night: T-511
const near = new Map();
for (const v of S().villagers.values()) { if (v.age < 16) continue; let nb = null, bd = 900; for (const b of E.byType(v.set, 'taverna')) { if (!b.built) continue; const d = G.dist2(v.x, v.y, b.x, b.y); if (d < bd) { bd = d; nb = b; } } if (nb) near.set(nb.id, (near.get(nb.id) || 0) + 1); }
function pick() {
  let best = null;
  for (const b of S().buildings.values()) {
    if (b.type !== 'taverna' || !b.built || !T.keeperOf(b)) continue;
    const sc = (T.withCoin(b) ? 1e9 : 0) + (near.get(b.id) || 0) * 1e4 + V.pop(b.set);
    if (!best || sc > best.sc) best = { b, sc };
  }
  return best && best.b;
}
const P = pick();
if (!P) { console.log(`FALHOU | taverna mundo | ${world}: nenhuma taverna com taverneiro`); process.exit(1); }
const town = () => S().settlements.get(P.set);
console.log(`${world}: ${V.buildName(P)} #${P.id} de ${town().name} (${(G.Fac.get(V.facOfSet(P.set)) || {}).civ}, ${V.pop(P.set)} habitantes, ${T.withCoin(P) ? 'de moeda' : 'sem moeda'}; a mais perto de ${near.get(P.id) || 0} adultos da cidade); abre ${T.horas(P).abre}, fecha ${T.horas(P).fecha}`);
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
// (the guests of the cases t7 and t8: the town's grown people, awake, fed and rested, with their hands free and — in a people of
// coin — the price of a round, nearest the tavern first; sent by the world's own door, T.visitTask, which calls the keeper)
// (not the night watch nor the smuggler, whose work of the night still calls)
const guests = (b, n) => [...S().villagers.values()].filter(v => v.set === b.set && v.age >= 16 && v.age < 62 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.sleeping && !A.isBody(v) && v.role !== 'taverneiro' && v.role !== 'guerreiro' && v.role !== 'contrabandista' && !(G.Vg.nightWatch && G.Vg.nightWatch.get(v.set) === v.id) && v.hunger < 40 && v.energy > 50 && !(v.carry && v.carry.n > 1e-6) && (!v.task || v.task.pri < 1.5) && (!T.withCoin(b) || E.purse(v) >= 1))
  .sort((a, c) => G.dist2(a.x, a.y, b.x, b.y) - G.dist2(c.x, c.y, b.x, b.y) || a.id - c.id).slice(0, n);
const send = (b, who) => who.filter(v => { G.Vg.endTask(v); return !!T.visitTask(v, G.Vg.H); });
// ---------------- t7 night falls on the guests at the tables ----------------
// (the evening's guests, the night falling while they sit: none taken by the night's little work of one awake with nothing to
// do — of priority 1, it took everyone at the tables at the fall of night, long before the closing and their bed, L-591 —; they
// leave at their bed, the closing, hunger)
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = [];
  liveSec(30, () => !!T.dia(b), bad); const op = T.dia(b);
  let went = [], night = new Set(), taken = [], prev = new Set();
  if (op) {
    S().time = 0.69; // (the test's hand: the evening, a little before the night — G.isNight from 0.73)
    went = send(b, guests(b, 4)); const ids = went.map(v => v.id);
    liveSec(40, () => !A.live(op) || S().time > 0.86, bad, () => {
      if (!A.live(op)) return;
      // (at the tables at the fall of night: seen there from a second before it; and who, on the errand a second ago — on the
      // way or at a table —, has left it at night for the work of the night — not the watch's nor the smuggler's: they are not
      // of the guests)
      if (S().time >= 0.725) for (const id of ids) if (op.data.mesa[id]) night.add(id);
      const now = new Set(ids.filter(id => { const v = S().villagers.get(id); return v && v.task && v.task.type === 'tavern' && v.task.op === op.id; }));
      if (G.isNight()) for (const id of prev) { const v = S().villagers.get(id); if (v && !now.has(id) && v.task && v.task.kind === 'work' && v.task.type !== 'patrol' && taken.length < 4) taken.push(`${v.name} → ${v.task.type} às ${r2(S().time)}`); }
      prev = now;
    });
  }
  ok('t7 a-noite-cai', !!op && went.length >= 2 && night.size >= 2 && !taken.length && !bad.length,
    op ? `${went.length} da cidade mandados à taverna às 0.69; ${night.size} à mesa quando a noite caiu (0.73)${taken.length ? `; LEVADOS PELO TRABALHO DA NOITE: ${taken.join(', ')}` : ', nenhum levado pelo trabalho da noite'}; ${op.data.servidos} servidos${bad.length ? '; ' + bad.slice(0, 2).join(' | ') : ''}` : 'não abriu');
}
// ---------------- t8 the keeper far, on his way to the counter ----------------
// (the keeper called to the counter from the far end of the town — the test's hand puts him at the building of his town
// farthest from the tavern that he reaches, his errand to the counter given —: a guest who waits a while with nobody at the
// counter serves himself there and pays as to the keeper; called from the market across the town, the keeper walked half a
// minute, the guests waited for him all of it, and none served himself, L-592)
{
  // (the town calm for the walk: its feast of the day kept for another day by the god's hand — festivals.js, the plan of the day —
  // and none under way: the feast calls the whole town, 3,2, over the keeper's errand, as it should. The clock the case puts at 0,63
  // fell in the hour of the feast of Mênfis of the generation 18, which took Hatshepsut at the first step — «0 s a caminho» —; and
  // the rounds counted from the case's start: each case opens the same snapshot, and its day has the number of the others', T-622)
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = []; seen.length = 0;
  town().festPlan = { day: S().day, key: null, done: true };
  liveSec(30, () => !!T.dia(b), bad); const op = T.dia(b); const k = T.keeperOf(b);
  let feast = !!(G.Fest && G.Fest.active(b.set)); // (and none on the way: a feast that began while he walked is seen too)
  let far = 0, went = [], self = 0, waited = [], walk = 0; const c0 = S().clock;
  if (op && k) {
    S().time = 0.63;
    const [tx, ty] = V.frontTile(b); let at = null;
    for (const o of [...S().buildings.values()].filter(q => q.set === b.set && q.built && q.id !== b.id).sort((p, q) => G.dist2(q.x, q.y, tx, ty) - G.dist2(p.x, p.y, tx, ty) || p.id - q.id)) {
      const [fx, fy] = V.frontTile(o); const x0 = k.x, y0 = k.y; k.x = fx + 0.5; k.y = fy + 0.5;
      if (G.W.walkableXY(k.x, k.y) && G.W.reaches(k, tx, ty)) { at = [fx, fy]; break; } k.x = x0; k.y = y0; }
    if (at) { G.Vg.endTask(k); k.inside = 0; k.path = null; far = r2(G.dist(k.x, k.y, tx, ty)); G.Vg.setTask(k, { type: 'atender', id: b.id, op: op.id, pri: 1.05, st: 0 }); }
    went = send(b, guests(b, 3)); const ids = new Set(went.map(v => v.id));
    liveSec(45, () => !A.live(op) || !(k.task && k.task.type === 'atender' && k.task.st === 0), bad, () => {
      feast = feast || !!(G.Fest && G.Fest.active(b.set));
      if (!A.live(op) || !(k.task && k.task.type === 'atender' && k.task.st === 0)) return;
      // (the keeper still on his way: a round taken by a guest's own hand, and none left waiting past the while)
      self = seen.filter(e => e[7] === op.id && e[8] === 'taverna' && ids.has(e[9]) && e[5] !== 'moedas').length;
      for (const id of ids) { const v = S().villagers.get(id); const m = op.data.mesa[id]; const wt = v && m && m.st === 2 && v.task && v.task.type === 'tavern' ? v.task.wt || 0 : 0;
        if (wt > 16 && waited.length < 3 && !waited.includes(v.name)) waited.push(v.name); }
      walk = r2(S().clock - c0);
    });
  }
  // (the case where it happened: a round by a guest's own hand while the keeper walked — the while is 12 s at the table —, and
  // none left waiting past it)
  ok('t8 o-taverneiro-longe', !feast && !!op && !!k && far >= 10 && went.length >= 1 && self >= 1 && !waited.length && !bad.length,
    op && k ? `${feast ? 'UMA FESTA DA CIDADE NO MEIO DO CASO; ' : ''}${k.name} chamado ao balcão de ${far} casas dali (${walk} s a caminho); ${went.length} da cidade à mesa; enquanto ele vinha, ${self} rodada(s) servida(s) pela mão do próprio freguês${waited.length ? `; ESPERARAM SEM SE SERVIR: ${waited.join(', ')}` : ''}${bad.length ? '; ' + bad.slice(0, 2).join(' | ') : ''}` : 'não abriu ou sem taverneiro');
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TAVERNA: FALHOU (${fails.join(', ')})` : 'TAVERNA: ok');
process.exit(fails.length ? 1 : 0);
