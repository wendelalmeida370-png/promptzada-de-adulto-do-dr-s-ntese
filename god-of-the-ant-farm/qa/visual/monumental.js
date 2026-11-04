// monumental: o Coliseu, o palácio de pátios e os templos grandes no 3D, com o corpo e a câmera — a parte E da Arquitetura
// Monumental (1ª a 3ª rodadas):
//   node qa/visual/monumental.js [PASTA_DAS_FOTOS]       (padrão: qa/monumental/fotos)
//   PARTE=node (só a parte em Node: segundos) · PARTE=navegador (só as fotos e o quadro) · sem PARTE: as duas, uma depois da outra
// O Coliseu fundado pela mão do deus em Roma da metrópole — G.Village.handFound(set, 'maravilha', 'maravilha', { built: true,
// R: 60 }) —, com a forma do M1 se o povo já a sabe, senão a de teste (qa/visual/coliseu-teste.js). Onde o handFound põe o lote, o
// chão pode ter mais desnível do que o pódio da forma cobre (3 m, o combinado da equipe; o terreno das cidades é do C): então a mão
// do deus aplaina o lote e uma praça de 4 casas em volta, com mais 4 de transição, só na prova, antes de fundar (dito na saída).
// Parte 1 (Node: o 3D sem placa — qa/visual/tres-node.js —, o corpo e a câmera quadro a quadro, como o jogo):
//   1. a forma e o 3D: o lote e a forma do mesmo tamanho, a altura; os triângulos perto (o detalhe fino) e longe, por peça, cada um
//      no seu teto; o tempo de fazer o pedaço; as ordens da fachada em meias-colunas (a toscana, a jônica, a coríntia: o fuste
//      meio-redondo no primeiro pilar de cada baia; o ático em pilastras); a silhueta de longe do tamanho da forma (a caixa dela
//      contra a do que a forma cobre). De 1 a 5 duas vezes: o Coliseu de 10 casas e o colossal de 13 (C13 · …), cada um aplainado
//      do mesmo jeito — o de 13 na Roma do mundo pronto «cidade», no fim (a metrópole não tem lote livre de 13 casas a 90 de
//      nenhuma cidade romana), com o verificador dele
//   2. os pedaços do mapa: o Coliseu passa do pedaço do seu canto; o detalhe fino contado pela beira de tudo o que o pedaço desenha
//      (o corpo junto da ponta de lá do Coliseu); o pedaço do canto pedido perto com os que o Coliseu toca (Realm.spillOf)
//   3. a câmera de fora: diante da fachada, olhando para cima (o olhar mais alto), o topo dela e a cabeça no quadro, a câmera longe
//      do corpo (a distância livre, Cam3D.cur)
//   4. a câmera dentro, posta num ponto de corpo: no meio da arena (quatro rumos, e de 8 e 11 m), na beira dela e no pódio, a
//      distância livre (inteira no meio) e a câmera nunca na pedra da forma (Build3D.stoneAt) nem no que é sólido (Cam3D.solid)
//   5. o corpo, pela planta: entra pela entrada, sobe os lances ao piso de onde se assiste e fica nele 10 s (o mundo não o tira dali:
//      L-550), empurra contra o parapeito e anda ao longo dele sem cair, senta para assistir (o verbo «lugar»), levanta e segue no piso
//   P. o palácio de pátios do M2 (6 casas, romano), fundado pela mão do deus em Roma (T-407): P1 desenhado pela forma — perto, as
//      peças da forma com as paredes da casca; longe, as massas da forma (não a caixa de 18 triângulos) —; P2 a frente do pátio
//      aberta (da rua, pelo vão do portão, o olhar chega ao fundo do pátio); P3 as peças que a planta marca da forma desenhadas, e de
//      pé com o interior aberto; P4 as escadas grandes com o poço aberto e o guarda-corpo, sem alçapão; P5 o corpo sobe a escada
//      grande, não anda sobre o poço e desce pelo lance andando; P6 a câmera no pátio e no salão do trono
//   T. o pódio de pedra (D-120) sob o palácio: o desnível do lote em pedra aparelhada, em fiadas, na pedra do povo; o lote clássico
//      com o plinto de antes. E (1) o pedaço refeito com a geometria do monumento guardada (Build3D.formKeep): igual, mais depressa
//   Tp. os templos de 8 casas do M2 pela forma (T-439, T-410), fundados pela mão do deus em Argos, Roma, Mênfis e Birka: Tp1 perto
//      e longe, do alto da forma; Tp2 o pórtico grego entre as antas (o olhar da rua chega ao fundo dele, de fora e com o interior; o
//      fundo cede ao interior; o teto é o entablamento); Tp3 o corpo sobe o lance, entra no pórtico e, pelo portal, na nave; Tp4 o
//      egípcio — as torres do pilone, as bandeiras, o portão pintado que cede à folha do interior, as colunas do salão hipostilo com o
//      interior (L-558); Tp5 o hof — a torre de pé no telhado, a flecha, as tabuinhas até a cumeeira, os esteios do salão (L-558);
//      Tp6 a câmera: na cela nunca na pedra, sob o recinto na pedra
//   6. o verificador limpo, sem erro de módulo
// Parte 2 (o navegador, o 3D desenhado por software — lento: poucas fotos, pequenas):
//   7. as fotos em JPG: de fora (o corpo diante da fachada), da arena olhando as arquibancadas, do alto de um anel
//   8. o quadro do Modo Encarnado (a medida do e8 do encarna: simulação + 3D, quadros de 16 ms na qualidade média, mediana e p95) com o
//      corpo diante do Coliseu, em turnos — o pedaço do canto dele com e sem ele, trocados a cada 15 quadros, seis vezes cada: a mesma
//      carga da máquina para os dois (T-433) —; alvo: mediana ≤ 13 ms (ou não acima da sem ele × 1,15) e p95 não pior que a sem ele ×
//      1,15. E, para ler, antes e depois de fundá-lo (um minuto entre as duas), as chamadas e os triângulos
//   9. na qualidade leve (um pedaço em volta), o corpo no pedaço além do da ponta de lá do Coliseu: o pedaço do canto dele perto
//      (sem a silhueta de longe no lugar do prédio inteiro)
//   10. sem erro de página nem aviso no console
//   11. o palácio de pátios: as fotos em terceira pessoa — de fora, no pátio, no salão do trono
//   12. os templos de 8 casas do grego, do egípcio e do nórdico e os palácios de 6 desses povos, de fora; o salão hipostilo por dentro
const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'qa', 'monumental', 'fotos'));
const PARTE = process.env.PARTE || '';

