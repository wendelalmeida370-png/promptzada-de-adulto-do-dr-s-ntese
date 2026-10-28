// maos: as mãos ocupadas (D-094) provocadas de propósito, no mundo pronto «metrópole», em Node. Uma ida de fora — o Vg.give
// e os chamados da praça que outro módulo dá pelo setTask: a execução, a assembleia, o funeral, a celebração, a festa — só
// toma de alguém uma tarefa de prioridade menor que a dela, e nunca uma carga com destino (a compra a caminho de casa) nem a
// perna de uma operação em curso (G.Act.leg: o material a caminho da obra, a conversa da venda no balcão, a banca com gente
// na fila); o que não pode esperar (3 ou mais) passa; o corpo do deus nunca é perguntado.   node qa/maos.js   (pela catraca)
//  m1 a regra 4: um funeral (1,1) não toma uma celebração (1,1); a assembleia (1,7) toma
//  m2 a perna da obra: com o material a caminho da obra, a assembleia espera e um chamado urgente leva; trabalhando na obra
//     (o dia da obra não é perna), a assembleia leva
//  m3 a venda: o mercador com gente na fila e o comprador na conversa do balcão não vão à assembleia; quem só espera na fila
//     vai, e o mercador com a fila vazia também (o dia na banca não é perna)
//  m4 a execução: quem leva uma compra para casa não é chamado, e a execução junta os outros; com a compra em casa, a chamada
//     seguinte (a cada 3 s) o leva; quem leva uma compra e morre no meio não prende nada (a compra vai para a casa, pelo livro)
//  m5 a festa da cidade: quem leva uma compra para casa fica de fora da roda; a festa começa com os outros
//  m6 save no meio, carregado: a compra nas mãos continua segurando; a obra (as tarefas não vão no save) não
//  m7 o corpo do deus: nunca perguntado — o chamado vira pedido, e a compra fica nas mãos
//  m8 o verificador vê: um chamado dado à mão (o setTask direto, sem a pergunta) a quem leva uma compra é S2
//  e o verificador limpo nos casos, sem erro de módulo nem aviso no console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/oficio-inv.js'] });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | maos ${name} | ${info}`); if (!c) fails.push(name); };
const D = G.Depot, E = G.Eco, Vg = G.Vg, A = G.Act, J = G.Justice, B = G.Biz;
const none = why => { console.log(`FALHOU | maos | ${why}`); process.exit(1); };
let S;
const fine = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (until && until()) return true; } return false; };
// (what the checker says: the busy hands' own rule — QA.maos —, and every S2 of the activities and the numbers)
const ours = () => { const out = []; QA.maos((sys, sev, msg) => out.push(`S${sev} ${msg}`), S); return out; };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan')).map(q => q.msg);
M.pronto('metropole'); S = G.S; M.viver(2); G.inSim = Math.max(G.inSim || 0, 1);
// the town of the cases: the most peopled one of coin, at peace — one with a stall open, if there is one
const pop = s => G.Village.pop(s.id);
const towns = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && E.coinage(s.fac) && !G.War.threat(s.id)).sort((a, b) => pop(b) - pop(a) || a.id - b.id);
const withStall = towns.find(s => B && B.all().some(z => z.set === s.id && z.st === 'on' && S.villagers.has(z.owner)));
const SET = (withStall || towns[0] || {}).id; if (!SET) none('a metrópole não tem cidade com moeda e em paz');
// (the execution's town: one whose people all fit in its crowd — sixty at most —, so that a call that waited can still come)
const SET4 = (towns.find(s => pop(s) >= 15 && pop(s) <= 55) || towns[0]).id;
// (the stall's town: one with a stall open, or a market with its merchant — the test's hand opens his stall, as the stall
// proofs do: the metropolis of the generation 6 opens at night, every stall shut)
const mkOf = s => [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'mercado' && b.built).sort((p, q) => p.id - q.id)[0] || null;
const merOf = (s, mk) => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'mercador' && v.job === mk.id && !v.captive && !v.jail && !v.aboard && !v.ug).sort((p, q) => p.id - q.id)[0] || null;
const SET3 = (withStall || towns.find(s => { const mk = mkOf(s); return mk && merOf(s, mk); }) || towns[0]).id;
const snap = G.Save.serialize();
let set, used;
// every case from the same world, at the same hour of the day (awake, out of doors, no rain)
const fresh = () => {
  M.reseed(4242); G.Save.apply(JSON.parse(snap)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0);
  S = G.S; G.inSim = Math.max(G.inSim || 0, 1); set = S.settlements.get(SET); used = new Set();
  S.time = 0.35; S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0;
};
// (a grown one of the town free for the case: awake, out of doors, nobody's captive, hands empty, nothing weightier than the
// day's work, fed and rested — by id; pred narrows it)
const freeOnes = pred => [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && v.age < 55 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !v.sleeping && !v.inside && !used.has(v.id) && !(S.avatar && S.avatar.id === v.id) && v.home && S.buildings.get(v.home) && !(v.carry && v.carry.n > 1e-6) && !(v.task && (v.task.pri || 0) >= 1.5) && v.hp > 50 && (!pred || pred(v))).sort((a, b) => a.id - b.id);
const take = pred => { const v = freeOnes(pred)[0] || null; if (v) { used.add(v.id); v.hunger = Math.min(v.hunger, 20); v.energy = Math.max(v.energy, 80); } return v; };
// the test's hand: a purchase in the arms, marked for the house (as the stall and the fair give it), on the way home
const purchase = v => { Vg.endTask(v); D.make('v:' + v.id, 'tecido', 2, { code: 'teste', to: 'h:' + v.home, tag: { bought: 1 } }); Vg.setTask(v, { type: 'carga', to: 'h:' + v.home, pri: 0.5, st: 0 }); };
const holds = v => !!(v && v.carry && v.carry.k === 'tecido' && v.carry.to === 'h:' + v.home && v.carry.n > 1e-6);
const drop = v => { if (v && v.carry && v.carry.n > 1e-6) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true }); if (v) Vg.endTask(v); };
const ASM = () => ({ type: 'assembly', x: set.cx, y: set.cy, pri: 1.7, kind: 'assembly' });
const URGENT = () => ({ type: 'dragao', id: 0, pri: 4.5, st: 0, kind: 'dragao' });
const tk = v => (v && v.task ? v.task.type + (v.task.st !== undefined ? '.' + v.task.st : '') : 'sem tarefa');

