// A casa. Planta interpretada a partir dos dois vídeos (apartamento):
//  sala (parede da TV cinza-escura, sofá cinza, bicicleta, quadro pop-art, porta-chaves "Família")
//  varanda com tela de proteção e varal, cozinha, área de serviço, corredor comprido,
//  banheiro, quarto roxo, quarto dos meninos (escrivaninha preta) e quarto dos pais (guarda-roupa com espelho).
// Coordenadas em metros. x = leste, z = sul (em direção à porta de entrada). y = cima.
import * as THREE from 'three';
import { box, cyl, sphere, plane, group, MATS, std, texMat, basic } from './geom.js';
import * as P from './props.js';
import * as TX from '../core/textures.js';
import { Door, Drawer, Leaf } from './doors.js';
import { Mirror } from './mirror.js';
import { vis, L } from './layers.js';

export const H = 2.6;
const T = 0.12;

export function layout(F) {
  const len = F.corridorLong ? 2.4 : 0;
  return { len, P: 11.0 + len, corridorEnd: 11.0 + len };
}

// ------------------------------------------------------------------ paredes com UV de mundo
function matSize(m) { return m && m.map && m.map.userData.size ? m.map.userData.size : 1.2; }

function worldUV(geo, cx, cy, cz, mats) {
  const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const face = Math.floor(i / 4);
    const s = matSize(Array.isArray(mats) ? mats[face] : mats);
    const x = pos.getX(i) + cx, y = pos.getY(i) + cy, z = pos.getZ(i) + cz;
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    if (nz >= nx && nz >= ny) uv.setXY(i, x / s, y / s);
    else if (nx >= ny) uv.setXY(i, z / s, y / s);
    else uv.setXY(i, x / s, z / s);
  }
  uv.needsUpdate = true;
}

function piece(world, parent, axis, at, a, b, y0, y1, matA, matB, collide, opts) {
  if (b - a < 0.005 || y1 - y0 < 0.005) return null;
  let geo, cx, cz;
  const cy = (y0 + y1) / 2;
  let mats;
  if (axis === 'x') {
    geo = new THREE.BoxGeometry(b - a, y1 - y0, opts.thick || T);
    cx = (a + b) / 2; cz = at;
    mats = [matA, matA, matA, matA, matB, matA];
  } else {
    geo = new THREE.BoxGeometry(opts.thick || T, y1 - y0, b - a);
    cx = at; cz = (a + b) / 2;
    mats = [matB, matA, matA, matA, matA, matA];
  }
  worldUV(geo, cx, cy, cz, mats);
  const m = new THREE.Mesh(geo, mats);
  m.position.set(cx, cy, cz);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  if (collide) {
    const t = (opts.thick || T) / 2;
    if (axis === 'x') world.collider(a, b, at - t, at + t, { los: y1 > 1.5 || opts.los === true });
    else world.collider(at - t, at + t, a, b, { los: y1 > 1.5 || opts.los === true });
  }
  return m;
}

// parede reta com aberturas: {a, b, top=2.1, bottom=0}
export function wall(world, parent, axis, at, from, to, matA, matB, openings = [], opts = {}) {
  const top = opts.h || H;
  const y0 = opts.y0 || 0;
  const ops = [...openings].sort((p, q) => p.a - q.a);
  let cur = from;
  const meshes = [];
  for (const o of ops) {
    if (o.a > cur) meshes.push(piece(world, parent, axis, at, cur, o.a, y0, top, matA, matB, true, opts));
    const ot = o.top === undefined ? 2.1 : o.top;
    const ob = o.bottom || 0;
    if (ob > 0) meshes.push(piece(world, parent, axis, at, o.a, o.b, y0, ob, matA, matB, true, { ...opts, los: false }));
    if (ot < top) meshes.push(piece(world, parent, axis, at, o.a, o.b, ot, top, matA, matB, false, opts));
    cur = Math.max(cur, o.b);
  }
  if (to > cur) meshes.push(piece(world, parent, axis, at, cur, to, y0, top, matA, matB, true, opts));
  return meshes;
}

function slab(parent, x0, x1, z0, z1, mat, y, down = false) {
  const w = x1 - x0, d = z1 - z0;
  const geo = new THREE.PlaneGeometry(w, d);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const s = matSize(mat);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    uv.setXY(i, (cx + px) / s, (down ? cz + py : -(cz - py)) / s);
  }
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2;
  m.position.set(cx, y, cz);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function room(world, parent, x0, x1, z0, z1, floorMat, surface, roomId, opts = {}) {
  slab(parent, x0, x1, z0, z1, floorMat, opts.y || 0);
  if (opts.ceiling !== false) slab(parent, x0, x1, z0, z1, opts.ceilMat || MATS.ceiling, (opts.y || 0) + (opts.h || H), true);
  world.floor(x0, x1, z0, z1, surface, null, roomId);
}

// rodapé branco
function baseboard(parent, axis, at, from, to, side) {
  const len = to - from;
  if (axis === 'x') box(parent, len, 0.07, 0.012, MATS.whiteFurn, (from + to) / 2, 0.035, at + side * (T / 2 + 0.006), { cast: false });
  else box(parent, 0.012, 0.07, len, MATS.whiteFurn, at + side * (T / 2 + 0.006), 0.035, (from + to) / 2, { cast: false });
}

function bulbMat() { return new THREE.MeshBasicMaterial({ color: 0xfff3dc }); }

function lampAt(world, parent, x, z, opts = {}) {
  const g = group(parent, x, opts.y || H, z);
  const mat = bulbMat();
  let bulbMesh;
  if (opts.kind === 'bulb') {
    cyl(g, 0.025, 0.025, 0.08, MATS.whiteFurn, 0, -0.04, 0, { seg: 8 });
    bulbMesh = sphere(g, 0.055, mat, 0, -0.12, 0, { cast: false });
  } else {
    bulbMesh = cyl(g, 0.17, 0.15, 0.05, mat, 0, -0.025, 0, { seg: 20, cast: false });
  }
  const f = world.fixture(x, (opts.y || H) - 0.25, z, { ...opts, bulb: mat });
  return { g, f, mat, bulbMesh };
}

// tomada na parede
function socket(world, parent, id, x, y, z, ry) {
  const g = group(parent, x, y, z, ry);
  box(g, 0.08, 0.08, 0.01, MATS.whiteFurn, 0, 0, 0, { cast: false });
  box(g, 0.012, 0.02, 0.012, std('#333'), -0.015, 0, 0.006, { cast: false });
  box(g, 0.012, 0.02, 0.012, std('#333'), 0.015, 0, 0.006, { cast: false });
  box(g, 0.26, 0.26, 0.04, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0.02, { cast: false });
  world.interact(g, { id, kind: 'socket', dist: 1.9, prompt: () => (world.game && world.game.inventory.has('carregador') ? 'Segure E para carregar o celular' : 'Tomada'), action: () => { if (!world.game.inventory.has('carregador')) world.game.ui.toast('Uma tomada. Falta o carregador.'); } });
  return g;
}

// ================================================================== construção
export function buildHouse(world, F) {
  const lay = layout(F);
  buildSala(world, F);
  buildVaranda(world, F);
  buildCozinha(world, F);
  buildServico(world, F);
  buildCorredor(world, F, lay);
  buildBanheiro(world, F);
  buildRoxo(world, F);
  buildMeninos(world, F);
  buildPais(world, F, lay);
  if (F.corridorLong) buildExtra(world, F, lay);
  buildOutside(world, F);
  return lay;
}

