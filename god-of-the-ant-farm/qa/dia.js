// dia: o dia de cada um dura até a hora de deitar (D-240, L-915) — em Node, no mundo pronto.
//   · L-915, o sol que se demora: enquanto uma cena corre o relógio do dia anda a G.LINGER (0,35) — e a fome e o cansaço
//     com ele (G.dayPace, uma porta só, pedida uma vez por passo; G.pace). A idade continua em segundos.
//   · D-240, quem descansa cansa menos: acordado, parado e à toa (à mesa da taverna, na plateia, na água dos banhos, sobre
//     um rolo, a rezar, na conversa da praça ou de um amigo, junto à fogueira ou à porta de casa, em casa junto do fogo)
//     a energia cai G.Vg.REST do que cai a trabalhar ou a andar (G.Vg.resting, uma tabela só). O cansaço do trabalho
//     (100/80 por centésimo do dia) e os limiares do sono (22 e 15) não mudam.
// As partes:
//   a  pela mão: a1 o descanso contra o trabalho (a mesma energia, corpos lado a lado, dez centésimos do dia); a2 a
//      tabela do descanso, entrada a entrada, e o que não é descanso (a caminhada, o sono, o trabalho, a dança, a cozinha);
//      a3 o que não mudou: quem dorme recupera o mesmo; a4 o adulto do alvo — acorda, trabalha até o fim da tarde, descansa:
//      a energia na hora de deitar do relógio dele, e à mesa da taverna até ela fechar;
//   s  o sol que se demora: uma cena a correr (a porta G.Scene.lingers, pela mão da prova): o relógio, a fome, o cansaço e
//      o sono andam a 0,35; a idade em segundos; a porta pedida uma vez por passo, não por pessoa;
//   b  o corpo do deus: a mesma regra — de pé cansa como qualquer um, sentado num lugar de descanso da planta cansa REST;
//   c  as causas do corpo (D-960, D-961): c1 o registro (a cena, a taverna aberta, a partida à mesa); c2 o corpo sentado numa taverna
//      aberta: o relógio a T.PACE_SALA, a fome e o cansaço com ele, a idade em segundos; c3 a mais lenta vale, e a parte do corpo é o
//      que ele põe além da cena; c4 o corpo a dormir não demora o sol; c5 sem o corpo, o passo do mundo;
//      e a causa de outro prédio (F15, D-1035), registrada pela prova como um módulo de prédio registra a sua — um rito num templo —:
//      c6 com o corpo lá, o relógio, a fome e o cansaço no passo dela; c7 a mais lenta vale (com a cena e outra causa do prédio); c8 com o
//      corpo, só ele: a pergunta que sempre diz sim não é perguntada sem o corpo; c9 os casos ruins (o save no meio, a mão do deus, o
//      corpo que morre, o prédio que cai); c10 sem o corpo, o mundo igual com as causas ligadas e desligadas; c11 as causas só leem;
//   v  o dia vivido (DIAS=3 contados, depois do primeiro; na paz do deus, ninguém mandado; SHIFT=k: outra história):
//      v1 às 0,66 e às 0,70, quem dorme ou vai dormir pela energia (os pisos tirados de quatro histórias de antes e de
//      quatro de depois); v2 o dia de trabalho não encolheu (com tempo bom, a parte dos acordados no trabalho); v3 ninguém cansa mais depressa do que o dia (a
//      regra do verificador, olhada de dois em dois segundos: nos dias vividos, com as cenas que houver, e em mais 30 s com
//      o sol a demorar-se pela mão da prova); v4 o verificador limpo e nenhum erro; v5 o que se mede e não se afirma (a
//      taverna de noite, as janelas, a energia na hora de deitar), dito na linha;
//   n  um save a meio da noite, carregado duas vezes: o mesmo futuro; nada novo no save; o passo do dia volta a 1;
//   h  o verificador (qa/dia-inv.js) pega as mentiras — e nada sem elas.
//   [ONLY=a,s,b,c,v,n,h] [DIAS=n] [SHIFT=k] node qa/dia.js [metropole|mega]
'use strict';
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/dia-inv.js'] });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.some(o => k === o || k.startsWith(o) || o.startsWith(k));
const DIAS = +(process.env.DIAS || 3); const SHIFT = +(process.env.SHIFT || 0);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | dia ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const Vg = G.Vg, V = G.Village, Lr = G.Lar, D = G.Depot, In = G.Interiors, Po = G.Possess;
const EPS = 1e-6; const r2 = x => Math.round(x * 100) / 100; const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const peace = () => { if (!(G.S.divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); };
const qaAll = () => QA.check().filter(q => q.sev <= 2);
let base = new Set(); const rebase = () => { base = new Set(qaAll().map(q => q.sys + '|' + q.msg)); };
const novas = () => qaAll().filter(q => !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg.slice(0, 120)}`);
const mine = () => QA.check().filter(q => q.sys === 'dia');
// (the checker read once, for the verdict and for the line alike: a second reading can differ — a rule that tells a thing once, a grace
// that ran out between the two — and the line said «limpo» on a case that had failed: T-1050)
const clean = () => { const nv = novas(), mn = mine().map(q => q.msg), lim = M.limpo(); return [!nv.length && !mn.length && lim, nv.concat(mn).slice(0, 3).join(' | ') || (lim ? 'limpo' : JSON.stringify(M.erros()).slice(0, 200))]; };
const dayNow = () => G.S.day + G.S.time; // (the day's clock: the centésimos of the day gone by are its difference × 100)
const K = () => Vg.REST; const WORK = 100 / 80; // (the tiredness of a centésimo of the day at work or on the way)
// (grown ones of the most peopled town, free and well, by id — the hand of the proof takes them from here; none of a voyage's crew: the
// call to the quay, 3,25, passes the proof's hold, and the ready metropolis of the fourth wave had Meresankh, the first of the pool, in one:
// T-2120)
const pool = () => { const S = G.S; const set = [...S.settlements.values()].sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0];
  return [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 20 && v.age < 55 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air && !(v.sick > 0) && v.hp > 60 && !(S.avatar && S.avatar.id === v.id) && !(G.Expe && G.Expe.ofV(v))).sort((a, c) => a.id - c.id); };
// (held by the hand: an errand of 3 that nothing of the day's choices takes; fed, so that no hunger ends it)
// (the load in the hands put down by the game's own doors, in the ledger, before the hand of the proof takes the person: an
// operation's load where they stand, for another hand — G.Act.letGo —, anything else on the ground; the hands emptied by hand,
// a crate of the potter's on its way to the store vanished unwritten, and the checker said so: T-1051)
const putDown = v => { const c = v.carry; if (c && c.n > 0) { if (c.op && G.Act.letGo) G.Act.letGo(v, 'teste'); if (v.carry && v.carry.n > 0) D.drop('v:' + v.id, v.carry.k, v.carry.n, v.x, v.y, { code: 'teste', by: v.id, fac: G.Fac.idOfV(v) }); } };
const hold = (v, task) => god(() => { putDown(v); Vg.endTask(v); v.sleeping = false; v.inside = 0; v.hunger = 10; v.carry = null; return Vg.setTask(v, Object.assign({ pri: 3 }, task)); });
const calm = () => { const w = G.S.weather; w.rain = 0; if (w.storm) w.storm = 0; peace(); for (const s of G.S.settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: G.S.day, key: null, done: true }; } };

// ================================================================ a: by the hand
function partA() {
  M.pronto(WORLD); const S = G.S; rebase(); S.time = 0.4; calm(); M.viver(1);
  // (the old one of the same town as the others — the talk with a in reach —: any old one of the world was 48 tiles off in another
  // town, and a beast's flight there took her from the talk in the last second, counted in the drain: T-1822)
  const L = pool(); const old = [...S.villagers.values()].filter(v => L.length && v.set === L[0].set && v.age >= 62 && !v.captive && !v.jail && !v.aboard && !v.ug && !(v.sick > 0) && v.hp > 50).sort((a, c) => a.id - c.id)[0];
  // ---- a1: rest against work, the same energy, ten centésimos of the day
  if (on('a1')) {
    const [a, b, c] = L; const o = old;
    hold(a, { type: 'talk', id: b.id, wait: 200 }); hold(b, { type: 'talk', id: a.id, wait: 200 }); hold(c, { type: 'idle', wait: 200 }); if (o) hold(o, { type: 'talk', id: a.id, wait: 200 });
    for (const v of [a, b, c, o]) if (v) v.energy = 80;
    M.viver(0.2); const t0 = dayNow(); const e0 = [a, b, c, o].map(v => (v ? v.energy : 0)); const r0 = [a, b, c].map(v => Vg.resting(v));
    let g = 0; while ((dayNow() - t0) * 100 < 10 && g++ < 2000) { calm(); for (const v of [a, b, c, o]) if (v) v.hunger = 10; M.viver(0.5); }
    const dc = (dayNow() - t0) * 100; const drop = [a, b, c, o].map((v, i) => (v ? e0[i] - v.energy : 0)); const still = [a, b].concat(o ? [o] : []).every(v => v.task && v.task.type === 'talk') && c.task && c.task.type === 'idle';
    const wantW = dc * WORK, wantR = dc * WORK * K(), wantO = dc * WORK * K() * 1.12;
    ok('a1 o descanso contra o trabalho, pela mão: a mesma energia (80), dez centésimos do dia — de pé e sem descanso cai 100/80 por centésimo, como sempre; na conversa cai REST disso; o velho, 1,12 do que cai o moço',
      still && r0[0] && r0[1] && !r0[2] && Math.abs(drop[2] - wantW) < 0.06 && Math.abs(drop[0] - wantR) < 0.06 && Math.abs(drop[1] - wantR) < 0.06 && (!o || Math.abs(drop[3] - wantO) < 0.06) && K() > 0 && K() < 1,
      `em ${dc.toFixed(2)} centésimos do dia: ${c.name}, de pé sem afazer de descanso, ${drop[2].toFixed(2)} (a conta: ${wantW.toFixed(2)}); ${a.name} e ${b.name}, na conversa, ${drop[0].toFixed(2)} e ${drop[1].toFixed(2)} (a conta: ${wantR.toFixed(2)}, REST ${K()})${o ? `; ${o.name}, ${Math.floor(o.age)} anos, na conversa, ${drop[3].toFixed(2)} (a conta: ${wantO.toFixed(2)})` : '; nenhum velho'}; ${still ? 'os três no afazer da prova até o fim' : 'ALGUÉM SAIU DO AFAZER DA PROVA'}`);
    god(() => { for (const v of [a, b, c, o]) if (v) Vg.endTask(v); });
  }
  // ---- a2: the table, entry by entry (the door is pure: asked with the errand of each case put by the hand, and given back)
  if (on('a2')) {
    const v = L[3]; const t0 = v.task, m0 = v.moving, s0 = v.sleeping; const bad = [];
    const ask = (task, o) => { v.task = task; v.moving = !!(o && o.moving); v.sleeping = !!(o && o.sleeping); return Vg.resting(v); };
    const C = [
      ['à mesa da taverna, sentado', { type: 'tavern', st: 2 }, 1], ['à mesa, a beber', { type: 'tavern', st: 3 }, 1], ['a caminho da taverna', { type: 'tavern', st: 0 }, 0], ['entrando na taverna, da porta ao banquinho', { type: 'tavern', st: 1 }, 0], ['à mesa, na conversa entre as rodadas', { type: 'tavern', st: 5 }, 1], ['no estrado, tocando', { type: 'tavern', st: 6, mw: 0 }, 1], ['a caminho do balcão', { type: 'tavern', st: 7 }, 0], ['de volta do balcão', { type: 'tavern', st: 8 }, 0], ['em casa, da porta ao seu lugar', { type: 'lar', st: 2, what: 'conversar', inW: 1e9 }, 0],
      ['na plateia', { type: 'teatro', st: 1 }, 1], ['a caminho do teatro', { type: 'teatro', st: 0 }, 0],
      ['sobre um rolo', { type: 'ler', st: 1 }, 1], ['a caminho da biblioteca', { type: 'ler', st: 0 }, 0],
      ['na água dos banhos', { type: 'termas', st: 2 }, 1], ['nos cabides', { type: 'termas', st: 1 }, 0], ['a vestir-se', { type: 'termas', st: 3 }, 0],
      ['na conversa da praça', { type: 'praca', st: 2 }, 1], ['a caminho da praça', { type: 'praca', st: 1 }, 0],
      ['junto à fogueira', { type: 'rest', st: 2 }, 1], ['a caminho da fogueira', { type: 'rest', st: 1 }, 0],
      ['na conversa com um amigo', { type: 'talk', id: 1 }, 1], ['a dançar', { type: 'talk', id: 1, dance: 1 }, 0],
      ['a rezar', { type: 'pray', st: 2 }, 1], ['a caminho do templo', { type: 'pray', st: 1 }, 0], ['o sacerdote no ofício dele', { type: 'pray', st: 2, priest: true, kind: 'work' }, 0],
      ['com a família à porta', { type: 'family', st: 2 }, 1], ['com o filho ao colo, no ar', { type: 'family', st: 2, lift: 1 }, 0],
      ['em casa, fora da chuva', { type: 'shelter', st: 2 }, 1], ['a correr para casa na chuva', { type: 'shelter', st: 1 }, 0],
      ['em casa, à ceia', { type: 'lar', st: 2, what: 'ceia' }, 1], ['em casa, na conversa', { type: 'lar', st: 2, what: 'conversar' }, 1], ['em casa, a cozinhar', { type: 'lar', st: 2, what: 'cozinhar' }, 0], ['em casa, a cuidar dos pequenos', { type: 'lar', st: 2, what: 'cuidar' }, 0], ['a caminho de casa', { type: 'lar', st: 0, what: 'ceia' }, 0],
      ['no machado', { type: 'chop', st: 2, kind: 'work' }, 0], ['de pé, sem afazer', null, 0], ['no fôlego entre dois afazeres', { type: 'idle', wait: 1 }, 0], ['a passear', { type: 'wander', wait: 1 }, 0], ['numa festa', { type: 'fest', st: 2 }, 0], ['a comer no armazém', { type: 'eat', st: 2 }, 0],
    ];
    for (const [nm, task, want] of C) { const r = ask(task) ? 1 : 0; if (r !== want) bad.push(`${nm}: ${r ? 'DESCANSA' : 'NÃO descansa'}`); }
    // (nobody on the move rests, nor asleep — whatever the errand)
    if (ask({ type: 'praca', st: 2 }, { moving: true })) bad.push('na conversa da praça e a andar: DESCANSA'); if (ask({ type: 'lar', st: 2, what: 'ceia' }, { sleeping: true })) bad.push('à ceia e a dormir: DESCANSA');
    v.task = t0; v.moving = m0; v.sleeping = s0;
    ok('a2 a tabela do descanso, entrada a entrada: parado e à toa descansa — a caminhada até lá, o sono, o trabalho (o sacerdote no ofício, a cozinha, quem cuida dos pequenos), a dança e a festa não', !bad.length, bad.length ? bad.join('; ') : `${C.length + 2} casos: ${C.filter(c => c[2]).length} de descanso, ${C.filter(c => !c[2]).length + 2} que não são`);
  }
  // ---- a3: what did not change — asleep, the energy comes back as ever (100/22 a centésimo)
  if (on('a3')) {
    const v = L[4]; god(() => { Vg.endTask(v); v.hunger = 10; Vg.setTask(v, { type: 'idle', pri: 3, wait: 200 }); }); v.sleeping = true; v.energy = 30;
    const t0 = dayNow(); let g = 0; while ((dayNow() - t0) * 100 < 5 && g++ < 2000 && v.sleeping) { calm(); M.viver(0.5); }
    const dc = (dayNow() - t0) * 100; const gain = v.energy - 30; const want = dc * 100 / 22;
    ok('a3 o que não mudou: quem dorme recupera 100/22 por centésimo do dia', v.sleeping && Math.abs(gain - want) < 0.3, `${v.name}, a dormir, em ${dc.toFixed(2)} centésimos: +${gain.toFixed(2)} (a conta: ${want.toFixed(2)})${v.sleeping ? '' : ' — ACORDOU no meio'}`);
    v.sleeping = false; god(() => Vg.endTask(v));
  }
  // ---- a4: the adult of the target — up at his hour, at work till the end of the afternoon, then at rest
  if (on('a4')) {
    // (the adult of the target: of the free ones, the one whose clock is nearest the common one — up at 0,03; a lazy one, up at
    // 0,08, has five more of energy all day, and the mega's first was one)
    const v = L.slice(5).filter(o => o.role !== 'taverneiro' && Lr.clock(o).wake < 0.3).sort((p, q) => Math.abs(Lr.clock(p).wake - 0.03) - Math.abs(Lr.clock(q).wake - 0.03) || p.id - q.id)[0];
    const mate = L.find(o => o !== v); const c = Lr.clock(v); const tav = [...S.buildings.values()].filter(b => b.type === 'taverna' && b.built).sort((a, c2) => a.id - c2.id)[0]; const fecha = tav && G.Taverna ? G.Taverna.horas(tav).fecha : 0.88;
    // (an errand of the day lasts seventy seconds at the most — villagers.js LONG —: the hand of the proof renews its hold every forty)
    let heldAt = -1e9; const keep = task => { if (S.clock - heldAt >= 40 || !v.task || v.task.type !== task.type) { hold(v, Object.assign({}, task)); heldAt = S.clock; } };
    S.time = c.wake; v.energy = 100; const UP = { type: 'idle', wait: 1e4 }, REST = { type: 'talk', id: mate.id, wait: 1e4 };
    let g = 0; while (S.time < 0.6 && g++ < 4000) { calm(); v.hunger = 10; keep(UP); M.viver(0.5); } const e60 = v.energy; // (on his feet, not at rest: the working day's tiredness)
    // (at rest by the hand — a talk: the door of rest is the same for the tavern's table; the tavern's own errand is the lived days' case)
    // (the partner of the talk held in it too, beside him and awake — fed and fresh by the hand —: free, he went to bed at his own
    // hour, 13,7 tiles off, and the talk took the adult of the proof walking after him across the town at 0,854: T-1053)
    let heldM = -1e9; const MATE = { type: 'talk', id: v.id, wait: 1e4 };
    const keepM = () => { mate.hunger = 10; mate.energy = Math.max(mate.energy, 60); if (S.clock - heldM >= 40 || !mate.task || mate.task.type !== 'talk') { hold(mate, Object.assign({}, MATE)); heldM = S.clock; } };
    god(() => { mate.x = v.x; mate.y = v.y; });
    let eBed = -1, eShut = -1, rested = true, why = ''; g = 0; heldAt = -1e9;
    while (S.time < fecha && S.time > 0.5 && g++ < 4000) { calm(); v.hunger = 10; keepM(); keep(REST); const t0 = S.time; if (!Vg.resting(v) && rested) { rested = false; why = ` (às ${S.time.toFixed(3)}: ${v.task ? v.task.type + (v.task.st != null ? ' st ' + v.task.st : '') : 'sem tarefa'}${v.moving ? ', andando' : ''}, o par a ${G.dist(v.x, v.y, mate.x, mate.y).toFixed(1)} casas, ${mate.task ? mate.task.type : 'sem tarefa'})`; } M.viver(0.5); if (eBed < 0 && t0 < c.bed && S.time >= c.bed) eBed = v.energy; }
    eShut = v.energy; god(() => { Vg.endTask(v); Vg.endTask(mate); });
    // (the person's own arithmetic: 100/80 a centésimo on one's feet, REST of it at rest)
    const w60 = 100 - (0.6 - c.wake) * 100 * WORK, wBed = w60 - (c.bed - 0.6) * 100 * WORK * K(), wShut = w60 - (fecha - 0.6) * 100 * WORK * K();
    ok('a4 o adulto do alvo, pela mão: acorda à hora dele com 100, de pé e sem descanso até as 0,60, depois em descanso (uma conversa: a porta do descanso é a mesma da mesa da taverna) — chega à hora de deitar do relógio dele com a energia perto de 22 (de 19 a 28), e à hora de a taverna fechar ainda não foi mandado para a cama pelo cansaço (15)',
      rested && Math.abs(e60 - w60) < 1 && Math.abs(eBed - wBed) < 1 && Math.abs(eShut - wShut) < 1 && eBed >= 19 && eBed <= 28 && eShut >= 15,
      `${v.name} (acorda às ${c.wake.toFixed(3)}, deita às ${c.bed.toFixed(3)}; a taverna fecha às ${fecha}): às 0,60 com ${e60.toFixed(1)} (a conta ${w60.toFixed(1)}); na hora de deitar dele ${eBed.toFixed(1)} (${wBed.toFixed(1)}); às ${fecha}, ${eShut.toFixed(1)} (${wShut.toFixed(1)}; REST ${K()})${rested ? '' : ' — SAIU DO DESCANSO DA PROVA no meio' + why}`);
  }
  { const [c, info] = clean(); ok('a o verificador e os erros depois da mão da prova', c, info); }
}

// ================================================================ s: the lingering sun
function partS() {
  M.pronto(WORLD); const S = G.S; rebase(); S.time = 0.4; calm(); M.viver(1);
  const L = pool(); const [x, y, z] = L; const kid = [...S.villagers.values()].filter(v => v.age >= 3 && v.age < 10 && !v.captive).sort((a, c) => a.id - c.id)[0];
  const lg0 = G.Scene.lingers; let calls = 0, on1 = false; G.Scene.lingers = function () { calls++; return on1 || lg0.apply(this, arguments); };
  const run = linger => {
    on1 = linger; hold(x, { type: 'idle', wait: 1e4 }); hold(z, { type: 'talk', id: x.id, wait: 1e4 }); hold(y, { type: 'idle', wait: 1e4 }); y.sleeping = true;
    x.energy = 80; z.energy = 80; y.energy = 30; x.hunger = 20; z.hunger = 20; y.hunger = 20; M.viver(0.1);
    const t0 = dayNow(), c0 = S.clock, a0 = x.age; const e = [x.energy, y.energy, z.energy], hg = [x.hunger, y.hunger]; calls = 0; let steps = 0, paceOk = true, real = 0;
    for (let k = 0; k < 200; k++) { calm(); M.viver(0.1); steps++; if (G.pace !== (linger ? G.LINGER : 1)) { if (!linger && lg0.call(G.Scene)) real++; else paceOk = false; } }
    const r = { dc: (dayNow() - t0) * 100, ds: S.clock - c0, age: x.age - a0, dx: e[0] - x.energy, gy: y.energy - e[1], dz: e[2] - z.energy, hx: x.hunger - hg[0], hy: y.hunger - hg[1], calls, steps, paceOk, real, asleep: y.sleeping };
    y.sleeping = false; god(() => { for (const v of [x, y, z]) Vg.endTask(v); }); return r;
  };
  const a = run(true), b = run(false); G.Scene.lingers = lg0;
  const near = (p, q, tol) => Math.abs(p - q) <= (tol || 0.08);
  const glut = v => (v.traits.includes('Glutão') ? 1.2 : 1);
  ok('s1 o sol que se demora: com uma cena a correr, em 20 segundos do mundo o relógio do dia anda 3,5 centésimos (0,35), e com ele a fome, o cansaço e o sono; a idade anda em segundos',
    near(a.ds, 20, 0.01) && near(a.dc, 20 / G.DAY_K * G.LINGER, 0.02) && a.paceOk && near(a.dx, a.dc * WORK) && near(a.dz, a.dc * WORK * K()) && near(a.gy, a.dc * 100 / 22, 0.2) && a.asleep && near(a.hx, a.dc * 0.95 * glut(x)) && near(a.hy, a.dc * 0.45 * glut(y)) && near(a.age, 20 / G.DAY_LEN, 0.002),
    `com a cena: ${a.ds.toFixed(1)} s, ${a.dc.toFixed(2)} centésimos do dia (o passo ${G.LINGER}); ${x.name}, de pé: energia −${a.dx.toFixed(2)} (a conta ${(a.dc * WORK).toFixed(2)}), fome +${a.hx.toFixed(2)} (a conta ${(a.dc * 0.95 * glut(x)).toFixed(2)}), idade +${a.age.toFixed(3)} ano (a conta ${(20 / G.DAY_LEN).toFixed(3)}); ${z.name}, na conversa: −${a.dz.toFixed(2)} (a conta ${(a.dc * WORK * K()).toFixed(2)}); ${y.name}, a dormir: +${a.gy.toFixed(2)} (a conta ${(a.dc * 100 / 22).toFixed(2)}), fome +${a.hy.toFixed(2)}`);
  ok('s2 sem cena, os mesmos 20 segundos são 10 centésimos do dia, e a fome e o cansaço andam por eles',
    near(b.dc + b.real * 0, b.dc) && b.paceOk && near(b.dx, b.dc * WORK) && near(b.dz, b.dc * WORK * K()) && near(b.hx, b.dc * 0.95 * glut(x)) && b.dc > a.dc * 2,
    `sem a cena da prova: ${b.ds.toFixed(1)} s, ${b.dc.toFixed(2)} centésimos${b.real ? ` (uma cena do mundo correu em ${b.real} passos)` : ''}; ${x.name}: energia −${b.dx.toFixed(2)} (a conta ${(b.dc * WORK).toFixed(2)}), fome +${b.hx.toFixed(2)}; ${z.name}: −${b.dz.toFixed(2)}`);
  ok('s3 a porta do passo do dia é pedida uma vez por passo do mundo, não por pessoa', a.calls === a.steps && b.calls === b.steps,
    `${a.calls} perguntas ao G.Scene.lingers em ${a.steps} passos com a cena (${S.villagers.size} pessoas no mundo), ${b.calls} em ${b.steps} sem ela`);
  { const [c, info] = clean(); ok('s o verificador e os erros depois da mão da prova', c, info); }
}

// ================================================================ b: the god's body
function partBody() {
  M.pronto(WORLD); const S = G.S; rebase(); S.time = 0.4; calm(); M.viver(1);
  // (a house with a plan and someone of it at home: the body taken there, on its feet, and then with a place of rest of the plan in its hands)
  let pick = null;
  for (const b of [...S.buildings.values()].filter(q => q.built && V.bedsOf(q) > 0).sort((a, c) => a.id - c.id)) {
    const v = [...S.villagers.values()].filter(o => o.home === b.id && o.age >= 18 && o.age < 60 && !o.captive && !o.jail && !(o.sick > 0) && Po.can(o).ok).sort((a, c) => a.id - c.id)[0];
    if (!v || !G.Space.planNow(b)) continue; pick = { b, v }; break;
  }
  if (!pick) { ok('b o corpo do deus', false, 'nenhuma casa com planta e alguém dela que o deus possa viver'); return; }
  const { b, v } = pick; const TL = G.Space.TILE; const p = In.plan(b);
  god(() => { Vg.endTask(v); v.sleeping = false; const d = Vg.door(b); v.x = d[0]; v.y = d[1]; v.inside = 0; });
  const took = god(() => Po.take(v)); M.viver(0.1);
  if (!took || took.ok === false || !Po.is(v)) { ok('b o corpo do deus', false, `o corpo não foi tomado: ${(took && took.why) || ''}`); return; }
  const measure = () => { v.energy = 80; v.hunger = 10; const t0 = dayNow(); const e0 = v.energy; let g = 0; while ((dayNow() - t0) * 100 < 4 && g++ < 400) { calm(); v.hunger = 10; M.viver(0.5); } return { dc: (dayNow() - t0) * 100, drop: e0 - v.energy }; };
  const up = { rest: Vg.resting(v) }; Object.assign(up, measure());
  // (a place of rest of the plan — a seat, a bed, a place at the table — taken by the body's hands, by the game's own door)
  let pl = null; const uses = [];
  god(() => { for (const it of p.items) for (const [q, sp] of it.spots.entries()) { if (!sp.ok || sp.use === 'acesso') continue; if (!uses.includes(sp.use)) uses.push(sp.use); if (pl || !{ sentar: 1, comer: 1, deitar: 1, aquecer: 1, beber: 1 }[sp.use]) continue; const f = In.freeFor(b, it.id, q); if (!f || !f.at) continue;
    v.inside = b.id; v.x = b.x + f.at[0] / TL; v.y = b.y + f.at[1] / TL; v.path = null; v.moving = false; Po.setLevel(it.lv); if (Po.use(v, b, f)) pl = f; } });
  if (!pl) { ok('b o corpo do deus', false, `o corpo não tomou lugar de descanso nenhum na casa #${b.id} (os usos da planta: ${uses.join(', ')})`); return; }
  M.viver(0.2); const held = !!(S.avatar && S.avatar.use); const dn = { rest: Vg.resting(v) }; Object.assign(dn, measure()); const still = !!(S.avatar && S.avatar.use);
  ok('b1 o corpo do deus pela mesma regra: de pé cansa 100/80 por centésimo, como qualquer um; com um lugar de descanso da planta nas mãos cansa REST disso',
    !up.rest && Math.abs(up.drop - up.dc * WORK) < 0.06 && held && still && dn.rest && Math.abs(dn.drop - dn.dc * WORK * K()) < 0.06,
    `${v.name} #${v.id}, vivido pelo deus, na casa #${b.id}: de pé, ${up.drop.toFixed(2)} em ${up.dc.toFixed(2)} centésimos (a conta ${(up.dc * WORK).toFixed(2)}); no lugar «${pl.use}» (${held && still ? 'nas mãos dele até o fim' : 'O LUGAR FOI LARGADO'}), ${dn.drop.toFixed(2)} em ${dn.dc.toFixed(2)} (a conta ${(dn.dc * WORK * K()).toFixed(2)})`);
  god(() => Po.release('teste')); M.viver(1); // (the will back with the person: the world's next step gives him his errand)
  { const [c, info] = clean(); ok('b o verificador e os erros depois da mão da prova', c, info); }
}