// ---------------- m1: an errand takes only a task of less priority than its own (the rule 4) ----------------
{
  fresh(); const a = take();
  if (!a) ok('m1 a regra 4', false, `ninguém livre em ${set.name}`);
  else {
    Vg.endTask(a); Vg.setTask(a, { type: 'celebrate', pri: 1.1, kind: 'celebrate' });
    const cem = [...S.buildings.values()].find(b => b.set === set.id && b.type === 'cemetery' && b.built);
    const fun = Vg.give(a, { type: 'funeral', id: cem ? cem.id : 0, pri: 1.1, kind: 'funeral' }); const kept = tk(a);
    const asm = Vg.give(a, ASM()); const got = tk(a);
    Vg.endTask(a);
    ok('m1 a regra 4', !fun && kept.startsWith('celebrate') && asm && got.startsWith('assembly') && !ours().length,
      `${a.name} celebrando (1,1): o funeral (1,1) ${fun ? 'LEVOU' : 'esperou'} (${kept}); a assembleia (1,7) ${asm ? 'levou' : 'NÃO levou'} (${got})`);
  }
}
// ---------------- m2: the material on its way to a work is a leg; the work of days at the site is not ----------------
{
  fresh(); const b = take(); const site = [...S.buildings.values()].filter(x => x.set === set.id && x.type !== 'ruin').sort((p, q) => (p.built - q.built) || p.id - q.id)[0];
  if (!b || !site) ok('m2 a perna da obra', false, `ninguém livre ou nenhum prédio em ${set.name}`);
  else {
    // (the builder's own leg, runBuild st 2: a plain load of the store's wood in the hands, on its way to the site)
    const leg = st => { Vg.endTask(b); if (!(b.carry && b.carry.n > 1e-6)) D.make('v:' + b.id, 'wood', 2, { code: 'teste' }); Vg.setTask(b, { type: 'build', id: site.id, pri: 1, st, mat: 'wood' }); };
    leg(2); const l1 = A.leg(b); const asm = Vg.give(b, ASM()); const kept = tk(b);
    const urg = Vg.give(b, URGENT()); const got = tk(b);
    // (at the site, hands empty, working: the day of the work)
    drop(b); Vg.setTask(b, { type: 'build', id: site.id, pri: 1, st: 4 }); const l2 = A.leg(b); const asm2 = Vg.give(b, ASM()); const got2 = tk(b);
    drop(b);
    ok('m2 a perna da obra', l1 === 'obra' && !asm && kept === 'build.2' && urg && got.startsWith('dragao') && !l2 && asm2 && got2.startsWith('assembly') && !ours().length,
      `${b.name} com a madeira a caminho da obra (${l1 || 'SEM perna'}): a assembleia ${asm ? 'LEVOU' : 'esperou'} (${kept}), o chamado urgente ${urg ? 'levou' : 'NÃO levou'} (${got}); trabalhando na obra (${l2 || 'sem perna'}): a assembleia ${asm2 ? 'levou' : 'NÃO levou'} (${got2})`);
  }
}
// ---------------- m3: the sale at the counter is a leg; waiting in line, and the day at the stall, are not ----------------
{
  fresh(); set = S.settlements.get(SET3);
  let z = B ? B.all().filter(q => q.set === set.id && q.st === 'on' && S.villagers.has(q.owner)).sort((p, q) => p.id - q.id)[0] || null : null; let opened = false;
  if (B && !z) { const mk = mkOf(set), mer = mk && merOf(set, mk); if (mer) { Vg.endTask(mer); z = B.of(mer) || B.open(mer, mk); opened = !!z; } }
  const m = z ? S.villagers.get(z.owner) : null; if (m) used.add(m.id);
  const sp = z && B.spots(z); const key = z ? 'biz:' + z.id : '';
  const b1 = take(), b2 = take();
  if (!z || !m || !sp || !b1 || !b2) ok('m3 a venda no balcão', false, `${set.name}: ${z ? '' : 'nenhuma banca aberta, nem mercado com mercador; '}${b1 && b2 ? '' : 'ninguém livre'}`);
  else {
    if (m.carry && m.carry.n > 1e-6 && !m.carry.to && !m.carry.op) D.use('v:' + m.id, m.carry.k, m.carry.n, { code: 'teste', mine: true });
    Vg.endTask(m); Vg.setTask(m, { type: 'banca', biz: z.id, pri: 1, st: 1, dur: 40, id: z.b });
    const lm0 = A.leg(m); const asm0 = Vg.give(m, ASM()); const k0 = tk(m); if (!k0.startsWith('banca')) Vg.setTask(m, { type: 'banca', biz: z.id, pri: 1, st: 1, dur: 40, id: z.b });
    // (one in line, by the line's own door — G.Life.inLine, as the buyer's errand stands in it)
    Vg.endTask(b1); Vg.setTask(b1, { type: 'compra', biz: z.id, k: 'tecido', pri: 0.35, st: 1 });
    G.Life.inLine(b1, b1.task, key, sp.buyer[0], sp.buyer[1], sp.dx, sp.dy, 0, Vg.H, () => B.lineOf(z)); const line = G.Life.queueLen(key);
    const lm = A.leg(m); const asmM = Vg.give(m, ASM()); const kM = tk(m);
    // (one talking at the counter)
    Vg.endTask(b2); Vg.setTask(b2, { type: 'compra', biz: z.id, k: 'tecido', pri: 0.35, st: 2, talk: 0, said: -1 });
    const l2 = A.leg(b2); const asm2 = Vg.give(b2, ASM()); const k2 = tk(b2);
    // (the one in line goes; the line empty, the merchant too)
    const l1 = A.leg(b1); const asm1 = Vg.give(b1, ASM()); const k1 = tk(b1); const line2 = G.Life.queueLen(key);
    const lmE = A.leg(m); const asmE = Vg.give(m, ASM()); const kE = tk(m);
    for (const v of [m, b1, b2]) Vg.endTask(v);
    ok('m3 a venda no balcão', !lm0 && asm0 && line >= 1 && lm === 'venda' && !asmM && kM === 'banca.1' && l2 === 'venda' && !asm2 && k2 === 'compra.2' && !l1 && asm1 && k1.startsWith('assembly') && !line2 && !lmE && asmE && kE.startsWith('assembly') && !ours().length,
      `na banca de ${m.name}${opened ? ' (aberta pela mão do teste)' : ''}, em ${set.name}: sem fila, a assembleia ${asm0 ? 'o levou' : 'NÃO o levou'} (${k0}); com ${line} na fila (${lm || 'SEM perna'}), ${asmM ? 'LEVOU' : 'esperou'} (${kM}); ${b2.name} conversando no balcão (${l2 || 'SEM perna'}): ${asm2 ? 'LEVOU' : 'esperou'} (${k2}); ${b1.name}, só na fila (${l1 || 'sem perna'}): ${asm1 ? 'levou' : 'NÃO levou'} (${k1}); a fila vazia (${line2}), o mercador: ${asmE ? 'levou' : 'NÃO levou'} (${kE})`);
  }
}
// ---------------- m4: the execution waits for the hands; it calls the others, and the one whose purchase got home ----------------
{
  fresh(); set = S.settlements.get(SET4); const f = G.Fac.get(set.fac);
  for (const e of (S.execs || []).filter(q => q.fac === f.id).slice()) J.cancel(e); f.exec = null; f.execQ = [];
  const victim = take(v => v.id !== f.leader && v.age >= 20);
  const set0 = victim && J.sentence(f, [victim], 'por teste', { set: set.id, soon: true, quiet: true });
  const e = set0 ? (S.execs || []).find(q => q.ids.includes(victim.id)) : null;
  const car = [];
  if (e) for (let k = 0; k < 3; k++) { const v = take(q => G.dist(q.x, q.y, e.x, e.y) < 30); if (v) { purchase(v); car.push(v); } }
  if (!e || car.length < 3) ok('m4 a execução', false, `${set.name}: ${!victim ? 'ninguém para a sentença' : !e ? 'a sentença não marcou a execução' : `só ${car.length} de 3 perto do cadafalso`}`);
  else {
    const homeOf = car.map(v => v.home);
    if (e.start > S.clock + 22) e.start = S.clock + 22; // (the gathering now: a story's «soon»)
    let wrong = 0; const see = () => { for (const v of car) if (S.villagers.has(v.id) && v.task && v.task.type === 'justice' && holds(v)) wrong++; };
    fine(3, () => { see(); return e.phase !== 'wait'; });
    const first = car.filter(v => v.task && v.task.type === 'justice').map(v => v.name); const called0 = e.called || 0;
    // the test's hand: the first one's purchase is home (out of the hands); and the second dies with his in the arms
    const [c0, c1, c2] = car; const L1 = S.ledgerN;
    drop(c0); c0.hunger = Math.min(c0.hunger, 20); c0.energy = Math.max(c0.energy, 80);
    const n1 = c1.carry ? c1.carry.n : 0; G.Village.kill(c1, 'teste');
    let late = null; const t0 = S.clock;
    fine(5, () => { see(); if (c0.task && c0.task.type === 'justice' && c0.task.j === e.id && late === null) late = Math.round((S.clock - t0) * 10) / 10; return late !== null; });
    const went = fine(30, () => { see(); return e.phase === 'read' || e.phase === 'kill' || e.phase === 'after'; });
    const heir = D.ledger().filter(q => q[0] > L1 && q[3] === 'v:' + c1.id && q[5] === 'tecido' && q[8] === 'herdado').reduce((a, q) => a + q[6], 0);
    const c2s = holds(c2) ? 'ainda com a compra nas mãos' : D.ledger().some(q => q[3] === 'v:' + c2.id && q[4] === 'h:' + homeOf[2] && q[5] === 'tecido') ? 'com a compra já em casa' : 'SEM a compra';
    const watchers = [...S.villagers.values()].filter(v => v.task && v.task.type === 'justice' && v.task.j === e.id).length;
    const b4 = bad(); J.cancel(e);
    ok('m4 a execução', !first.length && called0 >= 1 && !wrong && late !== null && went && Math.abs(heir - n1) < 0.01 && c2s !== 'SEM a compra' && !b4.length,
      `${set.name} (${pop(set)} habitantes): ${car.map(v => v.name).join(', ')} levando compras para casa perto do cadafalso: na primeira chamada ${first.length ? 'CHAMADOS ' + first.join(', ') : 'nenhum chamado'}, ${called0} outros vieram; com as mãos ocupadas e chamados: ${wrong}; ${c0.name}, com a compra em casa, ${late !== null ? `chamado ${late} s depois` : 'NÃO chamado em 5 s'}; ${c1.name} morreu com ${n1} de tecido: ${heir} foram para a casa (herdado); ${c2.name} ${c2s}; a execução ${went ? 'seguiu até a leitura' : 'NÃO chegou à leitura'} com ${watchers} na praça${b4.length ? '; o verificador: ' + b4.slice(0, 2).join(' · ') : ''}`);
  }
}
// ---------------- m5: the feast of the town leaves out who carries a purchase home ----------------
{
  fresh(); let fe = null, key = '', town = null, held = []; const tried = [];
  for (const s of [set].concat(towns.filter(q => q.id !== set.id).map(q => S.settlements.get(q.id)).filter(Boolean))) {
    const civ = (G.Fac.get(s.fac) || {}).civ;
    const keys = Object.keys(G.Fest.DEF).filter(q => G.Fest.DEF[q].civ === civ && G.Fest.DEF[q].every && !G.Fest.DEF[q].trigger);
    if (!keys.length || G.Fest.active(s.id)) continue;
    // (the six grown ones living nearest the square: the feast takes the neighbours of its place first)
    const set1 = set; set = s; const near = freeOnes().map(v => { const h = S.buildings.get(v.home); return [G.dist(h.x, h.y, s.cx, s.cy), v]; }).sort((p, q) => p[0] - q[0] || p[1].id - q[1].id).slice(0, 6).map(p => p[1]); set = set1;
    for (const v of near) { used.add(v.id); purchase(v); } held = near;
    for (const k of keys) { S.time = G.Fest.DEF[k].at + 0.01; fe = G.Fest.start(s, k); tried.push(s.name + '/' + k); if (fe) { town = s; key = k; break; } }
    if (fe) break;
    for (const v of held) drop(v); held = [];
  }
  const inIt = fe ? held.filter(v => fe.parts.includes(v.id) || (v.task && v.task.type === 'fest')) : [];
  const still = held.filter(holds).length; const b5 = ours();
  ok('m5 a festa', !!fe && held.length >= 3 && !inIt.length && fe.parts.length >= 1 && still === held.length && !b5.length,
    fe ? `${G.Fest.DEF[key].name} de ${town.name}: ${fe.parts.length} na roda; dos ${held.length} vizinhos da praça levando compras para casa, ${inIt.length ? 'NA FESTA: ' + inIt.map(v => v.name).join(', ') : 'nenhum na festa'} (${still} com a compra nas mãos)${b5.length ? '; o verificador: ' + b5[0] : ''}` : `nenhuma festa começou (${tried.slice(0, 6).join(', ')})`);
}
// ---------------- m6: a save in the middle, loaded: the purchase still holds the hands; the work's leg (a task) does not ----------------
{
  fresh(); const c = take(), b = take(); const site = [...S.buildings.values()].find(x => x.set === set.id && x.type !== 'ruin');
  if (!c || !b || !site) ok('m6 save no meio', false, `ninguém livre em ${set.name}`);
  else {
    purchase(c); Vg.endTask(b); D.make('v:' + b.id, 'wood', 2, { code: 'teste' }); Vg.setTask(b, { type: 'build', id: site.id, pri: 1, st: 2, mat: 'wood' });
    const before = [Vg.busy(c, ASM()), A.leg(b)];
    const mid = G.Save.serialize(); M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; S = G.S; set = S.settlements.get(SET);
    const c2 = S.villagers.get(c.id), b2 = S.villagers.get(b.id);
    const after = [!!c2 && Vg.busy(c2, ASM()), b2 ? A.leg(b2) : '?', holds(c2)];
    const asm = c2 ? Vg.give(c2, ASM()) : true; const asmB = b2 ? Vg.give(b2, ASM()) : false; const b6 = ours();
    ok('m6 save no meio', before[0] && before[1] === 'obra' && after[0] && !after[1] && after[2] && !asm && asmB && !b6.length,
      `antes do save: ${c.name} com a compra ${before[0] ? 'ocupado' : 'LIVRE'}, ${b.name} com a perna ${before[1] || 'NENHUMA'}; carregado: ${c.name} ${after[2] ? 'ainda com a compra' : 'SEM a compra'} e ${after[0] ? 'ocupado' : 'LIVRE'} (a assembleia ${asm ? 'LEVOU' : 'esperou'}), ${b.name} ${after[1] ? 'AINDA com a perna ' + after[1] : 'sem perna (a tarefa não vai no save)'} (a assembleia ${asmB ? 'levou' : 'NÃO levou'})${b6.length ? '; o verificador: ' + b6[0] : ''}`);
  }
}
// ---------------- m7: the god's body is never asked: a call is a request, and the purchase stays in the hands ----------------
{
  fresh(); let c = null, got = { ok: false, why: 'ninguém livre' }; const tried7 = [];
  for (let k = 0; k < 4 && !got.ok; k++) { c = take(); if (!c) break; purchase(c); got = G.Possess.take(c); if (!got.ok) { tried7.push(`${c.name}: ${got.why}`); drop(c); } }
  if (!got.ok) ok('m7 o corpo do deus', false, `o deus não tomou ninguém: ${tried7.join('; ') || got.why}`);
  else {
    M.viver(0.2); const asked = Vg.busy(c, ASM()); const asm = Vg.give(c, ASM()); const kept = holds(c); const k7 = tk(c); const b7 = ours();
    G.Possess.release('deus'); M.viver(0.2);
    ok('m7 o corpo do deus', !asked && !asm && kept && !k7.startsWith('assembly') && !b7.length,
      `${c.name} pelo deus, com uma compra nas mãos: ${asked ? 'PERGUNTADO como mãos ocupadas' : 'nunca perguntado'}; a assembleia ${asm ? 'LEVOU o corpo' : 'virou pedido'} (${k7}); a compra ${kept ? 'ficou nas mãos' : 'SUMIU'}${b7.length ? '; o verificador: ' + b7[0] : ''}`);
  }
}
// ---------------- m8: the checker sees a call given by hand to busy hands ----------------
{
  fresh(); const c = take(), d = take();
  if (!c || !d) ok('m8 o verificador vê', false, `ninguém livre em ${set.name}`);
  else {
    const clean0 = ours().length;
    purchase(c); Vg.setTask(c, { type: 'justice', role: 'watch', j: 0, x: set.cx, y: set.cy, pri: 1.95, st: 0, kind: 'justice' });
    purchase(d); Vg.setTask(d, { type: 'fest', fid: 0, role: 'crowd', pri: 3.2, kind: 'fest', st: 0 });
    const saw = ours(); const sawC = saw.some(s => s.includes('#' + c.id + ':')), sawD = saw.some(s => s.includes('#' + d.id + ':'));
    drop(c); drop(d); const clean1 = ours().length;
    ok('m8 o verificador vê', !clean0 && sawC && sawD && !clean1, `antes ${clean0}; o público da execução dado à mão a ${c.name} com uma compra: ${sawC ? 'visto' : 'NÃO visto'}; a festa dada à mão a ${d.name} com uma compra: ${sawD ? 'visto' : 'NÃO visto'} (${saw[0] || '-'}); depois ${clean1}`);
  }
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `MAOS: FALHOU (${fails.join(', ')})` : 'MAOS: ok');
process.exit(fails.length ? 1 : 0);
