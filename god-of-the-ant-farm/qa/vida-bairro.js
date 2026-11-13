// vida-bairro: a vida do bairro (Bairros Vivos) — provocada de propósito.   [ONLY=v3,v6] node qa/vida-bairro.js [mundo]
// O bairro é o que acontece nele: a atividade real do dia entra por uma porta só (G.Urban.note), contada pelo chão onde
// aconteceu (S.urbAcc); na virada do dia de cada cidade as contagens fecham na vida de cada bairro (d.vida, uma média lenta)
// e nos perfis (d.tags), com quatro dias seguidos de paciência; a história diz a causa; a cidade que acaba fica na memória.
// A prova vive o mundo pronto pelo salto do próprio jogo (a mesma simulação, mais depressa) e arma cada caso pela regra do
// jogo; a mão da prova só corta as rotas do mar, dá e tira moedas (as portas do deus: a chuva de moedas, o dragão), mata
// (a peste, pela porta de toda morte) e, para o roubo do v1, põe a paz do deus numa cópia do mundo (T-993).
//  v1 as portas: num dia vivido, cada atividade comum conta (cais, pesca, troca, ofício, campo, armas, fé, noite); uma chave
//     desconhecida é erro; o roubo (a tarefa do jogo) conta um crime no chão da casa roubada
//  v2 o fechamento: no dia de uma cidade, o que o chão dela contou entra na vida do bairro pela conta exata (a média lenta),
//     no todo da cidade também, e a contagem do chão é zerada; o último dia de cada atividade fica guardado
//  v3 o cais que para: um bairro «porto movimentado»; a mão corta as rotas do mar; a carga some, o perfil sai depois da
//     paciência, a história diz «O cais parou: nenhuma carga há N anos»; as rotas voltam, o perfil volta («O cais encheu»)
//  v4 o save no meio do dia: as contagens, a vida, os perfis e a paciência iguais depois do load; e o dia seguinte conta
//     um dia em cada bairro — nem dois, nem nenhum (L-694)
//  v5 o save de antes (sem vida, sem contagens, sem relógios): carrega sem erro e a vida se enche no primeiro dia
//  v6 o bairro que enriquece e empobrece: a chuva de moedas nas casas → «rico», com «Enriqueceu: N das M casas são ricas»;
//     o dragão leva as moedas todo dia → «pobre», e o «rico» sai — no todo de uma cidade (D-153), cujo chão não se divide: as
//     casas ricas de um bairro formam o seu bairro nobre, e o chão do caso ia e voltava entre eles (T-1005)
//  v7 a peste esvazia o bairro: metade das casas sem ninguém → «vazio», e a história diz quem levou («a peste levou N»)
//     (o v6 e o v7 vivem cada um numa cópia do mundo dos primeiros dias, e o mundo dos casos de antes volta para os seguintes:
//     T-1005)
//  v8 a cidade que acaba: todos mortos, a cidade deixada ao vento — os bairros dela ficam na memória do mundo
//     (S.urbPast), o chão ainda responde de quem era (G.Urban.pastAt), e a memória atravessa o save; v8b: onde duas cidades
//     acabaram, o chão responde pela última (L-738)
//  v9 o salto e o passo: o mesmo save vivido um dia pelo salto e um dia pelo passo — nos dois ritmos cada nota é um
//     acontecimento do livro-razão, contado uma vez (a pesca, a carga do cais, as vendas)
//  e o verificador limpo a cada dia, e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | vida-bairro ${name} | ${info}`); if (!c) fails.push(name); };
const U = G.Urban, D = G.Depot;
const r3 = x => Math.round(x * 1000) / 1000;
const towns = () => [...G.S.settlements.values()].sort((a, b) => a.id - b.id);
const quarters = set => (set.urb && set.urb.w ? [set.urb.w] : []).concat(U.districtsOf(set));
const allQ = () => { const o = []; for (const s of towns()) for (const q of quarters(s)) o.push([s, q]); return o; };
const nameOf = (s, q) => (q.whole ? s.name : `${s.name} / ${q.name}`);
const histOf = (q, since) => (q.hist || []).filter(h => h[0] >= since).map(h => h[1]);
// what the checker says of the quarters (the rules of the life, and the old ones of the quarters)
const bad = [];
const check = tag => { for (const x of QA.check()) if ((x.sys === 'bairro' || x.sys === 'urb') && x.sev <= 3 && bad.length < 6) bad.push(`${tag}: [S${x.sev}] ${x.msg}`); };
// a day lived by the skip, the checker after it
const days = (n, each) => { for (let k = 0; k < n; k++) { if (each) each(k); M.saltar(1); check(`ano ${G.S.day}`); } };
// every note the world gives, counted by its kind (the door, wrapped)
const seen = {}; { const note = U.note; U.note = function (x, y, k, n) { seen[k] = (seen[k] || 0) + (n === undefined ? 1 : n); return note.apply(this, arguments); }; }
const life = q => JSON.stringify([q.vida, q.tags, q.tp, q.ult, q.dias, q.luto, q.pg, q.pa, q.cr, q.cells]);
const snapLife = () => JSON.stringify([G.S.urbAcc, allQ().map(([s, q]) => [nameOf(s, q), life(q)])]);
// the sea routes cut by the hand of the proof, as a long blockade does (and what they were, to give back)
let cut = null;
const cutSea = () => { const S = G.S; if (!cut) cut = S.seaRoutes.slice(); S.seaRoutes.length = 0; for (const s of S.ships.slice()) if ((s.kind === 'mercante' || s.route) && G.Naval.removeShip && !G.Naval.aboardOf(s).length) { /* (the ships at sea finish their way: their cargo is theirs) */ } };
const openSea = () => { const S = G.S; if (cut) { for (const r of cut) if (!S.seaRoutes.includes(r) && S.buildings.has(r.a) && S.buildings.has(r.b)) S.seaRoutes.push(r); cut = null; } };

