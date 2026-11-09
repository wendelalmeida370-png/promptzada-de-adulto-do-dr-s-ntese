// termas: os banhos de ponta a ponta num mundo pronto (G.Termas; o exemplo A, D-079), em Node, pelo qa/nodemundo.js — o
// mundo de verdade: o foguista e os banhistas pelas tarefas deles, a lenha do armazém, o dinheiro das casas, a hora.
//  e1 um dia dos banhos: abrem na hora, com o foguista; a fornalha queima a lenha que ele traz do armazém ('fornalha', pelo
//     livro), a água esquenta; quem escolhe os banhos (a porta do lazer da cidade, G.Termas.visit) paga a entrada (num povo
//     de moeda), tira a roupa, entra na água — nunca mais que os lugares —, sai melhor (a doença menor, o cansaço também) e
//     vai embora; o caixa e a lenha são o que o livro diz; fecham na hora, e ninguém fica lá dentro
//  e2 sem lenha nenhuma: a água fria, o banho frio (vale menos) — nada queima do nada; e com lenha no armazém de novo, o
//     foguista a traz e acende a fornalha
//  e3 o foguista morre com o fogo aceso: o fogo arde até apagar, ninguém alimenta a fornalha — até outro foguista
//  e4 um save no meio do dia, carregado duas vezes, vive o mesmo futuro
//  e5 o deus derruba os banhos com gente na água: o dia acaba ali, todos saem, a prateleira sai pelo livro ('ruina')
//  e nenhum erro de módulo nem aviso no console.
//   node qa/termas.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/termas.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, Te = G.Termas, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | termas ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
// (the snapshot after the trades the world's own step deals out once the world is open — a load gives them back as they
// were saved, L-419, and the ready worlds of the generation 7 are older than the trades of the Patch 2, which the load of
// before dealt at once; the twelve seconds stay for any world, a save of before too, T-298)
M.pronto(world); M.viver(12);
// (a world with no baths and their stoker — the metropole of the generation 16 is a younger world, its first metropolis of
// the year 41: «nenhum banho com foguista» —: the baths the world has, in the most peopled town of coin first, or, with none,
// the god's hand puts them where the town's own planner would; and one of the town takes the stoker's trade by the god's hand,
// held in it while the cases last — the town's board would deal him back at its next pass —, as the mina.js's miners (T-387))
let handT = null, byGodT = false;
if (![...G.S.buildings.values()].some(b => b.type === 'banhos' && b.built && Te.keeperOf(b))) {
  const order = (a, c) => (E.coinage(c.fac) - E.coinage(a.fac)) || V.pop(c.id) - V.pop(a.id) || a.id - c.id;
  let b = [...G.S.buildings.values()].filter(q => q.type === 'banhos' && q.built).sort((p, q) => order(G.S.settlements.get(p.set), G.S.settlements.get(q.set)) || p.id - q.id)[0] || null;
  if (!b) for (const s of [...G.S.settlements.values()].sort(order)) { const pos = V.findSite(s, 'banhos'); if (!pos || pos.demolish) continue; b = V.addBuilding('banhos', pos[0], pos[1], s.id, true); byGodT = true; break; }
  if (b) {
    const f = G.Fac.get(V.facOfSet(b.set));
    const v = [...G.S.villagers.values()].filter(o => o.set === b.set && o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && !o.ug && o.role !== 'guerreiro' && !(f && f.leader === o.id) && D.strength(o) > 0).sort((a, c) => (!!a.job - !!c.job) || a.id - c.id)[0];
    if (v) { G.Vg.endTask(v); v.role = 'foguista'; v.job = b.id; handT = { id: v.id, b: b.id }; }
  }
}
const holdT = () => { if (!handT) return; const v = G.S.villagers.get(handT.id); if (v && !v.captive && (v.role !== 'foguista' || v.job !== handT.b)) { v.role = 'foguista'; v.job = handT.b; } };
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
const rule = QA.oficio; // (the trades' rule by its name: oficio-inv.js has more than one)
const watch = bad => rule((sys, sev, msg) => { if (sys === 'oficio' && sev <= 2 && bad.length < 6 && !bad.includes(`S${sev} ${msg}`)) bad.push(`S${sev} ${msg}`); }, S());
const liveSec = (sec, until, bad, each) => { for (let k = 0; k < sec; k++) { if (keeping) keeping(); holdT(); M.viver(1); if (each) each(); if (bad && k % 5 === 4) watch(bad); if (until && until()) return true; } return false; };
const seen = []; D.onMove.push(e => { seen.push(e); });
G.inSim++;
// the baths of the tests: with their stoker, in the most peopled town of coin (else of any)
function pick() {
  let best = null;
  for (const b of S().buildings.values()) {
    if (b.type !== 'banhos' || !b.built || !Te.keeperOf(b)) continue;
    const sc = (Te.withCoin(b) ? 1e6 : 0) + V.pop(b.set);
    if (!best || sc > best.sc) best = { b, sc };
  }
  return best && best.b;
}
const P = pick();
if (!P) { console.log(`FALHOU | termas mundo | ${world}: nenhum banho com foguista`); process.exit(1); }
const town = () => S().settlements.get(P.set);
console.log(`${world}: ${V.buildName(P)} #${P.id} de ${town().name} (${(G.Fac.get(V.facOfSet(P.set)) || {}).civ}, ${V.pop(P.set)} habitantes, ${Te.withCoin(P) ? 'de moeda' : 'sem moeda'}); abrem ${Te.horas(P).abre}, fecham ${Te.horas(P).fecha}${handT ? (byGodT ? "; os banhos e o foguista pela mão do deus" : "; o foguista pela mão do deus") : ""}`);
// wood in the store beyond what it keeps for its works, the morning before the opening
function ready(b) {
  const f = G.Fac.get(V.facOfSet(b.set)); if (D.free('f:' + f.id, 'wood') < 40) D.make('f:' + f.id, 'wood', 40, { code: 'teste', part: true });
  S().time = Te.horas(b).abre - 0.02; S().weather.rain = 0; if (S().weather.storm) S().weather.storm = 0;
  return f;
}
// (the wood the stoker goes for is his from the step he sets out — held in the store, L-400: in the generation 7's Argos the
// city's works took the 40 of the case in the seconds the stoker walked to the store, 46 when she left and 3 when she came,
// and the baths were cold all day; the e1 is that day, in that town, with no hand of the test on the wood. Only the e3 keeps
// the wood in the store while the fire is lit — the test's hand, every second, as the casa.js keeps the people's stone and
// wood for the works it waits on (T-202) —: its case is the fire the dead stoker leaves, not the town's wood, T-281)
let keeping = null;
const keep = f => () => { if (D.free('f:' + f.id, 'wood') < 30) D.make('f:' + f.id, 'wood', 40, { code: 'teste', part: true }); };
// (the places in the water: the plan's points to bathe, where the interiors' allotter is — In.freePlace, P4 —; with no plan, the
// count; who is in the water, not who is at the pegs)
const places = b => (G.Interiors && G.Interiors.freePlace && G.Interiors.table && G.Interiors.table(b) ? G.Interiors.slots(b, 'banhar').length : Te.CAP);
const inWater = op => Object.values(op.data.banho).filter(m => m.st === 2).length;
// (who chooses the baths: grown townsfolk at the end of a chore — nothing weightier than the day's work —, with the entry in
// the house: by the door of the city's leisure, as the world gives it — the errand of the kind 'work', a leisure, which the
// next look of decide does not take for the work: given bare, the morning's work took every bather on the way, T-d)
// (pri: the errand held above the day's calls, for a case whose question is the bath itself, not who stops the bather on the
// way — T-281; no caravan's merchant: the next caravan asks first who went before, T-301)
function bathers(b, n, pri) {
  const out = [];
  for (const v of [...S().villagers.values()].sort((a, c) => a.id - c.id)) {
    if (out.length >= n) break;
    if (v.set !== b.set || v.age < 16 || v.age > 60 || v.captive || v.jail || v.aboard || v.sleeping || v.inside || (v.task && (v.task.pri || 0) > 1) || v.role === 'foguista' || (v.carry && v.carry.n > 1e-6) || v.merchant) continue;
    const t = Te.visit(v, b); if (t) { t.kind = 'work'; t.leisure = true; if (pri) t.pri = pri; out.push(v); }
  }
  return out;
}
const inBath = op => Object.keys(op.data.banho).length;
const digest = op => JSON.stringify([op.st, op.data.entradas, op.data.receita, op.data.lenha, op.data.calor, op.data.quentes, op.data.frios, Object.keys(op.data.banho).sort(), S().rng]);

