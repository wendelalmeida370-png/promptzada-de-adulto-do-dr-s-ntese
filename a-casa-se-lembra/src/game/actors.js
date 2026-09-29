// Atores menores: gatos (Bento e Lili), palhaço Tique-Taque, ecos e o Esquecido.
import * as THREE from 'three';
import { buildCat, buildClown, buildFigure, buildEsquecido, cardTexture, echoMaterial } from './characters.js';
import { vis } from '../world/layers.js';
import { audio } from '../core/audio.js';
import { angleDiff, rand, clamp } from '../core/util.js';

// restaura materiais depois de um fade (senão o ator some numa segunda partida)
function resetOpacity(model) {
  model.traverse((o) => {
    if (!o.material || Array.isArray(o.material)) return;
    if (o.userData.baseOpacity === undefined) { o.userData.baseOpacity = o.material.opacity; o.userData.baseTransparent = o.material.transparent; o.userData.baseMat = o.material; }
    if (o.material !== o.userData.baseMat) o.material = o.userData.baseMat;
    o.material.opacity = o.userData.baseOpacity; o.material.transparent = o.userData.baseTransparent;
  });
}

// ------------------------------------------------------------------ gatos
export class Cat {
  constructor(game, kind) {
    this.game = game;
    this.kind = kind;
    this.model = buildCat(kind);
    vis(this.model, 'evmc');
    game.scene.add(this.model);
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.target = null;
    this.mode = 'idle'; // idle | goto | follow | stare | hide | eat
    this.t = 0;
    this.meowT = rand(8, 20);
    this.walkPhase = 0;
    this.stareAt = null;
    this.enabled = true;
    this.speed = 1.2;
    this.path = [];
    this.purr = null;
    this.onArrive = null;
  }
  place(x, z, yaw = 0) { this.pos.set(x, 0, z); this.yaw = yaw; this.model.position.copy(this.pos); this.model.rotation.y = yaw; }
  setVisible(v) { this.model.visible = v; this.enabled = v; }
  goTo(x, z, cb) {
    const w = this.game.world;
    const a = w.nearestNode(this.pos.x, this.pos.z), b = w.nearestNode(x, z);
    const p = a && b ? w.path(a.id, b.id) : null;
    this.path = p ? p.map((n) => ({ x: n.x, z: n.z })) : [];
    this.path.push({ x, z });
    this.mode = 'goto';
    this.onArrive = cb || null;
  }
  meow(v = 1) { audio.play('meow', { pos: [this.pos.x, 0.3, this.pos.z], v, pitch: this.kind === 'lili' ? 640 : 520 }); }
  hiss() { audio.play('hiss', { pos: [this.pos.x, 0.3, this.pos.z] }); }
  update(dt) {
    if (!this.enabled) return;
    const u = this.model.userData;
    this.t += dt;
    let moving = false;
    if (this.mode === 'goto' || this.mode === 'follow') {
      let tgt = null;
      if (this.mode === 'follow') {
        const p = this.game.player.pos;
        const d = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
        if (d > 1.4) {
          if (this.game.world.losBlocked(this.pos.x, this.pos.z, p.x, p.z)) {
            if (!this.path.length || this.t > 1.5) { this.t = 0; const a = this.game.world.nearestNode(this.pos.x, this.pos.z), b = this.game.world.nearestNode(p.x, p.z); const pp = a && b ? this.game.world.path(a.id, b.id) : null; this.path = pp ? pp.map((n) => ({ x: n.x, z: n.z })) : []; }
            tgt = this.path[0] || null;
          } else { tgt = { x: p.x, z: p.z }; this.path = []; }
        }
      } else tgt = this.path[0];
      if (tgt) {
        const dx = tgt.x - this.pos.x, dz = tgt.z - this.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.15) { this.path.shift(); if (this.mode === 'goto' && !this.path.length) { this.mode = 'idle'; if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(); } } }
        else {
          const sp = this.mode === 'follow' ? 1.9 : this.speed;
          this.pos.x += (dx / d) * sp * dt; this.pos.z += (dz / d) * sp * dt;
          this.yaw += angleDiff(this.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 8);
          moving = true;
        }
      }
    }
    if (this.mode === 'stare' && this.stareAt) {
      const dx = this.stareAt.x - this.pos.x, dz = this.stareAt.z - this.pos.z;
      this.yaw += angleDiff(this.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 5);
    }
    // animação
    this.walkPhase += dt * (moving ? 10 : 0);
    u.legs.forEach((l, i) => { l.rotation.x = moving ? Math.sin(this.walkPhase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.5 : 0; });
    const tailUp = this.mode === 'stare' ? 1 : 0.3;
    u.tail.forEach((s, i) => { s.rotation.x = -tailUp * 0.35 + Math.sin(this.t * 2 + i * 0.6) * 0.15; s.rotation.y = Math.sin(this.t * 1.3 + i) * 0.12; });
    u.head.rotation.y = this.mode === 'stare' ? 0 : Math.sin(this.t * 0.7) * 0.3;
    this.model.position.set(this.pos.x, this.mode === 'eat' ? -0.03 : 0, this.pos.z);
    this.model.rotation.y = this.yaw;
    this.meowT -= dt;
    if (this.meowT < 0 && this.mode !== 'hide') { this.meowT = rand(14, 35); if (Math.random() < 0.6) this.meow(0.6); }
  }
}

