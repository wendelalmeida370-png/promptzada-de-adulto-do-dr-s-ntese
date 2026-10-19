// corpo-mundo: the body of the Modo Encarnado against the world's own rules, in Node, without a browser (the simulation of
// qa/nodemundo.js, with the body's files — space, possess, interact, avatar and the poses of people3d — loaded after it; no 3D):
//   node qa/visual/corpo-mundo.js [mundo]       (default: the ready world «cidade»)
// The proofs (each one of the adendo's "a presença do jogador não produz resultado de graça"):
//   1. the body does as much work as anyone of the world in the same world time — felling (the woodcutter's dt × workMul),
//      picking berries (2.2 s / workMul for a load), breaking stone (3.8 s / workMul for a load), eating at the store (1.6 s)
//   2. with the world stopped (the menu open: no step of the world), an act of the hands does not finish and the world does not
//      change — the act waits for the world's time
//   3. what the hands do to the world happens inside the world's step (G.inSim): the world's chance (G.R) is never drawn in
//      the frame — the hand-fishing's luck, the berries' and the stone's counts
//   4. a load put down at the store is the world's delivery (the stock, the person's tally) and nothing of it happens before the
//      hands put it down: with the world stopped the hands wait at the door with the load; the wood of a felled tree comes to
//      the arms at the docker's contact (G.Act.ANIM.levantar), not before; and what the world's activities offer (G.Act.offers)
//      is done through their own door (Act.perform), in the same gesture's time, in the world's step (the ledger written there)
//   5. the bad cases, between the moment the hands ask and the moment the world does it: the body dies, the god takes the rock
//      away, the game is saved and loaded, the god gives the body back, the world moves the body — nothing asked is done, nothing
//      hangs (the verifier: qa.js and qa/visual/corpo-qa.js)
// The frame here is the game's own (main.js frame): the world's step of rdt × Space.TIME, then the body's frame of rdt.
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js', 'qa/atividades-inv.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-mundo ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'cidade');
let S = G.S; const W = G.W, L = G.Space.TILE; // (S: the world now — a load makes a new one)
// (the world's chance drawn outside the world's step: counted)
let outside = 0; { const R0 = G.R; G.R = function () { if (!G.inSim) outside++; return R0.apply(this, arguments); }; }
const RDT = 1 / 30;
const frame = (world) => { if (world !== false) G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
// a grown person who can be lived, put next to a thing (a walkable point r tiles from it, facing it), lived
function bodyAt(tx, ty, r) {
  const cand = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id);
  const v = cand[0]; if (!v) return null;
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r; if (!W.walkableXY(x, y)) continue;
    if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
    G.Vg.endTask(v); v.x = x; v.y = y; v.path = null; const r0 = G.Possess.take(v); if (!r0.ok) return null;
    G.Avatar.attach(v, Math.atan2(ty - y, tx - x)); G.Avatar.state().yaw = Math.atan2(ty - y, tx - x); G.Avatar.input.camYaw = G.Avatar.state().yaw; return v; }
  return null;
}
// (holding E: the best act, again and again, as the HUD does)
let lastBest = null; // (what was in front of the body the last time E was pressed: for the words of a failure)
function holdE(id) { if (G.Avatar.busy()) return null; const b = G.Interact.best(); lastBest = b; if (!b || b.id !== id || !b.ok) return b; G.Interact.run(b); return b; }
const front = () => (lastBest ? lastBest.label + (lastBest.ok ? '' : ' — ' + lastBest.why) : 'nada');
// (frames until the act in course has asked the world and the world has not yet answered: the moment between the two)
function untilAsked(id) { for (let k = 0; k < 3000; k++) { holdE(id); frame(); const a = G.Avatar.actNow(); if (a && a.asked && !a.asked.res) return a; } return null; }
// (the verifier: nothing wrong of weight — S0 to S2)
const vbad = () => QA.check().filter(q => q.sev <= 2);
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const freshTree = () => [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && t.size >= 0.8 && !t.claim && !t.chop).sort((a, b) => a.id - b.id).find(t => bodyAt(t.x, t.y, 0.42));

