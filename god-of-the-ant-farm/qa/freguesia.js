// freguesia: a freguesia dos banhos e da biblioteca (Bairros Vivos; L-717, L-910, D-200 a D-204), em Node, sobre o código do jogo.
// Ninguém ia aos banhos: o banho só era pedido pelo passeio de quem está sem trabalho. Agora o banho e a leitura são uma
// vontade de cada um, escolhida entre as outras do dia (villagers.js, decide: 'banho', 'ler' — G.Termas.urge / go,
// G.Biblioteca.urge / go), com causa: quem, quando, quanto, o que impede.
//   a  a regra, sem viver (no mundo pronto, a mão da prova numa pessoa de cada vez):
//      a1 o que impede o banho — o corpo do deus, a carga, o preso, a criança, a fome, o cansaço, o banho de hoje, a casa sem
//         moeda, os banhos cheios, a distância, a hora, a tarefa em curso, o doente de cama; cada um zera a vontade;
//      a2 quem quer mais — o doente, o ofício sujo, o rico, o cansado, o povo da terma; menos quem mora longe e a água fria;
//      a3 o dia de cada um — a sorte do dia é da pessoa e do dia (G.hash), espalhada por igual, a mesma o dia inteiro, e não
//         tira nada do acaso do mundo; a vontade pedida de fora do passo não muda o mundo;
//      a4 a biblioteca — quem lê (o curioso, o sacerdote, o escriba, o nobre, o mercador), quem não lê, o povo sem a escrita,
//         o rolo de hoje, a mesa cheia, a hora;
//   b  os dias vividos no mundo pronto (DIAS=3), sem a mão da prova em ninguém, na paz do deus (o poder do jogo: a
//      metrópole pronta entra em guerra no segundo ou no terceiro dia; PAZ=0 a deixa correr): b1 cada dia de banhos com a
//      fornalha acesa tem banhistas, numa cidade de 50 ou mais (quantos por dia e por cidade); b2 ninguém se banha duas vezes no dia; b3 a entrada é a do livro-razão
//      (cada entrada uma linha «termas», a soma é o caixa do dia; nenhuma num povo sem moeda); b4 ninguém é chamado dormindo,
//      com carga, com as mãos numa operação, com uma tarefa de peso, fora de hora ou sendo o corpo do deus; ninguém paga e
//      fica sem banho por falta de tempo; b5 quem mora longe vai menos, o ofício sujo e o doente vão mais (as contas ditas);
//      b6 a biblioteca tem leitores (quantos por dia); b7 a vida do bairro conta cada entrada e cada leitura uma vez
//      (G.Urban.note); b8 o verificador (com as regras novas) e nenhum erro;
//   i  a mesma causa no salto (ANOS=4): os banhos têm banhistas pela mesma vontade, a entrada é a do livro, ninguém duas
//      vezes no dia; a biblioteca tem leitores;
//   c  as termas e as grandes termas pela mão do deus junto de uma cidade de um povo da terma, com a gente que a escada pede
//      (trazida pela mão da prova: T-820): enchem mais que os banhos pequenos — mais banhos no dia, mais gente na água de uma
//      vez; e ninguém bate na porta cheia (quem está a caminho conta);
//   d  a grande biblioteca pela mão do deus na mesma cidade: tem leitores sem a mão da prova, cada um num lugar de ler;
//   e  os casos ruins: e1 um save no meio de um banho e de uma leitura, carregado duas vezes — o mesmo futuro; e2 quem morre
//      a caminho e quem morre na água; e3 a cidade em guerra; e4 o povo sem moeda (entra sem pagar, nada no livro);
//      e5 o deus fecha o dia e derruba os banhos com gente dentro e a caminho (as idas acabam na hora: L-910);
//   h  o verificador (qa/freguesia-inv.js) pega a mentira — e nada sem ela.
//   [ONLY=a,b1,c,…] [DIAS=n] node qa/freguesia.js [metropole|mega]
'use strict';
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/escala-inv.js', 'qa/termas-grandes-inv.js', 'qa/saber-inv.js', 'qa/freguesia-inv.js'] });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.some(o => k === o || k.startsWith(o) || o.startsWith(k));
const DIAS = +(process.env.DIAS || 3);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | freguesia ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const Vg = G.Vg, V = G.Village, E = G.Eco, D = G.Depot, A = G.Act, Te = G.Termas, Bi = G.Biblioteca, U = G.Urban, In = G.Interiors, W = G.W;
const EPS = 1e-6; const r2 = x => Math.round(x * 100) / 100;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const qaAll = () => QA.check().filter(q => q.sev <= 2);
let base = new Set();
const rebase = () => { base = new Set(qaAll().map(q => q.sys + '|' + q.msg)); };
const novas = () => qaAll().filter(q => !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg.slice(0, 120)}`);
const mine = () => QA.check().filter(q => q.sys === 'freguesia');
const facOf = b => V.facOfSet(b.set);
const setOf = b => G.S.settlements.get(b.set);
const civOfSet = set => G.Civ.idOfFac(set.fac);
const baths = () => [...G.S.buildings.values()].filter(b => b.type === 'banhos' && b.built).sort((a, c) => a.id - c.id);
const libs = () => [...G.S.buildings.values()].filter(b => b.type === 'biblioteca' && b.built).sort((a, c) => a.id - c.id);
const lit = b => { const f = G.Fac.get(facOf(b)); return !!(f && f.tech && f.tech.known && f.tech.known.escrita); };
const adults = setId => [...G.S.villagers.values()].filter(v => v.set === setId && v.age >= 16 && !v.captive).sort((a, c) => a.id - c.id);
const homeOf = v => v.home && G.S.buildings.get(v.home);
const farOf = (v, b) => { const h = homeOf(v); return h ? G.dist(h.x + h.w / 2, h.y + h.h / 2, b.x + b.w / 2, b.y + b.h / 2) : G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2); };
const pct = (a, n) => (n ? (100 * a / n).toFixed(0) + '%' : '—');
// (the day's book opened by the world: the clock set in the baths' hours, a second lived)
const openAt = t => { G.S.time = t; M.viver(1); };

// ================================================================ a: the rule
// a free grown one of the town, set by the test's hand by the door of the baths, rested and fed, with nothing in the hands
function ready(v, b) {
  const dr = Vg.door(b); const p = W.nearestLand(dr[0], dr[1] + 2, 4) || dr;
  Vg.endTask(v); v.inside = 0; v.x = p[0]; v.y = p[1]; v.path = null; v.sleeping = false; v.hunger = 20; v.energy = 80; v.carry = null; v.sick = 0; v.bathDay = 0; v.readDay = 0;
}
function partA() {
  M.pronto(WORLD); const S = G.S; rebase();
  // the baths with the most places in the water, in a town with people
  S.time = 0.42; M.viver(2);
  const b = baths().filter(q => Te.dia(q)).sort((a, c) => Te.places(c) - Te.places(a) || a.id - c.id)[0];
  if (!b) { ok('a a regra', false, `${WORLD}: nenhum dia de banhos aberto às 0,42`); return; }
  const set = setOf(b); const op = Te.dia(b); const f = G.Fac.get(facOf(b));
  const snap = v => ({ x: v.x, y: v.y, inside: v.inside, hunger: v.hunger, energy: v.energy, carry: v.carry, sick: v.sick, bathDay: v.bathDay, readDay: v.readDay, sleeping: v.sleeping });
  // ---------------------------------------------------------------- a1
  if (on('a1')) god(() => {
    S.time = 0.5; op.data.calor = 40; // (the afternoon, the water hot: everyone's hour is past)
    const cands = adults(set.id).filter(v => v.age < 55 && !v.jail && !v.aboard && !v.ug && !v.held && !(G.Expe && G.Expe.memberOf(v.id)) && homeOf(v) && !(v.task && (v.task.pri || 0) >= 3));
    let p = null; for (const v of cands) { const s0 = snap(v); const t0 = v.task; ready(v, b); if (Te.urge(v, null) > 0 && Te.pick(v) === b) { p = v; break; } Object.assign(v, s0); v.task = t0; }
    if (!p) { ok('a1 o que impede o banho', false, `${set.name}: ninguém com vontade às 0,50 (${cands.length} candidatos)`); return; }
    const u0 = Te.urge(p, null); const z = {}; const z0 = {}; const h = homeOf(p); const coin = Te.withCoin(b);
    const tryIt = (name, put, undo) => { put(); z[name] = Te.urge(p, null); undo(); };
    tryIt('o corpo do deus', () => { S.avatar = { id: p.id, kind: 'humano' }; }, () => { S.avatar = null; });
    tryIt('uma carga nas mãos', () => { p.carry = { k: 'wood', n: 1 }; }, () => { p.carry = null; });
    tryIt('preso', () => { p.jail = 9; }, () => { p.jail = 0; });
    tryIt('cativo', () => { p.captive = 1; }, () => { p.captive = 0; });
    tryIt('a bordo', () => { p.aboard = 9; }, () => { p.aboard = 0; });
    { const a0 = p.age; tryIt('criança', () => { p.age = 15; }, () => { p.age = a0; }); }
    tryIt('com fome', () => { p.hunger = Te.HUNGRY + 5; }, () => { p.hunger = 20; });
    tryIt('exausto', () => { p.energy = Te.SPENT - 5; }, () => { p.energy = 80; });
    tryIt('já se banhou hoje', () => { p.bathDay = S.day; }, () => { p.bathDay = 0; });
    tryIt('de cama com febre', () => { p.sick = G.DAY_LEN * 0.5; }, () => { p.sick = 0; });
    if (coin) { const c0 = h.coin; tryIt('a casa sem moeda', () => { h.coin = 0; }, () => { h.coin = c0; }); }
    { const keep = op.data.banho; tryIt('os banhos cheios', () => { op.data.banho = {}; for (let i = 0; i < Te.places(b); i++) op.data.banho[9000000 + i] = { st: 2, t: S.clock }; }, () => { op.data.banho = keep; }); }
    // (the last place in the water is of the one already on the way to it: asked from outside the step, counted afresh)
    { const keep = op.data.banho; const q = cands.find(v => v !== p && !(v.task && v.task.type === 'termas')); const qt = q.task; const fill = n => { op.data.banho = {}; for (let i = 0; i < n; i++) op.data.banho[9000000 + i] = { st: 2, t: S.clock }; };
      G.inSim--; try { fill(Te.places(b) - 1); z0.last = Te.urge(p, null); q.task = { type: 'termas', id: b.id, op: op.id, pri: Te.PRI, st: 0 }; z['o último lugar é de quem já vem a caminho'] = Te.urge(p, null); } finally { G.inSim++; q.task = qt; op.data.banho = keep; } }
    { const x0 = p.x, y0 = p.y; tryIt('longe demais', () => { p.x = Vg.door(b)[0] + Te.REACH + 4; }, () => { p.x = x0; p.y = y0; }); }
    tryIt('antes de abrir', () => { S.time = Te.horas(b).abre - 0.03; }, () => { S.time = 0.5; });
    tryIt('sem tempo antes de fechar', () => { S.time = Te.horas(b).fecha - 0.02; }, () => { S.time = 0.5; });
    tryIt('antes da sua hora', () => { S.time = Te.hourOf(p, b) - 0.02; }, () => { S.time = 0.5; });
    z['uma tarefa de peso em curso'] = Te.urge(p, { type: 'farm', pri: 1 });
    // (the stoker of these baths, the fire out: he keeps the furnace — and, the fire fed to the closing, he is free: D-204)
    { const r0 = p.role, j0 = p.job, c0 = op.data.calor; p.role = 'foguista'; p.job = b.id; op.data.calor = 0; z['o foguista com a fornalha por alimentar'] = Te.urge(p, null); z0.duty = Te.onDuty(p); op.data.calor = G.DAY_LEN; z0.free = Te.urge(p, null); z0.off = Te.onDuty(p); p.role = r0; p.job = j0; op.data.calor = c0; }
    // (and the town's leisure — the old door, G.Termas.visit — gives no second bath of the day either)
    { p.bathDay = S.day; const t = Te.visit(p, b); z['já se banhou hoje, pelo passeio'] = t ? 1 : 0; if (t) Vg.endTask(p); p.bathDay = 0; }
    const still = Te.urge(p, { type: 'wander', pri: 0 }); const stay = Te.urge(p, { type: 'termas', pri: Te.PRI, st: 0 }); const inside = Te.urge(p, { type: 'termas', pri: Te.PRI, st: 2 });
    // (and the evening out: where the town has a show with its doors open today, one who would go to it does not go as the
    // stoker of these baths with the fire out — the theatre's own wish asks the post, D-204; the last thing of the case: a
    // second of the world is lived for the doors to open)
    let teatro = 'nenhuma cidade com banhos abertos e um espetáculo de portas abertas hoje';
    { S.time = 0.585; M.viver(3); S.time = 0.585; let pair = null;
      for (const bb of baths()) { const o2 = Te.dia(bb); if (!o2 || !Te.inHours(bb)) continue; const show = [...S.buildings.values()].find(q => q.set === bb.set && G.Teatro.isShow(q) && G.Teatro.aberto(q)); if (show) { pair = [bb, o2, show]; break; } }
      if (pair) { const [bb, o2, show] = pair; teatro = `em ${setOf(bb).name} ninguém iria ao teatro agora`;
        for (const q of adults(bb.set).filter(v => v.age < 55 && !v.jail && !v.aboard && !v.ug && homeOf(v) && !(v.task && (v.task.pri || 0) >= 3)).slice(0, 16)) {
          const s1 = snap(q), t1 = q.task; const hq = homeOf(q); const hc = hq.coin; ready(q, show); if (hq.coin < 1) hq.coin = 1;
          const ut = G.Teatro.urge(q, null); let ud = -1;
          if (ut > 0) { const r0 = q.role, j0 = q.job, c0 = o2.data.calor; q.role = 'foguista'; q.job = bb.id; o2.data.calor = 0; ud = G.Teatro.urge(q, null); q.role = r0; q.job = j0; o2.data.calor = c0; }
          hq.coin = hc; Object.assign(q, s1); q.task = t1;
          if (ut > 0) { z['o foguista com a fornalha por alimentar, o teatro'] = ud; teatro = `em ${setOf(bb).name}, ao espetáculo de ${V.buildName(show)} a vontade de ${q.name} livre é ${ut.toFixed(2)}, como foguista dos banhos ${ud}`; break; } } }
      S.time = 0.5; }
    const badZ = Object.keys(z).filter(k => z[k] !== 0);
    ok('a1 o que impede o banho: cada impedimento zera a vontade; sem nenhum, a vontade passa do trabalho; a caminho, fica', u0 >= 0.7 && !badZ.length && still === u0 && stay === 1 && inside === Te.IN && inside > 1.28 && z0.last === u0 && z0.duty === true && z0.off === false && z0.free === u0 && Object.keys(z).length >= (coin ? 20 : 19),
      `${p.name}, ${G.roleName(p)} de ${set.name}, à porta de «${V.buildName(b)}» às 0,50: a vontade ${u0} (o trabalho de um dia vale 0,55); ${Object.keys(z).length} impedimentos, cada um → ${badZ.length ? 'NÃO ZEROU: ' + badZ.map(k => `${k} ${z[k]}`).join(', ') : '0'} (${Object.keys(z).join(', ')}); com um passeio em curso ${still}, já a caminho ${stay}, já lá dentro ${inside} (o teatro de um curioso vale até 1,05, um namoro até 1,28); com um só lugar livre na água ${z0.last}; o foguista com o fogo alimentado até fechar ${z0.free}; ${teatro}`);
  });
  // ---------------------------------------------------------------- a2
  if (on('a2')) god(() => {
    S.time = 0.5; op.data.calor = 40;
    const p = adults(set.id).filter(v => v.age >= 20 && v.age < 55 && homeOf(v) && !v.jail && !v.aboard)[0];
    const s0 = snap(p); const t0 = p.task; const role0 = p.role, grp0 = p.grp, home0 = p.home, civ0 = f.civ; ready(p, b);
    const homes = [...S.buildings.values()].filter(q => q.set === set.id && q.built && G.BDEF[q.type].housing).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id);
    const near = homes[0], far = homes[homes.length - 1];
    p.role = 'agricultor'; p.grp = 'povo'; p.home = near.id; f.civ = 'egipcio';
    const w = () => r2(Te.wish(p, b)); const plain = w();
    p.sick = 20; const sick = w(); p.sick = 0;
    p.role = 'ferreiro'; const dirty = w(); p.role = 'agricultor';
    p.grp = 'nobreza'; const rich = w(); p.grp = 'povo';
    p.energy = Te.TIRED - 10; const tired = w(); p.energy = 80;
    f.civ = 'romano'; const habit = w(); f.civ = 'egipcio';
    p.home = far.id; const farW = w(); p.home = near.id;
    op.data.calor = 0; const cold = w(); op.data.calor = 40;
    const dirtyAll = Object.keys(Te.DIRTY).sort().join(', ');
    p.role = role0; p.grp = grp0; p.home = home0; f.civ = civ0; Object.assign(p, s0); p.task = t0;
    ok('a2 quem quer mais: o doente (todo dia), o ofício sujo, o rico, o cansado e o povo da terma mais que o lavrador comum; quem mora longe e a água fria, menos', sick > dirty && dirty > plain && rich > plain && tired > plain && habit > plain && farW < plain && Math.abs(cold - plain * Te.COLD) < 0.011 && sick === 1,
      `a parte dos dias com banho, a mesma pessoa de ${set.name} pela mão da prova, a casa a ${G.dist(near.x, near.y, b.x, b.y).toFixed(0)} casas dos banhos, a água quente: lavrador ${plain} · doente ${sick} · ferreiro ${dirty} · nobre ${rich} · cansado ${tired} · num povo da terma ${habit} · morando a ${G.dist(far.x, far.y, b.x, b.y).toFixed(0)} casas ${farW} · a água fria ${cold}; os ofícios sujos: ${dirtyAll}`);
  });
  // ---------------------------------------------------------------- a3
  if (on('a3')) god(() => {
    S.time = 0.5; const all = [].concat(...baths().map(q => adults(q.set))); const day0 = S.day;
    let n = 0, low = 0, sum = 0, both = 0; const first = new Map();
    for (let d = 0; d < 30; d++) { S.day = day0 + d; for (const v of all) { const l = Te.lot(v); n++; sum += l; if (l < 0.3) low++; if (d === 0) first.set(v.id, l); if (d === 1 && l < 0.3 && first.get(v.id) < 0.3) both++; } }
    S.day = day0; const same = all.every(v => Te.lot(v) === first.get(v.id));
    const libAll = [].concat(...libs().map(q => adults(q.set))); let ln = 0, llow = 0; for (let d = 0; d < 30; d++) { S.day = day0 + d; for (const v of libAll) { ln++; if (Bi.lot(v) < 0.3) llow++; } } S.day = day0;
    // (asked a thousand times: the world's chance where it was, the world as it was)
    const rng0 = S.rng; const canon0 = JSON.stringify([S.acts.length, [...S.villagers.values()].map(v => [v.id, v.task ? v.task.type : '', v.bathDay, v.readDay]), baths().map(q => JSON.stringify((Te.dia(q) || {}).data || 0)), libs().map(q => JSON.stringify(q.livros || 0))]);
    let asked = 0; for (const v of all.concat(libAll)) { Te.urge(v, null); Te.pick(v); Bi.urge(v, null); Bi.pick(v); for (const q of baths()) if (q.set === v.set) Te.wish(v, q); asked++; }
    G.inSim--; let out = 0; try { for (const v of all.slice(0, 200)) { Te.urge(v, null); Bi.urge(v, null); out++; } } finally { G.inSim++; }
    const canon1 = JSON.stringify([S.acts.length, [...S.villagers.values()].map(v => [v.id, v.task ? v.task.type : '', v.bathDay, v.readDay]), baths().map(q => JSON.stringify((Te.dia(q) || {}).data || 0)), libs().map(q => JSON.stringify(q.livros || 0))]);
    ok('a3 o dia de cada um: a sorte do dia espalhada por igual, outra a cada dia, a mesma o dia inteiro — e a vontade não tira do acaso do mundo nem muda o mundo, pedida de dentro ou de fora do passo',
      Math.abs(low / n - 0.3) < 0.03 && Math.abs(sum / n - 0.5) < 0.03 && Math.abs(both / all.length - 0.09) < 0.05 && same && Math.abs(llow / Math.max(1, ln) - 0.3) < 0.04 && S.rng === rng0 && canon1 === canon0 && asked > 50,
      `${all.length} adultos das cidades com banhos × 30 dias: ${pct(low, n)} com a sorte abaixo de 0,30 (a média ${(sum / n).toFixed(3)}); ${pct(both, all.length)} abaixo de 0,30 dois dias seguidos (o acaso daria 9%); a mesma pedida duas vezes: ${same ? 'sim' : 'NÃO'}; a da leitura: ${pct(llow, ln)}; ${asked} pessoas perguntadas no passo e ${out} fora dele: o acaso do mundo ${S.rng === rng0 ? 'no mesmo ponto' : 'ANDOU'}, o mundo ${canon1 === canon0 ? 'igual' : 'MUDOU'}`);
  });
  // ---------------------------------------------------------------- a4
  if (on('a4')) god(() => {
    S.time = 0.4; const lb = libs().filter(q => lit(q) && Bi.aberta(q)).sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id)[0];
    if (!lb) { ok('a4 a biblioteca', false, `${WORLD}: nenhuma biblioteca aberta de um povo com a escrita`); return; }
    const ls = setOf(lb); const lf = G.Fac.get(facOf(lb));
    const p = adults(ls.id).filter(v => v.age >= 20 && v.age < 55 && homeOf(v) && !v.jail && !v.aboard && !(G.Expe && G.Expe.memberOf(v.id)))[0];
    const s0 = snap(p); const t0 = p.task; const role0 = p.role, grp0 = p.grp, tr0 = p.traits, home0 = p.home; ready(p, lb);
    const homes = [...S.buildings.values()].filter(q => q.set === ls.id && q.built && G.BDEF[q.type].housing).sort((a, c) => G.dist(a.x, a.y, lb.x, lb.y) - G.dist(c.x, c.y, lb.x, lb.y) || a.id - c.id);
    p.home = homes[0].id; p.role = 'agricultor'; p.grp = 'povo'; p.traits = ['Trabalhador'];
    const w = () => r2(Bi.wish(p, lb)); const plain = w();
    p.traits = ['Curioso']; const cur = w(); p.traits = ['Trabalhador'];
    p.role = 'sacerdote'; const priest = w(); p.role = 'escriba'; const scribe = w(); p.role = 'agricultor';
    p.grp = 'nobreza'; const noble = w(); p.grp = 'mercadores'; const merch = w(); p.grp = 'povo';
    p.traits = ['Curioso']; p.grp = 'nobreza'; const both = w(); p.home = homes[homes.length - 1].id; const farW = w(); p.home = homes[0].id;
    // (a curious noble whose day it is: the wish, and each thing that stops it)
    const day0 = S.day; let d = 0; while (d < 60 && !(Bi.lot(p) < Bi.wish(p, lb))) { d++; S.day = day0 + d; }
    S.time = Math.max(0.4, Bi.hourOf(p, lb) + 0.01); const u0 = Bi.urge(p, null); const z = {};
    const tryIt = (name, put, undo) => { put(); z[name] = Bi.urge(p, null); undo(); };
    tryIt('o corpo do deus', () => { S.avatar = { id: p.id, kind: 'humano' }; }, () => { S.avatar = null; });
    tryIt('uma carga nas mãos', () => { p.carry = { k: 'wood', n: 1 }; }, () => { p.carry = null; });
    tryIt('preso', () => { p.jail = 9; }, () => { p.jail = 0; });
    tryIt('com fome', () => { p.hunger = Bi.HUNGRY + 5; }, () => { p.hunger = 20; });
    tryIt('já leu hoje', () => { p.readDay = S.day; }, () => { p.readDay = 0; });
    tryIt('o povo sem a escrita', () => { delete lf.tech.known.escrita; }, () => { lf.tech.known.escrita = 1; });
    { const keep = lb.livros; tryIt('as mesas cheias', () => { lb.livros = { day: S.day, lidos: 0, copias: 0, pts: 0, quem: {} }; for (let i = 0; i < Bi.tables(lb); i++) lb.livros.quem[9000000 + i] = { t: S.clock, dur: 20 }; }, () => { lb.livros = keep; }); }
    tryIt('fechada', () => { S.time = Bi.horas(lb).fecha + 0.01; }, () => { S.time = 0.4; });
    tryIt('sem tempo antes de fechar', () => { S.time = Bi.horas(lb).fecha - 0.05; }, () => { S.time = 0.4; });
    tryIt('quem não lê', () => { p.traits = ['Trabalhador']; p.grp = 'povo'; }, () => { p.traits = ['Curioso']; p.grp = 'nobreza'; });
    z['uma tarefa de peso em curso'] = Bi.urge(p, { type: 'farm', pri: 1 }); const stay = Bi.urge(p, { type: 'ler', pri: Bi.PRI, st: 0 }), seated = Bi.urge(p, { type: 'ler', pri: Bi.PRI, st: 1 });
    // (the stoker of the town's baths, their day open and the fire out, does not leave the furnace for a scroll: D-204)
    { const bb = baths().find(q => q.set === ls.id && Te.dia(q) && Te.inHours(q)); if (bb) { const o2 = Te.dia(bb); const r0 = p.role, j0 = p.job, c0 = o2.data.calor; p.role = 'foguista'; p.job = bb.id; o2.data.calor = 0; z['o foguista com a fornalha por alimentar'] = Bi.urge(p, null); p.role = r0; p.job = j0; o2.data.calor = c0; } }
    const known = lf.tech.known.escrita; S.day = day0;
    p.role = role0; p.grp = grp0; p.traits = tr0; p.home = home0; Object.assign(p, s0); p.task = t0;
    const badZ = Object.keys(z).filter(k => z[k] !== 0);
    ok('a4 a biblioteca: lê o curioso, o sacerdote, o escriba, o nobre e o mercador — o lavrador comum não; quem mora longe, menos; cada impedimento zera a vontade', plain === 0 && cur > 0 && priest > 0 && scribe > 0 && noble > 0 && merch > 0 && both > cur && farW < both && u0 >= 0.6 && !badZ.length && stay === 1 && seated === Bi.IN && !!known,
      `${ls.name} (${civOfSet(ls)}): a parte dos dias com leitura — lavrador ${plain} · curioso ${cur} · sacerdote ${priest} · escriba ${scribe} · nobre ${noble} · mercador ${merch} · nobre curioso ${both}, morando a ${G.dist(homes[homes.length - 1].x, homes[homes.length - 1].y, lb.x, lb.y).toFixed(0)} casas ${farW}; no dia dele a vontade ${u0}; ${Object.keys(z).length} impedimentos → ${badZ.length ? 'NÃO ZEROU: ' + badZ.map(k => `${k} ${z[k]}`).join(', ') : '0'} (${Object.keys(z).join(', ')}); já a caminho ${stay}, já à mesa ${seated}`);
  });
  ok('a o verificador e os erros depois da mão da prova', !novas().length && !mine().length && M.limpo(), novas().concat(mine().map(q => q.msg)).slice(0, 3).join(' | ') || (M.limpo() ? 'limpo' : JSON.stringify(M.erros()).slice(0, 200)));
}

// ================================================================ the watch: what the world does, seen from outside
// (hooks on the doors — the wish's own going, the ledger, the quarter's life — and a look a second; nothing is changed)
function watch() {
  const S = G.S; const w = { go: [], goLib: [], led: [], notes: { banho: 0, saber: 0 }, ops: new Map(), lib: new Map(), ent: new Map(), again: [], dips: [], door: [], dropped: {}, bad: [], readers: new Map(), off: [] };
  w.duty = []; // (the stoker at his post who was given a wish's errand: the bath, the scroll, the theatre, the tavern)
  const tg0 = G.Teatro.go; G.Teatro.go = function (v, H) { const d = Te.onDuty(v); const t = tg0.apply(this, arguments); if (t && d) w.duty.push(`${v.name} #${v.id} ao teatro no dia ${S.day} às ${S.time.toFixed(2)}`); return t; };
  const tv0 = E.tavernTask; E.tavernTask = function (v, H) { const d = Te.onDuty(v); const t = tv0.apply(this, arguments); if (t && d) w.duty.push(`${v.name} #${v.id} à taverna no dia ${S.day} às ${S.time.toFixed(2)}`); return t; };
  const pre = v => ({ id: v.id, t: S.time, day: S.day, duty: Te.onDuty(v), sleeping: !!v.sleeping, carry: !!(v.carry && v.carry.n > EPS), hands: Vg.handsBusy(v), body: A.isBody(v), pri: v.task ? (v.task.pri || 0) : -1, cur: v.task ? v.task.type : '', role: v.role, sick: v.sick > 0, age: v.age, grp: v.grp, set: v.set, inside: v.inside });
  const go0 = Te.go; Te.go = function (v, H) { const p = pre(v); const b = Te.pick(v); if (b) { p.b = b.id; p.hour = Te.hourOf(v, b); p.far = farOf(v, b); p.lot = Te.lot(v); p.wish = Te.wish(v, b); p.fecha = Te.horas(b).fecha; p.abre = Te.horas(b).abre; p.d0 = G.dist(v.x, v.y, ...Vg.door(b)); } const t = go0.apply(this, arguments); if (t) w.go.push(p); return t; };
  const lg0 = Bi.go; Bi.go = function (v, H) { const p = pre(v); const b = Bi.pick(v); if (b) { p.b = b.id; p.hour = Bi.hourOf(v, b); p.far = farOf(v, b); p.lot = Bi.lot(v); p.wish = Bi.wish(v, b); } const t = lg0.apply(this, arguments); if (t) w.goLib.push(p); return t; };
  const tap = e => { if (e[8] === 'termas' || e[8] === 'termas-volta' || e[8] === 'fornalha') w.led.push(e.slice()); }; D.onMove.push(tap);
  const nb0 = U.noteB; U.noteB = function (b, k, n) { if (b && b.type === 'banhos' && k === 'noite') w.notes.banho += n === undefined ? 1 : n; if (b && b.type === 'biblioteca' && k === 'saber') w.notes.saber += n === undefined ? 1 : n; return nb0.apply(this, arguments); };
  const errand = new Map(); // (who has the errand of the baths: id → { b, st, t0 })
  let open = new Set(); // (the entries in a day's book now: one that leaves it is closed there — bathed or not, read at that moment)
  const shutEntry = k => { const e = w.ent.get(k); if (!e || e.gone) return; e.gone = true; const v = S.villagers.get(e.id); e.bathed = e.done || !!(v && v.bathDay === e.day); e.now = v ? (v.task ? v.task.type + ':' + (v.task.pri || 0) : 'nada') : 'morreu'; if (!e.body && !e.bathed) w.dips.push(e); };
  w.look = function () {
    const seen = new Set();
    for (const op of A.all()) {
      if (op.def !== 'termas' || !op.data) continue; const d = op.data; let r = w.ops.get(op.id);
      if (!r) w.ops.set(op.id, r = { id: op.id, day: d.day, at: op.at, set: op.set, fac: op.fac, ent: 0, len: 0, q: 0, f: 0, rec: 0, max: 0, coin: E.coinage(op.fac), over: 0 });
      r.ent = Math.max(r.ent, d.entradas || 0); r.len = Math.max(r.len, d.lenha || 0); r.q = Math.max(r.q, d.quentes || 0); r.f = Math.max(r.f, d.frios || 0); if (A.live(op)) r.rec = d.receita || 0;
      if (!A.live(op)) continue; const b = S.buildings.get(op.at); let inW = 0;
      for (const id in d.banho) { const m = d.banho[id]; if (m.st === 2) inW++; const k = op.id + ':' + id + ':' + m.t; seen.add(k); if (!w.ent.has(k)) { const v = S.villagers.get(+id); w.ent.set(k, { id: +id, day: d.day, op: op.id, t: S.time, body: !!m.body, had: !!(v && v.bathDay === S.day), done: false, paid: m.paid || 0, st: m.st, last: S.time, dur: m.dur }); if (v && v.bathDay === S.day && !m.body) w.again.push(`${v.name} #${v.id} no dia ${S.day}`); } const e = w.ent.get(k); e.st = m.st; e.last = S.time; if (m.done) e.done = true; }
      r.max = Math.max(r.max, inW); if (b && inW > Te.places(b)) r.over++;
    }
    for (const k of open) if (!seen.has(k)) shutEntry(k);
    open = seen;
    for (const b of S.buildings.values()) {
      if (b.type !== 'biblioteca' || !b.built || !b.livros) continue; const k = b.id + ':' + b.livros.day; let r = w.lib.get(k); if (!r) w.lib.set(k, r = { at: b.id, set: b.set, day: b.livros.day, lidos: 0, copias: 0, max: 0, wrong: 0 });
      r.lidos = Math.max(r.lidos, b.livros.lidos || 0); r.copias = Math.max(r.copias, b.livros.copias || 0); const ids = Object.keys(b.livros.quem || {}); r.max = Math.max(r.max, ids.length);
      for (const id of ids) { const v = S.villagers.get(+id); w.readers.set(b.id + ':' + b.livros.day + ':' + id, 1); const pl = v && v.inside === b.id && In.table(b) ? In.placeOf(v) : null; if (v && v.inside === b.id && In.table(b) && (!pl || pl.use !== 'ler')) r.wrong++; }
    }
    // the errands of the baths: who had one on the way and has none now — entered, or dropped it (for what), or was turned at the door
    const now = new Set();
    for (const v of S.villagers.values()) { const t = v.task; if (!t || t.type !== 'termas') continue; now.add(v.id); const e = errand.get(v.id); if (!e) errand.set(v.id, { b: t.id, st: t.st, day: S.day }); else e.st = Math.max(e.st, t.st); }
    for (const [id, e] of errand) { if (now.has(id)) continue; errand.delete(id); if (e.st >= 1) continue; const v = S.villagers.get(id); const b = S.buildings.get(e.b);
      if (!v) { w.dropped['morreu'] = (w.dropped['morreu'] || 0) + 1; continue; }
      const dr = b ? Vg.door(b) : null; const at = dr && G.dist(v.x, v.y, dr[0], dr[1]) < 3.2;
      if (at && b && Te.aberta(b)) w.door.push(`${v.name} #${id} no dia ${S.day} às ${S.time.toFixed(2)}`); else { const k = v.task ? v.task.type : 'nada'; w.dropped[k] = (w.dropped[k] || 0) + 1; } }
  };
  w.close = function () { Te.go = go0; Bi.go = lg0; G.Teatro.go = tg0; E.tavernTask = tv0; U.noteB = nb0; D.onMove.splice(D.onMove.indexOf(tap), 1); for (const p of w.go.concat(w.goLib)) if (p.duty) w.duty.push(`#${p.id} ${w.go.includes(p) ? 'aos banhos' : 'à biblioteca'} no dia ${p.day} às ${p.t.toFixed(2)}`); };
  // (who paid and had no bath: by the closing — the time's rule failed —, or called away from the pegs or the water)
  w.shut = () => w.dips.filter(e => { const op = A.get(e.op); const b = op && S.buildings.get(op.at); return e.last >= (b ? Te.horas(b).fecha : 0.7) - 0.012; });
  w.away = () => { const sh = w.shut(); const o = {}; for (const e of w.dips) if (!sh.includes(e)) o[e.now] = (o[e.now] || 0) + 1; return o; };
  w.qa = function () { for (const m of novas().concat(mine().map(q => `[S${q.sev}] freguesia: ${q.msg.slice(0, 120)}`))) if (w.bad.length < 8 && !w.bad.includes(m)) w.bad.push(m); };
  return w;
}
// (the world's day is not a fixed count of seconds lived — a scene that lingers slows its clock, main.js —: every case ends
// by the world's own day and hour, and the count of seconds is only a guard)
const live = (secs, w, each) => { for (let k = 0; k < secs; k++) { M.viver(1); if (w) { w.look(); if (k % 20 === 19) w.qa(); } if (each && each(k)) return true; } return false; };

