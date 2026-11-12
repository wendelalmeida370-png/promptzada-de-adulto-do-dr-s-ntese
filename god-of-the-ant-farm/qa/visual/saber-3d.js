// saber-3d: a grande biblioteca (16 m, D-192) no desenho do deus e no 3D — em Node, sem navegador e sem mundo gerado: cada
// uma das seis num chão plano, pintada pelo pintor gravado do deus e desenhada pelo Build3D (qa/visual/fidelidade-lib.js).
//   v1 o deus pinta o degrau pela forma: nenhuma peça sem pintor, nenhuma volta quebrada na ordem das partes
//   v2 o deus e o 3D do mesmo prédio: a silhueta (≥ 0,95), o alto (a menos de 1,5 m)
//   v3 o 3D desenha-o pelo risco da forma (Build3D.riskForm), dentro dos tetos de triângulos (perto ≤ 60 mil, longe ≤ 2 mil)
//   v4 as janelas: um olhar de fora pelo meio de cada janela que a forma pinta para o deus, até a face da parede — nada
//      sólido diante do vão (uma faixa pintada, uma meia coluna: L-873, L-874) e nenhuma vidraça antes da face (as da casca
//      ficam dentro da parede; uma antes dela é a da forma desenhada por cima: L-871)
//   v5 por dentro: o Build3D.interior desenha cada peça da planta (as mesas de leitura, as mesas de escriba, as estantes)
//   node qa/visual/saber-3d.js [povo,povo…]
'use strict';
const F = require('./fidelidade-lib.js'); const { G } = F.load();
const A = G.Arch, B3 = G.Build3D, In = G.Interiors, Sp = G.Space;
const T = 'biblioteca', N = 4;
const STY = process.argv[2] ? process.argv[2].split(',') : ['romano', 'grego', 'egipcio', 'asteca', 'nordico', 'classico'];
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | saber-3d ${name} | ${info}`); if (!c) fails.push(name); return c; };
function putBig(st, id) {
  const S = G.S, def = G.BDEF[T], x = 20, y = 20;
  const b = { id, type: T, style: st, x, y, w: N, h: N, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, wd: null, crops: null, blocks: !!def.blocks, ip: null };
  S.buildings.set(id, b); if (def.blocks) for (let yy = y; yy < y + N; yy++) for (let xx = x; xx < x + N; xx++) S.occ[yy * G.N + xx] = id;
  b.ip = In.newRecord(b, { t: T, c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << N) - 1, n: N });
  return b;
}
const tri = g => (g ? (g.attributes ? g.attributes.position.count / 3 : g.p.length / 9) : 0);
// (a look through the triangles of a geometry, from both sides: whether it meets one within `far` metres)
function rayHits(P, o, d, far) {
  for (let k = 0; k + 8 < P.length; k += 9) {
    const e1 = [P[k + 3] - P[k], P[k + 4] - P[k + 1], P[k + 5] - P[k + 2]], e2 = [P[k + 6] - P[k], P[k + 7] - P[k + 1], P[k + 8] - P[k + 2]];
    const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]]; const a = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2]; if (Math.abs(a) < 1e-12) continue;
    const s = [o[0] - P[k], o[1] - P[k + 1], o[2] - P[k + 2]]; const u = (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]) / a; if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]]; const v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / a; if (v < 0 || u + v > 1) continue;
    const t = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / a; if (t > 1e-6 && t <= far) return true;
  }
  return false;
}
const v1 = [], v2 = [], v3 = [], v4 = [], v5 = []; const say = { v1: [], v2: [], v3: [], v4: [], v5: [] }; let withWin = 0;
for (const st of STY) {
  F.blank(); const b = putBig(st, 4300);
  A.formMissing.clear(); const god = F.god(b); const near = F.near(b), far = F.far(b);
  const miss = [...A.formMissing], rings = (A.formStats || {}).rings || 0;
  if (god.none || miss.length || rings) v1.push(`${st}: ${god.none ? 'o deus não pinta' : ''}${miss.length ? ' sem pintor: ' + miss.join(',') : ''}${rings ? ' ' + rings + ' voltas quebradas' : ''}`); say.v1.push(`${st} ${god.ops ? god.ops.length : 0} traços`);
  const mk = F.gridFor(god, near); const c = F.compare(F.measure(F.paintGod(god, mk())), F.measure(F.paint3D(near, mk())), [b.w, b.h]);
  if (c.empty || !(c.iou >= 0.95) || Math.abs(c.topA - c.topB) > 1.5) v2.push(`${st}: ${c.empty ? c.empty : `silhueta ${c.iou.toFixed(3)}, alto ${c.topA.toFixed(1)} → ${c.topB.toFixed(1)}`}`); say.v2.push(`${st} ${c.empty ? '-' : c.iou.toFixed(3)}`);
  const risk = !!B3.riskForm(b); if (!risk || near.tris.length > 60000 || far.tris.length > 2000 || !far.tris.length) v3.push(`${st}: pelo risco ${risk}, perto ${near.tris.length}, longe ${far.tris.length}`); say.v3.push(`${st} ${near.tris.length}/${far.tris.length}`);
  // (the windows: a look from 0.6 m outside at the middle of each window the form paints for the god, as far as the wall's
  // face — the form's frame is the lot's, the side S. Nothing solid stands before the opening — a band, a half column —, and
  // no pane: the shell's own panes are in the wall, behind its face; a pane before it is the form's window drawn over them)
  const P3 = G.Props3D; G.Props3D = null; let g; try { g = B3.nearGeo(b.x, b.y, 1); } finally { G.Props3D = P3; }
  const plan = Sp.planNow(b); const Fm = G.Forma.of(T, st, N); const X0 = b.x * 4, Z0 = b.y * 4, hi = near.fr.hi; const gn = tri(g.glass);
  const PS = g.solid.attributes.position.array, PG = g.glass ? g.glass.attributes.position.array : []; let shut = 0, twice = 0, wins = 0;
  const OUT = { fundo: [0, -1], frente: [0, 1], esquerda: [-1, 0], direita: [1, 0] };
  for (const e of Fm.els) { if (e.k !== 'janelas') continue; wins++; const o = OUT[e.na], c = (e.de + e.ate) / 2; const along = o[0] === 0;
    const from = [X0 + (along ? c : e.em) + o[0] * 0.6, hi + (e.y0 + e.y1) / 2, Z0 + (along ? e.em : c) + o[1] * 0.6], dir = [-o[0], 0, -o[1]];
    if (rayHits(PS, from, dir, 0.595)) shut++; if (rayHits(PG, from, dir, 0.595)) twice++; }
  for (const k of ['solid', 'glass', 'plants', 'water']) if (g[k]) g[k].dispose();
  if (shut || twice || !wins || !gn) v4.push(`${st}: de ${wins} janelas, ${shut} com algo sólido diante do vão e ${twice} com uma vidraça antes da face da parede (${gn} triângulos de vidraça)`); if (gn > 0) withWin++; say.v4.push(`${st} ${wins} vãos livres`);
  // (the inside: every piece of the plan drawn)
  const ins = plan && plan.ok ? B3.interior(plan, b, { fine: true }) : null; const kinds = {}; let none = 0;
  if (ins) for (const it of plan.items) { if (it.form) continue; const R = ins.item[it.id]; kinds[it.kind] = (kinds[it.kind] || 0) + 1; if (!R || R[2] <= R[1]) none++; }
  if (!ins || none || !(kinds['mesa-leitura'] >= 8) || !(kinds['mesa-escriba'] >= 3) || !(kinds.estante >= 8)) v5.push(`${st}: ${ins ? `${none} peças sem desenho; mesas de leitura ${kinds['mesa-leitura'] || 0}, de escriba ${kinds['mesa-escriba'] || 0}, estantes ${kinds.estante || 0}` : 'sem planta ou sem desenho'}`);
  say.v5.push(`${st} ${Object.values(kinds).reduce((a, x) => a + x, 0)} peças`);
  F.drop(b);
}
ok('v1 o deus pinta a grande biblioteca pela forma: nenhuma peça sem pintor, nenhuma volta quebrada', !v1.length, v1.join(' / ') || say.v1.join(', '));
ok('v2 o deus e o 3D do mesmo prédio: a silhueta (≥ 0,95) e o alto', !v2.length, v2.join(' / ') || say.v2.join(', '));
ok('v3 o 3D pelo risco da forma, dentro dos tetos (perto ≤ 60 mil triângulos, longe ≤ 2 mil)', !v3.length, v3.join(' / ') || say.v3.join(', '));
ok('v4 as janelas: de fora, pelo meio de cada uma, nada sólido diante do vão (uma faixa, uma meia coluna: L-873, L-874) e nenhuma vidraça antes da face da parede (a da forma por cima da da casca: L-871)', !v4.length && withWin === STY.length, v4.join(' / ') || `${say.v4.join(', ')}`);
ok('v5 por dentro, cada peça da planta desenhada (as mesas de leitura, as de escriba, as estantes)', !v5.length, v5.join(' / ') || say.v5.join(', '));
{ const e = G.modErr || {}; ok('sem erro do jogo', !Object.keys(e).length, JSON.stringify(e)); }
console.log(fails.length ? `SABER-3D: FALHOU (${fails.join(', ')})` : 'SABER-3D: ok');
process.exit(fails.length ? 1 : 0);
