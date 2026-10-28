// moedas: as moedas da casa e do bolso só mexem pelo livro-razão (C1, a pedido do líder) — um dia de cidade com imposto,
// roubo, rodada de taverna, compra e salário, provocados de propósito, no mundo pronto «metropole» (ou: node qa/moedas.js X).
// m1 o imposto: o coletor bate às portas — as moedas da casa às mãos dele, marcadas para o tesouro, e ao tesouro
// m2 o roubo: as moedas da casa ao bolso do ladrão
// m3 a taverna: a refeição e a rodada, da casa de quem bebe à do taverneiro (ou ao tesouro)
// m4 a compra da família: a moeda da casa de quem compra à de quem vende (ou ao tesouro)
// m5 o salário: do tesouro à casa de quem trabalha
// m6 a casa que cai leva as suas moedas com uma linha no livro; quem morre deixa o bolso à casa
// m7 o dia inteiro da cidade: casa por casa, bolso por bolso e mãos por mãos, o que mudou é exatamente o que o livro diz,
//    e ninguém escreveu nelas fora do depósito; a soma das casas, dos bolsos, das mãos e dos tesouros contra o livro — o que
//    o tesouro mudou fora dele é o T-063 (o tesouro escrito à mão), e cada lugar que fez isso é nomeado
// e o verificador limpo, sem erro de módulo nem aviso no console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const mid = [];
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | moedas ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan'));
const watch = () => { const bb = bad(); if (bb.length) { for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
const D = G.Depot, E = G.Eco, V = G.Village, Vg = G.Vg;
const r2 = x => Math.round(x * 100) / 100;
const world = process.argv[2] || 'metropole';
M.pronto(world); let S = G.S; M.viver(2); G.inSim++;
const live = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 100 === 99) watch(); if (until && until()) return true; } return false; };
const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing && b.type !== 'ruin');
const of = s => [...S.buildings.values()].filter(b => b.set === s.id && b.built);

