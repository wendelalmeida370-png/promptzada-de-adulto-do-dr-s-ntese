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
//   3. Jelling (anos100) planned again: a gate on its west side
//   4. a wall begun, saved and loaded halfway: the same tiles, the same gates; and then finished, its gates are gates on the map
//   5. the checker clean, no module error
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | muros ${name} | ${info}`); if (!c) fails.push(name); };
const WORLDS = (process.argv[2] || 'cidade,metropole,mega,mundial,anos100').split(',');
// (a plan made the way the world makes it, without keeping it: Siege.raiseWalls with the town's own wall record set aside)
const plan = s => { const S = G.S; const keep = S.walls; S.walls = keep.filter(w => w.set !== s.id); const id0 = S.nextId; const w = G.Siege.raiseWalls(s, null, false); S.walls = keep; S.nextId = id0; return w; };
const sideOf = (w, i) => { const N = G.N, [x0, y0, x1, y1] = w.box, x = i % N, y = (i / N) | 0; const out = []; if (x === x0) out.push('O'); if (x === x1) out.push('L'); if (y === y0) out.push('N'); if (y === y1) out.push('S'); return out; };
const dist = (i, j) => { const N = G.N; return Math.abs((i % N) - (j % N)) + Math.abs(((i / N) | 0) - ((j / N) | 0)); };
let plans = 0, bad1 = [], bad2 = [], worst = '';
for (const k of WORLDS) {
  M.pronto(k); const S = G.S;
  for (const s of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
    if (!G.Fac.get(s.fac)) continue;
    const w = plan(s); if (!w) continue; plans++;
    const name = `${k}: ${s.name} (#${s.id})`;
    // 1. each side its gate (or one at its corner), none side by side, at most four
    const sides = {}; for (const i of w.tiles) for (const sd of sideOf(w, i)) (sides[sd] = sides[sd] || []).push(i);
    const walked = i => S.road[i] || S.wear[i] > 22;
    const miss = Object.keys(sides).filter(sd => { if (w.gates.some(g => sideOf(w, g).includes(sd))) return false; const ways = sides[sd].filter(walked); return !ways.length || !ways.every(i => w.gates.some(g => dist(i, g) <= 3)); });
    const close = w.gates.some((g, a) => w.gates.some((h, b) => a < b && dist(g, h) < 4));
    if (miss.length || close || w.gates.length > 4) bad1.push(`${name}: lados sem portão ${miss.join('') || '-'}${close ? ', portões lado a lado' : ''}${w.gates.length > 4 ? ', ' + w.gates.length + ' portões' : ''}`);
    // 2. a side a street or a worn path crosses has its gate on one (where the people walk — the planner's own test)
    for (const sd of Object.keys(sides)) {
      const ways = sides[sd].filter(walked); if (!ways.length) continue;
      const g = w.gates.filter(q => sideOf(w, q).includes(sd)); if (g.length && !g.some(walked)) bad2.push(`${name}, lado ${sd}: ${ways.length} casa(s) de rua ou caminho, o portão fora deles`);
    }
    if (!worst && w.gates.length) worst = `${name}: ${w.tiles.length} casas de muro, ${w.gates.length} portões (${w.gates.map(g => sideOf(w, g).join('')).join(' ')})`;
  }
  if (k === 'anos100') {
    // 3. Jelling planned again: a gate on the west side
    const je = [...S.settlements.values()].find(s => s.name === 'Jelling'); const w = je && plan(je);
    const west = w ? w.gates.filter(g => sideOf(w, g).includes('O')) : [];
    ok('3 Jelling planejada de novo: um portão no lado oeste', !!w && west.length > 0, w ? `caixa ${JSON.stringify(w.box)}; portões ${w.gates.map(g => `(${g % G.N},${(g / G.N) | 0})${sideOf(w, g).join('')}`).join(' ')}` : 'sem plano');
  }
}
ok('1 cada lado o seu portão, nunca lado a lado, no máximo quatro', plans > 20 && !bad1.length, `${plans} muros planejados em ${WORLDS.length} mundos; ${bad1.length} com falta: ${bad1.slice(0, 4).join(' · ') || 'nenhum'}${worst ? ' · ex.: ' + worst : ''}`);
ok('2 o portão do lado fica onde se anda (a rua ou o caminho gasto que o cruza)', !bad2.length, bad2.slice(0, 4).join(' · ') || `${plans} muros, nenhum lado com o portão fora de onde se anda`);
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
    // (the tiles raised so far, on the map: a gate of the plan is a gate there, any other a wall)
    const up = w1 ? w1.tiles.filter(i => S.wall[i]) : []; const wrong = up.filter(i => (w1.gates.includes(i) ? !(S.wall[i] === 2 || S.wall[i] === 4) : S.wall[i] !== 1) && S.wall[i] !== 3);
    ok('4 um muro começado, salvo e carregado no meio: as mesmas casas e os mesmos portões, e no mapa o que o plano diz', built > 0 && same && !wrong.length, `${s.name}: ${w0.tiles.length} casas, ${w0.gates.length} portões; ${built} feitas antes do save${same ? '' : ' — mudou no load'}; no mapa ${up.length} de pé, ${wrong.length} fora do plano`);
  }
}
// 5. the checker, the module errors
{ const bad = QA.check().filter(q => q.sev <= 2); const e = M.erros(); ok('5 verificador e erros de módulo', !bad.length && !Object.keys(e.mod).length, bad.length ? bad.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : `limpo; erros de módulo: ${JSON.stringify(e.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
