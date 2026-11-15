// forma-deus-lib: o que as provas do deus pela forma (visual/forma-deus.js e forma-deus-fotos.js) dividem — o gerador de
// teste do degrau grande, até a forma do especialista chegar. Puro: nada de node dentro dele (a fonte vai também ao navegador).
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
module.exports = { coliseuTeste, N: 10 };
