// saque: o fim de uma ida à guerra, provocado de propósito (C1; as quatro linhas autorizadas do war.js, army.js e
// naval.js) — no mundo pronto «metrópole».   node qa/saque.js
// Quem volta da guerra com o saque nas mãos põe o saque no armazém do seu povo, pelo livro ('saque'); quem foi à guerra
// com uma carga que tem dono (a compra da família a caminho de casa) não a perde para o armazém: ela segue para casa.
// w1 o bando que se desfaz (war.js, Wr.disband); w2 os saqueadores que chegam em casa (war.js, o retorno); w3 o soldado
// que foge para casa (army.js, a debandada); w4 o navio que volta de uma incursão (naval.js, o desembarque); e o
// verificador limpo (a regra 20: nenhuma carga marcada some sem linha no livro).
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | saque ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan'));
const watch = () => { const bb = bad(); if (bb.length) { console.log('   verificador no meio:', bb.slice(0, 2).map(q => q.msg).join(' · ')); for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
const D = G.Depot, Wr = G.War, Nv = G.Naval, W = G.W;
const r2 = x => Math.round(x * 100) / 100;
let S;
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 10 === 9) watch(); if (until && until()) { watch(); return true; } } watch(); return false; };

M.pronto('metropole'); S = G.S; M.viver(2); G.inSim++;
// the town: the biggest with a quay (the ship of w4 comes back to it); the other people: any other alive, not at war with it
const docks = s => [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'doca' && b.built);
const set = [...S.settlements.values()].filter(s => docks(s).length).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
const f = G.Fac.get(set.fac);
const en = [...S.factions.values()].filter(o => o.alive && o.id !== f.id).sort((a, b) => (G.Fac.atWar(f.id, a.id) ? 1 : 0) - (G.Fac.atWar(f.id, b.id) ? 1 : 0) || a.id - b.id)[0];
const enSet = en && G.Fac.capitalOf(en.id);
if (!set || !en || !enSet) { console.log('FALHOU | saque | sem uma cidade com cais e outro povo'); process.exit(1); }
console.log(`(${set.name}, ${f.name}: ${G.Village.pop(set.id)} habitantes; o outro povo: ${en.name}, ${enSet.name}; em guerra: ${G.Fac.atWar(f.id, en.id) ? 'sim' : 'não'})`);
const used = [];
// two grown people of the town, at home and free (not the god's body, not at sea, not in a cell, in no band), by id
const person = () => { const v = [...S.villagers.values()].filter(o => o.set === set.id && o.age >= 18 && o.age < 50 && !o.captive && !o.jail && !o.aboard && !o.ug && o.home && S.buildings.get(o.home) && S.buildings.get(o.home).built && !(o.task && (o.task.type === 'band' || o.task.type === 'combat')) && !used.includes(o.id) && !(S.avatar && S.avatar.id === o.id)).sort((a, b) => a.id - b.id)[0]; if (v) used.push(v.id); return v; };
const clean = v => { G.Vg.endTask(v); if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true, part: true }); };
const atHome = v => { const p = W.nearestLand(set.cx, set.cy, 6) || [set.cx, set.cy]; v.x = p[0] + 0.01 * (v.id % 7); v.y = p[1]; v.path = null; };
// (the test's hand: A goes with the family's purchase in the arms, B with what was taken)
function arm(A, B) {
  S.time = 0.15; // (the test sets the hour: a morning — at night a purchase waits in the arms until the family wakes)
  clean(A); clean(B);
  D.make('v:' + A.id, 'ceramica', 1, { code: 'teste', to: 'h:' + A.home });
  D.make('v:' + B.id, 'food', 3, { code: 'teste' });
  return 'h:' + A.home; // (the house the purchase is for — the planner may move them meanwhile; the load knows its house)
}
// what each case asks: the purchase still the family's — in the arms, or already at home —, never the store's; the loot in
// the store, with its line in the ledger; and, followed a while, the purchase at home
function judge(name, A, B, hr, L0, store0, how) {
  const kept = A.carry && A.carry.k === 'ceramica' && A.carry.to === hr && Math.abs(A.carry.n - 1) < 1e-6;
  // (home: the line of the purchase into its house — the house's own count moves with the family's life meanwhile)
  const reached = () => D.ledger().some(e => e[0] > L0 && e[3] === 'v:' + A.id && e[4] === hr && e[5] === 'ceramica');
  const intoStore = r2((f.stock.ceramica || 0) - store0);
  const loot = D.ledger().filter(e => e[0] > L0 && e[8] === 'saque' && e[3] === 'v:' + B.id && e[4] === 'f:' + f.id);
  const lootOk = !B.carry && loot.length === 1 && Math.abs(loot[0][6] - 3) < 1e-6;
  // (and the purchase goes on home: the next errand takes it there)
  const there = kept ? live(120, reached) : reached();
  if (!there) {
    const out = D.ledger().filter(e => e[0] > L0 && (e[3] === 'v:' + A.id || e[4] === hr || e[3] === hr)).map(e => `${e[0]} ${e[8]} ${e[3]}→${e[4]} ${e[6]} ${e[5]}`);
    console.log(`   (${name}: ${A.name} ${S.villagers.has(A.id) ? 'vivo' : 'MORTO'}, ${A.carry ? `leva ${A.carry.n} de ${A.carry.k} para ${A.carry.to}` : 'mãos vazias'}; tarefa ${A.task ? A.task.type + '.' + A.task.st : '-'}; mora em h:${A.home} (a compra era para ${hr}); em ${A.x.toFixed(1)},${A.y.toFixed(1)}; hora ${S.time.toFixed(2)}; o livro das mãos e da casa: ${out.join(' · ') || 'nada'})`);
  }
  const line = D.ledger().filter(e => e[0] > L0 && e[3] === 'v:' + A.id && e[4] === hr && e[5] === 'ceramica');
  // (the purchase is the family's: still in the arms when the war errand ends, and then into its house by the ledger — the
  // store's own count is only told: its people deliver to it meanwhile)
  ok(name, kept && lootOk && there && line.length >= 1 && !bad().length,
    `${how}: a compra de ${A.name} (1 de cerâmica para a casa) ${kept ? 'ficou nas mãos' : A.carry ? `virou ${A.carry.n} de ${A.carry.k}` : 'SAIU DAS MÃOS'}${intoStore > 0 ? ` e ENTROU NO ARMAZÉM (+${intoStore})` : ''}; ${there ? `chegou em casa (livro ${line.length ? line[0][0] : '—'})` : 'NÃO chegou em casa'}; o saque de ${B.name} (3 de comida) ${lootOk ? `no armazém pelo livro (lançamento ${loot[0][0]}, 'saque')` : B.carry ? `ainda nas mãos (${B.carry.n} de ${B.carry.k})` : 'no armazém SEM LINHA NO LIVRO'}`);
}

