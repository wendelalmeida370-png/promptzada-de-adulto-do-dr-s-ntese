// taverna-cadeia: a cadeia da taverna (a quarta onda, T3 — D-840 a D-849), em Node, pelo qa/nodemundo.js, na metrópole pronta — a casa
// de Mênfis, a mais procurada (a única cidade da metrópole com braços sob o teto dos ofícios para a cozinha e a cuba):
//  c1 a casa que contrata pela procura e pelo tamanho: a decisão da casa pela porta das provas (G.TavernaOficios.decideNow) — a procura
//     das noites, o tamanho da casa, a falta na prateleira, as noites seguidas, a histerese, o dinheiro do taverneiro, a dívida, a fonte do
//     grão —; e no mundo: quem vem é gente da cidade, pelo repartidor de ofícios (o livro das trocas, o posto do dia da cidade)
//  c2 o soldo pelo livro, todo dia, do bolso do taverneiro à casa de quem trabalha
//  c3 as compras do dia: do armazém do povo, pelo preço, das moedas do taverneiro, à despensa e à tulha da casa — o carregador à porta
//  c4 a cerveja só do grão que entrou (a tulha só de cereal; nenhum jarro além do grão gasto)
//  c5 o prato cozinhado do que foi comprado: a comida da despensa movida à prateleira pela panela; a carta diz o prato da casa
//  c6 um save no meio da fermentação: a brassagem volta como estava e acaba depois do load; o mesmo save carregado duas vezes vive o
//     mesmo futuro
//  c7 nada vem do nada: as contas do livro e o verificador (o sistema «tavcadeia») limpos a noite inteira
//  c8 a mão do cervejeiro: a cerveja melhora com os dias de ofício; a carta diz «das melhores da cidade» só quando é; a casa de cerveja
//     boa puxa a vontade da noite
//  c9 os casos ruins: o deus tira o grão da tulha no meio de uma brassagem; o cozinheiro morre no meio da panela; a taverna cai (o que as
//     despensas guardavam sai pelo livro, as operações acabam, os postos se vão)
//  e nenhum erro de módulo nem aviso no console.
//   node qa/taverna-cadeia.js        (≈ 3 min)
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const D = G.Depot, A = G.Act, T = G.Taverna, V = G.Village, TO = G.TavernaOficios, O = G.Origem, E = G.Eco;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | taverna-cadeia ${name} | ${info}`); if (!c) fails.push(name); };
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
M.pronto('metropole'); M.viver(1);
const S = () => G.S;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const r2 = x => Math.round(x * 100) / 100;
// (the days of the proof in the god's peace and with no feast of the town — the ready metrópole goes to war on its second day (T-910), a
// town that changes hands changes its tavern's people, and on a feast nobody works: what this proof measures is the house's chain)
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: true }; } };
// (the skip, a while of the world's seconds: the long waits — the memory of a trade, two days of fermentation)
const skip = sec => { const t0 = S().clock; G.Skip.on = true; G.FX.off = true; try { while (S().clock < t0 + sec) { if (Math.floor(S().clock) % 10 === 0) calm(); G.Main.skipStep(1); } } finally { G.Skip.on = false; G.FX.off = false; } };
// (the ledger's lines as they are written: [n, day, clock, from, to, good, n, op, code, by] — and the purse of the house's keeper then)
let bid = 0; const kOf = () => { const t = bid && S().buildings.get(bid); return t ? T.keeperOf(t) : null; };
const led = []; D.onMove.push(e => { const k = kOf(); led.push({ day: S().day, from: e[3], to: e[4], k: e[5], n: e[6], op: e[7], c: e[8], by: e[9], kp: k ? E.coinRef(k) : null, kid: k ? k.id : 0 }); });
const hands = new Set(); // (who held a post of this house during the proof)
// (the rules of the chain and of what it stands on: the S3 and worse of its own system, the S2 of the origin and of the trades, and
// the tavern's own of this house; the tavern's elsewhere are said, not counted — they are the night's, P7's)
const bad = [], other = []; const watch = () => { for (const q of QA.check()) { const mine = (q.sys === 'tavcadeia' && q.sev <= 3) || (q.sev <= 2 && (q.sys === 'origem' || q.sys === 'oficio')) || (q.sev <= 2 && q.sys === 'taverna' && q.msg.includes('#' + bid)); const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (mine) { if (bad.length < 10 && !bad.includes(m)) bad.push(m); } else if (q.sev <= 2 && q.sys === 'taverna' && other.length < 4 && !other.includes(m)) other.push(m); } };
// the house: the tavern of the town with the most grown hands (Mênfis, in the ready metrópole)
const adults = id => [...S().villagers.values()].filter(v => v.set === id && !v.captive && v.age >= 16 && v.age < 62).length;
bid = [...S().buildings.values()].filter(x => x.type === 'taverna' && x.built && T.keeperOf(x)).sort((x, y) => adults(y.set) - adults(x.set) || x.id - y.id)[0].id;
// (the house as the world has it now — a load makes the world's objects anew)
let b = S().buildings.get(bid); const fresh = () => { b = S().buildings.get(bid) || b; return b; };
const set = S().settlements.get(b.set); const fid = V.facOfSet(b.set); const f = G.Fac.get(fid);
console.log(`   a casa: #${b.id} em ${set.name} (${f.civ}, ${adults(set.id)} adultos, ${b.esc}); o taverneiro ${T.keeperOf(b).name}`);

