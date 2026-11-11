// compras: as compras da casa provocadas de propósito (C1) — a família que precisa vai comprar, pela moeda da casa, no
// mundo pronto «metrópole» (a cidade mais antiga com moeda, feira e casas de família para os casos — hoje, Argos) e no
// «cidade» (um povo sem moeda). Sem uma cidade que sirva, falha dizendo o que falta.   node qa/compras.js   (em Node)
// c1 a casa que precisa manda um dos seus; c2 a compra paga pela casa (no livro-razão) chega em casa; c3 sem moeda,
// ninguém sai; c4 nada faltando, ninguém sai; c5 um de cada vez; c6 fora das horas do mercado, ninguém sai; c7 save no
// meio do recado: o recado perdido não prende a casa, e ela compra de novo, um de cada vez; c18 quem perdeu os dois braços
// não vai às compras — outro da casa vai, e a tentativa da casa não é gasta (L-710); c8 quem compra morre com a
// compra nas mãos: ela vai para a casa, pelo livro; c9 um povo sem moeda compra em espécie; c10 o salto: as casas compram
// também no salto; c11 o volume de um dia (antes da Etapa 4: nenhuma compra no dia que começa às 0,10); c13 com uma compra
// nas mãos, um afazer de fora espera (a caverna punha as suas coisas por cima dela), um chamado urgente leva; c12 o corpo do
// deus não é mandado: a casa aparece no diário dele como um objetivo; c14 a casa cheia não compra (com os móveis dos
// interiores, a casa guarda o que eles comportam — D-053, D-059); c15 com pouco lugar, compra só o que cabe; c16 nada pago
// se perde: o que não coube no caminho fica no chão da casa, nunca no estoque do povo; c17 a água da casa espera a volta de
// quem foi às compras (L-203); e o verificador limpo, sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; console.log(`${pass ? 'PASSOU' : 'FALHOU'} | compras ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const others = new Map();
const bad = () => QA.check().filter(q => q.sev <= 2).filter(q => { if (q.sys === 'act' || q.sys === 'nan') return true; others.set(q.msg, (others.get(q.msg) || 0) + 1); return false; });
const watch = () => { const bb = bad(); if (bb.length) { console.log('   verificador no meio:', bb.slice(0, 2).map(q => q.msg).join(' · ')); for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
const D = G.Depot, E = G.Eco, C = G.Compras;
const r2 = x => Math.round(x * 100) / 100;
let S;
const nm = id => (S.villagers.get(id) || {}).name || '#' + id;
const fine = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (until && until()) return true; } return false; };
// (the clock held at the case's hour while it waits — the test's hand: a wait that ran into the evening would shut the fair)
const atHour = (t0, f) => () => { if (S.time > t0) S.time = t0; return f(); };
const members = h => [...S.villagers.values()].filter(v => v.home === h.id);
const adults = h => members(h).filter(v => v.age >= 14 && !v.captive && !v.jail && !v.aboard);
const errandOf = h => [...S.villagers.values()].find(v => v.task && v.task.casa === h.id) || null;
const book = f => D.ledger().filter(f);
// (a world without what the cases ask stops here, out loud, with what it lacks — never a TypeError, never an empty pass)
const none = why => { console.log(`FALHOU | compras | ${why}`); process.exit(1); };
// the houses of a town with a few grown people in them (by id, past the ones taken)
const taken = new Set();
const homesOf = (set, min, pred) => [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type].housing && (b.res || 0) >= 2 && !taken.has(b.id) && adults(b).length >= (min || 2) && (!pred || pred(b))).sort((a, b) => a.id - b.id);
function houseIn(set, min, pred, what) {
  const h = homesOf(set, min, pred)[0];
  if (!h) none(`${set.name} não tem mais uma casa com ${min || 2} adulto(s)${what ? ' ' + what : ''} para o caso (${taken.size} já tomadas pelos casos)`);
  taken.add(h.id); return h;
}
// (a house that can send one of its own by the game's rule: a grown one with no trade, and no hard worker — the wish to shop
// outweighs the work only for such a one, until the house's wait grows past its gap (L-331, fixed in the Patch 2: before it a
// house of tradesmen and hard workers sent nobody ever); in the new metropolis the first house of the town had a weaver and a
// hard-working farmer, and nobody went in 90 s, T-179. Grown is
// 16 or more: under it the child's choice — childDecide — never asks the wish to shop, though the wish counts from 14)
const grown16 = h => adults(h).filter(v => v.age >= 16);
// (and with hands to bring the purchase home: one who lost both arms has no wish to go, L-710)
const canSend = h => grown16(h).some(v => !(v.job || (E.isJobRole && E.isJobRole(v.role))) && !(v.work > 1) && G.Depot.strength(v) > 0);
// (and a house the town does not call away from an errand by its own rules: nobody of it in a voyage — the farewell at the
// quay calls its people (2,4), and the crew to the quay (3,25) — nor a merchant of the caravans — trade.js takes the one who
// has been one first, over any errand under 2. In the metrópole of the generation 18 the first house of Argos had Calista, the
// merchant of nine caravans: the house sent her to the fair, a caravan took her with spices to Mênfis, and then hunger and the
// farewell of the two of the house in a voyage — «nenhuma compra no livro»)
const unbound = h => members(h).every(v => !v.merchant && v.role !== 'mercador' && !(G.Expe && G.Expe.memberOf(v.id)));
// the test's hand on a house: what it keeps taken away (so that it lacks), coins given or taken, the last errand forgotten
function lacking(h, coins) {
  for (const k of Object.keys(E.HOUSE_WANTS)) { const n = D.get('h:' + h.id, k); if (n > 0) D.use('h:' + h.id, k, n, { code: 'teste' }); }
  const c = D.get('h:' + h.id, 'moedas');
  if (coins !== undefined) { if (c < coins) D.make('h:' + h.id, 'moedas', coins - c, { code: 'teste' }); else if (c > coins) D.use('h:' + h.id, 'moedas', c - coins, { code: 'teste' }); }
  h.shopT = undefined; h.shopOut = 0;
}
// the fair of the town with the house's goods on its tables (the supply: the test is about the house, not the seller)
function stockFair(set) {
  const fair = [...S.buildings.values()].find(b => b.set === set.id && b.type === 'feira' && b.built);
  // (enough for the whole town: the other houses buy at the same tables while the test waits for this one)
  if (fair) for (const k of ['tecido', 'ceramica', 'couro']) if (D.get('b:' + fair.id, k) < 20) D.make('b:' + fair.id, k, 20 - D.get('b:' + fair.id, k), { code: 'teste' });
  return fair;
}
// the errand cut by the world before the purchase — a festival, hunger —: the errand is lost, and by the house's rule (GAP)
// it waits half a day to send again; the test's hand lets it send again at once, up to three times (the case is the
// purchase, not the first errand: in the world of L-203 a festival took Meresankh on the way, and hunger took Djoser, T-095).
// again(h, L0).step() each tenth of a second; .why says who was called away, and to what
const boughtBy = (h, L0) => book(e => e[0] > L0 && (e[8] === 'compra' || e[8] === 'venda' || e[8] === 'feira') && /^v:/.test(e[4]) && (S.villagers.get(+e[4].slice(2)) || {}).home === h.id && e[5] !== 'moedas');
function again(h, L0) {
  const r = { why: [], out: null };
  r.step = () => {
    const o = errandOf(h); if (o) { r.out = o; return; }
    const v = r.out; if (!v) return; r.out = null;
    if (members(h).some(q => q.carry && q.carry.bought && q.carry.to === 'h:' + h.id) || boughtBy(h, L0).length || r.why.length >= 3) return;
    r.why.push(`${v.name} chamad${v.g === 'f' ? 'a' : 'o'} para ${v.task ? v.task.type : 'nada'}`); h.shopT = undefined; h.shopOut = 0;
  };
  r.said = () => r.why.length ? ` (antes, ${r.why.join('; ')}: a casa mandou de novo)` : '';
  return r;
}
// a house that lacks, and has room for what it lacks: with the furniture's room (D-053, D-059) a house whose chest is full of
// other things feels no lack and sends nobody — the test's hand takes those away too (in the new metropolis, in the world of
// L-203, the house of c7 had its chest full: an empty list, nobody sent in 90 s; taking the next house instead, after the merge
// of 496dfd3 the town ran out of houses for the cases, T-095)
function houseLacking(set, min, coins, pred, what) {
  const h = houseIn(set, min, pred, what); lacking(h, coins);
  if (!C.list(h).length) { const L = D.list('h:' + h.id); for (const k of Object.keys(L)) if (k !== 'moedas' && L[k] > 0) D.use('h:' + h.id, k, L[k], { code: 'teste' }); }
  return h;
}
// (the town calm: an execution gathers everyone within forty steps of the square, and one called on the way does not get to
// the fair — the same execution took the three sent in c14, after the merge of 496dfd3, T-095)
const GATHER = { justice: 1, assembly: 1, fest: 1, muster: 1, fire: 1 };
const calm = (set, h) => !(S.execs || []).some(e => e.set === set.id && e.phase !== 'done' && (e.phase !== 'wait' || e.start - 22 - S.clock < 150)) && !adults(h).some(o => o.task && GATHER[o.task.type]);
// (the beasts of prey and the ones that turn on whoever hunts them — a rhino, an elephant, a boar — within forty tiles of the
// places given, taken away by the god's hand: the lazer.js's rule, T-356)
const calmBeasts = (...at) => { for (const a of [...S.animals.values()]) { if (a.dead || a.dom || a.tamed) continue; const sp = G.Animals.DEF[a.kind]; if (!sp || !(G.Animals.predator(a.kind) || sp.defend || sp.bold > 0 || a.kind === 'boar' || G.Animals.threat(a))) continue; if (at.some(p => G.dist2(a.x, a.y, p[0], p[1]) < 40 * 40)) G.Animals.remove(a); } };
// (where the case is what is bought, not who goes — the hand of c15: a minute with nobody of the house out for it, nor a
// purchase on its way home, and the test's hand sends one of the house — grown (16 or more, as the world sends), rested and
// fed, hands free, not called to the square, not under the world's hand (a sentence, a storm, anything that does not wait)
// — through the house's own errand door, up to three times. In the old metropolis a storm took the one sent in c8, the execution of two of the house took
// the rest of the day, and the next morning the house tried at 0,06, before any stall or the fair opened, and waited half
// a day (before the L-345); in c9 the builder of the house went from obra to obra and the fisher's work outweighed the wish
// (before the L-331): T-185. Nor the oracle of a cave: by the game's rule the cave calls her up every morning over an errand
// (caves.js, 1,6), and the hand would take her out of it only for the cave to call her back — in c9 the hand sent Neferu,
// the oracle, and eleven seconds later she was going up to the cave again, T-455)
const oracleOf = q => G.Caves.all().some(cv => cv.oracle && cv.oracle.id === q.id);
function hand(h, done) {
  const r = { sent: [], t: S.clock };
  const free = q => !(q.task && (GATHER[q.task.type] || q.task.type === 'shelter' || (q.task.pri || 0) >= 2)) && !(q.carry && q.carry.n > 0) && !oracleOf(q) && G.Depot.strength(q) > 0;
  r.step = () => {
    if (errandOf(h) || done()) { r.t = S.clock; return; }
    if (S.clock - r.t <= 60 || r.sent.length >= 3) return;
    r.t = S.clock;
    const o = grown16(h).filter(free).sort((a, b) => C.urge(b) - C.urge(a) || b.energy - a.energy || a.id - b.id)[0]; if (!o) return;
    o.energy = Math.max(o.energy, 70); o.hunger = Math.min(o.hunger, 30); G.Vg.endTask(o); o.sleeping = false; h.shopT = undefined; h.shopOut = 0;
    if (C.task(o, G.Vg.H)) r.sent.push(o.name);
  };
  r.said = () => r.sent.length ? ` (pela mão do teste, depois de um minuto sem ninguém da casa fora: ${r.sent.join(', ')})` : '';
  return r;
}

