// Núcleo: renderização, loop, sistemas, salvamento e checkpoints.
import * as THREE from 'three';
import { Input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { Post } from '../core/post.js';
import { settings, T } from '../core/settings.js';
import { setMaxAniso } from '../core/textures.js';
import { clamp, lerp, rand } from '../core/util.js';
import { World } from '../world/world.js';
import { L, vis } from '../world/layers.js';
import { buildHouse, applyHouse } from '../world/house.js';
import { buildBasement } from '../world/basement.js';
import { buildAntes, applyAntes } from '../world/antes.js';
import { setMirrorOcclusion } from '../world/mirror.js';
import { Player } from './player.js';
import { Phone, Inventory } from './phone.js';
import { UI } from './ui.js';
import { Entity } from './entity.js';
import { Cat, Clown, Echoes, Esquecido } from './actors.js';
import { Pale } from './pale.js';
import { buildRafaela, buildPale } from './characters.js';
import { Story } from './story.js';

const SAVE_KEY = 'casa-se-lembra/save/v1';
const POOL = 6;

export class Game {
  constructor() {
    const app = document.getElementById('app');
    this.settings = settings; // (acesso para os testes automáticos)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(0x000000);
    app.appendChild(this.renderer.domElement);
    setMaxAniso(Math.min(8, this.renderer.capabilities.getMaxAnisotropy()));

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020202, 0.055);
    this.camera = new THREE.PerspectiveCamera(settings.fov, innerWidth / innerHeight, 0.05, 200);
    this.camera.layers.set(L.EYE);
    this.scene.add(this.camera);
    this.hemi = new THREE.HemisphereLight(0x8a93a8, 0x1a1410, 0.22);
    this.hemi.layers.enableAll();
    this.scene.add(this.hemi);
    this.pool = [];
    for (let i = 0; i < POOL; i++) {
      const l = new THREE.PointLight(0xffffff, 0, 7, 2);
      l.layers.enableAll();
      this.scene.add(l);
      this.pool.push(l);
    }
    this.flashL = new THREE.PointLight(0xffffff, 0, 8, 2);
    this.flashL.layers.enableAll();
    this.scene.add(this.flashL);
    this.flashT = 0;

    this.post = new Post(this.renderer);
    this.input = new Input(this.renderer.domElement);
    this.input.onLockChange = (locked) => this._onLock(locked);
    this.world = new World(this.scene);
    this.world.game = this;
    this.flags = {};
    this.inventory = new Inventory();
    this.notes = [];
    this.rules = [];
    this.ui = new UI(this);
    this.player = new Player(this, this.camera);
    this.phone = new Phone(this);
    this.phone.attach(this.scene);
    this.entity = new Entity(this);
    this.entity.onCatch = (fromHide) => this.caught(fromHide);
    this.clown = new Clown(this);
    this.echoes = new Echoes(this);
    this.esquecido = new Esquecido(this);
    this.pale = new Pale(this);
    this.cats = { bento: new Cat(this, 'bento'), lili: new Cat(this, 'lili') };
    this.body = buildRafaela();
    vis(this.body, 'mc');
    this.scene.add(this.body);
    this.story = new Story(this);
    this.audioEngine = audio;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(L.EYE);
    this.raycaster.far = 3;
    this.hover = null;
    this.state = 'menu';
    this.cutscene = false;
    this.time = 0;
    this.clockMin = 3 * 60 + 7;
    this.checkpointData = null;
    this.chargeHold = 0;
    this.fear = 0;
    this.deaths = 0;
    this.ambience = [];
    this.tv = new TVScreen(this);
    this.cctvCam = new THREE.PerspectiveCamera(60, 16 / 9, 0.05, 40);
    this.cctvCam.layers.set(L.CCTV);
    this.cctvRT = new THREE.WebGLRenderTarget(512, 288, { type: THREE.HalfFloatType });
    this.cctvOn = false;

    this.ui.cb = {
      onNew: () => this.newGame(),
      onContinue: () => this.continueGame(),
      onResume: () => this.resume(),
      onQuit: () => this.quitToMenu(),
      onLastCheckpoint: () => { this.ui.showPause(false); this.loadCheckpoint(); },
      onHint: () => this.story.hint(),
    };
    audio.occlude = (p) => {
      const x = p.x !== undefined ? p.x : p[0], z = p.z !== undefined ? p.z : p[2];
      const e = this.player.pos;
      return this.world.losBlocked(e.x, e.z, x, z) ? 1 : 0;
    };
    setMirrorOcclusion((ax, az, bx, bz) => this.world.losBlocked(ax, az, bx, bz));
    this.renderer.domElement.addEventListener('click', () => { if (this.state === 'playing' && !this.ui.paused && !this.input.locked) this.resumePointer(true); });
    window.addEventListener('resize', () => this.resize());
    this.applySettings();
    this.resize();
    // mundo inicial (visível atrás do menu)
    this.rebuildWorld();
    this.player.teleport(3.3, 3.2, Math.PI / 2 + 0.2, -0.05);
    this.ui.loading(false);
    this.ui.showMenu();
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  // ------------------------------------------------------------ configuração
  applySettings() {
    this.camera.fov = settings.fov;
    this.camera.updateProjectionMatrix();
    this.resize();
  }
  resize() {
    let pr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (settings.quality === 'low') pr = 0.6;
    else if (settings.quality === 'auto') pr = Math.min(pr, innerWidth > 1600 ? 1 : 1.25);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.post.setSize();
    this.renderer.shadowMap.enabled = settings.quality !== 'low';
  }

  rebuildWorld() {
    for (const id of [...this.world.sections.keys()]) this.world.remove(id);
    this.layout = buildHouse(this.world, this.flags);
    if (this.flags.basementBuilt) buildBasement(this.world, this.flags);
    if (this.flags.antesBuilt) buildAntes(this.world, this.flags);
    applyHouse(this.world, this.flags);
    applyAntes(this.world, this.flags);
    this.story.afterBuild && this.story.afterBuild();
    // os objetos criados em afterBuild (escritas nos espelhos, chapéu do pai...) nascem escondidos
    if (this.story.afterApply) this.story.afterApply();
  }
  applyWorld() { applyHouse(this.world, this.flags); applyAntes(this.world, this.flags); if (this.story.afterApply) this.story.afterApply(); }

  // ------------------------------------------------------------ fluxo
  hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

  newGame() {
    audio.init();
    this.input.lock();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ok */ }
    this.resetState();
    this.ui.hideMenu();
    this.state = 'playing';
    this.ui.showHud(true);
    this.story.start();
  }
  continueGame() {
    audio.init();
    this.input.lock();
    let data = null;
    try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { data = null; }
    if (!data) { this.newGame(); return; }
    this.ui.hideMenu();
    this.state = 'playing';
    this.ui.showHud(true);
    this.restore(data);
  }
  quitToMenu() {
    this.ui.showPause(false);
    this.state = 'menu';
    this.cutscene = false;
    this.story.abort();
    this.entity.hide();
    audio.stopAllLoops(0.3);
    audio.music('menu');
    audio.hush();
    this.ui.clearSubs();
    this.ui.showMenu();
    this.input.unlock();
  }
  pause() {
    if (this.state !== 'playing' || this.ui.overlay) return;
    this.ui.showPause(true);
    this.input.unlock();
  }
  resume() {
    this.ui.showPause(false);
    this.resumePointer(true);
  }
  resumePointer(force) {
    if (this.state !== 'playing') return;
    if (this.ui.paused && !force) return;
    this.input.lock();
    setTimeout(() => { if (!this.input.locked && this.state === 'playing' && !this.ui.paused) this.ui.clickToPlay(true); }, 350);
  }
  _onLock(locked, free) {
    if (free) this.ui.toast('Modo alternativo: mova o mouse para olhar (o navegador não permitiu travar o cursor).', 5);
    if (locked) { this.ui.clickToPlay(false); audio.resume(); return; }
    if (this.state === 'playing' && !this.ui.overlay && !this.ui.paused && !this._endingNow) this.pause();
  }

  resetState() {
    this.flags = { act: 1 };
    this.inventory = new Inventory();
    this.notes = [];
    this.rules = [];
    this.phone.threads = [];
    this.phone.gallery = [];
    this.phone.battery = 12;
    this.phone.apps = { video: false, radio: false };
    this.phone.flashlight = false;
    if (this.phone.radioOn) this.phone.toggleRadio(false);
    this.phone.mode = 'camera';
    this.clockMin = 3 * 60 + 7;
    this.deaths = 0;
    this.time = 0;
    this.echoes.clear();
    this.entity.hide();
    this.clown.hide();
    this.esquecido.hide();
    this.pale.hide();
    this.tv.set('off');
    this.cctvOn = false;
    this.rebuildWorld();
  }

  // ------------------------------------------------------------ salvamento / checkpoints
  snapshot(id) {
    return {
      v: 1, id, flags: JSON.parse(JSON.stringify(this.flags)), inv: this.inventory.list(), notes: this.notes, rules: this.rules,
      phone: { battery: Math.max(this.phone.battery, 25), apps: this.phone.apps, threads: this.phone.threads, gallery: this.phone.gallery.slice(0, 10), flashlight: this.phone.flashlight },
      player: { x: this.player.pos.x, z: this.player.pos.z, yaw: this.player.yaw },
      clock: this.clockMin, time: this.time, deaths: this.deaths, story: this.story.save(),
    };
  }
  checkpoint(id, silent = false, at = null) {
    this.checkpointData = this.snapshot(id);
    if (at) this.checkpointData.player = { x: at.x, z: at.z, yaw: at.yaw === undefined ? this.player.yaw : at.yaw };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.checkpointData)); }
    catch (e) {
      this.checkpointData.phone.gallery = [];
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.checkpointData)); } catch (e2) { /* sem armazenamento */ }
    }
    if (!silent) this.ui.toast('progresso salvo', 1.6);
  }
  loadCheckpoint() {
    const d = this.checkpointData || (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } })();
    if (!d) return;
    this.restore(d);
  }
  restore(d) {
    this.story.abort();
    this.cutscene = false;
    this.ui.clearSubs();
    audio.hush();
    audio.stopAllLoops(0.2);
    this.entity.hide();
    this.clown.hide();
    this.esquecido.hide();
    this.pale.hide();
    this.echoes.clear();
    this.ui.sheetPress(0);
    this.flags = JSON.parse(JSON.stringify(d.flags));
    this.inventory = new Inventory();
    d.inv.forEach((i) => this.inventory.add(i));
    this.notes = d.notes || [];
    this.rules = d.rules || [];
    this.phone.battery = d.phone.battery;
    this.phone.apps = { ...d.phone.apps };
    this.phone.threads = d.phone.threads || [];
    this.phone.gallery = d.phone.gallery || [];
    this.phone.flashlight = !!d.phone.flashlight;
    if (this.phone.radioOn) this.phone.toggleRadio(false);
    this.clockMin = d.clock;
    this.time = d.time || 0;
    this.deaths = d.deaths || 0;
    this.tv.set('off');
    this.cctvOn = false;
    if (this.player.hidden) this.player.exitHide();
    this.rebuildWorld();
    this.player.teleport(d.player.x, d.player.z, d.player.yaw);
    this.checkpointData = d;
    this.ui.fade(1, 0).then(() => this.ui.fade(0, 1.2));
    this.story.load(d.story || {}, d.id);
    this.resumePointer(true);
  }

  // ------------------------------------------------------------ eventos do mundo
  noise(x, z, r) { this.entity.hear(x, z, r); }

  async caught(fromHide) {
    if (this._dying) return;
    this._dying = true;
    this.cutscene = true;
    const e = this.entity;
    const lvl = settings.scare;
    if (this.player.hidden) this.player.exitHide();
    // o rosto na frente da câmera
    const cam = this.camera;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    e.model.visible = true;
    vis(e.model, 'ecv');
    e.place(cam.position.x + fwd.x * 0.55, cam.position.z + fwd.z * 0.55, Math.atan2(fwd.x, fwd.z));
    e.model.position.y = cam.position.y - 2.3;
    e.state = 'static';
    if (lvl > 0) {
      audio.play('stinger', { v: lvl === 2 ? 1 : 0.5 });
      this.player.shake(lvl === 2 ? 1.2 : 0.5);
      this.post.uniforms.glitch.value = 1;
      this.ui.flash(lvl === 2 ? 0.7 : 0.3, 0.25, '#fff');
      await this.wait(lvl === 2 ? 0.9 : 0.5, true);
    } else { audio.play('boom', { v: 0.6 }); }
    await this.ui.fade(1, 0.15);
    e.hide();
    this.post.uniforms.glitch.value = 0;
    this.deaths++;
    const deaths = this.deaths;
    this.ui.say('', '*A casa esquece o que aconteceu. Você não.*', 2.6);
    await this.wait(1.6, true);
    this._dying = false;
    this.loadCheckpoint();
    this.deaths = deaths;
    if (this.checkpointData) this.checkpointData.deaths = deaths;
  }

  // pego pelo Morador de Antes: a mão com o olho vem direto no seu rosto
  async caughtByPale(fromHide) {
    if (this._dying) return;
    this._dying = true;
    this.cutscene = true;
    const lvl = settings.scare;
    const p = this.pale;
    if (this.player.hidden) this.player.exitHide();
    this.ui.sheetPress(0);
    const cam = this.camera;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); fwd.y = 0; fwd.normalize();
    // ele, bem na frente, curvado
    p.state = 'static';
    p.place(cam.position.x + fwd.x * 1.05, cam.position.z + fwd.z * 1.05, Math.atan2(fwd.x, fwd.z));
    p.setPose('lunge', true);
    p.setEyes(true, 1); p.eyes = 1;
    p.model.visible = true;
    vis(p.model, 'ecv');
    // a mão (cópia) grudada na câmera
    const hand = this._paleHand || (this._paleHand = (() => {
      const m = buildPale().userData.hands[1];
      const h = m.hand;
      h.parent && h.parent.remove(h);
      h.scale.set(-2.2, 2.2, 2.2);
      m.eye.upper.rotation.x = 1.35; m.eye.lower.rotation.x = -1.35;
      m.fingers.forEach((f, fi) => { if (!f.thumb) f.base.rotation.z = (fi - 1.5) * 0.12; f.segs.forEach((sg) => { sg.rotation.x = 0.12; }); });
      h.traverse((o) => { o.layers.enableAll(); o.castShadow = false; o.frustumCulled = false; });
      return h;
    })());
    cam.add(hand);
    hand.visible = true;
    hand.rotation.set(Math.PI + 0.15, 0, 0.1); // dedos pra cima, palma (e o olho) pra você
    const from = new THREE.Vector3(0.35, -1.0, -0.8), to = new THREE.Vector3(0.0, -0.15, -0.31);
    // luz de preenchimento: a mão e o rosto dele aparecem mesmo no escuro
    this.flashL.position.copy(cam.position).addScaledVector(fwd, 0.05);
    this.flashL.position.y += 0.1;
    this.flashL.intensity = 5; this.flashL.distance = 3.5; this.flashT = 1.6;
    hand.position.copy(from);
    audio.play('pale_shriek', { v: 1.1 });
    if (lvl > 0) {
      audio.play('stinger', { v: lvl === 2 ? 1 : 0.5 });
      this.player.shake(lvl === 2 ? 1.1 : 0.45);
      this.post.uniforms.glitch.value = 0.6;
      this.ui.flash(lvl === 2 ? 0.55 : 0.25, 0.25, '#fff');
    } else audio.play('boom', { v: 0.6 });
    const steps = lvl === 0 ? 6 : 9;
    for (let i = 1; i <= steps; i++) { hand.position.lerpVectors(from, to, 1 - Math.pow(1 - i / steps, 3)); await this.wait(0.022, true); }
    audio.play('pale_click', { v: 1.2 });
    audio.speak('você não é ela', { pitch: 0.25, rate: 0.6, vol: 0.9 });
    this.ui.say('O Morador de Antes', '...você não é ela.', 1.6, 'enemy');
    await this.wait(lvl === 2 ? 1.1 : 0.7, true);
    await this.ui.fade(1, 0.15);
    cam.remove(hand);
    this.post.uniforms.glitch.value = 0;
    p.hide();
    this.deaths++;
    const deaths = this.deaths;
    this.ui.say('', '*Você virou uma coisa perdida. Mas a casa te acha de novo.*', 2.8);
    await this.wait(1.8, true);
    this._dying = false;
    this.loadCheckpoint();
    this.deaths = deaths;
    if (this.checkpointData) this.checkpointData.deaths = deaths;
  }

  flashLight(dur) {
    const cam = this.camera;
    this.flashL.position.copy(cam.position);
    this.flashL.intensity = 30;
    this.flashT = dur;
  }

  // espera em tempo de jogo (respeita pausa). real=true ignora pausa
  wait(sec, real = false) {
    return new Promise((res) => {
      if (real) { setTimeout(res, sec * 1000 * (this.ui.fast ? 0.02 : 1)); return; }
      this._waits = this._waits || [];
      this._waits.push({ t: sec, res, token: this.story.token });
    });
  }

  clockText() { const m = Math.floor(this.clockMin) % (24 * 60); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }

  usePowerbank() {
    if (!this.inventory.has('powerbank')) return;
    this.inventory.remove('powerbank');
    this.phone.battery = Math.min(100, this.phone.battery + 60);
    audio.play('record_beep');
    this.ui.toast('Celular carregado com a bateria portátil.');
  }

  // ------------------------------------------------------------ teclado
  onKey(code) {
    if (this.state !== 'playing') return;
    if (code === 'Escape') { this.pause(); return; }
    if (this.ui.paused) return;
    if (code === 'KeyE') this.interact();
    if (this.cutscene && !this.allowPhoneInCutscene) return;
    if (code === 'KeyF') this.phone.toggleFlashlight();
    if (code === 'Tab') { if (!this.cutscene) this.ui.openPhone('home'); }
    if (code === 'KeyI') this.ui.openInventory();
    if (code === 'KeyJ') this.ui.openJournal();
    if (code === 'KeyH') this.story.hint();
    if (code === 'KeyR') this.phone.toggleRadio();
  }

  interact() {
    if (this.cutscene && !this.allowInteractInCutscene) return;
    if (this.player.hidden) { if (!this.story.blockExitHide) this.player.exitHide(); return; }
    if (this.story.customInteract && this.story.customInteract()) return;
    const it = this.hover;
    if (!it) return;
    if (this.story.interact(it.id, it) === true) return;
    if (it.kind === 'hide') {
      const h = this.world.hides.find((x) => x.id === it.id);
      if (h) { this.story.onHide && this.story.onHide(h); this.player.hideIn(h); }
      return;
    }
    if (it.action) it.action();
  }

  updateHover() {
    if (this.player.hidden || (this.cutscene && !this.allowInteractInCutscene) || this.phone.raised) { this.hover = null; this.ui.prompt(this.player.hidden ? (this.story.blockExitHide ? null : 'Sair do esconderijo') : null); return; }
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    this.raycaster.far = 3;
    const roots = [...this.world.sections.values()].map((s) => s.group);
    for (const r of roots) r.updateMatrixWorld();
    const hits = this.raycaster.intersectObjects(roots, true);
    let found = null;
    for (const hh of hits) {
      let o = hh.object;
      if (!o.visible) continue;
      let it = null;
      while (o && !it) { it = this.world.meshToInteract.get(o); if (!it) o = o.parent; }
      if (it) {
        let vis2 = true; let p = hh.object;
        while (p) { if (!p.visible) { vis2 = false; break; } p = p.parent; }
        if (!vis2) continue;
        if (hh.distance <= (it.dist || 2.3)) found = it;
        break;
      }
      if (hh.object.material && hh.object.material.visible === false) continue;
      if (hh.object.material && hh.object.material.transparent && hh.object.material.opacity < 0.5) continue;
      break;
    }
    let text = null;
    if (found) {
      const sp = this.story.prompt(found.id, found);
      text = sp !== undefined ? sp : found.prompt ? found.prompt() : 'Examinar';
      if (!text) found = null;
    }
    this.hover = found;
    this.ui.prompt(text);
  }

  // ------------------------------------------------------------ luzes
  updateLights(dt) {
    const P = this.player.pos;
    const eye = this.player.eye;
    const room = this.world.roomAt(P.x, P.z);
    const fx = this.world.fixtures;
    for (const f of fx) {
      const target = f.on ? 1 : 0;
      f.level += (target - f.level) * Math.min(1, dt * (f.on ? 3 : 6));
      let fl = 1;
      if (f.flicker > 0) { f.flicker -= dt; fl = Math.random() < 0.35 ? 0.05 : Math.random() < 0.5 ? 0.6 : 1; }
      f.fl = fl;
      const visible = f.room === room || !this.world.losBlocked(eye.x, eye.z, f.x, f.z);
      f.seen = (f.seen || 0) + ((visible ? 1 : 0) - (f.seen || 0)) * Math.min(1, dt * 5);
      if (f.bulb) f.bulb.color.setRGB(0.15 + 0.85 * f.level * fl, 0.13 + 0.82 * f.level * fl, 0.12 + 0.75 * f.level * fl);
    }
    const cand = fx.filter((f) => f.level * f.intensity > 0.01 && f.seen > 0.02)
      .map((f) => ({ f, s: Math.hypot(f.x - P.x, f.z - P.z) - (f.room === room ? 3 : 0) - (f.priority || 0) }))
      .sort((a, b) => a.s - b.s).slice(0, POOL);
    for (let i = 0; i < POOL; i++) {
      const l = this.pool[i];
      const c = cand[i];
      if (!c) { l.intensity = 0; continue; }
      const f = c.f;
      l.position.set(f.x, f.y, f.z);
      l.color.copy(f.color);
      l.distance = f.dist;
      l.intensity = f.intensity * f.level * f.fl * f.seen * this.lightMul;
    }
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.flashL.intensity = 0; }
  }
  fixture(id) { return this.world.fixtures.find((f) => f.id === id); }
  setLight(id, on, flicker = 0) { const f = this.fixture(id); if (f) { f.on = on; if (flicker) f.flicker = flicker; } }
  get lightMul() { return this._lightMul === undefined ? 1 : this._lightMul; }
  set lightMul(v) { this._lightMul = v; }

  // ------------------------------------------------------------ loop
  loop(now) {
    requestAnimationFrame((t) => this.loop(t));
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = clamp(dt, 0, 0.05);
    const paused = this.ui.paused || this.state !== 'playing';
    if (!paused && !this.testMode) this.update(dt);
    else if (this.state === 'menu') { this.time += dt; this.player.yaw += dt * 0.02; this.player.apply(); }
    this.render(dt, paused);
    this.input.endFrame();
  }

  update(dt) {
    this.time += dt;
    if (!this.cutscene) this.clockMin += dt / 45;
    // esperas
    if (this._waits && this._waits.length) {
      const done = [];
      for (const w of this._waits) { w.t -= dt; if (w.t <= 0) done.push(w); }
      if (done.length) { this._waits = this._waits.filter((w) => !done.includes(w)); done.forEach((w) => w.res()); }
    }
    this.player.update(dt);
    this.phone.update(dt);
    for (const fn of this.world.updaters) fn(dt);
    this.entity.update(dt);
    this.pale.update(dt);
    this.clown.update(dt);
    this.echoes.update(dt);
    this.esquecido.update(dt);
    this.cats.bento.update(dt);
    this.cats.lili.update(dt);
    this.updateHover();
    if (this.input.lclick && !this.phone.raised && !this.player.hidden && (this.hover || this.story.customPrompt)) this.interact();
    this.updateCharging(dt);
    this.story.update(dt);
    this.updateLights(dt);
    this.tv.update(dt);
    // rádio
    const prox = this.entity.proximity();
    if (this.phone.radioOn && this.phone.radioLoop) { const lv = Math.min(1, prox * 1.3 + (this.story.radioExtra || 0)); this.phone.radioLoop.set('level', lv); this.ui.radio(lv); }
    const fearProx = Math.max(prox, this.pale.proximity());
    this.fear += (fearProx - this.fear) * Math.min(1, dt * 2);
    if (this.heart) this.heart.set('rate', 1 + this.fear * 1.8);
    // respiração presa
    this.ui.breath(this.player.breath, !!this.player.hidden && (this.fear > 0.35 || this.player.breath < 1));
    this.ui.stamina(this.player.stamina);
    // ventiladores girando
    const fan = this.world.get('fan_sala'); if (fan) fan.blades.rotation.y += dt * (this.flags.fanSpeed === undefined ? 5 : this.flags.fanSpeed);
    const fan2 = this.world.get('fan_pais'); if (fan2) fan2.blades.rotation.y += dt * (this.flags.fanPais || 0);
    audio.updateListener(this.camera);
  }

  updateCharging(dt) {
    const it = this.hover;
    const at = it && it.id && it.id.startsWith('socket');
    if (at && this.inventory.has('carregador') && this.input.key('KeyE') && !this.cutscene) {
      this.phone.charge(dt);
      this.chargeHold += dt;
      if (this.chargeHold > 0.3) this.ui.prompt(`Carregando... ${Math.round(this.phone.battery)}%`);
      if (this.story.onCharge) this.story.onCharge(dt);
    } else this.chargeHold = 0;
  }

  render(dt, paused) {
    const u = this.post.uniforms;
    u.time.value += dt;
    // corpo da protagonista (reflexos / CCTV)
    const b = this.body;
    const P = this.player.pos;
    b.visible = this.state === 'playing' && !this.player.hidden;
    // o reflexo começa a se atrasar conforme a casa muda
    this._poseHist = this._poseHist || [];
    this._poseHist.push({ t: this.time, x: P.x, y: P.y + (this.player.eyeH < 1.0 ? -0.5 : 0), z: P.z, yaw: this.player.yaw });
    while (this._poseHist.length > 90) this._poseHist.shift();
    const lag = (this.flags.act || 1) >= 3 ? 0.7 : (this.flags.act || 1) === 2 ? 0.25 : 0;
    let pose = this._poseHist[this._poseHist.length - 1];
    if (lag > 0) for (let i = this._poseHist.length - 1; i >= 0; i--) { if (this.time - this._poseHist[i].t >= lag) { pose = this._poseHist[i]; break; } }
    b.position.set(pose.x, pose.y, pose.z);
    b.rotation.y = pose.yaw + Math.PI;
    const bu = b.userData;
    const sw = this.player.moving ? Math.sin(this.player.bob * 1.5) * 0.5 : 0;
    bu.lL.rotation.x = sw; bu.lR.rotation.x = -sw; bu.aL.rotation.x = -sw * 0.6;
    bu.aR.rotation.x = this.phone.raised ? -1.4 : sw * 0.6;
    bu.phone.visible = this.phone.raised;
    bu.head.rotation.x = -this.player.pitch * 0.5;

    // camadas conforme o modo do celular
    const cam = this.camera;
    cam.layers.disableAll();
    if (this.phone.raised) {
      if (this.phone.mode === 'video') { cam.layers.enable(L.VIDEO); cam.layers.enable(L.SPIRIT); }
      else { cam.layers.enable(L.EYE); cam.layers.enable(L.SPIRIT); cam.layers.enable(L.CAMONLY); }
    } else cam.layers.enable(L.EYE);
    if (this.story.extraLayers) for (const l of this.story.extraLayers) cam.layers.enable(l);

    // pós-processamento
    const raised = this.phone.raised;
    const act = this.flags.act || 1;
    u.mode.value = raised ? (this.phone.mode === 'video' ? 2 : 1) : 0;
    u.scan.value = raised ? (this.phone.mode === 'video' ? 1 : 0.5) : (this.story.scan || 0);
    u.fisheye.value = raised ? 0.12 : 0;
    u.bright.value = raised ? 0.02 : 0;
    u.grain.value = 0.045 + this.fear * 0.08 + (raised ? 0.04 : 0);
    u.chroma.value = 0.5 + this.fear * 2.5 + (this.story.chroma || 0);
    u.vignette.value = 0.7 + this.fear * 0.3 + (this.player.hidden ? 0.2 : 0);
    u.desat.value = 0.08 + (act >= 2 ? 0.12 : 0) + this.fear * 0.2;
    const tint = this.story.tint || (act === 3 ? [1.08, 0.9, 0.88] : act === 2 ? [0.95, 0.98, 1.04] : [1.03, 1.0, 0.95]);
    u.tint.value.setRGB(tint[0], tint[1], tint[2]);
    u.warp.value = Math.max(0, (this.story.warp || 0));
    if (!this._dying) u.glitch.value = Math.max(this.story.glitch || 0, this.fear > 0.7 ? (this.fear - 0.7) * 0.6 : 0);
    u.exposure.value = this.story.exposure || 1.0;
    this.player.cam.updateMatrixWorld();

    // CCTV da TV
    if (this.cctvOn) {
      const r = this.renderer;
      r.setRenderTarget(this.cctvRT);
      r.clear();
      r.render(this.scene, this.cctvCam);
      r.setRenderTarget(null);
    }
    this.post.render(this.scene, cam);
    if (this.phone.pendingPhoto) this.phone.capture(this.renderer.domElement);
    this.ui.viewfinder(raised ? this.phone.mode : null, raised ? this.story.viewfinderData() : null);
  }

  // ------------------------------------------------------------ ambiente sonoro
  startAmbience(kind = 'house') {
    this.stopAmbience();
    const add = (l) => { if (l) this.ambience.push(l); return l; };
    if (kind === 'antes') {
      // o apartamento de antes: quarto abafado, o relógio de pé embaixo do lençol, o prédio muito longe
      add(audio.loop('roomtone', { bus: 'amb', vol: 0.6 }));
      add(audio.loop('clock', { bus: 'amb', pos: [205.72, 1.6, 0.3], vol: 0.9, ref: 1, rolloff: 1.2 }));
      add(audio.loop('drone', { bus: 'amb', vol: 0.3, base: 38.9, cut: 200, dark: true }));
      this.heart = add(audio.loop('heart', { bus: 'sfx', vol: 0.0 }));
      return;
    }
    add(audio.loop('roomtone', { bus: 'amb', vol: 0.5 }));
    add(audio.loop('city', { bus: 'amb', pos: [2.1, 1.2, -1.6], vol: 0.8, ref: 2, rolloff: 0.8 }));
    add(audio.loop('fridge', { bus: 'amb', pos: [-0.55, 0.8, 4.4], vol: 0.8, ref: 0.8, rolloff: 1.6 }));
    add(audio.loop('fan', { bus: 'amb', pos: [2.1, 2.3, 3.2], vol: 0.6, ref: 1, rolloff: 1.4 }));
    add(audio.loop('clock', { bus: 'amb', pos: [-0.1, 2.0, 5.0], vol: 0.7, ref: 0.7, rolloff: 1.8 }));
    if (kind === 'act2') add(audio.loop('drone', { bus: 'amb', vol: 0.35, base: 43.6, cut: 220 }));
    if (kind === 'act3') { add(audio.loop('drone', { bus: 'amb', vol: 0.5, base: 36.7, cut: 260, dark: true })); add(audio.loop('whispers', { bus: 'amb', vol: 0.25, v: 0.5 })); }
    this.heart = kind === 'act3' || kind === 'act2' ? add(audio.loop('heart', { bus: 'sfx', vol: 0.0 })) : null;
  }
  stopAmbience() { this.ambience.forEach((l) => l.stop(0.6)); this.ambience = []; this.heart = null; }
}

