// mata3d: as camadas da mata no 3D, em Node (a geometria, sem placa de vídeo; D-470 a D-477).   [ONLY=v1,v3] node qa/visual/mata3d.js   (≈ 2 min)
// v1 cada camada em cada bioma, no pedaço mais denso dele: as plantas e os triângulos, nada sem número, tudo no chão (o pé a ±0,2 m do
//    chão do mundo), nada em estrada, prédio, muro ou água (G.Mata3D.check); as formas das plantas boas (G.PlantaFormas.check);
// v2 a mesma mata duas vezes (a mesma semente, o mesmo pedaço: os mesmos números, byte a byte) — e o mesmo mundo feito de novo;
// v3 o mundo igual: o save byte a byte antes e depois de desenhar a mata (os planos de todos os pedaços, as árvores de perto e de
//    longe, o teto da floresta, os cipós, a porta anchor) — e nenhum acaso tirado;
// v4 a montagem em fatias: nenhuma fatia do plano de um pedaço passa de um teto (relativo: 60 ms na máquina carregada; o pedaço
//    inteiro de selva, ≈ 100–300 ms, nunca num quadro só);
// v5 os caules desenhados são os caules duros do corpo (G.Space.stems): o mesmo lugar, um a um; a árvore grande da selva nas medidas
//    do G.Mata (o alto da copa desenhada bate com o G.Mata.tree); a porta anchor dentro da copa ou do tronco desenhados; os cipós
//    entre duas árvores que existem;
// v6 o mapa do dossel bate com as árvores: alto onde a copa de uma árvore crescida está, zero longe de toda copa;
// v7 o orçamento por qualidade no ponto mais denso da selva: as plantas e os triângulos da mata no anel de cada qualidade (todos, e
//    os da frente do olho, ≈ 90°), as chamadas (uma por espécie e camada);
// v8 os casos ruins: a árvore cortada (o plano do pedaço refeito, os caules em volta dela mudam e nenhum fica no tronco caído), o fogo
//    (nada numa casa queimando), o deus muda o chão (a terra erguida: as plantas no chão novo), o save e o load (a mesma mata);
// v9 as verificações do desenho das plantas que ninguém chamava: o R3.floraCheck em cada bioma (T-1511).
'use strict';
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load({ qa: false });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | mata3d ${name} | ${info}`); if (!c) fails.push(name); };
const SEED = 4242;
const novo = () => M.novo({ seed: SEED, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'suave' });
let S = novo(); let N = G.N; const TL = G.Space.TILE, HM = G.Space.HM; const M3 = G.Mata3D, Ma = G.Mata, PF = G.PlantaFormas, A3 = G.Arvore3D, R3 = G.Realm;
const ms = t0 => Number(process.hrtime.bigint() - t0) / 1e6;
const NC = () => Math.ceil(G.N / 16);
// (the chunk of a biome most of its own and thickest with growth)
function bestChunk(bio) {
  let best = null; for (let cy = 0; cy < NC(); cy++) for (let cx = 0; cx < NC(); cx++) { const r = Ma.region(cx, cy); let c = 0, s = 0; for (let k = 0; k < 256; k++) { const i = (r.y0 + (k >> 4)) * N + r.x0 + (k & 15); if (S.type[i] < 3 || S.biome[i] !== bio) continue; c++; s += r.dens[k]; }
    if (c > 90 && (!best || c * 1000 + s / 255 > best.v)) best = { cx, cy, v: c * 1000 + s / 255 }; }
  return best;
}
const planTris = p => { let t = 0; for (const L of p.kinds.values()) t += L.n * PF.shape(L.kid).tris; return t; };

if (on('v1')) {
  const lines = [], bad = [].concat(PF.check());
  for (let b = 0; b < 7; b++) { const c = bestChunk(b); if (!c) { lines.push(`${G.BIOMES[b].id}: sem pedaço`); continue; } const p = M3.plan(c.cx, c.cy); const ck = M3.check(p); bad.push(...ck.map(q => G.BIOMES[b].id + ': ' + q));
    const by = {}; for (const L of p.kinds.values()) by[L.layer] = (by[L.layer] || 0) + L.n; lines.push(`${G.BIOMES[b].id} ${c.cx},${c.cy}: ${p.n} plantas (rasteira ${by.r || 0}, arbustiva ${by.a || 0}, caules ${by.s || 0}), ${Math.round(planTris(p) / 1000)} mil tri`); }
  const sel = bestChunk(4), des = bestChunk(6); const ps = M3.plan(sel.cx, sel.cy), pd = M3.plan(des.cx, des.cy);
  ok('v1', !bad.length && ps.n > 1200 && pd.n < ps.n / 4, `${lines.join('; ')}; ${bad.length} erros${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}; as formas: ${PF.KINDS.length}, de ${Math.min(...PF.KINDS.map(k => PF.shape(k.id).tris))} a ${Math.max(...PF.KINDS.map(k => PF.shape(k.id).tris))} triângulos`);
}

if (on('v2')) {
  const c = bestChunk(4); const a = M3.plan(c.cx, c.cy), b = M3.plan(c.cx, c.cy);
  const eq = (p, q) => { if (p.kinds.size !== q.kinds.size) return false; for (const [k, L] of p.kinds) { const R = q.kinds.get(k); if (!R || R.n !== L.n) return false; for (let j = 0; j < L.data.length; j++) if (L.data[j] !== R.data[j]) return false; } return true; };
  S = novo(); const d = M3.plan(c.cx, c.cy);
  ok('v2', eq(a, b) && eq(a, d), `o pedaço ${c.cx},${c.cy} da selva: duas vezes ${eq(a, b) ? 'igual' : 'DIFERENTE'}; o mesmo mundo feito de novo: ${eq(a, d) ? 'igual' : 'DIFERENTE'} (${a.n} plantas)`);
}

if (on('v3')) {
  S = novo(); const rng0 = JSON.stringify(S.rng), sv0 = G.Save.serialize(); R3.setQuality('ultra'); let n = 0;
  for (let cy = 0; cy < NC(); cy++) for (let cx = 0; cx < NC(); cx++) { M3.plan(cx, cy); A3.geo(cx * 16, cy * 16, 16, 16, true); if ((cx + cy) % 3 === 0) { R3.floraOf(cx * 16, cy * 16, 16, 16); n++; } }
  for (const t of S.trees.values()) { A3.anchor(t, 'colmeia'); A3.anchor(t, 'ninho'); }
  const sv1 = G.Save.serialize(), rng1 = JSON.stringify(S.rng); R3.setQuality('media');
  ok('v3', sv0 === sv1 && rng0 === rng1, `a mata de ${NC() * NC()} pedaços, ${n} de perto (com cipós e cartões, na Ultra), o teto de longe e as âncoras de ${S.trees.size} árvores: o save ${sv0 === sv1 ? 'igual byte a byte' : 'MUDOU'} (${sv0.length} bytes), o acaso ${rng0 === rng1 ? 'igual' : 'MUDOU'}`);
}

if (on('v4')) {
  S = novo(); const c = bestChunk(4); const gen = M3._gen ? M3._gen(c.cx, c.cy) : null; let worst = 0, total = 0, slices = 0;
  if (gen) { let r; do { const t0 = process.hrtime.bigint(); r = gen.next(); const d = ms(t0); worst = Math.max(worst, d); total += d; slices++; } while (!r.done); }
  ok('v4', gen && slices > 6 && worst < 60, `o plano do pedaço ${c.cx},${c.cy} da selva em ${slices} fatias: ${total.toFixed(0)} ms ao todo, a maior ${worst.toFixed(1)} ms (o teto: 60 ms numa máquina carregada; o quadro pede ≈ 2,5–4 ms por quadro: o laço para no orçamento entre as fatias)`);
}

if (on('v5')) {
  S = novo(); const bad = []; let ns = 0, nt = 0, na = 0, nl = 0;
  for (const b of [4, 3, 0]) { const c = bestChunk(b); if (!c) continue; const p = M3.plan(c.cx, c.cy); const drawn = []; for (const L of p.kinds.values()) if (L.layer === 's') for (let k = 0; k < L.n; k++) drawn.push([L.data[k * 12], L.data[k * 12 + 2]]);
    const want = []; for (let y = c.cy * 16; y < c.cy * 16 + 16; y++) for (let x = c.cx * 16; x < c.cx * 16 + 16; x++) for (const s of G.Space.stems(y * N + x)) want.push([s[0], s[1]]);
    ns += want.length; const near = (P, q) => P.some(o => Math.abs(o[0] - q[0]) < 1e-3 && Math.abs(o[1] - q[1]) < 1e-3); // (the drawing keeps a point in Float32: a tenth of a millimetre)
    for (const q of want) if (!near(drawn, q)) bad.push(`caule duro sem desenho em ${q[0].toFixed(2)},${q[1].toFixed(2)}`); for (const q of drawn) if (!near(want, q)) bad.push(`caule desenhado que o corpo não encontra em ${q[0].toFixed(2)},${q[1].toFixed(2)}`); }
  // (the great tree as G.Mata measures it: its drawn crown's top within a couple of metres of the measure; the anchors inside it)
  for (const t of S.trees.values()) { if (t.kind !== 'jungle' || t.stage !== 'grow' || t.size < 0.6 || nt > 60) continue; nt++;
    const g = R3.Geo(), gp = R3.Geo(), gl = R3.Geo(); const D = Ma.tree(t); A3._treeInto(g, t, gp, gl); const Y = G.W.groundH(t.x, t.y) * HM; let top = -1e9; for (let k = 1; k < g.p.length; k += 3) top = Math.max(top, g.p[k]);
    if (Math.abs(top - Y - D.top) > Math.max(3, D.r * 0.6)) bad.push(`a árvore #${t.id} desenhada até ${(top - Y).toFixed(1)} m, o G.Mata diz ${D.top.toFixed(1)} m`);
    for (const w of ['colmeia', 'ninho']) { na++; const a = A3.anchor(t, w); const co = A3.anchor(t, 'copa'); if (!(a[1] > Y + D.cy - D.r * 1.2 && a[1] < Y + D.cy + D.r && Math.hypot(a[0] - co[0], a[2] - co[2]) < D.r)) bad.push(`a ${w} da árvore #${t.id} fora da copa desenhada`); } }
  // (the lianas: each between two trees that exist, grown, of the same chunk)
  const c4 = bestChunk(4); const L = A3._lianas(c4.cx * 16, c4.cy * 16, 16, 16); for (const [a, b] of L) { nl++; const ta = S.trees.get(a), tb = S.trees.get(b); if (!ta || !tb || ta.stage !== 'grow' || tb.stage !== 'grow') bad.push(`um cipó entre #${a} e #${b}, que não estão de pé`); }
  ok('v5', !bad.length && ns > 30 && nt > 10 && nl > 3, `${ns} caules duros, um a um no desenho e no corpo; ${nt} árvores grandes da selva nas medidas do G.Mata; ${na} âncoras dentro da copa; ${nl} cipós entre árvores de pé; ${bad.length} erros${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}`);
}