M.pronto(WORLD); M.viver(2);
const S0day = G.S.day;
// ---------------- the first days: the life fills, the profiles come ----------------
days(U.YOUNG + U.PATIENCE + 1);
// (the world after the first days, for the rich and the plague: they live their days each on a copy of it — T-1005, below)
const fresh = on('v6') || on('v7') ? G.Save.serialize() : null;

// ---------------- v1 the doors ----------------
if (on('v1')) {
  const need = ['cais', 'pesca', 'troca', 'oficio', 'campo', 'armas', 'fe', 'noite'];
  const miss = need.filter(k => !(seen[k] > 0));
  let threw = false; try { G.inSim++; U.note(10, 10, 'xpto', 1); } catch (e) { threw = /chave desconhecida/.test(String(e.message)); } finally { G.inSim--; }
  // a theft, by the game's own errand: a thief of a town, a house with coins in reach; the count on the house's ground
  // (in the god's peace, and on a copy of the world: in the metrópole of the generation 20 its peoples are at war in these days,
  // and each thief the proof chose left the errand to flee the enemy, to muster or to fight — «o roubo NÃO aconteceu», T-993 —:
  // the game's own power, as the freguesia lives its days (T-910), the alarms down and a few seconds for the bands to go home;
  // the world as it was given back after the theft, for the parts that follow)
  const snap = G.Save.serialize();
  G.inSim++; try { G.Politics.divinePeace(); for (const s of G.S.settlements.values()) if (s.alarmT > 0) s.alarmT = 0; } finally { G.inSim--; } M.viver(5);
  const S = G.S; let stole = null;
  for (const set of towns().filter(s => G.Village.pop(s.id) >= 20).slice(0, 4)) {
    const h = [...S.buildings.values()].find(b => b.set === set.id && b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && (b.coin || 0) >= 6);
    const th = h && [...S.villagers.values()].find(v => v.set === set.id && v.age >= 18 && v.age < 55 && v.home !== h.id && !v.captive && !v.jail && !v.aboard && !v.carry && !v.inside && !(S.avatar && S.avatar.id === v.id) && !G.Vg.handsBusy(v) && G.W.reaches(v, h.x + 0.5, h.y + h.h + 0.5));
    if (!th) continue;
    const c = U.cellOf(h.x + h.w / 2, h.y + h.h / 2); const before = ((S.urbAcc || {})[c] || {}).crime || 0; const t0 = th.thefts || 0;
    S.time = 0.9; th.hunger = 5; th.energy = 95; G.Vg.endTask(th);
    G.Vg.give(th, { type: 'furto', house: h.id, pri: 2.05, st: 0, kind: 'furto' });
    for (let k = 0; k < 600 && (th.thefts || 0) === t0 && th.task && th.task.type === 'furto'; k++) M.viver(0.1);
    if ((th.thefts || 0) > t0) { stole = { town: set.name, n: (((S.urbAcc || {})[c] || {}).crime || 0) - before }; break; }
  }
  M.abrir(JSON.parse(snap)); // (the world before the god's peace: T-993)
  ok('v1 as-portas', !miss.length && threw && !!stole && stole.n === 1,
    `em ${G.S.day - S0day} dias: ${need.map(k => `${k} ${Math.round(seen[k] || 0)}`).join(', ')}${miss.length ? ` — SEM: ${miss.join(', ')}` : ''}; chave desconhecida: ${threw ? 'erro dito' : 'ACEITA'}; o roubo ${stole ? `em ${stole.town} contou ${stole.n} crime no chão da casa` : 'NÃO aconteceu'}`);
}

