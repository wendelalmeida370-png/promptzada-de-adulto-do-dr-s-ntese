// Móveis e objetos da casa (low-poly estilizado, inspirados nos vídeos).
import * as THREE from 'three';
import { box, cyl, sphere, plane, group, MATS, std, texMat, basic, compact } from './geom.js';
import * as TX from '../core/textures.js';

export function sofa(g, w = 2.6) {
  const d = 0.95;
  box(g, w, 0.42, d, MATS.sofa, 0, 0.21, 0);
  box(g, w, 0.55, 0.22, MATS.sofa, 0, 0.62, -d / 2 + 0.11);
  box(g, 0.2, 0.62, d, MATS.sofa, -w / 2 + 0.1, 0.31, 0);
  box(g, 0.2, 0.62, d, MATS.sofa, w / 2 - 0.1, 0.31, 0);
  // almofadas do encosto (fofas, como no vídeo)
  for (let i = 0; i < 3; i++) {
    const c = box(g, w / 3 - 0.12, 0.42, 0.2, MATS.sofa, -w / 3 + i * (w / 3), 0.72, -d / 2 + 0.3);
    c.rotation.x = -0.18;
  }
  // manta estampada azul e branca
  const b = box(g, w * 0.55, 0.03, d * 0.95, MATS.blanket, w * 0.15, 0.435, 0.03);
  b.rotation.z = 0.01;
  box(g, w * 0.55, 0.3, 0.03, MATS.blanket, w * 0.15, 0.3, d / 2 + 0.01);
  return g;
}

export function rack(g, w = 2.4) {
  const h = 0.55, d = 0.42;
  box(g, w, 0.04, d, MATS.oak, 0, h, 0);
  box(g, w, 0.04, d, MATS.oak, 0, 0.12, 0);
  box(g, 0.04, h - 0.1, d, MATS.oak, -w / 2 + 0.02, h / 2 + 0.06, 0);
  box(g, 0.04, h - 0.1, d, MATS.oak, w / 2 - 0.02, h / 2 + 0.06, 0);
  box(g, 0.04, h - 0.1, d, MATS.oak, 0, h / 2 + 0.06, 0);
  // portas creme
  box(g, w / 2 - 0.08, h - 0.16, 0.02, MATS.cream, w / 4, h / 2 + 0.06, d / 2);
  box(g, w / 4 - 0.06, h - 0.16, 0.02, MATS.cream, -w / 2 + w / 8 + 0.02, h / 2 + 0.06, d / 2);
  // pés palito
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.018, 0.012, 0.12, MATS.oakDark, sx * (w / 2 - 0.08), 0.06, sz * (d / 2 - 0.06), { seg: 6 });
  return g;
}

export function tv(g, w = 1.3) {
  const h = w * 0.58;
  box(g, w + 0.03, h + 0.03, 0.05, MATS.black, 0, 0, 0);
  const screen = plane(g, w, h, MATS.screenOff, 0, 0, 0.027, { uv: false });
  return screen;
}

export function ceilingFan(g) {
  cyl(g, 0.02, 0.02, 0.25, MATS.whiteFurn, 0, -0.12, 0, { seg: 8 });
  cyl(g, 0.16, 0.2, 0.1, MATS.whiteFurn, 0, -0.28, 0);
  const bulb = sphere(g, 0.16, basic('#fff6e6'), 0, -0.36, 0, { sy: 0.55, cast: false });
  const blades = group(g, 0, -0.26, 0);
  for (let i = 0; i < 3; i++) {
    const b = box(blades, 0.55, 0.012, 0.13, MATS.whiteFurn, 0.42, 0, 0, { cast: false });
    const holder = group(blades, 0, 0, 0, (i * Math.PI * 2) / 3);
    holder.add(b);
  }
  return { blades, bulb };
}

