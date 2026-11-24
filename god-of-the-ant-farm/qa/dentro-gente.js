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
//  d6 o corpo do deus que entra e sai de uma taverna e de uma casa, com o bebê no colo e sem ele, e com uma carga nos braços e o
//     bebê (L-1908): ninguém deixado na entrada enquanto o corpo está dentro (o bebê do corpo ficava lá, em pé, do tamanho de uma
//     bonequinha), o bebê no colo desenhado por ninguém e ainda no colo lá fora, o corpo nunca desenhado duas vezes — no mundo
//     pronto da taverna egípcia em que o dono o viu (mega);
//  d7 a taverna viva no desenho (D-795 a D-799): cada ato da noite com a sua pose — o brinde, os ossinhos, a dança de pé, as palmas e
//     o canto no compasso do músico, o cochilo de olhos fechados, o pano, as canecas recolhidas, a gorjeta, o fechar, o cambalear —,
//     ninguém fazendo o gesto da coisa que não tem (os ossinhos, o pano, as canecas, a caneca do brinde), os dois corpos do expulsar
//     (as partes e as mãos de um no outro), o prato da refeição inteira com o bocado nos dedos só de quem tem a comida, o mastigar no
//     rosto, o gole sentado que pousa a caneca, o prato do taverneiro (levado, servido);
//  d8 a quarta onda no desenho (T6, D-870 a D-875): cada ato novo com a sua pose — a tranca, o chamado, o esconder, a porta forçada (com a
//     arma, ou o ombro), o discurso (com a caneca, ou a mão aberta), a bebida jogada e o molhado, a cantoria, a cuba, a panela de pé, os
//     dados, as cartas, a trapaça, a queda de braço, o riso e a história —, ninguém fazendo o gesto da coisa que não tem (os dados, o
//     baralho, a caneca, a arma), o desmaiado e o arrastado deitados parados e andando, as duas partes de cada ato a dois, a bebida
//     (v.ebrio) no andar, à mesa, de pé e no rosto pela índole (nunca pela aparência), a vida do salão pelo relógio e pelo id, o aplauso
//     no fim da música, o taverneiro que enxuga a caneca; quem dá o pulso (a banda da festa); a roupa molhada que escurece e seca;
//   node qa/dentro-gente.js [mundo]     ONLY=d1,d3 para algumas partes (≈ 3 min inteira; ONLY=d6 ≈ 1,5 min, sempre no mega; ONLY=d8 ≈ 40 s)
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
function open(t0, w) { M.pronto(w || WORLD); M.viver(2); let g = 0; while (!(G.S.time > t0 && G.S.time < t0 + 0.02) && g++ < 6000) M.viver(1); P3.clear(); B3.insideClear(); }
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
let putWhy = ''; // (why the proof's hand put nobody in: said by the d1)
function putIn(b) { const S = G.S; const d = In.door(b); const op = G.Taverna && G.Taverna.dia ? G.Taverna.dia(b) : null; if (!op) { putWhy = 'a taverna fechada'; return null; }
  // (the nearest few of the street, in turn: one the world calls away at once — to the family, T-1803 — gives way to the next)
  const L = [...S.villagers.values()].filter(o => P3.visOf(o.id) && !o.inside && o.age >= 16 && !o.held && !o.aboard && !o.sleeping && !o.captive && !o.jail && !P3.wayOf(o.id) && Math.hypot(o.x - d[0], o.y - d[1]) < 12).sort((a, c) => Math.hypot(a.x - d[0], a.y - d[1]) - Math.hypot(c.x - d[0], c.y - d[1]) || a.id - c.id).slice(0, 5);
  if (!L.length) { putWhy = 'ninguém da rua perto da porta'; return null; } const why = [];
  // (a full room turns the one sent away at the door — the tavern's own count, T.room, L-1926 —: the proof's hand sends one seated guest home first, T-1803)
  if (G.Taverna.room && G.Taverna.room(b) < 1) { const o = [...S.villagers.values()].filter(q => q.inside === b.id && q.task && q.task.type === 'tavern' && q.task.st >= 2 && !P3.wayOf(q.id)).sort((a, c) => a.id - c.id)[0]; if (o) god(() => G.Vg.endTask(o)); for (let k = 0; k < 60; k++) frame(true); }
  for (const v of L) { god(() => { G.Vg.endTask(v); v.x = d[0]; v.y = d[1]; v.path = null; v.moving = false; v.hunger = 5; v.energy = 90; G.Vg.setTask(v, { type: 'tavern', id: b.id, op: op.id, pri: 0.5, st: 0 }); });
    for (let k = 0; k < 400 && v.inside !== b.id && v.task && v.task.type === 'tavern'; k++) frame(true); frame(true);
    if (v.inside === b.id) { putWhy = ''; return v; } why.push(`#${v.id} ${v.task ? v.task.type + ' ' + (v.task.st || 0) : 'sem tarefa'}`); }
  putWhy = 'ninguém entrou: ' + why.join(', '); return null; }