// ------------------------------ 1. the same work in the same world time ------------------------------
// felling: the woodcutter adds dt × workMul to the tree's count each second of the world
{ const tree = [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && t.size >= 0.8 && !t.claim).sort((a, b) => a.id - b.id).find(t => bodyAt(t.x, t.y, 0.42));
  if (!tree) ok('derrubar: o corpo rende o mesmo que o lenhador', false, 'nenhuma árvore adulta com chão andável ao lado');
  else {
    const v = G.Possess.body(); const wm = G.Vg.workMul(v); const c0 = tree.chop, t0 = S.clock; let felled = false, k = 0;
    for (; k < 3000 && !felled; k++) { holdE('arvore'); frame(); if (tree.stage !== 'grow') felled = true; }
    const dw = S.clock - t0, done = (felled ? 3 * Math.max(0.5, tree.size) : tree.chop) - c0; const rate = done / dw / wm;
    ok('derrubar: o corpo rende o mesmo que o lenhador por segundo do mundo (dt × trabalho)', rate > 0.8 && rate < 1.2, `${done.toFixed(2)} de trabalho em ${dw.toFixed(2)} s do mundo (${k} quadros): ${rate.toFixed(2)}× o lenhador${felled ? '; a árvore caiu' : ''}`);
    // the wood of the fallen tree into the arms: the docker's gesture — the load passes to the hands at its contact, not before
    for (let q = 0; q < 3000 && tree.stage !== 'log'; q++) frame();
    v.carry = null; const g = G.Act.ANIM.levantar; let tStart = null, tGot = null, early = false; const w0 = tree.wood;
    for (let q = 0; q < 1200 && tGot === null; q++) { if (tStart === null) { const b = holdE('arvore'); if (b && b.ok && G.Avatar.busy()) tStart = S.clock; } frame(); if (tStart !== null && v.carry) tGot = S.clock; }
    if (tGot !== null && tGot - tStart < g.contact - 1e-6) early = true;
    const want = Math.min(G.Vg.cap(v), w0);
    ok('levantar a lenha do tronco: no contato do gesto do estivador (G.Act.ANIM.levantar), a carga que cabe nas mãos', tree.stage === 'log' || tree.stage === 'stump' ? tGot !== null && !early && v.carry && v.carry.k === 'wood' && v.carry.n === want : false, `o tronco: ${tree.stage}; a lenha nas mãos ${tGot !== null ? (tGot - tStart).toFixed(2) + ' s do mundo depois de pedir (o contato: ' + g.contact + ' s)' : 'nunca'}; ${v.carry ? v.carry.n + ' de ' + v.carry.k : 'nada'} (cabe ${want})`);
    v.carry = null;
  } }
// picking berries: a load in 2.2 s / workMul of the world
{ const bush = [...S.bushes.values()].filter(b => b.berries >= 3 && !b.claim && !b.burnt).sort((a, b) => a.id - b.id).find(b => bodyAt(b.x, b.y, 0.4));
  if (!bush) ok('colher: o corpo rende o mesmo que quem colhe', false, 'nenhum arbusto com frutas ao alcance');
  else {
    const v = G.Possess.body(); v.hunger = 10; v.carry = null; const wm = G.Vg.workMul(v); const n0 = bush.berries, t0 = S.clock; let k = 0, tEnd = null;
    for (; k < 2000 && tEnd === null; k++) { holdE('arbusto'); frame(); if (bush.berries < n0) tEnd = S.clock; }
    const dw = (tEnd === null ? S.clock : tEnd) - t0; const want = 2.2 / wm;
    ok('colher: uma carga de frutas leva o tempo do mundo de quem colhe (2,2 s ÷ trabalho)', tEnd !== null && dw > want * 0.8, `${n0 - bush.berries} frutas em ${dw.toFixed(2)} s do mundo; quem colhe leva ${want.toFixed(2)} s: ${(want / Math.max(1e-6, dw)).toFixed(2)}× mais rápido o corpo`);
  } }
