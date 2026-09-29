// O apartamento de antes: a mesma casa, anos antes da família chegar.
// Móveis cobertos por lençóis, papel de parede amarelado, uma mesa posta para visitas
// que nunca vieram — e, na cabeceira, o antigo morador, dormindo embaixo de um lençol.
// Fica "atrás" da porta de entrada (espaço impossível, deslocado em x).
import * as THREE from 'three';
import { box, cyl, sphere, plane, group, MATS, std, texMat, basic } from './geom.js';
import * as P from './props.js';
import * as TX from '../core/textures.js';
import { wall } from './house.js';
import { Door } from './doors.js';
import { Mirror } from './mirror.js';
import { vis } from './layers.js';
import { clamp, smooth, mulberry32 } from '../core/util.js';
import { buildLooseEye } from '../game/characters.js';

export const AX = 200, AZ = 0;
// quem cruza a porta de entrada (x≈0,97; z=8) aparece na porta de antes (x=AX+3; z=AZ)
export const ANTES_DX = AX + 3.0 - 0.975;
export const ANTES_DZ = AZ - 8.0;
const W = 6, D = 9, HT = 2.7;
const X = (x) => AX + x, Z = (z) => AZ + z;

// ------------------------------------------------------------------ lençol jogado por cima de um móvel
// shapes: retângulos arredondados {x0,x1,z0,z1,h,r,drop} em coordenadas locais do grupo
export function drapeGeometry(shapes, opts = {}) {
  const m = opts.margin || 0.22, step = opts.step || 0.045;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const s of shapes) { x0 = Math.min(x0, s.x0); x1 = Math.max(x1, s.x1); z0 = Math.min(z0, s.z0); z1 = Math.max(z1, s.z1); }
  x0 -= m; x1 += m; z0 -= m; z1 += m;
  const nx = Math.min(72, Math.ceil((x1 - x0) / step)), nz = Math.min(72, Math.ceil((z1 - z0) / step));
  const rnd = mulberry32(opts.seed || 1);
  const ph = rnd() * 10;
  const cxAll = (x0 + x1) / 2, czAll = (z0 + z1) / 2;
  const sd = (s, x, z) => {
    const cx = (s.x0 + s.x1) / 2, cz = (s.z0 + s.z1) / 2, hx = (s.x1 - s.x0) / 2, hz = (s.z1 - s.z0) / 2;
    const r = Math.min(s.r === undefined ? 0.04 : s.r, hx, hz);
    const qx = Math.abs(x - cx) - hx + r, qz = Math.abs(z - cz) - hz + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - r;
  };
  const field = (x, z) => {
    let best = 0.01, dmin = Infinity;
    for (const s of shapes) {
      const d = sd(s, x, z);
      dmin = Math.min(dmin, d);
      const a = Math.atan2(z - (s.z0 + s.z1) / 2, x - (s.x0 + s.x1) / 2);
      const drop = (s.drop || 0.09) * (1 + 0.55 * Math.sin(a * 7 + ph) + 0.25 * Math.sin(a * 17 + ph * 3));
      let h;
      if (d <= 0) h = s.h - 0.035 * smooth(clamp((d + 0.07) / 0.07, 0, 1));
      else h = s.h * (1 - smooth(clamp(d / Math.max(0.03, drop), 0, 1)));
      if (h > best) best = h;
    }
    return { h: best, d: dmin };
  };
  const hem = (x, z) => { const a = Math.atan2(z - czAll, x - cxAll); return m * (0.62 + 0.28 * Math.sin(a * 5 + ph) + 0.1 * Math.sin(a * 13 + ph * 2)); };
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = x0 + (i / nx) * (x1 - x0), z = z0 + (j / nz) * (z1 - z0);
      const { h, d } = field(x, z);
      let y = h;
      if (d > 0) { const a = Math.atan2(z - czAll, x - cxAll); y += Math.sin(a * 11 + ph) * 0.014 * clamp(d / 0.12, 0, 1) * clamp(h / 0.2, 0, 1); }
      if (d > 0.02 && y < 0.05) y = 0.008 + 0.012 * Math.max(0, Math.sin((x + z) * 23 + ph));
      pos.push(x, Math.max(0.006, y), z);
      uv.push(x / 0.9 + y * 0.25, z / 0.9 + y * 0.9);
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const cx = x0 + ((i + 0.5) / nx) * (x1 - x0), cz = z0 + ((j + 0.5) / nz) * (z1 - z0);
      if (field(cx, cz).d > hem(cx, cz)) continue;
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, dd = c + 1;
      idx.push(a, c, b, b, c, dd);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
let sheetMat = null;
function sheetMaterial() {
  if (!sheetMat) sheetMat = new THREE.MeshStandardMaterial({ map: TX.dustSheet(), roughness: 1, side: THREE.DoubleSide });
  return sheetMat;
}
export function sheet(parent, shapes, opts = {}) {
  const m = new THREE.Mesh(drapeGeometry(shapes, opts), sheetMaterial());
  m.castShadow = true; m.receiveShadow = true;
  vis(m, opts.vis || 'ec'); // no espelho (a memória da casa) os lençóis não existem
  parent.add(m);
  return m;
}

