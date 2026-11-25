// motor-plantas: as peças novas do motor das plantas (a B4 do Patch 2, para as receitas dos monumentos do P3) provadas em
// Node (o qa/motor.js é outra coisa: as contas do Math no Node e no navegador, T-123),
// sem mundo, com receitas de teste montadas aqui (um tipo e uma família que o jogo não tem: só esta prova os registra):
//   1. o anel: P.ringWall — n paredes retas pelos cantos no círculo, a primeira de frente para a rua e reta (n múltiplo de
//      quatro), os arcos (portas 'vao' com arch: 1 na porta e no vão), as janelas em arco; a grade fecha o anel (a parede de
//      viés pinta as casas a meia espessura da sua linha) e abre o arco
//   2. a coroa e a arena: P.room(lv, fn, r, open, [cu, cv, R, r0]) — o chão da coroa só entre os dois raios, a arena aberta
//      dentro dela; os dois não se sobrepõem; da rua, pelos arcos, chega-se aos dois; o contorno da coroa (por fora e de
//      volta por dentro); a área; uma peça posta na coroa nunca entra na arena
//   3. o que já existia fica como era: a cabana redonda (os cantos da sua grade continuam parede) e uma parede reta (as
//      mesmas casas)
//   4. as fileiras: P.tiers — numa coroa (subindo para fora, os corredores em meio degrau) e num retângulo (subindo para o
//      fundo): a altura de cada fileira e de cada meio degrau (plan.hgt, In.floorYOf), o passo da caminhada (meia fileira
//      sobe; uma fileira inteira, não), os lugares de assistir (a cada 0,5 m, fora dos corredores, virados para baixo, na
//      altura da fileira) que a porta alcança, o repartidor dando um a cada espectador, a casca com as fileiras (sem o
//      cômodo); sem corredor, a planta é recusada (não se chega às fileiras); o palco (uma fileira de 1,2 m, os degraus pela
//      lateral, os lugares de atuar de pé); os lugares sem peça (P.marks: lutar na areia)
//   5. a base maciça (shell.base 'macica', baseH, os degraus da base na casca), a colunata (P.colonnade: as colunas parede, os
//      intercolúnios passagens, o do meio a entrada) e a escada larga de fora (1,20 m ao menos; mais estreita é recusada)
//   6. o kit da taverna no motor (F1, D-991, D-993; o manual planos/interiores-3-kit.md): as escolhas do registro (P.choose,
//      P.hashOf, In.kitOn) e o quadro com espelho (P.frame); a zona de caminho (nenhuma peça nela) e a de um posto (na planta,
//      girada com o lote); o corredor (P.aisle: o tronco, os ramos, a recusa sem guardar nada); a peça fixa e a sua reserva
//      (P.atAlong); os grupos de mesa (P.groups: os assentos sobre as peças, o papel de quem senta ali na planta, o reset); a
//      marca e a peça de um posto; o modelo com um assento que não é peça de sentar, recusado
//   7. a riqueza de agora de qualquer tipo (F6, D-992: In.wealthRule) no mundo pronto «cidade»: a regra de teste num prédio de pé
//      pelas moedas do dono, a faixa, a paciência, o save no meio, a leitura que não muda o mundo; sem a regra, nada
//   node qa/motor-plantas.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors; const C = In.CELL; const CS = In.CS;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | motor-plantas ${name} | ${info}`); if (!c) fails.push(name); };
const r2 = x => Math.round(x * 100) / 100;
const codeAt = (p, lv, x, z) => { const g = p.grid.lv[lv]; const n = p.grid.n; const cx = Math.floor(x / CS), cz = Math.floor(z / CS); return cx < 0 || cz < 0 || cx >= n || cz >= n ? C.OUT : g[cz * n + cx]; };

