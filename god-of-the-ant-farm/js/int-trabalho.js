'use strict';
// ============================================================
//  The buildings of work: the storehouse and the granary, the
//  market hall, the workshops of the trades, the butcher's and the
//  goldsmith's, the tavern. One recipe lays them out — a hall, a
//  front room before it, an aisle between cells, a court with
//  wings, three naves, a lean-to — with the storeys the work
//  wants (a gallery over the back of the hall, a cellar, a floor
//  on stilts, a storey above), and each type's programme
//  furnishes it: the bays and the grain bins that are the people's
//  store, the market's stalls, the benches, forges, looms and
//  wheels that are the trade's work stations, the clerk's table by
//  the door. Every plan proved like the homes' (it fits, every
//  piece reached from the door, the work stations the trade
//  employs, the store the building keeps).
// ============================================================
(function (G) {
  const In = G.Interiors; const K = In.HOME;
  const r2 = x => Math.round(x * 100) / 100;
  const small = rec => ((G.BDEF[rec.t] || {}).w || 1) < 2;
  const area = r => (r[2] - r[0]) * (r[3] - r[1]);
  const HW = {
    salao: { name: 'Salão', can: () => null },
    frente: { name: 'Frente e salão', can: () => null },
    corredor: { name: 'Corredor entre celas', can: rec => (small(rec) ? 'num lote de 4 m não cabe um corredor entre celas' : null) },
    patio: { name: 'Pátio com alas', can: rec => (small(rec) ? 'num lote de 4 m não cabe um pátio' : null) },
    naves: { name: 'Três naves', can: rec => (small(rec) ? 'num lote de 4 m não cabem três naves' : null) },
    anexo: { name: 'Salão e telheiro', can: rec => (rec.d >= 3 ? 'no coração da cidade não sobra lote para um telheiro' : null) },
    // (the jail's: the guard room behind the door, the cells in a row at the back; the baths': the rooms one after another)
    celas: { name: 'Corpo da guarda e celas', can: rec => (small(rec) ? 'num lote de 4 m não cabem as celas' : null) },
    enfiada: { name: 'Salas em fila', can: rec => (small(rec) ? 'num lote de 4 m não cabem as salas em fila' : null) },
  };
  const VW = {
    terreo: { name: '', can: () => null },
    galeria: { name: 'com galeria', can: rec => (small(rec) ? 'num lote de 4 m o salão é raso: uma galeria o cobriria inteiro' : null) },
    porao: { name: 'com porão', can: (rec, tr) => K.cellarOK(rec, tr) },
    esteios: { name: 'sobre esteios', can: rec => (rec.t === 'celeiro' ? null : !K.wet(rec) ? 'só onde a terra alaga (o celeiro, contra os ratos, em toda parte)' : null) },
    andar: { name: 'com sobrado', can: () => null },
  };
  // ------------------------------ the programmes ------------------------------
  // H, V: the organisations and the storeys the work takes; store: the people's store it keeps (BDEF.storage); jobs: its
  // work stations (BDEF.jobs); door: the width of its way in (carts at a storehouse); furnish: what goes in
  const ALLH = ['salao', 'frente', 'corredor', 'patio', 'naves', 'anexo'];
  const PROG = {
    storehouse: { use: 'armazem', H: ['salao', 'frente', 'corredor', 'patio', 'naves'], V: ['terreo', 'galeria', 'porao', 'esteios', 'andar'], storeAll: 1, lockNight: 1, door: [1.6, 2.0], furnish: P => keepFurnish(P, ['baia', 'prateleira', 'pipas', 'baia']) },
    // (the harbour's storehouse: its stevedores set the crates down on the loading floors by the door, their head counts them)
    armazem: { use: 'armazem', H: ['salao', 'frente', 'corredor', 'patio', 'naves'], V: ['terreo', 'galeria', 'porao', 'esteios', 'andar'], storeAll: 1, lockNight: 1, door: [1.6, 2.0], furnish: P => keepFurnish(P, ['baia', 'pipas', 'prateleira', 'baia'], 2) },
    celeiro: { use: 'celeiro', H: ['salao', 'frente', 'corredor', 'naves'], V: ['terreo', 'galeria', 'esteios', 'andar'], storeAll: 1, lockNight: 1, door: [1.4, 1.8], furnish: P => keepFurnish(P, ['tulha', 'tulha', 'baia']) },
    mercado: { use: 'mercado', H: ['salao', 'frente', 'corredor', 'patio', 'naves'], V: ['terreo', 'galeria', 'porao', 'andar'], storeAll: 1, open: 1, lockNight: 1, door: [1.4, 1.8], furnish: marketFurnish },
    workshop: { use: 'oficina', H: ['salao', 'frente', 'patio', 'anexo'], V: ['terreo', 'galeria', 'porao', 'andar'], open: 1, lockNight: 1, jobs: 2, door: [1.0, 1.3], furnish: P => tradeFurnish(P, [['bancada', 2]], ['prateleira', 'secador'], ['cepo']) },
    forja: { use: 'forja', H: ['salao', 'frente', 'patio', 'anexo'], V: ['terreo', 'galeria', 'andar'], open: 1, lockNight: 1, door: [1.0, 1.3], hot: 'forja-fogo', furnish: P => tradeFurnish(P, [['forja-fogo', 1], ['bancada', 1]], ['prateleira'], ['bigorna', 'tina']) },
    tecelagem: { use: 'tecelagem', H: ['salao', 'frente', 'patio', 'naves'], V: ['terreo', 'galeria', 'andar'], open: 1, lockNight: 1, door: [1.0, 1.3], furnish: P => tradeFurnish(P, [['tear', 3]], ['secador', 'prateleira'], []) },
    olaria: { use: 'olaria', H: ['salao', 'frente', 'patio', 'anexo'], V: ['terreo', 'galeria', 'andar'], open: 1, lockNight: 1, door: [1.0, 1.3], hot: 'forno-olaria', furnish: P => tradeFurnish(P, [['roda-oleiro', 2]], ['secador'], [], ['forno-olaria']) },
    acougue: { use: 'acougue', H: ['salao', 'frente', 'anexo'], V: ['terreo', 'porao', 'andar'], open: 1, lockNight: 1, door: [0.9, 1.1], furnish: P => tradeFurnish(P, [['cepo', 1]], ['ganchos'], ['balcao']) },
    ourives: { use: 'ourives', H: ['salao', 'frente', 'anexo'], V: ['terreo', 'porao', 'andar'], open: 1, lockNight: 1, door: [0.85, 1.0], furnish: P => tradeFurnish(P, [['bancada-ourives', 1]], ['cofre'], ['fornalha']) },
    taverna: { use: 'taverna', H: ['salao', 'frente', 'patio', 'naves', 'anexo'], V: ['terreo', 'galeria', 'porao', 'andar'], open: 1, lockNight: 1, door: [1.0, 1.4], furnish: tavernFurnish },
  };
  const NOTW = { esteios: { patio: 1 }, galeria: { patio: 1 } }; // (the hall behind a court is shallow: a gallery would cover it all)
  // (on a 4 m lot with a front room, the hall behind is too shallow for a cellar's trapdoor and its ladder)
  const smallNot = { 'frente.porao': 'num lote de 4 m com frente, o salão de trás é raso para o alçapão do porão', 'anexo.porao': 'num lote de 4 m com telheiro, o salão é estreito para o alçapão do porão' };
  const lists = {};
  // (S: the shell it raises — the hall, the front room behind the same front, the guard room and its cells, the rooms in a
  // row: the same shell; the aisle, the court, the naves and the lean-to each their own)
  const SALA = { salao: 1, frente: 1, celas: 1, enfiada: 1 };
  function addProg(t, pr) {
    PROG[t] = pr; lists[t] = [];
    for (const h of pr.H) for (const v of pr.V) {
      if ((NOTW[v] && NOTW[v][h]) || (pr.skip && pr.skip[h + '.' + v])) continue;
      const id = 'w-' + h + '.' + v; lists[t].push(id);
      if (In.FAMS[id]) continue;
      In.addFamilies([{ id, H: 'w-' + h, V: v, S: 'w-' + (SALA[h] ? 'sala' : h) + '.' + v, name: (HW[h].name + (VW[v].name ? ' ' + VW[v].name : '')), can: (rec, T, tr) => HW[h].can(rec, tr) || VW[v].can(rec, tr) || (small(rec) && smallNot[h + '.' + v]) || null, build: P => work(P) }]);
    }
    In.addTypes({ [t]: { use: pr.use, fams: lists[t], storeAll: pr.storeAll || 0, open: pr.open || 0, lockNight: pr.lockNight || 0, jobs: pr.jobs, need: pr.need, cells: pr.cells } });
  }
  for (const t in PROG) addProg(t, PROG[t]);

  // ------------------------------ the recipe ------------------------------
  function work(P) {
    const F = P.fam, rec = P.rec, tr = P.tr, L = P.L; const PR = PROG[rec.t];
    const H = F.H.slice(2), V = F.V; const big = L >= 8;
    const t = tr.t, ti = Math.min(0.2, Math.max(0.12, t * 0.6)); const mat = tr.mat;
    // ======== the shell: from the record and the family alone — the same in every attempt, what is seen from afar ========
    // (a store fills its lot: the people's store is what it is for)
    const m = big ? (PR.storeAll ? P.rr(0.12, 0.18) : P.rr(0.15, 0.3)) : P.rr(0.1, 0.2); const sh = [m, m, L - m, L - m];
    let side = null; const aw = big ? P.rr(1.5, 1.9) : P.rr(1.05, 1.25);
    if (H === 'anexo') { side = P.chance(0.5) ? 'esquerda' : 'direita'; if (side === 'esquerda') sh[0] += aw; else sh[2] -= aw; }
    let porch = 0; if (V === 'esteios') { porch = P.rr(1.2, PR.storeAll ? 1.28 : 1.45); sh[3] -= porch; } // (a store on stilts keeps its porch short: its depth is its store)
    const h0 = tr.h0 + (big ? P.rr(0.5, 0.9) : 0.2), h1 = tr.h1 || 2.4; const raised = V === 'esteios' ? P.rr(0.9, 1.2) : 0; const y0 = raised;
    const floors = V === 'andar' || V === 'galeria' ? 2 : 1;
    P.shell = { kind: 'rect', r: sh, t, mat, base: raised ? 'esteios' : 'pedra', floors, eave: y0 + h0 + (floors - 1) * (0.2 + h1) };
    const S = P.shell;
    // the roof: the people's own; a wide hall's at a lower pitch
    const kind = K.roofOf({ t: 'house' }, tr); const along = P.chance(0.75) ? 'u' : 'v'; const span = along === 'u' ? sh[3] - sh[1] : sh[2] - sh[0];
    const rise = kind === 'plano' ? 0 : Math.min(big ? 3.2 : 2.6, span * (big ? 0.55 : 0.8) * 0.82);
    P.roof = { kind, along, h: r2(rise), over: kind === 'plano' ? 0 : 0.42 };
    P.roofGeo = { kind, along, eave: S.eave, rise, R: sh };
    const I = P.inner(); const id = I[3] - I[1]; const cu = (I[0] + I[2]) / 2;
    P.level(0, y0, h0, raised ? 'elevado' : 'piso', I); P.entryLv = 0;
    const c = t / 2; P.outer = P.walls4(0, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h0, 1, 'parede'); P.outers = [P.outer];
    const door = (wall, at, w, ra, rb, kind) => P.door(wall, at, w, Math.min(h0 - 0.2, w > 1.3 ? 2.6 : 2.1), ra, rb, 0, kind || 'porta');
    // (what of the inside the shell must know: the room the way in opens into — for the aisle and the nave, the narrowest
    // the inside may make them —, and the court open to the sky behind the gate)
    let er = I, entryU = cu; const lay = {};
    // (the aisle's middle; its width, at least 1.8 m, the inside's — in a store, down the middle: the bays on either side the
    // same, each cell as wide as a bay and the way in to it; off the middle, one side's cells hold no bay)
    if (H === 'corredor') { const off = P.rr(-0.3, 0.3); lay.cu = entryU = cu + (PR.storeAll ? 0 : off); er = [entryU - 0.9, I[1], entryU + 0.9, I[3]]; }
    else if (H === 'naves') er = [cu - 1.3 + 0.175, I[1], cu + 1.3 - 0.175, I[3]];
    else if (H === 'patio') {
      // (a jail's hall at the back is the guard's, shallower: the yard's wings hold its cells)
      const bd = PR.cells ? P.rr(1.9, 2.3) : P.rr(2.4, 3.0), sw = P.rr(1.9, 2.3);
      const C = [I[0] + sw + ti, I[1] + bd + ti, I[2] - sw - ti, I[3]]; if (C[2] - C[0] < 1.8) { P.errs.push('o pátio não cabe'); return; }
      lay.C = C; lay.bd = bd; er = C; entryU = (C[0] + C[2]) / 2;
      P.shell.court = C.slice(); P.roof.court = C.slice();
    }
    // ---- the lean-to: against one side, its own thin walls, a wide way in from the hall ----
    if (H === 'anexo') {
      const ar = side === 'esquerda' ? [m, sh[1] + P.rr(0, 0.6), sh[0], sh[3]] : [sh[2], sh[1] + P.rr(0, 0.6), L - m, sh[3]];
      const at2 = 0.1; const ah = Math.max(2.1, h0 - 0.5); P.annex.push({ r: ar, h: ah, fn: 'telheiro', lv: 0, roof: 'alpendre' });
      const ai = lay.ai = [ar[0] + (side === 'esquerda' ? at2 : 0), ar[1] + at2, ar[2] - (side === 'direita' ? at2 : 0), ar[3] - at2];
      const cc = at2 / 2; P.walls4(0, [ar[0] + cc, ar[1] + cc, ar[2] - cc, ar[3] - cc], at2, ah, 1, 'parede', side === 'esquerda' ? { direita: 1 } : { esquerda: 1 });
      const wid = side === 'esquerda' ? P.outer.esquerda : P.outer.direita; const lenW = P.wlen(wid); const dw = big ? 1.2 : 0.85;
      door(wid, Math.max(dw / 2 + 0.3, Math.min(lenW - dw / 2 - 0.3, P.atOf(wid, [side === 'esquerda' ? sh[0] : sh[2], (ai[1] + ai[3]) / 2]))), dw, -1, -1, big ? 'vao' : 'porta'); // (the hall and the lean-to, by where it falls)
    }
    // ---- the way in: the front wall, wide where carts come ----
    {
      const dw = Math.min(er[2] - er[0] - 0.4, P.rr(PR.door[0], PR.door[1]));
      const u = Math.max(er[0] + dw / 2 + 0.2, Math.min(er[2] - dw / 2 - 0.2, entryU + P.rr(-0.3, 0.3)));
      const wid = P.outer.frente; const d = P.door(wid, P.atOf(wid, [u, P.walls[wid].a[1]]), dw, Math.min(h0 - 0.2, dw > 1.3 ? 2.6 : 2.15), -1, 'rua', 1, dw > 1.3 ? 'portao' : 'porta');
      P.entrance = { door: d, u, v: sh[3], w: dw, lv: 0 };
    }
    // ---- the storeys: a gallery over the back of the hall, a storey above it all, a cellar under it — their floors (how far a
    // gallery comes, and where the cellar goes, the inside says), the walls going on up ----
    // (a gallery leaves the front of the hall two storeys high: its front wall goes up to the eaves — no storey above has a
    // front wall there —, its other walls up to the gallery's floor, where no floor's edge closes them)
    if (V === 'galeria') { P.level(1, y0 + h0 + 0.2, h1, 'galeria', I); P.walls4(1, [sh[0] + t / 2, sh[1] + t / 2, sh[2] - t / 2, sh[3] - t / 2], t, h1, 1, 'parede', { frente: 1 }); P.walls[P.outer.frente].h = h0 + 0.2 + h1; for (const k of ['fundo', 'esquerda', 'direita']) P.walls[P.outer[k]].h = h0 + 0.2; }
    if (V === 'andar') loftFloorShell(P, y0 + h0 + 0.2, h1, lay.C);
    if (V === 'porao') P.level(-1, -2.1, 1.9, 'porao', I);
    // (the steps up to the porch of a floor on stilts, seen from the street)
    if (V === 'esteios') { const e = P.entrance; const w = Math.max(1.0, e.w + 0.1); P.stair('degraus', -1, 0, [e.u - w / 2, sh[3] + 0.02, e.u + w / 2, sh[3] + porch], 0, -1); }
    workWindows(P);
    if (P.inside()) return;
    // ======== the inside: each attempt's own dice ========
    const rooms = { main: null, front: null, cells: [], court: null, all: [] };
    const room = (fn, r, open) => { const i2 = P.room(0, fn, r, open); rooms.all.push(i2); return i2; };
    const e = P.entrance;
    if (H === 'salao' || H === 'anexo') rooms.main = room('salao', I);
    else if (H === 'frente') {
      // (a front room where one is received — the clerk, the counter —, the hall behind)
      const fd = big ? P.rr(1.9, 2.5) : P.rr(1.35, 1.6); const at = I[3] - fd;
      rooms.main = room('salao', [I[0], I[1], I[2], at - ti / 2]); rooms.front = room('frente', [I[0], at + ti / 2, I[2], I[3]]);
      const w = P.wall(0, [I[0], at], [I[2], at], ti, h0, 0, 'divisoria'); const dw = big ? P.rr(1.3, 1.7) : 0.9;
      door(w, P.atOf(w, [P.rr(I[0] + dw / 2 + 0.4, I[2] - dw / 2 - 0.4), at]), dw, rooms.front, rooms.main, big ? 'vao' : 'porta');
    } else if (H === 'corredor') {
      // (an aisle from the door to the back wall, the cells opening on it to either side; the door within it)
      const awd = PR.storeAll ? P.rr(1.8, 1.9) : P.rr(1.8, 2.2); const ac = lay.cu;
      const a0 = ac - awd / 2, a1 = ac + awd / 2;
      rooms.main = room('corredor', [a0, I[1], a1, I[3]]);
      // (two cells to a side, or three in a deep hall — a store keeps two, big enough for its bays)
      const n = PR.storeAll || id < 6.4 ? 2 : 3; const wl = P.wall(0, [a0 - ti / 2, I[1]], [a0 - ti / 2, I[3]], ti, h0, 0, 'divisoria'), wr = P.wall(0, [a1 + ti / 2, I[3]], [a1 + ti / 2, I[1]], ti, h0, 0, 'divisoria');
      for (const [u0, u1, wall] of [[I[0], a0 - ti, wl], [a1 + ti, I[2], wr]]) {
        let v = I[1]; const cd = (id - (n - 1) * ti) / n;
        for (let q = 0; q < n; q++) {
          const r = [u0, v, u1, v + cd]; const ci = room('cela', r); rooms.cells.push(ci);
          if (q < n - 1) P.wall(0, [u0, v + cd + ti / 2], [u1, v + cd + ti / 2], ti, h0, 0, 'divisoria');
          const vw = PR.cellDoor ? 0.85 : Math.min(1.6, cd - 0.6); door(wall, P.atOf(wall, [wall === wl ? a0 - ti / 2 : a1 + ti / 2, v + cd / 2]), vw, ci, rooms.main, PR.cellDoor || 'vao');
          v += cd + ti;
        }
      }
    } else if (H === 'patio') {
      // (a court open to the sky behind the gate, the hall across its back, a wing to either side — a jail's wings cut into
      // its cells along the yard, each behind its grating)
      const C = lay.C, bd = lay.bd;
      rooms.main = room('salao', [I[0], I[1], I[2], I[1] + bd]); rooms.court = room('patio', C, 1);
      const wl = PR.cells ? null : room('ala', [I[0], C[1], C[0] - ti, I[3]]), wr = PR.cells ? null : room('ala', [C[2] + ti, C[1], I[2], I[3]]); if (!PR.cells) rooms.cells.push(wl, wr);
      const wb = P.wall(0, [I[0], I[1] + bd + ti / 2], [I[2], I[1] + bd + ti / 2], ti, h0, 0, 'parede');
      const sl = P.wall(0, [C[0] - ti / 2, C[1]], [C[0] - ti / 2, I[3]], ti, h0, 0, 'parede'), sr = P.wall(0, [C[2] + ti / 2, I[3]], [C[2] + ti / 2, C[1]], ti, h0, 0, 'parede');
      door(wb, P.atOf(wb, [P.rr(C[0] + 0.7, C[2] - 0.7), I[1] + bd + ti / 2]), big ? 1.3 : 0.9, rooms.main, rooms.court, 'porta');
      if (!PR.cells) { door(sl, P.atOf(sl, [C[0] - ti / 2, P.rr(C[1] + 0.6, I[3] - 0.6)]), 0.9, wl, rooms.court); door(sr, P.atOf(sr, [C[2] + ti / 2, P.rr(C[1] + 0.6, I[3] - 0.6)]), 0.9, wr, rooms.court); }
      else {
        const k = Math.ceil(PR.cells / 2); const len = I[3] - C[1]; const cd = (len - (k - 1) * ti) / k;
        if (cd < 1.6) { P.errs.push('não cabem as celas'); return; } // (a straw bed lies across a short cell)
        for (const [u0, u1, wall, x] of [[I[0], C[0] - ti, sl, C[0] - ti / 2], [C[2] + ti, I[2], sr, C[2] + ti / 2]]) {
          let v = C[1];
          for (let q = 0; q < k; q++) {
            const ci = room('cela', [u0, v, u1, v + cd]); rooms.cells.push(ci);
            if (q < k - 1) P.wall(0, [u0, v + cd + ti / 2], [u1, v + cd + ti / 2], ti, h0, 0, 'divisoria');
            door(wall, P.atOf(wall, [x, v + cd / 2]), 0.85, ci, rooms.court, PR.cellDoor || 'porta'); v += cd + ti;
          }
        }
      }
    } else if (H === 'naves') {
      // (a nave down the middle, an aisle to either side, rows of pillars between: arches open every few steps)
      const nw = P.rr(2.6, 3.2); const n0 = cu - nw / 2, n1 = cu + nw / 2; const pt = 0.35;
      rooms.main = room('nave', [n0 + pt / 2, I[1], n1 - pt / 2, I[3]]);
      const la = room('nave-lateral', [I[0], I[1], n0 - pt / 2, I[3]]), ra = room('nave-lateral', [n1 + pt / 2, I[1], I[2], I[3]]); rooms.cells.push(la, ra);
      for (const [x, aisle] of [[n0, la], [n1, ra]]) {
        const w = P.wall(0, [x, I[1]], [x, I[3]], pt, h0, 0, 'arcada'); const len = P.wlen(w); const k = Math.max(2, Math.round(len / 2.1)); const span2 = len / k;
        // (a temple's — a chief's hall's —: the back bays closed for the first PR.apse metres, the sanctuary where the image
        // or the seat stands)
        for (let q = 0; q < k; q++) { const ow = span2 - pt - 0.05; if (PR.apse && span2 * (q + 0.5) - ow / 2 - 0.12 < PR.apse) continue; door(w, span2 * (q + 0.5), ow, aisle, rooms.main, 'vao'); }
      }
    } else if (H === 'celas') {
      // (the jail's: the guard room behind the door, across the front; a passage across behind it; the cells in a row along
      // the back wall, each behind its grating on the passage)
      const nC = PR.cells || 4; const gd = big ? P.rr(1.8, 2.2) : P.rr(1.5, 1.7), pd = P.rr(1.15, 1.35);
      const vC = I[3] - gd - ti - pd - ti; const cw = (I[2] - I[0] - (nC - 1) * ti) / nC;
      if (vC - I[1] < 2.1 || cw < 1.3) { P.errs.push('não cabem as celas'); return; }
      rooms.front = room('guarda', [I[0], I[3] - gd, I[2], I[3]]); rooms.main = room('passagem', [I[0], vC + ti, I[2], I[3] - gd - ti]);
      const wg = P.wall(0, [I[0], I[3] - gd - ti / 2], [I[2], I[3] - gd - ti / 2], ti, h0, 0, 'divisoria');
      door(wg, P.atOf(wg, [P.rr(I[0] + 0.7, I[2] - 0.7), I[3] - gd - ti / 2]), 0.9, rooms.front, rooms.main, 'porta');
      const wc = P.wall(0, [I[2], vC + ti / 2], [I[0], vC + ti / 2], ti, h0, 0, 'divisoria'); let u = I[0];
      for (let q = 0; q < nC; q++) {
        const ci = room('cela', [u, I[1], u + cw, vC]); rooms.cells.push(ci);
        if (q < nC - 1) P.wall(0, [u + cw + ti / 2, I[1]], [u + cw + ti / 2, vC], ti, h0, 0, 'divisoria');
        door(wc, P.atOf(wc, [u + cw / 2, vC + ti / 2]), 0.85, ci, rooms.main, PR.cellDoor || 'porta'); u += cw + ti;
      }
    } else if (H === 'enfiada') {
      // (the baths': the rooms one after another from the door to the back — the changing room by the door, the cold one, the
      // hot one by the furnace —, each opening into the next)
      const fns = PR.seq || ['vestiario', 'frio', 'quente']; const k = fns.length; const share = PR.share || fns.map(() => 1 / k);
      const free = id - (k - 1) * ti; let v = I[3]; const ids = [];
      for (let q = 0; q < k; q++) {
        const d = q === k - 1 ? v - I[1] : free * share[q] * P.rr(0.94, 1.06); const ri = room(fns[q], [I[0], v - d, I[2], v]); ids.push(ri);
        if (q < k - 1) { const wv = v - d - ti / 2; const w = P.wall(0, [I[0], wv], [I[2], wv], ti, h0, 0, 'divisoria'); door(w, P.atOf(w, [P.rr(I[0] + 0.7, I[2] - 0.7), wv]), 0.9, ri, -1, 'porta'); v = v - d - ti; }
      }
      rooms.front = ids[0]; rooms.main = ids[k - 1]; rooms.cells.push(...ids.slice(1, -1)); rooms.seq = ids;
    }
    if (H === 'anexo') { rooms.lean = P.room(0, 'telheiro', lay.ai); rooms.all.push(rooms.lean); }
    // ---- the storeys: what is on them, the ways up and down ----
    if (V === 'galeria') gallery(P, rooms, I);
    if (V === 'andar') loftFloor(P, rooms, lay.C, ti);
    if (V === 'porao') {
      // (under the roomiest closed room of the ground: a cell of the aisle, the nave's side, the hall)
      const pick = rooms.all.filter(i2 => !P.rooms[i2].open && P.rooms[i2].lv === 0 && !(PR.cells && P.rooms[i2].fn === 'cela') && !(PR.apse && i2 === rooms.main && rooms.all.length > 1)).sort((a, b) => area(P.rooms[b].r) - area(P.rooms[a].r))[0];
      const hold = {}; K.porao(P, hold, P.rooms[pick].r); rooms.cellar = hold.despensa;
    }
    P._rooms = rooms; // (the programme reads the rooms the recipe made)
    PR.furnish(P, rooms);
  }
  // the gallery: a floor over the back of the hall at the height of a storey — across the whole back, over the cells and the
  // aisle, the naves and their arcades, when they flank it —, the front left the height of two storeys; a rail along its
  // edge, a stair up to it
  function gallery(P, rooms, I) {
    const L1 = P.lvl(1); const M = P.rooms[rooms.main].r; const depth = Math.min(M[3] - M[1] - 2.2, P.rr(2.2, 3.0)); if (depth < 1.8) { P.errs.push('o salão é raso demais para uma galeria'); return; }
    const wide = rooms.cells.length && !rooms.court; const area = wide ? [I[0], I[1], I[2], I[1] + depth] : [M[0], M[1], M[2], M[1] + depth];
    L1.area = area.slice(); rooms.up = [P.room(1, 'galeria', area)];
    const rail = P.wall(1, [area[2], area[3]], [area[0], area[3]], 0.06, 1.0, 0, 'guarda-corpo');
    // (the stair along a side wall of the hall, up toward the back, its top on the gallery)
    const sw = 0.75, run = P.rr(1.8, 2.2); const cands = [];
    for (const u0 of P.shuffle([M[0] + 0.03, M[2] - 0.03 - sw])) cands.push({ r: [u0, area[3] + 0.02, u0 + sw, area[3] + 0.02 + run], du: 0, dv: -1 });
    // (or from a cell or an aisle beside the hall, up to the gallery's edge)
    for (const id of rooms.cells) { const C = P.rooms[id].r; if (C[3] <= area[3] + 0.5) continue; for (const u0 of [C[0] + 0.03, C[2] - 0.03 - sw]) cands.push({ r: [u0, Math.max(C[1], area[3]) + 0.02, u0 + sw, Math.max(C[1], area[3]) + 0.02 + run], du: 0, dv: -1 }); }
    // (and a ladder, where a stair does not go)
    for (const id of [rooms.main].concat(rooms.cells)) { const C = P.rooms[id].r; if (C[3] <= area[3] + 0.5) continue; for (const u0 of [C[0] + 0.03, C[2] - 0.63]) cands.push({ r: [u0, Math.max(C[1], area[3]) + 0.02, u0 + 0.6, Math.max(C[1], area[3]) + 0.67], du: 0, dv: -1, ladder: 1 }); }
    const st = K.ladderAt(P, 0, 1, cands.filter(c => !c.ladder), null, 'escada') || K.ladderAt(P, 0, 1, cands.filter(c => c.ladder)); if (!st) { P.errs.push('não cabe a escada da galeria'); return; }
    P.hole(rail, P.atOf(rail, [(st.r[0] + st.r[2]) / 2, area[3]]), sw + 0.1, 1.0, 0, 'vao');
  }
  // the storey above (a store, the master's rooms), as the shell has it: its floor, the walls going on up — round a court
  // open to the street, over the wings and the hall behind it only, its front wall over the wings (the court open to the sky
  // from the ground up)
  function loftFloorShell(P, y1, h1, C) {
    const S = P.shell; const sh = S.r; const t = Math.min(S.t, 0.22); const I1 = [sh[0] + t, sh[1] + t, sh[2] - t, sh[3] - t];
    P.level(1, y1, h1, 'andar', I1);
    const c = t / 2; const R = [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c];
    if (!C) { P.outers.push(P.walls4(1, R, t, h1, 1, 'parede')); return; }
    const O = P.walls4(1, R, t, h1, 1, 'parede', { frente: 1 });
    O.frente = P.wall(1, [R[2], R[3]], [C[2], R[3]], t, h1, 1, 'parede'); P.outers.push(O, { frente: P.wall(1, [C[0], R[3]], [R[0], R[3]], t, h1, 1, 'parede') });
  }
  // its inside: one room — or, round a court, three: the wings' and the hall's, their walls on the court, the wings' doors
  // into the hall's —, a stair from the hall through a trapdoor (or a ladder)
  function loftFloor(P, rooms, C, ti) {
    const L1 = P.lvl(1); const I1 = L1.area.slice();
    if (C) {
      const ib = P.room(1, 'sobrado', [I1[0], I1[1], I1[2], C[1] - ti]), il = P.room(1, 'sobrado', [I1[0], C[1], C[0] - ti, I1[3]]), ir = P.room(1, 'sobrado', [C[2] + ti, C[1], I1[2], I1[3]]); rooms.up = [ib, il, ir];
      const wb = P.wall(1, [I1[0], C[1] - ti / 2], [I1[2], C[1] - ti / 2], ti, L1.h, 0, 'parede');
      P.wall(1, [C[0] - ti / 2, C[1]], [C[0] - ti / 2, I1[3]], ti, L1.h, 0, 'parede'); P.wall(1, [C[2] + ti / 2, I1[3]], [C[2] + ti / 2, C[1]], ti, L1.h, 0, 'parede');
      for (const id of [il, ir]) { const r = P.rooms[id].r; P.door(wb, P.atOf(wb, [P.rr(r[0] + 0.55, r[2] - 0.55), C[1] - ti / 2]), 0.85, Math.min(2.05, L1.h - 0.15), ib, id, 0, 'porta'); }
    } else rooms.up = [P.room(1, 'sobrado', I1)];
    const sw = 0.75, run = P.rr(1.5, 1.8); const cands = [], lc = [];
    for (const id of [rooms.main].concat(P.T.cells ? [] : rooms.cells, rooms.front !== undefined && rooms.front !== null ? [rooms.front] : [])) {
      const M = P.rooms[id].r; if (P.rooms[id].open) continue;
      for (const u0 of P.shuffle([M[0] + 0.03, M[2] - 0.03 - sw])) for (const v0 of [M[1] + 0.6, M[1] + 1.2, M[3] - run - 0.7]) { const r = [u0, v0, u0 + sw, v0 + run]; cands.push({ r, du: 0, dv: -1, hole: r }); }
      for (const u0 of [M[0] + 0.03, M[2] - 0.63]) for (const v0 of [M[1] + 0.6, M[1] + 1.4]) { const r = [u0, v0, u0 + 0.6, v0 + 0.65]; lc.push({ r, du: 0, dv: -1, hole: r }); }
    }
    if (!K.ladderAt(P, 0, 1, cands, null, 'escada') && !K.ladderAt(P, 0, 1, lc)) P.errs.push('não cabe a escada do sobrado');
  }
  // windows high in the walls of a store (light, not thieves), lower in a shop or a workshop
  const WORLD = { S: { frente: 4, fundo: 1, direita: 2, esquerda: 8 }, N: { frente: 1, fundo: 4, direita: 8, esquerda: 2 }, E: { frente: 2, fundo: 8, direita: 1, esquerda: 4 }, W: { frente: 8, fundo: 2, direita: 4, esquerda: 1 } };
  function workWindows(P) {
    const rec = P.rec; const store = !!PROG[rec.t].storeAll && rec.t !== 'mercado';
    for (const O of P.outers) for (const k of ['frente', 'fundo', 'esquerda', 'direita']) {
      const id = O[k]; if (id === undefined || (rec.pw & WORLD[rec.s][k])) continue;
      if (P.annex.length && ((k === 'esquerda' && P.shell.r[0] > 0.6) || (k === 'direita' && P.shell.r[2] < P.L - 0.6))) continue;
      if (P.L < 8 && k === 'fundo') continue; // (a small shop keeps its back wall whole: the hooks, the shelves, the forge)
      const len = P.wlen(id); const n = Math.max(0, Math.floor(len / 2.6));
      for (let q = 0; q < n; q++) {
        const at = len * (q + 0.5) / n + P.rr(-0.2, 0.2); const ww = store ? 0.5 : P.rr(0.7, 1.0); const sill = store ? Math.max(1.6, P.walls[id].h - 0.8) : P.rr(0.9, 1.1);
        if (P.holes.some(h => h.wall === id && Math.abs(h.at - at) < (h.w + ww) / 2 + 0.3) || at < ww / 2 + 0.3 || at > len - ww / 2 - 0.3) continue;
        P.window(id, at, ww, Math.max(0.3, Math.min(1.0, P.walls[id].h - sill - 0.2)), sill);
      }
    }
  }

  // ------------------------------ the furnishing of each kind of work ------------------------------
  const roomsFor = rooms => [rooms.main].concat(rooms.cells, rooms.up || [], rooms.lean !== undefined ? [rooms.lean] : [], rooms.cellar !== undefined ? [rooms.cellar] : [], rooms.front !== undefined ? [rooms.front] : []).filter(x => x !== undefined && x !== null);
  const lvOf = (P, id) => P.rooms[id].lv;
  // (from the fifth attempt on, the rooms are tried in another order: the attempts on one shell must differ)
  const mix = (P, a) => (P.attempt >= 4 ? P.shuffle(a) : a);
  const storeCap = P => P.items.reduce((n, it) => n + (In.ITEMS[it.kind].store && In.ITEMS[it.kind].store.dep === 'povo' ? (it.cap || In.ITEMS[it.kind].store.cap) : 0), 0);
  // the people's store: bays, shelves, bins and barrels round the walls until they hold what the building keeps; the clerk
  // who counts what comes in, by the door
  function keepFurnish(P, kinds, docks) {
    const def = G.BDEF[P.rec.t] || {}; const goal = def.storage || 0; const rooms = P._rooms;
    const ids = mix(P, roomsFor(rooms)); const clerk = rooms.front !== undefined && rooms.front !== null ? rooms.front : rooms.main;
    // (the rooms of the ground, the one by the door first)
    const near = [clerk, rooms.main].concat(rooms.cells, [rooms.lean, rooms.court]).filter((x, q, a) => x !== undefined && x !== null && a.indexOf(x) === q && P.rooms[x].lv === 0);
    // (the clerk's table by the door; where the harbour's stevedores work, the head counts there: wherever it goes)
    const desk = () => { for (const id of docks ? near : [clerk]) if (P.place('mesa-conferencia', 0, id, { sides: ['livre'], margin: 0.3 }) || P.place('mesa-escriba', 0, id)) return; };
    // (the loading floors, by the door first: one for each stevedore but the head)
    const dock = () => {
      let got = 0; for (const id of near) { let g = 0; while (got < docks && g++ < 4) { if (!P.place('estrado', 0, id)) break; got++; } }
      if (got < docks) P.errs.push(`só ${got} estrados de carga (para ${docks})`);
    };
    const bays = () => {
      for (const k of P.attempt >= 4 ? P.shuffle(kinds) : P.attempt % 2 ? kinds.slice().reverse() : kinds) for (const id of ids) { let g = 0; while (storeCap(P) < goal && g++ < 14) if (!P.place(k, lvOf(P, id), id)) break; if (storeCap(P) >= goal) return; }
      for (const id of ids) { let g = 0; while (storeCap(P) < goal && g++ < 14) if (!P.place('prateleira', lvOf(P, id), id) && !P.place('pipas', lvOf(P, id), id)) break; }
    };
    if (P.attempt % 2) { desk(); if (docks) dock(); bays(); } else { if (docks) dock(); bays(); desk(); }
    if (storeCap(P) < goal) P.errs.push(`depósitos para ${storeCap(P)} (guarda ${goal})`);
  }
  // the market: stalls down the hall (or under the arches, round the court, in the cells), a counter by the door, the
  // shelves of the people's store at the back
  function marketFurnish(P) {
    const rooms = P._rooms; const def = G.BDEF[P.rec.t] || {}; const goal = def.storage || 0; const ids = mix(P, roomsFor(rooms));
    // (the stalls: down the hall and the naves, round the court; in each shop cell a small one, its buyers in the aisle — the
    // three the merchants need, then the store, then more where room is left)
    const where = mix(P, [rooms.court, ...rooms.cells, rooms.main, rooms.front].filter(x => x !== undefined && x !== null)); const used = new Set(); let n = 0;
    const stalls = upto => {
      for (const id of where) {
        const cell = rooms.cells.includes(id) && P.rooms[id].fn === 'cela'; if (cell && used.has(id)) continue; let g = 0;
        // (where a stall does not fit — a narrow wing —, the small one)
        while (n < upto && g++ < (cell ? 1 : 6)) { if (!(cell && P.place('banquinha', lvOf(P, id), id, { sides: ['livre'], margin: 0.2 })) && !P.place('banca', lvOf(P, id), id, { sides: ['livre'], margin: 0.35 }) && !(!cell && P.place('banquinha', lvOf(P, id), id, { sides: ['livre'], margin: 0.2 }))) break; n++; used.add(id); }
      }
    };
    const store = () => { for (const id of ids.slice().reverse()) { let g = 0; while (storeCap(P) < goal && g++ < 10) if (!P.place('prateleira', lvOf(P, id), id) && !P.place('baia', lvOf(P, id), id)) break; } if (storeCap(P) < goal) P.errs.push(`depósitos para ${storeCap(P)} (guarda ${goal})`); };
    if (P.attempt % 2) { store(); stalls(3); } else { stalls(3); store(); }
    if (n < 3) P.errs.push(`só ${n} bancas`);
    P.opt(() => stalls(6));
  }
  // a trade: its work stations (the ones the trade employs: it is not built without them), what keeps its goods, its tools
  function tradeFurnish(P, stations, keeps, tools, hot) {
    const rooms = P._rooms; const ids = mix(P, roomsFor(rooms)); const work = mix(P, [rooms.lean, rooms.court, rooms.main, ...rooms.cells, rooms.front].filter(x => x !== undefined && x !== null));
    const st = () => { for (const [k, n] of stations) { let got = 0; for (const id of work) { let g = 0; while (got < n && g++ < 6) { if (!P.place(k, lvOf(P, id), id)) break; got++; } if (got >= n) break; } if (got < n) P.errs.push(`sem lugar para ${In.ITEMS[k].name.toLowerCase()}`); } };
    const hotOnes = () => { for (const k of hot || []) { let ok = false; for (const id of work) { if (P.place(k, lvOf(P, id), id)) { ok = true; break; } } if (!ok) P.errs.push(`sem lugar para ${In.ITEMS[k].name.toLowerCase()}`); } };
    const keep = () => { let ok = false; for (const k of keeps) for (const id of ids) { if (ok) break; if (P.place(k, lvOf(P, id), id)) ok = true; } if (!ok) P.errs.push('sem lugar para guardar o que se faz'); };
    const order = [[hotOnes, st, keep], [st, hotOnes, keep], [keep, hotOnes, st]][P.attempt % 3]; for (const f of order) f();
    P.opt(() => { for (const k of tools) for (const id of work) if (P.place(k, lvOf(P, id), id)) break; });
    // (a counter by the door of a shop that sells across it)
    if (rooms.front !== undefined) P.opt(() => P.place('balcao', 0, rooms.front, { sides: ['livre'], margin: 0.3 }));
  }
  // (the other buildings this recipe lays out — the temple, the barracks, the jail, the baths, the chief's hall — register
  // their programmes here, with their own furnishing: int-civicos.js)
  In.WORK = { add: addProg, roomsFor, lvOf, mix, storeCap };
  // the tavern: the counter and its barrels, the hearth, tables and benches through the hall (and the court, the cells)
  function tavernFurnish(P) {
    const rooms = P._rooms; const tr = P.tr; const ids = mix(P, roomsFor(rooms)); const hall = mix(P, [rooms.main, rooms.court, ...rooms.cells, rooms.front].filter(x => x !== undefined && x !== null));
    const counter = () => { let ok = false; for (const id of [rooms.front, rooms.main].filter(x => x !== undefined && x !== null)) if (P.place('balcao', 0, id, { sides: ['livre'], margin: 0.3 })) { ok = true; break; } if (!ok) P.errs.push('sem lugar para o balcão'); };
    const fire = () => { let ok = false; for (const id of hall) { if (lvOf(P, id) !== 0 || P.rooms[id].open) continue; if (P.place(tr.fire === 'lar' ? 'fogao' : tr.fire === 'forno' ? 'fogao' : tr.fire, 0, id) || P.place('braseiro', 0, id)) { ok = true; break; } } if (!ok) P.errs.push('sem lugar para o fogo'); };
    const barrels = () => { let ok = false; for (const id of (rooms.cellar !== undefined ? [rooms.cellar] : []).concat(ids)) if (P.place('pipas', lvOf(P, id), id)) { ok = true; break; } if (!ok) P.errs.push('sem lugar para as pipas'); };
    const tables = () => { let n = 0; for (const id of hall) { let g = 0; while (n < 4 && g++ < 4) { if (!P.place('mesa', lvOf(P, id), id, { sides: ['livre'], margin: 0.4 })) break; n++; P.opt(() => P.place('banco', lvOf(P, id), id)); } } if (n < 2) P.errs.push(`só ${n} mesas`); };
    const order = [[counter, fire, barrels, tables], [fire, counter, tables, barrels], [counter, tables, fire, barrels]][P.attempt % 3]; for (const f of order) f();
    // (the vat where the keeper brews the town's beer or pulque — wine and mead come from the stores: tavern.js —, in the
    // cellar, else at the back)
    P.opt(() => { for (const id of (rooms.cellar !== undefined ? [rooms.cellar] : []).concat(roomsFor(rooms).slice().reverse())) if (P.place('cuba', lvOf(P, id), id)) break; });
  }
})(window.G);
