// invariancia: a mesma causa, o mesmo efeito, em qualquer resolução (C1, o adendo da invariância causal) — em Node.
//   node qa/invariancia.js [mundo]
// (as descargas de E e B no porto com mais estivadores — cais e armazém do porto —, como o qa/porto.js o escolhe; hoje, na
// metrópole, Óstia. Sem ele, ou sem navio mercante, o caso falha dizendo o que falta)
// A  o salto × o passo: a mesma cidade com bancas e cais vivendo dias pelo salto e pelo passo — os livros fecham nos dois
//    (o que saiu = o que chegou + o perdido com causa + o que está sob guarda), nenhum estoque negativo, nenhuma venda sem
//    pagamento; as diferenças (quantas vendas, quantas caixas) medidas e ditas: vêm do tamanho do passo e das decisões;
// B  uma descarga atravessando passo → salto → corpo → save/load → passo: o progresso, as contas e o fim coerentes;
// C  os da atividade depois de dois dias longe (pelo salto): o papel, a carga, o livro da banca compatíveis com o tempo;
// E  o livro-razão: todo lançamento com a sua causa; nenhuma chave duas vezes; um save em cada fase de uma descarga,
//    carregado duas vezes, vive o mesmo futuro;
// F  o mesmo mundo com e sem "quadros" (o que só lê: as ofertas ao corpo, o que a banca mostra, o cais desenhado, o
//    diário) entre os passos: idêntico bit a bit. (Com o corpo parado, as diferenças vêm de ele não trabalhar: medidas, e
//    não postas como falha — o corpo não é um NPC.)
const M = require('./nodemundo.js');
const world = process.argv[2] || 'metropole';
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | invariância ${name} | ${info}`); if (!c) fails.push(name); };
const others = new Map();
const bad = () => QA.check().filter(q => q.sev <= 2).filter(q => { if (q.sys === 'act' || q.sys === 'nan') return true; others.set(q.msg, (others.get(q.msg) || 0) + 1); return false; });
const D = G.Depot, A = G.Act, B = G.Biz, P = G.Porto, E = G.Eco;
const r2 = x => Math.round(x * 100) / 100;
let S;
const steps = n => { for (let k = 0; k < n; k++) G.debug.step(0.1); };
const fp = () => { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + JSON.stringify(G.S.rng); };
// the books of the world's activities, checked by the ledger: every unloading closes, every sale has its payment
function books() {
  const L = D.ledger(); let open = 0, unpaid = 0, nocause = 0;
  for (const op of A.all()) { if (!A.DEFS[op.def] || !A.DEFS[op.def].conserve) continue; for (const k in op.taken || {}) { const out = (op.done[k] || 0) + ((op.lost || {})[k] || 0) + ((op.back || {})[k] || 0) + ((op.left || {})[k] || 0); if (!A.live(op) && Math.abs(op.taken[k] - out) > 0.01) open++; } }
  for (let i = 0; i < L.length; i++) { const e = L[i]; if (!e[8]) nocause++; if (e[8] === 'venda' && e[3][0] === 'z') { const p = L[i + 1]; if (!p || p[8] !== 'venda' || p[0] !== e[0] + 1) unpaid++; } }
  let neg = 0; for (const f of S.factions.values()) for (const k in f.stock) if (f.stock[k] < -1e-4) neg++;
  for (const z of S.biz || []) for (const k in z.inv) if (z.inv[k] < -1e-4) neg++;
  return { open, unpaid, nocause, neg };
}
// (sales and crates counted as they happen: the ledger keeps only its last few thousand lines, a day overflows it)
const run = { sales: 0, rev: 0, crates: 0 };
D.onMove.push(e => { if (e[8] === 'venda' && e[3][0] === 'z') run.sales++; if (e[8] === 'venda' && e[5] === 'moedas') run.rev += e[6]; if (e[8] === 'depositar') run.crates++; });
const tally = () => ({ sales: run.sales, rev: run.rev, crates: run.crates });
const since = t0 => ({ sales: run.sales - t0.sales, rev: r2(run.rev - t0.rev), crates: run.crates - t0.crates });
// the port of the unloadings (E, B): a quay, a harbour warehouse, stevedores — the one with the most of them, the oldest
// on a tie, as qa/porto.js picks it —, and a merchant ship to land there (a rule, not a name: a new ready world finds its
// own; a world without them fails the case, saying what it lacks)
const porters = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'estivador').length;
const hasB = (s, t) => [...S.buildings.values()].some(b => b.set === s.id && b.type === t && b.built);
const portOf = () => [...S.settlements.values()].filter(s => hasB(s, 'doca') && hasB(s, 'armazem') && porters(s) >= 1).sort((a, b) => porters(b) - porters(a) || (a.founded || 0) - (b.founded || 0) || a.id - b.id)[0] || null;
const portLacks = (set, sh) => !set ? `nenhuma cidade com cais, armazém do porto e estivadores em ${world}` : !sh ? `nenhum navio mercante em ${world} para descarregar em ${set.name}` : '';

// ---------------- F: the same world with and without frames (what only reads, between the steps)
{
  const frame = () => {
    const was = G.inSim; G.inSim = 0;
    try {
      const vs = [...S.villagers.values()];
      for (let k = 0; k < 6; k++) { const v = vs[(k * 37 + S.ledgerN) % vs.length]; if (!v) continue; A.offers(v, v.x, v.y, 3); A.diary(v); A.role(v); D.items('v:' + v.id); }
      for (const z of (S.biz || []).slice(0, 8)) { B.display(z); B.spots(z); B.text(z); B.book(z); }
      for (const b of S.buildings.values()) if (b.type === 'doca' && b.built) { G.Fishers.crateSpot(b); G.Fishers.quaySpot(b, 3); D.items('q:' + b.id); }
      for (const op of A.all().slice(-6)) A.summary(op, null);
      G.Falas.line('pregao', { k: 'food', civ: 'romano' });
    } finally { G.inSim = was; }
  };
  M.pronto(world); S = G.S; S.time = 0.12; let t0 = tally(); steps(1200); const a = fp(); const ta = since(t0);
  M.pronto(world); S = G.S; S.time = 0.12; t0 = tally(); for (let k = 0; k < 60; k++) { steps(20); frame(); } const b = fp(); const tb = since(t0);
  const outside = (A.outside || 0) + (D.outside || 0);
  ok('F com e sem quadros', a === b && ta.sales === tb.sales && ta.crates === tb.crates && !outside && !bad().length, `${a === b ? 'o mesmo mundo' : 'MUNDOS DIFERENTES'} depois de 120 s (${a.slice(0, 8)} / ${b.slice(0, 8)}); ${ta.sales} e ${tb.sales} vendas, ${ta.crates} e ${tb.crates} caixas; nada mudado de fora do passo (${outside})`);
}
// ---------------- E: the ledger: a cause for each entry, no key twice; a save at each phase of an unloading, loaded twice
caseE: {
  M.pronto(world); S = G.S; S.time = 0.15; steps(20); G.inSim++;
  const set = portOf(), sh = S.ships.find(s => s.kind === 'mercante');
  if (portLacks(set, sh)) { ok('E o livro-razão', false, portLacks(set, sh)); break caseE; }
  let dock = [...S.buildings.values()].find(b => b.set === set.id && b.type === 'doca' && b.built); const fid = set.fac;
  for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && A.live(op)) A.end(op, 'cancel', 'teste');
  for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + fid, c.k, c.n, { code: 'teste', part: true });
  sh.goods = { k: 'sal', n: 14 }; G.Harbor.land(dock, sh.goods, sh);
  const op0 = P.opAt(dock); if (!op0) { ok('E o livro-razão', false, `o cais de ${set.name} não abriu a descarga do navio`); break caseE; }
  const opId = op0.id;
  const phases = [['caixas no cais', () => true], ['uma caixa nas mãos', () => [...S.villagers.values()].some(v => v.carry && v.carry.op === opId)], ['a meio', () => { const o = A.get(opId); return o && (o.done.sal || 0) >= 4; }], ['quase no fim', () => { const o = A.get(opId); return o && (o.done.sal || 0) >= 10; }]];
  const res = [];
  const stOf = () => { const o = A.get(opId); return o ? `${A.STATES[o.st]}${o.wait ? ' (' + o.wait + ')' : ''}, ${o.done.sal || 0} de 14` : 'fora do registro'; };
  for (const [name, when] of phases) {
    let k = 0; for (; k < 3000 && !when() && A.live(A.get(opId)); k++) G.debug.step(0.1);
    const at = stOf(); // (where the unloading stood when the save was made)
    const str = G.Save.serialize();
    const load = () => { if (G.UI && G.UI.select) G.UI.select(null); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; S = G.S; };
    const run = () => { load(); steps(300); const o = A.get(opId); return { h: fp(), done: o ? o.done.sal || 0 : -1 }; };
    const x = run(), y = run();
    load(); // (the next phase is reached from this one, not from 30 s after it)
    res.push([name, x.h === y.h, x.done, y.done, when() ? '' : ` — a fase não veio (${at})`]);
  }
  dock = S.buildings.get(dock.id);
  for (let k = 0; k < 4000 && A.live(A.get(opId)); k++) G.debug.step(0.1);
  const o = A.get(opId); const bk = books();
  const dupe = o && (() => { const s = new Set(); for (const e of o.keys || []) { if (s.has(e[0])) return e[0]; s.add(e[0]); } return null; })();
  ok('E o livro-razão', !!o && res.every(r => r[1]) && !dupe && !bk.nocause && !bk.open && o.st === 'ok' && o.done.sal === 14 && !bad().length,
    `${set.name}: um save em cada fase, carregado duas vezes: ${res.map(r => `${r[0]} ${r[1] ? 'o mesmo futuro' : 'FUTUROS DIFERENTES'} (${r[2]}/${r[3]})${r[4]}`).join('; ')}; nenhuma chave duas vezes${dupe ? ' — MENOS ' + dupe : ''}; lançamentos sem causa: ${bk.nocause}; a descarga ${o ? `${A.STATES[o.st]}, chegou ${o.done.sal} de 14${o.end ? ' (' + o.end.why + ')' : ''}` : 'NÃO está mais no registro'}`);
}
// ---------------- B: an unloading through step → skip → body → save/load → step
caseB: {
  M.pronto(world); S = G.S; S.time = 0.12; steps(20); G.inSim++;
  const set = portOf(), sh = S.ships.find(s => s.kind === 'mercante');
  if (portLacks(set, sh)) { ok('B passo, salto, corpo, save', false, portLacks(set, sh)); break caseB; }
  let dock = [...S.buildings.values()].find(b => b.set === set.id && b.type === 'doca' && b.built); const fid = set.fac;
  for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && A.live(op)) A.end(op, 'cancel', 'teste');
  for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + fid, c.k, c.n, { code: 'teste', part: true });
  // (a full quay of stone — ten crates, three trips each for one pair of arms — so that the skip and the body find it under way)
  sh.goods = { k: 'stone', n: 40 }; G.Harbor.land(dock, sh.goods, sh);
  const op0 = P.opAt(dock); if (!op0) { ok('B passo, salto, corpo, save', false, `o cais de ${set.name} não abriu a descarga do navio`); break caseB; }
  const opId = op0.id; const trail = [];
  // (what the unloading took: the test's 40, and whatever another ship landed into it meanwhile — a merchant ship home with
  // its return cargo lands it into the unloading under way)
  const want = () => { const o = A.get(opId); return o ? Math.max(40, (o.taken && o.taken.stone) || 0) : 40; };
  const note = w => { const o = A.get(opId); trail.push(`${w}: ${o ? (o.done.stone || 0) + ' de ' + want() + (A.live(o) ? '' : ' (' + A.STATES[o.st] + ')') : '—'}`); };
  steps(150); note('passo');
  G.Skip.on = true; G.FX.off = true; try { for (let k = 0; k < 6; k++) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; } note('salto');
  const pv = [...S.villagers.values()].find(v => v.carry && v.carry.op === opId) || [...S.villagers.values()].find(v => A.roleOf(v) && A.roleOf(v).op.id === opId);
  const bodied = !!pv && G.Possess.can(pv).ok;
  if (bodied) { G.Possess.take(pv); steps(80); G.Possess.release('deus'); } note(bodied ? 'corpo (' + pv.name + ', parado)' : 'sem corpo');
  const str = G.Save.serialize(); if (G.UI && G.UI.select) G.UI.select(null); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; S = G.S; note('save/load');
  for (let k = 0; k < 6000 && A.live(A.get(opId)); k++) G.debug.step(0.1); note('passo');
  const o = A.get(opId); const bk = books();
  ok('B passo, salto, corpo, save', bodied && !!o && o.st === 'ok' && o.done.stone === want() && !bk.open && !bad().length, `${set.name}: ${trail.join(' → ')}${want() > 40 ? ` (as 40 do teste e ${want() - 40} que outro navio desembarcou na mesma descarga)` : ''}; as contas da descarga ${bk.open ? 'NÃO fecham' : 'fecham'}`);
}
// ---------------- C: two days away (by the skip): the people of the activities and the stalls' books, coherent
{
  M.pronto(world); S = G.S; S.time = 0.1; steps(20);
  const d0 = S.day; const h0 = new Map((S.biz || []).map(z => [z.id, z.hist.length]));
  M.saltar(2); steps(30);
  const S2 = G.S; let stuck = 0, orphan = 0; const why = [];
  for (const v of S2.villagers.values()) {
    if (v.carry && v.carry.op) { const op = A.get(v.carry.op); if (!op || !A.live(op)) { orphan++; why.push(`${v.name} com carga de uma operação acabada`); } }
    if (v.carry && v.carry.to && !D.exists(v.carry.to)) { stuck++; why.push(`${v.name} levando para ${v.carry.to}, que não existe`); }
  }
  const zs = (S2.biz || []).filter(z => z.st === 'on'); let badBook = 0;
  for (const z of zs) { const own = S2.villagers.get(z.owner); if (!own) badBook++; else if (h0.has(z.id) && z.day.d !== S2.day) badBook++; }
  const bk = books();
  // (with a stall at least: a world without stalls would pass it empty)
  ok('C dois dias longe', zs.length > 0 && !orphan && !stuck && !badBook && !bk.open && !bk.unpaid && !bk.neg && !bad().length,
    `do dia ${d0} ao ${S2.day} pelo salto: ${zs.length} banca(s) de pé, cada uma com dono vivo e o livro do dia de hoje; ${orphan} carga(s) de operação acabada, ${stuck} levando para lugar que não existe${why.length ? ' (' + why.slice(0, 2).join('; ') + ')' : ''}; contas abertas ${bk.open}, vendas sem pagamento ${bk.unpaid}, estoques negativos ${bk.neg}`);
}
// ---------------- A: the skip × the step — the same town, the same books closing, the differences measured
{
  const life = (skip) => {
    M.pronto(world); S = G.S; S.time = 0.1; steps(20); const t0 = tally();
    if (skip) M.saltar(1); else { const d0 = S.day; while (S.day - d0 < 1) steps(100); }
    const t1 = since(t0); const bk = books();
    return { sales: t1.sales, rev: t1.rev, crates: t1.crates, bk, bad: bad().length };
  };
  const a = life(false), b = life(true);
  const fine = x => !x.bk.open && !x.bk.unpaid && !x.bk.neg && !x.bk.nocause && !x.bad;
  // (and something moved in both lives — a sale or a crate: books that close because nothing happened prove nothing)
  ok('A salto × passo', fine(a) && fine(b) && a.sales + a.crates > 0 && b.sales + b.crates > 0,
    `um dia pelo passo: ${a.sales} vendas (${a.rev} em moedas), ${a.crates} caixas guardadas; pelo salto: ${b.sales} vendas (${b.rev}), ${b.crates} caixas; nos dois as contas fecham (abertas ${a.bk.open}/${b.bk.open}, vendas sem pagamento ${a.bk.unpaid}/${b.bk.unpaid}, negativos ${a.bk.neg}/${b.bk.neg}); a diferença vem do passo (0,1 s × meio passo de 0,5 s: quem anda e quem decide antes) e das decisões que ele muda`);
}
const e = M.erros();
if (others.size) console.log(`   (o verificador, em outros sistemas, durante o cenário: ${[...others.keys()].slice(0, 6).join(' · ')}${others.size > 6 ? ` · e mais ${others.size - 6}` : ''})`);
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `INVARIÂNCIA: FALHOU (${fails.join(', ')})` : 'INVARIÂNCIA: ok');
process.exit(fails.length ? 1 : 0);
