// geo: o relevo e a geologia (o G.Geo, js/geo.js; o 3D do relevo, js/geo3d.js; D-490 a D-499), em Node.   [ONLY=g1,g2] node qa/geo.js   (≈ 3 min)
// O G.Geo é uma fonte pura: a rocha de cada lugar e as suas camadas, o entalhe das faces de penhasco (só nas casas onde ninguém anda),
// as formações, a terra além da borda. A fase A só desenha: o mundo fica igual byte a byte.
// g1 pura e determinística: o mesmo mundo dá a mesma rocha, a mesma dobra, a mesma tabela das camadas, as mesmas formações e a mesma terra
//    além da borda; perguntar tudo não tira de acaso nenhum (o S.rng igual);
// g2 o entalhe encontra o chão do mundo: nada na borda de toda casa que não é entalhada (a casa onde se anda, a pedra, a estrada, o
//    prédio, a boca); o desenho do penhasco (Geo3D.carveGeo) nessas bordas no chão do mundo ao milímetro, e dois pedaços vizinhos, entalhados
//    em passos diferentes, com os mesmos pontos na divisa — nenhuma fresta; nada sem número;
// g3 o save e o load no meio: a mesma rocha, a mesma dobra, as mesmas formações (ao centímetro) e o mesmo entalhe depois de um load;
// g4 o deus muda o chão: a terra erguida num penhasco — a memória (as formações, o alto do mapa) refeita, o entalhe ainda nada nas bordas, o
//    pedaço do 3D com outra assinatura;
// g5 o inverno: a neve do deus sobre a rocha — o musgo some, as pedras e as formações na neve;
// g6 a chuva e a tempestade: a rocha molhada (S.wet) e o borrifo ao pé de uma queda d'água;
// g7 o penhasco junto da estrada e do prédio: a casa com estrada ou prédio nunca entalhada, a borda com ela nada; uma estrada aberta numa
//    face já entalhada a desfaz ali (a assinatura do pedaço muda);
// g8 a boca da caverna: a casa da boca nunca entalhada; o buraco só numa face entalhada; as pedras do lábio fora das casas onde se anda
//    mais baixas que 2,5 m;
// g9 a borda do mapa: a terra além dela só nos continentes e no istmo, nunca nas ilhas; nada dentro do mapa; a praia de lá a 40 m ou mais
//    da borda (o mar do mapa fica mar); serras de centenas de metros longe;
// g10 o mundo igual: o save igual byte a byte antes e depois de desenhar tudo na Ultra (o entalhe, as pedras e as formações de todos os
//    pedaços, a terra além da borda, o mapa da rocha do chão) e o acaso igual;
// e o verificador «relevo» (qa/geo-inv.js) calado, nenhum erro de módulo nem de console.
'use strict';
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M } = T.load({ qa: true }); // (the checker «relevo» comes in the qa.js: qa/junta-inv.js)
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | geo ${name} | ${info}`); if (!c) fails.push(name); };
const SEED = 4242;
const Ge = G.Geo, G3 = G.Geo3D, W = G.W, TT = G.T; G3.node(THREE);
const alpino = () => M.novo({ seed: SEED, type: 'continente', size: 128, tribes: 2, temper: 'normal', clima: 'variado', relevo: 'alpino', costa: 'falesias', cordilheiras: 'uma' });
let S = alpino(); let N = G.N; const TL = G.Space.TILE, HM = G.Space.HM;
const o3 = [0, 0, 0];
// (everything the G.Geo says of the map, as one string: the rock and the fold of every tile, the table, the formations, the land beyond)
function all() {
  const r = new Uint8Array(N * N), f = new Float32Array(N * N); for (let i = 0; i < N * N; i++) { r[i] = Ge.rockAt(i); f[i] = Ge.foldAt(i); }
  const fm = []; for (let ry = 0; ry < Math.ceil(N / 16); ry++) for (let rx = 0; rx < Math.ceil(N / 16); rx++) fm.push(Ge.forms(rx, ry));
  const by = []; const L = N * TL; for (let a = 0; a < 64; a++) for (const R of [L * 0.7, 1500, 5000]) by.push(Math.round(Ge.beyondH(L / 2 + Math.cos(a / 10) * R, L / 2 + Math.sin(a / 10) * R) * 100));
  return { r: Buffer.from(r).toString('base64'), f: Buffer.from(f.buffer).toString('base64'), t: Buffer.from(Ge.table()).toString('base64'), fm: JSON.stringify(fm), by: by.join(',') };
}
// (the points of a chunk's carved faces on the edges of tiles not carved: how far from the world's ground, metres)
function edgeGap(g, x0, y0, n) {
  if (!g) return { n: 0, worst: 0 }; const P = g.attributes.position.array; let k = 0, worst = 0;
  for (let q = 0; q < P.length; q += 3) { const x = P[q] / TL, y = P[q + 2] / TL; const fx = Math.abs(x - Math.round(x)) < 1e-4, fy = Math.abs(y - Math.round(y)) < 1e-4; if (!fx && !fy) continue;
    // (on a tile's edge: is a tile on either side of it not carved?)
    const sides = []; if (fx) sides.push([Math.round(x) - 1, Math.floor(y)], [Math.round(x), Math.floor(y)]); if (fy) sides.push([Math.floor(x), Math.round(y) - 1], [Math.floor(x), Math.round(y)]);
    if (!sides.some(([a, b]) => !W.inb(a, b) || !Ge.carves(b * N + a))) continue; k++; const d = Math.abs(P[q + 1] - W.hAt(x, y) * HM); if (d > worst) worst = d; }
  return { n: k, worst };
}

if (on('g1')) {
  const rng0 = JSON.stringify(S.rng); const a = all(); const rng1 = JSON.stringify(S.rng);
  S = alpino(); const b = all(); const eq = Object.keys(a).every(k => a[k] === b[k]);
  const cnt = [0, 0, 0, 0, 0]; for (let i = 0; i < N * N; i++) if (S.type[i] >= TT.SAND) cnt[Ge.rockAt(i)]++;
  ok('g1', eq && rng0 === rng1 && cnt.filter(c => c > 0).length >= 4, `o mesmo mundo duas vezes: ${eq ? 'o mesmo relevo' : 'DIFERENTE em ' + Object.keys(a).filter(k => a[k] !== b[k]).join(',')}; o acaso ${rng0 === rng1 ? 'igual' : 'MUDOU'}; as rochas da terra: ${Ge.ROCKS.map((R, k) => R.name + ' ' + cnt[k]).join(', ')}; ${JSON.parse(a.fm).flat().length} formações`);
}

if (on('g2')) {
  S = alpino(); const bad = []; let edges = 0, tiles = 0, nan = 0, worst = 0, seams = 0, seamW = 0;
  for (let i = 0; i < N * N; i++) { if (!Ge.carves(i)) continue; tiles++; const x = i % N, y = (i / N) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (W.inb(x + dx, y + dy) && Ge.carves((y + dy) * N + x + dx)) continue;
      for (let k = 0; k <= 16; k++) { const u = k / 16; const px = dx === 1 ? x + 1 : dx === -1 ? x : x + u, py = dy === 1 ? y + 1 : dy === -1 ? y : y + u; Ge.cliffAt(px, py, o3); edges++; const m = Math.abs(o3[0]) + Math.hypot(o3[1], o3[2]); if (m > 1e-6) bad.push(`${px.toFixed(2)},${py.toFixed(2)}`); } }
    for (let k = 0; k < 9; k++) { Ge.cliffAt(x + 0.1 + (k % 3) * 0.4, y + 0.1 + ((k / 3) | 0) * 0.4, o3); if (!Number.isFinite(o3[0] + o3[1] + o3[2])) nan++; } }
  // (the drawing: every chunk at each step; its points on the edges of the tiles not carved on the world's ground; the seams between chunks)
  for (const q of ['media', 'alta', 'ultra']) { G.Realm.setQuality(q);
    for (let cy = 0; cy < N / 16; cy++) for (let cx = 0; cx < N / 16; cx++) { const g = G3.carveGeo(cx * 16, cy * 16, 16, []); const e = edgeGap(g, cx * 16, cy * 16, 16); if (e.worst > worst) worst = e.worst;
      if (g) { const P = g.attributes.position.array; for (let k = 0; k < P.length; k++) if (!Number.isFinite(P[k])) nan++; } } }
  // (a seam between two chunks carved at different steps: the same points on their border)
  { const L = new Map(); const keep = (g, tag) => { if (!g) return; const P = g.attributes.position.array; for (let q = 0; q < P.length; q += 3) { const x = P[q] / TL, y = P[q + 2] / TL; if (Math.abs(x - 64) > 1e-4 && Math.abs(y - 64) > 1e-4) continue; const k = Math.round(x * 64) + ':' + Math.round(y * 64); const s = L.get(k) || {}; s[tag] = P[q + 1]; L.set(k, s); } };
    G.Realm.setOver('geoCarve', 8); keep(G3.carveGeo(48, 48, 16, []), 'a'); G.Realm.setOver('geoCarve', 4); keep(G3.carveGeo(64, 48, 16, []), 'b'); keep(G3.carveGeo(48, 64, 16, []), 'b');
    for (const s of L.values()) if (s.a !== undefined && s.b !== undefined) { seams++; seamW = Math.max(seamW, Math.abs(s.a - s.b)); } G.Realm.setQuality('media'); }
  ok('g2', !bad.length && !nan && worst < 1e-3 && seamW < 1e-3, `${tiles} casas entalhadas, ${edges} pontos de borda com casa não entalhada: ${bad.length} fora do chão${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}; o desenho na Média, na Alta e na Ultra: o pior ponto de borda a ${(worst * 1000).toFixed(2)} mm do chão do mundo; a divisa de dois pedaços entalhados em 8 e em 4 passos: ${seams} pontos, o pior a ${(seamW * 1000).toFixed(2)} mm; ${nan} sem número`);
}

if (on('g3')) {
  S = alpino(); const a = all(); const pts = []; const cut = []; for (let i = 0; i < N * N && pts.length < 400; i++) if (Ge.carves(i)) { const x = i % N + 0.37, y = ((i / N) | 0) + 0.61; Ge.cliffAt(x, y, o3); pts.push([x, y, o3[0], o3[1], o3[2]]); }
  const cl0 = Uint8Array.from(G.S.cliff);
  M.salvarCarregar(); S = G.S; const b = all(); let wc = 0; for (const p of pts) { Ge.cliffAt(p[0], p[1], o3); wc = Math.max(wc, Math.abs(o3[0] - p[2]), Math.abs(o3[1] - p[3]), Math.abs(o3[2] - p[4])); }
  // (T-1531: the world's own map of the cliffs is made again on a load from the heights to the hundredth — a tile on the knife's edge of the
  // world's rule may turn: the world differs there, not the relief's drawing. The regions round such a tile are left out of the comparison)
  const flip = []; for (let i = 0; i < N * N; i++) if (cl0[i] !== S.cliff[i]) flip.push(i); const near = f => flip.some(i => Math.abs(i % N - f.x) < 4 && Math.abs(((i / N) | 0) - f.y) < 4);
  const fa = JSON.parse(a.fm).flat().filter(f => !near(f)), fb = JSON.parse(b.fm).flat().filter(f => !near(f)); let wf = 0; const same = fa.length === fb.length && fa.every((f, k) => { const g = fb[k]; wf = Math.max(wf, Math.abs(f.X - g.X), Math.abs(f.Y - g.Y), Math.abs(f.Z - g.Z)); return f.kind === g.kind && f.i === g.i; });
  ok('g3', a.r === b.r && a.f === b.f && a.t === b.t && same && wf < 0.03 && wc < 0.03, `depois de um save e um load: a rocha ${a.r === b.r ? 'igual' : 'DIFERENTE'}, a dobra ${a.f === b.f ? 'igual' : 'DIFERENTE'}, a tabela ${a.t === b.t ? 'igual' : 'DIFERENTE'}; ${fb.length} formações ${same ? 'as mesmas' : 'DIFERENTES'} (a pior ${(wf * 100).toFixed(2)} cm), fora de ${flip.length} casa(s) que o mapa de penhascos do mundo virou no load (T-1531: ${flip.map(i => (i % N) + ',' + ((i / N) | 0)).join(' ') || 'nenhuma'}); o entalhe de ${pts.length} pontos: o pior ${(wc * 100).toFixed(2)} cm`);
}

if (on('g4')) {
  S = alpino(); // (a carved face with room round it: the god raises the land over it)
  let at = -1, best = -1; for (let i = 0; i < N * N; i++) { if (!Ge.carves(i)) continue; const x = i % N, y = (i / N) | 0; if (x < 10 || y < 10 || x > N - 10 || y > N - 10) continue; let n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Ge.carves((y + dy) * N + x + dx)) n++; if (n > best) { best = n; at = i; } }
  const x = at % N, y = (at / N) | 0; const rx = Math.floor(x / 16), ry = Math.floor(y / 16);
  // (the chunk's signature as the 3D reads it — R3.sigOf —: its ground's part, the heights, the tiles and the carving)
  const gk = s => s.a + ':' + s.c + ':' + s.e;
  const f0 = JSON.stringify(Ge.forms(rx, ry)); const sig0 = gk(G.Realm.sigOf(rx, ry)); const tv0 = S.typeVer;
  G.Powers.reshape(x + 0.5, y + 0.5, 3, 1);
  const f1 = JSON.stringify(Ge.forms(rx, ry)), ff = JSON.stringify(Ge.formsFresh(rx, ry)); const sig1 = gk(G.Realm.sigOf(rx, ry));
  let bad = 0; for (let yy = y - 6; yy <= y + 6; yy++) for (let xx = x - 6; xx <= x + 6; xx++) { const i = yy * N + xx; if (!W.inb(xx, yy) || !Ge.carves(i)) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (W.inb(xx + dx, yy + dy) && Ge.carves((yy + dy) * N + xx + dx)) continue; for (let k = 0; k <= 8; k++) { const u = k / 8; Ge.cliffAt(dx === 1 ? xx + 1 : dx === -1 ? xx : xx + u, dy === 1 ? yy + 1 : dy === -1 ? yy : yy + u, o3); if (Math.abs(o3[0]) + Math.hypot(o3[1], o3[2]) > 1e-6) bad++; } } }
  const g = G3.carveGeo(rx * 16, ry * 16, 16, []); const e = edgeGap(g, rx * 16, ry * 16, 16);
  ok('g4', S.typeVer !== tv0 && f1 === ff && f1 !== f0 && sig1 !== sig0 && !bad && e.worst < 1e-3, `a terra erguida pelo deus sobre o penhasco em ${x},${y}: o chão ${S.typeVer !== tv0 ? 'avisou' : 'NÃO avisou'} (typeVer); as formações da região ${f1 === ff ? 'refeitas' : 'ATRASADAS'} (${f1 === f0 ? 'iguais às de antes — nada mudou?' : 'outras'}); o pedaço ${sig1 !== sig0 ? 'com outra assinatura' : 'com a MESMA assinatura'}; ${bad} pontos de borda fora do chão; o desenho a ${(e.worst * 1000).toFixed(2)} mm`);
}

if (on('g5') || on('g6')) {
  // (the ground's own picture of the rock, as the land's shader reads it: Ground3D in Node — numbers, no graphics card)
  S = alpino(); G.Realm.setQuality('alta'); G.Ground3D.init(THREE); G.Ground3D.full();
  const cliffs = []; for (let i = 0; i < N * N; i++) if (S.cliff[i] && S.type[i] >= TT.SAND) cliffs.push(i);
  if (on('g5')) {
    // (a wet land's cliff, its moss; then the god's winter over it)
    let wetC = -1, mb = -1; for (const i of cliffs) { const m = G.Ground3D.geoOf(i, i % N, (i / N) | 0)[3] >> 4; if (m > mb) { mb = m; wetC = i; } }
    const x = wetC % N, y = (wetC / N) | 0; const before = G.Ground3D.geoOf(wetC, x, y)[3] >> 4;
    S.winters = S.winters || []; S.winters.push({ x: x + 0.5, y: y + 0.5, r: 6, t: 60 });
    const after = G.Ground3D.geoOf(wetC, x, y)[3] >> 4; const snowy = G.Ground3D.snowAt(wetC);
    // (the stones and the formations read the snow and the moss of the ground where they stand — the floor's picture and the rock's, as
    // the ground under them: under the winter's circle, the snow lies on the floor of every piece there, and the moss is gone)
    G.Ground3D.full(); let inW = 0, snowed = 0, mossy = 0; const fl = G.Ground3D.floorMap().image.data, ge = G.Ground3D.geoMap().image.data;
    for (let cy = 0; cy < N / 16; cy++) for (let cx = 0; cx < N / 16; cx++) for (const p of G3.piecesOf(cx * 16, cy * 16, 16)) { const X = p.m[12] / TL, Z = p.m[14] / TL; if (Math.hypot(X - x - 0.5, Z - y - 0.5) > 4 || !W.inb(X, Z)) continue; const i = W.idx(X, Z); inW++; if (fl[i * 4 + 3] > 120) snowed++; if ((ge[i * 4 + 3] >> 4) > 2) mossy++; }
    const snowW = G.Ground3D.snowOf(wetC, x, y); S.winters.length = 0;
    ok('g5', before > 3 && after < before && snowW > 0.5 && inW > 0 && snowed === inW && !mossy, `a rocha mais musgosa (${x},${y}): o musgo ${before}/15; no inverno do deus (a neve ${snowW.toFixed(2)}; a do clima ${snowy.toFixed(2)}) ${after}/15; as ${inW} pedras e formações no círculo do inverno: ${snowed} com a neve do chão debaixo delas, ${mossy} com musgo`);
  }
  if (on('g6')) {
    const i = cliffs[Math.floor(cliffs.length / 2)]; const x = i % N, y = (i / N) | 0; const dry = G.Ground3D.geoOf(i, x, y)[3] & 15;
    S.weather.rain = 1; S.weather.storm = 1; const w0 = S.wet[i]; S.wet[i] = 1; const wet = G.Ground3D.geoOf(i, x, y)[3] & 15; S.wet[i] = w0; S.weather.rain = 0; S.weather.storm = 0;
    const fl = (S.relief.falls || [])[0]; let spray = -1, far = -1; if (fl) { spray = G.Ground3D.geoOf(fl.y * N + fl.x, fl.x, fl.y)[3] & 15; const fx = G.clamp(fl.x + 9, 0, N - 1); far = G.Ground3D.geoOf(fl.y * N + fx, fx, fl.y)[3] & 15; }
    ok('g6', wet === 15 && wet > dry && (!fl || spray > far), `a rocha em ${x},${y}: seca ${dry}/15, na tempestade com o chão molhado ${wet}/15; o borrifo ao pé da queda em ${fl ? fl.x + ',' + fl.y : '—'}: ${spray}/15 (a nove casas dela: ${far}/15)`);
  }
}

if (on('g7')) {
  S = alpino(); // (a cliff tile with a road or a building beside it, or on it)
  let roadNb = 0, edgeBad = 0; for (let i = 0; i < N * N; i++) { if (!Ge.carves(i)) continue; const x = i % N, y = (i / N) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (y + dy) * N + x + dx; if (!W.inb(x + dx, y + dy) || !(S.road[j] || S.occ[j])) continue; roadNb++;
      for (let k = 0; k <= 8; k++) { const u = k / 8; Ge.cliffAt(dx === 1 ? x + 1 : dx === -1 ? x : x + u, dy === 1 ? y + 1 : dy === -1 ? y : y + u, o3); if (Math.abs(o3[0]) + Math.hypot(o3[1], o3[2]) > 1e-6) edgeBad++; } } }
  let onRoad = 0; for (let i = 0; i < N * N; i++) if (S.cliff[i] && (S.road[i] || S.occ[i]) && Ge.carves(i)) onRoad++;
  // (a road opened across a carved face: no longer carved, the chunk made again, its edges on the world's ground)
  let at = -1; for (let i = 0; i < N * N && at < 0; i++) if (Ge.carves(i) && i % N > 2 && i % N < N - 3) at = i; const x = at % N, y = (at / N) | 0; const sig0 = G3.sig(Math.floor(x / 16) * 16, Math.floor(y / 16) * 16, 16);
  S.road[at] = 1; const was = Ge.carves(at); const sig1 = G3.sig(Math.floor(x / 16) * 16, Math.floor(y / 16) * 16, 16); let nb = 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (!Ge.carves((y + dy) * N + x + dx)) continue; const xx = x + dx, yy = y + dy; for (let k = 0; k <= 8; k++) { const u = k / 8; Ge.cliffAt(dx === -1 ? xx + 1 : dx === 1 ? xx : xx + u, dy === -1 ? yy + 1 : dy === 1 ? yy : yy + u, o3); if (Math.abs(o3[0]) + Math.hypot(o3[1], o3[2]) > 1e-6) nb++; } }
  S.road[at] = 0;
  ok('g7', !edgeBad && !onRoad && !was && sig1 !== sig0 && !nb, `${roadNb} bordas de penhasco entalhado com estrada ou prédio ao lado: ${edgeBad} pontos fora do chão; ${onRoad} casas de penhasco com estrada ou prédio entalhadas; a estrada aberta na face em ${x},${y}: ${was ? 'AINDA entalhada' : 'não mais entalhada'}, o pedaço ${sig1 !== sig0 ? 'refeito' : 'NÃO refeito'}, as faces vizinhas com ${nb} pontos fora do chão na borda dela`);
}

if (on('g8')) {
  S = alpino(); const ms = G3.mouthsIn(0, 0, N); let mt = 0, holes = 0, holeBad = 0, lipLow = 0, lips = 0;
  for (const m of ms) { const i = W.idx(m.X / TL, m.Z / TL); if (Ge.carves(i)) mt++; }
  for (const m of ms.filter(q => q.carve)) { const x0 = Math.floor(m.X / TL / 16) * 16, y0 = Math.floor(m.Z / TL / 16) * 16; const g0 = G3.carveGeo(x0, y0, 16, []), g1 = G3.carveGeo(x0, y0, 16, [m]); const cut = (g0 ? g0.index.count : 0) - (g1 ? g1.index.count : 0); if (cut > 0) holes++;
    // (the hole only in carved tiles: every triangle left out is of a carved tile — the land's own picture never has a hole)
    if (g1) { const e = edgeGap(g1, x0, y0, 16); if (e.worst > 1e-3) holeBad++; } }
  for (let cy = 0; cy < N / 16; cy++) for (let cx = 0; cx < N / 16; cx++) for (const p of G3.piecesOf(cx * 16, cy * 16, 16)) { if (!/^bloco/.test(p.shape)) continue; const X = p.m[12], Y = p.m[13], Z = p.m[14]; const i = W.idx(X / TL, Z / TL); if (!W.walkable(i)) continue; lips++; const g = W.hAt(X / TL, Z / TL) * HM; if (Y > g + 0.05 && Y < g + 2.5 && !ms.some(m => Math.hypot(m.X - X, m.Z - Z) < m.w)) lipLow++; }
  ok('g8', ms.length > 0 && !mt && holes === ms.filter(q => q.carve).length && !holeBad && !lipLow, `${ms.length} bocas de caverna (${ms.filter(q => q.carve).length} cortadas numa face): ${mt} casas de boca entalhadas; ${holes} buracos abertos no desenho da face, ${holeBad} com a borda fora do chão; ${lips} blocos sobre casas onde se anda, ${lipLow} soltos a menos de 2,5 m longe de uma boca`);
}

if (on('g9')) {
  const out = []; let okAll = true;
  for (const [type, sz] of [['continente', 128], ['istmo', 128], ['ilha', 96], ['arquipelago', 96]]) {
    S = M.novo({ seed: SEED, type, size: sz, tribes: 2, temper: 'normal', clima: 'variado', relevo: 'montanhoso' }); N = G.N; const L = N * TL;
    const any = Ge.beyondAny(); let inside = 0, nearLand = 0, top = -1e9; for (let k = 0; k < 400; k++) { const a = k / 400 * Math.PI * 2; for (const d of [10, 30, 39]) { const X = L / 2 + Math.cos(a) * (L / 2 + d) * 1.0, Z = L / 2 + Math.sin(a) * (L / 2 + d); const cx = G.clamp(X, 0, L), cz = G.clamp(Z, 0, L); if (Math.hypot(X - cx, Z - cz) < 40 && Ge.beyondH(X, Z) > G.SEA * HM) nearLand++; } for (const R of [2000, 4000, 7000]) top = Math.max(top, Ge.beyondH(L / 2 + Math.cos(a) * R, L / 2 + Math.sin(a) * R)); }
    for (let k = 0; k < 200; k++) { const X = G.hash(k * 7) * L, Z = G.hash(k * 13) * L; if (Ge.beyondH(X, Z) !== -Infinity) inside++; }
    const want = type === 'continente' || type === 'istmo'; const good = any === want && !inside && !nearLand && (!want || top - G.SEA * HM > (type === 'istmo' ? 80 : 250)); okAll = okAll && good;
    out.push(`${type}: ${any ? 'terra além' : 'só mar'}${want ? ` (o mais alto a ${Math.round(top - G.SEA * HM)} m)` : ''}, ${inside} pontos dentro do mapa com terra de lá, ${nearLand} a menos de 40 m da borda`);
  }
  ok('g9', okAll, out.join('; '));
}

if (on('g10')) {
  S = alpino(); N = G.N; const rng0 = JSON.stringify(S.rng), sv0 = G.Save.serialize(); G.Realm.setQuality('ultra'); let tris = 0, np = 0;
  G.Ground3D.init(THREE); G.Ground3D.full();
  for (let cy = 0; cy < N / 16; cy++) for (let cx = 0; cx < N / 16; cx++) { const g = G3.carveGeo(cx * 16, cy * 16, 16, G3.mouthsIn(cx * 16 - 2, cy * 16 - 2, 20).filter(m => m.carve)); if (g) tris += g.index.count / 3; np += G3.piecesOf(cx * 16, cy * 16, 16).length; G3.farStep(cx * 16, cy * 16, 16); }
  const L = N * TL; const h1 = G3.horGeo(L / 2, 1300, 40, 512), h2 = G3.horGeo(1300, 9000, 36, 512); for (let i = 0; i < N * N; i++) { G.Ground3D.geoOf(i, i % N, (i / N) | 0); G.Space.cliffAt(i % N + 0.5, ((i / N) | 0) + 0.5); }
  const sv1 = G.Save.serialize(), rng1 = JSON.stringify(S.rng); G.Realm.setQuality('media');
  ok('g10', sv0 === sv1 && rng0 === rng1, `o relevo inteiro desenhado na Ultra (${Math.round(tris / 1000)} mil triângulos de penhasco entalhado, ${np} pedras e formações, a terra além da borda: ${Math.round(((h1 ? h1.index.count : 0) + (h2 ? h2.index.count : 0)) / 3000)} mil triângulos, o mapa da rocha de ${N * N} casas): o save ${sv0 === sv1 ? 'igual byte a byte' : 'MUDOU'} (${sv0.length} bytes), o acaso ${rng0 === rng1 ? 'igual' : 'MUDOU'}`);
}

{ S = alpino(); const ri = QA.check().filter(q => q.sys === 'relevo'); const e = M.erros();
  ok('verificador', !ri.length && !Object.keys(e.mod).length && !e.console.length, `«relevo»: ${ri.length}${ri.length ? ' (' + ri[0].msg + ')' : ''}; módulos ${JSON.stringify(e.mod)}; console ${e.console.length}${e.console.length ? ' (' + e.console[0] + ')' : ''}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
