// Modelos dos personagens, feitos com primitivas + texturas desenhadas em canvas.
import * as THREE from 'three';
import { box, cyl, sphere, group, std, texMat, basic } from '../world/geom.js';
import * as TX from '../core/textures.js';
import { mulberry32 } from '../core/util.js';

// camisa preta com faixa diagonal (a "camisa da sorte" da protagonista; sem escudo)
function shirtTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#101010'; x.fillRect(0, 0, 256, 256);
  x.save(); x.translate(128, 128); x.rotate(-0.7);
  x.fillStyle = '#1e1e1e'; x.fillRect(-200, -34, 400, 68);
  x.fillStyle = '#d6b26a'; x.fillRect(-200, -38, 400, 5); x.fillRect(-200, 33, 400, 5);
  x.fillStyle = 'rgba(120,120,120,0.35)';
  for (let i = -180; i < 180; i += 22) for (let j = -22; j <= 22; j += 22) { x.fillRect(i - 3, j - 1, 7, 2); x.fillRect(i - 1, j - 3, 2, 7); }
  x.restore();
  x.fillStyle = '#d6b26a'; x.fillRect(0, 0, 256, 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ Rafaela (reflexos / CCTV)
export function buildRafaela() {
  const root = new THREE.Group();
  const skin = std('#8a5436', { roughness: 0.7 });
  const hairM = std('#120b07', { roughness: 1 });
  const shirt = new THREE.MeshStandardMaterial({ map: shirtTexture(), roughness: 0.8 });
  const shorts = std('#1d2a24', { roughness: 0.9 });
  const legs = group(root, 0, 0, 0);
  const lL = group(legs, -0.08, 0.72, 0); cyl(lL, 0.055, 0.045, 0.7, skin, 0, -0.35, 0, { seg: 8 });
  const lR = group(legs, 0.08, 0.72, 0); cyl(lR, 0.055, 0.045, 0.7, skin, 0, -0.35, 0, { seg: 8 });
  box(root, 0.3, 0.16, 0.18, shorts, 0, 0.74, 0);
  const torso = cyl(root, 0.15, 0.14, 0.42, shirt, 0, 1.02, 0, { seg: 12 });
  torso.scale.z = 0.7;
  box(root, 0.36, 0.08, 0.16, shirt, 0, 1.2, 0);
  const aL = group(root, -0.2, 1.2, 0); cyl(aL, 0.045, 0.035, 0.5, skin, 0, -0.25, 0, { seg: 8 }); box(aL, 0.1, 0.12, 0.1, shirt, 0, -0.04, 0);
  const aR = group(root, 0.2, 1.2, 0); cyl(aR, 0.045, 0.035, 0.5, skin, 0, -0.25, 0, { seg: 8 }); box(aR, 0.1, 0.12, 0.1, shirt, 0, -0.04, 0);
  cyl(root, 0.045, 0.05, 0.08, skin, 0, 1.27, 0, { seg: 8 });
  const head = group(root, 0, 1.4, 0);
  sphere(head, 0.11, skin, 0, 0, 0, { sy: 1.12 });
  sphere(head, 0.012, std('#111'), -0.038, 0.01, 0.1, { seg: 6, seg2: 4, cast: false });
  sphere(head, 0.012, std('#111'), 0.038, 0.01, 0.1, { seg: 6, seg2: 4, cast: false });
  // cabelo cacheado volumoso até os ombros
  const rnd = mulberry32(12);
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2;
    const y = 0.12 - rnd() * 0.34;
    const rr = 0.12 + (y < 0 ? 0.03 : 0) + rnd() * 0.03;
    const zOff = Math.sin(a) * rr;
    if (zOff > 0.06 && y > -0.08 && y < 0.1) continue; // rosto livre
    sphere(head, 0.045 + rnd() * 0.02, hairM, Math.cos(a) * rr, y, zOff - 0.01, { seg: 7, seg2: 5 });
  }
  const phone = box(aR, 0.07, 0.14, 0.01, std('#111', { roughness: 0.3 }), 0, -0.5, 0.05);
  phone.visible = false;
  root.userData = { lL, lR, aL, aR, head, phone };
  return root;
}

