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
//   f6 a manada que chega de longe (o acontecimento do mundo, G.Events.herd) só é de uma espécie que a terra ainda comporta, e
//      nunca maior que o lugar que há (L-764): a manada vinha fosse qual fosse o teto — cinco girafas numa terra de quatro, e oito
//      girafas para o teto quatro, por anos, no f2. A mão da prova chama a manada doze vezes num mundo novo;
//   f7 quem chega de longe chega longe das cidades (L-1034): numa metrópole pronta, os lugares que a terra dá a um leão que
//      vem de fora ficam a doze casas da beira de toda cidade quando a terra os tem, e senão no mais longe delas que ela tem —
//      nunca no chão do povo (o anel e cinco casas além); antes, doze do meio dela, e as cidades crescidas têm raio de
//      vinte: os recém-chegados caíam dentro delas e a turma armada os matava;
//   f8 o sexo que falta chega também com a terra cheia (L-1035): três ursas num chão de três ursos — vem um urso de fora;
//   f9 o anfíbio longe da água volta a ela (L-1062): a sucuri que a mão do deus solta junto de uma vila, longe da água, tem onde
//      pisar (antes, nenhuma das dezesseis casas em volta) e o verificador não a acusa; no mato, a sucuri, o crocodilo e o
//      hipopótamo postos a seis a nove casas da água voltam à beira dela sozinhos em quatro minutos (o hipopótamo dorme a sua hora
//      no caminho), com um save no meio do caminho;
// e o verificador limpo (S0–S2), sem erro de módulo.   [ONLY=f5,f6] node qa/fauna.js (só os casos pedidos: f1, f2 — com o f3 e
// o f4 —, f5, f6, f7, f8, f9)
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
// f6
if (on('f6')) { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4 }); M.viver(1); const A = G.Animals;
  const came = [], over = [];
  for (let k = 0; k < 12; k++) {
    const c0 = A.counts(); G.inSim++; try { G.Events.herd(); } finally { G.inSim--; } const c1 = A.counts();
    for (const s of A.ids) { const n = (c1[s] || 0) - (c0[s] || 0); if (n <= 0) continue; const cap = A.capacity(s); came.push(`${s} ${c0[s] || 0}+${n}/${cap}`); if (c1[s] > cap) over.push(`${s}: ${c0[s] || 0} e mais ${n}, para o teto ${cap}`); }
  }
  ok('f6 a manada que chega de longe cabe na terra', came.length > 0 && !over.length, `${came.length} manada(s) em 12 chamadas: ${came.join(', ') || 'nenhuma'}${over.length ? ' — ACIMA DO TETO: ' + over.join('; ') : ''}`); }
// f7
if (on('f7')) { M.pronto('metropole'); const A = G.Animals; const lion = A.DEF.lion; const towns = [...G.S.settlements.values()];
  const edge = p => Math.min(...towns.map(s => G.dist(p[0], p[1], s.cx, s.cy) - (s.radius || 8)));
  let nNew = 0, inNew = 0, nOld = 0, inOld = 0;
  for (let k = 0; k < 200; k++) { const p = A.wildSpot(12, lion, true); if (p) { nNew++; if (edge(p) < 12 - 1e-6) inNew++; } const q = A.wildSpot(12, lion); if (q) { nOld++; if (edge(q) < 4) inOld++; } }
  // (and in a land the towns filled, the farthest from them its ground has — never inside the people's ground, the ring and
  // A.EDGE_MIN past it)
  const ed = []; for (let k = 0; k < 200; k++) { const p = A.wildSpot(12, lion, true); if (p) ed.push(edge(p)); } ed.sort((a, b) => a - b);
  const low = ed.filter(e => e < A.EDGE_MIN - 1e-6).length;
  ok('f7 quem chega de longe chega longe das cidades', ed.length > 0 && low === 0, `${towns.length} cidades (raios ${towns.map(s => Math.round(s.radius || 8)).join(', ')}): pela beira, ${ed.length} lugares em 200 pedidos, a beira mais perto de cada um de ${ed.length ? ed[0].toFixed(1) : '—'} a ${ed.length ? ed[ed.length - 1].toFixed(1) : '—'} casas (mediana ${ed.length ? ed[ed.length >> 1].toFixed(1) : '—'}), ${low} a menos de ${A.EDGE_MIN}; pelo meio (a regra de antes), ${inOld} de ${nOld} dentro do anel ou a menos de 4 casas dele`); }
