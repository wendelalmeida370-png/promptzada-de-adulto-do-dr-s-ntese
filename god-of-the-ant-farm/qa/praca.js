// praca: a praça ao fim da tarde, o foguista no posto e o bairro dos banhos (Bairros Vivos, a segunda rodada da freguesia;
// D-225 a D-228), em Node, sobre o código do jogo.
// A praça. Parar na praça das suas ruas é uma vontade de cada um, com causa (act-lazer.js, G.Praca: wish, lot, hourOf, pick,
// urge, go; villagers.js, decide: 'praca' antes do fim do dia de trabalho, e a caminho de casa no 'home'): quem, quando,
// quanto, o que impede; as crianças das ruas da praça brincam nela à tarde (G.Praca.playAt).
// O foguista. O posto é a perna da operação dele (G.Termas.onDuty): o dia dos banhos o chama à fornalha, nenhum chamado de
// fora o tira dela, a água de casa vai com outro da casa, a refeição é antes de abrir.
// O bairro. O banho conta na chave «banho» da vida do bairro (o perfil «de banhos»), nunca em «noite».
//   a  a regra da praça, sem viver (no mundo pronto, a mão da prova numa pessoa de cada vez):
//      a1 o que impede — o corpo do deus, a carga, o preso, o cativo, a criança, a fome, o cansaço, a doença, o medo, o
//         sono, o foguista no posto, a hora (cedo, de noite), a chuva, a tempestade, o frio forte, o inverno do deus, a
//         guerra à porta, o pânico, a festa da cidade, a praça cheia, a distância, a sorte do dia; cada um zera a vontade;
//      a2 quem quer mais — o velho, o moço, o sociável, o mercador junto do mercado; menos quem mora longe;
//      a3 a sorte do dia — da pessoa e do dia (G.hash), espalhada por igual, a mesma o dia inteiro, outra no dia seguinte,
//         sem tirar nada do acaso do mundo; a vontade pedida de fora do passo não muda o mundo;
//      a4 onde — a praça mais perto de casa; o mercado só enquanto vende; o lugar de cada um fora da fonte, dentro da praça;
//      a5 o que se larga pela praça antes do fim do dia — o machado, a enxada, a obra comum; nunca a carga, a perna de uma
//         operação, a pedra, o posto, a obra grande da cidade;
//   b  os dias vividos no mundo pronto (DIAS=3), sem a mão da prova em ninguém, na paz do deus: b1 a praça tem gente na
//      conversa (quantos por dia e por cidade, o máximo de uma vez) e crianças a brincar; b2 ninguém é chamado dormindo, com
//      carga, com as mãos numa operação, sendo o corpo do deus, com a sorte fora da vontade; b3 ninguém na conversa depois de
//      escurecer nem debaixo de chuva; b4 o que já vivia continua a viver nesses dias (a taverna, o teatro, os banhos, a
//      ceia: as contas ditas); b5 o verificador (com as regras novas) e nenhum erro;
//   f  o foguista: f1 nos mesmos dias vividos, com foguista e lenha no povo, a fornalha acesa em todo dia de banhos, e
//      cedo; f2 o foguista no posto não é levado por uma vontade, pela água de casa nem por um chamado de fora; f3 pela mão
//      da prova: chamado do machado à fornalha antes de abrir; a refeição antes de abrir; a fome que não o tira do posto e a
//      que tira; o chamado de fora que não o leva (Vg.busy) e o que leva depois do fogo alimentado; a água de casa com outro;
//   q  o bairro: q1 cada entrada nos banhos conta uma vez em «banho» e nunca em «noite» (nos dias vividos); q2 doze dias
//      saltados na paz: o bairro dos banhos mais cheios é «de banhos», e nenhum bairro sem taverna, teatro nem arena é
//      «boêmio»; q3 a conta do dia atravessa um save; q4 o som: a família do banho é a do bairro («banho»);
//   e  os casos ruins da praça: e1 um save no meio da conversa, carregado duas vezes — o mesmo futuro, e a praça volta a ter
//      gente; e2 quem morre a caminho e quem morre na conversa; e3 a guerra à porta; e4 a chuva que começa; e5 o deus
//      derruba a praça; e6 o escuro;
//   t  o passeio antigo com a regra do tempo (T-919): quem vai aos banhos pelo passeio de quem está sem trabalho
//      (G.City.leisureTask) só sai com tempo para o banho antes de fechar;
//   h  o verificador (qa/praca-inv.js) pega a mentira — e nada sem ela.
//   [ONLY=a,b,f3,…] [DIAS=n] node qa/praca.js [metropole|mega]
'use strict';
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/freguesia-inv.js', 'qa/praca-inv.js'] });
const WORLD = process.argv[2] || 'metropole';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.some(o => k === o || k.startsWith(o) || o.startsWith(k));
const DIAS = +(process.env.DIAS || 3);
const SHIFT = +(process.env.SHIFT || 0); // (another history of the lived days: k draws of the world's chance before the first step)
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | praca ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const Vg = G.Vg, V = G.Village, E = G.Eco, D = G.Depot, A = G.Act, Te = G.Termas, Pr = G.Praca, U = G.Urban, W = G.W;
const EPS = 1e-6;
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const peace = () => { const S = G.S; if (!(S.divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); };
const qaAll = () => QA.check().filter(q => q.sev <= 2);
let base = new Set();
const rebase = () => { base = new Set(qaAll().map(q => q.sys + '|' + q.msg)); };
const novas = () => qaAll().filter(q => !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg.slice(0, 120)}`);
const mine = () => QA.check().filter(q => q.sys === 'praca');
const setOf = b => G.S.settlements.get(b.set);
const mid = b => [b.x + b.w / 2, b.y + b.h / 2];
const plazas = setId => [...G.S.buildings.values()].filter(b => b.type === 'praca' && b.built && (!setId || b.set === setId)).sort((a, c) => a.id - c.id);
const baths = () => [...G.S.buildings.values()].filter(b => b.type === 'banhos' && b.built).sort((a, c) => a.id - c.id);
const adults = setId => [...G.S.villagers.values()].filter(v => v.set === setId && v.age >= 16 && !v.captive).sort((a, c) => a.id - c.id);
const homeOf = v => v.home && G.S.buildings.get(v.home);
const farOf = (v, b) => { const h = homeOf(v); return h ? G.dist(...mid(h), ...mid(b)) : 99; };
const talking = b => [...G.S.villagers.values()].filter(v => v.task && v.task.type === 'praca' && (!b || v.task.id === b.id));
const fair0 = set => { const S = G.S; S.weather.rain = 0; S.weather.storm = 0; S.panic = []; if (set) set.alarmT = 0; };
// (one made free for the plaza by the proof's hand: fed, rested, well, hands empty, awake, out of doors by the plaza)
const ready = (v, b) => { god(() => Vg.endTask(v)); v.hunger = 20; v.energy = 70; v.sick = 0; v.fear = 0; v.carry = null; v.sleeping = false; v.inside = 0; const [cx, cy] = mid(b); v.x = cx + 0.3; v.y = cy + b.h / 2 + 0.6; };
// (the biggest town with a plaza where the afternoon is fit for it — no feast of its own under way, no war at its gates —,
// the weather cleared by the proof's hand)
const townOfPlaza = () => { const L = plazas().map(b => setOf(b)).filter((s, i, a) => s && a.indexOf(s) === i).sort((a, c) => V.pop(c.id) - V.pop(a.id) || a.id - c.id); for (const s of L) { fair0(s); if (plazas(s.id).every(b => Pr.fair(b))) return s; } return L[0]; };
// (someone of the town who goes to the plaza of her streets with everything in order: fit, the lot of today under the wish,
// made free by the proof's hand — the first of the list who does)
const goer = (set, list, not) => { const P = plazas(set.id); let n = 0; for (const v of list) { if (v === not || v.age < 26 || (G.Lar && (G.Lar.grief(v) || G.Lar.bedrest(v))) || v.hp < 60) continue; const q = P.slice().sort((a, c) => farOf(v, a) - farOf(v, c))[0]; if (farOf(v, q) > Pr.NEAR || !(Pr.lot(v) < Pr.wish(v, q) - 0.02)) continue; if (n++ > 20) break; ready(v, q); if (Pr.pick(v) === q) return [v, q]; } return [null, null]; };

// ================================================================ a: the rule, without living
function partA() {
  M.pronto(WORLD); const S = G.S; rebase(); S.time = 0.62; M.viver(1);
  const set = townOfPlaza(); if (!set) { ok('a a regra', false, `${WORLD}: nenhuma cidade com praça`); return; }
  fair0(set); const P = plazas(set.id);
  const cands = adults(set.id).filter(v => v.age >= 26 && v.age < 55 && !v.jail && !v.aboard && !v.ug && !v.held && !(G.Expe && G.Expe.memberOf(v.id)) && homeOf(v) && v.role !== 'foguista' && !(v.task && (v.task.pri || 0) >= 3) && !Vg.holdsBaby(v));
  // someone whose lot of today is under the wish, living by a plaza
  S.time = 0.62; const [p, b] = goer(set, cands, null);
  if (!p) { ok('a a regra', false, `${set.name}: ninguém mora perto de uma praça com a sorte de hoje e vai a ela com tudo em ordem`); return; }
  const got0 = Pr.pick(p);
  // ---------------------------------------------------------------- a1
  // (asked from outside the step: what the plaza's weather and peace are is kept for the second of the world inside it)
  if (on('a1')) {
    const z = {}; const tryIt = (name, put, undo) => { put(); z[name] = Pr.pick(p) ? 1 : 0; undo(); };
    tryIt('o corpo do deus', () => { S.avatar = { id: p.id, kind: 'humano' }; }, () => { S.avatar = null; });
    tryIt('uma carga nas mãos', () => { p.carry = { k: 'wood', n: 1 }; }, () => { p.carry = null; });
    tryIt('preso', () => { p.jail = 9; }, () => { p.jail = 0; });
    tryIt('cativo', () => { p.captive = 1; }, () => { p.captive = 0; });
    tryIt('a bordo', () => { p.aboard = 9; }, () => { p.aboard = 0; });
    { const a0 = p.age; tryIt('criança', () => { p.age = 15; }, () => { p.age = a0; }); }
    tryIt('com fome', () => { p.hunger = Pr.HUNGRY + 5; }, () => { p.hunger = 20; });
    tryIt('exausto', () => { p.energy = Pr.SPENT - 3; }, () => { p.energy = 70; });
    tryIt('doente', () => { p.sick = 30; }, () => { p.sick = 0; });
    tryIt('com medo', () => { p.fear = 80; }, () => { p.fear = 0; });
    tryIt('dormindo', () => { p.sleeping = true; }, () => { p.sleeping = false; });
    { const h0 = p.home; tryIt('sem casa', () => { p.home = 0; }, () => { p.home = h0; }); }
    tryIt('cedo demais', () => { S.time = Pr.OPEN - 0.02; }, () => { S.time = 0.62; });
    tryIt('de noite', () => { S.time = Pr.SHUT + 0.01; }, () => { S.time = 0.62; });
    tryIt('sem tempo antes de escurecer', () => { S.time = Pr.SHUT - 0.01; }, () => { S.time = 0.62; });
    tryIt('a chuva', () => { S.weather.rain = 0.5; }, () => { S.weather.rain = 0; });
    tryIt('a tempestade', () => { S.weather.storm = 5; }, () => { S.weather.storm = 0; });
    { const [cx, cy] = mid(b); const i = W.idx(cx, cy); const t0 = S.temp[i]; tryIt('o frio forte', () => { S.temp[i] = 20; }, () => { S.temp[i] = t0; });
      const w0 = S.winters; tryIt('o inverno do deus', () => { S.winters = [{ x: cx, y: cy, r: 6, t: 30 }]; }, () => { S.winters = w0; });
      tryIt('o pânico', () => { S.panic = [{ x: cx, y: cy, r: 4, t: 3, why: 'panic' }]; }, () => { S.panic = []; }); }
    tryIt('a guerra à porta', () => { set.alarmT = 20; }, () => { set.alarmT = 0; });
    { const f = G.Fac.get(set.fac); const key = G.Fest && G.Fest.of ? G.Fest.of(f.civ)[0] : null; let fe = null;
      if (key) { fe = god(() => G.Fest.start(set, key, {})); z['a festa da cidade'] = Pr.pick(p) ? 1 : 0; z.festa = fe ? 1 : 0; } }
    const names = Object.keys(z).filter(k => k !== 'festa'); const bad = names.filter(k => z[k] !== 0);
    ok('a1 o que impede a praça: cada um, sozinho, zera a vontade de quem a tinha', !!got0 && got0 === b && names.length >= 21 && !bad.length && (z.festa === undefined || z.festa === 1),
      `${p.name} #${p.id} de ${set.name} (${Math.floor(p.age)} anos, a ${farOf(p, b).toFixed(1)} casas da praça, a sorte ${Pr.lot(p).toFixed(2)} e a vontade ${Pr.wish(p, b).toFixed(2)}): com tudo em ordem ${got0 ? 'vai' : 'NÃO VAI'}; ${names.length} impedimentos, ${bad.length ? 'NÃO IMPEDEM: ' + bad.join(', ') : 'todos impedem'}${z.festa === 0 ? '; A FESTA NÃO COMEÇOU' : ''} (${names.join(', ')})`);
  }
  // (a new world for the rest: the feast of a1 goes on)
  M.pronto(WORLD); S.time; const S2 = G.S; S2.time = 0.62; M.viver(1); const set2 = townOfPlaza(); fair0(set2); const P2 = plazas(set2.id);
  const cs = adults(set2.id).filter(v => v.age < 55 && !v.jail && !v.aboard && !v.ug && !v.held && homeOf(v) && v.role !== 'foguista' && !(v.task && (v.task.pri || 0) >= 3) && !Vg.holdsBaby(v));
  // ---------------------------------------------------------------- a1b: the plaza full, the distance, the lot, the stoker
  if (on('a1')) god(() => {
    S2.time = 0.62; G.inSim--; const [q, qb] = goer(set2, cs, null); G.inSim++; const z = { livre: q && Pr.pick(q) ? 1 : 0 };
    // the plaza full: who is on the way counts (asked from outside the step, counted afresh)
    const others = cs.filter(v => v !== q).slice(0, Pr.holds(qb)); const keep = others.map(v => v.task);
    others.forEach(v => { v.task = { type: 'praca', id: qb.id, pri: Pr.PRI, st: 0, x: qb.x + 0.5, y: qb.y + 0.5 }; }); G.inSim--; z['a praça cheia'] = Pr.pick(q) ? 1 : 0; z.cabem = Pr.room(qb); G.inSim++; others.forEach((v, i) => { v.task = keep[i]; });
    { const x0 = q.x; q.x = mid(qb)[0] + Pr.REACH + 3; z['longe demais daqui'] = Pr.pick(q) ? 1 : 0; q.x = x0; }
    { const r0 = q.role, j0 = q.job; const bb = baths().filter(x => x.set === q.set)[0]; const op = bb && Te.dia(bb); if (op) { const c0 = op.data.calor; S2.time = 0.58; q.role = 'foguista'; q.job = bb.id; op.data.calor = 0; z.posto2 = Te.onDuty(q) ? 1 : 0; z['o foguista no posto'] = Pr.pick(q) ? 1 : 0; q.role = r0; q.job = j0; op.data.calor = c0; S2.time = 0.62; } }
    // the lot: one whose lot of today is over the wish does not go, with everything else in order
    let no = null, nb = null; for (const v of cs) { const c = P2.slice().sort((a, d) => farOf(v, a) - farOf(v, d))[0]; if (v !== q && farOf(v, c) <= Pr.NEAR && Pr.lot(v) > Pr.wish(v, c) + 0.02) { no = v; nb = c; break; } }
    if (no) { ready(no, nb); z['a sorte do dia'] = Pr.pick(no) ? 1 : 0; }
    ok('a1b a praça cheia (quem vem a caminho conta), a distância, o foguista no posto e a sorte do dia também impedem', z.livre === 1 && z['a praça cheia'] === 0 && z.cabem <= 0 && z['longe demais daqui'] === 0 && (z.posto2 === undefined || (z.posto2 === 1 && z['o foguista no posto'] === 0)) && (!no || z['a sorte do dia'] === 0),
      `${q.name} #${q.id} de ${set2.name}: livre ${z.livre ? 'vai' : 'NÃO VAI'}; com ${Pr.holds(qb)} na praça ou a caminho ${z['a praça cheia'] ? 'VAI' : 'não vai'} (cabem ${z.cabem}); a ${Pr.REACH + 3} casas ${z['longe demais daqui'] ? 'VAI' : 'não vai'}; foguista com a fornalha fria ${z.posto2 === undefined ? '(a cidade não tem banhos abertos)' : z['o foguista no posto'] ? 'VAI' : 'não vai'}; ${no ? `${no.name} #${no.id}, a sorte ${Pr.lot(no).toFixed(2)} acima da vontade ${Pr.wish(no, nb).toFixed(2)}: ${z['a sorte do dia'] ? 'VAI' : 'não vai'}` : 'ninguém com a sorte acima da vontade'}`);
  });
  // ---------------------------------------------------------------- a2
  if (on('a2')) {
    const b0 = P2[0]; const v = cs.find(x => x.age >= 26 && x.age < 55); const a0 = v.age, t0 = v.traits, r0 = v.role, g0 = v.grp; v.traits = (t0 || []).filter(x => x !== 'Sociável'); v.role = 'agricultor'; v.grp = '';
    const w = far => Pr.wish(v, b0, far); const plain = w(2);
    v.age = 70; const old = w(2); v.age = 20; const young = w(2); v.age = a0;
    v.traits = v.traits.concat(['Sociável']); const soc = w(2); v.traits = v.traits.filter(x => x !== 'Sociável');
    const mk = E.byType(b0.set, 'mercado')[0]; v.role = 'mercador'; const trader = mk ? Pr.wish(v, mk, 2) : -1; v.role = 'agricultor';
    const far = w(Pr.NEAR + Pr.SPAN / 2), veryFar = w(200);
    v.traits = t0; v.role = r0; v.grp = g0;
    ok('a2 quem quer mais: o velho, o moço, o sociável, o mercador junto do mercado; menos quem mora longe, nunca abaixo do piso', old > plain && young > plain && soc > plain && (trader < 0 || trader > plain) && far < plain && far > veryFar - EPS && Math.abs(veryFar - plain * Pr.FLOOR) < 1e-9 && plain === Pr.BASE,
      `a parte dos dias: um adulto qualquer ${plain.toFixed(2)}; velho ${old.toFixed(2)}, moço ${young.toFixed(2)}, sociável ${soc.toFixed(2)}, mercador à porta do mercado ${trader < 0 ? '(sem mercado)' : trader.toFixed(2)}; a ${Pr.NEAR + Pr.SPAN / 2} casas de casa ${far.toFixed(2)}, a 200 casas ${veryFar.toFixed(2)}`);
  }
  // ---------------------------------------------------------------- a3
  if (on('a3')) {
    const all = [...S2.villagers.values()].filter(v => v.age >= 16); const lots = all.map(v => Pr.lot(v));
    const under = lots.filter(x => x < 0.5).length / lots.length; const d0 = S2.day; const t0 = S2.time;
    S2.time = 0.55; const again = all.map(v => Pr.lot(v)); S2.time = t0;
    S2.day = d0 + 1; const next = all.map(v => Pr.lot(v)); S2.day = d0;
    const same = lots.every((x, i) => x === again[i]); const changed = lots.filter((x, i) => Math.abs(x - next[i]) > 0.02).length / lots.length;
    // asked from outside the step: nothing of the world changes, nothing drawn from its chance
    const snap = () => JSON.stringify([S2.rng, S2.clock, S2.nextId, [...S2.villagers.values()].map(v => [v.task ? v.task.type : '', v.carry ? v.carry.n : 0, Math.round(v.x * 100), Math.round(v.y * 100)])]);
    const s0 = snap(); let asked = 0; for (const v of all) { Pr.pick(v); Pr.urge(v, v.task); Pr.wish(v, P2[0]); Pr.playAt(v); Pr.room(P2[0]); Pr.fair(P2[0]); asked++; } const s1 = snap();
    ok('a3 a sorte do dia é da pessoa e do dia (G.hash): espalhada por igual, a mesma o dia inteiro, outra amanhã; e a vontade pedida de fora do passo não muda o mundo nem tira do acaso dele', under > 0.42 && under < 0.58 && same && changed > 0.9 && s0 === s1,
      `${lots.length} adultos: ${(100 * under).toFixed(0)}% com a sorte abaixo de 0,5; a mesma às 0,55 e às ${t0.toFixed(2)}: ${same ? 'sim' : 'NÃO'}; outra no dia seguinte para ${(100 * changed).toFixed(0)}%; ${asked} pessoas perguntadas de fora do passo (pick, urge, wish, playAt, room, fair): o mundo ${s0 === s1 ? 'igual' : 'MUDOU'}`);
  }
  // ---------------------------------------------------------------- a4
  if (on('a4')) god(() => {
    // the plaza nearest home, in a town with two; the market only while it sells; one's place off the fountain, on the plaza
    const two = [...S2.settlements.values()].filter(s => plazas(s.id).length >= 2).sort((a, c) => a.id - c.id)[0]; let near = 0, tried = 0; const how = [];
    if (two) { fair0(two); S2.time = 0.62; const PP = plazas(two.id);
      for (const v of adults(two.id).filter(x => x.age < 55 && homeOf(x) && !x.jail && !x.aboard && x.role !== 'foguista' && !(x.task && (x.task.pri || 0) >= 3) && !Vg.holdsBaby(x))) {
        const byHome = PP.slice().sort((a, c) => farOf(v, a) - farOf(v, c)); if (farOf(v, byHome[1]) - farOf(v, byHome[0]) < 4 || Pr.lot(v) >= Pr.wish(v, byHome[1]) - 0.02) continue;
        const s0 = { x: v.x, y: v.y, t: v.task, h: v.hunger, e: v.energy, c: v.carry, s: v.sick, f: v.fear, sl: v.sleeping, i: v.inside };
        ready(v, byHome[1]); // (standing at the far one: the one of one's own streets all the same)
        const got = Pr.pick(v); tried++; if (got === byHome[0]) near++; else how.push(`${v.name}: ${got ? '#' + got.id : 'nenhuma'}`);
        v.x = s0.x; v.y = s0.y; v.hunger = s0.h; v.energy = s0.e; v.carry = s0.c; v.sick = s0.s; v.fear = s0.f; v.sleeping = s0.sl; v.inside = s0.i;
        if (tried >= 12) break; } }
    // one's place: on the plaza, off its middle; the same all day
    const b0 = P2[0]; const spots = cs.slice(0, 40).map(v => Pr.spot(v, b0)); const [cx, cy] = mid(b0);
    const inP = spots.every(([x, y]) => x >= b0.x + 0.19 && x <= b0.x + b0.w - 0.19 && y >= b0.y + 0.19 && y <= b0.y + b0.h - 0.19); const offF = spots.every(([x, y]) => G.dist(x, y, cx, cy) >= 0.45 || (x === b0.x + 0.2 || y === b0.y + 0.2));
    const same = cs.slice(0, 40).every((v, i) => { const s = Pr.spot(v, b0); return s[0] === spots[i][0] && s[1] === spots[i][1]; });
    ok('a4 onde: a praça mais perto de casa (numa cidade com duas); o lugar de cada um na praça, fora da fonte, o mesmo o dia inteiro', (!two || (tried >= 1 && near === tried)) && inP && offF && same,
      `${two ? `${two.name}, duas praças: ${near} de ${tried} com a vontade nas duas escolhem a de casa${how.length ? ' (' + how.slice(0, 3).join('; ') + ')' : ''}` : 'nenhuma cidade com duas praças neste mundo'}; 40 lugares na praça #${b0.id}: dentro dela ${inP ? 'todos' : 'NÃO'}, fora da fonte ${offF ? 'todos' : 'NÃO'}, os mesmos se perguntados de novo ${same ? 'sim' : 'NÃO'}`);
  });
  // ---------------------------------------------------------------- a5
  if (on('a5')) god(() => {
    fair0(set2); S2.time = 0.59; G.inSim--; const [q, qb] = goer(set2, cs, null); G.inSim++; S2.time = Math.max(Pr.hourOf(q) + 0.002, 0.57); const z = {};
    const T = (type, o) => Object.assign({ type, pri: 1, kind: 'work', st: 0 }, o || {});
    z.livre = Pr.urge(q, null); z.machado = Pr.urge(q, T('chop')); z.enxada = Pr.urge(q, T('farm')); z.obra = Pr.urge(q, T('build', { id: 1 }));
    const gw0 = set2.gw; set2.gw = 777; z['a obra grande'] = Pr.urge(q, T('build', { id: 777 })); set2.gw = gw0;
    z.pedra = Pr.urge(q, T('mine')); z.guarda = Pr.urge(q, T('guard')); z.ronda = Pr.urge(q, T('patrol')); z['um afazer de mais peso'] = Pr.urge(q, T('farm', { pri: 1.05 }));
    z['a refeição'] = Pr.urge(q, { type: 'eat', pri: 1.2, kind: 'eat' }); z['o namoro'] = Pr.urge(q, { type: 'court', pri: 0.6, kind: 'court' });
    q.carry = { k: 'wood', n: 2 }; z['a carga'] = Pr.urge(q, T('chop')); q.carry = null;
    z['a caminho da praça'] = Pr.urge(q, { type: 'praca', id: qb.id, pri: Pr.PRI, st: 0 });
    S2.time = Pr.hourOf(q) - 0.01; z['antes da sua hora'] = Pr.urge(q, T('chop')); S2.time = Pr.EVE + 0.005; z['livre, depois do fim do dia de trabalho'] = Pr.urge(q, null); z.over = Pr.urge(q, T('chop')); z['o guarda, depois do fim do dia'] = Pr.urge(q, T('guard')); z['num passeio, depois do fim do dia'] = Pr.urge(q, { type: 'wander', pri: 0, kind: 'wander' }); S2.time = Pr.LATE + 0.005; z['no machado, passada a hora'] = Pr.urge(q, T('chop'));
    const go = ['livre', 'machado', 'enxada', 'obra', 'a caminho da praça', 'over']; const stay = Object.keys(z).filter(k => !go.includes(k));
    ok('a5 o que se larga pela praça antes do fim do dia de trabalho: o machado, a enxada, a obra comum; nunca a pedra, o posto, a obra grande da cidade, a carga, um afazer de mais peso — e depois dele a praça é a caminho de casa', go.every(k => z[k] > 0) && stay.every(k => z[k] === 0) && Pr.CUT > 1 && Pr.PRI === 0.45 && z.over === Pr.OVER && z.machado === Pr.EARLY,
      `${q.name} #${q.id}, na sua hora (${Pr.hourOf(q).toFixed(3)}): ${Object.keys(z).map(k => `${k === 'over' ? 'no machado, logo depois do fim do dia' : k} ${z[k] > 0 ? 'larga/vai' : 'fica'}`).join(' · ')}`);
  });
  // ---------------------------------------------------------------- a4m: the market's door, only while it sells (a world of its own, lived to an hour with the stalls open)
  if (on('a4')) {
    M.pronto(WORLD); const S3 = G.S; let g = 0; let mk = null;
    const selling = () => [...S3.buildings.values()].filter(x => x.type === 'mercado' && x.built && plazas(x.set).length && V.pop(x.set) >= 30 && G.Biz && G.Biz.hours() && (!G.Biz.hasStalls(x) || G.Biz.selling(x.set))).sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id)[0] || null;
    while (!(mk = selling()) && g++ < 400) { peace(); M.viver(1); }
    if (!mk) { ok('a4m o mercado só enquanto vende', false, `nenhum mercado a vender em ${g} s vividos`); }
    else god(() => {
      const mset = setOf(mk); fair0(mset); const tNow = S3.time; S3.time = Math.max(tNow, Pr.OPEN + 0.01);
      const hm = [...S3.buildings.values()].filter(x => x.set === mset.id && x.built && G.BDEF[x.type].housing).sort((a, c) => G.dist(...mid(a), ...mid(mk)) - G.dist(...mid(c), ...mid(mk)))[0];
      // (a trader of the market's door, by the proof's hand: someone fit, the lot of today under the wish at the market)
      const tr = adults(mset.id).filter(x => x.age >= 26 && x.age < 55 && homeOf(x) && !x.jail && !x.aboard && !x.ug && !x.held && x.role !== 'foguista' && !Vg.holdsBaby(x) && !(x.task && (x.task.pri || 0) >= 3) && x.hp > 60 && Pr.lot(x) < Pr.BASE + Pr.TRADER - 0.03)[0];
      const d = Vg.door(mk); Vg.endTask(tr); tr.role = 'mercador'; tr.home = hm.id; tr.hunger = 20; tr.energy = 70; tr.sick = 0; tr.fear = 0; tr.carry = null; tr.sleeping = false; tr.inside = 0; tr.x = d[0]; tr.y = d[1];
      G.inSim--; const lot = Pr.lot(tr), wm = Pr.wish(tr, mk); const sells = S3.time < 0.62; const atSell = sells ? Pr.pick(tr) : null; const t1 = S3.time; S3.time = 0.64; const at64 = Pr.pick(tr); G.inSim++;
      ok('a4m o mercado é lugar de conversa só enquanto vende: o mercador que mora à porta dele para lá nas horas das bancas, e depois delas na praça — ou em casa', lot < wm && (!sells || atSell === mk) && !(at64 && at64.type === 'mercado'),
        `${mset.name}, o mercado #${mk.id} (${G.Biz.hasStalls(mk) ? 'com bancas' : 'sem bancas'}) a vender às ${tNow.toFixed(2)}: ${tr.name} #${tr.id} (a sorte ${lot.toFixed(2)}, a vontade ${wm.toFixed(2)}) às ${t1.toFixed(2)} ${sells ? (atSell ? 'vai ' + (atSell.type === 'mercado' ? 'à porta do mercado' : 'À PRAÇA') : 'NÃO VAI') : '(as bancas já fecharam)'}; às 0,64 ${at64 ? 'vai ' + (at64.type === 'mercado' ? 'AO MERCADO' : 'à praça') : 'vai para casa'}`);
    });
  }
}