if (on('v6')) {
  S = novo(); const can = Ma.canopy(); let hi = 0, nhi = 0, lo = 0, nlo = 0;
  for (const t of S.trees.values()) { if (t.stage !== 'grow' || t.size < 0.8 || t.kind !== 'jungle') continue; const i = Math.floor(t.y) * N + Math.floor(t.x); nhi++; if (can.data[i] > 200) hi++; }
  for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) { let any = false; for (let dy = -4; dy <= 4 && !any; dy++) for (let dx = -4; dx <= 4; dx++) { const t = S.trees.get(S.treeAt[(y + dy) * N + x + dx]); if (t && t.stage === 'grow' && t.size >= 0.3) { any = true; break; } } if (any) continue; nlo++; if (can.data[y * N + x]) lo++; }
  ok('v6', hi / Math.max(1, nhi) > 0.95 && !lo, `debaixo de ${nhi} árvores crescidas da selva, ${hi} com o dossel fechado (> 0,78); de ${nlo} casas a mais de quatro casas de toda copa, ${lo} com dossel`);
}

if (on('v7')) {
  S = novo(); const lines = []; const c = bestChunk(4); const X0 = (c.cx * 16 + 8) * TL, Z0 = (c.cy * 16 + 8) * TL;
  const plans = new Map(); for (let cy = c.cy - 4; cy <= c.cy + 4; cy++) for (let cx = c.cx - 4; cx <= c.cx + 4; cx++) if (cx >= 0 && cy >= 0 && cx < NC() && cy < NC()) plans.set(cx + ',' + cy, M3.plan(cx, cy));
  for (const q of ['baixa', 'media', 'alta', 'ultra']) { R3.setQuality(q); const Q = R3.Q(); let inst = 0, tris = 0, fi = 0, ft = 0; const kinds = new Set();
    for (const p of plans.values()) for (let sb = 0; sb < 64; sb++) { const X = (p.cx * 16 + (sb % 8) * 2 + 1) * TL, Z = (p.cy * 16 + Math.floor(sb / 8) * 2 + 1) * TL; const d = Math.hypot(X - X0, Z - Z0); const front = d < 12 || Math.abs(Math.atan2(Z - Z0, X - X0)) < Math.PI / 4;
      for (const L of p.kinds.values()) { const s0 = L.start[sb], s1 = L.start[sb + 1]; if (s1 <= s0) continue; const R = L.layer === 'r' ? Q.mataR : Q.mataA; if (d > R + 6 || !R) continue;
        const share = L.layer === 'r' ? Q.mataRD * (d > R * 0.55 ? 0.65 : 1) : L.layer === 'a' ? Q.mataAD * (d > R * 0.6 ? 0.7 : 1) : 1; const n = Math.ceil((s1 - s0) * share); if (n <= 0) continue; const tr = n * PF.shape(L.kid).tris;
        inst += n; tris += tr; kinds.add(L.kid + L.layer); if (front) { fi += n; ft += tr; } } }
    lines.push(`${q}: ${inst} plantas, ${Math.round(tris / 1000)} mil tri no anel (${Math.round(ft / 1000)} mil na frente do olho), ${kinds.size} chamadas`); }
  R3.setQuality('media');
  ok('v7', true, `no meio da selva mais densa (${c.cx},${c.cy}): ${lines.join('; ')}`);
}