// ================================ the world with coin ================================
M.pronto('metropole'); S = G.S; M.viver(2); G.inSim++;
// the town of the cases: coin, a fair, and a house for each case (nine families with two grown people) — the oldest of
// them, the first founded (a rule, not a name: a new ready world finds its own)
const HOUSES = 9;
const hasB = (s, t) => [...S.buildings.values()].some(b => b.set === s.id && b.type === t && b.built);
let set = [...S.settlements.values()].filter(s => E.coinage(s.fac) && hasB(s, 'feira') && homesOf(s, 2).length >= HOUSES).sort((a, b) => (a.founded || 0) - (b.founded || 0) || a.id - b.id)[0];
if (!set) none(`nenhuma cidade com moeda, feira e ${HOUSES} casas de família (dois adultos) na metrópole`);
console.log(`(${set.name}, a mais antiga com moeda, feira e ${HOUSES} casas de família: ${G.Village.pop(set.id)} habitantes; moeda: ${E.coinage(set.fac) ? 'sim' : 'não'})`);
S.time = 0.15;
const fair = stockFair(set);
// ---------------- c1/c2/c5: a house that lacks sends one of its people; the purchase is paid by the house and gets home
{
  const h = houseLacking(set, 2, 30, q => canSend(q) && unbound(q), 'que possa mandar alguém (um adulto sem ofício e não trabalhador), sem ninguém de uma viagem nem mercador das caravanas');
  const L0 = S.ledgerN; const list = C.list(h).map(q => q.k);
  let most = 0; let errand = null;
  const sent = fine(90, () => { const v = errandOf(h); if (v) errand = errand || { v, k: v.task.k, type: v.task.type, n: v.task.n }; let c = 0; for (const o of S.villagers.values()) if (o.task && o.task.casa === h.id) c++; most = Math.max(most, c); return !!errand || watch(); });
  ok('c1 a casa manda um dos seus', sent && errand && errand.v.home === h.id && list.includes(errand.k),
    errand ? `a casa #${h.id} (${h.res} pessoas) sem ${list.slice(0, 3).map(k => E.name(k)).join(', ')}: ${errand.v.name} foi comprar ${errand.n} de ${E.name(errand.k)} (${errand.type === 'compra' ? 'numa banca' : 'na ' + ((S.buildings.get(errand.v.task.id) || {}).type || '?')})` : `ninguém saiu em 90 s (lista: ${list.join(', ')})`);
  // (the purchase — by whoever of the house went: the goods into the hands and the coins out of the house, in the same
  // instant; then home)
  const mine = id => (S.villagers.get(id) || {}).home === h.id;
  const re2 = again(h, L0);
  const home = fine(240, () => { re2.step(); let c = 0; for (const o of S.villagers.values()) if (o.task && o.task.casa === h.id) c++; most = Math.max(most, c); return book(e => e[0] > L0 && e[4] === 'h:' + h.id && e[8] === 'compra-em-casa').length > 0 || watch(); });
  const goods = book(e => e[0] > L0 && (e[8] === 'compra' || e[8] === 'venda') && /^v:/.test(e[4]) && mine(+e[4].slice(2)) && e[5] !== 'moedas')[0];
  const pay = goods && D.ledger().find(e => e[0] === goods[0] + 1);
  const got = book(e => e[0] > L0 && e[4] === 'h:' + h.id && e[8] === 'compra-em-casa')[0];
  ok('c2 a compra paga pela casa chega em casa', home && !!goods && !!pay && pay[3] === 'h:' + h.id && pay[5] === 'moedas' && !!got && !bad().length,
    goods ? `${nm(+goods[4].slice(2))} comprou ${goods[6]} de ${E.name(goods[5])} (${goods[3]}) e a casa pagou ${pay ? pay[6] + ' moedas a ' + pay[4] : '?'} no mesmo instante (livro ${goods[0]} e ${pay ? pay[0] : '?'}); ${got ? `chegou em casa (${got[6]} de ${E.name(got[5])})` : 'NÃO chegou em casa'}${re2.said()}` : `nenhuma compra no livro${re2.said()}`);
  ok('c5 um de cada vez', most === 1, `no máximo ${most} pessoa(s) da casa fazendo as compras dela ao mesmo tempo`);
}
// ---------------- c3: no coin, nobody goes
{
  const h = houseLacking(set, 2, 0);
  const u = adults(h).map(v => C.urge(v));
  // (and kept without a coin all along: a wage that comes in would be a reason to go)
  const went = fine(60, () => { const c = D.get('h:' + h.id, 'moedas'); if (c > 0) D.use('h:' + h.id, 'moedas', c, { code: 'teste' }); return !!errandOf(h) || watch(); });
  ok('c3 sem moeda, ninguém sai', u.every(x => x === 0) && !went, `a casa #${h.id} sem uma moeda e sem ${C.list(h).slice(0, 2).map(q => E.name(q.k)).join(', ')}: vontade de comprar ${u.join(', ')}; ${went ? 'ALGUÉM saiu' : 'ninguém saiu em 60 s'}`);
}
// ---------------- c4: nothing lacking, nobody goes
{
  const h = houseIn(set, 2); lacking(h, 30);
  // (what it lacks put in — up to what its furniture holds, with the interiors' furniture: a full house lacks nothing, D-059)
  for (const q of C.list(h)) D.make('h:' + h.id, q.k, q.n + 1, { code: 'teste', part: true });
  const u = adults(h).map(v => C.urge(v));
  const went = fine(60, () => !!errandOf(h) || watch());
  ok('c4 nada faltando, ninguém sai', !C.list(h).length || (u.every(x => x === 0) && !went), `a casa #${h.id} com tudo o que usa, ou sem lugar para mais (${C.list(h).length} falta(s)): vontade ${u.join(', ')}; ${went ? 'ALGUÉM saiu' : 'ninguém saiu'}`);
}
// ---------------- c6: out of the market's hours, nobody goes
{
  const h = houseLacking(set, 2, 30);
  const t0 = S.time; S.time = 0.85;
  const u = adults(h).map(v => C.urge(v));
  S.time = t0;
  ok('c6 fora das horas do mercado', u.every(x => x === 0), `de noite (0,85), a casa #${h.id} que precisa e pode pagar: vontade ${u.join(', ')}`);
}
// ---------------- c8: the shopper dies with the purchase in the arms: it goes to the house, through the ledger
{
  S.time = 0.15; stockFair(set);
  const h = houseLacking(set, 2, 30); const L0 = S.ledgerN; const re8 = again(h, L0);
  // (the death with the purchase in the arms is the case: the house sends by its own rule, or the hand of c15 does, with the
  // clock held in the fair's hours — T-185)
  const carrier = () => members(h).find(o => o.carry && o.carry.bought && o.carry.to === 'h:' + h.id) || null;
  const hd8 = hand(h, () => !!carrier());
  let v = null; fine(360, atHour(0.3, () => { re8.step(); hd8.step(); v = carrier(); return !!v || watch(); }));
  if (v) {
    const k = v.carry.k, n = v.carry.n, vid = v.id;
    G.Village.kill(v, 'teste');
    const e = book(q => q[0] > L0 && q[3] === 'v:' + vid && q[8] === 'herdado');
    const lost = QA.check().filter(q => /sumiram sem lançamento/.test(q.msg));
    ok('c8 morre com a compra nas mãos', e.length >= 1 && Math.abs(e.reduce((a, q) => a + q[6], 0) - n) < 0.01 && !lost.length, `${v.name} morreu com ${n} de ${E.name(k)} comprados: ${e.map(q => q[6] + ' para ' + q[4]).join(', ') || 'NADA no livro'}${lost.length ? '; o verificador: ' + lost[0].msg : ''}${re8.said()}${hd8.said()}`);
  } else ok('c8 morre com a compra nas mãos', false, `ninguém da casa trouxe uma compra em 360 s${re8.said()}${hd8.said()}`);
}
// ---------------- c12: the god's body is not sent; the house's need is a goal in its diary
{
  const h = houseLacking(set, 2, 30);
  const v = adults(h)[0]; const tk = G.Possess.take(v); M.viver(0.2);
  const u = C.urge(v); const g = (G.Act.diary(v).goals || []).find(q => q.src === 'casa');
  G.Possess.release('deus'); M.viver(0.2);
  ok('c12 o corpo e a casa', tk.ok && u === 0 && !!g, `${v.name} pelo deus: vontade de comprar ${u}; no diário: ${g ? '«' + g.txt + '»' : 'NADA'}`);
}
// ---------------- c13: hands with a purchase on the way home take no errand from outside (a cave, a feast, a theft would put
// their own things in them over it); an urgent call does take the person — and the purchase stays in the hands
{
  const h = houseIn(set, 1); const v = adults(h)[0];
  G.Vg.endTask(v); if (v.carry) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true });
  D.make('v:' + v.id, 'tecido', 2, { code: 'teste', to: 'h:' + h.id, tag: { bought: 1 } }); // (a purchase in the arms, marked for the house)
  G.Vg.setTask(v, { type: 'carga', to: 'h:' + h.id, pri: 0.5, st: 0 });
  const feast = G.Vg.give(v, { type: 'celebrate', pri: 1.1, kind: 'celebrate' });
  const cave = G.Vg.give(v, { type: 'caverna', kind: 'explore', pri: 1.6 });
  const keptTask = v.task && v.task.type === 'carga';
  const urgent = G.Vg.give(v, { type: 'dragao', id: 0, pri: 4.5, st: 0, kind: 'dragao' });
  const held = !!(v.carry && v.carry.k === 'tecido' && v.carry.to === 'h:' + h.id);
  G.Vg.endTask(v);
  ok('c13 as mãos ocupadas com uma compra', !feast && !cave && keptTask && urgent && held && !bad().length,
    `${v.name} levando 2 de tecido para casa: a festa ${feast ? 'LEVOU' : 'esperou'}, a caverna ${cave ? 'LEVOU' : 'esperou'} (a tarefa ${keptTask ? 'continuou a de levar' : 'MUDOU'}); um chamado urgente (o dragão) ${urgent ? 'levou' : 'NÃO levou'} — e a compra ${held ? 'continua nas mãos, marcada para casa' : 'SUMIU das mãos'}`);
}
// ---------------- c14/c15/c16: the room of the house (D-059). With the interiors' furniture a house keeps what its pieces
// hold (D-053): a full house does not buy; one with little room buys only what fits; what was paid is never lost — what the
// furniture has no room for when it gets home (the room taken meanwhile) lies on the floor, the house's, never in the
// people's store. The furniture is the test's own plan for this house (the shape G.Interiors.depotStores gives, as in
// negocio n16): one chest that takes anything, the other buildings as the game has them. The chest's size follows the case:
// as full as the house («cheia»: the family eats from the pantry meanwhile, and stays full), room for one more thing
// («um»), or fixed at the moment the purchase is on its way («fixa»)
{
  S.time = 0.15; stockFair(set);
  const h = houseIn(set, 2); lacking(h, 30); const H = 'h:' + h.id;
  // (something in the chest: a chest of nothing is no plan — the depot leaves out a piece of no room, and a house without its
  // pieces has the room of before the furniture, D-053. Something the family does not use up: the 2 of food of before were
  // eaten from the pantry in the Argos of the generation 16, the chest followed the house down to «0 de 0», and with no plan
  // the one sent to the fair bought cloth there, 1,6 coins out of the house)
  if (D.get(H, 'ferramentas') < 1) D.make(H, 'ferramentas', 1, { code: 'teste' });
  const held = () => Object.entries(D.list(H)).filter(([k]) => k !== 'moedas').reduce((a, [, n]) => a + n, 0);
  const was = D.stores; let mode = 'cheia', cap = 0;
  const capNow = () => (mode === 'cheia' ? held() : mode === 'um' ? held() + 1 : cap);
  D.stores = b => (b && b.id === h.id ? [{ id: h.id + ':arca', kind: 'arca', keys: '*', cap: capNow(), dep: 'casa', sale: null }] : was ? was(b) : null);
  // (the house's errand of before, if one of it was out for it, let go — the test's hand, as lacking() forgets the mark —, and
  // what its people carry home put away first, with the chest already full — on the floor —: the case starts with nothing on
  // the way; and once more after it, for an errand that started while it waited)
  const letGo = () => { for (const o of S.villagers.values()) if (o.task && o.task.casa === h.id) G.Vg.endTask(o); h.shopOut = 0; };
  letGo(); fine(60, () => !members(h).some(o => o.carry && o.carry.to === H) || watch()); letGo();
  // c14: the chest full — no room for one more thing: nobody goes; one sent to the fair's table all the same (a stroll's
  // whim) finds no room at home and buys nothing
  S.time = 0.15;
  const u = adults(h).map(v => C.urge(v)); const L14 = C.list(h).length;
  const went = fine(60, atHour(0.15, () => !!errandOf(h) || watch())); const goer = errandOf(h);
  // (the one sent: hands free, rested and fed — a tired one would go to bed on the way —, brought to the fair — the deal is
  // the subject, not the walk across town —, in the morning: the test's hand, as negocio's buyers)
  // (one the square calls away before the fair — an execution, an assembly — gives it to another of the house, up to three,
  // each sent with the town calm: in the world of the later fixes an execution in Argos took Irene on the way, T-095)
  const L0 = S.ledgerN; const c0 = D.get(H, 'moedas'); const tried14 = [], away14 = []; let v14 = null, t14 = null; const said = [];
  const say0 = G.Falas.say; G.Falas.say = function (o, key) { const t = say0.apply(this, arguments); if (o && v14 && o.id === v14.id) said.push(key); return t; };
  for (let a = 0; a < 3; a++) {
    fine(240, atHour(0.2, () => calm(set, h) || watch()));
    // (and hands that lift the purchase: in the Argos of the generation 15 the one sent was Teodora, who lost both arms — the
    // fair's table took her back at the arms, before the house's room was asked, and she said nothing, T-528)
    const lifts14 = o => G.Depot.strength(o) >= G.Depot.weight('tecido', 1);
    v14 = adults(h).filter(o => !tried14.includes(o.id) && lifts14(o) && !(o.carry && o.carry.n > 0)).sort((x, y) => y.energy - x.energy || x.id - y.id)[0] || adults(h).filter(o => !tried14.includes(o.id) && lifts14(o))[0] || null;
    if (!v14) break; tried14.push(v14.id);
    v14.energy = Math.max(v14.energy, 70); v14.hunger = Math.min(v14.hunger, 30);
    if (v14.carry && v14.carry.n > 0) D.use('v:' + v14.id, v14.carry.k, v14.carry.n, { code: 'teste', mine: true });
    if (fair) { const [fx, fy] = G.Village.frontTile(fair); if (G.W.walkableXY(fx, fy)) { v14.x = fx; v14.y = fy; v14.path = null; } }
    G.Vg.endTask(v14); t14 = fair ? G.Vg.setTask(v14, { type: 'shop', id: fair.id, k: 'tecido', pri: 1.3 }) : null;
    fine(150, atHour(0.2, () => !(v14.task && v14.task === t14) || watch()));
    if (!fair || said.includes('casa_cheia') || !(v14.task && GATHER[v14.task.type])) break;
    away14.push(`${v14.name} chamad${v14.g === 'f' ? 'a' : 'o'} para ${v14.task.type}`);
  }
  G.Falas.say = say0;
  const bought14 = book(e => e[0] > L0 && tried14.some(id => e[4] === 'v:' + id) && (e[8] === 'compra' || e[8] === 'feira')).length;
  // (the house's coins: none out of it in the case — nothing paid —, and the balance as the book says it: what came in meanwhile
  // is the world's — in the Argos of the generation 14 the elder's wage of Clio, of the house, 0,42 from the treasury in the
  // case's hour —, T-483)
  const lines14 = book(e => e[0] > L0 && e[5] === 'moedas' && (e[3] === H || e[4] === H));
  const out14 = r2(lines14.filter(e => e[3] === H).reduce((a, e) => a + e[6], 0)), in14 = r2(lines14.filter(e => e[4] === H).reduce((a, e) => a + e[6], 0));
  const coins14 = out14 === 0 && Math.abs(D.get(H, 'moedas') - c0 - in14) < 1e-6;
  const inSaid = in14 ? ` (+${in14} que entraram pelo livro: ${[...new Set(lines14.filter(e => e[4] === H).map(e => e[8]))].join(', ')})` : '';
  ok('c14 a casa cheia não compra', L14 === 0 && u.every(x => x === 0) && !went && !!v14 && !bought14 && (!fair || said.includes('casa_cheia')) && coins14 && !bad().length,
    `a casa #${h.id} com a arca cheia (${r2(held())} de ${r2(capNow())}): ${L14} falta(s), vontade ${u.join(', ')}; ${went ? `ALGUÉM saiu (${goer ? goer.name + ', ' + goer.task.type + (goer.home !== h.id ? ', de outra casa' : '') : '?'})` : 'ninguém saiu em 60 s'}; ${v14 ? `${v14.name}, mandado à feira por tecido, ${bought14 ? 'COMPROU' : 'não comprou'} (falas: ${said.join(', ') || 'nenhuma'}${t14 && v14.task === t14 ? '' : `; agora ${v14.task ? v14.task.type : 'sem tarefa'}`}; moedas da casa ${r2(c0)} → ${r2(D.get(H, 'moedas'))}${inSaid}${out14 ? `, ${out14} SAÍRAM DELA` : ''}${coins14 || out14 ? '' : ', FORA DO LIVRO'})` : 'ninguém da casa para mandar'}${away14.length ? ` (antes: ${away14.join('; ')})` : ''}`);
  // c15: room for one thing — the house sends for what it lacks, and buys only what fits (the fair's tables stocked again —
  // the town bought from them while the case waited —, and the clock held in the market's hours: a gathering at the square,
  // an execution, may take the house's people first, as it took them in the doors' world)
  mode = 'um'; h.shopT = undefined; h.shopOut = 0; S.time = 0.15; stockFair(set);
  // (and the house's grown people rested and fed, up from a bed the clock held in the morning gave no night to — the test's
  // hand: in the world of the later fixes the whole house slept through the case, with 10 of energy, T-095)
  for (const o of adults(h)) { o.energy = Math.max(o.energy, 70); o.hunger = Math.min(o.hunger, 30); if (o.task && o.task.type === 'sleep') G.Vg.endTask(o); o.sleeping = false; }
  // (a purchase of the minutes before, still on its way home, put away first — it is not this case's: in the world of the
  // later fixes the house had bought during c14, and its carrier ended the wait at the first step)
  fine(60, atHour(0.3, () => !members(h).some(o => o.carry && o.carry.to === H) || watch()));
  const lack15 = C.list(h).map(q => `${q.n} de ${E.name(q.k)}`); const L1 = S.ledgerN;
  let carrier = null; const sent15 = []; let tLast = S.clock;
  const bought15 = () => book(e => e[0] > L1 && (e[8] === 'compra' || e[8] === 'venda' || e[8] === 'feira') && /^v:/.test(e[4]) && (S.villagers.get(+e[4].slice(2)) || {}).home === h.id && e[5] !== 'moedas')[0];
  // (a minute with nobody of the house out for it, nor a purchase on its way: the test's hand sends one of the house, rested
  // and fed, not called to the square, through the house's own errand door — up to three times. The choice weighs the wish to
  // shop, 0,41 there, against the day's work, 0,55; and in the world of L-203 a storm, then an execution, took the one sent,
  // and the house went to bed with the clock held in the morning; the case is what is bought, not who goes, T-095)
  fine(360, atHour(0.3, () => {
    const b15 = !carrier && bought15(); const o15 = b15 && S.villagers.get(+b15[4].slice(2));
    if (o15 && o15.carry && o15.carry.bought && o15.carry.to === H) carrier = o15;
    if (errandOf(h)) tLast = S.clock;
    if (!carrier && !b15 && !errandOf(h) && S.clock - tLast > 60 && sent15.length < 3) {
      const o = adults(h).filter(q => !(q.task && GATHER[q.task.type]) && !(q.carry && q.carry.n > 0)).sort((a, b) => C.urge(b) - C.urge(a) || b.energy - a.energy || a.id - b.id)[0];
      if (o) { o.energy = Math.max(o.energy, 70); o.hunger = Math.min(o.hunger, 30); G.Vg.endTask(o); o.sleeping = false; h.shopT = undefined; h.shopOut = 0; if (C.task(o, G.Vg.H)) sent15.push(o.name); }
      tLast = S.clock;
    }
    return !!carrier || watch();
  }));
  const sent = sent15.join(', ');
  const buy = book(e => e[0] > L1 && (e[8] === 'compra' || e[8] === 'venda' || e[8] === 'feira') && /^v:/.test(e[4]) && (S.villagers.get(+e[4].slice(2)) || {}).home === h.id && e[5] !== 'moedas')[0];
  ok('c15 com pouco lugar, compra só o que cabe', !!carrier && !!buy && buy[6] <= 1 + 1e-6 && !bad().length,
    buy ? `a casa #${h.id} com lugar para 1 (faltava ${lack15.join(', ')}): ${nm(+buy[4].slice(2))} comprou ${buy[6]} de ${E.name(buy[5])}${sent ? ` (pela mão do teste, depois de um minuto sem ninguém da casa fora: ${sent})` : ''}` : `ninguém da casa comprou em 360 s (faltava ${lack15.join(', ') || 'nada'}${sent ? `; pela mão do teste: ${sent}` : ''})`);
  // c16: the room taken while the purchase is on its way (the chest fixed as full as the house is now) — at home, what does
  // not fit in it lies on the floor: the house's, with its line in the ledger, never in the people's store (the family may
  // eat from the pantry meanwhile: what lies on the floor is what the chest does not hold when it gets there)
  if (carrier) {
    const k = carrier.carry.k, n = carrier.carry.n; const L2 = S.ledgerN;
    mode = 'fixa'; cap = held(); const room0 = D.room(H, k);
    // (and it stays as full as the house until the purchase is home: what the family eats from the house on the way is room
    // the test's hand takes again — the case is a purchase that does not fit. In the P2's final tree the family ate 1 of food
    // while Cassandra walked 38 tiles home with 1 of cloth, and the cloth fitted in the chest: nothing on the floor, T-289)
    const arrived = () => book(e => e[0] > L2 && e[3] === 'v:' + carrier.id && e[5] === k).length > 0;
    const home = fine(240, () => { if (arrived()) return true; cap = Math.min(cap, held()); return watch(); });
    const lines = book(e => e[0] > L2 && e[3] === 'v:' + carrier.id && e[5] === k);
    const inHouse = lines.filter(e => e[4] === H && e[8] === 'compra-em-casa').reduce((a, e) => a + e[6], 0);
    const toStore = lines.filter(e => e[4][0] === 'f');
    // (the floor: what the chest does not hold — the goods are put away in their order, so the pile is what comes last)
    const pile = D.slots(H).filter(q => q.m === 0); const floor = pile.reduce((a, q) => a + q.n, 0); const over = held() - cap;
    ok('c16 nada pago se perde', home && room0 < 1e-6 && Math.abs(inHouse - n) < 1e-6 && !toStore.length && floor > 1e-6 && Math.abs(floor - over) < 1e-4 && !bad().length,
      `${carrier.name} levava ${n} de ${E.name(k)}; a arca cheia no caminho (lugar ${r2(room0)}): ${home ? `chegou em casa ${r2(inHouse)}; no chão, ${pile.map(q => `${r2(q.n)} de ${E.name(q.k)}`).join(', ') || 'nada'} (a casa com ${r2(over)} além da arca)` : 'NÃO chegou em casa'}${toStore.length ? `; ${toStore.length} lançamento(s) ao ESTOQUE DO POVO` : '; nada ao estoque do povo'}`);
  } else ok('c16 nada pago se perde', false, 'sem compra a caminho de casa (o c15 não comprou)');
  D.stores = was;
}
// ---------------- c17: the house's water and the house's errand (L-203) — the morning's water gone while the only one of the
// house awake is on the way to buy: the jar waits for the purchase to get home, and the errand is not lost (before, the well
// took the shopper in the first seconds, the errand was lost and the house waited half a day — in the new world «cidade» the
// house of c9 bought nothing in its 240 s: each morning the first one up was sent to shop, and the water took them)
{
  // (a house the world puts under works in the middle — a sobrado made an insula, a house a sobrado — keeps no jar while the
  // works last (life.js counts the water of a house standing): the case is a jar that waits, so another house, up to three.
  // With the final worlds on the 5405a1b the city began an insula over Creonte's sobrado a few seconds after the purchase got
  // home, and the water stood still at 0,04 the 266 s that were left, T-221)
  const works17 = [];
  for (let a = 0; a < 3; a++) {
  S.time = 0.15; stockFair(set);
  const h = houseLacking(set, 1, 30); const H17 = 'h:' + h.id;
  const v = adults(h).sort((a, b) => b.energy - a.energy || a.id - b.id)[0];
  // (the others of the house asleep — a night of watch —: the one sent is the only one the water could take)
  for (const o of members(h)) if (o !== v) { o.energy = Math.min(o.energy, 5); o.hunger = Math.min(o.hunger, 20); G.Vg.setTask(o, { type: 'sleep', pri: 1.5, kind: 'sleep' }); }
  v.energy = Math.max(v.energy, 70); v.hunger = Math.min(v.hunger, 30);
  if (v.carry && v.carry.n > 0) D.use('v:' + v.id, v.carry.k, v.carry.n, { code: 'teste', mine: true });
  G.Vg.endTask(v); const t17 = C.task(v, G.Vg.H);
  h.water = 0.2; h.waterTry = undefined;
  // (the water given while the errand is on — the bug itself, seen at the door that gives it —; an errand that ends on its
  // own, nothing bought — no seller at the stall, the line too long —, is given again, up to three times: in the new
  // metropolis, after the merge of 496dfd3, Tauret's stall had nobody at it, and the water took her afterwards, rightly)
  const L0 = S.ledgerN, c0 = S.clock; let took = 0, home = 0, by = null, prev = true, inWorks = 0; const again17 = [];
  const give0 = G.Vg.setTask; G.Vg.setTask = function (o, t) { if (o === v && t && t.type === 'water' && o.task && o.task.casa && !took) took = S.clock - c0 || 0.01; return give0.apply(this, arguments); };
  // (the beasts that come at people kept away by the god's hand round the house, the place of the purchase and the one sent,
  // while the case is on — the beasts of prey and the ones that turn on whoever hunts them —, as the lazer.js keeps them from
  // the stage (T-356): in the Argos of the generation 16 a rhino was hunted by the fair, and the fight took Zoé from her
  // errand there, three times, and then the hunt and the field — the purchase never came)
  const shop17 = t17 && S.buildings.get(t17.id);
  const calm17 = () => calmBeasts([v.x, v.y], [h.x + 0.5, h.y + 0.5], ...(shop17 ? [[shop17.x + 0.5, shop17.y + 0.5]] : []));
  fine(300, atHour(0.3, () => {
    calm17();
    if (!h.built) { inWorks = S.clock - c0 || 0.01; return true; }
    if (!home && book(e => e[0] > L0 && e[4] === H17 && e[8] === 'compra-em-casa').length) home = S.clock - c0;
    const on = !!(v.task && v.task.casa);
    if (!home && !took && prev && !on && !(v.carry && v.carry.bought) && again17.length < 3) {
      again17.push(v.task ? v.task.type : 'nada'); G.Vg.endTask(v); h.shopT = undefined; h.shopOut = 0; h.water = Math.min(G.Life.homeWater(h), 0.2); h.waterTry = undefined;
      C.task(v, G.Vg.H);
    }
    prev = !!(v.task && v.task.casa);
    if (home && !by) by = members(h).find(o => o.task && o.task.type === 'water') || null;
    return !!took || (home && h.water > 0.9) || watch();
  }));
  G.Vg.setTask = give0;
  if (inWorks && a < 2) { works17.push(`a casa #${h.id} de ${v.name} entrou em obra (${G.BDEF[h.type] ? G.BDEF[h.type].name : h.type}) aos ${Math.round(inWorks)} s`); continue; }
  const where = !t17 ? '' : t17.type === 'compra' ? 'a uma banca' : ({ feira: 'à feira', mercado: 'ao mercado', mercado_negro: 'ao mercado negro' })[(S.buildings.get(t17.id) || {}).type] || 'às compras';
  const before17 = works17.length ? ` (antes: ${works17.join('; ')})` : '';
  ok('c17 a água espera a volta das compras', !!t17 && !took && !inWorks && !!home && h.water > 0.9 && !bad().length,
    t17 ? `${v.name}, mandad${v.g === 'f' ? 'a' : 'o'} ${where} por ${t17.n} de ${E.name(t17.k)} com a água da casa em 0,2 e o resto da casa dormindo: ${took ? `a água A TIROU das compras aos ${Math.round(took)} s` : 'a água esperou'}; ${home ? `a compra chegou em casa aos ${Math.round(home)} s` : 'a compra NÃO chegou em casa'}; ${inWorks ? `a casa entrou em OBRA aos ${Math.round(inWorks)} s` : h.water > 0.9 ? `depois, ${by ? by.name : 'alguém'} buscou a água` : 'a água NÃO foi buscada'}${again17.length ? ` (antes, o recado acabou sozinho, sem compra, ${again17.length} vez(es): mandad${v.g === 'f' ? 'a' : 'o'} de novo)` : ''}${before17}`
      : `${v.name} não foi mandado às compras (lista ${C.list(h).map(q => q.k).join(', ') || 'vazia'})${before17}`);
  break;
  }
}
// ---------------- c18: the freest of the house has no arms: no wish to go, the house's try unspent, another of it goes (L-710)
{
  S.time = 0.15;
  const t18 = [set].concat([...S.settlements.values()].filter(s => s !== set && E.coinage(s.fac) && hasB(s, 'feira')).sort((a, b) => (a.founded || 0) - (b.founded || 0) || a.id - b.id)).find(s => homesOf(s, 2, q => canSend(q) && grown16(q).filter(o => G.Depot.strength(o) > 0).length >= 2).length) || set;
  stockFair(t18);
  const h = houseLacking(t18, 2, 30, q => canSend(q) && grown16(q).filter(o => G.Depot.strength(o) > 0).length >= 2, 'com dois adultos de braços inteiros, um deles sem ofício');
  // (the one the house would send — grown, no trade, no hard worker — loses both arms by the test's hand)
  const one = grown16(h).filter(v => !(v.job || (E.isJobRole && E.isJobRole(v.role))) && !(v.work > 1) && G.Depot.strength(v) > 0).sort((a, b) => a.id - b.id)[0];
  // (nobody of the house out for it as the case begins: in the metrópole of the Bairros Vivos the house had sent Cassandra to
  // the fair that very morning, the hand took her arms on the way, and she kept the errand she already had — «Cassandra foi
  // comprar», T-698)
  for (let o = errandOf(h); o; o = errandOf(h)) G.Vg.endTask(o);
  h.shopOut = 0; h.shopT = undefined;
  const lost0 = one.lost; one.lost = { armL: true, armR: true };
  const u0 = C.urge(one), uOthers = grown16(h).filter(o => o !== one).map(o => C.urge(o));
  let hers = 0; const task18 = C.task; C.task = function (o) { if (o && o.id === one.id) hers++; return task18.apply(this, arguments); };
  const try0 = h.shopT; const hd18 = hand(h, () => false); let errand = null, hadIt = false;
  const sent = fine(150, atHour(0.3, () => { hd18.step(); if (one.task && one.task.casa === h.id) hadIt = true; const v = errandOf(h); if (v) errand = errand || v; return !!errand || watch(); }));
  C.task = task18;
  // (and the errand's door itself turns her back with the house's try unspent — whoever calls it)
  const tryA = h.shopT; const door = C.task(one, G.Vg.H); const turned = door === null && h.shopT === tryA && !(one.task && one.task.casa === h.id);
  ok('c18 quem perdeu os braços não vai às compras: outro da casa vai', u0 === 0 && uOthers.some(u => u > 0) && hers === 0 && !hadIt && sent && !!errand && errand.id !== one.id && turned && !bad().length,
    `${t18.id !== set.id ? `(em ${t18.name}) ` : ''}a casa #${h.id}: ${one.name}, sem ofício e sem os dois braços, vontade de ir ${u0.toFixed(2)} (os outros: ${uOthers.map(u => u.toFixed(2)).join(', ')}); a porta do recado chamada por ela ${hers} vez(es); ${errand ? `${errand.name} foi comprar` : 'NINGUÉM foi em 150 s'}${hd18.said()}; a porta do recado, chamada para ela, ${turned ? 'a devolve sem gastar a tentativa da casa' : 'GASTA a tentativa da casa'}`);
  void try0;
  one.lost = lost0;
}