// ------------------------------------------------------------------ Palhaço Tique-Taque
export function buildClown() {
  const root = new THREE.Group();
  const suit = std('#233f8f', { roughness: 0.8 });
  const red = std('#c3121c', { roughness: 0.6 });
  const white = std('#f2eee4', { roughness: 0.7 });
  const hairM = std('#e2641a', { roughness: 1 });
  // pernas largas listradas
  for (const sx of [-1, 1]) {
    const leg = cyl(root, 0.1, 0.13, 0.85, suit, sx * 0.12, 0.5, 0, { seg: 10 });
    void leg;
    const shoe = sphere(root, 0.1, red, sx * 0.13, 0.06, 0.1, { sx: 1.1, sy: 0.6, sz: 2.2 });
    void shoe;
  }
  const torso = cyl(root, 0.24, 0.2, 0.62, suit, 0, 1.2, 0, { seg: 14 });
  void torso;
  for (let i = 0; i < 3; i++) sphere(root, 0.04, std(['#f5d10c', '#3cc34a', '#e8327a'][i]), 0, 1.35 - i * 0.14, 0.2, { seg: 8 });
  // relógio no peito (o truque dele era "parar o tempo")
  const clock = group(root, 0.1, 1.3, 0.2);
  cyl(clock, 0.08, 0.08, 0.02, white, 0, 0, 0, { rx: Math.PI / 2, seg: 16 });
  box(clock, 0.008, 0.06, 0.005, std('#111'), 0, 0.02, 0.012, { cast: false });
  // gola
  const ruff = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 18), white);
  ruff.rotation.x = Math.PI / 2; ruff.position.y = 1.53; root.add(ruff);
  // braços
  const aL = group(root, -0.3, 1.45, 0); cyl(aL, 0.07, 0.06, 0.6, suit, 0, -0.3, 0, { seg: 8 }); sphere(aL, 0.08, white, 0, -0.62, 0.02);
  const aR = group(root, 0.3, 1.45, 0); cyl(aR, 0.07, 0.06, 0.6, suit, 0, -0.3, 0, { seg: 8 }); sphere(aR, 0.08, white, 0, -0.62, 0.02);
  aL.rotation.z = 0.1; aR.rotation.z = -0.1;
  // cabeça
  const head = group(root, 0, 1.78, 0);
  sphere(head, 0.2, white, 0, 0, 0, { sy: 1.1 });
  const faceGeo = new THREE.SphereGeometry(0.205, 24, 16, 0, Math.PI, Math.PI * 0.15, Math.PI * 0.7);
  const face = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: TX.clownFace(), roughness: 0.6 }));
  face.scale.y = 1.1;
  head.add(face);
  sphere(head, 0.05, std('#e0101a', { roughness: 0.3, emissive: '#300000' }), 0, -0.01, 0.21, { seg: 12 });
  const rnd = mulberry32(4);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    if (Math.sin(a) > 0.35) continue;
    sphere(head, 0.07 + rnd() * 0.05, hairM, Math.cos(a) * 0.22, 0.02 + rnd() * 0.14, Math.sin(a) * 0.18, { seg: 7, seg2: 5 });
  }
  const hat = group(head, 0.05, 0.22, 0); hat.rotation.z = -0.25;
  cyl(hat, 0.14, 0.14, 0.015, std('#111'), 0, 0, 0, { seg: 16 });
  cyl(hat, 0.08, 0.09, 0.12, std('#111'), 0, 0.06, 0, { seg: 16 });
  // cartões (para o porão)
  const card = group(aR, 0, -0.72, 0.1);
  const cardMesh = box(card, 0.34, 0.22, 0.01, white, 0, 0, 0, { cast: false });
  card.visible = false;
  root.userData = { head, aL, aR, card, cardMesh };
  return root;
}

export function cardTexture(text) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 320;
  const x = c.getContext('2d');
  x.fillStyle = '#f4efe2'; x.fillRect(0, 0, 512, 320);
  x.strokeStyle = '#c3121c'; x.lineWidth = 10; x.strokeRect(12, 12, 488, 296);
  x.fillStyle = '#1a1a1a'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const words = text.split(' ');
  const lines = [];
  let line = '';
  x.font = 'bold 44px Georgia';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > 440) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  const size = lines.length > 4 ? 34 : 44;
  x.font = `bold ${size}px Georgia`;
  lines.forEach((l, i) => x.fillText(l, 256, 160 + (i - (lines.length - 1) / 2) * size * 1.15));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ O Inquilino
