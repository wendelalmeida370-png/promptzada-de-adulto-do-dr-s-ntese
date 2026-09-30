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
// O roteiro manda no "modo" (idle | goto | follow | stare | hide | eat). Dentro do idle e do follow
// o gato tem uma rotina própria: senta, deita, se lambe, passeia, vem se esfregar na sua perna,
// foge de correria, ronrona quando ganha carinho. Os olhos brilham na luz da lanterna.
const CAT_POSES = {
  // t0/tn: inclinação do rabo (base / cada gomo; positivo = pra cima), curl: enrola pro lado
  stand: { hipY: 0.165, pitch: 0, fl: 0, hl: 0, neck: 0, loaf: 0, t0: -0.4, tn: 0.08, curl: 0 },
  happy: { hipY: 0.168, pitch: -0.02, fl: 0.02, hl: 0, neck: -0.08, loaf: 0, t0: 1.25, tn: 0.02, curl: 0 },
  sit: { hipY: 0.092, pitch: -0.66, fl: 0.66, hl: -0.74, neck: 0.52, loaf: 0, t0: 0.32, tn: 0.06, curl: 0.3 },
  loaf: { hipY: 0.1, pitch: 0.02, fl: 1.42, hl: -1.42, neck: 0.1, loaf: 1, t0: -0.5, tn: 0.07, curl: 0.3 },
  crouch: { hipY: 0.128, pitch: 0.16, fl: -0.14, hl: 0.3, neck: 0.62, loaf: 0, t0: -0.25, tn: 0.05, curl: 0.1 },
  low: { hipY: 0.12, pitch: 0.05, fl: -0.05, hl: 0.25, neck: 0.1, loaf: 0, t0: -0.55, tn: 0.03, curl: 0 },
};
const CAT_KEYS = Object.keys(CAT_POSES.stand);
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion();
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

export class Cat {
  constructor(game, kind) {
    this.game = game;
    this.kind = kind;
    this.model = buildCat(kind);
    vis(this.model, 'evmc');
    game.scene.add(this.model);
    this.u = this.model.userData;
    this.pos = new THREE.Vector3();
    this.home = new THREE.Vector3();
    this.yaw = 0;
    this.mode = 'idle';
    this.act = 'sit'; this.actT = rand(2, 5);
    this.cur = { ...CAT_POSES.sit };
    this.t = 0;
    this.walkPhase = 0;
    this.speedNow = 0;
    this.meowT = rand(12, 25);
    this.blinkT = rand(2, 5); this.blink = 0;
    this.earT = rand(1, 4); this.earTw = 0;
    this.stareAt = null;
    this.enabled = true;
    this.speed = 1.2;
    this.path = [];
    this.onArrive = null;
    this.target = null;
    this.stuckT = 0;
    this.purr = null; this.purrWant = 0;
    this.shine = 0;
    this.eatT = 0;
    this.rubA = 0;
    this.stillT = 0;
    this.lastApproach = -99;
    this._lastMode = 'idle';
  }
  place(x, z, yaw = 0) {
    this.pos.set(x, 0, z); this.yaw = yaw; this.home.set(x, 0, z);
    this.target = null; this.path = []; this.act = 'sit'; this.actT = rand(2, 5);
    this.model.position.copy(this.pos); this.model.rotation.y = yaw;
  }
  setVisible(v) { this.model.visible = v; this.enabled = v; if (!v) this._purr(0, true); }
  goTo(x, z, cb) {
    const w = this.game.world;
    const a = w.nearestNode(this.pos.x, this.pos.z), b = w.nearestNode(x, z);
    const p = a && b ? w.path(a.id, b.id) : null;
    this.path = p ? p.map((n) => ({ x: n.x, z: n.z })) : [];
    this.path.push({ x, z });
    this.mode = 'goto';
    this.onArrive = cb || null;
  }
  headWorld(out = new THREE.Vector3()) { this.u.head.getWorldPosition(out); return out; }
  meow(v = 1, o = {}) { audio.play('meow', { pos: this.headWorld(), v, pitch: (this.kind === 'lili' ? 640 : 520) * (o.p || 1), dur: o.dur }); }
  trill(v = 0.8) { audio.play('trill', { pos: this.headWorld(), v, pitch: this.kind === 'lili' ? 1.18 : 1 }); }
  hiss() { audio.play('hiss', { pos: [this.pos.x, 0.3, this.pos.z] }); this.act = 'wary'; this.actT = 3; }
  canPet() {
    const g = this.game;
    return this.enabled && this.model.visible && ['idle', 'follow', 'eat'].includes(this.mode) && this.act !== 'flee' && !(g.entity.hunt && g.entity.model.visible);
  }
  pet() {
    if (this.mode === 'eat') this.mode = 'idle';
    this.act = 'petted'; this.actT = 3.8; this.target = null;
    this.trill(0.9);
    this.blinkT = 0.6;
  }

