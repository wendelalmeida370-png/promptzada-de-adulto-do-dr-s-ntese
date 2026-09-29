// Texturas procedurais desenhadas em canvas (nada é carregado de fora).
import * as THREE from 'three';
import { mulberry32 } from './util.js';

const cache = new Map();
let maxAniso = 4;
export function setMaxAniso(v) { maxAniso = v; }

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function tex(c, size = 1, opts = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = maxAniso;
  t.userData.size = size;
  return t;
}

function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

function speckle(ctx, w, h, rnd, n, color, sMin = 1, sMax = 2, alpha = 0.05) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = alpha * (0.4 + rnd());
    const s = sMin + rnd() * (sMax - sMin);
    ctx.fillRect(rnd() * w, rnd() * h, s, s);
  }
  ctx.globalAlpha = 1;
}

function blotches(ctx, w, h, rnd, n, color, rMin, rMax, alpha) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, r = rMin + rnd() * (rMax - rMin);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', String(alpha * (0.5 + rnd()))));
    g.addColorStop(1, color.replace('A', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// ------------------------------------------------------------------ paredes
export function paint(hex, opts = {}) {
  return cached('paint' + hex + JSON.stringify(opts), () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    const rnd = mulberry32(opts.seed || 7);
    ctx.fillStyle = hex; ctx.fillRect(0, 0, 256, 256);
    speckle(ctx, 256, 256, rnd, 2500, '#000', 1, 2, 0.035);
    speckle(ctx, 256, 256, rnd, 1500, '#fff', 1, 2, 0.03);
    if (opts.mottled) blotches(ctx, 256, 256, rnd, 40, 'rgba(0,0,0,A)', 20, 70, opts.mottled);
    if (opts.stains) {
      blotches(ctx, 256, 256, rnd, 10, 'rgba(60,40,20,A)', 10, 40, opts.stains);
    }
    return tex(c, opts.size || 1.2);
  });
}

// parede roxa do quarto (textura manchada, como no vídeo)
export function purpleWall() {
  return cached('purple', () => {
    const c = canvas(512, 512), ctx = c.getContext('2d');
    const rnd = mulberry32(21);
    ctx.fillStyle = '#6e57a8'; ctx.fillRect(0, 0, 512, 512);
    blotches(ctx, 512, 512, rnd, 90, 'rgba(160,140,210,A)', 20, 90, 0.25);
    blotches(ctx, 512, 512, rnd, 60, 'rgba(40,25,80,A)', 15, 70, 0.25);
    speckle(ctx, 512, 512, rnd, 9000, '#fff', 1, 2, 0.05);
    speckle(ctx, 512, 512, rnd, 5000, '#000', 1, 2, 0.05);
    return tex(c, 1.6);
  });
}

export function wallTile(base = '#dfe3e6', size = 0.3, opts = {}) {
  return cached('wtile' + base + size + JSON.stringify(opts), () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    const rnd = mulberry32(3);
    ctx.fillStyle = opts.grout || '#9aa3a8'; ctx.fillRect(0, 0, 256, 256);
    const n = 2, s = 256 / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const g = ctx.createLinearGradient(x * s, y * s, x * s + s, y * s + s);
      g.addColorStop(0, base); g.addColorStop(1, shade(base, -0.06 + rnd() * 0.04));
      ctx.fillStyle = g;
      ctx.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x * s + 8, y * s + 6, s * 0.5, 4);
    }
    speckle(ctx, 256, 256, rnd, 800, '#000', 1, 2, 0.03);
    return tex(c, size * n);
  });
}

