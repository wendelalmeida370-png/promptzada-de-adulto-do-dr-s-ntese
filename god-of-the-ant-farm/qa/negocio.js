// negocio: o primeiro negócio provocado de propósito (C1) — as bancas do mercado no mundo pronto «metrópole» (Argos, com
// moeda) e no «cidade» (um povo sem moeda: a troca).   node qa/negocio.js [cidade]     (em Node, pelo qa/nodemundo.js)
// n1 as bancas abrem (uma por mercador, cada uma no seu lugar; a prateleira velha do mercado passa a elas, nada some);
// n2 o atacado é pago (as mercadorias nas mãos e as moedas no tesouro ao mesmo tempo; sem moeda, sem mercadoria);
// n3 a banca mostra o que tem; n4 um cliente vem, pergunta, compra, paga à casa do vendedor e leva para a casa dele;
// n5 a pechincha (oferta, contraproposta, aceite); n6 a recusa (caro demais); n7 sem dinheiro; n8 save no meio da compra,
// carregado: a compra chega em casa, não no armazém; n9 o fim do dia (a banca fecha, o livro do dia fecha, a margem muda
// com o que vendeu e o que não vendeu); n10 o dono morre (a banca fecha, o estoque vai para a casa); n11 o mercado acaba
// (idem); n12 o corpo do deus é o mercador (compra no atacado, arruma a banca, abre, e um cliente compra dele); n13 o corpo
// compra e pechincha numa banca dos outros; n14 a cadeia inteira (navio → cais → armazém → atacado → banca → cliente →
// casa), cada elo no livro-razão; n15 um povo sem moeda: fiado no atacado, a venda em troca, a troca devolvida ao armazém;
// n16 os móveis dos interiores como o lugar da casa, da prateleira e da banca (a porta desligada no jogo; aqui um plano feito
// à mão); n17 a banca sem moeda fecha devendo: paga primeiro (o estoque pelo custo, depois a troca guardada na casa), o fiado
// nunca vira presente; e o verificador limpo, sem erro de módulo, durante e depois.
const M = require('./nodemundo.js');
const townName = process.argv[2] || 'Argos';
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | negocio ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const others = new Map();
const bad = () => QA.check().filter(q => q.sev <= 2).filter(q => { if (q.sys === 'act' || q.sys === 'nan') return true; others.set(q.msg, (others.get(q.msg) || 0) + 1); return false; });
const watch = () => { const bb = bad(); if (bb.length) { console.log('   verificador no meio:', bb.slice(0, 2).map(q => q.msg).join(' · ')); for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
const D = G.Depot, A = G.Act, B = G.Biz, E = G.Eco;
const r2 = x => Math.round(x * 100) / 100;
let S;
const live = (sec, until) => { for (let k = 0; k < sec; k++) { M.viver(1); if (until && until()) return true; } return false; };
const fine = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (until && until()) return true; } return false; };
const book = (code, f) => D.ledger().filter(e => e[8] === code && (!f || f(e)));
const nm = id => (S.villagers.get(id) || {}).name || '#' + id;
// the words said at the counters (what G.Falas said, by whom, with which key)
const said = []; let falas0 = null;
function listen() { if (falas0) return; falas0 = G.Falas.say; G.Falas.say = function (v, key, ctx) { const t = falas0(v, key, ctx); if (t && v) said.push([v.id, key, t, S.clock]); return t; }; }
const saidBy = (id, t0) => said.filter(e => e[0] === id && e[3] >= t0);
// a town that wants a merchant for its market: the god's will said to the people's own planner (the demand of jobs), which
// names one by its own rules and keeps him — a merchant made by hand would be sent back to the fields at the next round
let demand0 = null;
// — and keeps the ones it has while the test runs (a merchant the planner sends to the quay closes his stall: the world's
// rule, not the test's subject)
function wantMerchant(tw, mkt) {
  if (!demand0) demand0 = E.demand;
  const mine = () => [...S.villagers.values()].filter(v => v.set === tw.id && v.role === 'mercador' && v.job === mkt.id);
  const keep = Math.max(1, mine().length);
  E.demand = function (set, fac, Aa) { const o = demand0.call(this, set, fac, Aa); if (set.id === tw.id) o.mercador = Math.max(o.mercador || 0, keep); return o; };
  for (let k = 0; k < 8; k++) { const m = mine().sort((a, b) => a.id - b.id)[0]; if (m) return m; G.Village.forceUpdate(); }
  return null;
}
const wantNone = () => { if (demand0) E.demand = demand0; };
// (the test's hand: room on a stall whose sales furniture is full — its biggest other goods back to the people's store,
// in the ledger — so that a wholesale forced by the test has where to go; the world's own merchant buys only what fits)
function roomOn(z, k, n) {
  for (let g = 0; g < 30 && D.room('z:' + z.id, k) < n; g++) {
    const q = Object.keys(z.inv).filter(x => x !== k && x !== 'moedas' && z.inv[x] > 1e-6).sort((a, b) => z.inv[b] - z.inv[a] || (a < b ? -1 : 1))[0]; if (!q) break;
    D.move('z:' + z.id, 'f:' + z.fac, q, Math.min(z.inv[q], n - D.room('z:' + z.id, k)), { code: 'teste', part: true });
  }
}

// ================================ the world with coin ================================
M.pronto('metropole');
S = G.S;
let set = [...S.settlements.values()].find(s => s.name === townName);
if (!set) { console.log(`FALHOU | negocio | sem a cidade ${townName}`); process.exit(1); }
const mk = [...S.buildings.values()].find(b => b.set === set.id && b.type === 'mercado' && b.built);
const shelf0 = Object.assign({}, mk.inv || {}); const st0 = Object.assign({}, G.Fac.get(set.fac).stock);
// (everything that leaves or reaches the old shelf from now on, by the ledger: the stalls' share, a family's purchase
// before the stalls opened, what did not fit and went to the store)
const shelfFlow = {}; let shelfOut = 0;
D.onMove.push(e => { if (e[3] === 'b:' + mk.id) { shelfFlow[e[5]] = (shelfFlow[e[5]] || 0) - e[6]; shelfOut++; } if (e[4] === 'b:' + mk.id) shelfFlow[e[5]] = (shelfFlow[e[5]] || 0) + e[6]; });
M.viver(2); G.inSim++; listen();
let fac = G.Fac.get(set.fac);
const merchants = () => [...S.villagers.values()].filter(v => v.set === set.id && v.role === 'mercador' && v.job === mk.id);
console.log(`(${set.name}, ${fac.civ}: ${G.Village.pop(set.id)} habitantes; mercado #${mk.id}, mercadores: ${merchants().map(v => v.name).join(', ') || 'nenhum'}; moeda: ${E.coinage(fac.id) ? 'sim' : 'não'}; prateleira velha: ${Object.keys(shelf0).filter(k => shelf0[k] > 0).length} bens)`);
S.time = 0.1;

