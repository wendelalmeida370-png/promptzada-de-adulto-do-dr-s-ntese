// relevo3d: o relevo no 3D, em Node (a geometria, sem placa de vídeo; D-490 a D-499).   [ONLY=v1,v3] node qa/visual/relevo3d.js   (≈ 3 min)
// (o nome geo3d.js das provas visuais já era da geometria dos prédios: esta é a do relevo)
// v1 o orçamento por qualidade no lugar mais montanhoso do mundo alpino: os triângulos do penhasco entalhado no anel de perto (e os do chão
//    que ele tira), as pedras e as formações (as instâncias, os triângulos, as chamadas: uma por forma), a terra além da borda, a figura de
//    longe mais fina onde o relevo é áspero — e o tempo de montar um pedaço;
// v2 o mesmo relevo duas vezes (a mesma semente, os mesmos pedaços: os mesmos números, byte a byte);
// v3 as pedras e as formações no lugar: cada pedra do mundo na forma que o corpo pisa (G.Space.stones, matriz a matriz); cada formação
//    dentro da coluna da sua casa entalhada, longe da borda das casas onde se anda, e nenhuma peça sobre uma casa onde se anda mais
//    baixa que 2,5 m (fora das pedras do mundo e do lábio das bocas, que ficam no chão); nada sem número;
// v4 a face entalhada: nunca mais funda que uma camada da rocha, nunca dobrada sobre si (subindo a encosta, sempre mais alta), nunca fora
//    da coluna da sua casa (o empurrão da cornija dentro dela);
// v5 a terra além da borda: nada dentro do mapa, nada nas ilhas; serras de centenas de metros longe; a neve e as geleiras acima da linha
//    da neve de cada lado;
// v6 as verificações do desenho que ninguém chamava: a das plantas em volta das pedras (R3.floraCheck: o arvore3d.js perdeu as pedras e
//    ficou com o capim em volta delas), a do chão (Ground3D.check: o mapa das casas, o do chão, o da rocha) e a do relevo (Geo3D.check).
'use strict';
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load({ qa: false });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | relevo3d ${name} | ${info}`); if (!c) fails.push(name); };
const SEED = 4242; const G3 = G.Geo3D, Ge = G.Geo, W = G.W, R3 = G.Realm; G3.node(THREE);
const alpino = () => M.novo({ seed: SEED, type: 'continente', size: 128, tribes: 2, temper: 'normal', clima: 'variado', relevo: 'alpino', costa: 'falesias', cordilheiras: 'uma' });
let S = alpino(); let N = G.N; const TL = G.Space.TILE, HM = G.Space.HM; const NC = () => Math.ceil(G.N / 16);
const ms = t0 => Number(process.hrtime.bigint() - t0) / 1e6;
const kitTris = {}; { const K = G3.kit(); for (const k in K) K[k].forEach((g, v) => { kitTris[k + v] = g.attributes.position.count / 3; }); }
// (the eye at the foot of the most carved place: the walkable tile with the most carved tiles in 12 tiles round it)
function steepest() { let best = null, bs = -1; for (let y = 8; y < N - 8; y += 2) for (let x = 8; x < N - 8; x += 2) { const i = y * N + x; if (!W.walkable(i)) continue; let n = 0; for (let dy = -12; dy <= 12; dy += 2) for (let dx = -12; dx <= 12; dx += 2) if (Ge.carves((y + dy) * N + x + dx)) n++; if (n > bs) { bs = n; best = { x: x + 0.5, y: y + 0.5 }; } } return best; }

if (on('v1')) {
  const eye = steepest(); const lines = [];
  for (const q of ['baixa', 'media', 'alta', 'ultra']) {
    R3.setQuality(q); const Q = R3.Q(); const R = Q.near; const ccx = Math.floor(eye.x / 16), ccy = Math.floor(eye.y / 16);
    let carved = 0, removed = 0, pieces = 0, ptris = 0, stones = 0, worst = 0, chunks = 0; const shapes = new Set();
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { if (dx * dx + dy * dy > (R + 0.5) * (R + 0.5)) continue; const cx = ccx + dx, cy = ccy + dy; if (cx < 0 || cy < 0 || cx >= NC() || cy >= NC()) continue; chunks++;
      const t0 = process.hrtime.bigint(); const g = G3.carveGeo(cx * 16, cy * 16, 16, [], eye); const d = ms(t0); if (d > worst) worst = d;
      if (g) { carved += g.index.count / 3; removed += g.userData.tiles * 8; }
      for (const p of G3.piecesOf(cx * 16, cy * 16, 16, eye)) { pieces++; shapes.add(p.shape); if (p.shape === 'pedra0') stones += kitTris[p.shape] || 0; else ptris += kitTris[p.shape] || 0; } }
    let farX = 0; for (let cy = 0; cy < NC(); cy++) for (let cx = 0; cx < NC(); cx++) { const st = G3.farStep(cx * 16, cy * 16, 16); farX += (16 / st) * (16 / st) * 2 - 128; }
    const L = N * TL; const far = G.clamp(2.4 * Q.view, 500, 1600); const lv = Q.geoHor; let hor = 0, hcalls = 0;
    if (lv && Ge.beyondAny()) { const rA = Math.max(L / 2 + 40, far * 0.94 - L / 2 * Math.SQRT2); const na = lv >= 3 ? 512 : lv >= 2 ? 360 : 200;
      if (lv >= 2 && rA > L / 2 + 60) { const g = G3.horGeo(L / 2 * 0.98, rA, lv >= 3 ? 40 : 28, na); if (g) { hor += g.index.count / 3; hcalls++; } }
      const g = G3.horGeo(lv >= 2 && rA > L / 2 + 60 ? rA : L / 2 * 0.98, 9000, lv >= 3 ? 36 : lv >= 2 ? 28 : 18, na); if (g) { hor += g.index.count / 3; hcalls++; } }
    const text = `${q}: ${chunks} pedaços perto — penhasco entalhado ${Math.round(carved / 1000)} mil tri (tira ${Math.round(removed / 1000)} mil do chão; o pior pedaço em ${worst.toFixed(0)} ms), ${pieces} pedras e formações em ${shapes.size} chamadas: as formações ${Math.round(ptris / 1000)} mil tri, as pedras do mundo e as lascas ${Math.round(stones / 1000)} mil (antes, no desenho das plantas), além da borda ${Math.round(hor / 1000)} mil tri em ${hcalls} chamada(s), a figura de longe +${Math.round(farX / 1000)} mil tri no mapa todo`;
    lines.push({ q, text, carved, removed, ptris, stones, hor, farX, calls: shapes.size + hcalls });
  }
  const by = Object.fromEntries(lines.map(l => [l.q, l]));
  console.log(lines.map(l => '   ' + l.text).join('\n'));
  // (the Leve adds nothing but the far ranges, coarse; the Média stays light: its new triangles under a tenth of what the scene draws near
  // the body in the metropole — the BIBLE measures ~310–330 thousand on the Média)
  // (what is new near the body: the carving less the ground it replaces, the formations; the stones of the world were drawn before too)
  const ex = l => l.carved - l.removed + l.ptris; const extraM = ex(by.media), extraL = ex(by.baixa);
  ok('v1', by.baixa.carved === 0 && extraL === 0 && extraM < 32000 && by.alta.carved > by.media.carved, `perto do corpo, além das pedras do mundo de antes: a Leve +${extraL} triângulos (e a serra longe, além da borda), a Média +${Math.round(extraM / 1000)} mil, a Alta +${Math.round(ex(by.alta) / 1000)} mil, a Ultra +${Math.round(ex(by.ultra) / 1000)} mil — no lugar mais montanhoso (em ${eye.x.toFixed(0)},${eye.y.toFixed(0)})`);
  R3.setQuality('media');
}

if (on('v2')) {
  R3.setQuality('alta'); const eye = steepest(); const dump = () => { const out = []; for (let cy = 0; cy < NC(); cy++) for (let cx = 0; cx < NC(); cx++) { const g = G3.carveGeo(cx * 16, cy * 16, 16, G3.mouthsIn(cx * 16 - 2, cy * 16 - 2, 20).filter(m => m.carve), eye); if (g) out.push(Buffer.from(g.attributes.position.array.buffer).toString('base64')); out.push(JSON.stringify(G3.piecesOf(cx * 16, cy * 16, 16, eye))); } return out.join('|'); };
  G3.forget(); const a = dump(); S = alpino(); G3.forget(); const b = dump(); R3.setQuality('media');
  ok('v2', a === b, `o relevo de ${NC() * NC()} pedaços (o entalhe, as pedras e as formações) num mundo e no mesmo mundo feito de novo: ${a === b ? 'igual byte a byte' : 'DIFERENTE'} (${Math.round(a.length / 1024)} KiB)`);
}

if (on('v3')) {
  S = alpino(); R3.setQuality('ultra'); const bad = []; let nStone = 0, nForm = 0, nLip = 0; const M4 = new THREE.Matrix4(), Qt = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), Sc = new THREE.Vector3();
  const mouths = G3.mouthsIn(0, 0, N);
  for (let cy = 0; cy < NC(); cy++) for (let cx = 0; cx < NC(); cx++) for (const p of G3.piecesOf(cx * 16, cy * 16, 16)) {
    if (!p.m.every(Number.isFinite)) { bad.push(`${p.shape}: matriz sem número`); continue; }
    const X = p.m[12], Y = p.m[13], Z = p.m[14]; const x = X / TL, y = Z / TL; const i = W.idx(x, y);
    if (p.shape === 'pedra0') { nStone++; continue; } // (the stones of the world and the ones broken off them lie on the ground, as before)
    const lip = mouths.some(m => Math.hypot(m.X - X, m.Z - Z) < m.w + 1.5); if (lip) { nLip++; continue; }
    nForm++; if (!Ge.carves(i)) { bad.push(`${p.shape} em ${x.toFixed(1)},${y.toFixed(1)} fora de uma casa entalhada`); continue; }
    // (its footprint: the matrix's scale along X and Z, turned; every corner inside its tile's column or 2,5 m over the ground there)
    M4.fromArray(p.m); M4.decompose(V, Qt, Sc); const half = Math.max(Sc.x, Sc.z) * 0.5;
    for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const qx = X + dx * half * 0.7, qz = Z + dz * half * 0.7; const j = W.idx(G.clamp(qx / TL, 0, N - 1), G.clamp(qz / TL, 0, N - 1)); if (W.walkable(j) && Y + 0.1 < W.hAt(qx / TL, qz / TL) * HM + 2.5 && p.shape !== 'arco0') { bad.push(`${p.shape} em ${x.toFixed(1)},${y.toFixed(1)} sobre a casa onde se anda ${j % N},${(j / N) | 0} a ${(Y - W.hAt(qx / TL, qz / TL) * HM).toFixed(1)} m`); break; } }
  }
  // (the stones of the world: the very matrices of the shape the feet stand on)
  let sameStone = 0, stones = 0; for (const r of S.rocks.values()) { const x0 = Math.floor(r.x / 16) * 16, y0 = Math.floor(r.y / 16) * 16; const ps = G3.piecesOf(x0, y0, 16).filter(p => p.shape === 'pedra0'); for (const st of G.Space.stones(r)) { stones++; E.set(0, -st.ry, 0, 'YXZ'); Qt.setFromEuler(E); M4.compose(V.set(st.X, st.Y, st.Z), Qt, Sc.set(st.sx, st.sy, st.sz)); if (ps.some(p => p.m.every((v, k) => Math.abs(v - M4.elements[k]) < 1e-4))) sameStone++; } if (stones > 300) break; }
  R3.setQuality('media');
  ok('v3', !bad.length && sameStone === stones && nForm > 50, `${nStone} pedras do mundo e lascas, ${nForm} formações, ${nLip} pedras do lábio das bocas: ${bad.length} fora do lugar${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}; das ${stones} pedras do mundo conferidas, ${sameStone} na forma exata que o corpo pisa`);
}

if (on('v4')) {
  S = alpino(); R3.setQuality('ultra'); const o = [0, 0, 0]; let deep = 0, folds = 0, out = 0, n = 0, worstD = 0;
  const tmax = Math.max(...Ge.ROCKS.map(R => R.t[1]));
  for (let i = 0; i < N * N; i++) { if (!Ge.carves(i)) continue; const x = i % N, y = (i / N) | 0; n++;
    // (up the slope through the tile's middle: the drawn face always higher the higher one goes)
    const gx = W.hAt(x + 0.7, y + 0.5) - W.hAt(x + 0.3, y + 0.5), gz = W.hAt(x + 0.5, y + 0.7) - W.hAt(x + 0.5, y + 0.3); const gl = Math.hypot(gx, gz) || 1; const ux = gx / gl, uz = gz / gl;
    // (a fold: the face going back into the hill — the return under a cornice — and down at once; the cornice itself goes back and up)
    let pY = null, pH = null; for (let t = -0.5; t <= 0.5; t += 1 / 32) { const px = x + 0.5 + ux * t, py = y + 0.5 + uz * t; if (Math.floor(px) !== x || Math.floor(py) !== y) continue; Ge.cliffAt(px, py, o);
      const Y = W.hAt(px, py) * HM + o[0], Hh = (px * ux + py * uz) * TL + o[1] * ux + o[2] * uz; if (pY !== null && Y < pY - 0.02 && Hh < pH - 0.005) folds++; pY = Y; pH = Hh; if (Math.abs(o[0]) > worstD) worstD = Math.abs(o[0]); if (Math.abs(o[0]) > tmax) deep++;
      // (pushed out of its tile's column onto a tile that is not carved: over the ground one walks)
      const X = px + o[1] / TL, Z = py + o[2] / TL; if (W.inb(X, Z) && !Ge.carves(W.idx(X, Z))) out++; } }
  R3.setQuality('media');
  ok('v4', !deep && !folds && !out, `${n} casas entalhadas, pela encosta: ${folds} dobras (a face voltando para dentro e descendo de uma vez), ${deep} pontos mais fundos que uma camada (a maior ${worstD.toFixed(2)} m; a camada mais grossa ${tmax} m), ${out} pontos empurrados sobre uma casa não entalhada`);
}

if (on('v5')) {
  const res = []; let good = true;
  for (const [type, want] of [['continente', 1], ['ilha', 0], ['arquipelago', 0]]) {
    S = M.novo({ seed: SEED, type, size: 128, tribes: 2, temper: 'normal', clima: 'variado', relevo: 'alpino' }); N = G.N; const L = N * TL;
    const g = G3.horGeo(L / 2 * 0.98, 1300, 28, 360), h = G3.horGeo(1300, 9000, 28, 360); let inside = 0, top = 0, snowy = 0, tri = 0;
    for (const geo of [g, h]) { if (!geo) continue; const P = geo.attributes.position.array, I = geo.index.array, A = geo.attributes.aHor.array; tri += I.length / 3;
      for (let k = 0; k < I.length; k += 3) { const a = I[k], b = I[k + 1], c = I[k + 2]; const cx = (P[a * 3] + P[b * 3] + P[c * 3]) / 3, cz = (P[a * 3 + 2] + P[b * 3 + 2] + P[c * 3 + 2]) / 3; if (cx > 10 && cz > 10 && cx < L - 10 && cz < L - 10) inside++; }
      for (let v = 0; v < P.length / 3; v++) { top = Math.max(top, P[v * 3 + 1]); if (P[v * 3 + 1] > A[v * 4]) snowy++; } }
    const ok1 = want ? tri > 1000 && !inside && top > 300 && snowy > 0 : tri === 0; good = good && ok1;
    res.push(`${type}: ${tri} triângulos além da borda${want ? `, ${inside} dentro do mapa, o mais alto a ${Math.round(top)} m, ${snowy} pontos acima da linha da neve` : ''}`);
  }
  ok('v5', good, res.join('; '));
}

if (on('v6')) {
  S = alpino(); N = G.N; R3.setQuality('alta'); G.Ground3D.init(THREE); G.Ground3D.full();
  const fl = []; for (const r of S.rocks.values()) { fl.push(...R3.floraCheck(r.x, r.y, 6)); if (fl.length > 5) break; }
  let gb = { n: 0, bad: 0, fbad: 0, snowBad: 0, paleBad: 0 }; for (let k = 0; k < 6; k++) { const c = G.Ground3D.check(16 + k * 18, 20 + k * 15, 14, 120); for (const f in gb) gb[f] += c[f]; }
  let ge = 0; const em = G.Ground3D.geoMap().image.data; for (let q = 0; q < 400; q++) { const i = Math.floor(G.hash(q * 17 + 3) * N * N); const w = G.Ground3D.geoOf(i, i % N, (i / N) | 0); if (w.some((v, k) => v !== em[i * 4 + k])) ge++; }
  const gc = G3.check(); R3.setQuality('media');
  ok('v6', !fl.length && !gb.bad && !gb.fbad && !gb.snowBad && !gb.paleBad && !ge && !gc.length, `as plantas em volta das pedras (R3.floraCheck): ${fl.length}${fl.length ? ' (' + fl[0] + ')' : ''}; o chão (Ground3D.check, ${gb.n} casas): ${JSON.stringify(gb)}; o mapa da rocha contra o mundo: ${ge} de 400 casas diferentes; o relevo (Geo3D.check): ${gc.length}${gc.length ? ' (' + gc[0] + ')' : ''}`);
}

const e = M.erros(); ok('erros', !Object.keys(e.mod).length && !e.console.length, `módulos ${JSON.stringify(e.mod)}; console ${e.console.length}${e.console.length ? ' (' + e.console[0] + ')' : ''}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