  // ------------------------------------------------------------ movimento
  _free(x, z) {
    _v1.set(x, 0, z);
    this.game.world.resolve(_v1, 0.14);
    return Math.hypot(_v1.x - x, _v1.z - z) < 0.02;
  }
  _pickNear(cx, cz, rMin, rMax, sameRoom = true) {
    const w = this.game.world;
    const room = w.roomAt(this.home.x, this.home.z);
    for (let i = 0; i < 12; i++) {
      const a = rand(0, Math.PI * 2), r = rand(rMin, rMax);
      const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
      if (sameRoom && room && w.roomAt(x, z) !== room) continue;
      if (Math.hypot(x - this.pos.x, z - this.pos.z) < 0.5) continue;
      if (!this._free(x, z) || w.losBlocked(this.pos.x, this.pos.z, x, z)) continue;
      return { x, z };
    }
    return null;
  }
  _step(tx, tz, speed, dt) {
    const dx = tx - this.pos.x, dz = tz - this.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.05) { this.speedNow = 0; return d; }
    const st = Math.min(d, speed * dt);
    const ox = this.pos.x, oz = this.pos.z;
    this.pos.x += (dx / d) * st; this.pos.z += (dz / d) * st;
    this.game.world.resolve(this.pos, 0.13);
    const moved = Math.hypot(this.pos.x - ox, this.pos.z - oz);
    this.stuckT = moved < st * 0.35 ? this.stuckT + dt : 0;
    this.yaw += angleDiff(this.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 7);
    this.walkPhase += moved * (speed > 1.3 ? 15 : 21);
    this.speedNow = moved / Math.max(dt, 1e-4);
    return d;
  }
  _faceTo(x, z, dt, rate = 3) { this.yaw += angleDiff(this.yaw, Math.atan2(x - this.pos.x, z - this.pos.z)) * Math.min(1, dt * rate); }

  // ------------------------------------------------------------ rotina
  _nextAct(dP) {
    const g = this.game, P = g.player.pos, w = g.world;
    const canApproach = dP < 3.6 && dP > 0.8 && !g.cutscene && !g.player.hidden && Math.abs(P.x - this.pos.x) < 40 && !w.losBlocked(this.pos.x, this.pos.z, P.x, P.z) && this.t - this.lastApproach > 22;
    if (canApproach && Math.random() < 0.5) { this.act = 'approach'; this.actT = 8; this.lastApproach = this.t; if (Math.random() < 0.7) this.trill(0.6); return; }
    const r = Math.random();
    if (r < 0.36) { const p = this._pickNear(this.home.x, this.home.z, 0.6, 2.4); if (p) { this.target = p; this.act = 'wander'; this.actT = 10; return; } }
    if (r < 0.62) { this.act = 'sit'; this.actT = rand(4, 9); return; }
    if (r < 0.8) { this.act = 'groom'; this.actT = rand(3, 6); return; }
    this.act = 'loaf'; this.actT = rand(10, 24);
  }
  _life(dt, dP, scary) {
    const g = this.game, P = g.player.pos, pl = g.player;
    const near = Math.abs(P.x - this.pos.x) < 40;
    let pose = 'sit', look = near && dP < 4.5, purr = 0;
    this.actT -= dt;
    // correria perto: sai de perto (e fica desconfiado)
    if (near && pl.running && pl.moving && dP < 2.1 && this.act !== 'flee' && this.act !== 'petted') {
      const ax = this.pos.x - P.x, az = this.pos.z - P.z, al = Math.hypot(ax, az) || 1;
      this.target = this._pickNear(this.pos.x + (ax / al) * 1.6, this.pos.z + (az / al) * 1.6, 0, 0.6, false) || null;
      this.act = 'flee'; this.actT = 2.4;
    }
    if (scary && this.act !== 'flee') { this.act = 'alert'; this.actT = 1; }
    switch (this.act) {
      case 'wander': {
        pose = 'stand'; look = false;
        if (!this.target || this._step(this.target.x, this.target.z, 0.55, dt) < 0.08 || this.stuckT > 0.8) { this.target = null; this.act = 'sit'; this.actT = rand(2, 5); }
        break;
      }
      case 'approach': {
        pose = 'happy'; look = true;
        const ax = this.pos.x - P.x, az = this.pos.z - P.z, al = Math.hypot(ax, az) || 1;
        const tx = P.x + (ax / al) * 0.42, tz = P.z + (az / al) * 0.42;
        const d = this._step(tx, tz, 0.95, dt);
        if (d < 0.1 || dP < 0.55) { this.act = 'rub'; this.actT = rand(4, 6.5); this.rubA = Math.atan2(ax, az); }
        else if (dP > 5 || this.stuckT > 1 || this.actT <= 0) { this.act = 'sit'; this.actT = rand(3, 6); }
        break;
      }
      case 'rub': {
        pose = 'happy'; purr = 0.7; look = false;
        if (dP > 1.2) { this.act = this.actT > 1.5 ? 'approach' : 'sit'; break; }
        this.rubA += dt * 0.85;
        const tx = P.x + Math.sin(this.rubA) * 0.38, tz = P.z + Math.cos(this.rubA) * 0.38;
        this._step(tx, tz, 0.42, dt);
        if (this.meowT > 4) this.meowT = rand(1.5, 4);
        if (this.actT <= 0) { this.act = 'sit'; this.actT = rand(5, 9); }
        break;
      }
      case 'petted': {
        pose = 'sit'; purr = 1; look = true;
        this._faceTo(P.x, P.z, dt, 2.5);
        if (this.actT <= 0) { this.act = 'sit'; this.actT = rand(4, 8); }
        break;
      }
      case 'flee': {
        pose = 'low'; look = false;
        if (!this.target || this._step(this.target.x, this.target.z, 2.1, dt) < 0.1 || this.stuckT > 0.5 || this.actT <= 0) { this.target = null; this.act = 'wary'; this.actT = rand(3, 5); }
        break;
      }
      case 'wary': case 'alert': {
        pose = this.act === 'alert' ? 'low' : 'sit'; look = near && dP < 6;
        if (this.actT <= 0 && !scary) { this.act = 'sit'; this.actT = rand(2, 4); }
        break;
      }
      case 'groom': pose = 'sit'; look = false; if (this.actT <= 0) this._nextAct(dP); break;
      case 'loaf': pose = 'loaf'; look = dP < 2.5; purr = dP < 1.4 ? 0.35 : 0; if (this.actT <= 0) this._nextAct(dP); break;
      default: {
        pose = 'sit';
        // sentado há muito tempo com você do lado: vira de frente pra você
        if (look && dP < 2.5) this._faceTo(P.x, P.z, dt, 0.8);
        if (this.actT <= 0) this._nextAct(dP);
      }
    }
    return { pose, look, purr };
  }

  // ------------------------------------------------------------ atualização
  update(dt) {
    if (!this.enabled) return;
    const g = this.game, u = this.u, P = g.player.pos;
    this.t += dt;
    this.speedNow = 0;
    if (this._lastMode !== this.mode) { if (this.mode === 'idle') { this.home.copy(this.pos); this.act = 'sit'; this.actT = rand(1, 3); } if (this.mode === 'eat') this.eatT = 0; this._lastMode = this.mode; }
    const dP = Math.hypot(P.x - this.pos.x, P.z - this.pos.z);
    const scary = !!(g.entity.hunt && g.entity.model.visible);
    let pose = 'stand', look = false, purr = 0, lookAt = null, earsBack = 0;
    if (this.mode === 'goto') {
      const tgt = this.path[0];
      if (tgt) {
        if (this._step(tgt.x, tgt.z, this.speed, dt) < 0.15) {
          this.path.shift();
          if (!this.path.length) { this.mode = 'idle'; this.home.copy(this.pos); if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(); } }
        }
      } else this.mode = 'idle';
      pose = 'stand';
    } else if (this.mode === 'follow') {
      const w = g.world;
      if (dP > 1.3 && Math.abs(P.x - this.pos.x) < 40) {
        let tgt = null;
        if (w.losBlocked(this.pos.x, this.pos.z, P.x, P.z)) {
          if (!this.path.length || (this._pathT = (this._pathT || 0) + dt) > 1.5) { this._pathT = 0; const a = w.nearestNode(this.pos.x, this.pos.z), b = w.nearestNode(P.x, P.z); const pp = a && b ? w.path(a.id, b.id) : null; this.path = pp ? pp.map((n) => ({ x: n.x, z: n.z })) : []; }
          tgt = this.path[0] || null;
          if (tgt && Math.hypot(tgt.x - this.pos.x, tgt.z - this.pos.z) < 0.2) this.path.shift();
        } else { tgt = { x: P.x, z: P.z }; this.path = []; }
        if (tgt) this._step(tgt.x, tgt.z, dP > 3.5 ? 2.1 : 1.25, dt);
        pose = 'stand'; this.stillT = 0;
        if (this.act === 'rub' || this.act === 'petted') this.act = 'sit';
      } else {
        // perto de você: senta, olha, e às vezes vem se esfregar
        this.stillT = g.player.moving ? 0 : this.stillT + dt;
        if (this.act === 'petted') { pose = 'sit'; purr = 1; look = true; this._faceTo(P.x, P.z, dt, 2.5); this.actT -= dt; if (this.actT <= 0) this.act = 'sit'; }
        else if (this.act === 'rub') {
          pose = 'happy'; purr = 0.6; this.rubA += dt * 0.85;
          this._step(P.x + Math.sin(this.rubA) * 0.38, P.z + Math.cos(this.rubA) * 0.38, 0.42, dt);
          this.actT -= dt; if (this.actT <= 0) { this.act = 'sit'; this.stillT = -8; }
        } else {
          pose = 'sit'; look = true; this._faceTo(P.x, P.z, dt, 1.2);
          if (this.stillT > 4 && !scary && !g.cutscene) { this.act = 'rub'; this.actT = rand(4, 6); this.rubA = Math.atan2(this.pos.x - P.x, this.pos.z - P.z); if (Math.random() < 0.6) this.trill(0.6); }
        }
      }
    } else if (this.mode === 'stare') {
      pose = 'low'; earsBack = 1;
      if (this.stareAt) { this._faceTo(this.stareAt.x, this.stareAt.z, dt, 5); lookAt = this.stareAt; }
    } else if (this.mode === 'hide') {
      pose = 'loaf'; earsBack = 0.7; look = dP < 3;
    } else if (this.mode === 'eat') {
      pose = 'crouch';
      this.eatT += dt;
      if (this.eatT > 38) { this.mode = 'idle'; this._lastMode = 'idle'; this.home.copy(this.pos); this.act = 'groom'; this.actT = rand(4, 7); }
    } else {
      ({ pose, look, purr } = this._life(dt, dP, scary));
      if (this.act === 'alert' || this.act === 'wary' || this.act === 'flee') earsBack = this.act === 'wary' ? 0.4 : 0.9;
      if (this.act === 'alert' && g.entity.model.visible) lookAt = g.entity.pos;
    }
    this._animate(dt, pose, look ? P : lookAt, earsBack);
    this._purr(purr * (dP < 3.5 ? 1 : 0));
    this._eyeShine(dt);
    // miados
    this.meowT -= dt;
    if (this.meowT < 0) {
      this.meowT = rand(18, 42);
      const quiet = this.mode === 'hide' || this.mode === 'stare' || scary || this.act === 'loaf' || this.act === 'alert';
      if (!quiet && dP < 12 && Math.random() < 0.55) {
        if (this.act === 'rub' || this.act === 'approach' || this.act === 'petted') { if (Math.random() < 0.5) this.trill(0.7); else this.meow(0.6, { p: rand(1.05, 1.25), dur: rand(0.3, 0.5) }); }
        else this.meow(0.5, { p: rand(0.9, 1.12) });
      }
    }
  }

  _animate(dt, poseName, lookAt, earsBack) {
    const u = this.u, c = this.cur, tgt = CAT_POSES[poseName] || CAT_POSES.stand;
    const k = 1 - Math.exp(-dt * 5);
    for (const key of CAT_KEYS) c[key] += (tgt[key] - c[key]) * k;
    const t = this.t;
    const walking = this.speedNow > 0.05;
    const fast = this.speedNow > 1.3;
    const breath = Math.sin(t * (this.act === 'loaf' ? 1.6 : 2.6));
    // corpo
    u.hips.position.y = c.hipY + (walking ? Math.abs(Math.sin(this.walkPhase)) * (fast ? 0.012 : 0.006) : 0);
    u.hips.rotation.x = c.pitch;
    u.body.scale.set(1 + breath * 0.012, 1 + breath * 0.02, 1);
    // patas (pares diagonais)
    const sw = walking ? Math.sin(this.walkPhase) * (fast ? 0.75 : 0.48) : 0;
    const shrink = 1 - c.loaf * 0.3;
    const L = u.legs;
    L.fl.rotation.x = c.fl + sw; L.hr.rotation.x = c.hl + sw * 0.9;
    L.fr.rotation.x = c.fl - sw; L.hl.rotation.x = c.hl - sw * 0.9;
    for (const l of [L.fl, L.fr, L.hl, L.hr]) l.scale.y = shrink;
    // lambendo a pata
    const grooming = this.act === 'groom' && this.mode === 'idle';
    if (grooming) { L.fr.rotation.x = c.fl - 1.25 + Math.sin(t * 6) * 0.12; }
    // cabeça e pescoço
    let hy = Math.sin(t * 0.45) * 0.25, hx = 0, hz = Math.sin(t * 0.3) * 0.05;
    if (lookAt) {
      const hp = this.headWorld(_v2);
      const ang = Math.atan2(lookAt.x - this.pos.x, lookAt.z - this.pos.z) - this.yaw;
      hy = clamp(angleDiff(0, ang), -1.25, 1.25);
      const dist = Math.hypot(lookAt.x - hp.x, lookAt.z - hp.z);
      const ly = (lookAt.y !== undefined ? lookAt.y : 0) + (lookAt === this.game.player.pos ? this.game.player.eyeH : 1.4);
      hx = -clamp(Math.atan2(ly - hp.y, Math.max(0.3, dist)), -0.2, 0.75);
    }
    if (grooming) { hy = 0.35; hx = 0.55 + Math.sin(t * 6) * 0.1; hz = 0.3; }
    if (this.mode === 'eat') { hy = 0; hx = 0.35 + Math.abs(Math.sin(t * 5)) * 0.12; }
    if (this.act === 'petted') { hx = -0.25 + Math.sin(t * 2.2) * 0.08; hz = Math.sin(t * 1.7) * 0.18; }
    if (this.act === 'loaf' && !lookAt) { hx = 0.15; }
    const hk = 1 - Math.exp(-dt * 6);
    u.neck.rotation.x += (c.neck - u.neck.rotation.x) * hk;
    u.head.rotation.y += (hy - u.head.rotation.y) * hk;
    u.head.rotation.x += (hx - u.head.rotation.x) * hk;
    u.head.rotation.z += (hz - u.head.rotation.z) * hk;
    // orelhas
    this.earT -= dt;
    if (this.earT < 0) { this.earT = rand(1.5, 5); this.earTw = 1; }
    this.earTw = Math.max(0, this.earTw - dt * 5);
    u.ears.forEach((e, i) => {
      const s = i === 0 ? -1 : 1;
      e.rotation.z = -s * (0.3 + earsBack * 0.55) + (i === 0 ? this.earTw * 0.35 : 0);
      e.rotation.x = -earsBack * 0.5;
    });
    // piscar (e olhos fechados quando dorme de pãozinho longe de você)
    this.blinkT -= dt;
    if (this.blinkT < 0) { this.blinkT = this.act === 'petted' ? rand(0.8, 1.6) : rand(2.5, 6); this.blink = 1; }
    this.blink = Math.max(0, this.blink - dt * (this.act === 'petted' ? 2.2 : 7));
    const sleepy = this.act === 'loaf' && !lookAt ? 0.85 : this.act === 'petted' ? 0.35 : 0;
    const open = clamp(1 - Math.max(this.blink, sleepy), 0.08, 1);
    u.eyes.forEach((e) => { e.scale.y = open; });
    this.eyesOpen = open;
    // rabo
    const happy = poseName === 'happy';
    const swish = (this.mode === 'stare' || this.act === 'alert') ? 0.28 : happy ? 0.1 : walking ? 0.12 : 0.2;
    const speedT = (this.mode === 'stare' || this.act === 'alert') ? 5 : 1.4;
    u.tail.forEach((sg, i) => {
      sg.rotation.x = i === 0 ? c.t0 : c.tn + (happy && i > 5 ? 0.3 : 0); // na felicidade, a pontinha faz gancho
      sg.rotation.y = c.curl + Math.sin(t * speedT + i * 0.55) * swish * (0.3 + i * 0.1);
    });
    // posição
    this.model.position.set(this.pos.x, this.game.world.heightAt(this.pos.x, this.pos.z), this.pos.z);
    this.model.rotation.y = this.yaw;
  }

  // brilho dos olhos: só quando a lanterna bate de frente
  _eyeShine(dt) {
    const g = this.game, ph = g.phone;
    let want = 0;
    if (ph.flashlight && ph.battery > 0 && this.model.visible) {
      const cam = g.camera;
      const hp = this.headWorld(_v1);
      _v2.copy(hp).sub(cam.position);
      const d = _v2.length();
      if (d > 0.2 && d < 9) {
        _v2.divideScalar(d);
        const fwd = _v1.set(0, 0, -1).applyQuaternion(cam.quaternion);
        const inBeam = smooth(0.87, 0.97, fwd.dot(_v2));
        this.u.head.getWorldQuaternion(_q);
        const hf = _v1.set(0, 0, 1).applyQuaternion(_q);
        const facing = smooth(0.2, 0.75, -hf.dot(_v2));
        want = inBeam * facing * clamp(1.25 - d / 7, 0, 1) * (this.eyesOpen || 1);
      }
    }
    this.shine += (want - this.shine) * Math.min(1, dt * 14);
    for (const s of this.u.shines) s.material.opacity = this.shine * 0.95;
  }

  _purr(v, now = false) {
    if (v > 0.05 && this.enabled) {
      if (!this.purr) this.purr = audio.loop('purr', { pos: this.headWorld(), vol: 0, ref: 0.5, rolloff: 2.4 });
      if (this.purr) { this.purr.setVol(v * 0.85, 0.5); this.purr.setPos(this.headWorld(_v1)); }
    } else if (this.purr) { this.purr.stop(now ? 0.1 : 1.0); this.purr = null; }
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
    c.rotation.x = 1.2; // o braço levanta, o cartão fica em pé, de frente (senão aparece deitado, de quina)
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