// ---------------- v2 the close: the exact fold ----------------
if (on('v2')) {
  const S = G.S; M.saltar(1); // (a fresh day: every town had its close)
  // a quarter with a name and its town; the hand counts three sales on its first patch of ground — by the door
  const pick = allQ().find(([s, q]) => !q.whole && q.cells.length >= 2 && q.dias >= 3);
  if (!pick) ok('v2 o-fechamento', false, 'nenhum bairro com nome e três dias de vida');
  else {
    const [set, d] = pick; const w = set.urb.w; const [cx, cy] = U.cellXY(d.cells[0]);
    const v0 = d.vida.troca || 0, w0 = w.vida.troca || 0, dias0 = d.dias, wd0 = w.dias;
    // (what the ground already counted today, the world's own: it closes with the hand's three)
    const own = q => q.cells.reduce((n, c) => n + (((S.urbAcc || {})[c] || {}).troca || 0), 0);
    G.inSim++; try { U.note(cx + 1, cy + 1, 'troca', 3); } finally { G.inSim--; }
    // until the town's next close (the day turns, then one town a step)
    let lived = 0; const dsum = [], wsum = [];
    for (; lived < 4000 && d.dias === dias0; lived++) { dsum.push(own(d)); wsum.push(own(w)); M.viver(0.1); }
    const cd = dsum[dsum.length - 1], cw = wsum[wsum.length - 1];
    const a = Math.max(0.2, 1 / (dias0 + 1)), aw = Math.max(0.2, 1 / (wd0 + 1));
    const want = r3(v0 * (1 - a) + cd / d.cells.length * a), wantW = r3(w0 * (1 - aw) + cw / w.cells.length * aw);
    const left = d.cells.reduce((n, c) => n + (((S.urbAcc || {})[c] || {}).troca || 0), 0);
    ok('v2 o-fechamento', d.dias === dias0 + 1 && Math.abs(d.vida.troca - want) < 0.0011 && Math.abs(w.vida.troca - wantW) < 0.0011 && d.ult.troca === S.day && cd >= 3 && left <= 1,
      `${nameOf(set, d)} (${d.cells.length} chãos, ${dias0} dias): ${cd} vendas contadas no dia (3 pela mão) → vida.troca ${v0} → ${d.vida.troca} (a conta: ${want}); o todo de ${set.name} ${w0} → ${w.vida.troca} (a conta: ${wantW}); último dia de troca ${d.ult.troca} (hoje ${S.day}); no chão ficou ${left}`);
  }
}

// ---------------- v4 a save in the middle of the day ----------------
if (on('v4')) {
  const S = G.S; M.viver(60); // (well into a day: the ground has counts, some profiles are counting their days)
  const before = snapLife(); const accN = Object.keys(S.urbAcc || {}).length; const pend = allQ().filter(([, q]) => Object.keys(q.tp || {}).length).length;
  const dias0 = new Map(allQ().map(([s, q]) => [nameOf(s, q), q.dias])); const day0 = S.day;
  M.salvarCarregar();
  const after = snapLife(); check('depois do load');
  // (the same day goes on: three steps on, no quarter has a day more; then the next day: each one a day more, no more)
  M.viver(0.3); const early = allQ().filter(([s, q]) => q.dias !== dias0.get(nameOf(s, q))).map(([s, q]) => nameOf(s, q));
  while (G.S.day === day0) M.viver(5); M.viver(30);
  const wrong = allQ().filter(([s, q]) => dias0.has(nameOf(s, q)) && q.dias !== dias0.get(nameOf(s, q)) + 1).map(([s, q]) => `${nameOf(s, q)} ${dias0.get(nameOf(s, q))}→${q.dias}`);
  ok('v4 o-save-no-meio', before === after && accN > 0 && !early.length && !wrong.length,
    `salvo no meio do ano ${day0} com contagens em ${accN} chãos e ${pend} bairro(s) contando os dias de um perfil: depois do load ${before === after ? 'tudo igual' : 'DIFERENTE'}; no mesmo dia ${early.length ? early.length + ' bairro(s) ganharam OUTRO dia: ' + early.slice(0, 3).join(', ') : 'nenhum ganhou outro dia'}; no dia seguinte ${wrong.length ? 'ERRADOS: ' + wrong.slice(0, 4).join(', ') : 'cada bairro contou um dia'}`);
}