export function floorTile(base = '#d8ccb4', opts = {}) {
  return cached('ftile' + base + JSON.stringify(opts), () => {
    const c = canvas(512, 512), ctx = c.getContext('2d');
    const rnd = mulberry32(opts.seed || 11);
    ctx.fillStyle = opts.grout || '#a8a090'; ctx.fillRect(0, 0, 512, 512);
    if (opts.diagonal) { ctx.translate(256, 256); ctx.rotate(Math.PI / 4); ctx.translate(-362, -362); }
    const s = opts.diagonal ? 181 : 256;
    const n = opts.diagonal ? 4 : 2;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      ctx.fillStyle = shade(base, (rnd() - 0.5) * 0.06);
      ctx.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
      for (let k = 0; k < 6; k++) {
        ctx.strokeStyle = `rgba(120,100,80,${0.05 + rnd() * 0.06})`;
        ctx.lineWidth = 1 + rnd() * 3;
        ctx.beginPath();
        ctx.moveTo(x * s + rnd() * s, y * s + rnd() * s);
        ctx.bezierCurveTo(x * s + rnd() * s, y * s + rnd() * s, x * s + rnd() * s, y * s + rnd() * s, x * s + rnd() * s, y * s + rnd() * s);
        ctx.stroke();
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    speckle(ctx, 512, 512, rnd, 2000, '#000', 1, 2, 0.03);
    return tex(c, opts.size || 1.2);
  });
}

// piso laminado de madeira (sala, corredor e quartos)
export function woodFloor(opts = {}) {
  return cached('wfloor' + JSON.stringify(opts), () => {
    const c = canvas(512, 512), ctx = c.getContext('2d');
    const rnd = mulberry32(opts.seed || 5);
    const planks = 4;
    const ph = 512 / planks;
    const tones = opts.tones || ['#7a4a2c', '#8a5634', '#6d4128', '#94603a', '#7f4f30'];
    for (let r = 0; r < planks; r++) {
      let x = -rnd() * 300;
      while (x < 512) {
        const len = 260 + rnd() * 260;
        ctx.fillStyle = tones[Math.floor(rnd() * tones.length)];
        ctx.fillRect(x, r * ph, len, ph);
        for (let k = 0; k < 16; k++) {
          ctx.strokeStyle = `rgba(40,20,10,${0.08 + rnd() * 0.12})`;
          ctx.lineWidth = 1 + rnd() * 1.5;
          const yy = r * ph + rnd() * ph;
          ctx.beginPath(); ctx.moveTo(x, yy);
          ctx.bezierCurveTo(x + len * 0.3, yy + (rnd() - 0.5) * 8, x + len * 0.6, yy + (rnd() - 0.5) * 8, x + len, yy + (rnd() - 0.5) * 6);
          ctx.stroke();
        }
        if (rnd() < 0.3) {
          ctx.fillStyle = 'rgba(40,20,10,0.25)';
          ctx.beginPath(); ctx.ellipse(x + rnd() * len, r * ph + rnd() * ph, 8 + rnd() * 8, 3 + rnd() * 3, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(20,10,5,0.55)';
        ctx.fillRect(x, r * ph, 2, ph);
        x += len;
      }
      ctx.fillStyle = 'rgba(20,10,5,0.6)';
      ctx.fillRect(0, r * ph, 512, 2);
    }
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, 'rgba(255,220,180,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    return tex(c, opts.size || 2.4);
  });
}

// madeira de móvel
export function woodGrain(base = '#b98a5a', opts = {}) {
  return cached('wgrain' + base + JSON.stringify(opts), () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    const rnd = mulberry32(opts.seed || 9);
    ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = `rgba(60,30,10,${0.05 + rnd() * 0.12})`;
      ctx.lineWidth = 0.5 + rnd() * 2;
      const x = rnd() * 256;
      ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (rnd() - 0.5) * 30, 80, x + (rnd() - 0.5) * 30, 170, x + (rnd() - 0.5) * 20, 256);
      ctx.stroke();
    }
    if (opts.vertical === false) {
      const c2 = canvas(256, 256), x2 = c2.getContext('2d');
      x2.translate(256, 0); x2.rotate(Math.PI / 2); x2.drawImage(c, 0, 0);
      return tex(c2, opts.size || 1);
    }
    return tex(c, opts.size || 1);
  });
}

