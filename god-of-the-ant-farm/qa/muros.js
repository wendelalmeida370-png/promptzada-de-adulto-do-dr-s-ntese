// muros: the gates of a city wall (L-140), in Node — the planner of walls (siege.js planWall) asked again in the ready worlds:
//   node qa/muros.js [mundo,mundo...]       (default: cidade, metropole, mega, mundial, anos100)
// (in the ready world anos100 the wall of Jelling, #23858, had its four gates on its north and east sides, none on the west, where
// it lies over the street to Mênfis's quay, nor on the south: the planner gave every side a gate, and then kept the four busiest
// of them all — the sides' own were dropped for a third gate on the busy side)
// The proofs:
//   1. every wall planned today, in every town of the ready worlds that could raise one, has a gate on each of its sides — or,
//      where the people of a side walk out only by its corner, the next side's gate a step away (within three tiles of every
//      street and worn path of it) —, never two side by side, at most four
//   1b. none of a wall planned on the lot of an open ground with a plan, the square or the fair (L-466: walls stood on the fairs —
//      the edge of the feira#12801 of the metrópole of the generation 11 a strip of wall where its plan's floor ended)
//   2. the gates are where the people walk: a side crossed by a street or a worn path has its gate on one of them
//   3. the bad case of L-140, by rule in every world: the walls whose walked sides differ the most in traffic (the busiest
//      side's busiest tile against the quietest walked side's) — where the old planner, keeping the four busiest gates of
//      all, gave the busy side a third gate and the quiet side none — have a gate for their quietest walked side; and Jelling
//      (anos100), where it was found, on its west side, while that world still has it
//   12. a gate lets one through, and the wall crosses the ford (L-491, L-658, L-689):
//      12a every gate of every plan of the ready worlds (the gates cut for a pocket apart) has open ground on each side of the
//          line where it runs straight — no building glued to a side, no corner, no water or rock beside it
//      12b no ford on the line of a plan left out of it: the shallow water the feet walk and the bridge are the wall's too
//      12c the bad case on purpose: a house glued to one side of the tile where the plan has its gate — the gate goes to another
//          tile; raised at once, the checker sees no gate of it that lets nobody through
//      12d another town's house in a pocket the line would shut: planned with it there, a way of the wall opens the pocket;
//          finished beside the standing wall, the way is cut at once; and in an old save (the wall whole, the pocket shut),
//          the load opens it
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
//         today reached (counted, the plans that needed a gate of their own for it: w.ways, beyond the four) — also one whose
//         only way runs along the line, the gate in two tiles (L-604: Tebas's storehouse on a ledge south of its wall planned in
//         the metrópole of the generation 15, a tower inside the line where a gate of one tile would lead)
//      7b Hedeby's forge, while the mega has it: opened from the save, a gate in the wall and the forge reached
//      7c a standing wall with every gate shut into wall, in a save (an old wall that shut the town's buildings outside off):
//         loaded, gates open in it, and every building reached before is reached again
//   8. no blocking building in the way of a gate (L-348: two houses, one on each side of a gate of Tenochtitlan's wall, in the
//      metropole of 28/10, left it a tile of nowhere): a gate put beside the town's best site for a house turns the site finder
//      elsewhere, and the site it gives has no tile beside a gate
//   8b. the site finder gives only sites whose work the town's streets reach (L-465: a pocket of one tile between Mênfis's wall
//      and the sea was its best site for a house): in every town of the worlds, for the kinds a town builds most
//   9. a building that comes in the only way of another behind a standing wall (L-382: a block of Hedeby, in the mega of the
//      v37's last worlds, raised on the strip between the rock and the wall that led to the town's cemetery, shut the cemetery
//      off; the wall's gates had been judged at its plan and at the load only): a well put by the world's own door where it
//      leaves the wall shutting a building of the town off — the wall cuts a gate at once, before any step; and saved and
//      loaded, the gate is there
//   9b. the walls' shortcut (Siege.apart: a building that touches nothing, the open ground round it one piece without it, shuts
//      nothing — the walls are not judged again for it): at every tile tried for 9, where the shortcut says so, the whole count
//      (openWays, the tile taken) agrees
//   10. no gate where the way across the wall line is shut by a blocking building on each side (L-603: Óstia's gate at
//      (106,123) in the mundial remade after the generation 15, between the old tavern and the baths; Hedeby's at (35,67) in
//      the mega of the generation 15, between the weaving shop and a sobrado — both there before the wall was planned):
//      10a every plan of the ready worlds, by the checker's own rule (qa.js) read on the plan's tiles
//      10b the bad case on purpose: a house on each side of a street tile of the line where a plan has its gate — planned
//          again, the same line, the gate on another tile of that side; raised at once, the checker sees no gate of it shut
//   11. no wall over a fenced ground — a pen, a stable, a captives' pen, a graveyard: its fence is the wall there —, and no beast
//      left inside a new wall (L-606: the planner laid walls across them — Mênfis's over a pen of Birka in the metrópole of the
//      generation 15, and in every ready world after —, and a beast on a tile where the wall rose stayed inside it for good):
//      11a every plan of the ready worlds keeps off the fenced grounds
//      11b the bad case on purpose: a pen on the line of a town's wall and a cow of it held on another tile of the line — raised
//          by the builders (the plan made before the pen) and at once (with the pen there): no wall stands on the pen, and the
//          cow is set down beside the wall, where it can stand and from where it reaches its pen
//      11c a wall of before standing on a fenced ground, in a save: the checker sees it; loaded, it comes down there, and the
//          rest of the wall stands
//   13. no wall before another town's gate (L-806: a wall laid against an older town's wall put a tile of its line before the
//      older gate and shut it from outside — Hedeby's east gate behind Delfos's west wall in the mega of the generation 25,
//      Tenochtitlan's north gate behind Birka's in its metrópole, Mênfis's behind its neighbour's in the anos500 and anos1000):
//      13a every plan of the ready worlds — every town, with its own wall record set aside — keeps off the tile before another
//          town's gate, standing or planned
//      13b the bad case on purpose: a gate of another town's wall put by hand before a straight run of a plan's line — planned
//          again, that tile left open and the rest of the line the same; raised at once, the other gate lets through
//      13c the other town's gate comes after the plan: the builders raise the wall tile by tile, and leave that tile open
//      13d a plan of before L-806 raised whole in a save, the tile before the other gate walled: the checker sees the gate shut;
//          loaded, the tile comes down and the gate lets through
//   5. the checker clean, no module error
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | muros ${name} | ${info}`); if (!c) fails.push(name); };
const WORLDS = (process.argv[2] || 'cidade,metropole,mega,mundial,anos100').split(',');
// (a plan made the way the world makes it, without keeping it: Siege.raiseWalls with the town's own wall record set aside)
const plan = s => { const S = G.S; const keep = S.walls; S.walls = keep.filter(w => w.set !== s.id); const id0 = S.nextId; const w = G.Siege.raiseWalls(s, null, false); S.walls = keep; S.nextId = id0; return w; };
const sideOf = (w, i) => { const N = G.N, [x0, y0, x1, y1] = w.box, x = i % N, y = (i / N) | 0; const out = []; if (x === x0) out.push('O'); if (x === x1) out.push('L'); if (y === y0) out.push('N'); if (y === y1) out.push('S'); return out; };
const dist = (i, j) => { const N = G.N; return Math.abs((i % N) - (j % N)) + Math.abs(((i / N) | 0) - ((j / N) | 0)); };
let plans = 0, bad1 = [], bad2 = [], worst = ''; const uneven = []; const bad6 = []; let reach6 = 0; const bad1b = []; let near1b = 0;
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
// (a gate whose way across the line is shut by a blocking building on each side — the checker's rule, qa.js, with the plan's
// tiles and the walls that stand for the line: L-603)
const shutGate = (w, i) => {
  const S = G.S, N = G.N; const on = new Set(w.tiles); const wl = j => on.has(j) || S.wall[j] === 1 || S.wall[j] === 2 || S.wall[j] === 4;
  const blk = j => { const o = S.occ[j]; const b = o && S.buildings.get(o); return !!(b && b.blocks); };
  const x = i % N, y = (i / N) | 0; if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1) return false;
  const ew = wl(i - 1) && wl(i + 1), ns = wl(i - N) && wl(i + N); const a = ew ? [i - N, i + N] : ns ? [i - 1, i + 1] : null;
  return !!a && blk(a[0]) && blk(a[1]);
};
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (where a gate of a plan lets one through — the rule read again here, apart from the game's: open ground on each side of the
// line where it runs straight, never a corner, L-491)
const opensGate = (w, i) => {
  const S = G.S, N = G.N, W = G.W; const on = new Set(w.tiles); const ln = j => on.has(j) || S.wall[j] === 1 || S.wall[j] === 2 || S.wall[j] === 4;
  const x = i % N, y = (i / N) | 0; if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1) return false;
  const ew = ln(i - 1) || ln(i + 1), ns = ln(i - N) || ln(i + N); if (ew && ns) return false; const fr = j => W.ground(j) && !ln(j);
  return ew ? fr(i - N) && fr(i + N) : ns ? fr(i - 1) && fr(i + 1) : (fr(i - N) && fr(i + N)) || (fr(i - 1) && fr(i + 1));
};
const bad12 = [], bad12b = []; let fords12 = 0;
const bad7 = []; let ways7 = 0; const bad10 = [];
// (the fenced grounds, as the world fences them — world.js: an animal crosses their fence only at the gate)
const FEN = { curral: 1, estabulo: 1, cercado: 1, cemetery: 1 }; const bad11 = [];
for (const k of WORLDS) {
  M.pronto(k); const S = G.S;
  for (const s of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    if (!G.Fac.get(s.fac)) continue;
    const w = plan(s); if (!w) continue; plans++;
    const name = `${k}: ${s.name} (#${s.id})`;
    // (6a: none of it inside another town's walls; and how often the box reaches into one)
    { const inner = w.tiles.filter(i => G.Siege.walledIn(i, w)); if (inner.length) bad6.push(`${name}: ${inner.length} casa(s) dentro do muro de outra cidade`);
      if (S.walls.some(o => o.set !== s.id && cross(o.box, w.box))) reach6++; }
    // (1b: none of it on the lot of an open ground with a plan — the square, the fair: the world walks across it, its plan has
    // its floor there —, L-466; and how many plans have one on the line of their box, where the wall goes round)
    { const open = i => { const o = S.occ[i]; const b = o && S.buildings.get(o); return !!b && !G.BDEF[b.type].blocks && !!G.Interiors.TYPES[b.type]; };
      const onOpen = w.tiles.filter(open);
      if (onOpen.length) bad1b.push(`${name}: ${onOpen.length} casa(s) no lote de ${[...new Set(onOpen.map(i => { const b = S.buildings.get(S.occ[i]); return b.type + '#' + b.id; }))].join(', ')}`);
      const [bx0, by0, bx1, by1] = w.box; let line = false;
      for (let x = bx0; x <= bx1 && !line; x++) line = open(by0 * G.N + x) || open(by1 * G.N + x);
      for (let y = by0; y <= by1 && !line; y++) line = open(y * G.N + bx0) || open(y * G.N + bx1);
      if (line) near1b++; }
    // (7a: every building of the town reached today stays reached with the wall — a town that has one planned as from nothing:
    // its own wall off the map for the plan, as the world plans only a town with none)
    { const own = G.Siege.wallOf(s.id); const keep = own ? own.tiles.filter(i => S.wall[i]).map(i => [i, S.wall[i]]) : []; for (const [i] of keep) S.wall[i] = 0; if (keep.length) G.W.touchWalk();
      try { const w0 = keep.length ? plan(s) : w; const cut = w0 && shutOff(s, w0); if (cut && cut.length) bad7.push(`${name}: ${cut.length} prédio(s) fechados (${cut.slice(0, 2).map(b => b.type + '#' + b.id).join(', ')})`); if (w0 && (w0.ways || []).length) ways7++; }
      finally { for (const [i, v] of keep) S.wall[i] = v; if (keep.length) G.W.touchWalk(); } }
    // (12a: every gate of the plan lets one through; 12b: no ford of its line left out of it, and how many plans cross one)
    { const main = w.gates.filter(g => !(w.ways || []).includes(g)); const dead = main.filter(g => !opensGate(w, g)); if (dead.length) bad12.push(`${name}: ${dead.map(g => `(${g % G.N},${(g / G.N) | 0})`).join(' ')}`);
      const [bx0, by0, bx1, by1] = w.box; const on = new Set(w.tiles); const per = []; for (let x = bx0; x <= bx1; x++) per.push(by0 * G.N + x, by1 * G.N + x); for (let y = by0 + 1; y < by1; y++) per.push(y * G.N + bx0, y * G.N + bx1);
      const ford = i => S.type[i] === G.T.RIVER && (!S.deep[i] || S.road[i]); const out = per.filter(i => ford(i) && !on.has(i) && S.wall[i] !== 3 && !S.occ[i] && !G.Siege.walledIn(i, w));
      if (out.length) bad12b.push(`${name}: ${out.length} casa(s) de vau fora da linha`); if (w.tiles.some(ford)) fords12++; }
    // (10a: no gate of the plan between two blocking buildings across its line, L-603)
    { const shut = w.gates.filter(g => shutGate(w, g)); if (shut.length) bad10.push(`${name}: ${shut.map(g => `(${g % G.N},${(g / G.N) | 0})`).join(' ')}`); }
    // (11a: none of it on a fenced ground — its fence is the wall there, as the square's lot is ground the wall goes round —, L-606)
    { const fen = i => { const o = S.occ[i]; const b = o && S.buildings.get(o); return !!b && !!FEN[b.type]; }; const onF = w.tiles.filter(fen);
      if (onF.length) bad11.push(`${name}: ${onF.length} casa(s) no chão cercado de ${[...new Set(onF.map(i => { const b = S.buildings.get(S.occ[i]); return b.type + '#' + b.id; }))].join(', ')}`); }
    // 1. each side its gate (or one at its corner), none side by side, at most four
    // (a side that is only its corner — the rest of the line water, or out of the plan —, the corner a tile of the next side: no
    // side of its own to gate; in the anos100 of the v37 the north of Karnak's box was all water but the corner by the west gate,
    // two tiles away, T-194)
    const sides = {}; for (const i of w.tiles) for (const sd of sideOf(w, i)) (sides[sd] = sides[sd] || []).push(i);
    for (const sd of Object.keys(sides)) if (sides[sd].every(i => sideOf(w, i).length > 1)) delete sides[sd];
    const walked = i => S.road[i] || S.wear[i] > 22;
    // (a side with no street nor path of its own, only light wear: served where its busiest tile — where its people walk out, the
    // planner's own measure — is a step from the next side's gate, as the planner keeps it; the old count asked every such side
    // its own gate, more than the rule: Óstia's east in the mundial of 28/10, its wear at the corner by the south gate, T-180)
    const busiest = sd => sides[sd].reduce((a, i) => (S.wear[i] > S.wear[a] ? i : a), sides[sd][0]);
    // (a side cut by another town's walls — its tiles inside them left out, L-342 —: its people walk out that way through the
    // other wall's gates, and the side is judged by what it keeps, its streets and worn paths)
    const cut = sd => { const [x0, y0, x1, y1] = w.box; const line = []; if (sd === 'O' || sd === 'L') for (let y = y0; y <= y1; y++) line.push(y * G.N + (sd === 'O' ? x0 : x1)); else for (let x = x0; x <= x1; x++) line.push((sd === 'N' ? y0 : y1) * G.N + x); return line.some(i => G.Siege.walledIn(i, w)); };
    // (and a side asks a gate only where one can open — L-491: a side with no tile that lets one through has none to ask; one of
    // light wear, served by the next side's gate a step from where the planner would put its own: its busiest tile, or its middle)
    const miss = Object.keys(sides).filter(sd => { if (w.gates.some(g => sideOf(w, g).includes(sd))) return false; const can = sides[sd].filter(i => opensGate(w, i)); if (!can.length) return false; const ways = can.filter(walked); if (!ways.length && cut(sd)) return false;
      if (!ways.length) { const b = can.reduce((a, i) => (S.wear[i] > S.wear[a] ? i : a), can[0]); const pick = S.wear[b] >= 3 ? b : can[Math.floor(can.length / 2)]; return !w.gates.some(g => dist(pick, g) <= 3); } return !ways.every(i => w.gates.some(g => dist(i, g) <= 3)); });
    // (the gates for a building the wall would shut off, w.ways — L-344 —, are beyond the four, and where that building needs them)
    const main = w.gates.filter(g => !(w.ways || []).includes(g));
    const close = main.some((g, a) => main.some((h, b) => a < b && dist(g, h) < 4));
    if (miss.length || close || main.length > 4) bad1.push(`${name}: lados sem portão ${miss.join('') || '-'}${close ? ', portões lado a lado' : ''}${main.length > 4 ? ', ' + main.length + ' portões' : ''}`);
    // 2. a side a street or a worn path crosses has its gate on one (where the people walk — the planner's own test)
    for (const sd of Object.keys(sides)) {
      const ways = sides[sd].filter(i => walked(i) && opensGate(w, i)); if (!ways.length) continue;
      const g = w.gates.filter(q => sideOf(w, q).includes(sd)); if (g.length && !g.some(walked)) bad2.push(`${name}, lado ${sd}: ${ways.length} casa(s) de rua ou caminho, o portão fora deles`);
    }
    // (3: how unevenly its walked sides are used — the rank the planner itself gives a gate: the worn path, a street more)
    { const rank = i => S.wear[i] + (S.road[i] ? 40 : 0); const tops = Object.keys(sides).map(sd => ({ sd, top: Math.max(0, ...sides[sd].filter(walked).map(rank)), ways: sides[sd].filter(walked) })).filter(q => q.ways.length);
      if (tops.length >= 2) { tops.sort((a, b) => a.top - b.top); const q = tops[0]; const served = w.gates.some(g => sideOf(w, g).includes(q.sd)) || q.ways.every(i => w.gates.some(g => dist(i, g) <= 3));
        uneven.push({ name, ratio: tops[tops.length - 1].top / Math.max(1, q.top), side: q.sd, served, gates: w.gates.map(g => sideOf(w, g).join('')).join(' ') }); } }
    if (!worst && w.gates.length) worst = `${name}: ${w.tiles.length} casas de muro, ${w.gates.length} portões (${w.gates.map(g => sideOf(w, g).join('')).join(' ')})`;
  }
  if (k === 'anos100') {
    // 3b. Jelling planned again, while the world has it as it was found — its west side a line of its own over a street or a worn
    // path (the street to Mênfis's quay): a gate on the west side. (In the anos100 of the generation 16 Jelling is a hamlet of
    // six whose west line runs inside Birka's walls — left out, L-342 —: no west side to gate, T-565)
    const je = [...S.settlements.values()].find(s => s.name === 'Jelling'); const w = je && plan(je);
    const westT = w ? w.tiles.filter(i => { const sd = sideOf(w, i); return sd.length === 1 && sd[0] === 'O'; }) : [];
    const westW = westT.filter(i => S.road[i] || S.wear[i] > 22);
    if (w && westW.length) { const west = w.gates.filter(g => sideOf(w, g).includes('O')); ok('3b Jelling planejada de novo: um portão no lado oeste', west.length > 0, `caixa ${JSON.stringify(w.box)}; o lado oeste com ${westW.length} casa(s) de rua ou caminho; portões ${w.gates.map(g => `(${g % G.N},${(g / G.N) | 0})${sideOf(w, g).join('')}`).join(' ')}`); }
    else if (w) { const [x0, y0, , y1] = w.box; let inner = 0, wet = 0; for (let y = y0; y <= y1; y++) { const i = y * G.N + x0; if (G.Siege.walledIn(i, w)) inner++; else if (S.type[i] < G.T.SAND) wet++; }
      console.log(`(3b: o muro de Jelling planejado neste mundo não tem lado oeste andado — ${westT.length} casa(s) de muro no oeste${inner ? `, ${inner} da linha dentro do muro de outra cidade` : ''}${wet ? `, ${wet} na água` : ''} —; o caso ruim vai pela regra, no 1 e no 3)`); }
    else console.log('(3b: o mundo pronto anos100 não tem mais Jelling, onde o L-140 foi achado; o caso ruim vai pela regra, no 3)');
  }
}
ok('1 cada lado o seu portão, nunca lado a lado, no máximo quatro', plans > 20 && !bad1.length, `${plans} muros planejados em ${WORLDS.length} mundos; ${bad1.length} com falta: ${bad1.slice(0, 4).join(' · ') || 'nenhum'}${worst ? ' · ex.: ' + worst : ''}`);
ok('1b nenhum muro planejado no lote de uma praça ou feira (chão aberto de planta, L-466)', plans > 20 && !bad1b.length, `${plans} muros planejados, ${near1b} com uma praça ou feira na linha da caixa, por onde o muro passa: ${bad1b.length ? bad1b.length + ' sobre um lote — ' + bad1b.slice(0, 4).join(' · ') : 'nenhum sobre o lote'}`);
// 1c. a wall of before L-466 standing on the lot of a fair, in a save: loaded, it comes down there — the lot the world's to walk
// across again — and the rest of the wall stands (a wall of the ready worlds whose record, planned before the fix, still has
// tiles on a fair's lot: the god puts them back on it, as a save of before holds them; a record of after the fix has none —
// a tile of a fair or a square of its town put in it, as the planner of before did)
{
  let got = null;
  for (const k of WORLDS) {
    M.pronto(k); const S = G.S;
    const open = i => { const o = S.occ[i]; const b = o && S.buildings.get(o); return !!b && !G.BDEF[b.type].blocks && !!G.Interiors.TYPES[b.type]; };
    const up = S.walls.filter(q => q.tiles.some(i => S.wall[i] === 1));
    let w = up.find(q => q.tiles.some(open)) || null, put = w ? w.tiles.filter(open) : [];
    for (const q of w ? [] : up) { const ob = [...S.buildings.values()].filter(o => o.set === q.set && !G.BDEF[o.type].blocks && G.Interiors.TYPES[o.type]).sort((a, c) => (a.type === 'feira' ? 0 : 1) - (c.type === 'feira' ? 0 : 1) || a.id - c.id)[0];
      if (ob) { const i = ob.y * G.N + ob.x; q.tiles.push(i); put = [i]; w = q; break; } }
    if (!w) continue; const lots = [...new Set(put.map(i => { const b = S.buildings.get(S.occ[i]); return b.type + '#' + b.id; }))];
    G.inSim++; try { for (const i of put) { S.wall[i] = 1; S.wallFac[i] = w.fac; } G.W.touchWalk(); } finally { G.inSim--; }
    // (and the checker: it sees the wall on the lot before, and is quiet after)
    const said = () => QA.check().filter(q => /\(chão aberto de planta\)/.test(q.msg)).length;
    const rest = w.tiles.filter(i => S.wall[i] && !open(i)); const said0 = said(); M.salvarCarregar(); const S1 = G.S;
    got = { k, w, put, lots, still: put.filter(i => S1.wall[i]).length, walk: put.filter(i => G.W.walkable(i)).length, rest: rest.length, kept: rest.filter(i => S1.wall[i]).length, said0, said1: said() };
    break;
  }
  ok('1c o muro de antes no lote de uma feira, num save: carregado, sai do lote, e o resto do muro fica', !!got && !got.still && got.walk === got.put.length && got.kept === got.rest && got.said0 > 0 && !got.said1, got ? `${got.k}: o muro #${got.w.id} com ${got.put.length} casa(s) de pé no lote de ${got.lots.join(', ')} — o verificador ${got.said0 ? 'o vê' : 'NÃO o vê'}; carregado, ${got.still} de pé lá, ${got.walk} que o mundo anda; o resto do muro: ${got.kept} de ${got.rest} de pé; o verificador ${got.said1 ? 'AINDA QUEIXA' : 'cala'}` : 'nenhum muro dos mundos com o registro sobre o lote de uma praça ou feira (nada a provar)');
}
ok('2 o portão do lado fica onde se anda (a rua ou o caminho gasto que o cruza)', !bad2.length, bad2.slice(0, 4).join(' · ') || `${plans} muros, nenhum lado com o portão fora de onde se anda`);
{ const top = uneven.sort((a, b) => b.ratio - a.ratio).slice(0, 5); const miss = top.filter(q => !q.served);
  ok('3 o caso ruim do L-140, pela regra: nos muros cujos lados andados mais diferem no movimento, o lado mais quieto tem o seu portão', top.length >= 3 && !miss.length,
    top.length < 3 ? `só ${top.length} muro(s) com dois lados andados: o caso precisa de outro mundo` : top.map(q => `${q.name}: lado ${q.side} ${q.served ? 'servido' : 'SEM portão'} (${q.ratio.toFixed(1)}×; portões ${q.gates})`).join(' · ')); }