export function bike(g) {
  const frame = std('#161616', { roughness: 0.4, metalness: 0.4 });
  const tire = std('#0b0b0b', { roughness: 0.9 });
  const fender = std('#e8e8e8', { roughness: 0.3 });
  const r = 0.33;
  for (const x of [-0.52, 0.52]) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 8, 28), tire);
    t.position.set(x, r + 0.02, 0); t.castShadow = true; g.add(t);
    for (let i = 0; i < 8; i++) { const s = box(g, 0.005, r * 2, 0.005, MATS.metal, x, r + 0.02, 0, { cast: false }); s.rotation.z = (i * Math.PI) / 8; }
    const f = new THREE.Mesh(new THREE.TorusGeometry(r + 0.05, 0.02, 4, 16, Math.PI * 0.8), fender);
    f.position.set(x, r + 0.02, 0); f.rotation.z = Math.PI * 0.1; g.add(f);
  }
  const tube = (x1, y1, x2, y2, rad = 0.018) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = cyl(g, rad, rad, len, frame, (x1 + x2) / 2, (y1 + y2) / 2, 0, { seg: 8 });
    m.rotation.z = Math.atan2(x2 - x1, y1 - y2);
  };
  tube(-0.52, 0.35, -0.05, 0.38); tube(-0.05, 0.38, -0.15, 0.78); tube(-0.15, 0.78, 0.38, 0.72);
  tube(-0.05, 0.38, 0.38, 0.72); tube(0.38, 0.72, 0.52, 0.35); tube(0.38, 0.72, 0.36, 0.95);
  tube(-0.52, 0.35, -0.15, 0.78);
  box(g, 0.05, 0.02, 0.5, frame, 0.34, 0.97, 0);
  box(g, 0.24, 0.06, 0.12, std('#222'), -0.17, 0.84, 0);
  box(g, 0.35, 0.015, 0.14, frame, -0.48, 0.72, 0); // bagageiro
  return compact(g);
}

export function stool(g, h = 0.45) {
  cyl(g, 0.16, 0.16, 0.04, MATS.rustic, 0, h, 0, { seg: 18 });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const l = cyl(g, 0.018, 0.022, h, MATS.rustic, Math.cos(a) * 0.1, h / 2, Math.sin(a) * 0.1, { seg: 6 });
    l.rotation.z = Math.cos(a) * 0.12; l.rotation.x = -Math.sin(a) * 0.12;
  }
  return compact(g);
}

export function foldingChair(g) {
  const m = std('#b8bcc0', { metalness: 0.6, roughness: 0.35 });
  const fab = std('#6d1d2a', { roughness: 0.9 });
  box(g, 0.02, 0.9, 0.02, m, -0.22, 0.45, 0); box(g, 0.02, 0.9, 0.02, m, 0.22, 0.45, 0);
  box(g, 0.44, 0.02, 0.02, m, 0, 0.9, 0); box(g, 0.44, 0.02, 0.02, m, 0, 0.1, 0);
  box(g, 0.42, 0.45, 0.01, fab, 0, 0.55, 0.012);
  return compact(g);
}

export function painting(g, upsideDown = false) {
  box(g, 1.02, 0.78, 0.04, MATS.whiteFurn, 0, 0, 0);
  plane(g, 0.96, 0.72, texMat(TX.popArt(upsideDown), { roughness: 0.5 }), 0, 0, 0.021, { uv: false });
  return g;
}

export function keyHolder(g, keys = 5, extra = false) {
  plane(g, 0.3, 0.15, texMat(TX.keySign(), { roughness: 0.7 }), 0, 0.06, 0.012, { uv: false });
  box(g, 0.31, 0.16, 0.02, MATS.oakDark, 0, 0.06, 0);
  const hooks = extra ? 6 : 5;
  const out = [];
  for (let i = 0; i < hooks; i++) {
    const x = -0.12 + i * (0.24 / (hooks - 1));
    cyl(g, 0.005, 0.005, 0.03, MATS.chrome, x, -0.03, 0.02, { rx: Math.PI / 2, seg: 6, cast: false });
    if (i < keys) {
      const k = group(g, x, -0.06, 0.03);
      const old = extra && i === hooks - 1;
      box(k, 0.012, 0.06, 0.003, old ? std('#7a5a2a', { metalness: 0.5, roughness: 0.6 }) : MATS.chrome, 0, -0.02, 0, { cast: false });
      const tagCol = ['#e8327a', '#2d4f8f', '#111', '#f5d10c', '#3cc34a', '#5a3a1f'][i];
      sphere(k, 0.013, std(tagCol), 0, -0.065, 0, { seg: 8, seg2: 6, cast: false });
      out.push(k);
    }
  }
  return out;
}