// ---------------- c1 the house that hires by the nights and by its size (its decision) ----------------
{
  const keep = JSON.parse(JSON.stringify(b.tvo || null)); const esc0 = b.esc;
  const memOf = o => Object.assign({ n: 3, ref: 0, rb: 0, sc: 0, sb: 0, ck: 0, cv: 0, dev: 0, pausa: 0, fecha: 0, hoje: { g: 0, sc: 0, sb: 0, cp: 0, fr: 0 } }, o);
  const dec = (o, esc) => god(() => { b.tvo = memOf(o); if (esc) b.esc = esc; const w = TO.decideNow(b); b.esc = esc0; return Object.assign({}, w, { pausa: b.tvo.pausa, why: b.tvo.why }); });
  const L = [];
  const t = (nm, w, want) => { const good = Object.keys(want).every(k => w[k] === want[k]); L.push(`${nm}: ${good ? 'ok' : 'ERRADO ' + JSON.stringify(w)}`); return good; };
  let all = true;
  all = t('taberna, 3 pratos por noite: o taverneiro sozinho', dec({ ref: 3 }), { cozinheiro: 0 }) && all;
  all = t('taberna, 6 pratos por noite: ainda o taverneiro sozinho', dec({ ref: 6 }), { cozinheiro: 0 }) && all;
  all = t('taberna, 8 pratos por noite: o cozinheiro', dec({ ref: 8 }), { cozinheiro: 1 }) && all;
  all = t('duas noites só de 9: ainda não (noites seguidas)', dec({ n: 2, ref: 9 }), { cozinheiro: 0 }) && all;
  all = t('hospedaria, 3,5 pratos: o cozinheiro (o tamanho)', dec({ ref: 3.5 }, 'hospedaria'), { cozinheiro: 1 }) && all;
  all = t('taverna, 3,5 pratos: não (a marca dela é 5)', dec({ ref: 3.5 }, 'taverna'), { cozinheiro: 0 }) && all;
  all = t('taverna, 5,5 pratos: o cozinheiro', dec({ ref: 5.5 }, 'taverna'), { cozinheiro: 1 }) && all;
  all = t('taberna, 3,5 pratos e a prateleira sem prato meia noite: o cozinheiro (a falta)', dec({ ref: 3.5, sc: 0.5 }), { cozinheiro: 1 }) && all;
  all = t('com cozinheiro, 4 pratos: fica (a histerese)', dec({ ref: 4, ck: 1 }), { cozinheiro: 1 }) && all;
  all = t('com cozinheiro, 3 pratos: vai embora', dec({ ref: 3, ck: 1 }), { cozinheiro: 0 }) && all;
  all = t('8 rodadas de cerveja por noite: o cervejeiro', dec({ rb: 8 }), { cervejeiro: 1 }) && all;
  all = t('3 rodadas e a sala com sede (as rodadas que a noite seca pediria: 5): o cervejeiro (a falta)', dec({ rb: 3, sb: 0.5, rl: 5 }), { cervejeiro: 1 }) && all;
  all = t('3 rodadas e pouca sede: não', dec({ rb: 3, sb: 0.5, rl: 1 }), { cervejeiro: 0 }) && all;
  // (the people's grain hidden for a moment — its parts in the store and in the house's store said of fish —: no brewer where there is
  // nothing to brew; nada vem do nada)
  { const hide = ref => { const p = S().orig.p[ref] && S().orig.p[ref].food; if (!p) return null; const was = Object.assign({}, p); let n = 0; for (const k of Object.keys(p)) if (O.FOOD[k] && O.FOOD[k].cereal) { n += p[k]; delete p[k]; } if (n) p.peixe = (p.peixe || 0) + n; return [p, was]; };
    const H = ['f:' + fid, 'e:' + b.id].map(hide); const w = dec({ rb: 9 });
    for (const h of H) if (h) { for (const k of Object.keys(h[0])) delete h[0][k]; Object.assign(h[0], h[1]); }
    all = t('9 rodadas e nenhum cereal no povo: nenhum cervejeiro', w, { cervejeiro: 0 }) && all; }
  // (the keeper's coins away for a moment — to the treasury and back, by the ledger —: nobody the house cannot pay)
  { const kp = E.coinRef(T.keeperOf(b)); const n = D.get(kp, 'moedas'); if (n > 0) god(() => D.move(kp, 'f:' + fid, 'moedas', n, { code: 'teste' }));
    const w = dec({ ref: 9, rb: 9 }); if (n > 0) god(() => D.move('f:' + fid, kp, 'moedas', n, { code: 'teste' }));
    all = t(`o taverneiro sem moedas (tinha ${r2(n)}): ninguém novo`, w, { cozinheiro: 0, cervejeiro: 0 }) && all; }
  { const w = dec({ ref: 9, rb: 9, ck: 1, cv: 1, dev: 2 }); all = t('dois dias de soldo devidos: a casa dispensa a sua gente', w, { cozinheiro: 0, cervejeiro: 0, pausa: 3 }) && all; }
  god(() => { b.tvo = keep || undefined; if (!keep) delete b.tvo; b.esc = esc0; });
  ok('c1 a decisão da casa', all, L.join('; '));
}