// ------------------------------------------------------------------ SALA
function buildSala(world, F) {
  const g = world.begin('sala');
  room(world, g, 0, 4.2, 0, 8, MATS.woodFloor, 'wood', 'sala');
  // paredes
  wall(world, g, 'x', 0, 0, 4.2, MATS.white, MATS.white, [{ a: 0.5, b: 3.7, top: 2.25 }]); // norte: porta de vidro da varanda
  wall(world, g, 'z', 0, 0, 4.0, MATS.white, MATS.darkGray);
  wall(world, g, 'z', 0, 4.0, 5.2, MATS.kitchenWall, MATS.darkGray);
  wall(world, g, 'z', 0, 5.2, 8.0, MATS.kitchenWall, MATS.white, [{ a: 5.4, b: 6.3 }]); // cozinha
  wall(world, g, 'x', 8, 0, 4.2, MATS.white, MATS.white, [{ a: 0.55, b: 1.4 }]); // sul: entrada
  wall(world, g, 'z', 4.2, 0, 3.4, MATS.white, MATS.white);
  wall(world, g, 'z', 4.2, 3.4, 4.2, MATS.white, MATS.purple);
  wall(world, g, 'z', 4.2, 4.2, 6.7, MATS.gray, MATS.purple);
  wall(world, g, 'z', 4.2, 6.7, 8.0, MATS.gray, MATS.bathWall, [{ a: 6.7, b: 7.7 }]); // corredor
  baseboard(g, 'z', 0, 0, 5.4, 1); baseboard(g, 'z', 4.2, 0, 6.7, -1); baseboard(g, 'x', 8, 1.4, 4.2, -1);
  world.zone('sala', 0, 4.2, 0, 8);
  world.zone('entrada', 0, 2.2, 6.0, 8);

  // porta de entrada (sempre trancada)
  new Door(world, g, { id: 'porta_entrada', name: 'porta de entrada', hx: 0.55, hz: 8, rot: 0, swing: 1, width: 0.85, mat: MATS.doorEntrance, locked: true, lockMsg: 'Trancada. A chave não está aqui.' });

  // porta de vidro da varanda: metade fixa
  const gl = group(g, 0, 0, 0);
  box(gl, 1.6, 2.2, 0.03, MATS.glass, 1.3, 1.1, 0.0, { cast: false });
  box(gl, 0.05, 2.25, 0.08, std('#d8d8d4', { metalness: 0.3 }), 2.1, 1.125, 0);
  box(gl, 3.2, 0.05, 0.08, std('#d8d8d4', { metalness: 0.3 }), 2.1, 2.22, 0);
  world.collider(0.5, 2.1, -0.06, 0.06, { los: false });
  // cortinas brancas (lado da sala)
  const cg = group(g, 2.1, 0, 0.12);
  const cur = P.curtains(cg, 3.4, 2.3, MATS.curtainWhite, F.d_cortina === false ? 0 : 0.55);
  world.name('cortina_sala', cg);
  world.interact(cg, { id: 'cortina_sala', kind: 'hide', prompt: () => 'Esconder-se atrás da cortina' });
  world.hide({ id: 'cortina_sala', kind: 'curtain', cam: { x: 3.2, y: 1.42, z: 0.08, yaw: Math.PI, pitch: -0.05 }, exit: { x: 3.0, z: 0.7 } });
  void cur;

  // rack + TV
  const rk = group(g, 0.24, 0, 2.8, Math.PI / 2);
  P.rack(rk, 2.4);
  world.collider(0.02, 0.46, 1.6, 4.0, { los: false });
  const tvg = group(g, 0.04, 1.42, 2.8, Math.PI / 2);
  const screen = P.tv(tvg, 1.35);
  world.name('tv_screen', screen);
  world.name('tv_group', tvg);
  world.interact(tvg, { id: 'tv', kind: 'examine', prompt: () => 'Olhar a TV' });
  // reflexo da TV desligada: memória da casa
  const tvMirror = new Mirror(1.33, 0.76, { res: 384, strength: 0.16, tint: 0x8899aa, maxDist: 7 });
  tvMirror.position.set(0.069, 1.42, 2.8);
  tvMirror.rotation.y = Math.PI / 2;
  vis(tvMirror, 'e');
  g.add(tvMirror);
  world.name('tv_mirror', tvMirror);
  // fotos em cima do rack
  const ph = group(g, 0.28, 0.66, 2.0, Math.PI / 2);
  const photos = [];
  for (let i = 0; i < 3; i++) {
    const f = group(ph, -0.25 + i * 0.26, 0.09, 0, 0);
    const pic = P.photoFrame(f, TX.familyPhoto('ok', 4 + (i % 2), i + 1), 0.18, 0.13);
    photos.push({ f, pic });
  }
  world.name('rack_photos', ph);
  world.name('rack_photo_list', { photos });
  world.interact(ph, { id: 'rack_photos', kind: 'examine', prompt: () => 'Olhar as fotos' });
  // foto do aniversário (palhaço) no rack
  const bd = group(g, 0.24, 0.66, 3.75, Math.PI / 2);
  const bdPic = P.photoFrame(bd, TX.birthdayPhoto(0), 0.16, 0.12);
  world.name('bday_photo', bdPic);
  world.interact(bd, { id: 'bday_photo', kind: 'examine', prompt: () => 'Olhar a foto' });
  // portinha do rack (esconderijo da Lili no ato 2)
  const rd = group(g, 0.46, 0.3, 3.68);
  box(rd, 0.02, 0.38, 0.28, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, { cast: false });
  world.interact(rd, { id: 'rack_door', kind: 'examine', prompt: () => 'Portinha do rack' });
  // gaveta trancada do rack
  world.name('rack_drawer_obj', new Drawer(world, g, { id: 'rack_drawer', name: 'gaveta do rack', pos: new THREE.Vector3(0.26, 0.33, 3.1), ry: Math.PI / 2, dir: new THREE.Vector3(1, 0, 0), w: 0.5, h: 0.14, d: 0.36, mat: MATS.cream, locked: true, lockMsg: 'A gaveta do rack está trancada.' }));

  // sofá
  const sf = group(g, 3.68, 0, 2.6, -Math.PI / 2);
  P.sofa(sf, 2.6);
  world.collider(3.2, 4.2, 1.3, 3.9, { los: false });
  world.interact(sf, { id: 'sofa', kind: 'examine', prompt: () => 'Examinar o sofá' });
  const st = group(g, 3.85, 0, 0.75); P.sideTable(st);
  world.collider(3.65, 4.05, 0.55, 0.95, { los: false });
  socket(world, g, 'socket_sala', 4.13, 0.35, 1.1, -Math.PI / 2);
  // cabo de carregador jogado no sofá (como na foto)
  box(g, 0.004, 0.004, 0.5, std('#111'), 3.45, 0.44, 3.4, { cast: false });

  // mesinha branca com a bolsa preta
  const wt = group(g, 3.9, 0, 4.35, -Math.PI / 2); P.whiteTable(wt);
  world.collider(3.62, 4.2, 3.9, 4.8, { los: false });
  world.interact(wt, { id: 'white_table', kind: 'examine', prompt: () => 'Examinar a mesinha' });

  // bicicleta encostada na parede cinza
  const bk = group(g, 3.98, 0, 5.8, Math.PI / 2); P.bike(bk);
  world.name('bike', bk);
  world.interact(bk, { id: 'bike', kind: 'examine', prompt: () => 'Examinar a bicicleta' });
  world.name('bike_col', world.collider(3.8, 4.2, 5.0, 6.6, { los: false, id: 'bike_col' }));
  // bicicleta "fantasma" (como no vídeo) para o modo vídeo
  const bkv = group(g, 3.98, 0, 5.8, Math.PI / 2); P.bike(bkv); vis(bkv, 'v');
  world.name('bike_video', bkv);

  // banquinho de madeira
  const sl = group(g, 3.45, 0, 5.2); P.stool(sl);
  world.name('stool', sl);
  world.interact(sl, { id: 'stool', kind: 'pickup', prompt: () => 'Pegar o banquinho' });

  // quadro pop-art: versão "olho" (móvel), versão "vídeo" (no chão), versão "espelho" (pendurado de cabeça pra baixo)
  const pe = group(g, 3.2, 1.55, 7.93, Math.PI); P.painting(pe, false); vis(pe, 'ec');
  world.name('painting', pe);
  world.interact(pe, { id: 'painting', kind: 'examine', prompt: () => 'Examinar o quadro' });
  const pv = group(g, 3.2, 0.39, 7.86, Math.PI); P.painting(pv, false); pv.rotation.x = -0.12; vis(pv, 'v');
  const pm = group(g, 3.2, 1.55, 7.93, Math.PI); P.painting(pm, true); vis(pm, 'm');
  world.name('painting_mirror', pm);
  // cadeira dobrável encostada
  const fc = group(g, 2.35, 0, 7.88, Math.PI); P.foldingChair(fc); fc.rotation.x = -0.18;
  world.name('folding_chair', fc);
  world.interact(fc, { id: 'folding_chair', kind: 'examine', prompt: () => 'Examinar a cadeira' });
  // cadeira aberta no meio da sala (diferença do ato 2)
  const fco = group(g, 1.9, 0, 3.0, -Math.PI / 2);
  box(fco, 0.44, 0.03, 0.42, std('#6d1d2a'), 0, 0.46, 0); box(fco, 0.44, 0.45, 0.03, std('#6d1d2a'), 0, 0.72, -0.2);
  for (const sx of [-1, 1]) { box(fco, 0.02, 0.9, 0.02, std('#b8bcc0', { metalness: 0.6 }), sx * 0.21, 0.45, -0.18); box(fco, 0.02, 0.46, 0.02, std('#b8bcc0', { metalness: 0.6 }), sx * 0.21, 0.23, 0.18); }
  vis(fco, 'ec');
  world.name('chair_open', fco);
  world.interact(fco, { id: 'chair_open', kind: 'examine', prompt: () => 'Examinar a cadeira' });

  // porta-chaves "Família"
  const kh = group(g, 1.75, 1.5, 7.93, Math.PI);
  box(kh, 0.34, 0.3, 0.05, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0.03, { cast: false });
  world.name('keyholder', kh);
  world.interact(kh, { id: 'keyholder', kind: 'examine', prompt: () => 'Olhar o porta-chaves' });
  // interfone
  const ic = group(g, 0.07, 1.45, 7.65, Math.PI / 2);
  const handset = P.intercom(ic);
  world.name('intercom_handset', handset);
  world.interact(ic, { id: 'intercom', kind: 'examine', prompt: () => 'Interfone' });
  // quadro de luz
  const brk = group(g, 0.06, 1.75, 7.0, Math.PI / 2);
  const bb = P.breakerBox(brk);
  world.name('breaker', bb);
  world.interact(brk, { id: 'breaker', kind: 'examine', prompt: () => 'Quadro de luz' });
  // interruptor
  const sw = group(g, 1.62, 1.2, 7.93, Math.PI); box(sw, 0.08, 0.12, 0.012, MATS.whiteFurn, 0, 0, 0, { cast: false });

  // ventilador com luz
  const fanG = group(g, 2.1, H, 3.2);
  const fan = P.ceilingFan(fanG);
  world.name('fan_sala', fan);
  const fmat = bulbMat(); fan.bulb.material = fmat;
  world.fixture(2.1, H - 0.45, 3.2, { id: 'sala', room: 'sala', intensity: 7, dist: 8, bulb: fmat });
  lampAt(world, g, 1.6, 6.9, { id: 'entrada', room: 'sala', intensity: 5, dist: 6 });
  // luz da TV (fixture especial, desligada por padrão)
  world.fixture(0.7, 1.4, 2.8, { id: 'tv_glow', room: 'sala', intensity: 0, dist: 5, on: false, color: 0x9fb8ff });

  // navegação
  world.nav('s_bal', 2.9, 0.4, 'sala'); world.nav('s1', 2.3, 1.2, 'sala'); world.nav('s2', 2.3, 4.0, 'sala'); world.nav('s3', 2.2, 6.9, 'sala');
  world.nav('s_ent', 1.0, 7.4, 'sala'); world.nav('s_kd', 0.45, 5.85, 'sala'); world.nav('s_cd', 3.9, 7.2, 'sala');
  world.link('s_bal', 's1'); world.link('s1', 's2'); world.link('s2', 's3'); world.link('s3', 's_ent'); world.link('s2', 's_kd'); world.link('s3', 's_kd'); world.link('s3', 's_cd'); world.link('s2', 's_cd');
  world.end();
}

