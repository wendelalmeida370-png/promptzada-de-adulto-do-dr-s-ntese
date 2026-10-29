// represa: node qa/represa.js [mundo] — a primeira represa dos castores é contada uma vez só na crônica, com ou sem save
// no meio (L-301). A marca «a primeira represa já foi contada» (S.damSeen) não ia no save: aberto o mundo, a próxima árvore
// roída para uma represa contava a primeira represa de novo, no mesmo dia e lugar — o verificador acusava a linha repetida.
// E a árvore de um castor (L-365): a marca na árvore ficava no toco que o lenhador deixava (e quando o castor morria) e na
// árvore que brotava dele — nenhum castor a pegava nunca mais —, não ia no save, e o roer já feito ia para a próxima árvore.
//  r1 um mundo pronto aberto com represa de pé: as árvores roídas depois não contam a primeira represa de novo
//  r2 um save e um load no meio, e mais árvores roídas: a crônica não ganha a linha
//  r3 o lenhador derruba a árvore que um castor escolheu e rói: o castor a larga, e o roer com ela; o toco que o deus faz
//     brotar é de qualquer castor
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
// (a tree is a beaver's while a beaver gnaws it — the game's own word since L-365; before it, a mark on the tree)
const taken = q => (G.Nests.gnawed ? G.Nests.gnawed(q.id) : !!q.gnaw);
const young = q => q.stage === 'grow' && q.size > 0.4 && !taken(q);
// (a young tree by a dam: the one standing there, or one the test plants — on dry ground, never in a ford, where nothing grows)
const youngAt = d => {
  const S = G.S; let t = G.Animals.treeNear(d.x, d.y, 5, young), made = false;
  for (let r = 1.5; r <= 4.5 && !t; r += 1) for (let k = 0; k < 8 && !t; k++) { const an = k / 8 * 6.283; const x = Math.floor(d.x + Math.cos(an) * r), y = Math.floor(d.y + Math.sin(an) * r); const i = G.W.idx(x, y); if (!G.W.dryXY(x + 0.5, y + 0.5) || S.road[i]) continue; let kind = G.Biome.pickTree(G.Biome.of(i)); if (!G.Biome.canGrow(kind, i)) kind = 'oak'; t = G.Nature.addTree(x + 0.5, y + 0.5, kind, 0.7); made = !!t; }
  return { t, made };
};
// (the beaver nearest a dam, and a young tree by that dam)
const plant = () => {
  const S = G.S; const bv = [...S.animals.values()].filter(a => a.kind === 'beaver' && !a.dead && !a.held).sort((p, q) => p.id - q.id);
  let best = null; for (const a of bv) for (const d of S.dams || []) { const dd = G.dist(a.x, a.y, d.x, d.y); if (!best || dd < best.dd) best = { a, d, dd }; }
  if (!best) return { why: 'nenhum castor perto de represa' };
  const { t, made } = youngAt(best.d); if (!t) return { why: 'nenhum chão para uma árvore na represa' };
  return { a: best.a, d: best.d, t, made };
};
// (the beavers fell only a growing tree, big enough, within five steps of their dam, and find their dam by wandering: in the
// metropole of 28/10 they had none at the open, and by the time they found one the woodcutters had taken the trees round it —
// the case had nothing to look at for ten minutes. The case is the chronicle, not the beavers' choice: a young tree by the dam
// nearest a beaver, and that beaver at it, gnawing, by the test's hand, T-187)
let fedId = 0, refed = 0;
const feed = () => {
  const p = plant(); if (p.why) return p.why; const { a, d, t, made } = p;
  a.dam = d.id; a.gnawTree = t.id; a.x = t.x + 0.4; a.y = t.y + 0.3; a.hx = a.x; a.hy = a.y; a.gnawT = 0; fedId = a.id;
  return `o castor #${a.id} na represa #${d.id}, roendo ${made ? 'uma árvore nova' : 'a árvore #' + t.id}`;
};
const fed0 = feed();
// (until the beavers fell one more tree for their dams, or ten minutes of the world. The woodcutters may fell the beaver's tree
// first — in the metropole of 28/10, at 18 s: the beaver fled, and no other tree stood by its dam for the ten minutes —: the
// test's hand gives it another, T-218)
const live = (n, sec) => { const g = gnawed(); for (let k = 0; k < sec * 10 && gnawed() < g + n; k++) { M.viver(0.1); const a = G.S.animals.get(fedId); if (k % 50 === 49 && gnawed() < g + n && !(a && !a.dead && a.gnawTree)) { feed(); refed++; } } return gnawed() - g; };
const again = () => { const n = refed; refed = 0; return n ? `; outra árvore dada ${n}× (o lenhador levou a da prova)` : ''; };
const a = live(1, 600);
ok('r1 aberto o mundo, a primeira represa não é contada de novo', dams > 0 && a > 0 && told() === t0, `${dams} represa(s) de pé ao abrir, contada(s) ${t0}× na crônica (${fed0}${again()}); ${a} árvore(s) roída(s) depois: ${told()}×`);
M.salvarCarregar(); const t1 = told(); const fed1 = feed();
const b = live(1, 600);
ok('r2 um save no meio: a crônica não ganha a linha', b > 0 && told() === t1, `${b} árvore(s) roída(s) depois do load (${fed1}${again()}): ${told()}× (antes do load ${t1}×)`);
// r3 — the woodcutter's axe on the tree a beaver chose and gnaws (the beaver at its dam with no tree chooses by itself, and the
// game holds its choice; the woodcutters of the town may take that tree first: then it chooses again)
{
  let a = null, t = null, why = '', tries = 0;
  while (tries++ < 4 && !t) {
    const p = plant(); if (p.why) { why = p.why; break; }
    a = p.a; a.dam = p.d.id; a.gnawTree = 0; a.gnawT = 0; a.x = p.t.x + 0.4; a.y = p.t.y + 0.3; a.hx = a.x; a.hy = a.y;
    for (let k = 0; k < 3000 && !a.gnawTree && !a.dead && G.S.animals.has(a.id); k++) { M.viver(0.1); if (k % 200 === 199) youngAt(p.d); }
    const c = a.gnawTree ? G.S.trees.get(a.gnawTree) : null;
    for (let k = 0; c && k < 600 && a.gnawTree === c.id && a.gnawT < 1; k++) M.viver(0.1);
    if (c && a.gnawTree === c.id && a.gnawT >= 1) t = c; else why = c ? `o castor #${a.id} largou a árvore #${c.id} antes do machado` : `o castor #${a.id} não escolheu árvore em 300 s`;
  }
  if (!t) ok('r3 o lenhador derruba a árvore do castor: ele a larga, e o toco que brota é de qualquer castor', false, why);
  else {
    const gT = a.gnawT; G.Nature.fellTree(t, 1);
    for (let k = 0; k < 50 && a.gnawTree === t.id; k++) M.viver(0.1);
    // (the log chopped down to the stump — the woodcutter's hand —, and the god's growth on it)
    t.stage = 'stump'; t.wood = 0; t.t = 0; G.Powers.growth(t.x, t.y);
    const free = t.stage === 'grow' && !taken(t);
    ok('r3 o lenhador derruba a árvore do castor: ele a larga, e o toco que brota é de qualquer castor', a.gnawTree !== t.id && !a.gnawT && free,
      `o castor #${a.id} roía a árvore #${t.id} (${gT.toFixed(1)} s de roer) quando o machado a derrubou: ${a.gnawTree === t.id ? 'AINDA a rói' : 'largou-a'}${a.gnawT ? `, com ${a.gnawT.toFixed(1)} s de roer levados para a próxima` : ''}; o toco brotou (${t.stage}, ${t.size.toFixed(2)}): ${free ? 'livre para qualquer castor' : 'AINDA tomada'}`);
  }
}
const nv = fresh(); const e = M.erros(); const mods = Object.keys(e.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
