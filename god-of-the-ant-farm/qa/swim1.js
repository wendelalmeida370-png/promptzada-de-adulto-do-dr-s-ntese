// L-055: people dropped into open sea far from any shore (no land within 30 tiles): they must swim for a shore or drown, never float forever
const S = G.S, W = G.W, N = G.N; const out = [];
const spots = []; for (let g = 0; g < 20000 && spots.length < 6; g++) { const x = 2 + Math.random() * (N - 4), y = 2 + Math.random() * (N - 4); if (S.type[W.idx(x, y)] !== G.T.DEEP) continue; if (W.nearestLand(x, y, 30)) continue; spots.push([x, y]); }
const vs = [...S.villagers.values()].filter(v => v.age >= 8 && !v.aboard && !v.inside && !v.captive).slice(0, spots.length);
vs.forEach((v, k) => { G.Vg.endTask(v); v.path = null; v.x = spots[k][0]; v.y = spots[k][1]; v.energy = 100; });
const ids = vs.map(v => v.id); QA.run(0.3);
for (const id of ids) { const v = S.villagers.get(id); const d = S.dead.get(id); out.push(v ? `vivo em ${v.x.toFixed(0)},${v.y.toFixed(0)} ${G.T.DEEP === S.type[W.idx(v.x, v.y)] ? 'NO MAR FUNDO' : 'em terra/raso'} tarefa ${v.task ? v.task.type : '-'}` : d ? `morto (${d.cause || d.how || '?'})` : 'sumiu'); }
return { spots: spots.length, out };