// ================================================================ the watch of the lived days
const WISH = { teatro: 1, tavern: 1, termas: 1, ler: 1, praca: 1, citylife: 1 }; const CALLS = { fest: 1, celebrate: 1, adeus: 1, justice: 1 };
function watch() {
  const S = G.S; const w = { go: [], towns: new Map(), bad: [], led: {}, notes: { banho: 0, outra: 0 }, fire: new Map(), post: [], kids: new Map(), qaBad: [] };
  const go0 = Pr.go; Pr.go = function (v, H) {
    const pre = { id: v.id, name: v.name, set: v.set, t: S.time, day: S.day, sleeping: !!v.sleeping, carry: !!(v.carry && v.carry.n > EPS), hands: Vg.handsBusy(v), body: A.isBody(v), cur: v.task ? v.task.type : '', pri: v.task ? (v.task.pri || 0) : -1, kind: v.task ? v.task.kind : '', lot: Pr.lot(v), rain: S.weather.rain, age: v.age, duty: Te.onDuty(v), hunger: v.hunger, energy: v.energy };
    const b = Pr.pick(v); if (b) { pre.b = b.id; pre.wish = Pr.wish(v, b); pre.far = farOf(v, b); pre.type = b.type; }
    const t = go0.apply(this, arguments); if (t) w.go.push(pre); return t; };
  const tap = e => { const c = e[8]; if (c === 'ceia' || c === 'taverna' || c === 'teatro' || c === 'termas') w.led[c] = (w.led[c] || 0) + 1; }; D.onMove.push(tap);
  const nb0 = U.noteB; U.noteB = function (b, k, n) { if (b && b.type === 'banhos') { if (k === 'banho') w.notes.banho += n === undefined ? 1 : n; else w.notes.outra++; } return nb0.apply(this, arguments); };
  const T = id => { let r = w.towns.get(id); if (!r) w.towns.set(id, r = { who: new Map(), peak: 0, sum: 0, n: 0, kidSum: 0 }); return r; };
  const prev = new Map(); // (the stokers: last second's duty and task)
  w.look = function () {
    const now = new Map(); const eveWin = S.time >= 0.6 && S.time < 0.675;
    for (const v of S.villagers.values()) {
      const t = v.task;
      if (t && t.type === 'praca') {
        const r = T(v.set); if (t.st === 2) { r.who.set(S.day + ':' + v.id, 1); now.set(v.set, (now.get(v.set) || 0) + 1); }
        if (S.time >= Pr.SHUT + 0.012) w.bad.push(`${v.name} #${v.id} na conversa às ${S.time.toFixed(3)} do dia ${S.day}, depois de escurecer`);
        if (S.weather.rain > 0.3) { t._wet = (t._wet || 0) + 1; if (t._wet > 2) w.bad.push(`${v.name} #${v.id} na conversa debaixo de chuva há ${t._wet} s`); }
        if (v.sleeping) w.bad.push(`${v.name} #${v.id} na conversa dormindo`);
        if (v.carry && v.carry.n > EPS) w.bad.push(`${v.name} #${v.id} na conversa com ${v.carry.k} nas mãos`);
      }
      if (v.age >= 7 && v.age < 16 && t && t.type === 'play' && S.time >= Pr.OPEN && S.time < Pr.SHUT) for (const b of plazas(v.set)) if (v.x >= b.x - 1 && v.x <= b.x + b.w + 1 && v.y >= b.y - 1 && v.y <= b.y + b.h + 1) { w.kids.set(S.day + ':' + v.id, 1); T(v.set).kidNow = (T(v.set).kidNow || 0) + 1; break; }
      if (v.role === 'foguista' && v.job) {
        const duty = Te.onDuty(v); const p = prev.get(v.id); const tt = t ? t.type : '';
        if (duty && t && WISH[tt] && !(tt === 'termas' && t.st >= 1)) { t._off = (t._off || 0) + 1; if (t._off > 2) w.post.push(`${v.name} #${v.id} de posto e em «${tt}» há ${t._off} s, às ${S.time.toFixed(2)} do dia ${S.day}`); }
        if (duty && tt === 'water' && !(v.carry && v.carry.n > EPS)) { t._off = (t._off || 0) + 1; if (t._off > 2) w.post.push(`${v.name} #${v.id} de posto e a caminho da água de casa há ${t._off} s, às ${S.time.toFixed(2)} do dia ${S.day}`); }
        // (taken from the post by a call: the post is a leg — at the furnace's errand, at a plain task, and between two errands
        // too (L-914) —; one already at something that weighs more when the post began holds none. On duty a second ago and
        // still: the fire did not come to last in between)
        if (p && p.duty && duty && p.pri <= 1.05 + EPS && p.tt !== tt && CALLS[tt]) w.post.push(`${v.name} #${v.id} de posto, levado do posto por «${tt}» às ${S.time.toFixed(2)} do dia ${S.day} (estava em «${p.tt || 'nada'}»)`);
        prev.set(v.id, { duty, tt, pri: t ? (t.pri || 0) : 0 });
      }
    }
    for (const [id, r] of w.towns) { const n = now.get(id) || 0; if (n > r.peak) r.peak = n; if (eveWin) { r.sum += n; r.n++; r.kidSum += r.kidNow || 0; } r.kidNow = 0; }
    for (const b of baths()) {
      const h = Te.horas(b); if (S.time < h.abre || S.time > h.fecha) continue; const op = Te.dia(b); const k = S.day + ':' + b.id; let r = w.fire.get(k);
      if (!r) w.fire.set(k, r = { day: S.day, b, len: 0, first: -1, keeper: 0, n: 0, hot: 0, wood: 0, ent: 0 });
      r.n++; const kp = Te.keeperOf(b); if (kp) r.keeper++; if (op) { r.len = Math.max(r.len, op.data.lenha || 0); r.ent = Math.max(r.ent, op.data.entradas || 0); if (op.data.calor > 0) { r.hot++; if (r.first < 0) r.first = S.time; } }
      const f = G.Fac.get(V.facOfSet(b.set)); r.wood = Math.max(r.wood, (f ? D.free('f:' + f.id, 'wood') : 0) + D.free('b:' + b.id, 'wood'));
    }
  };
  w.qa = () => { for (const q of novas().concat(mine().map(x => `[S${x.sev}] praca: ${x.msg}`))) if (!w.qaBad.includes(q)) w.qaBad.push(q); };
  w.close = () => { Pr.go = go0; U.noteB = nb0; D.onMove.splice(D.onMove.indexOf(tap), 1); };
  return w;
}

