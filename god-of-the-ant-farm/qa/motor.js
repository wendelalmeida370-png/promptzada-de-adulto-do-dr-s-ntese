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
const err = M.erros(); if (Object.keys(err.mod).length || err.console.length) ok('sem erros de módulo', false, JSON.stringify(err).slice(0, 300));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
