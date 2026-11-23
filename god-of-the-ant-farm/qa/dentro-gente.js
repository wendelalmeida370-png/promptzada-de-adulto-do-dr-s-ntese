// dentro-gente: as pessoas dentro, no desenho (os interiores 2.0, P6; D-750 a D-756). Em Node, pelo 3D do jogo só como geometria
// (qa/visual/tres-node.js): o mundo pronto, a taverna mais cheia à tardinha com o olho no meio dela, quadro a quadro (o passo do mundo
// no tempo do corpo, o Build3D.insideTick, o People3D.update), como o jogo desenha.
//  d1 quem entra é desenhado andando da porta e quem sai sai andando pela porta — nenhum salto —, ninguém desenhado dentro de um móvel
//     nem de uma parede, ninguém de chapéu de rua debaixo de um teto nem na cama (o verificador da vida, G.VidaInv); alguém da rua posto
//     dentro pela mão da prova anda da porta ao lugar;
//  d2 os casos ruins no meio de uma entrada (a mão da prova põe alguém da rua dentro, como o mundo faz): o save e o load, a mão do
//     deus, a morte, o prédio que pega fogo — nenhum erro, a vista recomeça, o caminho de um prédio que caiu é largado;
//  d3 o ato por cima do lugar: a caneca à boca de quem bebe a rodada (a caneca do inventário), nenhum gole sem a caneca; a música sem
//     instrumento é cantada, nunca o alaúde de mentira; a briga de pé; a conversa à mesa por turnos e o taverneiro servindo (o que a
//     taverna do d1 mostrou); o chapéu de sol que sai debaixo de um teto e na cama, o elmo de quem está no posto que fica;
//  d4 o que só se vê só se vê: o mesmo mundo vivido com o desenho de dentro e sem ele dá o mesmo save;
//  d5 a taverna da P7 no desenho (D-757 a D-759, L-1906): o taverneiro com as canecas da rodada nas mãos (nunca uma carga), à mesa
//     virado para o freguês; o músico (posto no estrado pela mão da prova, como a noite da taverna o põe) tocando o instrumento que tem
//     na mão, ninguém tocando sem ele; cada caminho de dentro acabando quando o mundo o acaba (In.passage, t.ww, t.mw); ninguém na
//     soleira com a porta fechada.
//   node qa/dentro-gente.js [mundo]     ONLY=d1,d3 para algumas partes (≈ 3 min inteira)
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M, THREE } = T.load();
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null; const on = k => !ONLY || ONLY.has(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | dentro-gente ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const WORLD = process.argv[2] || 'metropole';
const P3 = G.People3D, B3 = G.Build3D, In = G.Interiors; const TL = G.Space.TILE, RDT = 1 / 30;
// (the inside drawn without a graphics card: a scene and an inner material of its own — Build3D opens the buildings as the game does)
const scene = new THREE.Scene(), MI = new THREE.MeshBasicMaterial(); G.Realm.scene = () => scene; const m0 = G.Realm.mats; G.Realm.mats = () => Object.assign({}, m0 ? m0() : {}, { inner: MI, solid: MI });
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const copy = (o, x) => Object.assign(Object.create(Object.getPrototypeOf(o)), o, x);
let FOCUS = null; const said = [];
const frame = draw => { G.debug.step(RDT * G.Space.TIME); if (draw) { B3.insideTick(RDT, FOCUS); P3.update(RDT, FOCUS); } };
const look = () => { if (G.VidaInv) G.VidaInv((k, sev, msg) => { if (said.length < 8) said.push(msg); }, G.S); };
function open(t0) { M.pronto(WORLD); M.viver(2); let g = 0; while (!(G.S.time > t0 && G.S.time < t0 + 0.02) && g++ < 6000) M.viver(1); P3.clear(); B3.insideClear(); }
// (the tavern with the most people in it or on their way to it)
function tavern() { const S = G.S; const L = [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built && b.ip && In.plan(b) && In.plan(b).ok);
  const n = b => [...S.villagers.values()].filter(v => v.inside === b.id || (v.task && v.task.id === b.id)).length; L.sort((a, c) => n(c) - n(a) || a.id - c.id); return L[0]; }
const jumps = { ent: 0, entJ: 0, ex: 0, exJ: 0, mov: 0, movJ: 0 }; const tops = {}; let pairs = 0, keeperSt = null;
function watch(b, n) {
  const prev = new Map();
  for (let k = 0; k < n; k++) {
    frame(true); if (k % 15 === 0) look();
    for (const v of G.S.villagers.values()) { const s = P3.visOf(v.id); if (!s) { prev.delete(v.id); continue; } const ins = v.inside === b.id, pl = ins ? In.placeOf(v) : null, pk = pl ? pl.item + ':' + pl.q : '';
      const w = prev.get(v.id); if (w) { const j = Math.hypot(s.X - w[0], s.Z - w[1]) > 0.6; if (ins && !w[2]) { jumps.ent++; if (j) jumps.entJ++; } else if (!ins && w[2]) { jumps.ex++; if (j) jumps.exJ++; } else if (ins && w[3] !== pk) { jumps.mov++; if (j) jumps.movJ++; } }
      prev.set(v.id, [s.X, s.Z, ins, pk]); }
    // (what the seated show over their place, the keeper, and two waiting seated side by side — for the d3)
    if (k % 10) continue; const seat = [];
    for (const w of P3.walkers) { const v = G.S.villagers.get(w[7]), s = P3.visOf(w[7]); if (!v || !s || v.inside !== b.id || !s.ap || s.way) continue; if (s.ap.over) tops[s.ap.over] = (tops[s.ap.over] || 0) + 1; if (v.act === 'serve') keeperSt = s.ap.st; if (G.Vida3D.SEATED.has(s.ap.st) && v.task && v.task.type === 'tavern' && v.task.st === 2) seat.push(s); }
    for (let i = 0; i < seat.length; i++) for (let j = i + 1; j < seat.length; j++) if (Math.hypot(seat[i].X - seat[j].X, seat[i].Z - seat[j].Z) < 1.9) pairs++;
  }
}
// (the proof's hand: the nearest one of the street the view draws, set at the tavern's door with the evening's errand to it — the world
// walks them in, the tavern's own way: G.Taverna's customer)
function putIn(b) { const S = G.S; const d = In.door(b); const op = G.Taverna && G.Taverna.dia ? G.Taverna.dia(b) : null; if (!op) return null;
  const v = [...S.villagers.values()].filter(o => P3.visOf(o.id) && !o.inside && o.age >= 16 && !o.held && !o.aboard && !o.sleeping && !o.captive && !o.jail && !P3.wayOf(o.id) && Math.hypot(o.x - d[0], o.y - d[1]) < 12).sort((a, c) => Math.hypot(a.x - d[0], a.y - d[1]) - Math.hypot(c.x - d[0], c.y - d[1]) || a.id - c.id)[0];
  if (!v) return null; god(() => { G.Vg.endTask(v); v.x = d[0]; v.y = d[1]; v.path = null; v.moving = false; v.hunger = 5; v.energy = 90; G.Vg.setTask(v, { type: 'tavern', id: b.id, op: op.id, pri: 0.5, st: 0 }); });
  for (let k = 0; k < 90 && v.inside !== b.id; k++) frame(true); frame(true); return v.inside === b.id ? v : null; }

if (on('d1') || on('d2')) {
  open(0.665); const b = tavern(); FOCUS = { X: (b.x + b.w / 2) * TL, Z: (b.y + b.h / 2) * TL };
  console.log(`(a taverna ${b.id}, ${b.w}×${b.h}, às ${(G.S.time * 24).toFixed(1)} h)`);
  if (on('d1')) {
    const w0 = Object.assign({}, P3.ways); watch(b, 900);
    const v = putIn(b); const wy = v ? P3.wayOf(v.id) : null; watch(b, 150);
    const straight = P3.ways.straight - w0.straight, made = P3.ways.made - w0.made;
    ok('d1 entra e sai andando pela porta, ninguém dentro de um móvel, ninguém de chapéu de rua dentro', jumps.entJ === 0 && jumps.exJ === 0 && jumps.movJ === 0 && !said.length && made > 0 && !!wy && wy.kind === 'in',
      `entradas ${jumps.ent} (${jumps.entJ} aos saltos), saídas ${jumps.ex} (${jumps.exJ} aos saltos), trocas de lugar ${jumps.mov} (${jumps.movJ}); ${made} caminhos feitos, ${straight} com uma perna sem caminho da planta; posto pela mão: ${wy ? 'o caminho «' + wy.kind + '», ' + wy.pts.length + ' pontos, ' + wy.len.toFixed(1) + ' m' : 'NENHUM'}; o verificador: ${said.length ? said.join(' · ') : 'nada'}`);
  }
  if (on('d2')) {
    const errs = [], res = []; const tryF = (k, f) => { try { f(); } catch (e) { errs.push(k + ': ' + e.message); } };
    // (the save and the load in the middle of the way in: the view begins again — no way kept —, the person drawn at the place)
    tryF('o save', () => { const v = putIn(b); if (!v) return res.push('save: ninguém'); for (let k = 0; k < 10; k++) frame(true); const mid = !!P3.wayOf(v.id); M.salvarCarregar(); for (let k = 0; k < 40; k++) frame(true); res.push(`o save no meio (${mid ? 'andando' : 'parado'}): depois do load ${P3.wayOf(v.id) ? 'AINDA COM CAMINHO' : 'sem caminho'}`); if (!mid || P3.wayOf(v.id)) errs.push('o save no meio do caminho'); });
    // (the god's hand takes one on the way: not drawn while held; set down, drawn again with no error)
    tryF('a mão', () => { const v = putIn(b); if (!v) return res.push('mão: ninguém'); for (let k = 0; k < 8; k++) frame(true); god(() => { v.held = true; }); for (let k = 0; k < 20; k++) frame(true); const seen = !!P3.walkers.find(w => w[7] === v.id); god(() => { v.held = false; }); for (let k = 0; k < 30; k++) frame(true); res.push(`a mão do deus no meio: ${seen ? 'DESENHADO NA MÃO' : 'não desenhado na mão'}`); if (seen) errs.push('desenhado na mão do deus'); });
    // (one dies on the way: gone from the view)
    tryF('a morte', () => { const v = putIn(b); if (!v) return res.push('morte: ninguém'); for (let k = 0; k < 8; k++) frame(true); god(() => G.Village.kill(v, 'god', true)); for (let k = 0; k < 20; k++) frame(true); res.push(`a morte no meio: ${P3.visOf(v.id) ? 'AINDA NA VISTA' : 'fora da vista'}`); if (P3.visOf(v.id)) errs.push('o morto na vista'); });
    // (the tavern burns with one walking in it — its door blocked by the fire —, and falls: the way of a building gone given up, the world's
    // place drawn as it is)
    tryF('o fogo', () => { const v = putIn(b); if (!v) return res.push('fogo: ninguém'); for (let k = 0; k < 8; k++) frame(true); const mid = !!P3.wayOf(v.id), g0 = P3.ways.gone;
      god(() => { for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) G.Nature.ignite(G.W.idx(x, y), 1); }); for (let k = 0; k < 20; k++) frame(true);
      god(() => G.Village.removeBuilding(b)); for (let k = 0; k < 40; k++) frame(true); const fell = !G.S.buildings.has(b.id) || G.S.buildings.get(b.id).type === 'ruin';
      res.push(`o fogo no meio (${fell ? 'o prédio caiu' : 'DE PÉ'}): ${P3.ways.gone - g0} caminho(s) largado(s)`); if (!mid || !fell || (P3.wayOf(v.id) && P3.wayOf(v.id).b === b.id)) errs.push('o caminho de um prédio caído'); });
    const e = M.erros(), chk = P3.check();
    ok('d2 os casos ruins no meio de uma entrada: o save, a mão do deus, a morte, o fogo', !errs.length && !Object.keys(e.mod).length && !e.console.length && !chk.length && res.length === 4 && !res.some(r => /ninguém/.test(r)), `${res.join(' · ')}${errs.length ? ' · ERROS: ' + errs.join('; ') : ''}; o verificador do desenho: ${chk.join('; ') || 'nada'}`);
  }
}
if (on('d3')) {
  const V3 = G.Vida3D, out = [], bad = []; if (!G.S || !G.S.villagers) open(0.665); // (alone: the world of the d1)
  // (one grown person, seated at a place of the proof's own, given the round of the house on a copy — the cup is the inventory's:
  // G.Inv.held; a load that is not the round empties the hands, and the gesture is not made)
  const v = [...G.S.villagers.values()].filter(o => o.age >= 18 && o.age < 60 && !o.captive && !o.jail && !o.aboard && !(o.equip && o.equip.kit) && !(o.lost && (o.lost.armL || o.lost.armR))).sort((a, c) => a.id - c.id)[0];
  const pl = { st: 'sit', q: null }, op = 'prova-op', cp = x => copy(v, Object.assign({ inside: 0, sleeping: false, act: 'drink', actT: 1, task: { type: 'tavern', op, st: 3 } }, x));
  const drink = cp({ carry: { op, k: 'cerveja', n: 0.25 } }), load = cp({ carry: { op: 'outra', k: 'food', n: 2 } });
  const a = V3.atPlace(drink, pl, P3.look(drink), {}), c = V3.atPlace(load, pl, P3.look(load), {});
  const cup = G.Inv.held(drink).mao; out.push(`a rodada: «${a.st}» + «${a.over}» com ${cup || 'NADA'} na mão; uma carga que não é a rodada: «${c.st}» + «${c.over || '-'}»`);
  if (a.over !== 'ato-beber' || !cup || !G.Itens.has(cup, 'beber')) bad.push('o gole sem a caneca, ou sem o gole'); if (c.over === 'ato-beber') bad.push('o gole com as mãos vazias');
  // (the song: with the instrument the kit gives — the lyre, the Aztec drum: P7, D-764 — played with it; with the hands empty, sung —
  // never an instrument mimed; the brawl stands one up)
  const sing = cp({ act: 'play', carry: null }); const Ls = P3.look(sing), ins = V3.instrument(Ls); const so = V3.atPlace(sing, pl, Ls, {});
  const se = V3.atPlace(sing, pl, Object.assign({}, Ls, { inv: P3.NO_INV }), {});
  out.push(`a música com ${ins || 'nada'} na mão: «${so.over}»; com as mãos vazias: «${se.over}»`);
  if ((ins && so.over !== (ins === 'tambor' ? 'tocar-tambor' : 'tocar-lira')) || (!ins && so.over !== 'ato-atuar') || se.over !== 'ato-atuar') bad.push('a música de mentira, ou sem o instrumento que tem');
  const fight = cp({ act: 'fight', carry: null }); const fi = V3.atPlace(fight, pl, P3.look(fight), {}); out.push(`a briga: «${fi.st}»${fi.up ? ' de pé' : ''}`); if (!fi.up) bad.push('a briga sentada');
  // (the tavern's brawl — the world's 'shove' between two of it —: the fists, on one's feet)
  const br0 = G.Taverna.brawling; G.Taverna.brawling = () => true; const sh = cp({ act: 'shove', carry: null }); const bs = V3.atPlace(sh, pl, P3.look(sh), {}); G.Taverna.brawling = br0;
  out.push(`a briga da taverna: «${bs.st}»${bs.up ? ' de pé' : ''}`); if (!bs.up || (bs.st !== 'briga-socos' && bs.st !== 'ato-empurrar')) bad.push('a briga da taverna sem os punhos');
  // (the hat: a farmer's straw hat in the street, off under a roof and in bed; the helmet of a warrior at his post stays on)
  const hatOf = (o, x) => { const w = copy(o, x); return G.Look3D.outfitOf(w, P3.look(w), G.Fac.ofV(w)).hatM || 'nada'; };
  const far = [...G.S.villagers.values()].find(o => (o.role === 'agricultor' || o.role === 'pastor' || o.role === 'pescador') && !o.inside && !o.sleeping && P3.outfit(o).hatM === 'chapeu');
  if (far) { const h = [hatOf(far, {}), hatOf(far, { inside: 9 }), hatOf(far, { inside: 9, sleeping: true })]; out.push(`o chapéu de ${far.role}: na rua ${h[0]}, dentro ${h[1]}, na cama ${h[2]}`); if (h[0] !== 'chapeu' || h[1] !== 'nada' || h[2] !== 'nada') bad.push('o chapéu de sol debaixo de um teto ou na cama'); }
  else bad.push('ninguém de chapéu de sol para a prova');
  const war = [...G.S.villagers.values()].find(o => o.role === 'guerreiro' && o.age >= 18 && !o.captive && hatOf(o, { inside: 0, sleeping: false, task: { type: 'guard' } }) !== 'nada');
  if (war) { const h = [hatOf(war, { inside: 9, sleeping: false, task: { type: 'guard' } }), hatOf(war, { inside: 9, sleeping: false, task: { type: 'idle' } })]; out.push(`o elmo do guerreiro dentro: no posto ${h[0]}, de folga ${h[1]}`); if (h[0] === 'nada' || h[1] !== 'nada') bad.push('o elmo do posto'); }
  // (in the tavern of d1: the talk at the tables where two waited seated side by side, the keeper serving)
  if (on('d1')) { out.push(`na taverna: por cima do lugar ${JSON.stringify(tops)}; ${pairs} amostras de dois esperando lado a lado; o taverneiro ${keeperSt || 'ausente'}`);
    if (pairs > 0 && !tops['soc-conversa-sentado']) bad.push('dois à mesa sem conversa'); }
  ok('d3 o ato por cima do lugar: a caneca à boca, a música sem alaúde de mentira, a briga de pé, a conversa por turnos; o chapéu que sai e o elmo do posto', !bad.length, out.join(' · ') + (bad.length ? ' · ' + bad.join('; ') : ''));
}
if (on('d5')) {
  // the tavern of the night (P7, D-760 to D-766) as the view draws it: the keeper's cups in the hands — on the way and at the table, turned
  // to the one served —, the musician with the instrument in the hands (and nobody playing without one), the walks in and out by the
  // world's clock (In.passage, the errand's t.ww and t.mw: nobody at the place before the world, nobody mid-room after), the door open
  // for whoever the view draws passing it
  open(0.70); const b = tavern(); FOCUS = { X: (b.x + b.w / 2) * TL, Z: (b.y + b.h / 2) * TL };
  const plan = In.plan(b), e = plan.entrance, E = [b.x * TL + e.x, b.y * TL + e.z]; const V3 = G.Vida3D;
  const seen = { keeper: 0, keeperCup: 0, keeperBasket: 0, keeperTurned: 0, keeperAt: 0, music: 0, musicWith: 0, musicMimed: 0, ways: 0, early: 0, late: 0, doorShut: 0, self: 0 }; const W = new Map(), out = [];
  // (and a musician for certain: the proof's hand does what the tavern's night does — one of the tables up to the stage of the plan, a
  // set of the tavern's length, the seat kept —, at the frame 300)
  let mus = null; const stageUp = () => { const op = G.Taverna.dia(b); if (!op) return; const d = op.data; const st = In.table(b) && In.table(b).byUse.get('tocar');
    const v = Object.keys(d.mesa).map(id => G.S.villagers.get(+id)).find(o => o && o.task && o.task.type === 'tavern' && (o.task.st === 5 || o.task.st === 2) && !d.mesa[o.id].body && P3.visOf(o.id)); if (!v || !st || !st.length) return;
    god(() => { const t = v.task, seat = In.placeOf(v); d.mesa[v.id].use = t.use; t.use = 'tocar'; const stage = In.placeOf(v); const m = seat && stage && stage.use === 'tocar' ? In.walkBetween(b, seat, stage) : 0;
      t.st = 6; d.mesa[v.id].st = 6; d.mus = v.id; t.mw = G.S.clock + (Number.isFinite(m) ? m / G.Vg.walkMS(v) : 0); t.me = t.mw + G.Taverna.SET; v.actT = 0; }); mus = v; };
  for (let k = 0; k < 1500; k++) {
    if (k === 300) stageUp();
    frame(true);
    for (const w of P3.walkers) { const v = G.S.villagers.get(w[7]), s = P3.visOf(w[7]); if (!v || !s || !s.L) continue;
      // (a way that ends: when, against the world's clock of it)
      const wy = P3.wayOf(v.id); const was = W.get(v.id);
      if (was && !wy && was.until) { seen.ways++; const dl = G.S.clock - was.until; if (dl < -0.35) seen.early++; if (dl > 0.6) seen.late++; }
      W.set(v.id, wy && wy.kind !== 'out' && wy.kind !== 'door' ? wy : null);
      // (the door: whoever is drawn in the doorway goes through it open)
      if (v.inside === b.id || Math.hypot(s.X - E[0], s.Z - E[1]) < 1) { const ds = In.doorState(b, e.door); if (Math.hypot(s.X - E[0], s.Z - E[1]) < 0.35 && ds && ds.state !== 'aberta' && s.sp > 0.2) seen.doorShut++; }
      if (v.inside !== b.id) continue;
      const t = v.task;
      if (t && t.type === 'atender' && G.Inv.roundOf(v)) { seen.keeper++; const cup = s.L.inv && s.L.inv.mao && G.Itens.def(s.L.inv.mao).kind === 'caneca'; if (cup) seen.keeperCup++; if (s.L.held) seen.keeperBasket++;
        if (t.near && s.ap && !s.way && s.sp < 0.2) { seen.keeperAt++; if (s.ap.st === "levar-canecas" || s.ap.st === "fam-pedido") seen.keeperHolds = (seen.keeperHolds || 0) + 1; if ((P3.tools() || []).some(q => /^caneca/.test(q[0]))) seen.cupDrawn = (seen.cupDrawn || 0) + 1; const o = P3.visOf(t.near); if (o) { let da = Math.atan2(o.Z - s.Z, o.X - s.X) - s.yaw; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; if (Math.abs(da) < 0.6) seen.keeperTurned++; } } }
      if (v.act === 'play' && s.ap && !s.way) { const ins = V3.instrument(s.L), g = s.ap.over || s.ap.st; seen.music++; if (ins && (g === 'tocar-lira' || g === 'tocar-tambor')) seen.musicWith++; if (!ins && (g === 'tocar-lira' || g === 'tocar-tambor' || g === 'strum')) seen.musicMimed++; }
      if (t && t.type === 'tavern' && t.st === 7 && s.ap && s.ap.st === 'ato-servir') seen.self++;
    }
  }
  out.push(`a taverna ${b.id} às ${(G.S.time * 24).toFixed(1)} h: o taverneiro com a rodada ${seen.keeper} amostras — com a caneca na mão ${seen.keeperCup}, com uma carga desenhada ${seen.keeperBasket}; à mesa ${seen.keeperAt}, virado para o freguês ${seen.keeperTurned}, com as canecas diante de si ${seen.keeperHolds || 0}, canecas desenhadas ${seen.cupDrawn || 0}`);
  out.push(`o músico${mus ? " (#" + mus.id + ", pela mão da prova)" : " (nenhum)"} ${seen.music} amostras — tocando o instrumento que tem ${seen.musicWith}, tocando sem ele ${seen.musicMimed}`);
  out.push(`${seen.ways} caminhos com o relógio do mundo: ${seen.early} chegaram antes, ${seen.late} depois; na soleira com a porta fechada ${seen.doorShut} quadros; servindo-se no balcão ${seen.self}`);
  const good = seen.keeperBasket === 0 && seen.keeperCup === seen.keeper && seen.keeperTurned >= Math.floor(seen.keeperAt * 0.8) && (seen.keeperHolds || 0) >= Math.floor(seen.keeperAt * 0.8) && (seen.cupDrawn || 0) >= Math.floor(seen.keeperAt * 0.8) && seen.musicMimed === 0 && seen.musicWith >= Math.floor(seen.music * 0.98) && seen.early === 0 && seen.late === 0 && seen.doorShut === 0 && seen.ways > 0 && (!mus || seen.music > 0);
  ok('d5 a taverna da noite no desenho: as canecas do taverneiro, o músico com o instrumento, a caminhada no relógio do mundo, a porta aberta', good, out.join(' · '));
}
if (on('d4')) {
  // (the same world lived 600 frames with the inside drawn round the tavern and without the 3D at all: the same save)
  const run = draw => { open(0.665); const b = tavern(); FOCUS = { X: (b.x + b.w / 2) * TL, Z: (b.y + b.h / 2) * TL }; for (let k = 0; k < 600; k++) frame(draw); return G.Save.serialize(); };
  const a = run(true), c = run(false);
  ok('d4 o que só se vê só se vê: o mesmo save com o desenho de dentro e sem ele', a === c, `${a.length} caracteres: ${a === c ? 'iguais' : 'DIFERENTES'}`);
}
const e = M.erros(); ok('d9 sem erros', !Object.keys(e.mod).length && !e.console.length, `módulos ${JSON.stringify(e.mod)}; console ${e.console.length ? e.console.slice(0, 2).join(' | ') : 'limpo'}`);
console.log(fails.length ? `DENTRO-GENTE: FALHOU (${fails.join(', ')})` : 'DENTRO-GENTE: ok');
process.exit(fails.length ? 1 : 0);