// ================================================================ b, f1, f2, q1: the lived days
function partB() {
  M.pronto(WORLD); const S = G.S; for (let i = 0; i < SHIFT; i++) G.R(); rebase(); const w = watch(); const d0 = S.day; let g = 0; const t00 = S.time;
  while (S.day < d0 + DIAS && g++ < 40000) { peace(); M.viver(1); w.look(); if (g % 25 === 24) w.qa(); }
  w.close(); w.qa(); const days = S.day - d0;
  const name = id => (S.settlements.get(id) || {}).name || '?';
  // ---- b1
  const big = [...S.settlements.values()].filter(s => V.pop(s.id) >= 50 && plazas(s.id).length).sort((a, c) => a.id - c.id);
  const per = big.map(s => { const r = w.towns.get(s.id) || { who: new Map(), peak: 0, sum: 0, n: 0, kidSum: 0 }; return { s, visits: r.who.size, peak: r.peak, mean: r.n ? r.sum / r.n : 0, kids: r.n ? r.kidSum / r.n : 0 }; });
  let visits = 0; for (const r of w.towns.values()) visits += r.who.size;
  // (the floor of the world's stops a day is half the least seen in four histories of these three days — the branch before
  // the leader's tip was joined and the joined tree, SHIFT 0 and 1: 24,3 · 16,0 · 13,0 · 25,3 —; the first floor, 15, was
  // taken from one history and fell inside the dice: T-923c)
  if (on('b1')) ok(`b1 em ${days} dias vividos, sem ninguém mandado, a praça tem gente na conversa — 8 paradas por dia no mundo, uma por dia ou mais em toda cidade de 110 pessoas ou mais, dois ou mais juntos nalguma — e crianças a brincar à tarde (as cidades de 50 ou mais, ditas uma a uma)`, per.length >= 2 && per.filter(r => V.pop(r.s.id) >= 110).length >= 1 && per.filter(r => V.pop(r.s.id) >= 110).every(r => r.visits >= days) && visits >= days * 8 && Math.max(...per.map(r => r.peak)) >= 2 && w.kids.size >= days * 20,
    `${visits} paradas na praça (${(visits / days).toFixed(1)} por dia no mundo), ${w.kids.size} tardes de criança a brincar na praça; ${per.map(r => `${r.s.name} (${V.pop(r.s.id)}): ${(r.visits / days).toFixed(1)} por dia, ${r.peak} de uma vez, das 0,60 às 0,675 em média ${r.mean.toFixed(1)} na conversa e ${r.kids.toFixed(1)} crianças`).join(' · ')}`);
  // ---- b2
  const g2 = w.go; const asleep = g2.filter(p => p.sleeping), load = g2.filter(p => p.carry), hands = g2.filter(p => p.hands), body = g2.filter(p => p.body), luck = g2.filter(p => !(p.lot < p.wish)), kid = g2.filter(p => p.age < 16), duty = g2.filter(p => p.duty), heavy = g2.filter(p => p.pri > 1 + EPS), wet = g2.filter(p => p.rain > 0.3), hungry = g2.filter(p => p.hunger > Pr.HUNGRY), late = g2.filter(p => p.t >= Pr.SHUT || p.t < Pr.OPEN);
  const cut = {}; for (const p of g2) if (p.pri >= Pr.PRI) cut[p.cur] = (cut[p.cur] || 0) + 1;
  if (on('b2')) ok('b2 ninguém é chamado à praça dormindo, com carga, com as mãos numa operação, de posto, com fome, na chuva, fora de hora, criança, sendo o corpo do deus, com a sorte fora da vontade ou no meio de um afazer de mais peso', g2.length >= days * 12 && !asleep.length && !load.length && !hands.length && !body.length && !luck.length && !kid.length && !duty.length && !heavy.length && !wet.length && !hungry.length && !late.length,
    `${g2.length} idas à praça: dormindo ${asleep.length}, com carga ${load.length}, as mãos numa operação ${hands.length}, o foguista de posto ${duty.length}, com fome ${hungry.length}, na chuva ${wet.length}, fora de hora ${late.length}, criança ${kid.length}, o corpo do deus ${body.length}, a sorte fora da vontade ${luck.length}, um afazer de mais peso ${heavy.length}; o que largaram: ${Object.entries(cut).map(([k, n]) => k + ' ' + n).join(', ') || 'nada'}; ${g2.filter(p => p.type === 'mercado').length} delas à porta do mercado; das ${Math.min(...g2.map(p => p.t)).toFixed(2)} às ${Math.max(...g2.map(p => p.t)).toFixed(2)}`);
  // ---- b3
  if (on('b3')) ok('b3 ninguém na conversa da praça depois de escurecer, debaixo de chuva, dormindo ou com carga', !w.bad.length, w.bad.length ? w.bad.slice(0, 3).join(' | ') : `nenhum, em ${g} s vividos`);
  // ---- b4
  if (on('b4')) ok('b4 o que já vivia continua a viver nesses dias: a taverna, o teatro, os banhos, a ceia em casa', (w.led.taverna || 0) >= days && (w.led.teatro || 0) >= days && (w.led.termas || 0) >= days && (w.led.ceia || 0) >= days,
    `em ${days} dias: ${w.led.taverna || 0} copos na taverna, ${w.led.teatro || 0} entradas do teatro, ${w.led.termas || 0} entradas dos banhos, ${w.led.ceia || 0} ceias em casa (a comparação com a base está no bloco-F2.md)`);
  // ---- b5
  if (on('b5')) ok('b5 o verificador (com as regras da praça) e nenhum erro nos dias vividos', !w.qaBad.length && M.limpo(), w.qaBad.length ? w.qaBad.slice(0, 3).join(' | ') : `limpo${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
  // ---- f1: the furnace of each day of baths (a whole day: the first, begun at the world's hour, counts if it began before the opening)
  const fd = [...w.fire.values()].filter(r => r.day < d0 + days && (r.day > d0 || t00 < Te.horas(r.b).abre)).sort((a, c) => a.b.id - c.b.id || a.day - c.day);
  const could = fd.filter(r => r.keeper > r.n * 0.5 && r.wood > 10 + 2); const cold = could.filter(r => !(r.len > 0)); const lateF = could.filter(r => r.len > 0 && r.first > Te.horas(r.b).abre + 0.15);
  if (on('f1')) ok('f1 com foguista e lenha no povo, a fornalha acesa em todo dia de banhos — e cedo (tarde, mais de 0,15 depois de abrir, num dia em quatro no máximo: o foguista já num chamado da cidade quando as portas abrem)', could.length >= 4 && !cold.length && lateF.length <= could.length * 0.25,
    `${fd.length} dias de banhos (${could.length} com foguista e lenha além da que o armazém guarda): ${could.length - cold.length} com a fornalha acesa${cold.length ? '; FRIA em ' + cold.map(r => `${name(r.b.set)} dia ${r.day}`).join(', ') : ''}; a água quente desde: ${could.map(r => `${name(r.b.set)} d${r.day} ${r.first < 0 ? '—' : r.first.toFixed(2)}`).join(', ')}; ${lateF.length} tarde (mais de 0,15 depois de abrir); sem foguista ou sem lenha: ${fd.filter(r => !could.includes(r)).map(r => `${name(r.b.set)} d${r.day}`).join(', ') || 'nenhum'}`);
  // ---- f2
  if (on('f2')) ok('f2 o foguista no posto não é levado por uma vontade (o banho, o rolo, o teatro, a taverna, a praça, o passeio) nem pela água de casa, nem da fornalha por um chamado de fora (a festa, a comemoração, o adeus, o julgamento)', !w.post.length, w.post.length ? w.post.slice(0, 3).join(' | ') : `nenhuma vez, em ${fd.length} dias de banhos`);
  // ---- q1
  let ent = 0; for (const r of w.fire.values()) ent += r.ent;
  if (on('q1')) ok('q1 cada entrada nos banhos conta uma vez na chave «banho» da vida do bairro, e nunca noutra', ent >= 4 && Math.abs(w.notes.banho - ent) <= 2 && !w.notes.outra, `${w.notes.banho} notas «banho» para ${ent} entradas; noutra chave: ${w.notes.outra}`);
}

// ================================================================ f3: the stoker, by the proof's hand
function partF3() {
  M.pronto(WORLD); const S = G.S; rebase(); fair0(null);
  const b = baths().filter(x => Te.keeperOf(x)).sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id)[0];
  if (!b) { ok('f3 o foguista pela mão da prova', false, 'nenhuns banhos com foguista'); return; }
  const set = setOf(b); const f = G.Fac.get(set.fac); const k = Te.keeperOf(b); const h = Te.horas(b); const z = {};
  const wood = () => god(() => { if (D.free('f:' + f.id, 'wood') < 40) D.make('f:' + f.id, 'wood', 60, { code: 'teste', part: true }); });
  // a new day, before the doors: the stoker fed and at a tree far from the furnace
  god(() => { for (const op of A.all()) if (op.def === 'termas' && op.at === b.id && A.live(op)) Te.close(op, 'teste'); });
  // (at a tree a few houses from the baths' door: where a walkable tile is, on the door's side)
  const dr = Vg.door(b); const near = W.randomNear ? god(() => { for (let r = 7; r >= 3; r--) for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1]]) { const x = dr[0] + dx * r, y = dr[1] + dy * r; if (W.walkableXY(x, y) && !G.S.occ[W.idx(x, y)] && W.canWalk(x, y, dr[0], dr[1])) return [x, y]; } return dr; }) : dr;
  const far = G.dist(near[0], near[1], ...mid(b)); const ld = Te.EARLY + Math.min(Te.LEAD, far * Te.WALK / G.DAY_LEN);
  S.day += 1; S.time = h.abre - ld - 0.012; wood(); fair0(set);
  god(() => { Vg.endTask(k); k.hunger = 10; k.energy = 90; k.sick = 0; k.carry = null; k.sleeping = false; k.inside = 0; k.x = near[0]; k.y = near[1]; Vg.setTask(k, { type: 'chop', id: 0, pri: 1, st: 0, kind: 'work' }); });
  z.antes = Te.onDuty(k) ? 1 : 0; M.viver(1); z.t0 = k.task ? k.task.type : '';
  S.time = h.abre - ld + 0.006; god(() => { k.x = near[0]; k.y = near[1]; }); M.viver(2); z.duty = Te.onDuty(k) ? 1 : 0; z.t1 = k.task ? k.task.type : ''; z.busy = Vg.busy(k, { type: 'celebrate', pri: 1.1 }) ? 1 : 0; z.hands = Vg.handsBusy(k) ? 1 : 0;
  // (between two errands of the furnace — the errand ended by the proof's hand, nothing in his hands —: the post still holds,
  // L-914; the day of the baths calls him back at its next look)
  god(() => { Vg.endTask(k); }); z.gap = !k.task && !(k.carry && k.carry.n > EPS) && Te.onDuty(k) ? (Vg.busy(k, { type: 'justice', pri: 1.95 }) && Vg.handsBusy(k) ? 1 : 0) : -1;
  M.viver(1.2); z.back = k.task ? k.task.type : '';
  // a call from outside does not take him; the house's water goes with another
  const gave = god(() => Vg.give(k, { type: 'celebrate', pri: 1.1, kind: 'celebrate' })); z.gave = gave && k.task && k.task.type === 'celebrate' ? 1 : 0;
  // the hunger that does not take him from the post, and the one that does (asked of the choice: the world's own decide)
  let lit = -1; const types = {};
  for (let s = 0; s < 80 && lit < 0; s++) { k.hunger = Math.max(70, Math.min(k.hunger, 80)); M.viver(1); const t = k.task ? k.task.type : 'nada'; types[t] = (types[t] || 0) + 1; const op = Te.dia(b); if (op && op.data.calor > 0) lit = S.time; }
  z.ate = Object.keys(types).filter(t => t === 'eat' || t === 'forage' || t === 'lar').reduce((n, t) => n + types[t], 0); const op = Te.dia(b); z.len = op ? op.data.lenha : -1; god(() => { k.hunger = 20; });
  // the fire fed to the closing: he is free — a call takes him now
  for (let s = 0; s < 40 && Te.onDuty(k); s++) M.viver(1);
  z.free = Te.onDuty(k) ? 0 : 1; z.busy2 = Vg.busy(k, { type: 'celebrate', pri: 1.1 }) && !(k.task && k.task.pri >= 1.1) ? 1 : 0;
  ok('f3a o dia dos banhos chama o foguista do machado à fornalha antes de as portas abrirem; de posto, um chamado de fora não o leva (Vg.busy) nem a fome abaixo de 85; a fornalha acende logo; entre dois afazeres da fornalha o posto ainda segura (L-914); com o fogo alimentado até fechar, ele é livre', z.antes === 0 && z.t0 === 'chop' && z.duty === 1 && (z.t1 === 'fornalha' || z.t1 === 'lenhaTermas' || z.t1 === 'carga') && z.busy === 1 && z.hands === 1 && z.gap === 1 && (z.back === 'fornalha' || z.back === 'lenhaTermas' || z.back === 'carga') && z.gave === 0 && lit >= 0 && lit <= h.abre + 0.04 && z.ate === 0 && z.len >= 1 && z.free === 1 && z.busy2 === 0 && M.limpo(),
    `${k.name} #${k.id}, foguista de ${set.name}, a ${far.toFixed(1)} casas dos banhos: às ${(h.abre - ld - 0.012).toFixed(3)} de posto ${z.antes ? 'SIM' : 'não'}, em «${z.t0}»; às ${(h.abre - ld + 0.006).toFixed(3)} de posto ${z.duty ? 'sim' : 'NÃO'}, em «${z.t1}»; a comemoração ${z.gave ? 'LEVOU-O' : 'não o leva'} (Vg.busy ${z.busy ? 'sim' : 'NÃO'}); entre dois afazeres da fornalha (o afazer acabado pela mão da prova) o cadafalso ${z.gap === 1 ? 'não o leva' : z.gap === 0 ? 'LEVA-O' : 'NÃO FOI PERGUNTADO (de mãos cheias ou fora do posto)'}, e um segundo depois está em «${z.back || 'nada'}»; com a fome entre 70 e 80 ${z.ate ? 'FOI COMER' : 'não sai para comer'}; a água quente às ${lit < 0 ? '— (NUNCA)' : lit.toFixed(3)} (as portas às ${h.abre}), ${z.len} de lenha; o que fez: ${Object.entries(types).map(([t, n]) => t + ' ' + n + ' s').join(', ')}; com o fogo até fechar: de posto ${z.free ? 'não' : 'AINDA'}, um chamado ${z.busy2 ? 'AINDA NÃO o leva' : 'já o leva'}`);
  // ---- f3b: the meal before the doors; starving at the post (in the first town whose morning has no gathering: the vote of
  // a capital takes its people from the way to a meal, and the stoker with them — not on duty yet, as anyone)
  let y = null, k2 = null, h2 = null, secs = 0, did = {}, did2 = {}; const tried = [];
  for (let n = 0; n < 4 && !y; n++) {
    M.pronto(WORLD); const S2 = G.S; const L = baths().filter(x => Te.keeperOf(x)).sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id); const b2 = L[n]; if (!b2) break;
    k2 = Te.keeperOf(b2); h2 = Te.horas(b2); const r = {}; fair0(setOf(b2)); did = {}; did2 = {}; secs = 0;
    god(() => { for (const op2 of A.all()) if (op2.def === 'termas' && op2.at === b2.id && A.live(op2)) Te.close(op2, 'teste'); });
    S2.day += 1; S2.time = h2.abre - Te.MEAL + 0.01; god(() => { Vg.endTask(k2); k2.hunger = 42; k2.energy = 90; k2.sick = 0; k2.carry = null; k2.sleeping = false; });
    r.meal = Te.mealFirst(k2) ? 1 : 0; k2.hunger = 20; r.fed = Te.mealFirst(k2) ? 1 : 0; k2.hunger = 42;
    let ate = 0, called = 0; const h0 = k2.hunger; for (let s = 0; s < 70 && !ate && S2.time < h2.abre - 0.02; s++) { M.viver(1); secs++; const t = k2.task; const key = t ? t.type + '/' + (t.kind || '') : 'nada'; did[key] = (did[key] || 0) + 1; if (t && (t.pri || 0) >= 1.7) called++; if (k2.hunger < h0 - 20) ate = 1; }
    r.ate = ate; if (!ate && called) { tried.push(`${setOf(b2).name}: um chamado da cidade (${Object.keys(did).join(', ')})`); continue; }
    // (starving at the post: he goes to his meal, the day of the baths does not call him back from it, and, fed, he is at the furnace again)
    S2.time = h2.abre + 0.01; M.viver(2); const op2 = Te.dia(b2); if (op2) op2.data.calor = 0; k2.hunger = 92; r.duty = Te.onDuty(k2) ? 1 : 0;
    let pong = 0, fedAt = -1, backAt = -1, went = 0;
    for (let s = 0; s < 60 && backAt < 0; s++) { if (op2 && fedAt < 0) op2.data.calor = 0; M.viver(1); const t = k2.task; const key = t ? t.type + '/' + (t.kind || '') : 'nada'; did2[key] = (did2[key] || 0) + 1;
      if (fedAt < 0) { if (t && t.kind === 'eat') went++; else if (went && t && t.type === 'fornalha' && k2.hunger > 85) pong++; if (k2.hunger < 60) fedAt = s; }
      else if (!Te.onDuty(k2) || (t && (t.type === 'fornalha' || t.type === 'lenhaTermas' || t.type === 'carga'))) backAt = s; }
    r.pong = pong; r.fedAt = fedAt; r.backAt = backAt; y = r;
  }
  if (!y) ok('f3b a refeição do foguista antes de as portas abrirem', false, `em nenhuma cidade a manhã ficou sem um chamado: ${tried.join(' · ')}`);
  else ok('f3b a refeição do foguista é antes de as portas abrirem (com mais fome que o piso; saciado, não); e a fome de morrer tira-o do posto — o dia dos banhos não o chama de volta da refeição, e, comido, ele volta', y.meal === 1 && y.fed === 0 && y.ate === 1 && y.duty === 1 && y.pong === 0 && y.fedAt >= 0 && y.backAt >= 0 && M.limpo(),
    `${k2.name} #${k2.id}: às ${(h2.abre - Te.MEAL + 0.01).toFixed(2)} com a fome a 42 a refeição primeiro ${y.meal ? 'sim' : 'NÃO'} (a 20: ${y.fed ? 'SIM' : 'não'}), e ${y.ate ? 'comeu' : 'NÃO COMEU'} em ${secs} s (${Object.entries(did).map(([t, n]) => t + ' ' + n).join(', ')}); de posto (${y.duty ? 'sim' : 'NÃO'}) com a fome a 92: ${y.fedAt < 0 ? 'NÃO COMEU' : 'comeu aos ' + y.fedAt + ' s'}, ${y.pong} vez(es) chamado de volta da refeição, ${y.backAt < 0 ? 'NÃO VOLTOU ao posto' : 'de volta ao posto (ou o fogo já alimentado) ' + y.backAt + ' s depois'} (${Object.entries(did2).map(([t, n]) => t + ' ' + n).join(', ')})${tried.length ? '; antes: ' + tried.join(' · ') : ''}`);
  // ---- f3c: the house's water goes with another of the house
  M.pronto(WORLD); const S3 = G.S; let done = null;
  for (const bb of baths()) { const kk = Te.keeperOf(bb); const hm = kk && homeOf(kk); if (!hm) continue; const mates = [...S3.villagers.values()].filter(v => v.home === hm.id && v !== kk && v.age >= 10 && v.age < 70); if (!mates.length) continue; done = { bb, kk, hm, mates }; break; }
  if (!done) { ok('f3c a água da casa do foguista', true, 'nenhum foguista mora com mais alguém neste mundo: nada a provar aqui (o caso sozinho: a talha espera, f2)'); return; }
  { const { bb, kk, hm, mates } = done; const hh = Te.horas(bb); fair0(setOf(bb));
    god(() => { for (const o of A.all()) if (o.def === 'termas' && o.at === bb.id && A.live(o)) Te.close(o, 'teste'); });
    S3.day += 1; S3.time = hh.abre + 0.01; M.viver(1); let who = null, stokerWent = 0, duty = 0, alone = 0;
    // (the fire burning, not yet enough to last to the closing: the stoker waits by it — on duty, with an errand that weighs
    // as any. First with everyone else of the house indoors: the jar waits; then with them out: one of them goes)
    const dry = () => { const o = Te.dia(bb); if (o) o.data.calor = 30; hm.water = 0; hm.waterTry = 0; };
    for (let s = 0; s < 25 && !stokerWent; s++) { god(() => { dry(); for (const v of mates) { if (v.task && v.task.type === 'water') Vg.endTask(v); v.inside = hm.id; } }); M.viver(1); if (Te.onDuty(kk)) { duty++; alone++; } if (kk.task && kk.task.type === 'water') stokerWent++; }
    for (let s = 0; s < 60 && !who && !stokerWent; s++) {
      god(() => { dry(); for (const v of mates) { if (v.task && v.task.type !== 'water' && (v.task.pri || 0) > 1) Vg.endTask(v); v.sleeping = false; v.inside = 0; v.carry = null; v.hp = 100; } });
      M.viver(1); if (Te.onDuty(kk)) duty++; if (kk.task && kk.task.type === 'water') { stokerWent++; break; } who = mates.find(v => v.task && v.task.type === 'water') || null; }
    ok('f3c com a talha de casa vazia e o foguista de posto (o fogo aceso, ainda sem dar até fechar): sozinho, a talha espera; com outro da casa na rua, a água vai com ele', !!who && !stokerWent && alone >= 15 && M.limpo(),
      `a casa #${hm.id} de ${kk.name} (foguista de ${setOf(bb).name}), ${mates.length} outro(s) em casa: 25 s com os outros dentro de casa, o foguista de posto em ${alone} deles e ${stokerWent ? 'FOI À ÁGUA' : 'não foi à água'}; depois ${who ? who.name + ' vai à água' : stokerWent ? 'O FOGUISTA FOI' : 'NINGUÉM FOI em 60 s'}`); }
}

