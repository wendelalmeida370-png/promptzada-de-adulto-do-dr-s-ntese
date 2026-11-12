// obra: a obra como lugar do depósito ('o', L-246) — o que os construtores levam a uma obra, e o que volta dela, pelo
// livro-razão, com a causa: nada que uma obra recebeu some, ou nasce, sem linha. No mundo pronto «cidade» (ou: node
// qa/obra.js metropole), em Node, pelo qa/nodemundo.js — o mundo de verdade: os construtores pelas tarefas deles.
//  b1 a entrega: o construtor tira do estoque ('obra', f: → v:) e põe na obra ('obra', v: → o:); a obra tem o que o livro diz
//  b2 a obra fica pronta: o que ela recebeu vira o prédio ('obra-feita'), e ela deixa de ser lugar do depósito
//  b3 a reforma largada (a cabana que ia virar casa, a que ninguém chega mais): a cabana fica, e o que veio para a casa volta
//     ao estoque ('obra-largada') — sumia (L-246)
//  b4 a obra largada: o que ela recebeu volta ao estoque, pelo livro
//  b5 o deus derruba a obra: o que ela tinha cai com ela ('ruina')
//  b6 o construtor morre com a carga a caminho: a carga vai ao estoque ('herdado'), e a obra não espera mais por ela — o que
//     ela espera a caminho é o que os construtores trazem (esperava para sempre)
//  b7 a sobra: outra mão encheu a obra enquanto o construtor vinha — o que ela não pede mais volta ao estoque ('sobra-obra')
//  b8 um save no meio da entrega, carregado: a carga a caminho continua nas mãos e sai delas pelo livro, e a obra fica pronta
//     (as muralhas da cidade, que tiram a pedra do armazém antes de toda obra, seguradas no caso, T-293; o caso espera a obra
//     com os construtores trabalhando nela, T-465)
//  b9 a carroça de comércio sai com a carga pelo livro ('carroca', f: → c:): a carroça é lugar do depósito desde o primeiro
//     mundo (registrada antes do depósito existir, nunca foi, e nenhuma carroça de comércio saía)
//  b10 a cidade abandonada com uma obra: o que ela tinha fica ao vento, pelo livro ('abandono')
//  b11 a doca terminada em pedra: sem madeira e com pedra no armazém de um povo que conhece o mar, o gerente das frotas troca
//     a madeira que a doca pede por pedra — a conta da obra e o que ela pede juntos (G.Village.swapBill): o que entrou nela pelo
//     livro é o que virou o prédio (L-416: a madeira entrava sem linha e a pedra sumia); o caso espera a doca com os construtores
//     trabalhando nela, não uma janela do mundo (T-463)
//  b12 a encomenda devolvida com material na obra: a casa paga que ninguém começou, com a madeira de um construtor nela, sai do
//     chão no dia das casas da cidade, e a madeira volta ao estoque pelo livro ('obra-largada'); um save no meio (L-474: ia junto
//     com a obra, sem linha)
//  e o verificador (as regras das obras: oficio-inv) limpo no meio de cada caso, sem erro de módulo nem aviso no console.
//   node qa/obra.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/obra.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, V = G.Village, Vg = G.Vg, A = G.Act;
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | obra ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
// (the trades' rules of the checker — the works among them —, alone, every two seconds)
const rule = QA.oficio; // (the trades' rule by its name: oficio-inv.js has more than one)
const watch = () => rule((sys, sev, msg) => { if (sys === 'oficio' && sev <= 2 && mid.length < 6 && !mid.includes(`S${sev} ${msg}`)) mid.push(`S${sev} ${msg}`); }, G.S);
const world = process.argv[2] || 'cidade';
M.pronto(world); let S = G.S; M.viver(2); G.inSim++;
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); holdWalls(); if (k % 20 === 19) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
// (what the ledger writes, as it is written — the ledger itself is trimmed in a busy town —, from the start of each case)
const seen = []; D.onMove.push(e => { seen.push(e); });
const TO_STORE = { 'sobra-obra': 1, entrega: 1, herdado: 1, 'sem-lugar': 1 };
const sum = L => Math.round(L.reduce((n, e) => n + e[6], 0) * 100) / 100;
const total = o => Math.round(Object.values(o || {}).reduce((n, x) => n + (x || 0), 0) * 100) / 100;
const flowOf = ref => Math.round((sum(seen.filter(e => e[4] === ref)) - sum(seen.filter(e => e[3] === ref))) * 100) / 100;
// the town: the most people of all, with builders and a store
const builders = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'construtor' && !v.captive && A.able(v));
let set0 = [...S.settlements.values()].filter(s => builders(s).length >= 2 && V.dropoffs(s.id).length).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
if (!set0) { console.log('FALHOU | obra | nenhuma cidade com construtores e armazém'); process.exit(1); }
let f0 = G.Fac.get(set0.fac);
// (the town's walls held in every case — siege.js raises them straight from the store, two stones a tile as soon as it has three,
// with no hands, before any work (L-420, open) —: with the tip a39483e proud Roma began a stone wall in the b1, and the wall took
// the 60 of stone the case had put in the store within the 120 s, and the well of the b2 waited its 300 s for 11. The b8 held
// them already (T-293); the cases are the works, not who gets the stone first, T-312)
function holdWalls() { for (const q of S.walls || []) if (!q.done && q.set === set0.id) q.done = true; }
const reload = () => { G.inSim--; M.salvarCarregar(); G.inSim++; S = G.S; set0 = S.settlements.get(set0.id); f0 = G.Fac.get(f0.id); };
console.log(`(${world}: ${set0.name}, de ${f0.name}: ${V.pop(set0.id)} habitantes, ${builders(set0).length} construtores)`);
// (wood and stone in the store for the works of the cases)
const stock = () => { for (const k of ['wood', 'stone']) { const n = Math.min(D.room('f:' + f0.id, k), Math.max(0, 60 - D.get('f:' + f0.id, k))); if (n >= 1) D.make('f:' + f0.id, k, Math.floor(n), { code: 'teste' }); } };
const project = (set, type) => { for (const t of [type, 'well', 'house', 'hut']) { const b = V.startProject(set, t); if (b) return b; } return null; };
const site = id => { const b = S.buildings.get(id); return b && !b.built && b.type !== 'ruin' ? b : null; };
const onIt = id => [...S.villagers.values()].filter(v => v.task && v.task.type === 'build' && v.task.id === id);
const carrying = id => onIt(id).find(v => v.task.counted && v.carry && v.carry.n > 0);
const firstNeed = (b, n) => Object.keys(b.need).sort().find(k => b.need[k] >= n);
// (a builder with free hands, not on this work: the next to look for work — the door every builder of the world goes
// through, G.Vg.H.workTask —, or sent to this work with the task the planner's builders get)
const freeBuilder = id => builders(set0).filter(v => !(v.carry && v.carry.n > 0) && !(v.task && v.task.type === 'build' && v.task.id === id) && !v.sleeping && !v.inside).sort((a, b) => a.id - b.id)[0] || null;
const nextLooks = () => { const w = freeBuilder(0); if (w) { Vg.endTask(w); Vg.H.workTask(w); } return w; };
// (by day: a builder is sent in the morning — the night's sleep would keep the load for the next day)
// (stop: the case's own question, asked at every step of the wait — the b8's load on its way, which the town's builders may bring
// before one is free)
const send = (b, stop) => {
  if (S.time < 0.25 || S.time > 0.6) { S.time = 0.27; if (live(3, stop)) return null; }
  let w = null; for (let k = 0; k < 30 && !(w = freeBuilder(b.id)); k++) if (live(1, stop)) return null; // (one with free hands: the other may be carrying)
  // (rested and fed, as the planner's builder of a morning — the test's hand: in the branch joined with b8c072c the builder
  // sent to the well, Sabina, went to bed 5 s later, her morning's energy spent, and then to a cave and to eat, and nobody
  // brought a load to it in 120 s: the case is the load on its way, not who is fit to carry it. A work left by one who goes to
  // bed is taken by the next builder — the fome.js h1 and h3, T-244 —, T-293)
  if (w) { w.energy = Math.max(w.energy, 70); w.hunger = Math.min(w.hunger, 30); w.sleeping = false; Vg.endTask(w); Vg.H.setTask(w, { type: 'build', id: b.id, pri: 1, st: 0 }); } return w;
};