if (on('v8')) {
  S = novo(); const c = bestChunk(4); const bad = []; const log = [];
  // (a save and a load: the same forest — the save keeps the trees' places to the hundredth: a plant may shift by a hair)
  const pre = M3.plan(c.cx, c.cy); M.salvarCarregar(); S = G.S; const post = M3.plan(c.cx, c.cy); let moved = 0;
  for (const [k, L] of pre.kinds) { const R = post.kinds.get(k); if (!R) { moved += L.n; continue; } moved += Math.abs(R.n - L.n); }
  if (moved > pre.n * 0.005) bad.push(`depois do load, ${moved} plantas a mais ou a menos`); log.push(`save e load: ${moved} de ${pre.n} plantas a mais ou a menos`);
  // (a tree felled: the chunk's forest made again — its signature moves —, and nothing growing in the log)
  const p0 = M3.plan(c.cx, c.cy);
  const t = [...S.trees.values()].find(o => o.kind === 'jungle' && o.stage === 'grow' && o.size > 0.8 && Math.floor(o.x / 16) === c.cx && Math.floor(o.y / 16) === c.cy);
  G.inSim++; try { G.Nature.fellTree(t, 1); } finally { G.inSim--; } for (let k = 0; k < 12; k++) G.debug.step(0.1);
  const p1 = M3.plan(c.cx, c.cy); if (p1.sig === p0.sig) bad.push('o plano não mudou com a árvore caída'); bad.push(...M3.check(p1)); log.push(`a árvore #${t.id} caída: o plano refeito (${p0.n} → ${p1.n} plantas)`);
  // (a fire: nothing on a burning tile)
  const fx = Math.floor(t.x) + 2, fy = Math.floor(t.y); const fi = fy * N + fx; S.fire[fi] = 1; const p2 = M3.plan(c.cx, c.cy); let onFire = 0; for (const L of p2.kinds.values()) for (let k = 0; k < L.n; k++) if (Math.floor(L.data[k * 12] / TL) === fx && Math.floor(L.data[k * 12 + 2] / TL) === fy) onFire++; S.fire[fi] = 0;
  if (onFire) bad.push(`${onFire} plantas numa casa queimando`); log.push(`o fogo numa casa: ${onFire} plantas nela`);
  // (the god raises the ground: the plants on the new ground)
  const V = N + 1; for (let y = c.cy * 16 + 4; y <= c.cy * 16 + 10; y++) for (let x = c.cx * 16 + 4; x <= c.cx * 16 + 10; x++) S.H[y * V + x] += 1.2; S.typeVer = (S.typeVer || 0) + 1; G.W.invalidateLand && G.W.invalidateLand();
  const p3 = M3.plan(c.cx, c.cy); const ck = M3.check(p3); bad.push(...ck); log.push(`a terra erguida 1,8 m: ${ck.length} plantas fora do chão novo`);
  ok('v8', !bad.length, `${log.join('; ')}; ${bad.length} erros${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}`);
}

if (on('v9')) {
  S = novo(); const lines = []; let nb = 0;
  for (let b = 0; b < 7; b++) { const c = bestChunk(b); if (!c) continue; const fc = R3.floraCheck(c.cx * 16 + 8, c.cy * 16 + 8, 10); nb += fc.length; lines.push(`${G.BIOMES[b].id} ${fc.length}${fc.length ? ' (' + fc[0] + ')' : ''}`); }
  ok('v9', !nb, `R3.floraCheck: ${lines.join(', ')}`);
}

{ const e = M.erros(); ok('erros', !Object.keys(e.mod).length && !e.console.length, `módulos ${JSON.stringify(e.mod)}; console ${e.console.length}${e.console.length ? ' (' + e.console[0] + ')' : ''}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
