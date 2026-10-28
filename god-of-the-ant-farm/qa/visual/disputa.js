// disputa: a crate of the quay between the body and the world's porters — one rule for both —, in Node, without a browser
// (the world of qa/nodemundo.js with the 3D's own files after it, qa/visual/tres-node.js: the crates are where the 3D draws them):
//   node qa/visual/disputa.js [mundo]       (default: the ready world «metropole»)
// (the E on a crate held it only at the contact: a porter could take it while the hands went to it, and the answer came at the
// end of the gesture — «Outro carregador pegou esta caixa.». Now the key begins the act in the world's step — Act.begin: the
// crate the hands' from then on, as a porter's is from the moment he goes for it —, the contact does it — Act.commit —, and a
// gesture cut short lets it go — Act.abort)
// The proofs:
//   1. the rule, one for both — asked of the world, for the same crate, what the body's door (Act.begin) and a porter's
//      (Porto.claim) answer, everything put back after: a free crate, both may; one a porter is acting on, neither may; one a
//      porter claimed and left, both may; one the body's E holds, no porter may; the body's own and a porter's own, each may his;
//      one held by someone no longer lived, any porter may; the body's hold with no gesture under way lasts the 60 s of the
//      world the rule gives it, then the porters may
//   2. the body first: the E holds the crate from the next step; a porter sent to the quay then goes for another; the body
//      lifts it at the contact, the porter his own
//   3. the porter first: an E on the crate he is going for is refused at the key, in the world's words, and the gesture stops
//      before its contact; nothing changes on the quay; he lifts it (made again when an errand from outside calls him away
//      before he does — the porter lives: T-157)
//   4. the gesture cut short (the world pushes the body): the crate let go at the next step — free for the porters, offered to
//      the body again —; nothing lifted
//   5. saved and loaded in the middle of the gesture: the gesture is not saved, and neither is the hold (the world lets every
//      claim of a quay go at a load: the errands are not saved) — the crate free to whoever comes, the body too —; E again, and
//      a crate comes to the hands
//   6. the god takes the crate away in the middle: the world's words at the contact, the hands empty; the next E lifts the next
//   7. a busy quay — the town's porters at work —, E after E: a refusal only ever at the key, never at the contact; no crate in
//      two hands
//   8. the body dies in the middle: the crate free for the porters
//   and the verifier clean (qa.js, with the activities' and the body's rules), no module error
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | disputa ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
M.pronto(world); M.viver(2);
let S = G.S; const W = G.W, TL = G.Space.TILE, A = G.Act, P = G.Porto, D = G.Depot, I = G.Interact, P3 = G.People3D;
const RDT = 1 / 30;
// (the frame as the game's: the world's step, the body's frame, the people drawn around the body)
const look = () => { const p = G.Avatar.pos(); if (p) P3.update(RDT, { X: p.X, Y: p.Y, Z: p.Z }); };
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); look(); };
const still = n => { for (let k = 0; k < (n || 4); k++) { G.Avatar.frame(RDT); look(); } }; // (the world stopped: only the body and the drawing)
// (what the test does to the world stands for the god's hand, in the world's step)
const god = f => { G.inSim++; const r = f(); G.inSim--; return r; };
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg));
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const faceTo = (X, Z) => { const st = G.Avatar.state(); st.yaw = Math.atan2(Z - st.Z, X - st.X); G.Avatar.input.camYaw = st.yaw; };
const said = []; G.IncUI.toast = t => { said.push([t, G.S.clock]); }; // (the words the hands' acts say, and when: the HUD has none in Node)
const busyOut = (n) => { let k = 0; for (; k < (n || 600) && G.Avatar.busy(); k++) frame(); for (let q = 0; q < 3; q++) frame(); return k; };

