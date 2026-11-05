// perdidos: o cenário do L-217 — quem está dentro de um prédio está, para o mapa de alcance, na porta por onde sai (a das
// pessoas, G.Vg.door: a da planta, na rua), não no ponto do sul do prédio. Na virada do dia, quem não alcança a própria
// cidade a pé (village.js, strays) é tido por perdido; na virada seguinte, ainda perdido, é posto onde a cidade se alcança
// (o desatolar), ou feito hóspede de outra cidade, ou náufrago. Pelo ponto do sul, quem dormia numa casa cujo sul dava para
// outro chão era tido por perdido, acordado e tirado de casa. Cada caso provocado de propósito (o deus mura o sul de uma casa
// num bolsão de uma casa, a porta dela na rua — L-216):
//   1. quem dorme nessa casa: duas viradas do mundo, e ele não é tido por perdido — dorme lá dentro, e o mapa o vê na porta;
//   2. quem está no bolsão, fora (preso de verdade): perdido na primeira virada; um save no meio; na segunda, posto onde a
//      cidade se alcança, fora do bolsão;
//   3. o verificador limpo (o dos interiores, e o resto do mundo nos seus S0 a S2), nenhum erro de módulo.
//   node qa/perdidos.js [mundo]
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js'] }); const W = G.W, T = G.T;
const KEY = process.argv[2] || 'cidade';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | perdidos ${name} | ${info}`); if (!c) fails.push(name); };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const f2 = p => (p ? p.map(n => n.toFixed(2)).join(',') : '-');
const day = () => sim(() => G.Village.onNewDay()); // (the turn of the day of the villages: the lost among them, the doors)
M.pronto(KEY); G.Interiors.uncache();
const S = () => G.S, N = G.N; const at = (x, y) => y * N + x;
const size = p => { const L = W.reachIds(true); if (!p || !W.walkableXY(p[0], p[1])) return -1; const r = L[W.idx(p[0], p[1])]; let n = 0; for (let i = 0; i < L.length; i++) if (L[i] === r) n++; return n; };
// (a lot of one tile by the main town, in its streets: the lot and two rings round it ground one walks with nothing on it)
const town = G.Village.mainSettlement();
const free = (x, y) => { for (let ty = y - 2; ty <= y + 2; ty++) for (let tx = x - 2; tx <= x + 2; tx++) { if (!W.inb(tx, ty)) return false; const i = at(tx, ty); if (!W.walkable(i) || S().occ[i] || S().wall[i] || S().cliff[i] || S().treeAt[i] || S().objAt[i] || S().type[i] < T.SAND) return false; } return true; };
let lot = null;
if (town) { const tr = W.townRegion(town); const L = W.reachIds(true); let bd = 1e9;
  for (let y = 3; y < N - 3; y++) for (let x = 3; x < N - 3; x++) { const d = Math.hypot(x - town.cx, y - town.cy); if (d >= bd || L[at(x, y)] !== tr || !free(x, y)) continue; bd = d; lot = { x, y }; } }
if (!lot) { ok('o lote', false, `nenhum lote livre de uma casa nas ruas de ${town ? town.name : 'nenhuma cidade'} neste mundo`); process.exit(1); }
const { x, y } = lot; const walls = [at(x - 1, y + 1), at(x + 1, y + 1), at(x, y + 2)];
sim(() => { for (const i of walls) S().wall[i] = 1; W.touchWalk(); });
const b = sim(() => G.Village.addBuilding('house', x, y, town.id, true));
const door = sim(() => G.Vg.door(b)); const south = [x + 0.5, y + 1.5];
const ready = !!door && b.ip.s !== 'S' && size(door) > 100 && size(south) === 1;
ok('a casa', ready, `house#${b.id} em ${x},${y} (${town.name}): o sul num bolsão de ${size(south)} casa, a porta em ${b.ip.s}/${b.ip.o}, ${f2(door)}, num chão de ${size(door)} casas`);
// (two of the town, grown, free: one asleep in the house, one shut in the pocket outside)
const freeV = v => !v.jail && !v.aboard && !v.captive && !v.ug && !v.wrecked && !v.held && !v.air && v.age >= 16 && !v.inside && !(S().avatar && S().avatar.id === v.id) && !(G.Expe && G.Expe.memberOf(v.id));
const [v1, v2] = [...S().villagers.values()].filter(v => freeV(v) && v.set === town.id).slice(0, 2);
if (!ready || !v1 || !v2) { ok('o cenário', false, `sem a casa ou sem duas pessoas livres em ${town.name}`); process.exit(1); }
sim(() => {
  G.Vg.endTask(v1); v1.home = b.id; v1.x = x + 0.5; v1.y = y + 0.5; G.Vg.setTask(v1, { type: 'sleep', pri: 1.5, kind: 'sleep', st: 2 }); v1.inside = b.id; v1.sleeping = true; v1._stray = 0;
  G.Vg.endTask(v2); v2.x = south[0]; v2.y = south[1]; v2.path = null; v2._stray = 0;
});
// ---- 1. asleep in the house: where the map has him, and two turns of the day that do not take him for lost ----
{
  const L = W.reachIds(true); const rs = W.regsOf(v1); const dr = L[W.idx(door[0], door[1])], sr = L[W.idx(south[0], south[1])];
  ok('quem dorme está na porta', !!rs && rs.includes(dr) && !rs.includes(sr) && W.reachesTown(v1, town), `${v1.name}, dentro de house#${b.id}: o mapa o tem nas regiões ${JSON.stringify(rs)} — a da porta (${dr}) ${rs && rs.includes(dr) ? 'sim' : 'NÃO'}, a do bolsão do sul (${sr}) ${rs && rs.includes(sr) ? 'SIM' : 'não'}; alcança ${town.name}: ${W.reachesTown(v1, town) ? 'sim' : 'NÃO'}`);
  day(); const s1 = v1._stray; day();
  ok('duas viradas, e ele dorme em casa', !s1 && !v1._stray && v1.inside === b.id && v1.sleeping && v1.task && v1.task.type === 'sleep' && v1.set === town.id && !v1.wrecked && !v1.guestOf,
    `depois da primeira virada, ${s1 ? 'PERDIDO desde o dia ' + s1 : 'não perdido'}; depois da segunda, ${v1.inside === b.id ? 'dentro de casa' : 'FORA DE CASA, em ' + f2([v1.x, v1.y])}, ${v1.sleeping ? 'dormindo' : 'ACORDADO'} (${v1.task ? v1.task.type : 'sem tarefa'}), de ${S().settlements.get(v1.set) ? S().settlements.get(v1.set).name : '-'}${v1.guestOf ? ', HÓSPEDE' : ''}${v1.wrecked ? ', NÁUFRAGO' : ''}`);
}
// ---- 2. shut in the pocket outside: lost at the first turn, a save in the middle, set down where the town is reached ----
{
  sim(() => { v2._stray = 0; v2.x = south[0]; v2.y = south[1]; if (v2.task && v2.task.type !== 'idle') G.Vg.endTask(v2); });
  day(); const s1 = v2._stray; const id = v2.id;
  M.salvarCarregar(); G.Interiors.uncache(); const w2 = S().villagers.get(id); const kept = !!w2 && w2._stray === s1 && size([w2.x, w2.y]) === 1;
  day(); const t2 = w2 && S().settlements.get(w2.set);
  ok('quem está preso no bolsão é posto na rua', !!s1 && kept && !!w2 && !w2._stray && size([w2.x, w2.y]) > 100 && W.reachesTown(w2, t2) && w2.set === town.id,
    `${v2.name} no bolsão do sul: na primeira virada, ${s1 ? 'perdido desde o dia ' + s1 : 'NÃO TIDO POR PERDIDO'}; depois de salvar e carregar, ${kept ? 'ainda perdido, ainda no bolsão' : 'MUDOU: ' + (w2 ? `perdido ${w2._stray}, num chão de ${size([w2.x, w2.y])}` : 'SUMIU')}; na segunda, ${w2 ? `em ${f2([w2.x, w2.y])}, num chão de ${size([w2.x, w2.y])} casas, ${W.reachesTown(w2, t2) ? 'alcança' : 'NÃO ALCANÇA'} ${t2 ? t2.name : '-'}` : '-'}`);
}
// ---- 3. the checker and the errors ----
{
  const bad = QA.check().filter(q => q.sys === 'int' || q.sev <= 2);
  ok('verificador', !bad.length, bad.length ? bad.slice(0, 4).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'limpo');
  const er = M.erros(); ok('sem erros', M.limpo(), `módulos ${JSON.stringify(er.mod)}; console ${er.console.slice(0, 2).join(' | ') || 'limpo'}`);
}
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
