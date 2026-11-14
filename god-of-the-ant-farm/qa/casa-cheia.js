// casa-cheia: «a casa cheia que não esvazia» (L-718; Bairros Vivos, o agente H — D-220 a D-224), em Node, num mundo pronto (a
// «cidade» por padrão — quatro cidades de moeda, pequena e rápida —; `node qa/casa-cheia.js metropole` para a metrópole).
// A família que não cabe mais nas camas da casa em que mora (ou o casal na casa cheia dos outros) e não junta o preço de um teto
// tem duas estradas (act-casa.js): a casa vazia do povo, dada pelo que a família tem além do pouco que guarda (D-221); e, depois
// de K.HANDS_DAYS dias juntando sem chegar ao preço, a cabana levantada com as próprias mãos — os crescidos da família são os
// construtores, a madeira é a sobra do povo, o chão é a metade barata da cidade (D-222). O diário e a ficha da casa dizem o
// caminho com a causa (D-223). A casa cheia de cada caso é feita pela mão da prova: uma família da cidade posta na casa de outra.
//   c1  o plano: a casa vazia do povo serve à família que viveria nela menos apertada (a família de sete e a casa de seis)
//   c2  a casa vazia do povo dada a quem não tem o preço: no mesmo dia, pelo livro, com o pouco que a família guarda; quem tem o
//       preço paga-o inteiro; o dia da cidade faz
//   c3  a troca: a família sozinha na cabana que é dela e a casa maior do povo — a cabana fica para o povo
//   c4  as próprias mãos: a paciência (antes dela, só junta), a obra da família — cabana, com dono, paga com o que há além do que
//       guarda, na metade barata da cidade —, a madeira de sobra menos a que a obra espera, o diário, a ficha
//   c5  a família levanta: só ela trabalha na obra (os construtores do povo não), a obra não conta nas duas pagas, a madeira sai
//       do armazém do povo pelo livro, a família muda e é a dona, as moedas guardadas vão ao povo
//   c6  save e load no meio da obra da família
//   c7  o chefe morre no meio (o par continua); os dois morrem (a obra passa aos construtores do povo)
//   c8  a cidade é conquistada no meio
//   c9  falta madeira: nada começa, e o diário diz; a madeira que os navios guardam não é sobra; com madeira, começa
//   c10 falta chão: nada começa, o diário diz, e no dia seguinte a família tenta de novo
//   c11 o corpo do deus na família: o dia não decide por ela; a oferta diz o caminho; o corpo pede, e a obra é da família
//   c12 a casa vazia do povo que aparece no meio: na paciência, é dada; com a obra da família de pé, a família acaba a sua
//   c13 quem não vai por esta estrada: a família sozinha na casa que tem, o povo sem moeda, quem tem o preço, quem viveria mais
//       apertado numa cabana, a cidade com cabanas demais em obra
//   c14 a tela só lê: o diário, a ficha, a oferta e a estrada não mudam o mundo
//   c15 o mundo: anos de salto com o verificador — nenhuma casa de várias famílias fica com o dobro da lotação além da paciência
//   c16 o par que chega depois da obra marcada (L-719): não pede outra casa por nenhuma porta, trabalha na cabana e muda com a família
// A segunda rodada (D-235 a D-238; L-973, L-974):
//   c17 os moços da casa (D-235, parte da D-194): os filhos crescidos sem par de uma casa acima da lotação saem juntos — a
//       paciência, a cabana deles (o dono: o mais velho), um só não levanta nada (a não ser de uma casa com o dobro), e a família
//       de pais e pequenos fica, com a causa dita no diário e na ficha
//   c18 os moços levantam a cabana e mudam, os pais e os pequenos ficam; a morte de quem levanta, o save no meio, o corpo do deus
//   c19 a família antes do solteiro (D-236): a casa vazia do povo que uma família espera não é do solteiro que o repartidor manda
//   c20 o bolso de quem tem teto vai ao pote da casa (L-973): com o preço no bolso, a família compra no mesmo dia
//   c21 a família ao relento (D-237): a casa vazia do povo no mesmo dia; sem ela, a cabana das mãos sem a paciência, e nenhum
//       barraco ao lado; sem madeira, o barraco; quem está só; o save no meio
//   c22 quem deixa a sede (T-818): a troca de governo com a cidade cheia, a queda do palácio, o save; e o par de quem é da sede,
//       que entrava e saía sem parar (L-974)
//   node qa/casa-cheia.js [mundo]        (ONLY=c2,c5 só esses; ANOS=n os anos do c15, 6 por padrão)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/casa-cheia-inv.js', 'qa/casa-cheia2-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const MUNDO = process.argv[2] || process.env.MUNDO || 'cidade';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casa-cheia ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, D, K, E, U, A;
const pega = () => { S = G.S; V = G.Village; D = G.Depot; K = G.Casa; E = G.Eco; U = G.Urban; A = G.Act; return S; };
const PEND = []; // (what a case changed in the rules of the game by the test's hand — the beds of a type of house —, to give back)
const abre = () => { while (PEND.length) PEND.pop()(); M.pronto(MUNDO); pega(); M.viver(2); S.time = 0.15; S.weather.storm = 0; VIVE.set = null; return S; };
const salva = () => { const k = M.salvarCarregar(); pega(); return k; };
const r2 = x => Math.round(x * 100) / 100;
const P = id => S.villagers.get(id) || null;
const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
const camas = b => G.BDEF[b.type].housing;
const mora = b => [...S.villagers.values()].filter(v => v.home === b.id && !v.captive);
const moedas = ref => D.get(ref, 'moedas');
const poe = (ref, n) => { const c = moedas(ref); if (c > n) D.use(ref, 'moedas', c - n, { code: 'teste' }); else if (c < n) D.make(ref, 'moedas', n - c, { code: 'teste' }); };
const madeira = (set, n) => { const ref = 'f:' + set.fac; const c = D.get(ref, 'wood'); if (c > n) D.use(ref, 'wood', c - n, { code: 'teste' }); else if (c < n) D.make(ref, 'wood', n - c, { code: 'teste' }); return D.get(ref, 'wood'); };
const lado = b => (b ? `${b.type}#${b.id}` : 'nada');
const livro = (n0, f) => D.ledger().filter(e => e[0] > n0 && f(e));
const diario = v => (A.diary(v).goals || []).filter(g => g.src === 'casa-nova').map(g => g.txt).join(' / ');
function checa(sev) {
  const out = [];
  for (const q of QA.check()) if (q.sev <= (q.sys === 'casa-cheia' ? 3 : sev || 2)) out.push(`S${q.sev} ${q.sys}: ${q.msg.slice(0, 170)}`);
  const e = M.erros(); const errs = Object.keys(e.mod).length + e.console.length;
  return { ok: !out.length && !errs, txt: out.length ? out.slice(0, 3).join(' · ') : errs ? 'erros: ' + JSON.stringify(e).slice(0, 240) : 'verificador limpo' };
}
// A family alone in a house with fewer beds than people, its own, in a town of coin: one the world has; else one alone in a
// house of kin who live elsewhere, made its owner by the test's hand; else one alone in a house of its own that fits it, the
// beds of that type of house fewer for the case (desfaz gives them back). → { set, b, o (the owner), como, desfaz } or null
function sozinha() {
  const cand = [];
  for (const set of [...S.settlements.values()].filter(s => E.coinage(s.fac)).sort((a, c) => a.id - c.id)) {
    for (const b of [...S.buildings.values()].sort((a, c) => a.id - c.id)) {
      if (b.set !== set.id || !b.built || !housing(b) || b.type === 'barraco' || b.upgradeFrom || b.elite || b.w !== 1) continue;
      const L = mora(b); const o = L.filter(m => livre(m)).sort((x, y) => (y.id === b.dono) - (x.id === b.dono) || y.age - x.age || x.id - y.id)[0];
      if (!o || K.family(o).length !== L.length || L.length < 3 || L.some(m => m.jail || m.aboard)) continue;
      const dona = L.some(m => m.id === b.dono);
      cand.push({ set, b, o, L, k: L.length > camas(b) ? (dona ? 0 : 1) : dona && (b.type === 'hut' || b.type === 'house') ? 2 : 9 });
    }
  }
  const c = cand.filter(q => q.k < 9).sort((x, y) => x.k - y.k || y.L.length - x.L.length || x.b.id - y.b.id)[0]; if (!c) return null;
  let desfaz = () => { }; let como = 'achada no mundo';
  if (c.k === 1) { c.b.dono = c.o.id; c.b.aluga = null; como = 'a casa era de um parente que mora noutra: a mão da prova a fez dela'; }
  if (c.k === 2) { const tp = c.b.type; const n0 = G.BDEF[tp].housing; G.BDEF[tp].housing = c.L.length - 1; desfaz = () => { G.BDEF[tp].housing = n0; }; como = `a mão da prova deixou a ${tp} com ${c.L.length - 1} camas enquanto o caso dura (tem ${n0})`; }
  c.b.res = c.L.length; c.b.poupa = null;
  return { set: c.set, b: c.b, o: P(c.b.dono), como, desfaz };
}
// (the grown couple that heads a family living together: she, he and their little ones — neither the god's body nor away)
const livre = v => !!v && v.age >= 18 && !v.captive && !v.jail && !v.aboard && !v.held && !(S.avatar && S.avatar.id === v.id) && !K.waiting(v);
function familias(set, min) {
  const out = [];
  for (const v of [...S.villagers.values()].sort((a, c) => a.id - c.id)) {
    if (v.set !== set.id || v.g !== 'f' || !livre(v) || !v.home) continue; const p = P(v.partner); if (!p || !livre(p) || p.home !== v.home || p.set !== set.id) continue;
    const h = S.buildings.get(v.home); if (!h || !h.built || !housing(h) || h.type === 'barraco' || h.upgradeFrom) continue;
    const fam = K.family(v); if (fam.length < (min || 3) || fam.some(m => m.jail || m.aboard)) continue;
    out.push({ v, p, h, fam });
  }
  return out;
}
// (a building taken down by the test's hand: whoever is in it — a guest, one asleep — out at its door first)
function tira(b) { sim(() => { for (const o of S.villagers.values()) if (o.inside === b.id) G.Vg.endTask(o); }); for (const o of S.villagers.values()) if (o.inside === b.id) { o.inside = 0; o.sleeping = false; } V.removeBuilding(b); for (const o of S.villagers.values()) if (o.home === b.id) o.home = 0; }
// (the empty houses of the town the family's plan would take — the people's, and those an owner lets: the family of a case
// has no roof to rent —: taken down by the test's hand, as casa.js clears the way; keep: one of the people's that stays)
function semVazias(v, set, keep) {
  let n = 0;
  for (let k = 0; k < 40; k++) { const pl = K.plan(v, null, set, null, K.need(v)); const fr = pl.lease || (pl.free !== keep ? pl.free : null); if (!fr) break; tira(fr); n++; }
  for (let k = 0; k < 12; k++) { const fr = K.plan(v, null, set, null, K.need(v)).free; if (!fr || fr === keep) break; tira(fr); n++; }
  return n;
}
// (the other families in need of the town let their houses go for now — the diary's own door, K.giveUp —: the town's day asks
// the case's family alone, D-061)
function calaFila(set, v) { const mine = new Set(K.family(v).map(m => m.id)); let n = 0; sim(() => { for (const [o] of K.queue(set)) if (!mine.has(o.id) && K.giveUp(o).ok) n++; }); return n; }
// The crowded house of a case, by the test's hand: in a town of coin, the family B put into the house of the family A — a
// family of the town, with what is its own left behind (it has nothing: the case sets its coins). The house B had becomes the
// people's, empty. → { set, h (the full house), v (the head the town's day asks of it), fam, hB, A, B } or null.
//   o.dobro: the house at twice its beds; o.maior: B more than the beds of the house it had; o.maos: B no more crowded in a
//   hut than in the full house (the road of its hands is open); o.aperta: more crowded in a hut; o.tier: a city (2+)
function arma(o) {
  o = o || {}; abre();
  const towns = [...S.settlements.values()].filter(s => E.coinage(s.fac) && (s.tier || 0) >= (o.tier || 0)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  for (const set of towns) {
    const F = familias(set, o.aperta ? 2 : 3); // (a couple alone will do for the owners of a house that is to be only a little too full)
    for (const Af of F) for (const Bf of F) {
      if (Af === Bf || Af.h === Bf.h) continue;
      const cap = camas(Af.h); const total = mora(Af.h).length + Bf.fam.length;
      if (total <= cap || (o.dobro && total < 2 * cap)) continue;
      if (mora(Bf.h).length !== Bf.fam.length) continue; // (B alone in the house it leaves: it leaves no one behind)
      if (o.maior && Bf.fam.length <= camas(Bf.h)) continue;
      const hut = Bf.fam.length / G.BDEF.hut.housing <= total / cap + 1e-9; if ((o.maos && !hut) || (o.aperta && hut)) continue;
      // (the one the day asks of the full house must be B: A, its owner, fits it)
      if (Af.h.dono !== Af.v.id && Af.h.dono !== Af.p.id) continue; if (Af.fam.length > cap) continue;
      sim(() => { for (const m of Bf.fam) if (m.inside === Bf.h.id) G.Vg.endTask(m); });
      for (const m of Bf.fam) { m.home = Af.h.id; m.hhType = Af.h.type; m.hh = Af.h.id; }
      // (and what was theirs with them, by the ledger: the house they had is left empty)
      for (const [k, n] of Object.entries(D.list('h:' + Bf.h.id))) if (n > 1e-6) D.move('h:' + Bf.h.id, 'h:' + Af.h.id, k, n, { code: 'teste', part: true, floor: true });
      Af.h.res = mora(Af.h).length; Bf.h.res = 0; Bf.h.dono = 0; Bf.h.custo = 0; Bf.h.aluga = null; Bf.h.poupa = null; Af.h.poupa = null;
      const e = K.queue(set).find(q => q[0].home === Af.h.id);
      if (!e || !Bf.fam.includes(e[0])) { for (const m of Bf.fam) { m.home = Bf.h.id; m.hhType = Bf.h.type; m.hh = Bf.h.id; } Af.h.res = mora(Af.h).length; Bf.h.res = Bf.fam.length; Bf.h.dono = Bf.v.id; continue; }
      const v = e[0]; VIVE.set = set; // (the town of the case: its people's wood is kept while the case lives)
      return { set, h: Af.h, v, why: e[1], fam: K.family(v), hB: Bf.h, A: Af, B: Bf };
    }
  }
  return null;
}
const diz = a => (a ? `${a.set.name} (nível ${a.set.tier || 0}): a família de ${a.v.name} #${a.v.id} (${a.fam.length}) na ${lado(a.h)} de ${P(a.h.dono) ? P(a.h.dono).name : 'ninguém'}, ${mora(a.h).length} para ${camas(a.h)} camas («${a.why}»)` : `nenhuma cidade de moeda de ${MUNDO} com duas famílias para o caso`);
// (the family's own work of a case: the people's empty houses taken down, the queue quiet, the house with no coin, wood in the
// store, the days of patience gone by the test's hand — the saving begun K.HANDS_DAYS days ago —, and the day of the town)
function obraDasMaos(o) {
  const a = arma(Object.assign({ maos: true }, o)); if (!a) return null;
  semVazias(a.v, a.set); calaFila(a.set, a.v); madeira(a.set, 40);
  poe('h:' + a.h.id, Math.min(8, r2(K.plan(a.v, null, a.set, null, a.why).price * 0.5))); // (some coin, far from the price)
  sim(() => K.day(a.set)); // (the first look: saving)
  if (a.h.poupa) a.h.poupa.d -= K.HANDS_DAYS;
  a.n0 = S.ledgerN || 0;
  sim(() => K.day(a.set));
  a.b = K.waiting(a.v);
  return a;
}
// (the world lived a second at a time until `ate` says so, by its own days and nights: held in the morning by the test's hand,
// people slept by day for want of their night — the widower of the mega, alone with the hut, three times in 600 s, between the
// funeral, a courtship, the market and the library. The test's hand keeps wood in the store of the case's people while it
// lives — VIVE.set —: the town's own works drain it, and the hut of the case would wait for wood, which is c9's case, not the
// others'; as casa.js keeps the people's materials in its h10, T-202)
const VIVE = { set: null };
function vive(seg, ate, cada) {
  for (let k = 0; k < seg; k++) {
    if (VIVE.set && k % 5 === 0 && D.get('f:' + VIVE.set.fac, 'wood') < 30) madeira(VIVE.set, 60);
    M.viver(1); if (cada) cada(); if (ate && ate()) return k + 1;
  }
  return -1;
}
const naObra = b => [...S.villagers.values()].filter(v => v.task && v.task.type === 'build' && v.task.id === b.id);
// (the hut stood: standing — or, in a city that rebuilds its huts, already being raised further over the family that moved in:
// the planner takes the town's oldest hut, and in a city of tall houses the new one is the only one. In the mega the hut of
// the case was a house in works, 75%, a second after it stood, with the family in it: T-972)
const dePe = b => !!b && !b.encomenda && (b.built || !!b.upgradeFrom);
const jaAmplia = b => (b && b.upgradeFrom ? ' (a cidade já a refaz em casa, com a família dentro)' : '');

// ------------------------------ c1: o plano ------------------------------
run('c1', () => {
  // (a family with more people than the beds of the house it had, where a town has one; else any family that shares a house)
  const a = arma({ maior: true, dobro: true }) || arma({ maior: true }) || arma({ dobro: true }) || arma(); if (!ok('c1a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, hB } = a;
  // (the house B had: the people's, empty, with fewer beds than the family — and no other empty one of the people's for it)
  semVazias(v, set, hB);
  const plan = K.plan(v, null, set, null, a.why); const agora = mora(a.h).length / camas(a.h), la = fam.length / camas(hB);
  ok('c1b a casa vazia do povo, mesmo sem camas para todos', camas(hB) < fam.length ? plan.free === hB : !!plan.free, `a ${lado(hB)} do povo, vazia, ${camas(hB)} camas para ${fam.length}: lá a família viveria a ${la.toFixed(2)} por cama, hoje vive a ${agora.toFixed(2)}; o plano: ${plan.free ? 'toma a ' + lado(plan.free) + ' por ' + plan.price + ' moedas' : 'NÃO a toma'}`);
  // (a family that would live no better there does not take it: alone in the house it has, of the same beds)
  const so = [...S.buildings.values()].filter(b => b.set === set.id && b.built && housing(b) && b.type === hB.type && b.id !== a.h.id && b.dono).map(b => ({ b, L: mora(b) })).find(q => q.L.length > camas(q.b) && q.L.some(m => m.id === q.b.dono) && K.family(P(q.b.dono)).length === q.L.length);
  if (so) { const o = P(so.b.dono); const p2 = K.plan(o, null, set, null, K.need(o)); ok('c1c quem não ficaria melhor não a toma', p2.free !== hB, `${o.name}, com a família sozinha na sua ${lado(so.b)} (${so.L.length} para ${camas(so.b)}): o plano ${p2.free === hB ? 'TOMARIA a casa igual do povo' : 'não toma a casa igual do povo'}`); }
  // (and one with beds for all still comes before one without: the first of them, as it always was)
  const pos = sim(() => V.findSite(set, 'sobrado')); const big = pos && !pos.demolish ? sim(() => V.addBuilding('sobrado', pos[0], pos[1], set.id, true)) : null;
  if (big) { const p3 = K.plan(v, null, set, null, a.why); ok('c1d a que tem camas para todos vem antes', !!p3.free && camas(p3.free) >= fam.length, `com um sobrado do povo vazio (${camas(big)} camas) ao lado da ${lado(hB)}: o plano toma ${lado(p3.free)}`); }
  const c = checa(); ok('c1e verificador', c.ok, c.txt);
});

// ------------------------------ c2: a casa vazia do povo, dada ------------------------------
run('c2', () => {
  const a = arma({ dobro: true }); if (!ok('c2a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, h, hB } = a;
  semVazias(v, set, hB);
  calaFila(set, v);
  // (the pot of the full house: 9 coins, everyone's — the family's share of it past the little it keeps is what it pays —, or
  // a hair below the price where the house is cheaper than that: the people's empty house of the metrópole of the generation 21
  // is a hut of 4,7, and the nine paid it whole, as c2g has it — the family had the price, T-1129)
  const preco = K.plan(v, null, set, null, a.why).price; const pote = preco > 9 ? 9 : r2(Math.max(0, preco - 0.01));
  poe('h:' + h.id, pote); const todos = mora(h).length; const parte = r2(pote * fam.length / todos);
  const deve = r2(Math.min(preco, Math.max(0, parte - K.KEEP)));
  const rd = K.road(v); const tes0 = moedas('f:' + set.fac); const n0 = S.ledgerN || 0; const d0 = S.day;
  ok('c2b a estrada', rd.kind === 'cede' && rd.b === hB && Math.abs(rd.pays - deve) < 0.011 && preco > pote, `a casa custa ${preco} e a casa cheia tem ${pote} moedas (a parte da família, ${parte}): a estrada diz «${rd.kind}» ${lado(rd.b)} por ${rd.pays} (o que passa das ${K.KEEP} que guarda: ${deve}); no diário: «${diario(v)}»`);
  sim(() => K.day(set));
  const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'compra-casa'); const mud = livro(n0, e => e[8] === 'mudança' && e[3] === 'h:' + h.id && e[4] === 'h:' + hB.id);
  // (a family with more people than the beds of the house it was given is alone in a house of its own now: no road by hand)
  const resto = K.need(v); const quieta = !resto || (fam.length > camas(hB) && resto === 'lotada' && K.road(v).why === 'so');
  ok('c2c dada no mesmo dia, e a família é a dona', fam.every(m => m.home === hB.id) && hB.dono === v.id && S.day === d0 && quieta && mora(h).length === todos - fam.length, `${fam.filter(m => m.home === hB.id).length} de ${fam.length} da família moram na ${lado(hB)}; dono: ${P(hB.dono) ? P(hB.dono).name : 'o povo'}; a casa cheia ficou com ${mora(h).length} para ${camas(h)}; ${v.name} ${!resto ? 'já não precisa de casa' : quieta ? 'tem a família sozinha numa casa sua, pequena para ela (' + fam.length + ' para ' + camas(hB) + '): não levanta outra com as mãos' : 'AINDA precisa de casa (' + resto + '), e a estrada diz ' + JSON.stringify(K.road(v))}`);
  ok('c2d pelo livro, com o pouco que guarda', pg.length === (deve > 0 ? 1 : 0) && (!pg.length || (pg[0][3] === 'h:' + h.id && pg[0][4] === 'f:' + set.fac && Math.abs(pg[0][6] - deve) < 0.011)) && Math.abs((hB.custo || 0) - deve) < 0.011 && mud.length >= 1 && Math.abs(moedas('h:' + hB.id) + moedas('h:' + h.id) - (pote - deve)) < 0.011,
    `${pg.length} linha(s) «compra-casa»${pg.length ? ': ' + pg[0][6] + ' de ' + pg[0][3] + ' para ' + pg[0][4] : ''}; o tesouro ${tes0.toFixed(2)} → ${moedas('f:' + set.fac).toFixed(2)}; a casa custou à família ${hB.custo}; a mudança no livro: ${mud.map(e => e[6] + ' ' + e[5]).join(', ') || 'NADA'}; a família levou ${moedas('h:' + hB.id).toFixed(2)} moedas, a casa cheia ficou com ${moedas('h:' + h.id).toFixed(2)}`);
  ok('c2e a vida diz', (v.moves || []).some(m => /recebeu do povo/.test(m[1])) && (v.diary || []).some(e => /o povo nos deu/.test(e.txt)), `os passos de ${v.name}: «${(v.moves || []).map(m => m[1]).slice(-1)}»; no diário: «${((v.diary || []).filter(e => /povo nos deu/.test(e.txt)).slice(-1)[0] || { txt: 'NADA' }).txt}»`);
  const c = checa(); ok('c2f verificador', c.ok, c.txt);
  // (who has the price pays it whole: the same house, the same family, with coins)
  const a2 = arma({ dobro: true }); if (!a2 || a2.v.id !== v.id) { ok('c2g quem tem o preço', false, 'o caso não se armou de novo igual'); return; }
  semVazias(a2.v, a2.set, a2.hB);
  calaFila(a2.set, a2.v); const p2 = K.plan(a2.v, null, a2.set, null, a2.why).price; poe('h:' + a2.h.id, p2 + K.KEEP + 3); const n1 = S.ledgerN || 0;
  sim(() => K.day(a2.set)); const pg2 = livro(n1, e => e[5] === 'moedas' && e[8] === 'compra-casa');
  ok('c2g quem tem o preço paga-o inteiro', a2.hB.dono === a2.v.id && pg2.length === 1 && Math.abs(pg2[0][6] - p2) < 0.011, `com ${(p2 + K.KEEP + 3).toFixed(2)} moedas na casa: ${pg2.length} linha(s) «compra-casa»${pg2.length ? ' de ' + pg2[0][6] : ''} (o preço: ${p2}); dono: ${P(a2.hB.dono) ? P(a2.hB.dono).name : 'o povo'}`);
});

// ------------------------------ c3: a troca ------------------------------
run('c3', () => {
  abre(); const caso = sozinha();
  if (!ok('c3a a família sozinha na casa pequena', !!caso, caso ? `${caso.set.name}: ${caso.o.name} #${caso.o.id}, dona da ${lado(caso.b)}, com a família sozinha nela (${mora(caso.b).length} para ${camas(caso.b)} camas; ${caso.como})` : `nenhuma família sozinha numa casa sua em ${MUNDO}`)) return;
  try { c3(caso); } finally { caso.desfaz(); }
});
function c3(caso) {
  const { set, b, o } = caso; const fam = K.family(o);
  // (a house of the people's with more beds than the one the family has — and, if there is such a type, with beds for all of it)
  const tipos = ['house', 'sobrado', 'insula'].filter(tp => tp !== b.type && G.BDEF[tp].housing > camas(b)); const maior = tipos.find(tp => G.BDEF[tp].housing >= fam.length) || tipos[0];
  semVazias(o, set); calaFila(set, o); poe('h:' + b.id, 1);
  ok('c3b sem casa maior do povo, nada', K.road(o).kind === '' && K.road(o).why === 'so', `a estrada: «${K.road(o).kind || '-'}» (${K.road(o).why}); no diário: «${diario(o)}»`);
  sim(() => K.day(set));
  ok('c3c o dia não levanta nada para ela', !K.waiting(o) && o.home === b.id, `${o.name} ${K.waiting(o) ? 'TEM uma obra' : 'não tem obra'} e mora na ${lado(S.buildings.get(o.home))}`);
  const pos = sim(() => V.findSite(set, maior)); const nova = pos && !pos.demolish ? sim(() => V.addBuilding(maior, pos[0], pos[1], set.id, true)) : null;
  if (!ok('c3d uma casa maior do povo, vazia', !!nova, nova ? `a mão da prova pôs ${lado(nova)} (${camas(nova)} camas) vazia, do povo` : 'a cidade não achou lugar para a casa da prova')) return;
  const n0 = S.ledgerN || 0; sim(() => K.day(set));
  const dona = P(nova.dono);
  ok('c3e a troca', fam.every(m => m.home === nova.id) && !!dona && fam.includes(dona) && !b.dono && !mora(b).length && !b.aluga && !b.poupa && (dona.moves || []).some(m => /recebeu do povo/.test(m[1])), `a família mora na ${lado(nova)} (dona: ${dona ? dona.name : 'o povo'}); a ${lado(b)} ficou ${b.dono ? 'COM DONO #' + b.dono : 'do povo'}, com ${mora(b).length} moradores; «${dona ? (dona.moves || []).map(m => m[1]).slice(-1) : ''}»`);
  // (all of it, but for what the move's own rounding leaves: less than a hundredth of a thing)
  ok('c3f o que era da família foi com ela', Math.abs(moedas('h:' + b.id)) < 0.011 && Object.values(D.list('h:' + b.id)).every(n => n < 0.01), `na ${lado(b)} ficou: ${JSON.stringify(D.list('h:' + b.id))}; a mudança no livro: ${livro(n0, e => e[8] === 'mudança').length} linha(s)`);
  const c = checa(); ok('c3g verificador', c.ok, c.txt);
}

// ------------------------------ c4: as próprias mãos — a paciência, a obra, o diário ------------------------------
run('c4', () => {
  const a = arma({ maos: true, tier: 2 }) || arma({ maos: true }); if (!ok('c4a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, h } = a;
  const tiradas = semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 6); madeira(set, 40);
  const todos = mora(h).length; const parte = r2(6 * fam.length / todos); const mat = r2(G.BDEF.hut.cost.wood * E.PRICE.wood); const deve = r2(Math.min(mat, Math.max(0, parte - K.KEEP)));
  const r0 = K.road(v);
  ok('c4b a estrada, antes da paciência', r0.kind === 'maos' && r0.wait === K.HANDS_DAYS && r0.type === 'hut', `sem casa vazia do povo (${tiradas} tiradas pela mão da prova): a estrada «${r0.kind}» em ${r0.wait} dia(s) (a paciência: ${K.HANDS_DAYS}); no diário: «${diario(v)}»`);
  sim(() => K.day(set));
  ok('c4c no primeiro dia só junta', !K.waiting(v) && !!h.poupa && h.poupa.by === v.id && h.poupa.d === S.day && /se em \d+ dias? não juntarmos/.test(diario(v)), `a obra: ${lado(K.waiting(v))}; a casa junta desde o dia ${h.poupa ? h.poupa.d : '?'} (hoje ${S.day}); no diário: «${diario(v)}»`);
  // (a day short of the patience: still nothing)
  h.poupa.d -= K.HANDS_DAYS - 1; sim(() => K.day(set));
  ok('c4d um dia antes da paciência, nada ainda', !K.waiting(v) && K.road(v).wait === 1, `juntando há ${S.day - h.poupa.d} dia(s): a obra: ${lado(K.waiting(v))}; a estrada espera ${K.road(v).wait}`);
  h.poupa.d -= 1;
  ok('c4e com a paciência cumprida, o diário diz as mãos', /vamos levantar a nossa cabana com as nossas mãos/.test(diario(v)) && /vai levantar a sua cabana com as próprias mãos/.test(K.fullSays(h, id => P(id).name, s => s)), `no diário: «${diario(v)}»; na ficha da casa: «${K.fullSays(h, id => P(id).name, s => s).replace(/<[^>]+>/g, '')}»`);
  // (the lot the city gives: asked on the cheaper half of a city's ground — the search's own filter, watched)
  const vals = [...S.buildings.values()].filter(b => b.set === set.id && b.built && housing(b) && b.type !== 'ruin').map(b => U.valueAt(set, b.x + b.w / 2, b.y + b.h / 2)).sort((x, y) => x - y); const meio = vals[vals.length >> 1];
  const find0 = V.findSite; const pedidos = []; V.findSite = function (s, type, reach) { pedidos.push({ type, reach }); return find0.apply(this, arguments); };
  const n0 = S.ledgerN || 0; const pot0 = moedas('h:' + h.id); const livre0 = K.spare(set, 'wood');
  try { sim(() => K.day(set)); } finally { V.findSite = find0; }
  const b = K.waiting(v);
  if (!ok('c4f a obra da família', !!b && b.type === 'hut' && !b.built && !!b.encomenda && b.encomenda.maos === 1 && b.dono === v.id && b.encomenda.fam.length === fam.length && fam.every(m => b.encomenda.fam.includes(m.id)), b ? `${lado(b)} em ${b.x},${b.y}, de ${P(b.dono) ? P(b.dono).name : '?'}: a encomenda ${JSON.stringify(b.encomenda)}` : `nenhuma obra para ${v.name}: a estrada diz ${JSON.stringify(K.road(v))}`)) return;
  const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'obra-casa');
  ok('c4g paga com o que há além do que guarda, pelo livro', Math.abs(b.encomenda.paid - deve) < 0.011 && (deve > 0 ? pg.length === 1 && pg[0][3] === 'h:' + h.id && pg[0][4] === 'h:' + b.id && Math.abs(pg[0][6] - deve) < 0.011 : !pg.length) && Math.abs(moedas('h:' + b.id) - deve) < 0.011 && Math.abs(pot0 - moedas('h:' + h.id) - deve) < 0.011,
    `a casa cheia tinha ${pot0.toFixed(2)} (a parte da família: ${parte}); os materiais de uma cabana valem ${mat}: a família separou ${b.encomenda.paid} na obra (${pg.length} linha «obra-casa»), e a casa ficou com ${moedas('h:' + h.id).toFixed(2)}`);
  const cidade = (set.tier || 0) >= 2 && vals.length >= 4; const val = U.valueAt(set, b.x + 0.5, b.y + 0.5); const p0 = pedidos.find(q => q.type === 'hut');
  ok('c4h no chão barato da cidade', cidade ? !!p0 && typeof p0.reach === 'function' && val <= meio + 1e-9 : !!p0, cidade ? `a terra ali vale ${val.toFixed(1)} (a do meio das casas de ${set.name}: ${meio.toFixed(1)}; a do centro: ${U.valueAt(set, set.cx, set.cy).toFixed(1)}); a busca do lote ${p0 && typeof p0.reach === 'function' ? 'pediu só a metade barata' : 'NÃO pediu a metade barata'}` : `${set.name} é uma aldeia (nível ${set.tier || 0}): o lote é o do planejador`);
  ok('c4i a madeira de sobra é a do armazém menos a que as cabanas esperam', Math.abs(K.spare(set, 'wood') - (livre0 - G.BDEF.hut.cost.wood)) < 0.011, `a sobra de madeira do povo: ${livre0} antes, ${K.spare(set, 'wood')} com a cabana esperando ${G.BDEF.hut.cost.wood}`);
  const de_novo = sim(() => K.order(v));
  ok('c4j uma família, uma obra', !de_novo.ok && /já está sendo levantada/.test(de_novo.why) && /estamos levantando a nossa cabana com as nossas mãos/.test(diario(v)) && /está levantando a sua cabana com as próprias mãos/.test(K.fullSays(h, id => P(id).name, s => s)), `pedida de novo: «${de_novo.why}»; no diário: «${diario(v)}»; na ficha: «${K.fullSays(h, id => P(id).name, s => s).replace(/<[^>]+>/g, '')}»`);
  const c = checa(); ok('c4k verificador', c.ok, c.txt);
});

// ------------------------------ c5: a família levanta ------------------------------
run('c5', () => {
  const a = obraDasMaos(); if (!ok('c5a a obra da família', !!a && !!a.b && a.b.encomenda.maos === 1, a ? (a.b ? `${diz(a)}: ${lado(a.b)} em obra` : `${diz(a)}: sem obra — ${JSON.stringify(K.road(a.v))}`) : diz(a))) return;
  const { set, v, fam, h, b } = a; const ids = new Set(fam.map(m => m.id)); const tes0 = moedas('f:' + set.fac); const pago = b.encomenda.paid;
  // (the builders' two paid works: the family's own takes none — with room for one more paid work only, the builders can)
  const pagas = [...S.buildings.values()].filter(o => o.set === set.id && o.encomenda && !o.encomenda.maos && !o.built).length; const mw = K.MAX_WORKS; let cabe;
  K.MAX_WORKS = pagas + 1; try { cabe = K.cannotRaise(set, 'hut'); } finally { K.MAX_WORKS = mw; }
  ok('c5b não conta nas obras pagas dos construtores', cabe === '', `${pagas} obra(s) paga(s) e a da família, com vaga para ${pagas + 1}: os construtores ${cabe ? 'RECUSAM — «' + cabe + '»' : 'ainda pegam uma casa paga'}`);
  // (a builder of the people in the town who is none of the family: free hands that must not come)
  let cons = [...S.villagers.values()].filter(o => o.set === set.id && o.role === 'construtor' && !ids.has(o.id) && o.age >= 16 && !o.captive && !o.jail && !o.aboard);
  if (!cons.length) { const o = [...S.villagers.values()].filter(q => q.set === set.id && q.age >= 18 && q.age < 55 && !ids.has(q.id) && !q.captive && !q.jail && !q.aboard && !(S.avatar && S.avatar.id === q.id)).sort((x, y) => x.id - y.id)[0]; if (o) { o.role = 'construtor'; o.job = 0; cons = [o]; } }
  const vistos = new Set(), estranhos = new Set(); const n0 = a.n0;
  const t = vive(1000, () => dePe(b), () => { if (b.encomenda) for (const o of naObra(b)) { vistos.add(o.id); if (!ids.has(o.id)) estranhos.add(o.id); } });
  if (!ok('c5c a cabana fica de pé', dePe(b) && t > 0, dePe(b) ? `de pé em ${t} s do mundo${jaAmplia(b)}; trabalharam nela: ${[...vistos].map(id => (P(id) ? P(id).name : '#' + id)).join(', ')}` : `no tempo do caso a obra ficou em ${Math.round((b.progress || 0) * 100)}%, faltando ${JSON.stringify(b.need)}; na obra: ${naObra(b).map(o => o.name).join(', ') || 'ninguém'}; os crescidos da família: ${fam.filter(m => m.age >= 16).map(m => `${m.name} ${m.task ? m.task.type : '-'}${m.sleeping ? ' (dorme)' : ''}`).join(', ')}`)) return;
  ok('c5d só a família trabalhou nela', vistos.size >= 1 && !estranhos.size && cons.length >= 1, `${vistos.size} da família na obra; de fora da família: ${estranhos.size ? [...estranhos].map(id => `${P(id) ? P(id).name : '#' + id} (${P(id) ? P(id).role : '?'})`).join(', ') : 'ninguém'}; construtores do povo na cidade que não são da família: ${cons.length}`);
  // (the loads of the hut: those before it stood — the ledger's line that builds its materials in, 'obra-feita')
  const feita = livro(n0, e => e[3] === 'o:' + b.id && e[8] === 'obra-feita')[0]; const ate = feita ? feita[0] : Infinity;
  const cargas = livro(n0, e => e[4] === 'o:' + b.id && e[0] < ate); const deQuem = new Set(cargas.map(e => e[9]));
  const saiu = livro(n0, e => e[3] === 'f:' + set.fac && e[5] === 'wood' && e[8] === 'obra' && ids.has(e[9]) && e[0] < ate).reduce((s, e) => s + e[6], 0);
  ok('c5e a madeira do armazém do povo, pelo livro, pelas mãos da família', cargas.length >= 1 && [...deQuem].every(id => ids.has(id)) && Math.abs(cargas.filter(e => e[5] === 'wood').reduce((s, e) => s + e[6], 0) - G.BDEF.hut.cost.wood) < 0.011 && saiu + 0.011 >= G.BDEF.hut.cost.wood,
    `${cargas.length} carga(s) à obra (${cargas.map(e => e[6] + ' ' + e[5]).join(', ')}), levadas por ${[...deQuem].map(id => (P(id) ? P(id).name : '#' + id)).join(', ')}; do armazém do povo saíram ${r2(saiu)} de madeira pelas mãos da família («obra»)`);
  const vivos = fam.filter(m => S.villagers.has(m.id));
  ok('c5f a família muda e é a dona', dePe(b) && vivos.every(m => m.home === b.id) && ids.has(b.dono) && !b.encomenda && Math.abs((b.custo || 0) - pago) < 0.011 && (v.moves || []).some(m => /com as próprias mãos/.test(m[1])), `${vivos.filter(m => m.home === b.id).length} de ${vivos.length} moram na ${lado(b)}; dono: ${P(b.dono) ? P(b.dono).name : 'o povo'}; custou-lhe ${b.custo}; «${(v.moves || []).map(m => m[1]).slice(-1)}»; a casa cheia ficou com ${mora(h).length} para ${camas(h)}`);
  const ao = livro(n0, e => e[5] === 'moedas' && e[8] === 'obra-casa' && e[3] === 'h:' + b.id && e[4] === 'f:' + set.fac).reduce((s, e) => s + e[6], 0);
  ok('c5g o que a família separou vai ao povo', Math.abs(ao - pago) < 0.011, `separadas na obra: ${pago}; ao tesouro do povo quando ficou de pé: ${r2(ao)} (o tesouro ${tes0.toFixed(2)} → ${moedas('f:' + set.fac).toFixed(2)})`);
  const c = checa(); ok('c5h verificador', c.ok, c.txt);
});

// ------------------------------ c6: save e load no meio ------------------------------
run('c6', () => {
  const a = obraDasMaos(); if (!ok('c6a a obra da família', !!a && !!a.b, a && a.b ? `${diz(a)}: ${lado(a.b)}` : diz(a))) return;
  const { v, fam } = a; let b = a.b; const id = b.id;
  vive(120, () => b.built || V.delivered(b).wood >= 3);
  if (!ok('c6b a obra no meio', !b.built, b.built ? 'a cabana ficou de pé antes do save (o caso não vale)' : `${Math.round((b.progress || 0) * 100)}%, com ${JSON.stringify(V.delivered(b))} entregue`)) return;
  const antes = { p: b.progress, need: JSON.stringify(b.need), enc: JSON.stringify(b.encomenda), moedas: moedas('h:' + id) };
  salva(); b = S.buildings.get(id);
  ok('c6c depois do load a obra é a mesma', !!b && !b.built && JSON.stringify(b.encomenda) === antes.enc && b.encomenda.maos === 1 && JSON.stringify(b.need) === antes.need && Math.abs(b.progress - antes.p) < 1e-9 && Math.abs(moedas('h:' + id) - antes.moedas) < 0.011 && K.waiting(P(v.id)) === b, b ? `${lado(b)}: ${Math.round(b.progress * 100)}%, a encomenda ${JSON.stringify(b.encomenda)} (antes: ${antes.enc})` : 'a obra SUMIU no load');
  S.time = 0.15; S.weather.storm = 0; const ids = new Set(fam.map(m => m.id)); const estranhos = new Set();
  const t = vive(1000, () => dePe(b), () => { if (b.encomenda) for (const o of naObra(b)) if (!ids.has(o.id)) estranhos.add(o.id); });
  ok('c6d a família acaba a cabana e muda', dePe(b) && !estranhos.size && fam.map(m => P(m.id)).filter(Boolean).every(m => m.home === b.id) && ids.has(b.dono), dePe(b) ? `de pé ${t} s depois do load${jaAmplia(b)}; de fora da família na obra: ${estranhos.size || 'ninguém'}; a família mora nela, dono ${P(b.dono) ? P(b.dono).name : 'o povo'}` : `não ficou de pé no tempo do caso (${Math.round((b.progress || 0) * 100)}%, falta ${JSON.stringify(b.need)})`);
  const c = checa(); ok('c6e verificador', c.ok, c.txt);
});

// ------------------------------ c7: a morte no meio ------------------------------
run('c7', () => {
  const a = obraDasMaos(); if (!ok('c7a a obra da família', !!a && !!a.b, a && a.b ? `${diz(a)}: ${lado(a.b)}` : diz(a))) return;
  const { set, v, fam, b } = a; const par = P(v.partner); const pequenos = fam.filter(m => m.age < 16);
  sim(() => V.kill(v, 'sick'));
  ok('c7b o chefe morre: a obra é do par', b.encomenda && b.encomenda.maos === 1 && b.encomenda.by === par.id && b.dono === par.id && !b.encomenda.fam.includes(v.id), `${v.name} morreu: a obra ${lado(b)} é de ${P(b.dono) ? P(b.dono).name : 'ninguém'} (encomenda por #${b.encomenda.by}, das mãos: ${b.encomenda.maos})`);
  const c1 = checa(); ok('c7c verificador', c1.ok, c1.txt);
  const t = vive(2000, () => dePe(b)); // (one grown one alone, in mourning: days of the world)
  const ficam = fam.filter(m => S.villagers.has(m.id));
  // (the widower alive: the hut is his. Dead too in the days of the case — the metrópole goes to war on its second day, and
  // in the tree with the M's second round Tenoch fell before the hut stood —: the people's builders ended it, as c7e has it,
  // and it is of who of the family lives in it, T-830)
  const vivo7 = S.villagers.has(par.id); const dono7 = vivo7 ? b.dono === par.id : ficam.some(m => m.id === b.dono);
  ok('c7d o par acaba a cabana e a família muda', dePe(b) && ficam.every(m => m.home === b.id) && dono7, dePe(b) ? `de pé em ${t} s${jaAmplia(b)}; ${ficam.filter(m => m.home === b.id).length} de ${ficam.length} da família moram nela; dono: ${P(b.dono) ? P(b.dono).name : 'o povo'}${vivo7 ? '' : ` (${par.name} também morreu nos dias do caso: a casa é de quem ficou)`}` : `não ficou de pé no tempo do caso (${Math.round((b.progress || 0) * 100)}%)`);
  // (the two grown ones die: the work is the people's builders' from that moment)
  const a2 = obraDasMaos(); if (!a2 || !a2.b) { ok('c7e os dois morrem', false, 'o caso não se armou de novo'); return; }
  const b2 = a2.b; const par2 = P(a2.v.partner); const crescidos = a2.fam.filter(m => m.age >= 16); madeira(a2.set, 60);
  sim(() => { for (const m of crescidos) V.kill(m, 'sick'); });
  const orf = a2.fam.filter(m => S.villagers.has(m.id));
  ok('c7e os crescidos morrem: a obra passa aos construtores', !!b2.encomenda && !b2.encomenda.maos && S.buildings.has(b2.id), `${crescidos.map(m => m.name).join(' e ')} morreram: a obra ${lado(b2)} ${b2.encomenda ? (b2.encomenda.maos ? 'CONTINUA das mãos da família' : 'é dos construtores do povo') : 'sem encomenda'}; ficaram ${orf.length} pequenos`);
  const c2 = checa(); ok('c7f verificador (sem obra de mãos sem mãos)', c2.ok, c2.txt);
  void par2;
  const t2 = vive(1400, () => dePe(b2));
  ok('c7g os construtores acabam, e os pequenos mudam (ou a casa é do povo)', dePe(b2) && (orf.length ? orf.filter(m => S.villagers.has(m.id)).every(m => m.home === b2.id) : !b2.dono), dePe(b2) ? `de pé em ${t2} s pelas mãos dos construtores; ${orf.length ? orf.filter(m => m.home === b2.id).length + ' de ' + orf.length + ' pequenos moram nela' : 'sem família: a casa é do povo'}` : `não ficou de pé no tempo do caso (${Math.round((b2.progress || 0) * 100)}%, falta ${JSON.stringify(b2.need)}; construtores na cidade: ${[...S.villagers.values()].filter(o => o.set === a2.set.id && o.role === 'construtor').length})`);
  const c3 = checa(); ok('c7h verificador', c3.ok, c3.txt);
});

// ------------------------------ c8: a conquista no meio ------------------------------
run('c8', () => {
  const a = obraDasMaos(); if (!ok('c8a a obra da família', !!a && !!a.b, a && a.b ? `${diz(a)}: ${lado(a.b)}` : diz(a))) return;
  const { set, v, fam, b } = a; const outro = G.Fac.all().find(f => f.alive && f.id !== set.fac);
  if (!ok('c8b outro povo', !!outro, outro ? `${outro.name} toma ${set.name}` : 'não há outro povo vivo')) return;
  sim(() => G.War.conquer(set, { fac: outro.id, loot: { food: 0, wood: 0, stone: 0 }, members: [], captives: [], campaign: null }));
  const cativos = fam.filter(m => S.villagers.has(m.id) && P(m.id).captive).length; const vivos = fam.filter(m => S.villagers.has(m.id)).length;
  sim(() => K.day(set));
  const maos = fam.filter(m => S.villagers.has(m.id) && m.age >= 16 && !m.captive && m.set === set.id).length;
  const c1 = checa();
  ok('c8c a obra depois da conquista', S.buildings.has(b.id) ? (!!b.encomenda && (maos ? b.encomenda.maos === 1 : !b.encomenda.maos)) : true, `${set.name} é de ${G.Fac.get(set.fac).name}; da família (${vivos} vivos), ${cativos} cativos e ${maos} crescidos livres na cidade: a obra ${S.buildings.has(b.id) ? (b.encomenda && b.encomenda.maos ? 'segue das mãos da família' : 'passou aos construtores do povo que a tomou') : 'se perdeu com a conquista'}`);
  ok('c8d verificador', c1.ok, c1.txt);
  madeira(set, 60);
  const t = vive(1400, () => !S.buildings.has(b.id) || dePe(b));
  const livres = fam.filter(m => S.villagers.has(m.id) && !m.captive && m.set === set.id);
  // (a work that left the ground left it by a rule that says so in the family's diary: the commission nobody laid a hand on
  // in K.MAX_WAIT days — a town at war: its people called to arms, hiding in the cave — is given back, and the family, still
  // in the full house, is asked again (D-238); or the fire, the war took it)
  const saiu = !S.buildings.has(b.id); const dito = saiu ? fam.filter(m => S.villagers.has(m.id)).map(m => ((m.diary || []).filter(e => /A obra da nossa casa (nunca começou|se perdeu)/.test(e.txt)).slice(-1)[0] || {}).txt).find(Boolean) : '';
  ok('c8e a obra acaba: da família livre, ou do povo', saiu ? !!dito && !K.waiting(v) : (dePe(b) && (livres.length ? livres.every(m => m.home === b.id) : !b.dono || !S.villagers.has(b.dono) || true)), saiu ? `a obra saiu do chão no dia ${S.day} — no diário da família: «${dito || 'NADA DITO'}»; a família mora na ${lado(S.buildings.get(v.home))} e precisa de casa: ${K.need(v) || 'não'}` : dePe(b) ? `de pé em ${t} s${jaAmplia(b)}; ${livres.length ? livres.filter(m => m.home === b.id).length + ' de ' + livres.length + ' da família (livres) moram nela' : 'sem família livre: a casa é ' + (b.dono ? 'de #' + b.dono : 'do povo')}` : `não ficou de pé no tempo do caso (${Math.round((b.progress || 0) * 100)}%, falta ${JSON.stringify(b.need)})`);
  const c2 = checa(); ok('c8f verificador', c2.ok, c2.txt);
  void v;
});

// ------------------------------ c9: falta madeira ------------------------------
run('c9', () => {
  const a = arma({ maos: true }); if (!ok('c9a a casa cheia', !!a, diz(a))) return;
  const { set, v, h } = a; const f = G.Fac.get(set.fac);
  semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 6);
  sim(() => K.day(set)); h.poupa.d -= K.HANDS_DAYS;
  const r1 = K.road(v); sim(() => K.day(set));
  ok('c9b sem madeira de sobra, nada começa, e o diário diz', r1.kind === '' && r1.why === 'madeira' && !K.waiting(v) && /o povo não tem madeira de sobra/.test(diario(v)) && /não tem madeira de sobra/.test(K.fullSays(h, id => P(id).name, s => s)), `o povo tem ${D.get('f:' + set.fac, 'wood')} de madeira (uma cabana pede ${G.BDEF.hut.cost.wood}): a estrada «${r1.kind || '-'}» (${r1.why}); a obra: ${lado(K.waiting(v))}; no diário: «${diario(v)}»`);
  // (the timber the people's ships keep is not to spare)
  madeira(set, 25); const rsv0 = f._rsv; f._rsv = 20; const r2_ = K.road(v); const sobra = K.spare(set, 'wood'); sim(() => K.day(set)); const semObra = !K.waiting(v); f._rsv = rsv0 || 0;
  ok('c9c a madeira guardada para os navios não é sobra', r2_.why === 'madeira' && sobra < G.BDEF.hut.cost.wood && semObra, `25 de madeira no armazém, 20 guardados para um navio: a sobra é ${sobra}; a estrada «${r2_.kind || '-'}» (${r2_.why || ''}); a obra: ${semObra ? 'nenhuma' : 'COMEÇOU'}`);
  madeira(set, 30); const r3 = K.road(v); sim(() => K.day(set));
  ok('c9d com madeira, começa', r3.kind === 'maos' && !!K.waiting(v) && K.waiting(v).encomenda.maos === 1, `30 de madeira: a estrada «${r3.kind}»; a obra: ${lado(K.waiting(v))}`);
  const c = checa(); ok('c9e verificador', c.ok, c.txt);
});

// ------------------------------ c10: falta chão ------------------------------
run('c10', () => {
  const a = arma({ maos: true }); if (!ok('c10a a casa cheia', !!a, diz(a))) return;
  const { set, v, h } = a;
  semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 40);
  sim(() => K.day(set)); h.poupa.d -= K.HANDS_DAYS;
  const find0 = V.findSite; let perguntas = 0; V.findSite = function (s, type) { if (type === 'hut') { perguntas++; return null; } return find0.apply(this, arguments); };
  const predios = S.buildings.size; const pot = moedas('h:' + h.id);
  try { sim(() => K.day(set)); } finally { V.findSite = find0; }
  ok('c10b sem chão, nada começa', !K.waiting(v) && S.buildings.size === predios && perguntas >= 1 && Math.abs(moedas('h:' + h.id) - pot) < 0.011 && h.poupa && h.poupa.chao === S.day, `a cidade não deu lote (${perguntas} busca(s)): a obra: ${lado(K.waiting(v))}; prédios ${predios} → ${S.buildings.size}; a casa guarda o dia sem chão: ${h.poupa ? h.poupa.chao : '?'}`);
  ok('c10c o diário e a ficha dizem', /não tem chão livre/.test(diario(v)) && /não tem chão livre/.test(K.fullSays(h, id => P(id).name, s => s)), `no diário: «${diario(v)}»; na ficha: «${K.fullSays(h, id => P(id).name, s => s).replace(/<[^>]+>/g, '')}»`);
  set._noSite = {}; sim(() => K.day(set));
  ok('c10d com chão, a família tenta de novo e começa', !!K.waiting(v) && K.waiting(v).encomenda.maos === 1, `a obra: ${lado(K.waiting(v))}`);
  const c = checa(); ok('c10e verificador', c.ok, c.txt);
});

// ------------------------------ c11: o corpo do deus na família ------------------------------
run('c11', () => {
  const a = arma({ maos: true }); if (!ok('c11a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, h } = a; const par = P(v.partner);
  semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 40);
  sim(() => K.day(set)); h.poupa.d -= K.HANDS_DAYS;
  const corpo = [par, v].find(o => G.Possess.can(o).ok);
  if (!ok('c11b o deus vive alguém da família', !!corpo && G.Possess.take(corpo).ok, corpo ? `o deus vive ${corpo.name} #${corpo.id}, ${corpo === v ? 'a cabeça da família na fila' : 'o par de ' + v.name}` : 'ninguém da família pode ser vivido')) return;
  sim(() => K.day(set));
  ok('c11c com o corpo, o dia não decide pela família', !K.waiting(v) && fam.every(m => m.home === h.id), `a obra: ${lado(K.waiting(v))}; a família mora na ${lado(S.buildings.get(v.home))}`);
  const can = K.can(corpo); const d = V.nearestDropoff(corpo.x, corpo.y, corpo.set); const ft = d ? V.frontTile(d) : null;
  const of = ft ? A.offers(corpo, ft[0], ft[1], 2.5).find(o => /^casa\.encomendar/.test(o.id)) : null;
  ok('c11d a oferta diz o caminho', can.ok && can.hands === 'hut' && !!of && of.ok && /com as nossas mãos/.test(of.label), `a oferta no armazém: «${of ? of.label : 'NENHUMA'}» (${of && of.ok ? 'acesa' : 'apagada' + (of ? ': ' + of.why : '')}); o que a decisão diria: ${JSON.stringify({ ok: can.ok, hands: can.hands, price: can.price })}`);
  const r = of ? sim(() => A.perform(corpo, of)) : { ok: false, why: 'sem oferta' }; const b = K.waiting(corpo);
  ok('c11e o corpo pede, e a obra é da família', r.ok && !!b && b.encomenda.maos === 1 && b.encomenda.fam.includes(corpo.id) && /com as próprias mãos/.test(r.msg || ''), r.ok ? `«${r.msg}»; a obra: ${lado(b)}, das mãos da família (${b ? b.encomenda.fam.length : 0})` : `o pedido não deu: ${r.why}`);
  // (the others of the family raise it; the body is never sent — its hands are the player's)
  const outros = fam.filter(m => m.age >= 16 && m.id !== corpo.id); let corpoMandado = false;
  const t = b ? vive(1000, () => dePe(b), () => { if (corpo.task && corpo.task.type === 'build') corpoMandado = true; }) : -1;
  ok('c11f os outros crescidos levantam; o corpo não é mandado', !!b && !corpoMandado && (outros.length ? dePe(b) : true), b ? `${outros.length} outro(s) crescido(s) na família: ${dePe(b) ? 'a cabana ficou de pé em ' + t + ' s' : 'a obra em ' + Math.round((b.progress || 0) * 100) + '%'}; o corpo ${corpoMandado ? 'FOI MANDADO à obra' : 'ficou nas mãos do jogador'}` : 'sem obra');
  G.Possess.release('deus');
  const c = checa(); ok('c11g verificador', c.ok, c.txt);
});

// ------------------------------ c12: a casa vazia do povo que aparece no meio ------------------------------
run('c12', () => {
  const a = arma({ maos: true }); if (!ok('c12a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, h } = a;
  semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 40);
  sim(() => K.day(set));
  const pos = sim(() => V.findSite(set, 'hut')); const nova = pos && !pos.demolish ? sim(() => V.addBuilding('hut', pos[0], pos[1], set.id, true)) : null;
  if (!ok('c12b na paciência, aparece uma casa vazia do povo', !!nova && !K.waiting(v) && K.road(v).kind === 'cede', nova ? `a mão da prova pôs ${lado(nova)} vazia, do povo; a estrada agora: «${K.road(v).kind}»` : 'a cidade não achou lugar para a casa da prova')) return;
  sim(() => K.day(set));
  ok('c12c é dada, sem esperar a paciência nem levantar outra', fam.every(m => m.home === nova.id) && nova.dono === v.id && !K.waiting(v), `a família mora na ${lado(S.buildings.get(v.home))} (dona: ${P(nova.dono) ? P(nova.dono).name : 'o povo'}); obra: ${lado(K.waiting(v))}`);
  // (with the family's own work under way: it finishes its own)
  const a2 = obraDasMaos(); if (!a2 || !a2.b) { ok('c12d a obra da família', false, 'o caso não se armou de novo'); return; }
  const pos2 = sim(() => V.findSite(a2.set, 'hut')); const nova2 = pos2 && !pos2.demolish ? sim(() => V.addBuilding('hut', pos2[0], pos2[1], a2.set.id, true)) : null;
  sim(() => K.day(a2.set));
  ok('c12d com a obra da família de pé, a casa do povo fica', !!nova2 && !nova2.dono && !mora(nova2).length && K.waiting(a2.v) === a2.b && a2.fam.every(m => m.home === a2.h.id), nova2 ? `a ${lado(nova2)} do povo: dono ${nova2.dono || 'o povo'}, ${mora(nova2).length} moradores; a família espera a sua ${lado(K.waiting(a2.v))}` : 'sem lugar para a casa da prova');
  const t = vive(2000, () => dePe(a2.b)); // (days of the world: the metrópole goes to war on the second day of the case — 93% at 1 000 s, T-980)
  ok('c12e a família acaba a sua e muda para ela', dePe(a2.b) && a2.fam.filter(m => S.villagers.has(m.id)).every(m => m.home === a2.b.id), dePe(a2.b) ? `de pé em ${t} s${jaAmplia(a2.b)}; a família mora na ${lado(a2.b)}` : `não ficou de pé (${Math.round((a2.b.progress || 0) * 100)}%)`);
  const c = checa(); ok('c12f verificador', c.ok, c.txt);
});

// ------------------------------ c13: quem não vai por esta estrada ------------------------------
run('c13', () => {
  // (1) the family alone in the house it has: nothing by hand
  abre(); const so = sozinha();
  if (ok('c13a a família sozinha na casa que tem', !!so, so ? `${so.set.name}: ${so.o.name}, com a família sozinha na sua ${lado(so.b)} (${mora(so.b).length} para ${camas(so.b)}; ${so.como})` : `nenhuma família sozinha numa casa sua em ${MUNDO}`)) {
    const { set, b, o } = so;
    try {
      semVazias(o, set); calaFila(set, o); poe('h:' + b.id, 0); madeira(set, 40);
      sim(() => K.day(set)); if (b.poupa) b.poupa.d -= K.HANDS_DAYS + 3; const rd = K.road(o); sim(() => K.day(set));
      ok('c13b não levanta nada com as mãos', rd.kind === '' && rd.why === 'so' && !K.waiting(o), `a estrada: «${rd.kind || '-'}» (${rd.why}); a obra: ${lado(K.waiting(o))}; na ficha: «${K.fullSays(b, id => P(id).name, s => s).replace(/<[^>]+>/g, '')}»`);
    } finally { so.desfaz(); }
  }
  // (2) a people without coin: the old road — the people raise it, with their builders
  const a = arma({ maos: true }); if (!ok('c13c a casa cheia', !!a, diz(a))) return;
  { const { set, v, h } = a; semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 60); D.make('f:' + set.fac, 'stone', 60, { code: 'teste' });
    const coin0 = E.coinage; E.coinage = fid => (fid === set.fac ? false : coin0(fid)); let rd, b;
    try { rd = K.road(v); sim(() => K.day(set)); b = K.waiting(v); } finally { E.coinage = coin0; }
    ok('c13d no povo sem moeda, a estrada de antes', rd.kind === '' && (!b || !b.encomenda.maos), `sem a moeda (segura pela mão da prova): a estrada «${rd.kind || '-'}»; ${b ? 'o povo levanta ' + lado(b) + ' com os seus construtores (das mãos: ' + (b.encomenda.maos || 0) + ', pago: ' + b.encomenda.paid + ')' : 'nenhuma obra hoje'}`); }
  // (3) who has the price pays for a house, as before
  const a3 = arma({ maos: true }); if (!a3) { ok('c13e quem tem o preço', false, 'o caso não se armou'); return; }
  { const { set, v, h } = a3; semVazias(v, set); calaFila(set, v); madeira(set, 60); D.make('f:' + set.fac, 'stone', 60, { code: 'teste' });
    for (const o of [...S.buildings.values()]) if (o.set === set.id && o.encomenda && !o.built) sim(() => V.completeBuilding(o));
    const preco = K.plan(v, null, set, null, a3.why).price; poe('h:' + h.id, preco * 1.6 + K.KEEP + 4); if (h.poupa) h.poupa.d -= K.HANDS_DAYS + 1; const n0 = S.ledgerN || 0;
    sim(() => K.day(set)); const b = K.waiting(v); const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'obra-casa');
    ok('c13e quem tem o preço paga os materiais de uma casa', !!b && !b.encomenda.maos && b.encomenda.paid > G.BDEF.hut.cost.wood * E.PRICE.wood + 0.5 && pg.length === 1, b ? `${lado(b)} encomendada aos construtores por ${b.encomenda.paid} moedas (das mãos: ${b.encomenda.maos || 0})` : `nenhuma obra: ${JSON.stringify(sim(() => K.can(v)))}`); }
  // (4) the family that would live more crowded in a hut than where it is; (5) too many huts of hands under way in the town
  // (the case's house by the hand of the proof, or — where no town gives one a little too full — a hut of fewer beds for a moment)
  const a4 = arma({ aperta: true }) || arma({ maos: true }); if (!ok('c13f a casa cheia', !!a4, diz(a4))) return;
  { const { set, v, h, fam } = a4; semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 40);
    sim(() => K.day(set)); if (h.poupa) h.poupa.d -= K.HANDS_DAYS + 1;
    const agora = mora(h).length / camas(h); const hb = G.BDEF.hut.housing; let n = hb; while (n > 1 && fam.length / n <= agora + 1e-9) n--;
    let rd, obra, ficha; G.BDEF.hut.housing = n; try { rd = K.road(v); sim(() => K.day(set)); obra = K.waiting(v); ficha = K.fullSays(h, id => P(id).name, s => s).replace(/<[^>]+>/g, ''); } finally { G.BDEF.hut.housing = hb; }
    ok('c13f a cabana só para quem não ficaria mais apertado nela', fam.length / n > agora + 1e-9 && rd.kind === '' && rd.why === 'pequena' && !obra && /viveria mais apertada/.test(ficha), `a família de ${fam.length} vive a ${agora.toFixed(2)} por cama; numa cabana de ${n} camas${n !== hb ? ' (a mão da prova: a cabana tem ' + hb + ')' : ''}, a ${(fam.length / n).toFixed(2)}: a estrada «${rd.kind || '-'}»${rd.why ? ' (' + rd.why + ')' : ''}; a obra: ${lado(obra)}; na ficha: «${ficha}»`); }
  const a5 = arma({ maos: true }); if (!a5) { ok('c13g cabanas demais em obra', false, 'o caso não se armou'); return; }
  { const { set, v, h } = a5; semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 40); sim(() => K.day(set)); h.poupa.d -= K.HANDS_DAYS;
    const mh = K.MAX_HANDS; K.MAX_HANDS = 0; let rd, b, dz; try { rd = K.road(v); sim(() => K.day(set)); b = K.waiting(v); dz = diario(v); } finally { K.MAX_HANDS = mh; }
    ok('c13g com cabanas demais em obra na cidade, espera', rd.kind === '' && rd.why === 'obras' && !b && /cabanas demais/.test(dz), `com o teto das cabanas de mãos a zero: a estrada «${rd.kind || '-'}» (${rd.why}); a obra: ${lado(b)}; no diário: «${dz}»`); }
  const c = checa(); ok('c13h verificador', c.ok, c.txt);
});