// ------------------------------ the town, the quay, the store, the docker, the porters ------------------------------
const porters = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'estivador').length;
const towns = [...S.settlements.values()].filter(s => [...S.buildings.values()].some(b => b.set === s.id && b.type === 'doca' && b.built) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'armazem' && b.built)).sort((a, b) => porters(b) - porters(a) || a.id - b.id);
let set = null, dock = null, fac = null;
const dry = (x, y) => { const i = W.idx(x, y); const t = S.type[i]; return !((t === G.T.RIVER && !S.road[i]) || t <= G.T.SEA) && W.walkableXY(x, y); };
for (const s of towns) {
  for (const d of [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) {
    const sp = god(() => G.Fishers.crateSpot(d)); const st = god(() => P.destOf({ at: d.id, fac: G.Village.facOfSet(d.set), x: d.x + 1, y: d.y + 1, data: {} }));
    if (sp && dry(sp[0], sp[1]) && st && st.type === 'armazem' && god(() => P.access(d, st))) { set = s; dock = d; break; }
  }
  if (dock) break;
}
if (!dock) { ok('um cais com armazém do porto', false, `nenhum em ${world}`); process.exit(1); }
fac = G.Fac.get(set.fac);
const ids = { set: set.id, dock: dock.id, fac: fac.id };
const refresh = () => { S = G.S; set = S.settlements.get(ids.set); dock = S.buildings.get(ids.dock); fac = G.Fac.get(ids.fac); };
// (a clean quay, by day: what was on it goes to the store, the unloading under way ended)
god(() => {
  for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && A.live(op)) A.end(op, 'cancel', 'teste');
  for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + fac.id, c.k, c.n, { code: 'teste', part: true });
  dock.crates = []; S.time = 0.15;
});
const sp0 = god(() => G.Fishers.crateSpot(dock));
// (the hands emptied into the people's store as the world stores a delivery — Depot.store: what does not fit is lost, with its
// line 'sem-lugar' in the ledger —, so they are empty whatever room the store has: T-070)
const clearHands = o => { if (o.carry && o.carry.n > 0) god(() => D.store('v:' + o.id, fac.id, o.carry.k, o.carry.n, { op: o.carry.op || 0, code: 'teste', by: o.id })); };
// (the hands of the quay: stevedores of this town where the feet reach the crates — the first lived by the god, the others the
// world's porters, brought a few steps from the pile so that they go for a crate at once —; those with free hands first, and
// the hands of the three emptied by the depot: a docker may come from his bed with a load still in his arms — T-086)
const loaded = o => !!(o.carry && o.carry.n > 0);
const able = o => o.set === set.id && o.role === 'estivador' && G.Possess.can(o).ok && A.able(o) && W.reaches(o, sp0[0], sp0[1]);
// (the stevedores of a town are as many as the crates waiting on its quays ask, up to three a store — harbor.js, the town's job
// board every 4 s of the world —: a clean quay asks one. Fewer than the proof needs: the god lands a catch on the quay — the
// one the proof lands first anyway — and the town calls its hands by its own rule, in 30 s at most: T-224)
let called = '';
if ([...S.villagers.values()].filter(able).length < 3) {
  const n0 = [...S.villagers.values()].filter(able).length; god(() => { S.time = 0.15; P.landCatch(dock, 'food', 32, 'arenque', '#a8c0d0', 0); });
  let t = 0; for (; t < 30 && [...S.villagers.values()].filter(able).length < 3; t++) M.viver(1);
  called = ` (eram ${n0}: com um barco no cais a cidade chamou mais em ${t} s)`;
}
const cands = [...S.villagers.values()].filter(able).sort((a, b) => loaded(a) - loaded(b) || a.id - b.id);
if (cands.length < 3) { ok('um estivador para viver e dois carregadores do mundo', false, `${cands.length} em ${set.name}${called || ''}`); process.exit(1); }
let v = cands[0]; const p1 = cands[1], p2 = cands[2]; for (const o of [v, p1, p2]) clearHands(o);
const near = []; for (let r = 2; r <= 4 && near.length < 4; r += 0.5) for (let k = 0; k < 24 && near.length < 4; k++) { const a = k / 24 * Math.PI * 2; const x = sp0[0] + Math.cos(a) * r, y = sp0[1] + Math.sin(a) * r; if (dry(x, y) && W.canWalk(sp0[0], sp0[1], x, y, false)) near.push([x, y]); }
if (near.length < 3) { ok('lugares perto do cais', false, near.length); process.exit(1); }
// (brought out of a cave first, as the god's hand would: a porter who went down one by himself between two parts — the
// world's people explore — and was only put by the pile stayed underground, and the caves let him out a second later at the
// mouth nearest, 23 tiles away: T-154)
const bring = (o, at) => god(() => { if (o.ug && G.Caves) G.Caves.exitNow(o); G.Vg.endTask(o); o.x = at[0]; o.y = at[1]; o.path = null; });
bring(v, near[0]); bring(p1, near[1]); bring(p2, near[2]);
if (!G.Possess.take(v).ok) { ok('encarnar o estivador', false, v.name); process.exit(1); }
G.Avatar.attach(v, Math.atan2(sp0[1] - v.y, sp0[0] - v.x)); for (let k = 0; k < 6; k++) frame();
console.log(`(${set.name}: o cais #${dock.id}; ${v.name} encarnado; ${p1.name} e ${p2.name}, carregadores do mundo${called})`);

