// compras: as compras da casa provocadas de propósito (C1) — a família que precisa vai comprar, pela moeda da casa, no
// mundo pronto «metrópole» (a cidade mais antiga com moeda, feira e casas de família para os casos — hoje, Argos) e no
// «cidade» (um povo sem moeda). Sem uma cidade que sirva, falha dizendo o que falta.   node qa/compras.js   (em Node)
// c1 a casa que precisa manda um dos seus; c2 a compra paga pela casa (no livro-razão) chega em casa; c3 sem moeda,
// ninguém sai; c4 nada faltando, ninguém sai; c5 um de cada vez; c6 fora das horas do mercado, ninguém sai; c7 save no
// meio do recado: o recado perdido não prende a casa, e ela compra de novo, um de cada vez; c8 quem compra morre com a
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
const homesOf = (set, min) => [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type].housing && (b.res || 0) >= 2 && !taken.has(b.id) && adults(b).length >= (min || 2)).sort((a, b) => a.id - b.id);
function houseIn(set, min) {
  const h = homesOf(set, min)[0];
  if (!h) none(`${set.name} não tem mais uma casa com ${min || 2} adulto(s) para o caso (${taken.size} já tomadas pelos casos)`);
  taken.add(h.id); return h;
}
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
function houseLacking(set, min, coins) {
  const h = houseIn(set, min); lacking(h, coins);
  if (!C.list(h).length) { const L = D.list('h:' + h.id); for (const k of Object.keys(L)) if (k !== 'moedas' && L[k] > 0) D.use('h:' + h.id, k, L[k], { code: 'teste' }); }
  return h;
}
// (the town calm: an execution gathers everyone within forty steps of the square, and one called on the way does not get to
// the fair — the same execution took the three sent in c14, after the merge of 496dfd3, T-095)
const GATHER = { justice: 1, assembly: 1, fest: 1, muster: 1, fire: 1 };
const calm = (set, h) => !(S.execs || []).some(e => e.set === set.id && e.phase !== 'done' && (e.phase !== 'wait' || e.start - 22 - S.clock < 150)) && !adults(h).some(o => o.task && GATHER[o.task.type]);

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
  const h = houseLacking(set, 2, 30);
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
  let v = null; fine(360, () => { re8.step(); v = members(h).find(o => o.carry && o.carry.bought && o.carry.to === 'h:' + h.id) || null; return !!v || watch(); });
  if (v) {
    const k = v.carry.k, n = v.carry.n, vid = v.id;
    G.Village.kill(v, 'teste');
    const e = book(q => q[0] > L0 && q[3] === 'v:' + vid && q[8] === 'herdado');
    const lost = QA.check().filter(q => /sumiram sem lançamento/.test(q.msg));
    ok('c8 morre com a compra nas mãos', e.length >= 1 && Math.abs(e.reduce((a, q) => a + q[6], 0) - n) < 0.01 && !lost.length, `${v.name} morreu com ${n} de ${E.name(k)} comprados: ${e.map(q => q[6] + ' para ' + q[4]).join(', ') || 'NADA no livro'}${lost.length ? '; o verificador: ' + lost[0].msg : ''}${re8.said()}`);
  } else ok('c8 morre com a compra nas mãos', false, `ninguém da casa trouxe uma compra em 360 s${re8.said()}`);
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
  if (D.get(H, 'food') < 2) D.make(H, 'food', 2, { code: 'teste' }); // (something in the chest: a chest of nothing is no plan)
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
    v14 = adults(h).filter(o => !tried14.includes(o.id) && !(o.carry && o.carry.n > 0)).sort((x, y) => y.energy - x.energy || x.id - y.id)[0] || adults(h).filter(o => !tried14.includes(o.id))[0] || null;
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
  ok('c14 a casa cheia não compra', L14 === 0 && u.every(x => x === 0) && !went && !!v14 && !bought14 && (!fair || said.includes('casa_cheia')) && Math.abs(D.get(H, 'moedas') - c0) < 1e-6 && !bad().length,
    `a casa #${h.id} com a arca cheia (${r2(held())} de ${r2(capNow())}): ${L14} falta(s), vontade ${u.join(', ')}; ${went ? `ALGUÉM saiu (${goer ? goer.name + ', ' + goer.task.type + (goer.home !== h.id ? ', de outra casa' : '') : '?'})` : 'ninguém saiu em 60 s'}; ${v14 ? `${v14.name}, mandado à feira por tecido, ${bought14 ? 'COMPROU' : 'não comprou'} (falas: ${said.join(', ') || 'nenhuma'}${t14 && v14.task === t14 ? '' : `; agora ${v14.task ? v14.task.type : 'sem tarefa'}`}; moedas da casa ${r2(c0)} → ${r2(D.get(H, 'moedas'))})` : 'ninguém da casa para mandar'}${away14.length ? ` (antes: ${away14.join('; ')})` : ''}`);
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
    const home = fine(240, () => book(e => e[0] > L2 && e[3] === 'v:' + carrier.id && e[5] === k).length > 0 || watch());
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
  const L0 = S.ledgerN, c0 = S.clock; let took = 0, home = 0, by = null, prev = true; const again17 = [];
  const give0 = G.Vg.setTask; G.Vg.setTask = function (o, t) { if (o === v && t && t.type === 'water' && o.task && o.task.casa && !took) took = S.clock - c0 || 0.01; return give0.apply(this, arguments); };
  fine(300, atHour(0.3, () => {
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
  const where = !t17 ? '' : t17.type === 'compra' ? 'a uma banca' : ({ feira: 'à feira', mercado: 'ao mercado', mercado_negro: 'ao mercado negro' })[(S.buildings.get(t17.id) || {}).type] || 'às compras';
  ok('c17 a água espera a volta das compras', !!t17 && !took && !!home && h.water > 0.9 && !bad().length,
    t17 ? `${v.name}, mandad${v.g === 'f' ? 'a' : 'o'} ${where} por ${t17.n} de ${E.name(t17.k)} com a água da casa em 0,2 e o resto da casa dormindo: ${took ? `a água A TIROU das compras aos ${Math.round(took)} s` : 'a água esperou'}; ${home ? `a compra chegou em casa aos ${Math.round(home)} s` : 'a compra NÃO chegou em casa'}; ${h.water > 0.9 ? `depois, ${by ? by.name : 'alguém'} buscou a água` : 'a água NÃO foi buscada'}${again17.length ? ` (antes, o recado acabou sozinho, sem compra, ${again17.length} vez(es): mandad${v.g === 'f' ? 'a' : 'o'} de novo)` : ''}`
      : `${v.name} não foi mandado às compras (lista ${C.list(h).map(q => q.k).join(', ') || 'vazia'})`);
}
// ---------------- c7: a save in the middle of the errand: the errand lost does not hold the house; it buys again, one at a time
{
  S.time = 0.15; stockFair(set);
  const h = houseLacking(set, 2, 30); const hid = h.id;
  const sent = fine(90, () => !!errandOf(h) || watch());
  const str = G.Save.serialize(); if (G.UI && G.UI.select) G.UI.select(null); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game';
  S = G.S; set = S.settlements.get(set.id); const h2 = S.buildings.get(hid);
  h2.shopT = undefined; // (the test's hand: the house may send again at once)
  let most = 0; const L0 = S.ledgerN;
  const again = fine(120, () => { let c = 0; for (const o of S.villagers.values()) if (o.task && o.task.casa === hid) c++; most = Math.max(most, c); return c > 0 || watch(); });
  ok('c7 save no meio do recado', sent && again && most === 1 && !bad().length, `${sent ? 'o recado saiu' : 'o recado NÃO saiu'} antes do save; depois do load ${again ? 'a casa mandou de novo' : 'a casa NÃO mandou de novo'} (no máximo ${most} ao mesmo tempo)`);
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
  M.pronto('cidade'); S = G.S; M.viver(2); G.inSim = Math.max(G.inSim, 1); S.time = 0.15;
  // (the biggest town without coin, with a fair or a market and a family house — two grown people — for the case)
  const family = s => [...S.buildings.values()].filter(b => b.set === s.id && b.built && G.BDEF[b.type].housing && (b.res || 0) >= 2 && [...S.villagers.values()].filter(v => v.home === b.id && v.age >= 14).length >= 2).sort((a, b) => a.id - b.id);
  const tw = [...S.settlements.values()].filter(s => !E.coinage(s.fac) && [...S.buildings.values()].some(b => b.set === s.id && (b.type === 'feira' || b.type === 'mercado') && b.built) && family(s).length).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  let info = 'nenhuma cidade sem moeda com feira ou mercado e uma casa de família (dois adultos) no mundo «cidade»', fine9 = false;
  if (tw) {
    stockFair(tw);
    const h = family(tw)[0];
    lacking(h); if ((h.pantry || 0) < 12) D.make('h:' + h.id, 'food', 12, { code: 'teste' });
    const L0 = S.ledgerN;
    const got = fine(240, () => book(e => e[0] > L0 && e[4] === 'h:' + h.id && e[8] === 'compra-em-casa').length > 0 || watch());
    const buy = book(e => e[0] > L0 && (e[8] === 'venda' || e[8] === 'feira') && e[5] !== 'food' && /^v:/.test(e[4]) && (S.villagers.get(+e[4].slice(2)) || {}).home === h.id)[0];
    const paid = buy && buy[8] === 'venda' ? D.ledger().find(e => e[0] === buy[0] + 1) : null;
    fine9 = got && !!buy && !bad().length;
    info = `${tw.name} (sem moeda): ${buy ? `a casa #${h.id} levou ${buy[6]} de ${E.name(buy[5])} ${buy[8] === 'feira' ? 'da feira do povo (sem moeda, a feira dá)' : `de uma banca, pagando ${paid ? paid[6] + ' de ' + E.name(paid[5]) : '?'}`}` : 'NÃO comprou'}; ${got ? 'chegou em casa' : 'NÃO chegou em casa'}`;
  }
  ok('c9 um povo sem moeda', fine9, info);
}

const e = M.erros();
if (others.size) console.log(`   (o verificador, em outros sistemas, durante o cenário: ${[...others.keys()].slice(0, 6).join(' · ')}${others.size > 6 ? ` · e mais ${others.size - 6}` : ''})`);
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 4).join(' | '));
console.log(fails.length ? `COMPRAS: FALHOU (${fails.join(', ')})` : 'COMPRAS: ok');
process.exit(fails.length ? 1 : 0);
