// monumental: o Coliseu no 3D, com o corpo e a câmera — a parte E da Arquitetura Monumental (1ª rodada):
//   node qa/visual/monumental.js [PASTA_DAS_FOTOS]       (padrão: qa/monumental/fotos)
//   PARTE=node (só a parte em Node: segundos) · PARTE=navegador (só as fotos e o quadro) · sem PARTE: as duas, uma depois da outra
// O Coliseu fundado pela mão do deus em Roma da metrópole — G.Village.handFound(set, 'maravilha', 'maravilha', { built: true,
// R: 60 }) —, com a forma do M1 se o povo já a sabe, senão a de teste (qa/visual/coliseu-teste.js). Onde o handFound põe o lote, o
// chão pode ter mais desnível do que o pódio da forma cobre (3 m, o combinado da equipe; o terreno das cidades é do C): então a mão
// do deus aplaina o lote e uma praça de 4 casas em volta, com mais 4 de transição, só na prova, antes de fundar (dito na saída).
// Parte 1 (Node: o 3D sem placa — qa/visual/tres-node.js —, o corpo e a câmera quadro a quadro, como o jogo):
//   1. a forma e o 3D: o lote e a forma do mesmo tamanho, a altura; os triângulos perto (o detalhe fino) e longe, por peça, cada um
//      no seu teto; o tempo de fazer o pedaço; a silhueta de longe do tamanho da forma (a caixa dela contra a do que a forma cobre)
//   2. os pedaços do mapa: o Coliseu passa do pedaço do seu canto; o detalhe fino contado pela beira de tudo o que o pedaço desenha
//      (o corpo junto da ponta de lá do Coliseu); o pedaço do canto pedido perto com os que o Coliseu toca (Realm.spillOf)
//   3. a câmera de fora: diante da fachada, olhando para cima (o olhar mais alto), o topo dela e a cabeça no quadro, a câmera longe
//      do corpo (a distância livre, Cam3D.cur)
//   4. a câmera dentro, posta num ponto de corpo: no meio da arena (quatro rumos, e de 8 e 11 m), na beira dela e no pódio, a
//      distância livre (inteira no meio) e a câmera nunca na pedra da forma (Build3D.stoneAt) nem no que é sólido (Cam3D.solid)
//   5. o corpo, pela planta: entra pela entrada, sobe os lances ao piso de onde se assiste e fica nele 10 s (o mundo não o tira dali:
//      L-550), empurra contra o parapeito e anda ao longo dele sem cair, senta para assistir (o verbo «lugar»), levanta e segue no piso
//   6. o verificador limpo, sem erro de módulo
// Parte 2 (o navegador, o 3D desenhado por software — lento: poucas fotos, pequenas):
//   7. as fotos em JPG: de fora (o corpo diante da fachada), da arena olhando as arquibancadas, do alto de um anel
//   8. o quadro do Modo Encarnado (a medida do e8 do encarna: simulação + 3D, 90 quadros de 16 ms na qualidade média, mediana e
//      p95) com o corpo diante do lugar do Coliseu — antes de fundá-lo e com ele à vista —, as chamadas e os triângulos; alvo: mediana
//      ≤ 13 ms com o Coliseu — ou, com a máquina ocupada (os ms do 3D por software valem pouco: T-433), não acima da de antes
//   9. na qualidade leve (um pedaço em volta), o corpo no pedaço além do da ponta de lá do Coliseu: o pedaço do canto dele perto
//      (sem a silhueta de longe no lugar do prédio inteiro)
//   10. sem erro de página nem aviso no console
const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'qa', 'monumental', 'fotos'));
const PARTE = process.env.PARTE || '';