// ------------------------------ the unloading, the pile, the oracles ------------------------------
let op = null;
const opCrates = () => (op && dock.crates ? dock.crates.filter(c => c.op === op.id) : []);
const drawnOf = () => { const s = new Set(opCrates().map(c => c.id)); return P3.lyingOf(dock.id).filter(e => s.has(e[4])); };
// (crates on the quay, as many as asked: a boat's catch lands — added to the unloading under way, or a new one)
function fresh(n, force) {
  // (an unloading needs room in the people's store — the porters carry nothing to a full one —: the god makes room for a catch
  // and some, so the proof does not hang on how full the store is — T-070)
  god(() => { const f = G.Fac.get(ids.fac); const room = G.Village.cap(f.id) - (f.stock.food || 0); if (room < 80) D.use('f:' + f.id, 'food', 80 - room, { code: 'teste', part: true }); });
  if (!force && opCrates().length >= n) return;
  god(() => { S.time = 0.15; P.landCatch(dock, 'food', 32, 'arenque', '#a8c0d0', 0); op = P.opAt(dock); });
  for (let k = 0; k < 6; k++) frame();
}
// (the body a step from the pile, facing it, with the prompt «E — Pegar a caixa…» of a free crate of the unloading; when there is
// none, why: pileWhy)
let pileWhy = '';
function atPile() {
  for (let tries = 0; tries < 3; tries++) {
    const dr = drawnOf(); if (!dr.length) { pileWhy = 'nenhuma caixa desenhada'; fresh(6, true); continue; }
    const cx = dr.reduce((a, e) => a + e[0], 0) / dr.length, cz = dr.reduce((a, e) => a + e[2], 0) / dr.length;
    const nearest = (X, Z) => Math.min(...dr.map(e => Math.hypot(e[0] - X, e[2] - Z)));
    const seen = [];
    for (let k = 0; k < 8; k++) {
      const dir = k / 8 * Math.PI * 2; let X = cx, Z = cz; for (let q = 0; q < 200 && nearest(X, Z) < 2.0; q++) { X += Math.cos(dir) * 0.02; Z += Math.sin(dir) * 0.02; }
      const x = X / TL, y = Z / TL; if (!dry(x, y) || !W.canWalk(sp0[0], sp0[1], x, y, true) || !G.Avatar.place(x, y)) continue;
      still(4); faceTo(cx, cz); still(2); const b = I.best();
      if (b && b.id === 'atividade' && b.t.o.act === 'pegar' && b.t.o.op === op.id && b.t.o.ok !== false) return b;
      seen.push(b ? b.label + (b.t && b.t.o && b.t.o.ok === false ? ' (' + b.t.o.why + ')' : '') : 'nada');
    }
    const fr = opCrates().filter(c => !c.by).length;
    pileWhy = `${opCrates().length} caixas (${fr} sem dono): ${seen.slice(0, 3).join(' · ')}`;
    fresh(Math.min(10, opCrates().length + 2), true);
  }
  return null;
}
// the key on the crate the prompt shows, as a player presses it — again if a porter took it in that same step (the world says
// so at once: «Outro carregador pegou esta caixa.»), up to three times —, until the crate is the hands' at the next step
function pressHold() {
  for (let k = 0; k < 3; k++) {
    const b = atPile(); if (!b) return null; const X = b.t.o.cid; said.length = 0; I.run(b); frame();
    if ((crate(X) || {}).by === v.id) return { b, X, o: b.t.o, n: k + 1 };
    busyOut(60);
  }
  return null;
}
const crate = cid => (dock.crates || []).find(c => c.id === cid) || null;
// (put back after asking: the claims of the quay as they were)
const keepBy = () => (dock.crates || []).map(c => [c, c.by, c.byT]);
const putBack = l => { for (const [c, by, t] of l) { c.by = by; c.byT = t; } };
// the porter's door: would this porter take this crate now — Porto.claim, asked with this crate first on the quay (the one it
// looks at first): it answers for this crate alone —, everything put back after
const porterMay = (p, cid) => god(() => {
  const L0 = dock.crates; const c = (L0 || []).find(q => q.id === cid); if (!c || !p) return false;
  const l = keepBy(); dock.crates = [c, ...L0.filter(q => q !== c)]; const r = P.claim(op, p); dock.crates = L0; putBack(l); return !!r && r.cid === cid;
});
// the body's door: Act.begin with the offer of this crate — the one the prompt shows now, or the one it showed a step ago —
// (let go and put back after); and whether the body is offered it free now
const bodyMay = (cid, o0) => god(() => {
  const o = offerOf(cid) || o0; if (!o) return { may: false, why: 'sem oferta' };
  const l = keepBy(); const r = A.begin(v, o); if (r.ok) A.abort(r.h, 'teste'); putBack(l); return { may: !!r.ok, why: r.why || '' };
});
const offeredFree = cid => { const o = offerOf(cid); return !!o && o.ok !== false; };
// (the first crate of the unloading on the quay: the one Porto.claim looks at first — the one the porter's door answers for)
const first = () => opCrates()[0] || null;
const offerOf = cid => A.offers(v, v.x, v.y, 2.6 / TL + 2).find(q => q.act === 'pegar' && q.cid === cid) || null;
const hold = c => (c ? `#${c.id} de ${c.by ? (c.by === v.id ? 'corpo' : (S.villagers.get(c.by) || { name: c.by }).name) : 'ninguém'}` : 'fora do cais');
const rest = o => god(() => { if (o.task && o.task.type !== 'avatar') G.Vg.endTask(o); clearHands(o); });

