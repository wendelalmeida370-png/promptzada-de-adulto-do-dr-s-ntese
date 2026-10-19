'use strict';
// ============================================================
//  The grammar of the interiors: how each people builds (walls,
//  roofs, storeys, the fire, the bed, the jars), what each kind
//  of building is for (its programme), and the families of plan —
//  each an organisation of space, not a decoration. A home's
//  family is an arrangement of its ground storey (the one open
//  room, the room in sectors, the annex, the work front, the
//  round hut) with an arrangement of its storeys (on the ground,
//  a loft under the roof, the roof made a terrace — with a room
//  on it —, the sunken floor, the house on stilts, a cellar under
//  it). A family says by its own rules where it cannot be built,
//  and why; where it can, the recipe lays it out in the canonical
//  frame (entrance at the front), with the plan's own dice, and
//  the engine proves it (it fits, every bed and fire is reached).
// ============================================================
(function (G) {
  const In = G.Interiors; const IT = In.ITEMS;

  // ------------------------------ the peoples' ways with space ------------------------------
  // mat/t: the wall and its thickness (m) — hutT for a hut; roof: its kind (the god's steep pitches: a roof about 0.8 of
  // its span high); h0/h1: the ground storey's height and the ones above; bed/rich: how the poor and the well-off sleep;
  // couple: the couple's bed; fire: the hearth; eat: the table; keep: the chest and the jars; win: how much it opens to
  // the street; round: its huts are round; sunk: it digs its floors; cellar: it keeps a cellar; long: its houses are long
  In.addTraditions({
    nordico: { mat: 'tabua', t: 0.14, hutT: 0.12, roof: 'turfa', h0: 2.2, h1: 2.3, bed: ['banco-cama'], rich: ['banco-cama'], couple: 'cama-casal', fire: 'lar', eat: 'mesa', keep: ['arca', 'cesto'], win: 0.3, sunk: 1, long: 1, taste: { 'integrado.terreo': 3, 'integrado.funda': 1.6, 'anexo.terreo': 2.2, 'setores.terreo': 1.2, 'integrado.jirau': 1.4 } },
    classico: { mat: 'taipa', t: 0.2, hutT: 0.15, roof: 'duas-aguas', hutRoof: 'palha', h0: 2.4, h1: 2.4, bed: ['esteira'], rich: ['cama'], couple: 'cama-casal', fire: 'lar', eat: 'mesa', keep: ['arca', 'cesto'], win: 0.5, round: 1, sunk: 1, cellar: 1, taste: { 'redonda.terreo': 3, 'integrado.jirau': 2 } },
    grego: { mat: 'adobe-caiado', t: 0.3, hutT: 0.18, roof: 'duas-aguas', hutRoof: 'palha', h0: 2.6, h1: 2.5, bed: ['esteira', 'cama'], rich: ['cama'], couple: 'cama-casal', fire: 'fogao', eat: 'mesa', keep: ['jarros', 'arca'], win: 0.6, round: 1, cellar: 1, taste: { 'setores.jirau': 1.8, 'redonda.terreo': 1.5 } },
    romano: { mat: 'reboco', t: 0.28, hutT: 0.15, roof: 'quatro-aguas', hutRoof: 'palha', flatTall: 1, h0: 2.8, h1: 2.6, bed: ['esteira', 'cama'], rich: ['cama'], couple: 'cama-casal', fire: 'fogao', eat: 'mesa', keep: ['jarros', 'arca'], win: 0.5, round: 1, cellar: 1, taberna: 1, taste: { 'produtiva.jirau': 2.2 } },
    egipcio: { mat: 'adobe', t: 0.34, hutT: 0.25, roof: 'plano', h0: 2.6, h1: 2.5, bed: ['esteira', 'cama'], rich: ['cama'], couple: 'cama', fire: 'forno', eat: 'mesa-baixa', keep: ['jarros', 'cesto'], win: 0.3, cellar: 1, taste: { 'integrado.quarto': 3, 'integrado.terraco': 2, 'produtiva.quarto': 1.4 } },
    asteca: { mat: 'adobe-estuque', t: 0.3, hutT: 0.15, roof: 'plano', hutRoof: 'palha', h0: 2.5, h1: 2.4, bed: ['esteira'], rich: ['esteira', 'cama'], couple: null, fire: 'lar', eat: 'mesa-baixa', keep: ['jarros', 'cesto'], win: 0.4, round: 1, taste: { 'integrado.terraco': 2.5, 'redonda.terreo': 1.4, 'setores.quarto': 1.6 } },
  });
  const PITCHED = { turfa: 1, 'duas-aguas': 1, 'quatro-aguas': 1, palha: 1, 'palha-conica': 1 };
  const roofOf = (rec, tr) => (rec.t === 'hut' && tr.hutRoof ? tr.hutRoof : rec.t === 'barraco' ? 'alpendre' : rec.t === 'insula' && tr.flatTall ? 'plano' : tr.roof);
  const pitched = (rec, tr) => !!PITCHED[roofOf(rec, tr)];
  const wet = rec => rec.fl || rec.cl === 'u';
  In.roofKind = roofOf;

  // ------------------------------ the families of homes: ground (H) × storeys (V) ------------------------------
  const HS = {
    integrado: { name: 'Salão', can: () => null },
    redonda: { name: 'Cabana redonda', can: (rec, tr) => (rec.t !== 'hut' ? 'só cabanas são redondas' : !tr.round ? 'este povo não faz casas redondas' : null) },
    setores: { name: 'Setores', can: rec => (rec.t === 'barraco' ? 'um barraco não tem divisória' : null) },
    anexo: { name: 'Anexo', can: rec => (rec.t === 'barraco' ? 'um barraco não tem anexo' : rec.d >= 3 ? 'no coração da cidade não sobra lote para um anexo' : null) },
    produtiva: { name: 'Frente de trabalho', can: rec => (rec.t !== 'house' ? 'só a casa tem frente de trabalho' : rec.d < 1 && rec.w < 1 ? 'longe do movimento da cidade' : null) },
  };
  const VS = {
    terreo: { name: '', can: () => null },
    jirau: { name: 'com jirau', can: (rec, tr) => (!pitched(rec, tr) ? 'telhado plano: não há volume para um jirau' : null) },
    terraco: { name: 'com terraço', can: (rec, tr) => (pitched(rec, tr) ? 'telhado inclinado: o teto não se usa' : rec.cl === 'f' ? 'no frio não se vive no teto' : null) },
    quarto: { name: 'com quarto no teto', can: (rec, tr) => (pitched(rec, tr) ? 'telhado inclinado: o teto não se usa' : rec.cl === 'f' ? 'no frio não se vive no teto' : null) },
    funda: { name: 'semienterrada', can: (rec, tr) => (!tr.sunk ? 'este povo não cava o piso' : wet(rec) ? 'chão encharcado: não se cava' : null) },
    esteios: { name: 'sobre esteios', can: rec => (!wet(rec) ? 'só onde a terra alaga ou é encharcada' : null) },
    'porao-jirau': { name: 'com porão e jirau', can: (rec, tr) => (!tr.cellar ? 'este povo não abre porão' : wet(rec) ? 'chão encharcado: não há porão' : !pitched(rec, tr) ? 'telhado plano: não há volume para um jirau' : null) },
    'porao-quarto': { name: 'com porão e quarto no teto', can: (rec, tr) => (!tr.cellar ? 'este povo não abre porão' : wet(rec) ? 'chão encharcado: não há porão' : pitched(rec, tr) ? 'telhado inclinado: o teto não se usa' : rec.cl === 'f' ? 'no frio não se vive no teto' : null) },
  };
  const NOT_WITH = { redonda: { jirau: 1, terraco: 1, quarto: 1, 'porao-jirau': 1, 'porao-quarto': 1 }, produtiva: { funda: 1, esteios: 1 } };
  const homeFams = [];
  for (const h in HS) for (const v in VS) {
    if (NOT_WITH[h] && NOT_WITH[h][v]) continue;
    const id = h + '.' + v; homeFams.push(id);
    In.addFamilies([{ id, H: h, V: v, name: (HS[h].name + (VS[v].name ? ' ' + VS[v].name : '')).replace('Salão com', 'Salão com').replace(/^Salão$/, 'Salão único'), can: (rec, T, tr) => (rec.t === 'barraco' && (h !== 'integrado' || v !== 'terreo') ? 'um barraco é um cômodo só, no chão' : HS[h].can(rec, tr) || VS[v].can(rec, tr)), build: P => home(P) }]);
  }
  In.addTypes({
    barraco: { use: 'casa', fams: ['integrado.terreo'] },
    hut: { use: 'casa', fams: homeFams },
    house: { use: 'casa', fams: homeFams },
  });

  // ------------------------------ the recipe of a home ------------------------------
  function home(P) {
    const F = P.fam, rec = P.rec, tr = P.tr, L = P.L; const def = G.BDEF[rec.t] || {}; const need = def.housing || 0;
    const hut = rec.t === 'hut', shack = rec.t === 'barraco';
    const H = F.H, V = F.V; const roofK = roofOf(rec, tr); const round = H === 'redonda';
    const cellar = V === 'porao-jirau' || V === 'porao-quarto'; const upV = V === 'porao-jirau' ? 'jirau' : V === 'porao-quarto' ? 'quarto' : V;
    // ---- the shell: as big as the lot lets it (the eaves inside the lot); the north's long and low ----
    const t = shack ? 0.06 : hut ? tr.hutT : tr.t; const mat = shack ? 'tabua' : hut && tr.hutT < tr.t ? (tr.mat === 'tabua' ? 'tabua' : 'pau-a-pique') : tr.mat;
    const m = shack ? P.rr(0.45, 0.6) : P.rr(0.16, 0.26);
    const sh = [m, m, L - m, L - m];
    if (tr.long && !shack && !round) sh[1] += P.rr(0.1, 0.3); // (the northern house, longer than deep)
    if (shack) sh[1] += P.rr(0.3, 0.6);
    let side = null;
    if (H === 'anexo') { const aw = P.rr(0.95, 1.2); side = P.chance(0.5) ? 'esquerda' : 'direita'; if (side === 'esquerda') sh[0] += aw; else sh[2] -= aw; }
    let porch = 0; if (V === 'esteios') { porch = P.rr(1.15, 1.35); sh[3] -= porch; }
    const h0 = shack ? 2.1 : tr.h0;
    const sunk = V === 'funda' ? -P.rr(0.6, 0.8) : 0, raised = V === 'esteios' ? P.rr(1.3, 1.55) : 0; const y0 = sunk || raised;
    if (round) { const rad = (L - 2 * m) / 2; P.shell = { kind: 'round', cu: L / 2, cv: L / 2, rad, t, mat, base: sunk ? 'semienterrado' : raised ? 'esteios' : 'pedra', floors: 1, eave: y0 + h0 }; }
    else P.shell = { kind: 'rect', r: sh, t, mat, base: raised ? 'esteios' : sunk ? 'semienterrado' : 'pedra', floors: 1, eave: y0 + h0 };
    const S = P.shell;
    // the roof: along the front for most, now and then the gable to the street; the round hut's cone
    const along = round ? null : P.chance(tr.long ? 0.85 : 0.72) ? 'u' : 'v';
    const R = round ? [L / 2 - S.rad, L / 2 - S.rad, L / 2 + S.rad, L / 2 + S.rad] : sh;
    const span = along === 'u' ? R[3] - R[1] : R[2] - R[0];
    const kind = round ? 'palha-conica' : roofK;
    const pitch = kind === 'turfa' ? 0.76 : kind === 'palha' ? 1.05 : kind === 'plano' ? 0 : 0.8;
    const rise = round ? Math.min(3.2, (R[2] - R[0]) * 0.75) : kind === 'alpendre' ? 0.6 : Math.min(4.6, span * pitch * 0.82);
    P.roof = { kind, along, h: Math.round(rise * 100) / 100, over: kind === 'plano' ? 0 : 0.42 };
    P.roofGeo = { kind, along, eave: S.eave, rise, R };
    // ---- the ground storey and its rooms ----
    const I = round ? [L / 2 - S.rad + t, L / 2 - S.rad + t, L / 2 + S.rad - t, L / 2 + S.rad - t] : P.inner();
    const iw = I[2] - I[0], id = I[3] - I[1];
    P.level(0, y0, h0, sunk ? 'semienterrado' : raised ? 'elevado' : 'piso', I); P.entryLv = 0;
    const rooms = {};
    if (round) { const q = (S.rad - t) * 0.7071; rooms.lar = P.room(0, 'lar', [L / 2 - q, L / 2 - q, L / 2 + q, L / 2 + q]); }
    else rooms.lar = P.room(0, 'lar', I);
    const ti = Math.max(0.1, Math.min(0.18, t * 0.6));
    if (H === 'setores') {
      // (a partition: the fire and the door at the front, the beds behind — or the two side by side)
      if (id >= 2.8 && (iw < id + 0.4 || P.chance(0.65))) { const at = I[1] + id * P.rr(0.42, 0.5); const [back, front] = P.split(rooms.lar, 'v', at, ti, h0); rooms.leitos = back; rooms.lar = front; }
      else { const at = I[0] + iw * P.rr(0.44, 0.56); const [a, b2] = P.split(rooms.lar, 'u', at, ti, h0); if (P.chance(0.5)) { rooms.leitos = a; rooms.lar = b2; } else { rooms.leitos = b2; rooms.lar = a; } }
      P.rooms[rooms.leitos].fn = 'leitos';
    }
    if (H === 'produtiva') { const at = I[1] + id * P.rr(0.46, 0.56); const [back, front] = P.split(rooms.lar, 'v', at, ti, h0); rooms.oficina = front; rooms.lar = back; P.rooms[front].fn = 'oficina'; }
    // ---- the outside walls ----
    if (!round) { const c = t / 2; P.outer = P.walls4(0, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h0, 1, 'parede'); } else P.outer = null;
    // ---- the annex: a lean-to against one side, its own thin walls, a door into it from the house ----
    if (H === 'anexo') {
      const ar = side === 'esquerda' ? [m, sh[1] + P.rr(0, 0.5), sh[0], sh[3]] : [sh[2], sh[1] + P.rr(0, 0.5), L - m, sh[3]];
      const at2 = 0.08; const ah = Math.max(1.85, h0 - 0.3); P.annex.push({ r: ar, h: ah, fn: 'anexo', lv: 0, roof: 'alpendre' });
      const ai = [ar[0] + (side === 'esquerda' ? at2 : 0), ar[1] + at2, ar[2] - (side === 'direita' ? at2 : 0), ar[3] - at2];
      rooms.anexo = P.room(0, 'anexo', ai);
      const c = at2 / 2; P.walls4(0, [ar[0] + c, ar[1] + c, ar[2] - c, ar[3] - c], at2, ah, 1, 'parede', side === 'esquerda' ? { direita: 1 } : { esquerda: 1 });
      const wid = side === 'esquerda' ? P.outer.esquerda : P.outer.direita; const lenW = P.wlen(wid);
      const vm = Math.max(ai[1] + 0.55, Math.min(ai[3] - 0.55, P.chance(0.5) ? (ai[1] + ai[3]) / 2 : ai[3] - 0.6));
      P.door(wid, Math.max(0.55, Math.min(lenW - 0.55, P.atOf(wid, [side === 'esquerda' ? sh[0] : sh[2], vm]))), 0.8, Math.min(1.85, ah - 0.1), rooms.lar, rooms.anexo, 0, 'porta');
    }
    // ---- the entrance: the front wall, before an open tile of the street ----
    entrance(P, rooms, round, h0);
    // ---- the partitions' openings ----
    for (const w of P.walls) if (w.kind === 'divisoria' && !P.holes.some(h => h.wall === w.id)) {
      const len = P.wlen(w.id); const a = P.rooms.find(q => q.lv === w.lv && touches(q.r, w)); const b2 = P.rooms.find(q => q.lv === w.lv && q !== a && touches(q.r, w)); if (!a || !b2) continue;
      const dw = 0.85; const at = Math.max(dw / 2 + 0.3, Math.min(len - dw / 2 - 0.3, len * P.pick([0.28, 0.5, 0.72])));
      P.door(w.id, at, dw, Math.min(1.95, h0 - 0.15), a.id, b2.id, 0, P.chance(0.5) ? 'vao' : 'porta');
    }
    // ---- the storeys under and over the ground ----
    if (cellar) porao(P, rooms, I);
    if (upV === 'jirau') loft(P, rooms, I);
    if (upV === 'terraco' || upV === 'quarto') terrace(P, rooms, I, upV === 'quarto');
    if (V === 'esteios') { const sh2 = P.shell.r; const e = P.entrance; const w = 0.95; P.stair('degraus', -1, 0, [e.u - w / 2, sh2[3] + 0.02, e.u + w / 2, sh2[3] + porch], 0, -1); }
    if (V === 'funda') { const e = P.entrance; const w = Math.max(0.9, e.w + 0.05); const v1 = I[3]; const r = [e.u - w / 2, v1 - 0.8, e.u + w / 2, v1]; P.stair('degraus', -1, 0, r, 0, -1); P.zones.push({ lv: 0, r: [r[0] - 0.1, r[1] - 0.25, r[2] + 0.1, r[3]] }); }
    windows(P, round);
    furnishHome(P, rooms, need);
  }
  const touches = (r, w) => { const vert = Math.abs(w.a[0] - w.b[0]) < 1e-6; const e = w.t / 2 + 0.02; if (vert) { const x = w.a[0]; return (Math.abs(r[0] - x) <= e || Math.abs(r[2] - x) <= e) && r[1] < Math.max(w.a[1], w.b[1]) && r[3] > Math.min(w.a[1], w.b[1]); } const z = w.a[1]; return (Math.abs(r[1] - z) <= e || Math.abs(r[3] - z) <= e) && r[0] < Math.max(w.a[0], w.b[0]) && r[2] > Math.min(w.a[0], w.b[0]); };
  In.touches = touches;
  const inR = (a, R) => a[0] >= R[0] - 1e-6 && a[1] >= R[1] - 1e-6 && a[2] <= R[2] + 1e-6 && a[3] <= R[3] + 1e-6;
  const roomHolding = (P, lv, r) => P.rooms.find(m => m.lv === lv && inR(r, m.r));
  const ptInR = (p, R, e) => p[0] >= R[0] + (e || 0) && p[0] <= R[2] - (e || 0) && p[1] >= R[1] + (e || 0) && p[1] <= R[3] - (e || 0);

  // the entrance: in the front wall, before a tile of the street one can stand on (the record's open tiles along the side)
  function entrance(P, rooms, round, h0) {
    const L = P.L, rec = P.rec; const dw = rec.t === 'barraco' ? 0.8 : P.rr(0.85, 1.0); const dh = Math.min(2.05, h0 - 0.15);
    const tiles = []; for (let k = 0; k < P.b.w; k++) if (!rec.o || (rec.o >> k) & 1) tiles.push(k);
    const k = tiles.length ? tiles[Math.floor(P.rnd() * tiles.length)] : 0;
    const room = P.rooms[rooms.oficina !== undefined ? rooms.oficina : rooms.lar];
    if (round) {
      // (the ring has no straight wall: the door is a gap in it, toward the front)
      const S = P.shell; const v = L / 2 + S.rad - S.t / 2; const w = P.wall(0, [L / 2 + 0.6, v], [L / 2 - 0.6, v], S.t, h0, 1, 'anel');
      const d = P.door(w, 0.6, dw, dh, room.id, 'rua', 1); P.entrance = { door: d, u: L / 2, v: L / 2 + S.rad, w: dw, lv: 0 }; return;
    }
    const lo = Math.max(k * 4 + 0.6, room.r[0] + dw / 2 + 0.15), hi = Math.min(k * 4 + 3.4, room.r[2] - dw / 2 - 0.15);
    const u = lo <= hi ? P.rr(lo, hi) : (room.r[0] + room.r[2]) / 2;
    const wid = P.outer.frente; const d = P.door(wid, P.atOf(wid, [u, P.walls[wid].a[1]]), dw, dh, room.id, 'rua', 1);
    P.entrance = { door: d, u, v: P.shell.r[3], w: dw, lv: 0 };
  }
  // the loft under the roof: over the back of the house, the fire left under the open front; a ladder up to it — in front of
  // its edge if there is room, else through a hatch in its floor
  function loft(P, rooms, I) {
    const S = P.shell, R0 = P.roofGeo; const yL = S.eave - 0.25; const id = I[3] - I[1]; const lw = 0.6;
    const left = P.chance(0.5); const u0 = left ? I[0] + 0.06 : I[2] - 0.06 - lw;
    let depth = Math.min(id - 0.6, Math.max(2.3, id * P.rr(0.7, 0.8))); let front = false;
    if (id - depth >= 1.5 && P.chance(0.5)) front = true;
    const area = [I[0], I[1], I[2], I[1] + depth];
    P.level(1, yL, 1.2, 'jirau', area);
    rooms.jirau = P.room(1, 'leitos', area);
    P.headAt = (lv, u, v) => { const l = P.lvl(lv); if (!l || l.kind !== 'jirau') return 9; return In.roofY(R0, u, v) - 0.25 - l.y; };
    P.under = lv => (lv === 0 ? [area] : []);
    P.headOK = (lv, r, kind) => {
      const l = P.lvl(lv); if (!l || l.kind !== 'jirau') return true; const D = IT[kind];
      const hs = [P.headAt(lv, r[0], r[1]), P.headAt(lv, r[2], r[1]), P.headAt(lv, r[0], r[3]), P.headAt(lv, r[2], r[3])];
      if (D.low) return Math.max(...hs) >= 0.9 && Math.min(...hs) >= 0.3;
      return Math.min(...hs) >= (D.h || 0.5) + 0.15;
    };
    const rail = P.wall(1, [I[2], area[3]], [I[0], area[3]], 0.06, 0.9, 0, 'guarda-corpo');
    if (front) {
      const fr = [u0, area[3] + 0.02, u0 + lw, area[3] + 0.95]; P.stair('escada-de-mao', 0, 1, fr, 0, -1);
      P.hole(rail, P.atOf(rail, [u0 + lw / 2, area[3]]), lw + 0.1, 0.9, 0, 'vao');
    } else {
      const hz = [u0, area[3] - 1.0, u0 + lw, area[3] - 0.02]; P.stair('escada-de-mao', 0, 1, hz, 0, -1, hz);
    }
    // (the ladder stands in one room below: or the family does not go here)
    const st = P.stairs[P.stairs.length - 1]; if (!roomHolding(P, 0, st.r)) P.errs.push('a escada do jirau cai sobre uma divisória');
  }
  // the cellar: under a back corner of the house, a hatch in the floor and a ladder down; the jars and the barrels go there
  function porao(P, rooms, I) {
    const iw = I[2] - I[0], id = I[3] - I[1]; const cw = Math.min(iw - 0.3, P.rr(1.7, 2.2)), cd = Math.min(id - 0.6, P.rr(2.0, 2.4));
    const left = P.chance(0.5); const r = left ? [I[0], I[1], I[0] + cw, I[1] + cd] : [I[2] - cw, I[1], I[2], I[1] + cd];
    P.level(-1, -2.1, 1.9, 'porao', r);
    rooms.despensa = P.room(-1, 'despensa', r);
    P.walls4(-1, [r[0] - 0.12, r[1] - 0.12, r[2] + 0.12, r[3] + 0.12], 0.24, 1.9, 1, 'parede');
    const lw = 0.6; const u0 = left ? r[2] - lw - 0.1 : r[0] + 0.1; const hz = [u0, r[1] + 0.85, u0 + lw, r[1] + 1.75];
    P.stair('escada-de-mao', -1, 0, hz, 0, -1, hz);
    const st = P.stairs[P.stairs.length - 1]; if (!ptInR(st.a, r, 0.2) || !roomHolding(P, 0, st.hole)) P.errs.push('o alçapão do porão não cabe');
  }
  // the roof made a terrace: the parapet round it, a ladder up through a hatch; maybe a room on it, roofed with reed
  function terrace(P, rooms, I, withRoom) {
    const S = P.shell; if (S.kind === 'round') { P.errs.push('terraço numa cabana redonda'); return; }
    const sh = S.r; const e = 0.14; const T = [sh[0] + e, sh[1] + e, sh[2] - e, sh[3] - e];
    P.level(1, S.eave + 0.25, 2.2, 'terraco', T);
    P.walls4(1, [sh[0] + 0.07, sh[1] + 0.07, sh[2] - 0.07, sh[3] - 0.07], 0.14, 0.9, 1, 'parapeito');
    const lw = 0.6, hd = 1.0; const left = P.chance(0.5); const u0 = left ? I[0] + 0.06 : I[2] - 0.06 - lw;
    const hz = [u0, I[1] + 0.8, u0 + lw, I[1] + 0.8 + hd];
    if (!withRoom) { rooms.terraco = P.room(1, 'terraco', T, 1); P.stair('escada-de-mao', 0, 1, hz, 0, -1, hz); if (!roomHolding(P, 0, hz)) P.errs.push('o alçapão do terraço cai sobre uma divisória'); return; }
    // (a room on the roof, its low walls and a roof of reed and palm: where the household sleeps in the cold months; the
    // hatch comes up on the terrace beside it)
    const rw = Math.min(T[2] - T[0] - 1.0, P.rr(1.85, 2.25)), rd = Math.min(T[3] - T[1] - 1.0, P.rr(2.0, 2.2));
    const ru0 = left ? T[2] - rw : T[0]; const rr = [ru0, T[1], ru0 + rw, T[1] + rd];
    const open = left ? [T[0], T[1], ru0, T[3]] : [ru0 + rw, T[1], T[2], T[3]];
    rooms.terraco = P.room(1, 'terraco', open, 1);
    rooms.terracoFrente = P.room(1, 'terraco', [rr[0], rr[3], rr[2], T[3]], 1);
    const c = 0.1; const ri = [rr[0] + c, rr[1] + c, rr[2] - c, rr[3] - c]; rooms.quarto = P.room(1, 'quarto', ri);
    const w4 = P.walls4(1, [rr[0] + c / 2, rr[1] + c / 2, rr[2] - c / 2, rr[3] - c / 2], c, 1.95, 0, 'parede');
    P.door(w4.frente, P.wlen(w4.frente) * P.rr(0.35, 0.65), 0.8, 1.8, rooms.quarto, rooms.terracoFrente, 0, 'porta');
    P.stair('escada-de-mao', 0, 1, hz, 0, -1, hz);
    if (!roomHolding(P, 0, hz)) P.errs.push('o alçapão do terraço cai sobre uma divisória');
    P.roof = Object.assign({}, P.roof, { room: { r: rr, h: 2.05, kind: 'junco' } });
  }
  // windows: by how much the people opens to the street; never in a party wall, never into the annex
  const WORLD = { S: { frente: 4, fundo: 1, direita: 2, esquerda: 8 }, N: { frente: 1, fundo: 4, direita: 8, esquerda: 2 }, E: { frente: 2, fundo: 8, direita: 1, esquerda: 4 }, W: { frente: 8, fundo: 2, direita: 4, esquerda: 1 } };
  function windows(P, round) {
    if (round || !P.outer) return; const rec = P.rec; const tr = P.tr;
    for (const k of ['frente', 'fundo', 'esquerda', 'direita']) {
      const id = P.outer[k]; if (id === undefined || (rec.pw & WORLD[rec.s][k])) continue;
      if (P.annex.length && ((k === 'esquerda' && P.shell.r[0] > 0.6) || (k === 'direita' && P.shell.r[2] < P.L - 0.6))) continue;
      const len = P.wlen(id); const n = Math.max(0, Math.floor(len / 2.4 + tr.win * (k === 'frente' ? 1.2 : 0.8) - 0.3 + P.rnd() * 0.6));
      for (let q = 0; q < n; q++) {
        const at = len * (q + 0.5) / n + P.rr(-0.2, 0.2); const ww = tr.win < 0.35 ? 0.45 : P.rr(0.55, 0.8); const sill = tr.win < 0.35 ? 1.55 : P.rr(0.85, 1.05);
        if (P.holes.some(h => h.wall === id && Math.abs(h.at - at) < (h.w + ww) / 2 + 0.3)) continue;
        if (at < ww / 2 + 0.3 || at > len - ww / 2 - 0.3) continue;
        P.hole(id, at, ww, Math.max(0.3, Math.min(1.0, P.walls[id].h - sill - 0.25)), sill, 'janela');
      }
    }
  }

  // ------------------------------ the furniture of a home ------------------------------
  function furnishHome(P, rooms, need) {
    const tr = P.tr, rec = P.rec; const rich = rec.w >= 2; const shack = rec.t === 'barraco';
    const lar = rooms.lar; const hot = rec.cl === 'q';
    // the fire: the open hearth in the middle where the people keeps one (never under a loft), the wall hearth or the oven
    let fire = shack ? 'braseiro' : tr.fire;
    if (fire === 'lar' && !P.place('lar', 0, lar, { sides: ['centro'] }) && !P.place('lar', 0, lar, { sides: ['livre'] })) fire = 'fogao';
    if (fire !== 'lar' && !P.place(fire, 0, lar, { sides: ['fundo', 'esquerda', 'direita'] }) && !P.place('braseiro', 0, lar, { sides: ['fundo', 'esquerda', 'direita', 'frente'] })) P.errs.push('sem lugar para o fogo');
    // the beds: the couple's first, then the household's, room by room — the sleeping rooms, the roof room, the loft, the hall,
    // the terrace in the hot lands (where one sleeps on the roof)
    const order = [rooms.leitos, rooms.quarto, rooms.jirau, rooms.lar, hot ? rooms.terraco : undefined, hot ? rooms.terracoFrente : undefined].filter(x => x !== undefined);
    const kinds = rich ? tr.rich : tr.bed;
    let couple = !shack && tr.couple && (rich || rec.w >= 1 || P.chance(0.6)) ? tr.couple : null;
    for (const id of order) {
      if (P.places() >= need) break; const m = P.rooms[id]; const lv = m.lv; const loftLv = P.lvl(lv).kind === 'jirau';
      if (couple && !loftLv && P.place(couple, lv, id, { sides: ['fundo', 'esquerda', 'direita'] })) couple = null;
      for (const k of kinds) {
        if (P.places() >= need) break;
        if (k === 'banco-cama') { for (const s of P.shuffle(['esquerda', 'direita', 'fundo', 'frente'])) { if (P.places() >= need) break; P.bench(lv, id, s, { min: 2 }); } continue; }
        let guard = 0; while (P.places() < need && guard++ < 12) if (!P.place(k, lv, id, { sides: loftLv ? ['fundo'] : ['fundo', 'esquerda', 'direita', 'frente'] })) break;
      }
    }
    if (P.places() < need) for (const id of order) { if (P.places() >= need) break; const m = P.rooms[id]; const loftLv = P.lvl(m.lv).kind === 'jirau'; let guard = 0; while (P.places() < need && guard++ < 12) if (!P.place('esteira', m.lv, id, { sides: loftLv ? ['fundo'] : ['fundo', 'esquerda', 'direita', 'frente'] })) break; }
    // what keeps the household's things: the pantry (in the cellar, the annex, the hall) and the chest (coins and goods)
    const keepAt = [rooms.despensa, rooms.anexo, rooms.lar, rooms.leitos].filter(x => x !== undefined);
    const chest = 'arca', pantry = tr.keep.find(k => k !== 'arca') || 'cesto';
    let gotP = false; for (const id of keepAt) { const lv = P.rooms[id].lv; if (P.place(pantry, lv, id) || P.place('cesto', lv, id)) { gotP = true; break; } }
    if (!gotP) P.errs.push('sem lugar para a despensa');
    if (rooms.despensa !== undefined) P.place('jarros', -1, rooms.despensa);
    let gotC = false; for (const id of [rooms.leitos, rooms.quarto, rooms.lar, rooms.jirau, rooms.anexo].filter(x => x !== undefined)) { if (P.place(chest, P.rooms[id].lv, id)) { gotC = true; break; } }
    if (!gotC && !shack) P.errs.push('sem lugar para a arca');
    // the work front: the bench (or the counter) facing the door
    if (rooms.oficina !== undefined && !P.place('bancada', 0, rooms.oficina, { sides: ['fundo', 'esquerda', 'direita'] }) && !P.place('balcao', 0, rooms.oficina, { sides: ['livre'] })) P.errs.push('sem lugar para a bancada');
    // the table and its bench, if there is room (a poor hall goes without); the wood in the annex of a house with an open fire
    if (!shack && P.place(tr.eat, 0, lar, { sides: ['livre'] }) && tr.eat === 'mesa') P.place('banco', 0, lar, { sides: ['esquerda', 'direita', 'fundo'] });
    if (!shack && tr.fire === 'lar' && rooms.anexo !== undefined) P.place('lenha', 0, rooms.anexo);
  }
})(window.G);