// ------------------------------------------------------------------ VARANDA
function buildVaranda(world, F) {
  const g = world.begin('varanda');
  room(world, g, 0, 4.2, -1.5, 0, MATS.balconyFloor, 'tile', 'varanda');
  wall(world, g, 'z', 0, -1.5, 0, MATS.white, MATS.white);
  wall(world, g, 'z', 4.2, -1.5, 0, MATS.white, MATS.white);
  // parapeito + tela de proteção (por causa dos gatos)
  wall(world, g, 'x', -1.5, 0, 4.2, MATS.white, MATS.white, [], { h: 1.05 });
  world.collider(0, 4.2, -1.62, -1.44, { los: false });
  const netTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); x.strokeStyle = 'rgba(230,230,230,0.8)'; x.lineWidth = 2;
    for (let i = -128; i < 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 5); return t;
  })();
  const net = plane(g, 4.2, 1.5, new THREE.MeshBasicMaterial({ map: netTex, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }), 2.1, 1.8, -1.5, { uv: false, receive: false });
  world.interact(net, { id: 'net', kind: 'examine', prompt: () => 'Olhar lá fora' });
  // varal com lençóis
  const vr = group(g, 2.0, 0, -0.75);
  const pole = std('#dfe3e6', { metalness: 0.4 });
  const blue = std('#2f6fd0', { roughness: 0.5 });
  box(vr, 1.6, 0.03, 0.03, pole, 0, 1.45, -0.3); box(vr, 1.6, 0.03, 0.03, pole, 0, 1.45, 0.3);
  box(vr, 0.04, 1.45, 0.04, blue, -0.8, 0.72, 0); box(vr, 0.04, 1.45, 0.04, blue, 0.8, 0.72, 0);
  const sheets = [];
  for (const [x, col] of [[-0.35, '#f2f0ea'], [0.35, '#e6e9ee']]) {
    const s = P.towel(group(vr, x, 1.0, 0), 0.6, 0.9, col);
    sheets.push(s);
  }
  // lençol com "alguém" embaixo (diferença do ato 1)
  const fig = group(vr, 0.0, 0, 0.3);
  const figGeo = new THREE.CylinderGeometry(0.18, 0.34, 1.5, 14, 4);
  const fp = figGeo.attributes.position;
  for (let i = 0; i < fp.count; i++) { const y = fp.getY(i); if (y > 0.5) { fp.setX(i, fp.getX(i) * 0.65); fp.setZ(i, fp.getZ(i) * 0.65); } }
  figGeo.computeVertexNormals();
  const figM = new THREE.Mesh(figGeo, std('#eceae4', { roughness: 1 }));
  figM.position.y = 0.76; figM.castShadow = true; fig.add(figM);
  sphere(fig, 0.16, std('#eceae4', { roughness: 1 }), 0, 1.56, 0);
  vis(fig, 'ec');
  world.name('sheet_figure', fig);
  world.interact(fig, { id: 'sheet_figure', kind: 'examine', prompt: () => 'Puxar o lençol' });
  world.interact(vr, { id: 'drying_rack', kind: 'examine', prompt: () => 'Examinar o varal' });
  world.collider(1.15, 2.85, -1.15, -0.35, { los: false });
  world.fixture(2.1, 2.2, -0.9, { id: 'varanda', room: 'varanda', intensity: 1.2, dist: 6, color: 0x8fa6d8 });
  world.nav('v1', 3.0, -0.4, 'varanda'); world.link('v1', 's_bal');
  world.end();
}

// ------------------------------------------------------------------ COZINHA
function buildCozinha(world, F) {
  const g = world.begin('cozinha');
  room(world, g, -3, 0, 4, 8, MATS.kitchenFloor, 'tile', 'cozinha');
  wall(world, g, 'x', 4, -3, 0, MATS.white, MATS.kitchenWall, [{ a: -2.55, b: -1.45, bottom: 1.25, top: 2.1 }]);
  wall(world, g, 'z', -3, 4, 10.2, MATS.white, MATS.kitchenWall);
  wall(world, g, 'x', 8, -3, 0, MATS.kitchenWall, MATS.kitchenWall, [{ a: -2.4, b: -1.6 }]);
  const wf = group(g, -2.0, 1.25, 4.0); P.windowFrame(wf, 1.1, 0.85, { louver: true });
  world.zone('cozinha', -3, 0, 4, 8);

  // bancada com pia e fogão ao longo da parede oeste
  const ct = group(g, -2.7, 0, 6.1, Math.PI / 2);
  P.counter(ct, 3.0, { sink: -0.3, stove: 0.9 });
  world.collider(-3, -2.4, 4.6, 7.6, { los: false });
  const stoveHit = group(g, -2.7, 0.9, 5.2);
  box(stoveHit, 0.5, 0.05, 0.5, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, { cast: false });
  world.interact(stoveHit, { id: 'stove', kind: 'examine', prompt: () => 'Fogão' });
  const flame = group(g, -2.84, 0.94, 5.1);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; sphere(flame, 0.018, basic('#5aa0ff'), Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05, { seg: 6, seg2: 4, cast: false }); }
  flame.visible = false;
  world.name('stove_flame', flame);
  // armários superiores (4 portas; a 2ª faz parte da rotina da mãe)
  const up = group(g, -2.83, 1.95, 6.1, Math.PI / 2);
  const uc = P.upperCabinets(up, 3.0);
  const leaves = [];
  uc.leaves.forEach((lf, i) => {
    const hinge = new THREE.Vector3(-2.66, 1.64, 6.1 - lf.x - lf.w / 2);
    const leaf = new Leaf(world, g, { id: 'cab_' + (i + 1), hinge, rot: Math.PI / 2, w: lf.w, h: 0.6, mat: MATS.oakDark, leftHinge: false, name: 'armário' });
    leaves.push(leaf);
  });
  world.name('cabinets', leaves);
  // pote de café no armário 2
  const coffee = group(g, -2.85, 1.72, 6.1 - uc.leaves[1].x); cyl(coffee, 0.06, 0.06, 0.16, std('#7a1c1c'), 0, 0.08, 0, { seg: 12 });

  // geladeira com ímãs
  const fr = group(g, -0.55, 0, 4.42); P.fridge(fr);
  world.collider(-0.9, -0.2, 4.08, 4.76, { los: false });
  const fdoor = new Leaf(world, g, { id: 'fridge_door', hinge: new THREE.Vector3(-0.21, 0, 4.76), rot: 0, w: 0.68, h: 1.2, mat: texMat(TX.fridgeDoor(14, 2), { roughness: 0.4 }), leftHinge: false, name: 'geladeira', handleY: 0.2 });
  fdoor.panel.position.y = 0.6; fdoor.panel.scale.set(1, 1, 1);
  const zdoor = new Leaf(world, g, { id: 'freezer_door', hinge: new THREE.Vector3(-0.21, 1.22, 4.76), rot: 0, w: 0.68, h: 0.52, mat: std('#e6e8e7', { roughness: 0.35 }), leftHinge: false, name: 'congelador' });
  world.name('fridge_door', fdoor); world.name('freezer_door', zdoor);
  // interior da geladeira com luz
  const inside = group(g, -0.55, 0, 4.45);
  box(inside, 0.6, 0.02, 0.5, std('#dfe8ee', { transparent: true, opacity: 0.8 }), 0, 0.5, 0, { cast: false });
  box(inside, 0.6, 0.02, 0.5, std('#dfe8ee', { transparent: true, opacity: 0.8 }), 0, 0.85, 0, { cast: false });
  cyl(inside, 0.05, 0.05, 0.2, std('#fff'), -0.15, 0.62, 0, { seg: 10 });
  cyl(inside, 0.04, 0.04, 0.24, std('#2a8a3a'), 0.12, 0.99, 0.05, { seg: 10 });
  const ice = group(g, -0.55, 1.35, 4.5);
  box(ice, 0.22, 0.16, 0.2, std('#bfe6ff', { transparent: true, opacity: 0.8, roughness: 0.1 }), 0, 0.08, 0);
  box(ice, 0.12, 0.02, 0.02, std('#c9a23a', { metalness: 0.7 }), 0, 0.08, 0.02);
  ice.visible = false;
  world.name('ice_block', ice);
  world.interact(ice, { id: 'ice_block', kind: 'pickup', prompt: () => 'Pegar o bloco de gelo' });
  world.fixture(-0.55, 1.0, 4.9, { id: 'fridge_light', room: 'cozinha', intensity: 0, dist: 3, on: false, color: 0xdfefff });
  // bilhete na geladeira
  const note = group(g, -0.42, 1.45, 4.785); plane(note, 0.12, 0.15, texMat(TX.paperNote(3), { roughness: 0.9 }), 0, 0, 0.001, { uv: false });
  world.interact(note, { id: 'fridge_note', kind: 'examine', prompt: () => 'Ler o bilhete' });

  // micro-ondas em cima de um armarinho
  const cab = group(g, -1.3, 0, 4.3); box(cab, 0.6, 0.9, 0.5, MATS.whiteFurn, 0, 0.45, 0);
  world.collider(-1.6, -1.0, 4.05, 4.55, { los: false });
  const mw = group(g, -1.3, 0.9, 4.32);
  const display = P.microwave(mw);
  world.name('microwave_display', display);
  world.interact(mw, { id: 'microwave', kind: 'examine', prompt: () => 'Micro-ondas' });

  // relógio de parede (parado)
  const clk = group(g, -0.07, 2.0, 5.0, -Math.PI / 2);
  const clock = P.wallClock(clk, 3.55);
  world.name('kitchen_clock', clock);
  world.interact(clk, { id: 'kitchen_clock', kind: 'examine', prompt: () => 'Relógio' });
  // banquinho de cozinha
  const ks = group(g, -1.9, 0, 7.1); P.stool(ks, 0.62);
  world.interact(ks, { id: 'kitchen_stool', kind: 'examine', prompt: () => 'Examinar' });
  // lixeira
  const lx = group(g, -0.35, 0, 7.6); cyl(lx, 0.14, 0.12, 0.45, std('#222', { metalness: 0.6, roughness: 0.3 }), 0, 0.225, 0, { seg: 14 });
  // potes dos gatos
  const b1 = group(g, -1.25, 0, 7.65); const food1 = P.catBowl(b1, '#2d5fbf');
  plane(b1, 0.16, 0.05, texMat(TX.label('BENTO', { bg: '#2d5fbf', fg: '#fff', h: 48 })), 0, 0.005, 0.14, { rx: -Math.PI / 2, uv: false });
  const b2 = group(g, -0.8, 0, 7.65); const food2 = P.catBowl(b2, '#e3649a');
  plane(b2, 0.16, 0.05, texMat(TX.label('LILI', { bg: '#e3649a', fg: '#fff', h: 48 })), 0, 0.005, 0.14, { rx: -Math.PI / 2, uv: false });
  world.name('food_bento', food1); world.name('food_lili', food2);
  world.interact(b1, { id: 'bowl_bento', kind: 'examine', prompt: () => 'Pote do Bento' });
  world.interact(b2, { id: 'bowl_lili', kind: 'examine', prompt: () => 'Pote da Lili' });
  // banquinho posicionado na geladeira (quando colocado)
  const sf = group(g, -0.55, 0, 5.0); P.stool(sf); sf.visible = false;
  world.name('stool_fridge', sf);
  world.interact(sf, { id: 'stool_fridge', kind: 'examine', prompt: () => null });
  // topo da geladeira (alvo alto)
  const top = group(g, -0.55, 1.78, 4.42);
  box(top, 0.6, 0.06, 0.55, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, { cast: false });
  world.interact(top, { id: 'fridge_top', kind: 'examine', dist: 2.6, prompt: () => null });

  lampAt(world, g, -1.5, 6.0, { id: 'cozinha', room: 'cozinha', intensity: 6, dist: 7 });
  world.nav('k0', -0.45, 5.85, 'cozinha'); world.nav('k1', -1.4, 6.0, 'cozinha'); world.nav('k2', -1.6, 5.0, 'cozinha'); world.nav('k3', -2.0, 7.5, 'cozinha');
  world.link('k0', 's_kd'); world.link('k0', 'k1'); world.link('k1', 'k2'); world.link('k1', 'k3');
  world.end();
}

