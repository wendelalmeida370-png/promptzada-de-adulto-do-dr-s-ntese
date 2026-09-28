'use strict';
// ============================================================
//  Architecture: each culture builds in its own style —
//  Greek marble and terracotta, Roman ochre and red tile,
//  Egyptian sandstone and flat roofs, Aztec plaster and stepped
//  pyramids, Norse timber and turf. Plus the new civic
//  buildings, the wonders, carts and aqueduct arches.
// ============================================================
(function (G) {
  const Art = G.Art; const TAU = Math.PI * 2;
  const A = G.Arch = {};
  const P = (dx, dy, z) => [(dx - dy) * 16, (dx + dy) * 8 - (z || 0)];
  function poly(c, pts, fill, stroke, lw) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 0.4; c.stroke(); }
  }
  function ln(c, a, b, col, w) { c.strokeStyle = col; c.lineWidth = w || 0.5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
  function walls(c, x0, y0, x1, y1, z0, z1, cl, cr, ins) {
    const i = ins || 0;
    poly(c, [P(x0, y1, z0), P(x1, y1, z0), P(x1 - i, y1 - i, z1), P(x0 + i, y1 - i, z1)], cl);
    poly(c, [P(x1, y1, z0), P(x1, y0, z0), P(x1 - i, y0 + i, z1), P(x1 - i, y1 - i, z1)], cr);
  }
  function top(c, x0, y0, x1, y1, z, col) { poly(c, [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], col); }
  function box(c, x0, y0, x1, y1, z0, z1, cl, cr, ct) { walls(c, x0, y0, x1, y1, z0, z1, cl, cr); top(c, x0, y0, x1, y1, z1, ct || cl); }
  function onL(c, y1, a, b, z0, z1, fill, m) { const pts = [P(a, y1, z0), P(b, y1, z0), P(b, y1, z1), P(a, y1, z1)]; poly(c, pts, fill); if (m) m.win.push(pts); }
  function onR(c, x1, a, b, z0, z1, fill, m) { const pts = [P(x1, a, z0), P(x1, b, z0), P(x1, b, z1), P(x1, a, z1)]; poly(c, pts, fill); if (m) m.win.push(pts); }
  const dims = (fw, fh, maxZ) => Art.spriteDims(fw, fh, maxZ);
  function shade(hex, f) {
    const r = G.hex2rgb(hex);
    return G.rgb(f < 1 ? r.map(v => v * f) : r.map(v => v + (255 - v) * (f - 1)));
  }
  const gableX = (...a) => Art.gableX(...a);
  function gableY(c, x0, y0, x1, y1, z1, zr, ov, cF, cB, cG, cE) {
    const xm = (x0 + x1) / 2;
    poly(c, [P(x0, y1, z1), P(x1, y1, z1), P(xm, y1, zr)], cG);
    poly(c, [P(xm, y0 - ov, zr), P(xm, y1 + ov, zr), P(x0 - ov, y1 + ov, z1 - 1), P(x0 - ov, y0 - ov, z1 - 1)], cB, cE, 0.5);
    poly(c, [P(x1 + ov, y0 - ov, z1 - 1), P(x1 + ov, y1 + ov, z1 - 1), P(xm, y1 + ov, zr), P(xm, y0 - ov, zr)], cF, cE, 0.5);
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.4;
    const n = Math.round((y1 - y0) * 10);
    for (let k = 1; k < n; k++) { const yy = y0 - ov + (y1 - y0 + 2 * ov) * k / n; const a = P(x1 + ov, yy, z1 - 1), b = P(xm, yy, zr); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    ln(c, P(xm, y0 - ov, zr), P(xm, y1 + ov, zr), 'rgba(255,255,255,0.25)', 0.7);
  }
  function hip(c, x0, y0, x1, y1, z1, zr, ov, cF, cR, cB) {
    const X0 = x0 - ov, X1 = x1 + ov, Y0 = y0 - ov, Y1 = y1 + ov;
    const lx = X1 - X0, ly = Y1 - Y0;
    if (lx >= ly) {
      const d = ly / 2, ym = (Y0 + Y1) / 2; const a = [X0 + d, ym], b = [X1 - d, ym];
      poly(c, [P(X0, Y0, z1), P(X1, Y0, z1), P(b[0], b[1], zr), P(a[0], a[1], zr)], cB);
      poly(c, [P(X0, Y0, z1), P(X0, Y1, z1), P(a[0], a[1], zr)], cB);
      poly(c, [P(X0, Y1, z1), P(X1, Y1, z1), P(b[0], b[1], zr), P(a[0], a[1], zr)], cF);
      poly(c, [P(X1, Y0, z1), P(X1, Y1, z1), P(b[0], b[1], zr)], cR);
      ln(c, P(a[0], a[1], zr), P(b[0], b[1], zr), 'rgba(255,255,255,0.25)', 0.6);
    } else {
      const d = lx / 2, xm = (X0 + X1) / 2; const a = [xm, Y0 + d], b = [xm, Y1 - d];
      poly(c, [P(X0, Y0, z1), P(X1, Y0, z1), P(a[0], a[1], zr)], cB);
      poly(c, [P(X0, Y0, z1), P(X0, Y1, z1), P(b[0], b[1], zr), P(a[0], a[1], zr)], cB);
      poly(c, [P(X0, Y1, z1), P(X1, Y1, z1), P(b[0], b[1], zr)], cF);
      poly(c, [P(X1, Y0, z1), P(X1, Y1, z1), P(b[0], b[1], zr), P(a[0], a[1], zr)], cR);
      ln(c, P(a[0], a[1], zr), P(b[0], b[1], zr), 'rgba(255,255,255,0.25)', 0.6);
    }
    // tile courses
    c.strokeStyle = 'rgba(0,0,0,0.1)'; c.lineWidth = 0.35;
    for (let k = 1; k < 4; k++) { const f = k / 4; const z = z1 + (zr - z1) * f; const i = (Math.min(lx, ly) / 2) * f; const a = P(X0 + i, Y1 - i, z), b = P(X1 - i, Y1 - i, z), e = P(X1 - i, Y0 + i, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(e[0], e[1]); c.stroke(); }
  }

  // ------------------------------ palettes ------------------------------
  const PAL = A.PAL = {
    classico: { wl: '#efe2c4', wr: '#d2c19e', base: ['#8a8478', '#6f6a60', '#a09a8e'], roof: ['#b85a3c', '#94452d', '#7a3826'], gable: '#dccba6', trim: '#6b4a30', win: '#2f3a48', door: '#5a3b25', acc: '#f2c14e', acc2: '#3f6fb0', col: ['#fbf6ea', '#d6ccb4'], kind: 'gable', pitch: 0.9, frame: true, top: '#cfc6b0', par: ['#d8cfb8', '#b6ac94'] },
    grego: { wl: '#f4efe4', wr: '#d8d0bd', base: ['#d4ccb6', '#b3a98f', '#e7e0cd'], roof: ['#c8683f', '#a8532f', '#8a4028'], gable: '#efe8d6', trim: '#3f6fb0', win: '#27323e', door: '#3f6fb0', acc: '#3f6fb0', acc2: '#b8452f', col: ['#fbf8ef', '#d9d1bf'], kind: 'gable', pitch: 0.5, top: '#e6dfcc', par: ['#f0eadb', '#d4ccb8'] },
    romano: { wl: '#edd4a4', wr: '#caa978', base: ['#a59c8b', '#847b6c', '#bdb4a3'], roof: ['#b5523a', '#94412d', '#7a3424'], gable: '#e4c995', trim: '#8e2f2f', win: '#2a2e38', door: '#6a2a20', acc: '#d8a63a', acc2: '#8e2f2f', col: ['#f4ecdb', '#d3c7ad'], kind: 'hip', pitch: 0.55, top: '#dcc394', par: ['#e8cf9f', '#c6a676'] },
    egipcio: { wl: '#e8d2a2', wr: '#c5aa7a', base: ['#cdb98f', '#ab9870', '#e0cfa7'], roof: ['#d8c294', '#bca676', '#a08a5a'], gable: '#e0c898', top: '#dcc697', par: ['#e4cd9c', '#c2a676'], trim: '#2f8f8a', trim2: '#b8452f', win: '#2d261c', door: '#3e2e1c', acc: '#e8b83a', acc2: '#2f8f8a', col: ['#efe1bb', '#cdb88e'], kind: 'flat', batter: 0.04 },
    asteca: { wl: '#f1e9d6', wr: '#d2c5a8', base: ['#b9ad93', '#978b73', '#cdc1a8'], roof: ['#caa85c', '#a3843f', '#8a6c2e'], gable: '#e6dcc4', top: '#e3d8bf', par: ['#ece2cb', '#cdbf9f'], trim: '#b33a2a', trim2: '#2fae8f', win: '#2a231c', door: '#3a2a1c', acc: '#2fae8f', acc2: '#b33a2a', col: ['#efe6d2', '#cfc2a6'], thatch: ['#caa85c', '#a3843f'], kind: 'flat' },
    nordico: { wl: '#7e5e40', wr: '#5f4630', base: ['#7c766a', '#5f5a50', '#8e877b'], roof: ['#71903f', '#5a7631', '#445a22'], shingle: ['#5a4430', '#46342a', '#382a20'], gable: '#6a4a30', trim: '#a23c2a', win: '#2a1e14', door: '#3a2616', acc: '#d8b25a', acc2: '#a23c2a', col: ['#8a6848', '#6a4c32'], kind: 'turf', pitch: 1.3, top: '#6a5038', par: ['#7e5e40', '#5f4630'] },
  };
  const pal = st => PAL[st] || PAL.classico;

  // ------------------------------ kit ------------------------------
  function plinth(c, p, x0, y0, x1, y1, h) { box(c, x0 - 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05, 0, h, p.base[0], p.base[1], p.base[2]); }
  function winsL(c, m, p, y1, x0, x1, z, h, n, col) { const w = (x1 - x0) / (n * 2 + 1); for (let k = 0; k < n; k++) { const a = x0 + w * (1 + k * 2); onL(c, y1, a, a + w, z, z + h, col || p.win, m); } }
  function winsR(c, m, p, x1, y0, y1, z, h, n, col) { const w = (y1 - y0) / (n * 2 + 1); for (let k = 0; k < n; k++) { const a = y0 + w * (1 + k * 2); onR(c, x1, a, a + w, z, z + h, col || p.win, m); } }
  function band(c, x0, y0, x1, y1, z0, z1, col) { poly(c, [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], col); poly(c, [P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1)], shade(col, 0.8)); }
  function parapet(c, p, x0, y0, x1, y1, z, h) {
    const w = 0.05, a = p.par[0], b = p.par[1];
    box(c, x0, y0, x1, y0 + w, z, z + h, a, b, a); box(c, x0, y0, x0 + w, y1, z, z + h, a, b, a);
    box(c, x0, y1 - w, x1, y1, z, z + h, a, b, a); box(c, x1 - w, y0, x1, y1, z, z + h, a, b, a);
  }
  function dragon(c, pt, dir, col) {
    c.strokeStyle = col || '#3a2616'; c.lineWidth = 0.9; c.beginPath();
    c.moveTo(pt[0], pt[1]); c.quadraticCurveTo(pt[0] + dir * 1.2, pt[1] - 4, pt[0] + dir * 3.2, pt[1] - 4.4); c.stroke();
    c.fillStyle = col || '#3a2616'; c.beginPath(); c.arc(pt[0] + dir * 3.3, pt[1] - 4.3, 0.9, 0, TAU); c.fill();
  }
  function tufts(c, a, b, n, col) {
    c.strokeStyle = col; c.lineWidth = 0.5;
    for (let k = 0; k <= n; k++) { const f = k / n; const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 0.4, y - 1.4); c.moveTo(x + 0.6, y); c.lineTo(x + 0.9, y - 1.2); c.stroke(); }
  }
  function roof(c, m, p, x0, y0, x1, y1, z, o) {
    o = o || {};
    const kind = o.kind || p.kind;
    const ov = o.ov !== undefined ? o.ov : 0.08;
    if (kind === 'flat') { top(c, x0, y0, x1, y1, z, p.top); if (o.par !== 0) parapet(c, p, x0, y0, x1, y1, z, o.par || 1.4); return z + (o.par || 1.4); }
    const r = o.colors || (kind === 'turf' ? p.roof : p.roof);
    const span = Math.min(x1 - x0, y1 - y0);
    const rh = o.rh || span * 18 * (p.pitch || 0.8);
    const alongY = o.alongY || (x1 - x0 < y1 - y0 - 0.01);
    if (kind === 'hip') { hip(c, x0, y0, x1, y1, z, z + rh, ov, r[0], r[1], r[2]); return z + rh; }
    if (kind === 'thatch') { if (alongY) gableY(c, x0, y0, x1, y1, z, z + rh, ov + 0.04, p.thatch[0], p.thatch[1], p.wl, '#7a5a2e'); else gableX(c, x0, y0, x1, y1, z, z + rh, ov + 0.04, p.thatch[0], p.thatch[1], p.wl, '#7a5a2e'); return z + rh; }
    if (alongY) gableY(c, x0, y0, x1, y1, z, z + rh, ov, r[0], r[1], p.gable, r[2]);
    else gableX(c, x0, y0, x1, y1, z, z + rh, ov, r[0], r[1], p.gable, r[2]);
    if (kind === 'turf') {
      if (!alongY) { const ym = (y0 + y1) / 2; tufts(c, P(x0, ym, z + rh), P(x1, ym, z + rh), 8, '#88a852'); tufts(c, P(x0 - ov, y1 + ov, z - 1), P(x1 + ov, y1 + ov, z - 1), 10, '#5f7a34'); const ap = P(x1 + ov, ym, z + rh); dragon(c, [ap[0] + 1, ap[1] + 1], 1); }
      else { const xm = (x0 + x1) / 2; tufts(c, P(xm, y0, z + rh), P(xm, y1, z + rh), 8, '#88a852'); const ap = P(xm, y1 + ov, z + rh); dragon(c, [ap[0] - 1, ap[1] + 1], -1); }
    }
    return z + rh;
  }
  function column(c, p, x, y, z0, z1, r, flared) {
    box(c, x - r, y - r, x + r, y + r, z0, z1, p.col[0], p.col[1], p.col[0]);
    const R = flared ? r * 2.1 : r * 1.5;
    box(c, x - R, y - R, x + R, y + R, z1 - (flared ? 1.6 : 0.9), z1, flared ? p.acc2 || p.col[0] : p.col[0], flared ? shade(p.acc2 || p.col[1], 0.85) : p.col[1], p.col[0]);
  }
  function colonnade(c, p, x0, y0, x1, y1, z0, z1, n, r, sides, flared) {
    const pts = [];
    if (sides.includes('B')) { for (let k = 0; k < n; k++) pts.push([x0 + (x1 - x0) * k / (n - 1), y0]); for (let k = 1; k < n; k++) pts.push([x0, y0 + (y1 - y0) * k / (n - 1)]); }
    if (sides.includes('L')) for (let k = 0; k < n; k++) pts.push([x0 + (x1 - x0) * k / (n - 1), y1]);
    if (sides.includes('R')) for (let k = 0; k < n - (sides.includes('L') ? 1 : 0); k++) pts.push([x1, y0 + (y1 - y0) * k / (n - 1)]);
    pts.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    for (const [x, y] of pts) column(c, p, x, y, z0, z1, r, flared);
  }
  function steps(c, p, e, n, h, shrink) { for (let k = 0; k < n; k++) { const q = e - k * shrink; box(c, -q, -q, q, q, k * h, (k + 1) * h, p.base[0], p.base[1], p.base[2]); } return n * h; }
  function flag(c, x, y, col, h) { ln(c, [x, y], [x, y - h], '#5a3c22', 0.7); c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + 5, y - h + 1.5); c.lineTo(x, y - h + 3); c.closePath(); c.fill(); }
  function palm(c, x, y, s) {
    s = s || 1; c.strokeStyle = '#8a6a44'; c.lineWidth = 1.1 * s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 1 * s, y - 7 * s, x + 1.5 * s, y - 12 * s); c.stroke();
    const tx = x + 1.5 * s, ty = y - 12 * s; c.strokeStyle = '#4f9d45'; c.lineWidth = 1.4 * s;
    for (const [dx, dy] of [[-5, 2], [5, 2.5], [-3.5, -1.5], [3.5, -1.8], [0, -3], [-5.5, 0.5], [5.5, 0.2]]) { c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + dx * 0.5 * s, ty + dy * s - 2 * s, tx + dx * s, ty + dy * s + 1.5 * s); c.stroke(); }
  }
  function jar(c, x, y, s, col) { c.fillStyle = col || '#b8683a'; c.beginPath(); c.ellipse(x, y - 2 * s, 1.6 * s, 2.1 * s, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x + 0.6 * s, y - 2 * s, 0.9 * s, 1.9 * s, 0, 0, TAU); c.fill(); c.fillStyle = shade(col || '#b8683a', 0.7); c.fillRect(x - 0.7 * s, y - 4.4 * s, 1.4 * s, 0.7 * s); }
  function barrel(c, x, y, s) { c.fillStyle = '#7a5230'; c.fillRect(x - 1.4 * s, y - 3.2 * s, 2.8 * s, 3.2 * s); c.fillStyle = '#5a3a20'; c.fillRect(x - 1.4 * s, y - 2.4 * s, 2.8 * s, 0.4 * s); c.fillRect(x - 1.4 * s, y - 1 * s, 2.8 * s, 0.4 * s); c.fillStyle = '#9a7040'; c.beginPath(); c.ellipse(x, y - 3.2 * s, 1.4 * s, 0.6 * s, 0, 0, TAU); c.fill(); }
  function awning(c, x0, x1, y, z0, z1, d, cols) {
    // striped cloth sloping out from a wall face at y (front-left)
    const n = 5;
    for (let k = 0; k < n; k++) { const a = x0 + (x1 - x0) * k / n, b = x0 + (x1 - x0) * (k + 1) / n; poly(c, [P(a, y, z1), P(b, y, z1), P(b, y + d, z0), P(a, y + d, z0)], cols[k % cols.length]); }
  }
  function stall(c, p, x, y, col1, col2) {
    const s = 0.2;
    for (const [dx, dy] of [[-s, -s], [s, -s], [s, s], [-s, s]]) ln(c, P(x + dx, y + dy, 0), P(x + dx, y + dy, 7), '#6a4a2c', 0.6);
    box(c, x - s, y - s, x + s, y + s, 2.5, 3.4, '#8a6a44', '#6a4e30', '#9a7a52');
    const t = P(x, y, 10);
    for (let k = 0; k < 4; k++) { poly(c, [t, P(x - s - 0.04 + (k < 2 ? 0 : 0), y + s + 0.04, 7), P(x + s + 0.04, y + s + 0.04, 7)], k % 2 ? col1 : col2); }
    poly(c, [t, P(x + s + 0.04, y + s + 0.04, 7), P(x + s + 0.04, y - s - 0.04, 7)], shade(col1, 0.8));
    c.fillStyle = G.pick(['#e05a3a', '#f0b040', '#6ab04a']); for (let k = 0; k < 3; k++) { const q = P(x - 0.1 + k * 0.1, y + 0.05, 3.6); c.beginPath(); c.arc(q[0], q[1], 0.7, 0, TAU); c.fill(); }
  }
  function statue(c, x, y, z, col, h, spear) {
    const b = P(x, y, z); h = h || 10; const w = Math.max(1.4, h * 0.13);
    c.fillStyle = col; c.beginPath(); c.moveTo(b[0] - w, b[1]); c.lineTo(b[0] + w, b[1]); c.lineTo(b[0] + w * 0.8, b[1] - h * 0.62); c.lineTo(b[0] - w * 0.8, b[1] - h * 0.62); c.fill();
    c.fillRect(b[0] - w * 1.1, b[1] - h * 0.62, w * 2.2, h * 0.08);
    c.beginPath(); c.arc(b[0], b[1] - h * 0.78, w * 0.7, 0, TAU); c.fill();
    c.fillStyle = shade(col, 0.72); c.fillRect(b[0] + w * 0.15, b[1] - h * 0.62, w * 0.65, h * 0.62);
    if (spear) { ln(c, [b[0] + w * 1.3, b[1] - h * 0.05], [b[0] + w * 1.3, b[1] - h * 1.1], shade(col, 0.6), Math.max(0.6, w * 0.3)); c.fillStyle = shade(col, 0.85); c.beginPath(); c.ellipse(b[0] - w * 1.1, b[1] - h * 0.42, w * 0.9, w * 1.2, 0, 0, TAU); c.fill(); c.strokeStyle = shade(col, 0.6); c.lineWidth = 0.4; c.stroke(); }
  }
  function dome(c, x, y, rx, h, colA, colB, tipCol) {
    c.save(); c.translate(x, y);
    const g = c.createLinearGradient(-rx, 0, rx, 0); g.addColorStop(0, colA); g.addColorStop(1, colB);
    c.fillStyle = g; c.beginPath(); c.moveTo(-rx, 0); c.bezierCurveTo(-rx, -h * 0.62, -rx * 0.45, -h, 0, -h); c.bezierCurveTo(rx * 0.45, -h, rx, -h * 0.62, rx, 0); c.ellipse(0, 0, rx, rx * 0.5, 0, 0, Math.PI); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.4;
    for (const f of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(f * rx, rx * 0.5 * Math.sqrt(1 - f * f)); c.quadraticCurveTo(f * rx * 0.9, -h * 0.6, 0, -h); c.stroke(); }
    if (tipCol) { c.fillStyle = tipCol; c.beginPath(); c.arc(0, -h - 1, 1.3, 0, TAU); c.fill(); }
    c.restore();
    return [x, y - h - 1];
  }
  function tree(c, x, y, s) {
    c.fillStyle = '#6e4a2b'; c.fillRect(x - 0.6 * s, y - 4 * s, 1.2 * s, 4 * s);
    c.fillStyle = '#3f7d34'; c.beginPath(); c.arc(x + 0.5 * s, y - 6 * s, 3.4 * s, 0, TAU); c.fill();
    c.fillStyle = '#56a043'; c.beginPath(); c.arc(x - 0.3 * s, y - 7 * s, 2.6 * s, 0, TAU); c.fill();
  }
  function basin(c, x, y, r, z, water) {
    const p = P(x, y, z); c.fillStyle = '#b8b0a0'; c.beginPath(); c.ellipse(p[0], p[1], r * 22.6, r * 11.3, 0, 0, TAU); c.fill();
    c.fillStyle = water || '#5aaed0'; c.beginPath(); c.ellipse(p[0], p[1], r * 19, r * 9.2, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(p[0] - r * 6, p[1] - r * 2, r * 6, r * 2, 0, 0, TAU); c.fill();
  }
  function pave(c, e, col, lines) {
    top(c, -e, -e, e, e, 0.4, col);
    c.strokeStyle = lines || 'rgba(90,80,65,0.3)'; c.lineWidth = 0.35;
    const n = Math.round(e * 6);
    for (let k = 1; k < n; k++) { const f = -e + 2 * e * k / n; ln(c, P(f, -e, 0.4), P(f, e, 0.4), lines || 'rgba(90,80,65,0.3)', 0.35); ln(c, P(-e, f, 0.4), P(e, f, 0.4), lines || 'rgba(90,80,65,0.3)', 0.35); }
  }
  // stepped pyramid: stairs on the front (+y) face
  function stepPyr(c, p, e0, e1, n, lh, cl, cr, ct, stair) {
    for (let k = 0; k < n; k++) {
      const e = e0 - (e0 - e1) * k / Math.max(1, n - 1);
      box(c, -e, -e, e, e, k * lh, (k + 1) * lh, cl, cr, ct);
      ln(c, P(-e, e, (k + 1) * lh - 0.8), P(e, e, (k + 1) * lh - 0.8), 'rgba(0,0,0,0.12)', 0.5);
      ln(c, P(e, e, (k + 1) * lh - 0.8), P(e, -e, (k + 1) * lh - 0.8), 'rgba(0,0,0,0.12)', 0.5);
    }
    const H = n * lh, w = stair || 0.22;
    poly(c, [P(-w, e0 + 0.02, 0), P(w, e0 + 0.02, 0), P(w, e1, H), P(-w, e1, H)], shade(cl, 1.08));
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 0.3;
    for (let k = 1; k < n * 3; k++) { const f = k / (n * 3); const y = e0 + (e1 - e0) * f, z = H * f; ln(c, P(-w, y, z), P(w, y, z), 'rgba(0,0,0,0.18)', 0.3); }
    poly(c, [P(-w - 0.06, e0 + 0.02, 0), P(-w, e0 + 0.02, 0), P(-w, e1, H), P(-w - 0.06, e1, H)], shade(cr, 0.9));
    poly(c, [P(w, e0 + 0.02, 0), P(w + 0.06, e0 + 0.02, 0), P(w + 0.06, e1, H), P(w, e1, H)], shade(cr, 0.9));
    return H;
  }
  // an oval bowl (amphitheatre / theatre seen from above)
  function bowl(c, r, H, wallL, wallR, seats, floor, arches, half) {
    const rx = r * 22.6, ry = r * 11.3;
    const top0 = -H;
    // inner seating rings
    for (let k = 0; k < 6; k++) {
      const f = 1 - k * 0.1; const z = H - k * (H * 0.12);
      c.fillStyle = k % 2 ? seats : shade(seats, 0.9);
      c.beginPath(); if (half) c.ellipse(0, -z, rx * f, ry * f, 0, Math.PI, TAU); else c.ellipse(0, -z, rx * f, ry * f, 0, 0, TAU);
      if (half) c.lineTo(rx * f, -z); c.fill();
    }
    c.fillStyle = floor; c.beginPath(); c.ellipse(0, -H * 0.3, rx * 0.4, ry * 0.4, 0, 0, TAU); c.fill();
    if (half) return;
    // front half of the outer wall
    const g = c.createLinearGradient(-rx, 0, rx, 0); g.addColorStop(0, wallL); g.addColorStop(1, wallR);
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, Math.PI); c.lineTo(-rx, top0); c.ellipse(0, top0, rx, ry, 0, Math.PI, 0, true); c.closePath(); c.fill();
    if (arches) {
      const tiers = arches;
      for (let t = 0; t < tiers; t++) {
        const zc = H * (t + 0.45) / tiers, ah = H / tiers * 0.55;
        for (let k = 1; k < 16; k++) {
          const a = k / 16 * Math.PI; const x = Math.cos(a) * rx, y = Math.sin(a) * ry - zc;
          const w = Math.sin(a) * 2.4;
          c.fillStyle = 'rgba(40,30,25,0.55)'; c.beginPath(); c.moveTo(x - w / 2, y + ah / 2); c.lineTo(x - w / 2, y - ah / 4); c.quadraticCurveTo(x, y - ah / 2 - 0.8, x + w / 2, y - ah / 4); c.lineTo(x + w / 2, y + ah / 2); c.fill();
        }
        c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(0, -H * (t + 1) / tiers + 0.5, rx, ry, 0, 0, Math.PI); c.stroke();
      }
    }
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(0, top0, rx, ry, 0, 0, TAU); c.stroke();
  }

  // ------------------------------ homes ------------------------------
  function longhouse(c, m, p, lx, ly, H, rh, big) {
    const x0 = -lx, x1 = lx, y0 = -ly, y1 = ly;
    box(c, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, 0, 1.2, p.base[0], p.base[1], p.base[2]);
    walls(c, x0, y0, x1, y1, 1.2, H, p.wl, p.wr);
    c.strokeStyle = 'rgba(30,20,10,0.35)'; c.lineWidth = 0.4;
    for (let k = 1; k < 10; k++) { const x = x0 + (x1 - x0) * k / 10; ln(c, P(x, y1, 1.2), P(x, y1, H), 'rgba(30,20,10,0.35)', 0.4); }
    for (let k = 1; k < 4; k++) { const y = y0 + (y1 - y0) * k / 4; ln(c, P(x1, y, 1.2), P(x1, y, H), 'rgba(30,20,10,0.35)', 0.4); }
    onL(c, y1, -0.08, 0.08, 1.2, Math.min(H, 7.5), p.door);
    band(c, x0, y0, x1, y1, H - 0.8, H, p.trim);
    onL(c, y1, x0 + 0.12, x0 + 0.2, H - 4, H - 2, p.win, m); onL(c, y1, x1 - 0.2, x1 - 0.12, H - 4, H - 2, p.win, m);
    onR(c, x1, -0.05, 0.05, H - 4, H - 2, p.win, m);
    const zr = roof(c, m, p, x0, y0, x1, y1, H, { rh, ov: 0.1 });
    m.fires.push(P(0, 0, zr));
    if (big) { for (const x of [x0 + 0.2, 0.2 * lx, x1 - 0.25]) { const q = P(x, y1 + 0.02, H * 0.55); c.fillStyle = G.pick(['#a23c2a', '#d8b25a', '#3f6fb0']); c.beginPath(); c.ellipse(q[0], q[1], 2, 1.5, 0, 0, TAU); c.fill(); c.fillStyle = '#d8c89a'; c.beginPath(); c.arc(q[0], q[1], 0.5, 0, TAU); c.fill(); } }
  }
  function roundHut(c, m, wa, wb, straw, band2) {
    let g = c.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, wa); g.addColorStop(1, wb);
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 1, 9.5, 4.8, 0, 0, Math.PI); c.lineTo(-9.5, -5); c.lineTo(9.5, -5); c.closePath(); c.fill(); c.fillRect(-9.5, -5, 19, 6);
    if (band2) { c.fillStyle = band2; c.beginPath(); c.ellipse(0, -2.8, 9.5, 4.8, 0, 0, Math.PI); c.lineTo(-9.5, -4.2); c.ellipse(0, -4.2, 9.5, 4.8, 0, Math.PI, 0, true); c.fill(); }
    c.fillStyle = '#3a2616'; c.beginPath(); c.moveTo(-6, 4.5); c.lineTo(-6, -1.5); c.quadraticCurveTo(-4, -4.4, -2, -1.5); c.lineTo(-2, 5.3); c.closePath(); c.fill();
    m.win.push([[-5.6, 4.4], [-5.6, -1.3], [-4, -3.4], [-2.4, -1.3], [-2.4, 5.1]]);
    g = c.createLinearGradient(-12, 0, 12, 0); g.addColorStop(0, straw[0]); g.addColorStop(1, straw[1]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-12.5, -4); c.lineTo(0, -24); c.lineTo(12.5, -4); c.ellipse(0, -4, 12.5, 5.5, 0, 0, Math.PI); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(110,80,35,0.45)'; c.lineWidth = 0.45;
    for (let k = -11; k <= 11; k += 2) { c.beginPath(); c.moveTo(0, -23.5); c.lineTo(k, -4 + Math.sqrt(Math.max(0, 1 - (k / 12.5) ** 2)) * 5.5); c.stroke(); }
    c.fillStyle = '#7a5a2e'; c.beginPath(); c.arc(0, -24, 1.4, 0, TAU); c.fill();
  }
  function hut(c, m, p, st, v) {
    if (st === 'asteca') return roundHut(c, m, p.wl, p.wr, p.thatch, p.trim);
    if (st === 'nordico') { longhouse(c, m, p, 0.36, 0.26, 4.5, 9); return; }
    const e = 0.3, x0 = -e, x1 = e, y0 = -e + 0.04, y1 = e - 0.04;
    plinth(c, p, x0, y0, x1, y1, 1.2);
    walls(c, x0, y0, x1, y1, 1.2, 8, p.wl, p.wr, p.batter);
    onL(c, y1, -0.1, 0.06, 1.2, 6.5, p.door);
    onR(c, x1 - (p.batter || 0) * 0.5, -0.06, 0.08, 4, 6, p.win, m);
    if (st === 'egipcio') {
      roof(c, m, p, x0 + 0.02, y0 + 0.02, x1 - 0.02, y1 - 0.02, 8, { par: 1 });
      // palm-frond sunshade on the roof
      for (const [dx, dy] of [[-0.15, -0.15], [0.15, -0.15], [0.15, 0.1], [-0.15, 0.1]]) ln(c, P(dx, dy, 8), P(dx, dy, 13), '#7a5a3a', 0.6);
      poly(c, [P(-0.2, -0.2, 13), P(0.2, -0.2, 13), P(0.2, 0.15, 12.5), P(-0.2, 0.15, 12.5)], '#9a8a4a', '#6a5a2a');
    } else roof(c, m, p, x0, y0, x1, y1, 8, { alongY: v % 2 === 1, rh: st === 'grego' ? 5 : 6 });
  }
  function townhouse(c, m, p, st, v, floors) {
    const e = 0.37, x0 = -e, x1 = e, y0 = -e, y1 = e;
    const fh = floors >= 3 ? 8 : 9, z0 = 2, H = z0 + floors * fh;
    if (st === 'asteca') { // stepped levels, each set back
      let e2 = e, z = 0;
      plinth(c, p, -e, -e, e, e, 1.2); z = 1.2;
      for (let f = 0; f < floors; f++) {
        const zz = z + fh;
        walls(c, -e2, -e2, e2, e2, z, zz, p.wl, p.wr);
        band(c, -e2, -e2, e2, e2, zz - 1.6, zz, p.trim);
        if (f === 0) { onL(c, e2, -0.1, 0.08, z, z + 6.5, p.door); poly(c, [P(-0.13, e2, z), P(-0.1, e2, z), P(-0.1, e2, z + 7), P(-0.13, e2, z + 7)], p.trim2); }
        winsL(c, m, p, e2, -e2, e2, z + 3.5, 2.2, f === 0 ? 1 : 2);
        winsR(c, m, p, e2, -e2, e2, z + 3.5, 2.2, 2);
        top(c, -e2, -e2, e2, e2, zz, p.top);
        // terrace plants
        if (f < floors - 1) for (let k = 0; k < 3; k++) { const q = P(-e2 + 0.1 + k * 0.25, e2 - 0.04, zz); c.fillStyle = k % 2 ? '#5a9a3c' : '#e05a7a'; c.beginPath(); c.arc(q[0], q[1] - 0.8, 1.1, 0, TAU); c.fill(); }
        z = zz; e2 -= 0.07;
      }
      parapet(c, p, -e2 - 0.07, -e2 - 0.07, e2 + 0.07, e2 + 0.07, z, 1.2);
      return;
    }
    if (st === 'nordico') { longhouse(c, m, p, 0.42 + floors * 0.02, 0.32, 5.5 + floors * 1.8, 9 + floors * 2.5, floors >= 3); return; }
    plinth(c, p, x0, y0, x1, y1, z0);
    walls(c, x0, y0, x1, y1, z0, H, p.wl, p.wr, p.batter);
    if (p.frame) { // timber frame
      c.strokeStyle = '#6b4a30'; c.lineWidth = 0.8;
      for (let f = 1; f <= floors; f++) { const z = z0 + f * fh; ln(c, P(x0, y1, z), P(x1, y1, z), '#6b4a30', 0.8); ln(c, P(x1, y1, z), P(x1, y0, z), '#6b4a30', 0.8); }
      ln(c, P(x0, y1, z0), P(x0, y1, H), '#6b4a30', 0.8); ln(c, P(x1, y1, z0), P(x1, y1, H), '#6b4a30', 0.8); ln(c, P(x1, y0, z0), P(x1, y0, H), '#6b4a30', 0.8);
    } else for (let f = 1; f < floors; f++) band(c, x0, y0, x1, y1, z0 + f * fh - 0.7, z0 + f * fh, st === 'grego' ? p.col[1] : shade(p.wl, 0.85));
    if (st === 'romano' && floors >= 3) {
      // tabernae: shops with awnings on the ground floor
      for (let k = 0; k < 2; k++) { const a = x0 + 0.08 + k * 0.36; onL(c, y1, a, a + 0.26, z0, z0 + 6, '#3a2a20'); }
      awning(c, x0 + 0.04, x1 - 0.04, y1, z0 + 5, z0 + 7.5, 0.14, ['#c8483a', '#efe2c4']);
      onR(c, x1, -0.25, 0.05, z0, z0 + 6, '#3a2a20');
    } else {
      onL(c, y1, -0.14, 0.06, z0, z0 + 7, p.door);
      if (st === 'romano') { column(c, p, -0.2, y1 + 0.05, z0, z0 + 7.5, 0.025); column(c, p, 0.12, y1 + 0.05, z0, z0 + 7.5, 0.025); }
      if (st === 'grego') { onL(c, y1, 0.16, 0.19, z0 + 3.5, z0 + 6.5, p.trim); }
      winsL(c, m, p, y1, 0.08, x1, z0 + 3.5, 3, 1);
      winsR(c, m, p, x1, y0, y1, z0 + 3.5, 3, 2);
    }
    for (let f = 1; f < floors; f++) {
      const z = z0 + f * fh + 2.5;
      winsL(c, m, p, y1, x0, x1, z, 3.2, 2); winsR(c, m, p, x1 - (p.batter || 0), y0, y1, z, 3.2, 2);
      if (st === 'grego') { for (const a of [-0.25, 0.1]) { onL(c, y1, a - 0.04, a, z, z + 3.2, p.trim); } }
      if ((st === 'romano' || st === 'grego' || st === 'classico') && f === floors - 1 && floors >= 2) {
        // wooden balcony
        box(c, x0 + 0.05, y1, x1 - 0.05, y1 + 0.12, z - 1.2, z - 0.6, '#7a5230', '#5a3a20', '#8a6038');
        for (let k = 0; k <= 5; k++) { const x = x0 + 0.05 + (x1 - x0 - 0.1) * k / 5; ln(c, P(x, y1 + 0.12, z - 0.6), P(x, y1 + 0.12, z + 1.6), '#6a4526', 0.45); }
        ln(c, P(x0 + 0.05, y1 + 0.12, z + 1.6), P(x1 - 0.05, y1 + 0.12, z + 1.6), '#6a4526', 0.6);
      }
    }
    if (st === 'egipcio') {
      band(c, x0, y0, x1, y1, H - 2, H - 1, p.trim);
      roof(c, m, p, x0 + 0.04, y0 + 0.04, x1 - 0.04, y1 - 0.04, H, { par: 1.3 });
      // rooftop awning and wind-catcher
      for (const [dx, dy] of [[-0.25, 0.05], [0.05, 0.05], [0.05, 0.28], [-0.25, 0.28]]) ln(c, P(dx, dy, H), P(dx, dy, H + 5), '#7a5a3a', 0.6);
      poly(c, [P(-0.27, 0.03, H + 5), P(0.07, 0.03, H + 5), P(0.07, 0.3, H + 4.4), P(-0.27, 0.3, H + 4.4)], '#e8e0c8', '#b8a888');
      box(c, 0.12, -0.3, 0.3, -0.12, H, H + 6, p.wl, p.wr, p.top); poly(c, [P(0.12, -0.12, H + 6), P(0.3, -0.12, H + 6), P(0.3, -0.12, H + 4), P(0.12, -0.12, H + 4)], '#3a2a1c');
      return;
    }
    const kind = st === 'grego' && floors >= 3 ? 'gable' : p.kind;
    const zr = roof(c, m, p, x0, y0, x1, y1, H, { kind, alongY: v % 2 === 1, rh: st === 'classico' ? 11 : undefined });
    if (st === 'classico' || st === 'romano') { box(c, 0.1, -0.22, 0.24, -0.08, H + 2, Math.min(zr, H + 12) + 2, '#8e8578', '#6f675c', '#5a534a'); m.fires.push(P(0.17, -0.15, Math.min(zr, H + 12) + 3)); }
    else m.fires.push(P(0, 0, zr));
  }

  // ------------------------------ city blocks ------------------------------
  // four tall houses around a paved courtyard, each drawn with the townhouse kit, shifted to its corner
  function offMeta(m, ox, oy) {
    const d = P(ox, oy, 0); const sh = q => [q[0] + d[0], q[1] + d[1]];
    return { win: { push: poly => m.win.push(poly.map(sh)) }, fires: { push: q => m.fires.push(sh(q)) }, glow: { push: q => m.glow.push(sh(q)) } };
  }
  function quarteirao(c, m, p, st, v) {
    // courtyard paving and a tree or fountain in the middle
    poly(c, [P(-0.95, -0.95, 0.4), P(0.95, -0.95, 0.4), P(0.95, 0.95, 0.4), P(-0.95, 0.95, 0.4)], A.plazaColor(st), shade(A.plazaColor(st), 0.8));
    const base = st === 'romano' ? 4 : st === 'nordico' ? 2 : st === 'egipcio' ? 3 : st === 'asteca' ? 3 : st === 'grego' ? 3 : 3;
    const quads = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]];
    for (let k = 0; k < 4; k++) {
      const [ox, oy] = quads[k];
      const floors = Math.max(2, base + ((v + k) % 3) - (k === 3 ? 1 : 0));
      if (k === 3) { // the front corner stays open: a courtyard with a fountain or a tree
        const q = P(0.55, 0.55, 0.4);
        if (st === 'nordico' || st === 'asteca' || st === 'egipcio') { c.fillStyle = '#4e8a3a'; c.beginPath(); c.arc(q[0], q[1] - 7, 5, 0, TAU); c.fill(); c.fillStyle = '#6aa84a'; c.beginPath(); c.arc(q[0] - 1.5, q[1] - 8.5, 2.6, 0, TAU); c.fill(); ln(c, q, [q[0], q[1] - 3], '#6a4a2a', 1.2); }
        else { box(c, 0.4, 0.4, 0.7, 0.7, 0.4, 1.8, p.col ? p.col[0] : '#d8d0c0', p.col ? p.col[1] : '#b8b0a0', '#6ab4d8'); ln(c, P(0.55, 0.55, 1.8), P(0.55, 0.55, 4.5), '#dfe8ee', 0.8); }
        continue;
      }
      c.save(); const d = P(ox, oy, 0); c.translate(d[0], d[1]);
      townhouse(c, offMeta(m, ox, oy), p, st, (v + k) % 3, floors);
      c.restore();
    }
  }

  // ------------------------------ generic halls ------------------------------
  function hall(c, m, p, st, o) {
    const { x0, y0, x1, y1, H } = o;
    plinth(c, p, x0, y0, x1, y1, o.plinth || 2);
    const z0 = o.plinth || 2;
    if (st === 'nordico') { longhouse(c, m, p, (x1 - x0) / 2, (y1 - y0) / 2, H * 0.6, H * 0.75, o.big); return H * 1.35; }
    walls(c, x0, y0, x1, y1, z0, H, p.wl, p.wr, p.batter);
    if (o.door !== false) onL(c, y1, (x0 + x1) / 2 - 0.12, (x0 + x1) / 2 + 0.12, z0, z0 + Math.min(10, (H - z0) * 0.7), p.door);
    winsL(c, m, p, y1, x0, x1, z0 + (H - z0) * 0.5, 3, Math.max(1, Math.round((x1 - x0) * 2)));
    winsR(c, m, p, x1 - (p.batter || 0), y0, y1, z0 + (H - z0) * 0.5, 3, Math.max(1, Math.round((y1 - y0) * 2)));
    if (st === 'egipcio' || st === 'asteca') {
      band(c, x0, y0, x1, y1, H - 2.2, H - 0.8, p.trim);
      if (p.trim2) band(c, x0, y0, x1, y1, H - 3.4, H - 2.4, p.trim2);
      return roof(c, m, p, x0, y0, x1, y1, H, { par: 1.4 });
    }
    return roof(c, m, p, x0, y0, x1, y1, H, { alongY: o.alongY, rh: o.rh });
  }

  // ------------------------------ religion ------------------------------
  function temple(c, m, p, st) {
    if (st === 'grego' || st === 'romano') {
      const g = st === 'grego';
      const H0 = g ? steps(c, p, 0.95, 3, 1.4, 0.07) : 0;
      if (!g) { box(c, -0.85, -0.85, 0.85, 0.85, 0, 7, p.base[0], p.base[1], p.base[2]); // podium with front stairs
        poly(c, [P(-0.35, 1.02, 0), P(0.35, 1.02, 0), P(0.35, 0.85, 7), P(-0.35, 0.85, 7)], shade(p.base[2], 1.05));
        for (let k = 1; k < 6; k++) ln(c, P(-0.35, 1.02 - 0.17 * k / 6, 7 * k / 6), P(0.35, 1.02 - 0.17 * k / 6, 7 * k / 6), 'rgba(0,0,0,0.15)', 0.3); }
      const z0 = g ? H0 : 7, H = z0 + 17;
      const cx0 = g ? -0.5 : -0.55, cx1 = g ? 0.45 : 0.55, cy0 = g ? -0.5 : -0.7, cy1 = g ? 0.45 : 0.2;
      if (g) colonnade(c, p, -0.72, -0.72, 0.72, 0.72, z0, H, 5, 0.045, 'B');
      walls(c, cx0, cy0, cx1, cy1, z0, H, p.wl, p.wr);
      onL(c, cy1, -0.15, 0.15, z0, z0 + 10, '#3a2e24', m);
      if (g) colonnade(c, p, -0.72, -0.72, 0.72, 0.72, z0, H, 5, 0.045, 'LR');
      else colonnade(c, p, -0.62, 0.3, 0.62, 0.72, z0, H, 4, 0.05, 'L');
      const ey0 = g ? -0.78 : -0.72, ey1 = g ? 0.78 : 0.76;
      box(c, -0.78, ey0, 0.78, ey1, H, H + 2.5, p.col[0], p.col[1], p.col[0]);
      band(c, -0.78, ey0, 0.78, ey1, H + 1, H + 2, g ? p.acc : p.acc2);
      gableY(c, -0.78, ey0, 0.78, ey1, H + 2.5, H + 12, 0.05, p.roof[0], p.roof[1], p.gable, p.roof[2]);
      const e = P(0, ey1, H + 6); c.fillStyle = p.acc === '#3f6fb0' ? '#f2c14e' : p.acc; c.beginPath(); c.arc(e[0], e[1], 1.6, 0, TAU); c.fill(); m.glow.push(e);
      for (const [bx, by] of [[-0.9, 0.9], [0.9, 0.9]]) { box(c, bx - 0.05, by - 0.05, bx + 0.05, by + 0.05, 0, 4, '#8a7a5a', '#6a5a40', '#9a8a6a'); m.fires.push(P(bx, by, 5)); }
      return;
    }
    if (st === 'egipcio') {
      box(c, -0.7, -0.9, 0.85, 0.35, 0, 15, p.wl, p.wr, p.top);
      band(c, -0.7, -0.9, 0.85, 0.35, 12, 13.5, p.trim);
      colonnade(c, p, -0.6, 0.35, 0.75, 0.55, 0, 13, 5, 0.05, 'L', true);
      for (const [a, b] of [[-0.92, -0.18], [0.18, 0.92]]) {
        walls(c, a, 0.55, b, 0.92, 0, 30, p.wl, p.wr, 0.1);
        top(c, a + 0.1, 0.65, b - 0.1, 0.82, 30, p.top);
        band(c, a + 0.1, 0.55, b - 0.1, 0.82, 28, 30, p.trim);
        c.strokeStyle = 'rgba(120,80,40,0.35)'; c.lineWidth = 0.5;
        for (let k = 0; k < 3; k++) { const x = a + 0.15 + k * 0.18; ln(c, P(x, 0.92, 8), P(x, 0.92, 20), 'rgba(120,80,40,0.35)', 0.5); }
        const fp = P((a + b) / 2, 0.93, 0); flag(c, fp[0], fp[1], p.trim2, 36);
      }
      box(c, -0.18, 0.62, 0.18, 0.86, 0, 20, p.wl, p.wr, p.top);
      onL(c, 0.86, -0.1, 0.1, 0, 13, '#2a2016', m);
      band(c, -0.18, 0.62, 0.18, 0.86, 18, 20, p.trim);
      m.glow.push(P(0, 0.86, 16));
      m.fires.push(P(-0.6, 1.05, 3)); m.fires.push(P(0.6, 1.05, 3));
      return;
    }
    if (st === 'asteca') {
      const H = stepPyr(c, p, 0.95, 0.5, 4, 6.5, p.wl, p.wr, p.top, 0.2);
      box(c, -0.36, -0.36, 0.36, 0.3, H, H + 9, p.wl, p.wr, p.top);
      band(c, -0.36, -0.36, 0.36, 0.3, H + 6.5, H + 9, p.trim);
      onL(c, 0.3, -0.12, 0.12, H, H + 6, '#2a1c14', m);
      // roof comb
      box(c, -0.3, -0.08, 0.3, 0.02, H + 9, H + 17, p.trim, shade(p.trim, 0.8), p.trim);
      for (let k = 0; k < 4; k++) { const q = P(-0.22 + k * 0.15, 0.02, H + 13); c.fillStyle = p.trim2; c.fillRect(q[0] - 0.8, q[1] - 1.5, 1.6, 3); }
      for (const [bx, by] of [[-0.42, 0.42], [0.42, 0.42]]) { box(c, bx - 0.05, by - 0.05, bx + 0.05, by + 0.05, H, H + 2.5, '#6a5a50', '#4a3e36', '#7a6a60'); m.fires.push(P(bx, by, H + 3)); }
      m.glow.push(P(0, 0.3, H + 3));
      return;
    }
    if (st === 'nordico') { // stave church
      const S = p.shingle;
      box(c, -0.75, -0.75, 0.75, 0.75, 0, 1.5, p.base[0], p.base[1], p.base[2]);
      walls(c, -0.55, -0.55, 0.55, 0.55, 1.5, 12, p.wl, p.wr);
      poly(c, [P(-0.75, 0.75, 7), P(0.75, 0.75, 7), P(0.55, 0.55, 11), P(-0.55, 0.55, 11)], S[0]);
      poly(c, [P(0.75, 0.75, 7), P(0.75, -0.75, 7), P(0.55, -0.55, 11), P(0.55, 0.55, 11)], S[1]);
      onL(c, 0.75, -0.1, 0.1, 1.5, 7, p.door);
      gableX(c, -0.55, -0.55, 0.55, 0.55, 12, 22, 0.08, S[0], S[1], p.wl, S[2]);
      walls(c, -0.32, -0.32, 0.32, 0.32, 18, 27, p.wl, p.wr);
      onL(c, 0.32, -0.08, 0.04, 21, 24, '#ffd27a', m); onR(c, 0.32, -0.04, 0.08, 21, 24, '#ffd27a', m);
      gableY(c, -0.32, -0.32, 0.32, 0.32, 27, 35, 0.06, S[0], S[1], p.wl, S[2]);
      box(c, -0.12, -0.12, 0.12, 0.12, 32, 38, p.wl, p.wr, S[2]);
      poly(c, [P(-0.14, 0.14, 38), P(0.14, 0.14, 38), P(0, 0, 50)], S[0]); poly(c, [P(0.14, 0.14, 38), P(0.14, -0.14, 38), P(0, 0, 50)], S[1]);
      const a1 = P(0.63, 0, 22), a2 = P(0, 0.38, 35); dragon(c, a1, 1); dragon(c, a2, -1);
      m.fires.push(P(-0.9, 0.9, 3)); m.glow.push(P(0, 0, 50));
      return;
    }
    return null;
  }
  function monument(c, m, p, st) {
    if (st === 'grego') {
      steps(c, p, 0.9, 2, 1.3, 0.1);
      box(c, -0.3, -0.3, 0.3, 0.3, 2.6, 12, p.col[0], p.col[1], p.col[0]);
      band(c, -0.3, -0.3, 0.3, 0.3, 10.5, 12, p.acc);
      statue(c, 0, 0, 12, '#c9a24a', 30, true);
      m.glow.push(P(0, 0, 34));
      return;
    }
    if (st === 'romano') {
      steps(c, p, 0.85, 2, 1.4, 0.12);
      box(c, -0.28, -0.28, 0.28, 0.28, 2.8, 9, p.col[0], p.col[1], p.col[0]);
      box(c, -0.14, -0.14, 0.14, 0.14, 9, 56, p.col[0], p.col[1], p.col[0]);
      c.strokeStyle = 'rgba(120,100,70,0.45)'; c.lineWidth = 0.6;
      for (let k = 0; k < 11; k++) { const z = 11 + k * 4.2; ln(c, P(-0.14, 0.14, z), P(0.14, 0.14, z + 2.2), 'rgba(120,100,70,0.45)', 0.6); ln(c, P(0.14, 0.14, z + 2.2), P(0.14, -0.14, z + 4.2), 'rgba(100,85,60,0.4)', 0.6); }
      box(c, -0.2, -0.2, 0.2, 0.2, 56, 58, p.col[0], p.col[1], p.col[0]);
      statue(c, 0, 0, 58, '#e0b84a', 10, true);
      m.glow.push(P(0, 0, 66));
      return;
    }
    if (st === 'asteca') {
      steps(c, p, 0.9, 3, 1.5, 0.12);
      const q = P(0, 0.1, 4.5 + 13);
      c.fillStyle = '#9a9488'; c.beginPath(); c.arc(q[0], q[1], 13, 0, TAU); c.fill();
      c.fillStyle = '#b8b2a4'; c.beginPath(); c.arc(q[0] - 0.8, q[1] - 0.6, 12.2, 0, TAU); c.fill();
      for (const [r, col] of [[10, '#2fae8f'], [7.5, '#b33a2a'], [5, '#e8c24a'], [2.6, '#b33a2a']]) { c.strokeStyle = col; c.lineWidth = 1.2; c.beginPath(); c.arc(q[0] - 0.8, q[1] - 0.6, r, 0, TAU); c.stroke(); }
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.fillStyle = '#7a746a'; c.beginPath(); c.moveTo(q[0] - 0.8 + Math.cos(a) * 5.5, q[1] - 0.6 + Math.sin(a) * 5.5); c.lineTo(q[0] - 0.8 + Math.cos(a + 0.15) * 9.5, q[1] - 0.6 + Math.sin(a + 0.15) * 9.5); c.lineTo(q[0] - 0.8 + Math.cos(a - 0.15) * 9.5, q[1] - 0.6 + Math.sin(a - 0.15) * 9.5); c.fill(); }
      m.glow.push([q[0] - 0.8, q[1] - 0.6]);
      return;
    }
    if (st === 'nordico') {
      top(c, -0.9, -0.9, 0.9, 0.9, 0.3, '#7a9a4a');
      for (const [x, y, h, w] of [[-0.4, -0.35, 26, 0.13], [0.35, -0.2, 34, 0.16], [0, 0.35, 22, 0.12]]) {
        poly(c, [P(x - w, y + w, 0), P(x + w, y + w, 0), P(x + w * 0.7, y + w * 0.7, h), P(x - w * 0.8, y + w * 0.8, h - 2)], '#a09a90');
        poly(c, [P(x + w, y + w, 0), P(x + w, y - w, 0), P(x + w * 0.7, y - w * 0.7, h - 1), P(x + w * 0.7, y + w * 0.7, h)], '#7e7870');
        const a = P(x, y + w, h * 0.2), b = P(x, y + w, h * 0.8);
        c.strokeStyle = '#b33a2a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(a[0] - 2, a[1]); c.bezierCurveTo(a[0] + 4, a[1] - 5, b[0] - 4, b[1] + 5, b[0] + 1, b[1]); c.stroke();
      }
      m.glow.push(P(0.35, -0.2, 30));
      return;
    }
    return null;
  }

  // ------------------------------ economy & civic ------------------------------
  function storehouse(c, m, p, st) {
    if (st === 'egipcio') return celeiro(c, m, p, st);
    const z = hall(c, m, p, st, { x0: -0.78, y0: -0.6, x1: 0.78, y1: 0.6, H: 13, big: false });
    if (st === 'asteca') { for (let k = 0; k < 3; k++) jar(c, P(0.9, -0.4 + k * 0.3, 0)[0], P(0.9, -0.4 + k * 0.3, 0)[1], 1.2, '#b8683a'); }
    else if (st === 'nordico') { for (let k = 0; k < 3; k++) { const q = P(0.95, -0.5 + k * 0.3, 0); barrel(c, q[0], q[1], 1.1); } }
    else { for (let k = 0; k < 3; k++) { const q = P(-0.4 + k * 0.3, 0.8, 0); jar(c, q[0], q[1], 1.1, st === 'grego' ? '#c87a4a' : '#b8683a'); } }
    return z;
  }
  function celeiro(c, m, p, st) {
    if (st === 'egipcio') {
      box(c, -0.85, -0.85, 0.85, 0.85, 0, 2.5, p.base[0], p.base[1], p.base[2]);
      for (const [x, y] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
        const b = P(x, y, 2.5); const g = c.createLinearGradient(b[0] - 7, 0, b[0] + 7, 0); g.addColorStop(0, p.wl); g.addColorStop(1, p.wr);
        c.fillStyle = g; c.beginPath(); c.moveTo(b[0] - 7, b[1]); c.bezierCurveTo(b[0] - 7, b[1] - 14, b[0] - 3, b[1] - 20, b[0], b[1] - 21); c.bezierCurveTo(b[0] + 3, b[1] - 20, b[0] + 7, b[1] - 14, b[0] + 7, b[1]); c.fill();
        c.fillStyle = '#3a2a1c'; c.beginPath(); c.arc(b[0] - 1.5, b[1] - 15, 1.2, 0, TAU); c.fill();
      }
      return 24;
    }
    if (st === 'asteca') {
      top(c, -0.85, -0.85, 0.85, 0.85, 0.5, p.top);
      for (const [x, y] of [[-0.35, -0.4], [0.4, -0.3], [0, 0.4]]) {
        const b = P(x, y, 0); c.fillStyle = '#b87a4a'; c.beginPath(); c.moveTo(b[0] - 4, b[1]); c.bezierCurveTo(b[0] - 8, b[1] - 8, b[0] - 5, b[1] - 16, b[0] - 3, b[1] - 16); c.lineTo(b[0] + 3, b[1] - 16); c.bezierCurveTo(b[0] + 5, b[1] - 16, b[0] + 8, b[1] - 8, b[0] + 4, b[1]); c.fill();
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.moveTo(b[0] + 1, b[1]); c.bezierCurveTo(b[0] + 6, b[1] - 8, b[0] + 4, b[1] - 15, b[0] + 3, b[1] - 16); c.lineTo(b[0] + 1, b[1] - 16); c.fill();
        c.fillStyle = p.thatch[0]; c.beginPath(); c.moveTo(b[0] - 6, b[1] - 15); c.lineTo(b[0], b[1] - 23); c.lineTo(b[0] + 6, b[1] - 15); c.ellipse(b[0], b[1] - 15, 6, 2.2, 0, 0, Math.PI); c.fill();
      }
      return 26;
    }
    if (st === 'nordico') { // raised storehouse on posts
      for (const [x, y] of [[-0.5, -0.4], [0.5, -0.4], [0.5, 0.4], [-0.5, 0.4]]) box(c, x - 0.05, y - 0.05, x + 0.05, y + 0.05, 0, 6, '#5a4030', '#4a3222', '#6a4a36');
      box(c, -0.6, -0.48, 0.6, 0.48, 6, 7, '#6a4a30', '#4e3620', '#7a5a3a');
      walls(c, -0.55, -0.42, 0.55, 0.42, 7, 15, p.wl, p.wr);
      onL(c, 0.42, -0.1, 0.1, 7, 13, p.door);
      poly(c, [P(-0.1, 0.9, 0), P(0.1, 0.9, 0), P(0.1, 0.44, 7), P(-0.1, 0.44, 7)], '#7a5a3a');
      roof(c, m, p, -0.55, -0.42, 0.55, 0.42, 15, { rh: 10 });
      return 28;
    }
    const z = hall(c, m, p, st, { x0: -0.85, y0: -0.55, x1: 0.85, y1: 0.55, H: 12 });
    for (let k = 0; k < 4; k++) { const q = P(-0.5 + k * 0.3, 0.75, 0); c.fillStyle = '#d8c090'; c.beginPath(); c.ellipse(q[0], q[1] - 2, 2, 2.4, 0, 0, TAU); c.fill(); c.fillStyle = '#b89a60'; c.fillRect(q[0] - 0.6, q[1] - 4.8, 1.2, 0.8); }
    return z;
  }
  function workshop(c, m, p, st) {
    const z = hall(c, m, p, st, { x0: -0.8, y0: -0.8, x1: 0.25, y1: 0.75, H: 13 });
    box(c, -0.6, -0.62, -0.38, -0.4, 8, 32, st === 'nordico' ? '#6a6258' : '#8a8378', st === 'nordico' ? '#524a42' : '#6c655b', '#57504a');
    m.fires.push(P(-0.49, -0.51, 33));
    for (const [px, py] of [[0.8, -0.6], [0.8, 0.7]]) box(c, px - 0.04, py - 0.04, px + 0.02, py + 0.02, 0, 10, '#6e4a2c', '#553820', '#6e4a2c');
    poly(c, [P(0.25, -0.75, 12), P(0.88, -0.75, 10), P(0.88, 0.8, 10), P(0.25, 0.8, 12)], st === 'nordico' ? '#5a7631' : shade(p.roof ? p.roof[1] : '#7d6a55', 1), '#4a3a2a', 0.4);
    box(c, 0.45, 0.05, 0.62, 0.3, 0, 3.5, '#3c3c40', '#2a2a2e', '#55555c');
    box(c, 0.4, 0.1, 0.68, 0.25, 3.5, 5, '#4a4a52', '#34343a', '#707078');
    m.glow.push(P(0.54, 0.18, 6));
    return z;
  }
  function quartel(c, m, p, st) {
    box(c, -0.92, -0.92, 0.92, 0.92, 0, 1.5, p.base[0], p.base[1], p.base[2]);
    hall(c, m, p, st, { x0: -0.82, y0: -0.82, x1: 0.3, y1: 0.72, H: 13, plinth: 3 });
    box(c, 0.52, -0.72, 0.62, 0.62, 5, 6.2, '#6e4a2c', '#553820', '#7a5634');
    for (const py of [-0.6, -0.36, -0.12, 0.12, 0.36, 0.56]) {
      const a = P(0.6, py, 1.5), b = P(0.6, py, 17); ln(c, a, b, '#6e4a2c', 0.8);
      c.fillStyle = '#c4c8d0'; c.beginPath(); c.moveTo(b[0] - 0.9, b[1]); c.lineTo(b[0], b[1] - 2.8); c.lineTo(b[0] + 0.9, b[1]); c.fill();
    }
    // shields of the culture hang on the rack
    for (const py of [-0.45, 0.0, 0.45]) {
      const q = P(0.66, py, 8);
      c.fillStyle = st === 'romano' ? '#a8322a' : st === 'grego' ? '#c9a24a' : st === 'asteca' ? '#2fae8f' : st === 'egipcio' ? '#e8d8b8' : '#9a6a3a';
      if (st === 'romano') c.fillRect(q[0] - 1.6, q[1] - 2.6, 3.2, 5.2); else { c.beginPath(); c.ellipse(q[0], q[1], 2, 2.4, 0, 0, TAU); c.fill(); }
      c.fillStyle = '#e8c24a'; c.beginPath(); c.arc(q[0], q[1], 0.6, 0, TAU); c.fill();
    }
    m.fires.push(P(-0.2, 0.9, 3));
    return 30;
  }
  function torre(c, m, p, st) {
    if (st === 'nordico') return null;
    const e = 0.34;
    box(c, -0.42, -0.42, 0.42, 0.42, 0, 3, p.base[0], p.base[1], p.base[2]);
    walls(c, -e, -e, e, e, 3, 34, p.wl, p.wr, 0.03);
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.35;
    for (let z = 7; z < 34; z += 3.5) { ln(c, P(-e, e, z), P(e, e, z), 'rgba(0,0,0,0.1)', 0.35); ln(c, P(e, e, z), P(e, -e, z), 'rgba(0,0,0,0.1)', 0.35); }
    onL(c, e - 0.02, -0.06, 0.06, 20, 25, p.win, m); onR(c, e - 0.02, -0.06, 0.06, 26, 30, p.win, m);
    top(c, -e - 0.04, -e - 0.04, e + 0.04, e + 0.04, 34, p.top || p.base[2]);
    for (let k = 0; k < 4; k++) { const a = -e + k * (2 * e / 3.5); box(c, a, e - 0.02, a + 0.1, e + 0.04, 34, 38, p.wl, p.wr, p.wl); box(c, e - 0.02, a, e + 0.04, a + 0.1, 34, 38, p.wl, p.wr, p.wl); }
    if (p.trim) band(c, -e, -e, e, e, 30.5, 32, p.trim);
    m.fires.push(P(0.1, 0.1, 36));
    return 40;
  }
  function praca(c, m, p, st) {
    // (the pavement itself is drawn on the ground layer, so people can walk over it)
    if (st === 'nordico') {
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; const x = Math.cos(a) * 0.72, y = Math.sin(a) * 0.72; box(c, x - 0.06, y - 0.05, x + 0.06, y + 0.05, 0, 8 + (k % 3) * 2, '#a09a90', '#7e7870', '#b8b2a8'); }
      box(c, -0.18, -0.12, 0.18, 0.14, 0, 3.5, '#9a948a', '#787268', '#b0aa9e');
      statue(c, 0, 0, 3.5, '#6a4a30', 7, false);
      return 14;
    }
    if (st === 'grego') { // stoa along the back
      box(c, -0.9, -0.9, 0.9, -0.62, 0.4, 12, p.wl, p.wr, p.top);
      colonnade(c, p, -0.9, -0.62, 0.9, -0.5, 0.4, 12, 7, 0.035, 'L');
      gableX(c, -0.92, -0.92, 0.92, -0.48, 12, 16, 0.04, p.roof[0], p.roof[1], p.gable, p.roof[2]);
      statue(c, 0.15, 0.2, 0.4, '#f0ebe0', 12, true); basin(c, -0.45, 0.35, 0.18, 0.5);
      return 20;
    }
    if (st === 'romano') {
      box(c, -0.4, -0.9, 0.5, -0.55, 0.4, 5, p.base[0], p.base[1], p.base[2]); // rostra
      for (const x of [-0.3, -0.05, 0.2, 0.45]) column(c, p, x, -0.5, 0.4, 5.5, 0.02);
      box(c, 0.45, 0.45, 0.6, 0.6, 0.4, 3, p.col[0], p.col[1], p.col[0]);
      box(c, 0.5, 0.5, 0.55, 0.55, 3, 26, p.col[0], p.col[1], p.col[0]);
      statue(c, 0.525, 0.525, 26, '#e0b84a', 6, false);
      statue(c, -0.4, 0.3, 0.4, '#b8a888', 10, true);
      m.glow.push(P(0.525, 0.525, 30));
      return 34;
    }
    if (st === 'egipcio') {
      const pts = [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]];
      for (const [x, y] of pts) { const q = P(x, y, 0.4); palm(c, q[0], q[1], 1.1); }
      box(c, -0.12, -0.12, 0.12, 0.12, 0.4, 3, p.base[0], p.base[1], p.base[2]);
      poly(c, [P(-0.08, 0.08, 3), P(0.08, 0.08, 3), P(0.05, 0.05, 30), P(-0.05, 0.05, 30)], '#e6dfcc');
      poly(c, [P(0.08, 0.08, 3), P(0.08, -0.08, 3), P(0.05, -0.05, 30), P(0.05, 0.05, 30)], '#bdb39c');
      const t = P(0, 0, 34); poly(c, [P(-0.05, 0.05, 30), P(0.05, 0.05, 30), t], '#f7d66a'); poly(c, [P(0.05, 0.05, 30), P(0.05, -0.05, 30), t], '#d9a93a');
      m.glow.push(t);
      return 36;
    }
    if (st === 'asteca') {
      box(c, -0.2, -0.2, 0.2, 0.2, 0.4, 3.5, p.wl, p.wr, p.top); band(c, -0.2, -0.2, 0.2, 0.2, 2.4, 3.5, p.trim);
      m.fires.push(P(0, 0, 4.5));
      const cols = [['#b33a2a', '#f1e9d6'], ['#2fae8f', '#f1e9d6'], ['#e8b83a', '#b33a2a']];
      for (const [x, y, k] of [[-0.55, -0.55, 0], [0.55, -0.5, 1], [-0.55, 0.5, 2], [0.5, 0.55, 0]]) stall(c, p, x, y, cols[k][0], cols[k][1]);
      return 14;
    }
    // classic: fountain
    basin(c, 0, 0, 0.58, 0.8, '#5aaed0'); box(c, -0.06, -0.06, 0.06, 0.06, 0.8, 7, '#c8c0b0', '#a8a090', '#d8d0c0');
    c.fillStyle = 'rgba(200,235,255,0.85)'; const f = P(0, 0, 8); c.beginPath(); c.arc(f[0], f[1], 1.8, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(200,235,255,0.7)'; c.lineWidth = 0.6; for (const dx of [-3, 3]) { c.beginPath(); c.moveTo(f[0], f[1]); c.quadraticCurveTo(f[0] + dx, f[1] - 2, f[0] + dx * 1.6, f[1] + 5); c.stroke(); }
    for (const [x, y] of [[-0.75, 0.7], [0.7, -0.75], [-0.75, -0.75]]) { const q = P(x, y, 0.4); tree(c, q[0], q[1], 1.1); }
    return 10;
  }
  function mercado(c, m, p, st) {
    const e = 0.92;
    pave(c, e, st === 'nordico' ? '#a08a66' : st === 'egipcio' ? '#e2cfa2' : '#d9d0bc');
    const AW = {
      classico: [['#c8483a', '#f4efe3'], ['#3f7fd8', '#f4efe3'], ['#e8b83a', '#8a3a2a']],
      grego: [['#3f6fb0', '#f4efe3'], ['#c8683f', '#f4efe3'], ['#3f6fb0', '#e8b83a']],
      romano: [['#a8322a', '#efe2c4'], ['#d8a63a', '#efe2c4'], ['#6a2a5a', '#efe2c4']],
      egipcio: [['#f1ead6', '#2f8f8a'], ['#f1ead6', '#b8452f'], ['#e8b83a', '#f1ead6']],
      asteca: [['#b33a2a', '#2fae8f'], ['#e8b83a', '#b33a2a'], ['#2fae8f', '#f1e9d6']],
      nordico: [['#8a3a2a', '#d8c8a0'], ['#4a6a3a', '#d8c8a0'], ['#7a5a3a', '#c8a060']],
    }[st] || [['#c8483a', '#f4efe3']];
    if (st === 'romano') { // macellum tholos
      box(c, -0.3, -0.3, 0.3, 0.3, 0.4, 2, p.base[0], p.base[1], p.base[2]);
      colonnade(c, p, -0.25, -0.25, 0.25, 0.25, 2, 12, 3, 0.03, 'BLR');
      const d = P(0, 0, 12); dome(c, d[0], d[1], 11, 7, p.roof[0], p.roof[2], '#d8a63a');
    } else if (st === 'grego') {
      box(c, -0.9, -0.9, 0.9, -0.6, 0.4, 10, p.wl, p.wr, p.top);
      colonnade(c, p, -0.9, -0.6, 0.9, -0.5, 0.4, 10, 6, 0.03, 'L');
      gableX(c, -0.92, -0.92, 0.92, -0.48, 10, 13.5, 0.04, p.roof[0], p.roof[1], p.gable, p.roof[2]);
    } else if (st === 'nordico') { for (const [x, y] of [[-0.6, -0.6], [0.6, -0.55]]) { box(c, x - 0.22, y - 0.18, x + 0.22, y + 0.18, 0.4, 7, p.wl, p.wr, p.wl); gableX(c, x - 0.22, y - 0.18, x + 0.22, y + 0.18, 7, 12, 0.05, p.roof[0], p.roof[1], p.gable, p.roof[2]); } }
    const spots = [[-0.55, 0.1], [0.1, -0.5], [0.45, 0.2], [-0.2, 0.6], [0.6, 0.65]];
    spots.forEach(([x, y], k) => { if (st === 'romano' && Math.abs(x) < 0.35 && Math.abs(y) < 0.35) return; stall(c, p, x, y, AW[k % AW.length][0], AW[k % AW.length][1]); });
    if (st === 'egipcio' || st === 'asteca') for (let k = 0; k < 4; k++) { const q = P(-0.8 + k * 0.12, 0.85, 0.4); jar(c, q[0], q[1], 1, k % 2 ? '#b8683a' : '#c88a4a'); }
    if (st === 'nordico') for (let k = 0; k < 3; k++) { const q = P(0.85, -0.1 + k * 0.2, 0.4); barrel(c, q[0], q[1], 1); }
    if (st === 'egipcio') { const q = P(0.8, -0.8, 0.4); palm(c, q[0], q[1], 1); }
    return 26;
  }
  function biblioteca(c, m, p, st) {
    if (st === 'egipcio' || st === 'asteca') {
      const z = hall(c, m, p, st, { x0: -0.8, y0: -0.8, x1: 0.8, y1: 0.35, H: 16 });
      colonnade(c, p, -0.7, 0.35, 0.7, 0.62, 2, 14, 5, 0.045, 'L', st === 'egipcio');
      top(c, -0.8, 0.35, 0.8, 0.66, 14, p.top); band(c, -0.8, 0.35, 0.8, 0.66, 12.5, 14, p.trim);
      return z + 4;
    }
    if (st === 'nordico') { hall(c, m, p, st, { x0: -0.8, y0: -0.5, x1: 0.8, y1: 0.5, H: 16 }); for (const x of [-0.6, 0.6]) { box(c, x - 0.04, 0.72, x + 0.04, 0.8, 0, 12, '#6a4a30', '#4e3620', '#7a5a3a'); dragon(c, P(x, 0.76, 12), x > 0 ? 1 : -1); } return 32; }
    plinth(c, p, -0.85, -0.85, 0.85, 0.85, 2.5);
    walls(c, -0.7, -0.8, 0.75, 0.3, 2.5, 17, p.wl, p.wr);
    winsR(c, m, p, 0.75, -0.8, 0.3, 9, 5, 2);
    colonnade(c, p, -0.7, 0.3, 0.75, 0.68, 2.5, 17, 5, 0.04, 'L');
    onL(c, 0.3, -0.12, 0.12, 2.5, 11, '#3a2e24', m);
    box(c, -0.75, -0.85, 0.8, 0.72, 17, 19, p.col[0], p.col[1], p.col[0]);
    const zr = st === 'romano' ? roof(c, m, p, -0.75, -0.85, 0.8, 0.72, 19, { kind: 'hip' }) : (gableY(c, -0.75, -0.85, 0.8, 0.72, 19, 28, 0.04, p.roof[0], p.roof[1], p.gable, p.roof[2]), 28);
    const s = P(0, 0.72, 22); c.fillStyle = '#e8d8a8'; c.fillRect(s[0] - 2.5, s[1] - 1.5, 5, 3); c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.4; c.strokeRect(s[0] - 2.5, s[1] - 1.5, 5, 3);
    return zr;
  }
  function teatro(c, m, p, st) {
    const e = 1.4;
    if (st === 'egipcio') { // sacred garden with a pool
      top(c, -e, -e, e, e, 0.3, '#86a84e');
      box(c, -e, -e, e, -e + 0.08, 0, 5, p.wl, p.wr, p.top); box(c, -e, -e, -e + 0.08, e, 0, 5, p.wl, p.wr, p.top);
      box(c, -0.7, -0.5, 0.7, 0.5, 0, 1.6, p.base[0], p.base[1], p.base[2]); top(c, -0.62, -0.42, 0.62, 0.42, 1.2, '#4a9ac0');
      for (let k = 0; k < 6; k++) { const q = P(-0.5 + k * 0.2, -0.2 + (k % 2) * 0.35, 1.3); c.fillStyle = k % 2 ? '#f0a0c0' : '#5a9a3c'; c.beginPath(); c.ellipse(q[0], q[1], 1.6, 0.8, 0, 0, TAU); c.fill(); }
      for (const [x, y] of [[-1.1, -0.9], [-0.9, 1.1], [1.1, -1.1], [1.1, 0.9], [0, -1.15], [-1.15, 0.1]]) { const q = P(x, y, 0.3); palm(c, q[0], q[1], 1.2); }
      const sp = P(0.95, 0.95, 0.3); c.fillStyle = p.wl; c.fillRect(sp[0] - 4, sp[1] - 5, 8, 5); c.beginPath(); c.arc(sp[0] - 3, sp[1] - 7, 2.2, 0, TAU); c.fill();
      return 20;
    }
    if (st === 'asteca') { // ball court
      top(c, -e, -e, e, e, 0.3, p.top);
      for (const [y0, y1] of [[-1.2, -0.45], [0.45, 1.2]]) { walls(c, -1.2, y0, 1.2, y1, 0, 7, p.wl, p.wr); top(c, -1.2, y0, 1.2, y1, 7, p.top); band(c, -1.2, y0, 1.2, y1, 5.5, 7, p.trim); }
      poly(c, [P(-1.2, -0.45, 7), P(1.2, -0.45, 7), P(1.2, -0.25, 0.3), P(-1.2, -0.25, 0.3)], shade(p.wl, 0.95));
      top(c, -1.2, -0.25, 1.2, 0.25, 0.4, '#b8a888');
      const r = P(0, -0.3, 4.5); c.strokeStyle = '#6a645a'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(r[0], r[1], 1.8, 2.2, 0, 0, TAU); c.stroke();
      band(c, -1.2, -0.25, 1.2, 0.25, 0.3, 0.6, p.trim2);
      return 16;
    }
    if (st === 'nordico') { longhouse(c, m, p, 1.25, 0.6, 9, 22, true); return 36; }
    if (st === 'romano') { bowl(c, 1.35, 26, '#e0c79a', '#b09268', '#c8b8a0', '#e8d8a8', 2); return 34; }
    // Greek (and classic) theatre: a half bowl opening to the front
    top(c, -e, -e, e, e, 0.2, '#b8b09c');
    bowl(c, 1.3, 16, p.wl, p.wr, '#d8d0bc', '#e8dcc0', 0, true);
    box(c, -0.9, 0.85, 0.9, 1.15, 0, 9, p.wl, p.wr, p.top);
    colonnade(c, p, -0.85, 1.15, 0.85, 1.25, 0, 7, 6, 0.03, 'L');
    if (st === 'grego') { band(c, -0.9, 0.85, 0.9, 1.15, 7.5, 9, p.acc); }
    const o = P(0, 0.3, 0.3); c.fillStyle = '#e8dcc0'; c.beginPath(); c.ellipse(o[0], o[1], 12, 6, 0, 0, TAU); c.fill();
    return 26;
  }
  function banhos(c, m, p, st) {
    if (st === 'egipcio') { // sacred lake
      box(c, -0.9, -0.9, 0.9, 0.9, 0, 1.4, p.base[0], p.base[1], p.base[2]);
      top(c, -0.75, -0.75, 0.75, 0.75, 1, '#3f8fb8');
      for (let k = 0; k < 4; k++) ln(c, P(-0.75 + k * 0.04, 0.75 - k * 0.04, 1.4 - k * 0.1), P(0.75 - k * 0.04, 0.75 - k * 0.04, 1.4 - k * 0.1), 'rgba(0,0,0,0.15)', 0.4);
      c.fillStyle = 'rgba(255,255,255,0.3)'; const w = P(-0.2, -0.1, 1); c.beginPath(); c.ellipse(w[0], w[1], 8, 2, 0, 0, TAU); c.fill();
      for (const [x, y] of [[0.8, -0.8], [-0.8, 0.8]]) { const q = P(x, y, 1.4); palm(c, q[0], q[1], 1); }
      return 18;
    }
    if (st === 'asteca' || st === 'nordico') {
      if (st === 'nordico') { box(c, -0.5, -0.4, 0.5, 0.4, 0, 1, p.base[0], p.base[1], p.base[2]); walls(c, -0.45, -0.35, 0.45, 0.35, 1, 8, p.wl, p.wr);
        for (let z = 2; z < 8; z += 1.4) { ln(c, P(-0.45, 0.35, z), P(0.45, 0.35, z), 'rgba(30,20,10,0.4)', 0.5); ln(c, P(0.45, 0.35, z), P(0.45, -0.35, z), 'rgba(30,20,10,0.4)', 0.5); }
        onL(c, 0.35, -0.08, 0.08, 1, 6, p.door); const zr = roof(c, m, p, -0.45, -0.35, 0.45, 0.35, 8, { rh: 9 }); m.fires.push(P(0.1, 0, zr)); m.fires.push(P(-0.1, 0, zr)); return zr + 4; }
      top(c, -0.8, -0.8, 0.8, 0.8, 0.4, p.top);
      const b = P(0, 0, 0.4); const g = c.createLinearGradient(b[0] - 14, 0, b[0] + 14, 0); g.addColorStop(0, '#c8b8a0'); g.addColorStop(1, '#8a7a68');
      c.fillStyle = g; c.beginPath(); c.ellipse(b[0], b[1], 14, 7, 0, 0, Math.PI); c.lineTo(-14, b[1]); c.ellipse(b[0], b[1], 14, 16, 0, Math.PI, TAU); c.fill();
      c.fillStyle = '#2a1c14'; c.beginPath(); c.ellipse(b[0] - 4, b[1] + 3, 2.5, 3, 0, Math.PI, TAU); c.fill();
      band(c, -0.6, -0.6, 0.6, 0.6, 0.4, 1.5, p.trim);
      m.fires.push(P(0, 0, 18)); m.fires.push(P(0.2, -0.1, 16));
      return 22;
    }
    // thermae: low vaulted halls around a great dome
    plinth(c, p, -0.9, -0.9, 0.9, 0.9, 2);
    walls(c, -0.85, -0.85, 0.85, 0.85, 2, 11, p.wl, p.wr);
    for (const a of [-0.6, -0.15, 0.3]) { const pts = [P(a, 0.85, 3), P(a + 0.22, 0.85, 3), P(a + 0.22, 0.85, 7.5), P(a + 0.11, 0.85, 9), P(a, 0.85, 7.5)]; poly(c, pts, p.win); m.win.push(pts); const q = [P(0.85, a, 3), P(0.85, a + 0.22, 3), P(0.85, a + 0.22, 7.5), P(0.85, a + 0.11, 9), P(0.85, a, 7.5)]; poly(c, q, p.win); m.win.push(q); }
    top(c, -0.85, -0.85, 0.85, 0.85, 11, p.top || p.base[2]);
    band(c, -0.85, -0.85, 0.85, 0.85, 10, 11, p.trim);
    box(c, -0.45, -0.45, 0.45, 0.45, 11, 15, p.wl, p.wr, p.top || p.base[2]);
    const d = P(0, 0, 15); const tip = dome(c, d[0], d[1], 13, 13, st === 'romano' ? '#d8c8a8' : '#ece4d4', st === 'romano' ? '#a8987a' : '#bcb4a4', '#d8a63a');
    m.fires.push([d[0] - 4, d[1] - 4]); m.fires.push([d[0] + 5, d[1] - 3]);
    return 34;
  }
  function palacio(c, m, p, st) {
    if (st === 'asteca') {
      box(c, -1.4, -1.4, 1.4, 1.4, 0, 6, p.base[0], p.base[1], p.base[2]);
      poly(c, [P(-0.35, 1.6, 0), P(0.35, 1.6, 0), P(0.35, 1.4, 6), P(-0.35, 1.4, 6)], shade(p.base[2], 1.05));
      walls(c, -1.2, -1.2, 1.2, 0.6, 6, 18, p.wl, p.wr);
      colonnade(c, p, -1.1, 0.6, 1.1, 1.05, 6, 16, 7, 0.05, 'L');
      top(c, -1.25, 0.55, 1.25, 1.1, 16, p.top);
      band(c, -1.2, -1.2, 1.2, 1.1, 16, 18, p.trim); band(c, -1.2, -1.2, 1.2, 1.1, 18, 19, p.trim2);
      top(c, -1.2, -1.2, 1.2, 1.1, 19, p.top);
      for (const x of [-0.9, 0, 0.9]) { const q = P(x, 1.1, 19); c.fillStyle = '#2fae8f'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(q[0] + k * 1.3, q[1] - 5, 0.8, 4, k * 0.25, 0, TAU); c.fill(); } }
      m.fires.push(P(-1.2, 1.3, 7)); m.fires.push(P(1.2, 1.3, 7));
      return 34;
    }
    if (st === 'egipcio') {
      box(c, -1.3, -1.3, 1.3, 0.5, 0, 18, p.wl, p.wr, p.top); band(c, -1.3, -1.3, 1.3, 0.5, 15, 16.5, p.trim); band(c, -1.3, -1.3, 1.3, 0.5, 16.5, 18, p.trim2);
      winsR(c, m, p, 1.3, -1.3, 0.5, 9, 4, 3);
      colonnade(c, p, -1.2, 0.5, 1.2, 0.95, 0, 15, 7, 0.06, 'L', true);
      top(c, -1.3, 0.45, 1.3, 1.0, 15, p.top);
      for (const [a, b] of [[-1.3, -0.35], [0.35, 1.3]]) { walls(c, a, 1.0, b, 1.35, 0, 26, p.wl, p.wr, 0.08); top(c, a + 0.08, 1.08, b - 0.08, 1.27, 26, p.top); band(c, a + 0.08, 1.0, b - 0.08, 1.27, 24, 26, p.trim); const fp = P((a + b) / 2, 1.36, 0); flag(c, fp[0], fp[1], '#e8b83a', 32); }
      onL(c, 1.2, -0.2, 0.2, 0, 14, '#2a2016', m);
      return 38;
    }
    if (st === 'nordico') { longhouse(c, m, p, 1.35, 0.75, 10, 26, true); const a = P(-0.9, 0.95, 0); flag(c, a[0], a[1], '#a23c2a', 30); return 40; }
    if (st === 'romano') {
      plinth(c, p, -1.4, -1.4, 1.4, 1.4, 2.5);
      walls(c, -1.3, -1.3, 1.3, 0.7, 2.5, 20, p.wl, p.wr);
      winsR(c, m, p, 1.3, -1.3, 0.7, 7, 4, 4); winsR(c, m, p, 1.3, -1.3, 0.7, 14, 4, 4);
      colonnade(c, p, -1.2, 0.7, 1.2, 1.15, 2.5, 18, 7, 0.05, 'L');
      box(c, -1.3, 0.65, 1.3, 1.2, 18, 20, p.col[0], p.col[1], p.col[0]);
      hip(c, -1.3, -1.3, 1.3, 1.2, 20, 32, 0.06, p.roof[0], p.roof[1], p.roof[2]);
      const d = P(0, -0.2, 29); const tip = dome(c, d[0], d[1], 12, 12, '#d8c8a8', '#a8987a', '#e0b84a'); m.glow.push(tip);
      return 52;
    }
    // Greek & classic palace: a great hall with a pedimented front
    plinth(c, p, -1.4, -1.4, 1.4, 1.4, 2.5);
    walls(c, -1.25, -1.3, 1.25, 0.7, 2.5, 20, p.wl, p.wr);
    winsR(c, m, p, 1.25, -1.3, 0.7, 8, 5, 4);
    colonnade(c, p, -1.1, 0.7, 1.1, 1.2, 2.5, 20, 6, 0.055, 'L');
    box(c, -1.3, -1.35, 1.3, 1.25, 20, 22.5, p.col[0], p.col[1], p.col[0]);
    band(c, -1.3, -1.35, 1.3, 1.25, 21, 22, p.acc);
    gableY(c, -1.3, -1.35, 1.3, 1.25, 22.5, 34, 0.05, p.roof[0], p.roof[1], p.gable, p.roof[2]);
    const e = P(0, 1.25, 27); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(e[0], e[1], 2, 0, TAU); c.fill(); m.glow.push(e);
    return 40;
  }
  function doca(c, m, p, st, wd) {
    const [dx, dy] = wd || [1, 0];
    // pier planks reaching out over the water
    const px = dx * 1.5, py = dy * 1.5;
    const w = 0.18;
    const a0 = dx ? [dx * 0.9, -w] : [-w, dy * 0.9], a1 = dx ? [dx * 0.9 + px, w] : [w, dy * 0.9 + py];
    const X0 = Math.min(a0[0], a1[0]), X1 = Math.max(a0[0], a1[0]), Y0 = Math.min(a0[1], a1[1]), Y1 = Math.max(a0[1], a1[1]);
    for (let k = 0; k <= 4; k++) { const f = k / 4; const x = dx ? X0 + (X1 - X0) * f : 0, y = dy ? Y0 + (Y1 - Y0) * f : 0; box(c, x - 0.03, y - 0.03, x + 0.03, y + 0.03, -3, 1.6, '#5a3a20', '#4a2e18', '#6a4a2a'); }
    box(c, X0, Y0, X1, Y1, 1.6, 2.4, '#9a7448', '#7a5a36', '#b08a5a');
    c.strokeStyle = 'rgba(60,40,20,0.35)'; c.lineWidth = 0.35;
    for (let k = 1; k < 10; k++) { const f = k / 10; if (dx) ln(c, P(X0 + (X1 - X0) * f, Y0, 2.4), P(X0 + (X1 - X0) * f, Y1, 2.4), 'rgba(60,40,20,0.35)', 0.35); else ln(c, P(X0, Y0 + (Y1 - Y0) * f, 2.4), P(X1, Y0 + (Y1 - Y0) * f, 2.4), 'rgba(60,40,20,0.35)', 0.35); }
    // quay & warehouse
    top(c, -0.95, -0.95, 0.95, 0.95, 1.6, '#a88a5e');
    const z = hall(c, m, p, st, { x0: -0.8, y0: -0.8, x1: 0.1, y1: 0.2, H: 11, plinth: 1.6 });
    // crane
    const cp = [0.5, 0.5]; ln(c, P(cp[0], cp[1], 1.6), P(cp[0], cp[1], 20), '#6a4526', 1.1);
    const tip = P(cp[0] + dx * 0.9, cp[1] + dy * 0.9, 22); ln(c, P(cp[0], cp[1], 20), tip, '#6a4526', 0.9);
    ln(c, tip, [tip[0], tip[1] + 9], 'rgba(40,30,20,0.8)', 0.4); c.fillStyle = '#7a5230'; c.fillRect(tip[0] - 1.5, tip[1] + 9, 3, 2.5);
    for (let k = 0; k < 3; k++) { const q = P(0.3 + k * 0.18, -0.6, 1.6); barrel(c, q[0], q[1], 1); }
    return Math.max(z, 26);
  }
  function aqueduto(c, m, p, st) {
    if (st === 'egipcio') {
      box(c, -0.45, -0.45, 0.45, 0.45, 0, 4, p.base[0], p.base[1], p.base[2]); top(c, -0.36, -0.36, 0.36, 0.36, 3.4, '#3f8fb8');
      ln(c, P(0.3, 0.3, 4), P(0.3, 0.3, 14), '#7a5a3a', 1); ln(c, P(-0.2, 0.1, 18), P(0.6, 0.5, 10), '#7a5a3a', 0.9);
      return 22;
    }
    if (st === 'nordico') {
      for (const [x, y] of [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]]) box(c, x - 0.04, y - 0.04, x + 0.04, y + 0.04, 0, 12, '#5a4030', '#4a3222', '#6a4a36');
      const b = P(0, 0, 12); c.fillStyle = '#7a5230'; c.fillRect(b[0] - 9, b[1] - 9, 18, 9); c.fillStyle = '#5a3a20'; for (let k = 0; k < 3; k++) c.fillRect(b[0] - 9, b[1] - 8 + k * 3, 18, 0.6);
      c.fillStyle = '#9a7040'; c.beginPath(); c.ellipse(b[0], b[1] - 9, 9, 3.5, 0, 0, TAU); c.fill(); c.fillStyle = '#4a9ac0'; c.beginPath(); c.ellipse(b[0], b[1] - 9, 7.5, 2.8, 0, 0, TAU); c.fill();
      return 26;
    }
    const e = 0.38;
    plinth(c, p, -e, -e, e, e, 2);
    walls(c, -e, -e, e, e, 2, 18, p.wl, p.wr, p.batter);
    for (const [a] of [[-0.18], [0.1]]) { onL(c, e, a, a + 0.1, 2, 9, 'rgba(40,30,25,0.6)'); onR(c, e, a, a + 0.1, 2, 9, 'rgba(40,30,25,0.6)'); }
    if (p.trim) band(c, -e, -e, e, e, 15, 16.5, p.trim);
    top(c, -e, -e, e, e, 18, p.top || p.base[2]); top(c, -e + 0.07, -e + 0.07, e - 0.07, e - 0.07, 18.2, '#4a9ac0');
    if (st === 'romano' || st === 'grego' || st === 'classico') roof(c, m, p, -e - 0.02, -e - 0.02, e + 0.02, e + 0.02, 18, { kind: 'hip', rh: 6 });
    return 28;
  }
  // ------------------------------ wonders ------------------------------
  function maravilha(c, m, p, st) {
    if (st === 'egipcio') { // the Great Pyramid
      const e = 1.45, H = 74;
      box(c, -1.5, -1.5, 1.5, 1.5, 0, 1, p.base[0], p.base[1], p.base[2]);
      poly(c, [P(-e, e, 1), P(e, e, 1), P(0, 0, H)], '#efe3c2');
      poly(c, [P(e, e, 1), P(e, -e, 1), P(0, 0, H)], '#c9b48a');
      for (let k = 1; k < 18; k++) { const f = k / 18; const q = e * (1 - f), z = 1 + (H - 1) * f; ln(c, P(-q, q, z), P(q, q, z), 'rgba(140,110,70,0.25)', 0.4); ln(c, P(q, q, z), P(q, -q, z), 'rgba(90,70,40,0.25)', 0.4); }
      const k = 0.1; poly(c, [P(-e * k, e * k, H * (1 - k)), P(e * k, e * k, H * (1 - k)), P(0, 0, H)], '#ffe27a'); poly(c, [P(e * k, e * k, H * (1 - k)), P(e * k, -e * k, H * (1 - k)), P(0, 0, H)], '#d9a93a');
      m.glow.push(P(0, 0, H - 3));
      onL(c, e * 0.62, -0.08, 0.08, 20, 26, '#3a2a1c');
      return H + 4;
    }
    if (st === 'asteca') { // Templo Mayor, twin shrines
      const H = stepPyr(c, p, 1.45, 0.7, 5, 7.5, p.wl, p.wr, p.top, 0.16);
      for (const [x, col] of [[-0.35, '#3f7fd8'], [0.35, '#c8382a']]) {
        box(c, x - 0.28, -0.4, x + 0.28, 0.35, H, H + 10, p.wl, p.wr, p.top);
        band(c, x - 0.28, -0.4, x + 0.28, 0.35, H + 7, H + 10, col);
        onL(c, 0.35, x - 0.1, x + 0.1, H, H + 6, '#2a1c14', m);
        box(c, x - 0.24, -0.1, x + 0.24, 0.0, H + 10, H + 19, col, shade(col, 0.8), col);
        m.fires.push(P(x, 0.45, H + 1.5));
      }
      poly(c, [P(0.02, 1.47, 0), P(0.08, 1.47, 0), P(0.08, 0.72, H), P(0.02, 0.72, H)], p.trim);
      m.glow.push(P(0, 0.4, H + 4));
      return H + 24;
    }
    if (st === 'romano') { bowl(c, 1.45, 42, '#e8d2a6', '#b89a70', '#c8b8a0', '#e8d8a8', 3);
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI; const q = [Math.cos(a) * 1.45 * 22.6, Math.sin(a) * 1.45 * 11.3 - 42]; ln(c, q, [q[0], q[1] - 6], '#7a5a3a', 0.6); }
      return 52; }
    if (st === 'grego') { // Acropolis: rock plateau crowned by a great temple
      const e = 1.45;
      poly(c, [P(-e, e, 0), P(e, e, 0), P(e - 0.1, e - 0.1, 12), P(-e + 0.1, e - 0.1, 12)], '#b8ae9c');
      poly(c, [P(e, e, 0), P(e, -e, 0), P(e - 0.1, -e + 0.1, 12), P(e - 0.1, e - 0.1, 12)], '#948a78');
      top(c, -e + 0.1, -e + 0.1, e - 0.1, e - 0.1, 12, '#d8d0bc');
      c.strokeStyle = 'rgba(80,70,55,0.35)'; c.lineWidth = 0.5; for (let k = 0; k < 6; k++) { const x = -e + 0.2 + k * 0.5; ln(c, P(x, e, 1), P(x + 0.1, e - 0.05, 10), 'rgba(80,70,55,0.35)', 0.5); }
      const z0 = 12;
      box(c, -1.1, -0.9, 1.1, 0.9, z0, z0 + 1.2, p.base[0], p.base[1], p.base[2]); box(c, -1.05, -0.85, 1.05, 0.85, z0 + 1.2, z0 + 2.4, p.base[0], p.base[1], p.base[2]);
      colonnade(c, p, -1.0, -0.8, 1.0, 0.8, z0 + 2.4, z0 + 22, 8, 0.045, 'B');
      walls(c, -0.75, -0.55, 0.75, 0.5, z0 + 2.4, z0 + 22, p.wl, p.wr);
      colonnade(c, p, -1.0, -0.8, 1.0, 0.8, z0 + 2.4, z0 + 22, 8, 0.045, 'LR');
      box(c, -1.05, -0.85, 1.05, 0.85, z0 + 22, z0 + 25, p.col[0], p.col[1], p.col[0]);
      band(c, -1.05, -0.85, 1.05, 0.85, z0 + 23, z0 + 24.2, p.acc);
      gableY(c, -1.05, -0.85, 1.05, 0.85, z0 + 25, z0 + 34, 0.05, p.roof[0], p.roof[1], p.gable, p.roof[2]);
      const s = P(0, 0.9, z0 + 29); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(s[0], s[1], 2.2, 0, TAU); c.fill(); m.glow.push(s);
      statue(c, -0.9, 1.1, 12, '#e0b84a', 16, true); m.glow.push(P(-0.9, 1.1, 26));
      return z0 + 40;
    }
    if (st === 'nordico') { // Valhalla: a golden-shielded great hall
      const x0 = -1.4, x1 = 1.4, y0 = -0.8, y1 = 0.8, H = 12;
      box(c, x0 - 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05, 0, 2, p.base[0], p.base[1], p.base[2]);
      walls(c, x0, y0, x1, y1, 2, H, p.wl, p.wr);
      for (let k = 1; k < 16; k++) ln(c, P(x0 + (x1 - x0) * k / 16, y1, 2), P(x0 + (x1 - x0) * k / 16, y1, H), 'rgba(30,20,10,0.35)', 0.4);
      onL(c, y1, -0.15, 0.15, 2, 10, '#ffd27a', m);
      gableX(c, x0, y0, x1, y1, H, H + 30, 0.12, '#e8b83a', '#c8962a', p.wl, '#8a6a1a');
      for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) { const f = (r + 0.5) / 5; const y = y1 + 0.12 - (y1 + 0.12) * f; const z = H - 1 + 30 * f; const q = P(x0 + 0.1 + k * 0.2, y, z); c.fillStyle = (k + r) % 2 ? '#f2cc5a' : '#d8a83a'; c.beginPath(); c.ellipse(q[0], q[1], 2.3, 1.4, 0, 0, TAU); c.fill(); }
      const ap = P(x1 + 0.12, 0, H + 30); dragon(c, [ap[0] + 1, ap[1] + 1], 1, '#8a6a1a');
      const ap2 = P(x0 - 0.12, 0, H + 30); dragon(c, [ap2[0] - 1, ap2[1] + 1], -1, '#8a6a1a');
      m.glow.push(P(0, 0, H + 30)); m.fires.push(P(-0.8, 0, H + 26)); m.fires.push(P(0.8, 0, H + 26));
      return H + 38;
    }
    // classic: a great ziggurat with a golden eye
    let z = 0; const lv = [[1.45, 10], [1.1, 10], [0.78, 10], [0.46, 12]];
    for (const [e, h] of lv) { box(c, -e, -e, e, e, z, z + h, p.wl, p.wr, p.top); ln(c, P(-e, e, z + h - 1), P(e, e, z + h - 1), 'rgba(0,0,0,0.12)', 0.6); z += h; }
    poly(c, [P(-0.2, 1.47, 0), P(0.2, 1.47, 0), P(0.2, 0.46, z - 12), P(-0.2, 0.46, z - 12)], shade(p.wl, 1.05));
    const e = P(0, 0.46, z - 6); c.fillStyle = '#d9b34a'; c.beginPath(); c.ellipse(e[0], e[1], 3.6, 2, 0, 0, TAU); c.fill(); c.fillStyle = '#6a4a1a'; c.beginPath(); c.arc(e[0], e[1], 1.1, 0, TAU); c.fill();
    m.glow.push(e); m.glow.push(P(0, 0, z + 2));
    return z + 8;
  }

  // ------------------------------ dispatch ------------------------------
  const MAXZ = { quarteirao: 84, hut: 30, house: 40, sobrado: 52, insula: 64, temple: 64, monument: 72, storehouse: 44, workshop: 46, quartel: 44, torre: 54, praca: 44, mercado: 38, celeiro: 44, biblioteca: 44, teatro: 56, banhos: 50, palacio: 72, doca: 36, aqueduto: 36, maravilha: 100 };
  const NEW = { quarteirao: 1, sobrado: 1, insula: 1, praca: 1, mercado: 1, celeiro: 1, biblioteca: 1, teatro: 1, banhos: 1, palacio: 1, doca: 1, aqueduto: 1, maravilha: 1 };
  A.building = function (type, v, style, extra) {
    const st = PAL[style] ? style : 'classico';
    if (st === 'classico' && !NEW[type]) return null; // the original drawings
    if (type === 'monument' && st === 'egipcio') return null; // the obelisk is already Egyptian
    if (type === 'torre' && st === 'nordico') return null; // a timber watchtower is already Norse
    const def = G.BDEF[type]; if (!def || !MAXZ[type]) return null;
    const key = 'a-' + type + (v || 0) + st + (extra ? extra.join(',') : '');
    const grow = type === 'doca' ? 1.6 : 0;
    const [w, h, ax, ay] = dims(def.w + grow * 2, def.h + grow * 2, MAXZ[type]);
    const p = pal(st);
    return Art.sprite(key, w, h, ax, ay, (c, m) => {
      switch (type) {
        case 'hut': hut(c, m, p, st, v || 0); break;
        case 'house': townhouse(c, m, p, st, v || 0, 1); break;
        case 'sobrado': townhouse(c, m, p, st, v || 0, 2); break;
        case 'insula': townhouse(c, m, p, st, v || 0, st === 'romano' ? 4 : 3); break;
        case 'quarteirao': quarteirao(c, m, p, st, v || 0); break;
        case 'temple': temple(c, m, p, st); break;
        case 'monument': monument(c, m, p, st); break;
        case 'storehouse': storehouse(c, m, p, st); break;
        case 'workshop': workshop(c, m, p, st); break;
        case 'quartel': quartel(c, m, p, st); break;
        case 'torre': torre(c, m, p, st); break;
        case 'praca': praca(c, m, p, st); break;
        case 'mercado': mercado(c, m, p, st); break;
        case 'celeiro': celeiro(c, m, p, st); break;
        case 'biblioteca': biblioteca(c, m, p, st); break;
        case 'teatro': teatro(c, m, p, st); break;
        case 'banhos': banhos(c, m, p, st); break;
        case 'palacio': palacio(c, m, p, st); break;
        case 'doca': doca(c, m, p, st, extra); break;
        case 'aqueduto': aqueduto(c, m, p, st); break;
        case 'maravilha': maravilha(c, m, p, st); break;
      }
    });
  };

  A.plazaColor = st => st === 'nordico' ? '#86a84e' : st === 'egipcio' ? '#e2cfa2' : st === 'asteca' ? '#e0d6c0' : st === 'romano' ? '#d8cbb0' : '#ddd6c6';

  // ------------------------------ aqueduct arches ------------------------------
  A.arch = function (dir, style) {
    const p = pal(style); const H = 20;
    return Art.sprite('aqa-' + dir + style, 44, 48, 22, 38, (c) => {
      const stone = style === 'nordico' ? ['#7a5a3c', '#5e452e', '#8a6a48'] : style === 'egipcio' ? [p.wl, p.wr, p.top] : style === 'asteca' ? [p.wl, p.wr, p.top] : ['#d8c8a8', '#b09c7c', '#e4d6ba'];
      if (dir === 'c') { box(c, -0.12, -0.12, 0.12, 0.12, 0, H, stone[0], stone[1], stone[2]); top(c, -0.1, -0.1, 0.1, 0.1, H + 0.1, '#4a9ac0'); return; }
      const X = dir === 'x';
      const q = (a, z) => X ? P(a, 0.1, z) : P(0.1, a, z);
      const face = X ? stone[0] : stone[1];
      // two half piers
      if (X) { box(c, -0.5, -0.1, -0.38, 0.1, 0, H - 4, stone[0], stone[1], stone[2]); box(c, 0.38, -0.1, 0.5, 0.1, 0, H - 4, stone[0], stone[1], stone[2]); }
      else { box(c, -0.1, -0.5, 0.1, -0.38, 0, H - 4, stone[0], stone[1], stone[2]); box(c, -0.1, 0.38, 0.1, 0.5, 0, H - 4, stone[0], stone[1], stone[2]); }
      // the arch with its spandrels
      const pts = [q(-0.38, 9)];
      for (let k = 0; k <= 12; k++) { const t = k / 12 * Math.PI; pts.push(q(-0.38 * Math.cos(t), 9 + 6 * Math.sin(t))); }
      pts.push(q(0.5, 9)); pts.push(q(0.5, H - 3)); pts.push(q(-0.5, H - 3)); pts.push(q(-0.5, 9));
      poly(c, pts, face);
      // channel on top
      if (X) box(c, -0.5, -0.12, 0.5, 0.12, H - 3, H, stone[0], stone[1], stone[2]); else box(c, -0.12, -0.5, 0.12, 0.5, H - 3, H, stone[0], stone[1], stone[2]);
      if (X) top(c, -0.5, -0.06, 0.5, 0.06, H + 0.1, '#4a9ac0'); else top(c, -0.06, -0.5, 0.06, 0.5, H + 0.1, '#4a9ac0');
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.4; ln(c, q(-0.5, H - 3), q(0.5, H - 3), 'rgba(0,0,0,0.12)', 0.4);
    });
  };

  // ------------------------------ people of each culture ------------------------------
  function l2(c, x0, y0, x1, y1) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  // weapons and shields carried by warriors (drawn in the villager's local space)
  A.arms = function (c, v) {
    const civ = v._civ, fc = v._fc || '#8a3a2a';
    if (v.elite === 'carro') { // war chariot: box, wheel and horse
      c.fillStyle = '#8a5a34'; c.fillRect(-3.4, -5.4, 5.2, 3.2); c.fillStyle = '#e8c24a'; c.fillRect(-3.4, -5.4, 5.2, 0.7);
      c.fillStyle = '#4a3020'; c.beginPath(); c.arc(-1, -1.8, 2.1, 0, TAU); c.fill(); c.fillStyle = '#c8a060'; c.beginPath(); c.arc(-1, -1.8, 0.6, 0, TAU); c.fill();
      c.fillStyle = '#6a4a30'; c.beginPath(); c.ellipse(6.5, -5.2, 3.2, 1.9, 0, 0, TAU); c.fill(); c.fillRect(8.4, -8, 1.8, 3); c.beginPath(); c.ellipse(10.2, -8.2, 1.5, 1, 0.3, 0, TAU); c.fill();
      c.strokeStyle = '#4a3020'; c.lineWidth = 0.7; for (const x of [4.4, 5.6, 7.6, 8.6]) l2(c, x, -3.8, x + 0.3, -0.2);
      l2(c, 1.8, -4, 4, -5);
    }
    if (v.arm === 'arco') {
      c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.7; c.beginPath(); c.arc(2.6, -8, 4.6, -1.25, 1.25); c.stroke();
      c.strokeStyle = 'rgba(240,235,220,0.8)'; c.lineWidth = 0.3; l2(c, 2.6 + Math.cos(-1.25) * 4.6, -8 + Math.sin(-1.25) * 4.6, 2.6 + Math.cos(1.25) * 4.6, -8 + Math.sin(1.25) * 4.6);
      c.fillStyle = '#7a5230'; c.fillRect(-2.9, -10.5, 1.2, 4.5); c.fillStyle = '#e8e0c8'; c.fillRect(-2.8, -11.5, 0.3, 1.2); c.fillRect(-2.3, -11.7, 0.3, 1.2);
      return;
    }
    switch (civ) {
      case 'grego':
        c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.65; l2(c, 1.7, -17, 1.7, -0.5);
        c.fillStyle = '#c4c8d0'; c.beginPath(); c.moveTo(1.05, -17); c.lineTo(1.7, -19.2); c.lineTo(2.35, -17); c.fill();
        c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(-1.9, -6.6, 2.9, 0, TAU); c.fill();
        c.fillStyle = fc; c.beginPath(); c.arc(-1.9, -6.6, 1.6, 0, TAU); c.fill();
        c.strokeStyle = '#8a6a2a'; c.lineWidth = 0.4; c.beginPath(); c.arc(-1.9, -6.6, 2.9, 0, TAU); c.stroke();
        return;
      case 'romano':
        c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.6; l2(c, 1.8, -15, 1.8, -1);
        c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(1.3, -15); c.lineTo(1.8, -17.4); c.lineTo(2.3, -15); c.fill();
        c.fillStyle = '#a8322a'; c.fillRect(-4, -10.2, 3.6, 7.6);
        c.strokeStyle = '#e0b84a'; c.lineWidth = 0.45; c.strokeRect(-4, -10.2, 3.6, 7.6);
        c.fillStyle = '#e0b84a'; c.beginPath(); c.arc(-2.2, -6.4, 0.7, 0, TAU); c.fill();
        return;
      case 'nordico':
        c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.7; l2(c, 1.8, -12, 2.2, -4.5);
        c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(1.6, -12.4); c.quadraticCurveTo(4.2, -12.6, 4, -9.6); c.lineTo(2, -10.4); c.fill();
        if (v.elite === 'berserker') return;
        c.fillStyle = '#8a6038'; c.beginPath(); c.arc(-1.9, -6.6, 2.8, 0, TAU); c.fill();
        c.fillStyle = fc; c.beginPath(); c.moveTo(-1.9, -6.6); c.arc(-1.9, -6.6, 2.8, -Math.PI / 2, Math.PI / 2); c.fill();
        c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(-1.9, -6.6, 0.8, 0, TAU); c.fill();
        return;
      case 'egipcio':
        c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.65; l2(c, 1.7, -15, 1.7, -0.5);
        c.fillStyle = '#d8b84a'; c.beginPath(); c.moveTo(1.05, -15); c.lineTo(1.7, -17.2); c.lineTo(2.35, -15); c.fill();
        c.fillStyle = '#efe6d2'; c.beginPath(); c.moveTo(-3.8, -3); c.lineTo(-3.8, -9); c.quadraticCurveTo(-2.2, -11.6, -0.6, -9); c.lineTo(-0.6, -3); c.fill();
        c.fillStyle = '#6a4a30'; c.beginPath(); c.arc(-2.6, -7, 0.7, 0, TAU); c.arc(-1.6, -5, 0.6, 0, TAU); c.fill();
        c.fillStyle = fc; c.fillRect(-3.8, -4, 3.2, 0.8);
        return;
      case 'asteca':
        c.save(); c.translate(1.8, -8); c.rotate(-0.25);
        c.fillStyle = '#6e4a2c'; c.fillRect(-0.5, -6, 1, 8); c.fillStyle = '#2a2a30';
        for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-0.5, -5.5 + k * 1.4); c.lineTo(-1.4, -4.8 + k * 1.4); c.lineTo(-0.5, -4.4 + k * 1.4); c.fill(); c.beginPath(); c.moveTo(0.5, -5.5 + k * 1.4); c.lineTo(1.4, -4.8 + k * 1.4); c.lineTo(0.5, -4.4 + k * 1.4); c.fill(); }
        c.restore();
        c.fillStyle = '#2fae8f'; c.beginPath(); c.arc(-1.9, -6.6, 2.6, 0, TAU); c.fill();
        c.fillStyle = '#e8c24a'; c.beginPath(); c.arc(-1.9, -6.6, 1.2, 0, TAU); c.fill();
        c.fillStyle = fc; for (let k = -1; k <= 1; k++) { c.beginPath(); c.ellipse(-1.9 + k * 1.1, -3.4, 0.45, 1.3, 0, 0, TAU); c.fill(); }
        return;
    }
    // classic spear and oval shield
    c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.65; l2(c, 1.7, -14, 1.7, -0.5);
    c.fillStyle = '#c4c8d0'; c.beginPath(); c.moveTo(1.05, -14); c.lineTo(1.7, -16.3); c.lineTo(2.35, -14); c.fill();
    c.fillStyle = fc; c.beginPath(); c.ellipse(-1.9, -6.4, 1.7, 2.3, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(40,30,20,0.8)'; c.lineWidth = 0.4; c.stroke();
    c.fillStyle = '#d8d0b8'; c.beginPath(); c.arc(-1.9, -6.4, 0.55, 0, TAU); c.fill();
  };
  // helmets of warriors
  A.helmet = function (c, v, hy) {
    const civ = v._civ, fc = v._fc || '#c83a2a';
    switch (civ) {
      case 'grego':
        c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(0, hy - 0.4, 2.4, Math.PI, TAU); c.fill(); c.fillRect(-2.4, hy - 0.5, 1.3, 2.6); c.fillRect(1.2, hy - 0.5, 1.2, 2);
        c.fillStyle = fc; c.beginPath(); c.moveTo(-2.6, hy - 2.4); c.quadraticCurveTo(0, hy - 6.2, 2.6, hy - 2.4); c.lineTo(2, hy - 2.2); c.quadraticCurveTo(0, hy - 4.8, -2, hy - 2.2); c.fill();
        return true;
      case 'romano':
        c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(0, hy - 0.6, 2.35, Math.PI, TAU); c.fill(); c.fillRect(-2.35, hy - 0.7, 0.9, 2.3); c.fillRect(-2.6, hy - 0.8, 5.2, 0.6);
        c.fillStyle = '#c83a2a'; c.fillRect(-2.2, hy - 4.2, 4.4, 1.3);
        return true;
      case 'nordico':
        if (v.elite === 'berserker') { c.fillStyle = '#7a7068'; c.beginPath(); c.arc(0, hy - 0.8, 2.6, Math.PI * 0.9, Math.PI * 2.1); c.fill(); c.beginPath(); c.moveTo(-2.4, hy - 2); c.lineTo(-1.6, hy - 4); c.lineTo(-0.8, hy - 2.6); c.fill(); c.beginPath(); c.moveTo(2.4, hy - 2); c.lineTo(1.6, hy - 4); c.lineTo(0.8, hy - 2.6); c.fill(); return true; }
        c.fillStyle = '#8a8e96'; c.beginPath(); c.moveTo(-2.3, hy - 0.4); c.quadraticCurveTo(-2.2, hy - 3.2, 0, hy - 4.4); c.quadraticCurveTo(2.2, hy - 3.2, 2.3, hy - 0.4); c.fill();
        c.fillRect(1.1, hy - 0.6, 0.5, 2);
        return true;
      case 'egipcio':
        c.fillStyle = '#efe6d2'; c.beginPath(); c.arc(-0.2, hy - 0.4, 2.35, Math.PI * 0.85, Math.PI * 2.05); c.fill(); c.fillRect(-2.5, hy - 0.5, 1.4, 3.4);
        c.fillStyle = fc; c.fillRect(-2.3, hy - 1.6, 4.4, 0.5);
        return true;
      case 'asteca':
        if (v.elite === 'aguia') { c.fillStyle = '#6a4a30'; c.beginPath(); c.arc(0, hy - 0.6, 2.6, Math.PI * 0.9, Math.PI * 2.1); c.fill(); c.fillStyle = '#e8c24a'; c.beginPath(); c.moveTo(1.8, hy - 1.6); c.lineTo(4.2, hy - 0.4); c.lineTo(1.8, hy - 0.2); c.fill(); c.fillStyle = '#f4efe3'; c.fillRect(-2, hy - 3.4, 3.2, 1); return true; }
        c.fillStyle = '#e8b83a'; c.beginPath(); c.arc(0, hy - 0.6, 2.6, Math.PI * 0.9, Math.PI * 2.1); c.fill();
        c.fillStyle = '#2a1a10'; for (const [x, y] of [[-1.2, -2.2], [0.6, -2.6], [1.6, -1.4], [-0.4, -1.2]]) { c.beginPath(); c.arc(x, hy + y, 0.4, 0, TAU); c.fill(); }
        c.fillStyle = '#f4efe3'; c.beginPath(); c.moveTo(1.2, hy - 0.4); c.lineTo(1.6, hy + 0.4); c.lineTo(2, hy - 0.4); c.fill();
        c.fillStyle = '#2fae8f'; c.beginPath(); c.ellipse(-1.8, hy - 3.6, 0.5, 1.8, -0.4, 0, TAU); c.fill();
        return true;
    }
    return false;
  };
  // what a ruler wears on the head
  A.crown = function (c, v, hy) {
    const civ = v._civ;
    switch (civ) {
      case 'egipcio': // nemes and uraeus
        c.fillStyle = '#e8c24a'; c.beginPath(); c.moveTo(-2.6, hy + 2.8); c.lineTo(-2.4, hy - 1.8); c.quadraticCurveTo(0, hy - 3.6, 2.4, hy - 1.8); c.lineTo(2.2, hy - 0.6); c.lineTo(-1, hy - 0.6); c.lineTo(-1.2, hy + 2.8); c.fill();
        c.fillStyle = '#2a4a9a'; for (let k = 0; k < 3; k++) c.fillRect(-2.5, hy - 1 + k * 1.2, 1.3, 0.5);
        c.fillRect(-2, hy - 2.2, 4, 0.5);
        c.fillStyle = '#e8c24a'; c.beginPath(); c.arc(1.9, hy - 2.4, 0.6, 0, TAU); c.fill();
        return true;
      case 'asteca': // quetzal plumes
        c.fillStyle = '#e8c24a'; c.fillRect(-2.4, hy - 2, 4.8, 0.9);
        for (let k = -3; k <= 3; k++) { c.fillStyle = k % 2 ? '#1f8a5a' : '#2fae8f'; c.beginPath(); c.ellipse(k * 0.8, hy - 5.4 - (3 - Math.abs(k)) * 0.5, 0.55, 3.4, k * 0.22, 0, TAU); c.fill(); }
        c.fillStyle = '#c8382a'; c.beginPath(); c.arc(0, hy - 1.6, 0.6, 0, TAU); c.fill();
        return true;
      case 'grego': case 'romano': { // laurel wreath
        const gold = civ === 'romano' && v._imperial;
        c.fillStyle = gold ? '#e8c24a' : '#5a9a3c';
        for (let k = 0; k < 7; k++) { const a = Math.PI * (1.05 + k * 0.13); c.beginPath(); c.ellipse(Math.cos(a) * 2.2, hy - 0.5 + Math.sin(a) * 2.2, 0.5, 1, a + Math.PI / 2, 0, TAU); c.fill(); }
        return true;
      }
      case 'nordico':
        c.fillStyle = '#e8c24a'; c.fillRect(-2.3, hy - 2, 4.6, 0.9); for (const x of [-1.6, 0, 1.6]) { c.beginPath(); c.moveTo(x - 0.5, hy - 2); c.lineTo(x, hy - 3.4); c.lineTo(x + 0.5, hy - 2); c.fill(); }
        return true;
    }
    return false;
  };

  // ------------------------------ carts ------------------------------
  A.cart = function (civ, loaded, goods) {
    return Art.sprite('cart-' + (civ || 'x') + (loaded ? goods : ''), 40, 28, 20, 22, (c) => {
      if (civ === 'asteca') { // tlamemes: porters carrying loads on tumplines
        for (const [x, y] of [[-7, 0], [3, 1]]) {
          c.strokeStyle = '#3b2b20'; c.lineWidth = 1; ln(c, [x - 0.8, y - 3.8], [x - 1.5, y], '#3b2b20', 1); ln(c, [x + 0.8, y - 3.8], [x + 1.5, y], '#3b2b20', 1);
          c.fillStyle = '#efe6d2'; c.fillRect(x - 2, y - 8.8, 4, 5.2);
          c.fillStyle = '#a8744c'; c.beginPath(); c.arc(x + 0.3, y - 10.6, 2, 0, TAU); c.fill();
          c.fillStyle = '#b8864a'; c.fillRect(x - 5.5, y - 13, 4.5, 7); c.fillStyle = '#8a6030'; c.fillRect(x - 5.5, y - 11, 4.5, 0.7);
          c.fillStyle = goods === 'stone' ? '#9a958c' : goods === 'wood' ? '#8f6238' : '#e8c24a'; c.fillRect(x - 5, y - 14.5, 3.5, 1.8);
        }
        return;
      }
      const ox = civ === 'egipcio' ? 'donkey' : civ === 'nordico' ? 'horse' : 'ox';
      // draught animal
      const bx = 8;
      c.fillStyle = ox === 'ox' ? '#8a6a4a' : ox === 'horse' ? '#6a4a30' : '#9a8a7a';
      c.beginPath(); c.ellipse(bx, -6, 5, 3, 0, 0, TAU); c.fill();
      c.fillRect(bx + 3, -9.5, 2.6, 4); c.beginPath(); c.ellipse(bx + 6, -9.5, 2.4, 1.6, 0.3, 0, TAU); c.fill();
      if (ox === 'ox') { c.strokeStyle = '#e8e0c8'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(bx + 5, -11); c.quadraticCurveTo(bx + 6.5, -13, bx + 8, -12); c.stroke(); }
      if (ox === 'donkey') { c.fillStyle = '#9a8a7a'; c.fillRect(bx + 4.4, -13.5, 0.8, 3); c.fillRect(bx + 5.6, -13.5, 0.8, 3); }
      c.strokeStyle = '#3a2a1a'; c.lineWidth = 1; for (const lx of [bx - 3.5, bx - 1.5, bx + 2, bx + 3.5]) ln(c, [lx, -4], [lx, 0], '#3a2a1a', 1);
      // shaft & body
      ln(c, [bx - 4, -5.5], [-2, -5], '#6a4526', 0.8);
      const body = civ === 'romano' ? '#9a5a3a' : civ === 'grego' ? '#8a6a44' : '#7a5230';
      c.fillStyle = body; c.fillRect(-13, -9, 12, 5);
      c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(-13, -5.5, 12, 1.5);
      if (loaded) {
        if (goods === 'wood') { c.fillStyle = '#8f6238'; for (let k = 0; k < 3; k++) c.fillRect(-12.5, -11 - k * 1.5, 11, 1.4); c.fillStyle = '#d6b27a'; c.fillRect(-1.8, -13.5, 0.8, 4); }
        else if (goods === 'stone') { c.fillStyle = '#9a958c'; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(-11 + k * 2.8, -10.5 - (k % 2), 1.8, 1.4, 0, 0, TAU); c.fill(); } }
        else { c.fillStyle = '#d8c090'; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(-10.5 + k * 3.6, -10.5, 1.9, 1.9, 0, 0, TAU); c.fill(); } c.fillStyle = '#e04a3a'; c.beginPath(); c.arc(-7, -12.5, 1, 0, TAU); c.fill(); }
      }
      if (civ === 'nordico' || civ === 'egipcio') c.fillStyle = '#5a3a20'; else c.fillStyle = '#4a3020';
      for (const wx of [-10.5, -3.5]) { c.beginPath(); c.arc(wx, -2.6, 2.7, 0, TAU); c.fill(); c.fillStyle = '#9a7a52'; c.beginPath(); c.arc(wx, -2.6, 0.8, 0, TAU); c.fill(); c.fillStyle = '#4a3020'; }
    });
  };
})(window.G);