// porta de madeira com frisos verticais (quartos)
export function doorWood(opts = {}) {
  return cached('door' + JSON.stringify(opts), () => {
    const c = canvas(256, 512), ctx = c.getContext('2d');
    const rnd = mulberry32(opts.seed || 13);
    const base = opts.base || '#6a2f1c';
    ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(30,10,5,${0.06 + rnd() * 0.12})`;
      ctx.lineWidth = 0.5 + rnd() * 2;
      const x = rnd() * 256;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + (rnd() - 0.5) * 20, 170, x + (rnd() - 0.5) * 20, 340, x + (rnd() - 0.5) * 10, 512); ctx.stroke();
    }
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, 'rgba(255,200,160,0.08)'); g.addColorStop(0.5, 'rgba(255,200,160,0.0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 512);
    if (opts.pattern === 'diag') {
      // porta de entrada: frisos diagonais/geométricos
      ctx.strokeStyle = 'rgba(25,10,4,0.75)'; ctx.lineWidth = 3;
      const lines = [[40, 0, 40, 512], [216, 0, 216, 512], [40, 150, 216, 120], [40, 330, 216, 300], [128, 120, 150, 512], [60, 0, 100, 150]];
      for (const [a, b, cc, d] of lines) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(cc, d); ctx.stroke(); }
    } else if (opts.pattern === 'grooves') {
      ctx.strokeStyle = 'rgba(20,8,4,0.7)'; ctx.lineWidth = 3;
      for (const x of [64, 128, 192]) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 472); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(216, 40); ctx.moveTo(40, 472); ctx.lineTo(216, 472); ctx.stroke();
    } else if (opts.pattern === 'old') {
      ctx.strokeStyle = 'rgba(15,5,2,0.8)'; ctx.lineWidth = 4;
      ctx.strokeRect(36, 40, 184, 180); ctx.strokeRect(36, 260, 184, 210);
      blotches(ctx, 256, 512, rnd, 30, 'rgba(0,0,0,A)', 10, 50, 0.3);
    }
    return tex(c, 1, { clamp: true });
  });
}

export function fabric(base = '#6b6b6b', opts = {}) {
  return cached('fabric' + base + JSON.stringify(opts), () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    const rnd = mulberry32(opts.seed || 17);
    ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 2) { ctx.fillStyle = `rgba(0,0,0,${0.03 + rnd() * 0.04})`; ctx.fillRect(0, y, 256, 1); }
    for (let x = 0; x < 256; x += 2) { ctx.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.03})`; ctx.fillRect(x, 0, 1, 256); }
    speckle(ctx, 256, 256, rnd, 1500, '#000', 1, 2, 0.05);
    return tex(c, opts.size || 0.5);
  });
}

// manta azul e branca de padrão geométrico (do sofá)
export function blanket() {
  return cached('blanket', () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#e9eef4'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#2d4f8f'; ctx.lineWidth = 5;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const cx = x * 64 + 32, cy = y * 64 + 32;
      ctx.beginPath(); ctx.moveTo(cx, cy - 24); ctx.lineTo(cx + 24, cy); ctx.lineTo(cx, cy + 24); ctx.lineTo(cx - 24, cy); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = '#35589a'; ctx.fillRect(cx - 4, cy - 4, 8, 8);
    }
    const rnd = mulberry32(4);
    speckle(ctx, 256, 256, rnd, 2000, '#223', 1, 2, 0.08);
    return tex(c, 0.7);
  });
}

export function knit(base = '#233e86') {
  return cached('knit' + base, () => {
    const c = canvas(128, 128), ctx = c.getContext('2d');
    ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 16) for (let x = 0; x < 128; x += 16) {
      const g = ctx.createRadialGradient(x + 8, y + 8, 1, x + 8, y + 8, 10);
      g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = g; ctx.fillRect(x, y, 16, 16);
    }
    return tex(c, 0.25);
  });
}

export function curtain(base = '#bfae96') {
  return cached('curtain' + base, () => {
    const c = canvas(256, 64), ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    for (let i = 0; i <= 8; i++) { g.addColorStop(i / 8, i % 2 ? shade(base, -0.18) : shade(base, 0.06)); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 64);
    return tex(c, 1.2);
  });
}

export function granite() {
  return cached('granite', () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    const rnd = mulberry32(31);
    ctx.fillStyle = '#2a2622'; ctx.fillRect(0, 0, 256, 256);
    speckle(ctx, 256, 256, rnd, 5000, '#8a7a60', 1, 3, 0.35);
    speckle(ctx, 256, 256, rnd, 3000, '#000', 1, 3, 0.4);
    speckle(ctx, 256, 256, rnd, 800, '#c8b89a', 1, 2, 0.4);
    return tex(c, 0.6);
  });
}

