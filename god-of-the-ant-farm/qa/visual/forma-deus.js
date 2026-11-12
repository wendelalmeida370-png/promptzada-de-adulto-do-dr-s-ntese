// forma-deus: o deus desenha um prédio pela forma dele (Arquitetura Monumental, D-106) — em Node, sem navegador.
// (a) O pintor da forma (G.Arch.formSprite) contra o desenho à mão de hoje: cada tipo e povo com forma clássica pintado pelas
//     peças da forma e pelo desenho de antes, gravados enquanto pintam (visual/fidelidade-lib.js) e medidos na mesma grade —
//     a silhueta (o quanto as duas se cobrem), o alto, a largura por faixa, a linha do chão. «Quase iguais»: os limites da
//     fidelidade para duas figuras da mesma casca (LIM do fidelidade.js), e nenhuma peça que o pintor não saiba pintar.
// (b) O degrau novo pela forma: o Coliseu de 10 casas (a forma do M1; sem ela, um gerador de teste registrado só nesta prova)
//     — o deus o desenha pelo pintor, do tamanho dele (o «sprite» de 10 casas), toda peça com pintor (a arcada, a areia) e a
//     ordem sem volta quebrada, com a massa da forma e com a do 3D do mesmo prédio (a fidelidade: silhueta, alto, largura, a
//     planta vista de cima: o deus e o 3D cada um na sua linha); um tamanho sem forma não cai no desenho de antes; o desenho do
//     tamanho clássico é o de antes, igual; o «sprite» grande feito uma vez e guardado. E todo degrau com forma própria — as
//     maravilhas de 10 e 13 (o Coliseu, a pirâmide, o Templo Mayor, a Acrópole, o Salão de Valhala, o zigurate), os monumentos
//     de 4, os teatros de 6 a 10 de cada povo, os templos de 4 a 8, os palácios do M2 de 6 e 10 (estes pedidos nos povos grego,
//     romano, egípcio e nórdico — T-407) —: pelo pintor, toda
//     peça com pintor e a ordem sem volta quebrada (nos pátios também), contra a forma; o 3D deles contra a forma e contra o
//     deus (T-418).
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
// (f) A obra de um prédio grande (L-528): o andaime do degrau de 10 casas sobe ao alto da forma desse tamanho, com um poste a cada
//     duas casas e uma volta de vigas a cada 4 m; sem forma do tamanho, às paredes do tipo crescidas pela raiz do lote; no tamanho
//     clássico, a obra de antes; pintar a obra não muda o mundo.
// (g) A memória dos desenhos grandes (Art.BIG): os desenhos sem acaso dos degraus guardados até um teto, o desenhado há mais
//     tempo solto primeiro, nunca um desenhado neste quadro ou no anterior; solto, pintado de novo igual; os desenhos à mão nunca.
// (h) O que mais o deus vê de um lote grande (L-531): o ponteiro escolhe o degrau de 10 casas até o alto da forma (o fundo dele
//     também) e a casa desenhada diante da face dele, não o degrau; o nome dele, quando fica pronto, sobre o alto; um fogo no
//     canto do fundo ou no meio do lote acende o prédio; o mundo igual.
// (i) O pódio de pedra (L-532, D-120): o degrau de 10 casas num chão que cai 3 níveis — nas quatro vistas, as faces que a vista
//     vê, do chão mais alto do lote até o chão de cada canto da borda (nunca até o ponto mais baixo do lote fora da vista), a
//     da esquerda na pedra clara do povo e a da direita na escura, uma fiada a cada meio nível; o mundo igual.
// (j) O ninho de cegonha no telhado de um degrau (L-533): no alto do desenho sobre o meio do lote — no palácio de pátios, a ala
//     de trás, não o pátio —; o da casa como era. A planta aberta no Modo Deus na profundidade do próprio prédio nas quatro
//     vistas (L-534). Um fogo em qualquer casa de um lote grande acende o prédio. O mundo igual.
// (k) O lote reservado para a obra grande (D-121): na capital do mundo pronto «metropole», o quadro inteiro do deus desenhado em
//     Node — a linha no chão pelos pontos da borda do lote certo, do tamanho dele (na cor do povo, sobre uma escura); as estacas
//     dos cantos com a bandeirola e uma a cada duas casas, a corda de cada vão desenhada uma vez nas quatro vistas; de longe, só
//     a linha; o ponteiro sobre o lote, nada mais sob ele: «Reservado para o Coliseu» (o artigo de cada nome); sem a reserva,
//     nada; o save, o acaso e o relógio iguais depois dos quadros; o mesmo mundo com e sem quadros. O lote é o que a reserva do
//     jogo guarda (G.Village.reserva, do C), pedido pela guarda de prova (qa/guarda-lib.js) logo depois de abrir o mundo.
// (l) A escada em degraus (L-565, T-445): toda escada de uma forma — pelo pintor; no tamanho clássico, o desenho à mão das
//     pirâmides de degraus (o templo e o Templo Mayor dos astecas, a Acrópole, o zigurate) — com tantos espelhos quanto os
//     degraus que o 3D põe (Fo.flight), da altura e da largura deles; os degraus de caixa do desenho à mão dos palácios, à parte.
// (m) As cores da forma pelo nome inteiro (L-564): 'trim2' e 'acc2' são as cores da paleta, não 'trim' e 'acc'; o palácio
//     asteca de 6 com as duas faixas dos tetos planos, a vermelha e a verde-azulada.
//   node qa/visual/forma-deus.js [a,b,c,d,e,f,g,h,i,j,k,l,m]   (as partes; todas sem nada)    PNG=pasta  as folhas (deus à mão | pintor; deus | 3D)
//   MUNDO_K=mundo  o mundo pronto da (k) (sem ele: a metrópole; sem chão para o lote nela, o primeiro mundo pronto que guarde um)
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
const { coliseuTeste } = require('./forma-deus-lib.js'); const { guarda } = require('../guarda-lib.js');
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
    ok('b: o degrau de 10 casas desenhado pelo pintor, do tamanho dele', !god.none && god.spr && Math.abs(god.spr.w - want10) < 0.5 && !A.formMissing.size && st.rings === 0,
      god.none ? 'o deus não desenhou nada' : `o «sprite» de ${god.spr.w.toFixed(0)} × ${god.spr.h.toFixed(0)} px (o lote de ${N10} casas: ${want10} px de largura; o desenho de antes, de ${L0} casas, ${Art.spriteDims(L0, L0, 0)[0]}) — ${st.parts} partes, ${st.pairs} pares que se cobrem na tela, ${st.edges} «atrás de», ${st.rings} voltas quebradas; pintado em ${ms} ms (Node, gravado)${TESTE ? '; a forma: o gerador de teste desta prova' : '; a forma: a do jogo'}${A.formMissing.size ? ' — peças sem pintor: ' + [...A.formMissing].join(', ') : ''}`);
    const near = F.near(b); const mk = F.gridFor(god, near); const Rg = F.paintGod(god, mk()), Rn = F.paint3D(near, mk());
    const c = F.compare(F.measure(Rg), F.measure(Rn), [b.w, b.h]); const topLim = Math.max(LIM.top, LIM.topK * c.topA);
    const okM = !c.empty && c.iou >= LIM.iou && Math.abs(c.dTop) <= topLim && c.dProf <= LIM.prof && c.dFoot <= LIM.foot;
    ok('b: o deus e o 3D do mesmo prédio grande, a mesma massa', okM, c.empty ? 'vazio: ' + c.empty : `silhueta ${c.iou.toFixed(3)} (≥ ${LIM.iou}), alto ${c.topA.toFixed(1)} → ${c.topB.toFixed(1)} m, largura ${c.dProf.toFixed(3)}, pé ${c.dFoot.toFixed(1)} px, aberturas ${c.openA} → ${c.openB}, a cor por dentro ${(F.inside(Rg, Rn) * 100).toFixed(0)} %`);
    const Fm = Fo.of('maravilha', 'romano', N10); const fc = F.formCheck(b, Fm, god, near, LIM);
    // (each against the form on its own line: the god's picture is this proof's painter, the 3D is Build3D's)
    const gWhy = fc.why.filter(w => w.startsWith('deus')), dWhy = fc.why.filter(w => !w.startsWith('deus'));
    ok('b: o deus contra a forma de 10 casas', !gWhy.length, `deus × forma: silhueta ${fc.god.iou.toFixed(3)}, alto ${fc.god.topA.toFixed(1)} → ${fc.god.topB.toFixed(1)} m, largura ${fc.god.dProf.toFixed(3)}${gWhy.length ? ' — ' + gWhy.join('; ') : ''}`);
    ok('b: o 3D contra a forma de 10 casas', !dWhy.length, dWhy.length ? dWhy.join('; ') : `3D × forma: ${fc.d3.iou.toFixed(3)}; a planta vista de cima ${fc.plan.iou.toFixed(3)}; o alto do 3D ${fc.plan.top.toFixed(2)} m, o da forma ${fc.plan.formTop.toFixed(2)} m`);
    json.b = { iou: c.iou, dTop: c.dTop, dProf: c.dProf, formGod: fc.god.iou, form3D: fc.d3.iou, plan: fc.plan.iou, parts: st.parts, ms };
    if (process.env.PNG) { fs.mkdirSync(process.env.PNG, { recursive: true }); F.png(path.join(process.env.PNG, 'degrau-maravilha-10.png'), [[Rg, Rn]], [[b.w, b.h]], 1); }
    // (a size its people has no form of: none — never the drawing of before at the wrong size; the classic size: the drawing of
    // before. The example: the first of these with no form of that size, as (f) picks it — the Greek wonder of 10 has its own
    // since the Acropolis, T-402)
    const [nt, ns, nn] = [['teatro', 'grego', 7], ['temple', 'nordico', 5], ['palacio', 'asteca', 6]].find(([t, s2, n]) => !Fo.has(t, s2, n) && n !== G.BDEF[t].w) || ['teatro', 'grego', 7];
    const none = Art.building(nt, 0, ns, null, false, nn); const s3 = Art.building('maravilha', 0, 'romano', null, false, L0), s0 = Art.building('maravilha', 0, 'romano', null, false);
    ok('b: sem forma do tamanho, nenhum desenho; no tamanho clássico, o de antes', none === null && !Fo.has(nt, ns, nn) && s3 === s0 && s3 && Math.abs(s3.w - Art.spriteDims(L0, L0, 0)[0]) < 0.5, `${nt}/${ns} de ${nn} casas (${Fo.has(nt, ns, nn) ? 'COM forma desse tamanho: troque o exemplo' : 'sem forma desse tamanho'}): ${none === null ? 'nenhum «sprite» (o render.js desenha a massa)' : 'um desenho!'}; romano de ${L0}: ${s3 === s0 ? 'o mesmo «sprite» de antes' : 'outro'}`);
    const k1 = Art.building('maravilha', 0, 'romano', null, false, N10), k2 = Art.building('maravilha', 0, 'romano', null, false, N10);
    ok('b: o «sprite» grande feito uma vez e guardado', !!k1 && k1 === k2, k1 ? `${Math.ceil(k1.w * 3)} × ${Math.ceil(k1.h * 3)} px na tela a 3× (${(Math.ceil(k1.w * 3) * Math.ceil(k1.h * 3) * 4 / 1048576).toFixed(1)} MB, mais ⅓ das cópias menores)` : 'nenhum');
  } finally { F.drop(b); }
  // (every step with a form of its own — the wonders of 10 and 13 (the Colosseum, the pyramid, the Templo Mayor), the monuments
  // of 4, the theatres of 6 to 10, the temples of 4 to 8, the palaces of 6 and 10 —, in each people that raises it: painted
  // from its form — every piece known, the order unbroken, round the courtyards too —, against its form; the 3D of it against
  // its form and against the god's picture (T-407, T-418). M2's palaces in their four peoples are asked for by name)
  const steps = [], seen = new Set(), push = (ty, st2, n) => { if (seen.has(ty + '/' + st2 + '/' + n)) return; seen.add(ty + '/' + st2 + '/' + n); steps.push([ty, st2, n]); };
  for (const [ty, n] of [['palacio', 6], ['palacio_colossal', 10]]) for (const st2 of ['grego', 'romano', 'egipcio', 'nordico']) push(ty, st2, n);
  for (const ty of Fo.types()) for (const st2 of STY) { if (!Fo.has(ty, st2)) continue; const n0 = G.BDEF[ty] && G.BDEF[ty].w;
    for (const n of Fo.sizes(ty, st2)) { if (n === n0) continue; const Fm = Fo.of(ty, st2, n); if (Fm && Fm.style === st2) push(ty, st2, n); } }
  const pal = [];
  for (const [type, st2, n] of steps) {
    if (!Fo.has(type, st2, n)) { pal.push({ type, st: st2, n, none: true }); continue; }
    const pb = putBig(type, st2, 4300 + pal.length, n);
    try {
      A.formMissing.clear(); const g = F.god(pb); const s2 = A.formStats || {}; const nr = F.near(pb); const fc2 = F.formCheck(pb, Fo.of(type, st2, n), g, nr, LIM);
      const mk2 = F.gridFor(g, nr); const c2 = F.compare(F.measure(F.paintGod(g, mk2())), F.measure(F.paint3D(nr, mk2())), [pb.w, pb.h]);
      // (the pieces inside a mass — oculto, D-108: the pyramid's corridor, gallery and chamber —: none painted — the painting
      // with them the same as without them, every op)
      const Fm2 = Fo.of(type, st2, n), oc = Fm2.els.filter(e => e.oculto).length; let ocSame = true;
      if (oc) { const r1 = F.recorder(), r2 = F.recorder(), mm = () => ({ glow: [], win: [], fires: [] }); A.formPaint(r1.c, mm(), Fm2, st2, {}); A.formPaint(r2.c, mm(), Object.assign({}, Fm2, { els: Fm2.els.filter(e => !e.oculto) }), st2, {}); ocSame = JSON.stringify(r1.ops) === JSON.stringify(r2.ops); }
      pal.push({ type, st: st2, n, w: g.spr ? g.spr.w : 0, miss: [...A.formMissing], rings: s2.rings, parts: s2.parts, oc, ocHidden: s2.hidden || 0, ocSame, god: fc2.god.iou, d3f: fc2.d3.iou, d3: c2.iou, gWhy: fc2.why.filter(w => w.startsWith('deus')), dWhy: fc2.why.filter(w => !w.startsWith('deus')) });
    } finally { F.drop(pb); }
  }
  json.degraus = pal;
  const lab = p => `${p.type}/${p.st}/${p.n}`, live = pal.filter(p => !p.none);
  const gBad = pal.filter(p => p.none || Math.abs(p.w - ((2 * p.n) * 16 + 16)) >= 0.5 || p.miss.length || p.rings !== 0 || p.gWhy.length || (p.oc && !(p.ocHidden === p.oc && p.ocSame))), gLo = live.reduce((a, p) => (!a || p.god < a.god ? p : a), null);
  const ocs = live.filter(p => p.oc);
  ok('b: os degraus pelo pintor (todos os que têm forma, e os palácios nos quatro povos)', !gBad.length,
    `${live.length} degraus, ${live.reduce((s, p) => s + p.parts, 0)} partes, ${live.reduce((s, p) => s + p.rings, 0)} voltas quebradas, ${live.filter(p => p.miss.length).length} com peça sem pintor; deus × forma de ${gLo ? gLo.god.toFixed(3) : '-'} (${gLo ? lab(gLo) : '-'}) a ${live.length ? Math.max(...live.map(p => p.god)).toFixed(3) : '-'}` +
    `; as peças ocultas (D-108): ${ocs.length ? ocs.map(p => `${lab(p)} ${p.oc}, ${p.ocHidden === p.oc && p.ocSame ? 'nenhuma pintada' : `${p.ocHidden} postas de lado, a pintura ${p.ocSame ? 'igual' : 'OUTRA'}`}`).join('; ') : 'nenhum degrau tem'}` +
    (gBad.length ? ' — ' + gBad.map(p => (p.none ? `${lab(p)}: sem forma` : `${lab(p)}: ${p.rings} voltas${p.miss.length ? ', sem pintor ' + p.miss.join(',') : ''}${p.gWhy.length ? ', ' + p.gWhy.join('; ') : ''}`)).join('; ') : ''));
  const dBad = live.filter(p => p.dWhy.length || p.d3 < LIM.iou);
  ok('b: os degraus no 3D, contra a forma e contra o deus', !dBad.length, `${live.length - dBad.length} de ${live.length} passam` + (dBad.length ? ' — ' + dBad.map(p => `${lab(p)}: 3D × forma ${p.d3f.toFixed(3)}, deus × 3D ${p.d3.toFixed(3)}${p.dWhy.length ? ', ' + p.dWhy.join('; ') : ''}`).join('; ') : ''));
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
  // (what draws itself even under work — no site box: the campfire, the graveyard, the ruin, the fold's stakes as they rise —,
  // as render.js drawBuilding has it; a square under work is its site, a box — L-596, T-486)
  const SITELESS = { campfire: 1, cemetery: 1, ruin: 1, cercado: 1 }; const own = o => OWN[o.type] && (o.built || o.type === 'cercado');
  // (the key of the first round: the middle of the lot from 3 tiles up, the pen, the stable and the fair by the front corner)
  const keyOld = b => { const [cx, cy] = G.Village.center(b); return b.type === 'praca' ? R.depth(cx, cy) - (b.w + b.h) / 2 + 0.4 : b.w >= 3 && !OPEN[b.type] && !PEN[b.type] && !(G.BDEF[b.type] || {}).field ? R.depth(cx, cy) - 0.15 : R.depth(cx, cy) + (b.w + b.h) / 2 - 0.8; };
  const field = o => o.type === 'farm' || !!(G.BDEF[o.type] || {}).field;
  // (what a building's entry draws in the sorted pass: a box — its picture, its site —; an open ground built, nothing of its own
  // but the pen's plinth on a slope, the square's picture and the fold's stakes)
  const box = o => !field(o) && (!o.built ? !SITELESS[o.type] : !OPEN[o.type] && !PEN[o.type]);
  const drawn = o => !field(o) && (own(o) || (!o.built ? !SITELESS[o.type] : PEN[o.type] ? W.maxH(o.x, o.y, o.w, o.h) - W.minH(o.x, o.y, o.w, o.h) > 0.15 : !OPEN[o.type]));
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
          if (own(o)) { T.own++; if (bad) T.ownBad++; if (was) T.ownOld++; continue; }
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