export function intercom(g) {
  box(g, 0.1, 0.22, 0.05, MATS.whiteFurn, 0, 0, 0);
  const handset = box(g, 0.06, 0.2, 0.05, std('#f4f4f2', { roughness: 0.4 }), 0.0, 0.01, 0.05);
  const cord = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.004, 4, 20), MATS.whiteFurn);
  for (let i = 0; i < 5; i++) { const c = cord.clone(); c.position.set(0, -0.12 - i * 0.02, 0.05); c.rotation.x = Math.PI / 2; g.add(c); }
  return handset;
}

export function breakerBox(g) {
  box(g, 0.36, 0.46, 0.08, MATS.whiteFurn, 0, 0, 0);
  const inner = group(g, 0, 0, 0.041);
  box(inner, 0.32, 0.42, 0.005, MATS.blackMatte, 0, 0, 0, { cast: false });
  const switches = [];
  for (let i = 0; i < 6; i++) {
    const s = box(inner, 0.035, 0.06, 0.03, std('#dcdcdc'), -0.1 + (i % 3) * 0.1, 0.1 - Math.floor(i / 3) * 0.16, 0.015);
    switches.push(s);
  }
  return { inner, switches };
}

export function whiteTable(g) {
  box(g, 0.9, 0.03, 0.5, MATS.whiteFurn, 0, 0.74, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.03, 0.74, 0.03, MATS.whiteFurn, sx * 0.42, 0.37, sz * 0.22);
  // bolsa preta, pote de tampa vermelha e caixa plástica (do vídeo)
  box(g, 0.3, 0.2, 0.14, MATS.black, -0.2, 0.86, 0);
  cyl(g, 0.05, 0.05, 0.14, std('#d8c8a8', { transparent: true, opacity: 0.7 }), 0.12, 0.83, 0.05, { seg: 12 });
  cyl(g, 0.052, 0.052, 0.03, std('#c62828'), 0.12, 0.915, 0.05, { seg: 12 });
  box(g, 0.16, 0.18, 0.14, std('#e0e6ea', { transparent: true, opacity: 0.65 }), 0.3, 0.84, -0.08);
  return g;
}

export function sideTable(g) {
  cyl(g, 0.2, 0.2, 0.03, MATS.oak, 0, 0.55, 0, { seg: 18 });
  for (let i = 0; i < 3; i++) { const a = i * 2.1; cyl(g, 0.015, 0.015, 0.55, MATS.oakDark, Math.cos(a) * 0.14, 0.275, Math.sin(a) * 0.14, { seg: 6 }); }
  cyl(g, 0.04, 0.035, 0.18, MATS.chrome, 0.05, 0.66, 0.02, { seg: 12 });
  return g;
}

export function fridge(g) {
  const body = std('#e6e8e7', { roughness: 0.35 });
  const liner = std('#f4f6f7', { roughness: 0.6 });
  box(g, 0.68, 1.75, 0.03, body, 0, 0.875, -0.315);
  box(g, 0.03, 1.75, 0.66, body, -0.325, 0.875, 0);
  box(g, 0.03, 1.75, 0.66, body, 0.325, 0.875, 0);
  box(g, 0.68, 0.03, 0.66, body, 0, 1.735, 0);
  box(g, 0.68, 0.1, 0.66, body, 0, 0.05, 0);
  box(g, 0.64, 0.04, 0.62, liner, 0, 1.2, 0);
  box(g, 0.62, 1.6, 0.01, liner, 0, 0.9, -0.295, { cast: false });
  box(g, 0.66, 0.06, 0.02, std('#555'), 0, 0.05, 0.33);
  return g;
}