export function buildEntity() {
  const root = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, metalness: 0 });
  // o corpo é montado de frente para +z; a raiz "olha" para -z (mesma convenção da IA)
  const inner = group(root, 0, 0, 0, Math.PI);
  const body = group(inner, 0, 0, 0);
  for (const sx of [-1, 1]) {
    const upper = cyl(body, 0.05, 0.04, 0.8, black, sx * 0.1, 0.95, 0, { seg: 6 });
    upper.rotation.z = sx * 0.04;
    cyl(body, 0.04, 0.03, 0.62, black, sx * 0.12, 0.33, 0.02, { seg: 6 });
  }
  const torso = cyl(body, 0.13, 0.09, 0.8, black, 0, 1.62, 0, { seg: 8 });
  torso.scale.z = 0.55;
  for (let i = 0; i < 5; i++) { const r = box(body, 0.22, 0.015, 0.1, black, 0, 1.4 + i * 0.1, 0.05); r.rotation.x = 0.1; }
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = group(body, sx * 0.2, 1.98, 0);
    cyl(sh, 0.035, 0.03, 0.75, black, 0, -0.37, 0, { seg: 6 });
    const fore = group(sh, 0, -0.75, 0);
    cyl(fore, 0.03, 0.025, 0.7, black, 0, -0.35, 0, { seg: 6 });
    for (let f = 0; f < 4; f++) { const fi = cyl(fore, 0.008, 0.004, 0.28, black, (f - 1.5) * 0.02, -0.82, 0.01, { seg: 4 }); fi.rotation.x = 0.2 - f * 0.05; }
    sh.rotation.z = sx * 0.12;
    arms.push({ sh, fore });
  }
  const neck = group(body, 0, 2.05, 0);
  cyl(neck, 0.03, 0.035, 0.22, black, 0, 0.1, 0, { seg: 6 });
  const head = group(neck, 0, 0.36, 0.02);
  const faceTex = new TX.EntityFaceTexture();
  box(head, 0.26, 0.36, 0.14, black, 0, 0, -0.02);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.32), new THREE.MeshBasicMaterial({ map: faceTex.texture, color: 0x999999 }));
  face.position.z = 0.051;
  head.add(face);
  root.userData = { body, arms, neck, head, face, faceTex, black };
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return root;
}

// ------------------------------------------------------------------ O Morador de Antes
// Homenagem feita do zero ao Homem Pálido: alto, pele sobrando como lençol de móvel guardado,
// nenhum olho no rosto — os olhos moram nas palmas das mãos.
let paleMats = null;
export function paleMaterials() {
  if (paleMats) return paleMats;
  // cor um pouco abaixo do branco: de perto, com a lanterna, a pele não "estoura" e as dobras continuam aparecendo
  const skin = new THREE.MeshStandardMaterial({ color: 0xcdb9b1, map: TX.paleSkin(), normalMap: TX.paleSkinNormal(), normalScale: new THREE.Vector2(0.45, 0.45), roughness: 0.62, metalness: 0, emissive: new THREE.Color(0x120a09) });
  const flap = skin.clone(); flap.side = THREE.DoubleSide;
  const skinV = skin.clone(); skinV.vertexColors = true;
  const eye = new THREE.MeshStandardMaterial({ map: TX.paleEye(), roughness: 0.12, metalness: 0, emissive: new THREE.Color(0xffffff), emissiveMap: TX.paleEye(), emissiveIntensity: 0.24 });
  paleMats = { skin, skinV, flap, eye, nail: std('#2b1f1c', { roughness: 0.35 }), mouth: basic('#140404'), crease: basic('#6a3a36'), tooth: std('#d6cab0', { roughness: 0.4 }) };
  return paleMats;
}

// tronco: costelas em cima, pele sobrando em dobras que pendem na barriga
function paleTorsoGeo() {
  const Hh = 0.8;
  const g = new THREE.CylinderGeometry(1, 1, Hh, 28, 48, true);
  g.translate(0, Hh / 2, 0);
  const p = g.attributes.position;
  const pts = [[0, 0.128], [0.12, 0.124], [0.3, 0.112], [0.45, 0.122], [0.6, 0.138], [0.75, 0.15], [0.88, 0.156], [1, 0.12]];
  const prof = (t) => {
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, r0] = pts[i - 1], [t1, r1] = pts[i]; const k = (t - t0) / (t1 - t0); return r0 + (r1 - r0) * k * k * (3 - 2 * k); }
    return pts[pts.length - 1][1];
  };
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const ux = p.getX(i), y = p.getY(i), uz = p.getZ(i);
    const t = y / Hh;
    const th = Math.atan2(uz, ux);
    const front = Math.max(0, Math.sin(th));
    const back = Math.max(0, -Math.sin(th));
    const side = Math.abs(Math.cos(th));
    let r = prof(t), sag = 0, shade = 1;
    if (t < 0.6) {
      const ph = (t * 5.4 + 0.15) * Math.PI;
      const roll = Math.pow(Math.max(0, Math.sin(ph)), 4);
      r += roll * (0.024 + 0.05 * front) * (1 - (t / 0.6) * 0.25);
      sag = roll * (0.05 + 0.075 * front);
      shade -= Math.pow(Math.max(0, -Math.sin(ph)), 2) * (0.42 + 0.2 * front);
    }
    if (t > 0.56 && t < 0.9) shade -= 0.14 * Math.max(0, -Math.sin(t * 64)) * (0.4 + side * 0.6);
    if (t > 0.56 && t < 0.9) r += 0.0068 * Math.pow(Math.max(0, Math.sin(t * 64)), 2) * (0.35 + side * 0.9) * (1 - back * 0.7);
    r -= 0.013 * Math.exp(-Math.pow((th - Math.PI / 2) / 0.16, 2)) * (t > 0.55 ? 1 : 0.3);
    r -= 0.01 * Math.exp(-Math.pow((th + Math.PI / 2) / 0.12, 2));
    const sx = 1 + 0.48 * Math.pow(Math.min(1, Math.max(0, (t - 0.72) / 0.28)), 1.5);
    p.setXYZ(i, ux * r * sx, y - sag, uz * r * 0.7);
    shade = Math.max(0.35, shade);
    col[i * 3] = shade; col[i * 3 + 1] = shade * 0.96; col[i * 3 + 2] = shade * 0.95;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
