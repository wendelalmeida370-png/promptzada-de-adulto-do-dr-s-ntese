'use strict';
// ============================================================
//  City art: the workplaces of the economy in every culture's
//  style — butcher, weavers, mine, forge, goldsmith, potter,
//  tavern, the administration, the tax office, the smugglers'
//  shack and the golden statue of the god. Pens with real
//  fences, fair stalls that open in the morning, ore veins.
// ============================================================
(function (G) {
  const A = G.Arch; const K = A.kit();
  const { P, poly, ln, walls, box, onL, onR, shade, roof, colonnade, steps, flag, palm, jar, barrel, statue, dome, band, winsL, winsR, gableX, TAU } = K;
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const W = G.W;

  const CLOTHS = {
    classico: ['#c8483a', '#3f7fd8', '#e8b83a', '#f4efe3'], grego: ['#3f6fb0', '#f4efe3', '#c8683f', '#e8d8a8'], romano: ['#a8322a', '#6a2a5a', '#efe2c4', '#d8a63a'],
    egipcio: ['#f6f1e2', '#efe6cf', '#2f8f8a', '#e8b83a'], asteca: ['#b33a2a', '#2fae8f', '#e8b83a', '#f1e9d6'], nordico: ['#8a3a2a', '#7a6a4a', '#c8b890', '#4a6a3a'],
  };
  const cloths = st => CLOTHS[st] || CLOTHS.classico;

  // a small house of the culture: walls, door, windows, roof — any footprint, any culture
  function house(c, m, p, st, x0, y0, x1, y1, H, o) {
    o = o || {};
    const z0 = o.plinth !== undefined ? o.plinth : 1.5;
    box(c, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, 0, z0, p.base[0], p.base[1], p.base[2]);
    walls(c, x0, y0, x1, y1, z0, H, p.wl, p.wr, st === 'egipcio' ? 0.03 : 0);
    if (st === 'nordico') { c.strokeStyle = 'rgba(30,20,10,0.3)'; c.lineWidth = 0.35; for (let k = 1; k < 8; k++) { const f = x0 + (x1 - x0) * k / 8; ln(c, P(f, y1, z0), P(f, y1, H), 'rgba(30,20,10,0.3)', 0.35); const g = y0 + (y1 - y0) * k / 8; ln(c, P(x1, g, z0), P(x1, g, H), 'rgba(30,20,10,0.3)', 0.35); } }
    if (o.door !== false) { const dx = o.doorX !== undefined ? o.doorX : (x0 + x1) / 2; onL(c, y1, dx - 0.1, dx + 0.1, z0, z0 + Math.min(8, (H - z0) * 0.72), p.door); }
    if (o.win !== false) {
      winsL(c, m, p, y1, x0, x1, z0 + (H - z0) * 0.52, 2.6, Math.max(1, Math.round((x1 - x0) * 1.6)));
      winsR(c, m, p, x1, y0, y1, z0 + (H - z0) * 0.52, 2.6, Math.max(1, Math.round((y1 - y0) * 1.6)));
    }
    if (st === 'egipcio' || st === 'asteca') {
      band(c, x0, y0, x1, y1, H - 2, H - 0.9, p.trim);
      if (p.trim2) band(c, x0, y0, x1, y1, H - 3, H - 2.2, p.trim2);
      return roof(c, m, p, x0, y0, x1, y1, H, { par: 1.2 });
    }
    if (st === 'nordico') return roof(c, m, p, x0, y0, x1, y1, H, { kind: 'turf', rh: o.rh, alongY: o.alongY });
    return roof(c, m, p, x0, y0, x1, y1, H, { rh: o.rh, alongY: o.alongY, kind: o.kind });
  }
  // a roof on four posts, open on the sides (sheds, looms, the smithy's work floor)
  function shed(c, p, st, x0, y0, x1, y1, H, col) {
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) box(c, x - 0.03, y - 0.03, x + 0.03, y + 0.03, 0, H, '#6e4a2c', '#553820', '#6e4a2c');
    const r = col || (st === 'nordico' ? '#5a7631' : st === 'egipcio' || st === 'asteca' ? (p.thatch ? p.thatch[0] : '#caa85c') : p.roof[0]);
    poly(c, [P(x0 - 0.06, y0 - 0.06, H + 2), P(x1 + 0.06, y0 - 0.06, H + 1), P(x1 + 0.06, y1 + 0.06, H - 0.6), P(x0 - 0.06, y1 + 0.06, H + 0.4)], r, shade(r, 0.7), 0.4);
    poly(c, [P(x0 - 0.06, y1 + 0.06, H + 0.4), P(x1 + 0.06, y1 + 0.06, H - 0.6), P(x1 + 0.06, y1 + 0.06, H - 1.4), P(x0 - 0.06, y1 + 0.06, H - 0.4)], shade(r, 0.75));
  }
  function crate(c, x, y, z, s, col) { box(c, x - 0.07 * s, y - 0.07 * s, x + 0.07 * s, y + 0.07 * s, z, z + 3 * s, col || '#8a6a44', shade(col || '#8a6a44', 0.78), shade(col || '#8a6a44', 1.12)); }
  function sign(c, x, y, z, col, draw) {
    const a = P(x, y, z); ln(c, a, [a[0] + 4, a[1] - 1], '#4a3422', 0.7);
    ln(c, [a[0] + 3.2, a[1] - 0.8], [a[0] + 3.2, a[1] + 1.2], '#4a3422', 0.4);
    c.fillStyle = col; c.fillRect(a[0] + 1.6, a[1] + 1.2, 3.4, 2.8); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.3; c.strokeRect(a[0] + 1.6, a[1] + 1.2, 3.4, 2.8);
    if (draw) draw(a[0] + 3.3, a[1] + 2.6);
  }
  function bench(c, x0, y, x1, z) { box(c, x0, y - 0.05, x1, y + 0.05, z + 1.4, z + 2, '#7a5a3a', '#5a4028', '#8a6a44'); for (const x of [x0 + 0.03, x1 - 0.03]) ln(c, P(x, y, z), P(x, y, z + 1.4), '#5a4028', 0.6); }

  // ------------------------------ the workplaces ------------------------------
  const EXT = A.EXT;
  // Açougue: hams on the rack, the block, a red awning
  EXT.acougue = {
    maxz: 34, draw(c, m, p, st) {
      house(c, m, p, st, -0.42, -0.42, 0.12, 0.3, 11, { doorX: -0.16 });
      box(c, 0.2, -0.3, 0.44, 0.3, 0, 2.8, '#9a7a52', '#7a5a3a', '#b8946a');
      for (const y of [-0.34, 0.34]) ln(c, P(0.42, y, 0), P(0.42, y, 10), '#5a3c22', 0.7);
      ln(c, P(0.42, -0.34, 9.5), P(0.42, 0.34, 9.5), '#5a3c22', 0.6);
      for (let k = 0; k < 4; k++) { const q = P(0.42, -0.24 + k * 0.16, 9.5); ln(c, q, [q[0], q[1] + 1.2], '#3a2a1a', 0.3); c.fillStyle = k % 2 ? '#a8423a' : '#c8625a'; c.beginPath(); c.ellipse(q[0], q[1] + 3, 1.1, 1.9, 0, 0, TAU); c.fill(); c.fillStyle = '#f4e6d8'; c.fillRect(q[0] - 0.3, q[1] + 1.1, 0.6, 0.6); }
      const aw = st === 'nordico' ? '#8a3a2a' : st === 'egipcio' ? '#f1ead6' : '#b83a2a';
      poly(c, [P(0.12, -0.36, 11.5), P(0.12, 0.34, 11.5), P(0.5, 0.34, 9), P(0.5, -0.36, 9)], aw, shade(aw, 0.7), 0.4);
      const q = P(0.3, 0.12, 2.8); c.fillStyle = '#6a4a30'; c.fillRect(q[0] - 1.4, q[1] - 1.2, 2.8, 1.2); c.strokeStyle = '#c4c8d0'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(q[0] + 0.4, q[1] - 1.2); c.lineTo(q[0] + 1.6, q[1] - 3); c.stroke();
      return 20;
    },
  };
  // Tecelagem: a house, an open shed with the loom, dyed cloth drying on lines
  EXT.tecelagem = {
    maxz: 44, draw(c, m, p, st) {
      const C = cloths(st);
      house(c, m, p, st, -0.92, -0.92, 0.12, 0.05, 14, { doorX: -0.4 });
      shed(c, p, st, 0.3, -0.75, 0.92, 0.2, 10);
      // the loom: two uprights, beams, the warp in colour
      const a = P(0.45, -0.2, 0), b = P(0.8, -0.2, 0);
      ln(c, a, [a[0], a[1] - 7], '#6a4a2c', 0.7); ln(c, b, [b[0], b[1] - 7], '#6a4a2c', 0.7);
      ln(c, [a[0], a[1] - 6.6], [b[0], b[1] - 6.6], '#6a4a2c', 0.8); ln(c, [a[0], a[1] - 2], [b[0], b[1] - 2], '#6a4a2c', 0.8);
      for (let k = 1; k < 8; k++) { const f = k / 8; ln(c, [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f - 6.4], [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f - 2.2], C[k % 2 ? 0 : 1], 0.35); }
      c.fillStyle = C[0]; c.globalAlpha = 0.85; c.beginPath(); c.moveTo(a[0], a[1] - 2.2); c.lineTo(b[0], b[1] - 2.2); c.lineTo(b[0], b[1] - 4); c.lineTo(a[0], a[1] - 4); c.fill(); c.globalAlpha = 1;
      // drying lines in front
      for (const [y, x0, x1] of [[0.45, -0.85, 0.05], [0.8, -0.7, 0.55]]) {
        ln(c, P(x0, y, 0), P(x0, y, 9), '#6a4a2c', 0.6); ln(c, P(x1, y, 0), P(x1, y, 9), '#6a4a2c', 0.6);
        ln(c, P(x0, y, 8.6), P(x1, y, 8.6), 'rgba(60,40,20,0.6)', 0.3);
        const n = Math.max(2, Math.round((x1 - x0) * 4));
        for (let k = 0; k < n; k++) { const xa = x0 + (x1 - x0) * (k + 0.15) / n, xb = x0 + (x1 - x0) * (k + 0.85) / n; const col = C[(k + (y > 0.6 ? 1 : 0)) % C.length]; poly(c, [P(xa, y, 8.6), P(xb, y, 8.6), P(xb, y, 3.2 + (k % 2)), P(xa, y, 3.6)], col, shade(col, 0.8), 0.3); }
      }
      // bales of wool
      for (let k = 0; k < 3; k++) { const q = P(0.55 + k * 0.12, 0.55, 0); c.fillStyle = '#efe9da'; c.beginPath(); c.ellipse(q[0], q[1] - 1.6, 2, 1.6, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,0.1)'; c.beginPath(); c.ellipse(q[0] + 0.6, q[1] - 1.3, 1.2, 1.2, 0, 0, TAU); c.fill(); }
      return 26;
    },
  };
  // Mina: a rocky hill with a timbered adit, rails, a cart of ore, the spoil heap
  EXT.mina = {
    maxz: 34, draw(c, m, p, st, v) {
      const gold = v === 1;
      const b0 = P(0, 0, 0);
      c.fillStyle = 'rgba(80,70,60,0.35)'; c.beginPath(); c.ellipse(b0[0], b0[1], 17, 8.4, 0, 0, TAU); c.fill();
      dome(c, b0[0] - 1, b0[1] - 1, 14, 20, '#948a7c', '#62594f', null);
      // rock facets and strata
      const r = G.mulberry32(gold ? 77 : 33);
      for (let k = 0; k < 9; k++) { const x = b0[0] - 10 + r() * 18, y = b0[1] - 4 - r() * 13; c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3 + r() * 3, y - 1.5); c.lineTo(x + 4, y + 1.8); c.closePath(); c.fill(); }
      for (let k = 0; k < 7; k++) { const x = b0[0] - 9 + r() * 16, y = b0[1] - 5 - r() * 11; c.fillStyle = gold ? '#f2c14e' : '#a8522e'; c.fillRect(x, y, 1.6, 0.9); if (gold) m.glow.push([x + 0.8, y + 0.4]); }
      // adit
      const d = P(0.1, 0.38, 0);
      c.fillStyle = '#16100c'; c.beginPath(); c.moveTo(d[0] - 3.4, d[1]); c.lineTo(d[0] - 3.4, d[1] - 6); c.quadraticCurveTo(d[0], d[1] - 8.4, d[0] + 3.4, d[1] - 6); c.lineTo(d[0] + 3.4, d[1]); c.fill();
      c.strokeStyle = '#6e4a2c'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(d[0] - 3.6, d[1] + 0.2); c.lineTo(d[0] - 3.6, d[1] - 7); c.lineTo(d[0] + 3.6, d[1] - 7); c.lineTo(d[0] + 3.6, d[1] + 0.2); c.stroke();
      m.fires.push([d[0] + 4.6, d[1] - 6]); // the lantern at the mouth
      c.fillStyle = '#3a2a1a'; c.fillRect(d[0] + 4.2, d[1] - 6.6, 0.8, 1.2);
      // rails and the cart
      ln(c, [d[0] - 1.6, d[1]], P(0.3, 0.72, 0), '#5a4a3a', 0.5); ln(c, [d[0] + 1.6, d[1]], P(0.55, 0.62, 0), '#5a4a3a', 0.5);
      const q = P(0.4, 0.62, 0);
      c.fillStyle = '#5a4030'; c.beginPath(); c.moveTo(q[0] - 3, q[1] - 4); c.lineTo(q[0] + 3, q[1] - 4); c.lineTo(q[0] + 2.2, q[1] - 1.2); c.lineTo(q[0] - 2.2, q[1] - 1.2); c.fill();
      c.fillStyle = '#2a2420'; c.beginPath(); c.arc(q[0] - 1.6, q[1] - 0.8, 0.9, 0, TAU); c.arc(q[0] + 1.6, q[1] - 0.8, 0.9, 0, TAU); c.fill();
      c.fillStyle = gold ? '#d8b04a' : '#8a5a42'; c.beginPath(); c.ellipse(q[0], q[1] - 4.2, 2.8, 1.3, 0, 0, TAU); c.fill();
      // spoil heap
      const s = P(0.45, -0.1, 0); c.fillStyle = '#8a8276'; c.beginPath(); c.moveTo(s[0] - 6, s[1] + 1); c.quadraticCurveTo(s[0], s[1] - 6, s[0] + 6, s[1] + 1); c.fill();
      return 24;
    },
  };
  // Forja: stone smithy, tall chimney, open work floor with hearth, anvil, rack of weapons
  EXT.forja = {
    maxz: 54, draw(c, m, p, st) {
      const stone = st === 'nordico' ? ['#7c766a', '#5f5a50', '#8e877b'] : [p.base[0], p.base[1], p.base[2]];
      house(c, m, p, st, -0.92, -0.92, 0.05, 0.1, 13, { doorX: -0.45 });
      box(c, -0.8, -0.8, -0.52, -0.52, 0, 34, stone[0], stone[1], stone[2]);
      box(c, -0.84, -0.84, -0.48, -0.48, 34, 35.5, shade(stone[0], 0.9), shade(stone[1], 0.9), '#2a2420');
      m.fires.push(P(-0.66, -0.66, 36));
      shed(c, p, st, 0.18, -0.8, 0.94, 0.9, 11);
      // hearth with its glow, bellows, anvil, quench barrel
      box(c, 0.3, -0.6, 0.62, -0.3, 0, 4.5, stone[0], stone[1], '#3a2a22');
      c.fillStyle = '#ff9a3a'; const h = P(0.46, -0.45, 4.6); c.beginPath(); c.ellipse(h[0], h[1], 3.4, 1.5, 0, 0, TAU); c.fill(); m.glow.push(h);
      const bl = P(0.72, -0.5, 2); c.fillStyle = '#6a4a30'; c.beginPath(); c.moveTo(bl[0] - 2, bl[1]); c.lineTo(bl[0] + 2.6, bl[1] - 1.4); c.lineTo(bl[0] + 2.6, bl[1] + 1); c.fill();
      const an = P(0.55, 0.15, 0); c.fillStyle = '#5a5046'; c.fillRect(an[0] - 1.2, an[1] - 3, 2.4, 3); c.fillStyle = '#3a3a40'; c.beginPath(); c.moveTo(an[0] - 3, an[1] - 4.4); c.lineTo(an[0] + 2.6, an[1] - 4.4); c.lineTo(an[0] + 3.6, an[1] - 3.6); c.lineTo(an[0] - 2, an[1] - 3); c.fill();
      const qb = P(0.82, 0.3, 0); barrel(c, qb[0], qb[1], 1);
      // weapons on the rack along the front
      ln(c, P(0.2, 0.86, 5.5), P(0.9, 0.86, 5.5), '#5a3c22', 0.6);
      for (let k = 0; k < 6; k++) { const q = P(0.26 + k * 0.12, 0.88, 0); const tip = [q[0], q[1] - 12]; ln(c, q, tip, '#7a5a3a', 0.55); c.fillStyle = '#c4c8d0'; c.beginPath(); if (k % 3 === 2) { c.fillRect(tip[0] - 0.4, tip[1], 0.8, 3.4); } else { c.moveTo(tip[0] - 0.7, tip[1] + 0.4); c.lineTo(tip[0], tip[1] - 2); c.lineTo(tip[0] + 0.7, tip[1] + 0.4); c.fill(); } }
      return 36;
    },
  };
  // Ourivesaria: a neat little shop with gold trim, a small kiln and a sign with a ring
  EXT.ourives = {
    maxz: 36, draw(c, m, p, st) {
      house(c, m, p, st, -0.42, -0.42, 0.22, 0.26, 12, { doorX: -0.12 });
      band(c, -0.42, -0.42, 0.22, 0.26, 9.4, 10.2, '#e8b83a');
      const k = P(0.36, -0.22, 0); dome(c, k[0], k[1], 3.4, 5, '#9a6a4a', '#6a4a30', null); c.fillStyle = '#ffb040'; c.beginPath(); c.arc(k[0] - 0.4, k[1] - 1.4, 1, 0, TAU); c.fill(); m.glow.push([k[0] - 0.4, k[1] - 1.6]);
      box(c, 0.28, 0.12, 0.46, 0.36, 0, 2.6, '#7a5a3a', '#5a4028', '#8a6a44');
      for (let q = 0; q < 3; q++) { const g = P(0.32 + q * 0.05, 0.22, 2.7); c.fillStyle = q === 1 ? '#6ad0e8' : '#f2c14e'; c.beginPath(); c.arc(g[0], g[1], 0.6, 0, TAU); c.fill(); m.glow.push(g); }
      sign(c, 0.22, 0.26, 10, '#3a2a1c', (x, y) => { c.strokeStyle = '#f2c14e'; c.lineWidth = 0.6; c.beginPath(); c.arc(x, y, 0.9, 0, TAU); c.stroke(); });
      return 22;
    },
  };
  // Olaria: potter's shed, beehive kiln, pots drying in rows, the wheel
  EXT.olaria = {
    maxz: 40, draw(c, m, p, st) {
      house(c, m, p, st, -0.92, -0.92, -0.05, -0.2, 11, { doorX: -0.5 });
      const k = P(0.5, -0.5, 0); dome(c, k[0], k[1], 9, 13, '#c07850', '#8a5034', '#6a3a24');
      c.fillStyle = '#2a1a12'; c.beginPath(); c.arc(k[0] - 2, k[1] - 2.4, 2.2, Math.PI, TAU); c.fill(); c.fillStyle = '#ff9a3a'; c.beginPath(); c.arc(k[0] - 2, k[1] - 2.2, 1.3, Math.PI, TAU); c.fill(); m.glow.push([k[0] - 2, k[1] - 3]);
      m.fires.push([k[0], k[1] - 14]);
      // the wheel and the potter's seat
      const w = P(-0.45, 0.35, 0); c.fillStyle = '#6a4a30'; c.fillRect(w[0] - 0.5, w[1] - 3, 1, 3); c.fillStyle = '#8a6a44'; c.beginPath(); c.ellipse(w[0], w[1] - 3.2, 2.6, 1.1, 0, 0, TAU); c.fill(); c.fillStyle = '#b8704a'; c.beginPath(); c.ellipse(w[0], w[1] - 4.4, 1.1, 1.3, 0, 0, TAU); c.fill();
      // boards of pots drying
      for (const y of [0.25, 0.65]) { box(c, 0.05, y - 0.08, 0.9, y + 0.08, 1.6, 2.2, '#8a6a44', '#6a4e30', '#9a7a52'); for (let q = 0; q < 5; q++) { const j = P(0.14 + q * 0.17, y, 2.2); jar(c, j[0], j[1], 0.75, q % 2 ? '#c8683a' : '#b85a30'); } }
      const pit = P(-0.6, 0.72, 0); c.fillStyle = '#8a5a3a'; c.beginPath(); c.ellipse(pit[0], pit[1], 5, 2.2, 0, 0, TAU); c.fill(); c.fillStyle = '#6a4028'; c.beginPath(); c.ellipse(pit[0] + 0.6, pit[1] - 0.2, 3, 1.2, 0, 0, TAU); c.fill();
      return 28;
    },
  };
  // Taverna: warm windows, a hanging sign with a cup, benches and barrels outside
  EXT.taverna = {
    maxz: 52, draw(c, m, p, st) {
      if (st === 'nordico') {
        // the mead hall
        house(c, m, p, st, -0.9, -0.8, 0.9, 0.28, 12, { rh: 16, doorX: 0 });
      } else house(c, m, p, st, -0.9, -0.9, 0.7, 0.3, 16, { doorX: -0.2 });
      sign(c, 0.7, 0.3, 11, st === 'nordico' ? '#5a3a22' : '#7a4a2a', (x, y) => { c.fillStyle = '#e8c24a'; c.fillRect(x - 0.8, y - 0.9, 1.4, 1.6); c.strokeStyle = '#e8c24a'; c.lineWidth = 0.4; c.beginPath(); c.arc(x + 0.8, y - 0.1, 0.5, -1.5, 1.5); c.stroke(); });
      bench(c, -0.7, 0.55, -0.05, 0); box(c, -0.65, 0.66, -0.1, 0.8, 2.4, 3, '#8a6a44', '#6a4e30', '#9a7a52'); bench(c, -0.7, 0.9, -0.05, 0);
      for (const [x, y] of [[0.3, 0.6], [0.48, 0.66], [0.39, 0.8]]) { const q = P(x, y, 0); barrel(c, q[0], q[1], 1.05); }
      const q = P(0.4, 0.7, 3.3); barrel(c, q[0], q[1] - 0.2, 0.9);
      if (st === 'grego' || st === 'romano') { const j = P(0.85, 0.45, 0); jar(c, j[0], j[1], 1.3, '#c87a4a'); }
      return 30;
    },
  };
  // Administração: each culture's seat of scribes and magistrates
  EXT.administracao = {
    maxz: 64, draw(c, m, p, st) {
      if (st === 'grego') { // bouleutérion
        const z0 = steps(c, p, 0.95, 2, 1.3, 0.06);
        walls(c, -0.8, -0.8, 0.8, 0.25, z0, 18, p.wl, p.wr);
        winsR(c, m, p, 0.8, -0.7, 0.2, 11, 3, 3);
        colonnade(c, p, -0.8, 0.4, 0.8, 0.72, z0, 18, 6, 0.04, 'L');
        box(c, -0.84, -0.84, 0.84, 0.76, 18, 20, p.col[0], p.col[1], p.col[0]); band(c, -0.84, -0.84, 0.84, 0.76, 18.6, 19.4, p.acc);
        gableX(c, -0.84, -0.84, 0.84, 0.76, 20, 28, 0.04, p.roof[0], p.roof[1], p.gable, p.roof[2]);
        return 30;
      }
      if (st === 'romano') { // basílica
        box(c, -0.95, -0.95, 0.95, 0.95, 0, 2.5, p.base[0], p.base[1], p.base[2]);
        walls(c, -0.85, -0.8, 0.85, 0.3, 2.5, 16, p.wl, p.wr); winsR(c, m, p, 0.85, -0.7, 0.2, 9, 3.5, 3); winsL(c, m, p, 0.3, -0.8, 0.85, 9, 3.5, 3);
        colonnade(c, p, -0.85, 0.45, 0.85, 0.78, 2.5, 16, 7, 0.045, 'L');
        box(c, -0.88, -0.83, 0.88, 0.82, 16, 17.6, p.col[0], p.col[1], p.col[0]);
        walls(c, -0.55, -0.6, 0.55, 0.2, 17.6, 23, p.wl, p.wr); winsL(c, m, p, 0.2, -0.55, 0.55, 19, 2.6, 4);
        roof(c, m, p, -0.55, -0.6, 0.55, 0.2, 23, { kind: 'gable', rh: 7 });
        const f = P(0.9, 0.9, 2.5); flag(c, f[0], f[1], '#8e2f2f', 14);
        return 32;
      }
      if (st === 'egipcio') { // casa do vizir: pylons flanking the gate
        const H = house(c, m, p, st, -0.85, -0.85, 0.85, 0.25, 14, { door: false });
        for (const x of [-0.7, 0.2]) { box(c, x, 0.3, x + 0.5, 0.75, 0, 20, p.wl, p.wr, p.top); band(c, x, 0.3, x + 0.5, 0.75, 17, 18.4, p.trim); onL(c, 0.75, x + 0.12, x + 0.38, 6, 14, 'rgba(47,143,138,0.35)'); }
        onL(c, 0.75, -0.2, 0.2, 0, 11, p.door);
        for (const x of [-0.6, 0.6]) { const f = P(x, 0.8, 20); flag(c, f[0], f[1], '#2f8f8a', 10); }
        return Math.max(H, 32);
      }
      if (st === 'asteca') { // tecpan on a low platform
        box(c, -0.95, -0.95, 0.95, 0.95, 0, 5, p.base[0], p.base[1], p.base[2]);
        band(c, -0.95, -0.95, 0.95, 0.95, 3.2, 4.2, p.trim);
        poly(c, [P(-0.25, 1.1, 0), P(0.25, 1.1, 0), P(0.25, 0.95, 5), P(-0.25, 0.95, 5)], shade(p.base[2], 1.05));
        const H = house(c, m, p, st, -0.8, -0.8, 0.8, 0.5, 18, { plinth: 5 });
        for (let k = 0; k < 7; k++) { const x = -0.78 + k * 0.26; box(c, x, 0.46, x + 0.1, 0.52, 18.6, 21, p.wl, p.wr, p.wl); }
        return Math.max(H, 26);
      }
      if (st === 'nordico') { // salão da assembleia (thing) with carved posts and a rune stone
        house(c, m, p, st, -0.9, -0.75, 0.9, 0.35, 11, { rh: 15 });
        for (const x of [-0.6, 0.6]) { box(c, x - 0.05, 0.42, x + 0.05, 0.52, 0, 12, '#6a4a30', '#4e3620', '#7a5a3a'); const t = P(x, 0.47, 12); c.fillStyle = '#a23c2a'; c.beginPath(); c.arc(t[0], t[1] - 1, 1.3, 0, TAU); c.fill(); }
        const s = P(0.6, 0.8, 0); c.fillStyle = '#8e877b'; c.beginPath(); c.moveTo(s[0] - 2.2, s[1]); c.lineTo(s[0] - 1.8, s[1] - 9); c.quadraticCurveTo(s[0], s[1] - 11, s[0] + 1.8, s[1] - 9); c.lineTo(s[0] + 2.2, s[1]); c.fill();
        c.strokeStyle = '#a23c2a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(s[0] - 1, s[1] - 7); c.quadraticCurveTo(s[0] + 1.2, s[1] - 5, s[0] - 0.6, s[1] - 2); c.stroke();
        return 30;
      }
      // classic: columns and a flag
      box(c, -0.95, -0.95, 0.95, 0.95, 0, 2, p.base[0], p.base[1], p.base[2]);
      walls(c, -0.8, -0.8, 0.8, 0.3, 2, 17, p.wl, p.wr); winsR(c, m, p, 0.8, -0.7, 0.2, 10, 3.2, 3);
      colonnade(c, p, -0.8, 0.45, 0.8, 0.75, 2, 17, 6, 0.045, 'L');
      box(c, -0.84, -0.84, 0.84, 0.8, 17, 18.6, p.col[0], p.col[1], p.col[0]);
      gableX(c, -0.84, -0.84, 0.84, 0.8, 18.6, 26, 0.04, p.roof[0], p.roof[1], p.gable, p.roof[2]);
      const f = P(0.9, 0.9, 2); flag(c, f[0], f[1], '#3f6fb0', 14);
      return 28;
    },
  };
  // Coletoria: squat stone strongroom, iron-banded door, a hanging coin
  EXT.coletoria = {
    maxz: 42, draw(c, m, p, st) {
      const stone = st === 'nordico' ? ['#8e877b', '#6e685e', '#a09a8e'] : [p.base[2], p.base[0], shade(p.base[2], 1.08)];
      box(c, -0.44, -0.44, 0.44, 0.44, 0, 2, p.base[0], p.base[1], p.base[2]);
      walls(c, -0.38, -0.38, 0.38, 0.38, 2, 17, stone[0], stone[1]);
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.35; for (let z = 4; z < 17; z += 2.6) { ln(c, P(-0.38, 0.38, z), P(0.38, 0.38, z), 'rgba(0,0,0,0.12)', 0.35); ln(c, P(0.38, 0.38, z), P(0.38, -0.38, z), 'rgba(0,0,0,0.12)', 0.35); }
      onL(c, 0.38, -0.12, 0.12, 2, 10, '#3a2618'); for (const z of [4, 7.4]) onL(c, 0.38, -0.12, 0.12, z, z + 0.6, '#5a5a62');
      onR(c, 0.38, -0.12, 0.02, 11, 13.4, '#1e1a16', m); for (let k = 0; k < 3; k++) ln(c, P(0.39, -0.1 + k * 0.05, 11), P(0.39, -0.1 + k * 0.05, 13.4), '#6a6a72', 0.35);
      const H = st === 'egipcio' || st === 'asteca' ? roof(c, m, p, -0.38, -0.38, 0.38, 0.38, 17, { par: 1.6 }) : st === 'nordico' ? roof(c, m, p, -0.38, -0.38, 0.38, 0.38, 17, { kind: 'turf' }) : roof(c, m, p, -0.38, -0.38, 0.38, 0.38, 17, { kind: 'hip', rh: 8 });
      sign(c, 0.38, 0.38, 13, '#3a2a1c', (x, y) => { c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(x, y, 1.1, 0, TAU); c.fill(); c.fillStyle = '#b8862a'; c.fillRect(x - 0.2, y - 0.6, 0.4, 1.2); });
      const ch = P(0.3, 0.6, 0); c.fillStyle = '#6a4a2a'; c.fillRect(ch[0] - 2, ch[1] - 2.4, 4, 2.4); c.fillStyle = '#8a6a3a'; c.fillRect(ch[0] - 2, ch[1] - 3.2, 4, 0.9); c.fillStyle = '#5a5a62'; c.fillRect(ch[0] - 0.4, ch[1] - 2.8, 0.8, 1);
      return H + 2;
    },
  };
  // Mercado clandestino: a leaning shack of scraps, a dark curtain, crates, one lantern
  EXT.mercado_negro = {
    maxz: 28, draw(c, m, p, st) {
      const wood = st === 'egipcio' || st === 'asteca' ? ['#a08a66', '#7e6a4c'] : ['#6a5440', '#4e3c2c'];
      box(c, -0.4, -0.4, 0.4, 0.4, 0, 0.6, '#5a5046', '#463e36', '#6a6056');
      walls(c, -0.34, -0.36, 0.26, 0.2, 0.6, 8, wood[0], wood[1]);
      onL(c, 0.2, -0.28, -0.12, 1.4, 4, '#8a7a5a'); onR(c, 0.26, -0.3, -0.05, 3, 6, '#5a6a4a'); // patches
      poly(c, [P(-0.42, -0.42, 11), P(0.34, -0.42, 10), P(0.34, 0.3, 7.2), P(-0.42, 0.3, 8)], '#5a4a3a', '#2a2018', 0.4);
      for (let k = 1; k < 5; k++) { const f = -0.42 + k * 0.15; ln(c, P(f, -0.42, 11 - k * 0.2), P(f, 0.3, 8 - k * 0.2), 'rgba(0,0,0,0.25)', 0.35); }
      // the curtain — dark cloth that hides who is inside
      poly(c, [P(0.26, -0.3, 7.6), P(0.26, 0.14, 7.2), P(0.5, 0.14, 1), P(0.5, -0.3, 1.2)], '#3a2440', '#1e1422', 0.4);
      crate(c, -0.2, 0.34, 0, 1, '#6a5238'); crate(c, 0.05, 0.36, 0, 0.9, '#5e4a34'); crate(c, -0.12, 0.34, 3, 0.8, '#7a6044');
      const l = P(0.28, 0.22, 7.4); ln(c, l, [l[0] + 2, l[1] - 1], '#2a2018', 0.5); c.fillStyle = '#3a2a1a'; c.fillRect(l[0] + 1.5, l[1] - 0.8, 1, 1.4); m.fires.push([l[0] + 2, l[1] - 0.6]);
      return 14;
    },
  };
  // Estátua de Ouro: the god in gold, on steps of stone
  EXT.estatua = {
    maxz: 66, draw(c, m, p, st) {
      box(c, -0.46, -0.46, 0.46, 0.46, 0, 2, p.base[0], p.base[1], p.base[2]);
      box(c, -0.34, -0.34, 0.34, 0.34, 2, 4, p.base[0], p.base[1], p.base[2]);
      box(c, -0.2, -0.2, 0.2, 0.2, 4, 11, p.col[0], p.col[1], p.col[0]);
      band(c, -0.2, -0.2, 0.2, 0.2, 9.6, 10.4, '#e8b83a');
      const G1 = '#f2c14e', G2 = '#c8962a';
      const b = P(0, 0, 11);
      if (st === 'asteca') { // the feathered serpent rising in coils
        c.fillStyle = G1; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(b[0], b[1] - 2 - k * 4, 6 - k * 1.2, 2.4, 0, 0, TAU); c.fill(); c.fillStyle = k % 2 ? G1 : G2; }
        c.fillStyle = G1; c.beginPath(); c.moveTo(b[0] - 2, b[1] - 12); c.quadraticCurveTo(b[0] - 1, b[1] - 22, b[0] + 3, b[1] - 22); c.lineTo(b[0] + 6, b[1] - 20); c.lineTo(b[0] + 2, b[1] - 18); c.quadraticCurveTo(b[0] + 1, b[1] - 15, b[0] + 2, b[1] - 12); c.fill();
        for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? '#2fae8f' : G1; c.beginPath(); c.ellipse(b[0] - 1 + k * 0.4, b[1] - 22 - k * 0.6, 0.8, 3, -0.8 + k * 0.4, 0, TAU); c.fill(); }
        c.fillStyle = '#b33a2a'; c.fillRect(b[0] + 3.6, b[1] - 21, 0.8, 0.8);
      } else if (st === 'egipcio') { // seated god with the nemes headdress
        c.fillStyle = G2; c.fillRect(b[0] - 3, b[1] - 8, 6, 8);
        c.fillStyle = G1; c.fillRect(b[0] - 2.2, b[1] - 16, 4.4, 8); c.beginPath(); c.arc(b[0], b[1] - 18, 2.2, 0, TAU); c.fill();
        c.fillStyle = '#2f5fae'; c.beginPath(); c.moveTo(b[0] - 3, b[1] - 15); c.lineTo(b[0] - 2.4, b[1] - 20.6); c.lineTo(b[0] + 2.4, b[1] - 20.6); c.lineTo(b[0] + 3, b[1] - 15); c.lineTo(b[0] + 1.8, b[1] - 17.6); c.lineTo(b[0] - 1.8, b[1] - 17.6); c.fill();
        c.fillStyle = G1; c.fillRect(b[0] + 2.2, b[1] - 14, 3.2, 1); c.fillRect(b[0] + 4.6, b[1] - 16.4, 0.8, 5); c.beginPath(); c.arc(b[0] + 5, b[1] - 17, 1, 0, TAU); c.fill();
      } else if (st === 'nordico') { // the high god with spear and ravens
        statue(c, 0, 0, 11, G1, 24, true);
        for (const s of [-1, 1]) { c.fillStyle = '#2a2a30'; c.beginPath(); c.ellipse(b[0] + s * 4, b[1] - 22, 1.4, 0.8, s * 0.3, 0, TAU); c.fill(); }
      } else statue(c, 0, 0, 11, G1, 26, true);
      m.glow.push([b[0], b[1] - 12], [b[0], b[1] - 20]);
      return 38;
    },
  };
  // (curral, estábulo and feira are open grounds: drawn by the hooks below)

  // mines sit on their vein: the sprite variant follows the metal
  const oldPlaced = G.Eco.onPlaced;
  G.Eco.onPlaced = function (b) { oldPlaced(b); if (b.type === 'mina') { const o = (G.S.ores || []).find(q => q.id === b.ore); b.v = o && o.kind === 'ouro' ? 1 : 0; } };

  // ------------------------------ open grounds ------------------------------
  const PEN = { curral: 1, estabulo: 1 };
  function rail(c, proj, x0, y0, x1, y1, cols, z) {
    const a = proj(x0, y0, W.hAt(x0, y0)), b = proj(x1, y1, W.hAt(x1, y1));
    c.strokeStyle = cols[0]; c.lineWidth = 0.9;
    for (const h of z) { c.beginPath(); c.moveTo(a[0], a[1] - h); c.lineTo(b[0], b[1] - h); c.stroke(); }
    c.fillStyle = cols[1]; c.fillRect(a[0] - 0.7, a[1] - 7.2, 1.4, 7.2); c.fillRect(b[0] - 0.7, b[1] - 7.2, 1.4, 7.2);
  }
  const FENCE = { curral: ['#8a6440', '#6a4a2c'], estabulo: ['#7a5634', '#5a3c22'] };
  const GATE = new Set();
  // the ground of every pen and fair, the veins in the rock
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ground.push(function (c, proj, view, t, nightF, diamond) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if (!PEN[b.type] && b.type !== 'feira') continue;
      if (!b.built) continue;
      const [cx, cy] = G.Village.center(b); const p = proj(cx, cy, 2);
      if (p[0] < view[0] - 80 || p[0] > view[2] + 80 || p[1] < view[1] - 60 || p[1] > view[3] + 80) continue;
      if (b.type === 'feira') {
        c.fillStyle = 'rgba(196,170,128,0.5)'; diamond(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05, 0.02); c.fill();
        c.fillStyle = 'rgba(232,200,120,0.35)'; for (let k = 0; k < 10; k++) { const x = b.x + 0.3 + G.hash(b.id + k) * (b.w - 0.6), y = b.y + 0.3 + G.hash(b.id * 3 + k) * (b.h - 0.6); const q = proj(x, y, W.hAt(x, y)); c.fillRect(q[0] - 1.5, q[1] - 0.3, 3, 0.6); }
        continue;
      }
      // trampled earth where the grass is eaten, green where it grows back
      const gr = G.Eco.penGrass ? G.Eco.penGrass(b) : 0.5;
      c.fillStyle = `rgba(${Math.round(120 - gr * 40)},${Math.round(94 + gr * 40)},${Math.round(60 + gr * 4)},0.45)`;
      diamond(b.x + 0.05, b.y + 0.05, b.x + b.w - 0.05, b.y + b.h - 0.05, 0.02); c.fill();
      // back fences (the front ones are sorted with the animals)
      const cols = FENCE[b.type];
      const x0 = b.x + 0.05, y0 = b.y + 0.05, x1 = b.x + b.w - 0.05, y1 = b.y + b.h - 0.05;
      for (const [ax, ay, bx, by] of G.Render.rectEdges(x0, y0, x1, y1).back) {
        const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay)));
        for (let k = 0; k < n; k++) rail(c, proj, ax + (bx - ax) * k / n, ay + (by - ay) * k / n, ax + (bx - ax) * (k + 1) / n, ay + (by - ay) * (k + 1) / n, cols, [3, 5.6]);
      }
      // the trough, with water — and hay when it was fed
      const tx = b.x + b.w - 0.45, ty = b.y + b.h / 2; const q = proj(tx, ty, W.hAt(tx, ty));
      c.fillStyle = '#6a4a2c'; c.beginPath(); c.moveTo(q[0] - 8, q[1] - 4); c.lineTo(q[0] + 4, q[1] + 2); c.lineTo(q[0] + 4, q[1] + 3.6); c.lineTo(q[0] - 8, q[1] - 2.4); c.fill();
      c.fillStyle = b.fedT > S.clock - 20 && b.fedT ? '#d8b862' : '#5aaed0'; c.beginPath(); c.moveTo(q[0] - 7.4, q[1] - 4.2); c.lineTo(q[0] + 3.4, q[1] + 1.2); c.lineTo(q[0] + 3.6, q[1] + 0.2); c.lineTo(q[0] - 7.2, q[1] - 5); c.fill();
    }
  });
  // sorted things: front fences in segments, sheds and stables, fair stalls, ore veins
  const segCache = new WeakMap();
  function segs(b) {
    const rv = G.Render.rot();
    let s = segCache.get(b); if (s && s.rot === rv) return s.list;
    const list = [];
    const x0 = b.x + 0.05, y0 = b.y + 0.05, x1 = b.x + b.w - 0.05, y1 = b.y + b.h - 0.05;
    // the fences facing the camera stand among the animals; the gate is always on the same side of the pen
    for (const [ax, ay, bx, by] of G.Render.rectEdges(x0, y0, x1, y1).front) {
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay))); const gateSide = ay === y1 && by === y1;
      for (let k = 0; k < n; k++) list.push({ b, fn: drawRailSeg, ax: ax + (bx - ax) * k / n, ay: ay + (by - ay) * k / n, bx: ax + (bx - ax) * (k + 1) / n, by: ay + (by - ay) * (k + 1) / n, gate: gateSide && k === Math.floor(n / 2) });
    }
    if (b.type === 'curral') list.push({ b, fn: drawShelter });
    if (b.type === 'estabulo') list.push({ b, fn: drawStable });
    segCache.set(b, { rot: rv, list }); return list;
  }
  function drawRailSeg(c, e, sx, sy) {
    const b = e.b; const cols = FENCE[b.type];
    const dx = (e.bx - e.ax), dy = (e.by - e.ay);
    const o = G.Render.off(dx, dy); const ex = o[0], ey = o[1] + (W.hAt(e.ax, e.ay) - W.hAt(e.bx, e.by)) * 4;
    // the gate stands open while the flock is out
    if (e.gate && G.Eco.penAnimals && G.Eco.penAnimals(b).some(a => a.state === 'herd' || a.state === 'led')) {
      c.fillStyle = cols[1]; c.fillRect(sx - 0.7, sy - 7.2, 1.4, 7.2); c.fillRect(sx + ex - 0.7, sy + ey - 7.2, 1.4, 7.2);
      c.strokeStyle = cols[0]; c.lineWidth = 0.9; c.beginPath(); c.moveTo(sx, sy - 3); c.lineTo(sx + 5, sy + 4 - 3); c.moveTo(sx, sy - 5.6); c.lineTo(sx + 5, sy + 4 - 5.6); c.stroke();
      return;
    }
    c.strokeStyle = cols[0]; c.lineWidth = 0.9; c.beginPath();
    for (const h of [3, 5.6]) { c.moveTo(sx, sy - h); c.lineTo(sx + ex, sy + ey - h); }
    c.stroke();
    c.fillStyle = cols[1]; c.fillRect(sx - 0.7, sy - 7.2, 1.4, 7.2); c.fillRect(sx + ex - 0.7, sy + ey - 7.2, 1.4, 7.2);
    if (e.gate) { c.strokeStyle = 'rgba(40,25,10,0.5)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(sx + 1, sy - 5.6); c.lineTo(sx + ex - 1, sy + ey - 3); c.stroke(); }
  }
  function shelterSpr(st) {
    const p = A.PAL[st] || A.PAL.classico;
    return G.Art.sprite('pen-shelter' + st, 70, 60, 35, 44, (c) => {
      const r = st === 'nordico' ? '#5a7631' : st === 'egipcio' || st === 'asteca' ? '#caa85c' : p.roof[0];
      for (const [x, y] of [[-0.45, -0.45], [0.35, -0.45], [-0.45, 0.35], [0.35, 0.35]]) box(c, x - 0.03, y - 0.03, x + 0.03, y + 0.03, 0, 9, '#6e4a2c', '#553820', '#6e4a2c');
      walls(c, -0.45, -0.48, 0.35, -0.42, 0, 9, '#8a6a44', '#6a4e30');
      poly(c, [P(-0.55, -0.55, 12), P(0.45, -0.55, 12), P(0.45, 0.45, 8), P(-0.55, 0.45, 8)], r, shade(r, 0.7), 0.4);
      poly(c, [P(-0.55, 0.45, 8), P(0.45, 0.45, 8), P(0.45, 0.45, 7.2), P(-0.55, 0.45, 7.2)], shade(r, 0.75));
      for (let k = 0; k < 3; k++) { const q = P(-0.3 + k * 0.2, -0.3, 0); c.fillStyle = '#d8b862'; c.beginPath(); c.ellipse(q[0], q[1] - 1.4, 2.6, 1.6, 0, 0, TAU); c.fill(); }
    });
  }
  function stableSpr(st) {
    const p = A.PAL[st] || A.PAL.classico;
    return G.Art.sprite('stable' + st, 130, 96, 65, 60, (c, m) => {
      // a long low stable along the back of the paddock, open stalls facing the yard
      const x0 = -1.45, x1 = 1.45, y0 = -0.45, y1 = 0.4;
      box(c, x0, y0, x1, y1, 0, 1, p.base[0], p.base[1], p.base[2]);
      walls(c, x0, y0, x1, y1, 1, 11, st === 'nordico' ? p.wl : '#9a7a52', st === 'nordico' ? p.wr : '#7a5c3a');
      for (let k = 0; k < 5; k++) { const a = x0 + 0.12 + k * 0.57; onL(c, y1, a, a + 0.4, 1, 8, '#2a1e14'); onL(c, y1, a, a + 0.4, 4, 4.6, '#8a6a44'); }
      if (st === 'nordico') roof(c, m, p, x0, y0, x1, y1, 11, { kind: 'turf', rh: 9 });
      else if (st === 'egipcio' || st === 'asteca') roof(c, m, p, x0, y0, x1, y1, 11, { par: 1 });
      else roof(c, m, p, x0, y0, x1, y1, 11, { rh: 8 });
      m.win.push([P(1.46, -0.1, 5), P(1.46, 0.1, 5), P(1.46, 0.1, 8), P(1.46, -0.1, 8)]);
    });
  }
  function drawShelter(c, e, sx, sy) { G.Art.drawM(c, shelterSpr(e.b.style || 'classico'), sx, sy, 1); }
  function drawStable(c, e, sx, sy) { G.Art.drawM(c, stableSpr(e.b.style || 'classico'), sx, sy, 1); }

  // the fair: four stalls, raised in the morning and taken down at noon
  const STALLS = [[0.8, 0.8], [2.2, 0.8], [0.8, 2.2], [2.2, 2.2]];
  G.Eco.STALLS = STALLS;
  G.Eco.stallSpot = (b, k, buyer) => { const s = STALLS[k % STALLS.length]; return buyer ? [b.x + s[0] + 0.42, b.y + s[1] + 0.38] : [b.x + s[0] - 0.3, b.y + s[1] - 0.25]; };
  const stallCache = new WeakMap();
  function stalls(b) { let s = stallCache.get(b); if (!s) { s = STALLS.map((q, k) => ({ b, k, fn: drawStall })); stallCache.set(b, s); } return s; }
  function stallSpr(st, k, open, goods) {
    const p = A.PAL[st] || A.PAL.classico; const C = cloths(st);
    return G.Art.sprite('stall' + st + k + (open ? 1 : 0) + goods, 56, 52, 28, 36, (c) => {
      const s = 0.28;
      for (const [dx, dy] of [[-s, -s], [s, -s], [s, s], [-s, s]]) ln(c, P(dx, dy, 0), P(dx, dy, open ? 9 : 6), '#6a4a2c', 0.7);
      box(c, -s, -s + 0.05, s, s, 2.6, 3.4, '#8a6a44', '#6a4e30', '#9a7a52');
      if (!open) { const q = P(0, 0, 3.4); c.fillStyle = C[k % C.length]; c.beginPath(); c.ellipse(q[0], q[1] - 1, 4, 1.4, 0, 0, TAU); c.fill(); return; }
      const c1 = C[k % C.length], c2 = C[(k + 1) % C.length];
      const tp = P(0, 0, 13);
      poly(c, [tp, P(-s - 0.06, s + 0.06, 9), P(s + 0.06, s + 0.06, 9)], c1, shade(c1, 0.7), 0.4);
      poly(c, [tp, P(s + 0.06, s + 0.06, 9), P(s + 0.06, -s - 0.06, 9)], shade(c2, 0.85), shade(c2, 0.6), 0.4);
      for (let q = 0; q < 4; q++) { const a = P(-s + 0.06 + q * 0.15, s + 0.06, 9); c.fillStyle = q % 2 ? c1 : c2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] + 2.4, a[1] + 1.2); c.lineTo(a[0] + 1.2, a[1] + 2.6); c.fill(); }
      // the goods on the counter
      const G0 = { food: ['#e05a3a', '#f0b040', '#6ab04a'], tecido: [C[0], C[1], C[2]], ceramica: ['#c8683a', '#b85a30', '#d8804a'], couro: ['#8a5a34', '#6a4428', '#9a6a44'] }[goods] || ['#e05a3a', '#f0b040', '#6ab04a'];
      for (let q = 0; q < 4; q++) { const g = P(-0.16 + q * 0.1, 0.06, 3.5); c.fillStyle = G0[q % 3]; if (goods === 'ceramica') jar(c, g[0], g[1] + 0.6, 0.55, G0[q % 3]); else if (goods === 'tecido' || goods === 'couro') c.fillRect(g[0] - 1.1, g[1] - 1.2, 2.2, 1.3); else { c.beginPath(); c.arc(g[0], g[1] - 0.6, 0.8, 0, TAU); c.fill(); } }
      void p;
    });
  }
  const GOODS_OF = ['food', 'tecido', 'ceramica', 'couro'];
  function drawStall(c, e, sx, sy) {
    const b = e.b; const S = G.S;
    const open = !!(b.openT && S.clock - b.openT < 6);
    const inv = b.inv || {}; let goods = GOODS_OF[e.k];
    if (!(inv[goods] >= 1)) goods = GOODS_OF.find(k => inv[k] >= 1) || 'food';
    G.Art.draw(c, stallSpr(b.style || 'classico', e.k, open, goods), sx, sy, 1);
  }

  // ore veins: the rocks where a mine could be dug
  function oreSpr(kind) {
    return G.Art.sprite('ore-' + kind, 56, 40, 28, 28, (c, m) => {
      const r = G.mulberry32(kind === 'ouro' ? 5 : 9);
      const rocks = [[-7, 0, 7], [4, 1, 6], [-1, -3, 8], [8, -2, 4.5], [-10, 3, 4]];
      for (const [x, y, s] of rocks) {
        c.fillStyle = '#7e776c'; c.beginPath(); c.moveTo(x - s, y + 2); c.lineTo(x - s * 0.7, y - s * 0.9); c.lineTo(x + s * 0.3, y - s * 1.2); c.lineTo(x + s, y - s * 0.3); c.lineTo(x + s * 0.8, y + 2); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.moveTo(x + s * 0.3, y - s * 1.2); c.lineTo(x + s, y - s * 0.3); c.lineTo(x + s * 0.8, y + 2); c.lineTo(x + s * 0.2, y + 2); c.closePath(); c.fill();
        for (let k = 0; k < 3; k++) { const px = x - s * 0.5 + r() * s, py = y - r() * s * 0.9; c.fillStyle = kind === 'ouro' ? '#f2c14e' : '#b0583a'; c.fillRect(px, py, 1.6, 0.8); if (kind === 'ouro') m.glow.push([px + 0.8, py + 0.4]); }
      }
    });
  }
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if (!b.built) continue;
      if (PEN[b.type]) {
        for (const e of segs(b)) {
          if (e.fn === drawRailSeg) add(e.ax + e.ay + (G.Render.depth(e.bx, e.by) - G.Render.depth(e.ax, e.ay) > 0 ? G.Render.depth(e.bx, e.by) - G.Render.depth(e.ax, e.ay) : 0) - 0.43, e, e.ax, e.ay);
          else if (e.fn === drawShelter) add(b.x + b.y + 1.05, e, b.x + 0.5, b.y + 0.5);
          else add(b.x + b.y + 1.9, e, b.x + b.w / 2, b.y + 0.5);
        }
      } else if (b.type === 'feira') {
        for (const e of stalls(b)) { const s = STALLS[e.k]; add(b.x + s[0] + b.y + s[1] + 0.3, e, b.x + s[0], b.y + s[1]); }
      }
    }
    if (S.ores && zoom > 0.45) for (const o of S.ores) { if (o.mine && S.buildings.has(o.mine)) continue; if (o.amt <= 0) continue; let e = oreEnt.get(o); if (!e) oreEnt.set(o, e = { o, fn: drawOre }); add(o.x + o.y + 1, e, o.x + 0.5, o.y + 0.5); }
  });
  const oreEnt = new WeakMap();
  function drawOre(c, e, sx, sy) { G.Art.draw(c, oreSpr(e.o.kind), sx, sy, 1); }
  void GATE; void palm; void N; void onR;
})(window.G);
