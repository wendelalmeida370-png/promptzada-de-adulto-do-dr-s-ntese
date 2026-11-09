// chao: a carga simples no chão, de ponta a ponta num mundo pronto (o «cidade»), em Node, pelo qa/nodemundo.js — a L-408, e o
// L-169 e a L-406, que a põem lá: quem vai ao trabalho de mãos vazias apanha a carga do povo dele que alcança, com um armazém
// ao alcance, e a leva ao armazém, tudo pelo livro (G.Depot: 'pousou', 'apanhou', 'entrega').
//  a1 o caso do L-169: um povo livre fundado de propósito (G.War.foundFree), sem armazém nenhum — a fogueira que levantaram na
//     marcha derrubada pela mão do deus, como no h4 do fome.js —; quem leva uma carga simples a pousa no chão; o povo levanta a
//     fogueira de novo; um deles a apanha e a entrega à fogueira: o que pousou é o que foi apanhado e o que chegou
//  a2 um save com a carga no chão, antes da fogueira: carregado, a carga segue lá, e é apanhada e entregue depois
//  a3 quem vai apanhá-la morre no caminho: ela segue no chão, e outro a apanha
//  a4 o que uma operação viva pôs no chão é dela (op ≠ 0 — as caixas do porto, 'pegarChao', e a matéria das oficinas, 'chao'):
//     as mãos do povo não o tocam; acabada a operação, é do povo, e é apanhado
//  a5 o mapa muda: a carga numa ilhota que a água cortou — ninguém a alcança, ninguém vai, o verificador calado —; a água vai
//     embora, e ela é apanhada
//  a6 o verificador vê (QA.chao, S3, no oficio-inv.js): com a apanha desligada pela mão da prova, a carga que alguém de mãos
//     vazias alcança, com um armazém ao alcance, por mais de 300 s; ligada de novo, ela é apanhada e ele se cala
//  e nenhum erro de módulo nem aviso no console.
//   node qa/chao.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/chao.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, V = G.Village, Vg = G.Vg, W = G.W, A = G.Act;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | chao ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'cidade';
let S;
M.pronto(world); S = G.S; M.viver(2);
const snap = G.Save.serialize();
// (each case from the same world, in the morning and in the god's peace)
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); S = G.S; S.time = 0.3; G.Politics.divinePeace(); G.inSim = Math.max(G.inSim || 0, 1); };
const peace = () => { S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN); };
const reload = () => { M.salvarCarregar(); S = G.S; G.inSim = Math.max(G.inSim || 0, 1); };
const seen = []; D.onMove.push(e => { seen.push(e); });
const live = (sec, until, each) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 10 === 0) peace(); if (each) each(k); if (until && until()) return true; } return false; };
const r2 = x => Math.round(x * 100) / 100;
const lines = (L0, f) => seen.slice(L0).filter(f);
const sum = L => r2(L.reduce((n, e) => n + e[6], 0));
const base = () => new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`));
const newBad = B => QA.check().filter(q => q.sev <= 2 && !B.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
const gOf = id => (S.loose || []).find(o => o.id === id) || null;
const picked = (L0, gid) => lines(L0, e => e[8] === 'apanhou' && e[3] === 'g:' + gid);
// (what the pickers took to the store: their 'entrega' of the kind, from their hands to the people's store, after they picked
// it up — what one of them delivered before, of his own work, is not the load's: in the «cidade» of the generation 15 Torvald
// set his own wood down while the free people had no fire, delivered 4 of it to the fire once it stood, then picked up Tove's
// 3, and the case counted the 4 as hers and ended before the 3 arrived, T-521)
const delivered = (L0, gid, k, fid) => { const up = picked(L0, gid); return lines(L0, e => e[8] === 'entrega' && e[4] === 'f:' + fid && e[5] === k && up.some(p => p[4] === e[3] && e[0] > p[0])); };
const onWay = gid => [...S.villagers.values()].filter(v => v.task && v.task.type === 'apanhar' && v.task.g === gid);
// (what the L-408 rule says, every 5 s: each case keeps what it said)
let said = [];
const seeChao = () => { if (!QA.chao) return; QA.chao((sys, sev, msg) => { if (!said.includes(msg)) said.push(msg); }, S); };
// the town: the most people of all, with a store
const town0 = () => [...S.settlements.values()].filter(s => V.dropoffs(s.id).length && G.Fac.get(s.fac)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0] || null;

// ---------------- the L-169's case: a free people with no store at all ----------------
// (ten of the town's grown-ups found a free people on purpose, as fome.js h4 does — G.War.foundFree: they walk to the new
// site —; when they are there, one with a plain load in the hands goes to his work: the delivery with no store sets it down
// where he stands, L-169)
function founded() {
  const set0 = town0(); const f0 = set0 && G.Fac.get(set0.fac); if (!f0) return null;
  const grown = [...S.villagers.values()].filter(v => v.set === set0.id && v.age >= 18 && v.age < 55 && !v.captive && !v.aboard && !v.jail && !v.ug && v.id !== f0.leader && v.role !== 'guerreiro' && !(S.avatar && S.avatar.id === v.id)).sort((a, b) => a.id - b.id).slice(0, 10);
  for (const v of grown) { Vg.endTask(v); if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true, part: true }); v.hunger = 10; v.energy = 90; }
  const captor = G.Fac.all().filter(o => o.id !== f0.id && G.Fac.pop(o.id) > 0).sort((a, b) => a.id - b.id)[0] || null;
  const fac = G.War.foundFree(grown, captor, 'revolta'); const set = fac ? G.Fac.capitalOf(fac.id) : null;
  if (!set) return null;
  live(120, () => grown.filter(v => S.villagers.has(v.id)).every(v => !(v.task && v.task.type === 'migrate')));
  return { fac, set, grown };
}
const fireOf = set => { const s = S.settlements.get(set.id); const b = s && S.buildings.get(s.campfire); return b && b.type === 'campfire' ? b : null; };
function setDown(P) {
  const v = P.grown.filter(o => S.villagers.has(o.id) && !(o.carry && o.carry.n > 1e-6)).sort((a, b) => G.dist2(a.x, a.y, P.set.cx, P.set.cy) - G.dist2(b.x, b.y, P.set.cx, P.set.cy) || a.id - b.id)[0];
  if (!v) return null;
  // (the case is the delivery with no store, L-169: the fire the founders raised during the march is pulled down by the god's
  // hand, as in the fome.js h4 — at the end of the march it stood, and the load went to it —; and the delivery is given by the
  // hand of the proof above the new people's first calls, so that none takes him before his first step: the feast of the
  // founding, 3,2, takes anyone under 3)
  for (const b of [...S.buildings.values()]) if (b.set === P.set.id && (b.type === 'campfire' || (b.built && G.BDEF[b.type] && G.BDEF[b.type].dropoff))) V.destroyBuilding(b, 'deus');
  const L0 = seen.length; D.make('v:' + v.id, 'wood', 3, { code: 'teste' }); Vg.endTask(v); Vg.H.setTask(v, { type: 'deliver', pri: 3.1 });
  live(10, () => lines(L0, e => e[8] === 'pousou' && e[3] === 'v:' + v.id).length > 0);
  const e = lines(L0, e => e[8] === 'pousou' && e[3] === 'v:' + v.id)[0];
  return e ? { v, gid: +String(e[4]).slice(2), n: e[6], k: e[5], at: [r2(gOf(+String(e[4]).slice(2)).x), r2(gOf(+String(e[4]).slice(2)).y)] } : { v, gid: 0, n: 0, k: 'wood', at: null, task: v.task ? v.task.type : '-' };
}
// (the case of the L-169, to the end: the fire up, the load picked up and taken to it — the save and the death, by hooks)
function l169(name, hook) {
  fresh(); said = []; const B = base(); const P = founded();
  if (!P) return ok(name, false, 'nenhum lugar livre para um povo novo neste mundo');
  const d = setDown(P); const L0 = seen.length;
  if (!d || !d.gid) return ok(name, false, `${d ? d.v.name + ' com 3 de lenha nas mãos, sem armazém: não pousou (' + d.task + ')' : 'ninguém de mãos vazias'}`);
  const before = !!(fireOf(P.set) && fireOf(P.set).built);
  let extra = ''; if (hook && hook.down) extra = hook.down(P, d) || '';
  let tFire = -1, tPick = -1; const t0 = S.clock;
  live(500, () => {
    const f = fireOf(P.set); if (f && f.built && tFire < 0) tFire = S.clock - t0;
    if (hook && hook.each) { const x = hook.each(P, d); if (x) extra = x; }
    if (tPick < 0 && picked(L0, d.gid).length) tPick = S.clock - t0;
    return !gOf(d.gid) && delivered(L0, d.gid, d.k, P.fac.id).length > 0;
  }, k => { if (k % 50 === 49) seeChao(); });
  const up = sum(picked(L0, d.gid)), got = sum(delivered(L0, d.gid, d.k, P.fac.id)); const left = gOf(d.gid);
  const who = [...new Set(picked(L0, d.gid).map(e => e[4]))].map(r => S.villagers.get(+String(r).slice(2))).filter(Boolean);
  const bad = newBad(B); const pass = !before && tFire >= 0 && Math.abs(up - d.n) < 0.01 && Math.abs(got - d.n) < 0.01 && !left && !bad.length && !said.length && (!hook || !hook.pass || hook.pass(P, d, who));
  ok(name, pass, `${P.set.name}, povo livre sem armazém: ${d.v.name} pousou ${d.n} de lenha em ${d.at} ('pousou')${extra ? '; ' + extra : ''}; a fogueira ${tFire >= 0 ? 'pronta aos ' + Math.round(tFire) + ' s' : 'NÃO ficou pronta'}; apanhada ${up} de ${d.n}${tPick >= 0 ? ' aos ' + Math.round(tPick) + ' s' : ''}${who.length ? ' por ' + who.map(v => v.name).join(', ') : ''}, entregue à fogueira ${got}; no chão agora ${left ? r2(left.n) : 0}${bad.length ? ' — ' + bad.join(' · ') : ''}${said.length ? ' — o verificador: «' + said[0] + '»' : ''}`);
}
l169('a1 o caso do L-169: pousada sem armazém, apanhada quando a fogueira fica pronta, e entregue');
l169('a2 um save com a carga no chão', { down: () => { reload(); return 'salvo e carregado com a carga no chão'; } });
{
  let killed = null;
  l169('a3 quem vai apanhá-la morre no caminho', {
    each: (P, d) => { if (killed) return null; const w = onWay(d.gid).find(v => v.task.st <= 1); if (!w) return null; killed = { id: w.id, name: w.name }; V.kill(w, 'god', true); return `${killed.name} morreu a caminho dela`; },
    pass: (P, d, who) => !!killed && !who.some(v => v.id === killed.id) && who.length > 0,
  });
}

// ---------------- a4 what a living operation set down is its own ----------------
{
  fresh(); said = []; const B = base(); const set = town0(); const f = set && G.Fac.get(set.fac); let pass = false, info = '';
  const st = set && V.dropoffs(set.id)[0];
  const u = st && [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && !v.captive && !v.aboard && !(v.carry && v.carry.n > 1e-6) && W.reaches(v, ...V.frontTile(st))).sort((a, b) => a.id - b.id)[0];
  if (!u) info = 'nenhuma cidade com armazém e gente';
  else {
    // (an operation of the world, living, with no end of its own — the city's public service, act-servicos.js —: what it set
    // down near the store is its own, as the porters' crates and the workshops' input are theirs)
    const op = A.start('publico', { at: st.id, set: set.id, fac: f.id, by: u.id, why: 'a prova do chão' });
    const [fx, fy] = V.frontTile(st); const L0 = seen.length;
    D.make('v:' + u.id, 'wood', 3, { code: 'teste' });
    const r = D.drop('v:' + u.id, 'wood', 3, fx + 0.5, fy + 1.5, { op: op.id, code: 'pousou', by: u.id, fac: f.id });
    live(60, null, k => { if (k % 50 === 49) seeChao(); });
    const held = !!gOf(r.g) && !picked(L0, r.g).length && !onWay(r.g).length && gOf(r.g).op === op.id;
    A.end(op, 'ok', 'a prova'); const L1 = seen.length;
    live(300, () => !gOf(r.g), k => { if (k % 50 === 49) seeChao(); });
    const up = sum(picked(L1, r.g));
    const bad = newBad(B); pass = held && Math.abs(up - r.n) < 0.01 && !gOf(r.g) && !bad.length && !said.length;
    info = `${set.name}: ${r.n} de lenha no chão diante do armazém #${st.id}, da operação #${op.id} ('publico', viva): em 60 s ${held ? 'ninguém do povo a tocou' : 'TOCADA pelas mãos do povo'}; acabada a operação, apanhada ${up} de ${r.n}${bad.length ? ' — ' + bad.join(' · ') : ''}${said.length ? ' — o verificador: «' + said[0] + '»' : ''}`;
  }
  ok('a4 o que uma operação viva pôs no chão é dela', pass, info);
}