// ------------------------------------------------------------------ ÁREA DE SERVIÇO
function buildServico(world, F) {
  const g = world.begin('servico');
  room(world, g, -3, -0.8, 8, 10.2, MATS.serviceFloor, 'tile', 'servico');
  wall(world, g, 'z', -0.8, 8, 10.2, MATS.kitchenWall, MATS.white);
  wall(world, g, 'x', 10.2, -3, -0.8, MATS.kitchenWall, MATS.white, [{ a: -2.4, b: -1.4, bottom: 1.3, top: 2.0 }]);
  const wf = group(g, -1.9, 1.3, 10.2); P.windowFrame(wf, 1.0, 0.7, { louver: true });
  world.zone('servico', -3, -0.8, 8, 10.2);
  const wa = group(g, -2.62, 0, 9.82); P.washer(wa);
  world.collider(-2.95, -2.3, 9.5, 10.15, { los: false });
  world.interact(wa, { id: 'washer', kind: 'examine', prompt: () => 'Máquina de lavar' });
  const tk = group(g, -1.9, 0, 9.9); P.tank(tk);
  world.collider(-2.2, -1.6, 9.62, 10.15, { los: false });
  world.interact(tk, { id: 'tank', kind: 'examine', prompt: () => 'Tanque' });
  const br = group(g, -1.35, 0, 10.05); P.broom(br);
  // prateleira alta com a ração
  const sh = group(g, -1.0, 0, 9.0, -Math.PI / 2); P.shelf(sh, 1.2, 3, 0.35);
  world.collider(-1.18, -0.8, 8.4, 9.6, { los: false });
  const bags = ['#2a8a3a', '#e8e8e8', '#c62828'];
  for (let i = 0; i < 3; i++) box(sh, 0.2, 0.25, 0.2, std(bags[i], { roughness: 0.9 }), -0.4 + i * 0.3, 0.64, 0);
  const racao = group(g, -1.0, 1.52, 9.1);
  box(racao, 0.2, 0.3, 0.12, std('#d9632a'), 0, 0.15, 0);
  plane(racao, 0.12, 0.08, texMat(TX.label('RAÇÃO', { bg: '#fff', fg: '#d9632a', h: 48 })), 0, 0.17, -0.061, { ry: Math.PI, uv: false });
  world.name('racao', racao);
  world.interact(racao, { id: 'racao', kind: 'pickup', dist: 2.6, prompt: () => 'Pegar a ração' });
  const slS = group(g, -1.45, 0, 9.1); P.stool(slS); slS.visible = false;
  world.name('stool_shelf', slS);
  // registro do chuveiro (ato 3) em cima do tanque
  const reg = group(g, -1.75, 0.9, 9.85);
  cyl(reg, 0.04, 0.04, 0.03, std('#999', { metalness: 0.8 }), 0, 0.015, 0, { seg: 12 });
  box(reg, 0.09, 0.012, 0.02, std('#c33'), 0, 0.035, 0);
  reg.visible = false;
  world.name('registro', reg);
  world.interact(reg, { id: 'registro', kind: 'pickup', prompt: () => 'Pegar o registro do chuveiro' });
  // armário alto (esconderijo)
  const ac = group(g, -2.72, 0, 8.45, Math.PI / 2);
  P.wardrobeBody(ac, 0.6, 1.9, 0.5, MATS.whiteFurn);
  const acl = new Leaf(world, g, { id: 'cab_servico', hinge: new THREE.Vector3(-2.46, 0.02, 8.15), rot: Math.PI / 2, w: 0.6, h: 1.86, leftHinge: false, interact: false });
  world.collider(-3, -2.45, 8.15, 8.75);
  world.interact(ac, { id: 'hide_servico', kind: 'hide', extra: [acl.pivot], prompt: () => 'Esconder-se no armário' });
  world.hide({ id: 'hide_servico', kind: 'wardrobe', leaf: acl, cam: { x: -2.72, y: 1.35, z: 8.45, yaw: -Math.PI / 2, pitch: 0 }, exit: { x: -2.0, z: 8.5 } });
  const bl = lampAt(world, g, -1.9, 9.1, { id: 'servico', room: 'servico', intensity: 4.5, dist: 5, kind: 'bulb' });
  world.name('servico_bulb', bl);
  world.nav('sv0', -2.0, 8.0, 'servico'); world.nav('sv1', -1.9, 8.9, 'servico');
  world.link('sv0', 'k3'); world.link('sv0', 'sv1');
  world.end();
}

// ------------------------------------------------------------------ CORREDOR
function buildCorredor(world, F, lay) {
  const g = world.begin('corredor');
  const E = lay.corridorEnd;
  room(world, g, 4.2, E, 6.7, 7.7, MATS.woodFloor, 'wood', 'corredor');
  wall(world, g, 'x', 6.7, 4.2, 7.3, MATS.purple, MATS.white, F.roomGiven ? [] : [{ a: 5.0, b: 5.82 }]);
  if (F.roomGiven) {
    // o quarto que ninguém lembra: só parede lisa no lugar da porta
    const sw = group(g, 5.41, 1.05, 6.77);
    box(sw, 0.82, 2.0, 0.02, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, { cast: false });
    world.interact(sw, { id: 'sealed_wall', kind: 'examine', prompt: () => 'Parede' });
  }
  wall(world, g, 'x', 6.7, 7.3, 10.4, MATS.white, MATS.white, [{ a: 8.3, b: 9.12 }]);
  wall(world, g, 'x', 6.7, 10.4, E, MATS.white, MATS.white);
  const extraOps = F.corridorLong ? [{ a: 11.8, b: 12.62 }] : [];
  wall(world, g, 'x', 7.7, 4.2, 6.6, MATS.white, MATS.bathWall, [{ a: 4.65, b: 5.37 }]);
  wall(world, g, 'x', 7.7, 6.6, E, MATS.white, MATS.white, extraOps);
  baseboard(g, 'x', 6.7, 4.2, E, 1); baseboard(g, 'x', 7.7, 4.2, E, -1);
  world.zone('corredor', 4.2, E, 6.7, 7.7);
  world.zone('corredor_fim', E - 2.2, E, 6.7, 7.7);
  lampAt(world, g, 5.6, 7.2, { id: 'corredor1', room: 'corredor', intensity: 3.5, dist: 5 });
  lampAt(world, g, E - 1.6, 7.2, { id: 'corredor2', room: 'corredor', intensity: 3.5, dist: 5 });
  world.nav('c0', 4.6, 7.2, 'corredor'); world.nav('c1', 5.4, 7.2, 'corredor'); world.nav('c2', 8.7, 7.2, 'corredor'); world.nav('c3', E - 0.45, 7.2, 'corredor');
  world.link('c0', 's_cd'); world.link('c0', 'c1'); world.link('c1', 'c2'); world.link('c2', 'c3');
  if (F.corridorLong) { world.nav('c4', 12.2, 7.2, 'corredor'); world.link('c2', 'c4'); world.link('c4', 'c3'); }
  world.end();
}

