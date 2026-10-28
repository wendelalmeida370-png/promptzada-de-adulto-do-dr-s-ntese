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
//  b8 um save no meio da entrega, carregado: a obra fica pronta
//  b9 a carroça de comércio sai com a carga pelo livro ('carroca', f: → c:): a carroça é lugar do depósito desde o primeiro
//     mundo (registrada antes do depósito existir, nunca foi, e nenhuma carroça de comércio saía)
//  b10 a cidade abandonada com uma obra: o que ela tinha fica ao vento, pelo livro ('abandono')
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
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 20 === 19) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };
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
const send = b => {
  if (S.time < 0.25 || S.time > 0.6) { S.time = 0.27; live(3); }
  let w = null; for (let k = 0; k < 30 && !(w = freeBuilder(b.id)); k++) live(1); // (one with free hands: the other may be carrying)
  if (w) { Vg.endTask(w); Vg.H.setTask(w, { type: 'build', id: b.id, pri: 1, st: 0 }); } return w;
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
  stock(); seen.length = 0; const b = project(set0, 'well'); const id = b ? b.id : 0;
  if (b) send(b);
  const mid0 = !!b && live(240, () => !!carrying(id));
  const w = b && carrying(id); const was = w ? `${w.carry.n} de ${w.carry.k} nas mãos de ${w.name}` : 'ninguém carregando';
  if (b) reload();
  const done = !!b && live(400, () => !site(id));
  const o = S.buildings.get(id);
  ok('b8 save-no-meio-da-entrega', mid0 && done && !!o && o.built, b ? `${b.type}#${id}, salva com ${was}, carregada: ${o && o.built ? 'pronta' : o ? 'ainda a ' + Math.round(o.progress * 100) + '%' : 'sumiu'}` : 'nenhuma obra possível');
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
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `OBRA: FALHOU (${fails.join(', ')})` : 'OBRA: ok');
process.exit(fails.length ? 1 : 0);