// ------------------------------ (f) the site of a big building ------------------------------
// (a site as the god's view paints it — render.js drawSite, recorded —: the step of 10 tiles rises to the top of its form of
// that size, its name over it, with a post every two tiles or so along its edges and, once the beams are up, a ledger every
// 4 m; a step without a form of its size, to its type's walls grown by the root of its lot over the classic one's; at its
// classic size, every type's site as it was: its type's walls, the four corner posts, the beams on top)
if (want('f')) {
  F.blank(); const R = G.Render, S = G.S; const POST = '122,82,48';
  const site = (type, st, id, n, p) => { const b = putBig(type, st, id, n); b.built = false; b.progress = p; b.need = { wood: 0, stone: 0 }; return b; };
  // (what it paints, from its anchor: the posts — the upright strokes of their brown — and how tall; the rings of beams; where
  // its name goes: over its walls)
  const paint = b => { const rec = F.recorder(); const lab = R.siteOn(rec.c, b, 0, 0); const posts = [], rings = [];
    for (const o of rec.ops) if (!o.f && o.col.slice(0, 3).join() === POST) for (const [a, c] of o.segs) (Math.abs(a[0] - c[0]) < 1e-6 ? posts : rings).push(Math.abs(a[1] - c[1]));
    return { posts: posts.length, fh: posts.length ? Math.max(...posts) : 0, rings: rings.length / 4, wallH: -lab[1] - 12 }; };
  const near = (a, b) => Math.abs(a - b) < 0.01;
  // (1) the step of 10 tiles, by its form
  const Fm = Fo.of('maravilha', 'romano', N10), want10 = Fm.top * Fo.ZPX, np = Math.max(1, Math.round((N10 - 0.2) / 2)); const big = [];
  for (const p of [0.3, 0.5, 0.7]) { const b = site('maravilha', 'romano', 7100 + p * 10, N10, p); try { big.push(Object.assign({ p }, paint(b))); } finally { F.drop(b); } }
  const fhOf = (p, h) => h * G.clamp((p - 0.15) / 0.3, 0, 1);
  ok('f: a obra do degrau de 10 casas, da altura da forma desse tamanho', big.every(r => near(r.wallH, want10) && near(r.fh, fhOf(r.p, want10)) && r.posts === 4 * np && (r.p <= 0.45 || r.rings >= Math.floor(want10 / 12.16))),
    `a forma: ${Fm.top.toFixed(2)} m, ${want10.toFixed(1)} px (a do tipo, de 3 casas: ${R.siteH({ type: 'maravilha', w: 3, h: 3, style: 'romano' }).toFixed(0)} px) — ` + big.map(r => `${Math.round(r.p * 100)} %: andaime de ${r.fh.toFixed(1)} px, ${r.posts} postes, ${r.rings} voltas de vigas, o nome a ${r.wallH.toFixed(1)} + 12 px`).join('; '));
  // (2) a step without a form of its size: the type's walls grown by the root of its lot
  const cand = [['maravilha', 'grego', N10], ['teatro', 'grego', 7], ['temple', 'nordico', 5], ['palacio', 'asteca', 6]].find(([t, s, n]) => !Fo.has(t, s, n));
  if (cand) { const [t, s, n] = cand; const d = G.BDEF[t]; const h0 = R.siteH({ type: t, w: d.w, h: d.h, style: s }), wantN = h0 * Math.sqrt(n / d.w); const b = site(t, s, 7200, n, 0.6);
    try { const r = paint(b); ok('f: sem forma do tamanho, a altura do tipo escalada', near(r.wallH, wantN) && near(r.fh, wantN), `${t}/${s} de ${n} casas (sem forma desse tamanho): ${r.wallH.toFixed(1)} px = ${h0} × √(${n}/${d.w}); ${r.posts} postes`); } finally { F.drop(b); } }
  else ok('f: sem forma do tamanho, a altura do tipo escalada', false, 'nenhum tipo sem forma do tamanho entre os candidatos');
  // (3) at its classic size, every type's site as it was
  const odd = []; let n0 = 0;
  for (const t of Object.keys(G.BDEF)) { const d = G.BDEF[t]; if (t === 'farm' || d.field || t === 'campfire' || t === 'cemetery' || t === 'ruin' || t === 'cercado') continue;
    const b = site(t, 'classico', 7300 + n0, d.w, 0.6); n0++;
    try { const r = paint(b); if (!(r.posts === 4 && r.rings === 1 && near(r.fh, r.wallH) && near(r.wallH, R.siteH(b)))) odd.push(`${t}: ${r.posts} postes, ${r.rings} voltas, ${r.fh.toFixed(1)} px`); } finally { F.drop(b); } }
  ok('f: no tamanho clássico, a obra de antes', n0 > 0 && !odd.length, odd.length ? odd.slice(0, 6).join('; ') : `${n0} tipos: as paredes do tipo, os quatro postes dos cantos, as vigas em cima`);
  // (4) painting a site does not change the world
  const b = site('maravilha', 'romano', 7400, N10, 0.5);
  try { const s0 = JSON.stringify(b) + JSON.stringify(S.rng || null); paint(b); R.siteH(b); const s1 = JSON.stringify(b) + JSON.stringify(S.rng || null);
    ok('f: pintar a obra não muda o mundo', s0 === s1, s0 === s1 ? 'a obra e o acaso do mundo iguais' : 'mudou'); } finally { F.drop(b); }
}

