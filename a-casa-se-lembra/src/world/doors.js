// Portas, gavetas, portas de armário e esconderijos.
import * as THREE from 'three';
import { box, cyl, MATS } from './geom.js';
import { audio } from '../core/audio.js';
import { clamp } from '../core/util.js';

// Porta de giro. axis: 'x' (porta num muro que corre ao longo de X) ou 'z'.
// hinge: posição da dobradiça; width: largura; swing: +1/-1 lado de abertura.
export class Door {
  constructor(world, parent, def) {
    this.world = world;
    this.id = def.id;
    this.def = def;
    this.name = def.name || 'porta';
    this.locked = !!def.locked;
    this.lockMsg = def.lockMsg || 'Está trancada.';
    this.houseDoor = !!def.houseDoor; // portas criadas pela casa: o Inquilino não atravessa
    this.fake = !!def.fake;
    this.open = 0; // 0..1
    this.target = def.startOpen ? 1 : 0;
    this.open = this.target;
    this.maxAngle = def.maxAngle || 1.65;
    this.speed = def.speed || 2.2;
    this.onOpen = def.onOpen || null;
    const w = def.width || 0.82, hgt = def.height || 2.08, t = 0.04;
    this.pivot = new THREE.Group();
    this.pivot.position.set(def.hx, def.y || 0, def.hz);
    this.baseRot = def.rot || 0;
    this.swing = def.swing || 1;
    this.pivot.rotation.y = this.baseRot;
    this.pivot.userData.dynamic = true;
    parent.add(this.pivot);
    const mat = def.mat || MATS.doorWood;
    const panel = box(this.pivot, w, hgt, t, mat, w / 2, hgt / 2, 0, { uv: false });
    this.panel = panel;
    // maçaneta dos dois lados
    const hx = w - 0.08;
    box(this.pivot, 0.03, 0.18, 0.02, MATS.chrome, hx, 1.0, t / 2 + 0.012, { cast: false });
    box(this.pivot, 0.03, 0.18, 0.02, MATS.chrome, hx, 1.0, -t / 2 - 0.012, { cast: false });
    box(this.pivot, 0.12, 0.022, 0.05, MATS.chrome, hx - 0.05, 1.05, t / 2 + 0.03, { cast: false });
    box(this.pivot, 0.12, 0.022, 0.05, MATS.chrome, hx - 0.05, 1.05, -t / 2 - 0.03, { cast: false });
    // colisor do vão (quando fechada)
    const cx = def.hx + Math.cos(this.baseRot) * w / 2;
    const cz = def.hz - Math.sin(this.baseRot) * w / 2;
    const alongX = Math.abs(Math.cos(this.baseRot)) > 0.5;
    this.col = alongX ? world.colliderC(cx, cz, w, 0.12, { tag: 'door', id: this.id }) : world.colliderC(cx, cz, 0.12, w, { tag: 'door', id: this.id });
    this.center = new THREE.Vector3(cx, (def.y || 0) + 1, cz);
    world.door(this);
    this.interact = world.interact(this.pivot, {
      id: this.id,
      kind: 'door',
      prompt: () => (this.fake ? 'Abrir' : this.open > 0.5 ? 'Fechar' : 'Abrir'),
      action: () => this.toggle(true),
    });
    world.update((dt) => this.update(dt));
    this.update(0);
  }

  toggle(byPlayer = false) {
    if (this.target < 0.5) this.tryOpen(byPlayer);
    else this.close(byPlayer);
  }
  tryOpen(byPlayer = false) {
    if (this.fake) {
      audio.play('locked', { pos: this.center });
      return false;
    }
    if (this.locked) {
      audio.play('locked', { pos: this.center });
      if (byPlayer && this.world.game) this.world.game.ui.toast(this.lockMsg);
      return false;
    }
    this.openNow(byPlayer);
    return true;
  }
  openNow(byPlayer = false, opts = {}) {
    if (this.target === 1) return;
    this.target = 1;
    this.speed = opts.speed || this.def.speed || 2.2;
    audio.play(opts.slam ? 'door_slam' : 'door_open', { pos: this.center, creakChance: byPlayer ? 0.55 : 1 });
    if (byPlayer && this.world.game) this.world.game.noise(this.center.x, this.center.z, 3);
    if (this.onOpen) this.onOpen(byPlayer);
  }
  close(byPlayer = false, opts = {}) {
    if (this.target === 0) return;
    this.target = 0;
    this.speed = opts.speed || this.def.speed || 2.2;
    this._closeSound = opts.slam ? 'door_slam' : 'door_close';
    if (byPlayer && this.world.game) this.world.game.noise(this.center.x, this.center.z, opts.slam ? 9 : 3);
  }
  set(openAmount) { this.open = this.target = openAmount; this.update(0); }
  update(dt) {
    if (this.open !== this.target) {
      const dir = Math.sign(this.target - this.open);
      this.open = clamp(this.open + dir * dt * this.speed, 0, 1);
      if (dir < 0 && this.open === 0 && this._closeSound) { audio.play(this._closeSound, { pos: this.center }); this._closeSound = null; }
    }
    const e = this.open * this.open * (3 - 2 * this.open);
    this.pivot.rotation.y = this.baseRot + this.swing * e * this.maxAngle;
    this.col.enabled = this.open < 0.25;
  }
}

