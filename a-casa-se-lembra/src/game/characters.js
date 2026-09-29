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
  const body = group(root, 0, 0, 0);
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
