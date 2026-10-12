// RF1: the map of where one can walk to (W.reachIds / W.canWalk) against the real search, plus walls, gates and a change nobody announced
const S = G.S, W = G.W, N = G.N; const out = []; const fails = [];
const realCan = W.canWalk;
const truth = (sx, sy, tx, ty, adj) => { W.canWalk = () => true; try { return !!W.findPath(sx, sy, tx, ty, adj, N * N * 4); } finally { W.canWalk = realCan; } };
const shutGates = () => { let n = 0; for (let i = 0; i < N * N; i++) if (S.wall[i] === 4) n++; return n; };
// 1. random pairs: people's spots, doors, open land, water, the inside of buildings
const starts = [...S.villagers.values()].filter(v => !v.aboard && !v.ug).map(v => [v.x, v.y]);
const goals = [];
for (const b of S.buildings.values()) { goals.push([b.x + b.w / 2, b.y + b.h / 2]); const d = G.Vg.door && G.Vg.door(b); if (d) goals.push(d); }
for (let k = 0; k < 200; k++) goals.push([1 + Math.random() * (N - 2), 1 + Math.random() * (N - 2)]);
let pairs = 0, agree = 0, falseNo = 0, falseYes = 0; const gates = shutGates();
for (let k = 0; k < 500 && starts.length && goals.length; k++) {
  const s = starts[(Math.random() * starts.length) | 0], g = goals[(Math.random() * goals.length) | 0]; const adj = Math.random() < 0.6;
  const c = W.canWalk(s[0], s[1], g[0], g[1], adj), t = truth(s[0], s[1], g[0], g[1], adj); pairs++;
  if (c === t) agree++; else if (t && !c) { falseNo++; if (falseNo <= 3) fails.push(`diz que não chega mas chega: ${s.map(q => q.toFixed(1))} → ${g.map(q => q.toFixed(1))} adj ${adj}`); } else { falseYes++; if (!gates && falseYes <= 3) fails.push(`diz que chega mas não chega (sem portão fechado): ${s.map(q => q.toFixed(1))} → ${g.map(q => q.toFixed(1))} adj ${adj}`); }
}
out.push(`pares ${pairs}: concordam ${agree}, "não chega" errado ${falseNo}, "chega" a mais ${falseYes} (portões fechados no mapa: ${gates})`);
// 2. a ring of wall around an open spot: shut in, a shut gate (the map lets it through, the search does not), an open gate
let P = null;
for (let g = 0; g < 40000 && !P; g++) {
  const x = 6 + ((Math.random() * (N - 12)) | 0), y = 6 + ((Math.random() * (N - 12)) | 0); let ok = true;
  for (let dy = -4; dy <= 4 && ok; dy++) for (let dx = -4; dx <= 4 && ok; dx++) { const i = (y + dy) * N + x + dx; if (!W.walkable(i) || S.occ[i] || S.wall[i] || S.road[i]) ok = false; }
  if (ok) P = [x, y];
}
const far = (() => { const L = W.reachIds(); if (!P) return null; const r = L[P[1] * N + P[0]]; for (let g = 0; g < 40000; g++) { const x = (Math.random() * N) | 0, y = (Math.random() * N) | 0; if (Math.max(Math.abs(x - P[0]), Math.abs(y - P[1])) > 8 && L[y * N + x] === r) return [x, y]; } return null; })();
if (!P || !far) out.push('anel: sem lugar aberto para testar');
else {
  const ring = []; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === 3) ring.push((P[1] + dy) * N + P[0] + dx);
  const at = (x, y) => [x + 0.5, y + 0.5]; const [px, py] = at(P[0], P[1]), [fx, fy] = at(far[0], far[1]);
  const before = [W.canWalk(px, py, fx, fy, false), truth(px, py, fx, fy, false)];
  for (const i of ring) S.wall[i] = 1; W.touchWalk();
  const shut = [W.canWalk(px, py, fx, fy, false), truth(px, py, fx, fy, false), W.canWalk(px, py, fx, fy, true)];
  const gate = ring[1]; S.wall[gate] = 4; W.touchWalk();
  const shutGate = [W.canWalk(px, py, fx, fy, false), truth(px, py, fx, fy, false)];
  S.wall[gate] = 2; W.touchWalk();
  const openGate = [W.canWalk(px, py, fx, fy, false), truth(px, py, fx, fy, false)];
  out.push(`anel em ${P}: antes ${before} · murado ${shut} · portão fechado ${shutGate} · portão aberto ${openGate}`);
  if (!before[0] || !before[1]) fails.push('anel: antes do muro já não chegava');
  if (shut[0] || shut[1] || shut[2]) fails.push('anel: murado e ainda chega');
  if (!shutGate[0] || shutGate[1]) fails.push('anel: portão fechado deveria contar como passagem no mapa (e não na busca)');
  if (!openGate[0] || !openGate[1]) fails.push('anel: portão aberto e não passa');
  // 3. a change nobody announced: the checker must notice
  for (const i of ring) S.wall[i] = 0; W.touchWalk(); W.reachIds();
  for (const i of ring) S.wall[i] = 1;
  const stale = QA.check().filter(f => /mapa de alcance/.test(f.msg));
  W.touchWalk();
  const fresh = QA.check().filter(f => /mapa de alcance/.test(f.msg));
  out.push(`mudança sem aviso: verificador acusou ${stale.length} (${stale[0] ? stale[0].msg.slice(0, 80) : '-'}) · depois do aviso ${fresh.length}`);
  if (!stale.length) fails.push('verificador não percebeu o mapa desatualizado');
  if (fresh.length) fails.push('verificador acusa mapa desatualizado depois do aviso');
  // 4. a building put down in the one gap of the wall: the map follows without anyone calling it
  const bt = Object.keys(G.BDEF).filter(k => G.BDEF[k].blocks).sort((a, b) => G.BDEF[a].w * G.BDEF[a].h - G.BDEF[b].w * G.BDEF[b].h)[0];
  const gx = P[0] - 1, gy = P[1] - 3; S.wall[gy * N + gx] = 0; W.touchWalk();
  const gap = W.canWalk(px, py, fx, fy, false);
  const ver = S.walkVer; const b = G.Village.addBuilding(bt, gx, gy, [...S.settlements.keys()][0], true);
  const plugged = [W.canWalk(px, py, fx, fy, false), truth(px, py, fx, fy, false)];
  G.Village.removeBuilding(b);
  const unplugged = [W.canWalk(px, py, fx, fy, false), truth(px, py, fx, fy, false)];
  out.push(`prédio "${bt}" (${G.BDEF[bt].w}×${G.BDEF[bt].h}) na brecha: aberto ${gap} · tapado ${plugged} · tirado ${unplugged} · aviso ${S.walkVer > ver}`);
  if (!gap) fails.push('brecha: deveria passar');
  if (plugged[0] || plugged[1]) fails.push('prédio na brecha e o mapa ainda deixa passar');
  if (!unplugged[0] || !unplugged[1]) fails.push('prédio tirado e o mapa não reabriu');
  for (const i of ring) S.wall[i] = 0; W.touchWalk();
}
// 5. cost: searches to places one cannot walk to
const L = W.reachIds(); const lone = []; for (let g = 0; g < 60000 && lone.length < 60; g++) { const i = (Math.random() * N * N) | 0; if (L[i] < 0 || !starts.length) continue; const s = starts[(Math.random() * starts.length) | 0]; const si = W.idx(s[0], s[1]); if (L[si] >= 0 && L[si] !== L[i]) lone.push([s, [i % N + 0.5, ((i / N) | 0) + 0.5]]); }
let t0 = performance.now(); for (const [s, g] of lone) W.findPath(s[0], s[1], g[0], g[1], false, 3500); const tNew = performance.now() - t0;
W.canWalk = () => true; t0 = performance.now(); for (const [s, g] of lone) W.findPath(s[0], s[1], g[0], g[1], false, 3500); const tOld = performance.now() - t0; W.canWalk = realCan;
t0 = performance.now(); W.invalidateReach(); W.reachIds(); const tBuild = performance.now() - t0;
out.push(`${lone.length} buscas impossíveis: ${tNew.toFixed(1)} ms com o mapa, ${tOld.toFixed(1)} ms sem · refazer o mapa ${tBuild.toFixed(1)} ms · mapas refeitos até aqui ${W.reachBuilds}`);
return { fails, out };
