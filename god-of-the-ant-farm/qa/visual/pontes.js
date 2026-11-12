// pontes: as pontes do Modo Encarnado (Bairros Vivos, o agente P: D-190, D-191, L-860 a L-863) — em Node, sem navegador: o 3D do
// jogo pelo qa/visual/tres-node.js (só a geometria), os mundos prontos e um mundo de mentira, chato, com um canal.
// Uma ponte é a rua sobre uma casa de rio (S.road e T.RIVER); todas as casas que se tocam são uma ponte só. O mundo dá pouca
// altura a ela: o tabuleiro é o dos pés (G.Space.deckAt, 12 cm sobre a face da água), e isso não muda.
//   p1. Toda casa de ponte dos mundos prontos tem tabuleiro, de perto e de longe.
//   p2. A altura andável é exatamente a de antes: G.Space.deckAt e G.Space.footAt, ponto a ponto, contra a fórmula de hoje.
//   p3. O tabuleiro desenhado está nos pés (L-860: ficava 15 cm acima deles) e nunca debaixo do chão desenhado; nada da ponte
//       fica sobre o caminho de quem passa.
//   p4. A ponte de pedra é de pedra: o calçamento da rua no tabuleiro, a pedra do povo nas muretas (os padrões da pilha, não a
//       cor lisa única), o vão escuro sob o arco ou a verga em cada lado sobre a água, a mureta com o capeamento mais largo que ela.
//   p5. Nenhuma peça fora da casa da ponte para o lado de um prédio, de uma margem ou do resto da ponte, nem dentro de um prédio.
//   p6. O estilo segue o povo do chão (o prédio mais perto do meio da ponte, como os prédios leem o seu: b.style): conferido por
//       uma busca da própria prova; a ponte de Roma e a de Mênfis diferem.
//   p7. A mesma ponte duas vezes dá a mesma geometria, com os dois acasos mexidos no meio; desenhar não sorteia.
//   p8. Só desenha: o save do mundo igual até o último caractere antes e depois de desenhar tudo, de perto e de longe.
//   p9. A figura de longe: a laje e as muretas, sem peça fina; os triângulos de perto e de longe, por casa e no mundo inteiro,
//       contra os de antes.
//   p10. Os outros pisam onde o corpo pisa (L-861: ficavam no nível da água, sob o tabuleiro).
//   p11. O corpo atravessa cada ponte de uma margem à outra pelas portas do jogo (G.Avatar), sem nadar, sem escalar, com os pés
//       no chão do jogo e o tabuleiro desenhado debaixo deles, sem peça da ponte no caminho (L-862: a mureta atravessada).
//   p12. O mundo de mentira: a ponte comprida (três casas em linha) de cada povo — um vão por casa, o pilar entre eles, os
//       encontros nas margens —, o arco pleno de Roma e o arco baixo de tijolo, as baias do Egito, o vão em degraus da Grécia, a
//       calçada asteca, a madeira do norte sobre pedra seca, a ponte de madeira de uma rua de terra; a ponte em diagonal com o
//       canto aberto; a assinatura do pedaço muda quando o povo ou os lados da ponte mudam.
//   node qa/visual/pontes.js [mundo,mundo…]   (padrão: metropole,mega,mundial)   ONLY=p3,p11   VERB=1
'use strict';
const path = require('path');
const T3 = require(path.join(__dirname, 'tres-node.js')); const { G, M } = T3.load({ extra: ['qa/visual/corpo-qa.js'] });
const WORLDS = (process.argv[2] || 'metropole,mega,mundial').split(','); const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const want = k => !ONLY || ONLY.includes(k);
const VERB = !!process.env.VERB;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | pontes ${name} | ${info}`); if (!c) fails.push(name); };
const R3 = G.Realm, Sp = G.Space, W = G.W, T = G.T, TL = Sp.TILE, HM = Sp.HM, PAT = G.Build3D.PAT, P3 = G.People3D;
const SIDE = [[0, -1], [1, 0], [0, 1], [-1, 0]], SNAME = ['norte', 'leste', 'sul', 'oeste'];
// (the proof's own table of what each people builds a bridge of — the stack's names)
const STUFF = { romano: 'ashlar', classico: 'brick', egipcio: 'sandstone', asteca: 'tezontle', grego: 'marble' };
const DARK = R3.lin([30, 33, 38]);
let S, N;
const isB = i => S.type[i] === T.RIVER && S.road[i] > 0;
const bridgeTiles = () => { const o = []; for (let i = 0; i < N * N; i++) if (isB(i)) o.push(i); return o; };
// ------------------------------ a tile's picture, as triangles ------------------------------
function trisOf(pic) {
  if (!pic || !pic.geo) return []; const p = pic.geo.attributes.position.array, c = pic.geo.attributes.color.array, q = pic.geo.attributes.aP.array, out = [];
  const names = new Array(p.length / 3).fill(''); for (let k = 0; k < pic.marks.length; k++) { const a = pic.marks[k][2], b = k + 1 < pic.marks.length ? pic.marks[k + 1][2] : p.length / 3; for (let v = a; v < b; v++) names[v] = pic.marks[k][0]; }
  for (let v = 0; v < p.length / 3; v += 3) out.push({ v: Array.from(p.subarray(v * 3, v * 3 + 9)), c: [c[v * 3], c[v * 3 + 1], c[v * 3 + 2]], pat: q[v], part: names[v] });
  return out;
}
const near = (x, y) => trisOf(R3.bridgesOf(x, y, 1, 1, false)), far = (x, y) => trisOf(R3.bridgesOf(x, y, 1, 1, true));
// (a ray against a picture's triangles, each seen from its front only, as the game's material draws them: the nearest hit)
function shoot(tris, O, D) {
  let best = null; const l = Math.hypot(D[0], D[1], D[2]), d = [D[0] / l, D[1] / l, D[2] / l];
  for (const t of tris) { const v = t.v;
    const e1x = v[3] - v[0], e1y = v[4] - v[1], e1z = v[5] - v[2], e2x = v[6] - v[0], e2y = v[7] - v[1], e2z = v[8] - v[2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x, nd = nx * d[0] + ny * d[1] + nz * d[2]; if (nd >= -1e-12) continue;
    const tt = (nx * (v[0] - O[0]) + ny * (v[1] - O[1]) + nz * (v[2] - O[2])) / nd; if (tt <= 1e-6 || (best && tt >= best.t)) continue;
    const px = O[0] + d[0] * tt - v[0], py = O[1] + d[1] * tt - v[1], pz = O[2] + d[2] * tt - v[2];
    const d11 = e1x * e1x + e1y * e1y + e1z * e1z, d12 = e1x * e2x + e1y * e2y + e1z * e2z, d22 = e2x * e2x + e2y * e2y + e2z * e2z, dp1 = px * e1x + py * e1y + pz * e1z, dp2 = px * e2x + py * e2y + pz * e2z;
    const den = d11 * d22 - d12 * d12; if (Math.abs(den) < 1e-18) continue; const a = (d22 * dp1 - d12 * dp2) / den, c = (d11 * dp2 - d12 * dp1) / den;
    if (a < -1e-7 || c < -1e-7 || a + c > 1 + 1e-7) continue; best = { t: tt, tri: t, p: [O[0] + d[0] * tt, O[1] + d[1] * tt, O[2] + d[2] * tt] }; }
  return best;
}
const down = (tris, X, Z, y) => shoot(tris, [X, y + 6, Z], [0, -1, 0]);
const isDark = t => Math.abs(t.c[0] - DARK[0]) < 2e-3 && Math.abs(t.c[1] - DARK[1]) < 2e-3 && Math.abs(t.c[2] - DARK[2]) < 2e-3 && t.pat === 0;
// (a tile's frame: its middle, the water's face, the feet's deck; a side's own — a along it, d out from the middle)
function frameOf(i) {
  const x = i % N, y = (i / N) | 0, CX = (x + 0.5) * TL, CZ = (y + 0.5) * TL;
  return { x, y, CX, CZ, wf: S.wl[i] * HM + 0.05, dk: Sp.deckAt(x + 0.5, y + 0.5), pl: R3.bridgePlan(x, y), br: R3.bridgeOf(i), timber: S.road[i] < 2 || R3.bridgeOf(i).st === 'nordico',
    pt: (s, a, d, yy) => [CX - a * SIDE[s][1] + d * SIDE[s][0], yy, CZ + a * SIDE[s][0] + d * SIDE[s][1]] };
}
// (the feet at a point of the world, metres: the body's own floor out of doors)
const feet = (X, Z) => G.Avatar.floorAt(X, Z);
// (the people of the ground, by the proof's own search: the styled building nearest the middle of the bridge's tiles)
function peopleOf(tiles) {
  let sx = 0, sy = 0; for (const j of tiles) { sx += (j % N) + 0.5; sy += ((j / N) | 0) + 0.5; } const cx = sx / tiles.length, cy = sy / tiles.length; let best = null, bd = Infinity;
  const civ = id => { const f = G.Fac.ofSet ? G.Fac.ofSet(id) : null; return f ? f.civ : null; };
  for (const b of S.buildings.values()) for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) {
    if (S.occ[yy * N + xx] !== b.id) continue; const d = (xx + 0.5 - cx) ** 2 + (yy + 0.5 - cy) ** 2; const st = b.style || civ(b.set); if (!st || Math.abs(xx + 0.5 - cx) > 10.5 || Math.abs(yy + 0.5 - cy) > 10.5) continue;
    if (d < bd - 1e-9 || (Math.abs(d - bd) <= 1e-9 && yy * N + xx < best.at)) { bd = d; best = { st, at: yy * N + xx, b }; } }
  return best;
}
const compOf = i => R3.bridgeOf(i).tiles.slice().sort((a, b) => a - b);

// ------------------------------ what every bridge's tile must be (p1–p6, p9) ------------------------------
function tileChecks(tag, tiles, stoneToo) {
  const R = { deckNear: 0, deckFar: 0, walk: 0, walkBad: [], pts: 0, exact: 0, over: 0, under: [], above: [], noHit: [], stone: 0, stoneBad: [], sides: 0, gapBad: [], capBad: [], out: [], inB: [], people: [], peopleBad: [], styles: new Set(), nearT: 0, farT: 0, maxNear: 0, maxFar: 0, farFine: [], before: 0 };
  for (const i of tiles) {
    const F = frameOf(i), tn = near(F.x, F.y), tf = far(F.x, F.y); R.nearT += tn.length; R.farT += tf.length; R.maxNear = Math.max(R.maxNear, tn.length); R.maxFar = Math.max(R.maxFar, tf.length);
    R.before += S.road[i] >= 2 ? 84 : 240; // (the game before: a deck of one box — eight planks on a wooden one — and on each side a beam, a wall or its rail and posts, a post into the bed)
    if (tn.some(t => t.part === 'deck')) R.deckNear++; if (tf.some(t => t.part === 'deck')) R.deckFar++;
    // p2: the walk's height, by today's formula
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) { const u = F.x + 0.02 + 0.24 * a, v = F.y + 0.02 + 0.24 * b; R.walk++;
      const dk = S.wl[i] * HM + 0.17, ft = Math.max(W.hAt(u, v) * HM, dk); if (Sp.deckAt(u, v) !== dk || Sp.footAt(u, v) !== ft) R.walkBad.push(`${F.x},${F.y}`); }
    // p3: the deck drawn at the feet, over the land drawn, nothing over the way
    for (let a = -1.4; a <= 1.41; a += 0.4) for (let b = -1.4; b <= 1.41; b += 0.4) { // (the way: between the walls and their piers)
      const X = F.CX + a, Z = F.CZ + b, ft = Sp.footAt(X / TL, Z / TL); let h = down(tn, X, Z, ft); if (!h && F.timber) h = down(tn, X + 0.06, Z + 0.06, ft); // (between two planks)
      R.pts++; if (!h) { R.noHit.push(`${F.x},${F.y} (${a},${b})`); continue; }
      const dy = h.p[1] - ft; if (Math.abs(dy) <= 0.002) R.exact++; R.over = Math.max(R.over, dy);
      if (dy < -0.002) R.under.push(`${F.x},${F.y} (${a},${b}): ${dy.toFixed(3)} m`); if (dy > 0.12) R.above.push(`${F.x},${F.y} (${a},${b}): ${dy.toFixed(3)} m (${h.tri.part})`);
      if (h.p[1] < Sp.drawnAt(X / TL, Z / TL) + 0.015) R.under.push(`${F.x},${F.y} (${a},${b}): sob o chão desenhado`); }
    // p5: nothing past the tile toward a building, a bank or the bridge's next tile; nothing inside a building; nothing high
    for (const t of tn.concat(tf)) for (let k = 0; k < 9; k += 3) { const X = t.v[k], Y = t.v[k + 1], Z = t.v[k + 2];
      for (let s = 0; s < 4; s++) { const d = (X - F.CX) * SIDE[s][0] + (Z - F.CZ) * SIDE[s][1]; if (d > 2 + (F.pl.k[s] === 2 ? 0.13 : F.pl.k[s] === 1 ? 0.07 : 1e-6)) R.out.push(`${F.x},${F.y} ${SNAME[s]} ${d.toFixed(3)} m (${t.part})`); }
      const tx = Math.floor(X / TL - 1e-9 * Math.sign(X - F.CX)), tz = Math.floor(Z / TL - 1e-9 * Math.sign(Z - F.CZ)); if (W.inb(tx, tz) && W.blocked(tz * N + tx)) R.inB.push(`${F.x},${F.y} em ${tx},${tz} (${t.part})`);
      if (Y > F.dk + 1.6) R.above.push(`${F.x},${F.y}: uma peça a ${(Y - F.dk).toFixed(2)} m do tabuleiro (${t.part})`); }
    // p6: the people of the ground
    const want = peopleOf(compOf(i)); const st = want ? want.st : null; R.styles.add(F.br.st);
    if (!st) R.people.push(`${F.x},${F.y}: nenhum prédio a dez casas (${F.br.st})`); else if (F.br.st !== (st === 'nordico' || STUFF[st] ? st : 'classico')) R.peopleBad.push(`${F.x},${F.y}: ${F.br.st}, e o prédio mais perto é ${want.b.type}#${want.b.id} ${st}`);
    // p9: the far figure has no fine piece
    const fine = tf.filter(t => !['deck', 'mureta'].includes(t.part)); if (fine.length || tf.length > 60) R.farFine.push(`${F.x},${F.y}: ${tf.length} triângulos, ${[...new Set(fine.map(t => t.part))].join(',')}`);
    if (F.timber) continue;
    // p4: stone — the street's paving on the deck, the people's stuff in the walls, not one flat colour
    R.stone++; const area = t => { const v = t.v, ax = v[3] - v[0], ay = v[4] - v[1], az = v[5] - v[2], bx = v[6] - v[0], by = v[7] - v[1], bz = v[8] - v[2]; return Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2; };
    const cols = new Set(tn.map(t => t.c.map(v => v.toFixed(4)).join(','))), all = tn.reduce((q, t) => q + area(t), 0), plain = tn.reduce((q, t) => q + (t.pat === 0 ? area(t) : 0), 0);
    const walled = F.pl.e.some(Boolean); // (a tile with no side over the water has its paving only)
    const deckOk = tn.filter(t => t.part === 'deck').every(t => t.pat === PAT.slab), wall = tn.filter(t => t.part === 'flanco'), wallOk = wall.every(t => t.pat === PAT[STUFF[F.br.st]]);
    R.plain = Math.max(R.plain || 0, plain / all); if (!deckOk || (walled && (!wall.length || !wallOk || cols.size < 4)) || plain > all * 0.12) R.stoneBad.push(`${F.x},${F.y} ${F.br.st}: tabuleiro ${deckOk ? 'de laje' : 'sem o calçamento'}, muretas ${wall.length ? (wallOk ? 'de ' + STUFF[F.br.st] : 'de outra pedra') : 'sem flanco'}, ${cols.size} cores, ${(100 * plain / all).toFixed(0)}% da área lisa`);
    for (let s = 0; s < 4; s++) { const e = F.pl.e[s]; if (!e) continue; R.sides++;
      const run = q => (q === 0 ? 2 : q === 1 ? 1.94 : q === 2 ? 1.92 : 0.7), A0 = -run(e[0]), A1 = run(e[1]), m0 = A0 + (e[0] ? 0.55 : 0.35), m1 = A1 - (e[1] ? 0.55 : 0.35), mid = (A0 + A1) / 2;
      // (the gap: from outside, level, a hand over the water — dark behind the wall's face; the wall over it)
      if (m1 - m0 >= 1.2) {
        const look = (a, yy) => { const h = shoot(tn, F.pt(s, a, 3.2, yy), [-SIDE[s][0], 0, -SIDE[s][1]]); return h ? { dark: isDark(h.tri), d: 3.2 - h.t, part: h.tri.part } : null; };
        const two = F.br.st === 'egipcio' && m1 - m0 >= 2.6, at = two ? [(m0 + mid) / 2 - 0.1, (mid + m1) / 2 + 0.1] : [(m0 + m1) / 2];
        for (const a of at) { const lo = look(a, F.wf + 0.2), hi = look(a, F.dk + 0.42);
          if (!lo || !lo.dark || lo.d > 1.92 - 0.15) R.gapBad.push(`${F.x},${F.y} ${SNAME[s]} ${F.br.st}: sem o vão escuro a ${a.toFixed(2)} m (${lo ? lo.part + ' a ' + lo.d.toFixed(2) + ' m' : 'nada'})`);
          if (!hi || hi.dark || hi.d < 1.8) R.gapBad.push(`${F.x},${F.y} ${SNAME[s]} ${F.br.st}: sem a parede sobre o vão a ${a.toFixed(2)} m`); }
        if (two) { const p = look(mid, F.wf + 0.2); if (!p || p.dark) R.gapBad.push(`${F.x},${F.y} ${SNAME[s]}: sem o pilar entre as duas baias`); }
      }
      // (the coping: over the wall's middle, a wall's height over the deck; wider than the wall — past its outer face)
      const pw = F.pt(s, mid, 1.92 - 0.17, 0), po = F.pt(s, mid, 1.92 + 0.02, 0), top = down(tn, pw[0], pw[2], F.dk + 2), lip = down(tn, po[0], po[2], F.dk + 2);
      if (!top || top.p[1] < F.dk + 0.55 || top.p[1] > F.dk + 1.3 || !lip || lip.p[1] < top.p[1] - 0.12) R.capBad.push(`${F.x},${F.y} ${SNAME[s]} ${F.br.st}: o alto da mureta a ${top ? (top.p[1] - F.dk).toFixed(2) : '?'} m do tabuleiro, a aba ${lip ? 'a ' + (lip.p[1] - F.dk).toFixed(2) + ' m' : 'não há'}`);
    }
  }
  const n = tiles.length;
  if (want('p1')) ok(`p1 ${tag}: toda casa de ponte tem tabuleiro, de perto e de longe`, n > 0 && R.deckNear === n && R.deckFar === n, `${n} casas de ponte: ${R.deckNear} com tabuleiro de perto, ${R.deckFar} de longe`);
  if (want('p2')) ok(`p2 ${tag}: a altura andável é a de antes (deckAt = nível da água × 1,5 + 0,17; footAt = o maior entre ela e a terra)`, R.walk > 0 && !R.walkBad.length, `${R.walk} pontos em ${n} casas${R.walkBad.length ? ' — diferente em ' + [...new Set(R.walkBad)].slice(0, 4).join(' · ') : ', todos iguais ao último número'}`);
  if (want('p3')) ok(`p3 ${tag}: o tabuleiro desenhado está nos pés, sobre o chão desenhado, e nada da ponte sobre o caminho`, R.pts > 0 && !R.under.length && !R.above.length && !R.noHit.length,
    `${R.pts} pontos: ${R.exact} exatos (a 2 mm), o mais alto ${(R.over * 100).toFixed(1)} cm sobre os pés (antes: 15 cm em todos)${R.under.length ? ' — abaixo: ' + R.under.slice(0, 3).join(' · ') : ''}${R.above.length ? ' — acima: ' + R.above.slice(0, 3).join(' · ') : ''}${R.noHit.length ? ' — sem tabuleiro: ' + R.noHit.slice(0, 3).join(' · ') : ''}`);
  if (want('p4') && (R.stone || stoneToo)) ok(`p4 ${tag}: a ponte de pedra é de pedra, com o vão sob o arco ou a verga e a mureta com capeamento`, R.stone > 0 && !R.stoneBad.length && !R.gapBad.length && !R.capBad.length && R.sides > 0,
    `${R.stone} casas de pedra, ${R.sides} lados sobre a água, no máximo ${(100 * (R.plain || 0)).toFixed(0)}% da área de uma casa em cor lisa (o escuro dos vãos, os filetes)${R.stoneBad.length ? ' — ' + R.stoneBad.slice(0, 3).join(' · ') : ''}${R.gapBad.length ? ' — ' + R.gapBad.slice(0, 3).join(' · ') : ''}${R.capBad.length ? ' — ' + R.capBad.slice(0, 3).join(' · ') : ''}`);
  if (want('p5')) ok(`p5 ${tag}: nenhuma peça fora da casa da ponte para o lado de um prédio ou da margem, nem dentro de um prédio`, !R.out.length && !R.inB.length, R.out.length || R.inB.length ? [...new Set(R.out)].slice(0, 3).concat([...new Set(R.inB)].slice(0, 3)).join(' · ') : `${n} casas, de perto e de longe (sobre a água vizinha, até 13 cm: a cornija; sobre a casa seguinte da própria ponte, até 7 cm: o poste na linha entre as duas)`);
  if (want('p6')) ok(`p6 ${tag}: o estilo segue o povo do chão`, !R.peopleBad.length, `${[...R.styles].sort().join(', ')}${R.peopleBad.length ? ' — ' + R.peopleBad.slice(0, 3).join(' · ') : ''}${R.people.length ? ' (' + R.people.join(' · ') + ')' : ''}`);
  if (want('p9')) ok(`p9 ${tag}: de longe a laje e as muretas, sem peça fina; os triângulos`, n > 0 && !R.farFine.length && R.maxNear <= 1000 && R.maxFar <= 60,
    `de perto ${R.nearT} (${(R.nearT / n).toFixed(0)} por casa, a maior ${R.maxNear}, o teto mil; antes ${R.before}: ${(R.before / n).toFixed(0)} por casa); de longe ${R.farT} (${(R.farT / n).toFixed(0)} por casa, a maior ${R.maxFar}, o teto 60; antes 0: de longe a ponte não era desenhada)${R.farFine.length ? ' — ' + R.farFine.slice(0, 3).join(' · ') : ''}`);
  return R;
}