// ---------------- c7: a save in the middle of the errand: the errand lost does not hold the house; it buys again, one at a time
{
  S.time = 0.15;
  // (a house that can send one of its own right after an errand, as the c1's since T-179: then the house's wait has not grown
  // yet — L-331 —, and the wish of one with a trade, 0,41, is under the day's work, 0,55. In the P2's branch joined with
  // 4b713db the house of the case had a potter and a fair-keeper, and nobody went in the 120 s after the load, T-290. In the
  // cases' town, or — the cases before it took its last such house — in the next town of coin with a fair, the oldest first,
  // as the casa's couples (T-456): the errand and the save are the same in any town of coin; in the metrópole of the
  // generation 14 the nine cases before took the last house of Argos with a grown one free to send, T-483)
  const t7 = [set].concat([...S.settlements.values()].filter(s => s !== set && E.coinage(s.fac) && hasB(s, 'feira')).sort((a, b) => (a.founded || 0) - (b.founded || 0) || a.id - b.id)).find(s => homesOf(s, 2, canSend).length) || set;
  stockFair(t7);
  const h = houseLacking(t7, 2, 30, canSend, 'que possa mandar alguém logo depois de um recado (um adulto sem ofício e não trabalhador)'); const hid = h.id;
  // (the errand out at the save is the case's premise: the house sends by its own rule, or the hand of c15 does, with the
  // clock held in the fair's hours — in the old metropolis on the tip of L-349 the house of c7 sent nobody in 90 s, before
  // the L-331, T-185 —; after the load, the house sends again by its own rule: that is the case)
  const hd7 = hand(h, () => false);
  const sent = fine(90, atHour(0.3, () => { hd7.step(); return !!errandOf(h) || watch(); }));
  const str = G.Save.serialize(); if (G.UI && G.UI.select) G.UI.select(null); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game';
  S = G.S; set = S.settlements.get(set.id); const h2 = S.buildings.get(hid);
  h2.shopT = undefined; // (the test's hand: the house may send again at once)
  let most = 0; const L0 = S.ledgerN;
  // (the errands the house gives after the load at its own door — C.task, from the decide —, and one the world takes from the
  // one sent in the very step it was given: then the house waits half a day by its rule (GAP), and the test's hand lets it send
  // again at once, up to three times, told in the case, as again() does for an errand lost on the way (T-095); the clock held
  // in the fair's hours, as before the save (T-185). In the metropole of the generation 16 the house of the case, in Mênfis,
  // sent Tiye, a warrior, after the load, and the raid of her people on the bandits of a cave (3,1) took her in that same step:
  // «depois do load a casa NÃO mandou de novo»)
  const gave7 = [], lost7 = []; const task7 = C.task;
  C.task = function (o) { const t = task7.apply(this, arguments); if (t && o && o.home === hid) gave7.push(o); return t; };
  const again = fine(120, atHour(0.3, () => {
    let c = 0; for (const o of S.villagers.values()) if (o.task && o.task.casa === hid) c++; most = Math.max(most, c);
    if (c > 0) return true;
    const o = gave7.shift(); if (o && lost7.length < 3) { lost7.push(`${o.name} chamad${o.g === 'f' ? 'a' : 'o'} para ${o.task ? o.task.type : 'nada'}`); h2.shopT = undefined; h2.shopOut = 0; }
    return watch();
  }));
  C.task = task7;
  ok('c7 save no meio do recado', sent && again && most === 1 && !bad().length, `${t7.id !== set.id ? `(em ${t7.name}: ${set.name} não tem mais uma casa que possa mandar alguém) ` : ''}${sent ? 'o recado saiu' : 'o recado NÃO saiu'} antes do save${hd7.said()}; depois do load ${again ? 'a casa mandou de novo' : 'a casa NÃO mandou de novo'} (no máximo ${most} ao mesmo tempo)${lost7.length ? ` (antes, o mundo tirou o recado de quem foi: ${lost7.join('; ')} — a casa mandou de novo)` : ''}`);
  void L0;
}
// ---------------- c10: the skip — the houses buy in the skip too
{
  M.pronto('metropole'); S = G.S; S.time = 0.1;
  let n = 0; const f = e => { if ((e[8] === 'venda' && e[3][0] === 'z') || ((e[8] === 'compra' || e[8] === 'feira') && e[3][0] === 'b')) n++; };
  D.onMove.push(f); M.saltar(1); D.onMove.splice(D.onMove.indexOf(f), 1);
  ok('c10 no salto também', n >= 10 && !bad().length, `um dia pelo salto: ${n} compras das casas (bancas, feira, prateleiras)`);
}
// ---------------- c11: the volume of a day by the step (before Etapa 4: none in the day that starts at 0.10)
// (at least ten, as the skip's c10: what the case says is that the day has purchases, and that they get home — 20 was the
// old metropolis' own day, 25; the new one's day makes 18, all of them home: T-095)
{
  M.pronto('metropole'); S = G.S; S.time = 0.1; G.inSim = Math.max(G.inSim, 1);
  let n = 0, home = 0; const f = e => { if ((e[8] === 'venda' && e[3][0] === 'z') || ((e[8] === 'compra' || e[8] === 'feira') && e[3][0] === 'b')) n++; if (e[8] === 'compra-em-casa') home++; };
  D.onMove.push(f); const d0 = S.day; while (S.day - d0 < 1) G.debug.step(0.1); D.onMove.splice(D.onMove.indexOf(f), 1);
  ok('c11 o volume de um dia', n >= 10 && home >= n * 0.7 && !bad().length, `um dia da metrópole desde as 0,10: ${n} compras das casas, ${home} chegaram em casa (antes: 0)`);
}