// ------------------------------ (g) the memory of the big pictures ------------------------------
// (Art.BIG: the big pictures of no chance — the steps' from their forms — kept up to a cap, the one drawn longest ago let go
// first, none drawn this frame or the last; let go, painted again the same — what the painter paints, recorded, equal; the
// hand drawings never let go. Canvases of their own, with their sizes, as the browser's: the game's in Node have none)
if (want('g')) {
  const Art = G.Art, doc0 = global.document; const painted = new Map(); let last = null;
  global.document = new Proxy(doc0, { get(t, k) { if (k === 'createElement') return tag => { if (tag !== 'canvas') return doc0.createElement(tag); const R = F.recorder(); const cv = { width: 0, height: 0, getContext: () => R.c }; last = R; return cv; }; return t[k]; } });
  const mb0 = Art.BIG.mb, f0 = Art.frame, d0 = Art.BIG.dropped; const log = [];
  try {
    Art.clear(); Art.BIG.mb = 10; Art.frame = 0;
    // (a step's picture made — a frame each —, what its painter painted kept; whether one is in the cache, not touching it)
    const make = (ty, st, n) => { Art.frame++; const s = A.formSprite(ty, st, n, false); painted.set(A.formKey(ty, st, n, false), JSON.stringify(last.ops)); return s; };
    const MB = () => (Art.BIG.bytes / 1048576).toFixed(1), K = (ty, st, n) => A.formKey(ty, st, n, false), on = k => Art.has(k);
    const a = K('maravilha', 'romano', N10), b = K('palacio_colossal', 'romano', 10), c = K('palacio', 'romano', 6), d = K('palacio', 'grego', 6), e = K('maravilha', 'romano', 13);
    // (the Colosseum, the colossal palace, the palace, over a cap of 10 MB: the Colosseum, drawn longest ago, goes)
    const sA = make('maravilha', 'romano', N10); const pA = painted.get(a); make('palacio_colossal', 'romano', 10); make('palacio', 'romano', 6);
    const okA = !on(a) && on(b) && on(c); log.push(`o Coliseu, o colossal e o palácio: ${MB()} MB, o Coliseu ${on(a) ? 'guardado' : 'solto'}`);
    // (the colossal drawn again, the Greek palace made: under the cap, nothing goes)
    Art.frame++; A.formSprite('palacio_colossal', 'romano', 10, false); make('palacio', 'grego', 6);
    const okD = on(b) && on(c) && on(d); log.push(`o colossal desenhado de novo, o grego feito: ${MB()} MB, nenhum solto`);
    // (the Colosseum wanted again: painted again, the same; the Roman palace, now drawn longest ago, goes — not the colossal)
    const sA2 = make('maravilha', 'romano', N10); const same = painted.get(a) === pA && sA2 !== sA;
    const okC = !on(c) && on(a) && on(b) && on(d); log.push(`o Coliseu de novo: ${MB()} MB, o palácio romano ${on(c) ? 'guardado' : 'solto'}`);
    // (the Colosseum of 13: the colossal and the Greek palace go; the one of 10, drawn the frame before, never — over the cap a while)
    make('maravilha', 'romano', 13); const okE = on(e) && on(a) && !on(b) && !on(d); log.push(`o de 13: ${MB()} MB — acima do teto só com os dois desenhados agora`);
    // (a hand drawing, however big: never counted)
    const hand = Art.building('palacio_colossal', 0, 'classico', null, false); const okH = !!hand && !hand.big;
    ok('g: a memória dos desenhos grandes, com teto', okA && okD && okC && okE && same && okH, log.join('; ') + `; o Coliseu pintado de novo: ${same ? 'a mesma pintura' : 'OUTRA'}; o desenho à mão do palácio colossal (${hand ? hand.c.width + ' × ' + hand.c.height : '-'} px): ${okH ? 'fora do teto' : 'contado!'}; ${Art.BIG.dropped - d0} soltos`);
  } finally { global.document = doc0; Art.BIG.mb = mb0; Art.frame = f0; Art.clear(); }
}