// ---------------- v3 the quay that stops ----------------
if (on('v3')) {
  const S = G.S;
  const port = allQ().filter(([, q]) => !q.whole && U.is(q, 'porto')).sort((a, b) => (b[1].vida.cais || 0) - (a[1].vida.cais || 0))[0];
  if (!port) ok('v3 o-cais-que-para', false, `nenhum bairro «porto movimentado» em ${WORLD} depois de ${G.S.day - S0day} dias (${allQ().filter(([, q]) => !q.whole && q.k === 'porto').map(([s, q]) => `${nameOf(s, q)} cais ${q.vida.cais}`).join('; ') || 'nenhum bairro de porto'})`);
  else {
    const [set, d] = port; const c0 = d.vida.cais, day0 = S.day; let gone = -1, still = -1;
    for (let k = 0; k < 34 && gone < 0; k++) { cutSea(); M.saltar(1); check(`ano ${S.day} (rotas cortadas)`); if (!U.is(d, 'porto')) gone = S.day - day0; }
    if (U.is(d, 'parado')) still = S.day - day0;
    const h1 = histOf(d, day0); const told = h1.find(t => /^O cais parou: /.test(t)); const cMid = d.vida.cais; const mid = S.day;
    // the routes back: the cargo comes again, and the profile after its patience
    // (the quarter of the quay's ground, as the town draws it now: a port quarter with no cargo for years can lose its ground to
    // a neighbour — its cluster is no longer a port's —, and the cargo that returns makes a new one on the quay. Hedeby's «Cais
    // dos Barcos do Norte» was swallowed in the years of the cut, and the «Cais dos Barcos do Leste» born on the same quay had
    // 7,4 of cargo a day while the proof read the 0,482 of a quarter that was no longer the town's, T-869)
    const quay = () => { if (U.districtsOf(set).includes(d)) return d; for (const b of [...S.buildings.values()].filter(q => q.set === set.id && q.type === 'doca' && q.built).sort((a, b) => a.id - b.id)) { const q = U.districtAt(b.x + b.w / 2, b.y + b.h / 2); if (q) return q; } return d; };
    openSea(); let back = -1;
    for (let k = 0; k < 30 && back < 0 && gone >= 0; k++) { M.saltar(1); check(`ano ${S.day} (rotas de volta)`); if (U.is(quay(), 'porto')) back = S.day - mid; }
    const d2 = quay(); const other = d2 !== d ? ` (o bairro de antes perdeu o chão nos anos sem carga; no chão do cais, agora, ${nameOf(set, d2)}, nascido no ano ${d2.born})` : '';
    const h2 = histOf(d2, mid); const told2 = h2.find(t => /^O cais encheu/.test(t));
    ok('v3 o-cais-que-para', gone >= U.PATIENCE && !!told && /nenhuma carga há \d+ anos|cada vez menos carga/.test(told) && back >= U.PATIENCE && !!told2,
      `${nameOf(set, d)}: cais ${c0} por chão por dia; rotas cortadas → ${gone >= 0 ? `o perfil saiu em ${gone} dias (cais ${cMid})` : 'o perfil NÃO saiu em 34 dias (cais ' + d.vida.cais + ')'}; a história: «${told || '(nada)'}»${still >= 0 ? `; «parado» aos ${still} dias` : ''}; rotas de volta → ${back >= 0 ? `o perfil voltou em ${back} dias: «${told2 || '(nada)'}»` : 'o perfil NÃO voltou em 30 dias (cais ' + d2.vida.cais + ')'}${other}`);
  }
  openSea();
}

