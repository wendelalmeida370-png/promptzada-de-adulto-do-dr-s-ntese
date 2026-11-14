// termas-grandes: as termas (5 casas, 20 m) e as grandes termas (7 casas, 28 m) dos povos da terma — o romano, o grego e o
// clássico (T-784, D-182, D-183) —, em Node, sobre o código do jogo. A forma é a de js/forma-termas.js (pura), a planta é a da
// forma (js/int-termas.js, a família forma.banhos), o dia dos banhos é o de sempre (G.Termas, js/act-servicos.js).
//   A a forma e a escada: A1 o lote, o pé, o risco, o degrau só nos povos da terma e só nesses tamanhos; A2 o romano e o grego
//     diferentes, o clássico com o desenho do grego; A3 o desenho próprio (sem «gigantismo»): os cômodos por função, cada
//     piscina no seu cômodo, a cúpula sobre o caldário, a fornalha encostada na parede dele, a colunata e a palestra na
//     frente; nas grandes, mais cômodos e mais piscinas, a simetria, a grande sala com o clerestório e as colunas;
//     A4 os banhos clássicos de cada povo iguais aos de antes (a forma e as plantas, um número por povo); A5 a conta da obra
//   B a planta: B1 nos quatro lados, nos dois degraus, nos três povos, pela família que o mundo dá ao registro — e só ela;
//     B2 a mesma duas vezes, a mesma em três prédios, a casca de longe, as paredes de meia; B3 os lugares (banhar, despir,
//     alimentar, sentar), todos alcançados da porta; B4 os cômodos e as peças da planta são os do risco; B5 as regras do
//     corpo (a escadaria, as portas, o relatório do jogo sem defeito); B6 o tempo; B7 o degrau clássico fica com as suas
//     plantas
//   C os pés: C1 da rua até dentro, a cada 2 cm, num mundo em branco; C2 da porta a cada lugar de cada piscina, a cada
//     cabide, à fornalha e a cada banco, pelo caminho do jogo (In.pathIn), sempre num chão onde o corpo fica
//   D o dia dos banhos numa vila de mentira, com o degrau e a sua planta: D1 abre, o foguista na fornalha, quem pode vem,
//     paga, despe-se num cabide, entra na água num lugar de piscina, sai; nunca mais na água que os lugares; D2 a casa cheia
//     e a espera nos cabides; D3 o save no meio do banho; D4 o corpo do deus pelas ofertas, em cada piscina
//   E de pé num mundo de verdade: E1 pela mão do deus junto de uma cidade de cada povo da terma (a planta, o relatório, a
//     entrada, a conta, o verificador), nenhum para os outros povos; um dia vivido, salvar e carregar; E2 o dia dos banhos de
//     verdade nas termas (o foguista, a lenha, os banhistas pelos próprios pés), com um save no meio carregado duas vezes
//   F a cidade ergue sozinha: F1 a cidade que justifica e pode pagar funda as termas (G.Village.startProject), a que não
//     justifica funda os banhos clássicos, a que não pode pagar também; F2 a cidade que cresceu amplia os banhos que tinha
//   G os casos ruins: a obra salva no meio e acabada; as termas derrubadas com gente na água; o foguista morre; um save de
//     antes (os banhos clássicos) abre igual
//   H o verificador (qa/termas-grandes-inv.js) pega a mentira: mais gente na água que os lugares, as termas sem fornalha
//   node qa/termas-grandes.js [A1,B,…]      VERB=1: cada caso que falha
'use strict';
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/escala-inv.js', 'qa/poder-inv.js', 'qa/oficio-inv.js', 'qa/termas-grandes-inv.js'] });
const In = G.Interiors, Fo = G.Forma, Sp = G.Space, Es = G.Escala, V = G.Village, Te = G.Termas, A = G.Act, D = G.Depot, E = G.Eco;
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const want = k => !ONLY || ONLY.some(o => k === o || k.startsWith(o));
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | termas-grandes ${name} | ${info}`); if (!c) fails.push(name.split(' ')[0]); };
const some = L => (process.env.VERB ? L : L.slice(0, 3));
// (the proofs' time is this process's own CPU, not the wall's — T-475)
const clock = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; };
const TERMA = ['romano', 'grego', 'classico'], OUTROS = ['egipcio', 'asteca', 'nordico'], LADOS = ['S', 'E', 'N', 'W'];
const DEG = [['termas', 5], ['grandes', 7]], FAM = 'forma.banhos';
const r2 = x => Math.round(x * 100) / 100;
const rec = (c, s, n, f, pw) => ({ v: In.REC_V, f: f || '', r: 0, t: 'banhos', u: In.TYPES.banhos.use, s, o: (1 << n) - 1, c, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: pw || 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0, n });
const ctx = (c, s, n) => ({ t: 'banhos', c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s, o: (1 << n) - 1, n });
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const area = r => (r[2] - r[0]) * (r[3] - r[1]);
const inR = (r, x, z, e) => x >= r[0] - (e || 0) && x <= r[2] + (e || 0) && z >= r[1] - (e || 0) && z <= r[3] + (e || 0);
const gap = (a, b) => Math.max(0, Math.max(a[0], b[0]) - Math.min(a[2], b[2]), Math.max(a[1], b[1]) - Math.min(a[3], b[3]));
const riskOf = (c, n) => In.riskOf(Fo.of('banhos', c, n));
const blankS = () => ({ villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N), occ: new Int32Array(G.N * G.N) });
const hash = s => { let h = 0x811C9DC5; for (let q = 0; q < s.length; q++) { h ^= s.charCodeAt(q); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(36); };
const tag = m => `${m.n === 5 ? 'T' : 'G'}/${m.c}/${m.s}`;
// (the plans of every people of the thermae, size and side, on a world of nothing: made once, read by the tests)
let cache = null;
const plans = () => {
  if (cache) return cache; G.S = blankS(); cache = []; let nid = 96001;
  for (const [, n] of DEG) for (const c of TERMA) for (const s of LADOS) {
    const b = { id: (nid += 41), type: 'banhos', style: c, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec(c, s, n, FAM);
    const t0 = clock(); const p = In.makeFam(b, b.ip, FAM); const ms = clock() - t0; G.S.buildings.set(b.id, b); cache.push({ n, c, s, b, p, ms, so: In.shellOf(b) });
  }
  return cache;
};

// ================================================================ A: the form and the ladder
function A1() {
  const out = [], sum = [];
  for (const [id, n] of DEG) for (const c of TERMA) {
    const F = Fo.of('banhos', c, n); if (!F) { out.push(`${id}/${c}: sem forma de ${n}`); continue; }
    const R = In.riskOf(F); const L = n * 4; const why = [];
    if (Math.abs(F.L - L) > 1e-9) why.push(`a forma de ${F.L} m num lote de ${L}`);
    if (!R || !R.termas || R.fam !== FAM) why.push('sem o risco das termas (a família forma.banhos)');
    for (const f of Fo.foot(F)) { const r = f.k === 'circ' ? [f.c[0] - f.r, f.c[1] - f.r, f.c[0] + f.r, f.c[1] + f.r] : f.r; if (r[0] < -1e-6 || r[1] < -1e-6 || r[2] > L + 1e-6 || r[3] > L + 1e-6) { why.push(`um pé fora do lote (${r.map(x => x.toFixed(2)).join(', ')})`); break; } }
    if (!Es.can('banhos', c, n)) why.push('o degrau não oferecido');
    const st = Es.steps('banhos').find(s => s.id === id); if (!st || st.n !== n) why.push('a escada sem o degrau');
    if (why.length) out.push(`${id}/${c}: ${why.join(', ')}`);
    sum.push(`${id}/${c} ${F.top.toFixed(1)} m`);
  }
  // (the other peoples have no bigger baths: the sacred lake, the temazcal and the sauna are three other drawings, not made —
  // and never the classical people's thermae through the fallback of the sized forms, D-182)
  for (const c of OUTROS) for (const [id, n] of DEG) if (Fo.has('banhos', c, n) || Es.can('banhos', c, n) || Fo.sizes('banhos', c).includes(n)) out.push(`${c}: ${id} oferecidas a um povo sem termas`);
  // (no step of a size its form has not; the classic step, every people's, always)
  for (const c of TERMA.concat(OUTROS)) { for (const n of [3, 4, 6, 8, 10]) if (Fo.has('banhos', c, n) || Es.can('banhos', c, n)) out.push(`${c}: os banhos de ${n} oferecidos sem a forma`);
    if (!Fo.has('banhos', c) || !Es.can('banhos', c, 2) || In.riskOf(Fo.of('banhos', c))) out.push(`${c}: os banhos clássicos sem a forma de sempre`); }
  const sz = TERMA.map(c => Fo.sizes('banhos', c).join(','));
  ok('A1 a forma das termas e das grandes termas em cada povo da terma: o lote, o pé dentro dele, o risco; o degrau só nesses povos e só nesses tamanhos', !out.length && sz.every(s => s === '2,5,7'), some(out).join(' / ') || `as alturas: ${sum.join(', ')}; os tamanhos da forma: ${TERMA.map((c, i) => `${c} ${sz[i]}`).join(' · ')}; o egípcio, o asteca e o nórdico: só os banhos clássicos`);
}
function A2() {
  const sig = (c, n) => { const F = Fo.of('banhos', c, n); const k = {}; for (const m of Fo.mass(F)) k[m.k] = (k[m.k] || 0) + 1; const e = {}; for (const q of F.els) e[q.k] = (e[q.k] || 0) + 1; return JSON.stringify(k) + JSON.stringify(e) + ':' + F.top.toFixed(1); };
  const res = DEG.map(([id, n]) => ({ id, n, dif: sig('romano', n) !== sig('grego', n), cl: sig('classico', n) === sig('grego', n), ro: Fo.of('banhos', 'romano', n).top, gr: Fo.of('banhos', 'grego', n).top }));
  // (and neither is the classic baths' drawing grown: other pieces, not the same ones bigger)
  const grown = []; for (const c of TERMA) { const k0 = Fo.of('banhos', c).els.length; for (const [id, n] of DEG) if (Fo.of('banhos', c, n).els.length <= k0) grown.push(`${id}/${c}`); }
  const two = TERMA.filter(c => sig(c, 5) === sig(c, 7));
  ok('A2 o romano e o grego diferentes em cada degrau, o clássico com o desenho do grego; as termas e as grandes termas diferentes entre si e dos banhos clássicos', res.every(q => q.dif && q.cl) && !grown.length && !two.length,
    res.map(q => `${q.id}: o romano ${q.ro.toFixed(1)} m ${q.dif ? '≠' : '= (IGUAL)'} o grego ${q.gr.toFixed(1)} m, o clássico ${q.cl ? 'o grego' : 'OUTRO'}`).join('; ') + (grown.length ? `; com as peças dos banhos clássicos: ${grown.join(', ')}` : '') + (two.length ? `; os dois degraus iguais: ${two.join(', ')}` : ''));
}
function A3() {
  const out = [], sum = [];
  for (const [id, n] of DEG) for (const c of TERMA) {
    const R = riskOf(c, n); if (!R) { out.push(`${id}/${c}: sem risco`); continue; } const L = n * 4; const why = []; const key = `${id}/${c}`;
    const by = fn => R.rooms.filter(m => m.fn === fn); const one = fn => by(fn)[0];
    // (the rooms by their function: a vestiary, the cold room, the warm, the hot, the furnace's; the porch and the open palestra)
    for (const fn of ['vestiario', 'frio', 'morno', 'quente', 'fornalha', 'portico', 'palestra']) if (!by(fn).length) why.push(`sem o cômodo ${fn}`);
    if (why.length) { out.push(`${key}: ${why.join(', ')}`); continue; }
    if (!one('palestra').open) why.push('a palestra fechada');
    // (each pool in its room, by its water: the cold in the frigidarium, the warm in the tepidarium, the hot in the caldarium,
    // the open ones in the palestra; all inside their room)
    const WATER = { fria: 'frio', morna: 'morno', quente: 'quente', natacao: 'palestra' };
    for (const q of R.pools) { const m = R.rooms[q.room]; if (!m || m.fn !== WATER[q.k]) why.push(`a piscina ${q.k} no cômodo ${m ? m.fn : '-'}`); else if (!(q.r[0] >= m.r[0] - 1e-6 && q.r[1] >= m.r[1] - 1e-6 && q.r[2] <= m.r[2] + 1e-6 && q.r[3] <= m.r[3] + 1e-6)) why.push(`a piscina ${q.k} fora do cômodo`); }
    for (const k of ['fria', 'morna', 'quente']) if (!R.pools.some(q => q.k === k)) why.push(`sem a piscina ${k}`);
    // (the dome over the hot room, whole; the furnace in its own room, against the hot room's wall)
    const hot = one('quente').r; const d = R.domo;
    if (!d || !inR(hot, d.c[0], d.c[1]) || d.c[0] - d.r < hot[0] - R.t || d.c[0] + d.r > hot[2] + R.t || d.c[1] - d.r < hot[1] - R.t || d.c[1] + d.r > hot[3] + R.t) why.push('a cúpula fora do caldário');
    const fo = R.fornalha; const fr = fo && R.rooms[fo.room];
    if (!fo || !fr || fr.fn !== 'fornalha' || gap(fo.r, hot) > R.ti + 0.05) why.push(`a fornalha longe da parede do caldário (${fo ? gap(fo.r, hot).toFixed(2) : '-'} m)`);
    // (the palestra with its colonnade in front of the block, the street's gate and the flight on the lot's front)
    const col = R.cols.find(q => q.porch); const pal = one('palestra').r;
    if (!col || col.at.length < (n === 5 ? 8 : 10) || col.line[0][1] < R.B[3] - 1e-6 || pal[1] < R.B[3] - 1e-6) why.push('sem a colunata diante do bloco');
    if (!(R.gate && Math.abs(R.gate.u - L / 2) < 1e-6 && R.stair[3] <= L + 1e-6 && R.stair[1] >= pal[3] - 0.2)) why.push('a escadaria fora da frente do lote');
    // (the pegs in the vestiaries)
    if (R.pegs.length < (n === 5 ? 6 : 12) || R.pegs.some(q => (R.rooms[q.room] || {}).fn !== 'vestiario')) why.push(`os cabides (${R.pegs.length}) fora do vestiário`);
    // (no «gigantism»: not three rooms grown — the closed rooms, the biggest one's share of the lot)
    const closed = R.rooms.filter(m => !m.open && m.fn !== 'portico'); const big = Math.max(...closed.map(m => area(m.r))) / (L * L);
    if (closed.length < (n === 5 ? 6 : 8) || big > 0.2) why.push(`${closed.length} cômodos fechados, o maior com ${(big * 100).toFixed(0)}% do lote`);
    if (n === 7) {
      // (the great ones: symmetric about the axis of the way in — every closed room, every pool, every peg has its mirror —, more
      // pools than the thermae, the great hall under the clerestory with its columns: the biggest room, the cold one)
      const mir = r => [L - r[2], r[1], L - r[0], r[3]]; const same = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-6);
      const asym = closed.filter(m => !closed.some(o => same(mir(m.r), o.r))).length + R.pools.filter(q => !R.pools.some(o => same(mir(q.r), o.r))).length + R.pegs.filter(q => !R.pegs.some(o => same(mir(q.r), o.r))).length;
      if (asym) why.push(`${asym} cômodos, piscinas ou cabides sem o seu espelho`);
      const R5 = riskOf(c, 5); if (R.pools.length <= R5.pools.length || closed.length <= R5.rooms.filter(m => !m.open && m.fn !== 'portico').length) why.push('nem mais piscinas nem mais cômodos que as termas');
      const hall = one('frio'); const cols = R.pieces.filter(q => q.k === 'coluna' && q.room === R.rooms.indexOf(hall));
      if (!R.clere || gap(R.clere.r, hall.r) > 1e-6 || cols.length < 4 || closed.some(m => area(m.r) > area(hall.r) + 1e-6)) why.push('a grande sala sem o clerestório, sem as colunas ou menor que outro cômodo');
      if (!R.pools.some(q => q.k === 'natacao' && q.open)) why.push('sem a piscina aberta da palestra');
    }
    if (why.length) out.push(`${key}: ${why.join(', ')}`);
    if (c === 'romano') sum.push(`${id}: ${closed.length} cômodos fechados (${closed.map(m => m.fn).join(', ')}), ${R.pools.length} piscinas (${R.pools.map(q => q.k).join(', ')}), ${R.pegs.length} cabides, a colunata de ${col.at.length} colunas, o maior cômodo ${(big * 100).toFixed(0)}% do lote`);
  }
  ok('A3 o desenho próprio das termas: os cômodos por função, cada piscina no seu, a cúpula sobre o caldário, a fornalha na parede dele, a colunata e a palestra na frente; nas grandes a simetria, mais piscinas, a grande sala', !out.length, some(out).join(' / ') || sum.join(' · '));
}
// (the classic baths of every people, as they were at 20b0a58: the form — every piece of it — and the plans the world gives a
// record of them, on four sides and in three buildings, one number a people. A number that changes is the classic baths
// changed: the saves of before would open with other baths — only on purpose, and then this list is made again)
const CLASSICO = { classico: '1dwy7z7', grego: 'z72n49', romano: '9u6b8b', egipcio: '1ygqzgt', asteca: '160vq5v', nordico: 'dwu8x5' };
function A4() {
  G.S = blankS(); const got = {};
  for (const c of Object.keys(CLASSICO)) {
    const F = Fo.of('banhos', c); const parts = [JSON.stringify(F.els.map(e => Object.assign({}, e, { risco: undefined }))), F.top];
    for (const s of LADOS) for (const id of [96042, 97113, 98201]) {
      const b = { id, type: 'banhos', style: c, x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = In.newRecord(b, ctx(c, s, 2));
      const p = In.make(b, b.ip); parts.push(b.ip.f, p.ok, p.sig, JSON.stringify([p.shell, p.rooms, p.doors, p.holes, p.items.map(i => [i.kind, i.x, i.z, i.ry, i.w, i.d])]));
    }
    got[c] = hash(parts.join('|'));
  }
  const dif = Object.keys(CLASSICO).filter(c => got[c] !== CLASSICO[c]);
  ok('A4 os banhos clássicos de cada povo iguais aos de antes do degrau novo: a forma e as plantas (quatro lados, três prédios), um número por povo', !dif.length, dif.length ? `mudaram: ${dif.map(c => `${c} ${CLASSICO[c]} → ${got[c]}`).join(', ')}` : `os seis iguais (${Object.keys(got).map(c => `${c} ${got[c]}`).join(', ')})`);
}
function A5() {
  const def = G.BDEF.banhos; const out = [], sum = [];
  for (const st of Es.steps('banhos')) { const B = Es.bill('banhos', st); const b = { id: 1, type: 'banhos', w: st.n, h: st.n, esc: st.id };
    const wantC = {}; for (const m in def.cost) wantC[m] = st.classico ? def.cost[m] : Math.ceil(def.cost[m] * st.k - 1e-9); const wantW = st.classico ? def.work : Math.ceil(def.work * (st.kw || st.k) - 1e-9);
    if (JSON.stringify(B.cost) !== JSON.stringify(wantC) || B.work !== wantW || V.workOf(b) !== wantW || Es.billOf(b) !== B) out.push(`${st.id}: ${JSON.stringify(B.cost)} e ${B.work} de trabalho (V.workOf ${V.workOf(b)}), esperado ${JSON.stringify(wantC)} e ${wantW}`);
    sum.push(`${st.id} (${st.n} casas) ${Object.keys(B.cost).map(m => `${B.cost[m]} ${m}`).join(' + ')}, ${B.work} de trabalho`); }
  const L = Es.steps('banhos'); const up = L.every((s, i) => !i || (s.n > L[i - 1].n && Es.bill('banhos', s).cost.stone > Es.bill('banhos', L[i - 1]).cost.stone && Es.bill('banhos', s).work > Es.bill('banhos', L[i - 1]).work));
  ok('A5 a obra custa e demora o do degrau (G.Escala.bill, G.Village.workOf): a conta dos banhos clássicos a da tabela, as dos degraus maiores pelos seus multiplicadores, cada degrau mais caro que o anterior', !out.length && L.length === 3 && up, out.join(' / ') || sum.join(' · '));
}

// ================================================================ B: the plan
function B1() {
  const made = plans(); const bad = made.filter(m => !m.p.ok); const offer = [], only = []; let k = 0;
  // (the family a new record of the step is given — what the world does —, and what the type offers there: the form's alone,
  // never a recipe's hall of the classic lot grown)
  for (const [id, n] of DEG) for (const c of TERMA) for (const s of LADOS) { const b = { id: 97101 + 13 * (k++), type: 'banhos', style: c, x: 8, y: 8, w: n, h: n };
    const r = In.newRecord(b, ctx(c, s, n)); if (r.f !== FAM) offer.push(`${id}/${c}/${s}: ${r.f}`);
    const fam = In.familiesFor(r); if (fam.ok.length !== 1 || fam.ok[0] !== FAM) only.push(`${id}/${c}/${s}: ${fam.ok.join(',') || 'nenhuma'}`); }
  ok('B1 a planta em todo povo da terma, degrau e lado, pela família da forma — a que o mundo dá ao registro do degrau, e a única oferecida ali', made.length === 24 && !bad.length && !offer.length && !only.length,
    `${made.length - bad.length} de ${made.length} plantas${bad.length ? '; ' + some(bad).map(m => `${tag(m)}: ${m.p.errs.slice(0, 2).join('; ')}`).join(' / ') : ''}${offer.length ? '; os registros: ' + some(offer).join(' · ') : '; todo registro novo com a forma.banhos'}${only.length ? '; oferecidas: ' + some(only).join(' · ') : ', a única oferecida'}`);
}
function B2() {
  const made = plans().filter(m => m.p.ok); const sigOf = p => JSON.stringify([p.rooms, p.items.map(i => [i.kind, i.x, i.z, i.ry]), p.doors, p.holes]);
  const diff = made.filter(m => sigOf(In.makeFam(m.b, m.b.ip, FAM)) !== sigOf(m.p));
  // (the same building whatever its id: the thermae are their form, with no dice)
  // (but the side a door's leaf hangs on, the engine's own choice by the building: the same walls, rooms, pieces and doorways)
  const bare = p => JSON.stringify([p.rooms, p.items.map(i => [i.kind, i.x, i.z, i.ry]), p.doors.map(d => Object.assign({}, d, { hinge: 0 })), p.holes]);
  const ids = made.filter(m => m.s === 'S').filter(m => [5, 77777, 1234567].some(id => { const b = Object.assign({}, m.b, { id }); b.ip = rec(m.c, m.s, m.n, FAM); return bare(In.makeFam(b, b.ip, FAM)) !== bare(m.p); }));
  const sh = made.filter(m => !m.so || strip(m.so) !== strip(In.shellOfPlan(m.p)));
  // (with neighbours on every side — the party walls: the same rooms, the plan still valid)
  const pw = []; let nid = 95001; for (const m of made.filter(q => q.s === 'S' || q.s === 'E')) { const b = { id: (nid += 7), type: 'banhos', style: m.c, x: 8, y: 8, w: m.n, h: m.n, built: true }; b.ip = rec(m.c, m.s, m.n, FAM, 15); const p = In.makeFam(b, b.ip, FAM); if (!p.ok || p.rooms.length !== m.p.rooms.length) pw.push(`${tag(m)}: ${p.ok ? p.rooms.length + ' cômodos' : p.errs.slice(0, 2).join('; ')}`); }
  ok('B2 a mesma planta duas vezes da mesma entrada, a mesma em prédios de outro número, a casca de longe igual à da planta, e a planta de pé com vizinhos de meia nos quatro lados', made.length === 24 && !diff.length && !ids.length && !sh.length && !pw.length,
    `${diff.length} diferentes na segunda vez${diff.length ? ' (' + some(diff).map(tag).join(', ') + ')' : ''}; ${ids.length} mudam com o número do prédio; ${sh.length} cascas diferentes${sh.length ? ' (' + some(sh).map(tag).join(', ') + ')' : ''}; com paredes de meia: ${pw.length ? some(pw).join(' / ') : 'as 12 de pé'}`);
}
// (what the baths' day needs of the plan, by the table the world shares the places out of — In.table —: each place usable where
// a body is and reached from the door)
const WANT = { 5: { banhar: 24, despir: 6, alimentar: 1, sentar: 4 }, 7: { banhar: 100, despir: 12, alimentar: 1, sentar: 8 } };
const placesOf = (b, use) => { const t = In.table(b); return t ? t.spots.filter(e => e.use === use) : []; };
function B3() {
  const out = [], sum = [];
  for (const m of plans().filter(q => q.p.ok)) {
    const t = In.table(m.b); if (!t) { out.push(`${tag(m)}: sem a tabela dos lugares`); continue; } const why = [];
    for (const use of Object.keys(WANT[m.n])) { const L = placesOf(m.b, use); const good = L.filter(e => e.ok && e.din < Infinity);
      if (good.length < WANT[m.n][use]) why.push(`${good.length} lugares de ${use} (de ${L.length}; pedidos ${WANT[m.n][use]})`);
      if (use !== 'sentar' && good.length !== L.length) why.push(`${L.length - good.length} lugares de ${use} que a porta não alcança ou onde o corpo não fica`); }
    // (every pool with places in the water, the furnace's place the stoker's — a trade's station)
    const pools = m.p.items.filter(i => i.kind === 'piscina'); const dry = pools.filter(i => !t.spots.some(e => e.it.id === i.id && e.use === 'banhar' && e.ok && e.din < Infinity)).length; if (dry) why.push(`${dry} piscinas sem lugar na água`);
    if (!t.spots.some(e => e.use === 'alimentar' && e.it.job)) why.push('a fornalha sem o lugar do foguista');
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    if (m.s === 'S' && m.c === 'romano') sum.push(`${m.n === 5 ? 'termas' : 'grandes termas'}: ${Object.keys(WANT[m.n]).map(u => `${placesOf(m.b, u).filter(e => e.ok && e.din < Infinity).length} de ${u}`).join(', ')} em ${pools.length} piscinas; o lugar mais longe da porta a ${Math.max(...t.spots.filter(e => e.din < Infinity).map(e => e.din)).toFixed(0)} m`);
  }
  ok('B3 os lugares do dia dos banhos na tabela da planta: na água de cada piscina, nos cabides, na fornalha (o posto do foguista), nos bancos — cada um onde o corpo fica e alcançado da porta', !out.length, some(out).join(' / ') || sum.join(' · ') + ' — nos 24');
}
function B4() {
  const out = [];
  for (const m of plans().filter(q => q.p.ok)) {
    const R = riskOf(m.c, m.n); const p = m.p; const why = [];
    // (the plan's rooms are the risk's, one for one, by function; its pieces the risk's: the pools, the furnace, the pegs, the
    // hall's columns as solids)
    const fns = a => a.map(q => q.fn).sort().join(','); if (fns(p.rooms.filter(q => q.fn !== 'rua')) !== fns(R.rooms)) why.push(`os cômodos (${fns(p.rooms)}) não são os do risco (${fns(R.rooms)})`);
    const cnt = k => p.items.filter(i => i.kind === k).length;
    if (cnt('piscina') !== R.pools.length) why.push(`${cnt('piscina')} piscinas (o risco: ${R.pools.length})`);
    if (cnt('fornalha-banho') !== 1) why.push(`${cnt('fornalha-banho')} fornalhas`);
    if (cnt('cabide') !== R.pegs.length) why.push(`${cnt('cabide')} cabides (o risco: ${R.pegs.length})`);
    if (cnt('solido') !== R.pieces.length) why.push(`${cnt('solido')} sólidos (as peças do risco: ${R.pieces.length})`);
    // (one storey, the floor on the podium; the shell the form's block)
    if (p.levels.length !== 1 || Math.abs(p.levels[0].y - R.Hp) > 1e-6) why.push('o piso fora do pódio');
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
  }
  ok('B4 os cômodos e as peças da planta são os do risco da forma: os mesmos cômodos, as piscinas, a fornalha, os cabides, as colunas da sala; um piso só, sobre o pódio', !out.length, some(out).join(' / ') || 'nos 24: o corpo anda no prédio que o deus e o 3D desenham');
}
function B5() {
  const out = [], sum = [];
  for (const m of plans().filter(q => q.p.ok)) {
    const p = m.p; const R = riskOf(m.c, m.n); const why = [];
    const st = p.stairs.find(s => s.kind === 'degraus' && s.lv0 === -1); if (!st) { out.push(`${tag(m)}: sem a escadaria`); continue; }
    const tr = (st.treads || []).slice().sort((a, b) => a.y - b.y); const ys = [0].concat(tr.map(q => q.y), [R.Hp]);
    let rise = 0; for (let k = 1; k < ys.length; k++) rise = Math.max(rise, ys[k] - ys[k - 1]);
    const deep = tr.length ? Math.min(...tr.map(q => Math.min(q.r[2] - q.r[0], q.r[3] - q.r[1]))) : Infinity;
    if (rise > In.BODY.step + 1e-6) why.push(`um espelho de ${rise.toFixed(2)} m`); if (deep < 0.28 - 1e-6) why.push(`um piso de ${deep.toFixed(2)} m`); if (st.w < 1.2 - 1e-6) why.push(`${st.w.toFixed(2)} m de largura`);
    // (the street's gate, the portal and every inner door: a body's height and width)
    const hole = d => p.holes.find(h => h.door === d.id); const rua = p.doors.find(d => d.rooms.includes('rua'));
    if (!rua || !hole(rua) || hole(rua).h < 2.2 - 1e-6) why.push(`a porta da rua de ${rua && hole(rua) ? hole(rua).h.toFixed(2) : '-'} m`);
    if (!R.doorD || R.doorD.y1 - R.doorD.y0 < 2.2 - 1e-6) why.push('o portal baixo');
    const low = p.doors.filter(d => { const h = hole(d); return h && (h.h < 2.0 - 1e-6 || h.w < 0.8 - 1e-6); }); if (low.length) why.push(`${low.length} portas baixas ou estreitas`);
    // (every room of the plan reached from the door: its people go in)
    const W = In.walkField(p); const n = W.n; const reach = m2 => { const cx = (m2.r[0] + m2.r[2]) / 2, cz = (m2.r[1] + m2.r[3]) / 2; let best = Infinity; for (let dz = -6; dz <= 6; dz++) for (let dx = -6; dx <= 6; dx++) { const X = Math.floor(cx / In.CS) + dx, Z = Math.floor(cz / In.CS) + dz; if (X >= 0 && Z >= 0 && X < n && Z < n) best = Math.min(best, W.D[0][Z * n + X]); } return best; };
    const shut = p.rooms.filter(q => q.fn !== 'rua' && reach(q) === Infinity); if (shut.length) why.push(`cômodos sem caminho da porta: ${shut.map(q => q.fn).join(', ')}`);
    // (the game's own report of the plan: no defect)
    const rep = In.report(m.b, p, {}).filter(q => q.k === 'FALHA').map(q => q.what); if (rep.length) why.push(`o relatório: ${rep.slice(0, 2).join('; ')}`);
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    if (m.s === 'S' && m.c !== 'classico') sum.push(`${tag(m)} ${tr.length + 1}×${rise.toFixed(2)} m em ${st.w.toFixed(1)} m, ${p.doors.length} portas`);
  }
  ok('B5 as regras do corpo: a escadaria da rua ao pódio (espelho ≤ 0,30, piso ≥ 0,28, ≥ 1,2 m), a porta da rua e o portal ≥ 2,2 m, toda porta de dentro ≥ 2,0 × 0,8 m, todo cômodo com caminho da porta; o relatório do jogo sem defeito', !out.length, some(out).join(' / ') || sum.join(', '));
}
function B6() {
  const made = plans(); const ts = made.map(m => ({ k: tag(m), ms: m.ms, m })).sort((a, b) => b.ms - a.ms); const med = made.map(q => q.ms).sort((a, b) => a - b)[made.length >> 1];
  // (the dearest made again, with no cache, three times: the least is its cost — the first ones paid the engine's warming)
  const again = ts.slice(0, 3).map(q => { let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(q.m.b, q.m.b.ip, FAM); best = Math.min(best, clock() - a); } return [q.k, best]; }).sort((a, b) => b[1] - a[1]);
  ok('B6a o tempo de fazer a planta (alvo: 400 ms em Node)', again[0][1] < 400, `a mais cara ${again[0][1].toFixed(0)} ms de CPU (${again[0][0]}, sem cache); a mediana ${med.toFixed(0)} ms na rodada`);
  // (the places' table of each — In.table, the share-out's —, the first time the world asks for it)
  let nid = 94001; const tab = made.filter(m => m.s === 'S' && m.p.ok).map(m => { const b = { id: (nid += 3), type: 'banhos', style: m.c, x: 8, y: 8, w: m.n, h: m.n, built: true }; b.ip = rec(m.c, 'S', m.n, FAM); In.makeFam(b, b.ip, FAM); const a = clock(); const t = In.table(b); return [tag(m), clock() - a, t ? t.spots.length : 0]; }).sort((a, b) => b[1] - a[1]);
  ok('B6b a tabela dos lugares de cada uma a tempo (alvo: 1 s em Node)', tab.length === 6 && tab.every(q => q[2] > 0) && tab[0][1] < 1000, `a mais cara ${tab[0][0]} ${tab[0][1].toFixed(0)} ms de CPU (${tab[0][2]} lugares); ${tab.slice(1).map(([k, ms, n]) => `${k} ${ms.toFixed(0)} ms (${n})`).join(', ')}`);
}
function B7() {
  G.S = blankS(); const out = [], sum = []; const fams = In.TYPES.banhos.fams;
  // (the classic lot: every family the type had — the classic baths' own plan by their form, and the recipes' halls —, in the
  // six peoples: an old save's record, whatever its family, lays out as before — A4 has the plans themselves)
  for (const c of TERMA.concat(OUTROS)) { const r = In.newRecord({ id: 93001, type: 'banhos', style: c, x: 8, y: 8, w: 2, h: 2 }, ctx(c, 'S', 2)); const a = In.familiesFor(r).ok;
    if (a.length !== fams.length || !fams.every(f => a.includes(f))) out.push(`${c}: ${a.join(',') || 'nenhuma'}`); sum.push(`${c} ${a.length}`); }
  // (and on a bigger step every recipe's family is refused, with the reason said: the thermae are their form's)
  const lie = []; for (const [id, n] of DEG) for (const c of TERMA) { const q = In.familiesFor(rec(c, 'S', n, FAM)); for (const f of fams) { if (f === FAM) continue; const why = String((q.gen && q.gen[f]) || (q.arch && q.arch[f]) || ''); if (q.ok.includes(f) || !/as termas de um degrau maior são as da forma/.test(why)) lie.push(`${id}/${c}: ${f} ${q.ok.includes(f) ? 'oferecida' : 'recusada sem dizer por quê (' + why.slice(0, 40) + ')'}`); } }
  ok('B7 o degrau clássico fica com todas as suas famílias de planta nos seis povos, e num degrau maior toda família de receita é recusada, dizendo por quê', !out.length && !lie.length && fams.length >= 2, some(out.concat(lie)).join(' / ') || `as famílias oferecidas aos banhos de 2 casas: ${sum.join(', ')} (as ${fams.length} do tipo); nos degraus maiores as ${fams.length - 1} de receita recusadas («as termas de um degrau maior são as da forma»)`);
}

// ================================================================ C: the feet
// (a blank world: flat grass, nothing on it; a building of a step put on it by hand, its record as the world makes it)
const blankWorld = () => { const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld(); return S; };
const putStep = (S, c, n, x, y, id, s) => { const def = G.BDEF.banhos; const b = { id, type: 'banhos', style: c, x, y, w: n, h: n, esc: n === 5 ? 'termas' : n === 7 ? 'grandes' : 'banhos', built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, inv: {}, ip: null };
  S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + n; yy++) for (let xx = b.x; xx < b.x + n; xx++) S.occ[yy * G.N + xx] = b.id;
  b.ip = In.newRecord(b, ctx(c, s || 'S', n)); return b; };
// (the feet from the street along the way in to v = end, every 2 cm, against what the form is there — the treads, the
// platform's top, the street —: the worst difference, the points below it, the biggest step, where they stop)
function feetIn(b, p, R, end) {
  const TL = Sp.TILE, L = b.w * TL, u = p.entrance.x; const pl = Sp.plinth(b);
  const top = z => { for (const q of R.treads) if (inR(q.r, u, z)) return q.y; return inR(R.podium, u, z) ? R.Hp : 0; };
  const edges = R.treads.flatMap(q => [q.r[1], q.r[3]]).concat([R.podium[3]]);
  let worst = 0, at = 0, step = 0, fell = 0, prev = null, nn = 0, stop = null;
  for (let z = L + 1.0; z >= end; z -= 0.02) {
    const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z));
    if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
    if (ins && !ins.walk && ins.door < 0 && stop === null) stop = z;
    if (edges.some(e => Math.abs(z - e) < 0.03)) continue;
    if ((!ins && Sp.stepTop(X, Z) > -Infinity) || z > R.stair[3] + 0.01) continue; nn++;
    const wantY = pl.hi + top(z) + (ins && z < R.podium[3] ? Sp.FLOOR_UP : 0); const d = foot - wantY; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = z; }
    if (d < -0.05) fell++;
  }
  const bad = Math.abs(worst) > 0.03 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9 || stop !== null || nn < 100;
  return { bad, worst, why: `os pés a ${worst.toFixed(2)} m da forma em v ${at.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão${stop !== null ? `, parados em v ${stop.toFixed(2)}` : ''} (${nn} pontos)` };
}
// (the thermae of each people of them and size on a blank world, in two rows: made once for C1 and C2)
let field = null;
const onBlank = () => {
  if (field) { G.S = field.S; return field.L; } const S = blankWorld(); const L = []; let k = 0;
  for (const [, n] of DEG) for (const [q, c] of TERMA.entries()) { const b = putStep(S, c, n, 3 + 9 * q, n === 5 ? 3 : 12, 99001 + 7 * (k++)); L.push({ n, c, b, key: `${n === 5 ? 'T' : 'G'}/${c}` }); }
  field = { S, L }; return L;
};
function C1() {
  const out = [], sum = [];
  for (const q of onBlank()) {
    if (q.b.ip.f !== FAM) { out.push(`${q.key}: o registro novo com ${q.b.ip.f}`); continue; }
    const p = Sp.planNow(q.b); if (!p || !p.ok) { out.push(`${q.key}: sem planta`); continue; }
    const R = riskOf(q.c, q.n);
    // (from the street up the flight, across the palestra, under the colonnade, through the portal, to a pace inside)
    const f = feetIn(q.b, p, R, R.B[3] - R.t - 1.0); sum.push(`${q.key} ${f.worst >= 0 ? '+' : ''}${f.worst.toFixed(3)}`); if (f.bad) out.push(`${q.key}: ${f.why}`);
  }
  ok('C1 os pés da rua até dentro das termas — a escadaria, a palestra, a colunata, o portal —, a cada 2 cm, sempre num chão onde ficam, à altura da forma', !out.length, some(out).join(' / ') || `nas 6 (a maior diferença: ${sum.join(', ')})`);
}
function C2() {
  const out = [], sum = []; const TL = Sp.TILE;
  for (const q of onBlank()) {
    const b = q.b; const p = Sp.planNow(b); const t = p && p.ok ? In.table(b) : null; if (!t) { out.push(`${q.key}: sem a tabela`); continue; }
    let n = 0, far = 0, off = 0, none = 0, taken = 0; const pools = new Set(); const why = [];
    for (const e of t.spots) {
      if (!['banhar', 'despir', 'alimentar', 'sentar', 'pegar'].includes(e.use) || !e.ok) continue; n++;
      // (the place as the body would take it — free, nobody inside —, and the game's way to it from the door)
      const pl = In.freeFor(b, e.it.id, e.q); if (!pl) { taken++; continue; }
      const w = In.pathIn(b, pl); if (!w || !(w.len < Infinity)) { none++; if (why.length < 2) why.push(`sem caminho a ${e.use} em ${e.it.kind} (${e.x.toFixed(1)}, ${e.z.toFixed(1)})`); continue; }
      far = Math.max(far, w.len); if (e.use === 'banhar') pools.add(e.it.id);
      // (every point of the way but the place itself, on a piece: a floor of the plan where a body stands, or a doorway)
      const pts = pl.on ? w.pts.slice(0, -1) : w.pts;
      for (const [x, z, lv] of pts) { const ins = Sp.indoor(b.x * TL + x, b.y * TL + z, lv, b.id); if (!ins || !(ins.walk || ins.door >= 0)) { off++; if (why.length < 2) why.push(`o caminho a ${e.use} passa por (${x.toFixed(2)}, ${z.toFixed(2)}), onde o corpo não fica`); break; } }
      // (and the walk's metres the table's own, the door's: the world times the way in by them)
      if (Math.abs(In.walkIn(b, pl) - e.din) > 1e-6) { off++; if (why.length < 2) why.push('a tabela e o caminho com metros diferentes'); }
    }
    const R = riskOf(q.c, q.n); if (pools.size !== R.pools.length) why.push(`${pools.size} piscinas com caminho (de ${R.pools.length})`);
    if (none || off || taken || why.length || n < 30) out.push(`${q.key}: ${none} sem caminho, ${off} fora do chão, ${taken} lugares que o corpo não pode tomar (de ${n})${why.length ? ' — ' + why.join('; ') : ''}`);
    sum.push(`${q.key} ${n} lugares, o mais longe a ${far.toFixed(0)} m`);
  }
  ok('C2 da porta a cada lugar na água de cada piscina, a cada cabide, à fornalha, a cada banco: o caminho do jogo (In.pathIn) existe, passa só por chão onde o corpo fica, e mede o que a tabela diz', !out.length, some(out).join(' / ') || sum.join(' · '));
}

// ================================================================ D: the baths' day in a fake village, with the step's plan
// (as qa/termas-mao.js: only the game's code, no world made; the walk stubbed — a walk is a step to where it goes —, the rest
// the game's: the tasks' machines, G.Depot and the ledger, the world's clock (G.Act.update), and here the plan of the step and
// the interiors' allotter, whole. The stubs are put back when the part ends: the parts after it live in real worlds)
const H = { setTask: (v, t) => { t.age = 0; if (t.st === undefined) t.st = 0; v.task = t; v.actT = 0; return t; }, end: v => G.Vg.endTask(v), move: v => { if (v._go) { v.x = v._go[0]; v.y = v._go[1]; v._go = null; } return true; }, goto: (v, x, y) => { v._go = [x, y]; return true; } };
function fake(fn) {
  const keep = { reaches: G.W.reaches, walkable: G.W.walkable, walkableXY: G.W.walkableXY, planDoor: G.Vg.planDoor, door: G.Vg.door, frontTile: V.frontTile, gotoB: G.Vg.gotoB, FX: G.FX, Talk: G.Talk, H: G.Vg.H, S: G.S };
  G.W.reaches = () => true; G.W.walkable = () => true; G.W.walkableXY = () => true; G.Vg.planDoor = null;
  G.Vg.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; V.frontTile = b => [b.x + b.w - 0.5, b.y + b.h - 0.5];
  G.Vg.gotoB = (v, b) => { v._go = V.frontTile(b); return true; };
  G.FX = new Proxy({}, { get: () => () => undefined }); G.Talk = new Proxy({}, { get: () => () => undefined }); G.Vg.H = H;
  G.inSim++;
  try { return fn(); } finally { G.inSim--; G.W.reaches = keep.reaches; G.W.walkable = keep.walkable; G.W.walkableXY = keep.walkableXY; G.Vg.planDoor = keep.planDoor; G.Vg.door = keep.door; V.frontTile = keep.frontTile; G.Vg.gotoB = keep.gotoB; G.FX = keep.FX; G.Talk = keep.Talk; G.Vg.H = keep.H; G.S = keep.S; In.uncache(); }
}
let vid = 300;
function vila(civ, n, wood) {
  const f = { id: 1, name: 'Povo de teste', alive: true, civ, stock: { food: 120, wood: wood === undefined ? 30 : wood, moedas: 40 }, tech: { known: { moeda: 1 } }, rel: {} };
  const set = { id: 2, name: 'Vila', fac: 1, cx: 10, cy: 10, tier: 3 };
  const B = (id, type, x, y, w, hp) => ({ id, type, x, y, w, h: w, built: true, progress: 1, set: 2, inv: {}, need: { wood: 0, stone: 0 }, incoming: {}, hp, maxHp: hp, ip: null });
  const ba = Object.assign(B((vid += 11), 'banhos', 8, 8, n, 240), { style: civ, esc: n === 5 ? 'termas' : n === 7 ? 'grandes' : 'banhos' });
  const store = B(4, 'storehouse', 20, 8, 2, 140);
  const S = G.S = { day: 3, clock: 600, time: 0.2, nextId: 1000, rng: 4242, buildings: new Map([[ba.id, ba], [4, store]]), villagers: new Map(), factions: new Map([[1, f]]), settlements: new Map([[2, set]]), ships: [], acts: [], ledger: [], ledgerN: 0, loose: [], weather: { rain: 0, storm: 0, drought: 0 }, stats: { foodProduced: 0, woodProduced: 0, stoneProduced: 0 }, history: [], dead: new Map(), milestones: {}, avatar: null, fire: new Float32Array(G.N * G.N), occ: new Int32Array(G.N * G.N) };
  let id = 10;
  const person = (name, coins, o) => {
    const h = B(id++, 'house', 14, 12, 1, 110); h.coin = coins; h.pantry = 10; h.res = 1; S.buildings.set(h.id, h);
    const v = Object.assign({ id: id++, name, set: 2, age: 30, hp: 100, carry: null, purse: 0, home: h.id, job: 0, role: 'coletor', traits: [], x: 9.5, y: 10.3, st: {}, diary: [], hunger: 20, energy: 50, mourn: 0, sick: 0, task: null, actT: 0, inside: 0 }, o || {});
    S.villagers.set(v.id, v); return v;
  };
  for (const h of G.worldHooks) h();
  In.uncache(); ba.ip = In.newRecord(ba, ctx(civ, 'S', n));
  E.ensure(f);
  return { S, f, set, ba, person };
}
// (the checker's rules of the trades and of the thermae, alone — the rest of QA.check wants a whole world —, every second)
const bad = [];
const look = () => { for (const rule of [QA.oficio, QA.termasGrandes]) rule((sys, sev, msg) => { if ((sys === 'oficio' || sys === 'termas') && bad.length < 8 && !bad.includes(`S${sev} ${msg}`)) bad.push(`S${sev} ${msg}`); }, G.S); };
const sec = (n, people, each) => { for (let k = 0; k < n; k++) { G.S.clock += 1; G.S.time = (G.S.time + 1 / G.DAY_LEN) % 1; for (const v of people) { if (!v.task) continue; v.task.age += 1; v.actT += 1; E.run(v, v.task, 1, H); } A.update(1); look(); if (each) each(); } };
const lines = code => G.S.ledger.filter(e => e[8] === code);
const inWater = op => Object.values(op.data.banho).filter(m => m.st === 2).length;
// (where each of them is inside, by the allotter: the use of the place, its piece, its point)
const at = v => { const pl = In.placeOf(v); if (!pl) return null; const p = In.plan(pl.b); const m = pl.it && p ? p.rooms.find(q => q.id === pl.it.room) : null; return { use: pl.use, item: pl.item, kind: pl.it ? pl.it.kind : '', key: `${pl.item}:${pl.q}`, x: pl.x, z: pl.z, fn: m ? m.fn : '' }; };
const nomes = { 5: 'as termas', 7: 'as grandes termas' };
function D1() {
  for (const [civ, n, nb] of [['romano', 5, 10], ['grego', 7, 16]]) fake(() => {
    bad.length = 0; const { S, f, ba, person } = vila(civ, n); const t = In.table(ba); const places = t ? (t.byUse.get('banhar') || []).length : 0; const npools = t ? new Set((t.byUse.get('banhar') || []).map(e => e.it.id)).size : 0;
    const k = person('Foguista', 2, { job: ba.id, role: 'foguista' });
    const c = []; for (let i = 0; i < nb; i++) c.push(person('Banhista ' + (i + 1), 3, i === 1 ? { sick: 60 } : null)); const poor = person('Pobre', 0.05); const all = [k, ...c, poor];
    S.time = 0.1; sec(2, all); const shut = !Te.dia(ba) && !k.task;
    // (the stoker: called to his post by the day of the baths a little before the doors open — D-227: the proof's hand gives
    // him no task, T-929 —, wood from the people's store to the baths, then at the furnace — his place the furnace's, by the
    // allotter)
    const w0 = f.stock.wood; S.time = 0.2; sec(1, all); const t1 = k.task && k.task.type; for (let s = 0; s < 10 && !(k.task && k.task.type === 'fornalha'); s++) sec(1, [k]);
    const got = D.get('b:' + ba.id, 'wood');
    S.time = 0.26; sec(1, all); const op = Te.dia(ba);
    if (!op || !t) { ok(`D1 o dia d${nomes[n]} (${civ})`, false, !t ? 'sem a tabela dos lugares' : 'não abriram'); return; }
    const cold = op.st === 'on' && op.data.calor === 0;
    sec(3, [k]); const t2 = k.task && k.task.type; const kat = at(k); for (let s = 0; s < 8; s++) sec(1, [k]);
    const fire = t1 === 'lenhaTermas' && got === 3 && f.stock.wood === w0 - 3 && t2 === 'fornalha' && op.data.lenha === 2 && op.data.calor > 80 && !!kat && kat.use === 'alimentar' && kat.kind === 'fornalha-banho';
    // (the bathers: who can pay comes — by their own wish, here asked —, pays, undresses at a peg, goes into the water at a place
    // of a pool, bathes, dresses and leaves)
    const tasks = c.map(v => Te.visit(v, ba, H)); const tp = Te.visit(poor, ba, H); const t0 = f.stock.moedas;
    sec(1, all); const inn = c.filter(v => op.data.banho[v.id] && v.inside === ba.id).length; const paid1 = r2(f.stock.moedas - t0);
    const pegs = c.map(at).filter(q => q && q.use === 'despir'); const npegs = (t.byUse.get('despir') || []).length;
    let most = 0, off = 0; const used = new Set(), pools = new Set(); const e0 = c.map(v => v.energy);    sec(3, all); const wet = c.filter(v => v.task && v.task.st === 2 && v.task.use === 'banhar').length;
    const watch = () => { most = Math.max(most, inWater(op)); for (const v of c) if (v.task && v.task.st === 2) { const q = at(v); if (!q || q.use !== 'banhar' || q.kind !== 'piscina') off++; else { used.add(q.key); pools.add(q.item); } } };
    watch(); const keys = c.filter(v => v.task && v.task.st === 2).map(v => (at(v) || {}).key); const twice = keys.length - new Set(keys).size;
    // (each one into the emptiest pool, the hot one first — D-184: with as many bathers as pools or more, people in them all)
    const first = at(c[0]); const spread = pools.size === Math.min(npools, nb) && !!first && first.fn === 'quente';
    if (process.env.VERB) console.log('  na água: ' + c.map(v => { const q = at(v); return `${v.task ? v.task.item : '-'}→${q ? q.item + '@' + q.fn : '-'}`; }).join(' '));
    sec(36, all, watch); const sick = c[1].sick; sec(4, all, watch);
    const outN = c.filter(v => !v.task && !v.inside).length; const book = r2(lines('termas').filter(e => e[5] === 'moedas').reduce((s, e) => s + e[6], 0));
    ok(`D1 o dia d${nomes[n]} (${civ}): abrem na hora, o foguista traz a lenha e fica na fornalha da planta, quem pode pagar vem e paga, despe-se num cabide, entra na água num lugar de piscina — cada um no seu, na piscina mais vazia, a quente primeiro —, banha-se e sai; o caixa é o do livro`,
      shut && cold && fire && tasks.every(q => q && q.type === 'termas') && !tp && inn === nb && paid1 === r2(Te.FEE * nb) && pegs.length === Math.min(nb, npegs) && wet === nb && !twice && !off && spread && most === nb && most <= places && sick < 60 && c.every((v, i) => v.energy > e0[i]) && outN === nb && !Object.keys(op.data.banho).length && Math.abs(book - op.data.receita) < 0.01 && op.data.entradas === nb && op.data.quentes === nb && !bad.length,
      `${places} lugares na água em ${npools} piscinas, ${npegs} cabides; fechadas antes da hora ${shut ? 'sim' : 'NÃO'}, abertas com a água ${cold ? 'fria' : 'QUENTE'}; o foguista: ${t1}, ${got} de lenha junto à fornalha (armazém ${w0} → ${f.stock.wood}), ${t2}, ${kat ? `no lugar de ${kat.use} d${kat.kind === 'fornalha-banho' ? 'a fornalha' : 'e ' + kat.kind}` : 'SEM LUGAR'}, ${op.data.lenha} achas, ${op.data.calor} s de fogo; ${tasks.filter(Boolean).length} de ${nb} vêm, quem não pode pagar ${tp ? 'VEIO' : 'não'}; ${inn} dentro, tesouro +${paid1}; ${pegs.length} num cabide (os outros esperam de pé); na água ${wet}, ${twice} no lugar de outro, ${off} fora de um lugar de piscina, até ${most} juntos em ${pools.size} das ${npools} piscinas, o primeiro na d${first && first.fn === 'quente' ? 'o caldário' : 'e ' + (first ? first.fn : '-')}; a doença de um 60 → ${r2(sick)}; ${outN} saíram; caixa ${op.data.receita}, o livro ${book}; ${op.data.quentes} banhos quentes; ${bad.slice(0, 2).join(' | ') || 'verificador limpo em todos os segundos'}`);
  });
}
function D2() {
  for (const [civ, n] of [['romano', 5], ['classico', 7]]) fake(() => {
    bad.length = 0; const { S, f, ba, person } = vila(civ, n); const t = In.table(ba); const places = t ? (t.byUse.get('banhar') || []).length : 0; const npools = t ? new Set((t.byUse.get('banhar') || []).map(e => e.it.id)).size : 0;
    S.time = 0.3; A.update(1); const op = Te.dia(ba); if (!op || !places) { ok(`D2 a casa cheia n${nomes[n]} (${civ})`, false, 'não abriram, ou sem lugares'); return; }
    // (six more than the places in the water: all let in — nobody is in the water yet —, the places taken one by one, the rest
    // wait undressed; who never gets a place has the entry back and goes — and a late one, with the water full, does not come)
    const nb = places + 6; const c = []; for (let i = 0; i < nb; i++) c.push(person('B' + i, 3)); const t0 = f.stock.moedas;
    for (const v of c) Te.visit(v, ba, H); sec(1, c); const inn = Object.keys(op.data.banho).length;
    let most = 0, off = 0, twice = 0; const pools = new Map(); let fullAt = null, late = 'não perguntado';
    const watch = () => { const w = inWater(op); most = Math.max(most, w); const keys = [];
      for (const v of c) if (v.task && v.task.st === 2) { const q = at(v); if (!q || q.use !== 'banhar') off++; else { keys.push(q.key); pools.set(q.item, Math.max(pools.get(q.item) || 0, 1)); } }
      twice += keys.length - new Set(keys).size;
      if (w === places && fullAt === null) { fullAt = S.clock; const lv = person('Atrasado', 3); late = Te.full(ba) && !Te.visit(lv, ba, H) ? 'não veio' : 'VEIO'; } };
    sec(3, c, watch); const waiting = c.filter(v => v.task && v.task.type === 'termas' && v.task.st === 1);
    // (who is in the water stays — the proof's hand on the length of their bath — past the wait at the pegs: the six who wait
    // dress again, have the entry back, and go; then the baths end as they would)
    for (const v of c) { const m = op.data.banho[v.id]; if (m && m.st === 2) m.dur = 200; } const coin0 = waiting.map(v => S.buildings.get(v.home).coin);
    sec(Te.WAIT + 2, c, watch); const refunded = waiting.filter((v, i) => !op.data.banho[v.id] && !(v.task && v.task.type === 'termas') && r2(S.buildings.get(v.home).coin - coin0[i]) === Te.FEE).length;
    for (const v of c) { const m = op.data.banho[v.id]; if (m && m.st === 2) m.dur = 20; }
    for (let s = 0; s < 80 && c.some(v => v.task); s++) sec(1, c, watch);
    const d = op.data; const back = lines('termas-volta').length; const book = r2(lines('termas').filter(e => e[5] === 'moedas').reduce((s, e) => s + e[6], 0) - lines('termas-volta').reduce((s, e) => s + e[6], 0));
    const bathed = d.quentes + d.frios; const left = c.filter(v => v.task || v.inside).length;
    ok(`D2 a casa cheia n${nomes[n]} (${civ}): ${nb} chegam juntos para ${places} lugares — todas as piscinas se enchem, nunca mais gente na água que os lugares, ninguém no lugar de outro; quem não acha lugar espera nos cabides e recebe a entrada de volta; com a água cheia ninguém mais vem`,
      inn === nb && most === places && pools.size === npools && !off && !twice && waiting.length === 6 && refunded === 6 && late === 'não veio' && bathed === places && d.voltas === 6 && back === 6 && Math.abs(book - d.receita) < 0.01 && Math.abs(r2(f.stock.moedas - t0) - d.receita) < 0.01 && r2(d.receita) === r2(Te.FEE * places) && !left && !bad.length,
      `${inn} dentro; até ${most} na água (${places} lugares), em ${pools.size} de ${npools} piscinas; ${off} fora de um lugar de piscina, ${twice} no lugar de outro; ${waiting.length} esperando nos cabides, ${refunded} com a entrada de volta em casa depois de ${Te.WAIT} s; o atrasado ${late}; ${bathed} banhos e ${d.voltas} entradas de volta (${back} linhas «termas-volta») de ${nb}; caixa ${d.receita}, o livro ${book}, o tesouro +${r2(f.stock.moedas - t0)}; ${left} ainda lá dentro; ${bad.slice(0, 2).join(' | ') || 'verificador limpo em todos os segundos'}`);
  });
}
function D3() {
  fake(() => {
    bad.length = 0; const { S, ba, person } = vila('romano', 7); S.time = 0.3; A.update(1); const op = Te.dia(ba);
    const c = []; for (let i = 0; i < 20; i++) c.push(person('B' + i, 3)); for (const v of c) Te.visit(v, ba, H); sec(4, c);
    const where = () => c.filter(v => v.task && v.task.type === 'termas' && v.task.st === 2 && v.inside === ba.id).map(v => (at(v) || {}).key).sort().join(' ');
    const n0 = inWater(op), w0 = where(); const hook = G.saveHooks.find(h => /termas/.test(String(h.load)) && /banho/.test(String(h.load)));
    // (a save of before the list of who is in: the errands are not saved — everyone in the day's book back in the water)
    for (const v of S.villagers.values()) v.task = null; hook.load({}); const w1 = where();
    // (and a save of now: one called away a moment before it is not put back in the water — L-435 —, the others are, each at
    // a place of a pool again; the plan's table made anew, as after a load)
    const gone = c[0]; G.Vg.setTask(gone, { type: 'idle', pri: 3, wait: 10 }); const sv = {}; hook.save(sv);
    for (const v of S.villagers.values()) v.task = null; In.uncache(); for (const h of G.worldHooks) h(); hook.load(sv);
    const back = !!gone.task && gone.task.type === 'termas'; const rest = c.slice(1).filter(v => v.task && v.task.type === 'termas' && v.task.st === 2 && v.inside === ba.id).length;
    const spots = c.slice(1).map(at); const offW = spots.filter(q => !q || q.use !== 'banhar').length; const twice = spots.length - new Set(spots.map(q => q && q.key)).size;
    sec(40, c.slice(1)); const d = op.data;
    ok('D3 o save no meio do banho nas grandes termas: quem estava na água volta à água, cada um num lugar de piscina (os mesmos lugares); quem tinha saído um momento antes não volta; o dia segue e todos terminam',
      !!op && n0 === 20 && w1 === w0 && w0.split(' ').length === 20 && !back && rest === 19 && !offW && !twice && d.quentes + d.frios === 19 && !Object.keys(d.banho).length && !bad.length,
      `${n0} na água antes; depois do gancho de um save antigo: ${w1 === w0 ? 'os mesmos 20 lugares' : 'OUTROS LUGARES'}; depois de salvar com um chamado para fora: ele ${back ? 'DE VOLTA À ÁGUA' : 'fora'}, ${rest} de 19 na água, ${offW} fora de um lugar de piscina, ${twice} no lugar de outro; ao fim ${d.quentes + d.frios} banhos contados, ${Object.keys(d.banho).length} no livro do dia; ${bad.slice(0, 2).join(' | ') || 'verificador limpo'}`);
  });
}
function D4() {
  for (const [civ, n] of [['romano', 5], ['romano', 7]]) fake(() => {
    bad.length = 0; const { S, f, ba, person } = vila(civ, n); const t = In.table(ba);
    const k = person('Foguista', 2, { job: ba.id, role: 'foguista' }); D.make('b:' + ba.id, 'wood', 2, { code: 'teste' });
    S.time = 0.3; A.update(1); const op = Te.dia(ba);
    const me = person('Corpo', 3); S.avatar = { id: me.id, deeds: {} }; const dr = G.Vg.door(ba); me.x = dr[0]; me.y = dr[1];
    const offer = act => A.offers(me, me.x, me.y, 2.5).find(o => o.def === 'termas' && o.act === act);
    // (in by the offers, the stoker's log by his own, the bath, out: the world's part, as in the classic baths)
    const t0 = f.stock.moedas; const r1 = offer('entrar') ? A.perform(me, offer('entrar')) : { ok: false, why: 'sem oferta' };
    const kf = A.offers(k, dr[0], dr[1], 2.5).find(o => o.def === 'termas' && o.act === 'alimentar'); S.avatar = { id: k.id, deeds: {} }; const rf = kf ? A.perform(k, kf) : { ok: false, why: 'sem oferta' };
    S.avatar = { id: me.id, deeds: {} }; me.inside = ba.id;
    // (the body's place in each pool: free for its hands — In.freeFor —, held once taken — the hand of the proof writes what
    // G.Possess.use writes —, the body's by the allotter, and no one else's: a bather sent into the water never gets it)
    const poolIds = [...new Set((t.byUse.get('banhar') || []).map(e => e.it.id))]; const bather = person('Banhista', 3); let held = 0, mine = 0, stolen = 0, free = 0;
    for (const pid of poolIds) { const e = (t.byUse.get('banhar') || []).find(q => q.it.id === pid); const pl = In.freeFor(ba, e.it.id, e.q); if (!pl) continue; free++;
      S.avatar.use = { b: ba.id, it: pl.item, q: pl.q, use: pl.use, st: pl.st || '', key: In.keyOf(ba), t0: S.clock }; const q = at(me); if (q && q.use === 'banhar' && q.item === pid) mine++;
      bather.inside = ba.id; bather.task = { type: 'termas', id: ba.id, op: op.id, st: 2, use: 'banhar', item: pid, age: 0 }; const o = at(bather); if (o && o.key === `${pl.item}:${pl.q}`) stolen++; if (o && o.use === 'banhar') held++; bather.task = null; bather.inside = 0; }
    // (and with the body in the water the places left are one fewer: the last place is the body's)
    const others = []; const places = (t.byUse.get('banhar') || []).length; for (let i = 0; i < places - 1; i++) { const v = person('B' + i, 3); v.inside = ba.id; v.task = { type: 'termas', id: ba.id, op: op.id, st: 2, use: 'banhar', age: 0 }; op.data.banho[v.id] = { t: S.clock, st: 2, t2: S.clock, hot: 0, dur: 200, paid: 0 }; others.push(v); }
    const fullNow = Te.full(ba) && !In.freePlace(ba, 'banhar'); S.avatar.use = null; const oneLeft = !!In.freePlace(ba, 'banhar');
    for (const v of others) { v.task = null; v.inside = 0; delete op.data.banho[v.id]; }
    const r2b = offer('banhar') ? A.perform(me, offer('banhar')) : { ok: false, why: 'sem oferta' }; const r3 = offer('sair') ? A.perform(me, offer('sair')) : { ok: false, why: 'sem oferta' };
    ok(`D4 o corpo do deus n${nomes[n]}: entra, banha-se e sai pelas ofertas (o foguista põe a lenha pela dele); em cada piscina um lugar livre para as mãos do corpo, dele quando o toma e de mais ninguém; com o corpo na água, um lugar a menos`,
      !!op && r1.ok && rf.ok && r2b.ok && r3.ok && !op.data.banho[me.id] && r2(f.stock.moedas - t0) === Te.FEE && op.data.quentes === 1 && free === poolIds.length && mine === poolIds.length && held === poolIds.length && !stolen && fullNow && oneLeft,
      `entrar ${r1.ok ? 'sim' : r1.why} · fornalha ${rf.ok ? 'sim' : rf.why} · banho ${r2b.ok ? 'sim' : r2b.why} · sair ${r3.ok ? 'sim' : r3.why}; tesouro +${r2(f.stock.moedas - t0)}, ${op ? op.data.quentes : 0} banho quente; ${free} de ${poolIds.length} piscinas com lugar livre para o corpo, ${mine} tomadas por ele, ${stolen} vezes o lugar dele dado a outro (o outro noutro lugar de piscina: ${held}); com o corpo e mais ${places - 1} na água: ${fullNow ? 'cheias' : 'AINDA COM LUGAR'}; sem o corpo: ${oneLeft ? 'um lugar' : 'NENHUM'}`);
    S.avatar = null;
  });
}

// ================================================================ E: standing in a real world
const qaS = () => globalThis.QA.check().filter(q => q.sev <= 2);
const say = L => L.slice(0, 2).map(q => `S${q.sev} ${q.sys}: ${q.msg.slice(0, 110)}`).join('; ');
const townsOf = c => [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id);
const sim = fn => { G.inSim++; try { return fn(); } finally { G.inSim--; } };
// (the nearest lot of n with its ring free, as the god's hand founds, within R of a town's middle, whose ground rises no more
// than the podium covers — 3 m —: the point to found at, or null; as qa/monumental-poder.js)
const flatLot = (set, n, R) => { const S = G.S, W = G.W, N = G.N, T = G.T; const ox = Math.floor(set.cx), oy = Math.floor(set.cy);
  for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - Math.floor(n / 2), y = oy + dy - Math.floor(n / 2); let ok2 = true;
    for (let ty = y - 1; ty <= y + n && ok2; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) { ok2 = false; break; } const i = ty * N + tx;
      if (S.occ[i] || S.wall[i] || S.type[i] < T.SAND || (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0))) { ok2 = false; break; } }
    if (!ok2) continue; let lo = 1e9, hi = -1e9; for (let ty = y; ty <= y + n; ty++) for (let tx = x; tx <= x + n; tx++) { const h = W.hAt(tx, ty); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    if ((hi - lo) * Sp.HM <= 3 + 1e-6) return { x: x + Math.floor(n / 2), y: y + Math.floor(n / 2) };
  }
  return null; };
// (the thermae of the god's hand by a town: where, the plan, the way in, the game's report — on the nearest flat lot when there
// is one within R)
const stand = (set, step, built, R) => {
  const n = Es.steps('banhos').find(s => s.id === step).n; const at = flatLot(set, n, R || 50); const o = at ? { x: at.x, y: at.y, R: 1 } : { R: 60 };
  const b = sim(() => V.handFound(set, 'banhos', step, Object.assign({ built }, o))); const st = G.Civ.idOfFac(set.fac);
  if (!b) return { set, st, none: true };
  const p = In.plan(b); const e = Sp.entryFits(b, In.shellOf(b)); const rep = In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA').map(q => q.what);
  let lo = 1e9, hi = -1e9; for (let y = b.y; y <= b.y + b.h; y++) for (let x = b.x; x <= b.x + b.w; x++) { const h = G.W.hAt(x, y); lo = Math.min(lo, h); hi = Math.max(hi, h); }
  return { set, st, b, flat: !!at, ok: !!(p && p.ok && !rep.length && b.ip.f === FAM && b.w === n && b.esc === step), fits: e.ok, why: [p && p.ok ? '' : 'planta: ' + (p ? p.errs.slice(0, 2).join('; ') : '-'), b.ip.f === FAM ? '' : 'a família ' + b.ip.f, e.ok ? '' : `a entrada não cabe (${e.kind}, o pé a ${e.foot} m)`, rep.slice(0, 2).join('; ')].filter(Boolean).join(', '),
    d: G.dist(b.x + b.w / 2, b.y + b.h / 2, set.cx, set.cy), rel: (hi - lo) * Sp.HM };
};
const tell = r => `${r.set.name} (${r.st}) ${r.b.esc}#${r.b.id} a ${r.d.toFixed(0)} casas, ${r.rel.toFixed(1)} m de desnível${r.ok && (r.fits || !r.flat) ? '' : ': ' + r.why}`;
function E1() {
  // the ready world: the thermae and the great thermae by the god's hand, by the biggest town of each people of the thermae it has
  { M.pronto('metropole'); const q0 = qaS().length; const res = [], none = [];
    for (const c of TERMA) { const set = townsOf(c)[0]; if (!set) continue; for (const [id] of DEG) { const r = stand(set, id, true); if (r.none) none.push(`${set.name}/${id}`); else res.push(r); } }
    // (and the hand founds none for a people with no thermae: nothing to draw nor walk)
    const refused = OUTROS.map(c => { const set = townsOf(c)[0]; if (!set) return null; const b = sim(() => V.handFound(set, 'banhos', 'termas', { built: true, R: 60 }) || V.handFound(set, 'banhos', 'grandes', { built: true, R: 60 })); return [c, !b]; }).filter(Boolean);
    const bad = qaS(); M.viver(20); const bad1 = qaS(); M.salvarCarregar();
    const after = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.built && b.w === r.b.w && b.esc === r.b.esc && b.ip.f === FAM && In.plan(b).ok && In.table(b); }).length; const bad2 = qaS();
    ok('E1a de pé num mundo pronto (a metrópole): as termas e as grandes termas pela mão do deus junto da maior cidade de cada povo da terma — a planta, a família, o relatório, a entrada onde o chão é plano; nenhuma para os outros povos; o verificador; 20 s vividos; salvar e carregar',
      res.length >= 4 && !none.length && res.every(r => r.ok && (r.fits || !r.flat)) && res.some(r => r.flat) && refused.length >= 1 && refused.every(q => q[1]) && q0 === 0 && !bad.length && !bad1.length && !bad2.length && after === res.length && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(' · ')})${none.length ? '; SEM LOTE: ' + none.join(', ') : ''}; os outros povos: ${refused.map(q => `${q[0]} ${q[1] ? 'nenhuma' : 'FUNDOU'}`).join(', ')}; o verificador S0–S2: ${q0} antes, ${bad.length} com elas, ${bad1.length} depois de 20 s, ${bad2.length} depois do save${bad.concat(bad1, bad2).length ? ' (' + say(bad.concat(bad1, bad2)) + ')' : ''}; ${after} de ${res.length} iguais depois de salvar e carregar${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
  // a new world: both steps by the first town of each people of the thermae, a year of the world with them standing, a save
  { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const q0 = qaS().length; const res = []; const here = TERMA.filter(c => townsOf(c).length);
    for (const c of here) for (const [id] of DEG) { const r = stand(townsOf(c)[0], id, true, 40); if (!r.none) res.push(r); }
    const bad = qaS(); M.saltar(1); const bad1 = qaS(); const alive = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.built && b.type === 'banhos' && In.plan(b) && In.plan(b).ok; }).length;
    const days = G.S.acts.filter(op => op.def === 'termas' && res.some(r => r.b.id === op.at)).length;
    M.salvarCarregar(); const bad2 = qaS();
    ok('E1b de pé num mundo novo: os dois degraus junto da cidade de cada povo da terma que o mundo tem — a planta, o relatório, o verificador; um ano do mundo com elas de pé (o dia dos banhos aberto pelo mundo); salvar e carregar',
      here.length >= 2 && res.length === 2 * here.length && res.every(r => r.ok && (r.fits || !r.flat)) && q0 === 0 && !bad.length && !bad1.length && !bad2.length && alive === res.length && days >= 1 && M.limpo(),
      `os povos da terma com cidade: ${here.join(', ')}; ${res.length} de ${2 * here.length} de pé (${res.map(tell).join(' · ')}); o verificador S0–S2: ${q0} antes, ${bad.length} com elas, ${bad1.length} depois de um ano, ${bad2.length} depois do save${bad.concat(bad1, bad2).length ? ' (' + say(bad.concat(bad1, bad2)) + ')' : ''}; ${alive} de pé e com planta depois do ano, ${days} dias dos banhos no livro das operações${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
}
// (the real day, as qa/termas.js has the classic baths': the stoker by the god's hand — one of the town who stays, held at the
// trade while the case lasts —, wood in the people's store, the morning before the opening; the bathers grown townsfolk with
// the entry at home, by the door of the city's leisure — G.Termas.visit —, their errand held above the day's calls)
const sails = k => !!(k && G.Expe && G.Expe.memberOf && G.Expe.memberOf(k.id));
// (the oracle of a cave sits in it until the afternoon, whatever he is told: with the clock held at the opening hour, a stoker
// who is the oracle never comes for the wood — T-806)
const oracle = k => !!(G.Caves && G.Caves.U && ((G.Caves.U() || {}).caves || []).some(cv => cv.oracle && cv.oracle.id === k.id));
function stokerFor(b) {
  const f = G.Fac.get(V.facOfSet(b.set));
  const v = [...G.S.villagers.values()].filter(o => o.set === b.set && o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && !o.ug && !sails(o) && !oracle(o) && o.role !== 'guerreiro' && !(f && f.leader === o.id) && D.strength(o) > 0 && !(G.S.avatar && G.S.avatar.id === o.id)).sort((a, c) => (!!a.job - !!c.job) || a.id - c.id)[0];
  if (!v) return null; G.Vg.endTask(v); v.role = 'foguista'; v.job = b.id; return v.id;
}
function bathersFor(b, n, pri) {
  const out = [];
  for (const v of [...G.S.villagers.values()].sort((a, c) => a.id - c.id)) {
    if (out.length >= n) break;
    if (v.set !== b.set || v.age < 16 || v.age > 60 || v.captive || v.jail || v.aboard || v.sleeping || v.inside || (v.task && (v.task.pri || 0) > 1) || v.role === 'foguista' || (v.carry && v.carry.n > 1e-6) || v.merchant) continue;
    const t = Te.visit(v, b); if (t) { t.kind = 'work'; t.leisure = true; if (pri) t.pri = pri; out.push(v.id); }
  }
  return out;
}
function realDay(key, world, c, step, nb) {
  M.pronto(world); M.viver(12); const set = townsOf(c)[0]; if (!set) { ok(`${key} um dia de verdade`, false, `${world}: nenhuma cidade ${c}`); return; }
  const q0 = qaS().length; const r = stand(set, step, true); if (r.none || !r.ok) { ok(`${key} um dia de verdade`, false, r.none ? `${set.name}: sem lote` : r.why); return; }
  const bid = r.b.id; const kid = sim(() => stokerFor(r.b)); const B = () => G.S.buildings.get(bid); const fid = V.facOfSet(set.id);
  const hold = () => { const v = G.S.villagers.get(kid); if (v && !v.captive && (v.role !== 'foguista' || v.job !== bid)) { v.role = 'foguista'; v.job = bid; } G.S.weather.rain = 0; if (G.S.weather.storm) G.S.weather.storm = 0; };
  const seen = []; const tap = e => { seen.push(e); }; D.onMove.push(tap);
  const places = In.slots(B(), 'banhar').length; const t = In.table(B()); const npools = new Set((t.byUse.get('banhar') || []).map(e => e.it.id)).size;
  let bad = []; const watchQ = () => { for (const q of qaS()) { const m = `S${q.sev} ${q.sys}: ${q.msg.slice(0, 110)}`; if (bad.length < 6 && !bad.includes(m)) bad.push(m); } };
  const live = (secs, until, each) => { for (let k = 0; k < secs; k++) { sim(hold); M.viver(1); if (each) each(); if (k % 5 === 4) watchQ(); if (until && until()) return true; } return false; };
  sim(() => { if (D.free('f:' + fid, 'wood') < 40) D.make('f:' + fid, 'wood', 40, { code: 'teste', part: true }); G.S.time = Te.horas(B()).abre - 0.02; for (const v of G.S.villagers.values()) if (v.id === kid) G.Vg.endTask(v); });
  const opened = live(30, () => !!Te.dia(B())); const op = Te.dia(B()); if (!op) { ok(`${key} um dia de verdade`, false, `${set.name}: as termas não abriram`); D.onMove.splice(D.onMove.indexOf(tap), 1); return; }
  const opId = op.id; const O = () => A.get(opId);
  // (the wood kept in the store until the furnace is lit — the test's hand, as the e3 of qa/termas.js: the town's works take it —,
  // and the clock held at the opening hour meanwhile: the lot of the god's hand may be far from the store, 51 tiles in Argos)
  const t1 = G.S.time; live(200, () => O().data.lenha >= 1 || !A.live(O()), () => sim(() => { if (D.free('f:' + fid, 'wood') < 30) D.make('f:' + fid, 'wood', 40, { code: 'teste', part: true }); if (G.S.time > t1) G.S.time = t1; }));
  const lit = A.live(O()) && O().data.lenha >= 1;
  // (the bathers of the day: the town's grown folk free at the opening and, while there are fewer than four, the ones who come
  // free in the next seconds, the clock held at the opening — Roma of the metropole of the generation 25 has 31 people, and at
  // the opening three were free, two asleep and the rest at their errands: «3 chamados», T-1168)
  const ids = sim(() => bathersFor(B(), nb, 2.9)); const t2 = G.S.time;
  for (let k = 0; k < 40 && ids.length < Math.min(nb, 4); k++) { live(1); sim(() => { G.S.time = t2; for (const id of bathersFor(B(), nb - ids.length, 2.9)) ids.push(id); }); }
  const tw = G.S.time;
  let most = 0, off = 0, twice = 0, strangers = 0, over = 0, mid = null, midN = 0; const pools = new Set(), fns = new Set(); const who = new Set();
  const each = () => { const o = O(); if (!A.live(o)) return; const b = B(); const inW = []; for (const id of ids) { const v = G.S.villagers.get(id); if (v && v.task && v.task.type === 'termas' && v.task.st === 2 && v.inside === bid) inW.push(v); }
    most = Math.max(most, inW.length); if (inW.length > places) over++; const keys = [];
    for (const v of inW) { const q = at(v); if (!q || q.use !== 'banhar' || q.kind !== 'piscina') off++; else { keys.push(q.key); pools.add(q.item); fns.add(q.fn); who.add(v.id); } }
    twice += keys.length - new Set(keys).size;
    for (const id of Object.keys(o.data.banho)) { const v = G.S.villagers.get(+id); if (v && v.set !== b.set && !o.data.banho[id].body) strangers++; }
    // (the clock held in the morning until half of the called are through the door — the lot of the god's hand may be far from
    // the houses, and the question is the bath, not the length of the walk —; a save taken with three in the water)
    if (o.data.entradas < Math.ceil(ids.length / 2) && G.S.time > tw) G.S.time = tw;
    if (!mid && inW.length >= 3) { mid = G.Save.serialize(); midN = inW.length; } };
  live(260, () => !A.live(O()), each);
  const o = O(); const d = o.data; D.onMove.splice(D.onMove.indexOf(tap), 1);
  const paid = r2(seen.filter(e => e[7] === opId && e[5] === 'moedas' && (e[8] === 'termas' || e[8] === 'termas-volta')).reduce((s, e) => s + (e[8] === 'termas' ? e[6] : -e[6]), 0));
  const logs = r2(seen.filter(e => e[7] === opId && e[8] === 'fornalha' && e[5] === 'wood').reduce((s, e) => s + e[6], 0));
  const left = [...G.S.villagers.values()].filter(v => v.inside === bid && v.task && v.task.type === 'termas').length; const coin = Te.withCoin(B());
  // (the save of the middle loaded twice: the same future — the day's book, the world's chance, who is in the water and where)
  const digest = () => { const q = A.get(opId); return q ? JSON.stringify([q.st, q.data.entradas, q.data.receita, q.data.lenha, q.data.calor, q.data.quentes, q.data.frios, Object.keys(q.data.banho).sort(), ids.map(id => { const v = G.S.villagers.get(id); const w = v && v.inside === bid ? at(v) : null; return w ? w.key : ''; }), G.S.rng]) : 'sem o dia'; };
  const run = () => { M.reseed(4242); G.Save.apply(JSON.parse(mid)); G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); const inW0 = ids.filter(id => { const v = G.S.villagers.get(id); return v && v.task && v.task.type === 'termas' && v.task.st === 2 && v.inside === bid && (at(v) || {}).use === 'banhar'; }).length; for (let k = 0; k < 40; k++) { sim(hold); M.viver(1); } return [inW0, digest()]; };
  const a = mid ? run() : null, a2 = mid ? run() : null; const bad2 = mid ? qaS() : [];
  ok(`${key} um dia de verdade n${nomes[r.b.w]} de ${set.name} (${c}, ${world}): abrem na hora, o foguista acende a fornalha com a lenha do armazém, os banhistas vêm pelos próprios pés, pagam, entram na água — cada um num lugar de piscina, em mais de uma piscina, nunca mais que os lugares —, fecham na hora e ninguém fica; o caixa e a lenha são os do livro; um save no meio, carregado duas vezes, vive o mesmo futuro`,
    opened && lit && ids.length >= Math.min(nb, 4) && !A.live(o) && o.st === 'ok' && d.entradas >= 3 && d.lenha >= 1 && d.quentes >= 1 && most >= 3 && !over && !off && !twice && !strangers && pools.size >= 2 && fns.has('quente') && !left && Math.abs(paid - (coin ? d.receita : 0)) < 0.01 && Math.abs(logs - d.lenha) < 0.01 && !!mid && a[0] === midN && a[1] === a2[1] && q0 === 0 && !bad.length && !bad2.length && M.limpo(),
    `${tell(r)}; ${places} lugares na água em ${npools} piscinas; ${ids.length} chamados, ${d.entradas} entradas (${d.quentes} banhos quentes, ${d.frios} frios), ${who.size} banharam-se num lugar de piscina, até ${most} juntos em ${pools.size} piscinas (${[...fns].join(', ')}); ${over} vezes mais gente que lugares, ${off} fora de um lugar de piscina, ${twice} no lugar de outro, ${strangers} de fora; caixa ${d.receita}, o livro ${paid}${coin ? '' : ' (povo sem moeda)'}; lenha ${d.lenha}, o livro ${logs}; ${left} lá dentro depois (${o.st}${o.end ? ', ' + o.end.why : ''}); o save no meio com ${midN} na água: ${a ? `${a[0]} de volta na água, ${a[1] === a2[1] ? 'o mesmo futuro duas vezes' : 'FUTUROS DIFERENTES'}` : 'NÃO TIRADO'}; o verificador S0–S2: ${q0} antes, ${bad.length + bad2.length} durante e depois${bad.concat(bad2.map(q => q.msg)).length ? ' (' + bad.concat(bad2.map(q => String(q.msg).slice(0, 100))).slice(0, 2).join('; ') + ')' : ''}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}