// ------------------------------ what both parts share (serialized into the page: only G) ------------------------------
function HELP(G) {
  const H = {};
  // (where the god's hand founds the lot: handFound's own search — the lot and the ring round it dry, free of buildings and walls,
  // no main street nor fire on the lot —, from the town's middle out)
  H.siteOf = function (set, n, R) {
    const S = G.S, N = G.N; const ox = Math.floor(set.cx), oy = Math.floor(set.cy);
    const free = (x, y) => { for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return false; const i = ty * N + tx;
      if (S.occ[i] || S.wall[i] || S.type[i] < G.T.SAND) return false; if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0)) return false; } return true; };
    for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - Math.floor(n / 2), y = oy + dy - Math.floor(n / 2); if (free(x, y)) return [x, y]; }
    return null;
  };
  // (the ground's rise under a lot and the ring round it, in metres)
  H.drop = (x, y, n) => (G.W.maxH(x - 1, y - 1, n + 2, n + 2) - G.W.minH(x - 1, y - 1, n + 2, n + 2)) * G.Space.HM;
  // the god's hand levels the ground of a lot at the height of its middle, and a square of P0 tiles round it, easing F more to the
  // ground as it was — never under a building, a wall or the water —; the world told as after the god raises land (miracles.js)
  H.aplainar = function (x, y, n) {
    const S = G.S, W = G.W, N = G.N, V = N + 1, Hh = S.H; const hs = []; for (let vy = y; vy <= y + n; vy++) for (let vx = x; vx <= x + n; vx++) hs.push(Hh[vy * V + vx]); hs.sort((a, c) => a - c); const h0 = hs[hs.length >> 1];
    const F = 4, P0 = 4, E = P0 + F + 1; const beyond = (vx, vy) => Math.max(x - P0 - vx, vx - (x + n + P0), y - P0 - vy, vy - (y + n + P0), 0);
    const busy = (vx, vy) => { for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) { const tx = vx + dx, ty = vy + dy; if (!W.inb(tx, ty)) return true; const i = ty * N + tx; if (S.occ[i] || S.type[i] <= G.T.RIVER || S.wall[i]) return true; } return false; };
    for (let vy = y - E; vy <= y + n + E; vy++) for (let vx = x - E; vx <= x + n + E; vx++) {
      if (vx < 1 || vy < 1 || vx >= N || vy >= N) continue; const d = beyond(vx, vy); const lot = vx >= x - 1 && vy >= y - 1 && vx <= x + n + 1 && vy <= y + n + 1; if (!lot && busy(vx, vy)) continue;
      const t = Math.min(1, d / F), k = t * t * (3 - 2 * t); Hh[vy * V + vx] = h0 + (Hh[vy * V + vx] - h0) * k; }
    G.Relief.fixArea(x - E - 1, y - E - 1, x + n + E + 1, y + n + E + 1); S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); W.touchWalk(); G.Save.computeDistances();
    for (let ty = y - E - 1; ty <= y + n + E + 1; ty++) for (let tx = x - E - 1; tx <= x + n + E + 1; tx++) if (W.inb(tx, ty)) G.Nature.markDirty(ty * N + tx);
    for (const v of S.villagers.values()) if (Math.abs(v.x - (x + n / 2)) < n / 2 + E + 2 && Math.abs(v.y - (y + n / 2)) < n / 2 + E + 2) G.Vg.reground(v);
    return h0 * G.Space.HM;
  };
  // the Colosseum of the town named, founded whole by the god's hand where handFound puts it (R tiles round its middle at most) —
  // the ground levelled first where it rises more than the form's podium covers (3 m)
  H.found = function (name, R) {
    const S = G.S; const set = [...S.settlements.values()].find(s => s.name === name); if (!set) return { why: 'não há ' + name + ' neste mundo' };
    const st = G.Escala.steps('maravilha').find(s => s.id === 'maravilha'); const n = st.n; const site = H.siteOf(set, n, R); if (!site) return { why: 'nenhum lote livre de ' + n + ' casas a ' + R + ' do meio de ' + name };
    const drop0 = H.drop(site[0], site[1], n); const h0 = drop0 > 3 ? H.aplainar(site[0], site[1], n) : null;
    G.inSim++; let b; try { b = G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, x: site[0] + Math.floor(n / 2), y: site[1] + Math.floor(n / 2), R: 0 }); } finally { G.inSim--; }
    if (!b) return { why: 'o handFound não fundou no lote ' + site };
    return { b, set, site, n, drop0: +drop0.toFixed(1), drop1: +H.drop(site[0], site[1], n).toFixed(1), h0, teste: !!G.ColiseuTeste };
  };
  // (the form's numbers the proofs read, in the world's metres — a drum or the arcade of the split oval (M1), a round arena or the
  // sand —: the middle (the arena's), the facade's outline and height, the arena's edge and its sand's height, the podium's height)
  H.numbers = function (b) {
    const F = G.Build3D.formOf(b); const T = G.Space.TILE; const p = G.Space.planNow(b); const pl = G.Space.plinth(b); const TAU = Math.PI * 2;
    const side = G.Build3D.formSide(b, G.Build3D.shellOf(b)); const W = (u, v) => { const q = G.Forma.toLot(side, F.L, u, v); return [b.x * T + q[0], b.y * T + q[1]]; };
    const drum = F.els.find(e => e.k === 'tambor'), arc = F.els.find(e => e.k === 'arcada'), sand = F.els.find(e => e.k === 'arena' || e.k === 'areia');
    const round = (c, r) => Array.from({ length: 64 }, (_, k) => W(c[0] + Math.cos(k / 64 * TAU) * r, c[1] + Math.sin(k / 64 * TAU) * r));
    const face = drum ? round(drum.c, drum.r) : arc.pts.map(q => W(q[0], q[1])); const edge = sand.k === 'arena' ? round(sand.c, sand.r) : sand.pts.map(q => W(q[0], q[1]));
    const yPod = Math.min(...F.els.filter(e => e.k === 'cavea').map(e => Math.min(...e.aneis.map(a => a[1]))));
    // (the box of what the form covers from above — the facade and its feet, Forma.foot: the square of the Colosseum of the M1 is the lot)
    const box = [Infinity, Infinity, -Infinity, -Infinity]; const grow = q => { box[0] = Math.min(box[0], q[0]); box[1] = Math.min(box[1], q[1]); box[2] = Math.max(box[2], q[0]); box[3] = Math.max(box[3], q[1]); };
    face.forEach(grow); for (const s of G.Forma.foot(F)) { const r = s.k === 'rect' ? s.r : [s.c[0] - s.r, s.c[1] - s.r, s.c[0] + s.r, s.c[1] + s.r]; grow(W(r[0], r[1])); grow(W(r[2], r[3])); }
    return { F, p, pl, side, C: W(sand.c[0], sand.c[1]), face, edge, box, H: drum ? drum.y1 : arc.y1, sandY: sand.y, yPod, base: pl.y0, bays: drum ? drum.arcos : arc.pts.length, kind: drum ? 'tambor' : 'arcada' };
  };
  // (how far an outline reaches from a middle along a way — its farthest point that way —; the point of an outline a share round it)
  H.reach = (pts, C, o) => Math.max(...pts.map(q => (q[0] - C[0]) * o[0] + (q[1] - C[1]) * o[1]));
  return H;
}