// ================================================================ q2..q4: the quarter
function partQ() {
  if (on('q2')) {
    M.pronto(WORLD); const S = G.S; const d0 = S.day; const ent = new Map(); const src = { noite: {}, banho: {} };
    const nb0 = U.noteB; U.noteB = function (b, k) { if (b && src[k]) src[k][b.type] = (src[k][b.type] || 0) + 1; return nb0.apply(this, arguments); };
    G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
    try { while (S.day - d0 < 12) { peace(); G.Main.skipStep(1); for (const op of A.all()) if (op.def === 'termas' && op.data) ent.set(op.id, [op.at, Math.max((ent.get(op.id) || [0, 0])[1], op.data.entradas || 0)]); } } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; U.noteB = nb0; }
    const rows = baths().map(b => { const q = U.at(...mid(b)); let n = 0, d = 0; for (const [, [at, e]] of ent) if (at === b.id) { n += e; d++; }
      const inQ = t => [...S.buildings.values()].filter(o => o.built && o.set === b.set && o.type === t && U.at(...mid(o)) === q).length; const arena = [...S.buildings.values()].filter(o => o.built && o.set === b.set && o.type === 'maravilha' && U.at(...mid(o)) === q).length;
      return { b, q, perDay: d ? n / d : 0, night: inQ('taverna') + inQ('teatro') + arena, tags: q ? (q.tags || []).slice() : [], banho: q ? (q.vida || {}).banho || 0 : 0, noite: q ? (q.vida || {}).noite || 0 : 0, dias: q ? q.dias || 0 : 0 }; }).filter(r => r.q);
    // (a quarter has no profile before it has lived its first days, and a profile waits four days in a row: U.YOUNG, U.PATIENCE)
    const old = rows.filter(r => r.dias >= U.YOUNG + U.PATIENCE + 2);
    // (what makes the night of a quarter: the tavern's rounds, the shows — never the baths; and «banho» only the baths)
    const fromBaths = src.noite.banhos || 0; const others = Object.keys(src.banho).filter(t => t !== 'banhos');
    // (with the mark passed, the profile is there or on its way: the patience's own count, q.tp)
    const missed = old.filter(r => r.banho >= U.mark(r.q, 'termal', false) * 1.5 && !r.tags.includes('termal') && !(r.q.tp && r.q.tp.termal)); const made = rows.filter(r => r.tags.includes('termal'));
    ok('q2 doze dias saltados na paz do deus: o bairro com os banhos cheios é «de banhos» (ou está a caminho, pela paciência dos perfis); nenhuma nota de «noite» vem dos banhos — o «boêmio» é da taverna e do espetáculo —, e «banho» só dos banhos', rows.length >= 2 && old.length >= 1 && fromBaths === 0 && !others.length && (src.banho.banhos || 0) >= 20 && !missed.length && made.length >= 1 && M.limpo(),
      `as notas de «noite» em 12 dias: ${Object.entries(src.noite).map(([t, n]) => t + ' ' + n).join(', ') || 'nenhuma'}; de «banho»: ${Object.entries(src.banho).map(([t, n]) => t + ' ' + n).join(', ') || 'nenhuma'}; ` + rows.map(r => `${setOf(r.b).name}: ${r.perDay.toFixed(1)} banhos por dia, ${r.q.whole ? 'a cidade' : r.q.name} (${r.dias} dias) [${U.tagNames(r.q).join(', ')}${r.q.tp && r.q.tp.termal ? `; «de banhos» a caminho, ${r.q.tp.termal} de ${U.PATIENCE} dias` : ''}] banho ${r.banho}, noite ${r.noite}, ${r.night} casa(s) de noite no bairro`).join(' · ') + (missed.length ? '; SEM O PERFIL: ' + missed.map(r => setOf(r.b).name).join(', ') : ''));
  }
  if (on('q3') || on('q4')) {
    M.pronto(WORLD); const S = G.S; S.time = 0.45; M.viver(2); const b = baths().filter(x => Te.dia(x))[0];
    if (on('q3')) {
      god(() => U.noteB(b, 'banho', 3)); const c = U.cellOf(...mid(b)); const before = (S.urbAcc[c] || {}).banho || 0; M.salvarCarregar(); const after = ((G.S.urbAcc || {})[c] || {}).banho || 0;
      // a save of before: the baths' entries under «noite» — it loads, and what it had stays what it was
      const s = JSON.parse(G.Save.serialize()); s.urbAcc = { [c]: { d: G.S.day, noite: 5 } }; G.Save.apply(s); const old = (G.S.urbAcc[c] || {});
      ok('q3 a conta do dia na chave «banho» atravessa um save; e um save de antes, com os banhos em «noite», abre como estava', before >= 3 && after === before && old.noite === 5 && !old.banho && M.limpo(), `a célula dos banhos #${b.id}: ${before} de «banho» antes do save, ${after} depois; o save de antes: noite ${old.noite}, banho ${old.banho || 0}`);
    }
    if (on('q4')) {
      const Au = G.Audio; const S4 = G.S; const fams = Au && Au.FAMS ? Au.FAMS.slice() : []; const q = U.at(...mid(baths()[0])); const hab = q && Au.habito ? Au.habito(q) : null;
      const v = [...S4.villagers.values()].find(x => x.age >= 16); const t0 = v.task; v.task = { type: 'termas', id: baths()[0].id, st: 2 }; const fam = Au.famDe ? Au.famDe(v, null) : null; v.task = { type: 'fornalha', id: baths()[0].id, st: 1 }; const fam2 = Au.famDe ? Au.famDe(v, null) : null; v.task = t0;
      const keys = U.KEYS.filter(k => k !== 'crime'); const eq = keys.every(k => fams.includes(k)) && fams.every(k => keys.includes(k));
      ok('q4 o som acompanha: as famílias do som são as chaves da vida do bairro, e o banho e a fornalha são da família «banho»', eq && fam === 'banho' && fam2 === 'banho' && !!hab && hab.banho !== undefined && U.TAGS.termal && U.TAGS.termal.k === 'banho' && U.TAGS.boemio.k === 'noite',
        `as famílias do som: ${fams.join(', ')}; as chaves do bairro (sem o crime): ${keys.join(', ')}; quem se banha: «${fam}», quem alimenta a fornalha: «${fam2}»; o hábito do bairro dos banhos: ${hab ? JSON.stringify(hab) : '—'}`);
    }
  }
}