// aba de pele pendurada (avental de pele sobre a barriga)
function paleFlapGeo(w, h, depth, seed) {
  const g = new THREE.PlaneGeometry(w, h, 14, 10);
  const p = g.attributes.position;
  const rnd = mulberry32(seed);
  const ph = rnd() * 6;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const u = x / w, v = y / h + 0.5;
    const curve = Math.cos(u * Math.PI * 0.9);
    const z = depth * curve + (1 - v) * 0.026 * curve + Math.sin(u * 9 + ph) * 0.004 * (1 - v);
    const yy = y - (1 - v) * (1 - v) * 0.03 * curve - (1 - v) * Math.sin(u * 7 + ph) * 0.012;
    p.setXYZ(i, x * (1 + (1 - v) * 0.12), yy, z);
  }
  g.computeVertexNormals();
  return g;
}
// cabeça careca, comprida, com órbitas fundas e lisas (sem olhos)
function paleHeadGeo() {
  const g = new THREE.SphereGeometry(0.112, 36, 26);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    y *= 1.22; x *= 0.9;
    const low = Math.max(0, -y) / 0.137;
    x *= 1 - low * 0.3; z *= 1 - low * 0.08;
    if (y > 0) z -= (y / 0.137) * (y / 0.137) * 0.018;
    for (const sx of [-1, 1]) {
      const dx = x - sx * 0.04, dy = y - 0.02, dz = z - 0.095;
      z -= Math.exp(-(dx * dx) / 0.00055 - (dy * dy) / 0.00035 - (dz * dz) / 0.003) * 0.02;
      const cx = x - sx * 0.062, cy = y + 0.032;
      if (z > 0) x -= sx * Math.exp(-(cx * cx) / 0.0006 - (cy * cy) / 0.0012) * 0.012;
    }
    if (z > 0) {
      z += Math.exp(-(x * x) / 0.00045 - ((y + 0.022) * (y + 0.022)) / 0.00028) * 0.022;
      z -= Math.exp(-(x * x) / 0.0022 - ((y + 0.058) * (y + 0.058)) / 0.00012) * 0.013;
    }
    p.setXYZ(i, x, y, z);
    // sombreado: órbitas fundas, boca e narinas escuras, testa mais clara
    let sh = 1, red = 0;
    if (z > 0.02) {
      for (const sx of [-1, 1]) sh -= Math.exp(-((x - sx * 0.04) ** 2) / 0.0007 - ((y - 0.018) ** 2) / 0.0005) * 0.5;
      sh -= Math.exp(-(x * x) / 0.0025 - ((y + 0.058) ** 2) / 0.00018) * 0.35;
      red += Math.exp(-(x * x) / 0.0012 - ((y + 0.03) ** 2) / 0.0006) * 0.12;
      sh += Math.exp(-(x * x) / 0.004 - ((y - 0.08) ** 2) / 0.002) * 0.08;
    }
    sh = Math.max(0.3, Math.min(1.08, sh));
    col[i * 3] = sh + red * 0.6; col[i * 3 + 1] = sh * 0.95 - red * 0.3; col[i * 3 + 2] = sh * 0.94 - red * 0.3;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
function taper(r0, r1, len, seg = 10) { const g = new THREE.CylinderGeometry(r0, r1, len, seg, 3); g.translate(0, -len / 2, 0); return g; }

// mão comprida: pulso na origem, dedos para -y, palma para -z (com o olho)
function paleHand(M, side) {
  const hand = new THREE.Group();
  const add = (geo, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; hand.add(m); return m; };
  const palm = add(new THREE.SphereGeometry(0.05, 18, 14), M.skin, 0, -0.066, 0);
  palm.scale.set(1.0, 1.38, 0.44);
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.005, 0.006, 0.08, 5), M.skin, -0.03 + i * 0.02, -0.078, 0.016, false);
  const fingers = [];
  const fx = [-0.034, -0.012, 0.011, 0.033];
  const lens = [[0.052, 0.042, 0.036], [0.066, 0.052, 0.044], [0.064, 0.05, 0.043], [0.05, 0.04, 0.034]];
  fx.forEach((x, fi) => {
    const base = new THREE.Group(); base.position.set(x, -0.128 + Math.abs(fi - 1.5) * 0.007, 0); hand.add(base);
    const segs = []; let parent = base;
    for (let k = 0; k < 3; k++) {
      const seg = new THREE.Group(); if (k > 0) seg.position.y = -lens[fi][k - 1]; parent.add(seg);
      const L = lens[fi][k], r = 0.0102 - k * 0.0017;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.86, L, 7), M.skin); m.position.y = -L / 2; m.castShadow = true; seg.add(m);
      seg.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.2, 8, 6), M.skin));
      segs.push(seg); parent = seg;
    }
    const nail = new THREE.Mesh(new THREE.ConeGeometry(0.0072, 0.034, 6), M.nail); nail.position.set(0, -lens[fi][2] - 0.012, -0.002); nail.rotation.x = Math.PI - 0.25; parent.add(nail);
    fingers.push({ base, segs });
  });
  const tb = new THREE.Group(); tb.position.set(-0.046, -0.046, -0.004); tb.rotation.z = -0.8; hand.add(tb);
  const tsegs = []; let tp = tb;
  for (let k = 0; k < 2; k++) {
    const seg = new THREE.Group(); if (k > 0) seg.position.y = -0.046; tp.add(seg);
    const r = 0.012 - k * 0.002;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, 0.046, 7), M.skin); m.position.y = -0.023; seg.add(m);
    seg.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 8, 6), M.skin));
    tsegs.push(seg); tp = seg;
  }
  const tn = new THREE.Mesh(new THREE.ConeGeometry(0.0078, 0.03, 6), M.nail); tn.position.set(0, -0.053, -0.002); tn.rotation.x = Math.PI - 0.25; tp.add(tn);
  fingers.push({ base: tb, segs: tsegs, thumb: true });
  // o olho da palma, com pálpebras que se recolhem para dentro da mão
  const eg = new THREE.Group(); eg.position.set(0, -0.067, -0.019); hand.add(eg);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.0165, 18, 14), M.eye); ball.rotation.x = -Math.PI / 2; eg.add(ball);
  eg.add(new THREE.Mesh(new THREE.TorusGeometry(0.0182, 0.0056, 8, 22), M.skin));
  const upper = new THREE.Mesh(new THREE.SphereGeometry(0.0178, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.skin);
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.0178, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.skin);
  eg.add(upper); eg.add(lower);
  hand.scale.set(side * 1.35, 1.35, 1.35);
  return { hand, fingers, eye: { g: eg, ball, upper, lower, open: 0, has: true } };
}
function paleFoot(M) {
  const f = new THREE.Group();
  const sole = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), M.skin); sole.scale.set(0.85, 0.42, 2.3); sole.position.set(0, -0.02, 0.07); sole.castShadow = true; f.add(sole);
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.07, 6), M.skin);
    t.rotation.x = Math.PI / 2 + 0.3; t.position.set(-0.028 + i * 0.019, -0.03, 0.17 + (i === 1 || i === 2 ? 0.012 : 0)); f.add(t);
    const n = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.018, 5), M.nail); n.rotation.x = Math.PI / 2 + 0.3; n.position.set(-0.028 + i * 0.019, -0.042, 0.212 + (i === 1 || i === 2 ? 0.012 : 0)); f.add(n);
  }
  return f;
}

