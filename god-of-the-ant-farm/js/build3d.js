'use strict';
// ============================================================
//  Build3D: every real building in three dimensions. Each one
//  is drawn from what the world knows of it — its type, its
//  footprint and place (b.x, b.y, b.w, b.h), the style of the
//  people who built it (b.style → Arch.PAL: walls, roofs, trim),
//  the side its door opens to (Vg.door: where people come out),
//  how far its building has got (progress), how hurt it is (hp),
//  its crops, its graves — and on a stone base that meets the
//  slope, so nothing floats and nothing sinks. A small kit of
//  boxes, prisms, columns and cones, put into one geometry per
//  chunk. The city walls and gates, and the aqueducts, too.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const B3 = G.Build3D = {};
  let THREE = null, R3 = null, SH = null, glass = null;
  const TAU = Math.PI * 2;
  B3.init = function (three, realm) { THREE = three; R3 = realm; SH = realm.SH; glass = new THREE.MeshLambertMaterial({ color: 0x2a3440, emissive: 0xffc070, emissiveIntensity: 0 }); };
  B3.glassMat = () => glass;
  // (the windows light up at night: the hour's light, only seen)
  B3.night = k => { if (glass) glass.emissiveIntensity = k * 0.9; };
  const TL = () => G.Space.TILE, HM = () => G.Space.HM;
  const palOf = b => { const P = G.Arch && G.Arch.PAL || {}; const st = b.style || ((G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || 'classico'; return P[st] || P.classico || { wl: '#efe2c4', wr: '#d2c19e', base: ['#8a8478', '#6f6a60', '#a09a8e'], roof: ['#b85a3c', '#94452d', '#7a3826'], gable: '#dccba6', trim: '#6b4a30', win: '#2f3a48', door: '#5a3b25', kind: 'gable' }; };
  const styleOf = b => b.style || ((G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || 'classico';
  const dim = (c, f) => { const r = typeof c === 'string' ? G.hex2rgb(c) : c; return [r[0] * f, r[1] * f, r[2] * f]; };
  // (heights of the buildings, in metres: the camera and the far picture use them too)
  const HEIGHT = { hut: 4.4, house: 5.2, sobrado: 8.4, insula: 14, quarteirao: 15, barraco: 3, storehouse: 6.5, armazem: 7, celeiro: 7, workshop: 5.5, forja: 6, olaria: 5, tecelagem: 5.5, ourives: 5.5, perolaria: 5, sericultura: 5, acougue: 5, temple: 10, monument: 13, estatua: 7, maravilha: 26, palacio: 14, paco: 12, administracao: 9, coletoria: 7, biblioteca: 9, teatro: 7, banhos: 7, cadeia: 6, quartel: 6, torre: 12, taverna: 7.5, mercado: 3.2, feira: 3, mercado_negro: 3, doca: 1.2, mina: 4, apiario: 1.6, curral: 1.4, estabulo: 5, cercado: 1.5, farm: 1, horta: 0.8, plantacao: 1.2, vinhedo: 1.8, pomar: 4, well: 2.6, campfire: 0.6, cemetery: 1.2, praca: 3, aqueduto: 7, ruin: 2.5 };
  B3.height = b => HEIGHT[b.type] || 5;

  // ------------------------------ the kit ------------------------------
  // (everything in metres, from the corner of the footprint: a building is a little world of its own, then put in place)
  function kit(g, b) {
    const L = TL(); const x0 = b.x * L, z0 = b.y * L, w = b.w * L, d = b.h * L;
    // the ground under the footprint: the base stands on the lowest point and reaches the highest
    let lo = 1e9, hi = -1e9; for (let ty = b.y; ty <= b.y + b.h; ty++) for (let tx = b.x; tx <= b.x + b.w; tx++) { const h = W.hAt(Math.min(N, tx), Math.min(N, ty)) * HM(); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    const y0 = hi + 0.15; // (the floor of the building)
    const P = palOf(b); const hurt = b.maxHp ? G.clamp(b.hp / b.maxHp, 0, 1) : 1; const soot = hurt < 0.6 ? 0.55 + hurt * 0.75 : 1;
    const c = cc => (soot < 1 ? dim(cc, soot) : cc);
    const K = {
      b, P, L, x0, z0, w, d, y0, lo, hi, cx: x0 + w / 2, cz: z0 + d / 2, c, built: b.built, prog: b.built ? 1 : G.clamp(b.progress || 0, 0, 1), hurt,
      box(x, y, z, sx, sy, sz, col, ry) { g.put(SH.box, R3.mat(x0 + x, y0 + y, z0 + z, ry || 0, sx, sy, sz), c(col)); },
      cyl(x, y, z, r, h, col, top) { g.put(SH.cyl, R3.mat(x0 + x, y0 + y, z0 + z, 0, r * 2, h, r * 2), c(col)); void top; },
      cone(x, y, z, r, h, col) { g.put(SH.cone, R3.mat(x0 + x, y0 + y, z0 + z, 0, r * 2, h, r * 2), c(col)); },
      sph(x, y, z, r, col, sy) { g.put(SH.sph, R3.mat(x0 + x, y0 + y, z0 + z, 0, r * 2, (sy || r) * 2, r * 2), c(col)); },
      gable(x, y, z, sx, h, sz, col, alongZ) { g.put(SH.gable, R3.mat(x0 + x, y0 + y, z0 + z, alongZ ? Math.PI / 2 : 0, alongZ ? sz : sx, h, alongZ ? sx : sz), c(col)); },
      hip(x, y, z, sx, h, sz, col) { g.put(SH.hip, R3.mat(x0 + x, y0 + y, z0 + z, 0, sx, h, sz), c(col)); },
    };
    // the base: stone from the lowest ground up to the floor (on a slope it shows; on flat ground it is a step)
    if (b.type !== 'farm' && b.type !== 'horta' && b.type !== 'plantacao' && b.type !== 'vinhedo' && b.type !== 'doca' && b.type !== 'praca' && b.type !== 'cemetery' && b.type !== 'curral' && b.type !== 'cercado' && b.type !== 'campfire')
      g.put(SH.box, R3.mat(x0 + w / 2, lo - 0.2, z0 + d / 2, 0, w - 0.2, y0 - lo + 0.2, d - 0.2), c(P.base ? P.base[0] : '#8a8478'));
    return K;
  }
  // which side the door opens to (the side people come out of — the world's own door)
  function doorSide(b) {
    const dr = G.Vg.door(b); const cx = b.x + b.w / 2, cy = b.y + b.h / 2; const dx = dr[0] - cx, dy = dr[1] - cy;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
  }
  B3.doorSide = doorSide;
  // windows and a door on the walls of a box-shaped house: dark panes (lit at night), a wooden door on the door's side
  function openings(g, gw, K, x, z, sx, sz, y, h, floors, door) {
    const side = doorSide(K.b); const P = K.P; const fh = h / floors;
    const pane = (px, py, pz, ax, ww, hh) => gw.put(SH.box, R3.mat(K.x0 + px, K.y0 + py, K.z0 + pz, ax ? Math.PI / 2 : 0, ww, hh, 0.08), '#2a3440');
    for (let f = 0; f < floors; f++) {
      const wy = y + f * fh + fh * 0.42, wh = Math.min(1.1, fh * 0.34);
      const nx = Math.max(1, Math.floor(sx / 2.2)), nz = Math.max(1, Math.floor(sz / 2.2));
      for (let k = 0; k < nx; k++) { const px = x - sx / 2 + sx * (k + 0.5) / nx; if (!(f === 0 && side === 'S' && k === Math.floor(nx / 2))) pane(px, wy, z + sz / 2 + 0.04, false, 0.7, wh); if (!(f === 0 && side === 'N' && k === Math.floor(nx / 2))) pane(px, wy, z - sz / 2 - 0.04, false, 0.7, wh); }
      for (let k = 0; k < nz; k++) { const pz = z - sz / 2 + sz * (k + 0.5) / nz; if (!(f === 0 && side === 'E' && k === Math.floor(nz / 2))) pane(x + sx / 2 + 0.04, wy, pz, true, 0.7, wh); if (!(f === 0 && side === 'W' && k === Math.floor(nz / 2))) pane(x - sx / 2 - 0.04, wy, pz, true, 0.7, wh); }
    }
    if (door === false) return;
    const dc = P.door || '#5a3b25', dw = 1.0, dh = 2.0;
    if (side === 'S') K.box(x, y, z + sz / 2 + 0.02, dw, dh, 0.12, dc); else if (side === 'N') K.box(x, y, z - sz / 2 - 0.02, dw, dh, 0.12, dc);
    else if (side === 'E') K.box(x + sx / 2 + 0.02, y, z, 0.12, dh, dw, dc); else K.box(x - sx / 2 - 0.02, y, z, 0.12, dh, dw, dc);
    // (the lintel over it)
    if (side === 'S' || side === 'N') K.box(x, y + dh, z + (side === 'S' ? 1 : -1) * (sz / 2 + 0.04), dw + 0.3, 0.18, 0.16, P.trim || '#6b4a30'); else K.box(x + (side === 'E' ? 1 : -1) * (sx / 2 + 0.04), y + dh, z, 0.16, 0.18, dw + 0.3, P.trim || '#6b4a30');
  }
  // a roof of the people's kind over a box
  function roofOf(K, x, z, sx, sz, y, kind, cols) {
    const P = K.P; const r = cols || P.roof || ['#b85a3c', '#94452d', '#7a3826']; kind = kind || P.kind || 'gable';
    const ov = 0.35, alongZ = sz > sx + 0.01 || (K.b.v === 1 && Math.abs(sx - sz) < 0.01);
    if (kind === 'flat') { K.box(x, y, z, sx + 0.1, 0.25, sz + 0.1, P.top || P.wl); const pc = (P.par && P.par[0]) || P.wl; for (const [px, pz, a, bb] of [[x, z - sz / 2, sx, 0.25], [x, z + sz / 2, sx, 0.25], [x - sx / 2, z, 0.25, sz], [x + sx / 2, z, 0.25, sz]]) K.box(px, y + 0.25, pz, a, 0.55, bb, pc); return y + 0.8; }
    const h = Math.min(sx, sz) * (P.pitch || 0.8) * 0.62;
    if (kind === 'hip') { K.hip(x, y, z, sx + ov * 2, h, sz + ov * 2, r[0]); return y + h; }
    if (kind === 'thatch') { K.gable(x, y, z, sx + ov * 2.2, h * 1.15, sz + ov * 2.2, (P.thatch && P.thatch[0]) || '#c8a85a', alongZ); return y + h * 1.15; }
    if (kind === 'turf') { K.gable(x, y, z, sx + ov * 2, h * 1.2, sz + ov * 2, r[0], alongZ); return y + h * 1.2; }
    K.gable(x, y, z, sx + ov * 2, h, sz + ov * 2, r[0], alongZ);
    return y + h;
  }
  // a plain house body: walls, windows, door, roof — the base of most buildings
  function house(g, gw, K, o) {
    o = o || {}; const P = K.P; const inset = o.inset === undefined ? 0.35 : o.inset;
    const sx = K.w - inset * 2, sz = K.d - inset * 2, x = K.w / 2, z = K.d / 2; const floors = o.floors || 1; const h = (o.h || 2.9) * floors;
    const built = K.prog;
    const wallsH = h * (built < 1 ? G.clamp(built / 0.8, 0.08, 1) : 1);
    K.box(x, 0, z, sx, wallsH, sz, o.wall || (K.b.v === 2 ? P.wr : P.wl));
    // (floors between the storeys, a band of trim)
    for (let f = 1; f < floors && wallsH > f * h / floors; f++) K.box(x, f * h / floors - 0.1, z, sx + 0.12, 0.2, sz + 0.12, P.trim || '#6b4a30');
    if (built < 1) { scaffold(K, x, z, sx, sz, h); return h; }
    openings(g, gw, K, x, z, sx, sz, 0, h, floors, o.door);
    const top = o.noRoof ? h : roofOf(K, x, z, sx, sz, h, o.roof, o.roofCols);
    if (o.chimney) K.box(x + sx * 0.28, h * 0.7, z - sz * 0.2, 0.6, top - h * 0.7 + 0.9, 0.6, P.base ? P.base[1] : '#6f6a60');
    return top;
  }
  // a building going up: the poles of the scaffold, a pile of wood
  function scaffold(K, x, z, sx, sz, h) {
    for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) K.box(x + px * (sx / 2 + 0.3), 0, z + pz * (sz / 2 + 0.3), 0.15, h + 0.6, 0.15, '#8a6a44');
    K.box(x, h * 0.55, z + sz / 2 + 0.3, sx + 0.6, 0.1, 0.5, '#9a7a50');
    K.box(x + sx / 2 + 0.9, 0, z, 1.2, 0.5, 0.8, '#a07a48');
  }
  // columns in a row
  function colonnade(K, x0, z0, x1, z1, n, h, r, col) { for (let k = 0; k < n; k++) { const f = n === 1 ? 0.5 : k / (n - 1); K.cyl(x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f, r, h, col); } }
  function fence(K, x0, z0, x1, z1, h, col) {
    const len = Math.hypot(x1 - x0, z1 - z0); const n = Math.max(2, Math.round(len / 1.6));
    for (let k = 0; k <= n; k++) { const f = k / n; K.box(x0 + (x1 - x0) * f, 0, z0 + (z1 - z0) * f, 0.14, h, 0.14, col); }
    const a = Math.atan2(z1 - z0, x1 - x0);
    for (const yy of [h * 0.45, h * 0.85]) K.box((x0 + x1) / 2, yy, (z0 + z1) / 2, len, 0.09, 0.07, col, -a);
  }
  function fenceAround(K, h, col, gate) {
    const w = K.w, d = K.d, e = 0.25;
    fence(K, e, e, w - e, e, h, col); fence(K, w - e, e, w - e, d - e, h, col); fence(K, e, e, e, d - e, h, col);
    if (gate) { fence(K, e, d - e, w / 2 - 1, d - e, h, col); fence(K, w / 2 + 1, d - e, w - e, d - e, h, col); } else fence(K, e, d - e, w - e, d - e, h, col);
  }
  // ------------------------------ the types ------------------------------
  const KIT = {
    hut(g, gw, K) {
      const P = K.P; const r = K.w * 0.36;
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, r * 2, r * 2, 2.4); return; }
      K.cyl(K.w / 2, 0, K.d / 2, r, 2.3, P.wl);
      g.put(SH.cone, R3.mat(K.x0 + K.w / 2, K.y0 + 2.2, K.z0 + K.d / 2, 0, r * 2.5, 2.2, r * 2.5), K.c((P.thatch && P.thatch[0]) || '#c8a85a'));
      openings(g, gw, K, K.w / 2, K.d / 2, r * 1.9, r * 1.9, 0, 2.3, 1);
    },
    house(g, gw, K) { house(g, gw, K, { chimney: K.b.v === 1 }); },
    sobrado(g, gw, K) { house(g, gw, K, { floors: 2, h: 3, roof: K.P.kind === 'flat' ? 'flat' : 'hip', inset: 0.25 }); },
    insula(g, gw, K) { house(g, gw, K, { floors: 4, h: 3.1, roof: 'flat', inset: 0.15 }); },
    quarteirao(g, gw, K) { house(g, gw, K, { floors: 4, h: 3.3, roof: K.P.kind === 'flat' ? 'flat' : 'hip', inset: 0.3 }); },
    barraco(g, gw, K) {
      const sx = K.w * 0.7, sz = K.d * 0.6;
      K.box(K.w / 2, 0, K.d / 2, sx, 2.1, sz, ['#8a7a5a', '#7a6a4a', '#9a8a6a'][K.b.v || 0]);
      g.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + 2.1, K.z0 + K.d / 2, 0, sx + 0.4, 0.12, sz + 0.5, 0.18), '#6a6a6a');
      openings(g, gw, K, K.w / 2, K.d / 2, sx, sz, 0, 2.1, 1);
    },
    storehouse(g, gw, K) { const t = house(g, gw, K, { h: 3.8, inset: 0.4 }); void t; if (K.prog >= 1) for (let k = 0; k < 3; k++) K.box(K.w * 0.15, 0, K.d * (0.25 + k * 0.25), 0.9, 0.9, 0.9, '#9a7a4a'); },
    armazem(g, gw, K) { KIT.storehouse(g, gw, K); },
    celeiro(g, gw, K) { house(g, gw, K, { h: 4, inset: 0.4, wall: '#9a4a32' }); },
    workshop(g, gw, K) { house(g, gw, K, { h: 3.2, chimney: true }); if (K.prog >= 1) { K.box(K.w * 0.8, 0, K.d - 0.6, 1.6, 0.9, 0.8, '#8a6a44'); } },
    forja(g, gw, K) { house(g, gw, K, { h: 3.3, chimney: true, wall: K.P.base ? K.P.base[2] : '#a09a8e' }); if (K.prog >= 1) { K.box(K.w * 0.2, 0, K.d - 0.6, 0.8, 0.8, 0.6, '#3a3a3e'); K.box(K.w * 0.2, 0.8, K.d - 0.6, 1, 0.15, 0.4, '#4a4a50'); } },
    olaria(g, gw, K) { house(g, gw, K, { h: 3 }); if (K.prog >= 1) K.sph(K.w * 0.25, 0.2, K.d * 0.75, 1.1, '#b86a44', 0.9); },
    tecelagem(g, gw, K) { house(g, gw, K, { h: 3.2 }); if (K.prog >= 1) for (const [cc, k] of [['#c8483a', 0], ['#3f6fb0', 1], ['#e8b83a', 2]]) K.box(K.w * (0.25 + k * 0.25), 2.2, K.d - 0.3, 0.9, 1.4, 0.05, cc); },
    ourives(g, gw, K) { house(g, gw, K, { h: 3.2, wall: K.P.wr }); },
    perolaria(g, gw, K) { house(g, gw, K, { h: 3 }); },
    sericultura(g, gw, K) { house(g, gw, K, { h: 3 }); },
    acougue(g, gw, K) { house(g, gw, K, { h: 3 }); if (K.prog >= 1) K.box(K.w * 0.75, 1.6, K.d - 0.3, 1.2, 0.08, 0.08, '#6a4a30'); },
    taverna(g, gw, K) { house(g, gw, K, { floors: 2, h: 2.9, chimney: true }); if (K.prog >= 1) { for (let k = 0; k < 2; k++) K.cyl(K.w * (0.2 + k * 0.18), 0, K.d - 0.5, 0.42, 0.95, '#7a5030'); K.box(K.w * 0.82, 2.6, K.d - 0.15, 0.9, 0.6, 0.06, '#c89a4a'); } },
    temple(g, gw, K) {
      const st = styleOf(K.b); const P = K.P;
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 5); return; }
      if (st === 'asteca' || st === 'maia' || st === 'inca') { for (let k = 0; k < 4; k++) { const s = (K.w - 0.5) * (1 - k * 0.2); K.box(K.w / 2, k * 1.6, K.d / 2, s, 1.6, s, P.base ? P.base[k % 2] : '#b9ad93'); } K.box(K.w / 2, 6.4, K.d / 2, K.w * 0.3, 2, K.d * 0.3, P.wl); K.box(K.w / 2, 0.8, K.d - 0.6, 1.2, 0.2, 2.6, P.trim || '#b33a2a'); return; }
      if (st === 'egipcio') { K.box(K.w / 2, 0, K.d / 2, K.w - 0.6, 6, K.d - 0.6, P.wl); K.box(K.w / 2, 6, K.d / 2, K.w - 0.4, 0.5, K.d - 0.4, P.trim || '#2f8f8a'); K.box(K.w / 2, 0, K.d - 0.25, 1.6, 3.4, 0.2, P.door || '#3e2e1c'); for (const s of [-1, 1]) K.box(K.w / 2 + s * 2.6, 0, K.d + 0.4, 0.6, 7.5, 0.6, P.wr); return; }
      if (st === 'nordico') { house(g, gw, K, { h: 3.4, roof: 'turf', inset: 0.3 }); return; }
      // the classical temple: steps, columns all round, a pediment roof
      K.box(K.w / 2, 0, K.d / 2, K.w - 0.3, 0.8, K.d - 0.3, P.base ? P.base[2] : '#a09a8e');
      const cs = (P.col && P.col[0]) || '#fbf6ea'; const hh = 5.6;
      K.box(K.w / 2, 0.8, K.d / 2, K.w - 3.2, hh, K.d - 3.2, P.wl);
      colonnade(K, 1, 1, K.w - 1, 1, 4, hh, 0.32, cs); colonnade(K, 1, K.d - 1, K.w - 1, K.d - 1, 4, hh, 0.32, cs);
      K.box(K.w / 2, 0.8 + hh, K.d / 2, K.w - 1.2, 0.5, K.d - 1.2, P.gable || P.wl);
      K.gable(K.w / 2, 1.3 + hh, K.d / 2, K.w - 1, 1.8, K.d - 1, (P.roof && P.roof[0]) || '#b85a3c', true);
    },
    monument(g, gw, K) {
      const P = K.P; if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, 3, 3, 6); return; }
      K.box(K.w / 2, 0, K.d / 2, 3.4, 1, 3.4, P.base ? P.base[0] : '#8a8478');
      g.put(SH.cone, R3.mat(K.x0 + K.w / 2, K.y0 + 1, K.z0 + K.d / 2, Math.PI / 4, 2.2, 12, 2.2), K.c(P.wl)); // (an obelisk: a needle of stone)
    },
    estatua(g, gw, K) {
      const P = K.P; K.box(K.w / 2, 0, K.d / 2, 2.2, 2, 2.2, P.base ? P.base[0] : '#8a8478');
      const s = '#d8d4c8'; K.box(K.w / 2, 2, K.d / 2, 0.8, 2.4, 0.5, s); K.sph(K.w / 2, 4.75, K.d / 2, 0.42, s); K.box(K.w / 2 + 0.55, 3.5, K.d / 2, 0.25, 1.4, 0.25, s);
    },
    maravilha(g, gw, K) {
      const P = K.P; if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 10); return; }
      const st = styleOf(K.b);
      if (st === 'egipcio') { g.put(SH.cone, R3.mat(K.x0 + K.w / 2, K.y0, K.z0 + K.d / 2, Math.PI / 4, K.w * 1.35, 24, K.d * 1.35), K.c(P.wl)); return; }
      for (let k = 0; k < 6; k++) { const s = K.w * (1 - k * 0.14); K.box(K.w / 2, k * 3.4, K.d / 2, s, 3.4, s, k % 2 ? P.wr : P.wl); }
      K.box(K.w / 2, 20.4, K.d / 2, K.w * 0.18, 4, K.d * 0.18, P.acc || '#f2c14e');
    },
    palacio(g, gw, K) {
      const P = K.P; if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, K.w - 1, K.d - 1, 8); return; }
      const t = house(g, gw, K, { floors: 2, h: 4, roof: P.kind === 'flat' ? 'flat' : 'hip', inset: 1.2 }); void t;
      for (const [px, pz] of [[0.9, 0.9], [K.w - 0.9, 0.9], [0.9, K.d - 0.9], [K.w - 0.9, K.d - 0.9]]) { K.box(px, 0, pz, 1.8, 11, 1.8, P.wr); g.put(SH.cone, R3.mat(K.x0 + px, K.y0 + 11, K.z0 + pz, Math.PI / 4, 2.6, 3, 2.6), K.c((P.roof && P.roof[1]) || '#94452d')); }
      K.box(K.w / 2, 8.6, K.d / 2, 0.1, 4, 0.1, '#5a4a3a'); K.box(K.w / 2 + 0.6, 11.4, K.d / 2, 1.2, 0.7, 0.05, '#c8483a');
    },
    paco(g, gw, K) { KIT.palacio(g, gw, K); },
    administracao(g, gw, K) { const P = K.P; house(g, gw, K, { floors: 2, h: 3.4, roof: P.kind === 'flat' ? 'flat' : 'hip', inset: 0.6 }); if (K.prog >= 1) colonnade(K, 0.6, K.d - 0.25, K.w - 0.6, K.d - 0.25, 4, 6.6, 0.25, (P.col && P.col[0]) || P.wl); },
    coletoria(g, gw, K) { house(g, gw, K, { h: 3.6, inset: 0.5 }); },
    biblioteca(g, gw, K) { KIT.administracao(g, gw, K); },
    teatro(g, gw, K) {
      const P = K.P; const cx = K.w / 2, cz = K.d * 0.35; const R = Math.min(K.w, K.d) * 0.48;
      for (let k = 0; k < 5; k++) for (let a = 0; a < 9; a++) { const ang = Math.PI * (a / 8); const r = R - k * 0.9; g.put(SH.box, R3.mat(K.x0 + cx + Math.cos(ang) * r, K.y0 + k * 0.7, K.z0 + cz + Math.sin(ang) * r, -ang + Math.PI / 2, 2.2, 0.7 + k * 0.7, 1), K.c(k % 2 ? P.wl : P.wr)); }
      K.box(cx, 0, K.d * 0.2, K.w * 0.6, 0.6, 1.4, P.base ? P.base[0] : '#8a8478');
    },
    banhos(g, gw, K) { house(g, gw, K, { h: 3.4, noRoof: true, inset: 0.5 }); if (K.prog >= 1) { K.sph(K.w * 0.35, 3.4, K.d * 0.5, K.w * 0.24, '#d8d0c0', K.w * 0.18); K.sph(K.w * 0.72, 3.4, K.d * 0.5, K.w * 0.16, '#d8d0c0', K.w * 0.12); } },
    cadeia(g, gw, K) { const P = K.P; house(g, gw, K, { h: 3.6, wall: P.base ? P.base[1] : '#6f6a60', roof: 'flat' }); },
    quartel(g, gw, K) { house(g, gw, K, { h: 3.4 }); if (K.prog >= 1) { K.box(K.w - 0.4, 0, 0.4, 0.12, 7, 0.12, '#5a4a3a'); K.box(K.w - 0.4 + 0.6, 6.2, 0.4, 1.2, 0.7, 0.05, G.Fac.hex(G.Village.facOfSet(K.b.set))); } },
    torre(g, gw, K) {
      const P = K.P; const s = K.w - 0.8; const h = K.prog < 1 ? 10 * K.prog + 1 : 10;
      K.box(K.w / 2, 0, K.d / 2, s, h, s, P.base ? P.base[2] : '#a09a8e');
      if (K.prog < 1) { scaffold(K, K.w / 2, K.d / 2, s, s, 10); return; }
      K.box(K.w / 2, h, K.d / 2, s + 0.5, 0.4, s + 0.5, P.base ? P.base[1] : '#6f6a60');
      for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) K.box(K.w / 2 + px * (s / 2), h + 0.4, K.d / 2 + pz * (s / 2), 0.5, 0.7, 0.5, P.base ? P.base[2] : '#a09a8e');
      gw.put(SH.box, R3.mat(K.x0 + K.w / 2, K.y0 + h * 0.65, K.z0 + K.d / 2 + s / 2 + 0.04, 0, 0.3, 0.9, 0.08), '#2a3440');
    },
    mercado(g, gw, K) { stalls(K, 4); },
    feira(g, gw, K) { stalls(K, 3); },
    mercado_negro(g, gw, K) { stalls(K, 2, ['#3a3440', '#4a2a2a']); },
    doca(g, gw, K) {
      // the quay: planks out over the water on the side of the sea, on posts
      const b = K.b; const wd = b.wd || [0, 1]; const L = K.L; const sea = G.SEA * HM() + 0.5;
      const len = 2.6 * L; const x = K.w / 2 + wd[0] * (K.w / 2 + len / 2 - L * 0.3), z = K.d / 2 + wd[1] * (K.d / 2 + len / 2 - L * 0.3);
      const sx = wd[0] ? len : K.w * 0.6, sz = wd[1] ? len : K.d * 0.6;
      g.put(SH.box, R3.mat(K.x0 + x, sea, K.z0 + z, 0, sx, 0.3, sz), K.c('#8a6a44'));
      for (let k = 0; k < 4; k++) { const f = k / 3 - 0.5; g.put(SH.cyl, R3.mat(K.x0 + x + (wd[0] ? f * sx : sx / 2) * 1, sea - 3, K.z0 + z + (wd[1] ? f * sz : sz / 2), 0, 0.3, 3.2, 0.3), K.c('#6a4a2c')); }
      K.box(K.w / 2, 0, K.d / 2, K.w * 0.6, 2.2, K.d * 0.5, '#9a7a50');
    },
    mina(g, gw, K) { const P = K.P; K.sph(K.w / 2, -0.5, K.d / 2, K.w * 0.42, '#8c867a', 1.8); K.box(K.w / 2, 0, K.d - 0.6, 2.2, 2.4, 0.4, '#6a4a2c'); K.box(K.w / 2, 0, K.d - 0.55, 1.4, 1.9, 0.42, '#141414'); void P; },
    apiario(g, gw, K) { for (let k = 0; k < 4; k++) { const px = K.w * (0.25 + (k % 2) * 0.5), pz = K.d * (0.3 + Math.floor(k / 2) * 0.4); K.box(px, 0, pz, 0.15, 0.6, 0.15, '#6a4a2c'); K.box(px, 0.6, pz, 0.8, 0.7, 0.6, '#e8c870'); K.box(px, 1.3, pz, 0.95, 0.1, 0.75, '#8a6a44'); } },
    curral(g, gw, K) { fenceAround(K, 1.3, '#8a6a44', true); },
    estabulo(g, gw, K) { house(g, gw, K, { h: 3.4, inset: 0.6, wall: '#8a5a3a' }); },
    cercado(g, gw, K) { fenceAround(K, 1.6, '#6a5a44', true); },
    farm(g, gw, K) { fields(K, '#d4ac44', '#6a9a3a'); },
    horta(g, gw, K) { fields(K, '#7aaa4a', '#4a8a2a', true); },
    plantacao(g, gw, K) { fields(K, '#c8b84a', '#5a8a2a'); },
    vinhedo(g, gw, K) { for (let r = 0; r < K.b.h * 2; r++) { const z = (r + 0.5) * K.d / (K.b.h * 2); K.box(K.w / 2, 0, z, K.w - 0.8, 1.5, 0.35, '#4a7a2a'); K.box(0.4, 0, z, 0.12, 1.8, 0.12, '#6a4a2c'); K.box(K.w - 0.4, 0, z, 0.12, 1.8, 0.12, '#6a4a2c'); } },
    pomar(g, gw, K) { for (let k = 0; k < K.b.w * K.b.h; k++) { const px = ((k % K.b.w) + 0.5) * K.L, pz = (Math.floor(k / K.b.w) + 0.5) * K.L; K.cyl(px, 0, pz, 0.18, 1.6, '#6a4a2c'); K.sph(px, 2.6, pz, 1.2, '#4f8f36', 1.0); K.sph(px + 0.6, 2.3, pz + 0.3, 0.2, '#d23a2a'); } },
    well(g, gw, K) {
      const P = K.P; const x = K.w / 2, z = K.d / 2;
      K.cyl(x, 0, z, 0.8, 0.85, P.base ? P.base[2] : '#a09a8e'); K.cyl(x, 0.82, z, 0.62, 0.05, '#2a5a7a');
      for (const s of [-1, 1]) K.box(x + s * 0.75, 0.8, z, 0.12, 1.5, 0.12, '#6a4a2c');
      K.gable(x, 2.2, z, 2, 0.6, 1.4, (P.roof && P.roof[0]) || '#b85a3c');
    },
    campfire(g, gw, K) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; K.sph(K.w / 2 + Math.cos(a) * 0.7, 0.1, K.d / 2 + Math.sin(a) * 0.7, 0.22, '#6a6a66'); } for (let k = 0; k < 3; k++) g.put(SH.cyl, R3.mat(K.x0 + K.w / 2, K.y0 + 0.2, K.z0 + K.d / 2, k * 1.05, 0.16, 1.1, 0.16, 0, Math.PI / 2), K.c('#5a3a24')); },
    cemetery(g, gw, K) {
      fenceAround(K, 1, '#5a4a3a', true);
      const n = Math.min(12, (K.b.graves || []).length);
      for (let k = 0; k < n; k++) { const px = 1 + (k % 4) * (K.w - 2) / 3.2, pz = 1.2 + Math.floor(k / 4) * (K.d - 2.4) / 2.5; K.box(px, 0, pz, 0.6, 0.8, 0.18, '#9a968e'); K.box(px, 0, pz + 0.7, 0.6, 0.06, 1.2, '#6a5a44'); }
    },
    praca(g, gw, K) {
      const P = K.P; K.box(K.w / 2, -0.05, K.d / 2, K.w - 0.2, 0.15, K.d - 0.2, P.base ? P.base[2] : '#a09a8e');
      K.cyl(K.w / 2, 0.1, K.d / 2, 1.4, 0.6, P.base ? P.base[0] : '#8a8478'); K.cyl(K.w / 2, 0.68, K.d / 2, 1.1, 0.04, '#3a8ab0'); K.cyl(K.w / 2, 0.1, K.d / 2, 0.25, 1.8, P.wl);
    },
    aqueduto(g, gw, K) { const P = K.P; K.box(K.w / 2, 0, K.d / 2, K.w - 0.6, 4.5, K.d - 0.6, P.base ? P.base[2] : '#a09a8e'); K.box(K.w / 2, 4.5, K.d / 2, K.w - 0.2, 0.4, K.d - 0.2, '#3a8ab0'); },
    ruin(g, gw, K) { const P = K.P; for (let k = 0; k < 5; k++) { const h = 0.6 + G.hash(K.b.id * 7 + k) * 2.4; const px = 0.6 + G.hash(K.b.id + k * 3) * (K.w - 1.2), pz = 0.6 + G.hash(K.b.id * 3 + k) * (K.d - 1.2); K.box(px, 0, pz, 1.2, h, 0.5, dim(P.wl || '#efe2c4', 0.7), G.hash(k) * 3); } },
  };
  // stalls of a market: tables under coloured awnings, goods on them
  function stalls(K, n, cols) {
    const cl = cols || ['#c8483a', '#3f6fb0', '#e8b83a', '#4a9a5a'];
    for (let k = 0; k < n; k++) {
      const px = K.w * ((k % 2) * 0.5 + 0.25), pz = K.d * (Math.floor(k / 2) * 0.5 + 0.25);
      K.box(px, 0, pz, 1.8, 0.85, 1, '#8a6a44');
      for (const [sx, sz] of [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]]) K.box(px + sx, 0, pz + sz, 0.08, 2.3, 0.08, '#6a4a2c');
      K.gable(px, 2.2, pz, 2.2, 0.6, 1.4, cl[k % cl.length]);
      for (let q = 0; q < 3; q++) K.sph(px - 0.5 + q * 0.5, 1, pz, 0.18, ['#e85a3a', '#f2c14e', '#7ab84a'][q]);
    }
  }
  // the rows of a field, each tile with its own crop at its own stage (the world's crops)
  function fields(K, ripe, green, small) {
    const b = K.b; const L = K.L;
    for (let ty = 0; ty < b.h; ty++) for (let tx = 0; tx < b.w; tx++) {
      const k = ty * b.w + tx; const c = b.crops && b.crops[k]; const st = c ? c.s : 1; const gr = c ? G.clamp(c.g || 0, 0, 1) : 0.5;
      const px = tx * L, pz = ty * L; const gy = (W.hAt(b.x + tx + 0.5, b.y + ty + 0.5) * HM()) - K.y0;
      if (!st) continue; // (bare earth: just ploughed, or harvested)
      const h = (small ? 0.35 : 0.5) + gr * (small ? 0.4 : 0.9); const col = G.lerpColor(G.hex2rgb(green), G.hex2rgb(ripe), G.clamp((gr - 0.6) * 2.5, 0, 1));
      for (let r = 0; r < 3; r++) K.box(px + L / 2, gy, pz + (r + 0.5) * L / 3, L * 0.86, h, 0.42, col);
    }
  }

  // ------------------------------ walls, gates, aqueducts ------------------------------
  // the stones of one wall tile, as boxes [x, base, z, width, height, depth, colour] (metres): the drawing puts them,
  // the camera asks them — one shape for both, so the eye goes through a gate's passage the body walks through
  function wallBoxes(x, y) {
    const S = G.S; const L = TL(); const H = HM(); const i = y * N + x; const w = S.wall[i]; if (!w || w === 3) return null;
    const gy = W.hAt(x + 0.5, y + 0.5) * H; const col = '#9a948a'; const out = [];
    const nb = (dx, dy) => W.inb(x + dx, y + dy) && S.wall[(y + dy) * N + x + dx] && S.wall[(y + dy) * N + x + dx] !== 3;
    const E = nb(1, 0), Wn = nb(-1, 0), S2 = nb(0, 1), Nn = nb(0, -1);
    const cx = (x + 0.5) * L, cz = (y + 0.5) * L;
    if (w === 2 || w === 4) {
      // a gate: two piers, the lintel, the doors (shut, or open against the walls)
      const alongX = E || Wn;
      for (const s of [-1, 1]) out.push([cx + (alongX ? s * 1.5 : 0), gy - 0.5, cz + (alongX ? 0 : s * 1.5), alongX ? 1 : 1.8, 7, alongX ? 1.8 : 1, col]);
      out.push([cx, gy + 4.6, cz, alongX ? 4 : 1.8, 1.4, alongX ? 1.8 : 4, col]);
      if (w === 4) out.push([cx, gy, cz, alongX ? 2.2 : 0.3, 4.4, alongX ? 0.3 : 2.2, '#6a4a2c']);
      return out;
    }
    out.push([cx, gy - 0.5, cz, 1.6, 5.5, 1.6, col]);
    if (E) out.push([cx + L / 4, gy - 0.5, cz, L / 2, 5.5, 1.4, col]);
    if (Wn) out.push([cx - L / 4, gy - 0.5, cz, L / 2, 5.5, 1.4, col]);
    if (S2) out.push([cx, gy - 0.5, cz + L / 4, 1.4, 5.5, L / 2, col]);
    if (Nn) out.push([cx, gy - 0.5, cz - L / 4, 1.4, 5.5, L / 2, col]);
    // (the battlements)
    for (let k = 0; k < 2; k++) out.push([cx + (k ? 0.5 : -0.5), gy + 5, cz, 0.5, 0.7, 1.7, '#8a847a']);
    return out;
  }
  function wallsInto(g, x0, y0, n) {
    const S = G.S; const L = TL(); const H = HM();
    for (let y = y0; y < y0 + n; y++) for (let x = x0; x < x0 + n; x++) {
      if (!W.inb(x, y)) continue; const bs = wallBoxes(x, y); if (!bs) continue;
      for (const q of bs) g.put(SH.box, R3.mat(q[0], q[1], q[2], 0, q[3], q[4], q[5]), q[6]);
    }
    for (const a of S.aqueducts || []) for (let k = 0; k < a.built; k++) {
      const [x, y] = a.tiles[k]; if (x < x0 || y < y0 || x >= x0 + n || y >= y0 + n) continue;
      const i = y * N + x; if (S.occ[i]) { const ob = S.buildings.get(S.occ[i]); if (ob && ob.blocks) continue; }
      const gy = W.hAt(x + 0.5, y + 0.5) * H; const cx = (x + 0.5) * L, cz = (y + 0.5) * L;
      for (const s of [-1, 1]) g.put(SH.box, R3.mat(cx + s * 1.4, gy - 0.5, cz, 0, 0.9, 7.5, 0.9), '#b0a898');
      g.put(SH.box, R3.mat(cx, gy + 6.2, cz, 0, L, 1.1, 1.3), '#a8a090'); g.put(SH.box, R3.mat(cx, gy + 7.3, cz, 0, L, 0.15, 0.8), '#3a8ab0');
    }
  }

  // ------------------------------ a chunk's buildings ------------------------------
  const inChunk = (b, x0, y0, n) => b.x >= x0 && b.y >= y0 && b.x < x0 + n && b.y < y0 + n;
  B3.sig = function (x0, y0, n) {
    let s = 0;
    for (const b of G.S.buildings.values()) { if (!inChunk(b, x0, y0, n)) continue; s = (s * 31 + b.id * 7 + (b.built ? 1 : 0) + Math.floor((b.progress || 0) * 5) * 3 + Math.floor((b.hp / (b.maxHp || 1)) * 4) * 11 + (b.crops ? b.crops.reduce((a, c) => a + c.s + Math.floor((c.g || 0) * 3), 0) : 0) * 13 + (b.graves ? b.graves.length : 0) * 17) | 0; }
    // (the arches standing in this chunk: one built across the map does not change it)
    for (const a of G.S.aqueducts || []) for (let k = 0; k < a.built; k++) { const t = a.tiles[k]; if (t[0] >= x0 && t[1] >= y0 && t[0] < x0 + n && t[1] < y0 + n) s = (s + (k + 1) * 23 + (a.dead ? 5 : 0)) | 0; }
    return s;
  };
  B3.nearGeo = function (x0, y0, n) {
    const g = R3.Geo(), gw = R3.Geo();
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const K = kit(g, b); const f = KIT[b.type];
      if (f) f(g, gw, K); else house(g, gw, K);
    }
    wallsInto(g, x0, y0, n);
    return { solid: g.empty ? null : g.build(), glass: gw.empty ? null : gw.build() };
  };
  // the far picture: a block and a roof for each house, the height of what it is
  B3.farGeo = function (x0, y0, n) {
    const g = R3.Geo(); const L = TL();
    for (const b of G.S.buildings.values()) {
      if (!inChunk(b, x0, y0, n)) continue;
      const P = palOf(b); const h = (HEIGHT[b.type] || 5) * (b.built ? 1 : 0.4); if (h < 1.5) continue;
      const X = (b.x + b.w / 2) * L, Z = (b.y + b.h / 2) * L, Y = W.maxH(b.x, b.y, b.w, b.h) * HM();
      g.put(SH.box, R3.mat(X, Y - 0.3, Z, 0, b.w * L * 0.85, h * 0.75, b.h * L * 0.85), P.wl || '#efe2c4');
      g.put(SH.hip, R3.mat(X, Y + h * 0.75 - 0.3, Z, 0, b.w * L * 0.9, h * 0.3, b.h * L * 0.9), (P.roof && P.roof[0]) || '#b85a3c');
    }
    return g.empty ? null : g.build();
  };
  // the box a building's 3D body fills, in metres (the tests ask: does it stand where the world says, on the ground?)
  B3.bounds = function (b) {
    const g = R3.Geo(), gw = R3.Geo(); const K = kit(g, b); const f = KIT[b.type]; if (f) f(g, gw, K); else house(g, gw, K);
    const P = g.p; if (!P.length) return null; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let k = 0; k < P.length; k += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], P[k + a]); hi[a] = Math.max(hi[a], P[k + a]); }
    return { lo, hi, floor: K.y0, ground: [K.lo, K.hi] };
  };
  // what stands on a tile, and how high (for the camera, so it does not go through roofs)
  B3.heightAt = function (i) { const S = G.S; const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && b.blocks) return HEIGHT[b.type] || 5; const w = S.wall[i]; return w === 1 || w === 2 || w === 4 ? 6 : 0; };
  // is a point (metres) in the stones of a wall or a gate, give or take m? (no wall here: false)
  B3.wallSolid = function (X, Y, Z, m) {
    const x = Math.floor(X / TL()), y = Math.floor(Z / TL()); if (!W.inb(x, y)) return false; const bs = wallBoxes(x, y); if (!bs) return false;
    for (const q of bs) if (Math.abs(X - q[0]) < q[3] / 2 + m && Math.abs(Z - q[2]) < q[5] / 2 + m && Y > q[1] - m && Y < q[1] + q[4] + m) return true;
    return false;
  };
})(window.G);
