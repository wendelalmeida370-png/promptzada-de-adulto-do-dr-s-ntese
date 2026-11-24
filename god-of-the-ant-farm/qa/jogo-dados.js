// jogo-dados: o jogo de copo da taverna (a quarta onda, T4 — D-850 a D-859), em Node, pelo qa/nodemundo.js:
//  j1 a regra pura: as faces do G.hash (de 1 a 6, iguais e uniformes), os palpites livres, a soma, quem crava, quem fica mais longe, os
//     empates (dois igualmente longe perdem os dois; todos igualmente longe, ninguém), quem sai e quem leva, a mão rápida (a troca que crava
//     ou que salva) e quem a vê — o mesmo resultado nas mesmas entradas
//  j2 mil partidas simuladas pela mesma regra: justa (os iguais vencem por igual, de qualquer lugar à mesa), a duração, e a índole que pesa
//     — quem lê os outros vence mais, o blefe do ousado cobra o seu preço, o trapaceiro ganha às vezes e é pego pelos atentos
//  j3 os fregueses jogando numa noite da metrópole pronta: os dados da casa feitos do osso que o povo teve (ou da madeira da prateleira), as
//     partidas que começam pela vontade de cada um, os palpites, as rodadas, o gesto do jogo e os dados de verdade na mão de quem joga
//  j4 o livro equilibrado: cada aposta entra no pote pelo livro, e todo pote sai inteiro — ao vencedor ou de volta a quem pôs —; nenhuma
//     moeda feita nem perdida
//  j5 um save no meio de uma partida: carregado duas vezes, vive o mesmo futuro; a partida volta onde estava e acaba
//  j6 o mundo sem o corpo, igual duas vezes: as mesmas partidas, os mesmos lances, o mesmo livro
//  j7 o corpo à mesa (pelas mãos: G.Possess.apply): chamar a mesa, a resposta de cada um pela índole e a bolsa, mudar a aposta, começar,
//     ver só os próprios dados, o palpite na sua vez (e o recusado: repetido, fora da conta, fora da vez), a mão rápida, largar o jogo
//  j8 o torneio da noite de festa (a porta da T1: G.JogoDados.torneio): o prêmio no pote pelo livro, o campeão que leva no fim da noite
//  e nenhum erro de módulo nem aviso no console, e o verificador limpo (a regra «dados» e as outras S1–S2).
//   node qa/jogo-dados.js [mundo]          (≈ 3 min; ONLY=j1,j2 em segundos)
const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js', 'qa/jogo-dados-inv.js'] });
const JD = G.JogoDados, R = JD.R, A = G.Act, D = G.Depot, T = G.Taverna;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | jogo-dados ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const on = k => !ONLY.length || ONLY.includes(k);
const world = process.argv[2] || 'metropole';
const S = () => G.S; const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const clock = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; }; const c0 = clock();
const tr = (o) => Object.assign({ ous: 0.5, ler: 0.5, aten: 0.5, hon: 0.9, habil: 0.5, cau: 0.5 }, o || {});

