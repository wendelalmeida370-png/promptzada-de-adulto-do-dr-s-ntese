// bicho-dentro: node qa/bicho-dentro.js [mundo,mundo...] — nenhum bicho no chão dentro de um prédio que bloqueia (L-631).
// Reproduzido na metrópole e na guerra mundial vividas 700 s: as aves de água rasa (garça, cegonha, flamingo, ganso) atravessavam
// os prédios a pé — o andar de uma ave não perguntava o que estava no caminho — e pousavam dentro deles; o cavalo de carga de uma
// caravana ficava em cima da fogueira onde foi deixado (o «curral» dele é o depósito do mercador, 550 s); a ave no chão não saía
// de baixo de um prédio novo. Ficam, de propósito: o pombo da cidade no telhado da casa dele, a ave em voo, a ave na árvore. A
// gaivota no poleiro, não: o poleiro dela é o chão ou a água onde o voo acaba, na altura 0 (L-809).
//   b1 os mundos vividos 300 s cada um: a cada segundo, nenhum bicho no chão dentro de um prédio que bloqueia;
//   b2 de propósito, a garça andando com uma casa no caminho: não passa por dentro;
//   b3 a garça que pousa onde um prédio ficou: desce ao lado;
//   b4 um prédio posto em cima de uma garça no chão: ela sai de baixo;
//   b5 o cavalo de carga deixado numa fogueira: fica no chão diante dela, não em cima;
//   b6 o verificador limpo (S0–S2) e sem a linha do bicho dentro de prédio; nenhum erro de módulo;
//   b7 o bicho levado pela corda, deixado longe, por quem está dentro de um prédio: vem para o lado do prédio, nunca para dentro
//      (L-729: o peru da festa de Tenochtitlan foi posto onde estava quem o levava — dentro do armazém — e ficou lá 19 s).
//   b8 o abutre que desce numa carcaça debaixo de um teto: pousa ao lado dela, no chão onde fica — nunca na carcaça, dentro do
//      prédio (L-730: um abutre do mundial pousou na carcaça dentro de um mercado);
//   b10 a gaivota que acaba o voo sobre um prédio que bloqueia: não se senta dentro dele — senta-se, sim, no chão aberto ao lado
//      (L-809: as gaivotas da mega sentavam no chão de uma doca e de um mercado, na altura 0, e o verificador tomava o poleiro
//      por um telhado; um save mostrou uma dentro da doca);
//   b11 um prédio posto debaixo de uma gaivota sentada no chão: ela levanta voo (L-809);
//      (o b7 a b11 rodam antes da linha do b6, que olha o verificador depois deles)
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | bicho-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the proof's own reading: on the ground, not in flight nor on its roof, on a tile of a building that blocks)
// (the gull's perch is the ground where it is, at the height 0 — no roof: L-809)
const FLY = { fly: 1, dive: 1, fishdive: 1, circle: 1, tree: 1, swing: 1 };
const dentro = a => { const S = G.S, N = G.N; const sp = G.Animals.DEF[a.kind]; if (!sp || a.dead || a.held || a.caught || a.air || sp.cls === 'water' || a.kind === 'pombo' || FLY[a.state] || a.perch || a.nest || (a.z || 0) > 0.25) return null;
  if (!(a.x >= 0 && a.y >= 0 && a.x < N && a.y < N)) return null; const o = S.occ[(a.y | 0) * N + (a.x | 0)]; const b = o && S.buildings.get(o); return b && b.blocks ? b : null; };
