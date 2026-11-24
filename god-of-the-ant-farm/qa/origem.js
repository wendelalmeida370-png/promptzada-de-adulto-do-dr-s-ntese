// origem: a origem das coisas (a parte 20h; D-440, D-441 a D-449) — nada vem do nada, provado de propósito, em Node, num mundo
// pronto (o «cidade», de antes das jazidas novas: ele abre como um save de antes) e num mundo novo.   [ONLY=o1,o3] node qa/origem.js
//  o1 as jazidas: o cobre (nas colinas e no chão rochoso, o mais comum) e o estanho (raro: no granito do alto e no cascalho de rio)
//     estão no mundo, onde a pedra os põe; o ferro e o ouro de um save de antes ficam onde estavam; o mesmo mundo da mesma semente
//     tem as mesmas jazidas; um save de antes recebe as que faltam pela semente, uma vez (S.oresV);
//  o2 a mina é a mesma, e o veio diz o que ela tira: um turno numa mina de cobre põe cobre nas mãos (no livro, «mina»), e o povo
//     passa a ter tido cobre; o planejador abre mina de cobre para quem sabe o bronze, de ferro só para quem sabe o ferro, e só
//     enquanto o povo precisa (com cobre de sobra no armazém, nenhuma mina nova, nenhum mineiro pedido);
//  o3 a forja parada sem metal: o povo do bronze sem cobre não forja; com cobre e sem estanho também não; com os dois, uma fornada
//     de bronze — o estanho vai ao cadinho pelo livro («liga»), as armas nascem de bronze, e o povo passou a ter tido bronze;
//  o4 o povo sem metal: o povo do bronze que nunca teve cobre e estanho desenha os guerreiros de lança de pedra e escudo de madeira
//     (e sem elmo, se nunca teve couro); depois da fornada de bronze, a lança é de bronze; o armazém dá o que a divisão tem;
//  o5 o couro só de quem caça ou abate: sem couro, nem elmo nem couraça de couro; o couro da caça entra, e o elmo de couro aparece;
//  o6 a cerveja só de cereal: a cuba não começa com peixe na prateleira, começa com cevada, e gasta a cevada (o peixe fica);
//  o7 a vila de pescadores: um povo só de peixe — o taverneiro compra comida —: nenhum grão sem fonte; o que chega à taverna é o
//     que o comércio trouxe pelo cais e pelas carroças, e sem ele nenhuma cerveja (T-1628);
//  o8 o prato: um prato de peixe só onde há peixe na prateleira (e a fala diz o prato do que se come);
//  o9 a divisão soma a contagem: dois dias vividos, cada armazém com as partes iguais ao que tem, nenhuma comida nova de origem
//     desconhecida das portas já ligadas, e o verificador limpo (o sistema «origem»);
//  o10 o save no meio: a divisão, o que cada povo teve e uma fornada de bronze pela metade voltam iguais, e a fornada acaba;
//  o11 o save antigo: o qa/oldsave_7.json (só lido) abre sem erro, ganha as jazidas novas e a divisão pelo palpite honesto;
//  o12 a mão do deus na jazida: o meteoro derruba a mina, e a jazida fica livre de novo para outra mina (L-1361);
//  o13 o povo que acaba: as partes e o que ele teve não dão erro, e nada é feito do nada depois;
//  o14 o pulque: sem o maguey no mundo, o povo do pulque faz a cerveja do seu milho;
//  o15 a salga: com só grão, nem busca nem salga; a busca traz o peixe, não o trigo; do peixe o bacalhau, da carne a carne-seca.
const fs = require('fs'), path = require('path');
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'qa/origem-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | origem ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const D = G.Depot, E = G.Eco, O = G.Origem, V = G.Village, W = G.W, T = G.T, Of = G.Oficio, A = G.Act;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const byId = (a, b) => a.id - b.id;
let S = null;
const open = () => { S = M.pronto('cidade'); M.viver(1); return S; };
const people = f => [...S.villagers.values()].filter(f).sort(byId);
const grown = v => v.age >= 18 && v.age < 55 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && !v.air;
const facs = () => [...S.factions.values()].filter(f => f.alive !== false && G.Fac.pop(f.id) > 0).sort(byId);
const capOf = f => G.Fac.capitalOf(f.id);
const parts = (ref, k) => O.parts(ref, k);
const lastN = () => { const L = D.ledger(); return L.length ? L[L.length - 1][0] : 0; };
const lines = (n0, f) => D.ledger().filter(e => e[0] > n0 && (!f || f(e)));
const teach = (f, t) => god(() => { if (!f.tech.known[t]) G.Civ.learn(f, t, 'divina'); });
const give = (ref, k, n, of, code) => god(() => D.make(ref, k, n, { code: code || 'teste', part: true, of }));
const clear = (ref, k) => god(() => { const n = D.get(ref, k); if (n > 1e-6) D.use(ref, k, n, { code: 'teste', mine: true }); });
const errs = () => { const e = M.erros(); return Object.keys(e.mod).length || e.console.length ? `erros: ${JSON.stringify(e.mod)} ${e.console.slice(0, 3).join(' | ')}` : ''; };
const viol = sys => QA.check().filter(q => q.sev <= 2 && (!sys || q.sys === sys)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
// (a building of a type in a town, built by the proof's hand where the planner would put it — or the one already there)
function building(set, type) {
  const b0 = E.byType(set.id, type)[0]; if (b0) return b0;
  const pos = V.findSite(set, type); if (!pos) return null;
  return god(() => V.addBuilding(type, pos[0], pos[1], set.id, true));
}
// (a tavern of the world — of a people, if asked —, its work finished by the proof's hand when the world has it still in work)
function tavern(f) {
  const L = [...S.buildings.values()].filter(b => b.type === 'taverna' && (!f || V.facOfSet(b.set) === f.id)).sort(byId);
  // (a people with none — the ready world made again may have its first tavern still to come: the god's hand founds one in its
  // capital, as the people knows how to raise it, T-1627)
  if (!L.length && f && capOf(f)) { const t = god(() => V.handFound(capOf(f), 'taverna', G.Escala.n0('taverna'), { built: true, R: 40 })); if (t) L.push(t); }
  const b = L.find(x => x.built) || L[0]; if (!b) return null;
  if (!b.built) god(() => V.completeBuilding(b));
  return b.built ? b : null;
}
// (a warrior of a people, as a copy: the kit reads it, never writes)
const warrior = f => { const o = people(x => x.set === capOf(f).id && grown(x))[0]; return o ? Object.assign({}, o, { role: 'guerreiro', unit: null, arm: null, act: '', carry: null, elite: null, gear: null }) : null; };
const kindOf = k => (k ? G.Itens.parse(k)[0] : null);
const matOf = k => (k ? G.Itens.def(k).mat : null);

// ================================================================ o1 the deposits
if (on('o1')) {
  // (a save from before the deposits of the bronze — the old save of the proofs, read only: the ready worlds are made again with
  // them in, T-1499 —: the load gives it the ones it lacks, and its iron and gold stay where they were)
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'oldsave_7.json'), 'utf8'));
  const bad = []; if (raw.oresV || (raw.ores || []).some(o => o.kind === 'cobre' || o.kind === 'estanho')) bad.push('o save antigo já tem as jazidas do bronze');
  M.abrir(JSON.parse(JSON.stringify(raw))); S = G.S; M.viver(1);
  const by = k => S.ores.filter(o => o.kind === k);
  const cu = by('cobre'), sn = by('estanho');
  if (S.oresV !== 2) bad.push('a versão das jazidas ' + S.oresV);
  if (cu.length < 4 || sn.length < 2 || sn.length >= cu.length) bad.push(`cobre ${cu.length}, estanho ${sn.length}`);
  const N = G.N; const river = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (W.inb(x + dx, y + dy) && S.type[(y + dy) * N + x + dx] === T.RIVER) return true; return false; };
  for (const o of cu) { const i = o.y * N + o.x; if (!(S.type[i] === T.ROCKY || W.tileH(i) > G.SEA + 2.0)) bad.push(`cobre fora das colinas em ${o.x},${o.y}`); }
  for (const o of sn) { const i = o.y * N + o.x; if (!((S.type[i] === T.ROCKY && W.tileH(i) > G.SEA + 3.0) || river(o.x, o.y))) bad.push(`estanho fora do granito e do rio em ${o.x},${o.y}`); }
  const old = (raw.ores || []).map(o => o.kind + o.x + ',' + o.y + ':' + o.id).join(';'); const now = S.ores.filter(o => o.kind === 'ferro' || o.kind === 'ouro').map(o => o.kind + o.x + ',' + o.y + ':' + o.id).join(';');
  if (old !== now) bad.push('o ferro e o ouro do save mudaram');
  // (the same seed, the same deposits; and a save of the world carries them as they are)
  const a = M.novo({ seed: 7, type: 'ilha', size: 64, tribes: 2 }); M.viver(0.2); const k1 = JSON.stringify(a.ores.map(o => [o.kind, o.x, o.y, o.max]));
  const b = M.novo({ seed: 7, type: 'ilha', size: 64, tribes: 2 }); M.viver(0.2); const k2 = JSON.stringify(b.ores.map(o => [o.kind, o.x, o.y, o.max]));
  if (k1 !== k2) bad.push('a mesma semente, outras jazidas');
  M.salvarCarregar(); const k3 = JSON.stringify(G.S.ores.map(o => [o.kind, o.x, o.y, o.max])); if (k3 !== k2 || G.S.oresV !== 2) bad.push('o save mudou as jazidas');
  const kinds = {}; for (const o of G.S.ores) kinds[o.kind] = (kinds[o.kind] || 0) + 1;
  ok('o1 as jazidas: o cobre das colinas, o estanho raro, onde a pedra os põe', !bad.length && !errs(), `o save antigo das provas (de antes das jazidas): ${cu.length} de cobre, ${sn.length} de estanho, o ferro e o ouro onde estavam; mundo novo (ilha 64): ${JSON.stringify(kinds)}, iguais na mesma semente e depois do save${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o2 the mine
if (on('o2')) {
  open(); const bad = [];
  const f = facs().find(q => !q.tech.known.bronze) || facs()[0]; const set = capOf(f);
  const oWant = { cobre: E.oreWanted(f.id, 'cobre'), ferro: E.oreWanted(f.id, 'ferro'), ouro: E.oreWanted(f.id, 'ouro') };
  if (oWant.cobre || oWant.ferro || !oWant.ouro) bad.push('o planejador sem o bronze: ' + JSON.stringify(oWant));
  teach(f, 'bronze'); if (!E.oreWanted(f.id, 'cobre') || !E.oreWanted(f.id, 'estanho') || E.oreWanted(f.id, 'ferro')) bad.push('o planejador com o bronze');
  // (and only while the people needs it: a store of copper that nothing uses up opens no new mine, and asks no miner of the open
  // ones; the bread first)
  const cu0 = f.stock.cobre || 0; const enough0 = E.oreEnough(f, 'cobre'); give('f:' + f.id, 'cobre', 70, null, 'mina'); const enough1 = E.oreEnough(f, 'cobre'), busy1 = !E.oreEnough(f, 'cobre', 2);
  if (enough0 || !enough1 || busy1) bad.push(`a necessidade: com ${cu0} de cobre ${enough0}, com ${f.stock.cobre} ${enough1}, os mineiros ficam ${busy1}`);
  clear('f:' + f.id, 'cobre');
  // (a mine on the nearest copper, built by the proof's hand, and a miner of the town in it)
  const dep = S.ores.filter(o => o.kind === 'cobre' && !E.oreTaken(o)).sort((p, q) => G.dist(p.x, p.y, set.cx, set.cy) - G.dist(q.x, q.y, set.cx, set.cy))[0];
  let mine = null; if (dep && !S.occ[dep.y * G.N + dep.x]) mine = god(() => { const m = V.addBuilding('mina', dep.x, dep.y, set.id, true); E.onPlaced(m); return m; });
  const v = people(x => x.set === set.id && grown(x) && !x.carry)[0];
  const had0 = O.had(f.id, 'cobre'); let got = null, n0 = 0;
  if (mine && v) {
    n0 = lastN(); const cu0 = f.stock.cobre || 0;
    god(() => { v.role = 'mineiro'; v.job = mine.id; v.x = mine.x + 0.5; v.y = mine.y + 1.5; v.inside = 0; v.sleeping = false; v.hunger = 0; v.energy = 100; G.Vg.setTask(v, { type: 'minejob', id: mine.id, pri: 3 }); });
    for (let k = 0; k < 1800 && !got; k++) { M.viver(0.1); got = lines(n0, e => e[3] === '@mundo' && e[5] === 'cobre' && e[8] === 'mina')[0] || null; if (v.role !== 'mineiro') god(() => { v.role = 'mineiro'; v.job = mine.id; }); }
    if (!got) bad.push('nenhum cobre saiu da mina'); else if (!O.had(f.id, 'cobre')) bad.push('o povo não teve cobre');
    void cu0;
  } else bad.push('sem mina ou sem mineiro');
  const minerio = lines(n0, e => e[3] === '@mundo' && e[5] === 'minerio' && e[8] === 'mina').length;
  if (minerio) bad.push('a mina de cobre deu minério de ferro');
  ok('o2 a mina é a mesma, o veio diz o que ela tira; o planejador abre a mina do que o povo precisa', !bad.length && !errs(), `${f.name}: sem o bronze o planejador quer ${JSON.stringify(oWant)}; com ele, cobre e estanho; a mina de cobre em ${dep ? dep.x + ',' + dep.y : '?'}: ${got ? `${got[6]} de cobre nas mãos de ${v.name} (no livro, «mina»)` : 'nada'}; teve cobre: ${had0 ? 'antes' : 'não'} → ${O.had(f.id, 'cobre') ? 'sim' : 'não'}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o3, o4, o10: the forge, the people with no metal, the save in the middle
let forgeCtx = null;
function forgeWorld() {
  open();
  const f = facs().find(q => !O.had(q.id, 'bronze') && !O.had(q.id, 'cobre')) || facs()[0]; const set = capOf(f);
  teach(f, 'bronze'); const b = building(set, 'forja');
  // (a hand with no duty of the people — never who governs, the nobles, the priests, the warriors, the chosen: the oracle, the council
  // and the assembly call them from the forge for days, T-1628 —; a smith of the town if there is one)
  const free = x => x.set === set.id && grown(x) && !x.carry && x.id !== f.leader && !x.chosen && !x.prophet && x.grp !== 'nobreza' && x.grp !== 'sacerdotes' && x.grp !== 'militares';
  const v = people(x => free(x) && x.role === 'ferreiro')[0] || people(free)[0];
  if (b && v) god(() => { v.role = 'ferreiro'; v.job = b.id; v.hunger = 0; v.energy = 100; v.sleeping = false; });
  give('f:' + f.id, 'wood', 30, null, 'teste');
  return { f, set, b, v };
}
const keepSmith = c => god(() => { const v = c.v; if (v && G.S.villagers.has(v.id)) { v.role = 'ferreiro'; v.job = c.b.id; v.hunger = Math.min(v.hunger, 30); v.energy = Math.max(v.energy, 60); if (v.sleeping) v.sleeping = false; } });
if (on('o3') || on('o4') || on('o10')) {
  const c = forgeCtx = forgeWorld(); const { f, b } = c; const bad = []; const said = [];
  const fr = 'f:' + f.id; const pick = () => Of.trade(b).pick(b, f);
  // (o4 before: a people of the bronze that never had the metal draws its warriors in stone and wood)
  const w0 = warrior(f); const k0 = w0 ? G.Inv.kit(w0) : null;
  clear(fr, 'cobre'); clear(fr, 'estanho');
  const p0 = pick();
  give(fr, 'cobre', 12, null, 'mina'); const p1 = pick();
  give(fr, 'estanho', 2, null, 'mina'); const p2 = pick();
  if (p0 || p1 || !p2 || !/\.bronze$/.test(p2)) bad.push(`a escolha: sem metal ${p0}, só cobre ${p1}, cobre e estanho ${p2}`);
  said.push(`sem metal: ${p0 || 'nada'}; só cobre: ${p1 || 'nada'}; com estanho: ${p2}`);
  // (a batch of bronze, lived by the smith of the town)
  let n0 = lastN(); const isLiga = e => e[3] === fr && e[4] === '@uso' && e[5] === 'estanho' && e[8] === 'liga', isMade = e => e[3] === '@mundo' && (e[5] === 'armas' || e[5] === 'ferramentas') && e[8] === 'fornada'; const was = [[], []]; const a0 = (parts(fr, 'armas').bronze || 0) + (parts('b:' + b.id, 'armas').bronze || 0) + (parts(fr, 'ferramentas').bronze || 0) + (parts('b:' + b.id, 'ferramentas').bronze || 0);
  const op = god(() => Of.start(b, p2, c.v)); if (!op) bad.push('a fornada não começou');
  c.op = op; let half = false;
  for (let k = 0; k < 9000 && op && A.live(op); k++) {
    M.viver(0.1); if (k % 20 === 0) keepSmith(c);
    // (o10: the save in the middle — the batch past its alloy, before its end)
    if (on('o10') && !half && op && A.live(op) && op.data.liga > 0 && op.data.feitos > 0) {
      half = true; const c0 = JSON.stringify((QA.canonMore.find(x => x[0] === 'origem') || [0, () => 0])[1]());
      const o0 = JSON.stringify(G.S.orig.p), h0 = JSON.stringify(G.S.orig.had); const d0 = JSON.stringify(op.data);
      was[0] = lines(n0, isLiga); was[1] = lines(n0, isMade); M.salvarCarregar(); S = G.S; n0 = lastN(); // (the save keeps the ledger's last lines only: what came before it, counted before it)
      c.f = G.Fac.get(f.id); c.b = S.buildings.get(b.id); c.v = S.villagers.get(c.v.id);
      const op2 = A.get(op.id); const c1 = JSON.stringify((QA.canonMore.find(x => x[0] === 'origem') || [0, () => 0])[1]());
      const same = c0 === c1 && o0 === JSON.stringify(G.S.orig.p) && h0 === JSON.stringify(G.S.orig.had) && !!op2 && d0 === JSON.stringify(op2.data);
      c.saved = same ? 'a divisão, o que cada povo teve e a fornada voltaram iguais' : 'MUDOU no save';
      if (!same) c.saveBad = true;
      c.op = op2;
      if (op2) for (let j = 0; j < 9000 && A.live(op2); j++) { M.viver(0.1); if (j % 20 === 0) keepSmith(c); }
      break;
    }
  }
  const opEnd = c.op;
  const liga = was[0].concat(lines(n0, isLiga));
  const made = was[1].concat(lines(n0, isMade));
  const a1 = (parts(fr, 'armas').bronze || 0) + (parts('b:' + c.b.id, 'armas').bronze || 0) + (parts(fr, 'ferramentas').bronze || 0) + (parts('b:' + c.b.id, 'ferramentas').bronze || 0);
  if (!opEnd || A.live(opEnd) || opEnd.st !== 'ok') bad.push(`a fornada: ${opEnd ? opEnd.st : 'sumiu'}`);
  if (liga.length !== 1) bad.push(`o estanho no cadinho: ${liga.length} linha(s) «liga»`);
  if (!made.length || !(a1 - a0 > 0.5)) bad.push(`as coisas de bronze: ${made.length} linhas, bronze ${a0} → ${a1}`);
  if (!O.had(f.id, 'bronze')) bad.push('o povo não teve bronze');
  const inv = viol('origem'); if (inv.length) bad.push(inv.slice(0, 2).join(' | '));
  if (on('o3')) ok('o3 a forja parada sem metal; com cobre e estanho, bronze — o estanho pelo livro, as armas de bronze', !bad.length && !errs(), `${f.name}: ${said.join('; ')}; a fornada ${opEnd ? opEnd.st : '?'} (${made.length} linhas «fornada», ${liga.length} de «liga»), bronze nas partes ${a0} → ${Math.round(a1 * 100) / 100}; teve bronze: ${O.had(f.id, 'bronze') ? 'sim' : 'não'}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
  if (on('o10')) ok('o10 o save no meio: a divisão, o que cada povo teve e a fornada de bronze voltam iguais, e a fornada acaba', !!c.saved && !c.saveBad && opEnd && opEnd.st === 'ok' && !errs(), `${c.saved || 'nenhum save no meio (a fornada acabou antes?)'}; a fornada ${opEnd ? opEnd.st : '?'} ${errs()}`);
  if (on('o4')) {
    const bad4 = []; const w1 = warrior(c.f); const k1 = w1 ? G.Inv.kit(w1) : null;
    if (!k0 || !k1) bad4.push('nenhum guerreiro');
    else {
      for (const s of G.Inv.SLOTS) { const x = k0[s]; if (x && (matOf(x) === 'bronze' || matOf(x) === 'ferro')) bad4.push(`antes: ${x} sem nunca ter tido o metal`); }
      if (!O.had(f.id, 'couro') && k0.cabeca) bad4.push(`antes: um elmo (${k0.cabeca}) sem couro nem bronze`);
      const metal = G.Inv.SLOTS.some(s => k1[s] && matOf(k1[s]) === 'bronze');
      if (!metal) bad4.push(`depois do bronze: ${JSON.stringify(k1)}`);
    }
    // (and the store gives what its division has: a spear of bronze, of the bronze that was forged)
    const st = G.Inv.offer(c.v, 'lanca'); const ax = G.Inv.offer(c.v, 'machado');
    if (st.k && st.can && matOf(st.k) !== 'bronze' && (parts(fr, 'armas').bronze || 0) >= 1) bad4.push('o armazém dá ' + st.k);
    ok('o4 o povo do bronze sem cobre e estanho: lança de pedra, escudo de madeira; com o bronze forjado, bronze', !bad4.length && !errs(), `${f.name}: antes ${k0 ? `${k0.mao} + ${k0.outra} + ${k0.cabeca}` : '?'}; depois ${k1 ? `${k1.mao} + ${k1.outra} + ${k1.cabeca}` : '?'}; o armazém daria ${st.k} (${st.can ? 'tem' : st.why}), ${ax.k} (${ax.can ? 'tem' : ax.why})${bad4.length ? ' — FALHOU: ' + bad4.join(' | ') : ''} ${errs()}`);
  }
}

// ================================================================ o5 the leather
if (on('o5')) {
  open(); const bad = [];
  const f = facs().find(q => !O.had(q.id, 'couro')) || null;
  let info = '';
  if (!f) {
    // (every people of the world has had hides: one of them, its had of leather taken away by the proof's hand, to see the rule)
    const g = facs()[0]; god(() => { delete G.S.orig.had[g.id].couro; }); clear('f:' + g.id, 'couro'); info = '(o couro de ' + g.name + ' tirado pela mão da prova) ';
  }
  const ff = f || facs()[0]; const w = warrior(ff);
  const before = w ? G.Inv.made('elmo', w) : 'x'; const cb = w ? G.Inv.made('couraca', w) : 'x';
  // (and the knucklebones of the tavern's game are the carcass's bone: none where no beast was ever slaughtered, hunted nor offered —
  // P7, D-795)
  const osB = w && !O.had(ff.id, 'osso') ? G.Inv.made('ossinhos', w) : null; if (osB) bad.push('ossinhos sem osso: ' + osB);
  if (before && matOf(before) === 'couro') bad.push('elmo de couro sem couro: ' + before);
  if (cb && matOf(cb) === 'couro') bad.push('couraça de couro sem couro: ' + cb);
  // (a hide comes from a hunt: the door of the hunt's spoils — G.Village.addStock, as Riches.unload does)
  god(() => V.addStock('couro', 2, ff.id));
  const after = w ? G.Inv.made('elmo', w) : null; const osA = w ? G.Inv.made('ossinhos', w) : null;
  if (!after || (!O.had(ff.id, 'bronze') && matOf(after) !== 'couro')) bad.push('depois do couro: ' + after);
  if (w && osA !== 'ossinhos') bad.push('depois do couro, os ossinhos: ' + osA);
  // (the meat of a slaughter gives the bone too: another people with no hide nor bone, a beast slaughtered into its store)
  const f2 = facs().find(q => q !== ff && !O.had(q.id, 'couro') && !O.had(q.id, 'osso')); let os2 = '';
  if (f2) { god(() => D.make('f:' + f2.id, 'food', 1, { code: 'abate' })); os2 = `; ${f2.name}, depois de um abate: osso ${O.had(f2.id, 'osso') ? 'tido' : 'NÃO TIDO'}`; if (!O.had(f2.id, 'osso')) bad.push('o abate sem o osso'); }
  ok('o5 o couro só de quem caça ou abate: sem couro, nem elmo nem couraça de couro — nem ossinhos sem osso', !bad.length && !errs(), `${info}${ff.name}: antes elmo ${before || 'nenhum'}, couraça ${cb || 'nenhuma'}, ossinhos ${osB || 'nenhum'}; com o couro da caça: elmo ${after}, ossinhos ${osA || 'nenhum'}${os2}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o6, o7, o8: the beer, the fishing village, the dish
if (on('o6') || on('o8')) {
  open();
  // (the tavern chosen by the situation the case needs, not by a people's name — the ready worlds are made again, T-1499 —: a
  // people whose vat brews the beer now (its drink, or the beer that stands in for a first drink it does not have), and a shelf
  // that holds a round of fish and the vat's grain beside it)
  const beerOf = q => { const d = G.Tavern.DRINK[q.civ] || G.Tavern.DRINK.classico; return d.k === 'cerveja' || (d.alt === 'cerveja' && (q.stock[d.k] || 0) < 2); };
  const tv = (() => { for (const q of facs()) { if (!beerOf(q)) continue; const b = tavern(q); if (!b) continue; clear('b:' + b.id, 'food'); if (D.room('b:' + b.id, 'food') >= 8) return b; } return null; })();
  const f = tv ? G.Fac.get(V.facOfSet(tv.set)) : null; const ref = tv ? 'b:' + tv.id : null;
  if (!tv || !f) { if (on('o6')) ok('o6 a cerveja', false, 'nenhuma taverna de um povo da cerveja com lugar na prateleira'); }
  else {
    const R = Of.trade(tv); const cereal = O.CEREAL; const room = D.room(ref, 'food'), nf = Math.max(1, Math.min(6, room - 6)), n = Math.min(6, room - nf - 2); // (the fish, the vat's grain — four at least — and the room the batch asks for its input, as the shelf holds)
    // (the shelf with fish only: the vat does not begin; the town fed enough not to hold the vat back)
    give('f:' + f.id, 'food', 200, 'trigo'); clear(ref, 'food'); give(ref, 'food', nf, 'peixe');
    for (const op of Of.batches(tv)) god(() => Of.cut(op, 'prova'));
    const p0 = R.pick(tv, f); const dish0 = G.Taverna.dish(tv);
    give(ref, 'food', n, 'cevada'); const p1 = R.pick(tv, f); const dish1 = G.Taverna.dish(tv);
    if (on('o8')) {
      clear(ref, 'food'); give(ref, 'food', 4, 'cevada'); const dish2 = G.Taverna.dish(tv);
      const bad8 = []; if (dish0 !== 'um prato de peixe') bad8.push('com peixe: ' + dish0); if (/peixe/.test(dish2)) bad8.push('sem peixe: ' + dish2);
      ok('o8 o prato de peixe só onde há peixe', !bad8.length, `com peixe na prateleira: «${dish0}»; só com cevada: «${dish2}»${bad8.length ? ' — FALHOU: ' + bad8.join(' | ') : ''}`);
      clear(ref, 'food'); give(ref, 'food', nf, 'peixe'); give(ref, 'food', n, 'cevada');
    }
    if (on('o6')) {
      const bad = [];
      if (p0) bad.push('a cuba começou com peixe: ' + p0); if (p1 !== 'cerveja' && p1 !== 'pulque') bad.push('com cevada: ' + p1);
      // (the batch: the soaking takes the grain of the shelf, never the fish)
      const fish0 = O.amount(ref, 'food', 'peixe'), grain0 = O.amount(ref, 'food', cereal);
      const op = p1 ? god(() => Of.start(tv, p1, null)) : null; let used = 0, at = '', why = '';
      if (op) {
        const k = G.Taverna.keeperOf(tv) || people(x => x.set === tv.set && grown(x))[0];
        for (let i = 0; i < 400 && A.live(op) && op.data.s < 2; i++) { M.viver(0.1); const s = Of.stage(op); at = s ? s.id : at; if (s && s.kind === 'mao' && k) { const r = god(() => Of.unit(op, k)); if (r.ok) used++; else why = r.why || why; } }
      }
      const fish1 = O.amount(ref, 'food', 'peixe'), grain1 = O.amount(ref, 'food', cereal);
      if (!op || !used || !(grain0 - grain1 > 0.5) || Math.abs(fish1 - fish0) > 1e-6) bad.push(`a fornada: ${used} unidade(s) (na etapa «${at}»${why ? ', ' + why : ''}; ${op ? op.st : 'não começou'}), cereal ${grain0} → ${grain1}, peixe ${fish0} → ${fish1}`);
      ok('o6 a cerveja só de cereal: com peixe a cuba não começa; com cevada começa e gasta a cevada, o peixe fica', !bad.length && !errs(), `${f.name}: só peixe → ${p0 || 'nada'}; com cevada → ${p1}; a cuba gastou cereal ${Math.round(grain0 * 100) / 100} → ${Math.round(grain1 * 100) / 100}, o peixe ${fish0} → ${fish1}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
    }
  }
}
if (on('o7')) {
  open(); const bad = [];
  const tv = tavern();
  const f = tv ? G.Fac.get(V.facOfSet(tv.set)) : null; const ref = tv ? 'b:' + tv.id : null; const fr = f ? 'f:' + f.id : null;
  if (!tv) ok('o7 a vila de pescadores', false, 'nenhuma taverna');
  else {
    // (a people that only fishes: its store all fish — the fields of its towns gone —, the food of its houses, shelves and hands gone,
    // its tavern's shelf empty. What still reaches it comes by its doors of trade — the quay where a ship unloads, a cart from another
    // people (T-1628) —: barley had, bought, and a tavern that buys it may brew it. So the claim: no grain from nothing — the tavern's
    // grain no more than the food that came in by trade, and no beer before any came)
    for (const b of [...S.buildings.values()]) if (b.type === 'farm' && V.facOfSet(b.set) === f.id) god(() => V.removeBuilding(b));
    for (const b of S.buildings.values()) if (V.facOfSet(b.set) === f.id) { clear('b:' + b.id, 'food'); clear('h:' + b.id, 'food'); }
    for (const p of S.villagers.values()) if (G.Fac.ofV(p) === f) clear('v:' + p.id, 'food');
    clear(fr, 'food'); give(fr, 'food', 300, 'peixe', 'pesca'); clear(ref, 'food'); for (const op of Of.batches(tv)) god(() => Of.cut(op, 'prova'));
    const mine = r => { const [t, id] = r.split(':'); if (t === 'f') return +id === f.id; if (t === 'v') { const p = S.villagers.get(+id); return !!p && G.Fac.ofV(p) === f; } if (t === 'b' || t === 'h') { const b = S.buildings.get(+id); return !!b && V.facOfSet(b.set) === f.id; } return false; };
    const n00 = lastN(); const tradedNow = () => lines(n00, e => e[5] === 'food' && /^(q|c):/.test(e[3]) && mine(e[4])).reduce((a, e) => a + e[6], 0);
    const k = G.Taverna.keeperOf(tv); let brewed = 0, bought = 0, early = 0;
    for (let i = 0; i < 3000; i++) { M.viver(0.1); if (Of.batches(tv).some(op => Of.rx(op) && Of.rx(op).k === 'cerveja')) { brewed++; if (!(tradedNow() > 0)) early++; } }
    const shelf = parts(ref, 'food'); bought = Object.values(shelf).reduce((a, b) => a + b, 0); const traded = tradedNow(), grain = O.amount(ref, 'food', O.CEREAL);
    if (early) bad.push('a cuba começou sem grão nenhum de fora');
    if (grain > traded + 0.01) bad.push(`grão na prateleira (${Math.round(grain * 100) / 100}) além do que o comércio trouxe (${Math.round(traded * 100) / 100}): ` + JSON.stringify(shelf));
    ok('o7 a vila de pescadores sem campo: nenhum grão sem fonte — o da taverna é o que o comércio trouxe', !bad.length && !errs(), `${f.name}: o armazém só de peixe; 5 minutos depois a prateleira da taverna tem ${JSON.stringify(shelf)} (${Math.round(bought)} de comida${k ? ', comprada por ' + k.name : ''}; pelo cais e pelas carroças entraram ${Math.round(traded)} de comida), cerveja na cuba: ${brewed ? 'sim, do grão comprado' : 'nenhuma'}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
  }
}

// ================================================================ o9 the division adds up
if (on('o9')) {
  open(); const bad = [];
  const q0 = O.unknown().food || 0; const n = Math.round(2 * G.DAY_LEN / 0.1);
  for (let k = 0; k < n; k++) M.viver(0.1);
  M.viver(1.1); // (the second's look: every store's parts made to add up)
  for (const f of facs()) for (const k of ['food', 'armas', 'ferramentas']) { const p = parts('f:' + f.id, k); let s = 0; for (const t in p) s += p[t]; if (Math.abs(s - (f.stock[k] || 0)) > 0.01) bad.push(`${f.name} ${k}: ${s} ≠ ${f.stock[k]}`); }
  const why = O.unknownWhy(); const q1 = O.unknown().food || 0;
  const inv = viol('origem'); if (inv.length) bad.push(inv.slice(0, 3).join(' | '));
  ok('o9 a divisão soma a contagem em cada armazém, dois dias vividos; o verificador limpo', !bad.length && !errs(), `comida de origem desconhecida nesses dias: ${Math.round((q1 - q0) * 100) / 100} (${JSON.stringify(why)})${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o11 the old save
if (on('o11')) {
  const file = path.join(__dirname, 'oldsave_7.json'); let threw = null;
  try { M.abrir(JSON.parse(fs.readFileSync(file, 'utf8'))); M.viver(2); } catch (e) { threw = e.message; }
  S = G.S; const bad = [];
  if (!threw) {
    if (S.oresV !== 2 || !S.ores.some(o => o.kind === 'cobre')) bad.push('sem as jazidas novas');
    if (!(S.orig && S.orig.old > 0)) bad.push('a divisão não nasceu do palpite');
    for (const f of facs()) { const p = parts('f:' + f.id, 'food'); let s = 0; for (const t in p) s += p[t]; if (Math.abs(s - (f.stock.food || 0)) > 0.01) bad.push(`${f.name}: ${s} ≠ ${f.stock.food}`); }
    M.saltar(1); const inv = viol('origem'); if (inv.length) bad.push(inv.slice(0, 2).join(' | '));
  }
  ok('o11 o save antigo abre, ganha as jazidas novas e a divisão pelo palpite honesto', !threw && !bad.length && !errs(), threw ? 'ERRO: ' + threw : `${path.basename(file)}: dia ${S.day}, ${S.ores.filter(o => o.kind === 'cobre').length} de cobre, ${S.ores.filter(o => o.kind === 'estanho').length} de estanho; partes do primeiro povo ${JSON.stringify(parts('f:' + facs()[0].id, 'food'))}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o12 the god's hand on a deposit
if (on('o12')) {
  open(); const bad = [];
  const f = facs()[0]; const set = capOf(f);
  const dep = S.ores.filter(o => !E.oreTaken(o) && !S.occ[o.y * G.N + o.x]).sort((p, q) => G.dist(p.x, p.y, set.cx, set.cy) - G.dist(q.x, q.y, set.cx, set.cy))[0];
  const mine = dep ? god(() => { const m = V.addBuilding('mina', dep.x, dep.y, set.id, true); E.onPlaced(m); return m; }) : null;
  const taken0 = dep && E.oreTaken(dep);
  if (mine) god(() => V.damageBuilding(mine, 99999, 'meteor'));
  M.viver(1);
  const taken1 = dep && E.oreTaken(dep);
  if (!taken0 || taken1) bad.push(`a jazida: com a mina ${taken0}, depois do meteoro ${taken1}`);
  ok('o12 a mão do deus derruba a mina, e a jazida fica livre para outra mina', !bad.length && !errs(), `${dep ? dep.kind + ' em ' + dep.x + ',' + dep.y : '?'}: com a mina, tomada ${taken0}; o meteoro a derrubou (${mine && S.buildings.get(mine.id) ? S.buildings.get(mine.id).type : 'sumiu'}), tomada ${taken1}; resta ${dep ? dep.amt : '?'} de ${dep ? dep.max : '?'}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o13 a people that ends
if (on('o13')) {
  open(); const bad = [];
  const f = facs()[facs().length - 1]; const fr = 'f:' + f.id;
  give(fr, 'armas', 2, 'bronze');
  for (const v of people(x => G.Fac.idOfV(x) === f.id)) god(() => V.kill(v, 'sick'));
  M.viver(3);
  const q0 = Object.assign({}, O.unknown());
  for (let k = 0; k < Math.round(1.2 * G.DAY_LEN / 0.1); k++) M.viver(0.1);
  const q1 = O.unknown();
  if ((q1.armas || 0) > (q0.armas || 0) + 1e-6 || (q1.ferramentas || 0) > (q0.ferramentas || 0) + 1e-6) bad.push('armas de origem desconhecida depois do fim');
  const inv = viol('origem'); if (inv.length) bad.push(inv.slice(0, 2).join(' | '));
  ok('o13 o povo que acaba: as suas partes e o que ele teve não dão erro', !bad.length && !errs(), `${f.name}: ${G.Fac.pop(f.id)} pessoas depois; partes no armazém ${JSON.stringify(O.parts(fr, 'armas'))}; o verificador ${inv.length ? 'acusa' : 'limpo'}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o14 the pulque
if (on('o14')) {
  open(); const bad = [];
  const f = facs().find(q => q.civ === 'asteca'); const tv = f ? tavern(f) : null;
  let p = null;
  if (!f || !tv) bad.push('nenhum povo do pulque com taverna');
  else { give('f:' + f.id, 'food', 200, 'milho'); clear('b:' + tv.id, 'food'); give('b:' + tv.id, 'food', 6, 'milho'); for (const op of Of.batches(tv)) god(() => Of.cut(op, 'prova')); p = Of.trade(tv).pick(tv, f); if (p !== 'cerveja') bad.push('a cuba asteca escolhe ' + p); }
  ok('o14 sem o maguey, o povo do pulque faz a cerveja do seu milho', !bad.length && !errs(), `${f ? f.name : '?'}: a cuba escolhe ${p} (o pulque pede o aguamiel do maguey, que o mundo ainda não planta)${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o15 the salting
// (a salting yard built by the proof's hand in the capital of the first people, and a hand of the town made its salter — held
// while the case lasts, as the repartidor would give it back: T-850 —; the day's work of the yard asked straight, as the day asks it)
if (on('o15')) {
  open(); const bad = [], say = [];
  const f = facs()[0], set = f && capOf(f);
  const sg = set ? building(set, 'salga') : null; if (sg && !sg.built) god(() => V.completeBuilding(sg));
  // (one with the hands free and no merchant — the caravan takes a merchant from any work of the day, with the goods in his arms)
  const v = sg && sg.built ? people(x => x.set === set.id && grown(x) && !x.carry && !x.merchant && x.role !== 'mercador' && !(S.avatar && S.avatar.id === x.id))[0] : null;
  if (!v) bad.push('nenhuma salga ou ninguém para salgar');
  else {
    const ref = 'b:' + sg.id, fr = 'f:' + f.id, H = G.Vg.H;
    const hold = () => { v.role = 'salgador'; v.job = sg.id; v.hunger = 0; v.energy = 100; v.sleeping = false; };
    const ask = () => { hold(); G.Vg.endTask(v); return G.Eco.jobTask(v, H); };
    // (the work given again when another errand of the world takes the hand away — a cave, a caravan —, until it is done or the time is up)
    const run = (t0, secs, done) => { const give1 = () => { hold(); G.Vg.endTask(v); god(() => H.setTask(v, Object.assign({}, t0))); }; give1();
      for (let i = 0; i < secs * 10 && !(done && done()); i++) { if (!v.task || v.task.type !== t0.type || v.task.do !== t0.do) { if (t0.type === 'fetch' && v.carry) break; give1(); } hold(); M.viver(0.1); } };
    if (G.isNight() || S.time > 0.6) S.time = 0.3;
    const out = () => (D.get(ref, 'carne_seca') || 0) + (D.get(ref, 'bacalhau') || 0);
    // (1. the grain only — the store all wheat, the shelf with salt and wheat —: no fetch of the grain, no salting; the salting
    // forced by the hand, nothing salted: the grain stays)
    clear(fr, 'food'); give(fr, 'food', 200, 'trigo'); clear(ref, 'food'); give(ref, 'sal', 2); give(ref, 'food', 8, 'trigo');
    const t1 = ask(); const o0 = out(); run({ type: 'estate', id: sg.id, do: 'salt', pri: 1 }, 20);
    if (t1 && (t1.do === 'salt' || (t1.type === 'fetch' && t1.k === 'food'))) bad.push('com só grão o dia da salga pede ' + JSON.stringify(t1).slice(0, 80));
    if (out() > o0 || O.amount(ref, 'food', 'trigo') < 8 - 1e-6) bad.push(`a salga forçada com só grão: ${out() - o0} salgado, o trigo ${O.amount(ref, 'food', 'trigo')}`);
    say.push(`só grão: ${t1 ? t1.type + (t1.k ? ' ' + t1.k : '') : 'nenhum afazer'}, nada salgado`);
    // (2. fish in the store: the fetch takes the fish, not the wheat; 3. fish on the shelf: salted fish; 4. meat: dried meat)
    give(fr, 'food', 20, 'peixe', 'pesca'); const t2 = ask();
    if (v.carry) bad.push('as mãos de ' + v.name + ' com ' + JSON.stringify(v.carry));
    if (!t2 || t2.type !== 'fetch' || t2.k !== 'food' || !t2.of) bad.push('com peixe no armazém o dia da salga pede ' + JSON.stringify(t2 || null).slice(0, 80));
    else { const w0 = O.amount(ref, 'food', 'trigo'), p0 = O.amount(ref, 'food', 'peixe'); run(t2, 60, () => O.amount(ref, 'food', 'peixe') > p0 + 0.5); const w1 = O.amount(ref, 'food', 'trigo'), p1 = O.amount(ref, 'food', 'peixe'); if (!(p1 > p0 + 0.5) || Math.abs(w1 - w0) > 1e-6) bad.push(`a busca: peixe ${p0} → ${p1}, trigo ${w0} → ${w1}`); say.push(`a busca trouxe ${Math.round((p1 - p0) * 100) / 100} de peixe e nenhum trigo`); }
    for (const [part, good] of [['peixe', 'bacalhau'], ['carne', 'carne_seca']]) {
      clear(ref, 'food'); clear(ref, 'carne_seca'); clear(ref, 'bacalhau'); give(ref, 'sal', 2); give(ref, 'food', 6, part, part === 'peixe' ? 'pesca' : 'caca'); give(ref, 'food', 6, 'trigo');
      const t = ask(); if (!t || t.do !== 'salt') { bad.push(`com ${part} na prateleira o dia da salga pede ` + JSON.stringify(t || null).slice(0, 80)); continue; }
      run(t, 40, () => (D.get(ref, good) || 0) >= 2); const got = D.get(ref, good) || 0, other = (D.get(ref, good === 'bacalhau' ? 'carne_seca' : 'bacalhau') || 0);
      if (!(got >= 2) || other > 0 || O.amount(ref, 'food', part) > 2 + 1e-6 || O.amount(ref, 'food', 'trigo') < 6 - 1e-6) bad.push(`do ${part}: ${got} de ${good}, ${other} do outro; ${part} ${O.amount(ref, 'food', part)}, trigo ${O.amount(ref, 'food', 'trigo')}`);
      say.push(`do ${part}: ${got} de ${G.Eco.name(good)} (o trigo ficou)`);
    }
  }
  ok('o15 a salga gasta carne ou peixe, nunca o grão: do peixe o bacalhau, da carne a carne-seca', !bad.length && !errs(), `${f ? f.name : '?'}: ${say.join('; ')}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

// ================================================================ o16 a batch of the forge in a save from before
// (the forge of before had one recipe for each good — «armas», «ferramentas» — of the iron ore: a save of then with a batch in
// the forge opens with the batch of iron, for a people that knows the iron, and it ends making weapons of iron; for one that does
// not know the iron, the step of the world ends it — no iron forged without the art: D-441, L-1366)
if (on('o16')) {
  const bad = [], said = [];
  for (const knows of [true, false]) {
    const c = forgeWorld(); const { f, b } = c; const fr = 'f:' + f.id;
    if (!b || !c.v) { bad.push('nenhuma forja ou ferreiro'); break; }
    if (!b.built) god(() => V.completeBuilding(b));
    teach(f, 'ferro'); give(fr, 'minerio', 12, null, 'mina'); for (const op of Of.batches(b)) god(() => Of.cut(op, 'prova'));
    const op = god(() => Of.start(b, 'armas.ferro', c.v)); if (!op) { bad.push('a fornada de ferro não começou'); break; }
    for (let k = 0; k < 600 && A.live(op) && op.data.s < 1; k++) { M.viver(0.1); if (k % 20 === 0) keepSmith(c); }
    // (the save as the forge of before wrote it: the batch by the good's name alone; the people's art as the case asks)
    if (!knows) delete f.tech.known.ferro;
    const o = JSON.parse(G.Save.serialize()); const rec = (o.acts || []).find(q => q.id === op.id); if (rec) rec.data.p = 'armas';
    const ore0 = D.get('b:' + b.id, 'minerio');
    G.Save.apply(o); S = G.S; const p2 = A.get(op.id) && A.get(op.id).data.p; M.viver(knows ? 0.1 : 1.5); // (the overseer of the batches looks once a second)
    const op2 = A.get(op.id);
    if (knows) {
      const a0 = O.amount(fr, 'armas', 'ferro') + O.amount('b:' + b.id, 'armas', 'ferro');
      for (let k = 0; k < 9000 && op2 && A.live(op2); k++) { M.viver(0.1); if (k % 20 === 0) keepSmith(Object.assign({}, c, { v: S.villagers.get(c.v.id) })); }
      const a1 = O.amount(fr, 'armas', 'ferro') + O.amount('b:' + b.id, 'armas', 'ferro') + O.amount('v:' + c.v.id, 'armas', 'ferro');
      if (p2 !== 'armas.ferro' || !op2 || op2.st !== 'ok' || !(a1 > a0 + 0.5)) bad.push(`quem sabe o ferro: a fornada ${p2}, ${op2 ? op2.st : 'sumiu'}, armas de ferro ${a0} → ${a1}`);
      said.push(`quem sabe o ferro: a fornada de antes abriu como ${p2} e acabou (${op2 ? op2.st : '?'}), ${Math.round((a1 - a0) * 100) / 100} armas de ferro`);
    } else {
      const ended = op2 && !A.live(op2);
      const ore1 = D.get('b:' + b.id, 'minerio');
      if (!ended || p2 !== 'armas' || (op2.end && op2.end.why !== 'sem receita') || ore1 < ore0 - 1e-6) bad.push(`quem não sabe o ferro: a fornada ${p2}, ${op2 ? op2.st + ' ' + JSON.stringify(op2.end) : 'sumiu'}, o minério na prateleira ${ore0} → ${ore1}`);
      said.push(`quem não sabe o ferro: a fornada de antes ${ended ? 'acabou no passo do mundo (' + (op2.end && op2.end.why) + ')' : 'SEGUE'}, o minério dela na prateleira (${ore0} → ${ore1})`);
    }
  }
  ok('o16 a fornada da forja de um save de antes: de ferro para quem sabe o ferro; para quem não sabe, acaba', !bad.length && !errs(), `${said.join('; ')}${bad.length ? ' — FALHOU: ' + bad.join(' | ') : ''} ${errs()}`);
}

console.log(fails.length ? `FALHARAM: ${fails.join(', ')}` : 'tudo passou');
process.exit(fails.length ? 1 : 0);