// ---------------- j1 the rule, pure ----------------
if (on('j1')) {
  const bad = []; const cnt = [0, 0, 0, 0, 0, 0, 0];
  for (let seed = 1; seed <= 400; seed++) for (let r = 1; r <= 4; r++) for (let id = 1; id <= 4; id++) for (let i = 0; i < 3; i++) { const f = R.face(seed * 977, r, id * 131, i); if (!(f >= 1 && f <= 6)) bad.push('face ' + f); cnt[f]++; if (R.face(seed * 977, r, id * 131, i) !== f) bad.push('a mesma entrada, outra face'); }
  const N = cnt.slice(1).reduce((a, b) => a + b, 0); const E = N / 6; const chi = cnt.slice(1).reduce((a, c) => a + (c - E) * (c - E) / E, 0);
  if (chi > 20.5) bad.push(`as faces não são uniformes (χ² ${chi.toFixed(1)}, 5 graus)`);
  // (a table of two, three dice each: the order, the free numbers, the result)
  const g = { seed: 7, r: 1, quem: [1, 2, 3], n: { 1: 2, 2: 2, 3: 2 }, fora: {}, faces: { 1: [6, 6], 2: [1, 2], 3: [3, 3] }, pal: [] };
  if (R.faixa(g).join() !== '6,36') bad.push('a faixa de seis dados: ' + R.faixa(g));
  { const o1 = R.ordem(g), o2 = R.ordem(Object.assign({}, g, { r: 2 })); if (o1.length !== 3 || o2.join() !== o1.slice(1).concat(o1.slice(0, 1)).join()) bad.push(`a ordem não roda a cada rodada: ${o1} → ${o2}`);
    const firsts = {}; for (let s = 1; s <= 300; s++) { const f = R.ordem(Object.assign({}, g, { seed: s }))[0]; firsts[f] = (firsts[f] || 0) + 1; } if (Object.values(firsts).some(x => x < 70)) bad.push('quem começa não é de qualquer um: ' + JSON.stringify(firsts)); }
  g.pal = [[1, 20], [2, 21], [3, 19]]; let res = R.resolve(g);
  if (res.total !== 21 || res.cravou !== 2 || res.queimou.slice().sort().join() !== '1,3') bad.push('quem crava (os outros perdem um dado): ' + JSON.stringify(res));
  if (R.livre(g, 20) || !R.livre(g, 22) || R.livre(g, 5) || R.livre(g, 37)) bad.push('os números livres');
  if (R.perto(g, 20, 20) === 20 || R.dito(g, R.perto(g, 20, 20))) bad.push('o perto livre');
  g.pal = [[1, 14], [2, 26], [3, 18]]; res = R.resolve(g); if (res.cravou || res.queimou.join() !== '1') bad.push('o mais longe: ' + JSON.stringify(res));
  g.pal = [[1, 18], [2, 24], [3, 22]]; res = R.resolve(g); if (res.queimou.slice().sort().join() !== '1,2') bad.push('dois igualmente longe perdem os dois: ' + JSON.stringify(res));
  const g2 = { seed: 7, r: 1, quem: [1, 2], n: { 1: 1, 2: 1 }, fora: {}, faces: { 1: [3], 2: [4] }, pal: [[1, 5], [2, 9]] }; res = R.resolve(g2); if (res.queimou.length) bad.push('todos igualmente longe: ninguém perde');
  // (a die less, out with none, the last one with dice takes it)
  const g3 = { seed: 7, r: 3, quem: [1, 2], n: { 1: 1, 2: 2 }, fora: {}, faces: { 1: [2], 2: [5, 5] }, pal: [[1, 4], [2, 11]] }; res = R.resolve(g3); const w = R.aplica(g3, res);
  if (w !== 2 || g3.fora[1] !== 'queimou') bad.push('quem sai e quem leva: ' + w + ' ' + JSON.stringify(g3.fora));
  // (the quick hand: the turn that hits the sum, else the one that saves from being farthest — none when none serves)
  const g4 = { seed: 9, r: 1, quem: [1, 2], n: { 1: 2, 2: 2 }, fora: {}, faces: { 1: [2, 3], 2: [4, 4] }, pal: [[1, 15], [2, 12]] };
  const t = R.virar(g4, 1); if (!t || t.kind !== 'crava' || t.total2 !== 15) bad.push('a mão rápida que crava: ' + JSON.stringify(t));
  const g5 = { seed: 9, r: 1, quem: [1, 2], n: { 1: 2, 2: 2 }, fora: {}, faces: { 1: [1, 1], 2: [6, 6] }, pal: [[1, 30], [2, 13]] };
  const t5 = R.virar(g5, 1); if (t5 && t5.kind === 'crava') bad.push('crava o impossível');
  const vs = R.visto(g4, 1, 2, tr({ aten: 0.9 }), tr({ habil: 0.2 })); if (vs !== R.visto(g4, 1, 2, tr({ aten: 0.9 }), tr({ habil: 0.2 }))) bad.push('quem vê muda nas mesmas entradas');
  ok('j1 a regra pura: as faces do mundo, a soma, quem crava, quem fica longe, os empates, quem sai, a mão rápida', !bad.length, bad.length ? bad.slice(0, 6).join(' | ') : `${N} faces de 1 a 6 (χ² ${chi.toFixed(1)}), sempre as mesmas; a faixa, a ordem que roda, os livres, o cravado, o mais longe, o empate dos dois e o de todos, a eliminação, a troca que crava`);
}