fresh(6);
ok('o barco descarrega: as caixas de verdade no cais, desenhadas', !!op && opCrates().length >= 6 && drawnOf().length === opCrates().length, op ? `descarga #${op.id}: ${opCrates().length} caixas no cais, ${drawnOf().length} desenhadas` : 'nenhuma');

// ------------------------------ 1. the rule, one for both ------------------------------
{ const rows = []; const row = (name, body, porter, wb, wp) => rows.push({ name, body, porter, wb, wp });
  const b = atPile(); const X = b ? b.t.o.cid : 0; const o0 = b ? b.t.o : null;
  // (a free crate)
  row('livre', b ? bodyMay(X, o0).may && offeredFree(X) : null, porterMay(p2, X), true, true);
  // (a porter acting on it: sent to the quay, he goes for it — the first he may)
  god(() => { S.time = 0.15; const L0 = dock.crates; const c = crate(X); if (c) dock.crates = [c, ...L0.filter(q => q !== c)]; P.work(p1, dock, G.Vg.H); dock.crates = L0; });
  const on = !!p1.task && p1.task.type === 'descarga' && p1.task.cid === X;
  const a0 = bodyMay(X, o0); row('com um carregador indo a ela', a0.may || offeredFree(X), porterMay(p2, X), false, false); row('a dele, para ele mesmo', null, porterMay(p1, X), null, true);
  const why = a0.why;
  // (the porter called away: his claim is left there, and nobody acts on it)
  rest(p1); const left = (crate(X) || {}).by === p1.id;
  row('largada por um carregador', bodyMay(X, o0).may && offeredFree(X), porterMay(p2, X), true, true);
  god(() => { const c = crate(X); if (c) c.by = 0; });
  // (the body's E: the key, and one step of the world)
  const pr = pressHold(); const Xb = pr ? pr.X : 0;
  row('com o E do corpo apertado nela', pr ? bodyMay(Xb, pr.o).may && offeredFree(Xb) : null, porterMay(p2, Xb), true, false);
  G.Avatar.cancelAct(); frame(); frame(); const cutBy = (crate(Xb) || {}).by === v.id;
  // (held by someone no longer lived: the body's begin on a crate free now — since the first, steps of the world went by, and
  // a porter of the town may have gone back to work and taken it, the one called away among them: T-154 —, then the god lets
  // the body go)
  const Xf = (opCrates().find(c => offeredFree(c.id)) || { id: X }).id;
  const hr = god(() => A.begin(v, offerOf(Xf) || o0)); const yaw = G.Avatar.state().yaw;
  G.Possess.release('deus'); G.Avatar.detach();
  row('de quem não é mais o corpo', null, porterMay(p2, Xf), null, true);
  god(() => { if (hr.ok) A.abort(hr.h, 'teste'); }); const gone = (crate(Xf) || {}).by === v.id;
  G.Possess.take(v); G.Avatar.attach(v, yaw); for (let k = 0; k < 6; k++) frame();
  const bad = rows.filter(r => r.body !== r.wb || r.porter !== r.wp);
  const yn = x => (x === null ? '?' : x ? 'pode' : 'não');
  ok('1. a regra é uma só: o que o corpo e o que o carregador podem com a mesma caixa', !!b && on && left && !!pr && hr.ok && !bad.length && !cutBy && !gone,
    `${rows.map(r => `${r.name}: ${r.wb !== null ? 'corpo ' + yn(r.body) + ', ' : ''}carregador ${yn(r.porter)}`).join(' · ')}${bad.length ? '; ERRADO: ' + bad.map(r => r.name).join(', ') : ''}${!b || !pr ? '; ao pé da pilha: ' + pileWhy : ''}${!on ? '; o carregador não foi a ela' : ''}${!left ? '; a marca largada não ficou' : ''}${cutBy ? '; o gesto cortado não soltou a caixa' : ''}${!hr.ok ? '; begin: ' + hr.why : ''}`);
  ok('1. a recusa ao corpo é a mesma do carregador: «Outro carregador pegou esta caixa.»', why === 'Outro carregador pegou esta caixa.', `«${why}»`);
}
// (the body's hold with no gesture under way: the 60 s of the world, then the porters may)
{ fresh(6); rest(p1); rest(p2);
  const o = A.offers(v, v.x, v.y, 2.6 / TL + 2).find(q => q.act === 'pegar' && q.op === op.id && q.ok !== false); const X = o ? o.cid : 0;
  const h = o ? god(() => A.begin(v, o)) : { ok: false, why: 'sem oferta' }; const t0 = S.clock;
  while (S.clock - t0 < 58) G.debug.step(0.5);
  const at58 = crate(X); const s58 = hold(at58); const kept = !!at58 && at58.by === v.id && !porterMay(p2, X);
  while (S.clock - t0 < 61.5) G.debug.step(0.5);
  const at61 = crate(X); const s61 = at61 ? hold(at61) : 'já levada por um carregador'; const freed = !at61 || (at61.by !== v.id && (!!at61.by || porterMay(p2, X)));
  god(() => { if (h.ok) A.abort(h.h, 'teste'); });
  for (let k = 0; k < 6; k++) frame();
  ok('1. a caixa do corpo sem gesto em curso: dele 60 s do mundo (a regra), e depois dos carregadores', h.ok && kept && freed, `${h.ok ? '' : 'begin: ' + h.why + '; '}aos 58 s ${s58}; aos 61 s ${s61}`);
}

