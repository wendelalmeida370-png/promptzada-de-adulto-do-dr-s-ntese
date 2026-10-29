// atividades: a fundação das atividades provocada de propósito (C1) — o depósito único (G.Depot) e as operações (G.Act).
//   node qa/atividades.js [semente]      (em Node, pelo qa/nodemundo.js: o mundo do jogo, sem navegador)
// Partes: d1 transferir (tudo ou nada; o que não cabe fica onde estava; a parte que cabe), d2 a mesma chave duas vezes,
// d3 reservas, d4 dinheiro (casa, bolso, tesouro) e a troca de duas mãos (swap), o1 uma operação do começo ao fim com
// os livros fechando, o2 a sabotagem (o verificador acusa uma escrita por fora), o3 save e load no meio (duas vezes: o
// mesmo futuro), o4 a pessoa morre com a carga (fica no chão; outro pega), o5 o fim solta as reservas, o6 o corpo do deus
// fica com o papel (keepLoad), o7 o salto e o passo, o8 um segundo é um segundo (a olhada das atividades no passo e no
// salto no mesmo ritmo); e o verificador limpo, sem erro de módulo.
const M = require('./nodemundo.js');
const seed = +(process.argv[2] || 7);
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | atividades ${name} | ${info}`); if (!c) fails.push(name); };
const actBad = () => QA.check().filter(q => q.sys === 'act');
M.novo({ seed, type: 'continente', size: 96, tribes: 3 });
M.viver(40);
// (what this test does stands for the world's own step — the god's hand, a rule of the world: inside the step, as the
// world does it; the checker counts any operation or transfer made from outside it)
G.inSim++;
const S = G.S; const D = G.Depot, A = G.Act;
const f = G.Fac.all()[0]; const set = f && G.Fac.capitalOf(f.id);
const people = set ? [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && v.age < 55 && !v.captive) : [];
// (a world without a capital and two grown people in it stops here saying so — never a TypeError)
if (people.length < 2) { console.log(`FALHOU | atividades | o mundo da semente ${seed} sem ${set ? `dois adultos na capital ${set.name}` : 'um povo com capital'}`); process.exit(1); }
const v = people[0], w = people[1];
// (the test's hand empties hands through the depot, with its cause: a load never vanishes without the ledger — rule 20)
const clearHands = p => { if (p && p.carry && p.carry.n > 0) D.use('v:' + p.id, p.carry.k, p.carry.n, { code: 'teste', mine: true }); if (p) p.carry = null; };
for (const p of people) { G.Vg.endTask(p); clearHands(p); }
// (a test operation: from the people's store to a house, step by step; it keeps its own books by its transfers)
A.def('teste', { name: 'Teste', conserve: true, title: () => 'Uma operação de teste' });

// ---------------- d1: all or nothing; what does not fit stays where it was
{
  f.stock.food = 30; const cap = G.Village.cap(f.id);
  const r1 = D.move('f:' + f.id, 'v:' + v.id, 'food', 3, { code: 'teste', by: v.id });
  const inHands = v.carry && v.carry.k === 'food' ? v.carry.n : 0;
  const r2 = D.move('f:' + f.id, 'v:' + v.id, 'wood', 1, { code: 'teste' }); // (hands full of food: no room for wood)
  f.stock.food = cap - 1; const before = v.carry ? v.carry.n : 0;
  const r3 = D.move('v:' + v.id, 'f:' + f.id, 'food', 3, { code: 'teste' }); // (only one fits: refused whole)
  const keep = v.carry ? v.carry.n : 0; const st3 = f.stock.food;
  const r4 = D.move('v:' + v.id, 'f:' + f.id, 'food', 3, { code: 'teste', part: true }); // (the part that fits)
  ok('d1 tudo ou nada', r1.ok && inHands === 3 && !r2.ok && !r3.ok && keep === before && st3 === cap - 1 && r4.ok && r4.n === 1 && v.carry && v.carry.n === 2 && f.stock.food === cap,
    `pegou ${inHands}; madeira recusada (${r2.why}); 3 num estoque com lugar para 1: ${r3.why}, nas mãos ${keep}, estoque ${st3}/${cap}; com a parte: ${r4.n} entrou, ${v.carry ? v.carry.n : 0} ficou nas mãos`);
  clearHands(v); f.stock.food = 30;
}
// ---------------- d2: the same key twice applies once
{
  const op = A.start('teste', { from: 'f:' + f.id, to: 'h:' + v.home, goods: { food: 4 }, set: set.id, fac: f.id });
  const h = S.buildings.get(v.home); const p0 = h.pantry || 0, s0 = f.stock.food;
  const a = D.move('f:' + f.id, 'h:' + v.home, 'food', 2, { op: op.id, code: 'teste', key: 'passo1' });
  const b = D.move('f:' + f.id, 'h:' + v.home, 'food', 2, { op: op.id, code: 'teste', key: 'passo1' });
  ok('d2 a mesma chave', a.ok && b.ok && b.again && (h.pantry || 0) === p0 + 2 && f.stock.food === s0 - 2, `a 2ª vez devolveu o resultado da 1ª (${b.n}) sem aplicar: despensa ${p0} → ${h.pantry}, estoque ${s0} → ${f.stock.food}`);
  A.end(op, 'ok', 'teste');
}
// ---------------- d3: reservations hold goods back from the others
{
  f.stock.tecido = 5;
  const op1 = A.start('teste', { from: 'f:' + f.id, to: 'h:' + v.home, goods: { tecido: 4 }, set: set.id, fac: f.id });
  const op2 = A.start('teste', { from: 'f:' + f.id, to: 'h:' + w.home, goods: { tecido: 4 }, set: set.id, fac: f.id });
  const r = D.reserve('f:' + f.id, 'tecido', 4, op1.id);
  const free2 = D.free('f:' + f.id, 'tecido', op2.id), free1 = D.free('f:' + f.id, 'tecido', op1.id);
  const m2 = D.move('f:' + f.id, 'h:' + w.home, 'tecido', 2, { op: op2.id, code: 'teste' });
  const m1 = D.move('f:' + f.id, 'h:' + v.home, 'tecido', 4, { op: op1.id, code: 'teste' });
  ok('d3 reserva', r && free2 === 1 && free1 === 5 && !m2.ok && m1.ok, `reservou 4 de 5: o outro vê ${free2} livre e não leva 2 (${m2.why}); o dono da reserva leva os 4`);
  A.end(op1, 'ok'); A.end(op2, 'cancel');
}
// ---------------- d4: money — the family's coins, a purse, the treasury; a deal is both sides or neither
{
  const h = S.buildings.get(v.home); h.coin = 10; f.stock.moedas = 50; f.stock.ceramica = 2;
  const r = D.swap(['f:' + f.id, 'h:' + v.home, 'ceramica', 1], ['h:' + v.home, 'f:' + f.id, 'moedas', 1.1], { code: 'venda' });
  const r2 = D.swap(['f:' + f.id, 'h:' + v.home, 'ceramica', 1], ['h:' + v.home, 'f:' + f.id, 'moedas', 99], { code: 'venda' }); // (cannot pay: nothing moves)
  ok('d4 dinheiro e troca', r.ok && h.coin === 8.9 && f.stock.moedas === 51.1 && (h.inv.ceramica || 0) === 1 && !r2.ok && f.stock.ceramica === 1 && h.coin === 8.9, `pagou 1,1 e levou 1 pote; sem dinheiro para 99, nada mudou (${r2.why}): casa ${h.coin} moedas, ${h.inv.ceramica} pote, o povo com ${f.stock.ceramica}`);
}
// ---------------- o1: an operation from the start to the end, its books closing
{
  f.stock.food = 40;
  const op = A.start('teste', { from: 'f:' + f.id, to: 'h:' + v.home, goods: { food: 6 }, set: set.id, fac: f.id });
  A.join(op, v, 'carregador');
  const a = D.move('f:' + f.id, 'v:' + v.id, 'food', 3, { op: op.id, code: 'pegar', by: v.id });
  const mid = actBad();
  const b = D.move('v:' + v.id, 'h:' + v.home, 'food', 3, { op: op.id, code: 'entregar', by: v.id });
  const c = D.move('f:' + f.id, 'v:' + v.id, 'food', 3, { op: op.id, code: 'pegar', by: v.id });
  const d = D.move('v:' + v.id, 'h:' + v.home, 'food', 3, { op: op.id, code: 'entregar', by: v.id });
  A.end(op, 'ok', 'tudo entregue');
  ok('o1 do começo ao fim', a.ok && b.ok && c.ok && d.ok && op.taken.food === 6 && op.done.food === 6 && !mid.length && !actBad().length && op.st === 'ok', `saiu ${op.taken.food}, chegou ${op.done.food}; no meio (3 nas mãos) o verificador fechou as contas; fim: ${A.STATES[op.st]}`);
}
// ---------------- o2: sabotage — a write from outside (goods of the operation vanish from the hands): the checker sees it
{
  f.stock.food = 40;
  const op = A.start('teste', { from: 'f:' + f.id, to: 'h:' + v.home, goods: { food: 4 }, set: set.id, fac: f.id });
  A.join(op, v, 'carregador');
  D.move('f:' + f.id, 'v:' + v.id, 'food', 4, { op: op.id, code: 'pegar', by: v.id });
  v.carry = null; // (as the old code did when a walk failed: the load just disappears)
  const bad = actBad().filter(q => q.msg.includes('não fecha'));
  ok('o2 sabotagem acusada', bad.length === 1 && bad[0].sev === 1, bad.length ? bad[0].msg : 'o verificador não viu');
  A.end(op, 'fail', 'sabotagem');
}
// ---------------- o3: save and load in the middle, twice: the same operation, the same future
{
  f.stock.food = 40;
  const op = A.start('teste', { from: 'f:' + f.id, to: 'h:' + v.home, goods: { food: 4 }, set: set.id, fac: f.id });
  A.join(op, v, 'carregador'); D.move('f:' + f.id, 'v:' + v.id, 'food', 2, { op: op.id, code: 'pegar', by: v.id, key: 'p1' });
  const id = op.id, vid = v.id;
  const str = G.Save.serialize();
  G.Save.apply(JSON.parse(str));
  const op1 = G.Act.get(id); const v1 = G.S.villagers.get(vid);
  const back = !!op1 && op1.taken.food === 2 && v1 && v1.carry && v1.carry.op === id;
  const again = op1 ? D.move('f:' + op1.fac, 'v:' + vid, 'food', 2, { op: id, code: 'pegar', key: 'p1' }) : null;
  // (a day at most: at night the carrier sleeps with it, and takes it on in the morning)
  const live = () => { for (let k = 0; k < 240 && G.Act.get(id) && !(G.Act.get(id).done.food >= 2); k++) M.viver(1); };
  live(); const c1 = JSON.stringify(QA.canon()); const done1 = op1 ? op1.done.food || 0 : 0; const bad1 = actBad();
  G.Save.apply(JSON.parse(str)); G.Act.get(id) && D.move('f:' + G.Act.get(id).fac, 'v:' + vid, 'food', 2, { op: id, code: 'pegar', key: 'p1' }); live();
  const c2 = JSON.stringify(QA.canon());
  A.end(G.Act.get(id), 'ok', 'fim do teste');
  ok('o3 save no meio', back && again && again.again && c1 === c2 && done1 === 2 && !bad1.length, `a operação voltou com o que tinha (saiu 2, nas mãos de ${v1 ? v1.name : '?'} marcado com ela); a chave aplicada antes do save não aplicou de novo; a carga seguiu para o destino da operação (chegou ${done1}); carregado duas vezes, o mesmo futuro: ${c1 === c2}${bad1.length ? ' · ' + bad1[0].msg : ''}`);
}
// ---------------- o4: who dies with a load drops it where they fell; another hand picks it up; the books still close
{
  const S2 = G.S; const f2 = G.Fac.get(f.id); const free = p => !A.roleOf(p) && !(p.carry && p.carry.op);
  const vv = [...S2.villagers.values()].find(p => p.set === set.id && p.age > 18 && !p.captive && free(p));
  const ww = [...S2.villagers.values()].find(p => p.set === vv.set && p.id !== vv.id && p.age > 18 && !p.captive && free(p));
  f2.stock.food = 40; G.Vg.endTask(vv); clearHands(vv); G.Vg.endTask(ww); clearHands(ww);
  const op = A.start('teste', { from: 'f:' + f2.id, to: 'h:' + (vv.home || ww.home), goods: { food: 3 }, set: vv.set, fac: f2.id });
  A.join(op, vv, 'carregador'); D.move('f:' + f2.id, 'v:' + vv.id, 'food', 3, { op: op.id, code: 'pegar', by: vv.id });
  G.Village.kill(vv, 'old');
  const g = (S2.loose || []).find(x => x.op === op.id);
  const mid = actBad(); const gn = g ? g.n : 0;
  const r = g ? D.move('g:' + g.id, 'v:' + ww.id, 'food', 3, { op: op.id, code: 'pegar', by: ww.id }) : { ok: false };
  const picked = r.ok && ww.carry && ww.carry.n === 3 && !(S2.loose || []).some(x => x.id === g.id);
  M.viver(3);
  const gone = !op.roles[vv.id]; const bad = actBad();
  ok('o4 morreu com a carga', !!g && gn === 3 && !mid.length && picked && gone && !bad.length, g ? `a comida ficou no chão em ${g.x.toFixed(1)},${g.y.toFixed(1)}; ${ww.name} pegou; o papel do morto saiu da operação (${gone}); as contas fecham${bad.length ? ' — ' + bad[0].msg : ''}` : 'nada no chão');
  A.end(op, 'cancel', 'teste'); clearHands(ww);
}
// ---------------- o5: the end lets the reservations go
{
  const f2 = G.Fac.get(f.id); f2.stock.couro = 6;
  const op = A.start('teste', { from: 'f:' + f2.id, to: 'h:' + v.home, goods: { couro: 6 }, fac: f2.id });
  D.reserve('f:' + f2.id, 'couro', 6, op.id); const free0 = D.free('f:' + f2.id, 'couro', 0);
  A.end(op, 'cancel', 'desistiu'); const free1 = D.free('f:' + f2.id, 'couro', 0);
  ok('o5 o fim solta a reserva', free0 === 0 && free1 === 6, `livre ${free0} → ${free1}`);
}
// ---------------- o6: the god's body keeps its role and its load (keepLoad); given back, it is still in the operation
{
  const S2 = G.S; const f2 = G.Fac.get(f.id); f2.stock.food = 40;
  const vv = [...S2.villagers.values()].find(p => p.set === set.id && p.age > 18 && p.age < 50 && !p.captive && G.Possess.can(p).ok && !A.roleOf(p) && !(p.carry && p.carry.op));
  const op = A.start('teste', { from: 'f:' + f2.id, to: 'h:' + vv.home, goods: { food: 2 }, fac: f2.id });
  G.Vg.endTask(vv); clearHands(vv); A.join(op, vv, 'carregador');
  D.move('f:' + f2.id, 'v:' + vv.id, 'food', 2, { op: op.id, code: 'pegar', by: vv.id });
  vv.task = { type: 'carga', to: 'h:' + vv.home, op: op.id, pri: 1, st: 0, age: 0 };
  // (what possess.js will do: end the errand keeping the load, then take the body)
  G.Vg.endTask(vv, { keepLoad: true }); const took = G.Possess.take(vv);
  M.viver(2);
  const r1 = A.roleOf(vv); const held = vv.carry && vv.carry.op === op.id; const b1 = r1 ? r1.me.body : -1;
  G.Possess.release('deus'); M.viver(2);
  const r2 = A.roleOf(vv);
  ok('o6 o corpo fica com o papel', took.ok && b1 === 1 && held && !!r2 && r2.me.body === 0 && !actBad().length, `encarnado: papel ${r1 ? r1.role : '-'} (corpo ${b1}), carga nas mãos: ${held}; devolvido: papel ${r2 ? r2.role : '-'} (corpo ${r2 ? r2.me.body : '-'})`);
  A.end(op, 'cancel'); clearHands(vv);
}
// ---------------- l1: whoever carries something is not sent to the well (the jar took the load's place: it vanished)
{
  const S2 = G.S; let sent = 0, lost = 0, tries = 0;
  for (const h of [...S2.buildings.values()].filter(b => b.built && G.BDEF[b.type].housing)) {
    const fam = [...S2.villagers.values()].filter(p => p.home === h.id && !p.captive);
    const p = fam.find(q => q.age >= 18 && q.age < 60 && q.hp >= 40 && !A.roleOf(q) && !(q.carry && q.carry.op)); if (!p) continue;
    if (++tries > 8) break;
    for (const o of fam) if (o !== p) { G.Vg.endTask(o); o.sleeping = true; o.task = { type: 'sleep', pri: 1.5, st: 1, age: 0 }; }
    G.Vg.endTask(p); p.sleeping = false; p.carry = { k: 'wood', n: 3 }; G.Vg.setTask(p, { type: 'deliver', pri: 1 });
    h.water = 0; h.waterTry = 0; S2.time = 0.2;
    for (let k = 0; k < 60 && !(p.task && p.task.type === 'water'); k++) { h.waterTry = 0; G.Life.update(0.1); }
    if (!(p.task && p.task.type === 'water')) continue;
    sent++; for (let k = 0; k < 900 && p.task && p.task.type === 'water'; k++) G.debug.step(0.1);
    if (!(p.carry && p.carry.k === 'wood' && p.carry.n === 3)) lost++;
  }
  ok('l1 a carga e o poço', tries >= 4 && sent === 0 && lost === 0, `${tries} casas secas de manhã com só um carregador acordado: ${sent} mandados ao poço com lenha nas mãos, ${lost} perderam a carga (antes da correção: 6 de 6 mandados, 4 perderam)`);
}
// ---------------- o7: the skip and the step: the operations live in both (nothing breaks, the checker stays clean)
{
  M.saltar(1); M.viver(20);
  const e = M.erros(); const bad = QA.check().filter(q => q.sev <= 2);
  ok('o7 salto e passo', !Object.keys(e.mod).length && !bad.length, `um ano de salto e 20 s de passo: erros de módulo ${JSON.stringify(e.mod)}, verificador ${bad.length ? bad.slice(0, 3).map(q => q.sys + ': ' + q.msg).join(' · ') : 'limpo'}`);
}
// ---------------- o8: the second of the activities is a second — one look of the operations a second of the world, in the
// step (0.1 s) and in the skip (half steps of 0.5 s) alike (T-d: ten steps of 0.1 add up to 0.9999999999999999, and the
// look came every 1.1 s in the step)
{
  let n = 0; const hook = () => { n++; }; A.hooks.tick.push(hook);
  const c0 = G.S.clock; M.viver(60); const inStep = n, dS = G.S.clock - c0; // (G.S: after the loads of o3 the world is a new object)
  n = 0; const c1 = G.S.clock; const W = G.W;
  G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
  try { for (let k = 0; k < 60; k++) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; }
  const inSkip = n, dK = G.S.clock - c1;
  A.hooks.tick.splice(A.hooks.tick.indexOf(hook), 1);
  ok('o8 um segundo é um segundo', Math.abs(inStep - dS) <= 1 && Math.abs(inSkip - dK) <= 1, `em ${Math.round(dS)} s do mundo pelo passo de 0,1 s: ${inStep} olhadas das atividades; em ${Math.round(dK)} s pelo salto (meios passos de 0,5 s): ${inSkip}`);
}
const e = M.erros();
ok('limpo', M.limpo(), e.console.length ? e.console.slice(0, 4).join(' | ') : 'sem erro de módulo nem aviso no console');
console.log(fails.length ? `ATIVIDADES: FALHOU (${fails.join(', ')})` : 'ATIVIDADES: ok');
process.exit(fails.length ? 1 : 0);
