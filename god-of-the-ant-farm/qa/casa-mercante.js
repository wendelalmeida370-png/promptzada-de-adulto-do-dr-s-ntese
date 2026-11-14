// casa-mercante: a casa mercante é da família, não das paredes (D-158, L-711).   [ONLY=k2,k4] node qa/casa-mercante.js [mundo]
// A família que enriquece no comércio ganha a bandeira na porta (trade.js: h.elite, com a conta do comércio da casa). A marca
// ficava no prédio para sempre: a família se mudava, a casa era alugada a estranhos, e quem morava ali com duas moedas no pote
// contava como casa de mercadores — na classe dos mercadores do povo (polity.js), nas casas ricas e no bairro nobre da cidade
// (urban.js), na bandeira que se vê. Agora a bandeira é da família (e.dono, quem a ganhou, e depois dele quem da casa herda):
// uma vez por dia em cada cidade, a família que se mudou leva a bandeira para a casa onde mora; a casa sem ninguém da
// família fica sem ela.
// A mão da prova põe a bandeira numa casa como o jogo põe (a marca que os anos de comércio dão) e muda a família de casa como
// qualquer mudança a deixa; a morte é a do jogo (G.Village.kill), e os dias, os do salto.
// k1 a família em casa: a bandeira fica, vista pelo dia da cidade;
// k2 a família se muda: a bandeira e a conta do comércio vão com ela, a casa antiga fica sem;
// k3 quem tinha a bandeira morre com alguém da família na casa: a bandeira passa (o par, o filho mais velho), e fica;
// k4 quem tinha a bandeira morre sem ninguém da família na casa: a bandeira desce, e a crônica diz;
// k5 um save de antes (a marca sem a família escrita): a bandeira vai para onde mora o dono da casa — fica, se ele mora nela
//    (e, se ele morre no dia, para onde mora o herdeiro das casas, como no k10: T-1161);
// k6 save e load: a marca e a família atravessam o save, e o dia seguinte é igual;
// k7 o verificador: a bandeira deixada nas paredes de uma casa de estranhos é acusada (S3), e o dia da cidade a conserta
//    (ou a família vem morar nessa casa no dia — um casamento —, e a bandeira está onde ela mora: T-1162);
// k8 quem tinha a bandeira morre e na casa só ficam irmãos pequenos: a bandeira é do mais velho deles, e fica (L-713);
// k9 a família se muda e quem tinha a bandeira morre antes da ronda do dia: a bandeira é de quem da família mora na casa
//    nova, e vai para lá (L-721);
// k10 a bandeira de um save de antes (sem a família escrita) cujo dono morre antes da primeira ronda: as casas passam ao
//    herdeiro na morte, e a ronda leva a bandeira para onde ele mora (T-836: a regra vale; o caso não existia)
// k11 quem tinha a bandeira morre, ela passa ao par, e o par morre também antes da ronda, com um irmão de quem a ganhou na
//    casa (e ninguém da família do par): a bandeira é desse irmão, e fica (L-736)
// e nenhum erro.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casa-mercante ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
let S = M.pronto(WORLD);
const said = id => QA.check().filter(q => q.sys === 'eco' && /bandeira da casa de mercadores/.test(q.msg) && q.msg.includes('#' + id + ':')).map(q => `[S${q.sev}] ${q.msg}`);
const res = h => [...S.villagers.values()].filter(v => v.home === h.id && !v.captive);
const used = new Set();
const isHome = b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && b.type !== 'barraco' && !b.upgradeFrom && !b.elite;
// a house of a town of rank 2 or more whose owner lives in it with the family — `min` of them or more, `grown` grown
function house(min, pred) {
  for (const b of [...S.buildings.values()].sort((a, c) => a.id - c.id)) {
    if (used.has(b.id) || !isHome(b)) continue; const set = S.settlements.get(b.set); if (!set || (set.tier || 0) < 2 || !G.Fac.get(set.fac)) continue;
    const l = res(b); const o = l.find(v => v.id === b.dono); if (!o || o.age < 18 || l.length < (min || 1) || l.some(v => v.jail || v.aboard || (S.avatar && S.avatar.id === v.id))) continue;
    if (pred && !pred(b, l, o)) continue;
    used.add(b.id); return { b, l, o, set };
  }
  return null;
}
// (the owner with kin of his or hers in the house — the partner or a child —: the house of a family. The owner alone among
// strangers is k4's: one who dies in the days of a case — old age, the war — leaves the banner to nobody of the family, and it
// comes down, as the rule has it. In the metrópole of the generation 20 the first house of k1 was house#2911 of Tenochtitlan:
// Citlalin, 64, with no partner and no child, lived there with five of another family, died of old age the first day, and «dois
// dias depois a bandeira SUMIU» — the cases where the family has to be there to keep the banner ask a family: T-1001, as the
// T-836 of k5)
const kinIn = (b, l, o) => l.some(v => v.id !== o.id && (v.id === o.partner || v.mother === o.id || v.father === o.id));
// an empty house of the same town, the people's — with beds for n, when the case moves a family into it: a family of six put
// in a hut of four is one the town's day moves on (the people's empty house, given or bought — D-221), T-829
const empty = (set, n) => [...S.buildings.values()].sort((a, c) => a.id - c.id).find(b => b.set === set.id && isHome(b) && !used.has(b.id) && !res(b).length && (!n || G.BDEF[b.type].housing >= n)) || null;
// (the family moved on in the day, after the day's round of the banners: the banner follows at the next round — one day more)
const lag = (name, since) => { const x = bannersOf(name, since)[0]; const hd = x && P(x.elite.dono); return !!x && !!hd && !!hd.home && hd.home !== x.id; };
// the banner as the game gives it (trade.js checkElite): the years of trade stood in for by the test's hand
const banner = (h, v, extra) => god(() => { h.trade = 60; h.tradeGood = 'tecido'; h.elite = Object.assign({ k: 'tecido', since: S.day - 3, fam: v.name, dono: v.id, ok: S.day }, extra || {}); return h.elite; });
// (a day of the world — and on, until every town has had the day's round of the social.js, where the banners are looked at:
// the jump stops at the very step the day turns, with the round of the new day still to begin, and a hand that acts there was
// followed by no day of the first town of the round. T-813)
const rounded = () => G.mod('social.day') === G.S.day && G.mod('social.cur') >= G.S.settlements.size;
const day = n => { for (let k = 0; k < (n || 1); k++) M.saltar(1); for (let g = 0; g < 600 && !rounded(); g++) M.viver(0.1); S = G.S; };
// the banner of a family, wherever it is now: the houses that carry it — the family's name and the day it was given. In the
// year of a case the family may move again by the world's own hand: a merchant house is rich, and a rich family on cheap
// ground buys the dear house (social.js, D-159) — the banner goes with it, as the rule has it, and the case follows the
// family, not the walls (T-699)
const bannersOf = (name, since) => [...S.buildings.values()].filter(x => x.elite && x.elite.fam === name && x.elite.since === since).sort((a, c) => a.id - c.id);
const B = id => S.buildings.get(id), P = id => S.villagers.get(id);
const none = n => ok(n, false, 'nenhuma casa que sirva ao caso (o dono morando nela com a família, numa cidade de degrau 2 ou mais)');

