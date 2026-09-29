// Ajudantes de geometria e materiais.
import * as THREE from 'three';
import * as TX from '../core/textures.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const matCache = new Map();

// material padrão com cache por chave
export function M(key, make) {
  if (!matCache.has(key)) matCache.set(key, make());
  return matCache.get(key);
}

export function std(color, opts = {}) {
  const key = 'std' + color + JSON.stringify(opts, (k, v) => (v && v.isTexture ? v.uuid : v));
  return M(key, () => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...opts }));
}

export function texMat(texture, opts = {}) {
  const key = 'tex' + texture.uuid + JSON.stringify(opts);
  return M(key, () => new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0, ...opts }));
}

export function basic(color, opts = {}) {
  const key = 'basic' + color + JSON.stringify(opts, (k, v) => (v && v.isTexture ? v.uuid : v));
  return M(key, () => new THREE.MeshBasicMaterial({ color, ...opts }));
}

export const MATS = {
  get white() { return texMat(TX.paint('#e9e6df', { seed: 1 }), { roughness: 0.95 }); },
  get whiteDirty() { return texMat(TX.paint('#dcd8cf', { seed: 2, stains: 0.12 }), { roughness: 0.95 }); },
  get gray() { return texMat(TX.paint('#7d8186', { seed: 3, mottled: 0.08 }), { roughness: 0.95 }); },
  get darkGray() { return texMat(TX.paint('#4a4d52', { seed: 4, mottled: 0.1 }), { roughness: 0.95 }); },
  get purple() { return texMat(TX.purpleWall(), { roughness: 0.95 }); },
  get ceiling() { return texMat(TX.paint('#eeece6', { seed: 5 }), { roughness: 1 }); },
  get woodFloor() { return texMat(TX.woodFloor(), { roughness: 0.6 }); },
  get kitchenFloor() { return texMat(TX.floorTile('#d9cdb3', { diagonal: true, size: 1.3 }), { roughness: 0.45 }); },
  get serviceFloor() { return texMat(TX.floorTile('#d3cfc6', { size: 1.0, seed: 4 }), { roughness: 0.5 }); },
  get bathFloor() { return texMat(TX.floorTile('#b9c0c4', { size: 0.8, seed: 8, grout: '#7d878c' }), { roughness: 0.4 }); },
  get balconyFloor() { return texMat(TX.floorTile('#a89e8e', { size: 0.9, seed: 9 }), { roughness: 0.6 }); },
  get bathWall() { return texMat(TX.wallTile('#c9d0d4', 0.3), { roughness: 0.3 }); },
  get kitchenWall() { return texMat(TX.wallTile('#ecebe6', 0.32, { grout: '#b8b6ae' }), { roughness: 0.3 }); },
  get doorWood() { return texMat(TX.doorWood({ pattern: 'grooves' }), { roughness: 0.45 }); },
  get doorEntrance() { return texMat(TX.doorWood({ pattern: 'diag', base: '#8a4f2a' }), { roughness: 0.45 }); },
  get doorOld() { return texMat(TX.doorWood({ pattern: 'old', base: '#3a2216', seed: 44 }), { roughness: 0.7 }); },
  get oak() { return texMat(TX.woodGrain('#b98a5a'), { roughness: 0.6 }); },
  get oakDark() { return texMat(TX.woodGrain('#7a5234', { seed: 3 }), { roughness: 0.6 }); },
  get rustic() { return texMat(TX.woodGrain('#8d6a44', { seed: 5, size: 0.7 }), { roughness: 0.7 }); },
  get cream() { return std('#e8e0cc', { roughness: 0.6 }); },
  get whiteFurn() { return std('#eeeeea', { roughness: 0.5 }); },
  get black() { return std('#141414', { roughness: 0.5 }); },
  get blackMatte() { return std('#1c1c1c', { roughness: 0.9 }); },
  get metal() { return std('#9aa0a6', { roughness: 0.35, metalness: 0.7 }); },
  get chrome() { return std('#d0d4d8', { roughness: 0.18, metalness: 0.95 }); },
  get sofa() { return texMat(TX.fabric('#6c6a67'), { roughness: 1 }); },
  get blanket() { return texMat(TX.blanket(), { roughness: 1 }); },
  get knit() { return texMat(TX.knit(), { roughness: 1 }); },
  get curtainBeige() { return texMat(TX.curtain('#bfae96'), { roughness: 1, side: THREE.DoubleSide }); },
  get curtainWhite() { return texMat(TX.curtain('#e8e6e2'), { roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }); },
  get granite() { return texMat(TX.granite(), { roughness: 0.25 }); },
  get sheetPink() { return texMat(TX.fabric('#d9a3ad', { seed: 3 }), { roughness: 1 }); },
  get sheetWhite() { return texMat(TX.fabric('#e4e2dc', { seed: 4 }), { roughness: 1 }); },
  get sheetLilac() { return texMat(TX.fabric('#c9b3d6', { seed: 5 }), { roughness: 1 }); },
  get glass() { return std('#9fb8c8', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.18 }); },
  get screenOff() { return std('#050607', { roughness: 0.15, metalness: 0.3 }); },
  get porcelain() { return std('#f1f1ee', { roughness: 0.2 }); },
  get skin() { return std('#8d5a3b', { roughness: 0.7 }); },
};