export function buildPale() {
  const M = paleMaterials();
  const root = new THREE.Group();
  const inner = new THREE.Group();          // modelo de frente para +z; a raiz olha para -z (convenção das entidades)
  inner.rotation.y = Math.PI;
  inner.scale.setScalar(1.12);
  root.add(inner);
  const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const hips = group(inner, 0, 0.93, 0);
  const pelvis = mesh(hips, new THREE.SphereGeometry(0.12, 18, 12), M.skin, 0, 0.02, -0.005); pelvis.scale.set(1.05, 0.62, 0.78);
  const spine = group(hips, 0, 0.02, 0);
  mesh(spine, paleTorsoGeo(), M.skinV);
  const flaps = [
    mesh(spine, paleFlapGeo(0.26, 0.21, 0.08, 3), M.flap, 0, 0.35, 0.03),
    mesh(spine, paleFlapGeo(0.28, 0.22, 0.09, 9), M.flap, 0, 0.17, 0.034),
  ];
  const chest = group(spine, 0, 0.72, 0);
  const cap = mesh(chest, new THREE.SphereGeometry(0.14, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.skin, 0, 0.0, -0.005); cap.scale.set(1.28, 0.42, 0.72);
  for (const sx of [-1, 1]) { const cb = mesh(chest, new THREE.CylinderGeometry(0.009, 0.009, 0.16, 6), M.skin, sx * 0.085, 0.045, 0.06); cb.rotation.z = Math.PI / 2 + sx * 0.25; }
  const neck = group(chest, 0, 0.05, 0.015);
  const neckGeo = new THREE.CylinderGeometry(0.036, 0.052, 0.17, 14, 6); neckGeo.translate(0, 0.085, 0);
  { const p = neckGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const s = 1 + Math.sin(y * 70) * 0.06; p.setX(i, p.getX(i) * s); p.setZ(i, p.getZ(i) * s); } neckGeo.computeVertexNormals(); }
  mesh(neck, neckGeo, M.skin);
  const wattle = mesh(neck, new THREE.SphereGeometry(0.045, 12, 10), M.skin, 0, 0.06, 0.04); wattle.scale.set(1.15, 1.8, 0.75);
  const head = group(neck, 0, 0.22, 0.035);
  head.scale.setScalar(1.3);
  mesh(head, paleHeadGeo(), M.skinV);
  const snout = mesh(head, new THREE.SphereGeometry(0.022, 12, 10), M.skin, 0, -0.024, 0.113); snout.scale.set(1.35, 0.9, 0.75);
  for (const sx of [-1, 1]) {
    const cr = mesh(head, new THREE.CylinderGeometry(0.0016, 0.0016, 0.034, 5), M.crease, sx * 0.04, 0.02, 0.079, false); cr.rotation.z = Math.PI / 2 + sx * 0.12;
    const ear = mesh(head, new THREE.SphereGeometry(0.02, 8, 8), M.skin, sx * 0.098, 0.0, -0.01); ear.scale.set(0.32, 1.1, 0.6);
    const nos = mesh(head, new THREE.SphereGeometry(0.0065, 8, 6), M.mouth, sx * 0.011, -0.027, 0.127, false); nos.scale.set(0.8, 0.6, 0.4);
  }
  const mouth = mesh(head, new THREE.SphereGeometry(0.05, 22, 12), M.mouth, 0, -0.058, 0.087, false); mouth.scale.set(1.0, 0.16, 0.45);
  const lipU = mesh(head, new THREE.TorusGeometry(0.047, 0.0055, 6, 22, Math.PI), M.skin, 0, -0.056, 0.092, false); lipU.scale.set(1, 0.22, 1); lipU.rotation.x = -0.2;
  for (let i = 0; i < 7; i++) { const t = mesh(head, new THREE.ConeGeometry(0.0045, 0.013, 5), M.tooth, -0.03 + i * 0.01, -0.061, 0.088 - Math.abs(i - 3) * 0.003, false); t.rotation.x = Math.PI; t.scale.y = 0.7 + (i % 3) * 0.3; }
  const jaw = group(head, 0, -0.035, 0.0);
  const lipL = mesh(jaw, new THREE.TorusGeometry(0.044, 0.006, 6, 22, Math.PI), M.skin, 0, -0.025, 0.09, false); lipL.scale.set(1, 0.25, 1); lipL.rotation.z = Math.PI; lipL.rotation.x = 0.2;
  const chin = mesh(jaw, new THREE.SphereGeometry(0.04, 14, 10), M.skin, 0, -0.058, 0.064); chin.scale.set(1.15, 0.75, 0.9);
  for (const sx of [-1, 1]) {
    const jw = mesh(jaw, new THREE.SphereGeometry(0.03, 10, 8), M.skin, sx * 0.058, -0.07, 0.035); jw.scale.set(0.9, 1.5, 0.95);
    const sack = mesh(jaw, new THREE.SphereGeometry(0.027, 12, 10), M.skin, sx * 0.05, -0.1, 0.052); sack.scale.set(0.85, 1.55, 0.8);
  }
  // braços
  const arms = [], legs = [], hands = [];
  for (const sx of [1, -1]) {
    const sh = group(chest, sx * 0.205, -0.01, -0.005);
    const knob = mesh(sh, new THREE.SphereGeometry(0.045, 12, 10), M.skin); knob.scale.set(1.1, 0.9, 1);
    mesh(sh, taper(0.044, 0.033, 0.44), M.skin);
    const sagArm = mesh(sh, new THREE.SphereGeometry(0.032, 10, 8), M.skin, 0, -0.21, -0.028); sagArm.scale.set(0.95, 3.2, 1.1);
    const el = group(sh, 0, -0.44, 0);
    mesh(el, new THREE.SphereGeometry(0.036, 10, 8), M.skin);
    mesh(el, taper(0.033, 0.025, 0.42), M.skin);
    const wr = group(el, 0, -0.42, 0);
    const hd = paleHand(M, sx);
    wr.add(hd.hand);
    arms.push({ sh, el, wr, side: sx });
    hands.push(hd);
  }
  for (const sx of [1, -1]) {
    const th = group(hips, sx * 0.1, -0.02, 0);
    mesh(th, taper(0.064, 0.046, 0.44), M.skin);
    const kn = group(th, 0, -0.44, 0);
    const cap2 = mesh(kn, new THREE.SphereGeometry(0.047, 12, 10), M.skin, 0, 0, 0.012); cap2.scale.set(1, 1.1, 1);
    const bag = mesh(kn, new THREE.SphereGeometry(0.04, 10, 8), M.skin, 0, -0.045, 0.03); bag.scale.set(1.1, 0.7, 0.8);
    mesh(kn, taper(0.048, 0.031, 0.46), M.skin);
    const an = group(kn, 0, -0.46, 0);
    an.add(paleFoot(M));
    legs.push({ th, kn, an, side: sx });
  }
  root.userData = { inner, hips, spine, chest, neck, head, jaw, mouth, arms, legs, hands, flaps };
  return root;
}

