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
//  m9 a caverna forçada (D-100), com as palavras do mundo: o oráculo subindo e o desafio das crianças esperam quem leva uma
//     compra para casa (a regra inteira das mãos ocupadas); o turno da mina (o ofício do mineiro) também (L-395); o refúgio
//     de quem foge de um ataque não espera — a compra vai nas mãos e, ao sair, chega em casa pelo livro —; o ataque aos
//     bandidos (3,1) leva; com a compra em casa, o oráculo leva
//  m10 a tripulação escondida na caverna: com a cidade atacada, o refúgio de um tripulante segura o chamado da viagem ao cais
//     até o susto passar, e depois ele volta ao cais (L-459)
//  m11 a colônia e as crianças escondidas na caverna: uma criança no refúgio não é levada para a colônia, nem a família dela
//     (que vai inteira ou não vai); as que não se escondiam vão (L-459)
//  m12 as escolhas da guerra — a leva, a tripulação da frota (e o almirante), a do ataque pelo mar, o bando por terra — não
//     levam quem tem as mãos ocupadas: com os guerreiros e caçadores do povo levando uma compra para casa e um construtor com
//     o material a caminho da obra, ninguém escolhido tem as mãos ocupadas, e cada escolha acontece com os outros (L-461)
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
// (the town of the case: the first of the execution's towns — the order of the towns, from SET4 — with three of its people
// free near the scaffold to carry purchases by it: in the metropolis of the generation 10, Birka, the first of 15 to 55
// people, had only two, T-329)
{
  const tried = []; let f = null, victim = null, e = null, car = [];
  for (const s4 of [SET4].concat(towns.filter(s => s.id !== SET4 && pop(s) >= 15 && pop(s) <= 55).map(s => s.id))) {
    fresh(); set = S.settlements.get(s4); f = G.Fac.get(set.fac);
    for (const q of (S.execs || []).filter(q => q.fac === f.id).slice()) J.cancel(q); f.exec = null; f.execQ = [];
    victim = take(v => v.id !== f.leader && v.age >= 20);
    const set0 = victim && J.sentence(f, [victim], 'por teste', { set: set.id, soon: true, quiet: true });
    e = set0 ? (S.execs || []).find(q => q.ids.includes(victim.id)) : null;
    car = [];
    if (e) for (let k = 0; k < 3; k++) { const v = take(q => G.dist(q.x, q.y, e.x, e.y) < 30); if (v) { purchase(v); car.push(v); } }
    if (e && car.length >= 3) break;
    tried.push(`${set.name}: ${!victim ? 'ninguém para a sentença' : !e ? 'a sentença não marcou a execução' : `só ${car.length} de 3 perto do cadafalso`}`);
  }
  if (!e || car.length < 3) ok('m4 a execução', false, tried.join(' · '));
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
      `${tried.length ? `(antes: ${tried.join(' · ')}) ` : ''}${set.name} (${pop(set)} habitantes): ${car.map(v => v.name).join(', ')} levando compras para casa perto do cadafalso: na primeira chamada ${first.length ? 'CHAMADOS ' + first.join(', ') : 'nenhum chamado'}, ${called0} outros vieram; com as mãos ocupadas e chamados: ${wrong}; ${c0.name}, com a compra em casa, ${late !== null ? `chamado ${late} s depois` : 'NÃO chamado em 5 s'}; ${c1.name} morreu com ${n1} de tecido: ${heir} foram para a casa (herdado); ${c2.name} ${c2s}; a execução ${went ? 'seguiu até a leitura' : 'NÃO chegou à leitura'} com ${watchers} na praça${b4.length ? '; o verificador: ' + b4.slice(0, 2).join(' · ') : ''}`);
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
// ---------------- m9: the cave's forced errands and the busy hands (D-100) ----------------
// (by the cave's own door, G.Caves.give, with the world's own words for each: the oracle going up and the children's dare ask
// the whole rule of the busy hands (Vg.busy, D-094) — a purchase on its way home waits —; the miner's shift is his own trade
// (o.job) and waits only for busy hands below 3: a purchase does not go down the gallery (L-395); the refuge of who flees an
// attack (o.urge) does not wait — the load goes with them, and when they come out it gets home, by the ledger. An outlaws'
// raid, 3,1, passes)
{
  fresh(); const cv = G.Caves && G.Caves.all ? G.Caves.all().sort((a, b) => a.id - b.id)[0] : null;
  const c = take(), d = take();
  if (!cv || !c || !d) ok('m9 a caverna forçada', false, !cv ? 'nenhuma caverna na metrópole' : `ninguém livre em ${set.name}`);
  else {
    purchase(c);
    const WAIT = [['oracle', { pri: 1.6, force: 1 }], ['mine', { pri: 1.05, force: 1, stay: 14, job: cv.mine || 1 }], ['dare', { pri: 1.15, force: 1, torch: 0 }]];
    const said = WAIT.map(([kind, o]) => { const r = G.Caves.give(c, kind, cv, -1, Object.assign({}, o)); const out = [kind, r, tk(c), holds(c)]; if (r) { Vg.endTask(c); Vg.setTask(c, { type: 'carga', to: 'h:' + c.home, pri: 0.5, st: 0 }); } return out; });
    const waited = said.every(([, r, t, h]) => !r && t.startsWith('carga') && h);
    const b9 = ours();
    // (3 and up passes: the raid takes him, purchase and all)
    const raid = G.Caves.give(c, 'raid', cv, -1, { pri: 3.1, force: 1, stay: 40 }); const tr = tk(c); drop(c);
    // (the refuge does not wait: she goes with the purchase in her hands, and with no danger the refuge ends — ten calm
    // seconds —, she comes out, and the purchase gets home: 'compra-em-casa', from her hands to her house)
    purchase(d); const L9 = S.ledgerN;
    const hall = cv.halls && cv.halls[0]; const cell = hall ? Math.floor(hall.y) * G.N + Math.floor(hall.x) : -1; // (a spot in the cave's first hall, as the world gives the refuge one)
    const fled = G.Caves.give(d, 'refuge', cv, cell, { pri: 2.7, stay: 1e9, force: 1, urge: 1 }); const tf = tk(d); const withIt = holds(d);
    const homeLine = () => D.ledger().find(e => e[0] > L9 && e[8] === 'compra-em-casa' && e[3] === 'v:' + d.id && e[4] === 'h:' + d.home);
    const home = !!fled && fine(300, () => !!homeLine());
    // (and with the purchase home and her errand ended, the oracle's call takes her: the hands are free)
    Vg.endTask(d); const up = home && G.Caves.give(d, 'oracle', cv, -1, { pri: 1.6, force: 1 }); const tu = tk(d); Vg.endTask(d);
    const h9 = homeLine();
    ok('m9 a caverna forçada', waited && raid && tr.startsWith('caverna') && fled && tf.startsWith('caverna') && withIt && home && up && tu.startsWith('caverna') && !b9.length,
      `${c.name} com uma compra nas mãos: ${said.map(([k, r, t, h]) => `${k} ${r ? 'LEVOU' : 'esperou'} (${t}${h ? '' : ', SEM a compra'})`).join('; ')}; o ataque aos bandidos (3,1) ${raid ? 'levou' : 'NÃO levou'} (${tr}); ${d.name}, com uma compra nas mãos: o refúgio ${fled ? 'levou' : 'NÃO levou'} (${tf}${withIt ? ', com a compra' : ', SEM a compra'}), e a compra ${home ? `chegou em casa ('compra-em-casa', livro ${h9 ? h9[0] : '?'})` : 'NÃO chegou em casa em 300 s'}; com a compra em casa, o oráculo ${up ? 'levou' : 'NÃO levou'} (${tu})${b9.length ? '; o verificador: ' + b9[0] : ''}`);
  }
}
// ---------------- m10: the crew hidden in the cave while the town is attacked: the quay waits for the fright to pass (L-459) ----------------
// (a voyage made ready by the test's hand — the first people of the sea whose town of departure has a cave known within 45 tiles
// —, one of its crew of that town, not the leader, the first by id — the refuge is a town's: one of another town hides from
// no alarm of his own, and the cave lets him go when his town is calm; Amenhotep, of the generation-12 metropole, a crewman
// living away from Luxor, left the cave ten seconds in and was called to the quay with Luxor's alarm up, T-364 —: the
// town's alarm up (an attack, as the war raises it), the errand at the
// quay lost to the fright, and the cave's refuge for him (2,7). The voyage calls its crew back to the quay from any errand
// below 3,25 «once the fright is over» (L-367), and did so with the alarm still up; now the call waits for the refuge to end,
// and then he goes back to the quay)
{
  fresh(); let e = null, home = null, cv = null; const tried = [];
  for (const f of G.Fac.all().filter(q => q.alive && G.Civ.has(q.id, 'navegacao')).sort((a, b) => a.id - b.id)) {
    const x = G.Expe.consider(f, { scale: 'media', many: true }); if (!x) { tried.push(`${f.name}: nenhuma viagem`); continue; }
    const t = S.settlements.get(x.from); const dOf = c => Math.min(...c.mouths.map(m => G.dist(m.x, m.y, t.cx, t.cy)));
    const c = G.Caves.all().filter(q => q.mouths.length && !q.mine && q.known && q.known[t.fac]).sort((a, b) => dOf(a) - dOf(b) || a.id - b.id)[0];
    if (c && dOf(c) < 45 && x.crew.length >= 2) { e = x; home = t; cv = c; break; }
    tried.push(`${x.name}: ${c ? `caverna a ${Math.round(dOf(c))} casas` : 'sem caverna conhecida'}`);
  }
  const v = e && e.crew.map(id => S.villagers.get(id)).filter(q => q && q.id !== e.leader && !q.aboard && q.set === home.id).sort((a, b) => a.id - b.id)[0];
  if (!e || !v) ok('m10 a tripulação escondida na caverna', false, `nenhuma viagem que saia de uma cidade com caverna perto: ${tried.join(' · ') || 'nenhum povo do mar'}`);
  else {
    home.alarmT = 40; Vg.endTask(v);
    const hall = cv.halls && cv.halls[0]; const cell = hall ? Math.floor(hall.y) * G.N + Math.floor(hall.x) : -1;
    const hid = !!G.Caves.give(v, 'refuge', cv, cell, { pri: 2.7, stay: 1e9, force: 1, urge: 1 });
    const hiding = () => !!(v.task && v.task.type === 'caverna' && v.task.kind === 'refuge');
    let early = null, back = null; const t0 = S.clock;
    fine(120, () => { const quay = v.task && v.task.type === 'cais' && v.task.exp === e.id; if (quay && home.alarmT > 0 && early === null) early = Math.round((S.clock - t0) * 10) / 10; if (quay && back === null) back = Math.round((S.clock - t0) * 10) / 10; return back !== null; });
    const b10 = bad();
    const said = !hid ? 'o refúgio NÃO o levou' : early !== null ? `CHAMADO AO CAIS ${early} s depois, com o alarme ainda aceso` : back !== null ? `o cais esperou o susto passar: de volta ao cais ${back} s depois, com o refúgio acabado` : `NÃO voltou ao cais em 120 s (${hiding() ? 'ainda no refúgio' : v.task ? v.task.type : 'sem tarefa'})`;
    ok('m10 a tripulação escondida na caverna', hid && early === null && back !== null && !b10.length, `${v.name}, da tripulação de ${e.name} (${home.name}), escondido ${G.Caves.na ? G.Caves.na(cv) : 'na caverna'} com o alarme da cidade aceso: ${said}${b10.length ? '; o verificador: ' + b10[0] : ''}`);
  }
}
// ---------------- m11: the colony and the children hiding in the cave: its second rule asks too (L-459) ----------------
// (a colony made ready by the test's hand — X.colony straight, for the first region where it finds a site, as the plan sends
// it —, from the town of a people of the sea with the most children: its alarm up, and the cave's refuge for its children of
// 3 to 13 (2,7, as the world's refuge gives it to them all); the stores filled by the test's hand for the voyage. The colony
// takes its children by a second rule, outside the free() of the crew, and called children of Mênfis out of the cave to the
// quay with the alarm still up; now a hiding child is not taken — nor its family, which goes only whole (L-440))
{
  fresh(); const tried = [];
  const docksOf = q => [...S.buildings.values()].filter(b => b.type === 'doca' && b.built && G.Village.facOfSet(b.set) === q.id).sort((a, b) => a.id - b.id);
  const kidsOf = s => [...S.villagers.values()].filter(v => v.set === s.id && v.age >= 3 && v.age < 14 && !v.captive && !v.aboard && !v.ug && !v.held && !v.air).sort((a, b) => a.id - b.id);
  const c = G.Fac.all().filter(q => q.alive && G.Civ.has(q.id, 'navegacao') && docksOf(q).length).map(q => ({ f: q, dock: docksOf(q)[0], s: S.settlements.get(docksOf(q)[0].set) })).filter(o => o.s).sort((a, b) => kidsOf(b.s).length - kidsOf(a.s).length || a.f.id - b.f.id)[0] || null;
  let e = null, hid = [], best = null;
  if (c) {
    c.s.alarmT = 40;
    const dOf = cv => Math.min(...cv.mouths.map(m => G.dist(m.x, m.y, c.s.cx, c.s.cy)));
    const cv = G.Caves.all().filter(q => q.mouths.length && !q.mine).sort((a, b) => dOf(a) - dOf(b) || a.id - b.id)[0];
    const hall = cv && cv.halls && cv.halls[0]; const cell = hall ? Math.floor(hall.y) * G.N + Math.floor(hall.x) : -1;
    if (cv) for (const v of kidsOf(c.s)) { Vg.endTask(v); if (G.Caves.give(v, 'refuge', cv, cell, { pri: 2.7, stay: 1e9, force: 1, urge: 1 }) && v.task && v.task.type === 'caverna') hid.push(v); }
    for (const r of G.Know.regions()) { const site = G.Expe.siteFor(r, c.f.id); if (site) { best = { r, site, motive: 'expansao' }; break; } }
    if (!best) tried.push('nenhuma região com lugar para a colônia');
    else { c.f.stock.food = Math.max(c.f.stock.food, 2000); c.f.stock.wood = Math.max(c.f.stock.wood, 200); e = G.Expe.colony(c.f, best, 26, [c.dock]); if (!e) tried.push('a colônia não saiu'); }
  } else tried.push('nenhum povo do mar com doca');
  if (!e) ok('m11 as crianças escondidas e a colônia', false, `sem o caso: ${tried.join(' · ')}`);
  else {
    const ids = new Set(e.crew); const taken = hid.filter(v => ids.has(v.id));
    const still = hid.filter(v => v.task && v.task.type === 'caverna' && v.task.kind === 'refuge').length;
    // (the family of a hiding child stays with it: no child left in the cave with a parent gone to the colony)
    const parents = hid.filter(v => !ids.has(v.id) && (ids.has(v.mother) || ids.has(v.father)));
    const kids = e.crew.map(id => S.villagers.get(id)).filter(v => v && v.age < 16 && !hid.includes(v));
    const b11 = bad();
    ok('m11 as crianças escondidas e a colônia', !taken.length && still === hid.length && !parents.length && hid.length > 0 && !b11.length,
      `${e.name}, de ${c.s.name} (${e.crew.length} colonos, ${kids.length} criança(s) de fora do refúgio), com o alarme da cidade aceso e ${hid.length} criança(s) no refúgio da caverna: ${taken.length ? `LEVOU ${taken.length} escondida(s) (${taken.slice(0, 3).map(v => `${v.name}, ${v.age | 0} anos, agora ${tk(v)}`).join('; ')})` : 'nenhuma escondida levada'}; ${still} de ${hid.length} ainda no refúgio; ${parents.length ? `${parents.length} com o pai ou a mãe na colônia, SEM elas` : 'as famílias delas ficaram inteiras'}${b11.length ? '; o verificador: ' + b11[0] : ''}`);
  }
}
// ---------------- m12: the choices of war take the hands free (L-461) ----------------
// (the call to the war cannot wait (3 or more), but the levy, the band, the crews of a raid by sea and of a fleet are chosen
// before it, among many — as the voyages' crews, L-458. The premise, by rule: a people with a quay — the most peopled —, at
// war with the first other one; every free grown warrior and hunter of it, the ones every choice of war takes first, with a
// purchase on its way home in the arms; and a builder of the town of the quay with the material on its way to a work (a leg,
// G.Act.leg). Then each choice, from the same world: none of the chosen has busy hands, and the choice still happens)
{
  const docksOf = q => G.Naval.docksOf(q.id).filter(d => G.Naval.dockInfo(d).moor).sort((a, b) => a.id - b.id);
  const pickWar = () => { const fs = G.Fac.all().filter(q => q.alive && docksOf(q).length).sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id) || a.id - b.id); const f = fs[0]; const e = f && G.Fac.all().filter(q => q.alive && q !== f).sort((a, b) => a.id - b.id)[0]; return f && e ? { f, e } : null; };
  const atWar = (f, e) => { const rel = G.Fac.rel(f.id, e.id); if (rel && !rel.met) G.Politics.meet(f, e, { quiet: true }); const dp = S.divinePeace; S.divinePeace = 0; G.Politics.declareWar(f, e, 'ambicao'); S.divinePeace = dp; return G.Wars.warOf(f.id, e.id); };
  const loose = o => o.age >= 18 && o.age < 55 && o.hp > 60 && !o.captive && !o.aboard && !o.jail && !o.ug && !o.held && !o.air && o.home && S.buildings.get(o.home) && !(o.carry && o.carry.n > 1e-6) && !(o.task && (o.task.pri || 0) >= 1.5) && !(S.avatar && S.avatar.id === o.id) && !(G.Expe && G.Expe.memberOf(o.id));
  const busyAll = (f, at) => {
    const n = []; for (const v of [...S.villagers.values()].filter(o => G.Fac.idOfV(o) === f.id && (o.role === 'guerreiro' || o.role === 'cacador') && loose(o)).sort((a, b) => a.id - b.id)) { purchase(v); n.push(v); }
    const site = [...S.buildings.values()].filter(x => x.set === at.id && x.type !== 'ruin').sort((p, q) => p.id - q.id)[0];
    const b = [...S.villagers.values()].filter(o => o.set === at.id && o.role !== 'guerreiro' && o.role !== 'cacador' && loose(o)).sort((p, q) => p.id - q.id)[0];
    if (b && site) { Vg.endTask(b); D.make('v:' + b.id, 'wood', 2, { code: 'teste' }); Vg.setTask(b, { type: 'build', id: site.id, pri: 1, st: 2, mat: 'wood' }); }
    return { n: n.length, leg: b && A.leg(b) ? b : null };
  };
  const hands = v => (v.carry ? `${v.carry.n} de ${v.carry.k}${v.carry.to ? ' para casa' : ' para a obra'}` : 'mãos vazias');
  const CHOICES = [
    ['a leva', (f, e, w, d, at) => { const a = G.Wars.mobilizeAt(w, f, G.Fac.capitalOf(e.id), at, [at.cx, at.cy], 60, {}); return a ? a.members.slice() : null; }],
    ['a tripulação da frota', (f, e, w, d) => { D.make('f:' + f.id, 'wood', 60, { code: 'm12-frota', part: true }); const s = G.Naval.spawn('guerra', f, d); const fl = s && G.Fleets.form(f, w, 'patrulha', [s], { dock: d.id }); return fl ? s.crew.slice() : null; }],
    ['o ataque pelo mar', (f, e) => { D.make('f:' + f.id, 'wood', 60, { code: 'm12-mar', part: true }); for (const o of G.Naval.shipsOf(f.id, 'transporte')) G.Naval._remove(o); const sh = G.Naval.launchRaid(f, e, { fury: true }); return sh ? sh.crew.slice() : null; }],
    ['o bando por terra', (f, e) => { f.attackCD = 0; f.truce = 0; e.truce = 0; const b = G.War.launch(f, e, { fury: true }); const sh = b && b.naval && S.ships.find(s => s.id === b.ship); return b ? (sh ? sh.crew.slice() : b.members.slice()) : null; }],
  ];
  const lines = []; let okAll = true;
  for (const [what, fn] of CHOICES) {
    fresh(); const pw = pickWar(); const w = pw && atWar(pw.f, pw.e); const d = pw && docksOf(pw.f)[0]; const at = d && S.settlements.get(d.set);
    if (!pw || !w || !at) { okAll = false; lines.push(`${what}: SEM o caso (nenhum povo com cais em guerra)`); continue; }
    const p = busyAll(pw.f, at); const ids = fn(pw.f, pw.e, w, d, at);
    const busy = (ids || []).map(id => S.villagers.get(id)).filter(v => v && Vg.handsBusy(v));
    const legIn = !!(p.leg && ids && ids.includes(p.leg.id));
    const good = !!ids && ids.length > 0 && !busy.length && !legIn && p.n > 0 && !!p.leg;
    if (!good) okAll = false;
    lines.push(`${what}: ${ids ? `${ids.length} escolhidos` : 'NÃO saiu'}, ${busy.length ? `${busy.length} COM AS MÃOS OCUPADAS (${busy.slice(0, 2).map(v => `${v.name}, ${hands(v)}, agora ${tk(v)}`).join('; ')})` : 'nenhum com as mãos ocupadas'}${legIn ? ` — o da obra ESCOLHIDO (${p.leg.name}, ${hands(p.leg)}, agora ${tk(p.leg)})` : ''}`);
  }
  const b12 = bad();
  ok('m12 as escolhas da guerra com as mãos livres', okAll && !b12.length, `os guerreiros e caçadores do povo com uma compra para casa, e um construtor com o material a caminho da obra: ${lines.join(' · ')}${b12.length ? '; o verificador: ' + b12[0] : ''}`);
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `MAOS: FALHOU (${fails.join(', ')})` : 'MAOS: ok');
process.exit(fails.length ? 1 : 0);