// ------------------------------ the test recipes: a ring of arcades about an arena ------------------------------
// (a lot of 3 × 3 tiles, 12 m: the shell round, its ring the outside wall; the arcades just inside it, a ring of 24 walls
// with arches — the front one the way in from the street —; the ambulatory between them and the inner ring, 16 walls with
// four arches into the arena, open to the sky)
G.BDEF['teste-coliseu'] = { name: 'Coliseu de teste', w: 3, h: 3, blocks: true };
const R0 = { cu: 6, cv: 6, rad: 5.6, t: 0.3, outer: 5.45, inner: 3.6, ti: 0.3 };
let lastP = null;
In.addFamilies([{ id: 'teste.anel', H: 'teste', V: 'anel', S: 'teste.anel', name: 'Anel de teste', can: () => null, build: P => {
  lastP = P; const { cu, cv, rad, t, outer, inner, ti } = R0;
  P.shell = { kind: 'round', cu, cv, rad, t, mat: 'pedra', base: 'pedra', floors: 1, eave: 6 };
  P.roof = null; P.roofGeo = null;
  P.level(0, 0, 6, 'piso', [cu - rad + t, cv - rad + t, cu + rad - t, cv + rad - t]); P.entryLv = 0;
  const A = P.ringWall(0, cu, cv, outer, t, 6, { n: 24, outer: 1, arcs: [6, 12, 18], aw: 1.4, ah: 3, wins: [3, 9, 15, 21] });
  // (the front arch, the street's: the shell's door)
  const w0 = A.walls[0]; const len0 = P.wlen(w0); const d0 = P.door(w0, len0 / 2, 1.6, 3, -1, 'rua', 1, 'arco');
  const p0 = P.ptOn(w0, len0 / 2); P.entrance = { door: d0, u: p0[0], v: cv + rad, w: 1.6, lv: 0 };
  const B = P.ringWall(0, cu, cv, inner, ti, 4, { n: 16, arcs: [0, 4, 8, 12], aw: 1.2, ah: 2.6 });
  P.test = { A, B };
  if (P.inside()) return;
  const amb = P.room(0, 'deambulatorio', [cu - outer + t / 2, cv - outer + t / 2, cu + outer - t / 2, cv + outer - t / 2], 0, [cu, cv, outer - t / 2, inner + ti / 2]);
  const ar = P.room(0, 'arena', [cu - inner + ti / 2, cv - inner + ti / 2, cu + inner - ti / 2, cv + inner - ti / 2], 1, [cu, cv, inner - ti / 2]);
  P.test.amb = amb; P.test.ar = ar;
  // (a bench in the ambulatory, free-standing: never in the arena)
  P.test.bench = P.place('banco', 0, amb, { sides: ['livre'], margin: 0.2 });
} }]);
In.addTypes({ 'teste-coliseu': { use: 'teste', fams: ['teste.anel'] } });
const rec = { v: 4, f: 'teste.anel', r: 0, t: 'teste-coliseu', u: 'teste', s: 'S', o: 0, c: 'romano', e: 3, k: 'ae', cl: 't', fl: 0, d: 3, w: 0, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
const b = { id: 5101, type: 'teste-coliseu', x: 10, y: 10, w: 3, h: 3 };
const p = In.makeFam(b, rec, 'teste.anel'); const P = lastP;

// ---- 1. the ring ----
{
  const A = P.test.A; const W = A.walls.map(id => P.walls[id]);
  const onCirc = W.every(w => [w.a, w.b].every(q => Math.abs(Math.hypot(q[0] - R0.cu, q[1] - R0.cv) - R0.outer) < 0.011));
  const meet = W.every((w, k) => { const nx = W[(k + 1) % W.length]; return Math.hypot(w.b[0] - nx.a[0], w.b[1] - nx.a[1]) < 1e-6; });
  const w0 = W[0]; const front = Math.abs(w0.a[1] - w0.b[1]) < 1e-6 && w0.a[1] > R0.cv && w0.a[0] > w0.b[0];
  const square = [0, 6, 12, 18].every(k => { const w = W[k]; return Math.abs(w.a[0] - w.b[0]) < 1e-6 || Math.abs(w.a[1] - w.b[1]) < 1e-6; });
  ok('1a o anel: 24 paredes pelos cantos no círculo, fechado', W.length === 24 && onCirc && meet, `${W.length} paredes; cantos no círculo de ${R0.outer} m: ${onCirc}; cada uma termina onde a próxima começa: ${meet}`);
  ok('1b a primeira de frente para a rua e reta; as dos quatro lados retas', front && square, `a primeira de (${w0.a.map(r2)}) a (${w0.b.map(r2)}); 0, 6, 12, 18 retas: ${square}`);
  const arcs = A.doors.map(id => P.doors[id]); const holes = P.holes.filter(h => arcs.some(d => d.id === h.door));
  const wins = P.holes.filter(h => h.kind === 'janela' && A.walls.includes(h.wall));
  ok('1c os arcos: portas de passagem (vao) com o arco, na porta e no vão; as janelas em arco', arcs.length === 3 && arcs.every(d => d.kind === 'vao' && d.arch === 1) && holes.length === 3 && holes.every(h => h.arch === 1 && h.kind === 'vao') && wins.length === 4 && wins.every(h => h.arch === 1),
    `${arcs.length} arcos (${arcs.map(d => d.kind + '/' + d.arch).join(', ')}); ${wins.length} janelas em arco`);
  const pd = p.doors.filter(d => d.arch === 1).length, ph = p.holes.filter(h => h.arch === 1).length; const sh = In.shellOfPlan(p); const sa = sh.holes.filter(h => h.arch === 1).length;
  ok('1d o arco chega à planta e à casca (o que o 3D e o deus desenham)', pd === 8 && ph === 12 && sa === 12, `portas com arco ${pd} (3 + a da rua + 4 do anel de dentro); vãos com arco ${ph} (com as 4 janelas), na casca ${sa}`);
}
// ---- 2. the crown and the arena ----
{
  ok('2a a planta vale', p.ok, p.ok ? `família ${p.fam}` : p.errs.slice(0, 4).join(' | '));
  const amb = p.rooms.find(m => m.fn === 'deambulatorio'), ar = p.rooms.find(m => m.fn === 'arena');
  ok('2b a coroa guarda os dois raios; a arena é aberta', amb && amb.circ.length === 4 && ar && ar.circ.length === 3 && ar.open === 1, `coroa ${amb && JSON.stringify(amb.circ)}; arena ${ar && JSON.stringify(ar.circ)} aberta ${ar && ar.open}`);
  // (the grid: a cell of the ambulatory's ring floor, one in the arena, the inner ring's wall between them and its arch)
  const g = p.grid; const at = (x, z) => codeAt(p, 0, x, z);
  const inAmb = [[4.5, 0], [-4.5, 0], [0, 4.5], [0, -4.5]].filter(([dx, dz]) => at(R0.cu + dx, R0.cv + dz) === C.FLOOR).length, inAr = at(R0.cu + 1.5, R0.cv);
  // (the cells whose middle is within 0.2 m of the middle of a wall of the inner ring: one aslant without an arch (2) — its
  // cells, a staircase a cell wide that no walk of four neighbours crosses —, and the arch (0))
  const across = id => { const L = P.wlen(id); const m = P.ptOn(id, L / 2); const out = new Set(); const n = g.n; for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) if (Math.hypot((x + 0.5) * CS - m[0], (z + 0.5) * CS - m[1]) <= 0.2) out.add(g.lv[0][z * n + x]); return out; };
  const B = P.test.B; const wallB = across(B.walls[2]), arch = across(B.walls[0]);
  ok('2c a grade: chão na coroa e na arena, a parede de viés entre elas, o arco aberto', inAmb >= 3 && inAr === C.FLOOR && wallB.has(C.WALL) && !arch.has(C.WALL) && arch.has(C.DOOR), `coroa ${inAmb}/4 pontos de chão, arena ${inAr}; através da parede 2: ${[...wallB].join(',')}; através do arco: ${[...arch].join(',')} (1 chão, 2 parede, 6 porta)`);
  // (the ring closed: walking from the arena's middle, only through its arches — never through the wall between them)
  const n = g.n; const lv = g.lv[0]; const seen = new Uint8Array(n * n); const q = [];
  const pass = (x, z) => x >= 0 && z >= 0 && x < n && z < n && (lv[z * n + x] === C.FLOOR);
  const sx = Math.floor(R0.cu / CS), sz = Math.floor(R0.cv / CS); seen[sz * n + sx] = 1; q.push([sx, sz]);
  for (let k = 0; k < q.length; k++) { const [x, z] = q[k]; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Z = z + dz; if (pass(X, Z) && !seen[Z * n + X]) { seen[Z * n + X] = 1; q.push([X, Z]); } } }
  let out = 0; for (let k = 0; k < n * n; k++) if (seen[k] && Math.hypot(((k % n) + 0.5) * CS - R0.cu, (((k / n) | 0) + 0.5) * CS - R0.cv) > R0.inner + R0.ti) out++;
  ok('2d o anel fecha: do meio da arena, só pelo chão, não se sai dela', out === 0, `${q.length} casas de chão a partir do meio; fora do anel de dentro: ${out}`);
  const reach = p.reach && p.reach[0]; const cell = (x, z) => reach[Math.floor(z / CS) * n + Math.floor(x / CS)];
  ok('2e da rua, pelos arcos, chega-se à coroa e à arena', !!reach && cell(R0.cu - 4.5, R0.cv) === 1 && cell(R0.cu, R0.cv) === 1, `coroa (do outro lado) ${reach && cell(R0.cu - 4.5, R0.cv)}, meio da arena ${reach && cell(R0.cu, R0.cv)}`);
  const poly = amb ? amb.poly : []; const radOf = q => Math.hypot(q[0] - amb.circ[0], q[1] - amb.circ[1]);
  ok('2f o contorno da coroa: por fora e de volta por dentro', poly.length === 34 && poly.slice(0, 17).every(q => Math.abs(radOf(q) - amb.circ[2]) < 0.02) && poly.slice(17).every(q => Math.abs(radOf(q) - amb.circ[3]) < 0.02), `${poly.length} pontos`);
  const area = In.roomArea(amb); const want = Math.PI * (amb.circ[2] ** 2 - amb.circ[3] ** 2);
  ok('2g a área da coroa é a do anel', Math.abs(area - want) < 1e-6, `${area.toFixed(2)} m²`);
  const bn = P.test.bench; const rr = bn && bn.r; const near = rr && Math.hypot(Math.max(rr[0] - R0.cu, 0, R0.cu - rr[2]), Math.max(rr[1] - R0.cv, 0, R0.cv - rr[3]));
  ok('2h um banco posto na coroa fica nela, fora da arena', !!bn && near >= R0.inner + R0.ti / 2 - 1e-6, bn ? `o banco a ${near.toFixed(2)} m do meio (a coroa começa em ${(R0.inner + R0.ti / 2).toFixed(2)})` : 'o banco não coube');
}
// ---- 3. what was there stays as it was ----
{
  // (the round hut — out of the centre, where it is: T-161 —: its room's rectangle is still filled and its corners, out of the
  // circle, are the shell's wall — the first cell of the rectangle whose middle is in it)
  const hrec = { v: 4, f: 'redonda.terreo', r: 0, t: 'hut', u: 'casa', s: 'S', o: 0, c: 'classico', e: 3, k: 'ae', cl: 't', fl: 0, d: 1, w: 0, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
  const hp = In.makeFam({ id: 101, type: 'hut', x: 8, y: 8, w: 1, h: 1 }, hrec, 'redonda.terreo');
  const sh = hp.shell; const room = hp.rooms.find(m => m.circ); let corner = null;
  if (room) { const r = room.r; const first = v => (Math.ceil(v / CS - 0.5) + 0.5) * CS; corner = codeAt(hp, 0, first(r[0]), first(r[1])); }
  ok('3a a cabana redonda: os cantos do cômodo fora do círculo continuam parede', sh.kind === 'round' && corner === C.WALL, `casca ${sh.kind}, canto ${corner}`);
  // (a straight wall, as before: the same cells — a house of the people)
  const crec = { v: 4, f: 'integrado.andar', r: 0, t: 'house', u: 'casa', s: 'S', o: 0, c: 'grego', e: 3, k: 'ae', cl: 't', fl: 0, d: 3, w: 0, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
  const cp = In.makeFam({ id: 101, type: 'house', x: 8, y: 8, w: 1, h: 1 }, crec, 'integrado.andar');
  const straight = cp.walls.every(w => Math.abs(w.a[0] - w.b[0]) < 1e-6 || Math.abs(w.a[1] - w.b[1]) < 1e-6);
  ok('3b as paredes de uma casa continuam retas (o viés é só do anel)', straight && cp.ok, `${cp.walls.length} paredes, a planta ${cp.ok ? 'vale' : cp.errs[0]}`);
}
// ---- 4. the rows of seats ----
// (a lot of 4 × 4 tiles, 16 m: the round shell, its arcades; the cavea between them and the podium's ring — three rows
// rising outward from a walk a metre wide, four aisles —, the arena inside; and, on a lot of 3 × 3, a hall with three rows
// rising to its back, an aisle in the middle)
G.BDEF['teste-cavea'] = { name: 'Cávea de teste', w: 4, h: 4, blocks: true }; G.BDEF['teste-reta'] = { name: 'Fileiras de teste', w: 3, h: 3, blocks: true };
const CV = { cu: 8, cv: 8, rad: 7.9, t: 0.3, outer: 7.75, inner: 4.0, r0: 5.2, r1: 7.6 };
const cavea = aisles => P => {
  const { cu, cv, rad, t, outer, inner, r0, r1 } = CV;
  P.shell = { kind: 'round', cu, cv, rad, t, mat: 'pedra', base: 'pedra', floors: 1, eave: 6 }; P.roof = null; P.roofGeo = null;
  P.level(0, 0, 6, 'piso', [cu - rad + t, cv - rad + t, cu + rad - t, cv + rad - t]); P.entryLv = 0;
  const A = P.ringWall(0, cu, cv, outer, t, 6, { n: 24, outer: 1, arcs: [6, 12, 18], aw: 1.4, ah: 3 });
  const w0 = A.walls[0]; const len0 = P.wlen(w0); const d0 = P.door(w0, len0 / 2, 1.6, 3, -1, 'rua', 1, 'arco'); P.entrance = { door: d0, u: cu, v: cv + rad, w: 1.6, lv: 0 };
  P.ringWall(0, cu, cv, inner, 0.3, 2.6, { n: 16, arcs: [0, 4, 8, 12], aw: 1.2, ah: 2.2 });
  // (all round but the front, the way in from the street to the walk and the arena at the floor)
  P.test = { T: P.tiers(0, null, { ring: [cu, cv, r0, r1], arc: [Math.PI / 2 + 0.45, Math.PI / 2 - 0.45 + 2 * Math.PI], dir: 'out', rows: 3, rise: 0.4, tread: 0.8, first: 0.4, aisles, aisleW: 1.0 }) };
  if (P.inside()) return;
  P.room(0, 'cavea', [cu - outer + t / 2, cv - outer + t / 2, cu + outer - t / 2, cv + outer - t / 2], 0, [cu, cv, outer - t / 2, inner + 0.15]);
  const ar = P.room(0, 'arena', [cu - inner + 0.15, cv - inner + 0.15, cu + inner - 0.15, cv + inner - 0.15], 1, [cu, cv, inner - 0.15]);
  // (two places to fight on the sand, facing each other — no piece: P.marks)
  P.marks(0, ar, 'lutar', [[cu - 1, cv, Math.PI / 2], [cu + 1, cv, -Math.PI / 2]], { st: 'fight' });
};
const Q4 = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
In.addFamilies([
  { id: 'teste.cavea', H: 'teste', V: 'cavea', S: 'teste.cavea', name: 'Cávea de teste', can: () => null, build: cavea(Q4) },
  { id: 'teste.semcorredor', H: 'teste', V: 'semcorredor', S: 'teste.semcorredor', name: 'Cávea sem corredor', can: () => null, build: cavea([]) },
  { id: 'teste.reta', H: 'teste', V: 'reta', S: 'teste.reta', name: 'Fileiras retas de teste', can: () => null, build: P => {
    const L = P.L; P.shell = { kind: 'rect', r: [0.2, 0.2, L - 0.2, L - 0.2], t: 0.25, mat: 'pedra', base: 'pedra', floors: 1, eave: 5 }; P.roof = { kind: 'plano', h: 0, over: 0 }; P.roofGeo = null;
    const I = P.inner(); P.level(0, 0, 5, 'piso', I); P.entryLv = 0; P.outer = P.walls4(0, [0.325, 0.325, L - 0.325, L - 0.325], 0.25, 5, 1, 'parede');
    const d = P.door(P.outer.frente, P.wlen(P.outer.frente) / 2, 1.2, 2.4, -1, 'rua', 1, 'porta'); P.entrance = { door: d, u: L / 2, v: L - 0.2, w: 1.2, lv: 0 };
    // (three rows rising to the back, from 2 m in from the front wall; an aisle up the middle)
    P.test = { T: P.tiers(0, null, { r: [I[0], I[1], I[2], I[3] - 2.0], dir: 'n', rows: 3, rise: 0.4, tread: 0.9, aisles: [L / 2], aisleW: 1.0 }) };
    if (P.inside()) return;
    P.room(0, 'sala', I);
  } },
]);
In.addTypes({ 'teste-cavea': { use: 'teste', fams: ['teste.cavea', 'teste.semcorredor'] }, 'teste-reta': { use: 'teste', fams: ['teste.reta'] } });
{
  const crec = Object.assign({}, rec, { t: 'teste-cavea', f: 'teste.cavea' }); const cb = { id: 6101, type: 'teste-cavea', x: 10, y: 10, w: 4, h: 4 };
  const cp = In.makeFam(cb, crec, 'teste.cavea');
  ok('4a a cávea vale; as fileiras na planta, no cômodo dela; as alturas do piso', cp.ok && cp.tiers && cp.tiers.length === 1 && cp.tiers[0].room === cp.rooms.find(m => m.fn === 'cavea').id && !!(cp.hgt && cp.hgt[0]),
    cp.ok ? `${cp.tiers.length} bloco, cômodo ${cp.tiers[0].room}, ${cp.cap.watch} lugares de assistir` : cp.errs.slice(0, 3).join(' | '));
  if (cp.ok) {
    const H = (rad, ang) => In.floorYOf(cp, 0, CV.cu + Math.cos(ang) * rad, CV.cv + Math.sin(ang) * rad);
    const rows = [H(4.6, 0), H(5.6, 0), H(6.4, 0), H(7.2, 0)].map(r2), aisle = [5.4, 5.8, 6.2, 6.6, 7.0, 7.4].map(rr => r2(H(rr, Math.PI / 4)));
    ok('4b a altura: o passeio no chão, as fileiras a 0,4, 0,8 e 1,2; o corredor em meios degraus', rows.join() === '0,0.4,0.8,1.2' && aisle.join() === '0.2,0.4,0.6,0.8,1,1.2', `fora do corredor ${rows.join(' · ')}; no corredor ${aisle.join(' · ')}`);
    // (the walk's step: between the cells of two rows, a whole row, no; up the aisle, half a row, yes)
    const dRow = Math.abs(H(5.6, 0) - H(6.4, 0)), dAis = Math.abs(H(5.4, Math.PI / 4) - H(5.8, Math.PI / 4));
    ok('4c o passo: uma fileira inteira não se sobe a pé, meia fileira sim', dRow > In.BODY.step && dAis <= In.BODY.step, `entre duas fileiras ${r2(dRow)} m, no corredor ${r2(dAis)} m (o passo ${In.BODY.step})`);
    const seats = In.tierSeats(cp); const T = cp.tiers[0];
    const bad = seats.filter(q => { const a = Math.atan2(q.z - CV.cv, q.x - CV.cu); const d = Math.hypot(q.x - CV.cu, q.z - CV.cv); return Q4.some(al => { const g = Math.abs(((a - al) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * d; return g < 0.5 + 0.25 - 0.01; }); });
    const faces = seats.every(q => { const fx = Math.sin(q.ry), fz = Math.cos(q.ry); return fx * (CV.cu - q.x) + fz * (CV.cv - q.z) > 0; });
    const heights = seats.every(q => Math.abs(q.y - (T.first + q.k * T.rise)) < 1e-6);
    ok('4d os lugares de assistir: fora dos corredores, virados para a arena, na altura da fileira; a porta chega a eles', seats.length > 40 && !bad.length && faces && heights && cp.cap.watch === seats.length,
      `${seats.length} lugares (${cp.cap.watch} alcançados), ${bad.length} num corredor, virados para dentro: ${faces}, na altura: ${heights}`);
    const sh = In.shellOfPlan(cp); ok('4e a casca leva as fileiras (o que se vê de longe), sem o cômodo', !!(sh.tiers && sh.tiers.length === 1 && sh.tiers[0].room === undefined && sh.tiers[0].rows === 3), sh.tiers ? JSON.stringify(sh.tiers[0]).slice(0, 120) : 'sem fileiras');
    // (the places: a world of nothing but the building and its spectators, each with a task to watch)
    G.S = { villagers: new Map(), buildings: new Map(), dead: new Map(), settlements: new Map(), clock: 100, day: 3, time: 0.6, avatar: null, nextId: 9000, history: [], fire: new Float32Array(G.N * G.N) };
    const B = Object.assign({}, cb, { built: true, blocks: true, hp: 100, maxHp: 100, set: 0, ip: Object.assign({}, crec) }); G.S.buildings.set(B.id, B);
    for (let k = 0; k < 30; k++) G.S.villagers.set(7000 + k, { id: 7000 + k, name: 'E' + k, g: 'm', age: 30, home: 0, inside: B.id, sleeping: false, partner: 0, task: { type: 'assistir', use: 'assistir' }, job: 0, jail: 0, sick: 0, x: B.x + 2, y: B.y + 2 });
    for (let k = 0; k < 2; k++) G.S.villagers.set(7100 + k, { id: 7100 + k, name: 'G' + k, g: 'm', age: 25, home: 0, inside: B.id, sleeping: false, partner: 0, task: { type: 'lutar', use: 'lutar' }, job: 0, jail: 0, sick: 0, x: B.x + 2, y: B.y + 2 });
    const PL = In.places(B); const got = [...PL.by.values()]; const sat = got.filter(q => q.use === 'assistir');
    const fig = got.filter(q => q.use === 'lutar'); const facing = fig.length === 2 && fig.every(q => { const o = fig.find(r => r !== q); return Math.sin(q.ry) * (o.x - q.x) + Math.cos(q.ry) * (o.z - q.z) > 0; });
    ok('4j os lugares sem peça (P.marks): os dois lutadores na areia, um diante do outro, no chão, no estado da marca', fig.length === 2 && facing && fig.every(q => q.y === 0 && q.st === 'fight' && q.it.mark === 1), `${fig.length} na areia, um diante do outro: ${facing}, ${fig.map(q => q.st + '@' + q.y).join(', ')}`);
    let two = 0; for (let i = 0; i < sat.length; i++) for (let j = i + 1; j < sat.length; j++) if (sat[i].lv === sat[j].lv && Math.hypot(sat[i].x - sat[j].x, sat[i].z - sat[j].z) < 0.45) two++;
    const root = sat.every(q => Math.abs(q.y - Math.max(0, q.it.h - In.SIT_H)) < 1e-6 && q.st === 'sit');
    ok('4f o repartidor: um lugar de assistir para cada espectador, sentado na fileira, nunca dois no mesmo ponto', sat.length === 30 && !two && root, `${sat.length} de 30 sentados, ${two} pares no mesmo ponto, a raiz na fileira menos o assento: ${root}`);
    G.S.buildings.clear(); G.S.villagers.clear();
  }
  const np = In.makeFam(Object.assign({}, cb, { id: 6107 }), Object.assign({}, crec, { f: 'teste.semcorredor' }), 'teste.semcorredor');
  ok('4g sem corredor não se chega às fileiras: a planta é recusada', !np.ok && np.errs.some(e => /não se chega às fileiras/.test(e)), np.ok ? 'valeu' : np.errs.slice(0, 2).join(' | '));
  const rp = In.makeFam({ id: 6201, type: 'teste-reta', x: 10, y: 10, w: 3, h: 3 }, Object.assign({}, rec, { t: 'teste-reta', f: 'teste.reta' }), 'teste.reta');
  if (rp.ok) {
    const L = 12; const T = rp.tiers[0]; const seats = In.tierSeats(rp); const fwd = seats.every(q => Math.abs(q.ry) < 1e-6); const hs = [L / 2 + 2, L / 2 - 0.2].map(u => [0.675, 1.575, 2.475].map(s => r2(In.floorYOf(rp, 0, u, T.r[3] - s))).join(',')); const half = r2(In.floorYOf(rp, 0, L / 2, T.r[3] - 0.225));
    ok('4h as fileiras retas subindo para o fundo: as alturas, o corredor do meio, os lugares virados para a frente', hs[0] === '0.4,0.8,1.2' && hs[1] === '0.4,0.8,1.2' && half === 0.2 && fwd && rp.cap.watch === seats.length && seats.length > 30,
      `na segunda metade de cada fileira: fora do corredor ${hs[0]}, no corredor ${hs[1]}; na primeira metade da 1ª, no corredor, ${half}; ${seats.length} lugares virados para a frente: ${fwd}`);
  } else ok('4h as fileiras retas subindo para o fundo', false, rp.errs.slice(0, 3).join(' | '));
}
// (a stage: one row of 1.2 m, its deck 1.5 m deep facing the front, five steps up its side — the places to act on it, standing)
G.BDEF['teste-palco'] = { name: 'Palco de teste', w: 2, h: 2, blocks: true };
In.addFamilies([{ id: 'teste.palco', H: 'teste', V: 'palco', S: 'teste.palco', name: 'Palco de teste', can: () => null, build: P => {
  const L = P.L; P.shell = { kind: 'rect', r: [0.2, 0.2, L - 0.2, L - 0.2], t: 0.25, mat: 'pedra', base: 'pedra', floors: 1, eave: 5 }; P.roof = { kind: 'plano', h: 0, over: 0 }; P.roofGeo = null;
  const I = P.inner(); P.level(0, 0, 5, 'piso', I); P.entryLv = 0; P.outer = P.walls4(0, [0.325, 0.325, L - 0.325, L - 0.325], 0.25, 5, 1, 'parede');
  const d = P.door(P.outer.frente, P.wlen(P.outer.frente) / 2, 1.2, 2.4, -1, 'rua', 1, 'porta'); P.entrance = { door: d, u: L / 2, v: L - 0.2, w: 1.2, lv: 0 };
  P.test = { T: P.tiers(0, null, { r: [I[0], I[1], I[2], I[1] + 1.5], dir: 'n', rows: 1, rise: 1.2, tread: 1.5, use: 'atuar', seat: 1.0, aisles: [I[0] + 0.6], aisleW: 1.0 }) };
  if (P.inside()) return;
  P.room(0, 'sala', I);
} }]);
In.addTypes({ 'teste-palco': { use: 'teste', fams: ['teste.palco'] } });
{
  const sp = In.makeFam({ id: 6301, type: 'teste-palco', x: 10, y: 10, w: 2, h: 2 }, Object.assign({}, rec, { t: 'teste-palco', f: 'teste.palco' }), 'teste.palco');
  if (sp.ok) {
    const T = sp.tiers[0]; const u = T.aisles[0]; const v1 = T.r[3]; const steps = [0.15, 0.45, 0.75, 1.05, 1.35].map(s => r2(In.floorYOf(sp, 0, u, v1 - s)));
    const seats = In.tierSeats(sp); const t = In.table ? null : null; void t;
    const up = steps.every((h, k) => k === 0 ? h <= In.BODY.step : h - steps[k - 1] <= In.BODY.step + 1e-6) && steps[4] === 1.2;
    ok('4i o palco: cinco degraus de 0,24 pela lateral, a 1,2 m; os lugares de atuar no palco, virados para a frente', T.climb === 5 && up && T.use === 'atuar' && seats.length > 3 && seats.every(q => q.T.use === 'atuar' && Math.abs(q.y - 1.2) < 1e-6 && Math.abs(q.ry) < 1e-6),
      `${T.climb} degraus: ${steps.join(' · ')}; ${seats.length} lugares de atuar`);
  } else ok('4i o palco', false, sp.errs.slice(0, 3).join(' | '));
}
// ---- 5. the solid base, the colonnade, the wide steps ----
// (a temple on a lot of 3 × 3, 12 m: its floor on a solid base 1.2 m high, the crepidoma's two lower steps about it; the
// portico before the cella, six columns across its front — the middle opening the way in —; up from the street, steps
// 2 m wide (or 1 m: refused, a wide flight is 1.2 at least))
G.BDEF['teste-templo'] = { name: 'Templo de teste', w: 3, h: 3, blocks: true };
const temple = sw => P => {
  const H0 = 1.2; P.shell = { kind: 'rect', r: [1, 1, 11, 9.5], t: 0.4, mat: 'pedra', base: 'macica', baseH: H0, baseSteps: [{ r: [0.6, 0.6, 11.4, 9.9], h: 0.4 }, { r: [0.8, 0.8, 11.2, 9.7], h: 0.8 }], floors: 1, eave: H0 + 4.5 };
  P.roof = { kind: 'duas-aguas', along: 'v', h: 1.6, over: 0.3 }; P.roofGeo = null;
  P.level(0, H0, 4.5, 'piso', [1.4, 1.4, 10.6, 9.5]); P.entryLv = 0;
  // (the cella's walls; the portico's two sides; the columns across the front)
  const cw = P.walls4(0, [1.2, 1.2, 10.8, 7.0], 0.4, 4.5, 1, 'parede', { frente: 1 });
  P.wall(0, [10.8, 7.0], [10.8, 9.5], 0.4, 4.5, 1, 'parede'); P.wall(0, [1.2, 9.5], [1.2, 7.0], 0.4, 4.5, 1, 'parede');
  const cf = P.wall(0, [10.6, 7.0], [1.4, 7.0], 0.4, 4.5, 0, 'parede'); void cw;
  const C = P.colonnade(0, [10.75, 9.25], [1.25, 9.25], { n: 6, col: 0.5, h: 4.5, outer: 1, door: true, rua: true });
  P.entrance = { door: C.door, u: 6, v: 9.5, w: P.doors[C.door].w, lv: 0 };
  P.door(cf, P.wlen(cf) / 2, 1.4, 3.0, -1, -1, 0, 'porta');
  P.stair('degraus', -1, 0, [6 - sw / 2, 9.52, 6 + sw / 2, 11.12], 0, -1, null, { larga: 1 });
  P.test = { C };
  if (P.inside()) return;
  P.room(0, 'cella', [1.4, 1.4, 10.6, 6.8]); P.room(0, 'portico', [1.4, 7.2, 10.6, 9.0]);
};
In.addFamilies([
  { id: 'teste.templo', H: 'teste', V: 'templo', S: 'teste.templo', name: 'Templo de teste', can: () => null, build: temple(2.0) },
  { id: 'teste.estreito', H: 'teste', V: 'estreito', S: 'teste.estreito', name: 'Templo de degraus estreitos', can: () => null, build: temple(1.0) },
]);
In.addTypes({ 'teste-templo': { use: 'teste', fams: ['teste.templo', 'teste.estreito'] } });
{
  const trec = Object.assign({}, rec, { t: 'teste-templo', f: 'teste.templo' }); const tp = In.makeFam({ id: 6401, type: 'teste-templo', x: 10, y: 10, w: 3, h: 3 }, trec, 'teste.templo');
  const sh = tp.shell;
  ok('5a o templo na base maciça vale; a casca leva a base, a altura e os degraus de fora dela', tp.ok && sh.base === 'macica' && sh.baseH === 1.2 && sh.baseSteps && sh.baseSteps.length === 2 && tp.levels[0].y === 1.2,
    tp.ok ? `base ${sh.base} a ${sh.baseH} m, ${sh.baseSteps.length} degraus da base, o piso a ${tp.levels[0].y} m` : tp.errs.slice(0, 3).join(' | '));
  if (tp.ok) {
    const w = tp.walls.find(q => q.kind === 'colunata'); const ds = tp.doors.filter(d => d.wall === w.id); const street = ds.filter(d => d.rooms.includes('rua'));
    // (along the colonnade's line: the columns are wall, the spaces between them open)
    const codes = []; for (let u = 1.3; u <= 10.7; u += 0.25) codes.push(codeAt(tp, 0, u, 9.25)); const col = codes.filter(c => c === C.WALL).length, gap = codes.filter(c => c === C.DOOR).length;
    const reach = tp.reach[0]; const n = tp.grid.n; const cella = reach[Math.floor(4 / CS) * n + Math.floor(6 / CS)];
    ok('5b a colunata: as colunas são parede, os intercolúnios passagens (um deles a entrada); da rua chega-se à cela', !!w && ds.length === 5 && street.length === 1 && col > 0 && gap > col && cella === 1,
      `${ds.length} intercolúnios (${street.length} da rua), na linha ${col} casas de coluna e ${gap} de passagem; a cela alcançada: ${cella}`);
    const st = tp.stairs.find(s => s.kind === 'degraus'); const mid = r2(In.floorYOf(tp, 0, 6, 10.32));
    ok('5c os degraus largos de fora: 2 m, a classe pela inclinação, da rua ao piso', !!st && st.larga === 1 && st.w === 2 && st.cls === 'degraus' && Math.abs(mid - 0.6) < 0.08, st ? `${st.w} m, ${st.slope}° (${st.cls}), no meio a ${mid} m` : 'sem degraus');
  }
  const np = In.makeFam({ id: 6402, type: 'teste-templo', x: 10, y: 10, w: 3, h: 3 }, Object.assign({}, trec, { f: 'teste.estreito' }), 'teste.estreito');
  ok('5d a escada larga estreita é recusada', !np.ok && np.errs.some(e => /escada larga com 1.00/.test(e)), np.ok ? 'valeu' : np.errs.slice(0, 2).join(' | '));
}
// ---- 6. the kit of the tavern, for every recipe (F1, D-991, D-993): the record's choices and the frame with its mirror, a zone
// of a way and one of a post, the corridor with its trunk (and the one refused), the fixed piece's other place, the groups of a
// table with their seats on the pieces and who works at them in the plan, the mark and the piece of a post, a model of seats in
// the air refused — on a hall of 12 m, its door by the record's own choice
G.BDEF['teste-kit'] = { name: 'Kit de teste', w: 3, h: 3, blocks: true };
const KITM = { redonda: { t: 'mesa-redonda', w: 0.9, d: 0.9, seats: [[0, -0.68], [0, 0.68], [-0.68, 0], [0.68, 0]].map(([a, b]) => ['banquinho', a, b, 0.4, 0.4]) } };
const KITAR = { arcas: { t: 'mesa-redonda', w: 0.9, d: 0.9, seats: [['arca', 0, -0.75, 0.9, 0.5], ['banquinho', 0, 0.68, 0.4, 0.4]] } };
const kitBuild = models => P => {
  const L = P.L; P.shell = { kind: 'rect', r: [0.2, 0.2, L - 0.2, L - 0.2], t: 0.25, mat: 'pedra', base: 'pedra', floors: 1, eave: 4 }; P.roof = { kind: 'plano', h: 0, over: 0 }; P.roofGeo = null;
  const I = P.inner(); P.level(0, 0, 4, 'piso', I); P.entryLv = 0; P.outer = P.walls4(0, [0.325, 0.325, L - 0.325, L - 0.325], 0.25, 4, 1, 'parede');
  // (the record's choices — the kit's draws — and the frame they mirror: the door at 3 m from the frame's left)
  const X = { bar: P.choose(1, ['a', 'b', 'c']), lado: P.choose(2, [0, 1]), h: P.hashOf(7) }; const V = P.frame(X.lado);
  const du = V.U(3.0); const fw = P.outer.frente; const d = P.door(fw, P.atOf(fw, [du, P.walls[fw].a[1]]), 1.2, 2.4, -1, 'rua', 1, 'porta'); P.entrance = { door: d, u: du, v: L - 0.2, w: 1.2, lv: 0 };
  P.test = { X, V, I };
  if (P.inside()) return;
  const hall = P.room(0, 'salao', I); P.test.hall = hall;
  // (the counter at the back, in the frame; a way kept where the stage's first place is and all along its steps: its other place)
  const bal = P.atAlong('balcao', 0, hall, [I[0] + 1.0, I[1] + 1.4, I[0] + 2.8, I[1] + 2.0], 0, 1, { frame: V });
  const zK = P.zone(0, V.R([I[2] - 1.4, I[1], I[2], I[1] + 3.2]), { aisle: 1 });
  const st = P.atAlong('estrado-musico', 0, hall, [I[2] - 1.2, I[1] + 0.2, I[2], I[1] + 1.8], -1, 0, { frame: V, alt: [[I[2] - 1.2, I[1] + 3.6, I[2], I[1] + 5.2]] });
  const no = P.atAlong('estrado-musico', 0, hall, [I[2] - 1.2, I[1] + 0.2, I[2], I[1] + 1.8], -1, 0, { frame: V, fixed: 1 });
  // (a post of the guard by the door — a zone and a mark —, and a chest of the scribe's, each saying who works there)
  const zp = V.R([3.8, L - 1.6, 4.6, L - 0.8]); P.zone(0, zp, { papel: 'guarda', faz: 'vigiar' });
  P.marks(0, hall, 'vigiar', [[V.U(I[0] + 0.6), L - 1.0, 0]], { st: 'stand', papel: 'guarda' });
  P.place('arca', 0, hall, { sides: ['esquerda', 'direita'], extra: { papel: 'escriba', faz: 'guardar' } });
  // (the corridor: the trunk from the door to the counter's line, then the counter and the stage; and one to nowhere, refused)
  const K = P.clearance(0, hall, true); const start = [du, I[3] - 0.6];
  const use = (got, u) => (got ? P.spotsOf(got.it).filter(q => !q.on && q.use === u).map(q => [q.u, q.v]) : []);
  const zb = P.zones.length; const nowhere = P.aisle(0, hall, start, [{ why: 'longe', pts: [[-5, -5]] }], { K: P.clearance(0, hall, true) }); const z0 = P.zones.length - zb;
  const way = P.aisle(0, hall, start, [{ why: 'balcão', pts: use(bal, 'comprar') }, { why: 'estrado', pts: use(st, 'acesso') }], { K, w: 1.0, trunk: [start[0], I[1] + 3.0] });
  // (the groups: round tables of stools for a council, laid; taken back; laid again)
  const n0 = P.items.length; const G1 = P.groups(0, hall, { models, K, start, fixed: [{ pts: use(bal, 'comprar') }], cap: 12, papel: 'conselheiro', faz: 'aconselhar' });
  G1.pack(Object.keys(models), false, 1); const first = { seats: G1.seats, n: G1.groups.length, gl: P.groupList.length };
  G1.reset(); const back = { items: P.items.length - n0, gl: P.groupList.length, seats: G1.seats };
  G1.pack(Object.keys(models), false, 1);
  Object.assign(P.test, { bal, st, no, zK, zp, nowhere, z0, way, first, back, n0, seats: G1.seats, n: G1.groups.length });
};
let kitP = null; const KITB = models => P => { kitP = P; return kitBuild(models)(P); };
In.addFamilies([{ id: 'teste.kit', H: 'teste', V: 'kit', S: 'teste.kit', name: 'Kit de teste', can: () => null, build: KITB(KITM) },
  { id: 'teste.kit-ar', H: 'teste', V: 'kit-ar', S: 'teste.kit-ar', name: 'Kit de teste, assentos no ar', can: () => null, build: KITB(KITAR) }]);
In.addTypes({ 'teste-kit': { use: 'teste-kit', fams: ['teste.kit', 'teste.kit-ar'] } });
{
  const krec = s => Object.assign({}, rec, { t: 'teste-kit', u: 'teste-kit', f: 'teste.kit', s });
  const kp = (id, s, f) => { const p = In.makeFam({ id, type: 'teste-kit', x: 10, y: 10, w: 3, h: 3 }, Object.assign(krec(s), { f: f || 'teste.kit' }), f || 'teste.kit'); return { p, P: kitP }; };
  const A = kp(7101, 'S'), B = kp(7101, 'S'), E = kp(7101, 'E'); const T = A.P.test; const L = A.P.L;
  // 6a: the choices
  const bare = In.kitOn({ b: { id: 7101 }, L, rec: krec('S'), tr: {} }); const X2 = { bar: bare.choose(1, ['a', 'b', 'c']), lado: bare.choose(2, [0, 1]), h: bare.hashOf(7) };
  const others = new Set(); for (let k = 0; k < 24; k++) { const o = In.kitOn({ b: { id: 9001 + k * 7919 }, L }); others.add(o.choose(1, ['a', 'b', 'c']) + o.choose(2, [0, 1])); }
  ok('6a as escolhas do registro: as mesmas em toda planta e fora dela (In.kitOn), outras entre os ids', A.p.ok && JSON.stringify(T.X) === JSON.stringify(B.P.test.X) && JSON.stringify(T.X) === JSON.stringify(X2) && T.X.h === In.idHash(7101, 7) && others.size >= 4,
    A.p.ok ? `${JSON.stringify(T.X)}; 24 ids dão ${others.size} pares (bar, lado)` : A.p.errs.slice(0, 3).join(' | '));
  // 6b: the frame and its mirror
  const F1 = A.P.frame(1), F0 = A.P.frame(0);
  ok('6b o quadro com espelho: u → L − u, o retângulo e a direção; sem espelho, o mesmo', JSON.stringify(F1.R([1, 2, 3, 4])) === JSON.stringify([L - 3, 2, L - 1, 4]) && F1.U(1) === L - 1 && F1.F(1) === -1 && JSON.stringify(F0.R([1, 2, 3, 4])) === '[1,2,3,4]' && F0.F(1) === 1 && T.V.flip === T.X.lado,
    `espelhado: ${JSON.stringify(F1.R([1, 2, 3, 4]))}, U(1) ${F1.U(1)}, F(1) ${F1.F(1)}; a porta do registro a u ${T.V.U(3.0)}`);
  // 6c: the way kept and the post's zone: no piece in a way; the plan has the post's zone alone, in the lot, in its room
  const p = A.p; const ovl = (a, b) => a[0] < b[2] - 1e-6 && b[0] < a[2] - 1e-6 && a[1] < b[3] - 1e-6 && b[1] < a[3] - 1e-6;
  const aisles = A.P.zones.filter(z => z.aisle); const inWay = A.P.items.slice(T.n0).filter(it => aisles.some(z => ovl(it.r, z.r))); // (the groups, laid after the ways)
  const pz = p.zones || []; const locR = (s, r) => { const a = In.toLoc(s, L, r[0], r[1]), b = In.toLoc(s, L, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])].map(r2); };
  const ze = (E.p.zones || [])[0];
  ok('6c as zonas: nenhuma peça posta depois num caminho guardado; na planta só a do posto (o papel, o que se faz, o cômodo), no lote — girado com ele', p.ok && !inWay.length && pz.length === 1 && pz[0].papel === 'guarda' && pz[0].faz === 'vigiar' && pz[0].room === T.hall && JSON.stringify(pz[0].r) === JSON.stringify(locR('S', T.zp)) && E.p.ok && ze && JSON.stringify(ze.r) === JSON.stringify(locR('E', E.P.test.zp)),
    `${aisles.length} zonas de caminho, ${inWay.length} peças nelas; na planta ${pz.length} zona: ${pz[0] ? JSON.stringify(pz[0]) : '-'}; girada (E): ${ze ? JSON.stringify(ze.r) : '-'}`);
  // 6d: the corridor
  ok('6d o corredor: o tronco e os ramos até o balcão e o estrado, guardados como caminho; a um alvo que nenhum caminho alcança, recusado sem guardar nada', T.way.ok && T.way.path.some(Boolean) && aisles.length > 0 && !T.nowhere.ok && T.nowhere.why === 'longe' && T.z0 === 0,
    `o corredor ${T.way.ok ? 'chega' : 'NÃO chega (' + T.way.why + ')'}, ${T.way.path.filter(Boolean).length} casas de 10 cm, ${aisles.length} faixas; o de lugar nenhum: ${T.nowhere.ok ? 'ACEITO' : 'recusado (' + T.nowhere.why + ')'}`);
  // 6e: the fixed piece's other place
  ok('6e a peça fixa e a sua reserva: o estrado no outro lugar quando o caminho guardado toma o primeiro e os passos; só no lugar dele, nenhum', !!T.st && JSON.stringify(T.st.r) === JSON.stringify([T.I[2] - 1.2, T.I[1] + 3.6, T.I[2], T.I[1] + 5.2].map(r2)) && T.no === null && !!T.bal,
    `o estrado em ${T.st ? T.st.r.join(', ') : 'nenhum lugar'}; fixo: ${T.no ? 'POSTO' : 'nenhum'}`);
  // 6f: the groups
  const seatsOn = p.items.filter(it => it.kind === 'banquinho').every(it => it.spots.some(sp => sp.use === 'sentar' && sp.on));
  const gs = p.groups || []; const ids = new Set(p.items.map(it => it.id)); const gOK = gs.length === T.n && gs.every(g => g.papel === 'conselheiro' && g.faz === 'aconselhar' && g.room === T.hall && g.items.length >= 3 && g.items.every(id => ids.has(id)) && g.items.some(id => p.items.find(it => it.id === id).kind === 'mesa-redonda'));
  ok('6f os grupos de mesa: os assentos sobre as peças, o caminho aberto; na planta cada grupo com quem senta ali e as suas peças; o reset tira tudo', p.ok && T.seats >= 4 && seatsOn && gOK && T.back.items === 0 && T.back.gl === 0 && T.back.seats === 0 && T.first.seats === T.seats && T.first.gl === T.n,
    `${T.n} grupos, ${T.seats} lugares; na planta ${gs.length} grupos (${gs.map(g => g.items.length + ' peças').join(', ')}); depois do reset: ${T.back.items} peças, ${T.back.gl} grupos`);
  // 6g: the mark and the piece of a post
  const mk = (p.marks || [])[0], ar = p.items.find(it => it.kind === 'arca'); const plain = p.items.filter(it => it.kind !== 'arca' && it.papel !== undefined);
  ok('6g a marca e a peça de um posto dizem quem trabalha ali na planta; as outras peças sem papel', !!mk && mk.papel === 'guarda' && mk.st === 'stand' && !!ar && ar.papel === 'escriba' && ar.faz === 'guardar' && !plain.length, `a marca: ${mk ? mk.use + '/' + mk.papel : '-'}; a arca: ${ar ? ar.papel + '/' + ar.faz : '-'}; ${plain.length} outras com papel`);
  // 6h: seats in the air refused
  const N = kp(7103, 'S', 'teste.kit-ar');
  ok('6h um modelo de grupo com um assento que não é peça de sentar é recusado, dito — ninguém sentado no ar', !N.p.ok && N.p.errs.some(e => /o grupo arcas: arca não é peça de sentar/.test(e)) && !(N.p.groups || []).length, N.p.errs.slice(0, 2).join(' | '));
}
// ---- 7. the wealth of now for any type (F6, D-992): a rule of a test on the use of a world's building — the first that stands of a
// type with no rule of its own, its owner one of the town, his coins by the ledger —: the step up at the turn of the day with its
// fact, the band, the patience, the save in the middle, the rule only reading; taken off, nothing more
{
  M.pronto('cidade'); const out = [], said = [];
  const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
  const b0 = [...G.S.buildings.values()].filter(b => b.built && b.ip && b.type === b.ip.t && b.type !== 'ruin' && !In.wealthDays(b)).sort((a, b) => a.id - b.id)[0];
  const k = b0 && [...G.S.villagers.values()].filter(v => v.set === b0.set && v.age >= 20 && v.age < 55 && !v.captive && G.Eco.homeOf(v)).sort((a, c) => a.id - c.id)[0];
  if (!b0 || !k) out.push(`sem prédio ou sem dono no mundo (${b0 ? b0.type + ' #' + b0.id : 'sem prédio'})`);
  else {
    const id = b0.id, kid = k.id; const use = In.TYPES[b0.ip.t].use; const Q = [10, 30];
    // (the rule reads the owner's coins by the economy's door, and the merchant house's banner; it writes nothing)
    In.wealthRule(use, b => { const v = b.id === id ? G.S.villagers.get(kid) : null; if (!v) return null; const c = G.Eco.purse(v) || 0; const h = G.Eco.homeOf(v); const el = !!(h && h.elite); return { up: el || c >= Q[1] ? 2 : c >= Q[0] ? 1 : 0, keep: el ? 2 : c >= Q[1] * 0.6 ? 2 : c >= Q[0] * 0.5 ? 1 : 0, coins: c, elite: el }; }, { days: 5 });
    const coins = n => { const v = G.S.villagers.get(kid); const r = 'h:' + v.home; const have = G.Depot.get(r, 'moedas'); const f = 'f:' + G.Fac.ofV(v).id; G.Fac.ofV(v).stock.moedas = Math.max(G.Fac.ofV(v).stock.moedas || 0, 500); sim(() => { if (n > have) G.Depot.move(f, r, 'moedas', n - have, { code: 'prova', by: v.id }); else if (n < have) G.Depot.move(r, f, 'moedas', have - n, { code: 'prova', by: v.id }); }); };
    const day = () => { G.S.day++; sim(() => In.onNewDay()); return G.S.buildings.get(id); };
    const facts = () => G.S.buildings.get(id).ip.h.filter(f => f[1] === 'riqueza');
    coins(40); const s0 = G.Save.serialize(); for (let q = 0; q < 30; q++) In.wealthOf(G.S.buildings.get(id)); if (G.Save.serialize() !== s0) out.push('a leitura da riqueza mudou o mundo');
    let b = day(); if ((b.ip.q | 0) !== 2 || facts().length !== 1 || facts()[0][2] !== '2') out.push(`com 40 moedas: o degrau ${b.ip.q}, ${facts().length} fatos`);
    coins(20); b = day(); if ((b.ip.q | 0) !== 2) out.push(`a faixa: 20 moedas tiraram o degrau (${b.ip.q})`);
    coins(4); b = day(); if ((b.ip.q | 0) !== 2) out.push(`a paciência: o degrau mudou no dia seguinte (${b.ip.q})`);
    M.salvarCarregar(); b = G.S.buildings.get(id); if ((b.ip.q | 0) !== 2) out.push('o save no meio da paciência: outro degrau');
    for (let q = 0; q < 5; q++) b = day(); if ((b.ip.q | 0) !== 0 || facts().length !== 2) out.push(`depois da paciência, com 4 moedas: o degrau ${b.ip.q}, ${facts().length} fatos`);
    said.push(`${b0.type} #${id} (o uso ${use}): 40 moedas, o degrau 2 com o fato; 20, fica (a faixa); 4, fica até a paciência de 5 dias, salvo e carregado no meio; depois, 0, com o fato`);
    // (the rule taken off: no reading, no change)
    In.wealthRule(use, null); coins(80); const r0 = b.ip.r; b = day(); b = day();
    if (In.wealthOf(b) !== null || b.ip.r !== r0 || (b.ip.q | 0) !== 0) out.push(`sem a regra: a leitura ${JSON.stringify(In.wealthOf(b))}, o degrau ${b.ip.q}`);
    else said.push('sem a regra, nada');
    // (the tavern's rule, the one registered with its recipe: the same reading as the engine's door gives)
    const tv = [...G.S.buildings.values()].find(q => q.type === 'taverna' && q.ip); if (tv && In.tavernStep(tv) !== null && JSON.stringify(In.tavernStep(tv)) !== JSON.stringify(In.wealthOf(tv))) out.push('a leitura da taverna não é a da regra dela');
  }
  ok('7 a riqueza de agora de qualquer tipo (In.wealthRule): o degrau pelo dono na virada do dia, com o fato; a faixa; a paciência; o save no meio; a regra só lê; sem ela, nada', !out.length && M.limpo(), out.length ? out.join(' / ') : said.join('; '));
  // 7b: the engine's band (In.wealthBand) is the tavern's of before (D-724) amount by amount — up at the marks, kept down to 0.6 of
  // the upper and half the lower, the banner the rich step —, for the tavern's marks and another's
  const bandWas = (c, Q, el) => ({ up: el || c >= Q[1] ? 2 : c >= Q[0] ? 1 : 0, keep: el ? 2 : c >= Q[1] * 0.6 ? 2 : c >= Q[0] * 0.5 ? 1 : 0 });
  const diffB = []; let nB = 0;
  for (const Q of [In.TAV_Q, [10, 30], [5, 200]]) for (const el of [false, true]) for (let c = 0; c <= 2 * Q[1] + 3; c += 0.5) { nB++; const a = In.wealthBand(c, Q, el), w = bandWas(c, Q, el); if (a.up !== w.up || a.keep !== w.keep) diffB.push(`${c}/${Q}/${el}: ${JSON.stringify(a)} ≠ ${JSON.stringify(w)}`); }
  ok('7b a faixa do motor (In.wealthBand) é a da taverna de antes, moeda a moeda', !diffB.length, diffB.length ? diffB.slice(0, 3).join(' · ') : `${nB} somas (as marcas ${JSON.stringify(In.TAV_Q)} da taverna, [10,30] e [5,200]; com e sem a bandeira), iguais`);
}
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
