// fauna: node qa/fauna.js — o equilíbrio da fauna ao longo dos anos (D-151). O dono viu «muitas rãs e muitos coelhos depois de
// muitos anos, meio que virando praga». Medido num continente vivo por 114 anos: nenhuma espécie passa do teto dela
// (A.capacity: as casas de habitat × a densidade), mas o teto da rã e do coelho era o maior de todos (4,5 e 3 por cem casas):
// a rã 80 e o coelho 62 de 473 bichos selvagens, com a lebre um terço da fauna, e as margens dos rios uma fila de rãs.
// Acertado na densidade (a rã 2,2, o coelho 1,7, a lebre 1,5, o lagarto 1,9): os outros ganham o espaço.
//   f1 em mundos novos de vários tipos e sementes, nenhuma espécie selvagem tem o teto acima de um décimo do teto de todas
//      (onde vinte ou mais têm habitat);
//   f2 um continente vivido 60 anos pelo salto: a cada 20 anos, nenhuma espécie acima do teto dela (com a folga das aves que
//      o céu desbasta, 1,25, mais dois), a mais numerosa abaixo de 12% dos bichos selvagens, os predadores vivos (a metade
//      do teto deles ou mais) e nove em dez espécies com habitat vivas;
//   f3 o mesmo com um save no meio: os tetos iguais depois do load (o habitat é função do mapa);
//   f5 o censo conta quem está debaixo do teto de uma caverna (L-763): o urso dormindo na toca, o bicho abrigado da tempestade
//      — fora da lista do mundo, não fora do mundo (L-656). Sem eles, os ursos que dormem toda noite eram ursos sumidos: a terra
//      mandava mais de longe, nasciam acima do teto, e as tocas pariam acima dele. No continente do f2 vivido dois anos, numa
//      noite com ursos nas tocas, o censo dos ursos é o da lista e o das cavernas; e nos cinco anos seguintes os ursos, contados
//      onde estiverem, não passam do teto (com a folga do f2);
// e o verificador limpo (S0–S2), sem erro de módulo.   [ONLY=f5] node qa/fauna.js (só os casos pedidos: f1, f2 — com o f3 e o
// f4 —, f5)
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | fauna ${name} | ${info}`); if (!c) fails.push(name); };
const wild = () => G.Animals.ids.filter(k => !G.Animals.DEF[k].dom);
const caps = () => { const A = G.Animals; const o = {}; for (const k of wild()) { const c = A.capacity(k); if (c > 0) o[k] = c; } return o; };
const snap = () => { const A = G.Animals; const c = A.counts(); const cp = caps(); const ks = Object.keys(cp); const tot = wild().reduce((s, k) => s + (c[k] || 0), 0);
  const over = ks.filter(k => (c[k] || 0) > cp[k] * 1.25 + 2).map(k => `${k} ${c[k]}/${cp[k]}`);
  const top = wild().filter(k => c[k]).sort((a, b) => c[b] - c[a])[0]; const pk = ks.filter(k => A.predator(k));
  return { day: G.S.day, tot, over, top, share: top ? c[top] / tot : 0, pred: pk.reduce((s, k) => s + (c[k] || 0), 0), predCap: pk.reduce((s, k) => s + cp[k], 0), alive: ks.filter(k => (c[k] || 0) > 0).length, sp: ks.length, n: c }; };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
// f1
if (on('f1')) { const bad = [], seen = [];
  for (const [type, size, seed] of [['continente', 128, 103], ['continente', 128, 7], ['ilha', 96, 11], ['arquipelago', 128, 5], ['continente', 160, 41]]) {
    M.novo({ seed, type, size, tribes: 3 }); const cp = caps(); const ks = Object.keys(cp); const tot = ks.reduce((s, k) => s + cp[k], 0); const top = ks.sort((a, b) => cp[b] - cp[a]).slice(0, 3);
    seen.push(`${type} ${size} #${seed}: ${ks.length} espécies, teto ${tot}, as maiores ${top.map(k => `${k} ${cp[k]} (${Math.round(100 * cp[k] / tot)}%)`).join(', ')}`);
    if (ks.length >= 20 && cp[top[0]] > tot * 0.10) bad.push(`${type} #${seed}: ${top[0]} ${cp[top[0]]} de ${tot}`); }
  ok('f1 nenhuma espécie selvagem com o teto acima de um décimo do teto de todas', !bad.length, `${seen.join(' · ')}${bad.length ? ' — ACIMA: ' + bad.join(', ') : ''}`); }