// ------------------------------ 2. the body first ------------------------------
{ fresh(6); rest(p1); rest(p2); bring(p2, near[2]);
  const t0 = S.clock; const pr = pressHold(); const X = pr ? pr.X : 0;
  god(() => { S.time = 0.15; P.work(p2, dock, G.Vg.H); }); const p2c = p2.task && p2.task.cid;
  let touched = 0, p2had = 0; for (let k = 0; k < 600 && G.Avatar.busy(); k++) { frame(); if (p2.task && p2.task.cid === X) touched++; if (p2.carry && p2.carry.op === op.id && p2.carry.cid) p2had = p2.carry.cid; }
  for (let k = 0; k < 3; k++) frame();
  const got = v.carry && v.carry.op === op.id ? v.carry.cid : 0;
  for (let k = 0; k < 900 && !p2had; k++) { frame(); if (p2.carry && p2.carry.op === op.id && p2.carry.cid) p2had = p2.carry.cid; if (p2.task && p2.task.cid === X) touched++; }
  ok('2. o corpo primeiro: o E guarda a caixa desde o passo seguinte; o carregador mandado ao cais vai a outra; cada um levanta a sua', !!pr && !!p2c && p2c !== X && !touched && got === X && !!p2had && p2had !== X,
    pr ? `«${pr.b.label}» (caixa #${X}${pr.n > 1 ? `, ${pr.n} vezes E` : ''}): um passo depois do corpo; ${p2.name} foi à #${p2c || '-'}${touched ? `, e à do corpo ${touched} vezes` : ''}; nas mãos do corpo a #${got || '-'} (${(S.clock - t0).toFixed(2)} s); nas dele a #${p2had || '-'}` : `o E não guardou caixa nenhuma: ${pileWhy}`);
  clearHands(v); rest(p2);
}