// breaking stone: a load (cap) in 3.8 s / workMul of the world
{ const rock = [...S.rocks.values()].filter(r => r.stone >= 4 && !r.claim).sort((a, b) => a.id - b.id).find(r => bodyAt(r.x, r.y, 0.62));
  if (!rock) ok('quebrar pedra: o corpo rende o mesmo que o pedreiro', false, 'nenhuma pedra com chão andável ao lado');
  else {
    const v = G.Possess.body(); v.carry = null; const wm = G.Vg.workMul(v); const cap = G.Vg.cap(v); const s0 = rock.stone, t0 = S.clock; let k = 0;
    for (; k < 4000; k++) { const b = holdE('pedra'); frame(); if (v.carry && v.carry.n >= cap) break; if (b && b.id !== 'pedra') break; }
    const dw = S.clock - t0, got = s0 - (S.rocks.has(rock.id) ? rock.stone : 0); const per = dw / Math.max(1, got), want = 3.8 / wm / cap;
    ok('quebrar pedra: cada pedra leva o tempo do mundo do pedreiro (3,8 s ÷ trabalho por carga)', got > 0 && per > want * 0.8, `${got} pedras em ${dw.toFixed(2)} s do mundo: ${per.toFixed(2)} s cada; o pedreiro: ${want.toFixed(2)} s cada (${(want / Math.max(1e-6, per)).toFixed(2)}× mais rápido o corpo)`);
  } }
// eating at the store: 1.6 s of the world, as anyone eating there
{ const st = [...S.buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].dropoff).sort((a, b) => a.id - b.id).find(b => { const d = G.Vg.door(b); return bodyAt(d[0] + 0.0001, d[1] + 0.0001, 0.3); });
  const v = G.Possess.body(); const stk = v && G.Fac.stockV(v);
  if (!st || !v || !stk || stk.food < 4 || G.Village.facOfSet(st.set) !== G.Fac.idOfV(v)) ok('comer no armazém: o tempo de quem come lá', false, 'nenhum armazém do povo com comida ao lado');
  else {
    // (facing the store's door)
    const d = G.Vg.door(st); const b = G.Avatar.state(); b.yaw = Math.atan2(d[1] * L - b.Z, d[0] * L - b.X); v.carry = null; v.hunger = 60; const h0 = v.hunger, t0 = S.clock; let k = 0, tEnd = null;
    for (; k < 1500 && tEnd === null; k++) { holdE('porta'); frame(); if (v.hunger < h0 - 1) tEnd = S.clock; }
    const dw = (tEnd === null ? S.clock : tEnd) - t0;
    ok('comer no armazém: leva o tempo do mundo de quem come lá (1,6 s)', tEnd !== null && dw > 1.6 * 0.8, `comeu em ${dw.toFixed(2)} s do mundo (quem come lá: 1,60 s)`);
  } }

// ------------------------------ 4. the load into the store ------------------------------
{ const st = [...S.buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].dropoff).sort((a, b) => a.id - b.id).find(b => { const d = G.Vg.door(b); return bodyAt(d[0] + 0.0001, d[1] + 0.0001, 0.3); });
  const v = G.Possess.body(); const fid = v && G.Fac.idOfV(v); const f = fid && G.Fac.get(fid);
  if (!st || !v || !f || G.Village.facOfSet(st.set) !== fid) ok('guardar no armazém: a entrega do mundo', false, 'nenhum armazém do povo ao lado');
  else {
    const d = G.Vg.door(st); const b = G.Avatar.state(); b.yaw = Math.atan2(d[1] * L - b.Z, d[0] * L - b.X); v.hunger = 5;
    v.carry = { k: 'wood', n: 3 }; const w0 = f.stock.wood || 0, t0 = v.st.wood || 0; const want = Math.max(0, Math.min(3 * (S.blessed ? 2 : 1), G.Village.cap(fid) - w0));
    const c = holdE('porta');
    // (90 frames — three seconds of the body, longer than the act — without the world: the load still in the hands, the stock as it was)
    for (let k = 0; k < 90; k++) frame(false);
    const held = G.People3D.look(v).held; const still = !!(v.carry && v.carry.n === 3 && held && held.grip !== 'chao') && (f.stock.wood || 0) === w0 && G.Avatar.busy();
    ok('guardar no armazém: com o mundo parado, as mãos esperam na porta com a carga (nada entra no estoque antes)', !!(c && c.ok) && still, `${c ? c.label : '-'}: a carga ${v.carry ? v.carry.n + ' de lenha nas mãos' : 'sumiu'}, o estoque ${(f.stock.wood || 0) === w0 ? 'igual' : 'mudou'}, o ato ${G.Avatar.busy() ? 'esperando o mundo' : 'acabou'}`);
    for (let k = 0; k < 300 && G.Avatar.busy(); k++) frame();
    const got = (f.stock.wood || 0) - w0;
    ok('guardar no armazém: a entrega conta como a de qualquer morador (o estoque do povo, a conta da pessoa)', !v.carry && got === want && (v.st.wood || 0) === t0 + 3, `estoque +${got} (a entrega de um morador: +${want}), a conta da pessoa +${(v.st.wood || 0) - t0}, ${v.carry ? 'a carga ainda nas mãos' : 'as mãos vazias'}`);
  } }