// ---------------- j2 a thousand games ----------------
if (on('j2')) {
  const bad = []; const sim = (n, mk, o) => { const out = []; for (let k = 0; k < n; k++) { const P = mk(k); out.push({ P, r: R.simula(10007 * (k + 1) + (o && o.salt || 0), P, o) }); } return out; };
  // (fair: three alike — each seat wins a third, whoever is first to bid)
  const A1 = sim(1200, () => [1, 2, 3].map(id => ({ id, tr: tr() })));
  const wins = { 1: 0, 2: 0, 3: 0 }; let rounds = 0; for (const x of A1) { wins[x.r.venc] = (wins[x.r.venc] || 0) + 1; rounds += x.r.rodadas; }
  const share = [1, 2, 3].map(id => wins[id] / A1.length); if (share.some(s => Math.abs(s - 1 / 3) > 0.05)) bad.push(`os iguais não vencem por igual: ${share.map(s => (s * 100).toFixed(1) + '%').join(' / ')}`);
  const d2 = sim(1200, () => [1, 2].map(id => ({ id, tr: tr() }))); const w2 = d2.filter(x => x.r.venc === 1).length / d2.length; if (Math.abs(w2 - 0.5) > 0.05) bad.push(`a dois, o primeiro vence ${(w2 * 100).toFixed(1)}%`);
  const len = rounds / A1.length; const len2 = d2.reduce((a, x) => a + x.r.rodadas, 0) / d2.length;
  if (len < 1.8 || len > 6) bad.push(`a partida de três dura ${len.toFixed(1)} rodadas`);
  // (the índole weighs: the reader against two who do not read; the bold one's bluff against two cautious)
  const rd = sim(1500, () => [{ id: 1, tr: tr({ ler: 0.95 }) }, { id: 2, tr: tr({ ler: 0.05 }) }, { id: 3, tr: tr({ ler: 0.05 }) }]); const wr = rd.filter(x => x.r.venc === 1).length / rd.length;
  if (!(wr > 0.36)) bad.push(`quem lê os outros vence ${(wr * 100).toFixed(1)}% (esperava mais que um terço)`);
  const bl = sim(1500, () => [{ id: 1, tr: tr({ ous: 1 }) }, { id: 2, tr: tr({ ous: 0.1 }) }, { id: 3, tr: tr({ ous: 0.1 }) }]); const wb = bl.filter(x => x.r.venc === 1).length / bl.length;
  if (Math.abs(wb - 1 / 3) < 0.015) bad.push(`o blefe do ousado não muda nada (${(wb * 100).toFixed(1)}%)`);
  // (the cheat: a dishonest one at a table of the drunk and distracted wins more; at a table of the attentive he is caught)
  const ch1 = sim(1200, () => [{ id: 1, tr: tr({ hon: 0.02, ous: 0.9, habil: 0.9 }) }, { id: 2, tr: tr({ aten: 0.05 }) }, { id: 3, tr: tr({ aten: 0.05 }) }]);
  const ch2 = sim(1200, () => [{ id: 1, tr: tr({ hon: 0.02, ous: 0.9, habil: 0.3 }) }, { id: 2, tr: tr({ aten: 0.95 }) }, { id: 3, tr: tr({ aten: 0.95 }) }]);
  const cw1 = ch1.filter(x => x.r.venc === 1).length / ch1.length, cw2 = ch2.filter(x => x.r.venc === 1).length / ch2.length;
  const tries1 = ch1.reduce((a, x) => a + x.r.trap.length, 0), caught1 = ch1.reduce((a, x) => a + x.r.trap.filter(q => q.pego).length, 0);
  const tries2 = ch2.reduce((a, x) => a + x.r.trap.length, 0), caught2 = ch2.reduce((a, x) => a + x.r.trap.filter(q => q.pego).length, 0);
  if (!(cw1 > 0.4)) bad.push(`o trapaceiro entre os distraídos vence ${(cw1 * 100).toFixed(1)}%`);
  if (!(cw2 < cw1 && caught2 / Math.max(1, tries2) > caught1 / Math.max(1, tries1) + 0.25)) bad.push(`o trapaceiro entre os atentos: vence ${(cw2 * 100).toFixed(1)}%, pego em ${caught2}/${tries2} (entre os distraídos ${caught1}/${tries1})`);
  const honest = sim(600, () => [1, 2, 3].map(id => ({ id, tr: tr({ hon: 0.8 }) }))); if (honest.some(x => x.r.trap.length)) bad.push('um honesto trapaceou');
  ok('j2 mil partidas: justa, curta, e a índole pesa (quem lê, o blefe, o trapaceiro e quem o vê)', !bad.length,
    `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}três iguais ${share.map(s => (s * 100).toFixed(1) + '%').join(' / ')} (${len.toFixed(1)} rodadas); dois iguais ${(w2 * 100).toFixed(1)}% (${len2.toFixed(1)} rodadas); quem lê ${(wr * 100).toFixed(1)}%; o ousado contra dois cautelosos ${(wb * 100).toFixed(1)}%; o trapaceiro: entre distraídos vence ${(cw1 * 100).toFixed(1)}% (pego ${caught1}/${tries1}), entre atentos ${(cw2 * 100).toFixed(1)}% (pego ${caught2}/${tries2}); honestos nunca`);
}