const WARLIKE = { fight: 1, combat: 1, band: 1, army: 1, siege: 1, defend: 1, raid: 1, muster: 1, flee: 1, hide: 1, fire: 1 };
// ================================================================ b: the days lived in the ready world
function partB() {
  M.pronto(WORLD); const S = G.S; rebase(); const d0 = S.day;
  // (the days lived are days of peace, by the god's own power — G.Politics.divinePeace, kept up while they last —: the ready
  // metropolis goes to war on its second or third day, by a history that a hair changes, and a town in arms has no day of
  // baths; the war is the case e3. PAZ=0: the world as it comes)
  const peace = process.env.PAZ !== '0'; const keepPeace = () => { if (peace && !(S.divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); };
  keepPeace(); const w = watch();
  const who = new Map(); // (the grown ones of the towns with baths, at each day's bath hour: for the rates)
  let mark = -1; const arms = new Map(); // (set:day → [looks in arms, looks] in the baths' hours: a town fighting has no day of baths)
  live(G.DAY_LEN * (DIAS + 1) * 4, w, k => {
    keepPeace();
    if (k % 4 === 0 && S.time > 0.3 && S.time < 0.66) for (const b of baths()) { const key = b.set + ':' + S.day; const r = arms.get(key) || [0, 0]; arms.set(key, r); for (const v of adults(b.set)) { r[1]++; const t = v.task; if (t && WARLIKE[t.type]) r[0]++; } }
    if (S.day !== mark && S.time > 0.3) { mark = S.day; for (const b of baths()) for (const v of adults(b.set)) who.set(S.day + ':' + v.id, { set: b.set, far: farOf(v, b), dirty: !!Te.DIRTY[v.role], sick: v.sick > 0, habit: ['romano', 'grego', 'classico'].includes(civOfSet(setOf(b))) }); }
    return S.day >= d0 + DIAS && S.time > 0.74;
  });
  w.close(); w.qa();
  const days = [...new Set([...w.ops.values()].map(r => r.day))].filter(d => d >= d0 && d <= d0 + DIAS).sort((a, c) => a - c);
  const full = days.filter(d => d > d0 || true); const ops = [...w.ops.values()].filter(r => full.includes(r.day));
  // ---------------------------------------------------------------- b1
  if (on('b1')) {
    // (the claim is of a town of fifty people or more, with two places in the water or more, not in arms; the small towns
    // and the baths of one place are told, and must have had someone in the days lived)
    const lines = []; let lit0 = 0, empty = 0, total = 0, warDays = 0, small = 0, smallNone = 0;
    const inArms = r => { const q = arms.get(r.set + ':' + r.day); return !!q && q[1] > 0 && q[0] / q[1] >= 0.15; };
    for (const b of baths()) { const L = ops.filter(r => r.at === b.id).sort((a, c) => a.day - c.day); if (!L.length) continue; const e = L.reduce((s, r) => s + r.ent, 0); total += e; const calm = L.filter(r => !inArms(r));
      const big = V.pop(b.set) >= 50 && Te.places(b) >= 2; if (!big) { small++; if (!e) smallNone++; }
      for (const r of L) { if (inArms(r)) { warDays++; continue; } if (big && r.len >= 1) { lit0++; if (r.ent < 1) empty++; } }
      lines.push(`${setOf(b).name} (${V.pop(b.set)} pessoas, ${Te.places(b)} ${Te.places(b) > 1 ? 'lugares' : 'lugar'} na água): ${L.map(r => `${r.ent}${r.len >= 1 ? '' : '·fria'}${inArms(r) ? '·armas' : ''}`).join(', ')} → ${calm.length ? (calm.reduce((s, r) => s + r.ent, 0) / calm.length).toFixed(1) : '—'} por dia de paz, até ${Math.max(...L.map(r => r.max))} na água de uma vez, ${(L.reduce((s, r) => s + r.len, 0) / L.length).toFixed(1)} de lenha por dia`); }
    ok(`b1 cada dia de banhos com a fornalha acesa tem banhistas, numa cidade de 50 pessoas ou mais em paz (${WORLD}, ${DIAS} dias vividos${peace ? ' na paz do deus' : ''}, ninguém mandado pela prova)`, lit0 >= 3 && !empty && total >= lit0 * 3 && !smallNone && ops.every(r => !r.over),
      `${ops.length} dias de banhos (${warDays} com a cidade em armas — 15% ou mais dos adultos em luta ou em fuga nas horas dos banhos), ${lit0} de paz com a fornalha acesa em cidades de 50 ou mais e 2 lugares ou mais: ${empty} vazios; ${small} banhos de cidade pequena ou de um lugar só, ${smallNone} sem ninguém nos dias vividos; ${total} banhos ao todo — as entradas de cada dia (·fria = sem lenha, ·armas = a cidade em armas): ${lines.join(' · ')}; vezes com mais gente na água que lugares: ${ops.reduce((s, r) => s + r.over, 0)}`);
  }
  // ---------------------------------------------------------------- b2
  if (on('b2')) {
    const per = new Map(); for (const e of w.ent.values()) if (!e.body) per.set(e.id + ':' + e.day, (per.get(e.id + ':' + e.day) || 0) + 1);
    const twice = [...per.entries()].filter(([, n]) => n > 1);
    ok('b2 ninguém se banha duas vezes no dia', w.ent.size >= 4 && !w.again.length && !twice.length, `${w.ent.size} entradas de ${new Set([...w.ent.values()].map(e => e.id)).size} pessoas: ${w.again.length} entradas de quem já se tinha banhado no dia${w.again.length ? ' (' + w.again.slice(0, 3).join('; ') + ')' : ''}; ${twice.length} pessoas com duas entradas num dia`);
  }
  // ---------------------------------------------------------------- b3
  if (on('b3')) {
    const bad = []; let paid = 0, free = 0, back = 0;
    for (const r of ops) { const L = w.led.filter(e => e[7] === r.id && e[5] === 'moedas'); const inn = L.filter(e => e[8] === 'termas'), out = L.filter(e => e[8] === 'termas-volta'); const sum = r2(inn.reduce((s, e) => s + e[6], 0) - out.reduce((s, e) => s + e[6], 0)); back += out.length;
      if (r.coin) { paid += inn.length; if (inn.length !== r.ent || Math.abs(sum - r.rec) > 0.011 || inn.some(e => Math.abs(e[6] - Te.FEE) > 1e-6 || e[4] !== 'f:' + r.fac)) bad.push(`${S.settlements.get(r.set).name} dia ${r.day}: ${r.ent} entradas, ${inn.length} linhas, o livro ${sum}, o caixa ${r.rec}`); }
      else { free += r.ent; if (inn.length || r.rec) bad.push(`${S.settlements.get(r.set).name} dia ${r.day} (sem moeda): ${inn.length} linhas, caixa ${r.rec}`); } }
    ok('b3 a entrada é a do livro-razão: uma linha «termas» de cada banhista para o tesouro do povo, a soma é o caixa do dia; nenhuma num povo sem moeda', paid + free >= 4 && !bad.length, `${paid} entradas pagas (${Te.FEE} cada), ${back} devolvidas, ${free} em povos sem moeda${bad.length ? ' — NÃO BATE: ' + bad.slice(0, 3).join('; ') : ': o livro e o caixa batem em todos os dias'}`);
  }
  // ---------------------------------------------------------------- b4
  if (on('b4')) {
    const g = w.go; const bad = g.filter(p => p.sleeping || p.carry || p.hands || p.body || p.pri >= Te.PRI || p.inside);
    const early = g.filter(p => p.t < p.abre - EPS || p.t < Math.min(p.hour, p.fecha - (p.d0 * Te.WALK + 2 + Te.DIP) / G.DAY_LEN - Te.SLACK) - 1e-4);
    const late = g.filter(p => (p.fecha - p.t) * G.DAY_LEN < p.d0 * Te.WALK + 2 + Te.DIP - 1e-6); const noLot = g.filter(p => !(p.lot < p.wish));
    const workers = g.filter(p => p.age < 62 && !p.sick && p.grp !== 'nobreza'); const morning = workers.filter(p => p.t < p.abre + (p.fecha - p.abre) * 0.25).length;
    // (who paid and had no bath: by the closing — the time's rule failed —, or called away from the pegs or the water)
    const shut = w.shut(); const dips = shut.length; const away = w.away();
    const cur = {}; for (const p of g) cur[p.cur || 'nada'] = (cur[p.cur || 'nada'] || 0) + 1;
    // (who left the pegs or the water for another wish of the day — the theatre, the tavern, a courtship, a chat, a visit)
    const WISH = { teatro: 1, tavern: 1, court: 1, social: 1, visit: 1, ler: 1, citylife: 1, rest: 1, wander: 1 }; const whim = Object.keys(away).filter(k => WISH[k.split(':')[0]]);
    // (the walk as it was: the seconds of the world's clock a tile of the straight line took, of who walked ten tiles or more)
    const pace = []; for (const p of g) { if (!(p.d0 >= 10)) continue; const e = [...w.ent.values()].find(q => q.id === p.id && q.day === p.day); if (e && e.t > p.t) pace.push((e.t - p.t) * G.DAY_LEN / p.d0); } pace.sort((a, c) => a - c);
    const pc = q => (pace.length ? pace[Math.min(pace.length - 1, Math.floor(pace.length * q))].toFixed(2) : '—');
    ok('b4 ninguém é chamado dormindo, com carga, com as mãos numa operação, com uma tarefa de peso ou sendo o corpo do deus; cada um vai na sua hora, com tempo para o banho, no dia que a sorte dele diz; quem entrou fica para o banho; o foguista não larga a fornalha por uma vontade', g.length >= 4 && !bad.length && !early.length && !late.length && !noLot.length && dips <= Math.max(1, Math.floor(w.ent.size * 0.04)) && !whim.length && !w.duty.length,
      `${g.length} idas aos banhos pela vontade: ${bad.length} de quem não podia${bad.length ? ' (' + bad.slice(0, 3).map(p => `#${p.id} ${p.sleeping ? 'dormindo' : p.carry ? 'com carga' : p.hands ? 'mãos numa operação' : p.body ? 'o corpo' : p.inside ? 'dentro de um prédio' : 'tarefa de peso ' + p.cur + ':' + p.pri}`).join('; ') + ')' : ''}; ${early.length} antes da hora, ${late.length} sem tempo, ${noLot.length} fora do dia da sorte; o que faziam antes: ${Object.entries(cur).sort((a, c) => c[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}; ${workers.length} de quem trabalha, ${morning} deles no primeiro quarto do dia dos banhos; a caminho, largaram: ${JSON.stringify(w.dropped)}; bateram na porta cheia: ${w.door.length}; pagaram e o fechar os tirou sem banho: ${dips}${dips ? ' (' + shut.slice(0, 6).map(e => { const p = g.find(q => q.id === e.id && q.day === e.day); return `#${e.id} dia ${e.day} ${p ? `saiu às ${p.t.toFixed(3)} de ${p.d0.toFixed(0)} casas (${p.cur || 'nada'})` : 'pelo passeio'}, entrou ${e.t.toFixed(3)}, ${e.st === 1 ? 'nos cabides' : 'na água'}, o banho de ${e.dur} s`; }).join('; ') + ')' : ''}; pagaram e foram chamados antes do banho: ${w.dips.length - dips} ${JSON.stringify(away)} (${whim.length ? 'POR OUTRA VONTADE DO DIA: ' + whim.join(', ') : 'nenhum por outra vontade do dia'}); o foguista com a fornalha por alimentar levado por uma vontade (o banho, o rolo, o teatro, a taverna): ${w.duty.length}${w.duty.length ? ' (' + w.duty.slice(0, 3).join('; ') + ')' : ''}; o passo de quem veio de 10 casas ou mais (${pace.length}): ${pc(0.5)} s por casa na mediana, ${pc(0.9)} em nove de dez, ${pc(0.999)} o mais lento (a regra conta ${Te.WALK})`);
  }
  // ---------------------------------------------------------------- b5
  if (on('b5')) {
    const bathed = new Set([...w.ent.values()].filter(e => !e.body).map(e => e.day + ':' + e.id));
    const rate = f => { let n = 0, k = 0; for (const [key, p] of who) { if (!f(p)) continue; n++; if (bathed.has(key)) k++; } return [k, n]; };
    const fars = [...who.values()].map(p => p.far).sort((a, c) => a - c); const med = fars[fars.length >> 1] || 0;
    const near = rate(p => p.far <= med), far = rate(p => p.far > med), dirty = rate(p => p.dirty), clean = rate(p => !p.dirty && !p.sick), sick = rate(p => p.sick), habit = rate(p => p.habit), other = rate(p => !p.habit);
    const f = ([k, n]) => `${k} de ${n} (${pct(k, n)})`;
    ok('b5 quem mora longe vai menos (as contas dos dias vividos, por pessoa e por dia)', near[1] >= 20 && far[1] >= 20 && near[0] / near[1] > far[0] / far[1],
      `banhos por pessoa-dia: quem mora a até ${med.toFixed(0)} casas ${f(near)}, mais longe ${f(far)}; o ofício sujo ${f(dirty)}, os outros sãos ${f(clean)}; o doente ${f(sick)}; num povo da terma ${f(habit)}, nos outros ${f(other)}`);
  }
  // ---------------------------------------------------------------- b6
  if (on('b6')) {
    const lines = []; let withLit = 0, read = 0, wrong = 0;
    for (const b of libs()) { const L = [...w.lib.values()].filter(r => r.at === b.id && r.day >= d0 && r.day <= d0 + DIAS).sort((a, c) => a.day - c.day); const n = L.reduce((s, r) => s + r.lidos, 0); wrong += L.reduce((s, r) => s + r.wrong, 0);
      const el = adults(b.set).filter(v => Bi.wish(v, b) > 0).length; if (lit(b)) { withLit++; read += n; }
      lines.push(`${setOf(b).name} (${V.pop(b.set)} pessoas, ${el} que leem, ${Bi.tables(b)} lugares${lit(b) ? '' : ', SEM A ESCRITA'}): ${L.map(r => r.lidos).join(', ') || '—'} leituras por dia, até ${Math.max(0, ...L.map(r => r.max))} à mesa`); }
    const g = w.goLib; const badG = g.filter(p => p.sleeping || p.carry || p.hands || p.body || p.pri >= Bi.PRI || !(p.lot < p.wish) || !(p.wish > 0));
    ok('b6 a biblioteca tem leitores sem a mão da prova: quem lê vai por vontade sua, no dia dele, cada um num lugar de ler; o povo sem a escrita não lê', withLit >= 1 && read >= withLit && !badG.length && !wrong && g.length >= 1,
      `${lines.join(' · ')}; ${g.length} idas pela vontade (${badG.length} de quem não podia ou não lê); olhares com alguém fora de um lugar de ler: ${wrong}`);
  }
  // ---------------------------------------------------------------- b7
  if (on('b7')) {
    const ent = ops.reduce((s, r) => s + r.ent, 0) + [...w.ops.values()].filter(r => !full.includes(r.day)).reduce((s, r) => s + r.ent, 0);
    const reads = [...w.lib.values()].reduce((s, r) => s + r.lidos + r.copias, 0);
    const q = baths().map(b => { const d = U.at(b.x, b.y); return `${setOf(b).name}: ${d ? (d.whole ? 'a cidade' : d.name) + ' [' + U.tagNames(d).join(', ') + '] noite ' + ((d.vida || {}).noite || 0) : '—'}`; });
    ok('b7 a vida do bairro conta cada entrada nos banhos e cada leitura uma vez (G.Urban.note, no passo do mundo)', Math.abs(w.notes.banho - ent) <= 1 && w.notes.saber >= reads - 8 && w.notes.saber <= reads + 1 && ent >= 4,
      `${w.notes.banho} notas «noite» nos banhos para ${ent} entradas; ${w.notes.saber} notas «saber» nas bibliotecas para ${reads} leituras e cópias contadas; os bairros dos banhos no fim: ${q.join(' · ')}`);
  }
  if (on('b8')) ok('b8 o verificador (com as regras novas da freguesia) e nenhum erro nos dias vividos', !w.bad.length && M.limpo(), w.bad.slice(0, 4).join(' | ') || (M.limpo() ? `limpo (S0–S2 novas: 0; freguesia: 0) em ${DIAS} dias` : JSON.stringify(M.erros()).slice(0, 300)));
  return w;
}

// ================================================================ i: the same cause at the skip
// (the world's own time skip, G.Main.skipStep — as M.saltar —, a look at each second of it: the baths have their bathers there
// too, by the same wish; each entry is one line of the ledger and one note of the quarter's life; nobody twice a day)
function partI() {
  M.pronto(WORLD); const S = G.S; rebase(); const d0 = S.day; const anos = +(process.env.ANOS || 4);
  god(() => G.Politics.divinePeace()); const w = watch(); let k = 0;
  G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
  try { while (S.day - d0 < anos) { if (!(S.divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); G.Main.skipStep(1); w.look(); if (++k % 40 === 0) w.qa(); } } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; }
  w.close(); w.qa();
  const ops = [...w.ops.values()].filter(r => r.day >= d0 && r.day < d0 + anos); const ent = ops.reduce((s, r) => s + r.ent, 0); const bad = [];
  for (const r of ops) { const L = w.led.filter(e => e[7] === r.id && e[5] === 'moedas'); const inn = L.filter(e => e[8] === 'termas'), out = L.filter(e => e[8] === 'termas-volta'); const sum = r2(inn.reduce((s, e) => s + e[6], 0) - out.reduce((s, e) => s + e[6], 0));
    if (r.coin ? inn.length !== r.ent || Math.abs(sum - r.rec) > 0.011 : inn.length || r.rec) bad.push(`${S.settlements.get(r.set) ? S.settlements.get(r.set).name : r.set} dia ${r.day}: ${r.ent} entradas, ${inn.length} linhas, o livro ${sum}, o caixa ${r.rec}`); }
  const g = w.go; const badG = g.filter(p => p.sleeping || p.carry || p.hands || p.body || p.pri >= Te.PRI || !(p.lot < p.wish));
  const per = {}; for (const b of baths()) { const L = ops.filter(r => r.at === b.id).sort((a, c) => a.day - c.day); per[setOf(b).name] = L.map(r => r.ent).join(', '); }
  const reads = [...w.lib.values()].filter(r => r.day >= d0 && r.day < d0 + anos).reduce((s, r) => s + r.lidos, 0); const all = [...w.ops.values()].reduce((s, r) => s + r.ent, 0);
  ok(`i a mesma causa no salto (${anos} anos saltados, na paz do deus): os banhos têm banhistas pela mesma vontade, cada entrada é uma linha do livro e uma nota na vida do bairro, ninguém duas vezes no dia, ninguém chamado com as mãos ocupadas; a biblioteca tem leitores`,
    ent >= ops.length && ops.length >= anos * 2 && !bad.length && !w.again.length && !badG.length && Math.abs(w.notes.banho - all) <= 1 && reads >= 1 && !w.bad.length && M.limpo(),
    `${ops.length} dias de banhos no salto, ${ent} banhos (${(ent / Math.max(1, ops.length)).toFixed(1)} por dia e por prédio): ${Object.entries(per).map(([n, l]) => `${n} ${l}`).join(' · ')}; o livro e o caixa ${bad.length ? 'NÃO BATEM: ' + bad.slice(0, 2).join('; ') : 'batem'}; ${w.again.length} entradas de quem já se tinha banhado no dia; ${g.length} idas pela vontade, ${badG.length} de quem não podia; ${w.notes.banho} notas «noite» para ${all} entradas; ${reads} leituras; o verificador ${w.bad.length ? w.bad.slice(0, 2).join(' | ') : 'limpo'}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ================================================================ c, d, e1, e2: the thermae and the grand library by the god's hand
const TERMA = ['romano', 'grego', 'classico'];
const townsOf = c => [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && civOfSet(s) === c).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id);
// (grown people by the proof's hand about the town's middle, a coin or two in the purse, until the town has n: no town of a
// people of the thermae in the ready worlds has what the ladder asks for the great ones — T-820)
function peopleUp(set, n) {
  return god(() => { let k = 0; while (V.pop(set.id) < n && k++ < 400) { const p0 = W.nearestLand(set.cx + ((k * 7) % 13) - 6, set.cy + ((k * 5) % 11) - 5, 5); if (!p0) continue;
    const v = Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 18 + (k % 30), g: k % 2 ? 'm' : 'f' }); if (E.coinage(set.fac)) D.make('p:' + v.id, 'moedas', 2, { code: 'teste' }); }
    const f = G.Fac.get(set.fac); if (D.free('f:' + f.id, 'food') < 600) D.make('f:' + f.id, 'food', 600, { code: 'teste', part: true }); return V.pop(set.id); });
}
function stokerFor(b) {
  const f = G.Fac.get(facOf(b));
  const v = [...G.S.villagers.values()].filter(o => o.set === b.set && o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && !o.ug && o.home && !(G.Expe && G.Expe.memberOf(o.id)) && o.role !== 'guerreiro' && !(f && f.leader === o.id) && D.strength(o) > 0).sort((a, c) => (!!a.job - !!c.job) || a.id - c.id)[0];
  if (!v) return 0; Vg.endTask(v); v.role = 'foguista'; v.job = b.id; return v.id;
}
// one day of a town with the baths of a step founded by the god's hand (and, with lib, a grand library): from the morning to
// the closing, nobody sent
function handDay(step, lib, extra) {
  M.pronto(WORLD); const S = G.S; rebase();
  const set = [].concat(...TERMA.map(townsOf)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)[0]; if (!set) return { none: `${WORLD}: nenhuma cidade de um povo da terma` };
  const N0 = V.pop(set.id); const n = peopleUp(set, 260);
  // (the town's own small baths, if it has them, shut for the case: one baths at a time is the comparison)
  const old = baths().filter(b => b.set === set.id); god(() => { for (const b of old) V.removeBuilding(b); });
  // (the three sizes at the same place: the nearest lot of the greatest one — seven houses with its ring — to the town's
  // middle; each is founded about its middle)
  const at = god(() => { const g = V.handFound(set, 'banhos', 'grandes', { built: true, R: 60 }); if (!g) return null; const c = [g.x + 3, g.y + 3]; V.removeBuilding(g); return c; });
  if (!at) return { none: `${set.name}: sem lote de sete casas` };
  const b = god(() => V.handFound(set, 'banhos', step, { built: true, x: at[0], y: at[1], R: 2 })); if (!b) return { none: `${set.name}: sem lote para ${step} em ${at}` };
  const L = lib ? god(() => V.handFound(set, 'biblioteca', 'grande', { built: true, R: 60 })) : null;
  const kid = god(() => stokerFor(b)); const fid = facOf(b);
  const hold = () => god(() => { const v = S.villagers.get(kid); if (v && !v.captive && (v.role !== 'foguista' || v.job !== b.id)) { v.role = 'foguista'; v.job = b.id; } if (D.free('f:' + fid, 'wood') < 30) D.make('f:' + fid, 'wood', 40, { code: 'teste', part: true }); S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0; });
  rebase(); const w = watch(); S.time = Te.horas(b).abre - 0.02; const day = S.day; let mid = null, midInfo = null;
  // (the clock held at the opening hour until the furnace is lit — the lot of the god's hand may be far from the store, and
  // the question is who comes to hot water, the same for the three sizes: as qa/termas-grandes.js E2)
  const t1 = Te.horas(b).abre + 0.01; live(240, w, () => { hold(); if (S.time > t1) S.time = t1; const op = Te.dia(b); return !!op && op.data.lenha >= 1; });
  const lit0 = !!(Te.dia(b) && Te.dia(b).data.lenha >= 1);
  live(G.DAY_LEN * 3, w, k => { hold(); if (extra) extra(k, b, L, w);
    if (!mid && lib) { const op = Te.dia(b); const inW = op ? Object.keys(op.data.banho).filter(id => op.data.banho[id].st === 2 && !op.data.banho[id].done).map(Number) : []; const rd = L && L.livros ? Object.keys(L.livros.quem || {}).map(Number).filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'ler' && v.task.st === 1; }) : [];
      if (inW.length >= 3 && rd.length >= 1) { mid = G.Save.serialize(); midInfo = { inW, rd, op: op.id, t: S.time }; } }
    return S.day > day || S.time > Te.horas(b).fecha + 0.02; });
  w.close(); w.qa();
  const r = [...w.ops.values()].find(q => q.at === b.id) || { ent: 0, max: 0, len: 0, q: 0, f: 0 };
  const reach = god(() => adults(set.id).filter(v => G.dist(v.x, v.y, ...Vg.door(b)) < Te.REACH).length);
  return { set, b, L, w, r, N0, n, places: Te.places(b), mid, midInfo, kid, hold, day, lit0, far: G.dist(b.x + b.w / 2, b.y + b.h / 2, set.cx, set.cy), nad: adults(set.id).length, reach };
}
function partC() {
  const res = {}; const want = [['banhos', 'os banhos pequenos'], ['termas', 'as termas'], ['grandes', 'as grandes termas']];
  for (const [step] of want) {
    const withLib = step === 'grandes' && (on('d') || on('e1'));
    res[step] = handDay(step, withLib, null);
    if (res[step].none) { ok('c as termas pela mão do deus', false, res[step].none); return; }
    if (step === 'grandes') { if (on('d')) partD(res[step]); if (on('e1')) partE1(res[step]); if (on('e2')) partE2(); }
  }
  const s = res.banhos, t = res.termas, g = res.grandes;
  const tell = (x, name) => `${name} (${x.b.w} casas, ${x.places} lugares na água${x.lit0 ? '' : ', A FORNALHA NÃO ACENDEU'}): ${x.r.ent} banhos no dia (${x.r.q} quentes, ${x.r.f} frios), até ${x.r.max} na água de uma vez, ${x.r.len} de lenha, ${x.w.door.length} bateram na porta cheia, ${x.w.shut().length} pagaram e o fechar os tirou sem banho, ${x.w.dips.length - x.w.shut().length} chamados antes do banho`;
  if (on('c')) ok(`c as termas e as grandes termas pela mão do deus enchem mais que os banhos pequenos: mais banhos no dia e mais gente na água de uma vez — a mesma cidade, a mesma gente, o mesmo dia; ninguém mandado, ninguém a mais que os lugares, ninguém na porta cheia`,
    t.r.ent > s.r.ent && g.r.ent > s.r.ent && t.r.max > s.r.max && g.r.max > s.r.max && s.r.max <= s.places && t.r.max <= t.places && g.r.max <= g.places && s.r.ent >= 3 && [s, t, g].every(x => x.lit0 && !x.w.again.length && x.w.door.length <= 2 && x.w.shut().length <= 1 && !x.w.bad.length) && M.limpo(),
    `${s.set.name} (${civOfSet(s.set)}), de ${s.N0} para ${s.n} pessoas pela mão da prova (a escada pede 160 para as grandes termas), os três no mesmo lote, a ${g.far.toFixed(0)} casas do meio da cidade (${g.nad} adultos, ${g.reach} deles a menos de ${Te.REACH} casas no fim do dia): ${tell(s, 'os banhos')} · ${tell(t, 'as termas')} · ${tell(g, 'as grandes termas')}; o verificador: ${[s, t, g].map(x => x.w.bad.length).join(', ')} novas${[s, t, g].some(x => x.w.bad.length) ? ' (' + [].concat(...[s, t, g].map(x => x.w.bad)).slice(0, 2).join(' | ') + ')' : ''}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}
function partD(x) {
  const L = x.L; if (!L) { ok('d a grande biblioteca pela mão do deus', false, `${x.set.name}: sem lote para a grande biblioteca`); return; }
  const rs = [...x.w.lib.values()].filter(r => r.at === L.id); const lidos = rs.reduce((s, r) => s + r.lidos, 0), most = Math.max(0, ...rs.map(r => r.max)), wrong = rs.reduce((s, r) => s + r.wrong, 0);
  const g = x.w.goLib.filter(p => p.b === L.id); const who = new Set(g.map(p => p.id)); const el = adults(x.set.id).filter(v => Bi.wish(v, L) > 0).length;
  ok('d a grande biblioteca pela mão do deus tem leitores sem a mão da prova: quem lê vem por vontade sua, senta num lugar de ler, e a leitura conta no livro do dia',
    L.w > G.BDEF.biblioteca.w && g.length >= 3 && lidos >= 2 && lidos <= Bi.maxOf(L) && most >= 2 && most <= Bi.tables(L) && !wrong && lit(L),
    `${x.set.name}: a grande biblioteca #${L.id} (${L.w} casas, ${Bi.tables(L)} lugares de ler; ${el} adultos que leem na cidade): ${g.length} idas pela vontade de ${who.size} pessoas, ${lidos} leituras contadas no dia (o dia conta até ${Bi.maxOf(L)}), até ${most} à mesa de uma vez; olhares com alguém fora de um lugar de ler: ${wrong}`);
}
// ---------------------------------------------------------------- e1: a save in the middle, loaded twice
function partE1(x) {
  if (!x.mid) { ok('e1 um save no meio de um banho e de uma leitura', false, 'nunca houve três na água e um leitor à mesa ao mesmo tempo'); return; }
  const info = x.midInfo; const bid = x.b.id, lid = x.L.id;
  const run = () => {
    M.reseed(4242); G.Save.apply(JSON.parse(x.mid)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); const S = G.S;
    const inW = info.inW.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'termas' && v.task.st === 2 && v.inside === bid; }).length;
    const rd = info.rd.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'ler' && v.task.st === 1 && v.inside === lid; }).length;
    const w = watch(); for (let k = 0; k < 45; k++) { god(() => { const f = 'f:' + facOf(S.buildings.get(bid)); if (D.free(f, 'wood') < 30) D.make(f, 'wood', 40, { code: 'teste', part: true }); }); M.viver(1); w.look(); } w.close();
    const op = A.get(info.op); const L = S.buildings.get(lid);
    const dig = JSON.stringify([op ? [op.st, op.data.entradas, op.data.receita, op.data.lenha, op.data.quentes, op.data.frios, Object.keys(op.data.banho).sort()] : 0, L.livros ? [L.livros.lidos, Object.keys(L.livros.quem).sort()] : 0, S.rng, info.inW.concat(info.rd).map(id => { const v = S.villagers.get(id); return v ? [v.bathDay, v.readDay, v.task ? v.task.type : '', v.inside, Math.round(v.x * 10), Math.round(v.y * 10)] : 0; }), w.go.map(p => p.id), w.goLib.map(p => p.id)]);
    const bathed = info.inW.filter(id => { const v = S.villagers.get(id); return v && v.bathDay === S.day; }).length;
    return { inW, rd, dig, bathed, more: w.go.length, bad: novas().concat(mine().map(q => q.msg)) };
  };
  const a = run(), b = run();
  ok('e1 um save no meio de um banho e de uma leitura, carregado duas vezes: os mesmos de volta à água e à mesa, o banho e o rolo seguem até o fim, e o futuro é o mesmo nas duas vezes',
    a.inW === info.inW.length && a.rd === info.rd.length && a.dig === b.dig && a.bathed >= info.inW.length - 1 && !a.bad.length && !b.bad.length && M.limpo(),
    `o save às ${info.t.toFixed(2)} com ${info.inW.length} na água e ${info.rd.length} à mesa: ${a.inW} de volta na água, ${a.rd} de volta à mesa; 45 s depois, ${a.bathed} dos ${info.inW.length} com o banho de hoje, ${a.more} idas novas pela vontade; os dois futuros ${a.dig === b.dig ? 'iguais' : 'DIFERENTES'}; o verificador ${a.bad.concat(b.bad).length ? a.bad.concat(b.bad).slice(0, 2).join(' | ') : 'limpo'}`);
}
// ---------------------------------------------------------------- e2: who dies on the way, and in the water (in the world of e1's save)
function partE2() {
  const S = G.S; rebase(); S.time = Math.min(S.time, 0.5);
  let onWay = null, inW = null; const w = watch();
  for (let k = 0; k < 120 && !(onWay && inW); k++) { god(() => { for (const b of baths()) { const f = 'f:' + facOf(b); if (D.free(f, 'wood') < 30) D.make(f, 'wood', 40, { code: 'teste', part: true }); } }); M.viver(1); w.look(); if (S.time > 0.6) S.time = 0.5;
    // (the two of the same instant: one found a second ago may have got there, or left the water, while the other was looked
    // for — in the tree with the new house plans Sitamun was out of the bath and sheltering from the rain when someone on the
    // way was found, and the case read the day's book of a bather who was no bather any more. T-815)
    const still = (v, st) => !!v && S.villagers.has(v.id) && !!v.task && v.task.type === 'termas' && v.task.st === st && !!A.get(v.task.op);
    if (!still(onWay, 0)) onWay = null; if (!still(inW, 2)) inW = null;
    for (const v of S.villagers.values()) { if (!still(v, 0) && !still(v, 2)) continue; const t = v.task; if (!onWay && t.st === 0) onWay = v; if (!inW && t.st === 2 && (!onWay || v.id !== onWay.id)) inW = v; } }
  if (!onWay || !inW) { w.close(); ok('e2 quem morre a caminho e quem morre na água', false, `não achei ${onWay ? 'ninguém na água' : 'ninguém a caminho'}`); return; }
  const b1 = S.buildings.get(onWay.task.id), b2 = S.buildings.get(inW.task.id); const op2 = A.get(inW.task.op); const room0 = Te.room(b1), ent0 = op2.data.entradas, rec0 = op2.data.receita;
  const n1 = onWay.name, n2 = inW.name, id1 = onWay.id, id2 = inW.id;
  god(() => { V.kill(onWay, 'sick'); V.kill(inW, 'sick'); });
  const gone = !S.villagers.has(id1) && !S.villagers.has(id2); const out = !op2.data.banho[id2]; const room1 = Te.room(b1);
  for (let k = 0; k < 30; k++) { M.viver(1); w.look(); } w.close(); w.qa();
  const op2b = A.get(op2.id);
  ok('e2 quem morre a caminho dos banhos e quem morre na água: sai da conta de quem vem e do livro do dia, o caixa fica como estava, e o dia segue', gone && out && room1 === room0 + (b1 === b2 ? 2 : 1) && op2b.data.receita >= rec0 - 1e-6 && op2b.data.entradas >= ent0 && !w.bad.length && M.limpo(),
    `${n1} a caminho e ${n2} na água morrem: ${gone ? 'fora do mundo' : 'AINDA NO MUNDO'}, ${out ? 'fora do livro do dia' : 'AINDA NO LIVRO'}; os lugares com que mais um pode contar: ${room0} → ${room1}; o caixa ${rec0} → ${op2b.data.receita}, as entradas ${ent0} → ${op2b.data.entradas} em 30 s; o verificador ${w.bad.length ? w.bad.slice(0, 2).join(' | ') : 'limpo'}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ================================================================ e3: the town at war
function partE3() {
  M.pronto(WORLD); const S = G.S; rebase();
  const b = baths().sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id)[0]; const set = setOf(b); const f = G.Fac.get(set.fac);
  const foe = [...S.factions.values()].filter(q => q.id !== f.id && q.alive !== false && G.Fac.pop(q.id) > 10).sort((a, c) => G.Fac.pop(c.id) - G.Fac.pop(a.id) || a.id - c.id)[0];
  god(() => { if (G.Fac.rel) G.Fac.rel(f.id, foe.id); const dp = S.divinePeace; S.divinePeace = 0; G.Politics.declareWar(f, foe, 'ambicao'); S.divinePeace = dp; });
  const war = G.Fac.atWar(f.id, foe.id); const w = watch(); S.time = 0.24; const day = S.day;
  let arms = 0, taken = 0;
  live(G.DAY_LEN * 3, w, () => { for (const v of S.villagers.values()) { if (v.set !== set.id || !v.task) continue; if (WARLIKE[v.task.type]) arms++; } return S.day > day || S.time > 0.71; });
  w.close(); w.qa(); const g = w.go.filter(p => p.set === set.id); const fromWar = g.filter(p => WARLIKE[p.cur] || p.pri >= Te.PRI); taken = fromWar.length;
  const r = [...w.ops.values()].find(q => q.at === b.id) || { ent: 0 };
  ok('e3 a cidade em guerra: quem está em armas não larga nada pelo banho; o dia dos banhos segue com quem está livre; o verificador e nenhum erro', war && !taken && !w.bad.length && !w.again.length && M.limpo(),
    `${f.name} em guerra com ${foe.name}: em ${set.name}, ${arms} olhares de gente em armas ou em fuga no dia; ${g.length} idas aos banhos pela vontade, ${taken} delas de quem estava em armas ou com tarefa de peso; ${r.ent} banhos no dia; o verificador ${w.bad.length ? w.bad.slice(0, 2).join(' | ') : 'limpo'}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ================================================================ e4: a people without the coin
function partE4() {
  const sm = M.semMoeda('cidade'); const S = G.S; rebase();
  try {
    const sets = [...S.settlements.values()].filter(s => sm.povos.has(s.fac) && V.pop(s.id) >= 8).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
    let set = null, b = null; for (const s of sets) { b = baths().find(q => q.set === s.id) || god(() => V.handFound(s, 'banhos', 'banhos', { built: true, R: 40 })); if (b) { set = s; break; } }
    if (!b) { ok('e4 o povo sem moeda', false, `nenhuma cidade de um povo sem moeda com lote para os banhos (${sets.length} cidades)`); return; }
    const kid = god(() => stokerFor(b)); const fid = facOf(b);
    const hold = () => god(() => { const v = S.villagers.get(kid); if (v && !v.captive && (v.role !== 'foguista' || v.job !== b.id)) { v.role = 'foguista'; v.job = b.id; } if (D.free('f:' + fid, 'wood') < 30) D.make('f:' + fid, 'wood', 40, { code: 'teste', part: true }); S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0; });
    rebase(); const w = watch(); S.time = Te.horas(b).abre - 0.03; const d0 = S.day; let days = 0;
    // (a small town: a few days, until five have bathed — the day's lot of each one)
    live(G.DAY_LEN * 12, w, () => { hold(); if (S.time > 0.72 && S.time < 0.73) days = S.day - d0 + 1; if (S.day >= d0 + 4) return true; return [...w.ops.values()].filter(q => q.at === b.id).reduce((s, q) => s + q.ent, 0) >= 5 && S.time > 0.71; });
    w.close(); w.qa(); const ops = [...w.ops.values()].filter(q => q.at === b.id); const ent = ops.reduce((s, q) => s + q.ent, 0);
    const lines = w.led.filter(e => e[5] === 'moedas' && ops.some(q => q.id === e[7])); const rec = ops.reduce((s, q) => s + q.rec, 0);
    ok('e4 o povo sem moeda: entra sem pagar — nenhuma linha de moeda no livro, o caixa em zero —, e a vida do bairro conta a entrada', !E.coinage(fid) && ent >= 3 && !lines.length && rec === 0 && w.notes.banho === ent && !w.bad.length && M.limpo(),
      `${set.name} (${civOfSet(set)}, ${V.pop(set.id)} pessoas, ${sm.novo ? 'um mundo novo' : 'o mundo pronto «cidade»'}; ${Te.places(b)} lugares na água): ${ent} banhos em ${ops.length} dias de banhos, ${lines.length} linhas de moeda, o caixa ${rec}; ${w.notes.banho} notas na vida do bairro; ${w.go.length} idas pela vontade; o verificador ${w.bad.length ? w.bad.slice(0, 2).join(' | ') : 'limpo'}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
  } finally { sm.solta(); }
}

// ================================================================ e5: the god pulls the baths down, people inside and on the way
function partE5() {
  M.pronto(WORLD); const S = G.S; rebase();
  const b = baths().filter(q => Te.places(q) >= 4).sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id)[0]; const set = setOf(b); const w = watch(); S.time = 0.40;
  let seen = false; const cnt = () => { let way = 0, inn = 0; for (const v of S.villagers.values()) { const t = v.task; if (t && t.type === 'termas' && t.id === b.id) { if (t.st === 0) way++; else inn++; } } return [way, inn]; };
  live(160, w, () => { god(() => { const f = 'f:' + facOf(b); if (D.free(f, 'wood') < 30) D.make(f, 'wood', 40, { code: 'teste', part: true }); }); if (S.time > 0.56) S.time = 0.46; const [way, inn] = cnt(); seen = way >= 1 && inn >= 1; return seen; });
  const [way, inn] = cnt(); const ids = [...S.villagers.values()].filter(v => v.task && v.task.type === 'termas' && v.task.id === b.id).map(v => v.id); const bid = b.id; const nm = V.buildName(b);
  // (the day ended by the baths' own door, then the building gone: at that very moment — no step lived — nobody has the
  // errand any more, on the way or inside: L-910)
  god(() => { Te.close(Te.dia(b), 'o deus'); V.removeBuilding(b); });
  const now = ids.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'termas'; }).length;
  live(3, w); const left = ids.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'termas'; }).length; const inside = ids.filter(id => { const v = S.villagers.get(id); return v && v.inside === bid; }).length;
  const urges = god(() => adults(set.id).filter(v => baths().every(q => q.set !== set.id) && Te.urge(v, null) > 0).length);
  live(20, w); w.close(); w.qa();
  ok('e5 o deus fecha o dia e derruba os banhos com gente dentro e a caminho: as idas acabam na hora, ninguém fica dentro, ninguém mais quer ir, e o mundo segue limpo', seen && !now && !left && !inside && !urges && !w.bad.length && M.limpo(),
    `${nm} de ${set.name} com ${inn} lá dentro e ${way} a caminho: o dia fechado e o prédio derrubado; na hora ${now} ainda com a ida; 3 s depois ${left}, ${inside} ainda dentro; ${urges} com vontade de um banho que não existe; o verificador ${w.bad.length ? w.bad.slice(0, 2).join(' | ') : 'limpo'}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ================================================================ h: the checker catches the lie
function partH() {
  M.pronto(WORLD); const S = G.S; S.time = 0.45; M.viver(2);
  const b = baths().filter(q => Te.dia(q))[0]; const op = Te.dia(b); const lb = libs().filter(lit)[0];
  const clean0 = mine().length; const seen = {};
  const p = adults(b.set).filter(v => !v.jail && !v.aboard && v.age < 55 && !(v.task && (v.task.pri || 0) >= 3))[0]; const t0 = p.task, c0 = p.carry, cap0 = p.captive, bd0 = p.bathDay;
  const lie = (name, put, undo, re) => { put(); const L = mine(); seen[name] = L.find(q => re.test(q.msg)) || null; undo(); };
  lie('o cativo a caminho', () => { p.captive = 1; p.task = { type: 'termas', id: b.id, op: op.id, pri: 0.4, st: 0 }; }, () => { p.captive = cap0; p.task = t0; }, /cativo com a ida aos banhos/);
  lie('a carga a caminho', () => { p.carry = { k: 'wood', n: 2 }; p.task = { type: 'termas', id: b.id, op: op.id, pri: 0.4, st: 0 }; }, () => { p.carry = c0; p.task = t0; }, /com uma carga nas mãos/);
  lie('dois banhos num dia', () => { p.bathDay = S.day; op.data.banho[p.id] = { t: S.clock, st: 1, hot: 0, dur: 20, paid: 0 }; }, () => { p.bathDay = bd0; delete op.data.banho[p.id]; }, /dois banhos num dia/);
  if (lb) { const q = adults(lb.set)[0]; const f = G.Fac.get(facOf(lb)); const qt = q.task, rd0 = q.readDay, lv = lb.livros;
    lie('a leitura sem a escrita', () => { delete f.tech.known.escrita; q.task = { type: 'ler', id: lb.id, pri: 0.35, st: 0 }; }, () => { f.tech.known.escrita = 1; q.task = qt; }, /povo sem a escrita/);
    lie('dois rolos num dia', () => { q.readDay = S.day; q.task = { type: 'ler', id: lb.id, pri: 0.35, st: 1 }; lb.livros = { day: S.day, lidos: 0, copias: 0, pts: 0, quem: { [q.id]: { t: S.clock, dur: 20 } } }; }, () => { q.readDay = rd0; q.task = qt; lb.livros = lv; }, /dois rolos num dia/); }
  const clean1 = mine().length; const names = Object.keys(seen); const missed = names.filter(k => !seen[k]);
  ok('h o verificador (qa/freguesia-inv.js) pega a mentira — o cativo e a carga a caminho, dois banhos e dois rolos num dia, a leitura num povo sem a escrita —, e nada sem ela', names.length >= (lb ? 5 : 3) && !missed.length && !clean0 && !clean1 && seen['o cativo a caminho'].sev === 2,
    `${names.map(k => `${k}: ${seen[k] ? 'S' + seen[k].sev : 'NADA'}`).join(' · ')}; sem a mentira: ${clean0} antes, ${clean1} depois`);
}

// ================================================================
if (on('a')) partA();
if (on('b')) partB();
if (on('i')) partI();
if (on('c') || on('d') || on('e1') || on('e2')) partC();
if (on('e3')) partE3();
if (on('e4')) partE4();
if (on('e5')) partE5();
if (on('h')) partH();
ok('erros', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso no console' : JSON.stringify(M.erros()).slice(0, 400));
console.log(fails.length ? `\nFALHOU: ${fails.length} (${fails.join(', ')})` : '\nPASSOU');
process.exit(fails.length ? 1 : 0);
