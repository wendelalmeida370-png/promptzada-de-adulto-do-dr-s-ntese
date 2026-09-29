// O Inquilino: a entidade. Regras legíveis:
//  1) ouve barulho (correr, portas, gritos) e vai investigar;
//  2) vê em linha reta; perde você se quebrar a linha de visão;
//  3) não encontra quem está escondido, a não ser que tenha visto você entrar
//     ou chegue coladinho enquanto você respira (segure ESPAÇO);
//  4) não atravessa portas criadas pela casa (houseDoor);
//  5) o palhaço buzina antes de ele chegar.
import * as THREE from 'three';
import { buildEntity } from './characters.js';
import { vis } from '../world/layers.js';
import { audio } from '../core/audio.js';
import { settings } from '../core/settings.js';
import { clamp, angleDiff, rand, pick } from '../core/util.js';

export class Entity {
  constructor(game) {
    this.game = game;
    this.model = buildEntity();
    this.model.visible = false;
    game.scene.add(this.model);
    this.pos = new THREE.Vector3(0, 0, 0);
    this.drawPos = new THREE.Vector3();
    this.yaw = 0;
    this.state = 'off';
    this.path = [];
    this.target = null;
    this.speed = 1.3;
    this.strength = 1;
    this.lastSeen = null;
    this.searchT = 0;
    this.huntT = 0;
    this.stepAcc = 0;
    this.frameAcc = 0;
    this.growl = null;
    this.sawHide = null;
    this.hunt = null;
    this.alert = 0;
    this.nearHideT = 0;
    this.layerSpec = 'ecv';
    this.onCatch = null;
    this.stunT = 0;
    this.blockedT = 0;
    this.ignoreT = 0;
  }

  setLayers(spec) { this.layerSpec = spec; vis(this.model, spec); }

  place(x, z, yaw = 0) {
    this.pos.set(x, this.game.world.heightAt(x, z), z);
    this.drawPos.copy(this.pos);
    this.yaw = yaw;
    this.model.position.copy(this.pos);
    this.model.rotation.y = yaw;
  }

  show(x, z, yaw, spec = 'ecv') {
    this.setLayers(spec);
    this.place(x, z, yaw);
    this.model.visible = true;
    if (this.state === 'off') this.state = 'static';
  }

  hide() {
    this.model.visible = false;
    this.state = 'off';
    this.hunt = null;
    this.path = [];
    if (this.growl) { this.growl.stop(0.8); this.growl = null; }
    audio.music(null);
  }

  // inicia uma caçada
  startHunt(opts = {}) {
    const w = this.game.world;
    const from = opts.from ? w.navNodes.get(opts.from) : null;
    if (from) this.place(from.x, from.z, 0);
    else if (opts.x !== undefined) this.place(opts.x, opts.z, 0);
    this.setLayers(opts.spec || 'ecv');
    this.model.visible = true;
    this.state = 'patrol';
    this.hunt = { dur: opts.duration || 45, exit: opts.exit || opts.from, patrol: (opts.patrol || this.houseNodes()).filter((id) => !id.startsWith('a_')), onEnd: opts.onEnd || null, endless: !!opts.endless, leaving: false };
    this.huntT = 0;
    this.path = [];
    this.lastSeen = null;
    this.sawHide = null;
    this.speed = 1.3;
    this.strength = opts.strength || this.strength || 1;
    if (opts.investigate) this.investigate(opts.investigate.x, opts.investigate.z);
    if (!this.growl) this.growl = audio.loop('growl', { pos: this.pos, vol: 0.9, ref: 1.5, rolloff: 1.4 });
    audio.play('crack', { pos: this.pos });
    audio.music('dread');
  }

  endHunt() {
    if (!this.hunt) return;
    this.hunt.leaving = true;
    this.state = 'leave';
    this.goTo(this.hunt.exit);
  }

  // nós de navegação da casa (os do apartamento de antes, "a_*", são só do Morador de Antes)
  houseNodes() { return [...this.game.world.navNodes.keys()].filter((id) => !id.startsWith('a_')); }