// ================================================================ e: the bad cases of the plaza
// (a town at the plaza's hour with people talking: the world lived to the hour, in the god's peace)
function toEvening(hour) {
  M.pronto(WORLD); const S = G.S; rebase(); let g = 0; const d0 = S.day;
  // (the second day on — the first is the world's long one —, at the hour, with four or more at the talk: an evening with people)
  while ((S.day === d0 || S.time < hour || S.time > 0.66 || talking(null).filter(v => v.task.st === 2).length < 4) && g++ < 9000 && S.day < d0 + 5) { peace(); M.viver(1); }
  let best = null, bn = 0; for (const b of plazas()) { const n = talking(b).filter(v => v.task.st === 2).length; if (n > bn) { bn = n; best = b; } }
  return { S, b: best, n: bn };
}
function partE() {
  const x = toEvening(0.615); const S = x.S;
  if (!x.b || x.n < 1) { ok('e os casos ruins da praça', false, `em cinco dias, nenhuma tarde com quatro na conversa (${talking(null).length} a caminho)`); return; }
  const save = G.Save.serialize(); const who = talking(null).map(v => v.id); const tSave = S.time;
  // (who talks at a market's door goes when the stalls shut, save or no save: the two seconds after the load count who was at a plaza)
  const whoP = talking(null).filter(v => (S.buildings.get(v.task.id) || {}).type === 'praca').map(v => v.id);
  // ---- e1
  if (on('e1')) {
    const run = () => {
      M.reseed(4242); G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); const S1 = G.S; const at0 = talking(null).length;
      let back = new Set(), peak = 0; for (let k = 0; k < 16; k++) { M.viver(1); const L = talking(null); if (k === 1) L.forEach(v => back.add(v.id)); peak = Math.max(peak, L.length); }
      const dig = JSON.stringify([S1.rng, S1.clock, [...S1.villagers.values()].map(v => [v.id, v.task ? v.task.type : '', Math.round(v.x * 10), Math.round(v.y * 10), Math.round(v.hunger), Math.round(v.energy)])]);
      return { at0, back: whoP.filter(id => back.has(id)).length, peak, dig, bad: novas().concat(mine().map(q => q.msg)) };
    };
    const a = run(), c = run();
    ok('e1 um save no meio da conversa, carregado duas vezes: quem estava na conversa ou a caminho segue nela (o save diz quem; dois segundos depois, quem não foi dormir nem comer continua), e o futuro é o mesmo nas duas vezes', a.dig === c.dig && a.at0 === who.length && a.back >= whoP.length * 0.75 && !a.bad.length && !c.bad.length && M.limpo(),
      `o save às ${tSave.toFixed(3)} com ${who.length} na conversa ou a caminho (${x.n} parados na praça #${x.b.id}): logo depois de abrir ${a.at0} com a conversa de volta; nos 2 s seguintes, ${a.back} dos ${whoP.length} que estavam numa praça seguem nela; em 16 s, até ${a.peak} de uma vez; os dois futuros ${a.dig === c.dig ? 'iguais' : 'DIFERENTES'}; o verificador ${a.bad.concat(c.bad).length ? a.bad.concat(c.bad).slice(0, 2).join(' | ') : 'limpo'}`);
  }
  const fresh = () => { G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); for (let k = 0; k < 10; k++) M.viver(1); rebase(); return G.S; };
  // ---- e2
  if (on('e2')) {
    const S2 = fresh(); const L = talking(null); const onWay = L.find(v => v.task.st < 2), there = L.find(v => v.task.st === 2); const n0 = L.length;
    god(() => { if (onWay) V.kill(onWay, 'sick'); if (there) V.kill(there, 'sick'); }); for (let k = 0; k < 4; k++) M.viver(1);
    const bad = novas().concat(mine().map(q => q.msg));
    ok('e2 quem morre a caminho da praça e quem morre na conversa: nada fica preso, o verificador limpo', (!!onWay || !!there) && !bad.length && M.limpo() && !talking(null).some(v => !S2.villagers.has(v.id)),
      `${n0} na conversa ou a caminho; morreram ${onWay ? onWay.name + ' (a caminho)' : '—'} e ${there ? there.name + ' (na conversa)' : '—'}; 4 s depois ${talking(null).length} na conversa; o verificador ${bad.length ? bad.slice(0, 2).join(' | ') : 'limpo'}`);
  }
  // ---- e3
  if (on('e3')) {
    const S3 = fresh(); const sets = new Set(talking(null).map(v => v.set)); const n0 = talking(null).length;
    god(() => { for (const id of sets) S3.settlements.get(id).alarmT = 30; }); M.viver(2); const n1 = talking(null).filter(v => sets.has(v.set)).length;
    const w = watch(); for (let k = 0; k < 10; k++) { god(() => { for (const id of sets) S3.settlements.get(id).alarmT = 30; }); M.viver(1); } w.close(); const went = w.go.filter(p => sets.has(p.set)).length;
    ok('e3 a guerra à porta (o alarme da cidade): quem está na praça vai embora na hora, e ninguém vem enquanto durar', n0 >= 1 && n1 === 0 && went === 0 && M.limpo(), `${n0} na conversa em ${sets.size} cidade(s); 2 s depois do alarme, ${n1}; em mais 10 s de alarme, ${went} idas novas nessas cidades`);
  }
  // ---- e4
  if (on('e4')) {
    const S4 = fresh(); const n0 = talking(null).length; let kids0 = 0; for (const v of S4.villagers.values()) if (v.age >= 7 && v.age < 16 && Pr.playAt(v)) kids0++;
    S4.weather.rain = 0.6; M.viver(2); const n1 = talking(null).length; const w = watch(); let kids1 = 0;
    for (let k = 0; k < 10; k++) { S4.weather.rain = 0.6; M.viver(1); } for (const v of S4.villagers.values()) if (v.age >= 7 && v.age < 16 && Pr.playAt(v)) kids1++; w.close();
    ok('e4 a chuva que começa: a conversa acaba na hora, ninguém vem debaixo de chuva, e as crianças não brincam na praça', n0 >= 1 && n1 === 0 && w.go.length === 0 && kids1 === 0 && M.limpo(), `${n0} na conversa; 2 s depois de começar a chover, ${n1}; em mais 10 s de chuva, ${w.go.length} idas novas; crianças com a praça por lugar de brincar: ${kids0} antes, ${kids1} na chuva`);
  }
  // ---- e5
  if (on('e5')) {
    const S5 = fresh(); let b = null, bn = 0; for (const q of plazas()) { const n = talking(q).length; if (n > bn) { bn = n; b = q; } }
    const ids = talking(b).map(v => v.id); god(() => V.removeBuilding(b)); M.viver(1); const left = ids.filter(id => { const v = S5.villagers.get(id); return v && v.task && v.task.type === 'praca' && v.task.id === b.id; }).length;
    for (let k = 0; k < 8; k++) M.viver(1); const bad = novas().concat(mine().map(q => q.msg)); const again = talking(null).filter(v => v.task.id === b.id).length;
    ok('e5 o deus derruba a praça com gente na conversa e a caminho: as conversas dela acabam no segundo seguinte, ninguém volta a ela, o verificador limpo', !!b && ids.length >= 1 && left === 0 && again === 0 && !bad.length && M.limpo(), `a praça #${b ? b.id : 0} com ${ids.length} na conversa ou a caminho: 1 s depois ${left}; em mais 8 s, ${again} com a tarefa nela; o verificador ${bad.length ? bad.slice(0, 2).join(' | ') : 'limpo'}`);
  }
  // ---- e6
  if (on('e6')) {
    const S6 = fresh(); let g = 0; let after = 0, seenAt = 0; while (S6.time < Pr.SHUT + 0.03 && g++ < 400) { peace(); M.viver(1); const n = talking(null).length; if (S6.time < Pr.SHUT) seenAt = Math.max(seenAt, n); if (S6.time >= Pr.SHUT + 0.012) after = Math.max(after, n); }
    const bad = novas().concat(mine().map(q => q.msg));
    ok('e6 o escuro: às 0,73 a conversa acaba e ninguém fica na praça pela vontade', after === 0 && !bad.length && M.limpo(), `até escurecer, até ${seenAt} de uma vez na conversa; depois das ${(Pr.SHUT + 0.012).toFixed(3)}, ${after}; o verificador ${bad.length ? bad.slice(0, 2).join(' | ') : 'limpo'}`);
  }
}