ok('7a nenhum plano fecha um prédio da sua cidade', !bad7.length, `${plans} muros planejados; ${ways7} com portão a mais para um prédio que o muro fecharia; ${bad7.length ? bad7.slice(0, 4).join(' · ') : 'nenhum prédio fechado'}`);
ok('10a nenhum portão planejado entre dois prédios, um de cada lado da linha (L-603)', plans > 20 && !bad10.length, `${plans} muros planejados; ${bad10.length ? bad10.length + ' com portão fechado pelos dois lados — ' + bad10.slice(0, 4).join(' · ') : 'nenhum portão fechado'}`);
ok('11a nenhum muro planejado num chão cercado — curral, estábulo, cercado, cemitério (L-606)', plans > 20 && !bad11.length, `${plans} muros planejados; ${bad11.length ? bad11.length + ' sobre um chão cercado — ' + bad11.slice(0, 4).join(' · ') : 'nenhum sobre um chão cercado'}`);
ok('12a todo portão planejado deixa passar: chão aberto dos dois lados da linha, nunca um canto (L-491)', plans > 20 && !bad12.length, `${plans} muros planejados${bad12.length ? '; SEM PASSAGEM: ' + bad12.slice(0, 4).join(' | ') : ''}`);
ok('12b o muro atravessa o vau e a ponte: nenhuma casa de rio que os pés andam fica fora da linha (L-658)', plans > 20 && !bad12b.length, `${plans} muros planejados, ${fords12} com vau ou ponte na linha${bad12b.length ? '; FORA: ' + bad12b.slice(0, 4).join(' | ') : ''}`);
ok('6a nenhum plano corre dentro do muro de outra cidade', !bad6.length, `${plans} muros planejados; ${reach6} com o retângulo entrando no de outro muro; ${bad6.length ? bad6.slice(0, 4).join(' · ') : 'nenhuma casa dentro'}`);
// 4. a wall begun, saved and loaded halfway; then finished
{
  M.pronto('anos100'); const S = G.S;
  // (the town: the first without a wall that can plan one, its people at peace — a town taken in the middle gives its wall up:
  // Birka, in the anos100 remade after the generation 15, fell to Argos a minute in —, with the stone or the wood for half of it
  // in store, put by the depot where it lacks — the builders lay a tile only with 3 in store, 2 a tile: Birka's people had none,
  // and nothing was built, T-494)
  const s = [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac) && !G.Fac.enemiesOf(q.fac).length).sort((a, b) => a.id - b.id).find(q => plan(q));
  if (!s) ok('4 um muro começado, salvo e carregado no meio', false, 'nenhuma cidade sem muro, em paz, que possa erguer um');
  else {
    const w0 = G.Siege.raiseWalls(s, null, false); const tiles = w0.tiles.join(','), gates = w0.gates.join(',');
    { const f = G.Fac.get(s.fac), k = w0.mat === 'pedra' ? 'stone' : 'wood'; const falta = Math.ceil(w0.tiles.length + 3 - (f.stock[k] || 0)); if (falta > 0) G.Depot.make('f:' + f.id, k, falta, { code: 'teste' }); }
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
// (the corner sought in each ready world in turn, as deep as six tiles, then five: the worlds made after L-342 raise no wall
// into another's box, and their walls have gates nearer their corners — the metropolis of the v37 had no corner of six, T-194)
const corner = (K) => {
  const S = G.S, N = G.N, W = G.W;
  const standing = o => o.done && o.tiles.filter(i => S.wall[i] && S.wall[i] !== 3).length >= o.tiles.length * 0.8;
  let best = null; const L0 = W.reachIds(true);
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
  return best;
};
for (const old of [false, true]) {
  let best = null, K = 6, world = '';
  for (const k of ['metropole', 'mega', 'mundial', 'anos100', 'cidade']) { M.pronto(k); for (const k2 of [6, 5]) { best = corner(k2); if (best) { K = k2; world = k; break; } } if (best) break; }
  const S = G.S, N = G.N, W = G.W, Sg = G.Siege;
  const nm = old ? '6c o muro de antes de pé num save velho: carregado, o que está dentro do outro muro cai e o bolsão abre' : '6b o plano de antes do conserto, erguido pelos construtores: nada dele dentro do outro muro, e o chão de lá continua da cidade';
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
  const where = `${world}: o muro de ${b.name} em ${JSON.stringify(box)}, ${tiles.length} casas (${inner.length} dentro do muro de ${s.name}, ${JSON.stringify(a.box)}); o canto (${cx},${cy}) com ${pk.length} casas de chão de ${s.name}`;
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
{
  const NAME = '7c o muro de pé com todo portão fechado em muro, num save: carregado, os prédios da cidade ao alcance de novo';
  const around = (b, L) => { const N = G.N, o = []; for (let x = b.x - 1; x <= b.x + b.w; x++) for (let y = b.y - 1; y <= b.y + b.h; y++) if (x >= 0 && y >= 0 && x < N && y < N && (x < b.x || x >= b.x + b.w) !== (y < b.y || y >= b.y + b.h)) o.push(L[y * N + x]); return o; };
  const reachedNow = s => { const L = G.W.reachIds(true), R = G.W.townRegion(s); return [...G.S.buildings.values()].filter(b => b.set === s.id && b.built && b.type !== 'ruin' && around(b, L).includes(R)).map(b => b.id); };
  const outside = (w, b) => b.x + b.w <= w.box[0] || b.x > w.box[2] || b.y + b.h <= w.box[1] || b.y > w.box[3];
  const walls = () => G.S.walls.filter(q => q.done && G.S.settlements.has(q.set)).sort((p, q) => p.id - q.id);
  // (the world open now: a wall whose gates, shut into wall, shut buildings of its town off — walls with a gap, a square on the
  // line, a breach, shut nothing, and are passed by —; shut so, saved and loaded)
  const try7c = (k, how) => {
    const S = G.S, N = G.N, W = G.W;
    let w = null, before = [], shut = 0;
    for (const q of walls()) {
      const s = S.settlements.get(q.set); const b0 = reachedNow(s); if (![...S.buildings.values()].some(b => b0.includes(b.id) && outside(q, b))) continue;
      // (every gate shut into wall: the four of the plan and the ones beyond them for a building, w.ways — L-344, L-604 —, as
      // the record is left with none of either)
      const all = q.gates.concat(q.ways || []); const keep = all.map(g => [g, S.wall[g], S.wallHp[g]]); for (const g of all) { S.wall[g] = 1; S.wallHp[g] = 80; } W.touchWalk();
      const n = b0.filter(id => !reachedNow(s).includes(id)).length;
      if (n > 0) { w = q; before = b0; shut = n; w.gates = []; w.ways = []; break; }
      for (const [g, v, hp] of keep) { S.wall[g] = v; S.wallHp[g] = hp; } W.touchWalk();
    }
    if (!w) return false;
    const s = S.settlements.get(w.set), sid = s.id, wid = w.id;
    M.salvarCarregar(); const S1 = G.S, s1 = S1.settlements.get(sid), w1 = S1.walls.find(q => q.id === wid);
    const L = W.reachIds(true), R = W.townRegion(s1); const back = before.filter(id => { const b = S1.buildings.get(id); return !b || around(b, L).includes(R); }).length;
    ok(NAME, shut > 0 && back === before.length && w1 && w1.gates.length > 0, `${k}${how ? ` (${how})` : ''}: o muro de ${s.name} (#${wid}), sem portão: ${shut} de ${before.length} prédios da cidade fora de alcance; carregado, ${(w1 && w1.gates.length) || 0} portão(ões) abertos (${w1 ? w1.gates.map(g => `(${g % N},${(g / N) | 0})`).join(' ') : '-'}), ${back} de ${before.length} ao alcance`);
    return true;
  };
  let ran = false;
  for (const k of ['metropole', 'mega', 'cidade', 'anos100', 'mundial']) { M.pronto(k); if (try7c(k, '')) { ran = true; break; } }
  // (no world has one today: the walls of the generation 17 leave the town a way round them — their lines stop at the rivers,
  // which are forded, and at the shallows —, and with every gate shut each but three shut not one tile round it off, and those
  // three a pocket of a dozen between the wall and the water, with no building of the town and no room for one. The case is
  // armed by the rule, as the 7b's soleira was by the god's hand: a wall raised at once by the game's door (Siege.raiseWalls,
  // the plan the world makes), for a town at peace without one whose plan runs all on dry land — a line that crosses a river
  // has a ford in it —, in each world in turn; the plan of a grown town walls the old one and leaves its new quarters
  // outside, reached through its gates. Twelve walls at most)
  const tried = [];
  for (const k of ['metropole', 'mega', 'cidade', 'anos100']) {
    if (ran || tried.length >= 12) break;
    M.pronto(k);
    const towns = [...G.S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac) && !G.Fac.enemiesOf(q.fac).length).sort((a, b) => a.id - b.id);
    for (const s of towns) {
      if (tried.length >= 12) break; const p = plan(s); if (!p || p.tiles.some(i => G.S.type[i] < G.T.SAND)) continue;
      const w = G.Siege.raiseWalls(s, null, true); if (!w || !w.done) continue; tried.push(`${k}: ${s.name}`);
      if (try7c(k, `armado: o muro de ${s.name} (#${w.id}) erguido de uma vez pela porta do jogo, Siege.raiseWalls`)) { ran = true; break; }
    }
  }
  if (!ran) ok(NAME, false, `em nenhum mundo um muro de pé que, com todo portão fechado em muro, feche um prédio da cidade; armado pela porta do jogo (${tried.join(' · ') || 'nenhuma cidade sem muro, em paz, que possa erguer um'}): nenhum desses muros, fechado, fechou um prédio da cidade`);
}
// 8. the site finder and the gates
{
  M.pronto('metropole'); const S = G.S, N = G.N, V = G.Village;
  const beside = (b, def) => { for (let y = b[1]; y < b[1] + def.h; y++) for (let x = b[0]; x < b[0] + def.w; x++) if (V.byGate(x, y)) return true; return false; };
  const s = [...S.settlements.values()].filter(q => G.Fac.get(q.fac)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
  const def = G.BDEF.house; const s0 = s && V.findSite(s, 'house');
  if (!s0) ok('8 nada que bloqueia no caminho de um portão: o buscador de lugar vai para outro lado', false, 'a maior cidade não tem lugar para uma casa');
  else {
    // (a gate beside the best site — on its south side, where the ground is open —, as a wall raised later would put it)
    // (on any side of it, the south first: in the metropolis of the v37 the best site's south was all taken, T-194)
    const around = []; for (let x = s0[0]; x < s0[0] + def.w; x++) around.push([x, s0[1] + def.h]); for (let x = s0[0]; x < s0[0] + def.w; x++) around.push([x, s0[1] - 1]); for (let y = s0[1]; y < s0[1] + def.h; y++) around.push([s0[0] - 1, y], [s0[0] + def.w, y]);
    let g = -1; for (const [x, y] of around) { if (g >= 0 || x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (G.W.walkable(i) && !S.occ[i] && !S.wall[i]) g = i; }
    if (g < 0) ok('8 nada que bloqueia no caminho de um portão: o buscador de lugar vai para outro lado', false, 'nenhum chão aberto ao lado do lugar');
    else {
      S.wall[g] = 2; G.W.touchWalk(); let s1 = null; try { s1 = V.findSite(s, 'house'); } finally { S.wall[g] = 0; G.W.touchWalk(); }
      const moved = !!s1 && (s1[0] !== s0[0] || s1[1] !== s0[1]);
      ok('8 nada que bloqueia no caminho de um portão: o buscador de lugar vai para outro lado', moved && !(s1 && beside(s1, def)), `${s.name}: o lugar de uma casa em (${s0[0]},${s0[1]}); um portão posto em (${g % N},${(g / N) | 0}), ao lado dele: ${s1 ? 'o lugar foi para (' + s1[0] + ',' + s1[1] + ')' + (beside(s1, def) ? ', AO LADO de um portão' : ', longe de portão') : 'nenhum lugar'}`);
    }
  }
}
// 8b. the site finder gives only sites whose work the town's streets reach (L-465: the best site of a house of Mênfis, in the
// metrópole of the generation 11, was a tile of beach between its wall and the sea, a pocket of one tile — the case 8 had no
// open ground beside it —; and in the anos500, a house of Argos in a pocket between a pottery and the sea): in every town of
// the worlds, for the kinds a town builds most, the site has a tile round it the town reaches (V.siteReached, the builders'
// own rule, V.townReachesWork)
{
  const KINDS = ['house', 'hut', 'sobrado', 'insula', 'storehouse', 'workshop', 'well', 'farm', 'temple', 'taverna'].filter(t => G.BDEF[t]);
  let asked = 0, got = 0; const bad8 = [];
  for (const k of WORLDS) {
    M.pronto(k); const S = G.S, V = G.Village; G.inSim++;
    try { for (const s of [...S.settlements.values()].filter(q => G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) for (const t of KINDS) { asked++; const p = V.findSite(s, t); if (!p) continue; got++; if (!V.siteReached(s, p[0], p[1], G.BDEF[t])) bad8.push(`${k}: ${s.name} ${t} em ${p[0]},${p[1]}${p.demolish ? ' (derrubando)' : ''}`); } }
    finally { G.inSim--; }
  }
  ok('8b o buscador de lugar só dá lugar que as ruas da cidade alcançam', got > 0 && !bad8.length, `${asked} pedidos em ${WORLDS.length} mundos, ${got} lugares: ${bad8.length ? bad8.length + ' fora do alcance das ruas — ' + bad8.slice(0, 4).join(' · ') : 'todos ao alcance das ruas'}`);
}
// 9. a building in the only way of another, behind a standing wall
{
  const nm = '9 um prédio novo no único caminho de outro, atrás do muro de pé: o portão na hora, e no save';
  // (where a blocking thing on one tile would leave the wall shutting a building of its town off: tried on the map by putting
  // a blocking building's id on the tile, and taking it back)
  let found = null, tries = 0, fasts = 0; const unsound = [];
  for (const k of ['mega', 'metropole', 'mundial', 'anos100', 'cidade']) {
    M.pronto(k); const S = G.S, N = G.N, W = G.W, V = G.Village; const blk = [...S.buildings.values()].find(b => b.blocks);
    for (const w of S.walls.filter(q => q.done && S.settlements.has(q.set)).sort((p, q) => p.id - q.id)) {
      const s = S.settlements.get(w.set); if (!blk || G.Siege.openWays(s, w, true).length) continue;
      const plan = new Set(w.tiles);
      const nearWall = b => { for (let y = b.y - 3; y < b.y + b.h + 3; y++) for (let x = b.x - 3; x < b.x + b.w + 3; x++) if (x >= 0 && y >= 0 && x < N && y < N && plan.has(y * N + x)) return true; return false; };
      for (const b of [...S.buildings.values()].filter(q => q.set === s.id && q.built && q.type !== 'ruin' && nearWall(q)).sort((p, q) => p.id - q.id)) {
        for (let y = b.y - 3; y < b.y + b.h + 3; y++) for (let x = b.x - 3; x < b.x + b.w + 3; x++) {
          if (x < 2 || y < 2 || x >= N - 2 || y >= N - 2) continue; const i = y * N + x;
          if (S.occ[i] || S.wall[i] || plan.has(i) || !W.ground(i) || S.road[i] >= 2 || V.byGate(x, y)) continue;
          // (and the walls' shortcut, at every tile tried: where it says a building there shuts nothing, the whole count agrees)
          const fast = G.Siege.apart({ x, y, w: 1, h: 1 }); tries++; if (fast) fasts++;
          S.occ[i] = blk.id; let o; try { o = G.Siege.openWays(s, w, true); } finally { S.occ[i] = 0; }
          if (o.length && fast) unsound.push(`${k}: (${x},${y}) no muro de ${s.name}`);
          if (o.length && !found) found = { k, w: w.id, set: s.id, x, y };
        }
      }
    }
    if (found) break;
  }
  if (!found) ok(nm, false, 'em nenhum mundo pronto uma casa onde um prédio deixaria o muro de pé fechando outro da cidade');
  else {
    const S = G.S, N = G.N, W = G.W; const w = S.walls.find(q => q.id === found.w), s = S.settlements.get(found.set);
    const ways0 = (w.ways || []).length; const shut0 = (() => { const i = found.y * N + found.x; const blk = [...S.buildings.values()].find(b => b.blocks); S.occ[i] = blk.id; try { return G.Siege.openWays(s, w, true); } finally { S.occ[i] = 0; } })();
    const b = G.Village.addBuilding('well', found.x, found.y, s.id, false); // (the world's door for a building: the one startProject uses)
    const left = G.Siege.openWays(s, w, true); const added = (w.ways || []).slice(ways0); const cut = added.filter(g => S.wall[g] === 2);
    const s3 = QA.check().filter(q => q.sev <= 3 && /fecha \d+ prédio/.test(q.msg)).map(q => q.msg);
    M.salvarCarregar(); const S1 = G.S, w1 = S1.walls.find(q => q.id === found.w); const kept = added.filter(g => w1 && w1.gates.includes(g) && S1.wall[g] === 2).length;
    ok('9b o atalho dos muros (um prédio que não encosta em nada e deixa o chão em volta inteiro não fecha nada) nunca erra', !unsound.length && fasts > 0, `${tries} casas tentadas perto dos muros, ${fasts} pelo atalho; ${unsound.length ? 'ERROU: ' + unsound.slice(0, 4).join(' · ') : 'nenhum erro'}`);
    ok(nm, shut0.length > 0 && !left.length && added.length > 0 && cut.length > 0 && !s3.length && kept === added.length,
      `${found.k}: o muro de ${s.name} (#${w.id}); um poço (#${b.id}) em (${found.x},${found.y}) fecharia o caminho (o portão em ${shut0.map(g => `(${g % N},${(g / N) | 0})`).join(' ')}); posto: ${left.length ? `ainda fecha (${left.map(g => `(${g % N},${(g / N) | 0})`).join(' ')})` : 'nada fechado'}; portões a mais ${added.map(g => `(${g % N},${(g / N) | 0})${S.wall[g]}`).join(' ') || 'nenhum'}; o verificador: ${s3.join(' · ') || 'limpo'}; carregado, ${kept} de ${added.length} de pé no mapa`);
    void W;
  }
}
// 10b. the bad case on purpose (L-603): a house on each side of a street tile of the line where the plan of a town with no
//      wall has its gate — on a straight run of the line, the two tiles across it free and dry; the houses another town's, so
//      the box of the plan, its own buildings', stays —: planned again, the same line, and that side's gate on another tile;
//      raised at once, the checker sees no gate of it shut by buildings
{
  const nm = '10b dois prédios, um de cada lado de uma casa de rua onde o plano tem o portão: o portão vai para outra casa';
  let got = null;
  for (const k of ['metropole', 'cidade', 'mega']) {
    M.pronto(k); const S = G.S, N = G.N, V = G.Village;
    for (const s of [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) {
      const other = [...S.settlements.values()].find(q => q.id !== s.id); const w0 = other && plan(s); if (!w0) continue; const on = new Set(w0.tiles);
      const free = j => j >= 0 && j < N * N && !S.occ[j] && !S.wall[j] && !on.has(j) && S.type[j] >= G.T.SAND;
      const across = i => { const ew = on.has(i - 1) && on.has(i + 1), ns = on.has(i - N) && on.has(i + N); return ew === ns ? null : ew ? [i - N, i + N] : [i - 1, i + 1]; };
      const g = w0.gates.find(i => { if ((w0.ways || []).includes(i) || !S.road[i] || sideOf(w0, i).length !== 1) return false; const a = across(i); return !!a && free(a[0]) && free(a[1]); });
      if (g === undefined) continue;
      const sd = sideOf(w0, g)[0]; const hs = sim(() => across(g).map(j => V.addBuilding('house', j % N, (j / N) | 0, other.id, true)));
      const w1 = plan(s); const same = !!w1 && w1.tiles.join() === w0.tiles.join();
      const side = w1 ? w1.gates.filter(q => sideOf(w1, q).includes(sd)) : []; const shut1 = w1 ? w1.gates.filter(q => shutGate(w1, q)) : [];
      // (raised at once: what the checker says of its gates — the wall then taken off the map as it was)
      let mine = null;
      if (w1) { const keep = w1.tiles.map(i => [i, S.wall[i], S.wallFac[i], S.wallHp[i]]); const w = sim(() => G.Siege.raiseWalls(s, 'pedra', true));
        try { mine = QA.check().filter(q => /fechado por prédios dos dois lados/.test(q.msg) && w.gates.some(i => q.msg.includes(`(${i % N},${(i / N) | 0})`))).map(q => q.msg); }
        finally { for (const [i, a, b, c] of keep) { S.wall[i] = a; S.wallFac[i] = b; if (c === undefined) delete S.wallHp[i]; else S.wallHp[i] = c; } S.walls.splice(S.walls.indexOf(w), 1); G.W.touchWalk(); } }
      sim(() => { for (const h of hs) V.removeBuilding(h); });
      got = { k, s, g, sd, hs, w1, same, side, shut1, mine }; break;
    }
    if (got) break;
  }
  if (!got) ok(nm, false, 'em nenhum mundo pronto um plano com o portão numa casa de rua de um trecho reto da linha, com chão livre dos dois lados');
  else { const N = G.N, at = i => `(${i % N},${(i / N) | 0})`;
    ok(nm, got.same && !got.w1.gates.includes(got.g) && got.side.length > 0 && !got.shut1.length && !!got.mine && !got.mine.length,
      `${got.k}: ${got.s.name} — o portão do plano em ${at(got.g)} (lado ${got.sd}); com ${got.hs.map(h => h.type + '#' + h.id).join(' e ')} dos dois lados: ${got.same ? 'a mesma linha' : 'A LINHA MUDOU'}, o portão do lado ${got.sd} em ${got.side.map(at).join(' ') || 'NENHUM'}${got.w1.gates.includes(got.g) ? ', e AINDA em ' + at(got.g) : ''}; fechados pelos dois lados ${got.shut1.length}; erguido, o verificador: ${got.mine ? (got.mine.length ? got.mine[0] : 'nada') : '-'}`); }
}
// 11b. the bad case on purpose (L-606): a pen on the line of a town's wall — another town's, so the box of the plan, its own
//      buildings', stays; put down by the god's hand where a straight run of the line crosses free dry ground, the line through
//      its middle, two tiles from any gate — and a cow of it held still on another tile of the line, open ground the cow can
//      stand on with ground it can stand on across the line on both sides: raised by the builders (the plan made before the
//      pen, as a town builds while its wall waits) and at once (the plan made with the pen there), no wall stands on the pen,
//      and the cow is not left inside the wall — set down beside it, where it can stand and from where it reaches its pen
for (const instant of [false, true]) {
  const nm = `11b um curral na linha do muro e uma vaca numa casa dele: nenhum muro no curral, e a vaca posta ao lado (${instant ? 'o muro erguido de uma vez' : 'pelos construtores'})`;
  let got = null;
  for (const k of ['cidade', 'metropole', 'mega']) {
    M.pronto(k); const S = G.S, N = G.N, V = G.Village, W = G.W;
    const COW = { kind: 'vaca' };
    for (const s of [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac) && !G.Fac.enemiesOf(q.fac).length).sort((a, b) => a.id - b.id)) {
      const other = [...S.settlements.values()].filter(q => q.id !== s.id && G.Fac.get(q.fac)).sort((p, q) => G.dist2(p.cx, p.cy, s.cx, s.cy) - G.dist2(q.cx, q.cy, s.cx, s.cy) || p.id - q.id)[0];
      const w0 = other && plan(s); if (!w0) continue; const on = new Set(w0.tiles);
      const far = (i, d) => w0.gates.every(g => dist(g, i) > d);
      const free = j => j >= 0 && j < N * N && !S.occ[j] && !S.wall[j] && !S.road[j] && S.type[j] >= G.T.SAND && W.walkable(j) && !S.treeAt[j] && !S.objAt[j];
      // (the pen: its three tiles across a straight run of the line, its middle on it, all nine free)
      let spot = null;
      for (const i of w0.tiles) {
        const sd = sideOf(w0, i); if (sd.length !== 1) continue; const hz = sd[0] === 'N' || sd[0] === 'S';
        const run = hz ? [i - 1, i, i + 1] : [i - N, i, i + N]; if (!run.every(j => on.has(j) && sideOf(w0, j).length === 1 && far(j, 2))) continue;
        const x0 = (i % N) - 1, y0 = ((i / N) | 0) - 1; const lot = []; for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) lot.push((y0 + dy) * N + x0 + dx);
        if (lot.every(free)) { spot = { x0, y0, lot, run, i }; break; }
      }
      if (!spot) continue;
      // (the cow's tile: of the line, open ground a cow stands on, with ground it stands on across the line on both sides, three
      // tiles and more from the pen and a tile from any gate — the first in the plan's order, raised early)
      const across = i => { const sd = sideOf(w0, i); const hz = sd[0] === 'N' || sd[0] === 'S'; return hz ? [i - N, i + N] : [i - 1, i + 1]; };
      const okC = j => G.Animals.walkOK(COW, (j % N) + 0.5, ((j / N) | 0) + 0.5);
      const ct = w0.tiles.find(c => sideOf(w0, c).length === 1 && far(c, 1) && dist(c, spot.i) > 3 && !S.occ[c] && !S.wall[c] && okC(c) && across(c).every(j => !on.has(j) && okC(j)));
      if (ct === undefined) continue;
      // (the plan first, the pen after — the builders' case —, or the pen first and the wall at once)
      const res = sim(() => {
        let w = instant ? null : G.Siege.raiseWalls(s, null, false);
        const pen = V.addBuilding('curral', spot.x0, spot.y0, other.id, true);
        const cow = G.Animals.spawn('vaca', (ct % N) + 0.5, ((ct / N) | 0) + 0.5, { dom: other.fac, pen: pen.id, state: 'pen', grown: 1, age: 3, hunger: 0.1, hx: pen.x + 1.5, hy: pen.y + 1.5, hold: 1e9 });
        if (instant) w = G.Siege.raiseWalls(s, null, true);
        return { w, pen, cow };
      });
      const w = res.w; if (!w) continue;
      if (!instant) {
        G.Depot.make('f:' + w.fac, w.mat === 'pedra' ? 'stone' : 'wood', 600, { code: 'teste', part: true }); // (the material the builders take)
        const at = Math.max(...spot.run.concat([ct]).map(j => w.tiles.indexOf(j)));
        let n = 0; while (w.built <= at && !w.done && n++ < 8000) G.debug.step(0.5);
      }
      const cow = res.cow; const ci = W.idx(cow.x, cow.y);
      got = { k, s, other, w, pen: res.pen, spot, ct, cow, raised: S.wall[ct] === 1, onPen: spot.lot.filter(j => S.wall[j] === 1 || S.wall[j] === 2 || S.wall[j] === 4).length, planOn: w.tiles.filter(j => spot.lot.includes(j)).length,
        inWall: S.wall[ci] === 1 || S.wall[ci] === 4, stands: !cow.dead && G.Animals.walkOK(cow, cow.x, cow.y), reaches: W.canWalk(cow.x, cow.y, cow.hx, cow.hy) };
      break;
    }
    if (got) break;
  }
  if (!got) { ok(nm, false, 'em nenhum mundo pronto uma cidade sem muro com um trecho reto da linha sobre chão livre para um curral'); continue; }
  const N = G.N, at = i => `(${i % N},${(i / N) | 0})`;
  ok(nm, got.raised && !got.onPen && (!instant || !got.planOn) && !got.inWall && got.stands && got.reaches,
    `${got.k}: o muro de ${got.s.name} (#${got.w.id}); ${G.Village.buildName(got.pen)} #${got.pen.id} de ${got.other.name} em (${got.spot.x0},${got.spot.y0}), a linha pelo meio${instant ? `; o plano com o curral lá: ${got.planOn ? got.planOn + ' casa(s) dele NO CURRAL' : 'nenhuma casa no curral'}` : ''}; de pé no curral: ${got.onPen ? got.onPen + ' casa(s) de MURO' : 'nenhum muro'}; a vaca #${got.cow.id} na casa ${at(got.ct)} da linha — ${got.raised ? 'o muro subiu ali' : 'o muro NÃO subiu ali'}: agora em (${got.cow.x.toFixed(2)},${got.cow.y.toFixed(2)})${got.inWall ? ', DENTRO DO MURO' : ''}, ${got.stands ? 'num chão onde fica' : 'ONDE NÃO PODE FICAR'}, ${got.reaches ? 'chega ao seu curral' : 'NÃO CHEGA ao seu curral'}`);
}
// 11c. a wall of before L-606 standing on a fenced ground, in a save: the checker sees it; loaded, it comes down there — the fence
//      the wall there again — and the rest of the wall stands (a wall of the ready worlds standing on a pen, a stable, a captives'
//      pen or a graveyard, as the planner of before raised it; with none, a tile of a fenced ground of its town put in its record
//      and raised, as a save of before holds it)
{
  let got = null;
  for (const k of WORLDS) {
    M.pronto(k); const S = G.S;
    const fen = i => { const o = S.occ[i]; const b = o && S.buildings.get(o); return !!b && !!FEN[b.type] && !b.blocks; };
    const up = S.walls.filter(q => q.tiles.some(i => S.wall[i] === 1));
    let w = up.find(q => q.tiles.some(i => S.wall[i] && S.wall[i] !== 3 && fen(i))) || null, put = w ? w.tiles.filter(i => S.wall[i] && S.wall[i] !== 3 && fen(i)) : [];
    for (const q of w ? [] : up) { const ob = [...S.buildings.values()].filter(o => o.set === q.set && FEN[o.type] && o.built).sort((a, c) => a.id - c.id)[0];
      if (ob) { const i = ob.y * G.N + ob.x; q.tiles.push(i); put = [i]; w = q; break; } }
    if (!w) continue; const lots = [...new Set(put.map(i => { const b = S.buildings.get(S.occ[i]); return b.type + '#' + b.id; }))];
    sim(() => { for (const i of put) { S.wall[i] = 1; S.wallFac[i] = w.fac; } G.W.touchWalk(); });
    const said = () => QA.check().filter(q => /chão cercado/.test(q.msg)).length;
    const rest = w.tiles.filter(i => S.wall[i] && !put.includes(i)); const said0 = said(); M.salvarCarregar(); const S1 = G.S;
    got = { k, w, put, lots, still: put.filter(i => S1.wall[i]).length, walk: put.filter(i => G.W.walkable(i)).length, rest: rest.length, kept: rest.filter(i => S1.wall[i]).length, said0, said1: said() };
    break;
  }
  ok('11c o muro de antes num chão cercado, num save: o verificador o vê; carregado, sai de lá, e o resto do muro fica', !!got && !got.still && got.walk === got.put.length && got.kept === got.rest && got.said0 > 0 && !got.said1,
    got ? `${got.k}: o muro #${got.w.id} com ${got.put.length} casa(s) de pé no chão cercado de ${got.lots.join(', ')} — o verificador ${got.said0 ? 'o vê' : 'NÃO o vê'}; carregado, ${got.still} de pé lá, ${got.walk} que o mundo anda; o resto do muro: ${got.kept} de ${got.rest} de pé; o verificador ${got.said1 ? 'AINDA QUEIXA' : 'cala'}` : 'nenhum muro de pé nos mundos (nada a provar)');
}
// 5. the checker, the module errors
// 12c. the bad case on purpose (L-491): a house — another town's, so the box of the plan, its own buildings', stays — glued to
//      one side of the tile where the plan of a town with no wall has a gate, on a straight run of the line with free dry ground
//      on both sides: planned again, the same line and no gate on that tile, every gate of the plan one that lets through;
//      raised at once, the checker sees no gate of it that lets nobody through
{
  const nm = '12c um prédio colado num lado da casa onde o plano tem o portão: o portão vai para outra casa';
  let got = null;
  for (const k of ['metropole', 'cidade', 'mega']) {
    M.pronto(k); const S = G.S, N = G.N, V = G.Village;
    for (const s of [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) {
      const other = [...S.settlements.values()].find(q => q.id !== s.id); const w0 = other && plan(s); if (!w0) continue; const on = new Set(w0.tiles);
      const free = j => j >= 0 && j < N * N && !S.occ[j] && !S.wall[j] && !on.has(j) && S.type[j] >= G.T.SAND && !S.treeAt[j] && !S.objAt[j];
      const across = i => { const ew = on.has(i - 1) && on.has(i + 1), ns = on.has(i - N) && on.has(i + N); return ew === ns ? null : ew ? [i - N, i + N] : [i - 1, i + 1]; };
      const g = w0.gates.find(i => { if ((w0.ways || []).includes(i) || sideOf(w0, i).length !== 1) return false; const a = across(i); return !!a && free(a[0]) && free(a[1]); });
      if (g === undefined) continue;
      const sd = sideOf(w0, g)[0]; const j = across(g)[0]; const h = sim(() => V.addBuilding('house', j % N, (j / N) | 0, other.id, true)); if (!h) continue;
      const w1 = plan(s); const same = !!w1 && w1.tiles.join() === w0.tiles.join();
      const dead = w1 ? w1.gates.filter(q => !(w1.ways || []).includes(q) && !opensGate(w1, q)) : [];
      let mine = null;
      if (w1) { const keep = w1.tiles.map(i => [i, S.wall[i], S.wallFac[i], S.wallHp[i]]); const w = sim(() => G.Siege.raiseWalls(s, 'pedra', true));
        try { mine = QA.check().filter(q => /não deixa passar/.test(q.msg) && w.gates.some(i => q.msg.includes(`(${i % N},${(i / N) | 0})`))).map(q => q.msg); }
        finally { for (const [i, a, b, c] of keep) { S.wall[i] = a; S.wallFac[i] = b; if (c === undefined) delete S.wallHp[i]; else S.wallHp[i] = c; } S.walls.splice(S.walls.indexOf(w), 1); G.W.touchWalk(); } }
      sim(() => V.removeBuilding(h));
      got = { k, s, g, sd, h, w1, same, dead, mine }; break;
    }
    if (got) break;
  }
  if (!got) ok(nm, false, 'em nenhum mundo pronto um plano com o portão num trecho reto da linha, com chão livre dos dois lados');
  else { const N = G.N, at = i => `(${i % N},${(i / N) | 0})`;
    ok(nm, got.same && !got.w1.gates.includes(got.g) && !got.dead.length && !!got.mine && !got.mine.length,
      `${got.k}: ${got.s.name} — o portão do plano em ${at(got.g)} (lado ${got.sd}); com ${got.h.type}#${got.h.id} colado num lado: ${got.same ? 'a mesma linha' : 'A LINHA MUDOU'}, ${got.w1.gates.includes(got.g) ? 'O PORTÃO FICOU ALI' : 'o portão saiu dali'}; os portões do plano: ${got.w1.gates.map(at).join(' ')}${got.dead.length ? '; SEM PASSAGEM: ' + got.dead.map(at).join(' ') : ', todos deixam passar'}; de pé, o verificador: ${got.mine && got.mine.length ? got.mine[0] : 'nada'}`); }
}
// 12d. another town's house in a pocket the line would shut (L-689: the six houses of Kaupang on the strip east of Birka's wall,
//      in the metrópole of the generation 19, 23 people with no way out): by hand, outside a straight run of the line of a town
//      with no wall, a free tile P against the line, a house H of another town beyond it and five more round the two — P's only
//      way the line's tile. (a) planned with them there: a way of the plan opens P; (b) the wall raised at once without them, and
//      the houses finished after: the way is cut at once (a neighbour's wall is judged when a building is finished by it);
//      (c) the old save — the same wall whole, the way walled up by hand, P shut —: loaded and lived an instant, the way is
//      open again, and the checker clean
{
  const nm = '12d a casa de outra cidade num bolsão que a linha fecharia: o muro abre o caminho — no plano, no prédio que fica pronto e no save de antes';
  let got = null;
  for (const k of ['metropole', 'cidade', 'mega']) {
    M.pronto(k); let S = G.S; const N = G.N, V = G.Village, W = G.W;
    for (const s of [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) {
      const other = [...S.settlements.values()].find(q => q.id !== s.id && q.fac !== s.fac) || [...S.settlements.values()].find(q => q.id !== s.id); const w0 = other && plan(s); if (!w0) continue; const on = new Set(w0.tiles);
      const free = j => j >= 0 && j < N * N && !S.occ[j] && !S.wall[j] && !on.has(j) && S.type[j] >= G.T.SAND && !S.treeAt[j] && !S.objAt[j] && W.ground(j);
      const OUT = { N: -N, S: N, O: -1, L: 1 }, PERP = { N: 1, S: 1, O: N, L: N };
      const g = w0.tiles.find(i => { const sd = sideOf(w0, i); const x = i % N, y = (i / N) | 0; if (sd.length !== 1 || x < 4 || y < 4 || x > N - 5 || y > N - 5 || w0.gates.some(q => dist(q, i) < 5)) return false; const o = OUT[sd[0]], p = PERP[sd[0]];
        if (!on.has(i - p) || !on.has(i + p) || !on.has(i - 2 * p) || !on.has(i + 2 * p)) return false;
        return W.ground(i) && free(i - o) && [i + o, i + 2 * o, i + 3 * o, i + o - p, i + o + p, i + 2 * o - p, i + 2 * o + p].every(free); });
      if (g === undefined) continue;
      const sd = sideOf(w0, g)[0], o = OUT[sd], p = PERP[sd]; const P = g + o, H = g + 2 * o; const spots = [H, g + 3 * o, P - p, P + p, H - p, H + p];
      const put = () => sim(() => spots.map(j => V.addBuilding('house', j % N, (j / N) | 0, other.id, true)));
      const inTown = () => { const L = W.reachIds(true); return L[P] >= 0 && L[P] === W.townRegion(s); };
      // (a) the plan, the houses there
      let hs = put(); if (hs.some(h => !h)) { sim(() => hs.forEach(h => h && V.removeBuilding(h))); continue; }
      const w1 = plan(s); const wayA = w1 ? (w1.ways || []).filter(i => dist(i, P) <= 1) : [];
      sim(() => hs.forEach(h => V.removeBuilding(h)));
      // (b) the wall standing, then the houses
      const w = sim(() => G.Siege.raiseWalls(s, 'pedra', true)); if (!w) continue;
      const before = (w.ways || []).filter(i => dist(i, P) <= 1).length; hs = put();
      const wayB = (w.ways || []).filter(i => dist(i, P) <= 1); const openB = wayB.length > 0 && wayB.every(i => S.wall[i] === 2) && inTown(); const badB = QA.check().filter(q => q.sev <= 2).map(q => q.msg);
      // (c) the old save: the way walled up, saved, loaded, lived an instant
      for (const i of wayB) { S.wall[i] = 1; } w.gates = w.gates.filter(q => !wayB.includes(q)); w.ways = (w.ways || []).filter(q => !wayB.includes(q)); G.W.touchWalk();
      const shutC = !inTown(); const sid = s.id; M.salvarCarregar(); S = G.S; M.viver(0.3);
      const s1 = S.settlements.get(sid), w2 = G.Siege.wallOf(sid); const L = W.reachIds(true); const openC = !!w2 && (w2.ways || []).some(i => dist(i, P) <= 1 && S.wall[i] === 2) && L[P] >= 0 && L[P] === W.townRegion(s1);
      const badC = QA.check().filter(q => q.sev <= 2 || /fecha \d+ prédio|não deixa passar/.test(q.msg)).map(q => q.msg);
      got = { k, name: s.name, other: other.name, P, sd, wayA, before, wayB, openB, badB, shutC, openC, badC }; break;
    }
    if (got) break;
  }
  if (!got) ok(nm, false, 'em nenhum mundo pronto um trecho reto de plano com chão livre para o bolsão de mentira');
  else { const N = G.N, at = i => `(${i % N},${(i / N) | 0})`;
    ok(nm, got.wayA.length > 0 && !got.before && got.openB && !got.badB.length && got.shutC && got.openC && !got.badC.length,
      `${got.k}: ${got.name}, lado ${got.sd}; seis casas de ${got.other} em volta de ${at(got.P)}. (a) no plano: ${got.wayA.length ? 'um caminho em ' + got.wayA.map(at).join(' ') : 'NENHUM CAMINHO'}; (b) o muro de pé (sem caminho ali: ${got.before ? 'NÃO' : 'sim'}), as casas prontas depois: ${got.openB ? 'o caminho aberto em ' + got.wayB.map(at).join(' ') : 'FECHADO'}${got.badB.length ? '; VERIFICADOR: ' + got.badB[0] : ''}; (c) o save de antes (${got.shutC ? 'o bolsão fechado' : 'O BOLSÃO NÃO FECHOU'}), carregado: ${got.openC ? 'aberto' : 'FECHADO'}${got.badC.length ? '; VERIFICADOR: ' + got.badC[0] : ', verificador limpo'}`); }
}
// 13. no wall before another town's gate (L-806): 13a in every plan of the ready worlds; 13b–13d by hand — a straight run of the
//     line of a town with no wall, free ground before it, and there a gate of another town's wall (three tiles along the line,
//     the gate in the middle): planned again, raised by the builders after it, and in a save of before
{
  let plans = 0; const bad = [];
  for (const k of WORLDS) { M.pronto(k); const S = G.S, N = G.N;
    for (const s of [...S.settlements.values()].filter(q => G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) { const w = plan(s); if (!w) continue; plans++;
      for (const i of w.tiles) if (G.Siege.frontOfGate(i, s.id) && bad.length < 4) bad.push(`${k}: ${s.name} (${i % N},${(i / N) | 0})`); } }
  ok('13a nenhum plano diante do portão de outra cidade (L-806)', plans > 0 && !bad.length, `${plans} planos nos mundos prontos (${WORLDS.join(', ')}); casas diante do portão de outra cidade: ${bad.length ? bad.join(', ') : 'nenhuma'}`);
}
{
  const at = i => `(${i % G.N},${(i / G.N) | 0})`;
  // (in a fresh world: a town with no wall and a straight run t of its plan, far from its gates, with free ground before it)
  const gateCase = () => {
    for (const k of ['metropole', 'cidade', 'mega']) {
      M.pronto(k); const S = G.S, N = G.N, W = G.W;
      for (const s of [...S.settlements.values()].filter(q => !G.Siege.wallOf(q.id) && G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) {
        const other = [...S.settlements.values()].find(q => q.id !== s.id && q.fac !== s.fac); const w0 = other && plan(s); if (!w0) continue; const on = new Set(w0.tiles);
        const free = j => j >= 0 && j < N * N && !S.occ[j] && !S.wall[j] && !on.has(j) && S.type[j] >= G.T.SAND && !S.treeAt[j] && !S.objAt[j] && W.ground(j);
        const OUT = { N: -N, S: N, O: -1, L: 1 }, PERP = { N: 1, S: 1, O: N, L: N };
        const t = w0.tiles.find(i => { const sd = sideOf(w0, i); const x = i % N, y = (i / N) | 0; if (sd.length !== 1 || x < 5 || y < 5 || x > N - 6 || y > N - 6 || w0.gates.some(q => dist(q, i) < 6)) return false;
          const o = OUT[sd[0]], p = PERP[sd[0]]; return [i - p, i + p, i - 2 * p, i + 2 * p].every(j => on.has(j)) && [i + o, i + o - p, i + o + p, i + 2 * o].every(free); });
        if (t === undefined) continue;
        const sd = sideOf(w0, t)[0];
        return { k, s, other, w0, t, sd, g: t + OUT[sd], p: PERP[sd] };
      }
    }
    return null;
  };
  // (the other town's wall, by hand: three tiles along the line before t, its gate in the middle, standing)
  const fakeGate = c => { const S = G.S, N = G.N; const tiles = [c.g - c.p, c.g, c.g + c.p]; const xs = tiles.map(i => i % N), ys = tiles.map(i => (i / N) | 0);
    const w = { id: S.nextId++, set: c.other.id, fac: c.other.fac, mat: 'pedra', tiles, gates: [c.g], built: 3, done: true, style: 'classico', box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], v: 2 };
    S.walls.push(w); for (const i of tiles) { S.wall[i] = i === c.g ? 2 : 1; S.wallFac[i] = c.other.fac; } G.W.touchWalk(); return w; };
  const shutOf = c => QA.check().filter(q => /não deixa passar|fechado por prédios/.test(q.msg) && q.msg.includes(at(c.g))).map(q => q.msg);
  const s2 = () => QA.check().filter(q => q.sev <= 2).map(q => `S${q.sev} ${q.sys}: ${q.msg}`);
  // 13b — planned again with the gate there: the tile before it left open, the rest of the line the same; raised, it lets through
  { const nm = '13b o portão de outra cidade diante de um trecho reto da linha: a casa diante dele fica aberta, o resto igual';
    const c = gateCase();
    if (!c) ok(nm, false, 'em nenhum mundo pronto um trecho reto de plano, longe dos portões, com chão livre diante dele');
    else { const S = G.S; fakeGate(c); const w1 = plan(c.s); const left = !!w1 && !w1.tiles.includes(c.t);
      const rest = !!w1 && w1.tiles.filter(i => i !== c.t).join() === c.w0.tiles.filter(i => i !== c.t).join();
      const w = sim(() => G.Siege.raiseWalls(c.s, 'pedra', true)); const up = !!w && !!S.wall[c.t]; const shut = shutOf(c), bad = s2();
      ok(nm, left && rest && !!w && !up && !shut.length && !bad.length, `${c.k}: ${c.s.name}, lado ${c.sd} — um portão de ${c.other.name} em ${at(c.g)}, diante de ${at(c.t)}: planejado de novo, ${left ? 'a casa fica aberta' : 'O PLANO PÕE MURO NELA'}, ${rest ? 'o resto da linha igual' : 'A LINHA MUDOU'}; erguido de uma vez: ${up ? 'MURO ALI' : 'aberta'}; o portão de fora ${shut.length ? 'NÃO DEIXA PASSAR — ' + shut[0] : 'deixa passar'}${bad.length ? '; ' + bad[0] : ''}`); } }
  // 13c — the other gate after the plan: the builders, tile by tile, leave the tile open
  { const nm = '13c o portão de outra cidade vem depois do plano: os construtores deixam aberta a casa diante dele';
    const c = gateCase();
    if (!c) ok(nm, false, 'em nenhum mundo pronto um trecho reto de plano, longe dos portões, com chão livre diante dele');
    else { const S = G.S; const w = sim(() => G.Siege.raiseWalls(c.s, 'pedra', false)); const had = !!w && w.tiles.includes(c.t); fakeGate(c);
      const f = G.Fac.get(c.s.fac); if (w) G.Depot.make('f:' + f.id, w.mat === 'pedra' ? 'stone' : 'wood', 400, { code: 'teste' });
      let n = 0; while (w && !w.done && n++ < 6000) G.debug.step(0.1);
      const up = !!S.wall[c.t], raised = w ? w.tiles.filter(i => i !== c.t && S.wall[i]).length : 0; const shut = shutOf(c);
      ok(nm, had && !!w && w.done && !up && raised > 10 && !shut.length, `${c.k}: ${c.s.name}, lado ${c.sd} — o plano com ${at(c.t)} (${had ? 'sim' : 'NÃO'}), e depois um portão de ${c.other.name} em ${at(c.g)}: ${w && w.done ? 'erguido em ' + (n / 10).toFixed(1) + ' s' : 'NÃO TERMINOU'}, ${raised} casas de muro de pé; ${at(c.t)} ${up ? 'MURADA' : 'aberta'}; o portão de fora ${shut.length ? 'NÃO DEIXA PASSAR — ' + shut[0] : 'deixa passar'}`); } }
  // 13d — the old save: the tile walled before the other gate; loaded, it comes down
  { const nm = '13d um muro de antes do L-806 de pé num save, a casa diante do portão de outra cidade murada: carregado, ela desce';
    const c = gateCase();
    if (!c) ok(nm, false, 'em nenhum mundo pronto um trecho reto de plano, longe dos portões, com chão livre diante dele');
    else { let S = G.S; const sid = c.s.id; const w = sim(() => G.Siege.raiseWalls(c.s, 'pedra', true)); const walled = !!w && S.wall[c.t] === 1; fakeGate(c);
      const before = shutOf(c); M.salvarCarregar(); S = G.S; M.viver(0.3);
      const w2 = G.Siege.wallOf(sid); const after = shutOf(c), bad = s2(); const stands = w2 ? w2.tiles.filter(i => i !== c.t && S.wall[i]).length : 0;
      ok(nm, walled && before.length > 0 && !S.wall[c.t] && stands > 10 && !after.length && !bad.length, `${c.k}: ${c.s.name}, lado ${c.sd} — o muro inteiro com ${at(c.t)} ${walled ? 'murada' : 'NÃO MURADA'}, um portão de ${c.other.name} em ${at(c.g)}: antes do load o verificador ${before.length ? 'acusa — ' + before[0] : 'NÃO ACUSA'}; carregado: ${at(c.t)} ${S.wall[c.t] ? 'AINDA MURADA' : 'aberta'}, ${stands} casas do muro de pé, o portão ${after.length ? 'NÃO DEIXA PASSAR' : 'deixa passar'}${bad.length ? '; ' + bad[0] : ''}`); } }
}
{ const bad = QA.check().filter(q => q.sev <= 2); const e = M.erros(); ok('5 verificador e erros de módulo', !bad.length && !Object.keys(e.mod).length, bad.length ? bad.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : `limpo; erros de módulo: ${JSON.stringify(e.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