// what the world's activities offer: a definition made here for the proof (a sack left on the ground, picked up — C1's door)
G.Act.def('prova-pegar', {
  offers(v, x, y, r) { return (G.S.loose || []).filter(o => o.prova && G.dist(o.x, o.y, x, y) <= r).map(o => ({ id: 'pegar:' + o.id, act: 'pegar', label: 'Pegar o saco do chão', at: [o.x, o.y], ref: 'g:' + o.id, anim: 'levantar', hands: 1, ok: !(v.carry && v.carry.n > 0), why: 'Suas mãos já estão cheias.' })); },
  acts: { pegar: {
    can: (v, o) => (G.Depot.exists(o.ref) ? { ok: true } : { ok: false, why: 'Não está mais aqui.' }),
    run: (v, o) => { const it = G.Depot.items(o.ref)[0]; const r = it ? G.Depot.move(o.ref, 'v:' + v.id, it.k, it.n, { code: 'pegar', by: v.id }) : { ok: false, why: 'Não está mais aqui.' }; return r.ok ? { ok: true, msg: 'Você pega o saco.', n: r.n } : { ok: false, why: r.why }; },
  } },
});
{ const p = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
  const v = p && bodyAt(p.x, p.y, 0.3); const b = G.Avatar.state();
  if (!v) ok('o que as atividades oferecem: pela porta delas', false, 'sem corpo');
  else {
    v.carry = null; const x = v.x + Math.cos(b.yaw) * 0.3, y = v.y + Math.sin(b.yaw) * 0.3; const out0 = G.Depot.outside || 0, led0 = S.ledgerN || 0;
    // (the sack put on the ground by the world, in its step)
    G.Possess.apply(() => { (G.S.loose || (G.S.loose = [])).push({ id: G.S.nextId++, k: 'sal', n: 2, x, y, op: 0, cid: 0, fac: G.Fac.idOfV(v), day: G.S.day, prova: 1 }); return { ok: true }; }); frame();
    const c = holdE('atividade'); const t0 = S.clock;
    for (let k = 0; k < 90; k++) frame(false);
    const still = !v.carry && (S.loose || []).some(o => o.prova);
    let tGot = null; for (let k = 0; k < 600 && tGot === null; k++) { frame(); if (v.carry) tGot = S.clock; }
    const e = (S.ledger || []).slice(-3).find(q => q[8] === 'pegar');
    const g = G.Act.ANIM.levantar; const bad = vbad();
    ok('o que as atividades oferecem é feito pela porta delas (Act.perform), no tempo do gesto, no passo do mundo', !!(c && c.ok) && still && tGot !== null && tGot - t0 >= g.contact - 1e-6 && !!e && (G.Depot.outside || 0) === out0 && !bad.length,
      `${c ? c.label : 'nada oferecido'}; com o mundo parado ${still ? 'o saco no chão' : 'o saco foi'}; nas mãos ${tGot !== null ? (tGot - t0).toFixed(2) + ' s do mundo depois (o contato: ' + g.contact + ' s)' : 'nunca'}; no livro-razão: ${e ? e[3] + ' → ' + e[4] + ', ' + e[6] + ' de ' + e[5] : 'nada'} (${(S.ledgerN || 0) - led0} lançamento); fora do passo: ${(G.Depot.outside || 0) - out0}; ${vtxt(bad)}`);
    v.carry = null;
  } }

// ------------------------------ 2. the world stopped: the act waits ------------------------------
{ const tree = [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && t.size >= 0.8 && !t.claim).sort((a, b) => b.id - a.id).find(t => bodyAt(t.x, t.y, 0.42));
  if (!tree) ok('com o mundo parado o ato não termina', false, 'nenhuma árvore');
  else {
    const c0 = tree.chop, k0 = S.clock; const b = holdE('arvore'); let n = 0; for (; n < 180; n++) frame(false); // (six seconds of frames, the menu open: no step of the world)
    ok('com o mundo parado (o menu aberto), o golpe não termina e o mundo não muda', b && b.ok && tree.chop === c0 && S.clock === k0, `o golpe pedido: ${b ? b.label : '-'}; 6 s de quadros sem o mundo: a árvore ${tree.chop === c0 ? 'igual' : 'cortada (' + (tree.chop - c0).toFixed(2) + ')'}, o relógio ${S.clock === k0 ? 'parado' : 'andou'}`);
    for (let k = 0; k < 120; k++) frame(); // (the world going again: the stroke ends)
  } }