// ================================================================ t: the old stroll with the time's rule (T-919)
function partT() {
  M.pronto(WORLD); const S = G.S; S.time = 0.45; M.viver(2); fair0(null);
  const b = baths().filter(x => Te.dia(x)).sort((a, c) => V.pop(c.set) - V.pop(a.set) || a.id - c.id)[0];
  if (!b) { ok('t o passeio com a regra do tempo', false, 'nenhuns banhos abertos às 0,45'); return; }
  // (thirty of the town, their day's task ended by the proof's hand, standing by the baths' door: the walk is no matter here)
  const h = Te.horas(b); const set = setOf(b); const dr = Vg.door(b); const L = adults(set.id).filter(v => !v.jail && !v.aboard && !v.ug && !v.held && v.age < 55 && v.role !== 'foguista' && !(v.task && (v.task.pri || 0) > 1.05) && !(v.carry && v.carry.n > EPS) && !v.sleeping).slice(0, 30);
  god(() => { for (const v of L) { Vg.endTask(v); v.inside = 0; v.x = dr[0]; v.y = dr[1]; v.hunger = 20; v.energy = 70; } });
  const tryAt = t => { S.time = t; let sent = 0, calls = 0; god(() => { for (let k = 0; k < 12; k++) for (const v of L) { const t0 = v.task; const bd = v.bathDay; v.bathDay = 0; const r = G.City.leisureTask(v, Vg.H); calls++; if (r && r.type === 'termas' && r.id === b.id) sent++; if (v.task !== t0) Vg.endTask(v); v.bathDay = bd; } }); return { sent, calls }; };
  const inT = L.filter(v => Te.inTime(v, b)).length; const early = tryAt(0.45); const lateT = h.fecha - 0.02; const late = tryAt(lateT); const outT = L.filter(v => Te.inTime(v, b)).length;
  ok('t o passeio de quem está sem trabalho só leva aos banhos quem tem tempo para o banho antes de fechar (T-919): cedo leva, perto de fechar não', L.length >= 8 && inT === L.length && early.sent >= 3 && outT === 0 && late.sent === 0 && M.limpo(),
    `${set.name}, ${L.length} pessoas à porta dos banhos: às 0,45 ${inT} têm tempo, e o passeio manda aos banhos ${early.sent} vezes em ${early.calls} pedidos; às ${lateT.toFixed(2)} (os banhos fecham às ${h.fecha}) ${outT} têm tempo, e manda ${late.sent} vezes em ${late.calls}`);
}

