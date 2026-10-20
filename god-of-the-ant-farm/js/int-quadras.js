'use strict';
// ============================================================
//  The block (quarteirão): a whole lot of 8 × 8 m built up round
//  a court — four wings round it, three with the court open to
//  the street, two bars with the court between, an L with its
//  yard —, three or four storeys of rooms where some forty people
//  sleep, a stair stacked in the corner of the back wing (one in
//  each bar when the court cuts them apart), the court open to
//  the sky. Laid out with the engine's kit and the homes' helpers
//  and proved the same way (the catalogue, the walk, the places).
// ============================================================
(function (G) {
  const In = G.Interiors; const K = In.HOME;
  const r2 = x => Math.round(x * 100) / 100;
  const HB = {
    patio: 'Quatro alas em volta do pátio',
    u: 'Três alas, o pátio aberto para a rua',
    barras: 'Dois blocos e o pátio entre eles',
    l: 'Duas alas em L e o quintal',
  };
  const VB = ['andar3', 'andar4', 'andar3-terraco', 'andar4-terraco'];
  const fams = [];
  for (const h in HB) for (const v of VB) {
    const o = K.parseV(v); const id = 'quadra-' + h + '.' + v; fams.push(id);
    In.addFamilies([{ id, H: 'quadra-' + h, V: v, name: `${HB[h]}, ${K.NUM[o.n]} pavimentos${o.top ? ' e ' + K.TOPN[o.top] : ''}`, can: (rec, T, tr) => (o.top && K.flatOK(rec, tr)) || null, build: P => block(P) }]);
  }
  In.addTypes({ quarteirao: { use: 'casa', fams } });

  function block(P) {
    const F = P.fam, rec = P.rec, tr = P.tr, L = P.L; const need = (G.BDEF[rec.t] || {}).housing || 0;
    const H = F.H.slice(7); const SV = K.parseV(F.V); const N = SV.n;
    const t = tr.t, ti = Math.min(t, 0.22); const h0 = tr.h0, h1 = tr.h1 || 2.4;
    const m = P.rr(0.1, 0.2); const sh = [m, m, L - m, L - m];
    P.shell = { kind: 'rect', r: sh, t, mat: tr.mat, base: 'pedra', floors: N, eave: h0 + (N - 1) * (0.2 + h1) };
    const I = P.inner(); const dW = H === 'barras' ? P.rr(2.45, 2.65) : P.rr(2.5, 2.85); // (the depth of a wing: a room and a row of beds)
    // ---- the court (open to the sky), and the wings round it ----
    const C = H === 'patio' ? [I[0] + dW, I[1] + dW, I[2] - dW, I[3] - dW] : H === 'u' ? [I[0] + dW, I[1] + dW, I[2] - dW, I[3]] : H === 'barras' ? [I[0], I[1] + dW, I[2], I[3] - dW] : [I[0] + dW, I[1] + dW, I[2], I[3]];
    if (C[2] - C[0] < 1.6 || C[3] - C[1] < 1.6) { P.errs.push('o pátio não cabe'); return; }
    P.shell.court = C.slice();
    const W = { back: [I[0], I[1], I[2], C[1] - ti] };
    if (H === 'patio' || H === 'barras') W.front = [I[0], C[3] + ti, I[2], I[3]];
    if (H === 'patio' || H === 'u' || H === 'l') W.left = [I[0], C[1], C[0] - ti, H === 'patio' ? C[3] : I[3]];
    if (H === 'patio' || H === 'u') W.right = [C[2] + ti, C[1], I[2], H === 'patio' ? C[3] : I[3]];
    // the roof: the people's own over the wings (flat, or pitched down to the court and to the street)
    const kind = K.roofOf(rec, tr); const rise = kind === 'plano' ? 0 : Math.min(2.6, dW * (kind === 'turfa' ? 0.76 : 0.8) * 0.82);
    P.roof = { kind, along: null, h: r2(rise), over: kind === 'plano' ? 0 : 0.42, court: C.slice() };
    P.entryLv = 0; const rooms = { up: [], ground: [] };
    P.outers = [];
    // ---- the storeys ----
    let y = 0; let pass = null;
    for (let k = 0; k < N; k++) {
      const h = k ? h1 : h0;
      P.level(k, y, h, k ? 'andar' : 'piso', I);
      const ids = {};
      for (const w in W) {
        if (k === 0 && w === 'front' && !pass) {
          // (the way in: a covered passage through the front wing, from the street to the court)
          // (between the bars, the front bar keeps its right end for its own stair)
          const pw = 1.2; const lo = (H === 'patio' ? C[0] : I[0] + 1.0), hi = H === 'patio' ? C[2] - pw : I[0] + 1.8; if (hi < lo) { P.errs.push('não cabe a passagem'); return; }
          const pu0 = P.rr(lo, hi); pass = { u0: pu0, w: pw };
          const fr = W.front;
          ids.frontL = P.room(0, 'ala', [fr[0], fr[1], pu0 - ti, fr[3]]); ids.pass = P.room(0, 'passagem', [pu0, fr[1], pu0 + pw, fr[3]]); ids.frontR = P.room(0, 'ala', [pu0 + pw + ti, fr[1], fr[2], fr[3]]);
          continue;
        }
        ids[w] = P.room(k, 'ala', W[w]);
      }
      if (k === 0) ids.court = P.room(0, 'patio', C, 1);
      // the outside walls: round the wings, and on the ground round the court where it meets the edge of the lot (a wall
      // with the gate in it)
      const O = {}; const c = t / 2;
      const span = (side, r) => (side === 'fundo' || side === 'frente' ? [r[0], r[2]] : [r[1], r[3]]);
      const onEdge = (side, r) => (side === 'fundo' ? r[1] <= I[1] + 1e-6 : side === 'frente' ? r[3] >= I[3] - 1e-6 : side === 'esquerda' ? r[0] <= I[0] + 1e-6 : r[2] >= I[2] - 1e-6);
      for (const side of ['fundo', 'frente', 'esquerda', 'direita']) {
        const across = side === 'fundo' || side === 'frente'; const segs = [];
        for (const w in W) if (onEdge(side, W[w])) segs.push(span(side, W[w]));
        if (k === 0 && onEdge(side, C)) segs.push(span(side, C));
        if (!segs.length) continue;
        // (the runs of wall along this side: wings that meet, and the court's wall between them on the ground)
        segs.sort((a, b) => a[0] - b[0]); const runs = [];
        for (const sg of segs) { const last = runs[runs.length - 1]; if (last && sg[0] <= last[1] + ti + 0.05) last[1] = Math.max(last[1], sg[1]); else runs.push(sg.slice()); }
        const i0 = across ? I[0] : I[1], i1 = across ? I[2] : I[3], s0 = across ? sh[0] : sh[1], s1 = across ? sh[2] : sh[3];
        const z = side === 'fundo' ? sh[1] + c : side === 'frente' ? sh[3] - c : side === 'esquerda' ? sh[0] + c : sh[2] - c;
        O[side] = runs.map(([lo0, hi0]) => {
          const lo = lo0 <= i0 + 1e-6 ? s0 : lo0 - ti, hi = hi0 >= i1 - 1e-6 ? s1 : hi0 + ti;
          const fw = side === 'fundo' || side === 'direita'; // (each wall runs round the block the same way)
          const a = across ? [fw ? lo : hi, z] : [z, fw ? lo : hi], b = across ? [fw ? hi : lo, z] : [z, fw ? hi : lo];
          return P.wall(k, a, b, t, h, 1, 'parede');
        });
      }
      P.outers.push(O);
      const wallAt = (side, p) => (O[side] || []).find(id => { const w = P.walls[id]; const q = side === 'fundo' || side === 'frente' ? 0 : 1; return p >= Math.min(w.a[q], w.b[q]) && p <= Math.max(w.a[q], w.b[q]); });
      // the court's walls (and, at the corners, the partitions between the wings)
      const cw = (a, b) => P.wall(k, a, b, ti, h, 0, 'parede');
      const backW = cw([I[0], C[1] - ti / 2], [I[2], C[1] - ti / 2]);
      const frontW = W.front ? cw([I[2], C[3] + ti / 2], [I[0], C[3] + ti / 2]) : null;
      const leftW = W.left ? cw([C[0] - ti / 2, C[1]], [C[0] - ti / 2, W.left[3]]) : null;
      const rightW = W.right ? cw([C[2] + ti / 2, W.right[3]], [C[2] + ti / 2, C[1]]) : null;
      const dh = Math.min(2.05, h - 0.2);
      // (a door somewhere along a stretch of wall, its way clear of the stair's corner — the flights come later, but where
      // they go is known: the column at the end of the back wing, and of the front bar between bars)
      const keep = [colOf(W.back, 'back')].concat(H === 'barras' && W.front ? [colOf(W.front, 'front')] : []);
      const doorAt = (wall, lo, hi, ra, rb, kind, dw) => {
        dw = dw || 0.85; if (hi - lo < dw + 0.3) return false; const w = P.walls[wall]; const hz = Math.abs(w.a[1] - w.b[1]) < 1e-6;
        const ps = []; for (let p = lo + dw / 2 + 0.15; p <= hi - dw / 2 - 0.15 + 1e-6; p += 0.1) ps.push(p);
        for (const p of P.shuffle(ps)) {
          const z = hz ? [p - dw / 2 - 0.12, w.a[1] - 0.85 - w.t / 2, p + dw / 2 + 0.12, w.a[1] + 0.85 + w.t / 2] : [w.a[0] - 0.85 - w.t / 2, p - dw / 2 - 0.12, w.a[0] + 0.85 + w.t / 2, p + dw / 2 + 0.12];
          if (k > 0 && keep.some(c => P.ovr(z, c))) continue;
          P.door(wall, P.atOf(wall, hz ? [p, w.a[1]] : [w.a[0], p]), dw, dh, ra, rb, 0, kind || 'porta'); return true;
        }
        return false;
      };
      if (k === 0) {
        // the ground: every wing opens on the court; the front rooms on the passage; the street comes in by the passage or
        // by the gate in the court's wall
        const need1 = (ok) => { if (!ok) P.errs.push('não cabe a porta para o pátio'); };
        need1(doorAt(backW, C[0], C[2], ids.back, ids.court));
        if (leftW) need1(doorAt(leftW, C[1], W.left[3], ids.left, ids.court));
        if (rightW) need1(doorAt(rightW, C[1], W.right[3], ids.right, ids.court));
        if (pass) {
          const fr = W.front; const pL = P.wall(0, [pass.u0 - ti / 2, fr[1]], [pass.u0 - ti / 2, fr[3]], ti, h, 0, 'divisoria'), pR = P.wall(0, [pass.u0 + pass.w + ti / 2, fr[3]], [pass.u0 + pass.w + ti / 2, fr[1]], ti, h, 0, 'divisoria');
          if (!doorAt(pL, fr[1], fr[3], ids.frontL, ids.pass) || !doorAt(pR, fr[1], fr[3], ids.frontR, ids.pass)) { P.errs.push('a ala da frente é rasa demais para as portas'); return; }
          P.door(frontW, P.atOf(frontW, [pass.u0 + pass.w / 2, C[3] + ti / 2]), pass.w - 0.1, dh, ids.pass, ids.court, 0, 'vao');
          const ew = 1.1; const fw = wallAt('frente', pass.u0 + pass.w / 2); const d = P.door(fw, P.atOf(fw, [pass.u0 + pass.w / 2, sh[3] - c]), ew, Math.min(2.3, h - 0.2), ids.pass, 'rua', 1, 'porta');
          P.entrance = { door: d, u: pass.u0 + pass.w / 2, v: sh[3], w: ew, lv: 0 };
        } else {
          const gw = Math.min(1.8, C[2] - C[0] - 0.6); const gu = P.rr(C[0] + gw / 2 + 0.3, C[2] - gw / 2 - 0.3);
          const fw = wallAt('frente', gu); const d = P.door(fw, P.atOf(fw, [gu, sh[3] - c]), gw, Math.min(2.4, h - 0.2), ids.court, 'rua', 1, 'portao');
          P.entrance = { door: d, u: gu, v: sh[3], w: gw, lv: 0 };
        }
        rooms.ground = ['back', 'left', 'right', 'frontL', 'frontR'].map(q => ids[q]).filter(x => x !== undefined);
      } else {
        // the storeys above: the wings open on one another at the corners (the court between the bars keeps them apart)
        const need2 = (ok) => { if (!ok) P.errs.push('não cabe a porta entre as alas'); };
        if (ids.left !== undefined) need2(doorAt(backW, I[0], C[0] - ti, ids.back, ids.left));
        if (ids.right !== undefined) need2(doorAt(backW, C[2] + ti, I[2], ids.back, ids.right));
        if (ids.front !== undefined && ids.left !== undefined) need2(doorAt(frontW, I[0], C[0] - ti, ids.left, ids.front));
        if (ids.front !== undefined && ids.right !== undefined) need2(doorAt(frontW, C[2] + ti, I[2], ids.right, ids.front));
        rooms.up.push(...['back', 'left', 'right', 'front'].map(q => ids[q]).filter(x => x !== undefined));
      }
      // the way up to this storey: the stacked stair in the back wing's corner (and in the front bar's, between bars)
      if (k > 0) { flight(P, k - 1, k, W.back, 'back'); if (H === 'barras') flight(P, k - 1, k, W.front, 'front'); }
      y += h + 0.2;
    }
    const lvT = N - 1;
    // ---- the roof terrace of the flat roofs: over each wing, a parapet round it, the stair going on up ----
    if (SV.top === 'terraco') {
      const lvR = N; P.level(lvR, P.shell.eave + 0.25, 2.2, 'terraco', I); const e = 0.14; const tops = [];
      tops.push([I[0], I[1], I[2], C[1] - e]);
      if (W.front) tops.push([I[0], C[3] + e, I[2], I[3]]);
      if (W.left) tops.push([I[0], C[1] - e, C[0] - e, W.front ? C[3] + e : I[3]]);
      if (W.right) tops.push([C[2] + e, C[1] - e, I[2], W.front ? C[3] + e : I[3]]);
      rooms.terr = tops.map(r => P.room(lvR, 'terraco', r, 1));
      P.walls4(lvR, [sh[0] + 0.07, sh[1] + 0.07, sh[2] - 0.07, sh[3] - 0.07], 0.14, 0.9, 1, 'parapeito');
      P.walls4(lvR, [C[0] - 0.07, C[1] - 0.07, C[2] + 0.07, C[3] + 0.07], 0.14, 0.9, 0, 'parapeito', { frente: C[3] >= I[3] - 1e-6 ? 1 : 0, esquerda: C[0] <= I[0] + 1e-6 ? 1 : 0, direita: C[2] >= I[2] - 1e-6 ? 1 : 0 });
      // (the wings' tops meet at the corners: the terrace is one walk round the court)
      flight(P, lvT, lvR, W.back, 'back'); if (H === 'barras') flight(P, lvT, lvR, W.front, 'front');
    }
    blockWindows(P);
    furnishBlock(P, rooms, need);
  }
  // the corner a wing's stair column takes (both lanes, their feet and tops)
  function colOf(R, which) { const run = 1.45; const u0 = which === 'back' ? R[0] + 0.65 : R[2] - 0.65 - run; return which === 'back' ? [u0 - 0.6, R[1], u0 + run + 0.6, R[1] + 1.45] : [u0 - 0.6, R[3] - 1.45, u0 + run + 0.6, R[3]]; }
  // one flight of the stacked stair in a wing's end: along the back wall, the two lanes going up the other way in turn
  function flight(P, lv0, lv1, R, which) {
    const lane = (lv1 - 1) % 2; const run = 1.45; const w = 0.65;
    const v0 = which === 'back' ? R[1] + 0.03 + lane * (w + 0.1) : R[3] - 0.03 - w - lane * (w + 0.1); // (the lanes a hand apart: one's top, the other's foot)
    const u0 = which === 'back' ? R[0] + 0.65 : R[2] - 0.65 - run;
    const r = [u0, v0, u0 + run, v0 + w]; const du = (which === 'back') === (lane === 0) ? 1 : -1;
    if (!K.ladderAt(P, lv0, lv1, [{ r, du, dv: 0, hole: r }], null, 'escada')) P.errs.push(`não cabe a escada do ${lv1}º pavimento`);
  }
  // windows in the outside walls, never in a party wall
  const WORLD = { S: { frente: 4, fundo: 1, direita: 2, esquerda: 8 }, N: { frente: 1, fundo: 4, direita: 8, esquerda: 2 }, E: { frente: 2, fundo: 8, direita: 1, esquerda: 4 }, W: { frente: 8, fundo: 2, direita: 4, esquerda: 1 } };
  function blockWindows(P) {
    const rec = P.rec, tr = P.tr;
    for (const O of P.outers) for (const k in O) for (const id of O[k]) {
      if (rec.pw & WORLD[rec.s][k]) continue;
      const len = P.wlen(id); const n = Math.max(0, Math.floor(len / 2.0 + tr.win - 0.4));
      for (let q = 0; q < n; q++) {
        const at = len * (q + 0.5) / n + P.rr(-0.15, 0.15); const ww = tr.win < 0.35 ? 0.45 : P.rr(0.55, 0.75); const sill = tr.win < 0.35 ? 1.5 : P.rr(0.85, 1.0);
        if (P.holes.some(h => h.wall === id && Math.abs(h.at - at) < (h.w + ww) / 2 + 0.3) || at < ww / 2 + 0.3 || at > len - ww / 2 - 0.3) continue;
        P.window(id, at, ww, Math.max(0.3, Math.min(1.0, P.walls[id].h - sill - 0.25)), sill);
      }
    }
  }
  // the furniture of a block: the households' mats and beds through the wings (the storeys above first), the common
  // hearth and the pantry on the ground, a chest on every storey; braziers above, if they fit
  function furnishBlock(P, rooms, need) {
    const tr = P.tr; const rich = P.rec.w >= 2; const kinds = rich ? tr.rich : tr.bed;
    const lvOf = id => P.rooms[id].lv;
    const sides = id => (P.attempt % 2 ? ['fundo', 'frente', 'esquerda', 'direita'] : P.shuffle(['fundo', 'esquerda', 'direita', 'frente']));
    const fill = (k, id, upto) => {
      if (k === 'banco-cama') { for (const s of P.shuffle(['esquerda', 'direita', 'fundo', 'frente'])) { if (P.places() >= upto) return; P.bench(lvOf(id), id, s, { min: 2 }); } return; }
      let g = 0; while (P.places() < upto && g++ < 16) if (!P.place(k, lvOf(id), id, { sides: sides(id) })) break;
    };
    const order = rooms.up.concat(rooms.ground);
    const beds = () => {
      for (const id of order) { if (P.places() >= need) break; fill(tr.couple || 'esteira-casal', id, need - 1); for (const k of kinds) fill(k, id, need); }
      for (const id of order) { if (P.places() >= need) break; fill('esteira-casal', id, need - 1); fill('esteira', id, need); }
    };
    const fire = () => {
      let lit = false; const f = tr.fire;
      for (const id of rooms.ground) { if (lit) break; if (f === 'lar') lit = !!P.place('lar', 0, id, { sides: ['livre'], margin: 0.3 }); if (!lit) lit = !!P.place(f === 'lar' ? 'fogao' : f, 0, id); if (!lit) lit = !!P.place('braseiro', 0, id); }
      if (!lit) P.errs.push('sem lugar para o fogo');
    };
    const keep = () => {
      const pantry = tr.keep.find(k => k !== 'arca') || 'cesto'; let got = false;
      for (const id of rooms.ground) { if (P.place(pantry, 0, id) || P.place('cesto', 0, id)) { got = true; break; } }
      if (!got) P.errs.push('sem lugar para a despensa');
      let chest = false; for (const id of order) { if (P.place('arca', lvOf(id), id) || P.niche('nicho', lvOf(id), id) || P.niche('prateleira-parede', lvOf(id), id)) { chest = true; break; } }
      if (!chest) P.errs.push('sem lugar para a arca');
    };
    const plans = [[fire, keep, beds], [beds, fire, keep], [fire, beds, keep], [keep, fire, beds]];
    for (const step of plans[P.attempt % plans.length]) step();
    // (a brazier for each storey above, and a chest, where they still go)
    P.opt(() => { for (const id of rooms.up) P.place('braseiro', lvOf(id), id); });
  }
})(window.G);