// ================================ a people without coin ================================
{
  // (a world with a people without coin: the «cidade», or, with none there — its four peoples knew the coin by day 16 in the
  // generation 15, and c9 found «nenhuma cidade sem moeda com feira ou mercado» —, a new world by the game's own door, its
  // peoples born without it and held so: M.semMoeda, D-143; its fair by the god's hand below, T-526)
  const W9 = M.semMoeda('cidade'); S = G.S; G.inSim = Math.max(G.inSim, 1); S.time = 0.15;
  // (the case's premise in any course of the dice, as the lazer.js keeps the afternoon of a show — T-455: the god's peace over
  // the world (G.Politics.divinePeace: the wars in truce, the bands gone home) and the alarm of an attack over with it; the
  // weather calm while the case lasts (a storm sends everyone home, 1,05, over the errand); the town's feast of the day kept
  // for another day by the god's hand (festivals.js, the plan of the day, as the feira.js and the lar.js keep it: the feast
  // calls the whole town, 3,2); and the house of the case one no cave's oracle lives in — by the game's rule the cave calls
  // her up every morning, until noon, over an errand of her house (caves.js, 1,6), and the clock held at 0,30 keeps it
  // morning. Since 4895ac9 the first house of Mênfis was Neferu's, the oracle: the Feast of Opet took her at 0,18 on her way
  // to the fair, the cave called her back after the hand sent her, and a storm took home the next two sent — nothing bought)
  G.Politics.divinePeace(); for (const s of S.settlements.values()) if (s.alarmT > 0) s.alarmT = 0;
  const calm9 = () => { S.weather.rain = 0; if (S.weather.storm) S.weather.storm = 0; };
  // (the biggest town without coin, with a place that sells and a family house — two grown people, no oracle — for the case)
  const family = s => [...S.buildings.values()].filter(b => b.set === s.id && b.built && G.BDEF[b.type].housing && (b.res || 0) >= 2 && [...S.villagers.values()].filter(v => v.home === b.id && v.age >= 14).length >= 2 && !members(b).some(oracleOf)).sort((a, b) => a.id - b.id);
  // (a place that sells: a fair — its tables give to a people without coin, with its keeper at them or not (economy.js,
  // runShop) — or a market with a merchant of its own: a market nobody opens a stall at sells nothing — Roma, of the world
  // without coin of the generation 16, had one with no merchant, its house felt no wish to buy and the hand sent nobody,
  // «NÃO comprou» —, and the god's fair below goes where no town has a place that sells)
  const sells = s => [...S.buildings.values()].some(b => b.set === s.id && b.built && (b.type === 'feira' || (b.type === 'mercado' && [...S.villagers.values()].some(v => v.job === b.id && v.role === 'mercador'))));
  const byPop9 = (a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id;
  let tw = [...S.settlements.values()].filter(s => !E.coinage(s.fac) && sells(s) && family(s).length).sort(byPop9)[0], byGod = false;
  // (none with a place that sells — a new world's first huts have neither, and a market may stand with no merchant —: the
  // god's hand puts a fair where the town's own planner would, in the biggest town without coin with a family house, as
  // negocio's market for the exchange (T-184))
  if (!tw) for (const s of [...S.settlements.values()].filter(o => !E.coinage(o.fac) && family(o).length).sort(byPop9)) { const pos = G.Village.findSite(s, 'feira'); if (!pos || pos.demolish) continue; G.Village.addBuilding('feira', pos[0], pos[1], s.id, true); tw = s; byGod = true; break; }
  let info = `nenhuma cidade sem moeda com feira ou mercado com mercador e uma casa de família (dois adultos, nenhum deles o oráculo de uma caverna)${W9.novo ? ' no mundo novo' : ' no mundo «cidade»'}`, fine9 = false;
  if (tw) {
    tw.festPlan = { day: S.day, key: null, done: true }; calm9();
    // (and the people of the case without coin while it lasts — held by M.semMoeda, on the world's door of the arts (T-098):
    // the arts spread between peoples that trade or live in peace, by chance, every thirty seconds (civs.js), and in a course
    // of the T-455 the Casa de Amon learned the coin from the Aztecs, at peace with it, 27 s into the case — the house had no
    // coin to pay with, and nobody of it went again)
    stockFair(tw);
    const h = family(tw)[0];
    lacking(h); if ((h.pantry || 0) < 12) D.make('h:' + h.id, 'food', 12, { code: 'teste' });
    const L0 = S.ledgerN;
    // (the purchase in kind is the case: the house sends by its own rule, or the hand of c15 does, with the clock held in
    // the fair's hours — T-185)
    const home9 = () => book(e => e[0] > L0 && e[4] === 'h:' + h.id && e[8] === 'compra-em-casa').length > 0;
    const hd9 = hand(h, () => home9() || members(h).some(o => o.carry && o.carry.bought && o.carry.to === 'h:' + h.id));
    const got = fine(240, atHour(0.3, () => { calm9(); hd9.step(); return home9() || watch(); }));
    const buy = book(e => e[0] > L0 && (e[8] === 'venda' || e[8] === 'feira') && e[5] !== 'food' && /^v:/.test(e[4]) && (S.villagers.get(+e[4].slice(2)) || {}).home === h.id)[0];
    const paid = buy && buy[8] === 'venda' ? D.ledger().find(e => e[0] === buy[0] + 1) : null;
    fine9 = got && !!buy && !bad().length;
    info = `${tw.name} (sem moeda${W9.novo ? ', num mundo novo' : ''}${byGod ? ', a feira posta pelo deus' : ''}): ${buy ? `a casa #${h.id} levou ${buy[6]} de ${E.name(buy[5])} ${buy[8] === 'feira' ? 'da feira do povo (sem moeda, a feira dá)' : `de uma banca, pagando ${paid ? paid[6] + ' de ' + E.name(paid[5]) : '?'}`}` : 'NÃO comprou'}; ${got ? 'chegou em casa' : 'NÃO chegou em casa'}${hd9.said()}`;
  }
  W9.solta();
  ok('c9 um povo sem moeda', fine9, info);
}

const e = M.erros();
if (others.size) console.log(`   (o verificador, em outros sistemas, durante o cenário: ${[...others.keys()].slice(0, 6).join(' · ')}${others.size > 6 ? ` · e mais ${others.size - 6}` : ''})`);
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `COMPRAS: FALHOU (${fails.join(', ')})` : 'COMPRAS: ok');
process.exit(fails.length ? 1 : 0);
