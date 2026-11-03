// obra-longe: a tarefa de obra conta os seus 70 s por perna (L-358) — o construtor que trabalhou e depois vai buscar
// material num armazém longe não morre no meio da ida, e a carga chega à obra. No mundo pronto «metrópole», na cidade
// cuja casa nova a cidade põe mais longe de um armazém: a mão da prova põe ali a obra de uma ínsula, faltando só pedra —
// cargas bastantes para a tarefa inteira passar muito dos 70 s, com cada perna bem abaixo deles —, e dá a tarefa a um
// adulto descansado, à porta da obra, de manhã e em paz. o1 a mesma tarefa leva carga atrás de carga (ida, volta com a
// pedra, trabalho, de novo) depois dos 70 s, nenhuma perna passa deles, e ela não morre no meio de uma perna (acaba quando
// não há mais o que levar); a obra é só dela — quem mais da cidade a toma, a mão da prova põe de lado —, e quem o mundo
// chama antes do caso dá a vez ao próximo (T-359); o2 a perna parada — o construtor preso no caminho pela mão da prova, de
// manhã de novo, no mundo pronto de novo — ainda morre nos 70 s.
//   node qa/obra-longe.js
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const D = G.Depot, V = G.Village, W = G.W;
const fails = [];
const bad = () => QA.check().filter(q => q.sev <= 2);
const ok = (name, c, info) => { const now = c ? [] : bad().map(q => q.msg); console.log(`${c ? 'PASSOU' : 'FALHOU'} | obra-longe ${name} | ${info}${now.length ? ' — o verificador: ' + now.slice(0, 2).join(' · ') : ''}`); if (!c) fails.push(name); };
const r1 = x => Math.round(x * 10) / 10;
let S;
const fresh = () => { M.pronto('metropole'); S = G.S; M.viver(2); S.time = 0.08; S.weather.storm = 0; };
fresh(); G.inSim++;
// (where a town puts its next house, and how far that is from the store nearest to it, by the walk: the town whose next
// house is farthest from a store — one reached from there)
const front = b => V.frontTile(b);
function farthest() {
  let best = null;
  for (const set of [...S.settlements.values()].sort((a, c) => a.id - c.id)) {
    if (!V.dropoffs(set.id).length || V.pop(set.id) < 10 || G.War.threat(set.id)) continue;
    const pos = V.findSite(set, 'house'); if (!pos || pos.demolish) continue;
    const at = { x: pos[0] + 0.5, y: pos[1] + 1.5 };
    const near = V.dropoffs(set.id).filter(d => { const [dx, dy] = front(d); return W.reaches(at, dx, dy); }).map(d => [d, G.dist(at.x, at.y, ...front(d))]).sort((p, q) => p[1] - q[1])[0];
    if (near && (!best || near[1] > best.d)) best = { set, pos, store: near[0], d: near[1] };
  }
  return best;
}
const site = farthest();
if (!site) { ok('o1 a ida longe', false, 'nenhuma cidade em paz com um armazém e lugar para uma casa'); process.exit(1); }
const { set } = site; const f = 'f:' + set.fac;
// (one who can carry a full load, rested, fed and well, of the town, not the god's body: the test's hand sets them at the
// site's door, the task given by the world's door)
const able = o => o.set === set.id && o.age >= 18 && o.age < 50 && o.hp >= 80 && !o.captive && !o.jail && !o.aboard && !o.ug && !o.sick && !o.held && !o.air && !o.carry && !(S.avatar && S.avatar.id === o.id);
function builder(not) { return [...S.villagers.values()].filter(o => able(o) && !not.has(o.id)).sort((a, c) => (a.role === 'construtor' ? 0 : 1) - (c.role === 'construtor' ? 0 : 1) || a.id - c.id)[0] || null; }
// (the people's stone kept by the god's hand while the case runs: the town's own works take from the same store, and a task
// with no stone left to fetch ends — the case is the leg, not the store)
// (the free stone, not the whole: in the metropole of the v37's last worlds Tenochtitlan's works had all of it reserved, and the
// builder had no stone to fetch — the task ended in a second, T-261)
const keep = () => { const fr = D.free(f, 'stone'); if (fr < 30) D.make(f, 'stone', 60 - fr, { code: 'teste', part: true }); };
// (the test's hand fills a work by the ledger, as a builder does ('o:'), leaving only `stone` of stone to come: written by
// hand, the need made the stone and the wood come into the work with no line, and the work stood with them — the S2 of the
// works' ledger, QA.oficio —; and a work that took brick for part of its stone at its foundation (D-075: Alba Longa has a
// pottery) has it traded back to stone by the work's own door, V.swapBill (L-416): the case is a work of stone — with the
// brick it had 15 stone to come, too little to carry past the 70 s — T-308)
const fill = (b, stone) => {
  if (b.brick && b.need[b.brick.k] > 0) V.swapBill(b, b.brick.k, b.need[b.brick.k], 'stone', b.need[b.brick.k]);
  for (const k of Object.keys(b.need).sort()) { const n = (b.need[k] || 0) - (k === 'stone' ? stone : 0); if (n > 0) D.make('o:' + b.id, k, n, { code: 'teste' }); }
  b.incoming = { wood: 0, stone: 0 };
};
function give(v, b) {
  G.Vg.endTask(v); v.sleeping = false; v.inside = 0; v.hunger = 0; v.path = null;
  // (and the jar at home full: in the same metropole the houses of Tenochtitlan were low on water, and Citlalin left the work
  // for the well in the first seconds, T-261)
  { const hb = S.buildings.get(v.home); if (hb) hb.water = 1; }
  const [fx, fy] = front(b); v.x = fx; v.y = fy;
  G.Vg.setTask(v, { type: 'build', id: b.id, pri: 1, st: 0 });
  return v.task && v.task.type === 'build' && v.task.id === b.id ? v.task : null;
}
// ---------------- o1: every load in the same task — out to the store, back with the stone, the work, again
// (a builder the world calls away for a cause of its own before the case is made — a body in the street to the pyre,
// carnage.js's 1,02 over the work's 1: Décimo, at 43 s, in the metropole of the generation 11 with the L-471 — is no answer:
// the case goes again from the ready world with the next builder, up to three, as the o2 does, T-359)
{
  const per = 2 * site.d / 1.3 + 3; // (a load: there and back at a walk, and its share of the work)
  // (the whole task well past 70 s — within the stone an insula's bill has)
  const loads = Math.min(Math.floor((G.BDEF.insula.cost.stone || 0) / 4), Math.max(3, Math.ceil(150 / per)));
  let info = 'ninguém para construir', fine1 = false; const calls = []; const tried = new Set();
  for (let att = 0; att < 3 && !fine1; att++) {
    if (att) fresh();
    const b = V.addBuilding('insula', site.pos[0], site.pos[1], set.id, false);
    fill(b, loads * 4); // (the test's hand: the wood in, only stone missing)
    keep();
    const v = builder(tried); if (!v) { info = 'ninguém para construir'; break; } tried.add(v.id);
    const t = give(v, b); if (!t) { calls.push(`${v.name}: a tarefa não foi dada`); info = 'a tarefa não foi dada'; continue; }
    const t0 = S.clock; const legs = []; let leg = { st: t.st, t: S.clock }; let ended = null;
    const need0 = b.need.stone; const mine = []; // (the loads this task took to the site: [seconds since it began, how much])
    // (in the god's peace: past the 70 s, a fight of the world's own took her from the work, T-261)
    G.Politics.divinePeace();
    // (and the work hers alone: the case is one builder's task, and its loads are hers. In the metropole of the generation 11
    // the other builders of Roma, idle, took the work too — Tito, Agripina, Sexto, Quinto, Aurélia and Druso carried the
    // stone of four of the five loads before Décimo's second, and his task ended at 54,6 s with nothing more to carry, T-359.
    // The test's hand holds aside, idle and not thinking — as the m10 of carga-comum holds a child —, whoever else takes the
    // work, until the case is over: by the world's door, the load they counted on its way uncounted by its end)
    const aside = new Set();
    const holdAside = () => { for (const o of S.villagers.values()) if (o !== v && o.task && o.task.type === 'build' && o.task.id === b.id && !(S.avatar && S.avatar.id === o.id)) { G.Vg.endTask(o); G.Vg.setTask(o, { type: 'idle', pri: 0.2, wait: 1e9 }); o.think = 1e9; aside.add(o.id); } };
    for (let k = 0; k < 6000; k++) {
      const c = v.carry && v.carry.k === 'stone' ? v.carry.n : 0, st0 = t.st;
      M.viver(0.1); keep(); holdAside(); S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN);
      if (st0 === 2 && t.st !== 2 && c > 0 && !(v.carry && v.carry.n > 0)) mine.push([S.clock - t0, c]);
      // (how it ended: a leg past the 70 s — the age a task runs out at —, nothing more for it to do there, or a call of the
      // world: the errand that took its place)
      if (v.task !== t) { ended = { st: leg.st, age: r1(S.clock - t0), leg: r1(S.clock - leg.t), aged: t.age > 70, now: v.task ? v.task.type : 'nada' }; break; }
      if (t.st !== leg.st) { legs.push([leg.st, S.clock - leg.t]); leg = { st: t.st, t: S.clock }; }
      if (b.built) break;
    }
    for (const id of aside) { const o = S.villagers.get(id); if (!o) continue; if (o.task && o.task.type === 'idle' && o.task.wait > 1e8) G.Vg.endTask(o); o.think = 0; }
    legs.push([leg.st, S.clock - leg.t]);
    const total = S.clock - t0; const longest = Math.max(...legs.map(l => l[1]));
    const late = mine.filter(m => m[0] > 70);
    fine1 = !(ended && ended.aged) && late.length >= 1 && longest < 70 && total > 70 && !bad().length;
    const called = !fine1 && !!ended && !ended.aged && ended.now !== 'nada';
    info = `${set.name}: a obra de ínsula #${b.id} em ${b.x},${b.y}, a ${r1(site.d)} casas do armazém ${site.store.type}#${site.store.id}, faltando ${need0} de pedra (${loads} cargas); ${v.name} #${v.id} (${v.role || 'sem ofício'}) → a tarefa ${ended ? (ended.aged ? `MORREU aos ${ended.age} s, no meio de uma perna (o passo ${ended.st}, há ${ended.leg} s)` : ended.now === 'nada' ? `acabou aos ${ended.age} s sem mais o que levar` : `acabou aos ${ended.age} s, o mundo a chamou para ${ended.now}`) : `seguia aos ${r1(total)} s`}; ela levou ${mine.length} cargas (${mine.map(m => `${m[1]} aos ${Math.round(m[0])} s`).join(', ') || 'nenhuma'}), ${late.length} depois dos 70 s; ${legs.length} pernas, a mais longa ${r1(longest)} s; a obra ${b.built ? 'pronta' : `falta ${b.need.stone} de pedra`}${aside.size ? `; ${aside.size} da cidade que tomaram a obra postos de lado pela mão da prova` : ''}`;
    if (called) { calls.push(`${v.name} chamado(a) para ${ended.now} aos ${ended.age} s`); continue; }
    break;
  }
  if (calls.length) info += ` (antes, o mundo chamou: ${calls.join('; ')})`;
  ok('o1 a ida longe, depois do trabalho, chega com a carga', fine1, info);
}
// ---------------- o2: a leg that stalls still dies at 70 s (the test's hand holds the builder still on the way) — from the
// ready world again, in the morning; a builder the world calls away for a cause of its own (the water of the house, a war's
// muster, the night) is no answer: the next one is held, up to four
{
  fresh(); const set2 = S.settlements.get(set.id);
  let info = 'sem lugar para outra obra', fine2 = false; const tries = []; const used = new Set();
  for (let n = 0; n < 4 && !fine2; n++) {
    const pos = V.findSite(set2, 'house'); if (!pos || pos.demolish) break;
    const b = V.addBuilding('insula', pos[0], pos[1], set2.id, false);
    fill(b, 8);
    keep();
    const v = [...S.villagers.values()].filter(o => able(o) && !used.has(o.id)).sort((a, c) => (a.role === 'construtor' ? 0 : 1) - (c.role === 'construtor' ? 0 : 1) || a.id - c.id)[0];
    if (!v) { info = 'ninguém para construir'; break; } used.add(v.id);
    const t = give(v, b); if (!t) { tries.push(`${v.name}: a tarefa não foi dada`); continue; }
    let held = null, ended = null; const sp = v.speed;
    for (let k = 0; k < 2000; k++) {
      M.viver(0.1); keep();
      if (v.task !== t) { ended = { s: held === null ? -1 : r1(S.clock - held), aged: t.age > 70, st: t.st, now: v.task ? v.task.type : 'nada' }; break; }
      if (held === null && t.st === 1) { held = S.clock; v.speed = 0; } // (on the way to the store: held still)
    }
    v.speed = sp;
    if (held === null) { tries.push(`${v.name} nunca saiu para o armazém (${ended ? `a tarefa acabou no passo ${ended.st}, agora ${ended.now}` : 'em 200 s'})`); continue; }
    if (!ended) { tries.push(`${v.name} preso: a tarefa NÃO morreu em 200 s`); break; }
    if (!ended.aged) { tries.push(`${v.name} chamado para ${ended.now} ${ended.s} s depois de preso`); continue; }
    fine2 = ended.s >= 69 && ended.s <= 72;
    tries.push(`${v.name} preso no caminho do armazém: a tarefa morreu ${ended.s} s depois, nos 70 s da perna`);
  }
  if (tries.length) info = tries.join(' · ');
  ok('o2 a perna parada ainda morre nos 70 s', fine2, info);
}
const e = M.erros();
ok('limpo', M.limpo(), M.limpo() ? 'sem erro de módulo nem aviso no console' : `erros de módulo ${JSON.stringify(e.mod)}; console: ${e.console.slice(0, 3).join(' | ')}`);
console.log(fails.length ? `OBRA-LONGE: FALHOU (${fails.join(', ')})` : 'OBRA-LONGE: ok');
process.exit(fails.length ? 1 : 0);