// ---------------- n1: the stalls open, each in its own place; the old shelf goes to them, nothing lost
{
  live(120, () => merchants().every(v => B.of(v)) || watch());
  const zs = merchants().map(v => B.of(v)).filter(Boolean);
  const slots = new Set(zs.map(z => z.slot));
  const moved = {}; for (const e of book('prateleira', e => e[3] === 'b:' + mk.id && e[4][0] === 'z')) moved[e[5]] = (moved[e[5]] || 0) + e[6];
  const left = mk.inv || {};
  const lost = Object.keys(shelf0).concat(Object.keys(left)).filter((k, i, a) => a.indexOf(k) === i && Math.abs((shelf0[k] || 0) + (shelfFlow[k] || 0) - (left[k] || 0)) > 0.01);
  ok('n1 as bancas abrem', zs.length === merchants().length && zs.length >= 1 && slots.size === zs.length && !lost.length && !bad().length,
    `${zs.length} banca(s) para ${merchants().length} mercador(es), nos lugares ${[...slots].join(', ')}; da prateleira velha passaram ${Object.keys(moved).length} bens às bancas (${shelfOut} lançamento(s) saindo dela no livro)${lost.length ? ', MAS NÃO FECHA: ' + lost.map(k => `${k} ${r2(shelf0[k] || 0)} ${r2(shelfFlow[k] || 0)} → ${r2(left[k] || 0)}`).join(', ') : ', o resto ao armazém pelo livro — nada sumiu'}`);
}
const z1 = B.of(merchants()[0]); const m1 = S.villagers.get(z1.owner);
// ---------------- n2: the wholesale is paid; no coin, no goods
{
  // (the merchant buys for his stall: what it lacks, from the people's store)
  const k = E.MARKET_GOODS.find(q => D.free('f:' + fac.id, q) >= 4 && (z1.inv[q] || 0) < 2) || 'food';
  const payer = E.homeOf(m1) ? 'h:' + m1.home : 'p:' + m1.id; D.make(payer, 'moedas', 20, { code: 'teste' }); // (a family with coins)
  roomOn(z1, k, 3);
  const c0 = D.get(payer, 'moedas'), t0 = fac.stock.moedas || 0, s0 = D.get('f:' + fac.id, k), L0 = S.ledgerN;
  G.Vg.setTask(m1, { type: 'atacado', biz: z1.id, k, n: 3, pri: 1, st: 0, id: mk.id });
  const got = live(120, () => !!book('atacado', e => e[0] > L0 && e[5] === k).length || watch());
  const legs = book('atacado', e => e[0] > L0);
  const goods = legs.find(e => e[5] === k), coin = legs.find(e => e[5] === 'moedas');
  const paidOk = !!goods && !!coin && coin[0] === goods[0] + 1 && coin[3] === payer && coin[4] === 'f:' + fac.id && Math.abs(coin[6] - r2((E.PRICE[k] || 0.3) * goods[6] * 0.6)) < 0.011;
  const arrived = live(120, () => !!book('entrega', e => e[0] > L0 && e[4] === 'z:' + z1.id).length || watch());
  // (now with an empty purse: the store gives nothing)
  D.use(payer, 'moedas', D.get(payer, 'moedas'), { code: 'teste' });
  roomOn(z1, k, 3); // (room on the stall: what stops it now is the purse)
  const s1 = D.get('f:' + fac.id, k), L1 = S.ledgerN;
  G.Vg.setTask(m1, { type: 'atacado', biz: z1.id, k, n: 3, pri: 1, st: 0, id: mk.id });
  live(60, () => !m1.task || m1.task.type !== 'atacado');
  const free = book('atacado', e => e[0] > L1 && e[9] === m1.id).length + book('fiado', e => e[0] > L1 && e[9] === m1.id).length;
  ok('n2 o atacado é pago', got && paidOk && arrived && !free && Math.abs(D.get('f:' + fac.id, k) - s1) < 1e-6 && !bad().length,
    goods ? `${m1.name} comprou ${goods[6]} de ${E.name(k)} no armazém e pagou ${coin ? coin[6] : '?'} ${B.money(fac.id).plural} da casa ao tesouro, no mesmo instante (livro ${goods[0]} e ${coin ? coin[0] : '?'}); ${arrived ? 'levou à banca' : 'NÃO chegou à banca'}; com a bolsa vazia, o armazém não deu nada (${free ? free + ' lançamento(s)!' : 'nenhum lançamento'}, ${E.name(k)} no armazém ${s1} → ${D.get('f:' + fac.id, k)})` : `nenhum atacado (${E.name(k)}: armazém ${s0}, casa ${c0}, tesouro ${t0})`);
}
// ---------------- n3: the stall shows what it holds
{
  const disp = B.display(z1); const inv = Object.keys(z1.inv).filter(k => z1.inv[k] >= 1 - 1e-6);
  const same = disp.length === inv.length && disp.every(g => Math.abs(g.n - Math.floor(z1.inv[g.k] + 1e-6)) < 1e-6 && g.form);
  ok('n3 a banca mostra o que tem', same && disp.length >= 1, `exposto: ${disp.map(g => `${g.n} ${E.name(g.k)} (${g.form}) a ${g.price}`).join(', ')}`);
}
// a buyer: a grown person of the town with a house, not a merchant, who reaches the counter (the first by id, or the last);
// free of an urgent errand if one is (a fire, a muster), rested and fed — a tired one goes to bed before the stall, a hungry
// one to the pantry: if none is, the test's hand
function pickBuyer(town, sp, not, last) {
  const L = [...S.villagers.values()].filter(v => v.set === town.id && !not.includes(v.id) && v.age >= 18 && !v.captive && !v.jail && !v.aboard && v.home && E.homeOf(v) && v.role !== 'mercador' && G.W.reaches(v, sp.buyer[0], sp.buyer[1])).sort((a, b) => (last ? b.id - a.id : a.id - b.id));
  // (and with free hands: a load in them has somewhere to go first, and a purchase does not fit)
  const calm = o => !(o.task && o.task.pri >= 1.5) && !(o.carry && o.carry.n > 0);
  const v = L.find(o => calm(o) && o.energy > 45 && o.hunger < 55 && !o.sleeping) || L.find(calm) || L[0] || null;
  if (v && !(v.energy > 45 && v.hunger < 55 && !v.sleeping)) { v.energy = Math.max(v.energy, 70); v.hunger = Math.min(v.hunger, 30); if (v.sleeping) G.Vg.endTask(v); }
  return v;
}
// a buyer sent to a stall for a good, until `until(v)`; if the world calls him away on the way, before he bought (a caravan,
// an envoy, a fire), another one — the town lives while the test runs
function sendBuyer(town, z, k, not, prep, until, sec) {
  const tried = [];
  for (let i = 0; i < 3; i++) {
    const v = pickBuyer(town, B.spots(z), not.concat(tried)); if (!v) return null;
    tried.push(v.id); prep(v);
    G.Vg.setTask(v, { type: 'compra', biz: z.id, k, pri: 1.3, st: 0 });
    let away = '';
    fine(sec, () => { if (until(v)) return true; if (!(v.carry && v.carry.bought) && v.task && v.task.type !== 'compra') { away = v.task.type; return true; } return watch(); });
    if (!away) return v;
    console.log(`   (${v.name} foi chamado para ${away} no caminho da banca: outro comprador)`);
  }
  return null;
}
// ... with so many coins in the house
// (and brought to the market's door — the test's hand: the deal is the subject, not the walk across town, and a long walk
// ends in the evening, when the stall closes)
function buyerFor(k, coins) {
  const sp = B.spots(z1); const v = pickBuyer(set, sp, [m1.id]); if (!v) return null;
  G.Vg.endTask(v); const nx = sp.buyer[0] + (sp.dx || 0) * 1.5, ny = sp.buyer[1] + (sp.dy || 0) * 1.5;
  if (G.W.walkableXY(nx, ny) && G.W.canWalk(nx, ny, sp.buyer[0], sp.buyer[1], false)) { v.x = nx; v.y = ny; } else { v.x = sp.buyer[0]; v.y = sp.buyer[1]; } v.path = null;
  const h = E.homeOf(v);
  if (coins !== undefined) { const have = D.get('h:' + h.id, 'moedas'); if (have < coins) D.make('h:' + h.id, 'moedas', coins - have, { code: 'teste' }); else if (have > coins) D.use('h:' + h.id, 'moedas', have - coins, { code: 'teste' }); }
  return v;
}
// the merchant at the counter
// (and the clock of the test back to the morning: the purchase that follows must not cross into the night, when buyers sleep)
// (the test's hand: a fresh day at the counter, that a caravan or an errand does not take him from while the case runs —
// a stall attended at this instant may be at the end of its own day there —, and something on it: a stall sold out
// closes at once, and its merchant goes for more: T-c)
const man = () => {
  const t0 = S.time;
  if (!Object.keys(z1.inv).some(k => z1.inv[k] >= 1)) D.make('z:' + z1.id, 'tecido', 3, { code: 'teste', part: true });
  G.Vg.setTask(m1, { type: 'banca', biz: z1.id, pri: 2, st: 0, dur: 200, id: mk.id });
  const r = fine(60, () => B.manned(z1));
  if (!r) console.log(`   (o mercador ${m1.name} não chegou à banca: ${m1.task ? m1.task.type + '.' + m1.task.st : 'sem tarefa'}, a ${r2(G.dist(m1.x, m1.y, B.spots(z1).seller[0], B.spots(z1).seller[1]))} do lugar, mãos ${JSON.stringify(m1.carry)}, banca ${z1.st} aberta ${z1.open}, hora ${S.time.toFixed(3)})`);
  S.time = t0; return r;
};
const goodOf = () => Object.keys(z1.inv).filter(k => z1.inv[k] >= 1 && k !== 'food').sort()[0] || Object.keys(z1.inv).find(k => z1.inv[k] >= 1);
// ---------------- n4: a buyer comes, asks, buys, pays the seller's house, carries it home
{
  S.time = 0.15; man();
  const k = goodOf(); z1.margin[k] = -0.1; // (cheap today)
  const v = buyerFor(k, 30); const h = E.homeOf(v); const sellerHouse = E.homeOf(m1) ? 'h:' + m1.home : 'p:' + m1.id;
  const have0 = D.get('h:' + h.id, k), coin0 = D.get('h:' + h.id, 'moedas'), sell0 = D.get(sellerHouse, 'moedas'), n0 = z1.day.n, L0 = S.ledgerN, t0 = S.clock;
  G.Vg.setTask(v, { type: 'compra', biz: z1.id, k, pri: 1.3, st: 0 });
  const sold = fine(120, () => z1.day.n > n0 || !v.task || watch());
  const sale = book('venda', e => e[0] > L0 && e[3] === 'z:' + z1.id && e[4] === 'v:' + v.id)[0];
  const pay = sale && D.ledger().find(e => e[0] === sale[0] + 1);
  const carry = v.carry && v.carry.k === k && v.carry.to === 'h:' + h.id && v.carry.bought;
  const home = live(120, () => D.get('h:' + h.id, k) > have0 + 1e-6 || watch());
  const talk = saidBy(v.id, t0).map(e => e[1]).concat(saidBy(m1.id, t0).map(e => e[1]));
  // (the payment is the ledger's line, from the buyer's house to the seller's, right after the goods: the houses' coins
  // move for other reasons meanwhile — a wage, a family's errand — so they are not counted)
  void coin0; void sell0;
  ok('n4 o cliente compra', sold && !!sale && !!pay && pay[3] === 'h:' + h.id && pay[4] === sellerHouse && pay[5] === 'moedas' && pay[6] > 0 && pay[8] === 'venda' && carry && home && talk.includes('perguntar') && talk.includes('preco') && !bad().length,
    sale ? `${v.name} perguntou e comprou ${sale[6]} de ${E.name(k)} de ${m1.name} por ${pay ? pay[6] : '?'} ${B.money(fac.id).plural} (da casa dele à do vendedor); levou nas mãos marcado para casa (${carry ? 'sim' : 'NÃO'}) e ${home ? 'chegou lá' : 'NÃO chegou'}; falas: ${talk.join(', ')}` : `não comprou (${v.task ? v.task.type + ' ' + v.task.talk : 'sem tarefa'}; ${talk.join(', ')})`);
}
// the price that makes a buyer haggle, refuse: the margin set so the stall asks f × what the buyer would give
function priceAt(k, v, f) { const h = E.homeOf(v); const w = B.wtp(v, h, z1, k); z1.margin[k] = 0; const p0 = B.price(z1, k); const base = E.PRICE[k] || 0.3; z1.margin[k] = r2((w * f) / base - p0 / base); return { w, p: B.price(z1, k) }; }
// ---------------- n5: the haggle — an offer, a counter-offer, a deal below the asking price
{
  S.time = 0.2; man();
  const k = goodOf(); const v = buyerFor(k, 30); const { w, p } = priceAt(k, v, 1.03);
  const n0 = z1.day.n, h0 = z1.day.hag, L0 = S.ledgerN, t0 = S.clock;
  const t5 = G.Vg.setTask(v, { type: 'compra', biz: z1.id, k, pri: 1.3, st: 0 });
  fine(120, () => z1.day.n > n0 || !v.task || v.task.type !== 'compra' || watch());
  const sale = book('venda', e => e[0] > L0 && e[3] === 'z:' + z1.id && e[4] === 'v:' + v.id)[0]; const pay = sale && D.ledger().find(e => e[0] === sale[0] + 1);
  const talk = said.filter(e => e[3] >= t0 && (e[0] === v.id || e[0] === m1.id)).map(e => e[1]);
  ok('n5 a pechincha', z1.day.hag > h0 && talk.includes('pechinchar') && talk.includes('contrapropor') && talk.includes('aceitar_contra') && !!pay && pay[6] < p * sale[6] - 0.005 && pay[6] <= w * sale[6] + 0.011 && !bad().length,
    `${v.name} daria ${w} e a banca pedia ${p}: ${talk.join(' → ')}; ${pay ? `fecharam por ${r2(pay[6] / sale[6])} cada (pago ${pay[6]})` : `não fecharam (a compra parou em st ${t5.st} fala ${t5.talk}; agora ${v.task ? v.task.type : 'sem tarefa'}; a ${r2(G.dist(v.x, v.y, B.spots(z1).buyer[0], B.spots(z1).buyer[1]))} do balcão; ${E.name(k)} na banca ${r2(z1.inv[k] || 0)}; banca ${B.manned(z1) ? 'atendida' : 'sem ninguém'})`}`);
  if (v.task && v.task.type === 'carga') live(60, () => !v.carry);
}
// ---------------- n6: too dear — the buyer walks away, nothing moves
{
  S.time = 0.25; man();
  const k = goodOf(); const v = buyerFor(k, 30); const { w, p } = priceAt(k, v, 1.6);
  const r0 = z1.day.refus, inv0 = z1.inv[k], L0 = S.ledgerN, t0 = S.clock;
  G.Vg.setTask(v, { type: 'compra', biz: z1.id, k, pri: 1.3, st: 0 });
  fine(120, () => !v.task || v.task.type !== 'compra' || watch());
  const talk = saidBy(v.id, t0).map(e => e[1]);
  ok('n6 a recusa', z1.day.refus > r0 && talk.includes('recusar_caro') && Math.abs(z1.inv[k] - inv0) < 1e-6 && !book('venda', e => e[0] > L0 && e[4] === 'v:' + v.id).length && !bad().length,
    `${v.name} daria ${w}, a banca pedia ${p}: "${(saidBy(v.id, t0).find(e => e[1] === 'recusar_caro') || [])[2] || '—'}"; nada mudou de mãos; recusas do dia ${z1.day.refus}`);
}
// ---------------- n7: no money — the buyer says so, nothing moves
{
  S.time = 0.28; man();
  const k = goodOf(); z1.margin[k] = 0.1; const v = buyerFor(k, 0); const hv = 'h:' + E.homeOf(v).id;
  const L0 = S.ledgerN, t0 = S.clock;
  const t = G.Vg.setTask(v, { type: 'compra', biz: z1.id, k, pri: 1.3, st: 0 });
  fine(120, () => !v.task || v.task.type !== 'compra' || watch());
  const talk = saidBy(v.id, t0).map(e => e[1]);
  ok('n7 sem dinheiro', talk.includes('sem_dinheiro') && !book('venda', e => e[0] > L0 && e[4] === 'v:' + v.id).length && !bad().length, `${v.name}, com a casa sem moedas: "${(saidBy(v.id, t0).find(e => e[1] === 'sem_dinheiro') || [])[2] || '—'}" (falas: ${talk.join(', ') || 'nenhuma'}; a compra parou em st ${t ? t.st : '?'} fala ${t ? t.talk : '?'}; agora ${v.task ? v.task.type : 'sem tarefa'}; a casa com ${r2(D.get(hv, 'moedas'))} moedas; a banca ${B.manned(z1) ? 'atendida' : 'sem ninguém'})`);
}
// ---------------- n8: a save in the middle of a purchase, loaded: the thing gets home, not into the people's store
{
  S.time = 0.3; man();
  const k = goodOf(); z1.margin[k] = -0.1; const v = buyerFor(k, 30); const vid = v.id; const h = E.homeOf(v); const hid = h.id;
  const n0 = z1.day.n; G.Vg.setTask(v, { type: 'compra', biz: z1.id, k, pri: 1.3, st: 0 });
  fine(120, () => z1.day.n > n0 || watch());
  const carrying = !!(v.carry && v.carry.to === 'h:' + hid);
  const have0 = D.get('h:' + hid, k), store0 = D.get('f:' + fac.id, k), n = v.carry ? v.carry.n : 0;
  const str = G.Save.serialize(); if (G.UI && G.UI.select) G.UI.select(null); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game';
  S = G.S; set = S.settlements.get(set.id); fac = G.Fac.get(set.fac);
  const v2 = S.villagers.get(vid); const L8 = S.ledgerN;
  // (where the load went, by the ledger: to the house, never into the people's store — the house may use it the same moment)
  const went = () => D.ledger().filter(e => e[0] > L8 && e[3] === 'v:' + vid && e[5] === k);
  live(150, () => went().length > 0 || watch());
  const toStore = went().filter(e => e[4][0] === 'f'), toHome = went().filter(e => e[4] === 'h:' + hid);
  const home = toHome.length >= 1;
  ok('n8 save no meio da compra', carrying && home && !toStore.length && toHome.length >= 1 && !bad().length,
    `${v2 ? v2.name : '#' + vid} levava ${n} de ${E.name(k)} comprados (marcados para a casa) na hora do save; depois do load ${home ? 'chegaram em casa' : 'NÃO chegaram em casa'} (${toHome.map(e => e[8]).join(', ')}); ao armazém do povo: ${toStore.length ? 'FOI' : 'nada'}`);
}
// (after a load: the objects are new)
let z = B.get(z1.id); let m = S.villagers.get(z.owner); const mkb = () => S.buildings.get(z.b);
// ---------------- n9: the end of the day: the stall shuts, its book closes, its margins move
{
  S.time = 0.4;
  if (!B.manned(z)) G.Vg.setTask(m, { type: 'banca', biz: z.id, pri: 1.2, st: 0, dur: 200, id: z.b });
  fine(60, () => B.manned(z));
  // (a good that nobody takes today: dear, at the top margin — the test's hand puts two from the store on the stall if it
  // has none; tomorrow it is cheaper)
  let kq = Object.keys(z.inv).filter(k => z.inv[k] >= 1 && !(z.day.sold[k] > 0)).sort()[0];
  if (!kq) { kq = E.MARKET_GOODS.filter(k => k !== 'food' && D.free('f:' + fac.id, k) >= 2 && !(z.day.sold[k] > 0)).sort()[0]; if (kq) { roomOn(z, kq, 2); D.move('f:' + fac.id, 'z:' + z.id, kq, 2, { code: 'teste', part: true }); } }
  if (kq) z.margin[kq] = 0.8;
  const ks = Object.keys(z.inv).filter(k => z.inv[k] >= 1).sort();
  const day0 = z.day.d, hist0 = z.hist.length; const mBefore = Object.assign({}, z.margin);
  // (the stall shuts at the first look of the businesses after the hours)
  S.time = 0.61; live(8, () => !z.open); const shut = !z.open; const why9 = `hora ${S.time.toFixed(3)}, banca ${z.st} aberta ${z.open}, na lista ${B.all().includes(z)}, o dono ${m.task ? m.task.type : 'sem tarefa'}`;
  S.time = 0.995; live(4);
  const rolled = z.day.d !== day0 && !!z.prev && z.prev.d === day0 && z.hist.length === hist0 + 1;
  const moved = ks.filter(k => (z.margin[k] || 0) !== (mBefore[k] === undefined ? 0.25 : mBefore[k]));
  ok('n9 o fim do dia', shut && rolled && moved.length >= 1 && (!kq || moved.includes(kq)) && !bad().length,
    `${shut ? 'ao fim da tarde a banca fechou' : 'a banca NÃO fechou (' + why9 + ')'}; o livro do dia ${rolled ? `fechou (${z.prev.n} vendas, ${z.prev.rev} de receita, ${z.prev.cost} de custo, ${z.prev.refus} recusa(s), ${z.prev.hag} pechincha(s))` : 'NÃO fechou'}; a margem mudou em ${moved.map(k => `${E.name(k)} ${mBefore[k] === undefined ? 0.25 : mBefore[k]} → ${z.margin[k]}`).join(', ') || 'nada'}`);
}
// ---------------- n12: the god's body is the merchant: buys wholesale, sets out the stall, opens, and a buyer buys from it
{
  S.time = 0.12; live(1);
  z = B.get(z1.id); m = S.villagers.get(z.owner);
  const payer = E.homeOf(m) ? 'h:' + m.home : 'p:' + m.id; D.make(payer, 'moedas', 20, { code: 'teste' });
  fine(90, () => !m.carry || watch()); // (a load already in the merchant's arms goes where it was going first)
  roomOn(z, 'food', 8); // (room on the stall for what the body buys)
  const tk = G.Possess.take(m); M.viver(0.2);
  // (to the store's door, wholesale; to the stall, set it out; open)
  const d = G.Village.nearestDropoff(m.x, m.y, m.set); const [dx, dy] = G.Village.frontTile(d); m.x = dx; m.y = dy; M.viver(0.2);
  const ow = A.offers(m, m.x, m.y, 2).find(o => o.act === 'atacado' && o.biz === z.id);
  const r1 = ow ? A.perform(m, ow) : { ok: false, why: 'sem oferta de atacado' };
  const sp = B.spots(z); m.x = sp.seller[0]; m.y = sp.seller[1]; M.viver(0.2);
  const op = A.offers(m, m.x, m.y, 2).find(o => o.act === 'porNaBanca' && o.biz === z.id);
  const r2_ = op ? A.perform(m, op) : { ok: false, why: 'sem oferta de pôr na banca' };
  const oo = A.offers(m, m.x, m.y, 2).find(o => o.act === 'abrir' && o.biz === z.id);
  const r3 = z.open ? { ok: true, msg: 'já aberta' } : oo ? A.perform(m, oo) : { ok: false, why: 'sem oferta de abrir' };
  // (a buyer at the god's stall: the same deal, the coin to the body's house)
  const k = ow ? ow.k : goodOf(); z.margin[k] = -0.1;
  const v = pickBuyer(set, sp, [m.id]);
  D.make('h:' + E.homeOf(v).id, 'moedas', 20, { code: 'teste' });
  const c0 = D.get(payer, 'moedas'), n0 = z.day.n;
  const tb = G.Vg.setTask(v, { type: 'compra', biz: z.id, k, pri: 1.3, st: 0 });
  const sold = fine(120, () => { m.x = sp.seller[0]; m.y = sp.seller[1]; return z.day.n > n0 || !v.task || v.task.type !== 'compra' || watch(); });
  const why12 = `a compra parou em st ${tb.st} fala ${tb.talk}, agora ${v.task ? v.task.type : 'sem tarefa'}; ${E.name(k)} na banca ${r2(z.inv[k] || 0)} a ${B.price(z, k)}, daria ${B.wtp(v, E.homeOf(v), z, k)}; banca ${B.manned(z) ? 'atendida' : 'sem ninguém'}`;
  const c1 = D.get(payer, 'moedas');
  G.Possess.release('deus'); M.viver(0.2);
  ok('n12 o corpo é o mercador', tk.ok && r1.ok && r2_.ok && r3.ok && sold && z.day.n > n0 && c1 > c0 && !bad().length,
    `${m.name} pelo deus: ${r1.ok ? r1.msg : r1.why} · ${r2_.ok ? r2_.msg : r2_.why} · ${r3.ok ? r3.msg : r3.why}; ${v.name} veio e ${z.day.n > n0 ? `comprou (a casa do corpo: ${r2(c0)} → ${r2(c1)} ${B.money(fac.id).plural})` : 'NÃO comprou (' + why12 + ')'}`);
}
// ---------------- n13: the god's body buys at someone else's stall, and haggles
{
  S.time = 0.15; live(1);
  z = B.get(z1.id); m = S.villagers.get(z.owner);
  if (!B.manned(z)) G.Vg.setTask(m, { type: 'banca', biz: z.id, pri: 1.2, st: 0, dur: 200, id: z.b });
  fine(60, () => B.manned(z)); S.time = 0.15;
  const sp = B.spots(z);
  const v = pickBuyer(set, sp, [m.id], true);
  const h = E.homeOf(v); D.make('h:' + h.id, 'moedas', 30, { code: 'teste' });
  const tk = G.Possess.take(v); M.viver(0.2); v.x = sp.buyer[0]; v.y = sp.buyer[1]; M.viver(0.2);
  // (a good the counter offers the body — the first ones shown — dearer today, so that the haggle has room)
  const o0 = A.offers(v, v.x, v.y, 2).find(o => o.act === 'pechinchar' && o.biz === z.id && o.k !== 'food') || A.offers(v, v.x, v.y, 2).find(o => o.act === 'pechinchar' && o.biz === z.id);
  const k = o0 ? o0.k : goodOf(); z.margin[k] = 0.3;
  const oh = A.offers(v, v.x, v.y, 2).find(o => o.act === 'pechinchar' && o.biz === z.id && o.k === k);
  const r1 = oh ? A.perform(v, oh) : { ok: false, why: 'sem oferta de pechincha' };
  let r2_ = { ok: false, why: '—' };
  if (r1.ok && r1.counter) { const oc = A.offers(v, v.x, v.y, 2).find(o => o.act === 'aceitarContra' && o.biz === z.id); r2_ = oc ? A.perform(v, oc) : { ok: false, why: 'sem oferta de aceitar a contraproposta' }; }
  const holding = !!(v.carry && v.carry.k === k && v.carry.to === 'h:' + h.id);
  G.Possess.release('deus'); M.viver(0.2);
  const home = live(120, () => !v.carry || watch());
  ok('n13 o corpo compra e pechincha', tk.ok && r1.ok && (r1.counter ? r2_.ok : true) && holding && home && !bad().length,
    `${v.name} pelo deus ofereceu menos: ${r1.ok ? r1.msg : r1.why}${r1.counter ? ` · aceitou a contraproposta: ${r2_.ok ? r2_.msg : r2_.why}` : ''}; a compra ${holding ? 'nas mãos, marcada para a casa' : 'NÃO estava nas mãos'}; devolvido, ${home ? 'levou para casa' : 'NÃO levou para casa'}`);
}
// ---------------- n16: the interiors' furniture as the room of a house, a shelf and a stall (the port is off in the game:
// here a plan made by hand) — a piece holds its cap in all, each good first in the piece made for it; the people's furniture
// is not the house's; the stall's own sales furniture by its number; with no plan, the room of today again
{
  z = B.get(z1.id); m = S.villagers.get(z.owner);
  const hv = [...S.villagers.values()].filter(v => v.set === set.id && v.home && E.homeOf(v) && v.id !== z.owner && v.home !== m.home).sort((a, b) => a.id - b.id)[0];
  const hh = E.homeOf(hv); const H = 'h:' + hh.id, F = 'f:' + fac.id;
  for (const [k, n] of Object.entries(D.list(H))) if (k !== 'moedas') D.use(H, k, n, { code: 'teste' });
  D.make(H, 'food', 20, { code: 'teste' }); D.make(H, 'tecido', 5, { code: 'teste' });
  if (D.free(F, 'tecido') < 12) D.make(F, 'tecido', 12, { code: 'teste', part: true });
  const sum = L => Object.keys(L || {}).filter(k => k !== 'moedas').reduce((a, k) => a + L[k], 0);
  const zsum = sum(z.inv), shsum = sum(S.buildings.get(z.b).inv);
  // (the shape the interiors give: G.Interiors.depotStores — sale: the stall's number on the sales furniture, null elsewhere)
  const plan = new Map([[hh.id, [{ id: hh.id + ':tulha', kind: 'tulha', keys: ['food'], cap: 28, dep: 'casa', sale: null }, { id: hh.id + ':bau', kind: 'bau', keys: '*', cap: 12, dep: 'casa', sale: null }, { id: hh.id + ':baia', kind: 'baia', keys: '*', cap: 100, dep: 'povo', sale: null }]],
    [z.b, [{ id: z.b + ':banca', kind: 'banca', keys: '*', cap: zsum + 6, dep: 'predio', sale: z.slot }, { id: z.b + ':prateleira', kind: 'prateleira', keys: '*', cap: shsum + 5, dep: 'predio', sale: null }]]]);
  const kz = Object.keys(z.inv).filter(k => k !== 'moedas').sort()[0] || 'tecido';
  const other = B.all().find(q => q.b === z.b && q.id !== z.id && q.st === 'on');
  const oRoom0 = other ? D.room('z:' + other.id, kz) : 0;
  D.stores = b => plan.get(b.id) || null;
  const rf = D.room(H, 'food'), rt = D.room(H, 'tecido'), rc = D.room(H, 'moedas');
  const mv1 = D.move(F, H, 'tecido', 9, { code: 'teste' }), mv2 = D.move(F, H, 'tecido', 9, { code: 'teste', part: true });
  const rf2 = D.room(H, 'food'); const sl = D.slots(H);
  const zr = D.room('z:' + z.id, kz), br = D.room('b:' + z.b, 'tecido'), oRoom = other ? D.room('z:' + other.id, kz) : 0;
  D.stores = null;
  // (with no plan, the counter of today: 20 in all, every good shared — the D-xxx of the sales furniture)
  const back = D.room(H, 'tecido') === Infinity && Math.abs(D.room('z:' + z.id, kz) - Math.max(0, 20 - sum(z.inv))) < 1e-6;
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  const slOk = sl.length === 2 && sl.some(s => s.m === hh.id + ':tulha' && s.k === 'food' && near(s.n, 20)) && sl.some(s => s.m === hh.id + ':bau' && s.k === 'tecido' && near(s.n, 12));
  ok('n16 os móveis guardam', near(rf, 15) && near(rt, 7) && rc === Infinity && !mv1.ok && mv1.why === 'não cabe' && mv2.ok && near(mv2.n, 7) && near(rf2, 8) && slOk && near(zr, 6) && near(br, 5) && near(oRoom, oRoom0) && back && !bad().length,
    `a casa de ${hv.name} com uma tulha de comida (28) e um baú (12), e a baia do povo (que não é dela): cabia ${rf} de comida e ${rt} de tecido; 9 de tecido ${mv1.ok ? 'COUBERAM' : 'não couberam (' + mv1.why + ')'}, em parte ${mv2.n}; depois cabia ${rf2} de comida; os móveis: ${sl.map(s => `${s.m ? String(s.m).split(':')[1] : 'chão'} ${s.n} ${E.name(s.k)}`).join(', ')}; a banca ${z.slot} cabia mais ${r2(zr)}, a prateleira do mercado ${r2(br)}${other ? `, a banca vizinha (sem móvel no plano) ${r2(oRoom)} como antes` : ''}; sem o plano, ${back ? 'a regra de hoje de novo' : 'NÃO voltou à regra de hoje'}`);
}
// ---------------- n10: the owner dies: the stall closes at once, its stock goes to the family's house, nothing lost
{
  z = B.get(z1.id); m = S.villagers.get(z.owner);
  const home = m.home ? 'h:' + m.home : null; const inv0 = Object.assign({}, z.inv);
  const h0 = {}; for (const k in inv0) h0[k] = home ? D.get(home, k) : 0; const f0 = {}; for (const k in inv0) f0[k] = D.get('f:' + fac.id, k);
  G.Village.kill(m, 'teste');
  const zz = all => (S.biz || []).find(q => q.id === z1.id);
  const closed = zz() && (zz().st === 'fim' || zz().st === 'saindo') && !zz().open;
  const ok10 = Object.keys(inv0).every(k => Math.abs(((home ? D.get(home, k) : 0) - h0[k]) + (D.get('f:' + fac.id, k) - f0[k]) + ((zz().inv || {})[k] || 0) - inv0[k]) < 0.01);
  live(3);
  ok('n10 o dono morre', closed && ok10 && !bad().length, `${m.name} morreu: a banca ${closed ? 'fechou na hora' : 'NÃO fechou'}; o estoque (${Object.keys(inv0).length} bens) foi para ${home ? 'a casa da família' : 'o armazém'}${ok10 ? ', nada sumiu' : ' — MAS NÃO FECHA'}`);
}
// ---------------- n11: the market is gone: its stalls close, their stock goes home (or to the store) — the ledger says
{
  const zs = B.all().filter(q => q.b === mk.id && q.st === 'on');
  const tot0 = {}; for (const q of zs) for (const k in q.inv) tot0[q.id + ':' + k] = q.inv[k];
  const L0 = S.ledgerN;
  const b = S.buildings.get(mk.id); if (b) G.Village.removeBuilding(b);
  live(3);
  const closed = zs.every(q => q.st === 'fim' || q.st === 'saindo');
  // (what each stall held left it with the cause "fechou", to a house or the store; what had no room anywhere is still there)
  const out = {}; for (const e of D.ledger()) if (e[0] > L0 && e[8] === 'fechou' && e[3][0] === 'z') { const key = e[3].slice(2) + ':' + e[5]; out[key] = (out[key] || 0) + e[6]; if (!/^(h|f):/.test(e[4])) out.bad = 1; }
  const lost = Object.keys(tot0).filter(key => { const [id, k] = key.split(':'); const q = zs.find(x => x.id === +id); return Math.abs((out[key] || 0) + ((q && q.inv[k]) || 0) - tot0[key]) > 0.01; });
  ok('n11 o mercado acaba', zs.length === 0 || (closed && !lost.length && !out.bad && !bad().length), zs.length ? `${zs.length} banca(s) fecharam com o mercado; o estoque foi para as casas (ou o armazém)${lost.length ? `, MAS não fecha: ${lost.join(', ')}` : ', nada sumiu'}` : 'nenhuma banca aberta para fechar');
}