// ---------------- v6 the quarter that grows rich, and poor ----------------
// (the case of the rich and the case of the plague live their days each on a copy of the world as it was after the first days,
// and the world of the cases before them is given back after them, for the ones that follow: they armed their premise on the
// world the cases before left — and the cases before cut the sea for up to sixty days (v3); in the generation 20 the metrópole
// came to the rich one on its day 103 with its great cities half empty, Argos with 3 of 20 homes lived, Hedeby 4 of 26,
// Tenochtitlan 16 of 36 —: no town nor quarter was left to grow rich, and the plague found its quarter «vazio» already, «vazio
// em 1 dias». As the v1 lives its theft in a copy of the world, T-993. T-1005)
let Q6 = null, Q6v = null; const before6 = fresh ? G.Save.serialize() : null;
function pick6() {
  const S = G.S; Q6 = null; Q6v = null;
  // a quarter of homes with people, in a people of coin, not rich yet — nor poor, nor on its way to it: the life of a quarter
  // is a slow mean, and one that was «pobre» before the rain was still «pobre» six days into it, with eight of its nine homes
  // rich; the dragon's first day then read «pobre em 1 dia», with no line of its own in the history (T-692)
  const homesOf = d => [...S.buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && b.type !== 'barraco' && d.cells.includes(U.cellOf(b.x + b.w / 2, b.y + b.h / 2)) && b.set === d.set);
  const lived = b => [...S.villagers.values()].some(v => v.home === b.id && v.age >= 16 && !v.captive);
  // (and in a town that stays a city when the plague of v7 has taken the quarter's people — all but one home's —: a town's
  // quarters are a city's, of the rank 3 and up (urban.js, clusters), and a city of under 30 falls a rank (city.js, Ci.tierOf).
  // The quarter with the most homes lived in of the metrópole of the generation 20 was the Burgo Velho of Hedeby, a city of 51:
  // the plague took 20, the town fell to a vila, and the next day its quarters had no ground — «(0 casas): NÃO esvaziou» —,
  // the first day after the plague its homes nine in ten empty, T-1060)
  const plague = q => { const hs = homesOf(q), keep = hs.filter(lived)[0]; const ids = new Set(hs.filter(b => b !== keep).map(b => b.id)); let n = 0; for (const v of S.villagers.values()) if (ids.has(v.home)) n++; return n; };
  const holds = (s, q) => (s.tier || 0) >= 3 && G.Village.pop(s.id) - plague(q) >= 36;
  const cand = allQ().filter(([s, q]) => !q.whole && q.dias >= U.YOUNG && G.Eco.coinage(s.fac) && !U.is(q, 'nobre') && !(q.tp || {}).nobre && (q.vida.rica || 0) < 0.3 && !U.is(q, 'pobre') && !(q.tp || {}).pobre && homesOf(q).filter(lived).length >= 4 && holds(s, q))
    .sort((a, b) => homesOf(b[1]).filter(lived).length - homesOf(a[1]).filter(lived).length)[0];
  if (cand) Q6 = { set: cand[0], d: cand[1], homes: () => homesOf(cand[1]), lived };
  // (the quarter of v6 is one whose ground holds while its homes grow rich: the whole of a town — a village is a quarter of its
  // own, and a city has its whole over its quarters, D-153 —, whose ground is the town's and never splits; by the same rule, with
  // three in four of its homes lived in — the share of rich homes is over all the homes, the empty ones too —, the most peopled
  // first, in another town than v7's quarter where there is one; a town's quarter only where no town has such a whole. The rain
  // of coins makes every home of a quarter rich, and rich homes vote for a noble quarter: in the metrópole of the generation 20
  // the old town of Hedeby (of Mênfis, in the whole prova) gave its rich homes to a noble quarter born of them, the «Bairro dos
  // Jarls», and the ground of the case's quarter went back and forth between them and another day by day — 8 cells, 5, 8, 5, 4,
  // 3, none, 3 —: no quarter held the four days of patience, «(0 casas): NÃO ficou rico em 12 dias»; and a small village was
  // emptying in those days (Uppsala, four homes lived of six, then two: «rica 0.428», never the mark). T-1005)
  if (on('v6')) {
    const share = q => { const h = homesOf(q); return h.length ? h.filter(lived).length / h.length : 0; };
    const w6 = towns().filter(s => G.Eco.coinage(s.fac) && s.urb && s.urb.w).map(s => [s, s.urb.w])
      .filter(([s, q]) => q.dias >= U.YOUNG && !U.is(q, 'nobre') && !(q.tp || {}).nobre && (q.vida.rica || 0) < 0.3 && !U.is(q, 'pobre') && !(q.tp || {}).pobre && homesOf(q).filter(lived).length >= 4 && share(q) >= 0.75)
      .sort((a, b) => (Q6 && a[0] === Q6.set) - (Q6 && b[0] === Q6.set) || homesOf(b[1]).filter(lived).length - homesOf(a[1]).filter(lived).length || a[0].id - b[0].id)[0];
    Q6v = w6 ? { set: w6[0], d: w6[1], homes: () => homesOf(w6[1]), lived } : Q6;
  }
}
if (on('v6')) {
  M.abrir(JSON.parse(fresh)); pick6();
  if (!Q6v) ok('v6 rico-e-pobre', false, 'nenhuma cidade nem bairro com quatro casas habitadas num povo de moeda, ainda não rico nem pobre');
  else {
    const S = G.S; const { set, d } = Q6v; const day0 = S.day;
    // the rain of coins on every home (the god's door), every day while it lasts
    const rain = () => { G.inSim++; try { for (const b of Q6v.homes()) if ((b.coin || 0) < 60) D.make('h:' + b.id, 'moedas', 60 - (b.coin || 0), { code: 'chuva-de-moedas', part: true }); } finally { G.inSim--; } };
    let rich = -1; for (let k = 0; k < 12 && rich < 0; k++) { rain(); M.saltar(1); check(`ano ${S.day} (chuva)`); if (U.is(d, 'nobre')) rich = S.day - day0; }
    const t1 = histOf(d, day0).find(t => /^Enriqueceu: \d+ das \d+ casas são ricas\.$/.test(t)); const mid = S.day;
    // the dragon takes the coins of every home, every day — the household's: the pot, and the purses of who lives there, which the
    // town's day pours into the pot (L-973): with the pots alone, the purses filled them again before the day's look, and the
    // whole of Tenochtitlan had half its homes with next to nothing, «pobre 0.392» on the tenth day, short of the patience (T-1005)
    const dragon = () => { G.inSim++; try { const hs = Q6v.homes(), ids = new Set(hs.map(b => b.id)); for (const b of hs) if ((b.coin || 0) > 0) D.use('h:' + b.id, 'moedas', b.coin, { code: 'dragao', mine: true }); for (const v of S.villagers.values()) if (ids.has(v.home) && (v.purse || 0) > 0) D.use('p:' + v.id, 'moedas', v.purse, { code: 'dragao', mine: true }); } finally { G.inSim--; } };
    const top = d.vida.rica; let poor = -1; for (let k = 0; k < 16 && poor < 0; k++) { dragon(); M.saltar(1); dragon(); check(`ano ${S.day} (dragão)`); if (U.is(d, 'pobre')) poor = S.day - mid; }
    const h2 = histOf(d, mid); const t2 = h2.find(t => /^Empobreceu: /.test(t)); const t3 = h2.find(t => /^Deixou de ser rico: /.test(t)); const notRich = U.is(d, 'nobre') ? -1 : S.day - mid;
    // (the homes of the nobles stay rich by their standing, with no coin in the pot: the share of rich homes falls, and the
    // profile goes only where it falls below its mark)
    ok('v6 rico-e-pobre', rich >= U.PATIENCE && !!t1 && poor >= U.PATIENCE && !!t2 && d.vida.rica < top - 0.1,
      `${nameOf(set, d)}${d.whole ? ' (o todo da cidade)' : ''} (${Q6v.homes().length} casas): a chuva de moedas → ${rich >= 0 ? `«rico» em ${rich} dias: «${t1 || '(nada)'}»` : 'NÃO ficou rico em 12 dias (rica ' + d.vida.rica + ')'}; o dragão → ${poor >= 0 ? `«pobre» em ${poor} dias: «${t2 || '(nada)'}»` : 'NÃO ficou pobre em 16 dias (pobre ' + d.vida.pobre + ')'}; as casas ricas ${top} → ${d.vida.rica} do bairro${notRich >= 0 ? `, e o «rico» saiu: «${t3 || '(sem linha ainda)'}»` : ' (as dos nobres seguem ricas pelo título: o «rico» fica)'}`);
  }
}