// ------------------------------ 3. the porter first ------------------------------
// (the porter lives: an errand from outside — a cave, a whale — may call him away before he lifts the crate, by the rule of
// Vg.give, and the act he began lets it go to whoever comes: in the metropole of the new worlds, on the line's 54d05e2, a cave
// took Djoser 1.7 s after the key, and Meritamon lifted the crate. Told, and the case made again — with the crate the prompt
// shows then —, up to three times, as pressHold does — T-157)
{ let R = null; const called = [];
  for (let tries = 0; tries < 3; tries++) {
    fresh(6); rest(p1); bring(p1, near[1]);
    const b = atPile(); const X = b ? b.t.o.cid : 0;
    // (the porter goes for the crate the prompt shows, in the step before the key: the prompt the player saw is a step old)
    god(() => { S.time = 0.15; const L0 = dock.crates; const c = crate(X); if (c) dock.crates = [c, ...L0.filter(q => q !== c)]; P.work(p1, dock, G.Vg.H); dock.crates = L0; }); const his = !!p1.task && p1.task.cid === X;
    said.length = 0; const t0 = S.clock; const led0 = D.ledger().length; if (b) I.run(b);
    let k = 0; for (; k < 60 && G.Avatar.busy(); k++) frame();
    const tStop = S.clock - t0; const w = said.find(s => /carregador/.test(s[0]));
    const c1 = crate(X); const bodyLift = D.ledger().slice(led0).some(e => e[9] === v.id && e[8] === 'pegar');
    let p1had = 0, away = ''; for (let q = 0; q < 900 && !p1had && !away; q++) { frame(); if (p1.carry && p1.carry.op === op.id) p1had = p1.carry.cid; else if (his && (!p1.task || p1.task.type !== 'descarga')) away = p1.task ? p1.task.type + (p1.task.kind ? ' (' + p1.task.kind + ')' : '') : 'nada'; }
    R = { b, X, his, tStop, w, c1, bodyLift, p1had, t0 };
    if (!away) break;
    called.push(`${p1.name} chamado a ${away} antes de levantar a #${X}`); clearHands(p1); rest(p1);
  }
  const { b, X, his, tStop, w, c1, bodyLift, p1had, t0 } = R; const g = A.ANIM.levantar;
  ok('3. o carregador primeiro: o E na caixa dele é recusado no aperto, com as palavras do mundo, e o gesto para antes do contato; ele a levanta', !!b && his && !!w && tStop < g.contact && !G.Avatar.busy() && !!c1 && c1.by === p1.id && !bodyLift && !(v.carry && v.carry.n > 0) && p1had === X,
    `${called.length ? '(' + called.join('; ') + ') ' : ''}${b ? '' : 'ao pé da pilha: ' + pileWhy + '; '}«${b ? b.label : '-'}» (#${X}), já de ${p1.name}: ${w ? `«${w[0]}» ${(w[1] - t0).toFixed(3)} s depois do aperto` : 'nenhuma palavra'}; o gesto parou em ${tStop.toFixed(3)} s do mundo (o contato: ${g.contact} s); a caixa ${hold(c1)}; o corpo ${bodyLift ? 'levantou' : 'não levantou'}; ${p1.name} levantou a #${p1had || '-'}`);
  clearHands(p1); rest(p1);
}