const WORLDS = (process.argv[2] || 'metropole,mundial').split(',');
// (ONLY=b2: without the five minutes of the lived worlds — the cases of the hand, b2 to b9, and the checker, always)
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
// b1
if (!ONLY || ONLY.includes('b1')) { const said = [], bad = [];
  for (const k of WORLDS) { M.pronto(k); const S = G.S; const seen = new Map();
    // (from the third second on: a world saved before the fix may open with a bird on the ground inside a building — a heron of
    // the mundial of the generation 19 in a mine —, and it walks out by itself)
    for (let s = 0; s < 300; s++) { M.viver(1); if (s < 3) continue; for (const a of S.animals.values()) { const b = dentro(a); if (b) { const q = seen.get(a.id) || { n: 0, t: `${a.kind}#${a.id} (${a.state}) em ${b.type}#${b.id}` }; q.n++; seen.set(a.id, q); } } }
    said.push(`${k}: ${S.animals.size} bichos, ${seen.size} dentro de prédio em algum segundo`); for (const q of seen.values()) bad.push(`${k}: ${q.t}, ${q.n} s`); }
  ok('b1 os mundos vividos 300 s: nenhum bicho no chão dentro de um prédio que bloqueia', !bad.length, `${said.join(' · ')}${bad.length ? ' — ' + bad.slice(0, 4).join('; ') : ''}`); }