// ================================ part 1: Node ================================
function nodePart() {
  const T = require(path.join(__dirname, 'tres-node.js'));
  const { G, M, THREE } = T.load({ extra: ['qa/visual/coliseu-teste.js', 'qa/visual/corpo-qa.js'] });
  const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumental ${name} | ${info}`); if (!c) fails.push(name); };
  M.pronto('metropole');
  const S = G.S, In = G.Interiors, Sp = G.Space, TL = Sp.TILE, B3 = G.Build3D, R3 = G.Realm;
  const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const H = HELP(G); const f = H.found('Roma', 60);
  if (!f.b) { ok('0. o Coliseu fundado em Roma', false, f.why); return fails; }
  const b = f.b; const nm = H.numbers(b); const F = nm.F;
  console.log(`(o Coliseu ${f.teste ? 'DE TESTE (qa/visual/coliseu-teste.js: a forma do M1 ainda não está no jogo)' : 'do M1'} #${b.id} em ${b.x},${b.y}, lote de ${b.w} casas, a fachada ${nm.kind} de ${nm.bays} baias; o chão do lote: ${f.drop0} m de desnível${f.h0 !== null ? `, aplainado pela mão do deus a ${f.h0.toFixed(1)} m (agora ${f.drop1} m)` : ''})`);
  // ---------------- 1. the form and its 3D ----------------
  const tetoPerto = 60000, tetoLonge = 2000; // (triangles: one monument of 40 m, near at the finest and far)
  const fx = nm.face.map(q => q[0]), fz = nm.face.map(q => q[1]); const fbox = [Math.min(...fx), Math.min(...fz), Math.max(...fx), Math.max(...fz)];
  ok('1. a forma do tamanho do lote', F.L === b.w * TL && F.top >= 18 && fbox[2] - fbox[0] <= F.L + 0.01 && fbox[3] - fbox[1] <= F.L + 0.01, `lote ${b.w * TL} m, forma ${F.L} m, altura ${F.top.toFixed(1)} m (a fachada ${nm.H.toFixed(1)} m), a fachada ${(fbox[2] - fbox[0]).toFixed(1)} × ${(fbox[3] - fbox[1]).toFixed(1)} m`);
  const of0 = G.Forma.of; const per = [];
  for (const k of [...new Set(F.els.map(e => e.k))]) { G.Forma.of = (t, s, n) => (t === b.type && n === b.w ? Object.assign({}, F, { els: F.els.filter(e => e.k === k) }) : of0(t, s, n)); per.push(`${k} ${(B3.cost(b).solid / 1000).toFixed(1)}`); }
  G.Forma.of = of0;
  const cost = B3.cost(b); const C = 16; const cx0 = Math.floor(b.x / C) * C, cy0 = Math.floor(b.y / C) * C;
  let ms = 1e9; for (let k = 0; k < 3; k++) { const t0 = performance.now(); B3.nearGeo(cx0, cy0, C); ms = Math.min(ms, Math.round(performance.now() - t0)); }
  ok('1. os triângulos perto no teto (o detalhe fino)', cost.solid <= tetoPerto, `${cost.solid} triângulos (teto ${tetoPerto}) — por peça, mil: ${per.join(' · ')}; o pedaço ${cx0 / C},${cy0 / C} feito em ${ms} ms`);
  // (the far figure of the chunk with only this building in it: the far picture of its chunk less the one without it)
  const farOf = () => { const g = B3.farGeo(cx0, cy0, C); return g ? g.attributes.position.count / 3 : 0; };
  const far1 = farOf(); const keep = S.buildings.get(b.id); S.buildings.delete(b.id); const far0 = farOf(); S.buildings.set(b.id, keep);
  // (the far figure alone — the chunk's far picture with only this building in the world —: its box against the facade's)
  const all = S.buildings; S.buildings = new Map([[b.id, b]]); const fg = B3.farGeo(cx0, cy0, C); S.buildings = all; fg.computeBoundingBox(); const bb = fg.boundingBox;
  const xb = nm.box; const dBox = Math.max(Math.abs(bb.min.x - xb[0]), Math.abs(bb.min.z - xb[1]), Math.abs(bb.max.x - xb[2]), Math.abs(bb.max.z - xb[3])), dTop = Math.abs(bb.max.y - (nm.base + nm.H));
  ok('1. a silhueta de longe no teto e do tamanho da forma', far1 - far0 <= tetoLonge && dBox <= 0.5 && dTop <= 0.5, `${far1 - far0} triângulos longe (teto ${tetoLonge}); a caixa dela ${(bb.max.x - bb.min.x).toFixed(1)} × ${(bb.max.z - bb.min.z).toFixed(1)} m até ${(bb.max.y - nm.base).toFixed(1)} m — a da forma de cima ${(xb[2] - xb[0]).toFixed(1)} × ${(xb[3] - xb[1]).toFixed(1)} m, a fachada a ${nm.H.toFixed(1)} m (a diferença: ${dBox.toFixed(2)} m de lado, ${dTop.toFixed(2)} m no alto)`);
  // ---------------- 2. the chunks ----------------
  const own = [Math.floor(b.x / C), Math.floor(b.y / C)], far = [Math.floor((b.x + b.w - 1) / C), Math.floor((b.y + b.h - 1) / C)];
  const sp = R3.spillOf(); const spilled = []; for (let cy = own[1]; cy <= far[1]; cy++) for (let cx = own[0]; cx <= far[0]; cx++) if (cx !== own[0] || cy !== own[1]) spilled.push([cx, cy, !!(sp.get(cy * 4096 + cx) || new Set()).has(own[1] * 4096 + own[0])]);
  ok('2. o Coliseu atravessa pedaços: cada pedaço que ele toca chama o do canto', spilled.length > 0 && spilled.every(q => q[2]), `canto no pedaço ${own}; toca ${spilled.map(q => q[0] + ',' + q[1] + (q[2] ? '' : ' (sem)')).join(' ') || 'nenhum outro'}`);
  // ---------------- the body ----------------
  const RDT = 1 / 30; const IN = G.Avatar.input; const st = () => G.Avatar.state();
  const cam = new THREE.PerspectiveCamera(58, 1000 / 620, 0.12, 1600);
  const camU = () => { const pos = G.Avatar.pos(); if (pos) G.Cam3D.update(RDT, Object.assign({ h: 1.75 }, pos), cam); };
  const frame = () => { G.debug.step(RDT * Sp.TIME); G.Avatar.frame(RDT); camU(); };
  const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
  const walkTo = (X, Z, max, near) => { let still = 0, last = [st().X, st().Z];
    for (let k = 0; k < (max || 600); k++) { const dx = X - st().X, dz = Z - st().Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
      IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); if (st().loco === 'stair') for (let j = 0; j < 600 && st().loco === 'stair'; j++) frame();
      if (Math.hypot(st().X - last[0], st().Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st().X, st().Z]; }
    stop(); for (let q = 0; q < 6; q++) frame(); return Math.hypot(X - st().X, Z - st().Z); };
  const p = nm.p, e = p.entrance, bx = b.x * TL, bz = b.y * TL, at = (x, z) => [bx + x, bz + z], c = nm.C, base = nm.base;
  const out = [e.out[0] - e.x, e.out[1] - e.z]; const ol = Math.hypot(out[0], out[1]) || 1; const o = [out[0] / ol, out[1] / ol]; // (out of the way in, to the street)
  const face = H.reach(nm.face, c, o); // (the facade before the way in: how far from the middle)
  const v = [...S.villagers.values()].filter(q => q.set === f.set.id && q.age >= 18 && q.age < 55 && !q.inside && G.Possess.can(q).ok).sort((a2, b2) => a2.id - b2.id)[0];
  const stand = [c[0] + o[0] * (face + 8.8), c[1] + o[1] * (face + 8.8)];
  G.inSim++; G.Vg.endTask(v); v.x = stand[0] / TL; v.y = stand[1] / TL; v.path = null; G.inSim--;
  const yawIn = Math.atan2(-o[1], -o[0]); // (facing the façade)
  const took = G.Possess.take(v); G.Avatar.attach(v, yawIn); G.Cam3D.attach(G.Avatar.pos(), yawIn); for (let k = 0; k < 6; k++) frame();
  // ---------------- 3. the camera outside ----------------
  const eye = (yaw, pitch, dist, n) => { G.Cam3D.OPT.follow = false; st().yaw = yaw; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; for (let k = 0; k < (n || 45); k++) frame(); cam.updateMatrixWorld(); };
  const ndc = (X, Y, Z) => new THREE.Vector3(X, Y, Z).project(cam);
  const topFront = () => [c[0] + o[0] * face, base + nm.H, c[1] + o[1] * face];
  const look = (pitch, dist) => { eye(yawIn, pitch, dist); const t = ndc(...topFront()), h = ndc(st().X, st().Y + 1.7, st().Z); return { pitch, dist, cur: +G.Cam3D.cur.toFixed(2), top: +t.y.toFixed(2), head: +h.y.toFixed(2), alt: +(cam.position.y - st().Y).toFixed(2) }; };
  const L0 = look(0.26, 4.8), L1 = look(-1.05, 4.8), L2 = look(-1.05, 11);
  const inFrame = q => q.top <= 1 && q.head >= -1 && q.head <= 1;
  ok('3. de fora, olhando para cima: o topo da fachada e a cabeça no quadro, a câmera longe do corpo', took.ok && inFrame(L1) && inFrame(L2) && L1.cur >= 0.85 * 4.8 && L2.cur >= 4.4, `o corpo a ${(Math.hypot(c[0] - st().X, c[1] - st().Z) - face).toFixed(1)} m da fachada de ${nm.H.toFixed(0)} m; olhar normal: o topo em ${L0.top} (fora do quadro além de 1), cur ${L0.cur} m; para cima a 4,8 m: o topo em ${L1.top}, a cabeça em ${L1.head}, cur ${L1.cur} m, a câmera a ${L1.alt} m do chão; para cima a 11 m: o topo em ${L2.top}, a cabeça em ${L2.head}, cur ${L2.cur} m`);
  G.Cam3D.OPT.follow = true; G.Cam3D.pitch = 0.26; G.Cam3D.dist = 4.8;
  // ---------------- 4. the camera inside, alone (a body's point given to it, as the 3D gives it the body's: the eye is the proof
  // here, not the walk) — in the arena's middle four ways and further, at its edge with the rows behind, on the podium; never in
  // the form's stone ----------------
  const inStone = () => B3.stoneAt(b, cam.position.x, cam.position.y, cam.position.z) || G.Cam3D.solid(cam.position.x, cam.position.y, cam.position.z);
  const camAt = (X, Y, Z, yaw, pitch, dist) => { const body = { X, Y, Z, yaw, speed: 0, ground: true, h: 1.75 }; G.Cam3D.attach(body, yaw);
    G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; for (let k = 0; k < 45; k++) G.Cam3D.update(RDT, body, cam); cam.updateMatrixWorld(); return { cur: G.Cam3D.cur, stone: inStone() }; };
  // (a point of the arena's edge, k eighths round it, moved d toward the middle — out of it with d < 0)
  const edgeAt = (k, d) => { const q = nm.edge[Math.floor(k * nm.edge.length / 8) % nm.edge.length]; const l = Math.hypot(q[0] - c[0], q[1] - c[1]) || 1; return [q[0] + (c[0] - q[0]) / l * d, q[1] + (c[1] - q[1]) / l * d]; };
  const yA = base + nm.sandY + 0.012, yP = base + nm.yPod + 0.012; const inside = []; let worst = 99, stoneHit = 0;
  for (const [yaw, dist] of [[0, 4.8], [Math.PI / 2, 4.8], [Math.PI, 4.8], [-Math.PI / 2, 4.8], [yawIn, 8], [yawIn + Math.PI, 11]]) {
    const q = camAt(c[0] - o[0] * 1.5, yA, c[1] - o[1] * 1.5, yaw, 0.12, dist); worst = Math.min(worst, q.cur / dist); if (q.stone) stoneHit++; inside.push(`${dist}→${q.cur.toFixed(1)}`); }
  // (at the arena's edge, facing its middle: the eye behind, over the podium and the rows — held by them, never in them)
  const edgeC = []; for (let k = 0; k < 8; k++) { const p0 = edgeAt(k + 0.3, 1.2); const q = camAt(p0[0], yA, p0[1], Math.atan2(c[1] - p0[1], c[0] - p0[0]), 0.15, 4.8); if (q.stone) stoneHit++; edgeC.push(q.cur.toFixed(1)); }
  const podC = []; for (let k = 0; k < 4; k++) { const p0 = edgeAt(2 * k + 0.6, -0.6); const q = camAt(p0[0], yP, p0[1], Math.atan2(c[1] - p0[1], c[0] - p0[0]), 0.2, 4.8); if (q.stone) stoneHit++; podC.push(q.cur.toFixed(1)); }
  ok('4. dentro: na arena a câmera com a distância inteira; na beira dela e no pódio, segura pelas fileiras e nunca na pedra', worst >= 0.95 && !stoneHit, `no meio da arena (pedida→livre, m): ${inside.join(', ')}; na beira da arena, as fileiras atrás: ${edgeC.join(', ')} m; no pódio: ${podC.join(', ')} m; câmera na pedra: ${stoneHit}`);
  G.Cam3D.OPT.follow = true; G.Cam3D.dist = 4.8; G.Cam3D.pitch = 0.26; G.Cam3D.attach(G.Avatar.pos(), st().yaw);
  // ---------------- 5. the body: in by the way in, up the flights to the storey one watches from, along its parapet, seated ----------------
  // (by the plan: the storey with places to watch from — the podium —, the flights up to it from the way in's storey, nearest the way in first)
  const lvl = () => G.Possess.level(); const y = () => +(st().Y - base).toFixed(2); const lv0 = p.entryLv || 0;
  const watchLv = (p.levels.map(l => l.lv).find(lv => In.freeNear(b, lv, c[0] - bx, c[1] - bz, 80).some(q => q.use === 'assistir')));
  const route = (() => { const ups = p.stairs.filter(q => q.kind !== 'degraus' && q.lv1 > q.lv0); const dE = s => Math.hypot(s.a[0] - e.x, s.a[1] - e.z);
    const seen = new Map([[lv0, []]]); const queue = [lv0];
    while (queue.length) { const lv = queue.shift(); for (const s of ups.filter(q => q.lv0 === lv).sort((a2, b2) => dE(a2) - dE(b2))) if (!seen.has(s.lv1)) { seen.set(s.lv1, seen.get(lv).concat([s])); queue.push(s.lv1); } }
    return seen.get(watchLv) || null; })();
  const levelY = lv => (p.levels.find(l => l.lv === lv) || { y: 0 }).y;
  walkTo(...at(e.x + o[0] * 1.2, e.z + o[1] * 1.2), 900); walkTo(...at(e.x - o[0] * 1.0, e.z - o[1] * 1.0), 900);
  const inArch = { lv: lvl(), x: +(st().X - bx).toFixed(2), z: +(st().Z - bz).toFixed(2) }; const climbs = [];
  for (const s of route || []) { if (lvl() !== s.lv0) break; walkTo(...at(s.a[0], s.a[1]), 1500); walkTo(...at(s.b[0] + s.dir[0] * 0.8, s.b[1] + s.dir[1] * 0.8), 1200); climbs.push(`${s.lv0}→${s.lv1}: piso ${lvl()} a ${y()} m`); }
  const up1 = { lv: lvl(), y: y() }; let stay = { lv: up1.lv, y: up1.y, out: 0 };
  if (up1.lv === watchLv) for (let k = 0; k < 300; k++) { frame(); if (lvl() !== watchLv || Math.abs(y() - up1.y) > 0.05) { stay = { lv: lvl(), y: y(), out: k }; break; } }
  const L550 = ' — o mundo o tirou do prédio: a correção do possess.js pedida ao líder (L-550)';
  const flightLen = s => Math.hypot(s.r[2] - s.r[0], s.r[3] - s.r[1]);
  ok('5. sobe os lances ao piso de assistir e fica nele 10 s (o mundo não o tira: L-550)', !!route && inArch.lv === lv0 && up1.lv === watchLv && Math.abs(up1.y - levelY(watchLv)) < 0.1 && !stay.out, `na entrada piso ${inArch.lv}; o piso de assistir ${watchLv} a ${levelY(watchLv).toFixed(2)} m, pelos lances ${(route || []).map(s => `${s.lv0}→${s.lv1} (${(levelY(s.lv1) - levelY(s.lv0)).toFixed(1)} m em ${flightLen(s).toFixed(1)} m)`).join(', ') || 'nenhum'}: ${climbs.join('; ') || '-'}${up1.lv !== watchLv ? L550 : stay.out ? `; tirado no quadro ${stay.out}: piso ${stay.lv}, a ${stay.y} m${L550}` : '; 10 s nele'}`);
  // (along its edge and against its parapet: toward the arena's middle until the feet stop, then a few metres either way along it)
  const rOf = () => Math.hypot(st().X - c[0], st().Z - c[1]); let push = null, along = null;
  if (lvl() === watchLv) { IN.camYaw = Math.atan2(c[1] - st().Z, c[0] - st().X); IN.mz = 1; for (let k = 0; k < 240; k++) frame(); stop(); for (let k = 0; k < 6; k++) frame(); push = { r: +rOf().toFixed(2), lv: lvl(), y: y() };
    let yMin = 99; const lvs = new Set(); const tang = Math.atan2(c[1] - st().Z, c[0] - st().X) + Math.PI / 2;
    for (const sg of [1, -1, -1, 1]) { IN.camYaw = tang + (sg < 0 ? Math.PI : 0); IN.mz = 1; for (let k = 0; k < 60; k++) { frame(); yMin = Math.min(yMin, y()); lvs.add(lvl()); } stop(); frame(); }
    along = { yMin, lvs: [...lvs], r: +rOf().toFixed(2) }; }
  ok('5. no piso de assistir, contra o parapeito e ao longo dele, sem cair', !!push && push.lv === watchLv && Math.abs(push.y - up1.y) < 0.05 && !!along && along.lvs.length === 1 && along.lvs[0] === watchLv && along.yMin >= up1.y - 0.05, push ? `empurrando para o meio da arena: parado a ${push.r} m do meio, piso ${push.lv}, a ${push.y} m; ao longo dele 4 trechos de 2 s: o mais baixo a ${along.yMin.toFixed(2)} m, pisos ${along.lvs.join(',')}` : 'o corpo não chegou ao piso de assistir');
  // the verb 'lugar': the body takes a place to watch from, and gets up again
  let seat = null, after = null;
  if (lvl() === watchLv) {
    const pls = In.freeNear(b, watchLv, st().X - bx, st().Z - bz, 12).filter(q => q.use === 'assistir'); const q0 = pls[0];
    if (q0) { const sf = In.standFor ? In.standFor(b, q0, st().X - bx, st().Z - bz) : [q0.x, q0.z]; walkTo(...at(sf[0], sf[1]), 600, 0.5); }
    let best = null; for (let k = 0; k < 30 && !(best && best.id === 'lugar'); k++) { const q = In.freeNear(b, watchLv, st().X - bx, st().Z - bz, 3).filter(r => r.use === 'assistir')[0]; if (!q) break; const ya = Math.atan2(bz + q.z - st().Z, bx + q.x - st().X); IN.camYaw = ya; st().yaw = ya; best = G.Interact.best(); frame(); }
    if (best && best.id === 'lugar') { G.Interact.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame(); }
    const u = G.Possess.useOf(); seat = { label: best ? best.label : 'nada', seated: !!(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1), use: u ? u.use : null, st: u ? u.st : '' };
    IN.camYaw = st().yaw + Math.PI; IN.mz = 1; for (let k = 0; k < 12; k++) frame(); stop(); for (let k = 0; k < 90; k++) frame(); after = { lv: lvl(), y: y(), seat: !!G.Avatar.seatNow() }; }
  ok('5. senta para assistir (o verbo «lugar»), levanta e segue no piso', !!seat && seat.seated && seat.use === 'assistir' && !!after && after.lv === watchLv && !after.seat && Math.abs(after.y - up1.y) < 0.6, seat ? `o E: «${seat.label}»; tomado: ${seat.seated} (${seat.use || 'sem lugar'}${seat.st ? ', ' + seat.st : ''}); 3 s depois de levantar: piso ${after.lv}, a ${after.y} m${after.lv !== watchLv ? L550 : ''}` : 'o corpo não chegou ao piso de assistir');
  // ---------------- 2. the fine detail by what the chunk draws: the body by the Colosseum's far end ----------------
  G.Possess.release('deus'); G.Avatar.detach();
  { const w = [...S.villagers.values()].filter(q => q.age >= 18 && !q.inside && G.Possess.can(q).ok).sort((a2, b2) => a2.id - b2.id)[0]; const fx = b.x + b.w + 1.5, fy = b.y + b.h + 1.5;
    G.inSim++; G.Vg.endTask(w); w.x = fx; w.y = fy; w.path = null; G.inSim--; G.Possess.take(w); G.Avatar.attach(w, 0); for (let k = 0; k < 4; k++) frame();
    const r = B3.reachOf(cx0, cy0, C); const dOwn = Math.hypot(Math.max(cx0 - w.x, 0, w.x - (cx0 + C)), Math.max(cy0 - w.y, 0, w.y - (cy0 + C))) * TL;
    const fine = B3.fineAt(cx0, cy0, C); const D = 35 * (R3.Q().lod || 1);
    ok('2. junto da ponta de lá do Coliseu, o detalhe fino (pela beira do que o pedaço desenha)', fine && r[2] >= b.x + b.w && r[3] >= b.y + b.h, `o corpo a ${dOwn.toFixed(0)} m do pedaço do canto (o fino até ${D.toFixed(0)} m), junto do Coliseu; o pedaço desenha até ${r[2]},${r[3]}: fino ${fine}`);
    G.Possess.release('deus'); G.Avatar.detach(); }
  // ---------------- 6. the verifier ----------------
  const vb = QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg)); const er = M.erros();
  ok('6. o verificador limpo, sem erro de módulo', !vb.length && !Object.keys(er.mod).length && !er.console.length, `${vb.length ? vb.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; módulos ${JSON.stringify(er.mod)}; console ${er.console.slice(0, 2).join(' | ') || 'limpo'}`);
  return fails;
}

