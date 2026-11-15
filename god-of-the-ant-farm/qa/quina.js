// quina: o passo nunca corta a quina de um prédio (L-354). Quem anda segue o caminho alisado (W.findPath: um trecho reto
// junta dois pontos do caminho quando o W.losClear diz que a reta entre eles fica no chão que se anda), e quem chega perto anda
// reto quando o losClear deixa. O losClear olhava um ponto a cada 0,3 casa: a reta que passava pela quina de uma casa
// bloqueada entre dois pontos cortava a casa — o mercador do n12 do negocio.js um instante dentro do sobrado, e o
// Possess.take o recusava («não está em chão firme»). Agora ele passa por cada casa que a reta atravessa e, numa quina exata,
// pelas duas do lado.
//   1. as quinas: em cada casa bloqueada de um prédio de um mundo pronto, nas quatro quinas, a reta entre as duas casas do lado
//      (as duas onde se anda) puxada para dentro da casa bloqueada (de 0,005 a 0,2 casa) — nenhuma limpa; a reta exata pela
//      quina — nunca limpa; e puxada para fora — limpa sempre que a casa da diagonal de fora também se anda
//   2. os caminhos: caminhos entre casas onde se anda perto de prédios de uma cidade (de 3 a 40 casas), alisados como o jogo os
//      faz; cada trecho olhado a cada 0,002 casa: nenhum ponto numa casa onde não se anda (um prédio, um muro, um penhasco, a
//      água funda — o vau do rio se anda: o passo do caminho na diagonal pela quina de um rio é do próprio caminho)
//   4. o mundo vivendo um minuto: ninguém que anda passa, num passo, de um chão onde se anda para uma casa onde não se anda (o
//      passo confere antes de andar: um caminho feito antes de um prédio subir na frente, a corrida reta de quem foge sem
//      rota), salvo onde o chão se fechou debaixo dele naquele passo (um prédio que nasceu ou ficou pronto ali). Quem o mundo
//      põe num lugar — o bebê que nasce, quem desembarca, quem tira água — não anda: não é deste passo
//   3. sem erro de módulo nem do console
//   node qa/quina.js [mundo] [caminhos]          (padrão: metropole, 4000)
const M = require('./nodemundo.js');
const WORLD = process.argv[2] || 'metropole', K = +(process.argv[3] || 4000);
const G = M.load({}); M.pronto(WORLD); const S = G.S, W = G.W, T = G.T, N = G.N;
let bad = 0; const out = (ok, name, msg) => { if (!ok) bad++; console.log(`${ok ? 'PASSOU' : 'FALHOU'} | quina ${name} | ${msg}`); };
// (the rule a walk keeps, said apart from the game's: a tile one walks — onto a river only from or to one —, no fire)
const good = (x, y, riverOK) => { if (x < 0 || y < 0 || x >= N || y >= N) return false; const i = y * N + x; return W.walkable(i) && (riverOK || S.type[i] !== T.RIVER) && !(S.fire[i] > 0.02); };
const riverAt = (x, y) => S.type[W.idx(x, y)] === T.RIVER;
// (the first point of a straight walk, looked at every 0.002 of a tile after a, in a tile one does not walk: null when none)
function cut(ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay); const n = Math.max(1, Math.ceil(d / 0.002));
  for (let k = 1; k <= n; k++) { const f = k / n; const x = ax + (bx - ax) * f, y = ay + (by - ay) * f; if (!W.walkableXY(x, y)) return [x, y]; }
  return null;
}

// 1. the corners
const D = [0.005, 0.02, 0.05, 0.1, 0.2]; const into = D.map(() => [0, 0]); let exact = [0, 0], away = [0, 0], corners = 0;
const seenT = new Set();
for (const b of S.buildings.values()) {
  for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) {
    if (tx < 1 || ty < 1 || tx >= N - 1 || ty >= N - 1) continue; const i = ty * N + tx; if (seenT.has(i) || W.walkable(i)) continue; seenT.add(i);
    for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      // (the corner C, the blocked tile on the side Q of it; the tiles beside the corner, A and B, and the one across, O)
      const C = [tx + cx, ty + cy], Q = [cx ? -1 : 1, cy ? -1 : 1];
      const A = [C[0] + 0.5 * Q[0], C[1] - 0.5 * Q[1]], B = [C[0] - 0.5 * Q[0], C[1] + 0.5 * Q[1]], O = [C[0] - 0.5 * Q[0], C[1] - 0.5 * Q[1]];
      const ok = riverAt(A[0], A[1]) || riverAt(B[0], B[1]);
      if (!good(Math.floor(A[0]), Math.floor(A[1]), ok) || !good(Math.floor(B[0]), Math.floor(B[1]), ok)) continue; corners++;
      const at = s => { const k = s * Math.SQRT1_2; return W.losClear(A[0] + Q[0] * k, A[1] + Q[1] * k, B[0] + Q[0] * k, B[1] + Q[1] * k); };
      D.forEach((d, j) => { into[j][0]++; if (at(d)) into[j][1]++; });
      exact[0]++; if (at(0)) exact[1]++;
      if (good(Math.floor(O[0]), Math.floor(O[1]), ok)) { away[0]++; if (!at(-0.05)) away[1]++; }
    }
  }
}
out(into.every(q => q[1] === 0) && !exact[1], '1. a reta pela quina de uma casa bloqueada nunca é limpa', `${corners} quinas com as duas casas do lado onde se anda: puxada para dentro ${D.map((d, j) => `${d}: ${into[j][1]} limpas`).join(', ')}; pela quina exata: ${exact[1]} limpas de ${exact[0]}`);
out(away[0] > 0 && !away[1], '1. puxada para fora da quina, a reta é limpa', `${away[0]} quinas com a casa da diagonal de fora onde se anda: ${away[1]} recusadas`);

