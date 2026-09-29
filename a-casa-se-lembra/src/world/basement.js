// A memória da casa: a sala de anos atrás, congelada no aniversário de 5 anos.
// Fica "embaixo" do apartamento (que não tem embaixo). Deslocada +100 em x.
// Também guarda a Hora Nenhuma (segredo opcional).
import * as THREE from 'three';
import { box, cyl, sphere, plane, group, MATS, std, texMat, basic } from './geom.js';
import * as P from './props.js';
import * as TX from '../core/textures.js';
import { wall, H } from './house.js';
import { Door } from './doors.js';
import { T } from '../core/settings.js';
import { mulberry32 } from '../core/util.js';
import { handprint } from './antes.js';
import { vis } from './layers.js';

export const BX = 100;
export const BY = -2.9;

function basementHeight(x, z) {
  if (z < 8.4) return 0;
  if (z < 10.3) return -Math.floor(((z - 8.4) / 1.9) * 8) / 8 * 1.45;
  if (z < 12.2) return -1.45 - Math.floor(((z - 10.3) / 1.9) * 8) / 8 * 1.45;
  return BY;
}

function bannerTex(text) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
  const x = c.getContext('2d');
  const cols = ['#e33', '#fc3', '#36c', '#3a3', '#e8327a', '#f80'];
  const letters = text.split('');
  const w = 1024 / letters.length;
  letters.forEach((l, i) => {
    x.fillStyle = cols[i % cols.length];
    x.beginPath(); x.moveTo(i * w + 4, 10); x.lineTo(i * w + w - 4, 10); x.lineTo(i * w + w / 2, 150); x.closePath(); x.fill();
    x.fillStyle = '#fff'; x.font = 'bold 64px Georgia'; x.textAlign = 'center'; x.fillText(l, i * w + w / 2, 80);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildBasement(world, F) {
  const g = world.begin('porao');
  const oldFloor = texMat(TX.woodFloor({ seed: 21, tones: ['#3a2618', '#2e1d12', '#452c1b'] }), { roughness: 0.9 });
  const yellow = texMat(TX.paint('#c9b27a', { seed: 41, mottled: 0.12 }), { roughness: 0.95 });
  const oldWall = texMat(TX.paint('#6b5a44', { seed: 31, stains: 0.35, mottled: 0.2 }), { roughness: 1 });
  const dark = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // ---------------- escada (cópia exata da escada do apartamento + continuação)
  const run = 1.9 / 8, rise = 1.45 / 8;
  for (let i = 0; i < 16; i++) box(g, 2.0, 0.2, run, oldFloor, BX + 12.3, -rise * i - 0.1, 8.4 + run * (i + 0.5));
  wall(world, g, 'z', BX + 11.1, 7.7, 12.2, MATS.white, oldWall, [], { y0: -3.5, h: 2.6 });
  wall(world, g, 'z', BX + 13.3, 7.7, 12.2, oldWall, MATS.white, [], { y0: -3.5, h: 2.6 });
  world.collider(BX + 11.1, BX + 13.3, 7.6, 8.35, { los: true }); // topo: escuridão
  box(g, 2.3, 3.2, 0.1, dark, BX + 12.2, 0.6, 8.3, { cast: false });
  slab(g, BX + 11.1, BX + 13.3, 7.7, 12.2, oldWall, 1.3);
  world.floor(BX + 11.1, BX + 13.3, 8.3, 12.25, 'stairs', basementHeight, 'porao_escada');
  world.zone('porao_escada', BX + 11.1, BX + 13.3, 7.7, 12.2);
  // marcas de mão compridas nas paredes da escada: alguém sobe e desce por aqui, tateando
  const hps = group(g, 0, 0, 0);
  [[11.16, 9.0, 'x+', 0.3], [13.24, 9.7, 'x-', -0.2], [11.16, 10.5, 'x+', -0.4], [13.24, 11.2, 'x-', 0.35], [11.16, 11.9, 'x+', 0.1]]
    .forEach(([x, z, f, r], i) => handprint(hps, BX + x, basementHeight(BX + x, z) + 1.25 + (i % 2) * 0.2, z, f, { seed: 40 + i, rot: r, size: 0.27, opacity: 0.6 }));
  vis(hps, 'ec');
  world.zone('porao_topo', BX + 11.1, BX + 13.3, 7.7, 9.35);

  // ---------------- a sala de antigamente (paredes amarelas)
  const x0 = BX + 10.2, x1 = BX + 14.4, z0 = 12.2, z1 = 20.2;
  slab(g, x0, x1, z0, z1, oldFloor, BY);
  slab(g, x0, x1, z0, z1, MATS.ceiling, BY + H, true);
  world.floor(x0, x1, z0, z1, 'wood', () => BY, 'porao');
  wall(world, g, 'x', z0, x0, x1, yellow, yellow, [{ a: BX + 11.1, b: BX + 13.3, top: BY + 2.4 }], { y0: BY, h: BY + H });
  wall(world, g, 'x', z1, x0, x1, yellow, yellow, [], { y0: BY, h: BY + H });
  wall(world, g, 'z', x0, z0, z1, oldWall, yellow, [{ a: 15.8, b: 16.62, top: BY + 2.1 }], { y0: BY, h: BY + H });
  wall(world, g, 'z', x1, z0, z1, yellow, oldWall, [], { y0: BY, h: BY + H });
  world.zone('porao', x0, x1, z0, z1);

  // mesa da festa com bolo de 5 velas (chamas paradas)
  const tb = group(g, BX + 12.3, BY, 16.2);
  box(tb, 1.6, 0.04, 0.9, std('#f4f1ea'), 0, 0.74, 0);
  box(tb, 1.62, 0.3, 0.92, std('#f4f1ea', { roughness: 1 }), 0, 0.6, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(tb, 0.05, 0.72, 0.05, MATS.oakDark, sx * 0.72, 0.36, sz * 0.38);
  const cake = group(tb, 0, 0.76, 0);
  cyl(cake, 0.22, 0.22, 0.2, std('#f4c3d6'), 0, 0.1, 0, { seg: 24 });
  cyl(cake, 0.16, 0.16, 0.12, std('#fbe2ea'), 0, 0.26, 0, { seg: 24 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    cyl(cake, 0.01, 0.01, 0.1, std('#fff'), Math.cos(a) * 0.1, 0.37, Math.sin(a) * 0.1, { seg: 6 });
    sphere(cake, 0.018, basic('#ffcc55'), Math.cos(a) * 0.1, 0.44, Math.sin(a) * 0.1, { sy: 1.8, seg: 8, seg2: 6, cast: false });
  }
  world.collider(BX + 11.5, BX + 13.1, 15.75, 16.65, { los: false });
  world.interact(cake, { id: 'cake', kind: 'examine', prompt: () => 'Olhar o bolo' });
  // chapéus de festa e copinhos
  const hc = ['#e33', '#36c', '#fc3', '#3a3'];
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), std(hc[i % 4])); c.position.set(BX + 11.7 + (i % 3) * 0.5, BY + 0.84, 15.9 + Math.floor(i / 3) * 0.6); g.add(c); }
  // balões parados no ar
  const rnd = mulberry32(55);
  for (let i = 0; i < 18; i++) {
    const col = ['#e33', '#36c', '#fc3', '#3a3', '#e8327a', '#fff'][i % 6];
    const bx = x0 + 0.4 + rnd() * 3.4, bz = z0 + 0.6 + rnd() * 7.2, by = BY + 1.7 + rnd() * 0.7;
    sphere(g, 0.15, std(col, { roughness: 0.3 }), bx, by, bz, { sy: 1.2 });
    box(g, 0.003, 0.8, 0.003, std('#ddd'), bx, by - 0.55, bz, { cast: false });
  }
  // faixa de parabéns
  const bn = plane(g, 3.6, 0.55, new THREE.MeshBasicMaterial({ map: bannerTex(T('PARABÉNS {RAFA}')), transparent: true, side: THREE.DoubleSide }), BX + 12.3, BY + 2.2, 19.9, { uv: false, ry: Math.PI });
  void bn;
  // serpentinas
  for (let i = 0; i < 5; i++) { const s = box(g, 4.0, 0.02, 0.02, std(['#e33', '#fc3', '#36c', '#3a3', '#e8327a'][i]), BX + 12.3, BY + 2.4 - (i % 2) * 0.1, 13 + i * 1.5, { cast: false }); s.rotation.z = (i % 2 ? 0.05 : -0.05); }
  // rack antigo com TV de tubo
  const rk = group(g, x0 + 0.3, BY, 15.0, Math.PI / 2); P.rack(rk, 1.8);
  world.collider(x0, x0 + 0.52, 14.1, 15.9, { los: false });
  const crt = group(g, x0 + 0.35, BY + 0.55, 15.0, Math.PI / 2);
  box(crt, 0.7, 0.55, 0.55, std('#2a2825', { roughness: 0.6 }), 0, 0.28, -0.1);
  const crtScreen = plane(crt, 0.5, 0.38, basic('#1a2a22'), 0, 0.3, 0.181, { uv: false });
  world.name('crt_screen', crtScreen);
  world.interact(crt, { id: 'crt', kind: 'examine', prompt: () => 'TV antiga' });
  // sofá marrom antigo
  const sf = group(g, x1 - 0.5, BY, 15.6, -Math.PI / 2);
  const brown = texMat(TX.fabric('#6a4a32'), { roughness: 1 });
  box(sf, 2.2, 0.42, 0.9, brown, 0, 0.21, 0); box(sf, 2.2, 0.55, 0.2, brown, 0, 0.62, -0.35);
  world.collider(x1 - 0.95, x1, 14.5, 16.7, { los: false });
  // o quadro, pendurado do jeito certo naquela época
  const pt = group(g, BX + 12.3, BY + 1.55, z1 - 0.07, Math.PI); P.painting(pt, false);
  // porta-chaves com cinco chaves
  const kh = group(g, BX + 11.0, BY + 1.5, z1 - 0.07, Math.PI); P.keyHolder(kh, 5, false);
  // porta com um relógio desenhado (Hora Nenhuma)
  const clockDoorMat = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#2a1a10'; x.fillRect(0, 0, 256, 512);
    x.strokeStyle = '#d8c89a'; x.lineWidth = 6;
    x.beginPath(); x.arc(128, 200, 60, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.moveTo(128, 200); x.lineTo(128, 160); x.moveTo(128, 200); x.lineTo(160, 210); x.stroke();
    x.fillStyle = '#d8c89a'; x.font = 'italic 26px Georgia'; x.textAlign = 'center'; x.fillText('?', 128, 320);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 });
  })();
  new Door(world, g, { id: 'porta_relogio', name: 'porta do relógio', hx: x0, hz: 15.8, y: BY, rot: -Math.PI / 2, swing: -1, width: 0.82, mat: clockDoorMat, houseDoor: true });
  // luzes quentes
  world.fixture(BX + 12.3, BY + 2.3, 14.5, { id: 'porao1', room: 'porao', intensity: 5, dist: 7, color: 0xffc27a });
  world.fixture(BX + 12.3, BY + 2.3, 18.3, { id: 'porao2', room: 'porao', intensity: 4, dist: 6, color: 0xffb46a });
  world.fixture(BX + 12.2, BY + 1.8, 11.5, { id: 'porao_escada', room: 'porao_escada', intensity: 1.2, dist: 4, color: 0xffa050 });

  // ---------------- a Hora Nenhuma
  const vx0 = BX - 2, vx1 = x0, vz0 = 9, vz1 = 24;
  const voidFloor = new THREE.Mesh(new THREE.PlaneGeometry(vx1 - vx0, vz1 - vz0), std('#0b0a0f', { roughness: 1 }));
  voidFloor.rotation.x = -Math.PI / 2; voidFloor.position.set((vx0 + vx1) / 2, BY, (vz0 + vz1) / 2); voidFloor.receiveShadow = true; g.add(voidFloor);
  world.floor(vx0, vx1 - 0.07, vz0, vz1, 'stairs', () => BY, 'horanenhuma');
  world.collider(vx0 - 0.2, vx0, vz0, vz1); world.collider(vx0, vx1, vz0 - 0.2, vz0); world.collider(vx0, vx1, vz1, vz1 + 0.2);
  world.zone('horanenhuma', vx0, vx1 - 0.1, vz0, vz1);
  world.collider(vx1 - 0.1, vx1, vz0, z0); world.collider(vx1 - 0.1, vx1, z1, vz1);
  // chão de "estrelas"
  for (let i = 0; i < 160; i++) sphere(g, 0.01 + rnd() * 0.02, basic('#8a8aa8'), vx0 + rnd() * (vx1 - vx0), BY + 0.005, vz0 + rnd() * (vz1 - vz0), { seg: 4, seg2: 3, cast: false });
  // poste de luz
  const lp = group(g, BX + 3.5, BY, 16.5);
  cyl(lp, 0.06, 0.09, 3.2, std('#1c1c20', { metalness: 0.6 }), 0, 1.6, 0, { seg: 10 });
  box(lp, 0.5, 0.06, 0.06, std('#1c1c20'), 0.2, 3.1, 0);
  sphere(lp, 0.14, basic('#ffe2a8'), 0.42, 2.95, 0, { cast: false });
  world.collider(BX + 3.4, BX + 3.6, 16.4, 16.6, { los: false });
  world.interact(lp, { id: 'lamppost', kind: 'examine', prompt: () => 'Poste de luz' });
  world.fixture(BX + 3.9, BY + 2.9, 16.5, { id: 'lamppost', room: 'horanenhuma', intensity: 9, dist: 9, color: 0xffd79a });
  // balde
  const bk = group(g, BX + 5.0, BY, 17.4);
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 16, 1, true), std('#6a6a70', { metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide }));
  bucket.position.y = 0.17; bk.add(bucket);
  cyl(bk, 0.16, 0.16, 0.01, basic('#000000'), 0, 0.02, 0, { seg: 16 });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 4, 16, Math.PI), std('#555'));
  handle.position.y = 0.34; bk.add(handle);
  world.interact(bk, { id: 'bucket', kind: 'examine', prompt: () => 'Balde' });
  // banquinho com o relógio-ovo
  const st = group(g, BX + 2.4, BY, 17.2); P.stool(st, 0.5);
  const egg = group(g, BX + 2.4, BY + 0.56, 17.2);
  sphere(egg, 0.06, std('#e9dcc0', { roughness: 0.4, metalness: 0.2 }), 0, 0.06, 0, { sy: 1.3 });
  cyl(egg, 0.012, 0.012, 0.02, std('#c9a23a', { metalness: 0.8 }), 0, 0.15, 0, { seg: 8 });
  world.name('egg_watch', egg);
  world.interact(egg, { id: 'egg_watch', kind: 'pickup', prompt: () => 'Pegar o relógio' });
  world.nav('pb0', BX + 12.2, 12.8, 'porao'); world.nav('pb1', BX + 12.3, 14.5, 'porao'); world.nav('pb2', BX + 12.3, 18.2, 'porao');
  world.link('pb0', 'pb1'); world.link('pb1', 'pb2');
  g.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshBasicMaterial) o.castShadow = false; });
  world.end();
}

function slab(parent, x0, x1, z0, z1, mat, y, down = false) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2;
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