// b2–b5, na metrópole
{ M.pronto('metropole'); const S = G.S, N = G.N, W = G.W, A = G.Animals, V = G.Village;
  const free = (x, y) => W.inb(x, y) && !S.occ[y * N + x] && W.walkableXY(x + 0.5, y + 0.5) && S.type[y * N + x] >= G.T.SAND && !S.treeAt[y * N + x] && !S.objAt[y * N + x];
  // a house of one tile with free ground west and east of it
  const hs = [...S.buildings.values()].filter(b => b.built && b.blocks && b.w === 1 && b.h === 1 && free(b.x - 1, b.y) && free(b.x + 1, b.y) && free(b.x - 2, b.y) && free(b.x + 2, b.y)).sort((a, b) => a.id - b.id);
  const h = hs[0];
  if (!h) ok('b2 a garça andando com uma casa no caminho', false, 'nenhuma casa de uma casa com chão livre dos dois lados');
  else {
    // b2: on its feet, the house in the way
    const g = sim(() => A.spawn('heron', h.x - 1 + 0.5, h.y + 0.5, { grown: 1, age: 2, hunger: 0.1 })); g.state = 'wade'; g.z = 0; g.tx = h.x + 1 + 0.5; g.ty = h.y + 0.5; let in2 = 0;
    for (let s = 0; s < 150; s++) { M.viver(0.1); if (g.state === 'idle' || g.state === 'fly') { g.t = 99; } if (dentro(g) || (g.x | 0) === h.x && (g.y | 0) === h.y && (g.z || 0) < 0.25 && !FLY[g.state]) in2++; }
    ok('b2 a garça andando com uma casa no caminho: não passa por dentro', in2 === 0, `${h.type}#${h.id} em ${h.x},${h.y}; a garça de ${h.x - 1} para ${h.x + 1}: ${in2 ? in2 + ' PASSOS DENTRO' : 'nunca dentro'}; no fim em ${g.x.toFixed(1)},${g.y.toFixed(1)}, ${g.state}`);
    // b3: coming down on the house
    g.state = 'fly'; g.z = 6; g.t = 0; g.x = h.x - 3 + 0.5; g.y = h.y + 0.5; g.tx = h.x + 0.5; g.ty = h.y + 0.5; let in3 = 0, landed = false;
    for (let s = 0; s < 200 && !landed; s++) { M.viver(0.1); if (dentro(g)) in3++; if (g.state === 'idle') landed = true; }
    ok('b3 a garça que pousa onde um prédio ficou: desce ao lado', landed && !in3 && !dentro(g), `${landed ? 'pousou em ' + g.x.toFixed(1) + ',' + g.y.toFixed(1) : 'NÃO POUSOU'}; ${in3 ? in3 + ' PASSOS DENTRO' : 'nunca dentro'}`);
    // b4: a building put down on it
    const sp = [h.x + 2, h.y]; g.state = 'idle'; g.z = 0; g.t = 60; g.x = sp[0] + 0.5; g.y = sp[1] + 0.5; g.tx = g.x; g.ty = g.y;
    const nb = sim(() => V.addBuilding('house', sp[0], sp[1], h.set, true)); const in4 = !!dentro(g);
    ok('b4 um prédio posto em cima de uma garça no chão: ela sai de baixo', !!nb && !in4, nb ? `house#${nb.id} em ${sp[0]},${sp[1]}; a garça em ${g.x.toFixed(1)},${g.y.toFixed(1)}: ${in4 ? 'DENTRO' : 'fora'}` : 'a casa não foi posta');
  }
  // b5: the pack horse left at a fire
  const cf = [...S.buildings.values()].filter(b => b.built && b.blocks && (b.type === 'campfire' || b.type === 'storehouse') && free(b.x, b.y + b.h)).sort((a, b) => (a.type === 'campfire' ? 0 : 1) - (b.type === 'campfire' ? 0 : 1) || a.id - b.id)[0];
  if (!cf) ok('b5 o cavalo de carga deixado numa fogueira', false, 'nenhuma fogueira nem armazém com chão livre diante');
  else { const fac = V.facOfSet(cf.set); const hz = sim(() => A.spawn('cavalo', cf.x + cf.w / 2, cf.y + cf.h + 0.5, { dom: fac, grown: 1, age: 4, hunger: 0.1, state: 'pen', pen: cf.id })); let in5 = 0, far = 0;
    for (let s = 0; s < 400; s++) { M.viver(0.1); if (dentro(hz)) in5++; if (G.dist(hz.x, hz.y, cf.x + cf.w / 2, cf.y + cf.h + 0.5) > 2.5) far++; }
    ok('b5 o cavalo de carga deixado numa fogueira: fica no chão diante dela, não em cima', !in5 && !far && hz.pen === cf.id, `${cf.type}#${cf.id} em ${cf.x},${cf.y}; o cavalo 40 s: ${in5 ? in5 + ' PASSOS EM CIMA' : 'nunca em cima'}, ${far ? far + ' PASSOS LONGE' : 'sempre ao lado'}; no fim em ${hz.x.toFixed(1)},${hz.y.toFixed(1)}`); }
  // b7: led on a rope, from far, by one inside a building (L-729): the beast left far behind is brought to its leader — and with
  // him inside, beside the building, never onto his spot inside it. The hand of the proof leads a turkey from sixteen tiles off
  // while standing in a storehouse (its errand named among the ones that lead a beast, as a module names its own: A.LEADS)
  const sh = [...S.buildings.values()].filter(b => b.built && b.blocks && b.type === 'storehouse' && b.w >= 2 && b.h >= 2).sort((a, b) => a.id - b.id)[0];
  const lv = sh && [...S.villagers.values()].filter(q => q.set === sh.set && q.age >= 18 && q.age < 55 && !q.captive && !q.aboard && !q.jail && !q.ug && !(S.avatar && S.avatar.id === q.id)).sort((a, b) => a.id - b.id)[0];
  const mid = sh && [sh.x + sh.w / 2, sh.y + sh.h / 2];
  const far = mid && W.nearestLand(mid[0] + 16, mid[1], 8, (px, py) => G.dist(px, py, mid[0], mid[1]) > 14);
  if (!sh || !lv || !far) ok('b7 o bicho levado de longe por quem está dentro de um prédio: vem para o lado do prédio, nunca para dentro', false, `armazém ${sh ? sh.id : 'nenhum'}; quem leva ${lv ? lv.name : 'ninguém'}; chão longe ${far ? 'sim' : 'não'}`);
  else {
    const pk = sim(() => A.spawn('peru', far[0], far[1], { dom: V.facOfSet(sh.set), grown: 1, age: 2, hunger: 0.1, state: 'led' })); pk.ledBy = lv.id;
    const L0 = A.LEADS.idle; A.LEADS.idle = (t, a) => t.lead === a.id;
    const hold = () => sim(() => { if (!lv.task || lv.task.type !== 'idle' || lv.task.lead !== pk.id) { G.Vg.endTask(lv); G.Vg.setTask(lv, { type: 'idle', wait: 1e4, lead: pk.id, stay: sh.id, pri: 9 }); } lv.inside = sh.id; lv.x = mid[0]; lv.y = mid[1]; lv.path = null; lv.moving = false; });
    let in7 = 0, d0 = G.dist(pk.x, pk.y, mid[0], mid[1]);
    for (let k = 0; k < 30; k++) { hold(); M.viver(0.1); if (dentro(pk)) in7++; }
    const near = G.dist(pk.x, pk.y, mid[0], mid[1]); const led = pk.state === 'led' && pk.ledBy === lv.id;
    if (L0) A.LEADS.idle = L0; else delete A.LEADS.idle;
    sim(() => { G.Vg.endTask(lv); lv.inside = 0; const q = V.frontTile ? V.frontTile(sh) : null; if (q) { lv.x = q[0] + 0.5; lv.y = q[1] + 0.5; } pk.state = 'pen'; pk.ledBy = 0; });
    ok('b7 o bicho levado de longe por quem está dentro de um prédio: vem para o lado do prédio, nunca para dentro', !in7 && near < d0 && near <= Math.max(sh.w, sh.h) / 2 + 2.5 && led,
      `${lv.name} levando um peru, de dentro do ${sh.type}#${sh.id} (${sh.x},${sh.y} ${sh.w}x${sh.h}); o peru a ${d0.toFixed(1)}: ${in7 ? in7 + ' PASSOS DENTRO do armazém' : 'nunca dentro'}; no fim a ${near.toFixed(1)} do meio do armazém, em ${pk.x.toFixed(1)},${pk.y.toFixed(1)}${led ? '' : ' (não estava mais sendo levado)'}`);
  }
  // b8: the vulture that comes down on a carcass under a roof (L-730): beside it, on ground it stands on — never onto the carcass
  // inside the building. The hand of the proof lays a dead deer in the middle of the storehouse and a hungry vulture spiralling
  // over it, at the end of its circles
  if (!sh) ok('b8 o abutre que desce numa carcaça debaixo de um teto: pousa ao lado, nunca dentro', false, 'nenhum armazém de 2x2');
  else {
    const dc = sim(() => A.spawn('deer', mid[0], mid[1], { grown: 1, age: 3 })); sim(() => A.kill(dc, null, 'other')); dc.meat = Math.max(dc.meat || 0, 6);
    const vu = sim(() => A.spawn('vulture', mid[0] + 3, mid[1], { grown: 1, age: 3, hunger: 0.6 })); vu.state = 'circle'; vu.target = dc.id; vu.t = 0.05; vu.z = 0.5; vu.scan = 9;
    let in8 = 0, landed = null;
    for (let k = 0; k < 30; k++) { M.viver(0.1); if (dentro(vu)) in8++; if (!landed && vu.state === 'eat') landed = [vu.x, vu.y]; }
    const dd = landed ? G.dist(landed[0], landed[1], dc.x, dc.y) : -1;
    ok('b8 o abutre que desce numa carcaça debaixo de um teto: pousa ao lado, nunca dentro', !in8 && !!landed && dd <= 2.5,
      `um cervo morto no meio do ${sh.type}#${sh.id}; o abutre: ${landed ? `pousou a ${dd.toFixed(1)} dele, em ${landed[0].toFixed(1)},${landed[1].toFixed(1)}` : 'NÃO pousou'}; ${in8 ? in8 + ' PASSOS DENTRO do armazém' : 'nunca dentro'}`);
    sim(() => { A.remove(vu); A.remove(dc); });
  }
  // b9: the beaver's last strides to the tree it gnaws (L-762): within three tiles of it the beaver went straight to the tree,
  // written into its position (nests.js), through whatever stood between — in the mundial of the generation 20 a beaver went
  // through a dock and another through a house. The hand of the proof finds a building of one tile with the beaver's ground on
  // both sides (by the water), plants a young tree on one side and puts a beaver on the other, still in its idle, with a dam by
  // it (the record the beaver itself makes, nests.js) and that tree its own to gnaw. A beaver flees people and its hunters (its
  // fear, three tiles): the place is one with nobody out of doors near, and a beaver that fled in the middle leaves the case to
  // the next place, up to six
  {
    const bv = { kind: 'beaver' }; const free9 = (x, y) => free(x, y) && !S.road[y * N + x];
    const hunters = new Set(A.eatenBy.beaver || []);
    const quiet = p => ![...S.villagers.values()].some(o => !o.inside && !o.aboard && !o.held && !o.air && G.dist(o.x, o.y, p[0], p[1]) < 4.5) && ![...S.animals.values()].some(o => !o.dead && hunters.has(o.kind) && G.dist(o.x, o.y, p[0], p[1]) < 6);
    const places = [];
    for (const b of [...S.buildings.values()].filter(q => q.built && q.blocks && q.w === 1 && q.h === 1).sort((p, q) => p.id - q.id)) {
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const w1 = [b.x - dx, b.y - dy], e1 = [b.x + dx, b.y + dy]; if (!free9(...w1) || !free9(...e1)) continue;
        const at = [w1[0] + 0.5, w1[1] + 0.5], spot = [e1[0] + 0.9, e1[1] + 0.8];
        if (A.walkOK(bv, ...at) && A.walkOK(bv, ...spot)) { places.push({ b, e1, at }); break; }
      }
    }
    let said = '', live9 = false, bad9 = false; const fled = [];
    for (const c9 of places) {
      if (live9 || bad9 || fled.length >= 6) break; if (!quiet(c9.at)) continue;
      const { b, e1, at } = c9; const i9 = e1[1] * N + e1[0];
      let kind = G.Biome.pickTree(G.Biome.of(i9)); if (!G.Biome.canGrow(kind, i9)) kind = 'oak';
      const tr = sim(() => G.Nature.addTree(e1[0] + 0.5, e1[1] + 0.5, kind, 0.7)); if (!tr) continue;
      const cb = sim(() => A.spawn('beaver', at[0], at[1], { grown: 1, age: 2, hunger: 0.1 }));
      const dam = { id: S.nextId++, x: at[0], y: at[1], prog: 0, trees: 0 }; (S.dams || (S.dams = [])).push(dam);
      cb.state = 'idle'; cb.t = 99; cb.dam = dam.id; cb.gnawTree = tr.id; cb.gnawT = 0;
      const d0 = G.dist(cb.x, cb.y, tr.x + 0.4, tr.y + 0.3); let in9 = 0, kept = 0, gnaw = 0, ran = false;
      for (let k = 0; k < 60; k++) { if (cb.state === 'idle') cb.t = 99; M.viver(0.1); if (dentro(cb)) in9++; if (cb.state === 'flee') ran = true; if (cb.gnawTree === tr.id) kept++; if (cb.gnawT > 0) gnaw++; }
      const txt = `${b.type}#${b.id} em ${b.x},${b.y}; a árvore #${tr.id} de um lado, o castor do outro, a ${d0.toFixed(1)} dela: ${in9 ? in9 + ' PASSOS DENTRO do prédio' : 'nunca dentro'}; ${cb.gnawTree === tr.id ? (gnaw ? 'chegou e roeu' : 'ainda com a árvore, sem roer') : `largou a árvore (${(kept / 10).toFixed(1)} s com ela)`}; no fim em ${cb.x.toFixed(1)},${cb.y.toFixed(1)}`;
      sim(() => { A.remove(cb); G.Nature.removeTree(tr); S.dams.splice(S.dams.indexOf(dam), 1); });
      if (in9 || !(d0 > 0.5 && d0 <= 3)) { bad9 = true; said = txt; } else if (ran) fled.push(`${b.type}#${b.id}`); else { live9 = true; said = txt; }
    }
    ok('b9 o castor indo à árvore que rói, com um prédio no meio: nunca por dentro', live9 && !bad9,
      (said || `nenhum lugar quieto onde o caso vivesse (${places.length} prédios de uma casa com o chão do castor dos dois lados)`) + (fled.length ? ` (antes, o castor fugiu em ${fled.join(', ')})` : ''));
  }
  // b10: thirty gulls at the end of a flight over the storehouse, each over a tile of it, and thirty over the open ground beside
  // it (L-809). At the end of a flight a gull sits down now and then where it is (its perch, at the height 0): over the
  // storehouse never, over the open ground some of them. b11: a house put down under a gull sitting on the ground (L-809)
  const open10 = []; if (sh) for (let r = 2; r <= 14 && open10.length < 2; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || open10.length >= 2) continue; const x = sh.x + dx, y = sh.y + dy;
    if (free(x, y) && !S.road[y * N + x] && !open10.some(q => Math.abs(q[0] - x) + Math.abs(q[1] - y) < 4)) open10.push([x, y]); }
  if (!sh || open10.length < 2) ok('b10 a gaivota que acaba o voo sobre um prédio: não se senta dentro dele', false, `armazém ${sh ? sh.id : 'nenhum'}; chão aberto ao lado: ${open10.length}`);
  else {
    const flock = (at, n) => { const l = []; for (let k = 0; k < n; k++) { const x = at(k)[0], y = at(k)[1]; const g = sim(() => A.spawn('gull', x, y, { grown: 1, age: 3, hunger: 0.1 }));
      g.state = 'fly'; g.z = 6; g.tx = x; g.ty = y; g.t = 0; g.leader = 0; l.push({ g, x, y, sat: false, inn: 0, went: false }); } return l; };
    const over = flock(k => [sh.x + ((k % 6) + 0.5) * sh.w / 6, sh.y + (((k / 6) | 0) + 0.5) * sh.h / 5], 30);
    const side = flock(k => [open10[0][0] + 0.15 + (k % 6) * 0.14, open10[0][1] + 0.15 + ((k / 6) | 0) * 0.17], 30);
    for (let t = 0; t < 15; t++) { M.viver(0.1); for (const q of over.concat(side)) { const g = q.g; if (g.state === 'perch') { q.sat = true; if (S.occ[W.idx(g.x, g.y)] === sh.id) q.satIn = true; } if (dentro(g)) q.inn++; if (g.tx !== q.x || g.ty !== q.y) q.went = true; } }
    const inn = over.filter(q => q.inn).length, satO = over.filter(q => q.satIn).length, wentO = over.filter(q => q.went).length;
    const satS = side.filter(q => q.sat).length, innS = side.filter(q => q.inn).length;
    sim(() => { for (const q of over.concat(side)) A.remove(q.g); });
    ok('b10 a gaivota que acaba o voo sobre um prédio que bloqueia: não se senta dentro dele, e no chão aberto ao lado, sim', !inn && !satO && wentO >= 25 && satS > 0 && !innS,
      `${sh.type}#${sh.id} (${sh.x},${sh.y} ${sh.w}x${sh.h}): das 30 gaivotas sobre ele, ${satO ? satO + ' SENTARAM NELE' : 'nenhuma sentou nele'}, ${inn ? inn + ' DENTRO DO PRÉDIO' : 'nenhuma no chão dentro'}, ${wentO} voaram adiante (${over.filter(q => q.sat).length} sentaram depois, fora); no chão aberto em ${open10[0][0]},${open10[0][1]}, ${satS} de 30 sentaram${innS ? ', ' + innS + ' DENTRO' : ''}`);
    // b11
    const p11 = open10[1]; const g = sim(() => A.spawn('gull', p11[0] + 0.5, p11[1] + 0.5, { grown: 1, age: 3, hunger: 0.1 }));
    g.state = 'perch'; g.perchZ = 0; g.z = 0; g.t = 60; g.tx = g.x; g.ty = g.y; g.leader = 0;
    const nb = sim(() => V.addBuilding('house', p11[0], p11[1], sh.set, true)); const in11 = !!dentro(g), st11 = g.state; let in11b = 0;
    for (let t = 0; t < 10; t++) { M.viver(0.1); if (dentro(g)) in11b++; }
    ok('b11 um prédio posto debaixo de uma gaivota sentada no chão: ela levanta voo', !!nb && !in11 && !in11b && st11 === 'fly',
      nb ? `house#${nb.id} em ${p11[0]},${p11[1]}; a gaivota: ${st11 === 'fly' ? 'levantou voo' : 'FICOU (' + st11 + ')'}${in11 || in11b ? ', DENTRO da casa ' + (in11b + (in11 ? 1 : 0)) + ' vezes' : ', nunca dentro'}` : 'a casa não foi posta');
    sim(() => A.remove(g));
  }
  const v = QA.check().filter(q => q.sev <= 2 || /no chão dentro de um prédio/.test(q.msg)); const e = M.erros();
  ok('b6 verificador e erros de módulo', !v.length && M.limpo(), `${v.length} violações${v.length ? ': ' + v[0].msg : ''}; erros de módulo ${JSON.stringify(e.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