// ---------------- c1b the world: the trades come by the repartidor ----------------
// (the nights of a busy house, provoked — the memory of three nights of nine plates and nine rounds —, and the house decides; then the
// world lives: the town's memory of the trades, the newest hand, the post of the town's day)
god(() => { b.tvo = Object.assign(b.tvo || {}, { n: 3, ref: 9, rb: 9, sc: 0, sb: 0, ck: 0, cv: 0, dev: 0, pausa: 0, fecha: 0 }); TO.decideNow(b); });
const log0 = V.tradeLog.length; let waited = 0;
while (waited < 400 && !(TO.staff(b).cozinheiro && TO.staff(b).cervejeiro)) { skip(20); waited += 20; }
const staff = TO.staff(b); let cook = staff.cozinheiro, brewer = staff.cervejeiro; if (cook) hands.add(cook.id); if (brewer) hands.add(brewer.id);
{
  const L = V.tradeLog.slice(log0).filter(e => e.to === 'cozinheiro' || e.to === 'cervejeiro');
  const byRep = p => !!p && L.some(e => e.id === p.id && e.to === p.role);
  const others = [...S().villagers.values()].filter(v => (v.role === 'cozinheiro' || v.role === 'cervejeiro') && v !== cook && v !== brewer && !L.some(e => e.id === v.id));
  ok('c1b pelo repartidor', !!cook && !!brewer && byRep(cook) && byRep(brewer) && cook.job === b.id && brewer.job === b.id && !others.length,
    `${waited} s do mundo: ${cook ? cook.name + ' cozinheiro' : 'sem cozinheiro'}, ${brewer ? brewer.name + ' cervejeiro' : 'sem cervejeiro'}; as trocas: ${L.map(e => `#${e.id} ${e.from || '—'}→${e.to} (${e.why})`).join(', ') || 'nenhuma'}; ${others.length} com o ofício sem troca do repartidor`);
}

// ---------------- the chain lives: until a batch of the vat ferments (the save, c6), then until its jars ----------------
let snapOp = null, snap = null, sawCarta = '', sawBest = false, samples = 0;
const brewOps = () => A.all().filter(o => o.def === 'brassagem' && o.at === b.id);
let lastDay = -1; const pratoSeen = new Set();
const look = () => {
  samples++; watch();
  const st = TO.staff(b); for (const r of TO.ROLES) if (st[r]) hands.add(st[r].id); for (const t of Object.keys(b.prato || {})) pratoSeen.add(t);
  if (S().day !== lastDay) { lastDay = S().day; const o = b.tvo || {}; const n = q => (q || 0).toFixed(2); console.log(`   dia ${S().day}: a casa quer ${o.ck ? 'cozinheiro' : '—'}/${o.cv ? 'cervejeiro' : '—'} (pratos ${n(o.ref)}, rodadas ${n(o.rb)}, sem prato ${n(o.sc)}, sem cerveja ${n(o.sb)}${o.why ? ', ' + o.why : ''}); tem ${st.cozinheiro ? st.cozinheiro.name : '—'}/${st.cervejeiro ? st.cervejeiro.name : '—'}; despensa ${JSON.stringify(b.despensa || {})}, tulha ${JSON.stringify(b.tulha || {})}; ontem ${o.conta ? `vendeu ${o.conta.venda}, comprou ${o.conta.compras}, soldo ${o.conta.soldos}` : '—'}`); }
  const c = T.cartaOf(b).find(x => x.k === 'food' && /da cozinha da casa/.test(x.desc || '')); if (c && !sawCarta) sawCarta = `${c.nome} — ${c.desc}`;
  if (T.cartaOf(b).some(x => /das melhores da cidade/.test(x.desc || ''))) sawBest = true;
};
let t1 = 0;
while (t1 < 900 && !snapOp) {
  skip(10); t1 += 10; look();
  const op = brewOps().find(o => A.live(o) && TO.BREW[o.data.k].st[o.data.s].id === 'fermentar' && o.data.t > 5);
  if (op) { snapOp = { id: op.id, s: op.data.s, t: op.data.t, got: op.data.got, mosto: op.data.mosto, de: Object.assign({}, op.data.de), qual: op.data.qual }; snap = G.Save.serialize(); }
}
// (the save in the middle of the fermentation: the world goes on from the loaded one)
let back = null;
if (snap) {
  M.salvarCarregar(); fresh(); const op = A.get(snapOp.id);
  back = op && A.live(op) ? { s: op.data.s, t: op.data.t, mosto: op.data.mosto, qual: op.data.qual } : null;
}
let t2 = 0; const doneOp = () => { const op = snapOp && A.get(snapOp.id); return op && !A.live(op) ? op : null; };
while (t2 < 700 && snapOp && !doneOp()) { skip(10); t2 += 10; look(); }
// (a while more for the kitchen of the evening: the menu read while the dishes are on the shelf)
if (!sawCarta) for (let k = 0; k < 20 && !sawCarta; k++) { skip(10); look(); }
console.log(`   ${t1 + t2} s do mundo vividos (${samples} olhadas); cpu ${Math.round(clock() - c0)} s`);

// ---------------- c2 the wages by the ledger ----------------
if (cook) cook = S().villagers.get(cook.id) || cook; if (brewer) brewer = S().villagers.get(brewer.id) || brewer;
{
  const L = led.filter(e => e.c === 'soldo-taverna' && e.kid && e.by === e.kid); // (this house's: paid by its keeper)
  const per = id => L.filter(e => e.to === E.coinRef(S().villagers.get(id) || { home: 0, id })).length;
  const right = L.every(e => Math.abs(e.n - TO.SOLDO) < 1e-6 && e.from === e.kp);
  const days = new Set(L.map(e => e.day)).size;
  ok('c2 o soldo pelo livro', !!cook && !!brewer && L.length >= 2 && right && per(cook.id) >= 1 && per(brewer.id) >= 1,
    `${L.length} soldos de ${TO.SOLDO} em ${days} dias (${cook ? per(cook.id) : 0} ao cozinheiro, ${brewer ? per(brewer.id) : 0} ao cervejeiro), todos do bolso do taverneiro: ${right ? 'sim' : 'NÃO'}; a casa deve ${b.tvo ? b.tvo.dev : '?'} dia(s)`);
}

// ---------------- c3 the purchases of the day ----------------
{
  const goods = led.filter(e => e.c === 'compra-taverna' && e.k !== 'moedas' && hands.has(e.by)); // (this house's: bought by its people)
  const coins = led.filter(e => e.c === 'compra-taverna' && e.k === 'moedas' && hands.has(e.by));
  const paidByKeeper = coins.every(e => e.from === e.kp && /^f:/.test(e.to));
  const fromStore = goods.every(e => e.from === 'f:' + fid && /^v:/.test(e.to));
  const into = led.filter(e => e.c === 'entrega' && (e.to === 'k:' + b.id || e.to === 'e:' + b.id));
  const bought = goods.reduce((a, e) => a + e.n, 0), arrived = into.reduce((a, e) => a + e.n, 0);
  const frete = led.filter(e => e.c === 'frete' && hands.has(e.by)); const porters = new Set(into.filter(e => !hands.has(+String(e.from).slice(2))).map(e => e.from));
  const kinds = {}; for (const e of goods) kinds[e.k] = r2((kinds[e.k] || 0) + e.n);
  ok('c3 as compras do dia', goods.length >= 3 && coins.length === goods.length && paidByKeeper && fromStore && arrived >= bought - 8 - 1e-6 && arrived <= bought + 1e-6,
    `${goods.length} compras (${Object.entries(kinds).map(([k, n]) => `${n} de ${k}`).join(', ')}), ${coins.length} pagas das moedas do taverneiro ao armazém (${r2(coins.reduce((a, e) => a + e.n, 0))}); ${r2(arrived)} de ${r2(bought)} chegaram à despensa e à tulha; ${frete.length} fretes, ${porters.size} carregadores à porta`);
  ok('c3 o carregador à porta', frete.length >= 1 && porters.size >= 1, `${frete.length} vezes um carregador do armazém levou os sacos à taverna (o frete de ${TO.FRETE}); ${porters.size} pessoas diferentes`);
}

// ---------------- c4 the beer only of the grain that came in ----------------
{
  const used = led.filter(e => e.c === 'cuba-grao' && e.from === 'e:' + b.id); const grain = used.reduce((a, e) => a + e.n, 0);
  const fromTulha = used.every(e => e.from === 'e:' + b.id && e.to === '@uso');
  const jars = led.filter(e => e.c === 'fornada' && e.from === '@mundo' && e.to === 'b:' + b.id && (e.k === 'cerveja' || e.k === 'mel') && A.get(e.op) && A.get(e.op).def === 'brassagem').reduce((a, e) => a + e.n, 0);
  const ops = brewOps(); const deOK = ops.every(o => Object.keys(o.data.de || {}).every(k => O.FOOD[k] && O.FOOD[k].cereal));
  const tulha = O.parts('e:' + b.id, 'food'); const onlyCereal = Object.keys(tulha).every(k => O.FOOD[k] && O.FOOD[k].cereal);
  ok('c4 a cerveja só do grão', grain > 0 && jars > 0 && jars <= grain + 1e-6 && fromTulha && deOK && onlyCereal,
    `${r2(grain)} de grão gasto da tulha (${ops.map(o => Object.entries(o.data.de || {}).map(([k, n]) => `${n} de ${k}`).join('+')).filter(Boolean).join('; ')}), ${r2(jars)} jarros feitos; a tulha: ${JSON.stringify(tulha)}`);
}

// ---------------- c5 the dish cooked of what was bought ----------------
{
  const moved = led.filter(e => e.c === 'cozinha' && (e.from === 'k:' + b.id || e.to === 'b:' + b.id)); const n = moved.reduce((a, e) => a + e.n, 0);
  const right = moved.every(e => e.from === 'k:' + b.id && e.to === 'b:' + b.id);
  const into = led.filter(e => e.to === 'k:' + b.id && e.k === 'food' && e.c === 'entrega').reduce((a, e) => a + e.n, 0);
  const R = TO.RECEITA[f.civ] || TO.RECEITA.classico; const parts = [...pratoSeen]; const ofRecipe = parts.every(t => R.main.includes(t) || R.base.includes(t));
  ok('c5 o prato do que foi comprado', n > 0 && right && n <= into + 1e-6 && ofRecipe && !!sawCarta,
    `${r2(n)} pratos da panela à prateleira (de ${r2(into)} de comida que chegou à despensa), das partes ${parts.join(', ') || 'nenhuma'} (a receita do povo ${f.civ}); a carta: «${sawCarta || 'nenhum prato da casa visto'}»`);
}

// ---------------- c6 the save in the middle of the fermentation ----------------
{
  const end = doneOp(); const made = end ? led.filter(e => e.op === end.id && e.c === 'fornada').reduce((a, e) => a + e.n, 0) : 0;
  const same = !!snapOp && !!back && back.s === snapOp.s && Math.abs(back.t - snapOp.t) < 1e-6 && Math.abs(back.mosto - snapOp.mosto) < 1e-6 && back.qual === snapOp.qual;
  ok('c6 o save no meio da fermentação', same && !!end && end.st === 'ok' && made > 0,
    snapOp ? `brassagem #${snapOp.id} salva fermentando (${snapOp.t} s de ${TO.FERM}, ${snapOp.mosto} de mosto, a mão ${snapOp.qual}); carregada: ${back ? `etapa ${back.s}, ${back.t} s, ${back.mosto} de mosto` : 'SUMIU'}; depois do load ${end ? `acabou (${end.st}) com ${r2(made)} jarros` : 'NÃO ACABOU'}` : 'nenhuma brassagem chegou a fermentar');
  // (the same save loaded twice lives the same future)
  if (snap) {
    const run = () => { G.Save.apply(JSON.parse(snap)); M.viver(8); return JSON.stringify(A.canon()); };
    const a = run(), c = run(); fresh();
    ok('c6 o mesmo futuro', a === c, a === c ? 'o mesmo save carregado duas vezes, oito segundos depois: o mesmo mundo (as operações, a cuba, a panela, as despensas)' : 'DOIS FUTUROS');
  }
}

// ---------------- c7 nothing comes from nothing ----------------
{
  const born = led.filter(e => e.from === '@mundo' && /^[ke]:/.test(String(e.to)));
  ok('c7 nada vem do nada', !bad.length && !born.length, `${bad.join(' / ') || 'o verificador limpo'}; ${born.length} coisas nascidas nas despensas`);
}

// ---------------- c8 the brewer's hand ----------------
{
  const q0 = TO.mao({ roleDay: S().day, age: 30 }), q15 = TO.mao({ roleDay: S().day - 15, age: 30 }), q40 = TO.mao({ roleDay: S().day - 40, age: 30 }), qc = TO.mao({ roleDay: S().day - 15, age: 30 }, { cevada: 6 });
  const ops = brewOps(); const qOK = ops.every(o => o.data.qual >= 0.3 - 1e-6 && o.data.qual <= 1);
  // (the house's beer, as it is now; then of a master's hand for a moment: the menu says it, and the night's wish feels it)
  const c = TO.casa(b, 'cerveja'); const best0 = TO.boa(b); const line0 = (T.cartaOf(b).find(x => x.k === 'cerveja') || {}).desc || '';
  let line1 = '', best1 = false, dw = 0;
  god(() => {
    const M0 = JSON.parse(JSON.stringify(b.adega || {})); const shelf0 = D.get('b:' + b.id, 'cerveja');
    b.adega = Object.assign({}, b.adega, { cerveja: { n: Math.max(0.5, Math.min(shelf0, 2)), q: 0.92 } });
    if (shelf0 >= T.DOSE.cerveja) {
      best1 = TO.boa(b); line1 = (T.cartaOf(b).find(x => x.k === 'cerveja') || {}).desc || '';
      const v = [...S().villagers.values()].find(o => o.set === b.set && o.age >= 20 && o.age < 50 && !o.captive);
      b.adega = M0; const w0 = T.wish(v, b); b.adega = Object.assign({}, M0, { cerveja: { n: Math.min(shelf0, 2), q: 0.92 } }); const w1 = T.wish(v, b); dw = r2(w1 - w0);
    }
    b.adega = M0;
  });
  ok('c8 a mão do cervejeiro', q0 < q15 && q15 < q40 && qc > q15 && qOK && (!best0 || c.q >= TO.BOA) && (best0 || !/das melhores/.test(line0)) && (!line1 || (best1 && /das melhores da cidade/.test(line1) && dw > 0)),
    `a mão: ${q0} no primeiro dia, ${q15} com quinze, ${q40} com quarenta (${qc} com cevada); a cerveja da casa agora: ${r2(c.n)} jarros de mão ${c.q} — «${line0 || 'fora da carta'}»; de mão de mestre: «${line1 || 'sem cerveja na prateleira para a carta'}» e a vontade da noite +${dw}`);
}

// ---------------- c9 the bad cases ----------------
{
  const L = [];
  // (the god takes the grain of the house's store in the middle of a batch: the batch holds back only what is there)
  god(() => { const tl = D.get('e:' + b.id, 'food'); if (tl > 0) D.use('e:' + b.id, 'food', tl, { code: 'teste', mine: true, part: true }); });
  M.viver(3); const rsvOK = brewOps().filter(o => A.live(o)).every(o => !(TO.BREW[o.data.k].in === 'food') || o.data.got <= D.get('e:' + b.id, 'food') + 1e-6); L.push(`o deus tira o grão da tulha: ${rsvOK ? 'a brassagem guarda só o que há' : 'A BRASSAGEM GUARDA O QUE NÃO HÁ'}`);
  // (the cook dies in the middle of a pot)
  const ck = TO.staff(b).cozinheiro; let potOK = true;
  if (ck) { god(() => V.kill(ck, 'teste', true)); M.viver(3); potOK = A.all().filter(o => o.def === 'panelada' && A.live(o)).every(o => !(o.roles && o.roles[ck.id])); L.push(`o cozinheiro morre: ${potOK ? 'sai da panela, que espera outra mão' : 'AINDA NA PANELA'}`); }
  // (the tavern falls: what its pantries kept goes by the ledger, its batches end, its posts go)
  const had = { k: D.list('k:' + b.id), e: D.list('e:' + b.id) }; const n0 = led.length;
  god(() => V.destroyBuilding(b, 'teste'));
  M.viver(6);
  const lost = led.slice(n0).filter(e => /^[ke]:/.test(String(e.from)) && e.to === '@uso');
  const hadN = Object.values(had.k).concat(Object.values(had.e)).reduce((a, x) => a + x, 0), lostN = lost.reduce((a, e) => a + e.n, 0);
  const opsGone = A.all().filter(o => (o.def === 'brassagem' || o.def === 'panelada') && o.at === b.id && A.live(o)).length;
  const posts = [...S().villagers.values()].filter(v => (v.role === 'cozinheiro' || v.role === 'cervejeiro') && v.job === b.id).length;
  L.push(`a taverna cai: ${r2(lostN)} de ${r2(hadN)} das despensas pelo livro, ${opsGone} operações vivas, ${posts} postos nela`);
  watch();
  ok('c9 os casos ruins', rsvOK && potOK && Math.abs(lostN - hadN) < 1e-3 && !opsGone && !posts && !bad.length, L.join('; ') + (bad.length ? ' / ' + bad.join(' / ') : ''));
}

if (other.length) console.log(`   (a taverna noutras casas, da noite — não desta prova: ${other.join(' / ')})`);
const er = M.erros(); ok('sem erro', !Object.keys(er.mod).length && !er.console.length, `módulos ${JSON.stringify(er.mod)}; console ${er.console.slice(0, 3).join(' / ') || 'limpo'}`);
console.log(`   cpu ${Math.round(clock() - c0)} s`);
console.log(fails.length ? `FALHOU: ${fails.length} (${fails.join(', ')})` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
