// bicho-dentro: node qa/bicho-dentro.js [mundo,mundo...] — nenhum bicho no chão dentro de um prédio que bloqueia (L-631).
// Reproduzido na metrópole e na guerra mundial vividas 700 s: as aves de água rasa (garça, cegonha, flamingo, ganso) atravessavam
// os prédios a pé — o andar de uma ave não perguntava o que estava no caminho — e pousavam dentro deles; o cavalo de carga de uma
// caravana ficava em cima da fogueira onde foi deixado (o «curral» dele é o depósito do mercador, 550 s); a ave no chão não saía
// de baixo de um prédio novo. Ficam, de propósito: o pombo da cidade no telhado da casa dele, a gaivota no poleiro, a ave em voo.
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
//      (o b7 e o b8 rodam antes da linha do b6, que olha o verificador depois deles)
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | bicho-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
// (the proof's own reading: on the ground, not in flight nor on its roof, on a tile of a building that blocks)
const FLY = { fly: 1, dive: 1, fishdive: 1, circle: 1, perch: 1, tree: 1, swing: 1 };
const dentro = a => { const S = G.S, N = G.N; const sp = G.Animals.DEF[a.kind]; if (!sp || a.dead || a.held || a.caught || a.air || sp.cls === 'water' || a.kind === 'pombo' || FLY[a.state] || a.perch || a.nest || (a.z || 0) > 0.25) return null;
  if (!(a.x >= 0 && a.y >= 0 && a.x < N && a.y < N)) return null; const o = S.occ[(a.y | 0) * N + (a.x | 0)]; const b = o && S.buildings.get(o); return b && b.blocks ? b : null; };
const WORLDS = (process.argv[2] || 'metropole,mundial').split(',');
// b1
{ const said = [], bad = [];
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
  const v = QA.check().filter(q => q.sev <= 2 || /no chão dentro de um prédio/.test(q.msg)); const e = M.erros();
  ok('b6 verificador e erros de módulo', !v.length && M.limpo(), `${v.length} violações${v.length ? ': ' + v[0].msg : ''}; erros de módulo ${JSON.stringify(e.mod)}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
