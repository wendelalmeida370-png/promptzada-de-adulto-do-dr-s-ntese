// campo: a roça e as propriedades de ponta a ponta num mundo pronto, em Node, pelo qa/nodemundo.js — o mundo de verdade: o
// agricultor (villagers.js: a tarefa 'farm'), o fruticultor, o lavrador, o vinhateiro e o apicultor (estates.js: 'estate'),
// pelas tarefas deles; o que a terra dá vai ao armazém pelo livro. A colheita nasce nas mãos (como a coleta e a lenha); daí
// em diante, nada sai das mãos sem linha, e o que nasceu nelas chega ao armazém.
//  c1 um ciclo da roça: o agricultor planta os canteiros nus, a estação passa, ele colhe e leva ao armazém ('entrega'): o que
//     chegou é o que ele colheu, e os canteiros voltam a nus
//  c2 o agricultor morre com a colheita nas mãos: ela vai ao armazém ('herdado'), e o canteiro que ele segurava é colhido por
//     outro
//  c3 um save no meio da estação: os canteiros como estavam (o estágio e o quanto cresceram), ninguém segurando nenhum, e a
//     colheita segue
//  c4 o fogo na roça madura: os canteiros queimados voltam a nus, e ninguém planta nem colhe na cinza
//  c5 o deus derruba a roça com a colheita nas mãos: o que estava nas mãos vai ao armazém
//  c6 o pomar e a plantação: a fruta e o café colhidos vão ao armazém
//  c7 a prensa (o vinhedo ou o olival): a fruta na tina, o vinho ou o azeite na prateleira pelo livro ('prensa') e dali ao
//     armazém ('recolher', 'entrega'): o que chega é o que a prensa fez
//  c8 a tina presa: segura por quem não está nela (largou a prensa no meio, mudou de ofício, um save no meio) não prende
//     ninguém — o próximo prensa
//  c9 o apiário: o mel ao armazém
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console.
// (Quem leva comida nas mãos e sente fome come dela: a c1 e a c2 pedem que seja pelo livro — a L-385, a troca do eatTask.)
// O corpo do deus não lavra (o interact.js não tem o verbo): o salto é das vidas longas da regressão.
//   node qa/campo.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/campo.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, E = G.Eco, V = G.Village, Es = G.Estates, Nat = G.Nature, W = G.W;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | campo ${name} | ${info}`); if (!c) fails.push(name); };
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
const live = (sec, each, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (each) each(); if (until && until()) return true; } return false; };
// (the checker's S0–S2 now, to tell what a case brought: only what was not there before counts)
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = B => QA.check().filter(q => q.sev <= 2 && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
// the hands of the people watched, step by step, against the ledger: what came into them with no line (born of the land —
// the harvest), and what left them with no line (lost: never). Water is the jar's errand (life.js), not the field's
const held = v => (v && v.carry && v.carry.n > 1e-6 ? { [v.carry.k]: v.carry.n } : {});
function watchHands(ids) {
  const H = new Map(); for (const id of ids) H.set(id, { prev: held(S().villagers.get(id)), born: {}, lost: [], L: seen.length, gone: false });
  const step = () => {
    for (const [id, w] of H) {
      if (w.gone) continue; const v = S().villagers.get(id); const now = held(v); const io = {};
      for (let i = w.L; i < seen.length; i++) { const e = seen[i]; if (e[4] === 'v:' + id) io[e[5]] = (io[e[5]] || 0) + e[6]; if (e[3] === 'v:' + id) io[e[5]] = (io[e[5]] || 0) - e[6]; }
      w.L = seen.length;
      for (const k of new Set([...Object.keys(now), ...Object.keys(w.prev), ...Object.keys(io)])) {
        if (k === 'water') continue; const d = r2((now[k] || 0) - (w.prev[k] || 0) - (io[k] || 0));
        if (d > 0.001) w.born[k] = r2((w.born[k] || 0) + d); else if (d < -0.001) w.lost.push(`${-d} de ${k}`);
      }
      w.prev = now; if (!v) w.gone = true;
    }
  };
  const L0 = seen.length; const h0 = {}; for (const [, w] of H) for (const k in w.prev) h0[k] = (h0[k] || 0) + w.prev[k];
  const born = k => r2([...H.values()].reduce((s, w) => s + (w.born[k] || 0), 0));
  const lost = () => [].concat(...[...H.values()].map(w => w.lost));
  const inHands = k => r2([...H.keys()].reduce((s, id) => s + ((held(S().villagers.get(id))[k]) || 0), 0));
  const mine = ref => String(ref).startsWith('v:') && H.has(+String(ref).slice(2));
  // (the flow of a good through the hands watched since the watch began: into them by the ledger; out of them to a people's
  // store — a delivery, an inheritance, or lost at its door with the cause, 'sem-lugar' —; eaten from them, with its line
  // ('refeicao': the one who carries food eats from it when hungry — by the ledger since L-385); out of them anywhere else)
  const flow = k => {
    let inL = 0, toF = 0, eaten = 0, other = 0;
    for (let i = L0; i < seen.length; i++) { const e = seen[i]; if (e[5] !== k) continue; if (mine(e[4])) inL += e[6]; if (mine(e[3])) { if (String(e[4]).startsWith('f:') || e[8] === 'sem-lugar') toF += e[6]; else if (e[4] === '@uso' && e[8] === 'refeicao') eaten += e[6]; else other += e[6]; } }
    return { inL: r2(inL), toF: r2(toF), eaten: r2(eaten), other: r2(other), h0: r2(h0[k] || 0), h1: inHands(k) };
  };
  // (what was born in the hands reached the store, was eaten with its line, or is still in them: what else went out of the
  // hands — a purchase taken home — came into them by the ledger first)
  const reached = k => { const f = flow(k); return f.toF + f.eaten + f.h1 - f.h0 + 0.01 >= born(k) && f.other <= f.inL + 0.01; };
  const say = k => { const f = flow(k); return `nasceu nas mãos ${born(k)} de ${k}, ao armazém ${f.toF}${f.eaten ? ', comido pelo livro ' + f.eaten : ''}, ainda nas mãos ${f.h1}${f.h0 ? ' (tinham ' + f.h0 + ')' : ''}${f.inL ? ', entrou pelo livro ' + f.inL : ''}${f.other ? ', saiu para outro lugar ' + f.other : ''}`; };
  return { step, born, lost, inHands, flow, reached, say, H };
}
// someone of the world, rested and fed, by day, at the place, given the day's work by the world's own door (G.Vg.H.workTask)
function send(v, b, at) {
  G.Vg.endTask(v); if (v.ug && G.Caves) G.Caves.exitNow(v); v.sleeping = false; v.inside = 0; v.energy = 95; v.hunger = 10;
  if (v.carry && v.carry.n > 1e-6 && v.carry.k !== 'water') G.Vg.toStore(v, G.Fac.idOfV(v), 'teste');
  const p = at || V.frontTile(b); v.x = p[0] + 0.5; v.y = p[1] + 0.5; v.path = null; v.think = 0;
  return G.Vg.H.workTask(v);
}
const morning = () => { S().time = 0.25; S().weather.rain = 0; if (S().weather.storm) S().weather.storm = 0; };
const fit = v => v && !v.captive && !v.jail && !v.aboard && !v.held && v.age >= 16 && v.age < 60;
const byId = (a, b) => a.id - b.id;

// ------------------------------ the farm ------------------------------
// (the farm of the town with the most farmers; its farmers, the nearest first)
function farmPick() {
  let best = null;
  for (const b of [...S().buildings.values()].sort(byId)) {
    if (b.type !== 'farm' || !b.built || !b.crops) continue;
    const fs = [...S().villagers.values()].filter(v => v.set === b.set && v.role === 'agricultor' && fit(v));
    if (fs.length >= 2 && (!best || fs.length > best.n)) best = { id: b.id, n: fs.length };
  }
  return best && best.id;
}
const FARM = farmPick();
function farmSetup(state) {
  fresh(); morning(); const b = S().buildings.get(FARM);
  const farmers = [...S().villagers.values()].filter(v => v.set === b.set && v.role === 'agricultor' && fit(v)).sort((p, q) => G.dist2(p.x, p.y, b.x + 1.5, b.y + 1.5) - G.dist2(q.x, q.y, b.x + 1.5, b.y + 1.5) || p.id - q.id);
  for (let k = 0; k < 9; k++) Object.assign(b.crops[k], state(k));
  return { b, farmers, base: base() };
}
const sOf = b => b.crops.map(c => c.s).join('');
const ripe = () => ({ s: 3, g: 1, c: 0 });
// (the farmer stands on the farm: its crops are the nearest — the world's farmTask chooses by distance)
const onFarm = b => [b.x + 1, b.y + 1];
if (!FARM) console.log(`FALHOU | campo mundo | ${world}: nenhuma roça com dois agricultores na cidade`);
else {
  const b0 = S().buildings.get(FARM); console.log(`${world}: a roça #${FARM} de ${S().settlements.get(b0.set).name} (${Es.grainOf(b0).name})`);
  // c1 a cycle of the farm
  {
    const P = farmSetup(() => ({ s: 0, g: 0, c: 0 })); const b = P.b; const v = P.farmers[0];
    const Hd = watchHands(P.farmers.map(x => x.id)); send(v, b, onFarm(b));
    const planted = () => b.crops.filter(c => c.s >= 1).length;
    live(120, Hd.step, () => planted() >= 9);
    const p1 = planted(); const sp = sOf(b);
    // the season passes: what was planted is ripe now (the growth of the farm: village.js updateFarms)
    for (const c of b.crops) if (c.s >= 1) c.g = 0.999;
    live(4, Hd.step);
    const ripeN = b.crops.filter(c => c.s === 3).length;
    for (const x of P.farmers.slice(0, 2)) if (!x.task || x.task.type !== 'farm') send(x, b, onFarm(b));
    live(240, Hd.step, () => b.crops.every(c => c.s !== 3));
    live(30, Hd.step, () => !(held(v).food > 0)); // (and the last basket to the store)
    const left = b.crops.filter(c => c.s === 3).length; const lost = Hd.lost(); const bad = newBad(P.base);
    ok('c1', p1 >= 9 && ripeN >= 9 && !left && Hd.born('food') > 0 && Hd.reached('food') && !lost.length && !bad.length,
      `plantados ${p1} de 9 (${sp}); maduros ${ripeN}; colhidos todos: ${!left} (${sOf(b)}); ${Hd.say('food')}; sumiu das mãos sem linha: ${lost.join(', ') || 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
  // c2 the farmer dies with the harvest in the hands
  {
    const P = farmSetup(ripe); const b = P.b; const v = P.farmers[0]; const Hd = watchHands(P.farmers.map(x => x.id));
    send(v, b, onFarm(b));
    live(60, Hd.step, () => held(v).food > 0 && v.task && v.task.type === 'farm');
    const n = held(v).food || 0; const mine = b.crops.findIndex(c => c.c === v.id); const L0 = seen.length;
    // (room in the people's store for what is in his hands, made by the god at the moment he dies, as the r3 of the
    // rebanho.js keeps it (T-327): a full store takes at its door only what fits — the inheritance's rest lost with its line,
    // 'sem-lugar', as the world does —, and the case is the inheritance, not the room. Tenochtitlan's store of the generation
    // 11 had room for 4 of food: of the 5 in Tonantzin's hands, 1 was lost at its door, T-353)
    { const f = G.Fac.ofV(v); const room = D.room('f:' + f.id, 'food'); if (room < 12) D.use('f:' + f.id, 'food', 12 - room, { code: 'teste', part: true }); }
    V.kill(v, 'wolf'); Hd.step();
    const herd = r2(seen.slice(L0).filter(e => e[3] === 'v:' + v.id && e[5] === 'food' && e[8] === 'herdado').reduce((s, e) => s + e[6], 0));
    // another farmer takes the crop he held, and the rest
    for (const x of P.farmers.slice(1, 3)) send(x, b, onFarm(b));
    live(180, Hd.step, () => b.crops.every(c => c.s !== 3));
    const lost = Hd.lost(); const bad = newBad(P.base);
    ok('c2', n > 0 && Math.abs(herd - n) < 0.01 && (mine < 0 || b.crops[mine].s !== 3) && b.crops.every(c => c.s !== 3) && !lost.length && Hd.reached('food') && !bad.length,
      `${v.name} morreu com ${n} de comida nas mãos: ao armazém pelo livro ('herdado') ${herd}; o canteiro ${mine} que ele segurava ${mine < 0 ? '(nenhum)' : b.crops[mine].s !== 3 ? 'foi colhido por outro' : 'ficou maduro, preso'}; a roça ${sOf(b)}; ${Hd.say('food')}; sumiu das mãos sem linha: ${lost.join(', ') || 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
  // c3 a save in the middle of the season
  {
    const P = farmSetup(k => (k < 3 ? { s: 1, g: 0.123, c: 0 } : k < 6 ? { s: 2, g: 0.654, c: 0 } : { s: 3, g: 1, c: 0 })); const b = P.b;
    // (the save once a farmer holds a crop of it: in the middle of his work)
    send(P.farmers[0], b, onFarm(b)); live(30, null, () => b.crops.some(c => c.c));
    const before = b.crops.map(c => [c.s, r2(c.g)]); const held0 = b.crops.filter(c => c.c).length;
    M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1);
    const b2 = S().buildings.get(FARM); const after = b2.crops.map(c => [c.s, r2(c.g)]); const held1 = b2.crops.filter(c => c.c).length;
    const same = JSON.stringify(before) === JSON.stringify(after);
    const fs = P.farmers.map(x => S().villagers.get(x.id)).filter(Boolean); for (const x of fs.slice(0, 2)) send(x, b2, onFarm(b2));
    live(180, null, () => b2.crops.every(c => c.s !== 3));
    const bad = newBad(P.base);
    ok('c3', held0 > 0 && same && !held1 && b2.crops.every(c => c.s !== 3) && !bad.length,
      `antes do save ${JSON.stringify(before)} (${held0} seguro(s)); depois ${same ? 'igual' : JSON.stringify(after)}, ${held1} seguro(s); a colheita seguiu: ${sOf(b2)}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
  // c4 fire in the ripe farm
  {
    const P = farmSetup(ripe); const b = P.b; const tiles = []; for (let k = 0; k < 9; k++) { const [x, y] = V.cropPos(b, k); tiles.push(W.idx(x, y)); }
    for (const i of tiles) { S().wet[i] = 0; Nat.ignite(i, 0.95); } // (a dry day: the wet of a riverside field would put it out)
    live(8); for (const i of tiles) Nat.extinguish(i, 9);
    // (the fire put out round the farm too: the test burns the field, not the town)
    for (let y = b.y - 2; y < b.y + b.h + 2; y++) for (let x = b.x - 2; x < b.x + b.w + 2; x++) if (W.inb(x, y)) Nat.extinguish(W.idx(x, y), 9);
    // (the canteiros the fire burnt — the world's ash on the tile, nature.js, the mark the farmers read — and those the town's
    // people saved: they run with water to a fire in town, and a canteiro put out before it burns is a field like any other,
    // harvested and planted again. The case asked the nine to burn: in the generation-9 and -10 metropole the field of Argos is
    // a few steps from its people, and they put out two of the nine, which the farmers then harvested and planted — «replantados
    // na cinza: 2», on no ash at all, T-327. What the case holds is the same, canteiro by canteiro: each burnt one back to bare,
    // and nobody plants or harvests on the ash)
    const ash = k => S().burnt[tiles[k]] > G.DAY_LEN * 0.5;
    const ashK = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(ash);
    const burnt = ashK.filter(k => b.crops[k].s === 0 && b.crops[k].g === 0).length;
    let onAsh = 0; for (const x of P.farmers.slice(0, 2)) send(x, b, onFarm(b));
    live(60, () => { for (const x of P.farmers) { const t = x.task; if (t && t.type === 'farm' && t.id === b.id && S().burnt[tiles[t.k]] > G.DAY_LEN * 0.5) onAsh++; } });
    const planted = ashK.filter(k => b.crops[k].s >= 1).length; const bad = newBad(P.base);
    ok('c4', ashK.length >= 1 && burnt === ashK.length && !onAsh && !planted && !bad.length,
      `o fogo queimou ${ashK.length} de 9 canteiros${ashK.length < 9 ? ` (o povo apagou ${9 - ashK.length} antes de queimarem)` : ''}, ${burnt} de volta a nus (${sOf(b)}); passos de alguém trabalhando na cinza: ${onAsh}; replantados na cinza: ${planted}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
  // c5 the god brings the farm down with the harvest in the hands
  {
    const P = farmSetup(ripe); const b = P.b; const v = P.farmers[0]; const Hd = watchHands([v.id]);
    send(v, b, onFarm(b)); live(60, Hd.step, () => held(v).food > 0 && v.task && v.task.type === 'farm');
    const n = held(v).food || 0; V.destroyBuilding(b, 'meteor'); Hd.step();
    live(120, Hd.step, () => !(held(v).food > 0));
    const got = Hd.flow('food').toF; const lost = Hd.lost(); const bad = newBad(P.base);
    ok('c5', n > 0 && !S().buildings.has(FARM) && !(held(v).food > 0) && got >= n - 0.01 && Hd.reached('food') && !lost.length && !bad.length,
      `a roça caiu com ${n} de comida nas mãos de ${v.name}: a roça ${S().buildings.has(FARM) ? 'ainda lá' : 'sumiu'}; ${Hd.say('food')}; sumiu das mãos sem linha: ${lost.join(', ') || 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}

// ------------------------------ the estates ------------------------------
// (an estate of these types with its hands — the role of the type, the job there —, the one with the most)
function estPick(test) {
  let best = null;
  for (const b of [...S().buildings.values()].sort(byId)) {
    if (!b.built || !Es.is(b.type) || !test(b)) continue;
    const role = G.BDEF[b.type].role; const ws = [...S().villagers.values()].filter(v => v.job === b.id && v.role === role && fit(v));
    if (ws.length && (!best || ws.length > best.n)) best = { id: b.id, n: ws.length };
  }
  return best && best.id;
}
function estSetup(id, prep) {
  fresh(); morning(); const b = S().buildings.get(id); const role = G.BDEF[b.type].role;
  const ws = [...S().villagers.values()].filter(v => v.job === b.id && v.role === role && fit(v)).sort(byId);
  b.claim = {}; if (prep) prep(b);
  return { b, ws, base: base() };
}
const fieldAt = b => [b.x + 1, b.y + 1];
// c6 the orchard and the plantation: what they bear to the store
{
  const ids = [estPick(b => b.type === 'pomar' && b.crop && Es.CROPS[b.crop] && !Es.CROPS[b.crop].press), estPick(b => b.type === 'plantacao' && b.crop && Es.CROPS[b.crop])].filter(Boolean);
  if (!ids.length) ok('c6', false, `${world}: nenhum pomar de comer nem plantação com as mãos do ofício`);
  const out = []; let good = !!ids.length;
  for (const id of ids) {
    const P = estSetup(id, b => { for (let k = 0; k < 9; k++) { const p = b.pl[k]; if (p.g < 0) continue; p.g = 1; p.f = k < 3 ? 1.5 : 0; } });
    const b = P.b; const c = Es.CROPS[b.crop]; const k = c.out; const Hd = watchHands(P.ws.map(x => x.id));
    // (a tree a trip, as the hives: early in the morning, and the time of three trips and a night — with the meals of the
    // house, the P1's, the day of the generation 7's Tenochtitlan gave the banana grove one trip of three in 180 s, T-269)
    S().time = 0.08;
    send(P.ws[0], b, fieldAt(b));
    live(400, Hd.step, () => b.pl.slice(0, 3).every(p => p.f < 1) && P.ws.every(x => !(held(x)[k] > 0)));
    const picked = b.pl.slice(0, 3).filter(p => p.f < 1).length; const lost = Hd.lost(); const bad = newBad(P.base);
    const okk = picked === 3 && Hd.born(k) > 0 && Hd.reached(k) && !lost.length && !bad.length; good = good && okk;
    out.push(`${V.buildName(b)} #${b.id}: colhidos ${picked} de 3 pés maduros; ${Hd.say(k)}; sumiu sem linha: ${lost.join(', ') || 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
  if (ids.length) ok('c6', good, out.join(' · '));
}
// the press: a field of a pressed crop (grape, olive), its plants grown and bare — the vat is the work
const PRESS = estPick(b => (b.type === 'vinhedo' || b.type === 'pomar') && b.crop && Es.CROPS[b.crop] && Es.CROPS[b.crop].press);
const vatPrep = b => { for (const p of b.pl) if (p.g >= 0) { p.g = 1; p.f = 0; } b.must = 4; const I = b.inv || (b.inv = {}); delete I[Es.CROPS[b.crop].out]; };
// (the lines of a shelf since a case began: the cases before lived the same world, and its vat with them)
const shelfLines = (b, k, L0) => seen.slice(L0).filter(e => e[5] === k && (e[3] === 'b:' + b.id || e[4] === 'b:' + b.id));
// c7 the press, to the store
if (!PRESS) ok('c7', false, `${world}: nenhum vinhedo nem olival com as mãos do ofício`);
else {
  const P = estSetup(PRESS, vatPrep); const b = P.b; const k = Es.CROPS[b.crop].out; const Hd = watchHands(P.ws.map(x => x.id)); const L0 = seen.length;
  send(P.ws[0], b, fieldAt(b));
  live(200, Hd.step, () => (b.must || 0) < 2 && !((b.inv && b.inv[k]) > 0) && P.ws.every(x => !(held(x)[k] > 0)));
  const L = shelfLines(b, k, L0); const made = r2(L.filter(e => e[3] === '@mundo' && e[8] === 'prensa').reduce((s, e) => s + e[6], 0));
  const taken = r2(L.filter(e => e[3] === 'b:' + b.id).reduce((s, e) => s + e[6], 0)); const shelf = r2((b.inv && b.inv[k]) || 0);
  const fl = Hd.flow(k); const got = fl.toF; const lost = Hd.lost(); const bad = newBad(P.base);
  ok('c7', made > 0 && Math.abs(made - taken - shelf) < 0.01 && Math.abs(got + fl.h1 - fl.h0 - taken) < 0.01 && !Hd.born(k) && !lost.length && !bad.length,
    `${V.buildName(b)} #${b.id}: a tina ${r2(b.must || 0)}; a prensa fez ${made} de ${k} na prateleira pelo livro ('prensa'); saiu da prateleira ${taken}, ficou ${shelf}; ao armazém ${got}; nasceu nas mãos fora do livro ${Hd.born(k)}; sumiu sem linha: ${lost.join(', ') || 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// c8 a vat held by someone who is not at it: the next hand presses it (who pressed: the 'prensa' line of the ledger, its hand)
const pressedBy = (L0, b) => seen.slice(L0).filter(e => e[8] === 'prensa' && e[4] === 'b:' + b.id).map(e => e[9]);
if (!PRESS) ok('c8', false, `${world}: nenhum vinhedo nem olival com as mãos do ofício`);
else {
  const parts = []; let good = true;
  // (1) held by someone of the town who is not of the trade (in another errand, far from it)
  {
    const P = estSetup(PRESS, vatPrep); const b = P.b;
    const other = [...S().villagers.values()].sort(byId).find(o => o.set === b.set && fit(o) && o.job !== b.id && !P.ws.includes(o));
    b.claim = { vat: other.id }; const L0 = seen.length;
    send(P.ws[0], b, fieldAt(b)); live(90, null, () => pressedBy(L0, b).length > 0);
    const by = pressedBy(L0, b); good = good && by.length > 0;
    parts.push(`segura por ${other.name} #${other.id} (${other.role}, longe dela): ${by.length ? 'prensada por #' + by[0] : 'ninguém prensou'}`);
  }
  // (2) the presser called away in the middle of the press: the other hand presses (he, kept away at the fire, does not)
  {
    const P = estSetup(PRESS, vatPrep); const b = P.b; const a = P.ws[0]; const next = P.ws[1] || null;
    send(a, b, fieldAt(b)); live(60, null, () => a.task && a.task.type === 'estate' && a.task.do === 'press' && a.task.st === 1);
    const was = !!(a.task && a.task.do === 'press'); const L0 = seen.length;
    const away = () => { if (!(a.task && a.task.type === 'rest')) { G.Vg.endTask(a); G.Vg.setTask(a, { type: 'rest', pri: 2.5 }); } };
    away(); if (next) send(next, b, fieldAt(b));
    live(90, away, () => pressedBy(L0, b).length > 0);
    const by = pressedBy(L0, b); good = good && was && (!next || by.includes(next.id));
    parts.push(`${a.name} chamado no meio da prensa (${was ? 'estava nela' : 'não chegou a ela'}): ${next ? (by.includes(next.id) ? 'a outra mão prensou' : by.length ? 'prensada por #' + by[0] : 'a outra mão não prensou') : 'sem outra mão nela'}`);
  }
  // (3) a save with the vat held: after the load nobody is at it, and the other hand presses it
  {
    const P = estSetup(PRESS, vatPrep); const b = P.b; const a = P.ws[0];
    send(a, b, fieldAt(b)); live(60, null, () => b.claim && b.claim.vat);
    const heldBy = b.claim && b.claim.vat; M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1);
    const b2 = S().buildings.get(PRESS); const a2 = S().villagers.get(a.id); const nx = P.ws[1] ? S().villagers.get(P.ws[1].id) : a2;
    const away = () => { if (a2 && nx !== a2 && !(a2.task && a2.task.type === 'rest')) { G.Vg.endTask(a2); G.Vg.setTask(a2, { type: 'rest', pri: 2.5 }); } };
    away(); const L0 = seen.length; if (nx) send(nx, b2, fieldAt(b2));
    // (the case's hand kept at the vat by the hand of the proof — sent back to it when the world calls it away before it
    // presses, or, taken from the trade, the next hand of it: in the tip a39483e joined with the quay's dockers of L-428 the
    // house sent Citlalin for its water (1,05, over the estate's 1) 0,9 s from pressing, and then the board made her an
    // actor. The case is the vat held across a save, not who calls the hand away, T-313)
    let hand = nx, back = 0; const keep = () => { away(); if (!hand || pressedBy(L0, b2).length || (hand.task && hand.task.type === 'estate')) return;
      const h2 = hand.job === b2.id && fit(hand) ? hand : P.ws.map(w => S().villagers.get(w.id)).find(w => w && w !== a2 && w.job === b2.id && fit(w));
      if (h2) { hand = h2; back++; send(hand, b2, fieldAt(b2)); } };
    live(90, keep, () => pressedBy(L0, b2).length > 0);
    const by = pressedBy(L0, b2); const bad = newBad(P.base);
    good = good && !!heldBy && !!hand && by.includes(hand.id) && !bad.length;
    parts.push(`save com a tina segura (${heldBy ? '#' + heldBy : 'por ninguém'}): ${by.length ? 'prensada depois do load por #' + by[0] + (hand && by.includes(hand.id) ? (hand === a2 ? ' (a mesma mão: não há outra)' : ' (a outra mão)') : '') : 'ninguém prensou depois do load'}${back ? ` (a mão do caso mandada de volta à tina ${back} vez(es)${hand !== nx ? ', a seguinte do ofício: #' + hand.id : ''})` : ''}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
  ok('c8', good, parts.join(' · '));
}
// c9 the apiary: honey to the store
{
  const id = estPick(b => b.type === 'apiario');
  if (!id) ok('c9', false, `${world}: nenhum apiário com apicultor`);
  else {
    const P = estSetup(id, b => { b.hv = [1.6, 1.6, 0, 0]; }); const b = P.b; const Hd = watchHands(P.ws.map(x => x.id));
    // (a hive a trip, and a trip is the walk to the store and back: with the store of the generation 7's Tenochtitlan, a trip is
    // a quarter of a day, and the evening takes the keeper home after the first — the case starts early in the morning, and has
    // the time of two trips and a night, if it comes, T-269)
    S().time = 0.08;
    send(P.ws[0], b, fieldAt(b));
    live(400, Hd.step, () => b.hv[0] < 1 && b.hv[1] < 1 && P.ws.every(x => !(held(x).mel > 0)));
    const lost = Hd.lost(); const bad = newBad(P.base);
    ok('c9', b.hv[0] < 1 && b.hv[1] < 1 && Hd.born('mel') > 0 && Hd.reached('mel') && !lost.length && !bad.length,
      `${V.buildName(b)} #${b.id}: as colmeias ${b.hv.map(r2).join('/')}; ${Hd.say('mel')}; sumiu sem linha: ${lost.join(', ') || 'nada'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
const er = M.erros();
ok('erros', !Object.keys(er.mod).length && !er.console.length, `módulos: ${JSON.stringify(er.mod)}; console: ${er.console.slice(0, 2).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