// ------------------------------ c14: a tela só lê ------------------------------
run('c14', () => {
  const a = arma({ maos: true }); if (!ok('c14a a casa cheia', !!a, diz(a))) return;
  const { set, v, h } = a; semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 1); madeira(set, 40); sim(() => K.day(set)); h.poupa.d -= K.HANDS_DAYS;
  M.viver(1);
  // (the world's canon, and every mark of the houses whole: who owns, who waits, who rents, who saves and since when, the cost)
  const casas = () => JSON.stringify([...S.buildings.values()].map(b => [b.id, b.dono || 0, b.encomenda || 0, b.aluga || 0, b.poupa || 0, b.custo || 0, b.res || 0]));
  const antes = JSON.stringify(QA.canon()) + casas(); const rng = JSON.stringify(S.rng); const nos = JSON.stringify(set._noSite || {}); let n = 0;
  for (const o of S.villagers.values()) if (o.set === set.id && o.age >= 16) { A.diary(o); K.road(o); K.can(o); n++; }
  let fichas = 0; for (const b of S.buildings.values()) if (b.set === set.id && b.built && housing(b)) { const t = E.buildingHTML(b, id => String(id), s => String(s)); if (/Casa cheia/.test(t)) fichas++; }
  const d = V.nearestDropoff(v.x, v.y, v.set); const ft = V.frontTile(d); A.offers(v, ft[0], ft[1], 2.5);
  const depois = JSON.stringify(QA.canon()) + casas();
  ok('c14b o diário, a estrada, a oferta e a ficha não mudam o mundo', antes === depois && rng === JSON.stringify(S.rng) && nos === JSON.stringify(set._noSite || {}) && fichas >= 1, `${n} diários, estradas e ofertas e ${fichas} ficha(s) de casa cheia lidos em ${set.name}: o mundo ${antes === depois ? 'igual' : 'MUDOU'}; o acaso do mundo ${rng === JSON.stringify(S.rng) ? 'igual' : 'MUDOU'}; a busca de lotes do dia ${nos === JSON.stringify(set._noSite || {}) ? 'igual' : 'MUDOU'}`);
});

