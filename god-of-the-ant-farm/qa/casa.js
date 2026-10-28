// casa: um teto para chamar de meu, provocado de propósito (C1, a atividade 01) — no mundo pronto «metrópole» (a cidade de
// moeda com mais adultos sem par — hoje, Tenochtitlan) e no «cidade» (um povo sem moeda). Sem uma cidade que sirva, falha
// dizendo o que falta.   node qa/casa.js
// h1 toda casa tem dono (o mais velho que mora nela; a vazia é do povo); h2 quem precisa de casa (o casal na casa cheia
// dos pais — o que o dia da cidade pergunta: de uma casa cheia, só a família mais moça, D-098) põe no diário e junta — e a casa que junta não compra luxo; h11 a casa vazia do povo, comprada pelo livro
// ('compra-casa'), e a família muda com a sua parte ('mudança'); h3 com o bastante, paga os materiais de uma nova pelo
// livro ('obra-casa'), e a cidade diz onde e quão alta; h6 save no meio da obra; h4 os construtores levantam, a família
// muda e é a dona; h12 o aluguel: a casa que o dono deixou vazia, alugada; o aluguel de cada dia pelo livro ('aluguel');
// o que não se paga fica devendo, e o dono acaba vendendo a casa ao povo; h5 a herança (o companheiro; o filho mais velho
// onde ele morar; ninguém: o povo); h7 quem encomendou morre no meio da obra: a família muda igual; h8 a obra que nunca
// começa devolve o que se pagou; h15 a obra que se perde (o fogo) devolve o que não se levantou; h13 o barraco (social.js):
// a família sai para uma casa com lugar levando o que é seu, ou faz do barraco uma cabana pagando a madeira do povo — pelo
// livro; h14 a terra cara (social.js): a família rica compra a casa da família simples do centro, cada uma com o que é
// seu, pelo livro; h10 o salto: a obra termina e a família muda; h16 a ruína (a casa que caiu, a da cidade abandonada)
// sem dono quando o dono morre (L-304); h9 um povo sem moeda: o povo levanta com o que tem;
// e o verificador limpo. Os casos que vivem dias do mundo (h7, h8, h15, h14, h10) partem do mundo pronto de novo, e o h7
// e o h10 preparam a cidade pelas portas do mundo: em paz, com os materiais de uma casa no armazém (a guerra que vier no
// meio só faz esperar mais).
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/atividades-inv.js'] });
const fails = []; const mid = []; // (what the checker saw in the middle of a case: the case fails, even if the end looks clean)
const ok = (name, c, info) => { const m = mid.splice(0); const pass = c && !m.length; const now = pass ? [] : bad().map(q => q.msg); console.log(`${pass ? 'PASSOU' : 'FALHOU'} | casa ${name} | ${info}${m.length ? ' — o verificador, no meio do caso: ' + m.slice(0, 2).join(' · ') : ''}${now.length ? ' — o verificador agora: ' + now.slice(0, 2).join(' · ') : ''}`); if (!pass) fails.push(name); };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan'));
const watch = () => { const bb = bad(); if (bb.length) { console.log('   verificador no meio:', bb.slice(0, 2).map(q => q.msg).join(' · ')); for (const q of bb) if (!mid.includes(q.msg)) mid.push(q.msg); return true; } return false; };
const D = G.Depot, A = G.Act, K = G.Casa, E = G.Eco, W = G.W;
const r2 = x => Math.round(x * 100) / 100;
let S;
const fine = (sec, until) => { for (let k = 0; k < sec * 10; k++) { M.viver(0.1); if (k % 10 === 9 && watch()) return false; if (until && until()) return true; } return false; };
const book = f => D.ledger().filter(f);
if (!K) { console.log('FALHOU | casa | G.Casa não existe'); process.exit(1); }
const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
const residents = b => [...S.villagers.values()].filter(v => v.home === b.id && !v.captive);
// (the day of the houses of one town, as the world's step runs it — now, by the test's hand; then a second of the world)
const townDay = set => { K.day(set); M.viver(1); };
// (the next day of the world: the test sets the hour to the end of this one)
const nextDay = () => { const d = S.day; S.time = Math.max(S.time, 0.9995); for (let k = 0; k < 40 && S.day === d; k++) M.viver(0.1); for (let k = 0; k < S.settlements.size + 4; k++) M.viver(0.1); };
const coins = ref => D.get(ref, 'moedas');

