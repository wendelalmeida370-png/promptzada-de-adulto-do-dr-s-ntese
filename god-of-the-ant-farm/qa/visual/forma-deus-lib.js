// forma-deus-lib: o que as provas do deus pela forma (visual/forma-deus.js e forma-deus-fotos.js) dividem — o gerador de
// teste do degrau grande, até a forma do especialista chegar; o lote reservado de teste, até a reserva do C chegar (D-121). Puro: nada de node dentro dele (a fonte vai também ao navegador).
'use strict';
// a Colosseum of 40 m — the Romans' wonder of the step «maravilha», n = 10 — for the proofs until M1's form comes: the plaza
// round it, the drum of four tiers of 32 arches with its four ways in, fourteen rows of seats with their stairways, parapets
// and a gap, the arena of 17 m with its wall, the masts of the awning, a gilded statue at each corner of the plaza
function coliseuTeste(L) {
  const c = [L / 2, L / 2], R = L / 2 - 2, t = 1.2, H = 18, fundo = 8.5, ya = 3, yb = 4, rows = 14; const aneis = [[R, H]];
  for (let k = rows - 1; k >= 0; k--) aneis.push([fundo + 0.6 + k * (R - t - fundo - 0.6) / (rows - 1), yb + k * (H - 1.5 - yb) / (rows - 1)]);
  const axes = [0, Math.PI / 2, Math.PI, 1.5 * Math.PI];
  const els = [
    { k: 'bloco', r: [0, 0, L, L], y0: 0, y1: 0.12, cor: ['#cfc4ae', '#b8ad96', '#d8cdb6'], piso: 1 },
    { k: 'tambor', c, r: R, t, y0: 0, y1: H, andares: 4, arcos: 32, arcoW: 0.6, arcoA: 0.15, arcoB: 0.75, cor: ['#e8d2a6', '#b89a70'], escuro: '#2a1e18', abertos: axes },
    { k: 'cavea', c, aneis, fundo, cor: '#c8b8a0', parapeito: 0.9, muro: '#b8a888', escadas: { a: axes.map(a => a + Math.PI / 4), l: 1.2, n: 2 }, vaos: [{ anel: rows, a: Math.PI, w: 1.1 }] },
    { k: 'arena', c, r: fundo, y: ya, cor: '#e8d8a8', muro: yb },
    { k: 'mastros', c, r: R - 0.3, n: 32, y0: H, h: 3, cor: '#7a5a3a' },
  ];
  for (const [u, v] of [[1.2, 1.2], [L - 1.2, 1.2], [1.2, L - 1.2], [L - 1.2, L - 1.2]]) els.push({ k: 'estatua', p: [u, v, 0.12], h: 4, w: 0.4, cor: '#e0b84a', lanca: true });
  return { els, door: { u: L / 2, w: 2.2, y0: 0, y1: 4 } };
}
// a lot kept for a great work (D-121), for the proofs until C's G.Village.reserva comes: the wonder's biggest step that finds
// land — down to the smallest bigger than its classic —, the n × n of land with no building in it (fields and roads may be)
// nearest a capital's middle, up to its radius and 20 tiles more; the first capital, the most people first, that has one.
// { set, r: { type, esc, x, y, n } } or null — read from the world, nothing written
function reservaTeste(G) {
  const S = G.S, W = G.W, N = G.N, E = G.Escala; const people = new Map(); for (const v of S.villagers.values()) people.set(v.set, (people.get(v.set) || 0) + 1);
  const caps = [...S.factions.values()].map(f => S.settlements.get(f.capital)).filter(s => s && S.factions.get(s.fac)).sort((a, b) => (people.get(b.id) || 0) - (people.get(a.id) || 0) || a.id - b.id);
  const bad = new Uint8Array(N * N), sq = new Uint16Array(N * N);
  for (const b of S.buildings.values()) { const d = G.BDEF[b.type] || {}; if (b.type === 'farm' || d.field) continue; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (W.inb(x, y)) bad[W.idx(x, y)] = 1; }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; sq[i] = bad[i] || !W.isLand(i) ? 0 : x && y ? 1 + Math.min(sq[i - 1], sq[i - N], sq[i - N - 1]) : 1; } // (the side of the free square ending at each tile)
  const steps = E.steps('maravilha').filter(s => s.n > E.classic('maravilha').n).sort((a, b) => b.n - a.n);
  for (const c of caps) for (const st of steps) { const n = st.n; let at = null, dm = (c.radius || 0) + 20;
    for (let y = n - 1; y < N; y++) for (let x = n - 1; x < N; x++) if (sq[y * N + x] >= n) { const d = Math.hypot(x - n + 1 + n / 2 - c.cx, y - n + 1 + n / 2 - c.cy); if (d < dm) { dm = d; at = [x - n + 1, y - n + 1]; } }
    if (at) return { set: c.id, r: { type: 'maravilha', esc: st.id, x: at[0], y: at[1], n } }; }
  return null;
}
module.exports = { coliseuTeste, reservaTeste, N: 10 };