// ------------------------------ c15: o mundo ------------------------------
run('c15', () => {
  abre(); const ANOS = +(process.env.ANOS || 6); const d0 = S.day;
  const desde = new Map(); let pior = 0, piorQ = '', casasDia = 0, dobroDia = 0, cedidas = 0, maos = 0; const vistas = new Set(); const ruins = [];
  // (and the need of them, as the world had it: a family the day of the town could send down one road — the people's empty house,
  // given that same day, or its own hands with no more days to wait (G.Casa.road, read only) —, counted once a day; in a world that
  // never had one there is no road to walk, and it is said: the «cidade» of the generation 20 had no family over its house's beds
  // nor out of doors in six years, T-998)
  // (the road the town's day walks: the order takes it only for a family short of the price — one with it buys the people's
  // empty house or pays for a new one (K.order) —, never for one that waits for its house already, let it go for now or has the
  // god's body among its grown ones; and only on a day the jump lives: the look at the turn of the last day ends the jump, and no
  // town has its day after it. The T-998 measured: its two family-days were both of day 20, the turn that ends the six years —
  // and one, Halfdan's of Hedeby, had 10.40 coins for a hut of 5.47 —; lived one day more, the town's day gave the people's hut to
  // Máximo's family in Roma and sold Halfdan the one of Hedeby. T-1003)
  let precisou = 0, noFim = 0;
  const aberta = v => {
    const rd = K.road(v); if (!(rd.kind === 'cede' || (rd.kind === 'maos' && !rd.wait))) return false;
    const fam = K.family(v); if (K.waiting(v) || K.gaveUp(v) || fam.some(m => m.age >= 16 && A.isBody(m))) return false;
    return K.savings(v) + 1e-6 < K.plan(v, fam, S.settlements.get(v.set), null, K.need(v)).price + K.KEEP;
  };
  const olha = vive => {
    pega(); const res = new Map(); for (const v of S.villagers.values()) if (v.home && !v.captive) { const l = res.get(v.home); if (l) l.push(v); else res.set(v.home, [v]); }
    const agora = new Set();
    for (const b of S.buildings.values()) {
      if (!b.built || !housing(b) || b.type === 'barraco' || b.type === 'ruin') continue; casasDia++;
      const L = res.get(b.id) || []; if (L.length < 2 * camas(b)) continue;
      const seen = new Set(); let fams = 0; for (const v of L) { if (v.age < 16 || seen.has(v.id)) continue; const fm = K.family(v); for (const m of fm) seen.add(m.id); if (fm.length > 1) fams++; }
      if (fams < 2) continue; // (one family alone: no one to leave — c13)
      dobroDia++; agora.add(b.id); if (!desde.has(b.id)) desde.set(b.id, S.day);
      const n = S.day - desde.get(b.id); if (n > pior) { pior = n; piorQ = `${lado(b)} de ${S.settlements.get(b.set).name}, ${L.length} para ${camas(b)}, desde o dia ${desde.get(b.id)}`; }
    }
    for (const id of [...desde.keys()]) if (!agora.has(id)) desde.delete(id);
    for (const v of S.villagers.values()) for (const m of v.moves || []) { const k = v.id + ':' + m[0] + ':' + m[1]; if (vistas.has(k)) continue; vistas.add(k); if (m[0] <= d0) continue; if (/recebeu do povo/.test(m[1])) cedidas++; if (/com as próprias mãos/.test(m[1])) maos++; }
    for (const q of QA.check()) if (q.sys === 'casa-cheia' && q.sev <= 3 && !/sem um crescido dela na cidade/.test(q.msg) && ruins.length < 6) ruins.push(`dia ${S.day} S${q.sev}: ${q.msg.slice(0, 200)}`);
    { const fs = new Set(); for (const v of S.villagers.values()) { if (v.age < 16 || v.captive || fs.has(v.id)) continue; for (const m of K.family(v)) fs.add(m.id); if (aberta(v)) { if (vive) precisou++; else noFim++; } } }
  };
  olha(true); let d = S.day;
  G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3;
  try { while (G.S.day - d0 < ANOS) { G.Main.skipStep(1); if (G.S.day !== d) { d = G.S.day; olha(G.S.day - d0 < ANOS); } } } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; }
  pega();
  ok('c15a o verificador da casa cheia, a cada dia do salto', !ruins.length, ruins.length ? ruins.join(' · ') : `${ANOS} anos de salto em ${MUNDO} (dia ${d0} → ${S.day}, ${S.villagers.size} pessoas): nenhuma regra da casa cheia acusada em nenhum dia`);
  const LIM = K.HANDS_DAYS + 6;
  ok('c15b nenhuma casa de várias famílias fica com o dobro além da paciência e da vez', pior <= LIM, `casas-dia ${casasDia}, das quais ${dobroDia} de várias famílias com o dobro da lotação; a que mais durou assim: ${pior} dia(s)${piorQ ? ' (' + piorQ + ')' : ''} (o limite da prova: ${LIM}); casas dadas pelo povo: ${cedidas}; cabanas levantadas com as próprias mãos: ${maos}`);
  ok('c15c as duas estradas foram andadas onde o mundo precisou delas', !precisou || cedidas + maos >= 1, `${cedidas} casa(s) do povo dada(s) e ${maos} cabana(s) das mãos de famílias nos ${ANOS} anos; famílias-dia com uma estrada aberta: ${precisou}${precisou ? '' : ' — o mundo não precisou delas (nenhuma família acima das camas nem ao relento, sem o preço, com uma estrada aberta)'}${noFim ? `; e ${noFim} na virada do último dia, que o salto não vive` : ''}`);
  const c = checa(); ok('c15d verificador e erros', c.ok, c.txt);
  const k = salva(); const c2 = checa(); ok('c15e save e load no fim', c2.ok, `${k} caracteres; ${c2.txt}`);
});