function E2() { realDay('E2a', 'metropole', 'grego', 'termas', 14); }
function E3() { realDay('E2b', 'metropole', 'romano', 'grandes', 14); }

// ================================================================ F: the town raises it by itself
// (people by the proof's hand, about the town's middle, until it has n — no town of a people of the thermae in the ready worlds
// has the 120 the ladder asks: T-820. Boys and girls of ten to fifteen: they count among its people and are not grown ones
// without a home — a town with those builds its houses before its great work, V.vez —, so the builders go to the thermae)
const peopleUp = (set, n) => sim(() => { let k = 0; while (V.pop(set.id) < n && k++ < 600) { const p0 = G.W.nearestLand(set.cx + G.rr(-6, 6), set.cy + G.rr(-6, 6), 5); if (p0) G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 10 + G.R() * 5, g: k % 2 ? 'm' : 'f' }); } return V.pop(set.id); });
const chosen = set => Es.choose(set, 'banhos').map(s => s.id).join(' > ');
function F1() {
  M.pronto('metropole'); const set = [].concat(...TERMA.map(townsOf)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
  if (!set) { ok('F1 a cidade funda as termas sozinha', false, 'a metrópole sem cidade de um povo da terma'); return; }
  const f = G.Fac.get(set.fac); const st = Es.steps('banhos').find(s => s.id === 'termas'); const q0 = qaS().length;
  // (as the world has it: a town below the step's people does not justify it — its ladder gives the classic baths alone —,
  // one at it does: with the step at 80 people, D-161, the biggest town of the ready world is already past it, and the
  // witness of the «not yet» is the biggest of these peoples' towns still below)
  const pop0 = V.pop(set.id), c0 = chosen(set); const want0 = pop0 >= st.req.pop ? 'termas > banhos' : 'banhos';
  const small = [].concat(...TERMA.map(townsOf)).filter(s => V.pop(s.id) < st.req.pop).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0]; const cs = small ? chosen(small) : '';
  const pop1 = peopleUp(set, st.req.pop + 5), c1 = chosen(set);
  // (it justifies and cannot pay — no stone in store, none coming in: the proof's hand on the people's income —: the town's own
  // door founds the classic baths)
  const inc = V.stoneIncome; const stone0 = f.stock.stone || 0; let poor = null, cant = true;
  sim(() => { if (stone0 > 0) D.use('f:' + f.id, 'stone', stone0, { code: 'teste', mine: true }); V.stoneIncome = () => 0; try { cant = !V.affords(set, 'banhos', st); set._noSite = {}; poor = V.startProject(set, 'banhos'); } finally { V.stoneIncome = inc; } });
  const poorTxt = poor ? `${poor.esc} de ${poor.w} casas` : 'nada (sem lote)';
  // (and with the stone for it — in store, by the proof's hand —: the thermae, by the town's own door; their bill the step's)
  let b = null; sim(() => { D.make('f:' + f.id, 'stone', 400, { code: 'teste', part: true }); set._noSite = {}; b = V.startProject(set, 'banhos'); });
  const can = V.affords(set, 'banhos', st); const bill = Es.bill('banhos', st);
  // (the work the step's, and the earth of its lot if the foundation levelled it — D-217 —; the stone the step's, less the brick
  // in its place (D-075) and the stone of the rocks its lot had, broken into the work at once (D-121, on the site, «pedreira»):
  // the thermae of Roma in the metrópole of the generation 21 rose on a lot with 64,6 of earth moved and 54 of stone in rocks —
  // «285.2 de trabalho» for the step's 156, and 24 of stone and 52 of brick to come of 130, T-1097)
  const rocks0 = b ? D.get('o:' + b.id, 'stone') || 0 : 0; const billSt = b ? (b.need.stone || 0) + (b.brick ? b.brick.n : 0) + rocks0 : 0;
  const billOk = !!b && !b.built && billSt <= bill.cost.stone + 1e-6 && billSt >= bill.cost.stone * 0.6 && V.workOf(b) === bill.work + (b.terra || 0) * V.EARTH;
  const need0 = b ? `${JSON.stringify(b.need)}${b.brick ? ` (${b.brick.n} de ${b.brick.k} no lugar de pedra)` : ''}${rocks0 ? ` e ${r2(rocks0)} de pedra das rochas do lote já na obra` : ''}` : '';
  const p = b ? In.plan(b) : null; const bad = qaS();
  // (the town's own builders at it: years of the world, until it stands — six at the most; then its day opens by the world)
  let years = 0, prog = b ? b.progress : 0; const id = b ? b.id : 0; const B = () => G.S.buildings.get(id);
  if (b) while (years < 6 && B() && !B().built) { sim(() => { if ((f.stock.stone || 0) < 150) D.make('f:' + f.id, 'stone', 200, { code: 'teste', part: true }); if ((f.stock.wood || 0) < 60) D.make('f:' + f.id, 'wood', 100, { code: 'teste', part: true }); }); M.saltar(1); years++; }
  const up = !!(B() && B().built); const prog1 = B() ? B().progress : 0; const bad1 = qaS();
  const days = up ? G.S.acts.filter(op => op.def === 'termas' && op.at === id).length : 0; const keeper = up && Te.keeperOf(B());
  ok('F1 a cidade ergue as termas sozinha (a metrópole, a maior cidade de um povo da terma): como o mundo a tem, a cidade abaixo da gente do degrau não o justifica; com a gente dele (a mão da prova, se falta), justifica; sem pedra nem renda, a porta da cidade funda os banhos clássicos; com a pedra, as termas — a conta e o trabalho do degrau, a família da forma —, e os pedreiros da cidade as levantam',
    c0 === want0 && (small ? cs === 'banhos' : pop0 < st.req.pop) && pop1 >= st.req.pop && c1 === 'termas > banhos' && cant && (!poor || (poor.w === 2 && poor.esc === 'banhos')) && can && !!b && b.w === 5 && b.esc === 'termas' && b.ip.f === FAM && billOk && !!p && p.ok && q0 === 0 && !bad.length && (up || prog1 > prog) && !bad1.length && M.limpo(),
    `${set.name} (${G.Civ.idOfFac(set.fac)}): ${pop0} pessoas (o degrau pede ${st.req.pop}), escolhe «${c0}»${small ? `; ${small.name}, com ${V.pop(small.id)}, «${cs}»` : ''}; com ${pop1}, «${c1}»; sem pedra nem renda (pode pagar: ${cant ? 'não' : 'SIM'}): funda ${poorTxt}; com a pedra (pode pagar: ${can ? 'sim' : 'NÃO'}): ${b ? `${b.esc} de ${b.w} casas #${b.id}, a ${G.dist(b.x + b.w / 2, b.y + b.h / 2, set.cx, set.cy).toFixed(0)} casas do meio, a conta na fundação ${need0} de ${JSON.stringify(bill.cost)}, ${V.workOf(b)} de trabalho (o do degrau, ${bill.work}${b.terra ? `, e o da terra do lote aplainado, ${b.terra}` : ''}), a família ${b.ip.f}, a planta ${p && p.ok ? 'de pé' : 'NÃO'}` : 'NADA'}; os pedreiros: ${up ? `de pé em ${years} ano(s); ${days} dia(s) dos banhos abertos pelo mundo${keeper ? `, o foguista ${keeper.name} dado pela cidade` : ', ainda sem foguista'}` : `em ${years} anos a obra foi de ${(prog * 100).toFixed(0)}% a ${(prog1 * 100).toFixed(0)}% (falta trazer ${JSON.stringify(B() ? B().need : {})}${B() && B().unreach ? ', os pedreiros não a alcançam' : ''}) — não a vi acabar: T-821`}; o verificador S0–S2: ${q0} antes, ${bad.length} na fundação, ${bad1.length} depois${bad.concat(bad1).length ? ' (' + say(bad.concat(bad1)) + ')' : ''}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}
function F2() {
  M.pronto('metropole'); const sets = [].concat(...TERMA.map(townsOf)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id); const st = Es.steps('banhos').find(s => s.id === 'termas');
  // (a town of a people of the thermae with its classic baths standing — the world's own, or by the god's hand —, a day of them
  // open with people in the water)
  // (the baths the world has there with room to grow round them; else classic baths by the god's hand in the middle of free
  // ground — the Rome of the metropolis has its own shut in by its houses, with no lot of 5 round them: it would not enlarge)
  let set = null, b = null, byHand = false; const shut = [];
  for (const s of sets) { const have = [...G.S.buildings.values()].find(q => q.set === s.id && q.type === 'banhos' && q.built && q.w === 2); if (!have) continue; if (V.growLot(s, have, st)) { set = s; b = have; break; } shut.push(s.name); }
  // (by the hand: the nearest free spot of the town where baths of 2 would have a lot of 5 round them by the town's own rules —
  // V.growLot —, in a town whose planner could enlarge them: of the rank for it, with no public work under way; else any)
  const N = G.N, T = G.T; const spot = s => { for (let r = 0; r <= 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = Math.floor(s.cx) + dx, y = Math.floor(s.cy) + dy; let free = true;
    for (let ty = y - 1; ty <= y + 2 && free; ty++) for (let tx = x - 1; tx <= x + 2; tx++) { const i = ty * N + tx; if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2 || G.S.occ[i] || G.S.wall[i] || G.S.type[i] < T.SAND || G.S.road[i] >= 2 || G.S.fire[i] > 0) { free = false; break; } }
    if (free && V.growLot(s, { id: -1, type: 'banhos', x, y, w: 2, h: 2, set: s.id, built: true }, st)) return [x, y]; } return null; };
  const calm = s => ((s.tier || 0) >= 2 && !Object.keys(V.counts(s.id).siteTypes).some(k => G.BDEF[k] && G.BDEF[k].civic) ? 0 : 1);
  if (!b) for (const s of sets.slice().sort((a, c) => calm(a) - calm(c))) { const at = spot(s); if (!at) continue; const q = sim(() => V.handFound(s, 'banhos', 'banhos', { built: true, x: at[0] + 1, y: at[1] + 1, R: 0 })); if (q && V.growLot(s, q, st)) { set = s; b = q; byHand = true; break; } if (q) sim(() => V.removeBuilding(q)); }
  if (!b) { ok('F2 a cidade amplia os banhos', false, 'nenhuma cidade de um povo da terma com banhos clássicos e lote de 5 casas em volta deles'); return; }
  const f = G.Fac.get(set.fac); const id = b.id; const fam0 = b.ip.f; const B = () => G.S.buildings.get(id); const q0 = qaS().length;
  sim(() => { G.S.time = Te.horas(b).abre + 0.02; G.S.weather.rain = 0; }); const op = openDay(B());
  const ids = op ? sim(() => bathersFor(B(), 6, 2.9)) : []; let inside = 0; for (let k = 0; k < 90 && op && A.live(op); k++) { const t0 = G.S.time; M.viver(1); if (G.S.time > t0 && G.S.time > 0.5) G.S.time = 0.5; inside = Object.keys(op.data.banho).length; if (inside >= 2) break; }
  sim(() => D.make('b:' + id, 'wood', 2, { code: 'teste' })); const wood0 = D.get('b:' + id, 'wood');
  // (the town grown — the proof's hand —, with the stone: its planner's own door, V.grow, enlarges the baths it has, in place)
  const pop1 = peopleUp(set, st.req.pop + 5); let g = null, how = 'V.grow';
  sim(() => { D.make('f:' + f.id, 'stone', 400, { code: 'teste', part: true }); set._noSite = {}; g = V.grow(set, f, V.counts(set.id));
    if (!g) { const pos = V.growLot(set, B(), st); how = `V.enlarge (V.grow não ampliou: nível ${set.tier}, ${Object.keys(V.counts(set.id).siteTypes).join(',') || 'sem obras'}, ${pos ? 'com lote' : 'SEM LOTE'})`; if (pos) g = V.enlarge(B(), st, pos); } });
  const b1 = B(); const amp = !!g && g === b1 && !b1.built && b1.w === 5 && b1.esc === 'termas' && !!b1.amp && b1.amp.de === 2 && b1.ip.f === FAM && In.nOf(b1.ip) === 5;
  const ended = !op || !A.live(op); const stuck = [...G.S.villagers.values()].filter(v => v.inside === id || (v.task && v.task.type === 'termas' && v.task.id === id)).length;
  const bill = Es.bill('banhos', st), bill0 = Es.bill('banhos', Es.classic('banhos')); const more = b1 && b1.need ? (b1.need.stone || 0) + (b1.brick ? b1.brick.n : 0) : -1;
  const bad = qaS(); M.salvarCarregar(); const b2 = B(); const kept = !!b2 && !b2.built && b2.w === 5 && b2.esc === 'termas' && !!b2.amp && b2.ip.f === FAM; const bad1 = qaS();
  // (finished — the proof's hand on the work —: the thermae with their plan, what the baths had by the furnace still there, and
  // the next morning the day opens in them)
  sim(() => V.completeBuilding(B())); const b3 = B(); const p = In.plan(b3); const t = In.table(b3); const wood1 = D.get('b:' + id, 'wood');
  sim(() => { G.S.day++; G.S.time = Te.horas(b3).abre + 0.02; }); M.viver(2); const op2 = Te.dia(B()); const bad2 = qaS();
  ok('F2 a cidade que cresceu amplia os banhos clássicos que tinha, no lugar (D-116): o dia aberto acaba e todos saem, o mesmo prédio vira a obra das termas — o lote, o degrau, a família da forma, a conta só do que cresce —; salva no meio, continua; acabada, é as termas com a sua planta e o que tinha junto à fornalha, e abre na manhã seguinte',
    !!op && amp && ended && !stuck && more > 0 && more <= bill.cost.stone - bill0.cost.stone && kept && b3.built && b3.w === 5 && b3.esc === 'termas' && !!p && p.ok && !!t && (t.byUse.get('banhar') || []).length >= 20 && wood1 === wood0 && !!op2 && op2.id !== op.id && q0 === 0 && !bad.length && !bad1.length && !bad2.length && M.limpo(),
    `${set.name} (${G.Civ.idOfFac(set.fac)}): os banhos #${id}${byHand ? ' (pela mão do deus, em chão livre)' : ' (os do mundo)'}${shut.length ? ` — os de ${shut.join(', ')} não têm lote de 5 casas em volta` : ''}, a família ${fam0}; o dia aberto com ${inside} lá dentro (${ids.length} chamados); com ${pop1} pessoas e a pedra: ${g ? how : 'NÃO AMPLIOU (' + how + ')'}; a obra: ${b1.w} casas, ${b1.esc}, ${b1.built ? 'PRONTA' : 'em obra'}, a família ${b1.ip.f}, a conta ${JSON.stringify(b1.need)} (o que cresce: até ${bill.cost.stone - bill0.cost.stone} de pedra), ${(b1.progress * 100).toFixed(0)}% já de pé; o dia ${ended ? 'acabou' : 'SEGUE'}, ${stuck} ainda lá dentro; depois do save ${kept ? 'a mesma obra' : 'OUTRA COISA'}; acabada: a planta ${p && p.ok ? 'de pé' : 'NÃO'}, ${t ? (t.byUse.get('banhar') || []).length : 0} lugares na água, a lenha ${wood0} → ${wood1}; na manhã seguinte ${op2 ? 'abertas' : 'FECHADAS'}; o verificador S0–S2: ${q0} antes, ${bad.length} na obra, ${bad1.length} depois do save, ${bad2.length} acabada${bad.concat(bad1, bad2).length ? ' (' + say(bad.concat(bad1, bad2)) + ')' : ''}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
}

// ================================================================ G: the bad cases
// (the day of baths just raised, opened by the world: its list of the town's buildings by type is made again in a few seconds —
// the clock held in the morning meanwhile, half a minute at the most)
const openDay = b => { const t0 = G.S.time; for (let k = 0; k < 30 && !Te.dia(b); k++) { M.viver(1); if (G.S.time > t0) G.S.time = t0; } return Te.dia(b); };
function G1() {
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const out = [], said = []; const here = TERMA.filter(c => townsOf(c).length);
  if (here.length < 2) { ok('G1 os casos ruins', false, `o mundo novo com ${here.length} povos da terma`); return; }
  const found = (set, step, built) => sim(() => V.handFound(set, 'banhos', step, { built, R: 40 }));
  // (a) the work of the great thermae saved in the middle, loaded and finished: its lot, its step, its bill, its plan
  { const set = townsOf(here[0])[0]; const b = found(set, 'grandes', false); if (!b) out.push('a obra das grandes termas sem lote');
    else { const id = b.id; const bill = Es.bill('banhos', Es.steps('banhos').find(s => s.id === 'grandes')); const need = (b.need.stone || 0) + (b.brick ? b.brick.n : 0);
      if (need > bill.cost.stone || need < bill.cost.stone * 0.6 || V.workOf(b) !== bill.work + (b.terra || 0) * V.EARTH) out.push(`a conta da obra: ${JSON.stringify(b.need)} e ${V.workOf(b)} de trabalho (o degrau: ${JSON.stringify(bill.cost)}, ${bill.work}${b.terra ? `; a terra aplainada: ${b.terra}` : ''})`);
      M.salvarCarregar(); const b1 = G.S.buildings.get(id); const q1 = qaS();
      if (!b1 || b1 === b || b1.built || b1.w !== 7 || b1.esc !== 'grandes') out.push(`a obra depois do save: ${b1 ? `${b1.w} casas, ${b1.esc}, ${b1.built ? 'pronta' : 'em obra'}` : 'sumiu'}`);
      else { sim(() => V.completeBuilding(b1)); const p = In.plan(b1); if (!p || !p.ok || b1.ip.f !== FAM || !In.table(b1)) out.push(`a obra acabada: ${b1.ip ? b1.ip.f : 'sem registro'}, ${p && p.ok ? 'planta ok' : 'planta NÃO: ' + (p ? p.errs.slice(0, 2).join('; ') : '-')}`); }
      if (q1.length) out.push(`o verificador no meio da obra: ${say(q1)}`);
      said.push(`a obra das grandes termas (${here[0]}) salva no meio — o save devolve as 7 casas, o degrau e a conta — e acabada: a família da forma, a planta, os lugares`); } }
  // (b) the god razes the thermae with people in the water: the day ends there, everyone out, the ruin with its plan; saved
  { const set = townsOf(here[1])[0]; const b = found(set, 'termas', true); if (!b) out.push('as termas sem lote');
    else { const id = b.id; sim(() => { G.S.time = Te.horas(b).abre + 0.02; G.S.weather.rain = 0; D.make('b:' + id, 'wood', 3, { code: 'teste' }); }); const op = openDay(b);
      const ids = op ? sim(() => bathersFor(b, 5, 2.9)) : []; let had = 0; for (let k = 0; k < 120 && op && A.live(op); k++) { const t0 = G.S.time; M.viver(1); if (G.S.time > t0 && G.S.time > 0.5) G.S.time = 0.5; had = Object.values(op.data.banho).filter(m => m.st === 2).length; if (had >= 1) break; }
      const seen = []; const tap = e => { seen.push(e); }; D.onMove.push(tap); const shelf = D.list('b:' + id);
      sim(() => V.destroyBuilding(b, 'deus')); M.viver(3); D.onMove.splice(D.onMove.indexOf(tap), 1);
      const r = G.S.buildings.get(id); const p = r && In.plan(r); const stuck = [...G.S.villagers.values()].filter(v => v.inside === id || (v.task && v.task.type === 'termas' && v.task.id === id)).length;
      const gone = {}; for (const e of seen) if (e[3] === 'b:' + id && e[8] === 'ruina') gone[e[5]] = r2((gone[e[5]] || 0) + e[6]); const lost = Object.keys(shelf).filter(k => k !== 'moedas' && Math.abs((shelf[k] || 0) - (gone[k] || 0)) > 0.01);
      if (!op) out.push('as termas não abriram'); else if (!had) out.push(`ninguém chegou à água (${ids.length} chamados)`);
      if (op && (A.live(op) || op.st !== 'int')) out.push(`o dia depois da derrubada: ${op.st}`); if (stuck) out.push(`${stuck} ainda dentro ou a caminho`); if (lost.length) out.push(`a prateleira não saiu pelo livro: ${lost.join(', ')}`);
      if (!r || r.type !== 'ruin' || !p || !p.ok) out.push(`a ruína: ${r ? r.type : 'sumiu'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`);
      M.salvarCarregar(); const r1 = G.S.buildings.get(id); const p1 = r1 && In.plan(r1);
      if (r && (!r1 || r1.type !== 'ruin' || r1.w !== r.w || !p1 || !p1.ok)) out.push(`a ruína depois do save: ${r1 ? `${r1.type}, ${r1.w} casas` : 'sumiu'}`);
      said.push(`as termas (${here[1]}) derrubadas pelo deus com ${had} na água: o dia acaba ali («${op && op.end ? op.end.why : '-'}»), todos fora, a lenha da prateleira sai pelo livro (${JSON.stringify(gone)}), a ruína com a sua planta, salva e carregada`); } }
  // (c) the stoker dies with the fire lit: the fire burns down, nobody feeds it
  { const set = townsOf(here[0])[0]; const b = found(set, 'termas', true); if (!b) out.push('as termas do foguista sem lote');
    else { const id = b.id; const kid = sim(() => stokerFor(b)); sim(() => { G.S.day++; G.S.time = Te.horas(b).abre + 0.02; D.make('b:' + id, 'wood', 3, { code: 'teste' }); }); const op = openDay(G.S.buildings.get(id));
      for (let k = 0; k < 90 && op && A.live(op) && op.data.lenha < 1; k++) { sim(() => { const v = G.S.villagers.get(kid); if (v && (v.role !== 'foguista' || v.job !== id)) { v.role = 'foguista'; v.job = id; } }); const t0 = G.S.time; M.viver(1); if (G.S.time > t0 && G.S.time > 0.4) G.S.time = 0.4; }
      const lit = op ? op.data.lenha : 0; const k = G.S.villagers.get(kid); if (k && op && A.live(op)) sim(() => V.kill(k, 'teste', true));
      let rose = 0, last = op ? op.data.calor : 0; for (let s = 0; s < 30 && op && A.live(op); s++) { M.viver(1); const nk = Te.keeperOf(G.S.buildings.get(id)); if (op.data.calor > last + 1e-6 && !(nk && nk.id !== kid)) rose++; last = op.data.calor; }
      if (!op || lit < 1) out.push(`a fornalha não acendeu (${lit} achas)`); else if (rose) out.push(`o fogo subiu ${rose} vezes sem foguista`);
      said.push(`o foguista morto com ${lit} acha(s) queimada(s): o fogo só baixou`); } }
  const bad = qaS(); if (bad.length) out.push(`o verificador: ${say(bad)}`);
  ok('G1 os casos ruins num mundo novo: a obra das grandes termas salva no meio e acabada; as termas derrubadas pelo deus com gente na água; o foguista que morre com o fogo aceso; o verificador limpo', !out.length && M.limpo(), out.length ? out.join(' / ') : said.join('; ') + (M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)));
}
// (a save of before the bigger steps — the ready worlds are such saves —: every baths of it open as they were, the lot, the
// step, the record's family and its facts; none grown by the load, their plans standing; A4 has the plans themselves)
function G2() {
  const raw = key => { const data = {}; const got = G.Ready.got; G.Ready.got = (k, s) => { data[k] = s; }; try { M.run('worlds/' + key + '.js'); } finally { G.Ready.got = got; } return JSON.parse(data[key]); };
  const out = [], sum = [];
  for (const key of ['metropole', 'cidade', 'mega']) {
    let o; try { o = raw(key); } catch (e) { sum.push(`${key}: não há`); continue; }
    const olds = (o.buildings || []).filter(b => b.type === 'banhos' || (b.type === 'ruin' && b.origType === 'banhos')).map(b => ({ id: b.id, type: b.type, w: b.w, esc: b.esc, built: b.built, f: b.ip && b.ip.f, r: b.ip && b.ip.r, n: b.ip && b.ip.n, set: b.set }));
    // (the step the save had: a save of before the new steps has every bath of 2 tiles; the ready worlds of the generation 21 are
    // saves of after them, and the mega's has thermae of 5 standing — «1 sem planta, 1 de outro tamanho», T-1097. A bath of the
    // save keeps the lot it had; one bigger than 2 that the save did not have is one enlarged by the load)
    M.abrir(o); M.viver(2); let dif = 0, noPlan = 0; const big = [...G.S.buildings.values()].filter(b => b.type === 'banhos' && b.w !== 2 && !olds.some(q => q.id === b.id)).length;
    for (const q of olds) { const b = G.S.buildings.get(q.id); if (!b || b.type !== q.type || b.w !== q.w || b.esc !== q.esc || !!b.built !== !!q.built || (b.ip && b.ip.f) !== q.f || (b.ip && b.ip.r) !== q.r) { dif++; if (out.length < 3) out.push(`${key} #${q.id}: ${JSON.stringify(q)} → ${b ? JSON.stringify({ type: b.type, w: b.w, esc: b.esc, built: b.built, f: b.ip && b.ip.f, r: b.ip && b.ip.r }) : 'sumiu'}`); }
      else if (b.type === 'banhos' && b.built) { const p = In.plan(b); if (!p || !p.ok || Es.of(b).n !== q.w) noPlan++; } }
    const bad = qaS(); if (dif || noPlan || big || bad.length) out.push(`${key}: ${dif} banhos diferentes do save, ${noPlan} sem planta, ${big} de outro tamanho${bad.length ? '; o verificador: ' + say(bad) : ''}`);
    sum.push(`${key}: ${olds.length} banhos (${olds.filter(q => q.w !== 2).length} de mais de 2 casas), todos como no save`);
  }
  ok('G2 um save abre igual (os mundos prontos): cada banho com o lote que o save tinha — de 2 casas num save de antes dos degraus novos —, o seu degrau, a família e a versão do registro que o save tinha, a planta de pé; nenhum ampliado ao carregar; o verificador limpo', !out.length && sum.some(s => / [1-9]\d* banhos/.test(s)) && M.limpo(), out.length ? out.join(' / ') : sum.join(' · ') + (M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)));
}