  // escolhe um ponto longe do esconderijo para ir
  giveUp() {
    const w = this.game.world, p = this.game.player.pos;
    let best = null, bd = 0;
    const list = this.hunt ? this.hunt.patrol : this.houseNodes();
    for (const id of list) { const n = w.navNodes.get(id); if (!n) continue; const d = Math.hypot(n.x - p.x, n.z - p.z); if (d > bd) { bd = d; best = id; } }
    if (best) this.goTo(best);
  }

  stun(sec) { this.stunT = sec; audio.play('scream', { pos: this.pos, v: 0.4, dur: 1.2 }); }

  // ------------------------------------------------------------ navegação
  canPass = (e) => {
    if (!e.door) return true;
    const d = this.game.world.doors.get(e.door);
    if (!d) return true;
    if (d.houseDoor || d.locked) return false;
    return true;
  };
  goTo(nodeId) {
    const w = this.game.world;
    const start = w.nearestNode(this.pos.x, this.pos.z);
    if (!start || !w.navNodes.has(nodeId)) { this.path = []; return false; }
    const p = w.path(start.id, nodeId, this.canPass);
    this.path = p ? p.slice() : [];
    return !!p;
  }
  goToPoint(x, z) {
    const w = this.game.world;
    const n = w.nearestNode(x, z);
    if (n) this.goTo(n.id);
    this.finalPoint = { x, z };
  }
  investigate(x, z) {
    if (this.state === 'chase' || this.state === 'leave' || this.state === 'off' || this.state === 'static') return;
    this.state = 'investigate';
    this.goToPoint(x, z);
    this.searchT = 0;
  }
  hear(x, z, radius) {
    if (!this.hunt || this.state === 'off') return;
    const d = Math.hypot(x - this.pos.x, z - this.pos.z);
    if (d < radius * this.strength) this.investigate(x, z);
  }

  // ------------------------------------------------------------ percepção
  sees(p) {
    const g = this.game;
    const d = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
    if (d > 11) return false;
    if (g.player.hidden) return false;
    if (g.world.losBlocked(this.pos.x, this.pos.z, p.x, p.z)) return false;
    if (this.state !== 'chase') {
      const ang = Math.atan2(-(p.x - this.pos.x), -(p.z - this.pos.z));
      if (Math.abs(angleDiff(this.yaw, ang)) > 1.2 && d > 2.2) return false;
    }
    if (g.player.crouching && d > 6 && this.state !== 'chase') return false;
    return true;
  }