// ------------------------------ c16: o par que chega depois (L-719) ------------------------------
// One house for a family, by any door: the family's own hut answers to the same question as a paid house (K.waiting). The
// one who ordered it is left alone with the little ones (the partner dies), and marries again with the work under way: the new
// partner, who came to the full house after, is not written in the work.
run('c16', () => {
  const a = arma({ maos: true, dobro: true }) || arma({ maos: true }); if (!ok('c16a a casa cheia', !!a, diz(a))) return;
  const { set, v, h, hB } = a; const q = P(v.partner);
  // (the test's hand, before the work is ordered: the two live apart — the partner in the house the family had, the one the
  // day asks alone with the little ones in the full house)
  sim(() => G.Vg.endTask(q)); v.partner = 0; q.partner = 0; q.home = hB.id; q.hhType = hB.type; q.hh = hB.id; hB.dono = q.id; hB.res = 1; h.res = mora(h).length;
  semVazias(v, set); calaFila(set, v); poe('h:' + h.id, 0); madeira(set, 40);
  sim(() => K.day(set)); if (h.poupa) h.poupa.d -= K.HANDS_DAYS; sim(() => K.day(set));
  const b = K.waiting(v);
  if (!ok('c16b a obra das mãos, marcada por quem está só', !!b && b.encomenda.maos === 1 && !b.encomenda.fam.includes(q.id) && b.encomenda.fam.includes(v.id), b ? `${v.name}, só com os pequenos na casa cheia (${mora(h).length} para ${camas(h)}; «${K.need(v) || a.why}»), marcou ${lado(b)}: escritos ${JSON.stringify(b.encomenda.fam)} — ${q.name} #${q.id} não` : `${v.name} não marcou obra: precisa de casa «${K.need(v) || 'não'}», a estrada ${JSON.stringify(K.road(v))}`)) return;
  // (the marriage, with the work under way: the partner comes to live in the full house; the house it leaves is the people's, empty)
  v.partner = q.id; q.partner = v.id; q.home = h.id; q.hhType = h.type; q.hh = h.id; h.res = mora(h).length; hB.res = 0; hB.dono = 0; hB.aluga = null; const nova = hB;
  const obras = () => [...S.buildings.values()].filter(o => o.encomenda && !o.built && (o.encomenda.fam.includes(v.id) || o.encomenda.fam.includes(q.id))).length;
  const duas = () => QA.check().filter(x => /espera duas casas/.test(x.msg)).map(x => x.msg.slice(0, 120));
  // (asked by every door: the decision, the body's — with coins, with a house of the people's empty —, the town's day twice)
  poe('h:' + h.id, 60); const r1 = sim(() => K.order(q)); const r2 = sim(() => K.order(q, { now: true })); const can = K.can(q);
  poe('h:' + h.id, 0); const r3 = sim(() => K.order(q)); sim(() => K.day(set)); sim(() => K.day(set));
  ok('c16c não pede outra casa por nenhuma porta', K.waiting(q) === b && !r1.ok && !r2.ok && !r3.ok && /sendo levantada/.test(r1.why + r2.why + r3.why) && !can.ok && obras() === 1 && !duas().length && (!nova || (!nova.dono && !mora(nova).length)) && q.home === h.id,
    `${q.name}, que veio morar com ${v.name} depois da obra marcada (precisa de casa: ${K.need(q) || 'não'}), espera ${lado(K.waiting(q))}; com moedas, pedindo: «${r1.ok ? 'ENCOMENDOU' : r1.why}»; pelo corpo: «${r2.ok ? 'ENCOMENDOU' : r2.why}»; sem moedas e com uma casa vazia do povo${nova ? '' : ' (sem lugar para ela)'}: «${r3.ok ? 'TOMOU' : r3.why}»; depois de dois dias da cidade: ${obras()} obra(s) da família${nova ? ', a casa do povo com ' + mora(nova).length + ' moradores' : ''}; no diário de ${q.name}: «${diario(q)}»${duas().length ? '; o verificador: ' + duas()[0] : ''}`);
  // (the new partner raises the hut with the family, and goes to live in it with it)
  const visto = new Set(); const estranhos = new Set(); const ids = new Set(b.encomenda.fam.concat([q.id])); const n0 = S.ledgerN || 0;
  S.time = 0.15; const t = vive(1000, () => dePe(b), () => { if (b.encomenda) for (const o of naObra(b)) { visto.add(o.id); if (!ids.has(o.id)) estranhos.add(o.id); } });
  const cargas = livro(n0, e => e[4] === 'o:' + b.id && e[9] === q.id).length;
  ok('c16d o par trabalha na cabana da família', dePe(b) && !estranhos.size && (visto.has(q.id) || cargas > 0), dePe(b) ? `de pé em ${t} s${jaAmplia(b)}; na obra: ${[...visto].map(id => (P(id) ? P(id).name : '#' + id)).join(', ')} (${q.name}: ${visto.has(q.id) ? 'trabalhou' : 'NÃO foi visto'}, ${cargas} carga(s)); de fora da família: ${estranhos.size || 'ninguém'}` : `não ficou de pé no tempo do caso (${Math.round((b.progress || 0) * 100)}%)`);
  const fam = K.family(v);
  ok('c16e e muda com ela', dePe(b) && q.home === b.id && v.home === b.id && fam.includes(q) && fam.every(m => m.home === b.id), `${v.name} mora na ${lado(S.buildings.get(v.home))}, ${q.name} na ${lado(S.buildings.get(q.home))}; a família de agora (${fam.length}) inteira na cabana: ${fam.every(m => m.home === b.id) ? 'sim' : 'NÃO'}`);
  const c = checa(); ok('c16f verificador', c.ok, c.txt);
});