// ================================ part 2: the browser ================================
async function browserPart() {
  const VIS = require(path.join(__dirname, 'vistas.js'));
  fs.mkdirSync(OUT, { recursive: true });
  const { browser, page, errs } = await VIS.open(ROOT, { worlds: ['metropole'], w: 1000, h: 620 });
  const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | monumental ${name} | ${info}`); if (!c) fails.push(name); };
  try {
    await page.addScriptTag({ path: path.join(__dirname, 'coliseu-teste.js') });
    await page.evaluate(`window.__MON = (${HELP.toString()})(window.G)`);
    // the world, and the body in Roma where the god's hand will found the Colosseum: the lot found and levelled first, the body on
    // its square before the way in, facing it — the frame measured there before, with the Colosseum after
    const r0 = await page.evaluate(() => {
      const V = window.__VIS, H = window.__MON; V.open('metropole', 'baixa'); const S = G.S; G.S.time = 0.42;
      const set = [...S.settlements.values()].find(s => s.name === 'Roma'); const n = G.Escala.steps('maravilha').find(s => s.id === 'maravilha').n;
      const site = H.siteOf(set, n, 60); const drop0 = H.drop(site[0], site[1], n); const h0 = drop0 > 3 ? H.aplainar(site[0], site[1], n) : null;
      window.__site = { set: set.id, site, n, drop0, h0 };
      // (the body: a grown-up of Roma, put on the square before the lot's south side — the way in faces the street, found below)
      const v = [...S.villagers.values()].filter(q => q.set === set.id && q.age >= 18 && q.age < 55 && !q.inside && G.Possess.can(q).ok).sort((a, b) => a.id - b.id)[0];
      if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); V.until(() => G.Modes.state === 'GOD', 400, 100); }
      // (on the square before the lot's south side, the nearest open ground)
      let at = null; for (let d = 0; d < 6 && !at; d++) for (const dx of [0, -1, 1, -2, 2]) { const q = [site[0] + n / 2 + dx, site[1] + n + 2.5 + d]; if (G.W.inb(q[0], q[1]) && G.W.walkableXY(q[0], q[1]) && !G.S.treeAt[G.W.idx(q[0], q[1])]) { at = q; break; } }
      if (at) { G.inSim++; G.Vg.endTask(v); v.x = at[0]; v.y = at[1]; v.path = null; G.inSim--; }
      const can = G.Possess.can(v); const went = G.Modes.enter(v); V.until(() => G.Modes.state === 'INC', 300, 100); V.f(6);
      return { ok: G.Modes.state === 'INC', site, drop0: +drop0.toFixed(1), h0, who: v.name, at, can: can.ok ? 'ok' : can.why, went: !!went, state: G.Modes.state };
    });
    if (!r0.ok) { ok('7. o corpo em Roma', false, JSON.stringify(r0)); return fails; }
    // the frame as the e8 measures it (the medium quality, 40 frames, then 90 timed), the camera held facing the lot
    const measure = () => page.evaluate(() => {
      const V = window.__VIS; const st = G.Avatar.state(); const s = window.__site; const T = G.Space.TILE;
      const cx = (s.site[0] + s.n / 2) * T, cz = (s.site[1] + s.n / 2) * T; const yaw = Math.atan2(cz - st.Z, cx - st.X);
      G.Realm.setQuality('media'); V.warm(2); st.yaw = yaw; G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.12; G.Cam3D.dist = 4.8; V.f(40, 33);
      const times = []; for (let k = 0; k < 90; k++) { const t0 = performance.now(); G.Main.frameFor(16); times.push(performance.now() - t0); } times.sort((a, b) => a - b);
      const c = V.count(); G.Realm.setQuality('baixa');
      return { med: +times[45].toFixed(1), p95: +times[85].toFixed(1), calls: c.calls, tris: c.tris };
    });
    const before = await measure();
    const r1 = await page.evaluate(() => {
      const H = window.__MON; const s = window.__site; const set = G.S.settlements.get(s.set);
      G.inSim++; let b; try { b = G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, x: s.site[0] + Math.floor(s.n / 2), y: s.site[1] + Math.floor(s.n / 2), R: 0 }); } finally { G.inSim--; }
      if (!b) return { ok: false }; window.__b = b.id; const nm = H.numbers(b); const e = nm.p.entrance; const dx = e.out[0] - e.x, dz = e.out[1] - e.z, l = Math.hypot(dx, dz) || 1; const o = [dx / l, dz / l];
      const reach = q => H.reach(nm.face, nm.C, q); const dg = [(o[0] - o[1]) / Math.SQRT2, (o[1] + o[0]) / Math.SQRT2];
      window.__nm = { C: nm.C, H: nm.H, base: nm.base, sandY: nm.sandY, e, o, front: reach(o), back: reach([-o[0], -o[1]]), diag: reach(dg), dg };
      return { ok: true, id: b.id, x: b.x, y: b.y, teste: !!G.ColiseuTeste };
    });
    if (!r1.ok) { ok('7. o Coliseu fundado', false, 'o handFound não fundou'); return fails; }
    const after = await measure();
    console.log(`(o Coliseu ${r1.teste ? 'DE TESTE' : 'do M1'} #${r1.id} em ${r1.x},${r1.y}; o chão do lote tinha ${r0.drop0} m de desnível${r0.h0 !== null ? ', aplainado pela mão do deus' : ''}; o corpo: ${r0.who})`);
    const load = require('os').loadavg()[0], cores = require('os').cpus().length;
    // (the ms of a machine drawing 3D by software and shared with other proofs are worth little — T-433: the Colosseum is held to the
    // frame before it in the same run, and to the e8's 13 ms when the machine is free; the calls and the triangles always compare)
    ok('8. o quadro do Modo Encarnado com o Coliseu à vista (a medida do e8, qualidade média): mediana ≤ 13 ms, ou não acima da de antes', after.med <= 13 || after.med <= before.med * 1.15 + 1, `carga da máquina ${load.toFixed(1)} em ${cores} núcleos; antes ${before.med} ms (p95 ${before.p95}), ${before.calls} chamadas, ${(before.tris / 1000).toFixed(0)} mil triângulos → com o Coliseu ${after.med} ms (p95 ${after.p95}), ${after.calls} chamadas, ${(after.tris / 1000).toFixed(0)} mil triângulos`);
    console.log(`DESEMPENHO | monumental | Roma da metrópole, o corpo diante do Coliseu: mediana ${before.med} → ${after.med} ms, p95 ${before.p95} → ${after.p95} ms, chamadas ${before.calls} → ${after.calls}, triângulos ${before.tris} → ${after.tris}`);
    // the photos: the eye's pose set after the game's own (the photos only: what the camera does is the part 1's proof)
    const shot = async (name, pose) => {
      await page.evaluate(p => {
        const V = window.__VIS; const st = G.Avatar.state(); const n = window.__nm; const T = G.Space.TILE;
        if (p.at) { G.Avatar.place(p.at[0] / T, p.at[1] / T); V.f(3); }
        if (p.body) { st.yaw = p.body; }
        G.Realm.setQuality('media'); V.warm(2); G.Cam3D.OPT.follow = false; G.Cam3D.yaw = p.yaw; G.Cam3D.pitch = p.pitch; G.Cam3D.dist = p.dist; G.Cam3D.cur = p.dist;
        window.__cam = p.eye || null; V.f(12); if (p.body) st.yaw = p.body; V.f(2); void n;
      }, pose);
      try { await page.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 72, timeout: 180000 }); } catch (e2) { console.log('(foto ' + name + ' não saiu: ' + e2.message.slice(0, 80) + ')'); }
      await page.evaluate(() => { window.__cam = null; G.Realm.setQuality('baixa'); });
    };
    await page.evaluate(() => { const up = G.Cam3D.update; G.Cam3D.update = function (rdt, body, cam) { up.call(this, rdt, body, cam); const o = window.__cam; if (o) { cam.position.set(o.P[0], o.P[1], o.P[2]); cam.lookAt(o.A[0], o.A[1], o.A[2]); } }; });
    const poses = await page.evaluate(() => {
      const n = window.__nm; const b = G.S.buildings.get(window.__b); const o = n.o, C = n.C;
      const front = [C[0] + o[0] * (n.front + 14), C[1] + o[1] * (n.front + 14)]; const into = Math.atan2(-o[1], -o[0]);
      const mid = [C[0] - o[0] * 2, C[1] - o[1] * 2];
      // (on the facade's top walk, a diagonal's way round, looking down across the arena)
      const P = [C[0] + n.dg[0] * (n.diag - 1.4), n.base + n.H + 1.8, C[1] + n.dg[1] * (n.diag - 1.4)], A = [C[0] - n.dg[0] * 6, n.base + n.sandY + 1, C[1] - n.dg[1] * 6];
      // (in the arena: the eye low on the side of the way in, the hatch behind it, looking up at the stands across)
      const P2 = [C[0] + o[0] * 4.2, n.base + n.sandY + 1.7, C[1] + o[1] * 4.2], A2 = [C[0] - o[0] * n.back, n.base + n.H * 0.5, C[1] - o[1] * n.back];
      return { front, into, mid, P, A, P2, A2, bx: b.x, by: b.y };
    });
    await shot('1-fora', { at: poses.front, body: poses.into, yaw: poses.into, pitch: -0.5, dist: 8 });
    await shot('2-arena', { body: poses.into, yaw: poses.into, pitch: -0.12, dist: 5.5, eye: { P: poses.P2, A: poses.A2 } });
    await shot('3-anel', { yaw: poses.into, pitch: 0.3, dist: 4.8, eye: { P: poses.P, A: poses.A } });
    const pics = ['1-fora', '2-arena', '3-anel'].map(n => { const f = path.join(OUT, n + '.jpg'); return fs.existsSync(f) ? `${n}.jpg ${(fs.statSync(f).size / 1024).toFixed(0)} KB` : `${n}: não saiu`; });
    ok('7. as fotos: de fora, da arena, do alto de um anel', pics.every(q => /KB/.test(q)), `${pics.join(' · ')} em ${OUT}`);
    // 9. the light quality (one chunk round the body): the body in the chunk past the one of the Colosseum's far end — two from the
    // chunk of its corner, which draws it: that chunk near (Realm.spillOf), not the far figure in the place of the whole building
    const r9 = await page.evaluate(() => {
      const V = window.__VIS; const b = G.S.buildings.get(window.__b); const v = G.Possess.body(); const C = 16;
      G.Realm.setQuality('baixa'); const own = [Math.floor(b.x / C), Math.floor(b.y / C)], fc = [Math.floor((b.x + b.w - 1) / C), Math.floor((b.y + b.h - 1) / C)];
      const cands = []; if (fc[0] > own[0]) for (let d = 0; d < 8; d++) cands.push([(fc[0] + 1) * C + 0.5 + d, b.y + b.h / 2]); if (fc[1] > own[1]) for (let d = 0; d < 8; d++) cands.push([b.x + b.w / 2, (fc[1] + 1) * C + 0.5 + d]);
      const at = cands.find(q => G.W.inb(q[0], q[1]) && G.W.walkableXY(q[0], q[1])); if (!at) return { skip: true, own, why: cands.length ? 'sem chão para o corpo além do pedaço da ponta' : 'o Coliseu num pedaço só' };
      G.inSim++; v.x = at[0]; v.y = at[1]; G.inSim--; G.Avatar.attach(v, 0); V.warm(3); V.f(4);
      const bc = [Math.floor(at[0] / C), Math.floor(at[1] / C)]; const edge = Math.max(at[0] - (b.x + b.w), at[1] - (b.y + b.h), 0) * G.Space.TILE;
      return { own, body: bc, near: G.Realm.nearAt(own[0], own[1]), d: Math.max(Math.abs(bc[0] - own[0]), Math.abs(bc[1] - own[1])), edge: +edge.toFixed(0) };
    });
    ok('9. na qualidade leve, além da ponta de lá do Coliseu, o pedaço do canto dele perto', r9.skip || r9.near, r9.skip ? `${r9.why} (${r9.own})` : `o canto no pedaço ${r9.own}, o corpo no ${r9.body} (${r9.d} pedaços dali, a ${r9.edge} m do Coliseu): o do canto ${r9.near ? 'perto' : 'LONGE (a silhueta no lugar do prédio)'}`);
  } finally {
    ok('10. sem erro de página nem aviso no console', !errs.length, errs.slice(0, 3).join(' || ') || 'nenhum');
    await browser.close();
  }
  return fails;
}

(async () => {
  let fails = [];
  if (PARTE === 'node') { fails = nodePart(); console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU'); process.exit(fails.length ? 1 : 0); }
  if (PARTE !== 'navegador') { // (the Node part in a process of its own: nodemundo stands the timers still, which the browser needs)
    try { process.stdout.write(execFileSync(process.execPath, [__filename, OUT], { env: Object.assign({}, process.env, { PARTE: 'node' }), encoding: 'utf8', maxBuffer: 1 << 26 })); }
    catch (e) { process.stdout.write(e.stdout || ''); process.stderr.write(e.stderr || ''); fails.push('parte em Node'); } }
  if (PARTE !== 'node') fails = fails.concat(await browserPart());
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
  process.exit(fails.length ? 1 : 0);
})();
