// monumentos-ajustes: os ajustes da Arquitetura Monumental no 3D e na forma (Bairros Vivos, o agente E) — em Node, sem navegador,
// sem mundo gerado: cada prédio posto num chão plano, desenhado de perto e de longe pelo Build3D e medido por raios (as faces de
// um lado só, como o material do jogo) e pela contagem dos triângulos; o deus, pelo pintor gravado (visual/fidelidade-lib.js).
//   c1. O Coliseu de perto mais leve (D-178): os triângulos do desenho de perto dos degraus de 10 e de 13 casas dentro do teto
//       novo (era 23,2 mil no de 10), a figura de longe dentro do teto de 2 mil (D-118).
//   c2. Nenhum arco aberto para o que está atrás (D-178): por todo arco de todo andar da fachada, de fora (de frente, de lado e
//       do chão) e, na face de dentro, da arena — o olhar para no escuro da galeria, dentro da espessura da fachada; nos quatro
//       arcos das entradas, atravessa.
//   c3. O arco redondo onde o olho chega perto (D-178): o do térreo, da rua, e o da face de dentro sobre o passeio do alto das
//       fileiras em 12 peças; os dos andares de cima em 8.
//   c4. O velário (D-179): uma tira por baia, atada no alto dos dois mastros, descendo para dentro; a arena aberta para o céu;
//       sob cada tira, a sombra dela; pano não é pedra para o olho; o deus o pinta sem volta quebrada.
//   c5. Os escudos do ático (D-179): um redondo dourado na face de fora de cada baia sem janela, nenhum na de dentro; o deus os pinta.
//   c6. A paliçada de longe (L-800): os templos nórdicos de 4, 6 e 8 casas e o palácio nórdico de 6 — de longe, a cerca de tábuas
//       e nenhuma ponta de estaca solta no ar, dentro do teto de 2 mil; de perto, as estacas e as pontas.
//   c7. A linha da escada (L-801): no Templo Mayor de 10 e de 13 casas e no clássico, de 3, a faixa pintada em todo degrau — no
//       piso e no espelho —, a um dedo do degrau; e nada dela no ar diante do espelho, sobre o degrau de baixo (L-752).
//   c8. O portal da Grande Pirâmide (D-180): as peças do portal atrás da linha do pé da face (a praça inteira da planta), a boca
//       aberta para o corredor e o teto dele até a boca, os batentes de granito de frente para a rua, o remate de ouro de 1,5 m
//       ou mais; o deus o pinta.
//   c9. Os tetos do desenho em todo degrau com forma própria (D-118, L-802): de perto até 60 mil triângulos, de longe até 2 mil
//       — os teatros de 10 casas tinham 3,3 mil de longe.
//   c10. A cávea de longe em declive (L-803): nos teatros grego e romano de 6, 8 e 10 casas e no Coliseu, a figura de longe
//       desce com as fileiras — sobre a fileira de baixo, na altura dela; sobre a de cima, na dela — e não é um tambor chato.
//   c11. O piso do recinto dos templos pela forma (L-750): nos seis povos, de 4, 6 e 8 casas, de cima, onde os pés andam no
//       terreiro, o chão a um dedo do piso da planta — o templo asteca, risco com corpo, também.
//   c12. O teto de dentro de um salão no meio do lote (L-751): no Valhala de 10 e de 13 casas, o lado de baixo do telhado que o
//       dentro desenha fica dentro das paredes do salão e sob o telhado de escudos da forma, em todo ponto do salão.
//   node qa/visual/monumentos-ajustes.js [c1,c2,…]   (as partes; todas sem nada)   VERB=1 os números de cada caso
'use strict';
const F = require('./fidelidade-lib.js');
const clock = () => Number(process.hrtime.bigint() / 1000000n); const t0 = clock();
const { G, M } = F.load();
const ONLY = process.argv[2] ? process.argv[2].split(',') : null; const want = k => !ONLY || ONLY.includes(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumentos-ajustes ${name} | ${info}`); if (!c) fails.push(name); };
const Fo = G.Forma, B3 = G.Build3D, A = G.Arch; const TAU = Math.PI * 2;
// ------------------------------ the building on the flat world, its pictures ------------------------------
// (a building of n tiles a side on the flat world: its record made as the world makes it at the founding — forma-deus's putBig)
let nextId = 5200;
function put(type, st, n) {
  F.blank(); const S = G.S, def = G.BDEF[type], In = G.Interiors, x = 20, y = 20, id = nextId++;
  const b = { id, type, style: st, x, y, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, wd: null, crops: null, blocks: !!def.blocks, ip: null };
  S.buildings.set(id, b); if (def.blocks) for (let yy = y; yy < y + n; yy++) for (let xx = x; xx < x + n; xx++) S.occ[yy * G.N + xx] = id;
  if (In && In.TYPES[type]) b.ip = In.newRecord(b, { t: type, c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << Math.min(n, 30)) - 1, n });
  const Fm = Fo.of(type, st, n); const pl = G.Space.plinth(b);
  // (the form's frame in the world: the door to the south, u along X, v along Z; its heights over the plinth's top where the
  // plan raised its shell on it — a risk's —, over the lot's highest ground otherwise)
  const base = B3.riskForm(b) ? pl.y0 : pl.hi; const X0 = x * 4, Z0 = y * 4;
  return { b, Fm, base, W: (u, v, yy) => [X0 + u, base + yy, Z0 + v], X0, Z0 };
}
// (a ray against a picture's triangles, each seen from its front only — the game's material —, both sides where the game draws
// both (ds): the nearest hit { t, tri, p })
function shoot(tris, O, D) {
  let best = null; const l = Math.hypot(D[0], D[1], D[2]); const d = [D[0] / l, D[1] / l, D[2] / l];
  for (const T of tris) { const v = T.v;
    const e1x = v[3] - v[0], e1y = v[4] - v[1], e1z = v[5] - v[2], e2x = v[6] - v[0], e2y = v[7] - v[1], e2z = v[8] - v[2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x; const nd = nx * d[0] + ny * d[1] + nz * d[2];
    if (!T.ds && nd >= 0) continue; if (Math.abs(nd) < 1e-12) continue;
    const t = (nx * (v[0] - O[0]) + ny * (v[1] - O[1]) + nz * (v[2] - O[2])) / nd; if (t <= 1e-6 || (best && t >= best.t)) continue;
    const px = O[0] + d[0] * t - v[0], py = O[1] + d[1] * t - v[1], pz = O[2] + d[2] * t - v[2];
    const d11 = e1x * e1x + e1y * e1y + e1z * e1z, d12 = e1x * e2x + e1y * e2y + e1z * e2z, d22 = e2x * e2x + e2y * e2y + e2z * e2z, dp1 = px * e1x + py * e1y + pz * e1z, dp2 = px * e2x + py * e2y + pz * e2z;
    const den = d11 * d22 - d12 * d12; if (Math.abs(den) < 1e-18) continue; const a = (d22 * dp1 - d12 * dp2) / den, c = (d11 * dp2 - d12 * dp1) / den;
    if (a < -1e-7 || c < -1e-7 || a + c > 1 + 1e-7) continue; best = { t, tri: T, p: [O[0] + d[0] * t, O[1] + d[1] * t, O[2] + d[2] * t] }; }
  return best;
}
const rgb = hex => { const c = F.parseCol(hex); return [c[0], c[1], c[2]]; };
const near3 = (a, c, tol) => Math.abs(a[0] - c[0]) <= tol && Math.abs(a[1] - c[1]) <= tol && Math.abs(a[2] - c[2]) <= tol;
const paint = (b, hex, tol) => { const god = F.god(b), c = rgb(hex); let n = 0; for (const o of god.ops) if (o.f && near3(o.col, c, tol || 4)) n++; return { n, rings: (A.formStats || {}).rings, miss: [...A.formMissing] }; };
// (a bay of the arcaded ring in the world: its outer face's middle, the way along it, the way out; the inner face's the same)
function bayOf(P, e, q) {
  const n = e.pts.length, r = (q + 1) % n; const fr = (p0, p1, q0, q1) => { const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], mq = [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2]; const bw = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const tg = [(p1[0] - p0[0]) / bw, (p1[1] - p0[1]) / bw]; let o = [-tg[1], tg[0]]; if ((m[0] - mq[0]) * o[0] + (m[1] - mq[1]) * o[1] < 0) o = [-o[0], -o[1]]; return { m, tg, o, bw }; };
  const fo = fr(e.pts[q], e.pts[r], e.pts1[q], e.pts1[r]), fi = fr(e.pts1[q], e.pts1[r], e.pts[q], e.pts[r]);
  const t = Math.abs((fo.m[0] - fi.m[0]) * fo.o[0] + (fo.m[1] - fi.m[1]) * fo.o[1]);
  // (a point of a face: s along it from its middle, y over the lot, d out of it)
  const at = (f, s, y, d) => P.W(f.m[0] + f.tg[0] * s + f.o[0] * d, f.m[1] + f.tg[1] * s + f.o[1] * d, y);
  return { fo, fi, t, at };
}
const archOf = (st, bw) => { const h = st.y1 - st.y0, aw = Math.min(bw - 0.3, bw * st.arco.w); const ya = st.y0 + st.arco.a * h, yt = st.y0 + st.arco.b * h; return { aw, ya, yt, yh: yt - aw / 2 }; };

// ================ the Colosseum ================
// (each size made once, its two pictures kept; the building back in the world of the moment for whoever asks the game of it)
const COL = {}; const colOf = n => { const P = COL[n] || (COL[n] = (() => { const Q = put('maravilha', 'romano', n); Q.near = F.near(Q.b); Q.far = F.far(Q.b); Q.arc = Q.Fm.els.find(e => e.k === 'arcada'); return Q; })()); G.S.buildings.set(P.b.id, P.b); return P; };
if (want('c1')) {
  // (the ceilings: before D-178 the near picture of the step of 10 was 23,176 triangles, the panes among them; the step of 13's, 29,944)
  const lim = { 10: 20000, 13: 25600 }; const rows = [10, 13].map(n => { const P = colOf(n); return { n, near: P.near.tris.length, far: P.far.tris.length, cost: B3.cost(P.b) }; });
  ok('c1. o Coliseu de perto mais leve (D-178): os triângulos de perto dentro do teto novo, a figura de longe até 2 mil', rows.every(r => r.near <= lim[r.n] && r.far <= 2000 && r.cost.solid + r.cost.glass === r.near),
    rows.map(r => `de ${r.n} casas: perto ${r.near} (o teto ${lim[r.n]}; antes ${r.n === 10 ? 23176 : 29944}), longe ${r.far}`).join(' · '));
}
if (want('c2')) {
  const bad = []; let rays = 0, through = 0, ways = 0;
  for (const n of [10, 13]) { const P = colOf(n), e = P.arc, tris = P.near.tris, open = new Set(e.abertos || []), din = e.dentro ? e.dentro.y0 : Infinity;
    for (let q = 0; q < e.pts.length; q++) { const B = bayOf(P, e, q);
      e.andares.forEach((st, k) => { if (!st.arco) return;
        for (const [f, inner] of [[B.fo, false], [B.fi, true]]) { if (inner && st.y0 < din - 1e-6) continue;
          const a = archOf(st, f.bw); const way = !inner && k === 0 && open.has(q);
          // (the points of the opening: its middle, low at its two sides, under the top of its round head, in the head's two halves)
          const pts = [[0, (a.ya + a.yh) / 2], [-0.36 * a.aw, a.ya + 0.25], [0.36 * a.aw, a.ya + 0.25], [0, a.yt - 0.12], [-0.25 * a.aw, a.yh + 0.25 * a.aw], [0.25 * a.aw, a.yh + 0.25 * a.aw]];
          for (const [s, y] of pts) { const T = B.at(f, s, y, 0);
            // (the eyes: square to the face, from either side at 30°, from the ground 9 m out — the street's; the inner face's, the sand's)
            const eyes = [B.at(f, s, y, 6), B.at(f, s - 3.2, y, 5.5), B.at(f, s + 3.2, y, 5.5), B.at(f, s, inner ? Math.min(y, din + 1.7) : 1.7, 9)];
            for (const O of eyes) { rays++; const D = [T[0] - O[0], T[1] - O[1], T[2] - O[2]]; const h = shoot(tris, O, D);
              // (how deep behind the face the eye stops: along the way in)
              const depth = h ? -((h.p[0] - T[0]) * f.o[0] + (h.p[2] - T[2]) * f.o[1]) : Infinity;
              if (way) { ways++; if (depth > B.t + 0.3) through++; continue; }
              if (!(depth <= B.t + 0.05)) bad.push(`de ${n}, baia ${q}, andar ${k}${inner ? ' (dentro)' : ''}: o olhar para a ${Number.isFinite(depth) ? depth.toFixed(2) + ' m' : 'nada'} (a fachada tem ${B.t.toFixed(2)} m)`); } } } }); } }
  ok('c2. nenhum arco da fachada do Coliseu aberto para o que está atrás (D-178): o olhar para no escuro da galeria; nas entradas, atravessa', !bad.length && rays > 1000 && through > 0,
    `${rays} olhares por arcos dos dois tamanhos, de frente, de lado e do chão: ${bad.length} passam da fachada${bad.length ? ' — ' + bad.slice(0, 3).join('; ') : ''}; nas entradas, ${through} de ${ways} atravessam`);
}
if (want('c3')) {
  // (the probe: on the face at 0.986 of the arch's radius, π/16 up from its springing — inside an opening of 12 pieces by a
  // centimetre, in the stone of one of 8 pieces by 7 mm)
  const rows = [];
  for (const n of [10, 13]) { const P = colOf(n), e = P.arc, tris = P.near.tris, din = e.dentro ? e.dentro.y0 : Infinity; const open = new Set(e.abertos || []);
    const cnt = { rua: [0, 0], alto: [0, 0], passeio: [0, 0], dentroAlto: [0, 0] };
    for (let q = 0; q < e.pts.length; q++) { const B = bayOf(P, e, q);
      e.andares.forEach((st, k) => { if (!st.arco) return;
        for (const [f, inner] of [[B.fo, false], [B.fi, true]]) { if (inner && st.y0 < din - 1e-6) continue; if (!inner && k === 0 && open.has(q)) continue;
          const a = archOf(st, f.bw), rr = 0.986 * a.aw / 2, an = Math.PI / 16; const s = -Math.cos(an) * rr, y = a.yh + Math.sin(an) * rr;
          const O = B.at(f, s, y, 4), T = B.at(f, s, y, 0); const h = shoot(tris, O, [T[0] - O[0], T[1] - O[1], T[2] - O[2]]); const depth = h ? h.t - 4 : Infinity;
          const key = inner ? (st.y0 < din + 0.5 ? 'passeio' : 'dentroAlto') : k === 0 ? 'rua' : 'alto'; cnt[key][depth > 0.3 ? 0 : depth < 0.05 ? 1 : 0]++; if (!(depth > 0.3) && !(depth < 0.05)) cnt[key].bad = (cnt[key].bad || 0) + 1; } }); }
    rows.push({ n, cnt }); }
  const good = rows.every(r => r.cnt.rua[0] > 0 && r.cnt.rua[1] === 0 && r.cnt.passeio[0] > 0 && r.cnt.passeio[1] === 0 && r.cnt.alto[1] > 0 && r.cnt.alto[0] === 0 && r.cnt.dentroAlto[1] > 0 && r.cnt.dentroAlto[0] === 0 && !Object.values(r.cnt).some(c => c.bad));
  ok('c3. o arco redondo em 12 peças onde o olho chega perto (o térreo da rua, a face de dentro sobre o passeio), em 8 nos andares de cima (D-178)', good,
    rows.map(r => `de ${r.n} casas: da rua ${r.cnt.rua[0]} em 12 e ${r.cnt.rua[1]} em 8; sobre o passeio ${r.cnt.passeio[0]} em 12 e ${r.cnt.passeio[1]} em 8; no alto de fora ${r.cnt.alto[1]} em 8 e ${r.cnt.alto[0]} em 12; no alto de dentro ${r.cnt.dentroAlto[1]} em 8 e ${r.cnt.dentroAlto[0]} em 12`).join(' · '));
}
if (want('c4')) {
  const rows = [];
  for (const n of [10, 13]) { const P = colOf(n), Fm = P.Fm, tris = P.near.tris, e = P.arc; const vel = Fm.els.filter(q => q.k === 'pano' && q.velario), masts = Fm.els.filter(q => q.k === 'tora' && Math.abs(q.a[0] - q.b[0]) < 1e-6 && q.b[2] > e.y1);
    const sand = Fm.els.find(q => q.k === 'areia'); const O = Fm.amphi.oval; const why = [];
    if (vel.length !== e.pts.length) why.push(`${vel.length} tiras para ${e.pts.length} baias`);
    // (each strip: its two upper corners at the tops of two masts — a hand from them, under their tops —, its lower edge lower and
    // nearer the middle)
    let tied = 0, down = 0; for (const s of vel) { const up = s.p.slice(0, 2), lo = s.p.slice(2);
      if (up.every(c => masts.some(m => Math.hypot(m.a[0] - c[0], m.a[1] - c[1]) <= 0.3 && c[2] <= m.b[2] && c[2] >= m.b[2] - 1.0))) tied++;
      const dm = c => Math.hypot(c[0] - O.cu, c[1] - O.cv); if (lo.every(c => c[2] < up[0][2] - 2) && Math.max(...lo.map(dm)) < Math.min(...up.map(dm))) down++; }
    if (tied !== vel.length) why.push(`${tied} de ${vel.length} atadas no alto de dois mastros`); if (down !== vel.length) why.push(`${down} de ${vel.length} descem para dentro`);
    // (the arena open to the sky: up from the sand — its middle, a grid over it, a hand inside its edge all round —, nothing)
    let sky = 0, pts = 0; const up = (u, v, y) => shoot(tris, P.W(u, v, y), [0, 1, 0]);
    const probe = (u, v) => { pts++; if (!up(u, v, sand.y + 0.1)) sky++; };
    probe(O.cu, O.cv); for (const p of sand.pts) { const d = Math.hypot(p[0] - O.cu, p[1] - O.cv); probe(p[0] - (p[0] - O.cu) / d * 0.05, p[1] - (p[1] - O.cv) / d * 0.05); }
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const u = O.cu + i * O.Au / 4.5, v = O.cv + j * O.Bv / 4.5; if (O.inside(u, v, -0.3)) probe(u, v); }
    if (sky !== pts) why.push(`${pts - sky} de ${pts} pontos da areia com algo por cima`);
    // (under each strip, its shade: up from the top of the rows under its middle, the cloth — in its colour; and the eye's stone
    // knows nothing of it)
    let shade = 0, stone = 0; for (const s of vel) { const c = [0, 1, 2].map(k => (s.p[0][k] + s.p[1][k] + s.p[2][k] + s.p[3][k]) / 4); const h = up(c[0], c[1], O.yTop + 1.7);
      if (h && Math.abs(h.p[1] - (P.base + c[2])) < 0.6 && near3(h.tri.col, rgb(s.cor), 30)) shade++; const w = P.W(c[0], c[1], c[2]); if (B3.stoneAt(P.b, w[0], w[1], w[2])) stone++; }
    if (shade !== vel.length) why.push(`${shade} de ${vel.length} tiras com a sombra sob elas`); if (stone) why.push(`${stone} tiras são pedra para o olho`);
    const g = paint(P.b, vel.length ? vel[0].cor : '#000'); if (g.rings !== 0 || g.miss.length || !g.n) why.push(`o deus: ${g.n} panos pintados, ${g.rings} voltas quebradas, sem pintor: ${g.miss.join(', ') || '-'}`);
    rows.push({ n, why, vel: vel.length, masts: masts.length, pts, god: g.n }); }
  ok('c4. o velário do Coliseu (D-179): uma tira por baia atada no alto dos mastros, a arena aberta para o céu, a sombra sob cada tira, pano não é pedra, o deus o pinta', rows.every(r => !r.why.length),
    rows.map(r => `de ${r.n} casas: ${r.vel} tiras e ${r.masts} mastros, ${r.pts} pontos da areia sob o céu, o deus pinta ${r.god} panos da cor da primeira${r.why.length ? ' — ' + r.why.join('; ') : ''}`).join(' · '));
}
if (want('c5')) {
  const rows = [];
  for (const n of [10, 13]) { const P = colOf(n), e = P.arc, at = e.andares.find(s => s.escudo); const why = [];
    if (!at) { rows.push({ n, why: ['o ático sem escudos na forma'] }); continue; }
    const gold = rgb(at.escudo.cor); const bays = []; for (let q = 0; q < e.pts.length; q++) if (!(at.janela && q % (at.janela.cada || 1) === 0)) bays.push(q);
    // (the gilded triangles of the near picture: each on the outer face of a bay with no window, at the attic's height)
    let onOut = 0, off = 0; const per = new Map();
    for (const T of P.near.tris) { if (!near3(T.col, gold, 14)) continue; const c = [(T.v[0] + T.v[3] + T.v[6]) / 3, (T.v[1] + T.v[4] + T.v[7]) / 3, (T.v[2] + T.v[5] + T.v[8]) / 3]; if (c[1] < P.base + at.y0 || c[1] > P.base + at.y1) continue;
      let hit = -1; for (const q of bays) { const B = bayOf(P, e, q); const m = B.at(B.fo, 0, 0, 0); const d = (c[0] - m[0]) * B.fo.o[0] + (c[2] - m[2]) * B.fo.o[1], s = (c[0] - m[0]) * B.fo.tg[0] + (c[2] - m[2]) * B.fo.tg[1]; if (d > 0 && d < 0.12 && Math.abs(s) <= at.escudo.r) { hit = q; break; } }
      if (hit >= 0) { onOut++; per.set(hit, (per.get(hit) || 0) + 1); } else off++; }
    if (per.size !== bays.length) why.push(`${per.size} de ${bays.length} baias sem janela com o escudo`); if (off) why.push(`${off} triângulos dourados fora da face de fora`);
    const g = paint(P.b, at.escudo.cor); if (!(g.n >= 3 && g.n <= bays.length)) why.push(`o deus pinta ${g.n} escudos`);
    rows.push({ n, why, bays: bays.length, tris: onOut, god: g.n }); }
  ok('c5. os escudos dourados do ático do Coliseu (D-179): um na face de fora de cada baia sem janela, nenhum na de dentro; o deus os pinta nas baias que vê', rows.every(r => !r.why.length),
    rows.map(r => `de ${r.n} casas: ${r.bays} baias sem janela, ${r.tris} triângulos dourados nelas, o deus pinta ${r.god}${r.why.length ? ' — ' + r.why.join('; ') : ''}`).join(' · '));
}

// ================ the palisade from afar (L-800) ================
if (want('c6')) {
  const rows = [];
  for (const [type, st, n] of [['temple', 'nordico', 4], ['temple', 'nordico', 6], ['temple', 'nordico', 8], ['palacio', 'nordico', 6]]) {
    const P = put(type, st, n), far = F.far(P.b), near = F.near(P.b); const why = [];
    const stakes = P.Fm.els.filter(e => e.fino && e.k === 'tora'), tips = P.Fm.els.filter(e => e.fino && e.k === 'piramide'), fence = P.Fm.els.filter(e => e.k === 'pano' && e.cor === '#5c4028');
    if (!stakes.length || tips.length !== stakes.length || !fence.length) why.push(`a forma: ${stakes.length} estacas, ${tips.length} pontas, ${fence.length} panos de tábuas`);
    // (a stake's point: a triangle no wider than a hand and a half, all of it between the points' foot and their tip)
    const ya = Math.min(...tips.map(e => e.y0)), yb = Math.max(...tips.map(e => e.y1));
    const tipTris = pic => pic.tris.filter(T => { const ys = [T.v[1], T.v[4], T.v[7]], xs = [T.v[0], T.v[3], T.v[6]], zs = [T.v[2], T.v[5], T.v[8]];
      return Math.min(...ys) >= P.base + ya - 0.02 && Math.max(...ys) <= P.base + yb + 0.02 && Math.max(...xs) - Math.min(...xs) <= 0.3 && Math.max(...zs) - Math.min(...zs) <= 0.3 && tips.some(e => { const w = P.W(e.c[0], e.c[1], 0); return Math.hypot(w[0] - xs[0], w[2] - zs[0]) <= 0.3; }); }).length;
    const loose = tipTris(far), nearTips = tipTris(near); const fc = rgb('#5c4028'); const planks = far.tris.filter(T => near3(T.col, fc, 10)).length;
    if (loose) why.push(`${loose} triângulos de pontas soltas na figura de longe`); if (planks < 4 * fence.length) why.push(`${planks} triângulos da cerca de longe (${fence.length} panos)`);
    if (nearTips < 4 * tips.length) why.push(`de perto, ${nearTips} triângulos de pontas para ${tips.length} estacas`); if (far.tris.length > 2000) why.push(`a figura de longe com ${far.tris.length} triângulos`);
    const g = paint(P.b, '#5c4028', 22); if (g.rings !== 0 || g.miss.length || !g.n) why.push(`o deus: ${g.n} panos da cerca, ${g.rings} voltas quebradas`);
    rows.push({ lab: `${type}/${st}/${n}`, why, stakes: stakes.length, far: far.tris.length, planks, nearTips }); F.drop(P.b); }
  ok('c6. a paliçada de longe (L-800): a cerca de tábuas e nenhuma ponta de estaca solta no ar, a figura dentro do teto de 2 mil; de perto, as estacas com as pontas; o deus pinta as tábuas', rows.every(r => !r.why.length),
    rows.map(r => `${r.lab}: ${r.stakes} estacas; de longe ${r.far} triângulos, ${r.planks} da cerca; de perto ${r.nearTips} das pontas${r.why.length ? ' — ' + r.why.join('; ') : ''}`).join(' · '));
}

// ================ the painted line down a flight (L-801) ================
if (want('c7')) {
  const rows = [];
  for (const [type, st, n] of [['maravilha', 'asteca', 10], ['maravilha', 'asteca', 13], ['maravilha', 'asteca', G.BDEF.maravilha.w]]) {
    const P = put(type, st, n), e = P.Fm.els.find(q => q.k === 'escada' && q.divisor); if (!e) { rows.push({ lab: `${type}/${st}/${n}`, why: ['sem escada com a linha'] }); F.drop(P.b); continue; }
    const tris = F.near(P.b).tris, d = e.divisor; const run = e.a[1] - e.b[1], rise = e.b[2] - e.a[2], m = Math.max(2, Math.ceil(rise / 0.26)); const u = e.a[0] + d.u;
    const pal = (A.PAL || {})[st] || {}; const want3 = rgb(typeof pal[d.cor] === 'string' ? pal[d.cor] : d.cor); let tread = 0, riser = 0, high = 0, ledge = 0, ledgeAt = '';
    for (let k = 0; k < m; k++) { const yA = e.a[2] + rise * k / m, yT = e.a[2] + rise * (k + 1) / m, vF = e.a[1] - run * k / m, vN = k === m - 1 ? e.b[1] : e.a[1] - run * (k + 1) / m;
      // (down onto the tread's middle; from the front onto the riser's middle)
      const ht = shoot(tris, P.W(u, (vF + vN) / 2, yT + 1.0), [0, -1, 0]); if (ht && near3(ht.tri.col, want3, 26)) { tread++; if (ht.p[1] - (P.base + yT) > 0.011) high++; }
      const hr = shoot(tris, P.W(u, vF + 1.0, (yA + yT) / 2), [0, 0, -1]); if (hr && near3(hr.tri.col, want3, 26) && Math.abs(hr.t - 1.0) < 0.02) riser++;
      // (and down 3 mm before the riser, over the tread below: that tread, where the feet are — the line's tread stood out a hair
      // before its riser, in the air a riser over them: on the Templo Mayor of the mega of the generation 20, 25 cm over the floor
      // of the plan at the middle of a cell 5 mm before a riser, L-752)
      if (k) { const hl = shoot(tris, P.W(u, vF + 0.003, yT + 1.0), [0, -1, 0]); if (!hl || hl.p[1] - (P.base + yA) > 0.02) { ledge++; if (!ledgeAt) ledgeAt = ` (o ${k}º: ${hl ? (hl.p[1] - P.base - yA).toFixed(3) + ' m sobre o degrau de baixo' : 'nada'})`; } } }
    const why = []; if (tread !== m) why.push(`${tread} de ${m} pisos com a linha`); if (riser !== m) why.push(`${riser} de ${m} espelhos com a linha`); if (high) why.push(`${high} pisos com a linha a mais de 1 cm do degrau`);
    if (ledge) why.push(`${ledge} espelhos com a linha no ar diante deles, um degrau acima dos pés${ledgeAt}`);
    rows.push({ lab: `${type}/${st}/${n}`, why, m }); F.drop(P.b); }
  ok('c7. a linha pintada da escada (L-801): em todo degrau, no piso e no espelho, a um dedo dele — e nada dela no ar diante do espelho, sobre o degrau de baixo (L-752)', rows.every(r => !r.why.length), rows.map(r => `${r.lab}: ${r.m || 0} degraus${r.why.length ? ' — ' + r.why.join('; ') : ', todos com a linha'}`).join(' · '));
}

// ================ the Great Pyramid's gate (D-180) ================
if (want('c8')) {
  const rows = [];
  for (const n of [10, 13]) { const P = put('maravilha', 'egipcio', n), Fm = P.Fm, Ap = Fm.amphi.piramide, tris = F.near(P.b).tris; const why = []; const { cu, face, y0, cw } = Ap; const HEAD = 1.9;
    const pyr = Fm.els.find(e => e.k === 'piramide'); const gate = Fm.els.filter(e => !e.oculto && !e.piso && (e.k === 'bloco' || e.k === 'talude') && e.r[1] < face - 1e-6 && e.r[0] < cu + 3.5 && e.r[2] > cu - 3.5);
    if (gate.length < 4) why.push(`${gate.length} peças do portal`);
    // (all of it behind the face's foot line, but what hangs over the square higher than a head: the square is the plan's whole)
    const out = gate.filter(e => e.r[3] > face + 1e-6 && e.y0 < y0 + HEAD); if (out.length) why.push(`${out.length} peças do portal na praça, abaixo da cabeça`);
    const inSq = Fo.solids(Fm, y0).filter(s => s.k === 'rect' && s.r[3] > face + 0.05 && s.r[1] < face - 0.05); if (inSq.length) why.push(`${inSq.length} sólidos da forma atravessam a linha do pé da face`);
    // (the mouth open: from the street along the axis the eye goes in more than 3 m; either side of it, the granite's front)
    const hm = shoot(tris, P.W(cu, face + 6, y0 + 1.6), [0, 0, -1]); const deep = hm ? hm.t - 6 : Infinity; if (!(deep > 3.0)) why.push(`pelo eixo o olhar entra ${Number.isFinite(deep) ? deep.toFixed(2) : '-'} m`);
    const gr = rgb('#8a5a4a'); let jamb = 0; for (const sg of [-1, 1]) { const h = shoot(tris, P.W(cu + sg * (cw + 0.8), face + 6, y0 + 1.6), [0, 0, -1]); if (h && h.t - 6 > -0.05 && h.t - 6 < 0.3 && near3(h.tri.col, gr, 40)) jamb++; }
    if (jamb !== 2) why.push(`${jamb} de 2 batentes de granito de frente para a rua`);
    // (the corridor's ceiling to its very mouth: up from its floor along its last metre, the lintel's underside a body's height over it)
    let roof = 0, cells = 0; for (let v = face - 1.0; v < face - 0.01; v += 0.1) for (const du of [-cw + 0.1, 0, cw - 0.1]) { cells++; const h = shoot(tris, P.W(cu + du, v, y0 + 0.2), [0, 1, 0]); if (h && h.t >= 1.55 && h.t <= 3.0) roof++; }
    if (roof !== cells) why.push(`${cells - roof} de ${cells} pontos da boca do corredor sem o teto dele por cima`);
    const cap = pyr.ponta ? pyr.ponta.f * (pyr.y1 - pyr.y0) : 0; if (!(cap >= 1.5)) why.push(`o remate com ${cap.toFixed(2)} m`);
    const g = paint(P.b, '#8a5a4a', 40); if (g.rings !== 0 || g.miss.length || !g.n) why.push(`o deus: ${g.n} faces de granito, ${g.rings} voltas quebradas`);
    rows.push({ n, why, pieces: gate.length, deep, cap, god: g.n }); F.drop(P.b); }
  ok('c8. o portal de granito da Grande Pirâmide (D-180): atrás da linha do pé da face, a boca aberta para o corredor, os batentes de frente para a rua, o remate de ouro à vista; o deus o pinta', rows.every(r => !r.why.length),
    rows.map(r => `de ${r.n} casas: ${r.pieces} peças, pelo eixo o olhar entra ${Number.isFinite(r.deep) ? r.deep.toFixed(1) : '-'} m, o remate de ${r.cap.toFixed(2)} m, o deus pinta ${r.god} faces de granito${r.why.length ? ' — ' + r.why.join('; ') : ''}`).join(' · '));
}

// ================ the ceilings of every step with a form of its own (D-118, L-802) ================
if (want('c9')) {
  const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico']; const rows = [];
  for (const ty of Fo.types()) for (const st of STY) { if (!Fo.has(ty, st)) continue; const n0 = G.BDEF[ty] && G.BDEF[ty].w;
    for (const n of Fo.sizes(ty, st)) { if (n === n0) continue; const Fm = Fo.of(ty, st, n); if (!Fm || Fm.style !== st) continue;
      const P = put(ty, st, n); rows.push({ lab: `${ty}/${st}/${n}`, near: F.near(P.b).tris.length, far: F.far(P.b).tris.length }); F.drop(P.b); } }
  const bad = rows.filter(r => r.near > 60000 || r.far > 2000 || !r.near || !r.far); const top = k => rows.slice().sort((a, b) => b[k] - a[k])[0];
  if (process.env.VERB) for (const r of rows) console.log(`   ${r.lab}: perto ${r.near}, longe ${r.far}`);
  ok('c9. os tetos do desenho em todo degrau com forma própria (D-118, L-802): de perto até 60 mil triângulos, de longe até 2 mil', rows.length >= 60 && !bad.length,
    `${rows.length} degraus; o maior de perto ${top('near').lab} com ${top('near').near}, o maior de longe ${top('far').lab} com ${top('far').far}${bad.length ? ' — fora do teto: ' + bad.map(r => `${r.lab} (perto ${r.near}, longe ${r.far})`).join(', ') : ''}`);
}

// ================ the rows from afar, a bowl (L-803) ================
if (want('c10')) {
  const rows = [];
  for (const [type, st, n] of [['teatro', 'grego', 6], ['teatro', 'grego', 8], ['teatro', 'grego', 10], ['teatro', 'romano', 6], ['teatro', 'romano', 10], ['maravilha', 'romano', 10]]) {
    const P = put(type, st, n), far = F.far(P.b).tris; let pieces = 0, good = 0, worst = 0, fall = 0;
    for (const e of P.Fm.els) { if (e.k !== 'cavea' || !e.arco || e.aneis.length < 3) continue; pieces++;
      const am = (e.arco[0] + e.arco[1]) / 2, A = e.aneis, yTop = A[0][1], yLow = A[A.length - 1][1]; fall = Math.max(fall, yTop - yLow);
      // (down onto it — from over its top row, under an awning's cloth — a hand from its inner edge and a hand from its outer one,
      // at the middle of its arc: the far figure's height there against the rows' slope)
      let okP = true; for (const [r, f] of [[e.fundo + 0.4, 0], [A[0][0] - 0.4, 1]]) { const want2 = yLow + (yTop - yLow) * (r - e.fundo) / (A[0][0] - e.fundo);
        const h = shoot(far, P.W(e.c[0] + Math.cos(am) * r, e.c[1] + Math.sin(am) * r, yTop + 2), [0, -1, 0]); const d = h ? Math.abs(h.p[1] - (P.base + want2)) : Infinity; worst = Math.max(worst, d); if (!(d <= 0.8)) okP = false; void f; }
      if (okP) good++; }
    rows.push({ lab: `${type}/${st}/${n}`, pieces, good, worst, fall }); F.drop(P.b); }
  ok('c10. a cávea de longe em declive (L-803): a figura de longe desce com as fileiras, da de cima à de baixo', rows.every(r => r.pieces > 0 && r.good === r.pieces && r.fall > 2),
    rows.map(r => `${r.lab}: ${r.good} de ${r.pieces} partes da cávea no declive (o maior desvio ${Number.isFinite(r.worst) ? r.worst.toFixed(2) : '-'} m; as fileiras descem ${r.fall.toFixed(1)} m)`).join(' · '));
}

// ================ the paving of a temple's precinct (L-750) ================
// (each people's temple of 4, 6 and 8 tiles by its form: from above, over its yard — the precinct, the court, the Aztec's
// forecourt on the pyramid's top — where the feet walk, the floor drawn a finger over the plan's. The pavings a temple's risk
// paints 5 cm thick the 3D lays a finger over the platform; the Aztec's, a risk with a body, by the body's way — 5 cm over the
// feet, the temple#11167 of the metropole of the generation 20)
if (want('c11')) {
  const rows = [], In = G.Interiors;
  for (const st of ['grego', 'romano', 'egipcio', 'nordico', 'asteca', 'classico']) for (const n of [4, 6, 8]) {
    const P = put('temple', st, n), p = In.plan(P.b), lab = `${st}/${n}`; if (!p || !p.ok || !p.shell.yard) { rows.push({ lab, why: [p && p.ok ? 'sem terreiro na casca' : 'sem planta'] }); F.drop(P.b); continue; }
    const tris = F.near(P.b).tris, Yr = p.shell.yard.r, ly = p.levels.find(l => l.lv === (p.shell.yard.lv || 0)), yy = ly ? ly.y : 0, R = p.shell.r;
    const nearR = (x, z, r, m) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m; let k = 0, worst = 0, at = '';
    for (let fx = 0.1; fx < 1; fx += 0.2) for (let fz = 0.1; fz < 1; fz += 0.2) { const x = Yr[0] + (Yr[2] - Yr[0]) * fx, z = Yr[1] + (Yr[3] - Yr[1]) * fz;
      if (nearR(x, z, R, 0.7) || p.items.some(it => nearR(x, z, it.r, 0.15)) || !nearR(x, z, [Yr[0] + 0.35, Yr[1] + 0.35, Yr[2] - 0.35, Yr[3] - 0.35], 0) || !In.walk(P.b, ly ? ly.lv : 0, x, z)) continue;
      k++; const h = shoot(tris, P.W(x, z, yy + 2.6), [0, -1, 0]); const d = h ? h.p[1] - (P.base + yy) : Infinity; if (Math.abs(d) > Math.abs(worst)) { worst = d; at = `${x.toFixed(2)},${z.toFixed(2)}`; } }
    const why = []; if (!k) why.push('nenhum ponto do terreiro onde os pés andam'); if (Math.abs(worst) > 0.015) why.push(`o chão a ${Number.isFinite(worst) ? (worst * 100).toFixed(1) + ' cm' : 'nada'} do piso da planta (${yy} m) em ${at}`);
    rows.push({ lab, why, k, worst }); F.drop(P.b); }
  ok('c11. o piso do recinto dos templos pela forma (L-750): de cima, onde os pés andam no terreiro, a um dedo do piso da planta — o asteca pelo corpo também', rows.length === 18 && rows.every(r => !r.why.length),
    rows.filter(r => r.why.length).map(r => `${r.lab}: ${r.why.join('; ')}`).join(' · ') || rows.map(r => `${r.lab} ${r.k} pontos, ${(r.worst * 100).toFixed(1)} cm`).join(' · '));
}

// ================ the ceiling of a hall in the middle of its lot (L-751) ================
// (Valhalla of 10 and 13 tiles — its hall in the middle of a lot of 40 and 52 m, 13.5 m and more in from its corner —: the
// underside of the roof the inside draws within the hall's walls, and under the form's roof of shields over each point of the
// hall. The box of the storeys under the roof was begun at 9 m: the slopes began at 9 m, out through the hall's wall, too
// shallow, and stood over the form's roof by its long walls — 9.18 m over the floor where the form's is at 6.55, L-751)
if (want('c12')) {
  const rows = [], In = G.Interiors; const trisOfGeo = g => { const out = [], A = g.p; for (let k = 0; k + 8 < A.length; k += 9) out.push({ v: [A[k], A[k + 1], A[k + 2], A[k + 3], A[k + 4], A[k + 5], A[k + 6], A[k + 7], A[k + 8]] }); return out; };
  for (const n of [10, 13]) {
    const P = put('maravilha', 'nordico', n), p = In.plan(P.b), lab = `Valhala de ${n}`; if (!p || !p.ok) { rows.push({ lab, why: ['sem planta'] }); F.drop(P.b); continue; }
    const ins = B3.interior(p, P.b, { fine: true }), out = F.near(P.b).tris, R = p.shell.r, l0 = p.levels[0]; const [X0, , Z0] = ins.at; const inT = trisOfGeo(ins.roof);
    let off = 0; for (let k = 0; k < ins.roof.p.length; k += 3) { const x = ins.roof.p[k] - X0, z = ins.roof.p[k + 2] - Z0; if (x < R[0] - 0.05 || x > R[2] + 0.05 || z < R[1] - 0.05 || z > R[3] + 0.05) off++; }
    let k = 0, over = 0, ex = ''; const A = l0.area;
    for (const fx of [0.1, 0.3, 0.5, 0.7, 0.9]) for (const fz of [0.03, 0.1, 0.25, 0.4, 0.6, 0.75, 0.9, 0.97]) { const x = A[0] + (A[2] - A[0]) * fx, z = A[1] + (A[3] - A[1]) * fz; k++;
      const up = shoot(inT, P.W(x, z, l0.y + 0.3), [0, 1, 0]), down = shoot(out, P.W(x, z, 60), [0, -1, 0]);
      if (!up || !down || up.p[1] > down.p[1] - 0.05) { over++; if (!ex) ex = ` (em ${x.toFixed(2)},${z.toFixed(2)}: o teto de dentro ${up ? (up.p[1] - P.base).toFixed(2) + ' m' : 'nenhum'}, o telhado da forma ${down ? (down.p[1] - P.base).toFixed(2) + ' m' : 'nenhum'})`; } }
    const why = []; if (off) why.push(`${off} pontos do teto de dentro fora das paredes do salão`); if (over) why.push(`${over} de ${k} pontos com o teto de dentro sobre o telhado da forma, ou sem ele${ex}`);
    rows.push({ lab, why, k }); F.drop(P.b); }
  ok('c12. o teto de dentro de um salão no meio do lote (L-751): no Valhala de 10 e de 13 casas, dentro das paredes do salão e sob o telhado da forma', rows.length === 2 && rows.every(r => !r.why.length),
    rows.map(r => `${r.lab}: ${r.why.length ? r.why.join('; ') : `${r.k} pontos, o teto de dentro sob o telhado da forma em todos`}`).join(' · '));
}

const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(`(${((clock() - t0) / 1000).toFixed(1)} s)`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
