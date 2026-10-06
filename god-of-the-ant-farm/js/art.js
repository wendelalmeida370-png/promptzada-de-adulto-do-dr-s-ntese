'use strict';
// ============================================================
//  Art: procedural sprites & vector drawing of every entity
// ============================================================
(function (G) {
  const Art = G.Art = {};
  const SPR = 3;
  const cache = new Map();
  const TAU = Math.PI * 2;

  Art.sprite = function (key, w, h, ax, ay, fn) {
    let s = cache.get(key); if (s) return s;
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * SPR)); c.height = Math.max(1, Math.ceil(h * SPR));
    const x = c.getContext('2d');
    x.scale(SPR, SPR); x.translate(ax, ay);
    x.lineJoin = 'round'; x.lineCap = 'round';
    const meta = { win: [], fires: [], glow: [] };
    fn(x, meta);
    s = { c, w, h, ax, ay, win: meta.win, fires: meta.fires, glow: meta.glow };
    cache.set(key, s); return s;
  };
  // mipmaps: sprites are painted at 3x; zoomed out, a half or quarter copy is drawn instead
  Art.px = 1; // screen pixels per world unit, set by the renderer every frame
  function mip(s, lv) {
    const src = lv === 2 ? s.c : (s.m2 || mip(s, 2));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(src.width / 2)); c.height = Math.max(1, Math.ceil(src.height / 2));
    const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, c.width, c.height);
    if (lv === 2) s.m2 = c; else s.m4 = c;
    return c;
  }
  Art.draw = function (ctx, s, x, y, sc) {
    sc = sc || 1;
    const k = Art.px * sc;
    const img = k >= 1.3 || s.c.width < 12 ? s.c : k >= 0.62 ? (s.m2 || mip(s, 2)) : (s.m4 || mip(s, 4));
    ctx.drawImage(img, x - s.ax * sc, y - s.ay * sc, s.w * sc, s.h * sc);
  };
  Art.clear = () => cache.clear();
  // sprites are drawn for the first view: the two side views see them mirrored
  Art.drawM = function (ctx, s, x, y, sc) {
    if (!(G.Render && G.Render.mirror() < 0)) return Art.draw(ctx, s, x, y, sc);
    ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); Art.draw(ctx, s, 0, 0, sc); ctx.restore();
  };

  // ------------------------------ iso helpers ------------------------------
  const P = (dx, dy, z) => [(dx - dy) * 16, (dx + dy) * 8 - (z || 0)];
  Art.P = P;
  function poly(ctx, pts, fill, stroke, lw) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 0.5; ctx.stroke(); }
  }
  Art.poly = poly;
  function walls(ctx, x0, y0, x1, y1, z0, z1, cl, cr, stroke) {
    poly(ctx, [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], cl, stroke, 0.4);
    poly(ctx, [P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1)], cr, stroke, 0.4);
  }
  function top(ctx, x0, y0, x1, y1, z, c, stroke) { poly(ctx, [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], c, stroke, 0.4); }
  function box(ctx, x0, y0, x1, y1, z0, z1, cl, cr, ct, stroke) { walls(ctx, x0, y0, x1, y1, z0, z1, cl, cr, stroke); top(ctx, x0, y0, x1, y1, z1, ct, stroke); }
  Art.box = box;
  // rectangle on the left (+y) face
  function onL(ctx, y1, a, b, c, d, fill, meta, glowKind) {
    const pts = [P(a, y1, c), P(b, y1, c), P(b, y1, d), P(a, y1, d)];
    poly(ctx, pts, fill);
    if (meta && glowKind) meta.win.push(pts);
    return pts;
  }
  function onR(ctx, x1, a, b, c, d, fill, meta, glowKind) {
    const pts = [P(x1, a, c), P(x1, b, c), P(x1, b, d), P(x1, a, d)];
    poly(ctx, pts, fill);
    if (meta && glowKind) meta.win.push(pts);
    return pts;
  }
  function gableX(ctx, x0, y0, x1, y1, z1, zr, ov, cFront, cBack, cGable, cEdge) {
    const ym = (y0 + y1) / 2;
    poly(ctx, [P(x1, y0, z1), P(x1, y1, z1), P(x1, ym, zr)], cGable);
    poly(ctx, [P(x0 - ov, ym, zr), P(x1 + ov, ym, zr), P(x1 + ov, y0 - ov, z1 - 1), P(x0 - ov, y0 - ov, z1 - 1)], cBack, cEdge, 0.5);
    poly(ctx, [P(x0 - ov, y1 + ov, z1 - 1), P(x1 + ov, y1 + ov, z1 - 1), P(x1 + ov, ym, zr), P(x0 - ov, ym, zr)], cFront, cEdge, 0.5);
    // roof texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.4;
    const n = Math.round((x1 - x0) * 10);
    for (let k = 1; k < n; k++) {
      const xx = x0 - ov + (x1 - x0 + 2 * ov) * k / n;
      const a = P(xx, y1 + ov, z1 - 1), b = P(xx, ym, zr);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // ridge highlight
    const r0 = P(x0 - ov, ym, zr), r1 = P(x1 + ov, ym, zr);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]); ctx.stroke();
  }
  Art.gableX = gableX;
  function spriteDims(fw, fh, maxZ) {
    const pad = 8;
    const w = (fw + fh) * 16 + pad * 2, h = (fw + fh) * 8 + maxZ + pad * 2;
    // the anchor sits at the footprint centre, with room above for the full height
    return [w, h, w / 2, (fw + fh) * 4 + maxZ + pad];
  }
  Art.spriteDims = spriteDims;

  // ------------------------------ trees ------------------------------
  const OAK = [['#4e8f3a', '#37692c', '#79b653'], ['#5b9d3e', '#3f7630', '#8fc75c'], ['#7c9b3a', '#5c7a2b', '#abc35b']];
  const PINE = [['#2f6e4a', '#224f36', '#4d9063'], ['#2c6a52', '#1f4d3c', '#4a8a6e'], ['#3a7445', '#2a5733', '#5b9660']];
  const NOTRUNK = { palm: 1, acacia: 1, baobab: 1, cactus: 1, banana: 1, coffee: 1, acai: 1, date: 1, incense: 1 };
  Art.trunk = function (kind, v) {
    return Art.sprite('trunk' + kind + v, 12, 20, 6, 18, (c) => {
      if (NOTRUNK[kind]) return;
      const h = kind === 'pine' || kind === 'snowpine' ? 6 : kind === 'jungle' || kind === 'pepper' ? 16 : kind === 'willow' ? 8 : kind === 'birch' ? 12 : kind === 'apple' || kind === 'cacao' ? 7 : kind === 'olive' ? 7.5 : 10;
      const w = kind === 'jungle' || kind === 'pepper' ? 2.2 : kind === 'birch' ? 1.4 : kind === 'olive' ? 2.1 : 1.8;
      const [c1, c2, c3] = kind === 'birch' ? ['#e8e2d4', '#c8c0b0', '#9a9284'] : kind === 'jungle' || kind === 'pepper' ? ['#7a6448', '#58462e', '#4a3a26'] : kind === 'willow' ? ['#5a4630', '#3e3020', '#3a2c1c'] : kind === 'olive' ? ['#7a6a58', '#5a4c3e', '#4e4236'] : kind === 'cacao' ? ['#7a5a3a', '#5a4028', '#4a3420'] : ['#6e4a2b', '#4f341e', '#5a3c22'];
      if (kind === 'olive') { // the old olive: a trunk twisted like a rope, split in two
        c.fillStyle = c1; c.beginPath(); c.moveTo(-2.2, 0); c.bezierCurveTo(-0.6, -2.6, -2.8, -4.8, -1.4, -h); c.lineTo(0.6, -h); c.bezierCurveTo(-0.2, -4.4, 2.6, -2.4, 2.2, 0); c.closePath(); c.fill();
        c.fillStyle = c2; c.beginPath(); c.moveTo(0.3, 0); c.bezierCurveTo(1.4, -2.4, -0.2, -4.6, 0.6, -h); c.lineTo(1.2, -h); c.bezierCurveTo(0.8, -4.2, 2.6, -2.4, 2.2, 0); c.closePath(); c.fill();
        c.fillStyle = c3; c.beginPath(); c.ellipse(0, 0, w + 0.6, 0.9, 0, 0, TAU); c.fill(); return;
      }
      c.fillStyle = c1; c.beginPath(); c.moveTo(-w, 0); c.lineTo(-w * 0.66, -h); c.lineTo(w * 0.66, -h); c.lineTo(w, 0); c.closePath(); c.fill();
      c.fillStyle = c2; c.beginPath(); c.moveTo(0.3, 0); c.lineTo(0.3, -h); c.lineTo(w * 0.66, -h); c.lineTo(w, 0); c.closePath(); c.fill();
      if (kind === 'birch') { c.fillStyle = '#2e2a26'; for (let k = 0; k < 5; k++) c.fillRect(-1.2 + (k % 2) * 0.9, -2 - k * 2.2, 1.1, 0.5); }
      if (kind === 'pepper') { // the pepper vine climbing the trunk
        c.strokeStyle = '#3e7a2a'; c.lineWidth = 0.55; c.beginPath(); for (let k = 0; k <= 14; k++) { const y = -k * 1.1, x = Math.sin(k * 0.9) * (w * 0.8); if (k) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
        c.fillStyle = '#4e9a34'; for (let k = 1; k < 14; k += 2) { const y = -k * 1.1, x = Math.sin(k * 0.9) * (w * 0.8); c.beginPath(); c.ellipse(x + 0.6, y, 0.8, 0.45, 0.4, 0, TAU); c.fill(); }
      }
      if (kind === 'jungle') { c.strokeStyle = '#4c7a2c'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.5, -2); c.quadraticCurveTo(1.5, -7, -1, -12); c.moveTo(1.2, -4); c.quadraticCurveTo(-0.8, -9, 1.4, -15); c.stroke(); c.fillStyle = c3; c.beginPath(); c.moveTo(-w - 1.6, 0.4); c.lineTo(-w * 0.6, -3.5); c.lineTo(-w * 0.2, 0.4); c.fill(); c.beginPath(); c.moveTo(w + 1.6, 0.4); c.lineTo(w * 0.6, -3.5); c.lineTo(w * 0.2, 0.4); c.fill(); }
      c.fillStyle = c3; c.beginPath(); c.ellipse(0, 0, w + 0.5, 0.9, 0, 0, TAU); c.fill();
    });
  };
  Art.canopy = function (kind, v) {
    if (kind === 'oak') return Art.sprite('can-oak' + v, 30, 28, 15, 32, (c) => {
      const [base, dark, light] = OAK[v];
      const r = G.mulberry32(77 + v * 13);
      const blobs = [[-5, -15, 6.2], [5, -15, 6.2], [0, -21, 7], [-3, -10.5, 5.4], [4, -10, 5.2], [0, -14, 6.5]];
      for (const b of blobs) { b[0] += (r() - 0.5) * 2; b[1] += (r() - 0.5) * 2; }
      c.fillStyle = dark; for (const [x, y, rr] of blobs) { c.beginPath(); c.arc(x + 0.8, y + 1.3, rr, 0, TAU); c.fill(); }
      c.fillStyle = base; for (const [x, y, rr] of blobs) { c.beginPath(); c.arc(x, y, rr * 0.93, 0, TAU); c.fill(); }
      c.fillStyle = light; for (const [x, y, rr] of blobs) { if (x > 3 && y > -14) continue; c.beginPath(); c.arc(x - 1.6, y - 2, rr * 0.5, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(-4, -21, 3, 0, TAU); c.fill();
      c.fillStyle = dark; for (let k = 0; k < 14; k++) { c.beginPath(); c.arc((r() - 0.5) * 18, -8 - r() * 18, 0.7, 0, TAU); c.fill(); }
    });
    if (kind === 'pine') return Art.sprite('can-pine' + v, 26, 36, 13, 38, (c) => {
      const [base, dark, light] = PINE[v];
      for (let i = 0; i < 4; i++) {
        const by = -3 - i * 6, w = 10.5 - i * 2.2, ty = by - 11;
        c.fillStyle = dark; c.beginPath(); c.moveTo(-w, by + 1); c.lineTo(0, ty); c.lineTo(w, by + 1); c.quadraticCurveTo(0, by + 3.5, -w, by + 1); c.fill();
        c.fillStyle = base; c.beginPath(); c.moveTo(-w, by); c.lineTo(0, ty); c.lineTo(w * 0.15, by + 2.2); c.quadraticCurveTo(-w * 0.5, by + 2, -w, by); c.fill();
        c.fillStyle = light; c.beginPath(); c.moveTo(-w * 0.8, by - 0.5); c.lineTo(0, ty + 0.5); c.lineTo(-w * 0.3, by); c.fill();
      }
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.moveTo(-1, -30); c.lineTo(0, -32); c.lineTo(1, -30); c.fill();
    });
    if (kind === 'snowpine') return Art.sprite('can-snowpine' + v, 26, 36, 13, 38, (c) => {
      const [base, dark] = [['#2e5e48', '#1f4234'], ['#2a5a4e', '#1c3e36'], ['#35644a', '#244634']][v];
      for (let i = 0; i < 4; i++) {
        const by = -3 - i * 6, w = 10.5 - i * 2.2, ty = by - 11;
        c.fillStyle = dark; c.beginPath(); c.moveTo(-w, by + 1); c.lineTo(0, ty); c.lineTo(w, by + 1); c.quadraticCurveTo(0, by + 3.5, -w, by + 1); c.fill();
        c.fillStyle = base; c.beginPath(); c.moveTo(-w, by); c.lineTo(0, ty); c.lineTo(w * 0.15, by + 2.2); c.quadraticCurveTo(-w * 0.5, by + 2, -w, by); c.fill();
        // snow resting on each tier
        c.fillStyle = '#f4f8fc'; c.beginPath(); c.moveTo(-w * 0.95, by - 0.2); c.quadraticCurveTo(-w * 0.5, by - 3.2, 0, ty + 1.2); c.quadraticCurveTo(w * 0.45, by - 3.6, w * 0.9, by - 0.4); c.quadraticCurveTo(w * 0.3, by - 1.8, 0, by - 1.2); c.quadraticCurveTo(-w * 0.4, by - 1.2, -w * 0.95, by - 0.2); c.fill();
        c.fillStyle = 'rgba(170,195,230,0.6)'; c.beginPath(); c.moveTo(w * 0.1, by - 1.6); c.quadraticCurveTo(w * 0.5, by - 3, w * 0.9, by - 0.4); c.quadraticCurveTo(w * 0.4, by - 1.4, w * 0.1, by - 1.6); c.fill();
      }
    });
    if (kind === 'birch') return Art.sprite('can-birch' + v, 24, 32, 12, 34, (c) => {
      const [base, dark, light] = [['#8cc05a', '#679a3e', '#b4dc7a'], ['#9cc85a', '#76a23e', '#c4e27e'], ['#d0b44a', '#a88e30', '#e8d070']][v];
      const r = G.mulberry32(91 + v * 7);
      const blobs = [[-3, -15, 4.2], [3, -16, 4.4], [0, -22, 4.8], [-2, -27, 3.6], [2.5, -26, 3.4], [0, -12, 3.8]];
      c.fillStyle = dark; for (const [x, y, rr] of blobs) { c.beginPath(); c.arc(x + 0.7, y + 1, rr, 0, TAU); c.fill(); }
      c.fillStyle = base; for (const [x, y, rr] of blobs) { c.beginPath(); c.arc(x, y, rr * 0.92, 0, TAU); c.fill(); }
      c.fillStyle = light; for (let k = 0; k < 16; k++) { c.beginPath(); c.arc((r() - 0.5) * 11, -12 - r() * 17, 0.9, 0, TAU); c.fill(); }
    });
    if (kind === 'jungle') return Art.sprite('can-jungle' + v, 40, 40, 20, 42, (c) => {
      const [base, dark, light] = [['#2f8a3a', '#1e6228', '#4fae4a'], ['#3a9440', '#246a2c', '#5cbc52'], ['#28803e', '#18582a', '#44a452']][v];
      const r = G.mulberry32(51 + v * 11);
      const blobs = [[-9, -18, 7], [9, -18, 7], [0, -24, 8.5], [-5, -29, 6], [6, -29, 6], [0, -17, 7]];
      c.fillStyle = dark; for (const [x, y, rr] of blobs) { c.beginPath(); c.ellipse(x + 1, y + 1.5, rr * 1.15, rr * 0.8, 0, 0, TAU); c.fill(); }
      c.fillStyle = base; for (const [x, y, rr] of blobs) { c.beginPath(); c.ellipse(x, y, rr * 1.08, rr * 0.74, 0, 0, TAU); c.fill(); }
      // broad leaves spilling over the edge
      c.fillStyle = light; for (let k = 0; k < 12; k++) { const a = r() * 6.28; const x = Math.cos(a) * 14, y = -22 + Math.sin(a) * 8; c.beginPath(); c.ellipse(x, y, 2.6, 1, a, 0, TAU); c.fill(); }
      c.strokeStyle = '#3c7a2c'; c.lineWidth = 0.7; for (let k = 0; k < 5; k++) { const x = -10 + k * 5; c.beginPath(); c.moveTo(x, -16); c.quadraticCurveTo(x + 1, -11, x - 0.5, -7 - r() * 4); c.stroke(); }
      if (v === 1) { c.fillStyle = '#ff6a3a'; c.beginPath(); c.arc(6, -26, 1.1, 0, TAU); c.arc(-7, -21, 1, 0, TAU); c.fill(); }
    });
    if (kind === 'acacia') return Art.sprite('can-acacia' + v, 36, 28, 18, 26, (c) => {
      c.strokeStyle = '#5e4630'; c.lineCap = 'round';
      c.lineWidth = 1.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0.5, -8); c.stroke();
      c.lineWidth = 1.2; c.beginPath(); c.moveTo(0.5, -8); c.lineTo(-6, -15); c.moveTo(0.5, -8); c.lineTo(5, -14); c.moveTo(0.5, -9); c.lineTo(1, -16); c.stroke();
      const [base, dark, light] = [['#7a9a3a', '#5a7a28', '#9aba50'], ['#869e40', '#667e2c', '#a8c05a'], ['#8a9234', '#6a7226', '#aab04a']][v];
      c.fillStyle = dark; c.beginPath(); c.ellipse(0, -16.2, 15, 3.4, 0, 0, TAU); c.fill();
      c.fillStyle = base; c.beginPath(); c.ellipse(-0.5, -17.2, 14, 2.9, 0, 0, TAU); c.fill();
      c.fillStyle = light; c.beginPath(); c.ellipse(-3, -18.3, 8, 1.4, 0, 0, TAU); c.fill();
    });
    if (kind === 'baobab') return Art.sprite('can-baobab' + v, 30, 36, 15, 34, (c) => {
      c.fillStyle = '#9a8068'; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(-7.5, -9, -3, -18); c.lineTo(3, -18); c.quadraticCurveTo(7.5, -9, 5, 0); c.closePath(); c.fill();
      c.fillStyle = '#7e6652'; c.beginPath(); c.moveTo(0.5, 0); c.lineTo(0.8, -18); c.lineTo(3, -18); c.quadraticCurveTo(7.5, -9, 5, 0); c.closePath(); c.fill();
      c.strokeStyle = '#7e6652'; c.lineWidth = 1.3; c.lineCap = 'round';
      for (const [x1, y1] of [[-9, -24], [-4, -26], [2, -27], [8, -24], [11, -21], [-11, -20]]) { c.beginPath(); c.moveTo(0, -17); c.quadraticCurveTo(x1 * 0.4, -21, x1, y1); c.stroke(); }
      c.fillStyle = ['#6a8a36', '#7a8e3a', '#5e7e30'][v]; for (const [x1, y1] of [[-9, -24], [-4, -26], [2, -27], [8, -24], [11, -21], [-11, -20]]) { c.beginPath(); c.ellipse(x1, y1 - 1, 3, 1.6, 0, 0, TAU); c.fill(); }
    });
    if (kind === 'cactus') return Art.sprite('can-cactus' + v, 18, 26, 9, 25, (c) => {
      const g = ['#4a8a4a', '#548e44', '#428048'][v], d = '#356a36';
      const col = (x, y0, y1, w) => { c.fillStyle = g; c.beginPath(); c.moveTo(x - w, y0); c.lineTo(x - w, y1 + w); c.arc(x, y1 + w, w, Math.PI, 0); c.lineTo(x + w, y0); c.closePath(); c.fill(); c.fillStyle = d; c.fillRect(x + w * 0.2, y1 + w, w * 0.8, y0 - y1 - w); };
      col(0, 0, -17, 2.2);
      if (v !== 2) { col(-4.4, -6, -12, 1.4); c.fillStyle = g; c.fillRect(-4.4, -7.4, 4.4, 2.2); }
      if (v !== 1) { col(4.2, -8, -14, 1.3); c.fillStyle = g; c.fillRect(0, -9.2, 4.2, 2); }
      c.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 6; k++) c.fillRect(-1.4 + (k % 2) * 1.6, -3 - k * 2.4, 0.4, 0.4);
      if (v === 0) { c.fillStyle = '#ff5a8a'; c.beginPath(); c.arc(0, -19.2, 1, 0, TAU); c.fill(); }
    });
    if (kind === 'willow') return Art.sprite('can-willow' + v, 34, 30, 17, 32, (c) => {
      const [base, dark, light] = [['#6a8a42', '#4c6a30', '#8aa858'], ['#72904a', '#526e34', '#94b060'], ['#62823e', '#46642c', '#80a052']][v];
      c.fillStyle = dark; c.beginPath(); c.ellipse(0.8, -16, 13, 8, 0, 0, TAU); c.fill();
      c.fillStyle = base; c.beginPath(); c.ellipse(0, -17, 12.5, 7.5, 0, 0, TAU); c.fill();
      c.fillStyle = light; c.beginPath(); c.ellipse(-3, -20, 6, 3, 0, 0, TAU); c.fill();
      // hanging curtains of leaves
      c.strokeStyle = base; c.lineWidth = 1; c.lineCap = 'round';
      for (let k = 0; k < 11; k++) { const x = -11 + k * 2.2; const top = -17 + Math.abs(x) * 0.35; c.beginPath(); c.moveTo(x, top); c.quadraticCurveTo(x + 0.5, top + 6, x + 0.2, -4 - (k % 3)); c.stroke(); }
      c.strokeStyle = dark; c.lineWidth = 0.6; for (let k = 0; k < 6; k++) { const x = -9 + k * 3.6; c.beginPath(); c.moveTo(x, -14); c.quadraticCurveTo(x - 0.4, -9, x + 0.3, -5); c.stroke(); }
    });
    // ---------------- the fruit trees ----------------
    const blobsOf = (c, blobs, base, dark, light, seed, spk) => {
      c.fillStyle = dark; for (const [x, y, rr, ry] of blobs) { c.beginPath(); c.ellipse(x + 0.8, y + 1.2, rr, ry || rr, 0, 0, TAU); c.fill(); }
      c.fillStyle = base; for (const [x, y, rr, ry] of blobs) { c.beginPath(); c.ellipse(x, y, rr * 0.93, (ry || rr) * 0.93, 0, 0, TAU); c.fill(); }
      c.fillStyle = light; for (const [x, y, rr, ry] of blobs) { if (x > 3) continue; c.beginPath(); c.ellipse(x - 1.4, y - 1.6, rr * 0.45, (ry || rr) * 0.42, 0, 0, TAU); c.fill(); }
      const r = G.mulberry32(seed); c.fillStyle = spk || dark; for (let k = 0; k < 12; k++) { c.beginPath(); c.arc((r() - 0.5) * 16, -9 - r() * 12, 0.6, 0, TAU); c.fill(); }
    };
    if (kind === 'apple') return Art.sprite('can-apple' + v, 26, 22, 13, 25, (c) => {
      const [base, dark, light] = [['#5aa040', '#3e7a2e', '#88c860'], ['#64a646', '#447e30', '#94ce6a'], ['#58983c', '#3a722a', '#82be5a']][v];
      blobsOf(c, [[-4.2, -12.5, 4.8], [4.2, -12.5, 4.8], [0, -17.5, 5.4], [0, -11, 5]], base, dark, light, 17 + v);
    });
    if (kind === 'mulberry') return Art.sprite('can-mulberry' + v, 28, 24, 14, 27, (c) => {
      const [base, dark, light] = [['#3e7e36', '#2a5a26', '#5e9e4a'], ['#448238', '#2e5e28', '#64a250'], ['#3a7632', '#285624', '#5a9646']][v];
      blobsOf(c, [[-5, -13, 5.4], [5, -13.5, 5.4], [0, -19, 6], [-1, -11, 5.6]], base, dark, light, 23 + v);
    });
    if (kind === 'olive') return Art.sprite('can-olive' + v, 30, 22, 15, 23, (c) => {
      const [base, dark, light] = [['#8a9a6a', '#687852', '#b4c094'], ['#909e70', '#6e7c56', '#bac69a'], ['#84966a', '#647450', '#aebc90']][v];
      blobsOf(c, [[-6, -13, 6, 3.4], [5.5, -14, 6.4, 3.6], [0, -18, 5.4, 3], [-1, -11.5, 7, 2.8]], base, dark, light, 31 + v, '#d4dcc4');
    });
    if (kind === 'cacao') return Art.sprite('can-cacao' + v, 26, 22, 13, 24, (c) => {
      const [base, dark, light] = [['#2e6e30', '#1e4a20', '#4e8e3e'], ['#347434', '#224e24', '#56964a'], ['#2a6a2e', '#1a461e', '#4a8a3a']][v];
      blobsOf(c, [[-5, -12, 5, 3.6], [5, -12.5, 5, 3.6], [0, -16.5, 5.6, 3.8]], base, dark, light, 41 + v);
      c.fillStyle = '#c8402a'; c.beginPath(); c.ellipse(-2, -16, 1.4, 0.7, 0.3, 0, TAU); c.fill(); // new leaves come in red
    });
    if (kind === 'pepper') return Art.sprite('can-pepper' + v, 32, 30, 16, 32, (c) => {
      const [base, dark, light] = [['#2f8a3a', '#1e6228', '#4fae4a'], ['#3a9440', '#246a2c', '#5cbc52'], ['#28803e', '#18582a', '#44a452']][v];
      blobsOf(c, [[-6, -17, 5.6, 4], [6, -17, 5.6, 4], [0, -22, 6.4, 4.4], [0, -15, 6, 3.6]], base, dark, light, 47 + v);
    });
    if (kind === 'banana') return Art.sprite('can-banana' + v, 34, 30, 17, 30, (c) => {
      c.fillStyle = '#8a9a42'; c.beginPath(); c.moveTo(-1.4, 0); c.lineTo(-0.9, -13); c.lineTo(0.9, -13); c.lineTo(1.4, 0); c.closePath(); c.fill();
      c.fillStyle = '#6e7e34'; c.fillRect(0.2, -13, 0.7, 13);
      c.strokeStyle = '#a88a4a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-0.6, -11); c.quadraticCurveTo(-3.4, -9, -3, -4); c.stroke(); // a dry leaf hanging
      const leaves = [[-1, -0.7], [1, -0.6], [-0.85, 0.3], [0.95, 0.35], [0.12, -1.1], [-1.15, -0.15]];
      for (let k = 0; k < leaves.length; k++) {
        const [dx, dy] = leaves[k]; const tx = dx * 13, ty = -13 + dy * 7 + 3;
        c.fillStyle = k % 2 ? '#4e9a34' : ['#62b040', '#5aa83c', '#6ab846'][v];
        c.beginPath(); c.moveTo(0, -13); c.quadraticCurveTo(dx * 7, -13 + dy * 6 - 6.4, tx, ty); c.quadraticCurveTo(dx * 6, -13 + dy * 6 - 1.6, 0, -12.2); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(0, -13); c.quadraticCurveTo(dx * 7, -13 + dy * 6 - 4.6, tx, ty); c.stroke();
      }
    });
    if (kind === 'coffee') return Art.sprite('can-coffee' + v, 20, 18, 10, 18, (c) => {
      c.strokeStyle = '#6a5a3a'; c.lineWidth = 0.6; for (const x of [-2.4, 0, 2.4]) { c.beginPath(); c.moveTo(x * 0.3, 0); c.lineTo(x, -10); c.stroke(); }
      const [base, dark] = [['#2e6e34', '#1e4a24'], ['#347434', '#224e28'], ['#2a6a30', '#1a4620']][v];
      for (let k = 0; k < 7; k++) { const y = -2.6 - k * 1.25, w = 4.6 - Math.abs(k - 3) * 0.6; c.fillStyle = k % 2 ? dark : base; c.beginPath(); c.ellipse(0, y, w, 1.1, 0, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.18)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(-2 + k * 0.8, -4 - k * 1.1, 0.8, 0.3, 0.4, 0, TAU); c.fill(); }
    });
    if (kind === 'acai') return Art.sprite('can-acai' + v, 30, 34, 15, 33, (c) => {
      c.strokeStyle = '#7a7058'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-1.2, -11, 0.6, -22); c.stroke();
      c.strokeStyle = '#5a5240'; c.lineWidth = 0.3; for (let k = 1; k < 10; k++) { const y = -k * 2.2; c.beginPath(); c.moveTo(-0.6, y); c.lineTo(0.6, y + 0.2); c.stroke(); }
      const fronds = [[-1, 0.2], [1, 0.3], [-0.6, 0.9], [0.7, 1], [0, -0.6], [-1.2, -0.3], [1.2, -0.2]];
      for (const [dx, dy] of fronds) {
        const tx = 0.6 + dx * 10, ty = -22 + dy * 5 + 4;
        c.strokeStyle = '#3e8a34'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(0.6, -22); c.quadraticCurveTo(0.6 + dx * 5, -25 + dy * 3, tx, ty); c.stroke();
        c.strokeStyle = '#5aa846'; c.lineWidth = 0.35; for (let k = 1; k < 6; k++) { const f = k / 6; const x = 0.6 + (tx - 0.6) * f, y = -22 + (ty + 22) * f - Math.sin(f * Math.PI) * 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 0.4, y + 1.6); c.stroke(); }
      }
    });
    if (kind === 'date') return Art.sprite('can-date' + v, 34, 30, 17, 29, (c) => {
      c.fillStyle = '#8a7050'; c.beginPath(); c.moveTo(-1.3, 0); c.quadraticCurveTo(-1.8, -9, -0.6, -18); c.lineTo(0.9, -18); c.quadraticCurveTo(0.4, -9, 1.4, 0); c.closePath(); c.fill();
      c.strokeStyle = '#6a5438'; c.lineWidth = 0.35; for (let k = 1; k < 9; k++) { const y = -k * 2; c.beginPath(); c.moveTo(-1.2, y + 0.6); c.lineTo(0, y); c.lineTo(1.2, y + 0.6); c.stroke(); }
      const fr = [[-1, -0.5], [1, -0.45], [-0.75, 0.4], [0.8, 0.45], [0, -1], [-1.15, 0], [1.15, 0.05]];
      for (let k = 0; k < fr.length; k++) { const [dx, dy] = fr[k]; c.strokeStyle = ['#7a9a5a', '#6a8a4c', '#8aa866'][k % 3]; c.lineWidth = 2 - (k % 2) * 0.5; c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(dx * 7, -18 + dy * 5 - 4.4, dx * 12.5, -18 + dy * 6 + 4); c.stroke(); }
    });
    if (kind === 'incense') return Art.sprite('can-incense' + v, 24, 20, 12, 19, (c) => {
      c.strokeStyle = '#c8b89a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-1.4, -4, 0.4, -7); c.stroke();
      c.lineWidth = 0.8; c.beginPath(); c.moveTo(0.4, -7); c.quadraticCurveTo(-3, -9, -5, -12); c.moveTo(0.4, -7); c.quadraticCurveTo(3, -9, 4.6, -13); c.moveTo(0.2, -7.5); c.lineTo(0.6, -13); c.stroke();
      c.strokeStyle = '#a8987a'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(-0.6, -1); c.lineTo(-0.4, -5); c.stroke();
      const lc = ['#8a9a5a', '#7a8e52', '#96a464'][v]; c.fillStyle = lc;
      for (const [x, y] of [[-5, -12.5], [-3.6, -11.6], [4.6, -13.5], [3.4, -12.2], [0.6, -13.6], [-0.6, -12.8]]) { c.beginPath(); c.ellipse(x, y, 1.6, 0.9, 0, 0, TAU); c.fill(); }
    });
    // palm: fronds anchored at trunk top
    return Art.sprite('can-palm' + v, 34, 22, 17, 12, (c) => {
      const cols = ['#4f9d45', '#3c7d36', '#6cbc55'];
      const leaves = [[-1, -0.35], [1, -0.3], [-0.6, 0.5], [0.7, 0.55], [0, -1], [-1.1, 0.15], [1.15, 0.2]];
      for (let k = 0; k < leaves.length; k++) {
        const [dx, dy] = leaves[k];
        c.strokeStyle = cols[k % 3]; c.lineWidth = 3.2 - (k % 2) * 0.6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(dx * 8, dy * 6 - 6, dx * 14, dy * 7 + 3); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(dx * 8, dy * 6 - 6.5, dx * 13, dy * 7 + 2); c.stroke();
      }
      c.fillStyle = '#6b4a24'; for (const [x, y] of [[-1.2, 1.2], [1, 1.4], [0, 2]]) { c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill(); }
    });
  };
  // ripe fruit on a tree: as much as the tree carries now (positions in the canopy sprite's own space)
  const FRUITS = {
    apple: { col: '#d8302a', hi: '#ff8a7a', r: 0.95, at: [[-5, -14], [3, -16], [0, -20], [5, -11], [-2, -11], [-6, -17], [2.4, -13], [-3, -18], [6, -15]] },
    mulberry: { col: '#4a1a3a', hi: '#8a4a7a', r: 0.65, at: [[-5, -14], [4, -15], [0, -21], [5, -12], [-2, -12], [-6, -18], [2, -14], [-1, -17]] },
    olive: { col: '#3a3a2a', hi: '#6a6a4a', r: 0.55, at: [[-6, -13], [4, -15], [0, -18], [6, -13], [-2, -12], [-8, -14], [2, -13], [-3, -16], [7, -15], [1, -11]] },
    cacao: { col: '#e8a030', hi: '#f8d070', r: 0, pod: 1, at: [[-1.2, -3.2], [1.3, -4.6], [-1.1, -6], [1.2, -2.4], [0.2, -7]] },
    coffee: { col: '#c8202a', hi: '#ff6a5a', r: 0.42, at: [[-3, -3], [2.6, -4], [-1.4, -5.6], [1.8, -6.8], [-2.6, -7.6], [0.4, -9], [3, -8], [-0.4, -3.6], [1, -10.4], [-1.8, -9.6]] },
    pepper: { col: '#c83a2a', hi: '#58a034', r: 0.4, at: [[1.4, -4], [-1.2, -6], [1.6, -8], [-1.4, -10], [1.2, -12], [-0.8, -14], [-5, -16], [5, -17]] },
    banana: { col: '#e8d03a', hi: '#a8b030', r: 0, bunch: [1.4, -11.4], at: [[0, 0]] },
    acai: { col: '#3a1a4a', hi: '#6a3a7a', r: 0.5, cluster: 1, at: [[-1.4, -20.2], [2.4, -20], [0.4, -19.4], [-0.4, -20.8], [1.6, -19]] },
    date: { col: '#c8702a', hi: '#e8a050', r: 0.6, cluster: 1, at: [[-2, -16.4], [2.2, -16.2], [0.2, -15.6], [-1, -17], [1.2, -15.2]] },
    incense: { col: '#f2e2a8', hi: '#fff6d0', r: 0.42, at: [[-0.4, -2], [0.2, -4.4], [-0.6, -5.6], [0.6, -6.6]] },
  };
  Art.FRUITS = FRUITS;
  Art.fruit = function (ctx, t, sx, sy, s) {
    const F = FRUITS[t.kind]; if (!F || !(t.fruit > 0.2)) return;
    const n = Math.max(1, Math.round(F.at.length * Math.min(1, t.fruit / 3)));
    ctx.save(); ctx.translate(sx, sy); ctx.scale(s, s);
    if (F.bunch) { // a hanging bunch, green turning yellow, and the purple heart below it
      const [bx, by] = F.bunch; const ripe = t.fruit >= 1.5;
      ctx.fillStyle = ripe ? F.col : F.hi; for (let k = 0; k < Math.min(9, 3 + n * 3); k++) { const r = (k % 3) * 0.75 - 0.75, q = Math.floor(k / 3) * 1.1; ctx.beginPath(); ctx.ellipse(bx + r, by + q, 0.45, 1, 0.25, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#7a2a4a'; ctx.beginPath(); ctx.ellipse(bx + 0.2, by + 4.6, 0.8, 1.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
    for (let k = 0; k < n; k++) {
      const [x, y] = F.at[k];
      if (F.pod) { ctx.fillStyle = k % 2 ? '#c8702a' : F.col; ctx.beginPath(); ctx.ellipse(x, y, 0.7, 1.3, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.15; ctx.beginPath(); ctx.moveTo(x, y - 1.2); ctx.lineTo(x, y + 1.2); ctx.stroke(); continue; }
      if (F.cluster) { ctx.fillStyle = F.col; for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(x + (q % 2) * 0.7 - 0.35, y + Math.floor(q / 2) * 0.7, F.r, 0, Math.PI * 2); ctx.fill(); } continue; }
      ctx.fillStyle = F.col; ctx.beginPath(); ctx.arc(x, y, F.r, 0, Math.PI * 2); ctx.fill();
      if (F.r > 0.6) { ctx.fillStyle = F.hi; ctx.beginPath(); ctx.arc(x - F.r * 0.35, y - F.r * 0.35, F.r * 0.35, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  };
  Art.palmTrunk = function () {
    return Art.sprite('palmtrunk', 14, 26, 4, 24, (c) => {
      c.strokeStyle = '#8a6a44'; c.lineWidth = 2.6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-1, -12, 4, -20); c.stroke();
      c.strokeStyle = '#6a4e30'; c.lineWidth = 0.5;
      for (let k = 1; k < 8; k++) { const t = k / 8; const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * -1 + t * t * 4; const y = 2 * (1 - t) * t * -12 + t * t * -20; c.beginPath(); c.moveTo(x - 1.3, y); c.lineTo(x + 1.3, y + 0.3); c.stroke(); }
    });
  };
  Art.burntTree = function () {
    return Art.sprite('burnt', 20, 30, 10, 28, (c) => {
      c.strokeStyle = '#2a2320'; c.lineCap = 'round';
      c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0.5, -16); c.stroke();
      c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(0.3, -9); c.lineTo(-5, -15); c.moveTo(0.4, -12); c.lineTo(5, -18); c.moveTo(0.5, -15); c.lineTo(-2, -22); c.moveTo(-3, -13); c.lineTo(-6, -13); c.stroke();
      c.fillStyle = '#1c1715'; c.beginPath(); c.ellipse(0, 0, 2.4, 1, 0, 0, TAU); c.fill();
    });
  };
  Art.stump = function () {
    return Art.sprite('stump', 10, 8, 5, 6, (c) => {
      c.fillStyle = '#5a3c22'; c.fillRect(-2, -3, 4, 3);
      c.fillStyle = '#4a311c'; c.fillRect(0.4, -3, 1.6, 3);
      c.fillStyle = '#c9a26b'; c.beginPath(); c.ellipse(0, -3, 2, 0.9, 0, 0, TAU); c.fill();
      c.strokeStyle = '#9a7a4a'; c.lineWidth = 0.3; c.beginPath(); c.ellipse(0, -3, 1.1, 0.45, 0, 0, TAU); c.stroke();
    });
  };
  Art.log = function (burnt) {
    return Art.sprite('log' + (burnt ? 'b' : ''), 22, 10, 11, 7, (c) => {
      c.fillStyle = burnt ? '#2a2320' : '#7a5230'; c.beginPath(); c.moveTo(-9, -3); c.lineTo(8, 1); c.lineTo(8, 3.5); c.lineTo(-9, -0.5); c.closePath(); c.fill();
      c.fillStyle = burnt ? '#3a302a' : '#8f6238'; c.beginPath(); c.moveTo(-9, -3); c.lineTo(8, 1); c.lineTo(8, 2); c.lineTo(-9, -2); c.closePath(); c.fill();
      c.fillStyle = burnt ? '#4a3a30' : '#d6b27a'; c.beginPath(); c.ellipse(8, 2.25, 1, 1.35, 0.2, 0, TAU); c.fill();
    });
  };
  Art.sapling = function () {
    return Art.sprite('sapling', 10, 12, 5, 11, (c) => {
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -6); c.stroke();
      c.fillStyle = '#6fb04a'; c.beginPath(); c.ellipse(-1.8, -6, 2, 1.1, -0.5, 0, TAU); c.fill();
      c.fillStyle = '#86c65a'; c.beginPath(); c.ellipse(1.8, -7, 2, 1.1, 0.5, 0, TAU); c.fill();
      c.fillStyle = '#5a9a3c'; c.beginPath(); c.ellipse(0, -8.5, 1.3, 1.8, 0, 0, TAU); c.fill();
    });
  };

  // ------------------------------ rocks & bushes ------------------------------
  Art.rock = function (v, meteor) {
    return Art.sprite('rock' + v + (meteor ? 'm' : ''), 26, 20, 13, 14, (c) => {
      const base = meteor ? '#4a3f44' : '#9a958c', dark = meteor ? '#2e272b' : '#716c65', light = meteor ? '#6a5c62' : '#c4bfb4';
      const shapes = v === 0 ? [[-4, -3, 6, 5], [4, -2, 5, 4], [0, -6, 4, 4]] : v === 1 ? [[0, -4, 7, 6], [-6, -1, 3.5, 3], [6, 0, 3, 2.5]] : [[-3, -2, 5, 4.5], [3, -4, 5.5, 5.5], [6, 1, 3, 2]];
      for (const [x, y, w, h] of shapes) {
        c.fillStyle = dark; c.beginPath(); c.moveTo(x - w, y + h * 0.5); c.lineTo(x - w * 0.6, y - h * 0.6); c.lineTo(x + w * 0.2, y - h); c.lineTo(x + w, y - h * 0.2); c.lineTo(x + w * 0.8, y + h * 0.6); c.lineTo(x - w * 0.3, y + h * 0.8); c.closePath(); c.fill();
        c.fillStyle = base; c.beginPath(); c.moveTo(x - w, y + h * 0.5); c.lineTo(x - w * 0.6, y - h * 0.6); c.lineTo(x + w * 0.2, y - h); c.lineTo(x + w * 0.35, y + h * 0.1); c.lineTo(x - w * 0.3, y + h * 0.7); c.closePath(); c.fill();
        c.fillStyle = light; c.beginPath(); c.moveTo(x - w * 0.6, y - h * 0.6); c.lineTo(x + w * 0.2, y - h); c.lineTo(x + w * 0.1, y - h * 0.35); c.lineTo(x - w * 0.5, y - h * 0.1); c.closePath(); c.fill();
        if (meteor) { c.strokeStyle = 'rgba(255,120,40,0.8)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(x - w * 0.4, y); c.lineTo(x, y - h * 0.4); c.lineTo(x + w * 0.4, y - h * 0.1); c.stroke(); }
      }
    });
  };
  const BERRY_POS = [[-3.5, -5], [2.5, -6.5], [0, -3.5], [-1.5, -8], [3.8, -3.5], [-4.5, -2.5]];
  Art.bush = function (v, dry) {
    return Art.sprite('bush' + v + (dry ? 'd' : ''), 18, 14, 9, 12, (c) => {
      const cols = dry ? ['#6e5a36', '#8a7446', '#a08a58'] : [['#3f7d34', '#56a043', '#7cc35c'], ['#3a7a3e', '#4f9a50', '#74bd6a'], ['#4a8233', '#62a444', '#8ccb5e']][v];
      const [d, b, l] = cols;
      c.fillStyle = d; c.beginPath(); c.arc(-3, -3.5, 4, 0, TAU); c.arc(3, -3.5, 4, 0, TAU); c.arc(0, -6, 4.3, 0, TAU); c.fill();
      c.fillStyle = b; c.beginPath(); c.arc(-3.3, -4, 3.3, 0, TAU); c.arc(2.6, -4.2, 3.3, 0, TAU); c.arc(-0.3, -6.6, 3.6, 0, TAU); c.fill();
      c.fillStyle = l; c.beginPath(); c.arc(-1.5, -8, 1.8, 0, TAU); c.arc(-4.2, -5, 1.4, 0, TAU); c.fill();
    });
  };
  Art.berries = function (ctx, x, y, n, sc) {
    ctx.fillStyle = '#d8324a';
    for (let k = 0; k < Math.min(n, 6); k++) { const [bx, by] = BERRY_POS[k]; ctx.beginPath(); ctx.arc(x + bx * sc, y + by * sc, 0.95 * sc, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let k = 0; k < Math.min(n, 6); k++) { const [bx, by] = BERRY_POS[k]; ctx.fillRect(x + (bx - 0.35) * sc, y + (by - 0.45) * sc, 0.4 * sc, 0.4 * sc); }
  };

  // ------------------------------ buildings ------------------------------
  const ROOFS = [['#b85a3c', '#94452d', '#7a3826'], ['#9a6a3a', '#7f5530', '#6a4526'], ['#6c6f86', '#56596e', '#46485a']];
  Art.building = function (type, v, style, extra) {
    if (G.Arch) { const s = G.Arch.building(type, v, style || 'classico', extra); if (s) return s; }
    const key = 'b-' + type + v;
    switch (type) {
      case 'hut': {
        const [w, h, ax, ay] = spriteDims(1, 1, 26);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          const straw = [['#e2bf6c', '#b08a44'], ['#d9b25e', '#a37f3c'], ['#e8c878', '#b89450']][v];
          c.fillStyle = 'rgba(0,0,0,0)';
          // walls
          let g = c.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#c9a36e'); g.addColorStop(1, '#86673f');
          c.fillStyle = g; c.beginPath(); c.ellipse(0, 1, 9.5, 4.8, 0, 0, Math.PI); c.lineTo(-9.5, -5); c.lineTo(9.5, -5); c.closePath(); c.fill();
          c.fillRect(-9.5, -5, 19, 6);
          c.strokeStyle = 'rgba(80,55,30,0.5)'; c.lineWidth = 0.4;
          for (let k = -8; k <= 8; k += 2.2) { c.beginPath(); c.moveTo(k, -5); c.lineTo(k, 1 + Math.sqrt(Math.max(0, 1 - (k / 9.5) ** 2)) * 4.8 - 0.3); c.stroke(); }
          // door
          c.fillStyle = '#3a2616'; c.beginPath(); c.moveTo(-6, 4.5); c.lineTo(-6, -1.5); c.quadraticCurveTo(-4, -4.4, -2, -1.5); c.lineTo(-2, 5.3); c.closePath(); c.fill();
          m.win.push([[-5.6, 4.4], [-5.6, -1.3], [-4, -3.4], [-2.4, -1.3], [-2.4, 5.1]]);
          // roof
          g = c.createLinearGradient(-12, 0, 12, 0); g.addColorStop(0, straw[0]); g.addColorStop(1, straw[1]);
          c.fillStyle = g; c.beginPath(); c.moveTo(-12.5, -4); c.lineTo(0, -22); c.lineTo(12.5, -4); c.ellipse(0, -4, 12.5, 5.5, 0, 0, Math.PI); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(110,80,35,0.45)'; c.lineWidth = 0.45;
          for (let k = -11; k <= 11; k += 2) { c.beginPath(); c.moveTo(0, -21.5); c.lineTo(k, -4 + Math.sqrt(Math.max(0, 1 - (k / 12.5) ** 2)) * 5.5); c.stroke(); }
          c.strokeStyle = 'rgba(255,240,200,0.35)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(0, -4, 12.3, 5.3, 0, 0.2, Math.PI - 0.2); c.stroke();
          c.fillStyle = '#7a5a2e'; c.beginPath(); c.arc(0, -22, 1.4, 0, TAU); c.fill();
          c.strokeStyle = '#7a5a2e'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -22); c.lineTo(-1.5, -25); c.moveTo(0, -22); c.lineTo(1.4, -25.5); c.stroke();
        });
      }
      case 'house': {
        const [w, h, ax, ay] = spriteDims(1, 1, 30);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          const [rf, rb, re] = ROOFS[v];
          const x0 = -0.36, x1 = 0.36, y0 = -0.36, y1 = 0.36, H = 12;
          box(c, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, 0, 2, '#8a8478', '#6f6a60', '#a09a8e');
          walls(c, x0, y0, x1, y1, 2, H, v === 2 ? '#e3dccb' : '#efe2c4', v === 2 ? '#c4bba8' : '#d2c19e');
          // timber frame
          c.strokeStyle = '#6b4a30'; c.lineWidth = 0.8;
          const line = (a, b) => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
          line(P(x0, y1, 2), P(x0, y1, H)); line(P(x1, y1, 2), P(x1, y1, H)); line(P(x1, y0, 2), P(x1, y0, H));
          line(P(x0, y1, 7), P(x1, y1, 7)); line(P(x1, y1, 7), P(x1, y0, 7));
          line(P(x0, y1, H), P(x1, y1, H)); line(P(x1, y1, H), P(x1, y0, H));
          // door & windows
          onL(c, y1, -0.14, 0.06, 2, 9, '#5a3b25');
          c.fillStyle = '#c9a063'; const dk = P(0.02, y1, 5.5); c.fillRect(dk[0], dk[1], 0.6, 0.6);
          onL(c, y1, 0.14, 0.28, 8, 11, '#2f3a48', m, 1);
          onR(c, x1, -0.2, 0.0, 8, 11, '#2f3a48', m, 1);
          onR(c, x1, -0.2, 0.0, 3.5, 6.5, '#2f3a48', m, 1);
          gableX(c, x0, y0, x1, y1, H, H + 11, 0.1, rf, rb, v === 2 ? '#cfc6b2' : '#dccba6', re);
          // chimney
          box(c, 0.1, -0.2, 0.24, -0.06, H + 4, H + 14, '#8e8578', '#6f675c', '#5a534a');
          m.fires.push(P(0.17, -0.13, H + 15));
        });
      }
      case 'storehouse': {
        const [w, h, ax, ay] = spriteDims(2, 2, 34);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          const x0 = -0.78, x1 = 0.78, y0 = -0.78, y1 = 0.78, H = 15;
          box(c, x0 - 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05, 0, 2.5, '#7c7468', '#645d53', '#958d80');
          walls(c, x0, y0, x1, y1, 2.5, H, '#a0703f', '#7c5431');
          c.strokeStyle = 'rgba(60,35,15,0.45)'; c.lineWidth = 0.45;
          for (let z = 4.5; z < H; z += 2) { let a = P(x0, y1, z), b = P(x1, y1, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); a = P(x1, y1, z); b = P(x1, y0, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
          onL(c, y1, -0.35, 0.3, 2.5, 12, '#4a301c');
          c.strokeStyle = '#7a5230'; c.lineWidth = 0.7;
          let a = P(-0.35, y1, 2.5), b = P(0.3, y1, 12); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
          a = P(0.3, y1, 2.5); b = P(-0.35, y1, 12); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
          onR(c, x1, -0.3, 0.1, 9, 12, '#2b323c', m, 1);
          gableX(c, x0, y0, x1, y1, H, H + 16, 0.12, v === 1 ? '#8a6a3a' : '#6e4a2e', v === 1 ? '#735630' : '#5a3c26', '#8a6036', '#3e2a1a');
        });
      }
      case 'workshop': {
        const [w, h, ax, ay] = spriteDims(2, 2, 44);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          const x0 = -0.8, x1 = 0.3, y0 = -0.8, y1 = 0.78, H = 14;
          box(c, x0, y0, x1, y1, 0, 6, '#a39d93', '#86807a', '#b5afa4');
          c.strokeStyle = 'rgba(60,55,50,0.35)'; c.lineWidth = 0.35;
          for (let z = 2; z < 6; z += 2) { const a = P(x0, y1, z), b = P(x1, y1, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
          walls(c, x0, y0, x1, y1, 6, H, '#b0804e', '#8c6238');
          onL(c, y1, -0.5, -0.2, 7.5, 11, '#2f3a48', m, 1);
          onL(c, y1, 0.0, 0.2, 0, 9, '#4a301c');
          gableX(c, x0, y0, x1, y1, H, H + 12, 0.1, '#5f6776', '#4e5562', '#b8905e', '#3a3f48');
          // tall chimney
          box(c, -0.55, -0.6, -0.3, -0.35, 8, H + 22, '#8a8378', '#6c655b', '#57504a');
          m.fires.push(P(-0.43, -0.48, H + 23));
          // lean-to shed with anvil
          const sx0 = 0.3, sx1 = 0.8;
          for (const [px, py] of [[sx1, -0.6], [sx1, 0.7]]) box(c, px - 0.04, py - 0.04, px + 0.02, py + 0.02, 0, 10, '#6e4a2c', '#553820', '#6e4a2c');
          poly(c, [P(sx0, -0.75, H - 1), P(sx1 + 0.08, -0.75, 10), P(sx1 + 0.08, 0.8, 10), P(sx0, 0.8, H - 1)], '#7d6a55', '#4a3a2a', 0.4);
          box(c, 0.45, 0.05, 0.62, 0.3, 0, 3.5, '#3c3c40', '#2a2a2e', '#55555c');
          box(c, 0.4, 0.1, 0.68, 0.25, 3.5, 5, '#4a4a52', '#34343a', '#707078');
          m.glow.push(P(0.54, 0.18, 6));
        });
      }
      case 'temple': {
        const [w, h, ax, ay] = spriteDims(2, 2, 46);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          box(c, -0.95, -0.95, 0.95, 0.95, 0, 3, '#cfc6ae', '#ada38a', '#e4ddca');
          box(c, -0.8, -0.8, 0.8, 0.8, 3, 6, '#d8d0ba', '#b6ac94', '#ebe5d4');
          const x0 = -0.5, x1 = 0.45, y0 = -0.5, y1 = 0.45, H = 24;
          walls(c, x0, y0, x1, y1, 6, H, '#f1ead9', '#cfc5ae');
          onL(c, y1, -0.15, 0.15, 6, 16, '#3a2e24', m, 1);
          // columns
          const col = (cx, cy) => { box(c, cx - 0.045, cy - 0.045, cx + 0.045, cy + 0.045, 6, H, '#fbf6ea', '#d6ccb4', '#fffaf0'); };
          for (const cx of [-0.5, -0.17, 0.2, 0.62]) col(cx, 0.66);
          for (const cy of [-0.5, -0.17, 0.2]) col(0.62, cy);
          box(c, -0.62, -0.62, 0.74, 0.74, H, H + 2.5, '#e8dfca', '#c9bea4', '#f4eedf');
          gableX(c, -0.62, -0.62, 0.74, 0.74, H + 2.5, H + 15, 0.06, '#c46a45', '#a45534', '#efe6d2', '#8a4028');
          // golden emblem on gable
          const e = P(0.8, 0.06, H + 7);
          c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(e[0], e[1], 2.2, 2.6, -0.5, 0, TAU); c.fill();
          c.fillStyle = '#fff1b8'; c.beginPath(); c.ellipse(e[0] - 0.3, e[1] - 0.4, 0.9, 1.1, -0.5, 0, TAU); c.fill();
          m.glow.push(e);
          // braziers
          for (const [bx, by] of [[-0.72, 0.8], [0.8, -0.72]]) {
            box(c, bx - 0.06, by - 0.06, bx + 0.06, by + 0.06, 6, 10, '#8a7a5a', '#6a5a40', '#9a8a6a');
            m.fires.push(P(bx, by, 11));
          }
        });
      }
      case 'monument': {
        const [w, h, ax, ay] = spriteDims(2, 2, 72);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          box(c, -0.95, -0.95, 0.95, 0.95, 0, 1.5, '#c9c1ae', '#aaa18c', '#ddd6c5');
          c.strokeStyle = 'rgba(120,110,95,0.35)'; c.lineWidth = 0.35;
          for (let k = -0.95; k <= 0.95; k += 0.38) { let a = P(k, -0.95, 1.5), b = P(k, 0.95, 1.5); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); a = P(-0.95, k, 1.5); b = P(0.95, k, 1.5); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
          box(c, -0.36, -0.36, 0.36, 0.36, 1.5, 5, '#b8ae98', '#978d78', '#cbc2ae');
          box(c, -0.28, -0.28, 0.28, 0.28, 5, 8, '#c4baa4', '#a39984', '#d6ceba');
          // tapered obelisk
          const z0 = 8, z1 = 58, a0 = 0.2, a1 = 0.12;
          poly(c, [P(-a0, a0, z0), P(a0, a0, z0), P(a1, a1, z1), P(-a1, a1, z1)], '#e6dfcc');
          poly(c, [P(a0, a0, z0), P(a0, -a0, z0), P(a1, -a1, z1), P(a1, a1, z1)], '#bdb39c');
          const t = P(0, 0, z1 + 9);
          poly(c, [P(-a1, a1, z1), P(a1, a1, z1), t], '#f7d66a');
          poly(c, [P(a1, a1, z1), P(a1, -a1, z1), t], '#d9a93a');
          // eye emblem
          const e = P(0, 0.18, 34);
          c.fillStyle = '#d9b34a'; c.beginPath(); c.ellipse(e[0] - 1.5, e[1] - 0.8, 2.6, 1.3, -0.46, 0, TAU); c.fill();
          c.fillStyle = '#6a4a1a'; c.beginPath(); c.arc(e[0] - 1.5, e[1] - 0.8, 0.8, 0, TAU); c.fill();
          m.glow.push([e[0] - 1.5, e[1] - 0.8]);
          m.glow.push(t);
          // flower beds on plaza corners
          for (const [fx, fy] of [[-0.75, 0.75], [0.75, -0.75], [0.75, 0.75]]) {
            const p = P(fx, fy, 1.5);
            for (let k = 0; k < 6; k++) { c.fillStyle = ['#ff8fb0', '#ffd85a', '#ffffff', '#b98cff'][k % 4]; c.beginPath(); c.arc(p[0] + Math.cos(k) * 2, p[1] + Math.sin(k * 1.7) * 1, 0.8, 0, TAU); c.fill(); }
          }
        });
      }
      case 'quartel': {
        const [w, h, ax, ay] = spriteDims(2, 2, 40);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          box(c, -0.92, -0.92, 0.92, 0.92, 0, 1.5, '#8a8276', '#6c655b', '#a39a8c');
          const x0 = -0.82, x1 = 0.3, y0 = -0.82, y1 = 0.72, H = 13;
          box(c, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, 1.5, 3.5, '#7c7468', '#645d53', '#958d80');
          walls(c, x0, y0, x1, y1, 3.5, H, '#8a5a36', '#6a4428');
          c.strokeStyle = 'rgba(40,24,12,0.45)'; c.lineWidth = 0.45;
          for (let z = 5.5; z < H; z += 2) { let a = P(x0, y1, z), b = P(x1, y1, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); a = P(x1, y1, z); b = P(x1, y0, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
          onL(c, y1, -0.3, 0.0, 3.5, 10.5, '#3a2414');
          onR(c, x1, -0.55, -0.35, 8, 11, '#2b323c', m, 1);
          onR(c, x1, 0.05, 0.25, 8, 11, '#2b323c', m, 1);
          gableX(c, x0, y0, x1, y1, H, H + 11, 0.1, '#7a3a2a', '#5e2c20', '#9a6a44', '#3e1c14');
          // spear rack
          box(c, 0.52, -0.72, 0.62, 0.62, 5, 6.2, '#6e4a2c', '#553820', '#7a5634');
          for (const py of [-0.6, -0.36, -0.12, 0.12, 0.36, 0.56]) {
            const a = P(0.6, py, 1.5), b = P(0.6, py, 17);
            c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
            c.fillStyle = '#c4c8d0'; c.beginPath(); c.moveTo(b[0] - 0.9, b[1]); c.lineTo(b[0], b[1] - 2.8); c.lineTo(b[0] + 0.9, b[1]); c.fill();
          }
          // training dummy
          const d = P(0.62, 0.86, 1.5);
          c.strokeStyle = '#6e4a2c'; c.lineWidth = 1; c.beginPath(); c.moveTo(d[0], d[1]); c.lineTo(d[0], d[1] - 11); c.moveTo(d[0] - 3.2, d[1] - 7.5); c.lineTo(d[0] + 3.2, d[1] - 7.5); c.stroke();
          c.fillStyle = '#d8c090'; c.beginPath(); c.ellipse(d[0], d[1] - 8, 2, 3, 0, 0, TAU); c.fill();
          c.beginPath(); c.arc(d[0], d[1] - 12.4, 1.7, 0, TAU); c.fill();
          m.fires.push(P(-0.2, 0.9, 3));
        });
      }
      case 'torre': {
        const [w, h, ax, ay] = spriteDims(1, 1, 54);
        return Art.sprite(key, w, h, ax, ay, (c, m) => {
          box(c, -0.42, -0.42, 0.42, 0.42, 0, 3, '#8e8578', '#6f675c', '#a0988c');
          const legs = [[-0.32, -0.32], [0.32, -0.32], [0.32, 0.32], [-0.32, 0.32]];
          const ln = (a, b, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
          for (const [lx, ly] of legs) ln(P(lx, ly, 3), P(lx * 0.78, ly * 0.78, 31), 1.6, '#6e4a2c');
          for (const [a0, b0] of [[legs[3], legs[2]], [legs[2], legs[1]]]) {
            ln(P(a0[0], a0[1], 5), P(b0[0] * 0.84, b0[1] * 0.84, 20), 0.6, '#5a3a20');
            ln(P(b0[0], b0[1], 5), P(a0[0] * 0.84, a0[1] * 0.84, 20), 0.6, '#5a3a20');
            ln(P(a0[0] * 0.86, a0[1] * 0.86, 18), P(b0[0] * 0.8, b0[1] * 0.8, 30), 0.6, '#5a3a20');
          }
          box(c, -0.4, -0.4, 0.4, 0.4, 30, 32.5, '#8a6038', '#6a4628', '#a07448');
          walls(c, -0.4, -0.4, 0.4, 0.4, 32.5, 36, 'rgba(128,86,48,0.95)', 'rgba(98,64,36,0.95)');
          c.strokeStyle = 'rgba(40,24,12,0.5)'; c.lineWidth = 0.4;
          for (let k = -0.3; k <= 0.3; k += 0.15) { let a = P(k, 0.4, 32.5), b = P(k, 0.4, 36); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); a = P(0.4, k, 32.5); b = P(0.4, k, 36); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
          for (const [lx, ly] of [[0.36, 0.36], [0.36, -0.36], [-0.36, 0.36]]) ln(P(lx, ly, 36), P(lx, ly, 41), 0.8, '#5a3a20');
          const tp = P(0, 0, 52);
          poly(c, [P(-0.5, 0.5, 40), P(0.5, 0.5, 40), tp], '#7a3a2a', '#3e1c14', 0.4);
          poly(c, [P(0.5, 0.5, 40), P(0.5, -0.5, 40), tp], '#5e2c20', '#3e1c14', 0.4);
          m.fires.push(P(0.2, 0.25, 36.5));
        });
      }
      case 'well': {
        const [w, h, ax, ay] = spriteDims(1, 1, 24);
        return Art.sprite(key, w, h, ax, ay, (c) => {
          const g = c.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, '#b8b2a6'); g.addColorStop(1, '#7e786e');
          c.fillStyle = g; c.beginPath(); c.ellipse(0, 1, 7, 3.5, 0, 0, Math.PI); c.lineTo(-7, -4); c.lineTo(7, -4); c.closePath(); c.fill(); c.fillRect(-7, -4, 14, 5);
          c.strokeStyle = 'rgba(70,65,60,0.5)'; c.lineWidth = 0.35;
          for (let z = -2; z <= 0; z += 2) { c.beginPath(); c.ellipse(0, z + 1, 7, 3.5, 0, 0.1, Math.PI - 0.1); c.stroke(); }
          c.fillStyle = '#cfc9bd'; c.beginPath(); c.ellipse(0, -4, 7, 3.5, 0, 0, TAU); c.fill();
          c.fillStyle = '#1e3a4a'; c.beginPath(); c.ellipse(0, -4, 5.2, 2.5, 0, 0, TAU); c.fill();
          c.fillStyle = 'rgba(120,190,220,0.5)'; c.beginPath(); c.ellipse(-1, -4.4, 2, 0.8, 0, 0, TAU); c.fill();
          c.fillStyle = '#6e4a2c'; c.fillRect(-6.5, -16, 1.2, 12); c.fillRect(5.3, -16, 1.2, 12);
          c.fillStyle = '#9a4a32'; c.beginPath(); c.moveTo(-9, -14); c.lineTo(0, -20); c.lineTo(9, -14); c.lineTo(9, -12.5); c.lineTo(0, -18.3); c.lineTo(-9, -12.5); c.closePath(); c.fill();
          c.fillStyle = '#7a3826'; c.beginPath(); c.moveTo(0, -20); c.lineTo(9, -14); c.lineTo(9, -12.5); c.lineTo(0, -18.3); c.closePath(); c.fill();
          c.strokeStyle = '#4a3a2a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-5.3, -13); c.lineTo(5.3, -13); c.moveTo(0, -13); c.lineTo(0, -8); c.stroke();
          c.fillStyle = '#7a5a3a'; c.fillRect(-1.2, -8, 2.4, 2);
        });
      }
    }
    return null;
  };

  // ------------------------------ emote icons ------------------------------
  Art.icon = function (k) {
    return Art.sprite('icon-' + k, 14, 15, 7, 13, (c) => {
      // bubble
      c.fillStyle = 'rgba(255,255,255,0.95)'; c.strokeStyle = 'rgba(60,50,40,0.35)'; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(-5, -12); c.arcTo(5.5, -12, 5.5, -2.5, 3); c.arcTo(5.5, -2.5, -5.5, -2.5, 3);
      c.lineTo(1.2, -2.5); c.lineTo(0, 0); c.lineTo(-1.2, -2.5);
      c.arcTo(-5.5, -2.5, -5.5, -12, 3); c.arcTo(-5.5, -12, 5.5, -12, 3); c.closePath(); c.fill(); c.stroke();
      c.save(); c.translate(0, -7.2);
      switch (k) {
        case 'heart': c.fillStyle = '#e8456b'; c.beginPath(); c.moveTo(0, 2.8); c.bezierCurveTo(-4.5, -0.5, -2.5, -4, 0, -1.6); c.bezierCurveTo(2.5, -4, 4.5, -0.5, 0, 2.8); c.fill(); break;
        case 'food': c.fillStyle = '#b8683a'; c.beginPath(); c.ellipse(-0.8, 0.6, 2.8, 2.1, -0.6, 0, TAU); c.fill(); c.fillStyle = '#f4ead8'; c.fillRect(1.3, -2.6, 1.2, 2.6); c.beginPath(); c.arc(1.3, -2.8, 0.8, 0, TAU); c.arc(2.6, -2.6, 0.8, 0, TAU); c.fill(); break;
        case 'zzz': c.fillStyle = '#5a78c8'; c.font = 'bold 5px sans-serif'; c.fillText('z', -3.5, 2); c.font = 'bold 4px sans-serif'; c.fillText('z', -0.5, -0.5); c.font = 'bold 3px sans-serif'; c.fillText('z', 2, -2.5); break;
        case 'hammer': c.fillStyle = '#8a5a32'; c.save(); c.rotate(0.6); c.fillRect(-0.5, -1, 1, 5); c.fillStyle = '#707480'; c.fillRect(-2.5, -3, 5, 2); c.restore(); break;
        case 'fear': c.fillStyle = '#d83a3a'; c.fillRect(-0.8, -3.4, 1.6, 4.2); c.beginPath(); c.arc(0, 2.4, 0.95, 0, TAU); c.fill(); c.fillStyle = '#5aa0e8'; c.beginPath(); c.moveTo(3, -2.6); c.quadraticCurveTo(4.4, 0, 3, 0.4); c.quadraticCurveTo(1.6, 0, 3, -2.6); c.fill(); break;
        case 'fire': c.fillStyle = '#ff7a1a'; c.beginPath(); c.moveTo(0, -3.8); c.quadraticCurveTo(3.8, 0, 2, 2.8); c.quadraticCurveTo(0, 3.6, -2, 2.8); c.quadraticCurveTo(-3.6, 0, 0, -3.8); c.fill(); c.fillStyle = '#ffd24a'; c.beginPath(); c.moveTo(0, -0.8); c.quadraticCurveTo(1.8, 1, 0.8, 2.6); c.lineTo(-0.8, 2.6); c.quadraticCurveTo(-1.8, 1, 0, -0.8); c.fill(); break;
        case 'awe': c.fillStyle = '#f2b829'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 1.2 : 3.6; c.lineTo(Math.cos(a - Math.PI / 2) * r, Math.sin(a - Math.PI / 2) * r); } c.closePath(); c.fill(); break;
        case 'chat': c.fillStyle = '#7a6a5a'; for (const x of [-2.4, 0, 2.4]) { c.beginPath(); c.arc(x, 0.4, 0.95, 0, TAU); c.fill(); } break;
        case 'sick': c.fillStyle = '#8ccf4a'; c.beginPath(); c.arc(0, 0, 3.2, 0, TAU); c.fill(); c.fillStyle = '#3a5a1a'; c.fillRect(-1.6, -1.2, 0.9, 0.9); c.fillRect(0.8, -1.2, 0.9, 0.9); c.strokeStyle = '#3a5a1a'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.6, 1.6); c.quadraticCurveTo(-0.8, 0.8, 0, 1.6); c.quadraticCurveTo(0.8, 2.4, 1.6, 1.6); c.stroke(); break;
        case 'sad': c.fillStyle = '#5aa0e8'; c.beginPath(); c.moveTo(0, -3.4); c.quadraticCurveTo(3, 0.6, 0, 2.8); c.quadraticCurveTo(-3, 0.6, 0, -3.4); c.fill(); break;
        case 'question': c.fillStyle = '#6a5acd'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('?', 0, 2.6); break;
        case 'happy': c.fillStyle = '#ffcc3a'; c.beginPath(); c.arc(0, 0, 3.3, 0, TAU); c.fill(); c.fillStyle = '#5a3a1a'; c.fillRect(-1.5, -1.3, 0.8, 0.9); c.fillRect(0.7, -1.3, 0.8, 0.9); c.strokeStyle = '#5a3a1a'; c.lineWidth = 0.6; c.beginPath(); c.arc(0, 0.2, 1.8, 0.3, Math.PI - 0.3); c.stroke(); break;
        case 'wood': c.fillStyle = '#8f6238'; c.save(); c.rotate(-0.3); c.fillRect(-3.4, -1.2, 6.8, 2.4); c.fillStyle = '#d6b27a'; c.beginPath(); c.ellipse(3.4, 0, 0.9, 1.2, 0, 0, TAU); c.fill(); c.restore(); break;
        case 'fish': c.fillStyle = '#4a8ac8'; c.beginPath(); c.ellipse(-0.5, 0, 2.8, 1.6, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(2, 0); c.lineTo(3.8, -1.6); c.lineTo(3.8, 1.6); c.fill(); c.fillStyle = '#fff'; c.fillRect(-2.2, -0.6, 0.7, 0.7); break;
        case 'angry': c.strokeStyle = '#d8323a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2.6, -1); c.quadraticCurveTo(-1, -1, -1, -2.6); c.moveTo(2.6, -1); c.quadraticCurveTo(1, -1, 1, -2.6); c.moveTo(-2.6, 1); c.quadraticCurveTo(-1, 1, -1, 2.6); c.moveTo(2.6, 1); c.quadraticCurveTo(1, 1, 1, 2.6); c.stroke(); break;
      }
      c.restore();
    });
  };

  // ------------------------------ glow sprites ------------------------------
  const GLOW_COL = { warm: [255, 150, 72], fire: [255, 140, 60], gold: [255, 214, 120], cool: [170, 200, 255], green: [150, 255, 150], pink: [255, 150, 200], red: [255, 90, 40], white: [255, 255, 255], purple: [190, 120, 255] };
  const glowCache = {};
  Art.glow = function (col) {
    if (glowCache[col]) return glowCache[col];
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const rgb = GLOW_COL[col] || G.hex2rgb(col);
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`);
    g.addColorStop(0.25, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`);
    g.addColorStop(0.6, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.18)`);
    g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    glowCache[col] = c; return c;
  };
  const puffCache = {};
  Art.puff = function () {
    if (puffCache.p) return puffCache.p;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    puffCache.p = c; return c;
  };
  Art.cloud = function (v, dark) {
    return Art.sprite('cloud' + v + (dark ? 'd' : ''), 90, 48, 45, 30, (c) => {
      const r = G.mulberry32(300 + v);
      const puffs = [];
      for (let k = 0; k < 11; k++) puffs.push([(r() - 0.5) * 58, (r() - 0.5) * 12 - 4, 9 + r() * 10]);
      puffs.sort((a, b) => a[1] - b[1]);
      const base = dark ? [92, 98, 112] : [250, 250, 252], shadow = dark ? [58, 62, 76] : [205, 214, 228];
      for (const [x, y, rr] of puffs) {
        const g = c.createRadialGradient(x, y + rr * 0.3, rr * 0.2, x, y + rr * 0.3, rr * 1.1);
        g.addColorStop(0, G.rgb(shadow, 0.95)); g.addColorStop(1, G.rgb(shadow, 0));
        c.fillStyle = g; c.beginPath(); c.arc(x, y + rr * 0.3, rr * 1.1, 0, TAU); c.fill();
      }
      for (const [x, y, rr] of puffs) {
        const g = c.createRadialGradient(x - rr * 0.3, y - rr * 0.35, rr * 0.1, x, y, rr);
        g.addColorStop(0, G.rgb(G.lerpColor(base, [255, 255, 255], 0.3), 1)); g.addColorStop(0.7, G.rgb(base, 0.9)); g.addColorStop(1, G.rgb(base, 0));
        c.fillStyle = g; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
      }
    });
  };

  // ------------------------------ villagers ------------------------------
  const CLOTH = {
    lenhador: '#3f7a3a', coletor: '#c9763a', agricultor: '#d4ac44', construtor: '#b5552f', mineiro: '#6f7280',
    cacador: '#7a4a2a', sacerdote: '#f2ecdc', anciao: '#8a6fa0', crianca: '#4fa0d8', bebe: '#f4efe3',
    pastor: '#8a7a5a', cavalarico: '#6a5a3a', acougueiro: '#b8a890', tecelao: '#3f6fb0', ferreiro: '#4a4440', ourives: '#6a3a7a',
    oleiro: '#9a6a4a', mercador: '#2a5a8a', feirante: '#5a8a3a', taverneiro: '#7a4a3a', escriba: '#e8e2d0', cobrador: '#6a2a2a', contrabandista: '#3a3440',
  };
  // aprons over the tunic, for the trades that get dirty
  const APRON = { acougueiro: '#f0ece2', ferreiro: '#6a4a30', oleiro: '#c8a078', taverneiro: '#e8e0cc', tecelao: null, feirante: '#e8d8a8' };
  // what each good looks like on someone's shoulder
  function carried(c, k, carry, t) {
    if (G.Riches && (G.Riches.is(k) || (k === 'food' && (carry.meat || carry.basket)))) return G.Riches.drawCarry(c, k, carry, t);
    switch (k) {
      case 'la': c.fillStyle = '#f2eee2'; for (const [x, y, r] of [[-1.6, -12, 1.8], [0.6, -12.4, 2], [2, -11.6, 1.5], [-0.4, -13.6, 1.6]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } c.fillStyle = 'rgba(0,0,0,0.08)'; c.beginPath(); c.arc(1, -11.4, 1.4, 0, TAU); c.fill(); return true;
      case 'tecido': for (let q = 0; q < 3; q++) { c.fillStyle = ['#c8483a', '#3f6fb0', '#e8b83a'][q]; c.fillRect(-2.8, -11 - q * 1.2, 5.6, 1.1); } return true;
      case 'couro': c.fillStyle = '#8a5a34'; c.beginPath(); c.moveTo(-3.4, -11); c.quadraticCurveTo(0, -14.4, 3.4, -11); c.lineTo(2.6, -9.8); c.lineTo(-2.6, -9.8); c.fill(); c.fillStyle = '#6a4428'; c.fillRect(-3.6, -10.8, 1, 1.4); return true;
      case 'minerio': case 'argila': { const col = k === 'minerio' ? '#7a5a4a' : '#a86a44'; c.fillStyle = '#8a7a5a'; c.beginPath(); c.moveTo(-2.8, -9.8); c.lineTo(2.8, -9.8); c.lineTo(2.2, -12.6); c.lineTo(-2.2, -12.6); c.fill(); c.fillStyle = col; for (const [x, y] of [[-1.2, -12.8], [0.4, -13.2], [1.6, -12.6], [-0.2, -13.9]]) { c.beginPath(); c.arc(x, y, 1.05, 0, TAU); c.fill(); } if (k === 'minerio') { c.fillStyle = '#b0583a'; c.fillRect(0.2, -13.6, 0.8, 0.5); } return true; }
      case 'ouro': c.fillStyle = '#6a5a3a'; c.beginPath(); c.ellipse(0, -11.2, 2.4, 1.8, 0, 0, TAU); c.fill(); c.fillStyle = '#f2c14e'; for (const [x, y] of [[-0.8, -12.4], [0.6, -12.8], [0, -13.4]]) { c.beginPath(); c.arc(x, y, 0.9, 0, TAU); c.fill(); } return true;
      case 'moedas': c.fillStyle = '#8a6a3a'; c.beginPath(); c.ellipse(0, -11.2, 2.2, 2, 0, 0, TAU); c.fill(); c.fillStyle = '#5a4428'; c.fillRect(-0.9, -13.4, 1.8, 0.7); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(0.9, -11.6, 0.6, 0, TAU); c.fill(); return true;
      case 'joias': c.fillStyle = '#6a3a2a'; c.fillRect(-1.8, -12.4, 3.6, 2.2); c.fillStyle = '#e8b83a'; c.fillRect(-1.8, -12.8, 3.6, 0.6); c.fillStyle = '#6ad0e8'; c.fillRect(-0.3, -12.1, 0.6, 0.6); return true;
      case 'ceramica': c.fillStyle = '#c8683a'; c.beginPath(); c.ellipse(-1.2, -12, 1.4, 1.8, 0, 0, TAU); c.ellipse(1.4, -12.2, 1.3, 1.7, 0, 0, TAU); c.fill(); c.fillStyle = '#8a4a2a'; c.fillRect(-1.8, -14, 1.2, 0.5); c.fillRect(0.8, -14.1, 1.2, 0.5); return true;
      case 'ferramentas': case 'armas': c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; for (let q = 0; q < 3; q++) { c.beginPath(); c.moveTo(-3.6 + q * 0.4, -10.6 + q * 0.3); c.lineTo(3.4 + q * 0.3, -12.6 - q * 0.4); c.stroke(); } c.fillStyle = '#b8bcc4'; if (k === 'armas') { for (let q = 0; q < 3; q++) { c.beginPath(); c.moveTo(3.4 + q * 0.3, -13.4 - q * 0.4); c.lineTo(5 + q * 0.3, -13.6 - q * 0.4); c.lineTo(3.6 + q * 0.3, -12.2 - q * 0.4); c.fill(); } } else { c.fillRect(3, -13.8, 1.6, 1.2); c.fillRect(-4.2, -11.4, 1.2, 1.6); } return true;
      case 'food': if (carry.hay) { c.fillStyle = '#d8b862'; c.beginPath(); c.ellipse(0, -12, 3.4, 1.8, 0, 0, TAU); c.fill(); c.strokeStyle = '#b8984a'; c.lineWidth = 0.35; for (let q = -2; q <= 2; q++) { c.beginPath(); c.moveTo(q * 1.2, -13.4); c.lineTo(q * 1.4 + 0.4, -10.8); c.stroke(); } return true; } return false;
    }
    void t; return false;
  }
  Art.CLOTH = CLOTH;
  function line(c, x0, y0, x1, y1) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  Art.clothOf = v => (v.captive ? '#8b8478' : v.age < 16 ? v.kidCloth : v.role === 'guerreiro' ? (v._fc || '#8a3a2a') : (CLOTH[v.role] || '#c9763a'));
  Art.villager = function (c, v, x, y, t, lod) {
    const S = G.S;
    const age = v.age;
    // a blow that just landed throws the body back for a moment
    const act = v.stagT && v.stagT > S.clock ? 'stagger' : v.act, at = v.actT;
    const sc = age < 2 ? 0.45 : age < 16 ? 0.55 + (age / 16) * 0.42 : 1;
    const levy = !!(v.unit && v.task && v.task.type === 'band' && age >= 16 && !v.captive);
    const warrior = (v.role === 'guerreiro' && age >= 16 && !v.captive) || levy;
    const mounted = v.unit === 'cavalaria' && !v.elite && levy && act !== 'sit';
    const cloth = v._cloth || (v.captive ? '#8b8478' : age < 16 ? v.kidCloth : warrior ? (v._fc || '#8a3a2a') : (CLOTH[v.role] || '#c9763a'));
    if (lod) { // far away: simple dots
      c.fillStyle = cloth; c.fillRect(x - 1.6 * sc, y - 7 * sc, 3.2 * sc, 5 * sc);
      c.fillStyle = v.skin; c.fillRect(x - 1.2 * sc, y - 9.5 * sc, 2.4 * sc, 2.4 * sc);
      return;
    }
    c.save();
    c.translate(x, y);
    // sleeping outside: lie down
    if (v.sleeping && !v.inside) {
      c.fillStyle = '#8a6a4a'; c.beginPath(); c.ellipse(0, 0, 6.5, 2.4, 0, 0, TAU); c.fill();
      c.fillStyle = cloth; c.beginPath(); c.ellipse(0.8, -0.8, 4.5, 1.7, 0, 0, TAU); c.fill();
      c.fillStyle = v.skin; c.beginPath(); c.arc(-4.2, -1.3, 1.7, 0, TAU); c.fill();
      c.fillStyle = v.age >= 62 ? '#d8d8d8' : v.hair; c.beginPath(); c.arc(-4.6, -1.8, 1.4, Math.PI * 0.8, Math.PI * 1.9); c.fill();
      c.restore(); return;
    }
    if (act === 'swim') {
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(0, 0, 4 + Math.sin(t * 6) * 0.6, 1.8, 0, 0, TAU); c.stroke();
      c.fillStyle = v.skin; c.beginPath(); c.arc(0, -2, 1.9, 0, TAU); c.fill();
      c.fillStyle = v.hair; c.beginPath(); c.arc(0, -2.6, 1.8, Math.PI, TAU); c.fill();
      c.strokeStyle = v.skin; c.lineWidth = 0.9; const s = Math.sin(t * 9) * 2; line(c, -1.5, -1, -3, -3 + s); line(c, 1.5, -1, 3, -3 - s);
      c.restore(); return;
    }
    c.scale(G.Render.sface(v) * sc, sc);
    // the drunk weave
    if (v.drunk > S.clock && G.Court) c.rotate(G.Court.sway(v));
    const moving = v.moving;
    const ph = v.walkPh;
    const dancing = act === 'dance';
    const bob = moving ? Math.abs(Math.sin(ph)) * 0.6 : dancing ? Math.abs(Math.sin(at * 7 + v.id)) * 1.6 : act === 'press' ? Math.abs(Math.sin(at * 8)) * 1.2 : 0;
    const hurt = v.hurt > 0;
    // a horse under the rider
    if (mounted) {
      const lg = moving ? Math.sin(ph * 0.8) * 1.4 : 0;
      c.strokeStyle = '#5a3a22'; c.lineWidth = 1.1;
      line(c, -3.2, -4.6, -3.2 + lg, 0); line(c, -2.2, -4.6, -2.2 - lg, 0); line(c, 2.6, -4.6, 2.6 - lg, 0); line(c, 3.6, -4.6, 3.6 + lg, 0);
      c.fillStyle = v.id % 3 === 0 ? '#3a2a20' : v.id % 3 === 1 ? '#8a5a34' : '#c8b8a0';
      c.beginPath(); c.ellipse(0.2, -6, 4.8, 2.2, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(3.4, -7); c.lineTo(5.6, -11); c.lineTo(7, -10.4); c.lineTo(4.8, -6); c.fill();
      c.beginPath(); c.ellipse(7, -10.8, 1.9, 1.05, 0.4, 0, TAU); c.fill();
      c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(3.8, -8); c.lineTo(5.4, -11.6); c.lineTo(4.2, -11); c.fill();
      c.strokeStyle = '#2a1a10'; c.lineWidth = 1; line(c, -4.6, -6.4, -6, -3.6);
      c.fillStyle = v._fc || '#8a3a2a'; c.fillRect(-2, -8.4, 4, 1.4);
      c.translate(0, -5.2);
    }
    // legs
    c.strokeStyle = '#3b2b20'; c.lineWidth = 1.15;
    if (mounted) { line(c, -0.5, -3.8, 1.4, -1.8); line(c, 1.4, -1.8, 1.2, 0.2); }
    else if (act === 'sit' || act === 'pottery' || act === 'sittalk' || act === 'story') { line(c, -0.8, -3.4, 2.4, -3.2); line(c, 2.4, -3.2, 2.6, -0.2); if (!(v.lost && v.lost.leg)) { line(c, 0.6, -3.4, 3.4, -3); line(c, 3.4, -3, 3.6, 0); } if (act === 'pottery' || act === 'story') { c.fillStyle = '#6a4a30'; c.fillRect(-2.2, -1.6, 3.2, 1.6); } }
    else if (act === 'listen') { line(c, -1.8, -0.9, 1.9, -0.3); line(c, 1.7, -1, -1.4, -0.2); }
    else if (act === 'milk' || act === 'skin') { line(c, -0.8, -2, 1.6, -1.6); line(c, 1.6, -1.6, 1.2, 0); line(c, 0.8, -2, 2.6, -1.2); line(c, 2.6, -1.2, 2.8, 0); c.fillStyle = '#6a4a30'; c.fillRect(-1.6, -1.4, 2.4, 1.4); }
    else {
      const run = act === 'run' ? 1.8 : 1.35;
      const leg = moving ? Math.sin(ph) * run : dancing ? Math.sin(at * 7 + v.id) * 1.3 : act === 'press' ? Math.sin(at * 8) * 1.1 : 0;
      if (v.lost && v.lost.leg) { line(c, 0.85, -3.8, 0.85 - leg * 0.5, -0.1); line(c, -0.85, -3.8, -1.1, -2.6); c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; line(c, 1.9, -8.4, 2.3 + leg * 0.4, 0); c.lineWidth = 1.15; }
      else { line(c, -0.85, -3.8, -0.85 + leg, -0.1); line(c, 0.85, -3.8, 0.85 - leg, -0.1); }
    }
    const bodyY = act === 'sit' || act === 'pottery' || act === 'sittalk' || act === 'story' ? 2.6 : act === 'listen' ? 3.4 : act === 'milk' || act === 'skin' ? 2 : act === 'sneak' ? 1 : 0;
    const lean = (act === 'plant' || act === 'harvest' || act === 'gather' || act === 'fill' || act === 'dig' || act === 'shear' || act === 'feed' || act === 'skin') ? 0.35 : act === 'pick' ? -0.12 : act === 'pottery' || act === 'milk' ? 0.28 : act === 'sneak' ? 0.25 : act === 'mourn' || act === 'butcher' || act === 'weave' ? 0.18 : act === 'write' ? 0.1 : act === 'stagger' ? -0.32 : act === 'drag' ? -0.2 : act === 'wait' ? Math.sin(t * 1.3 + v.id) * 0.05 : act === 'story' ? Math.max(0, Math.sin(at * 1.1 + v.id)) * 0.12 : 0;
    c.save();
    c.translate(0, bodyY - bob);
    if (lean) { c.translate(0, -3.8); c.rotate(lean); c.translate(0, 3.8); }
    // body / robe
    const robe = v.role === 'sacerdote' && age >= 16;
    c.fillStyle = hurt ? '#ff5a5a' : cloth;
    c.beginPath();
    if (v.g === 'f' || robe) { c.moveTo(-1.9, -8.8); c.lineTo(1.9, -8.8); c.lineTo(2.6, robe ? -1 : -3.2); c.lineTo(-2.6, robe ? -1 : -3.2); }
    else { c.moveTo(-2, -8.8); c.lineTo(2, -8.8); c.lineTo(2.1, -3.4); c.lineTo(-2.1, -3.4); }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0.6, -8.8, 1.4, 5.3);
    if (robe) { c.fillStyle = '#e8b64a'; c.fillRect(-2, -6.2, 4.2, 0.7); }
    if (v.captive) { c.fillStyle = 'rgba(60,40,20,0.7)'; c.fillRect(-2, -4.6, 4.1, 0.6); }
    else if (!robe) { c.fillStyle = warrior ? '#3a2a1a' : (v._fc || 'rgba(60,40,20,0.7)'); c.fillRect(-2.05, -4.9, 4.2, 0.95); }
    else if (v._fc) { c.fillStyle = v._fc; c.fillRect(-2.1, -7.4, 4.3, 0.7); }
    if (warrior) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-2, -8.8, 4, 1.1); }
    if (age >= 16 && !v.captive && APRON[v.role]) { c.fillStyle = APRON[v.role]; c.fillRect(0.3, -7.6, 1.9, 4.6); if (v.role === 'acougueiro') { c.fillStyle = 'rgba(170,40,30,0.55)'; c.fillRect(0.9, -5.6, 0.8, 0.9); c.fillRect(1.4, -4.2, 0.6, 0.6); } }
    if (age >= 16 && v.role === 'contrabandista' && !v.captive) { c.fillStyle = '#2a2430'; c.beginPath(); c.moveTo(-2.4, -9.4); c.lineTo(2.2, -9.4); c.lineTo(2.8, -2.2); c.lineTo(-2.9, -2.2); c.closePath(); c.fill(); }
    // arms & tools
    c.strokeStyle = v.skin; c.lineWidth = 1;
    const sh = [-0.2, -8]; // shoulder
    const tool = (ang, len, draw) => { c.save(); c.translate(sh[0], sh[1]); c.rotate(ang); c.strokeStyle = v.skin; line(c, 0, 0, 0, 3.4); c.translate(0, 3.4); draw && draw(); c.restore(); };
    const sw = Math.sin(at * 11);
    // a lost arm: the far arm is simply not there any more
    const oneArm = v.lost && (v.lost.armL || v.lost.armR);
    const arm = oneArm ? () => { } : line;
    switch (act) {
      case 'chop': tool(-2.2 + (sw > 0 ? sw : sw * 0.3) * 1.9, 3, () => { c.strokeStyle = '#7a5230'; c.lineWidth = 0.8; line(c, 0, 0, 0, 4); c.fillStyle = '#9aa0a8'; c.fillRect(-0.2, 3, 2.2, 1.6); }); break;
      case 'mine': tool(-2.4 + (sw > 0 ? sw : sw * 0.3) * 2, 3, () => { c.strokeStyle = '#7a5230'; c.lineWidth = 0.8; line(c, 0, 0, 0, 4.2); c.strokeStyle = '#8a8e96'; c.lineWidth = 0.9; c.beginPath(); c.arc(0, 4.4, 2.4, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }); break;
      case 'build': tool(-1.8 + Math.abs(Math.sin(at * 14)) * 1.4, 3, () => { c.strokeStyle = '#7a5230'; c.lineWidth = 0.7; line(c, 0, 0, 0, 3); c.fillStyle = '#6a6e76'; c.fillRect(-1.2, 2.6, 2.4, 1.2); }); break;
      case 'fight': { const j = Math.max(0, Math.sin(at * 7)); c.save(); c.translate(0, -7); c.rotate(1.35); c.strokeStyle = '#8a6a44'; c.lineWidth = 0.7; line(c, 0, -3 - j * 3, 0, 7 - j * 3); c.fillStyle = '#b8bcc4'; c.beginPath(); c.moveTo(-0.9, 7 - j * 3); c.lineTo(0, 9.2 - j * 3); c.lineTo(0.9, 7 - j * 3); c.fill(); c.restore(); c.strokeStyle = v.skin; line(c, 0, -8, 2.2 + j * 2, -6.8); break; }
      case 'pray': c.lineWidth = 1; arm(c, -1.6, -8, -2.6, -11.5); line(c, 1.6, -8, 2.6, -11.5); break;
      case 'run': { const s2 = Math.sin(ph * 1.3) * 1.5; arm(c, -1.6, -8, -3, -11 + s2); line(c, 1.6, -8, 3, -11 - s2); break; }
      case 'dance': { const s2 = Math.sin(at * 7 + v.id) * 2; arm(c, -1.6, -8, -3.2, -10.5 + s2); line(c, 1.6, -8, 3.2, -10.5 - s2); break; }
      case 'mourn': line(c, 0.2, -8, 0.9, -5); arm(c, -0.2, -8, 0.6, -5.2); break;
      case 'fish': {
        line(c, 0, -8, 2.2, -6.5);
        c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; line(c, 2.2, -6.5, 8, -12);
        c.strokeStyle = 'rgba(240,240,240,0.7)'; c.lineWidth = 0.3; const by = 3 + Math.sin(t * 3 + v.id) * 0.4; line(c, 8, -12, 11, by);
        c.fillStyle = '#e84a3a'; c.beginPath(); c.arc(11, by, 0.7, 0, TAU); c.fill();
        break;
      }
      case 'plant': case 'harvest': case 'gather': case 'fill': { const s3 = Math.sin(at * 6) * 0.8; line(c, 0, -8, 1.5 + s3, -4); arm(c, -0.5, -8, 0.6 - s3, -4.2); if (act === 'fill') { c.fillStyle = '#7a5a3a'; c.fillRect(0.6, -4.4, 2.2, 2); } break; }
      case 'throw': { const k = Math.min(1, at / 0.4); c.save(); c.translate(0, -8); c.rotate(-2.6 + k * 2.2); c.strokeStyle = v.skin; line(c, 0, 0, 0, 3.4); c.fillStyle = '#7a5a3a'; c.fillRect(-1.2, 3, 2.4, 2); c.restore(); break; }
      case 'beat': tool(-2.4 + Math.abs(Math.sin(at * 9)) * 2, 3, () => { c.strokeStyle = '#5a4a2a'; c.lineWidth = 0.9; line(c, 0, 0, 0, 5); c.fillStyle = '#4a7a3a'; c.beginPath(); c.ellipse(0, 5.4, 1.6, 1, 0, 0, TAU); c.fill(); }); break;
      case 'eat': line(c, 0, -8, 1.8, -8.6); c.fillStyle = '#c86a3a'; c.beginPath(); c.arc(2, -9, 0.9, 0, TAU); c.fill(); break;
      case 'story': { const a1 = Math.sin(at * 2.3 + v.id), a2 = Math.sin(at * 1.7 + 1 + v.id); line(c, 0, -8, 2.6 + a1 * 0.6, -10.4 - a1 * 2); arm(c, -0.4, -8, -2.4 - a2 * 0.6, -9 - a2 * 2.2); break; }
      case 'listen': { if (v.emo && (v.emo.k === 'fear' || v.emo.k === 'awe')) { line(c, 0, -8, 1.2, -10.4); arm(c, -0.4, -8, 0.8, -10.2); } else { line(c, 0, -8, 1.4, -5.4); arm(c, -0.4, -8, 1, -5.2); } break; }
      case 'hug': line(c, 0, -8, 2.8, -7.6); arm(c, -0.4, -8, 2.6, -6.6); break;
      case 'lift': line(c, 0, -8, 0.9, -13.2); arm(c, -0.4, -8, -0.1, -13.2); break;
      case 'joy': line(c, 0, -8, 2.2, -11.8); arm(c, -0.4, -8, -2.4, -11.6); break;
      case 'wait': line(c, 0.2, -8, 1.1, -5); arm(c, -0.3, -8, 0.9, -5.2); break;
      case 'drag': line(c, 0, -8, -2.8, -5.6); arm(c, -0.4, -8, -2.9, -6.2); break;
      case 'stagger': line(c, 0, -8, 2.8, -9.8); arm(c, -0.4, -8, -2.9, -9.2); break;
      case 'talk': case 'sittalk': { const g = Math.sin(at * 5) * 1; line(c, 0, -8, 2.4, -6 + g); arm(c, -0.5, -8, -1.2, -4.4); break; }
      case 'weave': { const s2 = Math.sin(at * 8) * 1.2; line(c, 0, -8, 2.6 + s2, -6.4); arm(c, -0.4, -8, 2.2 - s2, -6.9); c.fillStyle = '#c8a060'; c.fillRect(2.2 + s2, -6.9, 1.4, 0.6); break; }
      case 'forge': tool(-2.5 + Math.pow(Math.abs(Math.sin(at * 6)), 0.5) * 2.3, 3, () => { c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.8; line(c, 0, 0, 0, 3.6); c.fillStyle = '#3a3a40'; c.fillRect(-1.4, 3.2, 2.8, 1.6); }); arm(c, -0.4, -8, 2, -5.6); c.strokeStyle = '#4a4a50'; c.lineWidth = 0.5; line(c, 2, -5.6, 3.6, -5.2); break;
      case 'craft': { const s2 = Math.sin(at * 14) * 0.35; line(c, 0, -8, 1.9, -6.2 + s2); arm(c, -0.4, -8, 1.5, -6 - s2); c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(2.1, -6.1, 0.55, 0, TAU); c.fill(); break; }
      case 'pottery': { const s2 = Math.sin(at * 5) * 0.3; line(c, 0, -8, 2.4, -5 + s2); arm(c, -0.4, -8, 2.2, -4.6 - s2); c.fillStyle = '#8a6a44'; c.beginPath(); c.ellipse(3.2, -3.4, 2.4, 0.8, 0, 0, TAU); c.fill(); c.fillStyle = '#b8704a'; c.beginPath(); c.ellipse(3.2, -4.6, 1.2, 1.3 + Math.sin(at * 2) * 0.2, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(3.2 + Math.sin(at * 12) * 0.8, -5.4, 0.4, 1.4); break; }
      case 'dig': tool(-1.2 + Math.abs(Math.sin(at * 5)) * 1.6, 3, () => { c.strokeStyle = '#7a5230'; c.lineWidth = 0.8; line(c, 0, 0, 0, 5); c.fillStyle = '#8a8e96'; c.beginPath(); c.moveTo(-1.2, 5); c.lineTo(1.2, 5); c.lineTo(0.9, 7.2); c.lineTo(-0.9, 7.2); c.fill(); }); break;
      case 'shear': { const o = Math.abs(Math.sin(at * 9)) * 0.9; line(c, 0, -8, 2.4, -5.2); arm(c, -0.4, -8, 2.2, -4.6); c.strokeStyle = '#b8bcc4'; c.lineWidth = 0.5; line(c, 2.4, -5.2, 4.2, -5.4 - o); line(c, 2.4, -5.2, 4.2, -5 + o); break; }
      case 'milk': { const s2 = Math.sin(at * 8) * 0.6; line(c, 0, -8, 2.6, -4 + s2); arm(c, -0.4, -8, 2.3, -4.2 - s2); c.fillStyle = '#9a7a52'; c.fillRect(1.8, -2.6, 2, 2.2); c.fillStyle = '#f4f0e6'; c.fillRect(2, -2.6, 1.6, 0.6); break; }
      case 'groom': { const s2 = Math.sin(at * 6) * 1.4; line(c, 0, -8, 2.8, -8.4 + s2); c.fillStyle = '#6a4a30'; c.fillRect(2.4, -9 + s2, 1.4, 0.8); arm(c, -0.4, -8, 0.2, -4.6); break; }
      case 'skin': { // the knife along the belly, the other hand peeling the hide back
        const s2 = Math.abs(Math.sin(at * 5)); tool(-0.9 + s2 * 1.1, 3, () => { c.strokeStyle = '#5a3a22'; c.lineWidth = 0.7; line(c, 0, 0, 0, 1.4); c.fillStyle = '#c4c8d0'; c.beginPath(); c.moveTo(-0.4, 1.4); c.lineTo(0.4, 1.4); c.lineTo(0, 3.6); c.fill(); c.fillStyle = 'rgba(160,30,36,0.8)'; c.fillRect(-0.2, 2.6, 0.4, 0.8); });
        arm(c, -0.4, -8, 2.8 - s2 * 0.6, -4.6 + s2 * 0.5); break;
      }
      case 'pick': { // one hand up in the branches, the basket on the hip
        const s3 = Math.sin(at * 5) * 0.9; line(c, 0, -8, 1 + s3 * 0.5, -14.2 + Math.abs(s3) * 0.8); arm(c, -0.4, -8, -1.8, -5.4);
        const tr = v.task && v.task.type === 'pick' && G.S.trees.get(v.task.id); const fc = tr && G.Flora && G.Flora.KIND[tr.kind] ? G.Flora.KIND[tr.kind].col : '#d8302a';
        c.fillStyle = '#a07040'; c.beginPath(); c.moveTo(-4, -6); c.lineTo(-0.8, -6); c.lineTo(-1.3, -4.2); c.lineTo(-3.5, -4.2); c.fill();
        c.fillStyle = fc; c.beginPath(); c.arc(-3, -6.3, 0.6, 0, TAU); c.arc(-1.8, -6.4, 0.6, 0, TAU); c.fill();
        if (Math.sin(at * 5) > 0.7) { c.fillStyle = fc; c.beginPath(); c.arc(1.2, -14.4, 0.55, 0, TAU); c.fill(); }
        break;
      }
      case 'play': { // a lute in the arms, one hand strumming
        const s2 = Math.sin(at * 9) * 0.6; c.fillStyle = '#a8703a'; c.beginPath(); c.ellipse(1.4, -6.2, 1.9, 1.4, -0.5, 0, TAU); c.fill(); c.fillStyle = '#3a2416'; c.beginPath(); c.arc(1.5, -6.2, 0.45, 0, TAU); c.fill();
        c.strokeStyle = '#7a4a2a'; c.lineWidth = 0.6; line(c, 2.4, -7, 4.6, -9.4); c.strokeStyle = v.skin; c.lineWidth = 1; line(c, 0, -8, 1.4 + s2, -6.6); arm(c, -0.4, -8, 3.8, -8.6); break;
      }
      case 'press': { // treading the grapes: skirts held up, purple to the shins
        line(c, 0, -8, 2.2, -6.2); arm(c, -0.4, -8, -2, -6.4); c.fillStyle = 'rgba(110,20,60,0.75)'; c.fillRect(-1.6, -2.6, 3.2, 1.2); break;
      }
      case 'crank': { // leaning on the press beam
        const s2 = Math.sin(at * 2) * 0.8; line(c, 0, -8, 3 + s2, -7.4); arm(c, -0.4, -8, 2.6 + s2, -6.8); break;
      }
      case 'rake': { // the long salt rake drawn across the pan
        const s2 = Math.sin(at * 3) * 1.6; line(c, 0, -8, 1.6 + s2 * 0.4, -5.6); arm(c, -0.4, -8, 0.8 + s2 * 0.4, -6);
        c.strokeStyle = '#8a6a44'; c.lineWidth = 0.6; line(c, 1 + s2 * 0.4, -6.4, 5.6 + s2, 0.2); c.strokeStyle = '#6a4a2c'; c.lineWidth = 0.9; line(c, 4.6 + s2, 0.4, 6.8 + s2, -0.2);
        c.fillStyle = '#f4f4f0'; c.beginPath(); c.arc(6.2 + s2, 0.4, 0.8, 0, TAU); c.fill(); break;
      }
      case 'reel': { // turning the reel, the thread running from the basin of cocoons
        const a2 = at * 6; line(c, 0, -8, 2.2 + Math.cos(a2) * 0.7, -6.4 + Math.sin(a2) * 0.7); arm(c, -0.4, -8, 1.4, -5);
        c.strokeStyle = '#8a6a44'; c.lineWidth = 0.5; c.beginPath(); c.arc(3.2, -6.4, 1.4, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(250,245,230,0.9)'; c.lineWidth = 0.25; c.beginPath(); c.moveTo(3.2, -5); c.lineTo(4.4, -1.6); c.stroke();
        c.fillStyle = '#c8b088'; c.fillRect(3.4, -1.8, 2.4, 1.2); c.fillStyle = '#f8f4ea'; c.beginPath(); c.arc(4.6, -1.9, 0.5, 0, TAU); c.fill(); break;
      }
      case 'salt': { // rubbing salt into the fish
        const s2 = Math.sin(at * 7) * 0.8; line(c, 0, -8, 2.6 + s2, -5.4); arm(c, -0.4, -8, 2.2 - s2, -5.6);
        c.fillStyle = '#d8d0b8'; c.beginPath(); c.ellipse(3.2, -5, 2, 0.7, 0, 0, TAU); c.fill(); c.fillStyle = '#ffffff'; c.fillRect(2.6 + s2, -5.8, 0.6, 0.4); break;
      }
      case 'smoke': { // the smoking bundle held up to the comb, the face turned from the bees
        line(c, 0, -8, 2.3, -12.2); arm(c, -0.4, -8, 0.6, -10.6);
        c.fillStyle = '#6a4a2a'; c.fillRect(2, -14.4, 0.9, 2.6); c.fillStyle = '#e88a2a'; c.fillRect(2.1, -14.8, 0.7, 0.5);
        for (let q = 0; q < 3; q++) { const k = ((at * 0.8 + q / 3) % 1); c.fillStyle = 'rgba(225,225,220,' + (0.55 * (1 - k)) + ')'; c.beginPath(); c.arc(2.6 + k * 2.4 + Math.sin(at * 3 + q) * 0.5, -15.4 - k * 5, 0.8 + k * 1.6, 0, TAU); c.fill(); }
        break;
      }
      case 'butcher': tool(-2.3 + Math.abs(Math.sin(at * 7)) * 1.9, 3, () => { c.strokeStyle = '#5a3a22'; c.lineWidth = 0.8; line(c, 0, 0, 0, 2); c.fillStyle = '#c4c8d0'; c.fillRect(-0.4, 1.8, 2.4, 2.2); }); break;
      case 'call': line(c, 0, -8, 1.8, -10.4); arm(c, -0.4, -8, 1.5, -10); c.fillStyle = 'rgba(255,255,255,0.6)'; if (Math.sin(at * 4) > 0) { c.fillRect(3.2, -11.6, 0.5, 0.5); c.fillRect(4.2, -12.2, 0.5, 0.5); } break;
      case 'herd': line(c, 0, -8, 1.8, -6.2); arm(c, -0.4, -8, -0.8, -4.6); c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; line(c, 1.8, -2, 2.4, -14.5); c.beginPath(); c.arc(1.7, -14.5, 0.8, -0.2, Math.PI); c.stroke(); break;
      case 'feed': { const k = (at * 1.4) % 1; line(c, 0, -8, 1.6 + k * 1.6, -6.6 + k * 1.4); arm(c, -0.4, -8, 1.2 + k * 1.6, -6.2 + k * 1.4); c.fillStyle = '#d8b862'; for (let q = 0; q < 3; q++) c.fillRect(3 + k * 3 + q, -5 + k * 3 - q * 0.6, 0.8, 0.4); break; }
      case 'sweep': { const s2 = Math.sin(at * 6) * 1.2; line(c, 0, -8, 1.2, -5.2); arm(c, -0.4, -8, 0.6, -4); c.strokeStyle = '#8a6a44'; c.lineWidth = 0.6; line(c, 0.6, -6.4, 3 + s2, 0); c.strokeStyle = '#c8a860'; c.lineWidth = 1.2; line(c, 2.4 + s2, 0, 3.8 + s2, 0); break; }
      case 'sell': case 'buy': { const g = Math.sin(at * 4 + v.id) * 1.2; line(c, 0, -8, 2.5, act === 'sell' ? -9.8 + g : -6.8 + g * 0.3); arm(c, -0.4, -8, 1.6, -6); if (act === 'buy') { c.fillStyle = '#e8c24a'; c.beginPath(); c.arc(2.6, -6.6, 0.5, 0, TAU); c.fill(); } break; }
      case 'lurk': line(c, 0, -8, 1.4, -6.6); arm(c, -0.4, -8, 1.6, -6.4); line(c, 1.4, -6.6, -0.6, -6.2); break;
      case 'serve': line(c, 0, -8, 2.6, -8.4); arm(c, -0.4, -8, 2.2, -8.2); c.fillStyle = '#8a6a44'; c.fillRect(1.4, -8.9, 3.6, 0.5); c.fillStyle = '#c8a860'; c.fillRect(2, -10.2, 0.9, 1.3); c.fillRect(3.4, -10.2, 0.9, 1.3); break;
      case 'drink': line(c, 0, -8, 1.8, -10.4); c.fillStyle = '#a07040'; c.fillRect(1.4, -11.4, 1.2, 1.6); arm(c, -0.4, -8, -0.6, -4.6); break;
      case 'write': { arm(c, -0.4, -8, 1.6, -6.4); c.fillStyle = '#e8dcc0'; c.fillRect(1.2, -7.4, 2.6, 1.8); c.fillStyle = 'rgba(60,40,20,0.5)'; c.fillRect(1.5, -6.9, 1.8, 0.25); c.fillRect(1.5, -6.3, 1.4, 0.25); const s2 = Math.sin(at * 10) * 0.5; line(c, 0, -8, 2.4 + s2, -7.2); break; }
      case 'act': { const g = Math.sin(at * 3 + v.id) * 1.6; line(c, 0, -8, 2.6, -10.5 + g); arm(c, -0.4, -8, -2.4, -9.5 - g); break; }
      case 'climb': { const s2 = Math.sin(at * 6) * 1.4; c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; const g0 = (v.z || 0) / sc; line(c, 1.4, g0, 2.4, -15); line(c, 3.4, g0, 4.4, -15); for (let yy = g0 - 1.5; yy > -15; yy -= 2.2) { const f = (g0 - yy) / (g0 + 15); line(c, 1.4 + f, yy, 3.4 + f, yy); } c.strokeStyle = v.skin; c.lineWidth = 1; line(c, 0, -8, 2.2, -11 + s2); arm(c, -0.4, -8, 2, -10.4 - s2); break; }
      case 'knock': line(c, 0, -8, 2.5, -9 + Math.abs(Math.sin(at * 9)) * 0.9); arm(c, -0.4, -8, -0.4, -4.4); break;
      case 'sneak': line(c, 0, -8, 1.6, -5.4); arm(c, -0.4, -8, 1.2, -5); break;
      case 'guard': line(c, 0.3, -8, 0.4, -4.4); arm(c, -0.3, -8, -0.4, -4.4); if (warrior) G.Arch.arms(c, v); break;
      case 'drill': { const j = Math.max(0, Math.sin(at * 5)); c.save(); c.translate(0, -7); c.rotate(1.45); c.strokeStyle = '#8a6a44'; c.lineWidth = 0.7; line(c, 0, -3 - j * 3.5, 0, 7 - j * 3.5); c.fillStyle = '#b8bcc4'; c.beginPath(); c.moveTo(-0.9, 7 - j * 3.5); c.lineTo(0, 9.2 - j * 3.5); c.lineTo(0.9, 7 - j * 3.5); c.fill(); c.restore(); c.strokeStyle = v.skin; line(c, 0, -8, 2.2 + j * 2.4, -6.8); break; }
      case 'bound': { line(c, 0, -8, 1.6, -5.4); arm(c, -0.4, -8, 1.2, -5.2); c.strokeStyle = '#8a6a44'; c.lineWidth = 0.55; c.beginPath(); c.arc(1.4, -5.3, 0.8, 0, TAU); c.stroke(); line(c, 1.6, -4.6, 3.2 + Math.sin(t * 3 + v.id) * 0.6, -1.5); break; }
      default: {
        const sw2 = moving ? Math.sin(ph) * 1.1 : 0;
        if (v.carry && v.carry.jar) { line(c, 0.3, -8, 1.2, -12.4); arm(c, -0.3, -8, -0.3 - sw2, -4.4); }
        else if (v.carry && v.carry.k !== 'water') { line(c, 0, -8, 1.5, -10.2); arm(c, -0.5, -8, -1.2, -10); }
        else { line(c, 0.3, -8, 0.3 + sw2, -4.4); arm(c, -0.3, -8, -0.3 - sw2, -4.4); }
        if (v.captive && age >= 5) { c.strokeStyle = v.skin; line(c, 0, -8, 1.4, -5.6); arm(c, -0.4, -8, 1, -5.4); c.strokeStyle = '#8a6a44'; c.lineWidth = 0.5; c.beginPath(); c.arc(1.2, -5.4, 0.75, 0, TAU); c.stroke(); }
        if (levy && v.role !== 'guerreiro' && !v.carry) {
          // the levy: what the forge gave them — or a club
          if (v.unit === 'milicia') { c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.9; line(c, 1.6, -4.5, 2.6, -12.5); c.fillStyle = '#5a3a22'; c.beginPath(); c.ellipse(2.7, -12.8, 1, 1.5, 0.2, 0, TAU); c.fill(); }
          else if (v.unit === 'espadachim') { c.fillStyle = v._fc || '#8a3a2a'; c.beginPath(); c.ellipse(-2, -6.6, 2.2, 2.9, 0, 0, TAU); c.fill(); c.strokeStyle = '#6a5a4a'; c.lineWidth = 0.4; c.stroke(); c.strokeStyle = '#c4c8d0'; c.lineWidth = 0.8; line(c, 1.8, -6.5, 3.4, -11.6); c.strokeStyle = '#6a4a2a'; line(c, 1.4, -6.2, 2.6, -6.8); }
          else G.Arch.arms(c, v);
        } else if ((warrior || (v.role === 'arqueiro' && age >= 16 && !v.captive)) && !v.carry) G.Arch.arms(c, v);
        if (levy && v.task.general) G.Army && G.Army.drawStandard && G.Army.drawStandard(c, v, t);
        if (v.task && ((v.task.type === 'band' && v.task.flag) || v.task.type === 'envoy')) {
          const white = v.task.type === 'envoy';
          c.strokeStyle = '#6e4a2c'; c.lineWidth = 0.6; line(c, -1.6, -3, -1.6, -19);
          const fl = Math.sin(t * 6 + v.id) * 0.8;
          c.fillStyle = white ? '#f4f0e4' : (v._fc || '#c83a2a');
          c.beginPath(); c.moveTo(-1.6, -19); c.quadraticCurveTo(-4, -18.6 + fl, -6.6, -18.6 + fl * 1.3); c.lineTo(-6.6, -15 + fl * 1.3); c.quadraticCurveTo(-4, -15 + fl, -1.6, -15.4); c.closePath(); c.fill();
          if (!white) { c.fillStyle = 'rgba(255,245,220,0.85)'; c.beginPath(); c.arc(-4.1, -16.9 + fl, 0.9, 0, TAU); c.fill(); }
        }
        if (v.role === 'cacador' && age >= 16 && !v.carry) { c.strokeStyle = '#8a6a44'; c.lineWidth = 0.6; line(c, 1.6, -13, 1.6, -1); c.fillStyle = '#b8bcc4'; c.beginPath(); c.moveTo(0.9, -13); c.lineTo(1.6, -15.2); c.lineTo(2.3, -13); c.fill(); }
        if (v.role === 'anciao') { c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; line(c, 2.2, -6, 2.6, 0); }
        if ((v.role === 'pastor' || v.role === 'cavalarico') && age >= 16 && !v.carry) { c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.6; line(c, 1.8, -1, 2.3, -14); c.beginPath(); c.arc(1.6, -14, 0.75, -0.2, Math.PI); c.stroke(); }
        if (v.carry && v.carry.k === 'water' && !v.carry.jar) { c.fillStyle = '#7a5a3a'; c.fillRect(0.4 + sw2, -4.8, 2.2, 2.2); c.fillStyle = '#6ab8e8'; c.fillRect(0.6 + sw2, -4.8, 1.8, 0.6); }
      }
    }
    if (oneArm) { c.strokeStyle = v.skin; c.lineWidth = 1; line(c, -0.4, -8, -1, -6.9); c.fillStyle = '#ece4d4'; c.fillRect(-1.4, -7.4, 0.9, 0.9); if (v.lostT && G.S.clock - v.lostT < 40) { c.fillStyle = '#9a1e24'; c.fillRect(-1.25, -6.9, 0.55, 0.55); } }
    // carried goods
    if (v.carry && v.carry.k !== 'water' && !['chop', 'mine', 'build', 'fight', 'fish'].includes(act)) {
      const k = v.carry.k;
      if (v.carry.extra && G.Riches) G.Riches.drawExtra(c, v.carry.extra, v.carry, t);
      if (carried(c, k, v.carry, t)) { /* a good of the economy */ }
      else if (k === 'wood') { c.fillStyle = '#8f6238'; c.fillRect(-3.5, -12.2, 7, 1.5); c.fillRect(-3, -13.6, 6.5, 1.4); c.fillStyle = '#d6b27a'; c.fillRect(3.2, -12.2, 0.6, 1.5); }
      else if (k === 'stone') { c.fillStyle = '#9a958c'; c.beginPath(); c.ellipse(0, -12, 2.8, 1.8, 0, 0, TAU); c.fill(); c.fillStyle = '#c4bfb4'; c.beginPath(); c.ellipse(-0.8, -12.6, 1.2, 0.8, 0, 0, TAU); c.fill(); }
      else if (k === 'food') { c.fillStyle = '#a07040'; c.beginPath(); c.moveTo(-2.8, -12); c.lineTo(2.8, -12); c.lineTo(2.2, -9.8); c.lineTo(-2.2, -9.8); c.fill(); c.fillStyle = '#e04a3a'; c.beginPath(); c.arc(-1, -12.3, 0.9, 0, TAU); c.arc(0.8, -12.4, 0.9, 0, TAU); c.fill(); c.fillStyle = '#f0b040'; c.beginPath(); c.arc(0, -13, 0.8, 0, TAU); c.fill(); }
    }
    // head
    const hy = -10.6;
    if (v.headless) { c.fillStyle = '#8a1a1e'; c.beginPath(); c.ellipse(0, -8.9, 1.4, 0.7, 0, 0, TAU); c.fill(); c.fillStyle = '#e8dccc'; c.fillRect(-0.3, -9.4, 0.6, 0.6); } else {
    c.fillStyle = v.skin; c.beginPath(); c.arc(0, hy, 2.05, 0, TAU); c.fill();
    const hair = age >= 62 ? '#dcdcdc' : v.hair;
    c.fillStyle = hair;
    c.beginPath(); c.arc(-0.2, hy - 0.5, 2.1, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    if (v.g === 'f' && age >= 5) { c.beginPath(); c.moveTo(-2.1, hy - 0.4); c.quadraticCurveTo(-2.9, hy + 2.6, -1.4, hy + 3.4); c.lineTo(-0.9, hy + 0.2); c.fill(); }
    c.fillStyle = '#2a1c14'; c.fillRect(0.9, hy - 0.2, 0.55, 0.65);
    if (v.g === 'm' && age >= 25 && v.id % 3 === 0) { c.fillStyle = hair; c.beginPath(); c.arc(0.4, hy + 1.2, 1.5, 0.1, Math.PI - 0.3); c.fill(); }
    // a water jar on the head
    if (v.carry && v.carry.jar) { const jy = hy - 3.4; c.fillStyle = '#b8704a'; c.beginPath(); c.ellipse(0.4, jy, 1.9, 1.5, 0, 0, TAU); c.fill(); c.fillRect(-0.3, jy - 2.4, 1.4, 1.3); c.fillStyle = '#8a4a2a'; c.fillRect(-0.55, jy - 2.7, 1.9, 0.5); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-0.9, jy - 0.7, 0.6, 0.9); }
    // the theatre mask
    if (act === 'act') { c.fillStyle = v.id % 2 ? '#f4efe3' : '#e8b83a'; c.beginPath(); c.ellipse(0.9, hy, 2, 2.5, 0, 0, TAU); c.fill(); c.fillStyle = '#2a1c14'; c.fillRect(0.3, hy - 0.9, 0.6, 0.5); c.fillRect(1.5, hy - 0.9, 0.6, 0.5); c.strokeStyle = '#2a1c14'; c.lineWidth = 0.4; c.beginPath(); if (v.id % 2) c.arc(1.2, hy + 1.4, 0.8, Math.PI + 0.3, TAU - 0.3); else c.arc(1.2, hy + 0.6, 0.8, 0.3, Math.PI - 0.3); c.stroke(); }
    // role hats (rulers wear a crown instead)
    if (v._ruler && age >= 10 && G.Arch.crown(c, v, hy)) { /* the headgear of the culture */ }
    else if (v._ruler && age >= 10) {
      c.fillStyle = '#f2c14e';
      c.beginPath(); c.moveTo(-2.3, hy - 1.6); c.lineTo(-2.6, hy - 4.6); c.lineTo(-1.2, hy - 3.1); c.lineTo(0, hy - 5.4); c.lineTo(1.2, hy - 3.1); c.lineTo(2.6, hy - 4.6); c.lineTo(2.3, hy - 1.6); c.closePath(); c.fill();
      c.fillStyle = '#b8862a'; c.fillRect(-2.3, hy - 2.3, 4.6, 0.8);
      c.fillStyle = '#e8453c'; c.fillRect(-0.45, hy - 3.4, 0.9, 0.9);
    } else if (age >= 16) {
      if (v.role === 'agricultor') { c.fillStyle = '#e8cf7a'; c.beginPath(); c.ellipse(0, hy - 1.4, 3.6, 0.9, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, hy - 1.5, 1.7, Math.PI, TAU); c.fill(); c.fillStyle = '#b8903a'; c.fillRect(-1.6, hy - 1.8, 3.2, 0.4); }
      else if (v.role === 'cobrador') { // the taxman's tall dark cap, and the tally board under the arm
        c.fillStyle = '#2a1a1a'; c.fillRect(-1.7, hy - 4.4, 3.4, 2.6); c.fillRect(-2.2, hy - 2, 4.4, 0.7); c.fillStyle = '#a8322a'; c.fillRect(-1.7, hy - 2.6, 3.4, 0.5);
        if (v.task && (v.task.type === 'taxes' || v.task.type === 'tribute')) { c.fillStyle = '#c8a878'; c.fillRect(-3.2, -7.4, 1.4, 2.4); c.fillStyle = 'rgba(60,40,20,0.6)'; c.fillRect(-3, -6.8, 1, 0.2); c.fillRect(-3, -6.2, 1, 0.2); }
      }
      else if (v.role === 'construtor') { c.fillStyle = '#e8903a'; c.beginPath(); c.arc(0, hy - 1, 2.2, Math.PI, TAU); c.fill(); c.fillRect(0, hy - 1.2, 3, 0.6); }
      else if (v.role === 'mineiro') { c.fillStyle = '#5a5e68'; c.beginPath(); c.arc(0, hy - 1, 2.2, Math.PI, TAU); c.fill(); c.fillStyle = '#ffe28a'; c.fillRect(1.4, hy - 2.2, 0.8, 0.8); }
      else if (v.role === 'sacerdote') { c.fillStyle = '#f2ecdc'; c.beginPath(); c.arc(-0.3, hy - 0.3, 2.5, Math.PI * 0.9, Math.PI * 2.1); c.fill(); }
      else if (v.role === 'pastor') { c.fillStyle = '#c8a860'; c.beginPath(); c.ellipse(0, hy - 1.5, 3.4, 0.8, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, hy - 1.6, 1.6, Math.PI, TAU); c.fill(); }
      else if (v.role === 'ferreiro' || v.role === 'tecelao' || v.role === 'oleiro') { c.fillStyle = v.role === 'ferreiro' ? '#3a2a1a' : v.role === 'tecelao' ? '#c8483a' : '#8a5a3a'; c.fillRect(-2.1, hy - 1.6, 4.2, 0.8); }
      else if (v.role === 'escriba') { c.fillStyle = '#f4efe3'; c.beginPath(); c.arc(0, hy - 0.9, 2.2, Math.PI, TAU); c.fill(); }
      else if (v.role === 'mercador' || v.role === 'ourives') { c.fillStyle = v.role === 'ourives' ? '#e8b83a' : '#e8e2d0'; c.beginPath(); c.ellipse(0, hy - 1.6, 2.4, 1.3, 0, Math.PI, TAU); c.fill(); c.fillRect(-2.4, hy - 1.8, 4.8, 0.6); }
      else if (v.role === 'feirante' || v.role === 'taverneiro') { c.fillStyle = v.role === 'feirante' ? '#e8c24a' : '#8a3a2a'; c.beginPath(); c.arc(-0.2, hy - 0.6, 2.2, Math.PI * 0.95, Math.PI * 2.05); c.fill(); }
      else if (v.role === 'contrabandista') { c.fillStyle = '#2a2430'; c.beginPath(); c.arc(-0.3, hy - 0.2, 2.6, Math.PI * 0.75, Math.PI * 2.1); c.lineTo(1.6, hy + 2.4); c.lineTo(-2.6, hy + 2.6); c.fill(); }
      else if (v.role === 'cacador') { c.fillStyle = '#5a3a22'; c.beginPath(); c.arc(0, hy - 1, 2.1, Math.PI, TAU); c.fill(); c.strokeStyle = '#d84a3a'; c.lineWidth = 0.5; line(c, -1.2, hy - 2.6, -2.8, hy - 4.6); }
      else if ((warrior || v.role === 'arqueiro') && G.Arch.helmet(c, v, hy)) { /* culture's helmet */ }
      else if (warrior) { c.fillStyle = '#8a8e96'; c.beginPath(); c.arc(0, hy - 0.8, 2.35, Math.PI, TAU); c.fill(); c.fillRect(-2.35, hy - 0.9, 4.7, 0.7); c.fillStyle = v._fc || '#c83a2a'; c.fillRect(-0.4, hy - 4.2, 0.8, 1.6); }
    }
    }
    // baby on the back
    if (v.babyOn) { c.fillStyle = '#f4efe3'; c.beginPath(); c.ellipse(-2.6, -8, 1.5, 2, 0.3, 0, TAU); c.fill(); c.fillStyle = v.babyOn.skin; c.beginPath(); c.arc(-2.7, -9.8, 1.1, 0, TAU); c.fill(); }
    c.restore();
    // torch at night
    if (v.torch) {
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.7; line(c, 2.2, -6, 3, -12);
    }
    c.restore();
  };

  // ------------------------------ animals ------------------------------
  Art.animal = function (c, a, x, y, t) {
    c.save(); c.translate(x, y);
    const af = G.Render.sface(a);
    if (a.dead) { c.globalAlpha = Math.max(0.2, 1 - a.rot / (G.DAY_LEN * 0.8)); c.rotate(af * 0.1); c.scale(1, 0.55); }
    c.scale(af, 1);
    const ph = a.walkPh; const mv = a.moving && !a.dead;
    const hurt = a.hurt > 0;
    switch (a.kind) {
      case 'rabbit': {
        const hop = mv ? Math.abs(Math.sin(ph)) * 2.2 : 0;
        c.translate(0, -hop);
        c.fillStyle = hurt ? '#ff8080' : '#b89a7a'; c.beginPath(); c.ellipse(0, -2.2, 2.6, 1.9, 0, 0, TAU); c.fill();
        c.beginPath(); c.arc(2.2, -3.6, 1.4, 0, TAU); c.fill();
        c.fillStyle = '#9a7a5a'; c.beginPath(); c.ellipse(1.8, -6, 0.5, 1.6, -0.2, 0, TAU); c.ellipse(2.8, -5.8, 0.5, 1.6, 0.25, 0, TAU); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(-2.6, -2.4, 0.9, 0, TAU); c.fill();
        c.fillStyle = '#222'; c.fillRect(2.8, -4, 0.5, 0.5);
        break;
      }
      case 'deer': {
        const l = mv ? Math.sin(ph) * 1.2 : 0;
        c.strokeStyle = '#6a4a2e'; c.lineWidth = 0.8;
        line(c, -2.5, -4, -2.5 + l, 0); line(c, -1.5, -4, -1.5 - l, 0); line(c, 2.2, -4, 2.2 - l, 0); line(c, 3, -4, 3 + l, 0);
        c.fillStyle = hurt ? '#ff8a6a' : '#b07a48'; c.beginPath(); c.ellipse(0.3, -5, 4, 2, 0, 0, TAU); c.fill();
        c.fillStyle = '#e8d8c0'; c.beginPath(); c.ellipse(-3.6, -5.4, 0.9, 0.8, 0, 0, TAU); c.fill();
        c.fillStyle = '#b07a48'; c.beginPath(); c.moveTo(3, -6); c.lineTo(4.6, -9.5); c.lineTo(5.8, -9); c.lineTo(4.4, -5.4); c.fill();
        c.beginPath(); c.ellipse(5.6, -9.8, 1.6, 1, 0.3, 0, TAU); c.fill();
        c.fillStyle = '#222'; c.fillRect(5.8, -10.3, 0.5, 0.5);
        if (a.id % 2) { c.strokeStyle = '#d8c8a0'; c.lineWidth = 0.5; line(c, 5, -10.5, 4.2, -13); line(c, 4.6, -12, 3.6, -12.4); line(c, 5.6, -10.6, 6.4, -13); }
        break;
      }
      case 'boar': {
        const l = mv ? Math.sin(ph) * 1 : 0;
        c.strokeStyle = '#3a2a1e'; c.lineWidth = 0.9;
        line(c, -2.5, -2.6, -2.5 + l, 0); line(c, 2.2, -2.6, 2.2 - l, 0);
        c.fillStyle = hurt ? '#ff7060' : (a.angry > 0 ? '#6a3a2a' : '#5a4638'); c.beginPath(); c.ellipse(0, -3.8, 4.5, 2.7, 0, 0, TAU); c.fill();
        c.fillStyle = '#4a3a2e'; c.beginPath(); c.moveTo(-3, -6); c.lineTo(2, -6.6); c.lineTo(1, -5.4); c.fill();
        c.fillStyle = '#6a5446'; c.beginPath(); c.ellipse(4.4, -3.4, 1.8, 1.4, 0, 0, TAU); c.fill();
        c.fillStyle = '#e8e0d0'; c.beginPath(); c.moveTo(5.4, -3); c.lineTo(6.6, -4.4); c.lineTo(5.8, -2.6); c.fill();
        c.fillStyle = a.angry > 0 ? '#ff3a2a' : '#111'; c.fillRect(4.6, -4.4, 0.6, 0.6);
        break;
      }
      case 'wolf': {
        const l = mv ? Math.sin(ph) * 1.3 : 0;
        const bite = a.bite > 0 ? 1 : 0;
        c.strokeStyle = '#3e3e44'; c.lineWidth = 0.9;
        line(c, -2.6, -3.4, -2.6 + l, 0); line(c, -1.6, -3.4, -1.6 - l, 0); line(c, 2, -3.4, 2 - l, 0); line(c, 2.9, -3.4, 2.9 + l, 0);
        const fur = a.summoned ? '#3a3440' : '#7a7a82';
        c.fillStyle = hurt ? '#ff8080' : fur; c.beginPath(); c.ellipse(0, -4.4, 4, 1.9, 0, 0, TAU); c.fill();
        c.strokeStyle = fur; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-3.6, -4.6); c.quadraticCurveTo(-6, -4 - Math.sin(t * 4 + a.id) * 0.8, -6.8, -2.8); c.stroke();
        c.fillStyle = fur; c.save(); c.translate(3.6, -5.6 + bite); c.rotate(a.howl > 0 ? -0.8 : bite * 0.3);
        c.beginPath(); c.ellipse(0.8, 0, 1.9, 1.4, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(1.4, -0.4); c.lineTo(4, 0.4); c.lineTo(1.6, 1); c.fill();
        c.beginPath(); c.moveTo(-0.2, -1); c.lineTo(0.2, -3); c.lineTo(1, -1.2); c.fill();
        c.fillStyle = '#ffd24a'; c.fillRect(1.4, -0.6, 0.6, 0.5);
        c.restore();
        break;
      }
    }
    c.restore();
  };
  Art.boat = function (c, b, x, y, t) {
    c.save(); c.translate(x, y + Math.sin(t * 2) * 0.6); c.scale(G.Render.sface(b), 1);
    c.fillStyle = '#6e4a2c'; c.beginPath(); c.moveTo(-9, -2); c.lineTo(9, -2); c.lineTo(6, 2.5); c.lineTo(-7, 2.5); c.closePath(); c.fill();
    c.fillStyle = '#8f6238'; c.fillRect(-9, -2.8, 18, 1.2);
    c.strokeStyle = '#5a3a22'; c.lineWidth = 0.8; line(c, 0, -2, 0, -18);
    c.fillStyle = '#f4ecd8'; c.beginPath(); c.moveTo(0.6, -17); c.quadraticCurveTo(7, -11, 0.6, -4); c.closePath(); c.fill();
    if (b.st === 'arrive') { for (let k = 0; k < Math.min(4, b.people.length); k++) { c.fillStyle = ['#c9763a', '#3f7a3a', '#4fa0d8', '#d4ac44'][k]; c.fillRect(-6 + k * 3, -6, 2, 3.4); c.fillStyle = '#e6b48f'; c.beginPath(); c.arc(-5 + k * 3, -7, 1.1, 0, TAU); c.fill(); } }
    c.restore();
  };
})(window.G);
