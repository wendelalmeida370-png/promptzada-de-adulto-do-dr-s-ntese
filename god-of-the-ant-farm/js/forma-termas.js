'use strict';
// ============================================================
//  Forma, the great baths (D-106, D-183; T-784): the forms of the
//  bigger steps of the baths' ladder — the thermae of five tiles
//  (20 m) and the great thermae of seven (28 m) — of the peoples
//  of the thermae: the Roman's, the Greek's and the classical
//  people's (the Egyptian's sacred lake, the Aztec's temazcal and
//  the Norse's sauna are other drawings: no bigger step of them
//  here). Put in by G.Forma.def(type, style, fn(L, n), sizes).
//  Pure as js/forma.js (rule 36): no chance, no world, no 3D; the
//  body's rules hold at every size.
// ============================================================
(function (G) {
  const Fo = G.Forma; if (!Fo) return;
  const TILE = 4;
  const r2 = x => Math.round(x * 100) / 100;
  const BASE = ['base0', 'base1', 'base2'], WALL = ['wl', 'wr', 'top'], COL = ['col0', 'col1', 'col0'], PAR = ['par0', 'par1', 'par0'];
  const ROOF = ['roof0', 'roof1', 'gable', 'roof2'];
  const POOL = ['#d8d0c0', '#b8b0a0', '#e8e0d0']; // (the rim of an open pool: dressed stone)

  // ------------------------------ the risk ------------------------------
  // A town's thermae is no bigger hall of three rooms: it is the sequence of the bath, each room its own. On a low podium the
  // flight of steps climbs to, the block of the baths across the back and the palaestra before it — the court where one
  // exercises, open to the sky behind its low wall, the portico of columns along the block's front its shade.
  // The thermae (5 tiles): in the block's middle, behind the portal, the changing room (vestiário: the pegs along its walls);
  // to its left the cold room with the cold pool (frio), behind that the warm room with the warm pool (morno), and across the
  // back's middle the hot room under the dome (quente: the hot pool) — a ring one bathes round —; at the right the service
  // wing: the store (servico) and, behind it, the furnace (fornalha) against the hot room's wall, the stoker's.
  // The great thermae (7 tiles), symmetric on its axis: behind the portal the great hall under its clerestory (frio: the two
  // cold pools, the four columns that carry its vault), on the axis behind it the hot room under the dome (quente: the great
  // hot pool and two more at its ends); at either hand a wing of three rooms — a changing room at the front, a warm room with
  // its pool behind it, and at the back the furnace (left) and the sweating room (right: suadouro, its benches) —; in the
  // palaestra two open pools either side of the way in (natação), the statues at its corners.
  // The risk below is that one definition: the god paints its outside from it (the elements), and the plan of the baths (js/
  // int-termas.js, the family forma.banhos) lays out its walls, rooms, doors, windows, columns, pools, furnace and pegs from the
  // same numbers, kept on the podium's element (e.risco) as the temple's are. Metres in the form's frame (u across, v from
  // the back, the way in at v = L, y over the lot's highest ground).
  const DOOR_H = 2.1; // (a service door's height)
  function riscoTermas(st, n) {
    const L = n * TILE, k = n >= 7 ? 1 : 0; const pick = a => a[k]; const RO = st === 'romano';
    // ---- the podium and its flight from the street: risers of 0.25 m, its foot at the lot's edge ----
    const e = pick([0.3, 0.4]), Hp = pick([0.75, 1.0]), nr = Math.round(Hp / 0.25), td = 0.42; const Vp = r2(L - e - (nr - 1) * td);
    const sw = pick([4.0, 6.0]); const su0 = r2(L / 2 - sw / 2), su1 = r2(L / 2 + sw / 2);
    const treads = []; for (let q = 0; q < nr - 1; q++) treads.push({ r: [su0, r2(L - e - td * (q + 1)), su1, r2(L - e - td * q)], y: r2(Hp * (q + 1) / nr) });
    const R = { st, n, L, k, fam: 'forma.banhos', termas: 1, RO, Hp, nr, td, Vp, sw, su0, su1, treads, e, podium: [e, e, r2(L - e), Vp], stair: [su0, Vp, su1, r2(L - e)],
      walls: [], rooms: [], cols: [], annexes: [], pieces: [], pools: [], pegs: [], seats: [], extras: [], roofs: [], attic: [] };
    const room = (fn, r, o) => { R.rooms.push(Object.assign({ lv: 0, fn, r: r.map(r2), id: R.rooms.length }, o || {})); return R.rooms.length - 1; };
    const wall = (a, b, tw, h, kind, o) => { const w = Object.assign({ lv: 0, a: a.map(r2), b: b.map(r2), t: tw, h: r2(h), kind, outer: 0, casca: 0, ops: [] }, o || {}); R.walls.push(w); return w; };
    const door = (w, p, ww, hh, kind, o) => { const d = Object.assign({ k: kind || 'porta', p: p.map(r2), w: ww, h: hh }, o || {}); w.ops.push(d); return d; };
    const win = (w, p, ww, hh, sill) => { w.ops.push({ k: 'janela', p: p.map(r2), w: ww, h: hh, sill }); };
    const solid = (rm, r, h, kind, o) => { R.pieces.push(Object.assign({ room: rm, r: r.map(r2), h: r2(h), k: kind }, o || {})); };
    const evenly = (len, rc, m) => Array.from({ length: m }, (_, q) => r2(rc + q * (len - 2 * rc) / (m - 1)));
    // (a pool: its rectangle, the way its front faces — where one goes down into it, and from either end —; open: under the
    // sky, the form's own water)
    const pool = (rm, r, f, kind, o) => { R.pools.push(Object.assign({ room: rm, r: r.map(r2), f, k: kind }, o || {})); };
    // (a row of pegs hung on a wall of a room: side — the wall it hangs on, from the room —, a0 where it starts along it)
    const PEG = { w: 1.2, d: 0.2 };
    const peg = (rm, side, a0) => { const q = R.rooms[rm].r; const r = side === 'fundo' ? [a0, q[1], a0 + PEG.w, q[1] + PEG.d] : side === 'frente' ? [a0, q[3] - PEG.d, a0 + PEG.w, q[3]] : side === 'esquerda' ? [q[0], a0, q[0] + PEG.d, a0 + PEG.w] : [q[2] - PEG.d, a0, q[2], a0 + PEG.w];
      R.pegs.push({ room: rm, r: r.map(r2), side, f: side === 'fundo' ? [0, 1] : side === 'frente' ? [0, -1] : side === 'esquerda' ? [1, 0] : [-1, 0] }); };
    // (a piece against a wall of a room — a bench, the wood, the jars —: w along the wall, d out of it)
    const against = (list, kind, rm, side, a0, w, d) => { const q = R.rooms[rm].r; const r = side === 'fundo' ? [a0, q[1], a0 + w, q[1] + d] : side === 'frente' ? [a0, q[3] - d, a0 + w, q[3]] : side === 'esquerda' ? [q[0], a0, q[0] + d, a0 + w] : [q[2] - d, a0, q[2], a0 + w];
      list.push({ kind, room: rm, r: r.map(r2), f: side === 'fundo' ? [0, 1] : side === 'frente' ? [0, -1] : side === 'esquerda' ? [1, 0] : [-1, 0] }); };
    const bench = (rm, side, a0) => against(R.seats, 'banco', rm, side, a0, 1.1, 0.35);
    // ---- the block of the baths (the shell): across the back of the podium, a hand in from its edge ----
    const m = 0.3, D = pick([11.0, 16.6]), t = pick([0.5, 0.6]), ti = pick([0.3, 0.4]), Hw = pick([6.0, 7.5]); const eave = r2(Hp + Hw);
    const B = [r2(e + m), r2(e + m), r2(L - e - m), r2(e + m + D)]; const I = [r2(B[0] + t), r2(B[1] + t), r2(B[2] - t), r2(B[3] - t)];
    Object.assign(R, { B, I, t, ti, Hw, eave, mat: RO ? 'reboco' : 'adobe-caiado' });
    const oc = { outer: 1, casca: 1 };
    const ws = { fundo: wall([B[0], r2(B[1] + t / 2)], [B[2], r2(B[1] + t / 2)], t, Hw, 'parede', Object.assign({ side: 'fundo' }, oc)),
      esquerda: wall([r2(B[0] + t / 2), B[3]], [r2(B[0] + t / 2), B[1]], t, Hw, 'parede', Object.assign({ side: 'esquerda' }, oc)),
      direita: wall([r2(B[2] - t / 2), B[1]], [r2(B[2] - t / 2), B[3]], t, Hw, 'parede', Object.assign({ side: 'direita' }, oc)),
      frente: wall([B[2], r2(B[3] - t / 2)], [B[0], r2(B[3] - t / 2)], t, Hw, 'parede', Object.assign({ side: 'frente' }, oc)) };
    // (the portal, behind the portico's middle bay: the door that shuts)
    const dw = pick([2.0, 2.6]), dh = pick([3.2, 4.0]); door(ws.frente, [L / 2, r2(B[3] - t / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
    // (the windows: high in the walls — a bath is not looked into from the street —, on the back and the sides, each room its own;
    // none on the front, behind the portico's roof)
    const WIN = { w: pick([1.0, 1.2]), h: pick([1.6, 2.0]), sill: pick([3.4, 4.2]) };
    const winsOn = (side, a0, a1, cnt) => { for (let q = 0; q < cnt; q++) { const c = r2(a0 + (a1 - a0) * (q + 0.5) / cnt);
      win(ws[side], side === 'fundo' ? [c, r2(B[1] + t / 2)] : side === 'esquerda' ? [r2(B[0] + t / 2), c] : [r2(B[2] - t / 2), c], WIN.w, WIN.h, WIN.sill); } };
    // ---- the palaestra before the block: its low wall round it, the gate where the flight comes up (a wall of no height, an
    // opening of the flight's width), the portico along the block's front under its lean-to roof ----
    const ft = 0.3, c2 = ft / 2, fh = 1.0; const Yr = [B[0], B[3], B[2], Vp]; R.yard = Yr.slice(); R.yardH = fh;
    { const o = { outer: 1, casca: 1, yard: 1 }; const fy = r2(Yr[3] - c2), g0 = r2(L / 2 - sw / 2), g1 = r2(L / 2 + sw / 2);
      wall([r2(Yr[0] + c2), Yr[1]], [r2(Yr[0] + c2), Yr[3]], ft, fh, 'cerca', o); wall([r2(Yr[2] - c2), Yr[3]], [r2(Yr[2] - c2), Yr[1]], ft, fh, 'cerca', o);
      wall([g0, fy], [Yr[0], fy], ft, fh, 'cerca', o); wall([Yr[2], fy], [g1, fy], ft, fh, 'cerca', o);
      const bw = wall([g1, r2(Yr[3] - 0.05)], [g0, r2(Yr[3] - 0.05)], 0.1, 0, 'borda', o); R.gateD = door(bw, [L / 2, r2(Yr[3] - 0.05)], sw, 2.2, 'vao', { rua: 1 });
      R.gate = { u: L / 2, v: Yr[3], w: sw }; }
    const Y0 = r2(Yr[0] + ft), Y2 = r2(Yr[2] - ft); const dp = pick([2.6, 2.8]), rc = pick([0.35, 0.4]), Hc = pick([3.8, 5.0]), He = pick([0.5, 0.6]), nc = pick([8, 10]);
    const vP = r2(B[3] + dp); Object.assign(R, { vP, rc, Hc, He, porchRise: pick([0.9, 1.1]) });
    R.annexes.push({ r: [Y0, B[3], Y2, vP], h: Hc, fn: 'portico' });
    R.cols.push({ line: [[Y2, r2(vP - rc)], [Y0, r2(vP - rc)]], at: evenly(r2(Y2 - Y0), rc, nc), rc, h: Hc, y0: Hp, porch: 1 });
    // ---- the rooms, the walls between them and their ways, what stands in each ----
    const part = (a, b) => wall(a, b, ti, Hw, 'parede');
    const yc = r2(eave + 0.35); // (the cornice's top: where the roofs and the attics stand)
    if (!k) {
      // the thermae: three across — the cold and the warm room at the left, the changing room and the hot room in the middle,
      // the service wing at the right —, two deep
      const uA = r2(I[0] + 5.0), uB = r2(I[2] - 5.0), vM = r2(I[1] + 5.6); const cA = r2(uA + ti / 2), cB = r2(uB - ti / 2), cM = r2(vM + ti / 2);
      const quente = room('quente', [r2(uA + ti), I[1], r2(uB - ti), vM]), morno = room('morno', [I[0], I[1], uA, vM]), forn = room('fornalha', [uB, I[1], I[2], vM]);
      const vest = room('vestiario', [r2(uA + ti), r2(vM + ti), r2(uB - ti), I[3]]), frio = room('frio', [I[0], r2(vM + ti), uA, I[3]]), serv = room('servico', [uB, r2(vM + ti), I[2], I[3]]);
      const wA = part([cA, I[1]], [cA, I[3]]), wB = part([cB, I[3]], [cB, I[1]]);
      const wL = part([I[0], cM], [uA, cM]), wR = part([uB, cM], [I[2], cM]); part([r2(uA + ti), cM], [r2(uB - ti), cM]);
      const vf = r2((vM + ti + I[3]) / 2), vb = r2((I[1] + vM) / 2);
      door(wA, [cA, vf], 1.2, 2.6, 'vao'); door(wA, [cA, vb], 1.0, 2.4, 'vao'); door(wL, [r2((I[0] + uA) / 2), cM], 1.0, 2.4, 'vao');
      door(wB, [cB, vf], 0.9, DOOR_H, 'porta'); door(wR, [r2((uB + I[2]) / 2), cM], 0.9, DOOR_H, 'porta');
      winsOn('esquerda', I[1], vM, 2); winsOn('esquerda', r2(vM + ti), I[3], 1); winsOn('direita', I[1], vM, 2); winsOn('direita', r2(vM + ti), I[3], 1);
      winsOn('fundo', I[0], uA, 2); winsOn('fundo', r2(uA + ti), r2(uB - ti), 3); winsOn('fundo', uB, I[2], 2);
      // the water: the cold pool, the warm one, the hot one under the dome
      const mid = q => { const r = R.rooms[q].r; return [r2((r[0] + r[2]) / 2), r2((r[1] + r[3]) / 2)]; };
      { const c = mid(frio); pool(frio, [r2(c[0] - 1.7), r2(c[1] - 1.05), r2(c[0] + 1.3), r2(c[1] + 0.95)], [0, 1], 'fria'); }
      { const c = mid(morno); pool(morno, [r2(c[0] - 1.5), r2(c[1] - 0.6), r2(c[0] + 1.1), r2(c[1] + 1.4)], [0, -1], 'morna'); }
      { const c = mid(quente); pool(quente, [r2(c[0] - 1.8), r2(c[1] - 1.2), r2(c[0] + 1.8), r2(c[1] + 1.2)], [0, 1], 'quente'); R.domo = { c: [c[0], r2((B[1] + cM) / 2)], r: 3.0 }; }
      // the furnace against the hot room's wall, its mouth to the service wing; the wood by it and in the store
      R.fornalha = { room: forn, r: [uB, r2(vb - 0.45), r2(uB + 0.8), r2(vb + 0.45)], f: [1, 0] };
      against(R.extras, 'lenha', forn, 'fundo', r2(uB + 1.6), 1.0, 0.5); against(R.extras, 'lenha', forn, 'fundo', r2(uB + 2.9), 1.0, 0.5);
      against(R.extras, 'lenha', serv, 'direita', r2(vM + ti + 0.5), 1.0, 0.5); against(R.extras, 'lenha', serv, 'direita', r2(vM + ti + 1.8), 1.0, 0.5); bench(serv, 'frente', r2(uB + 0.6));
      // the pegs of the changing room along its back and at its sides, clear of its three doors; the benches by the portal
      { const q = R.rooms[vest].r; for (const du of [0.9, 2.2, 3.8, 5.1]) peg(vest, 'fundo', r2(q[0] + du)); peg(vest, 'esquerda', r2(q[1] + 0.1)); peg(vest, 'direita', r2(q[1] + 0.1));
        bench(vest, 'frente', r2(q[0] + 0.6)); bench(vest, 'frente', r2(q[2] - 1.7)); }
      { const q = R.rooms[morno].r; bench(morno, 'esquerda', r2(q[1] + 0.5)); } { const q = R.rooms[quente].r; bench(quente, 'fundo', r2(q[0] + 0.8)); bench(quente, 'fundo', r2(q[2] - 1.9)); }
      // the roofs: one along each wing, the pediment over the changing room; over the hot room the attic and the dome
      R.roofs.push({ r: [B[0], B[1], cA, B[3]], ao: 'v', h: 1.7 }, { r: [cB, B[1], B[2], B[3]], ao: 'v', h: 1.7 }, { r: [cA, cM, cB, B[3]], ao: 'v', h: 2.0, frontao: 1 });
      R.attic.push({ r: [cA, B[1], cB, cM], h: 2.0 }); // (the attic as high as the pediment roof's ridge: the roof ends against it)
      Object.assign(R.domo, RO ? { drum: 1.2, h: 4.2 } : { drum: 0, h: 3.6 });
      // the palaestra: its floor to the gate's edge; the statues at its front corners
      const por = room('portico', [Y0, B[3], Y2, r2(vP - 2 * rc)], { host: 'portico' }), pal = room('palestra', [Y0, vP, Y2, r2(Yr[3] - 0.1)], { open: 1 });
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * (Y2 - Y0 - 2.6) / 2), v = r2(Yr[3] - ft - 1.3); solid(pal, [u - 0.45, v - 0.45, u + 0.45, v + 0.45], 4.2, 'estatua'); }
      Object.assign(R, { vest: [vest], quente, frio: [frio], morno: [morno], forn, por, pal });
    } else {
      // the great thermae: the great hall and the hot room on the axis, a wing of three rooms at either hand
      const uA = r2(I[0] + 6.0), uB = r2(I[2] - 6.0), vH = r2(I[1] + 6.4); const cA = r2(uA + ti / 2), cB = r2(uB - ti / 2), cH = r2(vH + ti / 2);
      const v1 = r2(I[1] + 4.6), v2 = r2(v1 + ti + 5.0); const c1 = r2(v1 + ti / 2), c2w = r2(v2 + ti / 2);
      const quente = room('quente', [r2(uA + ti), I[1], r2(uB - ti), vH]), hall = room('frio', [r2(uA + ti), r2(vH + ti), r2(uB - ti), I[3]]);
      const wingL = [I[0], uA], wingR = [uB, I[2]]; const rooms3 = ([a, b], fnBack) => [room(fnBack, [a, I[1], b, v1]), room('morno', [a, r2(v1 + ti), b, v2]), room('vestiario', [a, r2(v2 + ti), b, I[3]])];
      const [forn, mornoL, vestL] = rooms3(wingL, 'fornalha'), [suad, mornoR, vestR] = rooms3(wingR, 'suadouro');
      const wA = part([cA, I[1]], [cA, I[3]]), wB = part([cB, I[3]], [cB, I[1]]), wH = part([r2(uA + ti), cH], [r2(uB - ti), cH]);
      const wL1 = part([I[0], c1], [uA, c1]), wL2 = part([I[0], c2w], [uA, c2w]), wR1 = part([uB, c1], [I[2], c1]), wR2 = part([uB, c2w], [I[2], c2w]);
      const vV = r2((v2 + ti + I[3]) / 2), vT = r2((vH + ti + v2) / 2 + 0.2), vQ = r2((v1 + ti + vH) / 2); const uL = r2((I[0] + uA) / 2), uR = r2((uB + I[2]) / 2);
      // (the axis: the portal, the hall, the portal of the hot room; the ring at either hand: hall → changing room → warm room
      // → hot room, and the warm room on the hall too)
      door(wH, [L / 2, cH], 2.0, 3.2, 'vao');
      for (const [w, c] of [[wA, cA], [wB, cB]]) { door(w, [c, vV], 1.2, 2.6, 'vao'); door(w, [c, vT], 1.2, 2.6, 'vao'); door(w, [c, vQ], 1.0, 2.4, 'vao'); }
      door(wL2, [uL, c2w], 1.0, 2.4, 'vao'); door(wR2, [uR, c2w], 1.0, 2.4, 'vao');
      door(wL1, [uL, c1], 0.9, DOOR_H, 'porta'); door(wR1, [uR, c1], 1.0, 2.4, 'vao');
      for (const side of ['esquerda', 'direita']) { winsOn(side, I[1], v1, 2); winsOn(side, r2(v1 + ti), v2, 2); winsOn(side, r2(v2 + ti), I[3], 2); }
      winsOn('fundo', I[0], uA, 2); winsOn('fundo', r2(uA + ti), r2(uB - ti), 5); winsOn('fundo', uB, I[2], 2);
      // the water: the two cold pools of the hall either side of its axis, a warm pool in each warm room, the great hot pool
      // under the dome and one more at either end of the hot room
      const H = R.rooms[hall].r, Q = R.rooms[quente].r;
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * 3.5); pool(hall, [r2(u - 1.7), r2(H[1] + 1.0), r2(u + 1.7), r2(H[1] + 3.2)], [0, 1], 'fria'); }
      for (const q of [mornoL, mornoR]) { const r = R.rooms[q].r; const c = [r2((r[0] + r[2]) / 2), r2((r[1] + r[3]) / 2)]; const s = q === mornoL ? -1 : 1; pool(q, [r2(c[0] - 1.1 + s * 0.6), r2(c[1] - 1.5), r2(c[0] + 1.1 + s * 0.6), r2(c[1] + 1.5)], [-s, 0], 'morna'); }
      { const cv = r2((Q[1] + Q[3]) / 2); pool(quente, [r2(L / 2 - 2.2), r2(cv - 1.5), r2(L / 2 + 2.2), r2(cv + 1.1)], [0, 1], 'quente');
        for (const s of [-1, 1]) { const u = r2(L / 2 + s * 4.5); pool(quente, [r2(u - 1.0), r2(Q[1] + 0.9), r2(u + 1.0), r2(Q[1] + 3.9)], [0, 1], 'quente'); }
        R.domo = Object.assign({ c: [L / 2, r2((B[1] + cH) / 2)], r: 3.4 }, RO ? { drum: 1.4, h: 5.2 } : { drum: 0, h: 4.6 }); }
      // (the four columns of the hall, that carry its vault: the plan's, drawn inside)
      for (const su of [-1, 1]) for (const dv of [1.7, 4.1]) { const u = r2(L / 2 + su * 3.4), v = r2(H[3] - dv); solid(hall, [u - 0.4, v - 0.4, u + 0.4, v + 0.4], Hw, 'coluna', { rc: 0.4, inner: 1 }); }
      // the furnace against the hot room's wall, its wood; the sweating room's benches; the pegs and benches of the changing rooms
      { const cv = r2((I[1] + v1) / 2); R.fornalha = { room: forn, r: [r2(uA - 0.8), r2(cv - 0.45), uA, r2(cv + 0.45)], f: [-1, 0] }; }
      against(R.extras, 'lenha', forn, 'fundo', r2(I[0] + 0.8), 1.0, 0.5); against(R.extras, 'lenha', forn, 'fundo', r2(I[0] + 2.1), 1.0, 0.5); against(R.extras, 'lenha', forn, 'esquerda', r2(I[1] + 1.2), 1.0, 0.5);
      bench(suad, 'fundo', r2(uB + 0.8)); bench(suad, 'fundo', r2(uB + 2.4)); bench(suad, 'fundo', r2(uB + 4.0)); bench(suad, 'direita', r2(I[1] + 1.2));
      for (const [q, out] of [[vestL, 'esquerda'], [vestR, 'direita']]) { const r = R.rooms[q].r; for (const dv of [0.5, 2.0, 3.5]) peg(q, out, r2(r[1] + dv)); for (const du of [0.8, 2.4, 4.0]) peg(q, 'frente', r2(r[0] + du)); bench(q, out === 'esquerda' ? 'direita' : 'esquerda', r2(r[1] + 0.3)); }
      for (const su of [-1, 1]) for (const du of [3.0, 4.6]) bench(hall, 'frente', r2(L / 2 + su * du - 0.55));
      // the roofs: one along each wing; over the hall its clerestory — its three windows a side over the wings' roofs — and the
      // pediment roof along the axis; over the hot room the attic and the dome
      R.roofs.push({ r: [B[0], B[1], cA, B[3]], ao: 'v', h: 2.2 }, { r: [cB, B[1], B[2], B[3]], ao: 'v', h: 2.2 });
      R.clere = { r: [cA, cH, cB, B[3]], h: 3.0, roof: 2.6, wins: 3, win: { w: 2.0, h: 1.4, sill: 1.0 } };
      R.attic.push({ r: [cA, B[1], cB, cH], h: 1.6 });
      // the palaestra: the two open pools either side of the way, the statues at its front corners
      const por = room('portico', [Y0, B[3], Y2, r2(vP - 2 * rc)], { host: 'portico' }), pal = room('palestra', [Y0, vP, Y2, r2(Yr[3] - 0.1)], { open: 1 });
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * 7.2), v0 = r2(vP + 1.0); pool(pal, [r2(u - 3.8), v0, r2(u + 3.8), r2(v0 + 3.0)], [0, 1], 'natacao', { open: 1 }); }
      for (const s of [-1, 1]) { const u = r2(L / 2 + s * (sw / 2 + 0.75)), v = r2(Yr[3] - ft - 0.9); solid(pal, [u - 0.45, v - 0.45, u + 0.45, v + 0.45], 4.6, 'estatua'); }
      Object.assign(R, { vest: [vestL, vestR], quente, frio: [hall], morno: [mornoL, mornoR], forn, suad, por, pal });
    }
    R.levels = [{ lv: 0, y: Hp, h: Hw, kind: 'piso', area: I.slice() }];
    R.yc = yc;
    return R;
  }
  Fo.riscoTermas = riscoTermas; // (for the proofs)

  // ------------------------------ the outside, painted from the risk ------------------------------
  // the podium and its flight, the palaestra's floor and its low wall, the portico — its columns under their beam, the lean-to
  // roof from it up to the block's wall —; the block of the people's walls under its painted band and its cornice, the windows
  // and the portal the risk opens in it; the roofs along the wings (the Roman's hips, the Greek's gables), the pediment over the
  // way in with its gilded round, the great hall's clerestory and its windows; the attic over the hot room and the dome on it —
  // the Roman's on its drum, with its gilded top —; the open pools of the palaestra, their rim of stone and their water; the
  // statues
  function termasEls(R) {
    const { L, Hp, B, t, eave, RO } = R; const els = [];
    const bloco = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(r2), y0: r2(y0), y1: r2(y1), cor }, o || {});
    els.push(bloco(R.podium, 0, Hp, BASE, { mat: 'base', risco: R }));
    for (const q of R.treads) els.push(bloco(q.r, 0, q.y, BASE, { mat: 'base', degrau: 1 }));
    els.push(bloco(R.yard, Hp, r2(Hp + 0.05), ['#e4dccb', '#e4dccb', '#e4dccb'], { mat: 'slab', piso: 1 }));
    // the block: its walls, the band under the cornice, the cornice
    els.push(bloco(B, Hp, eave, WALL, { mat: 'parede' }), { k: 'faixa', r: B.slice(), y0: r2(eave - 0.75), y1: r2(eave - 0.3), cor: 'trim' },
      bloco([B[0] - 0.15, B[1] - 0.15, B[2] + 0.15, B[3] + 0.15], eave, R.yc, COL, { mat: 'slab' }));
    // the windows and the portal on its outer faces (the risk's walls, by their side)
    const face = { fundo: B[1], frente: B[3], esquerda: B[0], direita: B[2] };
    for (const w of R.walls) { if (!w.side) continue; const along = w.side === 'fundo' || w.side === 'frente';
      for (const o of w.ops) { const c = along ? o.p[0] : o.p[1];
        if (o.k === 'janela') els.push({ k: 'janelas', na: w.side, em: face[w.side], de: r2(c - o.w / 2), ate: r2(c + o.w / 2), y0: r2(Hp + o.sill), y1: r2(Hp + o.sill + o.h), n: 0 });
        else els.push({ k: 'porta', na: 'frente', v: face[w.side], u: r2(c), w: o.w, y0: Hp, y1: r2(Hp + o.h), cor: 'door' }); } }
    // the roofs along the wings, the pediment over the way in
    const yc = R.yc; let top = yc;
    for (const q of R.roofs) { els.push({ k: 'telhado', r: q.r.map(r2), y0: yc, y1: r2(yc + q.h), ao: q.ao, ov: 0.25, cor: ROOF, quatro: RO && !q.frontao ? true : undefined }); top = Math.max(top, yc + q.h);
      if (q.frontao) els.push({ k: 'disco', na: 'frente', u: r2(L / 2), v: r2(q.r[3] + 0.3), y: r2(yc + q.h * 0.4), r: 0.4, cor: '#f2c14e' }); }
    // the great hall's clerestory: its walls over the cornice, its windows over the wings' roofs and on its front, its roof
    // along the axis, the gilded round in its pediment
    if (R.clere) { const c = R.clere, r = c.r, y1 = r2(yc + c.h), wn = c.win;
      els.push(bloco(r, yc, y1, WALL, { mat: 'parede' }), { k: 'faixa', r: r.slice(), y0: r2(y1 - 0.45), y1: r2(y1 - 0.15), cor: 'trim' });
      for (let q = 0; q < c.wins; q++) { const v = r2(r[1] + (r[3] - r[1]) * (q + 0.5) / c.wins);
        for (const [na, em] of [['esquerda', r[0]], ['direita', r[2]]]) els.push({ k: 'janelas', na, em, de: r2(v - wn.w / 2), ate: r2(v + wn.w / 2), y0: r2(yc + wn.sill), y1: r2(yc + wn.sill + wn.h), n: 0 }); }
      for (const du of [-3.6, 0, 3.6]) els.push({ k: 'janelas', na: 'frente', em: r[3], de: r2(L / 2 + du - wn.w / 2), ate: r2(L / 2 + du + wn.w / 2), y0: r2(yc + wn.sill), y1: r2(yc + wn.sill + wn.h), n: 0 });
      els.push({ k: 'telhado', r: r.map(r2), y0: y1, y1: r2(y1 + c.roof), ao: 'v', ov: 0.3, cor: ROOF }, { k: 'disco', na: 'frente', u: r2(L / 2), v: r2(r[3] + 0.35), y: r2(y1 + c.roof * 0.4), r: 0.55, cor: '#f2c14e' });
      top = Math.max(top, y1 + c.roof); }
    // the attic over the hot room, and the dome: the Roman's on its round drum, its gilded top
    for (const a of R.attic) els.push(bloco(a.r, yc, r2(yc + a.h), WALL, { mat: 'parede' }), bloco([a.r[0] - 0.1, a.r[1] - 0.1, a.r[2] + 0.1, a.r[3] + 0.1], r2(yc + a.h), r2(yc + a.h + 0.2), COL, { mat: 'slab' }));
    { const d = R.domo, z0 = r2(yc + R.attic[0].h + 0.2), z1 = r2(z0 + d.drum), z2 = r2(z1 + d.h);
      if (d.drum) els.push({ k: 'coluna', c: d.c.slice(), r: d.r, y0: z0, y1: z1, cor: ['wl', 'wr'], mat: 'parede' });
      els.push({ k: 'morro', c: d.c.slice(), r: d.r, y0: z1, y1: z2, cor: RO ? ['#d8c8a8', '#a8987a'] : ['#ece4d4', '#bcb4a4'], liso: 1, mat: 'slab' }, { k: 'bola', c: [d.c[0], d.c[1], r2(z2 + 0.3)], r: 0.35, cor: RO ? '#e0b84a' : '#d8a63a' });
      top = Math.max(top, z2 + 0.65); }
    // the portico: its columns, the beam over them, the lean-to roof from it up to the wall
    for (const c of R.cols) { const [a, b] = c.line; const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const pts = c.at.map(s => [r2(a[0] + (b[0] - a[0]) * s / len), r2(a[1] + (b[1] - a[1]) * s / len)]);
      const u0 = Math.min(a[0], b[0]), u1 = Math.max(a[0], b[0]), v = a[1], yb = r2(Hp + c.h), ye = r2(yb + R.He);
      els.push({ k: 'colunata', pts, r: c.rc, y0: Hp, y1: yb, cor: ['col0', 'col1'] }, bloco([u0, r2(v - c.rc - 0.05), u1, r2(v + c.rc + 0.05)], yb, ye, COL, { mat: 'slab' }),
        { k: 'pano', p: [[u0, r2(v + c.rc + 0.25), ye], [u1, r2(v + c.rc + 0.25), ye], [u1, B[3], r2(ye + R.porchRise)], [u0, B[3], r2(ye + R.porchRise)]], cor: 'roof0', mat: RO ? 'tegula' : 'tile', grosso: 0.12 }); }
    // the palaestra's low wall, but the gate's opening
    for (const w of R.walls) { if (!w.yard || w.kind === 'borda') continue; const along = Math.abs(w.a[1] - w.b[1]) < 1e-6;
      const r = along ? [Math.min(w.a[0], w.b[0]), r2(w.a[1] - w.t / 2), Math.max(w.a[0], w.b[0]), r2(w.a[1] + w.t / 2)] : [r2(w.a[0] - w.t / 2), Math.min(w.a[1], w.b[1]), r2(w.a[0] + w.t / 2), Math.max(w.a[1], w.b[1])];
      els.push(bloco(r, Hp, r2(Hp + w.h), PAR, { mat: 'slab' })); }
    // the open pools: the rim of stone round the water
    for (const q of R.pools) { if (!q.open) continue; const r = q.r, rt = 0.2, y1 = r2(Hp + 0.5);
      for (const rr of [[r[0], r[1], r[2], r[1] + rt], [r[0], r[3] - rt, r[2], r[3]], [r[0], r[1] + rt, r[0] + rt, r[3] - rt], [r[2] - rt, r[1] + rt, r[2], r[3] - rt]]) els.push(bloco(rr, Hp, y1, POOL, { mat: 'slab' }));
      els.push({ k: 'lamina', r: [r[0] + rt, r[1] + rt, r[2] - rt, r[3] - rt].map(r2), y: r2(y1 - 0.14), cor: '#4a9ac0' }); }
    // the statues of the palaestra (the hall's columns are the plan's alone)
    for (const p of R.pieces) { if (p.inner) continue; const c = [r2((p.r[0] + p.r[2]) / 2), r2((p.r[1] + p.r[3]) / 2)];
      if (p.k === 'estatua') els.push(bloco(p.r, Hp, r2(Hp + 1.0), BASE, { mat: 'base' }), { k: 'estatua', p: [c[0], c[1], r2(Hp + 1.0)], h: r2(p.h - 1.0), w: 0.5, cor: '#e8e0d0' }); }
    void t; void top;
    return els;
  }
  const termasForm = st => (L, n) => { const R = riscoTermas(st, n); return { els: termasEls(R), door: R.doorD }; };
  // (the peoples of the thermae: the classical people's as the Greek's, as the god draws its baths — js/forma.js)
  for (const st of ['grego', 'romano', 'classico']) Fo.def('banhos', st, termasForm(st), [5, 7]);
})(window.G = window.G || {});