// ============================== a segunda rodada: D-235 a D-238, L-973, L-974 ==============================
const nome = id => (P(id) ? P(id).name : '#' + id);
const ficha = b => K.fullSays(b, nome, s => s).replace(/<[^>]+>/g, '');
// A family alone in a house over its beds with grown single children, by the test's hand: in a town of coin, a family alone
// in the house it owns, too many for it — its eldest children made eighteen and more (their age; a little one stays). n: how
// many; dobro: the house at twice its beds (true), short of it (false), either. → { set, h, pais, g (the grown ones, the
// eldest first), v (the one of them the town's day asks: the youngest), todos }
function mocos(n, dobro) {
  abre(); const cands = [];
  for (const set of [...S.settlements.values()].filter(s => E.coinage(s.fac)).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id)) {
    for (const F of familias(set, 2)) {
      if ((F.h.dono !== F.v.id && F.h.dono !== F.p.id) || F.h.elite || F.h.w !== 1) continue;
      // (the couple and their children alone in the house — those of sixteen and seventeen too, grown but not yet the ones the
      // housing sends away)
      const L = mora(F.h); const kids = L.filter(m => m !== F.v && m !== F.p).sort((a, c) => c.age - a.age || a.id - c.id);
      if (kids.length < n + 1 || kids.some(m => m.age >= 18 || m.partner || (m.mother !== F.v.id && m.father !== F.p.id) || m.jail || m.aboard || (S.avatar && S.avatar.id === m.id))) continue;
      cands.push({ set, F, L, kids, over: L.length > camas(F.h), dbl: L.length >= 2 * camas(F.h) });
    }
  }
  // (one the world has; else one that fits the house it has, put by the test's hand in a hut of the people's raised empty for
  // the case — the family its owner, what was its own with it by the ledger, the house it had taken down: too many for the
  // four beds of a hut. The beds of a type made fewer for the case changed the plan of every house of the type: T-984)
  let c = cands.find(q => q.over && (dobro === undefined || dobro === q.dbl)); let como = '';
  if (!c) {
    for (const q of cands.filter(x => !x.over && x.L.length > G.BDEF.hut.housing && (dobro === undefined || dobro === (x.L.length >= 2 * G.BDEF.hut.housing)))) {
      const pos = sim(() => V.findSite(q.set, 'hut')); const hut = pos && !pos.demolish ? sim(() => V.addBuilding('hut', pos[0], pos[1], q.set.id, true)) : null; if (!hut) continue;
      const old = q.F.h; sim(() => { for (const m of q.L) if (m.inside === old.id) G.Vg.endTask(m); });
      for (const m of q.L) { m.home = hut.id; m.hhType = hut.type; m.hh = hut.id; m.inside = 0; m.sleeping = false; }
      for (const [k, x] of Object.entries(D.list('h:' + old.id))) if (x > 1e-6) D.move('h:' + old.id, 'h:' + hut.id, k, x, { code: 'teste', part: true, floor: true });
      hut.dono = old.dono; hut.res = q.L.length; hut.custo = 0; tira(old);
      q.F.h = hut; q.over = true; q.dbl = q.L.length >= 2 * camas(hut); c = q; como = `; a família foi posta pela mão da prova numa cabana do povo levantada vazia para o caso — a ${old.type}#${old.id} que tinha, onde cabia, desfeita`; break;
    }
  }
  if (!c) return null;
  const g = c.kids.slice(0, n); g.forEach((m, k) => { m.age = 18.2 + (n - 1 - k) * 1.5; });
  c.F.h.poupa = null; c.F.h.res = c.L.length; VIVE.set = c.set;
  const e = K.queue(c.set).find(q => q[0].home === c.F.h.id && g.includes(q[0]));
  return { set: c.set, h: c.F.h, pais: [c.F.v, c.F.p], g, v: e ? e[0] : null, todos: c.L.length, como };
}
function quieta(a, pais) {
  calaFila(a.set, a.v); if (pais !== false) for (const p of a.pais) sim(() => K.giveUp(p));
  semVazias(a.v, a.set); poe('h:' + a.h.id, 0); for (const m of mora(a.h)) if (m.purse > 0) poe('p:' + m.id, 0); madeira(a.set, 40);
}
const dizM = a => (a ? `${a.set.name}: a ${lado(a.h)} de ${nome(a.h.dono)}, ${a.todos} para ${camas(a.h)} camas — os pais, ${a.todos - 2 - a.g.length} pequeno(s) e ${a.g.length} crescido(s) sem par (${a.g.map(m => `${m.name}, ${Math.floor(m.age)}`).join('; ')}: a idade pela mão da prova${a.como}); o dia pergunta ${a.v ? a.v.name : 'NENHUM deles'}` : `nenhuma família sozinha, grande demais para a casa e com filhos para o caso, em ${MUNDO}`);
// (the hut of the grown single ones of a case, marked: the queue quiet, no coin in the house, wood in the store, the days of
// patience gone by the test's hand)
function obraDosMocos(n, dobro) {
  const a = mocos(n, dobro); if (!a || !a.v) return a;
  quieta(a);
  sim(() => K.day(a.set)); if (a.h.poupa) a.h.poupa.d -= K.HANDS_DAYS;
  a.n0 = S.ledgerN || 0; sim(() => K.day(a.set)); a.b = K.waiting(a.v);
  return a;
}
// (every house of the town with a free bed taken down by the test's hand — but `keep` —: a town with no bed for anyone)
function semCamas(set, keep) {
  let n = 0;
  for (let k = 0; k < 80; k++) { const b = [...S.buildings.values()].find(o => o.set === set.id && o.built && housing(o) && o.type !== 'barraco' && o !== keep && camas(o) - mora(o).length >= 1); if (!b) break; tira(b); n++; }
  return n;
}