// ------------------------------ (h) what else the god sees of a big lot ------------------------------
// (the 2D that read its type's size, not its lot's — L-531: the pointer picks the step of 10 tiles to the top of its form, and
// the house drawn over its face, not the step whose front corner is far ahead; its name, when it is raised, over its top, not on
// its walls; a fire on the far corner of its lot is a fire in it. Nothing of the world written)
if (want('h')) {
  F.blank(); const R = G.Render, S = G.S, W = G.W, cam = R.cam; const b = putBig('maravilha', 'romano', 6600, N10); const h = putBig('house', 'romano', 6601, 1, b.x + b.w, b.y + 4);
  const cam0 = { x: cam.x, y: cam.y, zoom: cam.zoom }; const out = [];
  try {
    const s0 = JSON.stringify([b, h]) + JSON.stringify(S.rng || null);
    const [cx, cy] = G.Village.center(b); const base = W.maxH(b.x, b.y, b.w, b.h); const a = R.proj(cx, cy, base); cam.x = a[0]; cam.y = a[1]; cam.zoom = 1.25;
    const scr = (x, y, z) => { const p = R.proj(x, y, base); return R.worldPxToScreen(p[0], p[1] - (z || 0)); };
    // (1) the pointer: on the top of its back, under its form's top and over its type's 20 px; on the house before its face
    const top = R.siteH(b); const pTop = scr(cx - b.w / 2 + 0.6, cy - b.h / 2 + 0.6, top - 6), pHouse = scr(h.x + 0.5, h.y + 0.5, 8);
    const g1 = G.Main.pick(pTop[0], pTop[1]), g2 = G.Main.pick(pHouse[0], pHouse[1]);
    out.push(`o alto do fundo (${(top - 6).toFixed(0)} px): ${g1 === b ? 'o Coliseu' : g1 ? g1.type : 'nada'}`, `a casa diante da face: ${g2 === h ? 'a casa' : g2 === b ? 'o Coliseu' : g2 ? g2.type : 'nada'}`);
    // (2) its name when it is raised: over its top (lifted by its form's height); a classic one's where it was
    G.FX.floaters.length = 0; G.FX.complete(cx, cy, b); const f1 = G.FX.floaters[G.FX.floaters.length - 1];
    const c3 = putBig('maravilha', 'romano', 6602, 3, 60, 60); G.FX.complete(61.5, 61.5, c3); const f3 = G.FX.floaters[G.FX.floaters.length - 1]; F.drop(c3); G.FX.floaters.length = 0;
    const okN = !!f1 && f1.z + f1.lift >= top && !!f3 && f3.lift === 0 && f3.z === 16; out.push(`o nome dele: ${f1 ? (f1.z + f1.lift).toFixed(0) : '-'} px sobre o chão (o alto: ${top.toFixed(0)}); o de 3 casas: ${f3 ? f3.z + f3.lift : '-'} px, como era`);
    // (3) a fire on the far corner of its lot, and in its middle; a house's first tile, as before
    const fi = (x, y) => W.idx(x, y); S.fire[fi(b.x + b.w - 1, b.y + b.h - 1)] = 0.5; const fc = R.fireOn(b); S.fire[fi(b.x + b.w - 1, b.y + b.h - 1)] = 0;
    S.fire[fi(b.x + 5, b.y + 5)] = 0.5; const fm = R.fireOn(b); S.fire[fi(b.x + 5, b.y + 5)] = 0; const f0 = R.fireOn(b);
    S.fire[fi(h.x, h.y)] = 0.5; const fhh = R.fireOn(h); S.fire[fi(h.x, h.y)] = 0;
    out.push(`fogo no canto do fundo: ${fc ? 'aceso' : 'apagado'}, no meio: ${fm ? 'aceso' : 'apagado'}, sem fogo: ${f0 ? 'aceso' : 'apagado'}; a casa: ${fhh ? 'acesa' : 'apagada'}`);
    const s1 = JSON.stringify([b, h]) + JSON.stringify(S.rng || null);
    ok('h: o que mais o deus vê de um lote grande', g1 === b && g2 === h && okN && fc && fm && !f0 && fhh && s0 === s1, out.join('; ') + (s0 === s1 ? '; o mundo igual' : '; o mundo MUDOU'));
  } finally { cam.x = cam0.x; cam.y = cam0.y; cam.zoom = cam0.zoom; F.drop(h); F.drop(b); }
}