export function counter(g, len, opts = {}) {
  const h = 0.88, d = 0.6;
  box(g, len, h - 0.04, d - 0.05, MATS.whiteFurn, 0, (h - 0.04) / 2, -0.025);
  box(g, len + 0.02, 0.04, d, MATS.granite, 0, h - 0.02, 0);
  // portas de armário
  const n = Math.round(len / 0.45);
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (len / n);
    box(g, len / n - 0.02, h - 0.2, 0.015, MATS.oakDark, x, (h - 0.04) / 2 + 0.02, d / 2 - 0.045, { cast: false });
    box(g, 0.1, 0.012, 0.02, MATS.chrome, x, h - 0.2, d / 2 - 0.03, { cast: false });
  }
  box(g, len, 0.08, 0.02, std('#222'), 0, 0.04, d / 2 - 0.06);
  if (opts.sink !== undefined) {
    const s = group(g, opts.sink, h, 0);
    box(s, 0.5, 0.02, 0.38, MATS.chrome, 0, 0.002, 0, { cast: false });
    box(s, 0.44, 0.02, 0.32, std('#666', { metalness: 0.8, roughness: 0.3 }), 0, -0.05, 0, { cast: false });
    cyl(s, 0.012, 0.012, 0.28, MATS.chrome, 0, 0.14, -0.2, { seg: 8 });
    box(s, 0.02, 0.02, 0.16, MATS.chrome, 0, 0.28, -0.13);
    // escorredor de louça
    box(s, 0.34, 0.14, 0.24, std('#dcdcdc', { roughness: 0.4 }), 0.52, 0.08, 0.02);
    for (let i = 0; i < 5; i++) { const p = cyl(s, 0.1, 0.1, 0.01, MATS.porcelain, 0.42 + i * 0.045, 0.16, 0.02, { rz: Math.PI / 2, seg: 16 }); p.rotation.x = 0.2; }
  }
  if (opts.stove !== undefined) {
    const s = group(g, opts.stove, h + 0.01, 0);
    box(s, 0.56, 0.02, 0.5, std('#1a1a1a', { roughness: 0.2, metalness: 0.3 }), 0, 0.01, 0);
    for (const [x, z] of [[-0.14, -0.1], [0.14, -0.1], [-0.14, 0.12], [0.14, 0.12]]) cyl(s, 0.07, 0.07, 0.015, std('#333', { metalness: 0.6 }), x, 0.025, z, { seg: 14 });
  }
  return g;
}

export function upperCabinets(g, len) {
  const h = 0.62, d = 0.34;
  const n = Math.round(len / 0.5);
  box(g, len, h, d - 0.02, MATS.whiteFurn, 0, 0, -0.01);
  const leaves = [];
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (len / n);
    leaves.push({ x, w: len / n - 0.02 });
  }
  return { h, d, leaves };
}

export function microwave(g) {
  box(g, 0.5, 0.3, 0.36, std('#e2e2e2', { roughness: 0.4 }), 0, 0.15, 0);
  box(g, 0.33, 0.22, 0.01, std('#111', { roughness: 0.2, metalness: 0.2 }), -0.06, 0.15, 0.181);
  const display = plane(g, 0.09, 0.035, basic('#0a2a0a'), 0.17, 0.22, 0.182, { uv: false });
  return display;
}

export function washer(g) {
  box(g, 0.62, 0.95, 0.62, std('#eeeeec', { roughness: 0.35 }), 0, 0.475, 0);
  cyl(g, 0.22, 0.22, 0.02, std('#8aa0aa', { transparent: true, opacity: 0.6, roughness: 0.1 }), 0, 0.96, 0.02, { seg: 20 });
  box(g, 0.6, 0.1, 0.06, std('#dcdcdc'), 0, 1.0, -0.28);
  return g;
}

export function tank(g) {
  box(g, 0.55, 0.14, 0.5, std('#cfcfcb', { roughness: 0.5 }), 0, 0.82, 0);
  box(g, 0.08, 0.82, 0.08, std('#cfcfcb'), 0, 0.41, -0.15);
  cyl(g, 0.012, 0.012, 0.2, MATS.chrome, 0, 1.0, -0.24, { seg: 8 });
  return g;
}

export function broom(g) {
  const s = cyl(g, 0.012, 0.012, 1.3, std('#caa46a'), 0, 0.65, 0, { seg: 6 });
  s.rotation.z = 0.18;
  box(g, 0.3, 0.06, 0.06, std('#c0392b'), -0.11, 0.04, 0);
  return g;
}

export function shelf(g, w, levels = 3, d = 0.35) {
  for (let i = 0; i < levels; i++) box(g, w, 0.025, d, MATS.whiteFurn, 0, 0.5 + i * 0.5, 0);
  box(g, 0.025, 0.5 * levels + 0.1, d, MATS.whiteFurn, -w / 2, 0.25 * levels + 0.05, 0);
  box(g, 0.025, 0.5 * levels + 0.1, d, MATS.whiteFurn, w / 2, 0.25 * levels + 0.05, 0);
  return g;
}

