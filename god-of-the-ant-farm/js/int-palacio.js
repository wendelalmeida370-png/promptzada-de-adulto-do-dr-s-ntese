'use strict';
// ============================================================
//  The palace (palácio, grande palácio, palácio colossal: lots of
//  12 to 20 m): the court in the middle and its wings round it —
//  four round a court of columns, or three round the court of
//  honour open to the street behind its gate, or two in an L with
//  the court walled on its two open sides —; across the back
//  the throne hall, at its ends the chambers; the kitchen, the
//  store, the banquet and the guard in the wings; a storey of
//  chambers over the wings, or the roof made a terrace. And the
//  fair (feira): no walls and no roof — an open shell, the lot's
//  ground —, its stalls in rows along the lanes, round a square,
//  or along the edges of the lot round the open middle.
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
  const HP = { peristilo: 'Quatro alas em volta do pátio de colunas', honra: 'Três alas e o pátio de honra', ala: 'Duas alas em L e o pátio murado' };
  const VP = { terreo: '', andar: 'com andar de aposentos', terraco: 'com terraço' };
  const PT = ['palacio', 'grande_palacio', 'palacio_colossal'];
  const pfams = [];
  // (the recipe's palaces are the classic steps' — the lot of the type's table —; a bigger step is its form's: forma.palacio, below)
  const classicLot = rec => In.nOf(rec) === ((G.BDEF[rec.t] || {}).w || 1);
  for (const h in HP) for (const v in VP) {
    const id = 'pal-' + h + '.' + v; pfams.push(id);
    In.addFamilies([{ id, H: 'pal-' + h, V: v, name: HP[h] + (VP[v] ? ' ' + VP[v] : ''), can: (rec, T, tr) => (!classicLot(rec) ? 'o palácio de um degrau maior é o da forma' : v === 'terraco' ? K.flatOK(rec, tr) : null), build: P => palace(P) }]);
  }
  // (the great palace's eight tiles and the colossal's ten laid out by the form's family too — the palace's is In.formType's,
  // int-monumentos.js —, offered only where its form of that size is the people's: In.formSized below; at the end of its list,
  // the catalogue offering it by the record's own size — L-510 —, where the recipe's families leave the bigger step to it)
  const ptypes = {}; for (const t of PT) ptypes[t] = { use: 'palacio', fams: t !== 'palacio' ? pfams.concat(['forma.palacio']) : pfams, lockNight: 1, need: { trono: 1 } };
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
    // (the court: in the middle of four wings; open to the front between three; with two in an L, open to the front and to
    // the right, walled where it meets the lot's edge on the ground)
    const peri = H === 'peristilo', ell = H === 'ala';
    const C = [I[0] + dW + ti, I[1] + dB + ti, ell ? I[2] : I[2] - dW - ti, peri ? I[3] - dW - ti : I[3]];
    if (C[2] - C[0] < 2.4 || C[3] - C[1] < 2.4) { P.errs.push('o pátio não cabe'); return; }
    P.shell.court = C.slice();
    const W = { back: [I[0], I[1], I[2], C[1] - ti], left: [I[0], C[1], C[0] - ti, peri ? C[3] : I[3]] };
    if (!ell) W.right = [C[2] + ti, C[1], I[2], peri ? C[3] : I[3]];
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
      P.walls4(lvR, [C[0] - 0.07, C[1] - 0.07, C[2] + 0.07, C[3] + 0.07], 0.14, 0.9, 0, 'parapeito', { frente: C[3] >= I[3] - 1e-6 ? 1 : 0, direita: C[2] >= I[2] - 1e-6 ? 1 : 0 });
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
      const leftW = cw([C[0] - ti / 2, C[1]], [C[0] - ti / 2, W.left[3]]), rightW = W.right ? cw([C[2] + ti / 2, W.right[3]], [C[2] + ti / 2, C[1]]) : null;
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
      const rightIds = W.right ? wing(W.right, 'v', 1, () => 'aposento', k === 0, rightW) : [];
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
        if (W.right) need(doorAt(backW, C[2] + ti, I[2], backIds[2], rightIds[0]));
        if (peri) { need(doorAt(frontW, I[0], C[0] - ti, leftIds[leftIds.length - 1], frontIds[0])); need(doorAt(frontW, C[2] + ti, I[2], rightIds[rightIds.length - 1], frontIds[frontIds.length - 1])); }
      }
    }
    // the terrace over each wing (the wings' tops meet at the corners: one walk round the court)
    if (V === 'terraco') {
      const e = 0.14; const tops = [[I[0], I[1], I[2], C[1] - e], [I[0], C[1] - e, C[0] - e, peri ? C[3] + e : I[3]]];
      if (W.right) tops.push([C[2] + e, C[1] - e, I[2], peri ? C[3] + e : I[3]]);
      if (peri) tops.push([I[0], C[3] + e, I[2], I[3]]);
      rooms.terr = tops.map(r => P.room(lvR, 'terraco', r, 1));
    }
    // the way up: a flight along the back wall of the back wing's left room, on up to the terrace
    for (let k = 1; k < N; k++) flight(P, k - 1, k, W.back);
    if (V === 'terraco') flight(P, lvT, lvR, W.back);
    palaceFurnish(P, rooms);
  }
  // the flight up, along the back wall from the left end of the back wing: where it starts, how long and wide it runs, and
  // where the room it climbs from and the one it lands in must reach to (its top, a step past it, inside the room) — its foot
  // 0.85 m from the wing's end wall, room for a body before it, off the flight (L-391: at 0.7 m the body had no place there)
  const FLIGHT = { at: 0.85, run: 1.6, w: 0.75 }; FLIGHT.end = FLIGHT.at + FLIGHT.run + 0.35 + 0.2;
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

  // ------------------------------ the palace by its form: the bigger steps (D-106) ------------------------------
  // The palace of six tiles, the great palace of eight and the colossal of ten — the palace of courts of js/forma-poder.js —, of
  // the six peoples, laid out from the risk its form keeps (the podium's element: e.palacio), the numbers the god paints. Its
  // shell: the block of wings round the court
  // (P.shell.court), on the podium — a solid base, the floor its top —, the people's roof round the court; its outer walls storey
  // by storey (the wing of state's as high as the eaves) and their windows; the front of the open court (the screen of columns,
  // the pylon's wall, the palisade) or the court of honour (P.yard: its balustrade or its wall, its gate) and the porch (an annex,
  // its columns where the form stands them); the flight up from the street on the form's treads; the street's gate, the way in.
  // Its inside: the court's walls and the partitions with their doors and windows, the rooms where the risk has them, the stairs
  // up to the chambers, the court's fountain and what stands on the courts' floors (the form's pieces: the plan keeps the feet
  // off them); then the furniture, the plan's own dice placing it — the throne against the throne hall's back wall in its middle,
  // the audience before it, the court's benches along its sides, the guard either side; the benches of those who come to wait in
  // the hall of audience and the vestibule; the council's table and the scribes'; the guard's rack and cots; the kitchen's fire,
  // the banquet's tables, the treasury's chests; a bed in every chamber; the guards at the gate (vigiar). In the form's family
  // (forma.palacio), where the form of that size is the people's (In.formSized, int-civicos.js)
  const FM = { form: 1 }; // (a piece the form draws: the plan only keeps the feet off it)
  // (which of the world's sides each of the plan's faces is, by the side the plan opens to: the bits of rec.pw — int-quadras.js)
  const PARTY = { S: { frente: 4, fundo: 1, direita: 2, esquerda: 8 }, N: { frente: 1, fundo: 4, direita: 8, esquerda: 2 }, E: { frente: 2, fundo: 8, direita: 1, esquerda: 4 }, W: { frente: 8, fundo: 2, direita: 4, esquerda: 1 } };
  // (the risk of a form with one — the palace's, the temple's —, kept on its platform's element)
  const riskOf = F => { const e = F && F.els.find(q => q.palacio || q.risco); return e ? e.palacio || e.risco : null; };
  // (a wall of the risk and its openings: a window — none in a side against another building's wall at the founding: a party
  // wall, rec.pw —, a door — the street's where the risk says so, kept in .gate —; the rooms either side of a door are found by
  // where it falls, when the plan is finished)
  function layerOf(P) {
    const Ly = { gate: -1 }; const blind = side => !!(side && P.rec.pw & ((PARTY[P.rec.s] || PARTY.S)[side] || 0));
    Ly.lay = w => {
      const id = P.wall(w.lv, w.a, w.b, w.t, w.h, w.outer, w.kind);
      for (const o of w.ops) {
        const at = r2(P.atOf(id, o.p));
        if (o.k === 'janela') { if (!(w.outer && blind(w.side))) P.window(id, at, o.w, o.h, o.sill); }
        else { const d = P.door(id, at, o.w, o.h, -1, o.rua ? 'rua' : -1, o.rua ? 1 : 0, o.k === 'portal' ? 'porta' : o.k); if (o.rua) Ly.gate = d; }
      }
      return id;
    };
    return Ly;
  }
  function palaceByForm(P, F) {
    const R = riskOf(F); if (!R) { P.errs.push('o palácio sem o risco da forma'); return; }
    P.shell = { kind: 'rect', r: R.B.slice(), t: R.t, mat: R.mat, base: R.Hp >= In.BODY.step ? 'macica' : 'pedra', baseH: R.Hp, floors: R.two ? 2 : 1, eave: R.eave, court: R.C.slice() };
    // (the roof the form has: one over each wing, along it, from the eaves — over the cornice of the Greek's and the Roman's —,
    // its rise each its own (alas: the wing by its side, from the way in — fundo, esquerda, direita, frente —, its rise, how far
    // over the eaves it starts); the court open to the sky between them. Never one roof round the court: E. In the canonical
    // frame, each wing's rectangle and the way its ridge runs: P.roofGeo)
    P.roof = { kind: R.roof.kind, along: null, h: R.roof.h, over: R.roof.over, court: R.C.slice(), alas: R.alas.map(a => ({ lado: a.lado, h: a.h, base: r2(a.y0 - R.eave) })) };
    P.roofGeo = { kind: R.roof.kind, along: null, eave: R.eave, rise: R.roof.h, R: R.B.slice(), alas: R.alas.map(a => ({ lado: a.lado, r: a.r.slice(), ao: a.ao, y0: a.y0, h: a.h, ov: a.ov })) };
    for (const l of R.levels) P.level(l.lv, l.y, l.h, l.kind, l.area);
    P.entryLv = 0;
    const Ly = layerOf(P); const lay = Ly.lay;
    for (const w of R.walls) if (w.casca) lay(w);
    // (the porch: an annex open at its sides, as high as its columns; the columns of the risk — the porch's between it and the
    // court of honour, the screen across the open court's front with the street's gate in its middle bay — each where the form
    // stands it)
    if (R.porch) { const c = R.cols.find(q => q.porch); P.annex.push({ r: R.porch.slice(), h: c ? c.h : R.Hw, fn: 'portico', lv: 0, roof: 'portico' }); }
    for (const c of R.cols) {
      const s = c.pts.slice().sort((a, b) => a[0] - b[0]); const lo = r2(s[0][0] - c.rc), hi = r2(s[s.length - 1][0] + c.rc), at = s[0][1]; const pos = s.map(q => r2(hi - q[0])).reverse();
      if (!c.front) { P.colonnade(0, [hi, at], [lo, at], { at: pos, col: r2(2 * c.rc), h: c.h, dh: c.h }); continue; }
      // (the screen across the open court's front, on the podium's edge: the way in its gate's bay alone — the risk's c.rua,
      // counted from the left: the wall runs from the right —; every other bay shut by the balustrade the form stands there,
      // never a way through to the drop — they were arches, and the 3D found the balustrade in them, 0.30 m past the face:
      // L-575. The court's open front the proofs know as the form's: T-449)
      const wid = P.wall(0, [hi, at], [lo, at], r2(2 * c.rc), c.h, 1, 'colunata'); const k = pos.length - 2 - c.rua;
      Ly.gate = P.door(wid, r2((pos[k] + pos[k + 1]) / 2), r2(pos[k + 1] - pos[k] - 2 * c.rc), c.h, -1, 'rua', 1, 'vao');
    }
    if (R.yard) P.yard = { r: R.yard.slice(), h: R.yardH, lv: 0 }; // (the court of honour: the shell's yard, its edge as high as the risk has it)
    // (the flight from the street up to the podium: one, on the form's own treads)
    P.stair('degraus', -1, 0, R.stair.slice(), 0, -1, null, { larga: R.sw >= 1.2 ? 1 : 0, treads: R.treads.map(q => ({ r: q.r.slice(), y: q.y })) });
    if (Ly.gate < 0) { P.errs.push('o palácio sem a porta da rua'); return; }
    P.entrance = { door: Ly.gate, u: R.gate.u, v: R.gate.v, w: R.gate.w, lv: 0 };
    if (P.inside()) return;
    // ======== the inside ========
    for (const w of R.walls) if (!w.casca) lay(w);
    const ids = R.rooms.map(m => P.room(m.lv, m.fn, m.r, m.open));
    for (const s of R.stairs) P.stair('escada', s.lv0, s.lv1, s.r.slice(), s.du, s.dv, s.hole.slice());
    const fo = R.fonte; const c = fo.c;
    if (!P.at('fonte', 0, ids[R.courtRoom], [c[0] - fo.r, c[1] - fo.r, c[0] + fo.r, c[1] + fo.r].map(r2), 0, 1, FM)) { P.errs.push('a fonte do pátio onde a planta não a põe'); return; }
    for (const p of R.pieces) if (!P.at('solido', 0, ids[p.room], p.r.slice(), 0, 1, { h: p.h, form: 1 })) { P.errs.push(`${p.k} da forma onde a planta não o põe (${p.r.join(', ')})`); return; }
    palaceFormFurnish(P, R, ids);
  }
  // the furniture of the palace by its form: by what each room is for (the risk's), the places of the guard where they stand
  function palaceFormFurnish(P, R, ids) {
    const tr = P.tr; const lvOf = k => R.rooms[k].lv; const rect = k => R.rooms[k].r; const L = R.L;
    // (a place to stand with no piece — the guard's —, its room kept clear of furniture first)
    const guard = (k, pts) => { for (const q of pts) P.zones.push({ lv: lvOf(k), r: [q[0] - 0.4, q[1] - 0.4, q[0] + 0.4, q[1] + 0.4].map(r2) }); return () => P.marks(lvOf(k), ids[k], 'vigiar', pts.map(q => [r2(q[0]), r2(q[1]), q[2]]), { st: 'idle' }); };
    const later = [];
    // the throne: against the back wall in the middle, the audience's room before it kept clear, its two lamps, the guard either
    // side of it, the benches of the court along the sides
    { const k = R.throne, r = rect(k), id = ids[k]; const cu = r2((r[0] + r[2]) / 2);
      const th = P.at('trono', 0, id, [r2(cu - 0.5), r2(r[1] + 0.05), r2(cu + 0.5), r2(r[1] + 0.85)], 0, 1); if (!th) { P.errs.push('sem lugar para o trono'); return; }
      P.zones.push({ lv: 0, r: [r2(th.r[0] - 0.3), th.r[3], r2(th.r[2] + 0.3), r2(th.r[3] + 1.8)] });
      later.push(guard(k, [[cu - 2.2, r[1] + 1.0, 0], [cu + 2.2, r[1] + 1.0, 0]]));
      P.opt(() => { for (const du of [-1.2, 1.2]) P.at('lampadario', 0, id, [r2(cu + du - 0.225), r2(r[1] + 0.05), r2(cu + du + 0.225), r2(r[1] + 0.5)], 0, 1); });
      if (R.NO) P.opt(() => P.at('lar', 0, id, [r2(cu - 0.6), r2((r[1] + r[3]) / 2 - 0.4), r2(cu + 0.6), r2((r[1] + r[3]) / 2 + 0.4)], 0, 1)); // (the great hall's hearth in its middle)
      let n = 0; for (const s of ['esquerda', 'direita']) for (let g = 0; g < 3; g++) if (P.place('banco', 0, id, { sides: [s] })) n++;
      if (n < 4) { P.errs.push(`só ${n} bancos no salão do trono`); return; } }
    // (the guards at the street's gate, inside it: either side of its way — the Egyptian's in the passage between the towers)
    { const open = R.big ? R.yardRoom : R.courtRoom; const r = rect(open); const gw = R.gate.w; const du = R.EG ? Math.max(0.6, gw / 2 - 0.7) : gw / 2 + 0.9;
      later.push(guard(open, [[L / 2 - du, r[3] - 1.0, 0], [L / 2 + du, r[3] - 1.0, 0]])); }
    if (R.vest >= 0) { const r = rect(R.vest); later.push(guard(R.vest, [[L / 2 - 1.9, r[3] - 0.9, Math.PI], [L / 2 + 1.9, r[3] - 0.9, Math.PI]])); }
    // (the way of state kept clear: the courts' axis — from the gate to the fountain and on to the throne hall's portal, the court
    // of honour's from the gate to the porch —, no bench on it: L-513)
    for (const k of [R.courtRoom, R.yardRoom]) if (k >= 0) { const r = rect(k); P.zones.push({ lv: 0, r: [r2(L / 2 - 0.8), r[1], r2(L / 2 + 0.8), r[3]] }); }
    // (and round each stair: upstairs the passage along its well's railing and the landing past its top — the void well is
    // walked round, never over, and no chest stands against the railing (it stood 0.10 m from it: E) —; below, the floor
    // before its foot: L-515)
    for (const s of R.stairs) { const h = s.hole, k = 0.7, d = 1.0;
      P.zones.push({ lv: s.lv1, r: [r2(h[0] - (s.du < 0 ? d : k)), r2(h[1] - (s.dv < 0 ? d : k)), r2(h[2] + (s.du > 0 ? d : k)), r2(h[3] + (s.dv > 0 ? d : k))] });
      P.zones.push({ lv: s.lv0, r: s.dv < 0 ? [h[0], h[3], h[2], r2(h[3] + d)] : s.dv > 0 ? [h[0], r2(h[1] - d), h[2], h[1]] : s.du > 0 ? [r2(h[0] - d), h[1], h[0], h[3]] : [h[2], h[1], r2(h[2] + d), h[3]] }); }
    const fire = id => { const f = tr.fire === 'lar' ? 'lar' : tr.fire || 'fogao'; return (f === 'lar' && P.place('lar', 0, id, { sides: ['livre'], margin: 0.6 })) || P.place(f === 'lar' || f === 'forno' ? 'fogao' : f, 0, id) || P.place('fogao', 0, id) || P.place('braseiro', 0, id); };
    let beds = 0;
    for (const m of R.rooms) {
      const id = ids[m.id], lv = m.lv;
      if (m.fn === 'audiencia' || m.fn === 'vestibulo') P.opt(() => { for (const s of ['esquerda', 'direita', 'fundo']) for (let g = 0; g < 2; g++) P.place('banco', lv, id, { sides: [s] }); if (m.fn === 'audiencia') P.place('lampadario', lv, id, { sides: ['livre'], margin: 0.8 }); });
      else if (m.fn === 'conselho') { P.opt(() => { P.place('mesa-conferencia', lv, id, { sides: ['livre'], margin: 0.8 }); for (let g = 0; g < 2; g++) P.place('mesa-escriba', lv, id); P.place('cofre', lv, id); }); }
      else if (m.fn === 'escritorio' || m.fn === 'estudo') P.opt(() => { for (let g = 0; g < (m.fn === 'estudo' ? 1 : 2); g++) P.place('mesa-escriba', lv, id); P.place('arca', lv, id); });
      else if (m.fn === 'cozinha') { if (!fire(id)) { P.errs.push('sem lugar para o fogo da cozinha'); return; } P.opt(() => { P.place('mesa', lv, id, { sides: ['livre'] }); P.place('jarros', lv, id); }); }
      else if (m.fn === 'banquete') P.opt(() => { for (let g = 0; g < 2; g++) if (P.place('mesa', lv, id, { sides: ['livre'], margin: 0.6 })) P.place('banco', lv, id); P.place('jarros', lv, id); });
      else if (m.fn === 'guarda') P.opt(() => { P.place('armeiro', lv, id); P.place('banco', lv, id); P.place('catre', lv, id); });
      else if (m.fn === 'tesouro') P.opt(() => { for (let g = 0; g < 2; g++) P.place('cofre', lv, id); P.place('arca', lv, id); });
      // (a chamber: its bed and its chest — and, where it fits, a second bed: the ruler's household lives here, its children too, D-205)
      else if (m.fn === 'aposento') { if (P.place('cama-casal', lv, id) || P.place('cama', lv, id)) { beds++; P.opt(() => { P.place('arca', lv, id); P.place('cama', lv, id); }); } }
      else if (m.fn === 'patio') P.opt(() => { for (let g = 0; g < 2; g++) P.place('banco', lv, id, { sides: ['livre'], margin: 1.2 }); });
    }
    if (!beds) { P.errs.push('sem cama nos aposentos'); return; }
    for (const f of later) f();
    // the audience (D-124): where those the ruler receives stand — in rows before the throne, facing it, a metre apart, the
    // aisle from the portal to the throne free; in the great palace and the colossal, in the hall of audience too, facing the
    // throne hall's door, its front and that door's side kept for the way through. Each clear of what stands there
    const clear = (lv, u, v) => !P.items.some(it => it.lv === lv && In.ITEMS[it.kind].solid && u > it.r[0] - 0.75 && u < it.r[2] + 0.75 && v > it.r[1] - 0.75 && v < it.r[3] + 0.75);
    { const k = R.throne, r = rect(k), cu = r2((r[0] + r[2]) / 2); const pts = [];
      for (let v = r2(r[1] + 3.2); v <= r[3] - 1.2 + 1e-6; v = r2(v + 1.1)) for (let d = 1.2; cu + d <= r[2] - 1.2 + 1e-6; d = r2(d + 1.0)) for (const u of [r2(cu - d), r2(cu + d)]) if (clear(0, u, v)) pts.push([u, v, Math.PI]);
      if (pts.length) P.marks(0, ids[k], 'audiencia', pts); }
    if (R.big || R.mid) { const k = R.audience, r = rect(k); const left = r[2] <= L / 2; const pts = [];
      for (let v = r2(r[1] + 1.2); v <= r[3] - 1.4 + 1e-6; v = r2(v + 1.0)) for (let u = r2(left ? r[0] + 1.2 : r[2] - 1.2); left ? u <= r[2] - 1.4 + 1e-6 : u >= r[0] + 1.4 - 1e-6; u = r2(u + (left ? 1.0 : -1.0))) if (clear(0, u, v)) pts.push([u, v, left ? Math.PI / 2 : -Math.PI / 2]);
      if (pts.length) P.marks(0, ids[k], 'audiencia', pts); }
  }
  In.formSized('palacio', palaceByForm); In.formSized('grande_palacio', palaceByForm); In.formSized('palacio_colossal', palaceByForm);
  In.riskOf = riskOf; // (for the proofs: the risk a palace's or a temple's plan is laid out from)
  In.riskLayer = layerOf; // (the walls of a risk laid in a plan — the inn's of int-familias.js too: one rule for the party walls)

  // ------------------------------ the temple by its form: the bigger steps (D-106) ------------------------------
  // The temple of four, six and eight tiles — js/forma-poder.js, riscoTemplo — laid out from the risk its form keeps (the
  // platform's element: e.risco), as the palace is: its shell the cella's block (the Greek's, the Roman's), the hall's (the
  // Egyptian's, the Norse's), the shrine's (the Aztec's, on its pyramid's top) on the platform; the porch, the peristyle, the
  // gallery its annexes, their columns where the form stands them, their bays the ways through; the precinct on the platform
  // its yard — the temenos, the terraces, the court behind the pylon, the garth in its palisade, the forecourt on the pyramid's
  // top —, its walls, its gate where the flight comes up; inside, the walls and the
  // portals, the rooms, the form's pieces (the columns of the hall, the towers, the trees and statues, the stones) and its fires,
  // the place of who lights each beside it; then the furniture. In the form's family (forma.templo), where the form of that size
  // is the people's (In.formSized, int-civicos.js)
  function templeByForm(P, F) {
    const R = riskOf(F); if (!R) { P.errs.push('o templo sem o risco da forma'); return; }
    P.shell = { kind: 'rect', r: R.B.slice(), t: R.t, mat: R.mat, base: R.Hp >= In.BODY.step ? 'macica' : 'pedra', baseH: R.Hp, floors: 1, eave: R.eave };
    P.roof = { kind: R.roof.kind, along: R.roof.along || null, h: R.roof.h, over: R.roof.over };
    for (const l of R.levels) P.level(l.lv, l.y, l.h, l.kind, l.area);
    P.entryLv = 0;
    const Ly = layerOf(P);
    for (const w of R.walls) if (w.casca) Ly.lay(w);
    for (const a of R.annexes) P.annex.push({ r: a.r.slice(), h: a.h, fn: a.fn, lv: 0, roof: 'portico' });
    for (const c of R.cols) { const out = P.colonnade(0, c.line[0], c.line[1], { at: c.at, col: r2(2 * c.rc), h: c.wh || c.h, dh: c.h, outer: c.outer ? 1 : 0, door: c.door, rua: !!c.rua }); if (c.rua) Ly.gate = out.door; }
    if (R.yard) P.yard = { r: R.yard.slice(), h: R.yardH, lv: 0 };
    P.stair('degraus', -1, 0, R.stair.slice(), 0, -1, null, { larga: R.sw >= 1.2 ? 1 : 0, treads: R.treads.map(q => ({ r: q.r.slice(), y: q.y })) });
    if (Ly.gate < 0) { P.errs.push('o templo sem a porta da rua'); return; }
    P.entrance = { door: Ly.gate, u: R.gate.u, v: R.gate.v, w: R.gate.w, lv: 0 };
    if (P.inside()) return;
    // ======== the inside ========
    for (const w of R.walls) if (!w.casca) Ly.lay(w);
    const ids = R.rooms.map(m => P.room(m.lv, m.fn, m.r, m.open));
    for (const p of R.pieces) if (!P.at('solido', 0, ids[p.room], p.r.slice(), 0, 1, { h: p.h, form: 1 })) { P.errs.push(`${p.k} da forma onde a planta não o põe (${p.r.join(', ')})`); return; }
    // (the fires of the risk: solid on the floor, the place of who lights each beside it toward the way in, facing it)
    const e = P.entrance;
    for (const f of R.fires) { const id = ids[f.room];
      if (!P.at('solido', 0, id, f.pe.slice(), 0, 1, { h: f.h, form: 1 })) { P.errs.push('o braseiro da forma onde a planta não o põe'); return; }
      const du = e.u - f.c[0], dv = e.v - f.c[1], dl = Math.hypot(du, dv) || 1, d = f.r + In.BODY.r + 0.1;
      P.marks(0, id, 'acender', [[r2(f.c[0] + du / dl * d), r2(f.c[1] + dv / dl * d), Math.atan2(-du, -dv)]]); }
    templeFormFurnish(P, R, ids);
  }
  // the temple's furniture by its form: the god's image against the back wall of the sanctuary in its middle, the altar a pace
  // before it — the priest between them —, a lamp at either hand; the faithful in rows facing the altar, an aisle down the
  // middle — the benches, the mats of the peoples that kneel —, in the rooms of prayer the risk names; and where no row goes,
  // standing before the temple, a pace apart (the court, the porch, the peristyle, the gallery, the garth), clear of the way in
  // and of what stands there; the chest of the offerings. The same in every attempt: the risk fixes the rooms, the rows are laid
  // the same way
  function templeFormFurnish(P, R, ids) {
    const sid = ids[R.sanct]; const A = P.rooms[sid].r; const L = R.L;
    const im = P.place('idolo', 0, sid, { sides: ['fundo'], center: true }); if (!im) { P.errs.push('sem lugar para a imagem do deus'); return; }
    const cu = r2((im.r[0] + im.r[2]) / 2); let al = null;
    for (let dv = 0.75; !al && im.r[3] + dv + 0.7 <= A[3] - 0.6 + 1e-6; dv = r2(dv + 0.1)) for (const du of [0, -0.3, 0.3]) {
      const u = Math.max(A[0] + 0.7, Math.min(A[2] - 0.7, cu + du)); al = P.at('altar', 0, sid, [r2(u - 0.6), r2(im.r[3] + dv), r2(u + 0.6), r2(im.r[3] + dv + 0.7)], 0, 1); if (al) break; }
    if (!al) { P.errs.push('sem lugar para o altar'); return; }
    P.opt(() => { const ac = (al.r[0] + al.r[2]) / 2; for (const du of [-1.1, 1.1]) P.at('lampadario', 0, sid, [r2(ac + du - 0.23), r2(al.r[1] + 0.12), r2(ac + du + 0.22), r2(al.r[1] + 0.57)], 0, 1); });
    const kind = R.kneel ? 'esteira-oracao' : 'banco-fieis'; const D = In.ITEMS[kind]; const aisle = 1.2, gv = R.kneel ? 0.4 : 0.55, gu = R.kneel ? 0.35 : 0.3;
    let n = 0;
    for (const k of R.pray) {
      const id = ids[k], r = P.rooms[id].r; const v0 = id === sid ? r2(al.r[3] + 1.3) : r2(r[1] + 0.6), v1 = r2(r[3] - 1.0);
      for (let v = v0; v + D.d <= v1 + 1e-6; v = r2(v + D.d + gv)) for (const s of [-1, 1]) for (let u = r2(L / 2 + s * aisle / 2); s > 0 ? u + D.w <= r[2] - 0.4 + 1e-6 : u - D.w >= r[0] + 0.4 - 1e-6; u = r2(u + s * (D.w + gu))) {
        const rr = s > 0 ? [u, v, r2(u + D.w), r2(v + D.d)] : [r2(u - D.w), v, u, r2(v + D.d)]; if (P.at(kind, 0, id, rr, 0, -1)) n++; }
    }
    for (const k of R.stand) {
      const id = ids[k], r = P.rooms[id].r; const keep = (k === R.courtRoom ? R.gate.w : R.doorD ? R.doorD.w : 2) / 2 + 0.6; const pts = [];
      for (const v of r[3] - r[1] >= 2.4 ? [r2(r[1] + 0.8), r2(r[3] - 0.8)] : [r2((r[1] + r[3]) / 2)]) for (let u = r2(r[0] + 0.6); u <= r[2] - 0.6 + 1e-6; u = r2(u + 0.9)) {
        if (Math.abs(u - L / 2) < keep) continue;
        if (P.items.some(it => it.lv === 0 && In.ITEMS[it.kind].solid && u > it.r[0] - 0.75 && u < it.r[2] + 0.75 && v > it.r[1] - 0.75 && v < it.r[3] + 0.75)) continue;
        pts.push([u, v, Math.PI]); }
      if (pts.length) { P.marks(0, id, 'rezar', pts); n += pts.length; }
    }
    if (n < 2) P.errs.push(`só ${n} lugares para os fiéis`);
    P.opt(() => { for (const id of [sid].concat(ids)) if (P.place('cofre', 0, id)) break; });
  }
  In.formSized('temple', templeByForm);

  // ------------------------------ the fair ------------------------------
  // no walls and no roof: the lot's own ground, open on every side (its shell 'aberta'); the stalls in rows along the lanes
  // — or round the square in the middle, or along the edges of the lot round the open middle —, each with its seller behind
  // it and its buyers before it; the stalls of a fair are its work stations (BDEF.jobs)
  const HF = { ruas: 'Bancas em fileiras', praca: 'Bancas em volta da praça', bordas: 'Bancas nas bordas, o largo no meio' };
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
    const id = P.room(0, H === 'ruas' ? 'ruas' : H === 'praca' ? 'praca' : 'largo', sh, 1); const D = In.ITEMS.banca; let n = 0;
    const lane = P.rr(1.9, 2.3), back = 0.95; // (the lane the buyers walk; behind a stall, the seller's room)
    const stall = (r, fu, fv) => { if (P.at('banca', 0, id, r, fu, fv)) n++; };
    if (H === 'ruas') {
      // (rows across the lot, back to back, a lane between each pair of rows; the stalls facing the lanes)
      let v = sh[1] + lane;
      while (v + 2 * D.d + back <= sh[3] - lane + 1e-6) {
        for (let u = sh[0] + 0.6; u + D.w <= sh[2] - 0.6 + 1e-6; u += D.w + P.rr(0.6, 0.9)) { stall([u, v, u + D.w, v + D.d], 0, -1); stall([u, v + D.d + back, u + D.w, v + 2 * D.d + back], 0, 1); }
        v += 2 * D.d + back + lane;
      }
    } else if (H === 'bordas') {
      // (along the four edges of the lot, facing in — the lot's edge at the sellers' backs —, the middle left open; the corners
      // kept clear, where the sellers' ways meet; the way in keeps its gap in the front row)
      const gap = () => P.rr(0.6, 0.9); const a0 = back + D.d + 0.4; const e0 = e.u - e.w / 2 - 0.5, e1 = e.u + e.w / 2 + 0.5;
      for (let u = sh[0] + a0; u + D.w <= sh[2] - a0 + 1e-6; u += D.w + gap()) stall([u, sh[1] + back, u + D.w, sh[1] + back + D.d], 0, 1);
      for (let v = sh[1] + a0; v + D.w <= sh[3] - a0 + 1e-6; v += D.w + gap()) { stall([sh[0] + back, v, sh[0] + back + D.d, v + D.w], 1, 0); stall([sh[2] - back - D.d, v, sh[2] - back, v + D.w], -1, 0); }
      for (let u = sh[0] + a0; u + D.w <= sh[2] - a0 + 1e-6; u += D.w + gap()) if (u + D.w <= e0 || u >= e1) stall([u, sh[3] - back - D.d, u + D.w, sh[3] - back], 0, -1);
      P.opt(() => P.place('fonte', 0, id, { sides: ['centro'], margin: 0.5 }));
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