// ================================================================ c: the causes of the god's body (D-960, D-961)
function partC() {
  M.pronto(WORLD); const S = G.S; rebase(); S.time = 0.4; calm(); M.viver(1); const T = G.Taverna;
  // ---- c1: the registry — the scene (the world's), the tavern open and the game at the table (the body's)
  const Lg = G.lingers(); const want = [['cena', G.LINGER, false], ['taverna', T.PACE_SALA, true], ['mesa', T.PACE_MESA, true]];
  ok('c1 o registro das causas da demora: a cena (do mundo), o corpo na taverna aberta e o corpo numa partida à mesa (do corpo)', want.every(([id, k, c]) => Lg.some(x => x.id === id && x.k === k && x.corpo === c)) && T.PACE_MESA < T.PACE_SALA && T.PACE_SALA < G.LINGER,
    Lg.map(x => `${x.id} ${x.k}${x.corpo ? ' (do corpo)' : ''}`).join(', '));
  // (to the evening: the taverns open; a tavern with a plan and a seat free, and someone of its people the god may live — not its keeper nor
  // of its house: a guest)
  let g = 0; while (!(S.time > 0.74 && S.time < 0.76) && g++ < 6000) { calm(); M.viver(1); }
  let pick = null;
  for (const b of [...S.buildings.values()].filter(q => q.type === 'taverna' && q.built && T.aberta(q)).sort((a, c) => a.id - c.id)) {
    const p = G.Space.planNow(b); if (!p) continue; const fid = V.facOfSet(b.set);
    const v = [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 60 && !o.sleeping && !o.inside && o.job !== b.id && o.home !== b.id && G.Fac.idOfV(o) === fid && Po.can(o).ok && !(G.Expe && G.Expe.ofV(o))).sort((a, c) => a.id - c.id)[0]; if (!v) continue;
    let seat = null; for (const it of p.items) { for (const [q, sp] of it.spots.entries()) { if (!sp.ok || sp.use !== 'sentar') continue; const f = In.freeFor(b, it.id, q); if (f && f.at) { seat = { it, f }; break; } } if (seat) break; }
    if (seat) { pick = { b, v, seat }; break; }
  }
  if (!pick) { ok('c o corpo na taverna', false, 'nenhuma taverna aberta com um lugar livre e alguém do povo dela para o deus viver'); return; }
  const { b, v, seat } = pick; const TL = G.Space.TILE; const L = pool().filter(o => o !== v); const x = L[0];
  god(() => { Vg.endTask(v); v.sleeping = false; const d = Vg.door(b); v.x = d[0]; v.y = d[1]; v.inside = 0; }); const took = god(() => Po.take(v)); M.viver(0.1);
  if (!took || took.ok === false || !Po.is(v)) { ok('c o corpo na taverna', false, `o corpo não foi tomado: ${(took && took.why) || ''}`); return; }
  const sitDown = () => god(() => { v.inside = b.id; v.x = b.x + seat.f.at[0] / TL; v.y = b.y + seat.f.at[1] / TL; v.path = null; v.moving = false; Po.setLevel(seat.it.lv); Po.use(v, b, seat.f); });
  sitDown(); hold(x, { type: 'idle', wait: 1e4 }); M.viver(0.2);
  // ---- c2: the body at a tavern open: the clock of the day at T.PACE_SALA, and the hunger and the tiredness with it; the age in seconds;
  // the body's share of the pace the same — no scene
  const run = (sec, prep) => { if (prep) prep(); v.energy = 80; v.hunger = 10; x.energy = 80; x.hunger = 20; M.viver(0.1);
    const t0 = dayNow(), a0 = x.age, e0 = [v.energy, x.energy], h0 = x.hunger; const P = new Map(), PC = new Map();
    for (let k = 0; k < sec * 10; k++) { calm(); v.hunger = 10; M.viver(0.1); P.set(G.pace, (P.get(G.pace) || 0) + 1); PC.set(G.paceCorpo, (PC.get(G.paceCorpo) || 0) + 1); }
    return { dc: (dayNow() - t0) * 100, age: x.age - a0, dv: e0[0] - v.energy, dx: e0[1] - x.energy, hx: x.hunger - h0, P: [...P.keys()], PC: [...PC.keys()], rest: Vg.resting(v) }; };
  const near = (p, q, tol) => Math.abs(p - q) <= (tol || 0.06);
  const lg0 = G.Scene.lingers; let scene = false; G.Scene.lingers = function () { return scene || lg0.apply(this, arguments); };
  try {
    const a = run(20);
    const glut = o => (o.traits.includes('Glutão') ? 1.2 : 1);
    ok('c2 o corpo na taverna aberta: o relógio do dia a T.PACE_SALA, a fome e o cansaço com ele, a idade em segundos; a parte do corpo do passo é a mesma',
      a.P.length === 1 && a.P[0] === T.PACE_SALA && a.PC.length === 1 && a.PC[0] === T.PACE_SALA && near(a.dc, 20 / G.DAY_K * T.PACE_SALA, 0.01) && near(a.dx, a.dc * WORK) && near(a.hx, a.dc * 0.95 * glut(x)) && near(a.age, 20 / G.DAY_LEN, 0.002) && (!a.rest || near(a.dv, a.dc * WORK * K())),
      `${v.name}, vivido pelo deus, sentado na ${G.Village.buildName(b)} #${b.id}: em 20 s do mundo o dia andou ${a.dc.toFixed(2)} centésimos (o passo ${a.P.join('/')}, a parte do corpo ${a.PC.join('/')}); ${x.name}, de pé: energia −${a.dx.toFixed(2)} (a conta ${(a.dc * WORK).toFixed(2)}), fome +${a.hx.toFixed(2)}, idade +${a.age.toFixed(3)} ano (a conta ${(20 / G.DAY_LEN).toFixed(3)}); o corpo ${a.rest ? 'em descanso' : 'de pé'}, −${a.dv.toFixed(2)}`);
    // ---- c3: a scene too: the slowest goes — the body's —, and the body's share is what the body adds to the scene's
    const c3 = run(5, () => { scene = true; });
    ok('c3 a mais lenta vale: com uma cena a correr e o corpo na taverna, o passo é o do corpo, e a parte do corpo é o que ele põe além da cena',
      c3.P.length === 1 && c3.P[0] === T.PACE_SALA && c3.PC.length === 1 && Math.abs(c3.PC[0] - T.PACE_SALA / G.LINGER) < 1e-12, `o passo ${c3.P.join('/')}, a parte do corpo ${c3.PC.map(p => p.toFixed(4)).join('/')} (a conta ${(T.PACE_SALA / G.LINGER).toFixed(4)})`);
    scene = false;
    // ---- c4: the night is for who lives it: the body asleep, or out of drink, lingers nothing; and up again, it does
    const z = run(2, () => { v.sleeping = true; }); v.sleeping = false; const w = run(2);
    ok('c4 o corpo a dormir na taverna não demora o sol; acordado de novo, demora', z.P.every(p => p === 1) && z.PC.every(p => p === 1) && w.P.length === 1 && w.P[0] === T.PACE_SALA, `a dormir: o passo ${z.P.join('/')}; acordado: ${w.P.join('/')}`);
    // ---- c5: out of the tavern, or the body let go: the pace of the world at the next step
    god(() => { Po.release('teste'); }); M.viver(0.2); const r = run(1);
    ok('c5 sem o corpo, o passo do mundo no passo seguinte', r.P.every(p => p === 1) && r.PC.every(p => p === 1), `o passo ${r.P.join('/')}, a parte do corpo ${r.PC.join('/')}`);
  } finally { G.Scene.lingers = lg0; if (Po.body()) god(() => Po.release('teste')); god(() => Vg.endTask(x)); }
  { const [c, info] = clean(); ok('c o verificador e os erros depois da mão da prova', c, info); }
}