// ---------------- v7 the plague empties the quarter ----------------
if (on('v7')) {
  M.abrir(JSON.parse(fresh)); pick6();
  if (!Q6) ok('v7 a-peste', false, 'nenhum bairro com quatro casas habitadas');
  else {
    const S = G.S; const { set, d } = Q6; const day0 = S.day;
    // the plague takes everyone of the homes of the quarter but one home's people (by the door of every death)
    const homes = Q6.homes().filter(Q6.lived); const spare = homes[0]; let dead = 0;
    G.inSim++; try { for (const v of [...S.villagers.values()]) if (v.home && v.home !== spare.id && homes.some(b => b.id === v.home) && !(S.avatar && S.avatar.id === v.id)) { G.Village.kill(v, 'sick'); dead++; } } finally { G.inSim--; }
    // (and nobody moves in while the case lasts: who comes to an empty home of the quarter is taken by the plague too)
    const again = () => { G.inSim++; try { for (const v of [...S.villagers.values()]) if (v.home && v.home !== spare.id && Q6.homes().some(b => b.id === v.home)) { G.Village.kill(v, 'sick'); dead++; } } finally { G.inSim--; } };
    let empty = -1; for (let k = 0; k < 10 && empty < 0; k++) { M.saltar(1); if (k < 6) again(); check(`ano ${S.day} (peste)`); if (U.is(d, 'vazio')) empty = S.day - day0; }
    const t = histOf(d, day0).find(x => /^Esvaziou: \d+ das \d+ casas estão sem ninguém/.test(x));
    ok('v7 a-peste', dead >= 3 && empty >= U.PATIENCE && !!t && /a peste levou \d+ dos que moravam aqui/.test(t) && (d.luto || {}).peste > 0,
      `${nameOf(set, d)}: a peste levou ${dead}; ${empty >= 0 ? `«vazio» em ${empty} dias` : 'NÃO esvaziou em 12 dias (vazia ' + d.vida.vazia + ', casas ' + ((d._st || {}).homes) + ')'}; a história: «${t || '(nada)'}»`);
  }
}