// ------------------------------------------------------------------ palhaço
export class Clown {
  constructor(game) {
    this.game = game;
    this.model = buildClown();
    this.model.visible = false;
    game.scene.add(this.model);
    this.track = false;
    this.cards = [];
    this.t = 0;
  }
  show(x, z, yaw = 0, spec = 'ec', track = true) {
    resetOpacity(this.model);
    vis(this.model, spec);
    this.model.position.set(x, this.game.world.heightAt(x, z), z);
    this.model.rotation.y = yaw;
    this.model.userData.head.rotation.set(0, 0, 0);
    this.model.visible = true;
    this.track = track;
  }
  hide() { this.model.visible = false; this.track = false; this.showCard(null); }
  honk(v = 1, far = false) {
    const p = this.model.visible ? this.model.position : this.game.player.pos;
    audio.play('honk', { pos: [p.x, 1.4, p.z], v, rev: far ? 0.9 : 0.4, pitch: far ? 280 : 300 });
  }
  honkAt(x, z, v = 1) { audio.play('honk', { pos: [x, 1.4, z], v, rev: 0.8 }); }
  showCard(text) {
    const c = this.model.userData.card;
    if (!text) { c.visible = false; return; }
    const tex = cardTexture(text);
    this.model.userData.cardMesh.material = new THREE.MeshBasicMaterial({ map: tex });
    this.model.userData.aR.rotation.x = -1.2;
    c.visible = true;
  }
  update(dt) {
    if (!this.model.visible) return;
    this.t += dt;
    const u = this.model.userData;
    if (this.track) {
      const p = this.game.player.eye;
      const mp = this.model.position;
      const ang = Math.atan2(p.x - mp.x, p.z - mp.z) - this.model.rotation.y;
      const target = clamp(angleDiff(0, ang), -2.6, 2.6);
      u.head.rotation.y += (target - u.head.rotation.y) * Math.min(1, dt * 1.2);
      u.head.rotation.z = Math.sin(this.t * 0.5) * 0.12 + 0.1;
    }
    if (!u.card.visible) u.aR.rotation.x = Math.sin(this.t * 0.8) * 0.05;
  }
}

