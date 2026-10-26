// compras: as compras da casa provocadas de propósito (C1) — a família que precisa vai comprar, pela moeda da casa, no
// mundo pronto «metrópole» (Argos, com moeda) e no «cidade» (um povo sem moeda).   node qa/compras.js   (em Node)
// c1 a casa que precisa manda um dos seus; c2 a compra paga pela casa (no livro-razão) chega em casa; c3 sem moeda,
// ninguém sai; c4 nada faltando, ninguém sai; c5 um de cada vez; c6 fora das horas do mercado, ninguém sai; c7 save no
// meio do recado: o recado perdido não prende a casa, e ela compra de novo, um de cada vez; c8 quem compra morre com a
// compra nas mãos: ela vai para a casa, pelo livro; c9 um povo sem moeda compra em espécie; c10 o salto: as casas compram
// também no salto; c11 o volume de um dia (antes da Etapa 4: nenhuma compra no dia que começa às 0,10); c13 com uma compra
// nas mãos, um afazer de fora espera (a caverna punha as suas coisas por cima dela), um chamado urgente leva; c12 o corpo do
// deus não é mandado: a casa aparece no diário dele como um objetivo; c14 a casa cheia não compra (com os móveis dos
// interiores, a casa guarda o que eles comportam — D-053, D-059); c15 com pouco lugar, compra só o que cabe; c16 nada pago
// se perde: o que não coube no caminho fica no chão da casa, nunca no estoque do povo; e o verificador limpo, sem erro de
// módulo.
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
// a house of the town with a few grown people in it (the first by id, past the ones taken)
const taken = new Set();
function houseIn(set, min) {
  const L = [...S.buildings.values()].filter(b => b.set === set.id && b.built && G.BDEF[b.type].housing && (b.res || 0) >= 2 && !taken.has(b.id) && adults(b).length >= (min || 2)).sort((a, b) => a.id - b.id);
  const h = L[0]; if (h) taken.add(h.id); return h || null;
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

// ================================ the world with coin ================================
M.pronto('metropole'); S = G.S; M.viver(2); G.inSim++;
let set = [...S.settlements.values()].find(s => s.name === 'Argos');
console.log(`(${set.name}: ${G.Village.pop(set.id)} habitantes; moeda: ${E.coinage(set.fac) ? 'sim' : 'não'})`);
S.time = 0.15;
const fair = stockFair(set);
// ---------------- c1/c2/c5: a house that lacks sends one of its people; the purchase is paid by the house and gets home
{
  const h = houseIn(set, 2); lacking(h, 30);
  const L0 = S.ledgerN; const list = C.list(h).map(q => q.k);
  let most = 0; let errand = null;
  const sent = fine(90, () => { const v = errandOf(h); if (v) errand = errand || { v, k: v.task.k, type: v.task.type, n: v.task.n }; let c = 0; for (const o of S.villagers.values()) if (o.task && o.task.casa === h.id) c++; most = Math.max(most, c); return !!errand || watch(); });
  ok('c1 a casa manda um dos seus', sent && errand && errand.v.home === h.id && list.includes(errand.k),
    errand ? `a casa #${h.id} (${h.res} pessoas) sem ${list.slice(0, 3).map(k => E.name(k)).join(', ')}: ${errand.v.name} foi comprar ${errand.n} de ${E.name(errand.k)} (${errand.type === 'compra' ? 'numa banca' : 'na ' + ((S.buildings.get(errand.v.task.id) || {}).type || '?')})` : `ninguém saiu em 90 s (lista: ${list.join(', ')})`);
  // (the purchase — by whoever of the house went: the goods into the hands and the coins out of the house, in the same
  // instant; then home)
  const mine = id => (S.villagers.get(id) || {}).home === h.id;
  const home = fine(240, () => { let c = 0; for (const o of S.villagers.values()) if (o.task && o.task.casa === h.id) c++; most = Math.max(most, c); return book(e => e[0] > L0 && e[4] === 'h:' + h.id && e[8] === 'compra-em-casa').length > 0 || watch(); });
  const goods = book(e => e[0] > L0 && (e[8] === 'compra' || e[8] === 'venda') && /^v:/.test(e[4]) && mine(+e[4].slice(2)) && e[5] !== 'moedas')[0];
  const pay = goods && D.ledger().find(e => e[0] === goods[0] + 1);
  const got = book(e => e[0] > L0 && e[4] === 'h:' + h.id && e[8] === 'compra-em-casa')[0];
  ok('c2 a compra paga pela casa chega em casa', home && !!goods && !!pay && pay[3] === 'h:' + h.id && pay[5] === 'moedas' && !!got && !bad().length,
    goods ? `${nm(+goods[4].slice(2))} comprou ${goods[6]} de ${E.name(goods[5])} (${goods[3]}) e a casa pagou ${pay ? pay[6] + ' moedas a ' + pay[4] : '?'} no mesmo instante (livro ${goods[0]} e ${pay ? pay[0] : '?'}); ${got ? `chegou em casa (${got[6]} de ${E.name(got[5])})` : 'NÃO chegou em casa'}` : 'nenhuma compra no livro');
  ok('c5 um de cada vez', most === 1, `no máximo ${most} pessoa(s) da casa fazendo as compras dela ao mesmo tempo`);
}
// ---------------- c3: no coin, nobody goes
{
  const h = houseIn(set, 2); lacking(h, 0);
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
  const h = houseIn(set, 2); lacking(h, 30);
  const t0 = S.time; S.time = 0.85;
  const u = adults(h).map(v => C.urge(v));
  S.time = t0;
  ok('c6 fora das horas do mercado', u.every(x => x === 0), `de noite (0,85), a casa #${h.id} que precisa e pode pagar: vontade ${u.join(', ')}`);
}
// ---------------- c8: the shopper dies with the purchase in the arms: it goes to the house, through the ledger
{
  S.time = 0.15; stockFair(set);
  const h = houseIn(set, 2); lacking(h, 30); const L0 = S.ledgerN;
  let v = null; fine(360, () => { v = members(h).find(o => o.carry && o.carry.bought && o.carry.to === 'h:' + h.id) || null; return !!v || watch(); });
  if (v) {
    const k = v.carry.k, n = v.carry.n, vid = v.id;
    G.Village.kill(v, 'teste');
    const e = book(q => q[0] > L0 && q[3] === 'v:' + vid && q[8] === 'herdado');
    const lost = QA.check().filter(q => /sumiram sem lançamento/.test(q.msg));
    ok('c8 morre com a compra nas mãos', e.length >= 1 && Math.abs(e.reduce((a, q) => a + q[6], 0) - n) < 0.01 && !lost.length, `${v.name} morreu com ${n} de ${E.name(k)} comprados: ${e.map(q => q[6] + ' para ' + q[4]).join(', ') || 'NADA no livro'}${lost.length ? '; o verificador: ' + lost[0].msg : ''}`);
  } else ok('c8 morre com a compra nas mãos', false, 'ninguém da casa trouxe uma compra em 360 s');
}
// ---------------- c12: the god's body is not sent; the house's need is a goal in its diary
{
  const h = houseIn(set, 2); lacking(h, 30);
  const v = adults(h)[0]; const tk = G.Possess.take(v); M.viver(0.2);
  const u = C.urge(v); const g = (G.Act.diary(v).goals || []).find(q => q.src === 'casa');
  G.Possess.release('deus'); M.viver(0.2);
  ok('c12 o corpo e a casa', tk.ok && u === 0 && !!g, `${v.name} pelo deus: vontade de comprar ${u}; no diário: ${g ? '«' + g.txt + '»' : 'NADA'}`);
}
// ---------------- c13: hands with a purchase on the way home take no errand from outside (a cave, a feast, a theft would put
// their own things in them over it); an urgent call does take the person — and the purchase stays in the hands
{
  const h = houseIn(set, 1) || houseIn(set, 0); const v = adults(h)[0];
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
  // (the house's errand of before, if one of it was out for it, let go — the test's hand, as lacking() forgets the mark — and
  // what its people carry home put away first: the case starts with nothing on the way)
  for (const o of S.villagers.values()) if (o.task && o.task.casa === h.id) G.Vg.endTask(o);
  fine(60, () => !members(h).some(o => o.carry && o.carry.to === H) || watch());
  if (D.get(H, 'food') < 2) D.make(H, 'food', 2, { code: 'teste' }); // (something in the chest: a chest of nothing is no plan)
  const held = () => Object.entries(D.list(H)).filter(([k]) => k !== 'moedas').reduce((a, [, n]) => a + n, 0);
  const was = D.stores; let mode = 'cheia', cap = 0;
  const capNow = () => (mode === 'cheia' ? held() : mode === 'um' ? held() + 1 : cap);
  D.stores = b => (b && b.id === h.id ? [{ id: h.id + ':arca', kind: 'arca', keys: '*', cap: capNow(), dep: 'casa', sale: null }] : was ? was(b) : null);
  // c14: the chest full — no room for one more thing: nobody goes; one sent to the fair's table all the same (a stroll's
  // whim) finds no room at home and buys nothing
  S.time = 0.15;
  const u = adults(h).map(v => C.urge(v)); const L14 = C.list(h).length;
  const went = fine(60, atHour(0.15, () => !!errandOf(h) || watch())); const goer = errandOf(h);
  // (the one sent: hands free, rested and fed — a tired one would go to bed on the way —, brought to the fair — the deal is
  // the subject, not the walk across town —, in the morning: the test's hand, as negocio's buyers)
  const v14 = adults(h).filter(o => !(o.carry && o.carry.n > 0)).sort((a, b) => b.energy - a.energy || a.id - b.id)[0] || adults(h)[0]; const L0 = S.ledgerN; const c0 = D.get(H, 'moedas');
  v14.energy = Math.max(v14.energy, 70); v14.hunger = Math.min(v14.hunger, 30);
  if (v14.carry && v14.carry.n > 0) D.use('v:' + v14.id, v14.carry.k, v14.carry.n, { code: 'teste', mine: true });
  if (fair) { const [fx, fy] = G.Village.frontTile(fair); if (G.W.walkableXY(fx, fy)) { v14.x = fx; v14.y = fy; v14.path = null; } }
  const said = []; const say0 = G.Falas.say; G.Falas.say = function (o, key) { const t = say0.apply(this, arguments); if (o && o.id === v14.id) said.push(key); return t; };
  G.Vg.endTask(v14); const t14 = fair ? G.Vg.setTask(v14, { type: 'shop', id: fair.id, k: 'tecido', pri: 1.3 }) : null;
  fine(150, atHour(0.2, () => !(v14.task && v14.task === t14) || watch()));
  G.Falas.say = say0;
  const bought14 = book(e => e[0] > L0 && e[4] === 'v:' + v14.id && (e[8] === 'compra' || e[8] === 'feira')).length;
  ok('c14 a casa cheia não compra', L14 === 0 && u.every(x => x === 0) && !went && !bought14 && (!fair || said.includes('casa_cheia')) && Math.abs(D.get(H, 'moedas') - c0) < 1e-6 && !bad().length,
    `a casa #${h.id} com a arca cheia (${r2(held())} de ${r2(capNow())}): ${L14} falta(s), vontade ${u.join(', ')}; ${went ? `ALGUÉM saiu (${goer ? goer.name + ', ' + goer.task.type + (goer.home !== h.id ? ', de outra casa' : '') : '?'})` : 'ninguém saiu em 60 s'}; ${v14.name}, mandado à feira por tecido, ${bought14 ? 'COMPROU' : 'não comprou'} (falas: ${said.join(', ') || 'nenhuma'}${t14 && v14.task === t14 ? '' : `; agora ${v14.task ? v14.task.type : 'sem tarefa'}`}; moedas da casa ${r2(c0)} → ${r2(D.get(H, 'moedas'))})`);
  // c15: room for one thing — the house sends for what it lacks, and buys only what fits
  mode = 'um'; h.shopT = undefined; h.shopOut = 0; S.time = 0.15;
  const lack15 = C.list(h).map(q => `${q.n} de ${E.name(q.k)}`); const L1 = S.ledgerN;
  let carrier = null;
  fine(360, () => { carrier = carrier || members(h).find(o => o.carry && o.carry.bought && o.carry.to === H) || null; return !!carrier || watch(); });
  const buy = book(e => e[0] > L1 && (e[8] === 'compra' || e[8] === 'venda' || e[8] === 'feira') && /^v:/.test(e[4]) && (S.villagers.get(+e[4].slice(2)) || {}).home === h.id && e[5] !== 'moedas')[0];
  ok('c15 com pouco lugar, compra só o que cabe', !!carrier && !!buy && buy[6] <= 1 + 1e-6 && !bad().length,
    buy ? `a casa #${h.id} com lugar para 1 (faltava ${lack15.join(', ')}): ${nm(+buy[4].slice(2))} comprou ${buy[6]} de ${E.name(buy[5])}` : `ninguém da casa comprou em 360 s (faltava ${lack15.join(', ') || 'nada'})`);
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
// ---------------- c7: a save in the middle of the errand: the errand lost does not hold the house; it buys again, one at a time
{
  S.time = 0.15; stockFair(set);
  const h = houseIn(set, 2); lacking(h, 30); const hid = h.id;
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
{
  M.pronto('metropole'); S = G.S; S.time = 0.1; G.inSim = Math.max(G.inSim, 1);
  let n = 0, home = 0; const f = e => { if ((e[8] === 'venda' && e[3][0] === 'z') || ((e[8] === 'compra' || e[8] === 'feira') && e[3][0] === 'b')) n++; if (e[8] === 'compra-em-casa') home++; };
  D.onMove.push(f); const d0 = S.day; while (S.day - d0 < 1) G.debug.step(0.1); D.onMove.splice(D.onMove.indexOf(f), 1);
  ok('c11 o volume de um dia', n >= 20 && home >= n * 0.7 && !bad().length, `um dia da metrópole desde as 0,10: ${n} compras das casas, ${home} chegaram em casa (antes: 0)`);
}

// ================================ a people without coin ================================
{
  M.pronto('cidade'); S = G.S; M.viver(2); G.inSim = Math.max(G.inSim, 1); S.time = 0.15;
  const tw = [...S.settlements.values()].filter(s => !E.coinage(s.fac) && [...S.buildings.values()].some(b => b.set === s.id && (b.type === 'feira' || b.type === 'mercado') && b.built)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
  let info = 'nenhuma cidade sem moeda com feira ou mercado', fine9 = false;
  if (tw) {
    stockFair(tw);
    const h = [...S.buildings.values()].filter(b => b.set === tw.id && b.built && G.BDEF[b.type].housing && (b.res || 0) >= 2 && [...S.villagers.values()].filter(v => v.home === b.id && v.age >= 14).length >= 2).sort((a, b) => a.id - b.id)[0];
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
