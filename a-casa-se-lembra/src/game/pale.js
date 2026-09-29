// O Morador de Antes (o Pálido). Regras legíveis, como numa brincadeira de criança:
//  1) sem os olhos, ele é cego: anda tateando, com as mãos para a frente (cabra-cega);
//  2) de vez em quando para e levanta as mãos: os olhos das palmas abrem e ele procura;
//  3) com os olhos abertos ele SÓ enxerga o que se mexe (batatinha frita, 1, 2, 3);
//  4) ele sente o chão tremer: correr perto dele (ou andar colada nele) chama atenção;
//  5) um lençol vira esconderijo: ele apalpa, e quem prende a respiração vira móvel;
//  6) a valsa da vitrola faz ele voltar para o lugar dele.
import * as THREE from 'three';
import { buildPale } from './characters.js';
import { vis } from '../world/layers.js';
import { audio } from '../core/audio.js';
import { settings } from '../core/settings.js';
import { clamp, angleDiff, rand, lerp } from '../core/util.js';

export const POSES = {
  sit: { hipY: 0.47, spine: 0.34, chest: 0.26, neck: 0.62, head: 0.12, jaw: 0.02, shX: -0.62, shZ: 0.1, el: -0.95, wrX: 0.25, thX: -1.5, kn: 1.5, an: 0.05, curl: 0.35, spread: 0 },
  wake: { hipY: 0.47, spine: 0.12, chest: 0.1, neck: 0.1, head: -0.12, jaw: 0.1, shX: -0.62, shZ: 0.1, el: -0.95, wrX: 0.25, thX: -1.5, kn: 1.5, an: 0.05, curl: 0.35, spread: 0 },
  reach: { hipY: 0.47, spine: 0.3, chest: 0.2, neck: 0.25, head: 0.05, jaw: 0.1, shX: -1.05, shZ: 0.05, el: -0.4, wrX: 0.55, thX: -1.5, kn: 1.5, an: 0.05, curl: 0.6, spread: 0 },
  press: { hipY: 0.47, spine: 0.18, chest: 0.12, neck: 0.18, head: 0.0, jaw: 0.2, shX: -0.95, shZ: -0.28, el: -1.25, wrX: 0.1, thX: -1.5, kn: 1.5, an: 0.05, curl: 0.15, spread: 0.1 },
  seatlook: { hipY: 0.47, spine: 0.1, chest: 0.05, neck: 0.02, head: -0.15, jaw: 0.14, shX: -1.4, shZ: 0.34, el: -1.5, wrX: -0.12, thX: -1.5, kn: 1.5, an: 0.05, curl: 0.05, spread: 0.32 },
  stand: { hipY: 0.92, spine: 0.22, chest: 0.18, neck: 0.32, head: 0.0, jaw: 0.04, shX: -0.28, shZ: 0.14, el: -0.35, wrX: 0.15, thX: -0.05, kn: 0.22, an: -0.12, curl: 0.4, spread: 0 },
  grope: { hipY: 0.88, spine: 0.42, chest: 0.2, neck: 0.12, head: -0.25, jaw: 0.08, shX: -1.28, shZ: 0.16, el: -0.22, wrX: 0.42, thX: -0.1, kn: 0.38, an: -0.2, curl: 0.35, spread: 0.1 },
  look: { hipY: 0.86, spine: 0.14, chest: 0.08, neck: 0.02, head: -0.18, jaw: 0.12, shX: -1.42, shZ: 0.36, el: -1.55, wrX: -0.12, thX: -0.12, kn: 0.42, an: -0.24, curl: 0.05, spread: 0.32 },
  lunge: { hipY: 0.84, spine: 0.55, chest: 0.12, neck: -0.12, head: -0.3, jaw: 0.55, shX: -1.38, shZ: 0.24, el: -0.08, wrX: -1.35, thX: -0.2, kn: 0.5, an: -0.25, curl: 0.0, spread: 0.35 },
  feel: { hipY: 0.8, spine: 0.62, chest: 0.3, neck: 0.3, head: -0.1, jaw: 0.1, shX: -1.0, shZ: 0.12, el: -0.5, wrX: 0.6, thX: -0.3, kn: 0.6, an: -0.2, curl: 0.2, spread: 0.15 },
  grab: { hipY: 0.84, spine: 0.45, chest: 0.2, neck: 0.1, head: -0.2, jaw: 0.45, shX: -1.2, shZ: -0.32, el: -0.85, wrX: 0.3, thX: -0.2, kn: 0.5, an: -0.25, curl: 0.75, spread: 0.1 },
};
const KEYS = Object.keys(POSES.stand);
const CATCH = 0.78;

