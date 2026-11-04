// forma-deus: o deus desenha um prédio pela forma dele (Arquitetura Monumental, D-106) — em Node, sem navegador.
// (a) O pintor da forma (G.Arch.formSprite) contra o desenho à mão de hoje: cada tipo e povo com forma clássica pintado pelas
//     peças da forma e pelo desenho de antes, gravados enquanto pintam (visual/fidelidade-lib.js) e medidos na mesma grade —
//     a silhueta (o quanto as duas se cobrem), o alto, a largura por faixa, a linha do chão. «Quase iguais»: os limites da
//     fidelidade para duas figuras da mesma casca (LIM do fidelidade.js), e nenhuma peça que o pintor não saiba pintar.
// (b) O degrau novo pela forma: um Coliseu de 10 casas (a forma do M1 quando houver; até lá, um gerador de teste registrado só
//     nesta prova) — o deus o desenha pelo pintor, do tamanho dele (o «sprite» de 10 casas), com a massa do 3D do mesmo prédio
//     e da forma (a fidelidade: silhueta, alto, largura, a planta vista de cima); um tamanho sem forma não cai no desenho de
//     antes; o desenho do tamanho clássico é o de antes, igual; o «sprite» grande feito uma vez e guardado.
// (c) A ordem do desenho dos prédios grandes: nas quatro vistas, quem está ao lado ou atrás de um prédio de 10 casas (de 3, de 2)
//     é desenhado do lado certo dele — na frente das faces que o deus vê, atrás das outras —, pela chave do render.js (R.bkey:
//     a profundidade do meio do lote, de R.bigW casas para cima); e quantos a regra de antes (o canto da frente, um palmo para
//     trás) punha do lado errado — em 1 casa, as duas contadas.
// (d) A ordem no mundo vivo (L-527): nos mundos prontos «metropole» e «mega», em volta de cada prédio de 2 casas ou mais que o
//     deus desenha como uma caixa, nas quatro vistas, as árvores, as pedras, os arbustos, as pessoas, os bichos, as carroças, os
//     muros e os outros prédios (caixa contra caixa) do lado certo; o que os ganchos dos outros arquivos põem, contado pelo nome
//     (a profundidade deles é deles); e quantos a chave de antes (a da 1ª rodada: o meio do lote só de 3 casas para cima, o
//     curral, o estábulo e a feira pelo canto da frente) punha do lado errado.
// (e) O desenho não muda o mundo: pintar o prédio grande e pedir a chave do desenho (R.bkey) não escreve no prédio nem tira do acaso do mundo.
//   node qa/visual/forma-deus.js [a,b,c,d,e]   (as partes; todas sem nada)    PNG=pasta  as folhas (deus à mão | pintor; deus | 3D)
//   VERB=1  cada tipo e povo                   JSON=arquivo  os números
'use strict';
const path = require('path'), fs = require('fs');
const F = require('./fidelidade-lib.js');
const clock = () => Number(process.hrtime.bigint() / 1000000n);
const t0 = clock();
const { G, M } = F.load();
const ONLY = process.argv[2] ? process.argv[2].split(',') : null; const want = k => !ONLY || ONLY.includes(k);
const STY = ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico'];
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | forma-deus ${name} | ${info}`); if (!c) fails.push(name); };
const Fo = G.Forma, A = G.Arch;
// (the fidelity's limits for two pictures of one shell — fidelidade.js LIM: their overlap, their tops, their widths band by
// band, their foot lines)
const LIM = { iou: 0.80, top: 1.3, topK: 0.10, prof: 0.15, foot: 3.0 };
const json = {};

// ------------------------------ (a) the painter against the drawings of before ------------------------------
if (want('a')) {
  F.blank(); const rows = []; const sheets = new Map(); let q = 0; const doors = { n: 0, lost: 0, bad: [] };
  for (const type of Fo.types()) for (const st of STY) {
    if (!G.BDEF[type] || !Fo.has(type, st)) continue;
    const b = F.put(type, st, 1000 + (q++) * 7);
    try {
      const Fm = Fo.of(type, st, b.w); if (!Fm || (G.Build3D && G.Build3D.byForm && !G.Build3D.byForm(b))) continue;
      A.formMissing.clear();
      const hand = F.god(b), pin = F.god(b, { pic: () => A.formSprite(type, st, b.w, false) });
      if (hand.none) continue; // (a type the god draws in a layer of its own)
      const mk = F.gridFor(hand, pin); const Rh = F.paintGod(hand, mk()), Rp = F.paintGod(pin, mk());
      const c = F.compare(F.measure(Rh), F.measure(Rp), [b.w, b.h]);
      const why = []; if (c.empty) why.push('vazio: ' + c.empty);
      else { if (c.iou < LIM.iou) why.push(`silhueta ${c.iou.toFixed(2)}`); if (Math.abs(c.dTop) > Math.max(LIM.top, LIM.topK * c.topA)) why.push(`alto ${c.topA.toFixed(1)}→${c.topB.toFixed(1)} m`); if (c.dProf > LIM.prof) why.push(`largura ${c.dProf.toFixed(2)}`); if (c.dFoot > LIM.foot) why.push(`pé ${c.dFoot.toFixed(1)} px`); }
      if (A.formMissing.size) why.push('peças sem pintor: ' + [...A.formMissing].join(', '));
      rows.push({ type, st, iou: c.iou || 0, dTop: c.dTop || 0, dProf: c.dProf || 0, dFoot: c.dFoot || 0, dentro: F.inside(Rh, Rp), parts: A.formStats && A.formStats.parts, why });
      if (process.env.PNG) { if (!sheets.has(type)) sheets.set(type, { rows: [], lots: [] }); const s = sheets.get(type); s.rows.push([Rh, Rp]); s.lots.push([b.w, b.h]); }
      // (the picture without its door — the view does not see its side, L-264 —: the form's door on the front left out, and only it)
      const D = Fm.door; const dp = D && Fm.els.filter(e => e.k === 'porta' && e.na !== 'piramide' && !e.lacrada && Math.abs(e.u - D.u) <= D.w / 2 + 0.3 && Math.abs((e.y0 || 0) - (D.y0 || 0)) < 0.35);
      if (dp && dp.length) { doors.n++; const no = F.god(b, { pic: () => A.formSprite(type, st, b.w, true) }); const k = pin.ops.length - no.ops.length;
        if (k === dp.length) doors.lost++; else doors.bad.push(`${type}/${st} (${k} de ${dp.length})`); }
    } finally { F.drop(b); }
  }
  ok('a: o pintor sem a porta que a vista não vê', doors.n > 0 && !doors.bad.length, `${doors.lost} de ${doors.n} tipos e povos com a porta na frente da forma: só ela fica de fora${doors.bad.length ? ' — não: ' + doors.bad.join(', ') : ''}`);
  if (process.env.PNG) { fs.mkdirSync(process.env.PNG, { recursive: true }); for (const [type, s] of sheets) F.png(path.join(process.env.PNG, `pintor-${type}.png`), s.rows, s.lots, 1); }
  const bad = rows.filter(r => r.why.length); const ious = rows.map(r => r.iou).sort((x, y) => x - y);
  const med = ious.length ? ious[Math.floor(ious.length / 2)] : 0, p10 = ious.length ? ious[Math.floor(ious.length * 0.1)] : 0;
  if (process.env.VERB) for (const r of rows) console.log(`   ${r.type}/${r.st}: silhueta ${r.iou.toFixed(3)}, alto ${r.dTop.toFixed(2)} m, largura ${r.dProf.toFixed(3)}, pé ${r.dFoot.toFixed(1)} px, cor por dentro ${(r.dentro * 100).toFixed(0)} %, ${r.parts} partes${r.why.length ? ' — ' + r.why.join(', ') : ''}`);
  json.a = rows;
  ok('a: o pintor da forma e o desenho à mão', rows.length > 0 && !bad.length, `${rows.length} tipos e povos com forma: silhueta mediana ${med.toFixed(3)}, p10 ${p10.toFixed(3)}, a menor ${ious[0] !== undefined ? ious[0].toFixed(3) : '-'}${bad.length ? ' — longe do desenho: ' + bad.map(r => `${r.type}/${r.st} (${r.why.join(', ')})`).join(' · ') : ''}`);
}

// ------------------------------ the step of 10 tiles ------------------------------
// (M1's Colosseum when its form is in the game; until then the test generator of visual/forma-deus-lib.js, registered here only)
const { coliseuTeste } = require('./forma-deus-lib.js');
const N10 = require('./forma-deus-lib.js').N, TESTE = !Fo.has('maravilha', 'romano', N10); if (TESTE) Fo.def('maravilha', 'romano', coliseuTeste, [N10]);
// (a building of n tiles a side on the flat world: its record made as the world makes it at the founding, its lot n)
function putBig(type, st, id, n, x, y) {
  const S = G.S, def = G.BDEF[type], In = G.Interiors; x = x === undefined ? 20 : x; y = y === undefined ? 20 : y;
  const b = { id, type, style: st, x, y, w: n, h: n, built: true, progress: 1, hp: def.hp || 100, maxHp: def.hp || 100, v: 0, set: 0, wd: null, crops: null, blocks: !!def.blocks, ip: null };
  S.buildings.set(id, b); if (def.blocks) for (let yy = y; yy < y + n; yy++) for (let xx = x; xx < x + n; xx++) S.occ[yy * G.N + xx] = id;
  if (In && In.TYPES[type]) b.ip = In.newRecord(b, { t: type, c: st, e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 1, pw: 0, s: 'S', o: (1 << Math.min(n, 30)) - 1, n });
  return b;
}

// ------------------------------ (b) the new step by its form ------------------------------
if (want('b')) {
  F.blank(); const Art = G.Art; const b = putBig('maravilha', 'romano', 4242, N10); const L0 = G.BDEF.maravilha.w;
  try {
    A.formMissing.clear(); const t1 = clock(); const god = F.god(b); const ms = clock() - t1; const st = A.formStats || {};
    const want10 = Art.spriteDims ? Art.spriteDims(N10, N10, 0)[0] : (N10 * 2) * 16 + 16;
    ok('b: o degrau de 10 casas desenhado pelo pintor, do tamanho dele', !god.none && god.spr && Math.abs(god.spr.w - want10) < 0.5 && !A.formMissing.size,
      god.none ? 'o deus não desenhou nada' : `o «sprite» de ${god.spr.w.toFixed(0)} × ${god.spr.h.toFixed(0)} px (o lote de ${N10} casas: ${want10} px de largura; o desenho de antes, de ${L0} casas, ${Art.spriteDims(L0, L0, 0)[0]}) — ${st.parts} partes, ${st.pairs} pares que se cobrem na tela, ${st.edges} «atrás de», ${st.rings} voltas quebradas; pintado em ${ms} ms (Node, gravado)${TESTE ? '; a forma: o gerador de teste desta prova' : '; a forma: a do jogo'}${A.formMissing.size ? ' — peças sem pintor: ' + [...A.formMissing].join(', ') : ''}`);
    const near = F.near(b); const mk = F.gridFor(god, near); const Rg = F.paintGod(god, mk()), Rn = F.paint3D(near, mk());
    const c = F.compare(F.measure(Rg), F.measure(Rn), [b.w, b.h]); const topLim = Math.max(LIM.top, LIM.topK * c.topA);
    const okM = !c.empty && c.iou >= LIM.iou && Math.abs(c.dTop) <= topLim && c.dProf <= LIM.prof && c.dFoot <= LIM.foot;
    ok('b: o deus e o 3D do mesmo prédio grande, a mesma massa', okM, c.empty ? 'vazio: ' + c.empty : `silhueta ${c.iou.toFixed(3)} (≥ ${LIM.iou}), alto ${c.topA.toFixed(1)} → ${c.topB.toFixed(1)} m, largura ${c.dProf.toFixed(3)}, pé ${c.dFoot.toFixed(1)} px, aberturas ${c.openA} → ${c.openB}, a cor por dentro ${(F.inside(Rg, Rn) * 100).toFixed(0)} %`);
    const Fm = Fo.of('maravilha', 'romano', N10); const fc = F.formCheck(b, Fm, god, near, LIM);
    ok('b: o deus e o 3D contra a forma de 10 casas', fc.ok, fc.ok ? `deus × forma: silhueta ${fc.god.iou.toFixed(3)}; 3D × forma: ${fc.d3.iou.toFixed(3)}; a planta vista de cima ${fc.plan.iou.toFixed(3)}; o alto do 3D ${fc.plan.top.toFixed(2)} m, o da forma ${fc.plan.formTop.toFixed(2)} m` : fc.why.join('; '));
    json.b = { iou: c.iou, dTop: c.dTop, dProf: c.dProf, formGod: fc.god.iou, form3D: fc.d3.iou, plan: fc.plan.iou, parts: st.parts, ms };
    if (process.env.PNG) { fs.mkdirSync(process.env.PNG, { recursive: true }); F.png(path.join(process.env.PNG, 'degrau-maravilha-10.png'), [[Rg, Rn]], [[b.w, b.h]], 1); }
    // (a size its people has no form of: none — never the drawing of before at the wrong size; the classic size: the drawing of before)
    const none = Art.building('maravilha', 0, 'grego', null, false, N10); const s3 = Art.building('maravilha', 0, 'romano', null, false, L0), s0 = Art.building('maravilha', 0, 'romano', null, false);
    ok('b: sem forma do tamanho, nenhum desenho; no tamanho clássico, o de antes', none === null && s3 === s0 && s3 && Math.abs(s3.w - Art.spriteDims(L0, L0, 0)[0]) < 0.5, `maravilha/grego de ${N10} casas (sem forma desse tamanho): ${none === null ? 'nenhum «sprite» (o render.js desenha a massa)' : 'um desenho!'}; romano de ${L0}: ${s3 === s0 ? 'o mesmo «sprite» de antes' : 'outro'}`);
    const k1 = Art.building('maravilha', 0, 'romano', null, false, N10), k2 = Art.building('maravilha', 0, 'romano', null, false, N10);
    ok('b: o «sprite» grande feito uma vez e guardado', !!k1 && k1 === k2, k1 ? `${Math.ceil(k1.w * 3)} × ${Math.ceil(k1.h * 3)} px na tela a 3× (${(Math.ceil(k1.w * 3) * Math.ceil(k1.h * 3) * 4 / 1048576).toFixed(1)} MB, mais ⅓ das cópias menores)` : 'nenhum');
  } finally { F.drop(b); }
}

// ------------------------------ (c) the order of the drawing ------------------------------
// (round a lot, rings of places a little out of it — from a hand to a tile and a half —: in each of the four views, each place
// whose screen column falls on the lot is in front of the building — beyond a face the view shows: the people's key over the
// building's — or behind it: under it)
if (want('c')) {
  F.blank(); const R = G.Render, W = G.W; const res = [];
  for (const n of [N10, 3, 2, 1]) {
    const b = putBig(n === N10 ? 'maravilha' : n === 3 ? 'teatro' : n === 2 ? 'temple' : 'house', 'romano', 5000 + n, n);
    try {
      const h = W.maxH(b.x, b.y, b.w, b.h); const [cx, cy] = G.Village.center(b); let bad = 0, old = 0, neu = 0, tot = 0, front = 0;
      for (let r = 0; r < 4; r++) R.asView(r, () => {
        // (the building's key as the render sorts it now; the rule of before — its front corner, a hand back —; the middle of its
        // lot, a hand back: D-114's)
        const bk = R.bkey(b); const a = R.proj(cx, cy, h)[0]; const oldKey = R.depth(cx, cy) + (b.w + b.h) / 2 - 0.8, newKey = R.depth(cx, cy) - 0.15;
        // (the faces the view shows: an outward normal toward greater depth)
        const fx = R.depth(cx + 1, cy) - R.depth(cx, cy), fy = R.depth(cx, cy + 1) - R.depth(cx, cy);
        const x0 = Math.min(...[[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => R.proj(x, y, h)[0])) - a, x1 = Math.max(...[[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => R.proj(x, y, h)[0])) - a;
        for (const d of [0.1, 0.3, 0.8, 1.5]) { const len = n + 2 * d, X0 = b.x - d, Y0 = b.y - d, X1 = b.x + b.w + d, Y1 = b.y + b.h + d;
          for (let s = 0; s < 16 * len; s++) { const f = s / 4, side = Math.min(3, Math.floor(f / len)), q = f - side * len; // (a place each quarter tile along the ring, its four sides in turn)
          const [px, py] = side === 0 ? [X0 + q, Y0] : side === 1 ? [X1, Y0 + q] : side === 2 ? [X1 - q, Y1] : [X0, Y1 - q];
          const sx = R.proj(px, py, h)[0] - a; if (sx <= x0 + 1 || sx >= x1 - 1) continue; // (beside the lot on the screen only: where the two can cover each other)
          const beyond = (px > b.x + b.w && fx > 0) || (px < b.x && fx < 0) || (py > b.y + b.h && fy > 0) || (py < b.y && fy < 0);
          const key = R.depth(px, py) + 0.05; tot++; if (beyond) front++;
          if (beyond ? key <= bk : key >= bk) bad++; if (beyond ? key <= oldKey : key >= oldKey) old++; if (beyond ? key <= newKey : key >= newKey) neu++;
        } }
      });
      res.push({ n, tot, front, bad, old, neu });
    } finally { F.drop(b); }
  }
  json.c = res;
  // (from R.bigW tiles up, by the middle of their lot: none on the wrong side; under it the rule of before is kept — counted, not
  // held; and both rules counted at every size)
  const big = res.filter(r => r.n >= R.bigW), small = res.filter(r => r.n < R.bigW);
  ok('c: a ordem do desenho ao lado e atrás do prédio grande', big.every(r => r.bad === 0), big.map(r => `${r.n} casa${r.n > 1 ? 's' : ''}: ${r.tot} lugares em volta nas quatro vistas (${r.front} na frente das faces que o deus vê), ${r.bad} do lado errado (a regra de antes: ${r.old})`).join('; ') +
    (small.length ? ' — abaixo de ' + R.bigW + ' casas, a regra de antes, mantida: ' + small.map(r => `${r.n} casa${r.n > 1 ? 's' : ''}, ${r.bad} de ${r.tot} (pelo meio do lote: ${r.neu})`).join('; ') : ''));
}

// ------------------------------ (d) the order in a lived world ------------------------------
// (round each building the god draws as a box — built, or a site —, a tile and a half out: what the render sorts itself, where
// its screen column falls on the lot — beyond a face the view shows, after the building; beyond a hidden one, before; another
// building that draws a box (a pen, a stable or a fair on a slope: its plinth), box against box: apart along one axis of the
// ground, the one beyond the other's shown face after it; apart along both with the two disagreeing, or with no column of the
// screen in common, neither covers the other. The square and the fold keep their own rule, for whoever stands on them, and what
// the hooks add has its own depth: both counted, by name, not held)
if (want('d')) {
  const R = G.Render, W = G.W;
  const OPEN = { praca: 1, ruin: 1, cemetery: 1, cercado: 1, campfire: 1 }, PEN = { curral: 1, estabulo: 1, feira: 1 }, OWN = { praca: 1, cercado: 1 };
  // (the key of the first round: the middle of the lot from 3 tiles up, the pen, the stable and the fair by the front corner)
  const keyOld = b => { const [cx, cy] = G.Village.center(b); return b.type === 'praca' ? R.depth(cx, cy) - (b.w + b.h) / 2 + 0.4 : b.w >= 3 && !OPEN[b.type] && !PEN[b.type] && !(G.BDEF[b.type] || {}).field ? R.depth(cx, cy) - 0.15 : R.depth(cx, cy) + (b.w + b.h) / 2 - 0.8; };
  const field = o => o.type === 'farm' || !!(G.BDEF[o.type] || {}).field;
  // (what a building's entry draws in the sorted pass: a box — its picture, its site —; an open ground built, nothing of its own
  // but the pen's plinth on a slope, the square's picture and the fold's stakes)
  const box = o => !field(o) && (!o.built || (!OPEN[o.type] && !PEN[o.type]));
  const drawn = o => !field(o) && (!o.built || OWN[o.type] || (PEN[o.type] ? W.maxH(o.x, o.y, o.w, o.h) - W.minH(o.x, o.y, o.w, o.h) > 0.15 : !OPEN[o.type]));
  const colOf = (o, h, a) => { const xs = [[o.x, o.y], [o.x + o.w, o.y], [o.x + o.w, o.y + o.h], [o.x, o.y + o.h]].map(([x, y]) => R.proj(x, y, h)[0] - a); return [Math.min(...xs), Math.max(...xs)]; };
  const res = [];
  for (const key of ['metropole', 'mega']) {
    M.pronto(key); const S = G.S;
    const things = [];
    for (const t of S.trees.values()) things.push({ k: 'árvore', x: t.x, y: t.y, off: 0 });
    for (const r of S.rocks.values()) things.push({ k: 'pedra', x: r.x, y: r.y, off: 0 });
    for (const b of S.bushes.values()) things.push({ k: 'arbusto', x: b.x, y: b.y, off: 0 });
    for (const v of S.villagers.values()) { if (v.inside || v.held || v.aboard || (v.age < 2 && v.carried)) continue; things.push({ k: 'pessoa', x: v.x, y: v.y, off: 0.05 + (v.dz || 0) }); }
    for (const a of S.animals.values()) { const sd = G.Animals.DEF[a.kind]; if (a.held || !sd || (sd.cls === 'air' && a.z > 4)) continue; things.push({ k: 'bicho', x: a.x, y: a.y, off: 0.04 }); }
    for (const c of S.carts) things.push({ k: 'carroça', x: c.x, y: c.y, off: 0.03 });
    for (const w of S.walls) for (let k = 0; k < w.built; k++) { const i = w.tiles[k], wv = S.wall[i]; if (wv === 1 || wv === 2 || wv === 4) things.push({ k: 'muro', x: i % G.N + 0.5, y: ((i / G.N) | 0) + 0.5, off: 0 }); }
    const hooked = []; for (const h of G.renderHooks.ents) h((d, e, x, y) => { hooked.push({ k: (e && e.fn && e.fn.name) || '?', x, y, off: d - x - y }); }, [-1e9, -1e9, 1e9, 1e9], 2);
    const boxes = [...S.buildings.values()].filter(b => b.w === b.h && box(b));
    const by = {}; const row = n => by[n] || (by[n] = { n, lots: 0, tot: 0, bad: 0, old: 0, kinds: {}, own: 0, ownBad: 0, ownOld: 0, hook: 0, hookBad: 0, hookOld: 0, hooks: {} });
    const say = (...a) => { if (process.env.VERB) console.log('  d:', key, ...a); };
    for (let r = 0; r < 4; r++) R.asView(r, () => {
      for (const b of boxes) {
        const T = row(b.w); if (r === 0) T.lots++;
        const [cx, cy] = G.Village.center(b), h = W.maxH(b.x, b.y, b.w, b.h), a = R.proj(cx, cy, h)[0];
        const fx = R.depth(cx + 1, cy) - R.depth(cx, cy), fy = R.depth(cx, cy + 1) - R.depth(cx, cy);
        const [x0, x1] = colOf(b, h, a); const bk = R.bkey(b), bo = keyOld(b);
        const near = t => !(t.x < b.x - 1.5 || t.x > b.x + b.w + 1.5 || t.y < b.y - 1.5 || t.y > b.y + b.h + 1.5);
        const side = t => { if (t.x >= b.x && t.x <= b.x + b.w && t.y >= b.y && t.y <= b.y + b.h) return 0; const sx = R.proj(t.x, t.y, h)[0] - a; if (sx <= x0 + 1 || sx >= x1 - 1) return 0;
          return (t.x > b.x + b.w && fx > 0) || (t.x < b.x && fx < 0) || (t.y > b.y + b.h && fy > 0) || (t.y < b.y && fy < 0) ? 1 : -1; };
        const wrong = (s, k, key) => s > 0 ? k <= key : k >= key;
        for (const t of things) { if (!near(t)) continue; const s = side(t); if (!s) continue; const k = R.depth(t.x, t.y) + t.off; T.tot++;
          if (wrong(s, k, bk)) { T.bad++; T.kinds[t.k] = (T.kinds[t.k] || 0) + 1; say('vista', r, b.type, b.id, t.k, t.x.toFixed(2), t.y.toFixed(2), 'lado', s, k.toFixed(2), bk.toFixed(2)); } if (wrong(s, k, bo)) T.old++; }
        for (const t of hooked) { if (!near(t)) continue; const s = side(t); if (!s) continue; const k = R.depth(t.x, t.y) + t.off; T.hook++;
          if (wrong(s, k, bk)) { T.hookBad++; T.hooks[t.k] = (T.hooks[t.k] || 0) + 1; } if (wrong(s, k, bo)) T.hookOld++; }
        for (const o of S.buildings.values()) {
          if (o === b || !drawn(o) || o.x >= b.x + b.w + 1.5 || o.x + o.w <= b.x - 1.5 || o.y >= b.y + b.h + 1.5 || o.y + o.h <= b.y - 1.5) continue;
          const sx = o.x >= b.x + b.w ? 1 : o.x + o.w <= b.x ? -1 : 0, sy = o.y >= b.y + b.h ? 1 : o.y + o.h <= b.y ? -1 : 0; if (!sx && !sy) continue;
          const ax = sx ? Math.sign(sx * fx) : 0, ay = sy ? Math.sign(sy * fy) : 0; if (ax && ay && ax !== ay) continue;
          const [o0, o1] = colOf(o, h, a); if (Math.min(x1, o1) - Math.max(x0, o0) <= 2) continue; // (no column in common)
          const s = ax || ay, bad = wrong(s, R.bkey(o), bk), was = wrong(s, keyOld(o), bo);
          if (OWN[o.type] && o.built) { T.own++; if (bad) T.ownBad++; if (was) T.ownOld++; continue; }
          T.tot++; if (bad) { T.bad++; const kk = 'prédio ' + o.type; T.kinds[kk] = (T.kinds[kk] || 0) + 1; say('vista', r, b.type, b.id, 'contra', o.type, o.id, 'lado', s, R.bkey(o).toFixed(2), bk.toFixed(2)); } if (was) T.old++;
        }
      }
    });
    res.push({ key, rows: Object.values(by).sort((p, q) => p.n - q.n) });
  }
  json.d = res;
  const big = res.flatMap(w => w.rows.filter(r => r.n >= R.bigW));
  const fmt = r => `${r.n} casa${r.n > 1 ? 's' : ''}: ${r.lots} prédios, ${r.tot} coisas em volta, ${r.bad} do lado errado${r.bad ? ' ' + JSON.stringify(r.kinds) : ''} (a chave de antes: ${r.old})` +
    (r.own ? `; contra a praça e o cercado, ${r.ownBad} de ${r.own} (antes: ${r.ownOld})` : '') + (r.hook ? `; dos ganchos, ${r.hookBad} de ${r.hook}${r.hookBad ? ' ' + JSON.stringify(r.hooks) : ''} (antes: ${r.hookOld})` : '');
  ok('d: a ordem no mundo vivo, em volta dos prédios de 2 casas ou mais', big.length > 0 && big.every(r => r.bad === 0), res.map(w => `${w.key} — ` + w.rows.map(fmt).join('; ')).join(' | '));
}

// ------------------------------ (e) the drawing does not change the world ------------------------------
if (want('e')) {
  F.blank(); const b = putBig('maravilha', 'romano', 6060, N10); const S = G.S;
  try {
    const before = JSON.stringify(b) + JSON.stringify(S.rng || null) + S.buildings.size; G.Art.clear();
    F.god(b); G.Render.asView(1, () => G.Render.bkey(b)); G.Arch.formSprite('maravilha', 'romano', N10, true);
    const after = JSON.stringify(b) + JSON.stringify(S.rng || null) + S.buildings.size;
    ok('e: o desenho não muda o mundo', before === after, before === after ? 'o prédio, o acaso do mundo e a lista dos prédios iguais depois de pintar e de pedir a chave do desenho' : 'mudou');
  } finally { F.drop(b); }
}

if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(json));
const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(`(${((clock() - t0) / 1000).toFixed(1)} s)`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