// ------------------------------------------------------------------ BANHEIRO
function buildBanheiro(world, F) {
  const g = world.begin('banheiro');
  room(world, g, 4.2, 6.6, 7.7, 9.9, MATS.bathFloor, 'tile', 'banheiro');
  wall(world, g, 'z', 4.2, 8.0, 9.9, MATS.white, MATS.bathWall);
  wall(world, g, 'x', 9.9, 4.2, 6.6, MATS.bathWall, MATS.white, [{ a: 5.85, b: 6.4, bottom: 1.6, top: 2.1 }]);
  wall(world, g, 'z', 6.6, 7.7, 9.9, MATS.bathWall, MATS.white);
  const wf = group(g, 6.12, 1.6, 9.9); P.windowFrame(wf, 0.55, 0.5, { louver: true });
  world.zone('banheiro', 4.2, 6.6, 7.7, 9.9);
  world.zone('thr_banheiro', 4.66, 5.36, 7.74, 8.1);
  new Door(world, g, { id: 'porta_banheiro', name: 'porta do banheiro', hx: 4.65, hz: 7.7, rot: 0, swing: -1, width: 0.72 });
  // pia + espelho
  const sk = group(g, 4.45, 0, 8.45, Math.PI / 2); P.sinkUnit(sk);
  world.collider(4.2, 4.72, 8.2, 8.7, { los: false });
  const mir = new Mirror(0.5, 0.7, { res: 384, maxDist: 6 });
  mir.position.set(4.276, 1.6, 8.45); mir.rotation.y = Math.PI / 2;
  vis(mir, 'e');
  g.add(mir);
  box(g, 0.02, 0.74, 0.54, MATS.whiteFurn, 4.26, 1.6, 8.45);
  world.name('bath_mirror', mir);
  world.interact(mir, { id: 'bath_mirror', kind: 'examine', prompt: () => 'Olhar o espelho' });
  // toalha cobrindo o espelho (diferença do ato 2)
  const tw = group(g, 4.32, 1.62, 8.45, Math.PI / 2);
  P.towel(tw, 0.6, 0.78, '#6fb89a');
  vis(tw, 'ec');
  tw.visible = false;
  world.name('towel_mirror', tw);
  world.interact(tw, { id: 'towel_mirror', kind: 'examine', prompt: () => 'Tirar a toalha do espelho' });
  // vaso
  const tl = group(g, 5.05, 0, 9.6, Math.PI); P.toilet(tl);
  world.collider(4.8, 5.3, 9.3, 9.9, { los: false });
  world.interact(tl, { id: 'toilet', kind: 'examine', prompt: () => 'Examinar' });
  // box do chuveiro com toalha verde
  const sb = group(g, 0, 0, 0);
  box(sb, 0.02, 1.9, 1.1, MATS.glass, 5.66, 0.95, 9.3, { cast: false });
  cyl(sb, 0.015, 0.015, 1.15, MATS.chrome, 5.66, 1.95, 9.3, { rx: Math.PI / 2, seg: 6 });
  const tw2 = group(sb, 5.66, 1.55, 9.0, Math.PI / 2); P.towel(tw2, 0.5, 0.75, '#6fb89a');
  const head = group(sb, 6.35, 2.05, 9.8); cyl(head, 0.07, 0.05, 0.03, MATS.chrome, 0, 0, 0, { seg: 12 });
  world.collider(5.6, 5.72, 8.75, 9.85, { los: false });
  world.interact(sb, { id: 'shower', kind: 'hide', prompt: () => 'Esconder-se no box' });
  world.hide({ id: 'shower', kind: 'shower', cam: { x: 6.25, y: 1.4, z: 9.55, yaw: Math.PI * 0.5, pitch: 0 }, exit: { x: 5.4, z: 8.9 } });
  // registro do chuveiro (falta no ato 3)
  const rv = group(g, 6.55, 1.2, 9.3, -Math.PI / 2);
  const regMesh = cyl(rv, 0.04, 0.04, 0.03, std('#999', { metalness: 0.8 }), 0, 0, 0.015, { rx: Math.PI / 2, seg: 12 });
  const regHandle = box(rv, 0.09, 0.012, 0.02, std('#c33'), 0, 0, 0.035);
  world.name('shower_valve', { regMesh, regHandle, g: rv });
  world.interact(rv, { id: 'shower_valve', kind: 'examine', prompt: () => 'Registro do chuveiro' });
  // bicicleta dentro do box (diferença do ato 1)
  const bk = group(g, 6.15, 0, 9.35, Math.PI / 2); P.bike(bk); bk.rotation.z = 0.25;
  vis(bk, 'ec');
  world.name('bike_bath', bk);
  world.interact(bk, { id: 'bike_bath', kind: 'examine', prompt: () => 'A bicicleta?' });
  // quadrinho no azulejo
  const pic = group(g, 6.53, 1.65, 8.2, -Math.PI / 2);
  box(pic, 0.26, 0.32, 0.02, std('#6b3b1c'), 0, 0, 0); plane(pic, 0.2, 0.26, std('#d9cba0'), 0, 0, 0.011, { uv: false });
  world.interact(pic, { id: 'bath_picture', kind: 'examine', prompt: () => 'Examinar o quadrinho' });
  lampAt(world, g, 5.4, 8.8, { id: 'banheiro', room: 'banheiro', intensity: 5, dist: 5 });
  world.fixture(6.1, 1.9, 9.3, { id: 'shower_steam', room: 'banheiro', intensity: 0, dist: 3, on: false, color: 0xffe0c0 });
  world.nav('h0', 5.01, 7.9, 'banheiro'); world.nav('h1', 5.2, 8.7, 'banheiro');
  world.link('h0', 'c1', 'porta_banheiro'); world.link('h0', 'h1');
  world.end();
}

// ------------------------------------------------------------------ QUARTO ROXO
function buildRoxo(world, F) {
  const g = world.begin('roxo');
  room(world, g, 4.2, 7.3, 3.4, 6.7, MATS.woodFloor, 'wood', 'roxo');
  wall(world, g, 'x', 3.4, 4.2, 7.3, MATS.white, MATS.purple, [{ a: 4.6, b: 5.9, bottom: 0.9, top: 2.2 }]);
  wall(world, g, 'z', 7.3, 3.4, 6.7, MATS.purple, MATS.white);
  const wf = group(g, 5.25, 0.9, 3.4); P.windowFrame(wf, 1.3, 1.3);
  const cu = group(g, 5.25, 0, 3.52); P.curtains(cu, 1.7, 2.3, MATS.curtainBeige, 0.15);
  world.zone('roxo', 4.2, 7.3, 3.4, 6.7);
  world.zone('thr_roxo', 5.01, 5.81, 6.3, 6.66);
  if (!F.roomGiven) new Door(world, g, { id: 'porta_roxo', name: 'porta do quarto', hx: 5.0, hz: 6.7, rot: 0, swing: 1, width: 0.82 });
  // cama com manta azul de tricô
  const bd = group(g, 4.74, 0, 4.45); P.bed(bd, 0.95, 1.95, MATS.sheetLilac, MATS.knit);
  world.collider(4.2, 5.24, 3.45, 5.45, { los: false });
  const bedRoxo = world.interact(bd, { id: 'bed_roxo', kind: 'hide', prompt: () => 'Esconder-se embaixo da cama' });
  world.hide({ id: 'bed_roxo', kind: 'bed', cam: { x: 4.74, y: 0.2, z: 4.5, yaw: -Math.PI / 2, pitch: 0.02 }, exit: { x: 5.6, z: 4.6 } });
  // "Júlia" dormindo (ato 1) / pilha de roupas (ato 2)
  const sleeper = group(g, 4.74, 0.66, 4.2);
  const body = sphere(sleeper, 0.32, MATS.knit, 0, 0.02, 0.1, { sx: 0.9, sy: 0.45, sz: 2.0 });
  const hair = group(sleeper, 0, 0.06, -0.62);
  for (let i = 0; i < 9; i++) sphere(hair, 0.07, std('#140c07', { roughness: 1 }), Math.cos(i) * 0.08, Math.sin(i * 1.3) * 0.04, Math.sin(i) * 0.06, { seg: 8, seg2: 6 });
  world.name('julia_sleeper', { g: sleeper, body, hair });
  sleeper.traverse((o) => { if (o.isMesh) bedRoxo.meshes.push(o); }); // mirar na Júlia = mirar na cama
  const pile = group(g, 4.74, 0.62, 4.3);
  const pc = ['#222', '#e2e0da', '#6a1d2a', '#2b3a67'];
  for (let i = 0; i < 7; i++) { const b = box(pile, 0.3, 0.06, 0.25, std(pc[i % 4], { roughness: 1 }), (i % 3 - 1) * 0.12, 0.03 + (i % 2) * 0.05, (i - 3) * 0.08); b.rotation.y = i; }
  pile.visible = false;
  world.name('clothes_pile', pile);
  // guarda-roupa branco (quebra-cabeça da Júlia)
  const wr = group(g, 6.72, 0, 3.74); P.wardrobeBody(wr, 1.05, 2.1, 0.58, MATS.whiteFurn);
  world.collider(6.2, 7.25, 3.45, 4.03);
  const l1 = new Leaf(world, g, { id: 'wr_roxo_l', hinge: new THREE.Vector3(6.2, 0.02, 4.04), rot: 0, w: 0.52, h: 2.05, leftHinge: true, interact: false });
  const l2 = new Leaf(world, g, { id: 'wr_roxo_r', hinge: new THREE.Vector3(7.24, 0.02, 4.04), rot: 0, w: 0.52, h: 2.05, leftHinge: false, interact: false });
  world.name('wr_roxo', [l1, l2]);
  world.interact(wr, { id: 'wardrobe_roxo', kind: 'hide', extra: [l1.pivot, l2.pivot], prompt: () => 'Esconder-se no guarda-roupa' });
  world.hide({ id: 'wardrobe_roxo', kind: 'wardrobe', leaf: l1, leaf2: l2, cam: { x: 6.72, y: 1.3, z: 3.75, yaw: Math.PI, pitch: -0.05 }, exit: { x: 6.7, z: 4.6 } });
  // itens dentro do guarda-roupa
  const inside = group(g, 6.72, 1.12, 3.8);
  box(inside, 0.14, 0.1, 0.1, std('#6b2b3a'), -0.2, 0.05, 0); box(inside, 0.14, 0.02, 0.1, std('#d8b27a'), -0.2, 0.11, 0);
  const ear = group(inside, 0.15, 0.02, 0); cyl(ear, 0.03, 0.03, 0.01, std('#fff'), 0, 0, 0, { seg: 10 }); cyl(ear, 0.03, 0.03, 0.01, std('#fff'), 0.08, 0, 0.02, { seg: 10 });
  inside.visible = false;
  world.name('wr_roxo_items', inside);
  // penteadeira com espelho redondo (memória da casa)
  const vn = group(g, 7.05, 0, 4.95, -Math.PI / 2); P.vanity(vn);
  world.collider(6.82, 7.3, 4.5, 5.4, { los: false });
  const rm = new Mirror(0.62, 0.62, { res: 384, maxDist: 5 });
  rm.geometry.dispose(); rm.geometry = new THREE.CircleGeometry(0.31, 32);
  rm.position.set(7.228, 1.35, 4.95); rm.rotation.y = -Math.PI / 2;
  vis(rm, 'e');
  g.add(rm);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 32), MATS.whiteFurn);
  ring.position.set(7.232, 1.35, 4.95); ring.rotation.y = -Math.PI / 2; g.add(ring);
  world.name('round_mirror', rm);
  world.interact(rm, { id: 'round_mirror', kind: 'examine', prompt: () => 'Olhar o espelho redondo' });
  // carregador do Wendel em cima da penteadeira
  const ch = group(g, 7.0, 0.78, 5.25);
  box(ch, 0.05, 0.05, 0.03, std('#f2f2f2'), 0, 0.025, 0);
  box(ch, 0.25, 0.006, 0.006, std('#eee'), -0.12, 0.004, 0.02);
  world.name('charger', ch);
  world.interact(ch, { id: 'charger', kind: 'pickup', prompt: () => 'Pegar o carregador' });
  const chair = group(g, 6.45, 0, 4.95, Math.PI / 2); P.officeChair(chair);
  world.collider(6.2, 6.7, 4.7, 5.2, { los: false });
  // cômoda branca de 4 gavetas (quebra-cabeça)
  const dr = group(g, 7.07, 0, 6.05, -Math.PI / 2);
  const dd = P.dresser(dr, 1.0, 0.9, 0.45, 4);
  world.collider(6.84, 7.3, 5.55, 6.55, { los: false });
  const drawers = [];
  for (let i = 0; i < 4; i++) {
    const y = 0.86 - 0.04 - dd.rowH * (i + 0.5);
    drawers.push(new Drawer(world, g, { id: 'dresser_' + (i + 1), name: 'gaveta ' + (i + 1), pos: new THREE.Vector3(7.07, y, 6.05), ry: -Math.PI / 2, dir: new THREE.Vector3(-1, 0, 0), w: 0.92, h: dd.rowH - 0.02, d: 0.4, depth: 0.28 }));
  }
  drawers.forEach((d) => vis(d.group, 'evc'));
  world.name('dresser_drawers', drawers);
  // gavetas "do espelho" (só aparecem no reflexo): padrão aberto-fechado-fechado-aberto
  const md = group(g, 0, 0, 0);
  const pattern = [1, 0, 0, 1];
  pattern.forEach((o, i) => {
    const y = 0.86 - 0.04 - dd.rowH * (i + 0.5);
    box(md, 0.02, dd.rowH - 0.03, 0.9, MATS.whiteFurn, 6.83 - o * 0.28, y, 6.05);
    if (o) box(md, 0.28, 0.02, 0.86, MATS.oak, 6.97 - 0.14, y - dd.rowH / 2 + 0.03, 6.05);
  });
  vis(md, 'm');
  world.name('dresser_mirror', md);
  // tomadas embaixo do ar-condicionado
  const acu = group(g, 7.18, 2.25, 4.3, -Math.PI / 2); P.ac(acu);
  for (let i = 0; i < 3; i++) socket(world, g, i === 1 ? 'socket_roxo' : 'socket_roxo_' + i, 7.232, 1.25, 3.95 + i * 0.18, -Math.PI / 2);
  // mochila do colégio, patins
  const bp = group(g, 5.55, 0, 5.95, 0.4); P.backpack(bp, '#5a3c7a');
  world.interact(bp, { id: 'backpack', kind: 'examine', prompt: () => 'Mochila' });
  const bp2 = group(g, 5.95, 0, 6.2, -0.3); P.backpack(bp2, '#222');
  const sk = group(g, 6.3, 0, 5.8, 0.5); P.skates(sk);
  world.interact(sk, { id: 'skates', kind: 'examine', prompt: () => 'Patins' });
  const lamp = lampAt(world, g, 5.75, 5.0, { id: 'roxo', room: 'roxo', intensity: 5, dist: 6, color: 0xfff0e6 });
  void lamp;
  if (!F.roomGiven) {
    world.nav('r0', 5.41, 6.45, 'roxo'); world.nav('r1', 5.8, 5.6, 'roxo'); world.nav('r2', 5.8, 4.5, 'roxo');
    world.link('r0', 'c1', 'porta_roxo'); world.link('r0', 'r1'); world.link('r1', 'r2');
  }
  world.end();
}