export class Pale {
  constructor(game) {
    this.game = game;
    this.model = buildPale();
    this.model.visible = false;
    vis(this.model, 'ecv');
    game.scene.add(this.model);
    this.u = this.model.userData;
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.state = 'off';
    this.poseName = 'sit';
    this.cur = { ...POSES.sit };
    this.poseRate = 3;
    this.t = 0;
    this.eyes = 0; // 0 fechados .. 1 abertos
    this.eyesTarget = 0;
    this.hasEyes = false;
    this.path = [];
    this.walkPhase = 0;
    this.stepAcc = 0;
    this.sweep = 0;
    this.look = null;
    this.target = null;
    this.hist = [];
    this.breath = null;
    this.ignoreHide = new Map();
    this.onCatch = null;
    this.onEvent = null; // (tipo) => void — avisos para a história (tutorial, etc.)
    this.extraYaw = 0;
    this.tremble = 0;
  }

  // ------------------------------------------------------------ controle
  place(x, z, yaw = this.yaw) {
    this.pos.set(x, this.game.world.heightAt(x, z), z);
    this.yaw = yaw;
    this.model.position.copy(this.pos);
    this.model.rotation.y = yaw;
  }
  show(x, z, yaw, pose = 'sit', spec = 'ecv') {
    vis(this.model, spec);
    this.place(x, z, yaw);
    this.setPose(pose, true);
    this.model.visible = true;
    if (this.state === 'off') this.state = 'static';
  }
  hide() {
    this.model.visible = false;
    this.state = 'off';
    this.path = [];
    this.stopBreath();
  }
  setPose(name, snap = false, rate = 3) {
    this.poseName = name;
    this.poseRate = rate;
    if (snap) this.cur = { ...POSES[name] };
  }
  setEyes(hasEyes, open = 0) {
    this.hasEyes = hasEyes;
    this.eyesTarget = open;
    if (open === 0 || !hasEyes) this.eyes = Math.min(this.eyes, open);
    for (const h of this.u.hands) h.eye.ball.visible = hasEyes;
  }
  startBreath(vol = 0.7) {
    if (this.breath) { this.breath.setVol(vol); return; }
    this.breath = audio.loop('pale_breath', { pos: this.headPos(), vol, ref: 0.9, rolloff: 1.5 });
  }
  stopBreath() { if (this.breath) { this.breath.stop(0.6); this.breath = null; } }
  headPos() { return new THREE.Vector3(this.pos.x, this.pos.y + (this.state === 'sleep' || this.poseName === 'sit' ? 1.5 : 2.05), this.pos.z); }

  // começa a caçar pelo apartamento de antes
  wake(opts = {}) {
    this.state = 'grope';
    this.setPose('grope', false, 2);
    this.nextLook = opts.firstLook !== undefined ? opts.firstLook : rand(4, 7);
    this.path = [];
    this.target = null;
    this.startBreath(0.8);
    this.eyesTarget = 0;
  }
  // a música voltou: volta para a cadeira
  goHome(onSeated) {
    this.state = 'return';
    this.look = null;
    this.eyesTarget = 0;
    this.setPose('stand', false, 2);
    this.onSeated = onSeated || null;
    this.goTo('a_chair');
  }