// um olho solto (o copo d'água da mesa)
export function buildLooseEye() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.0165, 18, 14), paleMaterials().eye);
  return m;
}

// ------------------------------------------------------------------ irmã (sólida, para o final secreto)
export function buildSister() {
  const root = new THREE.Group();
  const skin = std('#8a5a3c', { roughness: 0.7 });
  const hairM = std('#0e0806', { roughness: 0.9 });
  const pj = texMat(TX.fabric('#6e7fa6', { seed: 12 }), { roughness: 1 });
  const pjs = texMat(TX.fabric('#4a5578', { seed: 13 }), { roughness: 1 });
  const body = group(root, 0, 0, 0);
  const legs = [];
  for (const sx of [-1, 1]) { const l = group(body, sx * 0.09, 0.8, 0); cyl(l, 0.065, 0.05, 0.78, pjs, 0, -0.39, 0, { seg: 10 }); sphere(l, 0.05, skin, 0, -0.8, 0.05, { sx: 0.8, sy: 0.5, sz: 1.6 }); legs.push(l); }
  const torso = cyl(body, 0.17, 0.15, 0.56, pj, 0, 1.1, 0, { seg: 14 }); torso.scale.z = 0.7;
  const arms = [];
  for (const sx of [-1, 1]) { const a = group(body, sx * 0.21, 1.33, 0); cyl(a, 0.05, 0.04, 0.56, pj, 0, -0.28, 0, { seg: 8 }); sphere(a, 0.042, skin, 0, -0.6, 0.01); a.rotation.z = sx * 0.06; arms.push(a); }
  cyl(body, 0.045, 0.05, 0.1, skin, 0, 1.43, 0, { seg: 8 });
  const head = group(body, 0, 1.58, 0);
  sphere(head, 0.11, skin, 0, 0, 0, { sy: 1.12 });
  sphere(head, 0.012, std('#111'), -0.037, 0.01, 0.1, { seg: 6, seg2: 4, cast: false });
  sphere(head, 0.012, std('#111'), 0.037, 0.01, 0.1, { seg: 6, seg2: 4, cast: false });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.122, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.46), hairM);
  cap.position.set(0, 0.012, -0.01); cap.castShadow = true; head.add(cap);
  box(head, 0.25, 0.46, 0.1, hairM, 0, -0.16, -0.07);
  root.userData = { body, legs, arms, head };
  return root;
}