// ---------------- e1 a day of the baths ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const bad = []; seen.length = 0;
  // (the stoker free at the opening, his house's chores done: in the branch joined with 8e432b8 she was fetching the house's
  // water at the opening, and in her 30 s the city's works took the store's wood beyond what it keeps for them — she looked
  // for it after, found none to spare, and the baths were cold all day. The wood is still the world's, with no hand of the test
  // on it: what the stoker sets out for is hers, L-400; the bathers' errand held above the day's calls — the purchases of the
  // houses took five of the six on the way, at 0,41 —, as the e2's, T-301)
  for (const v of S().villagers.values()) if (v.job === b.id && v.role === 'foguista') G.Vg.endTask(v);
  const opened = liveSec(30, () => !!Te.dia(b), bad); const op = Te.dia(b);
  let most = 0, strangers = 0, over = 0, sick = null, dSick = null, dEn = null; const prev = {};
  if (op) {
    liveSec(40, () => op.data.lenha >= 1 || !A.live(op), bad); // (the stoker lights the furnace first)
    const L = bathers(b, 6, 2.9); sick = L[0] || null;
    // (each bather tired — not so tired that the tiredness under 22 sends one to bed before the bath ends: at 40 the one
    // watched went to bed from the water after 30 s —, and sick as one still up is: a light sickness, under the fever that
    // puts one in bed at home (G.Lar.fever, L-227 — the 120 of before sent all six home to bed on the way), given as each
    // goes into the water, so that the bath finds it there: a sickness wears off a point a second, and the pegs may keep
    // one waiting for a place)
    const LIGHT = Math.floor(G.DAY_LEN * 0.25) - 5; const given = new Set();
    const sicken = () => { for (const v of L) { const m = op.data.banho[v.id]; if (m && m.st === 2 && !given.has(v.id)) { given.add(v.id); v.sick = Math.max(v.sick || 0, LIGHT); } } };
    for (const v of L) v.energy = Math.min(v.energy, 60);
    // (what the bath does, at the second it is counted, on the first who bathes: the sickness down, the tiredness too — the
    // rest of the day aside; a bath counted as one leaves, cut by the world, is gone in the same step and is not looked at)
    const look = () => { for (const v of L) { const m = op.data.banho[v.id]; const p = prev[v.id]; if (m && m.done && dSick === null && p) { sick = v; dSick = r2((v.sick || 0) - p.s); dEn = r2(v.energy - p.e); } prev[v.id] = { s: v.sick || 0, e: v.energy }; } };
    look();
    liveSec(140, () => !A.live(op), bad, () => { sicken(); look(); if (!A.live(op)) return; most = Math.max(most, inWater(op)); if (op.data.calor > 2 * Te.BURN + 1e-6) over++; for (const id of Object.keys(op.data.banho)) { const v = S().villagers.get(+id); if (v && v.set !== b.set && !op.data.banho[id].body) strangers++; } });
  }
  const paid = op ? r2(seen.filter(e => e[7] === op.id && e[5] === 'moedas' && (e[8] === 'termas' || e[8] === 'termas-volta')).reduce((n, e) => n + (e[8] === 'termas' ? e[6] : -e[6]), 0)) : 0;
  const logs = op ? r2(seen.filter(e => e[7] === op.id && e[8] === 'fornalha' && e[5] === 'wood').reduce((n, e) => n + e[6], 0)) : 0;
  const left = [...S().villagers.values()].filter(v => v.inside === b.id && v.task && v.task.type === 'termas').length;
  const healed = !!sick && dSick !== null && dSick <= -7 && dEn >= 2.9;
  ok('e1 um-dia-dos-banhos', opened && !!op && !A.live(op) && op.st === 'ok' && op.data.entradas >= 1 && op.data.lenha >= 1 && most <= places(b) && !strangers && !over && !left && Math.abs(paid - (Te.withCoin(b) ? op.data.receita : 0)) < 0.01 && Math.abs(logs - op.data.lenha) < 0.01 && healed && !bad.length,
    op ? `${op.data.entradas} entradas (${op.data.quentes} banhos quentes, ${op.data.frios} frios), ${most} na água no máximo de ${places(b)} lugares${strangers ? `, ${strangers} de fora` : ''}; caixa ${op.data.receita}, o livro ${paid}; lenha ${op.data.lenha}, o livro ${logs}${over ? `; fogo além da fornalha ${over} vezes` : ''}; o banho de ${sick ? sick.name : '-'}: doença ${dSick === null ? '-' : dSick}, energia ${dEn === null ? '-' : '+' + dEn}; ${left} lá dentro depois (${op.st}, ${op.end ? op.end.why : ''}); ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'não abriram');
}
// ---------------- e2 no wood at all ----------------
{
  fresh(); const b = S().buildings.get(P.id); const f = ready(b); const bad = []; seen.length = 0;
  // (no wood by the furnace, none in the store, none on its way there: the wood in the hands of whoever takes it to the
  // furnace — the stoker's own fetch, his from the step he set out, L-400 — is the baths' wood too; and none comes while the
  // water is cold: the town's deliveries fill the store again in seconds, and a cold furnace sends the stoker for what is
  // beyond the works' share. The god's hand keeps the town without wood for the baths through the cold part, every second, as
  // the e3's keeps the store with some (T-281). In the generation 11's Mênfis the stoker Tutmés was on his way to the furnace
  // with 3 of it when the case began, and by 0,31 the store had 22 again: the baths opened hot — 5 hot baths, 3 of wood
  // burnt, wood the world had, T-354)
  const dry = () => {
    for (const ref of ['b:' + b.id, 'f:' + f.id]) { const n = D.get(ref, 'wood'); if (n > 1e-6) D.use(ref, 'wood', n, { code: 'teste', mine: true }); }
    for (const v of S().villagers.values()) { const c = v.carry; if (c && c.k === 'wood' && c.n > 1e-6 && !c.op && (c.to === 'b:' + b.id || (v.job === b.id && v.role === 'foguista'))) D.use('v:' + v.id, 'wood', c.n, { code: 'teste', mine: true }); }
  };
  dry(); keeping = dry;
  liveSec(30, () => !!Te.dia(b), bad); const op = Te.dia(b);
  // (the bathers' errand held above the calls from outside below 3 — the line of the D-094 —: the case is the cold bath. In
  // the generation 7's Argos, sent at the opening by the leisure's own errand (0,4), the four were each taken on the way —
  // a prayer, a purchase, the fields, a cave — and nobody bathed until the baths closed, T-281)
  if (op) { bathers(b, 4, 2.9); liveSec(60, () => !A.live(op) || op.data.frios >= 1, bad); }
  const cold = op ? { frios: op.data.frios, quentes: op.data.quentes, lenha: op.data.lenha } : null; keeping = null;
  // (and wood comes back to the store: the stoker brings it — held for him from the step he sets out, L-400 —, and the fire
  // is lit)
  // (kept there until he comes for it — the test's hand, as in the e3: the case is the stoker answering the wood that came
  // back, not the race with the town's works for it before he sets out, which is the e1's (L-400). In the generation 7's
  // Argos the works take the wood that comes to the store in seconds — in the e2's probe the stoker spent the morning at the
  // fields' work and a delivery —, and without the hand the furnace stayed cold for the 90 s, T-281)
  if (op && A.live(op)) { D.make('f:' + f.id, 'wood', 40, { code: 'teste', part: true }); keeping = keep(f); }
  // (the stoker ends what he does — an idle look at the cold furnace lasts up to 16 s —, walks to the store and back, and feeds
  // it: 90 s, inside the day — the clock held at the hour the wood came back, the test's hand, as the counters' cases hold it:
  // in the metropole of the generation 16 the cold part ended at 0,40, the capital's trade had taken Sitamun, the stoker, who
  // was on the road back with its coins, and she fetched the wood, ate, and came to the furnace at 0,63, when the evening sends
  // the day's workers home: «a fornalha apagada»)
  const tw = S().time; const lit = op && liveSec(90, () => { if (S().time > tw) S().time = tw; return !A.live(op) || op.data.lenha >= 1; }, bad); keeping = null;
  ok('e2 sem-lenha', !!op && !!cold && cold.frios >= 1 && cold.quentes === 0 && cold.lenha === 0 && lit && op.data.lenha >= 1 && !bad.length, op ? `sem lenha: ${cold.frios} banhos frios, ${cold.quentes} quentes, ${cold.lenha} de lenha queimada; com lenha no armazém de novo: ${op.data.lenha >= 1 ? `a fornalha acesa (${op.data.lenha} de lenha)` : 'a fornalha apagada'}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'não abriram');
}
// ---------------- e3 the stoker dies with the fire lit ----------------
{
  fresh(); const b = S().buildings.get(P.id); keeping = keep(ready(b)); const bad = []; seen.length = 0;
  liveSec(30, () => !!Te.dia(b), bad); const op = Te.dia(b);
  if (op) liveSec(40, () => op.data.lenha >= 1 || !A.live(op), bad);
  keeping = null; // (the fire lit, the wood kept no more: what burns now is only what the stoker brought)
  const k = Te.keeperOf(b); const kid = k ? k.id : 0; const lenha0 = op ? op.data.lenha : 0; const L0 = seen.length;
  if (k && op && A.live(op)) V.kill(k, 'teste', true);
  let rose = 0, last = op ? op.data.calor : 0, other = null;
  if (op) liveSec(Math.ceil(2 * Te.BURN) + 5, () => !A.live(op) || (other = Te.keeperOf(b)) && other.id !== kid, bad, () => { if (!A.live(op)) return; if (op.data.calor > last + 1e-6 && !(Te.keeperOf(b) && Te.keeperOf(b).id !== kid)) rose++; last = op.data.calor; });
  const byDead = seen.slice(L0).filter(e => e[8] === 'fornalha' && e[9] === kid).length;
  ok('e3 o-foguista-morre', !!op && !!kid && !rose && !byDead && !bad.length, op && kid ? `${k.name} morreu com ${lenha0} de lenha queimada: ${other && other.id !== kid ? `outro foguista assumiu (${other.name})` : `o fogo ardeu até ${op.data.calor} s`}, sem lenha nova de ninguém; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}` : 'não abriram com foguista');
}
// ---------------- e4 a save in the middle of the day, loaded twice ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b);
  liveSec(30, () => !!Te.dia(b)); const op = Te.dia(b);
  if (op) { liveSec(40, () => op.data.lenha >= 1 || !A.live(op)); bathers(b, 4); liveSec(8); }
  const mid = op && A.live(op) ? G.Save.serialize() : null; const opId = op ? op.id : 0;
  const run = () => { M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; liveSec(40); const o = A.get(opId); return o ? digest(o) : 'sem o dia'; };
  const a = mid ? run() : '', c = mid ? run() : '';
  ok('e4 save-no-meio-do-dia', !!mid && a === c, !mid ? 'o dia não chegou ao meio' : a === c ? `o mesmo futuro (${a.slice(0, 120)})` : `${a} ≠ ${c}`);
}
// ---------------- e5 the god pulls the baths down with people in the water ----------------
{
  fresh(); const b = S().buildings.get(P.id); ready(b); const ref = 'b:' + b.id; seen.length = 0;
  liveSec(30, () => !!Te.dia(b)); const op = Te.dia(b);
  if (op) { bathers(b, 4); liveSec(40, () => !A.live(op) || inBath(op) >= 1); }
  const had = op ? inBath(op) : 0; const shelf = D.list(ref); const L0 = seen.length;
  if (op && A.live(op)) { V.destroyBuilding(b, 'teste'); liveSec(3); }
  const ruin = seen.slice(L0).filter(e => e[3] === ref && e[8] === 'ruina'); const gone = {}; for (const e of ruin) gone[e[5]] = r2((gone[e[5]] || 0) + e[6]);
  const lost = Object.keys(shelf).filter(k => k !== 'moedas' && Math.abs((shelf[k] || 0) - (gone[k] || 0)) > 0.01);
  const stuck = [...S().villagers.values()].filter(v => v.task && v.task.type === 'termas' && v.task.id === b.id).length;
  ok('e5 os-banhos-caem', !!op && !A.live(op) && op.st === 'int' && !stuck && !lost.length, op ? `${had} na água: o dia ${op.st} (${op.end ? op.end.why : ''}); a prateleira ${JSON.stringify(shelf)} saiu pelo livro ${JSON.stringify(gone)}; ${stuck} ainda a caminho ou lá dentro` : 'não abriram');
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TERMAS: FALHOU (${fails.join(', ')})` : 'TERMAS: ok');
process.exit(fails.length ? 1 : 0);