// f8
if (on('f8')) { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4 }); M.viver(1); const A = G.Animals, Me = G.Mente;
  const bears = () => [...G.S.animals.values()].filter(a => a.kind === 'bear' && !a.dead);
  const cap = A.capacity('bear'); let made = 0;
  for (const a of bears()) A.remove(a);
  const spot = A.wildSpot(14, A.DEF.bear, true);
  if (!spot || cap < 2) ok('f8 o sexo que falta chega com a terra cheia', false, `sem chão de urso (teto ${cap})`);
  else {
    G.inSim++; try { for (let k = 0; k < cap; k++) { const a = A.spawn('bear', spot[0] + k * 0.8, spot[1], { grown: 1 }); Me.m(a).sx = 0; made++; } } finally { G.inSim--; }
    let came = 0, tries = 0; for (; tries < 40 && !came; tries++) { G.inSim++; try { A.immigrateNow(); } finally { G.inSim--; } came = bears().filter(a => a.grown >= 1 && Me.sex(a) === 1).length; }
    ok('f8 o sexo que falta chega com a terra cheia', came > 0, `${made} ursas num chão de ${cap} ursos: ${came ? `um urso chegou depois de ${tries} rodada(s) de chegadas` : `NENHUM urso em ${tries} rodadas`} (agora ${bears().length} ursos)`);
  } }
// f9
if (on('f9')) { M.novo({ seed: 103, type: 'continente', size: 128, tribes: 4 }); M.viver(2); const A = G.Animals, W = G.W, S = () => G.S;
  const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
  const steps = a => { let n = 0; for (let k = 0; k < 16; k++) if (A.walkOK(a, a.x + Math.cos(k / 16 * 6.283), a.y + Math.sin(k / 16 * 6.283))) n++; return n; };
  const said = (msg) => QA.check().some(q => q.id === msg || String(q.msg).includes(msg));
  // (1) the god's hand: the anaconda let go by a village, six tiles or more from the water, out of the air as main.js lets it go
  const set = [...S().settlements.values()][0]; let p = null;
  for (let r = 4; r < 20 && !p; r++) for (let k = 0; k < 24 && !p; k++) { const x = set.cx + Math.cos(k / 24 * 6.283) * r, y = set.cy + Math.sin(k / 24 * 6.283) * r; const i = W.idx(x, y); if (W.inb(x, y) && W.walkable(i) && !W.blocked(i) && A.waterD(i) >= 6) p = [x, y]; }
  const a = god(() => A.spawn('anaconda', p[0], p[1], { grown: 1 })); god(() => { a.z = 40; a.air = true; a.vx = 0; a.vy = 0; a.vz = 30; }); M.viver(1);
  const n0 = steps(a), d0 = A.waterD(W.idx(a.x, a.y)), acc = said(`anaconda#${a.id} em`); A.remove(a);
  // (2) in the wild: each set down six to nine tiles from the water, away from the towns; a save on the way back
  const away = (x, y) => { for (const s of S().settlements.values()) if (G.dist(x, y, s.cx, s.cy) < (s.radius || 8) + 14) return false; return true; };
  const back = [];
  for (const kind of ['anaconda', 'croc', 'hippo']) {
    let q = null; for (let k = 0; k < 40000 && !q; k++) { const x = 6 + (k * 7919) % (G.N - 12) + 0.5, y = 6 + ((k * 104729) >> 3) % (G.N - 12) + 0.5; const i = W.idx(x, y); if (!away(x, y) || W.blocked(i) || S().type[i] <= G.T.SEA || S().type[i] === G.T.RIVER || S().cliff[i]) continue; const d = A.waterD(i); if (d >= 6 && d <= 9) q = [x, y]; }
    if (!q) { back.push(`${kind}: sem lugar`); continue; }
    for (const o of [...S().animals.values()]) if (G.dist(o.x, o.y, q[0], q[1]) < 14) A.remove(o);
    let b = god(() => A.spawn(kind, q[0], q[1], { grown: 1, hunger: 0.2 })); const id = b.id; let t = -1, saved = false;
    for (let k = 0; k < 480; k++) { M.viver(0.5); if (k === 20) { M.salvarCarregar(); saved = true; b = S().animals.get(id); } if (!b || b.dead) break; if (A.walkOK({ kind }, b.x, b.y)) { t = k / 2; break; } }
    back.push(`${kind} a ${A.waterD(W.idx(q[0], q[1]))} casas: ${t < 0 ? 'NÃO VOLTOU' : `na beira em ${t} s`}${saved && t > 10 ? ' (com um save no caminho)' : ''}`);
  }
  const c = QA.check().filter(q => q.sev <= 3 && q.sys === 'meio');
  ok('f9 o anfíbio longe da água volta a ela', n0 > 0 && !acc && back.every(s => / em /.test(s)) && !c.length, `a sucuri solta pela mão junto de ${set.name}, a ${d0} casas da água: ${n0} de 16 casas em volta onde pisar, o verificador ${acc ? 'A ACUSA' : 'calado'}; no mato: ${back.join('; ')}; verificador do meio ${c.length ? c.slice(0, 2).map(q => q.msg).join('; ') : 'limpo'}`); }
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0);