// ------------------------------------------------------------------ ecos
export class Echoes {
  constructor(game) {
    this.game = game;
    this.list = new Map();
    this.time = 0;
  }
  add(id, opts) {
    this.remove(id);
    const f = opts.esquecido ? buildEsquecido() : buildFigure(opts);
    vis(f, opts.spec || 'sv');
    f.position.set(opts.x, opts.y || 0, opts.z);
    f.rotation.y = opts.yaw || 0;
    this.game.scene.add(f);
    const e = { id, f, opts, t: 0, anim: opts.anim || 'idle', route: opts.route || null, ri: 0, fade: 1 };
    this.list.set(id, e);
    return e;
  }
  get(id) { return this.list.get(id); }
  remove(id) {
    const e = this.list.get(id);
    if (!e) return;
    this.game.scene.remove(e.f);
    this.list.delete(id);
  }
  clear() { for (const id of [...this.list.keys()]) this.remove(id); }
  fadeOut(id, dur = 2) {
    const e = this.list.get(id);
    if (!e) return Promise.resolve();
    e.fadeDur = dur; e.fading = true;
    return new Promise((r) => { e.onFaded = r; });
  }
  update(dt) {
    this.time += dt;
    for (const e of this.list.values()) {
      e.t += dt;
      const u = e.f.userData;
      if (u.mat && u.mat.uniforms) u.mat.uniforms.time.value = this.time;
      if (e.fading) {
        e.fade -= dt / e.fadeDur;
        if (u.mat && u.mat.uniforms) u.mat.uniforms.alpha.value = Math.max(0, e.fade) * (e.opts.alpha || 0.7);
        else e.f.traverse((o) => { if (o.material && o.material.opacity !== undefined) { o.material.transparent = true; o.material.opacity = Math.max(0, e.fade); } });
        e.f.position.y += dt * 0.15;
        if (e.fade <= 0) { const cb = e.onFaded; this.remove(e.id); if (cb) cb(); continue; }
      }
      // animações
      if (e.anim === 'breathe') u.body.position.y = Math.sin(e.t * 1.5) * 0.01;
      if (e.anim === 'wave') { u.arms[1].rotation.z = -2.4 + Math.sin(e.t * 5) * 0.3; }
      if (e.anim === 'point' && e.opts.pointAt) {
        const pa = e.opts.pointAt;
        u.arms[1].rotation.x = -1.4;
        const ang = Math.atan2(pa.x - e.f.position.x, pa.z - e.f.position.z);
        e.f.rotation.y += angleDiff(e.f.rotation.y, ang) * Math.min(1, dt * 3);
      }
      if (e.anim === 'look') {
        const p = this.game.player.pos;
        const ang = Math.atan2(p.x - e.f.position.x, p.z - e.f.position.z);
        u.head.rotation.y += (clamp(angleDiff(e.f.rotation.y, ang), -1.3, 1.3) - u.head.rotation.y) * Math.min(1, dt * 2);
      }
      if (e.anim === 'type') { u.arms[0].rotation.x = -1.2 + Math.sin(e.t * 14) * 0.08; u.arms[1].rotation.x = -1.2 + Math.cos(e.t * 13) * 0.08; }
      if (e.route) this._route(e, dt);
      if (e.anim === 'walk' || e.walking) {
        const s = Math.sin(e.t * 6);
        u.legs[0].rotation.x = s * 0.4; u.legs[1].rotation.x = -s * 0.4;
      }
    }
  }
  // rota com paradas: [{x,z,wait,act}]
  _route(e, dt) {
    const r = e.route;
    const step = r[e.ri];
    if (!step) return;
    if (e.waitT > 0) { e.waitT -= dt; e.walking = false; if (e.waitT <= 0) { e.ri = (e.ri + 1) % r.length; } return; }
    const dx = step.x - e.f.position.x, dz = step.z - e.f.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.08) {
      e.waitT = step.wait || 1.5;
      if (step.yaw !== undefined) e.f.rotation.y = step.yaw;
      if (step.act && this.game.story.onEchoAct) this.game.story.onEchoAct(e.id, step.act);
      const u = e.f.userData;
      u.arms[1].rotation.x = step.act ? -1.3 : 0;
      return;
    }
    e.walking = true;
    const u = e.f.userData; u.arms[1].rotation.x = 0;
    const sp = 0.9;
    e.f.position.x += (dx / d) * Math.min(d, sp * dt);
    e.f.position.z += (dz / d) * Math.min(d, sp * dt);
    e.f.rotation.y += angleDiff(e.f.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 6);
  }
}

// ------------------------------------------------------------------ o pai Esquecido
export class Esquecido {
  constructor(game) {
    this.game = game;
    this.model = buildEsquecido();
    vis(this.model, 'ecv');
    this.model.visible = false;
    game.scene.add(this.model);
    this.pos = new THREE.Vector3();
    this.active = false;
    this.calm = false;
    this.t = 0;
    this.speakT = 3;
    this.pushed = null;
    resetOpacity(this.model);
  }
  spawn(x, z) {
    resetOpacity(this.model);
    this.pos.set(x, 0, z); this.model.position.copy(this.pos); this.model.visible = true; this.active = true; this.calm = false; }
  hide() { this.model.visible = false; this.active = false; }
  update(dt) {
    if (!this.active) return;
    this.t += dt;
    const g = this.game, P = g.player.pos;
    const u = this.model.userData;
    const dx = P.x - this.pos.x, dz = P.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    this.model.rotation.y += angleDiff(this.model.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 2);
    if (this.calm) { u.body.rotation.x = Math.min(0.5, u.body.rotation.x + dt * 0.4); return; }
    // anda devagar até ela, só dentro do quarto
    const room = g.world.roomAt(P.x, P.z);
    if (room === 'pais' && !g.player.hidden) {
      if (d > 0.9) {
        this.pos.x += (dx / d) * 0.55 * dt; this.pos.z += (dz / d) * 0.55 * dt;
        g.world.resolve(this.pos, 0.25);
        const s = Math.sin(this.t * 3); u.legs[0].rotation.x = s * 0.3; u.legs[1].rotation.x = -s * 0.3;
      } else if (!this.pushed) {
        this.pushed = true;
        if (g.story.onEsquecidoTouch) g.story.onEsquecidoTouch();
      }
    }
    u.arms[0].rotation.x = -0.6 + Math.sin(this.t * 1.1) * 0.1; u.arms[1].rotation.x = -0.6 + Math.cos(this.t) * 0.1;
    this.model.position.copy(this.pos);
    this.speakT -= dt;
    if (this.speakT < 0 && d < 7) { this.speakT = rand(6, 9); if (g.story.onEsquecidoSpeak) g.story.onEsquecidoSpeak(); }
  }
}