if (before6) M.abrir(JSON.parse(before6)); // (the world the cases before left, for the ones that follow: T-1005)

// ---------------- v8 the town that ends ----------------
if (on('v8')) {
  const S = G.S;
  const set = towns().filter(s => G.Village.pop(s.id) >= 3 && s.urb && s.urb.w && s.urb.w.cells.length >= 2 && s.urb.w.dias >= 3).sort((a, b) => G.Village.pop(a.id) - G.Village.pop(b.id) || a.id - b.id)[0];
  if (!set) ok('v8 a-cidade-que-acaba', false, 'nenhuma cidade pequena com vida contada');
  else {
    const name = set.name, id = set.id, cells = set.urb.w.cells.slice(), nd = U.allDistrictsOf(set).filter(d => d.cells.length && S.day - d.born >= 3).length, past0 = (S.urbPast || []).length;
    G.inSim++; try { for (const v of [...S.villagers.values()]) if (v.set === id && !(S.avatar && S.avatar.id === v.id)) G.Village.kill(v, 'sick'); } finally { G.inSim--; }
    for (let k = 0; k < 600 && S.settlements.has(id); k++) M.viver(1);
    const gone = !S.settlements.has(id); const mine = (S.urbPast || []).filter(p => p.set === id);
    const [cx, cy] = U.cellXY(cells[0]); const at = U.pastAt(cx + 1, cy + 1); const live = U.at(cx + 1, cy + 1);
    check('a cidade acabou');
    M.salvarCarregar(); const at2 = U.pastAt(cx + 1, cy + 1); const mine2 = (G.S.urbPast || []).filter(p => p.set === id);
    ok('v8 a-cidade-que-acaba', gone && mine.length === nd + 1 && mine.some(p => p.whole && p.name === name) && !!at && at.town === name && (!live || live.set !== id) && !!at2 && at2.town === name && mine2.length === mine.length && mine.every(p => p.hist[p.hist.length - 1][1] === `${name} foi deixada ao vento.`),
      `${name}: ${gone ? 'deixada ao vento' : 'NÃO foi abandonada em 600 s'}; na memória do mundo ${mine.length} (o todo e ${nd} bairro(s); antes ${past0}); o chão dela ${at ? `responde «${at.name}, de ${at.town}» (acabou no ano ${at.ended})` : 'NÃO responde'}; depois do save ${at2 ? 'responde igual' : 'ESQUECEU'}`);
    // v8b: the ground where two towns ended answers the one that ended last — the test's hand writes, before this town's memory,
    // the memory of an older town that lived and ended on the same ground, a day of the index after (U.ver). The whole of a town
    // took a patch of ground only where no memory had it: in the generation 20 the metrópole's ground of Abidos (of Tíbur, in
    // another life) answered «Roma, de Roma (acabou no ano 74)» — L-738
    const P = G.S.urbPast || []; const w = P.find(p => p.set === id && p.whole);
    if (!w) ok('v8b o chão de duas cidades que acabaram responde pela última', false, `${name}: sem o todo na memória`);
    else {
      const old = Object.assign({}, w, { town: 'Antiga', name: 'Antiga', set: -1, ended: w.ended - 30, born: (w.born || 0) - 60, hist: [[w.ended - 30, 'Antiga foi deixada ao vento.']] });
      P.unshift(old); U.ver++; const a3 = U.pastAt(cx + 1, cy + 1); P.splice(P.indexOf(old), 1); U.ver++; const a4 = U.pastAt(cx + 1, cy + 1);
      ok('v8b o chão de duas cidades que acabaram responde pela última', !!a3 && a3.town === name && !!a4 && a4.town === name, `uma cidade mais velha, «Antiga», acabou no mesmo chão de ${name} 30 anos antes: o chão ${a3 ? `responde «${a3.name}, de ${a3.town}»` : 'NÃO responde'}; sem ela, ${a4 ? `«${a4.town}»` : 'nada'}`);
    }
  }
}