function slab(parent, x0, x1, z0, z1, mat, y, down = false) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2;
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  parent.add(m);
  const uv = m.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 1.2, uv.getY(i) * (z1 - z0) / 1.2);
  return m;
}

// decalque de marca de mão numa parede (normal: 'x+','x-','z+','z-') ou no chão
export function handprint(parent, x, y, z, face, opts = {}) {
  const mat = new THREE.MeshBasicMaterial({ map: TX.handprint(opts.seed || 1), transparent: true, depthWrite: false, opacity: opts.opacity || 0.75, polygonOffset: true, polygonOffsetFactor: -2, color: opts.color || 0xffffff, fog: true });
  const s = opts.size || 0.24;
  const p = plane(parent, s * 0.73, s, mat, x, y, z, { uv: false, receive: false });
  const ry = { 'x+': Math.PI / 2, 'x-': -Math.PI / 2, 'z+': 0, 'z-': Math.PI }[face] || 0;
  p.rotation.set(0, ry, opts.rot || 0);
  if (face === 'y') { p.rotation.set(-Math.PI / 2, 0, opts.rot || 0); }
  return p;
}

// as coisas que a família perdeu (também usadas no final "Achados e Perdidos")
export function lostItem(parent, kind, x, y, z, ry = 0, color) {
  const g = group(parent, x, y, z, ry);
  if (kind === 'oculos') {
    for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.004, 6, 16), std('#3a2418', { roughness: 0.4 })); r.rotation.x = Math.PI / 2; r.position.x = sx * 0.032; g.add(r); }
    box(g, 0.02, 0.004, 0.004, std('#3a2418'), 0, 0, 0, { cast: false });
    for (const sx of [-1, 1]) box(g, 0.004, 0.004, 0.11, std('#3a2418'), sx * 0.058, 0, -0.055, { cast: false });
  } else if (kind === 'controle') {
    box(g, 0.05, 0.02, 0.17, std('#1a1a1a', { roughness: 0.5 }), 0, 0, 0);
    for (let i = 0; i < 6; i++) box(g, 0.01, 0.006, 0.01, std(i === 0 ? '#c22' : '#666'), (i % 2 ? 0.012 : -0.012), 0.012, -0.05 + Math.floor(i / 2) * 0.03, { cast: false });
  } else if (kind === 'chupeta') {
    sphere(g, 0.025, std('#f0a6c0', { roughness: 0.4 }), 0, 0, 0, { sx: 1.3, sy: 0.3, sz: 1 });
    sphere(g, 0.012, std('#f5e6c8', { roughness: 0.3 }), 0, 0.006, 0.022, { seg: 8 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0035, 6, 14), std('#f0a6c0')); ring.position.set(0, 0.006, -0.03); ring.rotation.x = 0.3; g.add(ring);
  } else if (kind === 'tenis') {
    box(g, 0.09, 0.03, 0.26, std('#f2f2f2'), 0, 0.015, 0);
    box(g, 0.085, 0.07, 0.17, std('#2b4a8a', { roughness: 0.8 }), 0, 0.06, -0.03);
    box(g, 0.07, 0.05, 0.08, std('#2b4a8a', { roughness: 0.8 }), 0, 0.045, 0.08);
  } else if (kind === 'meia') {
    cyl(g, 0.022, 0.02, 0.16, std(color || '#c9302c', { roughness: 1 }), 0, 0.02, 0, { rz: Math.PI / 2, seg: 8 });
  } else if (kind === 'presilha') {
    for (let i = 0; i < 4; i++) box(g, 0.012, 0.03, 0.006, std('#b04ad0'), -0.02 + i * 0.013, 0.012, 0, { cast: false });
  } else if (kind === 'chaveiro') {
    const kr = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.003, 6, 14), MATS.chrome); kr.rotation.x = Math.PI / 2; g.add(kr);
    box(g, 0.034, 0.004, 0.04, std('#111'), 0, 0, 0.04, { cast: false });
    const st = box(g, 0.045, 0.005, 0.008, std('#f2f2f2'), 0, 0.001, 0.04, { cast: false }); st.rotation.y = 0.7;
  } else if (kind === 'ratinho') {
    sphere(g, 0.03, std('#8a8a8a', { roughness: 1 }), 0, 0.02, 0, { sx: 0.8, sy: 0.7, sz: 1.4 });
    cyl(g, 0.003, 0.002, 0.1, std('#8a8a8a'), 0, 0.012, -0.08, { rx: Math.PI / 2, seg: 4, cast: false });
  } else if (kind === 'carrinho') {
    box(g, 0.05, 0.025, 0.1, std('#c22', { roughness: 0.3 }), 0, 0.02, 0);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cyl(g, 0.012, 0.012, 0.01, std('#111'), sx * 0.028, 0.012, sz * 0.032, { rz: Math.PI / 2, seg: 8, cast: false });
  } else if (kind === 'bilhete') {
    plane(g, 0.12, 0.09, texMat(TX.paperNote(21, '#efe6cf'), { roughness: 0.9 }), 0, 0.002, 0, { rx: -Math.PI / 2, uv: false });
  }
  return g;
}

