'use strict';
// ============================================================
//  Cave art: the things of the dark, drawn small and warm for
//  the torchlight — stalagmites and columns, crystals, glow-worm
//  threads, pale mushrooms, bones and fossils; the paintings the
//  people leave on the walls; tombs in the manner of each people;
//  the oracle's tripod over its crack in the rock; the outlaws'
//  camp; the spiders, crickets, blind fish and salamanders; bats
//  asleep and bats in flight; and the cave's mouth on the hill.
// ============================================================
(function (G) {
  const A = G.CaveArt = {};
  const TAU = Math.PI * 2;
  const H = n => G.hash(n);
  const ell = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); c.fill(); };
  const line = (c, x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  function shade(hex, f) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); const q = v => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${q(r)},${q(g)},${q(b)})`; }

  // ------------------------------ the floor ------------------------------
  const DECO = { calcario: ['#7d7266', 'rgba(230,215,190,0.35)', '#6e6458', '#b2a48e', '#5a5248'], gelo: ['#a8d4ec', 'rgba(255,255,255,0.7)', '#86b8d8', '#e4f6ff', '#6a9cc0'], arenito: ['#9c6646', 'rgba(255,210,170,0.3)', '#8a5a3e', '#c89068', '#6e4630'], musgo: ['#6c7258', 'rgba(170,210,140,0.35)', '#5e644e', '#8e9a72', '#4a5040'], basalto: ['#55515a', 'rgba(200,200,215,0.25)', '#46434c', '#77737e', '#36343a'] };
  A.deco = function (c, kind, sx, sy, seed, t, wallPx, rock) {
    const F = G.Caves.FT; const DC = DECO[rock] || DECO.calcario;
    switch (kind) {
      case F.STAL: {
        const n = 1 + Math.floor(H(seed) * 3);
        for (let k = 0; k < n; k++) {
          const ox = (H(seed + k * 7) - 0.5) * 14, oy = (H(seed * 3 + k) - 0.5) * 5, hh = 4 + H(seed + k * 13) * 8, w = 1.4 + H(seed + k) * 1.6;
          c.fillStyle = DC[0]; c.beginPath(); c.moveTo(sx + ox - w, sy + oy); c.quadraticCurveTo(sx + ox - w * 0.3, sy + oy - hh * 0.5, sx + ox, sy + oy - hh); c.quadraticCurveTo(sx + ox + w * 0.3, sy + oy - hh * 0.5, sx + ox + w, sy + oy); c.closePath(); c.fill();
          c.fillStyle = DC[1]; c.beginPath(); c.moveTo(sx + ox - w * 0.2, sy + oy - 0.3); c.lineTo(sx + ox, sy + oy - hh + 0.6); c.lineTo(sx + ox - w * 0.7, sy + oy - 0.3); c.closePath(); c.fill();
          ell(c, sx + ox, sy + oy, w * 1.5, w * 0.55, 'rgba(60,52,46,0.5)');
        }
        break;
      }
      case F.COL: {
        const top = sy - wallPx; const w0 = 3.6, wm = 2.2;
        const g = c.createLinearGradient(sx - w0, 0, sx + w0, 0); g.addColorStop(0, DC[2]); g.addColorStop(0.45, DC[3]); g.addColorStop(1, DC[4]);
        c.fillStyle = g; c.beginPath(); c.moveTo(sx - w0 - 1.5, sy); c.quadraticCurveTo(sx - wm, sy - wallPx * 0.5, sx - w0, top); c.lineTo(sx + w0, top); c.quadraticCurveTo(sx + wm, sy - wallPx * 0.5, sx + w0 + 1.5, sy); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(40,34,28,0.35)'; c.lineWidth = 0.5; for (let k = 1; k < 4; k++) line(c, sx - wm, sy - wallPx * k / 4, sx + wm, sy - wallPx * k / 4 + 0.6);
        ell(c, sx, sy, w0 + 2.5, 1.6, 'rgba(50,44,38,0.45)');
        break;
      }
      case F.CRYS: {
        const n = 3 + Math.floor(H(seed) * 3); const hue = H(seed * 5) < 0.6 ? ['#b06ae0', '#e2b8ff', '#7a3cb0'] : ['#5ad0d8', '#c8fbff', '#2a8890'];
        for (let k = 0; k < n; k++) {
          const ox = (H(seed + k * 3) - 0.5) * 12, oy = (H(seed + k * 11) - 0.5) * 4, hh = 5 + H(seed + k * 5) * 9, w = 1.2 + H(seed + k) * 1.2, lean = (H(seed + k * 17) - 0.5) * 4;
          c.fillStyle = hue[0]; c.beginPath(); c.moveTo(sx + ox - w, sy + oy); c.lineTo(sx + ox - w + lean, sy + oy - hh + 1.5); c.lineTo(sx + ox + lean, sy + oy - hh); c.lineTo(sx + ox + w + lean, sy + oy - hh + 1.5); c.lineTo(sx + ox + w, sy + oy); c.closePath(); c.fill();
          c.fillStyle = hue[1]; c.globalAlpha = 0.75; c.beginPath(); c.moveTo(sx + ox - w * 0.2, sy + oy); c.lineTo(sx + ox + lean, sy + oy - hh); c.lineTo(sx + ox - w + lean, sy + oy - hh + 1.5); c.lineTo(sx + ox - w, sy + oy); c.closePath(); c.fill(); c.globalAlpha = 1;
          c.fillStyle = hue[2]; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(sx + ox + w * 0.2, sy + oy); c.lineTo(sx + ox + w, sy + oy); c.lineTo(sx + ox + w + lean, sy + oy - hh + 1.5); c.closePath(); c.fill(); c.globalAlpha = 1;
        }
        break;
      }
      case F.GLOW: { // glow-worms hang their threads from the roof of the cave
        c.lineWidth = 0.25;
        for (let k = 0; k < 7; k++) {
          const ox = (H(seed + k * 9) - 0.5) * 18, oy = (H(seed + k * 4) - 0.5) * 7, top = sy + oy - wallPx - 4, len = 3 + H(seed + k) * 6;
          c.strokeStyle = 'rgba(200,240,255,0.25)'; line(c, sx + ox, top, sx + ox, top + len);
          const a = 0.6 + 0.4 * Math.sin(t * (1 + H(seed + k * 2)) + k);
          c.fillStyle = `rgba(150,255,230,${a})`; c.beginPath(); c.arc(sx + ox, top + len, 0.55, 0, TAU); c.fill();
        }
        break;
      }
      case F.SHROOM: {
        const n = 3 + Math.floor(H(seed) * 4); const glow = H(seed * 7) < 0.5;
        for (let k = 0; k < n; k++) {
          const ox = (H(seed + k * 3) - 0.5) * 10, oy = (H(seed + k * 7) - 0.5) * 4, hh = 1.5 + H(seed + k) * 2.5, r = 0.9 + H(seed + k * 2) * 1.3;
          c.strokeStyle = '#d8d0c0'; c.lineWidth = 0.5; line(c, sx + ox, sy + oy, sx + ox, sy + oy - hh);
          c.fillStyle = glow ? '#8fdce8' : '#a8784a'; c.beginPath(); c.ellipse(sx + ox, sy + oy - hh, r, r * 0.55, 0, Math.PI, TAU); c.fill();
        }
        break;
      }
      case F.BONES: {
        const ox = (H(seed) - 0.5) * 8;
        ell(c, sx + ox, sy - 1, 1.8, 1.5, '#e8e0cc'); c.fillStyle = '#3a3028'; c.fillRect(sx + ox - 1, sy - 1.6, 0.6, 0.6); c.fillRect(sx + ox + 0.3, sy - 1.6, 0.6, 0.6);
        c.strokeStyle = '#ddd4bc'; c.lineWidth = 0.8; line(c, sx + ox + 3, sy + 0.5, sx + ox + 7, sy - 0.5); line(c, sx + ox - 5, sy + 1, sx + ox - 2, sy + 1.6);
        break;
      }
      case F.FOSSIL: {
        ell(c, sx, sy, 6, 2.6, '#6e6456'); c.strokeStyle = '#c8b898'; c.lineWidth = 0.6; c.beginPath();
        for (let a = 0; a < 4 * Math.PI; a += 0.3) { const r = 0.3 + a * 0.35; const x = sx + Math.cos(a) * r, y = sy + Math.sin(a) * r * 0.45; if (!a) c.moveTo(x, y); else c.lineTo(x, y); }
        c.stroke();
        break;
      }
      case F.GUANO: ell(c, sx + (H(seed) - 0.5) * 6, sy, 7, 2.8, 'rgba(58,44,30,0.75)'); ell(c, sx + (H(seed + 1) - 0.5) * 6, sy + 0.4, 3.5, 1.4, 'rgba(90,72,48,0.6)'); break;
    }
  };

  // ------------------------------ paintings ------------------------------
  // drawn in the wall's own frame: x 0..1 along the wall, y 0..1 from the floor up
  const OCHRE = '#b4532e', RED = '#8e3220', COAL = '#2a221c', CHALK = '#ece2cc';
  function fig(c, x, y, s, o) { // a little person: legs, body, arms, head
    c.beginPath(); c.moveTo(x - s * 0.18, y); c.lineTo(x, y + s * 0.35); c.lineTo(x + s * 0.18, y);
    c.moveTo(x, y + s * 0.35); c.lineTo(x, y + s * 0.72);
    const a = o && o.arms !== undefined ? o.arms : 0.2;
    c.moveTo(x - s * 0.24, y + s * (0.55 + a)); c.lineTo(x, y + s * 0.62); c.lineTo(x + s * 0.24, y + s * (0.55 + (o && o.arms2 !== undefined ? o.arms2 : a)));
    c.stroke();
    c.beginPath(); c.arc(x, y + s * 0.82, s * 0.1, 0, TAU); c.fill();
    if (o && o.spear) { c.beginPath(); c.moveTo(x + s * 0.24, y + s * 0.3); c.lineTo(x + s * 0.24 + s * 0.15 * o.spear, y + s * 1.05); c.stroke(); }
    if (o && o.crown) { c.beginPath(); c.moveTo(x - s * 0.1, y + s * 0.9); c.lineTo(x - s * 0.06, y + s * 1.02); c.lineTo(x, y + s * 0.94); c.lineTo(x + s * 0.06, y + s * 1.02); c.lineTo(x + s * 0.1, y + s * 0.9); c.stroke(); }
  }
  function beast(c, x, y, s, k) { // deer, bison, wolf
    c.beginPath(); c.ellipse(x, y + s * 0.45, s * 0.42, s * 0.2, 0, 0, TAU); c.fill();
    c.beginPath(); for (const lx of [-0.28, -0.12, 0.14, 0.3]) { c.moveTo(x + s * lx, y + s * 0.35); c.lineTo(x + s * lx + s * 0.02, y); } c.stroke();
    c.beginPath(); c.moveTo(x + s * 0.36, y + s * 0.55); c.lineTo(x + s * 0.55, y + s * (k === 'wolf' ? 0.62 : 0.72)); c.stroke();
    c.beginPath(); c.arc(x + s * 0.58, y + s * (k === 'wolf' ? 0.62 : 0.74), s * 0.08, 0, TAU); c.fill();
    if (k === 'deer') { c.beginPath(); c.moveTo(x + s * 0.58, y + s * 0.8); c.lineTo(x + s * 0.5, y + s * 1.05); c.moveTo(x + s * 0.55, y + s * 0.95); c.lineTo(x + s * 0.44, y + s * 1.0); c.moveTo(x + s * 0.6, y + s * 0.8); c.lineTo(x + s * 0.7, y + s * 1.05); c.stroke(); }
    if (k === 'bison') { c.beginPath(); c.ellipse(x + s * 0.18, y + s * 0.58, s * 0.2, s * 0.17, 0, 0, TAU); c.fill(); }
  }
  A.painting = function (c, p, age) {
    const sd = p.seed || 1; const r = k => H(sd + k * 31);
    const fade = Math.max(0.42, Math.min(0.95, 1 - age / 260));
    c.save(); c.globalAlpha = fade; c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = OCHRE; c.fillStyle = OCHRE; c.lineWidth = 0.035;
    const S = 0.36;
    switch (p.scene) {
      case 'caca': { beast(c, 0.58, 0.2, 0.5, r(1) < 0.5 ? 'deer' : 'bison'); for (let k = 0; k < 3; k++) fig(c, 0.12 + k * 0.13, 0.12 + r(k + 2) * 0.08, S, { spear: 1.4 }); break; }
      case 'guerra': { for (let k = 0; k < 3; k++) fig(c, 0.12 + k * 0.1, 0.15, S, { spear: 1.2 }); c.strokeStyle = COAL; c.fillStyle = COAL; for (let k = 0; k < 3; k++) fig(c, 0.62 + k * 0.1, 0.15, S, { spear: -1.2 }); c.strokeStyle = RED; line(c, 0.45, 0.3, 0.55, 0.42); break; }
      case 'rei': { fig(c, 0.5, 0.12, 0.62, { crown: 1, arms: 0.3 }); for (let k = 0; k < 4; k++) fig(c, 0.12 + k * 0.08 + (k > 1 ? 0.45 : 0), 0.1, 0.22, { arms: 0.35 }); break; }
      case 'mar': { c.beginPath(); c.moveTo(0.18, 0.3); c.quadraticCurveTo(0.5, 0.12, 0.82, 0.3); c.closePath(); c.fill(); for (let k = 0; k < 4; k++) fig(c, 0.3 + k * 0.12, 0.3, 0.24, {}); c.strokeStyle = COAL; c.beginPath(); for (let k = 0; k < 6; k++) { c.moveTo(0.08 + k * 0.15, 0.12); c.quadraticCurveTo(0.15 + k * 0.15, 0.2, 0.22 + k * 0.15, 0.12); } c.stroke(); break; }
      case 'fera': { c.fillStyle = COAL; c.strokeStyle = COAL; beast(c, 0.22, 0.15, 0.6, r(1) < 0.5 ? 'wolf' : 'bison'); c.fillStyle = OCHRE; c.strokeStyle = OCHRE; for (let k = 0; k < 2; k++) fig(c, 0.74 + k * 0.12, 0.12, S, { arms: 0.45 }); break; }
      case 'deus': { c.strokeStyle = RED; c.fillStyle = RED; c.beginPath(); c.arc(0.5, 0.74, 0.1, 0, TAU); c.fill(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; line(c, 0.5 + Math.cos(a) * 0.14, 0.74 + Math.sin(a) * 0.14, 0.5 + Math.cos(a) * 0.22, 0.74 + Math.sin(a) * 0.22); } c.strokeStyle = OCHRE; c.fillStyle = OCHRE; for (let k = 0; k < 5; k++) fig(c, 0.14 + k * 0.18, 0.08, 0.24, { arms: 0.5, arms2: 0.5 }); break; }
      case 'festa': { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; fig(c, 0.5 + Math.cos(a) * 0.3, 0.16 + Math.sin(a) * 0.06, 0.3, { arms: k % 2 ? 0.45 : -0.05, arms2: k % 2 ? -0.05 : 0.45 }); } c.strokeStyle = RED; c.beginPath(); c.arc(0.5, 0.16, 0.05, 0, TAU); c.stroke(); break; }
      case 'morte': { c.beginPath(); c.moveTo(0.32, 0.18); c.lineTo(0.66, 0.18); c.stroke(); c.beginPath(); c.arc(0.7, 0.19, 0.035, 0, TAU); c.fill(); for (let k = 0; k < 4; k++) fig(c, 0.16 + k * 0.22 + (k > 1 ? 0.1 : 0), 0.3, 0.3, { arms: 0.6, arms2: 0.6 }); break; }
      case 'povo': { c.strokeStyle = COAL; for (let k = 0; k < 3; k++) { const x = 0.15 + k * 0.25; c.beginPath(); c.moveTo(x, 0.12); c.lineTo(x, 0.32); c.lineTo(x + 0.08, 0.44); c.lineTo(x + 0.16, 0.32); c.lineTo(x + 0.16, 0.12); c.stroke(); } c.strokeStyle = RED; c.fillStyle = RED; c.beginPath(); c.moveTo(0.82, 0.12); c.quadraticCurveTo(0.78, 0.25, 0.85, 0.36); c.quadraticCurveTo(0.9, 0.25, 0.88, 0.12); c.fill(); break; }
      case 'correntes': { for (let k = 0; k < 4; k++) fig(c, 0.16 + k * 0.18, 0.12, 0.32, { arms: -0.1 }); c.strokeStyle = COAL; line(c, 0.16, 0.32, 0.7, 0.32); fig(c, 0.88, 0.12, 0.4, { spear: 1 }); break; }
      default: break;
    }
    // hands blown in ochre and chalk around it: the painters signed
    const nh = p.scene === 'maos' ? 9 : 2 + Math.floor(r(9) * 2);
    for (let k = 0; k < nh; k++) {
      const x = 0.08 + r(20 + k) * 0.84, y = 0.45 + r(40 + k) * 0.45; const col = r(60 + k) < 0.6 ? OCHRE : CHALK;
      c.fillStyle = col; c.globalAlpha = fade * 0.75; c.beginPath(); c.ellipse(x, y, 0.035, 0.05, 0, 0, TAU); c.fill();
      c.lineWidth = 0.018; c.strokeStyle = col; for (let f = 0; f < 5; f++) { const a = -0.9 + f * 0.45; line(c, x + Math.sin(a) * 0.03, y + Math.cos(a) * 0.04, x + Math.sin(a) * 0.075, y + Math.cos(a) * 0.1); }
      c.lineWidth = 0.035;
    }
    c.restore();
  };

  // ------------------------------ tombs ------------------------------
  A.tomb = function (c, tb, sx, sy, t) {
    const civ = tb.civ, rob = tb.robbed;
    c.save(); c.translate(sx, sy);
    ell(c, 0, 0.6, 9, 3.6, 'rgba(20,16,12,0.35)');
    if (civ === 'egipcio') {
      c.fillStyle = '#c8962e'; c.beginPath(); c.moveTo(-7, 0); c.lineTo(5, -5); c.lineTo(9, -3); c.lineTo(-3, 2); c.closePath(); c.fill();
      c.fillStyle = '#d8aa44'; c.beginPath(); c.moveTo(-7, 0); c.lineTo(-7, -3); c.lineTo(5, -8); c.lineTo(5, -5); c.closePath(); c.fill();
      c.fillStyle = '#e8c060'; c.beginPath(); c.moveTo(-7, -3); c.lineTo(5, -8); c.lineTo(9, -6); c.lineTo(-3, -1); c.closePath(); c.fill();
      if (!rob) { c.fillStyle = '#2a5a9a'; for (let k = 0; k < 3; k++) c.fillRect(-3 + k * 3, -3.4 - k * 1.25, 1.2, 0.6); ell(c, 6.4, -6.4, 1.6, 1.3, '#f2cc5a'); c.fillStyle = '#2a5a9a'; c.fillRect(5.6, -7.6, 1.6, 0.5); }
      else { c.strokeStyle = '#3a2a18'; c.lineWidth = 0.6; line(c, -2, -1, 4, -6.5); }
    } else if (civ === 'grego') {
      c.fillStyle = '#9a9286'; c.fillRect(-5, -3, 10, 3); c.fillStyle = '#b8b0a2'; c.beginPath(); c.moveTo(-5, -3); c.lineTo(-3, -4); c.lineTo(7, -4); c.lineTo(5, -3); c.closePath(); c.fill();
      if (!rob) { c.fillStyle = '#a8783a'; c.beginPath(); c.moveTo(-1.6, -4); c.quadraticCurveTo(-3.6, -8, -1.2, -11); c.lineTo(1.2, -11); c.quadraticCurveTo(3.6, -8, 1.6, -4); c.closePath(); c.fill(); c.strokeStyle = '#3a6a2a'; c.lineWidth = 0.6; c.beginPath(); c.arc(0, -8, 2.4, 0, TAU); c.stroke(); }
      else { c.fillStyle = '#8a6030'; c.beginPath(); c.arc(4, -0.5, 1.6, 0, Math.PI); c.fill(); }
    } else if (civ === 'romano') {
      c.fillStyle = '#d8d2c6'; c.fillRect(-7, -4, 13, 4); c.fillStyle = '#ece6da'; c.beginPath(); c.moveTo(-7, -4); c.lineTo(-4, -6); c.lineTo(9, -6); c.lineTo(6, -4); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(80,70,60,0.5)'; c.lineWidth = 0.4; for (let k = 0; k < 4; k++) line(c, -5 + k * 3, -3.4, -5 + k * 3, -0.6);
      if (rob) { c.fillStyle = '#cfc8ba'; c.beginPath(); c.moveTo(4, -7); c.lineTo(12, -9); c.lineTo(13, -8); c.lineTo(5, -6); c.closePath(); c.fill(); }
      else { c.fillStyle = '#f0eadc'; c.beginPath(); c.moveTo(-7, -4.5); c.lineTo(-4, -7.5); c.lineTo(9, -7.5); c.lineTo(6, -4.5); c.closePath(); c.fill(); }
    } else if (civ === 'nordico') {
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ell(c, Math.cos(a) * 9, Math.sin(a) * 3, 1.3, 1.6, k === 0 || k === 6 ? '#8a8478' : '#6e6a62'); c.fillStyle = '#9a948a'; c.fillRect(Math.cos(a) * 9 - 0.6, Math.sin(a) * 3 - 2.6, 1.2, 1.4); }
      if (!rob) { c.strokeStyle = '#c8ccd2'; c.lineWidth = 0.9; line(c, -4, -0.5, 4, -1.5); c.strokeStyle = '#7a5a2a'; line(c, -4, -0.5, -5.5, -0.3); }
    } else if (civ === 'asteca') {
      c.fillStyle = '#8a7e6a'; c.fillRect(-7, -2.5, 14, 2.5); c.fillStyle = '#9e927c'; c.fillRect(-5, -5, 10, 2.5); c.fillStyle = '#b2a68e'; c.fillRect(-3, -7.5, 6, 2.5);
      if (!rob) { ell(c, 0, -9, 2, 2.2, '#3aa070'); c.fillStyle = '#1a3a2a'; c.fillRect(-1.1, -9.6, 0.7, 0.5); c.fillRect(0.4, -9.6, 0.7, 0.5); ell(c, -5, -3.2, 1, 0.8, '#6a4a2a'); ell(c, 5, -3.2, 1, 0.8, '#6a4a2a'); }
    } else {
      for (let k = 0; k < 9; k++) ell(c, (H(k + tb.i) - 0.5) * 12, -1 - H(k * 3 + tb.i) * 4, 2.2, 1.6, k % 2 ? '#7a7266' : '#8e8576');
      if (!rob) { c.fillStyle = OCHRE; c.globalAlpha = 0.8; c.beginPath(); c.ellipse(0, -5, 1.2, 1.5, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
    }
    // offerings
    if (!rob && tb.gold) for (let k = 0; k < Math.min(4, tb.gold); k++) ell(c, -8 + k * 2.2, 1.6, 0.9, 0.6, '#f2c14e');
    if (rob) for (let k = 0; k < 3; k++) ell(c, -6 + k * 5, 2 + (k % 2), 1, 0.5, '#6a5a48');
    c.restore();
  };

  // ------------------------------ the oracle, the outlaws, the finds ------------------------------
  A.oracle = function (c, sx, sy, t, here) {
    c.strokeStyle = 'rgba(20,12,10,0.8)'; c.lineWidth = 0.8; line(c, sx - 6, sy + 1, sx + 5, sy - 1.2);
    // vapour from the crack
    for (let k = 0; k < 6; k++) {
      const ph = (t * 0.35 + k / 6) % 1; const x = sx - 2 + Math.sin(t * 0.9 + k * 2) * 2.5 * ph + (k - 3) * 0.6, y = sy - 2 - ph * 22;
      c.fillStyle = `rgba(${here ? '214,190,255' : '200,196,210'},${0.28 * (1 - ph) * (here ? 1.3 : 0.7)})`; c.beginPath(); c.arc(x, y, 1.5 + ph * 4, 0, TAU); c.fill();
    }
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.7; line(c, sx + 3, sy - 1, sx + 5, sy + 2.5); line(c, sx + 3, sy - 1, sx + 1.4, sy + 2.6); line(c, sx + 3, sy - 1, sx + 4, sy + 3.2);
    ell(c, sx + 3, sy - 1.6, 2.4, 0.9, '#b48a3e'); ell(c, sx + 3, sy - 2, 1.6, 0.5, here ? '#ffcf73' : '#6a4a22');
  };
  A.camp = function (c, sx, sy, t, b) {
    const rolls = ['#6a3a2a', '#3a4a5a', '#5a5a3a', '#4a2a3a', '#3a3a3a'];
    for (let k = 0; k < Math.min(5, b.n + 1); k++) { const a = k / 5 * TAU + 0.4; ell(c, sx + Math.cos(a) * 11, sy + Math.sin(a) * 4.5, 4, 1.6, rolls[k]); }
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; ell(c, sx + Math.cos(a) * 3.2, sy + Math.sin(a) * 1.4, 1, 0.7, '#6e665c'); }
    c.strokeStyle = '#4a3020'; c.lineWidth = 0.9; line(c, sx - 2, sy + 0.5, sx + 2, sy - 0.5); line(c, sx - 1.5, sy - 0.8, sx + 1.8, sy + 0.8);
    // the loot: a chest and sacks
    const lx = sx + 13, ly = sy - 3; const gold = (b.loot.ouro || 0) + (b.loot.moedas || 0) / 4;
    c.fillStyle = '#6a4424'; c.fillRect(lx - 3, ly - 3.5, 6, 3.5); c.fillStyle = '#8a5a30'; c.fillRect(lx - 3, ly - 4.6, 6, 1.4); c.fillStyle = '#c8a050'; c.fillRect(lx - 0.5, ly - 3.2, 1, 1.2);
    if (gold > 0) for (let k = 0; k < Math.min(6, gold + 1); k++) ell(c, lx - 2 + (k % 3) * 2, ly - 4.6 - Math.floor(k / 3) * 0.8, 0.9, 0.5, '#f2c14e');
    if ((b.loot.food || 0) > 0) { ell(c, lx + 5, ly - 1.4, 2.2, 2.4, '#c8b48a'); ell(c, lx + 7.4, ly - 0.6, 1.8, 2, '#b8a47a'); }
    if ((b.loot.tecido || 0) > 0) ell(c, lx - 5.6, ly - 0.8, 2.4, 1.2, '#c8503a');
  };
  A.treasure = function (c, sx, sy, t, seed) {
    const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.2 + seed));
    c.fillStyle = `rgba(255,224,140,${a})`;
    c.beginPath(); c.moveTo(sx, sy - 5); c.lineTo(sx + 0.8, sy - 2.6); c.lineTo(sx + 3, sy - 2); c.lineTo(sx + 0.8, sy - 1.4); c.lineTo(sx, sy + 1); c.lineTo(sx - 0.8, sy - 1.4); c.lineTo(sx - 3, sy - 2); c.lineTo(sx - 0.8, sy - 2.6); c.closePath(); c.fill();
    ell(c, sx, sy + 0.8, 3.2, 1.2, 'rgba(70,58,40,0.6)');
  };

  // ------------------------------ the creatures of the dark ------------------------------
  A.beast = function (c, b, sx, sy, t) {
    const m = b.face || 1; c.save(); c.translate(sx, sy); c.scale(m, 1);
    if (b.kind === 'aranha') {
      c.strokeStyle = '#2a2220'; c.lineWidth = 0.35; const w = b.moving ? Math.sin(t * 20) * 0.4 : 0;
      for (let k = 0; k < 4; k++) { const a = -0.6 + k * 0.4; line(c, 0, -0.8, 1.6 + k * 0.2, -1.6 + k * 0.5 + w * (k % 2 ? 1 : -1)); line(c, 0, -0.8, -1.6 - k * 0.2, -1.6 + k * 0.5 - w * (k % 2 ? 1 : -1)); void a; }
      ell(c, -0.5, -1, 1.1, 0.8, '#3a302a'); ell(c, 0.6, -0.9, 0.6, 0.5, '#2a2220');
    } else if (b.kind === 'grilo') {
      const hop = b.moving ? Math.abs(Math.sin(t * 9 + b.id)) * 2 : 0;
      ell(c, 0, -0.8 - hop, 1.2, 0.5, '#8a6a46'); c.strokeStyle = '#6a5034'; c.lineWidth = 0.25; line(c, 1, -0.9 - hop, 3.4, -2.6 - hop); line(c, 1, -0.9 - hop, 3, -2 - hop); line(c, -0.6, -0.6 - hop, -1.4, 0 - hop);
    } else if (b.kind === 'peixe') {
      const sw = Math.sin(t * 6 + b.id) * 0.5;
      c.globalAlpha = 0.85; ell(c, 0, 0, 1.8, 0.6, '#ece6e0'); c.fillStyle = '#d8d0ca'; c.beginPath(); c.moveTo(-1.6, 0); c.lineTo(-2.8, -0.7 + sw); c.lineTo(-2.8, 0.7 + sw); c.closePath(); c.fill(); c.globalAlpha = 1;
    } else if (b.kind === 'salamandra') {
      const w = b.moving ? Math.sin(t * 5 + b.id) * 0.6 : Math.sin(t * 0.7 + b.id) * 0.2;
      c.strokeStyle = '#f0c6c0'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2.6, -0.4 + w); c.quadraticCurveTo(-1, -0.6 - w, 1.4, -0.5); c.stroke();
      ell(c, 1.8, -0.55, 0.7, 0.5, '#f4d0ca'); c.strokeStyle = '#e8b8b0'; c.lineWidth = 0.35; line(c, 0.6, -0.5, 1.1, 0.2); line(c, -1, -0.4, -1.4, 0.3); line(c, 0.6, -0.6, 1, -1.2); line(c, -1, -0.5, -1.5, -1.1);
      c.fillStyle = '#f4b8c8'; c.fillRect(2.2, -0.9, 0.4, 0.6);
    }
    c.restore();
  };
  // bats asleep under the roof: a dark cluster that thins at night
  A.roost = function (c, sx, sy, n, t, seed) {
    const k = Math.min(36, Math.ceil(n / 6));
    for (let q = 0; q < k; q++) {
      const x = sx + (H(seed + q * 3) - 0.5) * 30, y = sy + (H(seed + q * 7) - 0.5) * 8; const sw = Math.sin(t * 1.3 + q) * 0.25;
      c.strokeStyle = 'rgba(30,24,22,0.6)'; c.lineWidth = 0.2; line(c, x, y - 1.2, x, y);
      c.fillStyle = '#2a2220'; c.beginPath(); c.moveTo(x - 0.9 + sw, y); c.quadraticCurveTo(x, y + 3.2, x + 0.9 + sw, y); c.closePath(); c.fill();
    }
  };
  A.bat = function (c, x, y, t, k) {
    const f = Math.sin(t * 18 + k * 1.7); const w = 3.8;
    c.fillStyle = '#1e1a1c'; c.beginPath(); c.ellipse(x, y + 0.2, 0.9, 1.2, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - w * 0.6, y - 2.2 * f - 0.4, x - w, y - 0.2 + f * 1.2); c.quadraticCurveTo(x - w * 0.5, y + 0.2, x, y + 0.5);
    c.quadraticCurveTo(x + w * 0.5, y + 0.2, x + w, y - 0.2 + f * 1.2); c.quadraticCurveTo(x + w * 0.6, y - 2.2 * f - 0.4, x, y); c.fill();
  };

  // ------------------------------ seen from above ------------------------------
  // ------------------------------ the doors of the caves ------------------------------
  // the stone of the land: grey and mossy, red in the deserts, blue-grey under snow, dark in the jungle
  const STONE = {
    0: { lit: '#9a9282', mid: '#7c7466', dark: '#585246', cap: '#6f8a44', moss: '#5e7a3a' },
    1: { lit: '#a6acb8', mid: '#868c98', dark: '#5e6470', cap: '#eef3f8', moss: '#9fb0b8' },
    2: { lit: '#8e8a84', mid: '#706c66', dark: '#4e4a46', cap: '#4f6a3a', moss: '#4a6236' },
    3: { lit: '#7e806e', mid: '#646654', dark: '#44463a', cap: '#5a7a3a', moss: '#4e7034' },
    4: { lit: '#7a7a6a', mid: '#5e5e50', dark: '#403f36', cap: '#3f7a32', moss: '#3a6e2c' },
    5: { lit: '#b88a62', mid: '#98704e', dark: '#6e4e36', cap: '#a8a050', moss: '#8a8a44' },
    6: { lit: '#c8946a', mid: '#a67652', dark: '#7a5238', cap: '#d8b47a', moss: '#a08a58' },
  };
  function darkHole(c, x, y, w, h, arch) {
    const g = c.createLinearGradient(0, y - h, 0, y + 1); g.addColorStop(0, '#060505'); g.addColorStop(0.7, '#120e0c'); g.addColorStop(1, '#2a221c');
    c.fillStyle = g; c.beginPath();
    if (arch) { c.moveTo(x - w, y + 0.8); c.quadraticCurveTo(x - w * 1.08, y - h * 0.7, x, y - h); c.quadraticCurveTo(x + w * 1.08, y - h * 0.7, x + w, y + 0.8); c.quadraticCurveTo(x, y + 2, x - w, y + 0.8); }
    else c.ellipse(x, y, w, h, 0, 0, TAU);
    c.fill();
  }
  function rocks(c, x, y, n, spread, P, seed) {
    for (let k = 0; k < n; k++) { const ox = (H(seed + k * 3) - 0.5) * spread, oy = (H(seed + k * 7) - 0.5) * spread * 0.32, r = 1 + H(seed + k * 11) * 1.8; ell(c, x + ox, y + oy + 0.5, r * 1.3, r * 0.55, 'rgba(0,0,0,0.25)'); c.fillStyle = H(seed + k) < 0.5 ? P.lit : P.mid; c.beginPath(); c.moveTo(x + ox - r, y + oy); c.lineTo(x + ox - r * 0.3, y + oy - r * 1.2); c.lineTo(x + ox + r * 0.7, y + oy - r * 0.8); c.lineTo(x + ox + r, y + oy); c.closePath(); c.fill(); }
  }
  function tufts(c, x, y, n, spread, col, seed) {
    c.strokeStyle = col; c.lineWidth = 0.6;
    for (let k = 0; k < n; k++) { const ox = (H(seed + k * 5) - 0.5) * spread, oy = (H(seed + k * 9) - 0.5) * spread * 0.3; for (let b = -1; b <= 1; b++) line(c, x + ox, y + oy, x + ox + b * 1.1, y + oy - 2.2 - H(seed + k + b) * 1.4); }
  }
  function vines(c, x0, x1, y, n, col, seed, t) {
    c.strokeStyle = col; c.lineWidth = 0.55;
    for (let k = 0; k < n; k++) { const x = x0 + (x1 - x0) * H(seed + k * 13), L = 3 + H(seed + k * 17) * 7, sw = Math.sin(t * 0.8 + k) * 0.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y + L * 0.6, x + sw * 1.5, y + L); c.stroke(); ell(c, x + sw * 1.5, y + L, 0.9, 0.6, col); }
  }
  // the door, the kind the ground made, dressed by what the people made of it
  A.mouth = function (c, sx, sy, t, o) {
    const P = STONE[o.biome] || STONE[0]; const sd = o.seed || 7; const kind = o.kind || 'paredao';
    c.save(); c.translate(sx, sy); if (o.mirror) c.scale(-1, 1);
    let hx = 0, hy = 0, hw = 6, hh = 8.6; // the hole: where the dressing goes
    if (kind === 'paredao') {
      // a cut in the hillside: a wide face of stone that rises out of the slope, its ends sinking back
      // into the grass; the arch opens at its foot and the fallen stones lie below
      const W0 = 21, Ht = 19;
      const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; const env = Math.sin(u * Math.PI); pts.push([-W0 + u * 2 * W0, 2 - env * Ht - (H(sd + k) - 0.5) * 5 * env]); }
      ell(c, 0, 2.5, W0, 4, 'rgba(0,0,0,0.18)');
      // the face, lit from the left, shaded to the right
      const g = c.createLinearGradient(-W0, 0, W0, 0); g.addColorStop(0, P.lit); g.addColorStop(0.45, P.mid); g.addColorStop(1, P.dark);
      c.fillStyle = g; c.beginPath(); c.moveTo(-W0, 2.5); for (const [x, y] of pts) c.lineTo(x, y); c.lineTo(W0, 2.5); c.quadraticCurveTo(0, 5, -W0, 2.5); c.fill();
      // the layers of the stone, bending with the hill
      c.strokeStyle = 'rgba(30,22,16,0.26)'; c.lineWidth = 0.6;
      for (let k = 1; k < 4; k++) { const f = k / 4.2; c.beginPath(); c.moveTo(-W0 * (1 - f * 0.55), 2 - Ht * f * 0.75); c.quadraticCurveTo(0, 2 - Ht * f - 1.5 + (H(sd + k) - 0.5) * 2, W0 * (1 - f * 0.55), 2 - Ht * f * 0.75); c.stroke(); }
      // cracks
      c.strokeStyle = 'rgba(20,14,10,0.35)'; c.lineWidth = 0.5; line(c, -12, -6, -10, -12); line(c, 11, -4, 13, -10); line(c, 13, -10, 12, -13);
      // the top: the hill goes on above it — grass (or snow, or sand) curling over the edge
      c.fillStyle = P.cap; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts) c.lineTo(x, y - 1.2); for (let k = pts.length - 1; k >= 0; k--) c.lineTo(pts[k][0], pts[k][1] + 1.6 + H(sd + k * 7) * 1.4); c.closePath(); c.fill();
      if (o.biome !== 1 && o.biome !== 6) { ell(c, pts[6][0], pts[6][1] - 2, 3.4, 2.4, P.moss); ell(c, pts[6][0] + 2.2, pts[6][1] - 3.2, 2.2, 1.8, P.cap); tufts(c, pts[2][0], pts[2][1] - 0.5, 3, 6, P.moss, sd + 2); }
      if (o.biome !== 6 && o.biome !== 5) vines(c, -8, 8, -12.5, o.biome === 4 || o.biome === 3 ? 9 : 4, P.moss, sd, t);
      hw = 6.4; hh = 12; hy = 1.5;
      darkHole(c, 0, hy, hw, hh, true);
      c.strokeStyle = 'rgba(255,245,225,0.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-hw - 0.4, hy + 0.5); c.quadraticCurveTo(-hw * 1.1, hy - hh * 0.7, 0, hy - hh - 0.4); c.stroke();
      rocks(c, 0, 4, 6, 28, P, sd + 40);
    } else if (kind === 'abrigo') {
      // a shelter under the rock: a long outcrop on the slope, its lower layer eaten away into a low dark
      ell(c, 0, 2.5, 19, 4.5, 'rgba(0,0,0,0.18)');
      const g = c.createLinearGradient(-19, 0, 19, 0); g.addColorStop(0, P.lit); g.addColorStop(0.5, P.mid); g.addColorStop(1, P.dark);
      c.fillStyle = g; c.beginPath(); c.moveTo(-19, 2.5); c.quadraticCurveTo(-20, -6, -13, -11); c.quadraticCurveTo(-2, -15, 9, -13); c.quadraticCurveTo(18, -10, 19, 2.5); c.quadraticCurveTo(0, 5, -19, 2.5); c.fill();
      hw = 12.5; hh = 6.2; hy = 1.6;
      // the hollow under the ledge
      const hg = c.createLinearGradient(0, hy - hh, 0, hy + 1); hg.addColorStop(0, '#070605'); hg.addColorStop(1, '#2a221c');
      c.fillStyle = hg; c.beginPath(); c.moveTo(-hw, hy + 0.6); c.quadraticCurveTo(-hw + 1, hy - hh, -2, hy - hh - 0.6); c.quadraticCurveTo(hw - 1, hy - hh + 0.4, hw, hy + 0.6); c.quadraticCurveTo(0, hy + 2, -hw, hy + 0.6); c.fill();
      // the lip of the ledge catching the light, the soot of old fires on its underside
      c.strokeStyle = 'rgba(255,245,225,0.4)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-hw - 0.6, hy - 1.5); c.quadraticCurveTo(-hw + 1, hy - hh - 0.8, -2, hy - hh - 1.4); c.quadraticCurveTo(hw - 1, hy - hh - 0.6, hw + 0.6, hy - 1); c.stroke();
      ell(c, 1, hy - hh + 1.4, 6.5, 1.2, 'rgba(10,8,6,0.45)');
      c.strokeStyle = 'rgba(30,22,16,0.25)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-16, -9); c.quadraticCurveTo(0, -12.5, 16, -9); c.stroke();
      c.fillStyle = P.cap; c.beginPath(); c.moveTo(-13, -11); c.quadraticCurveTo(-2, -15, 9, -13); c.quadraticCurveTo(-2, -16.8, -13, -12.4); c.closePath(); c.fill();
      vines(c, -10, 10, -8.5, o.biome === 4 ? 7 : 3, P.moss, sd, t);
      rocks(c, -9, 3.5, 3, 10, P, sd + 30); tufts(c, 12, 3.5, 3, 8, P.moss, sd);
    } else if (kind === 'dolina') {
      // the ground gave way: a round hole of stone in the flat land
      const rx = 13, ry = 6.2;
      ell(c, 0, 0.8, rx + 2, ry + 1.6, 'rgba(0,0,0,0.12)');
      c.fillStyle = P.mid; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill();
      // its inner walls, dark going down
      const g = c.createLinearGradient(0, -ry, 0, ry); g.addColorStop(0, P.dark); g.addColorStop(1, '#0c0a08');
      c.fillStyle = g; c.beginPath(); c.ellipse(0, 0.6, rx - 1.8, ry - 1.2, 0, 0, TAU); c.fill();
      c.fillStyle = P.lit; c.beginPath(); c.ellipse(0, 0, rx - 1.6, ry - 1, 0, Math.PI * 0.05, Math.PI * 0.95); c.lineTo(-rx + 2, 1); c.ellipse(0, 1.6, rx - 2.4, ry - 1.4, 0, Math.PI, 0, true); c.closePath(); c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
      hw = 6; hh = 3; hy = -1; darkHole(c, -1, -1.4, 6.2, 2.6, false);
      // the edge: stones, grass, ferns leaning over the drop
      rocks(c, 0, -ry + 0.5, 4, 22, P, sd + 11); rocks(c, 0, ry - 0.3, 3, 20, P, sd + 23);
      tufts(c, 0, -ry, 6, 26, P.moss, sd + 3);
      if (o.biome !== 6 && o.biome !== 1) { c.strokeStyle = P.moss; c.lineWidth = 0.7; for (let k = 0; k < 3; k++) { const x = -8 + k * 7; c.beginPath(); c.moveTo(x, -ry + 1); c.quadraticCurveTo(x + 1, -ry + 3, x + 0.5, -ry + 5); c.stroke(); } }
      hx = 0; hy = 2;
    } else if (kind === 'fenda') {
      // two boulders leaning together, and the black crack between them
      ell(c, 0, 2, 13, 3.5, 'rgba(0,0,0,0.22)');
      c.fillStyle = P.mid; c.beginPath(); c.moveTo(-13, 2); c.quadraticCurveTo(-14, -9, -6, -15); c.lineTo(-0.8, -12); c.lineTo(-1.5, 2); c.closePath(); c.fill();
      c.fillStyle = P.lit; c.beginPath(); c.moveTo(-13, 2); c.quadraticCurveTo(-14, -9, -6, -15); c.lineTo(-6.5, -8); c.lineTo(-9, 2); c.closePath(); c.fill();
      c.fillStyle = P.dark; c.beginPath(); c.moveTo(12, 2); c.quadraticCurveTo(13, -7, 5, -13); c.lineTo(0.6, -11); c.lineTo(1.4, 2); c.closePath(); c.fill();
      const g = c.createLinearGradient(0, -12, 0, 2); g.addColorStop(0, '#050404'); g.addColorStop(1, '#1e1814');
      c.fillStyle = g; c.beginPath(); c.moveTo(-1.6, 2); c.lineTo(-0.9, -11.5); c.lineTo(0.7, -10.8); c.lineTo(1.5, 2); c.closePath(); c.fill();
      c.fillStyle = P.moss; ell(c, -7, -13.5, 2.6, 1.2, P.moss); ell(c, 6, -12, 2.2, 1, P.moss);
      tufts(c, 0, 2.5, 3, 16, P.moss, sd); rocks(c, 7, 3, 2, 8, P, sd + 9);
      hw = 2; hh = 10; hy = 1.5;
    } else { // poco
      // a shaft going straight down out of bare rock
      ell(c, 0, 1, 10, 4.6, 'rgba(0,0,0,0.2)');
      c.fillStyle = P.lit; c.beginPath(); c.ellipse(0, 0, 9, 4.4, 0, 0, TAU); c.fill();
      c.fillStyle = P.mid; c.beginPath(); c.ellipse(0, 0.5, 9, 4.2, 0, 0, Math.PI); c.fill();
      c.fillStyle = '#060505'; c.beginPath(); c.ellipse(0, 0, 6.4, 2.9, 0, 0, TAU); c.fill();
      c.fillStyle = P.dark; c.beginPath(); c.ellipse(0, -0.8, 6.4, 2.1, 0, Math.PI, TAU); c.fill();
      c.strokeStyle = P.moss; c.lineWidth = 0.6; for (let k = 0; k < 4; k++) { const a = Math.PI * (1.1 + k * 0.25); const x = Math.cos(a) * 6, y = Math.sin(a) * 2.8; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x * 0.8, y + 2, x * 0.7, y + 3.5); c.stroke(); }
      rocks(c, 0, 4, 3, 18, P, sd + 5);
      hw = 6; hh = 2.6; hy = 0;
      if (o.mine) { c.strokeStyle = '#7a5530'; c.lineWidth = 1; line(c, -6, 1, -3, -10); line(c, 6, 1, 3, -10); line(c, -4, -9.5, 4, -9.5); c.strokeStyle = 'rgba(210,190,150,0.8)'; c.lineWidth = 0.4; line(c, 0, -9.5, 0, 0); }
    }
    // a spring: the water of the cave comes out by the door
    if (o.spring) {
      const g = c.createLinearGradient(0, hy - 1, 0, hy + 9); g.addColorStop(0, 'rgba(70,130,170,0.9)'); g.addColorStop(1, 'rgba(110,170,205,0.75)');
      c.fillStyle = g; c.beginPath(); c.moveTo(-hw * 0.5, hy); c.quadraticCurveTo(-hw * 0.7, hy + 5, -4, hy + 8); c.quadraticCurveTo(0, hy + 10.5, 6, hy + 8.4); c.quadraticCurveTo(hw * 0.7, hy + 4, hw * 0.5, hy); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(230,245,255,0.6)'; c.lineWidth = 0.5; for (let k = 0; k < 3; k++) { const f = (t * 0.6 + k / 3) % 1; c.beginPath(); c.ellipse(0, hy + 2 + f * 6, 1.5 + f * 3, 0.5 + f, 0, 0, Math.PI); c.stroke(); }
    }
    // the cave breathes: its cold air shows on chill mornings, its warm air on frosty nights
    if (o.breath > 0) { for (let k = 0; k < 4; k++) { const f = (t * 0.18 + k / 4) % 1; c.fillStyle = `rgba(235,240,245,${0.22 * o.breath * Math.sin(f * Math.PI)})`; c.beginPath(); c.ellipse(hx + Math.sin(t * 0.5 + k) * 2 + f * 4, hy - hh * 0.6 - f * 14, 2 + f * 5, 1.2 + f * 2.4, 0, 0, TAU); c.fill(); } }
    // what the people made of it
    if (o.sealed) { for (let k = 0; k < 7; k++) ell(c, hx - 4 + (k % 4) * 2.7, hy - 1 - Math.floor(k / 4) * 2.8, 1.6, 1.4, k % 2 ? '#8a8276' : '#a29a8c'); }
    if (o.tomb) { c.fillStyle = '#c8a050'; c.fillRect(hx - hw - 0.5, hy - hh - 1, hw * 2 + 1, 1.3); c.fillStyle = '#7a5a2a'; c.fillRect(hx - hw - 1, hy - 0.4, 1.3, 1.6); c.fillRect(hx + hw - 0.3, hy - 0.4, 1.3, 1.6); }
    if (o.oracle) { for (let k = 0; k < 4; k++) { const ph = (t * 0.3 + k / 4) % 1; c.fillStyle = `rgba(214,190,255,${0.35 * (1 - ph)})`; c.beginPath(); c.arc(hx + Math.sin(t + k) * 2, hy - hh - ph * 14, 1.2 + ph * 3, 0, TAU); c.fill(); } ell(c, hx - hw - 1.5, hy + 1, 1.2, 0.7, '#c8683a'); ell(c, hx + hw + 1.5, hy + 1, 1.2, 0.7, '#e8c060'); }
    if (o.mine && kind !== 'poco') { c.strokeStyle = '#7a5530'; c.lineWidth = 1.3; line(c, hx - hw * 0.85, hy + 0.5, hx - hw * 0.85, hy - hh * 0.75); line(c, hx + hw * 0.85, hy + 0.5, hx + hw * 0.85, hy - hh * 0.75); line(c, hx - hw, hy - hh * 0.75, hx + hw, hy - hh * 0.75); }
    if (o.camp && o.night) ell(c, hx, hy - 1, 2.2, 1, 'rgba(255,160,70,0.8)');
    c.restore();
  };
  // daylight falling into a cave from its mouth
  A.shaft = function (c, sx, sy, a, len, kind) {
    const down = kind === 'poco' || kind === 'dolina';
    const g = c.createLinearGradient(0, sy - len, 0, sy);
    g.addColorStop(0, `rgba(255,244,214,0)`); g.addColorStop(0.7, `rgba(255,240,200,${(down ? 0.3 : 0.22) * a})`); g.addColorStop(1, `rgba(255,236,190,${(down ? 0.45 : 0.35) * a})`);
    const w0 = down ? 9 : 6, w1 = down ? 11 : 13;
    c.fillStyle = g; c.beginPath(); c.moveTo(sx - w0, sy - len); c.lineTo(sx + w0, sy - len); c.lineTo(sx + w1, sy + 2); c.lineTo(sx - w1, sy + 2); c.closePath(); c.fill();
    ell(c, sx, sy + 1, w1, w1 * 0.42, `rgba(255,236,190,${0.2 * a})`);
    // leaves and earth fallen in from above
    if (down) { for (let k = 0; k < 6; k++) ell(c, sx + (H(k * 7 + sx) - 0.5) * 16, sy + (H(k * 3 + sy) - 0.5) * 5, 1, 0.5, k % 2 ? 'rgba(110,130,60,0.7)' : 'rgba(120,90,50,0.7)'); }
  };
  const OCHRE_ = OCHRE; void OCHRE_; void shade;
})(window.G);