// ------------------------------------------------------------------ quadros/artes
// quadro pop-art colorido (homenagem estilizada ao quadro da sala; arte original)
export function popArt(upsideDown = false) {
  return cached('popart' + upsideDown, () => {
    const c = canvas(512, 384), ctx = c.getContext('2d');
    const rnd = mulberry32(99);
    const cols = ['#f5d10c', '#e8327a', '#1ea5e0', '#3cc34a', '#f47a12', '#9b3fd1', '#ffffff', '#ee2b2b'];
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 512, 384);
    // fundo em mosaico com contornos pretos grossos
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
      ctx.beginPath();
      const x = rnd() * 512, y = rnd() * 384;
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) ctx.lineTo(x + (rnd() - 0.5) * 260, y + (rnd() - 0.5) * 220);
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.stroke();
    }
    // duas figuras abraçadas, estilizadas
    const fig = (x, col, hair) => {
      ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.ellipse(x, 150, 58, 66, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(x, 102, 64, 32, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(x - 20, 146, 7, 0, Math.PI * 2); ctx.arc(x + 20, 146, 7, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, 170, 22, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.lineWidth = 7; ctx.fillStyle = cols[Math.floor(rnd() * 6)];
      ctx.beginPath(); ctx.moveTo(x - 70, 384); ctx.lineTo(x - 60, 230); ctx.lineTo(x + 60, 230); ctx.lineTo(x + 70, 384); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 6; k++) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x - 40 + rnd() * 80, 260 + rnd() * 110, 5, 0, Math.PI * 2); ctx.fill(); }
    };
    fig(190, '#f7c89b', '#f47a12');
    fig(330, '#fbe1b0', '#f5d10c');
    ctx.fillStyle = '#e8327a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
    heart(ctx, 260, 60, 26);
    ctx.lineWidth = 16; ctx.strokeStyle = '#fafafa'; ctx.strokeRect(0, 0, 512, 384);
    if (upsideDown) {
      const c2 = canvas(512, 384), x2 = c2.getContext('2d');
      x2.translate(512, 384); x2.rotate(Math.PI); x2.drawImage(c, 0, 0);
      return tex(c2, 1, { clamp: true });
    }
    return tex(c, 1, { clamp: true });
  });
}

function heart(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.4);
  ctx.bezierCurveTo(x - s, y + s, x, y + s * 1.2, x, y + s * 1.6);
  ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s, x + s, y + s * 0.4);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.3);
  ctx.fill(); ctx.stroke();
}

// placa do porta-chaves "Família"
export function keySign(text = 'Família') {
  return cached('keysign' + text, () => {
    const c = canvas(256, 128), ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 256, 128);
    g.addColorStop(0, '#b7875b'); g.addColorStop(1, '#94683f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#5a3a1f'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 122);
    ctx.fillStyle = '#3b2412';
    ctx.font = 'italic 52px "Brush Script MT", "Segoe Script", cursive';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 62);
    heart(Object.assign(ctx, { strokeStyle: '#3b2412', lineWidth: 2 }), 222, 30, 8);
    return tex(c, 1, { clamp: true });
  });
}