// ---------------- w1: the band let go (war.js: Wr.disband) — a band of defence that ends with the two in it
{
  const A = person(), B = person(); const hr = arm(A, B); atHome(A); atHome(B);
  const L0 = S.ledgerN, store0 = f.stock.ceramica || 0;
  const b = Wr.makeBand(f, en, set, [A, B], 'defesa');
  watch(); Wr.disband(b); watch();
  judge('w1 o bando que se desfaz', A, B, hr, L0, store0, `o bando de defesa #${b.id} se desfez`);
}
// ---------------- w2: raiders home (war.js: the road back) — a raid on its way home, its two at the gate of their town
{
  const A = person(), B = person(); const hr = arm(A, B);
  const L0 = S.ledgerN, store0 = f.stock.ceramica || 0;
  const b = Wr.makeBand(f, en, enSet, [A, B], 'saque', { from: set.id }); b.st = 'retorno'; b.t = 0; b.reached = true;
  atHome(A); atHome(B);
  const back = live(40, () => !(A.task && A.task.type === 'band') && !(B.task && B.task.type === 'band'));
  judge('w2 os saqueadores chegam em casa', A, B, hr, L0, store0, back ? `a incursão #${b.id} voltou a ${set.name}` : `a incursão #${b.id} NÃO voltou`);
  if (Wr.bands.has(b.id)) Wr.disband(b, true);
}
// ---------------- w3: a soldier routed (army.js: the flight home) — a host of two, both running for home
{
  const A = person(), B = person(); const hr = arm(A, B);
  const L0 = S.ledgerN, store0 = f.stock.ceramica || 0;
  const b = Wr.makeBand(f, en, enSet, [A, B], 'saque', { from: set.id });
  G.Army.organize(b, [A, B], f, en, enSet, set, {});
  A.task.fled = true; B.task.fled = true; A.task.fledC = 1; B.task.fledC = 1; // (the test's hand: both broke and ran)
  atHome(A); atHome(B);
  const back = live(40, () => !(A.task && A.task.type === 'band') && !(B.task && B.task.type === 'band'));
  judge('w3 o soldado que foge para casa', A, B, hr, L0, store0, back ? `o exército #${b.id} debandou e os dois chegaram a ${set.name}` : `os dois NÃO chegaram em casa`);
  if (Wr.bands.has(b.id)) Wr.disband(b, true);
}
// ---------------- w4: a ship back from a raid (naval.js: the landing) — a transport at its own quay, the two aboard
{
  const A = person(), B = person(); const hr = arm(A, B);
  const L0 = S.ledgerN, store0 = f.stock.ceramica || 0;
  if ((f.stock.wood || 0) < 40) D.make('f:' + f.id, 'wood', 40, { code: 'teste', part: true });
  const s = Nv.spawn('transporte', f, docks(set)[0], {});
  let how = 'o navio não saiu do estaleiro';
  if (s) {
    G.Vg.endTask(A); G.Vg.endTask(B); Nv.board(A, s); Nv.board(B, s); s.st = 'return'; s.path = null; s.t = 0;
    watch(); (Nv.RUN.transporte || Nv.RUN0.transporte)(s, 0.1); watch();
    how = `o transporte ${Nv.title ? Nv.title(s) : '#' + s.id} voltou e desembarcou os dois (a bordo agora: ${[A, B].filter(v => v.aboard).length})`;
  }
  judge('w4 o navio que volta de uma incursão', A, B, hr, L0, store0, how);
}
const e = M.erros();
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : `erros de módulo ${JSON.stringify(e.mod)}; console: ${e.console.slice(0, 3).join(' | ')}`);
console.log(fails.length ? `SAQUE: FALHOU (${fails.join(', ')})` : 'SAQUE: ok');
process.exit(fails.length ? 1 : 0);
