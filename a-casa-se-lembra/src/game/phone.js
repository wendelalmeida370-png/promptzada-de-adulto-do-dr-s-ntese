// O celular da protagonista: lanterna, câmera, vídeo casa.mp4, rádio, mensagens, galeria, bateria.
import * as THREE from 'three';
import { audio } from '../core/audio.js';
import { clamp } from '../core/util.js';
import { T } from '../core/settings.js';

export class Phone {
  constructor(game) {
    this.game = game;
    this.battery = 12;
    this.flashlight = false;
    this.raised = false;
    this.mode = 'camera';
    this.apps = { video: false, radio: false };
    this.radioOn = false;
    this.threads = [];
    this.gallery = [];
    this.pendingPhoto = null;
    this.charging = false;
    this.photoCooldown = 0;
    this.dead = false;
    this.radioLoop = null;
    // lanterna (spot com sombra)
    const s = new THREE.SpotLight(0xfff2e0, 0, 14, 0.52, 0.55, 1.6);
    s.castShadow = true;
    s.shadow.mapSize.set(1024, 1024);
    s.shadow.camera.near = 0.1;
    s.shadow.camera.far = 14;
    s.shadow.bias = -0.0008;
    s.shadow.normalBias = 0.02;
    s.layers.enableAll();
    s.map = flashlightCookie(); // a "lente" da lanterna: centro quente, anel do refletor e bordas suaves
    this.spot = s;
    this.spotTarget = new THREE.Object3D();
    s.target = this.spotTarget;
    // brilho da tela quando levantado
    this.glow = new THREE.PointLight(0xaaccff, 0, 2.5, 2);
    this.glow.layers.enableAll();
    this.flicker = 0;
  }

  attach(scene) { scene.add(this.spot); scene.add(this.spotTarget); scene.add(this.glow); }

  // ------------------------------------------------------------ mensagens
  thread(id) { return this.threads.find((t) => t.id === id); }
  ensureThread(id, name) {
    let t = this.thread(id);
    if (!t) { t = { id, name, msgs: [], unread: 0 }; this.threads.unshift(t); }
    return t;
  }
  unread() { return this.threads.reduce((a, t) => a + (t.unread || 0), 0); }
  receive(id, name, text, opts = {}) {
    const t = this.ensureThread(id, name);
    t.msgs.push({ text, time: opts.time || this.game.clockText(), day: opts.day || 'hoje', glitch: opts.glitch, out: opts.out });
    if (!opts.out) t.unread = (t.unread || 0) + 1;
    this.threads = [t, ...this.threads.filter((x) => x !== t)];
    if (opts.silent) return;
    audio.play('phone_vibrate', { n: 2 });
    audio.play('phone_notify', { delay: 0.1, vol: 0.6 });
    this.game.ui.notify(name, opts.glitch ? text : text, { glitch: opts.glitch });
    if (this.game.ui.overlay === 'phone') this.game.ui.renderPhone(this.game.ui.phoneView === 'chat' ? 'msgs' : this.game.ui.phoneView);
  }

  // ------------------------------------------------------------ lanterna / rádio
  toggleFlashlight(force) {
    const on = force === undefined ? !this.flashlight : force;
    if (on && this.battery <= 0) { this.game.ui.toast('Bateria descarregada.'); return; }
    this.flashlight = on;
    audio.play('switch', { vol: 0.5 });
  }
  toggleRadio(force) {
    if (!this.apps.radio) { this.game.ui.toast('Sem fone de ouvido, o rádio não sintoniza.'); return; }
    this.radioOn = force === undefined ? !this.radioOn : force;
    audio.play('switch', { vol: 0.5 });
    if (this.radioOn && !this.radioLoop) this.radioLoop = audio.loop('radio', { vol: 0.8 });
    if (!this.radioOn && this.radioLoop) { this.radioLoop.stop(0.3); this.radioLoop = null; }
    this.game.ui.radio(this.radioOn ? 0 : null);
  }

  charge(dt) {
    this.battery = clamp(this.battery + dt * 7, 0, 100);
    this.dead = false;
  }