// ------------------------------ the body ------------------------------
const RDT = 1 / 30; const IN = () => G.Avatar.input, st = () => G.Avatar.state();
const frame = () => { G.debug.step(RDT * Sp.TIME); G.Avatar.frame(RDT); };
function takeBody() {
  const who = [...S.villagers.values()].filter(v => v.age >= 18 && v.age < 55 && !v.sleeping && !v.inside && !v.aboard && G.Possess.can(v).ok).sort((a, c) => a.id - c.id)[0];
  if (!who || !G.Possess.take(who).ok) return null; G.Avatar.attach(who, 0); for (let k = 0; k < 4; k++) frame(); return who;
}
// (the ways across a bridge: its mouths — a side the land goes on from, a corner the land touches —, the two farthest apart, and
// the tiles between them; with one mouth only — a bridge to a door —, in to its farthest tile and back)
function wayOf(tiles) {
  const set = new Set(tiles), mouths = [];
  for (const i of tiles) { const F = frameOf(i);
    for (let s = 0; s < 4; s++) {
      const o = SIDE[s], o2 = SIDE[(s + 1) % 4];
      // (a mouth: open land — not a lot's, whose floor may stand a ledge over the street —; a corner only where there is no way
      // beside it: water or a wall on both its sides)
      const free = (x, y) => W.inb(x, y) && W.walkableXY(x + 0.5, y + 0.5) && !S.occ[y * N + x];
      if (F.pl.k[s] === 0 && free(F.x + o[0], F.y + o[1])) mouths.push({ i, out: [F.CX + o[0] * 2.8, F.CZ + o[1] * 2.8] });
      if (F.pl.c[s] === 0 && F.pl.k[s] >= 2 && F.pl.k[(s + 1) % 4] >= 2 && free(F.x + o[0] + o2[0], F.y + o[1] + o2[1])) mouths.push({ i, out: [F.CX + (o[0] + o2[0]) * 2.6, F.CZ + (o[1] + o2[1]) * 2.6] });
    } }
  if (!mouths.length) return null; let A = mouths[0], B = null, bd = -1;
  for (const p of mouths) for (const q of mouths) { const d = Math.hypot(p.out[0] - q.out[0], p.out[1] - q.out[1]); if (d > bd) { bd = d; A = p; B = q; } }
  // (the tiles from A's to B's — or to the farthest from A's —, each a neighbour of the last)
  const prev = new Map([[A.i, -1]]), q = [A.i]; let last = A.i;
  for (let k = 0; k < q.length; k++) { const j = q[k]; last = j; const x = j % N, y = (j / N) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const n2 = (y + dy) * N + x + dx; if (set.has(n2) && !prev.has(n2)) { prev.set(n2, j); q.push(n2); } } }
  const one = bd < 1; const goal = one ? last : B.i; const pathT = []; for (let j = goal; j !== -1; j = prev.get(j)) pathT.unshift(j);
  const mid = pathT.map(j => [((j % N) + 0.5) * TL, (((j / N) | 0) + 0.5) * TL]);
  return { from: A.out, via: one ? mid.concat(mid.slice(0, -1).reverse()) : mid, to: one ? A.out : B.out, one, tiles: pathT };
}
function crossAll(tag) {
  const seen = new Set(), ways = []; for (const i of bridgeTiles()) { if (seen.has(i)) continue; const c = compOf(i); c.forEach(j => seen.add(j)); ways.push({ c, w: wayOf(c) }); }
  const pics = new Map(), picOf = j => { if (!pics.has(j)) pics.set(j, near(j % N, (j / N) | 0)); return pics.get(j); };
  if (!takeBody()) { ok(`p11 ${tag}: há quem viver`, false, 'ninguém que se possa encarnar'); return; }
  let done = 0, frames = 0, onDeck = 0, cut0 = 0; const why = [], skipped = [];
  for (const { c, w } of ways) {
    const name = `${c[0] % N},${(c[0] / N) | 0} (${c.length} casa${c.length > 1 ? 's' : ''}, ${R3.bridgeOf(c[0]).st})`;
    if (!w) { skipped.push(name + ': nenhuma margem que se ande'); continue; }
    if (!G.Avatar.place(w.from[0] / TL, w.from[1] / TL)) { why.push(`${name}: o corpo não coube na margem`); continue; }
    for (let k = 0; k < 8; k++) frame();
    let bad = null, far2 = 0;
    for (const p of w.via.concat([w.to])) {
      let still = 0, last = [st().X, st().Z], k = 0;
      for (; k < 400 && !bad; k++) {
        const s = st(), dx = p[0] - s.X, dz = p[1] - s.Z; if (Math.hypot(dx, dz) < 0.18) break;
        const I = IN(); I.camYaw = Math.atan2(dz, dx); I.mz = 1; I.mx = 0; I.run = false; frame(); frames++;
        const b = st(), tx = Math.floor(b.X / TL), tz = Math.floor(b.Z / TL), j = tz * N + tx;
        if (b.loco === 'swim' || b.loco === 'climb') bad = `${b.loco === 'swim' ? 'nadou' : 'escalou'} em ${(b.X / TL).toFixed(2)},${(b.Z / TL).toFixed(2)}`;
        else if (b.ground && Math.abs(b.Y - feet(b.X, b.Z)) > 0.03) bad = `os pés a ${(b.Y - feet(b.X, b.Z)).toFixed(2)} m do chão do jogo em ${(b.X / TL).toFixed(2)},${(b.Z / TL).toFixed(2)}`;
        else if (isB(j) && b.ground) { onDeck++;
          // (the bridge drawn under the feet, and nothing of it in the way: from over the head down to the feet)
          const h = down(picOf(j), b.X, b.Z, b.Y), cx = Math.abs(b.X / TL - Math.round(b.X / TL)) * TL, cz = Math.abs(b.Z / TL - Math.round(b.Z / TL)) * TL;
          if (!h) { if (Math.max(cx, cz) > 0.2 && !(S.road[j] < 2 || R3.bridgeOf(j).st === 'nordico')) bad = `sem tabuleiro debaixo dos pés em ${(b.X / TL).toFixed(2)},${(b.Z / TL).toFixed(2)}`; }
          else if (h.p[1] - b.Y > 0.12) bad = `uma peça da ponte (${h.tri.part}) ${(h.p[1] - b.Y).toFixed(2)} m sobre os pés em ${(b.X / TL).toFixed(2)},${(b.Z / TL).toFixed(2)}`;
          else if (h.p[1] - b.Y < -0.03) bad = `o tabuleiro ${(b.Y - h.p[1]).toFixed(2)} m abaixo dos pés em ${(b.X / TL).toFixed(2)},${(b.Z / TL).toFixed(2)}`; }
        if (Math.hypot(b.X - last[0], b.Z - last[1]) < 0.004) { if (++still > 30) break; } else still = 0; last = [b.X, b.Z];
      }
      far2 = Math.hypot(p[0] - st().X, p[1] - st().Z); if (far2 > 0.4 && !bad) bad = `parou a ${far2.toFixed(2)} m de ${(p[0] / TL).toFixed(2)},${(p[1] / TL).toFixed(2)}${st().block ? ' (' + st().block + ')' : ''}`;
      if (bad) break;
    }
    const I = IN(); I.mz = 0; I.mx = 0; for (let k = 0; k < 4; k++) frame();
    // (the game before, by its own rule: a tile's two walls stood along the road's way by its neighbours — along X unless only
    // its north or south had road —; a way through the tile across them went through a wall)
    for (let k = 0; k < w.tiles.length; k++) { const j = w.tiles[k], x = j % N, y = (j / N) | 0, rd = (xx, yy) => W.inb(xx, yy) && S.road[yy * N + xx] > 0;
      const alongX = rd(x - 1, y) || rd(x + 1, y) || !(rd(x, y - 1) || rd(x, y + 1)); const P = [k ? w.via[k - 1] : w.from, w.via[k], k + 1 < w.tiles.length ? w.via[k + 1] : w.to];
      if (P.some(p => Math.abs((alongX ? p[1] : p[0]) - (alongX ? (y + 0.5) : (x + 0.5)) * TL) > 1.55)) { cut0++; break; } }
    if (bad) why.push(`${name}: ${bad}`); else done++;
  }
  G.Possess.release && G.Possess.release('deus');
  const n = ways.length - skipped.length;
  ok(`p11 ${tag}: o corpo atravessa cada ponte de uma margem à outra, com os pés no tabuleiro desenhado e sem peça no caminho`, n > 0 && done === n,
    `${done} de ${n} pontes atravessadas (${frames} quadros, ${onDeck} sobre o tabuleiro; no desenho de antes a mureta atravessava o caminho em ${cut0} delas)${skipped.length ? '; sem margem: ' + skipped.join(' · ') : ''}${why.length ? ' — ' + why.slice(0, 4).join(' · ') : ''}`);
}