// texto simples em etiqueta
export function label(text, opts = {}) {
  return cached('label' + text + JSON.stringify(opts), () => {
    const w = opts.w || 256, hh = opts.h || 64;
    const c = canvas(w, hh), ctx = c.getContext('2d');
    ctx.fillStyle = opts.bg || '#f0ece2'; ctx.fillRect(0, 0, w, hh);
    ctx.fillStyle = opts.fg || '#222';
    ctx.font = opts.font || `bold ${Math.floor(hh * 0.55)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = String(text).split('\n');
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, hh / 2 + (i - (lines.length - 1) / 2) * hh * 0.6 / Math.max(1, lines.length - 0.5)));
    return tex(c, 1, { clamp: true });
  });
}

// papel com rabiscos (nota no mundo)
export function paperNote(seed = 1, color = '#f2eddf') {
  return cached('paper' + seed + color, () => {
    const c = canvas(128, 160), ctx = c.getContext('2d');
    const rnd = mulberry32(seed);
    ctx.fillStyle = color; ctx.fillRect(0, 0, 128, 160);
    ctx.strokeStyle = 'rgba(30,40,120,0.7)'; ctx.lineWidth = 2;
    for (let y = 22; y < 150; y += 14) {
      ctx.beginPath(); let x = 10; ctx.moveTo(x, y);
      while (x < 110 * (0.6 + rnd() * 0.4)) { x += 6; ctx.lineTo(x, y + (rnd() - 0.5) * 4); }
      ctx.stroke();
    }
    return tex(c, 1, { clamp: true });
  });
}

// geladeira com ímãs
export function fridgeDoor(count = 14, seed = 2) {
  return cached('fridge' + count + seed, () => {
    const c = canvas(256, 512), ctx = c.getContext('2d');
    const rnd = mulberry32(seed);
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, '#e9ebea'); g.addColorStop(1, '#d5d8d7');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 512);
    const cols = ['#e33', '#3a3', '#36c', '#fc3', '#f80', '#c3c', '#222', '#0aa', '#fff'];
    for (let i = 0; i < count; i++) {
      const x = 20 + rnd() * 190, y = 40 + rnd() * 260, w = 18 + rnd() * 26, hh = 16 + rnd() * 26;
      ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
      if (rnd() < 0.3) { ctx.beginPath(); ctx.arc(x, y, w / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(x, y, w, hh);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 2, y + hh * 0.6, w * 0.8, 2);
    }
    ctx.fillStyle = '#f2eee2'; ctx.fillRect(150, 300, 70, 90);
    ctx.fillStyle = '#333'; for (let y = 312; y < 380; y += 10) ctx.fillRect(156, y, 40 + rnd() * 16, 2);
    ctx.fillStyle = '#b9bcbb'; ctx.fillRect(20, 200, 8, 120);
    return tex(c, 1, { clamp: true });
  });
}

// bandeira preta com faixa branca diagonal (homenagem discreta; sem escudo)
export function sashFlag() {
  return cached('sashflag', () => {
    const c = canvas(384, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#0c0c0c'; ctx.fillRect(0, 0, 384, 256);
    ctx.save(); ctx.translate(192, 128); ctx.rotate(-0.55);
    ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-300, -26, 600, 52);
    ctx.fillStyle = '#0c0c0c'; ctx.fillRect(-300, -3, 600, 6);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 22px Georgia'; ctx.textAlign = 'right';
    ctx.fillText('1898', 370, 240);
    const rnd = mulberry32(8); speckle(ctx, 384, 256, rnd, 1200, '#fff', 1, 2, 0.04);
    return tex(c, 1, { clamp: true });
  });
}

// ------------------------------------------------------------------ fotos
// foto de família em moldura. faces: 'ok' | 'blank' | 'scratched'
export function familyPhoto(kind = 'ok', people = 5, seed = 1) {
  return cached('fphoto' + kind + people + seed, () => {
    const c = canvas(256, 192), ctx = c.getContext('2d');
    const rnd = mulberry32(seed);
    const g = ctx.createLinearGradient(0, 0, 0, 192);
    g.addColorStop(0, '#9fb6c9'); g.addColorStop(1, '#6f7b62');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 192);
    for (let i = 0; i < people; i++) {
      const x = 30 + i * (196 / Math.max(1, people - 1));
      const hgt = 70 + rnd() * 40;
      ctx.fillStyle = ['#2b3a67', '#8a2b2b', '#2f6b3a', '#6b4a2b', '#111', '#5a3c7a'][i % 6];
      ctx.fillRect(x - 18, 192 - hgt + 30, 36, hgt);
      ctx.fillStyle = '#c69468';
      ctx.beginPath(); ctx.arc(x, 192 - hgt + 16, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1b120b';
      ctx.beginPath(); ctx.arc(x, 192 - hgt + 10, 15, Math.PI, Math.PI * 2); ctx.fill();
      if (kind === 'blank') { ctx.fillStyle = '#e8e4da'; ctx.beginPath(); ctx.arc(x, 192 - hgt + 16, 15, 0, Math.PI * 2); ctx.fill(); }
      if (kind === 'scratched') {
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.moveTo(x - 16 + rnd() * 32, 192 - hgt + rnd() * 30); ctx.lineTo(x - 16 + rnd() * 32, 192 - hgt + rnd() * 30); ctx.stroke(); }
      }
    }
    ctx.fillStyle = 'rgba(255,240,200,0.12)'; ctx.fillRect(0, 0, 256, 192);
    return tex(c, 1, { clamp: true });
  });
}

// foto do aniversário de 5 anos com o palhaço
export function birthdayPhoto(variant = 0) {
  return cached('bday' + variant, () => {
    const c = canvas(256, 192), ctx = c.getContext('2d');
    ctx.fillStyle = '#d7c79f'; ctx.fillRect(0, 0, 256, 192);
    const balloons = ['#e33', '#36c', '#fc3', '#3a3'];
    balloons.forEach((b, i) => { ctx.fillStyle = b; ctx.beginPath(); ctx.ellipse(30 + i * 60, 30, 14, 18, 0, 0, Math.PI * 2); ctx.fill(); });
    // bolo
    ctx.fillStyle = '#f4d3e0'; ctx.fillRect(100, 130, 70, 40);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(108 + i * 12, 118, 3, 12); ctx.fillStyle = '#fb2'; ctx.fillRect(108 + i * 12, 113, 3, 5); }
    // criança de cabelo cacheado
    ctx.fillStyle = '#6b3f26'; ctx.beginPath(); ctx.arc(70, 110, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0f08'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(70 + Math.cos(i) * 16, 104 + Math.sin(i * 1.7) * 10, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#e8327a'; ctx.fillRect(56, 126, 28, 50);
    // palhaço
    const cx = 205;
    ctx.fillStyle = '#e26a1c'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(cx - 20 + (i % 5) * 10, 78 + Math.floor(i / 5) * 40, 10, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#f5f1e8'; ctx.beginPath(); ctx.ellipse(cx, 98, 20, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d11'; ctx.beginPath(); ctx.arc(cx, 100, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d11'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, 104, 11, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#111';
    if (variant === 1) { ctx.fillRect(cx - 9, 90, 5, 3); ctx.fillRect(cx + 1, 90, 5, 3); }
    else { ctx.beginPath(); ctx.arc(cx - 7, 91, 3, 0, Math.PI * 2); ctx.arc(cx + 7, 91, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#243f8f'; ctx.fillRect(cx - 22, 122, 44, 60);
    ctx.fillStyle = '#f5f1e8'; ctx.beginPath(); ctx.arc(cx, 145, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, 145); ctx.lineTo(cx, 137); ctx.moveTo(cx, 145); ctx.lineTo(cx + 6, 147); ctx.stroke();
    ctx.fillStyle = 'rgba(255,200,120,0.18)'; ctx.fillRect(0, 0, 256, 192);
    const rnd = mulberry32(5 + variant); speckle(ctx, 256, 192, rnd, 900, '#000', 1, 2, 0.08);
    return tex(c, 1, { clamp: true });
  });
}

// ------------------------------------------------------------------ céu / cidade
export function nightCity() {
  return cached('city', () => {
    const c = canvas(2048, 512), ctx = c.getContext('2d');
    const rnd = mulberry32(77);
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#05070d'); g.addColorStop(0.55, '#101626'); g.addColorStop(0.8, '#2a2320'); g.addColorStop(1, '#0a0806');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 2048, 512);
    for (let i = 0; i < 300; i++) { ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.5})`; ctx.fillRect(rnd() * 2048, rnd() * 220, 1, 1); }
    let x = 0;
    while (x < 2048) {
      const w = 40 + rnd() * 120, hh = 60 + rnd() * 200;
      ctx.fillStyle = `rgb(${10 + rnd() * 10},${10 + rnd() * 10},${16 + rnd() * 12})`;
      ctx.fillRect(x, 420 - hh, w, hh + 92);
      for (let yy = 420 - hh + 8; yy < 500; yy += 14) for (let xx = x + 6; xx < x + w - 6; xx += 12) {
        if (rnd() < 0.22) { ctx.fillStyle = rnd() < 0.8 ? `rgba(255,${190 + rnd() * 50},${120 + rnd() * 60},${0.5 + rnd() * 0.5})` : 'rgba(170,200,255,0.7)'; ctx.fillRect(xx, yy, 6, 7); }
      }
      x += w + rnd() * 20;
    }
    // copas de árvores escuras
    for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(${8 + rnd() * 10},${16 + rnd() * 14},${8 + rnd() * 8},1)`; ctx.beginPath(); ctx.arc(rnd() * 2048, 470 + rnd() * 50, 30 + rnd() * 50, 0, Math.PI * 2); ctx.fill(); }
    return tex(c, 1);
  });
}

export function moonTex(red = false) {
  return cached('moon' + red, () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    const rnd = mulberry32(12);
    const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
    g.addColorStop(0, red ? 'rgba(255,90,70,1)' : 'rgba(240,236,220,1)');
    g.addColorStop(0.72, red ? 'rgba(220,60,50,1)' : 'rgba(225,220,205,1)');
    g.addColorStop(0.78, red ? 'rgba(160,30,30,0.35)' : 'rgba(200,200,220,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 25; i++) { ctx.fillStyle = `rgba(0,0,0,${0.05 + rnd() * 0.1})`; ctx.beginPath(); ctx.arc(70 + rnd() * 120, 70 + rnd() * 120, 5 + rnd() * 18, 0, Math.PI * 2); ctx.fill(); }
    return tex(c, 1, { clamp: true });
  });
}

// placar do campo iluminado visto da varanda
export function scoreboard() {
  return cached('score', () => {
    const c = canvas(512, 128), ctx = c.getContext('2d');
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffae2a'; ctx.font = 'bold 44px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CASA 0 x 0 VISITANTE', 256, 64);
    return tex(c, 1, { clamp: true });
  });
}

// ------------------------------------------------------------------ caras
export function clownFace() {
  return cached('clown', () => {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#f4efe4'; ctx.fillRect(0, 0, 256, 256);
    // olhos
    ctx.fillStyle = '#1a2f7a';
    ctx.beginPath(); ctx.moveTo(80, 60); ctx.lineTo(96, 130); ctx.lineTo(64, 128); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(176, 60); ctx.lineTo(192, 128); ctx.lineTo(160, 130); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(82, 112, 13, 0, Math.PI * 2); ctx.arc(174, 112, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.arc(84, 113, 7, 0, Math.PI * 2); ctx.arc(176, 113, 7, 0, Math.PI * 2); ctx.fill();
    // boca enorme
    ctx.fillStyle = '#c3121c';
    ctx.beginPath(); ctx.moveTo(40, 160); ctx.quadraticCurveTo(128, 250, 216, 160); ctx.quadraticCurveTo(128, 205, 40, 160); ctx.fill();
    ctx.strokeStyle = '#6a0a0e'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#f7f1dc';
    for (let i = 0; i < 9; i++) { const x = 70 + i * 13; ctx.fillRect(x, 183 + Math.sin(i / 8 * Math.PI) * 10, 8, 10); }
    // rachaduras da maquiagem
    ctx.strokeStyle = 'rgba(90,70,60,0.35)'; ctx.lineWidth = 1;
    const rnd = mulberry32(66);
    for (let i = 0; i < 40; i++) { ctx.beginPath(); const x = rnd() * 256, y = rnd() * 256; ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 30, y + (rnd() - 0.5) * 30); ctx.stroke(); }
    return tex(c, 1, { clamp: true });
  });
}

// rosto do Inquilino: canvas animado (ruído de VHS com fragmentos)
export class EntityFaceTexture {
  constructor() {
    this.c = canvas(128, 160);
    this.ctx = this.c.getContext('2d');
    this.texture = tex(this.c, 1, { clamp: true });
    this.t = 0;
    this.draw(0);
  }
  draw(dt, intensity = 1) {
    this.t += dt;
    const ctx = this.ctx, w = 128, hh = 160;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, hh);
    const img = ctx.getImageData(0, 0, w, hh);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const y = Math.floor(i / 4 / w);
      const v = Math.random() < 0.5 ? Math.random() * 90 * intensity : 0;
      const band = Math.sin(y * 0.3 + this.t * 20) > 0.93 ? 80 : 0;
      d[i] = d[i + 1] = d[i + 2] = v + band;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // olhos fundos e boca rasgada
    const jit = () => (Math.random() - 0.5) * 3 * intensity;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(40 + jit(), 64 + jit(), 9, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(88 + jit(), 64 + jit(), 9, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(40 + jit(), 64, 3, 0, Math.PI * 2); ctx.arc(88 + jit(), 64, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(24, 112 + jit());
    for (let x = 24; x <= 104; x += 8) ctx.lineTo(x, 112 + (x % 16 ? 8 : -2) + jit());
    ctx.stroke();
    this.texture.needsUpdate = true;
  }
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  r = f(r); g = f(g); b = f(b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// desenha ícones de itens (inventário) em canvas 2D
export function drawIcon(ctx, id, s) {
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.scale(s / 100, s / 100);
  ctx.lineWidth = 3; ctx.strokeStyle = '#111';
  const f = (c) => { ctx.fillStyle = c; };
  switch (id) {
    case 'carregador': f('#eee'); ctx.fillRect(30, 20, 30, 34); ctx.strokeRect(30, 20, 30, 34); f('#999'); ctx.fillRect(38, 10, 4, 10); ctx.fillRect(48, 10, 4, 10); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(45, 54); ctx.bezierCurveTo(45, 90, 80, 60, 80, 90); ctx.stroke(); break;
    case 'banquinho': f('#9a6a3a'); ctx.beginPath(); ctx.ellipse(50, 30, 30, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillRect(28, 32, 6, 55); ctx.fillRect(66, 32, 6, 55); ctx.fillRect(47, 36, 6, 50); break;
    case 'racao': f('#d9632a'); ctx.fillRect(28, 18, 44, 66); ctx.strokeRect(28, 18, 44, 66); f('#fff'); ctx.beginPath(); ctx.arc(50, 50, 12, 0, Math.PI * 2); ctx.fill(); f('#111'); ctx.font = 'bold 12px sans-serif'; ctx.fillText('CAT', 38, 78); break;
    case 'chave_velha': f('#8a6a3a'); ctx.beginPath(); ctx.arc(30, 50, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillRect(42, 46, 44, 8); ctx.fillRect(74, 54, 6, 12); ctx.fillRect(82, 54, 5, 8); f('#111'); ctx.beginPath(); ctx.arc(30, 50, 5, 0, Math.PI * 2); ctx.fill(); break;
    case 'fone': ctx.strokeStyle = '#eee'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(30, 30); ctx.bezierCurveTo(30, 70, 70, 60, 50, 90); ctx.moveTo(70, 30); ctx.bezierCurveTo(70, 70, 40, 60, 50, 90); ctx.stroke(); f('#fff'); ctx.beginPath(); ctx.arc(30, 26, 8, 0, Math.PI * 2); ctx.arc(70, 26, 8, 0, Math.PI * 2); ctx.fill(); break;
    case 'caixinha': f('#6b2b3a'); ctx.fillRect(20, 40, 60, 40); ctx.strokeRect(20, 40, 60, 40); f('#d8b27a'); ctx.fillRect(20, 36, 60, 8); ctx.beginPath(); ctx.arc(50, 60, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(80, 56, 12, 4); break;
    case 'gelo': f('rgba(190,230,255,0.9)'); ctx.fillRect(22, 24, 56, 52); ctx.strokeRect(22, 24, 56, 52); f('#c9a23a'); ctx.fillRect(40, 44, 22, 5); ctx.beginPath(); ctx.arc(38, 46, 6, 0, Math.PI * 2); ctx.fill(); break;
    case 'chaves_mae': f('#c9a23a'); ctx.beginPath(); ctx.arc(34, 40, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillRect(40, 38, 40, 6); ctx.fillRect(36, 50, 6, 36); f('#e8327a'); heart(ctx, 70, 64, 10); break;
    case 'pendrive': f('#222'); ctx.fillRect(30, 30, 30, 50); f('#bbb'); ctx.fillRect(36, 18, 18, 14); f('#fff'); ctx.font = '10px sans-serif'; ctx.fillText('FESTA', 31, 58); break;
    case 'chave_pai': f('#aaa'); ctx.beginPath(); ctx.arc(34, 50, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillRect(44, 46, 40, 8); ctx.fillRect(72, 54, 5, 10); f('#d8c38a'); ctx.beginPath(); ctx.ellipse(34, 26, 20, 7, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'registro': f('#999'); ctx.beginPath(); ctx.arc(50, 50, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); f('#c33'); ctx.fillRect(46, 20, 8, 60); ctx.fillRect(20, 46, 60, 8); break;
    case 'relogio_ovo': f('#e9dcc0'); ctx.beginPath(); ctx.ellipse(50, 54, 26, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); f('#c9a23a'); ctx.beginPath(); ctx.arc(50, 18, 6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.arc(50, 56, 14, 0, Math.PI * 2); ctx.stroke(); break;
    case 'powerbank': f('#1d1d22'); ctx.fillRect(28, 20, 44, 64); ctx.strokeRect(28, 20, 44, 64); f('#4c4'); ctx.fillRect(36, 30, 6, 6); ctx.fillRect(46, 30, 6, 6); ctx.fillRect(56, 30, 6, 6); break;
    case 'foto_festa': f('#eee'); ctx.fillRect(18, 22, 64, 56); f('#d7c79f'); ctx.fillRect(22, 26, 56, 40); f('#e26a1c'); ctx.beginPath(); ctx.arc(64, 42, 8, 0, Math.PI * 2); ctx.fill(); f('#f5f1e8'); ctx.beginPath(); ctx.arc(64, 46, 6, 0, Math.PI * 2); ctx.fill(); break;
    case 'chapeu': f('#d8c38a'); ctx.beginPath(); ctx.ellipse(50, 62, 40, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillRect(30, 36, 40, 26); f('#333'); ctx.fillRect(30, 52, 40, 6); break;
    default: f('#777'); ctx.fillRect(25, 25, 50, 50);
  }
  ctx.restore();
}