// ------------------------------ c17: os moços da casa (D-235, parte da D-194) ------------------------------
run('c17', () => {
  const a = mocos(2, false) || mocos(2); if (!ok('c17a a família sozinha grande demais, com filhos crescidos', !!a && !!a.v, dizM(a))) return;
  const { set, h, g, v, pais } = a; const velho = g[0];
  quieta(a);
  const m0 = K.mates(v) || []; const rd0 = K.road(v);
  ok('c17b os moços da casa vão juntos, depois da paciência', m0.length === 2 && g.every(m => m0.includes(m)) && !K.mates(pais[0]) && rd0.kind === 'maos' && !!rd0.mates && rd0.mates.length === 2 && rd0.wait === K.HANDS_DAYS && /não há cama para nós noutra casa: se em 2 dias não houver/.test(diario(v)),
    `os que saem juntos: ${m0.map(m => m.name).join(' e ') || 'NINGUÉM'}; os pais: ${K.mates(pais[0]) ? 'TAMBÉM' : 'não'}; a estrada «${rd0.kind || '-'}${rd0.why ? ':' + rd0.why : ''}» em ${rd0.wait} dia(s); no diário de ${v.name}: «${diario(v)}»`);
  sim(() => K.day(set));
  ok('c17c antes da paciência, nada se levanta', !K.waiting(v) && !!h.poupa && g.some(m => m.id === h.poupa.by), `a obra: ${lado(K.waiting(v))}; a casa conta os dias desde o dia ${h.poupa ? h.poupa.d : '?'}`);
  if (h.poupa) h.poupa.d -= K.HANDS_DAYS; const n0 = S.ledgerN || 0; sim(() => K.day(set)); const b = K.waiting(v);
  if (!ok('c17d a cabana é dos moços, e o dono é o mais velho deles', !!b && b.type === 'hut' && b.encomenda.maos === 1 && b.encomenda.mocos === 1 && b.encomenda.fam.length === 2 && g.every(m => b.encomenda.fam.includes(m.id)) && b.dono === velho.id && !pais.some(p => b.encomenda.fam.includes(p.id) || K.waiting(p)),
    b ? `${lado(b)}: escritos ${b.encomenda.fam.map(nome).join(' e ')}; dono: ${nome(b.dono)} (o mais velho: ${velho.name}); das mãos: ${b.encomenda.maos}, dos moços: ${b.encomenda.mocos}; os pais esperam casa: ${pais.some(p => K.waiting(p)) ? 'SIM' : 'não'}` : `nenhuma obra: a estrada diz ${JSON.stringify(Object.assign({}, K.road(v), { mates: (K.road(v).mates || []).length }))}`)) return;
  const fx = ficha(h);
  ok('c17e o diário e a ficha dizem', /Não cabíamos mais em casa: estamos levantando a nossa cabana com as nossas mãos/.test(diario(v)) && /Os moços da casa \(2: .* estão levantando a sua cabana com as próprias mãos/.test(fx) && g.every(m => (m.diary || []).some(e => /Não cabemos mais em casa, e não há cama noutra/.test(e.txt))),
    `no diário de ${v.name}: «${diario(v)}»; a ficha da casa: «${fx}»`);
  const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'obra-casa');
  ok('c17f sem moedas na casa, nada pago; a obra não conta nas pagas', !pg.length && !(b.encomenda.paid > 0) && !K.cannotRaise(set, 'hut'), `${pg.length} linha(s) «obra-casa»; pago: ${b.encomenda.paid}; os construtores: «${K.cannotRaise(set, 'hut') || 'têm vaga'}»`);
  let c = checa(); ok('c17g verificador', c.ok, c.txt);
  // (one alone, from a house short of twice its beds: a bed in another house will do — nothing is raised)
  const a1 = mocos(1, false);
  if (a1 && a1.v) {
    quieta(a1);
    sim(() => K.day(a1.set)); if (a1.h.poupa) a1.h.poupa.d -= K.HANDS_DAYS; sim(() => K.day(a1.set)); const r1 = K.road(a1.v);
    ok('c17h um só, de uma casa abaixo do dobro, não levanta nada', r1.kind === '' && r1.why === 'um' && !K.waiting(a1.v) && /sou um só: mudo quando outra casa tiver uma cama/.test(diario(a1.v)) && /sai quando outra casa tiver uma cama/.test(ficha(a1.h)),
      `${dizM(a1)}: a estrada «${r1.kind || '-'}:${r1.why || ''}»; a obra: ${lado(K.waiting(a1.v))}; no diário: «${diario(a1.v)}»; a ficha: «${ficha(a1.h)}»`);
  } else ok('c17h um só, de uma casa abaixo do dobro', false, dizM(a1));
  // (one alone, from a house at twice its beds: a hut of one's own)
  const a2 = mocos(1, true);
  if (a2 && a2.v) {
    quieta(a2);
    sim(() => K.day(a2.set)); if (a2.h.poupa) a2.h.poupa.d -= K.HANDS_DAYS; sim(() => K.day(a2.set)); const b2 = K.waiting(a2.v);
    ok('c17i um só, de uma casa com o dobro, levanta a sua', !!b2 && b2.encomenda.mocos === 1 && b2.encomenda.fam.length === 1 && b2.dono === a2.v.id, `${dizM(a2)}: ${b2 ? lado(b2) + ', de ' + nome(b2.dono) : 'NENHUMA obra — a estrada: ' + JSON.stringify(Object.assign({}, K.road(a2.v), { mates: 0 }))}`);
  } else console.log(`(c17i sem caso: ${dizM(a2)} — nenhuma família sozinha com o dobro da lotação e filhos em ${MUNDO})`);
  // (the family of parents and little ones alone: nobody to leave — the diary and the card say the cause)
  abre(); const so = sozinha();
  if (so) {
    const o = so.o; calaFila(so.set, o); semVazias(o, so.set); poe('h:' + so.b.id, 0); const rs = K.road(o);
    ok('c17j pais e pequenos: a tela diz a causa', rs.kind === '' && rs.why === 'so' && !rs.grown && /somos muitos para a casa, e os filhos ainda são pequenos/.test(diario(o)) && /os filhos ainda são pequenos — fica apertada até eles crescerem ou o preço juntar/.test(ficha(so.b)),
      `${so.set.name}: a família de ${o.name} sozinha na ${lado(so.b)} (${mora(so.b).length} para ${camas(so.b)}; ${so.como}): a estrada «-:${rs.why}»; no diário: «${diario(o)}»; a ficha: «${ficha(so.b)}»`);
    so.desfaz();
  } else ok('c17j pais e pequenos', false, 'nenhuma família sozinha para o caso');
  c = checa(); ok('c17k verificador', c.ok, c.txt);
  // (the family alone is in need too — parents and little ones more than the beds —, and the day asks it before its grown
  // single ones: the days of the house's patience are theirs, and are not begun again by the family's turn)
  const a5 = mocos(2, true) || mocos(1, true);
  if (a5 && a5.v && K.need(a5.pais[0])) {
    // (the other houses' families let the new house go, for now; this house's own are all asked)
    sim(() => { for (const [o] of K.queue(a5.set)) if (o.home !== a5.h.id) K.giveUp(o); }); semVazias(a5.pais[0], a5.set); semVazias(a5.v, a5.set); poe('h:' + a5.h.id, 0); for (const m of mora(a5.h)) if (m.purse > 0) poe('p:' + m.id, 0); madeira(a5.set, 40);
    const fila = K.queue(a5.set).filter(e => e[0].home === a5.h.id);
    sim(() => K.day(a5.set)); const por1 = a5.h.poupa ? a5.h.poupa.by : 0; if (a5.h.poupa) a5.h.poupa.d -= K.HANDS_DAYS; sim(() => K.day(a5.set)); const b5 = K.waiting(a5.v);
    ok('c17l com a família sozinha perguntada também, a paciência é a dos moços', fila.length === 2 && !fila.some(e => K.gaveUp(e[0])) && a5.g.some(m => m.id === por1) && !!b5 && b5.encomenda.mocos === 1, `${dizM(a5)}; da casa o dia pergunta ${fila.map(e => `${e[0].name} (${K.family(e[0]).length})`).join(' e ')}; a marca da casa ficou com ${nome(por1)}; depois da paciência: ${b5 ? lado(b5) + ', dos moços' : 'NENHUMA obra — ' + JSON.stringify(Object.assign({}, K.road(a5.v), { mates: 0 }))}`);
  } else console.log(`(c17l sem caso: ${dizM(a5)}${a5 && a5.v ? ' — os pais e os pequenos cabem na casa' : ''})`);
});

// ------------------------------ c18: os moços levantam e mudam; a morte, o save, o corpo ------------------------------
run('c18', () => {
  const a = obraDosMocos(2, false) || obraDosMocos(2); if (!ok('c18a a cabana dos moços', !!a && !!a.b, a && a.b ? `${dizM(a)}: ${lado(a.b)}` : dizM(a))) return;
  const { h, g, pais, b } = a; const ids = new Set(g.map(m => m.id)); const visto = new Set(), estranhos = new Set(); const n0 = S.ledgerN || 0;
  const t = vive(1400, () => dePe(b), () => { if (b.encomenda) for (const o of naObra(b)) { visto.add(o.id); if (!ids.has(o.id) && !K.ownHands(b, o)) estranhos.add(o.id); } });
  const vivos = g.filter(m => S.villagers.has(m.id)); const paisV = pais.filter(p => S.villagers.has(p.id));
  ok('c18b só os moços levantam a cabana', dePe(b) && !estranhos.size && visto.size >= 1, dePe(b) ? `de pé em ${t} s${jaAmplia(b)}; na obra: ${[...visto].map(nome).join(', ')}; de fora deles e dos pares deles: ${[...estranhos].map(nome).join(', ') || 'ninguém'} (os pais: ${pais.some(p => visto.has(p.id)) ? 'TRABALHARAM' : 'não'})` : `não ficou de pé no tempo do caso (${Math.round((b.progress || 0) * 100)}%, falta ${JSON.stringify(b.need)}); na obra: ${[...visto].map(nome).join(', ') || 'ninguém'}`);
  ok('c18c mudam juntos; os pais e os pequenos ficam', dePe(b) && vivos.every(m => m.home === b.id) && vivos.some(m => m.id === b.dono) && pais.every(p => !visto.has(p.id)) && paisV.every(p => p.home === h.id) && !mora(h).some(m => ids.has(m.id)) && vivos.some(m => (m.moves || []).some(x => /cabana que levantou com as próprias mãos/.test(x[1]))),
    `${vivos.filter(m => m.home === b.id).length} de ${vivos.length} moços moram na ${lado(b)}, de ${nome(b.dono)}; os pais na ${lado(S.buildings.get(paisV[0] ? paisV[0].home : 0))}, agora ${mora(h).length} para ${camas(h)}; a madeira pelo livro: ${r2(livro(n0, e => e[5] === 'wood' && e[4] === 'o:' + b.id).reduce((s, e) => s + e[6], 0))}`);
  let c = checa(); ok('c18d verificador', c.ok, c.txt);
  // (the eldest dies: the hut is the next one's; the two die: the people's builders')
  const a2 = obraDosMocos(3) || obraDosMocos(2, false) || obraDosMocos(2); if (!a2 || !a2.b) { ok('c18e a morte de quem levanta', false, 'o caso não se armou de novo'); return; }
  const [e1, e2] = a2.g; sim(() => V.kill(e1, 'sick'));
  ok('c18e o mais velho morre: a cabana é do mais velho dos que ficam', !!a2.b.encomenda && a2.b.encomenda.maos === 1 && a2.b.dono === e2.id && a2.b.encomenda.by === e2.id && !a2.b.encomenda.fam.includes(e1.id), `${a2.g.length} moços; ${e1.name} morreu: a ${lado(a2.b)} é de ${nome(a2.b.dono)} (o mais velho dos que ficam: ${e2.name}; escritos: ${a2.b.encomenda ? a2.b.encomenda.fam.map(nome).join(', ') : '-'})`);
  c = checa(); ok('c18f verificador', c.ok, c.txt);
  sim(() => { for (const m of a2.g.slice(1)) V.kill(m, 'sick'); });
  ok('c18g morrem todos: a obra passa aos construtores do povo', !S.buildings.has(a2.b.id) || (!!a2.b.encomenda && !a2.b.encomenda.maos), S.buildings.has(a2.b.id) ? `a ${lado(a2.b)}: das mãos ${a2.b.encomenda ? a2.b.encomenda.maos : '-'}, dono ${a2.b.dono ? nome(a2.b.dono) : 'ninguém'}` : 'a obra saiu do chão');
  c = checa(); ok('c18h verificador', c.ok, c.txt);
  // (save and load in the middle of the work)
  const a3 = obraDosMocos(2, false) || obraDosMocos(2); if (!a3 || !a3.b) { ok('c18i o save no meio', false, 'o caso não se armou de novo'); return; }
  let b3 = a3.b; const id3 = b3.id; const gid = a3.g.map(m => m.id); vive(120, () => b3.built || V.delivered(b3).wood >= 3);
  const enc = JSON.stringify(b3.encomenda); salva(); b3 = S.buildings.get(id3);
  ok('c18i depois do load a cabana é a mesma', !!b3 && (b3.built || (JSON.stringify(b3.encomenda) === enc && b3.encomenda.mocos === 1 && b3.encomenda.maos === 1 && K.waiting(P(gid[0])) === b3)), b3 ? `${lado(b3)}: ${Math.round((b3.progress || 0) * 100)}%, a encomenda ${JSON.stringify(b3.encomenda)}` : 'a obra SUMIU');
  // (the ruler of the c18b: the partner who came to live with one of them works on the hut and moves with them — K.ownHands,
  // L-972; with the trade that stays, Mazatl, the husband of one of the two, was counted an outsider: T-835)
  S.time = 0.15; S.weather.storm = 0; const fora3 = new Set(); const t3 = vive(1400, () => dePe(b3), () => { if (b3.encomenda) for (const o of naObra(b3)) if (!gid.includes(o.id) && !K.ownHands(b3, o)) fora3.add(o.id); });
  ok('c18j os moços acabam a cabana e mudam', dePe(b3) && !fora3.size && gid.map(P).filter(Boolean).every(m => m.home === b3.id), dePe(b3) ? `de pé ${t3} s depois do load${jaAmplia(b3)}; de fora deles e dos pares deles na obra: ${fora3.size || 'ninguém'}; moram nela ${gid.map(P).filter(Boolean).filter(m => m.home === b3.id).length} de ${gid.map(P).filter(Boolean).length}` : `não ficou de pé (${Math.round((b3.progress || 0) * 100)}%)`);
  c = checa(); ok('c18k verificador', c.ok, c.txt);
  // (the god's body among them: the day never decides for it; the offer says the road; the body asks)
  const a4 = mocos(2, false) || mocos(2); if (!a4 || !a4.v) { ok('c18l o corpo entre os moços', false, dizM(a4)); return; }
  quieta(a4);
  sim(() => K.day(a4.set)); if (a4.h.poupa) a4.h.poupa.d -= K.HANDS_DAYS;
  const corpo = a4.g.find(o => G.Possess.can(o).ok);
  if (!ok('c18l o deus vive um dos moços', !!corpo && G.Possess.take(corpo).ok, corpo ? `o deus vive ${corpo.name} #${corpo.id}${corpo === a4.v ? ', o que o dia pergunta' : ''}` : 'nenhum deles pode ser vivido')) return;
  sim(() => K.day(a4.set));
  ok('c18m com o corpo, o dia não decide por ele', !K.waiting(corpo) && corpo.home === a4.h.id, `a obra do corpo: ${lado(K.waiting(corpo))}; mora na ${lado(S.buildings.get(corpo.home))}`);
  const can = K.can(corpo); const d = V.nearestDropoff(corpo.x, corpo.y, corpo.set); const ft = d ? V.frontTile(d) : null;
  const of = ft ? A.offers(corpo, ft[0], ft[1], 2.5).find(o => /^casa\.encomendar/.test(o.id)) : null;
  const r = of && of.ok ? sim(() => A.perform(corpo, of)) : { ok: false, why: of ? of.why : 'sem oferta' }; const b4 = K.waiting(corpo);
  ok('c18n a oferta diz a estrada, o corpo pede, e a cabana é dos moços', can.ok && can.hands === 'hut' && !!of && /com as nossas mãos/.test(of.label) && r.ok && !!b4 && b4.encomenda.mocos === 1 && b4.encomenda.fam.includes(corpo.id),
    `a oferta: «${of ? of.label : 'NENHUMA'}»; o pedido: ${r.ok ? '«' + r.msg + '»' : 'não deu — ' + r.why}; a obra: ${b4 ? lado(b4) + ', de ' + b4.encomenda.fam.map(nome).join(' e ') : 'nada'}`);
  G.Possess.release('deus'); M.viver(1);
  c = checa(); ok('c18o verificador', c.ok, c.txt);
});