// ------------------------------ 3. the hands change the world inside the world's step ------------------------------
{ const S2 = S; let ford = null;
  for (let i = 0; i < S2.type.length && !ford; i++) { if (S2.type[i] !== G.T.RIVER || S2.road[i] || !W.walkable(i)) continue; const x = i % G.N + 0.5, y = Math.floor(i / G.N) + 0.5; if (G.Space.surface(x * L, y * L).kind === 'shallow') ford = [x, y]; }
  if (!ford) ok('o acaso do mundo nunca no quadro (pescar com as mãos)', false, 'nenhum vau neste mundo');
  else {
    const v = bodyAt(ford[0] + 0.3, ford[1], 0.0001); outside = 0; let tries = 0, k = 0;
    if (v) { v.carry = null; for (; k < 3000 && tries < 6; k++) { if (!G.Avatar.busy()) { const b = G.Interact.best(); if (b && b.id === 'peixe' && b.ok) { G.Interact.run(b); tries++; } } frame(); } }
    ok('o acaso do mundo nunca é tirado no quadro: a sorte da pesca com as mãos sai dentro do passo do mundo', !!v && tries >= 3 && outside === 0, v ? `${tries} tentativas de pesca; ${outside} sorteios do acaso do mundo fora do passo` : 'sem corpo no vau');
  } }

// ------------------------------ 5. between the asking and the doing ------------------------------
// the body dies: what it asked is not done (and nothing waits for it)
{ const tree = freshTree(); const v = G.Possess.body();
  if (!tree || !v) ok('o corpo morre entre o pedido e o passo: nada feito', false, 'nenhuma árvore');
  else {
    v.carry = null; const a = untilAsked('arvore'); const c0 = tree.chop; G.Village.kill(v, 'old'); frame(); G.Avatar.detach();
    const bad = vbad();
    ok('o corpo morre entre o golpe e o passo do mundo: o golpe não é dado, nada fica esperando', !!a && tree.chop === c0 && !S.avatar && G.Possess.pending() === 0 && !bad.length, `${a ? 'golpe pedido' : 'sem golpe (diante do corpo: ' + front() + ')'}; a árvore ${tree.chop === c0 ? 'igual' : 'cortada'}; ${S.avatar ? 'ainda encarnado' : 'o deus de volta'}; ${G.Possess.pending()} pedidos; ${vtxt(bad)}`);
  } }
// the god takes the rock away: the world says no, the hands come back empty
{ const rock = [...S.rocks.values()].filter(r => r.stone >= 4 && !r.claim).sort((a, b) => a.id - b.id).find(r => bodyAt(r.x, r.y, 0.62)); const v = G.Possess.body();
  if (!rock || !v) ok('o deus tira a pedra entre o pedido e o passo', false, 'nenhuma pedra');
  else {
    v.carry = null; const a = untilAsked('pedra'); G.Nature.removeRock(rock); let k = 0; for (; k < 120 && G.Avatar.busy(); k++) frame();
    const bad = vbad();
    ok('o deus tira a pedra entre o golpe e o passo do mundo: o mundo diz não, nenhuma pedra nas mãos, o ato acaba', !!a && a.res && !a.res.ok && !v.carry && !G.Avatar.busy() && !bad.length, `${a ? 'golpe pedido' : 'sem golpe (diante do corpo: ' + front() + ')'}; resposta: ${a && a.res ? (a.res.ok ? 'feito' : 'não — ' + a.res.why) : '-'}; ${v.carry ? 'pedra nas mãos' : 'mãos vazias'}; ${G.Avatar.busy() ? 'ainda ocupado' : 'livre'} em ${k} quadros; ${vtxt(bad)}`);
  } }
