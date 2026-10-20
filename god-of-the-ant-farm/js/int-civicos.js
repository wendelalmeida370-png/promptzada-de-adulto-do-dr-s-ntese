'use strict';
// ============================================================
//  The buildings of the people's common life, laid out by the
//  hall recipe of the buildings of work (int-trabalho.js): the
//  temple (the image of the god against the back wall of the
//  cella, the altar before it, the rows of the faithful), the
//  barracks (the cots of the guard, the racks of arms, the posts
//  where it trains), the jail (the cells behind their gratings,
//  the jailer's table by the door), the baths (the changing room,
//  the cold room and the hot one by the furnace, one after the
//  other, the pools), the chief's hall (his seat at the back, the
//  benches, the hearth). Proved as the others: it fits, all of it
//  reached from the door, what each is for in pieces the world
//  can count (the altar, the cells, the pool, the seat).
// ============================================================
(function (G) {
  const In = G.Interiors; const W = In.WORK; const SP = In.SPOTS;
  const lvOf = (P, id) => P.rooms[id].lv;
  const has = x => x !== undefined && x !== null;
  In.addItems({
    // ---- the temple ----
    // (the god's image on its plinth against the back wall: honoured across the altar before it, never walked to)
    idolo: { name: 'Imagem do deus', w: 0.9, d: 0.7, h: 2.3, solid: 1, wall: 1, tall: 1, spots: () => [] },
    // (the priest stands behind the altar, between it and the image, facing the faithful; the offering is laid from the front)
    altar: { name: 'Altar', w: 1.2, d: 0.7, h: 0.95, solid: 1, free: 1, job: 1, spots: it => [{ use: 'oficiar', a: 0, n: -(it.d / 2 + 0.45) }, { use: 'ofertar', a: 0, n: it.d / 2 + 0.5 }] },
    'banco-fieis': { name: 'Banco dos fiéis', w: 1.6, d: 0.4, h: 0.45, low: 1, free: 1, spots: it => [{ use: 'sentar', a: 0, n: 0, on: 1 }, { use: 'acesso', a: -(it.w / 2 + 0.3), n: 0 }, { use: 'acesso', a: it.w / 2 + 0.3, n: 0 }, { use: 'acesso', a: 0, n: it.d / 2 + 0.35 }] },
    // (where the people kneels to pray, the mats in rows instead of benches)
    'esteira-oracao': { name: 'Esteira de oração', w: 0.7, d: 1.0, h: 0.03, low: 1, free: 1, spots: it => [{ use: 'rezar', a: 0, n: 0, on: 1 }, { use: 'acesso', a: 0, n: it.d / 2 + 0.3 }, { use: 'acesso', a: -(it.w / 2 + 0.3), n: 0 }, { use: 'acesso', a: it.w / 2 + 0.3, n: 0 }] },
    lampadario: { name: 'Lampadário', w: 0.45, d: 0.45, h: 1.6, solid: 1, free: 1, spots: () => [] },
    // ---- the barracks ----
    catre: { name: 'Catre', w: 0.8, d: 1.9, h: 0.45, low: 1, wall: 1, rot: 1, places: 1, spots: SP.lie(1) },
    armeiro: { name: 'Armeiro', w: 1.6, d: 0.5, h: 1.9, solid: 1, wall: 1, tall: 1, store: { dep: 'predio', key: 'inv', cap: 10 }, spots: SP.front('armar', 0.45) },
    manequim: { name: 'Poste de treino', w: 0.5, d: 0.5, h: 1.8, solid: 1, free: 1, spots: it => [{ use: 'treinar', a: 0, n: it.d / 2 + 0.7 }, { use: 'treinar', a: 0, n: -(it.d / 2 + 0.7) }] },
    // ---- the jail ----
    palha: { name: 'Palha de dormir', w: 0.7, d: 1.8, h: 0.1, low: 1, wall: 1, rot: 1, places: 1, spots: SP.lie(1) },
    balde: { name: 'Balde', w: 0.35, d: 0.35, h: 0.4, solid: 1, wall: 1, spots: () => [] },
    chaves: { name: 'Quadro das chaves', w: 0.5, d: 0.15, h: 0.5, y: 1.4, solid: 1, wall: 1, mount: 'parede', spots: SP.front('pegar', 0.35) },
    // ---- the baths ----
    // (the pool: one goes down into it — from its front or either end)
    piscina: { name: 'Piscina', w: 2.2, d: 1.6, h: 0.5, low: 1, wall: 1, spots: it => [{ use: 'banhar', a: 0, n: 0, on: 1 }, { use: 'entrar', a: 0, n: it.d / 2 + 0.4 }, { use: 'entrar', a: -(it.w / 2 + 0.4), n: 0 }, { use: 'entrar', a: it.w / 2 + 0.4, n: 0 }] },
    'tina-banho': { name: 'Tina de banho', w: 1.2, d: 0.8, h: 0.6, low: 1, wall: 1, spots: it => [{ use: 'banhar', a: 0, n: 0, on: 1 }, { use: 'entrar', a: 0, n: it.d / 2 + 0.4 }] },
    'fornalha-banho': { name: 'Fornalha dos banhos', w: 0.9, d: 0.8, h: 1.0, solid: 1, fire: 1, wall: 1, job: 1, spots: SP.front('alimentar', 0.5) },
    cabide: { name: 'Cabides', w: 1.2, d: 0.2, h: 0.4, y: 1.5, solid: 1, wall: 1, mount: 'parede', spots: SP.front('despir', 0.35) },
    // ---- the tavern's vat (int-trabalho.js: the keeper brews there) ----
    cuba: { name: 'Cuba de fermentar', w: 1.0, d: 1.0, h: 1.1, solid: 1, wall: 1, store: { dep: 'predio', key: 'inv', cap: 8 }, spots: SP.front('mexer', 0.5) },
    // ---- the chief's hall ----
    trono: { name: 'Assento do chefe', w: 1.0, d: 0.8, h: 1.4, solid: 1, wall: 1, spots: it => [{ use: 'sentar', a: 0, n: 0, on: 1 }, { use: 'audiencia', a: 0, n: it.d / 2 + 0.9 }] },
  });
  if (!W) return;

  // ------------------------------ the temple ------------------------------
  // (the peoples that kneel to pray: mats in rows; the others, benches)
  const KNEEL = { egipcio: 1, asteca: 1 };
  // the image of the god against the back wall of the cella (the hall; the nave; behind the court, the hall at its back), in
  // the middle; the altar a pace before it — the priest between them, facing the faithful —, a lamp at either hand; the
  // rows of the faithful facing the altar, an aisle down the middle (in the court too); the chest of the offerings
  function templeFurnish(P) {
    const rooms = P._rooms; const cella = rooms.main; const lv = lvOf(P, cella);
    const im = P.place('idolo', lv, cella, { sides: ['fundo'], center: true }); if (!im) { P.errs.push('sem lugar para a imagem do deus'); return; }
    const cu = (im.r[0] + im.r[2]) / 2;
    // (behind a court, the altar stands in the court before the sanctuary's door, under the sky)
    let al = null, ar = cella;
    for (const at of (has(rooms.court) ? [rooms.court] : []).concat([cella])) {
      const A = P.rooms[at].r; const v0 = at === cella ? im.r[3] : A[1] + 0.9; ar = at;
      for (let dv = 0.5; v0 + dv + 0.7 < A[3] - 1.2 && !al; dv += 0.2) for (const du of [0, -0.3, 0.3, -0.6, 0.6]) { const u = Math.max(A[0] + 0.7, Math.min(A[2] - 0.7, cu + du)); al = P.at('altar', lv, at, [u - 0.6, v0 + dv, u + 0.6, v0 + dv + 0.7], 0, 1); if (al) break; }
      if (al) break;
    }
    if (!al) { P.errs.push('sem lugar para o altar'); return; }
    P.opt(() => { const ac = (al.r[0] + al.r[2]) / 2; for (const du of [-1.1, 1.1]) P.at('lampadario', lv, ar, [ac + du - 0.23, al.r[1] + 0.12, ac + du + 0.22, al.r[1] + 0.57], 0, 1); });
    const kind = KNEEL[P.rec.c] ? 'esteira-oracao' : 'banco-fieis'; const D = In.ITEMS[kind];
    // (where the room is wide enough, two to a row with the aisle between; a narrow nave or aisle, one to a row in the middle,
    // a way along either side)
    let n = 0;
    for (const id of [ar].concat(rooms.cells.filter(c => P.rooms[c].fn === 'nave-lateral'))) {
      const R = P.rooms[id].r; const aisle = P.rr(0.9, 1.1); const mid = id === ar ? (al.r[0] + al.r[2]) / 2 : (R[0] + R[2]) / 2;
      const two = Math.min(D.w, (Math.min(mid - R[0], R[2] - mid) - aisle / 2) - 0.35), one = Math.min(D.w, R[2] - R[0] - 1.3);
      const v1 = id === ar ? al.r[3] + 0.95 : R[1] + 0.6;
      for (let v = v1; v + D.d < R[3] - 0.5; v += D.d + (kind === 'banco-fieis' ? 0.55 : 0.4)) {
        let got = 0; if (two >= 0.65) for (const u0 of [mid - aisle / 2 - two, mid + aisle / 2]) if (P.at(kind, lv, id, [u0, v, u0 + two, v + D.d], 0, -1)) got++;
        if (!got && one >= 0.65) for (const u0 of [mid - one / 2, R[0] + 0.65, R[2] - 0.65 - one]) if (P.at(kind, lv, id, [u0, v, u0 + one, v + D.d], 0, -1)) { got++; break; }
        n += got;
      }
    }
    // (where no row goes — a small court, a nave of arches —, the faithful where there is room: by the walls, in the wings)
    if (n < 2) for (const id of [ar, cella].concat(rooms.cells).filter((x, q, a) => a.indexOf(x) === q)) { for (let g = 0; g < 4 && n < 4; g++) if (P.place(kind, lvOf(P, id), id, { sides: ['livre', 'fundo', 'esquerda', 'direita'], margin: 0.35 })) n++; if (n >= 2) break; }
    if (n < 2) P.errs.push(`só ${n} lugares para os fiéis`);
    P.opt(() => { for (const id of [rooms.front, cella].concat(rooms.cells).filter(has)) if (P.place('cofre', lvOf(P, id), id)) break; });
    if (has(rooms.cellar)) P.opt(() => P.place('jarros', -1, rooms.cellar));
  }

  // ------------------------------ the barracks ------------------------------
  // where the guard sleeps — the storey above, the wings or the cells, else the hall: four cots at least, six where they go —;
  // the racks of arms (by the door first); the posts where it trains (in the yard, else the hall's free middle); the table
  // where it eats, the captain's, the company's chest
  function barracksFurnish(P) {
    const rooms = P._rooms; const all = W.mix(P, W.roomsFor(rooms));
    const dorm = (rooms.up || []).concat(rooms.cells, [rooms.main]).filter(has);
    const front = has(rooms.front) ? rooms.front : rooms.main;
    const cots = () => { let n = 0; for (const id of dorm) { let g = 0; while (n < 6 && g++ < 8) { if (!P.place('catre', lvOf(P, id), id)) break; n++; } if (n >= 6) break; } if (n < 4) P.errs.push(`só ${n} catres para a guarda`); };
    const arms = () => { let n = 0; for (const id of [front].concat(all)) { if (P.place('armeiro', lvOf(P, id), id)) n++; if (n >= 2) break; } if (!n) P.errs.push('sem lugar para as armas'); };
    const yard = () => { let n = 0; for (const at of [rooms.court, rooms.main].concat(rooms.cells).filter(has)) { for (let g = 0; g < 2 && n < 2; g++) if (P.place('manequim', lvOf(P, at), at, { sides: ['livre'], margin: 0.6 })) n++; if (n) break; } if (!n) P.errs.push('sem lugar para treinar'); };
    for (const f of [[arms, cots, yard], [cots, arms, yard], [yard, arms, cots]][P.attempt % 3]) f();
    P.opt(() => { if (P.place('mesa', lvOf(P, rooms.main), rooms.main, { sides: ['livre'] })) P.place('banco', lvOf(P, rooms.main), rooms.main); });
    P.opt(() => P.place('mesa-escriba', lvOf(P, front), front));
    P.opt(() => { for (const id of all) if (P.place('arca', lvOf(P, id), id)) break; });
  }

  // ------------------------------ the jail ------------------------------
  // in each cell its bed of straw (and a bucket); the jailer's table in the guard room by the door — or at the front of the
  // aisle, or upstairs —, the keys on the wall beside it, a bench
  function jailFurnish(P) {
    const rooms = P._rooms;
    for (const id of rooms.cells) { if (!P.place('palha', lvOf(P, id), id)) { P.errs.push('uma cela sem palha'); return; } P.opt(() => P.place('balde', lvOf(P, id), id)); }
    const guard = has(rooms.front) ? rooms.front : rooms.main;
    let ok = false; for (const id of [guard, rooms.main].concat(rooms.up || []).filter(has)) if (P.place('mesa-escriba', lvOf(P, id), id)) { ok = true; break; }
    if (!ok) P.errs.push('sem lugar para o carcereiro');
    P.opt(() => P.niche('chaves', lvOf(P, guard), guard));
    P.opt(() => P.place('banco', lvOf(P, guard), guard));
  }

  // ------------------------------ the baths ------------------------------
  // the pools where the water is — the cold room and the hot one in a row of rooms; the court open to the sky and the hall at
  // its back; the one hall —, the furnace by the hot one (in the lean-to, where there is one), the benches, the pegs where one
  // undresses
  function bathsFurnish(P) {
    const rooms = P._rooms; const seq = rooms.seq || null;
    const hot = seq ? seq[seq.length - 1] : rooms.main;
    const cold = seq ? seq[1] : has(rooms.court) ? rooms.court : null;
    const dress = seq ? seq[0] : rooms.cells.length ? rooms.cells[0] : has(rooms.front) ? rooms.front : rooms.main;
    const pool = id => P.place('piscina', lvOf(P, id), id, { sides: ['livre', 'fundo', 'esquerda', 'direita'], margin: 0.5 }) || P.place('tina-banho', lvOf(P, id), id);
    const pools = () => { let n = 0; for (const id of [hot, cold].filter(has)) if (pool(id)) n++; if (!n) P.errs.push('sem lugar para a piscina'); };
    const fire = () => { const at = has(rooms.lean) ? rooms.lean : hot; if (!P.place('fornalha-banho', lvOf(P, at), at)) P.errs.push('sem lugar para a fornalha'); };
    const seats = () => { let n = 0; for (const id of [dress, hot].filter(has)) if (P.place('banco', lvOf(P, id), id)) n++; if (!n) P.errs.push('sem banco nos banhos'); };
    for (const f of [[pools, fire, seats], [fire, pools, seats], [pools, seats, fire]][P.attempt % 3]) f();
    P.opt(() => P.niche('cabide', lvOf(P, dress), dress));
    P.opt(() => P.place('banco', lvOf(P, dress), dress));
  }

  // ------------------------------ the chief's hall ------------------------------
  // the chief's seat against the back wall, in the middle; the benches of those he receives along the side walls; the hearth
  // (the open one in the middle where the people keeps it, else against a wall); the table of the feasts; the chest
  function hallFurnish(P) {
    const rooms = P._rooms; const tr = P.tr; const hall = rooms.main; const lv = lvOf(P, hall);
    if (!P.place('trono', lv, hall, { sides: ['fundo'], center: true })) { P.errs.push('sem lugar para o assento do chefe'); return; }
    const fire = () => { const ok = (tr.fire === 'lar' && P.place('lar', lv, hall, { sides: ['livre'], margin: 0.6 })) || P.place(tr.fire === 'lar' || tr.fire === 'forno' ? 'fogao' : tr.fire, lv, hall) || P.place('braseiro', lv, hall); if (!ok) P.errs.push('sem lugar para o fogo'); };
    const benches = () => { let n = 0; for (const id of [hall].concat(rooms.cells)) { for (const s of ['esquerda', 'direita', 'frente']) for (let g = 0; g < 2 && n < 4; g++) if (P.place('banco', lvOf(P, id), id, { sides: [s] })) n++; if (n >= 2) break; } if (n < 2) P.errs.push(`só ${n} bancos no salão`); };
    for (const f of [[fire, benches], [benches, fire]][P.attempt % 2]) f();
    P.opt(() => { if (P.place('mesa', lv, hall, { sides: ['livre'] })) P.place('banco', lv, hall); });
    P.opt(() => { for (const id of W.roomsFor(rooms)) if (P.place('arca', lvOf(P, id), id)) break; });
  }

  // ------------------------------ the programmes ------------------------------
  W.add('temple', { use: 'templo', H: ['salao', 'frente', 'naves', 'patio'], V: ['terreo', 'porao'], open: 1, lockNight: 1, jobs: 1, apse: 2.4, need: { altar: 1, idolo: 1 }, door: [1.2, 1.6], furnish: templeFurnish });
  W.add('quartel', { use: 'quartel', H: ['salao', 'frente', 'corredor', 'patio'], V: ['terreo', 'andar'], lockNight: 0, need: { catre: 4, armeiro: 1 }, door: [1.1, 1.5], furnish: barracksFurnish });
  // (an aisle between cells has no stair nor trapdoor: its walls are the cells' gratings — the storey above and the cellar
  // are the guard room's. As many cells as the world fills: crime.js jails up to BDEF.cells)
  W.add('cadeia', { use: 'cadeia', H: ['corredor', 'celas'], V: ['terreo', 'andar', 'porao'], skip: { 'corredor.andar': 1, 'corredor.porao': 1 }, lockNight: 1, cells: (G.BDEF.cadeia && G.BDEF.cadeia.cells) || 4, cellDoor: 'grade', door: [0.9, 1.1], furnish: jailFurnish });
  W.add('banhos', { use: 'banhos', H: ['enfiada', 'salao', 'patio', 'anexo'], V: ['terreo', 'andar'], open: 1, lockNight: 1, jobs: 1, door: [1.0, 1.3], seq: ['vestiario', 'frio', 'quente'], share: [0.26, 0.37, 0.37], furnish: bathsFurnish });
  W.add('paco', { use: 'paco', H: ['salao', 'frente', 'naves', 'patio'], V: ['terreo', 'andar', 'galeria'], lockNight: 1, apse: 2.0, need: { trono: 1 }, door: [1.2, 1.6], furnish: hallFurnish });
})(window.G);
