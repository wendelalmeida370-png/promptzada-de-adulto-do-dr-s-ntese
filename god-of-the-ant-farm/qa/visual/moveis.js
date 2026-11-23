// moveis: the furniture of the interiors modelled (the interiors 2.0, the front P2, D-710 to D-715) — in Node, through the 3D's own
// files (qa/visual/tres-node.js: Build3D.interior as the game makes it):
//   node qa/visual/moveis.js [mundo ...]        (default: the ready worlds «metropole» and «mundial»)
//   m1. no piece of a tavern drawn by the boxes: in every tavern of the worlds, each piece its people's model (Movel3D.pick)
//   m2. the contract's pieces (§4) in every people: a tavern of each of the six peoples with the new pieces put in it — each drawn by
//       its model, at both levels inside its rectangle and on its floor (the flue of the hearth up to the ceiling there)
//   m3. every model within its budget, its parts of the vocabulary, every people a model of every kind (Movel3D.check)
//   m4. the metal is the people's (D-440, D-714): where it has neither iron nor bronze, the hoops and straps of withies; given iron —
//       what it has had, the world's G.S.orig.had, and the art — of iron; the look's signature changed (the inside drawn again)
//   m5. the rich house's pieces: the keeper's house rich now, the rich ones (the round table of stone); its coins gone, the plain
//       ones; the keeper dead in the middle — the tavern with no keeper, drawn again, never an error
//   m6. a save and a load in the middle: the same drawing before and after
//   m7. what it costs: the instanced meshes of a tavern (one a model's part and pattern — the draw calls) and its triangles, within
//       the budget (D-715); every instance in a group, every group a geometry
//   m8. the shader knows the instance: Build3D.dress on a material, its vertex shader with the instance's branch — every piece of it
//       ending its line, nothing after an #endif (rules 236, 266, the c14 of qa/ceu.js)
//   m9. pure: the same plan, the same drawing; no draw on the world's chance nor on the eye's; the building and the world untouched
//   m10. the leaves of the doors by their people's model, inside their opening (interior3d's 7 measures every one of the world's)
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const L = T.load(); const G = L.G, M = L.M, THREE = L.THREE;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | moveis ${name} | ${info}`); if (!c) fails.push(name); };
const few = (a, n = 4) => (a.length ? ': ' + a.slice(0, n).join(' · ') + (a.length > n ? ` … (${a.length})` : '') : '');
const WORLDS = process.argv.length > 2 ? process.argv.slice(2) : ['metropole', 'mundial'];
const B3 = G.Build3D, MV = G.Movel3D, In = G.Interiors;
const CIVS = ['classico', 'romano', 'grego', 'egipcio', 'nordico', 'asteca'];
// (the tavern's own kinds: the contract's §4 and the ones of before it uses — today's plan's and the new one's)
const TAVERNA = ['banquinho', 'mesa-redonda', 'mesa-taverna', 'banco', 'cadeira', 'balcao', 'balcao-alvenaria', 'prateleira-bar', 'anforeira', 'barril', 'lareira',
  'forno-barro', 'fogao-comal', 'fogo-comprido', 'estrado-musico', 'cuba', 'pipas', 'lampadario', 'cama', 'cama-casal', 'arca', 'mesa', 'mesa-terreiro', 'talha', 'jarros', 'fogao', 'lar', 'esteira', 'esteira-casal'];
const SEC4 = [['banquinho', 0.40, 0.40, 0.45], ['mesa-redonda', 0.90, 0.90, 0.74], ['mesa-taverna', 1.60, 0.80, 0.74], ['banco', 1.40, 0.35, 0.45], ['cadeira', 0.50, 0.50, 0.45],
  ['balcao', 1.80, 0.60, 1.00], ['balcao-alvenaria', 2.40, 1.60, 1.00], ['prateleira-bar', 1.80, 0.40, 1.90], ['anforeira', 1.20, 0.50, 1.10], ['barril', 0.60, 0.60, 0.90],
  ['lareira', 1.40, 0.60, 1.20], ['forno-barro', 1.00, 1.00, 1.10], ['fogao-comal', 1.20, 0.70, 0.60], ['fogo-comprido', 3.00, 0.90, 0.30], ['estrado-musico', 1.60, 1.20, 0.25]];
const TL = G.Space.TILE;
// (the points of a piece as drawn, in the lot's metres: its instances' — both levels — or its boxes' in the storey's geometry)
function ptsOf(out, it) {
  const R = out.item[it.id]; if (!R) return null; const [X0, Y0, Z0] = out.at; const res = [];
  const add = P => { for (let k = 0; k < P.length; k += 3) res.push([P[k] - X0, P[k + 1] - Y0, P[k + 2] - Z0]); };
  if (R[3] !== undefined) { for (const q of out.inst) if (q.id === it.id) for (const lod of [0, 1]) add(B3.instPts(q, lod)); }
  else { const g = out.lv[R[0]]; add(g.p.slice(R[1] * 3, R[2] * 3)); }
  return res;
}
function fitOf(plan, out, it) {
  const l = plan.levels.find(q => q.lv === it.lv) || plan.levels[0]; const foot = l.y + (it.y || 0); const ceil = Math.min(l.y + l.h, plan.shell.eave) + 0.01;
  const roof = it.kind === 'lareira' || it.kind === 'fogao' || it.kind === 'forja-fogo'; let worst = 0, wy = 0; const P = ptsOf(out, it); if (!P || !P.length) return 'nada desenhado';
  for (const [x, y, z] of P) { worst = Math.max(worst, it.r[0] - x, x - it.r[2], it.r[1] - z, z - it.r[3]); if (y < foot - 0.01 || y > (roof ? ceil : foot + it.h + 0.5)) wy++; }
  return worst > 0.02 || wy ? `${worst > 0.02 ? (worst * 100).toFixed(1) + ' cm fora do retângulo' : ''}${wy ? ' ' + wy + ' pontos fora da altura' : ''}` : null;
}
const taverns = () => [...G.S.buildings.values()].filter(b => b.type === 'taverna' && b.built && In.plan(b) && In.plan(b).ok);
const sig = out => JSON.stringify(out.inst.map(q => [q.name, q.m.map(v => +v.toFixed(5)), q.parts])) + '|' + Object.keys(out.item).length;
const bad = { m1: [], m2: [], m4: [], m5: [], m6: [], m7: [], m9: [], m10: [] }; let nTav = 0, nPiece = 0, nNew = 0, nLeaf = 0; const cost = [];
let did4 = false, did5 = false, did6 = false;
for (const W of WORLDS) {
  M.pronto(W); const S = G.S; const ts = taverns(); if (!ts.length) { console.log(`(${W}: sem tavernas)`); continue; }
  // m1, m9, m10, m7
  for (const b of ts) {
    const plan = In.plan(b); const rng0 = JSON.stringify(S.rng), bj0 = JSON.stringify(b, (k, v) => (k === '_dock' ? undefined : v)); const draws = [0, 0]; const w0 = G.rngWatch; G.rngWatch = k => { draws[k ? 1 : 0]++; };
    const out = B3.interior(plan, b, { fine: true }), again = B3.interior(plan, b, { fine: true }); G.rngWatch = w0; nTav++;
    if (sig(out) !== sig(again)) bad.m9.push(`taverna#${b.id}: duas vezes, dois desenhos`);
    if (draws[0] || draws[1] || JSON.stringify(S.rng) !== rng0) bad.m9.push(`taverna#${b.id}: sorteou (${draws[0]} do mundo, ${draws[1]} do olhar)`);
    if (JSON.stringify(b, (k, v) => (k === '_dock' ? undefined : v)) !== bj0) bad.m9.push(`taverna#${b.id}: o prédio mudou`);
    for (const it of plan.items) { if (!TAVERNA.includes(it.kind) || (it.form && B3.byForm && B3.byForm(b))) continue; nPiece++; const R = out.item[it.id];
      if (!R || R[3] === undefined) bad.m1.push(`taverna#${b.id} (${MV.look(b).civ}) ${it.kind} ${it.w.toFixed(2)}×${it.d.toFixed(2)}: pelas caixas`); else { const f = fitOf(plan, out, it); if (f) bad.m1.push(`taverna#${b.id} ${it.kind}: ${f}`); } }
    for (const f of out.leaf) { const d = plan.doors.find(q => q.id === f.id); if (d.kind === 'grade') continue; nLeaf++; if (!B3.leafModel(d.w, d.h, { P: G.Arch.PAL[MV.look(b).civ], c: c => c }, MV.look(b), 0)) bad.m10.push(`taverna#${b.id} porta ${d.id}: sem o modelo do povo`); }
    // (what it costs: the groups the open inside makes — one instanced mesh each — and the triangles of its pieces)
    const gs = B3.instGroups(out, 0); let tris = 0; for (const q of out.inst) tris += q.tris;
    for (const g0 of gs) if (!MV.partGeo(g0.name, g0.pt, g0.pat)) bad.m7.push(`taverna#${b.id}: o grupo ${g0.name}/${g0.pt} sem geometria`);
    if (gs.reduce((s, g0) => s + g0.list.length, 0) !== out.inst.reduce((s, q) => s + q.parts.length, 0)) bad.m7.push(`taverna#${b.id}: instâncias fora dos grupos`);
    cost.push([gs.length, tris, B3.instGroups(out, 1).length]);
  }
  // m4: the metal (in the first world with a people that has neither iron nor bronze, or the first tavern's people)
  if (!did4) {
    const b = ts.find(t => !MV.look(t).metal) || ts[0]; const f = G.Fac.ofSet(b.set); const look0 = MV.look(b); const plan = In.plan(b);
    const metal = out => { const o = {}; for (const q of out.inst) for (const [pt, c, pat] of q.parts) if (pt === 'ferro') o[pat] = (o[pat] || 0) + 1; return o; };
    const o0 = B3.interior(plan, b, { fine: true }); const m0 = metal(o0);
    const had = S.orig.had[f.id] || (S.orig.had[f.id] = {}); const hadF = had.ferro, artF = f.tech.known.ferro;
    if (!look0.metal && Object.keys(m0).some(p => +p !== B3.PAT.wicker)) bad.m4.push(`taverna#${b.id}: o povo sem metal com ferragem que não é de vime (${JSON.stringify(m0)})`);
    had.ferro = S.day || 1; if (artF === undefined) f.tech.known.ferro = 0;
    const look1 = MV.look(b); const o1 = B3.interior(plan, b, { fine: true }); const m1 = metal(o1);
    if (look1.metal !== 'ferro') bad.m4.push(`taverna#${b.id}: com o ferro tido e a arte, o metal é ${look1.metal}`);
    if (look1.sig === look0.sig && look0.metal !== 'ferro') bad.m4.push(`taverna#${b.id}: o povo ganhou o ferro e a assinatura do desenho não mudou`);
    if (Object.keys(m1).length && Object.keys(m1).some(p => +p !== B3.PAT.iron)) bad.m4.push(`taverna#${b.id}: com o ferro, a ferragem ainda ${JSON.stringify(m1)}`);
    if (!Object.keys(m1).length) bad.m4.push(`taverna#${b.id}: nenhuma ferragem para provar o metal`);
    if (hadF === undefined) delete had.ferro; else had.ferro = hadF; if (artF === undefined) delete f.tech.known.ferro;
    console.log(`  (m4: taverna#${b.id}, ${look0.civ}, o metal ${look0.metal || 'nenhum'} → ferro: ${JSON.stringify(m0)} → ${JSON.stringify(m1)})`); did4 = true;
  }
  // m5: the rich house and the keeper who dies (a Roman or classical tavern: they have the rich pieces)
  if (!did5) {
    const b = ts.find(t => ['romano', 'classico', 'grego'].includes(MV.look(t).civ) && G.Taverna.keeperOf(t)); if (b) {
      const k = G.Taverna.keeperOf(b), h = S.buildings.get(k.home); const coin0 = h ? h.coin : 0;
      if (h) h.coin = 500; const rich = MV.look(b); if (h) h.coin = 0; const poor = MV.look(b); if (h) h.coin = coin0;
      if (h && (rich.rico !== 2 || poor.rico !== 0)) bad.m5.push(`taverna#${b.id}: a riqueza do taverneiro não chega à taverna (${rich.rico}, ${poor.rico})`);
      const pr = MV.pick('mesa-redonda', rich.civ, 0.9, 0.9, 0.74, 'rico'), pp = MV.pick('mesa-redonda', rich.civ, 0.9, 0.9, 0.74, '');
      if (!pr || !pp || pr.name === pp.name || !/~rico/.test(pr.name)) bad.m5.push(`a mesa redonda do ${rich.civ} rico é a mesma do pobre (${pr && pr.name}, ${pp && pp.name})`);
      if (MV.pick('mesa-redonda', 'nordico', 0.9, 0.9, 0.74, 'rico').name !== MV.pick('mesa-redonda', 'nordico', 0.9, 0.9, 0.74, '').name) bad.m5.push('o povo sem a peça rica não ganhou a dela');
      G.Village.kill(k); const after = MV.look(b); let o2 = null; try { o2 = B3.interior(In.plan(b), b, { fine: true }); } catch (e) { bad.m5.push(`taverna#${b.id}: o taverneiro morto, o desenho quebrou (${e.message})`); }
      if (o2 && !o2.inst.length) bad.m5.push(`taverna#${b.id}: o taverneiro morto, nenhum móvel`);
      console.log(`  (m5: taverna#${b.id}, ${rich.civ}: rico ${rich.rico}, pobre ${poor.rico}, sem taverneiro ${after.rico}; ${pr && pr.name})`); did5 = true;
    }
  }
  // m6: a save and a load in the middle
  if (!did6) {
    const ids = ts.map(t => t.id); const before = ids.map(id => sig(B3.interior(In.plan(S.buildings.get(id)), S.buildings.get(id), { fine: true })));
    M.salvarCarregar(); const after = ids.map(id => { const b = G.S.buildings.get(id); return b && In.plan(b) ? sig(B3.interior(In.plan(b), b, { fine: true })) : 'sem'; });
    ids.forEach((id, k) => { if (before[k] !== after[k]) bad.m6.push(`taverna#${id}: outro desenho depois do load`); }); did6 = true;
  }
}
// m2: the contract's pieces in a tavern of each people (the first tavern's plan, its items the new pieces, side by side in its hall)
{
  M.pronto(WORLDS[0]); const b0 = taverns()[0]; const plan = In.plan(b0); const l0 = plan.levels.find(q => q.kind !== 'porao') || plan.levels[0];
  const room = plan.rooms.filter(r => r.lv === l0.lv).sort((a, c) => (c.r[2] - c.r[0]) * (c.r[3] - c.r[1]) - (a.r[2] - a.r[0]) * (a.r[3] - a.r[1]))[0];
  const cx = (room.r[0] + room.r[2]) / 2, cz = (room.r[1] + room.r[3]) / 2;
  const items = SEC4.map(([kind, w, d, h], k) => ({ id: 'p2-' + k, k: 900 + k, kind, lv: l0.lv, x: cx, z: cz, w, d, h, ry: (k % 4) * Math.PI / 2, y: 0, r: (k % 2 ? [cx - d / 2, cz - w / 2, cx + d / 2, cz + w / 2] : [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2]) }));
  const p2 = Object.assign({}, plan, { items });
  for (const civ of CIVS) {
    const b2 = Object.assign({}, b0, { style: civ }); const out = B3.interior(p2, b2, { fine: true });
    for (const it of items) { nNew++; const R = out.item[it.id]; if (!R || R[3] === undefined) { bad.m2.push(`${civ} ${it.kind}: pelas caixas`); continue; } const f = fitOf(p2, out, it); if (f) bad.m2.push(`${civ} ${it.kind}: ${f}`); }
    // (the hearth's flue up to the ceiling there: the classical lands' hearth has it)
    if (civ !== 'nordico' && !out.inst.some(q => /^movel-chamine-/.test(q.name))) bad.m2.push(`${civ}: a lareira sem a chaminé até o teto`);
  }
}
// m3, m8
const chk = MV.check();
ok('m3. cada modelo no seu orçamento, das partes do vocabulário, dentro do retângulo; todo povo com um modelo de cada tipo (G.Movel3D.check)', !chk.length, `${MV.kinds().length} tipos${few(chk)}`);
{
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true }); B3.dress(mat); const sh = { uniforms: {}, vertexShader: '#include <common>\n#include <worldpos_vertex>\n#include <fog_vertex>\n', fragmentShader: '#include <common>\n#include <clipping_planes_fragment>\n#include <normal_fragment_maps>\n#include <opaque_fragment>\n' };
  let err = null; try { mat.onBeforeCompile(sh); } catch (e) { err = e.message; }
  const v = sh.vertexShader; const lines = v.split('\n'); const bad8 = [];
  if (err) bad8.push('o onBeforeCompile quebrou: ' + err);
  if (!/#ifdef USE_INSTANCING/.test(v) || !/instanceMatrix \* vec4\(transformed, 1\.0\)/.test(v)) bad8.push('sem o ramo da instância');
  lines.forEach((l, k) => { if (/^\s*#(endif|else)\b.*\S/.test(l.replace(/^\s*#(endif|else)/, '#$1').replace(/^#(endif|else)\s*$/, ''))) bad8.push(`linha ${k + 1}: algo depois de um #endif/#else`); if (/#(ifdef|endif|else)/.test(l) && /\/\//.test(l)) bad8.push(`linha ${k + 1}: comentário numa linha de #`); });
  if ((v.match(/#ifdef USE_INSTANCING/g) || []).length !== 1 || !/#else\n vPP = \(modelMatrix \* vec4/.test(v)) bad8.push('o ramo da instância fora da forma');
  ok('m8. o sombreador sabe da instância: a matriz dela antes da do objeto, cada linha inteira', !bad8.length, `${lines.length} linhas${few(bad8)}`);
}
const cMax = cost.reduce((a, c) => [Math.max(a[0], c[0]), Math.max(a[1], c[1]), Math.max(a[2], c[2])], [0, 0, 0]);
const cMean = cost.length ? cost.reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]).map(v => v / cost.length) : [0, 0];
ok('m1. nenhuma peça da taverna pelas caixas: cada uma pelo modelo do seu povo, no seu retângulo e no seu chão', nTav > 0 && nPiece > 30 && !bad.m1.length, `${nTav} tavernas, ${nPiece} peças${few(bad.m1)}`);
ok('m2. as peças do contrato (§4) em cada um dos seis povos: o modelo, no retângulo, no chão; a chaminé até o teto', nNew === SEC4.length * CIVS.length && !bad.m2.length, `${nNew} peças${few(bad.m2)}`);
ok('m4. o metal é o do povo: sem ferro nem bronze, o vime; com o ferro tido e a arte, o ferro, e o desenho de novo', did4 && !bad.m4.length, few(bad.m4) || 'o vime e o ferro');
ok('m5. a casa rica de agora tem as peças ricas, a pobre as simples; o taverneiro morto no meio, o desenho segue', did5 && !bad.m5.length, few(bad.m5) || 'a riqueza do taverneiro, a mesa de pedra, o taverneiro morto');
ok('m6. um save e um load no meio: o mesmo desenho', did6 && !bad.m6.length, few(bad.m6) || 'iguais');
ok('m7. o custo de uma taverna: as malhas por instância (uma por modelo e parte) e os triângulos dos móveis no orçamento (≤ 64 malhas, ≤ 30 mil triângulos: D-715, a planta da P3)', !bad.m7.length && cMax[0] <= 64 && cMax[1] <= 30000,
  `${cost.length} tavernas: malhas média ${cMean[0].toFixed(1)}, máx ${cMax[0]} (no nível do meio ${cMax[2]}); triângulos dos móveis média ${Math.round(cMean[1])}, máx ${cMax[1]}${few(bad.m7)}`);
ok('m9. puro: o mesmo desenho duas vezes, nenhum sorteio, o prédio como estava', !bad.m9.length, few(bad.m9) || `${nTav} tavernas`);
ok('m10. as folhas das portas pelo modelo do seu povo', nLeaf > 0 && !bad.m10.length, `${nLeaf} folhas${few(bad.m10)}`);
const E = M.erros(); ok('sem erros de módulo', !Object.keys(E.mod).length, JSON.stringify(E.mod).slice(0, 200));
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