  // ------------------------------------------------------------ navegação
  goTo(nodeId) {
    const w = this.game.world;
    const start = this.nearestAntesNode(this.pos.x, this.pos.z);
    if (!start || !w.navNodes.has(nodeId)) { this.path = []; return false; }
    const p = w.path(start.id, nodeId);
    this.path = p ? p.slice() : [];
    return !!p;
  }
  nearestAntesNode(x, z) {
    let best = null, bd = Infinity;
    for (const n of this.game.world.navNodes.values()) {
      if (!n.id.startsWith('a_')) continue;
      const d = Math.hypot(n.x - x, n.z - z);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  pickWander() {
    const w = this.game.world;
    const nodes = [...w.navNodes.values()].filter((n) => n.id.startsWith('a_') && n.id !== 'a_chair');
    const p = this.game.player.pos;
    // prefere lugares longe de onde acabou de passar; às vezes vai onde "sentiu" alguém
    let best = null, bs = -Infinity;
    for (const n of nodes) {
      const d = Math.hypot(n.x - this.pos.x, n.z - this.pos.z);
      if (d < 1.2) continue;
      const toPlayer = Math.hypot(n.x - p.x, n.z - p.z);
      const s = rand(0, 3) + Math.min(d, 4) * 0.3 - (this.lastNode === n.id ? 5 : 0) - toPlayer * 0.12;
      if (s > bs) { bs = s; best = n; }
    }
    if (best) { this.lastNode = best.id; this.goTo(best.id); }
  }

  // ------------------------------------------------------------ percepção
  playerMoved() {
    const h = this.hist;
    if (h.length < 3) return false;
    const a = h[h.length - 1], b = h[0];
    return Math.hypot(a.x - b.x, a.z - b.z) > 0.03 || a.crouch !== b.crouch;
  }
  facing() { return this.yaw + this.sweep; }
  inCone(px, pz, half, range) {
    const dx = px - this.pos.x, dz = pz - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d > range) return false;
    if (d < 0.9) return true;
    const ang = Math.atan2(-dx, -dz);
    return Math.abs(angleDiff(this.facing(), ang)) < half;
  }
  // linha de visão própria: móveis baixos ("cover") só escondem quem está agachada
  losClear(px, pz) {
    const ax = this.pos.x, az = this.pos.z;
    const crouch = this.game.player.crouching;
    const dx = px - ax, dz = pz - az;
    for (const c of this.game.world.colliders) {
      if (!c.enabled || c.maxX < 150) continue;
      if (!(c.los || (c.tag === 'cover' && crouch))) continue;
      let tmin = 0, tmax = 1;
      if (Math.abs(dx) < 1e-9) { if (ax < c.minX || ax > c.maxX) continue; } else {
        let t1 = (c.minX - ax) / dx, t2 = (c.maxX - ax) / dx; if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) continue;
      }
      if (Math.abs(dz) < 1e-9) { if (az < c.minZ || az > c.maxZ) continue; } else {
        let t1 = (c.minZ - az) / dz, t2 = (c.maxZ - az) / dz; if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) continue;
      }
      return false;
    }
    return true;
  }
  canSee(p) {
    if (this.eyes < 0.6 || !this.hasEyes) return false;
    const pl = this.game.player;
    if (pl.hidden) return false;
    if (!this.inCone(p.x, p.z, 0.55, 8.5)) return false;
    if (!this.losClear(p.x, p.z)) return false;
    return this.playerMoved() || this.flashSeen;
  }
  proximity() {
    if (!this.model.visible || this.state === 'off' || this.state === 'sleep' || this.state === 'static') return 0;
    const p = this.game.player.pos;
    return clamp(1 - Math.hypot(p.x - this.pos.x, p.z - this.pos.z) / 9, 0, 1) * (this.state === 'lunge' ? 1 : 0.8);
  }
  // uma foto com flash dentro do olhar dele conta como movimento
  onFlash() { this.flashSeen = true; setTimeout(() => { this.flashSeen = false; }, 250); }

  // ------------------------------------------------------------ atualização
  update(dt) {
    if (!this.model.visible) return;
    this.t += dt;
    const g = this.game, pl = g.player;
    this.hist.push({ x: pl.pos.x, z: pl.pos.z, crouch: !!pl.crouching });
    while (this.hist.length > 4) this.hist.shift();
    this.think(dt);
    this.animate(dt);
    if (this.breath) this.breath.setPos(this.headPos());
  }

  think(dt) {
    const g = this.game, pl = g.player, P = pl.pos, w = g.world;
    const st = this.state;
    if (st === 'off' || st === 'static' || st === 'sleep' || st === 'script' || st === 'seated') return;
    const dist = Math.hypot(P.x - this.pos.x, P.z - this.pos.z);
    const inside = P.x > 150;
    let speed = 0, tx = null, tz = null;

    // tremor do chão
    if (inside && (st === 'grope' || st === 'search') && !pl.hidden && pl.moving) {
      const felt = (pl.running && dist < 9) || (!pl.crouching && dist < 2.4);
      if (felt && !this.look) { this.alertAt = { x: P.x, z: P.z }; this.startLook(true); if (this.onEvent) this.onEvent('felt'); }
      else if (felt && this.look) this.yaw += angleDiff(this.yaw, Math.atan2(-(P.x - this.pos.x), -(P.z - this.pos.z))) * Math.min(1, dt * 3);
    }

    if (st === 'grope') {
      speed = 0.5;
      if (this.look) speed = 0;
      else {
        this.nextLook -= dt;
        if (this.nextLook <= 0) this.startLook(false);
        if (!this.path.length) {
          this.pauseT = (this.pauseT || 0) - dt;
          if (this.pauseT <= 0) { this.pickWander(); this.pauseT = rand(0.6, 1.8); }
        }
      }
    } else if (st === 'lunge') {
      speed = 2.45;
      if (this.canSee(P)) this.target = { x: P.x, z: P.z };
      if (this.target) {
        tx = this.target.x; tz = this.target.z;
        if (Math.hypot(tx - this.pos.x, tz - this.pos.z) < 0.45) { this.state = 'search'; this.searchT = 0; this.target = null; this.setPose('grope', false, 3); audio.play('pale_teeth', { pos: this.headPos(), v: 0.8 }); }
      }
    } else if (st === 'search') {
      this.searchT += dt;
      speed = 0;
      this.extraYaw = Math.sin(this.searchT * 2.2) * 0.9;
      if (this.searchT > 2.6) { this.extraYaw = 0; this.state = 'grope'; this.startLook(false); }
    } else if (st === 'feel') {
      speed = 0;
      this.feelT += dt;
      const h = this.feelHide;
      if (!pl.hidden || pl.hidden !== h) { this.endFeel(false); }
      else {
        if (this.feelT > 0.45 && !pl.holdingBreath) this.feelBad += dt;
        g.ui.sheetPress && g.ui.sheetPress(clamp(this.feelT / 0.8, 0, 1) * (this.feelT < this.feelDur - 0.4 ? 1 : 0));
        if (this.feelBad > 0.55) return this.catchPlayer(true);
        if (this.feelT > this.feelDur) this.endFeel(true);
      }
    } else if (st === 'return') {
      speed = 0.62;
      if (!this.path.length) {
        const c = w.navNodes.get('a_chair');
        if (c && Math.hypot(c.x - this.pos.x, c.z - this.pos.z) > 0.3) { tx = c.x; tz = c.z; }
        else { this.state = 'seated'; if (this.onSeated) { const f = this.onSeated; this.onSeated = null; f(); } }
      }
    }

    // o olhar (mãos levantadas)
    if (this.look) this.updateLook(dt);

    // anda
    if (tx === null && this.path.length && speed > 0) {
      const n = this.path[0];
      tx = n.x; tz = n.z;
      if (Math.hypot(n.x - this.pos.x, n.z - this.pos.z) < 0.25) this.path.shift();
    }
    if (tx !== null && speed > 0) {
      const dx = tx - this.pos.x, dz = tz - this.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.04) {
        const step = Math.min(d, speed * dt);
        this.pos.x += (dx / d) * step; this.pos.z += (dz / d) * step;
        w.resolve(this.pos, 0.26);
        this.yaw += angleDiff(this.yaw, Math.atan2(-dx, -dz)) * Math.min(1, dt * (st === 'lunge' ? 7 : 3));
        this.walkPhase += step * (st === 'lunge' ? 4.4 : 5.2);
        this.stepAcc += step;
        if (this.stepAcc > (st === 'lunge' ? 0.8 : 0.62)) { this.stepAcc = 0; audio.play('pale_step', { pos: [this.pos.x, 0.1, this.pos.z], v: st === 'lunge' ? 1 : 0.7 }); }
      }
    }
    this.pos.y = w.heightAt(this.pos.x, this.pos.z);

    // tocar em alguém escondida debaixo de um lençol
    if (pl.hidden && pl.hidden.kind === 'sheet' && (st === 'grope' || st === 'search' || st === 'lunge')) {
      const h = pl.hidden, hp = h.feel || h.exit;
      const hd = Math.hypot(hp.x - this.pos.x, hp.z - this.pos.z);
      const ig = this.ignoreHide.get(h.id) || 0;
      if (hd < 1.0 && this.t > ig) this.startFeel(h, this.sawHide === h.id ? 3.6 : 2.6);
    }
    // encostar em quem está à vista
    if (inside && !pl.hidden && dist < CATCH && (st === 'grope' || st === 'search' || st === 'lunge')) return this.catchPlayer(false);
    // viu você se enfiar debaixo do lençol?
    if (st === 'lunge' && pl.hidden && !this.sawHide) {
      const hp = pl.hidden.feel || pl.hidden.exit;
      if (this.eyes > 0.5 && this.inCone(hp.x, hp.z, 0.6, 8) && this.losClear(hp.x, hp.z)) this.sawHide = pl.hidden.id;
    }
  }

  startLook(alerted) {
    this.look = { t: 0, dur: alerted ? 3.6 : 3.1, alerted };
    this.path = [];
    this.setPose('look', false, 3.2);
    if (alerted && this.alertAt) this.yaw += angleDiff(this.yaw, Math.atan2(-(this.alertAt.x - this.pos.x), -(this.alertAt.z - this.pos.z))) * 0.8;
    audio.play('pale_click', { pos: this.handPos(), v: 1 });
    audio.play('pale_inhale', { pos: this.headPos(), v: 0.9, delay: 0.15 });
    if (this.onEvent) this.onEvent('look');
  }
  updateLook(dt) {
    const L = this.look;
    L.t += dt;
    this.eyesTarget = L.t > 0.35 && L.t < L.dur - 0.35 ? 1 : 0;
    this.sweep = Math.sin(L.t * 1.25) * (L.alerted ? 0.35 : 0.6) * clamp((L.t - 0.5) / 0.5, 0, 1);
    const P = this.game.player.pos;
    if (L.t > 0.55 && this.canSee(P)) {
      // viu alguém se mexer
      this.look = null; this.sweep = 0;
      this.state = 'lunge';
      this.target = { x: P.x, z: P.z };
      this.setPose('lunge', false, 6);
      this.eyesTarget = 1;
      this.sawHide = null;
      audio.play('pale_shriek', { pos: this.headPos(), v: 1 });
      if (settings.scare > 0) audio.play('stinger_small', { v: settings.scare === 2 ? 0.8 : 0.4 });
      this.game.player.shake(0.25);
      this.startBreath(1.1);
      if (this.onEvent) this.onEvent('spotted');
      return;
    }
    if (L.t >= L.dur) {
      this.look = null; this.sweep = 0; this.eyesTarget = 0;
      if (this.state === 'grope' || this.state === 'search') { this.state = 'grope'; this.setPose('grope', false, 2.2); }
      this.nextLook = rand(4.5, 8.5);
      audio.play('pale_lids', { pos: this.handPos(), v: 0.6 });
      if (this.onEvent) this.onEvent('lookEnd');
    }
  }
  startFeel(h, dur) {
    this.state = 'feel';
    this.look = null; this.sweep = 0; this.eyesTarget = 0;
    this.feelHide = h; this.feelT = 0; this.feelBad = 0; this.feelDur = dur;
    this.path = [];
    const hp = h.feel || h.exit;
    this.yaw += angleDiff(this.yaw, Math.atan2(-(hp.x - this.pos.x), -(hp.z - this.pos.z)));
    this.setPose('feel', false, 4);
    audio.play('sheet_rustle', { pos: [hp.x, 0.6, hp.z], v: 1 });
    if (this.onEvent) this.onEvent('feel');
  }
  endFeel(passed) {
    const h = this.feelHide;
    this.feelHide = null;
    this.sawHide = null;
    if (h) this.ignoreHide.set(h.id, this.t + 12);
    if (this.game.ui.sheetPress) this.game.ui.sheetPress(0);
    this.state = 'grope';
    this.setPose('grope', false, 2);
    this.nextLook = rand(5, 8);
    this.pickWander();
    if (passed && this.onEvent) this.onEvent('feelPassed');
  }
  catchPlayer(fromHide) {
    if (settings.storyMode) {
      audio.play('pale_shriek', { pos: this.headPos(), v: 0.8 });
      this.game.ui.flash(0.35, 0.5, '#fff');
      if (this.feelHide) this.endFeel(false);
      this.state = 'grope'; this.look = null; this.eyesTarget = 0;
      this.place(this.pos.x, this.pos.z);
      this.pickWander();
      this.ignoreHide.clear();
      return;
    }
    this.state = 'static';
    if (this.game.ui.sheetPress) this.game.ui.sheetPress(0);
    if (this.onCatch) this.onCatch(fromHide);
  }
  handPos() {
    const hand = this.u.hands[0].eye.g;
    const v = new THREE.Vector3(); hand.getWorldPosition(v);
    return v;
  }

  // ------------------------------------------------------------ animação procedural
  animate(dt) {
    const u = this.u;
    const target = POSES[this.poseName];
    const k = 1 - Math.exp(-dt * this.poseRate);
    for (const key of KEYS) this.cur[key] = lerp(this.cur[key], target[key], k);
    const c = this.cur;
    const t = this.t;
    const st = this.state;
    const moving = ((st === 'grope' || st === 'lunge' || st === 'return') && !this.look) || !!this.scriptWalk;
    const ph = this.walkPhase;
    const breath = Math.sin(t * (st === 'lunge' ? 5 : 1.4));
    this.eyes += (this.eyesTarget - this.eyes) * Math.min(1, dt * (this.eyesTarget > this.eyes ? 7 : 10));
    // raiz
    this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.model.rotation.y = this.yaw + this.extraYaw * 0.3;
    // tronco
    u.hips.position.y = c.hipY + (moving ? -Math.abs(Math.sin(ph)) * 0.035 : 0) + breath * 0.004;
    u.spine.rotation.x = c.spine + breath * 0.012;
    u.spine.rotation.y = this.sweep * 0.55 + this.extraYaw * 0.4;
    u.spine.rotation.z = moving ? Math.sin(ph) * 0.06 : Math.sin(t * 0.7) * 0.02;
    u.chest.rotation.x = c.chest;
    u.chest.rotation.y = this.sweep * 0.35;
    u.neck.rotation.x = c.neck;
    u.neck.rotation.z = Math.sin(t * 0.45) * 0.12 + (st === 'search' ? Math.sin(t * 5) * 0.08 : 0);
    const twitch = Math.random() < 0.012 ? rand(-0.4, 0.4) : 0;
    u.head.rotation.x = c.head + twitch * 0.3;
    u.head.rotation.y = (st === 'grope' && !this.look ? Math.sin(t * 0.6) * 0.45 : 0) + twitch;
    u.head.rotation.z = Math.sin(t * 0.37) * 0.1;
    u.jaw.rotation.x = c.jaw + (st === 'lunge' ? Math.sin(t * 9) * 0.06 : 0);
    u.mouth.scale.y = 0.16 + Math.max(0, u.jaw.rotation.x) * 0.95;
    // braços
    const tremble = this.eyes > 0.5 ? Math.sin(t * 23) * 0.012 : 0;
    u.arms.forEach((a, i) => {
      const s = a.side;
      const sway = moving && st !== 'lunge' ? Math.sin(t * 0.9 + i * 1.7) * 0.14 : 0;
      a.sh.rotation.x = c.shX + sway + tremble + (moving && st === 'lunge' ? Math.sin(ph + i * Math.PI) * 0.1 : 0);
      a.sh.rotation.z = s * c.shZ + (moving ? Math.sin(t * 0.7 + i) * 0.08 * s : 0);
      a.sh.rotation.y = 0;
      a.el.rotation.x = c.el + (st === 'feel' ? Math.sin(t * 6 + i * 2) * 0.25 : 0);
      a.wr.rotation.x = c.wrX + (st === 'feel' ? Math.sin(t * 7 + i) * 0.2 : 0);
      a.wr.rotation.y = 0;
      a.wr.rotation.z = -s * c.spread * 0.4;
    });
    // dedos: tateando (ondas), abertos ao olhar
    u.hands.forEach((hd, hi) => {
      hd.fingers.forEach((f, fi) => {
        if (f.thumb) { f.base.rotation.z = -0.8 - c.spread * 0.6; f.segs.forEach((sg) => { sg.rotation.x = c.curl * 0.6; }); return; }
        f.base.rotation.z = c.spread * (fi - 1.5) * 0.3;
        const wig = (st === 'grope' || st === 'feel' || st === 'search') ? Math.sin(t * 3.2 + fi * 0.9 + hi * 2) * 0.28 : 0;
        f.segs.forEach((sg, k2) => { sg.rotation.x = c.curl * (0.55 + k2 * 0.35) + wig * (0.5 + k2 * 0.3); });
      });
      const e = hd.eye;
      const open = this.hasEyes ? this.eyes : 0;
      e.upper.rotation.x = open * 1.35;
      e.lower.rotation.x = -open * 1.35;
      if (open > 0.3) { e.ball.rotation.y = Math.sin(t * 1.7 + hi) * 0.25 + (Math.random() < 0.02 ? rand(-0.4, 0.4) : 0); e.ball.rotation.x = -Math.PI / 2 + Math.sin(t * 1.3 + hi * 2) * 0.15; }
    });
    // pernas
    u.legs.forEach((l, i) => {
      const s = i === 0 ? 1 : -1;
      const g1 = moving ? Math.sin(ph + (i ? Math.PI : 0)) : 0;
      l.th.rotation.x = c.thX + g1 * (st === 'lunge' ? 0.55 : 0.32);
      l.th.rotation.z = s * -0.06;
      l.kn.rotation.x = c.kn + (moving ? Math.max(0, Math.sin(ph + (i ? Math.PI : 0) + 1.2)) * (st === 'lunge' ? 0.9 : 0.55) : 0);
      l.an.rotation.x = c.an;
    });
    // abas de pele balançando
    u.flaps.forEach((f, i) => { f.rotation.x = 0.06 + Math.sin(t * 2 + i) * 0.025 + (moving ? Math.sin(ph * 2 + i) * 0.05 : 0); });
  }
}