// ------------------------------------------------------------------ gatos
function catTexture(kind) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const x = c.getContext('2d');
  const rnd = mulberry32(kind === 'bento' ? 3 : 9);
  x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, 128, 128);
  const col = kind === 'bento' ? '#141414' : '#6b6560';
  for (let i = 0; i < (kind === 'bento' ? 7 : 10); i++) {
    x.fillStyle = col;
    x.beginPath(); x.ellipse(rnd() * 128, rnd() * 128, 10 + rnd() * 18, 8 + rnd() * 12, rnd() * 3, 0, Math.PI * 2); x.fill();
  }
  if (kind === 'lili') { x.strokeStyle = 'rgba(40,36,32,0.5)'; x.lineWidth = 2; for (let i = 0; i < 20; i++) { x.beginPath(); const y = rnd() * 128; x.moveTo(0, y); x.lineTo(128, y + (rnd() - 0.5) * 10); x.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
export function buildCat(kind) {
  const root = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ map: catTexture(kind), roughness: 1 });
  const body = sphere(root, 0.12, fur, 0, 0.19, 0, { sx: 0.9, sy: 0.85, sz: 1.9 });
  void body;
  const head = group(root, 0, 0.3, 0.22);
  sphere(head, 0.085, fur, 0, 0, 0, { sx: 1.05, sy: 0.95, sz: 0.95 });
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.07, 4), fur);
    ear.position.set(sx * 0.045, 0.08, -0.01); ear.rotation.z = -sx * 0.25; head.add(ear);
    const eye = sphere(head, 0.014, new THREE.MeshBasicMaterial({ color: kind === 'bento' ? 0xc8e04a : 0xe0b84a }), sx * 0.032, 0.015, 0.075, { seg: 8, seg2: 6, cast: false });
    void eye;
  }
  sphere(head, 0.012, std('#e59aa3'), 0, -0.012, 0.085, { seg: 6, seg2: 4 });
  const legs = [];
  for (const [x, z] of [[-0.06, 0.13], [0.06, 0.13], [-0.06, -0.13], [0.06, -0.13]]) {
    const l = group(root, x, 0.14, z);
    cyl(l, 0.022, 0.02, 0.14, fur, 0, -0.07, 0, { seg: 6 });
    legs.push(l);
  }
  const tail = [];
  let parent = group(root, 0, 0.22, -0.2);
  for (let i = 0; i < 6; i++) {
    const seg = group(parent, 0, 0, -0.045);
    sphere(seg, 0.022 - i * 0.002, fur, 0, 0, 0, { seg: 6, seg2: 4 });
    tail.push(seg);
    parent = seg;
  }
  root.userData = { head, legs, tail };
  return root;
}