// ------------------------------------------------------------------ QUARTO DOS MENINOS
function buildMeninos(world, F) {
  const g = world.begin('meninos');
  room(world, g, 7.3, 10.4, 3.4, 6.7, MATS.woodFloor, 'wood', 'meninos');
  wall(world, g, 'x', 3.4, 7.3, 10.4, MATS.white, MATS.whiteDirty, [{ a: 8.1, b: 9.3, bottom: 0.9, top: 2.2 }]);
  wall(world, g, 'z', 10.4, 3.4, 6.7, MATS.whiteDirty, MATS.white);
  const wf = group(g, 8.7, 0.9, 3.4); P.windowFrame(wf, 1.2, 1.3);
  const cu = group(g, 8.7, 0, 3.52); P.curtains(cu, 1.6, 2.3, MATS.curtainBeige, 0.1);
  const acu = group(g, 8.7, 2.35, 3.55); P.ac(acu);
  world.zone('meninos', 7.3, 10.4, 3.4, 6.7);
  new Door(world, g, { id: 'porta_meninos', name: 'porta do quarto', hx: 8.3, hz: 6.7, rot: 0, swing: 1, width: 0.82 });
  // escrivaninha preta com notebook
  const dk = group(g, 7.66, 0, 4.4, Math.PI / 2); P.desk(dk, 1.4, 0.6, MATS.black);
  world.collider(7.36, 7.96, 3.7, 5.1, { los: false });
  const lp = group(g, 7.7, 0.76, 4.3, Math.PI / 2);
  const laptop = P.laptop(lp);
  world.name('laptop', laptop);
  world.interact(lp, { id: 'laptop', kind: 'examine', prompt: () => 'Notebook' });
  box(g, 0.14, 0.02, 0.44, std('#111'), 7.82, 0.77, 4.95);
  const books = ['#1a3c7a', '#b33', '#eee', '#dba531'];
  books.forEach((c, i) => box(g, 0.22, 0.04, 0.3, std(c), 7.62, 0.78 + i * 0.04, 3.9, { ry: i * 0.1 }));
  const ch = group(g, 8.25, 0, 4.4, -Math.PI / 2); P.officeChair(ch);
  world.collider(8.0, 8.5, 4.15, 4.65, { los: false });
  // gavetinha com cadeado (código)
  const gv = group(g, 7.6, 0, 5.42, Math.PI / 2);
  box(gv, 0.42, 0.62, 0.42, std('#1d1d1d'), 0, 0.31, 0);
  box(gv, 0.38, 0.2, 0.02, std('#2a2a2a'), 0, 0.46, 0.215);
  box(gv, 0.1, 0.02, 0.02, MATS.chrome, 0, 0.5, 0.23, { cast: false });
  const lock = box(gv, 0.06, 0.07, 0.02, std('#c9a23a', { metalness: 0.8, roughness: 0.3 }), 0, 0.4, 0.235);
  world.collider(7.36, 7.82, 5.2, 5.64, { los: false });
  world.name('vasco_lock', lock);
  world.interact(gv, { id: 'vasco_drawer', kind: 'examine', prompt: () => 'Gaveta com cadeado' });
  // bandeira preta com faixa branca (homenagem)
  const fl = group(g, 7.37, 1.75, 4.4, Math.PI / 2);
  plane(fl, 1.0, 0.66, texMat(TX.sashFlag(), { roughness: 0.9, side: THREE.DoubleSide }), 0, 0, 0, { uv: false });
  world.interact(fl, { id: 'flag', kind: 'examine', prompt: () => 'Bandeira' });
  // TV na parede
  const tvg = group(g, 7.9, 1.7, 6.63, Math.PI); P.tv(tvg, 0.9);
  // cama com lençol rosa
  const bd = group(g, 9.9, 0, 4.45); P.bed(bd, 0.95, 1.95, MATS.sheetPink, null);
  world.collider(9.4, 10.4, 3.45, 5.45, { los: false });
  const bedMeninos = world.interact(bd, { id: 'bed_meninos', kind: 'hide', prompt: () => 'Esconder-se embaixo da cama' });
  world.hide({ id: 'bed_meninos', kind: 'bed', cam: { x: 9.9, y: 0.2, z: 4.5, yaw: Math.PI / 2, pitch: 0.02 }, exit: { x: 9.0, z: 4.6 } });
  const sleeper = group(g, 9.9, 0.66, 4.3);
  sphere(sleeper, 0.3, MATS.sheetWhite, 0, 0, 0.1, { sx: 0.9, sy: 0.5, sz: 2.1 });
  sphere(sleeper, 0.11, std('#1a0f08', { roughness: 1 }), 0, 0.05, -0.6);
  world.name('pedro_sleeper', sleeper);
  sleeper.traverse((o) => { if (o.isMesh) bedMeninos.meshes.push(o); });
  // guarda-roupa cinza e madeira (esconderijo)
  const wr = group(g, 9.85, 0, 6.38, Math.PI); P.wardrobeBody(wr, 1.05, 2.1, 0.58, std('#5d6066', { roughness: 0.6 }));
  world.collider(9.32, 10.38, 6.08, 6.67);
  const l1 = new Leaf(world, g, { id: 'wr_men_l', hinge: new THREE.Vector3(10.37, 0.02, 6.07), rot: Math.PI, w: 0.52, h: 2.05, leftHinge: true, interact: false, mat: MATS.oakDark });
  const l2 = new Leaf(world, g, { id: 'wr_men_r', hinge: new THREE.Vector3(9.33, 0.02, 6.07), rot: Math.PI, w: 0.52, h: 2.05, leftHinge: false, interact: false, mat: std('#5d6066', { roughness: 0.6 }) });
  world.interact(wr, { id: 'wardrobe_meninos', kind: 'hide', extra: [l1.pivot, l2.pivot], prompt: () => 'Esconder-se no guarda-roupa' });
  world.hide({ id: 'wardrobe_meninos', kind: 'wardrobe', leaf: l1, leaf2: l2, cam: { x: 9.85, y: 1.3, z: 6.4, yaw: 0, pitch: -0.05 }, exit: { x: 9.8, z: 5.7 } });
  socket(world, g, 'socket_meninos', 7.368, 0.35, 5.3, Math.PI / 2);
  lampAt(world, g, 8.85, 5.0, { id: 'meninos', room: 'meninos', intensity: 5, dist: 6 });
  world.fixture(7.9, 1.0, 4.3, { id: 'laptop_glow', room: 'meninos', intensity: 0, dist: 3, on: false, color: 0x9fc8ff });
  world.nav('m0', 8.71, 6.45, 'meninos'); world.nav('m1', 8.8, 5.6, 'meninos'); world.nav('m2', 8.8, 4.4, 'meninos');
  world.link('m0', 'c2', 'porta_meninos'); world.link('m0', 'm1'); world.link('m1', 'm2');
  world.end();
}