  // ------------------------------------------------------------ atualização
  update(dt) {
    const g = this.game, w = g.world, pl = g.player;
    // animação do rosto sempre que visível
    if (this.model.visible) {
      const u = this.model.userData;
      this.frameAcc += dt;
      if (this.frameAcc > 1 / 12) {
        this.frameAcc = 0;
        u.faceTex.draw(1 / 12, this.state === 'chase' ? 1.6 : 1);
        const jitter = this.state === 'chase' ? 0.04 : 0.015;
        this.drawPos.set(this.pos.x + rand(-jitter, jitter), this.pos.y, this.pos.z + rand(-jitter, jitter));
        this.model.position.copy(this.drawPos);
        this.model.rotation.y = this.yaw + rand(-0.04, 0.04);
        u.neck.rotation.z = Math.sin(performance.now() * 0.002) * 0.25 + (Math.random() < 0.05 ? rand(-0.6, 0.6) : 0);
        u.neck.rotation.x = 0.25 + Math.sin(performance.now() * 0.0013) * 0.1;
        const t = performance.now() * 0.004;
        u.arms[0].sh.rotation.x = Math.sin(t) * 0.35; u.arms[1].sh.rotation.x = -Math.sin(t) * 0.35;
        u.arms[0].fore.rotation.x = -0.3 + Math.sin(t * 1.3) * 0.2; u.arms[1].fore.rotation.x = -0.3 - Math.sin(t * 1.3) * 0.2;
      }
    }
    if (this.growl) this.growl.setPos(this.pos);
    if (this.state === 'off' || this.state === 'static') return;
    if (this.stunT > 0) { this.stunT -= dt; return; }

    const P = pl.pos;
    const dist = Math.hypot(P.x - this.pos.x, P.z - this.pos.z);
    const hunt = this.hunt;
    if (hunt) {
      this.huntT += dt;
      if (!hunt.leaving && !hunt.endless && this.huntT > hunt.dur && this.state !== 'chase') this.endHunt();
    }

    // visão
    this.ignoreT = Math.max(0, (this.ignoreT || 0) - dt);
    const canSee = this.state !== 'leave' && this.ignoreT <= 0 && !this.sanctuary(P.x, P.z) && this.sees(P);
    if (canSee) {
      if (this.state !== 'chase') { audio.play('stinger_small', { pos: this.pos, v: 0.7 }); audio.music('chase'); g.onSpotted && g.onSpotted(); }
      this.state = 'chase';
      this.lastSeen = { x: P.x, z: P.z };
      this.alert = 1;
    }
    // viu entrar no esconderijo?
    if (pl.hidden && this.state === 'chase' && this.lastSeen && !this.sawHide) {
      if (Math.hypot(this.lastSeen.x - pl.hidden.exit.x, this.lastSeen.z - pl.hidden.exit.z) < 1.8 && this.alert > 0.5) this.sawHide = pl.hidden.id;
    }

    let speed = 1.25;
    let tx = null, tz = null;
    if (this.state === 'chase') {
      speed = 2.55 * this.strength;
      if (canSee) { tx = P.x; tz = P.z; this.path = []; }
      else if (this.sawHide && pl.hidden) { tx = pl.hidden.exit.x; tz = pl.hidden.exit.z; }
      else if (this.lastSeen) {
        tx = this.lastSeen.x; tz = this.lastSeen.z;
        if (Math.hypot(tx - this.pos.x, tz - this.pos.z) < 0.5) { this.state = 'search'; this.searchT = 0; this.lastSeen = null; audio.music('dread'); }
      }
      this.alert = Math.max(0, this.alert - dt * 0.3);
    } else if (this.state === 'search') {
      this.searchT += dt;
      speed = 0.9;
      if (this.searchT > 6) { this.state = 'patrol'; this.path = []; }
      else { this.yaw += dt * 1.4 * Math.sin(this.searchT); }
    } else if (this.state === 'investigate') {
      speed = 1.7 * this.strength;
      if (!this.path.length) {
        if (this.finalPoint) { tx = this.finalPoint.x; tz = this.finalPoint.z; if (Math.hypot(tx - this.pos.x, tz - this.pos.z) < 0.4) { this.finalPoint = null; this.state = 'search'; this.searchT = 0; } }
        else { this.state = 'search'; this.searchT = 0; }
      }
    } else if (this.state === 'patrol') {
      speed = 1.2 * this.strength;
      if (!this.path.length) { const n = pick(hunt ? hunt.patrol : this.houseNodes()); this.goTo(n); }
    } else if (this.state === 'leave') {
      speed = 1.5;
      if (!this.path.length) { this.hide(); if (hunt && hunt.onEnd) hunt.onEnd(); return; }
    } else if (this.state === 'scripted') {
      speed = this.scriptSpeed || 1.3;
      if (!this.path.length) { this.state = 'static'; if (this._scriptRes) { const r = this._scriptRes; this._scriptRes = null; r(); } }
    }

    // segue caminho
    if (tx === null && this.path.length) {
      const n = this.path[0];
      tx = n.x; tz = n.z;
      if (Math.hypot(n.x - this.pos.x, n.z - this.pos.z) < 0.25) { this.path.shift(); this._openDoorsNear(); }
    }
    const ox = this.pos.x, oz = this.pos.z;
    if (tx !== null) {
      const dx = tx - this.pos.x, dz = tz - this.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.05) {
        const step = Math.min(d, speed * dt);
        this.pos.x += (dx / d) * step;
        this.pos.z += (dz / d) * step;
        if (this.state === 'chase') w.resolve(this.pos, 0.28, (c) => c.tag !== 'door' || !this._canOpen(c));
        const ang = Math.atan2(-dx, -dz);
        this.yaw += angleDiff(this.yaw, ang) * Math.min(1, dt * 6);
        this.stepAcc += step;
        if (this.stepAcc > (this.state === 'chase' ? 0.9 : 0.75)) {
          this.stepAcc = 0;
          audio.play('entity_step', { pos: this.pos, v: this.state === 'chase' ? 1.1 : 0.8 });
          if (Math.random() < 0.15) audio.play('crack', { pos: this.pos });
        }
      }
      this._openDoorsNear();
    }
    // a casa não deixa ele entrar nos lugares que ela mesma fez
    if (this.sanctuary(this.pos.x, this.pos.z)) {
      this.pos.x = ox; this.pos.z = oz;
      this.blockedT += dt;
      if (g.story.onEntityBlocked) g.story.onEntityBlocked(this.blockedT);
      if (this.blockedT > 5 && this.state !== 'leave') { this.state = 'patrol'; this.path = []; this.ignoreT = 10; this.blockedT = 0; }
    } else if (this.blockedT > 0) this.blockedT = Math.max(0, this.blockedT - dt);
    this.pos.y = w.heightAt(this.pos.x, this.pos.z);

