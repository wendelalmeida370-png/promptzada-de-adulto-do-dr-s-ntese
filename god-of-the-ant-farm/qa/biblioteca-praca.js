// biblioteca-praca: as plantas da biblioteca e da praça (fase E do Patch 2, P4) provadas em Node, sem mundo, sobre o código
// do jogo (M.load):
//   1. a biblioteca se arma em todo povo e lado, nas famílias do salão: as estantes de rolos (o inventário do prédio), as mesas
//      de leitura — um leitor de cada lado onde nada mais está; três leitores ao menos —, a mesa do escriba do copista; um
//      lugar livre para ler, escrever e guardar (o G.Biblioteca do P2 pergunta ao repartidor)
//   2. a praça se arma em todo povo e lado: casca aberta, sem paredes nem telhado, no chão (Space.BASELESS); a fonte no meio,
//      um banco de cada lado virado para ela, a pedra de falar de um lado (quem fala fica em cima dela, virado para o povo),
//      os lugares de quem ouve em arco diante dela, virados para ela, e os de quem para para conversar, dois a dois nos cantos,
//      um de frente para o outro — todos onde o corpo fica; um lugar livre para beber, sentar, falar, ouvir e conversar
//   3. a fonte, os bancos e a pedra vão com a casca (shellOut.yard): o deus e o 3D de longe os desenham onde o corpo e o povo
//      os usam — a casca sozinha igual à da planta inteira
//   4. o corpo pisa a praça em volta da fonte (Space.inBody, a grade da planta), não dentro dela
//   node qa/biblioteca-praca.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors, Sp = G.Space;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | biblioteca-praca ${name} | ${info}`); if (!c) fails.push(name); };
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N) };
const POVOS = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const rec = (t, c, f, s) => ({ v: 4, f, r: 0, t, u: In.TYPES[t].use, s, o: 3, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 });
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
let nid = 61001;
const made = [];
for (const t of ['biblioteca', 'praca']) for (const c of POVOS) {
  const fam = In.familiesFor(rec(t, c, '', 'S'));
  for (const f of fam.ok) for (const s of ['S', 'E', 'N', 'W']) {
    const b = { id: (nid += 41), type: t, x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = rec(t, c, f, s);
    const p = In.makeFam(b, b.ip, f); G.S.buildings.set(b.id, b); made.push({ t, c, s, f, b, p, so: In.shellOf(b), nfam: fam.ok.length });
  }
}
const free = (m, uses) => uses.filter(u => !In.freePlace(m.b, u));
// ---------------------------------------------------------------- 1. the library
{
  const L = made.filter(m => m.t === 'biblioteca'); const bad = L.filter(m => !m.p.ok);
  const per = POVOS.map(c => `${c} ${(L.find(m => m.c === c) || { nfam: 0 }).nfam}`).join(', ');
  ok('1a a biblioteca se arma em todo povo e lado, nas famílias do salão', L.length && !bad.length && POVOS.every(c => L.some(m => m.c === c)), `${L.length - bad.length} de ${L.length} plantas; famílias por povo: ${per}${bad.length ? '; ' + bad.slice(0, 2).map(m => `${m.c} ${m.f}: ${m.p.errs.slice(0, 2).join(' | ')}`).join(' / ') : ''}`);
  // (two tables at least, each with a reader at least — a reader on either side where nothing else stands —, three readers in all)
  const short = L.filter(m => m.p.ok).map(m => { const n = k => m.p.items.filter(i => i.kind === k).length; const T = m.p.items.filter(i => i.kind === 'mesa-leitura'); const rd = T.map(i => i.spots.filter(q => q.use === 'ler').length); return n('estante') >= 2 && T.length >= 2 && n('mesa-escriba') >= 1 && rd.every(x => x >= 1) && rd.reduce((a, x) => a + x, 0) >= 3 ? null : `${m.c} ${m.f}: estantes ${n('estante')}, mesas ${T.length} (leitores ${rd.join('+')}), escriba ${n('mesa-escriba')}`; }).filter(Boolean);
  const miss = L.filter(m => m.p.ok).map(m => { const x = free(m, ['ler', 'escrever', 'guardar']); return x.length ? `${m.c} ${m.s}: sem ${x.join(', ')}` : null; }).filter(Boolean);
  ok('1b as estantes, as mesas de leitura (três leitores ao menos) e a mesa do escriba; um lugar livre para ler, escrever e guardar', !short.length && !miss.length, short.concat(miss).slice(0, 3).join(' / ') || `${L.length} plantas`);
}
// ---------------------------------------------------------------- 2. the square
{
  const Q = made.filter(m => m.t === 'praca'); const bad = Q.filter(m => !m.p.ok);
  ok('2a a praça se arma em todo povo e lado: casca aberta, no chão', Q.length && !bad.length && Q.every(m => !m.p.ok || (m.p.shell.kind === 'aberta' && !m.p.shell.roof)) && Sp.baseless({ type: 'praca' }), `${Q.length - bad.length} de ${Q.length} plantas${bad.length ? '; ' + bad[0].p.errs.slice(0, 2).join(' | ') : ''}`);
  const out = [];
  for (const m of Q.filter(q => q.p.ok)) {
    const p = m.p; const n = k => p.items.filter(i => i.kind === k);
    const st = n('tribuna')[0]; const ouvir = (p.marks || []).find(q => q.use === 'ouvir'), conv = (p.marks || []).find(q => q.use === 'conversar');
    if (n('fonte').length !== 1 || n('banco').length !== 2 || !st || !ouvir || !conv) { out.push(`${m.c} ${m.s}: as peças`); continue; }
    // (who listens faces the stone; who talks faces the other of the pair; all where a body stands)
    const sp = st.spots.find(q => q.use === 'falar'); const face = (q, x, z) => { const a = Math.atan2(x - q.x, z - q.z); return Math.abs(Math.atan2(Math.sin(a - q.ry), Math.cos(a - q.ry))) < 0.2; };
    if (!ouvir.pts.every(q => q.ok && face(q, sp.x, sp.z))) out.push(`${m.c} ${m.s}: quem ouve não olha a pedra`);
    for (let k = 0; k < conv.pts.length; k += 2) { const a = conv.pts[k], c = conv.pts[k + 1]; if (!a.ok || !c.ok || !face(a, c.x, c.z) || !face(c, a.x, a.z)) { out.push(`${m.c} ${m.s}: um par que não se olha`); break; } }
    const x = free(m, ['beber', 'sentar', 'falar', 'ouvir', 'conversar']); if (x.length) out.push(`${m.c} ${m.s}: sem ${x.join(', ')}`);
  }
  ok('2b a fonte, os bancos, a pedra de falar; quem ouve virado para a pedra, quem conversa um para o outro; um lugar livre de cada uso', !out.length, out.slice(0, 3).join(' / ') || `${Q.length} plantas`);
}
// ---------------------------------------------------------------- 3. the square's pieces with the shell
{
  const Q = made.filter(m => m.t === 'praca' && m.p.ok); const all = made.filter(m => m.p.ok);
  const diff = all.filter(m => !m.so || strip(m.so) !== strip(In.shellOfPlan(m.p)));
  const pieces = Q.filter(m => !(m.so.yard && m.so.yard.length === 4 && ['fonte', 'banco', 'banco', 'tribuna'].every(k => m.so.yard.some(q => q.kind === k))));
  ok('3a a fonte, os bancos e a pedra na casca (o deus e o 3D de longe); a casca sozinha igual à da planta', !diff.length && !pieces.length, `${diff.length} cascas diferentes da planta (de ${all.length}); ${pieces.length} praças sem as peças na casca`);
}
// ---------------------------------------------------------------- 4. the body on the square
{
  const m = made.find(q => q.t === 'praca' && q.p.ok && q.s === 'S'); const p = m.p; const fo = p.items.find(i => i.kind === 'fonte');
  const c = [(fo.r[0] + fo.r[2]) / 2, (fo.r[1] + fo.r[3]) / 2];
  const onSq = Sp.inBody(p.shell, 0, 1.0, 1.0) && In.standsAt(p, 0, 1.0, 1.0, 0.25), round = In.standsAt(p, 0, c[0], fo.r[3] + 0.5, 0.25), inFont = In.standsAt(p, 0, c[0], c[1], 0.25);
  ok('4a o corpo pisa a praça e a volta da fonte, não dentro dela', onSq && round && !inFont, `no canto ${onSq}, junto da fonte ${round}, dentro da fonte ${inFont}`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