// ------------------------------ 4. the gesture cut short ------------------------------
{ fresh(6); rest(p2);
  const led0 = D.ledger().length; const pr = pressHold(); const X = pr ? pr.X : 0;
  // (the world pushes the body a hand's breadth: what the hands meant there is not done)
  god(() => { v.x += 0.03; }); frame(); frame();
  const c2 = crate(X); const s2 = hold(c2); const freed = !!c2 && c2.by !== v.id; const pm = porterMay(p2, X); const o2 = offerOf(X);
  const bodyLift = D.ledger().slice(led0).some(e => e[9] === v.id && e[8] === 'pegar');
  ok('4. o gesto cortado (o mundo empurra o corpo): a caixa solta no passo seguinte — livre aos carregadores, oferecida de novo ao corpo —; nada levantado', !!pr && !G.Avatar.busy() && freed && pm && !!o2 && o2.ok !== false && !bodyLift && !(v.carry && v.carry.n > 0),
    pr ? `#${X}: no aperto do corpo${pr.n > 1 ? ` (${pr.n} vezes E)` : ''}; cortado, ${s2}${pm ? ', livre a um carregador' : ''}; ${o2 ? `a oferta ao corpo ${o2.ok !== false ? 'livre' : 'recusada'}` : 'sem oferta'}; ${bodyLift ? 'levantou!' : 'nada levantado'}` : `o E não guardou caixa nenhuma: ${pileWhy}`);
}

// ------------------------------ 5. saved and loaded in the middle ------------------------------
{ fresh(6);
  const pr = pressHold(); const X = pr ? pr.X : 0;
  M.salvarCarregar(); refresh(); op = op && A.get(op.id); v = G.Possess.body();
  const c0 = v ? crate(X) : null; const s0 = hold(c0); const let0 = !!c0 && !c0.by; const pm = v ? porterMay(S.villagers.get(p2.id), X) : false;
  if (v) { G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame(); }
  const idle = !G.Avatar.busy();
  let got = 0, n = 0; const all = [];
  for (; n < 3 && v && !got; n++) { const b2 = atPile(); if (!b2) break; said.length = 0; I.run(b2); busyOut(); all.push(...said.map(q => q[0])); got = v.carry && v.carry.op === op.id ? v.carry.cid : 0; }
  ok('5. salvo e carregado no meio do gesto: o gesto não vai no save, nem a marca (o mundo solta as caixas do cais ao carregar) — a caixa livre a quem vier —; E de novo, e uma caixa vem às mãos', !!pr && !!v && let0 && pm && idle && !!got,
    pr ? `#${X}: no aperto do corpo; logo depois de carregar ${s0}${pm ? ', livre a um carregador' : ''}, ${idle ? 'sem gesto em curso' : 'um gesto em curso!'}; E de novo${n > 1 ? ` (${n} vezes)` : ''}: nas mãos a #${got || '-'}${all.length ? ' «' + all.join(' / ') + '»' : ''}` : `o E não guardou caixa nenhuma: ${pileWhy}`);
  if (v) clearHands(v);
}

// ------------------------------ 6. the god takes the crate away in the middle ------------------------------
{ fresh(6);
  const pr = pressHold(); const X = pr ? pr.X : 0;
  god(() => { const c = crate(X); if (c) D.move('q:' + dock.id, 'f:' + fac.id, c.k, c.n, { op: op.id, cid: c.id, code: 'teste', part: true }); });
  busyOut(); const w = said.map(q => q[0]).join(' / '); const empty = !(v.carry && v.carry.n > 0);
  const pr2 = pressHold(); const Y = pr2 ? pr2.X : 0; if (pr2) busyOut();
  const got = v.carry && v.carry.op === op.id ? v.carry.cid : 0;
  ok('6. o deus tira a caixa no meio: as palavras do mundo no contato, as mãos vazias; o E seguinte levanta a seguinte', !!pr && !crate(X) && empty && /não está mais no cais/.test(w) && !!pr2 && got === Y && Y !== X,
    pr ? `#${X} tirada: «${w || 'nenhuma palavra'}», as mãos ${empty ? 'vazias' : 'com algo!'}; depois «${pr2 ? pr2.b.label : '-'}» (#${Y}): nas mãos a #${got || '-'}` : `o E não guardou caixa nenhuma: ${pileWhy}`);
  clearHands(v);
}