// ------------------------------ (i) the podium of stone ------------------------------
// (L-532, D-120: the step of 10 tiles on ground falling 3 levels toward the back of its lot and 3 along one side: in each of the
// four views, the faces the view shows — from the lot's highest ground down to the ground at each corner of its edge, never
// to the lot's lowest point where it is out of sight —, the left one in its people's light stone and the right in its shade,
// a course every half a level; nothing of the world written)
if (want('i')) {
  F.blank(); const R = G.Render, S = G.S, W = G.W; const V = Math.round(Math.sqrt(S.H.length)); const x0 = 20, y0 = 20, n = N10;
  // (the ground: 4.3 at the front corner — x and y high —, falling a level every 3.3 tiles toward the back along x, flat along
  // y: a podium from 4.3 down to 1.3, its courses at the world's half levels — 1.5 to 4 —, not counted from its top)
  for (let vy = y0; vy <= y0 + n; vy++) for (let vx = x0; vx <= x0 + n; vx++) S.H[vy * V + vx] = 1.3 + 3 * (vx - x0) / n;
  const b = putBig('maravilha', 'romano', 6700, n, x0, y0); const PALb = A.PAL.romano.base.map(F.parseCol); const out = [];
  try {
    const s0 = JSON.stringify(b) + JSON.stringify(S.rng || null); let okAll = true;
    const same = (c, p) => Math.abs(c[0] - p[0]) < 1 && Math.abs(c[1] - p[1]) < 1 && Math.abs(c[2] - p[2]) < 1;
    for (let r = 0; r < 4; r++) R.asView(r, () => {
      const rec = F.recorder(); R.podium(rec.c, b); const fills = rec.ops.filter(o => o.f), lines = rec.ops.filter(o => !o.f);
      const faces = fills.filter(o => same(o.col, PALb[0]) || same(o.col, PALb[1])); const lit = faces.filter(o => same(o.col, PALb[0])).length, dark = faces.length - lit;
      // (each face's drop at its two ends, levels: from the polygon's top and bottom points at its ends, px ÷ HS)
      const drops = faces.map(o => { const P2 = o.polys[0]; const xs = P2.map(p => p[0]); const lo = Math.min(...xs), hi = Math.max(...xs);
        const at = x => { const ys = P2.filter(p => Math.abs(p[0] - x) < 0.6).map(p => p[1]); return ys.length ? (Math.max(...ys) - Math.min(...ys)) / R.HS : 0; }; return [at(lo), at(hi)].map(v => +v.toFixed(2)); });
      // (what the ground says: the faces this view shows, and their drop at each end — the corners of the lot's two near edges)
      const [cx, cy] = G.Village.center(b); const fx = R.depth(cx + 1, cy) - R.depth(cx, cy), fy = R.depth(cx, cy + 1) - R.depth(cx, cy);
      const xE = fx > 0 ? x0 + n : x0, yE = fy > 0 ? y0 + n : y0, top = W.maxH(x0, y0, n, n), g = (x, y) => top - S.H[y * V + x];
      const want = [[g(x0, yE), g(x0 + n, yE)], [g(xE, y0), g(xE, y0 + n)]].filter(d => Math.max(...d) > 0.02).map(d => d.map(v => +v.toFixed(2)).sort((p, q) => p - q));
      const got = drops.map(d => d.slice().sort((p, q) => p - q));
      // (the courses of each face: its long strokes — a joint is upright —, one at each of the world's half levels between the
      // ground and the top: 4, 3.5 … 1.5 — six —, where counted from the top they would be five)
      const courses = lines.filter(o => o.col[3] < 0.28 && o.segs.some(s => Math.abs(s[1][0] - s[0][0]) > 2)).map(o => o.segs.filter(s => Math.abs(s[1][0] - s[0][0]) > 2).length); // (the courses' strokes; the foot's line is darker)
      const lo0 = W.minH(x0, y0, n, n), wantC = Math.floor((top - 1e-6) / 0.5) - Math.floor(lo0 / 0.5 + 1e-6);
      const okR = faces.length === want.length && want.every(w => got.some(q => Math.abs(q[0] - w[0]) < 0.15 && Math.abs(q[1] - w[1]) < 0.15)) && (faces.length < 2 || (lit === 1 && dark === 1)) && courses.length === faces.length && courses.every(c => c === wantC);
      okAll = okAll && okR; out.push(`vista ${r}: ${faces.length} face${faces.length === 1 ? '' : 's'} (${lit} clara, ${dark} escura), as pontas ${JSON.stringify(got)} níveis (o chão: ${JSON.stringify(want)}), fiadas ${JSON.stringify(courses)} (as do mundo: ${wantC})`);
    });
    const s1 = JSON.stringify(b) + JSON.stringify(S.rng || null);
    ok('i: o pódio de pedra do degrau, até o chão de cada canto', okAll && s0 === s1, out.join('; ') + ` — o bloco marrom de antes descia ${(W.maxH(x0, y0, n, n) - W.minH(x0, y0, n, n)).toFixed(0)} níveis inteiros nas duas faces de cada vista; ${s0 === s1 ? 'o mundo igual' : 'o mundo MUDOU'}`);
  } finally { F.drop(b); }
}