// Gaveta que desliza
export class Drawer {
  constructor(world, parent, def) {
    this.id = def.id;
    this.world = world;
    this.open = def.startOpen ? 1 : 0;
    this.target = this.open;
    this.dir = def.dir || new THREE.Vector3(0, 0, 1);
    this.depth = def.depth || 0.35;
    this.group = new THREE.Group();
    this.group.position.copy(def.pos);
    this.base = def.pos.clone();
    this.group.rotation.y = def.ry || 0;
    this.group.userData.dynamic = true;
    parent.add(this.group);
    const w = def.w || 0.5, hh = def.h || 0.18, d = def.d || 0.4;
    box(this.group, w, hh, 0.02, def.mat || MATS.whiteFurn, 0, 0, d / 2);
    box(this.group, w - 0.04, 0.02, d, def.inner || MATS.oak, 0, -hh / 2 + 0.02, 0, { cast: false });
    box(this.group, 0.02, hh - 0.04, d, def.inner || MATS.oak, -w / 2 + 0.02, 0, 0, { cast: false });
    box(this.group, 0.02, hh - 0.04, d, def.inner || MATS.oak, w / 2 - 0.02, 0, 0, { cast: false });
    cyl(this.group, 0.018, 0.018, 0.02, MATS.chrome, 0, 0, d / 2 + 0.015, { rx: Math.PI / 2, seg: 10, cast: false });
    this.locked = !!def.locked;
    this.lockMsg = def.lockMsg || 'Emperrada.';
    this.onChange = def.onChange || null;
    this.interact = world.interact(this.group, {
      id: this.id, kind: 'drawer', name: def.name || 'gaveta',
      prompt: () => (this.target > 0.5 ? 'Fechar gaveta' : 'Abrir gaveta'),
      action: () => this.toggle(),
    });
    world.update((dt) => this.update(dt));
  }
  toggle() {
    if (this.locked) { audio.play('locked', { pos: this.group.position }); if (this.world.game) this.world.game.ui.toast(this.lockMsg); return; }
    this.target = this.target > 0.5 ? 0 : 1;
    audio.play('drawer', { pos: this.group.getWorldPosition(new THREE.Vector3()), close: this.target === 0 });
    if (this.onChange) this.onChange(this.target > 0.5);
  }
  set(v) { this.open = this.target = v ? 1 : 0; this.update(0); }
  get isOpen() { return this.target > 0.5; }
  update(dt) {
    if (this.open !== this.target) this.open = clamp(this.open + Math.sign(this.target - this.open) * dt * 3, 0, 1);
    const off = this.dir.clone().multiplyScalar(this.open * this.depth);
    this.group.position.copy(this.base).add(off);
  }
}

// Porta de armário/guarda-roupa (giro simples, sem colisor)
export class Leaf {
  constructor(world, parent, def) {
    this.id = def.id;
    this.world = world;
    this.pivot = new THREE.Group();
    this.pivot.position.copy(def.hinge);
    this.baseRot = def.rot || 0;
    this.swing = def.swing || 1;
    this.pivot.userData.dynamic = true;
    parent.add(this.pivot);
    this.open = 0; this.target = 0;
    this.locked = !!def.locked;
    this.lockMsg = def.lockMsg || 'Não abre.';
    this.onChange = def.onChange || null;
    const w = def.w || 0.5, hh = def.h || 1.9;
    this.panel = box(this.pivot, w, hh, 0.025, def.mat || MATS.whiteFurn, (w / 2) * (def.leftHinge ? 1 : -1), hh / 2, 0);
    box(this.pivot, 0.02, 0.3, 0.03, MATS.chrome, (w - 0.06) * (def.leftHinge ? 1 : -1), hh / 2 + (def.handleY || 0), 0.025, { cast: false });
    this.dirSign = def.leftHinge ? 1 : -1;
    if (def.interact !== false) {
      this.interact = world.interact(this.pivot, {
        id: this.id, kind: 'leaf', name: def.name || 'porta do armário',
        prompt: () => (this.target > 0.5 ? 'Fechar' : 'Abrir'),
        action: () => this.toggle(),
      });
    }
    world.update((dt) => this.update(dt));
  }
  toggle() {
    if (this.locked) { audio.play('locked', { pos: this.pivot.getWorldPosition(new THREE.Vector3()) }); if (this.world.game) this.world.game.ui.toast(this.lockMsg); return; }
    this.target = this.target > 0.5 ? 0 : 1;
    audio.play(this.target ? 'door_open' : 'door_close', { pos: this.pivot.getWorldPosition(new THREE.Vector3()), vol: 0.5, creakChance: 0.4, creakV: 0.5 });
    if (this.onChange) this.onChange(this.target > 0.5);
  }
  set(v) { this.open = this.target = v ? 1 : 0; this.update(0); }
  update(dt) {
    if (this.open !== this.target) this.open = clamp(this.open + Math.sign(this.target - this.open) * dt * 3, 0, 1);
    this.pivot.rotation.y = this.baseRot - this.dirSign * this.swing * this.open * 1.7;
  }
}