// ------------------------------------------------------------------ ecos (presenças de ruído)
const echoVert = /* glsl */ `
  varying vec3 vPos; varying vec3 vN;
  void main(){ vPos = position; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const echoFrag = /* glsl */ `
  uniform float time; uniform vec3 color; uniform float alpha;
  varying vec3 vPos; varying vec3 vN;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    float n = hash(floor(vec2(gl_FragCoord.x * 0.5, gl_FragCoord.y * 0.5)) + floor(time * 24.0));
    float band = step(0.92, fract(vPos.y * 6.0 - time * 1.3));
    float rim = 1.0 - abs(vN.z);
    float a = alpha * (0.35 + 0.65 * rim) * (0.55 + 0.45 * n) + band * 0.25 * alpha;
    gl_FragColor = vec4(color * (0.7 + 0.6 * n), a);
  }`;
export function echoMaterial(color = 0xbfd8ff, alpha = 0.7) {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color(color) }, alpha: { value: alpha } },
    vertexShader: echoVert, fragmentShader: echoFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

// figura humana genérica. opts: {h, hair:'curly'|'short'|'long'|'bun', hat, sitting, mat}
export function buildFigure(opts = {}) {
  const root = new THREE.Group();
  const m = opts.mat || echoMaterial(opts.color, opts.alpha);
  const s = (opts.h || 1.7) / 1.7;
  const body = group(root, 0, 0, 0);
  body.scale.setScalar(s);
  const legs = [];
  for (const sx of [-1, 1]) {
    const l = group(body, sx * 0.1, 0.88, 0);
    const c = cyl(l, 0.07, 0.055, 0.86, m, 0, -0.43, 0, { seg: 8, cast: false });
    void c;
    legs.push(l);
  }
  cyl(body, 0.2, 0.16, 0.62, m, 0, 1.2, 0, { seg: 10, cast: false }).scale.z = 0.65;
  const arms = [];
  for (const sx of [-1, 1]) {
    const a = group(body, sx * 0.24, 1.46, 0);
    cyl(a, 0.055, 0.045, 0.62, m, 0, -0.31, 0, { seg: 8, cast: false });
    a.rotation.z = sx * 0.08;
    arms.push(a);
  }
  const head = group(body, 0, 1.64, 0);
  sphere(head, 0.12, m, 0, 0, 0, { sy: 1.15, cast: false });
  if (opts.hair === 'curly') for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; if (Math.sin(a) > 0.5) continue; sphere(head, 0.06, m, Math.cos(a) * 0.13, -0.05 + (i % 3) * 0.06, Math.sin(a) * 0.12, { seg: 6, seg2: 4, cast: false }); }
  if (opts.hair === 'long') { box(head, 0.26, 0.4, 0.12, m, 0, -0.12, -0.08, { cast: false }); }
  if (opts.hair === 'bun') sphere(head, 0.07, m, 0, 0.1, -0.1, { seg: 6, cast: false });
  if (opts.hat) {
    cyl(head, 0.24, 0.24, 0.015, opts.hatMat || m, 0, 0.13, 0, { seg: 16, cast: false });
    cyl(head, 0.12, 0.13, 0.12, opts.hatMat || m, 0, 0.19, 0, { seg: 12, cast: false });
  }
  if (opts.sitting) {
    legs.forEach((l) => { l.rotation.x = -Math.PI / 2; l.position.y = 0.46; l.position.z = 0; });
    body.position.y = -0.42;
  }
  root.userData = { body, legs, arms, head, mat: m };
  return root;
}

// o pai "Esquecido": silhueta escura com o chapéu de palha
export function buildEsquecido() {
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a0908, roughness: 1, transparent: true, opacity: 0.94 });
  const straw = std('#b8a472', { roughness: 1 });
  const f = buildFigure({ h: 1.78, mat: dark, hat: true, hatMat: straw });
  const eyes = group(f.userData.head, 0, 0.01, 0.11);
  sphere(eyes, 0.012, new THREE.MeshBasicMaterial({ color: 0xffe8c0 }), -0.04, 0, 0, { seg: 6, seg2: 4, cast: false });
  sphere(eyes, 0.012, new THREE.MeshBasicMaterial({ color: 0xffe8c0 }), 0.04, 0, 0, { seg: 6, seg2: 4, cast: false });
  f.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  f.userData.eyes = eyes;
  return f;
}