export function bed(g, w, l, sheet, blanket) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.06, 0.3, 0.06, MATS.oakDark, sx * (w / 2 - 0.02), 0.15, sz * (l / 2 - 0.02));
  box(g, w + 0.06, 0.1, l + 0.06, MATS.oakDark, 0, 0.35, 0);
  box(g, w, 0.2, l, MATS.whiteFurn, 0, 0.5, 0);
  box(g, w + 0.02, 0.03, l + 0.02, sheet, 0, 0.605, 0);
  box(g, w * 0.7, 0.1, 0.32, MATS.sheetWhite, 0, 0.67, -l / 2 + 0.22);
  if (blanket) {
    const b = box(g, w + 0.06, 0.06, l * 0.62, blanket, 0, 0.64, l * 0.18);
    b.rotation.z = 0.015;
    box(g, 0.03, 0.34, l * 0.62, blanket, w / 2 + 0.03, 0.48, l * 0.18);
  }
  box(g, w + 0.1, 0.9, 0.05, MATS.oakDark, 0, 0.45, -l / 2 - 0.03);
  return g;
}

// guarda-roupa com portas (Leafs criadas por fora)
export function wardrobeBody(g, w, h, d, mat) {
  box(g, w, h, 0.02, mat, 0, h / 2, -d / 2 + 0.01);
  box(g, 0.02, h, d, mat, -w / 2 + 0.01, h / 2, 0);
  box(g, 0.02, h, d, mat, w / 2 - 0.01, h / 2, 0);
  box(g, w, 0.02, d, mat, 0, h - 0.01, 0);
  box(g, w, 0.08, d, mat, 0, 0.04, 0);
  box(g, w - 0.04, 0.02, d - 0.04, mat, 0, h * 0.72, 0, { cast: false });
  cyl(g, 0.012, 0.012, w - 0.06, MATS.chrome, 0, h * 0.68, 0, { rz: Math.PI / 2, seg: 6 });
  // roupas penduradas
  const cols = ['#222', '#6a1d2a', '#2b3a67', '#e2e0da', '#3f5d3a', '#111'];
  for (let i = 0; i < Math.floor(w / 0.12); i++) {
    box(g, 0.04, 0.7, d * 0.7, std(cols[i % cols.length], { roughness: 1 }), -w / 2 + 0.1 + i * 0.12, h * 0.68 - 0.38, 0, { cast: false });
  }
  return g;
}

export function dresser(g, w, h, d, n = 4) {
  box(g, w, h, d - 0.02, MATS.whiteFurn, 0, h / 2, -0.01);
  box(g, w + 0.02, 0.02, d, MATS.whiteFurn, 0, h + 0.01, 0);
  return { rowH: (h - 0.08) / n };
}

export function vanity(g) {
  box(g, 0.9, 0.03, 0.45, MATS.whiteFurn, 0, 0.75, 0);
  box(g, 0.03, 0.74, 0.43, MATS.whiteFurn, -0.43, 0.37, 0);
  box(g, 0.3, 0.74, 0.43, MATS.whiteFurn, 0.3, 0.37, 0);
  // produtos de maquiagem coloridos
  const cols = ['#e8327a', '#fff', '#f5d10c', '#3cc34a', '#9b3fd1', '#1ea5e0', '#f47a12'];
  for (let i = 0; i < 9; i++) cyl(g, 0.02 + (i % 3) * 0.008, 0.02, 0.06 + (i % 4) * 0.04, std(cols[i % cols.length], { roughness: 0.4 }), -0.35 + i * 0.07, 0.8 + (i % 4) * 0.02, 0.1 - (i % 2) * 0.08, { seg: 8 });
  return g;
}

export function desk(g, w, d, mat) {
  box(g, w, 0.035, d, mat, 0, 0.74, 0);
  box(g, 0.03, 0.74, d, mat, -w / 2 + 0.015, 0.37, 0);
  box(g, 0.03, 0.74, d, mat, w / 2 - 0.015, 0.37, 0);
  box(g, w, 0.35, 0.02, mat, 0, 0.55, -d / 2 + 0.01);
  return g;
}