M.pronto('metropole'); S = G.S; M.viver(2); G.inSim++;
S.time = 0.15; S.weather.storm = 0;
// (the town of the cases: a town of coin with the most grown people without a partner — the couples of the cases come from them)
const singles = s => [...S.villagers.values()].filter(v => v.set === s.id && v.age >= 18 && v.age < 50 && !v.partner && !v.captive).length;
let set = [...S.settlements.values()].filter(s => E.coinage(s.fac)).sort((a, b) => singles(b) - singles(a) || a.id - b.id)[0];
if (!set) { console.log('FALHOU | casa | nenhuma cidade com moeda na metrópole'); process.exit(1); }
console.log(`(${set.name}: ${G.Village.pop(set.id)} habitantes; moeda: ${E.coinage(set.fac) ? 'sim' : 'não'}; uma casa nova custa uns ${K.price(set, 'house')} moedas)`);
// (a case that lives days of the world starts from the ready world again, the same town: what an earlier case lived — a war
// in the middle, the couples it took — does not carry into it)
const set0 = set.id;
function reload() { M.pronto('metropole'); S = G.S; M.viver(2); S.time = 0.15; S.weather.storm = 0; set = S.settlements.get(set0); taken.clear(); }
// ---------------- h1: every lived-in house has an owner, the eldest who lives in it; an empty one is the people's
{
  // (looked at right when the town's day settles the owners: in the second after it the village's housing may already have
  // moved a single grown one into a house of the people with room — village.js, every 2,5 s —, whose owner the next day
  // gives: T-132)
  // (and a let house whose tenants owed too much: the day's rent sells it to the people, and the family stays in it until
  // the next town day gives it an owner — rent(), act-casa.js: in the metrópole of L-322 one of them was in Tenochtitlan)
  const letBefore = new Set([...S.buildings.values()].filter(b => b.set === set.id && b.aluga).map(b => b.id));
  K.day(set);
  const homes = [...S.buildings.values()].filter(b => b.set === set.id && housing(b) && b.built && b.type !== 'ruin');
  const sold = homes.filter(b => letBefore.has(b.id) && !b.dono && !b.aluga);
  const wrong = homes.filter(b => { if (sold.includes(b)) return false; const L = residents(b).filter(v => v.age >= 16 && v.set === b.set); return L.length ? !(b.dono && S.villagers.has(b.dono)) : !!b.dono && !S.villagers.has(b.dono); });
  const owned = homes.filter(b => b.dono).length;
  M.viver(1);
  ok('h1 toda casa tem dono', homes.length >= 5 && !wrong.length && owned >= homes.length * 0.6, `${owned} de ${homes.length} casas de ${set.name} com dono${sold.length ? ` (${sold.map(b => '#' + b.id).join(', ')}: a de aluguel que o dono vendeu hoje ao povo, com a família ainda nela)` : ''}${wrong.length ? `; SEM DONO CERTO: ${wrong.slice(0, 3).map(b => '#' + b.id).join(', ')}` : ''}`);
}
// a couple in a full house that is not theirs (the parents'): the test's hand makes one if the town has none
const taken = new Set();
function couple(town) {
  town = town || set;
  for (const v of [...S.villagers.values()].filter(o => o.set === town.id).sort((a, b) => a.id - b.id)) { if (taken.has(v.id)) continue; const why = K.need(v); if (why === 'casal' && !K.waiting(v)) { taken.add(v.id); taken.add(v.partner); return v; } }
  // (two grown people without partners, of two houses — the test's hand makes them a couple in his house, full, that is
  // not theirs)
  const sib = (a, b) => (!!a.mother && a.mother === b.mother) || (!!a.father && a.father === b.father) || a.mother === b.id || a.father === b.id || b.mother === a.id || b.father === a.id;
  const free = [...S.villagers.values()].filter(v => v.set === town.id && v.age >= 18 && v.age < 50 && !v.partner && !v.captive && !v.jail && !v.aboard && v.home && !taken.has(v.id) && !(S.avatar && S.avatar.id === v.id)).sort((a, b) => a.id - b.id);
  for (const m of free.filter(v => v.g === 'm')) {
    const b = S.buildings.get(m.home); if (!b || !b.built || b.type === 'barraco' || b.dono === m.id) continue;
    const f = free.find(v => v.g === 'f' && v.id !== b.dono && !sib(v, m)); if (!f) continue;
    f.home = b.id; m.partner = f.id; f.partner = m.id; b.res = Math.max(b.res || 0, G.BDEF[b.type].housing);
    if (K.need(m) === 'casal') { taken.add(m.id); taken.add(f.id); return m; }
  }
  return null;
}
// (the coins of a house set to n — the test's hand: a poor year, a good one)
const setCoins = (ref, n) => { const c = coins(ref); if (c > n) D.use(ref, 'moedas', c - n, { code: 'teste' }); else if (c < n) D.make(ref, 'moedas', n - c, { code: 'teste' }); };
// (a built house of the people, empty, where the city puts one — the test's hand, when the town has none)
function emptyHouse(owner, type, town) {
  type = type || 'house'; town = town || set;
  const occ = new Map(); for (const v of S.villagers.values()) if (v.home) occ.set(v.home, (occ.get(v.home) || 0) + 1);
  if (!owner) { const b = [...S.buildings.values()].filter(q => q.set === town.id && q.built && q.type === type && !q.dono && !occ.get(q.id)).sort((a, c) => a.id - c.id)[0]; if (b) return b; }
  const pos = G.Village.findSite(town, type); if (!pos || pos.demolish) return null;
  const b = G.Village.addBuilding(type, pos[0], pos[1], town.id, true);
  if (owner) b.dono = owner.id;
  return b;
}
// (the test's hand before a family raises its own: no empty house of the people left to buy — taken down —, and the
// builders free — the other commissions of the town finished, their families moved in)
function clearWay(v) {
  for (let k = 0; k < 8; k++) { const fr = K.plan(v, null, set, null, K.need(v)).free; if (!fr) break; G.Village.removeBuilding(fr); }
  for (const b of [...S.buildings.values()]) if (b.set === set.id && b.encomenda && !b.built && !b.encomenda.fam.includes(v.id)) G.Village.completeBuilding(b);
}
// (a couple for a commission, the way cleared: a couple whose need went with it — the families of the other commissions
// moved out, and the house it shared is no longer full — gives its place to the next)
function readyCouple() {
  for (let k = 0; k < 6; k++) { const v = couple(); if (!v) return null; clearWay(v); if (K.need(v)) return v; }
  return null;
}
// (what a commission needs to stand, before the case: the town at peace — the case lives until no fight is at it and no
// army is coming, up to two days of the world — and the materials of a house in the people's store: what the city's own
// works took is given back by the god's hand, in the ledger. The world can still bring a war in the middle: the case then
// waits for the work longer, not forever)
function readyTown() {
  let w = 0; for (; w < 400 && G.War.threat(set.id); w++) M.viver(1);
  const f = 'f:' + set.fac; const cost = G.BDEF.sobrado.cost;
  for (const k in cost) { const lack = cost[k] * 3 - D.get(f, k); if (lack > 0) D.make(f, k, lack, { code: 'teste', part: true }); }
  return w;
}
const warNote = (w, t0) => `${w ? `; a cidade esperou ${w} s por paz antes do caso` : ''}${G.War.threat(set.id) ? '; a cidade em guerra agora' : ''}${t0 !== undefined ? ` (o caso: ${Math.round(S.clock - t0)} s do mundo)` : ''}`;
// ---------------- h2: the need goes into the diary, and the house saves (no luxury bought while it does)
let hv = null, hHome = null;
{
  // (a couple the town's day asks: of a full house, only its youngest family is — D-098 —, by the head the day names)
  for (let k = 0; k < 8 && !hv; k++) { const c = couple(); if (!c) break; const e = K.queue(set).find(q => q[0].id === c.id || q[0].id === c.partner); if (e) hv = e[0]; }
  hHome = hv && S.buildings.get(hv.home);
  let info = 'nenhum casal numa casa cheia', fine2 = false;
  if (hv) {
    setCoins('h:' + hHome.id, 1); // (a house with too few coins even for a rent: it saves)
    for (let k = 0; k < 3 && !(hHome.poupa && hHome.poupa.by === hv.id); k++) townDay(set);
    const goal = (A.diary(hv).goals || []).find(g => g.src === 'casa-nova');
    const list = G.Compras ? G.Compras.list(hHome).map(q => q.k) : [];
    fine2 = !!goal && !!hHome.poupa && hHome.poupa.by === hv.id && !list.includes('joias');
    info = `${hv.name} e ${S.villagers.get(hv.partner).name} na casa #${hHome.id} (${residents(hHome).length} pessoas, dono ${S.villagers.get(hHome.dono) ? S.villagers.get(hHome.dono).name : hHome.dono}): no diário «${goal ? goal.txt : 'NADA'}»; a casa ${hHome.poupa ? `junta até ${hHome.poupa.alvo}` : 'NÃO junta'}; o que vai comprar: ${list.join(', ') || 'nada'}${list.includes('joias') ? ' — JOIAS mesmo juntando' : ''}`;
  }
  ok('h2 precisar e juntar', fine2 && !bad().length, info);
}
// ---------------- h11: the people's empty house, bought through the ledger; the family moves with its share
{
  // (a second couple in the cases' town — h2 took the first —, or, when that town has nobody left to make one of — no single
  // woman among its grown people in a newer world —, in the next town of coin with the most grown people without a partner:
  // the purchase is the same in any town of coin, T-129)
  let v = couple(), t11 = set;
  if (!v) for (const tw of [...S.settlements.values()].filter(s => s !== set && E.coinage(s.fac)).sort((a, b) => singles(b) - singles(a) || a.id - b.id)) { v = couple(tw); if (v) { t11 = tw; break; } }
  let info = 'nenhum outro casal', fine11 = false;
  if (v) {
    // (the empty house the family would buy: the people's first one, or one the city puts up now — the test's hand)
    // (with beds for the whole family, as h12's: a house of four beds does not fit a family of six, and the plan never takes
    // it — a bigger family in an older world, T-111)
    const h = S.buildings.get(v.home); const b = K.plan(v, null, t11, null, K.need(v)).free || emptyHouse(null, K.family(v).length > G.BDEF.house.housing ? 'sobrado' : 'house', t11);
    if (b && K.plan(v, null, t11, null, K.need(v)).free === b) {
      const price = r2(K.price(t11, b.type, [b.x, b.y]) * 0.8); setCoins('h:' + h.id, price + 6);
      const L0 = S.ledgerN; const food0 = D.get('h:' + h.id, 'food');
      const r = K.order(v);
      const paid = book(e => e[0] > L0 && e[8] === 'compra-casa' && e[3] === 'h:' + h.id && e[4] === 'f:' + t11.fac)[0];
      const moved = book(e => e[0] > L0 && e[8] === 'mudança' && e[3] === 'h:' + h.id && e[4] === 'h:' + b.id);
      const p = S.villagers.get(v.partner);
      fine11 = !!r.ok && !!r.bought && r.b === b && !!paid && Math.abs(paid[6] - price) < 0.01 && b.dono === v.id && v.home === b.id && p.home === b.id && (food0 < 0.01 || moved.some(e => e[5] === 'food'));
      info = `${v.name} ${r.ok && r.bought ? `comprou a casa vazia #${b.id} do povo por ${paid ? paid[6] : '?'} moedas (livro ${paid ? paid[0] : '—'})` : 'NÃO comprou: ' + (r.why || JSON.stringify(r))}; a família ${v.home === b.id && p.home === b.id ? 'mudou' : 'NÃO mudou'}; a mudança no livro: ${moved.map(e => `${e[6]} ${e[5]}`).join(', ') || 'nada'} (a despensa da casa velha tinha ${r2(food0)}); dono: ${b.dono === v.id ? v.name : b.dono}`;
    } else info = b ? `a casa vazia #${b.id} (${b.type}, ${G.BDEF[b.type].housing} camas) não é a que o plano da família toma (${K.family(v).length} pessoas; o plano: ${(K.plan(v, null, t11, null, K.need(v)).free || {}).id || 'nenhuma'})` : 'a cidade não tem lugar para uma casa vazia';
    if (t11 !== set) info = `(em ${t11.name}: ${set.name} não tem mais com quem fazer um casal) ` + info;
  }
  ok('h11 comprar a casa vazia do povo', fine11 && !bad().length, info);
}
// ---------------- h3: with enough, the materials paid through the ledger; the city says where and how tall
let hb = null;
{
  let info = 'sem o casal de h2', fine3 = false;
  if (hv) {
    clearWay(hv);
    const price = K.price(set, 'sobrado') + 4; setCoins('h:' + hHome.id, price * 3); // (a good year)
    const L0 = S.ledgerN;
    const r3 = K.order(hv); // (the family's decision, now — the day of the town takes the most urgent family first)
    hb = K.waiting(hv);
    // (the coins set aside in the site itself: the people are paid when it stands)
    const paid = hb && book(e => e[0] > L0 && e[8] === 'obra-casa' && e[3] === 'h:' + hHome.id && e[4] === 'h:' + hb.id)[0];
    if (!hb) console.log(`   (h3: a decisão: ${JSON.stringify(r3).slice(0, 200)})`);
    const val = hb && G.Urban ? r2(G.Urban.valueAt(set, hb.x + 0.5, hb.y + 0.5)) : null;
    const why3 = { obra: !!hb, livro: !!paid, dono: !!hb && hb.dono === hv.id, obraAberta: !!hb && !hb.built, encomenda: !!(hb && hb.encomenda), ele: !!(hb && hb.encomenda && hb.encomenda.fam.includes(hv.id)), par: !!(hb && hb.encomenda && hb.encomenda.fam.includes(hv.partner)), preco: !!(hb && hb.encomenda && paid && Math.abs(paid[6] - hb.encomenda.paid) < 0.01) };
    fine3 = Object.values(why3).every(Boolean);
    if (!fine3) console.log(`   (h3: ${JSON.stringify(why3)})`);
    info = hb ? `${hv.name} guardou ${paid ? paid[6] : '?'} moedas da casa na obra (livro ${paid ? paid[0] : '—'}: vão ao povo quando ela ficar de pé); a cidade pôs ${G.Village.buildName(hb).toLowerCase()} em ${hb.x},${hb.y} (a terra ali vale ${val}; ${G.Urban && G.Urban.DEAR ? `um sobrado pede ${G.Urban.DEAR.sobrado}` : ''}); dono: ${hb.dono === hv.id ? hv.name : hb.dono}; a família da encomenda: ${hb.encomenda.fam.length}` : 'nenhuma obra encomendada';
  }
  ok('h3 pagar e encomendar', fine3 && !bad().length, info);
}
// ---------------- h6: a save in the middle of the work: the commission goes on
if (hb) {
  const id = hb.id; const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); G.Main.mode = 'game'; S = G.S; set = S.settlements.get(set.id);
  hb = S.buildings.get(id); hv = S.villagers.get(hv.id); hHome = S.buildings.get(hHome.id);
  const rt = QA.roundTrip ? QA.roundTrip() : { diff: [] }; S = G.S; set = S.settlements.get(set.id); hb = S.buildings.get(id); hv = S.villagers.get(hv.id); hHome = S.buildings.get(hHome.id);
  ok('h6 save no meio da obra', !!hb && !!hb.encomenda && hb.dono === hv.id && !rt.diff.length && !bad().length, hb ? `depois do load a obra #${hb.id} continua encomendada por ${hv.name} (${Math.round((hb.progress || 0) * 100)}%); a ida e volta do verificador: ${rt.diff.length ? rt.diff.slice(0, 2).join(' · ') : 'sem diferença'}` : 'a obra SUMIU no save');
}
// ---------------- h4: the builders raise it; the family moves with its share, through the ledger; it is theirs
{
  let info = 'sem a obra de h3', fine4 = false;
  if (hb) {
    const from = hHome; const L0 = S.ledgerN; const pantry0 = D.get('h:' + from.id, 'food');
    const done = fine(900, () => hb.built);
    const moved = book(e => e[0] > L0 && e[8] === 'mudança' && e[3] === 'h:' + from.id && e[4] === 'h:' + hb.id);
    const fam = [hv, S.villagers.get(hv.partner)].filter(Boolean);
    const arranged = (hv.diary || []).some(e => /Arrumamos a casa nova/.test(e.txt));
    const people = book(e => e[0] > L0 && e[8] === 'obra-casa' && e[3] === 'h:' + hb.id && e[4] === 'f:' + set.fac)[0]; // (the coins set aside, to the people)
    fine4 = done && fam.every(v => v.home === hb.id) && hb.dono === hv.id && !hb.encomenda && moved.length >= 1 && arranged && !!people;
    info = `${done ? `levantada no dia ${Math.round(S.day)}` : 'NÃO terminou em 900 s'}: ${fam.map(v => `${v.name} mora ${v.home === hb.id ? 'nela' : 'em #' + v.home}`).join(', ')}; a mudança no livro: ${moved.map(e => `${e[6]} ${e[5]}`).join(', ') || 'NADA'} (a despensa da casa velha tinha ${r2(pantry0)}); dona: ${hb.dono === hv.id ? 'a família' : hb.dono}; no diário: ${arranged ? '«Arrumamos a casa nova…»' : 'NADA da arrumação'}; as moedas guardadas na obra ao povo: ${people ? people[6] + ' (livro ' + people[0] + ')' : 'NADA'}`;
  }
  ok('h4 levantar e mudar', fine4 && !bad().length, info);
}
// ---------------- h12: a rent — an empty house its owner left, rented; the rent of a day; what is owed; the owner gives up
{
  // (the couple as h11's: in the cases' town, or in the next town of coin when that one has nobody left to make one of, T-129)
  let v = couple(), t12 = set;
  if (!v) for (const tw of [...S.settlements.values()].filter(s => s !== set && E.coinage(s.fac)).sort((a, b) => singles(b) - singles(a) || a.id - b.id)) { v = couple(tw); if (v) { t12 = tw; break; } }
  let info = 'nenhum outro casal', fine12 = false;
  const kinOf = (o, x) => !!x && (x.id === o.id || x.id === o.partner || x.mother === o.id || x.father === o.id || o.mother === x.id || o.father === x.id || (!!o.mother && x.mother === o.mother) || (!!o.father && x.father === o.father));
  const owner = v && [...S.villagers.values()].filter(o => o.set === t12.id && o.age >= 30 && o.home && !taken.has(o.id) && S.buildings.get(o.home) && S.buildings.get(o.home).built && !kinOf(o, v) && !kinOf(o, S.villagers.get(v.partner))).sort((a, b) => a.id - b.id)[0];
  if (v && owner) {
    taken.add(owner.id);
    // (the test's hand: the owner bought it — with beds for the whole family —, and lives in his own)
    const h = S.buildings.get(v.home); const made = emptyHouse(owner, K.family(v).length > G.BDEF.house.housing ? 'sobrado' : 'house', t12);
    if (made) {
      setCoins('h:' + h.id, K.rentOf(t12, made.type) * 4);
      const plan0 = K.plan(v, null, t12, null, K.need(v));
      const r = K.order(v); const b = r.b; const lord = b && S.villagers.get(b.dono);
      if (!r.rented) console.log(`   (h12: ${v.name} ${K.need(v)}, família ${K.family(v).length}, ${Math.floor(K.savings(v))} moedas; a casa feita #${made.id} (${made.type}, dono ${made.dono}, ${G.BDEF[made.type].housing} camas, moradores ${[...S.villagers.values()].filter(q => q.home === made.id).length}); o plano: livre ${plan0.free ? plan0.free.id : '-'}, aluguel ${plan0.lease ? plan0.lease.id : '-'} a ${plan0.rent}, preço ${plan0.price})`);
      const rent = b ? K.rentOf(t12, b.type) : 0;
      const lets = r.ok && r.rented && v.home === b.id && b.aluga && lord && lord.home !== b.id;
      // (the owner kin of none of the family — not the partner's sister either: the day's rent would end the lease, L-315)
      const kinLord = lets && K.family(v).filter(m => kinOf(lord, m)).map(m => m.name);
      // (a day goes by: the rent of a day, to the owner's house)
      const L0 = S.ledgerN; const o0 = lord ? coins('h:' + lord.home) : 0;
      // (the owner's house keeps its coins by the ledger — the rent comes in, and the family may pay for things of its own
      // in the days of the case: in an older world it raised a house with 16.6 of them, and a count by the coins saw a loss,
      // T-111)
      const H12 = lord ? 'h:' + lord.home : null; const own12 = []; const onOwn = e => { if (e[5] === 'moedas' && (e[3] === H12 || e[4] === H12)) own12.push(e); }; D.onMove.push(onOwn);
      if (lets) { setCoins('h:' + b.id, rent * 2); b.aluga.pago = S.day - 1; townDay(t12); }
      const paid = lets && book(e => e[0] > L0 && e[8] === 'aluguel' && e[3] === 'h:' + b.id && e[4] === 'h:' + lord.home)[0];
      const need = K.need(v);
      // (then nothing to pay with, for days: owed; too much owed and the owner sells the house to the people)
      let gaveUp = false, owed = 0, sold = null;
      if (lets) {
        setCoins('h:' + b.id, 0); if (b.aluga) b.aluga.pago = S.day - 2; townDay(t12); owed = b.aluga ? b.aluga.deve : -1;
        const L1 = S.ledgerN; if (b.aluga) { b.aluga.pago = S.day - K.OWE_DAYS; townDay(t12); }
        gaveUp = !b.aluga && !b.dono; sold = book(e => e[0] > L1 && e[8] === 'venda-casa' && e[4] === 'h:' + lord.home)[0];
      }
      D.onMove.splice(D.onMove.indexOf(onOwn), 1);
      const net12 = r2(own12.reduce((a, e) => a + (e[4] === H12 ? e[6] : 0) - (e[3] === H12 ? e[6] : 0), 0));
      const kept12 = !!H12 && Math.abs(coins(H12) - (o0 + net12)) < 0.02;
      fine12 = lets && !kinLord.length && !!paid && Math.abs(paid[6] - rent) < 0.01 && kept12 && need === 'aluga' && Math.abs(owed - rent * 2) < 0.01 && gaveUp && v.home === b.id;
      if (!fine12 && lets) console.log(`   (h12: as moedas da casa do dono ${r2(o0)} → ${r2(coins(H12))}, pelo livro ${r2(o0 + net12)}: ${own12.map(e => `${e[8]} ${e[6]} ${e[3]}→${e[4]}`).slice(0, 8).join(' · ')})`);
      info = `${v.name} ${lets ? `alugou a casa #${b.id} de ${lord.name} (${rent} moedas ao ano)${kinLord.length ? ` — PARENTE de ${kinLord.join(', ')}` : ''}` : 'NÃO alugou: ' + (r.why || JSON.stringify(r))}; ${paid ? `o aluguel do dia foi à casa de ${lord.name} (livro ${paid[0]}, ${paid[6]})` : 'NENHUM aluguel no livro'}; no diário, a família de aluguel quer casa: ${need || 'NÃO'}; sem moeda dois dias: deve ${owed}; ${gaveUp ? `devendo demais, ${lord.name} vendeu a casa ao povo${sold ? ` por ${sold[6]} moedas` : ''}; a família continua nela` : 'o dono NÃO desistiu'}`;
    } else info = 'a cidade não tem lugar para uma casa vazia';
  }
  if (v && t12 !== set) info = `(em ${t12.name}: ${set.name} não tem mais com quem fazer um casal) ` + info;
  ok('h12 o aluguel', fine12 && !bad().length, info);
}
// ---------------- h5: inheritance — the partner; the eldest child wherever he lives; nobody: the people
{
  const b = [...S.buildings.values()].filter(q => q.set === set.id && housing(q) && q.built && q.dono && S.villagers.has(q.dono) && S.villagers.get(q.dono).partner && S.villagers.get(S.villagers.get(q.dono).partner) && S.villagers.get(S.villagers.get(q.dono).partner).home === q.id && !taken.has(q.dono)).sort((a, c) => a.id - c.id)[0];
  let info = 'nenhuma casa com dono casado', fine5 = false;
  if (b) {
    const o = S.villagers.get(b.dono), p = S.villagers.get(o.partner);
    G.Village.kill(o, 'teste');
    const first = b.dono === p.id;
    // (and the partner dies too: the eldest living child — wherever — or, with none, the eldest who lives there, or the people)
    const kids = (p.kids || []).map(id => S.villagers.get(id)).filter(k => k && k.age >= 16 && !k.captive).sort((a, c) => c.age - a.age || a.id - c.id);
    const rest = residents(b).filter(v => v.id !== p.id && v.age >= 16).sort((a, c) => c.age - a.age || a.id - c.id);
    const want = kids[0] || rest[0] || null;
    G.Village.kill(p, 'teste');
    const second = want ? b.dono === want.id : b.dono === 0;
    const memo = first && (A.diary(p).memories || []).some(m => /Herdei/.test(m.txt));
    fine5 = first && second;
    info = `${o.name} morreu: a casa #${b.id} ficou com ${first ? p.name + ' (o companheiro)' : 'OUTRO: ' + b.dono}; ${p.name} morreu: ficou com ${want ? (second ? want.name + (kids[0] ? ` (o filho mais velho${want.home === b.id ? ', que mora nela' : ', que mora noutra casa'})` : ' (o mais velho que mora nela)') : 'OUTRO: ' + b.dono) : (second ? 'o povo (ninguém)' : 'OUTRO: ' + b.dono)}${memo ? '; no diário: «Herdei a casa…»' : ''}`;
  }
  ok('h5 a herança', fine5 && !bad().length, info);
}
// ---------------- h7: the one who ordered the house dies in the middle of the work: the family moves just the same
{
  reload();
  const v = readyCouple(); let info = 'nenhum outro casal', fine7 = false;
  if (v) {
    const w = readyTown(); const h = S.buildings.get(v.home); setCoins('h:' + h.id, (K.price(set, 'sobrado') + 4) * 3);
    K.order(v);
    const b = K.waiting(v); const p = S.villagers.get(v.partner);
    if (b && p) {
      G.Village.kill(v, 'teste'); const t0 = S.clock;
      const done = fine(3000, () => b.built || !S.buildings.has(b.id));
      fine7 = done && b.built && p.home === b.id && b.dono === p.id;
      info = `${v.name} encomendou a casa #${b.id} e morreu no meio da obra: ${b.built ? 'a obra terminou' : S.buildings.has(b.id) ? `a obra NÃO terminou (${Math.round((b.progress || 0) * 100)}%)` : 'a obra SUMIU'}; ${p.name} ${p.home === b.id ? 'mudou para ela' : 'NÃO mudou (mora em #' + p.home + ')'} e é ${b.dono === p.id ? 'a dona' : 'NÃO a dona (' + b.dono + ')'}${warNote(w, t0)}`;
    } else info = `${v.name}: nenhuma obra encomendada`;
  }
  ok('h7 morre no meio da obra', fine7 && !bad().length, info);
}
// ---------------- h8: a commission that never starts gives back what was paid
{
  reload();
  const v = readyCouple(); let info = 'nenhum outro casal', fine8 = false;
  if (v) {
    const h = S.buildings.get(v.home); setCoins('h:' + h.id, (K.price(set, 'sobrado') + 4) * 3);
    K.order(v);
    const b = K.waiting(v);
    if (b) {
      const paid = b.encomenda.paid; const L0 = S.ledgerN; const id = b.id;
      b.encomenda.d = S.day - K.MAX_WAIT - 1; b.progress = 0; // (the test's hand: days went by and nobody touched the work)
      for (let k = 0; k < 3 && S.buildings.has(id); k++) townDay(set);
      const back = book(e => e[0] > L0 && e[8] === 'obra-devolvida' && e[3] === 'h:' + id && e[4] === 'h:' + v.home)[0];
      fine8 = !S.buildings.has(id) && !!back && Math.abs(back[6] - paid) < 0.01;
      info = `a obra #${id} de ${v.name} parada: ${S.buildings.has(id) ? 'CONTINUA no chão' : 'tirada do chão'}; voltaram à família ${back ? back[6] : 'NADA'} das ${paid} moedas guardadas na obra`;
    } else info = `${v.name}: nenhuma obra encomendada`;
  }
  ok('h8 a obra que não começa devolve', fine8 && !bad().length, info);
}
// ---------------- h15: a work that is lost (fire takes it half built): the people give back what was not raised of it
{
  reload();
  const v = readyCouple(); let info = 'nenhum outro casal', fine15 = false;
  if (v) {
    const h = S.buildings.get(v.home); setCoins('h:' + h.id, (K.price(set, 'sobrado') + 4) * 3);
    K.order(v);
    const b = K.waiting(v);
    if (b) {
      const paid = b.encomenda.paid; b.progress = 0.4; const L0 = S.ledgerN; // (the test's hand: the walls half up)
      G.Village.destroyBuilding(b, 'fire');
      const back = book(e => e[0] > L0 && e[8] === 'obra-devolvida' && e[3] === 'h:' + b.id && e[4] === 'h:' + v.home)[0];
      const raised = book(e => e[0] > L0 && e[8] === 'obra-casa' && e[3] === 'h:' + b.id && e[4] === 'f:' + set.fac)[0];
      const memo = (v.diary || []).some(e => /se perdeu/.test(e.txt));
      fine15 = !b.encomenda && !!back && Math.abs(back[6] - r2(paid * 0.6)) < 0.02 && !!raised && Math.abs(raised[6] - r2(paid * 0.4)) < 0.02 && memo && !K.waiting(v);
      info = `a obra #${b.id} de ${v.name} pegou fogo a 40%: voltaram ${back ? back[6] : 'NADA'} das ${paid} guardadas na obra (o que não se levantou: ${r2(paid * 0.6)}), e ${raised ? raised[6] : 'NADA'} ao povo pelo que já estava de pé; no diário: ${memo ? '«A obra da nossa casa se perdeu…»' : 'NADA'}`;
    } else info = `${v.name}: nenhuma obra encomendada`;
  }
  ok('h15 a obra que se perde devolve', fine15 && !bad().length, info);
}
// ---------------- h13: the shack (social.js): the family leaves it for a house with room taking what is its own, or makes it a hut paying the people's wood — in the ledger
{
  // (a town with the fewest free beds; three grown people of three houses put in a shack with 14 coins — the test's hand)
  const free = s => { const occ = new Map(); for (const v of S.villagers.values()) if (v.home) occ.set(v.home, (occ.get(v.home) || 0) + 1); let n = 0; for (const b of S.buildings.values()) if (b.set === s.id && b.built && housing(b) && b.type !== 'barraco') n = Math.max(n, G.BDEF[b.type].housing - (occ.get(b.id) || 0)); return n; };
  // (the three of the case past the age a town sends out to found another — 17 to 32, village.js checkExpansion: the day of
  // the case can be the day the town sends settlers, and the shack's people were among them in a newer world, T-128)
  const three = town => { const out = []; const seenH = new Set(); for (const v of [...S.villagers.values()].filter(o => o.set === town.id && o.age >= 32 && o.age < 60 && o.home && !o.captive && !o.jail && !o.aboard && !taken.has(o.id) && !(S.avatar && S.avatar.id === o.id)).sort((a, b) => a.id - b.id)) { if (seenH.has(v.home) || v.partner) continue; seenH.add(v.home); out.push(v); if (out.length === 3) break; } return out; };
  let town = null, pos = null, ppl = [];
  for (const tw of [...S.settlements.values()].filter(s => E.coinage(s.fac) && G.Village.pop(s.id) > 20).sort((a, b) => free(a) - free(b) || a.id - b.id)) {
    const p = G.Village.findSite(tw, 'hut'); const q = three(tw); if (p && !p.demolish && q.length === 3) { town = tw; pos = p; ppl = q; break; }
  }
  let info = 'nenhuma cidade de moeda com lugar para um barraco e três pessoas sem par de 32 anos ou mais', fine13 = false;
  if (town) {
    {
      const sh = G.Village.addBuilding('barraco', pos[0], pos[1], town.id, true);
      for (const v of ppl) { taken.add(v.id); v.home = sh.id; v.hhType = 'barraco'; }
      D.make('h:' + sh.id, 'moedas', 14, { code: 'teste' });
      const f = G.Fac.get(town.fac); if (D.free('f:' + f.id, 'wood') < 12) D.make('f:' + f.id, 'wood', 20, { code: 'teste', part: true });
      const L0 = S.ledgerN; const wood0 = D.get('f:' + f.id, 'wood');
      nextDay(); // (the street's day of each town: social.js)
      const hut = sh.type === 'hut', left = ppl.every(v => v.home && v.home !== sh.id);
      const coin8 = book(e => e[0] > L0 && e[8] === 'obra-casa' && e[3] === 'h:' + sh.id && e[4] === 'f:' + f.id && e[5] === 'moedas')[0];
      const woodUse = book(e => e[0] > L0 && e[8] === 'obra-casa' && e[3] === 'f:' + f.id && e[5] === 'wood')[0];
      const went = book(e => e[0] > L0 && e[8] === 'mudança' && e[3] === 'h:' + sh.id && e[5] === 'moedas')[0];
      if (hut) fine13 = !!coin8 && Math.abs(coin8[6] - 8) < 1e-6 && !!woodUse && Math.abs(coins('h:' + sh.id) - 6) < 1e-6 && sh.dono && ppl.some(v => v.id === sh.dono);
      else if (left) fine13 = !!went && Math.abs(went[6] - 14) < 1e-6;
      info = `${town.name} (no máximo ${free(town)} cama(s) livre(s) numa casa): ${ppl.map(v => v.name).join(', ')} num barraco com 14 moedas → ${hut ? `o barraco virou cabana: ${coin8 ? coin8[6] : 'NADA'} moedas ao tesouro (livro ${coin8 ? coin8[0] : '—'}), ${woodUse ? woodUse[6] : 'NADA'} de madeira do armazém (${r2(wood0)} → ${r2(D.get('f:' + f.id, 'wood'))}), ficaram ${coins('h:' + sh.id)} moedas, dono ${sh.dono ? (S.villagers.get(sh.dono) || {}).name : 'NENHUM'}` : left ? `saíram para uma casa com lugar levando ${went ? went[6] : 'NADA'} moedas (livro ${went ? went[0] : '—'})` : `NADA aconteceu (${ppl.map(v => `${v.name} ${v.home === sh.id ? 'no barraco' : v.home ? 'na casa #' + v.home : 'sem casa'}${v.set !== town.id ? ', partiu da cidade' : ''}`).join('; ')})`}`;
    }
  }
  ok('h13 o barraco', fine13 && !bad().length, info);
}
// ---------------- h14: the dear land (social.js): a rich family buys the house of a plain family in the heart, each with its own, in the ledger
{
  reload();
  // (the big towns of coin, the most people first: the first with a pair the dear land's own rules would trade — T-133)
  const cities = [...S.settlements.values()].filter(s => (s.tier || 0) >= 3 && E.coinage(s.fac)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id);
  let info = 'nenhuma cidade grande de moeda', fine14 = false; const tried = []; let tested = false;
  for (const city of cities) {
  if (tested) break; // (one pair is the case: the first town that has one)
  if (city && G.Urban && G.Urban.peek) {
    const sn = G.Urban.peek(city.id);
    const occ = new Map(); for (const v of S.villagers.values()) if (v.set === city.id && v.home) { const l = occ.get(v.home) || []; l.push(v); occ.set(v.home, l); }
    const homes = [...S.buildings.values()].filter(b => b.set === city.id && b.built && housing(b) && b.type !== 'barraco' && !b.upgradeFrom && (occ.get(b.id) || []).length && !(occ.get(b.id) || []).some(v => v.jail || v.aboard || taken.has(v.id))).map(b => { const c = G.Village.center(b); const o = sn && sn.cells.get(G.Urban.cellOf(c[0], c[1])); return o ? { b, val: o.value, cap: G.BDEF[b.type].housing, n: occ.get(b.id).length } : null; }).filter(Boolean).sort((a, b) => a.val - b.val || a.b.id - b.b.id);
    if (homes.length >= 8) {
      // (the pair by the rules of the dear land itself, social.js moveUp: the rich family below the town's middle land, the plain
      // one in its top quarter — no elite house, no noble living in it —, each house fitting the other's family: in the cities
      // grown by L-322 the dearest house that fitted was below the top quarter, and no trade came, T-133)
      // (the middle and the top quarter over the houses moveUp itself counts: lived in by people of the town, not captives)
      const occ2 = new Map(); for (const v of S.villagers.values()) if (v.set === city.id && v.home && !v.captive) occ2.set(v.home, (occ2.get(v.home) || 0) + 1);
      const vals = [...S.buildings.values()].filter(b => b.set === city.id && b.built && housing(b) && b.type !== 'barraco' && !b.upgradeFrom && occ2.get(b.id) && ![...S.villagers.values()].some(v => v.home === b.id && v.set === city.id && !v.captive && (v.jail || v.aboard))).map(b => { const c = G.Village.center(b); const o = sn && sn.cells.get(G.Urban.cellOf(c[0], c[1])); return o ? o.value : null; }).filter(x => x !== null).sort((a, b) => a - b);
      const mid = vals[vals.length >> 1], high = vals[Math.floor(vals.length * 0.75)];
      const noble = h => (occ.get(h.b.id) || []).some(v => v.grp === 'nobreza');
      const cheap = homes.find(h => h.val < mid && !h.b.elite);
      const dear = cheap && homes.slice().reverse().find(h => h.val >= high && h.cap >= cheap.n && cheap.cap >= h.n && !h.b.elite && !noble(h) && h.val - cheap.val > 9);
      if (dear) {
        tested = true;
        setCoins('h:' + cheap.b.id, 40); setCoins('h:' + dear.b.id, 5); // (the test's hand: a rich family on cheap ground, a plain one on dear)
        D.make('h:' + dear.b.id, 'food', 3, { code: 'teste' });
        const before = coins('h:' + cheap.b.id) + coins('h:' + dear.b.id);
        const L0 = S.ledgerN;
        // (the two houses' coins change only by the ledger: the price passes between them, and the day may bring the families
        // other coin of their own — a rent, a sale: in the cidade of L-322 one of them got 1,1 that day, T-133)
        const R14 = ['h:' + cheap.b.id, 'h:' + dear.b.id]; const own14 = []; const on14 = e => { if (e[5] === 'moedas' && (R14.includes(e[3]) || R14.includes(e[4]))) own14.push(e); }; D.onMove.push(on14);
        nextDay();
        D.onMove.splice(D.onMove.indexOf(on14), 1);
        const net14 = r2(own14.reduce((a, e) => a + (R14.includes(e[4]) ? e[6] : 0) - (R14.includes(e[3]) ? e[6] : 0), 0));
        const price = book(e => e[0] > L0 && e[8] === 'compra-casa' && e[5] === 'moedas' && e[3][0] === 'h' && e[4][0] === 'h')[0];
        const moves = book(e => e[0] > L0 && e[8] === 'mudança' && e[3][0] === 'h' && e[4][0] === 'h');
        const ours = price && ((price[3] === 'h:' + dear.b.id && price[4] === 'h:' + cheap.b.id));
        const after = coins('h:' + cheap.b.id) + coins('h:' + dear.b.id);
        fine14 = !!price && Math.abs(price[6] - 12) < 1e-6 && moves.length >= 2 && (!ours || (Math.abs(before + net14 - after) < 0.02 && dear.b.dono && cheap.b.dono));
        info = (tried.length ? tried.join(' · ') + ' · ' : '') + `${city.name}: ` + (price ? `${ours ? 'a família rica da casa #' + cheap.b.id + ' (terra a ' + Math.round(cheap.val) + ') comprou a casa #' + dear.b.id + ' (terra a ' + Math.round(dear.val) + ')' : 'outra troca da terra cara aconteceu'}: o preço, ${price[6]} moedas, pelo livro (${price[0]}); ${moves.length} mudanças no livro (${moves.slice(0, 4).map(e => `${e[6]} ${e[5]}`).join(', ')}); as moedas das duas casas ${ours ? `${r2(before)} → ${r2(after)} (pelo livro ${r2(before + net14)})` : '—'}; donos: ${ours ? `${(S.villagers.get(dear.b.dono) || {}).name} e ${(S.villagers.get(cheap.b.dono) || {}).name}` : '—'}` : `NENHUMA troca no dia (a casa #${cheap.b.id}, terra a ${Math.round(cheap.val)}, e a #${dear.b.id}, terra a ${Math.round(dear.val)})`);
      } else { tried.push(`${city.name}: nenhuma casa de terra cara que sirva (o meio da terra a ${Math.round(mid)}, o quarto de cima a partir de ${Math.round(high)})`); info = tried.join(' · '); }
    } else { tried.push(`${city.name}: menos de oito casas`); info = tried.join(' · '); }
  }
  }
  ok('h14 a terra cara', fine14 && !bad().length, info);
}
// ---------------- h10: the skip: the work ends and the family moves in
{
  reload();
  const v = readyCouple(); let info = 'nenhum outro casal', fine10 = false;
  if (v) {
    const w = readyTown(); const h = S.buildings.get(v.home); setCoins('h:' + h.id, (K.price(set, 'sobrado') + 4) * 3);
    K.order(v);
    const b = K.waiting(v);
    // (two years of the skip, and a year more at a time while the work stands unfinished — a war in the middle holds the
    // builders —, up to five)
    if (b) {
      M.saltar(2); let y = 2; for (; y < 5 && !b.built && S.buildings.has(b.id) && b.encomenda; y++) M.saltar(1);
      // (a house finished and lived in that the city is already raising further — a house to a sobrado: built again from
      // the ground of the old one — is a work that ended; in a world changed by L-201 the skip ended on it at 72%, T-111)
      const up = !b.built && !!b.upgradeFrom && !b.encomenda;
      fine10 = (b.built || up) && v.home === b.id && !b.encomenda;
      info = `um salto de ${y} anos: a obra #${b.id} ${b.built ? 'terminou' : up ? `terminou, e a cidade já a aumenta (${G.Village.buildName(b).toLowerCase()}, ${Math.round((b.progress || 0) * 100)}%)` : S.buildings.has(b.id) ? `NÃO terminou (${Math.round((b.progress || 0) * 100)}%)` : 'SUMIU'} e ${v.name} ${v.home === b.id ? 'mora nela' : 'NÃO mudou'}${warNote(w)}`;
    }
    else info = `${v.name}: nenhuma obra encomendada`;
  }
  ok('h10 o salto', fine10 && !bad().length && M.limpo(), info);
}
// ---------------- h16: what is left of a house — the ruin of one that fell, or of one in a town left to the wind — keeps the
// owner it had, and is no one's to inherit: with the owner gone, it is nobody's (L-304)
{
  reload();
  const her = () => QA.check().filter(q => /a herança não passou/.test(q.msg)).map(q => q.msg);
  const h = [...S.buildings.values()].filter(b => housing(b) && b.built && b.dono && S.villagers.has(b.dono)).sort((a, b) => a.id - b.id)[0];
  let info = 'nenhuma casa com dono', fine16 = false;
  if (h) {
    // (1) a house that falls — its owner alive —, and then the owner dies
    const o = S.villagers.get(h.dono);
    G.Village.destroyBuilding(h, 'fire'); const kept = h.dono === o.id;
    G.Village.kill(o, 'teste');
    const m1 = her().filter(m => m.includes('#' + h.id + ':'));
    // (2) a town left to the wind — its people moved to another town of the same people, the owner of one of its houses
    // with them (the test's hand) —, and then the owner dies
    let m2 = null, b2 = null, o2 = null;
    for (const s of [...S.settlements.values()].sort((a, c) => G.Village.pop(a.id) - G.Village.pop(c.id) || a.id - c.id)) {
      const to = [...S.settlements.values()].find(x => x.id !== s.id && x.fac === s.fac); if (!to) continue;
      b2 = [...S.buildings.values()].filter(b => b.set === s.id && housing(b) && b.built && b.dono && S.villagers.has(b.dono)).sort((a, c) => a.id - c.id)[0]; if (!b2) continue;
      o2 = S.villagers.get(b2.dono);
      for (const v of S.villagers.values()) if (v.set === s.id) { G.Vg.endTask(v); v.set = to.id; const hh = S.buildings.get(v.home); if (hh && hh.set === s.id) v.home = 0; }
      G.Village.abandon(s); G.Village.kill(o2, 'teste');
      m2 = her().filter(m => m.includes('#' + b2.id + ':'));
      break;
    }
    fine16 = kept && h.type === 'ruin' && !h.dono && !m1.length && !!b2 && b2.type === 'ruin' && !b2.dono && !!m2 && !m2.length;
    info = `a ${h.origType}#${h.id} de ${o.name} pegou fogo (a ruína guardou o dono: ${kept ? 'sim' : 'não'}); ${o.name} morreu: a ruína ${h.dono ? 'AINDA DE #' + h.dono : 'sem dono'}${m1.length ? ' — ' + m1[0] : ''}; ${b2 ? `a cidade da ${b2.origType}#${b2.id} abandonada, ${o2.name} morreu: a ruína ${b2.dono ? 'AINDA DE #' + b2.dono : 'sem dono'}${m2 && m2.length ? ' — ' + m2[0] : ''}` : 'NENHUMA cidade com uma casa de dono para abandonar'}`;
  }
  ok('h16 a ruína sem dono', fine16 && !bad().length, info);
}
// ---------------- h9: a people without coin: the people raise it with what they have
{
  M.pronto('cidade'); S = G.S; M.viver(2); G.inSim = Math.max(G.inSim, 1); taken.clear();
  // (the biggest town of a people without coin — or, when it has nobody left to make a couple of, the next one: in the cidade
  // grown by L-322 the single men of Argos all own the house they live in, T-134)
  const noCoin = [...S.settlements.values()].filter(s => !E.coinage(s.fac)).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id);
  set = noCoin[0];
  let info = 'nenhuma cidade sem moeda', fine9 = false;
  let v = null; for (const tw of noCoin) { v = couple(tw); if (v) { set = tw; break; } }
  if (set) {
    const f = G.Fac.get(set.fac); for (const k of ['wood', 'stone']) if ((f.stock[k] || 0) < 60) D.make('f:' + f.id, k, 60, { code: 'teste', part: true });
    if (v) {
      // (the builders free — the town's other orders finished: the world raises two at a time — and wood and stone for the
      // house the family needs, a sobrado for seven; then the family's decision, now, as h7's: the town's day takes the most
      // urgent family first, and in an older world two others took the builders before this one's turn, T-111)
      clearWay(v);
      const def = G.BDEF[K.plan(v, null, set, null, K.need(v)).type];
      for (const k in def.cost) { const want = def.cost[k] * 1.5 + 10; if ((f.stock[k] || 0) < want) D.make('f:' + f.id, k, want - (f.stock[k] || 0), { code: 'teste', part: true }); }
      const L0 = S.ledgerN; const h0 = v.home;
      const r = K.order(v);
      // (the people raise one — or give the empty one it has: in a people without coin, nothing is paid)
      const b = K.waiting(v) || (v.home !== h0 ? S.buildings.get(v.home) : null);
      const paid = book(e => e[0] > L0 && e[5] === 'moedas' && (e[8] === 'obra-casa' || e[8] === 'compra-casa' || e[8] === 'aluguel')).length;
      fine9 = !!r.ok && !!b && !paid && b.dono === v.id;
      info = `${set.name} (sem moeda): ${v.name} ${b ? (b.built ? `recebeu do povo a casa vazia #${b.id}` : `pediu ao povo, e o povo pôs ${G.Village.buildName(b).toLowerCase()} em ${b.x},${b.y}`) : 'NÃO conseguiu casa: ' + (r.why || JSON.stringify(r))}; moedas pagas: ${paid}`;
    } else info = `${noCoin.map(s => s.name).join(', ')}: nenhum casal numa casa cheia`;
  }
  ok('h9 um povo sem moeda', fine9 && !bad().length, info);
}
const e = M.erros();
ok('limpo', M.limpo() && !bad().length, M.limpo() ? 'sem erro de módulo nem aviso no console' : `erros de módulo ${JSON.stringify(e.mod)}; console: ${e.console.slice(0, 3).join(' | ')}`);
console.log(fails.length ? `CASA: FALHOU (${fails.join(', ')})` : 'CASA: ok');
process.exit(fails.length ? 1 : 0);
