// monumental-poder: as provas da Arquitetura Monumental do especialista M2 (poder, fé e convívio — PLANO.md §7), no formato do
// qa/monumental.js (uma função por teste, a linha «PASSOU | monumental X …» / «FALHOU | …»; o líder as junta). Em Node, sobre o
// código do jogo. Por ora a B, os palácios — o palácio (6 casas, 24 m) e o palácio colossal (10 casas, 40 m) do grego, do romano,
// do egípcio e do nórdico, a forma de js/forma-poder.js e a planta pela forma (int-palacio.js, a família forma.palacio):
//   B1 a forma de cada povo e tamanho: o lote, o pé dentro dele, a altura, o risco; o degrau oferecido só a quem tem a forma
//      daquele tamanho (G.Escala.can); as formas dos povos diferentes entre si (a parte H dos palácios)
//   B2 a planta em todo povo, tamanho e lado: válida pela família da forma (a que o tipo oferece ali), a mesma duas vezes, a casca
//      de longe a da planta, o tempo de fazê-la
//   B3 o palácio contra a casa: a área do lote e a do chão dos cômodos ≥ 30 vezes as da casa
//   B4 o salão do trono: ≥ 14 × 9 m e ≥ 9 m de pé-direito, o trono contra o fundo, a audiência diante dele, alcançada da porta
//   B5 os pátios: o colossal com dois (o de dentro e o de honra), abertos ao céu, sem piso sobre eles
//   B6 a escadaria: da rua ao pódio pelos degraus da forma — espelho ≤ 0,30 m, piso ≥ 0,28 m, ≥ 1,2 m de largura —, a entrada no
//      alto dela; o parapeito (≥ 0,9 m) onde o pódio cai mais de 1 m
//   B7 os lugares: da guarda (vigiar, o armeiro), dos funcionários (as mesas dos escribas, a do conselho), dos visitantes (os
//      bancos, a audiência), dos aposentos (as camas) — cada um alcançado da porta
//   B8 as regras do corpo: a porta da rua e a principal ≥ 2,2 m; as escadas que os pés sobem (D-086); os peitoris de cima ≥ 0,9 m
//   B9 os pés da rua para dentro, a cada 2 cm, num mundo em branco: subindo os degraus da forma até o pódio, nunca um degrau que
//      o corpo não sobe, nunca uma queda
//   B10 de pé no mundo: o colossal pela mão do deus num mundo pronto (G.Village.handFound, R 60) e os oito num mundo novo, perto
//      das suas cidades — a planta, a entrada (Space.entryFits), o relatório, o verificador limpo, salvar e carregar
//   B11 os casos ruins num mundo novo: a obra do colossal salva e carregada no meio e acabada; o deus que derruba o palácio (a
//      ruína da planta); o verificador limpo em cada passo — e a sua regra nova (qa/poder-inv.js) pega um palácio grande com a
//      planta de uma família da receita
// E a D, os templos — o templo (4 casas), o grande templo (6) e o santuário monumental (8) dos mesmos quatro povos, o risco de
// js/forma-poder.js (riscoTemplo) e a planta pela forma (int-palacio.js, templeByForm, a família forma.templo):
//   D1 a forma de cada povo e tamanho, o degrau só a quem a tem; as formas dos povos diferentes em cada tamanho (a H)
//   D2 a planta em todo povo, tamanho e lado pela família da forma (a do registro novo e do catálogo); o santuário da aldeia com
//      a sua; a mesma duas vezes; a casca; o tempo da planta; a tabela dos lugares do monumental (In.table) a tempo
//   D3 o santuário monumental contra o da aldeia do mesmo povo: o lote e o chão coberto ≥ 9 vezes
//   D4 a nave ≥ 10 × 16 m e ≥ 8 m de altura, o altar alcançado da porta
//   D5 os lugares de rezar — os bancos, as esteiras dos povos que se ajoelham, de pé diante do templo —: ≥ 40 no monumental,
//      cada um alcançado da porta; o lugar de oficiar
//   D6 a escadaria, a entrada no alto dela, o parapeito onde o pódio cai mais de 1 m, a porta da rua e o portal ≥ 2,2 m
//   D7 os pés da rua até dentro da nave, a cada 2 cm, num mundo em branco
//   D8 de pé no mundo: o monumental pela mão do deus na metrópole e os três degraus de cada povo num mundo novo, um ano, salvar
//      e carregar, o verificador limpo
//   D9 os casos ruins: a obra salva no meio e acabada, o grande templo derrubado, a regra do verificador
// E a F, a taverna — a taverna (3 casas) e a hospedaria (4) dos seis povos: a taverna não tem forma, os degraus maiores são a
// planta do lote do tamanho (TYPES.taverna.sizes), a estalagem de int-familias.js, na sua família (estalagem.andar):
//   F1 a escada oferecida a todo povo pela planta do tamanho
//   F2 a planta em todo povo, tamanho e lado (a família do registro novo e do catálogo); a taberna de 8 m com as suas; a mesma
//      duas vezes; a casca; o tempo da planta; a tabela dos lugares da hospedaria
//   F3 a hospedaria: o salão ≥ 10 × 8 m, ≥ 8 mesas, a cozinha com o fogo, o depósito das pipas, o balcão; ≥ 20 sentados
//   F4 as regras do corpo: o portão e a porta do salão ≥ 2,2 m, a escada, os quartos de cima alcançados
//   F5 de pé no mundo (a hospedaria na metrópole, com os lugares da tabela do mundo; as duas num mundo novo, um ano, o save)
//   F6 os casos ruins: a obra salva no meio, a taverna derrubada, a regra do verificador
// E a G, as casas — a cabana e a casa de 4 m continuam; a casa rica (domus, 2 casas, o degrau de uma família) de int-familias.js
// (a casa do pátio, mobiliada como toda casa: furnishHome), na sua família (domus.patio):
//   G1 a cabana e a casa com 4 × 4 m, as famílias de antes
//   G2 a casa rica: o degrau de uma família, o lote de 8 × 8 m, a planta em todo povo, lado e riqueza; a família abrigada (≥ 6
//      lugares de dormir), o fogo, o pátio aberto; a mesma duas vezes, a casca, o tempo, a tabela dos lugares
//   G3 de pé no mundo (a metrópole e um mundo novo: a planta, o verificador, um ano, a derrubada, salvar e carregar; o degrau
//      oferecido só à família; a regra do verificador)
//   node qa/monumental-poder.js [B1,…,D1,…,F1,…,G1,…]      VERB=1: cada caso que falha
'use strict';
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/escala-inv.js', 'qa/poder-inv.js'] });
const In = G.Interiors, Fo = G.Forma, Sp = G.Space, Es = G.Escala;
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumental ${name} | ${info}`); if (!c) fails.push(name); };
const some = L => (process.env.VERB ? L : L.slice(0, 3));
const clock = () => Number(process.hrtime.bigint() / 1000n) / 1000;
const POVOS = ['grego', 'romano', 'egipcio', 'nordico'], OUTROS = ['asteca', 'classico'], LADOS = ['S', 'E', 'N', 'W'];
const PAL = [['palacio', 6], ['palacio_colossal', 10]];
const FAM = 'forma.palacio';
const rec = (t, c, s, n, f) => ({ v: In.REC_V, f: f || '', r: 0, t, u: In.TYPES[t].use, s, o: (1 << n) - 1, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0, n });
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const area = r => (r[2] - r[0]) * (r[3] - r[1]);
const riskOf = (t, c, n) => In.riskOf(Fo.of(t, c, n));
// (the plans of every people, size and side, on a world of nothing: made once, read by the tests)
G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N), occ: new Int32Array(G.N * G.N) };
let nid = 96001; const made = []; const times = [];
for (const [t, n] of PAL) for (const c of POVOS) for (const s of LADOS) {
  const b = { id: (nid += 41), type: t, style: c, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec(t, c, s, n, FAM);
  const t0 = clock(); const p = In.makeFam(b, b.ip, FAM); times.push({ ms: clock() - t0, k: `${t}/${c}/${s}` });
  G.S.buildings.set(b.id, b); made.push({ t, n, c, s, b, p, so: In.shellOf(b) });
}
const tag = m => `${m.t}/${m.c}/${m.s}`;
const want = k => !ONLY || ONLY.includes(k);
// (the metres of the plan's walk from its way in to a point of a storey — In.walkField, the walk for a body, the flights by their
// length —; Infinity where the door does not reach it. Read off the plan made: the table of the places the world shares out
// (In.places) is not asked — for a plan of 24 to 40 m it takes seconds, the engine's to mend: M2's report)
const fields = new WeakMap();
const walkTo = (p, lv, x, z) => { let W = fields.get(p); if (!W) fields.set(p, W = In.walkField(p)); const D = W.D[lv]; if (!D) return Infinity; const n = W.n, k = 2; const cx = Math.floor(x / In.CS), cz = Math.floor(z / In.CS); let best = Infinity;
  for (let dz = -k; dz <= k; dz++) for (let dx = -k; dx <= k; dx++) { const X = cx + dx, Z = cz + dz; if (X < 0 || Z < 0 || X >= n || Z >= n) continue; const m = D[Z * n + X]; if (m < best) best = m; } return best; };
// (the places of a use, standing where the body is (ok) — the plan's own fitting, from the door —, and the nearest one's walk)
const placesOf = (p, use) => { const out = []; for (const it of p.items) for (const sp of it.spots) if (sp.use === use && sp.ok) out.push({ lv: it.lv, x: sp.x, z: sp.z, on: sp.on, it });
  for (const M of p.marks || []) if (M.use === use) for (const q of M.pts) if (q.ok) out.push({ lv: M.lv, x: q.x, z: q.z }); return out; };
const reachOf = (p, use) => { let best = Infinity; for (const q of placesOf(p, use)) { if (q.on) { for (const sp of q.it.spots) if (!sp.on && sp.ok) best = Math.min(best, walkTo(p, q.lv, sp.x, sp.z)); } else best = Math.min(best, walkTo(p, q.lv, q.x, q.z)); } return best; };

// ---------------------------------------------------------------- B1: the forms
function B1() {
  const out = [], sum = [];
  for (const [t, n] of PAL) for (const c of POVOS) {
    const F = Fo.of(t, c, n); if (!F) { out.push(`${t}/${c}: sem forma de ${n}`); continue; }
    const R = In.riskOf(F); const L = n * 4; const why = [];
    if (Math.abs(F.L - L) > 1e-9) why.push(`a forma de ${F.L} m num lote de ${L}`);
    if (!R) why.push('sem o risco');
    for (const f of Fo.foot(F)) { const r = f.k === 'circ' ? [f.c[0] - f.r, f.c[1] - f.r, f.c[0] + f.r, f.c[1] + f.r] : f.r; if (r[0] < -1e-6 || r[1] < -1e-6 || r[2] > L + 1e-6 || r[3] > L + 1e-6) { why.push(`um pé fora do lote (${r.map(x => x.toFixed(2)).join(', ')})`); break; } }
    if (!Es.can(t, c, n)) why.push('o degrau não oferecido');
    if (why.length) out.push(`${t}/${c}: ${why.join(', ')}`);
    sum.push(`${t === 'palacio' ? 'P' : 'C'}/${c} ${F.top.toFixed(1)} m`);
  }
  for (const [t, n] of PAL) for (const c of OUTROS) if (Es.can(t, c, n) || Fo.has(t, c, n)) out.push(`${t}/${c}: o degrau de ${n} oferecido sem a forma do povo`);
  ok('B1a a forma de cada povo e tamanho: o lote, o pé dentro dele, o risco; o degrau só a quem tem a forma', !out.length, some(out).join(' / ') || `as alturas: ${sum.join(', ')}; o asteca e o clássico sem o degrau (a forma deles fica para depois)`);
  // (H: the forms of the peoples differ — their masses, their tops)
  const sig = c => { const F = Fo.of('palacio_colossal', c, 10); const k = {}; for (const m of Fo.mass(F)) k[m.k] = (k[m.k] || 0) + 1; return JSON.stringify(k) + ':' + F.top.toFixed(1); };
  const sigs = POVOS.map(sig); const same = POVOS.filter((c, i) => sigs.indexOf(sigs[i]) !== i);
  ok('B1b as formas dos povos diferentes entre si (a parte H dos palácios)', !same.length && new Set(sigs).size >= 3, `${new Set(sigs).size} formas diferentes em ${POVOS.length} povos${same.length ? '; iguais: ' + same.join(', ') : ''}`);
}
// ---------------------------------------------------------------- B2: the plans
function B2() {
  const bad = made.filter(m => !m.p.ok);
  // (the family a new record of the step is given — what the world does —; and what the catalogue offers there: a bigger step
  // read with the classic one's row where In.familiesFor's second key has no size — said, the leader's to mend)
  const offer = [], cat = []; let k = 0;
  for (const [t, n] of PAL) for (const c of POVOS) { const b = { id: 97101 + 13 * (k++), type: t, style: c, x: 8, y: 8, w: n, h: n };
    const r = In.newRecord(b, { t, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n }); if (r.f !== FAM) offer.push(`${t}/${c}: ${r.f}`);
    const fam = In.familiesFor(r); if (!fam.ok.includes(FAM)) cat.push(`${t}/${c}: ${fam.ok.join(',') || 'nenhuma'} (${(fam.gen[FAM] || fam.arch[FAM] || '').slice(0, 60)})`); }
  ok('B2a a planta em todo povo, tamanho e lado, pela família da forma — a que o mundo dá ao registro do degrau', !bad.length && !offer.length, `${made.length - bad.length} de ${made.length} plantas${bad.length ? '; ' + some(bad).map(m => `${tag(m)}: ${m.p.errs.slice(0, 2).join('; ')}`).join(' / ') : ''}${offer.length ? '; os registros: ' + offer.join(' · ') : ''}${cat.length ? `; o catálogo responde pela linha do degrau clássico em ${cat.length} (In.familiesFor, a 2ª chave sem o tamanho: ${cat.slice(0, 2).join(' · ')})` : '; o catálogo oferece a da forma em todos'}`);
  // (the classic steps keep theirs: the palace of 3 its form's hall or the recipe's, the colossal of 5 the recipe's)
  const cl = []; for (const c of POVOS) { const a = In.familiesFor(rec('palacio_colossal', c, 'S', 5)).ok; if (a.includes(FAM) || !a.length) cl.push(`colossal/${c} de 5: ${a.join(',')}`); const b = In.familiesFor(rec('palacio', c, 'S', 3)).ok; if (!b.length) cl.push(`palácio/${c} de 3: nenhuma`); }
  ok('B2b os degraus clássicos ficam com as suas plantas (o colossal de 5 com as da receita)', !cl.length, cl.join(' · ') || 'o colossal de 5 sem a família da forma; o palácio de 3 com as suas');
  const diff = made.filter(m => m.p.ok).filter(m => { const q = In.makeFam(m.b, m.b.ip, FAM); return JSON.stringify([q.rooms, q.items.map(i => [i.kind, i.x, i.z, i.ry]), q.doors, q.holes]) !== JSON.stringify([m.p.rooms, m.p.items.map(i => [i.kind, i.x, i.z, i.ry]), m.p.doors, m.p.holes]); });
  ok('B2c a mesma planta duas vezes da mesma entrada', !diff.length, `${diff.length} diferentes${diff.length ? ': ' + some(diff).map(tag).join(', ') : ''}`);
  const sh = made.filter(m => m.p.ok && (!m.so || strip(m.so) !== strip(In.shellOfPlan(m.p))));
  ok('B2d a casca de longe igual à da planta', !sh.length, `${sh.length} cascas diferentes${sh.length ? ': ' + some(sh).map(tag).join(', ') : ''}`);
  const ts = times.slice().sort((a, b) => b.ms - a.ms); const med = times.map(q => q.ms).sort((a, b) => a - b)[times.length >> 1];
  // (the dearest made again, warm, three times: the least is its cost — the first ones paid the engine's warming)
  const again = ts.slice(0, 3).map(q => { const m = made.find(x => tag(x) === q.k); let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(m.b, m.b.ip, FAM); best = Math.min(best, clock() - a); } return [q.k, best]; }).sort((a, b) => b[1] - a[1]);
  ok('B2e o tempo de fazer a planta (alvo: 400 ms em Node)', again[0][1] < 400, `a mais cara ${again[0][1].toFixed(0)} ms (${again[0][0]}, sem cache); a mediana ${med.toFixed(0)} ms na rodada`);
}
// ---------------------------------------------------------------- B3: the palace against the house
function B3() {
  // (the house of each people, its own: a record of the world's, its plan; its floor the rooms with a roof, every storey)
  const floor = p => p.rooms.filter(m => !m.open).reduce((a, m) => a + area(m.r), 0); const house = {}; let hid = 99001;
  for (const c of POVOS) { const hb = { id: (hid += 7), type: 'house', style: c, x: 30, y: 30, w: 1, h: 1, built: true }; hb.ip = In.newRecord(hb, { t: 'house', c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: 1, n: 1 }); const hp = In.make(hb, hb.ip); house[c] = hp.ok ? floor(hp) : 0; }
  const out = [], sum = [];
  for (const m of made.filter(q => q.s === 'S' && q.p.ok)) {
    const lot = (m.n * 4) ** 2 / 16, fl = floor(m.p) / Math.max(1, house[m.c]);
    // (the imperial palace — the Roman's colossal, the owner's reference —: its lot and its floor; every colossal: its lot)
    if (m.t === 'palacio_colossal' && (lot < 30 || (m.c === 'romano' && fl < 30))) out.push(`${tag(m)}: o lote ${lot.toFixed(0)}×, o chão ${fl.toFixed(0)}×`);
    sum.push(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c} ${lot.toFixed(0)}× · ${fl.toFixed(0)}× (${floor(m.p).toFixed(0)} m²)`);
  }
  ok('B3a o palácio imperial contra a casa: o lote e o chão dos cômodos ≥ 30 vezes os da casa do povo (o lote, em todo colossal)', POVOS.every(c => house[c] > 0) && !out.length,
    `as casas: o lote 16 m², o chão ${POVOS.map(c => c + ' ' + house[c].toFixed(1)).join(', ')} m²; lote · chão: ${sum.join(', ')}${out.length ? '; ' + out.join(' / ') : ''}`);
}
// ---------------------------------------------------------------- B4: the throne hall
function B4() {
  const out = [], sum = new Map(), hallWalk = new Map();
  for (const m of made.filter(q => q.p.ok)) {
    const p = m.p; const R = riskOf(m.t, m.c, m.n); const hall = p.rooms.find(q => q.fn === 'trono'); const why = [];
    if (!hall) { out.push(`${tag(m)}: sem o salão do trono`); continue; }
    const a = hall.r[2] - hall.r[0], b = hall.r[3] - hall.r[1]; if (Math.max(a, b) < 14 - 1e-6 || Math.min(a, b) < 9 - 1e-6) why.push(`o salão de ${a.toFixed(1)} × ${b.toFixed(1)} m`);
    // (its height: no storey over it, the walls round it to the eaves — the Norse's great hall open to its ridge under the turf)
    const lv = p.levels.find(l => l.lv === hall.lv); const over = p.rooms.some(q => q.lv > hall.lv && q.r[0] < hall.r[2] - 0.05 && q.r[2] > hall.r[0] + 0.05 && q.r[1] < hall.r[3] - 0.05 && q.r[3] > hall.r[1] + 0.05);
    const F = Fo.of(m.t, m.c, m.n); const ridge = F.els.filter(e => e.k === 'telhado' && e.r[1] <= R.B[1] + 0.01 && e.r[3] >= R.C[1] - 0.5).reduce((h, e) => Math.max(h, e.y1), 0);
    const pd = R.NO ? ridge - lv.y : p.shell.eave - lv.y; if (over) why.push('um piso sobre ele'); if (pd < 9 - 1e-6) why.push(`o pé-direito de ${pd.toFixed(1)} m`);
    const th = p.items.find(i => i.kind === 'trono' && i.room === hall.id); const au = th && th.spots.find(q => q.use === 'audiencia');
    if (!th) why.push('sem o trono'); else if (!au || !au.ok) why.push('a audiência diante do trono onde o corpo não fica');
    // (the walk to it from the street's gate: its metres)
    const din = reachOf(p, 'audiencia'); if (!(din < Infinity)) why.push('a audiência que a porta não alcança');
    if (m.s === 'S') hallWalk.set(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c}`, din);
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    if (m.s === 'S') sum.set(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c}`, `${a.toFixed(1)}×${b.toFixed(1)}×${pd.toFixed(1)}${R.NO ? ' (ao cume)' : ''}, a audiência a ${hallWalk.get(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c}`).toFixed(0)} m da porta`);
  }
  ok('B4a o salão do trono ≥ 14 × 9 m e ≥ 9 m de pé-direito, o trono e a audiência diante dele alcançada da porta', !out.length, some(out).join(' / ') || [...sum].map(([k, v]) => `${k} ${v}`).join(', '));
}
// ---------------------------------------------------------------- B5: the courts
function B5() {
  const out = [], sum = [];
  for (const m of made.filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p; const courts = p.rooms.filter(q => q.open && q.lv === 0 && (q.fn === 'patio' || q.fn === 'terreiro'));
    const need = m.t === 'palacio_colossal' ? 2 : 1; const why = [];
    if (courts.length < need) why.push(`${courts.length} pátios`);
    if (!p.shell.court) why.push('a casca sem o pátio aberto');
    else if (p.rooms.some(q => q.lv > 0 && q.r[0] < p.shell.court[2] - 0.05 && q.r[2] > p.shell.court[0] + 0.05 && q.r[1] < p.shell.court[3] - 0.05 && q.r[3] > p.shell.court[1] + 0.05)) why.push('um piso sobre o pátio');
    if (m.t === 'palacio_colossal' && !p.shell.yard) why.push('sem o pátio de honra (o terreiro da casca)');
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    sum.push(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c} ${courts.map(q => (q.fn === 'patio' ? 'pátio ' : 'honra ') + area(q.r).toFixed(0) + ' m²').join(' + ')}`);
  }
  ok('B5a os pátios: o colossal com o de dentro e o de honra, o palácio com o seu; abertos ao céu', !out.length, some(out).join(' / ') || sum.join(', '));
}
// ---------------------------------------------------------------- B6: the flight and the parapets
function B6() {
  const out = [], sum = [];
  for (const m of made.filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p; const R = riskOf(m.t, m.c, m.n); const why = [];
    const st = p.stairs.find(s => s.kind === 'degraus' && s.lv0 === -1); if (!st) { out.push(`${tag(m)}: sem a escadaria`); continue; }
    const tr = (st.treads || []).slice().sort((a, b) => a.y - b.y); const ys = [0].concat(tr.map(q => q.y), [R.Hp]);
    let rise = 0; for (let k = 1; k < ys.length; k++) rise = Math.max(rise, ys[k] - ys[k - 1]);
    const deep = Math.min(...tr.map(q => Math.min(q.r[2] - q.r[0], q.r[3] - q.r[1])));
    if (rise > In.BODY.step + 1e-6) why.push(`um espelho de ${rise.toFixed(2)} m`); if (deep < 0.28 - 1e-6) why.push(`um piso de ${deep.toFixed(2)} m`); if (st.w < 1.2 - 1e-6) why.push(`${st.w.toFixed(2)} m de largura`);
    // (the way in at the flight's top: the entrance within the flight's span, on its top edge)
    const e = p.entrance; const sr = st.r; const top = [Math.min(sr[0], sr[2]), Math.min(sr[1], sr[3]), Math.max(sr[0], sr[2]), Math.max(sr[1], sr[3])];
    if (!(e.x > top[0] - 0.05 && e.x < top[2] + 0.05 && e.z > top[1] - 0.6 && e.z < top[3] + 0.6)) why.push('a entrada fora do alto da escadaria');
    // (the court of honour's edges, where the podium falls: a parapet of 0.9 m at the least)
    if (p.shell.yard) { const rails = p.walls.filter(w => w.kind === 'cerca'); if (!rails.length || rails.some(w => w.h < 0.9 - 1e-6)) why.push(`as bordas do pátio de honra sem parapeito (${rails.map(w => w.h).join(', ')})`); }
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    sum.push(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c} ${tr.length + 1}×${rise.toFixed(2)} m em ${st.w.toFixed(1)} m`);
  }
  ok('B6a a escadaria da rua ao pódio pelos degraus da forma (espelho ≤ 0,30, piso ≥ 0,28, ≥ 1,2 m), a entrada no alto; o parapeito do pátio de honra', !out.length, some(out).join(' / ') || sum.join(', '));
}
// ---------------------------------------------------------------- B7: the places
function B7() {
  const out = [], sum = [];
  for (const m of made.filter(q => q.p.ok)) {
    const p = m.p; const n = (k, use) => p.items.filter(i => i.kind === k && i.spots.some(q => (!use || q.use === use) && q.ok)).length;
    const marks = use => (p.marks || []).filter(q => q.use === use).reduce((a, q) => a + q.pts.filter(x => x.ok).length, 0);
    const guard = marks('vigiar') + n('armeiro', 'armar'), staff = n('mesa-escriba', 'escrever') + n('mesa-conferencia', 'conferir'), visit = n('banco', 'sentar') + n('trono', 'audiencia'), beds = n('cama-casal') + n('cama');
    const why = []; if (marks('vigiar') < 4) why.push(`${marks('vigiar')} lugares de vigia`); if (staff < 2) why.push(`${staff} lugares de funcionário`); if (visit < 6) why.push(`${visit} lugares de visitante`); if (!beds) why.push('sem cama');
    // (each use reached from the door: a place of it where the body stands, the walk to it finite)
    const far = ['vigiar', 'escrever', 'conferir', 'audiencia', 'sentar', 'armar', 'deitar'].filter(u => !(reachOf(p, u) < Infinity));
    if (far.length) why.push(`sem lugar alcançado de ${far.join(', ')}`);
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
    if (m.s === 'S') sum.push(`${m.t === 'palacio' ? 'P' : 'C'}/${m.c} guarda ${guard}, funcionários ${staff}, visitantes ${visit}, camas ${beds}`);
  }
  ok('B7a os lugares da guarda, dos funcionários, dos visitantes e os aposentos, alcançados da porta', !out.length, some(out).join(' / ') || sum.join('; '));
}
// ---------------------------------------------------------------- B8: the body's rules
function B8() {
  const out = [];
  for (const m of made.filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p; const why = [];
    const rua = p.doors.find(d => d.rooms.includes('rua')); const hole = d => p.holes.find(h => h.door === d.id);
    if (!rua || hole(rua).h < 2.2 - 1e-6) why.push(`a porta da rua de ${rua ? hole(rua).h.toFixed(2) : '-'} m`);
    const R = riskOf(m.t, m.c, m.n); if (R.mainDoor && R.mainDoor.h < 2.2 - 1e-6) why.push('a porta principal baixa');
    for (const s of p.stairs) if (s.kind === 'escada' && !(s.cls === 'degraus' || s.cls === 'escada')) why.push(`uma escada de ${s.slope}° (${s.cls})`);
    for (const h of p.holes) { const w = p.walls[h.wall]; if (h.kind === 'janela' && w && w.lv > 0 && w.outer && h.sill < 0.9 - 1e-6) { why.push(`uma janela de cima com o peitoril a ${h.sill} m`); break; } }
    if (why.length) out.push(`${tag(m)}: ${why.join(', ')}`);
  }
  ok('B8a as regras do corpo: a porta da rua e a principal ≥ 2,2 m, as escadas que os pés sobem, os peitoris de cima ≥ 0,9 m', !out.length, some(out).join(' / ') || `nos ${made.filter(q => q.s === 'S').length} (a porta da rua, os lances, as janelas do piso de cima)`);
}
// ---------------------------------------------------------------- B9: the feet in, on a blank world
// (a blank world: flat grass, nothing on it; a building of a step put on it by hand, its record as the world makes it)
const blankWorld = () => { const S = G.newState(7); S.H.fill(4); S.type.fill(G.T.GRASS); if (S.biome) S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld(); return S; };
const putStep = (S, t, c, n, x, y, id) => { const def = G.BDEF[t]; const b = { id, type: t, style: c, x, y, w: n, h: n, esc: t, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: !!def.blocks, ip: null };
  S.buildings.set(b.id, b); for (let yy = b.y; yy < b.y + n; yy++) for (let xx = b.x; xx < b.x + n; xx++) S.occ[yy * G.N + xx] = b.id;
  b.ip = In.newRecord(b, { t, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n }); return b; };
// (the feet from the street along the way in to v = end, every 2 cm, against what the form is there — the treads, the
// platform's top, the street —: the worst difference, the points below it, the biggest step, where they stop)
function feetIn(b, p, R, end) {
  const TL = Sp.TILE, L = b.w * TL, u = p.entrance.x; const pl = Sp.plinth(b);
  const inR = (r, a, z) => a >= r[0] && a <= r[2] && z >= r[1] && z <= r[3];
  const top = z => { for (const q of R.treads) if (inR(q.r, u, z)) return q.y; return inR(R.podium, u, z) ? R.Hp : 0; };
  const edges = R.treads.flatMap(q => [q.r[1], q.r[3]]).concat([R.podium[3]]);
  let worst = 0, at = 0, step = 0, fell = 0, prev = null, nn = 0, stop = null;
  for (let z = L + 1.0; z >= end; z -= 0.02) {
    const X = b.x * TL + u, Z = b.y * TL + z; const ins = Sp.indoor(X, Z, 0, b.id); const foot = ins ? ins.y : Math.max(Sp.footAt(X / TL, Z / TL), Sp.stepTop(X, Z));
    if (prev !== null) step = Math.max(step, Math.abs(foot - prev)); prev = foot;
    if (ins && !ins.walk && ins.door < 0 && stop === null) stop = z;
    if (edges.some(e => Math.abs(z - e) < 0.03)) continue;
    // (in the street, or past the flight's foot on the lot's edge: the steps before it are Space's — L-163, L-390 —, not the form's)
    if ((!ins && Sp.stepTop(X, Z) > -Infinity) || z > R.stair[3] + 0.01) continue; nn++;
    const wantY = pl.hi + top(z) + (ins && z < R.podium[3] ? Sp.FLOOR_UP : 0); const d = foot - wantY; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = z; }
    if (d < -0.05) fell++;
  }
  const bad = Math.abs(worst) > 0.03 || fell || step > In.BODY.step + 0.01 || Math.abs(pl.y0 - pl.hi) > 1e-9 || stop !== null;
  return { bad, worst, why: `os pés a ${worst.toFixed(2)} m da forma em v ${at.toFixed(2)}, ${fell} pontos abaixo dela, o maior degrau ${step.toFixed(2)} m, o quadro a ${(pl.y0 - pl.hi).toFixed(2)} m do chão${stop !== null ? `, parados em v ${stop.toFixed(2)}` : ''} (${nn} pontos)` };
}
function B9() {
  const S = blankWorld(); const out = [], sum = []; let k = 0;
  for (const [t, n] of PAL) for (const c of POVOS) {
    const x = 6 + 14 * (k % 4), y = 6 + (n === 10 ? 0 : 16) + 0; k++;
    const b = putStep(S, t, c, n, x, y, 98001 + k * 7);
    const key = `${t === 'palacio' ? 'P' : 'C'}/${c}`; if (b.ip.f !== FAM) { out.push(`${key}: o registro novo com ${b.ip.f}`); continue; }
    const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${key}: sem planta`); continue; }
    const R = riskOf(t, c, n);
    // (from the street to the court: the colossal to the inner side of its vestibule's portal, the palace to before its fountain)
    const f = feetIn(b, p, R, n === 10 ? R.C[3] - 0.8 : R.fonte.c[1] + R.fonte.r + 1.0);
    sum.push(`${key} ${f.worst >= 0 ? '+' : ''}${f.worst.toFixed(3)}`); if (f.bad) out.push(`${key}: ${f.why}`);
  }
  ok('B9a os pés da rua para dentro, subindo os degraus da forma, sempre num chão onde ficam', !out.length, some(out).join(' / ') || `nos ${PAL.length * POVOS.length}, a cada 2 cm (a maior diferença: ${sum.join(', ')})`);
}
// ---------------------------------------------------------------- B10: standing in the world
// (a building of the god's hand — a palace, a temple —: where, the plan, the way in, the report, the checker; B10, D9)
const stand = (set, t, step, o) => {
    const st = G.Civ.idOfFac(set.fac); let b; G.inSim++; try { b = G.Village.handFound(set, t, step, Object.assign({ built: true }, o)); } finally { G.inSim--; }
    if (!b) return { set, st, t, none: true };
    const p = In.plan(b); const e = Sp.entryFits(b, In.shellOf(b)); const rep = In.report(b, p, { world: true, sides: true }).filter(q => q.k === 'FALHA').map(q => q.what);
    let lo = 1e9, hi = -1e9; for (let y = b.y; y <= b.y + b.h; y++) for (let x = b.x; x <= b.x + b.w; x++) { const h = G.W.hAt(x, y); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    // (fine: the plan valid and the game's own report with no defect — a way in that fits on no side open to the street is the
    // world's choice there, said; fits: the way in fits before its door — what a lot within the podium's 3 m must have)
    return { set, st, t, b, ok: !!(p && p.ok && !rep.length), fits: e.ok, why: [p && p.ok ? '' : 'planta: ' + (p ? p.errs.slice(0, 2).join('; ') : '-'), e.ok ? '' : `a entrada não cabe (${e.kind}, o pé a ${e.foot} m)`, rep.slice(0, 2).join('; ')].filter(Boolean).join(', '),
      d: G.dist(b.x + b.w / 2, b.y + b.h / 2, set.cx, set.cy), rel: (hi - lo) * Sp.HM, flat: o.flat };
  };
// (the nearest lot of n with its ring free, as the god's hand founds, within R of a town's middle, whose ground rises no more
// than the podium covers — two of the relief's steps, 3 m —: the point to found at, or null)
const flatLot = (set, n, R) => { const S = G.S, W = G.W, N = G.N, T = G.T; const ox = Math.floor(set.cx), oy = Math.floor(set.cy);
    for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - Math.floor(n / 2), y = oy + dy - Math.floor(n / 2); let ok2 = true;
      for (let ty = y - 1; ty <= y + n && ok2; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) { ok2 = false; break; } const i = ty * N + tx;
        if (S.occ[i] || S.wall[i] || S.type[i] < T.SAND || (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0))) { ok2 = false; break; } }
      if (!ok2) continue; let lo = 1e9, hi = -1e9; for (let ty = y; ty <= y + n; ty++) for (let tx = x; tx <= x + n; tx++) { const h = W.hAt(tx, ty); lo = Math.min(lo, h); hi = Math.max(hi, h); }
      if ((hi - lo) * Sp.HM <= 3 + 1e-6) return { x: x + Math.floor(n / 2), y: y + Math.floor(n / 2) };
    }
    return null; };