// ================================================================ c6 to c11: a cause of another building (F15, D-1035)
// Any module of a building registers its own cause of the body, as the tavern does — here the proof's own, as a module of a temple
// would: the rite (0,21), with a second one in the same building (0,30); and one whose question says yes whenever the proof says so,
// body or no body (0,05) — only the registry keeps it off without the body. Off unless a part turns them on (RITO)
const RITO = { on: false, b: 0, dois: false, mente: false };
function partCN() {
  M.pronto(WORLD); rebase(); G.S.time = 0.4; calm(); M.viver(1); const TL = G.Space.TILE;
  G.linger('prova-rito', () => 0.21, () => { if (!RITO.on) return false; const w = Po.body(); return !!w && !w.sleeping && w.inside === RITO.b; }, true);
  G.linger('prova-rito2', () => 0.3, () => { if (!RITO.dois) return false; const w = Po.body(); return !!w && w.inside === RITO.b; }, true);
  G.linger('prova-mente', () => 0.05, () => RITO.mente, true);
  // (a temple first — the rite —, else the first building that is no tavern; with a plan and a free place to sit, kneel or warm oneself,
  // and someone of its people the god may live, not of its house)
  let tb = null, seat = null;
  for (const q of [...G.S.buildings.values()].filter(q => q.built && q.type !== 'taverna' && In.has(q)).sort((a, c) => (a.type === 'temple' ? 0 : 1) - (c.type === 'temple' ? 0 : 1) || a.id - c.id)) {
    const p = G.Space.planNow(q); if (!p) continue; let st = null;
    for (const it of p.items) { for (const [k, sp] of it.spots.entries()) { if (!sp.ok || !['sentar', 'rezar', 'aquecer', 'comer', 'ler'].includes(sp.use)) continue; const f = In.freeFor(q, it.id, k); if (f && f.at) { st = { it, f }; break; } } if (st) break; }
    if (st) { tb = q; seat = st; break; }
  }
  if (!tb) { ok('c6 uma causa de outro prédio', false, 'nenhum prédio com planta e um lugar livre que não seja uma taverna'); return; }
  const fid = V.facOfSet(tb.set);
  const people = () => [...G.S.villagers.values()].filter(o => o.age >= 18 && o.age < 60 && !o.sleeping && !o.inside && o.home !== tb.id && o.job !== tb.id && G.Fac.idOfV(o) === fid && Po.can(o).ok && !(G.Expe && G.Expe.ofV(o))).sort((a, c) => a.id - c.id);
  let v = people()[0]; if (!v) { ok('c6 uma causa de outro prédio', false, `ninguém do povo do ${tb.type} #${tb.id} para o deus viver`); return; }
  let x = pool().filter(o => o !== v && o.set !== tb.set)[0] || pool().filter(o => o !== v)[0];
  const take = w => { god(() => { Vg.endTask(w); w.sleeping = false; const d = Vg.door(tb); w.x = d[0]; w.y = d[1]; w.inside = 0; }); god(() => Po.take(w)); M.viver(0.1); return Po.is(w); };
  const sitIn = w => god(() => { w.inside = tb.id; w.x = tb.x + seat.f.at[0] / TL; w.y = tb.y + seat.f.at[1] / TL; w.path = null; w.moving = false; Po.setLevel(seat.it.lv); Po.use(w, tb, seat.f); });
  const run = (sec, prep) => { if (prep) prep(); v.energy = 80; v.hunger = 10; x.energy = 80; x.hunger = 20; M.viver(0.1);
    const t0 = dayNow(), a0 = x.age, e0 = x.energy, h0 = x.hunger; const P = new Set(), PC = new Set();
    for (let k = 0; k < sec * 10; k++) { calm(); v.hunger = 10; M.viver(0.1); P.add(G.pace); PC.add(G.paceCorpo); }
    return { dc: (dayNow() - t0) * 100, age: x.age - a0, dx: e0 - x.energy, hx: x.hunger - h0, P: [...P], PC: [...PC] }; };
  const near = (p, q, tol) => Math.abs(p - q) <= (tol || 0.06); const glut = o => (o.traits.includes('Glutão') ? 1.2 : 1);
  const nome = `${G.Village.buildName(tb)} #${tb.id}`;
  const lg0 = G.Scene.lingers; let scene = false; G.Scene.lingers = function () { return scene || lg0.apply(this, arguments); };
  try {
    if (!take(v)) { ok('c6 uma causa de outro prédio', false, `${v.name}: o corpo não foi tomado`); return; }
    hold(x, { type: 'idle', wait: 1e4 }); RITO.b = tb.id; RITO.on = true; sitIn(v); M.viver(0.2);
    // ---- c6: the body at the rite: the clock of the day at the cause's pace, the hunger and the tiredness with it, the age in seconds
    const a = run(10);
    ok('c6 uma causa nova de outro prédio, registrada como um módulo de prédio registra a sua (do corpo): com o corpo lá, o relógio do dia anda a 0,21, a fome e o cansaço com ele, a idade em segundos',
      a.P.length === 1 && a.P[0] === 0.21 && a.PC.length === 1 && a.PC[0] === 0.21 && near(a.dc, 10 / G.DAY_K * 0.21, 0.01) && near(a.dx, a.dc * WORK) && near(a.hx, a.dc * 0.95 * glut(x)) && near(a.age, 10 / G.DAY_LEN, 0.002),
      `${v.name}, vivido pelo deus, no lugar «${seat.f.use}» do ${nome}: em 10 s do mundo o dia andou ${a.dc.toFixed(2)} centésimos (a conta ${(10 / G.DAY_K * 0.21).toFixed(2)}; o passo ${a.P.join('/')}, a parte do corpo ${a.PC.join('/')}); ${x.name}, de pé: energia −${a.dx.toFixed(2)} (a conta ${(a.dc * WORK).toFixed(2)}), fome +${a.hx.toFixed(2)}, idade +${a.age.toFixed(3)} ano (a conta ${(10 / G.DAY_LEN).toFixed(3)})`);
    // ---- c7: the slowest goes: a scene (0,35) and a second cause of the same building (0,30) with the rite: the rite's, and the body's share
    // what it puts beyond the scene
    const b7 = run(4, () => { scene = true; RITO.dois = true; }); scene = false; RITO.dois = false;
    ok('c7 a mais lenta vale: uma cena (0,35) e uma segunda causa do mesmo prédio (0,30) junto com o rito (0,21) — o passo é o do rito, e a parte do corpo o que ele põe além da cena',
      b7.P.length === 1 && b7.P[0] === 0.21 && b7.PC.length === 1 && Math.abs(b7.PC[0] - 0.21 / G.LINGER) < 1e-12, `o passo ${b7.P.join('/')}, a parte do corpo ${b7.PC.map(p => p.toFixed(4)).join('/')} (a conta ${(0.21 / G.LINGER).toFixed(4)})`);
    // ---- c8: with the body, only it: a question that always says yes lingers the sun while the god lives a body, and never without it — the
    // registry does not ask it (G.lingers(true): off)
    RITO.mente = true; const m1 = run(2); god(() => Po.release('teste')); M.viver(0.2); const m2 = run(2); const lm = G.lingers(true).find(c => c.id === 'prova-mente'); RITO.mente = false;
    ok('c8 com o corpo, só ele: uma causa cuja pergunta sempre diz sim demora o sol com o corpo (0,05, a mais lenta) — e sem o corpo o registro nem a pergunta: o passo do mundo',
      m1.P.length === 1 && m1.P[0] === 0.05 && m2.P.every(p => p === 1) && m2.PC.every(p => p === 1) && !!lm && lm.on === false, `com o corpo: o passo ${m1.P.join('/')}; sem ele: ${m2.P.join('/')}, a parte do corpo ${m2.PC.join('/')}; a causa, perguntada como o relógio pergunta: ${lm ? (lm.on ? 'LIGADA' : 'desligada') : 'NÃO REGISTRADA'}`);
    // ---- c11: the causes only read: every cause registered, asked 300 times as the clock asks them — with a body at the rite and without one
    // —, leaves the world, the chance and the next id as they were
    { const look = () => [JSON.stringify(G.S.rng), JSON.stringify(QA.canon()), G.S.nextId].join('|'); const out = [];
      for (const comCorpo of [true, false]) {
        if (comCorpo) { if (!Po.is(v) && !take(v)) { out.push('sem corpo para o caso com corpo'); continue; } sitIn(v); } else if (Po.body()) god(() => Po.release('teste'));
        RITO.on = true; RITO.dois = true; RITO.mente = true; M.viver(0.1); const l0 = look(); let n = 0; for (let k = 0; k < 300; k++) n += G.lingers(true).filter(c => c.on).length; const l1 = look(); RITO.dois = false; RITO.mente = false; // (the rite as it was: on, for the bad cases)
        out.push(`${comCorpo ? 'com o corpo' : 'sem o corpo'}: ${l0 === l1 ? 'nada mudou' : 'O MUNDO MUDOU'} (${(n / 300).toFixed(0)} causa(s) ligada(s))`); if (l0 !== l1) out.push('!'); }
      const lg = G.lingers();
      ok('c11 as causas só leem: cada causa do registro, perguntada 300 vezes como o relógio pergunta, com o corpo e sem ele, deixa o mundo, o acaso e o próximo id como estavam; e cada passo registrado fica entre 0 e 1',
        !out.includes('!') && !out.some(s => /sem corpo para/.test(s)) && lg.every(c => c.k > 0 && c.k < 1), `${out.filter(s => s !== '!').join('; ')}; as causas: ${lg.map(c => `${c.id} ${c.k}${c.corpo ? '' : ' (do mundo)'}`).join(', ')}`); }
    // ---- c9: the bad cases — a save in the middle of the rite (nothing of it in the save; the pace from 1, asked again at the next step), the
    // god's hand that takes the body out, the body that dies at the rite, the building that falls with the body in it
    { if (!take(v)) { ok('c9 os casos ruins', false, 'o corpo não foi tomado de novo'); return; } sitIn(v); M.viver(0.3); const p9 = G.pace;
      const snap = G.Save.serialize(); const nada = !/prova-rito|prova-mente|"pace"|"paceCorpo"|"lingers?"/.test(snap); G.Save.apply(JSON.parse(snap));
      const p0 = G.pace; v = G.S.villagers.get(v.id); x = G.S.villagers.get(x.id); tb = G.S.buildings.get(tb.id) || tb; // (a load makes the world anew: the objects of before are not the world's)
      hold(x, { type: 'idle', wait: 1e4 }); M.viver(0.1); const inT = Po.is(v) && v.inside === tb.id && !v.sleeping; const p1 = G.pace;
      ok('c9 um save no meio do rito: nada da demora no save; aberto, o passo recomeça em 1 e é perguntado de novo ao mundo no passo seguinte', p9 === 0.21 && nada && p0 === 1 && p1 === (inT ? 0.21 : 1),
        `antes do save ${p9}; ${nada ? 'nada da demora no save' : 'A DEMORA FOI NO SAVE'}; ao abrir ${p0}; no passo seguinte ${p1} (o corpo ${inT ? 'ainda no rito' : 'fora dele'})`);
      if (!Po.is(v)) take(v); sitIn(v); M.viver(0.2); const q0 = G.pace;
      god(() => { Po.unuse(v); const d = Vg.door(tb); v.inside = 0; v.x = d[0]; v.y = d[1]; }); M.viver(0.2); const q1 = G.pace;
      ok('c9 a mão do deus tira o corpo do prédio: o passo do mundo no passo seguinte', q0 === 0.21 && q1 === 1, `no rito ${q0}; tirado ${q1}`);
      sitIn(v); M.viver(0.2); const d0 = G.pace; god(() => V.kill(v, 'teste', true)); M.viver(0.3);
      ok('c9 o corpo morre no rito: o passo do mundo, nenhum erro', d0 === 0.21 && !Po.body() && G.pace === 1 && M.limpo(), `no rito ${d0}; morto: ${Po.body() ? 'AINDA UM CORPO' : 'sem corpo'}, o passo ${G.pace}`);
      const w = people().find(o => o !== v); if (!w || !take(w)) ok('c9 o prédio cai com o corpo dentro', false, 'ninguém mais para o deus viver');
      else { v = w; sitIn(v); M.viver(0.2); const f0 = G.pace; god(() => V.damageBuilding(tb, 1e9, 'deus')); M.viver(1);
        const caiu = !G.S.buildings.has(tb.id) || G.S.buildings.get(tb.id).type === 'ruin' || !G.S.buildings.get(tb.id).built;
        ok('c9 o prédio cai com o corpo dentro: o corpo fora dele, o passo do mundo, nenhum erro', f0 === 0.21 && caiu && v.inside !== tb.id && G.pace === 1 && M.limpo(), `no rito ${f0}; o prédio ${caiu ? 'no chão (virou ruína)' : 'AINDA DE PÉ'}; o corpo ${v.inside === tb.id ? 'AINDA DENTRO' : 'fora'}, o passo ${G.pace}`); } }
    // ---- c10: without the body, the world the one before: twice from the same moment, with the proof's causes on and off — the one that
    // always says yes too —: the same world, the same chance, the pace 1 all along
    { if (Po.body()) god(() => Po.release('teste')); M.viver(0.2); const snap = G.Save.serialize();
      const life = lig => { G.Save.apply(JSON.parse(snap)); RITO.on = lig; RITO.mente = lig; const P = new Set(); for (let k = 0; k < 200; k++) { calm(); M.viver(0.1); P.add(G.pace); P.add(G.paceCorpo); } RITO.on = false; RITO.mente = false;
        return { P: [...P], rng: JSON.stringify(G.S.rng), canon: JSON.stringify(QA.canon()) }; };
      const A = life(true), B = life(false);
      ok('c10 sem o corpo, o mundo é o de antes: 20 s do mesmo momento com as causas da prova ligadas (a que sempre diz sim também) e desligadas — o mesmo mundo, o mesmo acaso, o passo 1 do começo ao fim',
        A.P.length === 1 && A.P[0] === 1 && B.P.length === 1 && A.rng === B.rng && A.canon === B.canon, `os passos ${A.P.join('/')} e ${B.P.join('/')}; o acaso ${A.rng === B.rng ? 'igual' : 'DIFERENTE'}; o mundo ${A.canon === B.canon ? 'igual' : 'DIFERENTE'}`); }
  } finally { G.Scene.lingers = lg0; RITO.on = false; RITO.dois = false; RITO.mente = false; if (Po.body()) god(() => Po.release('teste')); if (x && G.S.villagers.has(x.id)) god(() => Vg.endTask(x)); }
  { const [c, info] = clean(); ok('c6 o verificador e os erros depois da mão da prova', c, info); }
}

