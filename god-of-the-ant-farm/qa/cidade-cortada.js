// cidade-cortada: a cidade cortada em duas nomeia um construtor do lado das suas ruas (L-389), num mundo pronto, em Node.
// Os ofícios da cidade (village.js, assignJobs) contavam os construtores pela cidade inteira: com eles do outro lado da água, a
// cidade já tinha os que queria, e as obras que as suas ruas alcançam ficavam paradas. Agora contam pelo lado das obras, pelo
// mapa de regiões (W.reaches, W.townReaches — nunca «mesma ilha»): quem não alcança nenhuma obra que as ruas alcançam troca de
// ofício por um do lado dele, e o construtor novo é quem alcança as obras.
//  c1 a ilhota: a mão do deus leva os construtores da cidade a uma ilhota cercada de água funda, e a cidade abre uma obra nas
//     ruas, com todo o material: na conta seguinte dos ofícios, enquanto a ilhota os segura (o mundo põe na margem, em
//     segundos, quem fica onde todo afazer falha), eles deixam o ofício, um construtor das ruas é nomeado, alcança a obra e
//     ela anda
//  c2 o mesmo, com um save logo depois do corte: carregado, a cidade faz o mesmo
//  c3 a água vai embora (depois do c1): ninguém troca de ofício duas vezes (sem vai e vem), e todo construtor alcança as obras
//  c4 a obra que as ruas não alcançam (na própria ilhota) não é obra da cidade: ninguém deixa o ofício por ela
//  c5 os armazéns cortados pela água — o h14 do fome.js sem a mão do deus (T-256) —: a cidade acende uma fogueira do lado das
//     ruas, com um construtor de lá — quem tem uma carga simples nas mãos a pousa no chão, sem armazém ao alcance, e as mãos
//     ficam livres para a obra (L-406) —; e, com a fogueira de pé, a carga pousada é apanhada por quem a alcança (L-408)
//  c6 o mesmo, com a carga nas mãos de propósito: todo construtor das ruas com 3 de lenha nas mãos — antes da L-406 iam entregar
//     num armazém do outro lado da água, e a fogueira nunca saía —: a pousam no chão, levantam a fogueira, e a carga pousada é
//     apanhada por quem a alcança e levada à fogueira (L-408)
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console.
//   node qa/cidade-cortada.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/cidade-cortada.js)
//  O verificador do L-389 (QA.obras, no oficio-inv.js) olha a cada 5 s em todos os casos: uma cidade com obra das ruas e
//  nenhum construtor com caminho a ela por mais de 30 s. A prova lê o caminho pelo mapa de regiões ela mesma (a frente da
//  obra ou um lado livre), e não pelas funções do conserto: roda igual no código de antes, para mostrar o antes e o depois.
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const V = G.Village, Vg = G.Vg, W = G.W, D = G.Depot;
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cidade-cortada ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'cidade';
let S;
M.pronto(world); S = G.S; M.viver(2);
const snap = G.Save.serialize();
// (what the L-389 rule says, every 5 s of the world: each case keeps all it said)
let said = [];
const seeObras = () => { if (!QA.obras) return; QA.obras((sys, sev, msg) => { if (!said.includes(msg)) said.push(msg); }, S); };
// (each case from the same world, in the morning and in the god's peace: no war of the world's own through the new ways)
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); S = G.S; S.time = 0.3; G.Politics.divinePeace(); G.inSim = Math.max(G.inSim || 0, 1); said = []; };
const peace = () => { S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN); };
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 10 === 0) peace(); if (k % 50 === 49) seeObras(); if (until && until()) return true; } return false; };
const obrasSaid = () => (said.length ? ` — o verificador do L-389: «${said[0]}»${said.length > 1 ? ` e mais ${said.length - 1}` : ''}` : '');
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = (B, skip) => QA.check().filter(q => q.sev <= 2 && !(skip && skip.has(q.sys)) && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
const free = v => !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !(S.avatar && S.avatar.id === v.id);
const builders = set => [...S.villagers.values()].filter(v => v.set === set.id && v.role === 'construtor' && !v.captive);
const names = L => L.map(v => v.name).join(', ') || '-';
// (the town: the most people of all with a free builder and a store)
const pickTown = () => [...S.settlements.values()].filter(s => builders(s).some(free) && V.dropoffs(s.id).length).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0] || null;
// (an islet of the god: a 3×3 of walkable ground, ringed by two steps of deep water — no building, wall, tree, bush, dry bed,
// ice, cave mouth or person on it or in the ring; the nearest such ground to the town, wherever it is on its land: a city
// leaves little bare ground near its centre)
function fitsIslet(px, py) {
  for (let y = py - 3; y <= py + 3; y++) for (let x = px - 3; x <= px + 3; x++) {
    if (!W.inb(x, y)) return false; const i = W.idx(x, y); const d = Math.max(Math.abs(x - px), Math.abs(y - py));
    if (S.occ[i] || (S.wall && S.wall[i]) || S.type[i] < G.T.SAND || S.cliff[i]) return false;
    if (d <= 1) { if (!W.walkable(i)) return false; continue; }
    if (S.treeAt[i] || S.objAt[i] || (S.dry && S.dry[i]) || (S.ice && S.ice[i]) || (G.Caves && G.Caves.isMouth(i))) return false;
  }
  for (const v of S.villagers.values()) if (Math.abs(v.x - (px + 0.5)) <= 3.6 && Math.abs(v.y - (py + 0.5)) <= 3.6) return false;
  return true;
}
function islet(set) {
  const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
  for (let r = 4; r <= 64; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && fitsIslet(cx + dx, cy + dy)) return [cx + dx, cy + dy];
  return null;
}
// (the ring of deep water, and the ground back again: the terrain changes as the world's own rule says — S.typeVer and the land)
const flood = (px, py) => { const was = new Map(); for (let y = py - 3; y <= py + 3; y++) for (let x = px - 3; x <= px + 3; x++) { if (Math.max(Math.abs(x - px), Math.abs(y - py)) < 2) continue; const i = W.idx(x, y); was.set(i, S.type[i]); S.type[i] = G.T.DEEP; } S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); return was; };
const unflood = was => { for (const [i, t] of was) S.type[i] = t; S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); };
// (the god's hand: the town's free builders set down on the islet, their errands ended)
const strand = (set, at) => { const out = []; let k = 0; for (const v of builders(set).filter(free)) { Vg.endTask(v); v.inside = 0; v.sleeping = false; v.x = at[0] - 1 + (k % 3) + 0.5; v.y = at[1] - 1 + (Math.floor(k / 3) % 3) + 0.5; v.path = null; k++; out.push(v); } return out; };
// (a work of the town on its streets, with every material in — into the work, by the ledger, as the fome.js does)
const streetWork = set => { const b = V.startProject(set, 'hut'); if (!b) return null; for (const k of Object.keys(b.need)) if (b.need[k] > 0) D.make('o:' + b.id, k, b.need[k], { code: 'teste' }); return b; };
const P = id => S.villagers.get(id);
const site = id => S.buildings.get(id);
const roleOf = ids => ids.map(P).filter(Boolean);
// (the test's own reading of who can walk to a work, and whether the town's streets can: its front or a free side of it, by the
// map of regions — the builder's own rule, Vg.gotoB —; not the fix's functions, so it reads the same in the code of before)
const sidesOf = b => { const [fx, fy] = V.frontTile(b); const out = [[fx, fy]]; for (let y = b.y - 1; y <= b.y + b.h; y++) for (let x = b.x - 1; x <= b.x + b.w; x++) { if (y >= b.y && y < b.y + b.h && x >= b.x && x < b.x + b.w) continue; if (W.inb(x, y) && W.walkable(W.idx(x, y))) out.push([x + 0.5, y + 0.5]); } return out; };
const reachV = (v, b) => sidesOf(b).some(p => W.reaches(v, p[0], p[1]));
const reachT = (set, b) => sidesOf(b).some(p => W.townReaches(set, p[0], p[1]));
G.inSim++;

