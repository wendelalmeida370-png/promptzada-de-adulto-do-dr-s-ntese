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
    // (the pottery's and the tavern's: the roofed part at the back, the yard before it — B2d, yardWork)
    terreiro: { name: 'Terreiro', can: rec => (small(rec) ? 'num lote de 4 m não cabe um terreiro' : null) },
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
  // work stations (BDEF.jobs); door: the width of its way in (carts at a storehouse); aisle: in a store of three naves, the
  // depth its side aisles keep — its pieces and the place before them (naveOf, L-499); court: the least width of its court
  // (a temple's, for its altar: L-501); furnish: what goes in
  const ALLH = ['salao', 'frente', 'corredor', 'patio', 'naves', 'anexo'];
  const PROG = {
    storehouse: { use: 'armazem', H: ['salao', 'frente', 'corredor', 'patio', 'naves'], V: ['terreo', 'galeria', 'porao', 'esteios', 'andar'], storeAll: 1, aisle: 2.25, lockNight: 1, door: [1.6, 2.0], furnish: P => keepFurnish(P, ['baia', 'prateleira', 'pipas', 'baia']) },
    // (the harbour's storehouse: its stevedores set the crates down on the loading floors by the door, their head counts them)
    armazem: { use: 'armazem', H: ['salao', 'frente', 'corredor', 'patio', 'naves'], V: ['terreo', 'galeria', 'porao', 'esteios', 'andar'], storeAll: 1, lockNight: 1, door: [1.6, 2.0], furnish: P => keepFurnish(P, ['baia', 'pipas', 'prateleira', 'baia'], 2) },
    celeiro: { use: 'celeiro', H: ['salao', 'frente', 'corredor', 'naves'], V: ['terreo', 'galeria', 'esteios', 'andar'], storeAll: 1, aisle: 2.15, lockNight: 1, door: [1.4, 1.8], furnish: P => keepFurnish(P, ['tulha', 'tulha', 'baia']) },
    mercado: { use: 'mercado', H: ['salao', 'frente', 'corredor', 'patio', 'naves'], V: ['terreo', 'galeria', 'porao', 'andar'], storeAll: 1, open: 1, lockNight: 1, door: [1.4, 1.8], furnish: marketFurnish },
    workshop: { use: 'oficina', H: ['salao', 'frente', 'patio', 'anexo'], V: ['terreo', 'galeria', 'porao', 'andar'], open: 1, lockNight: 1, jobs: 2, door: [1.0, 1.3], furnish: P => tradeFurnish(P, [['bancada', 2]], ['prateleira', 'secador'], ['cepo']) },
    forja: { use: 'forja', H: ['salao', 'frente', 'patio', 'anexo'], V: ['terreo', 'galeria', 'andar'], open: 1, lockNight: 1, door: [1.0, 1.3], hot: 'forja-fogo', furnish: P => tradeFurnish(P, [['forja-fogo', 1], ['bancada', 1]], ['prateleira'], ['bigorna', 'tina']) },
    tecelagem: { use: 'tecelagem', H: ['salao', 'frente', 'patio', 'naves'], V: ['terreo', 'galeria', 'andar'], open: 1, lockNight: 1, door: [1.0, 1.3], furnish: P => tradeFurnish(P, [['tear', 3]], ['secador', 'prateleira'], []) },
    // (the pottery: the yard first, where it is laid out — the kiln, the racks and the brick work under the sky, as the god draws it)
    olaria: { use: 'olaria', H: ['terreiro', 'salao', 'frente', 'patio', 'anexo'], V: ['terreo', 'galeria', 'andar'], skip: { 'terreiro.galeria': 1, 'terreiro.andar': 1 }, prefer: (rec, l) => preferYard(rec, l), open: 1, lockNight: 1, door: [1.0, 1.3], hot: 'forno-olaria', furnish: P => { tradeFurnish(P, [['roda-oleiro', 2]], ['secador'], [], ['forno-olaria']); bricks(P); } },
    acougue: { use: 'acougue', H: ['salao', 'frente', 'anexo'], V: ['terreo', 'porao', 'andar'], open: 1, lockNight: 1, door: [0.9, 1.1], furnish: P => tradeFurnish(P, [['cepo', 1]], ['ganchos'], ['balcao']) },
    ourives: { use: 'ourives', H: ['salao', 'frente', 'anexo'], V: ['terreo', 'porao', 'andar'], open: 1, lockNight: 1, door: [0.85, 1.0], furnish: P => tradeFurnish(P, [['bancada-ourives', 1]], ['cofre'], ['fornalha']) },
    // (the tavern is laid out by its own grammar, by zones: below, «the tavern» — D-720)
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
      In.addFamilies([{ id, H: 'w-' + h, V: v, S: 'w-' + (SALA[h] ? 'sala' : h) + '.' + v, name: (HW[h].name + (VW[v].name ? ' ' + VW[v].name : '')), can: (rec, T, tr) => HW[h].can(rec, tr) || VW[v].can(rec, tr) || (small(rec) && smallNot[h + '.' + v]) || null, build: P => (h === 'terreiro' ? yardWork(P) : work(P)) }]);
    }
    In.addTypes({ [t]: { use: pr.use, fams: lists[t], storeAll: pr.storeAll || 0, open: pr.open || 0, lockNight: pr.lockNight || 0, jobs: pr.jobs, need: pr.need, cells: pr.cells, prefer: pr.prefer } });
  }
  for (const t in PROG) addProg(t, PROG[t]);

  // (the middle of the front door along the front, metres, before one of the record's open tiles — a tile is 4 m of the
  // front, as a house's entrance has it —: where it falls before one, as it is; else the nearest place before one within
  // lo..hi, the room it opens into, half the door and a hand in from the tile's ends; where none is, as it was. No chance
  // drawn: a plan whose door was before an open tile is the same — L-209)
  function openFront(P, u, dw, lo, hi) {
    const o = P.rec.o; if (!o || ((o >> Math.floor(u / 4)) & 1)) return u;
    const m = Math.min(1.9, dw / 2 + 0.1); let best = null;
    for (let k = 0; k < P.b.w; k++) { if (!((o >> k) & 1)) continue; const a = Math.max(lo, 4 * k + m), z = Math.min(hi, 4 * k + 4 - m); if (a > z) continue; const q = Math.max(a, Math.min(z, u)); if (best === null || Math.abs(q - u) < Math.abs(best - u)) best = q; }
    return best === null ? u : best;
  }
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
    else if (H === 'naves') { const nv = naveOf(PR, I); er = [cu - nv[0] / 2 + 0.175, I[1], cu + nv[0] / 2 - 0.175, I[3]]; }
    else if (H === 'patio') {
      // (a jail's hall at the back is the guard's, shallower: the yard's wings hold its cells; a temple's court as wide as its
      // altar wants — PR.court: the altar of 1.2 m and a way past it either side —: in a court of 1.8 m between wings of 2.3 the
      // altar went nowhere, the hall behind too shallow for it, and the temple had no plan on other dice — L-501, T-436)
      const bd = PR.cells ? P.rr(1.9, 2.3) : P.rr(2.4, 3.0), sw = P.rr(1.9, PR.court ? Math.max(1.9, Math.min(2.3, (I[2] - I[0] - 2 * ti - PR.court) / 2)) : 2.3);
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
    // ---- the way in: the front wall, wide where carts come — before a tile of the street one can stand on, as a house's
    // (the record's open tiles along the side): where the room's middle falls before a closed one, along the front to the
    // nearest open one the room it opens into takes (L-209: a door before a cliff, its people out by another) ----
    {
      const dw = Math.min(er[2] - er[0] - 0.4, P.rr(PR.door[0], PR.door[1]));
      const u = openFront(P, Math.max(er[0] + dw / 2 + 0.2, Math.min(er[2] - dw / 2 - 0.2, entryU + P.rr(-0.3, 0.3))), dw, er[0] + dw / 2 + 0.2, er[2] - dw / 2 - 0.2);
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
      const nv = naveOf(PR, I), nw = P.rr(nv[0], nv[1]); const n0 = cu - nw / 2, n1 = cu + nw / 2; const pt = 0.35;
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
    // (a temple's never in the cella where the image and the altar stand, where there is a room beside it — as its cellar's
    // hatch —: up the cella's back the stair took the priest's way to his place behind the altar, L-391)
    const altar = !!(PROG[P.rec.t].need || {}).altar;
    const downs = [rooms.main].concat(P.T.cells ? [] : rooms.cells, rooms.front !== undefined && rooms.front !== null ? [rooms.front] : []).filter((id, q, a) => !(altar && id === rooms.main && a.length > 1));
    for (const id of downs) {
      const M = P.rooms[id].r; if (P.rooms[id].open) continue;
      for (const u0 of P.shuffle([M[0] + 0.03, M[2] - 0.03 - sw])) for (const v0 of [M[1] + 0.6, M[1] + 1.2, M[3] - run - 0.7]) { const r = [u0, v0, u0 + sw, v0 + run]; cands.push({ r, du: 0, dv: -1, hole: r }); }
      for (const u0 of [M[0] + 0.03, M[2] - 0.63]) for (const v0 of [M[1] + 0.6, M[1] + 1.4]) { const r = [u0, v0, u0 + 0.6, v0 + 0.65]; lc.push({ r, du: 0, dv: -1, hole: r }); }
    }
    // (the last try, in a shop cut in two shallow rooms: a ladder along a wall in a corner of one of them)
    if (!K.ladderAt(P, 0, 1, cands, null, 'escada') && !K.ladderAt(P, 0, 1, lc) && !K.ladderAt(P, 0, 1, K.sideLadders(P, downs))) P.errs.push('não cabe a escada do sobrado');
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
  // (the nave's width, from the narrowest to the widest: 2.6 to 3.2 m — in a store, the aisles either side as deep as its pieces
  // and the place one stands before them, the body in it (PR.aisle: the granary's bins want 2.15 m, the storehouse's bays 2.25):
  // on a lot of 8 m a nave of 3 m left aisles of 1.85, the bins went nowhere, and the granary on stilts held 88 to 92 sacks of
  // its 110, the storehouse 136 of its 150 — L-499, found on other dice, T-436)
  const naveOf = (PR, I) => { const hi = PR.aisle ? Math.min(3.2, I[2] - I[0] - 0.35 - 2 * PR.aisle) : 3.2; return [Math.min(2.6, hi), Math.max(Math.min(2.6, hi), hi)]; };
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
    // (the last resort, once every attempt of the recipe left a station out — the round In.plan makes only then: L-182. A
    // tall station goes against a wall and never before a window, and on some lots the shell's windows leave the outer
    // walls too short for it — a loom of 1.3 m beside two windows, the hall kept clear by the arches —: what did not go in
    // on the ground goes up to the gallery, against its walls, and then stands free in a room of the ground)
    const lastResort = (k, m) => {
      let got = 0;
      for (const id of (rooms.up || []).filter(i => P.rooms[i].fn === 'galeria')) { let g = 0; while (got < m && g++ < 6) { if (!P.place(k, lvOf(P, id), id)) break; got++; } }
      for (const id of work) { if (lvOf(P, id) !== 0) continue; let g = 0; while (got < m && g++ < 6) { if (!P.place(k, 0, id, { sides: ['livre'] })) break; got++; } }
      return got;
    };
    const st = () => { for (const [k, n] of stations) { let got = 0; for (const id of work) { let g = 0; while (got < n && g++ < 6) { if (!P.place(k, lvOf(P, id), id)) break; got++; } if (got >= n) break; } if (got < n && P.last) got += lastResort(k, n - got); if (got < n) { P.lack = 1; P.errs.push(`sem lugar para ${In.ITEMS[k].name.toLowerCase()}`); } } };
    const hotOnes = () => { for (const k of hot || []) { let ok = false; for (const id of work) { if (P.place(k, lvOf(P, id), id)) { ok = true; break; } } if (!ok) P.errs.push(`sem lugar para ${In.ITEMS[k].name.toLowerCase()}`); } };
    const keep = () => { let ok = false; for (const k of keeps) for (const id of ids) { if (ok) break; if (P.place(k, lvOf(P, id), id)) ok = true; } if (!ok) P.errs.push('sem lugar para guardar o que se faz'); };
    const order = [[hotOnes, st, keep], [st, hotOnes, keep], [keep, hotOnes, st]][P.attempt % 3]; for (const f of order) f();
    P.opt(() => { for (const k of tools) for (const id of work) if (P.place(k, lvOf(P, id), id)) break; });
    // (a counter by the door of a shop that sells across it)
    if (rooms.front !== undefined) P.opt(() => P.place('balcao', 0, rooms.front, { sides: ['livre'], margin: 0.3 }));
  }
  // the pottery's brick work, where there is room (P2's olaria): the clay pit and the moulding floor in the court — else the
  // ground floor —, the stack of bricks by the kiln's room, the bench where the clay is worked
  function bricks(P) {
    const rooms = P._rooms; const ground = mix(P, [rooms.court, rooms.lean, rooms.main, ...rooms.cells, rooms.front].filter(x => x !== undefined && x !== null && lvOf(P, x) === 0));
    for (const k of ['tanque-barro', 'eira']) P.opt(() => { for (const id of ground) if (P.place(k, 0, id, { sides: ['livre'] })) break; });
    P.opt(() => { for (const id of ground) if (P.place('pilha-tijolos', 0, id)) break; });
    P.opt(() => { for (const id of ground) if (P.place('bancada', 0, id, { sides: ['fundo', 'esquerda', 'direita'] })) break; });
  }
  // (the other buildings this recipe lays out — the temple, the barracks, the jail, the baths, the chief's hall — register
  // their programmes here, with their own furnishing: int-civicos.js)
  In.WORK = { add: addProg, roomsFor, lvOf, mix, storeCap };
  // ------------------------------ the yard (B2d) ------------------------------
  // the pottery and the tavern of a lot of 8 m as the god draws them (EXT.olaria, EXT.taverna): the roofed part at the back —
  // the potter's shed in a corner, the tavern's house across it, the northern mead hall — and the yard before it, fenced low,
  // open to the sky, its gate on the street. What is used in the yard stands there from the shell on (P.at with { yard: 1 },
  // before P.inside()) — the kiln, the drying racks, the stack of bricks, the moulding floor, the wheel, the clay pit; the
  // table with its benches, the barrels, the jar —, so the god's view, the 3D from afar and the body see and use the same
  // pieces (shellOut.yard). Laid out by hand, as the god draws it with the gate before the first tile of the front; all of it
  // mirrored where only the other one is open to the street. No chance drawn: every pottery's yard is the same (inside its
  // shed and the tavern's house, each attempt's own)
  // (the lot's metres before the mirror: the yard's fence, its outer faces; the roofed part, and its door into the yard along
  // its front; the gate along the front; the yard's rooms, open to the sky; its pieces [kind, r, fu, fv, extra])
  const YARD = {
    olaria: () => ({ yard: [0.32, 0.32, 7.68, 7.68], house: [0.32, 0.32, 3.8, 3.2], door: 3.0, dw: 1.0, gate: 3.3, gw: 1.2,
      rooms: [[0.52, 3.2, 3.8, 7.48], [3.8, 0.52, 7.48, 7.48]],
      pieces: [['forno-olaria', [4.7, 0.6, 7.3, 3.2], 0, 1, { h: 2.6 }], ['secador', [4.2, 4.5, 7.4, 5.0], 0, 1, { h: 0.7 }], ['secador', [4.2, 5.95, 7.4, 6.45], 0, 1, { h: 0.7 }],
        ['pilha-tijolos', [3.86, 1.3, 4.66, 2.7], 0, 1], ['eira', [0.62, 3.3, 2.22, 5.3], 1, 0], ['roda-oleiro', [2.6, 5.4, 3.4, 6.2], -1, 0], ['tanque-barro', [0.62, 6.0, 1.52, 7.2], 1, 0]] }),
  };
  // (of the families the catalogue offers, the yard's, where one is laid out)
  function preferYard(rec, list) { const y = list.filter(f => f.startsWith('w-terreiro.')); return y.length ? y : list; }
  // the parts of a line [a, b] the other one [c0, c1] leaves (the fence along a side, where the roofed part's wall is not)
  const runs = (a, b, c0, c1) => { const lo = Math.min(a, b), hi = Math.max(a, b); const out = []; if (c1 <= lo + 0.05 || c0 >= hi - 0.05) out.push([lo, hi]); else { if (c0 > lo + 0.05) out.push([lo, c0]); if (c1 < hi - 0.05) out.push([c1, hi]); } return out; };
  function yardWork(P) {
    const rec = P.rec, tr = P.tr, L = P.L; const V = P.fam.V; const t = tr.t, mat = tr.mat;
    if (!YARD[rec.t]) { P.errs.push(`o terreiro não é de ${rec.t}`); return; } // (the taverna's of before: D-720)
    const Y = YARD[rec.t](rec); const ft = 0.2, fh = 1.1; const c2 = ft / 2;
    // (only the other tile of the front open to the street: all of it mirrored)
    const o = rec.o || 0; const flip = !(o & 1) && !!(o & 2);
    const X = u => (flip ? L - u : u); const XR = r => (flip ? [L - r[2], r[1], L - r[0], r[3]] : r.slice());
    // ======== the shell: the roofed part, its door into the yard; the fence, the gate, the yard's rooms and pieces ========
    const floors = V === 'andar' ? 2 : 1; const sh = XR(Y.house);
    const h0 = r2(floors > 1 ? tr.h0 + 0.2 : Math.max(2.8, tr.h0 + 0.6)), h1 = tr.h1 || 2.4;
    P.shell = { kind: 'rect', r: sh, t, mat, base: 'pedra', floors, eave: h0 + (floors - 1) * (0.2 + h1) };
    // (the roof: the people's own, its ridge along the longer side)
    const kind = K.roofOf({ t: 'house' }, tr); const along = sh[2] - sh[0] >= sh[3] - sh[1] ? 'u' : 'v'; const span = along === 'u' ? sh[3] - sh[1] : sh[2] - sh[0];
    const rise = kind === 'plano' ? 0 : Math.min(2.6, span * 0.8 * 0.82);
    P.roof = { kind, along, h: r2(rise), over: kind === 'plano' ? 0 : 0.42 }; P.roofGeo = { kind, along, eave: P.shell.eave, rise, R: sh };
    const I = P.inner(); P.level(0, 0, h0, 'piso', I); P.entryLv = 0;
    const c = t / 2; P.outer = P.walls4(0, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h0, 1, 'parede'); P.outers = [P.outer];
    { const wid = P.outer.frente; P.door(wid, P.atOf(wid, [X(Y.door), P.walls[wid].a[1]]), Y.dw, Math.min(h0 - 0.2, 2.1), -1, -1, 0, 'porta'); }
    // (the fence round the yard, but along the roofed part's own walls; the gate in its front)
    const yr = Y.yard, H = Y.house; let gate = -1;
    // (along a side — v or u fixed at `at`, from a to b —, where the roofed part's wall [c0, c1] is not; the front, with the gate)
    const along2 = (fixed, at, a, b, c0, c1, front) => { for (const [p0, p1] of runs(a, b, c0, c1)) {
      const A = fixed === 'v' ? [p0, at] : [at, p0], B = fixed === 'v' ? [p1, at] : [at, p1];
      const w = P.wall(0, [X(A[0]), A[1]], [X(B[0]), B[1]], ft, fh, 1, 'cerca');
      if (front && Y.gate > p0 + Y.gw / 2 && Y.gate < p1 - Y.gw / 2) gate = P.door(w, P.atOf(w, [X(Y.gate), at]), Y.gw, 2.2, -1, 'rua', 1, 'portao');
    } };
    const on = (a, b) => Math.abs(a - b) < 0.05; const back = on(H[1], yr[1]) || on(H[3], yr[1]);
    along2('v', yr[1] + c2, yr[0] + c2, yr[2] - c2, back ? H[0] : 0, back ? H[2] : 0);
    along2('u', yr[2] - c2, yr[1] + c2, yr[3] - c2, on(H[2], yr[2]) ? H[1] : 0, on(H[2], yr[2]) ? H[3] : 0);
    along2('v', yr[3] - c2, yr[0] + c2, yr[2] - c2, 0, 0, true);
    along2('u', yr[0] + c2, yr[1] + c2, yr[3] - c2, on(H[0], yr[0]) ? H[1] : 0, on(H[0], yr[0]) ? H[3] : 0);
    if (gate < 0) { P.errs.push('sem portão no terreiro'); return; }
    P.entrance = { door: gate, u: X(Y.gate), v: yr[3], w: Y.gw, lv: 0 };
    P.yard = { r: XR(yr), h: fh, lv: 0 };
    const yards = Y.rooms.map(r => P.room(0, 'terreiro', XR(r), 1));
    for (const [k, r, fu, fv, extra] of Y.pieces) {
      const rr = XR(r); const room = yards.find(id => { const m = P.rooms[id].r; return rr[0] >= m[0] - 1e-6 && rr[1] >= m[1] - 1e-6 && rr[2] <= m[2] + 1e-6 && rr[3] <= m[3] + 1e-6; });
      if (room === undefined || !P.at(k, 0, room, rr, flip ? -fu : fu, fv, Object.assign({ yard: 1 }, extra || {}))) { P.errs.push(`${In.ITEMS[k].name.toLowerCase()} não cabe no terreiro`); return; }
    }
    if (floors > 1) loftFloorShell(P, h0 + 0.2, h1, null);
    workWindows(P);
    if (P.inside()) return;
    // ======== the inside: the shed, the house — each attempt's own dice ========
    const rooms = { main: P.room(0, 'salao', I), front: undefined, cells: [], court: undefined, all: [] }; rooms.all.push(rooms.main);
    if (floors > 1) loftFloor(P, rooms, null, Math.min(0.2, Math.max(0.12, t * 0.6)));
    P._rooms = rooms;
    YARD_IN[rec.t](P, rooms);
  }
  // what goes in under the roof: the potter's second wheel (the trade's two hands), the shelf of finished pots, the bench; the
  // tavern's house as any tavern's (the counter, the fire, the tables, the barrels kept inside, the vat)
  const YARD_IN = {
    olaria: (P, rooms) => {
      const id = rooms.main; const wheel = () => { if (!P.place('roda-oleiro', 0, id)) { P.lack = 1; P.errs.push('sem lugar para a roda de oleiro'); } };
      const shelf = () => P.opt(() => P.place('secador', 0, id));
      for (const f of P.attempt % 2 ? [shelf, wheel] : [wheel, shelf]) f();
      P.opt(() => P.place('bancada', 0, id, { sides: ['fundo', 'esquerda', 'direita'] }));
    },
  };
  // (the yard family of the taverna of before, w-terreiro.andar — the house of two storeys behind the yard —, kept a family no
  // type lays out any more: an old record of it is judged on loading and given the tavern's own, with its fact, D-720)
  if (!In.FAMS['w-terreiro.andar']) In.addFamilies([{ id: 'w-terreiro.andar', H: 'w-terreiro', V: 'andar', S: 'w-terreiro.andar', name: 'Terreiro com sobrado', can: () => 'a taverna de 8 m não tem mais terreiro: o salão toma o lote (D-720)', build: P => yardWork(P) }]);

  // ============================== the tavern (interiores 2.0: D-720 a D-729) ==============================
  // The taberna of 8 m, the taverna of 12 and the hospedaria of 16 (G.Escala), each laid out by zones, as a tavern is used: the
  // bar — the counter against the wall, the keeper between it and the shelf of the bar behind; the Roman's and the classical's,
  // the masonry counter in an L at the street's opening —, the tables with their stools and benches, the fire of the people (the
  // hearth with its hood, the clay oven, the stove with the comal; the Norse long fire in the middle of the hall, the benches
  // about it), the musician's stage by the fire, the stair against a wall, the barrels, the amphorae and the vat; the hall up to
  // the roof — the storey above only over the back: the keeper's loft of the 8 m, the rooms over the kitchen and the cellar of
  // the 12 m, and of the 16 m the guests' with the gallery round the hall —; a corridor of a metre at least from the door to the
  // counter, the fire, the stage, the stair and the tables, kept clear (P.zones). The lot never grows (D-663): the room is the
  // plan's. Three taverns at least of each people and size, none the same: the bar's kind and side, where the stage stands, the
  // shape of the tables — by the id (G.hash, never chance) and by the owner's wealth the record keeps (rec.q: the coins of the
  // keeper's house and the merchant house, judged at the turn of the day — D-661, interiors.js). Everything a choice of the
  // record: the same in every attempt; the attempts only move the tables. Laid out with the engine's kit since the interiors 3 —
  // the choices and the frame (P.choose, P.frame), the corridor (P.aisle, P.zone), the fixed pieces and their other places
  // (P.atAlong), the tables (P.groups) —, the first recipe of it, the same tavern byte for byte (F1, D-991)
  const TAVC = {
    classico: { fire: 'lareira', rua: 1, yard: 1 },
    romano: { fire: 'lareira', rua: 1, yard: 1 },
    grego: { fire: 'lareira', yard: 1 },
    egipcio: { fire: 'forno-barro', yard: 1 },
    asteca: { fire: 'fogao-comal', yard: 1 },
    nordico: { fire: 'fogo-comprido', yard: 0 },
  };
  // (the pattern, D-662 — what the proofs measure: the hall's floor, the seats at the tables inside)
  const TMIN = { 2: { hall: 30, seats: 8 }, 3: { hall: 60, seats: 16 }, 4: { hall: 110, seats: 30 } };
  // (the back under the storey above, the lot's margin, the front yard of the 16 m, the corridor's width — to the tables a metre
  // and the grid's tenth: a way measured a metre on the grid of 10 cm may be 0.95 between two groups, T-1743)
  const BACK = { 2: 2.4, 3: 3.3, 4: 3.4 }, MARG = { 2: 0.3, 3: 0.35, 4: 0.4 }, YARD16 = 3.0, AISLE = 1.0, TAISLE = 1.1;
  // the record's choices — the shell's and the inside's, the same in every attempt: the size, the owner's wealth, the bar, the
  // stage, the door on an open tile of the front (rec.o) and the mirror that puts it on the plan's left (the virtual frame:
  // the door left of the middle or on it, the fire on the left wall, the stair on the right) — each by the building's own draw
  // (the kit's P.choose, its draws 1 to 4: F1, D-991), asked by the kit's P.axes on the record alone: P here is the kit on the
  // record, not the plan (D-994)
  function tavAxes(P) {
    const rec = P.rec, L = P.L, n = Math.round(L / 4); if (!TMIN[n]) return null;
    const c = TAVC[rec.c] || TAVC.classico; const q = Math.max(0, Math.min(2, rec.q | 0));
    // (the street's corner not in the 12 m: its hall too shallow for the stair, a metre's way to its foot, the shelf and the
    // counter along the one wall — T-1744; nor the side wall in the 8 m: the bar there leaves the tables a strip that seats less
    // than the eight, L-1845)
    const bars = n === 2 ? (c.rua ? ['centro', 'canto', 'rua'] : ['centro', 'canto']) : c.rua && n !== 3 ? ['centro', 'canto', 'rua'] : c.fire === 'fogo-comprido' ? ['centro', 'canto'] : ['centro', 'canto', 'lado']; // (the Norse: its long fire takes the side of the hall a bar against the wall would)
    const bar = P.choose(1, bars);
    const stage = P.choose(3, ['frente', 'fundo']);
    const yard = n === 4 && !!c.yard;
    // (the door: in the 8 m by a side wall — the stair along it and the corridor beside it, the hall's breadth left whole to the
    // tables —; in the bigger ones in the middle of the front where its tile is open; else on the open tile nearest it)
    const dw = n === 2 ? 1.2 : n === 3 ? 1.4 : 1.6; const o = rec.o || 0; const open = k => !o || !!((o >> k) & 1);
    const mg = Math.min(1.9, dw / 2 + 0.1) + 0.05; const cands = []; const want = n === 2 ? r2(MARG[2] + Math.max(0.12, P.tr.t || 0.25) + 1.45) : L / 2;
    for (let k = 0; k < n; k++) { if (!open(k)) continue; const lo = 4 * k + mg, hi = 4 * k + 4 - mg; for (const w of n === 2 ? [want, L - want] : [want]) if (w >= lo - 1e-6 && w <= hi + 1e-6) cands.push(r2(w)); if (n > 2) cands.push(r2(Math.max(lo, Math.min(hi, L / 2)))); }
    if (!cands.length) cands.push(r2(n === 2 ? want : L / 2));
    const side = P.choose(2, [1, -1]); cands.sort((a, b) => (n === 2 ? 0 : Math.abs(a - L / 2) - Math.abs(b - L / 2)) || side * (a - b));
    const ur = cands[0]; const flip = ur > L / 2 + 0.01 ? 1 : ur < L / 2 - 0.01 ? 0 : P.choose(4, [1, 0]);
    // (the 8 m of a people that digs a cellar, on dry ground: its vat and its barrels in the cellar under the bar — D-723)
    const cellar = n === 2 && !K.cellarOK(rec, P.tr);
    return { n, L, c, q, bar, stage, yard, dw, du: flip ? r2(L - ur) : ur, flip, Y: yard ? YARD16 : 0, cellar };
  }
  In.tavAxes = o => In.axesOf(tavAxes, o); // (for the proofs: the choices of a building or a bare record, as its plan asks them)

  function tavernBuild(P) {
    const rec = P.rec, tr = P.tr, L = P.L; const X = P.axes(tavAxes); if (!X) { P.errs.push('a taverna só tem os degraus de 8, 12 e 16 m'); return; }
    const { n } = X; const V = P.frame(X.flip); // (the virtual frame on the plan's: the kit's mirror, u → L − u)
    const t = r2(Math.max(0.12, tr.t || 0.25)), ti = 0.15, m = MARG[n], c = t / 2;
    const sh = [m, m, r2(L - m), r2(L - m - X.Y)];
    const h0 = r2(Math.max(n === 2 ? 2.8 : 3.0, (tr.h0 || 2.4) + 0.4)), h1 = r2(Math.max(2.4, tr.h1 || 2.4)), y1 = r2(h0 + 0.2);
    // ======== the shell: from the record alone — what is seen from afar ========
    P.shell = { kind: 'rect', r: sh.slice(), t, mat: tr.mat, base: 'pedra', floors: 2, eave: r2(y1 + h1) };
    const kind = K.roofOf({ t: 'house' }, tr); const along = sh[2] - sh[0] >= sh[3] - sh[1] ? 'u' : 'v'; const span = along === 'u' ? sh[3] - sh[1] : sh[2] - sh[0];
    const rise = kind === 'plano' ? 0 : r2(Math.min(n === 2 ? 2.6 : 3.4, span * 0.42));
    P.roof = { kind, along, h: rise, over: kind === 'plano' ? 0 : 0.42 }; P.roofGeo = { kind, along, eave: P.shell.eave, rise, R: sh.slice() };
    // (the back of the 16 m a little shallower where thick walls would leave the hall less than 8 m deep)
    const I = P.inner(); const D = n === 4 ? r2(Math.min(BACK[4], I[3] - I[1] - 8.0 - ti)) : BACK[n]; const hb = n === 2 ? r2(I[1] + D) : r2(I[1] + D + ti); // (the hall's back: the loft's edge; the partition's face)
    P.level(0, 0, h0, 'piso', I); P.entryLv = 0;
    P.level(1, y1, h1, n === 2 ? 'galeria' : 'andar', [I[0], I[1], I[2], hb]);
    if (X.cellar) P.level(-1, -2.1, 1.9, 'porao', I.slice()); // (the cellar under the bar: its corner the inside's)
    // (the outside walls the height of both storeys: over the hall the roof, the storey above only over the back)
    P.outer = P.walls4(0, [r2(sh[0] + c), r2(sh[1] + c), r2(sh[2] - c), r2(sh[3] - c)], t, r2(y1 + h1), 1, 'parede'); P.outers = [P.outer];
    const fw = P.outer.frente;
    // (the way in: the door in the front — onto the street, or onto the yard of the 16 m)
    const dh = Math.min(r2(h0 - 0.25), 2.5); const at = u => P.atOf(fw, [V.U(u), P.walls[fw].a[1]]);
    const door = P.door(fw, at(X.du), X.dw, dh, -1, X.yard ? -1 : 'rua', X.yard ? 0 : 1, 'porta');
    const lay = tavLayout(P, X, I, D, hb, y1);
    // (the masonry counter's opening onto the street, over its long arm: a window as wide as the arm, its sill on its top)
    if (lay.street) P.hole(fw, at(lay.street[0]), lay.street[1], 1.15, 1.0, 'janela');
    tavWindows(P, X, V, I, hb, y1, lay);
    // (the yard of the 16 m, before the house: its fence, the gate on the street before the door, a table either side of the way)
    if (X.yard) {
      const Y = [m, sh[3], r2(L - m), r2(L - m)]; const ft = 0.2, c2 = ft / 2; const gw = 1.8;
      P.wall(0, [r2(Y[0] + c2), Y[1]], [r2(Y[0] + c2), Y[3]], ft, 1.1, 1, 'cerca'); P.wall(0, [r2(Y[2] - c2), Y[3]], [r2(Y[2] - c2), Y[1]], ft, 1.1, 1, 'cerca');
      const fy = P.wall(0, [Y[2], r2(Y[3] - c2)], [Y[0], r2(Y[3] - c2)], ft, 1.1, 1, 'cerca'); const gate = P.door(fy, P.atOf(fy, [V.U(X.du), r2(Y[3] - c2)]), gw, 2.2, -1, 'rua', 1, 'portao');
      P.entrance = { door: gate, u: V.U(X.du), v: Y[3], w: gw, lv: 0 }; P.yard = { r: Y.slice(), h: 1.1, lv: 0 };
      const yid = P.room(0, 'terreiro', [r2(Y[0] + ft), Y[1], r2(Y[2] - ft), r2(Y[3] - ft)], 1);
      for (const s of [-1, 1]) {
        const u0 = s < 0 ? r2(Y[0] + 0.6) : r2(Y[2] - 0.6 - 2.2); const r = [u0, r2(Y[1] + 0.5), r2(u0 + 2.2), r2(Y[1] + 2.2)];
        if (Math.abs((r[0] + r[2]) / 2 - V.U(X.du)) < 2.3) continue;
        if (!P.at('mesa-terreiro', 0, yid, r, 0, 1, { yard: 1 })) { P.errs.push('a mesa do terreiro não cabe'); return; }
      }
    } else P.entrance = { door, u: V.U(X.du), v: sh[3], w: X.dw, lv: 0 };
    if (P.inside()) return;
    // ======== the inside: the rooms, the stair, the bar, the fire, the stage, the corridor, the tables ========
    tavInside(P, X, V, I, D, hb, y1, ti, lay);
  }
  In.tavernBuild = tavernBuild;
  // the tavern's wealth of now (D-661, D-724): its keeper's — the coins of his house (G.Eco.purse) and the merchant house (its
  // banner, h.elite) —, read through the doors of their owners and never written: a step up from TAV_Q's marks, kept down to well
  // under them (the engine's band, In.wealthBand), one change in TAV_DAYS days at the most — the engine's rule of the wealth
  // (In.wealthRule, F6), judged by it alone
  const TAV_Q = In.TAV_Q = [12, 40], TAV_DAYS = In.TAV_DAYS = 20;
  In.wealthRule('taverna', b => {
    const T = G.Taverna; const k = T && T.keeperOf ? T.keeperOf(b) : null; if (!k) return null;
    const coins = G.Eco && G.Eco.purse ? G.Eco.purse(k) || 0 : 0; const h = G.Eco && G.Eco.homeOf ? G.Eco.homeOf(k) : null; const elite = !!(h && h.elite);
    return Object.assign(In.wealthBand(coins, TAV_Q, elite), { coins, elite });
  }, { days: TAV_DAYS });
  In.tavernStep = b => In.wealthOf(b); // (for the proofs: the tavern's reading, as before)
  // the tavern's type: the taberna of 8 m in its family; the bigger steps — the 12 and the 16 — in the estalagem's
  // (int-familias.js), which int-civicos.js gives the type with its sizes (sizedType)
  In.addFamilies([{ id: 'taberna.salao', H: 'taberna', V: 'salao', S: 'taberna.salao', name: 'A taberna: o salão até o telhado, o bar ao fundo, o sobrado do taverneiro',
    can: rec => (In.nOf(rec) !== 2 ? 'a taberna é a de 8 m (as maiores são a estalagem)' : null), build: P => tavernBuild(P) }]);
  In.addTypes({ taverna: { use: 'taverna', fams: ['taberna.salao'], storeAll: 0, open: 1, lockNight: 1, prefer: (rec, l) => (l.includes('taberna.salao') ? ['taberna.salao'] : l) } });
  // (the gallery of the 16 m over the hall's sides, its width; the bands of the back storey: the landing, the rooms behind it)
  const GW = 1.5, LAND = 1.2;
  // the zones of a tavern in the virtual frame — where each fixed piece stands: the stair, the bar, the fire, the stage, the
  // barrels —, and the stretches of the walls no window opens in (a tall piece against them): from the record alone
  // (the 8 m: the door by the left wall, the stair along it and the corridor beside it to the bar at the back, under the loft —
  // the vat in the corner, the shelf, the barrels, the hearth —, the stage against the right wall, and the rest of the hall the
  // tables'; the Norse long fire in the middle of them, the tables either side of it. The 12 and the 16: the door in the
  // middle, the bar against the partition — or the right wall, or the street's corner —, the fire and the stage against the left
  // wall, the stair against the right wall (the 12) or along the partition up to the right gallery (the 16))
  function tavLayout(P, X, I, D, hb, y1) {
    const n = X.n, [x0, z0, x1, z1] = I; const fire = X.c.fire; const rua = X.bar === 'rua'; const du = X.du; const norse = fire === 'fogo-comprido';
    const lay = { pieces: [], keep: [], stair: null, street: null, hall: n === 2 ? I.slice() : [x0, hb, x1, z1] };
    const add = (kind, r, fu, fv, o) => { lay.pieces.push(Object.assign({ kind, r: r.map(r2), fu, fv }, o || {})); };
    const keep = (wall, a0, a1) => lay.keep.push({ wall, a0: r2(a0), a1: r2(a1) });
    const sw = n === 2 ? 0.85 : 1.0, run = r2(Math.ceil(y1 * 0.86 / 0.05) * 0.05); lay.run = run; lay.sw = sw;
    const FW = { lareira: [1.4, 0.6], 'forno-barro': [1.0, 1.0], 'fogao-comal': [1.2, 0.7] }; const [fw, fd] = FW[fire] || [1.4, 0.6];
    const lane = 0.95;
    // (the bar against the back wall of the hall — the loft's in the 8 m, the partition in the others —: the shelf from a0, the
    // counter a lane before it; or against the right wall from v a0, facing the hall. → where its buyers stand)
    const barBack = a0 => { const zb = n === 2 ? z0 : hb; add('prateleira-bar', [a0, zb, a0 + 1.8, zb + 0.4], 0, 1, { role: 'prateleira' }); add('balcao', [a0, zb + 0.4 + lane, a0 + 1.8, zb + 1.0 + lane], 0, 1, { role: 'balcao' }); keep('fundo', a0, a0 + 1.8); lay.exits = [[a0 - 0.9, zb + 0.4, a0, zb + 1.0 + lane], [a0 + 1.8, zb + 0.4, a0 + 2.7, zb + 1.0 + lane]]; return [a0 + 0.9, zb + 1.0 + lane + 0.5]; };
    const barSide = a0 => { add('prateleira-bar', [x1 - 0.4, a0, x1, a0 + 1.8], -1, 0, { role: 'prateleira' }); add('balcao', [x1 - 1.0 - lane, a0, x1 - 0.4 - lane, a0 + 1.8], -1, 0, { role: 'balcao' }); keep('direita', a0, a0 + 1.8); lay.exits = [[x1 - 1.0 - lane, a0 - 0.9, x1 - 0.4, a0], [x1 - 1.0 - lane, a0 + 1.8, x1 - 0.4, a0 + 2.7]]; return [x1 - 1.0 - lane - 0.5, a0 + 0.9]; };
    // (the masonry counter at the front's right corner, its long arm along the front under the window onto the street, the
    // short arm toward the hall — the hand that puts it there —; the shelf against the right wall behind the keeper)
    const barStreet = () => { add('balcao-alvenaria', [x1 - 2.4, z1 - 1.6, x1, z1], 0, -1, { role: 'balcao', hand: -1 }); lay.street = [r2(x1 - 1.3), 2.0]; add('prateleira-bar', [x1 - 0.4, z1 - 3.45, x1, z1 - 1.65], -1, 0, { role: 'prateleira' }); keep('direita', z1 - 3.45, z1); keep('frente', x1 - 2.4, x1); return [x1 - 2.9, z1 - 0.65]; };
    const stage = (r, fu, fv, alt) => add('estrado-musico', r, fu, fv, Object.assign({ role: 'palco' }, alt ? { alt: alt.map(q => q.map(r2)) } : {}));
    if (n === 2) {
      // ---- the 8 m ----
      lay.stair = { r: [x0, hb, x0 + sw, hb + run], du: 0, dv: -1 };
      const backFire = a => { add(fire, [a, z0, a + fw, z0 + fd], 0, 1, { role: 'fogo' }); keep('fundo', a, a + fw); };
      // (everything but the tables under the loft, along the back wall — the corridor an L from the door: up along the stair,
      // across before the loft —, the rest of the hall the tables' in one piece. From the left, by the bar's kind: the vat in the
      // corner, the bar, the barrel, the amphorae and the hearth; the bar in the corner, the barrel, the hearth, the amphorae and
      // the vat in the other one; the bar against the right wall or at the street's corner: the vat, the barrel, the stage and
      // the hearth. The stage against the right wall just before the loft — its way on from behind is the corridor before the
      // bar —, where the bar is not against that wall)
      // (a people that digs a cellar, on dry ground, keeps its vat, its barrels and its amphorae in the cellar under the bar —
      // the trapdoor in the keeper's lane —, the hall's back the bar's, the stage's and the hearth's; the others keep the vat in
      // the back — and the stage, where the back has no room for it, against the right wall before the loft)
      const cel = !!X.cellar; lay.cellar = cel;
      const W0 = { bar: 1.8, barril: 0.6, anforeira: 1.2, palco: 1.6, fogo: fw, cuba: 1.0 }, OPT = { barril: 1, anforeira: 1 };
      // (and the keeper's way out from behind the counter: past a piece deeper than his lane's floor beside the bar — the stage,
      // the vat, the oven, the stove —, 0.85 m between; a shallow one — the barrel, the amphorae, the hearth — he walks before)
      const DEEP = { palco: 1, cuba: 1, fogo: fd > 0.65 ? 1 : 0 };
      const sp = (a, b) => ((a === 'bar' && DEEP[b]) || (b === 'bar' && DEEP[a]) ? 0.85 : (a === 'fogo' && b === 'palco') || (a === 'palco' && b === 'fogo') ? 0.4 : 0.1);
      const need = l => l.reduce((s, k, i) => s + W0[k] + (i ? sp(l[i - 1], k) : 0), 0);
      // (what does not go in — the amphorae, the barrel, the last first — stays out; a bar's kind whose back does not fit even
      // so is laid as the middle one: D-722)
      const trim = l => { l = l.filter(Boolean); while (need(l) > x1 - x0 - 0.05 && l.some(k => OPT[k])) { const i = l.map(k => !!OPT[k]).lastIndexOf(true); l = l.filter((_, q) => q !== i); } return l; };
      const seqOf = b => (b === 'canto' ? [cel ? null : 'cuba', 'palco', flat ? 'fogo' : null, 'barril', 'bar'] : b === 'lado' || b === 'rua' ? [cel ? null : 'cuba', flat ? 'fogo' : null, 'palco', 'barril', 'anforeira'] : cel ? ['barril', 'bar', 'palco', flat ? 'fogo' : null] : ['cuba', 'bar', 'barril', 'anforeira', flat ? 'fogo' : 'palco']);
      let buy = null; const flat = !norse; let kind = X.bar; let list = trim(seqOf(kind));
      if (need(list) > x1 - x0 - 0.05) { kind = 'centro'; list = trim(seqOf(kind)); }
      lay.bar8 = kind; const side = kind === 'lado' || kind === 'rua';
      if (!list.includes('palco')) stage([x1 - 1.2, hb + 0.1, x1, hb + 1.7], -1, 0);
      // (the first against the left wall, the last against the right where it is the vat or the bar of the corner, the room left
      // shared between the others)
      const ends = list[list.length - 1] === 'cuba' || list[list.length - 1] === 'bar' || list[list.length - 1] === 'barril'; const extra = Math.max(0, x1 - x0 - need(list)); const gap = r2(Math.min(0.35, extra / Math.max(1, list.length - (ends ? 1 : 0))));
      let a = x0; const at = [];
      for (let i = 0; i < list.length; i++) { const k = list[i]; if (i) a = r2(a + sp(list[i - 1], k) + gap); at.push(a); a = r2(a + W0[k]); }
      if (ends) { const off = r2(x1 - a); for (let i = 1; i < at.length; i++) at[i] = r2(at[i] + off * (i === at.length - 1 ? 1 : 0)); }
      list.forEach((k, i) => { const a0 = at[i];
        if (k === 'bar') buy = barBack(a0); else if (k === 'fogo') backFire(a0); else if (k === 'palco') stage([a0, z0, a0 + 1.6, z0 + 1.2], 0, 1);
        else if (k === 'cuba') add('cuba', [a0, z0, a0 + 1.0, z0 + 1.0], 0, 1, { role: 'cuba' });
        else add(k, k === 'barril' ? [a0, z0, a0 + 0.6, z0 + 0.6] : [a0, z0, a0 + 1.2, z0 + 0.5], 0, 1, { role: 'deposito', opt: 1 }); });
      if (kind === 'lado') buy = barSide(r2(hb - 0.45)); else if (kind === 'rua') buy = barStreet(); // (the bar against the right wall at the loft's edge: who buys stands in the corridor before the loft)
      lay.buy = buy.map(r2);
      // (the Norse long fire in the middle of the tables, along the hall: a table and its bench either side of it — the stage,
      // where the fire leaves the back free, in the back: its side walls are the rows')
      // (its front to the side: its length across it, one cooks at its ends)
      if (norse) {
        const bu = r2(x0 + sw + AISLE), cu = r2((bu + x1) / 2), v0 = r2(Math.min(hb + 1.3, z1 - 3.4)); add('fogo-comprido', [cu - 0.45, v0, cu + 0.45, v0 + 3.0], 1, 0, { role: 'fogo' });
        // (the Norse hall's two rows, either side of the fire, between the corridor or the wall and the room round it: the bench
        // of who looks at the fire, the board before it, a stool at each end — laid by measure, the slots are of centimetres)
        const tv = r2(v0 + 0.7); for (const [b0, t0, fu, g] of [[bu + 0.03, bu + 0.41, 1, 1], [x1 - 0.38, x1 - 1.21, -1, 2]]) {
          const o = { role: 'mesa', fixed: 1, grp: g };
          add('mesa-taverna', [t0, tv - 0.1, t0 + 0.8, tv + 1.5].map(r2), fu, 0, o); add('banco', [b0, tv, b0 + 0.35, tv + 1.4].map(r2), fu, 0, o);
          for (const s of [-1, 1]) { const sv = s < 0 ? tv - 0.1 - 0.03 - 0.4 : tv + 1.5 + 0.03; const stool = { kind: 'banquinho', r: [t0 + 0.2, sv, t0 + 0.6, sv + 0.4].map(r2) };
            // (the rich one's chair at the head of the first board — the stool where it does not go in)
            if (X.q === 2 && g === 1 && s > 0) add('cadeira', [t0 + 0.15, sv, t0 + 0.65, sv + 0.5].map(r2), 0, -s, Object.assign({ or: stool }, o)); else add('banquinho', stool.r, 0, -s, o); }
        }
      }
      lay.fire = (lay.pieces.find(q => q.role === 'fogo') || {}).r || null;
      return lay;
    }
    // ---- the 12 and the 16 ----
    if (n === 4) lay.stair = { r: [x1 - GW - run, hb, x1 - GW, hb + sw], du: 1, dv: 0 };
    else lay.stair = { r: [x1 - sw, hb, x1, hb + run], du: 0, dv: -1 };
    const st = lay.stair.r; const footV = lay.stair.dv ? st[3] + 0.8 : st[3];
    // (the fire: the people's against the left wall, in the hall's front part; the Norse long fire in the middle, its benches
    // along it either side)
    const hz0 = hb, hz = z1 - hb; let fireR;
    if (norse) {
      // (in the 12 m toward the front — the hall too shallow for tables either end of it: the back's whole for them —, in the
      // 16 m in the middle of the hall)
      const cu = r2(Math.max(du + 1.7, Math.min(x1 - (n === 4 ? GW : 0) - 2.8, (du + x1) / 2))), cv = r2(n === 3 ? z1 - 2.3 : hz0 + hz * 0.52);
      fireR = [cu - 0.45, cv - 1.5, cu + 0.45, cv + 1.5]; add('fogo-comprido', fireR, 1, 0, { role: 'fogo' });
      for (const s of [-1, 1]) for (const v0 of [cv - 1.45, cv + 0.05]) { const u0 = s < 0 ? fireR[0] - 0.55 - 0.35 : fireR[2] + 0.55; add('banco', [u0, v0, u0 + 0.35, v0 + 1.4], -s, 0, { role: 'banco-fogo', opt: 1 }); }
    } else { const cv = r2(hz0 + hz * 0.38); fireR = [x0, cv - fw / 2, x0 + fd, cv + fw / 2]; add(fire, fireR, 1, 0, { role: 'fogo' }); keep('esquerda', fireR[1], fireR[3]); }
    lay.fire = fireR;
    let buy;
    if (rua) buy = barStreet();
    else if (X.bar === 'lado') buy = barSide(r2(Math.min(z1 - 2.6, footV + 0.6)));
    else if (X.bar === 'canto') buy = barBack(r2(x0 + 0.2));
    else buy = barBack(r2(Math.max(x0 + 1.4, Math.min(x1 - (n === 4 ? GW + run + 0.4 : 1.4) - 1.8, du - 0.9))));
    lay.buy = buy.map(r2);
    // (the stage: by the fire — against the left wall before it, or behind it toward the back; the Norse, against the left wall)
    // (where a door of the back or the corridor's keep takes its place, the other one)
    { const back = norse ? [x0, hz0 + 0.3, x0 + 1.2, hz0 + 1.9] : [x0, fireR[1] - 0.4 - 1.6, x0 + 1.2, fireR[1] - 0.4], front = norse ? [x0, z1 - 2.6, x0 + 1.2, z1 - 1.0] : [x0, fireR[3] + 0.4, x0 + 1.2, fireR[3] + 2.0];
      const backOK = X.stage === 'fundo' && X.bar !== 'canto' && (norse || fireR[1] - hz0 >= 2.1);
      if (backOK) stage(back, 1, 0, [front]); else stage(front, 1, 0, X.bar !== 'canto' && (norse || fireR[1] - hz0 >= 2.1) ? [back] : null); }
    // (a barrel by the shelf, the keeper's at hand: the others are the cellar's)
    const sh = lay.pieces.find(q => q.role === 'prateleira');
    if (sh.fu) add('barril', [x1 - 0.6, sh.r[1] - 0.75, x1, sh.r[1] - 0.15], -1, 0, { role: 'deposito', opt: 1 });
    else add('barril', [sh.r[2] + 0.1, sh.r[1], sh.r[2] + 0.7, sh.r[1] + 0.6], 0, 1, { role: 'deposito', opt: 1 });
    return lay;
  }
  // the windows: on the hall's sides and front — none behind a tall piece, nor where the stair climbs —, over the storey above
  // the rooms'; the upper ones under the eaves
  function tavWindows(P, X, V, I, hb, y1, lay) {
    const L = P.L, [x0, z0, x1, z1] = I; const W = P.outer; const n = X.n;
    // (each wall of the virtual frame: its plan's id — the left and the right swap in the mirror)
    const wid = { fundo: W.fundo, frente: W.frente, esquerda: X.flip ? W.direita : W.esquerda, direita: X.flip ? W.esquerda : W.direita };
    const free = (wall, a, w) => !lay.keep.some(k => k.wall === wall && a + w / 2 + 0.3 > k.a0 && a - w / 2 - 0.3 < k.a1);
    const st = lay.stair.r; if (lay.stair.dv) lay.keep.push({ wall: st[0] <= x0 + 0.01 ? 'esquerda' : 'direita', a0: st[1], a1: st[3] });
    const put = (wall, along, pos, w, h, sill) => {
      const id = wid[wall]; const pt = wall === 'fundo' || wall === 'frente' ? [V.U(pos), P.walls[id].a[1]] : [P.walls[id].a[0], pos];
      const at = P.atOf(id, pt); const len = P.wlen(id); if (at < w / 2 + 0.35 || at > len - w / 2 - 0.35) return;
      if (P.holes.some(q => q.wall === id && Math.abs(q.at - at) < (q.w + w) / 2 + 0.35)) return;
      P.window(id, at, w, h, sill);
    };
    const ww = n === 2 ? 0.8 : 1.0, wh = 1.3, sill = 1.0;
    // (the hall's: along each side wall, every 2.6 m of the hall's depth, where nothing tall stands; along the front either
    // side of the door)
    const hz0 = lay.hall[1];
    for (const wall of ['esquerda', 'direita']) { const k = Math.max(1, Math.floor((z1 - hz0) / 2.6)); for (let q = 0; q < k; q++) { const v = r2(hz0 + (z1 - hz0) * (q + 0.5) / k); if (free(wall, v, ww)) put(wall, 'v', v, ww, wh, sill); } }
    for (const u of [x0 + (X.du - x0) * 0.45, X.du + (x1 - X.du) * 0.5]) if (Math.abs(u - X.du) > X.dw / 2 + ww / 2 + 0.4 && free('frente', u, ww)) put('frente', 'u', r2(u), ww, wh, sill);
    // (the storey above: its rooms' windows in the back wall and in the sides over the back, the sill a metre over its floor)
    const k = Math.max(1, Math.floor((x1 - x0) / 3.0)); for (let q = 0; q < k; q++) put('fundo', 'u', r2(x0 + (x1 - x0) * (q + 0.5) / k), 0.8, 1.0, r2(y1 + 0.95));
    for (const wall of ['esquerda', 'direita']) put(wall, 'v', r2((z0 + hb) / 2), 0.8, 1.0, r2(y1 + 0.95));
    // (the back of the 8 m: a window low in the back wall where no shelf nor vat stands, the light behind the bar)
    if (n === 2) for (const u of [x0 + 0.9, x1 - 0.9]) if (free('fundo', u, 0.7)) put('fundo', 'u', r2(u), 0.7, 0.9, 1.3);
  }
  // ---- the corridor (D-721) and the groups of the tables (D-722): the engine's kit (P.clearance, P.aisle, P.zone, P.groups —
  // In.CORR the raster —, F1, D-991), the tavern the first recipe to lay out with it ----

  // the inside: the rooms, the stair and the rail, the fixed pieces (the bar, the fire, the stage, the barrels), the kitchen and
  // the cellar behind the hall, the corridor kept clear, the tables, the storey above
  function tavInside(P, X, V, I, D, hb, y1, ti, lay) {
    const n = X.n, [x0, z0, x1, z1] = I; const tr = P.tr; const lvl1 = P.lvl(1);
    // ---- the rooms of the ground: the hall (the whole of it in the 8 m); behind the hall of the 12 and the 16, the kitchen and
    // the cellar, a partition between, the kitchen open to the hall by a wide way, the cellar by a door ----
    const hall = P.room(0, 'salao', V.R(lay.hall)); let kitchen = -1, cellar = -1;
    if (n > 2) {
      const pv = r2(hb - ti / 2); const pw = P.wall(0, [V.U(x0), pv], [V.U(x1), pv], ti, P.lvl(0).h, 0, 'divisoria');
      // (the two ways through it, by the bar: the kitchen's wide one and the cellar's door — never behind the shelf, the stair or
      // the barrels against it, nor before the stage)
      const blocked = lay.pieces.filter(q => q.r[1] <= hb + 0.05 && q.role !== 'fogo').map(q => [q.r[0] - 0.1, q.r[2] + 0.1]);
      const sr = lay.stair.r; if (lay.stair.du) blocked.push([sr[0] - 0.9, sr[2] + 0.1]); else if (sr[1] <= hb + 0.05) blocked.push([sr[0] - 0.4, sr[2] + 0.4]);
      const fits = (a, w) => a - w / 2 >= x0 + 0.3 && a + w / 2 <= x1 - 0.3 && !blocked.some(([b0, b1]) => a + w / 2 > b0 && a - w / 2 < b1);
      const near = lay.buy[0]; const cand = (w, avoid) => { let best = null; for (let a = x0 + 0.3 + w / 2; a <= x1 - 0.3 - w / 2 + 1e-6; a += 0.1) { if (!fits(a, w) || (avoid && Math.abs(a - avoid[0]) < (w + avoid[1]) / 2 + 0.7)) continue; if (best === null || Math.abs(a - near) < Math.abs(best - near)) best = a; } return best === null ? null : r2(best); };
      const kw = n === 3 ? 1.6 : 2.0, ku = cand(kw), cu = ku === null ? null : cand(0.9, [ku, kw]);
      if (ku === null || cu === null) { P.errs.push('sem passagem para a cozinha e a adega'); return; }
      // (the kitchen on the side of its way, the cellar on the other: the wall between them halfway between the two ways)
      const split = r2((ku + cu) / 2); const kL = ku < cu;
      const back = (a, b) => [a, z0, b, r2(hb - ti)];
      const rk = kL ? back(x0, r2(split - ti / 2)) : back(r2(split + ti / 2), x1), rc = kL ? back(r2(split + ti / 2), x1) : back(x0, r2(split - ti / 2));
      kitchen = P.room(0, 'cozinha', V.R(rk)); cellar = P.room(0, 'adega', V.R(rc));
      P.wall(0, [V.U(split), z0], [V.U(split), r2(hb - ti)], ti, P.lvl(0).h, 0, 'divisoria');
      P.door(pw, P.atOf(pw, [V.U(ku), pv]), kw, 2.3, kitchen, hall, 0, 'vao'); P.door(pw, P.atOf(pw, [V.U(cu), pv]), 0.9, 2.1, cellar, hall, 0, 'porta');
      lay.kd = [ku, kw]; lay.cd = cu;
    }
    // ---- the storey above: the keeper's loft over the back of the 8 m, open to the hall over its rail; over the back of the 12
    // and the 16 the landing the stair comes up to and the rooms behind it (the keeper's, the guests'); the gallery round the
    // hall of the 16 ----
    const ups = []; let landing = -1; const rails = [];
    if (n === 2) { const id = P.room(1, 'quarto', V.R([x0, z0, x1, hb])); ups.push({ id, own: 1 }); rails.push([[x0, hb - 0.03], [x1, hb - 0.03]]); }
    else {
      const lv = r2(hb - LAND); landing = P.room(1, 'corredor', V.R([x0, lv, x1, hb]));
      const wb = P.wall(1, [V.U(x1), r2(lv - ti / 2)], [V.U(x0), r2(lv - ti / 2)], ti, lvl1.h, 0, 'divisoria');
      const nr = n === 3 ? 3 : 5; const each = (x1 - x0 - (nr - 1) * ti) / nr;
      for (let q = 0; q < nr; q++) { const a = r2(x0 + q * (each + ti)), b = q === nr - 1 ? x1 : r2(a + each); const id = P.room(1, q === 0 ? 'aposento' : 'quarto', V.R([a, z0, b, r2(lv - ti)])); ups.push({ id, own: q === 0 ? 1 : 0 });
        P.door(wb, P.atOf(wb, [V.U((a + b) / 2), r2(lv - ti / 2)]), 0.9, 2.05, id, landing, 0, 'porta');
        if (q < nr - 1) P.wall(1, [V.U(r2(b + ti / 2)), z0], [V.U(r2(b + ti / 2)), r2(lv - ti)], ti, lvl1.h, 0, 'divisoria'); }
      if (n === 4) {
        // (the gallery over the hall's sides, from the landing to the front: its floor beyond the storey's own rectangle — areas —,
        // a rail along its edge over the hall)
        const gl = P.room(1, 'galeria', V.R([x0, hb, r2(x0 + GW), z1])), gr = P.room(1, 'galeria', V.R([r2(x1 - GW), hb, x1, z1])); void gl; void gr;
        lvl1.areas = [V.R([x0, z0, x1, hb]), V.R([x0, hb, r2(x0 + GW), z1]), V.R([r2(x1 - GW), hb, x1, z1])];
        rails.push([[x0 + GW, hb - 0.03], [x1 - GW, hb - 0.03]], [[r2(x0 + GW + 0.03), hb], [r2(x0 + GW + 0.03), z1]], [[r2(x1 - GW - 0.03), hb], [r2(x1 - GW - 0.03), z1]]);
      } else rails.push([[x0, hb - 0.03], [x1, hb - 0.03]]);
    }
    // ---- the stair, against its wall, and the rail over the hall with the way the stair comes up through ----
    const s = lay.stair; const sr = V.R(s.r); const st = P.stair('escada', 0, 1, sr, V.F(s.du), s.dv, null);
    const top = s.dv ? [(s.r[0] + s.r[2]) / 2, s.r[1]] : [s.r[2], (s.r[1] + s.r[3]) / 2]; void st;
    for (const [a, b] of rails) {
      const w = P.wall(1, [V.U(a[0]), r2(a[1])], [V.U(b[0]), r2(b[1])], 0.06, 1.0, 0, 'guarda-corpo');
      const vert = Math.abs(a[0] - b[0]) < 1e-6; const hit = vert ? Math.abs(a[0] - top[0]) < 0.1 && top[1] >= Math.min(a[1], b[1]) - 0.05 && top[1] <= Math.max(a[1], b[1]) + 0.05 : Math.abs(a[1] + 0.03 - top[1]) < 0.1 && top[0] >= Math.min(a[0], b[0]) && top[0] <= Math.max(a[0], b[0]);
      if (hit) P.hole(w, P.atOf(w, [V.U(top[0]), top[1]]), r2(lay.sw + 0.15), 1.0, 0, 'vao');
    }
    // ---- the fixed pieces of the hall: the bar, the fire, the stage, the barrels — each where its zone says, or a little along
    // its wall where a door or a window is (never across the hall) ----
    // (the kit's P.atAlong: along its wall — v for a piece against a side wall, u for one against the back —, then its other
    // places, alt — L-1841)
    const placeAt = (p, room, lv) => {
      const room0 = room === undefined ? hall : room;
      const extra = Object.assign({}, p.hand ? { hand: X.flip ? -p.hand : p.hand } : {});
      const got = P.atAlong(p.kind, lv || 0, room0, p.r, p.fu, p.fv, { frame: V, alt: p.alt, fixed: p.fixed, extra }); if (got) { p.at = got.r; return got.it; }
      return null;
    };
    for (const p of lay.pieces) { if (p.grp) continue; const it = p.opt ? P.opt(() => placeAt(p)) : placeAt(p); if (!it && !p.opt) { P.errs.push(`sem lugar para ${In.ITEMS[p.kind].name.toLowerCase()}`); return; } }
    // (the groups laid by measure — the Norse rows by the long fire —: all of a group, or none of it)
    const pre = [];
    for (const g of [...new Set(lay.pieces.filter(q => q.grp).map(q => q.grp))]) {
      const n0 = P.items.length, drops = P.items.map(it => (it.drop ? it.drop.slice() : null)); const its = [];
      for (const p of lay.pieces.filter(q => q.grp === g)) { const it = P.opt(() => placeAt(p)) || (p.or ? P.opt(() => placeAt(Object.assign({}, p, p.or))) : null); if (!it) break; its.push(it); }
      const got = its.reduce((s, it) => s + P.spotsOf(it).filter(q => q.on && q.use === 'sentar').length, 0);
      if (its.length < lay.pieces.filter(q => q.grp === g).length) { P.items.length = n0; P.items.forEach((it, q) => { it.drop = drops[q]; }); P._ver = (P._ver || 0) + 1; continue; }
      const pieces = its.map(it => it.r); const bx = [Math.min(...pieces.map(q => q[0])), Math.min(...pieces.map(q => q[1])), Math.max(...pieces.map(q => q[2])), Math.max(...pieces.map(q => q[3]))];
      pre.push({ box: bx, claim: [bx[0] - 0.45, bx[1] - 0.45, bx[2] + 0.45, bx[3] + 0.45], pieces, acc: P.accessFrom(n0), got });
    }
    // ---- the cellar of the 8 m (D-723): under the bar, its walls in the earth; the ladder down from a trapdoor in the floor
    // above where no piece stands — the keeper's lane first —; the vat, the barrels and the amphorae ----
    if (lay.cellar) {
      const bar = lay.pieces.find(q => q.role === 'prateleira'); const cx = bar && !bar.fu ? Math.max(x0, Math.min(x1 - 2.6, (bar.r[0] + bar.r[2]) / 2 - 1.3)) : x1 - 2.6;
      const cr = [r2(cx), z0, r2(cx + 2.6), r2(z0 + 2.2)]; const lc = P.lvl(-1); lc.area = V.R(cr);
      const cel = P.room(-1, 'adega', V.R(cr)); const R = V.R(cr); P.walls4(-1, [r2(R[0] - 0.12), r2(R[1] - 0.12), r2(R[2] + 0.12), r2(R[3] + 0.12)], 0.24, 1.9, 1, 'parede');
      const on0 = P.items.filter(it => it.lv === 0).map(it => it.r); const cands = [];
      for (let v0 = z0 + 0.45; v0 + 0.7 <= z0 + 2.1 + 1e-6; v0 += 0.15) for (let u0 = cx + 0.15; u0 + 0.6 <= cx + 2.45 + 1e-6; u0 += 0.15) for (const dv of [1, -1]) {
        const hz = V.R([r2(u0), r2(v0), r2(u0 + 0.6), r2(v0 + 0.7)]); if (on0.some(q => hz[0] < q[2] + 0.05 && q[0] < hz[2] + 0.05 && hz[1] < q[3] + 0.05 && q[1] < hz[3] + 0.05)) continue;
        cands.push({ r: hz, du: 0, dv, hole: hz });
      }
      if (!In.HOME.ladderAt(P, -1, 0, cands)) { P.errs.push('o alçapão da adega não cabe'); return; }
      if (!P.place('cuba', -1, cel)) { P.errs.push('sem lugar para a cuba na adega'); return; }
      P.opt(() => { P.place('barril', -1, cel); P.place('anforeira', -1, cel); P.place('barril', -1, cel); });
    }
    // ---- the kitchen and the cellar of the 12 and the 16 ----
    if (n > 2) {
      const kf = { lar: 'fogao', forno: 'forno', fogao: 'fogao' }[tr.fire] || 'fogao';
      if (!(P.place(kf, 0, kitchen) || P.place('fogao', 0, kitchen) || P.place('braseiro', 0, kitchen))) { P.errs.push('sem lugar para o fogo da cozinha'); return; }
      if (!P.place('pipas', 0, cellar)) { P.errs.push('sem lugar para as pipas'); return; }
      if (!P.place('cuba', 0, cellar) && !P.place('cuba', 0, kitchen)) { P.errs.push('sem lugar para a cuba'); return; }
      P.opt(() => { P.place('barril', 0, cellar); P.place('barril', 0, cellar); P.place('anforeira', 0, cellar); });
      // (the firewood by the kitchen's fire and the baskets — no table where one would eat standing: a freguês is seated, D-722)
      P.opt(() => { P.place('lenha', 0, kitchen); P.place('cesto', 0, kitchen); });
    }
    // ---- the corridor: from the door to the counter, the fire, the stage and the stair, a metre and more wide, kept clear ----
    const K = P.clearance(0, hall, true); const R0 = P.rooms[hall].r; const e = P.entrance;
    // (where it starts: just inside the hall's door — the street's, or the yard's of the 16)
    const hd = P.doors.find(d => d.wall === P.outer.frente && P.walls[d.wall].lv === 0 && d.kind !== 'janela'); const dp = P.ptOn(hd.wall, hd.at);
    const start = [dp[0], r2(R0[3] - 0.6)]; void e;
    const targets = [];
    const spotsUse = (it, use) => P.spotsOf(it).filter(q => !q.on && (!use || q.use === use)).map(q => [q.u, q.v]);
    const byRole = role => { const p = lay.pieces.find(q => q.role === role); return p && p.at ? P.items.find(it => it.lv === 0 && Math.abs(it.r[0] - V.R(p.at)[0]) < 1e-6 && Math.abs(it.r[1] - V.R(p.at)[1]) < 1e-6 && it.kind === p.kind) : null; };
    const bal = byRole('balcao'), fog = byRole('fogo'), pal = byRole('palco');
    if (bal) targets.push({ why: 'balcão', pts: spotsUse(bal, 'comprar') });
    if (fog) targets.push({ why: 'fogo', pts: spotsUse(fog, 'cozinhar') });
    if (pal) targets.push({ why: 'palco', pts: spotsUse(pal, 'acesso') });
    targets.push({ why: 'escada', pts: [[(sr[0] + sr[2]) / 2 - V.F(s.du) * ((sr[2] - sr[0]) / 2 + 0.45), s.dv ? sr[3] + 0.45 : (sr[1] + sr[3]) / 2]] });
    // (one way after the other, each from the corridor already kept: a tree from the door, not a way of its own to each — its
    // trunk straight in from the door to the bar's line, the hall's spine; the rest grown from it)
    const way = P.aisle(0, hall, start, targets, { K, w: AISLE, trunk: [start[0], Math.min(r2(R0[3] - 0.6), lay.buy[1] + 0.3)] });
    if (!way.ok) { P.errs.push(`sem corredor de ${AISLE} m até ${way.why === 'escada' ? 'a escada' : way.why === 'palco' ? 'o estrado do músico' : 'o ' + way.why}`); return; }
    // (round the Norse long fire, the floor where one warms oneself and passes kept clear — 0.75 m all round —: no table
    // against the fire; its benches, laid before, are in it)
    const inHall = z => [r2(Math.max(z[0], R0[0])), r2(Math.max(z[1], R0[1])), r2(Math.min(z[2], R0[2])), r2(Math.min(z[3], R0[3]))]; // (a zone kept is the hall's floor)
    if (fog && fog.kind === 'fogo-comprido') { const r = fog.r; P.zone(0, inHall([r[0] - 0.75, r[1] - 0.75, r[2] + 0.75, r[3] + 0.75]), { aisle: 1 }); }
    // (and the keeper's ways out from behind the counter, at its ends: no table there)
    for (const q of lay.exits || []) { const z = inHall(V.R(q.map(r2))); if (z[2] - z[0] < 0.3 || z[3] - z[1] < 0.3) continue; P.zone(0, z, { aisle: 1 }); }
    // ---- the tables: groups of a table and its seats, packed through the hall beside the corridor, each one a metre's way to ----
    tavTables(P, X, hall, K, start, targets, pre);
    if (P.errs.length) return;
    // ---- the storey above: a bed in each room — the keeper's the couple's —, its chest; the Norse sleeping bench ----
    let beds = 0; const bed = tr.rich && tr.rich[0] ? tr.rich[0] : 'cama';
    const lie = (kind, id) => (In.ITEMS[kind] && In.ITEMS[kind].per ? ['fundo', 'esquerda', 'direita'].some(sd => P.bench(1, id, sd, { min: 1 })) : !!P.place(kind, 1, id, { sides: ['fundo', 'esquerda', 'direita'] }));
    for (const u of ups) { if (lie(u.own && n > 2 ? tr.coupleRich || bed : bed, u.id) || P.place('cama', 1, u.id)) { beds++; P.opt(() => P.place('arca', 1, u.id)); } }
    if (!beds) P.errs.push('sem cama no andar de cima');
  }
  // ---- the tables (D-722): each group a table and its seats — the round one with its stools, the long one with its benches or
  // its stools —, of the kinds the owner's wealth says (the long ones with benches of the poor, the round ones with the stools,
  // the rich one's chair); laid by the kit's groups (P.groups, F1): where a group fits snug against the walls, the fixed pieces
  // and the groups laid before it, its seats got onto from behind, and kept only where a metre's way from the door still reaches
  // it and everything before it. The ties by the id (the kit's draws), the attempts' dice only for the order of the equal ones ----
  const TPL = {
    // [table, its w, its d, and the seats: [kind, du, dv (the seat's middle off the table's, along its long side and across — 3 cm
    // off it: the engine keeps two pieces 2 cm apart at the least),
    // w, d, how it faces: toward the table]]
    redonda: { t: 'mesa-redonda', w: 0.9, d: 0.9, seats: [[0, -0.68], [0, 0.68], [-0.68, 0], [0.68, 0]].map(([a, b]) => ['banquinho', a, b, 0.4, 0.4]) },
    comprida: { t: 'mesa-taverna', w: 1.6, d: 0.8, seats: [['banco', 0, -0.605, 1.4, 0.35], ['banco', 0, 0.605, 1.4, 0.35], ['banquinho', -1.03, 0, 0.4, 0.4], ['banquinho', 1.03, 0, 0.4, 0.4]] },
    banquinhos: { t: 'mesa-taverna', w: 1.6, d: 0.8, seats: [-0.55, 0, 0.55].flatMap(a => [['banquinho', a, -0.63, 0.4, 0.4], ['banquinho', a, 0.63, 0.4, 0.4]]).concat([['banquinho', -1.03, 0, 0.4, 0.4]]) },
    cadeira: { t: 'mesa-redonda', w: 0.9, d: 0.9, seats: [['cadeira', 0, -0.73, 0.5, 0.5], ['banquinho', 0, 0.68, 0.4, 0.4], ['banquinho', -0.68, 0, 0.4, 0.4], ['banquinho', 0.68, 0, 0.4, 0.4]] },
    // (the long table of stools with the owner's chair at its head: the rich one's where the round tables do not seat enough)
    cabeceira: { t: 'mesa-taverna', w: 1.6, d: 0.8, seats: [-0.55, 0, 0.55].flatMap(a => [['banquinho', a, -0.63, 0.4, 0.4], ['banquinho', a, 0.63, 0.4, 0.4]]).concat([['cadeira', -1.08, 0, 0.5, 0.5]]) },
    cabeceira2: { t: 'mesa-taverna', w: 1.6, d: 0.8, seats: [-0.55, 0, 0.55].flatMap(a => [['banquinho', a, -0.63, 0.4, 0.4], ['banquinho', a, 0.63, 0.4, 0.4]]).concat([['cadeira', 1.08, 0, 0.5, 0.5]]) },
  };
  // (the kinds of group of each wealth, the first the most of them)
  const TMIX = { 0: ['comprida', 'banquinhos', 'redonda'], 1: ['redonda', 'comprida', 'banquinhos'], 2: ['redonda', 'cadeira', 'comprida'] };
  function tavTables(P, X, hall, K, start, fixed, pre) {
    const n = X.n; const goal = TMIN[n].seats;
    // (the big hall's lattice on a half metre: its groups have room, and a quarter is four times the work)
    const G1 = P.groups(0, hall, { models: TPL, K, start, fixed, pre, cap: Math.round(goal * 1.6), step: n === 4 ? 0.5 : 0.25, half: AISLE / 2, thalf: TAISLE / 2 });
    // (the wealth's kinds first; where they do not seat the tavern's least — round tables are dear in room —, the rest of the
    // floor with the long tables, the wealth's groups kept; and where even so not, all of it laid again with the long tables of
    // stools, which seat the most)
    // (the wealth's taste weighs a kind's place in its list — 1.6 a place: the rich one's round table before a long one of more
    // seats —; where the seats are what is short, a tenth of that)
    G1.pack(TMIX[X.q], false, 1.6);
    if (G1.seats < goal) G1.pack(X.q === 2 ? ['cabeceira', 'cabeceira2', 'banquinhos', 'comprida'] : ['banquinhos', 'comprida'], true, 0.16);
    // (and where the greedy's first group took the middle of the floor, the round again without it — a few times, cheaper than
    // the whole plan again)
    const ban = new Set();
    for (let r = 0; r < 4 && G1.seats < goal; r++) { if (r && G1.first) ban.add(G1.first); G1.reset(); G1.pack(X.q === 2 ? ['cabeceira', 'cabeceira2', 'banquinhos', 'comprida'] : ['banquinhos', 'comprida', 'redonda'], false, 0.16, n === 2, ban); }
    const seats = G1.seats; P.tav = { seats, groups: G1.groups.length };
    if (seats < goal) P.errs.push(`só ${seats} lugares à mesa no salão (a taverna pede ${goal})`);
  }
})(window.G);