// 2. the paths
const rnd = G.mulberry32(354); const towns = [...S.buildings.values()].filter(b => b.built);
const near = b => { for (let k = 0; k < 12; k++) { const x = b.x - 1 + Math.floor(rnd() * (b.w + 2)), y = b.y - 1 + Math.floor(rnd() * (b.h + 2)); if (W.inb(x, y) && W.walkable(y * N + x)) return [x + rnd(), y + rnd()]; } return null; };
let made = 0, segs = 0, cuts = 0; const ex = [];
for (let k = 0; k < K * 4 && made < K; k++) {
  const b1 = towns[Math.floor(rnd() * towns.length)], b2 = towns[Math.floor(rnd() * towns.length)]; if (!b1 || !b2 || b1 === b2) continue;
  const d = Math.hypot(b1.x - b2.x, b1.y - b2.y); if (d < 3 || d > 40) continue;
  const a = near(b1), z = near(b2); if (!a || !z) continue;
  const p = W.findPath(a[0], a[1], z[0], z[1], false, 6000); if (!p) continue; made++;
  let q = a; for (const r of p) { segs++; const c = cut(q[0], q[1], r[0], r[1]); if (c) { cuts++; if (ex.length < 4) { const bb = S.buildings.get(S.occ[W.idx(c[0], c[1])]); ex.push(`(${q[0].toFixed(2)}, ${q[1].toFixed(2)}) → (${r[0].toFixed(2)}, ${r[1].toFixed(2)}) passa em (${c[0].toFixed(2)}, ${c[1].toFixed(2)})${bb ? `, no ${bb.type}#${bb.id}` : ''}`); } } q = r; }
}
out(made > K / 2 && !cuts, '2. os caminhos alisados nunca entram numa casa onde não se anda', `${made} caminhos, ${segs} trechos; ${cuts} cortam${ex.length ? ': ' + ex.join(' · ') : ''}`);

// 4. the world living: for a minute, no one out and about steps from ground one walks into a tile one does not — save where
// the ground shut under them in that step (a building that came up or was finished there): the guard of the step (move)
{
  const open = () => { const a = new Uint8Array(N * N); for (let i = 0; i < N * N; i++) a[i] = W.walkable(i) ? 1 : 0; return a; };
  let prev = open(); const last = new Map(); let steps = 0, into = 0; const ex2 = []; const c0 = S.clock;
  while (S.clock - c0 < 60) {
    G.debug.step(0.1); const now = open();
    for (const v of S.villagers.values()) {
      if (v.inside || v.aboard || v.held || v.air || v.dead) { last.delete(v.id); continue; }
      // (a step: one who walks — not a baby carried, not one set down somewhere by the world — moving a little from where they were)
      const i = W.idx(v.x, v.y); const l = last.get(v.id); last.set(v.id, { i, x: v.x, y: v.y }); if (!l || l.i === i || !v.moving || v.age < 3 || Math.hypot(v.x - l.x, v.y - l.y) > 0.5) continue; steps++;
      if (prev[l.i] && !now[i] && !prev[i]) { into++; if (ex2.length < 4) { const bb = S.buildings.get(S.occ[i]); ex2.push(`${v.name} #${v.id} (${v.task ? v.task.type + '.' + (v.task.st || 0) : 'sem tarefa'}) em (${v.x.toFixed(2)}, ${v.y.toFixed(2)})${bb ? `, no ${bb.type}#${bb.id}` : ''}`); } }
    }
    prev = now;
  }
  out(steps > 1000 && !into, '4. o mundo vivendo: ninguém passa de um chão onde se anda para uma casa onde não se anda', `um minuto da ${WORLD}: ${steps} passos de uma casa para outra, ${into} para dentro de uma casa fechada${ex2.length ? ': ' + ex2.join(' · ') : ''}`);
}
// 3. the modules
const err = M.erros(); out(!Object.keys(err.mod).length && !err.console.length, '3. sem erro de módulo nem do console', JSON.stringify(err).slice(0, 200));
console.log(bad ? 'FALHOU' : 'TUDO PASSOU');
process.exit(bad ? 1 : 0);