// ------------------------------------------------------------------ tela da TV
class TVScreen {
  constructor(game) {
    this.game = game;
    this.c = document.createElement('canvas');
    this.c.width = 512; this.c.height = 288;
    this.ctx = this.c.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.c);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false });
    this.mode = 'off';
    this.drawFn = null;
    this.t = 0;
    this.loop = null;
  }
  set(mode, drawFn) {
    this.mode = mode;
    this.drawFn = drawFn || null;
    const w = this.game.world;
    const screen = w.get('tv_screen');
    const mir = w.get('tv_mirror');
    const glow = this.game.fixture('tv_glow');
    if (!screen) return;
    if (mode === 'off') {
      screen.material = this._offMat || (this._offMat = screen.material);
      if (mir) mir.visible = true;
      if (glow) { glow.on = false; glow.intensity = 0; }
      if (this.loop) { this.loop.stop(0.2); this.loop = null; }
      this.game.cctvOn = false;
    } else {
      if (!this._offMat) this._offMat = screen.material;
      if (mir) mir.visible = false;
      if (mode === 'cctv') { this.cctvMat = this.cctvMat || new THREE.MeshBasicMaterial({ map: this.game.cctvRT.texture, toneMapped: false }); screen.material = this.cctvMat; this.game.cctvOn = true; }
      else { screen.material = this.mat; this.game.cctvOn = false; }
      if (glow) { glow.on = true; glow.intensity = 2.2; }
      if (mode === 'static' && !this.loop) this.loop = audio.loop('static', { pos: [0.3, 1.4, 2.8], vol: 0.35 });
      if (mode !== 'static' && this.loop) { this.loop.stop(0.2); this.loop = null; }
    }
  }
  update(dt) {
    if (this.mode === 'off' || this.mode === 'cctv') return;
    this.t += dt;
    const x = this.ctx, w = 512, h = 288;
    if (this.mode === 'static' || (this.mode === 'canvas' && !this.drawFn)) {
      const img = x.createImageData(w / 2, h / 2);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      x.putImageData(img, 0, 0);
      x.drawImage(this.c, 0, 0, w / 2, h / 2, 0, 0, w, h);
    } else if (this.drawFn) {
      this.drawFn(x, w, h, this.t);
    }
    this.tex.needsUpdate = true;
    const glow = this.game.fixture('tv_glow');
    if (glow) glow.intensity = 1.6 + Math.random() * 0.8;
  }
}