if (on('d1') || on('d2')) {
  open(0.665); const b = tavern(); FOCUS = { X: (b.x + b.w / 2) * TL, Z: (b.y + b.h / 2) * TL };
  console.log(`(a taverna ${b.id}, ${b.w}×${b.h}, às ${(G.S.time * 24).toFixed(1)} h)`);
  if (on('d1')) {
    const w0 = Object.assign({}, P3.ways); watch(b, 900);
    const v = putIn(b); const wy = v ? P3.wayOf(v.id) : null; watch(b, 150);
    const straight = P3.ways.straight - w0.straight, made = P3.ways.made - w0.made;
    ok('d1 entra e sai andando pela porta, ninguém dentro de um móvel, ninguém de chapéu de rua dentro', jumps.entJ === 0 && jumps.exJ === 0 && jumps.movJ === 0 && !said.length && made > 0 && !!wy && wy.kind === 'in',
      `entradas ${jumps.ent} (${jumps.entJ} aos saltos), saídas ${jumps.ex} (${jumps.exJ} aos saltos), trocas de lugar ${jumps.mov} (${jumps.movJ}); ${made} caminhos feitos, ${straight} com uma perna sem caminho da planta; posto pela mão: ${wy ? 'o caminho «' + wy.kind + '», ' + wy.pts.length + ' pontos, ' + wy.len.toFixed(1) + ' m' : 'NENHUM (' + putWhy + ')'}; o verificador: ${said.length ? said.join(' · ') : 'nada'}`);
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
  if (!/^mesa-gole/.test(a.over || '') || !cup || !G.Itens.has(cup, 'beber')) bad.push('o gole sem a caneca, ou sem o gole'); if (/^mesa-gole|^ato-beber/.test(c.over || '')) bad.push('o gole com as mãos vazias'); // (seated, the table's sip: D-795)
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
if (on('d6')) {
  // the god's body walked in and out of a tavern and of a house by the stick, as the player walks it — with a baby in its arms and
  // without, and with a load in the arms and the baby —: while the body is inside, nobody drawn standing on the way in at the place of
  // nobody (In.placeOf with no place left at all: the body has but its disc there, and its baby fell to the way in — L-1908), the
  // body's baby drawn by nobody, the body never among the world's walkers; out again, the baby still in its arms, drawn by nobody
  open(0.70, 'mega'); const S = G.S, IN = G.Avatar.input, Sp = G.Space, out = [], bad = [];
  const bframe = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); const a = G.Avatar.state(); FOCUS = { X: a.X, Z: a.Z }; B3.insideTick(RDT, FOCUS); P3.update(RDT, FOCUS); };
  const inward = (p, k) => { const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
    if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz < 0) { nx = -nx; nz = -nz; } return [e.x + nx * k, e.z + nz * k]; };
  const civOf = b => { const f = G.Fac.ofSet(b.set); return f ? f.civ : '?'; };
  let C = null; const drawn = id => { const w = P3.visOf(id); return !!w && !w.gone; };
  const tick = () => { if (!C) return; C.k++; const v = C.body, b = C.b;
    if (P3.walkers.some(w => w[7] === v.id)) C.twice++;
    if (C.baby && drawn(C.baby.id)) { if (v.inside === b.id) C.alone++; else C.aloneOut++; }
    if (v.inside === b.id) { C.in++;
      for (const o of S.villagers.values()) { if (o.inside !== b.id || o === v || !drawn(o.id)) continue; const pl = In.placeOf(o), w = P3.visOf(o.id);
        if (pl && pl.use === '' && !pl.with && !w.way && Math.hypot(w.X - C.E[0], w.Z - C.E[1]) < 0.8) { C.door++; C.who.add(o.id); } } }
    if (C.k % 15 === 0 && G.VidaInv) G.VidaInv((k, sev, msg) => { if (sev <= 2 && C.inv.length < 3) C.inv.push(msg); }, S); };
  const walkTo = (X, Z, max, near) => { const st = G.Avatar.state(); let still = 0, last = [st.X, st.Z];
    for (let k = 0; k < (max || 300); k++) { if (Math.hypot(X - st.X, Z - st.Z) < (near || 0.15)) break; IN.camYaw = Math.atan2(Z - st.Z, X - st.X); IN.mz = 1; IN.mx = 0; bframe(); tick();
      if (st.loco === 'stair') { still = 0; last = [st.X, st.Z]; continue; } if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.004) { if (++still > 25) { if (C && !C.stop) C.stop = st.block || 'parado'; break; } } else still = 0; last = [st.X, st.Z]; }
    IN.mz = 0; IN.mx = 0; };
  // (one case: the body taken at the door of b, a load put in its arms if asked, walked k metres in, a while there, and out)
  const run = (name, b, body, baby, load, k, tryOnly) => {
    if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
    const p = Sp.planNow(b), d = In.planDoor(b); god(() => { G.Vg.endTask(body); body.inside = 0; body.x = d[0]; body.y = d[1]; body.path = null; body.carry = null; });
    if (!G.Possess.take(body).ok) { bad.push(name + ': o corpo não foi tomado'); return; }
    G.Avatar.attach(body, 0); for (let j = 0; j < 4; j++) bframe();
    let lk = '';
    if (load) { const f = G.Fac.ofV(body); lk = ['wood', 'stone', 'food'].find(x => f && (f.stock[x] || 0) >= 3) || ''; if (lk) god(() => G.Depot.move('f:' + f.id, 'v:' + body.id, lk, 2, { code: 'prova' })); }
    const ds = In.doorState(b, p.entrance.door); if (ds && ds.state !== 'aberta') G.Possess.apply(w => { In.useDoor(b, p.entrance.door, 'abrir', w); return { ok: true }; });
    C = { k: 0, b, body, baby, E: [b.x * TL + p.entrance.x, b.y * TL + p.entrance.z], in: 0, alone: 0, aloneOut: 0, door: 0, who: new Set(), twice: 0, inv: [] };
    const o = inward(p, -0.6), i = inward(p, k), o2 = inward(p, -2.5);
    walkTo(b.x * TL + o[0], b.y * TL + o[1], 300, 0.08); walkTo(b.x * TL + i[0], b.y * TL + i[1], 300); for (let j = 0; j < 90; j++) { bframe(); tick(); }
    const loaded = !!(body.carry && body.carry.n > 0);
    walkTo(b.x * TL + o[0], b.y * TL + o[1], 300, 0.08); walkTo(b.x * TL + o2[0], b.y * TL + o2[1], 300); for (let j = 0; j < 30; j++) { bframe(); tick(); }
    const kept = !baby || baby.carrier === body.id, outside = !body.inside, c = C; C = null;
    if (!c.in && tryOnly) { out.push(`${b.type}#${b.id} (${civOf(b)}) barra o corpo que anda da rua à porta (${c.stop || '?'}): outra`); return false; }
    out.push(`${name} (${b.type}#${b.id}, ${civOf(b)}; ${body.name}${baby ? ' com ' + baby.name + ' no colo' : ''}${load ? (loaded ? ', a carga nos braços' : ', SEM a carga') : ''}): ${c.in} quadros dentro, na entrada sem lugar ${c.door}${c.who.size ? ' (#' + [...c.who].join(', #') + ')' : ''}, o bebê desenhado sozinho ${c.alone} dentro e ${c.aloneOut} fora, o corpo duas vezes ${c.twice}${baby ? ', o bebê ' + (kept ? 'ainda no colo' : 'NÃO MAIS no colo') : ''}`);
    if (!c.in || !outside) bad.push(`${name}: o corpo ${!c.in ? 'não entrou' : 'não saiu'}`);
    if (c.door || c.alone || c.aloneOut || c.twice || !kept || (load && !loaded)) bad.push(name);
    for (const m of c.inv) bad.push(`${name}: ${m}`); return true;
  };
  // (the tavern: the owner's Egyptian one first — the next one where the body walking from the street to its door is barred there: the
  // avatar's, not the drawing's —; a body of its town carrying a baby — of another town, if none of its own —, and one with free arms)
  const ok6 = o => o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && !o.captive && !o.jail && G.Possess.can(o).ok;
  const holder = (set, home) => [...S.villagers.values()].filter(c => c.age < 2 && c.carrier && (!set || c.set === set)).map(c => [c, S.villagers.get(c.carrier)]).filter(([c, o]) => o && ok6(o) && (!home || o.home === home)).sort((x, y) => x[0].id - y[0].id)[0];
  const free = (set, home) => [...S.villagers.values()].filter(o => o.set === set && ok6(o) && !G.Vg.holdsBaby(o) && (!home || o.home === home)).sort((x, y) => x.id - y.id)[0];
  const tavs = [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built && b.ip && In.plan(b) && In.plan(b).ok && In.planDoor(b)).sort((a, c) => (civOf(c) === 'egipcio') - (civOf(a) === 'egipcio') || a.id - c.id);
  let tav = null; for (const b of tavs) { const h = holder(b.set) || holder(0); if (h && run('a taverna com o bebê', b, h[1], h[0], false, 2.0, true)) { tav = b; break; } }
  if (!tav) bad.push('nenhuma taverna em que o corpo entre com um bebê no colo');
  else { const f = free(tav.set); if (f) run('a taverna sem bebê', tav, f, null, false, 2.0); else bad.push('a taverna sem bebê: ninguém');
    const h2 = holder(tav.set) || holder(0); if (h2) run('a taverna com o bebê e a carga', tav, h2[1], h2[0], true, 2.0); }
  // (a house of the body's own: one with a plan, its door on a street, where one carrying a baby lives — and one where nobody does)
  const homes = [...S.buildings.values()].filter(b => (b.type === 'house' || b.type === 'sobrado') && b.built && In.has(b) && In.planDoor(b) && Sp.planNow(b) && Sp.planNow(b).entrance).sort((a, c) => (civOf(c) === 'egipcio') - (civOf(a) === 'egipcio') || a.id - c.id);
  const hb = homes.find(b => holder(b.set, b.id)), hf = homes.find(b => b !== hb && free(b.set, b.id));
  if (!hb) bad.push('nenhuma casa de quem carrega um bebê'); else { const h = holder(hb.set, hb.id); run('a casa com o bebê', hb, h[1], h[0], false, 1.2); }
  if (!hf) bad.push('nenhuma casa para o corpo sem bebê'); else run('a casa sem bebê', hf, free(hf.set, hf.id), null, false, 1.2);
  if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
  ok('d6 o corpo entra e sai com o bebê no colo e sem ele: ninguém deixado na entrada, o bebê com o corpo, o corpo uma vez só', !bad.length, out.join(' · ') + (bad.length ? ' — FALHAS: ' + bad.join('; ') : ''));
}
if (on('d7')) {
  // the living tavern as the view draws it (D-795 to D-799): the reader's choice for each act of the night at a place — on copies of one
  // grown person of the world, as the d3 —, the hands' things (G.Inv.held: never a gesture of a thing not in the hands), the pair of the
  // brawler put out, the music's compass by the musician's clock, the face that chews and the nap's shut eyes, and the frame's own
  // mouthful in the fingers (the rig, People3D.body)
  if (!G.S || !G.S.villagers) open(0.665);
  const V3 = G.Vida3D, A3 = G.Anim3D, out = [], bad = [];
  const v = [...G.S.villagers.values()].filter(o => o.age >= 18 && o.age < 60 && !o.captive && !o.jail && !o.aboard && !(o.equip && o.equip.kit) && !(o.lost && (o.lost.armL || o.lost.armR))).sort((a, c) => a.id - c.id)[0];
  const seat = { st: 'sit', q: null }, stand = { st: 'idle', q: null }, op = 'prova-op';
  const cp = x => copy(v, Object.assign({ inside: 0, sleeping: false, act: '', actT: 1.3, carry: null, task: { type: 'tavern', op, st: 5 } }, x));
  const at = (o, pl, inv) => { const L = P3.look(o); if (inv !== undefined) L.inv = Object.assign({}, P3.NO_INV, inv); return V3.atPlace(o, pl, L, {}); };
  const shown = r => r.over || r.st;
  // (1) each act of the night at its place: seated over the seat, the dance standing up, the keeper's standing
  const cupK = G.Inv.held(cp({ carry: { op, k: 'cerveja', n: 0.25 }, task: { type: 'tavern', op, st: 3 } })).mao;
  const want = [['brinde', seat, 'taverna-brinde', { mao: cupK }], ['palmas', seat, 'palmas'], ['cantar-junto', seat, 'cantar-junto'], ['cochilo', seat, 'cochilo'], ['gorjeta', seat, 'gorjeta'],
    ['danca', seat, 'danca'], ['danca', stand, 'danca'], ['fechar', stand, 'fechar'], ['cambalear', stand, 'cambalear']];
  const armOut = (P3.look(cp({})).armOut || 0) > 0; // (the nap of who wears something over the arms is on one arm: cochilo-b)
  const got = []; for (const [act, pl, k0, inv] of want) { const k = act === 'cochilo' && armOut ? 'cochilo-b' : k0; const r = at(cp({ act }), pl, inv || {}); got.push(`${act}${pl === seat ? ' sentado' : ' de pé'} «${shown(r)}»${r.up ? ' (de pé)' : ''}`); if (shown(r) !== k) bad.push(`${act}: «${shown(r)}» (devia ser ${k})`); if (act === 'danca' && pl === seat && !r.up) bad.push('a dança sentada'); }
  out.push(got.join(', '));
  // (2) never a gesture of a thing not in the hands: the bones, the cloth, the cups gathered, the toast's cup
  const none = [['jogo-ossos', seat], ['limpar-mesa', stand], ['recolher-canecas', stand], ['brinde', seat]].map(([act, pl]) => [act, shown(at(cp({ act }), pl, {}))]);
  // (the table wiped with the keeper's cloth or the straw of the people's grain — G.Vida3D.wipeOf —: with neither, not wiped)
  const wipeK = V3.wipeOf(cp({ act: 'limpar-mesa' }), P3.look(cp({ act: 'limpar-mesa' })));
  out.push('sem a coisa na mão: ' + none.map(([a, k]) => `${a} «${k}»`).join(', ') + ` (o pano ou a palha do povo: ${wipeK || 'nenhum'})`); for (const [a, k] of none) if (A3.CLIPS[k] && A3.CLIPS[k].item && !(a === 'limpar-mesa' && wipeK)) bad.push(`${a}: o gesto «${k}» com a mão vazia`);
  if (wipeK && none.find(x => x[0] === 'limpar-mesa')[1] !== 'limpar-mesa') bad.push('o pano ou a palha do povo sem a mesa limpa');
  // (with a thing in the hand — the proof's hand puts one there, as the inventory would —: the gesture)
  const withIt = [['jogo-ossos', seat, 'jogo-ossos'], ['limpar-mesa', stand, 'limpar-mesa'], ['recolher-canecas', stand, 'recolher-canecas']].map(([act, pl, k]) => [act, shown(at(cp({ act }), pl, { mao: cupK })), k]);
  out.push('com uma coisa na mão: ' + withIt.map(([a, k]) => `${a} «${k}»`).join(', ')); for (const [a, k, w] of withIt) if (k !== w) bad.push(`${a}: «${k}» com a coisa na mão (devia ser ${w})`);
  // (3) the two bodies of «expulsar»: each one's part standing and walking, and the keeper's hands on the other (Anim.DUO)
  const ka = cp({ act: 'expulsar', task: { type: 'atender', papel: 'a' } }), kb = cp({ act: 'expulsar', task: { type: 'tavern', op, st: 5, papel: 'b' } });
  const ea = A3.stateOf(ka, 0, P3.look(ka)), eb = A3.stateOf(kb, 0, P3.look(kb)), wa = V3.overOf(ka, 'walk', P3.look(ka)), wb = V3.overOf(kb, 'walk', P3.look(kb)); const da = A3.duoFor('expulsar', 'a'), db = A3.duoFor('expulsar', 'b');
  out.push(`expulsar: parados «${ea}» e «${eb}», andando «${wa}» e «${wb}»; as mãos do taverneiro no outro: ${da && da.hands ? da.hands.filter(Boolean).length : 0}`);
  if (ea !== 'expulsar-a' || eb !== 'expulsar-b' || wa !== 'expulsar-a' || wb !== 'expulsar-b' || !da || !da.hands || !db || db.clip !== 'expulsar-b') bad.push('os dois corpos do expulsar');
  // (the drink in the walk: who drank too much — the look's L.drunk — walks with the arms out; who did not, not)
  const dr = cp({ act: '' }); const Ld = P3.look(dr); const w0 = V3.overOf(dr, 'walk', Object.assign({}, Ld, { drunk: 0 })), w1 = V3.overOf(dr, 'walk', Object.assign({}, Ld, { drunk: 0.8 }));
  out.push(`o andar: sóbrio «${w0 || '-'}», bêbado «${w1}»`); if (w0 === 'cambalear' || w1 !== 'cambalear') bad.push('o cambalear sem a bebida, ou a bebida sem ele');
  // (4) the table: the guests' whole plate — with the food in the hands —, the sip that sets the cup down, the cup at rest
  const meal = at(cp({ act: 'dine', carry: { op, k: 'food', n: 1 }, task: { type: 'tavern', op, st: 3 } }), seat); const sip = at(cp({ act: 'drink', carry: { op, k: 'cerveja', n: 0.25 }, task: { type: 'tavern', op, st: 3 } }), seat);
  const rest = at(cp({ act: 'sit', carry: { op, k: 'cerveja', n: 0.25 }, task: { type: 'tavern', op, st: 5 } }), seat);
  out.push(`à mesa: o prato «${meal.over}», o gole «${sip.over}», a caneca entre os goles «${rest.over}»`);
  if (!/^mesa-refeicao/.test(meal.over || '') || !/^mesa-gole/.test(sip.over || '') || rest.over !== 'mesa-caneca') bad.push('a mesa: o prato, o gole ou a caneca');
  // (5) the keeper's plate: carried level on the way, set before the seated one — the plate of the inventory with the meal on it
  const kp = cp({ act: 'give', carry: { op, k: 'food', n: 1 }, task: { type: 'atender', op, st: 3, n1: 1 } }); const Lk = P3.look(kp); const sv = V3.atPlace(kp, stand, Lk, {}), wk = V3.overOf(kp, 'walk', Lk);
  out.push(`o taverneiro com o prato (${Lk.inv.mao || 'nada'} na mão, a comida: ${Lk.food || 'nenhuma'}): à mesa «${shown(sv)}», andando «${wk}»`);
  if (!/^prato\./.test(Lk.inv.mao || '') || shown(sv) !== 'servir-prato' || wk !== 'levar-prato' || !Lk.food) bad.push('o prato do taverneiro');
  // (6) the music's compass: a clip of beats at the musician's clock — the claps on his notes —, and the world's clock with nobody playing
  // (the pulse is the sound's: G.Audio.compasso — the musician's people's pace and the start of his set, P9)
  const M = copy(v, { act: 'play', actT: 7.3, inside: 1, task: { type: 'tavern', op, st: 6, mw: (G.S.clock || 0) - 3.1 } }); const mus0 = V3.musician; V3.musician = () => M; const uM = V3.beatU(cp({}), A3.CLIPS.palmas); V3.musician = () => null; const uW = V3.beatU(cp({}), A3.CLIPS.palmas); V3.musician = mus0;
  const kM = G.Audio.compasso(M), kW = G.Audio.compasso(cp({})); const wantM = (((G.S.clock || 0) - kM.t0) / (2 * kM.periodo)) % 1, wantW = ((G.S.clock || 0) / (2 * kW.periodo)) % 1;
  out.push(`o compasso: com o músico ${uM.toFixed(3)} (o pulso dele, ${kM.civ} ${kM.bpm} bpm, ${wantM.toFixed(3)}), sem ele ${uW.toFixed(3)} (o do mundo ${wantW.toFixed(3)})`); if (Math.abs(uM - wantM) > 1e-6 || Math.abs(uW - wantW) > 1e-6) bad.push('o compasso da música');
  // (7) the face: the chewing works the jaw shut and open (never the vowels of a word), the nap shuts the eyes
  const RO = G.Rosto, X = RO.IDX; let lo = 9, hi = -9, pr = 0; const m0 = {}, pose = A3.POSE0(); pose.chew = 1; pose.talk = 0;
  for (let k = 0; k < 60; k++) { const F = A3.faceMix(m0, { clock: k / 30, id: 7 }, pose, null, { pz: null }, 1 / 30); lo = Math.min(lo, F[X.jaw]); hi = Math.max(hi, F[X.jaw]); pr = Math.max(pr, F[X.press]); }
  const Fn = A3.faceMix({}, { clock: 1, id: 7 }, A3.POSE0(), null, { pz: null, over: A3.CLIPS.cochilo, ow: 1 }, 1 / 30);
  out.push(`o rosto: mastigando a boca de ${lo.toFixed(2)} a ${hi.toFixed(2)}, os lábios apertados até ${pr.toFixed(2)}; cochilando, os olhos ${Fn[X.blink].toFixed(2)}`);
  if (!(hi - lo > 0.1 && hi < 0.4 && pr > 0.2) || !(Fn[X.blink] > 0.9)) bad.push('o mastigar ou o cochilo no rosto');
  // (8) the mouthful in the fingers, drawn by the rig only for who has the food in the hands — the meal's own part, by its origin
  FOCUS = FOCUS || { X: v.x * TL, Z: v.y * TL }; frame(true); // (the drawing made once: its meshes)
  const put = Lf => { const pp = Object.assign(A3.POSE0(), { morsel: 1 }); P3.toolsBegin(); P3.body(0, 0, 0, 0, 0, pp, Lf, null); const t = P3.tools(); return t.find(x => /^bocado\|/.test(x[0])) || null; };
  const L0 = Object.assign(P3.look(cp({})), { food: 'peixe', lod: 0 }); const a = put(L0), b = put(Object.assign({}, L0, { food: null }));
  out.push(`o bocado nos dedos: com a comida ${a ? a[0] : 'NENHUM'}, sem ela ${b ? b[0] : 'nenhum'}`); if (!a || a[0] !== 'bocado|peixe' || b) bad.push('o bocado de mentira, ou sem ele');
  ok('d7 a taverna viva: cada ato com a sua pose, ninguém fazendo o gesto da coisa que não tem, os dois corpos do expulsar, a mesa, o prato do taverneiro, o compasso, o rosto', !bad.length, out.join(' · ') + (bad.length ? ' — FALHAS: ' + bad.join('; ') : ''));
}
if (on('d8')) {
  // the fourth wave's acts as the view draws them (T6, D-870 to D-875): the reader's choice for each act — on copies of one grown person
  // of the world, as the d7 —, the thing of the gesture in a hand or no gesture (the dice, the deck, the cup, the weapon), the body on the
  // floor lying whatever it is moved at, the two parts of each act of two, the drink of T2 (v.ebrio) in the walk, at the table and on the
  // face by who one is, and the life of the room by the world's clock and the id
  if (!G.S || !G.S.villagers) open(0.665);
  const V3 = G.Vida3D, A3 = G.Anim3D, It = G.Itens, out = [], bad = [];
  const v = [...G.S.villagers.values()].filter(o => o.age >= 18 && o.age < 60 && !o.captive && !o.jail && !o.aboard && !(o.equip && o.equip.kit) && !(o.lost && (o.lost.armL || o.lost.armR))).sort((a, c) => a.id - c.id)[0];
  const seat = { st: 'sit', q: null }, stand = { st: 'idle', q: null }, op = 'prova-op';
  const cp = x => copy(v, Object.assign({ inside: 0, sleeping: false, act: '', actT: 1.3, carry: null, ebrio: 0, drunk: 0, task: { type: 'tavern', op, st: 5 } }, x));
  const at = (o, pl, inv) => { const L = P3.look(o); if (inv !== undefined) L.inv = Object.assign({}, P3.NO_INV, inv); return V3.atPlace(o, pl, L, {}); };
  const shown = r => r.over || r.st;
  // (the things: the cup of the round, a weapon of the catalog, the dice and the deck of T4 and T5 — put by the proof's hand where the
  // catalog has no line for them yet, as their kind)
  const cupK = G.Inv.held(cp({ carry: { op, k: 'cerveja', n: 0.25 }, task: { type: 'tavern', op, st: 3 } })).mao;
  const armaK = Object.keys(It.KINDS).filter(k => It.KINDS[k].tipo === 'arma' && It.KINDS[k].maos === 1).map(k => It.key(k, (It.KINDS[k].mats || [])[0])).find(k => It.def(k));
  const def0 = It.def, stub = { 'dados.osso': 'dados', 'baralho.madeira': 'baralho' }, stubbed = [];
  for (const k in stub) if (!def0(k)) stubbed.push(stub[k]);
  if (stubbed.length) It.def = k => def0(k) || (stub[k] ? { id: k, kind: stub[k], mat: k.split('.')[1], tipo: 'brinquedo', maos: 1, slots: ['mao'] } : null);
  try {
    // (1) each act with its pose — standing, seated over the seat, the speech and the door by what the hand has
    const want = [['trancar', stand, 'trancar'], ['abrigar', stand, 'abrigar'], ['esconder', stand, 'ato-esconder'], ['molhado', stand, 'molhado'], ['cantoria', stand, 'cantoria'],
      ['mexer-cuba', stand, 'mexer-cuba'], ['cook', stand, 'cozinhar-pe'], ['laugh', seat, 'riso-corpo'], ['tell', seat, 'contar-historia'], ['laugh', stand, 'riso-corpo'],
      ['queda-de-braco', seat, 'queda-de-braco'], ['queda-de-braco-cede', seat, 'queda-de-braco-cede'],
      ['jogo-dados', seat, 'jogo-dados', { mao: 'dados.osso' }], ['jogo-cartas', seat, 'jogo-cartas', { outra: 'baralho.madeira' }], ['jogo-cartas', seat, 'jogo-cartas', { mao: 'baralho.madeira' }],
      ['jogo-cartas-ganha', seat, 'jogo-cartas-ganha', { outra: 'baralho.madeira' }], ['trapaca', seat, 'trapaca', { mao: 'dados.osso' }], ['trapaca', seat, 'trapaca', { outra: 'baralho.madeira' }],
      ['jogar-bebida', seat, 'jogar-bebida', { mao: cupK }], ['discurso', stand, 'discurso', { mao: cupK }], ['arrombar', stand, 'arrombar', { mao: armaK }],
      ['concurso-bebida', seat, 'concurso-bebida', { mao: cupK }], ['torcer', seat, 'torcer'], ['torcer', stand, 'torcer'], ['trapaca-pega', seat, 'trapaca-pega']];
    const got = []; for (const [act, pl, k, inv] of want) { const r = at(cp({ act }), pl, inv || {}); got.push(`${act}${pl === seat ? ' sentado' : ' de pé'}${inv ? ' (com ' + Object.values(inv)[0] + ')' : ''} «${shown(r)}»`); if (shown(r) !== k) bad.push(`${act}: «${shown(r)}» (devia ser ${k})`); }
    out.push(got.join(', '));
    // (2) never the gesture of a thing not in the hands: no dice, no deck, no cup, no weapon — the place's own (a cup in the hand: the cup at
    // rest, never thrown as dice), or the gesture without it
    const none = [['jogo-dados', seat, 'sit'], ['jogo-cartas', seat, 'sit'], ['jogo-cartas-ganha', seat, 'sit'], ['trapaca', seat, 'sit'], ['jogar-bebida', seat, 'sit'], ['concurso-bebida', seat, 'sit'], ['jogo-dados', seat, 'mesa-caneca', { mao: cupK }],
      ['jogo-cartas', seat, 'mesa-caneca', { mao: cupK }], ['discurso', stand, 'discurso-mao'], ['arrombar', stand, 'arrombar-ombro'], ['arrombar', stand, 'arrombar-ombro', { mao: cupK }]].map(([act, pl, k, inv]) => [act, shown(at(cp({ act }), pl, inv || {})), k, inv]);
    out.push('sem a coisa na mão: ' + none.map(([a, s, , inv]) => `${a}${inv ? ' (com a caneca)' : ''} «${s}»`).join(', ')); for (const [a, s, k] of none) if (s !== k) bad.push(`${a}: «${s}» sem a coisa (devia ser ${k})`);
    // (3) the body on the floor lies, still or moved; who drags it walks bent over it
    const ly = []; for (const act of ['desmaio', 'arrastado']) for (const sp of [0, 1.4]) { const o = cp({ act }); const s = A3.stateOf(o, sp, P3.look(o)); ly.push(`${act} a ${sp} m/s «${s}»`); if (s !== act) bad.push(`${act}: «${s}» a ${sp} m/s (devia ficar deitado)`); }
    for (const act of ['desmaio', 'arrastado']) { const r = at(cp({ act }), seat); ly.push(`${act} no assento «${r.st}»${r.up ? ' (fora do assento)' : ''}`); if (r.st !== act || !r.up || r.over) bad.push(`${act}: sentado no assento («${r.over || r.st}»)`); }
    const dg = cp({ act: 'arrastar' }); const dgS = A3.stateOf(dg, 0, P3.look(dg)), dgW = V3.overOf(dg, 'walk', P3.look(dg)); ly.push(`arrastar parado «${dgS}», andando «${dgW}»`);
    if (dgS !== 'arrastar' || dgW !== 'arrastar') bad.push('quem arrasta');
    for (const c of ['desmaio', 'arrastado']) if (!A3.CLIPS[c] || A3.CLIPS[c].mask !== 'full' && !(A3.CLIPS[c].base === 'idle' || A3.CLIPS[c].feet === 'free')) bad.push(`o clipe ${c} não é do corpo inteiro`);
    out.push(ly.join(', '));
    // (4) the two parts of each act of two (Anim.DUO): the drink thrown and the one who gets it, the one dragged out, the arm wrestle — the
    // same for the two, the right hands locked between them
    const du = []; for (const [act, a, b, ha, hb] of [['jogar-bebida', 'jogar-bebida', 'molhado', 0, 0], ['arrastar', 'arrastar', 'arrastado', 0, 0], ['queda-de-braco', 'queda-de-braco', 'queda-de-braco', 1, 1]]) {
      const da = A3.duoFor(act, 'a'), db = A3.duoFor(act, 'b'); const na = da && da.hands ? da.hands.filter(Boolean).length : 0, nb = db && db.hands ? db.hands.filter(Boolean).length : 0;
      du.push(`${act}: «${da && da.clip}» e «${db && db.clip}», as mãos ${na} e ${nb}`); if (!da || !db || da.clip !== a || db.clip !== b || !A3.CLIPS[a] || !A3.CLIPS[b] || na !== ha || nb !== hb) bad.push(`as duas partes de ${act}`); }
    out.push(du.join(', '));
    // (5) the drink of T2 (v.ebrio) in the body: the stagger growing with it, the arms out in the walk, the head in the hand at the table, the
    // hand on the board standing, the face — the flush and the heavy lids, the silly smile or the sour face by who one is (G.Indole), never
    // by the look of one (the genome of another changes nothing)
    const d0 = P3.drunkOf(cp({})), d1 = P3.drunkOf(cp({ ebrio: 0.6 })), d2 = P3.drunkOf(cp({ ebrio: 1.3 }));
    const wk = [0, 1.3].map(e => { const o = cp({ ebrio: e }); return V3.overOf(o, 'walk', P3.look(o)) || '-'; });
    const tb = shown(at(cp({ ebrio: 1.3, act: 'sit' }), seat)), sd = shown(at(cp({ ebrio: 1.3 }), stand)), tb0 = at(cp({ act: 'sit' }), seat).over;
    out.push(`a bebida: ${d0.toFixed(2)} → ${d1.toFixed(2)} → ${d2.toFixed(2)}; andando sóbrio «${wk[0]}», bêbado «${wk[1]}»; à mesa «${tb}» (sóbrio «${tb0 || '-'}»), de pé «${sd}»`);
    if (!(d0 === 0 && d1 > 0.3 && d2 > d1) || wk[0] === 'cambalear' || wk[1] !== 'cambalear' || tb !== 'bebado-mesa' || tb0 === 'bebado-mesa' || sd !== 'bebado-apoio') bad.push('a bebida no corpo');
    const RO = G.Rosto, X = RO.IDX; const face = (drunkF, dmood) => { const m = {}, pose = A3.POSE0(); pose.blink = 1; let F = null; for (let k = 0; k < 90; k++) F = A3.faceMix(m, { clock: k / 30, id: 7, drunkF, dmood }, pose, null, { pz: null }, 1 / 30); return F; };
    const f0 = face(0, 0), fh = face(1, 1), fs = face(1, -1);
    out.push(`o rosto: sóbrio sorriso ${f0[X.smile].toFixed(2)} pálpebra ${f0[X.blink].toFixed(2)}; bêbado alegre sorriso ${fh[X.smile].toFixed(2)} pálpebra ${fh[X.blink].toFixed(2)}; azedo sobrancelhas ${fs[X.browIn].toFixed(2)} sorriso ${fs[X.smile].toFixed(2)}`);
    if (!(fh[X.smile] > f0[X.smile] + 0.2 && fh[X.blink] > f0[X.blink] + 0.05 && fs[X.browIn] > f0[X.browIn] + 0.2 && fs[X.smile] < fh[X.smile])) bad.push('a bebida no rosto');
    const ms = [...G.S.villagers.values()].filter(o => o.age >= 16 && o.indole).map(o => [P3.drunkMood(o), o]); ms.sort((a, c) => a[0] - c[0]);
    const lo = ms[0], hi = ms[ms.length - 1]; const same = P3.drunkMood(copy(lo[1], { genoma: hi[1].genoma, civ: hi[1].civ })) === lo[0];
    out.push(`o humor da bebida pela índole: de ${lo[0].toFixed(2)} a ${hi[0].toFixed(2)} em ${ms.length}; com o genoma e o povo de outro, ${same ? 'o mesmo' : 'OUTRO'}`);
    if (!(lo[0] < -0.3 && hi[0] > 0.3) || !same) bad.push('o humor da bebida pela índole, nunca pela aparência');
    // (6) the life of the room: each one's own agenda by the world's clock and the id — the same answer twice, more than one thing over an
    // evening, a change every several seconds, never a roll —; the applause at the end of the music (the tavern's clock of it); the keeper
    // drying a cup with his cloth
    const ad = [...G.S.villagers.values()].filter(o => o.age >= 16).slice(0, 40); const kinds = {}; let twice = true, changes = 0;
    const c0 = G.S.clock; for (let t = 0; t < 240; t += 2) { G.S.clock = c0 + t; for (const o of ad) { const q = cp({ id: o.id }); const L = P3.look(q); const k = V3.roomIdle(q, L); if (k !== V3.roomIdle(q, L)) twice = false; kinds[k || '-'] = (kinds[k || '-'] || 0) + 1; } }
    let prev = null; for (let t = 0; t < 240; t += 1) { G.S.clock = c0 + t; const q = cp({}); const k = V3.roomIdle(q, P3.look(q)); if (prev !== null && k !== prev) changes++; prev = k; } G.S.clock = c0;
    out.push(`o salão à toa: ${JSON.stringify(kinds)}; ${changes} trocas em 240 s de uma pessoa; ${twice ? 'a mesma resposta duas vezes' : 'RESPOSTAS DIFERENTES'}`);
    if (!twice || !(kinds['mesa-queixo'] > 0 && kinds['mesa-recostar'] > 0 && kinds['-'] > 0) || changes < 4 || changes > 60) bad.push('a vida do salão pelo relógio e pelo id');
    const tv = tavern(); const T = G.Taverna;
    if (tv && T && T.dia && T.REST > 0) { const dia0 = T.dia; const ap = (mus, ago) => { T.dia = () => ({ data: { mus, musT: (G.S.clock || 0) + T.REST - ago } }); try { return shown(at(cp({ act: 'sit', inside: tv.id }), seat)); } finally { T.dia = dia0; } };
      const a1 = ap(0, 1), a2 = ap(0, V3.APPLAUSE + 1), a3 = ap(1, 1); out.push(`o aplauso: logo depois da música «${a1}», muito depois «${a2}», com a música tocando «${a3}»`);
      if (a1 !== 'aplauso' || a2 === 'aplauso' || a3 === 'aplauso') bad.push('o aplauso no fim da música'); } else out.push('o aplauso: sem taverna aberta neste mundo');
    const kp = cp({ act: '', task: { type: 'atender', op, st: 1 } }); const Lk = Object.assign(P3.look(kp), { polish: true, inv: Object.assign({}, P3.NO_INV, { outra: cupK }) }); const pk = V3.atPlace(kp, stand, Lk, {}).st;
    const Ln = Object.assign(P3.look(kp), { polish: false }); const pn = V3.atPlace(kp, stand, Ln, {}).st;
    const kw = [...G.S.villagers.values()].find(o => o.task && o.task.type === 'atender' && G.Dentro3D && G.Dentro3D.ombro && G.Dentro3D.ombro(o)); let real = 'nenhum taverneiro de pano neste mundo';
    if (kw) { const q = copy(kw, { act: '', carry: null }); const Lq = P3.look(q); real = `o taverneiro #${kw.id}: ${Lq.polish ? 'enxuga ' + Lq.inv.outra : 'não enxuga'}`; if (!Lq.polish || !Lq.inv.outra || It.def(Lq.inv.outra).kind !== 'caneca') bad.push('o taverneiro de pano sem a caneca para enxugar'); }
    out.push(`o balcão: com o pano e a caneca «${pk}», sem «${pn}»; ${real}`); if (pk !== 'enxugar-caneca' || pn === 'enxugar-caneca') bad.push('o taverneiro enxugando a caneca');
    // (7) who leads the music where one is (the band of the sound, T8 D-890): the feast's bards first, then the musician of the day, then
    // by id — two of the world put to play in the tavern by the proof's hand, and put back
    if (tv) { const pl = [...G.S.villagers.values()].filter(o => o.age >= 16 && !o.sleeping && !o.aboard && o.inside !== tv.id).sort((a, c) => a.id - c.id).slice(0, 2);
      const keep = pl.map(o => [o, o.act, o.inside]), f0 = tv.festa, c1 = G.S.clock; const lead = () => { G.S.clock += 1e-4; const m = V3.musician(cp({ inside: tv.id })); return m ? m.id : 0; };
      try { for (const o of pl) { o.act = 'play'; o.inside = tv.id; } const nb = lead(); tv.festa = { motivo: 'prova', bardos: [pl[1].id], dia: G.S.day, ate: G.S.day + 1 }; const wb = lead();
        out.push(`quem dá o pulso: sem festa #${nb} (o de menor id, #${pl[0].id}), com o bardo da festa #${wb} (#${pl[1].id})`); if (nb !== pl[0].id || wb !== pl[1].id) bad.push('quem dá o pulso da música (a banda, D-890)'); }
      finally { tv.festa = f0; for (const [o, a, i] of keep) { o.act = a; o.inside = i; } G.S.clock = c1; } }
    // (8) the clothes wet with a drink thrown on them (G.Atmos.molhado, T7): darker, the top more than the legs, drying in the world's seconds
    // — a copy of the outfit, never the outfit itself
    const dry = P3.look(cp({})), wet = P3.look(cp({ molhado: { t: (G.S.clock || 0) - 3, k: 'cerveja' } })), gone = P3.look(cp({ molhado: { t: (G.S.clock || 0) - 40, k: 'cerveja' } }));
    const lum = (L, q) => L.out && L.out.lin && L.out.lin[q] ? L.out.lin[q].reduce((a, c) => a + c, 0) : 0; const dry2 = P3.look(cp({}));
    const kC = lum(wet, 'cloth') / (lum(dry, 'cloth') || 1), kP = lum(wet, 'pants') / (lum(dry, 'pants') || 1);
    out.push(`a roupa molhada (${(wet.wet || 0).toFixed(2)}): o pano ×${kC.toFixed(2)}, as calças ×${kP.toFixed(2)}; seca depois de 40 s (${(gone.wet || 0).toFixed(2)}, ×${(lum(gone, 'cloth') / (lum(dry, 'cloth') || 1)).toFixed(2)})`);
    if (!(wet.wet > 0.8 && kC < 0.7 && kP > kC && kP < 1) || gone.wet || lum(gone, 'cloth') !== lum(dry, 'cloth') || lum(dry2, 'cloth') !== lum(dry, 'cloth')) bad.push('a roupa molhada');
  } finally { It.def = def0; }
  if (stubbed.length) out.push(`(o catálogo ainda sem ${stubbed.join(' e ')}: a mão da prova os pôs pelo tipo)`);
  ok('d8 a quarta onda: cada ato com a sua pose, ninguém fazendo o gesto da coisa que não tem, o corpo no chão deitado, as duas partes de cada ato a dois, a bebida no corpo e no rosto pela índole, a vida do salão', !bad.length, out.join(' · ') + (bad.length ? ' — FALHAS: ' + bad.join('; ') : ''));
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