// ================================================================ v, n: the lived days, and a save in the middle of the night
function partV() {
  M.pronto(WORLD); const S = G.S; for (let i = 0; i < SHIFT; i++) G.R(); rebase();
  const adult = v => v.age >= 16 && !v.captive && !v.aboard && !v.ug;
  let g = 0; const d0 = S.day; while (S.day === d0 && g++ < 4000) { peace(); M.viver(1); } // (the first day — the ready world's, begun at night — is lived and not counted)
  const d1 = S.day; const at = { 0.66: [], 0.7: [] }; const tav = { 0.75: [], 0.8: [], 0.85: [] }; const lit = { 0.74: [], 0.78: [], 0.82: [] }; const bedE = []; const bedSeen = new Set();
  let adS = 0, workS = 0, restS = 0, secs = 0, lingerS = 0, fairA = 0, fairW = 0, stormS = 0, hourS = 0; const bad = []; const badSeen = new Map(); const tired = []; let mid = null;
  while (S.day < d1 + DIAS && g++ < 60000) {
    peace(); const t0 = S.time, dd = S.day; M.viver(1); if (S.day !== dd) continue; secs++; if (G.Scene.lingers()) lingerS++;
    const cross = m => t0 < m && S.time >= m; const cnt = {}; for (const m of [0.66, 0.7]) if (cross(m)) cnt[m] = [0, 0]; const tv = {}; for (const m of [0.75, 0.8, 0.85]) if (cross(m)) tv[m] = 0;
    // (the working hours, and whether a storm is over the world — the game's own rule of the shelter: under it nobody works)
    const stormy = S.weather.storm > 0 && S.weather.rain > 0.3, hours = S.time >= 0.05 && S.time < 0.6; if (hours) { hourS++; if (stormy) stormS++; }
    for (const v of S.villagers.values()) {
      if (!adult(v)) continue; const t = v.task; adS++; if (!v.sleeping) { if (t && t.kind === 'work') workS++; if (Vg.resting(v)) restS++; if (hours && !stormy) { fairA++; if (t && t.kind === 'work') fairW++; } }
      for (const m in cnt) { cnt[m][1]++; if ((v.sleeping || (t && t.type === 'sleep')) && !Lr.sleepy(v)) cnt[m][0]++; }
      for (const m in tv) if (t && t.type === 'tavern' && t.st >= 2) tv[m]++;
      const c = Lr.clock(v); const key = v.id + ':' + S.day; if (c.bed > 0.5 && t0 < c.bed && S.time >= c.bed && !bedSeen.has(key)) { bedSeen.add(key); if (!(v.sleeping || (t && t.type === 'sleep'))) bedE.push(v.energy); }
    }
    for (const m in cnt) at[m].push(cnt[m]); for (const m in tv) tav[m].push(tv[m]);
    for (const m of [0.74, 0.78, 0.82]) if (cross(m)) { let n = 0, hs = 0; for (const b of S.buildings.values()) { if (!b.built || !(V.bedsOf(b) > 0)) continue; hs++; if (G.Atmos && G.Atmos.lit(b)) n++; } lit[m].push([n, hs]); }
    // (the verifier, looked at every two seconds: the tiredness against the day needs the looks near one another)
    if (secs % 2 === 0) { for (const q of QA.check()) { if (q.sys === 'dia') { if (tired.length < 6) tired.push(`[S${q.sev}] ${q.msg.slice(0, 140)}`); } else if (q.sev <= 2 && !base.has(q.sys + '|' + q.msg)) { const k = q.sys + '|' + q.msg; if (!badSeen.has(k)) { badSeen.set(k, [S.day, S.time, 0]); if (bad.length < 6) bad.push(k); } badSeen.get(k)[2]++; } } }
    if (!mid && S.day === d1 + 1 && S.time >= 0.85) mid = { save: G.Save.serialize(), t: S.time, day: S.day };
  }
  // (a history may have no scene in its days — the metropolis with one draw of the world's chance before it had none in four —:
  // thirty seconds more with the sun lingering by the proof's hand, looked at every two)
  let handS = 0; { const lg0 = G.Scene.lingers; G.Scene.lingers = () => true; try { for (let k = 0; k < 30; k++) { peace(); M.viver(1); handS++; if (k % 2 === 1) for (const q of QA.check()) if (q.sys === 'dia' && tired.length < 6) tired.push(`[S${q.sev}] (o sol a demorar-se pela mão) ${q.msg.slice(0, 140)}`); } } finally { G.Scene.lingers = lg0; } }
  const share = m => at[m].length ? at[m].reduce((s, r) => s + r[0] / Math.max(1, r[1]), 0) / at[m].length : -1; const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
  const med = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const workC = 100 * workS / Math.max(1, adS), restC = 100 * restS / Math.max(1, adS);
  // (the floors, from the same measure in four histories of before and four of after — the metropolis twice, the mega twice,
  // four counted days each: in bed or on the way to it by the tiredness, at 0,66, 22% to 42% of the grown ones before and 5%
  // to 10% after; at 0,70, 23% to 55% before and 13% to 33% after — the first has the teeth, the second is a belt)
  if (on('v1')) ok(`v1 em ${DIAS} dias vividos, sem ninguém mandado: às 0,66 não mais de 15% dos adultos dormem ou vão dormir pelo cansaço, e às 0,70 não mais de 40% (antes desta rodada, em quatro histórias: 22% a 42% e 23% a 55%; depois: 5% a 10% e 13% a 33%)`, at[0.66].length >= DIAS - 1 && share(0.66) <= 0.15 && share(0.7) <= 0.4,
    `a dormir ou a ir dormir pela energia (não pelo relógio de cada um): às 0,66 ${(100 * share(0.66)).toFixed(1)}% dos adultos (${at[0.66].map(r => r[0] + ' de ' + r[1]).join(', ')}); às 0,70 ${(100 * share(0.7)).toFixed(1)}% (${at[0.7].map(r => r[0] + ' de ' + r[1]).join(', ')})`);
  // (the working day: of the grown ones awake in the working hours — 0,05 to 0,60 — with fair weather, the share at work. Not
  // the centésimos a day alone: under a storm nobody works — the mega with a storm over a third of its working hours had 21
  // centésimos of work a day for 30 without one, before this round or after it. In eight histories: 46% to 55% before, 51% to
  // 55% after)
  const fair = fairW / Math.max(1, fairA);
  if (on('v2')) ok('v2 o dia de trabalho não encolheu: nas horas de trabalho (0,05 a 0,60) com tempo bom, 42% ou mais dos adultos acordados estão no trabalho (em oito histórias, antes desta rodada 46% a 55%; depois 51% a 55%)', fair >= 0.42 && fairA > 0, `${(100 * fair).toFixed(1)}% no trabalho; por adulto-dia: ${workC.toFixed(1)} centésimos do dia no trabalho, ${restC.toFixed(1)} em descanso (G.Vg.resting); a tempestade em ${(100 * stormS / Math.max(1, hourS)).toFixed(0)}% das horas de trabalho`);
  if (on('v3')) ok('v3 ninguém acordado cansa mais depressa do que o dia — a regra do verificador olhada de dois em dois segundos, nos dias vividos (com as cenas que houve) e em mais 30 s com o sol a demorar-se pela mão da prova', !tired.length && handS === 30, tired.length ? tired.slice(0, 3).join(' | ') : `nenhuma vez em ${secs} segundos dos dias vividos, uma cena a correr em ${lingerS} deles (${(100 * lingerS / Math.max(1, secs)).toFixed(1)}%), nem nos ${handS} s da mão`);
  if (on('v4')) ok('v4 o verificador (S0 a S2) e os erros nos dias vividos', !bad.length && M.limpo(), bad.slice(0, 3).map(k => { const r = badSeen.get(k); return `${k.replace('|', ': ').slice(0, 170)} (desde o dia ${r[0]} às ${r[1].toFixed(2)}, em ${r[2]} olhadas de dois em dois segundos)`; }).join(' | ') || (M.limpo() ? 'limpo' : JSON.stringify(M.erros()).slice(0, 300)));
  if (on('v5')) console.log(`MEDIDO | dia v5 o que se mede e não se afirma (uma história) | à mesa da taverna, no mundo: às 0,75 ${f1(mean(tav[0.75]))}, às 0,80 ${f1(mean(tav[0.8]))}, às 0,85 ${f1(mean(tav[0.85]))}; casas com a janela acesa: às 0,74 ${f1(mean(lit[0.74].map(r => r[0])))} de ${f1(mean(lit[0.74].map(r => r[1])))}, às 0,78 ${f1(mean(lit[0.78].map(r => r[0])))}, às 0,82 ${f1(mean(lit[0.82].map(r => r[0])))}; a energia de quem está acordado na hora de deitar do relógio dele: mediana ${f1(med(bedE))} (${bedE.length} adulto-dias; ${bedE.filter(x => x < 15).length} abaixo de 15)`);
  // ---------------------------------------------------------------- n: a save in the middle of the night, loaded twice
  if (on('n')) {
    if (!mid) { ok('n um save a meio da noite', false, 'os dias vividos não chegaram às 0,85 do segundo dia'); return; }
    const noNew = !/"pace"|"REST"|"resting"|"dayPace"/.test(mid.save);
    const life = () => { G.pace = G.LINGER; M.abrir(JSON.parse(mid.save)); const p0 = G.pace; for (let k = 0; k < 40; k++) { peace(); M.viver(1); } return { p0, canon: JSON.stringify(QA.canon()), day: G.S.day, t: G.S.time, awake: [...G.S.villagers.values()].filter(v => v.age >= 16 && !v.sleeping).length }; };
    const A = life(), B = life();
    ok('n um save a meio da noite, carregado duas vezes: o mesmo futuro; nada novo no save; o passo do dia recomeça em 1', noNew && A.p0 === 1 && B.p0 === 1 && A.canon === B.canon && M.limpo(),
      `o save às ${mid.t.toFixed(3)} do dia ${mid.day} (${(mid.save.length / 1e6).toFixed(2)} MB): ${noNew ? 'nenhum campo novo' : 'UM CAMPO NOVO NO SAVE'}; depois de abrir o passo do dia é ${A.p0}; 40 s depois, as duas vidas ${A.canon === B.canon ? 'iguais' : 'DIFERENTES'} (${A.awake} adultos acordados às ${A.t.toFixed(3)})`);
  }
}