// ---------------- c1 and c2: the islet, without and with a save right after the cut ----------------
let after1 = null;
for (const saved of [false, true]) {
  fresh(); const B = base();
  const set0 = pickTown(); const at = set0 && islet(set0);
  let info = '', pass = false;
  if (!set0) info = 'nenhuma cidade com construtor livre e armazém';
  else if (!at) info = `${set0.name}: nenhum chão para a ilhota em volta`;
  else {
    const was = flood(at[0], at[1]); const gone = strand(set0, at).map(v => v.id);
    const b = streetWork(set0); const bid = b ? b.id : 0; const sid = set0.id;
    const town = !!b && reachT(set0, b);
    const cut = !!b && gone.length > 0 && roleOf(gone).every(v => !reachV(v, b));
    if (saved) { M.salvarCarregar(); S = G.S; G.inSim = Math.max(G.inSim || 0, 1); }
    const set = S.settlements.get(sid); const p0 = site(bid) ? site(bid).progress : 0;
    // (the town's next count of its trades — every 4 s, 8 s in the skip —, read while the islet holds: the world sets down on
    // the shore whoever stands where every errand fails (the stuck of villagers.js, L-306) — in the generation 7's Roma, Túlia
    // at 5 s and Quinto at 10 s —, and from the shore they reach the works again. The ones on the islet then, the builders on
    // the streets then)
    const still = () => roleOf(gone).filter(v => site(bid) && !reachV(v, site(bid)));
    const t0 = S.clock; live(9, () => roleOf(gone).every(v => v.role !== 'construtor') || still().length < gone.length);
    const held = still(); const left = held.filter(v => v.role !== 'construtor'); const tSwap = Math.round(S.clock - t0); const heldRoles = held.map(v => v.role || 'sem ofício');
    // (and a builder of the streets who reaches the work: named at that count, or at the next)
    const streets = () => builders(set).filter(v => !gone.includes(v.id) && site(bid) && reachV(v, site(bid)));
    live(9, () => streets().length > 0);
    const named = builders(set).filter(v => !gone.includes(v.id)); const reach = streets();
    // (who works on it: the ones on a task on it who can walk to it — from the islet nobody can; one set down on the shore can)
    const workers = new Set(); const strangers = new Set();
    const look = () => { const o = site(bid); if (!o) return; for (const v of S.villagers.values()) if (v.task && v.task.type === 'build' && v.task.id === bid && v.task.st >= 3) (reachV(v, o) ? workers : strangers).add(v.id); };
    // (the works of the town in the order its builders take them, by the door of their trade: in the generation 7's Roma the
    // builder named on the streets had other works of the town before the hut — 600 s, as the c5 has 900)
    let moved = false; live(600, () => { look(); const o = site(bid); moved = !o || o.built || o.progress > p0 + 1e-6; return moved; });
    const o = site(bid);
    pass = town && cut && held.length > 0 && left.length === held.length && reach.length > 0 && moved && workers.size > 0 && !strangers.size;
    info = `${set.name}: ${gone.length} construtor(es) na ilhota (${names(roleOf(gone))}) ${cut ? 'sem caminho para a obra' : 'AINDA alcançando a obra'}${saved ? ', salvo e carregado logo depois do corte' : ''}; na conta dos ofícios (${tSwap} s), ${left.length} de ${held.length} ainda na ilhota trocaram de ofício (${heldRoles.join(', ') || '-'}); construtores das ruas: ${names(named)} (${reach.length} alcançam a obra); ${b ? `${b.type}#${bid}${town ? '' : ' FORA das ruas'}` : 'nenhuma obra'}: ${o ? (o.built ? 'pronta' : `progresso ${Math.round(p0 * 100)}% → ${Math.round(o.progress * 100)}%`) : 'saiu do mundo'}, com ${names(roleOf([...workers]))}${strangers.size ? ` (${names(roleOf([...strangers]))} DA ILHOTA, sem caminho)` : ''}`;
    const bad = newBad(B); if (bad.length) { pass = false; info += ` — o verificador: ${bad.join(' · ')}`; }
    if (said.length) { pass = false; info += obrasSaid(); }
    if (!saved) after1 = { was, gone, sid, bid };
    else unflood(was);
  }
  ok(saved ? 'c2 a ilhota com um save no meio' : 'c1 a ilhota: os construtores do outro lado e a obra das ruas', pass, info);
  if (!saved && after1) {
    // ---------------- c3 the water goes away: no coming and going ----------------
    const B3 = base(); const set = S.settlements.get(after1.sid); said = [];
    const changes = new Map(); const on0 = G.Life && G.Life.onRole;
    // (the coming and going is of who had a trade: a first trade — a boy who turns 16, given one by the board — is no change of
    // trade; the islet's builder, construtor → without one → construtor, still counts twice. With the tip a39483e, Cneu got his
    // first trade, mineiro, and the board took him to the hunt 16 s later: T-314)
    if (on0) G.Life.onRole = function (v, prev) { if (v && v.set === set.id && prev && v.role !== prev) changes.set(v.id, (changes.get(v.id) || 0) + 1); return on0.apply(this, arguments); };
    unflood(after1.was); live(60);
    if (on0) G.Life.onRole = on0;
    const twice = [...changes].filter(([, n]) => n > 1).map(([id]) => P(id)).filter(Boolean);
    const works = [...S.buildings.values()].filter(b => b.set === set.id && !b.built && b.type !== 'ruin' && reachT(set, b));
    const lost = works.length ? builders(set).filter(v => free(v) && !works.some(b => reachV(v, b))) : [];
    const bad = newBad(B3);
    ok('c3 a água vai embora: sem vai e vem', !twice.length && !lost.length && !bad.length && !said.length, `${set.name}, sem a ilhota: em 60 s, ${changes.size} troca(s) de ofício na cidade, ${twice.length ? `${names(twice)} trocaram DUAS vezes` : 'ninguém duas vezes'}; ${works.length} obra(s) das ruas, ${lost.length ? `${names(lost)} SEM caminho a elas` : 'todo construtor livre as alcança'}${bad.length ? ' — o verificador: ' + bad.join(' · ') : ''}${obrasSaid()}`);
    after1 = null;
  }
}