// ------------------------------ c19: a família antes do solteiro (D-236, T-976) ------------------------------
run('c19', () => {
  // (the full house of two families, the house of the people's empty beside it — and a grown single one in the full house:
  // the eldest child of its owners, made nineteen by the test's hand)
  const monta = () => {
    const a = arma({ dobro: true }) || arma(); if (!a) return null;
    semVazias(a.v, a.set, a.hB); calaFila(a.set, a.v); poe('h:' + a.h.id, 0);
    a.s = a.A.fam.filter(m => m !== a.A.v && m !== a.A.p).sort((x, y) => y.age - x.age || x.id - y.id)[0]; if (!a.s) return a;
    a.s.age = 19.2; a.h.res = mora(a.h).length;
    // (the most room of the other houses of the town: the housing sends one alone to the house with most room)
    a.folga = Math.max(0, ...[...S.buildings.values()].filter(b => b.set === a.set.id && b.built && housing(b) && b.type !== 'barraco' && b !== a.hB && b !== a.h).map(b => camas(b) - mora(b).length));
    return a;
  };
  const a = monta(); if (!ok('c19a a casa cheia, a casa vazia do povo e um solteiro', !!a && !!a.s, a ? `${diz(a)}; a ${lado(a.hB)} do povo, vazia (${camas(a.hB)} camas; a maior folga das outras casas: ${a.folga}); ${a.s ? a.s.name + ', ' + Math.floor(a.s.age) + ', sem par, da casa cheia (a idade pela mão da prova)' : 'SEM solteiro'}` : diz(a))) return;
  const { set, v, fam, h, hB, s } = a;
  const q = K.queue(set).filter(e => e[0].home === h.id); const held = K.heldFor(set);
  ok('c19b o dia pergunta a família, não o solteiro; a casa vazia é guardada para ela', q.length >= 1 && fam.includes(q[0][0]) && K.need(s) === 'lotada' && held.has(hB.id) && held.get(hB.id) === q[0][0].id,
    `da ${lado(h)} o dia pergunta: ${q.map(e => `${e[0].name} (${K.family(e[0]).length})`).join(', ') || 'NINGUÉM'}; ${s.name} precisa de casa: ${K.need(s) || 'não'}; guardada para uma família: ${[...held.keys()].map(id => lado(S.buildings.get(id))).join(', ') || 'NADA'}`);
  // (the town's housing, a few seconds of the world: the single one is not sent to the house the family is to take)
  sim(() => V.forceUpdate(true));
  ok('c19c o repartidor não leva o solteiro à casa que a família espera', s.home !== hB.id && mora(hB).every(m => fam.includes(m)), `${s.name} mora na ${lado(S.buildings.get(s.home))}${s.home === h.id ? ' (ficou: nenhuma outra casa tem cama)' : ''}; na ${lado(hB)}: ${mora(hB).map(m => m.name).join(', ') || 'ninguém'}`);
  sim(() => K.day(set));
  ok('c19d no dia da cidade a família recebe a casa', fam.every(m => m.home === hB.id) && hB.dono === v.id, `${fam.filter(m => m.home === hB.id).length} de ${fam.length} da família moram na ${lado(hB)}; dono: ${hB.dono ? nome(hB.dono) : 'o povo'}`);
  let c = checa(); ok('c19e verificador', c.ok, c.txt);
  // (no family waits for it — the family lets the new house go, for now —: the single one is sent as before)
  const a2 = monta(); if (!a2 || !a2.s) { ok('c19f sem família à espera', false, 'o caso não se armou de novo'); return; }
  sim(() => K.giveUp(a2.v)); const held2 = K.heldFor(a2.set); sim(() => V.forceUpdate(true));
  ok('c19f sem família à espera, o solteiro vai como antes', !held2.has(a2.hB.id) && a2.s.home !== a2.h.id && (camas(a2.hB) > a2.folga ? a2.s.home === a2.hB.id : true), `a família de ${a2.v.name} deixou a casa nova para depois: guardadas ${held2.size}; ${a2.s.name} foi para a ${lado(S.buildings.get(a2.s.home))}${camas(a2.hB) > a2.folga ? ' (a de mais lugar: a vazia do povo)' : ' (outra casa tinha tanto lugar quanto a vazia)'}`);
  // (one alone out of doors: no more than the one who leaves a full house)
  const a3 = monta(); if (!a3 || !a3.s) { ok('c19g o solteiro ao relento', false, 'o caso não se armou de novo'); return; }
  a3.s.home = 0; a3.h.res = mora(a3.h).length; sim(() => V.forceUpdate(true));
  ok('c19g quem está só e ao relento também não a toma', a3.s.home !== a3.hB.id && !mora(a3.hB).length, `${a3.s.name}, posto na rua pela mão da prova: ${a3.s.home ? 'mora na ' + lado(S.buildings.get(a3.s.home)) : 'continua sem teto (nenhuma outra casa tem cama)'}; na ${lado(a3.hB)}: ${mora(a3.hB).length}`);
  c = checa(); ok('c19h verificador', c.ok, c.txt);
});

// ------------------------------ c20: o bolso de quem tem teto (L-973) ------------------------------
run('c20', () => {
  const a = arma({ dobro: true }) || arma(); if (!ok('c20a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, h, hB } = a; const par = P(v.partner);
  semVazias(v, set, hB); calaFila(set, v); poe('h:' + h.id, 1);
  const preco = K.plan(v, null, set, null, a.why).price; const traz = r2(preco + K.KEEP + 4);
  // (what a household that left the seat carries: the coins in the purse of its head — and a thief's take, still to answer for)
  D.make('p:' + v.id, 'moedas', traz, { code: 'teste' });
  if (par) { D.make('p:' + par.id, 'moedas', 7, { code: 'teste' }); (S.crimes || (S.crimes = [])).push({ id: S.nextId++, kind: 'furto', day: S.day, set: set.id, thief: par.id, house: h.id, n: 5, x: h.x, y: h.y, seen: [], told: 0, found: 0, st: 'aberto' }); }
  const antes = K.savings(v); const n0 = S.ledgerN || 0;
  ok('c20b com as moedas no bolso, a família não tem o preço', antes + 1e-6 < preco && Math.abs((v.purse || 0) - traz) < 0.011, `a casa custa ${preco}; no pote da casa ${antes}, no bolso de ${v.name} ${v.purse}${par ? `, no de ${par.name} ${par.purse} (5 de um furto ainda por responder)` : ''}`);
  sim(() => K.day(set));
  const bol = livro(n0, e => e[8] === 'bolso' && e[5] === 'moedas' && (e[3] === 'p:' + v.id || (!!par && e[3] === 'p:' + par.id))); const dev = bol.filter(e => e[3] === 'p:' + v.id).reduce((s, e) => s + e[6], 0); const dp = par ? bol.filter(e => e[3] === 'p:' + par.id).reduce((s, e) => s + e[6], 0) : 0;
  ok('c20c no dia da cidade o bolso vai ao pote da casa, pelo livro; o furto fica escondido', Math.abs(dev - traz) < 0.011 && !(v.purse > 0.011) && (!par || (Math.abs(dp - 2) < 0.011 && Math.abs(par.purse - 5) < 0.011)) && bol.every(e => e[4] === 'h:' + h.id),
    `${bol.length} linha(s) «bolso»: ${bol.map(e => `${e[6]} de ${e[3]} para ${e[4]}`).join('; ') || 'NENHUMA'}; o bolso de ${v.name}: ${v.purse || 0}${par ? `; o de ${par.name}: ${par.purse}` : ''}`);
  const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'compra-casa');
  ok('c20d e a família, que tinha o preço, compra a casa no mesmo dia', fam.every(m => m.home === hB.id) && hB.dono === v.id && pg.length === 1 && Math.abs(pg[0][6] - preco) < 0.011, `${pg.length} linha(s) «compra-casa»${pg.length ? ' de ' + pg[0][6] : ''} (o preço: ${preco}); a família mora na ${lado(S.buildings.get(v.home))}, dono ${hB.dono ? nome(hB.dono) : 'o povo'}`);
  const c = checa(); ok('c20e verificador', c.ok, c.txt);
});

// ------------------------------ c21: a família ao relento (D-237) ------------------------------
// A family out of doors by the test's hand: a family of a town of coin, alone in the house it had — the house taken down, the
// family in the street since `dias` days (what the day of the streets marks: v.rua). cheia: no bed in any house of the town;
// keep: a house of the people's raised empty by the test's hand. → { set, v, par, fam, vazia }
function relento(o) {
  o = o || {}; abre();
  for (const set of [...S.settlements.values()].filter(s => E.coinage(s.fac)).sort((a, c) => V.pop(a.id) - V.pop(c.id) || a.id - c.id)) {
    const F = familias(set, 3).find(q => mora(q.h).length === q.fam.length && !q.h.elite); if (!F) continue;
    const fam = F.fam.slice(); const ids = fam.map(m => m.id);
    sim(() => { for (const m of fam) if (m.inside) G.Vg.endTask(m); }); tira(F.h);
    for (const m of fam) { m.home = 0; m.inside = 0; m.sleeping = false; if (m.age >= 16) { m.rua = S.day - (o.dias || 0); m.ruaWhy = 'ruína'; poe('p:' + m.id, 0); } }
    let vazia = null;
    if (o.vazia) { const pos = sim(() => V.findSite(set, 'house')); if (pos && !pos.demolish) vazia = sim(() => V.addBuilding('house', pos[0], pos[1], set.id, true)); if (!vazia) continue; }
    semVazias(F.v, set, vazia);
    if (o.cheia) semCamas(set, vazia);
    calaFila(set, F.v); madeira(set, 40); VIVE.set = set;
    return { set, v: F.v, par: F.p, fam, ids, vazia };
  }
  return null;
}
const dizR = a => (a ? `${a.set.name}: a família de ${a.v.name} #${a.v.id} (${a.fam.length}) ao relento («${K.need(a.v) || 'não precisa'}»; a casa que tinha, desfeita pela mão da prova)` : `nenhuma família para o caso em ${MUNDO}`);
run('c21', () => {
  // (the people's empty house: given the same day, for what the family carries past the little it keeps — the purse is the
  // partner's: the family's coins go in one hand)
  const a = relento({ vazia: true }); if (!ok('c21a a família ao relento e a casa vazia do povo', !!a && K.need(a.v) === 'rua' && !!a.vazia, a ? `${dizR(a)}; a ${lado(a.vazia)} do povo, vazia` : dizR(a))) return;
  const { set, v, par, fam, vazia } = a; D.make('p:' + par.id, 'moedas', 5, { code: 'teste' });
  const rd = K.road(v); const d0 = S.day; const n0 = S.ledgerN || 0;
  ok('c21b a estrada: a casa vazia do povo, hoje', rd.kind === 'cede' && rd.b === vazia && rd.out === true && /o povo tem uma casa vazia e a dá a quem ficou sem teto/.test(diario(v)), `a estrada «${rd.kind || '-'}» ${lado(rd.b)}; no diário: «${diario(v)}»`);
  sim(() => K.day(set)); const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'compra-casa');
  ok('c21c dada no mesmo dia, pelo que a família traz além do que guarda', fam.every(m => m.home === vazia.id) && [v.id, par.id].includes(vazia.dono) && S.day === d0 && pg.length === 1 && Math.abs(pg[0][6] - 3) < 0.011 && pg[0][4] === 'f:' + set.fac && !K.need(v),
    `${fam.filter(m => m.home === vazia.id).length} de ${fam.length} moram na ${lado(vazia)}, dono ${vazia.dono ? nome(vazia.dono) : 'o povo'}; ${pg.length} linha(s) «compra-casa»${pg.length ? ': ' + pg[0][6] + ' de ' + pg[0][3] : ''} (a família trazia 5 no bolso de ${par.name}, guarda ${K.KEEP})`);
  let c = checa(); ok('c21d verificador', c.ok, c.txt);
  // (no empty house, no bed in any house: a hut of the family's own hands at once — and no shack beside it, though it has
  // slept in the street the two nights the shack waits for)
  const a2 = relento({ cheia: true, dias: 3 }); if (!ok('c21e a família ao relento numa cidade sem cama', !!a2 && K.need(a2.v) === 'rua', dizR(a2))) return;
  const rd2 = K.road(a2.v); const d2 = S.day; sim(() => K.day(a2.set)); const b = K.waiting(a2.v);
  if (!ok('c21f a cabana das mãos no mesmo dia, sem a paciência', rd2.kind === 'maos' && rd2.wait === 0 && rd2.out === true && !!b && b.encomenda.maos === 1 && b.encomenda.why === 'rua' && S.day === d2 && /Ficamos sem teto: estamos levantando a nossa cabana/.test(diario(a2.v)),
    `a estrada «${rd2.kind || '-'}${rd2.why ? ':' + rd2.why : ''}», espera ${rd2.wait}; a obra: ${lado(b)}; no diário: «${diario(a2.v)}»`)) return;
  const bar0 = [...S.buildings.values()].filter(o => o.type === 'barraco' && o.set === a2.set.id).length; let barraco = 0; const ids2 = new Set(a2.ids); const fora = new Set();
  const t = vive(1400, () => dePe(b), () => { for (const m of a2.fam) if (m.task && m.task.type === 'barraco') barraco++; if (b.encomenda) for (const o of naObra(b)) if (!ids2.has(o.id)) fora.add(o.id); });
  const vivos = a2.fam.filter(m => S.villagers.has(m.id)); const bar1 = [...S.buildings.values()].filter(o => o.type === 'barraco' && o.set === a2.set.id && mora(o).some(m => ids2.has(m.id))).length;
  ok('c21g a família levanta a cabana e muda; nenhum barraco ao lado', dePe(b) && !fora.size && !barraco && !bar1 && vivos.every(m => m.home === b.id), dePe(b) ? `de pé em ${t} s${jaAmplia(b)}; ${vivos.filter(m => m.home === b.id).length} de ${vivos.length} moram nela; de fora da família na obra: ${fora.size || 'ninguém'}; a família foi mandada a um barraco ${barraco} vez(es); barracos na cidade: ${bar0} antes` : `não ficou de pé (${Math.round((b.progress || 0) * 100)}%, falta ${JSON.stringify(b.need)}); mandada a um barraco ${barraco} vez(es)`);
  c = checa(); ok('c21h verificador', c.ok, c.txt);
  // (no wood to spare: nothing is raised — and the shack is still the road of who has slept two nights in the street)
  const a3 = relento({ cheia: true, dias: 3 }); if (!a3) { ok('c21i sem madeira', false, 'o caso não se armou de novo'); return; }
  VIVE.set = null; madeira(a3.set, 3); sim(() => K.day(a3.set)); const rd3 = K.road(a3.v); const ids3 = new Set(a3.ids);
  let foi = 0; vive(400, () => [...S.buildings.values()].some(o => o.type === 'barraco' && mora(o).some(m => ids3.has(m.id))), () => { if (D.get('f:' + a3.set.fac, 'wood') > 6) madeira(a3.set, 3); for (const m of a3.fam) if (m.task && m.task.type === 'barraco') foi++; });
  const bar3 = [...S.buildings.values()].find(o => o.type === 'barraco' && mora(o).some(m => ids3.has(m.id)));
  ok('c21i sem madeira de sobra, nada se levanta; o barraco continua a ser a estrada de quem dormiu duas noites na rua', rd3.kind === '' && rd3.why === 'madeira' && !K.waiting(a3.v) && (!!bar3 || foi > 0), `a estrada «-:${rd3.why || ''}»; a obra: ${lado(K.waiting(a3.v))}; ${bar3 ? 'a família levantou o ' + lado(bar3) : foi ? 'a família foi levantar um barraco (' + foi + ' passos)' : 'NENHUM barraco'}`);
  // (one alone out of doors: no road of this kind — a bed by the town's housing, a shack by one's own hands)
  const a4 = relento({ cheia: true, dias: 1 });
  const so = a4 ? [...S.villagers.values()].filter(m => m.set === a4.set.id && m.age >= 18 && !m.partner && !m.captive && !m.jail && !m.aboard && !(S.avatar && S.avatar.id === m.id) && K.family(m).length === 1).sort((x, y) => x.id - y.id)[0] : null;
  if (so) { const hs = S.buildings.get(so.home); so.home = 0; so.inside = 0; so.sleeping = false; so.rua = S.day - 1; so.ruaWhy = 'lotada'; if (hs) hs.res = mora(hs).length; const r4 = K.road(so); ok('c21j quem está só ao relento não vai por esta estrada', K.need(so) === 'rua' && r4.kind === '', `${so.name}, sem par e sem pequenos, posto ao relento pela mão da prova («${K.need(so) || '-'}»): a estrada «${r4.kind || '-'}» — uma cama pelo repartidor de casas, ou o barraco`); }
  else console.log(`(c21j sem caso: nenhum crescido sem par em ${a4 ? a4.set.name : MUNDO})`);
  // (save and load with the hut of a family out of doors under way)
  const a5 = relento({ cheia: true }); if (!a5) { ok('c21k o save no meio', false, 'o caso não se armou de novo'); return; }
  sim(() => K.day(a5.set)); let b5 = K.waiting(a5.v); if (!ok('c21k a cabana de quem ficou sem teto', !!b5, lado(b5))) return;
  const id5 = b5.id; const enc5 = JSON.stringify(b5.encomenda); salva(); b5 = S.buildings.get(id5); const v5 = P(a5.v.id);
  ok('c21l depois do load a obra é a mesma, e a família ainda a espera', !!b5 && JSON.stringify(b5.encomenda) === enc5 && K.waiting(v5) === b5, b5 ? `${lado(b5)}: a encomenda ${JSON.stringify(b5.encomenda)}` : 'a obra SUMIU');
  S.time = 0.15; const t5 = vive(1400, () => dePe(b5)); const f5 = a5.ids.map(P).filter(Boolean);
  ok('c21m a família acaba a cabana e muda', dePe(b5) && f5.every(m => m.home === b5.id), dePe(b5) ? `de pé ${t5} s depois do load; ${f5.filter(m => m.home === b5.id).length} de ${f5.length} moram nela` : `não ficou de pé (${Math.round((b5.progress || 0) * 100)}%)`);
  c = checa(); ok('c21n verificador', c.ok, c.txt);
  // (out of doors with the price in the purse, and the people's builders with no room for one more house — by the test's
  // hand: their two works are none —: who sleeps in the street does not wait for them)
  const a6 = relento({ cheia: true }); if (!a6) { ok('c21o com o preço e os construtores cheios', false, 'o caso não se armou de novo'); return; }
  const p6 = K.plan(a6.v, null, a6.set, null, 'rua').price; D.make('p:' + a6.v.id, 'moedas', r2(p6 + K.KEEP + 5), { code: 'teste' });
  const mw = K.MAX_WORKS; K.MAX_WORKS = 0; let b6 = null; try { sim(() => K.day(a6.set)); b6 = K.waiting(a6.v); } finally { K.MAX_WORKS = mw; }
  ok('c21o com o preço e os construtores cheios, a cabana das mãos no mesmo dia', !!b6 && b6.encomenda.maos === 1 && b6.encomenda.why === 'rua', `${a6.v.name} tem ${r2(p6 + K.KEEP + 5)} moedas no bolso (uma casa custa ${p6}); os construtores: «${'Os construtores do povo já têm casas demais para levantar agora.'}»; a obra: ${b6 ? lado(b6) + (b6.encomenda.maos ? ', das mãos da família' : ', paga') : 'NADA'}`);
  c = checa(); ok('c21p verificador', c.ok, c.txt);
});

