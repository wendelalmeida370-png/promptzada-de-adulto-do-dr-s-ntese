// represa: node qa/represa.js [mundo] — a primeira represa dos castores é contada uma vez só na crônica, com ou sem save
// no meio (L-301). A marca «a primeira represa já foi contada» (S.damSeen) não ia no save: aberto o mundo, a próxima árvore
// roída para uma represa contava a primeira represa de novo, no mesmo dia e lugar — o verificador acusava a linha repetida.
//  r1 um mundo pronto aberto com represa de pé: as árvores roídas depois não contam a primeira represa de novo
//  r2 um save e um load no meio, e mais árvores roídas: a crônica não ganha a linha
//  e o verificador limpo (S0–S3 novos), sem erro de módulo
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const KEY = process.argv[2] || 'metropole';
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | represa ${name} | ${info}`); if (!c) fails.push(name); };
const LINE = /Os castores derrubaram as árvores da margem/;
const told = () => G.S.history.filter(h => LINE.test(h.txt)).length;
const gnawed = () => (G.S.dams || []).reduce((a, d) => a + (d.trees || 0), 0);
M.pronto(KEY);
const base = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
const fresh = () => QA.check().filter(q => q.sev <= 3 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const t0 = told(), g0 = gnawed(), dams = (G.S.dams || []).filter(d => d.trees > 0).length;
// (the beavers fell only a growing tree, big enough, within five steps of their dam, and find their dam by wandering: in the
// metropole of 28/10 they had none at the open, and by the time they found one the woodcutters had taken the trees round it —
// the case had nothing to look at for ten minutes. The case is the chronicle, not the beavers' choice: a young tree by the dam
// nearest a beaver, and that beaver at it, gnawing, by the test's hand, T-187)
const feed = () => {
  const S = G.S; const ok2 = q => q.stage === 'grow' && q.size > 0.4 && !q.gnaw;
  const bv = [...S.animals.values()].filter(a => a.kind === 'beaver' && !a.dead && !a.held).sort((p, q) => p.id - q.id);
  let best = null; for (const a of bv) for (const d of S.dams || []) { const dd = G.dist(a.x, a.y, d.x, d.y); if (!best || dd < best.dd) best = { a, d, dd }; }
  if (!best) return 'nenhum castor perto de represa';
  const { a, d } = best; let t = G.Animals.treeNear(d.x, d.y, 5, ok2), made = false;
  for (let r = 1.5; r <= 4.5 && !t; r += 1) for (let k = 0; k < 8 && !t; k++) { const an = k / 8 * 6.283; const x = Math.floor(d.x + Math.cos(an) * r), y = Math.floor(d.y + Math.sin(an) * r); const i = G.W.idx(x, y); if (!G.W.walkable(i) || S.road[i]) continue; let kind = G.Biome.pickTree(G.Biome.of(i)); if (!G.Biome.canGrow(kind, i)) kind = 'oak'; t = G.Nature.addTree(x + 0.5, y + 0.5, kind, 0.7); made = !!t; }
  if (!t) return 'nenhum chão para uma árvore na represa';
  a.dam = d.id; a.gnawTree = t.id; t.gnaw = a.id; a.x = t.x + 0.4; a.y = t.y + 0.3; a.hx = a.x; a.hy = a.y; a.gnawT = 0;
  return `o castor #${a.id} na represa #${d.id}, roendo ${made ? 'uma árvore nova' : 'a árvore #' + t.id}`;
};
const fed0 = feed();
// (until the beavers fell two more trees for their dams, or ten minutes of the world)
const live = (n, sec) => { const g = gnawed(); for (let k = 0; k < sec * 10 && gnawed() < g + n; k++) M.viver(0.1); return gnawed() - g; };
const a = live(1, 600);
ok('r1 aberto o mundo, a primeira represa não é contada de novo', dams > 0 && a > 0 && told() === t0, `${dams} represa(s) de pé ao abrir, contada(s) ${t0}× na crônica (${fed0}); ${a} árvore(s) roída(s) depois: ${told()}×`);
M.salvarCarregar(); const t1 = told(); const fed1 = feed();
const b = live(1, 600);
ok('r2 um save no meio: a crônica não ganha a linha', b > 0 && told() === t1, `${b} árvore(s) roída(s) depois do load (${fed1}): ${told()}× (antes do load ${t1}×)`);
const nv = fresh(); const e = M.erros(); const mods = Object.keys(e.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