// ------------------------------ (j) a stork's nest, the open plan, a fire ------------------------------
// (L-533: the nest on the roof of a step — the palace of courtyards of 6 tiles — at the top of the god's picture over the middle
// of its lot, its back wing, not the courtyard; a house's where it was. L-598: each nest after its building in the sorted pass,
// in the four views — on its roof, not under it: a house's roof hid the whole nest. L-534: the plan the god opens takes the
// building's own depth in the four views. And a fire on any tile of a big lot lights it. Nothing of the world written)
if (want('j')) {
  F.blank(); const R = G.Render, S = G.S, W = G.W; const out = []; let okN = false, okP = false, okF = false;
  const b = putBig('palacio', 'romano', 6800, 6, 20, 20), h = putBig('house', 'romano', 6801, 1, 30, 30);
  try {
    const s0 = JSON.stringify([b, h]) + JSON.stringify(S.rng || null);
    // (the nests, put by hand on the two roofs; their entities as the hooks give them, painted where the render puts them)
    S.nests = [{ id: 1, type: 'roof', host: b.id, kind: 'stork', st: 'eggs', x: 23, y: 23 }, { id: 2, type: 'roof', host: h.id, kind: 'stork', st: 'eggs', x: 30.5, y: 30.5 }];
    const ents = []; for (const hk of G.renderHooks.ents) hk((d, e, x, y, hh) => { if (e && e.n && e.fn) ents.push({ d, e, x, y, h: hh }); }, [-1e9, -1e9, 1e9, 1e9], 2);
    const nestAt = id => { const q = ents.find(o => o.e.n.id === id); if (!q) return null; const p = R.proj(q.x, q.y, q.h === undefined ? W.groundH(q.x, q.y) : q.h); const rec = F.recorder(); q.e.fn(rec.c, q.e, p[0], p[1], 0);
      const o = rec.ops.find(op => op.f); if (!o) return null; const ys = o.polys[0].map(v => v[1]), xs = o.polys[0].map(v => v[0]); return { up: p[1] - (Math.min(...ys) + Math.max(...ys)) / 2, dx: (Math.min(...xs) + Math.max(...xs)) / 2 - p[0], h: q.h }; };
    const nb = nestAt(1), nh = nestAt(2); const t0 = A.formTop0('palacio', 'romano', 6), base = W.maxH(b.x, b.y, b.w, b.h);
    okN = !!nb && Math.abs(nb.up - (t0 + 1)) < 0.6 && Math.abs(nb.dx) < 0.6 && nb.h === base && !!nh && Math.abs(nh.up - 20) < 0.6 && Math.abs(nh.dx + 4) < 0.6;
    out.push(`o ninho no palácio de 6: ${nb ? nb.up.toFixed(1) : '-'} px sobre a âncora, no meio (o alto do desenho ali, a ala de trás: ${t0.toFixed(1)}; o pátio, no chão), não na altura do telhado clássico; o da casa: ${nh ? nh.up.toFixed(1) : '-'} px, 4 px à esquerda, como era`);
    // (L-598: in each view, the nest's key in the sorted pass after its building's — painted on its roof, not under it)
    const late = []; for (let r = 0; r < 4; r++) R.asView(r, () => { for (const hk of G.renderHooks.ents) hk((d, e, x, y) => { if (e && e.n && e.n.type === 'roof') { const host = S.buildings.get(e.n.host); late.push({ r, id: e.n.id, k: R.depth(x, y) + (d - x - y), bk: R.bkey(host) }); } }, [-1e9, -1e9, 1e9, 1e9], 2); });
    const okO = late.length === 8 && late.every(q => q.k > q.bk); okN = okN && okO;
    out.push(`nas quatro vistas, ${late.filter(q => q.k > q.bk).length} de ${late.length} ninhos depois do prédio no desenho${okO ? '' : ' — antes: ' + late.filter(q => q.k <= q.bk).map(q => `vista ${q.r} #${q.id} ${q.k.toFixed(2)} ≤ ${q.bk.toFixed(2)}`).join(', ')}`);
    S.nests = [];
    // (the plan open on the palace: the hook's depth against the render's key, in the four views)
    const PV = G.PlanView, In = G.Interiors; G.UI.selected = b; PV.id = b.id; PV.lv = null; In.want(b); for (let k = 0; k < 400 && !In.ready(b); k++) In.pump(50);
    const keys = []; for (let r = 0; r < 4; r++) R.asView(r, () => { for (const hk of G.renderHooks.ents) hk((d, e, x, y) => { if (e && e.fn && /drawPlan/.test(e.fn.toString())) keys.push({ r, k: R.depth(x, y) + (d - x - y), bk: R.bkey(b) }); }, [-1e9, -1e9, 1e9, 1e9], 2); });
    PV.id = 0; G.UI.selected = null;
    okP = keys.length === 4 && keys.every(q => Math.abs(q.k - q.bk) < 1e-9); out.push(`a planta aberta: ${keys.length} vistas, ${keys.filter(q => Math.abs(q.k - q.bk) < 1e-9).length} na profundidade do prédio`);
    // (a fire on a tile in from the edges and away from the middle: the step lights)
    const i = W.idx(b.x + 1, b.y + 4); S.fire[i] = 0.5; okF = R.fireOn(b); S.fire[i] = 0; okF = okF && !R.fireOn(b); out.push(`o fogo numa casa qualquer do lote: ${okF ? 'aceso' : 'apagado'}`);
    const s1 = JSON.stringify([b, h]) + JSON.stringify(S.rng || null);
    ok('j: o ninho no degrau, a planta aberta, o fogo', okN && okP && okF && s0 === s1, out.join('; ') + (s0 === s1 ? '; o mundo igual' : '; o mundo MUDOU'));
  } finally { S.nests = []; F.drop(h); F.drop(b); }
}

// ------------------------------ (k) the lot kept for a great work ------------------------------
// (D-121: the capital keeps the lot of the biggest step of its great work, and the god sees it — a light line of its people's
// colour on the ground round the lot, a stake at each corner with a pennant of that colour and one every two tiles between,
// the rope from stake to stake; from afar the line alone; the pointer over it, nothing else under it: «Reservado para o
// Coliseu». Asked of the world: G.Village.reserva(set), C's — pure, { type, esc, x, y, n } or null. The lot the game keeps,
// had by the proof's guard (qa/guarda-lib.js: the capital at the guard's level, a ground laid flat where the land will not
// do; T-443) just after the world is opened — it changes the world, so everything measured comes after it — in each run of
// the world. The god's whole frame drawn in Node on a recorder: the line on the right lot, of
// the right size; the stakes, their ropes, the label; from afar the line alone; gone with the reserve; nothing of the world
// changed by drawing it (its chance, its clock, its save); the same world with and without frames)
if (want('k')) {
  // (the world: MUNDO_K; else the metrópole and, where none of its capitals has ground for the lot, the next ready world where
  // the guard gets one. In the metrópole of the generation 18, year 70, no capital had within its reach a ground for the lot
  // of 40 m — none free of buildings round it, of walls and highways, of the water and the world's edge —: «a guarda de prova
  // não fez cidade nenhuma guardar um lote em metropole»; the cidade's Hedeby keeps one by the world's own rule)
  const worlds = process.env.MUNDO_K ? [process.env.MUNDO_K] : ['metropole', 'cidade', 'mundial', 'mega', 'anos100', 'anos500', 'anos1000'];
  let world = null; const tried = [];
  // (the terrain's outlines are the browser's Path2D: in Node, nothing — the ground's pictures are not what is looked at here)
  if (!global.Path2D) global.Path2D = class { moveTo() { } lineTo() { } closePath() { } rect() { } arc() { } ellipse() { } quadraticCurveTo() { } bezierCurveTo() { } addPath() { } };
  const V = G.Village, R = G.Render, W = G.W, cam = R.cam, real = V.reserva; let gone = false; const out = [];
  // (the reserve the world gives, C's, as it is; none while «gone» — the frames only: no step of the world runs then)
  V.reserva = s => (gone ? null : real(s));
  // (and every lot a town keeps, the same way: the god asks V.reservas — the wonder's lot first, then the civic field, D-230)
  const realAll = V.reservas; V.reservas = s => (gone ? [] : realAll ? realAll(s).filter(r => r.type !== 'civico') : [real(s)].filter(Boolean));
  // (the god's frame on a recorder: what it paints, and the texts it writes — their own coordinates)
  let rec = F.recorder(); const texts = [];
  const pc = new Proxy({}, { get(t, k) { if (k === 'fillText') return (s, x, y) => texts.push({ s: String(s), x, y }); const c = rec.c; if (k in c) { const v = c[k]; return typeof v === 'function' ? v.bind(c) : v; } return () => { }; }, set(t, k, v) { rec.c[k] = v; return true; } });
  const frame = () => { rec = F.recorder(); texts.length = 0; R.update(1 / 60, 0); R.frame(1 / 60); return rec.ops; };
  const fp = () => { const s = G.Save.serialize(); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + '/' + s.length; };
  const clockOf = S => JSON.stringify([S.clock, S.day, S.time, S.rng]);
  const same = (c, p) => Math.abs(c[0] - p[0]) < 1 && Math.abs(c[1] - p[1]) < 1 && Math.abs(c[2] - p[2]) < 1;
  try {
    // (the lot the game keeps, by the proof's guard — in the ready world of now no town keeps one —: a world it changes)
    let S = null, g = null, cap = null, r = null;
    for (const w of worlds) {
      S = M.pronto(w); R.init({ getContext: () => pc, width: 0, height: 0, style: {} });
      g = guarda(G); cap = g && S.settlements.get(g.set); r = cap && V.reserva(cap); if (r) { world = w; break; } tried.push(w);
    }
    if (!r) ok('k: a reserva do lote no deus', false, `a guarda de prova não fez cidade nenhuma guardar um lote em ${tried.join(', ')}`);
    else {
      const n = r.n, col = F.parseCol(G.Fac.hex(cap.fac)), cx = r.x + n / 2, cy = r.y + n / 2;
      const look = z => { const c = R.proj(cx, cy, W.groundH(cx, cy)); cam.follow = 0; cam.target = null; cam.x = c[0]; cam.y = c[1]; cam.zoom = cam.tz = z; };
      // (the lot's edge, a point a tile, from its corner (x, y) round — and the line the frame drew on it: a stroke through
      // every one of those points, on the ground, back in the god's pixels)
      const edge = []; for (let k = 0; k < n; k++) edge.push([r.x + k, r.y]); for (let k = 0; k < n; k++) edge.push([r.x + n, r.y + k]); for (let k = 0; k < n; k++) edge.push([r.x + n - k, r.y + n]); for (let k = 0; k < n; k++) edge.push([r.x, r.y + n - k]);
      const lines = ops => ops.filter(o => !o.f && o.segs.length === 4 * n && o.segs.every((s, k) => { const p = R.screenToWorldPx(s[0][0], s[0][1]), q = R.proj(edge[k][0], edge[k][1], W.hAt(edge[k][0], edge[k][1])); return Math.abs(p[0] - q[0]) < 0.05 && Math.abs(p[1] - q[1]) < 0.05; }));
      const stakes = () => { const e = []; for (const hk of G.renderHooks.ents) hk((d, o, x, y) => { if (o && o.fn && o.fn.name === 'drawStake') e.push({ o, x, y }); }, [-1e9, -1e9, 1e9, 1e9], cam.zoom); return e; };
      const labels = () => texts.filter(t => /^Reservado para /.test(t.s));
      gone = true; look(1.25); frame(); // (a frame without it first: whatever the frame itself does the first time, done)
      const s0 = fp(), k0 = clockOf(S);
      // (1) near, the pointer on its middle: the line, the stakes and their ropes in the four views, the label
      gone = false; R.pointer = [cx, cy]; R.hover = null; const L1 = lines(frame()), q = R.reserves().find(o => o.s === cap), lab = labels();
      const okQ = !!q && q.r.x === r.x && q.r.y === r.y && q.r.n === n;
      const CORD = [66, 44, 26], cord = L => L.find(o => same(o.col, CORD)); const okL = L1.length === 2 && !!cord(L1) && L1.some(o => same(o.col, [250, 242, 220]));
      // (the stakes of this lot — the frame draws every capital's: in the metropole of the generation 16 two keep a lot by the
      // world's own rule, Mênfis for the Grande Pirâmide and Tenochtitlan for the Templo Mayor, and the case counted the twenty
      // of Tenochtitlan's with Mênfis's: «40 estacas, FORA DA BORDA»)
      const st = stakes().filter(s => s.o.q && s.o.q.s === cap), wantN = edge.filter((p, k) => k % n === 0 || k % 2 === 0).length;
      const onEdge = st.every(s => ((s.x === r.x || s.x === r.x + n) && s.y >= r.y && s.y <= r.y + n) || ((s.y === r.y || s.y === r.y + n) && s.x >= r.x && s.x <= r.x + n));
      const views = []; let okV = true;
      for (let v = 0; v < 4; v++) R.asView(v, () => { let ropes = 0, flags = 0;
        for (const s of st) { const p = R.proj(s.x, s.y, W.groundH(s.x, s.y)); const rc = F.recorder(); s.o.fn(rc.c, s.o, p[0], p[1], 0);
          for (const o of rc.ops) { if (!o.f && same(o.col, [176, 146, 100])) ropes += o.segs.length / 10; if (o.f && same(o.col, col)) flags++; } }
        okV = okV && ropes === st.length && flags === 4; views.push(`${ropes} cordas, ${flags} bandeirolas`); });
      const okLab = lab.length === 1 && lab[0].s === R.reserveName(q) && (() => { const p = R.proj(cx, cy, W.groundH(cx, cy)), is = G.clamp(1.5 / cam.zoom, 0.7, 1.4); return Math.abs(lab[0].x - p[0]) < 0.01 && Math.abs(lab[0].y - (p[1] - 10 * is)) < 0.01; })();
      out.push(`${world}${tried.length ? ` (sem chão para o lote em ${tried.join(', ')})` : ''} — ${cap.name}: o lote (${r.x}, ${r.y}) de ${n} × ${n} casas que a reserva do jogo guarda${g.provocado ? ' (o chão aplainado pela guarda)' : ''} — ${L1.length} traços pelos ${4 * n} pontos da borda (${okL ? `a linha escura na borda clara, ${cord(L1).w.toFixed(1)} px na tela` : 'NÃO os dois'}); ${st.length} estacas (esperadas ${wantN}), ${onEdge ? 'todas na borda' : 'FORA DA BORDA'}; nas quatro vistas: ${views.join(' / ')}; o rótulo: «${lab.length ? lab[0].s : '-'}»${lab.length > 1 ? ` (${lab.length} vezes)` : ''}`);
      // (2) the label only with nothing else under the pointer, and only on the lot
      R.hover = [...S.buildings.values()].find(b => b.set === cap.id) || null; frame(); const labH = labels().length; R.hover = null;
      R.pointer = [r.x - 2, r.y - 2]; frame(); const labO = labels().length; R.pointer = [cx, cy];
      out.push(`com um prédio sob o ponteiro: ${labH ? 'o rótulo' : 'sem rótulo'}; fora do lote: ${labO ? 'o rótulo' : 'sem rótulo'}`);
      // (3) the article by the name, for every people's name of the two works a capital may keep a lot for
      const ART = { Maravilha: 'a', 'Acrópole': 'a', Coliseu: 'o', 'Grande Pirâmide': 'a', 'Templo Mayor': 'o', 'Salão de Valhala': 'o', 'Palácio Colossal': 'o' }; const wrong = [];
      for (const t of ['maravilha', 'palacio_colossal']) for (const c of STY) { const nm = G.Civ.bname(t, c), s = R.keptFor(t, c); if (!ART[nm] || s !== `Reservado para ${ART[nm]} ${nm}`) wrong.push(`${t}/${c}: «${s}»`); }
      out.push(wrong.length ? 'o artigo errado: ' + wrong.join(', ') : `o artigo de cada nome (${[...new Set(STY.map(c => R.keptFor('maravilha', c)))].map(s => s.slice(15)).join(', ')}; ${R.keptFor('palacio_colossal', 'romano').slice(15)})`);
      // (4) from afar: the line alone, thicker; (5) gone with the reserve: no line, no stake, no label
      look(0.4); const L2 = lines(frame()), st2 = stakes(); const rf = F.recorder(); R.reserveGroundOn(rf.c, q); const arm = Math.min(2, n >> 1);
      const marks = rf.ops.filter(o => !o.f && o.segs.length === 2 * arm && same(o.col, CORD)).length, dots = rf.ops.filter(o => o.f && same(o.col, col)).length; look(1.25);
      const okFar = L2.length === 2 && !!cord(L2) && Math.abs(cord(L2).w - 1.7) < 0.05 && Math.abs(cord(L1).w - 1.1) < 0.05 && marks === 4 && dots === 4;
      gone = true; const L3 = lines(frame()), st3 = stakes(), lab3 = labels(), res3 = R.reserves().length;
      out.push(`de longe: ${L2.length} traços (a linha a ${cord(L2) ? cord(L2).w.toFixed(1) : '-'} px na tela), ${marks} cantos marcados, ${dots} pontos da cor do povo, ${st2.length} estacas; sem a reserva: ${L3.length} traços, ${st3.length} estacas, ${lab3.length} rótulos, ${res3} reservas no quadro`);
      // (6) nothing of the world changed by those frames: its save, its chance, its clock
      const s1 = fp(), k1 = clockOf(S); out.push(s0 === s1 && k0 === k1 ? 'o save, o acaso e o relógio iguais' : `MUDOU: ${s0 === s1 ? '' : 'o save '}${k0 === k1 ? '' : 'o acaso ou o relógio'}`);
      ok('k: a reserva do lote no deus', okQ && okL && st.length === wantN && onEdge && okV && okLab && !labH && !labO && !wrong.length && okFar && !st2.length && !L3.length && !st3.length && !lab3.length && !res3 && s0 === s1 && k0 === k1, out.join('; '));
      // (7) the same world with and without frames: 30 s of the world, and with the god's frame — the reserve, its label —
      // every two seconds
      gone = false; R.pointer = null; const STEPS = 20, FR = 15;
      // (each run the world opened and the guard asked again — the same world, the same lot —, then the same camera: the save
      // keeps where the god looks)
      S = M.pronto(world); guarda(G); look(1.25); for (let k = 0; k < STEPS * FR; k++) G.debug.step(0.1); const fa = fp(), ka = clockOf(S);
      S = M.pronto(world); guarda(G); look(1.25); R.pointer = [cx, cy]; let drawn = 0, said = 0;
      // (this lot's frames: the other capital's reserve is drawn in them too — «a reserva desenhada em 30 de 15 quadros»)
      for (let k = 0; k < FR; k++) { for (let j = 0; j < STEPS; j++) G.debug.step(0.1); frame(); drawn += R.reserves().filter(o => o.s.id === g.set).length; said += labels().length; }
      const fb = fp(), kb = clockOf(S);
      ok('k: com e sem quadros, o mesmo mundo', fa === fb && ka === kb && drawn === FR && said === FR, `${(STEPS * FR) / 10} s de ${world}: ${fa === fb && ka === kb ? 'o mesmo mundo' : 'MUNDOS DIFERENTES'} (${fa} / ${fb}); a reserva desenhada em ${drawn} de ${FR} quadros, o rótulo em ${said}`);
    }
  } finally { V.reserva = real; R.pointer = null; R.hover = null; }
}

// ------------------------------ (l) the flight in steps ------------------------------
// (T-445: the god painted the stair of a stepped pyramid as a ramp — a few faint lines on it —, and the 3D lays it in steps,
// as the form's flight (Fo.flight: no riser over 0.26 m). Now the god paints the same steps, each riser a shade darker than
// its treads. Every step of a form with a flight — by the painter; at the type's classic size, the hand drawing of the
// stepped pyramids (the Aztecs' temple and Templo Mayor, the Acropolis, the ziggurat) —: as many risers as the form's
// flight, of its height (a quad two of whose sides stand upright, as tall as a step and as wide as the flight); a flight hidden in the mass, or that
// climbs toward the view, none. The hand drawings of a few box treads up a palace's platform, counted apart)
if (want('l')) {
  F.blank(); const out = [], bad = [], boxes = []; let nF = 0, nR = 0, q = 0;
  const HAND = { 'maravilha/classico': 1, 'maravilha/grego': 1, 'maravilha/asteca': 1, 'temple/asteca': 1 }; // (the classic hand drawings of a whole flight)
  const risers = (ops, dz, wx) => ops.filter(o => o.f && o.polys.length === 1 && o.polys[0].length === 4 && (([a, b, c, d]) => Math.abs(a[0] - d[0]) < 1e-6 && Math.abs(b[0] - c[0]) < 1e-6 && Math.abs(a[1] - d[1] - dz) < 0.01 && Math.abs(b[1] - c[1] - dz) < 0.01 && Math.abs(Math.abs(b[0] - a[0]) - wx) < 0.05)(o.polys[0])).length;
  for (const ty of Fo.types()) for (const st of STY) {
    if (!Fo.has(ty, st)) continue; const n0 = G.BDEF[ty] && G.BDEF[ty].w;
    for (const n of Fo.sizes(ty, st)) {
      const Fm = Fo.of(ty, st, n); if (!Fm || Fm.style !== st) continue; const fl = Fm.els.filter(e => e.k === 'escada'); if (!fl.length) continue;
      if (n === n0 && !HAND[ty + '/' + st]) { boxes.push(`${ty}/${st}/${n}`); continue; }
      const b = putBig(ty, st, 9100 + (q++), n);
      try {
        const god = F.god(b); if (god.none) { bad.push(`${ty}/${st}/${n}: nenhum desenho`); continue; }
        // (the flights by the height of their steps — two of the same are counted together —: the form's steps where the risers
        // face the view, none where the flight is hidden or climbs toward it)
        const by = new Map(); for (const e of fl) { const k = Fo.flight(e).length, dz = (e.b[2] - e.a[2]) * 3.04 / k, wx = e.w * 4, key = dz.toFixed(4) + '/' + wx.toFixed(3), seen = !e.oculto && (e.a[0] - e.b[0]) + (e.a[1] - e.b[1]) > 1e-9;
          const g = by.get(key) || { dz, wx, want: 0 }; g.want += seen ? k : 0; by.set(key, g); } // (the flight's width in the god's px: w m ÷ 4 m a tile × 16 px)
        for (const g of by.values()) { const got = risers(god.ops, g.dz, g.wx); nF++; nR += got; if (got !== g.want) bad.push(`${ty}/${st}/${n}${n === n0 ? ' (à mão)' : ''}: ${got} espelhos de ${g.dz.toFixed(2)} × ${g.wx.toFixed(1)} px, a forma ${g.want}`); }
        if (process.env.VERB) out.push(`${ty}/${st}/${n}: ${[...by.values()].map(g => `${g.want} de ${g.dz.toFixed(2)} × ${g.wx.toFixed(1)} px`).join(', ')}`);
      } finally { F.drop(b); }
    }
  }
  ok('l: a escada em degraus, como o 3D', nF > 0 && !bad.length, `${nF} escadas, ${nR} espelhos pintados, cada uma com os degraus da forma${bad.length ? ' — não: ' + bad.join('; ') : ''}${boxes.length ? `; os degraus de caixa do desenho à mão, à parte: ${boxes.join(', ')}` : ''}${out.length ? ' — ' + out.join('; ') : ''}`);
}

// ------------------------------ (m) a form's colours by their whole names ------------------------------
// (L-564: the palette's 'trim2' and 'acc2' — the Aztecs' and the Egyptians' second painted band, every people's second accent
// — were read as «a list and a place in it», 'trim' and 'acc' being no lists: the first's colour. In every people, a name the
// palette has whole is its own colour, a list's name and a place its place; and the Aztec palace of 6 the god paints shows
// its flat roofs' two bands, the red and the teal over it, along each wing — not one red band twice as tall)
if (want('m')) {
  F.blank(); const wrong = []; let nW = 0, nL = 0;
  for (const st of STY) { const p = A.PAL[st];
    for (const k of Object.keys(p)) { const v = p[k];
      if (typeof v === 'string' && /\d$/.test(k)) { nW++; if (A.formCol(st, k).toLowerCase() !== v.toLowerCase()) wrong.push(`${st}/${k}: ${A.formCol(st, k)} (a paleta: ${v})`); }
      if (Array.isArray(v) && typeof v[0] === 'string') v.forEach((c, i) => { nL++; if (A.formCol(st, k + i).toLowerCase() !== c.toLowerCase()) wrong.push(`${st}/${k}${i}: ${A.formCol(st, k + i)} (a lista: ${c})`); }); } }
  const b = putBig('palacio', 'asteca', 9400, 6); let red = 0, teal = 0;
  try {
    const god = F.god(b), P = A.PAL.asteca, R0 = F.parseCol(P.trim), T0 = F.parseCol(P.trim2);
    const same = (c, w) => [1, 0.8].some(k => Math.abs(c[0] - w[0] * k) < 2 && Math.abs(c[1] - w[1] * k) < 2 && Math.abs(c[2] - w[2] * k) < 2);
    const long = o => { const xs = o.polys[0].map(q => q[0]), ys = o.polys[0].map(q => q[1]); return Math.max(...xs) - Math.min(...xs) > 20; }; // (a band along a wing, not a crest)
    for (const o of god.ops) if (o.f && long(o)) { if (same(o.col, R0)) red++; else if (same(o.col, T0)) teal++; }
  } finally { F.drop(b); }
  const Fm = Fo.of('palacio', 'asteca', 6), nb = Fm.els.filter(e => e.k === 'faixa' && e.cor === 'trim2').length;
  ok('m: as cores da forma pelo nome inteiro', !wrong.length && teal >= nb && nb > 0, `${nW} nomes inteiros com número (trim2, acc2) e ${nL} lugares de listas, nos seis povos${wrong.length ? ' — errados: ' + wrong.join(', ') : ': cada um a sua cor'}; o palácio asteca de 6: ${red} faces de faixa vermelhas e ${teal} verde-azuladas (a forma: ${nb} faixas 'trim2' sobre as vermelhas)`);
}

if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify(json));
const e = M.erros(); ok('sem erro do jogo', M.limpo(), M.limpo() ? 'nenhum erro de módulo nem aviso no console' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | '));
console.log(`(${((clock() - t0) / 1000).toFixed(1)} s)`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