// ------------------------------ c22: quem deixa a sede (T-818: L-973, L-974, D-237) ------------------------------
// (a people of coin with its ruler at home in the capital, and a palace raised there by the god's hand: the household in it)
const outroDe = (set, r) => [...S.villagers.values()].filter(m => m.set === set.id && m.age >= 20 && m.age < 60 && !m.captive && !m.jail && !m.aboard && m.home && !K.ofCourt(m, r) && !(S.avatar && S.avatar.id === m.id)).sort((x, y) => K.court(y).length - K.court(x).length || x.id - y.id)[0] || null;
function sede() {
  abre(); const Pl = G.Politics, Co = G.Court;
  const L = G.Fac.all().map(f => ({ f, r: Pl.ruler(f), cap: G.Fac.capitalOf(f.id) })).filter(o => o.r && o.cap && !o.r.captive && o.r.set === o.cap.id && E.coinage(o.f.id) && !(S.avatar && K.court(o.r).some(m => m.id === S.avatar.id)))
    .sort((a, c) => K.court(c.r).length - K.court(a.r).length || a.f.id - c.f.id);
  for (const o of L) {
    let b = Co.seatOf(o.f); if (b && !b.built) continue;
    if (!b) b = sim(() => V.handFound(o.cap, 'palacio', 'palacio', { built: true, R: 70 })); if (!b) continue;
    M.viver(3); if (o.r.home !== b.id || !outroDe(o.cap, o.r)) continue;
    VIVE.set = o.cap; return Object.assign(o, { b, set: o.cap });
  }
  return null;
}
const moramS = b => [...S.villagers.values()].filter(m => m.home === b.id && !m.captive);
run('c22', () => {
  const Pl = G.Politics;
  const o = sede(); if (!ok('c22a quem governa mora na sede', !!o, o ? `${o.set.name}, de ${o.f.name}: ${o.r.name} e a casa (${moramS(o.b).length}) na ${lado(o.b)}` : `nenhum povo de moeda com quem governa em casa na capital, em ${MUNDO}`)) return;
  const { f, b, set } = o; const antes = moramS(b); const chefe = antes.slice().sort((x, y) => (y.age >= 16) - (x.age >= 16) || y.age - x.age || x.id - y.id)[0];
  // (the seat's pot: three times the price of a house; another of the town, of no kin, is chosen)
  const preco = K.price(set, 'house'); poe('h:' + b.id, r2(preco * 3));
  const outro = outroDe(set, o.r);
  if (!ok('c22b outro governa', !!outro, outro ? `${outro.name} #${outro.id} é escolhido; a sede guarda ${moedas('h:' + b.id)} moedas da família de ${o.r.name} (uma casa custa ${preco})` : 'ninguém para governar')) return;
  // (the house the family had, and every house of the town with room for all of it, taken down by the test's hand: T-818)
  for (let k = 0; k < 60; k++) { const h = [...S.buildings.values()].find(x => x.set === set.id && x.built && housing(x) && x.type !== 'barraco' && (antes.some(m => m.id === x.dono) || camas(x) - mora(x).length >= Math.min(antes.length, 2))); if (!h) break; tira(h); }
  const n0 = S.ledgerN || 0;
  sim(() => { Pl.endReign(f, 'mandato'); Pl.crown(f, outro, 'eleicao', true); K.reign(); });
  const fora = antes.filter(m => S.villagers.has(m.id)); const bolso = r2(fora.reduce((s, m) => s + (m.purse || 0), 0));
  ok('c22c a família de antes sai, sem teto, com as moedas dela no bolso', fora.every(m => m.home !== b.id) && fora.some(m => !m.home) && bolso > preco,
    `os de antes: ${fora.map(m => `${m.name} ${m.home ? 'na ' + lado(S.buildings.get(m.home)) : 'sem teto'}`).join(', ')}; no bolso deles: ${bolso} moedas`);
  // (what the day of the streets marks the next morning: out of doors — by the test's hand, the same day)
  for (const m of fora) if (m.age >= 16 && !m.home) { m.rua = S.day; m.ruaWhy = 'lotada'; }
  const semTeto = fora.filter(m => !m.home && m.age >= 18); const cab = semTeto.find(m => K.need(m) === 'rua');
  calaFila(set, cab || chefe); madeira(set, 60);
  sim(() => K.day(set));
  const w = cab ? K.waiting(cab) : null; const pago = livro(n0, e => e[5] === 'moedas' && (e[8] === 'obra-casa' || e[8] === 'compra-casa') && /^p:/.test(e[3]));
  ok('c22d no dia da cidade, a família sem teto é a primeira: com o preço no bolso, paga a sua casa', !!cab && (!!w || fora.every(m => m.home)) && pago.length >= 1,
    cab ? `${cab.name} («${K.need(cab) || (w ? 'espera a casa' : 'tem casa')}»): ${w ? 'a obra ' + lado(w) + (w.encomenda.maos ? ', das mãos da família' : ', paga') : fora.every(m => m.home) ? 'a família tem casa' : 'NADA'}; pago do bolso: ${pago.map(e => `${e[6]} («${e[8]}»)`).join(', ') || 'NADA'}` : 'ninguém da família ficou sem teto');
  let c = checa(); ok('c22e verificador', c.ok, c.txt);
  // (the same household, poor: the hut of its own hands, the same day)
  const o2 = sede(); if (!o2) { ok('c22f a família pobre que deixa a sede', false, 'o caso não se armou de novo'); return; }
  const antes2 = moramS(o2.b); poe('h:' + o2.b.id, 2);
  for (let k = 0; k < 60; k++) { const h = [...S.buildings.values()].find(x => x.set === o2.set.id && x.built && housing(x) && x.type !== 'barraco' && (antes2.some(m => m.id === x.dono) || camas(x) - mora(x).length >= Math.min(antes2.length, 2))); if (!h) break; tira(h); }
  // (the palace falls: the fire of the test's hand)
  sim(() => { V.destroyBuilding(o2.b, 'fire'); });
  const fora2 = antes2.filter(m => S.villagers.has(m.id)); for (const m of fora2) if (m.age >= 16 && !m.home) { m.rua = S.day; m.ruaWhy = 'fogo'; }
  const cab2 = fora2.filter(m => !m.home && m.age >= 18).find(m => K.need(m) === 'rua' && K.family(m).length > 1);
  if (cab2) {
    calaFila(o2.set, cab2); semVazias(cab2, o2.set); madeira(o2.set, 60); const d2 = S.day; sim(() => K.day(o2.set)); const w2 = K.waiting(cab2);
    ok('c22f a sede cai e a família é pobre: a cabana das mãos no mesmo dia', !!w2 && w2.encomenda.maos === 1 && w2.encomenda.why === 'rua' && S.day === d2, `${cab2.name} e a família (${K.family(cab2).length}), sem teto depois da queda da ${lado(o2.b)}: ${w2 ? 'a obra ' + lado(w2) + ', das mãos da família' : 'NADA — a estrada: ' + JSON.stringify(K.road(cab2))}`);
    // (save and load with the family out of doors and its hut marked)
    const idw = w2 ? w2.id : 0; salva(); const w3 = S.buildings.get(idw); const cab3 = P(cab2.id);
    ok('c22g o save no meio: a obra e a espera são as mesmas', !!w3 && !!w3.encomenda && w3.encomenda.maos === 1 && !!cab3 && K.waiting(cab3) === w3, w3 ? `${lado(w3)}: ${JSON.stringify(w3.encomenda)}` : 'a obra SUMIU');
  } else console.log(`(c22f sem caso: depois da queda, ${fora2.map(m => `${m.name} ${m.home ? 'tem casa' : 'sem teto'}`).join(', ')} — nenhuma família de dois ou mais ficou sem teto)`);
  c = checa(); ok('c22h verificador', c.ok, c.txt);
  // (L-974: the one married to someone who may live in the seat by the family — a ruler's granddaughter — is of the seat too:
  // the town's housing brings one to the other's home, and the seat's door put him out, every few seconds)
  const o3 = sede(); if (!o3) { ok('c22i o par de quem é da sede', false, 'o caso não se armou de novo'); return; }
  const r = o3.r; const daqui = m => m.set === o3.set.id && !m.captive && !m.jail && !m.aboard && m.home && m.home !== o3.b.id && !K.ofCourt(m, r) && !(S.avatar && S.avatar.id === m.id);
  // (two young ones of the capital, of two houses and none of the court, made grown by the test's hand — their age —; she is
  // made a granddaughter of the ruler: the child of one made a child of the ruler's, the ages by the test's hand where the
  // family's years ask it; she is put in the seat, he stays in the house of his parents, and they are married)
  const jovens = g => [...S.villagers.values()].filter(m => m.g === g && m.age >= 6 && m.age < 18 && !m.partner && daqui(m)).sort((x, y) => y.age - x.age || x.id - y.id);
  const ela = jovens('f')[0] || null; const ele = ela ? jovens('m').find(m => m.home !== ela.home) || null : null;
  // (the years of a family: a parent is born eleven years and more before a child — the checker's rule. One of the capital
  // between the two is found; with none, and a ruler with no parents in the world — a founder —, the ruler is made older)
  const idade = (m, n) => { m.age = n; if (m.born !== undefined) m.born = S.day - n; };
  const anos = m => (m.born !== undefined ? S.day - m.born : m.age); // (as the checker counts them)
  const cand = ela && ele ? [...S.villagers.values()].filter(m => anos(m) >= 29 && m.age < 46 && daqui(m) && m.id !== ela.mother && m.id !== ela.father && m.id !== ele.mother && m.id !== ele.father).sort((x, y) => anos(x) - anos(y) || x.id - y.id) : [];
  const filho = cand.find(m => anos(r) - anos(m) >= 12) || (!r.mother && !r.father ? cand[0] : null) || null;
  // (a brother or a sister of the ruler, made so by the test's hand — the same mother —, where no one of the capital fits
  // between the ruler's years and the girl's as a child of the ruler: the niece is of the seat as the granddaughter is)
  const mae = r.mother ? P(r.mother) : null; const irmao = !filho && r.mother ? cand.find(m => !mae || anos(mae) - anos(m) >= 12) || null : null;
  const pai = filho || irmao;
  if (ela && ele && !pai) { console.log(`(c22i sem caso em ${o3.set.name}: ninguém da capital cabe, pelos anos, entre ${r.name} (${Math.floor(anos(r))}) e uma moça de 16 como filho ou irmão de quem governa)`); return; }
  if (!ok('c22i a neta (ou a sobrinha) de quem governa, e o par dela', !!ela && !!ele && !!pai, ela && ele && pai ? `${ela.name} #${ela.id} feita filha de ${pai.name} (${Math.floor(pai.age)}), e ${pai.name} ${filho ? (pai.g === 'f' ? 'filha' : 'filho') : (pai.g === 'f' ? 'irmã' : 'irmão')} de ${r.name}, pela mão da prova; ela é posta na sede e casada com ${ele.name} #${ele.id}, que fica na ${lado(S.buildings.get(ele.home))} dos pais` : 'faltam dois jovens de duas casas na capital')) return;
  idade(ela, Math.max(ela.age, 16.5)); idade(ele, Math.max(ele.age, 17));
  if (filho) { if (anos(r) - anos(pai) < 12) idade(r, anos(pai) + 12.5); if (r.g === 'f') pai.mother = r.id; else pai.father = r.id; if (!(r.kids || (r.kids = [])).includes(pai.id)) r.kids.push(pai.id); }
  else { pai.mother = r.mother; if (mae && !(mae.kids || (mae.kids = [])).includes(pai.id)) mae.kids.push(pai.id); }
  if (pai.g === 'f') ela.mother = pai.id; else ela.father = pai.id; if (!(pai.kids || (pai.kids = [])).includes(ela.id)) pai.kids.push(ela.id);
  const hEla = S.buildings.get(ela.home); sim(() => { if (ela.task) G.Vg.endTask(ela); if (ele.task) G.Vg.endTask(ele); }); ela.inside = 0; ela.sleeping = false; ela.home = o3.b.id; ela.hh = o3.b.id; if (hEla) hEla.res = mora(hEla).length; o3.b.res = moramS(o3.b).length;
  ela.partner = ele.id; ele.partner = ela.id;
  let saiu = 0; const log0 = V.log; V.log = function (txt) { if (new RegExp('^' + ele.name + ' deixou ').test(String(txt))) saiu++; return log0.apply(this, arguments); };
  M.viver(30); V.log = log0;
  const vagas = V.bedsOf(o3.b) - moramS(o3.b).length; const vezes = (ele.moves || []).filter(m => /deixou a casa de quem governa/.test(m[1])).length;
  const peq = (ela.kids || []).map(P).filter(k => k && k.age < 16);
  ok('c22j o par de quem é da sede é da sede: ninguém entra e sai sem parar', K.ofCourt(ela, r) && K.ofCourt(ele, r) && peq.every(k => K.ofCourt(k, r)) && saiu === 0 && vezes === 0 && ele.home === ela.home && peq.every(k => k.home === ela.home),
    `em 30 s: ${ele.name} deixou a sede ${saiu} vez(es) na crônica, ${vezes} nos passos dele; ela mora na ${lado(S.buildings.get(ela.home))}, ele na ${lado(S.buildings.get(ele.home))}, os ${peq.length} pequeno(s) deles ${peq.every(k => k.home === ela.home) ? 'com ela' : 'NOUTRA casa'} (a sede: ${vagas} cama(s) livre(s)); da corte: ela ${K.ofCourt(ela, r)}, ele ${K.ofCourt(ele, r)}, os pequenos ${peq.every(k => K.ofCourt(k, r))}`);
  c = checa(); ok('c22k verificador', c.ok, c.txt);
});

while (PEND.length) PEND.pop()();
console.log(fails.length ? `CASA-CHEIA: ${fails.length} FALHA(S): ${fails.join(', ')}` : `CASA-CHEIA: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
