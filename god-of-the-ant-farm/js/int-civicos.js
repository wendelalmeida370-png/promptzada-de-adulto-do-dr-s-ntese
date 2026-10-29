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

  // the temple of a form (D-093): its cella the god's own, smaller than a hall's — the image of the god against its back wall,
  // the altar a pace before it with the priest's room between them and the offering's before it; where the cella is the
  // image's alone, the altar before its door, under the sky —; the faithful along the cella's walls beside them, and under the
  // porch, round the cella in the peristyle, in the court (a bench or a mat), or standing before the door; a lamp at either
  // hand of the altar where there is room left; the chest of the offerings. Laid out the same in every attempt: the image,
  // the altar, the places of the faithful, then what is for comfort
  function formTempleFurnish(P) {
    const rooms = P._rooms; const cella = rooms.main; const lv = lvOf(P, cella); const A = P.rooms[cella].r;
    const im = P.place('idolo', lv, cella, { sides: ['fundo'], center: true }); if (!im) { P.errs.push('sem lugar para a imagem do deus'); return; }
    const cu = (im.r[0] + im.r[2]) / 2; let al = null;
    const altarAt = dv => { for (const du of [0, -0.3, 0.3, -0.6, 0.6]) { const u = Math.max(A[0] + 0.7, Math.min(A[2] - 0.7, cu + du)); const a = P.at('altar', lv, cella, [u - 0.6, im.r[3] + dv, u + 0.6, im.r[3] + dv + 0.7], 0, 1); if (a) return a; } return null; };
    for (let dv = 0.75; !al && im.r[3] + dv + 0.7 <= A[3] - 0.6 + 1e-6; dv += 0.1) al = altarAt(dv);
    // (a shrine too shallow for a pace between them — the pyramid's —: as little as the priest's place behind the altar takes)
    for (let dv = 0.6; !al && dv < 0.75 - 1e-9 && im.r[3] + dv + 0.7 <= A[3] - 0.6 + 1e-6; dv += 0.05) al = altarAt(dv);
    // (and where the shrine is the image's alone, the stone before its door under the sky — the pyramid's top, a court —: past
    // the way out of the door, the priest between it and the door, who offers before it; on the axis, else to either side)
    let ar = cella; const S0 = P._form; const fr = has(rooms.court) ? rooms.court : S0 ? (rooms.walk || []).find(id => P.rooms[id].fn === 'plataforma' && Math.abs(P.rooms[id].r[1] - S0.wall) < 0.05) : undefined;
    if (!al && has(fr)) { const R = P.rooms[fr].r;
      for (let v = R[1] + 1.0; !al && v + 0.7 + 0.6 <= R[3] + 1e-6; v += 0.1) for (const du of [0, -1.0, 1.0, -1.4, 1.4]) { const u = Math.max(R[0] + 0.7, Math.min(R[2] - 0.7, cu + du)); al = P.at('altar', lv, fr, [u - 0.6, v, u + 0.6, v + 0.7], 0, 1); if (al) { ar = fr; break; } } }
    if (!al) { P.lack = 1; P.errs.push('sem lugar para o altar'); return; }
    const kind = KNEEL[P.rec.c] ? 'esteira-oracao' : 'banco-fieis'; let n = 0;
    for (const id of [cella].concat(rooms.cells)) for (let g = 0; g < 3 && n < 6; g++) { if (!P.place(kind, lvOf(P, id), id, { sides: ['esquerda', 'direita', 'livre', 'fundo'], margin: 0.35 })) break; n++; }
    // (where no more go — the Greeks' cella, the walk between its walls and the columns too narrow for a bench, the pyramid's
    // top —, the faithful stand to pray before its door, under the columns: places with no piece, on a line between the cella
    // and the columns or the edge, clear of the door, of the steps coming up and of what stands there — a brazier —)
    const S = P._form; if (n < 2 && S) {
      const front = rooms.cells.find(id => { const r = P.rooms[id].r; return Math.abs(r[1] - S.wall) < 0.05 && r[0] < S.door - 0.5 && r[2] > S.door + 0.5; });
      if (has(front)) { const r = P.rooms[front].r; const v = (S.wall + Math.min(r[3], S.cols)) / 2; const pts = [];
        const clear = u => !P.items.some(it => it.lv === lv && In.ITEMS[it.kind].solid && u > it.r[0] - 0.75 && u < it.r[2] + 0.75 && v > it.r[1] - 0.75 && v < it.r[3] + 0.75);
        for (let u = r[0] + 0.6; u <= r[2] - 0.6 + 1e-6; u += 0.1) if (Math.abs(u - S.door) > S.doorW / 2 + 0.6 && !(u > S.lance[0] - 0.4 && u < S.lance[1] + 0.4) && clear(u) && (!pts.length || u - pts[pts.length - 1][0] >= 0.9 - 1e-6)) pts.push([r2(u), r2(v), Math.PI]);
        if (pts.length) { P.marks(lv, front, 'rezar', pts); n += pts.length; } }
    }
    if (n < 2) P.errs.push(`só ${n} lugares para os fiéis`);
    P.opt(() => { const ac = (al.r[0] + al.r[2]) / 2; for (const du of [-1.1, 1.1]) P.at('lampadario', lv, ar, [ac + du - 0.23, al.r[1] + 0.12, ac + du + 0.22, al.r[1] + 0.57], 0, 1); });
    P.opt(() => { for (const id of [cella].concat(rooms.cells)) if (P.place('cofre', lvOf(P, id), id)) break; });
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
  // the shell of a type whose form has a body (G.Forma.body — the library, the temple), as the god and the 3D draw it: the
  // walls at the form's foot (the people's thickness, inside it), the floor on the solid base (base 'macica', the floor's
  // height: the library's plinth, the temple's stylobate, podium or pyramid) or on the ground, the eaves, the door and the
  // windows where the form has them; before the door the porch — an annex open at its sides, the form's columns across its
  // front —, or round the walls the peristyle — the walk between them and the edge of the base, open, the form's columns round
  // it —, the bay nearest where the street comes up the street's way in (P.colonnade, each column where the form's stands);
  // or the court open to the sky and the pylon round the gate the street comes in by (the Egyptians'); or the top of the
  // pyramid round the shrine, the street's way in where the steps come up to it (the Aztecs'); the form's steps from the street
  // up to the base, one flight on the form's own treads; what stands on the ground the feet walk, the form's solids. Nothing
  // of the shell drawn by chance: it is the form's. The inside, the type's own furnishing in the hall (the temple's in its cella),
  // the hall split first into rooms of its own where the type says so. Each type by its form comes in by In.formType, below
  const FORM_FURNISH = {}, FORM_FAM = {}, HALL_FN = {}, FORM_SPLIT = {}, FORM_T = {}, FORM_BARE = {};
  const r2 = x => Math.round(x * 100) / 100;
  // (a row of the form's columns as a colonnade of the plan — the wall from the outer face of one end column to the other's,
  // each of the plan's columns where the form's stands, the spaces between them as wide as the form has them (the Norse
  // gallery's portal, a post left out), as high as the columns: the beam over them is the form's —, along u from its right end,
  // along v from its back end; o.rua: the bay nearest uIn the street's way in; o.bay: that bay a door all the same, onto what
  // stands before the porch — the Egyptian palace's passage through its pylon. → { door, u: that bay's middle })
  function colRow(P, cols, h, o, uIn) {
    const alongU = Math.abs(cols[0].c[1] - cols[cols.length - 1].c[1]) < 0.05; const k = alongU ? 0 : 1;
    const s = cols.slice().sort((a, b) => a.c[k] - b.c[k]); const n = s.length, rc = s[0].r, at = s[0].c[1 - k];
    const lo = s[0].c[k] - rc, hi = s[n - 1].c[k] + rc; const A = alongU ? [hi, at] : [at, lo], B = alongU ? [lo, at] : [at, hi];
    const pos = alongU ? s.map(q => hi - q.c[0]).reverse() : s.map(q => q.c[1] - lo);
    // (the bays numbered from the colonnade's start: along u from the right, the q-th between the columns n-1-q and n-2-q)
    let door; let u = null;
    if (o.rua || o.bay) { let best = Infinity; for (let q = 0; q < n - 1; q++) { const m = (s[n - 1 - q].c[0] + s[n - 2 - q].c[0]) / 2; if (Math.abs(m - uIn) < best) { best = Math.abs(m - uIn); door = q; u = m; } } }
    const C = P.colonnade(0, A, B, { at: pos, col: 2 * rc, h, dh: h, outer: 1, door, rua: !!o.rua });
    return { door: C.door, u };
  }
  function formHall(P) {
    const rec = P.rec, tr = P.tr; const F = G.Forma && G.Forma.of(rec.t, rec.c); const B = F && G.Forma.body(F); if (!B) { P.errs.push('a forma do prédio sem corpo'); return; }
    const t = (FORM_T[rec.t] && FORM_T[rec.t](rec, F)) || Math.min(tr.t || 0.3, 0.35), c = t / 2; const sh = B.r.slice(); const y0 = B.y0, h0 = B.y1 - B.y0;
    // (on the form's solid base — its steps the form's own —, or on the ground: the steps before its door the street's. Solid
    // from a body's step over the lot's foot, In.BODY.step, as the P3's bodyShell and openBase have it — L-390: a floor a few
    // centimetres up is a stone the street's steps come up to, not a base the plan alone climbs: on a lot that falls away, the
    // street below a floor laid on a solid base of 0.13 m had no step to it)
    P.shell = { kind: 'rect', r: sh, t, mat: B.tabuas ? 'tabua' : tr.mat, base: y0 >= In.BODY.step ? 'macica' : 'pedra', baseH: y0, floors: 1, eave: B.y1 };
    const T = B.telhado; P.roof = { kind: T.tipo, along: T.ao || null, h: r2(T.y1 - T.y0), over: T.ov || 0 }; P.roofGeo = { kind: T.tipo, along: T.ao || null, eave: T.y0, rise: T.y1 - T.y0, R: T.r.slice() };
    const I = P.inner(); P.level(0, y0, h0, 'piso', I); P.entryLv = 0;
    P.outer = P.walls4(0, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h0, 1, 'parede'); P.outers = [P.outer];
    // (what stands before the walls: the porch, the peristyle, the court and the pylon round its gate (the Egyptians'), or the
    // top of a stepped base where it runs on before them — the pyramid's platform (the Aztecs'))
    const porch = B.portico, peri = B.peristilo, gate = B.portao, pass = B.passagem; const bare = gate && !B.patio;
    const tiers = B.base && B.base.degraus, plat = tiers && tiers.length ? tiers[tiers.length - 1] : null;
    const top = !porch && !peri && !gate && plat && Math.abs(plat.y1 - y0) < 0.05 && plat.r[3] - sh[3] > 0.3 ? plat : null;
    // (the door on the front face where the form has it — the street's, where nothing of these stands before it)
    const fw = P.outer.frente, before = !!(porch || peri || gate || top || pass);
    const d0 = P.door(fw, P.atOf(fw, [B.porta.u, sh[3] - c]), B.porta.w, Math.min(h0 - 0.1, B.porta.y1 - B.porta.y0), -1, before ? -1 : 'rua', before ? 0 : 1, 'porta');
    // (the windows: each pane on its face, along it as the form has it, its sill over the floor)
    for (const j of B.janelas) {
      const id = P.outer[j.na]; if (id === undefined) continue; const m = (j.de + j.ate) / 2;
      const p = j.na === 'frente' ? [m, sh[3] - c] : j.na === 'fundo' ? [m, sh[1] + c] : j.na === 'direita' ? [sh[2] - c, m] : [sh[0] + c, m];
      P.window(id, P.atOf(id, p), j.ate - j.de, j.y1 - j.y0, j.y0 - y0);
    }
    // (where the street comes up: the middle of the form's steps, else of its door)
    const uIn = B.degraus.length ? (Math.min(...B.degraus.map(q => q.r[0])) + Math.max(...B.degraus.map(q => q.r[2]))) / 2 : B.porta.u;
    let entry = { door: d0, u: B.porta.u, w: B.porta.w, v: sh[3] };
    if (porch) {
      P.annex.push({ r: porch.r.slice(), h: porch.y1 - y0, fn: 'portico', lv: 0, roof: 'portico' });
      const R = colRow(P, porch.colunas, porch.y1 - y0, bare ? { bay: true } : { rua: true }, uIn);
      if (!bare) entry = { door: R.door, u: R.u, w: P.doors[R.door].w, v: porch.r[3] };
    }
    const strips = [];
    if (peri) {
      // (the walk round the walls, to the edge of the base: in front, to either side of them, behind — the corners with the front
      // and the back —, under the form's roof)
      const O = peri.r; const ph = (peri.y1 || B.y1) - y0;
      strips.push([O[0], sh[3], O[2], O[3]], [O[0], sh[1], sh[0], sh[3]], [sh[2], sh[1], O[2], sh[3]], [O[0], O[1], O[2], sh[1]]);
      for (const r of strips) P.annex.push({ r: r.slice(), h: ph, fn: 'peristilo', lv: 0, roof: 'portico' });
      // (the columns: the rows of the front and the back, and of the sides from corner to corner)
      const cs = peri.colunas; const near = (a, b) => Math.abs(a - b) < 0.05;
      const u0 = Math.min(...cs.map(q => q.c[0])), u1 = Math.max(...cs.map(q => q.c[0])), v0 = Math.min(...cs.map(q => q.c[1])), v1 = Math.max(...cs.map(q => q.c[1]));
      const R = colRow(P, cs.filter(q => near(q.c[1], v1)), ph, { rua: true }, uIn);
      entry = { door: R.door, u: R.u, w: P.doors[R.door].w, v: O[3] };
      for (const row of [cs.filter(q => near(q.c[1], v0)), cs.filter(q => near(q.c[0], u0)), cs.filter(q => near(q.c[0], u1))]) if (row.length >= 2) colRow(P, row, ph, {}, uIn);
    }
    // (the court before the walls and the pylon round its gate: the shell's yard, open to the sky, from the walls' front to the
    // pylon's inner face; the passage through the pylon an annex under its lintel, between the towers, to the gate's face —
    // before it, between them, the doorstep and its steps down to the street, the street's, on the gate's own side: the towers
    // stand before the court's, and a yard to the gate's face laid its steps along the face, into the towers' fronts —; the gate
    // the street's door, in a wall at its face between the jambs, as high as they stand, an opening always open: the form draws
    // it so, with no leaf — the hall's door is the one that shuts —; the towers, the jambs, the columns of the court what stands
    // on the ground of the two, the form's solids: below)
    let courtR = null, passR = null, gateR = null, wayR = null;
    if (bare) {
      // (a pylon with no court before the walls — the Egyptian palace's (P3): the passage through it an annex from the front of
      // the walls, or of the porch, to the gate's face, under its lintel, between the towers; the gate a 'vao' always open, as the
      // form draws it with no leaf — the hall's door is the one that shuts)
      const v0 = porch ? porch.r[3] : sh[3], tw = B.torres || [], tg = 0.2;
      const gl = Math.max(gate.r[0], ...tw.filter(q => q[2] <= gate.u).map(q => q[2])), gr = Math.min(gate.r[2], ...tw.filter(q => q[0] >= gate.u).map(q => q[0]));
      P.annex.push({ r: [gl, v0, gr, gate.v], h: gate.y1 - gate.y0, fn: 'passagem', lv: 0, roof: 'portico' });
      const gw = P.wall(0, [gr, gate.v - tg / 2], [gl, gate.v - tg / 2], tg, gate.y1 - gate.y0 + 0.5, 1, 'parede');
      const gd = P.door(gw, P.atOf(gw, [gate.u, gate.v - tg / 2]), gate.w, gate.y1 - gate.y0, -1, 'rua', 1, 'vao');
      entry = { door: gd, u: gate.u, w: gate.w, v: gate.v }; gateR = [gl, v0, gr, gate.v - tg];
    } else if (gate) {
      const tw = B.torres || [], tg = 0.2; const all = [B.patio ? B.patio.r : sh].concat(tw);
      P.yard = { r: [Math.min(...all.map(q => q[0])), sh[3], Math.max(...all.map(q => q[2])), gate.r[1]], h: 0, lv: 0 };
      const jambs = G.Forma.solids(F).filter(s => s.k === 'rect' && s.r[1] < gate.v - 0.05 && s.r[3] > gate.v - tg && (Math.abs(s.r[2] - gate.r[0]) < 0.03 || Math.abs(s.r[0] - gate.r[2]) < 0.03));
      const gl = Math.min(gate.r[0], ...jambs.map(s => s.r[0])), gr = Math.max(gate.r[2], ...jambs.map(s => s.r[2])), gh = Math.max(gate.y1 - gate.y0 + 0.5, ...jambs.map(s => s.y1 - gate.y0));
      P.annex.push({ r: [gl, gate.r[1], gr, gate.v], h: gate.y1 - gate.y0, fn: 'passagem', lv: 0, roof: 'portico' });
      const gw = P.wall(0, [gr - tg / 2, gate.v - tg / 2], [gl + tg / 2, gate.v - tg / 2], tg, gh, 1, 'parede');
      const gd = P.door(gw, P.atOf(gw, [gate.u, gate.v - tg / 2]), gate.w, gate.y1 - gate.y0, -1, 'rua', 1, 'vao');
      entry = { door: gd, u: gate.u, w: gate.w, v: gate.v }; courtR = P.yard.r.slice(); passR = [gl, gate.r[1], gr, gate.v - tg];
    }
    // (the way the form covers before its walls — the temazcal's under its dome (P3): an annex to the face, the wall there and in
    // it the way in, a 'vao' as wide as the door, always open)
    if (pass) {
      const tp = 0.1, pv = pass.r[3] - tp / 2, w = Math.min(B.porta.w, pass.r[2] - pass.r[0]), dh = Math.min(h0 - 0.1, B.porta.y1 - B.porta.y0);
      P.annex.push({ r: pass.r.slice(), h: pass.y1 - y0, fn: 'passagem', lv: 0, roof: 'portico' });
      const pw = P.wall(0, [pass.r[2], pv], [pass.r[0], pv], tp, pass.y1 - y0, 1, 'parede');
      const pd = P.door(pw, P.atOf(pw, [B.porta.u, pv]), w, dh, -1, 'rua', 1, 'vao');
      entry = { door: pd, u: B.porta.u, w, v: pass.r[3] }; wayR = [pass.r[0], pass.r[1], pass.r[2], pass.r[3] - tp];
    }
    // (the top of a stepped base the walls stand on, before them and round them: the shell's yard, open to the sky; its edge
    // where the form's steps come up the street's way in — the edge of a floor over a drop, where the form has nothing standing:
    // a wall of kind 'borda', of no height, as long as the steps are wide, its opening the whole of it)
    if (top) {
      P.yard = { r: top.r.slice(), h: 0, lv: 0 };
      const lu0 = Math.min(...B.degraus.map(q => q.r[0])), lu1 = Math.max(...B.degraus.map(q => q.r[2])), tb = 0.1;
      const bw = P.wall(0, [lu1 + tb / 2, top.r[3] + tb / 2], [lu0 - tb / 2, top.r[3] + tb / 2], tb, 0, 1, 'borda');
      const bd = P.door(bw, P.atOf(bw, [(lu0 + lu1) / 2, top.r[3] + tb / 2]), lu1 - lu0, In.DOOR_MIN + 0.45, -1, 'rua', 1, 'vao');
      entry = { door: bd, u: (lu0 + lu1) / 2, w: lu1 - lu0, v: top.r[3] };
    }
    P.entrance = { door: entry.door, u: entry.u, v: entry.v, w: entry.w, lv: 0 };
    // (the steps of the form, from the street up to the base: one flight, on the form's own treads — the feet on each, as the
    // god and the 3D draw them —, up to the porch's front, the peristyle's edge or the face the door is in: where the form's
    // base runs on before the walls — the Nordic hall's 0.2 m of plinth between its steps and its door, the P3's probe —, a
    // last tread at the floor; cut into the base, as the temple's are, they end where the form ends them)
    if (B.degraus.length) {
      let r = B.degraus[0].r.slice(); for (const q of B.degraus) r = [Math.min(r[0], q.r[0]), Math.min(r[1], q.r[1]), Math.max(r[2], q.r[2]), Math.max(r[3], q.r[3])];
      const treads = B.degraus.map(q => ({ r: q.r.slice(), y: q.y1 })); const edge = porch ? porch.r[3] : peri ? peri.r[3] : top ? top.r[3] : sh[3];
      if (r[1] > edge + 1e-6) { treads.push({ r: [r[0], edge, r[2], r[1]], y: y0 }); r[1] = edge; }
      P.stair('degraus', -1, 0, r, 0, -1, null, { larga: r[2] - r[0] >= 1.2 ? 1 : 0, treads });
    }
    if (P.inside()) return;
    // (for the furnishing: the cella's front wall, the inner face of the columns before it, its door, the steps coming up)
    const fc = (porch ? porch.colunas : peri ? peri.colunas : []).filter(q => q.c[1] > sh[3]);
    P._form = { wall: sh[3], cols: fc.length ? Math.min(...fc.map(q => q.c[1] - q.r)) : Infinity, door: B.porta.u, doorW: B.porta.w, lance: B.degraus.length ? [Math.min(...B.degraus.map(q => q.r[0])), Math.max(...B.degraus.map(q => q.r[2]))] : [B.porta.u, B.porta.u] };
    // (the hall: one room — or the rooms the type splits it into, the one the door opens into the main: its own walls and doors
    // within the hall's, laid by the type's split, P.walls / P.door / P.room)
    const sp = FORM_SPLIT[rec.t] ? FORM_SPLIT[rec.t](P, I, HALL_FN[rec.t] || 'salao') : null; if (FORM_SPLIT[rec.t] && (!sp || !has(sp.main))) { P.errs.push('o salão da forma sem o cômodo da porta'); return; }
    const rooms = { main: sp ? sp.main : P.room(0, HALL_FN[rec.t] || 'salao', I), front: undefined, cells: [], court: null, all: [], inner: sp ? sp.rooms.slice() : [] }; rooms.all.push(...(sp ? sp.rooms : [rooms.main]));
    if (porch) { rooms.porch = P.room(0, 'portico', porch.r, 1); rooms.all.push(rooms.porch); }
    if (courtR) { rooms.court = P.room(0, 'patio', courtR, 1); rooms.gate = P.room(0, 'passagem', passR, 0); rooms.all.push(rooms.court, rooms.gate); }
    if (gateR) { rooms.gate = P.room(0, 'passagem', gateR, 0); rooms.all.push(rooms.gate); }
    if (wayR) { rooms.pass = P.room(0, 'passagem', wayR, 0); rooms.all.push(rooms.pass); }
    // (the walk round the walls — the peristyle's, the gallery's, the platform's —: the strip before the door a room always, the
    // way in crosses it; another where the walk from the street reaches it — a walk narrower than the plan's grid of a quarter
    // metre lets a body go along, as the Norse gallery's 0.70 m between its staves and its walls, is the form's to see, not a
    // floor to walk: so the feet are kept off it, as off any edge)
    const Y = top && top.r; const ring = Y ? [[Y[0], sh[3], Y[2], Y[3]], [Y[0], sh[1], sh[0], sh[3]], [sh[2], sh[1], Y[2], sh[3]], [Y[0], Y[1], Y[2], sh[1]]].filter(r => Math.min(r[2] - r[0], r[3] - r[1]) >= 2 * In.BODY.r + 0.1) : [];
    for (const [k, r] of strips.map(r => [0, r]).concat(ring.map(r => [1, r]))) {
      const front = Math.abs(r[1] - sh[3]) < 1e-6; const id = P.room(0, k ? 'plataforma' : 'peristilo', r, 1);
      if (!front && !P.walks(0)) { P.rooms.pop(); continue; }
      rooms.all.push(id); rooms.walk = (rooms.walk || []).concat(id);
    }
    // (what stands solid on the ground of the court and of the passage, the form's: a solid piece at its foot within each — the
    // biggest first, a foot another's covers across a side cut back to the rest (a column half in a tower) —, the body and the
    // places kept off it)
    const foot = s => (s.k === 'rect' ? s.r : [s.c[0] - s.r, s.c[1] - s.r, s.c[0] + s.r, s.c[1] + s.r]); const area = r => (r[2] - r[0]) * (r[3] - r[1]); const feet = [];
    for (const id of (has(rooms.court) ? [rooms.court, rooms.gate] : []).filter(has)) {
      const R = P.rooms[id].r;
      for (const s of G.Forma.solids(F).slice().sort((a, b) => area(foot(b)) - area(foot(a)))) {
        let r = [Math.max(R[0], foot(s)[0]), Math.max(R[1], foot(s)[1]), Math.min(R[2], foot(s)[2]), Math.min(R[3], foot(s)[3])]; if (r[2] - r[0] < 0.05 || r[3] - r[1] < 0.05) continue;
        for (const q of feet) { if (!(r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1])) continue; if (q[0] <= r[0] && q[2] >= r[2]) { if (q[1] <= r[1]) r[1] = q[3]; else if (q[3] >= r[3]) r[3] = q[1]; } else if (q[1] <= r[1] && q[3] >= r[3]) { if (q[0] <= r[0]) r[0] = q[2]; else if (q[2] >= r[2]) r[2] = q[0]; } }
        if (r[2] - r[0] < 0.05 || r[3] - r[1] < 0.05 || feet.some(q => r[0] < q[2] - 1e-6 && r[2] > q[0] + 1e-6 && r[1] < q[3] - 1e-6 && r[3] > q[1] + 1e-6)) continue;
        // (two pieces keep 2 cm between them: where one touches another's foot — a jamb against its tower, by a side or a corner —,
        // it gives them on the side it touches, as little as the grid of a quarter metre the feet walk on sees)
        for (const q of feet) { if (!(r[0] < q[2] + 0.021 && q[0] < r[2] + 0.021 && r[1] < q[3] + 0.021 && q[1] < r[3] + 0.021)) continue;
          if (r[0] >= q[2] - 1e-9) r[0] = q[2] + 0.021; else if (r[2] <= q[0] + 1e-9) r[2] = q[0] - 0.021; else if (r[1] >= q[3] - 1e-9) r[1] = q[3] + 0.021; else if (r[3] <= q[1] + 1e-9) r[3] = q[1] - 0.021; }
        if (!P.at('solido', 0, id, r, 0, 1, { h: s.y1, form: 1 })) { P.errs.push(`um sólido da forma onde o pátio não o põe (${r.map(r2).join(', ')})`); return; }
        feet.push(r);
      }
    }
    // (the form's pieces of use on the floor the plan has — the braziers of the pyramid's top, D-093: solid at the foot of what
    // they stand on — their pedestal, u.pe —, or at their own; where one stands to light them, beside each toward the way in,
    // facing it; those out of its rooms, the street's)
    for (const u of G.Forma.uses(F)) {
      if (u.uso !== 'acender') continue; const id = rooms.all.find(q => { const m = P.rooms[q].r; return u.c[0] > m[0] && u.c[0] < m[2] && u.c[1] > m[1] && u.c[1] < m[3]; }); if (!has(id)) continue;
      const pe = u.pe || [u.c[0] - u.rad, u.c[1] - u.rad, u.c[0] + u.rad, u.c[1] + u.rad];
      if (!P.at('solido', 0, id, pe, 0, 1, { h: u.y1, form: 1 })) { P.errs.push('o braseiro da forma onde a planta não o põe'); return; }
      const du = entry.u - u.c[0], dv = entry.v - u.c[1], L = Math.hypot(du, dv) || 1, d = Math.max(pe[2] - pe[0], pe[3] - pe[1]) / 2 + In.BODY.r + 0.1;
      P.marks(0, id, 'acender', [[r2(u.c[0] + du / L * d), r2(u.c[1] + dv / L * d), Math.atan2(-du, -dv)]]);
    }
    // (the temple's faithful, where its cella has no room for rows: under the porch, round it in the peristyle, in the court,
    // on the platform before it)
    if (rec.t === 'temple') rooms.cells = (has(rooms.porch) ? [rooms.porch] : []).concat(rooms.walk || [], has(rooms.court) ? [rooms.court] : []);
    P._rooms = rooms; FORM_FURNISH[rec.t](P, rooms);
  }
  // (the families: the form's — the library's the only one of its type, every people has its form, its own or the classic one;
  // the temple's wherever it is laid out for the people (D-093: the six have their temple's form), the type's halls where it is
  // not, and where both are offered, the form's: the one the god and the 3D draw)
  const formCan = rec => (G.Forma && G.Forma.of(rec.t, rec.c) && G.Forma.body(G.Forma.of(rec.t, rec.c)) ? null : 'o prédio sem a forma de um corpo');
  // a type laid out by its form's body — one builder for all of them, this one (formHall: the shell, the porch, the peristyle,
  // the court and the pylon, the platform, the form's steps, its solids and its braziers): In.formType(type, { fam, furnish,
  // hall, split, keep }) — fam: the family's id (registered once, offered where the form has a body for the people);
  // furnish(P, rooms): the type's own furnishing (rooms.main the hall the door opens into, rooms.all every room, rooms.inner
  // the split's); hall: the hall's function ('salao' by default); split(P, I, fn) → { main, rooms }: the hall I divided into
  // rooms of its own before the furniture — its partitions and their doors laid by it (the palace's chamber, the baths' run
  // from the cold to the hot) —, the door from the street into main; keep: the type's other families kept after the form's,
  // for the peoples whose form is not laid out (the temple's halls), the form's preferred where it is: an old record of one of
  // them becomes the form's on loading where the form is laid out (In.migrate, by the type's formFam); t(rec, F): the walls'
  // thickness where the type's is its own (the temazcal's, inside its dome: P3); bare(P, F): the type's plan where its form has
  // no body — the Egyptian baths' sacred lake, open to the sky (P3) —, in the same family
  const formCanOf = rec => (FORM_BARE[rec.t] && G.Forma && G.Forma.of(rec.t, rec.c) ? null : formCan(rec));
  const formBuild = P => { const F = G.Forma && G.Forma.of(P.rec.t, P.rec.c); if (F && !G.Forma.body(F) && FORM_BARE[P.rec.t]) FORM_BARE[P.rec.t](P, F); else formHall(P); };
  In.formType = function (type, o) {
    FORM_FAM[type] = o.fam; FORM_FURNISH[type] = o.furnish; if (o.hall) HALL_FN[type] = o.hall; if (o.split) FORM_SPLIT[type] = o.split;
    if (o.t) FORM_T[type] = o.t; if (o.bare) FORM_BARE[type] = o.bare;
    if (!In.FAMS[o.fam]) In.addFamilies([{ id: o.fam, H: 'forma', V: o.fam.split('.')[1] || o.fam, S: o.fam, name: 'Pela forma', can: formCanOf, build: formBuild }]);
    const T = In.TYPES[type] || {}; const old = o.keep ? (T.fams || []).filter(f => f !== o.fam) : [];
    In.addTypes({ [type]: Object.assign({}, T, { fams: [o.fam].concat(old), formFam: o.fam }, old.length ? { prefer: (rec, ok) => (ok.includes(o.fam) ? [o.fam] : ok) } : {}) });
  };
  In.formType('biblioteca', { fam: 'forma.salao', furnish: libraryFurnish });
  In.formType('temple', { fam: 'forma.templo', furnish: formTempleFurnish, hall: 'nave', keep: true });

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
