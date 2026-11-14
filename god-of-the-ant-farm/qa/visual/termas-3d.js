// termas-3d: as termas (5 casas) e as grandes termas (7 casas) no 3D e na vista do deus (T-784, D-183), em Node, sem navegador
// e sem mundo gerado: cada uma num chão plano, desenhada de perto, de longe e de dentro pelo Build3D e medida por raios e pela
// contagem dos triângulos (visual/fidelidade-lib.js); o deus pelo pintor gravado.
//   t1. As janelas da casca uma vez só: por cada janela das paredes de fora do bloco, o olhar de fora atravessa UM vidro — o da
//       planta, dentro da espessura da parede —, nunca dois (o da forma e o da planta um sobre o outro; js/build3d.js, riskSkip);
//       nas grandes termas, o clerestório — só da forma, acima do beiral — tem os seus vidros.
//   t2. De dentro: o 3D desenha cada peça da planta — cada piscina, a fornalha, os cabides, os bancos —, e sobre cada piscina dos
//       cômodos o olhar de cima bate em água, na bacia dela (as abertas da palestra são da forma: a lâmina de água); as colunas
//       da grande sala estão onde a planta as tem (o olhar para nelas).
//   t3. De longe: a figura guarda a cúpula do caldário e o bloco (o alto dela é o da forma; o olhar de cima sobre o caldário
//       bate acima do beiral), dentro do teto de 2 mil triângulos; de perto, dentro do teto de 60 mil.
//   t4. O deus pinta as termas pela forma sem peça que falte nem volta quebrada, o romano e o grego com a cúpula.
//   node qa/visual/termas-3d.js [t1,t2,…]      VERB=1 os números de cada caso
'use strict';
const F = require('./fidelidade-lib.js');
const { G, M } = F.load();
const ONLY = process.argv[2] ? process.argv[2].split(',') : null; const want = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | termas-3d ${name} | ${info}`); if (!c) fails.push(name); };
const Fo = G.Forma, B3 = G.Build3D, A = G.Arch, In = G.Interiors;
const TERMA = ['romano', 'grego', 'classico'], DEG = [5, 7]; const nome = n => (n === 5 ? 'T' : 'G');
// (a building of n tiles a side on the flat world, its record as the world makes it at the founding — monumentos-ajustes' put)
let nextId = 6200;
function put(st, n) {
  F.blank(); const S = G.S, def = G.BDEF.banhos, x = 20, y = 20, id = nextId++;
  const b = { id, type: 'banhos', style: st, x, y, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, wd: null, crops: null, blocks: !!def.blocks, ip: null };
  S.buildings.set(id, b); for (let yy = y; yy < y + n; yy++) for (let xx = x; xx < x + n; xx++) S.occ[yy * G.N + xx] = id;
  b.ip = In.newRecord(b, { t: 'banhos', c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << n) - 1, n });
  const Fm = Fo.of('banhos', st, n); const pl = G.Space.plinth(b); const base = B3.riskForm(b) ? pl.y0 : pl.hi; const X0 = x * 4, Z0 = y * 4;
  return { b, Fm, R: In.riskOf(Fm), base, W: (u, v, yy) => [X0 + u, base + yy, Z0 + v], X0, Z0 };
}
// (every crossing of a ray with a picture's triangles, whichever side they face, the nearest first: { t, col, y })
function crossings(tris, O, D) {
  const out = []; const l = Math.hypot(D[0], D[1], D[2]); const d = [D[0] / l, D[1] / l, D[2] / l];
  for (const T of tris) { const v = T.v;
    const e1x = v[3] - v[0], e1y = v[4] - v[1], e1z = v[5] - v[2], e2x = v[6] - v[0], e2y = v[7] - v[1], e2z = v[8] - v[2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x; const nd = nx * d[0] + ny * d[1] + nz * d[2]; if (Math.abs(nd) < 1e-12) continue;
    const t = (nx * (v[0] - O[0]) + ny * (v[1] - O[1]) + nz * (v[2] - O[2])) / nd; if (t <= 1e-6) continue;
    const px = O[0] + d[0] * t - v[0], py = O[1] + d[1] * t - v[1], pz = O[2] + d[2] * t - v[2];
    const d11 = e1x * e1x + e1y * e1y + e1z * e1z, d12 = e1x * e2x + e1y * e2y + e1z * e2z, d22 = e2x * e2x + e2y * e2y + e2z * e2z, dp1 = px * e1x + py * e1y + pz * e1z, dp2 = px * e2x + py * e2y + pz * e2z;
    const den = d11 * d22 - d12 * d12; if (Math.abs(den) < 1e-18) continue; const a = (d22 * dp1 - d12 * dp2) / den, c = (d11 * dp2 - d12 * dp1) / den;
    if (a < -1e-7 || c < -1e-7 || a + c > 1 + 1e-7) continue; out.push({ t, col: T.col, y: O[1] + d[1] * t, front: nd < 0 }); }
  return out.sort((p, q) => p.t - q.t);
}
const GLASS = [28, 38, 48]; const isGlass = c => Math.abs(c[0] - GLASS[0]) <= 3 && Math.abs(c[1] - GLASS[1]) <= 3 && Math.abs(c[2] - GLASS[2]) <= 3;
// (the triangles of the inside as the 3D draws it when one is in — Build3D.interior: the floors, the inner faces, the pieces)
function inside(P) {
  const plan = In.plan(P.b); const I3 = B3.interior(plan, P.b, { fine: true }); const out = []; const toS = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
  const add = geo => { if (!geo || geo.empty) return; const g = geo.build(); const Q = g.attributes.position.array, C = g.attributes.color ? g.attributes.color.array : null;
    for (let k = 0; k + 8 < Q.length; k += 9) { const col = C ? [toS((C[k] + C[k + 3] + C[k + 6]) / 3), toS((C[k + 1] + C[k + 4] + C[k + 7]) / 3), toS((C[k + 2] + C[k + 5] + C[k + 8]) / 3)] : [200, 200, 200]; const v = []; for (let q = 0; q < 9; q++) v.push(Q[k + q]); out.push({ v, col }); } };
  for (const k in I3.lv) add(I3.lv[k]);
  return { plan, I3, tris: out };
}

// ---------------------------------------------------------------- t1: the shell's windows once
function t1() {
  const out = [], sum = [];
  for (const n of DEG) for (const st of TERMA) {
    const P = put(st, n), R = P.R; const pic = F.near(P.b); let wins = 0, two = 0, none = 0; const key = `${nome(n)}/${st}`;
    for (const w of R.walls) { if (!w.outer || w.kind !== 'parede' || w.yard) continue; const ax = [w.b[0] - w.a[0], w.b[1] - w.a[1]]; const l = Math.hypot(ax[0], ax[1]); const nr = [ax[1] / l, -ax[0] / l];
      // (the way out of the block: away from its middle)
      const mid = [(R.B[0] + R.B[2]) / 2, (R.B[1] + R.B[3]) / 2]; const outw = ((w.a[0] + w.b[0]) / 2 - mid[0]) * nr[0] + ((w.a[1] + w.b[1]) / 2 - mid[1]) * nr[1] > 0 ? nr : [-nr[0], -nr[1]];
      for (const op of w.ops) { if (op.k !== 'janela') continue; wins++;
        const y = R.Hp + op.sill + op.h / 2; const O = P.W(op.p[0] + outw[0] * 2, op.p[1] + outw[1] * 2, y); const X = crossings(pic.tris, O, [-outw[0], 0, -outw[1]]);
        // (through the wall's thickness, from a hand before its outer face to a hand past its inner one: the panes there — a pane
        // is a thin slab, its two faces a finger apart: the glass crossed more than a hand apart is another pane)
        const g = X.filter(q => isGlass(q.col) && q.t > 2 - w.t / 2 - 0.15 && q.t < 2 + w.t / 2 + 0.15); let panes = 0, last = -1; for (const q of g) { if (q.t - last > 0.05) panes++; last = q.t; }
        if (!panes) none++; else if (panes > 1) two++; } }
    // (the great thermae's clerestory: the form's own windows over the eaves — glass up there)
    const clere = n === 7 ? pic.tris.filter(T => isGlass(T.col) && Math.min(T.v[1], T.v[4], T.v[7]) > P.base + R.eave + 0.3).length : -1;
    if (!wins || two || none || (n === 7 && !clere)) out.push(`${key}: ${wins} janelas, ${two} com dois vidros, ${none} sem vidro${n === 7 ? `, ${clere} triângulos de vidro no clerestório` : ''}`);
    sum.push(`${key} ${wins}${n === 7 ? ` (+ o clerestório, ${clere} triângulos de vidro)` : ''}`);
  }
  ok('t1. as janelas da casca das termas com um vidro só — o da planta, na espessura da parede —, nunca o da forma por cima; o clerestório das grandes termas com os seus', !out.length, out.slice(0, 3).join(' / ') || `as janelas de cada uma: ${sum.join(', ')}`);
}
// ---------------------------------------------------------------- t2: the inside
function t2() {
  const out = [], sum = [];
  for (const n of DEG) for (const st of ['romano', 'grego']) {
    const P = put(st, n), R = P.R; const I = inside(P); const key = `${nome(n)}/${st}`; const why = [];
    // (every piece of the plan drawn — the 3D's own list of what it drew — but the form's own solids, which the form draws)
    const items = I.plan.items.filter(i => !i.form); const undrawn = items.filter(i => !I.I3.item[i.id]); if (undrawn.length) why.push(`${undrawn.length} peças não desenhadas (${[...new Set(undrawn.map(i => i.kind))].join(', ')})`);
    const shut = R.pools.filter(q => !q.open), open = R.pools.filter(q => q.open);
    const cnt = k => items.filter(i => i.kind === k && I.I3.item[i.id]).length; if (cnt('piscina') !== shut.length || cnt('fornalha-banho') !== 1 || cnt('cabide') !== R.pegs.length) why.push(`desenhadas ${cnt('piscina')} piscinas, ${cnt('fornalha-banho')} fornalha, ${cnt('cabide')} cabides`);
    // (over each pool of the rooms the look from above lands on water, in its basin: within a knee of the floor — not a painted
    // rug on it, not a well; the open pools of the palestra are the form's: their sheet of water a piece of it)
    let dry = 0, off = 0;
    for (const q of shut) { const c = [(q.r[0] + q.r[2]) / 2, (q.r[1] + q.r[3]) / 2]; const O = P.W(c[0], c[1], R.Hp + 2.5); const h = crossings(I.tris, O, [0, -1, 0]).filter(k => k.t > 0.5)[0];
      if (!h || !(h.col[2] > h.col[0] + 15)) dry++; else { const up = h.y - P.base - R.Hp; if (!(up > 0.1 && up < 0.7)) off++; } }
    const sheets = open.filter(q => P.Fm.els.some(e => e.k === 'lamina' && e.r && e.r[0] >= q.r[0] - 0.01 && e.r[1] >= q.r[1] - 0.01 && e.r[2] <= q.r[2] + 0.01 && e.r[3] <= q.r[3] + 0.01)).length;
    if (dry || off || sheets !== open.length) why.push(`${dry} piscinas sem água sob o olhar, ${off} com a água fora da bacia, ${sheets} de ${open.length} piscinas abertas com a lâmina de água da forma`);
    // (the hall's columns where the plan has them: a look across the hall at a man's height stops at each)
    let cols = 0, miss = 0; const near = F.near(P.b).tris.concat(I.tris);
    for (const q of R.pieces) { if (q.k !== 'coluna') continue; cols++; const c = [(q.r[0] + q.r[2]) / 2, (q.r[1] + q.r[3]) / 2]; const O = P.W(c[0], c[1] + 1.2, R.Hp + 1.5); const h = crossings(near, O, [0, 0, -1])[0]; if (!h || Math.abs(h.t - (1.2 - q.rc)) > 0.2) miss++; }
    if (miss) why.push(`${miss} de ${cols} colunas da sala fora do lugar da planta`); if (n === 7 && cols < 4) why.push(`${cols} colunas na grande sala`);
    if (why.length) out.push(`${key}: ${why.join(', ')}`);
    sum.push(`${key} ${items.length} peças (${cnt('piscina')} piscinas com água, ${cnt('cabide')} cabides${cols ? `, ${cols} colunas` : ''})`);
  }
  ok('t2. de dentro, o 3D desenha cada peça da planta das termas — as piscinas com a água na bacia, a fornalha, os cabides, os bancos —, as piscinas abertas da palestra com a lâmina de água da forma, e as colunas da grande sala onde a planta as tem', !out.length, out.slice(0, 3).join(' / ') || sum.join(' · '));
}
// ---------------------------------------------------------------- t3: from afar
function t3() {
  const out = [], sum = [];
  for (const n of DEG) for (const st of TERMA) {
    const P = put(st, n), R = P.R; const near = F.near(P.b), far = F.far(P.b); const key = `${nome(n)}/${st}`; const why = [];
    const top = T => Math.max(...T.map(q => Math.max(q.v[1], q.v[4], q.v[7]))) - P.base;
    if (near.tris.length > 60000) why.push(`${near.tris.length} triângulos de perto`); if (far.tris.length > 2000 || far.tris.length < 20) why.push(`${far.tris.length} triângulos de longe`);
    if (Math.abs(top(far.tris) - P.Fm.top) > 0.6) why.push(`o alto de longe a ${top(far.tris).toFixed(1)} m (a forma: ${P.Fm.top.toFixed(1)})`);
    // (the dome kept from afar: over the middle of the hot room the look from above lands over the eaves; over a wing, at its roof)
    const d = R.domo; const O = P.W(d.c[0], d.c[1], 60); const h = crossings(far.tris, O, [0, -1, 0])[0]; const hy = h ? h.y - P.base : -1;
    if (!(hy > R.eave + 1.0)) why.push(`de longe, sobre o caldário o olhar bate a ${hy.toFixed(1)} m (o beiral: ${R.eave})`);
    const O2 = P.W(R.B[0] + 2, (R.B[1] + R.B[3]) / 2, 60); const h2 = crossings(far.tris, O2, [0, -1, 0])[0]; const hy2 = h2 ? h2.y - P.base : -1;
    if (!(hy2 > R.eave - 1.5 && hy2 < R.eave + 3.5)) why.push(`de longe, sobre a ala o olhar bate a ${hy2.toFixed(1)} m`);
    if (why.length) out.push(`${key}: ${why.join(', ')}`);
    sum.push(`${key} ${near.tris.length}/${far.tris.length}, a cúpula a ${hy.toFixed(1)} m`);
  }
  ok('t3. de longe a figura das termas guarda a cúpula do caldário e o bloco, com o alto da forma, dentro do teto de 2 mil triângulos; de perto, dentro do de 60 mil', !out.length, out.slice(0, 3).join(' / ') || `perto/longe: ${sum.join(', ')}`);
}
// ---------------------------------------------------------------- t4: the god's picture
function t4() {
  const out = [], sum = [];
  for (const n of DEG) for (const st of TERMA) {
    const P = put(st, n); const god = F.god(P.b); const key = `${nome(n)}/${st}`; const stats = A.formStats || {}; const miss = [...(A.formMissing || [])];
    const filled = god.ops.filter(o => o.f).length;
    if (!filled || miss.length || stats.broken) out.push(`${key}: ${filled} peças pintadas, faltam ${miss.join(', ') || 'nenhuma'}, ${stats.broken || 0} voltas quebradas`);
    sum.push(`${key} ${filled}`);
  }
  ok('t4. o deus pinta as termas pela forma: nenhuma peça que falte, nenhuma volta quebrada', !out.length, out.slice(0, 3).join(' / ') || `peças pintadas: ${sum.join(', ')}`);
}
const PARTS = { t1, t2, t3, t4 };
for (const k of Object.keys(PARTS)) if (want(k)) PARTS[k]();
const err = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `TERMAS-3D: FALHOU (${fails.join(', ')})` : 'TERMAS-3D: ok');
process.exit(fails.length ? 1 : 0);