export function laptop(g) {
  const base = box(g, 0.36, 0.02, 0.25, std('#2a2a2e', { metalness: 0.4, roughness: 0.4 }), 0, 0.01, 0);
  const lid = group(g, 0, 0.02, -0.12);
  lid.rotation.x = -0.25;
  box(lid, 0.36, 0.24, 0.012, std('#2a2a2e', { metalness: 0.4, roughness: 0.4 }), 0, 0.12, 0);
  const screen = plane(lid, 0.33, 0.2, basic('#0a0c10'), 0, 0.125, 0.0075, { uv: false });
  return { base, lid, screen };
}

export function officeChair(g) {
  const b = std('#161616', { roughness: 0.6 });
  box(g, 0.46, 0.08, 0.46, b, 0, 0.48, 0);
  box(g, 0.44, 0.55, 0.06, b, 0, 0.8, -0.22);
  cyl(g, 0.03, 0.03, 0.4, MATS.metal, 0, 0.26, 0, { seg: 8 });
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; box(g, 0.3, 0.03, 0.04, b, Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15, { ry: -a }); }
  return compact(g);
}

export function ac(g) {
  const b = box(g, 0.85, 0.28, 0.2, std('#efeee8', { roughness: 0.4 }), 0, 0, 0);
  box(g, 0.75, 0.03, 0.02, std('#bbb'), 0, -0.1, 0.1);
  return b;
}

export function curtains(g, w, h, mat, openness = 0.35) {
  const pieces = [];
  const cw = w * (0.5 - openness / 2) + 0.12;
  cyl(g, 0.012, 0.012, w + 0.3, MATS.metal, 0, h + 0.05, 0, { rz: Math.PI / 2, seg: 6 });
  for (const side of [-1, 1]) {
    const geo = new THREE.PlaneGeometry(cw, h, 12, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 26) * 0.035);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.position.set(side * (w / 2 - cw / 2 + 0.12), h / 2 + 0.03, 0.02);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    pieces.push(m);
  }
  return pieces;
}

export function windowFrame(g, w, h, opts = {}) {
  const fr = std(opts.frame || '#d8d8d4', { roughness: 0.4, metalness: 0.3 });
  box(g, w, 0.04, 0.08, fr, 0, 0, 0); box(g, w, 0.04, 0.08, fr, 0, h, 0);
  box(g, 0.04, h, 0.08, fr, -w / 2, h / 2, 0); box(g, 0.04, h, 0.08, fr, w / 2, h / 2, 0);
  if (opts.louver) {
    for (let y = 0.08; y < h - 0.04; y += 0.1) { const l = box(g, w - 0.06, 0.08, 0.01, std('#b8c4c8', { transparent: true, opacity: 0.55, roughness: 0.2 }), 0, y, 0, { cast: false }); l.rotation.x = 0.5; }
  } else {
    box(g, 0.03, h, 0.05, fr, 0, h / 2, 0);
    box(g, w, h, 0.01, MATS.glass, 0, h / 2, 0, { cast: false });
  }
  if (opts.bars) for (let x = -w / 2 + 0.12; x < w / 2; x += 0.14) cyl(g, 0.01, 0.01, h, std('#222', { metalness: 0.5 }), x, h / 2, 0.08, { seg: 6 });
  return g;
}

export function toilet(g) {
  const p = MATS.porcelain;
  cyl(g, 0.17, 0.14, 0.38, p, 0, 0.19, 0.05, { seg: 16 });
  const seat = cyl(g, 0.2, 0.2, 0.04, p, 0, 0.4, 0.07, { seg: 18 });
  seat.scale.z = 1.25;
  const lid = box(g, 0.36, 0.03, 0.44, std('#e2d8a8', { roughness: 0.5 }), 0, 0.44, 0.07); // tampa amarelada (como no vídeo)
  lid.rotation.x = 0.05;
  box(g, 0.42, 0.36, 0.18, p, 0, 0.6, -0.22);
  cyl(g, 0.06, 0.06, 0.1, MATS.whiteFurn, 0.08, 0.83, -0.22, { seg: 10 }); // rolo de papel
  cyl(g, 0.025, 0.03, 0.12, std('#f2c500'), -0.1, 0.84, -0.22, { seg: 8 });
  return g;
}