// ------------------------------ 7. a busy quay ------------------------------
{ fresh(8); const crew = [...S.villagers.values()].filter(o => o.id !== v.id && o.set === set.id && o.role === 'estivador' && A.able(o) && W.reaches(o, sp0[0], sp0[1])).sort((a, b) => a.id - b.id).slice(0, 5);
  for (const o of crew) rest(o);
  crew.forEach((o, i) => bring(o, near[i % near.length]));
  const hands = new Map(); const atContact = [], miss = []; let presses = 0, lifts = 0, keyNo = 0; const g = A.ANIM.levantar;
  const watch = () => { for (const o of [v, ...crew]) if (o.carry && o.carry.op === op.id && o.carry.cid) { const s = hands.get(o.carry.cid) || new Set(); s.add(o.id); hands.set(o.carry.cid, s); } };
  // (the porters with nothing to do go for a crate — Porto.work, the world's own errand — at every step: the first they may)
  const send = () => god(() => { S.time = 0.15; for (const o of crew) if (!(o.task && o.task.type === 'descarga')) { clearHands(o); P.work(o, dock, G.Vg.H); } });
  for (let round = 0; round < 6; round++) {
    fresh(4);
    // (the prompt seen, then the porters sent at the same step as the key: some go for the crate the prompt shows)
    const b = atPile(); if (!b) { miss.push(pileWhy); continue; } send();
    presses++; said.length = 0; const t0 = S.clock; I.run(b);
    for (let k = 0; k < 600 && G.Avatar.busy(); k++) { frame(); watch(); send(); }
    for (const s of said) if (/carregador/.test(s[0])) { if (s[1] - t0 < g.contact) keyNo++; else atContact.push(s[0]); }
    if (v.carry && v.carry.op === op.id) { lifts++; watch(); clearHands(v); }
    for (let k = 0; k < 30; k++) { frame(); watch(); }
  }
  const two = [...hands.entries()].filter(([, s]) => s.size > 1);
  ok('7. o cais movimentado: a recusa só no aperto, nunca no contato; nenhuma caixa em duas mãos', presses >= 5 && lifts >= 2 && !atContact.length && !two.length,
    `${crew.length} carregadores do mundo; ${presses} vezes E: ${lifts} caixas nas mãos do corpo, ${keyNo} recusadas no aperto, ${atContact.length} no contato${atContact.length ? ' «' + atContact[0] + '»' : ''}; ${hands.size} caixas levantadas${two.length ? `, ${two.length} em duas mãos` : ', cada uma por uma mão só'}${miss.length ? '; sem aviso ao pé da pilha: ' + miss[0] : ''}`);
  for (const o of crew) rest(o);
}

// ------------------------------ 8. the body dies in the middle ------------------------------
{ fresh(6); bring(p2, near[2]);
  const pr = pressHold(); const X = pr ? pr.X : 0;
  const vid = v.id; G.Village.kill(v, 'old'); frame(); G.Avatar.detach(); for (let k = 0; k < 4; k++) G.debug.step(0.1);
  const c1 = crate(X); const s1 = c1 ? hold(c1) : ''; const pm = !c1 || c1.by !== vid || porterMay(S.villagers.get(p2.id), X);
  ok('8. o corpo morre no meio do gesto: a caixa livre aos carregadores', !!pr && !S.avatar && pm, pr ? `#${X}: do corpo no aperto; ${S.avatar ? 'ainda encarnado!' : 'o corpo se foi'}; agora ${c1 ? s1 + (pm ? ', livre a um carregador' : ', presa ao morto!') : 'levada'}` : `o E não guardou caixa nenhuma: ${pileWhy}`);
}

// (the verifier: what weighs, S0 to S2 — and no module error)
{ const l = vbad(); ok('verificador e módulos', !l.length && JSON.stringify(G.modErr) === '{}', `${vtxt(l)} · ${JSON.stringify(G.modErr)}`); }
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