// ---------------- a5 the map changes: the load on an islet the water cut off ----------------
function fitsIslet(px, py) {
  for (let y = py - 3; y <= py + 3; y++) for (let x = px - 3; x <= px + 3; x++) {
    if (!W.inb(x, y)) return false; const i = W.idx(x, y); const d = Math.max(Math.abs(x - px), Math.abs(y - py));
    if (S.occ[i] || (S.wall && S.wall[i]) || S.type[i] < G.T.SAND || S.cliff[i]) return false;
    if (d <= 1) { if (!W.walkable(i)) return false; continue; }
    if (S.treeAt[i] || S.objAt[i] || (S.dry && S.dry[i]) || (S.ice && S.ice[i]) || (G.Caves && G.Caves.isMouth(i))) return false;
  }
  for (const v of S.villagers.values()) if (Math.abs(v.x - (px + 0.5)) <= 3.6 && Math.abs(v.y - (py + 0.5)) <= 3.6) return false;
  for (const o of S.loose || []) if (Math.abs(o.x - (px + 0.5)) <= 3.6 && Math.abs(o.y - (py + 0.5)) <= 3.6) return false;
  return true;
}
function islet(set) {
  const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
  for (let r = 4; r <= 40; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && fitsIslet(cx + dx, cy + dy)) return [cx + dx, cy + dy];
  return null;
}
{
  fresh(); said = []; const B = base();
  // (the town with ground for an islet nearest its middle — a big city leaves little bare ground near it —, the most people first)
  const towns = [...S.settlements.values()].filter(s => V.dropoffs(s.id).length && G.Fac.get(s.fac)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id);
  let set = null, at = null; for (const s of towns) { const p = islet(s); if (p) { set = s; at = p; break; } }
  const f = set && G.Fac.get(set.fac); let pass = false, info = '';
  const u = at && [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && !v.captive && !v.aboard && !(v.carry && v.carry.n > 1e-6)).sort((a, b) => a.id - b.id)[0];
  if (!at || !u) info = !set ? 'nenhuma cidade' : 'nenhum chão de ilhota perto da cidade';
  else {
    const L0 = seen.length; D.make('v:' + u.id, 'wood', 3, { code: 'teste' });
    const r = D.drop('v:' + u.id, 'wood', 3, at[0] + 0.5, at[1] + 0.5, { code: 'pousou', by: u.id, fac: f.id });
    // (the ring of deep water: the terrain changes as the world's rule says — S.typeVer and the land)
    const was = new Map(); for (let y = at[1] - 3; y <= at[1] + 3; y++) for (let x = at[0] - 3; x <= at[0] + 3; x++) { if (Math.max(Math.abs(x - at[0]), Math.abs(y - at[1])) < 2) continue; const i = W.idx(x, y); was.set(i, S.type[i]); S.type[i] = G.T.DEEP; }
    S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk();
    let went = 0; live(90, null, k => { if (onWay(r.g).length) went++; if (k % 50 === 49) seeChao(); });
    const cut = !!gOf(r.g) && !picked(L0, r.g).length && !went && !said.length;
    for (const [i, t] of was) S.type[i] = t; S.typeVer++; W.invalidateLand(); W.touchWalk();
    const L1 = seen.length; let t1 = -1; const t0 = S.clock;
    live(300, () => !gOf(r.g), k => { if (t1 < 0 && picked(L1, r.g).length) t1 = S.clock - t0; if (k % 50 === 49) seeChao(); });
    const up = sum(picked(L1, r.g)); const bad = newBad(B);
    pass = cut && Math.abs(up - r.n) < 0.01 && !gOf(r.g) && !bad.length && !said.length;
    info = `${set.name}: ${r.n} de lenha numa ilhota em ${at[0]},${at[1]}, a água em volta: em 90 s ${cut ? 'ninguém foi, ninguém apanhou, o verificador calado' : `${went ? 'ALGUÉM FOI' : ''}${picked(L0, r.g).length ? ' APANHADA' : ''}${said.length ? ' o verificador: «' + said[0] + '»' : ''}`}; a água foi embora: apanhada ${up} de ${r.n}${t1 >= 0 ? ' aos ' + Math.round(t1) + ' s' : ''}${bad.length ? ' — ' + bad.join(' · ') : ''}`;
  }
  ok('a5 o mapa muda: a ilhota, e a água que vai embora', pass, info);
}

