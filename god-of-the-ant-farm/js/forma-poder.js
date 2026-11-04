'use strict';
// ============================================================
//  Forma, the steps of power, faith and company (D-106; the
//  specialist M2): the forms of the bigger steps of the ladders
//  of the palaces and the chief's house, the temples (from the
//  village shrine to the monumental sanctuary), the halls of the
//  city and the inn — put in by G.Forma.def(type, style,
//  fn(L, n), sizes). Pure as js/forma.js (rule 36): no chance,
//  no world, no 3D; the body's rules hold at every size.
// ============================================================
(function (G) {
  const Fo = G.Forma; if (!Fo) return;
  const TILE = 4;
  const r2 = x => Math.round(x * 100) / 100;
  const BASE = ['base0', 'base1', 'base2'], WALL = ['wl', 'wr', 'top'], COL = ['col0', 'col1', 'col0'], PAR = ['par0', 'par1', 'par0'];
  const ROOF = ['roof0', 'roof1', 'gable', 'roof2'];

  // ------------------------------ the palace of courts (palácio 6, grande palácio 8, palácio colossal 10) ------------------------------
  // A palace of a capital is a block of wings round a court, on a podium the flight of steps climbs to: across the back the
  // wing of state — the throne hall in its middle, 14 m across and 9.4 m deep, one storey of 9.4 m to the eaves; the hall of
  // audience at its left, where those who come wait, and the hall of the council at its right —; the wings at the sides and
  // (the colossal's) at the front of two storeys — the guard, the kitchen and the stores, the offices on the ground; the
  // chambers above —; the court in their middle, its fountain. The palace (6 tiles) and the great palace (8: the wider wings of
  // three rooms a side, the halls of audience and of the council open on the court) open their court to the front, closed by
  // the people's front (a screen of columns, the pylon's wall and its gate, the palisade), the flight up to its gate; the
  // colossal (10) shuts its court with the front wing and has before it the porch along the whole front and the court of
  // honour on the podium — its balustrade, its statues, its gate where the flight comes up (the ceremonial court: two courts).
  // The risk (risco) below is that one definition: the god paints the outside drawn from it (the elements), and the plan of
  // the palace (int-palacio.js, the family forma.palacio) lays out its walls, its rooms, its doors and windows, its stairs and
  // the pieces of its courts from the same numbers — kept on the podium's element (e.palacio), as the amphitheatre's are its
  // own (F.amphi, D-095). Metres in the form's frame (u across, v from the back, the way in at v = L, y over the lot's
  // highest ground). The Greek's and the Roman's (the porch, the pediment, the Roman's dome), the Egyptian's (the pylon, the
  // papyrus columns, the flat roofs and their bands, the pool among the palms), the Norse's (the halls of planks under the
  // turf, the dragons at the great hall's gables, the palisade) and the Aztec's (the platform of 2 m and its frieze, the flat
  // roofs under their painted bands, the crests and their green plumes over the court, the braziers, the palms of the court
  // of honour); the classical people's the Greek's, as the god draws its palace (G.Escala offers a step only where its people's
  // form has that size).
  const DOOR_H = 2.6; // (an inner door's height: over the body's 1.75 m, under the lintel's beam)
  // (the stair up to the chambers: 4.8 m up in 4.2 — 49°, a stair the feet walk, D-086 —, 1.4 m wide; a metre before its foot and
  // a landing of a metre past its top: its well is void upstairs, L-562 —, the top steps onto floor, never through a wall: L-515)
  const STAIR = { run: 4.2, w: 1.4, foot: 1.0, land: 1.0 };
  function risco(st, n) {
    const L = n * TILE, big = n >= 10, mid = !big && n >= 8; const NO = st === 'nordico', EG = st === 'egipcio', RO = st === 'romano', AZ = st === 'asteca';
    // ---- the podium and its flight: risers of 0.25 m, the flight before the podium's front, its foot at the lot's edge ----
    const e = big || mid ? 0.4 : 0.3; const Hp = NO ? 0.5 : EG ? 1.0 : big || AZ ? 2.0 : 1.5;
    const nr = Math.round(Hp / 0.25), td = NO || EG ? 0.45 : 0.42; const run = r2((nr - 1) * td);
    const Vp = r2(L - e - run); // (the podium's front edge, the flight's top)
    const sw = big ? (NO ? 6 : EG ? 6 : AZ ? 8 : 12) : (NO ? 4 : EG ? 4 : AZ ? 6 : mid ? 10 : 8); const su0 = r2(L / 2 - sw / 2), su1 = r2(L / 2 + sw / 2);
    const treads = []; for (let k = 0; k < nr - 1; k++) treads.push({ r: [su0, r2(L - e - td * (k + 1)), su1, r2(L - e - td * k)], y: r2(Hp * (k + 1) / nr) });
    // ---- the walls, the storeys ----
    const t = NO ? 0.35 : big ? 0.6 : 0.5, tc = NO ? 0.3 : 0.4, ti = 0.2;
    const two = !NO; const H0 = 4.8, H1 = 4.6; const Hw = NO ? 4.2 : r2(H0 + H1); const eave = r2(Hp + Hw);
    // ---- the block (the shell), its wings and its court ----
    const m = big ? 0.6 : 0.5; const B = [r2(e + m), r2(e + m), r2(L - e - m), big ? r2(e + m + 24.5) : Vp];
    const I = [r2(B[0] + t), r2(B[1] + t), r2(B[2] - t), r2(B[3] - t)];
    const Db = 9.4, Ws = big ? 6.0 : mid ? 5.0 : 4.0, Df = 5.1; // (the back wing's depth inside — the throne hall's —, the side wings', the front wing's)
    const C = [r2(I[0] + Ws + tc), r2(I[1] + Db + tc), r2(I[2] - Ws - tc), big ? r2(I[3] - Df - tc) : B[3]];
    const hall = [r2(L / 2 - 7), r2(L / 2 + 7)]; // (the throne hall across: 14 m)
    const sideEnd = big ? C[3] : I[3]; // (where the side wings end at the front: the front wing's court wall, or the block's front)
    // (the porch and the court of honour of the colossal: the porch along the whole front, the court before it to the podium's edge)
    const Dp = big && !NO ? 3.2 : 0; const porch = Dp ? [B[0], B[3], B[2], r2(B[3] + Dp)] : null;
    const yard = big ? [B[0], r2(B[3] + Dp), B[2], Vp] : null;
    const R = { st, n, L, big, mid, NO, EG, RO, AZ, Hp, nr, td, Vp, sw, su0, su1, treads, t, tc, ti, two, H0, H1, Hw, eave, B, I, C, hall, porch, yard,
      podium: [e, e, r2(L - e), Vp], stair: [su0, Vp, su1, r2(L - e)], walls: [], rooms: [], stairs: [], cols: [], pieces: [] };
    // ---- the levels: the ground storey over the podium, as high as the eaves (the wing of state is one storey); the upper one
    // over the side and front wings, its floor H0 over the ground's ----
    R.levels = [{ lv: 0, y: Hp, h: Hw, kind: 'piso', area: I.slice() }];
    if (two) R.levels.push({ lv: 1, y: r2(Hp + H0), h: H1, kind: 'andar', area: [I[0], C[1], I[2], I[3]] });
    // ---- the rooms, wing by wing (fixed by the risk: one palace, one structure; the plan's dice only move the furniture) ----
    const room = (lv, fn, r, o) => { R.rooms.push(Object.assign({ lv, fn, r: r.map(r2), id: R.rooms.length }, o || {})); return R.rooms.length - 1; };
    const cutsOf = (a, b, k) => { const out = []; const each = (b - a - (k - 1) * ti) / k; let p = a; for (let q = 0; q < k; q++) { const z = q === k - 1 ? b : r2(p + each); out.push([r2(p), z]); p = r2(z + ti); } return out; };
    // the wing of state: the hall of audience, the throne hall, the hall of the council
    const BW = [I[0], I[1], I[2], r2(C[1] - tc)];
    const bAud = room(0, big || mid ? 'audiencia' : 'aposento', [BW[0], BW[1], r2(hall[0] - ti), BW[3]], { wing: 'fundo' });
    const bThr = room(0, 'trono', [hall[0], BW[1], hall[1], BW[3]], { wing: 'fundo' });
    const bCon = room(0, 'conselho', [r2(hall[1] + ti), BW[1], BW[2], BW[3]], { wing: 'fundo' });
    // the side wings: on the ground the kitchen and the banquet hall at the left, the offices at the right (the palace of six: the
    // guard at the front of each, by the way in, the stair up in its room); above, the chambers
    const LW = [I[0], C[1], r2(C[0] - tc), sideEnd], RW = [r2(C[2] + tc), C[1], I[2], sideEnd];
    const sideK = mid ? 3 : 2; const sideFn = big ? { esquerda: ['cozinha', 'banquete'], direita: ['escritorio', 'escritorio'] } : mid ? { esquerda: ['cozinha', 'banquete', 'guarda'], direita: NO ? ['aposento', 'aposento', 'guarda'] : ['escritorio', 'escritorio', 'guarda'] } : { esquerda: ['cozinha', 'guarda'], direita: ['escritorio', 'guarda'] };
    const wingRooms = {};
    for (const [side, W] of [['esquerda', LW], ['direita', RW]]) {
      const cuts = big || mid ? cutsOf(W[1], W[3], sideK) : [[W[1], r2(W[1] + 3.9)], [r2(W[1] + 3.9 + ti), W[3]]];
      // (upstairs the last room — the stair's, up from the wing's front — reaches back past the stair's top by its landing)
      const up = cuts.map(q => q.slice()); if (two && !big) { const k = up.length - 1; const a = Math.min(up[k][0], r2(W[3] - STAIR.foot - STAIR.run - STAIR.land)); up[k][0] = a; up[k - 1][1] = r2(a - ti); }
      wingRooms[side] = { 0: cuts.map(([a, b], q) => room(0, sideFn[side][q], [W[0], a, W[2], b], { wing: side, court: 1 })) };
      if (two) wingRooms[side][1] = up.map(([a, b]) => room(1, 'aposento', [W[0], a, W[2], b], { wing: side }));
    }
    // the front wing of the colossal: the vestibule behind the main door, the guard either side of it, the stair at the left end,
    // the treasury at the right; above, the chambers and the ruler's study over the vestibule
    const FW = big ? [I[0], r2(C[3] + tc), I[2], I[3]] : null; let fVest = -1;
    if (big) {
      const vw = 6.0; const v0 = r2(L / 2 - vw / 2), v1 = r2(L / 2 + vw / 2); const c0 = r2(C[0] - tc), c1 = r2(C[2] + tc);
      const spans = [[FW[0], c0], [r2(c0 + ti), r2(v0 - ti)], [v0, v1], [r2(v1 + ti), r2(c1 - ti)], [c1, FW[2]]];
      // (one storey — the Norse's halls —: the chambers at the front wing's ends, where the others have the stair and the treasury)
      const fn0 = two ? ['escadaria', 'guarda', 'vestibulo', 'guarda', 'tesouro'] : ['aposento', 'guarda', 'vestibulo', 'guarda', 'aposento'], fn1 = ['escadaria', 'aposento', 'estudo', 'aposento', 'aposento'];
      wingRooms.frente = { 0: spans.map(([a, b], q) => room(0, fn0[q], [a, FW[1], b, FW[3]], { wing: 'frente', court: q >= 1 && q <= 3 ? 1 : 0 })) };
      if (two) wingRooms.frente[1] = spans.map(([a, b], q) => room(1, fn1[q], [a, FW[1], b, FW[3]], { wing: 'frente' }));
      fVest = wingRooms.frente[0][2];
    }
    // the court (open to the sky); the colossal's porch and its court of honour
    const courtR = big ? C.slice() : [C[0], C[1], C[2], r2(C[3] - (NO || EG ? 0.3 : 0.9))]; // (the U: to the inner face of its front)
    const cRoom = room(0, 'patio', courtR, { open: 1, court: 1 });
    const pRoom = porch ? room(0, 'portico', [porch[0], porch[1], porch[2], r2(porch[3] - 0.9)], { host: 'portico' }) : -1;
    // (the court of honour to the inner face of its front — the wall of the pylon or the palisade —, or to the gate's edge of no
    // height: its doorstep the flight's top, no strip between them the feet would not stand on)
    const yRoom = yard ? room(0, 'terreiro', [r2(yard[0] + 0.3), yard[1], r2(yard[2] - 0.3), r2(yard[3] - (NO || EG ? 0.3 : 0.1))], { open: 1, host: 'terreiro' }) : -1;
    R.courtRoom = cRoom; R.porchRoom = pRoom; R.yardRoom = yRoom; R.throne = bThr; R.audience = bAud; R.council = bCon; R.vest = fVest; R.wingRooms = wingRooms;
    // ---- the walls (the shell's — the outer ones, the court of honour's — and the inside's), with what opens in them ----
    // (a wall from a to b on a storey, centred on that line; ops: its openings, each at a point of the line)
    const wall = (lv, a, b, tw, h, kind, o) => { const w = Object.assign({ lv, a: a.map(r2), b: b.map(r2), t: tw, h: r2(h), kind, outer: 0, casca: 0, ops: [] }, o || {}); R.walls.push(w); return w; };
    const win = (w, p, ww, hh, sill, o) => { w.ops.push(Object.assign({ k: 'janela', p: p.map(r2), w: ww, h: hh, sill }, o || {})); };
    const door = (w, p, ww, hh, kind, o) => { const d = Object.assign({ k: kind || 'porta', p: p.map(r2), w: ww, h: hh }, o || {}); w.ops.push(d); return d; };
    // (the windows of a room on a face: its span along the face [a, b], evenly — one each `each` metres —, but where a door of
    // that span stands (its middle at dm, dw wide); fixed at the risk, as the god paints them)
    const WIN = NO ? { w: 0.7, h0: 0.7, s0: 1.7, h1: 0.7, s1: 1.7, each: 4.5, tall: { w: 0.8, h: 0.9, s: 2.4 } }
      : EG || AZ ? { w: 0.9, h0: 1.1, s0: 2.8, h1: 1.2, s1: 1.6, each: 3.2, tall: { w: 1.0, h: 1.6, s: 6.6 } }
        : { w: 1.3, h0: 2.8, s0: 1.2, h1: 2.3, s1: 1.0, each: 3.0, tall: { w: 1.6, h: 5.0, s: 2.4 } };
    const winsAlong = (a, b, dm, dw) => { const len = b - a; const k = Math.max(1, Math.floor(len / WIN.each)); const out = [];
      for (let q = 0; q < k; q++) { const c = a + len * (q + 0.5) / k; if (dm !== undefined && Math.abs(c - dm) < dw / 2 + WIN.w / 2 + 0.5) continue; if (c - WIN.w / 2 < a + 0.45 || c + WIN.w / 2 > b - 0.45) continue; out.push(r2(c)); } return out; };
    // the outer walls, storey by storey: the wing of state as high as the eaves, the others a storey each (and, the palace of
    // six, the front of its court the people's own: below)
    const cB = t / 2; const yb = r2(B[1] + cB), yf = r2(B[3] - cB), xl = r2(B[0] + cB), xr = r2(B[2] - cB); const cut = r2(C[1] - tc / 2);
    const hOf = lv => (two ? (lv ? H1 : H0) : Hw);
    const outer = (lv, a, b, h, sideName) => wall(lv, a, b, t, h, 'parede', { outer: 1, casca: 1, side: sideName });
    const oBack = outer(0, [B[0], yb], [B[2], yb], Hw, 'fundo');
    const oL = [outer(0, [xl, cut], [xl, B[1]], Hw, 'esquerda')], oR = [outer(0, [xr, B[1]], [xr, cut], Hw, 'direita')];
    const oF = [];
    for (let lv = 0; lv < (two ? 2 : 1); lv++) {
      oL.push(outer(lv, [xl, B[3]], [xl, cut], hOf(lv), 'esquerda')); oR.push(outer(lv, [xr, cut], [xr, B[3]], hOf(lv), 'direita'));
      if (big) oF.push(outer(lv, [B[2], yf], [B[0], yf], hOf(lv), 'frente'));
      else { oF.push(outer(lv, [C[0], yf], [B[0], yf], hOf(lv), 'frente'), outer(lv, [B[2], yf], [C[2], yf], hOf(lv), 'frente')); } // (to the court's edge: over the court wall's end)
    }
    // (their windows: each room's span on the face, the wing of state's tall ones)
    const tallWins = (w, a, b, at, along) => { for (const c of winsAlong(a, b)) win(w, along === 'u' ? [c, at] : [at, c], WIN.tall.w, WIN.tall.h, WIN.tall.s); };
    for (const id of [bAud, bThr, bCon]) { const r = R.rooms[id].r; tallWins(oBack, r[0], r[2], yb, 'u'); }
    tallWins(oL[0], BW[1], BW[3], xl, 'v'); tallWins(oR[0], BW[1], BW[3], xr, 'v');
    const wins2 = (w, lv, a, b, at, along, dm, dw) => { for (const c of winsAlong(a, b, dm, dw)) win(w, along === 'u' ? [c, at] : [at, c], WIN.w, lv ? WIN.h1 : WIN.h0, lv ? WIN.s1 : WIN.s0); };
    for (let lv = 0; lv < (two ? 2 : 1); lv++) {
      for (const id of wingRooms.esquerda[lv] || wingRooms.esquerda[0]) { const r = R.rooms[id].r; wins2(oL[1 + lv], lv, r[1], r[3], xl, 'v'); }
      for (const id of wingRooms.direita[lv] || wingRooms.direita[0]) { const r = R.rooms[id].r; wins2(oR[1 + lv], lv, r[1], r[3], xr, 'v'); }
      if (big) for (const id of wingRooms.frente[lv] || wingRooms.frente[0]) { const r = R.rooms[id].r; const isV = id === fVest; wins2(oF[lv], lv, r[0], r[2], yf, 'u', isV ? L / 2 : undefined, isV ? 3.2 : 0); }
      else { const l = wingRooms.esquerda[lv] || wingRooms.esquerda[0], rr = wingRooms.direita[lv] || wingRooms.direita[0]; const a = R.rooms[l[l.length - 1]].r, b = R.rooms[rr[rr.length - 1]].r; wins2(oF[2 * lv], lv, a[0], a[2], yf, 'u'); wins2(oF[2 * lv + 1], lv, b[0], b[2], yf, 'u'); }
    }
    // the main door of the colossal: in the front wing's face behind the porch — 3 × 4.2 m under the upper storey's floor, in the
    // portal's frame the god paints round it (the Norse's 2.4 × 3.4, under its low eaves) —, the way from the court of honour to the
    // vestibule
    if (big) { const dw = NO ? 2.4 : 3.0, dh = NO ? 3.4 : 4.2; R.mainDoor = door(oF[0], [L / 2, yf], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) }; }
    // ---- the front of the open court (the palace of six) or of the court of honour (the colossal): the people's own, with the
    // street's gate where the flight comes up ----
    const gw = NO ? 3.0 : EG ? 4.0 : sw; // (the gate: the flight's width where nothing stands in it — a balustrade's, a colonnade's bay)
    if (!big) {
      if (!NO && !EG) {
        // the screen of columns across the court's front (the propylon): their middles 0.45 in, a bay of the flight's middle the gate
        const rc = 0.45; const n0 = Math.max(4, Math.round((C[2] - C[0]) / 2.5)); const pts = []; for (let q = 0; q <= n0; q++) pts.push([r2(C[0] + rc + (C[2] - C[0] - 2 * rc) * q / n0), r2(Vp - rc)]);
        R.cols.push({ pts, rc, h: r2(Hw - 2.6), y0: Hp, front: 1, rua: Math.floor(n0 / 2) });
        R.gate = { u: L / 2, v: Vp, w: r2((C[2] - C[0] - 2 * rc) / n0 - 2 * rc) };
      } else {
        // the pylon's wall (the Egyptian's) or the palisade (the Norse's) across the court's front, its gate in the middle
        const fh = NO ? 3.0 : 4.2, ft = 0.3; const fw = wall(0, [C[2], r2(Vp - ft / 2)], [C[0], r2(Vp - ft / 2)], ft, fh, 'parede', { outer: 1, casca: 1, side: 'frente' });
        R.gateD = door(fw, [L / 2, r2(Vp - ft / 2)], gw, NO ? 2.8 : 3.6, 'portao', { rua: 1 }); R.gate = { u: L / 2, v: Vp, w: gw };
      }
    } else {
      // the colossal's court of honour on the podium: its balustrade (the Norse's palisade, the Egyptian's wall of the pylon) round
      // its sides and front, the gate at the flight's top; the porch's columns along its back
      const Y = yard; const fh = NO ? 3.0 : EG ? 4.2 : 1.0, ft = 0.3, fk = 'cerca'; const c2 = ft / 2; R.yardH = fh;
      wall(0, [r2(Y[0] + c2), Y[1]], [r2(Y[0] + c2), Y[3]], ft, fh, fk, { outer: 1, casca: 1, yard: 1 });
      wall(0, [r2(Y[2] - c2), Y[3]], [r2(Y[2] - c2), Y[1]], ft, fh, fk, { outer: 1, casca: 1, yard: 1 });
      const g0 = r2(L / 2 - gw / 2), g1 = r2(L / 2 + gw / 2);
      if (NO || EG) { const fw = wall(0, [Y[2], r2(Y[3] - c2)], [Y[0], r2(Y[3] - c2)], ft, fh, fk, { outer: 1, casca: 1, yard: 1 }); R.gateD = door(fw, [L / 2, r2(Y[3] - c2)], gw, NO ? 2.8 : 3.6, 'portao', { rua: 1 }); }
      else {
        wall(0, [g0, r2(Y[3] - c2)], [Y[0], r2(Y[3] - c2)], ft, fh, fk, { outer: 1, casca: 1, yard: 1 }); wall(0, [Y[2], r2(Y[3] - c2)], [g1, r2(Y[3] - c2)], ft, fh, fk, { outer: 1, casca: 1, yard: 1 });
        // (the gate: an opening of the flight's width in a wall of no height along the podium's edge — the pyramid platform's way)
        const bw = wall(0, [g1, r2(Y[3] - 0.05)], [g0, r2(Y[3] - 0.05)], 0.1, 0, 'borda', { outer: 1, casca: 1, yard: 1 }); R.gateD = door(bw, [L / 2, r2(Y[3] - 0.05)], gw, 2.2, 'vao', { rua: 1 });
      }
      R.gate = { u: L / 2, v: Y[3], w: gw };
      if (porch) { const rc = NO ? 0.3 : 0.45; const k = Math.max(4, Math.round((porch[2] - porch[0]) / 2.85)); const pts = []; for (let q = 0; q <= k; q++) pts.push([r2(porch[0] + rc + (porch[2] - porch[0] - 2 * rc) * q / k), r2(porch[3] - rc)]); R.cols.push({ pts, rc, h: r2(Hw - 0.8), y0: Hp, porch: 1 }); }
    }
    // ---- the inside's walls: the court's (the wing of state's as high as the eaves, the others a storey each), the partitions,
    // and their doors — one into each room on the ground from the court, the throne hall's a portal; between the rooms of a wing ----
    const inner = (lv, a, b, tw, h, kind) => wall(lv, a, b, tw, h, kind || 'parede');
    const backW = inner(0, [I[0], cut], [I[2], cut], tc, Hw);
    R.backW = backW;
    const lc = r2(C[0] - tc / 2), rc2 = r2(C[2] + tc / 2), fc = big ? r2(C[3] + tc / 2) : null;
    const sideW = { esquerda: [], direita: [] }, frontW = [];
    for (let lv = 0; lv < (two ? 2 : 1); lv++) {
      sideW.esquerda.push(inner(lv, [lc, C[1]], [lc, sideEnd], tc, hOf(lv))); sideW.direita.push(inner(lv, [rc2, sideEnd], [rc2, C[1]], tc, hOf(lv)));
      if (big) frontW.push(inner(lv, [I[2], fc], [I[0], fc], tc, hOf(lv)));
    }
    // (the court's doors: the throne hall's portal in the middle of its front; each ground room on the court, at its middle)
    R.throneDoor = door(backW, [L / 2, cut], NO ? 2.0 : 2.4, NO ? 3.0 : 4.2, NO ? 'porta' : 'portal');
    const courtDoor = (w, id, along, at) => { const r = R.rooms[id].r; const a = along === 'u' ? Math.max(r[0], C[0]) : Math.max(r[1], C[1]), b = along === 'u' ? Math.min(r[2], C[2]) : Math.min(r[3], C[3]); if (b - a < 1.6) return null; const c = r2((a + b) / 2); return door(w, along === 'u' ? [c, at] : [at, c], 1.2, DOOR_H, 'porta'); };
    if (big || mid) { courtDoor(backW, bAud, 'u', cut); courtDoor(backW, bCon, 'u', cut); } // (the halls of audience and of the council, from the court)
    for (const id of wingRooms.esquerda[0]) courtDoor(sideW.esquerda[0], id, 'v', lc);
    for (const id of wingRooms.direita[0]) courtDoor(sideW.direita[0], id, 'v', rc2);
    if (big) for (const id of wingRooms.frente[0]) { if (id === fVest) door(frontW[0], [L / 2, fc], 2.4, 4.2, 'portal'); else if (R.rooms[id].court) courtDoor(frontW[0], id, 'u', fc); }
    // (the court's windows: the wing of state's tall ones beside the throne hall's portal and on the side halls; the wings' upper
    // storey; the ground's beside each door)
    for (const id of [bAud, bThr, bCon]) { const r = R.rooms[id].r; const a = Math.max(r[0], C[0]), b = Math.min(r[2], C[2]); if (b - a < 2) continue;
      for (const c of winsAlong(a, b, id === bThr ? L / 2 : big || mid ? (a + b) / 2 : undefined, id === bThr ? 2.6 : big || mid ? 1.2 : 0)) win(backW, [c, cut], WIN.tall.w, WIN.tall.h, WIN.tall.s); }
    for (let lv = 0; lv < (two ? 2 : 1); lv++) {
      for (const [side, at] of [['esquerda', lc], ['direita', rc2]]) for (const id of wingRooms[side][lv] || []) { const r = R.rooms[id].r; const a = Math.max(r[1], C[1]), b = Math.min(r[3], C[3]); if (b - a < 2) continue; wins2(sideW[side][lv], lv, a, b, at, 'v', lv ? undefined : (a + b) / 2, lv ? 0 : 1.2); }
      if (big) for (const id of wingRooms.frente[lv] || []) { const r = R.rooms[id].r; const a = Math.max(r[0], C[0]), b = Math.min(r[2], C[2]); if (b - a < 2) continue; wins2(frontW[lv], lv, a, b, fc, 'u', lv ? undefined : (a + b) / 2, lv ? 0 : (id === fVest ? 2.4 : 1.2)); }
    }
    // (the partitions: across the wing of state either side of the throne hall — its doors to the side halls near its front —; across
    // the side wings between their rooms, on each storey; along the front wing between its rooms)
    const tvd = r2(BW[3] - 2.2);
    for (const x of [r2(hall[0] - ti / 2), r2(hall[1] + ti / 2)]) { const w = inner(0, [x, BW[1]], [x, BW[3]], ti, Hw, 'divisoria'); door(w, [x, tvd], 1.2, NO ? DOOR_H : 3.2, 'porta'); }
    for (let lv = 0; lv < (two ? 2 : 1); lv++) for (const side of ['esquerda', 'direita']) {
      const ids = wingRooms[side][lv] || []; const W = side === 'esquerda' ? LW : RW;
      for (let q = 0; q + 1 < ids.length; q++) { const v = r2((R.rooms[ids[q]].r[3] + R.rooms[ids[q + 1]].r[1]) / 2); const w = inner(lv, [W[0], v], [W[2], v], ti, hOf(lv), 'divisoria');
        // (on the ground each opens on the court — no door between them; above, one into the next, by the outer wall)
        if (lv) door(w, [r2(side === 'esquerda' ? W[0] + 1.0 : W[2] - 1.0), v], 0.9, DOOR_H, 'porta'); }
    }
    if (big) for (let lv = 0; lv < (two ? 2 : 1); lv++) {
      const ids = wingRooms.frente[lv] || []; for (let q = 0; q + 1 < ids.length; q++) { const u = r2((R.rooms[ids[q]].r[2] + R.rooms[ids[q + 1]].r[0]) / 2); const w = inner(lv, [u, FW[1]], [u, FW[3]], ti, hOf(lv), 'divisoria');
        // (the stair's room and the treasury, at the ends, open into the guard beside them; the guard rooms into the vestibule;
        // above, each into the next, by the front wall)
        door(w, [u, r2(lv ? FW[3] - 1.0 : (FW[1] + FW[3]) / 2)], 0.9, DOOR_H, 'porta'); }
      // (the corners: the side wings' front rooms into the front wing's ends — the stair's room, the treasury —, through the
      // front wing's court wall where it runs on to the outer walls)
      door(frontW[lv], [r2((I[0] + C[0] - tc) / 2), fc], 0.9, DOOR_H, 'porta'); door(frontW[lv], [r2((C[2] + tc + I[2]) / 2), fc], 0.9, DOOR_H, 'porta');
    }
    // ---- the stairs up (two storeys): along the outer wall of the stair's room — the colossal's at the front wing's left end, up
    // toward the court; the palace of six's in each side wing's front room, up toward the back: its side wings' chambers are
    // reached each by its own, the wing of state between them a storey high ----
    if (two) {
      const run2 = STAIR.run, w2 = STAIR.w;
      if (big) { const r = R.rooms[wingRooms.frente[0][0]].r; const v0 = r2(r[3] - 0.05 - w2), u0 = r2(r[0] + 0.75); R.stairs.push({ lv0: 0, lv1: 1, r: [u0, v0, r2(u0 + run2), r2(r[3] - 0.05)], du: 1, dv: 0 }); }
      else for (const side of ['esquerda', 'direita']) { const ws = wingRooms[side][0]; const r = R.rooms[ws[ws.length - 1]].r; const u0 = side === 'esquerda' ? r2(r[0] + 0.05) : r2(r[2] - 0.05 - w2), v1 = r2(r[3] - STAIR.foot); R.stairs.push({ lv0: 0, lv1: 1, r: [u0, r2(v1 - run2), r2(u0 + w2), v1], du: 0, dv: -1 }); }
      for (const s of R.stairs) s.hole = s.r.slice();
    }
    // ---- the pieces on the floors of the courts: the court's fountain (where one drinks) and what stands in the courts — the
    // cypresses, the palms, the statues on their pedestals, the pylon's towers, the braziers —: solid, as the god paints them ----
    const cu = r2((courtR[0] + courtR[2]) / 2), cv = r2((courtR[1] + courtR[3]) / 2);
    R.fonte = { c: [cu, cv], r: big ? 1.4 : 1.1, y1: r2(Hp + 0.6) };
    const solid = (room2, r, h, k, o) => R.pieces.push(Object.assign({ room: room2, r: r.map(r2), h: r2(h), k }, o || {}));
    const cor = (dx, dy) => [r2(dx < 0 ? courtR[0] + 0.9 : courtR[2] - 0.9), r2(dy < 0 ? courtR[1] + 0.9 : courtR[3] - 0.9)]; // (in the corners, off the doors in the middle of the rooms)
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { if (!big && dy > 0 && !NO) continue; const [x, y] = cor(dx, dy); solid(cRoom, [x - 0.4, y - 0.4, x + 0.4, y + 0.4], EG ? 7.5 : NO ? 1.1 : AZ ? 1.0 : 4.8, EG ? 'palmeira' : NO ? 'pedra' : AZ ? 'braseiro' : 'cipreste'); }
    if (EG) { // (the pylon's towers either side of the gate, in the front corners of the court — the colossal's of honour)
      const Y = big ? yard : courtR; const fy = big ? r2(yard[3] - 0.3) : r2(Vp - 0.3); const d = big ? 3.0 : 2.4; const g0 = r2(L / 2 - gw / 2 - 0.05), g1 = r2(L / 2 + gw / 2 + 0.05);
      const tw = big ? 9.0 : Math.min(4.6, r2(g0 - Y[0] - 0.1)); R.towers = [[r2(g0 - tw), r2(fy - d), g0, fy], [g1, r2(fy - d), r2(g1 + tw), fy]];
      for (const r of R.towers) solid(big ? yRoom : cRoom, r, big ? 14 : 11, 'torre');
    }
    if (big && !EG) for (const s of [-1, 1]) { const x = r2(L / 2 + s * (sw / 2 + (NO ? 2.0 : 2.6))), y = r2(yard[3] - 2.0), q = AZ ? 0.4 : 0.7; // (the Aztec's palms, as the god stands them before its court palaces)
      solid(yRoom, [r2(x - q), r2(y - q), r2(x + q), r2(y + q)], NO ? 1.0 : AZ ? 7.5 : 4.6, NO ? 'braseiro' : AZ ? 'palmeira' : 'estatua'); }
    if (big && EG) for (const s of [-1, 1]) { const x = r2(L / 2 + s * 4.5), y = r2(yard[1] + 2.6); solid(yRoom, [r2(x - 0.45), r2(y - 0.45), r2(x + 0.45), r2(y + 0.45)], 16, 'obelisco'); }
    // ---- the shell's numbers for the plan ----
    // ---- the roofs: one over each wing, along it — the Greek's gables and the Roman's hips over the cornice of the columns'
    // stone, the Norse's turf (the great hall's steeper), the Egyptian's and the Aztec's flat —: the god paints them, and the
    // plan's roof is these, a roof a wing, never one round the court (E) ----
    const wEnd = big ? C[3] : B[3]; const wingR = [['fundo', [B[0], B[1], B[2], C[1]]], ['esquerda', [B[0], C[1], C[0], wEnd]], ['direita', [C[2], C[1], B[2], wEnd]]]; if (big) wingR.push(['frente', [B[0], C[3], B[2], B[3]]]);
    const cornice = NO || EG || AZ ? 0 : 0.7;
    R.alas = wingR.map(([lado, r]) => { const across = lado === 'fundo' || lado === 'frente'; const d = across ? r[3] - r[1] : r[2] - r[0];
      return { lado, r: r.map(r2), ao: across ? 'u' : 'v', y0: r2(eave + cornice), h: EG || AZ ? 0 : NO ? (lado === 'fundo' ? 6.4 : 3.6) : r2(Math.min(3.4, d * (RO ? 0.27 : 0.24))), ov: NO ? 0.5 : EG || AZ ? 0 : 0.3 }; });
    R.roof = { kind: NO ? 'turfa' : EG || AZ ? 'plano' : RO ? 'quatro-aguas' : 'duas-aguas', h: Math.max(...R.alas.map(a => a.h)), over: R.alas[0].ov, cornice };
    R.mat = NO ? 'tabua' : EG ? 'adobe-caiado' : AZ ? 'adobe-estuque' : RO ? 'reboco' : 'adobe-caiado';
    return R;
  }
  Fo.risco = risco; // (for the proofs: the risk of a palace, outside its form)

  // ------------------------------ the outside, painted from the risk ------------------------------
  // the wings as blocks of the people's walls from the podium to the eaves — the Greek's and the Roman's under the cornice of
  // columns' stone and the roofs along each wing (the Roman's hips, the Greek's gables), the Egyptian's flat under the two painted
  // bands, the Norse's of planks under the steep turf, the great hall's gables with their dragons —; the windows and the doors the
  // risk opens on the outer faces and the court's; the porch, the screen of columns, the pediment; the flight; the court of
  // honour's balustrade or wall, its statues, braziers, obelisks; the pylon's towers; the court's fountain and its trees
  function palaceEls(R) {
    const { L, Hp, eave, B, C, t, tc, NO, EG, RO, big } = R; const AZ = R.st === 'asteca'; const els = [];
    const bloco = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(r2), y0: r2(y0), y1: r2(y1), cor }, o || {});
    // the podium, its flight (the plan's numbers kept on it)
    els.push(bloco(R.podium, 0, Hp, BASE, { mat: 'base', palacio: R }));
    if (AZ) els.push({ k: 'faixa', r: R.podium.slice(), y0: r2(Hp - 0.4), y1: r2(Hp - 0.12), cor: 'trim' }); // (the Aztec's frieze along the platform's top, as the god's pyramids have it)
    for (const q of R.treads) els.push(bloco(q.r, 0, q.y, BASE, { mat: 'base', degrau: 1 }));
    // the wings: the wing of state, the sides, the front (the court between them)
    const sideEnd = big ? C[3] : B[3]; const cut = C[1];
    const wings = [['fundo', [B[0], B[1], B[2], cut]], ['esquerda', [B[0], cut, C[0], sideEnd]], ['direita', [C[2], cut, B[2], sideEnd]]];
    if (big) wings.push(['frente', [B[0], C[3], B[2], B[3]]]);
    const tabuas = NO ? { tabuas: 7 } : {};
    for (const [side, r] of wings) els.push(bloco(r, Hp, eave, WALL, Object.assign({ mat: 'parede', ala: side }, tabuas)));
    // (the court's pavement, a hand over the podium; the court of honour's)
    els.push(bloco(C, Hp, r2(Hp + 0.05), EG ? ['#e8dcb4', '#e8dcb4', '#e8dcb4'] : NO ? ['#86a84e', '#86a84e', '#86a84e'] : ['#e4dccb', '#e4dccb', '#e4dccb'], { mat: NO ? 'turf' : 'slab', piso: 1 }));
    if (R.yard) els.push(bloco(R.yard, Hp, r2(Hp + 0.05), EG ? ['#e8dcb4', '#e8dcb4', '#e8dcb4'] : NO ? ['#86a84e', '#86a84e', '#86a84e'] : ['#d8cbb0', '#d8cbb0', '#d8cbb0'], { mat: NO ? 'turf' : 'slab', piso: 1 }));
    // the crown of the walls and the roofs
    let roofTop = eave;
    if (!EG && !NO && !AZ) {
      const ent = 0.7; // (the cornice: the stone of the columns over the walls, 0.12 out)
      for (const [, r] of wings) els.push(bloco([r[0] - 0.12, r[1] - 0.12, r[2] + 0.12, r[3] + 0.12], eave, eave + ent, COL, { mat: 'slab' }));
      const y0 = r2(eave + ent);
      for (const a of R.alas) { els.push({ k: 'telhado', r: a.r.slice(), y0, y1: r2(y0 + a.h), ao: a.ao, ov: a.ov, cor: ROOF, quatro: RO ? true : undefined }); roofTop = Math.max(roofTop, y0 + a.h); }
    } else if (EG || AZ) { // (the Egyptian's and the Aztec's flat roofs under their two painted bands, as the god draws their palaces)
      for (const [, r] of wings) els.push({ k: 'faixa', r: r.map(r2), y0: r2(eave - 1.3), y1: r2(eave - 0.7), cor: 'trim' }, { k: 'faixa', r: r.map(r2), y0: r2(eave - 0.7), y1: r2(eave - 0.25), cor: 'trim2' },
        bloco([r[0] - 0.15, r[1] - 0.15, r[2] + 0.15, r[3] + 0.15], eave, r2(eave + 0.45), ['top', 'top', 'top'], { mat: 'slab' }));
      // (the Aztec's crests along the wing of state's parapet over the court, each with its green plume — gilded on the colossal's)
      if (AZ) { const gold = big ? ['#f2c14e', '#d8a63a', '#f2c14e'] : ['acc', 'acc', 'acc']; const z0 = r2(eave + 0.45), v = r2(cut - 0.2);
        for (let k = -2; k <= 2; k++) { const u = r2(L / 2 + k * 2.6); els.push(bloco([r2(u - 0.2), r2(v - 0.08), r2(u + 0.2), r2(v + 0.08)], z0, r2(z0 + 1.2), gold, { mat: 'slab' }), { k: 'bola', c: [u, v, r2(z0 + 1.6)], r: 0.16, ry: 0.7, cor: '#2fae8f' }); } }
    } else {
      for (const a of R.alas) { els.push({ k: 'telhado', r: a.r.slice(), y0: eave, y1: r2(eave + a.h), ao: a.ao, ov: a.ov, cor: ROOF, mat: 'turf' }); roofTop = Math.max(roofTop, eave + a.h); }
      // (the great hall's dragons at its gables, its three shields on the court's face)
      const yr = r2(eave + 6.4); els.push({ k: 'dragao', p: [r2(B[0] - 0.5), r2((B[1] + cut) / 2), yr], dir: -1, cor: '#3a2616' }, { k: 'dragao', p: [r2(B[2] + 0.5), r2((B[1] + cut) / 2), yr], dir: 1, cor: '#3a2616' });
      for (const du of [-4, 0, 4]) els.push({ k: 'disco', na: 'frente', u: r2(L / 2 + du), v: r2(cut + 0.02), y: r2(Hp + 3.3), r: 0.55, cor: '#a23c2a' });
    }
    // the windows and the doors on the outer faces and the court's (the face each looks to: the risk's walls, by their side)
    const face = w => { const along = Math.abs(w.a[1] - w.b[1]) < 1e-6; const line = along ? w.a[1] : w.a[0];
      if (w.outer) return along ? (line < L / 2 ? ['fundo', r2(line - w.t / 2)] : ['frente', r2(line + w.t / 2)]) : (line < L / 2 ? ['esquerda', r2(line - w.t / 2)] : ['direita', r2(line + w.t / 2)]);
      if (w.kind !== 'parede') return null;
      // (a court wall: the face toward the court)
      return along ? (line < (C[1] + C[3]) / 2 ? ['frente', r2(line + w.t / 2)] : ['fundo', r2(line - w.t / 2)]) : (line < (C[0] + C[2]) / 2 ? ['direita', r2(line + w.t / 2)] : ['esquerda', r2(line - w.t / 2)]); };
    const yOf = lv => (lv ? r2(Hp + R.H0) : Hp);
    for (const w of R.walls) {
      if (w.yard || !w.ops.length) continue; const f = face(w); if (!f) continue; const along = Math.abs(w.a[1] - w.b[1]) < 1e-6;
      for (const o of w.ops) {
        const c = along ? o.p[0] : o.p[1];
        if (o.k === 'janela') els.push({ k: 'janelas', na: f[0], em: f[1], de: r2(c - o.w / 2), ate: r2(c + o.w / 2), y0: r2(yOf(w.lv) + o.sill), y1: r2(yOf(w.lv) + o.sill + o.h), n: 0 });
        else if (f[0] === 'frente' && o.k !== 'vao') els.push({ k: 'porta', na: 'frente', v: f[1], u: r2(c), w: o.w, y0: yOf(w.lv), y1: r2(yOf(w.lv) + o.h), cor: o.k === 'portal' ? (EG ? '#3e2e1c' : 'door') : 'door' });
      }
    }
    // the columns: the porch's along the colossal's front, the screen across the palace's court — under their entablature
    const pap = EG ? { h: 1.2, r: 0.95, cor: 'acc2' } : null;
    for (const c of R.cols) {
      els.push({ k: 'colunata', pts: c.pts, r: c.rc, y0: c.y0, y1: r2(c.y0 + c.h), cor: ['col0', 'col1'], papiro: pap || undefined });
      const u0 = c.pts[0][0] - c.rc - 0.1, u1 = c.pts[c.pts.length - 1][0] + c.rc + 0.1, v0 = c.porch ? B[3] : c.pts[0][1] - c.rc - 0.1, v1 = c.pts[0][1] + c.rc + 0.1;
      const top = c.porch ? r2(eave + (EG ? 0.45 : 0.7)) : r2(c.y0 + c.h + 0.9);
      els.push(bloco([u0, v0, u1, v1], r2(c.y0 + c.h), top, EG ? ['top', 'top', 'top'] : COL, { mat: 'slab' }));
      // (the screen at the podium's edge: a balustrade of a metre between its columns over the drop, but in the gate's bay)
      if (c.front) for (let k = 0; k + 1 < c.pts.length; k++) { const a = c.pts[k][0] + c.rc, b = c.pts[k + 1][0] - c.rc; if (a < L / 2 && b > L / 2) continue;
        els.push(bloco([a, c.pts[k][1] - 0.15, b, c.pts[k][1] + 0.15], c.y0, r2(c.y0 + 1.0), PAR, { mat: 'slab' })); }
      if (!EG && !NO && !AZ) { // (the pediment over the middle: the gable across the way in, the gilded round in it)
        const pw = c.porch ? 15 : (u1 - u0) * 0.7, pu0 = r2(L / 2 - pw / 2), pu1 = r2(L / 2 + pw / 2); const ph = c.porch ? 3.4 : 2.0;
        els.push({ k: 'telhado', r: [pu0, r2(v0), pu1, r2(v1)], y0: top, y1: r2(top + ph), ao: 'v', ov: 0.2, cor: ROOF },
          { k: 'disco', na: 'frente', u: r2(L / 2), v: r2(v1 + 0.05), y: r2(top + ph * 0.38), r: c.porch ? 0.7 : 0.45, cor: '#f2c14e' });
        roofTop = Math.max(roofTop, top + ph);
      }
    }
    // the Roman's dome over the throne hall: its drum out of the roof, the dome, its gilded top
    if (RO) { const yc = r2((B[1] + R.backW.a[1]) / 2); const rd = big ? 4.4 : 3.6; const z0 = r2(eave + 0.7), z1 = r2(z0 + 3.0), z2 = r2(z1 + rd * 1.05);
      els.push({ k: 'coluna', c: [r2(L / 2), yc], r: rd, y0: z0, y1: z1, cor: ['wl', 'wr'], mat: 'parede' }, { k: 'morro', c: [r2(L / 2), yc], r: rd, y0: z1, y1: z2, cor: ['#d8c8a8', '#a8987a'], liso: 1, mat: 'slab' },
        { k: 'bola', c: [r2(L / 2), yc, r2(z2 + 0.35)], r: 0.4, cor: '#e0b84a' }); roofTop = Math.max(roofTop, z2); }
    // the front of the court (the palace of six) or the court of honour (the colossal): the balustrade, the pylon's wall, the
    // palisade — what the risk's walls of them are —, the gate
    for (const w of R.walls) {
      if (!(w.yard || (w.outer && w.side === 'frente' && !big && w.h < R.Hw && (NO || EG) && Math.abs(w.a[1] - (R.Vp - 0.15)) < 0.01))) continue; if (w.kind === 'borda') continue;
      const r = [Math.min(w.a[0], w.b[0]) - (Math.abs(w.a[1] - w.b[1]) < 1e-6 ? 0 : w.t / 2), Math.min(w.a[1], w.b[1]) - (Math.abs(w.a[1] - w.b[1]) < 1e-6 ? w.t / 2 : 0), Math.max(w.a[0], w.b[0]) + (Math.abs(w.a[1] - w.b[1]) < 1e-6 ? 0 : w.t / 2), Math.max(w.a[1], w.b[1]) + (Math.abs(w.a[1] - w.b[1]) < 1e-6 ? w.t / 2 : 0)];
      const gate = w.ops.find(o => o.rua); const along = Math.abs(w.a[1] - w.b[1]) < 1e-6;
      const parts = gate ? [[r[0], r2(gate.p[0] - gate.w / 2)], [r2(gate.p[0] + gate.w / 2), r[2]]] : [[r[0], r[2]]];
      for (const [a, b] of along ? parts : [[r[0], r[2]]]) {
        const rr = along ? [a, r[1], b, r[3]] : r;
        if (NO) { // (the palisade: its pointed stakes, a little under a metre apart)
          const len = along ? rr[2] - rr[0] : rr[3] - rr[1]; const k = Math.max(1, Math.round(len / 0.8));
          for (let q = 0; q <= k; q++) { const p = along ? [r2(rr[0] + len * q / k), r2((rr[1] + rr[3]) / 2)] : [r2((rr[0] + rr[2]) / 2), r2(rr[1] + len * q / k)];
            els.push({ k: 'tora', a: [p[0], p[1], Hp], b: [p[0], p[1], r2(Hp + w.h - 0.4)], r: 0.14, cor: '#6a4a2c' }, { k: 'piramide', c: p, e: 0.12, y0: r2(Hp + w.h - 0.4), y1: r2(Hp + w.h + 0.3), cor: ['#6a4a2c', '#5a3c22'], mat: 'beam' }); }
        } else els.push(bloco(rr, Hp, r2(Hp + w.h), EG ? WALL : PAR, { mat: EG ? 'parede' : 'slab' }));
      }
      if (gate && NO) for (const s of [-1, 1]) { const u = r2(gate.p[0] + s * (gate.w / 2 + 0.2)); els.push({ k: 'tora', a: [u, gate.p[1], Hp], b: [u, gate.p[1], r2(Hp + 4.2)], r: 0.2, cor: '#5a3a22' }); }
    }
    // the pieces of the courts: the fountain, the trees, the statues and braziers, the obelisks, the pylon's towers
    const F = R.fonte; els.push({ k: 'bacia', c: F.c, r: F.r, t: r2(F.r * 0.16), y0: Hp, y1: F.y1, nivel: 0.05, cor: '#b8b0a0', agua: EG ? '#4aa0c8' : '#5aaed0', uso: 'fonte' });
    if (!EG && !NO) els.push({ k: 'coluna', c: F.c, r: 0.12, y0: Hp, y1: r2(Hp + 1.5), cor: ['#e0d8c8', '#c0b8a8'] });
    for (const p of R.pieces) {
      const c = [r2((p.r[0] + p.r[2]) / 2), r2((p.r[1] + p.r[3]) / 2)];
      if (p.k === 'cipreste') els.push({ k: 'bola', c: [c[0], c[1], r2(Hp + p.h * 0.5)], r: 0.45, ry: r2(p.h * 0.55), cor: '#2f5a2a', mat: 'turf' });
      else if (p.k === 'palmeira') els.push({ k: 'palmeira', p: [c[0], c[1], Hp], h: r2(p.h - 0.6), s: 1.4 });
      else if (p.k === 'pedra') els.push({ k: 'pedra', c, e: 0.4, e1: 0.3, y0: Hp, y1: r2(Hp + p.h), cai: [0.04, 0.04], cor: ['#8e877b', '#6f6a60'], cobra: '#a23c2a' });
      else if (p.k === 'estatua') els.push(bloco(p.r, Hp, r2(Hp + 1.0), BASE, { mat: 'base' }), { k: 'estatua', p: [c[0], c[1], r2(Hp + 1.0)], h: 3.6, w: 0.5, cor: '#e8e0d0' });
      else if (p.k === 'braseiro') els.push(bloco(p.r, Hp, r2(Hp + 0.7), BASE, { mat: 'base' }), { k: 'braseiro', p: [c[0], c[1], r2(Hp + 0.7)], r: 0.45 });
      else if (p.k === 'obelisco') els.push({ k: 'talude', r: p.r, r1: [p.r[0] + 0.18, p.r[1] + 0.18, p.r[2] - 0.18, p.r[3] - 0.18].map(r2), y0: Hp, y1: r2(Hp + p.h - 1.2), cor: ['#d8c494', '#b8a67e', '#d8c494'], mat: 'base' },
        { k: 'piramide', c, e: 0.27, y0: r2(Hp + p.h - 1.2), y1: r2(Hp + p.h), cor: ['#f2c14e', '#d8a63a'], mat: 'slab' });
      else if (p.k === 'torre') { const b = 0.5; els.push({ k: 'talude', r: p.r, r1: [p.r[0] + b, p.r[1] + b, p.r[2] - b, p.r[3] - b].map(r2), y0: Hp, y1: r2(Hp + p.h), cor: WALL, mat: 'parede' },
        { k: 'faixa', r: [p.r[0] + 0.45, p.r[1] + 0.45, p.r[2] - 0.45, p.r[3] - 0.45].map(r2), y0: r2(Hp + p.h - 1.6), y1: r2(Hp + p.h - 0.6), cor: 'trim' },
        { k: 'bandeira', p: [r2((p.r[0] + p.r[2]) / 2), r2(p.r[3] + 0.3), Hp], h: r2(p.h + 6), cor: '#e8b83a' }); roofTop = Math.max(roofTop, Hp + p.h); }
    }
    // (the pylon's lintel over its gate, between the towers)
    if (R.towers) { const [a, b] = R.towers; els.push(bloco([a[2], a[1], b[0], a[3]], r2(Hp + (big ? 9.0 : 7.4)), r2(Hp + (big ? 10.6 : 8.6)), WALL, { mat: 'parede' })); }
    // the flags on the wing of state's roof
    els.push({ k: 'bandeira', p: [r2(L / 2), r2(B[1] + 1.0), r2(roofTop)], h: 5, cor: NO ? '#a23c2a' : EG ? '#e8b83a' : AZ ? '#2fae8f' : 'acc2' });
    return els;
  }
  const palaceForm = st => (L, n) => { const R = risco(st, n); return { els: palaceEls(R), door: R.doorD || { u: R.gate.u, w: R.gate.w, y0: R.Hp, y1: r2(R.Hp + 2.6) } }; };
  for (const st of ['grego', 'romano', 'egipcio', 'nordico', 'asteca', 'classico']) {
    Fo.def('palacio', st, palaceForm(st), [6]);
    Fo.def('grande_palacio', st, palaceForm(st), [8]);
    Fo.def('palacio_colossal', st, palaceForm(st), [10]);
  }

  // ------------------------------ the temples (templo 4, grande templo 6, santuário monumental 8) ------------------------------
  // The temple of a town is its people's own, as the god draws the village shrine, grown to the town and to the body's scale:
  // the Greek's peripteros on its crepidoma in the temenos — the balustrade of the precinct round the platform, the court before
  // the temple where the faithful stand and the altars burn, the olives and the votive statues at its sides, the colonnade all
  // round the cella, the porch of two columns between the antae, the nave behind its portal with the god's image at its back —;
  // the Roman's on its high podium — the flight across the front, the deep porch of free columns, the cella of engaged columns,
  // the terraces either side behind the parapet, its statues —; the Egyptian's behind its pylon — the towers and the gate, the
  // open court with its papyrus columns, the hypostyle hall of two rows, the sanctuary at the back between its two chambers —;
  // the Norse's hof of staves — the garth before it in its palisade with the stone altar and the fires, the gallery round three
  // sides under the skirt roof, the hall of the god with its two rows of posts, the steep roof with its dragons and the tower
  // and spire of the great ones —; the Aztec's pyramid of levels — the stair set into its front between its ramps, as steep as
  // the feet climb (0.25 on 0.30), the shrine across the back of its top under its painted band and its crest, the forecourt
  // before it behind its parapet, the braziers —; the classical people's the Greek's, as the god draws it. The risk below is
  // that one definition (D-110): the god paints its outside, the plan
  // (int-palacio.js, templeByForm, the family forma.templo) lays out its walls, rooms, doors, columns, courts and pieces from the
  // same numbers, kept on the platform's element (e.risco). Metres as the palace's (u across, v from the back, y over the lot)
  function riscoTemplo(st, n) {
    const L = n * TILE, k = n >= 8 ? 2 : n >= 6 ? 1 : 0; const pick = a => a[k];
    const GR = st === 'grego' || st === 'classico', RO = st === 'romano', EG = st === 'egipcio', NO = st === 'nordico', AZ = st === 'asteca'; // (the classical people's the Greek's, as the god draws it)
    // ---- the platform and its flight from the street: risers of 0.25 m, its foot at the lot's edge ----
    const e = pick([0.3, 0.35, 0.4]);
    const Hp = GR ? pick([0.75, 1.0, 1.5]) : RO ? pick([1.5, 2.25, 3.0]) : EG ? pick([0.5, 0.75, 1.0]) : AZ ? pick([3.0, 4.5, 6.0]) : 0.5;
    const nr = Math.round(Hp / 0.25), td = EG || NO ? 0.45 : AZ ? 0.3 : 0.42; const Vp = r2(L - e - (nr - 1) * td);
    const sw = GR ? pick([3.0, 4.4, 6.0]) : RO ? pick([6.0, 9.6, 13.2]) : EG ? pick([3.0, 3.6, 4.4]) : AZ ? pick([3.2, 4.4, 6.0]) : pick([2.4, 3.0, 3.6]);
    const su0 = r2(L / 2 - sw / 2), su1 = r2(L / 2 + sw / 2);
    const treads = []; for (let q = 0; q < nr - 1; q++) treads.push({ r: [su0, r2(L - e - td * (q + 1)), su1, r2(L - e - td * q)], y: r2(Hp * (q + 1) / nr) });
    const R = { st, n, L, k, fam: 'forma.templo', GR, RO, EG, NO, AZ, Hp, nr, td, Vp, sw, su0, su1, treads, e, podium: [e, e, r2(L - e), Vp], stair: [su0, Vp, su1, r2(L - e)],
      walls: [], rooms: [], cols: [], annexes: [], pieces: [], fires: [], pray: [], stand: [], kneel: EG ? 1 : 0 };
    const room = (fn, r, o) => { R.rooms.push(Object.assign({ lv: 0, fn, r: r.map(r2), id: R.rooms.length }, o || {})); return R.rooms.length - 1; };
    const wall = (a, b, tw, h, kind, o) => { const w = Object.assign({ lv: 0, a: a.map(r2), b: b.map(r2), t: tw, h: r2(h), kind, outer: 0, casca: 0, ops: [] }, o || {}); R.walls.push(w); return w; };
    const door = (w, p, ww, hh, kind, o) => { const d = Object.assign({ k: kind || 'porta', p: p.map(r2), w: ww, h: hh }, o || {}); w.ops.push(d); return d; };
    const win = (w, p, ww, hh, sill) => { w.ops.push({ k: 'janela', p: p.map(r2), w: ww, h: hh, sill }); };
    const solid = (rm, r, h, kind, o) => { R.pieces.push(Object.assign({ room: rm, r: r.map(r2), h: r2(h), k: kind }, o || {})); };
    // (a line of columns from a to b, their middles `at` metres from a; the bays between them the ways through)
    const colLine = (a, b, at, rc, h, o) => { R.cols.push(Object.assign({ line: [a.map(r2), b.map(r2)], at: at.map(r2), rc, h: r2(h), y0: Hp }, o || {})); };
    const evenly = (len, rc, m) => Array.from({ length: m }, (_, q) => r2(rc + q * (len - 2 * rc) / (m - 1)));
    const fire = (rm, u, v, rr) => { R.fires.push({ room: rm, c: [r2(u), r2(v)], r: rr, pe: [r2(u - rr), r2(v - rr), r2(u + rr), r2(v + rr)], h: 0.9 }); };
    // (the precinct on the platform: its walls round it — the balustrade, the court's high walls, the palisade —, the back one
    // where it runs behind the temple, the front with the gate where the flight comes up: a wall of no height with an opening
    // of the flight's width — the Greek's and the Roman's, as the palace's court of honour —, or a gate in the front wall)
    const Y = [e, e, r2(L - e), Vp]; const ft = 0.3, c2 = ft / 2; const Yi = [r2(Y[0] + ft), r2(Y[1] + ft), r2(Y[2] - ft), r2(Y[3] - ft)];
    const precinct = (Yr, fh, back, gate) => {
      R.yard = Yr.slice(); R.yardH = fh; const o = { outer: 1, casca: 1, yard: 1 };
      wall([r2(Yr[0] + c2), Yr[1]], [r2(Yr[0] + c2), Yr[3]], ft, fh, 'cerca', o); wall([r2(Yr[2] - c2), Yr[3]], [r2(Yr[2] - c2), Yr[1]], ft, fh, 'cerca', o);
      if (back) wall([Yr[2], r2(Yr[1] + c2)], [Yr[0], r2(Yr[1] + c2)], ft, fh, 'cerca', o);
      const fy = r2(Yr[3] - c2);
      if (gate.k === 'vao') { const g0 = r2(L / 2 - gate.w / 2), g1 = r2(L / 2 + gate.w / 2);
        wall([g0, fy], [Yr[0], fy], ft, fh, 'cerca', o); wall([Yr[2], fy], [g1, fy], ft, fh, 'cerca', o);
        const bw = wall([g1, r2(Yr[3] - 0.05)], [g0, r2(Yr[3] - 0.05)], 0.1, 0, 'borda', o); R.gateD = door(bw, [L / 2, r2(Yr[3] - 0.05)], gate.w, 2.2, 'vao', { rua: 1 }); }
      else { const fw = wall([Yr[2], fy], [Yr[0], fy], ft, fh, 'cerca', o); R.gateD = door(fw, [L / 2, fy], gate.w, gate.h, 'portao', { rua: 1 }); }
      R.gate = { u: L / 2, v: Yr[3], w: gate.w };
    };
    const outerWalls = (Bc, tw, h, front) => { // (a block's walls of the people's stuff, its back, its sides and, where it shuts, its front)
      const out = { fundo: wall([Bc[0], r2(Bc[1] + tw / 2)], [Bc[2], r2(Bc[1] + tw / 2)], tw, h, 'parede', { outer: 1, casca: 1, side: 'fundo' }),
        esquerda: wall([r2(Bc[0] + tw / 2), Bc[3]], [r2(Bc[0] + tw / 2), Bc[1]], tw, h, 'parede', { outer: 1, casca: 1, side: 'esquerda' }),
        direita: wall([r2(Bc[2] - tw / 2), Bc[1]], [r2(Bc[2] - tw / 2), Bc[3]], tw, h, 'parede', { outer: 1, casca: 1, side: 'direita' }) };
      if (front) out.frente = wall([Bc[2], r2(Bc[3] - tw / 2)], [Bc[0], r2(Bc[3] - tw / 2)], tw, h, 'parede', { outer: 1, casca: 1, side: 'frente' });
      return out;
    };
    if (GR) {
      // ---- the Greek's: the stylobate in the temenos, the colonnade all round the cella ----
      const W = pick([9.0, 13.2, 18.0]), D = pick([11.2, 17.6, 24.8]), back = pick([0.9, 1.0, 1.0]);
      const T = [r2(L / 2 - W / 2), r2(Yi[1] + back), r2(L / 2 + W / 2), r2(Yi[1] + back + D)];
      const rc = pick([0.3, 0.38, 0.45]), p = pick([1.2, 1.5, 1.5]), tw = pick([0.4, 0.5, 0.6]), pd = pick([1.8, 2.4, 2.4]);
      const d0 = r2(2 * rc + p); const Bc = [r2(T[0] + d0), r2(T[1] + d0), r2(T[2] - d0), r2(T[3] - d0)];
      const Hc = pick([4.8, 6.6, 8.8]), He = pick([1.0, 1.3, 1.6]), Hw = r2(Hc + He);
      Object.assign(R, { T, B: Bc, t: tw, Hc, He, Hw, eave: r2(Hp + Hw) });
      precinct(Y, 1.0, true, { k: 'vao', w: sw });
      // the cella: its walls to the antae, the porch between them (two columns in it, the middle bay the way), the nave behind
      // its portal
      outerWalls(Bc, tw, Hw, false);
      const ant = [r2(Bc[0] + tw / 2), r2(Bc[2] - tw / 2)], la = r2(ant[1] - ant[0]);
      colLine([ant[1], r2(Bc[3] - rc)], [ant[0], r2(Bc[3] - rc)], [0, r2(la / 3), r2(2 * la / 3), la], rc, Hc, { outer: 1, door: 1, ante: 1, wh: Hw });
      const vF = r2(Bc[3] - pd - tw / 2); const front = wall([r2(Bc[0] + tw), vF], [r2(Bc[2] - tw), vF], tw, Hw, 'parede');
      const dw = pick([1.6, 2.4, 3.0]), dh = pick([3.2, 4.8, 6.0]); door(front, [L / 2, vF], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) }; R.vF = vF;
      // the peristyle: the walk round the cella under the roof, the columns at the stylobate's edge (the front's middle bay on the axis)
      const nf = pick([4, 6, 6]), ns = pick([5, 8, 8]);
      for (const r of [[T[0], Bc[3], T[2], T[3]], [T[0], T[1], T[2], Bc[1]], [T[0], Bc[1], Bc[0], Bc[3]], [Bc[2], Bc[1], T[2], Bc[3]]]) R.annexes.push({ r, h: Hc, fn: 'peristilo' });
      colLine([T[2], r2(T[3] - rc)], [T[0], r2(T[3] - rc)], evenly(W, rc, nf), rc, Hc, { peri: 1 });
      colLine([T[0], r2(T[1] + rc)], [T[2], r2(T[1] + rc)], evenly(W, rc, nf), rc, Hc, { peri: 1 });
      colLine([r2(T[0] + rc), T[1]], [r2(T[0] + rc), T[3]], evenly(D, rc, ns), rc, Hc, { peri: 1 });
      colLine([r2(T[2] - rc), T[3]], [r2(T[2] - rc), T[1]], evenly(D, rc, ns), rc, Hc, { peri: 1 });
      const c2r = r2(2 * rc);
      R.nave = room('nave', [r2(Bc[0] + tw), r2(Bc[1] + tw), r2(Bc[2] - tw), r2(vF - tw / 2)]);
      const pron = room('pronaos', [r2(Bc[0] + tw), r2(vF + tw / 2), r2(Bc[2] - tw), r2(Bc[3] - c2r)]);
      const pf = room('peristilo', [r2(T[0] + c2r), Bc[3], r2(T[2] - c2r), r2(T[3] - c2r)]);
      room('peristilo', [r2(T[0] + c2r), r2(T[1] + c2r), r2(T[2] - c2r), Bc[1]]); room('peristilo', [r2(T[0] + c2r), Bc[1], Bc[0], Bc[3]]); room('peristilo', [Bc[2], Bc[1], r2(T[2] - c2r), Bc[3]]);
      const court = room('terreiro', [Yi[0], T[3], Yi[2], r2(Y[3] - 0.1)], { open: 1 });
      const sl = room('terreiro', [Yi[0], Yi[1], T[0], T[3]], { open: 1 }), sr = room('terreiro', [T[2], Yi[1], Yi[2], T[3]], { open: 1 });
      room('terreiro', [T[0], Yi[1], T[2], T[1]], { open: 1 });
      R.sanct = R.nave; R.pray.push(R.nave); R.stand.push(court, pron, pf); R.courtRoom = court;
      // the altars' fires in the court either side of the way in; the cypresses and the votive statues of the precinct's sides
      for (const s of [-1, 1]) fire(court, L / 2 + s * (sw / 2 + 1.0), r2((T[3] + Yi[3]) / 2), 0.35);
      const m = pick([1, 2, 3]);
      for (const [rm, u0, u1] of [[sl, Yi[0], T[0]], [sr, T[2], Yi[2]]]) for (let q = 0; q < m; q++) {
        const v = r2(Yi[1] + 1.5 + (T[3] - Yi[1] - 3.0) * (m > 1 ? q / (m - 1) : 0.5)), u = r2((u0 + u1) / 2);
        solid(rm, [u - 0.4, v - 0.4, u + 0.4, v + 0.4], q % 2 ? 4.2 : 4.8, q % 2 ? 'estatua' : 'cipreste'); }
      R.roof = { kind: 'duas-aguas', along: 'v', h: r2(Math.min(4.2, W * 0.2)), over: 0.3 }; R.mat = 'reboco';
    } else if (RO) {
      // ---- the Roman's: the high podium, the deep porch, the cella ----
      const W = r2(L * 0.6), T0 = r2(L / 2 - W / 2), T2 = r2(L / 2 + W / 2);
      const fl = pick([0.6, 0.8, 1.0]), pd = pick([3.4, 5.0, 6.6]), tw = pick([0.5, 0.7, 0.8]), bm = pick([0.4, 0.5, 0.5]);
      const Pf = r2(Yi[3] - fl); const Bc = [T0, r2(Yi[1] + bm), T2, r2(Pf - pd)];
      const rc = pick([0.35, 0.45, 0.5]), Hc = pick([5.4, 7.6, 10.0]), He = pick([1.0, 1.4, 1.8]), Hw = r2(Hc + He);
      Object.assign(R, { T: [T0, Bc[1], T2, Pf], B: Bc, t: tw, Hc, He, Hw, eave: r2(Hp + Hw), Pf });
      precinct(Y, 1.0, true, { k: 'vao', w: sw });
      const ws = outerWalls(Bc, tw, Hw, true);
      const dw = pick([2.0, 2.6, 3.0]), dh = pick([3.6, 4.8, 6.0]); door(ws.frente, [L / 2, r2(Bc[3] - tw / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      // the porch: the free columns along its front, two or three down each side
      const nf = pick([4, 6, 6]), ms = pick([2, 3, 3]);
      R.annexes.push({ r: [T0, Bc[3], T2, Pf], h: Hc, fn: 'portico' });
      colLine([T2, r2(Pf - rc)], [T0, r2(Pf - rc)], evenly(W, rc, nf), rc, Hc, { porch: 1 });
      colLine([r2(T0 + rc), Pf], [r2(T0 + rc), Bc[3]], evenly(pd, rc, ms), rc, Hc, { porch: 1 });
      colLine([r2(T2 - rc), Bc[3]], [r2(T2 - rc), Pf], evenly(pd, rc, ms), rc, Hc, { porch: 1 });
      const c2r = r2(2 * rc);
      R.nave = room('nave', [r2(Bc[0] + tw), r2(Bc[1] + tw), r2(Bc[2] - tw), r2(Bc[3] - tw)]);
      const por = room('portico', [r2(T0 + c2r), Bc[3], r2(T2 - c2r), r2(Pf - c2r)]);
      const land = room('terreiro', [Yi[0], Pf, Yi[2], r2(Y[3] - 0.1)], { open: 1 });
      const tl = room('terreiro', [Yi[0], Yi[1], T0, Pf], { open: 1 }), tr = room('terreiro', [T2, Yi[1], Yi[2], Pf], { open: 1 });
      // (the porch's second row, behind the front's second and second-to-last columns; the terraces' fires and statues)
      if (k) { const at = evenly(W, rc, nf); for (const q of [1, nf - 2]) { const u = r2(T2 - at[q]), v = r2(Pf - rc - pick([0, 2.4, 3.0])); solid(por, [u - rc, v - rc, u + rc, v + rc], Hc, 'coluna', { rc }); } }
      for (const s of [-1, 1]) fire(s < 0 ? tl : tr, r2(L / 2 + s * (W / 2 + 1.2)), r2(Pf - 0.9), 0.35);
      if (k) for (const s of [-1, 1]) { const u = r2(L / 2 + s * (W / 2 + 2.6)), v = r2(Pf - 1.4); solid(s < 0 ? tl : tr, [u - 0.45, v - 0.45, u + 0.45, v + 0.45], 4.6, 'estatua'); }
      R.sanct = R.nave; R.pray.push(R.nave); R.stand.push(por, tl, tr); R.courtRoom = land;
      R.roof = { kind: 'duas-aguas', along: 'v', h: r2(Math.min(4.6, W * 0.2)), over: 0.35 }; R.mat = 'reboco';
    } else if (EG) {
      // ---- the Egyptian's: the hall's block at the back, the court before it behind the pylon ----
      const m = 0.3; const B0 = r2(e + m), B2 = r2(L - e - m), B1 = r2(e + m);
      const t = pick([0.6, 0.8, 1.0]), ti = pick([0.4, 0.5, 0.6]), ds = pick([3.6, 4.8, 6.0]), dh = pick([5.2, 8.0, 10.4]);
      const B3 = r2(B1 + t + ds + ti + dh + t); const Bc = [B0, B1, B2, B3];
      const Hh = pick([5.0, 7.0, 9.6]), Hy = pick([4.0, 5.5, 7.0]), Ht = pick([9.0, 12.0, 15.0]), gw = pick([2.2, 2.8, 3.4]), gh = pick([3.0, 4.0, 5.0]);
      Object.assign(R, { B: Bc, t, Hw: Hh, eave: r2(Hp + Hh), Hy, Ht });
      const ws = outerWalls(Bc, t, Hh, true);
      const dw = pick([1.6, 2.0, 2.4]), dh2 = pick([3.0, 3.8, 4.8]); door(ws.frente, [L / 2, r2(B3 - t / 2)], dw, dh2, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh2) };
      const hv0 = r2(B1 + t + ds + ti), hv1 = r2(B3 - t);
      for (const s of ['esquerda', 'direita']) { const at = s === 'esquerda' ? r2(B0 + t / 2) : r2(B2 - t / 2); for (const q of [0.3, 0.7]) win(ws[s], [at, r2(hv0 + (hv1 - hv0) * q)], 1.0, 0.6, r2(Hh - 1.2)); }
      precinct([B0, B3, B2, Vp], Hy, false, { k: 'portao', w: gw, h: gh });
      const court = room('patio', [r2(B0 + ft), B3, r2(B2 - ft), r2(Vp - ft)], { open: 1 });
      R.nave = room('hipostila', [r2(B0 + t), hv0, r2(B2 - t), hv1]);
      const sv0 = r2(B1 + t), sv1 = r2(B1 + t + ds), wsn = pick([3.6, 4.8, 6.0]); const s0 = r2(L / 2 - wsn / 2), s1 = r2(L / 2 + wsn / 2);
      R.sanct = room('santuario', [r2(s0 + ti / 2), sv0, r2(s1 - ti / 2), sv1]);
      const cl = room('camara', [r2(B0 + t), sv0, r2(s0 - ti / 2), sv1]), cr = room('camara', [r2(s1 + ti / 2), sv0, r2(B2 - t), sv1]);
      // (the wall between the hall and the sanctuary's row, the sanctuary's portal and the chambers' doors in it; the partitions)
      const pw = wall([r2(B0 + t), r2(sv1 + ti / 2)], [r2(B2 - t), r2(sv1 + ti / 2)], ti, Hh, 'parede');
      door(pw, [L / 2, r2(sv1 + ti / 2)], pick([1.2, 1.4, 1.6]), pick([2.6, 3.2, 3.8]), 'portal');
      for (const id of [cl, cr]) { const r = R.rooms[id].r; door(pw, [r2((r[0] + r[2]) / 2), r2(sv1 + ti / 2)], 1.0, DOOR_H, 'porta'); }
      wall([s0, sv0], [s0, sv1], ti, Hh, 'divisoria'); wall([s1, sv1], [s1, sv0], ti, Hh, 'divisoria');
      // (the pylon's towers either side of the gate, against the court's front; the papyrus columns down the court's sides and in
      // the hall, the axis between them free; the fires before the hall's portal)
      const pt = pick([2.0, 2.6, 3.0]); const g0 = r2(L / 2 - gw / 2 - 0.05), g1 = r2(L / 2 + gw / 2 + 0.05), fy = r2(Vp - ft);
      const twt = Math.min(pick([4.4, 7.0, 9.6]), r2(g0 - (B0 + ft) - 0.1)); R.towers = [[r2(g0 - twt), r2(fy - pt), g0, fy], [g1, r2(fy - pt), r2(g1 + twt), fy]];
      for (const r of R.towers) solid(court, r, Ht, 'torre');
      const crc = pick([0.4, 0.45, 0.55]), cv0 = r2(B3 + 1.2), cv1 = r2(fy - pt - 1.0);
      if (cv1 >= cv0) { const m2 = Math.max(1, Math.floor((cv1 - cv0) / 3.0) + 1);
        for (const u of [r2(B0 + ft + 1.4), r2(B2 - ft - 1.4)]) for (let q = 0; q < m2; q++) { const v = r2(m2 > 1 ? cv0 + (cv1 - cv0) * q / (m2 - 1) : (cv0 + cv1) / 2); solid(court, [u - crc, v - crc, u + crc, v + crc], r2(Hy - 0.6), 'papiro', { rc: crc }); } }
      const hrc = pick([0.45, 0.55, 0.6]), ax = pick([2.4, 3.0, 3.6]), sp = pick([2.6, 3.0, 3.4]);
      for (const v of (k ? [r2(hv0 + (hv1 - hv0) / 3), r2(hv0 + 2 * (hv1 - hv0) / 3)] : [r2((hv0 + hv1) / 2)])) for (const s of [-1, 1]) for (let q = 0; ; q++) {
        const u = r2(L / 2 + s * (ax / 2 + hrc + q * sp)); if (s > 0 ? u + hrc > B2 - t - 1.0 : u - hrc < B0 + t + 1.0) break;
        solid(R.nave, [u - hrc, v - hrc, u + hrc, v + hrc], Hh, 'papiro', { rc: hrc, inner: 1 }); }
      for (const s of [-1, 1]) fire(court, r2(L / 2 + s * (dw / 2 + 1.4)), r2(B3 + 1.0), 0.35);
      R.pray.push(court, R.nave); R.courtRoom = court; R.roof = { kind: 'plano', h: 0, over: 0 }; R.mat = 'adobe-caiado';
    } else if (AZ) {
      // ---- the Aztec's: the stepped pyramid, the stair up its front, the shrine on its top ----
      // (the top: as far in from the pyramid's foot as the flight runs up its front — the flight lies along the face; the shrine
      // across it at its back, as wide as the top, its door to the front; before it, the forecourt on the top behind its parapet,
      // the gate where the flight comes up: the platform the faithful stand on, the braziers before the shrine's corners)
      const ht = r2(Vp - L / 2); const T = [r2(L / 2 - ht), r2(L / 2 - ht), r2(L / 2 + ht), Vp];
      const Ds = pick([5.2, 8.0, 11.0]), tw = pick([0.3, 0.4, 0.5]), Hw = pick([4.2, 6.0, 8.4]); const Bc = [T[0], T[1], T[2], r2(T[1] + Ds)];
      Object.assign(R, { T, B: Bc, t: tw, Hw, eave: r2(Hp + Hw), nl: pick([3, 4, 5]), podium: T.slice() });
      const ws = outerWalls(Bc, tw, Hw, true);
      const dw = pick([1.4, 2.0, 2.4]), dh = pick([2.6, 3.4, 4.2]); door(ws.frente, [L / 2, r2(Bc[3] - tw / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      precinct([T[0], Bc[3], T[2], T[3]], 1.0, false, { k: 'vao', w: sw });
      R.nave = room('nave', [r2(Bc[0] + tw), r2(Bc[1] + tw), r2(Bc[2] - tw), r2(Bc[3] - tw)]);
      const court = room('plataforma', [r2(T[0] + ft), Bc[3], r2(T[2] - ft), r2(T[3] - 0.1)], { open: 1 });
      for (const s of [-1, 1]) fire(court, r2(L / 2 + s * ((T[2] - T[0]) / 2 - 1.3)), r2(Bc[3] + 1.0), 0.35);
      if (k) for (const s of [-1, 1]) fire(court, r2(L / 2 + s * (sw / 2 + 1.0)), r2(T[3] - 1.0), 0.35); // (and the great ones' at the flight's top)
      R.sanct = R.nave; R.pray.push(R.nave); R.stand.push(court); R.courtRoom = court; R.kneel = 1;
      R.roof = { kind: 'plano', h: 0, over: 0 }; R.mat = 'adobe-estuque';
    } else {
      // ---- the Norse's hof: the hall of staves and its gallery, the garth before it ----
      const W = pick([6.4, 9.6, 13.6]), D = pick([7.6, 13.2, 19.6]), g = pick([1.4, 1.8, 2.0]), bm = pick([0.9, 1.0, 1.2]), t = 0.35;
      const Bh = [r2(L / 2 - W / 2), r2(Yi[1] + bm), r2(L / 2 + W / 2), r2(Yi[1] + bm + D)];
      const Hw = pick([4.4, 6.0, 8.4]), Hg = pick([2.6, 2.8, 3.0]);
      Object.assign(R, { B: Bh, t, Hw, Hg, eave: r2(Hp + Hw), g });
      precinct(Y, pick([1.8, 2.2, 2.6]), true, { k: 'portao', w: pick([1.6, 2.0, 2.4]), h: pick([2.4, 2.6, 2.8]) });
      const ws = outerWalls(Bh, t, Hw, true);
      const dw = pick([1.2, 1.6, 2.0]), dh = pick([2.4, 3.0, 3.6]); door(ws.frente, [L / 2, r2(Bh[3] - t / 2)], dw, dh, 'portal'); R.doorD = { u: L / 2, w: dw, y0: Hp, y1: r2(Hp + dh) };
      for (const s of ['esquerda', 'direita']) { const at = s === 'esquerda' ? r2(Bh[0] + t / 2) : r2(Bh[2] - t / 2);
        if (k === 2) door(ws[s], [at, r2(Bh[3] - 3.0)], 1.0, DOOR_H, 'porta');
        for (const q of [0.35, 0.65]) win(ws[s], [at, r2(Bh[1] + D * q)], 0.6, 0.6, r2(Hw - 1.4)); }
      // the gallery round three sides, its staves at its edge (the front's middle bay on the axis)
      const A = { f: [r2(Bh[0] - g), Bh[3], r2(Bh[2] + g), r2(Bh[3] + g)], l: [r2(Bh[0] - g), Bh[1], Bh[0], Bh[3]], r: [Bh[2], Bh[1], r2(Bh[2] + g), Bh[3]] }; R.gal = A;
      for (const a of [A.f, A.l, A.r]) R.annexes.push({ r: a, h: Hg, fn: 'galeria' });
      const rs = 0.15, odd = len => { let m = Math.max(2, Math.round(len / 2.0) + 1); if ((m - 1) % 2 === 0) m++; return m; };
      const lf = r2(A.f[2] - A.f[0]), ls = r2(A.f[3] - Bh[1]);
      colLine([A.f[2], r2(A.f[3] - rs)], [A.f[0], r2(A.f[3] - rs)], evenly(lf, rs, odd(lf)), rs, Hg, { stave: 1 });
      colLine([r2(A.l[0] + rs), Bh[1]], [r2(A.l[0] + rs), A.f[3]], evenly(ls, rs, Math.max(2, Math.round(ls / 2.0) + 1)), rs, Hg, { stave: 1 });
      colLine([r2(A.r[2] - rs), A.f[3]], [r2(A.r[2] - rs), Bh[1]], evenly(ls, rs, Math.max(2, Math.round(ls / 2.0) + 1)), rs, Hg, { stave: 1 });
      const c2r = r2(2 * rs);
      R.nave = room('nave', [r2(Bh[0] + t), r2(Bh[1] + t), r2(Bh[2] - t), r2(Bh[3] - t)]);
      const gf = room('galeria', [r2(A.f[0] + c2r), Bh[3], r2(A.f[2] - c2r), r2(A.f[3] - c2r)]);
      room('galeria', [r2(A.l[0] + c2r), Bh[1], A.l[2], Bh[3]]); room('galeria', [A.r[0], Bh[1], r2(A.r[2] - c2r), Bh[3]]);
      const garth = room('terreiro', [Yi[0], A.f[3], Yi[2], Yi[3]], { open: 1 });
      const sl = room('terreiro', [Yi[0], Yi[1], A.l[0], A.f[3]], { open: 1 }), sr = room('terreiro', [A.r[2], Yi[1], Yi[2], A.f[3]], { open: 1 });
      room('terreiro', [A.l[0], Yi[1], A.r[2], Bh[1]], { open: 1 });
      // (the hall's two rows of posts; the stone altar of the garth beside the way, its fires; the standing stones at the sides)
      const pin = pick([1.4, 2.2, 3.0]), psp = pick([2.4, 3.0, 3.2]), pv0 = r2(Bh[1] + t + 2.2), pv1 = r2(Bh[3] - t - 1.6); const mp = Math.max(2, Math.round((pv1 - pv0) / psp) + 1);
      for (const s of [-1, 1]) for (let q = 0; q < mp; q++) { const u = r2(L / 2 + s * (W / 2 - t - pin)), v = r2(pv0 + (pv1 - pv0) * q / (mp - 1)); solid(R.nave, [u - 0.2, v - 0.2, u + 0.2, v + 0.2], Hw, 'esteio', { inner: 1 }); }
      const hv = r2((A.f[3] + Yi[3]) / 2); solid(garth, [r2(L / 2 + 1.4), r2(hv - 0.4), r2(L / 2 + 2.2), r2(hv + 0.4)], 1.0, 'pedra');
      for (const du of [-1.8, 3.4]) fire(garth, r2(L / 2 + du), hv, 0.35);
      if (k) for (const rm of [sl, sr]) { const r = R.rooms[rm].r; if (r[2] - r[0] < 1.6) continue; const u = r2((r[0] + r[2]) / 2); for (const v of [r2(r[1] + 2.0), r2(r[3] - 2.0)]) solid(rm, [u - 0.35, v - 0.35, u + 0.35, v + 0.35], 1.6, 'pedra'); }
      R.sanct = R.nave; R.pray.push(R.nave); R.stand.push(garth, gf); R.courtRoom = garth;
      R.roof = { kind: 'duas-aguas', along: 'v', h: r2(W * 0.55), over: 0.5 }; R.mat = 'tabua';
    }
    const B = R.B; R.levels = [{ lv: 0, y: Hp, h: R.Hw, kind: 'piso', area: [r2(B[0] + R.t), r2(B[1] + R.t), r2(B[2] - R.t), r2(B[3] - R.t)] }];
    return R;
  }
  Fo.riscoTemplo = riscoTemplo; // (for the proofs)

  // ------------------------------ the temple's outside, painted from the risk ------------------------------
  // the platform and its flight, the precinct's floor and walls (the balustrade, the court's walls, the palisade of stakes), the
  // gate; the people's temple — the Greek's columns all round under the entablature and the gable, the Roman's porch and engaged
  // columns on the cella, the Egyptian's battered hall under its bands, its towers and the papyrus columns of its court, the
  // Norse's hall of planks, its gallery's skirt roof and staves, the steep roof, its dragons, its tower and spire —; the pieces
  // of the courts (the cypresses, the statues, the stones, the fires)
  function templeEls(R) {
    const { L, Hp, B, GR, RO, EG, NO, AZ } = R; const els = [];
    const bloco = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(r2), y0: r2(y0), y1: r2(y1), cor }, o || {});
    if (AZ) { // (the Aztec's pyramid: its levels from the lot's foot to the top, as the god's; the stair set into its front between its ramps — its steps the risk's treads, the last the top's edge)
      const s0 = r2(L / 2 - R.e), s1 = r2((R.T[2] - R.T[0]) / 2); const niveis = [];
      for (let q = 0; q < R.nl; q++) niveis.push([r2(s0 - (s0 - s1) * q / (R.nl - 1)), r2(Hp * q / R.nl), r2(Hp * (q + 1) / R.nl)]);
      els.push({ k: 'escalonada', c: [r2(L / 2), r2(L / 2)], niveis, cor: WALL, friso: 0.26, mat: 'stucco', risco: R },
        { k: 'escada', a: [r2(L / 2), r2(L - R.e), 0], b: [r2(L / 2), r2(R.Vp - R.td), Hp], w: R.sw, cor: 'wl', clara: 1.08, alfarda: r2(0.2 + 0.1 * R.k) });
    } else {
      els.push(bloco(R.podium, 0, Hp, BASE, { mat: 'base', risco: R }));
      for (const q of R.treads) els.push(bloco(q.r, 0, q.y, BASE, { mat: 'base', degrau: 1 }));
    }
    if (GR) for (let q = 1; q < 3; q++) els.push({ k: 'faixa', r: R.podium.slice(), y0: r2(Hp * q / 3 - 0.05), y1: r2(Hp * q / 3), cor: 'base2' }); // (the crepidoma's steps)
    const pave = EG ? ['#e8dcb4', '#e8dcb4', '#e8dcb4'] : NO ? ['#86a84e', '#86a84e', '#86a84e'] : AZ ? ['#e0d6c0', '#e0d6c0', '#e0d6c0'] : ['#e4dccb', '#e4dccb', '#e4dccb'];
    els.push(bloco(R.yard, Hp, r2(Hp + 0.05), pave, { mat: NO ? 'turf' : 'slab', piso: 1 }));
    // the precinct's walls, but the gate's opening
    for (const w of R.walls) {
      if (!w.yard || w.kind === 'borda') continue; const along = Math.abs(w.a[1] - w.b[1]) < 1e-6;
      const r = along ? [Math.min(w.a[0], w.b[0]), r2(w.a[1] - w.t / 2), Math.max(w.a[0], w.b[0]), r2(w.a[1] + w.t / 2)] : [r2(w.a[0] - w.t / 2), Math.min(w.a[1], w.b[1]), r2(w.a[0] + w.t / 2), Math.max(w.a[1], w.b[1])];
      const gate = w.ops.find(o => o.rua); const parts = gate && along ? [[r[0], r2(gate.p[0] - gate.w / 2)], [r2(gate.p[0] + gate.w / 2), r[2]]] : [[along ? r[0] : r[1], along ? r[2] : r[3]]];
      for (const [a, b] of parts) {
        const rr = along ? [a, r[1], b, r[3]] : [r[0], a, r[2], b];
        if (NO) { const len = b - a; const m = Math.max(1, Math.round(len / 0.8)); // (the palisade: its pointed stakes)
          for (let q = 0; q <= m; q++) { const pnt = along ? [r2(a + len * q / m), r2((r[1] + r[3]) / 2)] : [r2((r[0] + r[2]) / 2), r2(a + len * q / m)];
            els.push({ k: 'tora', a: [pnt[0], pnt[1], Hp], b: [pnt[0], pnt[1], r2(Hp + w.h - 0.4)], r: 0.14, cor: '#6a4a2c' }, { k: 'piramide', c: pnt, e: 0.12, y0: r2(Hp + w.h - 0.4), y1: r2(Hp + w.h + 0.3), cor: ['#6a4a2c', '#5a3c22'], mat: 'beam' }); }
        } else els.push(bloco(rr, Hp, r2(Hp + w.h), EG ? WALL : PAR, { mat: EG ? 'parede' : 'slab' }));
      }
      if (gate && NO) for (const s of [-1, 1]) { const u = r2(gate.p[0] + s * (gate.w / 2 + 0.2)); els.push({ k: 'tora', a: [u, gate.p[1], Hp], b: [u, gate.p[1], r2(Hp + w.h + 1.2)], r: 0.2, cor: '#5a3a22' }); }
      if (gate && EG) els.push({ k: 'porta', na: 'frente', v: r2(gate.p[1] + w.t / 2), u: gate.p[0], w: gate.w, y0: Hp, y1: r2(Hp + gate.h), cor: '#2a2016', portao: true });
    }
    // the columns of the risk: each line's, where the plan stands them
    const colsOf = c => { const [a, b] = c.line; const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return c.at.map(s => [r2(a[0] + (b[0] - a[0]) * s / len), r2(a[1] + (b[1] - a[1]) * s / len)]); };
    const pap = EG ? { h: 1.0, r: 0.9, cor: 'acc2' } : null;
    for (const c of R.cols) els.push({ k: 'colunata', pts: colsOf(c), r: c.rc, y0: Hp, y1: r2(Hp + c.h), cor: NO ? ['wr', 'wl'] : ['col0', 'col1'], papiro: pap || undefined, mat: NO ? 'beam' : undefined });
    const top = r2(Hp + R.Hw); let roofTop = top;
    if (GR || RO) {
      // the cella's block, the entablature over the columns, the roof along the way in, the gilded round in the gable
      els.push(bloco(B, Hp, top, WALL, { mat: 'parede' }));
      const T = R.T; const Te = [r2(T[0] - 0.1), r2(T[1] - 0.1), r2(T[2] + 0.1), r2(T[3] + 0.1)];
      els.push(bloco(Te, r2(Hp + R.Hc), top, COL, { mat: 'slab' }), { k: 'faixa', r: Te, y0: r2(top - R.He * 0.6), y1: r2(top - R.He * 0.3), cor: RO ? 'acc2' : 'acc' });
      els.push({ k: 'telhado', r: Te, y0: top, y1: r2(top + R.roof.h), ao: 'v', ov: 0.2, cor: ROOF }, { k: 'disco', na: 'frente', u: r2(L / 2), v: r2(Te[3] + 0.05), y: r2(top + R.roof.h * 0.38), r: r2(0.25 + 0.15 * R.k), cor: RO ? 'acc' : '#f2c14e' });
      roofTop = top + R.roof.h;
      if (RO) for (const s of [B[0], B[2]]) { const pts = []; for (let v = r2(B[1] + 1.0); v <= B[3] - 0.8 + 1e-6; v = r2(v + 3.0)) pts.push([s, v]); els.push({ k: 'colunata', pts, r: r2(R.t * 0.55), y0: Hp, y1: r2(Hp + R.Hc), cor: ['col0', 'col1'] }); } // (the engaged columns)
      els.push({ k: 'porta', na: 'frente', v: r2(GR ? R.vF + R.t / 2 : B[3]), u: r2(L / 2), w: R.doorD.w, y0: Hp, y1: R.doorD.y1, cor: 'door' });
    } else if (EG) {
      // the hall's block under its bands and cornice; the pylon's towers, the lintel over the gate, their flags
      els.push(bloco(B, Hp, top, WALL, { mat: 'parede' }), { k: 'faixa', r: B.slice(), y0: r2(top - 1.3), y1: r2(top - 0.7), cor: 'trim' }, { k: 'faixa', r: B.slice(), y0: r2(top - 0.7), y1: r2(top - 0.25), cor: 'trim2' },
        bloco([r2(B[0] - 0.15), r2(B[1] - 0.15), r2(B[2] + 0.15), r2(B[3] + 0.15)], top, r2(top + 0.45), ['top', 'top', 'top'], { mat: 'slab' }));
      els.push({ k: 'porta', na: 'frente', v: B[3], u: r2(L / 2), w: R.doorD.w, y0: Hp, y1: R.doorD.y1, cor: '#3e2e1c' });
      const [a, b] = R.towers; els.push(bloco([a[2], a[1], b[0], a[3]], r2(Hp + R.Ht * 0.6), r2(Hp + R.Ht * 0.6 + 1.4), WALL, { mat: 'parede' }));
      roofTop = Math.max(roofTop, Hp + R.Ht);
    } else if (AZ) {
      // the shrine on the top: its walls of stucco under the painted band, its dark door, the crest on its flat roof
      const ch = r2(R.Hw * 0.6), cw = r2((B[2] - B[0]) * 0.7), cv = r2((B[1] + B[3]) / 2);
      els.push(bloco(B, Hp, top, WALL, { mat: 'parede' }), { k: 'faixa', r: B.slice(), y0: r2(top - R.Hw * 0.28), y1: r2(top - 0.05), cor: 'trim' },
        bloco([r2(L / 2 - cw / 2), r2(cv - 0.2), r2(L / 2 + cw / 2), r2(cv + 0.2)], top, r2(top + ch), ['trim', 'trim', 'trim'], { crista: true }),
        { k: 'porta', na: 'frente', v: B[3], u: r2(L / 2), w: R.doorD.w, y0: Hp, y1: R.doorD.y1, cor: '#2a1c14' });
      roofTop = top + ch;
    } else {
      // the hall of planks, the skirt roof of its gallery from the staves up to its walls, the steep roof, the dragons, the tower
      els.push(bloco(B, Hp, top, WALL, { mat: 'parede', tabuas: 6 + 2 * R.k }));
      const A = R.gal, yl = r2(Hp + R.Hg), yh = r2(Hp + R.Hg + 1.2);
      els.push({ k: 'pano', p: [[A.f[0], A.f[3], yl], [A.f[2], A.f[3], yl], [B[2], B[3], yh], [B[0], B[3], yh]], cor: 'shingle0', mat: 'shingle' },
        { k: 'pano', p: [[A.l[0], A.f[3], yl], [B[0], B[3], yh], [B[0], B[1], yh], [A.l[0], A.l[1], yl]], cor: 'shingle1', mat: 'shingle' },
        { k: 'pano', p: [[B[2], B[3], yh], [A.r[2], A.f[3], yl], [A.r[2], A.r[1], yl], [B[2], B[1], yh]], cor: 'shingle1', mat: 'shingle' });
      const SHG = ['shingle0', 'shingle1', 'wl', 'shingle2'];
      els.push({ k: 'telhado', r: [r2(B[0] - 0.3), r2(B[1] - 0.3), r2(B[2] + 0.3), r2(B[3] + 0.3)], y0: top, y1: r2(top + R.roof.h), ao: 'v', ov: 0.4, cor: SHG, mat: 'shingle' });
      roofTop = top + R.roof.h;
      for (const [v, dir] of [[r2(B[3] + 0.5), 1], [r2(B[1] - 0.5), -1]]) els.push({ k: 'dragao', p: [r2(L / 2), v, roofTop], dir, ao: 'v', cor: '#3a2616' });
      if (R.k) { const s = r2(0.9 + 0.3 * R.k), vc = r2((B[1] + B[3]) / 2), z0 = r2(roofTop - 1.0), z1 = r2(roofTop + 2.2 + R.k);
        els.push(bloco([r2(L / 2 - s), r2(vc - s), r2(L / 2 + s), r2(vc + s)], z0, z1, WALL, { tabuas: 4 }), { k: 'piramide', c: [r2(L / 2), vc], e: r2(s + 0.15), y0: z1, y1: r2(z1 + 4 + 2 * R.k), cor: ['shingle0', 'shingle1'], mat: 'shingle' });
        roofTop = z1 + 4 + 2 * R.k; }
      els.push({ k: 'porta', na: 'frente', v: B[3], u: r2(L / 2), w: R.doorD.w, y0: Hp, y1: R.doorD.y1, cor: 'door' });
    }
    // the pieces of the courts (the inside's are the plan's alone), the fires
    for (const p of R.pieces) {
      if (p.inner) continue; const c = [r2((p.r[0] + p.r[2]) / 2), r2((p.r[1] + p.r[3]) / 2)];
      if (p.k === 'cipreste') els.push({ k: 'bola', c: [c[0], c[1], r2(Hp + p.h * 0.5)], r: 0.45, ry: r2(p.h * 0.55), cor: '#2f5a2a', mat: 'turf' });
      else if (p.k === 'estatua') els.push(bloco(p.r, Hp, r2(Hp + 1.0), BASE, { mat: 'base' }), { k: 'estatua', p: [c[0], c[1], r2(Hp + 1.0)], h: r2(p.h - 1.0), w: 0.5, cor: '#e8e0d0' });
      else if (p.k === 'pedra') els.push({ k: 'pedra', c, e: r2((p.r[2] - p.r[0]) / 2), e1: r2((p.r[3] - p.r[1]) / 2 * 0.8), y0: Hp, y1: r2(Hp + p.h), cai: [0.04, 0.04], cor: ['#8e877b', '#6f6a60'] });
      else if (p.k === 'coluna') els.push({ k: 'colunata', pts: [c], r: p.rc, y0: Hp, y1: r2(Hp + p.h), cor: ['col0', 'col1'] });
      else if (p.k === 'papiro') els.push({ k: 'colunata', pts: [c], r: p.rc, y0: Hp, y1: r2(Hp + p.h), cor: ['col0', 'col1'], papiro: pap });
      else if (p.k === 'torre') { const bb = 0.5; els.push({ k: 'talude', r: p.r, r1: [p.r[0] + bb, p.r[1] + bb, p.r[2] - bb, p.r[3] - bb].map(r2), y0: Hp, y1: r2(Hp + p.h), cor: WALL, mat: 'parede' },
        { k: 'faixa', r: [p.r[0] + 0.45, p.r[1] + 0.45, p.r[2] - 0.45, p.r[3] - 0.45].map(r2), y0: r2(Hp + p.h - 1.6), y1: r2(Hp + p.h - 0.6), cor: 'trim' },
        { k: 'bandeira', p: [r2((p.r[0] + p.r[2]) / 2), r2(p.r[3] + 0.3), Hp], h: r2(p.h + 6), cor: '#e8b83a' }); }
    }
    for (const f of R.fires) els.push(bloco(f.pe, Hp, r2(Hp + f.h * 0.8), BASE, { mat: 'base' }), { k: 'braseiro', p: [f.c[0], f.c[1], r2(Hp + f.h * 0.8)], r: r2(f.r * 0.6), uso: 'acender' });
    return els;
  }
  // (the Aztec's pyramid is no shell's: its form has a body, as the god's temple of the town — D-093 —, the shrine's walls its
  // walls, the pyramid its base and its levels, the flight its steps; so the 3D raises the plan's shell — the shrine — on the
  // form, and draws the pyramid, its stair and what stands on its top from it. The others' shells are their forms')
  const azBody = (R, els) => ({ walls: els.find(e => e.k === 'bloco' && e.mat === 'parede' && e.y0 === R.Hp && e.r.every((x, q) => x === R.B[q])), porta: { u: R.doorD.u, w: R.doorD.w, y0: R.doorD.y0, y1: R.doorD.y1 },
    base: { r: [R.e, R.e, r2(R.L - R.e), r2(R.L - R.e)], y1: R.Hp, degraus: els.find(e => e.k === 'escalonada').niveis.map(([s, , yb]) => ({ r: [r2(R.L / 2 - s), r2(R.L / 2 - s), r2(R.L / 2 + s), r2(R.L / 2 + s)], y1: yb })) },
    steps: R.treads.map(q => ({ r: q.r.slice(), y1: q.y })) });
  const templeForm = st => (L, n) => { const R = riscoTemplo(st, n); const els = templeEls(R); const F = { els, door: R.doorD || { u: R.gate.u, w: R.gate.w, y0: R.Hp, y1: r2(R.Hp + 2.6) } };
    if (R.AZ) F.body = azBody(R, els); return F; };
  for (const st of ['grego', 'romano', 'egipcio', 'nordico', 'asteca', 'classico']) Fo.def('temple', st, templeForm(st), [4, 6, 8]);
})(window.G = window.G || {});
