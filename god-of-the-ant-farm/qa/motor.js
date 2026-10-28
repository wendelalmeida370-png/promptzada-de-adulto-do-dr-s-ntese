// motor: as peças novas do motor das plantas (a B4 do Patch 2, para as receitas dos monumentos do P3) provadas em Node,
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
//   node qa/motor.js
const M = require('./nodemundo.js');
const G = M.load({});
const In = G.Interiors; const C = In.CELL; const CS = In.CS;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | motor ${name} | ${info}`); if (!c) fails.push(name); };
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
  // (the round hut: its room's rectangle is still filled and its corners, out of the circle, are the shell's wall)
  const hrec = { v: 4, f: 'redonda.terreo', r: 0, t: 'hut', u: 'casa', s: 'S', o: 0, c: 'classico', e: 3, k: 'ae', cl: 't', fl: 0, d: 3, w: 0, pw: 0, h: [], m: 0, fx: [], dr: {}, hh: 0, nm: 0, vz: 0, ab: 0 };
  const hp = In.makeFam({ id: 101, type: 'hut', x: 8, y: 8, w: 1, h: 1 }, hrec, 'redonda.terreo');
  const sh = hp.shell; const room = hp.rooms.find(m => m.circ); let corner = null;
  if (room) { const r = room.r; corner = codeAt(hp, 0, r[0] + 0.05, r[1] + 0.05); }
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
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
