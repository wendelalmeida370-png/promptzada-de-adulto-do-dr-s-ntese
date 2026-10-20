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
    nordico: { mat: 'tabua', t: 0.14, hutT: 0.12, roof: 'turfa', h0: 2.2, h1: 2.3, bed: ['banco-cama'], rich: ['banco-cama'], couple: 'cama-casal', coupleRich: 'cama-casal', fire: 'lar', eat: 'mesa', keep: ['arca', 'cesto'], win: 0.3, sunk: 1, long: 1, taste: { 'integrado.terreo': 3, 'integrado.funda': 1.6, 'anexo.terreo': 2.2, 'setores.terreo': 1.2, 'integrado.jirau': 1.4 } },
    classico: { mat: 'taipa', t: 0.2, hutT: 0.15, roof: 'duas-aguas', hutRoof: 'palha', h0: 2.4, h1: 2.4, bed: ['esteira'], rich: ['cama'], couple: 'esteira-casal', coupleRich: 'cama-casal', fire: 'lar', eat: 'mesa', keep: ['arca', 'cesto'], win: 0.5, round: 1, sunk: 1, cellar: 1, taste: { 'redonda.terreo': 3, 'integrado.jirau': 2 } },
    grego: { mat: 'adobe-caiado', t: 0.3, hutT: 0.18, roof: 'duas-aguas', hutRoof: 'palha', h0: 2.6, h1: 2.5, bed: ['esteira', 'cama'], rich: ['cama'], couple: 'esteira-casal', coupleRich: 'cama-casal', fire: 'fogao', hutFire: 'fogareiro', eat: 'mesa', keep: ['jarros', 'arca'], win: 0.6, round: 1, cellar: 1, taste: { 'setores.jirau': 1.8, 'redonda.terreo': 1.5 } },
    romano: { mat: 'reboco', t: 0.28, hutT: 0.15, roof: 'quatro-aguas', hutRoof: 'palha', flatTall: 1, h0: 2.8, h1: 2.6, bed: ['esteira', 'cama'], rich: ['cama'], couple: 'esteira-casal', coupleRich: 'cama-casal', fire: 'fogao', hutFire: 'fogareiro', eat: 'mesa', keep: ['jarros', 'arca'], win: 0.5, round: 1, cellar: 1, taberna: 1, taste: { 'produtiva.jirau': 2.2 } },
    egipcio: { mat: 'adobe', t: 0.34, hutT: 0.25, roof: 'plano', h0: 2.6, h1: 2.5, bed: ['esteira', 'cama'], rich: ['cama'], couple: 'esteira-casal', coupleRich: 'cama', fire: 'forno', hutFire: 'fogareiro', eat: 'mesa-baixa', keep: ['jarros', 'cesto'], win: 0.3, cellar: 1, taste: { 'integrado.quarto': 3, 'integrado.terraco': 2, 'produtiva.quarto': 1.4 } },
    asteca: { mat: 'adobe-estuque', t: 0.3, hutT: 0.15, roof: 'plano', hutRoof: 'palha', h0: 2.5, h1: 2.4, bed: ['esteira'], rich: ['esteira', 'cama'], couple: 'esteira-casal', coupleRich: 'esteira-casal', fire: 'lar', eat: 'mesa-baixa', keep: ['jarros', 'cesto'], win: 0.4, round: 1, taste: { 'integrado.terraco': 2.5, 'redonda.terreo': 1.4, 'setores.quarto': 1.6 } },
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
    produtiva: { name: 'Frente de trabalho', can: rec => (rec.t === 'hut' || rec.t === 'barraco' ? 'a cabana não tem frente de trabalho' : rec.d < 1 && rec.w < 1 ? 'longe do movimento da cidade' : null) },
  };
  const flatOK = (rec, tr) => (pitched(rec, tr) ? 'telhado inclinado: o teto não se usa' : rec.cl === 'f' ? 'no frio não se vive no teto' : null);
  const cellarOK = (rec, tr) => (!tr.cellar ? 'este povo não abre porão' : wet(rec) ? 'chão encharcado: não há porão' : null);
  // the one-storey ways (the barraco, the hut, the house)
  const VS = {
    terreo: { name: '', can: () => null },
    jirau: { name: 'com jirau', can: (rec, tr) => (!pitched(rec, tr) ? 'telhado plano: não há volume para um jirau' : null) },
    terraco: { name: 'com terraço', can: flatOK },
    quarto: { name: 'com quarto no teto', can: flatOK },
    funda: { name: 'semienterrada', can: (rec, tr) => (!tr.sunk ? 'este povo não cava o piso' : wet(rec) ? 'chão encharcado: não se cava' : null) },
    esteios: { name: 'sobre esteios', can: rec => (!wet(rec) ? 'só onde a terra alaga ou é encharcada' : null) },
    'porao-jirau': { name: 'com porão e jirau', can: (rec, tr) => cellarOK(rec, tr) || (!pitched(rec, tr) ? 'telhado plano: não há volume para um jirau' : null) },
    'porao-quarto': { name: 'com porão e quarto no teto', can: (rec, tr) => cellarOK(rec, tr) || flatOK(rec, tr) },
  };
  // the storeyed ways: [porao-]andar[N][q][-jirau|-terraco|-quarto] — N storeys in all (two when not said), two rooms on
  // each storey above (q), the roof's loft, its terrace or a room on it over the last one, a cellar under the ground
  const parseV = v => { const m = /^(porao-)?andar(\d)?(q)?(?:-(jirau|terraco|quarto))?$/.exec(v); return m ? { cellar: !!m[1], n: m[2] ? +m[2] : 2, q: !!m[3], top: m[4] || null } : null; };
  In.parseV = parseV;
  const TOPN = { jirau: 'sótão', terraco: 'terraço', quarto: 'quarto no teto' };
  const NUM = { 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco' };
  for (const v of ['andar', 'andarq', 'andar-jirau', 'andar-terraco', 'andar-quarto', 'porao-andar',
    'andar3', 'andar3q', 'andar3-jirau', 'andar3-terraco', 'andar3-quarto', 'porao-andar3',
    'andar4', 'andar4q', 'andar4-jirau', 'andar4-terraco', 'andar5', 'andar5q', 'andar5-jirau', 'porao-andar4']) {
    const o = parseV(v);
    const name = (o.n === 2 ? (o.q ? 'com andar de dois quartos' : 'com andar de cima') : `de ${NUM[o.n]} pavimentos${o.q ? ', dois cômodos em cada' : ''}`) + (o.top ? ' e ' + TOPN[o.top] : '') + (o.cellar ? ', sobre porão' : '');
    VS[v] = { name, can: (rec, tr) => (o.cellar && cellarOK(rec, tr)) || (o.top === 'jirau' && !pitched(rec, tr) ? 'telhado plano: não há sótão' : null) || ((o.top === 'terraco' || o.top === 'quarto') && flatOK(rec, tr)) || null };
  }
  const famsOf = (hs, vs) => { const out = []; for (const h of hs) for (const v of vs) { if (h === 'redonda' && v !== 'terreo' && v !== 'funda' && v !== 'esteios') continue; if (h === 'produtiva' && (v === 'funda' || v === 'esteios')) continue; out.push(h + '.' + v); } return out; };
  const ONE = ['terreo', 'jirau', 'terraco', 'quarto', 'funda', 'esteios', 'porao-jirau', 'porao-quarto'];
  const LISTS = {
    barraco: ['integrado.terreo', 'integrado.esteios'],
    hut: famsOf(['integrado', 'redonda', 'setores', 'anexo'], ONE),
    house: famsOf(['integrado', 'setores', 'anexo', 'produtiva'], ONE.concat(['andar', 'andarq', 'andar-jirau', 'andar-terraco', 'andar-quarto', 'porao-andar'])),
    sobrado: famsOf(['integrado', 'setores', 'anexo', 'produtiva'], ['andar-jirau', 'andar-terraco', 'andar-quarto', 'andar3', 'andar3q', 'andar3-jirau', 'andar3-terraco', 'andar3-quarto', 'porao-andar3']),
    insula: famsOf(['integrado', 'setores', 'produtiva'], ['andar4', 'andar4q', 'andar4-jirau', 'andar4-terraco', 'andar5', 'andar5q', 'andar5-jirau', 'porao-andar4']),
  };
  const seenF = new Set();
  for (const t in LISTS) for (const id of LISTS[t]) {
    if (seenF.has(id)) continue; seenF.add(id); const [h, v] = id.split('.');
    In.addFamilies([{ id, H: h, V: v, name: (HS[h].name + (VS[v].name ? ' ' + VS[v].name : '')).replace(/^Salão$/, 'Salão único'), can: (rec, T, tr) => (rec.t === 'barraco' && h !== 'integrado' ? 'um barraco é um cômodo só' : HS[h].can(rec, tr) || VS[v].can(rec, tr)), build: P => home(P) }]);
  }
  In.addTypes({
    barraco: { use: 'casa', fams: LISTS.barraco }, hut: { use: 'casa', fams: LISTS.hut }, house: { use: 'casa', fams: LISTS.house },
    sobrado: { use: 'casa', fams: LISTS.sobrado }, insula: { use: 'casa', fams: LISTS.insula },
  });

  // ------------------------------ the recipe of a home ------------------------------
  function home(P) {
    const F = P.fam, rec = P.rec, tr = P.tr, L = P.L; const def = G.BDEF[rec.t] || {}; const need = def.housing || 0;
    const hut = rec.t === 'hut', shack = rec.t === 'barraco';
    const H = F.H, V = F.V; const roofK = roofOf(rec, tr); const round = H === 'redonda';
    const SV = parseV(V); // (a storeyed way: its storeys, its rooms, its top; else the one-storey ways)
    const cellar = SV ? SV.cellar : V.startsWith('porao-'); const upV = SV ? '' : cellar ? V.slice(6) : V;
    const floors = SV ? SV.n : 1; const topK = SV ? SV.top : upV;
    // ---- the shell: as big as the lot lets it (the eaves inside the lot); the north's long and low ----
    const t = shack ? 0.06 : hut ? tr.hutT : tr.t; const mat = shack ? 'tabua' : hut && tr.hutT < tr.t ? (tr.mat === 'tabua' ? 'tabua' : 'pau-a-pique') : tr.mat;
    const m = shack ? P.rr(0.28, 0.42) : hut ? P.rr(0.08, 0.16) : P.rr(0.1, 0.2);
    const sh = [m, m, L - m, L - m];
    if (tr.long && !shack && !round) sh[1] += P.rr(0.1, 0.3); // (the northern house, longer than deep)
    if (shack) sh[1] += P.rr(0.1, 0.35); // (the shack, of boards and leftovers, keeps back from the street a little)
    let side = null;
    if (H === 'anexo') { const aw = P.rr(0.95, 1.2); side = P.chance(0.5) ? 'esquerda' : 'direita'; if (side === 'esquerda') sh[0] += aw; else sh[2] -= aw; }
    let porch = 0; if (V === 'esteios') { porch = P.rr(1.15, 1.35); sh[3] -= porch; }
    const two = floors >= 2; const h1 = tr.h1 || 2.3;
    const sunk = V === 'funda' ? -P.rr(0.6, 0.8) : 0, raised = V === 'esteios' ? P.rr(1.3, 1.55) : 0; const y0 = sunk || raised;
    // (a sunken floor: its walls stand 2 m over the ground outside, for a way in one walks through from the street)
    const h0 = Math.max(shack ? 2.1 : tr.h0, sunk ? 2.0 - sunk : 0);
    if (round) { const rad = (L - 2 * m - porch) / 2; P.shell = { kind: 'round', cu: L / 2, cv: m + rad, rad, t, mat, base: sunk ? 'semienterrado' : raised ? 'esteios' : 'pedra', floors: 1, eave: y0 + h0 }; }
    else P.shell = { kind: 'rect', r: sh, t, mat, base: raised ? 'esteios' : sunk ? 'semienterrado' : 'pedra', floors, eave: y0 + h0 + (floors - 1) * (0.2 + h1) };
    const S = P.shell;
    // the roof: along the front for most, now and then the gable to the street; the round hut's cone
    const along = round ? null : P.chance(tr.long ? 0.85 : 0.72) ? 'u' : 'v';
    const R = round ? [S.cu - S.rad, S.cv - S.rad, S.cu + S.rad, S.cv + S.rad] : sh;
    const span = along === 'u' ? R[3] - R[1] : R[2] - R[0];
    const kind = round ? 'palha-conica' : roofK;
    const pitch = kind === 'turfa' ? 0.76 : kind === 'palha' ? 1.05 : kind === 'plano' ? 0 : 0.8;
    const rise = round ? Math.min(3.2, (R[2] - R[0]) * 0.75) : kind === 'alpendre' ? 0.6 : Math.min(4.6, span * pitch * 0.82);
    P.roof = { kind, along, h: Math.round(rise * 100) / 100, over: kind === 'plano' ? 0 : 0.42 };
    P.roofGeo = { kind, along, eave: S.eave, rise, R };
    // ---- the ground storey and its rooms ----
    const I = round ? [S.cu - S.rad + t, S.cv - S.rad + t, S.cu + S.rad - t, S.cv + S.rad - t] : P.inner();
    const iw = I[2] - I[0], id = I[3] - I[1];
    P.level(0, y0, h0, sunk ? 'semienterrado' : raised ? 'elevado' : 'piso', I); P.entryLv = 0;
    const rooms = {};
    if (round) { const ri = S.rad - t; rooms.lar = P.room(0, 'lar', [S.cu - ri, S.cv - ri, S.cu + ri, S.cv + ri], 0, [S.cu, S.cv, ri]); }
    else rooms.lar = P.room(0, 'lar', I);
    const ti = Math.max(0.1, Math.min(0.18, t * 0.6));
    // (the depth a loft over the back takes: the front keeps 1.35 m and more for the fire, the door and the ladder)
    const loftD = () => Math.min(id - 1.35, Math.max(1.6, id - P.rr(1.4, 1.6)));
    if (H === 'setores') {
      // (a partition: the fire and the door at the front, the beds behind — under the loft, when there is one —, or the two
      // side by side)
      const bedD = P.rr(2.25, 2.35); // (a bedroom across the back: a mat, the step at its foot)
      if (upV === 'jirau' || (id >= 2.8 && (iw < id + 0.4 || P.chance(0.65)))) { const at = I[1] + (upV === 'jirau' ? loftD() + ti / 2 : id - bedD - ti >= 0.95 && P.chance(0.7) ? bedD + ti / 2 : id * P.rr(0.42, 0.5)); const [back, front] = P.split(rooms.lar, 'v', at, ti, h0); rooms.leitos = back; rooms.lar = front; rooms.backV = back; }
      else { const at = I[0] + iw * P.rr(0.44, 0.56); const [a, b2] = P.split(rooms.lar, 'u', at, ti, h0); if (P.chance(0.5)) { rooms.leitos = a; rooms.lar = b2; } else { rooms.leitos = b2; rooms.lar = a; } }
      P.rooms[rooms.leitos].fn = 'leitos';
    }
    if (H === 'produtiva') { const at = I[3] - P.rr(1.45, 1.7); const [back, front] = P.split(rooms.lar, 'v', at, ti, h0); rooms.oficina = front; rooms.lar = back; P.rooms[front].fn = 'oficina'; rooms.backV = back; }
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
    entrance(P, rooms, round, h0, sunk ? -sunk : 0);
    // ---- the partitions' openings ----
    for (const w of P.walls) if (w.kind === 'divisoria' && !P.holes.some(h => h.wall === w.id)) {
      const len = P.wlen(w.id); const a = P.rooms.find(q => q.lv === w.lv && touches(q.r, w)); const b2 = P.rooms.find(q => q.lv === w.lv && q !== a && touches(q.r, w)); if (!a || !b2) continue;
      const dw = 0.85; const at = Math.max(dw / 2 + 0.3, Math.min(len - dw / 2 - 0.3, len * P.pick([0.28, 0.5, 0.72])));
      P.door(w.id, at, dw, Math.min(1.95, h0 - 0.15), a.id, b2.id, 0, P.chance(0.5) ? 'vao' : 'porta');
    }
    // ---- the storeys under and over the ground ----
    let top = I, lvT = 0; // (the storey under the roof: the ground one, or the one above it)
    if (two) { top = upper(P, rooms, I, y0 + h0 + 0.2, h1, SV.q, floors); lvT = floors - 1; }
    if (cellar) porao(P, rooms, I);
    if (topK === 'jirau') loft(P, rooms, top, lvT);
    if (topK === 'terraco' || topK === 'quarto') terrace(P, rooms, top, topK === 'quarto', lvT);
    if (V === 'esteios') { const fv = round ? P.shell.cv + P.shell.rad : P.shell.r[3]; const e = P.entrance; const w = 0.95; P.stair('degraus', -1, 0, [e.u - w / 2, fv + 0.02, e.u + w / 2, fv + porch], 0, -1); }
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
  // (pit: how deep the floor is sunk — the threshold stays at the ground outside, the steps go down inside)
  function entrance(P, rooms, round, h0, pit) {
    const L = P.L, rec = P.rec; const dw = rec.t === 'barraco' ? 0.8 : P.rr(0.85, 1.0); const dh = Math.min(2.05, h0 - (pit || 0) - 0.15);
    const tiles = []; for (let k = 0; k < P.b.w; k++) if (!rec.o || (rec.o >> k) & 1) tiles.push(k);
    const k = tiles.length ? tiles[Math.floor(P.rnd() * tiles.length)] : 0;
    const room = P.rooms[rooms.oficina !== undefined ? rooms.oficina : rooms.lar];
    if (round) {
      // (the ring has no straight wall: the door is a gap in it, toward the front)
      const S = P.shell; const v = S.cv + S.rad - S.t / 2; const w = P.wall(0, [S.cu + 0.6, v], [S.cu - 0.6, v], S.t, h0, 1, 'anel');
      const d = P.door(w, 0.6, dw, dh, room.id, 'rua', 1, 'porta', pit || 0); P.entrance = { door: d, u: S.cu, v: S.cv + S.rad, w: dw, lv: 0 }; return;
    }
    const lo = Math.max(k * 4 + 0.6, room.r[0] + dw / 2 + 0.15), hi = Math.min(k * 4 + 3.4, room.r[2] - dw / 2 - 0.15);
    const u = lo <= hi ? P.rr(lo, hi) : (room.r[0] + room.r[2]) / 2;
    const wid = P.outer.frente; const d = P.door(wid, P.atOf(wid, [u, P.walls[wid].a[1]]), dw, dh, room.id, 'rua', 1, 'porta', pit || 0);
    P.entrance = { door: d, u, v: P.shell.r[3], w: dw, lv: 0 };
  }
  // a ladder or a hatch for it, chosen among candidate places: its foot in a room of the storey below, the top on the floor
  // above, the flight inside one room (never across a partition); null when no place takes it
  function ladderAt(P, lv0, lv1, cands, top, kind) {
    for (const c of cands) {
      const { r, du, dv, hole } = c; const cu = (r[0] + r[2]) / 2, cv = (r[1] + r[3]) / 2; const len = du ? r[2] - r[0] : r[3] - r[1];
      const foot = [cu - du * (len / 2 + 0.4), cv - dv * (len / 2 + 0.4)], tp = [cu + du * (len / 2 + 0.35), cv + dv * (len / 2 + 0.35)];
      if (!roomHolding(P, lv0, r)) continue;
      if (P.keepClear(lv0).some(z => P.ovr(r, z)) || (hole && P.keepClear(lv1).some(z => P.ovr(hole, z)))) continue;
      const fr = P.rooms.find(m => m.lv === lv0 && ptInR(foot, m.r, 0.2)); if (!fr) continue;
      const tr = P.rooms.find(m => m.lv === lv1 && ptInR(tp, m.r, 0.15) && (!top || top(m))); if (!tr) continue;
      if (hole && !roomHolding(P, lv1, hole) && !P.rooms.some(m => m.lv === lv1 && P.ovr(hole, m.r))) continue;
      return P.stair(kind || 'escada-de-mao', lv0, lv1, r, du, dv, hole);
    }
    return null;
  }
  // the loft under the roof: over the back of the house, the fire left under the open front; a ladder up to it — in front of
  // its edge, or through a hatch in its floor
  function loft(P, rooms, I, lvB) {
    const S = P.shell, R0 = P.roofGeo; const yL = S.eave - 0.25; const id = I[3] - I[1]; const lw = 0.6; const lvL = lvB + 1;
    // (over the back room when the house is cut front and back, else over the back of the whole house; the front keeps its
    // fire out of the loft's smoke)
    const back = rooms.backV !== undefined && lvB === 0 ? P.rooms[rooms.backV] : null;
    const depth = back ? back.r[3] - I[1] : Math.min(id - 1.35, Math.max(1.6, id - P.rr(1.4, 1.6)));
    if (depth < 1.55 || id - depth < 1.25) { P.errs.push('fundo raso demais para um jirau'); return; }
    const area = [I[0], I[1], I[2], I[1] + depth];
    const front0 = back ? P.rooms.filter(m => m.lv === 0 && m.r[1] > back.r[3] - 1e-6).reduce((a, m) => Math.min(a, m.r[1]), I[3]) : area[3]; // (where the room before it starts)
    P.level(lvL, yL, 1.2, 'jirau', area);
    rooms.jirau = P.room(lvL, 'leitos', area);
    P.headAt = (lv, u, v) => { const l = P.lvl(lv); if (!l || l.kind !== 'jirau') return 9; return In.roofY(R0, u, v) - 0.25 - l.y; };
    P.under = lv => (lv === lvB ? [area] : []);
    P.headOK = (lv, r, kind) => {
      const l = P.lvl(lv); if (!l || l.kind !== 'jirau') return true; const D = IT[kind];
      const hs = [P.headAt(lv, r[0], r[1]), P.headAt(lv, r[2], r[1]), P.headAt(lv, r[0], r[3]), P.headAt(lv, r[2], r[3])];
      if (D.low) return Math.max(...hs) >= 0.9 && Math.min(...hs) >= 0.3;
      return Math.min(...hs) >= (D.h || 0.5) + 0.15;
    };
    const rail = P.wall(lvL, [I[2], area[3]], [I[0], area[3]], 0.06, 0.9, 0, 'guarda-corpo');
    const us = P.shuffle([I[0] + 0.06, I[2] - 0.06 - lw, (I[0] + I[2]) / 2 - lw / 2]);
    const cands = [];
    for (const u0 of us) {
      cands.push({ r: [u0, front0 + 0.02, u0 + lw, front0 + 0.67], du: 0, dv: -1, front: 1 });
      cands.push({ r: [u0, area[3] - 0.7, u0 + lw, area[3] - 0.05], du: 0, dv: -1, hole: [u0, area[3] - 0.7, u0 + lw, area[3] - 0.05] });
    }
    const order = P.chance(0.5) ? cands : cands.slice().reverse();
    const st = ladderAt(P, lvB, lvL, order);
    if (!st) { P.errs.push('não cabe a escada do jirau'); return; }
    if (!st.hole) P.hole(rail, P.atOf(rail, [(st.r[0] + st.r[2]) / 2, area[3]]), lw + 0.12, 0.9, 0, 'vao');
  }
  // the storeys above: the walls going on up (a lighter frame over a house's heavy ground storey), a floor of beams between
  // each; on each a steep stair (or a ladder, in a small house) up from the one below, a trapdoor over it, never over the
  // flight below; one room on each — or two, front and back —, where the households sleep
  function upper(P, rooms, I, y1, h1, two, n) {
    const S = P.shell; const sh = S.r; const t = n <= 2 ? Math.min(S.t, 0.18) : Math.min(S.t, 0.24); const I1 = [sh[0] + t, sh[1] + t, sh[2] - t, sh[3] - t];
    rooms.up = []; P.outers = [P.outer]; let y = y1;
    // (the flights stacked along one side wall, in two lanes, each going up the other way — up toward the back, then toward
    // the front — so one flight's top is by the next one's foot and the rest of every storey stays whole)
    const colLeft = P.chance(0.5); const ladders = P.attempt % 3 === 2; const cw = ladders ? 0.6 : 0.7, crun = ladders ? 0.65 : P.rr(1.4, 1.55);
    for (let k = 1; k < n; k++) {
      P.level(k, y, h1, 'andar', I1);
      let id = P.room(k, 'quarto', I1); const ids = [id];
      const c = t / 2; const O = P.walls4(k, [sh[0] + c, sh[1] + c, sh[2] - c, sh[3] - c], t, h1, 1, 'parede'); P.outers.push(O);
      if (n <= 2) for (const q in O) P.walls[O[q]].mat = 'enxaimel'; // (the frame filled with wattle and daub)
      if (two) {
        const id1 = I1[3] - I1[1]; const at = I1[1] + id1 * P.rr(0.47, 0.53);
        const [back, front, w] = P.split(id, 'v', at, 0.1, h1); ids.splice(0, 1, back, front);
        const len = P.wlen(w); P.door(w, Math.max(0.6, Math.min(len - 0.6, len * P.pick([0.3, 0.5, 0.7]))), 0.8, Math.min(1.95, h1 - 0.15), back, front, 0, 'porta');
      }
      rooms.up.push(...ids);
      // the way up from the storey below
      const B = k === 1 ? I : I1; const sw = 0.7, run = P.rr(1.4, 1.6); const cands = [];
      for (const u0 of P.shuffle([B[0] + 0.03, B[2] - 0.03 - sw])) for (const v0 of [B[1] + 0.55, B[1] + 0.8, B[1] + 1.1, B[3] - run - 0.6]) { const r = [u0, v0, u0 + sw, v0 + run]; cands.push({ r, du: 0, dv: -1, hole: r }); }
      for (const u0 of [B[0] + 0.6, B[2] - 0.6 - run]) { const r = [u0, B[1] + 0.03, u0 + run, B[1] + 0.03 + sw]; cands.push({ r, du: u0 < (B[0] + B[2]) / 2 ? 1 : -1, dv: 0, hole: r }); }
      const lw = 0.6; const lc = [];
      for (const u0 of P.shuffle([B[0] + 0.03, B[2] - 0.03 - lw, (B[0] + B[2]) / 2 - lw / 2])) for (const v0 of [B[1] + 0.55, B[1] + 1.0, B[3] - 1.6, B[3] - 2.2]) { const r = [u0, v0, u0 + lw, v0 + 0.65]; lc.push({ r, du: 0, dv: -1, hole: r }); }
      const lane = (k - 1) % 2; const cu0 = colLeft ? B[0] + 0.03 + lane * (cw + 0.05) : B[2] - 0.03 - cw - lane * (cw + 0.05); const cv0 = B[1] + 0.6;
      const cr = [cu0, cv0, cu0 + cw, cv0 + crun]; const col = [{ r: cr, du: 0, dv: lane ? 1 : -1, hole: cr }];
      const ways = [[col, ladders ? 'escada-de-mao' : 'escada']].concat((P.attempt + k) % 2 ? [[lc, 'escada-de-mao'], [cands, 'escada']] : [[cands, 'escada'], [lc, 'escada-de-mao']]);
      let ok = false; for (const [cs, kind] of ways) if (ladderAt(P, k - 1, k, cs, null, kind)) { ok = true; break; }
      if (!ok) P.errs.push(`não cabe a escada do ${k}º andar`);
      y += h1 + 0.2;
    }
    return I1;
  }
  // the cellar: under a back corner of the house, a hatch in the floor and a ladder down; the jars and the barrels go there
  function porao(P, rooms, I) {
    const iw = I[2] - I[0], id = I[3] - I[1]; const cw = Math.min(iw - 0.3, P.rr(1.7, 2.2)), cd = Math.min(id - 0.6, P.rr(2.0, 2.4));
    const left = P.chance(0.5); const r = left ? [I[0], I[1], I[0] + cw, I[1] + cd] : [I[2] - cw, I[1], I[2], I[1] + cd];
    P.level(-1, -2.1, 1.9, 'porao', r);
    rooms.despensa = P.room(-1, 'despensa', r);
    P.walls4(-1, [r[0] - 0.12, r[1] - 0.12, r[2] + 0.12, r[3] + 0.12], 0.24, 1.9, 1, 'parede');
    const lw = 0.6; const cands = [];
    for (const u0 of [left ? r[2] - lw - 0.1 : r[0] + 0.1, (r[0] + r[2]) / 2 - lw / 2]) for (const v0 of [r[1] + 0.9, r[1] + 0.7, r[1] + 1.2]) { const hz = [u0, v0, u0 + lw, v0 + 0.7]; cands.push({ r: hz, du: 0, dv: 1, hole: hz }); }
    if (!ladderAt(P, -1, 0, cands)) P.errs.push('o alçapão do porão não cabe');
  }
  // the roof made a terrace: the parapet round it, a ladder up through a hatch; maybe a room on it, roofed with reed
  function terrace(P, rooms, I, withRoom, lvB) {
    const S = P.shell; if (S.kind === 'round') { P.errs.push('terraço numa cabana redonda'); return; } const lvR = lvB + 1;
    const sh = S.r; const e = 0.14; const T = [sh[0] + e, sh[1] + e, sh[2] - e, sh[3] - e];
    P.level(lvR, S.eave + 0.25, 2.2, 'terraco', T);
    P.walls4(lvR, [sh[0] + 0.07, sh[1] + 0.07, sh[2] - 0.07, sh[3] - 0.07], 0.14, 0.9, 1, 'parapeito');
    const left = P.chance(0.5);
    if (withRoom) {
      // (a room on the roof, its low walls and a roof of reed and palm: where the household sleeps in the cold months)
      const rw = Math.min(T[2] - T[0] - 0.95, P.rr(2.05, 2.35)), rd = Math.min(T[3] - T[1] - 1.0, P.rr(2.15, 2.4));
      const ru0 = left ? T[2] - rw : T[0]; const rr = [ru0, T[1], ru0 + rw, T[1] + rd];
      rooms.terraco = P.room(lvR, 'terraco', left ? [T[0], T[1], ru0, T[3]] : [ru0 + rw, T[1], T[2], T[3]], 1);
      rooms.terracoFrente = P.room(lvR, 'terraco', [rr[0], rr[3], rr[2], T[3]], 1);
      const c = 0.1; rooms.quarto = P.room(lvR, 'quarto', [rr[0] + c, rr[1] + c, rr[2] - c, rr[3] - c]);
      const w4 = P.walls4(lvR, [rr[0] + c / 2, rr[1] + c / 2, rr[2] - c / 2, rr[3] - c / 2], c, 1.95, 0, 'parede');
      P.door(w4.frente, P.wlen(w4.frente) * P.rr(0.35, 0.65), 0.8, 1.8, rooms.quarto, rooms.terracoFrente, 0, 'porta');
      P.roof = Object.assign({}, P.roof, { room: { r: rr, h: 2.05, kind: 'junco' } });
    } else rooms.terraco = P.room(lvR, 'terraco', T, 1);
    // (the hatch: up from a room of the house to the open roof, never into the roof room)
    const lw = 0.6; const cands = [];
    for (const u0 of P.shuffle([I[0] + 0.06, I[2] - 0.06 - lw, (I[0] + I[2]) / 2 - lw / 2])) for (const v0 of [I[1] + 0.8, I[1] + 1.4, I[3] - 1.7, I[1] + 0.3]) { const hz = [u0, v0, u0 + lw, v0 + 0.7]; cands.push({ r: hz, du: 0, dv: -1, hole: hz }); }
    if (!ladderAt(P, lvB, lvR, cands, m => m.fn === 'terraco')) P.errs.push('não cabe o alçapão do terraço');
  }
  // windows: by how much the people opens to the street; never in a party wall, never into the annex
  const WORLD = { S: { frente: 4, fundo: 1, direita: 2, esquerda: 8 }, N: { frente: 1, fundo: 4, direita: 8, esquerda: 2 }, E: { frente: 2, fundo: 8, direita: 1, esquerda: 4 }, W: { frente: 8, fundo: 2, direita: 4, esquerda: 1 } };
  function windows(P, round) {
    if (round || !P.outer) return; const rec = P.rec; const tr = P.tr;
    for (const O of P.outers || [P.outer]) for (const k of ['frente', 'fundo', 'esquerda', 'direita']) {
      const id = O && O[k]; if (id === undefined || (rec.pw & WORLD[rec.s][k])) continue;
      if (P.annex.length && ((k === 'esquerda' && P.shell.r[0] > 0.6) || (k === 'direita' && P.shell.r[2] < P.L - 0.6))) continue;
      const len = P.wlen(id); const n = Math.max(0, Math.floor(len / 2.4 + tr.win * (k === 'frente' ? 1.2 : 0.8) - 0.3 + P.rnd() * 0.6));
      for (let q = 0; q < n; q++) {
        const at = len * (q + 0.5) / n + P.rr(-0.2, 0.2); const ww = tr.win < 0.35 ? 0.45 : P.rr(0.55, 0.8); const sill = tr.win < 0.35 ? 1.55 : P.rr(0.85, 1.05);
        if (P.holes.some(h => h.wall === id && Math.abs(h.at - at) < (h.w + ww) / 2 + 0.3)) continue;
        if (at < ww / 2 + 0.3 || at > len - ww / 2 - 0.3) continue;
        P.window(id, at, ww, Math.max(0.3, Math.min(1.0, P.walls[id].h - sill - 0.25)), sill);
      }
    }
  }

  // ------------------------------ the furniture of a home ------------------------------
  function furnishHome(P, rooms, need) {
    const tr = P.tr, rec = P.rec; const rich = rec.w >= 2; const shack = rec.t === 'barraco';
    const lar = rooms.lar; const hot = rec.cl === 'q';
    const loftOf = id => P.lvl(P.rooms[id].lv).kind === 'jirau';
    const sidesOf = id => (loftOf(id) ? ['fundo', 'esquerda', 'direita'] : P.attempt % 2 ? ['fundo'].concat(P.shuffle(['esquerda', 'direita']), ['frente']) : P.shuffle(['fundo', 'esquerda', 'direita']).concat(['frente']));
    // where people sleep, in this order: the sleeping rooms, the roof room, the loft, the hall, the roof itself in the hot lands
    const order = [rooms.leitos, rooms.quarto].concat(rooms.up || [], [rooms.jirau, rooms.lar, hot ? rooms.terraco : undefined, hot ? rooms.terracoFrente : undefined, rooms.anexo]).filter(x => x !== undefined);
    const couple = shack ? null : rich || rec.w >= 1 ? tr.coupleRich || tr.couple : tr.couple;
    const kinds = rich ? tr.rich : tr.bed;
    // (every other attempt, the beds first in a row along the back wall, head to it, one against the other — what holds most
    // sleepers in a small room —, then wherever they go)
    const rowFirst = P.attempt % 2 === 0;
    const fill = (k, id) => {
      const lv = P.rooms[id].lv;
      if (k === 'banco-cama') { for (const s of P.shuffle(['esquerda', 'direita', 'fundo', 'frente'])) { if (P.places() >= need) return; P.bench(lv, id, s, { min: 2 }); } return; }
      let g = 0;
      if (rowFirst && !loftOf(id)) while (P.places() < need && g++ < 12) if (!P.place(k, lv, id, { sides: ['fundo'], fixed: true })) break;
      g = 0; while (P.places() < need && g++ < 12) if (!P.place(k, lv, id, { sides: sidesOf(id) })) break;
    };
    // the couple's bed — or mat: a household is first of all a couple and its children
    const coupleBed = () => { if (couple && need >= 3) for (const id of order) { if (loftOf(id)) continue; const lv = P.rooms[id].lv; if ((rowFirst && P.place(couple, lv, id, { sides: ['fundo'], fixed: true })) || P.place(couple, lv, id, { sides: sidesOf(id) })) break; } };
    // the household's beds, room by room (the north's benches along its walls)
    // (a crowded house, every other attempt: the mats two share first — they take less floor for each sleeper)
    const dense = need >= 5 && (P.attempt % 2 === 1 || need >= 9);
    const beds = () => {
      if (dense) for (const id of order) { if (P.places() >= need - 1) break; fill('esteira-casal', id); }
      for (const id of order) { for (const k of kinds) { if (P.places() >= need) break; fill(k, id); } if (P.places() >= need) break; }
      // (what is still short: the mat two share — children, most often —, then the single mat, wherever they go)
      for (const k of ['esteira-casal', 'esteira']) for (const id of order) { if (P.places() >= need - (k === 'esteira-casal' ? 1 : 0)) break; fill(k, id); }
      if (P.places() < need) for (const id of order) { if (P.places() >= need) break; fill('esteira', id); }
    };
    // the fire: the open hearth in the middle (never under a loft) where the people keeps one, else the wall hearth or the oven,
    // else a brazier
    const fireUp = () => {
      const fire = shack ? 'braseiro' : rec.t === 'hut' && tr.hutFire ? tr.hutFire : tr.fire; let lit = false;
      if (fire === 'lar') lit = !!(P.place('lar', 0, lar, { sides: ['centro'], margin: 0.3 }) || P.place('lar', 0, lar, { sides: ['livre'], margin: 0.25 }));
      if (!lit && fire !== 'braseiro') lit = !!P.place(fire === 'lar' ? 'fogao' : fire, 0, lar, { sides: P.shuffle(['fundo', 'esquerda', 'direita', 'frente']) });
      if (!lit) lit = !!P.place('braseiro', 0, lar, { sides: ['fundo', 'esquerda', 'direita', 'frente'] });
      if (!lit) P.errs.push('sem lugar para o fogo');
    };
    // what keeps the household's things: the pantry (in the cellar, the annex, the hall) and the chest (coins and goods)
    const keep = () => {
      const keepAt = [rooms.despensa, rooms.anexo, rooms.lar, rooms.leitos, rooms.quarto].concat(rooms.up || []).filter(x => x !== undefined);
      const pantry = tr.keep.find(k => k !== 'arca') || 'cesto';
      let gotP = false; for (const id of keepAt) { const lv = P.rooms[id].lv; if (P.place(pantry, lv, id) || P.place('cesto', lv, id)) { gotP = true; break; } }
      // (no floor for the jars: the food hung in baskets from the beams)
      if (!gotP) for (const id of keepAt) { if (P.niche('cesto-pendurado', P.rooms[id].lv, id)) { gotP = true; break; } }
      if (!gotP) P.errs.push('sem lugar para a despensa');
      if (rooms.despensa !== undefined) P.place('jarros', -1, rooms.despensa);
      const chestAt = [rooms.leitos, rooms.quarto].concat(rooms.up || [], [rooms.lar, rooms.anexo, rooms.jirau]).filter(x => x !== undefined);
      let gotC = false; for (const id of chestAt) { if (P.place('arca', P.rooms[id].lv, id)) { gotC = true; break; } }
      // (no floor for a chest: a niche in a thick wall keeps the household's few goods)
      if (!gotC) for (const id of chestAt) { if (P.niche('nicho', P.rooms[id].lv, id) || P.niche('prateleira-parede', P.rooms[id].lv, id)) { gotC = true; break; } }
      if (!gotC && !shack) P.errs.push('sem lugar para a arca');
    };
    // (each attempt lays the house out in its own order: where the beds go first, or the things kept, or the fire)
    const plans = [[coupleBed, beds, fireUp, keep], [fireUp, coupleBed, beds, keep], [coupleBed, keep, beds, fireUp], [keep, fireUp, coupleBed, beds], [fireUp, keep, coupleBed, beds], [coupleBed, fireUp, beds, keep]];
    for (const step of plans[P.attempt % plans.length]) step();
    // the work front: the bench (or the counter) facing the door
    if (rooms.oficina !== undefined && !P.place('bancada', 0, rooms.oficina, { sides: ['fundo', 'esquerda', 'direita'] }) && !P.place('balcao', 0, rooms.oficina, { sides: ['livre'] })) P.errs.push('sem lugar para a bancada');
    // the table and its bench, if there is room (a poor hall goes without); the wood in the annex of a house with an open fire
    P.opt(() => { if (!shack && P.place(tr.eat, 0, lar, { sides: ['livre'] }) && tr.eat === 'mesa') P.place('banco', 0, lar, { sides: ['esquerda', 'direita', 'fundo'] }); });
    P.opt(() => { if (!shack && tr.fire === 'lar' && rooms.anexo !== undefined) P.place('lenha', 0, rooms.anexo); });
  }
  // (what the other recipes — the block round a court, the buildings of work — lay out with)
  In.HOME = { ladderAt, loft, porao, terrace, windows, roofOf, pitched, wet, flatOK, cellarOK, touches, roomHolding, ptInR, parseV, NUM, TOPN };
})(window.G);