// ------------------------------ the ready worlds ------------------------------
const seenStyles = {};
for (const w of WORLDS) {
  S = M.pronto(w); N = G.N; const tiles = bridgeTiles();
  // p8 first: the world before anything is drawn
  const before = want('p8') ? G.Save.serialize() : null; let draws = [0, 0]; G.rngWatch = k => { draws[k]++; };
  const pics = tiles.map(i => { const x = i % N, y = (i / N) | 0; return [R3.bridgesOf(x, y, 1, 1, false), R3.bridgesOf(x, y, 1, 1, true), R3.sigOf(Math.floor(x / 16), Math.floor(y / 16))]; });
  // (and by the chunk, as the game asks: every chunk of the map, near and far)
  let chunkT = 0; for (let cy = 0; cy < Math.ceil(N / 16); cy++) for (let cx = 0; cx < Math.ceil(N / 16); cx++) for (const f of [false, true]) { const p = R3.bridgesOf(cx * 16, cy * 16, 16, 16, f); if (p.geo) chunkT += p.geo.attributes.position.count / 3; }
  G.rngWatch = null;
  if (want('p8')) { const after = G.Save.serialize(); ok(`p8 ${w}: só desenha — o save igual antes e depois de desenhar as pontes de perto e de longe`, before === after && chunkT > 0, `${before.length} caracteres, ${before === after ? 'iguais' : 'DIFERENTES'}; ${tiles.length} casas e ${Math.ceil(N / 16) ** 2} pedaços desenhados (${chunkT} triângulos)`); }
  if (want('p7')) {
    // (the same again, with both dice moved between: every number of the geometry)
    for (let k = 0; k < 7; k++) { G.VR(); Math.random(); } const r0 = S.rng; let same = 0, diff = [];
    tiles.forEach((i, q) => { const x = i % N, y = (i / N) | 0; for (const f of [0, 1]) { const a = pics[q][f].geo, b = R3.bridgesOf(x, y, 1, 1, !!f).geo; let eq = !!a && !!b;
      if (eq) for (const at of ['position', 'normal', 'color', 'aP']) { const A = a.attributes[at].array, B = b.attributes[at].array; if (A.length !== B.length) { eq = false; break; } for (let k = 0; k < A.length; k++) if (A[k] !== B[k]) { eq = false; break; } }
      if (eq) same++; else diff.push(`${x},${y} ${f ? 'de longe' : 'de perto'}`); } });
    ok(`p7 ${w}: a mesma ponte duas vezes dá a mesma geometria, e desenhar não sorteia`, same === tiles.length * 2 && draws[0] === 0 && draws[1] === 0 && S.rng === r0, `${same} de ${tiles.length * 2} figuras iguais número a número; sorteios ao desenhar: ${draws[0]} do acaso do mundo, ${draws[1]} do que só se vê${diff.length ? ' — ' + diff.slice(0, 3).join(' · ') : ''}`);
  }
  const R = tileChecks(w, tiles, true); for (const i of tiles) (seenStyles[R3.bridgeOf(i).st] = seenStyles[R3.bridgeOf(i).st] || []).push([w, i]);
  if (VERB) for (const i of tiles) { const F = frameOf(i); console.log(`   ${w} ${F.x},${F.y} ${F.br.st} lados ${F.pl.k.join('')} cantos ${F.pl.c.join('')} fins ${JSON.stringify(F.pl.e)} perto ${near(F.x, F.y).length} longe ${far(F.x, F.y).length}`); }
  void R;
  // p10: the others' feet on the deck
  if (want('p10')) {
    const who = [...S.villagers.values()].filter(v => !v.inside && !v.aboard && !v.sleeping && v.age >= 18).sort((a, c) => a.id - c.id).slice(0, tiles.length); let okN = 0; const bad = [];
    tiles.forEach((i, q) => { const v = who[q % who.length], x = (i % N) + 0.5 + (q % 3 - 1) * 0.3, y = ((i / N) | 0) + 0.5 + (q % 2) * 0.2; const keep = [v.x, v.y, v.task, v.z]; v.x = x; v.y = y; v.z = 0; if (v.task && v.task.type === 'swim') v.task = null;
      P3.clear(); P3.update(0, { X: x * TL, Y: Sp.footAt(x, y), Z: y * TL }); const s = P3.visOf(v.id), ft = feet(x * TL, y * TL);
      if (s && Math.abs(s.Y - ft) < 1e-6) okN++; else bad.push(`${i % N},${(i / N) | 0}: ${s ? (s.Y - ft).toFixed(3) + ' m dos pés do corpo' : 'não desenhado'}`);
      v.x = keep[0]; v.y = keep[1]; v.task = keep[2]; v.z = keep[3]; });
    P3.clear();
    ok(`p10 ${w}: os outros pisam onde o corpo pisa sobre a ponte`, tiles.length > 0 && okN === tiles.length, `${okN} de ${tiles.length} casas (antes: no nível da água, 17 cm abaixo dos pés do corpo e 32 cm abaixo do tabuleiro desenhado)${bad.length ? ' — ' + bad.slice(0, 3).join(' · ') : ''}`);
  }
  if (want('p11') && w !== 'mundial' || (want('p11') && WORLDS.length === 1)) crossAll(w);
  if (!M.limpo()) ok(`${w}: sem erro de módulo nem aviso`, false, JSON.stringify(M.erros()).slice(0, 300));
}
// (two peoples' bridges are not the same bridge: Rome's and Memphis's, by their stuff and by their parts)
if (want('p6') && seenStyles.romano && seenStyles.egipcio) {
  const one = st => { const [w, i] = seenStyles[st][0]; S = M.pronto(w); N = G.N; const t = near(i % N, (i / N) | 0); return { w, i, pats: [...new Set(t.map(q => q.pat))].sort((a, b) => a - b).join(','), parts: [...new Set(t.map(q => q.part))].sort().join(','), n: t.length }; };
  const a = one('romano'), b = one('egipcio');
  ok('p6: uma ponte de Roma e uma de Mênfis diferem', a.pats !== b.pats && a.parts !== b.parts, `romana (${a.w} ${a.i % N},${(a.i / N) | 0}): padrões ${a.pats}, peças ${a.parts}; egípcia (${b.w} ${b.i % N},${(b.i / N) | 0}): padrões ${b.pats}, peças ${b.parts}`);
}