export function sinkUnit(g) {
  box(g, 0.55, 0.12, 0.42, MATS.porcelain, 0, 0.82, 0);
  box(g, 0.1, 0.8, 0.1, MATS.porcelain, 0, 0.4, -0.08);
  cyl(g, 0.012, 0.012, 0.18, MATS.chrome, 0, 0.96, -0.16, { seg: 8 });
  return g;
}

export function catBowl(g, color) {
  const m = std(color, { roughness: 0.35 });
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.075, 0.06, 20, 1, true), m);
  outer.position.y = 0.03; g.add(outer);
  cyl(g, 0.075, 0.075, 0.005, m, 0, 0.003, 0, { seg: 20 });
  const food = cyl(g, 0.085, 0.085, 0.02, std('#7a4a22', { roughness: 1 }), 0, 0.035, 0, { seg: 16 });
  food.visible = false;
  return food;
}

export function wallClock(g, time = 3.55) {
  cyl(g, 0.16, 0.16, 0.03, std('#f2f0e8'), 0, 0, 0, { rx: Math.PI / 2, seg: 24 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 6, 24), std('#222'));
  g.add(rim);
  const hour = group(g, 0, 0, 0.02), minute = group(g, 0, 0, 0.022);
  box(hour, 0.012, 0.09, 0.005, std('#111'), 0, 0.045, 0, { cast: false });
  box(minute, 0.008, 0.13, 0.005, std('#111'), 0, 0.065, 0, { cast: false });
  const set = (t) => { hour.rotation.z = -((t % 12) / 12) * Math.PI * 2; minute.rotation.z = -((t % 1)) * Math.PI * 2; };
  set(time);
  return { hour, minute, set };
}

export function hat(g) {
  const straw = std('#d8c38a', { roughness: 0.9 });
  const brim = cyl(g, 0.22, 0.22, 0.015, straw, 0, 0, 0, { seg: 20 });
  cyl(g, 0.11, 0.12, 0.11, straw, 0, 0.06, 0, { seg: 16 });
  cyl(g, 0.121, 0.121, 0.025, std('#222'), 0, 0.02, 0, { seg: 16 });
  return brim;
}

export function photoFrame(g, texture, w = 0.2, h = 0.15, standing = true) {
  box(g, w + 0.03, h + 0.03, 0.015, MATS.oakDark, 0, 0, 0);
  const pic = plane(g, w, h, texMat(texture, { roughness: 0.6 }), 0, 0, 0.009, { uv: false });
  if (standing) { const s = box(g, 0.02, h * 0.8, 0.01, MATS.oakDark, 0, -0.02, -0.05); s.rotation.x = 0.4; }
  return pic;
}

export function backpack(g, color) {
  box(g, 0.3, 0.4, 0.16, std(color, { roughness: 0.9 }), 0, 0.2, 0);
  box(g, 0.24, 0.18, 0.06, std(color, { roughness: 0.9 }), 0, 0.14, 0.1);
  return g;
}

export function skates(g) {
  for (const x of [-0.08, 0.08]) {
    box(g, 0.1, 0.18, 0.26, std('#161616'), x, 0.14, 0);
    for (let i = 0; i < 4; i++) cyl(g, 0.03, 0.03, 0.02, std('#e33'), x, 0.03, -0.1 + i * 0.066, { rz: Math.PI / 2, seg: 10 });
  }
  return g;
}

export function towel(g, w, h, color) {
  const geo = new THREE.PlaneGeometry(w, h, 6, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getY(i) * 12) * 0.01 + Math.sin(pos.getX(i) * 9) * 0.01);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, std(color, { roughness: 1, side: THREE.DoubleSide }));
  m.castShadow = true;
  g.add(m);
  return m;
}

export function bulb(g) {
  cyl(g, 0.025, 0.025, 0.08, MATS.whiteFurn, 0, -0.04, 0, { seg: 8 });
  return sphere(g, 0.055, basic('#fff4dc'), 0, -0.12, 0, { cast: false });
}

export function ceilingLamp(g) {
  cyl(g, 0.16, 0.14, 0.05, basic('#fbf5e8'), 0, -0.025, 0, { seg: 20, cast: false });
  return g.children[g.children.length - 1];
}