// ================================ the chain, §37: from the ship to the house ================================
{
  M.pronto('metropole'); S = G.S; M.viver(2);
  const nMer = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'mercador').length;
  const port = [...S.settlements.values()].filter(s => [...S.buildings.values()].some(b => b.set === s.id && b.type === 'doca' && b.built) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'armazem' && b.built) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'mercado' && b.built) && E.coinage(s.fac) && G.Porto.access([...S.buildings.values()].find(b => b.set === s.id && b.type === 'doca' && b.built), G.Village.nearestDropoff(s.cx, s.cy, s.id))).sort((a, b) => nMer(b) - nMer(a))[0];
  let info = 'nenhuma cidade com cais, armazém do porto, mercado e moeda', fine14 = false;
  if (port) {
    const dock = [...S.buildings.values()].find(b => b.set === port.id && b.type === 'doca' && b.built);
    const mkt = [...S.buildings.values()].find(b => b.set === port.id && b.type === 'mercado' && b.built);
    const f = G.Fac.get(port.fac);
    // (a merchant for the market, if the town has none yet: the people's planner names one)
    let mer = wantMerchant(port, mkt);
    if (!mer) { info = `${port.name}: o povo não nomeou mercador para o mercado`; } else {
    const K = 'especiarias';
    S.time = 0.1; G.inSim = Math.max(G.inSim, 1);
    // (a clean quay, as in qa/porto.js: what was on it goes to the store — on a full quay the cargo would go straight in)
    for (const o of A.all()) if (o.def === 'descarga' && o.at === dock.id && A.live(o)) A.end(o, 'cancel', 'teste');
    for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + f.id, c.k, c.n, { code: 'teste', part: true });
    dock.crates = [];
    D.use('f:' + f.id, K, D.get('f:' + f.id, K), { code: 'teste' }); // (the store had none: all that comes is the ship's)
    const L0 = S.ledgerN;
    const sh = S.ships.find(s => s.kind === 'mercante') || S.ships[0]; sh.goods = { k: K, n: 8 }; G.Harbor.land(dock, sh.goods, sh);
    const opd = G.Porto.opAt(dock);
    live(300, () => !A.live(opd) || watch());
    // the merchant, in the morning: a stall, the spices on it (the test's hand on the clock, as in qa/porto.js)
    S.time = 0.15;
    let zz = B.of(mer); if (!zz) zz = B.open(mer, mkt);
    D.make(E.homeOf(mer) ? 'h:' + mer.home : 'p:' + mer.id, 'moedas', 30, { code: 'teste' }); // (where the family keeps its coins: its house, or the purse)
    zz.want[K] = 4; roomOn(zz, K, 4);
    G.Vg.setTask(mer, { type: 'atacado', biz: zz.id, k: K, n: 4, pri: 1.2, st: 0, id: mkt.id });
    live(150, () => (zz.inv[K] || 0) >= 1 || watch());
    S.time = 0.2;
    G.Vg.setTask(mer, { type: 'banca', biz: zz.id, pri: 1.2, st: 0, dur: 200, id: mkt.id });
    fine(60, () => B.manned(zz));
    // a rich house that fancies spices
    zz.margin[K] = -0.1;
    const buyer = sendBuyer(port, zz, K, [mer.id], v => D.make('h:' + E.homeOf(v).id, 'moedas', 40, { code: 'teste' }), v => D.get('h:' + E.homeOf(v).id, K) >= 1, 200);
    if (!buyer) info = `${port.name}: ninguém da cidade alcança a banca para comprar`; else {
    const hb = E.homeOf(buyer);
    // the links, in the ledger, in order
    const Lk = D.ledger().filter(e => e[0] > L0 && e[5] === K);
    const step = (code, from, to) => Lk.find(e => e[8] === code && (!from || e[3] === from || (from.endsWith(':') && e[3].startsWith(from))) && (!to || e[4] === to || (to.endsWith(':') && e[4].startsWith(to))));
    const opTo = opd.to;
    const links = [['desembarque', 's:' + sh.id, 'q:' + dock.id], ['pegar', 'q:' + dock.id, 'v:'], ['depositar', 'v:', opTo], ['atacado', 'f:' + zz.fac, 'v:' + mer.id], ['entrega', 'v:' + mer.id, 'z:' + zz.id], ['venda', 'z:' + zz.id, 'v:' + buyer.id], ['compra-em-casa', 'v:' + buyer.id, 'h:' + hb.id]].map(([c, a, b]) => [c, step(c, a, b)]);
    if (!links.every(l => l[1])) console.log(`   (n14: ${mer.name} ${mer.task ? mer.task.type + '.' + mer.task.st : '-'}, banca ${JSON.stringify(zz.inv)} ${B.manned(zz) ? 'atendida' : 'sem ninguém'}; ${buyer.name} ${buyer.task ? buyer.task.type + '.' + buyer.task.st + (buyer.task.talk !== undefined ? ' fala ' + buyer.task.talk : '') : '-'}${buyer.carry ? ' ' + JSON.stringify(buyer.carry) : ''}; o povo do cais ${opTo}, o da banca f:${zz.fac})`);
    const order = links.every((l, i) => l[1] && (i === 0 || l[1][0] > links[i - 1][1][0]));
    fine14 = links.every(l => l[1]) && order && D.get('h:' + hb.id, K) >= 1 && !bad().length;
    info = `${port.name}: ${links.map(([c, e]) => `${c} ${e ? e[3] + '→' + e[4] : 'FALTA'}`).join(' · ')}; ${order ? 'na ordem' : 'FORA DE ORDEM'}; ${E.name(K)} na casa de ${buyer.name}: ${D.get('h:' + hb.id, K)}`;
    } }
    wantNone();
  }
  ok('n14 a cadeia do navio à casa', fine14, info);
}