// ---------------- v5 the save of before ----------------
if (on('v5')) {
  const o = JSON.parse(G.Save.serialize());
  delete o.urbAcc; delete o.urbPast; delete o.mod;
  for (const s of o.settlements) if (s.urb) { delete s.urb.w; for (const d of s.urb.d || []) for (const k of ['vida', 'tags', 'tp', 'ult', 'dias', 'luto', 'pg', 'pa', 'cr']) delete d[k]; }
  G.Save.apply(o); check('o save de antes, aberto');
  const none = allQ().every(([, q]) => q.vida === undefined) && !towns().some(s => s.urb && s.urb.w);
  M.saltar(1); check('o save de antes, um dia depois'); M.viver(40);
  const filled = towns().filter(s => G.Village.pop(s.id) > 0).every(s => s.urb && s.urb.w && s.urb.w.vida && s.urb.w.dias >= 1) && allQ().every(([, q]) => q.vida && q.dias >= 1 && Array.isArray(q.tags));
  ok('v5 o-save-de-antes', none && filled && M.limpo(), `aberto sem vida nenhuma: ${none ? 'sim' : 'NÃO'}; um dia depois ${filled ? `cada cidade e cada bairro com a vida contada (${allQ().length} ao todo)` : 'FALTA vida em: ' + allQ().filter(([, q]) => !q.vida).map(([s, q]) => nameOf(s, q)).slice(0, 4).join(', ')}`);
}

// ---------------- v9 the skip and the step ----------------
// (the same save lived a day by the skip and a day by the step. The two lives part — the weather is drawn anew, and a storm
// keeps the boats ashore in one of them —, so what is compared is not how much happened but that each thing that happened
// was counted once, in both rhythms: the notes of each kind against the book's own lines of the same events)
if (on('v9')) {
  const snap = G.Save.serialize();
  // (the book heard as it is written: a whole day of the metropolis does not fit in the four thousand lines it keeps)
  let book = null; D.onMove.push(e => { if (!book) return; const good = e[5] !== 'moedas';
    if (e[8] === 'pesca') book.fish += e[6]; else if (e[8] === 'desembarque') book.landed += e[6]; else if (e[8] === 'navio-luxo') book.lux += e[6];
    else if (good && (e[8] === 'venda' || e[8] === 'compra' || (e[8] === 'feira' && String(e[3])[0] === 'b')) && String(e[4])[0] === 'v') book.sales++; });
  const run = fn => {
    G.Save.apply(JSON.parse(snap)); for (const k in seen) delete seen[k]; const S = G.S; const d0 = S.day; book = { fish: 0, landed: 0, lux: 0, sales: 0 }; fn();
    const b = book; book = null;
    return { days: S.day - d0, n: Object.assign({}, seen), fish: r3(b.fish), landed: r3(b.landed), lux: r3(b.lux), sales: b.sales, cut: false };
  };
  const A = run(() => M.saltar(1)); const B = run(() => { const d0 = G.S.day; while (G.S.day < d0 + 1) M.viver(10); });
  const fine = R => !R.cut && Math.abs((R.n.pesca || 0) - R.fish) < 0.01 && (R.n.cais || 0) + 0.01 >= R.landed + R.lux && (R.n.troca || 0) === R.sales;
  const say = R => `pesca ${Math.round(R.n.pesca || 0)} (no livro ${Math.round(R.fish)}), cais ${Math.round(R.n.cais || 0)} (no livro: ${Math.round(R.landed)} desembarcados e ${Math.round(R.lux)} de carga fina a bordo; o resto, a carga comum a bordo), troca ${R.n.troca || 0} (no livro ${R.sales} vendas)${R.cut ? ' — O LIVRO DO DIA NÃO COUBE' : ''}`;
  ok('v9 o-salto-e-o-passo', A.days === 1 && B.days === 1 && fine(A) && fine(B), `um dia do mesmo save — no salto: ${say(A)}; no passo: ${say(B)}`);
}

ok('verificador', !bad.length, bad.length ? bad.slice(0, 4).join(' · ') : `limpo a cada dia (${G.S.day - S0day} dias vividos)`);
const e = M.erros();
ok('erros', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso' : JSON.stringify(e).slice(0, 300));
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
