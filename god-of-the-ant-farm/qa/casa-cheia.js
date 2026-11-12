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
//   node qa/casa-cheia.js [mundo]        (ONLY=c2,c5 só esses; ANOS=n os anos do c15, 6 por padrão)
'use strict';
process.chdir(__dirname);
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/casa-cheia-inv.js'] });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const MUNDO = process.argv[2] || process.env.MUNDO || 'cidade';
const hr = process.hrtime.bigint(); const ms = () => Number((process.hrtime.bigint() - hr) / 1000000n);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casa-cheia ${name} | ${info}`); if (!c) fails.push(name); return c; };
const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
function run(id, fn) { if (ONLY && !ONLY.includes(id)) return; try { fn(); } catch (e) { ok(id, false, 'exceção: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e)); } }
let S, V, D, K, E, U, A;
const pega = () => { S = G.S; V = G.Village; D = G.Depot; K = G.Casa; E = G.Eco; U = G.Urban; A = G.Act; return S; };
const abre = () => { M.pronto(MUNDO); pega(); M.viver(2); S.time = 0.15; S.weather.storm = 0; return S; };
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
function tira(b) { sim(() => { for (const o of S.villagers.values()) if (o.inside === b.id) G.Vg.endTask(o); }); for (const o of S.villagers.values()) if (o.inside === b.id) { o.inside = 0; o.sleeping = false; } V.removeBuilding(b); }
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
      const v = e[0];
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
// (the world lived a second at a time until `ate` says so — by day: the morning again when the evening comes)
function vive(seg, ate, cada) { for (let k = 0; k < seg; k++) { M.viver(1); if (cada) cada(); if (ate && ate()) return k + 1; if (S.time > 0.6) S.time = 0.15; } return -1; }
const naObra = b => [...S.villagers.values()].filter(v => v.task && v.task.type === 'build' && v.task.id === b.id);

// ------------------------------ c1: o plano ------------------------------
run('c1', () => {
  const a = arma({ maior: true, dobro: true }); if (!ok('c1a a casa cheia', !!a, diz(a))) return;
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
  if (big) { const p3 = K.plan(v, null, set, null, a.why); ok('c1d a que tem camas para todos vem antes', camas(big) >= fam.length ? p3.free === big : true, `com um sobrado do povo vazio (${camas(big)} camas) ao lado da ${lado(hB)}: o plano toma ${lado(p3.free)}`); }
  const c = checa(); ok('c1e verificador', c.ok, c.txt);
});

// ------------------------------ c2: a casa vazia do povo, dada ------------------------------
run('c2', () => {
  const a = arma({ dobro: true }); if (!ok('c2a a casa cheia', !!a, diz(a))) return;
  const { set, v, fam, h, hB } = a;
  semVazias(v, set, hB);
  calaFila(set, v);
  // (the pot of the full house: 9 coins, everyone's — the family's share of it past the little it keeps is what it pays)
  poe('h:' + h.id, 9); const todos = mora(h).length; const parte = r2(9 * fam.length / todos); const preco = K.plan(v, null, set, null, a.why).price;
  const deve = r2(Math.min(preco, Math.max(0, parte - K.KEEP)));
  const rd = K.road(v); const tes0 = moedas('f:' + set.fac); const n0 = S.ledgerN || 0; const d0 = S.day;
  ok('c2b a estrada', rd.kind === 'cede' && rd.b === hB && Math.abs(rd.pays - deve) < 0.011 && preco > 9, `a casa custa ${preco} e a casa cheia tem 9 moedas (a parte da família, ${parte}): a estrada diz «${rd.kind}» ${lado(rd.b)} por ${rd.pays} (o que passa das ${K.KEEP} que guarda: ${deve}); no diário: «${diario(v)}»`);
  sim(() => K.day(set));
  const pg = livro(n0, e => e[5] === 'moedas' && e[8] === 'compra-casa'); const mud = livro(n0, e => e[8] === 'mudança' && e[3] === 'h:' + h.id && e[4] === 'h:' + hB.id);
  // (a family with more people than the beds of the house it was given is alone in a house of its own now: no road by hand)
  const resto = K.need(v); const quieta = !resto || (fam.length > camas(hB) && resto === 'lotada' && K.road(v).why === 'so');
  ok('c2c dada no mesmo dia, e a família é a dona', fam.every(m => m.home === hB.id) && hB.dono === v.id && S.day === d0 && quieta && mora(h).length === todos - fam.length, `${fam.filter(m => m.home === hB.id).length} de ${fam.length} da família moram na ${lado(hB)}; dono: ${P(hB.dono) ? P(hB.dono).name : 'o povo'}; a casa cheia ficou com ${mora(h).length} para ${camas(h)}; ${v.name} ${!resto ? 'já não precisa de casa' : quieta ? 'tem a família sozinha numa casa sua, pequena para ela (' + fam.length + ' para ' + camas(hB) + '): não levanta outra com as mãos' : 'AINDA precisa de casa (' + resto + '), e a estrada diz ' + JSON.stringify(K.road(v))}`);
  ok('c2d pelo livro, com o pouco que guarda', pg.length === (deve > 0 ? 1 : 0) && (!pg.length || (pg[0][3] === 'h:' + h.id && pg[0][4] === 'f:' + set.fac && Math.abs(pg[0][6] - deve) < 0.011)) && Math.abs((hB.custo || 0) - deve) < 0.011 && mud.length >= 1 && Math.abs(moedas('h:' + hB.id) + moedas('h:' + h.id) - (9 - deve)) < 0.011,
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
  const t = vive(600, () => b.built, () => { for (const o of naObra(b)) { vistos.add(o.id); if (!ids.has(o.id)) estranhos.add(o.id); } });
  if (!ok('c5c a cabana fica de pé', b.built && t > 0, b.built ? `de pé em ${t} s do mundo; trabalharam nela: ${[...vistos].map(id => (P(id) ? P(id).name : '#' + id)).join(', ')}` : `em 600 s a obra ficou em ${Math.round((b.progress || 0) * 100)}%, faltando ${JSON.stringify(b.need)}; na obra: ${naObra(b).map(o => o.name).join(', ') || 'ninguém'}; os crescidos da família: ${fam.filter(m => m.age >= 16).map(m => `${m.name} ${m.task ? m.task.type : '-'}${m.sleeping ? ' (dorme)' : ''}`).join(', ')}`)) return;
  ok('c5d só a família trabalhou nela', vistos.size >= 1 && !estranhos.size && cons.length >= 1, `${vistos.size} da família na obra; de fora da família: ${estranhos.size ? [...estranhos].map(id => `${P(id) ? P(id).name : '#' + id} (${P(id) ? P(id).role : '?'})`).join(', ') : 'ninguém'}; construtores do povo na cidade que não são da família: ${cons.length}`);
  const cargas = livro(n0, e => e[4] === 'o:' + b.id); const deQuem = new Set(cargas.map(e => e[9]));
  const saiu = livro(n0, e => e[3] === 'f:' + set.fac && e[5] === 'wood' && e[8] === 'obra' && ids.has(e[9])).reduce((s, e) => s + e[6], 0);
  ok('c5e a madeira do armazém do povo, pelo livro, pelas mãos da família', cargas.length >= 1 && [...deQuem].every(id => ids.has(id)) && Math.abs(cargas.filter(e => e[5] === 'wood').reduce((s, e) => s + e[6], 0) - G.BDEF.hut.cost.wood) < 0.011 && saiu + 0.011 >= G.BDEF.hut.cost.wood,
    `${cargas.length} carga(s) à obra (${cargas.map(e => e[6] + ' ' + e[5]).join(', ')}), levadas por ${[...deQuem].map(id => (P(id) ? P(id).name : '#' + id)).join(', ')}; do armazém do povo saíram ${r2(saiu)} de madeira pelas mãos da família («obra»)`);
  const vivos = fam.filter(m => S.villagers.has(m.id));
  ok('c5f a família muda e é a dona', vivos.every(m => m.home === b.id) && ids.has(b.dono) && !b.encomenda && Math.abs((b.custo || 0) - pago) < 0.011 && (v.moves || []).some(m => /com as próprias mãos/.test(m[1])), `${vivos.filter(m => m.home === b.id).length} de ${vivos.length} moram na ${lado(b)}; dono: ${P(b.dono) ? P(b.dono).name : 'o povo'}; custou-lhe ${b.custo}; «${(v.moves || []).map(m => m[1]).slice(-1)}»; a casa cheia ficou com ${mora(h).length} para ${camas(h)}`);
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
  const t = vive(600, () => b.built, () => { for (const o of naObra(b)) if (!ids.has(o.id)) estranhos.add(o.id); });
  ok('c6d a família acaba a cabana e muda', b.built && !estranhos.size && fam.map(m => P(m.id)).filter(Boolean).every(m => m.home === b.id) && ids.has(b.dono), b.built ? `de pé ${t} s depois do load; de fora da família na obra: ${estranhos.size || 'ninguém'}; a família mora nela, dono ${P(b.dono) ? P(b.dono).name : 'o povo'}` : `não ficou de pé em 600 s (${Math.round((b.progress || 0) * 100)}%, falta ${JSON.stringify(b.need)})`);
  const c = checa(); ok('c6e verificador', c.ok, c.txt);
});

// ------------------------------ c7: a morte no meio ------------------------------
run('c7', () => {
  const a = obraDasMaos(); if (!ok('c7a a obra da família', !!a && !!a.b, a && a.b ? `${diz(a)}: ${lado(a.b)}` : diz(a))) return;
  const { set, v, fam, b } = a; const par = P(v.partner); const pequenos = fam.filter(m => m.age < 16);
  sim(() => V.kill(v, 'sick'));
  ok('c7b o chefe morre: a obra é do par', b.encomenda && b.encomenda.maos === 1 && b.encomenda.by === par.id && b.dono === par.id && !b.encomenda.fam.includes(v.id), `${v.name} morreu: a obra ${lado(b)} é de ${P(b.dono) ? P(b.dono).name : 'ninguém'} (encomenda por #${b.encomenda.by}, das mãos: ${b.encomenda.maos})`);
  const c1 = checa(); ok('c7c verificador', c1.ok, c1.txt);
  const t = vive(600, () => b.built);
  const ficam = fam.filter(m => S.villagers.has(m.id));
  ok('c7d o par acaba a cabana e a família muda', b.built && ficam.every(m => m.home === b.id) && b.dono === par.id, b.built ? `de pé em ${t} s; ${ficam.filter(m => m.home === b.id).length} de ${ficam.length} da família moram nela; dono: ${P(b.dono) ? P(b.dono).name : 'o povo'}` : `não ficou de pé em 600 s (${Math.round((b.progress || 0) * 100)}%)`);
  // (the two grown ones die: the work is the people's builders' from that moment)
  const a2 = obraDasMaos(); if (!a2 || !a2.b) { ok('c7e os dois morrem', false, 'o caso não se armou de novo'); return; }
  const b2 = a2.b; const par2 = P(a2.v.partner); const crescidos = a2.fam.filter(m => m.age >= 16); madeira(a2.set, 60);
  sim(() => { for (const m of crescidos) V.kill(m, 'sick'); });
  const orf = a2.fam.filter(m => S.villagers.has(m.id));
  ok('c7e os crescidos morrem: a obra passa aos construtores', !!b2.encomenda && !b2.encomenda.maos && S.buildings.has(b2.id), `${crescidos.map(m => m.name).join(' e ')} morreram: a obra ${lado(b2)} ${b2.encomenda ? (b2.encomenda.maos ? 'CONTINUA das mãos da família' : 'é dos construtores do povo') : 'sem encomenda'}; ficaram ${orf.length} pequenos`);
  const c2 = checa(); ok('c7f verificador (sem obra de mãos sem mãos)', c2.ok, c2.txt);
  void par2;
  const t2 = vive(900, () => b2.built);
  ok('c7g os construtores acabam, e os pequenos mudam (ou a casa é do povo)', b2.built && (orf.length ? orf.filter(m => S.villagers.has(m.id)).every(m => m.home === b2.id) : !b2.dono), b2.built ? `de pé em ${t2} s pelas mãos dos construtores; ${orf.length ? orf.filter(m => m.home === b2.id).length + ' de ' + orf.length + ' pequenos moram nela' : 'sem família: a casa é do povo'}` : `não ficou de pé em 900 s (${Math.round((b2.progress || 0) * 100)}%, falta ${JSON.stringify(b2.need)}; construtores na cidade: ${[...S.villagers.values()].filter(o => o.set === a2.set.id && o.role === 'construtor').length})`);
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
  const t = vive(900, () => !S.buildings.has(b.id) || b.built);
  const livres = fam.filter(m => S.villagers.has(m.id) && !m.captive && m.set === set.id);
  ok('c8e a obra acaba: da família livre, ou do povo', !S.buildings.has(b.id) || (b.built && (livres.length ? livres.every(m => m.home === b.id) : !b.dono || !S.villagers.has(b.dono) || true)), !S.buildings.has(b.id) ? 'a obra saiu do chão' : b.built ? `de pé em ${t} s; ${livres.length ? livres.filter(m => m.home === b.id).length + ' de ' + livres.length + ' da família (livres) moram nela' : 'sem família livre: a casa é ' + (b.dono ? 'de #' + b.dono : 'do povo')}` : `não ficou de pé em 900 s (${Math.round((b.progress || 0) * 100)}%, falta ${JSON.stringify(b.need)})`);
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
  const t = b ? vive(600, () => b.built, () => { if (corpo.task && corpo.task.type === 'build') corpoMandado = true; }) : -1;
  ok('c11f os outros crescidos levantam; o corpo não é mandado', !!b && !corpoMandado && (outros.length ? b.built : true), b ? `${outros.length} outro(s) crescido(s) na família: ${b.built ? 'a cabana ficou de pé em ' + t + ' s' : 'a obra em ' + Math.round((b.progress || 0) * 100) + '%'}; o corpo ${corpoMandado ? 'FOI MANDADO à obra' : 'ficou nas mãos do jogador'}` : 'sem obra');
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
  const t = vive(600, () => a2.b.built);
  ok('c12e a família acaba a sua e muda para ela', a2.b.built && a2.fam.filter(m => S.villagers.has(m.id)).every(m => m.home === a2.b.id), a2.b.built ? `de pé em ${t} s; a família mora na ${lado(a2.b)}` : `não ficou de pé (${Math.round((a2.b.progress || 0) * 100)}%)`);
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
  const olha = () => {
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
  };
  olha(); let d = S.day;
  G.Skip.on = true; G.FX.off = true; G.W.pathGreed = 1.3;
  try { while (G.S.day - d0 < ANOS) { G.Main.skipStep(1); if (G.S.day !== d) { d = G.S.day; olha(); } } } finally { G.Skip.on = false; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; }
  pega();
  ok('c15a o verificador da casa cheia, a cada dia do salto', !ruins.length, ruins.length ? ruins.join(' · ') : `${ANOS} anos de salto em ${MUNDO} (dia ${d0} → ${S.day}, ${S.villagers.size} pessoas): nenhuma regra da casa cheia acusada em nenhum dia`);
  const LIM = K.HANDS_DAYS + 6;
  ok('c15b nenhuma casa de várias famílias fica com o dobro além da paciência e da vez', pior <= LIM, `casas-dia ${casasDia}, das quais ${dobroDia} de várias famílias com o dobro da lotação; a que mais durou assim: ${pior} dia(s)${piorQ ? ' (' + piorQ + ')' : ''} (o limite da prova: ${LIM}); casas dadas pelo povo: ${cedidas}; cabanas levantadas com as próprias mãos: ${maos}`);
  ok('c15c as duas estradas foram andadas', cedidas + maos >= 1, `${cedidas} casa(s) do povo dada(s) e ${maos} cabana(s) das mãos de famílias nos ${ANOS} anos`);
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
  S.time = 0.15; const t = vive(600, () => b.built, () => { for (const o of naObra(b)) { visto.add(o.id); if (!ids.has(o.id)) estranhos.add(o.id); } });
  const cargas = livro(n0, e => e[4] === 'o:' + b.id && e[9] === q.id).length;
  ok('c16d o par trabalha na cabana da família', b.built && !estranhos.size && (visto.has(q.id) || cargas > 0), b.built ? `de pé em ${t} s; na obra: ${[...visto].map(id => (P(id) ? P(id).name : '#' + id)).join(', ')} (${q.name}: ${visto.has(q.id) ? 'trabalhou' : 'NÃO foi visto'}, ${cargas} carga(s)); de fora da família: ${estranhos.size || 'ninguém'}` : `não ficou de pé em 600 s (${Math.round((b.progress || 0) * 100)}%)`);
  const fam = K.family(v);
  ok('c16e e muda com ela', b.built && q.home === b.id && v.home === b.id && fam.includes(q) && fam.every(m => m.home === b.id), `${v.name} mora na ${lado(S.buildings.get(v.home))}, ${q.name} na ${lado(S.buildings.get(q.home))}; a família de agora (${fam.length}) inteira na cabana: ${fam.every(m => m.home === b.id) ? 'sim' : 'NÃO'}`);
  const c = checa(); ok('c16f verificador', c.ok, c.txt);
});

console.log(fails.length ? `CASA-CHEIA: ${fails.length} FALHA(S): ${fails.join(', ')}` : `CASA-CHEIA: ok (${ms()} ms)`);
process.exit(fails.length ? 1 : 0);