// ------------------------------------------------------------------ construção
export function buildAntes(world, F) {
  const g = world.begin('antes');
  const wallMat = texMat(TX.oldWallpaper(), { roughness: 0.95 });
  const floorMat = texMat(TX.woodFloor({ seed: 33, tones: ['#4a3020', '#3a2416', '#553722'] }), { roughness: 0.8 });
  const ceilMat = texMat(TX.paint('#b8ab90', { seed: 44, stains: 0.35, mottled: 0.2 }), { roughness: 1 });
  const blackM = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const darkWood = MATS.oakDark;

  // piso, teto, paredes
  slab(g, X(0), X(W), Z(0), Z(D), floorMat, 0);
  slab(g, X(0), X(W), Z(0), Z(D), ceilMat, HT, true);
  world.floor(X(0), X(W), Z(0), Z(D), 'wood', null, 'antes');
  wall(world, g, 'x', Z(0), X(0), X(W), wallMat, wallMat, [{ a: X(2.575), b: X(3.425), top: 2.12 }], { h: HT });
  wall(world, g, 'x', Z(D), X(0), X(W), wallMat, wallMat, [], { h: HT });
  wall(world, g, 'z', X(0), Z(0), Z(D), wallMat, wallMat, [], { h: HT });
  wall(world, g, 'z', X(W), Z(0), Z(D), wallMat, wallMat, [], { h: HT });
  // rodapé escuro
  for (const [ax, at, a, b] of [['x', Z(0.07), X(0), X(2.575)], ['x', Z(0.07), X(3.425), X(W)], ['x', Z(D - 0.07), X(0), X(W)]]) box(g, b - a, 0.09, 0.015, darkWood, (a + b) / 2, 0.045, at, { cast: false });
  box(g, 0.015, 0.09, D, darkWood, X(0.07), 0.045, Z(D / 2), { cast: false });
  box(g, 0.015, 0.09, D, darkWood, X(W - 0.07), 0.045, Z(D / 2), { cast: false });
  world.zone('antes', X(0), X(W), Z(0), Z(D));
  world.zone('antes_porta', X(2.2), X(3.8), Z(0), Z(1.4));
  world.zone('antes_mesa', X(1.8), X(4.2), Z(2.6), Z(6.4));
  world.zone('antes_vitrola', X(4.3), X(W), Z(6.8), Z(D));

  // vestíbulo escuro atrás da porta (de onde se volta para casa)
  slab(g, X(2.45), X(3.55), Z(-0.9), Z(0), floorMat, 0);
  world.floor(X(2.45), X(3.55), Z(-0.9), Z(0), 'wood', null, 'antes_vest');
  box(g, 0.05, HT, 0.9, blackM, X(2.47), HT / 2, Z(-0.45), { cast: false });
  box(g, 0.05, HT, 0.9, blackM, X(3.53), HT / 2, Z(-0.45), { cast: false });
  box(g, 1.1, HT, 0.05, blackM, X(3.0), HT / 2, Z(-0.88), { cast: false });
  box(g, 1.1, 0.05, 0.9, blackM, X(3.0), HT, Z(-0.45), { cast: false });
  world.collider(X(2.3), X(2.5), Z(-1), Z(0)); world.collider(X(3.5), X(3.7), Z(-1), Z(0)); world.collider(X(2.3), X(3.7), Z(-1.1), Z(-0.85));
  world.zone('antes_vest', X(2.45), X(3.55), Z(-0.9), Z(-0.12));
  const door = new Door(world, g, { id: 'porta_antes', name: 'porta de antes', hx: X(2.575), hz: Z(0), rot: 0, swing: -1, width: 0.85, mat: MATS.doorOld, houseDoor: true, startOpen: true });
  void door;

  // ---------------- a mesa posta
  const rugM = texMat(TX.oldRug(), { roughness: 1 });
  const rug = plane(g, 2.4, 3.6, rugM, X(3.0), 0.006, Z(4.4), { rx: -Math.PI / 2, uv: false }); rug.rotation.z = Math.PI / 2;
  const tb = group(g, X(3.0), 0, Z(4.4));
  box(tb, 1.1, 0.05, 2.6, darkWood, 0, 0.74, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(tb, 0.07, 0.72, 0.07, darkWood, sx * 0.47, 0.36, sz * 1.2);
  const cloth = std('#e7e1d2', { roughness: 0.95 });
  box(tb, 1.2, 0.012, 2.7, cloth, 0, 0.772, 0);
  box(tb, 0.012, 0.36, 2.7, cloth, -0.6, 0.6, 0); box(tb, 0.012, 0.36, 2.7, cloth, 0.6, 0.6, 0);
  box(tb, 1.2, 0.36, 0.012, cloth, 0, 0.6, -1.35); box(tb, 1.2, 0.36, 0.012, cloth, 0, 0.6, 1.35);
  world.collider(X(2.4), X(3.6), Z(3.05), Z(5.75), { los: false, tag: 'cover' });
  world.interact(tb, { id: 'antes_table', kind: 'examine', prompt: () => 'Olhar a mesa' });
  // cadeiras vazias
  const chairAt = (x, z, ry) => {
    const c = group(g, X(x), 0, Z(z), ry);
    box(c, 0.44, 0.04, 0.42, darkWood, 0, 0.46, 0);
    box(c, 0.44, 0.52, 0.04, darkWood, 0, 0.74, -0.2);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(c, 0.035, 0.46, 0.035, darkWood, sx * 0.19, 0.23, sz * 0.18);
    world.collider(X(x) - 0.24, X(x) + 0.24, Z(z) - 0.24, Z(z) + 0.24, { los: false });
  };
  for (const z of [3.7, 4.4, 5.1]) { chairAt(2.1, z, Math.PI / 2); chairAt(3.9, z, -Math.PI / 2); }
  chairAt(3.0, 2.75, 0);
  // a cadeira dele, na cabeceira (encosto alto)
  const hc = group(g, X(3.0), 0, Z(6.6), Math.PI);
  box(hc, 0.56, 0.05, 0.5, darkWood, 0, 0.47, 0);
  box(hc, 0.56, 0.9, 0.05, darkWood, 0, 0.95, -0.24);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(hc, 0.045, 0.47, 0.045, darkWood, sx * 0.24, 0.235, sz * 0.21);
  world.collider(X(2.72), X(3.28), Z(6.36), Z(6.86), { los: false });

  // pratos com as coisas que a família perdeu
  const plate = (x, z, r = 0.12) => { cyl(g, r, r * 0.8, 0.02, MATS.porcelain, X(x), 0.79, Z(z), { seg: 18, cast: false }); };
  const items = group(g, 0, 0, 0);
  [[2.72, 3.4], [3.28, 3.6], [2.75, 4.1], [3.25, 4.45], [2.72, 4.95], [3.28, 5.2]].forEach(([x, z]) => plate(x, z));
  lostItem(items, 'oculos', X(2.72), 0.815, Z(3.4), 0.4);
  lostItem(items, 'controle', X(3.28), 0.81, Z(3.6), -0.5);
  lostItem(items, 'chupeta', X(2.75), 0.81, Z(4.1), 0.8);
  lostItem(items, 'tenis', X(3.25), 0.8, Z(4.45), 2.2);
  [['#c9302c', 2.7, 4.95, 0.4], ['#f2d64b', 2.78, 4.9, 1.9], ['#2d7a4a', 2.66, 5.02, 3.1]].forEach(([c, x, z, r]) => lostItem(items, 'meia', X(x), 0.82, Z(z), r, c));
  lostItem(items, 'presilha', X(3.3), 0.81, Z(5.2), 0.6);
  lostItem(items, 'chaveiro', X(3.22), 0.806, Z(5.28), -0.3);
  lostItem(items, 'ratinho', X(2.85), 0.8, Z(3.85), 1.2);
  lostItem(items, 'carrinho', X(3.15), 0.8, Z(4.9), 0.3);
  // fotinhos, moedas, canetas, fone
  for (let i = 0; i < 8; i++) { const a = i * 0.8; box(items, 0.07, 0.003, 0.05, texMat(TX.familyPhoto('ok', 2 + (i % 3), 20 + i), { roughness: 0.7 }), X(2.85 + Math.sin(a) * 0.18), 0.797, Z(3.45 + i * 0.28), { ry: a, cast: false }); }
  for (let i = 0; i < 6; i++) cyl(items, 0.012, 0.012, 0.003, std('#c9a23a', { metalness: 0.7, roughness: 0.3 }), X(3.0 + Math.cos(i * 2.2) * 0.12), 0.8, Z(4.7 + Math.sin(i * 1.7) * 0.2), { seg: 10, cast: false });
  for (let i = 0; i < 3; i++) cyl(items, 0.004, 0.004, 0.14, std(['#1a3c9a', '#111', '#b22'][i]), X(2.95 + i * 0.05), 0.8, Z(3.3), { rz: Math.PI / 2, seg: 5, cast: false }).rotation.y = i * 0.5;
  world.name('antes_items', items);
  // o registro do chuveiro, perto dele
  plate(3.3, 5.55, 0.08);
  const reg = group(g, X(3.3), 0.81, Z(5.55));
  cyl(reg, 0.04, 0.04, 0.03, std('#999', { metalness: 0.8 }), 0, 0.015, 0, { seg: 12 });
  box(reg, 0.09, 0.012, 0.02, std('#c33'), 0, 0.035, 0);
  world.name('registro_antes', reg);
  world.interact(reg, { id: 'registro_antes', kind: 'pickup', prompt: () => 'Pegar o registro do chuveiro' });
  // o copo d'água com os olhos
  const glass = group(g, X(3.0), 0.79, Z(5.52));
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.034, 0.12, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfe2ea, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }));
  gl.position.y = 0.06; glass.add(gl);
  cyl(glass, 0.034, 0.034, 0.006, std('#cfe2ea', { transparent: true, opacity: 0.4 }), 0, 0.003, 0, { seg: 18, cast: false });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.034, 0.085, 18), new THREE.MeshStandardMaterial({ color: 0x9fb8b0, roughness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }));
  water.position.y = 0.047; glass.add(water);
  const eyes = [buildLooseEye(), buildLooseEye()];
  eyes[0].position.set(-0.012, 0.03, 0.008); eyes[0].rotation.set(0.3, 0.4, 0);
  eyes[1].position.set(0.013, 0.055, -0.006); eyes[1].rotation.set(-1.2, -0.3, 0.2); // um deles olha pra porta
  eyes.forEach((e) => glass.add(e));
  world.name('eyes_glass', { g: glass, eyes });
  world.interact(glass, { id: 'eyes_glass', kind: 'examine', prompt: () => 'Olhar o copo d\'água' });
  // o lençol em cima dele (sentado na cabeceira)
  const sg = group(g, X(3.0), 0, Z(6.6));
  const sm = sheet(sg, [
    { x0: -0.28, x1: 0.28, z0: -0.27, z1: 0.27, h: 0.5, r: 0.05, drop: 0.12 },
    { x0: -0.2, x1: 0.2, z0: -0.46, z1: -0.1, h: 0.62, r: 0.08, drop: 0.14 },
    { x0: -0.24, x1: 0.24, z0: -0.1, z1: 0.26, h: 1.5, r: 0.12, drop: 0.2 },
    { x0: -0.3, x1: 0.3, z0: -0.02, z1: 0.24, h: 1.42, r: 0.1, drop: 0.16 },
    { x0: -0.09, x1: 0.09, z0: -0.18, z1: 0.04, h: 1.9, r: 0.09, drop: 0.3 },
    { x0: -0.28, x1: 0.28, z0: 0.18, z1: 0.3, h: 1.28, r: 0.03, drop: 0.1 },
  ], { seed: 77, margin: 0.2 });
  void sm;
  sg.userData.dynamic = true;
  world.name('pale_sheet', sg);
  world.interact(sg, { id: 'pale_sheet', kind: 'examine', prompt: () => 'Alguém embaixo do lençol' });

  // ---------------- móveis cobertos
  const cover = (x0, x1, z0, z1, h, opts = {}) => {
    world.collider(X(x0), X(x1), Z(z0), Z(z1), opts.tall ? {} : { los: false, tag: 'cover' });
  };
  // sofá (oeste)
  const sf = group(g, X(0), 0, Z(0));
  sheet(sf, [{ x0: 0.12, x1: 1.02, z0: 3.0, z1: 5.2, h: 0.46 }, { x0: 0.12, x1: 0.4, z0: 3.0, z1: 5.2, h: 0.92, r: 0.08 }, { x0: 0.12, x1: 1.02, z0: 3.0, z1: 3.26, h: 0.64 }, { x0: 0.12, x1: 1.02, z0: 4.94, z1: 5.2, h: 0.64 }], { seed: 3 });
  cover(0.12, 1.02, 3.0, 5.2, 0.9);
  // mesinha redonda (esconderijo 3) — noroeste
  const rt = group(g, X(0), 0, Z(0));
  sheet(rt, [{ x0: 0.35, x1: 1.05, z0: 1.4, z1: 2.1, h: 0.72, r: 0.34, drop: 0.08 }], { seed: 5, margin: 0.18 });
  cover(0.3, 1.1, 1.35, 2.15, 0.72);
  // aparador (esconderijo 2) — oeste, depois do sofá
  const ap = group(g, X(0), 0, Z(0));
  sheet(ap, [{ x0: 0.12, x1: 0.72, z0: 5.9, z1: 7.0, h: 0.8 }], { seed: 7, margin: 0.2 });
  cover(0.12, 0.72, 5.9, 7.0, 0.8);
  // guarda-roupa alto
  const gr = group(g, X(0), 0, Z(0));
  sheet(gr, [{ x0: 0.1, x1: 0.7, z0: 7.3, z1: 8.5, h: 1.95, r: 0.06, drop: 0.08 }], { seed: 9, margin: 0.2 });
  cover(0.1, 0.7, 7.3, 8.5, 1.95, { tall: true });
  // piano (sul)
  const pn = group(g, X(0), 0, Z(0));
  sheet(pn, [{ x0: 1.3, x1: 2.8, z0: 8.35, z1: 8.92, h: 1.22, r: 0.05 }, { x0: 1.35, x1: 2.75, z0: 8.1, z1: 8.4, h: 0.74, r: 0.03 }], { seed: 11 });
  cover(1.3, 2.8, 8.1, 8.92, 1.22);
  // caixas empilhadas (leste)
  const cx = group(g, X(0), 0, Z(0));
  sheet(cx, [{ x0: 5.25, x1: 5.95, z0: 4.6, z1: 5.4, h: 0.9, r: 0.03 }, { x0: 5.4, x1: 5.95, z0: 4.7, z1: 5.25, h: 1.32, r: 0.03 }], { seed: 13 });
  cover(5.25, 5.95, 4.6, 5.4, 1.3);
  // escrivaninha (esconderijo 1) — leste, perto da entrada
  const ed = group(g, X(0), 0, Z(0));
  sheet(ed, [{ x0: 5.3, x1: 5.95, z0: 1.3, z1: 2.3, h: 0.78 }], { seed: 15, margin: 0.2 });
  cover(5.3, 5.95, 1.3, 2.3, 0.78);
  // relógio de pé (canto nordeste)
  const rl = group(g, X(0), 0, Z(0));
  sheet(rl, [{ x0: 5.55, x1: 5.9, z0: 0.12, z1: 0.5, h: 2.05, r: 0.05, drop: 0.06 }, { x0: 5.5, x1: 5.95, z0: 0.1, z1: 0.52, h: 0.4, r: 0.02 }], { seed: 17, margin: 0.14 });
  cover(5.5, 5.95, 0.1, 0.52, 2.05, { tall: true });
  // espelho de pé coberto (leste)
  const ep = group(g, X(0), 0, Z(0));
  const mirSheet = sheet(ep, [{ x0: 5.78, x1: 5.96, z0: 3.2, z1: 3.9, h: 1.85, r: 0.03, drop: 0.07 }], { seed: 19, margin: 0.16 });
  ep.userData.dynamic = true;
  world.name('antes_mirror_sheet', ep);
  cover(5.74, 5.96, 3.2, 3.9, 1.85, { tall: true });
  const mir = new Mirror(0.62, 1.55, { res: 384, maxDist: 7, strength: 0.95, tint: 0xeee2cc });
  mir.position.set(X(5.712), 0.98, Z(3.55)); mir.rotation.y = -Math.PI / 2;
  vis(mir, 'e');
  mir.visible = false;
  g.add(mir);
  // a moldura só aparece sem o lençol (senão ela atravessa o pano e rouba a mira)
  const mirFrame = box(g, 0.04, 1.62, 0.7, darkWood, X(5.75), 0.98, Z(3.55));
  mirFrame.visible = false;
  world.name('antes_mirror_frame', mirFrame);
  world.name('antes_mirror', mir);
  world.interact(ep, { id: 'antes_mirror', kind: 'examine', extra: [mir], prompt: () => 'Espelho coberto' });
  void mirSheet;
  // mesinha da entrada (com a folha de caderno)
  const me = group(g, X(1.05), 0, Z(0.3));
  box(me, 0.9, 0.04, 0.36, darkWood, 0, 0.74, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(me, 0.035, 0.72, 0.035, darkWood, sx * 0.4, 0.36, sz * 0.14);
  cover(0.6, 1.5, 0.12, 0.5, 0.75);
  const dp = group(g, X(1.0), 0.765, Z(0.3), 0.2);
  plane(dp, 0.16, 0.21, texMat(TX.paperNote(9, '#e6dfcc'), { roughness: 0.9 }), 0, 0.001, 0, { rx: -Math.PI / 2, uv: false });
  world.interact(dp, { id: 'antes_diary1', kind: 'examine', prompt: () => 'Ler a folha de caderno' });
  // calendário e plaquinha
  const cal = plane(g, 0.3, 0.38, texMat(TX.oldCalendar(), { roughness: 0.9 }), X(1.4), 1.55, Z(0.075), { uv: false });
  world.interact(cal, { id: 'antes_calendar', kind: 'examine', prompt: () => 'Calendário' });
  const npl = group(g, X(3.85), 1.45, Z(0.07));
  box(npl, 0.34, 0.18, 0.02, darkWood, 0, 0, 0);
  const npFace = plane(npl, 0.3, 0.15, texMat(TX.nameplate(false), { roughness: 0.6 }), 0, 0, 0.011, { uv: false });
  vis(npFace, 'evm');
  const npCam = plane(npl, 0.3, 0.15, texMat(TX.nameplate(true), { roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0, 0.013, { uv: false });
  vis(npCam, 'k');
  world.interact(npl, { id: 'antes_nameplate', kind: 'examine', prompt: () => 'Plaquinha da porta' });
  // fotos antigas na parede (acima do sofá)
  const fotos = group(g, X(0.07), 1.62, Z(4.1), Math.PI / 2);
  for (let i = 0; i < 3; i++) P.photoFrame(group(fotos, -0.5 + i * 0.5, (i % 2) * 0.12, 0), TX.familyPhoto(i === 0 ? 'ok' : 'blank', i === 0 ? 2 : 1, 30 + i), 0.24, 0.3, false);
  world.interact(fotos, { id: 'antes_photos', kind: 'examine', prompt: () => 'Fotos antigas' });
  // janela tapada com tábuas (sul)
  const wn = group(g, X(4.0), 1.5, Z(D - 0.07), Math.PI);
  box(wn, 1.2, 1.1, 0.03, basic('#121a2c'), 0, 0, 0.01, { cast: false });
  for (let i = 0; i < 5; i++) { const b = box(wn, 1.3, 0.16, 0.04, texMat(TX.woodGrain('#8a6c4c', { seed: 40 + i }), { roughness: 0.9 }), 0, -0.44 + i * 0.22, -0.03); b.rotation.z = (i % 2 ? 0.05 : -0.04); }

  // ---------------- a vitrola
  const vt = group(g, X(5.67), 0, Z(7.9), -Math.PI / 2);
  box(vt, 0.8, 0.8, 0.5, darkWood, 0, 0.4, 0);
  box(vt, 0.84, 0.03, 0.54, darkWood, 0, 0.815, 0);
  const plat = cyl(vt, 0.16, 0.16, 0.02, std('#2a2a2a', { roughness: 0.4 }), -0.08, 0.84, 0, { seg: 24 }); void plat;
  const disc = cyl(vt, 0.15, 0.15, 0.006, std('#0c0c0c', { roughness: 0.25 }), -0.08, 0.853, 0, { seg: 28 });
  cyl(vt, 0.045, 0.045, 0.007, std('#8a2a20'), -0.08, 0.857, 0, { seg: 16, cast: false });
  disc.userData.dynamic = true;
  const arm = group(vt, 0.22, 0.87, 0.15);
  box(arm, 0.02, 0.02, 0.26, MATS.chrome, 0, 0, -0.13);
  box(arm, 0.03, 0.025, 0.04, MATS.chrome, 0, -0.01, -0.26);
  arm.userData.dynamic = true;
  world.name('antes_disc', disc);
  world.name('antes_arm', arm);
  cover(5.4, 5.95, 7.5, 8.3, 0.85);
  world.interact(vt, { id: 'vitrola', kind: 'examine', prompt: () => 'Vitrola' });
  // capas de disco e a segunda folha
  box(g, 0.32, 0.32, 0.01, std('#6a2a3a'), X(5.5), 0.17, Z(7.4), { ry: 0.3 });
  const dp2 = group(g, X(5.55), 0.822, Z(8.2), 0.4);
  plane(dp2, 0.16, 0.21, texMat(TX.paperNote(12, '#e1d8c2'), { roughness: 0.9 }), 0, 0.001, 0, { rx: -Math.PI / 2, uv: false });
  world.interact(dp2, { id: 'antes_diary2', kind: 'examine', prompt: () => 'Ler a outra folha' });
  // abajur de pé
  const ab = group(g, X(5.2), 0, Z(8.62));
  cyl(ab, 0.13, 0.15, 0.03, darkWood, 0, 0.015, 0, { seg: 14 });
  cyl(ab, 0.012, 0.012, 1.45, MATS.metal, 0, 0.74, 0, { seg: 6 });
  cyl(ab, 0.13, 0.2, 0.26, std('#c9a878', { roughness: 1, side: THREE.DoubleSide, emissive: '#3a2410' }), 0, 1.5, 0, { seg: 16, open: true });
  world.collider(X(5.08), X(5.32), Z(8.5), Z(8.74), { los: false });

  // ---------------- luz
  const lamp = group(g, X(3.0), HT, Z(4.4));
  cyl(lamp, 0.006, 0.006, 0.45, std('#222'), 0, -0.22, 0, { seg: 4, cast: false });
  const shade = cyl(lamp, 0.08, 0.26, 0.2, std('#d8c49a', { roughness: 1, side: THREE.DoubleSide, emissive: '#402a10' }), 0, -0.52, 0, { seg: 18, open: true });
  void shade;
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xffe0a8 });
  sphere(lamp, 0.045, bulbM, 0, -0.55, 0, { cast: false });
  lamp.userData.dynamic = true;
  world.name('antes_lamp', lamp);
  world.fixture(X(3.0), 2.05, Z(4.4), { id: 'antes_lamp', room: 'antes', intensity: 3.4, dist: 7, color: 0xffc78a, bulb: bulbM });
  world.fixture(X(5.25), 1.45, Z(8.5), { id: 'antes_vit', room: 'antes', intensity: 1.6, dist: 3.6, color: 0xffb070 });
  world.fixture(X(4.0), 1.6, Z(D - 0.4), { id: 'antes_moon', room: 'antes', intensity: 0.7, dist: 4, color: 0x7f96c8 });
  world.update((dt) => { lamp.userData.t = (lamp.userData.t || 0) + dt; lamp.rotation.z = Math.sin(lamp.userData.t * 0.7) * 0.025; lamp.rotation.x = Math.sin(lamp.userData.t * 0.53) * 0.02; });

  // marcas de mão por toda parte
  const hp = [[0.075, 1.3, 2.2, 'x+'], [0.075, 1.15, 6.0, 'x+'], [W - 0.075, 1.35, 6.3, 'x-'], [W - 0.075, 1.2, 2.8, 'x-'], [2.0, 1.4, D - 0.075, 'z-'], [4.9, 1.25, D - 0.075, 'z-'], [2.1, 1.5, 0.075, 'z+'], [4.4, 1.2, 0.075, 'z+']];
  hp.forEach(([x, y, z, f], i) => handprint(g, X(x), y, Z(z), f, { seed: 3 + i, rot: (i % 3 - 1) * 0.3 }));

  // ---------------- esconderijos (debaixo dos lençóis)
  const hide = (id, prompt, obj, cam, exit, feel) => {
    world.interact(obj, { id, kind: 'hide', prompt: () => prompt });
    world.hide({ id, kind: 'sheet', cam, exit, feel });
  };
  hide('hide_antes_mesa', 'Esconder-se debaixo do lençol', ed, { x: X(5.62), y: 0.42, z: Z(1.8), yaw: Math.PI / 2, pitch: -0.05 }, { x: X(4.95), z: Z(1.8) }, { x: X(5.1), z: Z(1.8) });
  hide('hide_antes_aparador', 'Esconder-se debaixo do lençol', ap, { x: X(0.42), y: 0.42, z: Z(6.45), yaw: -Math.PI / 2, pitch: -0.05 }, { x: X(1.1), z: Z(6.45) }, { x: X(0.95), z: Z(6.45) });
  hide('hide_antes_redonda', 'Esconder-se debaixo do lençol', rt, { x: X(0.7), y: 0.4, z: Z(1.75), yaw: -Math.PI / 2 - 0.3, pitch: -0.05 }, { x: X(1.4), z: Z(1.9) }, { x: X(1.25), z: Z(1.75) });
  const tbHit = group(g, X(2.385), 0.42, Z(4.4));
  box(tbHit, 0.03, 0.62, 2.3, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, { cast: false });
  hide('hide_antes_toalha', 'Esconder-se embaixo da mesa', tbHit,{ x: X(3.0), y: 0.42, z: Z(4.0), yaw: Math.PI, pitch: -0.08 }, { x: X(1.75), z: Z(4.05) }, { x: X(2.2), z: Z(4.05) });

  // navegação dele
  const N = (id, x, z) => world.nav(id, X(x), Z(z), 'antes');
  N('a_door', 3.0, 0.9); N('a_nw', 1.9, 1.05); N('a_ne', 4.3, 1.05);
  N('a_w0', 1.55, 2.6); N('a_w1', 1.55, 4.1); N('a_w2', 1.55, 5.75); N('a_sw', 1.45, 7.5);
  N('a_e0', 4.6, 2.6); N('a_e1', 4.6, 4.1); N('a_e2', 4.55, 5.75); N('a_se', 4.6, 7.45);
  N('a_s', 3.0, 7.55); N('a_chair', 3.0, 6.05);
  const Lk = (a, b) => world.link(a, b);
  Lk('a_door', 'a_nw'); Lk('a_door', 'a_ne'); Lk('a_nw', 'a_w0'); Lk('a_ne', 'a_e0');
  Lk('a_w0', 'a_w1'); Lk('a_w1', 'a_w2'); Lk('a_w2', 'a_sw'); Lk('a_e0', 'a_e1'); Lk('a_e1', 'a_e2'); Lk('a_e2', 'a_se');
  Lk('a_sw', 'a_s'); Lk('a_se', 'a_s'); Lk('a_w2', 'a_chair'); Lk('a_e2', 'a_chair');
  g.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial && !o.material.transparent) o.castShadow = false; });
  world.end();
}

// estado dinâmico do apartamento de antes
export function applyAntes(world, F) {
  const reg = world.get('registro_antes'); if (reg) reg.visible = !F.hasRegistro && !F.valveFixed;
  const eg = world.get('eyes_glass'); if (eg) eg.eyes.forEach((e) => { e.visible = !F.antesEyesOut; });
  const sh = world.get('pale_sheet');
  if (sh) {
    const off = !!F.antesEyesOut || !!F.antesSheetOff;
    sh.position.set(X(3.0), off ? -0.02 : 0, Z(6.6) + (off ? 0.55 : 0));
    sh.scale.set(1, off ? 0.04 : 1, 1);
  }
  const mir = world.get('antes_mirror'), ms = world.get('antes_mirror_sheet');
  if (mir) mir.visible = !!F.antesMirrorOpen;
  if (ms) ms.visible = !F.antesMirrorOpen;
  const mf = world.get('antes_mirror_frame'); if (mf) mf.visible = !!F.antesMirrorOpen;
  const d = world.doors.get('porta_antes');
  if (d) { d.locked = !!F.antesLocked; d.lockMsg = 'Não abre. Não enquanto ele estiver acordado.'; }
}
