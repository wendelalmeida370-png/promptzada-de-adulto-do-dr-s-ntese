// olaria: a olaria de ponta a ponta num mundo pronto (G.Oficio; D-075, D-076, D-078), em Node, pelo qa/nodemundo.js — o
// mundo de verdade: as mãos dos oleiros pelas tarefas deles, o sol e a noite, a lenha do armazém, o verificador dos ofícios.
//  o1 uma fornada de tijolo (ou de adobe, ou de potes, o que o povo faz) numa olaria com oleiro: da argila ao forno; um save
//     no meio da queima, carregado duas vezes, vive o mesmo futuro; a fornada acaba e as contas fecham (feitos + quebrados) —
//     com a paz do deus sobre o caso (uma guerra no meio leva o oleiro à mobilização, T-295)
//  o2 o oleiro morre no meio da fornada: ela espera, sem perder nem repetir nada; outro oleiro a toma de onde parou (um da
//     cidade de mãos livres, que não é mercador de caravana, T-296)
//  o3 o deus derruba a olaria no meio da queima: a fornada acaba ali, o que ela tinha é dito perdido, e a prateleira sai pelo
//     livro ('ruina')
//  o4 o tijolo da obra (D-075): uma casa fundada numa cidade de olaria troca parte da pedra por tijolo, o total da obra é o
//     mesmo; sem tijolo nenhum por um dia, o que falta volta a ser pedra; a obra largada devolve pelo que recebeu
//  o5 num povo que não faz tijolo (o nórdico), a obra fica toda de pedra
//  e nenhum erro de módulo nem aviso no console.
//   node qa/olaria.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/olaria.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const D = G.Depot, A = G.Act, O = G.Oficio, E = G.Eco, V = G.Village;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | olaria ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
M.pronto(world); M.viver(1);
const snap = G.Save.serialize();
const fresh = () => { M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); };
const S = () => G.S;
const facOfSet = id => V.facOfSet(id);
// (the trades' rule of the checker, alone, every few seconds)
const rule = QA.oficio; // (the trades' rule by its name: oficio-inv.js has more than one)
const watch = bad => rule((sys, sev, msg) => { if (sys === 'oficio' && sev <= 2 && bad.length < 6) bad.push(`S${sev} ${msg}`); }, S());
const liveSec = (sec, until, bad) => { for (let k = 0; k < sec; k++) { M.viver(1); if (bad && k % 5 === 4) watch(bad); if (until && until()) return true; } return false; };
const potters = b => [...S().villagers.values()].filter(v => v.job === b.id && v.role === 'oleiro' && A.able(v));
// the olaria for the tests: one with a potter, in a town that makes brick if there is one
function pick() {
  let best = null;
  for (const b of S().buildings.values()) {
    if (b.type !== 'olaria' || !b.built || !potters(b).length) continue;
    const k = E.brickOf(facOfSet(b.set)); const score = (k === 'tijolo' ? 3 : k ? 2 : 1) + potters(b).length * 0.1;
    if (!best || score > best.score) best = { b, k, score };
  }
  return best;
}
// a clean start: the olaria's own batches let go, its shelf emptied into the store (its furniture holds little: a rack of
// twelve), clay on it — room left for a batch to begin —, wood in the store, a sunny morning
function ready(b, clay) {
  for (const op of O.batches(b)) O.cut(op, 'teste');
  const f = G.Fac.get(facOfSet(b.set)); const ref = 'b:' + b.id;
  for (const [k, n] of Object.entries(D.list(ref))) D.store(ref, f.id, k, n, { code: 'teste' });
  const c = Math.min(clay, Math.floor(D.room(ref, 'argila') - 4)); if (c >= 1) D.make(ref, 'argila', c, { code: 'teste' });
  if (D.free('f:' + f.id, 'wood') < 30) D.make('f:' + f.id, 'wood', 30, { code: 'teste', part: true });
  S().time = 0.28; S().weather.rain = 0;
  return f;
}
const digest = op => JSON.stringify([op.st, op.data.s, op.data.q, op.data.feitos, op.data.quebrados, op.data.fogo, op.data.calor, op.data.lenha, S().rng]);
// (a batch that would not begin: why — the batches there, the room on the shelf)
const whyNot = (b, p) => `a fornada de ${p} não começou: inSim ${G.inSim}, fornadas ${JSON.stringify(O.batches(b).map(op => [op.id, op.data.p, op.data.s, op.st]))}, lugar para argila ${D.room('b:' + b.id, 'argila')}, na prateleira ${JSON.stringify(D.list('b:' + b.id))}`;
G.inSim++;
const P = pick();
if (!P) { console.log(`FALHOU | olaria mundo | ${world}: nenhuma olaria com oleiro`); process.exit(1); }
const p = P.k || 'ceramica';
console.log(`${world}: ${V.buildName(P.b)} #${P.b.id} de ${S().settlements.get(P.b.set).name} (${(G.Fac.get(facOfSet(P.b.set)) || {}).civ}), ${potters(P.b).length} oleiro(s); faz ${p}`);
// ---------------- o1 a batch, from the clay to the kiln; a save in the middle of the firing, loaded twice
{
  fresh(); const b = S().buildings.get(P.b.id); ready(b, 12); const bad = [];
  // (the god's peace over the case — no war declared while the batch is made: in the branch joined with b8c072c Argos went to
  // war, its only potter was called to the muster at the dawn of the day 63 and made a warrior, nobody worked the olaria for
  // two days and the batch was let go ('abandonada'), as the game says. The case is the batch and the save in the middle of
  // its firing, T-295)
  S().divinePeace = G.DAY_LEN * 5;
  const op = O.start(b, p, potters(b)[0]);
  const kind = () => (O.stage(op) || {}).kind;
  const fired = O.rx(op).st.some(s => s.kind === 'fogo');
  liveSec(400, () => !A.live(op) || (fired ? kind() === 'fogo' && op.data.fogo > 4 : op.data.s >= O.rx(op).st.length - 1), bad);
  const at = O.stage(op); ok('o1 da-argila-ao-forno', A.live(op) && (fired ? at && at.kind === 'fogo' : true), `${p}: etapa ${at ? at.id : '(fim)'}${fired ? `, fogo ${op.data.fogo} s, ${op.data.lenha} de lenha` : ''}; unidades ${op.data.q}`);
  const mid = G.Save.serialize(); const opId = op.id;
  const run = () => { M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; liveSec(60); const o = A.get(opId); return o ? digest(o) : 'sem fornada'; };
  const a = run(), c = run();
  ok('o1 save-no-meio-da-queima', a === c, a === c ? `o mesmo futuro (${a})` : `${a} ≠ ${c}`);
  const o2 = A.get(opId); liveSec(400, () => !A.live(o2), bad);
  const R = O.rx(o2);
  ok('o1 a-fornada-fecha', !A.live(o2) && o2.st === 'ok' && Math.abs(o2.data.feitos + o2.data.quebrados - R.n) < 0.01 && !bad.length, `${o2.st}: ${o2.data.feitos} ${R.name} e ${o2.data.quebrados} quebrados de ${R.n}; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
}
// ---------------- o2 the potter dies in the middle; another takes it up where it stopped
{
  fresh(); const b = S().buildings.get(P.b.id); ready(b, 8); const bad = [];
  const op = O.start(b, 'ceramica', potters(b)[0]);
  if (!op) { ok('o2 sem-oleiro-espera', false, whyNot(b, 'ceramica')); console.log(`OLARIA: FALHOU (${fails.join(', ')})`); process.exit(1); }
  liveSec(200, () => !A.live(op) || (O.stage(op) && O.stage(op).kind === 'mao' && op.data.q >= 2), bad);
  const q0 = op.data.q, s0 = op.data.s;
  for (const v of potters(b)) V.kill(v, 'teste', true);
  liveSec(20); const q1 = op.data.q;
  ok('o2 sem-oleiro-espera', A.live(op) && q1 >= q0 && op.data.s === s0, `a fornada viva: ${A.live(op)}, na mesma etapa; unidades ${q0} → ${q1}`);
  // (another of the town takes up the trade — one with free hands, not a caravan's merchant: the first of the town, Dimitri,
  // was on a caravan with 7 of incense for another people, and a load with a destination goes there first, and the next
  // caravan asks first who went before — he never came to the wheel in 200 s, T-296)
  const nv = [...S().villagers.values()].find(v => v.set === b.set && v.age >= 18 && v.age < 50 && A.able(v) && !v.captive && v.role !== 'oleiro' && !(v.carry && v.carry.n > 1e-6) && !v.merchant);
  if (nv) { nv.role = 'oleiro'; nv.job = b.id; G.Vg.endTask(nv); }
  liveSec(200, () => !A.live(op) || op.data.s > s0, bad);
  ok('o2 outro-toma', !!nv && (op.data.s > s0 || !A.live(op)) && op.data.q > q1 && !bad.length, `${nv ? nv.name : 'ninguém'}: etapa ${s0} → ${op.data.s}, unidades ${q1} → ${op.data.q}; ${bad.slice(0, 2).join(' | ') || 'as contas fecham'}`);
}
// ---------------- o3 the god pulls the olaria down in the middle of the firing
{
  fresh(); const b = S().buildings.get(P.b.id); ready(b, 8); const bad = [];
  const op = O.start(b, 'ceramica', potters(b)[0]);
  if (!op) { ok('o3 a-olaria-cai', false, whyNot(b, 'ceramica')); console.log(`OLARIA: FALHOU (${fails.join(', ')})`); process.exit(1); }
  liveSec(400, () => !A.live(op) || (O.stage(op) && O.stage(op).kind === 'fogo'), bad);
  const inKiln = op.data.forno; D.make('b:' + b.id, 'ceramica', 3, { code: 'teste' }); const L0 = S().ledgerN || 0;
  V.destroyBuilding(b, 'teste'); liveSec(2);
  const ruina = S().ledger.filter(e => e[0] > L0 && e[8] === 'ruina' && e[3] === 'b:' + b.id).reduce((n, e) => n + e[6], 0);
  ok('o3 a-olaria-cai', op.st === 'int' && op.data.perdido >= inKiln - 0.01 && ruina >= 3 - 0.01 && !bad.length, `fornada ${op.st} (${op.why || ''}): ${op.data.perdido} perdidos (${inKiln} no forno); a prateleira pelo livro: ruina ${ruina}`);
}
// ---------------- o4 the brick of a work; o5 a people that makes no brick
function freeSpot(set, w, h) {
  const N = G.N, W = G.W;
  for (let r = 3; r < 20; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; let okk = true;
    for (let yy = y - 1; yy <= y + h && okk; yy++) for (let xx = x - 1; xx <= x + w && okk; xx++) { if (!W.inb(xx, yy)) { okk = false; break; } const i = yy * N + xx; if (S().occ[i] || !W.walkable(i) || S().road[i]) okk = false; }
    if (okk) return [x, y];
  }
  return null;
}
{
  fresh(); const set = S().settlements.get(P.b.set); const k = E.brickOf(facOfSet(set.id));
  if (!k) ok('o4 tijolo-da-obra', true, `${set.name} não faz tijolo (o povo ${(G.Fac.get(set.fac) || {}).civ}): sem o caso`);
  else {
    const sp = freeSpot(set, G.BDEF.house.w, G.BDEF.house.h);
    const b = sp ? V.addBuilding('house', sp[0], sp[1], set.id, false) : null;
    const tot = o => Object.values(o).reduce((n, x) => n + (x || 0), 0);
    ok('o4 tijolo-da-obra', !!b && !!b.brick && b.need[k] === b.brick.n && b.brick.n > 0 && tot(V.bill(b)) === tot(G.BDEF.house.cost), b ? `${b.type}#${b.id}: ${b.brick.n} de ${k} no lugar de pedra; a conta da obra ${JSON.stringify(V.bill(b))} = ${JSON.stringify(G.BDEF.house.cost)} no total` : 'sem lugar para a casa');
    if (b && b.brick) {
      // (a whole day with no brick in the store and none being made: what it lacks goes back to stone)
      const f = G.Fac.get(facOfSet(set.id)); const have = D.free('f:' + f.id, k); if (have > 0) D.use('f:' + f.id, k, have, { code: 'teste', mine: true });
      for (const o of S().buildings.values()) if (o.set === set.id && o.type === 'olaria') for (const op of O.batches(o)) if (O.rx(op).k === k) O.cut(op, 'teste');
      const n0 = b.need[k], st0 = b.need.stone; b.brick.day = S().day - 1; V.onNewDay();
      ok('o4 sem-tijolo-volta-a-pedra', b.need[k] === 0 && b.need.stone === st0 + n0 && b.brick.back === n0, `faltavam ${n0} de ${k}: agora ${b.need[k]}; pedra ${st0} → ${b.need.stone}`);
      // (a work given up gives back what it got: a work that got 2 of its brick gives back 2 of brick, not stone)
      const b2 = V.addBuilding('house', sp[0], sp[1] + 3, set.id, false);
      if (b2 && b2.brick) { D.make('o:' + b2.id, k, 2, { code: 'teste' }); const got = V.delivered(b2); ok('o4 a-obra-largada-devolve', got[k] === 2 && !got.stone, `recebeu ${JSON.stringify(got)}`); }
      else ok('o4 a-obra-largada-devolve', true, 'sem segunda obra: sem o caso');
    }
  }
}
{
  fresh(); let nset = null; for (const s of S().settlements.values()) { const f = G.Fac.get(s.fac); if (f && f.alive && !E.brickOf(f.id) && G.Village.pop(s.id) > 5) { nset = s; break; } }
  if (!nset) ok('o5 sem-tijolo', true, 'nenhum povo sem tijolo neste mundo: sem o caso');
  else { const sp = freeSpot(nset, G.BDEF.house.w, G.BDEF.house.h); const b = sp ? V.addBuilding('house', sp[0], sp[1], nset.id, false) : null; ok('o5 sem-tijolo', !!b && !b.brick && !Object.keys(b.need).some(q => q === 'tijolo' || q === 'adobe'), b ? `${nset.name} (${G.Fac.get(nset.fac).civ}): a obra ${JSON.stringify(b.need)}` : 'sem lugar'); }
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `OLARIA: FALHOU (${fails.join(', ')})` : 'OLARIA: ok');
process.exit(fails.length ? 1 : 0);
