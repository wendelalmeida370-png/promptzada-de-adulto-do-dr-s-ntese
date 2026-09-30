'use strict';
// ============================================================
//  Fauna art: a parametric quadruped for most mammals, and
//  hand-drawn shapes for elephants, giraffes, monkeys, snakes,
//  crocodiles, frogs, lizards, birds, waders and sea life.
// ============================================================
(function (G) {
  const Art = G.Art;
  const TAU = Math.PI * 2;
  const oldAnimal = Art.animal;
  function line(c, x0, y0, x1, y1) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  function ell(c, x, y, rx, ry, rot, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU); c.fill(); }
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const r = Math.min(255, ((n >> 16) & 255) * f), g = Math.min(255, ((n >> 8) & 255) * f), b = Math.min(255, (n & 255) * f); return `rgb(${r | 0},${g | 0},${b | 0})`; };

  // ---------------- generic quadruped ----------------
  function quad(c, a, sp, q, t) {
    const mv = a.moving && !a.dead; const ph = a.walkPh; const hurt = a.hurt > 0;
    const stout = q.stout || 0; const br = 1.5 + stout * 0.55 + (q.shag ? 0.5 : 0);
    const L = q.len, leg = q.leg; const by = -leg - br * 0.75;
    const col = hurt ? '#ff8a7a' : q.col, dark = shade(q.col, 0.72);
    const graze = a.eating > 0 && !sp.pred;
    // legs (far pair darker)
    const sw = mv ? Math.sin(ph) * 1.2 : 0;
    c.strokeStyle = dark; c.lineWidth = 0.9 + stout * 0.35;
    line(c, -L * 0.55, by + br * 0.4, -L * 0.55 + sw, 0); line(c, L * 0.5, by + br * 0.4, L * 0.5 - sw, 0);
    c.strokeStyle = shade(q.col, 0.85);
    line(c, -L * 0.4, by + br * 0.4, -L * 0.4 - sw, 0); line(c, L * 0.65, by + br * 0.4, L * 0.65 + sw, 0);
    // tail
    if (!q.noTail) {
      c.strokeStyle = q.tail === 'bushy' ? col : dark; c.lineWidth = q.tail === 'bushy' ? 1.8 : 0.7; c.lineCap = 'round';
      const tw = Math.sin(t * 3 + a.id) * 0.8;
      c.beginPath(); c.moveTo(-L * 0.95, by - br * 0.2);
      if (q.tail === 'long') c.quadraticCurveTo(-L * 1.4, by + 1, -L * 1.6 + tw, by - 1.8);
      else if (q.tail === 'bushy') c.quadraticCurveTo(-L * 1.35, by + 0.5 + tw, -L * 1.6, by + 1.4);
      else if (q.tail === 'curly') { c.arc(-L * 1.05, by - br * 0.2, 0.55, 0, TAU * 0.85); }
      else c.quadraticCurveTo(-L * 1.15, by + 0.6, -L * 1.2 + tw * 0.4, by + 2.4);
      c.stroke();
      if (q.tail === 'tuft') ell(c, -L * 1.2 + tw * 0.4, by + 2.8, 0.5, 0.8, 0, q.mane || dark);
      if (q.tail === 'bushy') ell(c, -L * 1.6, by + 1.4, 0.8, 0.6, 0, q.belly);
    }
    // body
    const slope = q.slope ? 0.25 : 0;
    ell(c, 0, by, L, br, -slope, col);
    ell(c, 0.2, by + br * 0.45, L * 0.8, br * 0.45, -slope, hurt ? col : q.belly);
    if (q.hump) { ell(c, -0.3, by - br * 0.9, L * 0.35, br * 0.75, 0, col); }
    // a fleece that grows back after shearing
    if (q.wool) { const full = !(a.shorn > 0); const r = full ? 1.05 + Math.min(1, a.wool || 0) * 0.25 : 0.55; c.fillStyle = hurt ? col : full ? q.col : shade(q.col, 0.92); for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * L * 0.36, by - br * 0.35 + (k % 2 ? 0.3 : -0.2), r * br * 0.62, 0, TAU); c.fill(); } }
    if (q.shag) { c.fillStyle = dark; c.beginPath(); c.moveTo(-L, by); c.lineTo(-L * 0.9, by + br * 1.2); c.lineTo(L * 0.9, by + br * 1.2); c.lineTo(L, by); c.fill(); }
    if (q.stripes) { c.strokeStyle = q.stripes; c.lineWidth = 0.55; for (let k = -3; k <= 3; k++) { const x = k * L * 0.26; c.beginPath(); c.moveTo(x - 0.3, by - br * 0.85); c.quadraticCurveTo(x + 0.4, by, x - 0.2, by + br * 0.85); c.stroke(); } }
    if (q.stripe) { c.strokeStyle = q.stripe; c.lineWidth = 0.6; line(c, -L * 0.8, by + br * 0.25, L * 0.8, by + br * 0.25); }
    if (q.spots) { c.fillStyle = q.spots; for (let k = 0; k < 7; k++) { const u = (G.hash(a.id * 7 + k) - 0.5) * L * 1.6, v = (G.hash(a.id * 11 + k) - 0.5) * br * 1.2; c.beginPath(); c.arc(u, by + v, 0.45, 0, TAU); c.fill(); } }
    if (q.rosettes) { c.strokeStyle = q.rosettes; c.lineWidth = 0.45; for (let k = 0; k < 7; k++) { const u = (G.hash(a.id * 7 + k) - 0.5) * L * 1.6, v = (G.hash(a.id * 11 + k) - 0.5) * br * 1.1; c.beginPath(); c.arc(u, by + v, 0.55, 0, TAU); c.stroke(); } }
    // neck & head
    const nk = q.neck;
    const hx = L * 0.85 + nk * 0.35 + (graze ? 0.6 : 0);
    const hy = graze ? -0.8 : by - br * 0.35 - nk * 0.85;
    c.strokeStyle = q.collar || col; c.lineWidth = 1.6 + stout * 0.5 + (nk < 1.5 ? 1 : 0); c.lineCap = 'round';
    line(c, L * 0.65, by - br * 0.3, hx - 0.4, hy + 0.4);
    if (q.mane && !q.lion) { c.strokeStyle = q.mane; c.lineWidth = 0.8; line(c, L * 0.6, by - br * 0.9, hx - 0.6, hy - 0.7); }
    const male = a.id % 2 === 0;
    if (q.lion && male && a.grown >= 1) ell(c, hx - 0.4, hy + 0.2, 2.5, 2.3, 0, q.mane);
    // head
    const hr = 1.1 + stout * 0.25;
    ell(c, hx, hy, hr * 1.25, hr, graze ? 0.5 : 0, q.face || col);
    if (q.snout === 1) { c.strokeStyle = col; c.lineWidth = 0.9; line(c, hx + hr, hy + 0.2, hx + hr + 1.3, hy + 1); }
    else if (q.snout === 2) ell(c, hx + hr * 0.9, hy + 0.3, hr * 0.9, hr * 0.75, 0, shade(q.col, 1.08));
    else ell(c, hx + hr * 0.95, hy + 0.3, hr * 0.55, hr * 0.42, 0, q.pred ? shade(q.col, 0.8) : shade(q.col, 0.9));
    // ears
    const er = q.ear === undefined ? 0.9 : q.ear;
    if (er > 0) { c.fillStyle = col; c.beginPath(); c.moveTo(hx - 0.5, hy - hr * 0.6); c.lineTo(hx - 0.7 - er * 0.2, hy - hr - er * 1.1); c.lineTo(hx + 0.2, hy - hr * 0.7); c.fill(); }
    // eye
    c.fillStyle = q.pred && G.isNight() ? '#ffd24a' : '#1a1410'; c.fillRect(hx + 0.35, hy - 0.4, 0.5, 0.5);
    // antlers & horns
    if (q.antler && male && a.grown >= 0.8) {
      c.strokeStyle = '#d8c8a0'; c.lineWidth = 0.5;
      const s = q.antler === 2 ? 1.5 : 1;
      line(c, hx - 0.3, hy - hr, hx - 1.2 * s, hy - hr - 2.6 * s); line(c, hx - 0.8 * s, hy - hr - 1.6 * s, hx - 2 * s, hy - hr - 1.9 * s);
      line(c, hx + 0.3, hy - hr, hx + 1 * s, hy - hr - 2.6 * s); line(c, hx + 0.8 * s, hy - hr - 1.7 * s, hx + 1.9 * s, hy - hr - 2 * s);
    }
    if (q.antler === 2 && !male && a.grown >= 0.8) { c.strokeStyle = '#d8c8a0'; c.lineWidth = 0.45; line(c, hx - 0.2, hy - hr, hx - 0.8, hy - hr - 1.8); line(c, hx + 0.2, hy - hr, hx + 0.7, hy - hr - 1.8); }
    if (q.horn === 'straight') { c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.45; line(c, hx - 0.3, hy - hr * 0.8, hx - 1.2, hy - hr - 2.4); line(c, hx + 0.1, hy - hr * 0.8, hx - 0.6, hy - hr - 2.4); }
    if (q.horn === 'cow') { c.strokeStyle = '#efe6d2'; c.lineWidth = 0.55; c.beginPath(); c.moveTo(hx - 0.5, hy - hr * 0.7); c.quadraticCurveTo(hx - 1.6, hy - hr - 0.6, hx - 1.1, hy - hr - 1.4); c.moveTo(hx + 0.2, hy - hr * 0.7); c.quadraticCurveTo(hx + 1.2, hy - hr - 0.6, hx + 0.8, hy - hr - 1.4); c.stroke(); }
    if (q.horn === 'curl') { c.strokeStyle = '#d8ccb0'; c.lineWidth = 0.9; c.beginPath(); c.arc(hx - 0.3, hy - 0.2, 1.4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  }

  // ---------------- specials ----------------
  function rabbit(c, a, sp, t) {
    const mv = a.moving && !a.dead; const hop = mv ? Math.abs(Math.sin(a.walkPh)) * 2.2 : 0;
    const [col, dark] = sp.col; c.translate(0, -hop);
    ell(c, 0, -2.2, 2.6, 1.9, 0, a.hurt > 0 ? '#ff8080' : col); ell(c, 2.2, -3.6, 1.4, 1.4, 0, col);
    c.fillStyle = dark; c.beginPath(); c.ellipse(1.8, -6, 0.5, 1.6, -0.2, 0, TAU); c.ellipse(2.8, -5.8, 0.5, 1.6, 0.25, 0, TAU); c.fill();
    ell(c, -2.6, -2.4, 0.9, 0.9, 0, '#fff'); c.fillStyle = '#222'; c.fillRect(2.8, -4, 0.5, 0.5);
  }
  function boar(c, a) {
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 1 : 0;
    c.strokeStyle = '#3a2a1e'; c.lineWidth = 0.9; line(c, -2.5, -2.6, -2.5 + l, 0); line(c, 2.2, -2.6, 2.2 - l, 0);
    ell(c, 0, -3.8, 4.5, 2.7, 0, a.hurt > 0 ? '#ff7060' : (a.angry > 0 ? '#6a3a2a' : '#5a4638'));
    c.fillStyle = '#4a3a2e'; c.beginPath(); c.moveTo(-3, -6); c.lineTo(2, -6.6); c.lineTo(1, -5.4); c.fill();
    ell(c, 4.4, -3.4, 1.8, 1.4, 0, '#6a5446');
    c.fillStyle = '#e8e0d0'; c.beginPath(); c.moveTo(5.4, -3); c.lineTo(6.6, -4.4); c.lineTo(5.8, -2.6); c.fill();
    c.fillStyle = a.angry > 0 ? '#ff3a2a' : '#111'; c.fillRect(4.6, -4.4, 0.6, 0.6);
  }
  function wolf(c, a, sp, t) {
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 1.3 : 0; const bite = a.bite > 0 ? 1 : 0;
    c.strokeStyle = '#3e3e44'; c.lineWidth = 0.9;
    line(c, -2.6, -3.4, -2.6 + l, 0); line(c, -1.6, -3.4, -1.6 - l, 0); line(c, 2, -3.4, 2 - l, 0); line(c, 2.9, -3.4, 2.9 + l, 0);
    const snowy = G.S.biome && G.Biome.cold(G.W.idx(a.x, a.y));
    const fur = a.summoned ? '#3a3440' : snowy ? '#c8ccd2' : '#7a7a82';
    ell(c, 0, -4.4, 4, 1.9, 0, a.hurt > 0 ? '#ff8080' : fur);
    c.strokeStyle = fur; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-3.6, -4.6); c.quadraticCurveTo(-6, -4 - Math.sin(t * 4 + a.id) * 0.8, -6.8, -2.8); c.stroke();
    c.fillStyle = fur; c.save(); c.translate(3.6, -5.6 + bite); c.rotate(a.howl > 0 ? -0.8 : bite * 0.3);
    c.beginPath(); c.ellipse(0.8, 0, 1.9, 1.4, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(1.4, -0.4); c.lineTo(4, 0.4); c.lineTo(1.6, 1); c.fill();
    c.beginPath(); c.moveTo(-0.2, -1); c.lineTo(0.2, -3); c.lineTo(1, -1.2); c.fill();
    c.fillStyle = '#ffd24a'; c.fillRect(1.4, -0.6, 0.6, 0.5); c.restore();
  }
  function monkey(c, a, sp, t) {
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 1 : 0; const [col, face] = sp.col;
    c.strokeStyle = col; c.lineWidth = 0.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.6, -3); c.bezierCurveTo(-4.5, -3, -4.8, -7.5, -2.6, -7.8); c.stroke();
    line(c, -1, -2.6, -1 + l, 0); line(c, 1, -2.6, 1 - l, 0); line(c, 1.2, -4.6, 2.6 - l, -1.4);
    ell(c, 0, -3.6, 1.8, 1.7, 0, a.hurt > 0 ? '#ff8a7a' : col); ell(c, 1.4, -6, 1.5, 1.4, 0, col); ell(c, 1.9, -5.8, 0.95, 0.9, 0, face);
    c.fillStyle = '#1a1410'; c.fillRect(2.1, -6.3, 0.4, 0.4);
  }
  function giraffe(c, a, sp, t) {
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 1.1 : 0; const col = a.hurt > 0 ? '#ff9a7a' : '#e0a848';
    const graze = a.eating > 0;
    c.strokeStyle = '#b07a30'; c.lineWidth = 0.8;
    line(c, -2.4, -6, -2.4 + l, 0); line(c, -1.6, -6, -1.6 - l, 0); line(c, 2, -6.5, 2 - l, 0); line(c, 2.8, -6.5, 2.8 + l, 0);
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.5; line(c, -3.4, -7.2, -4.6, -4.4);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -7.4, 3.6, 1.9, -0.18, 0, TAU); c.fill();
    const hx = graze ? 5.2 : 3.6, hy = graze ? -10 : -16;
    c.strokeStyle = col; c.lineWidth = 1.6; line(c, 2.2, -8, hx - 0.3, hy + 0.6);
    c.fillStyle = '#8a5424'; for (let k = 0; k < 6; k++) { const u = (G.hash(a.id * 3 + k) - 0.5) * 5.6, v = (G.hash(a.id * 5 + k) - 0.5) * 2.6; c.fillRect(u - 0.5, -7.4 + v - 0.4, 1, 0.8); }
    for (let k = 1; k < 4; k++) { const f = k / 4; c.fillRect(2.2 + (hx - 2.2) * f - 0.4, -8 + (hy + 0.6 + 8) * f - 0.4, 0.8, 0.8); }
    ell(c, hx + 0.3, hy, 1.4, 0.9, 0.2, col);
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.4; line(c, hx - 0.2, hy - 0.6, hx - 0.4, hy - 1.8); line(c, hx + 0.3, hy - 0.6, hx + 0.3, hy - 1.8);
    c.fillStyle = '#1a1410'; c.fillRect(hx + 0.5, hy - 0.4, 0.4, 0.4);
  }
  function elephant(c, a, sp, t) {
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 0.9 : 0; const col = a.hurt > 0 ? '#c88a8a' : '#8a8a90', dark = '#6a6a72';
    c.fillStyle = dark; c.fillRect(-3.4 + l, -3.4, 1.5, 3.4); c.fillRect(2.4 - l, -3.4, 1.5, 3.4);
    c.fillStyle = col; c.fillRect(-2.4 - l, -3.2, 1.5, 3.2); c.fillRect(3.2 + l, -3.2, 1.5, 3.2);
    ell(c, 0, -6, 5, 3.4, 0, col);
    c.strokeStyle = dark; c.lineWidth = 0.6; line(c, -5, -6, -5.8, -3.4);
    ell(c, 4.8, -7.2, 2.2, 2, 0, col);
    ell(c, 3.4, -7, 1.6, 2.2, 0, dark); // ear
    c.strokeStyle = col; c.lineWidth = 1.3; c.lineCap = 'round'; const sw = Math.sin(t * 1.5 + a.id) * 0.8;
    c.beginPath(); c.moveTo(6.6, -6.6); c.quadraticCurveTo(7.8, -3.6, 7 + sw, -1.2); c.stroke();
    if (a.id % 3 !== 0) { c.strokeStyle = '#f2ecd8'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(6.2, -5.8); c.quadraticCurveTo(7.4, -4.8, 7.8, -5.8); c.stroke(); }
    c.fillStyle = '#1a1410'; c.fillRect(5.6, -8, 0.5, 0.5);
  }
  function frog(c, a) {
    const mv = a.moving && !a.dead; const hop = mv ? Math.abs(Math.sin(a.walkPh)) * 1.6 : 0; c.translate(0, -hop);
    ell(c, 0, -1.1, 1.8, 1.1, 0, a.hurt > 0 ? '#ff8a7a' : '#5a9a3a'); ell(c, 0.2, -0.6, 1.4, 0.6, 0, '#c8d88a');
    ell(c, 0.8, -2, 0.55, 0.55, 0, '#5a9a3a'); ell(c, -0.4, -2, 0.55, 0.55, 0, '#5a9a3a');
    c.fillStyle = '#1a1410'; c.fillRect(0.7, -2.2, 0.35, 0.35); c.fillRect(-0.5, -2.2, 0.35, 0.35);
  }
  function lizard(c, a, sp, t) {
    const [col, light] = sp.col; const mv = a.moving && !a.dead; const w = mv ? Math.sin(a.walkPh) * 0.5 : 0;
    c.strokeStyle = col; c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.5, -0.8); c.quadraticCurveTo(-3.5, -0.6 + w, -5, 0); c.stroke();
    ell(c, 0, -0.9, 2, 0.8, 0, a.hurt > 0 ? '#ff8a7a' : col); ell(c, 2.2, -1, 0.9, 0.6, 0, light);
    c.lineWidth = 0.5; line(c, -1, -0.6, -1.6 + w, 0); line(c, 1, -0.6, 1.6 - w, 0);
  }
  function snake(c, a, sp, t) {
    const [col, belly] = sp.col; const mv = a.moving && !a.dead; const ph = mv ? a.walkPh : t * 0.6;
    c.strokeStyle = a.hurt > 0 ? '#ff8a7a' : col; c.lineWidth = 1.4 * (sp.size || 1); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-5, -0.4);
    for (let k = 1; k <= 10; k++) { const x = -5 + k; c.lineTo(x, -0.4 + Math.sin(ph * 1.5 + k * 0.9) * 0.9); }
    c.stroke();
    c.strokeStyle = belly; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-4, -0.2); for (let k = 1; k <= 8; k++) c.lineTo(-4 + k, -0.2 + Math.sin(ph * 1.5 + k * 0.9 + 0.9) * 0.9); c.stroke();
    ell(c, 5.4, -0.6 + Math.sin(ph * 1.5 + 9.9) * 0.9, 1, 0.7, 0, col);
    if (a.state === 'lunge' || a.bite > 0) { c.strokeStyle = '#d83a3a'; c.lineWidth = 0.3; line(c, 6.3, -0.6, 7.3, -0.9); }
  }
  function croc(c, a, sp, t) {
    const S = G.S; const inWater = S.type[G.W.idx(a.x, a.y)] <= G.T.RIVER;
    const col = a.hurt > 0 ? '#9a6a5a' : '#4a5a32', dark = '#2e3a20'; const open = a.bite > 0 || a.state === 'lunge' ? 1 : 0;
    if (inWater) { // only the back, the eyes and the snout break the surface
      ell(c, 0, 0.2, 6.5, 1.6, 0, 'rgba(20,40,40,0.35)');
      ell(c, -0.5, -0.2, 4.6, 0.8, 0, col); c.fillStyle = dark; for (let k = -3; k <= 3; k++) c.fillRect(k * 1.1 - 0.3, -1, 0.6, 0.5);
      ell(c, 4.6, -0.4, 1.6, 0.6, 0, col); ell(c, 3.4, -0.9, 0.5, 0.45, 0, col); c.fillStyle = '#e8d83a'; c.fillRect(3.3, -1.1, 0.3, 0.3);
      return;
    }
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 0.6 : 0;
    c.strokeStyle = dark; c.lineWidth = 0.8; line(c, -2, -0.8, -2.6 + l, 0); line(c, 2, -0.8, 2.6 - l, 0);
    c.fillStyle = col; c.beginPath(); c.moveTo(-3, -1.8); c.quadraticCurveTo(-6, -1.2, -8.5, -0.6); c.lineTo(-3, -0.4); c.fill();
    ell(c, 0, -1.3, 3.8, 1.2, 0, col);
    c.fillStyle = dark; for (let k = -3; k <= 3; k++) c.fillRect(k * 0.9 - 0.25, -2.6, 0.5, 0.6);
    c.save(); c.translate(3.4, -1.4); c.rotate(-open * 0.3); c.fillStyle = col; c.beginPath(); c.moveTo(0, -0.6); c.lineTo(4.2, -0.3); c.lineTo(4.2, 0.2); c.lineTo(0, 0.4); c.fill(); c.restore();
    c.save(); c.translate(3.4, -1.1); c.rotate(open * 0.25); c.fillStyle = shade('#4a5a32', 0.85); c.beginPath(); c.moveTo(0, 0); c.lineTo(4, 0.3); c.lineTo(4, 0.7); c.lineTo(0, 0.8); c.fill(); c.restore();
    c.fillStyle = '#e8d83a'; c.fillRect(3.6, -2.2, 0.35, 0.35);
  }
  function seaSurface(c, a, t, w) { c.strokeStyle = 'rgba(235,248,255,0.55)'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(0, 0.4, w + Math.sin(t * 3 + a.id) * 0.4, w * 0.3, 0, 0, TAU); c.stroke(); }
  function dolphin(c, a, sp, t) {
    const z = a.z || 0;
    if (z > 1) { // mid-leap: the whole body arcs over the waves
      c.save(); c.translate(0, -z); c.rotate(a.leap > 0.5 ? -0.5 : 0.5);
      ell(c, 0, 0, 4, 1.3, 0, '#7a8a9a'); ell(c, 0.4, 0.5, 3, 0.6, 0, '#d8e0e8');
      c.fillStyle = '#6a7a8a'; c.beginPath(); c.moveTo(-0.5, -1.2); c.lineTo(-1.8, -2.8); c.lineTo(-1.5, -1); c.fill();
      c.beginPath(); c.moveTo(-3.8, 0); c.lineTo(-5.2, -1.2); c.lineTo(-5.2, 1.2); c.fill(); c.restore(); return;
    }
    seaSurface(c, a, t, 3);
    c.fillStyle = '#6a7a8a'; c.beginPath(); c.moveTo(-0.6, 0); c.lineTo(0.4, -2.6); c.quadraticCurveTo(1, -1, 1.6, 0); c.fill();
    ell(c, 0.4, 0.1, 2.6, 0.45, 0, '#7a8a9a');
  }
  function shark(c, a, sp, t) {
    ell(c, 0, 0.6, 4.5, 1, 0, 'rgba(40,50,60,0.35)'); seaSurface(c, a, t, 2);
    c.fillStyle = a.hurt > 0 ? '#9a6a6a' : '#5a6470'; c.beginPath(); c.moveTo(-1, 0.1); c.lineTo(0.6, -3.4); c.quadraticCurveTo(0.9, -1.4, 1.8, 0.1); c.fill();
  }
  function orca(c, a, sp, t) {
    ell(c, 0, 0.6, 5.2, 1.2, 0, 'rgba(20,20,30,0.35)'); seaSurface(c, a, t, 3.2);
    ell(c, 0.4, 0, 3.4, 0.7, 0, '#1a1a22'); ell(c, 2.4, -0.2, 0.9, 0.35, 0, '#f2f2f2');
    c.fillStyle = '#1a1a22'; c.beginPath(); c.moveTo(-0.6, -0.3); c.lineTo(0, -4.6); c.lineTo(0.9, -0.3); c.fill();
  }
  function whale(c, a, sp, t) {
    const s = 1; ell(c, 0, 0.8, 9 * s, 2.4 * s, 0, 'rgba(20,30,50,0.35)'); seaSurface(c, a, t, 6);
    ell(c, 0, -0.2, 6.5, 1.3, 0, '#3e4a5e'); ell(c, 1, -0.6, 3, 0.5, 0, '#56647a');
    const tail = Math.sin(t * 0.8 + a.id) > 0.85;
    if (tail) { c.fillStyle = '#3e4a5e'; c.beginPath(); c.moveTo(-6.4, -0.4); c.lineTo(-8.6, -3.8); c.lineTo(-7.2, -2.4); c.lineTo(-5.8, -3.8); c.closePath(); c.fill(); }
    if (a.spout > 0) { c.strokeStyle = `rgba(235,245,255,${a.spout / 1.6})`; c.lineWidth = 1; line(c, 3.4, -1, 3.4, -6); line(c, 3.4, -5, 2, -7); line(c, 3.4, -5, 4.8, -7); }
  }
  function turtle(c, a, sp, t) {
    ell(c, 0, 0.4, 3, 1.1, 0, 'rgba(20,40,40,0.3)'); seaSurface(c, a, t, 2);
    ell(c, 0, -0.1, 2.2, 1, 0, '#6a7a3a'); c.strokeStyle = '#4a5a2a'; c.lineWidth = 0.3; line(c, -1.4, -0.1, 1.4, -0.1); line(c, 0, -0.9, 0, 0.7);
    ell(c, 2.6, -0.3, 0.7, 0.5, 0, '#8a9a5a');
  }
  function seal(c, a, sp, t) {
    const inWater = G.S.type[G.W.idx(a.x, a.y)] <= G.T.SEA;
    if (inWater) { seaSurface(c, a, t, 1.4); ell(c, 0.4, -0.6, 1.1, 1, 0, '#7a7a82'); c.fillStyle = '#1a1a1a'; c.fillRect(0.8, -1, 0.35, 0.35); return; }
    ell(c, 0, -1.2, 3.4, 1.3, 0.05, a.hurt > 0 ? '#c88a8a' : '#8a8a92'); ell(c, 0.2, -0.7, 2.6, 0.55, 0, '#b0b0b6');
    ell(c, 3, -1.9, 1.2, 1, 0, '#8a8a92'); c.fillStyle = '#1a1a1a'; c.fillRect(3.3, -2.2, 0.4, 0.4);
    c.fillStyle = '#7a7a82'; c.beginPath(); c.moveTo(-3.2, -1); c.lineTo(-4.6, -2); c.lineTo(-4.6, -0.2); c.fill();
  }
  function penguin(c, a, sp, t) {
    const inWater = G.S.type[G.W.idx(a.x, a.y)] <= G.T.SEA;
    if (inWater) { seaSurface(c, a, t, 1); ell(c, 0, -0.5, 1.4, 0.6, 0, '#22222a'); ell(c, 1.2, -0.8, 0.5, 0.45, 0, '#22222a'); return; }
    const w = a.moving ? Math.sin(a.walkPh * 1.4) * 0.25 : 0; c.rotate(w);
    ell(c, 0, -2.6, 1.4, 2.4, 0, '#22222a'); ell(c, 0.4, -2.4, 0.95, 1.9, 0, '#f4f4f0');
    ell(c, 0.1, -4.9, 0.9, 0.8, 0, '#22222a'); c.fillStyle = '#f2a23a'; c.beginPath(); c.moveTo(0.9, -4.9); c.lineTo(1.8, -4.6); c.lineTo(0.9, -4.5); c.fill();
    c.fillStyle = '#f2c23a'; c.fillRect(-0.4, -4.6, 0.6, 0.3);
  }
  function bird(c, a, sp, t) {
    const b = sp.b; const sc = b.span / 8;
    const flying = (a.z || 0) > 2;
    if (flying) {
      const f = Math.sin((a.flap || 0) * (a.kind === 'eagle' || a.kind === 'vulture' ? 0.45 : 1)) * (a.state === 'circle' || a.kind === 'vulture' ? 0.3 : 1);
      c.strokeStyle = b.wing; c.lineWidth = 1.3 * sc; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-b.span * 0.5, -f * 2.2 * sc); c.quadraticCurveTo(-b.span * 0.2, -1.4 * sc, 0, 0); c.quadraticCurveTo(b.span * 0.2, -1.4 * sc, b.span * 0.5, -f * 2.2 * sc); c.stroke();
      c.strokeStyle = b.tip; c.lineWidth = 1 * sc; line(c, -b.span * 0.5, -f * 2.2 * sc, -b.span * 0.42, -f * 1.9 * sc); line(c, b.span * 0.5, -f * 2.2 * sc, b.span * 0.42, -f * 1.9 * sc);
      ell(c, 0, 0, 1.3 * sc, 0.8 * sc, 0, b.col);
      if (b.head) ell(c, 1.1 * sc, -0.3 * sc, 0.6 * sc, 0.55 * sc, 0, b.head);
      return;
    }
    // perched / on the ground
    const bob = a.eating > 0 ? 0.6 : 0;
    c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.4; line(c, -0.3, -1, -0.4, 0); line(c, 0.3, -1, 0.4, 0);
    ell(c, 0, -2.2 * sc, 1.9 * sc, 1.2 * sc, -0.2, a.hurt > 0 ? '#ff8a7a' : b.col);
    ell(c, -0.4 * sc, -2.4 * sc, 1.4 * sc, 0.8 * sc, -0.2, b.wing);
    ell(c, 1.5 * sc, (-3.3 + bob) * sc, 0.8 * sc, 0.75 * sc, 0, b.head || b.col);
    c.fillStyle = b.beak; c.beginPath(); c.moveTo(2.1 * sc, (-3.4 + bob) * sc); c.lineTo(3.1 * sc, (-3.1 + bob) * sc); c.lineTo(2.1 * sc, (-3 + bob) * sc); c.fill();
    c.fillStyle = '#1a1410'; c.fillRect(1.6 * sc, (-3.6 + bob) * sc, 0.35, 0.35);
  }
  function wader(c, a, sp, t) {
    const b = sp.b; const flying = (a.z || 0) > 2;
    if (flying) { bird(c, a, sp, t); c.strokeStyle = b.leg; c.lineWidth = 0.4; line(c, -0.6, 0.2, -3, 0.8); return; }
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 0.7 : 0;
    const peck = a.eating > 0 || (Math.sin(t * 0.7 + a.id) > 0.8);
    c.strokeStyle = b.leg; c.lineWidth = 0.4; line(c, -0.2, -4, -0.2 + l, 0); line(c, 0.3, -4, 0.3 - l, 0);
    ell(c, 0, -4.8, 1.8, 1, -0.2, a.hurt > 0 ? '#ff8a7a' : b.col); ell(c, -0.4, -4.9, 1.3, 0.7, -0.2, b.wing);
    c.strokeStyle = b.col; c.lineWidth = 0.7; c.lineCap = 'round';
    const hx = peck ? 2.6 : 1.4, hy = peck ? -2.2 : -8;
    c.beginPath(); c.moveTo(1.2, -5.2); c.quadraticCurveTo(peck ? 2.4 : 0.2, peck ? -4.8 : -6.6, hx, hy); c.stroke();
    ell(c, hx, hy, 0.6, 0.5, 0, b.col);
    c.strokeStyle = b.beak; c.lineWidth = 0.45; line(c, hx + 0.4, hy, hx + (peck ? 1.2 : 2), hy + (peck ? 1.2 : 0.3));
    c.fillStyle = '#1a1410'; c.fillRect(hx + 0.1, hy - 0.3, 0.3, 0.3);
  }

  // the Aztec turkey: fan tail, red wattle, strutting
  function turkey(c, a, sp, t) {
    const mv = a.moving && !a.dead; const l = mv ? Math.sin(a.walkPh) * 0.8 : 0;
    const peck = a.eating > 0; const strut = !mv && !peck && Math.sin(t * 0.6 + a.id) > 0.6;
    c.strokeStyle = '#c87a4a'; c.lineWidth = 0.45; line(c, -0.3, -2.4, -0.3 + l, 0); line(c, 0.4, -2.4, 0.4 - l, 0);
    if (strut) { c.fillStyle = '#5a3a26'; c.beginPath(); c.arc(-1.8, -4.8, 3.2, Math.PI * 0.6, Math.PI * 1.55); c.lineTo(-1.8, -4.8); c.fill(); c.strokeStyle = '#e8d8b0'; c.lineWidth = 0.35; c.beginPath(); c.arc(-1.8, -4.8, 3, Math.PI * 0.6, Math.PI * 1.55); c.stroke(); }
    else { c.fillStyle = '#4a3222'; c.beginPath(); c.moveTo(-1.4, -3.8); c.lineTo(-3.6, -5.4); c.lineTo(-3.2, -3); c.fill(); }
    ell(c, 0, -3.6, 2, 1.5, 0, a.hurt > 0 ? '#ff8a7a' : '#3e2a1e');
    ell(c, -0.3, -3.8, 1.3, 0.9, 0, '#5a4030');
    const hx = peck ? 2.2 : 1.7, hy = peck ? -1.6 : -6.2;
    c.strokeStyle = '#6a4a3a'; c.lineWidth = 0.7; line(c, 1.2, -4.4, hx - 0.2, hy + 0.5);
    ell(c, hx, hy, 0.6, 0.55, 0, '#8ab0c8');
    c.fillStyle = '#d8342a'; c.beginPath(); c.ellipse(hx + 0.4, hy + 0.7, 0.3, 0.7, 0, 0, TAU); c.fill();
    c.fillStyle = '#e8c070'; c.beginPath(); c.moveTo(hx + 0.5, hy - 0.1); c.lineTo(hx + 1.2, hy + 0.1); c.lineTo(hx + 0.5, hy + 0.3); c.fill();
  }
  // ---------------- town animals ----------------
  const DOG = [['#8a5a34', '#c8a070'], ['#2a2420', '#5a4a40'], ['#e8e0d0', '#8a6a4a'], ['#c89a4a', '#e8c890'], ['#6a6a70', '#b8b8c0']];
  const CAT = [['#d8843a', '#f0b878'], ['#6a6a72', '#9a9aa2'], ['#1e1c20', '#3a3640'], ['#f0ece4', '#d8c8b0'], ['#8a6a4a', '#c8a878']];
  function dog(c, a, sp, t) {
    const [col, lite] = DOG[(a.coat || 0) % DOG.length]; const mv = a.moving && !a.dead;
    const lie = !mv && (a.pose === 'lie' || a.pose === 'sleep');
    const wag = Math.sin(t * (a.happy > 0 ? 18 : 6) + a.id) * (a.happy > 0 ? 1.4 : 0.6);
    if (lie) {
      ell(c, 0, -1.8, 3.8, 1.5, 0, col); ell(c, 3.2, -2.4 - (a.pose === 'sleep' ? 0 : 0.8), 1.5, 1.2, 0, col);
      ell(c, 4.3, -2.1 - (a.pose === 'sleep' ? 0 : 0.8), 0.9, 0.6, 0, lite); c.fillStyle = col; c.beginPath(); c.moveTo(2.6, -3.2); c.lineTo(3, -4.6); c.lineTo(3.6, -3.2); c.fill();
      c.strokeStyle = col; c.lineWidth = 1; line(c, -3.6, -1.8, -5.2, -1.2 + wag * 0.3);
      if (a.pose === 'sleep') { c.fillStyle = 'rgba(90,120,200,0.7)'; c.font = 'bold 3px sans-serif'; c.fillText('z', 4.5, -5 - (t * 2 % 2)); }
      return;
    }
    const l = mv ? Math.sin(a.walkPh) * 1.2 : 0;
    c.strokeStyle = shade(col, 0.8); c.lineWidth = 0.8;
    line(c, -2.2, -2.8, -2.2 + l, 0); line(c, -1.4, -2.8, -1.4 - l, 0); line(c, 1.8, -2.8, 1.8 - l, 0); line(c, 2.5, -2.8, 2.5 + l, 0);
    ell(c, 0, -3.6, 3.3, 1.6, 0, a.hurt > 0 ? '#ff8a7a' : col); ell(c, 0.4, -3, 2.4, 0.8, 0, lite);
    c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, -4); c.quadraticCurveTo(-4.2, -5.6 + wag * 0.3, -4.6 + wag, -6.2); c.stroke();
    const bark = a.bark > 0 ? 1 : 0;
    c.save(); c.translate(3, -5); c.rotate(-0.25 - bark * 0.2);
    ell(c, 0.6, 0, 1.6, 1.25, 0, col); ell(c, 2, 0.4 + bark * 0.3, 0.95, 0.6 - bark * 0.1, 0, lite);
    c.fillStyle = shade(col, 0.7); c.beginPath(); c.moveTo(-0.4, -0.6); c.lineTo(-0.2, -2.4); c.lineTo(0.6, -0.8); c.fill();
    c.fillStyle = '#1a1410'; c.fillRect(1, -0.5, 0.45, 0.45); c.fillRect(2.8, 0.1, 0.5, 0.45);
    if (bark) { c.fillStyle = '#8a2a2a'; c.fillRect(1.8, 0.9, 1.1, 0.5); }
    c.restore();
    if (bark) { c.strokeStyle = 'rgba(40,30,20,0.7)'; c.lineWidth = 0.4; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(5.4, -4.6, 1 + k * 0.9, -0.7, 0.7); c.stroke(); } }
  }
  function cat(c, a, sp, t) {
    const [col, lite] = CAT[(a.coat || 0) % CAT.length]; const mv = a.moving && !a.dead;
    const tw = Math.sin(t * 2.5 + a.id) * 0.6;
    if (!mv && (a.pose === 'sit' || a.pose === 'sleep')) {
      if (a.pose === 'sleep') { ell(c, 0, -1.3, 2.4, 1.2, 0, col); ell(c, 1.6, -1.6, 1.1, 0.9, 0, col); c.strokeStyle = col; c.lineWidth = 0.7; c.beginPath(); c.arc(0, -1.2, 2.5, 0.2, 2.2); c.stroke(); return; }
      ell(c, 0, -2.4, 1.5, 2.1, 0, col); ell(c, 0.4, -2, 0.8, 1.3, 0, lite);
      ell(c, 0.5, -5, 1.25, 1.1, 0, col);
      c.fillStyle = col; c.beginPath(); c.moveTo(-0.4, -5.6); c.lineTo(-0.3, -7); c.lineTo(0.4, -5.9); c.fill(); c.beginPath(); c.moveTo(0.8, -5.9); c.lineTo(1.5, -7); c.lineTo(1.6, -5.5); c.fill();
      c.fillStyle = '#d8e070'; c.fillRect(0.6, -5.2, 0.35, 0.35); c.fillRect(1.25, -5.2, 0.35, 0.35);
      c.strokeStyle = col; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-1.2, -0.6); c.quadraticCurveTo(-3.2, -0.2, -2.8 + tw, -2.4); c.stroke();
      return;
    }
    const l = mv ? Math.sin(a.walkPh) * 1 : 0;
    c.strokeStyle = shade(col, 0.8); c.lineWidth = 0.6;
    line(c, -1.6, -2.2, -1.6 + l, 0); line(c, -1, -2.2, -1 - l, 0); line(c, 1.4, -2.2, 1.4 - l, 0); line(c, 1.9, -2.2, 1.9 + l, 0);
    ell(c, 0, -2.8, 2.5, 1.05, 0, a.hurt > 0 ? '#ff8a7a' : col);
    ell(c, 2.6, -3.6, 1.1, 1, 0, col); c.fillStyle = col; c.beginPath(); c.moveTo(2, -4.2); c.lineTo(2.1, -5.4); c.lineTo(2.7, -4.4); c.fill(); c.beginPath(); c.moveTo(3, -4.4); c.lineTo(3.5, -5.4); c.lineTo(3.6, -4); c.fill();
    c.fillStyle = '#d8e070'; c.fillRect(3.1, -3.9, 0.35, 0.35);
    c.strokeStyle = col; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-2.3, -3); c.quadraticCurveTo(-3.6, -4, -3.2 + tw, -5.8); c.stroke();
  }
  function hen(c, a, sp, t) {
    const white = (a.coat || 0) % 3 === 0; const col = white ? '#f2eee4' : (a.coat || 0) % 3 === 1 ? '#b8683a' : '#6a4a32';
    const mv = a.moving && !a.dead; const peck = !mv && a.pose === 'peck' ? Math.max(0, Math.sin(t * 9 + a.id)) : 0;
    const rooster = a.rooster;
    c.strokeStyle = '#d8a030'; c.lineWidth = 0.45; const l = mv ? Math.sin(a.walkPh * 1.4) * 0.6 : 0;
    line(c, -0.3, -1.2, -0.3 + l, 0); line(c, 0.4, -1.2, 0.4 - l, 0);
    if (a.pose === 'sleep') { ell(c, 0, -1.2, 1.8, 1.2, 0, col); ell(c, 1.2, -2, 0.7, 0.6, 0, col); c.fillStyle = '#d8302a'; c.fillRect(1, -2.8, 0.7, 0.4); return; }
    if (rooster) { c.fillStyle = '#2a4a3a'; c.beginPath(); c.moveTo(-1.4, -2.4); c.quadraticCurveTo(-3.4, -4.4, -2.4, -1.4); c.fill(); c.fillStyle = '#b84a2a'; c.beginPath(); c.moveTo(-1.2, -2.2); c.quadraticCurveTo(-2.8, -3.6, -2.2, -1.2); c.fill(); }
    ell(c, 0, -2, 1.8, 1.25, 0, a.hurt > 0 ? '#ff8a7a' : col);
    c.fillStyle = col; c.beginPath(); c.moveTo(-1.4, -2.4); c.lineTo(-2.4, -3.4); c.lineTo(-1.6, -1.6); c.fill();
    const hx = 1.4 + peck * 0.6, hy = -3.3 + peck * 2;
    ell(c, hx, hy, 0.75, 0.75, 0, col);
    c.fillStyle = '#d8302a'; c.fillRect(hx - 0.4, hy - (rooster ? 1.4 : 1), 0.8, rooster ? 0.7 : 0.45); c.fillRect(hx + 0.2, hy + 0.5, 0.35, 0.5);
    c.fillStyle = '#e8a030'; c.beginPath(); c.moveTo(hx + 0.6, hy - 0.1); c.lineTo(hx + 1.3, hy + 0.2); c.lineTo(hx + 0.6, hy + 0.35); c.fill();
    c.fillStyle = '#1a1410'; c.fillRect(hx + 0.1, hy - 0.3, 0.3, 0.3);
  }
  function pigeon(c, a, sp, t) {
    const col = (a.coat || 0) % 4 === 0 ? '#e8e4dc' : (a.coat || 0) % 4 === 1 ? '#6a6660' : '#8a8a94';
    const fly = a.z > 0.5;
    if (fly) {
      const fl = Math.sin(t * 22 + a.id) * 1.8;
      ell(c, 0, -1.5, 1.5, 0.8, 0, col);
      c.fillStyle = shade(col, 0.85); c.beginPath(); c.moveTo(-0.4, -1.6); c.lineTo(-2.6, -2.6 - fl); c.lineTo(0.4, -1.4); c.fill(); c.beginPath(); c.moveTo(-0.2, -1.4); c.lineTo(1.8, -3 - fl); c.lineTo(0.6, -1.3); c.fill();
      ell(c, 1.4, -1.9, 0.55, 0.5, 0, col);
      return;
    }
    const mv = a.moving; const bob = mv ? Math.sin(a.walkPh * 2) * 0.35 : a.pose === 'peck' ? Math.max(0, Math.sin(t * 8 + a.id)) * 0.9 : 0;
    c.strokeStyle = '#c86a5a'; c.lineWidth = 0.35; line(c, -0.2, -0.8, -0.2, 0); line(c, 0.3, -0.8, 0.3, 0);
    ell(c, 0, -1.4, 1.35, 0.85, 0, col); ell(c, -0.2, -1.4, 0.9, 0.55, 0, shade(col, 0.88));
    c.fillStyle = col; c.beginPath(); c.moveTo(-1.1, -1.5); c.lineTo(-2.1, -1.8); c.lineTo(-1.1, -1.1); c.fill();
    ell(c, 1.2 + bob * 0.3, -2.3 + bob, 0.55, 0.5, 0, (a.coat || 0) % 4 === 0 ? col : '#5a6a70');
    c.fillStyle = '#6a9a8a'; c.fillRect(0.7 + bob * 0.2, -1.95 + bob * 0.6, 0.6, 0.3);
    c.fillStyle = '#2a2a2a'; c.fillRect(1.6 + bob * 0.3, -2.4 + bob, 0.45, 0.2);
  }
  const DRAW = { rabbit, boar, wolf, monkey, giraffe, elephant, frog, lizard, snake, croc, dolphin, shark, orca, whale, turtle, seal, penguin, bird, wader, turkey, dog, cat, hen, pigeon };
  Art.animal = function (c, a, x, y, t, lod) {
    const sp = G.Animals.DEF[a.kind]; if (!sp) return oldAnimal && oldAnimal(c, a, x, y, t);
    c.save(); c.translate(x, y);
    const sc = (sp.size || 1) * (0.55 + 0.45 * (a.grown === undefined ? 1 : a.grown));
    if (a.dead) {
      if (sp.cls === 'water' || a.sink) { c.globalAlpha = Math.max(0.1, 1 - a.rot / 10); }
      else { c.globalAlpha = Math.max(0.25, 1 - a.rot / (G.DAY_LEN * 1.1)); c.rotate(a.face * 0.1); c.scale(1, 0.55); if (a.meat <= 0) { c.fillStyle = '#e8e0d0'; c.fillRect(-3 * sc, -1, 6 * sc, 0.8); c.fillRect(-1, -1.6, 0.6, 1.8); c.restore(); return; } }
    }
    if (lod) { // far away: a dab of colour is enough
      const col = sp.q ? sp.q.col : sp.col ? sp.col[0] : sp.b ? sp.b.col : '#7a7a82';
      c.fillStyle = col; c.fillRect(-1.5 * sc, -2.5 * sc, 3 * sc, 2 * sc); c.restore(); return;
    }
    c.scale(a.face * sc, sc);
    if (sp.art === 'quad') quad(c, a, sp, sp.q, t);
    else if (DRAW[sp.art]) DRAW[sp.art](c, a, sp, t);
    c.restore();
  };
  // birds high in the sky are drawn above everything, with a shadow on the ground
  G.Animals.drawAir = function (ctx, proj, t, view, zoom) {
    const S = G.S; if (!S) return;
    for (const a of S.animals.values()) {
      if (a.dead || a.held || !(a.z > 4) || G.Animals.DEF[a.kind].cls !== 'air') continue;
      const gh = G.W.groundH(a.x, a.y); const p = proj(a.x, a.y, gh);
      if (p[0] < view[0] - 20 || p[0] > view[2] + 20 || p[1] < view[1] - 90 || p[1] > view[3] + 20) continue;
      ctx.fillStyle = 'rgba(20,30,20,0.16)'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 2.6, 1.1, 0, 0, TAU); ctx.fill();
      Art.animal(ctx, a, p[0], p[1] - a.z, t, zoom < 0.7);
    }
  };
})(window.G);