// ================================================================ h: the verifier catches the lie
function partH() {
  M.pronto(WORLD); const S = G.S; S.time = 0.62; M.viver(1); const set = townOfPlaza(); const b = plazas(set.id)[0]; const other = plazas().find(q => q.set !== set.id);
  const clean0 = mine().length; const seen = {}; const L = adults(set.id).filter(v => !v.jail && !v.aboard && v.age < 55 && !(v.task && (v.task.pri || 0) >= 3)); const p = L[0];
  const t0 = p.task, c0 = p.carry, cap0 = p.captive, a0 = p.age, sl0 = p.sleeping; const T = id => ({ type: 'praca', id, pri: Pr.PRI, st: 2, x: b.x + 0.5, y: b.y + 0.5 });
  const lie = (name, put, undo, re) => { put(); const Q = mine(); seen[name] = Q.find(q => re.test(q.msg)) || null; undo(); };
  lie('o cativo na conversa', () => { p.captive = 1; p.task = T(b.id); }, () => { p.captive = cap0; p.task = t0; }, /cativo na conversa/);
  lie('a criança na conversa', () => { p.age = 9; p.task = T(b.id); }, () => { p.age = a0; p.task = t0; }, /9 anos, na conversa/);
  lie('a carga na conversa', () => { p.carry = { k: 'wood', n: 2 }; p.task = T(b.id); }, () => { p.carry = c0; p.task = t0; }, /com uma carga nas mãos/);
  lie('dormindo na conversa', () => { p.sleeping = true; p.task = T(b.id); }, () => { p.sleeping = sl0; p.task = t0; }, /dormindo/);
  lie('a conversa de noite', () => { S.time = 0.8; p.task = T(b.id); }, () => { S.time = 0.62; p.task = t0; }, /fora das horas/);
  lie('a praça que não existe', () => { p.task = T(987654321); }, () => { p.task = t0; }, /não está de pé/);
  if (other) lie('a praça de outra cidade', () => { p.task = T(other.id); }, () => { p.task = t0; }, /de outra cidade/);
  { const many = L.slice(0, Pr.holds(b) + 1); const keep = many.map(v => v.task); lie('a praça cheia demais', () => { many.forEach(v => { v.task = T(b.id); }); }, () => { many.forEach((v, i) => { v.task = keep[i]; }); }, /e comporta/); }
  const clean1 = mine().length; const names = Object.keys(seen); const missed = names.filter(k => !seen[k]);
  ok('h o verificador (qa/praca-inv.js) pega a mentira — o cativo, a criança, a carga, o sono, a noite, a praça que não existe, a de outra cidade, a praça cheia demais —, e nada sem ela', names.length >= 7 && !missed.length && !clean0 && !clean1 && seen['o cativo na conversa'].sev === 2,
    `${names.map(k => `${k}: ${seen[k] ? 'S' + seen[k].sev : 'NADA'}`).join(' · ')}; sem a mentira: ${clean0} antes, ${clean1} depois`);
}

// ================================================================
if (on('a')) partA();
if (on('b') || on('f1') || on('f2') || on('q1')) partB();
if (on('f3')) partF3();
if (on('q2') || on('q3') || on('q4')) partQ();
if (on('e')) partE();
if (on('t')) partT();
if (on('h')) partH();
ok('erros', M.limpo(), M.limpo() ? 'nenhum erro de módulo, nenhum aviso no console' : JSON.stringify(M.erros()).slice(0, 400));
console.log(fails.length ? `\nFALHOU: ${fails.length} (${fails.join(', ')})` : '\nPASSOU');
process.exit(fails.length ? 1 : 0);