// ---------------- c4 the work the streets do not reach ----------------
{
  fresh(); const B = base();
  const set = pickTown(); const at = set && islet(set);
  let pass = false, info = '';
  if (!set || !at) info = !set ? 'nenhuma cidade' : `${set.name}: nenhum chão para a ilhota`;
  else {
    const was = flood(at[0], at[1]);
    const w = V.startProject(set, 'well', [at[0], at[1]]);
    const b0 = builders(set).filter(free).map(v => v.id);
    // (the town's works its streets reach, besides the islet's: a builder of the town reaches them, and keeps the trade)
    const theirs = [...S.buildings.values()].filter(b => b.set === set.id && !b.built && b.type !== 'ruin' && b !== w && reachT(set, b));
    live(20);
    const notTown = !!w && !reachT(set, w);
    // (who left the trade in these 20 s did so by the town's counts — a builder who still reaches the streets' works —, never
    // one sent away for a work across the water)
    const outs = roleOf(b0).filter(v => v.role !== 'construtor');
    const strandedOut = outs.filter(v => !theirs.some(b => reachV(v, b)));
    pass = notTown && builders(set).length > 0 && !strandedOut.length;
    info = `${set.name}: ${w ? `${w.type}#${w.id} na ilhota, ${notTown ? 'fora das obras da cidade' : 'CONTADA como obra da cidade'}` : 'nenhuma obra na ilhota'}; ${theirs.length} outra(s) obra(s) nas ruas; dos ${b0.length} construtores, ${b0.length - outs.length} seguem no ofício${outs.length ? ` (${outs.length - strandedOut.length} saíram pelas contas da cidade)` : ''}${strandedOut.length ? `; ${names(strandedOut)} SAÍRAM sem caminho às obras das ruas` : ''}`;
    const bad = newBad(B); if (bad.length) { pass = false; info += ` — o verificador: ${bad.join(' · ')}`; }
    if (said.length) { pass = false; info += obrasSaid(); }
    unflood(was);
  }
  ok('c4 a obra que as ruas não alcançam não tira ninguém do ofício', pass, info);
}