    // encontrar escondida
    if (pl.hidden) {
      const hd = Math.hypot(pl.hidden.exit.x - this.pos.x, pl.hidden.exit.z - this.pos.z);
      if (this.sawHide === pl.hidden.id && hd < 0.9) return this._catch(true);
      if (hd < 1.5 && this.state !== 'leave') {
        this.nearHideT += dt;
        if (pl.holdingBreath) {
          // silêncio total: depois de alguns segundos ele desiste e vai embora
          this.heldT = (this.heldT || 0) + dt;
          if (this.heldT > 2.5) { this.heldT = 0; this.nearHideT = 0; this.state = 'patrol'; this.path = []; this.ignoreT = 5; this.finalPoint = null; this.giveUp(); }
        } else if (this.nearHideT > 1.4) return this._catch(true);
      } else { this.nearHideT = 0; this.heldT = 0; }
    } else if (dist < 0.8 && this.state !== 'leave' && !this.sanctuary(P.x, P.z)) {
      return this._catch(false);
    }
  }

  sanctuary(x, z) {
    if (x > 60) return true;
    return x > 11.1 && x < 13.3 && z > 7.74 && z < 10.7 && !!this.game.flags.corridorLong;
  }

  _canOpen(c) {
    const d = this.game.world.doors.get(c.id);
    return d && !d.houseDoor;
  }
  _openDoorsNear() {
    for (const d of this.game.world.doors.values()) {
      if (d.houseDoor || d.fake || d.locked) continue;
      if (d.target < 0.5 && Math.hypot(d.center.x - this.pos.x, d.center.z - this.pos.z) < 1.0) {
        d.openNow(false, { slam: this.state === 'chase', speed: this.state === 'chase' ? 6 : 2.5 });
      }
    }
  }

  _catch(fromHide) {
    const g = this.game;
    if (settings.storyMode) {
      audio.play('scream', { pos: this.pos, v: 0.8 });
      g.ui.flash(0.4, 0.5, '#300');
      const hunt = this.hunt;
      this.hide();
      if (hunt && hunt.onEnd) hunt.onEnd();
      // a caçada sem fim do ato 3 volta depois de um tempo (a ameaça continua, só não pega)
      else if (hunt && hunt.endless && g.story.startEndlessHunt) g.story.startEndlessHunt(20);
      return;
    }
    const cb = this.onCatch;
    this.state = 'static';
    if (cb) cb(fromHide);
  }

  // movimento roteirizado (cutscenes)
  walkTo(nodeId, speed = 1.3) {
    return new Promise((res) => {
      this.state = 'scripted';
      this.scriptSpeed = speed;
      this.goTo(nodeId);
      this._scriptRes = res;
    });
  }

  proximity() {
    if (!this.model.visible || this.state === 'off') return 0;
    const p = this.game.player.pos;
    const d = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
    return clamp(1 - d / 14, 0, 1);
  }
}