// ------------------------------ p12: the flat world with a canal ------------------------------
if (want('p12')) {
  // (a world of flat grass, made by hand — fidelidade-lib's blank —: a canal three tiles wide down it, its water at the land's
  // own height as the world's rivers have it, and one house of a people beside it)
  const blank = () => { S = G.newState(7); S.N = G.N; S.H.fill(4); S.type.fill(T.GRASS); S.biome.fill(0); S.clock = 0; S.day = 30; S.time = 0.3; G.S = S; G.newWorld(); N = G.N; };
  const canal = (x0, x1) => { for (let y = 8; y < 34; y++) for (let x = x0; x <= x1; x++) { const i = y * N + x; S.type[i] = T.RIVER; S.wl[i] = 4; } S.typeVer = (S.typeVer || 0) + 1; };
  const house = (st, x, y, id) => { const b = { id: id || 9001, type: 'house', style: st, x, y, w: 1, h: 1, built: true, progress: 1, hp: 100, maxHp: 100, v: 0, set: 0, blocks: true, ip: null }; S.buildings.set(b.id, b); S.occ[y * N + x] = b.id; return b; };
  const road = (list, lv) => { for (const [x, y] of list) S.road[y * N + x] = lv; };
  const long = (st, lv) => { blank(); canal(20, 22); house(st, 14, 18); road([[19, 20], [20, 20], [21, 20], [22, 20], [23, 20]], lv); return [20, 21, 22].map(x => 20 * N + x); };
  const bad = [], info = [];
  const look = (F, tn, s, a, yy) => { const h = shoot(tn, F.pt(s, a, 3.2, yy), [-SIDE[s][0], 0, -SIDE[s][1]]); return h ? { dark: isDark(h.tri), d: 3.2 - h.t, part: h.tri.part, pat: h.tri.pat } : null; };
  // (the top of a gap at a place along a side: the highest level the look goes into the dark, to a centimetre)
  const gapTop = (F, tn, s, a) => { let lo = F.wf + 0.02, hi = F.dk + 1.2; const d0 = look(F, tn, s, a, lo); if (!d0 || !d0.dark) return null; for (let k = 0; k < 12; k++) { const m = (lo + hi) / 2, q = look(F, tn, s, a, m); if (q && q.dark) lo = m; else hi = m; } return lo - F.wf; };
  for (const st of ['romano', 'classico', 'egipcio', 'grego', 'asteca', 'nordico']) {
    const tiles = long(st, 3); const R = tileChecks(`mundo chato, ${st}`, tiles); void R;
    const F1 = frameOf(tiles[1]), t1 = near(F1.x, F1.y), F0 = frameOf(tiles[0]), t0 = near(F0.x, F0.y), F2 = frameOf(tiles[2]), t2 = near(F2.x, F2.y);
    if (R3.bridgeOf(tiles[1]).st !== st || R3.bridgeOf(tiles[0]).tiles.length !== 3) bad.push(`${st}: a ponte de três casas lida como ${R3.bridgeOf(tiles[1]).st}, de ${R3.bridgeOf(tiles[0]).tiles.length}`);
    if (JSON.stringify(F1.pl.e) !== '[[0,0],null,[0,0],null]' || JSON.stringify(F0.pl.e) !== '[[1,0],null,[0,1],null]') bad.push(`${st}: os fins das muretas ${JSON.stringify(F0.pl.e)} ${JSON.stringify(F1.pl.e)}`);
    if (st === 'nordico') {
      // (timber on dry stone: planks across the way, a rail on posts, braces, and a block of stone at each bank)
      const planks = t1.filter(t => t.part === 'deck').length / 12, parts = new Set(t0.map(t => t.part)), stone = t0.filter(t => t.part === 'encontro'), rail = down(t1, ...[F1.pt(0, 0, 1.92 - 0.135, 0)].map(p => [p[0], p[2]])[0], F1.dk + 2);
      if (planks !== 12 || !['poste', 'corrimao', 'escora', 'encontro'].every(p => parts.has(p)) || !stone.length || !stone.every(t => t.pat === PAT.stone) || !rail || rail.p[1] < F1.dk + 0.9 || rail.p[1] > F1.dk + 1.1 || t1.some(t => t.part === 'encontro')) bad.push(`nordico: ${planks} tábuas, peças ${[...parts].join(',')}, o corrimão a ${rail ? (rail.p[1] - F1.dk).toFixed(2) : '?'} m`);
      else info.push(`nórdica: ${planks} tábuas por casa, postes, corrimão a ${(rail.p[1] - F1.dk).toFixed(2)} m, escoras em X, um bloco de pedra seca em cada margem`);
      continue;
    }
    // (one gap in each tile's side — two bays in Egypt's —, a pier between tiles, the abutment and its pier at each bank)
    const tops = []; for (const [F, tn] of [[F0, t0], [F1, t1], [F2, t2]]) for (const s of [0, 2]) tops.push(st === 'egipcio' ? gapTop(F, tn, s, -0.9) : gapTop(F, tn, s, 0));
    const pier = [look(F0, t0, 0, 1.9, F0.wf + 0.2), look(F1, t1, 0, -1.9, F1.wf + 0.2), look(F1, t1, 2, 1.9, F1.wf + 0.2)], abut = [look(F0, t0, 0, -1.7, F0.wf + 0.2), look(F2, t2, 0, 1.7, F2.wf + 0.2)];
    const endTop = down(t0, ...[F0.pt(0, -1.7, 1.75, 0)].map(p => [p[0], p[2]])[0], F0.dk + 3), capTop = down(t1, ...[F1.pt(0, 0, 1.75, 0)].map(p => [p[0], p[2]])[0], F1.dk + 3);
    if (tops.some(v => v === null || v < 0.25) || pier.some(p => !p || p.dark) || abut.some(p => !p || p.dark) || !endTop || !capTop || endTop.p[1] < capTop.p[1] + 0.08)
      bad.push(`${st}: vãos ${tops.map(v => (v === null ? 'nenhum' : v.toFixed(2))).join('/')}, pilares ${pier.map(p => (p ? (p.dark ? 'vão' : 'pedra') : 'nada')).join('/')}, encontros ${abut.map(p => (p ? (p.dark ? 'vão' : 'pedra') : 'nada')).join('/')}, o pilar da margem ${endTop && capTop ? (endTop.p[1] - capTop.p[1]).toFixed(2) + ' m sobre a mureta' : '?'}`);
    if (!capTop) continue; // (no wall's head to measure the rest from: said above)
    // (the gap's shape, across the middle tile's north side)
    const prof = [-1.2, -0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2].map(a => gapTop(F1, t1, 0, a)), ws = t1.filter(t => t.part === 'aduela').length / 12 / 2;
    const mid = prof[4], f = v => (v === null ? '—' : v.toFixed(2));
    if (st === 'romano' || st === 'classico') {
      // (an arch: highest at its middle, lower to each side, the same on both; Rome's a half circle whose middle lies under
      // the water — the chord at the water narrower than its span —, the brick one a low segment to the piers; its wedge stones)
      const sym = prof.every((v, k) => (v === null ? prof[8 - k] === null : prof[8 - k] !== null && Math.abs(v - prof[8 - k]) < 0.02)), fall = prof[4] > prof[2] + 0.02 && prof[2] > prof[1] + 0.05 && mid >= 0.42 && mid <= 0.55;
      // (the circle through the crown and a point 0.9 m aside: its radius)
      const sag = mid - prof[1], rad = (0.81 + sag * sag) / (2 * sag), want2 = st === 'romano' ? [1.5, 1.8] : [2.2, 3.4];
      if (!sym || !fall || !(rad >= want2[0] && rad <= want2[1]) || ws < (st === 'romano' ? 7 : 11)) bad.push(`${st}: o perfil do arco ${prof.map(f).join(' ')}, raio ${rad.toFixed(2)} m, ${ws} aduelas`);
      else info.push(`${st === 'romano' ? 'romana' : 'clássica'}: um arco por casa, a flecha ${mid.toFixed(2)} m sobre a água, raio ${rad.toFixed(2)} m, ${ws} aduelas fora da água (${st === 'romano' ? 'cantaria' : 'tijolo'})`);
    } else if (st === 'egipcio') {
      // (two bays under a slab, a pier between them: level tops, stone at the middle)
      const flat = [1, 2, 3, 5, 6, 7].every(k => prof[k] !== null && Math.abs(prof[k] - prof[2]) < 0.02), cen = look(F1, t1, 0, 0, F1.wf + 0.2), roll = t1.some(t => t.part === 'capa' && t.pat === PAT.sandstone);
      const lipA = down(t1, ...[F1.pt(0, 0, 1.92 + 0.11, 0)].map(p => [p[0], p[2]])[0], F1.dk + 3), lipB = down(t1, ...[F1.pt(0, 0, 1.92 + 0.03, 0)].map(p => [p[0], p[2]])[0], F1.dk + 0.6);
      if (!flat || !cen || cen.dark || !roll || !lipA || lipA.p[1] < F1.dk + 0.8) bad.push(`egipcio: as baias ${prof.map(f).join(' ')}, o pilar do meio ${cen ? (cen.dark ? 'vão' : 'pedra') : 'nada'}, a cornija ${lipA ? (lipA.p[1] - F1.dk).toFixed(2) + ' m' : 'não sai da parede'}`);
      else info.push(`egípcia: duas baias de ${prof[2].toFixed(2)} m sob a laje em cada casa, o pilar no meio, a cornija de gola 11 cm para fora a ${(lipA.p[1] - F1.dk).toFixed(2)} m do tabuleiro${lipB ? '' : ''}`);
    } else if (st === 'grego') {
      // (a corbelled gap: narrower by steps as it rises)
      const steps = new Set(prof.filter(v => v !== null).map(v => v.toFixed(2))).size, up = prof[4] > prof[2] && prof[2] >= prof[1] && prof[1] > (prof[0] === null ? -1 : prof[0] - 1e-6);
      if (steps < 3 || !up || prof[4] === null) bad.push(`grego: o vão em degraus ${prof.map(f).join(' ')}`); else info.push(`grega: o vão em ${steps} degraus, ${prof[4].toFixed(2)} m no meio`);
    } else {
      // (the causeway: one gap under its lintel, the ends in steps — each end higher than the cap, the very end higher still)
      const e1 = down(t0, ...[F0.pt(0, -1.7, 1.75, 0)].map(p => [p[0], p[2]])[0], F0.dk + 3), e2 = down(t0, ...[F0.pt(0, -1.25, 1.75, 0)].map(p => [p[0], p[2]])[0], F0.dk + 3), thr = t1.filter(t => t.part === 'capa' && t.pat === 0).length;
      if (prof[4] === null || prof[0] !== null || !e1 || !e2 || !(e1.p[1] > e2.p[1] + 0.15 && e2.p[1] > capTop.p[1] + 0.1) || thr < 2) bad.push(`asteca: o vão ${prof.map(f).join(' ')}, os degraus do fim ${e1 && e2 ? (e2.p[1] - capTop.p[1]).toFixed(2) + ' e ' + (e1.p[1] - capTop.p[1]).toFixed(2) + ' m sobre a capa' : '?'}, ${thr} filetes`);
      else info.push(`asteca: um vão de ${prof[4].toFixed(2)} m sob a verga, as pontas em dois degraus (${(e2.p[1] - capTop.p[1]).toFixed(2)} e ${(e1.p[1] - capTop.p[1]).toFixed(2)} m sobre a capa), o filete vermelho e o turquesa`);
    }
  }
  ok('p12a: a ponte comprida de cada povo — um vão por casa, o pilar entre eles, os encontros nas margens, cada um à sua maneira', !bad.length && info.length === 6, bad.length ? bad.join(' · ') : info.join('; '));
  // (an unpaved road: timber for every people)
  { const tiles = long('romano', 1); const R = tileChecks('mundo chato, rua de terra', tiles); void R; const F = frameOf(tiles[1]), tn = near(F.x, F.y), parts = new Set(tn.map(t => t.part));
    const wood = tn.every(t => [PAT.beam, PAT.beamX, PAT.beamZ].includes(t.pat)), planks = tn.filter(t => t.part === 'deck').length / 12;
    ok('p12b: a ponte de madeira da rua de terra — tábuas atravessadas, guarda de troncos nas pontas delas, postes, corrimão, escoras em X', wood && planks === 12 && ['mureta', 'poste', 'corrimao', 'escora'].every(p => parts.has(p)) && !parts.has('flanco') && !parts.has('encontro'), `${planks} tábuas, peças: ${[...parts].join(', ')}; ${tn.length} triângulos por casa (antes 240)`); }
  // (two tiles that touch by a corner: the corner is open, the way goes through it)
  { blank(); canal(19, 23); house('romano', 14, 18); road([[18, 21], [19, 21], [20, 21], [21, 20], [22, 20], [23, 20], [24, 20]], 3); const a = 21 * N + 20, b = 20 * N + 21;
    const Fa = frameOf(a), Fb = frameOf(b), ta = near(Fa.x, Fa.y), tb = near(Fb.x, Fb.y); let over = 0, n = 0, hit = 0;
    for (let k = 0; k <= 40; k++) { const X = Fa.CX + (Fb.CX - Fa.CX) * k / 40, Z = Fa.CZ + (Fb.CZ - Fa.CZ) * k / 40, ft = Sp.deckAt(Fa.x + 0.5, Fa.y + 0.5); n++;
      for (const tn of [ta, tb]) { const h = down(tn, X, Z, ft); if (h) { hit++; if (h.p[1] > ft + 0.12) over++; } } }
    const same = R3.bridgeOf(a).tiles.length === 5 && compOf(a).includes(b);
    ok('p12c: a ponte em diagonal — as casas que se tocam pelo canto são uma ponte só, e o canto fica aberto para quem passa', same && over === 0 && hit >= 36 && Fa.pl.e[0] && Fa.pl.e[0][1] === 3 && Fa.pl.e[1] && Fa.pl.e[1][0] === 3,
      `${compOf(a).length} casas numa ponte; do meio de uma ao meio da outra, ${n} pontos: ${hit} sobre o tabuleiro, ${over} sob uma mureta; os fins das muretas do canto: ${JSON.stringify(Fa.pl.e)}`); }
  // (the chunk's signature moves with the bridge's people and with its sides)
  { const tiles = long('romano', 3); void tiles; const s0 = R3.sigOf(1, 1).c; S.buildings.get(9001).style = 'egipcio'; const s1 = R3.sigOf(1, 1).c; S.buildings.get(9001).style = 'romano';
    const i = 19 * N + 20; S.type[i] = T.GRASS; const s2 = R3.sigOf(1, 1).c; S.type[i] = T.RIVER; const s3 = R3.sigOf(1, 1).c;
    ok('p12d: a assinatura do pedaço muda quando o povo ou um lado da ponte muda (o pedaço é desenhado de novo)', s0 !== s1 && s0 !== s2 && s3 === s0, `${s0} → outro povo ${s1} → a margem num lado ${s2} → de volta ${s3}`); }
  if (!M.limpo()) ok('p12: sem erro de módulo nem aviso', false, JSON.stringify(M.erros()).slice(0, 300));
}
console.log(fails.length ? `FALHOU: ${fails.length} — ${fails.join(' | ')}` : 'PASSOU: as pontes');
process.exit(fails.length ? 1 : 0);