const qaS = () => globalThis.QA.check().filter(q => q.sev <= 2);
function B10() {
  const qa = qaS;
  const tell = r => `${r.set.name} (${r.st}) ${r.t === 'palacio' ? 'P' : 'C'}#${r.b.id} a ${r.d.toFixed(0)} casas, ${r.rel.toFixed(1)} m de desnível${r.ok && r.fits ? '' : ': ' + r.why}`;
  // the ready world: the colossal of the god's hand in the cities of the peoples that raise it (the first that has a lot of 10)
  { M.pronto('metropole'); const q0 = qa().length; const res = [];
    for (const c of POVOS) { const sets = [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
      for (const set of sets) { const r = stand(set, 'palacio_colossal', 'palacio_colossal', { R: 60 }); if (!r.none) { res.push(r); break; } } }
    const bad = qa(); const s0 = res.filter(r => r.ok).length; const sv = M.salvarCarregar(); const after = res.map(r => G.S.buildings.get(r.b.id)).filter(b => b && b.w === 10 && b.esc === 'palacio_colossal' && In.plan(b).ok).length; const bad2 = qa();
    ok('B10a de pé num mundo pronto (a metrópole): o colossal pela mão do deus — a planta, a entrada, o relatório, o verificador; salvar e carregar', res.length >= 2 && s0 === res.length && !bad.length && after === res.length && !bad2.length && q0 === 0 && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(' · ')}); o verificador S0–S2: ${q0} antes, ${bad.length} com eles${bad.length ? ' (' + bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}, ${bad2.length} depois do save; ${after} de ${res.length} iguais depois de salvar e carregar${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
  // a new world: the palace and the colossal of each people by its city — on the nearest lot whose ground the podium covers (3
  // m), where there is one within 40 tiles; else the nearest the god's hand finds
  { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const q0 = qa().length; const res = [];
    for (const c of POVOS) { const set = [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c); if (!set) continue;
      for (const [t, n] of PAL) { const at = flatLot(set, n, 40); const r = stand(set, t, t, at ? { x: at.x, y: at.y, R: 1, flat: 1 } : { R: 40 }); if (!r.none) res.push(r); } }
    const bad = qa(); M.saltar(1); const bad1 = qa(); const alive = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.built && In.plan(b) && In.plan(b).ok; }).length;
    M.salvarCarregar(); const bad2 = qa(); const flat = res.filter(r => r.flat);
    ok('B10b de pé num mundo novo: os dois palácios de cada povo perto da sua cidade — a planta, o relatório, a entrada onde o chão cabe no pódio, o verificador; um ano; salvar e carregar', res.length === PAL.length * POVOS.length && res.every(r => r.ok) && flat.every(r => r.fits) && flat.length >= POVOS.length && !bad.length && !bad1.length && !bad2.length && alive === res.length && M.limpo(),
      `${res.length} de ${PAL.length * POVOS.length} de pé, ${flat.length} em chão de até 3 m (${res.map(r => `${r.st}/${r.t === 'palacio' ? 'P' : 'C'} ${r.d.toFixed(0)} casas ${r.rel.toFixed(1)} m${r.ok && r.fits ? '' : ' — ' + r.why}`).join(', ')}); o verificador S0–S2: ${q0} antes, ${bad.length} com eles, ${bad1.length} depois de um ano, ${bad2.length} depois do save${bad.concat(bad1, bad2).length ? ' (' + bad.concat(bad1, bad2).slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}; ${alive} de pé e com planta depois do ano${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
}
// ---------------------------------------------------------------- B11: the bad cases
function B11() {
  const qa = () => globalThis.QA.check().filter(q => q.sev <= 2); const mine = () => globalThis.QA.check().filter(q => q.sys === 'poder');
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const out = [], said = [];
  // (the world asked anew each time: a save loaded is a new G.S, its towns and buildings new objects)
  const setOf = c => [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c);
  const found = (set, t, built) => { let b; G.inSim++; try { b = G.Village.handFound(set, t, t, { built, R: 40 }); } finally { G.inSim--; } return b; };
  // (a) the colossal's work saved and loaded in the middle, then finished: the same lot and step, the form's family, its plan
  { const b = found(setOf('egipcio'), 'palacio_colossal', false); if (!b) out.push('a obra do colossal sem lote');
    else { const id = b.id; M.salvarCarregar(); const b1 = G.S.buildings.get(id); const q1 = qa();
      if (!b1 || b1 === b || b1.built || b1.w !== 10 || b1.h !== 10 || b1.esc !== 'palacio_colossal') out.push(`a obra depois do save: ${b1 ? `${b1 === b ? 'o objeto de antes, ' : ''}${b1.w}×${b1.h} casas, ${b1.esc}, ${b1.built ? 'pronta' : 'em obra'}` : 'sumiu'}`);
      else { G.inSim++; try { G.Village.completeBuilding(b1); } finally { G.inSim--; } const p = In.plan(b1);
        if (!p || !p.ok || b1.ip.f !== FAM) out.push(`a obra acabada: ${b1.ip ? b1.ip.f : 'sem registro'}, ${p && p.ok ? 'planta ok' : 'planta NÃO: ' + (p ? p.errs.slice(0, 2).join('; ') : '-')}`); }
      if (q1.length) out.push(`o verificador no meio da obra: ${q1.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ')}`);
      said.push(`a obra salva no meio (o save devolve os 10×10 casas e o degrau) e acabada: a família da forma, a planta`); } }
  // (b) the god razes the palace: its plan the ruin of itself; the checker; a save
  { const b = found(setOf('romano'), 'palacio', true); if (!b) out.push('o palácio sem lote');
    else { const id = b.id; G.inSim++; try { G.Village.destroyBuilding(b, 'deus'); } finally { G.inSim--; } const r = G.S.buildings.get(id); const p = r && In.plan(r);
      if (!r || r.type !== 'ruin' || !p || !p.ok) out.push(`a ruína: ${r ? r.type : 'sumiu'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`);
      M.salvarCarregar(); const r2 = G.S.buildings.get(id); const p2 = r2 && In.plan(r2);
      if (r && (!r2 || r2.type !== 'ruin' || r2.w !== r.w || !p2 || !p2.ok)) out.push(`a ruína depois do save: ${r2 ? `${r2.type}, ${r2.w} casas` : 'sumiu'}, ${p2 && p2.ok ? 'planta ok' : 'planta NÃO'}`);
      said.push('o palácio derrubado pelo deus: a ruína com a sua planta, salva e carregada'); } }
  const bad = qa(); if (bad.length) out.push(`o verificador: ${bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ')}`);
  // (c) the checker's own rule catches a palace of ten laid out by a recipe's family — and is quiet once it is the form's again
  { const b = found(setOf('grego'), 'palacio_colossal', true); if (!b) out.push('o colossal grego sem lote');
    else { const f0 = b.ip.f; b.ip.f = 'pal-honra.terreo'; const caught = mine().length; b.ip.f = f0; const quiet = mine().length;
      if (!caught || quiet) out.push(`a regra nova: ${caught} avisos com a família da receita, ${quiet} com a da forma`); else said.push('a regra nova pega a família da receita'); } }
  ok('B11a os casos ruins: a obra salva no meio, o palácio derrubado, o verificador limpo — e a regra nova do verificador pega a planta de outra família', !out.length && M.limpo(), out.length ? out.join(' / ') : said.join('; ') + (M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)));
}
// ================================================================ D: the temples (templo 4, grande templo 6, santuário monumental 8)
const TPL = [4, 6, 8], TFAM = 'forma.templo';
const blankS = () => ({ villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.4, avatar: null, nextId: 1000, history: [], fire: new Float32Array(G.N * G.N), occ: new Int32Array(G.N * G.N) });
const trec = (c, s, n) => In.newRecord({ id: 0, type: 'temple', style: c, x: 8, y: 8, w: n, h: n }, { t: 'temple', c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s, o: (1 << n) - 1, n });
const ttag = m => `T${m.n}/${m.c}/${m.s}`;
// (the temple's plans of every people, size and side, on a world of nothing: made once, when a test of D asks)
let tcache = null;
const temples = () => {
  if (tcache) return tcache; G.S = blankS(); tcache = []; let id = 93001;
  for (const n of TPL) for (const c of POVOS) for (const s of LADOS) {
    const b = { id: (id += 37), type: 'temple', style: c, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec('temple', c, s, n, TFAM);
    const t0 = clock(); const p = In.makeFam(b, b.ip, TFAM); const ms = clock() - t0; G.S.buildings.set(b.id, b); tcache.push({ n, c, s, b, p, ms, so: In.shellOf(b) });
  }
  return tcache;
};
const tfloor = p => p.rooms.filter(m => !m.open).reduce((a, m) => a + area(m.r), 0);
// ---------------------------------------------------------------- D1: the forms
function D1() {
  const out = [], sum = [];
  for (const n of TPL) for (const c of POVOS) {
    const F = Fo.of('temple', c, n); if (!F) { out.push(`T${n}/${c}: sem forma`); continue; }
    const R = In.riskOf(F); const L = n * 4; const why = [];
    if (Math.abs(F.L - L) > 1e-9) why.push(`a forma de ${F.L} m num lote de ${L}`); if (!R || R.fam !== TFAM) why.push('sem o risco do templo');
    for (const f of Fo.foot(F)) { const r = f.k === 'circ' ? [f.c[0] - f.r, f.c[1] - f.r, f.c[0] + f.r, f.c[1] + f.r] : f.r; if (r[0] < -1e-6 || r[1] < -1e-6 || r[2] > L + 1e-6 || r[3] > L + 1e-6) { why.push(`um pé fora do lote (${r.map(x => x.toFixed(2)).join(', ')})`); break; } }
    if (!Es.can('temple', c, n)) why.push('o degrau não oferecido');
    if (why.length) out.push(`T${n}/${c}: ${why.join(', ')}`);
    sum.push(`T${n}/${c} ${F.top.toFixed(1)} m`);
  }
  for (const n of TPL) for (const c of OUTROS) if (Es.can('temple', c, n)) out.push(`T${n}/${c}: o degrau oferecido sem a forma do povo`);
  ok('D1a a forma do templo de cada povo e tamanho (4, 6, 8): o lote, o pé dentro dele, o risco; o degrau só a quem tem a forma', !out.length, some(out).join(' / ') || `as alturas: ${sum.join(', ')}; o asteca e o clássico sem os degraus maiores (a forma deles fica para depois)`);
  // (H: in each size the forms of the peoples differ — their masses, their tops)
  const sig = (c, n) => { const F = Fo.of('temple', c, n); const k = {}; for (const m of Fo.mass(F)) k[m.k] = (k[m.k] || 0) + 1; return JSON.stringify(k) + ':' + F.top.toFixed(1); };
  const diff = TPL.map(n => new Set(POVOS.map(c => sig(c, n))).size);
  ok('D1b as formas dos povos diferentes entre si em cada tamanho (a parte H dos templos)', diff.every(x => x >= 3), TPL.map((n, q) => `${n} casas: ${diff[q]} formas em ${POVOS.length} povos`).join(', '));
}
// ---------------------------------------------------------------- D2: the plans
function D2() {
  const T = temples(); const bad = T.filter(m => !m.p.ok); const offer = [];
  for (const n of TPL) for (const c of POVOS) { const r = trec(c, 'S', n); if (r.f !== TFAM) offer.push(`T${n}/${c}: o registro com ${r.f}`); if (!In.familiesFor(r).ok.includes(TFAM)) offer.push(`T${n}/${c}: o catálogo sem a da forma`); }
  ok('D2a a planta do templo em todo povo, tamanho e lado, pela família da forma — a que o mundo dá ao registro do degrau', !bad.length && !offer.length, `${T.length - bad.length} de ${T.length} plantas${bad.length ? '; ' + some(bad).map(m => `${ttag(m)}: ${m.p.errs.slice(0, 2).join('; ')}`).join(' / ') : ''}${offer.length ? '; ' + offer.join(' · ') : '; o registro novo e o catálogo com a da forma em todos'}`);
  // (the village shrine keeps its plan by its form of before — qa/templo.js proves it whole —: the family its record is given)
  const cl = POVOS.concat(OUTROS).filter(c => trec(c, 'S', 2).f !== TFAM);
  ok('D2b o santuário da aldeia (2 casas) com a sua planta pela forma de antes', !cl.length, cl.length ? 'com outra família: ' + cl.join(', ') : 'nos seis povos, forma.templo pelo corpo da forma clássica');
  const diff = T.filter(m => m.p.ok).filter(m => { const q = In.makeFam(m.b, m.b.ip, TFAM); return JSON.stringify([q.rooms, q.items.map(i => [i.kind, i.x, i.z, i.ry]), q.doors, q.holes]) !== JSON.stringify([m.p.rooms, m.p.items.map(i => [i.kind, i.x, i.z, i.ry]), m.p.doors, m.p.holes]); });
  ok('D2c a mesma planta duas vezes da mesma entrada', !diff.length, `${diff.length} diferentes${diff.length ? ': ' + some(diff).map(ttag).join(', ') : ''}`);
  const sh = T.filter(m => m.p.ok && (!m.so || strip(m.so) !== strip(In.shellOfPlan(m.p))));
  ok('D2d a casca de longe igual à da planta', !sh.length, `${sh.length} cascas diferentes${sh.length ? ': ' + some(sh).map(ttag).join(', ') : ''}`);
  // (the dearest made again, warm, three times with no cache: the least is its cost; the places' table of each monumental, the
  // first time the world asks for it — In.table, the share-out's —: its milliseconds)
  const ts = T.slice().sort((a, b) => b.ms - a.ms); const med = T.map(q => q.ms).sort((a, b) => a - b)[T.length >> 1];
  const again = ts.slice(0, 3).map(m => { let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(m.b, m.b.ip, TFAM); best = Math.min(best, clock() - a); } return [ttag(m), best]; }).sort((a, b) => b[1] - a[1]);
  ok('D2e o tempo de fazer a planta (alvo: 400 ms em Node)', again[0][1] < 400, `a mais cara ${again[0][1].toFixed(0)} ms (${again[0][0]}, sem cache); a mediana ${med.toFixed(0)} ms na rodada`);
  const tab = T.filter(m => m.n === 8 && m.s === 'S' && m.p.ok).map(m => { const a = clock(); const t = In.table(m.b); return [m.c, clock() - a, t ? t.spots.length : 0]; }).sort((a, b) => b[1] - a[1]);
  ok('D2f a tabela dos lugares do santuário monumental a tempo (alvo: 1 s em Node)', tab.length === POVOS.length && tab[0][1] < 1000, tab.map(([c, ms, n]) => `${c} ${ms.toFixed(0)} ms (${n} lugares)`).join(', '));
}
// ---------------------------------------------------------------- D3: the monumental sanctuary against the village shrine
function D3() {
  const out = [], sum = []; let hid = 95501;
  for (const c of POVOS) {
    const sb = { id: (hid += 7), type: 'temple', style: c, x: 30, y: 30, w: 2, h: 2, built: true }; sb.ip = trec(c, 'S', 2); const sp = In.make(sb, sb.ip);
    const m = temples().find(q => q.n === 8 && q.c === c && q.s === 'S'); if (!sp.ok || !m || !m.p.ok) { out.push(`${c}: sem as plantas`); continue; }
    const lot = 32 * 32 / (8 * 8), fl = tfloor(m.p) / Math.max(1, tfloor(sp));
    if (lot < 9 || fl < 9) out.push(`${c}: o lote ${lot.toFixed(0)}×, o chão ${fl.toFixed(0)}×`);
    sum.push(`${c} ${lot.toFixed(0)}× · ${fl.toFixed(0)}× (${tfloor(m.p).toFixed(0)} m² contra ${tfloor(sp).toFixed(1)} m²)`);
  }
  ok('D3a o santuário monumental (8 casas) contra o santuário da aldeia (2): o lote e o chão coberto ≥ 9 vezes', !out.length, `lote · chão coberto: ${sum.join(', ')}${out.length ? '; ' + out.join(' / ') : ''}`);
}
// ---------------------------------------------------------------- D4: the nave
function D4() {
  const out = [], sum = [];
  for (const m of temples().filter(q => q.p.ok && q.n === 8)) {
    const p = m.p; const nave = p.rooms.find(q => q.fn === 'nave' || q.fn === 'hipostila'); const why = [];
    if (!nave) { out.push(`${ttag(m)}: sem a nave`); continue; }
    const a = nave.r[2] - nave.r[0], b = nave.r[3] - nave.r[1]; if (Math.max(a, b) < 16 - 1e-6 || Math.min(a, b) < 10 - 1e-6) why.push(`a nave de ${a.toFixed(1)} × ${b.toFixed(1)} m`);
    const h = p.levels.find(l => l.lv === nave.lv).h; if (h < 8 - 1e-6) why.push(`${h.toFixed(1)} m de altura`);
    // (no storey over it; the altar reached from the street's gate — its priest's place —, its metres)
    if (p.rooms.some(q => q.lv > nave.lv)) why.push('um piso sobre a nave');
    const din = reachOf(p, 'oficiar'); if (!(din < Infinity)) why.push('o altar que a porta não alcança');
    if (why.length) out.push(`${ttag(m)}: ${why.join(', ')}`);
    if (m.s === 'S') sum.push(`${m.c} ${a.toFixed(1)}×${b.toFixed(1)} m, ${h.toFixed(1)} m de altura (${nave.fn}), o altar a ${din.toFixed(0)} m da porta`);
  }
  ok('D4a a nave do santuário monumental ≥ 10 × 16 m e ≥ 8 m de altura, o altar alcançado da porta', !out.length, some(out).join(' / ') || sum.join(', '));
}
// ---------------------------------------------------------------- D5: the places of prayer
function D5() {
  const out = [], sum = [];
  for (const m of temples().filter(q => q.p.ok)) {
    const p = m.p; const pts = placesOf(p, 'rezar').concat(placesOf(p, 'sentar')); let got = 0;
    for (const q of pts) { const d = q.on ? Math.min(Infinity, ...q.it.spots.filter(sp => !sp.on && sp.ok).map(sp => walkTo(p, q.lv, sp.x, sp.z))) : walkTo(p, q.lv, q.x, q.z); if (d < Infinity) got++; }
    const need = m.n === 8 ? 40 : 2; if (got < need) out.push(`${ttag(m)}: ${got} lugares de rezar alcançados (de ${pts.length})`);
    if (!(reachOf(p, 'oficiar') < Infinity)) out.push(`${ttag(m)}: o lugar de oficiar que a porta não alcança`);
    if (m.s === 'S') sum.push(`T${m.n}/${m.c} ${got}`);
  }
  ok('D5a os lugares de rezar (bancos, esteiras, de pé diante do templo): ≥ 40 no santuário monumental, cada um alcançado da porta; o de oficiar', !out.length, some(out).join(' / ') || sum.join(', '));
}
// ---------------------------------------------------------------- D6: the flight, the parapets, the body's rules
function D6() {
  const out = [], sum = [];
  for (const m of temples().filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p; const R = In.riskOf(Fo.of('temple', m.c, m.n)); const why = [];
    const st = p.stairs.find(s => s.kind === 'degraus' && s.lv0 === -1); if (!st) { out.push(`${ttag(m)}: sem a escadaria`); continue; }
    const tr = (st.treads || []).slice().sort((a, b) => a.y - b.y); const ys = [0].concat(tr.map(q => q.y), [R.Hp]);
    let rise = 0; for (let k = 1; k < ys.length; k++) rise = Math.max(rise, ys[k] - ys[k - 1]);
    const deep = tr.length ? Math.min(...tr.map(q => Math.min(q.r[2] - q.r[0], q.r[3] - q.r[1]))) : Infinity;
    if (rise > In.BODY.step + 1e-6) why.push(`um espelho de ${rise.toFixed(2)} m`); if (deep < 0.28 - 1e-6) why.push(`um piso de ${deep.toFixed(2)} m`); if (st.w < 1.2 - 1e-6) why.push(`${st.w.toFixed(2)} m de largura`);
    const e = p.entrance; const sr = st.r; const top = [Math.min(sr[0], sr[2]), Math.min(sr[1], sr[3]), Math.max(sr[0], sr[2]), Math.max(sr[1], sr[3])];
    if (!(e.x > top[0] - 0.05 && e.x < top[2] + 0.05 && e.z > top[1] - 0.6 && e.z < top[3] + 0.6)) why.push('a entrada fora do alto da escadaria');
    // (the platform's edges where it falls more than a metre: the precinct's walls round it, 0.9 m at the least)
    const rails = p.walls.filter(w => w.kind === 'cerca'); if (R.Hp > 1 + 1e-6 && (rails.length < 3 || rails.some(w => w.h < 0.9 - 1e-6))) why.push(`as bordas do pódio sem parapeito (${rails.map(w => w.h).join(', ')})`);
    // (the street's gate and the portal ≥ 2.2 m; the stairs the feet climb)
    const rua = p.doors.find(d => d.rooms.includes('rua')); const hole = d => p.holes.find(h => h.door === d.id);
    if (!rua || hole(rua).h < 2.2 - 1e-6) why.push(`a porta da rua de ${rua ? hole(rua).h.toFixed(2) : '-'} m`);
    if (!R.doorD || R.doorD.y1 - R.doorD.y0 < 2.2 - 1e-6) why.push('o portal baixo');
    for (const s of p.stairs) if (s.kind === 'escada' && !(s.cls === 'degraus' || s.cls === 'escada')) why.push(`uma escada de ${s.slope}° (${s.cls})`);
    if (why.length) out.push(`${ttag(m)}: ${why.join(', ')}`);
    sum.push(`T${m.n}/${m.c} ${tr.length + 1}×${rise.toFixed(2)} m em ${st.w.toFixed(1)} m`);
  }
  ok('D6a a escadaria da rua ao pódio (espelho ≤ 0,30, piso ≥ 0,28, ≥ 1,2 m), a entrada no alto; o parapeito onde o pódio cai mais de 1 m; a porta da rua e o portal ≥ 2,2 m', !out.length, some(out).join(' / ') || sum.join(', '));
}
// ---------------------------------------------------------------- D7: the feet in, on a blank world
function D7() {
  const S = blankWorld(); const out = [], sum = []; let k = 0;
  for (const n of TPL) for (const [q, c] of POVOS.entries()) {
    const x = 4 + (n + 4) * q, y = n === 8 ? 4 : n === 6 ? 16 : 26; k++;
    const b = putStep(S, 'temple', c, n, x, y, 99001 + k * 7); const key = `T${n}/${c}`;
    if (b.ip.f !== TFAM) { out.push(`${key}: o registro novo com ${b.ip.f}`); continue; }
    const p = Sp.planNow(b); if (!p || !p.ok) { out.push(`${key}: sem planta`); continue; }
    const R = In.riskOf(Fo.of('temple', c, n));
    // (from the street through the gate, the court, the porch, to a pace inside the nave's portal)
    const end = (R.vF !== undefined ? R.vF : R.B[3] - R.t / 2) - 1.0;
    const f = feetIn(b, p, R, end); sum.push(`${key} ${f.worst >= 0 ? '+' : ''}${f.worst.toFixed(3)}`); if (f.bad) out.push(`${key}: ${f.why}`);
  }
  ok('D7a os pés da rua até dentro da nave, subindo os degraus da forma, sempre num chão onde ficam', !out.length, some(out).join(' / ') || `nos ${TPL.length * POVOS.length}, a cada 2 cm (a maior diferença: ${sum.join(', ')})`);
}
// ---------------------------------------------------------------- D8: standing in the world
function D8() {
  const qa = qaS; const tell = r => `${r.st}/T${r.b.w} ${r.d.toFixed(0)} casas ${r.rel.toFixed(1)} m${r.ok && (r.fits || !r.flat) ? '' : ' — ' + r.why}`;
  // the ready world: the monumental sanctuary of the god's hand in the biggest city of each people that raises it
  { M.pronto('metropole'); const q0 = qa().length; const res = [];
    for (const c of POVOS) { const sets = [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
      for (const set of sets) { const at = flatLot(set, 8, 50); const r = stand(set, 'temple', 'monumental', at ? { x: at.x, y: at.y, R: 1, flat: 1 } : { R: 60 }); if (!r.none) { res.push(r); break; } } }
    const bad = qa(); M.salvarCarregar(); const after = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.w === 8 && b.esc === 'monumental' && In.plan(b).ok && b.ip.f === TFAM; }).length; const bad2 = qa();
    ok('D8a de pé num mundo pronto (a metrópole): o santuário monumental pela mão do deus — a planta, o relatório, a entrada onde o chão cabe no pódio, o verificador; salvar e carregar', res.length >= 2 && res.every(r => r.ok && (!r.flat || r.fits)) && !bad.length && after === res.length && !bad2.length && q0 === 0 && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(', ')}); o verificador S0–S2: ${q0} antes, ${bad.length} com eles${bad.length ? ' (' + bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}, ${bad2.length} depois do save; ${after} de ${res.length} iguais depois de salvar e carregar${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
  // a new world: the three steps of each people by its city, a year, a save
  { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const q0 = qa().length; const res = []; const ids = { 4: 'templo', 6: 'grande', 8: 'monumental' };
    for (const c of POVOS) { const set = [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c); if (!set) continue;
      for (const n of TPL) { const at = flatLot(set, n, 40); const r = stand(set, 'temple', ids[n], at ? { x: at.x, y: at.y, R: 1, flat: 1 } : { R: 40 }); if (!r.none) res.push(r); } }
    const bad = qa(); M.saltar(1); const bad1 = qa(); const alive = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.built && In.plan(b) && In.plan(b).ok; }).length;
    M.salvarCarregar(); const bad2 = qa(); const flat = res.filter(r => r.flat);
    ok('D8b de pé num mundo novo: os três degraus de cada povo perto da sua cidade — a planta, o relatório, a entrada onde o chão cabe no pódio, o verificador; um ano; salvar e carregar', res.length === TPL.length * POVOS.length && res.every(r => r.ok) && flat.every(r => r.fits) && flat.length >= POVOS.length && !bad.length && !bad1.length && !bad2.length && alive === res.length && M.limpo(),
      `${res.length} de ${TPL.length * POVOS.length} de pé, ${flat.length} em chão de até 3 m (${res.map(tell).join(', ')}); o verificador S0–S2: ${q0} antes, ${bad.length} com eles, ${bad1.length} depois de um ano, ${bad2.length} depois do save${bad.concat(bad1, bad2).length ? ' (' + bad.concat(bad1, bad2).slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}; ${alive} de pé e com planta depois do ano${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
}
// ---------------------------------------------------------------- D9: the bad cases
function D9() {
  const qa = qaS, mine = () => globalThis.QA.check().filter(q => q.sys === 'poder');
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const out = [], said = [];
  const setOf = c => [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c);
  const found = (set, step, built) => { let b; G.inSim++; try { b = G.Village.handFound(set, 'temple', step, { built, R: 40 }); } finally { G.inSim--; } return b; };
  // (a) the work of the monumental sanctuary saved in the middle, loaded and finished
  { const b = found(setOf('egipcio'), 'monumental', false); if (!b) out.push('a obra do santuário sem lote');
    else { const id = b.id; M.salvarCarregar(); const b1 = G.S.buildings.get(id); const q1 = qa();
      if (!b1 || b1 === b || b1.built || b1.w !== 8 || b1.esc !== 'monumental') out.push(`a obra depois do save: ${b1 ? `${b1.w} casas, ${b1.esc}, ${b1.built ? 'pronta' : 'em obra'}` : 'sumiu'}`);
      else { G.inSim++; try { G.Village.completeBuilding(b1); } finally { G.inSim--; } const p = In.plan(b1);
        if (!p || !p.ok || b1.ip.f !== TFAM) out.push(`a obra acabada: ${b1.ip ? b1.ip.f : 'sem registro'}, ${p && p.ok ? 'planta ok' : 'planta NÃO: ' + (p ? p.errs.slice(0, 2).join('; ') : '-')}`); }
      if (q1.length) out.push(`o verificador no meio da obra: ${q1.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ')}`);
      said.push('a obra salva no meio (o save devolve as 8 casas e o degrau) e acabada: a família da forma, a planta'); } }
  // (b) the god razes the great temple: its ruin, its plan; saved and loaded
  { const b = found(setOf('grego'), 'grande', true); if (!b) out.push('o grande templo sem lote');
    else { const id = b.id; G.inSim++; try { G.Village.destroyBuilding(b, 'deus'); } finally { G.inSim--; } const r = G.S.buildings.get(id); const p = r && In.plan(r);
      if (!r || r.type !== 'ruin' || !p || !p.ok) out.push(`a ruína: ${r ? r.type : 'sumiu'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`);
      M.salvarCarregar(); const r2_ = G.S.buildings.get(id); const p2 = r2_ && In.plan(r2_);
      if (r && (!r2_ || r2_.type !== 'ruin' || r2_.w !== r.w || !p2 || !p2.ok)) out.push(`a ruína depois do save: ${r2_ ? `${r2_.type}, ${r2_.w} casas` : 'sumiu'}`);
      said.push('o grande templo derrubado pelo deus: a ruína com a sua planta, salva e carregada'); } }
  const bad = qa(); if (bad.length) out.push(`o verificador: ${bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ')}`);
  // (c) the checker's rule catches a temple of a bigger step laid out by a recipe's family
  { const b = found(setOf('romano'), 'templo', true); if (!b) out.push('o templo romano sem lote');
    else { const f0 = b.ip.f; b.ip.f = 'w-salao.terreo'; const caught = mine().length; b.ip.f = f0; const quiet = mine().length;
      if (!caught || quiet) out.push(`a regra: ${caught} avisos com a família da receita, ${quiet} com a da forma`); else said.push('a regra do verificador pega a família da receita'); } }
  ok('D9a os casos ruins do templo: a obra salva no meio, o templo derrubado, o verificador limpo — e a sua regra pega a planta de outra família', !out.length && M.limpo(), out.length ? out.join(' / ') : said.join('; ') + (M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)));
}
// ================================================================ F: the tavern (taverna 3, hospedaria 4)
const VPL = [3, 4], VFAM = 'estalagem.andar', TODOS = POVOS.concat(OUTROS);
const vrec = (c, s, n) => In.newRecord({ id: 0, type: 'taverna', style: c, x: 8, y: 8, w: n, h: n }, { t: 'taverna', c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: 1, w: 1, pw: 0, s, o: (1 << n) - 1, n });
const vtag = m => `V${m.n}/${m.c}/${m.s}`;
let vcache = null;
const taverns = () => {
  if (vcache) return vcache; G.S = blankS(); vcache = []; let id = 92001;
  for (const n of VPL) for (const c of TODOS) for (const s of LADOS) {
    const b = { id: (id += 29), type: 'taverna', style: c, x: 8, y: 8, w: n, h: n, built: true }; b.ip = rec('taverna', c, s, n, VFAM);
    const t0 = clock(); const p = In.makeFam(b, b.ip, VFAM); const ms = clock() - t0; G.S.buildings.set(b.id, b); vcache.push({ n, c, s, b, p, ms, so: In.shellOf(b) });
  }
  return vcache;
};
// (the seats of a plan where one sits at once — at a table, on a bench —, each reached from the door)
const seatsOf = p => { let n = 0; for (const q of placesOf(p, 'comer').concat(placesOf(p, 'sentar'))) { const d = q.on ? Math.min(Infinity, ...q.it.spots.filter(sp => !sp.on && sp.ok).map(sp => walkTo(p, q.lv, sp.x, sp.z))) : walkTo(p, q.lv, q.x, q.z); if (d < Infinity) n++; } return n; };
// ---------------------------------------------------------------- F1: the ladder
function F1() {
  const out = []; for (const n of VPL) for (const c of TODOS) if (!Es.can('taverna', c, n)) out.push(`V${n}/${c}: o degrau não oferecido`);
  ok('F1a a escada da taverna — a taberna (2 casas), a taverna (3), a hospedaria (4) — oferecida a todo povo pela planta do tamanho (a taverna não tem forma)', !out.length && !Fo.has('taverna', 'grego'),
    out.join(' / ') || `os degraus: ${Es.steps('taverna').map(s => `${s.id} ${s.n}`).join(', ')}; In.sizeOk de 3 e 4 nos seis povos (TYPES.taverna.sizes); nenhuma forma: o deus e o 3D a desenham pela casca da planta`);
}
// ---------------------------------------------------------------- F2: the plans
function F2() {
  const V = taverns(); const bad = V.filter(m => !m.p.ok); const offer = [];
  for (const n of VPL) for (const c of TODOS) { const r = vrec(c, 'S', n); if (r.f !== VFAM) offer.push(`V${n}/${c}: o registro com ${r.f}`); if (!In.familiesFor(r).ok.includes(VFAM)) offer.push(`V${n}/${c}: o catálogo sem a estalagem`); }
  ok('F2a a planta da taverna e da hospedaria em todo povo e lado pela estalagem — a família que o mundo dá ao registro do degrau', !bad.length && !offer.length, `${V.length - bad.length} de ${V.length} plantas${bad.length ? '; ' + some(bad).map(m => `${vtag(m)}: ${m.p.errs.slice(0, 2).join('; ')}`).join(' / ') : ''}${offer.length ? '; ' + offer.join(' · ') : '; o registro novo e o catálogo com a estalagem em todos'}`);
  const cl = TODOS.map(c => [c, vrec(c, 'S', 2).f]).filter(([, f]) => f === VFAM || !/^w-/.test(f));
  ok('F2b a taberna (2 casas) com as famílias da receita de antes', !cl.length, cl.length ? cl.map(([c, f]) => `${c}: ${f}`).join(', ') : `nos seis povos (${TODOS.map(c => vrec(c, 'S', 2).f).filter((f, q, a) => a.indexOf(f) === q).join(', ')})`);
  const diff = V.filter(m => m.p.ok).filter(m => { const q = In.makeFam(m.b, m.b.ip, VFAM); return JSON.stringify([q.rooms, q.items.map(i => [i.kind, i.x, i.z, i.ry]), q.doors, q.holes]) !== JSON.stringify([m.p.rooms, m.p.items.map(i => [i.kind, i.x, i.z, i.ry]), m.p.doors, m.p.holes]); });
  ok('F2c a mesma planta duas vezes da mesma entrada', !diff.length, `${diff.length} diferentes${diff.length ? ': ' + some(diff).map(vtag).join(', ') : ''}`);
  const sh = V.filter(m => m.p.ok && (!m.so || strip(m.so) !== strip(In.shellOfPlan(m.p))));
  ok('F2d a casca de longe igual à da planta', !sh.length, `${sh.length} cascas diferentes${sh.length ? ': ' + some(sh).map(vtag).join(', ') : ''}`);
  const ts = V.slice().sort((a, b) => b.ms - a.ms); const med = V.map(q => q.ms).sort((a, b) => a - b)[V.length >> 1];
  const again = ts.slice(0, 3).map(m => { let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(m.b, m.b.ip, VFAM); best = Math.min(best, clock() - a); } return [vtag(m), best]; }).sort((a, b) => b[1] - a[1]);
  ok('F2e o tempo de fazer a planta (alvo: 400 ms em Node)', again[0][1] < 400, `a mais cara ${again[0][1].toFixed(0)} ms (${again[0][0]}, sem cache); a mediana ${med.toFixed(0)} ms na rodada`);
  const tab = V.filter(m => m.n === 4 && m.s === 'S' && m.p.ok).map(m => { const a = clock(); const t = In.table(m.b); return [m.c, clock() - a, t ? t.spots.length : 0]; }).sort((a, b) => b[1] - a[1]);
  ok('F2f a tabela dos lugares da hospedaria a tempo (alvo: 1 s em Node)', tab.length === TODOS.length && tab[0][1] < 1000, tab.map(([c, ms, n]) => `${c} ${ms.toFixed(0)} ms (${n} lugares)`).join(', '));
}
// ---------------------------------------------------------------- F3: the inn
function F3() {
  const out = [], sum = [];
  for (const m of taverns().filter(q => q.p.ok && q.n === 4)) {
    const p = m.p; const why = []; const room = fn => p.rooms.find(q => q.fn === fn); const hall = room('salao');
    if (!hall) { out.push(`${vtag(m)}: sem o salão`); continue; }
    const a = hall.r[2] - hall.r[0], b = hall.r[3] - hall.r[1]; if (Math.max(a, b) < 10 - 1e-6 || Math.min(a, b) < 8 - 1e-6) why.push(`o salão de ${a.toFixed(1)} × ${b.toFixed(1)} m`);
    const tables = p.items.filter(i => i.kind === 'mesa-terreiro' || i.kind === 'mesa').length; if (tables < 8) why.push(`${tables} mesas`);
    const kit = room('cozinha'), cel = room('adega'); const inRoom = (k, r) => p.items.some(i => k.includes(i.kind) && r && i.room === r.id);
    if (!kit || !inRoom(['fogao', 'lar', 'braseiro'], kit)) why.push('a cozinha sem o seu fogo'); if (!cel || !inRoom(['pipas'], cel)) why.push('o depósito sem as pipas');
    if (!p.items.some(i => i.kind === 'balcao')) why.push('sem o balcão'); if (!(reachOf(p, 'vender') < Infinity && reachOf(p, 'comprar') < Infinity)) why.push('o balcão que a porta não alcança');
    const seats = seatsOf(p); if (seats < 20) why.push(`${seats} fregueses sentados`);
    if (why.length) out.push(`${vtag(m)}: ${why.join(', ')}`);
    if (m.s === 'S') sum.push(`${m.c} ${a.toFixed(1)}×${b.toFixed(1)} m, ${tables} mesas, ${seats} sentados`);
  }
  ok('F3a a hospedaria: o salão ≥ 10 × 8 m, ≥ 8 mesas, a cozinha com o fogo, o depósito das pipas, o balcão; ≥ 20 fregueses sentados ao mesmo tempo', !out.length, some(out).join(' / ') || sum.join('; '));
}
// ---------------------------------------------------------------- F4: the body's rules
function F4() {
  const out = [];
  for (const m of taverns().filter(q => q.p.ok && q.s === 'S')) {
    const p = m.p; const why = []; const hole = d => p.holes.find(h => h.door === d.id);
    const rua = p.doors.find(d => d.rooms.includes('rua')); if (!rua || hole(rua).h < 2.2 - 1e-6) why.push(`o portão da rua de ${rua ? hole(rua).h.toFixed(2) : '-'} m`);
    const hall = p.rooms.find(q => q.fn === 'salao'); const hd = hall && p.doors.find(d => d.rooms.includes(hall.id) && d.rooms.some(x => x !== 'rua' && p.rooms[x] && p.rooms[x].fn === 'terreiro'));
    if (!hd || hole(hd).h < 2.2 - 1e-6) why.push(`a porta do salão de ${hd ? hole(hd).h.toFixed(2) : '-'} m`);
    for (const s of p.stairs) if (s.kind === 'escada' && !(s.cls === 'degraus' || s.cls === 'escada')) why.push(`uma escada de ${s.slope}° (${s.cls})`);
    if (!(reachOf(p, 'deitar') < Infinity)) why.push('as camas de cima que a porta não alcança');
    if (why.length) out.push(`${vtag(m)}: ${why.join(', ')}`);
  }
  ok('F4a as regras do corpo: o portão e a porta do salão ≥ 2,2 m, a escada que os pés sobem, os quartos de cima alcançados', !out.length, some(out).join(' / ') || `nos ${taverns().filter(q => q.s === 'S').length} (a taverna e a hospedaria dos seis povos)`);
}
// ---------------------------------------------------------------- F5: standing in the world
function F5() {
  const qa = qaS; const tell = r => `${r.st}/V${r.b.w} ${r.d.toFixed(0)} casas ${r.rel.toFixed(1)} m${r.ok ? '' : ' — ' + r.why}`;
  const seated = b => (In.slots ? In.slots(b, 'comer').length + In.slots(b, 'sentar').length : 0);
  { M.pronto('metropole'); const q0 = qa().length; const res = [];
    for (const c of TODOS) { const sets = [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
      for (const set of sets) { const r = stand(set, 'taverna', 'hospedaria', { R: 40 }); if (!r.none) { res.push(r); break; } } }
    const low = res.filter(r => r.ok && seated(r.b) < 20).map(r => `${r.st} ${seated(r.b)}`); const bad = qa(); M.salvarCarregar(); const after = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.w === 4 && b.esc === 'hospedaria' && In.plan(b).ok && b.ip.f === VFAM; }).length; const bad2 = qa();
    ok('F5a de pé num mundo pronto (a metrópole): a hospedaria pela mão do deus — a planta, o relatório, os lugares da tabela do mundo (≥ 20 sentados), o verificador; salvar e carregar', res.length >= 2 && res.every(r => r.ok) && !low.length && !bad.length && after === res.length && !bad2.length && q0 === 0 && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(', ')}); sentados na tabela do mundo: ${res.map(r => seated(r.b)).join(', ')}${low.length ? ' — poucos: ' + low.join(', ') : ''}; o verificador S0–S2: ${q0} antes, ${bad.length} com elas${bad.length ? ' (' + bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}, ${bad2.length} depois do save; ${after} de ${res.length} iguais depois de salvar e carregar${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
  { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const q0 = qa().length; const res = []; const ids = { 3: 'taverna', 4: 'hospedaria' };
    for (const c of TODOS) { const set = [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c); if (!set) continue; for (const n of VPL) { const r = stand(set, 'taverna', ids[n], { R: 40 }); if (!r.none) res.push(r); } }
    const bad = qa(); M.saltar(1); const bad1 = qa(); const alive = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.built && In.plan(b) && In.plan(b).ok; }).length; M.salvarCarregar(); const bad2 = qa();
    ok('F5b de pé num mundo novo: a taverna e a hospedaria de cada povo perto da sua cidade — a planta, o relatório, o verificador; um ano; salvar e carregar', res.length >= 2 * POVOS.length && res.every(r => r.ok) && !bad.length && !bad1.length && !bad2.length && alive === res.length && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(', ')}); o verificador S0–S2: ${q0} antes, ${bad.length} com elas, ${bad1.length} depois de um ano, ${bad2.length} depois do save${bad.concat(bad1, bad2).length ? ' (' + bad.concat(bad1, bad2).slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}; ${alive} de pé e com planta depois do ano${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
}
// ---------------------------------------------------------------- F6: the bad cases
function F6() {
  const qa = qaS, mine = () => globalThis.QA.check().filter(q => q.sys === 'poder');
  M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const out = [], said = [];
  const setOf = c => [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c);
  const found = (set, step, built) => { let b; G.inSim++; try { b = G.Village.handFound(set, 'taverna', step, { built, R: 40 }); } finally { G.inSim--; } return b; };
  { const b = found(setOf('romano'), 'hospedaria', false); if (!b) out.push('a obra da hospedaria sem lote');
    else { const id = b.id; M.salvarCarregar(); const b1 = G.S.buildings.get(id); const q1 = qa();
      if (!b1 || b1 === b || b1.built || b1.w !== 4 || b1.esc !== 'hospedaria') out.push(`a obra depois do save: ${b1 ? `${b1.w} casas, ${b1.esc}, ${b1.built ? 'pronta' : 'em obra'}` : 'sumiu'}`);
      else { G.inSim++; try { G.Village.completeBuilding(b1); } finally { G.inSim--; } const p = In.plan(b1); if (!p || !p.ok || b1.ip.f !== VFAM) out.push(`a obra acabada: ${b1.ip ? b1.ip.f : 'sem registro'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`); }
      if (q1.length) out.push(`o verificador no meio da obra: ${q1.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ')}`);
      said.push('a obra da hospedaria salva no meio e acabada: a estalagem, a planta'); } }
  { const b = found(setOf('nordico'), 'taverna', true); if (!b) out.push('a taverna sem lote');
    else { const id = b.id; G.inSim++; try { G.Village.destroyBuilding(b, 'deus'); } finally { G.inSim--; } const r = G.S.buildings.get(id); const p = r && In.plan(r);
      if (!r || r.type !== 'ruin' || !p || !p.ok) out.push(`a ruína: ${r ? r.type : 'sumiu'}, ${p && p.ok ? 'planta ok' : 'planta NÃO'}`); M.salvarCarregar(); said.push('a taverna derrubada pelo deus: a ruína, salva e carregada'); } }
  const bad = qa(); if (bad.length) out.push(`o verificador: ${bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ')}`);
  { const b = found(setOf('grego'), 'hospedaria', true); if (!b) out.push('a hospedaria grega sem lote');
    else { const f0 = b.ip.f; b.ip.f = 'w-terreiro.andar'; const caught = mine().length; b.ip.f = f0; const quiet = mine().length;
      if (!caught || quiet) out.push(`a regra: ${caught} avisos com a família da receita, ${quiet} com a estalagem`); else said.push('a regra do verificador pega a família da receita num degrau maior'); } }
  ok('F6a os casos ruins da taverna: a obra salva no meio, a taverna derrubada, o verificador limpo — e a sua regra pega a planta de outra família', !out.length && M.limpo(), out.length ? out.join(' / ') : said.join('; ') + (M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)));
}
// ================================================================ G: the houses (the hut and the house of 4 m, the rich house of 8)
const GFAM = 'domus.patio';
const hrec = (t, c, s, n, wb, d) => In.newRecord({ id: 0, type: t, style: c, x: 8, y: 8, w: n, h: n }, { t, c, e: 3, k: 'ae', cl: c === 'egipcio' ? 'q' : 't', fl: 0, d: d || 1, w: wb, pw: 0, s, o: (1 << n) - 1, n });
const gtag = m => `domus/${m.c}/${m.s}/w${m.wb}`;
let gcache = null;
const domuses = () => {
  if (gcache) return gcache; G.S = blankS(); gcache = []; let id = 91001;
  for (const c of TODOS) for (const s of LADOS) for (const wb of [0, 2]) {
    const b = { id: (id += 23), type: 'house', style: c, x: 8, y: 8, w: 2, h: 2, built: true }; b.ip = Object.assign(hrec('house', c, s, 2, wb), { f: GFAM });
    const t0 = clock(); const p = In.makeFam(b, b.ip, GFAM); const ms = clock() - t0; G.S.buildings.set(b.id, b); gcache.push({ c, s, wb, b, p, ms, so: In.shellOf(b) });
  }
  return gcache;
};
// ---------------------------------------------------------------- G1: the hut and the house keep their 4 m
function G1() {
  G.S = blankS(); const out = []; let id = 90001;
  for (const t of ['hut', 'house']) {
    if (G.BDEF[t].w !== 1 || G.BDEF[t].h !== 1) out.push(`${t}: ${G.BDEF[t].w}×${G.BDEF[t].h} casas`); if (Es.classic(t).n !== 1) out.push(`${t}: o degrau clássico de ${Es.classic(t).n}`);
    for (const c of TODOS) { const b = { id: (id += 11), type: t, style: c, x: 8, y: 8, w: 1, h: 1, built: true }; b.ip = hrec(t, c, 'S', 1, 1, 2); const p = In.make(b, b.ip);
      if (!p.ok) out.push(`${t}/${c}: a planta (${p.errs.slice(0, 1)})`); else if (p.lot.w !== 4) out.push(`${t}/${c}: o lote de ${p.lot.w} m`); if (b.ip.f === GFAM) out.push(`${t}/${c}: com a família do degrau maior`); }
  }
  ok('G1a a cabana e a casa continuam com 4 × 4 m — a tabela, o degrau clássico, a planta do registro novo pelas famílias de antes', !out.length, out.join(' / ') || 'nos seis povos, o lote de 4 m e as famílias da receita');
}
// ---------------------------------------------------------------- G2: the rich house
function G2() {
  const H = domuses(); const bad = H.filter(m => !m.p.ok); const out = []; const dom = Es.steps('house').find(s => s.id === 'domus');
  for (const c of TODOS) { if (!Es.can('house', c, 2)) out.push(`${c}: o degrau não oferecido`); const r = hrec('house', c, 'S', 2, 2); if (r.f !== GFAM) out.push(`${c}: o registro com ${r.f}`); if (!In.familiesFor(r).ok.includes(GFAM)) out.push(`${c}: o catálogo sem a da casa rica`); }
  const sh = H.find(m => m.p.ok); const shs = sh ? `${(sh.p.shell.r[2] - sh.p.shell.r[0]).toFixed(1)} × ${(sh.p.shell.r[3] - sh.p.shell.r[1]).toFixed(1)} m` : '-';
  ok('G2a a casa rica (domus): o degrau de uma família (familia), 2 casas — o lote de 8 × 8 m —, a planta em todo povo, lado e riqueza pela família do degrau (a do registro novo e do catálogo)', !!(dom && dom.n === 2 && dom.familia) && !bad.length && !out.length,
    `${H.length - bad.length} de ${H.length} plantas${bad.length ? '; ' + some(bad).map(m => `${gtag(m)}: ${m.p.errs.slice(0, 2).join('; ')}`).join(' / ') : ''}${out.length ? '; ' + out.join(' · ') : ''}; o lote ${dom ? dom.n * 4 : '-'} × ${dom ? dom.n * 4 : '-'} m, a casa ${shs}`);
  const why = [], sum = new Map();
  for (const m of H.filter(q => q.p.ok)) { const p = m.p; const w2 = [];
    if (p.cap.places < (G.BDEF.house.housing || 6)) w2.push(`${p.cap.places} lugares de dormir`);
    // (the fire where the household cooks: its place to cook, bake or warm — the three a supper is made at, act-lar.js)
    if (!p.items.some(i => ['lar', 'fogao', 'forno', 'braseiro', 'fogareiro', 'fogo-chao'].includes(i.kind))) w2.push('sem o fogo'); else if (!(Math.min(reachOf(p, 'cozinhar'), reachOf(p, 'assar'), reachOf(p, 'aquecer')) < Infinity)) w2.push('o fogo que a porta não alcança');
    if (!p.rooms.some(q => q.open && q.fn === 'patio') || !p.shell.court) w2.push('sem o pátio aberto');
    if (!(reachOf(p, 'deitar') < Infinity)) w2.push('as camas que a porta não alcança');
    if (w2.length) why.push(`${gtag(m)}: ${w2.join(', ')}`);
    if (m.s === 'S' && m.wb === 2) sum.set(m.c, `${p.cap.places} (${p.items.filter(i => i.places > 0).map(i => i.kind).filter((k, q, a) => a.indexOf(k) === q).join('+')})`); }
  ok('G2b a casa rica abriga a família (≥ 6 lugares de dormir), com o fogo e o pátio aberto, cada um alcançado da porta', !why.length, some(why).join(' / ') || `lugares de dormir, a rica de cada povo: ${[...sum].map(([c, v]) => `${c} ${v}`).join(', ')}`);
  const diff = H.filter(m => m.p.ok).filter(m => { const q = In.makeFam(m.b, m.b.ip, GFAM); return JSON.stringify([q.rooms, q.items.map(i => [i.kind, i.x, i.z, i.ry]), q.doors, q.holes]) !== JSON.stringify([m.p.rooms, m.p.items.map(i => [i.kind, i.x, i.z, i.ry]), m.p.doors, m.p.holes]); });
  const shd = H.filter(m => m.p.ok && (!m.so || strip(m.so) !== strip(In.shellOfPlan(m.p))));
  ok('G2c a mesma planta duas vezes da mesma entrada; a casca de longe igual à da planta', !diff.length && !shd.length, `${diff.length} plantas diferentes, ${shd.length} cascas diferentes${diff.concat(shd).length ? ': ' + some(diff.concat(shd)).map(gtag).join(', ') : ''}`);
  const ts = H.slice().sort((a, b) => b.ms - a.ms); const again = ts.slice(0, 3).map(m => { let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.makeFam(m.b, m.b.ip, GFAM); best = Math.min(best, clock() - a); } return [gtag(m), best]; }).sort((a, b) => b[1] - a[1]);
  const tab = H.filter(m => m.s === 'S' && m.wb === 2 && m.p.ok).map(m => { const a = clock(); In.table(m.b); return clock() - a; }).sort((a, b) => b - a);
  ok('G2d o tempo de fazer a planta (alvo: 400 ms) e a tabela dos lugares (alvo: 1 s) em Node', again[0][1] < 400 && tab[0] < 1000, `a planta mais cara ${again[0][1].toFixed(0)} ms (${again[0][0]}, sem cache); a tabela mais cara ${tab[0].toFixed(0)} ms`);
}
// ---------------------------------------------------------------- G3: standing in the world; the bad cases
function G3() {
  const qa = qaS, mine = () => globalThis.QA.check().filter(q => q.sys === 'poder'); const tell = r => `${r.st} ${r.d.toFixed(0)} casas${r.ok ? '' : ' — ' + r.why}`;
  { M.pronto('metropole'); const q0 = qa().length; const res = [];
    for (const c of TODOS) { const set = [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]; if (!set) continue; const r = stand(set, 'house', 'domus', { R: 30 }); if (!r.none) res.push(r); }
    const offered = (() => { const set = [...G.S.settlements.values()].find(s => G.Fac.get(s.fac)); if (!set) return '-'; const a = Es.choose(set, 'house').map(s => s.id), b = Es.choose(set, 'house', { familia: true }).map(s => s.id); return `a cidade: ${a.join(',')}; a família: ${b.join(',')}`; })();
    const bad = qa(); M.salvarCarregar(); const after = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.w === 2 && b.esc === 'domus' && In.plan(b).ok && b.ip.f === GFAM; }).length; const bad2 = qa();
    // (the checker's rule: a rich house laid out by a recipe of the lot of 4 m is caught, and quiet once it is the step's family again)
    let rule = '-'; const one = res.length && G.S.buildings.get(res[0].b.id); if (one) { const f0 = one.ip.f; one.ip.f = 'integrado.terreo'; const caught = mine().length; one.ip.f = f0; rule = caught && !mine().length ? 'a regra pega a receita' : `a regra: ${caught} com a receita, ${mine().length} com a do degrau`; }
    ok('G3a de pé num mundo pronto (a metrópole): a casa rica pela mão do deus em cada povo — a planta, o relatório, o verificador; salvar e carregar; o degrau só para a família; a regra do verificador', res.length >= 3 && res.every(r => r.ok) && !bad.length && after === res.length && !bad2.length && q0 === 0 && rule === 'a regra pega a receita' && /a família: domus/.test(offered) && !/a cidade: [^;]*domus/.test(offered) && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(', ')}); ${offered}; o verificador S0–S2: ${q0} antes, ${bad.length} com elas${bad.length ? ' (' + bad.slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}, ${bad2.length} depois do save; ${after} de ${res.length} iguais depois de salvar e carregar; ${rule}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
  { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' }); const q0 = qa().length; const res = [];
    for (const c of TODOS) { const set = [...G.S.settlements.values()].find(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c); if (!set) continue; const r = stand(set, 'house', 'domus', { R: 30 }); if (!r.none) res.push(r); }
    const bad = qa(); M.saltar(1); const bad1 = qa(); const alive = res.filter(r => { const b = G.S.buildings.get(r.b.id); return b && b.built && b.w === 2 && In.plan(b) && In.plan(b).ok; }).length;
    const ruin = res.length && G.S.buildings.get(res[0].b.id); let razed = '-'; if (ruin) { G.inSim++; try { G.Village.destroyBuilding(ruin, 'deus'); } finally { G.inSim--; } const r = G.S.buildings.get(ruin.id); razed = r && r.type === 'ruin' && In.plan(r).ok ? 'a derrubada vira ruína com planta' : 'a ruína: ' + (r ? r.type : 'sumiu'); }
    M.salvarCarregar(); const bad2 = qa();
    ok('G3b de pé num mundo novo: a casa rica de cada povo — a planta, o verificador; um ano; uma derrubada; salvar e carregar', res.length >= 4 && res.every(r => r.ok) && !bad.length && !bad1.length && !bad2.length && alive >= res.length - 1 && razed === 'a derrubada vira ruína com planta' && M.limpo(),
      `${res.length} de pé (${res.map(tell).join(', ')}); ${alive} de pé e com planta depois do ano; ${razed}; o verificador S0–S2: ${q0} antes, ${bad.length} com elas, ${bad1.length} depois de um ano, ${bad2.length} depois do save${bad.concat(bad1, bad2).length ? ' (' + bad.concat(bad1, bad2).slice(0, 2).map(q => q.msg.slice(0, 100)).join('; ') + ')' : ''}${M.limpo() ? '' : '; ERROS: ' + JSON.stringify(M.erros()).slice(0, 200)}`); }
}
for (const [k, f] of [['B1', B1], ['B2', B2], ['B3', B3], ['B4', B4], ['B5', B5], ['B6', B6], ['B7', B7], ['B8', B8], ['B9', B9], ['B10', B10], ['B11', B11],
  ['D1', D1], ['D2', D2], ['D3', D3], ['D4', D4], ['D5', D5], ['D6', D6], ['D7', D7], ['D8', D8], ['D9', D9],
  ['F1', F1], ['F2', F2], ['F3', F3], ['F4', F4], ['F5', F5], ['F6', F6], ['G1', G1], ['G2', G2], ['G3', G3]]) if (want(k)) f();
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
