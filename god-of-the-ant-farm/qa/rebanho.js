// rebanho: o curral de ponta a ponta num mundo pronto, em Node, pelo qa/nodemundo.js — o mundo de verdade: o pastor pelas
// tarefas dele (economy.js: 'herd', 'fodder', 'tend'), os bichos do curral pelo passo deles (animals.js), o armazém e o livro.
//  r1 o pasto: de manhã, com o rebanho com fome, o pastor o leva ao pasto, ele pasta e volta antes de escurecer — todos de
//     novo dentro do curral, nenhum perdido, menos fome
//  r2 o feno: fora das horas do pasto (à tardinha, antes da hora de dormir do pastor), com fome, o pastor traz feno do
//     armazém ('feno', do armazém às mãos) e o rebanho come ('feno', das mãos ao uso): sai do armazém só o que o rebanho comeu
//  r3 a tosquia, a ordenha e os ovos: o que o bicho dá nasce nas mãos pelo livro ('tosquia', 'ordenha', 'ovos') e vai ao
//     armazém ('entrega'); o bicho fica sem lã, sem leite, sem ovos até dar de novo
//  r4 um save com o rebanho no pasto: carregado, o rebanho volta para o curral, nenhum fica solto para sempre
//  r5 o pastor morre no pasto: o rebanho volta sozinho para o curral
//  r6 sem capim em volta do curral (a cidade o cercou de ruas): o pastor não leva o rebanho ao chão nu, e o feno vem do armazém
//     (L-396: levava, e o rebanho voltava com mais fome do que foi) — num mundo sem curral assim, o capim em volta do curral
//     do caso tirado pela mão do deus
//  r7 um bicho do rebanho fechado no cercado de outro (entrou pela porteira atrás do pastor) sai dali e volta ao seu curral
//     (L-468: só o bicho sem curral saía do cercado alheio por qualquer lado, e o caminho de volta não conhece porteiras)
//  r8 o abate cortado no meio: o açougueiro levando um bicho do curral na corda, uma ida de fora o leva (a assembleia): o
//     bicho é solto e volta ao curral — nunca segue quem o levava num afazer que não é mais o dele (L-608)
//  r9 a posição no save: uma vaca a um fio da borda da sua casa, ao lado de um penhasco, salva e carregada — fica na casa dela
//     e volta ao curral; e um save de antes, que a pôs no penhasco: carregado, ela vai para a casa livre mais perto de onde
//     chega ao curral, e volta (L-607: o save arredondava a 95,00 a vaca de 94,996, e ela ficava no penhasco para sempre)
//  r11 o rebanho deixado para trás é posto perto do pastor só num chão onde fica e de onde chega a ele (L-609: era posto em
//     qualquer lugar a uma casa dele, e na metrópole uma ovelha de Ivar foi posta dentro do açougue)
//  r12 o prédio erguido por cima de um bicho: uma vaca no lote de uma casa e outra no meio do lote de 40 m de um teatro, fundados
//     por cima delas — cada uma posta onde fica, de onde chega ao seu curral; e a metrópole vivida: nenhum bicho posto dentro de
//     um prédio que bloqueia pelo prédio que sobe nem pelo nascimento (L-629: ficavam dentro — doze bichos num teatro, galinhas
//     nascidas dentro das casas)
//  r10 a volta sozinha com um chão cercado no caminho: uma vaca do curral posta do outro lado de um cercado alheio (um curral,
//     um cemitério) que o caminho das pessoas atravessa — ela dá a volta e chega ao seu curral (o caminho dela não atravessa
//     cerca alheia senão pela porteira; o das pessoas não conhece cercas, e as vacas de Birka ficaram presas na cerca do
//     cemitério de Óstia depois de um load com o rebanho no pasto — o r4 da 14ª rodada)
//  r13 os bichos da cidade e o curral novo: um curral fundado numa cidade com cães, gatos, galinhas e pombos — nenhum deles entra
//     nele, e ele recebe o seu primeiro rebanho; e um save de antes com eles num curral novo: carregado, soltos, e o curral recebe
//     o rebanho que não veio (L-xx1: a regra do bicho perdido levava todo bicho com dono ao curral ainda sem espécie, e o curral
//     com bichos dentro nunca recebia o seu rebanho — os dezoito gatos, galinhas e pombos de Mênfis, com pastor e sem vaca)
//  r14 o cavalo de carga da caravana nasce onde fica: o mercador à porta de um prédio, e dentro de uma casa — o cavalo num chão onde
//     fica, de onde chega a ele (L-xx2: nascia a um passo do lado dele, e à porta de uma mina o passo era dentro da mina)
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console.
// O corpo do deus não pastoreia (o interact.js não tem o verbo): o salto é das vidas longas da regressão.
//   node qa/rebanho.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/rebanho.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | rebanho ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
// (the snapshot after the trades the world's own step deals out once the world is open — a load gives them back as they
// were saved, L-419, and the ready worlds of the generation 7 are older than the trades of the Patch 2, which the load of
// before dealt at once; the twelve seconds stay for any world, a save of before too, T-298)
M.pronto(world); M.viver(12);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const r2 = x => Math.round(x * 100) / 100;
const seen = []; D.onMove.push(e => { seen.push(e); });
G.inSim++;
const live = (sec, each, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (CUR) seeCut(CUR); if (each) each(); if (until && until()) return true; } return false; };
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = B => QA.check().filter(q => q.sev <= 2 && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
const fit = v => v && !v.captive && !v.jail && !v.aboard && !v.held && v.age >= 16 && v.age < 60;
const GIVES = { ovelha: 'wool', vaca: 'milk', cabra: 'milk', peru: 'eggs' };
// (the grass round a pen, read as the herder reads it: the walkable, free spots of 5 to 13 steps whose nine tiles hold grass
// enough to graze — 1,5 and up, economy.js PASTURE_MIN, L-396 —, counted on the whole ring, no chance drawn)
const pastures = b => { const S0 = S(); const W = G.W; const cx = b.x + b.w / 2, cy = b.y + b.h / 2; let n = 0; for (let y = Math.floor(cy - 13); y <= cy + 13; y++) for (let x = Math.floor(cx - 13); x <= cx + 13; x++) { const r = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (r < 5 || r > 13 || !W.inb(x, y)) continue; const i = W.idx(x, y); if (!W.walkable(i) || S0.type[i] === G.T.RIVER || S0.occ[i]) continue; let g = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = W.idx(G.clamp(x + dx, 0, G.N - 1), G.clamp(y + dy, 0, G.N - 1)); g += S0.veg ? S0.veg[j] : 0.5; if (S0.occ[j]) g -= 0.5; } if (g >= 1.5) n++; } return n; };
// (the pen whose flock gives the most — wool, milk, eggs —, with its herder; for the pasture, one with grass round it — and
// the barest one, for the r6)
function pick(grass) {
  let best = null;
  for (const b of [...S().buildings.values()].sort((p, q) => p.id - q.id)) {
    if ((b.type !== 'curral' && b.type !== 'estabulo') || !b.built) continue;
    const role = G.BDEF[b.type].role; const hs = [...S().villagers.values()].filter(v => v.job === b.id && v.role === role && fit(v));
    const herd = E.penAnimals(b).filter(a => !a.dead); const giving = herd.filter(a => GIVES[a.kind]).length;
    if (!hs.length || herd.length < 2) continue;
    const pa = pastures(b); if (grass ? pa < 12 : pa > 0) continue;
    const sc = giving * 10 + herd.length; if (!best || sc > best.sc) best = { id: b.id, sc };
  }
  return best && best.id;
}
const PEN = pick(true), BARE = pick(false);
if (!PEN) { console.log(`FALHOU | rebanho mundo | ${world}: nenhum curral com pastor, bichos e capim em volta`); process.exit(1); }
{ const b = S().buildings.get(PEN); const herd = E.penAnimals(b); console.log(`${world}: ${V.buildName(b)} #${b.id} de ${S().settlements.get(b.set).name}, ${herd.length} bichos (${[...new Set(herd.map(a => a.kind))].join(', ')}), ${pastures(b)} lugares de pasto em volta${BARE ? `; sem capim em volta: #${BARE}` : ''}`); }
// each case: the pen, its flock (inside, at rest), its herder at the gate; the hour of the case
function setup(time, hunger, pen) {
  fresh(); S().time = time; S().weather.rain = 0; OLD.clear(); CUT.clear();
  const b = S().buildings.get(pen || PEN); const role = G.BDEF[b.type].role;
  const v = [...S().villagers.values()].filter(x => x.job === b.id && x.role === role && fit(x)).sort((p, q) => p.id - q.id)[0];
  const herd = E.penAnimals(b).filter(a => !a.dead).sort((p, q) => p.id - q.id);
  for (const a of herd) { a.state = 'pen'; a.herder = 0; a.ledBy = 0; a.hold = 0; a.x = b.x + 0.5 + ((a.id * 7) % (b.w * 10 - 10)) / 10; a.y = b.y + 0.5 + ((a.id * 3) % (b.h * 10 - 10)) / 10; if (hunger !== undefined) a.hunger = hunger; }
  b.herdCD = 0; b.fedT = 0; E.penDirty();
  // (the beasts of prey round the pen sent away by the god's hand for the case: in the branch joined with 8e432b8 a wolf
  // came on the flock at pasture at 0,20, the herder fought it and hunted it, the flock went home hungry, and the morning's
  // pasture was gone — the r1, the r4 and the r5 are the pasture, not the wolf; the herder driving one off is the world's,
  // T-268 —, T-302)
  for (const a of [...S().animals.values()]) if (!a.dead && G.Animals.predator(a.kind) && G.dist2(a.x, a.y, b.x, b.y) < 40 * 40) G.Animals.remove(a);
  CUR = { b, v, herd, ids: herd.map(a => a.id), base: base() }; return CUR;
}
function send(v, b) {
  G.Vg.endTask(v); if (v.ug && G.Caves) G.Caves.exitNow(v); v.sleeping = false; v.inside = 0; v.energy = 95; v.hunger = 10;
  if (v.carry && v.carry.n > 1e-6 && v.carry.k !== 'water') G.Vg.toStore(v, G.Fac.idOfV(v), 'teste');
  const [fx, fy] = V.frontTile(b); v.x = fx + 0.5; v.y = fy + 0.5; v.path = null; v.think = 0;
  return G.Vg.H.workTask(v);
}
const inPen = (a, b) => a.x >= b.x - 0.2 && a.x <= b.x + b.w + 0.2 && a.y >= b.y - 0.2 && a.y <= b.y + b.h + 0.2;
const flock = P => P.ids.map(id => S().animals.get(id)).filter(a => a && !a.dead);
const avgH = L => r2(L.reduce((s, a) => s + a.hunger, 0) / Math.max(1, L.length));
// (one of the flock who died of old age in the case is no beast lost — in the generation 7 the oldest ewe of Birka, of 11,6
// years, dies in the pen in the first minute of the morning, T-268 —; one taken by a wolf, or gone, is. Seen while it lies there:
// a dead beast does not go into the save, and after a load it is simply not in the world)
const OLD = new Set();
const seeOld = P => { for (const id of P.ids) { const a = S().animals.get(id); if (a && a.dead && a.cause === 'old') OLD.add(id); } };
const aged = P => { seeOld(P); return P.ids.filter(id => OLD.has(id)); };
// (and one the town's butcher led off to the slaughter in the case — the world's own errand, economy.js runSlaughter, which
// takes the beast out of the world —: no fault of the herder's either. In the generation-13 metropole the butcher of Ribe took
// a ewe of the pen at 0,405 while its herder lay dead, and the flock came home 7 of 7, T-390. Seen at every step of the case,
// while the beast is led — after, it is no longer in the world)
const CUT = new Set(); let CUR = null;
const seeCut = P => { for (const id of P.ids) { const a = S().animals.get(id); const by = a && a.state === 'led' && a.ledBy && S().villagers.get(a.ledBy); if (by && by.role === 'acougueiro') CUT.add(id); } };
const home = P => { const L = flock(P); const old = aged(P).filter(id => !L.some(a => a.id === id)).length; const cut = P.ids.filter(id => CUT.has(id) && !L.some(a => a.id === id) && !OLD.has(id)).length; return { n: L.length, old, cut, all: L.length + old + cut === P.ids.length, pen: L.filter(a => a.state === 'pen').length, inside: L.filter(a => inPen(a, P.b)).length }; };
const oldSaid = H => (H.old ? ` (${H.old} morreu de velhice no caminho do caso)` : '') + (H.cut ? ` (${H.cut} levad${H.cut === 1 ? 'o' : 'os'} pelo açougueiro)` : '');

// r1 the pasture
{
  const P = setup(0.15, 0.5); const t0 = send(P.v, P.b); const h0 = avgH(P.herd);
  const out = live(90, null, () => P.v.task && P.v.task.type === 'herd' && P.v.task.st === 3);
  const went = flock(P).filter(a => a.state === 'herd' && a.herder === P.v.id).length;
  // (back from the pasture: the herder's own way home, st 4, done — a wolf that makes him fight, or a danger that makes him run,
  // ends the herding for a while, and he takes it up again: in the generation 7 a wolf comes at 0,20, T-268)
  let home4 = false; const fights = new Set();
  const back = live(150, () => { const t = P.v.task; if (t && t.type === 'herd' && t.st === 4) home4 = true; if (t && t.type !== 'herd') fights.add(t.type); }, () => home4 && !(P.v.task && P.v.task.type === 'herd'));
  live(90, null, () => { const H = home(P); return H.pen === H.n && H.inside === H.n; });
  const H = home(P); const h1 = avgH(flock(P)); const bad = newBad(P.base);
  ok('r1', !!t0 && t0.type === 'herd' && out && went + H.old >= P.ids.length && back && H.all && H.pen === H.n && H.inside === H.n && h1 < h0 && S().time < 0.75 && !bad.length,
    `${P.v.name} (${t0 ? t0.type : 'sem tarefa'}): ${went} de ${P.ids.length} foram ao pasto${fights.size ? ` (no meio: ${[...fights].join(', ')})` : ''}; ${back ? 'voltaram' : 'não voltaram'} (hora ${r2(S().time)}); no curral ${H.pen} de ${H.n}${oldSaid(H)} (dentro da cerca ${H.inside}); a fome ${h0} → ${h1}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r2 hay when the flock cannot graze: the evening, past the pasture's hours (economy.js pastorTask: hay from the store for a
// hungry flock when there is no pasture now) and before the herder's own bed — the clock of each one, G.Lar.clock: a grown-up
// goes to bed between 0,74 and 0,83, and the night falls at 0,73. The case was «de noite», at 0,86: since the clock (D-071)
// the herder is in bed then, and the world's step put him to bed at his first thought, before the store — Moctezuma, of the
// generation-9 and -10 metropole, whose bed is at 0,775: nothing out of the store, nothing eaten, T-327
{
  const P = setup(0.62, 0.6); const f = G.Fac.ofV(P.v); if (D.free('f:' + f.id, 'food') < 12) D.make('f:' + f.id, 'food', 12, { code: 'teste', part: true });
  const L0 = seen.length; const t0 = send(P.v, P.b); const h0 = avgH(P.herd);
  live(120, null, () => seen.slice(L0).some(e => e[8] === 'feno' && e[3] === 'v:' + P.v.id));
  live(2);
  const took = r2(seen.slice(L0).filter(e => e[8] === 'feno' && e[3] === 'f:' + f.id && e[4] === 'v:' + P.v.id).reduce((s, e) => s + e[6], 0));
  const ate = r2(seen.slice(L0).filter(e => e[8] === 'feno' && e[3] === 'v:' + P.v.id && e[4] === '@uso').reduce((s, e) => s + e[6], 0));
  // (what of the hay went back to the store from his hands — a fodder cut on the way puts the load back at its place, L-186:
  // in the metrópole of the generation 15 Gunnar took 8, put them back ('entrega'), took 8 again and fed them, T-501 —: the
  // store gives out only what the flock ate, the hay that came back off the count)
  const i0 = seen.slice(L0).findIndex(e => e[8] === 'feno' && e[3] === 'f:' + f.id && e[4] === 'v:' + P.v.id);
  const sum = (L, p) => L.filter(p).reduce((s, e) => s + e[6], 0); const after = i0 < 0 ? [] : seen.slice(L0 + i0);
  const back = r2(sum(after, e => e[3] === 'v:' + P.v.id && e[4] === 'f:' + f.id && e[5] === 'food') - sum(after, e => e[3] === '@mundo' && e[4] === 'v:' + P.v.id && e[5] === 'food')); // (food born in his hands meanwhile — a milking — and delivered is not hay)
  const hands = P.v.carry && P.v.carry.hay ? r2(P.v.carry.n) : 0; const h1 = avgH(flock(P)); const bad = newBad(P.base);
  ok('r2', !!t0 && t0.type === 'fodder' && took > 0 && ate > 0 && Math.abs(took - back - ate) < 0.01 && !hands && h1 < h0 && !bad.length,
    `${P.v.name} à tardinha (${t0 ? t0.type : 'sem tarefa'}; dorme às ${r2(G.Lar.clock(P.v).bed)}): do armazém às mãos ${took} de feno${back ? `, de volta ao armazém ${back}` : ''}, comido ${ate}, ainda nas mãos ${hands}; a fome ${h0} → ${h1}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r3 shearing, milking, eggs
{
  // (the afternoon: past the hour of the pasture, a flock not hungry — the herder's work is the tending; three of them ready —,
  // with the afternoon long enough for the three before the evening's free hours, 0,6, take the herder to the square and the
  // tavern: at 0,5 Moctezuma tended two of Tenochtitlan's turkeys and went out for the evening, T-327)
  const P = setup(0.43, 0.1); const f = G.Fac.ofV(P.v); const ready = P.herd.filter(a => GIVES[a.kind] && a.grown >= 1).slice(0, 3);
  // (only those three have anything to give: the rest of the flock was tended this morning)
  for (const a of P.herd) if (GIVES[a.kind]) a[GIVES[a.kind]] = 0;
  for (const a of ready) { a[GIVES[a.kind]] = 1.5; a.tended = 0; if (a.kind === 'ovelha') a.shorn = 0; }
  // (room in the people's store for what the flock gives, kept by the god for the whole case — the town's other deliveries fill
  // it meanwhile —: a full store takes nothing at its door — the delivery's 'sem-lugar', lost with its line —, and the case is
  // the giving and the delivery, not the room. Tenochtitlan's store was full of food: of the 10 of eggs, 2 were lost at its
  // door, T-327)
  const GOODS = ['food', 'la', 'queijo'].filter(k => k === 'food' || k in G.Eco.GOODS);
  const keepRoom = () => { for (const k of GOODS) { const room = V.cap(f.id) - (f.stock[k] || 0); if (room < 12) D.use('f:' + f.id, k, 12 - room, { code: 'teste', part: true }); } };
  keepRoom();
  // (and the herder's house with its water full, by the god's hand, as lazer.js and obra-longe.js bring theirs: the house's
  // jar low sends one of the house to the well — the world's own errand —, and in the generation-12 metropole Meresankh took
  // a fifth of the afternoon to fetch it, tended one cow of Mênfis and went home for the evening, T-375)
  { const h = S().buildings.get(P.v.home); if (h) { h.water = 1; h.waterTry = undefined; } }
  const L0 = seen.length;
  send(P.v, P.b);
  // (one of the three dead of old age in the case gives nothing, and is no fault of the herder's — the oldest ewe of Birka dies
  // in the first minute, T-268 —: the others give; the case waits for them, not for the dead one, T-302)
  // (nor one the town's butcher leads off to the slaughter in the case — the world's own errand, as in the r1, the r4 and the
  // r5, T-390: in the metrópole of the generation 15 he took the third ready cow of Birka's pen at 0,63, before its milking, T-501)
  const dueNow = () => ready.filter(a => !(a.dead && a.cause === 'old') && !CUT.has(a.id));
  // (each one seen giving — what it had down to nothing, the tending's mark, economy.js —, at the step it gave: a turkey lays
  // again in a third of a day (animals.js), and the first ones laid again before the third was tended, and counted as not
  // given — only the tending takes it down, T-327)
  const gave = new Set(); const seeGive = () => { keepRoom(); for (const a of ready) if (!gave.has(a.id) && a[GIVES[a.kind]] < 1) gave.add(a.id); };
  live(300, seeGive, () => dueNow().every(a => gave.has(a.id)) && !(P.v.carry && P.v.carry.n > 1e-6));
  const made = {}, sent = {}; const L = seen.slice(L0);
  for (const e of L) { if (e[3] === '@mundo' && e[4] === 'v:' + P.v.id && ['tosquia', 'ordenha', 'ovos'].includes(e[8])) made[e[5]] = r2((made[e[5]] || 0) + e[6]); if (e[3] === 'v:' + P.v.id && String(e[4]).startsWith('f:') && e[8] === 'entrega') sent[e[5]] = r2((sent[e[5]] || 0) + e[6]); }
  const due = dueNow();
  const given = due.filter(a => gave.has(a.id)).length; const bad = newBad(P.base);
  const same = Object.keys(made).length > 0 && Object.keys(made).every(k => Math.abs((sent[k] || 0) - made[k]) < 0.01);
  ok('r3', due.length > 0 && given === due.length && same && !(P.v.carry && P.v.carry.n > 1e-6) && !bad.length,
    `${ready.length} bicho(s) prontos (${[...new Set(ready.map(a => a.kind))].join(', ')})${ready.some(a => a.dead && a.cause === 'old') ? `, ${ready.filter(a => a.dead && a.cause === 'old').length} morreu de velhice no caso` : ''}${ready.some(a => CUT.has(a.id)) ? `, ${ready.filter(a => CUT.has(a.id)).length} levad${ready.filter(a => CUT.has(a.id)).length === 1 ? 'o' : 'os'} pelo açougueiro` : ''}: deram ${given} de ${due.length}; nasceu nas mãos pelo livro ${JSON.stringify(made)}, ao armazém ${JSON.stringify(sent)}; ${f ? '' : 'sem povo; '}nas mãos no fim ${P.v.carry ? r2(P.v.carry.n) + ' de ' + P.v.carry.k : 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r4 a save with the flock out at pasture
{
  const P = setup(0.15, 0.5); send(P.v, P.b);
  const out = live(90, null, () => P.v.task && P.v.task.type === 'herd' && P.v.task.st === 3); live(4);
  const went = flock(P).filter(a => a.state === 'herd').length;
  seeOld(P); M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1);
  P.b = S().buildings.get(PEN);
  live(120, null, () => { const H = home(P); return H.pen === H.n && H.inside === H.n; });
  const H = home(P); const bad = newBad(P.base);
  ok('r4', out && went > 0 && H.all && H.pen === H.n && H.inside === H.n && !bad.length,
    `save com ${went} no pasto: depois do load, no curral ${H.pen} de ${H.n}${oldSaid(H)} (dentro da cerca ${H.inside})${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r5 the herder dies at pasture
{
  const P = setup(0.15, 0.5); send(P.v, P.b);
  const out = live(90, null, () => P.v.task && P.v.task.type === 'herd' && P.v.task.st === 3); live(4);
  const went = flock(P).filter(a => a.state === 'herd').length; V.kill(P.v, 'wolf');
  live(120, null, () => { const H = home(P); return H.pen === H.n && H.inside === H.n; });
  const H = home(P); const bad = newBad(P.base);
  ok('r5', out && went > 0 && H.all && H.pen === H.n && H.inside === H.n && !bad.length,
    `${P.v.name} morreu com ${went} no pasto: no curral ${H.pen} de ${H.n}${oldSaid(H)} (dentro da cerca ${H.inside})${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r6 no grass near: the herder does not lead the flock to bare ground, and the hay comes (L-396: the pastor of a city's pen led
// the flock to the bare streets round it, and it came back hungrier than it went). The world's barest pen; in a world whose
// pens all have grass round them, the case's pen with the grass round it gone — the god's hand, a drought there: the case is
// the herder's choice, not where the world has a pen without grass
{
  const P = setup(0.15, 0.6, BARE || PEN); const f = G.Fac.ofV(P.v); if (D.free('f:' + f.id, 'food') < 12) D.make('f:' + f.id, 'food', 12, { code: 'teste', part: true });
  // (the grass is made by the beasts' first step after a load — S.veg does not go into the save —: a tenth of a second first)
  if (!BARE) { M.viver(0.1); const cx = P.b.x + P.b.w / 2, cy = P.b.y + P.b.h / 2; for (let y = Math.floor(cy - 15); y <= cy + 15; y++) for (let x = Math.floor(cx - 15); x <= cx + 15; x++) if (G.W.inb(x, y) && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 15) S().veg[G.W.idx(x, y)] = 0; }
  const L0 = seen.length; const t0 = send(P.v, P.b);
  let out = 0, at = null; const hay = live(120, () => { const n = flock(P).filter(a => a.state === 'herd').length; if (n > out) out = n; const t = P.v.task; if (!at && t && t.type === 'herd' && t.px !== undefined) at = [t.px, t.py]; }, () => seen.slice(L0).some(e => e[8] === 'feno' && e[4] === 'v:' + P.v.id));
  const grassAt = p => { let g = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) g += S().veg[G.W.idx(G.clamp(Math.floor(p[0]) + dx, 0, G.N - 1), G.clamp(Math.floor(p[1]) + dy, 0, G.N - 1))]; return r2(g); };
  const bad = newBad(P.base);
  ok('r6', !out && hay && !bad.length, `${V.buildName(P.b)} #${P.b.id} de ${S().settlements.get(P.b.set).name}, ${BARE ? 'sem capim em volta' : `o capim em volta tirado pela mão do deus (${pastures(P.b)} lugares de pasto)`}, o rebanho com fome (0,6): ${P.v.name} (${t0 ? t0.type : 'sem tarefa'}) ${out ? `LEVOU ${out} ao chão sem capim${at ? ` (${r2(at[0])},${r2(at[1])}, capim ${grassAt(at)})` : ''}` : 'não o levou ao pasto'}; o feno ${hay ? 'veio do armazém (\'feno\')' : 'NÃO veio em 120 s'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// r7 a beast of the flock shut in someone else's pen walks out and home (L-468: following the herder, a beast goes in at
// the gate of a pen on his way — the gates let anyone in —, and only a beast with no pen could leave someone else's pen by
// any side: in the generation 11's Texcoco a turkey of the case's flock went in at the gate of the pen by the road on the
// way home after the load of the r4, and its way home — the people's, with no gates in it — pressed it against the fence
// for good). Put down by the god's hand inside the nearest other fenced ground it can walk to — a pen, a stable, a captives'
// pen, a graveyard —, on a tile of it the beast can stand on and walk home from, at rest, past the pasture's hours
{
  const P = setup(0.5, 0.1); const b = P.b; const FEN = { curral: 1, estabulo: 1, cercado: 1, cemetery: 1 };
  const [gx, gy] = [b.x + b.w / 2, b.y + b.h + 0.4];
  const other = [...S().buildings.values()].filter(o => FEN[o.type] && o.built && o.id !== b.id && G.W.canWalk(o.x + o.w / 2, o.y + o.h + 0.4, gx, gy)).sort((p, q) => G.dist2(p.x, p.y, b.x, b.y) - G.dist2(q.x, q.y, b.x, b.y) || p.id - q.id)[0];
  const a = P.herd.slice().sort((p, q) => p.age / G.Animals.DEF[p.kind].life - q.age / G.Animals.DEF[q.kind].life || p.id - q.id)[0]; // (the youngest: none dies of old age in the case)
  if (!other || !a) ok('r7', true, `${other ? 'sem bicho no curral' : 'nenhum outro chão cercado a que o rebanho chegue a pé'}: sem o caso`);
  else {
    // (on a tile of that ground the beast can stand on and walk home from, the nearest its own gate: the middle of Curral
    // #12229, in the metrópole of the generation 15, is a wall that crosses the pen — the cow put on it could not take a step —,
    // and the pen's north row is on the other side of that wall, T-501)
    const mid = [other.x + other.w / 2, other.y + other.h / 2]; const spots = [];
    for (let y = other.y; y < other.y + other.h; y++) for (let x = other.x; x < other.x + other.w; x++) if (G.Animals.walkOK(a, x + 0.5, y + 0.5) && G.W.canWalk(x + 0.5, y + 0.5, gx, gy)) spots.push([x + 0.5, y + 0.5]);
    spots.sort((p, q) => G.dist2(p[0], p[1], gx, gy) - G.dist2(q[0], q[1], gx, gy) || p[1] - q[1] || p[0] - q[0]);
    const sp = spots[0] || mid;
    a.x = sp[0]; a.y = sp[1]; a.tx = a.x; a.ty = a.y; a.path = null; a.noGo = undefined; a.blk = 0; a.stk = 0;
    const d0 = r2(G.dist(a.x, a.y, b.x + b.w / 2, b.y + b.h / 2)); let outAt = null, c0 = S().clock;
    const back = live(90, () => { if (outAt === null && G.W.fenceMap()[G.W.idx(a.x, a.y)] !== other.id) outAt = r2(S().clock - c0); }, () => a.dead || (a.state === 'pen' && inPen(a, b)));
    const bad = newBad(P.base);
    ok('r7', back && !a.dead && !bad.length, `${a.kind} #${a.id} do ${V.buildName(b)} #${b.id} posto em (${r2(sp[0])},${r2(sp[1])}), dentro de ${V.buildName(other)} #${other.id} (${other.type}), a ${d0} casas do seu: ${outAt === null ? 'NÃO SAIU de lá' : `saiu em ${outAt} s`}; ${back ? `no seu curral em ${r2(S().clock - c0)} s` : `não voltou ao seu curral em 90 s (em ${r2(a.x)},${r2(a.y)}, ${a.state})`}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// r8 the slaughter cut in the middle (L-608): the butcher of the pen's people leads a beast of it on a rope to his shop
// ('slaughter', economy.js runSlaughter), and on the way an errand from outside takes him — a call to the square to watch
// something, a minute long, 1,7 over the slaughter's 1 —: the beast is let go at once, back to its pen, never led about by one
// whose errand is no longer about it (a beast stayed led while its leader had any task at all: with the slaughter cut, three
// cows of Birka followed the butcher about for 400 s and more, in the metrópole of the generation 15 — the r3 of the round 13)
{
  const P = setup(0.5, 0.1); const b = P.b; const fac = V.facOfSet(b.set);
  const shop = v => S().buildings.get(v.job);
  const bu = [...S().villagers.values()].filter(v => v.role === 'acougueiro' && fit(v) && shop(v) && shop(v).built && V.facOfSet(shop(v).set) === fac).sort((p, q) => p.id - q.id)[0];
  const a = P.herd.filter(x => x.grown >= 1).sort((p, q) => p.age / G.Animals.DEF[p.kind].life - q.age / G.Animals.DEF[q.kind].life || p.id - q.id)[0]; // (the youngest grown one: none dies of old age in the case)
  if (!bu || !a) ok('r8', false, `${bu ? '' : 'nenhum açougueiro do povo do curral; '}${a ? '' : 'nenhum bicho crescido no curral'}`);
  else {
    // (the butcher at the pen's gate, awake, out of doors, hands empty, and his errand the slaughter of that beast — as the
    // butcher's own choice gives it, economy.js butcherTask)
    G.Vg.endTask(bu); if (bu.ug && G.Caves) G.Caves.exitNow(bu); bu.sleeping = false; bu.inside = 0; bu.energy = 95; bu.hunger = 10;
    if (bu.carry && bu.carry.n > 1e-6 && bu.carry.k !== 'water') G.Vg.toStore(bu, G.Fac.idOfV(bu), 'teste');
    bu.x = b.x + b.w / 2; bu.y = b.y + b.h + 0.4; bu.path = null; bu.think = 0;
    G.Vg.H.setTask(bu, { type: 'slaughter', id: bu.job, pen: b.id, a: a.id, pri: 1 });
    const led = live(40, null, () => a.state === 'led' && a.ledBy === bu.id);
    const st1 = !!(bu.task && bu.task.type === 'slaughter' && bu.task.st === 1); // (on the way to the shop, the beast on the rope)
    const set = S().settlements.get(bu.set);
    const took = led && st1 && G.Vg.give(bu, { type: 'olhar', x: set.cx, y: set.cy, fx: set.cx + 1, fy: set.cy, pri: 1.7, until: S().clock + 60, what: 'praça', kind: 'olhar' });
    // (then the world: the butcher goes to the square for a minute; the beast, let go, goes home — how long it stayed on the rope
    // after the cut, and how far it followed him)
    let ledT = 0, far = 0; const c0 = S().clock, x0 = a.x, y0 = a.y;
    const back = took && live(90, () => { if (a.state === 'led') { ledT = r2(S().clock - c0); far = Math.max(far, r2(G.dist(a.x, a.y, x0, y0))); } }, () => a.dead || (a.state === 'pen' && !a.ledBy && inPen(a, b)));
    const bad = newBad(P.base);
    ok('r8', led && st1 && took && ledT <= 0.5 && back && !a.dead && a.state !== 'led' && !a.ledBy && !bad.length,
      `${bu.name} (açougueiro) levando ${a.kind} #${a.id} do ${V.buildName(b)} #${b.id}: ${led ? 'na corda' : 'NÃO a pegou em 40 s'}${led ? (st1 ? ', a caminho do açougue' : ` (a tarefa ${bu.task ? bu.task.type + '.' + bu.task.st : 'nenhuma'})`) : ''}; a chamada à praça ${took ? 'o levou' : 'NÃO o levou'}; depois: ${ledT > 0.5 ? `o bicho SEGUIU NA CORDA de ${bu.name} por ${ledT} s, ${far} m` : 'solto logo'}; ${a.dead ? 'o bicho morreu' : a.state === 'led' ? `ainda na corda (${bu.task ? bu.task.type : 'sem tarefa'})` : back ? `no seu curral em ${r2(S().clock - c0)} s` : `não voltou ao curral em 90 s (em ${r2(a.x)},${r2(a.y)}, ${a.state})`}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// r9 the positions in the save (L-607): the save keeps a hundredth of a tile, and rounded a cow of 94,996 to 95,00 — across the
// edge of its tile, onto a cliff by it: loaded where no beast stands, every way of it home failed and it stayed there for good
// (the r4 of the metrópole of the generation 15). A cow of the pen put a hair from the edge of a tile it stands on, by a cliff
// across that edge — the tile nearest the pen's gate with a cliff east or south of it, from where the gate is reached, off any
// fence —: saved and loaded, it is still in its tile and goes home; and a save of before (its version, 4, and the position as
// its rounding wrote it, on the cliff): loaded, the cow is on the nearest ground it stands on from where it reaches its pen, and
// goes home
{
  const P = setup(0.5, 0.1); const b = P.b; const W = G.W; const [gx, gy] = [b.x + b.w / 2, b.y + b.h + 0.4];
  const a = P.herd.slice().sort((p, q) => p.age / G.Animals.DEF[p.kind].life - q.age / G.Animals.DEF[q.kind].life || p.id - q.id)[0];
  let sp = null;
  if (a) for (let y = b.y - 15; y <= b.y + b.h + 15; y++) for (let x = b.x - 15; x <= b.x + b.w + 15; x++) {
    if (!W.inb(x, y) || !W.inb(x + 1, y + 1) || W.fenceMap()[W.idx(x, y)] || !G.Animals.walkOK(a, x + 0.5, y + 0.5) || !W.canWalk(x + 0.5, y + 0.5, gx, gy)) continue;
    for (const [dx, dy] of [[1, 0], [0, 1]]) { if (!S().cliff[W.idx(x + dx, y + dy)] || G.Animals.walkOK(a, x + dx + 0.5, y + dy + 0.5)) continue;
      const d = G.dist2(x + 0.5, y + 0.5, gx, gy); if (!sp || d < sp.d) sp = { x, y, dx, dy, d }; }
  }
  if (!a || !sp) ok('r9', false, a ? `nenhuma casa com penhasco ao lado a 15 casas do ${V.buildName(b)} #${b.id}` : 'sem bicho no curral');
  else {
    const put = () => { const c = S().animals.get(a.id); c.state = 'pen'; c.herder = 0; c.ledBy = 0; c.hold = 0; c.x = sp.dx ? sp.x + 0.996 : sp.x + 0.5; c.y = sp.dy ? sp.y + 0.996 : sp.y + 0.5; c.tx = c.x; c.ty = c.y; c.path = null; c.noGo = undefined; c.blk = 0; c.stk = 0; return c; };
    const goneHome = () => live(60, null, () => { const c = S().animals.get(a.id); return !c || c.dead || (c.state === 'pen' && inPen(c, S().buildings.get(PEN))); });
    const where = c => c ? `(${c.x.toFixed(3)},${c.y.toFixed(3)})${G.Animals.walkOK(c, c.x, c.y) ? '' : ', ONDE NÃO PODE FICAR'}${c.noGo ? ', DESISTIU DO CAMINHO' : ''}` : 'sumiu';
    // (saved and loaded now)
    const c0 = put(); const at0 = `(${c0.x.toFixed(3)},${c0.y.toFixed(3)})`;
    M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1);
    const c1 = S().animals.get(a.id); const in1 = !!c1 && Math.floor(c1.x) === sp.x && Math.floor(c1.y) === sp.y && G.Animals.walkOK(c1, c1.x, c1.y); const at1 = where(c1);
    const home1 = goneHome();
    // (a save of before: the version 4, the position as its rounding put it — on the cliff)
    const c2 = put(); const o = JSON.parse(G.Save.serialize()); o.v = 4; const ao = o.animals.find(q => q.id === a.id); ao.x = Math.round(c2.x * 100) / 100; ao.y = Math.round(c2.y * 100) / 100;
    M.reseed(4242); G.Save.apply(o); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); G.inSim = Math.max(G.inSim, 1);
    const c3 = S().animals.get(a.id); const ok3 = !!c3 && G.Animals.walkOK(c3, c3.x, c3.y) && W.canWalk(c3.x, c3.y, gx, gy); const at3 = where(c3);
    const home3 = goneHome();
    const bad = newBad(P.base);
    ok('r9', in1 && home1 && ok3 && home3 && !bad.length,
      `${a.kind} #${a.id} em ${at0}, na casa (${sp.x},${sp.y}) com o penhasco em (${sp.x + sp.dx},${sp.y + sp.dy}): salva e carregada, em ${at1}${in1 ? ', na casa dela' : ', FORA DA CASA DELA'}; ${home1 ? 'voltou ao curral' : 'NÃO voltou ao curral em 60 s'}; um save de antes (versão 4, ${ao.x.toFixed(2)},${ao.y.toFixed(2)}): carregada em ${at3}${ok3 ? ', de onde chega ao curral' : ''}; ${home3 ? 'voltou ao curral' : 'NÃO voltou ao curral em 60 s'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// r10 home alone with a fenced ground on the way: a cow of the pen put on the far side of someone else's fenced ground — a pen,
// a stable, a captives' pen, a graveyard, within 25 tiles —, on a tile it stands on, off any fence, from where the people's way
// to its pen runs across that ground (not by its gate): no herder, at rest, past the pasture's hours — it goes round and
// reaches its pen. The people's way knows no fences, and the beast walking it alone was pressed against the fence for good
{
  const P = setup(0.5, 0.1); const b = P.b; const W = G.W; const F = W.fenceMap(); const FEN = { curral: 1, estabulo: 1, cercado: 1, cemetery: 1 };
  const [cx, cy] = [b.x + b.w / 2, b.y + b.h / 2];
  const a = P.herd.slice().sort((p, q) => p.age / G.Animals.DEF[p.kind].life - q.age / G.Animals.DEF[q.kind].life || p.id - q.id)[0];
  // (the people's way from a point to the pen's middle crosses the fenced ground fg — sampled every quarter of a tile)
  const across = (x, y, fg) => { const p = W.findPath(x, y, cx, cy, true, 3500); if (!p) return false; for (let k = 1; k < p.length; k++) { const [x0, y0] = p[k - 1], [x1, y1] = p[k]; const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25); for (let q = 0; q <= n; q++) if (F[W.idx(x0 + (x1 - x0) * q / n, y0 + (y1 - y0) * q / n)] === fg.id) return true; } return false; };
  let got = null;
  if (a) for (const fg of [...S().buildings.values()].filter(o => FEN[o.type] && o.built && o.id !== b.id && G.dist(o.x, o.y, b.x, b.y) < 25).sort((p, q) => G.dist2(p.x, p.y, b.x, b.y) - G.dist2(q.x, q.y, b.x, b.y) || p.id - q.id)) {
    const ring = []; for (let y = fg.y - 1; y <= fg.y + fg.h; y++) for (let x = fg.x - 1; x <= fg.x + fg.w; x++) if (x < fg.x || x >= fg.x + fg.w || y < fg.y || y >= fg.y + fg.h) ring.push([x, y]);
    const sp = ring.find(([x, y]) => W.inb(x, y) && !F[W.idx(x, y)] && G.Animals.walkOK(a, x + 0.5, y + 0.5) && W.canWalk(x + 0.5, y + 0.5, cx, cy) && across(x + 0.5, y + 0.5, fg));
    if (sp) { got = { fg, sp }; break; }
  }
  if (!a || !got) ok('r10', false, a ? `nenhum chão cercado a 25 casas do ${V.buildName(b)} #${b.id} que o caminho das pessoas até ele atravesse` : 'sem bicho no curral');
  else {
    const { fg, sp } = got; a.x = sp[0] + 0.5; a.y = sp[1] + 0.5; a.tx = a.x; a.ty = a.y; a.path = null; a.noGo = undefined; a.blk = 0; a.stk = 0; a.state = 'pen'; a.herder = 0; a.ledBy = 0; a.hold = 0;
    const c0 = S().clock; let inside = false;
    const back = live(120, () => { if (F[W.idx(a.x, a.y)] === fg.id) inside = true; }, () => a.dead || (a.state === 'pen' && inPen(a, b)));
    const bad = newBad(P.base);
    ok('r10', back && !a.dead && !bad.length, `${a.kind} #${a.id} do ${V.buildName(b)} #${b.id} posta em (${sp[0]},${sp[1]}), do outro lado de ${V.buildName(fg)} #${fg.id} (${fg.type}, de ${(S().settlements.get(fg.set) || {}).name}), que o caminho das pessoas atravessa: ${back ? `no seu curral em ${r2(S().clock - c0)} s${inside ? ' (passando por dentro, pela porteira)' : ' (dando a volta)'}` : `NÃO chegou ao curral em 120 s (em ${r2(a.x)},${r2(a.y)}, ${a.state}${a.noGo ? ', desistiu do caminho' : ''})`}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// r11 the flock left behind, set down by the herder (L-609): a beast of the flock more than 14 tiles from its herder is brought
// to him (animals.js) — set anywhere within a tile of him, and in the metrópole of the round 14 a sheep of Ivar's was set
// inside the butcher's shop. The herder out with the flock, put down by the god's hand, again and again, on the street tiles
// round the pen with the most ground a cow does not stand on about them (houses, walls, rocks), each more than 16 tiles from
// the one before: each time the flock is brought across the gap, and every beast is set where it stands, from where it
// reaches him
{
  const P = setup(0.15, 0.5); send(P.v, P.b); const b = P.b; const W = G.W; const F = W.fenceMap();
  const went = live(90, null, () => P.v.task && P.v.task.type === 'herd' && flock(P).some(a => a.state === 'herd' && a.herder === P.v.id));
  const cow = flock(P)[0] || { kind: 'vaca' };
  const tight = (x, y) => { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && !G.Animals.walkOK(cow, x + dx + 0.5, y + dy + 0.5)) n++; return n; };
  const cand = [];
  for (let y = b.y - 30; y <= b.y + 30; y++) for (let x = b.x - 30; x <= b.x + 30; x++) {
    if (!W.inb(x, y) || F[W.idx(x, y)] || !W.walkable(W.idx(x, y)) || S().type[W.idx(x, y)] === G.T.RIVER || !G.Animals.walkOK(cow, x + 0.5, y + 0.5)) continue;
    const n = tight(x, y); if (n >= 4 && W.canWalk(x + 0.5, y + 0.5, b.x + b.w / 2, b.y + b.h + 0.4)) cand.push([x, y, n]);
  }
  cand.sort((p, q) => q[2] - p[2] || p[1] - q[1] || p[0] - q[0]);
  const seq = []; let at = [P.v.x, P.v.y]; for (let k = 0; k < 40 && seq.length < 14; k++) { const c = cand.find(q => !seq.includes(q) && G.dist(q[0] + 0.5, q[1] + 0.5, at[0], at[1]) > 16 && flock(P).every(a => G.dist(a.x, a.y, q[0] + 0.5, q[1] + 0.5) > 15)); if (!c) break; seq.push(c); at = [c[0] + 0.5, c[1] + 0.5]; }
  let n = 0; const bad = [];
  for (const c of seq) {
    if (!(P.v.task && P.v.task.type === 'herd')) break;
    P.v.x = c[0] + 0.5; P.v.y = c[1] + 0.5; P.v.path = null; // (the god's hand)
    M.viver(0.1);
    for (const a of flock(P)) if (a.state === 'herd' && a.herder === P.v.id && G.dist(a.x, a.y, P.v.x, P.v.y) < 2.5) { n++; if (!G.Animals.walkOK(a, a.x, a.y) || !W.canWalk(a.x, a.y, P.v.x, P.v.y)) { const i = W.idx(a.x, a.y); const o = S().occ[i] && S().buildings.get(S().occ[i]); bad.push(`${a.kind} #${a.id} em (${r2(a.x)},${r2(a.y)}) ${o ? 'dentro de ' + V.buildName(o) : S().cliff[i] ? 'num penhasco' : S().wall[i] ? 'num muro' : 'onde não fica'}`); } }
  }
  const bd = newBad(P.base);
  ok('r11', went && n >= 10 && !bad.length && !bd.length, `${P.v.name} com o rebanho (${went ? 'no pastoreio' : 'NÃO saiu com o rebanho'}), posto pela mão do deus em ${seq.length} ruas apertadas (de ${cand.length}): ${n} vez(es) um bicho trazido para perto dele; ${bad.length ? bad.length + ' posto(s) onde não fica — ' + bad.slice(0, 4).join(' · ') : 'todos num chão onde ficam, de onde chegam a ele'}${bd.length ? '; ' + bd.join(' · ') : ''}`);
}
// r12 a building raised over a beast (L-629): the lot put on the map (Village.addBuilding) left the beasts on it inside a
// building that blocks — twelve beasts in a theatre of the metrópole, a buffalo in a granary, a cat in a market. Two cows of the
// pen held still, one on a free tile by the pen and one in the middle of a free lot of 10 by 10 (40 m: five tiles from its
// edge) near it, and on each a building founded by the game's door (Village.startProject at the lot: a house, and the
// monumental theatre the pen's people know how to raise), raised whole: each cow out of the lot, where it stands, from where it
// reaches its pen. And the metrópole lived three hundred seconds: no beast set inside a building that blocks by the building
// raised over it, nor by its birth (a hen hatched by the door of a house came out inside the house)
{
  const P = setup(0.5, 0.1); const b = P.b; const W = G.W; const set = S().settlements.get(b.set);
  const herd = P.herd.slice().sort((p, q) => p.age / G.Animals.DEF[p.kind].life - q.age / G.Animals.DEF[q.kind].life || p.id - q.id);
  const [ca, cb] = herd; const [hx, hy] = [b.x + b.w / 2, b.y + b.h / 2];
  // (a lot as the god's hand takes one — Village.handFound: the lot and the ring round it dry, free of buildings, walls and
  // fences, no main street on it —, its middle ground a cow stands on, the ring reached from the pen)
  const free = (x, y, n) => { for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (!W.inb(tx, ty) || tx < 2 || ty < 2 || tx >= G.N - 2 || ty >= G.N - 2) return false; const i = W.idx(tx, ty); if (S().occ[i] || S().wall[i] || S().type[i] < G.T.SAND || W.fenceMap()[i]) return false; if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S().road[i] >= 2 || S().fire[i] > 0)) return false; }
    const m = [x + Math.floor(n / 2), y + Math.floor(n / 2)]; return G.Animals.walkOK(ca, m[0] + 0.2, m[1] + 0.4) && (W.canWalk(x - 0.5, y - 0.5, hx, hy) || W.canWalk(x + n + 0.5, y + n + 0.5, hx, hy) || W.canWalk(x - 0.5, y + n + 0.5, hx, hy) || W.canWalk(x + n + 0.5, y - 0.5, hx, hy)); };
  const lotNear = n => { for (let r = 0; r <= 60; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = Math.floor(hx) + dx - Math.floor(n / 2), y = Math.floor(hy) + dy - Math.floor(n / 2); if (free(x, y, n)) return [x, y]; } return null; };
  // (the big one: the biggest step of a great work the pen's people know how to raise whose lot is free near the pen — 40 m, or
  // 32 m (four tiles from the edge, past the three of the reach of before) in a town with no free ground of 40 m, as the
  // metrópole of the generation 15)
  const civ = G.Civ.idOfFac(set.fac) || 'classico'; let big = null;
  for (const n of [10, 8]) { for (const t of ['teatro', 'temple', 'maravilha', 'palacio_colossal', 'grande_palacio']) { const st = G.Escala.steps(t).find(s => s.n === n); if (!st || !G.Escala.can(t, civ, n)) continue; const l = lotNear(n); if (l) { big = { t, st, l }; break; } } if (big) break; }
  const l1 = lotNear(1), l2 = big && big.l;
  if (!ca || !cb || !l1 || !l2) ok('r12', false, `${!ca || !cb ? 'menos de duas vacas no curral; ' : ''}${l1 ? '' : 'nenhum lote livre para uma casa; '}${l2 ? '' : `nenhum lote livre de 40 m nem de 32 m para uma obra grande que o povo (${civ}) saiba erguer`}`);
  else {
    const hold = (a, x, y) => { a.x = x; a.y = y; a.tx = x; a.ty = y; a.path = null; a.state = 'pen'; a.herder = 0; a.ledBy = 0; a.hold = 1e9; };
    const half = Math.floor(big.st.n / 2); hold(ca, l1[0] + 0.5, l1[1] + 0.5); hold(cb, l2[0] + half + 0.2, l2[1] + half + 0.4);
    const bh = G.Village.startProject(set, 'house', l1);
    const bt = G.Village.startProject(set, big.t, l2, big.st); if (bt && !bt.built) G.Village.completeBuilding(bt);
    const where = (a, o) => { const inLot = !!o && Math.floor(a.x) >= o.x && Math.floor(a.x) < o.x + o.w && Math.floor(a.y) >= o.y && Math.floor(a.y) < o.y + o.h; return { inLot, ok: !inLot && G.Animals.walkOK(a, a.x, a.y) && W.canWalk(a.x, a.y, hx, hy), at: `(${r2(a.x)},${r2(a.y)})` }; };
    const wa = where(ca, bh), wb = where(cb, bt);
    // (the metrópole lived: who was set inside a building that blocks by the building put over it, or by its birth)
    const land = a => { const d = G.Animals.DEF[a.kind]; return !!d && d.cls !== 'air' && d.cls !== 'water' && !a.held && !a.air && !a.dead; };
    const inB = a => { const i = W.idx(a.x, a.y); const o = S().occ[i] && S().buildings.get(S().occ[i]); return o && o.blocks ? o : null; };
    const last = new Map(); const bIds = new Set(S().buildings.keys()); const put = [], born = [];
    for (const a of S().animals.values()) if (land(a)) last.set(a.id, true);
    live(300, () => { for (const a of S().animals.values()) { if (!land(a)) continue; const o = inB(a); const seen = last.has(a.id); last.set(a.id, true); if (!o) continue; if (!seen && born.length < 4 && !born.some(q => q.startsWith(a.kind + ' #' + a.id))) born.push(`${a.kind} #${a.id} dentro de ${V.buildName(o)} #${o.id}`); else if (!bIds.has(o.id) && put.length < 4 && !put.some(q => q.startsWith(a.kind + ' #' + a.id))) put.push(`${a.kind} #${a.id} dentro de ${V.buildName(o)} #${o.id}`); } for (const id of S().buildings.keys()) bIds.add(id); });
    const bad = newBad(P.base);
    ok('r12', !!bh && !!bt && wa.ok && wb.ok && !put.length && !born.length && !bad.length,
      `${ca.kind} #${ca.id} no lote (${l1[0]},${l1[1]}) da ${bh ? V.buildName(bh) + ' #' + bh.id : 'casa NÃO fundada'}: agora em ${wa.at}${wa.inLot ? ', DENTRO DO LOTE' : wa.ok ? ', onde fica, de onde chega ao curral' : ', ONDE NÃO FICA ou de onde não chega'}; ${cb.kind} #${cb.id} no meio do lote (${l2[0]},${l2[1]}) do ${bt ? V.buildName(bt) + ' #' + bt.id + ' ' + bt.w + '×' + bt.h : 'teatro NÃO fundado'}: agora em ${wb.at}${wb.inLot ? ', DENTRO DO LOTE' : wb.ok ? ', onde fica, de onde chega ao curral' : ', ONDE NÃO FICA ou de onde não chega'}; a metrópole vivida 300 s: ${put.length ? 'POSTOS DENTRO pelo prédio que subiu — ' + put.join(' · ') : 'nenhum posto dentro pelo prédio que sobe'}, ${born.length ? 'NASCIDOS DENTRO — ' + born.join(' · ') : 'nenhum nascido dentro'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// r13 a town's beasts and a new pen (L-xx1): the rule of the lost beast (animals.js) took in every beast with an owner, and a pen
// raised in a town stands without its kind until the pens' step gives it, with its first flock (economy.js penTick, every two
// seconds) — the dogs, cats, hens and pigeons of the town walked into the new pen at once, and the pen, with beasts in it, never got
// its flock (Mênfis's pen in the metrópole of the generation 16: eighteen cats, hens and pigeons, a herder for them, no cow). The
// town with the most grown beasts of its own and no pen; a pen founded by the game's door on a free lot near its middle
// (Village.startProject, raised whole): four seconds on, none of the town's beasts in a pen, and the pen with its first flock, all
// of the herds, of its kind; the checker sees a cat put in a pen. And a save of before — the town's beasts in a second new pen, as
// the old rule put them, the pen given its kind and its flock passed over —: loaded, none of them in a pen, the pen waits for its
// first flock, and four seconds on it has it
{
  fresh(); OLD.clear(); CUT.clear(); CUR = null; S().time = 0.5; S().weather.rain = 0; const W = G.W; const B0 = base();
  const town = a => { const d = G.Animals.DEF[a.kind]; return !!d && !!d.town && !a.dead; };
  const herdy = a => { const d = G.Animals.DEF[a.kind]; return !!d && !!d.dom && !a.dead; };
  const inPens = () => [...S().animals.values()].filter(a => town(a) && a.pen).length;
  const kinds = L => { const o = {}; for (const a of L) o[a.kind] = (o[a.kind] || 0) + 1; return JSON.stringify(o); };
  const bySet = new Map(); for (const a of S().animals.values()) if (town(a) && !a.pen && a.grown >= 1 && S().settlements.has(a.set) && a.dom === S().settlements.get(a.set).fac) bySet.set(a.set, (bySet.get(a.set) || 0) + 1);
  const best = [...bySet.entries()].sort((p, q) => q[1] - p[1] || p[0] - q[0])[0]; const set = best && S().settlements.get(best[0]);
  // (a lot as the god's hand takes one, as in the r12: the lot and the ring round it dry, free of buildings, walls and fences, no
  // main street on it, the ring reached from the town's middle)
  const free = (x, y, n) => { for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (!W.inb(tx, ty) || tx < 2 || ty < 2 || tx >= G.N - 2 || ty >= G.N - 2) return false; const i = W.idx(tx, ty); if (S().occ[i] || S().wall[i] || S().type[i] < G.T.SAND || W.fenceMap()[i]) return false; if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S().road[i] >= 2 || S().fire[i] > 0)) return false; }
    return W.canWalk(x - 0.5, y - 0.5, set.cx, set.cy) || W.canWalk(x + n + 0.5, y + n + 0.5, set.cx, set.cy) || W.canWalk(x - 0.5, y + n + 0.5, set.cx, set.cy) || W.canWalk(x + n + 0.5, y - 0.5, set.cx, set.cy); };
  const lotNear = n => { for (let r = 0; r <= 60; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = Math.floor(set.cx) + dx - 1, y = Math.floor(set.cy) + dy - 1; if (free(x, y, n)) return [x, y]; } return null; };
  const l1 = set && lotNear(3);
  if (!set || !l1) ok('r13', false, set ? `${set.name}: nenhum lote livre para um curral` : 'nenhuma cidade com bichos da cidade');
  else {
    const b1 = V.startProject(set, 'curral', l1); if (b1 && !b1.built) V.completeBuilding(b1);
    const kind0 = b1 ? b1.kind || null : null;
    live(4);
    const n1 = inPens(); const f1 = b1 ? E.penAnimals(b1).filter(a => !a.dead) : [];
    const okA = !!b1 && b1.built && !kind0 && !n1 && f1.length > 0 && f1.every(a => herdy(a) && a.kind === b1.kind);
    // (the checker: a cat of the town put in that pen by hand)
    const cat = [...S().animals.values()].filter(a => town(a) && a.set === set.id).sort((p, q) => p.id - q.id)[0];
    let sees = false; if (cat) { cat.pen = b1.id; sees = QA.check().some(q => q.sys === 'fauna' && /da cidade num curral/.test(q.msg)); cat.pen = 0; }
    // (a save of before: a second new pen, the town's grown beasts in it, the pen given its kind and marked stocked — the pens' step
    // gave no flock to a pen with beasts in it)
    const l2 = lotNear(3); const b2 = l2 && V.startProject(set, 'curral', l2); if (b2 && !b2.built) V.completeBuilding(b2);
    let n2 = -1, wait2 = false, f2 = [], put = 0, bo = null;
    if (b2) {
      E.penKind(b2); const o = JSON.parse(G.Save.serialize());
      for (const ao of o.animals) { const a = S().animals.get(ao.id); if (a && town(a) && !a.pen && a.grown >= 1 && a.dom === set.fac) { ao.pen = b2.id; put++; } }
      bo = o.buildings.find(q => q.id === b2.id); bo.kind = b2.kind; bo.stocked = true;
      M.reseed(4242); G.Save.apply(o); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); G.inSim = Math.max(G.inSim, 1);
      const c2 = S().buildings.get(b2.id); n2 = inPens(); wait2 = !!c2 && !c2.stocked;
      live(4); f2 = c2 ? E.penAnimals(c2).filter(a => !a.dead) : [];
    }
    const okB = !!b2 && put > 0 && n2 === 0 && wait2 && f2.length > 0 && f2.every(a => herdy(a) && a.kind === bo.kind) && !inPens();
    const bad = newBad(B0);
    ok('r13', okA && sees && okB && !bad.length,
      `${set.name}: ${best[1]} bichos da cidade sem curral; ${b1 ? `${V.buildName(b1)} #${b1.id} novo em (${l1}), ${kind0 ? 'JÁ COM A ESPÉCIE ' + kind0 : 'sem espécie'}` : 'o curral NÃO fundado'}: 4 s depois, ${n1} bicho(s) da cidade num curral${n1 ? ' — ENTRARAM' : ''}, o rebanho do curral ${kinds(f1)}${b1 ? ' (' + (b1.kind || '-') + ')' : ''}; o verificador ${sees ? 'vê' : 'NÃO VÊ'} o bicho da cidade posto num curral pela mão do deus${cat ? ` (${cat.kind} #${cat.id})` : ''}; um save de antes com ${put} no ${b2 ? V.buildName(b2) + ' #' + b2.id : 'curral NÃO fundado'}${bo ? ' (' + bo.kind + ', sem rebanho)' : ''}: carregado, ${n2} num curral, o curral ${wait2 ? 'à espera do primeiro rebanho' : 'DADO POR SERVIDO'}; 4 s depois o rebanho ${kinds(f2)}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// r14 the caravan's pack horse born where it stands (L-xx2: in the metrópole lived of the r12, a pack horse of a caravan was
// born inside a mine — trade.js put it a step to its merchant's side, and by the mine's door that step was inside it). A people
// with a deal to make (not the Aztecs, whose trader carries the load himself) sends a caravan by the world's own door
// (G.Trade.launch) with every one who could be its merchant standing a hair east of a building of its capital that blocks — the
// step to his side inside it —: the horse is born on ground it stands on, from where it reaches him; and with all of them
// indoors, in a house: born on ground it stands on, from where it reaches the house's door
{
  const W = G.W; const H0 = { kind: 'cavalo' };
  const inB = (x, y) => { const i = W.idx(x, y); const o = S().occ[i] && S().buildings.get(S().occ[i]); return o && o.blocks ? o : null; };
  // (who could be the merchant: trade.js launch's own test of a grown-up of the capital with free hands)
  const cand = (cap, f) => [...S().villagers.values()].filter(v => v.set === cap.id && !v.captive && v.age >= 18 && v.age <= 58 && v.id !== f.leader && v.role !== 'guerreiro' && !v.carry && !(v.task && v.task.pri >= 2) && !G.Vg.handsBusy(v));
  const part = place => {
    for (const fid of G.Fac.all().filter(f => f.civ !== 'asteca').map(f => f.id).sort((p, q) => p - q)) {
      fresh(); OLD.clear(); CUT.clear(); CUR = null; S().time = 0.4; const B = base();
      const f = G.Fac.get(fid), cap = G.Fac.capitalOf(fid); if (!f || !cap) continue;
      const L = cand(cap, f); if (!L.length) continue;
      const was = L.map(v => [v, v.x, v.y, v.inside]);
      const at = place(cap, L); if (!at) continue;
      const id0 = S().nextId; G.Trade.launch(f);
      const h = [...S().animals.values()].find(q => q.id >= id0 && q.kind === 'cavalo' && !q.dead); if (!h) continue;
      const m = S().villagers.get(h.ledBy); const o = inB(h.x, h.y);
      // (the others, not sent, back where they were)
      for (const [v, x, y, ins] of was) if (v !== m) { v.x = x; v.y = y; v.inside = ins; }
      const to = at.door || (m ? [m.x, m.y] : null);
      return { f, cap, at, h, m, o, stand: G.Animals.walkOK(h, h.x, h.y) && !o, reach: !!to && W.canWalk(h.x, h.y, to[0], to[1]), bad: newBad(B) };
    }
    return null;
  };
  const near = (cap, ok) => [...S().buildings.values()].filter(b => b.set === cap.id && b.built && b.blocks && ok(b)).sort((p, q) => G.dist2(p.x, p.y, cap.cx, cap.cy) - G.dist2(q.x, q.y, cap.cx, cap.cy) || p.id - q.id)[0];
  // (by a door: a building whose tile east of its first row is ground a horse stands on, reached from the town's middle)
  const P1 = part((cap, L) => { const b = near(cap, o => { const x = o.x + o.w, y = o.y; return W.inb(x, y) && !W.fenceMap()[W.idx(x, y)] && G.Animals.walkOK(H0, x + 0.5, y + 0.5) && W.canWalk(x + 0.5, y + 0.5, cap.cx, cap.cy); }); if (!b) return null;
    for (const v of L) { v.inside = 0; v.x = b.x + b.w + 0.1; v.y = b.y + 0.4; v.path = null; } return { b }; });
  // (indoors: a house of the capital, all of them in it, where the world puts one at home — its middle)
  const P2 = part((cap, L) => { const b = near(cap, o => !!G.BDEF[o.type].housing && G.Village.livable(o)); if (!b) return null;
    const [hx, hy] = G.Village.center(b); for (const v of L) { v.inside = b.id; v.x = hx; v.y = hy; v.path = null; } return { b, door: G.Vg.door(b) }; });
  const say = (P, what) => P ? `${P.f.name}: ${P.m ? P.m.name : '?'} ${what} ${V.buildName(P.at.b)} #${P.at.b.id}; o cavalo #${P.h.id} nasceu em (${r2(P.h.x)},${r2(P.h.y)})${P.o ? ', DENTRO DE ' + V.buildName(P.o) + ' #' + P.o.id : P.stand ? ', onde fica' : ', ONDE NÃO FICA'}${P.reach ? (P.at.door ? ', de onde chega à porta' : ', de onde chega a ele') : ', de onde NÃO CHEGA'}${P.bad.length ? '; ' + P.bad.join(' · ') : ''}` : `nenhum povo mandou caravana (${what} um prédio)`;
  ok('r14', !!P1 && P1.stand && P1.reach && !P1.bad.length && !!P2 && P2.stand && P2.reach && !P2.bad.length, `${say(P1, 'à porta de')}; ${say(P2, 'dentro de')}`);
}
const er = M.erros();
ok('erros', !Object.keys(er.mod).length && !er.console.length, `módulos: ${JSON.stringify(er.mod)}; console: ${er.console.slice(0, 2).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