// ------------------------------------------------------------------ QUARTO DOS PAIS
function buildPais(world, F, lay) {
  const g = world.begin('pais');
  const Px = lay.P;
  room(world, g, Px, Px + 3.6, 4.9, 9.4, MATS.woodFloor, 'wood', 'pais');
  wall(world, g, 'z', Px, 4.9, 9.4, MATS.white, MATS.white, [{ a: 6.79, b: 7.61 }]);
  wall(world, g, 'x', 4.9, Px, Px + 3.6, MATS.white, MATS.white);
  wall(world, g, 'x', 9.4, Px, Px + 3.6, MATS.white, MATS.white, [{ a: Px + 1.2, b: Px + 2.6, bottom: 0.95, top: 2.1 }]);
  wall(world, g, 'z', Px + 3.6, 4.9, 9.4, MATS.white, MATS.white);
  const wf = group(g, Px + 1.9, 0.95, 9.4); P.windowFrame(wf, 1.4, 1.15, { bars: true });
  world.zone('pais', Px, Px + 3.6, 4.9, 9.4);
  new Door(world, g, { id: 'porta_pais', name: 'porta do quarto dos pais', hx: Px, hz: 6.79, rot: -Math.PI / 2, swing: 1, width: 0.82, locked: true, lockMsg: 'Trancada por dentro.' });
  // cama de casal
  const bd = group(g, Px + 2.58, 0, 7.2, -Math.PI / 2); P.bed(bd, 1.6, 2.0, MATS.sheetWhite, texMat(TX.fabric('#8a7f74', { seed: 9 }), { roughness: 1 }));
  world.collider(Px + 1.55, Px + 3.6, 6.35, 8.05, { los: false });
  const bedPais = world.interact(bd, { id: 'bed_pais', kind: 'hide', prompt: () => 'Esconder-se embaixo da cama' });
  world.hide({ id: 'bed_pais', kind: 'bed', cam: { x: Px + 2.6, y: 0.2, z: 7.2, yaw: Math.PI / 2 + 0.3, pitch: 0.02 }, exit: { x: Px + 1.0, z: 7.2 } });
  const sleepers = group(g, Px + 2.7, 0.66, 7.2);
  sphere(sleepers, 0.3, texMat(TX.fabric('#8a7f74', { seed: 9 })), 0, 0, -0.35, { sx: 2.0, sy: 0.5, sz: 0.9 });
  sphere(sleepers, 0.3, texMat(TX.fabric('#8a7f74', { seed: 9 })), 0, 0, 0.38, { sx: 2.0, sy: 0.5, sz: 0.9 });
  world.name('parents_sleepers', sleepers);
  sleepers.traverse((o) => { if (o.isMesh) bedPais.meshes.push(o); });
  // guarda-roupa de madeira com porta espelhada
  const wr = group(g, Px + 1.8, 0, 5.2); P.wardrobeBody(wr, 3.0, 2.2, 0.6, MATS.rustic);
  world.collider(Px + 0.3, Px + 3.3, 4.9, 5.52);
  box(g, 1.0, 2.12, 0.03, MATS.rustic, Px + 0.8, 1.08, 5.5);
  box(g, 1.0, 2.12, 0.03, MATS.rustic, Px + 2.8, 1.08, 5.5);
  box(g, 1.02, 2.12, 0.02, MATS.rustic, Px + 1.8, 1.08, 5.49);
  const wm = new Mirror(0.92, 1.95, { res: 512, maxDist: 8 });
  wm.position.set(Px + 1.8, 1.08, 5.51);
  vis(wm, 'e');
  g.add(wm);
  world.name('wardrobe_mirror', wm);
  world.interact(wm, { id: 'wardrobe_mirror', kind: 'examine', prompt: () => 'Olhar o espelho' });
  const wl = new Leaf(world, g, { id: 'wr_pais', hinge: new THREE.Vector3(Px + 3.3, 0.02, 5.53), rot: 0, w: 0.98, h: 2.1, leftHinge: false, interact: false, mat: MATS.rustic });
  const hideBox = group(g, Px + 2.8, 1.0, 5.55);
  box(hideBox, 0.9, 1.9, 0.04, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, { cast: false });
  world.interact(hideBox, { id: 'wardrobe_pais', kind: 'hide', extra: [wl.pivot], prompt: () => 'Esconder-se no guarda-roupa' });
  world.hide({ id: 'wardrobe_pais', kind: 'wardrobe', leaf: wl, cam: { x: Px + 2.8, y: 1.35, z: 5.2, yaw: Math.PI, pitch: -0.05 }, exit: { x: Px + 2.8, z: 6.1 } });
  // escrivaninha com fotos + chapéu de palha pendurado
  const dk = group(g, Px + 0.3, 0, 8.6, Math.PI / 2); P.desk(dk, 1.2, 0.55, MATS.oak);
  world.collider(Px, Px + 0.58, 8.0, 9.2, { los: false });
  const f1 = group(g, Px + 0.3, 0.86, 8.35, Math.PI / 2); P.photoFrame(f1, TX.familyPhoto('ok', 2, 7), 0.16, 0.2);
  const f2 = group(g, Px + 0.3, 0.84, 8.75, Math.PI / 2); P.photoFrame(f2, TX.familyPhoto('ok', 6, 8), 0.2, 0.15);
  world.name('parents_photos', [f1, f2]);
  world.interact(f1, { id: 'desk_photos', kind: 'examine', prompt: () => 'Olhar as fotos' });
  const hat = group(g, Px + 0.08, 1.75, 8.9, Math.PI / 2); hat.rotation.z = Math.PI / 2; hat.rotation.order = 'YZX';
  P.hat(hat);
  world.name('hat_wall', hat);
  world.interact(hat, { id: 'hat', kind: 'examine', prompt: () => 'Chapéu de palha' });
  // colar pendurado junto ao chapéu
  for (let i = 0; i < 10; i++) sphere(g, 0.008, std('#aaa'), Px + 0.04, 1.62 - i * 0.03, 8.9 + Math.sin(i * 0.6) * 0.03, { seg: 5, seg2: 4, cast: false });
  // cômoda com muitos produtos + TV
  const cm = group(g, Px + 3.2, 0, 8.95, Math.PI); box(cm, 0.7, 0.8, 0.45, MATS.oak, 0, 0.4, 0);
  const prod = ['#e8327a', '#fff', '#f5d10c', '#3cc34a', '#9b3fd1', '#1ea5e0'];
  for (let i = 0; i < 8; i++) cyl(cm, 0.025, 0.025, 0.08 + (i % 3) * 0.05, std(prod[i % 6]), -0.28 + i * 0.08, 0.84 + (i % 3) * 0.025, (i % 2) * 0.1, { seg: 8 });
  world.collider(Px + 2.85, Px + 3.55, 8.72, 9.4, { los: false });
  const tvg = group(g, Px + 0.04, 1.6, 5.95, Math.PI / 2); P.tv(tvg, 1.0);
  socket(world, g, 'socket_pais', Px + 0.07, 0.35, 8.0, Math.PI / 2);
  const fanG = group(g, Px + 1.8, H, 7.2);
  const fan = P.ceilingFan(fanG);
  const fm = bulbMat(); fan.bulb.material = fm;
  world.name('fan_pais', fan);
  world.fixture(Px + 1.8, H - 0.45, 7.2, { id: 'pais', room: 'pais', intensity: 6, dist: 7, bulb: fm });
  world.nav('pp0', Px + 0.4, 7.2, 'pais'); world.nav('pp1', Px + 1.1, 7.2, 'pais'); world.nav('pp2', Px + 1.2, 6.0, 'pais'); world.nav('pp3', Px + 1.2, 8.7, 'pais');
  world.link('pp0', 'c3', 'porta_pais'); world.link('pp0', 'pp1'); world.link('pp1', 'pp2'); world.link('pp1', 'pp3');
  world.end();
}

// ------------------------------------------------------------------ O QUARTO QUE NÃO EXISTE (escada impossível)
export const STAIR = { x0: 11.3, x1: 13.3, z0: 8.4, z1: 10.3, drop: 1.45 };
function stairHeight(x, z) {
  const t = Math.max(0, Math.min(1, (z - STAIR.z0) / (STAIR.z1 - STAIR.z0)));
  return -Math.floor(t * 8) / 8 * STAIR.drop;
}
function buildStairs(parent, ox, mat, steps = 8) {
  const run = (STAIR.z1 - STAIR.z0) / steps;
  const rise = STAIR.drop / steps;
  for (let i = 0; i < steps; i++) {
    box(parent, STAIR.x1 - STAIR.x0, 0.2, run, mat, ox + (STAIR.x0 + STAIR.x1) / 2, -rise * i - 0.1, STAIR.z0 + run * (i + 0.5));
  }
}
function buildExtra(world, F, lay) {
  const g = world.begin('extra');
  const oldWall = texMat(TX.paint('#6b5a44', { seed: 31, stains: 0.35, mottled: 0.2 }), { roughness: 1 });
  const oldFloor = texMat(TX.woodFloor({ seed: 21, tones: ['#3a2618', '#2e1d12', '#452c1b'] }), { roughness: 0.9 });
  // patamar
  slab(g, 11.1, 13.3, 7.7, 8.4, oldFloor, 0);
  slab(g, 11.1, 13.3, 7.7, 10.4, oldWall, H, true);
  world.floor(11.1, 13.3, 7.7, 8.4, 'wood', null, 'extra');
  world.floor(STAIR.x0, STAIR.x1, 8.4, 10.6, 'stairs', stairHeight, 'extra');
  buildStairs(g, 0, oldFloor);
  // paredes descendo
  wall(world, g, 'z', 11.1, 7.7, 10.6, MATS.white, oldWall, [], { y0: -3 });
  wall(world, g, 'z', 13.3, 7.7, 10.6, oldWall, MATS.white, [], { y0: -3 });
  wall(world, g, 'x', 10.6, 11.1, 13.3, oldWall, MATS.white, [], { y0: -3 });
  world.collider(11.1, 11.3, 8.4, 10.6); // parapeito da escada
  world.zone('extra', 11.1, 13.3, 7.7, 10.6);
  world.zone('stairs_bottom', 11.1, 13.3, 9.75, 10.6);
  const door = new Door(world, g, { id: 'porta_extra', name: 'porta que não existe', hx: 11.8, hz: 7.7, rot: 0, swing: -1, width: 0.82, mat: MATS.doorOld, houseDoor: true, locked: true, lockMsg: 'A maçaneta não gira.' });
  void door;
  // escuridão sólida no fim da escada (antes do ato 3)
  const dark = group(g, 12.3, -1.2, 10.2);
  box(dark, 2.2, 2.6, 0.1, new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0, 0, { cast: false });
  world.name('stairs_dark', dark);
  box(g, 2.2, 3.2, 0.05, new THREE.MeshBasicMaterial({ color: 0x000000 }), 12.2, -1.3, 10.5, { cast: false });
  world.name('stairs_dark_col', world.collider(11.1, 13.3, 9.6, 9.8, { los: false }));
  world.fixture(12.2, 2.2, 8.0, { id: 'extra', room: 'extra', intensity: 0.8, dist: 4, color: 0xffb070 });
  world.nav('x0', 12.21, 7.95, 'extra');
  world.link('x0', 'c4', 'porta_extra');
  world.end();
}