// ---------------- the instruments: every coin line of the ledger, by holder; and who writes coins outside the depot ----------------
const flow = new Map(); const lines = [];
D.onMove.push(e => { if (e[5] !== 'moedas') return; flow.set(e[3], (flow.get(e[3]) || 0) - e[6]); flow.set(e[4], (flow.get(e[4]) || 0) + e[6]); lines.push(e); });
let depth = 0; for (const k of Object.keys(D)) if (typeof D[k] === 'function') { const f0 = D[k]; D[k] = function () { depth++; try { return f0.apply(this, arguments); } finally { depth--; } }; }
const outside = new Map(); // (where — file:line — a coin was written outside the depot, and how much)
const where = () => { const st = new Error().stack.split('\n').slice(2).map(l => l.trim()); const fr = st.find(l => /\/js\//.test(l)) || st[0] || '?'; const m = fr.match(/\/js\/([^:]+:\d+)/); return m ? m[1] : fr.slice(0, 60); };
function watchCoin(o, field, ref) {
  if (!o || Object.getOwnPropertyDescriptor(o, field)?.get) return;
  let val = o[field];
  Object.defineProperty(o, field, { configurable: true, enumerable: true, get() { return val; }, set(x) { if (!depth && G.inSim && typeof x === 'number' && Math.abs((x || 0) - (val || 0)) > 1e-9) { const k = ref + ' ← ' + where(); const r = outside.get(k) || { n: 0, sum: 0 }; r.n++; r.sum += (x || 0) - (val || 0); outside.set(k, r); } val = x; } });
}
function snap() {
  const m = new Map();
  for (const b of S.buildings.values()) if (housing(b)) m.set('h:' + b.id, b.coin || 0);
  for (const v of S.villagers.values()) { if (v.purse) m.set('p:' + v.id, v.purse); if (v.carry && v.carry.k === 'moedas' && v.carry.n > 0) m.set('v:' + v.id, v.carry.n); }
  for (const f of S.factions.values()) m.set('f:' + f.id, f.stock.moedas || 0);
  return m;
}

// ---------------- the town: a people with coin, its tax office, its tavern, houses with coins ----------------
const coinTowns = [...S.settlements.values()].filter(s => E.coinage(s.fac) && of(s).some(b => b.type === 'coletoria') && of(s).some(b => b.type === 'taverna')).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id);
const set = coinTowns[0];
if (!set) { console.log(`FALHOU | moedas | nenhuma cidade com moeda, coletoria e taverna em ${world}`); process.exit(1); }
const fac = G.Fac.get(set.fac); const F = 'f:' + fac.id;
console.log(`(${world}: ${set.name}, de ${fac.name}: ${V.pop(set.id)} habitantes; ${of(set).filter(housing).length} casas)`);
const before = snap();
for (const f of S.factions.values()) watchCoin(f.stock, 'moedas', 'tesouro');
for (const b of S.buildings.values()) if (housing(b)) watchCoin(b, 'coin', 'casa');
for (const v of S.villagers.values()) watchCoin(v, 'purse', 'bolso');
const people = () => [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && v.age < 60 && !v.captive && !v.jail && !v.aboard && !v.ug && !(S.avatar && S.avatar.id === v.id) && E.homeOf(v));
const used = new Set(); const pick = pred => { const v = people().filter(o => !used.has(o.id) && (!pred || pred(o))).sort((a, b) => a.id - b.id)[0]; if (v) used.add(v.id); return v; };
const linesOf = (code, test) => lines.filter(e => e[8] === code && (!test || test(e)));
S.time = 0.2; // (a morning: the markets and the doors open)

// m1 the tax round: the houses with coins near the tax office, by the economy's own errand
let tax = null, taxRoute = [];
{
  const b = of(set).find(o => o.type === 'coletoria'); tax = pick();
  const homes = of(set).filter(h => housing(h) && (h.coin || 0) >= 2 && !(tax && h.id === tax.home)).sort((a, c) => G.dist2(a.x, a.y, b.x, b.y) - G.dist2(c.x, c.y, b.x, b.y)).slice(0, 4);
  taxRoute = homes.map(h => h.id);
  if (tax && homes.length) { if (tax.carry) D.use('v:' + tax.id, tax.carry.k, tax.carry.n, { code: 'teste', mine: true, part: true }); Vg.setTask(tax, { type: 'taxes', id: b.id, route: taxRoute, k: 0, bag: 0, pri: 4 }); }
}
// m2 the theft: a thief at the door of a house with coins
let thief = null, robbed = null;
{
  robbed = of(set).filter(h => housing(h) && (h.coin || 0) >= 3 && !taxRoute.includes(h.id)).sort((a, c) => c.coin - a.coin || a.id - c.id)[0];
  thief = pick(o => robbed && o.home !== robbed.id);
  if (thief && robbed) Vg.setTask(thief, { type: 'furto', house: robbed.id, pri: 4, st: 0, kind: 'furto' });
}
// m3 the tavern: a drinker with coins at home
let drinker = null;
{
  const tv = of(set).find(o => o.type === 'taverna');
  if (tv && !((tv.inv || {}).food >= 2)) D.make('b:' + tv.id, 'food', 6, { code: 'teste', part: true }); // (a meal on the tavern's shelf)
  drinker = pick(o => (E.homeOf(o).coin || 0) >= 3 && tv && G.dist(o.x, o.y, tv.x, tv.y) < 25);
  if (drinker) { const t = E.tavernTask(drinker, Vg.H); if (t) t.pri = 4; }
}
// m4 the family's errand of shopping: one of a house that lacks something and has coins
let shopper = null, shopWhy = '', shopZ = null, shopK = null, shopTries = 0;
{
  // (a purchase at a merchant's stall — the family's errand goes there first —: an open, manned stall of a people with coin,
  // anywhere in the world, a good on it a little cheaper today, and one of that town with coins at home who reaches it)
  const B = G.Biz;
  // (a merchant of a people with coin at the market he works at: his stall — opened as his own morning would open it —, a
  // good on it, and a turn at it)
  const mkOf = o => { const b = S.buildings.get(o.job); return b && b.type === 'mercado' && b.built ? b : null; };
  // (never one another case took: in the metropole of 28/10 the first merchant was Miztli, the drinker of m3, and his turn at
  // the stall took him out of the tavern before he paid, T-182)
  const mer = B && [...S.villagers.values()].filter(o => o.role === 'mercador' && !used.has(o.id) && !o.captive && !o.jail && !o.aboard && !o.ug && mkOf(o) && E.coinage(G.Village.facOfSet(mkOf(o).set)) && !(S.avatar && S.avatar.id === o.id)).sort((a, b) => a.id - b.id)[0];
  if (mer) used.add(mer.id);
  const z = mer ? B.of(mer) || B.open(mer, mkOf(mer)) : null;
  if (z && !Object.keys(z.inv || {}).some(k => k !== 'moedas' && z.inv[k] >= 1)) D.make('z:' + z.id, 'tecido', 3, { code: 'teste', part: true });
  if (z && !B.manned(z)) { Vg.endTask(mer); Vg.setTask(mer, { type: 'banca', biz: z.id, pri: 2, st: 0, dur: 200, id: z.b }); live(40, () => B.manned(z)); }
  if (z && B.manned(z)) {
    const mb = S.buildings.get(z.b); const k = Object.keys(z.inv).filter(q => q !== 'moedas' && z.inv[q] >= 1).sort()[0]; z.margin = z.margin || {}; z.margin[k] = -0.1;
    const sp = B.spots(z);
    shopper = [...S.villagers.values()].filter(o => o.set === mb.set && o.age >= 18 && o.age < 60 && !o.captive && !o.jail && !o.aboard && !o.ug && E.homeOf(o) && o.role !== 'mercador' && o.id !== z.owner && !used.has(o.id) && !(o.carry && o.carry.n > 0) && G.W.reaches(o, sp.buyer[0], sp.buyer[1]) && !(S.avatar && S.avatar.id === o.id)).sort((a, b) => a.id - b.id)[0] || null;
    if (shopper) {
      used.add(shopper.id); const hh = E.homeOf(shopper); if ((hh.coin || 0) < 5) D.make('h:' + hh.id, 'moedas', 10, { code: 'teste' });
      shopper.hunger = Math.min(shopper.hunger, 30); shopper.energy = Math.max(shopper.energy, 70); Vg.endTask(shopper);
      Vg.setTask(shopper, { type: 'compra', biz: z.id, k, pri: 4, st: 0 }); shopWhy = `${E.name(k)} na banca #${z.id}`; shopZ = z; shopK = k;
    }
  }
}
// m5 the wage: the state pays a worker for what was brought in
let worker = null, wage = 0;
{ worker = pick(); if (worker && (fac.stock.moedas || 0) > 5) wage = E.pay(worker, 'wood', 4); }

// (the stall's line full when the shopper gets there — the good a little cheaper today brings the town to it —: she goes off, as
// anyone would; the case is the coin of the deal, not the line, so she goes again once the line has room, up to three times:
// Yaretzi, in the metropole of 28/10, found it full, T-186)
const shopDone = () => lines.some(e => shopper && e[3] === 'h:' + shopper.home && e[5] === 'moedas' && (e[8] === 'compra' || e[8] === 'venda' || e[8] === 'compra-em-casa'));
live(150, () => {
  if (shopper && shopZ && !shopDone() && !(shopper.task && shopper.task.type === 'compra') && shopTries < 3 && G.Biz.manned(shopZ) && !G.Life.queueFull('biz:' + shopZ.id)) { shopTries++; Vg.setTask(shopper, { type: 'compra', biz: shopZ.id, k: shopK, pri: 4, st: 0 }); }
  const done1 = !tax || !(tax.task && tax.task.type === 'taxes');
  const done2 = !thief || !(thief.task && thief.task.type === 'furto');
  const done3 = !drinker || !(drinker.task && drinker.task.type === 'tavern');
  const done4 = !shopper || shopDone() || (shopTries >= 3 && !(shopper.task && (shopper.task.casa || shopper.task.type === 'compra' || shopper.task.type === 'shop')));
  return done1 && done2 && done3 && done4;
});
{
  const inn = linesOf('imposto', e => taxRoute.includes(+String(e[3]).slice(2)) && e[3][0] === 'h'); const outT = linesOf('imposto', e => e[4] === F);
  ok('m1 o imposto: da casa às mãos do coletor e ao tesouro, pelo livro', !!tax && inn.length > 0 && outT.length > 0, tax ? `${tax.name}: ${inn.length} porta(s) pagaram ${r2(inn.reduce((s, e) => s + e[6], 0))} moedas (${inn.map(e => e[3] + '→' + e[4]).slice(0, 3).join(', ')}); ao tesouro ${r2(outT.reduce((s, e) => s + e[6], 0))}` : 'ninguém para cobrar');
}
{
  const st = linesOf('roubo', e => robbed && e[3] === 'h:' + robbed.id);
  ok('m2 o roubo: da casa ao bolso do ladrão, pelo livro', !!thief && st.length > 0, thief ? `${thief.name} na porta da casa #${robbed.id}: ${st.length ? r2(st[0][6]) + ' moedas para ' + st[0][4] : 'nada levado'}` : 'sem ladrão ou sem casa');
}
{
  const tv = lines.filter(e => (e[8] === 'taverna' || e[8] === 'rodada') && drinker && e[3] === 'h:' + drinker.home);
  ok('m3 a taverna: a refeição e as rodadas, da casa de quem bebe, pelo livro', !!drinker && tv.length > 0, drinker ? `${drinker.name}: ${tv.map(e => e[8] + ' ' + r2(e[6]) + ' → ' + e[4]).slice(0, 4).join(', ') || 'nada pago'}` : 'ninguém na taverna');
}
{
  const cp = lines.filter(e => shopper && e[3] === 'h:' + shopper.home && e[5] === 'moedas' && (e[8] === 'compra' || e[8] === 'venda' || e[8] === 'compra-em-casa'));
  ok('m4 a compra da família: a moeda da casa a quem vende, pelo livro', !!shopper && cp.length > 0, shopper ? `${shopper.name} (${shopWhy}${shopTries ? ', mandada de novo ' + shopTries + ' vez(es): a fila estava cheia' : ''}): ${cp.map(e => e[8] + ' ' + r2(e[6]) + ' → ' + e[4]).slice(0, 3).join(', ') || 'nada comprado (agora ' + (shopper.task ? shopper.task.type : 'sem tarefa') + ')'}` : 'ninguém com compras a fazer que ache onde comprar');
}
{
  const sl = linesOf('salario', e => worker && e[4] === 'h:' + worker.home);
  ok('m5 o salário: do tesouro à casa de quem trabalha, pelo livro', !!worker && wage > 0 && sl.length > 0, worker ? `${worker.name}: ${r2(wage)} moedas (${sl.map(e => e[3] + '→' + e[4]).join(', ')})` : 'ninguém');
}
// m6 a house that falls; a death with a purse
{
  const h = of(set).filter(o => housing(o) && (o.coin || 0) >= 1 && o.id !== (tax && tax.home) && o.id !== (thief && thief.home)).sort((a, b) => a.id - b.id)[0];
  const c0 = h ? h.coin : 0; if (h) V.destroyBuilding(h, 'deus');
  const ru = linesOf('ruina', e => h && e[3] === 'h:' + h.id);
  const d = pick(); let dp = 0, inh = [];
  if (d) { D.make('p:' + d.id, 'moedas', 5, { code: 'teste' }); dp = d.purse; const home = d.home; V.kill(d, 'god', true); inh = linesOf('herdado', e => e[3] === 'p:' + d.id && e[4] === 'h:' + home); }
  ok('m6 a casa que cai leva as moedas com a sua linha; o bolso de quem morre fica para a casa', !!h && ru.length === 1 && Math.abs(ru[0][6] - c0) < 1e-6 && !!d && inh.length === 1 && Math.abs(inh[0][6] - dp) < 1e-6,
    `${h ? `a casa #${h.id} com ${r2(c0)}: ${ru.length ? 'ruína, ' + r2(ru[0][6]) + ' moedas perdidas no livro' : 'nada no livro'}` : 'nenhuma casa com moedas'}; ${d ? `${d.name} morreu com ${r2(dp)} no bolso: ${inh.length ? r2(inh[0][6]) + ' para a casa' : 'nada no livro'}` : 'ninguém'}`);
}
// m7 the whole day of the town
live(200);
{
  const after = snap(); const keys = new Set([...before.keys(), ...after.keys(), ...flow.keys()]);
  const wrong = []; let sumIn = 0, sumOut = 0, made = 0, usedC = 0;
  for (const k of keys) {
    if (k[0] === '@') { if (k === '@mundo') made = -(flow.get(k) || 0); else usedC = flow.get(k) || 0; continue; }
    const d = (after.get(k) || 0) - (before.get(k) || 0); const f = flow.get(k) || 0;
    if (k[0] === 'f') { sumIn += d; sumOut += f; continue; }
    // (houses, purses, hands: one by one; the other holders of coins — a ship's holds, a stall — are the sum's)
    if (k[0] !== 'h' && k[0] !== 'p' && k[0] !== 'v') continue;
    if (Math.abs(d - f) > 1e-3) wrong.push(`${k}: mudou ${r2(d)}, o livro diz ${r2(f)}`);
  }
  const hand = [...outside.entries()].filter(([k]) => !k.startsWith('tesouro'));
  ok('m7 o dia inteiro: casa por casa, bolso por bolso e mãos por mãos, só o que o livro diz; ninguém escreve nelas fora do depósito', !wrong.length && !hand.length,
    `${keys.size} donos de moedas olhados, ${lines.length} linhas de moedas no livro (feitas ${r2(made)}, gastas ${r2(usedC)})${wrong.length ? '; DIFERENÇAS: ' + wrong.slice(0, 4).join(' · ') : ''}${hand.length ? '; FORA DO DEPÓSITO: ' + hand.slice(0, 4).map(([k, r]) => `${k} (${r.n}×, ${r2(r.sum)})`).join(' · ') : ''}`);
  const tre = [...outside.entries()].filter(([k]) => k.startsWith('tesouro'));
  const treOut = tre.reduce((s, [, r]) => s + r.sum, 0);
  const closes = Math.abs(sumIn - (sumOut + treOut)) < 1e-2;
  ok('m7 os tesouros: o livro e o que se escreveu à mão (T-063) fecham a conta', closes, `os tesouros mudaram ${r2(sumIn)}: pelo livro ${r2(sumOut)}, à mão ${r2(treOut)}${tre.length ? ' — ' + tre.map(([k, r]) => `${k.replace('tesouro ← ', '')} (${r.n}×, ${r2(r.sum)})`).join(' · ') : ''}`);
}
{ const e = M.erros(); ok('limpo', M.limpo() && !watch(), Object.keys(e.mod).length ? JSON.stringify(e.mod) : e.console.length ? e.console.slice(0, 2).join(' · ') : 'sem erro de módulo nem aviso no console; o verificador limpo'); }
console.log(`MOEDAS: ${fails.length ? 'FALHOU (' + fails.join(', ') + ')' : 'ok'}`);
process.exit(fails.length ? 1 : 0);