// ---------------------------------------------------------------- k1
if (on('k1')) {
  const c = house(2, kinIn);
  if (!c) none('k1 a família em casa: a bandeira fica');
  else {
    const { b, o, set } = c; banner(b, o); const d0 = S.day; day(2);
    const h = B(b.id), e = h && h.elite, holder = e && P(e.dono); const nv = said(b.id);
    ok('k1 a família em casa: a bandeira fica', !!e && e.fam === o.name && !!holder && holder.home === b.id && e.ok >= S.day - 1 && h.trade === 60 && !nv.length,
      `${b.type}#${b.id} de ${set.name}, a casa de ${o.name}: dois dias depois ${e ? `a bandeira segue na porta (de ${holder ? holder.name : 'NINGUÉM'}, vista no dia ${e.ok}, hoje ${S.day}), a conta do comércio ${h.trade}` : 'a bandeira SUMIU'}; verificador ${nv.join(' | ') || 'limpo'}`);
    void d0;
  }
}

// ---------------------------------------------------------------- k2
if (on('k2')) {
  const c = house(2, (b, l, o) => kinIn(b, l, o) && !!empty(S.settlements.get(b.set), l.length));
  if (!c) none('k2 a família se muda: a bandeira vai com ela');
  else {
    const { b, l, o, set } = c; const nh = empty(set, l.length); used.add(nh.id); const since = banner(b, o).since; const ids = l.map(v => v.id);
    // the family moves, as any move leaves it: each one with the new home, the new house theirs
    god(() => { for (const v of l) { v.home = nh.id; v.hhType = nh.type; if (v.inside === b.id) v.inside = 0; } nh.dono = o.id; nh.res = l.length; b.res = 0; b.dono = 0; });
    day(1); if (lag(o.name, since)) day(1);
    // (a year on: the old house without the family's banner; the banner on one door only, the door of the house where its
    // holder lives — the one who had it, or who of the family has it after him)
    const h0 = B(b.id), at = bannersOf(o.name, since), h1 = at[0] || null; const e = h1 && h1.elite, holder = e && P(e.dono); const nv = said(b.id).concat(h1 ? said(h1.id) : []);
    const left = !h0 || !(h0.elite && h0.elite.fam === o.name) && (!!h0.elite || !(h0.trade > 0));
    ok('k2 a família se muda: a bandeira vai com ela', left && at.length === 1 && !!holder && ids.includes(holder.id) && holder.home === h1.id && h1.trade === 60 && h1.tradeGood === 'tecido' && !nv.length,
      `a família de ${o.name} (${l.length}) mudou de ${b.type}#${b.id} para ${nh.type}#${nh.id}, em ${set.name}: um ano depois a casa antiga ${left ? 'está sem a bandeira dela' : 'SEGUE com a bandeira'}; a bandeira da família está em ${at.length === 1 ? `${h1.type}#${h1.id}${h1.id === nh.id ? '' : ' (a casa que a família comprou depois, no ano)'}, conta ${h1.trade}, onde mora ${holder ? `${holder.name}${holder.id === o.id ? '' : ', que a tem depois dele'}` : 'NINGUÉM da família'}` : at.length ? `${at.length} PORTAS` : 'NENHUMA porta'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k3
if (on('k3')) {
  const kin = (v, o) => v.id === o.partner || v.mother === o.id || v.father === o.id;
  const c = house(2, (b, l, o) => l.some(v => v.id !== o.id && kin(v, o) && v.age >= 16));
  if (!c) none('k3 a herança: a bandeira passa a quem da família mora na casa');
  else {
    const { b, l, o, set } = c; const since = banner(b, o).since; const name = o.name; const ids = l.map(v => v.id); const want = l.find(v => v.id === o.partner) || l.filter(v => v.id !== o.id && v.age >= 16 && (v.mother === o.id || v.father === o.id)).sort((a, c2) => c2.age - a.age || a.id - c2.id)[0];
    god(() => G.Village.kill(o, 'teste'));
    const e0 = B(b.id).elite; const now = e0 ? e0.dono : -1;
    day(2);
    // (two years on: the banner on one door, the door of the house where its holder — one of the family — lives)
    const at = bannersOf(name, since), h = at[0] || null, e = h && h.elite, holder = e && P(e.dono); const nv = said(b.id).concat(h && h.id !== b.id ? said(h.id) : []);
    ok('k3 a herança: a bandeira passa a quem da família mora na casa', now === want.id && at.length === 1 && !!holder && ids.includes(holder.id) && holder.home === h.id && e.ok >= S.day - 1 && !nv.length,
      `${name}, de ${set.name}, morreu com a bandeira na porta de ${b.type}#${b.id}: no mesmo instante a bandeira é de ${P(now) ? P(now).name : (now ? '#' + now : 'NINGUÉM')} (${want.id === o.partner ? 'o par' : 'o filho mais velho'}: ${want.name}); dois anos depois ${at.length === 1 ? `está na porta de ${h.type}#${h.id}${h.id === b.id ? '' : ' (a casa que a família comprou depois)'}, onde mora ${holder ? holder.name : 'NINGUÉM da família'}` : at.length ? `está em ${at.length} PORTAS` : 'a bandeira DESCEU'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k4
if (on('k4')) {
  // the holder alone of the family in the house: who else lives there is no kin (none, or the test's hand finds one alone)
  const c = house(1, (b, l) => l.length === 1);
  if (!c) none('k4 sem ninguém da família: a bandeira desce');
  else {
    const { b, o, set } = c; banner(b, o); const name = o.name; const n0 = S.logN || 0;
    // (the chronicle tells one banner in two days in each town — the ready world's own old banners come down in these days
    // too —: the test's hand has the town's day of banners first, and leaves the line free for the case; and when another
    // banner of the town comes down that very day before this one, the line of the day is that one's: one in two days, T-699)
    god(() => { G.Trade.keepHouses(set); G.mod('trade.down.' + set.id, S.day - 5); G.Village.kill(o, 'teste'); });
    const now = B(b.id).elite ? B(b.id).elite.dono : -1;
    day(1);
    const h = B(b.id); const lines = S.history.filter(x => x.n > n0 && /bandeira da casa de mercadores de/.test(x.txt) && x.txt.includes(set.name)).map(x => x.txt);
    const line = lines.find(t => t.includes(name)) || '', other = line ? '' : lines[0] || '';
    const nv = h ? said(b.id) : [];
    ok('k4 sem ninguém da família: a bandeira desce', now === 0 && (!h || (!h.elite && !(h.trade > 0))) && (!!line || !!other) && !nv.length,
      `${name}, de ${set.name}, morava só em ${b.type}#${b.id} e morreu: a bandeira ficou sem família (${now === 0 ? 'ninguém' : '#' + now}); no dia seguinte ${h && h.elite ? 'SEGUE na porta' : 'desceu'}; a crônica: «${line || other || '(nada)'}»${other ? ' (a linha do dia foi a de outra bandeira da cidade: uma em dois dias)' : ''}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k5
if (on('k5')) {
  // (each a household with kin of the owner in it — the partner or a child: the metropole is at war, and an owner who falls in
  // the day of the case leaves the banner to who of the family lives in the house; with strangers alone beside him — another
  // family of the same house — the banner came down, as the rule has it, and the case read «NÃO foi para a casa da família»:
  // Cuauhtémoc, in the life the second round of the full house lives. T-836)
  const kin = (b, l, o) => l.some(v => v.id !== o.id && (v.id === o.partner || v.mother === o.id || v.father === o.id));
  const a = house(2, kin), c = house(2, (b, l, o) => kin(b, l, o) && !!empty(S.settlements.get(b.set), l.length));
  if (!a || !c) none('k5 um save de antes: a bandeira vai para onde mora o dono');
  else {
    // (a) the owner lives under it; (b) the owner moved and let the old house stand: the mark of before has no family written
    god(() => { a.b.trade = 60; a.b.elite = { k: 'tecido', since: S.day - 9, fam: a.o.name }; });
    const nh = empty(c.set, c.l.length); used.add(nh.id);
    god(() => { c.b.trade = 60; c.b.elite = { k: 'tecido', since: S.day - 9, fam: c.o.name }; for (const v of c.l) { v.home = nh.id; v.hhType = nh.type; if (v.inside === c.b.id) v.inside = 0; } nh.dono = c.o.id; nh.res = c.l.length; c.b.res = 0; });
    const sinceA = a.b.elite.since, sinceC = c.b.elite.since; const idsA = a.l.map(v => v.id), idsC = c.l.map(v => v.id);
    day(1);
    // (the banner of each family on one door, the door of the house where its holder lives — the family may move again in the
    // day by the world's own hand, and the banner goes with it: the case follows the family, not the walls. T-699, T-813)
    // (the owner may fall in the day of the case — the metropole is at war —: a mark of before is the house's owner's, wherever he
    // lives (trade.js keepHouses), and at a death before the day's round the houses pass to the heir (act-casa.js heirOf: the
    // partner, the eldest grown child wherever he lives), the banner to where the heir lives, as k10 has it; with no heir the
    // house is the people's, and the banner comes down. In the metrópole of the generation 21 Tízoc of Texcoco, 61, and Nenetl,
    // 60, his partner, died in the day — he in combat near Roma —, the houses went to her eldest son, #10175, and the banner to
    // his house: «NÃO foi para a casa da família», T-1161)
    const heirOf = x => (!P(x.o.id) && B(x.b.id) ? B(x.b.id).dono || 0 : 0);
    const hA = heirOf(a), hC = heirOf(c);
    const fa = bannersOf(a.o.name, sinceA).filter(x => idsA.includes(x.elite.dono) || (hA && x.elite.dono === hA)), fc = bannersOf(c.o.name, sinceC).filter(x => idsC.includes(x.elite.dono) || (hC && x.elite.dono === hC));
    const downA = !P(a.o.id) && !hA && !fa.length, downC = !P(c.o.id) && !hC && !fc.length; // (no heir: the banner down — the rule)
    const under = L => L.length === 1 && !!P(L[0].elite.dono) && P(L[0].elite.dono).home === L[0].id;
    const heirSays = (x, h) => (P(x.o.id) ? '' : ` (${x.o.name} morreu no dia: ${h ? `as casas passaram a ${P(h) ? P(h).name : '#' + h}, e a bandeira foi com elas` : 'sem herdeiro, as casas são do povo'})`);
    const ea = fa[0] && fa[0].elite, e1 = fc[0] && fc[0].elite; const e0 = B(c.b.id) && B(c.b.id).elite;
    // (the old mark still on the old walls — not the banner of another family that came to live in the house the family left)
    const old = !!e0 && e0.fam === c.o.name && e0.since === sinceC && !(fc[0] && fc[0].id === c.b.id); const outra = !!e0 && !old && !(fc[0] && fc[0].id === c.b.id) ? e0 : null;
    const nv = said(a.b.id).concat(said(c.b.id), said(nh.id), fa[0] ? said(fa[0].id) : [], fc[0] ? said(fc[0].id) : []);
    ok('k5 um save de antes: a bandeira vai para onde mora o dono', ((under(fa) && ea.ok >= S.day - 1) || downA) && !old && ((under(fc) && e1.fam === c.o.name) || downC) && !nv.length,
      `(a) ${a.o.name} mora na casa da marca antiga${heirSays(a, hA)}: ${under(fa) ? `a bandeira segue com a família, agora escrita (${fa[0].type}#${fa[0].id}${fa[0].id === a.b.id ? '' : ', a casa para onde a família foi no dia'})` : downA ? 'a bandeira desceu, sem ninguém da família a quem passar' : fa.length ? 'a bandeira NÃO está onde a família mora' : 'a bandeira SUMIU'}; (b) ${c.o.name} mudou e a marca antiga ficou na casa velha${heirSays(c, hC)}: ${old ? 'SEGUE na casa velha' : 'saiu da casa velha'}${outra ? ` (que tem agora a bandeira de ${outra.fam}, ${P(outra.dono) && P(outra.dono).home === c.b.id ? 'que veio morar nela' : 'QUE NÃO MORA NELA'})` : ''} e ${under(fc) ? `está na casa onde ${P(c.o.id) ? 'a família' : 'o herdeiro'} mora (${fc[0].type}#${fc[0].id}${fc[0].id === nh.id ? '' : P(c.o.id) ? ', a casa para onde a família foi depois, no dia' : ''})` : downC ? 'desceu, sem ninguém da família a quem passar' : 'NÃO foi para a casa da família'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k6
if (on('k6')) {
  const c = house(2, kinIn);
  if (!c) none('k6 save e load');
  else {
    // (the family's banner wherever it is: a merchant family may buy the dear house in the day (social.js, D-159), and the banner
    // goes with it — in the generation 20 Khafre's family of Mênfis bought sobrado#19455 the day of the case, and the case,
    // looking at the old door, read «a marca antes do save null … a bandeira SUMIU». It follows the family, not the walls: T-699,
    // T-1001)
    const { b, o, l } = c; const since = banner(b, o).since; const ids = l.map(v => v.id); day(1);
    const fam = () => bannersOf(o.name, since).filter(x => ids.includes(x.elite.dono));
    const h0 = fam()[0] || null; const e0 = h0 ? JSON.stringify(h0.elite) : 'null'; M.salvarCarregar(); S = G.S; const e1 = h0 && B(h0.id) ? JSON.stringify(B(h0.id).elite) : 'null';
    day(1); const at = fam(), x = at[0] || null, e = x && x.elite, holder = e && P(e.dono); const nv = said(b.id).concat(x && x.id !== b.id ? said(x.id) : []);
    ok('k6 save e load: a marca e a família atravessam o save', !!h0 && e0 === e1 && at.length === 1 && !!holder && holder.home === x.id && e.ok >= S.day - 1 && !nv.length,
      `a marca antes do save ${e0}${h0 && h0.id !== b.id ? ` (em ${h0.type}#${h0.id}, a casa para onde a família foi no dia)` : ''}; depois do load ${e0 === e1 ? 'igual' : e1}; no dia seguinte ${x ? `a bandeira segue em ${x.type}#${x.id}, vista no dia ${e.ok}, de ${holder ? holder.name : 'NINGUÉM'}` : 'a bandeira SUMIU'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k7
if (on('k7')) {
  // (the family the banner is of, of a people at peace: one at war may lose its owner to a captivity in the day of the case, and
  // the banner of one away with no roof of his own waits for him where it is, as the rule has it — Xiuhtonal of Tenochtitlan, at
  // the fight when the case began, was taken in the day: «depois do dia da cidade SEGUE ali», the metrópole of the generation
  // 21, T-1081)
  // (and, with every people of the world at war by then — the metrópole goes to war on its second day —, a family none of whom
  // is in the fight: no warrior, no one at a fight or mustered)
  const peace = b => { const st = S.settlements.get(b.set); return !!st && !G.Fac.enemiesOf(st.fac).length; };
  const inFight = l => l.some(w => w.role === 'guerreiro' || (!!w.task && (w.task.type === 'combat' || w.task.type === 'muster' || w.task.kind === 'combat' || w.task.kind === 'muster')));
  const c = house(2, kinIn), far = house(2, (b, l, o) => kinIn(b, l, o) && peace(b)) || house(2, (b, l, o) => kinIn(b, l, o) && !inFight(l));
  if (!c || !far) none('k7 o verificador acusa a bandeira deixada nas paredes');
  else {
    // the banner of another family (far.o, who lives elsewhere), last seen five days ago, on the walls of this house
    const since = banner(c.b, far.o, { ok: S.day - 5 }).since; const ids = far.l.map(v => v.id);
    const before = said(c.b.id);
    day(1);
    // (the banner where its family lives now — the house of the case, or the one the family went to in the day, the banner
    // with it; or come down, where the house the family lives in flies a banner of its own by then: one of the house earned
    // it in the day, and a house flies one banner — T-699, T-813)
    const h = B(c.b.id); const at = bannersOf(far.o.name, since).filter(x => ids.includes(x.elite.dono)); const o1 = P(far.o.id);
    const m = at[0] || (o1 && B(o1.home)) || null; const e = m && m.elite; const holder = e && P(e.dono); const own = !!e && !at.length;
    // (or the family came to live in this very house in the day, and the banner is where it lives: the town marries its widowers —
    // Tutmés of Mênfis, widowed, wed Meresankh, the owner of the house of the case, and went to live in her house with his three
    // children, as the town's housing has a partner do (village.js assignHousing): «SEGUE ali e NÃO foi para a casa da família»,
    // in the metrópole of the generation 21 after the k1 to the k6, T-1162)
    const here = !!o1 && o1.home === c.b.id && !!holder && holder.home === c.b.id;
    const moved = at.length <= 1 && !!e && !!holder && holder.home === m.id && (m.id !== c.b.id || here); const after = said(c.b.id).concat(m ? said(m.id) : []);
    const wed = here && !!o1.partner && !!P(o1.partner) && P(o1.partner).home === c.b.id ? P(o1.partner) : null;
    ok('k7 o verificador acusa a bandeira deixada nas paredes', before.length > 0 && /L-711/.test(before[0]) && !!h && (here || !(h.elite && h.elite.fam === far.o.name)) && !after.length && moved,
      `a bandeira de ${far.o.name} nas paredes de ${c.b.type}#${c.b.id}, onde mora ${c.o.name}: o verificador ${before.length ? 'acusa: ' + before[0].slice(0, 150) : 'NÃO acusa'}; depois do dia da cidade ${here ? `a família de ${far.o.name} mora nesta casa${wed ? ` (${far.o.name} casou-se no dia com ${wed.name}, que mora nela)` : ''}, e a bandeira está onde ela mora` : `${h && h.elite && h.elite.fam === far.o.name ? 'SEGUE ali' : 'saiu dali'}${!moved ? ' e NÃO foi para a casa da família' : own ? ` e desceu: a casa onde a família mora (${m.type}#${m.id}) já tem a sua, de ${e.fam}, ganha no dia` : ` e está onde mora ${holder.name} (${m.type}#${m.id}${m.id === far.b.id ? '' : ', a casa para onde a família foi no dia'})`}`}; verificador ${after.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k8
if (on('k8')) {
  // a house whose owner lives in it with two children of his or hers at the least, the second and those after under 16, the
  // eldest with no partner and no child in the house: the banner is the eldest child's — as after a father's death —, and
  // the eldest dies
  const kidsOf = (l, o) => l.filter(v => v.mother === o.id || v.father === o.id).sort((a, c2) => c2.age - a.age || a.id - c2.id);
  const c = house(3, (b, l, o) => { const k = kidsOf(l, o); return k.length >= 2 && k[1].age < 16 && !l.some(v => v.id === k[0].partner || v.mother === k[0].id || v.father === k[0].id); });
  if (!c) none('k8 só os irmãos pequenos na casa: a bandeira é do mais velho deles');
  else {
    const { b, l, o, set } = c; const k = kidsOf(l, o), first = k[0], next = k[1]; const since = banner(b, first).since; const name = first.name; const ids = l.map(v => v.id);
    god(() => G.Village.kill(first, 'teste'));
    const e0 = B(b.id).elite; const now = e0 ? e0.dono : -1;
    day(1);
    const at = bannersOf(name, since), h = at[0] || null, e = h && h.elite, holder = e && P(e.dono); const nv = said(b.id).concat(h && h.id !== b.id ? said(h.id) : []);
    ok('k8 só os irmãos pequenos na casa: a bandeira é do mais velho deles', now === next.id && at.length === 1 && !!holder && ids.includes(holder.id) && holder.home === h.id && !nv.length,
      `${name} (${Math.floor(first.age)}), de ${set.name}, tinha a bandeira da casa ${b.type}#${b.id} e morreu; na casa, os irmãos: ${k.slice(1).map(v => `${v.name} (${Math.floor(v.age)})`).join(', ')}: no mesmo instante a bandeira é de ${P(now) ? P(now).name : (now ? '#' + now : 'NINGUÉM')}; um ano depois ${at.length === 1 ? `está na porta de ${h.type}#${h.id}, onde mora ${holder ? holder.name : 'NINGUÉM da família'}` : 'a bandeira DESCEU'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k9
if (on('k9')) {
  // (a family of two grown or more, with an empty house of the town where it fits: it moves by the test's hand, as in k2, and
  // the one who had the banner dies at once — before the day's round takes the banner to the new house)
  const c = house(2, (b, l, o) => !!empty(S.settlements.get(b.set), l.length) && l.some(v => v.id !== o.id && (v.id === o.partner || v.mother === o.id || v.father === o.id)));
  if (!c) none('k9 a família se muda e o dono morre antes da ronda: a bandeira vai para a casa nova');
  else {
    const { b, l, o, set } = c; const nh = empty(set, l.length); used.add(nh.id); const since = banner(b, o).since; const ids = l.filter(v => v.id !== o.id).map(v => v.id);
    god(() => { for (const v of l) { v.home = nh.id; v.hhType = nh.type; if (v.inside === b.id) v.inside = 0; } nh.dono = o.id; nh.res = l.length; b.res = 0; b.dono = 0; });
    god(() => G.Village.kill(o, 'teste'));
    const e0 = B(b.id).elite; const now = e0 ? e0.dono : -1;
    day(1); if (lag(o.name, since)) day(1);
    const h0 = B(b.id), at = bannersOf(o.name, since), h1 = at[0] || null; const e = h1 && h1.elite, holder = e && P(e.dono); const nv = said(b.id).concat(h1 ? said(h1.id) : []);
    const left = !h0 || !(h0.elite && h0.elite.fam === o.name);
    ok('k9 a família se muda e o dono morre antes da ronda: a bandeira vai para a casa nova', ids.includes(now) && left && at.length === 1 && !!holder && ids.includes(holder.id) && holder.home === h1.id && h1.id !== b.id && h1.trade === 60 && !nv.length,
      `a família de ${o.name} (${l.length}) mudou de ${b.type}#${b.id} para ${nh.type}#${nh.id}, em ${set.name}, e ${o.name} morreu antes da ronda do dia: no mesmo instante a bandeira é de ${P(now) ? P(now).name : (now ? '#' + now : 'NINGUÉM')}; um dia depois a casa antiga ${left ? 'está sem a bandeira' : 'SEGUE com a bandeira'}; a bandeira da família está em ${at.length === 1 ? `${h1.type}#${h1.id}, conta ${h1.trade}, onde mora ${holder ? holder.name : 'NINGUÉM da família'}` : at.length ? `${at.length} PORTAS` : 'NENHUMA porta'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k10
if (on('k10')) {
  // (a banner of a save of before — no household written on it — on the house the family left standing, and the owner of both
  // houses dies before the day's first round: the houses pass to the heir at the death, act-casa.js, and the round writes the
  // banner his and takes it to the house where he lives — an heir grown, the partner or a child of sixteen or more, as the
  // house's heir is (act-casa.js heirOf): Irene of Argos, with three little ones, left the houses to nobody, the people's, and
  // the banner no one of the family to go to, in the metrópole of the generation 21 — T-1081)
  const c = house(2, (b, l, o) => !!empty(S.settlements.get(b.set), l.length) && l.some(v => v.id !== o.id && v.age >= 16 && !v.captive && (v.id === o.partner || v.mother === o.id || v.father === o.id)));
  if (!c) none('k10 a bandeira de um save de antes e o dono morto antes da primeira ronda');
  else {
    const { b, l, o, set } = c; const nh = empty(set, l.length); used.add(nh.id); const ids = l.filter(v => v.id !== o.id).map(v => v.id);
    god(() => { b.trade = 60; b.elite = { k: 'tecido', since: S.day - 9, fam: o.name }; b.dono = o.id; for (const v of l) { v.home = nh.id; v.hhType = nh.type; if (v.inside === b.id) v.inside = 0; } nh.dono = o.id; nh.res = l.length; b.res = 0; });
    const since = b.elite.since;
    god(() => G.Village.kill(o, 'teste'));
    const e0 = B(b.id).elite; const now = e0 ? e0.dono : -1;
    day(1); if (lag(o.name, since)) day(1);
    const h0 = B(b.id), at = bannersOf(o.name, since), h1 = at[0] || null; const e = h1 && h1.elite, holder = e && P(e.dono); const nv = said(b.id).concat(h1 ? said(h1.id) : []);
    const left = !h0 || !(h0.elite && h0.elite.fam === o.name);
    const heir = P(B(nh.id).dono);
    ok('k10 a bandeira de um save de antes e o dono morto antes da primeira ronda: fica com a família', now === undefined && !!heir && ids.includes(heir.id) && left && at.length === 1 && !!holder && ids.includes(holder.id) && holder.home === h1.id && h1.trade === 60 && !nv.length,
      `a marca antiga (sem a família escrita) na porta de ${b.type}#${b.id}, em ${set.name}; a família de ${o.name} (${l.length}) mora em ${nh.type}#${nh.id}, e ${o.name}, dono das duas, morreu antes da primeira ronda: no mesmo instante as casas passam a ${heir ? heir.name : 'NINGUÉM'} (a marca ainda sem família escrita: ${now === undefined ? 'sim' : 'NÃO'}); um dia depois a casa antiga ${left ? 'está sem a bandeira' : 'SEGUE com a bandeira'}; a bandeira da família está em ${at.length === 1 ? `${h1.type}#${h1.id}, conta ${h1.trade}, onde mora ${holder ? holder.name : 'NINGUÉM da família'}` : at.length ? `${at.length} portas` : 'NENHUMA porta'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

// ---------------------------------------------------------------- k11
if (on('k11')) {
  // (who of the house inherits, by the relations of the door of every death — trade.js heirIn: the partner, a child, a brother or
  // sister, a parent, a grandchild —, of one or the other)
  const kinOf = (r, x) => x.id === r.partner || x.mother === r.id || x.father === r.id || r.mother === x.id || r.father === x.id || (!!r.mother && x.mother === r.mother) || (!!r.father && x.father === r.father) || (r.kids || []).includes(x.mother) || (r.kids || []).includes(x.father);
  // a brother or sister of the owner, of the town, single, no kin of the partner — living with them already, or elsewhere (the
  // test's hand brings them). The metrópole of the generation 21 has two couples' houses with nobody of the partner's kin under
  // them, and the one single brother of their owners in the town lived with the couple already: Axayácatl, with Tízoc and
  // Nenetl at the sobrado#10877 of Texcoco — the case asked one living elsewhere, and found none (T-1081)
  const sibOf = (b, o, p) => [...S.villagers.values()].filter(v => v.id !== o.id && v.set === o.set && ((!!o.mother && v.mother === o.mother) || (!!o.father && v.father === o.father)) && !v.partner && !kinOf(p, v) && v.home && !v.captive && !v.jail && !v.aboard && !(S.avatar && S.avatar.id === v.id)).sort((a, c2) => (c2.home === b.id) - (a.home === b.id) || c2.age - a.age || a.id - c2.id)[0] || null;
  // a house of a couple, the owner and the partner, with nobody of the partner's kin under it — and a brother or sister of the
  // owner in the town, whom the test's hand brings to live with them, as the town's housing does (in the generation 20 Thyra of
  // Hedeby lived with her husband Hakon and her three young brothers and sisters, all of them the ruler's)
  const fit11 = (b, l, o) => { const p = l.find(v => v.id === o.partner && v.age >= 16); return !!p && !l.some(v => v !== o && v !== p && kinOf(p, v)) && !!sibOf(b, o, p); };
  let c = house(2, fit11);
  // (and where the world has none — the metrópole of the generation 24: no couple's house of a town of rank 2 had a single brother or
  // sister of the owner in the town —, the next ready worlds, opened afresh, T-1157)
  for (const w of ['mega', 'mundial']) { if (c || w === WORLD) continue; S = M.pronto(w); used.clear(); c = house(2, fit11); }
  if (!c) none('k11 o par que herdou morre também: a bandeira fica com a família de quem a ganhou');
  else {
    const { b, o, set } = c; const p = P(o.partner); const sb = sibOf(b, o, p); const since = banner(b, o).since; const there = sb.home === b.id;
    if (!there) god(() => { const from = B(sb.home); sb.home = b.id; sb.hhType = b.type; if (sb.inside) sb.inside = 0; b.res = (b.res || 0) + 1; if (from) from.res = Math.max(0, (from.res || 0) - 1); });
    // the owner dies — the partner has the banner —; and the partner dies too, before the day's round (a war, an arrow)
    god(() => G.Village.kill(o, 'teste')); const d1 = B(b.id).elite ? B(b.id).elite.dono : -1;
    god(() => G.Village.kill(p, 'teste')); const d2 = B(b.id).elite ? B(b.id).elite.dono : -1;
    day(1);
    const at = bannersOf(o.name, since), x = at[0] || null, e = x && x.elite, holder = e && P(e.dono); const nv = said(b.id).concat(x && x.id !== b.id ? said(x.id) : []);
    ok('k11 o par que herdou morre também: a bandeira fica com a família de quem a ganhou', d1 === p.id && d2 === sb.id && at.length === 1 && !!holder && holder.home === x.id && x.trade === 60 && !nv.length,
      `${o.name}, de ${set.name}, com a bandeira na porta de ${b.type}#${b.id}, morava com ${p.name} (o par) e${there ? '' : ', pela mão da prova,'} ${sb.name} (${sb.age | 0}, ${sb.g === 'f' ? 'irmã' : 'irmão'} de ${o.name}): ${o.name} morre e a bandeira é de ${d1 === p.id ? p.name + ' (o par)' : P(d1) ? P(d1).name : d1 > 0 ? '#' + d1 : 'NINGUÉM'}; ${p.name} morre também e ela é de ${d2 === sb.id ? sb.name : P(d2) ? P(d2).name : d2 > 0 ? '#' + d2 : 'NINGUÉM'}; um dia depois ${at.length === 1 ? `está na porta de ${x.type}#${x.id}, onde mora ${holder ? holder.name : 'NINGUÉM da família'}, a conta do comércio ${x.trade}` : at.length ? `está em ${at.length} PORTAS` : 'a bandeira DESCEU'}; verificador ${nv.join(' | ') || 'limpo'}`);
  }
}

ok('nenhum erro', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso' : JSON.stringify(M.erros()).slice(0, 300));
console.log(fails.length ? `\ncasa-mercante: ${fails.length} falha(s): ${fails.join(', ')}` : '\ncasa-mercante: tudo passou');
process.exit(fails.length ? 1 : 0);
