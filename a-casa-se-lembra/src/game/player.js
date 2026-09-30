// Controle em primeira pessoa.
import * as THREE from 'three';
import { settings } from '../core/settings.js';
import { clamp, lerp, angleDiff, easeInOut } from '../core/util.js';
import { audio } from '../core/audio.js';

export const EYE = 1.42; // a protagonista tem 1,50 m
const CROUCH = 0.86;
const RADIUS = 0.22;

export class Player {
  constructor(game, camera) {
    this.game = game;
    this.cam = camera;
    this.pos = new THREE.Vector3(3.6, 0, 2.6);
    this.vel = new THREE.Vector2();
    this.yaw = Math.PI / 2;
    this.pitch = 0;
    this.eyeH = EYE;
    this.crouch = false;
    this.stamina = 1;
    this.running = false;
    this.moveLock = false;
    this.lookLock = false;
    this.hidden = null;
    this.bob = 0;
    this.stepDist = 0;
    this.trauma = 0;
    this.shakeT = 0;
    this.breath = 1;
    this.holdingBreath = false;
    this.lastNoise = 0;
    this.tween = null;
    this.speedMul = 1;
    this.seated = false;
  }

  get eye() { return new THREE.Vector3(this.pos.x, this.pos.y + this.eyeH, this.pos.z); }
  get forward() { return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)); }

  teleport(x, z, yaw, pitch = 0) {
    this.pos.set(x, this.game.world.heightAt(x, z), z);
    if (yaw !== undefined) this.yaw = yaw;
    this.pitch = pitch;
    this.vel.set(0, 0);
    this.apply();
  }

  // gira a câmera para olhar um ponto (cutscenes)
  lookAt(p, dur = 1) {
    const e = this.eye;
    const dx = p.x - e.x, dy = p.y - e.y, dz = p.z - e.z;
    const yaw = Math.atan2(-dx, -dz);
    const pitch = Math.atan2(dy, Math.hypot(dx, dz));
    return this.turnTo(yaw, pitch, dur);
  }
  turnTo(yaw, pitch, dur = 1) {
    return new Promise((res) => {
      this.tween = { y0: this.yaw, y1: this.yaw + angleDiff(this.yaw, yaw), p0: this.pitch, p1: pitch, t: 0, dur: Math.max(0.01, dur), res };
    });
  }

  shake(a) { this.trauma = Math.min(1.2, this.trauma + a * settings.shake); }

  hideIn(h) {
    if (this.hidden) return;
    this.hidden = h;
    this.preHide = { x: this.pos.x, z: this.pos.z, yaw: this.yaw };
    if (h.leaf) h.leaf.set(0.7);
    if (h.leaf2) h.leaf2.set(0.7);
    audio.play(h.kind === 'bed' ? 'drawer' : 'door_open', { pos: [h.cam.x, 1, h.cam.z], creakChance: 0.3, vol: 0.5 });
    this.game.ui.hideOverlay(h.kind);
    setTimeout(() => { if (h.leaf) h.leaf.set(0); if (h.leaf2) h.leaf2.set(0); }, 350);
    this.pos.set(h.cam.x, 0, h.cam.z);
    this.eyeH = h.cam.y;
    this.yaw = h.cam.yaw;
    this.pitch = h.cam.pitch || 0;
    this.game.noise(h.cam.x, h.cam.z, 2.5);
  }
  exitHide() {
    const h = this.hidden;
    if (!h) return;
    this.hidden = null;
    this.holdingBreath = false;
    if (h.leaf) { h.leaf.set(0.8); setTimeout(() => h.leaf.set(0), 500); }
    if (h.leaf2) { h.leaf2.set(0.8); setTimeout(() => h.leaf2.set(0), 500); }
    audio.play('door_open', { pos: [h.cam.x, 1, h.cam.z], creakChance: 0.5, vol: 0.5 });
    this.game.ui.hideOverlay(null);
    this.pos.set(h.exit.x, 0, h.exit.z);
    this.eyeH = EYE;
    this.crouch = false;
    this.game.world.resolve(this.pos, RADIUS);
  }

  update(dt) {
    const g = this.game, inp = g.input, world = g.world;
    // tween de olhar
    if (this.tween) {
      const tw = this.tween;
      tw.t += dt;
      const k = easeInOut(clamp(tw.t / tw.dur, 0, 1));
      this.yaw = lerp(tw.y0, tw.y1, k);
      this.pitch = lerp(tw.p0, tw.p1, k);
      if (tw.t >= tw.dur) { this.tween = null; tw.res(); }
    } else if (!this.lookLock && inp.locked) {
      const s = 0.0022 * settings.sensitivity * (g.phone.raised ? 0.7 : 1);
      this.yaw -= inp.mdx * s;
      this.pitch -= inp.mdy * s * (settings.invertY ? -1 : 1);
      // mouse sem travar: o cursor bate na borda da tela, então perto da borda a câmera continua virando
      if (inp.free) {
        const edge = (v) => Math.sign(v) * clamp((Math.abs(v) - 0.82) / 0.16, 0, 1);
        this.yaw -= edge(inp.cx) * 2.2 * settings.sensitivity * dt;
        this.pitch -= edge(inp.cy) * 1.1 * settings.sensitivity * dt * (settings.invertY ? -1 : 1);
      }
      const lim = this.hidden ? (this.hidden.kind === 'bed' ? 0.35 : 0.5) : 1.45;
      this.pitch = clamp(this.pitch, -lim, lim);
      if (this.hidden) {
        const d = angleDiff(this.hidden.cam.yaw, this.yaw);
        const ylim = this.hidden.kind === 'bed' ? 0.9 : 0.7;
        if (Math.abs(d) > ylim) this.yaw = this.hidden.cam.yaw + Math.sign(d) * ylim;
      }
    }

    // respiração presa (escondida)
    if (this.hidden) {
      const want = inp.key('Space');
      if (want && this.breath > 0) { this.holdingBreath = true; this.breath = Math.max(0, this.breath - dt / 7); }
      else {
        if (this.holdingBreath && this.breath <= 0) { audio.play('gasp', { vol: 0.9 }); g.noise(this.pos.x, this.pos.z, 3.5); }
        this.holdingBreath = false;
        this.breath = Math.min(1, this.breath + dt / 4);
      }
    } else { this.breath = Math.min(1, this.breath + dt / 3); this.holdingBreath = false; }

    let moving = false;
    if (!this.hidden && !this.moveLock && !this.tween) {
      let fx = 0, fz = 0;
      if (inp.key('KeyW') || inp.key('ArrowUp')) fz -= 1;
      if (inp.key('KeyS') || inp.key('ArrowDown')) fz += 1;
      if (inp.key('KeyA') || inp.key('ArrowLeft')) fx -= 1;
      if (inp.key('KeyD') || inp.key('ArrowRight')) fx += 1;
      if (inp.hit('KeyC')) this.crouch = !this.crouch;
      const crouching = this.crouch || inp.key('ControlLeft') || inp.key('ControlRight');
      if (crouching !== !!this.crouching) audio.play('cloth', { v: 0.8 });
      const wantRun = (inp.key('ShiftLeft') || inp.key('ShiftRight')) && !crouching && !g.phone.raised && (fx || fz);
      const wasRunning = this.running;
      if (wantRun && this.stamina > 0.02) { this.running = true; this.stamina = Math.max(0, this.stamina - dt / 5.5); }
      else { this.running = false; this.stamina = Math.min(1, this.stamina + dt / (fx || fz ? 7 : 4)); }
      if (this.running && !wasRunning) audio.play('cloth', { v: 0.6, dur: 0.2 });
      const speed = (this.running ? 3.5 : crouching ? 0.95 : g.phone.raised ? 1.25 : 1.9) * this.speedMul;
      const len = Math.hypot(fx, fz) || 1;
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      const wx = (fx * cos + fz * sin) / len, wz = (-fx * sin + fz * cos) / len;
      const tx = wx * speed, tz = wz * speed;
      const acc = 1 - Math.exp(-dt * 12);
      this.vel.x = lerp(this.vel.x, tx, acc);
      this.vel.y = lerp(this.vel.y, tz, acc);
      const ox = this.pos.x, oz = this.pos.z;
      this.pos.x += this.vel.x * dt;
      this.pos.z += this.vel.y * dt;
      world.resolve(this.pos, RADIUS);
      const moved = Math.hypot(this.pos.x - ox, this.pos.z - oz);
      moving = moved > 0.002;
      this.eyeH = lerp(this.eyeH, crouching ? CROUCH : EYE, 1 - Math.exp(-dt * 10));
      this.crouching = crouching;
      // passos
      if (moving) {
        this.stepDist += moved;
        const stride = this.running ? 0.85 : crouching ? 0.55 : 0.62;
        if (this.stepDist > stride) {
          this.stepDist = 0;
          const fl = world.floorAt(this.pos.x, this.pos.z);
          audio.play('step', { surface: fl ? fl.surface : 'wood', soft: crouching, vol: this.running ? 1 : crouching ? 0.4 : 0.7 });
          g.noise(this.pos.x, this.pos.z, this.running ? 9 : crouching ? 0.8 : 3);
        }
      }
      this.bob += moved * (this.running ? 2.3 : 2.9);
    } else {
      this.vel.set(0, 0);
    }
    // fôlego: depois de correr, dá pra ouvir a respiração (e ela vai acalmando)
    const tired = 1 - this.stamina;
    if (!this.hidden && tired > 0.35 && (this.running || this.stamina < 0.62)) {
      this.pantT = (this.pantT || 0) - dt;
      if (this.pantT <= 0) {
        this.pantIn = !this.pantIn;
        const v = clamp((tired - 0.3) * 1.3, 0.12, 0.75);
        audio.play('breath', { v, dur: this.pantIn ? 0.4 : 0.5, out: !this.pantIn });
        this.pantT = this.pantIn ? 0.44 : (this.running ? 0.32 : 0.35 + this.stamina * 0.7);
      }
    }
    const targetY = world.heightAt(this.pos.x, this.pos.z);
    this.pos.y = this.hidden ? 0 : lerp(this.pos.y, targetY, 1 - Math.exp(-dt * 14));
    this.moving = moving;
    this.trauma = Math.max(0, this.trauma - dt * 0.9);
    this.shakeT += dt;
    this.apply();
  }

  apply() {
    const c = this.cam;
    const bobAmt = settings.shake * (this.running ? 0.045 : 0.022);
    const by = this.moving ? Math.sin(this.bob * 2) * bobAmt : 0;
    const bx = this.moving ? Math.cos(this.bob) * bobAmt * 0.6 : 0;
    const t = this.trauma * this.trauma;
    const sx = t * 0.05 * Math.sin(this.shakeT * 37.1), sy = t * 0.05 * Math.sin(this.shakeT * 41.7 + 1), sr = t * 0.04 * Math.sin(this.shakeT * 29.3 + 2);
    // inclina um pouquinho ao andar de lado; parada, a respiração mexe a câmera quase nada
    const lateral = this.vel.x * Math.cos(this.yaw) - this.vel.y * Math.sin(this.yaw);
    this.roll = lerp(this.roll || 0, -lateral * 0.011 * settings.shake, 0.12);
    const idle = this.moving || this.hidden ? 0 : settings.shake;
    const ip = Math.sin(this.shakeT * 1.15) * 0.0035 * idle, iy = Math.sin(this.shakeT * 0.61) * 0.0022 * idle;
    c.position.set(this.pos.x + bx * Math.cos(this.yaw), this.pos.y + this.eyeH + by + sy, this.pos.z - bx * Math.sin(this.yaw));
    c.rotation.order = 'YXZ';
    c.rotation.set(this.pitch + sy * 0.5 + ip, this.yaw + sx + iy, sr + this.roll);
    // correndo, o campo de visão abre um pouco
    const fov = settings.fov + (this.running ? 4 : 0);
    if (Math.abs(c.fov - fov) > 0.05) { c.fov = lerp(c.fov, fov, 0.08); c.updateProjectionMatrix(); }
    c.updateMatrixWorld();
  }
}
