// obra-longe: a tarefa de obra conta os seus 70 s por perna (L-358) — o construtor que trabalhou e depois vai buscar
// material num armazém longe não morre no meio da ida, e a carga chega à obra. No mundo pronto «metrópole», na cidade
// cuja casa nova a cidade põe mais longe de um armazém: a mão da prova põe ali a obra de uma ínsula, faltando só pedra —
// cargas bastantes para a tarefa inteira passar muito dos 70 s, com cada perna bem abaixo deles —, e dá a tarefa a um
// adulto descansado, à porta da obra, de manhã e em paz. o1 a mesma tarefa leva carga atrás de carga (ida, volta com a
// pedra, trabalho, de novo) depois dos 70 s, nenhuma perna passa deles, e ela não morre no meio de uma perna (acaba quando
// não há mais o que levar — outros construtores da cidade também levam pedra a ela); o2 a perna parada — o construtor
// preso no caminho pela mão da prova, de manhã de novo, no mundo pronto de novo — ainda morre nos 70 s.
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
function builder(not) { return [...S.villagers.values()].filter(o => able(o) && o.id !== not).sort((a, c) => (a.role === 'construtor' ? 0 : 1) - (c.role === 'construtor' ? 0 : 1) || a.id - c.id)[0] || null; }
// (the people's stone kept by the god's hand while the case runs: the town's own works take from the same store, and a task
// with no stone left to fetch ends — the case is the leg, not the store)
// (the free stone, not the whole: in the metropole of the v37's last worlds Tenochtitlan's works had all of it reserved, and the
// builder had no stone to fetch — the task ended in a second, T-261)
const keep = () => { const fr = D.free(f, 'stone'); if (fr < 30) D.make(f, 'stone', 60 - fr, { code: 'teste', part: true }); };
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
let v1 = null;
{
  const per = 2 * site.d / 1.3 + 3; // (a load: there and back at a walk, and its share of the work)
  const loads = Math.max(3, Math.ceil(150 / per)); // (the whole task well past 70 s)
  const b = V.addBuilding('insula', site.pos[0], site.pos[1], set.id, false);
  b.need = { wood: 0, stone: loads * 4 }; b.incoming = { wood: 0, stone: 0 }; // (the test's hand: the wood in, only stone missing)
  keep();
  const v = builder(0); const t = v && give(v, b); v1 = v;
  let info = v ? '' : 'ninguém para construir', fine1 = false;
  if (t) {
    const t0 = S.clock; const legs = []; let leg = { st: t.st, t: S.clock }; let ended = null;
    const need0 = b.need.stone; const mine = []; // (the loads this task took to the site: [seconds since it began, how much])
    // (in the god's peace: past the 70 s, a fight of the world's own took her from the work, T-261)
    G.Politics.divinePeace();
    for (let k = 0; k < 6000; k++) {
      const c = v.carry && v.carry.k === 'stone' ? v.carry.n : 0, st0 = t.st;
      M.viver(0.1); keep(); S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN);
      if (st0 === 2 && t.st !== 2 && c > 0 && !(v.carry && v.carry.n > 0)) mine.push([S.clock - t0, c]);
      // (how it ended: a leg past the 70 s — the age a task runs out at —, or nothing more for it to do there)
      if (v.task !== t) { ended = { st: leg.st, age: r1(S.clock - t0), leg: r1(S.clock - leg.t), aged: t.age > 70, now: v.task ? v.task.type : 'nada' }; break; }
      if (t.st !== leg.st) { legs.push([leg.st, S.clock - leg.t]); leg = { st: t.st, t: S.clock }; }
      if (b.built) break;
    }
    legs.push([leg.st, S.clock - leg.t]);
    const total = S.clock - t0; const longest = Math.max(...legs.map(l => l[1]));
    const late = mine.filter(m => m[0] > 70);
    fine1 = !(ended && ended.aged) && late.length >= 1 && longest < 70 && total > 70 && !bad().length;
    info = `${set.name}: a obra de ínsula #${b.id} em ${b.x},${b.y}, a ${r1(site.d)} casas do armazém ${site.store.type}#${site.store.id}, faltando ${need0} de pedra (${loads} cargas); ${v.name} #${v.id} (${v.role || 'sem ofício'}) → a tarefa ${ended ? (ended.aged ? `MORREU aos ${ended.age} s, no meio de uma perna (o passo ${ended.st}, há ${ended.leg} s)` : `acabou aos ${ended.age} s sem mais o que levar (agora ${ended.now})`) : `seguia aos ${r1(total)} s`}; ela levou ${mine.length} cargas (${mine.map(m => `${m[1]} aos ${Math.round(m[0])} s`).join(', ') || 'nenhuma'}), ${late.length} depois dos 70 s; ${legs.length} pernas, a mais longa ${r1(longest)} s; a obra ${b.built ? 'pronta' : `falta ${b.need.stone} de pedra`}`;
  }
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
    b.need = { wood: 0, stone: 8 }; b.incoming = { wood: 0, stone: 0 };
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