// the game saved and loaded between the two: the world saved is the world loaded — the stroke was never given
{ const tree = freshTree(); const v = G.Possess.body();
  if (!tree || !v) ok('salvar e carregar entre o pedido e o passo', false, 'nenhuma árvore');
  else {
    v.carry = null; const a = untilAsked('arvore'); const c0 = tree.chop, id = tree.id; M.salvarCarregar(); S = G.S;
    const t2 = S.trees.get(id); const v2 = G.Possess.body(); const pend = G.Possess.pending(); if (v2) G.Avatar.attach(v2);
    for (let k = 0; k < 60; k++) frame();
    const bad = vbad();
    ok('salvar e carregar entre o golpe e o passo do mundo: o mundo carregado é o salvo, nada pendurado, o corpo segue', !!a && !!t2 && t2.chop === c0 && pend === 0 && !!v2 && !bad.length && M.limpo(), `${a ? 'golpe pedido' : 'sem golpe (diante do corpo: ' + front() + ')'}; a árvore ${t2 ? (t2.chop === c0 ? 'igual' : 'cortada') : 'sumiu'}; ${pend} pedidos depois de carregar; ${v2 ? 'o corpo de volta' : 'sem corpo'}; ${vtxt(bad)}`);
  } }
// the god gives the body back between the two: the stroke is not given, the person goes back to their life
{ const tree = freshTree(); const v = G.Possess.body();
  if (!tree || !v) ok('devolver o corpo entre o pedido e o passo', false, 'nenhuma árvore');
  else {
    v.carry = null; const a = untilAsked('arvore'); const c0 = tree.chop; G.Possess.release('deus'); G.Avatar.detach(); frame();
    const bad = vbad();
    ok('o deus devolve o corpo entre o golpe e o passo do mundo: o golpe não é dado, a pessoa volta à sua vida', !!a && tree.chop === c0 && (!v.task || v.task.type !== 'avatar') && G.Possess.pending() === 0 && !bad.length, `${a ? 'golpe pedido' : 'sem golpe (diante do corpo: ' + front() + ')'}; a árvore ${tree.chop === c0 ? 'igual' : 'cortada'}; a tarefa: ${v.task ? v.task.type : 'nenhuma'}; ${vtxt(bad)}`);
  } }
// the world moves the body between the two (a building rising where it stood, a push): what the hands meant there is not done
{ const tree = freshTree(); const v = G.Possess.body();
  if (!tree || !v) ok('o mundo move o corpo entre o pedido e o passo', false, 'nenhuma árvore');
  else {
    v.carry = null; const b0 = G.Interact.best(); const a = untilAsked('arvore'); const c0 = tree.chop; const x0 = v.x; v.x += 0.35; frame(); frame();
    const bad = vbad();
    ok('o mundo move o corpo entre o golpe e o passo do mundo: o golpe não é dado lá, o ato acaba', !!a && tree.chop === c0 && a.asked.res && !a.asked.res.ok && !G.Avatar.busy() && !bad.length, `${a ? 'golpe pedido, o mundo: ' + (a.asked.res ? (a.asked.res.ok ? 'feito' : 'não feito') : 'sem resposta') : 'sem golpe (diante do corpo: ' + (b0 ? b0.label + (b0.ok ? '' : ' — ' + b0.why) : 'nada') + ')'}; movido ${((v.x - x0) * L).toFixed(1)} m; a árvore ${tree.chop === c0 ? 'igual' : 'cortada'}; ${G.Avatar.busy() ? 'ainda ocupado' : 'livre'}; ${vtxt(bad)}`);
  } }

// (and the verifier sees an ask left hanging — a body given back by a door that forgets to drop what it asked: made on purpose)
{ const p = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
  const v = p && bodyAt(p.x, p.y, 0.3); let hit = false;
  if (v) { G.Possess.apply(() => ({ ok: true })); const a0 = S.avatar; S.avatar = null; hit = QA.check().some(q => q.sys === 'maos' && q.sev === 1); S.avatar = a0; frame(); }
  ok('o verificador acusa um pedido das mãos pendurado (feito de propósito)', hit, hit ? 'acusado' : v ? 'não viu' : 'sem corpo'); }

if (G.Possess.body()) G.Possess.release('deus');
{ const bad = vbad(); ok('o verificador no fim (S0 a S2)', !bad.length, vtxt(bad)); }
const e = M.erros(); ok('sem erros de módulo nem do console', M.limpo(), JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