// Caixa com UV em escala de mundo (texturas ficam com densidade constante).
export function boxGeo(w, h, d, size = 1) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (size) {
    const uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
      const [su, sv] = dims[f];
      for (let i = 0; i < 4; i++) {
        const k = f * 4 + i;
        uv.setXY(k, uv.getX(k) * su / size, uv.getY(k) * sv / size);
      }
    }
  }
  return g;
}

export function planeGeo(w, h, size = 1) {
  const g = new THREE.PlaneGeometry(w, h);
  if (size) {
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / size, uv.getY(i) * h / size);
  }
  return g;
}

function texSize(mat) {
  if (Array.isArray(mat)) mat = mat[0];
  return mat && mat.map && mat.map.userData.size ? mat.map.userData.size : 1;
}

// cria uma caixa e adiciona ao pai. p = centro.
export function box(parent, w, h, d, mat, x, y, z, opts = {}) {
  const geo = opts.uv === false ? new THREE.BoxGeometry(w, h, d) : boxGeo(w, h, d, opts.uvSize || texSize(mat));
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (opts.ry) m.rotation.y = opts.ry;
  if (opts.rx) m.rotation.x = opts.rx;
  if (opts.rz) m.rotation.z = opts.rz;
  m.castShadow = opts.cast !== false;
  m.receiveShadow = opts.receive !== false;
  parent.add(m);
  return m;
}

export function cyl(parent, rt, rb, h, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, opts.seg || 16, 1, !!opts.open), mat);
  m.position.set(x, y, z);
  if (opts.rx) m.rotation.x = opts.rx;
  if (opts.rz) m.rotation.z = opts.rz;
  if (opts.ry) m.rotation.y = opts.ry;
  m.castShadow = opts.cast !== false;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function sphere(parent, r, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, opts.seg || 14, opts.seg2 || 10), mat);
  m.position.set(x, y, z);
  if (opts.sx) m.scale.set(opts.sx, opts.sy || 1, opts.sz || 1);
  m.castShadow = opts.cast !== false;
  parent.add(m);
  return m;
}

export function plane(parent, w, h, mat, x, y, z, opts = {}) {
  const m = new THREE.Mesh(opts.uv === false ? new THREE.PlaneGeometry(w, h) : planeGeo(w, h, opts.uvSize || texSize(mat)), mat);
  m.position.set(x, y, z);
  if (opts.rx !== undefined) m.rotation.x = opts.rx;
  if (opts.ry !== undefined) m.rotation.y = opts.ry;
  if (opts.rz !== undefined) m.rotation.z = opts.rz;
  m.receiveShadow = opts.receive !== false;
  m.castShadow = !!opts.cast;
  parent.add(m);
  return m;
}

export function group(parent, x = 0, y = 0, z = 0, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  return g;
}

// junta todas as malhas de um grupo por material (objetos estáticos complexos)
export function compact(g) {
  g.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(g.matrixWorld).invert();
  const buckets = new Map();
  const victims = [];
  g.traverse((o) => {
    if (!o.isMesh || o === g || Array.isArray(o.material)) return;
    const src = o.geometry;
    if (!src.attributes.uv || !src.attributes.normal) return;
    const sub = new THREE.BufferGeometry();
    sub.setAttribute('position', src.attributes.position.clone());
    sub.setAttribute('normal', src.attributes.normal.clone());
    sub.setAttribute('uv', src.attributes.uv.clone());
    if (src.index) sub.setIndex(new THREE.BufferAttribute(new Uint32Array(src.index.array), 1));
    else { const n = src.attributes.position.count; const ia = new Uint32Array(n); for (let i = 0; i < n; i++) ia[i] = i; sub.setIndex(new THREE.BufferAttribute(ia, 1)); }
    sub.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const k = o.material.uuid + (o.castShadow ? 1 : 0);
    if (!buckets.has(k)) buckets.set(k, { m: o.material, cast: o.castShadow, geos: [] });
    buckets.get(k).geos.push(sub);
    victims.push(o);
  });
  victims.forEach((o) => o.parent.remove(o));
  for (const b of buckets.values()) {
    const merged = mergeGeometries(b.geos, false);
    b.geos.forEach((x) => x.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, b.m);
    mesh.castShadow = b.cast; mesh.receiveShadow = true;
    g.add(mesh);
  }
  return g;
}
