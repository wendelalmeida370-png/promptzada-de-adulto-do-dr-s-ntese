// calcada: node qa/calcada.js [mundo] — quem calça uma rua só escolhe o trecho que alcança a pé (L-322).
// O calceteiro (city.js, pickPave) escolhia o trecho pelo plano das ruas e pela distância, sem perguntar ao mapa de regiões:
// numa cidade de arquipélago, a rua da outra ilha; o caminho falhava, a tarefa acabava, e a escolha seguinte era o mesmo
// trecho — a cada 12 s uma busca inteira que falha (o S3 da vida 107 da regressão de 28/10: «Cássio #435: 9 caminhos
// falhos seguidos»; no ano 9 foram 23). Aqui um construtor da maior cidade é posto numa ilhota (chão pisável de onde não se
// chega à cidade):
//  c1 na ilhota, a tarefa de calçar não lhe dá trecho que ele não alcança
//  c2 um minuto do mundo na ilhota: nenhuma busca de calçada falha
//  c3 de volta à cidade, ele calça: um trecho que ele alcança
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | calcada ${name} | ${info}`); if (!c) fails.push(name); };
const S = M.pronto(process.argv[2] || 'metropole'); const W = G.W; const N = G.N;
const set = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id)[0];
const v = [...S.villagers.values()].sort((a, b) => a.id - b.id).find(p => p.set === set.id && p.age >= 18 && p.age < 50 && !p.aboard && !p.captive && !p.inside && p.role === 'construtor')
  || [...S.villagers.values()].sort((a, b) => a.id - b.id).find(p => p.set === set.id && p.age >= 18 && p.age < 50 && !p.aboard && !p.captive && !p.inside);
// (the islet: walkable ground from which the town is not reached — the one nearest the town, so the town's streets are near)
let islet = null, bd = 1e9;
for (let i = 0; i < N * N; i++) { if (!W.walkable(i)) continue; const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; if (W.reachesTownXY(x, y, set)) continue; const d = G.dist(x, y, set.cx, set.cy); if (d < bd) { bd = d; islet = [x, y]; } }
const H = G.Vg.H; const tileOf = i => [(i % N) + 0.5, ((i / N) | 0) + 0.5];
const place = (x, y) => { G.Vg.endTask(v); v.x = x; v.y = y; v.path = null; v._pfN = 0; v._pfI = -1; v._paveCD = 0; };
if (!v || !islet) ok('c1 na ilhota, nenhum trecho que ele não alcança', false, !v ? 'a cidade não tem adulto livre' : 'o mundo não tem ilhota perto da cidade');
else {
  // c1 — the choice itself
  place(islet[0], islet[1]);
  G.City.paveTask(v, H); const t = v.task;
  const far = t && t.type === 'pave' && !W.reaches(v, ...tileOf(t.i));
  ok('c1 na ilhota, nenhum trecho que ele não alcança', !far, `${v.name} (${v.role}) numa ilhota a ${bd.toFixed(1)} casas de ${set.name}: ${t && t.type === 'pave' ? `trecho ${tileOf(t.i).map(n => n.toFixed(1)).join(',')} — ${far ? 'que ele NÃO alcança' : 'que ele alcança'}` : 'nenhum trecho (nada a calçar daqui)'}`);
  if (t && t.type === 'pave') G.City.claims.delete(t.i);
  // c2 — a minute of the world there: the failed searches of paving (the world gives him what it gives; pave is watched)
  place(islet[0], islet[1]);
  const og = G.Vg.goto; let failed = 0, tries = 0;
  G.Vg.goto = function (p, x, y) { const pave = p === v && p.task && p.task.type === 'pave'; const r = og.apply(this, arguments); if (pave) { tries++; if (!r) failed++; } return r; };
  try { for (let k = 0; k < 600; k++) { if (v.task && v.task.type !== 'pave') G.Vg.endTask(v); if (!v.task) G.City.paveTask(v, H); G.debug.step(0.1); if (!S.villagers.has(v.id)) break; v.x = islet[0]; v.y = islet[1]; } } finally { G.Vg.goto = og; }
  ok('c2 um minuto na ilhota: nenhuma busca de calçada falha', failed === 0, `${tries} buscas de calçada, ${failed} falharam; caminhos falhos seguidos ${v._pfN || 0}`);
  // c3 — back in the town
  place(set.cx, set.cy); const reg = W.reachesTownXY(v.x, v.y, set);
  G.City.paveTask(v, H); const t3 = v.task;
  const good = t3 && t3.type === 'pave' && W.reaches(v, ...tileOf(t3.i));
  ok('c3 de volta à cidade, calça um trecho que alcança', reg && good, `no centro de ${set.name} (a cidade alcançada: ${reg}): ${t3 && t3.type === 'pave' ? `trecho ${tileOf(t3.i).map(n => n.toFixed(1)).join(',')} — ${good ? 'ele alcança' : 'ele NÃO alcança'}` : 'nenhum trecho'}`);
}
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