// ---------------- c5 the stores cut off by the water: the fire on the streets' side, with a builder from there ----------------
// (the h14 of the fome.js without the god's hand: the builders the water leaves on the far side stay there — T-256 brought them
// to the streets; here the town names one of its own streets, L-389)
{
  fresh(); const B = base();
  const set = pickTown(); let pass = false, info = '';
  if (!set) info = 'nenhuma cidade';
  else {
    const stores = V.dropoffs(set.id).slice(); const fire0 = new Set(stores.map(b => b.id));
    const reached = () => [...S.buildings.values()].filter(b => b.set === set.id && G.BDEF[b.type] && (b.built ? G.BDEF[b.type].dropoff : b.type === 'campfire') && W.townReaches(set, ...V.frontTile(b)));
    const was = new Map();
    for (const b of stores) for (let y = b.y - 2; y < b.y + b.h + 2; y++) for (let x = b.x - 2; x < b.x + b.w + 2; x++) {
      if (!W.inb(x, y)) continue; const i = W.idx(x, y); if (S.occ[i] || was.has(i) || S.type[i] <= G.T.SEA) continue; was.set(i, S.type[i]); S.type[i] = G.T.DEEP;
    }
    S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk();
    const cut = !reached().length;
    const off = q => { if (!W.reachesTown(q, set)) return true; const hb = S.buildings.get(q.inside || q.home); if (!hb) return false; const d = Vg.door(hb); return !W.townReaches(set, d[0], d[1]); };
    const far = builders(set).filter(q => free(q) && off(q)).map(q => q.id);
    // (the builders whose home the water left on the far side are at home, as Quinto was in the h14 — in the morning, their
    // errands ended: they walk out of their door onto the far side. In the world of the proof one may be out on the streets at
    // that moment, and the case would not be the h14's)
    for (const q of roleOf(far)) { const hb = S.buildings.get(q.home); if (!hb) continue; const d = Vg.door(hb); Vg.endTask(q); q.sleeping = false; q.inside = hb.id; q.x = d[0]; q.y = d[1]; q.path = null; }
    const stuck = roleOf(far).filter(q => !W.reachesTown(q, set));
    // (who built it: the ones on a task on it who could walk to it — one from the far side may take it in the seconds before the
    // town counts its builders again, and fail his way to it)
    let lit = null; const t0 = S.clock; const workers = new Set();
    // (what the hands set down with no store within reach — L-406: a builder with wood in the hands never built the fire —
    // is picked up when the fire stands, by one who reaches it and takes it there, L-408: before, it lay there for ever)
    const down = []; const book = e => { if (e[8] === 'pousou' && !e[7] && String(e[4]).startsWith('g:')) down.push(+String(e[4]).slice(2)); };
    const gone = () => down.every(id => !(S.loose || []).some(o => o.id === id));
    D.onMove.push(book);
    if (cut) live(900, () => { const n = reached().find(b => !fire0.has(b.id)); if (n && !lit) lit = n; if (lit) for (const v of S.villagers.values()) if (v.task && v.task.type === 'build' && v.task.id === lit.id && reachV(v, lit)) workers.add(v.id); return !!(lit && lit.built); });
    const tLit = Math.round(S.clock - t0); let tUp = -1;
    if (lit && lit.built && down.length) { const t1 = S.clock; live(300, gone); if (gone()) tUp = Math.round(S.clock - t1); }
    D.onMove.splice(D.onMove.indexOf(book), 1);
    const helped = [...workers].filter(id => far.includes(id));
    pass = cut && stuck.length > 0 && !!lit && lit.built && !helped.length && gone();
    info = !cut ? `a água em volta dos ${stores.length} armazéns de ${set.name} não os cortou das ruas` : !stuck.length ? `${set.name}: nenhum construtor com a casa do outro lado da água (sem a premissa do h14)` : `${set.name}, ${stores.length} armazém(ns) cortado(s) pela água; ${stuck.length} construtor(es) em casa do outro lado (${names(stuck)}), deixados lá (agora ${stuck.map(v => v.role).join(', ')}): ${lit ? `${lit.type}#${lit.id} nova, ${lit.built ? 'acesa' : 'AINDA em obra'} em ${tLit} s, com ${names(roleOf([...workers]))}${helped.length ? ` (${names(roleOf(helped))} DO OUTRO LADO, por um caminho que o corte não fechou)` : ''}` : 'NENHUMA fogueira nova do lado das ruas em 900 s'}; carga pousada sem armazém ao alcance: ${down.length}${down.length ? (gone() ? `, apanhada toda${tUp >= 0 ? ' ' + tUp + ' s depois da fogueira' : ''}` : ', NÃO apanhada (ainda no chão)') : ''}`;
    // (a town cut from its stores for days is the hunger rule's own case, S1 — the fome.js h5 —: not this case's to judge)
    const bad = newBad(B, new Set(['fome'])); if (bad.length) { pass = false; info += ` — o verificador: ${bad.join(' · ')}`; }
    if (said.length) { pass = false; info += obrasSaid(); }
    for (const [i, t] of was) S.type[i] = t; S.typeVer++; W.invalidateLand(); W.touchWalk();
  }
  ok('c5 os armazéns cortados: a fogueira das ruas, sem a mão do deus', pass, info);
}