// ---------------- the night of the metrópole (j3, j4, j6; the snapshot for j5, j7, j8) ----------------
const need = ['j3', 'j4', 'j5', 'j6', 'j7', 'j8'].some(on);
const calm = () => { const w = S().weather; w.rain = 0; if (w.storm) w.storm = 0; if (!(S().divinePeace > G.DAY_LEN * 0.5)) god(() => G.Politics.divinePeace()); for (const s of S().settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: S().day, key: null, done: 1 }; } };
const seen = []; D.onMove.push(e => { seen.push({ t: e[2], from: e[3], to: e[4], k: e[5], n: e[6], op: e[7], c: e[8], by: e[9] }); });
const watch = bad => { for (const q of QA.check().filter(q => q.sev <= 2 || q.sys === 'dados')) { const m = `S${q.sev} ${q.sys}: ${q.msg}`; if (bad.length < 8 && !bad.includes(m)) bad.push(m); } };
const canon = () => JSON.stringify([A.all().filter(op => op.def === 'jogo-dados').map(op => [op.id, op.st, op.data.r, op.data.quem, op.data.fora, op.data.pal, op.data.venc, op.data.pote]), seen.filter(e => /^dados|^torneio/.test(e.c || '')).map(e => [e.from, e.to, e.n, e.c])]);
let SNAP = null, MID = null; const night = { games: 0, rounds: 0, acts: 0, hand: 0, handBad: [], made: [], bad: [] };
if (need) {
  M.pronto(world); calm();
  while (S().time < 0.55) { calm(); M.viver(1); }
  SNAP = G.Save.serialize();
  const led0 = seen.length; let n = 0;
  while (S().time < 0.86 && n < 4000) {
    calm(); M.viver(0.25); n++;
    // (the act is the tavern's, set in the people's step before the games' own: one step behind a game just ended is no fault — the
    // checker's own tolerance, S3 past 1,5 s —; who is in a game holds its set: T-2090)
    for (const v of S().villagers.values()) if (v.act === 'jogo-dados' && !(v.carry && v.carry.n > 1e-6) && JD.dadosDe(v)) { night.acts++; // (with the round's cup or plate in the hands, the dice wait on the table)
      const h = G.Inv.held(v); const k = JD.dadosDe(v); if (h.mao && h.mao === k) night.hand++; else if (night.handBad.length < 3) night.handBad.push(`#${v.id} segura ${h.mao || 'nada'} (o jogo: ${k})`); }
    if (!MID) { const op = JD.jogos().find(o => o.data.fase === 'palpite' && o.data.r >= 1 && o.data.pal.length >= 1); if (op) MID = { save: G.Save.serialize(), op: op.id }; }
    if (n % 20 === 0) watch(night.bad);
  }
  const ops = A.all().filter(op => op.def === 'jogo-dados');
  night.games = ops.filter(op => op.data.r >= 1).length; night.rounds = ops.reduce((a, op) => a + (op.data.hist || []).length, 0); night.ops = ops; night.led = seen.slice(led0);
  night.made = night.led.filter(e => e.c === 'dados');
}

