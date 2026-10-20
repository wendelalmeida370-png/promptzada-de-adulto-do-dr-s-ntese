'use strict';
// ============================================================
//  The palace (palácio, grande palácio, palácio colossal: lots of
//  12 to 20 m): the court in the middle and its wings round it —
//  four round a court of columns, or three round the court of
//  honour open to the street behind its gate —; across the back
//  the throne hall, at its ends the chambers; the kitchen, the
//  store, the banquet and the guard in the wings; a storey of
//  chambers over the wings, or the roof made a terrace. And the
//  fair (feira): no walls and no roof — an open shell, the lot's
//  ground —, its stalls in rows along the lanes, or round a square.
//  Laid out with the engine's kit and proved the same way.
// ============================================================
(function (G) {
  const In = G.Interiors; const K = In.HOME;
  const r2 = x => Math.round(x * 100) / 100;
  const has = x => x !== undefined && x !== null;
  In.addItems({
    fonte: { name: 'Fonte', w: 1.2, d: 1.2, h: 0.6, solid: 1, free: 1, spots: it => [{ use: 'beber', a: 0, n: it.d / 2 + 0.4 }, { use: 'beber', a: 0, n: -(it.d / 2 + 0.4) }] },
  });

  // ------------------------------ the palace ------------------------------
  const HP = { peristilo: 'Quatro alas em volta do pátio de colunas', honra: 'Três alas e o pátio de honra' };
  const VP = { terreo: '', andar: 'com andar de aposentos', terraco: 'com terraço' };
  const PT = ['palacio', 'grande_palacio', 'palacio_colossal'];
  const pfams = [];
  for (const h in HP) for (const v in VP) {
    const id = 'pal-' + h + '.' + v; pfams.push(id);
    In.addFamilies([{ id, H: 'pal-' + h, V: v, name: HP[h] + (VP[v] ? ' ' + VP[v] : ''), can: (rec, T, tr) => (v === 'terraco' ? K.flatOK(rec, tr) : null), build: P => palace(P) }]);
  }
  const ptypes = {}; for (const t of PT) ptypes[t] = { use: 'palacio', fams: pfams, lockNight: 1, need: { trono: 1 } };
  In.addTypes(ptypes);

  // (the shell — from the record and the family alone — is the outside: the court, the wings' outer walls storey by storey,
  // the way in, the terrace's parapets, the windows; the inside lays out the rooms along the wings, the court's walls, the
  // doors, the stair, the things)
  function palace(P) {
    const F = P.fam, rec = P.rec, tr = P.tr, L = P.L; const H = F.H.slice(4), V = F.V;
    const t = Math.max(tr.t, 0.28), ti = Math.min(0.22, Math.max(0.14, t * 0.6));
    const h0 = tr.h0 + P.rr(0.8, 1.2), h1 = (tr.h1 || 2.4) + 0.3; const N = V === 'andar' ? 2 : 1;
    // ======== the shell ========
    const m = P.rr(0.15, 0.3); const sh = [m, m, L - m, L - m];
    P.shell = { kind: 'rect', r: sh, t, mat: tr.mat, base: 'pedra', floors: N, eave: h0 + (N - 1) * (0.2 + h1) };
    const I = P.inner();
    // (the wings: the side and front ones a room and its way deep; the back one deeper — the throne hall is there)
    const dW = Math.max(3.0, Math.min(5.0, L * 0.24)), dB = Math.max(3.6, Math.min(6.0, L * 0.3));
    const peri = H === 'peristilo';
    const C = [I[0] + dW + ti, I[1] + dB + ti, I[2] - dW - ti, peri ? I[3] - dW - ti : I[3]];
    if (C[2] - C[0] < 2.4 || C[3] - C[1] < 2.4) { P.errs.push('o pátio não cabe'); return; }
    P.shell.court = C.slice();
    const W = { back: [I[0], I[1], I[2], C[1] - ti], left: [I[0], C[1], C[0] - ti, peri ? C[3] : I[3]], right: [C[2] + ti, C[1], I[2], peri ? C[3] : I[3]] };
    if (peri) W.front = [I[0], C[3] + ti, I[2], I[3]];
    const kind = K.roofOf({ t: 'house' }, tr); const rise = kind === 'plano' ? 0 : Math.min(3.2, dW * 0.8 * 0.82);
    P.roof = { kind, along: null, h: r2(rise), over: kind === 'plano' ? 0 : 0.5, court: C.slice() };
    P.entryLv = 0; P.outers = [];
    // ---- the storeys' floors, and the outside walls round the wings (on the ground round the court too, where it meets the
    // edge of the lot: the wall with the gate in it) ----
    const c = t / 2;
    const span = (side, r) => (side === 'fundo' || side === 'frente' ? [r[0], r[2]] : [r[1], r[3]]);
    const onEdge = (side, r) => (side === 'fundo' ? r[1] <= I[1] + 1e-6 : side === 'frente' ? r[3] >= I[3] - 1e-6 : side === 'esquerda' ? r[0] <= I[0] + 1e-6 : r[2] >= I[2] - 1e-6);
    let y = 0;
    for (let k = 0; k < N; k++) {
      const h = k ? h1 : h0; P.level(k, y, h, k ? 'andar' : 'piso', I); const O = {};
      for (const side of ['fundo', 'frente', 'esquerda', 'direita']) {
        const across = side === 'fundo' || side === 'frente'; const segs = [];
        for (const w in W) if (onEdge(side, W[w])) segs.push(span(side, W[w]));
        if (k === 0 && onEdge(side, C)) segs.push(span(side, C));
        if (!segs.length) continue;
        segs.sort((a, b) => a[0] - b[0]); const runs = [];
        for (const sg of segs) { const last = runs[runs.length - 1]; if (last && sg[0] <= last[1] + ti + 0.05) last[1] = Math.max(last[1], sg[1]); else runs.push(sg.slice()); }
        const i0 = across ? I[0] : I[1], i1 = across ? I[2] : I[3], s0 = across ? sh[0] : sh[1], s1 = across ? sh[2] : sh[3];
        const z = side === 'fundo' ? sh[1] + c : side === 'frente' ? sh[3] - c : side === 'esquerda' ? sh[0] + c : sh[2] - c;
        O[side] = runs.map(([lo0, hi0]) => {
          const lo = lo0 <= i0 + 1e-6 ? s0 : lo0 - ti, hi = hi0 >= i1 - 1e-6 ? s1 : hi0 + ti; const fw = side === 'fundo' || side === 'direita';
          const a = across ? [fw ? lo : hi, z] : [z, fw ? lo : hi], b = across ? [fw ? hi : lo, z] : [z, fw ? hi : lo];
          return P.wall(k, a, b, t, h, 1, 'parede');
        });
      }
      P.outers.push(O); y += h + 0.2;
    }
    const wallAt = (side, p) => (P.outers[0][side] || []).find(id => { const w = P.walls[id]; const q = side === 'fundo' || side === 'frente' ? 0 : 1; return p >= Math.min(w.a[q], w.b[q]) && p <= Math.max(w.a[q], w.b[q]); });
    // ---- the way in: through the front wing, a vestibule from the street to the court; with no front wing, the gate in the
    // court's wall ----
    let pass = null; const gw = Math.min(peri ? 2.0 : 2.4, C[2] - C[0] - 0.8);
    { const gu = (C[0] + C[2]) / 2 + P.rr(-0.2, 0.2); const fw = wallAt('frente', gu); const w0 = peri ? P.rr(1.5, Math.min(1.9, gw)) : gw;
      const d = P.door(fw, P.atOf(fw, [gu, sh[3] - c]), w0, Math.min(3.0, h0 - 0.3), -1, 'rua', 1, 'portao'); P.entrance = { door: d, u: gu, v: sh[3], w: w0, lv: 0 };
      if (peri) pass = { u0: gu - Math.max(w0, 1.8) / 2 - 0.35, w: Math.max(w0, 1.8) + 0.7 }; }
    // ---- the roof terrace of the flat roofs: a parapet round the palace and round the court ----
    const lvT = N - 1, lvR = N;
    if (V === 'terraco') {
      P.level(lvR, P.shell.eave + 0.25, 2.2, 'terraco', I);
      P.walls4(lvR, [sh[0] + 0.07, sh[1] + 0.07, sh[2] - 0.07, sh[3] - 0.07], 0.14, 0.9, 1, 'parapeito');
      P.walls4(lvR, [C[0] - 0.07, C[1] - 0.07, C[2] + 0.07, C[3] + 0.07], 0.14, 0.9, 0, 'parapeito', { frente: C[3] >= I[3] - 1e-6 ? 1 : 0 });
    }
    K.blockWindows(P);
    if (P.inside()) return;
    // ======== the inside ========
    const rooms = { ground: [], up: [], roles: {} };
    const keep = [colOf(W.back)];
    // (a wing cut along its length into rooms of 3 to 4.5 m: the cuts; in the back one, the throne hall in the middle)
    // (how many: by the wing's length on a lot of this size as the family lays it out — never by this building's own measures,
    // that the dice move: one family, one structure)
    const span0 = L - 1.05; const nomOf = { v: span0 - dB - (peri ? dW : 0) - 0.36, u: span0 };
    const cuts = (lo, hi, nmin, axis) => { const len = hi - lo; let n = Math.max(nmin || 1, Math.round(nomOf[axis] / 3.8)); while (n > 1 && (len - (n - 1) * ti) / n < 2.6) n--; const out = []; let a = lo; const each = (len - (n - 1) * ti) / n; for (let q = 0; q < n; q++) { const b = q === n - 1 ? hi : a + each * P.rr(0.92, 1.08); out.push([a, b]); a = b + ti; } return out; };
    // (the back wing's partitions, the same on every storey: the throne hall's walls carry the ones above them; the room at
    // its left end as wide as the flight in it and the landing at its top want — on the smallest lot the hall gives way)
    const B = W.back; const tw = Math.max(4.0, Math.min(8.0, (B[2] - B[0]) * 0.46));
    const tu0 = Math.max((B[0] + B[2]) / 2 - tw / 2 + P.rr(-0.3, 0.3), B[0] + FLIGHT.end + ti);
    for (let k = 0; k < N; k++) {
      const h = k ? h1 : h0; const dh = Math.min(2.2, h - 0.25);
      const doorAt = (wall, lo, hi, ra, rb, kind2, dw) => {
        dw = dw || 0.9; const w = P.walls[wall]; const hz = Math.abs(w.a[1] - w.b[1]) < 1e-6;
        // (a door between two rooms goes where both are: at a corner the wing beyond is cut into rooms of its own, and a door
        // on the end of their partition opens on nothing)
        for (const id of [ra, rb]) if (id >= 0 && P.rooms[id]) { const r = P.rooms[id].r; lo = Math.max(lo, hz ? r[0] : r[1]); hi = Math.min(hi, hz ? r[2] : r[3]); }
        if (hi - lo < dw + 0.3) return false;
        const ps = []; for (let p = lo + dw / 2 + 0.15; p <= hi - dw / 2 - 0.15 + 1e-6; p += 0.1) ps.push(p);
        for (const p of P.shuffle(ps)) {
          const z = hz ? [p - dw / 2 - 0.12, w.a[1] - 0.85 - w.t / 2, p + dw / 2 + 0.12, w.a[1] + 0.85 + w.t / 2] : [w.a[0] - 0.85 - w.t / 2, p - dw / 2 - 0.12, w.a[0] + 0.85 + w.t / 2, p + dw / 2 + 0.12];
          if (keep.some(q => P.ovr(z, q))) continue;
          P.door(wall, P.atOf(wall, hz ? [p, w.a[1]] : [w.a[0], p]), dw, dh, ra, rb, 0, kind2 || 'porta'); return true;
        }
        return false;
      };
      const need = ok => { if (!ok) P.errs.push(k ? 'não cabe a porta entre os aposentos' : 'não cabe a porta para o pátio'); };
      // the court's walls on this storey (on the ground they part the wings from the court; above, from the court's air)
      const cw = (a, b) => P.wall(k, a, b, ti, h, 0, 'parede');
      const backW = cw([I[0], C[1] - ti / 2], [I[2], C[1] - ti / 2]);
      const leftW = cw([C[0] - ti / 2, C[1]], [C[0] - ti / 2, W.left[3]]), rightW = cw([C[2] + ti / 2, W.right[3]], [C[2] + ti / 2, C[1]]);
      const frontW = peri ? cw([I[2], C[3] + ti / 2], [I[0], C[3] + ti / 2]) : null;
      if (k === 0) rooms.court = P.room(0, 'patio', C, 1);
      // ---- the wings' rooms ----
      // (a wing's rooms one after another along it; on the ground each opens on the court, above each into the next)
      const wing = (R, axis, nmin, fnOf, court, cwall) => {
        const lo = axis === 'u' ? R[0] : R[1], hi = axis === 'u' ? R[2] : R[3]; const segs = cuts(lo, hi, nmin, axis); const ids = [];
        segs.forEach(([a, b], q) => {
          const r = axis === 'u' ? [a, R[1], b, R[3]] : [R[0], a, R[2], b]; const id = P.room(k, fnOf(q, segs.length), r); ids.push(id);
          if (q < segs.length - 1) { const at = b + ti / 2; const pw = axis === 'u' ? P.wall(k, [at, R[1]], [at, R[3]], ti, h, 0, 'divisoria') : P.wall(k, [R[0], at], [R[2], at], ti, h, 0, 'divisoria'); if (!court) need(doorAt(pw, axis === 'u' ? R[1] : R[0], axis === 'u' ? R[3] : R[2], id, -1)); }
          if (court) { const cl = Math.max(a, axis === 'u' ? C[0] : C[1]), ch = Math.min(b, axis === 'u' ? C[2] : C[3]); need(doorAt(cwall, cl, ch, id, rooms.court)); }
        });
        return ids;
      };
      // (the back wing: the throne hall in the middle, a room at either end — the stair in the left one)
      const backIds = [];
      { const parts = [[B[0], tu0 - ti], [tu0, tu0 + tw], [tu0 + tw + ti, B[2]]];
        parts.forEach(([a, b], q) => {
          const id = P.room(k, k === 0 ? (q === 1 ? 'trono' : 'aposento') : 'aposento', [a, B[1], b, B[3]]); backIds.push(id);
          if (q < 2) { const at = b + ti / 2; const pw = P.wall(k, [at, B[1]], [at, B[3]], ti, h, 0, 'divisoria'); need(doorAt(pw, B[1], B[3], id, -1)); }
        });
        if (k === 0) { const thr = backIds[1]; const cl = Math.max(tu0, C[0]), ch = Math.min(tu0 + tw, C[2]); if (ch - cl < 2.0) { P.errs.push('o salão do trono não dá para o pátio'); return; } need(doorAt(backW, cl, ch, thr, rooms.court, 'vao', 1.8)); rooms.roles.trono = thr; } }
      const leftIds = wing(W.left, 'v', 1, (q, n) => (k ? 'aposento' : q === 0 ? 'cozinha' : q === n - 1 && n > 2 ? 'despensa' : 'banquete'), k === 0, leftW);
      const rightIds = wing(W.right, 'v', 1, () => 'aposento', k === 0, rightW);
      let frontIds = [];
      if (peri) {
        const Fr = W.front;
        if (k === 0) {
          // (the vestibule from the street door to the court, a guard room at either side)
          const pu0 = Math.max(Fr[0] + 1.2, pass.u0), pu1 = Math.min(Fr[2] - 1.2, pass.u0 + pass.w);
          const gl = P.room(0, 'guarda', [Fr[0], Fr[1], pu0 - ti, Fr[3]]), vs = P.room(0, 'vestibulo', [pu0, Fr[1], pu1, Fr[3]]), gr = P.room(0, 'guarda', [pu1 + ti, Fr[1], Fr[2], Fr[3]]);
          const pL = P.wall(0, [pu0 - ti / 2, Fr[1]], [pu0 - ti / 2, Fr[3]], ti, h, 0, 'divisoria'), pR = P.wall(0, [pu1 + ti / 2, Fr[3]], [pu1 + ti / 2, Fr[1]], ti, h, 0, 'divisoria');
          need(doorAt(pL, Fr[1], Fr[3], gl, vs)); need(doorAt(pR, Fr[1], Fr[3], gr, vs));
          need(doorAt(frontW, Math.max(pu0, C[0]), Math.min(pu1, C[2]), vs, rooms.court, 'vao', Math.min(1.8, pu1 - pu0 - 0.4)));
          frontIds = [gl, gr]; rooms.vest = vs; rooms.roles.guarda = gl;
        } else frontIds = wing(W.front, 'u', 2, () => 'aposento', false, null);
      }
      if (k === 0) {
        rooms.ground = backIds.concat(leftIds, rightIds, frontIds);
        rooms.roles.cozinha = leftIds[0]; rooms.roles.banquete = leftIds.length > 1 ? leftIds[1] : null; rooms.roles.despensa = leftIds.length > 2 ? leftIds[leftIds.length - 1] : null;
      } else {
        rooms.up.push(...backIds, ...leftIds, ...rightIds, ...frontIds);
        // (above, the wings meet at the corners: a door through each corner from the back wing's end rooms)
        need(doorAt(backW, I[0], C[0] - ti, backIds[0], leftIds[0]));
        need(doorAt(backW, C[2] + ti, I[2], backIds[2], rightIds[0]));
        if (peri) { need(doorAt(frontW, I[0], C[0] - ti, leftIds[leftIds.length - 1], frontIds[0])); need(doorAt(frontW, C[2] + ti, I[2], rightIds[rightIds.length - 1], frontIds[frontIds.length - 1])); }
      }
    }
    // the terrace over each wing (the wings' tops meet at the corners: one walk round the court)
    if (V === 'terraco') {
      const e = 0.14; const tops = [[I[0], I[1], I[2], C[1] - e], [I[0], C[1] - e, C[0] - e, peri ? C[3] + e : I[3]], [C[2] + e, C[1] - e, I[2], peri ? C[3] + e : I[3]]];
      if (peri) tops.push([I[0], C[3] + e, I[2], I[3]]);
      rooms.terr = tops.map(r => P.room(lvR, 'terraco', r, 1));
    }
    // the way up: a flight along the back wall of the back wing's left room, on up to the terrace
    for (let k = 1; k < N; k++) flight(P, k - 1, k, W.back);
    if (V === 'terraco') flight(P, lvT, lvR, W.back);
    palaceFurnish(P, rooms);
  }
  // the flight up, along the back wall from the left end of the back wing: where it starts, how long and wide it runs, and
  // where the room it climbs from and the one it lands in must reach to (its top, a step past it, inside the room)
  const FLIGHT = { at: 0.7, run: 1.6, w: 0.75, end: 0.7 + 1.6 + 0.35 + 0.2 };
  // the corner of the back wing the stair takes (both lanes, their feet and tops)
  function colOf(R) { const u0 = R[0] + FLIGHT.at; return [u0 - 0.6, R[1], u0 + FLIGHT.run + 0.6, R[1] + 1.55]; }
  function flight(P, lv0, lv1, R) {
    const lane = (lv1 - 1) % 2; const run = FLIGHT.run, w = FLIGHT.w; const v0 = R[1] + 0.03 + lane * (w + 0.1); const u0 = R[0] + FLIGHT.at;
    const r = [u0, v0, u0 + run, v0 + w]; const du = lane === 0 ? 1 : -1;
    if (!K.ladderAt(P, lv0, lv1, [{ r, du, dv: 0, hole: r }], null, 'escada')) P.errs.push(`não cabe a escada do ${lv1}º pavimento`);
  }
  // the furniture: the seat of the ruler against the back wall of the throne hall, in the middle, the benches of the court
  // along its sides, lamps; in the kitchen the fire, the table, the jars; the store's jars and barrels; the banquet's tables;
  // the guard's racks and bench; in every chamber a bed and a chest; the fountain in the court
  function palaceFurnish(P, rooms) {
    const tr = P.tr; const R = rooms.roles; const lvOf = id => P.rooms[id].lv; const rich = 'cama-casal';
    const throne = () => { const id = R.trono; if (!P.place('trono', 0, id, { sides: ['fundo'], center: true })) { P.errs.push('sem lugar para o trono'); return; } let n = 0; for (const s of ['esquerda', 'direita']) for (let g = 0; g < 2; g++) if (P.place('banco', 0, id, { sides: [s] })) n++; if (n < 2) P.errs.push(`só ${n} bancos no salão do trono`); P.opt(() => { for (let g = 0; g < 2; g++) P.place('lampadario', 0, id, { sides: ['livre'], margin: 0.6 }); }); };
    const kitchen = () => { const id = R.cozinha; const f = tr.fire === 'lar' ? 'fogao' : tr.fire; if (!P.place(f, 0, id) && !P.place('fogao', 0, id) && !P.place('braseiro', 0, id)) P.errs.push('sem lugar para o fogo da cozinha'); P.opt(() => P.place('mesa', 0, id, { sides: ['livre'] })); if (!P.place('jarros', 0, id) && !(has(R.despensa) && P.place('jarros', 0, R.despensa))) P.errs.push('sem lugar para os mantimentos'); };
    const store = () => { if (!has(R.despensa)) return; P.opt(() => { P.place('pipas', 0, R.despensa); P.place('jarros', 0, R.despensa); }); };
    const banquet = () => { if (!has(R.banquete)) return; P.opt(() => { for (let g = 0; g < 2; g++) if (P.place('mesa', 0, R.banquete, { sides: ['livre'], margin: 0.5 })) P.place('banco', 0, R.banquete); }); };
    const guard = () => { if (!has(R.guarda)) return; P.opt(() => { P.place('armeiro', 0, R.guarda); P.place('banco', 0, R.guarda); }); };
    const chambers = () => {
      let n = 0; for (const id of rooms.up.concat(rooms.ground).filter(q => P.rooms[q].fn === 'aposento')) { if (P.place(rich, lvOf(id), id) || P.place('cama', lvOf(id), id)) { n++; P.opt(() => P.place('arca', lvOf(id), id)); } }
      if (!n) P.errs.push('sem aposento para o senhor');
    };
    for (const f of [[throne, kitchen, chambers, store, banquet, guard], [chambers, throne, kitchen, banquet, store, guard], [kitchen, throne, chambers, guard, banquet, store]][P.attempt % 3]) f();
    P.opt(() => P.place('fonte', 0, rooms.court, { sides: ['centro'], margin: 0.6 }));
  }

  // ------------------------------ the fair ------------------------------
  // no walls and no roof: the lot's own ground, open on every side (its shell 'aberta'); the stalls in rows along the lanes
  // — or round the square in the middle —, each with its seller behind it and its buyers before it; the stalls of a fair are
  // its work stations (BDEF.jobs)
  const HF = { ruas: 'Bancas em fileiras', praca: 'Bancas em volta da praça' };
  const VF = { chao: '', toldos: 'sob toldos' };
  const ffams = [];
  for (const h in HF) for (const v in VF) { const id = 'feira-' + h + '.' + v; ffams.push(id); In.addFamilies([{ id, H: 'feira-' + h, V: v, name: HF[h] + (VF[v] ? ' ' + VF[v] : ''), can: () => null, build: P => fair(P) }]); }
  In.addTypes({ feira: { use: 'feira', fams: ffams, open: 1 } });
  function fair(P) {
    const F = P.fam, L = P.L; const H = F.H.slice(6), V = F.V;
    // ======== the shell: the ground of the lot, open; under awnings, their cloth over the lanes ========
    const m = P.rr(0.1, 0.2); const sh = [m, m, L - m, L - m];
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: 'chao', floors: 1, eave: V === 'toldos' ? P.rr(2.4, 2.7) : 0 };
    P.roof = V === 'toldos' ? { kind: 'toldo', along: P.chance(0.5) ? 'u' : 'v', h: 0.35, over: 0 } : null;
    P.level(0, 0, 3.0, V === 'toldos' ? 'toldo' : 'chao', sh); P.entryLv = 0;
    const e = { door: -1, u: L / 2 + P.rr(-1, 1), v: sh[3], w: P.rr(2.4, 3.2), lv: 0 }; P.entrance = e;
    if (P.inside()) return;
    // ======== the inside ========
    const id = P.room(0, H === 'ruas' ? 'ruas' : 'praca', sh, 1); const D = In.ITEMS.banca; let n = 0;
    const lane = P.rr(1.9, 2.3), back = 0.95; // (the lane the buyers walk; behind a stall, the seller's room)
    const stall = (r, fu, fv) => { if (P.at('banca', 0, id, r, fu, fv)) n++; };
    if (H === 'ruas') {
      // (rows across the lot, back to back, a lane between each pair of rows; the stalls facing the lanes)
      let v = sh[1] + lane;
      while (v + 2 * D.d + back <= sh[3] - lane + 1e-6) {
        for (let u = sh[0] + 0.6; u + D.w <= sh[2] - 0.6 + 1e-6; u += D.w + P.rr(0.6, 0.9)) { stall([u, v, u + D.w, v + D.d], 0, -1); stall([u, v + D.d + back, u + D.w, v + 2 * D.d + back], 0, 1); }
        v += 2 * D.d + back + lane;
      }
    } else {
      // (round a square in the middle: the stalls along its four sides, facing in, the sellers' room behind them)
      const sq = [sh[0] + lane + D.d + back, sh[1] + lane + D.d + back, sh[2] - lane - D.d - back, sh[3] - lane - D.d - back];
      for (let u = sq[0]; u + D.w <= sq[2] + 1e-6; u += D.w + 0.7) { stall([u, sq[1] - D.d, u + D.w, sq[1]], 0, 1); stall([u, sq[3], u + D.w, sq[3] + D.d], 0, -1); }
      for (let v = sq[1] + 0.8; v + D.w <= sq[3] - 0.8 + 1e-6; v += D.w + 0.7) { stall([sq[0] - D.d, v, sq[0], v + D.w], 1, 0); stall([sq[2], v, sq[2] + D.d, v + D.w], -1, 0); }
      P.opt(() => P.place('fonte', 0, id, { sides: ['centro'], margin: 0.5 }));
    }
    const jobs = (G.BDEF[P.rec.t] || {}).jobs || 0; if (n < jobs) P.errs.push(`só ${n} bancas`);
  }
})(window.G);
