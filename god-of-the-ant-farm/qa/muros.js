// muros: the gates of a city wall (L-140), in Node — the planner of walls (siege.js planWall) asked again in the ready worlds:
//   node qa/muros.js [mundo,mundo...]       (default: cidade, metropole, mega, mundial, anos100)
// (in the ready world anos100 the wall of Jelling, #23858, had its four gates on its north and east sides, none on the west, where
// it lies over the street to Mênfis's quay, nor on the south: the planner gave every side a gate, and then kept the four busiest
// of them all — the sides' own were dropped for a third gate on the busy side)
// The proofs:
//   1. every wall planned today, in every town of the ready worlds that could raise one, has a gate on each of its sides — or,
//      where the people of a side walk out only by its corner, the next side's gate a step away (within three tiles of every
//      street and worn path of it) —, never two side by side, at most four
//   2. the gates are where the people walk: a side crossed by a street or a worn path has its gate on one of them
//   3. the bad case of L-140, by rule in every world: the walls whose walked sides differ the most in traffic (the busiest
//      side's busiest tile against the quietest walked side's) — where the old planner, keeping the four busiest gates of
//      all, gave the busy side a third gate and the quiet side none — have a gate for their quietest walked side; and Jelling
//      (anos100), where it was found, on its west side, while that world still has it
//   4. a wall begun, saved and loaded halfway: the same tiles, the same gates; and then finished, its gates are gates on the map
//   4b. a gate of the plan over a wall that already stands (a neighbour's, raised first): the gate is cut in it (L-340)
//   6. a wall never runs inside another town's walls (L-342: Corinto's east wall planned inside Argos's, in the metropole of
//      28/10, shut a strip of 4 by 10 between the two with no gate of either — three houses of Argos, their people cut off):
//      6a every plan of the ready worlds keeps out of the boxes of the walls that stand or go up (counted, the plans whose box
//         reaches into one: where the rule bites)
//      6b a plan from before the fix in a save — a box into a corner of a walled town's, by hand as the old planner gave it —,
//         raised by the builders to the end: nothing of it inside the old wall, and the ground in there stays its town's
//      6c such a wall standing in an old save: the pocket is shut; loaded, the tiles inside come down and the pocket opens
//   7. no building of the town shut off by its own wall (L-344: Hedeby's forge in the mega of 28/10, on a strip between the water
//      and the west wall line, four gates and none there — its smith in failed searches all day):
//      7a every plan of the ready worlds, its tiles shut and its gates open, leaves every building of its town that is reached
//         today reached (counted, the plans that needed a gate of their own for it: w.ways, beyond the four)
//      7b Hedeby's forge, while the mega has it: opened from the save, a gate in the wall and the forge reached
//      7c a standing wall with every gate shut into wall, in a save (an old wall that shut the town's buildings outside off):
//         loaded, gates open in it, and every building reached before is reached again
//   5. the checker clean, no module error
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | muros ${name} | ${info}`); if (!c) fails.push(name); };
const WORLDS = (process.argv[2] || 'cidade,metropole,mega,mundial,anos100').split(',');
// (a plan made the way the world makes it, without keeping it: Siege.raiseWalls with the town's own wall record set aside)
const plan = s => { const S = G.S; const keep = S.walls; S.walls = keep.filter(w => w.set !== s.id); const id0 = S.nextId; const w = G.Siege.raiseWalls(s, null, false); S.walls = keep; S.nextId = id0; return w; };
const sideOf = (w, i) => { const N = G.N, [x0, y0, x1, y1] = w.box, x = i % N, y = (i / N) | 0; const out = []; if (x === x0) out.push('O'); if (x === x1) out.push('L'); if (y === y0) out.push('N'); if (y === y1) out.push('S'); return out; };
const dist = (i, j) => { const N = G.N; return Math.abs((i % N) - (j % N)) + Math.abs(((i / N) | 0) - ((j / N) | 0)); };
let plans = 0, bad1 = [], bad2 = [], worst = ''; const uneven = []; const bad6 = []; let reach6 = 0;
const cross = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
// (the buildings of a town reached today that the wall as planned — its tiles shut, its gates open — leaves out of reach; null
// when the town has no region to judge from)
const shutOff = (s, w) => {
  const S = G.S, N = G.N, W = G.W, n = N * N; const L = W.reachIds(true); const R = W.townRegion(s); if (R < 0) return null;
  const plan = new Set(w.tiles), gates = new Set(w.gates); const pass = i => W.ground(i) && (plan.has(i) ? gates.has(i) : W.wallOpen(S.wall[i]));
  let seed = -1; for (let r = 0; r <= 10 && seed < 0; r++) for (let dy = -r; dy <= r && seed < 0; dy++) for (let dx = -r; dx <= r && seed < 0; dx++) { const x = Math.floor(s.cx) + dx, y = Math.floor(s.cy) + dy; if (x >= 0 && y >= 0 && x < N && y < N && L[y * N + x] === R && pass(y * N + x)) seed = y * N + x; }
  if (seed < 0) return null;
  const seen = new Uint8Array(n); const st = [seed]; seen[seed] = 1;
  while (st.length) { const a = st.pop(); const x = a % N; for (const b of [x > 0 ? a - 1 : -1, x < N - 1 ? a + 1 : -1, a - N, a + N]) { if (b < 0 || b >= n || seen[b] || !pass(b)) continue; seen[b] = 1; st.push(b); } }
  // (a building is reached by the ground round its footprint: one tile beside it reached is enough)
  const ring = b => { const o = []; for (let x = b.x; x < b.x + b.w; x++) o.push([x, b.y - 1], [x, b.y + b.h]); for (let y = b.y; y < b.y + b.h; y++) o.push([b.x - 1, y], [b.x + b.w, y]); return o.filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < N).map(([x, y]) => y * N + x); };
  return [...S.buildings.values()].filter(b => b.set === s.id && b.built && b.type !== 'ruin').filter(b => { const r = ring(b); return r.some(i => L[i] === R) && !r.some(i => pass(i) && seen[i]); });
};
const bad7 = []; let ways7 = 0;
for (const k of WORLDS) {
  M.pronto(k); const S = G.S;
  for (const s of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    if (!G.Fac.get(s.fac)) continue;
    const w = plan(s); if (!w) continue; plans++;
    const name = `${k}: ${s.name} (#${s.id})`;
    // (6a: none of it inside another town's walls; and how often the box reaches into one)
    { const inner = w.tiles.filter(i => G.Siege.walledIn(i, w)); if (inner.length) bad6.push(`${name}: ${inner.length} casa(s) dentro do muro de outra cidade`);
      if (S.walls.some(o => o.set !== s.id && cross(o.box, w.box))) reach6++; }
    // (7a: every building of the town reached today stays reached with the wall — a town that has one planned as from nothing:
    // its own wall off the map for the plan, as the world plans only a town with none)
    { const own = G.Siege.wallOf(s.id); const keep = own ? own.tiles.filter(i => S.wall[i]).map(i => [i, S.wall[i]]) : []; for (const [i] of keep) S.wall[i] = 0; if (keep.length) G.W.touchWalk();
      try { const w0 = keep.length ? plan(s) : w; const cut = w0 && shutOff(s, w0); if (cut && cut.length) bad7.push(`${name}: ${cut.length} prédio(s) fechados (${cut.slice(0, 2).map(b => b.type + '#' + b.id).join(', ')})`); if (w0 && (w0.ways || []).length) ways7++; }
      finally { for (const [i, v] of keep) S.wall[i] = v; if (keep.length) G.W.touchWalk(); } }
    // 1. each side its gate (or one at its corner), none side by side, at most four
    const sides = {}; for (const i of w.tiles) for (const sd of sideOf(w, i)) (sides[sd] = sides[sd] || []).push(i);
    const walked = i => S.road[i] || S.wear[i] > 22;
    // (a side with no street nor path of its own, only light wear: served where its busiest tile — where its people walk out, the
    // planner's own measure — is a step from the next side's gate, as the planner keeps it; the old count asked every such side
    // its own gate, more than the rule: Óstia's east in the mundial of 28/10, its wear at the corner by the south gate, T-180)
    const busiest = sd => sides[sd].reduce((a, i) => (S.wear[i] > S.wear[a] ? i : a), sides[sd][0]);
    // (a side cut by another town's walls — its tiles inside them left out, L-342 —: its people walk out that way through the
    // other wall's gates, and the side is judged by what it keeps, its streets and worn paths)
    const cut = sd => { const [x0, y0, x1, y1] = w.box; const line = []; if (sd === 'O' || sd === 'L') for (let y = y0; y <= y1; y++) line.push(y * G.N + (sd === 'O' ? x0 : x1)); else for (let x = x0; x <= x1; x++) line.push((sd === 'N' ? y0 : y1) * G.N + x); return line.some(i => G.Siege.walledIn(i, w)); };
    const miss = Object.keys(sides).filter(sd => { if (w.gates.some(g => sideOf(w, g).includes(sd))) return false; const ways = sides[sd].filter(walked); if (!ways.length && cut(sd)) return false; if (!ways.length) { const b = busiest(sd); return !(S.wear[b] >= 3 && w.gates.some(g => dist(b, g) <= 3)); } return !ways.every(i => w.gates.some(g => dist(i, g) <= 3)); });
    // (the gates for a building the wall would shut off, w.ways — L-344 —, are beyond the four, and where that building needs them)
    const main = w.gates.filter(g => !(w.ways || []).includes(g));
    const close = main.some((g, a) => main.some((h, b) => a < b && dist(g, h) < 4));
    if (miss.length || close || main.length > 4) bad1.push(`${name}: lados sem portão ${miss.join('') || '-'}${close ? ', portões lado a lado' : ''}${main.length > 4 ? ', ' + main.length + ' portões' : ''}`);
    // 2. a side a street or a worn path crosses has its gate on one (where the people walk — the planner's own test)
    for (const sd of Object.keys(sides)) {
      const ways = sides[sd].filter(walked); if (!ways.length) continue;
      const g = w.gates.filter(q => sideOf(w, q).includes(sd)); if (g.length && !g.some(walked)) bad2.push(`${name}, lado ${sd}: ${ways.length} casa(s) de rua ou caminho, o portão fora deles`);
    }
    // (3: how unevenly its walked sides are used — the rank the planner itself gives a gate: the worn path, a street more)
    { const rank = i => S.wear[i] + (S.road[i] ? 40 : 0); const tops = Object.keys(sides).map(sd => ({ sd, top: Math.max(0, ...sides[sd].filter(walked).map(rank)), ways: sides[sd].filter(walked) })).filter(q => q.ways.length);
      if (tops.length >= 2) { tops.sort((a, b) => a.top - b.top); const q = tops[0]; const served = w.gates.some(g => sideOf(w, g).includes(q.sd)) || q.ways.every(i => w.gates.some(g => dist(i, g) <= 3));
        uneven.push({ name, ratio: tops[tops.length - 1].top / Math.max(1, q.top), side: q.sd, served, gates: w.gates.map(g => sideOf(w, g).join('')).join(' ') }); } }
    if (!worst && w.gates.length) worst = `${name}: ${w.tiles.length} casas de muro, ${w.gates.length} portões (${w.gates.map(g => sideOf(w, g).join('')).join(' ')})`;
  }
  if (k === 'anos100') {
    // 3b. Jelling planned again, while the world has it: a gate on the west side
    const je = [...S.settlements.values()].find(s => s.name === 'Jelling'); const w = je && plan(je);
    if (w) { const west = w.gates.filter(g => sideOf(w, g).includes('O')); ok('3b Jelling planejada de novo: um portão no lado oeste', west.length > 0, `caixa ${JSON.stringify(w.box)}; portões ${w.gates.map(g => `(${g % G.N},${(g / G.N) | 0})${sideOf(w, g).join('')}`).join(' ')}`); }
    else console.log('(3b: o mundo pronto anos100 não tem mais Jelling, onde o L-140 foi achado; o caso ruim vai pela regra, no 3)');
  }
}
ok('1 cada lado o seu portão, nunca lado a lado, no máximo quatro', plans > 20 && !bad1.length, `${plans} muros planejados em ${WORLDS.length} mundos; ${bad1.length} com falta: ${bad1.slice(0, 4).join(' · ') || 'nenhum'}${worst ? ' · ex.: ' + worst : ''}`);
ok('2 o portão do lado fica onde se anda (a rua ou o caminho gasto que o cruza)', !bad2.length, bad2.slice(0, 4).join(' · ') || `${plans} muros, nenhum lado com o portão fora de onde se anda`);
{ const top = uneven.sort((a, b) => b.ratio - a.ratio).slice(0, 5); const miss = top.filter(q => !q.served);
  ok('3 o caso ruim do L-140, pela regra: nos muros cujos lados andados mais diferem no movimento, o lado mais quieto tem o seu portão', top.length >= 3 && !miss.length,
    top.length < 3 ? `só ${top.length} muro(s) com dois lados andados: o caso precisa de outro mundo` : top.map(q => `${q.name}: lado ${q.side} ${q.served ? 'servido' : 'SEM portão'} (${q.ratio.toFixed(1)}×; portões ${q.gates})`).join(' · ')); }