// ---------------- j3 the customers at their games ----------------
if (on('j3') && need) {
  const bad = night.bad.slice(); const ops = night.ops;
  const hist = ops.flatMap(op => op.data.hist || []);
  const tal = {}; for (const op of ops) for (const k in op.data.tally || {}) tal[k] = (tal[k] || 0) + op.data.tally[k];
  // (the house's dice: made of bone where the people had bone, else of wood out of the shelf — each by the ledger)
  for (const e of night.made) { const b = S().buildings.get(+String(e.to || e.from).slice(2)); const fid = b && G.Village.facOfSet(b.set);
    if (e.k === 'dados.osso' && !(fid && G.Origem.matOK(fid, 'osso'))) bad.push(`dados de osso na taverna #${b && b.id}, de um povo que não teve osso`);
    if (e.k === 'wood' && e.to !== '@uso' && e.from === '@mundo') bad.push('madeira feita do nada'); }
  const sets = [...S().buildings.values()].filter(b => b.type === 'taverna' && b.built).map(b => [b.id, JD.casa(b)]);
  if (night.games < 1) bad.push('nenhuma partida a noite inteira');
  if (night.acts < 1) bad.push('ninguém fez o gesto do jogo');
  if (night.handBad.length) bad.push('os dados na mão: ' + night.handBad.join('; '));
  if (!sets.some(([, c]) => c['dados.osso'] + c['dados.madeira'] >= 1)) bad.push('nenhuma casa tem dados');
  ok('j3 os fregueses jogam entre si numa noite da metrópole: os dados da casa, as partidas pela vontade de cada um, os palpites, o gesto e os dados na mão', !bad.length,
    `${bad.length ? 'FALHOU: ' + bad.slice(0, 5).join(' | ') + ' — ' : ''}${night.games} partidas, ${night.rounds} rodadas (${hist.filter(h => h.cravou).length} cravadas, ${hist.filter(h => h.queimou.length).length} com um dado queimado), ${tal.vitoria || 0} vencedores; o gesto ${night.acts} vezes, ${night.hand} com os dados da mesa na mão; as casas: ${sets.map(([id, c]) => `#${id} ${c['dados.osso'] ? c['dados.osso'] + ' de osso' : ''}${c['dados.madeira'] ? c['dados.madeira'] + ' de madeira' : ''}`).join(', ')}; as olhadas das mesas ${JSON.stringify(JD.olhares)}${tal.trapaca || tal['trapaca-pega'] ? `; a mão rápida ${tal.trapaca || 0} sem ser vista, ${tal['trapaca-pega'] || 0} pega` : ''}`);
}

// ---------------- j4 the ledger ----------------
if (on('j4') && need) {
  const bad = []; const L = night.led.filter(e => /^dados-|^torneio-/.test(e.c || ''));
  const into = new Map(), out = new Map(); for (const e of L) { if (String(e.to).startsWith('j:')) into.set(e.to, (into.get(e.to) || 0) + e.n); if (String(e.from).startsWith('j:')) out.set(e.from, (out.get(e.from) || 0) + e.n); }
  for (const op of night.ops) { const ref = 'j:' + op.id; const i = into.get(ref) || 0, o = out.get(ref) || 0; const left = A.live(op) ? op.data.pote || 0 : 0;
    if (Math.abs(i - o - left) > 1e-6) bad.push(`o pote #${op.id}: entrou ${i}, saiu ${o}, ficou ${left}`); if (!A.live(op) && (op.data.pote || 0) > 1e-6) bad.push(`#${op.id} acabou com ${op.data.pote} no pote`); }
  if (L.some(e => e.k !== 'moedas')) bad.push('o pote com outra coisa que moedas');
  if (L.some(e => e.from === '@mundo' || e.to === '@uso')) bad.push('moeda feita ou sumida pelo jogo');
  const codes = {}; for (const e of L) codes[e.c] = Math.round(((codes[e.c] || 0) + e.n) * 100) / 100;
  ok('j4 o livro equilibrado: cada aposta no pote pelo livro, e todo pote sai inteiro, ao vencedor ou de volta', !bad.length && L.length > 0, `${bad.length ? 'FALHOU: ' + bad.slice(0, 4).join(' | ') + ' — ' : ''}${L.length} linhas do livro: ${JSON.stringify(codes)}; ${night.ops.length} potes, ${night.ops.filter(op => !A.live(op)).length} fechados e vazios`);
}

// ---------------- j5 a save in the middle of a game ----------------
if (on('j5') && need) {
  const bad = []; let info = 'nenhuma partida no meio para salvar';
  if (MID) {
    const live = () => { const L = seen.length; for (let k = 0; k < 120; k++) M.viver(0.25); const s = canon(); seen.length = L; return s; };
    const at = s => { M.reseed(5151); G.Save.apply(JSON.parse(s)); G.Main.mode = 'game'; };
    at(MID.save); const op0 = A.get(MID.op); const was = op0 ? [op0.data.fase, op0.data.r, op0.data.pal.length, op0.data.pote] : null;
    const a = live(); const end = A.get(MID.op);
    at(MID.save); const b = live();
    if (!was) bad.push('a partida não voltou no load'); if (a !== b) bad.push('o mesmo save, dois futuros');
    if (end && A.live(end)) bad.push('a partida não acabou em 30 s do mundo');
    const q = QA.check().filter(x => x.sys === 'dados' || x.sev <= 1); if (q.length) bad.push(q.slice(0, 2).map(x => x.msg).join('; '));
    info = `a partida #${MID.op} salva em ${was ? `${was[0]}, rodada ${was[1]}, ${was[2]} palpite(s), pote ${was[3]}` : '-'}; acabou (${end ? end.st + ' — ' + (end.end ? end.end.why : '') : '?'}); os dois futuros ${a === b ? 'iguais' : 'DIFERENTES'}`;
  }
  ok('j5 um save no meio da partida: volta onde estava, acaba, e o mesmo save vive o mesmo futuro', !!MID && !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${info}`);
}

// ---------------- j6 the world without the body, the same twice ----------------
if (on('j6') && need) {
  const run = () => { M.reseed(777); G.Save.apply(JSON.parse(SNAP)); G.Main.mode = 'game'; const L = seen.length; let n = 0; while (S().time < 0.78 && n < 3000) { calm(); M.viver(0.25); n++; } const s = canon(); const g = A.all().filter(op => op.def === 'jogo-dados' && op.data.r >= 1).length; seen.length = L; return [s, g]; };
  const [a, ga] = run(); const [b, gb] = run();
  ok('j6 o mundo sem o corpo, igual duas vezes: as mesmas partidas, os mesmos lances, o mesmo livro', a === b && ga > 0, `${ga} e ${gb} partidas; ${a === b ? 'iguais, lance a lance' : 'DIFERENTES'}`);
}

// ---------------- j7 the body at the table ----------------
if (on('j7') && need) {
  const bad = []; let info = '';
  const Po = G.Possess; const In = G.Interiors; const tried = new Set(); let pick = null, x = null, taken = false;
  // (a customer seated at a table with two more who could play — awake, free, not in a game —, of coin, in an open tavern: the god takes
  // the body on its seat; the table it was at, still with someone to play when the tavern sees it there — else the next table)
  // (and with time for a game before one's hour to go home: the cup's table holds nobody — T4 —, and one who accepted and went home at
  // once left the body's game at its first cups, T-2094)
  const could = (v, m, b) => v && m.g && !m.zz && m.st >= 2 && m.st <= 5 && v.task && v.task.type === 'tavern' && v.energy > 36 && !(G.Ebrio && G.Ebrio.grau(v) >= 2) && !JD.gameOf(v) && (!b || S().time < T.leaveOf(v, b) - 0.1);
  for (let tryN = 0; tryN < 6 && !(x && x.k === 'chamar' && x.ok); tryN++) {
    if (Po.body()) god(() => Po.release('deus')); M.reseed(99 + tryN); G.Save.apply(JSON.parse(SNAP)); G.Main.mode = 'game'; pick = null;
    for (let k = 0; k < 400 && !pick; k++) { calm(); M.viver(0.25);
      for (const op of A.all().filter(o => o.def === 'taverna' && A.live(o))) { const b = S().buildings.get(op.at); if (!T.aberta(b)) continue; const by = {};
        for (const id of Object.keys(op.data.mesa)) { const m = op.data.mesa[id]; const v = S().villagers.get(+id); if (!could(v, m, b)) continue; (by[m.g] = by[m.g] || []).push(v); }
        // (… and nobody at that table about to go home: the call is answered by whoever is free there, T-2094)
        const soon = g => Object.keys(op.data.mesa).some(id => { const o = S().villagers.get(+id); return String(op.data.mesa[id].g) === String(g) && o && S().time >= T.leaveOf(o, b) - 0.1; });
        for (const g in by) { if ((op.data.jogo && op.data.jogo[g]) || tried.has(op.at + ':' + g) || by[g].length < 3 || soon(g)) continue; const v = by[g].sort((a, c) => D.get(G.Eco.coinRef(c), 'moedas') - D.get(G.Eco.coinRef(a), 'moedas') || a.id - c.id)[0]; if (D.get(G.Eco.coinRef(v), 'moedas') >= 1 && Po.can(v).ok) { pick = { b, v, g }; tried.add(op.at + ':' + g); break; } }
        if (pick) break; } }
    if (!pick) break;
    const pl = In.placeOf(pick.v); god(() => Po.take(pick.v)); taken = Po.body() === pick.v; god(() => Po.use(pick.v, pick.b, pl)); M.viver(3); // (the tavern sees the body at its seat in its own second: D-767)
    for (let k = 0; k < 100 && JD.verbo(pick.v).k !== 'chamar'; k++) M.viver(0.25); // (a game at the table meanwhile: its end)
    x = JD.verbo(pick.v);
    // (the table as it is when the body calls it — others sat meanwhile —: nobody there about to go home, or the next table, T-2094)
    { const top = T.dia(pick.b); const g0 = top && top.data.mesa[pick.v.id] ? top.data.mesa[pick.v.id].g : null;
      if (x && x.ok && top && Object.keys(top.data.mesa).some(id => { const o = S().villagers.get(+id); return +id !== pick.v.id && String(top.data.mesa[id].g) === String(g0) && o && S().time >= T.leaveOf(o, pick.b) - 0.1; })) x = null; }
  }
  if (!pick) ok('j7 o corpo à mesa', true, 'nenhuma mesa de três com moeda nesta noite — a parte não se aplica');
  else {
    const { b, v } = pick;
    const ask = fn => { const a = Po.apply(fn); for (let k = 0; k < 6 && !a.res; k++) M.viver(0.05); return a.res || { ok: false, why: 'sem resposta' }; };
    if (!taken || !x || x.k !== 'chamar') bad.push(`o verbo: ${x ? x.k + ' ' + (x.why || '') : '-'} (${tried.size} mesas)`);
    const purse0 = D.get(G.Eco.coinRef(v), 'moedas');
    const r1 = x && x.ok ? ask(w => JD.chamar(w, x.apostas[0])) : { ok: false, why: x && x.why };
    const s1 = JD.corpo(v);
    if (!r1.ok || !s1 || s1.fase !== 'convite' || !s1.euHost) bad.push(`chamar: ${r1.why || ''} ${s1 ? s1.fase : '-'}`);
    const yes1 = s1 ? s1.convite.filter(q => q.sim).length : 0;
    const big = x && x.apostas ? x.apostas[x.apostas.length - 1] : 0; const r2 = s1 ? ask(w => JD.aposta(w, s1.op, big)) : {}; const s2 = JD.corpo(v); const yes2 = s2 ? s2.convite.filter(q => q.sim).length : 0;
    // (back to the least stake — who said yes says it again — and the game begun)
    if (s1) ask(w => JD.aposta(w, s1.op, x.apostas[0])); const s3 = JD.corpo(v);
    let rc = { ok: false, why: 'ninguém quis' }; if (s3 && s3.convite.some(q => q.sim)) rc = ask(w => JD.comecar(w, s3.op));
    if (!rc.ok) info = `ninguém aceitou: ${s3 ? s3.convite.map(q => q.nome + (q.sim ? ' sim' : ' não (' + q.por + ')')).join(', ') : '-'}`;
    else {
      const op = A.get(s3.op); const paid = Math.round((purse0 - D.get(G.Eco.coinRef(v), 'moedas')) * 100) / 100; const alug = (op.data.set && op.data.set.alug) || 0; // (and the rent of the house's dice: the J front, D-934)
      if (Math.abs(paid - op.data.aposta - alug) > 1e-6 && op.data.moeda) bad.push(`a aposta do corpo: pagou ${paid}, a aposta é ${op.data.aposta}${alug ? ` e o aluguel ${alug}` : ''}`);
      // (only its own dice before the cups come up)
      for (let k = 0; k < 40 && op.data.fase === 'sacode'; k++) M.viver(0.05);
      const sv = JD.corpo(v); const others = sv.jogadores.filter(p => !p.eu);
      if (!sv.jogadores.find(p => p.eu).faces || others.some(p => p.faces)) bad.push('a tela vê os dados dos outros antes dos copos');
      // (its turn: refused out of turn, a repeated number, one out of the dice's reach; said; the quick hand armed after it)
      const notYet = op.data.ordem[op.data.vez] !== v.id ? ask(w => JD.palpite(w, op.id, R.faixa(op.data)[0])) : null; if (notYet && notYet.ok) bad.push('palpite fora da vez aceito');
      for (let k = 0; k < 200 && op.data.ordem[op.data.vez] !== v.id && A.live(op) && op.data.fase === 'palpite'; k++) M.viver(0.05);
      let said = null, trap = null, rep = null, wide = null;
      if (A.live(op) && op.data.fase === 'palpite' && op.data.ordem[op.data.vez] === v.id) {
        if (op.data.pal.length) rep = ask(w => JD.palpite(w, op.id, op.data.pal[0][1]));
        wide = ask(w => JD.palpite(w, op.id, R.faixa(op.data)[1] + 1));
        const n = R.perto(op.data, R.estima(op.data, v.id, JD.tracos(v)), 0); said = ask(w => JD.palpite(w, op.id, n));
        trap = ask(w => JD.trapacear(w, op.id, true));
      }
      if (rep && rep.ok) bad.push('palpite repetido aceito'); if (wide && wide.ok) bad.push('palpite fora da conta aceito'); if (!said || !said.ok) bad.push('o palpite do corpo: ' + (said ? said.why : 'a vez não chegou'));
      for (let k = 0; k < 300 && A.live(op) && op.data.fase !== 'revela' && op.data.fase !== 'fim'; k++) M.viver(0.05);
      const sr = JD.corpo(v); const tt = op.data.res && op.data.res.trap;
      const left = ask(w => JD.sair(w, op.id));
      for (let k = 0; k < 400 && A.live(op); k++) M.viver(0.1);
      info = `${b.id}: chamou a ${s1.price(x.apostas[0])} — ${yes1} sim; a ${s1.price(big)}, ${yes2} sim; começou com ${op.data.quem.length}; pagou ${paid}; disse ${said && said.ok ? said.n : '-'}${trap ? ' (a mão rápida ' + (trap.ok ? 'pronta' : 'não') + ')' : ''}; a soma ${sr && sr.res ? sr.res.total : '-'}${tt && tt.id === v.id ? `, virou ${tt.de}→${tt.para} (${tt.pego ? 'pego por ' + tt.visto.length : 'ninguém viu'})` : ''}; largou: ${left.msg || left.why || '-'}; a partida ${op.st} (${op.end ? op.end.why : ''})`;
      if (yes2 > yes1) bad.push('a aposta mais alta trouxe mais gente');
    }
    const q = QA.check().filter(z => z.sys === 'dados' || z.sev <= 1); if (q.length) bad.push(q.slice(0, 2).map(z => z.msg).join('; '));
    ok('j7 o corpo à mesa, pelas mãos: chamar, a resposta de cada um, a aposta, começar, só os seus dados, o palpite na vez, a mão rápida, largar', !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}${info}`);
    if (Po.body()) god(() => Po.release('deus'));
  }
}

