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
    // (the pool: one goes down into it — from its front or either end —; in it, a bather every 0.8 m² of water or so, the
    // places the baths ask of In.freePlace)
    piscina: { name: 'Piscina', w: 2.2, d: 1.6, h: 0.5, low: 1, wall: 1, spots: it => { const ka = Math.max(1, Math.round(it.w / 1.1)), kn = Math.max(1, Math.round(it.d / 0.8)); const out = [];
      for (let i = 0; i < ka; i++) for (let j = 0; j < kn; j++) out.push({ use: 'banhar', a: (i + 0.5) / ka * it.w - it.w / 2, n: (j + 0.5) / kn * it.d - it.d / 2, on: 1 });
      return out.concat([{ use: 'entrar', a: 0, n: it.d / 2 + 0.4 }, { use: 'entrar', a: -(it.w / 2 + 0.4), n: 0 }, { use: 'entrar', a: it.w / 2 + 0.4, n: 0 }]); } },
    'tina-banho': { name: 'Tina de banho', w: 1.2, d: 0.8, h: 0.6, low: 1, wall: 1, spots: it => [{ use: 'banhar', a: 0, n: 0, on: 1 }, { use: 'entrar', a: 0, n: it.d / 2 + 0.4 }] },
    'fornalha-banho': { name: 'Fornalha dos banhos', w: 0.9, d: 0.8, h: 1.0, solid: 1, fire: 1, wall: 1, job: 1, spots: SP.front('alimentar', 0.5) },
    cabide: { name: 'Cabides', w: 1.2, d: 0.2, h: 0.4, y: 1.5, solid: 1, wall: 1, mount: 'parede', spots: SP.front('despir', 0.35) },
    // ---- the tavern's vat (int-trabalho.js: the keeper brews there) ----
    cuba: { name: 'Cuba de fermentar', w: 1.0, d: 1.0, h: 1.1, solid: 1, wall: 1, store: { dep: 'predio', key: 'inv', cap: 8 }, spots: SP.front('mexer', 0.5) },
    // ---- the chief's hall ----
    trono: { name: 'Assento do chefe', w: 1.0, d: 0.8, h: 1.4, solid: 1, wall: 1, spots: it => [{ use: 'sentar', a: 0, n: 0, on: 1 }, { use: 'audiencia', a: 0, n: it.d / 2 + 0.9 }] },
    // ---- the library (P4, phase E: P2's G.Biblioteca reads and copies there) ----
    // (the shelves of scrolls and tablets — the building's own —; the reading table, a reader on either side of it)
    estante: { name: 'Estante de rolos', w: 1.6, d: 0.45, h: 2.1, solid: 1, wall: 1, tall: 1, store: { dep: 'predio', key: 'inv', cap: 20 }, spots: SP.front('guardar') },
    'mesa-leitura': { name: 'Mesa de leitura', w: 1.4, d: 0.8, h: 0.75, solid: 1, free: 1, spots: it => [{ use: 'ler', a: 0, n: it.d / 2 + 0.4 }, { use: 'ler', a: 0, n: -(it.d / 2 + 0.4) }] },
    // ---- the square (P4, phase E) ----
    // (the speaker's stone: one stands on it to speak to the people — P2's 'falar' —, got onto from behind or either side)
    tribuna: { name: 'Pedra de falar', w: 1.0, d: 1.0, h: 0.45, low: 1, free: 1, spots: it => [{ use: 'falar', a: 0, n: 0, on: 1 }, { use: 'acesso', a: 0, n: -(it.d / 2 + 0.35) }, { use: 'acesso', a: -(it.w / 2 + 0.35), n: 0 }, { use: 'acesso', a: it.w / 2 + 0.35, n: 0 }] },
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
    // (the last resort, once every attempt left the altar out — the round In.plan makes only then: L-192. Behind a court the
    // hall can be too shallow for the altar a pace before the image with the faithful's room before it, the sanctuary's
    // door keeping clear the floor before the image, and the court's doors keeping its own: the altar wherever it goes in
    // the hall, then in the court, the nearest the image first, with only the room its offering needs before it)
    if (!al && P.last) {
      const tries = [];
      for (const at of [cella].concat(has(rooms.court) ? [rooms.court] : [])) {
        const A = P.rooms[at].r; const v0 = at === cella ? im.r[3] : A[1];
        for (let v = v0 + 0.5; v + 0.7 <= A[3] - 0.6 + 1e-6; v += 0.1) for (let u = A[0] + 0.6; u + 0.6 <= A[2] + 1e-6; u += 0.15) tries.push([at, u, v, (at === cella ? 0 : 100) + Math.abs(u - cu) + (v - v0)]);
      }
      tries.sort((x, y) => x[3] - y[3]);
      for (const [at, u, v] of tries) { al = P.at('altar', lv, at, [u - 0.6, v, u + 0.6, v + 0.7], 0, 1); if (al) { ar = at; break; } }
    }
    if (!al) { P.lack = 1; P.errs.push('sem lugar para o altar'); return; }
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
  // (the temple of a town: the priests' rooms over it, where the people does not dig a cellar too)
  W.add('temple', { use: 'templo', H: ['salao', 'frente', 'naves', 'patio'], V: ['terreo', 'porao', 'andar'], open: 1, lockNight: 1, jobs: 1, apse: 2.4, need: { altar: 1, idolo: 1 }, door: [1.2, 1.6], furnish: templeFurnish });
  W.add('quartel', { use: 'quartel', H: ['salao', 'frente', 'corredor', 'patio'], V: ['terreo', 'andar'], lockNight: 0, need: { catre: 4, armeiro: 1 }, door: [1.1, 1.5], furnish: barracksFurnish });
  // (the cells along an aisle, in a row behind the guard room, or round the yard; an aisle between cells has no stair nor
  // trapdoor: its walls are the cells' gratings — the storey above and the cellar are the guard room's —, and the guard's
  // hall behind a yard is too shallow for a cellar's trapdoor. As many cells as the world fills: crime.js jails up to
  // BDEF.cells)
  W.add('cadeia', { use: 'cadeia', H: ['corredor', 'celas', 'patio'], V: ['terreo', 'andar', 'porao'], skip: { 'corredor.andar': 1, 'corredor.porao': 1, 'patio.porao': 1 }, lockNight: 1, cells: (G.BDEF.cadeia && G.BDEF.cadeia.cells) || 4, cellDoor: 'grade', door: [0.9, 1.1], furnish: jailFurnish });
  W.add('banhos', { use: 'banhos', H: ['enfiada', 'salao', 'patio', 'anexo'], V: ['terreo', 'andar'], open: 1, lockNight: 1, jobs: 1, door: [1.0, 1.3], seq: ['vestiario', 'frio', 'quente'], share: [0.26, 0.37, 0.37], furnish: bathsFurnish });
  W.add('paco', { use: 'paco', H: ['salao', 'frente', 'naves', 'patio'], V: ['terreo', 'andar', 'galeria'], lockNight: 1, apse: 2.0, need: { trono: 1 }, door: [1.2, 1.6], furnish: hallFurnish });

  // ------------------------------ the library (P4, phase E) ------------------------------
  // the shelves of scrolls and tablets along the walls (up on the gallery too), the reading tables free in the hall — two
  // readers to a table —, the copyist's desk against a wall: what it keeps is the building's own (its inventory), read and
  // copied there (P2's G.Biblioteca: 'ler', 'escrever'); a bench where one waits
  function libraryFurnish(P) {
    const rooms = P._rooms; const all = W.mix(P, W.roomsFor(rooms)).filter(id => !P.rooms[id].open); const hall = W.mix(P, [rooms.main, rooms.front].concat(rooms.cells).filter(has).filter(id => !P.rooms[id].open && lvOf(P, id) >= 0));
    const shelves = () => { let n = 0; for (const id of all) { let g = 0; while (n < 6 && g++ < 3) { if (!P.place('estante', lvOf(P, id), id)) break; n++; } } if (n < 2) P.errs.push(`só ${n} estantes de rolos`); };
    // (the reading tables free in the room, a stride from the walls: a reader on either side, where nothing else stands)
    const tables = () => { let n = 0; for (const id of hall) { let g = 0; while (n < 4 && g++ < 3) { if (!P.place('mesa-leitura', lvOf(P, id), id, { sides: ['livre'], margin: 0.6 })) break; n++; } } if (n < 2) P.errs.push(`só ${n} mesas de leitura`); };
    const desk = () => { for (const id of hall.concat(rooms.up || [])) if (P.place('mesa-escriba', lvOf(P, id), id)) return; P.lack = 1; P.errs.push('sem lugar para a mesa do escriba'); };
    for (const f of [[shelves, tables, desk], [tables, desk, shelves], [desk, shelves, tables]][P.attempt % 3]) f();
    P.opt(() => { for (const id of hall) if (P.place('banco', lvOf(P, id), id)) break; });
  }
  W.add('biblioteca', { use: 'biblioteca', H: ['salao', 'frente', 'naves', 'patio'], V: ['terreo', 'galeria', 'andar'], open: 1, lockNight: 1, need: { estante: 2, 'mesa-leitura': 2 }, door: [1.1, 1.5], furnish: libraryFurnish });

  // ------------------------------ a building of the town by its form (P4, D-093) ------------------------------
  // the shell of a type whose form has a body (G.Forma.body — the library today), as the god and the 3D draw it: the hall's
  // walls at the form's foot (the people's thickness, inside it), its floor on the solid base (base 'macica', the floor's
  // height), the eaves, the door and the windows where the form has them; the porch before the door an annex open at its sides,
  // the form's columns across its front (P.colonnade: the gap nearest the door the street's way in); the form's steps from the
  // street up to the base, one flight. Nothing of the shell drawn by chance: it is the form's. The inside, the type's own
  // furnishing in the hall
  const FORM_FURNISH = { biblioteca: libraryFurnish };
  const r2 = x => Math.round(x * 100) / 100;
  function formHall(P) {
    const rec = P.rec, tr = P.tr; const F = G.Forma && G.Forma.of(rec.t, rec.c); const B = F && G.Forma.body(F); if (!B) { P.errs.push('a forma do prédio sem corpo'); return; }
    const t = Math.min(tr.t || 0.3, 0.35), c = t / 2; const sh = B.r.slice(); const y0 = B.y0, h0 = B.y1 - B.y0;
    P.shell = { kind: 'rect', r: sh, t, mat: B.tabuas ? 'tabua' : tr.mat, base: 'macica', baseH: y0, floors: 1, eave: B.y1 };
    const T = B.telhado; P.roof = { kind: T.tipo, along: T.ao || null, h: r2(T.y1 - T.y0), over: T.ov || 0 }; P.roofGeo = { kind: T.tipo, along: T.ao || null, eave: T.y0, rise: T.y1 - T.y0, R: T.r.slice() };
    const I = P.inner(); P.level(0, y0, h0, 'piso', I); P.entryLv = 0;
    P.outer = P.walls4(0, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h0, 1, 'parede'); P.outers = [P.outer];
    // (the door on the front face where the form has it — the street's, where no porch stands before it)
    const fw = P.outer.frente, porch = B.portico;
    const d0 = P.door(fw, P.atOf(fw, [B.porta.u, sh[3] - c]), B.porta.w, Math.min(h0 - 0.1, B.porta.y1 - B.porta.y0), -1, porch ? -1 : 'rua', porch ? 0 : 1, 'porta');
    // (the windows: each pane on its face, along it as the form has it, its sill over the floor)
    for (const j of B.janelas) {
      const id = P.outer[j.na]; if (id === undefined) continue; const m = (j.de + j.ate) / 2;
      const p = j.na === 'frente' ? [m, sh[3] - c] : j.na === 'fundo' ? [m, sh[1] + c] : j.na === 'direita' ? [sh[2] - c, m] : [sh[0] + c, m];
      P.window(id, P.atOf(id, p), j.ate - j.de, j.y1 - j.y0, j.y0 - y0);
    }
    let entry = { door: d0, u: B.porta.u, w: B.porta.w, v: sh[3] };
    if (porch) {
      P.annex.push({ r: porch.r.slice(), h: porch.y1 - y0, fn: 'portico', lv: 0, roof: 'portico' });
      // (the colonnade right to left, as a front wall runs: its openings numbered from its start)
      const cols = porch.colunas.slice().sort((a, b) => a.c[0] - b.c[0]); const n = cols.length, vc = cols[0].c[1];
      const gaps = []; for (let k = 0; k < n - 1; k++) gaps.push((cols[k].c[0] + cols[k + 1].c[0]) / 2);
      let kn = 0; for (let k = 1; k < gaps.length; k++) if (Math.abs(gaps[k] - B.porta.u) < Math.abs(gaps[kn] - B.porta.u)) kn = k;
      const C = P.colonnade(0, [cols[n - 1].c[0], vc], [cols[0].c[0], vc], { n, col: 2 * cols[0].r, h: porch.y1 - y0, outer: 1, door: n - 2 - kn, rua: true });
      entry = { door: C.door, u: gaps[kn], w: P.doors[C.door].w, v: porch.r[3] };
    }
    P.entrance = { door: entry.door, u: entry.u, v: entry.v, w: entry.w, lv: 0 };
    // (the steps of the form, from the street up to the base)
    if (B.degraus.length) { let r = B.degraus[0].r.slice(); for (const q of B.degraus) r = [Math.min(r[0], q.r[0]), Math.min(r[1], q.r[1]), Math.max(r[2], q.r[2]), Math.max(r[3], q.r[3])]; P.stair('degraus', -1, 0, r, 0, -1, null, { larga: r[2] - r[0] >= 1.2 ? 1 : 0 }); }
    if (P.inside()) return;
    const rooms = { main: P.room(0, 'salao', I), front: undefined, cells: [], court: null, all: [] }; rooms.all.push(rooms.main);
    if (porch) { rooms.porch = P.room(0, 'portico', porch.r, 1); rooms.all.push(rooms.porch); }
    P._rooms = rooms; FORM_FURNISH[rec.t](P, rooms);
  }
  // (the family: the form's, the only one of a type it draws — every people has the form, its own or the classic one)
  In.addFamilies([{ id: 'forma.salao', H: 'forma', V: 'salao', S: 'forma.salao', name: 'Pela forma', can: rec => (G.Forma && G.Forma.of(rec.t, rec.c) && G.Forma.body(G.Forma.of(rec.t, rec.c)) ? null : 'o prédio sem a forma de um corpo'), build: P => formHall(P) }]);
  for (const t in FORM_FURNISH) In.addTypes({ [t]: Object.assign({}, In.TYPES[t], { fams: ['forma.salao'] }) });

  // ------------------------------ the square (P4, phase E) ------------------------------
  // the town's open ground — it blocks nothing: the world walks across it —, its shell 'aberta' (no walls, no roof, on the
  // ground: Space.BASELESS), as the god draws it: the fountain in the middle (where one drinks), a bench on either side of it,
  // facing it; the speaker's stone at one side, facing the fountain — one speaks to the people from it (P2's 'falar') — and
  // the places of those who stop to listen, in an arc before it ('ouvir'); in the corners, two by two, the places of those who
  // stop to talk ('conversar'): P.marks. The fountain, the benches and the stone are the square's own, under the sky: laid
  // with the shell ({ yard: 1 }, as a yard's — shellOut.yard), so that the god's view and the 3D from afar draw them where the
  // body and the people use them. Laid out by hand, no chance drawn: every square the same
  const SQ = ['praca-fonte.chao'];
  In.addFamilies([{ id: SQ[0], H: 'praca-fonte', V: 'chao', name: 'Praça da fonte', can: () => null, build: P => square(P) }]);
  In.addTypes({ praca: { use: 'praca', fams: SQ, open: 1 } });
  function square(P) {
    const L = P.L; const m = 0.1; const sh = [m, m, L - m, L - m]; const c = L / 2;
    P.shell = { kind: 'aberta', r: sh, t: 0, mat: 'chao', base: 'chao', floors: 1, eave: 0 }; P.roof = null;
    P.level(0, 0, 3.0, 'chao', sh); P.entryLv = 0;
    P.entrance = { door: -1, u: c, v: sh[3], w: L - 2 * m, lv: 0 };
    const id = P.room(0, 'largo', sh, 1); const Y = { yard: 1 };
    // (a people whose square has a form — the one the god and the 3D draw, D-093 —: its things where the form has them)
    if (G.Forma && G.Forma.has('praca', P.rec.c)) { squareOf(P, id, G.Forma.of('praca', P.rec.c), sh); return; }
    // (the fountain's basin, as the 3D draws it — round, of 1.4 m — in the square it fits in; the drinkers before and behind it)
    if (!P.at('fonte', 0, id, [c - 1.2, c - 1.2, c + 1.2, c + 1.2], 0, 1, { yard: 1, h: 0.72 })) { P.errs.push('sem lugar para a fonte'); return; }
    for (const s of [-1, 1]) if (!P.at('banco', 0, id, [c - 0.9, c + s * 2.7 - 0.22, c + 0.9, c + s * 2.7 + 0.22], 0, -s, Y)) { P.errs.push('sem lugar para o banco da praça'); return; }
    const st = P.at('tribuna', 0, id, [m + 0.5, c - 0.5, m + 1.5, c + 0.5], 1, 0, Y); if (!st) { P.errs.push('sem lugar para a pedra de falar'); return; }
    if (P.inside()) return;
    // (who listens: before the stone, facing it, at 1.3 m)
    const su = (st.r[0] + st.r[2]) / 2, sv = (st.r[1] + st.r[3]) / 2; const ear = [];
    for (const a of [-50, -25, 0, 25, 50]) { const t = a * Math.PI / 180; const u = su + 1.3 * Math.cos(t), v = sv + 1.3 * Math.sin(t); ear.push([u, v, Math.atan2(su - u, sv - v)]); }
    P.marks(0, id, 'ouvir', ear);
    // (who stops to talk: two by two in the corners, facing each other)
    const talk = []; for (const [u, v] of [[1.4, 1.5], [L - 2.3, 1.5], [1.4, L - 1.5], [L - 2.3, L - 1.5]]) talk.push([u, v, Math.PI / 2], [u + 0.9, v, -Math.PI / 2]);
    P.marks(0, id, 'conversar', talk);
  }
  // ------------------------------ the square of a people's form (P4, D-093) ------------------------------
  // the square as the god and the 3D draw it — its form (G.Forma), the one seen: the plan puts there only what is used, where the
  // form has it — the fountain, the benches, the speaker's stone (P.at on the form's rectangle, at its top; marked form: the 3D
  // does not draw them again) —, keeps the feet off what stands solid on its ground (a piece of no use at the foot of each:
  // 'solido'), and lays on the free floor the places of those who listen before the stone and of those who talk, two by two.
  // A speaker's stone higher than a step (the rostra of Rome, 1.64 m) is a storey of its own over the square — its top, the
  // speaker's place on it —, the form's treads the flight up to it
  In.addItems({ solido: { name: 'Sólido', w: 0.2, d: 0.2, h: 1, solid: 1, free: 1, spots: () => [] } });
  const KIND_OF_USE = { fonte: 'fonte', banco: 'banco', tribuna: 'tribuna' };
  function squareOf(P, id, F, sh) {
    const uses = G.Forma.uses(F); const FM = { form: 1 };
    // (the rostra: its top a storey over the square, the treads up from behind — in the shell, what is seen from afar)
    const high = uses.find(u => u.uso === 'tribuna' && u.y1 > In.BODY.up); let top = null;
    if (high) {
      const st = high.escada || []; if (!st.length) { P.errs.push('a tribuna alta da forma sem escada'); return; }
      P.level(1, high.y1, 2.6, 'tribuna', high.r); top = P.room(1, 'tribuna', high.r, 1);
      const lo = st[0].r, hi = st[st.length - 1].r; const R = [Math.min(lo[0], hi[0]), Math.min(lo[1], hi[1]), Math.max(lo[2], hi[2]), Math.max(lo[3], hi[3])];
      const du = Math.sign((hi[0] + hi[2]) - (lo[0] + lo[2])), dv = Math.sign((hi[1] + hi[3]) - (lo[1] + lo[3]));
      P.stair('escada', 0, 1, R, du, dv);
    }
    if (P.inside()) return;
    let stone = null;
    for (const u of uses) {
      const kind = KIND_OF_USE[u.uso]; if (!kind) continue; const f = u.vira || [0, 1];
      if (u === high) { if (!P.at('solido', 0, id, u.r, 0, 1, Object.assign({ h: u.y1 }, FM))) { P.errs.push('sem lugar para os rostros da forma'); return; } stone = { r: u.r, f, lv: 1, room: top }; continue; }
      const it = P.at(kind, 0, id, u.r, f[0], f[1], Object.assign({ h: u.y1 }, FM));
      if (!it) { P.errs.push(`sem lugar para ${kind === 'fonte' ? 'a fonte' : kind === 'banco' ? 'o banco' : 'a pedra de falar'} da forma`); return; }
      if (kind === 'tribuna') stone = { r: it.r, f, lv: 0, room: id };
    }
    // (what stands solid on the ground: a solid piece at its foot, the biggest first — one touching another's foot is the
    // other's: the posts of a stall at its counter's corners —, the feet and the marks kept off it)
    const feet = []; const foot = s => (s.k === 'rect' ? s.r : [s.c[0] - s.r, s.c[1] - s.r, s.c[0] + s.r, s.c[1] + s.r]); const area = r => (r[2] - r[0]) * (r[3] - r[1]);
    for (const s of G.Forma.solids(F).slice().sort((a, c) => area(foot(c)) - area(foot(a)))) {
      const r = foot(s); if (feet.some(q => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1])) continue;
      if (!P.at('solido', 0, id, r, 0, 1, Object.assign({ h: s.y1 }, FM))) { P.errs.push('um sólido da forma onde a praça não o põe'); return; }
      feet.push(r);
    }
    if (!stone) { P.errs.push('a forma da praça sem a pedra de falar'); return; }
    // (who speaks: on the stone — the piece's own place —, or on the rostra's top, facing the people)
    const su = (stone.r[0] + stone.r[2]) / 2, sv = (stone.r[1] + stone.r[3]) / 2; const [fu, fv] = stone.f;
    if (stone.lv === 1) P.marks(1, stone.room, 'falar', [[su, sv, Math.atan2(fu, fv)]]);
    // (who listens: in an arc before it, facing it, 0.8 m past its front)
    const R = (fu ? (stone.r[2] - stone.r[0]) : (stone.r[3] - stone.r[1])) / 2 + 0.8; const a0 = Math.atan2(fv, fu); const ear = [];
    for (const a of [-50, -25, 0, 25, 50]) { const t = a0 + a * Math.PI / 180; const u = su + R * Math.cos(t), v = sv + R * Math.sin(t); ear.push([u, v, Math.atan2(su - u, sv - v)]); }
    P.marks(0, id, 'ouvir', ear);
    // (who stops to talk: two by two on the free floor, facing each other — the farthest pairs from the stone and from each other)
    const open = (u, v) => u > sh[0] + 0.4 && u < sh[2] - 0.4 && v > sh[1] + 0.4 && v < sh[3] - 0.4 && !P.items.some(it => it.lv === 0 && u > it.r[0] - 0.45 && u < it.r[2] + 0.45 && v > it.r[1] - 0.45 && v < it.r[3] + 0.45) && !ear.some(q => Math.hypot(q[0] - u, q[1] - v) < 0.9);
    const pairs = [];
    for (let v = sh[1] + 0.9; v <= sh[3] - 0.9 + 1e-9; v += 0.5) for (let u = sh[0] + 0.9; u + 0.9 <= sh[2] - 0.9 + 1e-9; u += 0.5) if (open(u, v) && open(u + 0.9, v)) pairs.push([u, v]);
    const pick = []; for (const p of pairs.sort((p, q) => Math.hypot(q[0] - su, q[1] - sv) - Math.hypot(p[0] - su, p[1] - sv) || p[1] - q[1] || p[0] - q[0])) { if (pick.length >= 4) break; if (pick.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) >= 2)) pick.push(p); }
    if (!pick.length) { P.errs.push('sem chão livre para quem conversa'); return; }
    const talk = []; for (const [u, v] of pick) talk.push([u, v, Math.PI / 2], [u + 0.9, v, -Math.PI / 2]);
    P.marks(0, id, 'conversar', talk);
  }
})(window.G);