// ------------------------------ what both parts share (serialized into the page: only G) ------------------------------
function HELP(G) {
  const H = {};
  // (where the god's hand founds the lot: handFound's own search — the lot and the ring round it dry, free of buildings and walls,
  // no main street nor fire on the lot —, from the town's middle out)
  // (o.ring: the tiles round it free of buildings — the square before it the body and the eye stand on —; o.cross: a lot across
  // two chunks of the map, the one of its corner drawing it whole)
  H.siteOf = function (set, n, R, o) {
    o = o || {}; const S = G.S, N = G.N; const ox = Math.floor(set.cx), oy = Math.floor(set.cy); const g = o.ring || 1;
    const crosses = (x, y) => Math.floor(x / 16) !== Math.floor((x + n - 1) / 16) || Math.floor(y / 16) !== Math.floor((y + n - 1) / 16);
    const free = (x, y) => { if (o.cross && !crosses(x, y)) return false; for (let ty = y - g; ty < y + n + g; ty++) for (let tx = x - g; tx < x + n + g; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return false; const i = ty * N + tx;
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
  // the Colosseum of the town named — the wonder's step asked: the 'maravilha' of 10 tiles, the 'colossal' of 13 —, founded whole
  // by the god's hand where handFound puts it (R tiles round its middle at most) — the ground levelled first where it rises more
  // than the form's podium covers (3 m)
  H.found = function (name, R, stepId) {
    const S = G.S; const set = [...S.settlements.values()].find(s => s.name === name); if (!set) return { why: 'não há ' + name + ' neste mundo' }; stepId = stepId || 'maravilha';
    const st = G.Escala.steps('maravilha').find(s => s.id === stepId); const n = st.n; const site = H.siteOf(set, n, R, { cross: true }) || H.siteOf(set, n, R); if (!site) return { why: 'nenhum lote livre de ' + n + ' casas a ' + R + ' do meio de ' + name };
    const drop0 = H.drop(site[0], site[1], n); const h0 = drop0 > 3 ? H.aplainar(site[0], site[1], n) : null;
    // (R: half a tile — the lot asked, levelled, and only it: handFound's radius of 0 is its 40)
    G.inSim++; let b; try { b = G.Village.handFound(set, 'maravilha', stepId, { built: true, x: site[0] + Math.floor(n / 2), y: site[1] + Math.floor(n / 2), R: 0.5 }); } finally { G.inSim--; }
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
  // the palace of courts (M2's, D-106) of the town named, founded whole by the god's hand — its type and its step —, and what the
  // proofs read of it: its plan, its form and its risk, the form's frame in the world, the court's and the throne hall's rooms, the
  // throne, the grand stairs (Interiors.grandWell, L-562), the way in
  H.palace = function (name, type, stepId, R) {
    const S = G.S; const set = [...S.settlements.values()].find(s => s.name === name); if (!set) return { why: 'não há ' + name + ' neste mundo' };
    G.inSim++; let b; try { b = G.Village.handFound(set, type, stepId, { built: true, R: R || 60 }); } finally { G.inSim--; }
    if (!b) return { why: `o handFound não fundou ${type} em ${name}` };
    return Object.assign({ b, set }, H.palaceOf(b));
  };
  // (a temple of a bigger step — the risk's, M2's: its plan and its risk read as the palace's)
  H.temple = function (name, stepId, R) {
    const S = G.S; const set = [...S.settlements.values()].find(s => s.name === name); if (!set) return { why: 'não há ' + name + ' neste mundo' };
    G.inSim++; let b; try { b = G.Village.handFound(set, 'temple', stepId, { built: true, R: R || 60 }); } finally { G.inSim--; }
    if (!b) return { why: `o handFound não fundou o templo ${stepId} em ${name}` };
    return Object.assign({ b, set }, H.palaceOf(b));
  };
  H.palaceOf = function (b) {
    const T = G.Space.TILE, B3 = G.Build3D; const p = G.Space.planNow(b); const F = B3.formOf(b); const Rk = G.Interiors.riskOf(F);
    const side = B3.formSide(b, B3.shellOf(b)); const W = (u, v) => { const q = G.Forma.toLot(side, F.L, u, v); return [b.x * T + q[0], b.y * T + q[1]]; };
    const room = fn => p.rooms.find(m => m.fn === fn && m.lv === 0);
    return { p, F, Rk, side, W, base: G.Space.plinth(b).y0, court: room('patio'), hall: room('trono'), throne: p.items.find(it => it.kind === 'trono'), grand: p.stairs.filter(s => G.Interiors.grandWell(s)), e: p.entrance };
  };
  // (the body walked to a point in a straight line, as the game walks it — the world's step and the body's, no frame drawn: the
  // photos' way in; the flights it runs into taken whole)
  H.walk = function (X, Z, max, near) {
    const IN = G.Avatar.input, st = () => G.Avatar.state(), RDT = 1 / 30; const fr = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); }; let still = 0, last = [st().X, st().Z];
    for (let k = 0; k < (max || 600); k++) { const dx = X - st().X, dz = Z - st().Z; if (Math.hypot(dx, dz) < (near || 0.2)) break;
      IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; fr(); if (st().loco === 'stair') for (let j = 0; j < 600 && st().loco === 'stair'; j++) fr();
      if (Math.hypot(st().X - last[0], st().Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st().X, st().Z]; }
    IN.mz = 0; IN.mx = 0; for (let q = 0; q < 6; q++) fr(); return Math.hypot(X - st().X, Z - st().Z);
  };
  // (a door of a plan between two rooms — its middle, in the lot's metres —, and the way through it from one room to the other: the
  // points a hand before it on either side)
  H.doorBetween = function (p, ra, rb) {
    for (const d of p.doors) { if (!(d.rooms.includes(ra) && d.rooms.includes(rb))) continue; const h = p.holes.find(q => q.door === d.id); const w = p.walls[d.wall]; if (!h || !w) continue;
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L; const m = [w.a[0] + tx * h.at, w.a[1] + tz * h.at];
      const A = p.rooms.find(q => q.id === ra); const nx = -tz, nz = tx; const s = ((A.r[0] + A.r[2]) / 2 - m[0]) * nx + ((A.r[1] + A.r[3]) / 2 - m[1]) * nz >= 0 ? 1 : -1;
      return { id: d.id, m, a: [m[0] + nx * s * 0.9, m[1] + nz * s * 0.9], b: [m[0] - nx * s * 0.9, m[1] - nz * s * 0.9] }; }
    return null;
  };
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
  const H = HELP(G); const C = 16;
  // ---------------- the body and the eye ----------------
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
  const lvl = () => G.Possess.level();
  // (the eye alone, at a body's point given it — as the 3D gives it the body's —: never in the stone of the building asked)
  const inStone = bb => B3.stoneAt(bb, cam.position.x, cam.position.y, cam.position.z) || G.Cam3D.solid(cam.position.x, cam.position.y, cam.position.z);
  const camAt = (X, Y, Z, yaw, pitch, dist, bb) => { const body = { X, Y, Z, yaw, speed: 0, ground: true, h: 1.75 }; G.Cam3D.attach(body, yaw);
    G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; for (let k = 0; k < 45; k++) G.Cam3D.update(RDT, body, cam); cam.updateMatrixWorld(); return { cur: G.Cam3D.cur, stone: inStone(bb) }; };
  // ================ 1 to 5. the Colosseum of a step — the M1's of 10 tiles, and the colossal one of 13 —, founded by the god's hand in Roma ================
  const colosseum = (f, tag, S) => { const ok2 = (name, c2, info) => ok(tag + name, c2, info);
    const b = f.b; const nm = H.numbers(b); const F = nm.F;
    console.log(`(o Coliseu ${f.teste ? 'DE TESTE (qa/visual/coliseu-teste.js: a forma do M1 ainda não está no jogo)' : 'do M1'} #${b.id} em ${b.x},${b.y}, lote de ${b.w} casas, a fachada ${nm.kind} de ${nm.bays} baias; o chão do lote: ${f.drop0} m de desnível${f.h0 !== null ? `, aplainado pela mão do deus a ${f.h0.toFixed(1)} m (agora ${f.drop1} m)` : ''})`);
    // ---------------- 1. the form and its 3D ----------------
    const tetoPerto = 60000, tetoLonge = 2000; // (triangles: one monument of 40 m, near at the finest and far)
    const fx = nm.face.map(q => q[0]), fz = nm.face.map(q => q[1]); const fbox = [Math.min(...fx), Math.min(...fz), Math.max(...fx), Math.max(...fz)];
    ok2('1. a forma do tamanho do lote', F.L === b.w * TL && F.top >= 18 && fbox[2] - fbox[0] <= F.L + 0.01 && fbox[3] - fbox[1] <= F.L + 0.01, `lote ${b.w * TL} m, forma ${F.L} m, altura ${F.top.toFixed(1)} m (a fachada ${nm.H.toFixed(1)} m), a fachada ${(fbox[2] - fbox[0]).toFixed(1)} × ${(fbox[3] - fbox[1]).toFixed(1)} m`);
    const of0 = G.Forma.of; const per = [];
    for (const k of [...new Set(F.els.map(e => e.k))]) { G.Forma.of = (t, s, n) => (t === b.type && n === b.w ? Object.assign({}, F, { els: F.els.filter(e => e.k === k) }) : of0(t, s, n)); per.push(`${k} ${(B3.cost(b).solid / 1000).toFixed(1)}`); }
    G.Forma.of = of0;
    const cost = B3.cost(b); const cx0 = Math.floor(b.x / C) * C, cy0 = Math.floor(b.y / C) * C;
    // (the chunk drawn again: with the monument's geometry drawn anew — Build3D.formKeep off — and with it kept; the same triangles)
    const chunkMs = () => { let t = 1e9; for (let k = 0; k < 3; k++) { const t0 = performance.now(); const r = B3.nearGeo(cx0, cy0, C); t = Math.min(t, performance.now() - t0); for (const q in r) if (r[q]) r[q].dispose(); } return +t.toFixed(1); };
    const arr = () => { const r = B3.nearGeo(cx0, cy0, C); const a = { p: Array.from(r.solid.attributes.position.array), c: Array.from(r.solid.attributes.color.array), w: r.glass ? r.glass.attributes.position.count : 0 }; for (const q in r) if (r[q]) r[q].dispose(); return a; };
    B3.formKeep = false; const msCold = chunkMs(); const A0 = arr(); B3.formKeep = true; B3.nearGeo(cx0, cy0, C); const made0 = B3.formKept().made; const msWarm = chunkMs(); const A1 = arr(); const redrawn = B3.formKept().made - made0;
    const same = A0.p.length === A1.p.length && A0.w === A1.w && A0.p.every((x, i) => Math.abs(x - A1.p[i]) < 1e-3) && A0.c.every((x, i) => Math.abs(x - A1.c[i]) < 1e-4);
    ok2('1. os triângulos perto no teto (o detalhe fino)', cost.solid <= tetoPerto, `${cost.solid} triângulos (teto ${tetoPerto}) — por peça, mil: ${per.join(' · ')}`);
    // (the ms are the machine's — shared, they say little —: the proof is that the Colosseum is not drawn again, and the same comes out)
    ok2('1. o pedaço refeito com a geometria do monumento guardada: igual, sem desenhar o Coliseu de novo', same && !redrawn, `o pedaço ${cx0 / C},${cy0 / C} feito de novo 4 vezes com ele guardado: ${redrawn} vezes desenhado (${B3.formKept().n} guardados); ${same ? 'os mesmos triângulos, as mesmas cores' : 'DIFERENTE'} (${A0.p.length / 9} triângulos); ${msCold} ms desenhando o Coliseu, ${msWarm} ms com ele guardado (o mínimo de 3)`);
    // (the orders of the facade: at each bay's first pier, on the storeys with an order, a half-column of it — the ring of its
    // shaft's top a half-round of points round its axis, seven of them —, not a pilaster's four corners; the attic's pilasters flat)
    const arc = F.els.find(e => e.k === 'arcada'); const ord = [];
    if (arc && nm.kind === 'arcada') { const fc = nm.face, n2 = fc.length;
      arc.andares.forEach(sto => { if (!sto.ordem || sto.ordem === 'pilastra') return; const ys = nm.base + sto.y1 - 0.24 - (sto.ordem === 'corintia' ? 0.4 : 0.18); let round = 0;
        for (let q = 0; q < Math.min(n2, 8); q++) { const p0 = fc[q], p1 = fc[(q + 1) % n2]; const bw = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); const tg = [(p1[0] - p0[0]) / bw, (p1[1] - p0[1]) / bw];
          const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]; let oo = [-tg[1], tg[0]]; if ((m[0] - nm.C[0]) * oo[0] + (m[1] - nm.C[1]) * oo[1] < 0) oo = [-oo[0], -oo[1]];
          const pw = Math.min(0.55, bw * 0.11) / 2, s = -bw / 2 + pw + 0.02; const ax = [m[0] + tg[0] * s, m[1] + tg[1] * s]; const angs = new Set();
          for (let i = 0; i < A1.p.length; i += 3) { if (Math.abs(A1.p[i + 1] - ys) > 0.01) continue; const dx = A1.p[i] - ax[0], dz = A1.p[i + 2] - ax[1]; if (Math.abs(Math.hypot(dx, dz) - pw) > 0.012) continue;
            angs.add(Math.round(Math.atan2(dx * oo[0] + dz * oo[1], dx * tg[0] + dz * tg[1]) * 180 / Math.PI / 5)); }
          if (angs.size >= 5) round++; }
        ord.push({ ordem: sto.ordem, round, of: Math.min(n2, 8) }); }); }
    ok2('1. as ordens da fachada em meias-colunas (a toscana, a jônica, a coríntia)', !arc || (ord.length >= 3 && ord.every(q => q.round === q.of)), arc ? ord.map(q => `${q.ordem}: ${q.round} de ${q.of} pilares com o fuste meio-redondo`).join(', ') : 'a forma sem arcada (o tambor)');
    // (the far figure of the chunk with only this building in it: the far picture of its chunk less the one without it)
    const farOf = () => { const g = B3.farGeo(cx0, cy0, C); return g ? g.attributes.position.count / 3 : 0; };
    const far1 = farOf(); const keep = S.buildings.get(b.id); S.buildings.delete(b.id); const far0 = farOf(); S.buildings.set(b.id, keep);
    // (the far figure alone — the chunk's far picture with only this building in the world —: its box against the facade's)
    const all = S.buildings; S.buildings = new Map([[b.id, b]]); const fg = B3.farGeo(cx0, cy0, C); S.buildings = all; fg.computeBoundingBox(); const bb = fg.boundingBox;
    const xb = nm.box; const dBox = Math.max(Math.abs(bb.min.x - xb[0]), Math.abs(bb.min.z - xb[1]), Math.abs(bb.max.x - xb[2]), Math.abs(bb.max.z - xb[3])), dTop = Math.abs(bb.max.y - (nm.base + nm.H));
    ok2('1. a silhueta de longe no teto e do tamanho da forma', far1 - far0 <= tetoLonge && dBox <= 0.5 && dTop <= 0.5, `${far1 - far0} triângulos longe (teto ${tetoLonge}); a caixa dela ${(bb.max.x - bb.min.x).toFixed(1)} × ${(bb.max.z - bb.min.z).toFixed(1)} m até ${(bb.max.y - nm.base).toFixed(1)} m — a da forma de cima ${(xb[2] - xb[0]).toFixed(1)} × ${(xb[3] - xb[1]).toFixed(1)} m, a fachada a ${nm.H.toFixed(1)} m (a diferença: ${dBox.toFixed(2)} m de lado, ${dTop.toFixed(2)} m no alto)`);
    // ---------------- 2. the chunks ----------------
    const own = [Math.floor(b.x / C), Math.floor(b.y / C)], far = [Math.floor((b.x + b.w - 1) / C), Math.floor((b.y + b.h - 1) / C)];
    const sp = R3.spillOf(); const spilled = []; for (let cy = own[1]; cy <= far[1]; cy++) for (let cx = own[0]; cx <= far[0]; cx++) if (cx !== own[0] || cy !== own[1]) spilled.push([cx, cy, !!(sp.get(cy * 4096 + cx) || new Set()).has(own[1] * 4096 + own[0])]);
    ok2('2. o Coliseu atravessa pedaços: cada pedaço que ele toca chama o do canto', spilled.length > 0 && spilled.every(q => q[2]), `canto no pedaço ${own}; toca ${spilled.map(q => q[0] + ',' + q[1] + (q[2] ? '' : ' (sem)')).join(' ') || 'nenhum outro'}`);
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
    ok2('3. de fora, olhando para cima: o topo da fachada e a cabeça no quadro, a câmera longe do corpo', took.ok && inFrame(L1) && inFrame(L2) && L1.cur >= 0.85 * 4.8 && L2.cur >= 4.4, `o corpo a ${(Math.hypot(c[0] - st().X, c[1] - st().Z) - face).toFixed(1)} m da fachada de ${nm.H.toFixed(0)} m; olhar normal: o topo em ${L0.top} (fora do quadro além de 1), cur ${L0.cur} m; para cima a 4,8 m: o topo em ${L1.top}, a cabeça em ${L1.head}, cur ${L1.cur} m, a câmera a ${L1.alt} m do chão; para cima a 11 m: o topo em ${L2.top}, a cabeça em ${L2.head}, cur ${L2.cur} m`);
    G.Cam3D.OPT.follow = true; G.Cam3D.pitch = 0.26; G.Cam3D.dist = 4.8;
    // ---------------- 4. the camera inside, alone (a body's point given to it, as the 3D gives it the body's: the eye is the proof
    // here, not the walk) — in the arena's middle four ways and further, at its edge with the rows behind, on the podium; never in
    // the form's stone ----------------
    // (a point of the arena's edge, k eighths round it, moved d toward the middle — out of it with d < 0)
    const edgeAt = (k, d) => { const q = nm.edge[Math.floor(k * nm.edge.length / 8) % nm.edge.length]; const l = Math.hypot(q[0] - c[0], q[1] - c[1]) || 1; return [q[0] + (c[0] - q[0]) / l * d, q[1] + (c[1] - q[1]) / l * d]; };
    const yA = base + nm.sandY + 0.012, yP = base + nm.yPod + 0.012; const inside = []; let worst = 99, stoneHit = 0;
    // (how far the arena runs from a point along a way, on the sand: the eye has the distance asked or up to the arena's wall)
    const inPoly = (P, x, z) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a2 = P[i], b2 = P[j]; if ((a2[1] > z) !== (b2[1] > z) && x < (b2[0] - a2[0]) * (z - a2[1]) / (b2[1] - a2[1]) + a2[0]) r = !r; } return r; };
    const room = (X, Z, yaw) => { let s = 0; while (s < 40 && inPoly(nm.edge, X - Math.cos(yaw) * (s + 0.1), Z - Math.sin(yaw) * (s + 0.1))) s += 0.1; return s; };
    for (const [yaw, dist] of [[0, 4.8], [Math.PI / 2, 4.8], [Math.PI, 4.8], [-Math.PI / 2, 4.8], [yawIn, 8], [yawIn + Math.PI, 11]]) {
      const X = c[0] - o[0] * 1.5, Z = c[1] - o[1] * 1.5; const q = camAt(X, yA, Z, yaw, 0.12, dist, b); const want = Math.min(dist, room(X, Z, yaw) * 0.95 - 0.3);
      worst = Math.min(worst, q.cur / Math.max(0.5, want)); if (q.stone) stoneHit++; inside.push(`${dist}→${q.cur.toFixed(1)}${want < dist ? ` (a arena acaba a ${(want + 0.3).toFixed(1)})` : ''}`); }
    // (at the arena's edge, facing its middle: the eye behind, over the podium and the rows — held by them, never in them)
    const edgeC = []; for (let k = 0; k < 8; k++) { const p0 = edgeAt(k + 0.3, 1.2); const q = camAt(p0[0], yA, p0[1], Math.atan2(c[1] - p0[1], c[0] - p0[0]), 0.15, 4.8, b); if (q.stone) stoneHit++; edgeC.push(q.cur.toFixed(1)); }
    const podC = []; for (let k = 0; k < 4; k++) { const p0 = edgeAt(2 * k + 0.6, -0.6); const q = camAt(p0[0], yP, p0[1], Math.atan2(c[1] - p0[1], c[0] - p0[0]), 0.2, 4.8, b); if (q.stone) stoneHit++; podC.push(q.cur.toFixed(1)); }
    ok2('4. dentro: na arena a câmera com a distância pedida até o muro dela; na beira dela e no pódio, segura pelo muro e pelas fileiras, nunca na pedra', worst >= 0.95 && !stoneHit, `no meio da arena (pedida→livre, m): ${inside.join(', ')}; na beira da arena, o muro do pódio atrás: ${edgeC.join(', ')} m; no pódio: ${podC.join(', ')} m; câmera na pedra: ${stoneHit}`);
    G.Cam3D.OPT.follow = true; G.Cam3D.dist = 4.8; G.Cam3D.pitch = 0.26; G.Cam3D.attach(G.Avatar.pos(), st().yaw);
    // ---------------- 5. the body: in by the way in, up the flights to the storey one watches from, along its parapet, seated ----------------
    // (by the plan: the storey with places to watch from — the podium —, the flights up to it from the way in's storey, nearest the way in first)
    const y = () => +(st().Y - base).toFixed(2); const lv0 = p.entryLv || 0;
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
    ok2('5. sobe os lances ao piso de assistir e fica nele 10 s (o mundo não o tira: L-550)', !!route && inArch.lv === lv0 && up1.lv === watchLv && Math.abs(up1.y - levelY(watchLv)) < 0.1 && !stay.out, `na entrada piso ${inArch.lv}; o piso de assistir ${watchLv} a ${levelY(watchLv).toFixed(2)} m, pelos lances ${(route || []).map(s => `${s.lv0}→${s.lv1} (${(levelY(s.lv1) - levelY(s.lv0)).toFixed(1)} m em ${flightLen(s).toFixed(1)} m)`).join(', ') || 'nenhum'}: ${climbs.join('; ') || '-'}${up1.lv !== watchLv ? L550 : stay.out ? `; tirado no quadro ${stay.out}: piso ${stay.lv}, a ${stay.y} m${L550}` : '; 10 s nele'}`);
    // (along its edge and against its parapet: toward the arena's middle until the feet stop, then a few metres either way along it)
    const rOf = () => Math.hypot(st().X - c[0], st().Z - c[1]); let push = null, along = null;
    if (lvl() === watchLv) { IN.camYaw = Math.atan2(c[1] - st().Z, c[0] - st().X); IN.mz = 1; for (let k = 0; k < 240; k++) frame(); stop(); for (let k = 0; k < 6; k++) frame(); push = { r: +rOf().toFixed(2), lv: lvl(), y: y() };
      let yMin = 99; const lvs = new Set(); const tang = Math.atan2(c[1] - st().Z, c[0] - st().X) + Math.PI / 2;
      for (const sg of [1, -1, -1, 1]) { IN.camYaw = tang + (sg < 0 ? Math.PI : 0); IN.mz = 1; for (let k = 0; k < 60; k++) { frame(); yMin = Math.min(yMin, y()); lvs.add(lvl()); } stop(); frame(); }
      along = { yMin, lvs: [...lvs], r: +rOf().toFixed(2) }; }
    ok2('5. no piso de assistir, contra o parapeito e ao longo dele, sem cair', !!push && push.lv === watchLv && Math.abs(push.y - up1.y) < 0.05 && !!along && along.lvs.length === 1 && along.lvs[0] === watchLv && along.yMin >= up1.y - 0.05, push ? `empurrando para o meio da arena: parado a ${push.r} m do meio, piso ${push.lv}, a ${push.y} m; ao longo dele 4 trechos de 2 s: o mais baixo a ${along.yMin.toFixed(2)} m, pisos ${along.lvs.join(',')}` : 'o corpo não chegou ao piso de assistir');
    // the verb 'lugar': the body takes a place to watch from, and gets up again
    let seat = null, after = null;
    if (lvl() === watchLv) {
      const pls = In.freeNear(b, watchLv, st().X - bx, st().Z - bz, 12).filter(q => q.use === 'assistir'); const q0 = pls[0];
      if (q0) { const sf = In.standFor ? In.standFor(b, q0, st().X - bx, st().Z - bz) : [q0.x, q0.z]; walkTo(...at(sf[0], sf[1]), 600, 0.5); }
      let best = null; for (let k = 0; k < 30 && !(best && best.id === 'lugar'); k++) { const q = In.freeNear(b, watchLv, st().X - bx, st().Z - bz, 3).filter(r => r.use === 'assistir')[0]; if (!q) break; const ya = Math.atan2(bz + q.z - st().Z, bx + q.x - st().X); IN.camYaw = ya; st().yaw = ya; best = G.Interact.best(); frame(); }
      if (best && best.id === 'lugar') { G.Interact.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame(); }
      const u = G.Possess.useOf(); seat = { label: best ? best.label : 'nada', seated: !!(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1), use: u ? u.use : null, st: u ? u.st : '' };
      IN.camYaw = st().yaw + Math.PI; IN.mz = 1; for (let k = 0; k < 12; k++) frame(); stop(); for (let k = 0; k < 90; k++) frame(); after = { lv: lvl(), y: y(), seat: !!G.Avatar.seatNow() }; }
    ok2('5. senta para assistir (o verbo «lugar»), levanta e segue no piso', !!seat && seat.seated && seat.use === 'assistir' && !!after && after.lv === watchLv && !after.seat && Math.abs(after.y - up1.y) < 0.6, seat ? `o E: «${seat.label}»; tomado: ${seat.seated} (${seat.use || 'sem lugar'}${seat.st ? ', ' + seat.st : ''}); 3 s depois de levantar: piso ${after.lv}, a ${after.y} m${after.lv !== watchLv ? L550 : ''}` : 'o corpo não chegou ao piso de assistir');
    // ---------------- 2. the fine detail by what the chunk draws: the body by the Colosseum's far end ----------------
    G.Possess.release('deus'); G.Avatar.detach();
    { const w = [...S.villagers.values()].filter(q => q.age >= 18 && !q.inside && G.Possess.can(q).ok).sort((a2, b2) => a2.id - b2.id)[0]; const fx = b.x + b.w + 1.5, fy = b.y + b.h + 1.5;
      G.inSim++; G.Vg.endTask(w); w.x = fx; w.y = fy; w.path = null; G.inSim--; G.Possess.take(w); G.Avatar.attach(w, 0); for (let k = 0; k < 4; k++) frame();
      const r = B3.reachOf(cx0, cy0, C); const dOwn = Math.hypot(Math.max(cx0 - w.x, 0, w.x - (cx0 + C)), Math.max(cy0 - w.y, 0, w.y - (cy0 + C))) * TL;
      const fine = B3.fineAt(cx0, cy0, C); const D = 35 * (R3.Q().lod || 1);
      ok2('2. junto da ponta de lá do Coliseu, o detalhe fino (pela beira do que o pedaço desenha)', fine && r[2] >= b.x + b.w && r[3] >= b.y + b.h, `o corpo a ${dOwn.toFixed(0)} m do pedaço do canto (o fino até ${D.toFixed(0)} m), junto do Coliseu; o pedaço desenha até ${r[2]},${r[3]}: fino ${fine}`);
      G.Possess.release('deus'); G.Avatar.detach(); }
  };
  const f = H.found('Roma', 60);
  if (!f.b) { ok('0. o Coliseu fundado em Roma', false, f.why); return fails; }
  colosseum(f, '', S);
  // ================ P. the palace of courts (M2's of 6 tiles, the Roman's: its dome, its screen of columns — T-407) ================
  const PZ = H.palace('Roma', 'palacio', 'palacio', 60);
  if (!PZ.b) ok('P. o palácio fundado em Roma', false, PZ.why);
  else {
    const pb = PZ.b, pp = PZ.p, PF = PZ.F, RK = PZ.Rk; const px0 = pb.x * TL, pz0 = pb.y * TL, pbase = PZ.base; const pat = (x, z) => [px0 + x, pz0 + z];
    console.log(`(o palácio #${pb.id} de ${pb.w} casas em ${pb.x},${pb.y}: a planta ${pp.ok ? 'pronta' : 'falhou'}, a família ${pb.ip && pb.ip.f}; o pódio de ${RK.Hp} m, o beiral a ${RK.eave} m, o alto da forma ${PF.top.toFixed(1)} m; ${PZ.grand.length} escadas grandes)`);
    // P1. drawn by its form: near — the form's pieces with the shell's walls — and far — the form's masses, not the shell's box
    const pc = B3.cost(pb); const pcx = Math.floor(pb.x / C) * C, pcy = Math.floor(pb.y / C) * C;
    let pms = 1e9; for (let k = 0; k < 3; k++) { const t0 = performance.now(); B3.nearGeo(pcx, pcy, C); pms = Math.min(pms, Math.round(performance.now() - t0)); }
    const all2 = S.buildings; S.buildings = new Map([[pb.id, pb]]); let pfg, pnear; try { pfg = B3.farGeo(pcx, pcy, C); pnear = B3.nearGeo(pcx, pcy, C); } finally { S.buildings = all2; }
    pfg.computeBoundingBox(); const pfar = pfg.attributes.position.count / 3; const ptop = pfg.boundingBox.max.y - pbase;
    ok('P1. o palácio desenhado pela forma: perto e longe', B3.byForm(pb) && !!B3.riskForm(pb) && pc.solid <= 60000 && pfar > 100 && pfar <= 2000 && Math.abs(ptop - PF.top) <= 0.5, `pela forma: ${B3.byForm(pb)}; perto ${pc.solid} triângulos (+${pc.glass} de vidro), o pedaço feito em ${pms} ms; longe ${pfar} triângulos (a caixa da casca: 18), o alto de longe ${ptop.toFixed(1)} m, o da forma ${PF.top.toFixed(1)} m`);
    // T. the stone podium (D-120): the lot's drop under the palace's floor, in dressed stone ----------------
    // (its faces on the lot's edges — 0.1 m in, the plinth's —: each side with a drop has its stones, of many tones — a block's own
    // —, none over the floor's height; the drop of the side; a building of its type's classic lot keeps the plinth of before)
    { const b = pb, f = PZ; const ng = { solid: pnear.solid };
      const pl = Sp.plinth(b); const X0 = b.x * TL + 0.1, Z0 = b.y * TL + 0.1, X1 = (b.x + b.w) * TL - 0.1, Z1 = (b.y + b.h) * TL - 0.1;
      const P = ng.solid.attributes.position.array, Cl = ng.solid.attributes.color ? ng.solid.attributes.color.array : null; const per = { N: 0, E: 0, S: 0, W: 0 }; const tones = new Set(); let over = 0;
      for (let i = 0; i < P.length; i += 9) { const xs = [P[i], P[i + 3], P[i + 6]], ys = [P[i + 1], P[i + 4], P[i + 7]], zs = [P[i + 2], P[i + 5], P[i + 8]];
        const on = (arr, v) => arr.every(q => Math.abs(q - v) < 0.06); const sd = on(zs, Z0) ? 'N' : on(zs, Z1) ? 'S' : on(xs, X0) ? 'W' : on(xs, X1) ? 'E' : null; if (!sd) continue;
        per[sd]++; if (Math.max(...ys) > pl.y0 + 0.02) over++; if (Cl) tones.add([0, 1, 2].map(c => Math.round(Cl[i + c] * 60)).join(',')); }
      const dropOf = sd => { let lo2 = Infinity; for (let k = 0; k <= 40; k++) { const f = k / 40; const x = sd === 'W' ? b.x : sd === 'E' ? b.x + b.w : b.x + b.w * f, y = sd === 'N' ? b.y : sd === 'S' ? b.y + b.h : b.y + b.h * f; lo2 = Math.min(lo2, Sp.drawnAt(Math.min(G.N - 0.001, x), Math.min(G.N - 0.001, y))); } return pl.y0 - lo2; };
      const drops = {}; for (const sd of ['N', 'E', 'S', 'W']) drops[sd] = +dropOf(sd).toFixed(1);
      const classic = [...S.buildings.values()].find(q => q.built && q.set === f.set.id && G.BDEF[q.type] && q.w === (G.BDEF[q.type].w || 1) && !Sp.baseless(q));
      ok('T. o pódio de pedra (D-120): o desnível do lote em pedra aparelhada, em fiadas, na pedra do povo', B3.bigStep(b) && ['N', 'E', 'S', 'W'].every(sd => drops[sd] < 0.3 || per[sd] > 8) && tones.size >= 6 && !over && !!classic && !B3.bigStep(classic),
        `o desnível por lado ${['N', 'E', 'S', 'W'].map(sd => `${sd} ${drops[sd]} m: ${per[sd]} triângulos`).join(', ')}; ${tones.size} tons de pedra; acima do piso: ${over}; um prédio do lote clássico (${classic ? classic.type : 'nenhum'}) com o plinto de antes: ${classic ? !B3.bigStep(classic) : '-'}`);
      }
    // P2. the court's open front: from the street through the gate's bay — at the eye's height and over the doors' tops —, the eye
    // reaches the court's back, the wing of state's face, not a wall across the front
    const mesh = new THREE.Mesh(pnear.solid, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); mesh.updateMatrixWorld();
    const rcs = new THREE.Raycaster(); const o2 = PZ.W(RK.L / 2, RK.L), bk = PZ.W(RK.L / 2, RK.C[1]); const dl = Math.hypot(bk[0] - o2[0], bk[1] - o2[1]); const dn = [(bk[0] - o2[0]) / dl, (bk[1] - o2[1]) / dl];
    const rays = [1.6, 5.0].map(hh => { rcs.set(new THREE.Vector3(o2[0] + dn[0] * 0.3, pbase + RK.Hp + hh, o2[1] + dn[1] * 0.3), new THREE.Vector3(dn[0], 0, dn[1])); rcs.far = 60; const hit = rcs.intersectObject(mesh)[0]; return { hh, d: hit ? +(hit.distance + 0.3).toFixed(1) : null }; });
    const deep = RK.L - RK.C[1];
    // (and with the inside drawn — the floors, the walls, the ceilings: the upper storey's slab, at its height, no beam across the
    // court's front, L-555)
    const insG = B3.interior(pp, pb); const im = new THREE.Group(); for (const k in insG.lv) if (!insG.lv[k].empty) im.add(new THREE.Mesh(insG.lv[k].build(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))); if (!insG.roof.empty) im.add(new THREE.Mesh(insG.roof.build(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))); im.updateMatrixWorld(true);
    const l1 = pp.levels.find(l => l.lv === 1); const hIn = l1 ? l1.y - RK.Hp - 0.05 : 4.75;
    rcs.set(new THREE.Vector3(o2[0] + dn[0] * 0.3, pbase + RK.Hp + hIn, o2[1] + dn[1] * 0.3), new THREE.Vector3(dn[0], 0, dn[1])); const hitIn = rcs.intersectObject(im, true)[0]; const dIn = hitIn ? +(hitIn.distance + 0.3).toFixed(1) : null;
    ok('P2. a frente do pátio aberta: da rua, pelo vão do portão, o olhar chega ao fundo do pátio', !RK.big && rays.every(q => q.d !== null && q.d >= deep - 0.6) && (dIn === null || dIn >= deep - 0.6), `do meio da frente do lote ao fundo do pátio ${deep.toFixed(1)} m; o olhar a ${rays.map(q => `${q.hh} m: para a ${q.d} m`).join(', ')} (a frente que subia em altura cheia parava em ${(RK.L - RK.B[3]).toFixed(1)}); com o interior desenhado, na altura da laje de cima (${hIn.toFixed(1)} m): ${dIn === null ? 'nada no caminho' : 'para a ' + dIn + ' m'}`);
    // P3. the pieces of the courts the plan marks the form's (form: 1 — the fountain, the cypresses, the statues…): drawn, each in its
    // place, and none of them where the inside, once drawn, takes the outside away (B3.cuts)
    const cuts = B3.cuts(pb); const inCut = q => cuts.some(c2 => q[0] > c2[0] && q[1] > c2[1] && q[2] > c2[2] && q[0] < c2[3] && q[1] < c2[4] && q[2] < c2[5]);
    const PA = pnear.solid.attributes.position.array; const mids = []; for (let i = 0; i < PA.length; i += 9) mids.push([(PA[i] + PA[i + 3] + PA[i + 6]) / 3, (PA[i + 1] + PA[i + 4] + PA[i + 7]) / 3, (PA[i + 2] + PA[i + 5] + PA[i + 8]) / 3]);
    const lvY = lv => (pp.levels.find(l => l.lv === lv) || { y: 0 }).y;
    const pieces = pp.items.filter(it => it.form).map(it => { const X = px0 + it.x, Z = pz0 + it.z, r = Math.max(it.w, it.d) / 2 + 0.15, y0 = pbase + lvY(it.lv) - 0.05, y1 = y0 + (it.h || 1) + 1;
      let n = 0, cut = 0; for (const q of mids) if (Math.abs(q[0] - X) <= r && Math.abs(q[2] - Z) <= r && q[1] >= y0 && q[1] <= y1) { n++; if (inCut(q)) cut++; } return { kind: it.kind, n, cut }; });
    ok('P3. as peças dos pátios que a planta marca da forma: desenhadas, e de pé com o interior aberto', pieces.length > 0 && pieces.every(q => q.n > 0 && !q.cut), `${pieces.length} peças: ${pieces.map(q => `${q.kind} ${q.n}${q.cut ? ` (${q.cut} cortados)` : ''}`).join(', ')}; ${cuts.length} cortes (as faces do pátio e as portas)`);
    // P4. the grand stairs: their wells open — no lid —, the rail round them on the storey they come up to
    const ins = B3.interior(pp, pb); const gs = PZ.grand; const lids = ins.hatch.filter(h => gs.some(s2 => s2.id === h.id)).length;
    const rails = gs.map(s2 => { const g = ins.lv[s2.lv1]; const A = g.p; const r = s2.hole; const yl = pbase + lvY(s2.lv1); let n = 0;
      for (let i = 0; i < A.length; i += 9) { const x = (A[i] + A[i + 3] + A[i + 6]) / 3 - px0, y = (A[i + 1] + A[i + 4] + A[i + 7]) / 3, z = (A[i + 2] + A[i + 5] + A[i + 8]) / 3 - pz0;
        if (y > yl + 0.05 && y < yl + 1.05 && x > r[0] - 0.2 && x < r[2] + 0.2 && z > r[1] - 0.2 && z < r[3] + 0.2 && !(x > r[0] + 0.15 && x < r[2] - 0.15 && z > r[1] + 0.15 && z < r[3] - 0.15)) n++; }
      return n; });
    ok('P4. as escadas grandes: o poço aberto, sem alçapão, com o guarda-corpo em volta', gs.length > 0 && !lids && rails.every(n => n > 0), `${gs.length} escadas de ${gs.map(s2 => s2.w).join(', ')} m: ${lids} tampas (o alçapão de antes: uma em cada); o guarda-corpo, ${rails.join(', ')} triângulos`);
    // P5. the body: in by the gate, across the court and into the room of the stair, up it; on the upper storey, never over the open
    // well (its rail), and from the landing down the flight as one walks
    const v2 = [...S.villagers.values()].filter(q => q.set === PZ.set.id && q.age >= 18 && q.age < 55 && !q.inside && G.Possess.can(q).ok).sort((a2, b2) => a2.id - b2.id)[0];
    const pe = PZ.e; const s2 = gs[0]; const py = () => +(st().Y - pbase).toFixed(2); let walk = null, walk0 = 'sem porta'; S.time = 0.42;
    if (v2 && s2 && pe && pe.out) {
      G.inSim++; G.Vg.endTask(v2); v2.x = (px0 + pe.out[0]) / TL; v2.y = (pz0 + pe.out[1]) / TL; v2.path = null; G.inSim--;
      G.Possess.take(v2); G.Avatar.attach(v2, 0); G.Cam3D.attach(G.Avatar.pos(), 0); for (let k = 0; k < 6; k++) frame();
      walkTo(...pat(pe.x, pe.z), 900); const inn = PZ.W(RK.L / 2, (RK.C[1] + RK.C[3]) / 2); walkTo(inn[0], inn[1], 900);
      const sr = pp.rooms.find(m => m.lv === s2.lv0 && s2.a[0] > m.r[0] && s2.a[0] < m.r[2] && s2.a[1] > m.r[1] && s2.a[1] < m.r[3]); const dr = sr && H.doorBetween(pp, PZ.court.id, sr.id);
      // (the room's door off the court opened by the hand, as the verb «Abrir a porta» does — Interiors.useDoor —, by day)
      if (dr) { G.inSim++; const od = In.useDoor(pb, dr.id, 'abrir', v2); G.inSim--; walk0 = od.ok ? 'aberta' : od.why; walkTo(...pat(dr.a[0], dr.a[1]), 900); walkTo(...pat(dr.b[0], dr.b[1]), 600); }
      walkTo(...pat(s2.a[0], s2.a[1]), 900); const atFoot = { lv: lvl(), y: py() };
      // (up the flight to its top on the storey above — the strip of floor between the well's far end and the room's wall)
      walkTo(...pat(s2.b[0], s2.b[1]), 1500); const up = { lv: lvl(), y: py() };
      // (at its top, across the well's end both ways — along its edge, the rail beside it: the body stays on the storey, out of the
      // well, never over it —, back to the top)
      const hr = s2.hole, inWell = () => { const x = st().X - px0, z = st().Z - pz0; return x > hr[0] && x < hr[2] && z > hr[1] && z < hr[3]; }; let over = null;
      if (up.lv === s2.lv1) { over = { lv: [], y: [], inWell: false };
        for (const q of [[-s2.dir[1], s2.dir[0]], [s2.dir[1], -s2.dir[0]]]) { walkTo(...pat(s2.b[0] + q[0] * 3, s2.b[1] + q[1] * 3), 240); over.lv.push(lvl()); over.y.push(py()); over.inWell = over.inWell || inWell(); walkTo(...pat(s2.b[0], s2.b[1]), 240); } }
      // (from its top, into the flight against the climb: down it, as one walks — Avatar's takeFlight, the grand well's)
      const back = { lv: lvl(), y: py() }; walkTo(...pat(s2.a[0], s2.a[1]), 1500); const down = { lv: lvl(), y: py(), from: back.lv };
      walk = { atFoot, up, over, down, y1: lvY(s2.lv1), y0: lvY(s2.lv0) };
      G.Possess.release('deus'); G.Avatar.detach();
    }
    ok('P5. o corpo sobe a escada grande, não anda sobre o poço aberto e desce pelo lance andando', !!walk && walk.up.lv === s2.lv1 && Math.abs(walk.up.y - walk.y1) < 0.1 && !!walk.over && !walk.over.inWell && walk.over.lv.every(l => l === s2.lv1) && walk.over.y.every(q => Math.abs(q - walk.y1) < 0.1) && walk.down.from === s2.lv1 && walk.down.lv === s2.lv0 && Math.abs(walk.down.y - walk.y0) < 0.1,
      walk ? `a porta do cômodo da escada ${walk0}; no pé da escada piso ${walk.atFoot.lv} a ${walk.atFoot.y} m; em cima piso ${walk.up.lv} a ${walk.up.y} m (o piso a ${walk.y1}); de lado no alto do poço, para os dois lados: ${walk.over ? `pisos ${walk.over.lv.join(', ')} a ${walk.over.y.join(', ')} m, ${walk.over.inWell ? 'DENTRO do poço' : 'nunca dentro dele'}` : 'não chegou'}; do alto do lance (piso ${walk.down.from}) para ele: piso ${walk.down.lv} a ${walk.down.y} m` : 'sem corpo, sem escada ou sem entrada');
    // P6. the camera in the court — the sky over it — and in the throne hall: the distance asked, never in stone nor in what is solid
    const yCourt = pbase + RK.Hp + 0.012; const cc = PZ.W(RK.L / 2, (RK.C[1] + RK.C[3]) / 2 + 1); const toHall = Math.atan2(bk[1] - cc[1], bk[0] - cc[0]);
    const qC = camAt(cc[0], yCourt, cc[1], toHall, 0.15, 4.8, pb);
    const hm = PZ.W(RK.L / 2, (RK.B[1] + RK.C[1]) / 2 + 1.2), th = PZ.W(RK.L / 2, RK.B[1]); const toThrone = Math.atan2(th[1] - hm[1], th[0] - hm[0]); const qH = camAt(hm[0], yCourt, hm[1], toThrone, 0.15, 4.8, pb);
    const roomH = (RK.C[1] - ((RK.B[1] + RK.C[1]) / 2 + 1.2)) - 0.3; // (behind the body in the hall, to its court wall)
    ok('P6. a câmera no pátio e no salão do trono: a distância pedida, nunca na pedra', qC.cur >= 4.3 && qH.cur >= Math.min(4.8, roomH) * 0.8 && !qC.stone && !qH.stone, `no pátio ${qC.cur.toFixed(1)} m de 4,8${qC.stone ? ' (NA PEDRA)' : ''}; no salão do trono ${qH.cur.toFixed(1)} m (até a parede do pátio ${roomH.toFixed(1)})${qH.stone ? ' (NA PEDRA)' : ''}`);
    G.Cam3D.OPT.follow = true;
  }
  // ================ Tp. the temples of the bigger steps by their form (M2's risks — T-439, T-410, L-558): the Greek's, the Roman's,
  // the Egyptian's and the Norse's of 8 tiles, founded whole by the god's hand in a town of each people ================
  { const Tz = []; for (const [town, civ] of [['Argos', 'grego'], ['Roma', 'romano'], ['Mênfis', 'egipcio'], ['Birka', 'nordico']]) Tz.push(Object.assign({ town, civ }, H.temple(town, 'monumental', 60)));
    const mesh1 = g => { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); m.updateMatrixWorld(); return m; };
    const insOf = (p2, b2) => { const ig = B3.interior(p2, b2); const gr = new THREE.Group(); for (const k in ig.lv) if (!ig.lv[k].empty) gr.add(new THREE.Mesh(ig.lv[k].build(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })));
      if (!ig.roof.empty) gr.add(new THREE.Mesh(ig.roof.build(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))); gr.updateMatrixWorld(true); return { ig, gr }; };
    // (the chunk of a building's corner with only it in the world: its near and its far figures)
    const alone = b2 => { const cx = Math.floor(b2.x / C) * C, cy = Math.floor(b2.y / C) * C; const all3 = S.buildings; S.buildings = new Map([[b2.id, b2]]); try { return { near: B3.nearGeo(cx, cy, C), far: B3.farGeo(cx, cy, C) }; } finally { S.buildings = all3; } };
    const inBox = (c2, X, Y, Z) => X > c2[0] && Y > c2[1] && Z > c2[2] && X < c2[3] && Y < c2[4] && Z < c2[5];
    const box2 = (W2, r) => { const a = W2(r[0], r[1]), c2 = W2(r[2], r[3]); return [Math.min(a[0], c2[0]), Math.min(a[1], c2[1]), Math.max(a[0], c2[0]), Math.max(a[1], c2[1])]; };
    // (a temple's pieces inside the cella drawn with its inside: each with points of its shaft's top where the plan stands it)
    const innerSeen = (t, ins) => { const R = t.Rk; const els = B3.innerEls(R); let n = 0; const A = ins.ig.lv[(t.p.levels.find(l => l.kind !== 'porao') || t.p.levels[0]).lv].p;
      for (const e of els) { const c0 = e.k === 'coluna' ? e.c : e.pts[0]; const c2 = t.W(c0[0], c0[1]); const y1 = t.base + e.y1; let hit = false;
        for (let i = 0; i < A.length && !hit; i += 3) if (Math.abs(A[i + 1] - y1) < 0.02 && Math.hypot(A[i] - c2[0], A[i + 2] - c2[1]) <= e.r + 0.03) hit = true; if (hit) n++; }
      return { n, of: els.length }; };
    const rows = [];
    for (const t of Tz) {
      if (!t.b) { ok(`Tp. o templo de 8 casas em ${t.town}`, false, t.why); continue; }
      const g2 = alone(t.b); g2.near.solid.computeBoundingBox(); g2.far.computeBoundingBox();
      rows.push(Object.assign(t, { g2, P2: g2.near.solid.attributes.position.array, AP: g2.near.solid.attributes.aP.array, topN: g2.near.solid.boundingBox.max.y - t.base, topF: g2.far.boundingBox.max.y - t.base,
        massTop: Math.max(...G.Forma.mass(t.F).map(m => Math.max(...[m.y1, m.a && m.a[2], m.b && m.b[2], ...(m.p || []).map(q => q[2])].filter(Number.isFinite)))), cost2: B3.cost(t.b), fw: t.p.walls.filter(w => B3.formWall(t.b, t.p, w)).length }));
    }
    console.log(`(os templos de 8 casas: ${rows.map(t => `${t.civ} #${t.b.id} em ${t.town} (${t.b.x},${t.b.y}), a família ${t.b.ip && t.b.ip.f}, o alto da forma ${t.F.top.toFixed(1)} m`).join('; ')})`);
    // Tp1. drawn by its form: near — the form's pieces round the cella's walls —, its top the form's; far — the form's masses
    ok('Tp1. os templos de 8 casas pela forma: perto e longe, do alto da forma', rows.length === 4 && rows.every(t => B3.byForm(t.b) && !!B3.riskForm(t.b) && t.cost2.solid <= 60000 && Math.abs(t.topN - t.F.top) <= 0.3 && Math.abs(t.topF - t.massTop) <= 0.5 && t.fw > 0),
      rows.map(t => `${t.civ}: pela forma ${B3.byForm(t.b)}, perto ${t.cost2.solid} triângulos, o alto ${t.topN.toFixed(2)} m (a forma ${t.F.top.toFixed(2)}), de longe ${t.topF.toFixed(1)} m (as massas ${t.massTop.toFixed(1)}); ${t.fw} paredes da planta que são da forma`).join(' · '));
    // Tp2. the Greek's porch between its antae: from the street along the axis — between the portal's top and the porch's ceiling —,
    // the eye reaches its back, the cella's front wall (not a wall with dark arches across the front: the colonnade the shell drew
    // before); the same with the inside drawn; the back given way to the inside (B3.cuts); its ceiling, the entablature's underside
    const gr = rows.find(t => t.civ === 'grego');
    if (gr) { const R = gr.Rk, W2 = gr.W, L2 = R.L; const back = R.vF + R.t / 2, ceil = R.Hp + R.Hc, hh = (R.doorD.y1 + ceil) / 2;
      const o3 = W2(L2 / 2, L2), bk3 = W2(L2 / 2, back); const dl3 = Math.hypot(bk3[0] - o3[0], bk3[1] - o3[1]); const dn3 = [(bk3[0] - o3[0]) / dl3, (bk3[1] - o3[1]) / dl3];
      const rc3 = new THREE.Raycaster(); const shoot = (obj, P0, dir) => { rc3.set(new THREE.Vector3(...P0), new THREE.Vector3(...dir)); rc3.far = L2 + 5; const h = rc3.intersectObject(obj, true)[0]; return h ? +h.distance.toFixed(2) : null; };
      const dOut = shoot(mesh1(gr.g2.near.solid), [o3[0], gr.base + hh, o3[1]], [dn3[0], 0, dn3[1]]); const IM = insOf(gr.p, gr.b); const dIn = shoot(IM.gr, [o3[0], gr.base + hh, o3[1]], [dn3[0], 0, dn3[1]]);
      const pm = W2(L2 / 2, (back + R.B[3]) / 2); const up = shoot(mesh1(gr.g2.near.solid), [pm[0], gr.base + R.Hp + 1.6, pm[1]], [0, 1, 0]);
      const cutBack = B3.cuts(gr.b).some(c2 => inBox(c2, bk3[0], gr.base + hh, bk3[1]));
      ok('Tp2. o pórtico do templo grego entre as antas: da rua, pelo meio, o olhar chega ao fundo dele (a parede da cela), de fora e com o interior desenhado; o teto, o entablamento',
        dOut !== null && Math.abs(dOut - dl3) <= 0.06 && dIn !== null && Math.abs(dIn - dl3) <= 0.06 && cutBack && up !== null && Math.abs(up - (R.Hc - 1.6)) <= 0.05,
        `da frente do lote ao fundo do pórtico ${dl3.toFixed(2)} m, o olhar a ${hh.toFixed(1)} m (entre o alto do portal e o teto): de fora para a ${dOut} m, com o interior a ${dIn} m; o fundo cede ao interior: ${cutBack}; do chão do pórtico para cima, o teto a ${up === null ? '-' : (up + 1.6).toFixed(2)} m (o entablamento a ${R.Hc.toFixed(2)} m)`);
      // Tp3. the body: up the flight from the street, between the columns into the porch; the portal opened by the hand, into the nave
      const v3 = [...S.villagers.values()].filter(q => q.set === gr.set.id && q.age >= 18 && q.age < 55 && !q.inside && G.Possess.can(q).ok).sort((a2, b2) => a2.id - b2.id)[0];
      const pr = gr.p.rooms.find(m => m.fn === 'pronaos'), nv = gr.p.rooms.find(m => m.fn === 'nave'); const dr = pr && nv && H.doorBetween(gr.p, pr.id, nv.id); let walkG = null;
      if (v3 && dr) { const st0 = W2(L2 / 2, L2 + 2.5); G.inSim++; G.Vg.endTask(v3); v3.x = st0[0] / TL; v3.y = st0[1] / TL; v3.path = null; G.inSim--; S.time = 0.42;
        G.Possess.take(v3); G.Avatar.attach(v3, Math.atan2(-dn3[1], -dn3[0])); G.Cam3D.attach(G.Avatar.pos(), 0); for (let k = 0; k < 6; k++) frame();
        const dP = walkTo(pm[0], pm[1], 900, 0.3); const inP = { lv: lvl(), y: +(st().Y - gr.base).toFixed(2), d: +dP.toFixed(2) };
        G.inSim++; const od = In.useDoor(gr.b, dr.id, 'abrir', v3); G.inSim--; const bx3 = gr.b.x * TL, bz3 = gr.b.y * TL;
        walkTo(bx3 + dr.a[0], bz3 + dr.a[1], 600); walkTo(bx3 + dr.b[0], bz3 + dr.b[1], 600); const nm3 = [bx3 + (nv.r[0] + nv.r[2]) / 2, bz3 + (nv.r[1] + nv.r[3]) / 2]; const dN = walkTo(nm3[0], nm3[1], 900, 0.3);
        walkG = { inP, od: od.ok ? 'aberto' : od.why, inN: { lv: lvl(), y: +(st().Y - gr.base).toFixed(2), d: +dN.toFixed(2), inside: G.Possess.body() && G.Possess.body().inside === gr.b.id } };
        G.Possess.release('deus'); G.Avatar.detach(); }
      ok('Tp3. o corpo sobe o lance do templo grego, entra no pórtico entre as colunas e, pelo portal aberto, na nave', !!walkG && walkG.inP.d < 0.5 && Math.abs(walkG.inP.y - R.Hp) < 0.1 && walkG.inN.d < 0.6 && Math.abs(walkG.inN.y - R.Hp) < 0.1 && walkG.inN.inside,
        walkG ? `no pórtico a ${walkG.inP.d} m do ponto, piso ${walkG.inP.lv}, a ${walkG.inP.y} m (o piso a ${R.Hp}); o portal ${walkG.od}; na nave a ${walkG.inN.d} m, a ${walkG.inN.y} m, dentro: ${walkG.inN.inside}` : 'sem corpo ou sem o portal da nave'); }
    // Tp4. the Egyptian's pylon: its towers to their top, their flags the form's top; the gate the form paints shut given way to the
    // inside's leaf; the columns of the hypostyle hall drawn with the inside (L-558)
    const eg = rows.find(t => t.civ === 'egipcio');
    if (eg) { const R = eg.Rk; const towers = R.towers.map(r => { const bb = box2(eg.W, r); let n = 0; for (let i = 0; i < eg.P2.length; i += 3) if (Math.abs(eg.P2[i + 1] - (eg.base + R.Hp + R.Ht)) < 0.02 && eg.P2[i] >= bb[0] - 0.01 && eg.P2[i] <= bb[2] + 0.01 && eg.P2[i + 2] >= bb[1] - 0.01 && eg.P2[i + 2] <= bb[3] + 0.01) n++; return n; });
      const gp = eg.W(R.gateD.p[0], R.gateD.p[1] + 0.15 + 0.02); const gateCut = B3.cuts(eg.b).some(c2 => inBox(c2, gp[0], eg.base + R.Hp + 1.0, gp[1])); const seen = innerSeen(eg, insOf(eg.p, eg.b));
      ok('Tp4. o templo egípcio: as torres do pilone até o alto delas, as bandeiras no alto da forma; o portão pintado cede à folha do interior; as colunas do salão hipostilo com o interior (L-558)', towers.every(n => n >= 4) && Math.abs(eg.topN - eg.F.top) <= 0.3 && gateCut && seen.n === seen.of && seen.of > 0,
        `as torres a ${(R.Hp + R.Ht).toFixed(1)} m: ${towers.join(', ')} pontos no alto; o alto do 3D ${eg.topN.toFixed(2)} m (as bandeiras, a forma ${eg.F.top.toFixed(2)}); o portão: corte ${gateCut}; colunas de dentro ${seen.n} de ${seen.of}`); }
    // Tp5. the Norse's hof: the tower standing on its roof — down to its slopes at its sides, not clear of them —, the spire to the
    // form's top, the roof of shingles up to its ridge; the hall's posts drawn with the inside (L-558)
    const no = rows.find(t => t.civ === 'nordico');
    if (no) { const R = no.Rk, F2 = no.F; const top = R.Hp + R.Hw; const tw = F2.els.find(e => e.k === 'bloco' && e.tabuas === 4 && e.y0 > top + 0.5), roof = F2.els.find(e => e.k === 'telhado');
      let lo = Infinity, ySide = NaN, shRidge = 0;
      if (tw && roof) { const bb = box2(no.W, tw.r); for (let i = 0; i < no.P2.length; i += 3) if (no.P2[i + 1] > no.base + top + 0.5 && no.P2[i] >= bb[0] - 0.02 && no.P2[i] <= bb[2] + 0.02 && no.P2[i + 2] >= bb[1] - 0.02 && no.P2[i + 2] <= bb[3] + 0.02) lo = Math.min(lo, no.P2[i + 1]);
        const s = (tw.r[2] - tw.r[0]) / 2, half = (roof.r[2] - roof.r[0]) / 2 + (roof.ov || 0); ySide = no.base + roof.y1 - (roof.y1 - roof.y0) * s / half; }
      if (roof) for (let i = 0; i < no.AP.length; i++) if (no.AP[i] === B3.PAT.shingle && Math.abs(no.P2[i * 3 + 1] - (no.base + roof.y1)) < 0.02) shRidge++;
      const seen = innerSeen(no, insOf(no.p, no.b));
      ok('Tp5. o hof nórdico: a torre de pé no telhado, a flecha no alto da forma, o telhado de tabuinhas até a cumeeira; os esteios do salão com o interior (L-558)', !!tw && lo <= ySide + 0.01 && lo >= ySide - 0.3 && Math.abs(no.topN - F2.top) <= 0.3 && shRidge > 0 && seen.n === seen.of && seen.of > 0,
        tw ? `o pé da torre a ${(lo - no.base).toFixed(2)} m, o telhado ao lado dela a ${(ySide - no.base).toFixed(2)} m (a forma a punha a ${tw.y0.toFixed(2)} m, solta das águas); a flecha a ${no.topN.toFixed(2)} m (a forma ${F2.top.toFixed(2)}); tabuinhas na cumeeira: ${shRidge} pontos; esteios ${seen.n} de ${seen.of}` : 'sem a torre na forma'); }
    // Tp6. the camera in each: in the cella — the porch, the nave, up to its eaves — never in stone (the entablature over it, the
    // porch's columns); under the floor of the precinct, in the platform's stone
    const camT = rows.map(t => { const R = t.Rk, B = R.B; const mid = t.W((B[0] + B[2]) / 2, (B[1] + B[3]) / 2), pod = t.W(R.L / 2, (B[3] + R.podium[3]) / 2);
      return { civ: t.civ, cella: [t.base + R.Hp + 1.6, t.base + R.eave - 0.3].some(yy => B3.stoneAt(t.b, mid[0], yy, mid[1])), pod: B3.stoneAt(t.b, pod[0], t.base + R.Hp - 0.3, pod[1]) }; });
    ok('Tp6. a câmera nos templos: na cela nunca na pedra; sob o piso do recinto, na pedra da plataforma', camT.length === 4 && camT.every(q => !q.cella && q.pod), camT.map(q => `${q.civ}: na cela ${q.cella ? 'NA PEDRA' : 'livre'}, sob o recinto ${q.pod ? 'na pedra' : 'FORA dela'}`).join(' · ')); }
  // ================ M. the body at its own table (D-104): «Sentar à mesa» always; seated, the meal — when there is what to eat ================
  // (a grown-up of Roma whose house has a table, from the street in by its door — opened by the hand, as the verb does —, to it)
  { const tableOf = h => { const p = h && h.built && h.type !== 'ruin' && Sp.planNow(h); return p && p.ok && p.entrance && p.entrance.out && p.items.some(it => /mesa/i.test((In.ITEMS[it.kind] || {}).name || '')) ? p : null; };
    const cands = [...S.villagers.values()].filter(q => q.age >= 18 && q.age < 60 && q.home && !q.inside && !q.sleeping && q.set === (PZ.set || {}).id && G.Possess.can(q).ok && tableOf(S.buildings.get(q.home))).sort((a2, b2) => a2.id - b2.id).slice(0, 6);
    let M0 = null, tried = 0;
    for (const w of cands) {
      const h = S.buildings.get(w.home), hp = tableOf(h); const hx = h.x * TL, hz = h.y * TL; const e = hp.entrance; tried++;
      G.inSim++; G.Vg.endTask(w); w.x = (hx + e.out[0]) / TL; w.y = (hz + e.out[1]) / TL; w.path = null; S.time = 0.42; In.useDoor(h, e.door, 'abrir', w); G.inSim--;
      G.Possess.take(w); G.Avatar.attach(w, 0); for (let k = 0; k < 6; k++) frame();
      walkTo(hx + e.x, hz + e.z, 600); walkTo(hx + e.x - (e.out[0] - e.x) * 0.6, hz + e.z - (e.out[1] - e.z) * 0.6, 300);
      const lv = lvl(); const here = () => [st().X - hx, st().Z - hz];
      const pl = lv === undefined ? null : In.freeNear(h, lv, here()[0], here()[1], 30).filter(q => q.use === 'comer').sort((a2, b2) => Math.hypot(a2.x - here()[0], a2.z - here()[1]) - Math.hypot(b2.x - here()[0], b2.z - here()[1]))[0];
      if (pl) { const sf = In.standFor(h, pl, here()[0], here()[1]); walkTo(hx + sf[0], hz + sf[1], 600, 0.3);
        if (Math.hypot(st().X - hx - sf[0], st().Z - hz - sf[1]) < 0.6) {
          const look = () => { const ya = Math.atan2(hz + pl.z - st().Z, hx + pl.x - st().X); IN.camYaw = ya; st().yaw = ya; frame(); return G.Interact.best(); };
          // (not hungry, the pantry as it is: at the table it sits)
          G.inSim++; w.hunger = 5; G.inSim--; const b0 = look(); let seated = false;
          if (b0 && b0.id === 'lugar') { G.Interact.run(b0); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame(); seated = !!(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); }
          // (seated: the meal of the house — without hunger, said why; with hunger, offered)
          const b1 = G.Interact.best(); G.inSim++; w.hunger = 60; G.inSim--; const b2 = G.Interact.best();
          const tx = b => (b ? `${b.id} «${b.label}»${b.ok ? '' : ' (' + b.why + ')'}` : 'nada');
          M0 = { who: w.name, house: h.type + '#' + h.id, b0: tx(b0), seated, b1: tx(b1), b2: tx(b2), ok: !!b0 && b0.id === 'lugar' && b0.ok && seated && !!b2 && b2.id === 'atividade' && /comer|cear/i.test(b2.label) };
        }
      }
      G.Possess.release('deus'); G.Avatar.detach(); for (let k = 0; k < 90; k++) frame(); if (M0) break; // (the world takes the person back in its step, as in the game)
    }
    ok('M. o corpo à própria mesa (D-104): sem fome, senta; sentado, a refeição da casa', !!M0 && M0.ok, M0 ? `${M0.who} em casa (${M0.house}): de pé, sem fome — ${M0.b0}; sentado: ${M0.seated}; sentado, sem fome — ${M0.b1}; com fome — ${M0.b2}` : `nenhuma das ${tried} casas com mesa de Roma deixou o corpo chegar à mesa`); }
  // ---------------- 6. the verifier ----------------
  const vb = QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg)); const er = M.erros();
  ok('6. o verificador limpo, sem erro de módulo', !vb.length && !Object.keys(er.mod).length && !er.console.length, `${vb.length ? vb.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; módulos ${JSON.stringify(er.mod)}; console ${er.console.slice(0, 2).join(' | ') || 'limpo'}`);
  // ================ C13. the colossal Colosseum of 13 tiles: the same proofs as the 10's (1 to 5), the ground levelled the same way —
  // in the Roma of the ready world «cidade», where a lot of 13 is free (the metropole has none within 90 tiles of any Roman town) ================
  M.pronto('cidade'); const bad13 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg)); const f13 = H.found('Roma', 60, 'colossal');
  if (!f13.b) ok('C13. o Coliseu de 13 casas fundado em Roma (cidade)', false, f13.why); else colosseum(f13, 'C13 · ', G.S);
  const vb13 = QA.check().filter(q => q.sev <= 2 && !bad13.has(q.sys + '|' + q.msg)); const er13 = M.erros();
  ok('C13 · 6. o verificador limpo, sem erro de módulo', !vb13.length && !Object.keys(er13.mod).length && !er13.console.length, `${vb13.length ? vb13.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo'}; módulos ${JSON.stringify(er13.mod)}; console ${er13.console.slice(0, 2).join(' | ') || 'limpo'}`);
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
      const site = H.siteOf(set, n, 60, { cross: true }) || H.siteOf(set, n, 60); const drop0 = H.drop(site[0], site[1], n); const h0 = drop0 > 3 ? H.aplainar(site[0], site[1], n) : null;
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
      G.inSim++; let b; try { b = G.Village.handFound(set, 'maravilha', 'maravilha', { built: true, x: s.site[0] + Math.floor(s.n / 2), y: s.site[1] + Math.floor(s.n / 2), R: 0.5 }); } finally { G.inSim--; }
      if (!b) return { ok: false }; window.__b = b.id; const nm = H.numbers(b); const e = nm.p.entrance; const dx = e.out[0] - e.x, dz = e.out[1] - e.z, l = Math.hypot(dx, dz) || 1; const o = [dx / l, dz / l];
      const reach = q => H.reach(nm.face, nm.C, q); const dg = [(o[0] - o[1]) / Math.SQRT2, (o[1] + o[0]) / Math.SQRT2];
      window.__nm = { C: nm.C, H: nm.H, base: nm.base, sandY: nm.sandY, e, o, front: reach(o), back: reach([-o[0], -o[1]]), diag: reach(dg), dg };
      return { ok: true, id: b.id, x: b.x, y: b.y, teste: !!G.ColiseuTeste };
    });
    if (!r1.ok) { ok('7. o Coliseu fundado', false, 'o handFound não fundou'); return fails; }
    // (its plan made — once, when the eye first asks for it: Space.plan, the pump's — and its chunk drawn with it: the frame
    // measured with the Colosseum in view as it stays; the one time a chunk is drawn again for it is the part 1's measure)
    await page.evaluate(() => { const V = window.__VIS; G.Space.planNow(G.S.buildings.get(window.__b)); V.warm(2); V.f(10, 33); });
    const after = await measure();
    console.log(`(o Coliseu ${r1.teste ? 'DE TESTE' : 'do M1'} #${r1.id} em ${r1.x},${r1.y}; o chão do lote tinha ${r0.drop0} m de desnível${r0.h0 !== null ? ', aplainado pela mão do deus' : ''}; o corpo: ${r0.who})`);
    // (and in turns, under the same load — the machine is shared: a frame measured before the founding and one a minute after are
    // worth little, T-433 —: the chunk of the Colosseum's corner drawn with it and without it, swapped every 15 frames, six times
    // each; the frame as the e8 measures it. The one time the chunk is drawn again for it is part 1's)
    const turns = await page.evaluate(() => {
      const V = window.__VIS, R3 = G.Realm, B3 = G.Build3D, S = G.S; const b = S.buildings.get(window.__b); const T = G.Space.TILE, C = 16;
      const st = G.Avatar.state(); const s = window.__site; const cx = (s.site[0] + s.n / 2) * T, cz = (s.site[1] + s.n / 2) * T; const yaw = Math.atan2(cz - st.Z, cx - st.X);
      R3.setQuality('media'); V.warm(2); st.yaw = yaw; G.Cam3D.OPT.follow = false; G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.12; G.Cam3D.dist = 4.8; V.f(20, 33);
      const x0 = Math.floor(b.x / C) * C, y0 = Math.floor(b.y / C) * C;
      // (the chunk's buildings as the realm drew them: its solid mesh — the one with as many points as the chunk's buildings drawn
      // again here, the same drawing)
      const MS = R3.mats().solid; let M = null; const ref = B3.nearGeo(x0, y0, C); const nRef = ref.solid ? ref.solid.attributes.position.count : -1; for (const q in ref) if (ref[q]) ref[q].dispose();
      R3.scene().traverse(o => { if (!M && o.isMesh && o.material === MS && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count === nRef) M = o; });
      if (!M) { R3.setQuality('baixa'); return { none: true }; }
      const keep = S.buildings.get(b.id); S.buildings.delete(b.id); let wo; try { wo = B3.nearGeo(x0, y0, C); } finally { S.buildings.set(b.id, keep); }
      const withG = M.geometry, noG = wo.solid || new THREE.BufferGeometry();
      const run = (g, n, out) => { M.geometry = g; for (let k = 0; k < n; k++) { const t0 = performance.now(); G.Main.frameFor(16); out.push(performance.now() - t0); } };
      const A = [], B = []; run(withG, 6, []); for (let k = 0; k < 6; k++) { run(withG, 15, A); run(noG, 15, B); }
      M.geometry = withG; for (const q in wo) if (wo[q] && wo[q] !== noG) wo[q].dispose(); noG.dispose();
      { const re = B3.nearGeo(x0, y0, C); for (const q in re) if (re[q]) re[q].dispose(); } // (the chunk's lamps and tops as they were)
      R3.setQuality('baixa');
      const q = (a, p) => { const s2 = a.slice().sort((x, y) => x - y); return +s2[Math.min(s2.length - 1, Math.floor(s2.length * p))].toFixed(1); };
      return { withM: q(A, 0.5), withP: q(A, 0.95), noM: q(B, 0.5), noP: q(B, 0.95), tris: [Math.round(withG.attributes.position.count / 3), wo.solid ? Math.round(wo.solid.attributes.position.count / 3) : 0] };
    });
    const load = require('os').loadavg()[0], cores = require('os').cpus().length;
    ok('8. o quadro do Modo Encarnado com o Coliseu à vista (a medida do e8, qualidade média, em turnos com e sem ele): mediana ≤ 13 ms (ou não acima da sem ele × 1,15) e p95 não pior que a sem ele × 1,15', !turns.none && (turns.withM <= 13 || turns.withM <= turns.noM * 1.15 + 0.5) && turns.withP <= turns.noP * 1.15 + 0.5,
      turns.none ? 'o pedaço do Coliseu não achado na cena' : `carga da máquina ${load.toFixed(1)} em ${cores} núcleos; em turnos (6 × 15 quadros cada): sem o Coliseu ${turns.noM} ms (p95 ${turns.noP}) → com ele ${turns.withM} ms (p95 ${turns.withP}); o pedaço do canto ${turns.tris[1]} → ${turns.tris[0]} triângulos`);
    console.log(`DESEMPENHO | monumental | Roma da metrópole, o corpo diante do Coliseu: em turnos, mediana ${turns.noM} → ${turns.withM} ms, p95 ${turns.noP} → ${turns.withP} ms; antes e depois de fundá-lo (um minuto entre as duas, carga ${load.toFixed(1)}): mediana ${before.med} → ${after.med} ms, p95 ${before.p95} → ${after.p95} ms, chamadas ${before.calls} → ${after.calls}, triângulos ${before.tris} → ${after.tris}`);
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
    // 11. the palace of courts (M2's of 6 tiles, the Roman's): founded whole by the god's hand in Roma; the body before its flight,
    // then in by its gate to the court, then through the throne hall's portal to before the throne — a photo at each, in the third
    // person (the eye behind the body, as the game holds it)
    const rp = await page.evaluate(() => {
      const H = window.__MON; const PZ = H.palace('Roma', 'palacio', 'palacio', 60); if (!PZ.b) return { ok: false, why: PZ.why };
      const R = PZ.Rk, W = PZ.W, b = PZ.b; const T = G.Space.TILE; const yawOf = (a, c) => Math.atan2(c[1] - a[1], c[0] - a[0]);
      const front = W(R.L / 2, R.L + 4.5), into = yawOf(W(R.L / 2, R.L), W(R.L / 2, R.C[1]));
      window.__pz = { id: b.id, front, into, gate: [b.x * T + PZ.e.x, b.y * T + PZ.e.z], court: W(R.L / 2 - 2.6, R.C[3] - 2.2), side: W(R.L / 2 - 2.6, R.C[1] + 1.4), door: W(R.L / 2, R.C[1] + 1.0), hall: W(R.L / 2 + 1.8, (R.B[1] + R.C[1]) / 2 + 1.2), throne: W(R.L / 2, R.B[1]), // (in the hall a little aside of the throne's axis: the throne beside the body, not behind it)
       
        hallDoor: (() => { const d = H.doorBetween(PZ.p, PZ.court.id, PZ.hall.id); return d ? d.id : -1; })() };
      return { ok: true, id: b.id, x: b.x, y: b.y, st: G.Civ.idOfFac(PZ.set.fac) };
    });
    if (!rp.ok) ok('11. o palácio fundado em Roma', false, rp.why);
    else {
      const walkIn = async stage => page.evaluate(s => { const H = window.__MON, P = window.__pz; const b = G.S.buildings.get(P.id); const T = G.Space.TILE; const v = G.Possess.body();
        if (s === 'fora') { G.inSim++; v.x = P.front[0] / T; v.y = P.front[1] / T; v.path = null; G.inSim--; G.Avatar.attach(v, P.into); return { d: 0 }; }
        if (s === 'patio') { H.walk(P.gate[0], P.gate[1], 600); const d = H.walk(P.court[0], P.court[1], 600); return { d: +d.toFixed(2), lv: G.Possess.level() }; }
        // (the portal opened by the hand, as the verb does: Interiors.useDoor)
        G.S.time = 0.42; if (P.hallDoor >= 0) { G.inSim++; G.Interiors.useDoor(b, P.hallDoor, 'abrir', v); G.inSim--; }
        H.walk(P.side[0], P.side[1], 600); H.walk(P.door[0], P.door[1], 600); const d = H.walk(P.hall[0], P.hall[1], 600); return { d: +d.toFixed(2), lv: G.Possess.level() };
      }, stage);
      const w1 = await walkIn('fora'); await shot('4-palacio-fora', { body: rp && (await page.evaluate(() => window.__pz.into)), yaw: await page.evaluate(() => window.__pz.into), pitch: -0.42, dist: 7.5 });
      const w2 = await walkIn('patio'); const into = await page.evaluate(() => window.__pz.into); await shot('5-palacio-patio', { body: into, yaw: into, pitch: -0.3, dist: 5.2 });
      const w3 = await walkIn('salao'); await shot('6-palacio-trono', { body: into, yaw: into, pitch: -0.12, dist: 3.6 });
      const pics2 = ['4-palacio-fora', '5-palacio-patio', '6-palacio-trono'].map(n => { const f = path.join(OUT, n + '.jpg'); return fs.existsSync(f) ? `${n}.jpg ${(fs.statSync(f).size / 1024).toFixed(0)} KB` : `${n}: não saiu`; });
      ok('11. o palácio de pátios (6 casas, romano): de fora, no pátio e no salão do trono, em terceira pessoa', pics2.every(q => /KB/.test(q)) && w2.d < 1.5 && w3.d < 1.5, `#${rp.id} em ${rp.x},${rp.y} (${rp.st}); o corpo no pátio a ${w2.d} m do ponto (piso ${w2.lv}), no salão a ${w3.d} m (piso ${w3.lv}); ${pics2.join(' · ')}`);
      void w1;
    }
    // 12. the temples of 8 tiles by their form (T-439, T-410) — the Greek's in Argos, the Egyptian's in Mênfis, the Norse's in Birka —
    // and the palaces of 6 of those peoples — in Argos, Mênfis and Hedeby —, founded whole by the god's hand: each from outside, the
    // eye raised before its front's left corner, the body on the street before it; and the Egyptian's hypostyle hall from inside,
    // the body walked in by the pylon's gate and the hall's portal (its columns: L-558)
    const more = await page.evaluate(() => {
      const H = window.__MON; const T = G.Space.TILE; const out = [];
      for (const [town, type, step, tag] of [['Argos', 'temple', 'monumental', '7-templo-grego'], ['Mênfis', 'temple', 'monumental', '8-templo-egipcio'], ['Birka', 'temple', 'monumental', '9-templo-nordico'],
        ['Argos', 'palacio', 'palacio', '11-palacio-grego'], ['Mênfis', 'palacio', 'palacio', '12-palacio-egipcio'], ['Hedeby', 'palacio', 'palacio', '13-palacio-nordico']]) {
        const z = type === 'temple' ? H.temple(town, step, 60) : H.palace(town, type, step, 60); if (!z.b) { out.push({ tag, why: z.why }); continue; }
        const L = z.F.L, W = z.W, top = z.F.top, base = z.base; const P = W(-0.2 * L, 1.42 * L), A = W(0.5 * L, 0.45 * L), st = W(0.5 * L, L + 2.2);
        out.push({ tag, id: z.b.id, x: z.b.x, y: z.b.y, st: G.Civ.idOfFac(z.set.fac), at: st, into: Math.atan2(A[1] - st[1], A[0] - st[0]), eye: { P: [P[0], base + Math.max(7, top * 0.62), P[1]], A: [A[0], base + top * 0.3, A[1]] } });
      }
      window.__more = out; return out;
    });
    const pics3 = [];
    for (const m of more) { if (m.why) { pics3.push(`${m.tag}: ${m.why}`); continue; } await shot(m.tag, { at: m.at, body: m.into, yaw: m.into, pitch: -0.3, dist: 6, eye: m.eye }); const f = path.join(OUT, m.tag + '.jpg'); pics3.push(fs.existsSync(f) ? `${m.tag}.jpg ${(fs.statSync(f).size / 1024).toFixed(0)} KB (#${m.id} em ${m.x},${m.y}, ${m.st})` : `${m.tag}: não saiu`); }
    // (into the Egyptian's hall: by the gate and across the court, the portal opened by the hand — Interiors.useDoor —, by day)
    const hall = await page.evaluate(() => {
      const H = window.__MON; const m = (window.__more || []).find(q => q.tag === '8-templo-egipcio'); if (!m || !m.id) return { ok: false, why: 'sem o templo egípcio' };
      const b = G.S.buildings.get(m.id); const z = H.palaceOf(b); const T = G.Space.TILE; const v = G.Possess.body(); const p = z.p, R = z.Rk;
      const court = p.rooms.find(q => q.fn === 'patio'), hy = p.rooms.find(q => q.fn === 'hipostila'); const e = p.entrance; G.S.time = 0.42;
      G.Avatar.place((b.x * T + e.out[0]) / T, (b.y * T + e.out[1]) / T); window.__VIS.warm(2); window.__VIS.f(3);
      G.inSim++; G.Interiors.useDoor(b, e.door, 'abrir', v); G.inSim--; H.walk(b.x * T + e.x, b.y * T + e.z, 600);
      const d = court && hy && H.doorBetween(p, court.id, hy.id); if (d) { G.inSim++; G.Interiors.useDoor(b, d.id, 'abrir', v); G.inSim--; H.walk(b.x * T + d.a[0], b.y * T + d.a[1], 600); H.walk(b.x * T + d.b[0], b.y * T + d.b[1], 600); }
      const mid = z.W(R.L / 2 + 0.8, (hy.r[1] + hy.r[3]) / 2 + 1.2); const dd = H.walk(mid[0], mid[1], 600); const back = z.W(R.L / 2, hy.r[1]);
      return { ok: true, d: +dd.toFixed(2), inside: v.inside === b.id, into: Math.atan2(back[1] - mid[1], back[0] - mid[0]) };
    });
    if (hall.ok) await shot('10-templo-egipcio-salao', { body: hall.into, yaw: hall.into, pitch: -0.18, dist: 3.4 });
    { const f = path.join(OUT, '10-templo-egipcio-salao.jpg'); pics3.push(hall.ok && fs.existsSync(f) ? `10-templo-egipcio-salao.jpg ${(fs.statSync(f).size / 1024).toFixed(0)} KB (o corpo no salão: ${hall.inside}, a ${hall.d} m do ponto)` : `10-templo-egipcio-salao: ${hall.why || 'não saiu'}`); }
    ok('12. os templos de 8 casas (grego, egípcio, nórdico) e os palácios de 6 (grego, egípcio, nórdico) pela forma: de fora; o salão hipostilo por dentro', pics3.every(q => /KB/.test(q)) && hall.ok && hall.inside, pics3.join(' · '));
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