// ---------------- a6 the checker sees ----------------
{
  fresh(); said = []; const set = town0(); const f = set && G.Fac.get(set.fac); let pass = false, info = '';
  const st = set && V.dropoffs(set.id)[0];
  const u = st && [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && !v.captive && !v.aboard && !(v.carry && v.carry.n > 1e-6) && W.reaches(v, ...V.frontTile(st))).sort((a, b) => a.id - b.id)[0];
  if (!QA.chao) info = 'sem a regra QA.chao no oficio-inv.js';
  else if (!u) info = 'nenhuma cidade com armazém e gente';
  else {
    const [fx, fy] = V.frontTile(st); D.make('v:' + u.id, 'wood', 3, { code: 'teste' });
    const r = D.drop('v:' + u.id, 'wood', 3, fx + 0.5, fy + 1.5, { code: 'pousou', by: u.id, fac: f.id });
    // (the pickup off, by the hand of the proof: the rule reads the ground itself, not the pickup's code)
    const keep = Vg.groundLoad; Vg.groundLoad = () => false; let saidAt = -1; const t0 = S.clock;
    try { live(330, () => said.length > 0, k => { if (k % 50 === 49) { seeChao(); if (said.length && saidAt < 0) saidAt = S.clock - t0; } }); } finally { Vg.groundLoad = keep; }
    // (on again: the load is picked up, and the rule, asked then, says nothing)
    const seen1 = said.slice(); const L1 = seen.length; const t1 = S.clock;
    live(300, () => !gOf(r.g)); const tUp = Math.round(S.clock - t1);
    said = []; seeChao();
    pass = seen1.length > 0 && saidAt > 300 && !gOf(r.g) && Math.abs(sum(picked(L1, r.g)) - r.n) < 0.01 && !said.length;
    info = `${set.name}: ${r.n} de lenha no chão diante do armazém #${st.id}, a apanha desligada: ${seen1.length ? `aos ${Math.round(saidAt)} s, «${seen1[0]}»` : 'o verificador NÃO viu em 330 s'}; ligada de novo: apanhada ${sum(picked(L1, r.g))} de ${r.n}${gOf(r.g) ? '' : ' em ' + tUp + ' s'}, ${said.length ? 'o verificador ainda: «' + said[0] + '»' : 'e o verificador calado'}`;
  }
  ok('a6 o verificador vê', pass, info);
}
const err = M.erros(); ok('limpo', !Object.keys(err.mod || {}).length && !err.console.length, `módulos: ${JSON.stringify(err.mod)}; console: ${err.console.slice(0, 3).join(' | ') || 'nada'}`);
console.log(fails.length ? `CHAO: FALHOU (${fails.join(', ')})` : 'CHAO: TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