ok('7a nenhum plano fecha um prédio da sua cidade', !bad7.length, `${plans} muros planejados; ${ways7} com portão a mais para um prédio que o muro fecharia; ${bad7.length ? bad7.slice(0, 4).join(' · ') : 'nenhum prédio fechado'}`);
ok('6a nenhum plano corre dentro do muro de outra cidade', !bad6.length, `${plans} muros planejados; ${reach6} com o retângulo entrando no de outro muro; ${bad6.length ? bad6.slice(0, 4).join(' · ') : 'nenhuma casa dentro'}`);
// 4. a wall begun, saved and loaded halfway; then finished
{
  M.pronto('anos100'); const S = G.S;
  const s = [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac)).sort((a, b) => a.id - b.id).find(q => plan(q));
  if (!s) ok('4 um muro começado, salvo e carregado no meio', false, 'nenhuma cidade sem muro que possa erguer um');
  else {
    const w0 = G.Siege.raiseWalls(s, null, false); const tiles = w0.tiles.join(','), gates = w0.gates.join(',');
    let n = 0; while (!G.Siege.wallOf(s.id).done && G.Siege.wallOf(s.id).built < w0.tiles.length / 2 && n++ < 4000) G.debug.step(0.5);
    const built = G.Siege.wallOf(s.id).built; M.salvarCarregar(); const w1 = G.Siege.wallOf(s.id);
    const same = !!w1 && w1.tiles.join(',') === tiles && w1.gates.join(',') === gates && w1.built === built;
    // (the tiles raised so far — those the builders passed: further on, another town's wall may stand on a tile of the plan,
    // and a gate there is cut when they get to it, L-340 —, on the map: a gate of the plan is a gate there, any other a wall)
    const up = w1 ? w1.tiles.slice(0, w1.built).filter(i => S.wall[i]) : []; const wrong = up.filter(i => (w1.gates.includes(i) ? !(S.wall[i] === 2 || S.wall[i] === 4) : S.wall[i] !== 1) && S.wall[i] !== 3);
    ok('4 um muro começado, salvo e carregado no meio: as mesmas casas e os mesmos portões, e no mapa o que o plano diz', built > 0 && same && !wrong.length, `${s.name}: ${w0.tiles.length} casas, ${w0.gates.length} portões; ${built} feitas antes do save${same ? '' : ' — mudou no load'}; no mapa ${up.length} de pé, ${wrong.length} fora do plano`);
  }
}
// 4b. a gate of the plan over a wall that already stands (L-340): a neighbour's wall raised first on one of the town's planned
//     gates — the builders cut the gate in it; and a wall raised at once, the same (they skipped any tile already walled, and
//     the street the gate was for stayed shut: Roma, anos100 of 28/10, under the plan of the town next door)
for (const instant of [false, true]) {
  M.pronto('cidade'); const S = G.S;
  const s = [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac)).sort((a, b) => a.id - b.id).find(q => plan(q));
  const name = `4b o portão do plano onde já há muro de pé: aberto nele (${instant ? 'o muro erguido de uma vez' : 'pelos construtores'})`;
  if (!s) { ok(name, false, 'nenhuma cidade sem muro que possa erguer um'); continue; }
  const g = plan(s).gates[0]; S.wall[g] = 1; S.wallFac[g] = 0; G.W.touchWalk();
  const w = G.Siege.raiseWalls(s, null, instant); const at = w.tiles.indexOf(g);
  // (the material the builders take, so they reach the gate)
  if (!instant) G.Depot.make('f:' + w.fac, w.mat === 'pedra' ? 'stone' : 'wood', 400, { code: 'teste', part: true });
  let n = 0; while (!instant && w.built <= at && !w.done && n++ < 6000) G.debug.step(0.5);
  ok(name, w.gates.includes(g) && (S.wall[g] === 2 || S.wall[g] === 4), `${s.name}: o portão (${g % G.N},${(g / G.N) | 0}) ${w.gates.includes(g) ? 'no plano' : 'FORA do plano de novo'}; os construtores passaram por ele: ${w.built > at}; no mapa ${S.wall[g] === 2 || S.wall[g] === 4 ? 'portão' : S.wall[g] === 1 ? 'MURO' : S.wall[g]}`);
}
// 6b, 6c. a wall from before L-342, by hand: a box into the corner of a standing wall, whose two runs there have no gate, and
//     of a town next to it without a wall
for (const old of [false, true]) {
  M.pronto('metropole'); const S = G.S, N = G.N, W = G.W, Sg = G.Siege;
  const nm = old ? '6c o muro de antes de pé num save velho: carregado, o que está dentro do outro muro cai e o bolsão abre' : '6b o plano de antes do conserto, erguido pelos construtores: nada dele dentro do outro muro, e o chão de lá continua da cidade';
  const standing = o => o.done && o.tiles.filter(i => S.wall[i] && S.wall[i] !== 3).length >= o.tiles.length * 0.8;
  const K = 6; let best = null; const L0 = W.reachIds(true);
  for (const a of S.walls.filter(standing).sort((p, q) => p.id - q.id)) {
    const s = S.settlements.get(a.set); if (!s || !G.Fac.get(s.fac)) continue; const R = W.townRegion(s); if (R < 0) continue;
    const [x0, y0, x1, y1] = a.box; if (x1 - x0 < K + 3 || y1 - y0 < K + 3) continue;
    for (const [cx, cy, sx, sy] of [[x1, y0, -1, 1], [x0, y0, 1, 1], [x1, y1, -1, -1], [x0, y1, 1, -1]]) {
      const pk = []; for (let dy = 1; dy < K; dy++) for (let dx = 1; dx < K; dx++) { const i = (cy + sy * dy) * N + cx + sx * dx; if (L0[i] === R) pk.push(i); }
      const gateNear = a.gates.some(g => { const gx = g % N, gy = (g / N) | 0; return (gy === cy && (gx - cx) * sx >= 0 && (gx - cx) * sx <= K) || (gx === cx && (gy - cy) * sy >= 0 && (gy - cy) * sy <= K); });
      const ox = cx - sx * (K + 2), oy = cy - sy * (K + 2); if (ox < 3 || oy < 3 || ox > N - 4 || oy > N - 4) continue;
      if (gateNear || pk.length < 6) continue;
      // (a corner the wall from before shuts: the old wall's two runs stand whole, and the plan's two sides inside it can be raised)
      const run = []; for (let d = 0; d <= K; d++) { run.push(cy * N + cx + sx * d); run.push((cy + sy * d) * N + cx); }
      const side = []; for (let d = 1; d <= K; d++) { side.push((cy + sy * d) * N + cx + sx * K); side.push((cy + sy * K) * N + cx + sx * d); }
      const can = i => S.type[i] >= G.T.SAND && S.wall[i] !== 3 && !S.wall[i] && !(S.occ[i] && S.buildings.get(S.occ[i]) && (S.buildings.get(S.occ[i]).blocks || S.buildings.get(S.occ[i]).type === 'praca'));
      if (!run.every(i => S.wall[i] === 1) || !side.every(can)) continue;
      if (!best || pk.length > best.pk.length) best = { a, s, cx, cy, sx, sy, pk };
    }
  }
  const b = best && [...S.settlements.values()].filter(q => q.id !== best.s.id && G.Fac.get(q.fac) && !Sg.wallOf(q.id)).sort((p, q) => G.dist2(p.cx, p.cy, best.cx, best.cy) - G.dist2(q.cx, q.cy, best.cx, best.cy) || p.id - q.id)[0];
  if (!best || !b) { ok(nm, false, !best ? 'nenhum muro de pé com um canto sem portão e chão da cidade dentro' : 'nenhuma cidade sem muro'); continue; }
  const { a, s, cx, cy, sx, sy, pk } = best; const f = G.Fac.get(b.fac);
  const bx = [cx + sx * K, cx - sx * (K + 2)].sort((p, q) => p - q), by = [cy + sy * K, cy - sy * (K + 2)].sort((p, q) => p - q);
  const box = [bx[0], by[0], bx[1], by[1]];
  // (the plan as the old planner made it: the box's ring on land, round what blocks; a gate in the middle of each side)
  const ring = []; for (let x = box[0]; x <= box[2]; x++) ring.push([x, box[1]]); for (let y = box[1] + 1; y <= box[3]; y++) ring.push([box[2], y]); for (let x = box[2] - 1; x >= box[0]; x--) ring.push([x, box[3]]); for (let y = box[3] - 1; y > box[1]; y--) ring.push([box[0], y]);
  const tiles = ring.map(([x, y]) => y * N + x).filter(i => S.type[i] >= G.T.SAND && S.wall[i] !== 3 && !(S.occ[i] && S.buildings.get(S.occ[i]) && (S.buildings.get(S.occ[i]).blocks || S.buildings.get(S.occ[i]).type === 'praca')));
  const mid = (x, y) => y * N + x; const gates = [mid((box[0] + box[2]) >> 1, box[1]), mid((box[0] + box[2]) >> 1, box[3]), mid(box[0], (box[1] + box[3]) >> 1), mid(box[2], (box[1] + box[3]) >> 1)].filter(i => tiles.includes(i));
  const w = { id: S.nextId++, set: b.id, fac: b.fac, mat: 'madeira', tiles, gates, built: 0, done: false, style: f.civ || 'classico', box };
  const inA = i => { const x = i % N, y = (i / N) | 0; return x > a.box[0] && x < a.box[2] && y > a.box[1] && y < a.box[3]; };
  const inner = tiles.filter(inA);
  const where = `o muro de ${b.name} em ${JSON.stringify(box)}, ${tiles.length} casas (${inner.length} dentro do muro de ${s.name}, ${JSON.stringify(a.box)}); o canto (${cx},${cy}) com ${pk.length} casas de chão de ${s.name}`;
  const open = () => { const R = W.townRegion(s), L = W.reachIds(true); return pk.filter(i => L[i] === R).length; };
  S.walls.push(w);
  if (!old) {
    G.Depot.make('f:' + b.fac, 'wood', 600, { code: 'teste', part: true });
    let n = 0; while (!w.done && n++ < 3000) G.debug.step(0.1);
    const up = tiles.filter(i => S.wall[i] && !inA(i) && !a.tiles.includes(i)).length, upIn = inner.filter(i => S.wall[i]).length; const o = open();
    ok(nm, w.done && up > 0 && !upIn && o === pk.length, `${where}: ${w.done ? 'pronto' : 'NÃO acabou'} em ${(n / 10).toFixed(0)} s; de pé fora ${up}, dentro ${upIn}; o chão do canto na cidade ${o} de ${pk.length}`);
  } else {
    // (raised as the game before the fix raised it: every tile, the gates open)
    for (const i of tiles) { if (S.wall[i] && !(gates.includes(i) && S.wall[i] === 1)) continue; S.wall[i] = gates.includes(i) ? 2 : 1; S.wallFac[i] = b.fac; S.wallHp[i] = 80; }
    w.built = tiles.length; w.done = true; W.touchWalk();
    const shut = pk.length - open(); M.salvarCarregar(); const w1 = Sg.wallOf(b.id);
    const left = inner.filter(i => G.S.wall[i]).length, still = tiles.filter(i => !inA(i) && G.S.wall[i]).length; const o = open();
    ok(nm, shut > 0 && !!w1 && !left && still > 0 && o === pk.length, `${where}: de pé, ${shut} casa(s) do canto fora da cidade (o bolsão); carregado, dentro ${left}, fora ${still} de pé; o chão do canto na cidade ${o} de ${pk.length}`);
  }
}
// 7b. Hedeby's forge, while the mega has it (found there: the forge #10435 on a strip between the water and the west wall)
{
  M.pronto('mega'); const S = G.S, W = G.W; const b = S.buildings.get(10435); const s = b && S.settlements.get(b.set);
  if (!b || b.type !== 'forja' || !s || s.name !== 'Hedeby' || !G.Siege.wallOf(s.id)) console.log('(7b: o mega pronto não tem mais a forja de Hedeby, onde o L-344 foi achado; o caso vai pela regra, no 7a e no 7c)');
  else { const w = G.Siege.wallOf(s.id); const L = W.reachIds(true), R = W.townRegion(s); const N = G.N; const around = []; for (let x = b.x - 1; x <= b.x + b.w; x++) for (let y = b.y - 1; y <= b.y + b.h; y++) if ((x < b.x || x >= b.x + b.w) !== (y < b.y || y >= b.y + b.h)) around.push(L[y * N + x]);
    ok('7b a forja de Hedeby (o mega), aberta do save: um portão no muro, e a forja ao alcance', around.includes(R) && (w.ways || []).length > 0, `em volta da forja as regiões ${[...new Set(around)].join(',')}, a cidade na ${R}; portões a mais ${(w.ways || []).map(g => `(${g % G.N},${(g / G.N) | 0})${S.wall[g]}`).join(' ') || 'nenhum'}`); }
}
// 7c. a standing wall with every gate shut into wall, in a save: loaded, the town's buildings reached again
for (const k of ['metropole', 'mega', 'cidade', 'anos100', 'mundial']) {
  M.pronto(k); const S = G.S, N = G.N, W = G.W;
  const around = (b, L) => { const o = []; for (let x = b.x - 1; x <= b.x + b.w; x++) for (let y = b.y - 1; y <= b.y + b.h; y++) if (x >= 0 && y >= 0 && x < N && y < N && (x < b.x || x >= b.x + b.w) !== (y < b.y || y >= b.y + b.h)) o.push(L[y * N + x]); return o; };
  const reachedNow = s => { const L = W.reachIds(true), R = W.townRegion(s); return [...G.S.buildings.values()].filter(b => b.set === s.id && b.built && b.type !== 'ruin' && around(b, L).includes(R)).map(b => b.id); };
  const outside = (w, b) => b.x + b.w <= w.box[0] || b.x > w.box[2] || b.y + b.h <= w.box[1] || b.y > w.box[3];
  // (a wall whose gates, shut into wall, shut buildings of its town off: walls with a gap — a square on the line, a breach —
  // shut nothing, and are passed by)
  let w = null, before = [], shut = 0;
  for (const q of S.walls.filter(q => q.done && S.settlements.has(q.set)).sort((p, q) => p.id - q.id)) {
    const s = S.settlements.get(q.set); const b0 = reachedNow(s); if (![...S.buildings.values()].some(b => b0.includes(b.id) && outside(q, b))) continue;
    const keep = q.gates.map(g => [g, S.wall[g], S.wallHp[g]]); for (const g of q.gates) { S.wall[g] = 1; S.wallHp[g] = 80; } W.touchWalk();
    const n = b0.filter(id => !reachedNow(s).includes(id)).length;
    if (n > 0) { w = q; before = b0; shut = n; w.gates = []; w.ways = []; break; }
    for (const [g, v, hp] of keep) { S.wall[g] = v; S.wallHp[g] = hp; } W.touchWalk();
  }
  if (!w) { if (k === 'mundial') ok('7c o muro de pé com todo portão fechado em muro, num save: carregado, os prédios da cidade ao alcance de novo', false, 'em nenhum mundo um muro de pé que, com os portões fechados em muro, feche um prédio da cidade'); continue; }
  {
    const s = S.settlements.get(w.set), sid = s.id, wid = w.id;
    M.salvarCarregar(); const S1 = G.S, s1 = S1.settlements.get(sid), w1 = S1.walls.find(q => q.id === wid);
    const L = W.reachIds(true), R = W.townRegion(s1); const back = before.filter(id => { const b = S1.buildings.get(id); return !b || around(b, L).includes(R); }).length;
    ok('7c o muro de pé com todo portão fechado em muro, num save: carregado, os prédios da cidade ao alcance de novo', shut > 0 && back === before.length && w1 && w1.gates.length > 0, `${k}: o muro de ${s.name} (#${wid}), sem portão: ${shut} de ${before.length} prédios da cidade fora de alcance; carregado, ${(w1 && w1.gates.length) || 0} portão(ões) abertos (${w1 ? w1.gates.map(g => `(${g % N},${(g / N) | 0})`).join(' ') : '-'}), ${back} de ${before.length} ao alcance`);
    break;
  }
}
// 5. the checker, the module errors
{ const bad = QA.check().filter(q => q.sev <= 2); const e = M.erros(); ok('5 verificador e erros de módulo', !bad.length && !Object.keys(e.mod).length, bad.length ? bad.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : `limpo; erros de módulo: ${JSON.stringify(e.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