  // ------------------------------------------------------------ atualização
  update(dt) {
    const g = this.game, inp = g.input;
    const canRaise = !g.cutscene || g.allowPhoneInCutscene;
    const wantRaise = inp.rmb && inp.locked && canRaise && !g.ui.overlay;
    if (wantRaise && this.battery <= 0) {
      if (!this._deadMsg) { g.ui.toast('Bateria descarregada. Procure uma tomada (com o carregador).'); this._deadMsg = true; }
    } else this._deadMsg = false;
    const wasRaised = this.raised;
    this.raised = wantRaise && this.battery > 0;
    if (this.raised !== wasRaised) {
      audio.play(this.raised ? 'record_beep' : 'switch', { vol: 0.35 });
      if (this.raised && g.story.onPhoneRaised) g.story.onPhoneRaised();
    }
    if (this.raised && (inp.hit('KeyQ') || inp.wheel !== 0)) {
      if (this.apps.video) { this.mode = this.mode === 'camera' ? 'video' : 'camera'; audio.play('phone_glitch', { vol: 0.3 }); if (g.story.onModeChange) g.story.onModeChange(this.mode); }
      else g.ui.toast('O vídeo ainda não carregou (bateria fraca?).');
    }
    if (this.raised && inp.lclick && this.photoCooldown <= 0) this.takePhoto();
    this.photoCooldown -= dt;

    // bateria
    let drain = 0;
    if (this.flashlight) drain += 0.07;
    if (this.raised) drain += 0.12;
    if (this.radioOn) drain += 0.02;
    if (!g.flags.noDrain) this.battery = Math.max(0, this.battery - drain * dt);
    if (this.battery <= 0 && !this.dead) {
      this.dead = true;
      if (this.flashlight) { this.flashlight = false; audio.play('switch'); }
      g.ui.toast('O celular descarregou.');
    }
    g.ui.battery(this.battery);

    // luz
    const cam = g.camera;
    const on = this.flashlight && this.battery > 0;
    this.flicker = Math.max(0, this.flicker - dt);
    const fl = this.flicker > 0 ? (Math.random() < 0.5 ? 0.1 : 1) : 1;
    const low = this.battery < 8 ? 0.55 + 0.45 * Math.abs(Math.sin(performance.now() * 0.013)) : 1;
    this.spot.intensity = on ? 22 * fl * low : 0;
    this.spot.castShadow = on;
    const e = cam.matrixWorld.elements;
    this.spot.position.set(e[12] + e[0] * 0.14 - e[4] * 0.12, e[13] + e[1] * 0.14 - e[5] * 0.12, e[14] + e[2] * 0.14 - e[6] * 0.12);
    this.spotTarget.position.set(e[12] - e[8] * 5, e[13] - e[9] * 5, e[14] - e[10] * 5);
    this.spotTarget.updateMatrixWorld();
    this.glow.position.set(e[12] - e[8] * 0.3, e[13] - e[9] * 0.3 - 0.1, e[14] - e[10] * 0.3);
    this.glow.intensity = this.raised ? 0.35 : 0.04;
  }

  takePhoto() {
    const g = this.game;
    this.photoCooldown = 0.7;
    audio.play('shutter');
    g.ui.flash(0.55, 0.35);
    g.flashLight(0.12);
    // descobre o que foi fotografado
    const hits = g.story.photoTargetsInView();
    let caption = hits.length ? hits[0].caption : (this.mode === 'video' ? 'Quadro do vídeo casa.mp4' : 'Foto: ' + (g.world.roomAt(g.player.pos.x, g.player.pos.z) || 'casa'));
    const detail = hits.length ? hits[0].detail : null;
    this.pendingPhoto = { caption: T(caption), detail: detail ? T(detail) : null, time: g.clockText() };
    for (const h of hits) if (h.onPhoto) h.onPhoto();
    if (g.pale && g.pale.model.visible) g.pale.onFlash();
    g.noise(g.player.pos.x, g.player.pos.z, 2);
  }

  // chamado pelo renderizador logo depois de desenhar o quadro
  capture(canvas) {
    if (!this.pendingPhoto) return;
    const p = this.pendingPhoto;
    this.pendingPhoto = null;
    try {
      const c = document.createElement('canvas');
      c.width = 320; c.height = 180;
      const x = c.getContext('2d');
      const sw = canvas.width, sh = canvas.height;
      const ar = 16 / 9;
      let w = sw, hh = sw / ar;
      if (hh > sh) { hh = sh; w = sh * ar; }
      x.drawImage(canvas, (sw - w) / 2, (sh - hh) / 2, w, hh, 0, 0, 320, 180);
      x.fillStyle = 'rgba(255,255,255,0.8)'; x.font = '12px monospace';
      x.fillText(p.time, 8, 172);
      p.img = c.toDataURL('image/jpeg', 0.72);
    } catch (e) { p.img = null; }
    this.gallery.unshift(p);
    if (this.gallery.length > 40) this.gallery.pop();
    this.game.ui.toast('Foto salva na galeria.', 1.4);
  }
}

// textura projetada pela lanterna do celular (multiplica a cor da luz)
function flashlightCookie() {
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, N, N);
  const h = N / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0.0, 'rgb(255,255,255)');
  g.addColorStop(0.14, 'rgb(250,248,242)');
  g.addColorStop(0.26, 'rgb(196,193,186)');
  g.addColorStop(0.33, 'rgb(222,219,212)');
  g.addColorStop(0.42, 'rgb(150,147,142)');
  g.addColorStop(0.6, 'rgb(88,86,83)');
  g.addColorStop(0.82, 'rgb(34,33,32)');
  g.addColorStop(1.0, 'rgb(0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, N, N);
  // imperfeições da lente: manchas e poeira bem suaves
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const r = 6 + rnd() * 26, a = rnd() * Math.PI * 2, d = rnd() * h * 0.62;
    const gx = h + Math.cos(a) * d, gy = h + Math.sin(a) * d;
    const sg = x.createRadialGradient(gx, gy, 0, gx, gy, r);
    sg.addColorStop(0, `rgba(0,0,0,${0.05 + rnd() * 0.07})`); sg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = sg; x.fillRect(gx - r, gy - r, r * 2, r * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

export class Inventory {
  constructor() { this.items = []; }
  add(id) { if (!this.items.includes(id)) this.items.push(id); }
  remove(id) { this.items = this.items.filter((x) => x !== id); }
  has(id) { return this.items.includes(id); }
  list() { return [...this.items]; }
}
