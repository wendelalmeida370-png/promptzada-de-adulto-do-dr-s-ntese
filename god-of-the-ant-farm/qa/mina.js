// mina: o turno do mineiro de ponta a ponta num mundo pronto, em Node, pelo qa/nodemundo.js — o mundo de verdade: o mineiro
// pela tarefa dele (o minejob do economy.js), a galeria debaixo do morro (caves.js) e, no salto, a boca da mina; o veio, o
// armazém, a conta do povo e o salário (L-381). O que sai do veio é o que o povo conta e paga, e é o que o livro diz.
//  m1 um turno na galeria: o mineiro desce e pica a face — ali o veio, a conta e o salário não mexem —; na saída, o veio perde
//     o que sai, o minério entra nas mãos pelo livro ('mina'), o povo conta e paga isso uma vez, e ele leva ao armazém
//     ('entrega')
//  m2 o mesmo turno no salto (pela boca da mina, sem galeria): o mesmo livro ('mina', 'salario', 'entrega') e o mesmo veio
//  m3 a morte na face: o minério não saiu do veio — nada contado, nada pago, nada sumido
//  m4 um save com o mineiro na face, carregado: ele sai da galeria; o veio inteiro, nada contado nem pago pelo que não saiu;
//     e o turno seguinte sai certo
//  m5 as mãos ocupadas na saída (um jarro d'água): o minério fica no veio, sem conta nem salário, e o jarro nas mãos
//  m6 o fim do veio: sai só o que havia (o veio em zero, nunca abaixo), a crônica diz que a mina se esgotou, e ninguém mais
//     desce
//  m7 o deus derruba a galeria com o mineiro na face: ele morre com ela, e nada do que não saiu é contado; a mina segue, por
//     uma galeria nova
//  e o verificador (S0–S2) sem nada novo, nenhum erro de módulo nem aviso no console.
// O corpo do deus não minera (o interact.js não tem o verbo): o terceiro nível é o salto (m2).
//   node qa/mina.js [mundo]    (rodar pela catraca: bash SP/onda2/catraca.sh node qa/mina.js)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, E = G.Eco, C = G.Caves, V = G.Village, W = G.W;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | mina ${name} | ${info}`); if (!c) fails.push(name); };
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
// (what the world counted: G.Eco.mined is the town's count and the miner's pay of a shift in the gallery — caves.js calls it by
// its name —, with the ledger's last line when it was called: the ore into the hands, 'mina', or nothing)
const counted = [];
const mined0 = E.mined; E.mined = function (v, bId, o, n) { counted.push({ v: v && v.id, b: bId, dep: o && o.id, n: r2(n), last: seen[seen.length - 1] || null }); return mined0.apply(this, arguments); };
// (at the pithead, in the skip, runMine counts and pays where it makes the 'mina' line: the line is the count, with its mine)
const pithead = [];
D.onMove.push(e => { if (e[8] !== 'mina') return; const v = S().villagers.get(e[9]); const t = v && v.task; if (t && t.type === 'minejob') pithead.push({ v: v.id, b: t.id, n: r2(e[6]) }); });
G.inSim++;
const U = () => C.U();
// (a mine with ore in its vein whose gallery can be dug — the one it has, or a new one at its pithead, caves.js mineCave —, and
// its miners; the one with the most)
function pick() {
  let best = null;
  for (const b of [...S().buildings.values()].sort((p, q) => p.id - q.id)) {
    if (b.type !== 'mina' || !b.built) continue;
    const o = (S().ores || []).find(q => q.id === b.ore); if (!o || o.amt < 12) continue;
    const cv = b.cave && C.get(b.cave); const can = (cv && !cv.gone && cv.mine === b.id) || (!U().id[b.y * G.N + b.x] && b.x >= 2 && b.y >= 2 && b.x < G.N - 2 && b.y < G.N - 2);
    if (!can) continue;
    const ms = [...S().villagers.values()].filter(x => x.role === 'mineiro' && x.job === b.id && !x.captive && !x.jail && !x.aboard && x.age >= 16 && x.age < 60).sort((p, q) => p.id - q.id);
    if (ms.length && (!best || ms.length > best.ms.length)) best = { b, o, ms: ms.map(x => x.id) };
  }
  return best;
}
const P0 = pick();
if (!P0) { console.log(`FALHOU | mina mundo | ${world}: nenhuma mina com veio, galeria possível e mineiro`); process.exit(1); }
const town = S().settlements.get(P0.b.set); const F0 = G.Fac.get(V.facOfSet(P0.b.set));
console.log(`${world}: a mina #${P0.b.id} de ${town.name} (${F0.civ}${E.coinage(F0.id) ? ', de moeda' : ''}), veio de ${P0.o.kind} com ${r2(P0.o.amt)}, ${P0.ms.length} mineiro(s)`);
// (each case from the same world: the mine, its deposit, its miners by id; coins in the treasury for the pay; by day)
function setup() {
  fresh();
  const b = S().buildings.get(P0.b.id), o = (S().ores || []).find(q => q.id === P0.o.id), f = G.Fac.get(F0.id);
  const ms = P0.ms.map(id => S().villagers.get(id)).filter(Boolean);
  if (E.coinage(f.id) && D.get('f:' + f.id, 'moedas') < 20) D.make('f:' + f.id, 'moedas', 20, { code: 'teste', part: true });
  S().time = 0.3; S().weather.rain = 0;
  seen.length = 0; counted.length = 0; pithead.length = 0;
  return { b, o, f, ms, amt0: o.amt, k: o.kind === 'ouro' ? 'ouro' : 'minerio', base: base() };
}
// (the checker's S0–S2 now, to tell what a case brought: only what was not there before counts)
function base() { return new Set(QA.check().filter(q => q.sev <= 2).map(q => `${q.sys}|${q.msg}`)); }
const newBad = P => QA.check().filter(q => q.sev <= 2 && !P.base.has(`${q.sys}|${q.msg}`)).slice(0, 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
// a miner of the mine, rested and fed, at the pithead, given the day's work by the world's own door
function send(P, v) {
  G.Vg.endTask(v); if (v.ug) C.exitNow(v); v.sleeping = false; v.inside = 0; v.energy = 95; v.hunger = 10;
  if (v.carry && v.carry.n > 1e-6 && v.carry.k !== 'water') G.Vg.toStore(v, P.f.id, 'teste');
  const [fx, fy] = V.frontTile(P.b); v.x = fx + 0.5; v.y = fy + 0.5; v.path = null;
  return E.jobTask(v, G.Vg.H);
}
// the shift at the face: the ore marked in the task (t.carry), up to 160 s
const atFace = v => { const t = v && v.task; return t && t.type === 'caverna' && t.kind === 'mine' && t.carry ? t : null; };
function toFace(v) { for (let k = 0; k < 1600; k++) { M.viver(0.1); if (!S().villagers.has(v.id)) return null; const t = atFace(v); if (t) return t; } return null; }
// (the books of a case: what left the vein, what the world counted for it — in the gallery and at the pithead —, the ledger's
// 'mina' lines into hands, the pay, the deliveries)
const lines = (code, f) => seen.filter(e => e[8] === code && (!f || f(e)));
const wage = (k, n) => Math.round((E.PRICE[k] || 0.3) * n * 0.35 * 100) / 100;
function books(P) {
  const out = r2(P.amt0 - P.o.amt);
  const inGal = counted.filter(c => c.dep === P.o.id); const atPit = pithead.filter(c => c.b === P.b.id);
  const sum = r2(inGal.reduce((s, c) => s + c.n, 0) + atPit.reduce((s, c) => s + c.n, 0));
  // (every count in the gallery comes right after its ore into the hands, in the ledger: the same miner, the same amount)
  const unbacked = inGal.filter(c => !(c.last && c.last[8] === 'mina' && c.last[4] === 'v:' + c.v && c.last[3] === '@mundo' && Math.abs(c.last[6] - c.n) < 1e-6)).length;
  return { out, sum, unbacked, n: inGal.length + atPit.length };
}
const of = (who, P) => ({
  counted: counted.filter(c => c.v === who && c.dep === P.o.id).length + pithead.filter(c => c.v === who && c.b === P.b.id).length,
  mina: lines('mina', e => e[9] === who).length,
  pay: r2(lines('salario', e => e[9] === who).reduce((s, e) => s + e[6], 0)),
  store: r2(lines('entrega', e => e[3] === 'v:' + who && e[5] === P.k && String(e[4]).startsWith('f:')).reduce((s, e) => s + e[6], 0)),
});
const say = (P, B) => `o veio deu ${B.out}, o povo contou ${B.sum} em ${B.n} turno(s)${B.unbacked ? `, ${B.unbacked} contado(s) sem o minério nas mãos no livro` : ''}`;

// ------------------------------ m1: a shift in the gallery ------------------------------
{
  const P = setup(); const v = P.ms[0]; const t0 = send(P, v); const t = toFace(v);
  if (!t) ok('m1', false, `${v.name} #${v.id} (${t0 ? t0.type : 'sem tarefa'}) não chegou à face da galeria em 160 s`);
  else {
    const n = t.carry.n; const B0 = books(P); const o0 = of(v.id, P);
    // (at the face nothing of his has left the vein: what it gave so far is the other miners', each with its count)
    const faceOk = B0.out === B0.sum && !B0.unbacked && o0.counted === 0 && o0.pay === 0 && o0.mina === 0;
    let got = false; for (let q = 0; q < 1800 && !got; q++) { M.viver(0.1); got = of(v.id, P).store > 0; }
    const B = books(P); const o1 = of(v.id, P); const bad = newBad(P);
    const want = E.coinage(P.f.id) ? wage(P.k, n) : 0;
    ok('m1', faceOk && got && B.out === B.sum && !B.unbacked && o1.counted === 1 && o1.mina === 1 && Math.abs(o1.pay - want) < 0.011 && Math.abs(o1.store - n) < 1e-6 && !bad.length,
      `${v.name} #${v.id} na face com ${n} de ${P.k}: ali o veio deu ${B0.out}, contado ${o0.counted}, pago ${o0.pay}; na saída ${o1.mina} linha 'mina', contado ${o1.counted}×, salário ${o1.pay} (o certo: ${want}), ao armazém ${o1.store}; ${say(P, B)}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// ------------------------------ m2: the same shift in the skip, at the pithead ------------------------------
{
  const P = setup(); const v = P.ms[0]; const W0 = W.pathGreed;
  G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3; let got = false; let t0;
  try { t0 = send(P, v); for (let q = 0; q < 400 && !got; q++) { G.Main.skipStep(1); got = of(v.id, P).store > 0; } } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W0; }
  const B = books(P); const o1 = of(v.id, P); const n = r2(lines('mina', e => e[9] === v.id).reduce((s, e) => s + e[6], 0)); const bad = newBad(P);
  const want = E.coinage(P.f.id) ? wage(P.k, n) : 0;
  ok('m2', got && B.out === B.sum && !B.unbacked && o1.counted === 1 && o1.mina === 1 && Math.abs(o1.pay - want) < 0.011 && Math.abs(o1.store - n) < 1e-6 && !(v.ug) && !bad.length,
    `no salto (${t0 ? t0.type : 'sem tarefa'}): ${o1.mina} linha 'mina' de ${n}, contado ${o1.counted}×, salário ${o1.pay} (o certo: ${want}), ao armazém ${o1.store}; ${say(P, B)}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// ------------------------------ m3: death at the face ------------------------------
{
  const P = setup(); const v = P.ms[0]; send(P, v); const t = toFace(v);
  if (!t) ok('m3', false, `${v.name} #${v.id} não chegou à face em 160 s`);
  else {
    const n = t.carry.n; const L0 = seen.length; V.kill(v, 'quake'); M.viver(3);
    const B = books(P); const o1 = of(v.id, P); const lost = seen.slice(L0).filter(e => e[3] === 'v:' + v.id && e[5] === P.k).length; const bad = newBad(P);
    ok('m3', o1.counted === 0 && o1.mina === 0 && o1.pay === 0 && !lost && B.out === B.sum && !bad.length,
      `${v.name} morreu na face com ${n} de ${P.k} na tarefa: contado ${o1.counted}, pago ${o1.pay}, linhas 'mina' ${o1.mina}, saindo das mãos ${lost}; ${say(P, B)} (o que não saiu ficou no veio)${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// ------------------------------ m4: a save at the face ------------------------------
{
  let P = setup(); const id = P.ms[0].id; send(P, P.ms[0]); const t = toFace(P.ms[0]);
  if (!t) ok('m4', false, `#${id} não chegou à face em 160 s`);
  else {
    const n = t.carry.n; const amtAt = P.o.amt;
    M.salvarCarregar(); G.inSim = Math.max(G.inSim, 1); M.viver(2);
    // (the same deposit and miner after the load: new objects)
    P = Object.assign(P, { b: S().buildings.get(P.b.id), o: (S().ores || []).find(q => q.id === P.o.id), f: G.Fac.get(P.f.id) });
    const v = S().villagers.get(id); const stuck = v && v.ug && !(v.task && v.task.type === 'caverna');
    const o1 = of(id, P); const amtAfter = P.o.amt;
    // the next shift, after the load, comes out right
    let got = false; if (v) { send(P, v); for (let q = 0; q < 2400 && !got; q++) { M.viver(0.1); got = of(id, P).store > 0; } }
    const B = books(P); const o2 = of(id, P); const bad = newBad(P);
    ok('m4', !stuck && o1.counted === 0 && o1.pay === 0 && amtAfter === amtAt && got && B.out === B.sum && !B.unbacked && o2.counted === 1 && !bad.length,
      `save com ${n} de ${P.k} na face: depois do load ${v ? (v.ug ? 'debaixo do morro em ' + (v.task ? v.task.type : 'nada') : 'fora da mina') : 'sumiu'}, o veio ${r2(amtAfter)} (antes ${r2(amtAt)}), contado ${o1.counted}, pago ${o1.pay}; o turno seguinte ${got ? 'chegou ao armazém' : 'não saiu'} (contado ${o2.counted}×); ${say(P, B)}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// ------------------------------ m5: busy hands on the way out ------------------------------
{
  const P = setup(); const v = P.ms[0]; send(P, v); const t = toFace(v);
  if (!t) ok('m5', false, `${v.name} #${v.id} não chegou à face em 160 s`);
  else {
    const n = t.carry.n; D.make('v:' + v.id, 'water', 1, { code: 'teste', tag: { jar: 1 } });
    // (the step he comes out: the jar still in the hands — the world takes it home afterwards, L-300 — and the ore where it was)
    let out = false; for (let q = 0; q < 900 && !out; q++) { M.viver(0.1); out = !v.ug; }
    const B = books(P); const o1 = of(v.id, P); const jar = !!(v.carry && v.carry.k === 'water'); const bad = newBad(P);
    ok('m5', out && jar && o1.counted === 0 && o1.mina === 0 && o1.pay === 0 && B.out === B.sum && !bad.length,
      `${v.name} saiu ${out ? '' : 'não '}da galeria com o jarro nas mãos (${jar ? 'lá' : 'não estava'}) e ${n} de ${P.k} na tarefa: contado ${o1.counted}, pago ${o1.pay}, linhas 'mina' ${o1.mina}; ${say(P, B)} (o minério ficou no veio)${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
// ------------------------------ m6: the end of the vein ------------------------------
{
  const P = setup(); P.o.amt = 3; P.amt0 = 3; const crew = P.ms.slice(0, 2);
  for (const v of crew) send(P, v);
  let done = false; for (let q = 0; q < 3000 && !done; q++) { M.viver(0.1); done = P.o.amt <= 0 && crew.every(v => !v.ug && !atFace(v)); }
  const said = S().history.filter(h => /se esgotou/.test(h.txt) && h.d === S().day).length;
  // nobody goes down this mine any more: a minute of the world with the miners sent again (the caves of the hills are other
  // errands: caves.js plan)
  let down = 0; for (const v of crew) if (S().villagers.has(v.id)) send(P, v);
  const here = t => { const cv = t && t.type === 'caverna' && t.kind === 'mine' && C.get(t.cave); return !!(cv && cv.mine === P.b.id); };
  for (let q = 0; q < 600; q++) { M.viver(0.1); for (const v of crew) if (here(v.task)) down++; }
  const B = books(P); const bad = newBad(P);
  ok('m6', done && P.o.amt === 0 && B.out === 3 && B.sum === 3 && !B.unbacked && said === 1 && !down && !bad.length,
    `${crew.length} mineiro(s) num veio com 3: o veio em ${r2(P.o.amt)}, ${say(P, B)}; a crônica disse «se esgotou» ${said}×; depois, turnos debaixo do morro: ${down}${bad.length ? '; ' + bad.join(' · ') : ''}`);
}
// ------------------------------ m7: the god brings the gallery down with a miner at the face ------------------------------
{
  const P = setup(); const v = P.ms[0]; send(P, v); const t = toFace(v);
  if (!t) ok('m7', false, `${v.name} #${v.id} não chegou à face em 160 s`);
  else {
    const n = t.carry.n; const cv = C.get(t.cave); const dead = C.collapse(cv); M.viver(2);
    const gone = !S().villagers.has(v.id); const o1 = of(v.id, P); const B0 = books(P);
    // the mine goes on: a new gallery for its next shift (the other miner, or the gallery the world digs for one)
    const next = P.ms.find(x => x !== v && S().villagers.has(x.id));
    let got = false; if (next) { send(P, next); for (let q = 0; q < 2400 && !got; q++) { M.viver(0.1); got = of(next.id, P).store > 0; } }
    const cv2 = C.mineCave(P.b, P.o); const B = books(P); const bad = newBad(P);
    ok('m7', gone && dead >= 1 && o1.counted === 0 && o1.pay === 0 && o1.mina === 0 && B0.out === B0.sum && !!(cv2 && !cv2.gone && cv2.id !== cv.id) && (!next || got) && B.out === B.sum && !B.unbacked && !bad.length,
      `a galeria caiu com ${v.name} na face (${n} de ${P.k} na tarefa; ${dead} morto(s)): contado ${o1.counted}, pago ${o1.pay}; ${say(P, B0)}; a mina segue numa galeria nova (${cv2 ? '#' + cv2.id : 'nenhuma'})${next ? `, e o turno de ${next.name} ${got ? 'chegou ao armazém' : 'não saiu'}` : ' (sem outro mineiro nela)'}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  }
}
const er = M.erros();
ok('erros', !Object.keys(er.mod).length && !er.console.length, `módulos: ${JSON.stringify(er.mod)}; console: ${er.console.slice(0, 2).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