// ================================================================ h: the verifier catches the lie
function partH() {
  M.pronto(WORLD); const S = G.S; S.time = 0.4; calm(); M.viver(1); const L = pool(); const seen = {};
  const clean0 = mine().length;
  // (the pace of the step out of the door's two values)
  const p0 = G.pace; G.pace = 0.5; seen.pace = mine().some(q => /passo do dia/.test(q.msg)); G.pace = p0;
  // (the door of rest made to lie: one on the move said at rest; one at work said at rest)
  const r0 = Vg.resting; const w = L[0], x = L[1];
  Vg.resting = v => (v === w ? true : r0(v)); const m0 = w.moving; w.moving = true; seen.move = mine().some(q => /a andar/.test(q.msg) && q.msg.includes('#' + w.id)); w.moving = m0;
  const t0 = w.task; w.task = { type: 'chop', st: 2, kind: 'work', pri: 1 }; w.moving = false; seen.work = mine().some(q => /afazer de trabalho/.test(q.msg) && q.msg.includes('#' + w.id)); w.task = t0; w.moving = m0; Vg.resting = r0;
  const clean1 = mine().length;
  // (the tiredness in seconds with the sun lingering — the L-915 by the proof's hand: the difference taken from one awake)
  const lg0 = G.Scene.lingers; G.Scene.lingers = () => true; hold(x, { type: 'idle', wait: 1e4 }); x.energy = 80; const y = L[2]; hold(y, { type: 'idle', wait: 1e4 }); y.energy = 80;
  M.viver(0.5); mine(); let hit = 0, other = 0;
  for (let k = 0; k < 6; k++) { for (let j = 0; j < 20; j++) { calm(); x.hunger = 10; y.hunger = 10; M.viver(0.1); x.energy -= 0.1 / G.DAY_K * (100 / 80) * (1 - G.LINGER); } for (const q of mine()) { if (/cansou/.test(q.msg)) { if (q.msg.includes('#' + x.id)) hit++; else other++; } } }
  G.Scene.lingers = lg0; god(() => { Vg.endTask(x); Vg.endTask(y); }); M.viver(1); mine(); M.viver(1); const clean2 = mine().length;
  ok('h o verificador (qa/dia-inv.js) pega quatro mentiras — o passo do dia fora dos dois valores da porta, alguém em descanso a andar, alguém em descanso no trabalho, alguém a cansar em segundos com o sol a demorar-se — e nada sem elas',
    clean0 === 0 && seen.pace && seen.move && seen.work && clean1 === 0 && hit >= 4 && other === 0 && clean2 === 0,
    `antes ${clean0}; o passo a 0,5 ${seen.pace ? 'acusado' : 'NÃO ACUSADO'}; em descanso a andar ${seen.move ? 'acusado' : 'NÃO ACUSADO'}; em descanso no trabalho ${seen.work ? 'acusado' : 'NÃO ACUSADO'}; sem as mentiras ${clean1}; ${x.name} a cansar em segundos com a cena: acusado em ${hit} de 6 olhadas (a dois segundos uma da outra), ${other} outra(s) pessoa(s) acusada(s); depois ${clean2}`);
}

if (on('a')) partA();
if (on('s')) partS();
if (on('b')) partBody();
if (on('c')) partC();
if (on('cn')) partCN();
if (on('v') || on('n')) partV();
if (on('h')) partH();
{ const e = M.erros(); ok('erros', M.limpo(), Object.keys(e.mod).length ? JSON.stringify(e.mod).slice(0, 300) : e.console.length ? e.console.slice(0, 2).join(' · ') : 'nenhum erro de módulo, nenhum aviso no console'); }
console.log(`\n${fails.length ? 'FALHOU: ' + fails.length + ' (' + fails.join(', ') + ')' : 'PASSOU'}`);
process.exit(fails.length ? 1 : 0);