// ---------------- c6 the stores cut off, and the builders of the streets with loads in the hands ----------------
// (the case of the L-406 provoked on purpose: in the c5 the load in the hands depends on the world's way — in the generation 7's
// Roma, Sabina came to the trade in the middle of felling a tree (the exchange of the L-389) —; here the hand of the proof
// puts a plain load of wood in the hands of every builder of the town on the streets' side, their errands ended. Before the
// L-406 they went to deliver it first, to a store across the water, failed, waited 12 s and began again: the fire was never
// built. And, the fire up, what they set down is picked up by one who reaches it and taken there — L-408: before, it lay there
// for ever)
{
  fresh(); const B = base();
  const set = pickTown(); let pass = false, info = '';
  if (!set) info = 'nenhuma cidade';
  else {
    const stores = V.dropoffs(set.id).slice(); const fire0 = new Set(stores.map(b => b.id));
    const reached = () => [...S.buildings.values()].filter(b => b.set === set.id && G.BDEF[b.type] && (b.built ? G.BDEF[b.type].dropoff : b.type === 'campfire') && W.townReaches(set, ...V.frontTile(b)));
    const was = new Map();
    for (const b of stores) for (let y = b.y - 2; y < b.y + b.h + 2; y++) for (let x = b.x - 2; x < b.x + b.w + 2; x++) {
      if (!W.inb(x, y)) continue; const i = W.idx(x, y); if (S.occ[i] || was.has(i) || S.type[i] <= G.T.SEA) continue; was.set(i, S.type[i]); S.type[i] = G.T.DEEP;
    }
    S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk();
    const cut = !reached().length;
    const crew = builders(set).filter(q => free(q) && W.reachesTown(q, set));
    for (const q of crew) { Vg.endTask(q); if (q.carry && q.carry.n > 1e-6) D.use('v:' + q.id, q.carry.k, q.carry.n, { code: 'teste', mine: true, part: true }); D.make('v:' + q.id, 'wood', 3, { code: 'teste' }); }
    const down = []; const book = e => { if (e[8] === 'pousou' && !e[7] && String(e[4]).startsWith('g:') && crew.some(q => e[3] === 'v:' + q.id)) down.push(+String(e[4]).slice(2)); };
    const gone = () => down.length > 0 && down.every(id => !(S.loose || []).some(o => o.id === id));
    D.onMove.push(book);
    let lit = null, tLit = -1; const t0 = S.clock;
    if (cut && crew.length) live(600, () => { const n = reached().find(b => !fire0.has(b.id)); if (n && !lit) lit = n; if (lit && lit.built && tLit < 0) tLit = Math.round(S.clock - t0); return !!(lit && lit.built); });
    let tUp = -1; if (lit && lit.built && down.length) { const t1 = S.clock; live(300, gone); if (gone()) tUp = Math.round(S.clock - t1); }
    D.onMove.splice(D.onMove.indexOf(book), 1);
    const stuckNow = crew.filter(q => q.carry && q.carry.n > 1e-6 && q.task && q.task.type === 'deliver').length;
    pass = cut && crew.length > 0 && !!lit && lit.built && gone();
    info = !cut ? `a água em volta dos ${stores.length} armazéns de ${set.name} não os cortou das ruas` : !crew.length ? `${set.name}: nenhum construtor do lado das ruas` : `${set.name}, ${stores.length} armazém(ns) cortado(s) pela água; ${crew.length} construtor(es) das ruas com 3 de lenha nas mãos (${names(crew)}): ${down.length} pousaram a carga no chão; ${lit ? `${lit.type}#${lit.id} nova, ${lit.built ? 'acesa em ' + tLit + ' s' : 'AINDA em obra em 600 s'}` : 'NENHUMA fogueira nova do lado das ruas em 600 s'}${stuckNow ? `; ${stuckNow} ainda com a lenha nas mãos, a caminho de entregar` : ''}; a carga pousada ${!down.length ? '-' : gone() ? `apanhada toda${tUp >= 0 ? ', ' + tUp + ' s depois da fogueira' : ''}` : 'NÃO apanhada (ainda no chão)'}`;
    const bad = newBad(B, new Set(['fome'])); if (bad.length) { pass = false; info += ` — o verificador: ${bad.join(' · ')}`; }
    if (said.length) { pass = false; info += obrasSaid(); }
    for (const [i, t] of was) S.type[i] = t; S.typeVer++; W.invalidateLand(); W.touchWalk();
  }
  ok('c6 os construtores das ruas com carga nas mãos: a pousam, levantam a fogueira, e a carga é apanhada', pass, info);
}

// ---------------- clean ----------------
{ const e = M.erros(); ok('limpo', M.limpo(), Object.keys(e.mod).length ? JSON.stringify(e.mod) : e.console.length ? e.console.slice(0, 2).join(' · ') : 'sem erro de módulo nem aviso no console'); }
console.log(fails.length ? `CIDADE-CORTADA: FALHOU (${fails.join(', ')})` : 'CIDADE-CORTADA: TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
