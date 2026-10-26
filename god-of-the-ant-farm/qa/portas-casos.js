// portas-casos: o cenário das portas dos interiores ligadas — a porta das pessoas pela casca da planta (G.Vg.planDoor) e
// os guardados pelos móveis (G.Depot.stores), ligadas pelo jogo ou, enquanto o jogo as tem desligadas, pelo próprio
// cenário —, cada caso provocado de propósito, com um save no meio: toda porta que a
// gente usa é a da planta, no chão aberto e na mesma região do mapa de alcance que a porta de antes; quem sai de dentro sai
// por ela; a porta tapada por um muro cai para o canto aberto e, na virada do dia, muda de lado (a reforma), e a nova é a
// da planta outra vez; o deus que alaga a porta; a porta diante de um bolsão (num mundo sem um prédio que sirva a estes
// dois, o caso faz o seu: a porta alagada que é também o canto, o bolsão que toma também o canto ao lado — nunca passa
// vazio); a casa cheia que não aceita mais (o que não cabe fica onde estava, nada se perde); a casa deixada guarda o lugar
// dos seus guardados; salvar e carregar: as mesmas portas e os mesmos móveis. O verificador limpo, nenhum erro de módulo.
//   node qa/portas-casos.js [mundo] [sem-viradas]
// (sem-viradas: sem os casos que viram o dia — a virada do cenário anda o relógio sem o mundo, e num mundo com gente longe
// de casa ao abrir, como a metrópole, o verificador a veria "longe há dias"; a metrópole roda assim, pelo bolsão)
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js'] }); const In = G.Interiors, D = G.Depot, W = G.W, T = G.T;
const KEY = process.argv[2] || 'cidade'; const TURNS = process.argv[3] !== 'sem-viradas';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | portas-casos ${name} | ${info}`); if (!c) fails.push(name); };
const near = (a, b) => !!a && !!b && Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
const f2 = p => (p ? p.map(n => n.toFixed(2)).join(',') : '-');
// (the door of before the plans: the first open corner of the front, in the world's order)
const cornersOf = b => [[b.x + b.w - 0.5, b.y + b.h + 0.4], [b.x + b.w + 0.4, b.y + b.h - 0.5], [b.x - 0.4, b.y + 0.5], [b.x + 0.5, b.y - 0.4]];
const oldDoor = b => cornersOf(b).find(c => W.walkableXY(c[0], c[1])) || null;
const regOf = p => (p && W.inb(p[0], p[1]) ? W.reachIds(true)[W.idx(p[0], p[1])] : -9);
const doors = () => [...G.S.buildings.values()].filter(b => b.built && b.blocks && b.ip && In.TYPES[b.ip.t]);
const homes = () => doors().filter(b => In.TYPES[b.type].use === 'casa');
const dwellers = b => [...G.S.villagers.values()].filter(v => v.home === b.id);
const turn = () => { G.S.day++; G.inSim++; try { In.onNewDay(); } finally { G.inSim--; } };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const qa = name => { const bad = QA.check().filter(q => q.sev <= 2 || q.sys === 'int'); ok(`${name} verificador`, !bad.length, bad.length ? bad.slice(0, 4).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'limpo'); };
const outside = (b, s, k) => s === 'S' ? [b.x + k + 0.5, b.y + b.h + 0.4] : s === 'N' ? [b.x + b.w - 1 - k + 0.5, b.y - 0.4] : s === 'E' ? [b.x + b.w + 0.4, b.y + b.h - 1 - k + 0.5] : [b.x - 0.4, b.y + k + 0.5];
M.pronto(KEY); In.uncache();
// (the game turns them on in interiors.js; until it does, the scenario turns them on itself, as qa/portas.js measures them)
const byGame = { stores: D.stores === In.depotStores, door: G.Vg.planDoor === In.planDoor };
D.stores = In.depotStores; G.Vg.planDoor = In.planDoor;
const who = on => (on ? 'pelo jogo' : 'pelo cenário: o jogo ainda a tem desligada');
ok('ligadas', D.stores === In.depotStores && G.Vg.planDoor === In.planDoor, `G.Depot.stores pelos móveis (${who(byGame.stores)}), a porta pela planta (${who(byGame.door)})`);
// ---- every door the world's people use: the plan's, on open ground, where the old door's region is ----
// (asked as the world's step asks it: a door onto ground smaller than the old corner's is none)
const sizes = () => { const L = W.reachIds(true); const m = new Map(); for (let i = 0; i < L.length; i++) if (L[i] >= 0) m.set(L[i], (m.get(L[i]) || 0) + 1); return r => m.get(r) || 0; };
const doorsAll = () => { let n = 0, plan = 0, bad = 0, reg = 0; const ex = []; const size = sizes();
  for (const b of doors()) { n++; const [pd, d] = sim(() => [In.planDoor(b), G.Vg.door(b)]); if (!pd) continue; plan++;
    if (!near(d, pd) || !W.walkableXY(d[0], d[1])) { bad++; if (ex.length < 3) ex.push(`#${b.id} ${b.type}: ${f2(d)} ≠ ${f2(pd)}`); }
    const od = oldDoor(b); if (od && size(regOf(pd)) < size(regOf(od))) { reg++; if (ex.length < 3) ex.push(`#${b.id} ${b.type}: a porta ${f2(pd)} numa região de ${size(regOf(pd))} casas, o canto de antes ${f2(od)} numa de ${size(regOf(od))}`); } }
  return { n, plan, bad, reg, ex }; };
{ const r = doorsAll(); ok('a porta é a da planta', r.plan > 0 && !r.bad && !r.reg, `${r.n} prédios, ${r.plan} com a porta da planta no chão aberto: ${r.bad} diferentes, ${r.reg} num chão menor que o do canto de antes${r.ex.length ? ' — ' + r.ex.join(' · ') : ''}`); }
// ---- who comes out of a house comes out at its door ----
{
  const b = homes().find(h => In.planDoor(h) && dwellers(h).length); const v = dwellers(b)[0];
  // (inside the house with an errand of nothing, the errand ends: out at the door — endTask with no errand does nothing)
  sim(() => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'idle', wait: 5, pri: 0.3 }); v.inside = b.id; G.Vg.endTask(v); });
  ok('quem sai sai pela porta', near([v.x, v.y], In.planDoor(b)) && !v.inside, `${v.name} saiu da casa #${b.id} em ${f2([v.x, v.y])}; a porta da planta ${f2(In.planDoor(b))}`);
}
// ---- the door shut by a wall: the first open corner meanwhile; the turn of the day moves it to a side still open ----
let shut = null;
if (TURNS) {
  // (a house whose old corner on another side is open: the one who comes out meanwhile has somewhere to stand)
  const corner = h => ({ S: [h.x + h.w - 0.5, h.y + h.h + 0.4], E: [h.x + h.w + 0.4, h.y + h.h - 0.5], W: [h.x - 0.4, h.y + 0.5], N: [h.x + 0.5, h.y - 0.4] });
  const b = homes().find(h => { const s = h.ip.s; if (!In.planDoor(h)) return false; const c = corner(h); return ['S', 'E', 'W', 'N'].some(o => o !== s && W.walkableXY(c[o][0], c[o][1])); });
  const s0 = b.ip.s, r0 = b.ip.r, d0 = In.planDoor(b); const n = s0 === 'S' || s0 === 'N' ? b.w : b.h; const walled = [];
  sim(() => { for (let k = 0; k < n; k++) { const p = outside(b, s0, k); const i = W.idx(p[0], p[1]); if (W.walkable(i)) { G.S.wall[i] = 1; walled.push(i); } } W.touchWalk(); });
  const dm = G.Vg.door(b);
  ok('a porta tapada', !In.planDoor(b) && dm && W.walkableXY(dm[0], dm[1]), `#${b.id}: o lado ${s0} murado (${walled.length} casas de chão); a porta da planta ${f2(d0)} fora do chão aberto, quem sai sai em ${f2(dm)}`);
  turn();
  const d1 = In.planDoor(b); const ref = b.ip.h.find(f => f[0] === G.S.day && f[1] === 'reforma');
  ok('a porta muda de lado', b.ip.s !== s0 && b.ip.r > r0 && !!ref && d1 && near(G.Vg.door(b), d1) && regOf(d1) >= 0, `na virada: o lado ${s0} → ${b.ip.s}, o fato ${JSON.stringify(ref)}; a porta nova ${f2(d1)} (região ${regOf(d1)})`);
  shut = { id: b.id, s: b.ip.s, door: d1 };
}
// ---- the god floods a door: the first open corner meanwhile, never the water ----
// (a building whose plan door is not its old corner: the door in use is then the plan's, told apart from the corner's. A
// world with none still has the case: the god floods a door that is its old corner too, and the next corner still open
// takes its place — never an empty pass)
{
  const tile = p => W.idx(p[0], p[1]);
  const cand = doors().filter(h => (!shut || h.id !== shut.id) && In.planDoor(h) && oldDoor(h));
  let b = cand.find(h => tile(oldDoor(h)) !== tile(In.planDoor(h))), made = '';
  if (!b) { b = cand.find(h => { const i = tile(In.planDoor(h)); return cornersOf(h).some(c => W.walkableXY(c[0], c[1]) && tile(c) !== i); }); if (b) made = ' (neste mundo nenhuma porta da planta fica longe do canto de antes: a porta alagada era também o canto)'; }
  if (!b) ok('o deus alaga a porta', false, 'nenhum prédio com a porta da planta e outro canto aberto neste mundo');
  else {
    const pd = In.planDoor(b); const i = W.idx(pd[0], pd[1]); const t0 = G.S.type[i];
    sim(() => { G.S.type[i] = T.SEA; G.S.typeVer = (G.S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); });
    const d = G.Vg.door(b), od = oldDoor(b);
    ok('o deus alaga a porta', !In.planDoor(b) && d && W.walkableXY(d[0], d[1]) && near(d, od), `#${b.id} ${b.type}: a porta ${f2(pd)} virou mar; quem sai sai em ${f2(d)}, o primeiro canto aberto${made}`);
    sim(() => { G.S.type[i] = t0; G.S.typeVer++; W.invalidateLand(); W.touchWalk(); });
    ok('a terra volta', near(G.Vg.door(b), In.planDoor(b)), `a porta da planta de novo: ${f2(G.Vg.door(b))}`);
  }
}
// ---- a door onto a pocket: the tile before the plan's door shut in all round (walls on its open sides) — whoever came out
// there would be shut in: the step gives the old corner, on the street, and what is drawn says the same ----
// (a building whose plan door is apart from its old corner, on the same ground. A world with none still has the case: the
// god's pocket takes in the corner beside the door too — walled with it —, and the step gives the first corner still open,
// on the ground the door opened to — never an empty pass)
{
  const N = G.N; const nb = i => [i - 1, i + 1, i - N, i + N].filter(j => j >= 0 && j < N * N); const tile = p => W.idx(p[0], p[1]);
  // (the first corner still open once the door's tile is walled in)
  const outer = (h, i) => cornersOf(h).find(c => W.walkableXY(c[0], c[1]) && !nb(i).includes(tile(c))) || null;
  const fits = apart => h => { if (shut && h.id === shut.id) return false; const pd = In.planDoor(h); if (!pd) return false; const i = tile(pd), od = outer(h, i); return !!od && tile(od) !== i && regOf(pd) === regOf(od) && (!apart || near(od, oldDoor(h))); };
  let b = doors().find(fits(true)), made = '';
  if (!b) { b = doors().find(fits(false)); if (b) made = ' (neste mundo nenhuma porta da planta fica longe do canto de antes: o bolsão do deus tomou também o canto ao lado da porta)'; }
  if (!b) ok('a porta para um bolsão', false, 'nenhum prédio com a porta da planta e um canto aberto fora do bolsão neste mundo');
  else {
    const pd = In.planDoor(b); const i = W.idx(pd[0], pd[1]); const walled = [];
    sim(() => { for (const j of nb(i)) if (W.walkable(j)) { G.S.wall[j] = 1; walled.push(j); } W.touchWalk(); });
    const od = oldDoor(b); // (the old corner — or, when the pocket took it, the next one still open)
    const inStep = sim(() => [In.planDoor(b), G.Vg.door(b)]); const drawn = [In.planDoor(b), G.Vg.door(b)];
    ok('a porta para um bolsão', W.walkable(i) && !!od && !inStep[0] && near(inStep[1], od) && !drawn[0] && near(drawn[1], od), `#${b.id} ${b.type}: a casa ${f2(pd)} fechada em volta (${walled.length} muros); no passo, quem sai sai em ${f2(inStep[1])} — o primeiro canto aberto ${f2(od)}; no desenho, ${f2(drawn[1])}${made}`);
    sim(() => { for (const j of walled) G.S.wall[j] = 0; W.touchWalk(); });
    const back = sim(() => In.planDoor(b));
    ok('o bolsão aberto de novo', near(back, pd) && near(G.Vg.door(b), pd), `a porta da planta de novo: ${f2(back)}`);
  }
}
// ---- the house full: what does not fit stays where it was, nothing lost ----
let full = null;
{
  const b = homes().find(h => { const L = In.depotStores(h); return L && L.some(m => m.dep === 'casa') && dwellers(h).length; });
  const H = 'h:' + b.id; const fac = G.Village.facOfSet(b.set); const F = 'f:' + fac;
  const room = D.room(H, 'food'); const cap = In.depotStores(b).filter(m => m.dep === 'casa').reduce((a, m) => a + m.cap, 0);
  sim(() => { if (room > 0 && room < Infinity) D.make(H, 'food', room, { code: 'teste' }); if (D.free(F, 'food') < 5) D.make(F, 'food', 5, { code: 'teste', part: true }); });
  const t0 = D.total('food'), h0 = D.get(H, 'food'), f0 = D.get(F, 'food');
  const r1 = sim(() => D.move(F, H, 'food', 3, { code: 'teste' })), r2 = sim(() => D.move(F, H, 'food', 3, { code: 'teste', part: true }));
  const t1 = D.total('food');
  ok('a casa cheia', room < Infinity && D.room(H, 'food') < 1e-6 && !r1.ok && r1.why === 'não cabe' && !r2.ok && Math.abs(t1 - t0) < 1e-6 && Math.abs(D.get(H, 'food') - h0) < 1e-6 && Math.abs(D.get(F, 'food') - f0) < 1e-6,
    `#${b.id}: os móveis guardam ${cap} (cabia ${room === Infinity ? 'sem fim' : room.toFixed(2)} de comida); cheia, 3 de comida ${r1.ok ? 'COUBERAM' : 'não couberam (' + r1.why + ')'}, em parte ${r2.ok ? r2.n : 0}; a comida do mundo ${t0.toFixed(2)} → ${t1.toFixed(2)}`);
  const sl = D.slots(H); ok('o que se vê nos móveis', sl.reduce((a, x) => a + x.n, 0) > 0 && sl.every(x => x.m === 0 || In.depotStores(b).some(m => m.id === x.m)), `${sl.length} montes: ${sl.slice(0, 4).map(x => `${x.k} ${x.n} em ${x.m || 'chão'}`).join(', ')}`);
  full = { id: b.id, food: D.get(H, 'food') };
}
qa('portas');
// ---- save and load in the middle: the same doors, the same furniture, the same full house ----
{
  const snap = () => { const m = new Map(); for (const b of doors()) m.set(b.id, JSON.stringify([G.Vg.door(b), In.depotStores(b)])); return m; };
  const a = snap(); M.salvarCarregar(); In.uncache(); const c = snap(); let diff = 0; const ex = [];
  for (const [id, s] of a) if (c.get(id) !== s) { diff++; if (ex.length < 2) ex.push(`#${id}: ${s.slice(0, 80)} ≠ ${String(c.get(id)).slice(0, 80)}`); }
  const b = shut && G.S.buildings.get(shut.id);
  ok('salvar e carregar', !diff && a.size === c.size && (!shut || (b.ip.s === shut.s && near(G.Vg.door(b), shut.door))) && Math.abs(D.get('h:' + full.id, 'food') - full.food) < 1e-6, `${a.size} prédios: ${diff} com a porta ou os móveis diferentes${ex.length ? ' — ' + ex.join(' · ') : ''}; a porta mudada e a casa cheia como estavam`);
}
// ---- the house left behind keeps its chests and baskets, and what is in them ----
if (TURNS) {
  const b = homes().find(h => h.id !== full.id && dwellers(h).length && In.depotStores(h) && In.depotStores(h).some(m => m.dep === 'casa'));
  const L0 = JSON.stringify(In.depotStores(b)); const H = 'h:' + b.id; const room0 = D.room(H, 'food');
  turn(); sim(() => { for (const v of dwellers(b)) G.Village.kill(v, 'old'); }); for (let k = 0; k <= In.LEFT; k++) turn();
  const p = In.plan(b);
  ok('a casa deixada', !!b.ip.ab && p.left && JSON.stringify(In.depotStores(b)) === L0 && Math.abs(D.room(H, 'food') - room0) < 1e-6, `#${b.id}: deixada no dia ${b.ip.ab}; os mesmos ${In.depotStores(b).length} móveis de guardar (cabem ${room0 === Infinity ? 'sem fim' : room0.toFixed(2)} de comida, antes e depois)`);
}
qa('no fim');
const e = M.erros(); ok('sem erros', M.limpo(), `módulos ${JSON.stringify(e.mod)}; console ${e.console.slice(0, 2).join(' | ') || 'limpo'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