// ---------------- b1 the delivery; b2 the work stands ----------------
{
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0; const ref = 'o:' + id;
  const came = !!b && live(120, () => total(V.delivered(S.buildings.get(id) || {})) >= 4 || !site(id));
  const into = seen.filter(e => e[4] === ref && e[8] === 'obra');
  const taken = seen.filter(e => e[8] === 'obra' && /^f:/.test(e[3]) && into.some(q => q[3] === e[4]));
  const has = site(id) ? total(V.delivered(b)) : total(V.bill(b || {}));
  ok('b1 a-entrega', came && into.length > 0 && into.every(e => /^v:/.test(e[3])) && taken.length > 0 && Math.abs(sum(into) - has) < 0.01, b ? `${b.type}#${id}: ${has} de material na obra; ${into.length} entregas pelo livro (${sum(into)}), das mãos de quem tirou do estoque (${taken.length} linhas f: → v:)` : 'nenhuma obra possível');
  const done = !!b && live(300, () => !site(id));
  const o = S.buildings.get(id); const built = seen.filter(e => e[3] === ref && e[8] === 'obra-feita');
  ok('b2 a-obra-pronta', done && !!o && o.built && Math.abs(sum(built) - total(V.bill(o))) < 0.01 && !D.exists(ref) && Math.abs(flowOf(ref)) < 0.01, o ? `${o.type}#${id} ${o.built ? 'de pé' : 'ainda obra a ' + Math.round(o.progress * 100) + '%'}: ${sum(built)} de material virou o prédio ('obra-feita'), a conta era ${total(V.bill(o))}; lugar do depósito: ${D.exists(ref) ? 'ainda' : 'não mais'}` : 'a obra sumiu');
}
// ---------------- b8 a save in the middle of a delivery (while the town's builders are free of other works) ----------------
{
  // (the town's walls held for the case — one it begins in the middle of it too —, and given back after it: siege.js raises
  // them straight from the store, two stones a tile as soon as it has three, with no hands, before any work, L-420; in the
  // branch joined with b8c072c proud Roma, with the 60 of stone the case puts in its store, began a stone wall a few seconds
  // after the load, and the wall took the 60 in 9 s and every stone after it: the well waited the 400 s for its 12. The case
  // is the save in the middle of a delivery, not who gets the stone first, T-293)
  const held = []; const hold = () => { (S.walls || []).forEach((q, i) => { if (!q.done && q.set === set0.id) { q.done = true; held.push(i); } }); };
  // (and the premise armed in any course, as the b11's: the god's peace held, the town's feast of each day kept for another
  // day, the weather calm, and the wood and stone of the cases kept in the people's store (stock) while the case runs — the
  // families' commissions have their turn before the city's works (L-313), and the town's older works take the rest —; after
  // the load the case waits for the well while builders work on it — the time on its build task, up to the 400 s of before,
  // ten days of the world at most —, not a window of the world. T-465: in the «cidade» of the generation 14 the 400 s after
  // the load ended with the well at 67%: the builders went on with the sobrados two families had paid for, a storm sent them
  // home at 0,59, then the evening at home, the night and the Jól; with the peace, the feast and the weather held, the store
  // had no stone from the third day on, and the well stood at 44% for days, 10 of stone short)
  let k8 = 0;
  const calm8 = () => {
    if (!(S.divinePeace > 0)) G.Politics.divinePeace();
    S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0;
    if (!set0.festPlan || set0.festPlan.day !== S.day || set0.festPlan.key || !set0.festPlan.done) set0.festPlan = { day: S.day, key: null, done: true };
    if (++k8 % 20 === 0) stock();
  };
  calm8(); hold(); stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0;
  // (the load looked for from the work's first step, the wait for a free builder too: in the «cidade» of the generation 19 the well
  // was begun at 0,12, the clock went to the morning, and Mênfis's two builders took it by themselves — the send waited for one
  // not on it — and built it in the 14 s of the wait, before the case looked for a load: «salva com ninguém carregando»)
  const look8 = () => { calm8(); hold(); return !!carrying(id); };
  if (b) send(b, look8);
  const mid0 = !!b && (look8() || live(240, look8));
  const w = b && carrying(id); const was = w ? `${w.carry.n} de ${w.carry.k} nas mãos de ${w.name}` : 'ninguém carregando';
  const wid = w ? w.id : 0, wk = w ? w.carry.k : null, wn = w ? w.carry.n : 0;
  if (b) reload();
  // (the load the save caught on its way is in the hands after the load, and leaves them by the ledger: the tasks do not go
  // in the save, and the save gives no work a load on its way (incoming), so the carrier's next work is the planner's — the
  // well, or another work of the town that needs it —; with none that needs it, the store)
  const c8 = S.villagers.get(wid); const kept = !!w && !!c8 && !!c8.carry && c8.carry.k === wk && Math.abs(c8.carry.n - wn) < 0.01;
  const L8 = seen.length, t8 = S.clock; let work = 0;
  const done = !!b && live(10 * G.DAY_LEN, () => { calm8(); hold(); if (onIt(id).length) work += 0.1; return !site(id) || work >= 400; }) && !site(id);
  let left = 0; const out8 = []; for (const e of seen.slice(L8)) if (e[3] === 'v:' + wid && e[5] === wk && left < wn - 1e-6) { out8.push(e); left += e[6]; }
  const to8 = out8.map(e => `${e[6]} ${/^o:/.test(e[4]) ? (e[4] === 'o:' + id ? 'no poço' : 'na obra #' + e[4].slice(2)) : /^f:/.test(e[4]) ? 'no armazém' : e[4]} ('${e[8]}')`).join(', ');
  const o = S.buildings.get(id); for (const i of held) if (S.walls[i]) S.walls[i].done = false;
  const byBook = out8.every(e => (e[8] === 'obra' && /^o:/.test(e[4])) || (TO_STORE[e[8]] && /^f:/.test(e[4])));
  ok('b8 save-no-meio-da-entrega', mid0 && kept && Math.abs(left - wn) < 0.01 && byBook && done && !!o && o.built, b ? `${b.type}#${id}, salva com ${was}, carregada: ${kept ? 'a carga nas mãos depois do load' : 'a carga NÃO estava nas mãos depois do load'}, e ela saiu delas pelo livro: ${to8 || 'NADA'}; o poço ${o && o.built ? 'pronto' : o ? 'ainda a ' + Math.round(o.progress * 100) + '%' : 'sumiu'} (${Math.round(work)} s de construtor nele, em ${Math.round(S.clock - t8)} s do mundo depois do load)` : 'nenhuma obra possível');
}
// ---------------- b3 a reform given up (L-246) ----------------
{
  stock(); seen.length = 0;
  const old = [...S.buildings.values()].filter(o => o.set === set0.id && o.type === 'hut' && o.built && !o.upgradeFrom).sort((a, b) => a.id - b.id)[0];
  if (!old) ok('b3 a-reforma-largada', true, `${set0.name} não tem cabana: sem o caso`);
  else {
    // (the planner's reform of a hut into a house, as the town does it — village.js —, and the stone that came for it)
    const id = old.id, ref = 'o:' + id;
    old.type = 'house'; old.built = false; old.progress = 0; old.upgradeFrom = 'hut'; V.refound(old); old.hp = G.BDEF.house.hp; old.maxHp = old.hp;
    const k = firstNeed(old, 4); const r = k ? D.make(ref, k, 4, { code: 'teste' }) : { ok: false };
    // (and nobody reaches it any more: the next builder that looks for work gives it up)
    for (const v of onIt(id)) Vg.endTask(v); old.unreach = 6; old.unreachT = S.clock;
    if (r.ok) nextLooks();
    const back = r.ok && live(40, () => { const o = S.buildings.get(id); return !!o && o.built && o.type === 'hut'; });
    const ret = seen.filter(e => e[3] === ref && e[8] === 'obra-largada');
    ok('b3 a-reforma-largada', back && Math.abs(sum(ret) - 4) < 0.01 && ret.every(e => e[4] === 'f:' + f0.id) && Math.abs(flowOf(ref)) < 0.01, `cabana #${id} reformada em casa, 4 de ${k} entregues: ${back ? 'a cabana ficou' : 'a reforma não foi largada'}; o que veio para a casa voltou ao estoque pelo livro: ${sum(ret)} ('obra-largada')`);
  }
}
// ---------------- b4 a work given up; b5 a work the god pulls down ----------------
{
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0, ref = 'o:' + id;
  const k = b && firstNeed(b, 3); const r = k ? D.make(ref, k, 3, { code: 'teste' }) : { ok: false };
  if (b) { for (const v of onIt(id)) Vg.endTask(v); b.unreach = 6; b.unreachT = S.clock; if (r.ok) nextLooks(); }
  const gone = r.ok && live(40, () => !S.buildings.has(id));
  const ret = seen.filter(e => e[3] === ref && e[8] === 'obra-largada');
  ok('b4 a-obra-largada', gone && sum(ret) >= 3 - 0.01 && Math.abs(flowOf(ref)) < 0.01, b ? `${b.type}#${id} com ${k}: ${gone ? 'largada' : 'ainda de pé'}; voltou ao estoque pelo livro ${sum(ret)}, e o que entrou nela saiu (${flowOf(ref)} sobrando)` : 'nenhuma obra possível');
}
{
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0, ref = 'o:' + id;
  const k = b && firstNeed(b, 2); const r = k ? D.make(ref, k, 2, { code: 'teste' }) : { ok: false };
  if (b && r.ok) { V.destroyBuilding(b, 'teste'); live(2); }
  const lost = seen.filter(e => e[3] === ref && e[8] === 'ruina'); const o = S.buildings.get(id);
  ok('b5 o-deus-derruba-a-obra', r.ok && Math.abs(sum(lost) - 2) < 0.01 && !D.exists(ref) && Math.abs(flowOf(ref)) < 0.01, b ? `${b.type}#${id}: ${o ? o.type : 'sumiu'}; o que ela tinha caiu com ela pelo livro: ${sum(lost)} de ${k} ('ruina')` : 'nenhuma obra possível');
}
// ---------------- b7 the excess (before b6: a builder dies there) ----------------
{
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0, ref = 'o:' + id;
  if (b) send(b);
  live(120, () => !!carrying(id) || !site(id));
  const w = b && carrying(id);
  if (!w) ok('b7 a-sobra', !!b && !site(id), b ? 'ninguém levou carga a ela em 120 s' : 'nenhuma obra possível');
  else {
    // (another hand fills the work with what the builder is bringing)
    const k = w.task.mat, n = w.carry.n, wid = w.id; const fill = b.need[k]; D.make(ref, k, fill, { code: 'teste' });
    live(60, () => !(S.villagers.get(wid) && S.villagers.get(wid).carry && S.villagers.get(wid).task && S.villagers.get(wid).task.type === 'build' && S.villagers.get(wid).task.id === id));
    // (back to the store at the work — or, the work standing before the load came, by the delivery of the hands)
    const back = seen.filter(e => e[3] === 'v:' + wid && TO_STORE[e[8]]); const over = seen.filter(e => e[3] === 'v:' + wid && e[4] === ref);
    ok('b7 a-sobra', Math.abs(sum(back) - n) < 0.01 && !over.length, `${n} de ${k} a caminho, a obra enchida por outra mão (${fill}): voltou ao estoque ${sum(back)} (${[...new Set(back.map(e => e[8]))].join(', ')}), entrou na obra ${sum(over)}`);
  }
}
// ---------------- b6 the builder dies with the load on the way ----------------
{
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0;
  if (b) send(b);
  live(120, () => !!carrying(id) || !site(id));
  const w = b && carrying(id);
  if (!w) ok('b6 o-construtor-morre-com-a-carga', !!b && !site(id), b ? 'ninguém levou carga a ela em 120 s' : 'nenhuma obra possível');
  else {
    const k = w.task.mat, n = w.carry.n, wid = w.id, before = b.incoming[k];
    V.kill(w, 'teste', true);
    const others = onIt(id).filter(v => v.task.counted && v.task.mat === k).reduce((q, v) => q + (v.task.cn || 0), 0);
    const store = seen.filter(e => e[3] === 'v:' + wid && TO_STORE[e[8]]);
    watch();
    ok('b6 o-construtor-morre-com-a-carga', Math.abs((b.incoming[k] || 0) - others) < 0.01 && Math.abs(sum(store) - n) < 0.01, `${n} de ${k} a caminho de ${b.type}#${id}: a carga foi ao estoque pelo livro (${sum(store)}, 'herdado'); a obra esperava ${before} a caminho, agora ${b.incoming[k]} — o que os outros trazem: ${others}`);
  }
}
// ---------------- b13 a scene takes the builder with the load on the way, and another errand takes him from the scene (L-722) ----------------
{
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0;
  if (b) send(b);
  live(120, () => !!carrying(id) || !site(id));
  const w = b && carrying(id);
  if (!w) ok('b13 a-cena-e-a-carga-a-caminho', !!b && !site(id), b ? 'ninguém levou carga a ela em 120 s' : 'nenhuma obra possível');
  else {
    // (a scene of the test's hand, never ticked: the builder taken with his errand put aside to be given back, as the scenes
    // of the stories take — G.Scene.H.take, keep —; then his errand ended from outside, as a call of higher order ends it)
    const k = w.task.mat, before = b.incoming[k], cn = w.task.cn || 0; const Sn = G.Scene;
    const sc = { id: S.nextId++, key: 'teste', st: 'run', taken: new Map() }; Sn.list.push(sc);
    const took = Sn.H.take(sc, w, { keep: true }); const kept = Sn.prevTask(w); const lent = b.incoming[k];
    G.Vg.endTask(w);
    const others = onIt(id).filter(v => v.task.counted && v.task.mat === k).reduce((q, v) => q + (v.task.cn || 0), 0);
    Sn.list.splice(Sn.list.indexOf(sc), 1);
    watch();
    ok('b13 a-cena-e-a-carga-a-caminho', took && !!kept && kept.type === 'build' && kept.counted === false && Math.abs(lent - before) < 0.01 && Math.abs((b.incoming[k] || 0) - others) < 0.01 && !w.task,
      `${w.name} levava ${cn} de ${k} a ${b.type}#${id} (a obra esperava ${before} a caminho) e uma cena o tomou com a tarefa guardada (a obra segue esperando ${lent}); outra tarefa o tirou da cena: a obra espera ${b.incoming[k]} — o que os outros trazem: ${others}; a tarefa guardada ${kept && kept.counted === false ? 'foi encerrada com a conta dela' : 'FICOU contada'}`);
    // (and the load in his hands goes where the old errands take it; the world lives on, the checker clean)
    live(30);
  }
}
// ---------------- b9 a cart of trade, by the ledger ----------------
{
  seen.length = 0; const PEACE = { paz: 1, alianca: 1, vassalo: 1 };
  let r = S.routes.find(q => q.kind === 'comercio' && q.ok);
  if (!r) {
    // (none in this world: one opened by hand between the capitals of two peoples at peace, as the city opens them)
    for (const f of G.Fac.all()) for (const o of G.Fac.all()) {
      if (r || o.id <= f.id) continue; const rel = G.Fac.rel(f.id, o.id); if (!rel || !PEACE[rel.st]) continue;
      const a = G.Fac.capitalOf(f.id), c = G.Fac.capitalOf(o.id); if (!a || !c) continue;
      const p = G.W.findPath(a.cx, a.cy, c.cx, c.cy, true, G.N * G.N); if (!p || !p.length) continue;
      r = { id: S.nextId++, a: a.id, b: c.id, kind: 'comercio', pts: [[a.cx, a.cy]].concat(p).map(q => [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]), tiles: [], day: S.day, ok: true, cartT: 0, paved: 0, trips: 0 };
      S.routes.push(r);
    }
  }
  if (!r) ok('b9 a-carroca-de-comercio', true, 'nenhum par de povos em paz com caminho: sem o caso');
  else {
    const A0 = S.settlements.get(r.a), B0 = S.settlements.get(r.b);
    for (const s of [A0, B0]) for (const k of ['food', 'wood', 'stone']) { const n = Math.min(D.room('f:' + s.fac, k), 60); if (n >= 1) D.make('f:' + s.fac, k, Math.floor(n), { code: 'teste' }); }
    r.cartT = 0; const out = () => seen.filter(e => e[8] === 'carroca' && /^f:/.test(e[3]) && /^c:/.test(e[4]));
    live(20, () => out().length > 0);
    const L = out()[0]; const c = L && S.carts.find(q => 'c:' + q.id === L[4]);
    ok('b9 a-carroca-de-comercio', !!L && (!c || Math.abs(D.get(L[4], L[5]) - L[6]) < 0.01 || c.back), L ? `${A0.name} ↔ ${B0.name}: a carroça saiu com ${L[6]} de ${L[5]} pelo livro (${L[3]} → ${L[4]})${c ? `; nela agora ${D.get(L[4], L[5])}` : ''}` : `${A0.name} ↔ ${B0.name}: nenhuma carroça saiu com carga (carroças ${S.carts.length})`);
  }
}
// ---------------- b10 a town left to the wind with a work in it ----------------
{
  seen.length = 0;
  // (the smallest other town — of a people with other towns, if there is one —, with room for a work)
  const towns = [...S.settlements.values()].filter(q => q.id !== set0.id && V.pop(q.id) > 0).sort((a, b) => (G.Fac.settlementsOf(b.fac).length > 1) - (G.Fac.settlementsOf(a.fac).length > 1) || V.pop(a.id) - V.pop(b.id) || a.id - b.id);
  let s = null, b = null; for (const q of towns) { b = project(q, 'well'); if (b) { s = q; break; } }
  const id = b ? b.id : 0, ref = 'o:' + id;
  if (!b) ok('b10 a-cidade-abandonada', true, 'nenhuma outra cidade com lugar para uma obra: sem o caso');
  else {
    const k = firstNeed(b, 2); const r = k ? D.make(ref, k, 2, { code: 'teste' }) : { ok: false };
    for (const v of [...S.villagers.values()].filter(q => q.set === s.id)) V.kill(v, 'teste', true);
    V.abandon(s); live(3);
    const lost = seen.filter(e => e[3] === ref && e[8] === 'abandono');
    ok('b10 a-cidade-abandonada', r.ok && !S.settlements.has(s.id) && Math.abs(sum(lost) - 2) < 0.01 && Math.abs(flowOf(ref)) < 0.01, `${s.name}, vazia, abandonada com ${b.type}#${id} (2 de ${k} nela): ficou ao vento pelo livro ${sum(lost)} ('abandono')`);
  }
}
// ---------------- b11 the quay finished in stone (L-416) ----------------
// (no timber in the store of a people that knows the sea, and stone to spare: the fleets' manager — naval.js, every 4 s —
// trades the wood a quay still needs for stone, four at a time, one and a half stone for each; the trade is the work's bill
// and its need together, G.Village.swapBill. The need alone traded made wood come into the quay with no line and stone
// vanish in it: a quay of the free people of Óstia, in the chao.js, ended with -8 of wood and 12 of stone unwritten)
{
  seen.length = 0;
  const towns = [...S.settlements.values()].filter(q => builders(q).length && G.Fac.get(q.fac)).sort((a, b) => (b.id === set0.id) - (a.id === set0.id) || V.pop(b.id) - V.pop(a.id) || a.id - b.id);
  let s = null, b = null; for (const q of towns) { b = V.startProject(q, 'doca'); if (b) { s = q; break; } }
  if (!b) ok('b11 a-doca-de-pedra', true, 'nenhuma cidade com construtores e lugar para uma doca: sem o caso');
  else {
    const id = b.id, ref = 'o:' + id, f = G.Fac.get(s.fac), F = 'f:' + f.id;
    // (the people knows the sea; its store has no timber, and stone for the quay — the test's hand, kept so while the case runs)
    if (f.tech && f.tech.known) f.tech.known.navegacao = 1;
    const keep = () => { const w = D.get(F, 'wood'); if (w > 0) D.use(F, 'wood', w, { code: 'teste', mine: true }); const st = D.get(F, 'stone'); const n = Math.min(D.room(F, 'stone'), 40 - st); if (n >= 1) D.make(F, 'stone', Math.floor(n), { code: 'teste' }); };
    keep(); if (S.time < 0.25 || S.time > 0.6) { S.time = 0.27; }
    // (the case waits for the quay while builders work on it — the time counted is theirs on its work, the build task the
    // planner gives, not a window of the world: by the game's rule the builders work in their hours — the night, the evening
    // at home, a conclave, the town's feast take them — and the planner shares them among the town's works. And the premise
    // armed in any course, as the compras c9 and the lazer keep theirs: the god's peace held, so that no band takes them for
    // good; the town's feast of each day kept for another day (festivals.js, the plan of the day: it takes them with the load
    // in their hands); the weather calm. T-463: after the L-540 and the L-541 the 900 s of the world ended with the quay of
    // Hedeby at 88% (48 of 53 stones): the builders had been 319 s on it — the town's other works first, the Jól, the nights
    // —, and in the last day a band took them, the stones of one of them in her hands. Ten days of the world at most)
    const calm11 = () => {
      if (!(S.divinePeace > 0)) G.Politics.divinePeace();
      S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0;
      if (!s.festPlan || s.festPlan.day !== S.day || s.festPlan.key || !s.festPlan.done) s.festPlan = { day: S.day, key: null, done: true };
    };
    calm11(); const c11 = S.clock; let k2 = 0, work = 0;
    const done = live(10 * G.DAY_LEN, () => { calm11(); if (++k2 % 20 === 0) keep(); if (onIt(id).length) work += 0.1; return !site(id) || work >= 900; }) && !site(id);
    const o = S.buildings.get(id); const into = seen.filter(e => e[4] === ref); const built = seen.filter(e => e[3] === ref && e[8] === 'obra-feita');
    const inOf = k => sum(into.filter(e => e[5] === k)); const bill = o ? V.bill(o) : {};
    const traded = !!(o && o.troca && o.troca.wood < 0);
    ok('b11 a-doca-de-pedra', done && !!o && o.built && traded && Math.abs(sum(built) - total(bill)) < 0.01 && Math.abs(inOf('wood') - (bill.wood || 0)) < 0.01 && Math.abs(inOf('stone') - (bill.stone || 0)) < 0.01 && Math.abs(flowOf(ref)) < 0.01,
      o ? `${s.name}, doca #${id} ${o.built ? 'de pé' : 'ainda obra a ' + Math.round((o.progress || 0) * 100) + '%'} (${Math.round(work)} s de construtor nela, em ${Math.round(S.clock - c11)} s do mundo): a troca ${traded ? JSON.stringify(o.troca) : 'NÃO houve'}, a conta ${JSON.stringify(bill)}; entrou na obra pelo livro ${inOf('wood')} de madeira e ${inOf('stone')} de pedra; virou o prédio ('obra-feita') ${sum(built)}; o que entrou e não saiu: ${flowOf(ref)}` : 'a doca sumiu');
  }
}
// ---------------- b12 a commission given back with material on its site (L-474) ----------------
// (a house paid for that nobody started — no stroke on it after the days a family waits, G.Casa.MAX_WAIT —: the town's day of
// houses gives the family its coins back and takes the work off the ground, act-casa.js; what its builders had brought to it
// is the people's, and goes back to their store, as a work given up does ('obra-largada'). It left the world with the work,
// unwritten: in the mundial of the generation 12, the house #35209 of Birka, paid for on day 66, got 4 of wood from a builder
// of the family on day 69 and no stroke after it, and on day 70 the wood went with the work. A save in the middle: the
// commission and the material on the site load as they were, and the checker looks at the site again before the day)
{
  seen.length = 0; const K = G.Casa;
  let b = null; for (const t of ['house', 'hut']) if (!b) b = V.startProject(set0, t);
  const v = [...S.villagers.values()].filter(o => o.set === set0.id && o.age >= 18 && o.home && !o.captive).sort((p, q) => p.id - q.id)[0];
  if (!b || !G.BDEF[b.type].housing || !v || !K) ok('b12 a-encomenda-devolvida', false, !b ? `${set0.name}: nenhum lugar para uma casa` : !v ? `${set0.name}: ninguém para encomendar` : `${b.type}#${b.id} não é casa`);
  else {
    const id = b.id, ref = 'o:' + id, type = b.type;
    // (the test's hand: the commission as the family's order makes it — paid for by a people without coin, nothing —, made the
    // days a family waits ago; and the 4 of wood a builder brought to it, with no stroke)
    b.dono = v.id; b.encomenda = { fam: [v.id], d: S.day - K.MAX_WAIT - 1, paid: 0, by: v.id, why: 'casal', fac: set0.fac };
    const k = (b.need.wood || 0) >= 4 ? 'wood' : firstNeed(b, 4); const r = k ? D.make(ref, k, 4, { code: 'teste' }) : { ok: false };
    reload(); watch(); const o = S.buildings.get(id);
    const kept = !!o && !!o.encomenda && Math.abs((V.delivered(o)[k] || 0) - 4) < 0.01 && !o.progress;
    K.day(set0); live(2);
    const ret = seen.filter(e => e[3] === ref && e[8] === 'obra-largada'); const gone = !S.buildings.has(id);
    ok('b12 a-encomenda-devolvida', r.ok && kept && gone && Math.abs(sum(ret) - 4) < 0.01 && ret.every(e => e[4] === 'f:' + f0.id) && Math.abs(flowOf(ref)) < 0.01,
      `${type}#${id} encomendada por ${v.name}, parada ${K.MAX_WAIT + 1} dias com 4 de ${k} nela${kept ? '' : ' (NÃO carregada assim)'}, salva e carregada: ${gone ? 'devolvida e tirada do chão' : 'AINDA no chão'}; o que ela recebeu voltou ao estoque pelo livro ${sum(ret)} ('obra-largada'), e o que entrou nela ${Math.abs(flowOf(ref)) < 0.01 ? 'saiu' : 'NÃO saiu: ' + flowOf(ref) + ' sem linha'}`);
  }
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `OBRA: FALHOU (${fails.join(', ')})` : 'OBRA: ok');
process.exit(fails.length ? 1 : 0);