// ================================ a people without coin: the exchange ================================
{
  M.pronto('cidade'); S = G.S; M.viver(2); G.inSim = Math.max(G.inSim, 1);
  const tw = [...S.settlements.values()].filter(s => !E.coinage(s.fac) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'mercado' && b.built)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  let info = 'nenhuma cidade sem moeda com mercado', ok15 = false, ok17 = false, info17 = 'não chegou à venda';
  if (tw) {
    const mkt = [...S.buildings.values()].find(b => b.set === tw.id && b.type === 'mercado' && b.built); const f = G.Fac.get(tw.fac);
    let mer = wantMerchant(tw, mkt);
    if (!mer) { info = `${tw.name}: o povo não nomeou mercador para o mercado`; } else {
    S.time = 0.1;
    let zz = B.of(mer) || B.open(mer, mkt);
    const K = E.MARKET_GOODS.filter(q => q !== 'food' && !(zz.inv[q] >= 1)).sort()[0] || 'tecido';
    if ((f.stock[K] || 0) < 6) D.make('f:' + f.id, K, 6, { code: 'teste' });
    roomOn(zz, K, 3); const L0 = S.ledgerN;
    G.Vg.setTask(mer, { type: 'atacado', biz: zz.id, k: K, n: 3, pri: 1.2, st: 0, id: mkt.id });
    live(150, () => (zz.inv[K] || 0) >= 1 || watch());
    const onAccount = (zz.owe[K] || 0) > 0 && !!book('fiado', e => e[0] > L0 && e[5] === K && e[9] === mer.id).length;
    S.time = 0.2; // (the market's hours: the test's hand on the clock)
    G.Vg.setTask(mer, { type: 'banca', biz: zz.id, pri: 1.2, st: 0, dur: 200, id: mkt.id });
    fine(60, () => B.manned(zz));
    zz.margin[K] = -0.1;
    const t0 = S.clock; const n0 = zz.day.n;
    const buyer = sendBuyer(tw, zz, K, [mer.id], v => D.make('h:' + E.homeOf(v).id, 'food', 12, { code: 'teste' }), () => zz.day.n > n0, 120);
    if (!buyer) info = `${tw.name}: ninguém da cidade alcança a banca para comprar`; else {
    const hb = E.homeOf(buyer);
    const sale = book('venda', e => e[0] > L0 && e[3] === 'z:' + zz.id)[0]; const pay = sale && D.ledger().find(e => e[0] === sale[0] + 1);
    if (!sale) console.log(`   (n15: ${mer.name} ${mer.task ? mer.task.type + '.' + mer.task.st : '-'}, banca ${JSON.stringify(zz.inv)} ${B.manned(zz) ? 'atendida' : 'sem ninguém'}; ${buyer.name} ${buyer.task ? buyer.task.type + '.' + buyer.task.st + (buyer.task.talk !== undefined ? ' fala ' + buyer.task.talk : '') : '-'}; preço ${B.price(zz, K)}, daria ${B.wtp(buyer, hb, zz, K)})`);
    // (the payment in kind goes where the coins would: the seller's house — the stall, if the family has none)
    const kindRef = E.homeOf(mer) ? 'h:' + mer.home : 'z:' + zz.id;
    const inKind = !!pay && pay[5] === 'food' && pay[3] === 'h:' + hb.id && pay[4] === kindRef;
    const talk = said.filter(e => e[3] >= t0 && (e[0] === buyer.id || e[0] === mer.id)).map(e => e[2]);
    // (the exchange goods go back to the store: what the stall took on account is paid)
    const owe0 = Object.values(zz.owe).reduce((a, b) => a + b, 0); const got = r2(zz.got.food || 0);
    // (a full pantry at the merchant's house, so that the day of food the family keeps leaves something to pay with)
    if (kindRef[0] === 'h') D.make(kindRef, 'food', 6, { code: 'teste' });
    G.Vg.setTask(mer, { type: 'devolver', biz: zz.id, k: 'food', pri: 1.2, st: 0, id: mkt.id });
    live(150, () => !!book('troca', e => e[0] > L0).length && !mer.carry || watch());
    const owe1 = Object.values(zz.owe).reduce((a, b) => a + b, 0);
    ok15 = onAccount && !!sale && inKind && owe1 < owe0 - 1e-6 && !bad().length;
    info = `${tw.name} (${f.civ}, sem moeda): ${mer.name} levou ${E.name(K)} fiado (${onAccount ? 'devendo ' + r2(zz.owe[K] || owe0) : 'NÃO'}); ${buyer.name} ${sale ? `comprou ${sale[6]} e pagou ${pay ? pay[6] + ' de ' + E.name(pay[5]) : '?'}` : 'NÃO comprou'} (${talk.slice(0, 3).join(' / ')}); a troca (${got} de comida, paga ${kindRef[0] === 'h' ? 'à casa do mercador' : 'à banca'}) levada de lá ao armazém: a dívida ${r2(owe0)} → ${r2(owe1)}`;
    // ---- n17: the stall closes owing — it pays first (its stock back to the store at what it cost, then the exchange
    // still at the house), and only the rest goes home: what was taken on account is never a gift. (The debt made and the
    // stall closed in the same moment, by the god's body in the merchant's place: the planner may send a merchant to the
    // quay at its next round, and a merchant made by hand is sent back)
    {
      S.time = 0.12; const mer17 = wantMerchant(tw, mkt) || mer;
      const z17 = B.of(mer17) || B.open(mer17, mkt);
      roomOn(z17, K, 8); for (const q of [K, 'food']) if ((f.stock[q] || 0) < 20) D.make('f:' + f.id, q, 20, { code: 'teste' });
      if (mer17.carry) D.use('v:' + mer17.id, mer17.carry.k, mer17.carry.n, { code: 'teste', mine: true });
      const tk = G.Possess.take(mer17); M.viver(0.2);
      const d = G.Village.nearestDropoff(mer17.x, mer17.y, mer17.set); const [dx, dy] = G.Village.frontTile(d); mer17.x = dx; mer17.y = dy;
      const offs = A.offers(mer17, dx, dy, 2).filter(o => o.act === 'atacado' && o.biz === z17.id && o.ok !== false);
      const ow = offs.find(o => o.k === K) || offs[0];
      // (a stall that already owes the store needs no new debt: it closes owing what it owes)
      const owe0 = r2(Object.values(z17.owe).reduce((a, b) => a + b, 0));
      const Lw = S.ledgerN; const r = owe0 >= 1 ? { ok: true, msg: `a banca já devia ${owe0}` } : ow ? A.perform(mer17, ow) : { ok: false, why: 'sem oferta de atacado' };
      // (what the body bought on account goes on the counter at once — the god's hand, through the depot)
      if (mer17.carry && mer17.carry.to === 'z:' + z17.id) D.move('v:' + mer17.id, 'z:' + z17.id, mer17.carry.k, mer17.carry.n, { code: 'expor', by: mer17.id, part: true });
      const unit = k => z17.cost[k] || r2((E.PRICE[k] || 0.3) * 0.6);
      const oweA = r2(Object.values(z17.owe).reduce((a, b) => a + b, 0)); const stockV = r2(Object.keys(z17.inv).reduce((a, k) => a + (z17.inv[k] || 0) * unit(k), 0)); const cost0 = Object.assign({}, z17.cost);
      const fiado = book('fiado', e => e[0] > Lw).length;
      B.close(z17, 'teste');
      G.Possess.release('deus'); M.viver(0.2);
      const lines = book('acerto', e => e[0] > Lw);
      const paid = r2(lines.reduce((a, e) => a + e[6] * (e[3][0] === 'z' ? (cost0[e[5]] || r2((E.PRICE[e[5]] || 0.3) * 0.6)) : (E.PRICE[e[5]] || 0.3)), 0));
      const toStore = lines.every(e => e[4] === 'f:' + f.id);
      ok17 = tk.ok && r.ok && (fiado >= 1 || owe0 >= 1) && oweA > 0 && !Object.keys(z17.owe).length && toStore && paid <= oweA + 0.06 && paid >= Math.min(oweA, stockV) - 0.06 && !bad().length;
      info17 = `${mer17.name} pelo deus: ${r.ok ? r.msg : r.why}; a banca devia ${oweA} e fechou: voltaram ao armazém ${lines.length} lançamento(s) de acerto que valem ${paid} (o estoque valia ${stockV} pelo custo)${toStore ? '' : ' — MAS NEM TODOS AO ARMAZÉM'}; a dívida ${Object.keys(z17.owe).length ? 'FICOU' : 'acabou'}`;
    }
    } }
    wantNone();
  }
  ok('n15 a troca, sem moeda', ok15, info);
  ok('n17 a banca fecha devendo', ok17, info17);
}

const e = M.erros();
if (others.size) console.log(`   (o verificador, em outros sistemas, durante o cenário: ${[...others.keys()].slice(0, 6).join(' · ')}${others.size > 6 ? ` · e mais ${others.size - 6}` : ''})`);
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `NEGOCIO: FALHOU (${fails.join(', ')})` : 'NEGOCIO: ok');
process.exit(fails.length ? 1 : 0);