// ------------------------------------------------------------------ LÁ FORA
function buildOutside(world, F) {
  const g = world.begin('outside');
  const cityMat = new THREE.MeshBasicMaterial({ map: TX.nightCity(), side: THREE.BackSide, fog: false });
  const city = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, 60, 48, 1, true), cityMat);
  city.position.set(4, -8, 4);
  g.add(city);
  world.name('city_sky', city);
  // chão distante
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x050605, fog: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(4, -22, 4); g.add(ground);
  // campo de futebol iluminado (visto da varanda)
  const field = group(g, 18, -21.8, -38);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), new THREE.MeshBasicMaterial({ color: 0x2f6b2c, fog: false }));
  grass.rotation.x = -Math.PI / 2; field.add(grass);
  const lines = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.6, 32), new THREE.MeshBasicMaterial({ color: 0xdfe8d8, fog: false }));
  lines.rotation.x = -Math.PI / 2; lines.position.y = 0.02; field.add(lines);
  const mid = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 16), new THREE.MeshBasicMaterial({ color: 0xdfe8d8, fog: false }));
  mid.rotation.x = -Math.PI / 2; mid.position.y = 0.02; field.add(mid);
  for (const [x, z] of [[-14, -9], [14, -9], [-14, 9], [14, 9]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 14, 6), new THREE.MeshBasicMaterial({ color: 0x222222, fog: false }));
    pole.position.set(x, 7, z); field.add(pole);
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false, side: THREE.DoubleSide }));
    lamp.position.set(x, 14, z); lamp.lookAt(0, 0, 0); field.add(lamp);
  }
  const sb = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: TX.scoreboard(), fog: false }));
  sb.position.set(0, 5, -9.5); field.add(sb);
  world.name('field', field);
  // alguém parado no meio do campo (visível só às vezes)
  const figure = group(field, 0, 0, 0);
  const fm = new THREE.MeshBasicMaterial({ color: 0xcdb8ac, fog: false });
  const fb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 1.5, 6), fm); fb.position.y = 1.35; fb.rotation.x = 0.2; figure.add(fb);
  for (const sx of [-1, 1]) {
    const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.1, 5), fm); lg.position.set(sx * 0.14, 0.55, 0); lg.rotation.z = sx * 0.08; figure.add(lg);
    const ar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 1.2, 5), fm); ar.position.set(sx * 0.36, 2.35, 0.25); ar.rotation.z = -sx * 0.35; ar.rotation.x = -0.3; figure.add(ar);
    const hd2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), fm); hd2.scale.set(1, 1.5, 0.4); hd2.position.set(sx * 0.55, 2.95, 0.42); figure.add(hd2);
  }
  const fh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), fm); fh.scale.set(0.9, 1.25, 1); fh.position.y = 2.35; figure.add(fh);
  figure.rotation.y = Math.PI * 0.85;
  figure.scale.setScalar(1.3);
  figure.visible = false;
  world.name('field_figure', figure);
  // lua
  const moonMat = new THREE.MeshBasicMaterial({ map: TX.moonTex(false), transparent: true, fog: false, depthWrite: false });
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), moonMat);
  moon.position.set(-10, 22, -60); moon.lookAt(2, 1.5, 0);
  g.add(moon);
  world.name('moon', moon);
  g.traverse((o) => { o.castShadow = false; o.receiveShadow = false; });
  world.end();
}

// ================================================================== estado dinâmico
// Aplica bandeiras da história aos objetos já construídos (sem reconstruir).
export function applyHouse(world, F) {
  const get = (id) => world.get(id);
  const act = F.act || 1;
  // quadro
  const p = get('painting');
  if (p) {
    const mode = F.paintingMode || 'wall';
    const tex = TX.popArt(mode === 'upside');
    p.traverse((o) => { if (o.isMesh && o.material.map && o.material.map.image && o.material.map.image.width === 512) o.material = texMat(tex, { roughness: 0.5 }); });
    if (mode === 'floor') { p.position.set(3.2, 0.39, 7.86); p.rotation.set(-0.12, Math.PI, 0); }
    else { p.position.set(3.2, 1.55, 7.93); p.rotation.set(0, Math.PI, 0); }
  }
  // bicicleta
  const bikeHome = F.d_bike !== false && act < 3 ? !!F.d_bike : true;
  const bk = get('bike'); if (bk) bk.visible = F.d_bike === true || act >= 2;
  const bc = get('bike_col'); if (bc) bc.enabled = !!(bk && bk.visible);
  const bb = get('bike_bath'); if (bb) bb.visible = !(F.d_bike === true || act >= 2);
  void bikeHome;
  // fotos do rack
  const pl = get('rack_photo_list');
  if (pl) {
    pl.photos.forEach(({ f, pic }, i) => {
      f.rotation.x = F.d_fotos || act >= 2 ? 0 : Math.PI / 2 - 0.05;
      f.position.y = F.d_fotos || act >= 2 ? 0.09 : 0.012;
      const kind = act >= 2 ? (act >= 3 ? 'scratched' : 'blank') : 'ok';
      pic.material = texMat(TX.familyPhoto(kind, 4 + (i % 2), i + 1), { roughness: 0.6 });
    });
  }
  const pp = get('parents_photos');
  if (pp) pp.forEach((f, i) => { f.children.filter((c) => c.isMesh && c.geometry.type === 'PlaneGeometry').forEach((m) => { m.material = texMat(TX.familyPhoto(act >= 2 ? 'blank' : 'ok', i ? 6 : 2, 7 + i), { roughness: 0.6 }); }); });
  const bp = get('bday_photo'); if (bp) bp.material = texMat(TX.birthdayPhoto(F.clownLooked ? 1 : 0), { roughness: 0.6 });
  // lençol com figura
  const sf = get('sheet_figure'); if (sf) sf.visible = !F.d_lencol && act === 1;
  // cadeira aberta (ato 2)
  const co = get('chair_open'); if (co) co.visible = act === 2 && !F.d_cadeira;
  const fc = get('folding_chair'); if (fc) fc.visible = !(act === 2 && !F.d_cadeira);
  // toalha no espelho (ato 2)
  const tw = get('towel_mirror'); if (tw) tw.visible = act === 2 && !F.d_toalha;
  // cortina (ato 2 fechada)
  // porta-chaves
  const kh = get('keyholder');
  if (kh) {
    while (kh.children.length > 1) kh.remove(kh.children[1]);
    let keys = 5, extra = false;
    if (F.oldKeyShown && !F.hasOldKey) extra = true;
    if (act >= 2) keys = 0;
    if (F.keysHung) keys = 5;
    const list = P.keyHolder(kh, extra ? 6 : keys, extra);
    if (extra && act >= 2) list.slice(0, -1).forEach((k) => (k.visible = false));
    if (F.keysHung && F.oldKeyHung) { const k = group(kh, 0.15, -0.06, 0.03); box(k, 0.012, 0.06, 0.003, std('#7a5a2a', { metalness: 0.5 }), 0, -0.02, 0, { cast: false }); }
  }
  // dormindo
  const js = get('julia_sleeper'); if (js) js.g.visible = act === 1;
  const cp = get('clothes_pile'); if (cp) cp.visible = act >= 2;
  const ps = get('pedro_sleeper'); if (ps) ps.visible = act === 1;
  const pas = get('parents_sleepers'); if (pas) pas.visible = act === 1;
  // banquinho
  const loc = F.stoolAt || 'sala';
  const s1 = get('stool'); if (s1) s1.visible = loc === 'sala';
  const s2 = get('stool_shelf'); if (s2) s2.visible = loc === 'shelf';
  const s3 = get('stool_fridge'); if (s3) s3.visible = loc === 'fridge';
  // ração
  const rc = get('racao'); if (rc) rc.visible = !F.hasRacao && !F.fedCats;
  const f1 = get('food_bento'); if (f1) f1.visible = !!F.fedCats;
  const f2 = get('food_lili'); if (f2) f2.visible = !!F.fedCats;
  // carregador
  const ch = get('charger'); if (ch) ch.visible = !F.hasCharger;
  // guarda-roupa roxo
  const wi = get('wr_roxo_items'); if (wi) wi.visible = !!F.wardrobeRoxoOpen && !F.gotJuliaItems;
  // gelo
  const ice = get('ice_block'); if (ice) ice.visible = !!F.iceVisible && !F.hasIce && !F.hasMomKeys;
  // registro do chuveiro
  const reg = get('registro'); if (reg) reg.visible = false; // agora ele está na mesa do apartamento de antes
  const sv = get('shower_valve'); if (sv) { const show = act < 3 || F.valveFixed; sv.regHandle.visible = show; }
  // chapéu
  const hw = get('hat_wall'); if (hw) hw.visible = act === 1 || F.dadFound;
  // escuridão na escada
  const sd = get('stairs_dark'); if (sd) sd.visible = !F.stairsOpen;
  const sdc = get('stairs_dark_col'); if (sdc) sdc.enabled = !F.stairsOpen;
  // lua vermelha no ato 3
  const moon = get('moon'); if (moon) moon.material.map = TX.moonTex(act >= 3);
  const ff = get('field_figure'); if (ff) ff.visible = act >= 3 && !F.antesDone;
  // portas
  const d = world.doors;
  if (d.get('porta_pais')) d.get('porta_pais').locked = act === 1 ? true : false;
  if (d.get('porta_meninos')) d.get('porta_meninos').locked = act === 2 && !F.hasMomKeys;
  if (d.get('porta_meninos')) d.get('porta_meninos').lockMsg = 'Trancada. Alguém tem a chave reserva...';
  if (d.get('porta_extra')) {
    const de = d.get('porta_extra');
    de.locked = !F.extraUnlocked;
    de.lockMsg = F.hasOldKey && !F.extraUnlocked ? 'A chave velha gira... mas algo do outro lado segura a maçaneta.' : 'A maçaneta não gira.';
  }
  if (d.get('rack_drawer')) d.get('rack_drawer');
  const rd = world.interactables.find((i) => i.id === 'rack_drawer');
  if (rd) { /* trava controlada pela história */ }
}