// ================================================================ H: the checker catches the lie
function H1() {
  fake(() => {
    const seen = () => { const L = []; QA.termasGrandes((sys, sev, msg) => { L.push(`S${sev} ${msg}`); }, G.S); return L; }; const out = [], said = [];
    for (const n of [2, 5]) {
      const { S, ba, person } = vila('romano', n); S.time = 0.3; A.update(1); const op = Te.dia(ba); const t = In.table(ba); const places = (t.byUse.get('banhar') || []).length;
      const put = k => { const L = []; for (let i = 0; i < k; i++) { const v = person('B' + i, 3); v.inside = ba.id; v.task = { type: 'termas', id: ba.id, op: op.id, st: 2, use: 'banhar', age: 0 }; op.data.banho[v.id] = { t: S.clock, st: 2, t2: S.clock, hot: 0, dur: 200, paid: 0 }; L.push(v); } return L; };
      // (as many in the water as the places: nothing said; one more — the proof's hand —: the S2 of the places)
      const L = put(places); const quiet = seen(); const extra = put(1); const lie = seen(); extra[0].task = null; extra[0].inside = 0; delete op.data.banho[extra[0].id]; const quiet2 = seen();
      if (quiet.length || quiet2.length || !lie.some(m => /^S2 .*na água e \d+ lugares de banhar/.test(m))) out.push(`${n} casas: cheias ${quiet.length ? 'ACUSOU (' + quiet[0] + ')' : 'nada'}, um a mais ${lie.length ? lie[0] : 'NADA'}, de volta ${quiet2.length ? 'ACUSOU' : 'nada'}`);
      else said.push(`os banhos de ${n} casas com ${places} na água: nada; com ${places + 1}: «${lie[0].slice(0, 90)}»`);
      // (one in the water at a place that is no pool's — the task's use changed under the book —: the S3)
      L[0].task.use = 'despir'; const wrong = seen(); L[0].task.use = 'banhar';
      if (!wrong.some(m => /^S3 .*fora de um lugar de banhar/.test(m))) out.push(`${n} casas: na água num cabide: ${wrong.length ? wrong[0] : 'NADA'}`); else said.push('na água fora de piscina: o S3');
    }
    // (the thermae with no furnace's place, with too few pools: the S2 of the step — the table's list emptied by the proof's hand)
    { const { ba } = vila('grego', 7); const t = In.table(ba); const quiet = seen(); const al = t.byUse.get('alimentar'); t.byUse.delete('alimentar'); const noFire = seen(); t.byUse.set('alimentar', al);
      const w = t.byUse.get('banhar'); const one = w[0].it.id; t.byUse.set('banhar', w.filter(e => e.it.id === one)); const onePool = seen(); t.byUse.set('banhar', w); const quiet2 = seen();
      if (quiet.length || quiet2.length || !noFire.some(m => /^S2 .*NENHUMA fornalha/.test(m)) || !onePool.some(m => /^S2 .*com 1 piscinas/.test(m))) out.push(`as grandes termas: inteiras ${quiet.length + quiet2.length ? 'ACUSOU' : 'nada'}, sem fornalha ${noFire[0] || 'NADA'}, com uma piscina ${onePool[0] || 'NADA'}`);
      else said.push('as grandes termas sem o posto do foguista, ou com uma piscina só: o S2 do degrau; inteiras: nada'); }
    ok('H1 as regras do verificador (qa/termas-grandes-inv.js) pegam a mentira e calam com a verdade: mais gente na água que os lugares (S2), alguém na água fora de piscina (S3), as termas sem fornalha ou com uma piscina só (S2)', !out.length, out.length ? out.join(' / ') : said.join('; '));
  });
  // (and the rule of the bigger steps' family — qa/poder-inv.js — catches the thermae laid out by a recipe's family)
  { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const c = TERMA.find(q => townsOf(q).length); const set = c && townsOf(c)[0];
    const b = set && sim(() => V.handFound(set, 'banhos', 'termas', { built: true, R: 40 })); const mine = () => globalThis.QA.check().filter(q => q.sys === 'poder' || q.sys === 'termas' || q.sys === 'escala');
    if (!b) { ok('H2 a regra da família do degrau', false, 'sem lote para as termas'); return; }
    const quiet = mine().length; const f0 = b.ip.f; b.ip.f = 'w-salao.terreo'; const caught = mine().filter(q => q.sys === 'poder' && /forma\.banhos/.test(q.msg)); b.ip.f = f0;
    // (the record's version turned with the lot written and with it written back, as the game's own doors turn it — In.resized —:
    // the plan and the places' table are kept by it)
    const n0 = b.ip.n; b.ip.n = 2; b.ip.r++; const lot = mine().filter(q => q.sys === 'escala'); b.ip.n = n0; b.ip.r++; const quiet2 = mine().length;
    ok('H2 as regras dos degraus (qa/poder-inv.js, qa/escala-inv.js) valem para as termas: o registro numa família de receita, ou com o lote dos banhos clássicos, é acusado; com a verdade, nada', !quiet && caught.length === 1 && lot.length >= 1 && !quiet2,
      `as termas de ${set.name} (${c}): ${quiet} avisos; com a família w-salao.terreo: ${caught.length ? caught[0].msg.slice(0, 120) : 'NADA'}; com o registro de 2 casas: ${lot.length ? lot[0].msg.slice(0, 100) : 'NADA'}; de volta: ${quiet2}`); }
}
const PARTS = { A1, A2, A3, A4, A5, B1, B2, B3, B4, B5, B6, B7, C1, C2, D1, D2, D3, D4, E1, E2, E3, F1, F2, G1, G2, H: H1 };
for (const k of Object.keys(PARTS)) if (want(k)) PARTS[k]();
const err = M.erros(); ok('erros', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TERMAS-GRANDES: FALHOU (${fails.join(', ')})` : 'TERMAS-GRANDES: ok');
process.exit(fails.length ? 1 : 0);