// ---------------- j8 the tournament ----------------
if (on('j8') && need) {
  const bad = []; M.reseed(31); G.Save.apply(JSON.parse(SNAP)); G.Main.mode = 'game'; const L0 = seen.length;
  while (S().time < 0.6) { calm(); M.viver(0.5); }
  const b = [...S().buildings.values()].filter(q => q.type === 'taverna' && q.built && T.aberta(q) && T.keeperOf(q)).sort((a, c) => Object.keys(T.dia(c).data.mesa).length - Object.keys(T.dia(a).data.mesa).length || a.id - c.id)[0];
  const k = b && T.keeperOf(b); const before = k ? D.get(G.Eco.coinRef(k), 'moedas') : 0;
  const r = b ? god(() => JD.torneio(b, { premio: 1, motivo: 'a prova' })) : { ok: false };
  const twice = b ? god(() => JD.torneio(b, { premio: 1 })) : { ok: true };
  if (!r.ok) bad.push('o torneio não abriu'); if (twice.ok) bad.push('dois torneios na mesma noite');
  const op = r.op && A.get(r.op); const prize = op ? op.data.pote : 0;
  if (op && G.Eco.coinage(G.Village.facOfSet(b.set)) && before >= 1 && Math.abs(prize - 1) > 1e-6) bad.push(`o prêmio no pote: ${prize}`);
  let n = 0; while (op && A.live(op) && n < 3000) { calm(); M.viver(0.25); n++; }
  // (the lines of this tournament only: the feasts of the night open others at other taverns — T-2091)
  const champ = op && op.data.campeao ? S().villagers.get(op.data.campeao) : null; const L = seen.slice(L0).filter(e => /^torneio-/.test(e.c || '') && op && e.op === op.id);
  if (op && A.live(op)) bad.push('o torneio não acabou com a noite'); if (op && (op.data.pote || 0) > 1e-6) bad.push('o prêmio ficou no pote');
  const paidOut = L.filter(e => e.c === 'torneio-campeao').reduce((a, e) => a + e.n, 0);
  if (champ && Math.abs(paidOut - prize) > 1e-6) bad.push(`o campeão recebeu ${paidOut} de ${prize}`);
  const placar = op ? Object.keys(op.data.placar).map(id => `#${id} ${op.data.placar[id][0]}`).join(', ') : '';
  ok('j8 o torneio da noite de festa: o prêmio no pote pelo livro, o campeão que leva no fim da noite', !bad.length, `${bad.length ? 'FALHOU: ' + bad.join(' | ') + ' — ' : ''}taverna #${b ? b.id : '-'}: prêmio ${prize}; o placar ${placar || 'vazio'}; ${champ ? `o campeão ${champ.name} #${champ.id} levou ${paidOut}` : 'ninguém venceu: o prêmio voltou'}`);
}

const E0 = M.erros(); const errs = Object.keys(E0.mod).length || E0.console.length;
ok('erros', !errs, errs ? JSON.stringify(E0).slice(0, 300) : 'nenhum erro de módulo nem aviso no console');
console.log(`(${Math.round(clock() - c0)} s)`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