// f2, f3
if (on('f2')) { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4 }); const said = [], bad = []; let cp0 = null, same = true;
  for (let y = 0; y < 60; y += 20) {
    M.saltar(20); if (y === 20) { cp0 = JSON.stringify(caps()); M.salvarCarregar(); same = JSON.stringify(caps()) === cp0; }
    const s = snap(); said.push(`ano ${s.day}: ${s.tot} selvagens, a maior ${s.top} ${Math.round(100 * s.share)}%, predadores ${s.pred}/${s.predCap}, ${s.alive}/${s.sp} espécies vivas`);
    if (s.over.length) bad.push(`ano ${s.day}: acima do teto ${s.over.join(', ')}`); if (s.share > 0.12) bad.push(`ano ${s.day}: ${s.top} ${Math.round(100 * s.share)}% dos selvagens`);
    if (s.pred < s.predCap * 0.5) bad.push(`ano ${s.day}: predadores ${s.pred} de ${s.predCap}`); if (s.alive < s.sp * 0.9) bad.push(`ano ${s.day}: só ${s.alive} de ${s.sp} espécies vivas`); }
  ok('f2 60 anos de salto: ninguém acima do teto, a mais numerosa abaixo de 12%, os predadores e as espécies vivos', !bad.length, `${said.join(' · ')}${bad.length ? ' — ' + bad.join('; ') : ''}`);
  ok('f3 um save no meio: os tetos iguais depois do load', same, same ? 'iguais no ano 41' : 'MUDARAM');
  const v = QA.check().filter(q => q.sev <= 2); const e = M.erros();
  ok('f4 verificador e erros de módulo', !v.length && M.limpo(), `${v.length} violações S0–S2${v.length ? ': ' + v[0].msg : ''}; erros de módulo ${JSON.stringify(e.mod)}`); }
// f5
if (on('f5')) { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4 }); M.saltar(2); const A = G.Animals;
  // (the bears where they are: in the world's list, and under a cave's roof — asleep in a den, out of the storm)
  const inList = () => [...G.S.animals.values()].filter(a => a.kind === 'bear' && !a.dead && !a.summoned && !a.raid && !a.dom).length;
  const inCaves = () => { let n = 0; for (const cv of G.Caves.all()) for (const a of (cv.sleepers || []).concat(cv.sheltered || [])) if (a.kind === 'bear' && !a.dead && !G.S.animals.has(a.id)) n++; return n; };
  let k = 0; for (; k < 600 && !inCaves(); k++) M.viver(1); // (to a night with bears in their dens: the evening takes them in)
  const l0 = inList(), z0 = inCaves(), c0 = A.counts().bear || 0;
  const said = [], over = []; let top = 0;
  for (let y = 0; y < 5; y++) { M.saltar(1); const n = inList() + inCaves(), cap = A.capacity('bear'); top = Math.max(top, n); said.push(`${n}/${cap}`); if (n > cap * 1.25 + 2) over.push(`ano ${G.S.day}: ${n} ursos para o teto ${cap}`); }
  ok('f5 o censo conta quem dorme na toca', z0 > 0 && c0 === l0 + z0 && !over.length,
    `${z0 ? `numa noite do ano ${G.S.day - 5} (${k} s vividos depois do salto): ${l0} ursos na lista do mundo, ${z0} dormindo nas tocas — o censo diz ${c0}` : `NENHUM urso nas tocas em ${k} s`}; nos cinco anos seguintes, os ursos contados onde estiverem / o teto: ${said.join(', ')}${over.length ? ' — ACIMA: ' + over.join('; ') : ''}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
