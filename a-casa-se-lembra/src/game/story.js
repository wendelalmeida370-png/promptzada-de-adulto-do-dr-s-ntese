// Roteiro: núcleo, utilidades e ATO 1 — "A casa conhecida".
import * as THREE from 'three';
import { audio } from '../core/audio.js';
import { names, settings, T } from '../core/settings.js';
import { clamp, angleDiff, norm, rand } from '../core/util.js';
import { L, vis } from '../world/layers.js';
import { box, plane, group, std, basic } from '../world/geom.js';
import * as P from '../world/props.js';
import { EYE } from './player.js';
import { ITEMS } from './items.js';
import { act2, wireDresser } from './act2.js';
import { act3 } from './act3.js';
import { OBJ } from './objectives.js';

export const ABORT = Symbol('abort');

export class Story {
  constructor(game) {
    this.g = game;
    this.token = 0;
    this.phase = 'none';
    this.objId = null;
    this.hintLvl = 0;
    this.hintAt = 0;
    this.stuckT = 0;
    this.warp = 0; this.glitch = 0; this.chroma = 0; this.scan = 0; this.tint = null; this.exposure = 1;
    this.t = 0;
    this.timers = [];
    this.customPrompt = null;
  }
  get F() { return this.g.flags; }

  // ------------------------------------------------------------ utilidades
  run(fn) {
    const tk = this.token;
    const ctx = {
      wait: async (s) => { await this.g.wait(s); if (tk !== this.token) throw ABORT; },
      say: async (who, text, o = {}) => { this.voice(text, o); await this.g.ui.say(who, text, o.dur, o.kind || ''); if (tk !== this.token) throw ABORT; },
      alive: () => tk === this.token,
      check: () => { if (tk !== this.token) throw ABORT; },
    };
    return fn(ctx).catch((e) => { if (e !== ABORT) { console.error(e); this.cut(false); } });
  }
  voice(text, o) {
    if (!o.tts) return;
    const clean = T(text).replace(/\*/g, '');
    const v = o.tts;
    if (v === 'mae') audio.speak(clean, { pitch: 1.05, rate: 0.9, female: true, vol: o.vol || 0.8 });
    else if (v === 'inq') audio.speak(clean, { pitch: 0.1, rate: 0.7, vol: 1 });
    else if (v === 'pai') audio.speak(clean, { pitch: 0.55, rate: 0.8, vol: 0.9 });
    else if (v === 'julia') audio.speak(clean, { pitch: 1.35, rate: 0.85, female: true, vol: 0.6 });
    else if (v === 'tv') audio.speak(clean, { pitch: 0.75, rate: 0.82, vol: 0.9 });
    else if (v === 'wendel') audio.speak(clean, { pitch: 0.95, rate: 1.0, vol: 0.9 });
  }
  cut(on, opts = {}) {
    this.g.cutscene = on;
    this.g.player.moveLock = on;
    this.g.player.lookLock = on && !opts.look;
    if (on && this.g.phone.raised) this.g.phone.raised = false;
  }
  after(sec, fn) { const tk = this.token; this.timers.push({ t: sec, fn, tk }); }
  toast(t, d) { this.g.ui.toast(t, d); }
  // mensagem do "Wendel" das 3h
  msg(text, o = {}) { this.g.phone.receive('wendel', '{wendel} 🖤', text, { glitch: o.glitch, time: o.time }); this.F.lastMsgAt = this.t; }
  note(id, title, body, o = {}) {
    if (!this.g.notes.find((n) => n.id === id)) this.g.notes.push({ id, title, body, where: o.where || '', style: o.style });
    if (o.show !== false) return this.g.ui.note(title, body, { style: o.style });
    return Promise.resolve();
  }
  rule(id, text) {
    const k = 'rule_' + id;
    if (this.F[k]) return;
    this.F[k] = true;
    this.g.rules.push(text);
    this.toast('Regra anotada no diário (J)', 2.2);
  }
  give(id, silent = false) {
    this.g.inventory.add(id);
    audio.play('pickup');
    if (!silent) this.toast('Pegou: ' + T(ITEMS[id].name) + '\n(I para ver a mochila)', 2.8);
  }
  take(id) { this.g.inventory.remove(id); }
  has(id) { return this.g.inventory.has(id); }
  objective(id, silent = false) {
    this.objId = id;
    this.hintLvl = 0;
    this.hintAt = 0;
    this.stuckT = 0;
    this._nudged = false;
    if (!silent) this.g.ui.setObjective(this.objectiveText());
  }
  objectiveText() {
    const o = OBJ[this.objId];
    if (!o) return '';
    return typeof o.text === 'function' ? o.text(this) : o.text;
  }
  statusLines() { const o = OBJ[this.objId]; return o && o.status ? o.status(this) : []; }
  hint() {
    const o = OBJ[this.objId];
    if (!o) { this.toast('Nenhuma dica agora.'); return; }
    const list = typeof o.hints === 'function' ? o.hints(this) : o.hints;
    if (!list || !list.length) { this.toast('Explore. Olhe pelo celular (botão direito).'); return; }
    const wait = this.hintLvl === 0 ? 0 : 35;
    if (this.hintLvl > 0 && this.t - this.hintAt < wait && this.hintLvl < list.length) {
      this.g.ui.hint(this.hintLvl, list[this.hintLvl - 1] + `\n(próxima dica em ${Math.ceil(wait - (this.t - this.hintAt))}s)`);
      return;
    }
    this.hintLvl = Math.min(list.length, this.hintLvl + 1);
    this.hintAt = this.t;
    this.g.ui.hint(this.hintLvl, list[this.hintLvl - 1]);
  }
  progress() { this.stuckT = 0; }

  // porcentagem de "igualdade" entre a casa e o vídeo (o que o Inquilino precisa)
  sim() {
    const F = this.F;
    let s = 87;
    if (F.paintingMode === 'floor') s += 3;
    s += 2 * ['d_bike', 'd_fotos', 'd_lencol', 'd_cadeira', 'd_toalha'].filter((k) => F[k]).length;
    if (F.invited) s += 3;
    if (F.corridorLong) s -= 2;
    if (F.power) s += 2;
    s -= 3 * this.familyCount();
    if (F.paintingMode === 'upside') s -= 9;
    if (F.nameWritten) s -= 9;
    if (F.keysHung) s -= 10;
    return clamp(s, 40, 99);
  }
  familyCount() { const F = this.F; return ['juliaFound', 'momFound', 'dadFound', 'pedroFound'].filter((k) => F[k]).length; }
  fixCount() { const F = this.F; return (F.paintingMode === 'floor' || F.fixedQuadro ? 1 : 0) + ['d_bike', 'd_fotos', 'd_lencol', 'd_cadeira', 'd_toalha'].filter((k) => F[k]).length; }

  // ------------------------------------------------------------ ciclo de vida
  start() {
    this.abort();
    this.phase = 'intro';
    this.F.act = 1;
    this.run((s) => this.intro(s));
  }
  abort() {
    this.token++;
    this.g._waits = [];
    this.timers = [];
    this.cut(false);
    this.customPrompt = null;
    this.warp = this.glitch = this.chroma = this.scan = 0;
    this.tint = null; this.exposure = 1;
    this.extraLayers = null;
    this.blockExitHide = false;
    this.g.allowPhoneInCutscene = false;
    this.g.allowInteractInCutscene = false;
    this.g.lightMul = 1;
    this.g.ui.clearSubs();
    this.g.player.speedMul = 1;
  }
  save() { return { phase: this.phase, objId: this.objId, t: this.t }; }
  load(d, cpId) {
    this.phase = d.phase || 'a1';
    this.t = d.t || 0;
    this._prevZones = [];
    this.objId = d.objId;
    this.resume(cpId);
  }

  // prepara atores/luzes/áudio para o estado atual e retoma a fase
  resume() {
    const g = this.g, F = this.F;
    g.player.eyeH = EYE;
    g.player.moveLock = false;
    g.player.lookLock = false;
    this.setupLights();
    this.setupActors();
    g.startAmbience(F.act === 3 ? 'act3' : F.act === 2 ? 'act2' : 'house');
    if (!F.power && F.act === 2) this.powerAmbience(false);
    audio.music(null);
    if (this.objId) this.objective(this.objId);
    const r = this['resume_' + this.phase];
    if (r) r.call(this);
  }

  setupLights() {
    const g = this.g, F = this.F;
    const all = g.world.fixtures;
    for (const f of all) { f.level = 0; f.flicker = 0; }
    const on = (id, v = true) => { const f = g.fixture(id); if (f) { f.on = v; f.level = v ? 1 : 0; } };
    all.forEach((f) => { if (!['tv_glow', 'fridge_light', 'laptop_glow', 'shower_steam'].includes(f.id)) f.on = false; });
    if (F.act === 1) {
      ['sala', 'cozinha', 'corredor1', 'varanda', 'servico'].forEach((id) => on(id));
      if (F.corridorLong) on('corredor2');
      if (F.lightsRoxo) on('roxo');
    } else if (F.act === 2) {
      on('varanda');
      if (F.power) ['sala', 'entrada', 'cozinha', 'servico', 'corredor1', 'corredor2', 'banheiro', 'roxo', 'meninos', 'pais'].forEach((id) => on(id));
      if (F.hunt3Done || F.pedroFound) on('corredor2', false);
    } else if (F.act >= 3) {
      ['varanda', 'sala', 'cozinha', 'corredor1', 'banheiro', 'roxo', 'pais', 'servico'].forEach((id) => on(id));
      ['sala', 'corredor1'].forEach((id) => { const f = g.fixture(id); if (f) f.intensity *= 0.6; });
      const v = g.fixture('varanda'); if (v) { v.color.set(0xd05040); v.intensity = 2.2; }
    }
    ['extra', 'porao1', 'porao2', 'porao_escada', 'lamppost'].forEach((id) => on(id));
    g.flags.fanSpeed = F.act === 1 ? 5 : F.power ? 3 : 0;
  }

  setupActors() {
    const g = this.g, F = this.F;
    g.echoes.clear();
    g.clown.hide();
    g.esquecido.hide();
    g.entity.hide();
    const { bento, lili } = g.cats;
    bento.setVisible(true);
    bento.mode = 'idle';
    if (F.act === 1) {
      if (F.fedCats) { bento.place(-1.25, 7.35, Math.PI); bento.mode = 'eat'; }
      else bento.place(2.7, 6.9, 0.8);
      lili.setVisible(true); lili.place(4.72, 4.9, Math.PI / 2); lili.mode = 'hide';
    } else {
      bento.place(-0.9, 6.6, 0);
      if (F.liliFollow) { lili.setVisible(true); lili.place(g.player.pos.x + 0.6, g.player.pos.z + 0.4, 0); lili.mode = 'follow'; }
      else if (F.act === 2) { lili.setVisible(true); lili.place(0.2, 3.68, Math.PI / 2); lili.mode = 'hide'; }
      else lili.setVisible(false);
    }
    // você no vídeo, sentada no sofá (como no vídeo de verdade)
    if (F.act <= 2) {
      g.echoes.add('rafa_video', { x: 3.55, z: 3.2, yaw: -Math.PI / 2, spec: 'v', hair: 'curly', sitting: true, h: 1.5, anim: F.act === 2 ? 'look' : 'breathe', color: 0xd8e6ff, alpha: 0.75 });
    }
    if (F.act === 2) this.setupFamilyEchoes();
    if (F.act === 2 && F.dadFound === undefined && F.power) { /* o Esquecido surge ao entrar no quarto */ }
  }

  powerAmbience(on) {
    for (const l of this.g.ambience) if (['fridge', 'fan', 'clock'].includes(l.name)) l.setVol(on ? l.vol || 0.7 : 0, 0.2);
  }

  afterBuild() {
    const g = this.g, w = g.world, F = this.F;
    wireDresser(this);
    // hall do prédio: escuro e fechado
    w.addTo('sala', (grp) => { box(grp, 1.2, 2.3, 0.3, basic('#000000'), 0.97, 1.15, 8.45, { cast: false }); w.collider(0.4, 1.6, 8.3, 8.6); });
    // porta que não existe: some no vídeo (o vídeo mostra parede)
    if (F.corridorLong) {
      const d = w.doors.get('porta_extra');
      if (d) vis(d.pivot, 'ecm');
      w.addTo('corredor', (grp) => { const p = plane(grp, 0.82, 2.1, std('#e9e6df'), 12.21, 1.05, 7.7, { uv: false }); vis(p, 'v'); });
    }
    // escrita no espelho do banheiro
    w.addTo('banheiro', (grp) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 360;
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const m = plane(grp, 0.48, 0.68, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }), 4.285, 1.6, 8.45, { uv: false, ry: Math.PI / 2 });
      vis(m, 'em');
      m.visible = false;
      w.name('mirror_writing', { m, c, tex });
    });
    // mensagem no espelho do guarda-roupa dos pais
    w.addTo('pais', (grp) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 512;
      const x = c.getContext('2d');
      x.strokeStyle = 'rgba(190,20,30,0.9)'; x.lineWidth = 9; x.lineCap = 'round';
      x.fillStyle = 'rgba(190,20,30,0.9)'; x.font = 'bold 58px "Comic Sans MS", cursive'; x.textAlign = 'center';
      x.fillText('NÃO', 128, 170); x.fillText('DEIXA', 128, 250); x.fillText('IGUAL', 128, 330);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const m = plane(grp, 0.9, 1.8, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }), g.layout.P + 1.8, 1.1, 5.525, { uv: false });
      vis(m, 'm');
      m.visible = false;
      w.name('wardrobe_writing', m);
      // chapéu do pai no chão (depois de ele lembrar)
      const hg = group(grp, g.layout.P + 1.5, 0.02, 6.2); hg.rotation.z = 0.1;
      P.hat(hg);
      hg.visible = false;
      w.name('hat_floor', hg);
      w.interact(hg, { id: 'hat_floor', kind: 'examine', prompt: () => 'Chapéu de palha' });
    });
  }
  afterApply() {
    const w = this.g.world, F = this.F;
    const mw = w.get('mirror_writing');
    if (mw) { mw.m.visible = !!F.nameWritten; if (F.nameWritten) this.drawMirrorName(F.nameWritten); }
    const ww = w.get('wardrobe_writing'); if (ww) ww.visible = !!F.dadFound;
    const hf = w.get('hat_floor'); if (hf) hf.visible = !!F.dadFound && !F.hasDadKey;
    const bm = w.get('bath_mirror'); if (bm) bm.fog = F.showerOn || F.nameWritten ? 0.75 : 0;
    const d = w.doors.get('porta_extra'); if (d && F.extraUnlocked && F.act >= 2) d.locked = false;
    const egg = w.get('egg_watch'); if (egg) egg.visible = !this.has('relogio_ovo');
  }
  drawMirrorName(text) {
    const mw = this.g.world.get('mirror_writing');
    if (!mw) return;
    const x = mw.c.getContext('2d');
    x.clearRect(0, 0, 256, 360);
    x.strokeStyle = 'rgba(255,255,255,0.85)'; x.fillStyle = 'rgba(255,255,255,0.85)';
    x.font = 'bold 44px "Comic Sans MS", cursive'; x.textAlign = 'center';
    const words = String(text).toUpperCase().slice(0, 24).split(' ');
    words.forEach((wd, i) => x.fillText(wd, 128, 150 + i * 52 - (words.length - 1) * 26));
    x.font = '28px "Comic Sans MS", cursive';
    x.fillText('MORA AQUI', 128, 300);
    mw.tex.needsUpdate = true;
  }

  // ------------------------------------------------------------ atualização
  update(dt) {
    const g = this.g, F = this.F;
    this.t += dt;
    this.stuckT += dt;
    if (this.timers.length) {
      const due = this.timers.filter((t) => (t.t -= dt) <= 0);
      if (due.length) { this.timers = this.timers.filter((t) => !due.includes(t)); due.forEach((t) => { if (t.tk === this.token) t.fn(); }); }
    }
    if (this.stuckT > 300 && !this._nudged && this.objId) { this._nudged = true; this.toast('Travou? Aperte H para uma dica.', 4); }
    // zonas
    const p = g.player.pos;
    const zones = g.world.zonesAt(p.x, p.z);
    this.zones = zones;
    const prev = this._prevZones || [];
    for (const z of zones) if (!prev.includes(z)) this.onEnter(z);
    this._prevZones = zones;
    // escada impossível: passagem entre o apartamento e a memória da casa
    if (F.stairsOpen && p.x > 11.1 && p.x < 13.3 && p.z > 9.7 && p.z < 10.6) { g.player.pos.x += 100; this.onEnter('descida'); }
    else if (p.x > 111.1 && p.x < 113.3 && p.z < 9.4 && p.z > 7.7) { g.player.pos.x -= 100; this.onEnter('subida'); }
    this.customPrompt = null;
    const fn = this['update_' + this.phase];
    if (fn) fn.call(this, dt);
    this.updateAct(dt);
    if (this.customPrompt) g.ui.prompt(this.customPrompt);
    // efeitos que decaem
    this.warp = Math.max(0, this.warp - dt * 0.4);
  }

  updateAct(dt) {
    const g = this.g, F = this.F;
    // gatos: o Bento sibila para o Inquilino quando ele está perto
    const b = g.cats.bento;
    if (g.entity.model.visible && b.enabled) {
      const d = Math.hypot(g.entity.pos.x - b.pos.x, g.entity.pos.z - b.pos.z);
      if (d < 6 && b.mode !== 'stare') { b.mode = 'stare'; b.stareAt = g.entity.pos; b.hiss(); }
    } else if (b.mode === 'stare' && !this._bentoStareFixed) b.mode = 'idle';
    // sons da casa (silêncios e estalos)
    this._creakT = (this._creakT || rand(20, 40)) - dt;
    if (this._creakT < 0 && g.state === 'playing' && !g.cutscene) {
      this._creakT = rand(25, 60) / (F.act || 1);
      const rooms = [[2, 4], [8.7, 7.2], [5.8, 5], [-1.5, 6], [12, 7]];
      const r = rooms[Math.floor(Math.random() * rooms.length)];
      const pick = Math.random();
      if (pick < 0.5) audio.play('creak', { pos: [r[0], 2.4, r[1]], v: 0.4 });
      else if (pick < 0.7 && F.act >= 2) audio.play('knock', { pos: [r[0], 1.2, r[1]], n: 1 + Math.floor(Math.random() * 3), v: 0.4, gap: 0.5 });
      else if (pick < 0.85 && F.act >= 2) audio.play('whisper', { pos: [r[0], 1.5, r[1]], v: 0.5 });
      else audio.play('water_drip', { pos: [5.4, 1, 9.3], vol: 0.6 });
    }
    if (F.act === 1 && Math.random() < dt / 90) audio.play('car', { pos: [2, -5, -30], bus: 'amb' });
  }

  onEnter(z) {
    const fn = this['enter_' + z];
    if (fn) fn.call(this);
    const fn2 = this['enter_' + this.phase + '_' + z];
    if (fn2) fn2.call(this);
  }

  // ------------------------------------------------------------ interação
  // retorna texto do prompt, null para esconder, undefined para padrão
  prompt(id, it) {
    const t = this['prompt_' + id];
    if (t) return t.call(this, it);
    return undefined;
  }
  interact(id, it) {
    const fn = this['do_' + id];
    if (fn) { const r = fn.call(this, it); return r !== false; }
    const ex = this.examineText(id);
    if (ex) { this.g.ui.say('', ex, Math.max(3, ex.length * 0.055)); return true; }
    return false;
  }
  customInteract() {
    if (this._customAction && this.customPrompt) { this._customAction(); return true; }
    return false;
  }

  examineText(id) {
    const F = this.F, a = F.act || 1;
    const E = {
      sofa: a === 1 ? 'O sofá cinza. Ainda está quente de onde você estava deitada.' : a === 2 ? 'O sofá está frio. Como se ninguém sentasse nele há anos.' : 'O sofá tem uma marca funda no meio. Do tamanho de alguém muito alto.',
      white_table: 'A mesinha branca com a bolsa preta, o pote de tampa vermelha e a caixa plástica. Tudo no lugar de sempre.',
      bike: a === 1 ? 'A bicicleta preta de para-lamas brancos. O pneu da frente está murcho.' : 'A bicicleta está de volta. Os pedais giram devagar, sozinhos.',
      folding_chair: 'A cadeira dobrável vinho, encostada perto da porta.',
      net: F.act === 3 ? 'A lua está vermelha. Enorme. Lá embaixo, no campo iluminado, alguém está parado bem no meio do gramado, olhando pra cá.' : 'A tela de proteção por causa dos gatos. Lá embaixo, o campo de futebol está com os refletores acesos às três da manhã. O placar diz: CASA 0 x 0 VISITANTE.',
      drying_rack: 'O varal com os lençóis. Estão úmidos e frios.',
      washer: 'A máquina de lavar. Lá dentro, só roupa molhada.',
      tank: a >= 3 && !F.hasRegistro ? undefined : 'O tanque. Pinga uma gota a cada tanto.',
      toilet: 'O vaso com a tampa amarelada. A descarga faz barulho a noite toda.',
      bath_picture: 'O quadrinho pendurado no azulejo. Uma paisagem desbotada. Nunca ninguém soube quem pendurou.',
      kitchen_stool: 'O banquinho alto da cozinha.',
      kitchen_clock: 'O relógio parou em 3:33. Os ponteiros tremem, como se tentassem andar.',
      skates: 'Seus patins. Uma rodinha ainda está torta daquele tombo.',
      backpack: T('A mochila do colégio. ' + (names.escola ? 'O chaveiro diz "' + names.escola + '".' : 'Tem um trabalho pra entregar segunda.')),
      bowl_bento: F.fedCats ? 'O {bento} está comendo, fazendo barulho.' : 'O pote azul do {bento}. Vazio.',
      bowl_lili: F.fedCats ? 'O pote rosa da {lili} continua cheio. Ela não veio comer.' : 'O pote rosa da {lili}. Vazio.',
      fan: 'O ventilador de teto.',
      desk_photos: a === 1 ? 'Fotos da família na escrivaninha dos pais.' : 'As fotos dos pais... os rostos estão em branco, como papel sem nada.',
      flag: 'Uma bandeira preta com uma faixa branca atravessada. Tem um bilhete preso com fita no canto.',
      bday_photo: F.clownLooked ? 'A foto da sua festa de 5 anos. O palhaço... está olhando pra outro lado agora. Para o corredor.' : 'A foto da sua festa de 5 anos. Você e o palhaço contratado, o Tique-Taque. Você não lembra muito dele. Só que ele fazia um truque com um relógio.',
      intercom: 'O interfone. Ele só toca quando alguém está lá embaixo.',
      hat: 'O chapéu de palha do pai, pendurado junto com um colar. Ele usa quando vai pra rua.',
      rack_drawer: 'A gaveta do rack. A mãe guarda as fotos antigas aí.',
      cake: 'Cinco velinhas. As chamas estão paradas, sem tremer, como se fossem de vidro.',
      crt: 'Uma TV de tubo, igual a que tinha antes. Passando a sua festa. Em silêncio.',
      lamppost: 'Um poste de luz no meio do nada. Parece o único lugar do mundo onde nunca é tarde.',
      bucket: 'Um balde velho. Lá no fundo, em vez de água, um barulho enorme respirando, muito, muito longe no tempo.\nMelhor não mexer. Ainda não é a hora.',
      washer2: '',
      white: '',
    };
    const v = E[id];
    return v ? T(v) : null;
  }

  // ------------------------------------------------------------ câmera do celular
  onPhoneRaised() {
    if (!this.F.tutCam) { this.F.tutCam = true; this.toast('CÂMERA: clique para fotografar.\n' + (this.g.phone.apps.video ? 'Q troca para o VÍDEO (casa.mp4).' : 'A câmera vê coisas que o olho não vê.'), 4); }
  }
  onModeChange(mode) {
    if (mode === 'video' && !this.F.tutVideo) { this.F.tutVideo = true; this.toast('▶ casa.mp4: você vê a casa como o {wendel} gravou.\nProcure o que está diferente.', 4.5); }
  }
  diffs() {
    const F = this.F;
    const D = [
      { id: 'quadro', pos: [3.2, 1.2, 7.8], on: () => F.act === 1 && F.paintingMode !== 'floor', label: 'DIFERENTE: O QUADRO' },
      { id: 'bike', pos: [3.9, 0.6, 5.8], on: () => F.act === 1 && !F.d_bike, label: 'DIFERENTE: A BICICLETA' },
      { id: 'fotos', pos: [0.3, 0.72, 2.0], on: () => F.act === 1 && !F.d_fotos, label: 'DIFERENTE: AS FOTOS' },
      { id: 'lencol', pos: [2.0, 1.0, -0.45], on: () => F.act === 1 && !F.d_lencol, label: 'DIFERENTE: O LENÇOL' },
      { id: 'cadeira', pos: [1.9, 0.6, 3.0], on: () => F.act === 2 && !F.d_cadeira, label: 'DIFERENTE: A CADEIRA' },
      { id: 'toalha', pos: [4.3, 1.6, 8.45], on: () => F.act === 2 && !F.d_toalha, label: 'DIFERENTE: O ESPELHO' },
      { id: 'extra', pos: [12.21, 1.1, 7.55], on: () => F.corridorLong && F.act < 3, label: 'ISSO NÃO EXISTE NO VÍDEO' },
    ];
    return D.filter((d) => d.on());
  }
  lookingAt(pos, maxAng = 0.3, maxDist = 7) {
    const cam = this.g.camera;
    const v = new THREE.Vector3(pos[0], pos[1], pos[2]).sub(cam.position);
    const d = v.length();
    if (d > maxDist) return null;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    const ang = fwd.angleTo(v);
    if (ang > maxAng) return null;
    if (this.g.world.losBlocked(cam.position.x, cam.position.z, pos[0], pos[2])) return null;
    return { d, ang };
  }
  viewfinderData() {
    const g = this.g, F = this.F, ph = g.phone;
    const tc = (s) => { const t = Math.floor(s); return `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
    const data = { time: ph.mode === 'video' ? 'casa.mp4 ' + tc(this.t * 0.7 % 131) : g.clockText() + ' ' + tc(this.t) };
    if (ph.mode === 'video' && F.showSim) data.sim = `${Math.round(this.sim())}% igual`;
    if (ph.mode === 'video') {
      for (const d of this.diffs()) { if (this.lookingAt(d.pos, 0.28, 7)) { data.tag = d.label; break; } }
    } else {
      for (const t of this.presenceTargets()) { if (this.lookingAt(t.pos, 0.3, 8)) { data.tag = t.label; data.tagEcho = true; break; } }
    }
    if (this.recordProgress !== undefined) { data.progress = this.recordProgress; data.help = 'MANTENHA ELE NO CENTRO'; }
    if (!ph.apps.video) data.help = 'clique: foto';
    return data;
  }
  presenceTargets() {
    const out = [];
    for (const e of this.g.echoes.list.values()) {
      if (/[sk]/.test(e.f.userData.vis || e.opts.spec || '')) out.push({ pos: [e.f.position.x, 1.2, e.f.position.z], label: 'PRESENÇA' });
    }
    if (this.g.entity.model.visible && /s/.test(this.g.entity.layerSpec)) out.push({ pos: [this.g.entity.pos.x, 1.8, this.g.entity.pos.z], label: '???' });
    return out;
  }
  photoTargetsInView() {
    const F = this.F, g = this.g;
    const T0 = [
      { pos: [3.55, 1.0, 3.2], cond: () => g.phone.mode === 'video' && F.act <= 2, caption: 'Você, no vídeo, sentada no sofá.', detail: 'Você não lembra de estar no sofá quando o {wendel} gravou.' },
      { pos: [3.2, 1.2, 7.8], cond: () => F.act === 1 && F.paintingMode !== 'floor', caption: 'O quadro pendurado na parede.' },
      { pos: [2.0, 1.0, -0.45], cond: () => F.act === 1 && !F.d_lencol, caption: 'Tem alguém embaixo do lençol?' },
      { pos: [12.21, 1.1, 7.55], cond: () => F.corridorLong, caption: 'A porta que não existe.', onPhoto: () => { F.photoExtra = true; } },
      { pos: [g.clown.model.position.x, 1.7, g.clown.model.position.z], cond: () => g.clown.model.visible, caption: 'O palhaço.', detail: 'Na foto, ele está sorrindo. Ao vivo, não.' },
      { pos: [g.entity.pos.x, 1.9, g.entity.pos.z], cond: () => g.entity.model.visible, caption: 'ELE.', detail: 'A foto saiu tremida. Mas dá pra ver que ele não tem rosto: tem um chiado no lugar.' },
      { pos: [-0.55, 1.0, 5.2], cond: () => !!g.echoes.get('mae_route'), caption: 'A mãe, repetindo alguma coisa na cozinha.' },
    ];
    for (const e of g.echoes.list.values()) if (e.opts.caption) T0.push({ pos: [e.f.position.x, 1.2, e.f.position.z], cond: () => true, caption: e.opts.caption });
    const out = [];
    for (const t of T0) { if (!t.cond()) continue; const l = this.lookingAt(t.pos, 0.35, 9); if (l) out.push({ ...t, ang: l.ang }); }
    return out.sort((a, b) => a.ang - b.ang);
  }

  evidence() {
    const F = this.F;
    const E = [
      'O celular está "Sem serviço" desde as 3h. Mesmo assim, as mensagens do "{wendel}" chegavam.',
      'O {wendel} de verdade escreve "kkkk", usa 🖤🤍 e te chama de {rafa}. O das 3h escrevia "{rafaela}." e "está", como alguém que aprendeu a escrever lendo.',
      'A TV avisou: o visitante não pode entrar em uma casa que NÃO RECONHECE. Toda coisa "consertada" deixava a casa mais reconhecível.',
      'Cada vez que alguém da família voltava pelo espelho, a porcentagem do vídeo caía — e o "{wendel}" ficava bravo.',
    ];
    if (F.askedCats) E.push('No interfone, a "mãe" disse "do gato", no singular. Ele não enxerga os gatos. Os gatos enxergam ele.');
    if (F.laptopSeen) E.push('No notebook: "Obrigado por me mostrar a casa. Agora eu vou me lembrar dela."');
    if (F.hunt3Done) E.push('Ele parou na porta que não existe. Não conseguiu passar. A casa fez aquela porta pra você.');
    if (F.dadFound) E.push('O espelho do guarda-roupa dizia: NÃO DEIXA IGUAL.');
    E.push('No reflexo da TV desligada, o quadro estava pendurado de cabeça pra baixo. A casa queria diferente desde o começo.');
    if (F.invited) E.push('Você abriu o portão pelo interfone. Ele não pedia pra entrar no prédio. Pedia pra ser convidado.');
    return E;
  }

  // ============================================================ PRÓLOGO
  async intro(s) {
    const g = this.g, ui = g.ui;
    this.cut(true);
    ui.showHud(true);
    await ui.fade(1, 0);
    this.F.act = 1;
    this.setupLights();
    this.setupActors();
    this.seedPhone();
    g.phone.battery = 12;
    g.player.teleport(3.55, 2.5, Math.PI / 2, -0.12);
    g.player.eyeH = 0.98;
    g.player.apply();
    g.tv.set('static');
    g.startAmbience('house');
    await s.wait(1.2);
    for (let i = 0; i < 3; i++) { audio.play('clock', { tock: i % 2 === 1, vol: 1.2, delay: i * 0.9 }); }
    await s.wait(2.6);
    audio.speak(T('{rafa}... acorda.'), { pitch: 0.9, rate: 0.75, female: true, vol: 0.55 });
    await s.say('???', '*{rafa}... acorda.*', { dur: 2.6 });
    ui.toast('03:07', 2.5);
    await ui.fade(0, 3.5);
    await s.wait(1.0);
    await s.say('{rafa}', '*...dormi no sofá de novo.*', { dur: 2.6 });
    audio.play('phone_vibrate', { n: 2 });
    await s.wait(1.0);
    this.fakeMessages();
    await s.wait(1.5);
    await s.say('{rafa}', '*Ué. Tá escrito "Sem serviço"... como chegou mensagem?*', { dur: 3.4 });
    await s.say('{rafa}', '*Deve ter pegado o wi-fi do vizinho de novo.*', { dur: 2.8 });
    g.player.eyeH = EYE;
    this.cut(false);
    this.phase = 'a1';
    this.objective('msgs');
    ui.toast('WASD: andar · Mouse: olhar · E: interagir\nTAB: celular · F: lanterna · ESC: pausa', 7);
    g.checkpoint('intro', true);
    g.resumePointer(true);
  }

  seedPhone() {
    const ph = this.g.phone;
    ph.threads = [];
    const fam = ph.ensureThread('familia', 'Família 🏠');
    fam.msgs.push({ text: 'Gente, amanhã é faxina. Ninguém tira nada do lugar.', time: '19:12', day: 'ontem' });
    fam.msgs.push({ text: '{rafa}, desliga essa TV e vai dormir.', time: '22:31', day: 'ontem' });
    fam.msgs.push({ text: 'tá mãe', time: '22:32', day: 'ontem', out: true });
    fam.status = 'Mãe, Pai, {wendel}, {julia}, {pedro}';
    const w = ph.ensureThread('wendel', '{wendel} 🖤');
    w.msgs.push({ text: 'rafa pega meu carregador no teu quarto kkkkk esqueci lá do lado do espelho', time: '17:58', day: 'ontem' });
    w.msgs.push({ text: 'e não esquece da ração do {bento} e da {lili} 🖤🤍', time: '17:59', day: 'ontem' });
    w.msgs.push({ text: 'tá', time: '18:02', day: 'ontem', out: true });
    w.msgs.push({ text: 'VASCOOOOOO 🖤🤍🖤🤍 kkkkkkk', time: '21:40', day: 'ontem' });
    w.msgs.push({ text: 'chato', time: '21:41', day: 'ontem', out: true });
    w.msgs.push({ text: 'vou dormir na casa do Léo hj, amanhã cedo tô aí', time: '23:10', day: 'ontem' });
    w.msgs.push({ text: 'cuida da casa kkkk', time: '23:11', day: 'ontem' });
    w.status = 'visto por último ontem às 23:11';
  }
  fakeMessages() {
    const ph = this.g.phone;
    const lines = ['{rafaela}.', 'Acorda.', 'Eu gravei a casa hoje à tarde. O vídeo está no seu celular: casa.mp4', 'Preciso que você confira se a casa está igual ao vídeo. Tudo.', 'Antes das 3:33.'];
    lines.forEach((l, i) => ph.receive('wendel', '{wendel} 🖤', l, { time: i < 2 ? '03:03' : '03:04', silent: i !== 0 }));
    const t = ph.thread('wendel'); t.unread = lines.length; t.status = 'online';
  }
  onReadThread(id) {
    if (id === 'wendel' && this.phase === 'a1' && this.objId === 'msgs') {
      this.progress();
      this.after(0.6, () => {
        this.objective('charger');
        this.toast('Bateria: 12%. Não dá pra rodar o vídeo assim.', 3.5);
      });
    }
  }

  // ============================================================ ATO 1
  resume_a1() {
    const F = this.F;
    if (F.tvEventPending) { this.phase = 'a1'; this.startTVEvent(true); return; }
    if (!this.objId) this.objective('msgs');
    this.g.tv.set(F.tvOff ? 'off' : 'static');
    if (F.intercomDone && !F.sawExtraDoor) this.objective('bed');
  }

  prompt_tv() {
    const F = this.F;
    if (F.act === 1 && F.tvEventStarted) return null;
    if (this.phase === 'a3_climax') return null;
    if (F.act === 1 && !F.tvOff && this.phase === 'a1') return 'Desligar a TV';
    if (F.act === 1 && F.tvOff) return 'Olhar a TV desligada';
    return F.act === 3 ? 'Olhar a TV' : 'TV';
  }
  do_tv() {
    const F = this.F, g = this.g;
    if (F.act === 1 && !F.tvOff && this.phase === 'a1') { F.tvOff = true; g.tv.set('off'); audio.play('tv_off', { pos: [0.3, 1.4, 2.8] }); this.say0('{rafa}', '*Pronto. Silêncio.*'); return; }
    if (F.act === 1 && F.tvOff) { this.say0('', 'A tela preta reflete a sala. Tem alguma coisa estranha no reflexo... o quadro colorido. No reflexo, ele está pendurado de cabeça pra baixo.'); F.sawTVReflection = true; return; }
    this.say0('', F.act === 2 ? 'A TV está desligada. O reflexo mostra a sala... sem você nela.' : 'A tela está quente. Tem marcas de dedos por dentro do vidro.');
  }
  say0(who, text, dur) { this.g.ui.say(who, text, dur || Math.max(2.5, T(text).length * 0.06)); }

  prompt_charger() { return this.F.hasCharger ? null : 'Pegar o carregador do {wendel}'; }
  do_charger() {
    this.F.hasCharger = true;
    this.give('carregador');
    this.g.applyWorld();
    this.progress();
    this.say0('{rafa}', '*Achei. Agora uma tomada.*');
    if (this.objId === 'charger' || this.objId === 'msgs') this.objective('charge');
  }
  onCharge() {
    const F = this.F, g = this.g;
    if (!F.videoUnlocked && g.phone.battery >= 35) {
      F.videoUnlocked = true;
      g.phone.apps.video = true;
      this.progress();
      g.phone.receive('wendel', '{wendel} 🖤', 'O vídeo carregou. Assista. Compare com a casa.', {});
      this.objective('video');
      this.toast('casa.mp4 liberado!\nSegure o botão direito e aperte Q para ver o vídeo.', 5);
      g.checkpoint('a1_video', true);
    }
  }
  update_a1(dt) {
    const g = this.g, F = this.F;
    if (this.objId === 'video' && g.phone.raised && g.phone.mode === 'video') { this.objective('compare'); F.showSim = true; this.progress(); }
    if (this.objId === 'compare' && g.phone.raised && g.phone.mode === 'video' && !F.sawPaintingDiff) {
      if (this.lookingAt([3.2, 1.2, 7.8], 0.35, 7)) { F.sawPaintingDiff = true; this.after(1.2, () => this.say0('{rafa}', '*No vídeo o quadro tá no chão... e aqui tá pendurado?*')); }
    }
    // os gatos
    if (F.fedCats && !F.bentoAte) { F.bentoAte = true; }
    // som vindo do quarto dos pais
    if (F.act === 1 && !F.intercomDone && this.zones && this.zones.includes('corredor_fim') && !F.heardParents) {
      F.heardParents = true;
      audio.play('breath', { pos: [g.layout.P + 1.5, 1, 7.2], dur: 2.2, v: 0.5, out: true });
    }
    // lili embaixo da cama
    if (this.zones && this.zones.includes('roxo') && !F.sawLiliA1 && g.player.crouching) {
      const l = this.lookingAt([4.72, 0.15, 4.9], 0.5, 3.5);
      if (l) { F.sawLiliA1 = true; g.cats.lili.hiss(); this.say0('{rafa}', '*{lili}? O que você tá fazendo aí embaixo? ...Do que você tá com medo?*'); }
    }
    // checklist concluído -> interfone
    if (!F.intercomStarted && F.fixedQuadro && F.fedCats && F.checkedMom) { F.intercomStarted = true; this.after(4, () => this.startIntercom()); }
    // viu a porta nova
    if (F.corridorLong && !F.sawExtraDoor && this.zones && this.zones.includes('corredor') && g.player.pos.x > 8.3) {
      if (this.lookingAt([12.21, 1.1, 7.55], 0.6, 6)) this.sawExtraDoor();
    }
    if (F.sawExtraDoor && !F.tvEventStarted) {
      this._tvT = (this._tvT || 0) + dt;
      if (this._tvT > 35 || (this.zones && this.zones.includes('roxo'))) this.startTVEvent();
    }
    if (F.sawExtraDoor && !F.extraKnocked && Math.hypot(g.player.pos.x - 12.2, g.player.pos.z - 7.4) < 1.3) {
      F.extraKnocked = true;
      this.after(0.8, () => audio.play('knock', { pos: [12.2, 1.2, 8.1], n: 3, gap: 0.7, v: 0.8 }));
    }
  }

  // ---- quadro
  prompt_painting() {
    const F = this.F;
    if (F.act === 1 && F.paintingMode !== 'floor') return F.videoUnlocked ? 'Colocar o quadro no chão (como no vídeo)' : 'Examinar o quadro';
    if (F.act === 3 && F.paintingMode !== 'upside') return 'Pendurar o quadro de cabeça pra baixo';
    return 'Examinar o quadro';
  }
  do_painting() {
    const F = this.F, g = this.g;
    if (F.act === 1 && F.paintingMode !== 'floor') {
      if (!F.videoUnlocked) { this.say0('{rafa}', '*O quadro colorido da sala. Ele não ficava encostado no chão?*'); return; }
      F.paintingMode = 'floor';
      F.fixedQuadro = true;
      g.applyWorld();
      audio.play('thud', { pos: [3.2, 0.5, 7.8], v: 0.6 });
      this.progress();
      this.onFix('quadro');
      this.after(1.5, () => {
        this.msg('Isso.');
        this.after(1.4, () => this.msg('Tem mais coisas diferentes. E não esqueça da ração dos gatos. Veja também se a sua mãe está dormindo.'));
        this.after(2.5, () => { this.objective('a1list'); });
      });
      return;
    }
    if (F.act === 3 && F.paintingMode !== 'upside') return this.rupturePainting();
    this.say0('', F.paintingMode === 'upside' ? 'De cabeça pra baixo. Do jeito que a casa quer.' : 'O quadro colorido. Duas pessoas abraçadas, um coração em cima.');
  }
  onFix(id) {
    const g = this.g, b = g.cats.bento;
    audio.play('chime', { notes: [69, 72, 76], v: 0.5 });
    this.toast(`Diferença corrigida · casa.mp4: ${Math.round(this.sim())}% igual`, 2.6);
    // pista: o Bento não gosta quando você conserta
    if (b.enabled && Math.hypot(b.pos.x - g.player.pos.x, b.pos.z - g.player.pos.z) < 7) {
      b.hiss(); b.mode = 'stare'; b.stareAt = g.player.pos.clone();
      this.after(1.6, () => { b.goTo(-1.4, 6.8, () => { b.mode = 'idle'; }); });
      if (!this.F.bentoHissNote) { this.F.bentoHissNote = true; this.after(2, () => this.say0('{rafa}', '*Ué, {bento}. Tá bravo comigo?*')); }
    }
    // algo na casa reage baixinho
    this.after(3, () => audio.play('creak', { pos: [12, 2.3, 7.2], v: 0.35 }));
  }

  // ---- outras diferenças do ato 1
  prompt_bike_bath() { return this.F.act === 1 && !this.F.d_bike ? (this.F.videoUnlocked ? 'Levar a bicicleta de volta pra sala' : 'A bicicleta... no box?') : null; }
  async do_bike_bath() {
    const F = this.F, g = this.g;
    if (!F.videoUnlocked) { this.say0('{rafa}', '*Quem colocou a bicicleta dentro do box? Isso é coisa do {pedro}?*'); return; }
    this.cut(true);
    await g.ui.fade(1, 0.5);
    audio.play('creak', { v: 0.4 }); audio.play('thud', { v: 0.4, delay: 0.3 });
    F.d_bike = true; g.applyWorld();
    await new Promise((r) => setTimeout(r, 600));
    await g.ui.fade(0, 0.5);
    this.cut(false);
    this.onFix('bike');
  }
  prompt_rack_photos() { const F = this.F; if (F.act === 1 && !F.d_fotos) return F.videoUnlocked ? 'Levantar as fotos (como no vídeo)' : 'Fotos viradas pra baixo'; return 'Olhar as fotos'; }
  do_rack_photos() {
    const F = this.F;
    if (F.act === 1 && !F.d_fotos) {
      if (!F.videoUnlocked) { this.say0('{rafa}', '*As fotos da família estão viradas pra baixo. Todas.*'); return; }
      F.d_fotos = true; this.g.applyWorld(); audio.play('page'); this.onFix('fotos'); return;
    }
    this.say0('', F.act === 1 ? 'Fotos da família. Todo mundo sorrindo.' : F.act === 2 ? 'As fotos... os rostos sumiram. Só ficou o seu.' : 'Todos os rostos estão riscados. Menos o seu.');
  }
  prompt_sheet_figure() { return this.F.act === 1 && !this.F.d_lencol ? 'Puxar o lençol' : null; }
  async do_sheet_figure() {
    const F = this.F, g = this.g;
    this.cut(true, { look: true });
    audio.play('breath', { dur: 1.2, v: 0.7 });
    await new Promise((r) => setTimeout(r, 900));
    F.d_lencol = true; g.applyWorld();
    audio.play('page', { vol: 0.8 });
    this.cut(false);
    this.say0('{rafa}', '*...não tem ninguém. Era só o lençol. Era só o lençol.*');
    if (F.videoUnlocked) this.onFix('lencol');
  }

  // ---- ração dos gatos
  prompt_stool() { return this.has('banquinho') ? null : 'Pegar o banquinho'; }
  do_stool() { this.F.stoolAt = 'inv'; this.give('banquinho'); this.g.applyWorld(); }
  prompt_racao() {
    const F = this.F;
    if (F.hasRacao || F.fedCats) return null;
    if (F.stoolAt === 'shelf') return 'Pegar a ração';
    return this.has('banquinho') ? 'Colocar o banquinho e subir' : 'A ração (alto demais)';
  }
  do_racao() {
    const F = this.F, g = this.g;
    if (F.stoolAt !== 'shelf') {
      if (!this.has('banquinho')) { this.say0('{rafa}', '*Tá lá em cima. Não alcanço. Preciso subir em alguma coisa.*'); this.F.triedRacao = true; return; }
      this.take('banquinho'); F.stoolAt = 'shelf'; g.applyWorld(); audio.play('thud', { v: 0.4 });
    }
    F.hasRacao = true; this.give('racao'); g.applyWorld(); this.progress();
    this.say0('{rafa}', '*Agora os potes, na cozinha.*');
  }
  prompt_stool_fridge() { return null; }
  prompt_bowl_bento() { return this.has('racao') && !this.F.fedCats ? 'Servir a ração' : undefined; }
  prompt_bowl_lili() { return this.has('racao') && !this.F.fedCats ? 'Servir a ração' : undefined; }
  do_bowl_bento() { if (this.has('racao') && !this.F.fedCats) return this.feedCats(); return false; }
  do_bowl_lili() { if (this.has('racao') && !this.F.fedCats) return this.feedCats(); return false; }
  feedCats() {
    const F = this.F, g = this.g;
    F.fedCats = true;
    audio.play('ice', { pos: [-1.0, 0.2, 7.6] });
    g.applyWorld();
    this.progress();
    const b = g.cats.bento;
    b.meow(1);
    b.goTo(-1.25, 7.35, () => { b.mode = 'eat'; b.yaw = Math.PI; });
    this.after(4, () => this.say0('{rafa}', '*O {bento} veio correndo. A {lili} não.*'));
    this.toast(this.statusLines().join('\n'), 3);
  }

  // ---- mãe dormindo
  prompt_porta_pais() { if (this.F.act === 1) return 'Bater na porta'; return undefined; }
  do_porta_pais() {
    const F = this.F, g = this.g;
    if (F.act !== 1) return false;
    const P = g.layout.P;
    audio.play('knock', { pos: [P, 1.2, 7.2], n: 3, v: 0.9 });
    if (!F.checkedMom) {
      F.checkedMom = true;
      this.progress();
      this.after(2.2, () => {
        this.voice('Hmmm... vai dormir, {rafa}. Já é tarde.', { tts: 'mae', vol: 0.45 });
        this.g.ui.say('Mãe', '*(abafado)* Hmmm... vai dormir, {rafa}. Já é tarde.', 3.2);
      });
      this.after(6, () => { audio.play('breath', { pos: [P + 2, 1, 7.2], dur: 2.5, v: 0.5 }); this.toast(this.statusLines().join('\n'), 3); });
    } else this.after(2, () => this.say0('Mãe', '*(abafado)* {rafa}... dorme.'));
  }
  prompt_porta_meninos() { return undefined; }
  prompt_bed_meninos() { return this.F.act === 1 ? 'Olhar' : undefined; }
  do_bed_meninos() { if (this.F.act !== 1) return false; this.say0('', 'O {pedro} dorme de boca aberta, enrolado no lençol rosa. Ronca baixinho.'); }
  prompt_bed_roxo() { return this.F.act === 1 ? (this.g.player.crouching ? 'Olhar embaixo da cama' : 'Olhar a {julia}') : undefined; }
  do_bed_roxo() {
    const F = this.F;
    if (F.act !== 1) return false;
    if (this.g.player.crouching) { this.g.cats.lili.hiss(); this.say0('{rafa}', '*A {lili} tá lá no fundo, com os olhos arregalados. Ela não quer sair. Ela tá olhando... pra porta.*'); F.sawLiliA1 = true; return; }
    this.voice('Rafa... apaga a luz...', { tts: 'julia', vol: 0.4 });
    this.say0('{julia}', '*(dormindo)* {rafa}... apaga a luz...');
  }
  prompt_round_mirror() { return 'Olhar o espelho redondo'; }
  do_round_mirror() {
    const F = this.F;
    if (F.act === 1) { this.say0('{rafa}', '*Meu cabelo tá um ninho. ...Por um segundo, parecia que meu reflexo demorou pra se mexer.*'); return; }
    return this.mirrorJulia();
  }
  prompt_wardrobe_mirror() { return 'Olhar o espelho'; }
  do_wardrobe_mirror() {
    const F = this.F;
    if (F.dadFound) { this.say0('', 'Escrito no espelho, só no reflexo: NÃO DEIXA IGUAL.'); return; }
    this.say0('', F.act === 1 ? 'O espelho do guarda-roupa. Você de pijama... quer dizer, de camisa preta com a faixa. A da sorte.' : 'No espelho, o quarto parece mais arrumado do que está.');
  }
  prompt_bath_mirror() { const F = this.F; if (F.act === 3 && F.showerOn && !F.nameWritten) return 'Escrever no espelho embaçado'; return 'Olhar o espelho'; }
  do_bath_mirror() {
    const F = this.F;
    if (F.act === 3 && F.showerOn && !F.nameWritten) return this.ruptureMirror();
    this.say0('', F.act === 3 ? 'Você no espelho. Só você. Nenhuma sombra atrás.' : 'O espelho do banheiro. Você parece cansada.');
  }
  prompt_keyholder() {
    const F = this.F;
    if (F.oldKeyShown && !F.hasOldKey) return 'Pegar a chave velha';
    if (F.act === 3 && !F.keysHung) return 'Pendurar as chaves da família';
    return 'Olhar o porta-chaves';
  }
  do_keyholder() {
    const F = this.F;
    if (F.oldKeyShown && !F.hasOldKey) { F.hasOldKey = true; this.give('chave_velha'); this.g.applyWorld(); this.say0('{rafa}', '*Essa chave não é de ninguém daqui. Tinha cinco chaves nesse porta-chaves. Agora tinha seis.*'); return; }
    if (F.act === 3 && !F.keysHung) return this.ruptureKeys();
    this.say0('', F.act === 1 ? 'O porta-chaves "Família". Cinco chaves, cinco chaveiros. Todo mundo em casa.' : F.keysHung ? 'Todas as chaves da família de volta. E mais uma, velha, que agora também é de casa.' : 'O porta-chaves "Família" está vazio.');
  }

  // ---- interfone
  startIntercom() {
    const g = this.g, F = this.F;
    this.objective('intercom');
    this.ringing = true;
    const ring = () => {
      if (!this.ringing) return;
      audio.play('intercom', { pos: [0.07, 1.45, 7.65], dur: 1.3, vol: 1.1 });
      this._ringCount = (this._ringCount || 0) + 1;
      if (this._ringCount > 20) { this.ringing = false; F.intercomIgnored = true; this.afterIntercom(3); return; }
      this.after(2.6, ring);
    };
    ring();
    this.after(2, () => this.say0('{rafa}', '*O interfone? Às três da manhã?*'));
  }
  prompt_intercom() { return this.ringing ? 'Atender o interfone' : 'Interfone'; }
  do_intercom() {
    if (!this.ringing) { this.say0('', this.examineText('intercom')); return; }
    this.ringing = false;
    this.run(async (s) => {
      const g = this.g, F = this.F, ui = g.ui;
      this.cut(true, { look: true });
      audio.play('switch');
      audio.play('intercom_static', { dur: 2, vol: 0.6 });
      await s.wait(1.2);
      await s.say('Voz no interfone', '{rafa}? Sou eu, a mãe. Esqueci a chave. Abre pra mim, filha?', { tts: 'mae', vol: 0.6, dur: 4.2 });
      const c = await ui.choice('A voz parece a da sua mãe. Mas a porta do quarto dela estava trancada por dentro.', [
        'Apertar o botão e abrir o portão',
        'Mãe? Você tá dormindo no quarto.',
        'Se for você mesmo... qual o nome dos gatos?',
        'Desligar sem dizer nada',
      ]);
      g.resumePointer(true);
      if (c === 0) {
        F.invited = true;
        audio.play('intercom', { dur: 0.6, vol: 0.8 });
        await s.wait(1.4);
        audio.play('door_slam', { pos: [1, -8, 12], vol: 0.6 });
        await s.say('Voz no interfone', '...obrigada.', { dur: 2.2, kind: 'enemy', tts: 'inq' });
      } else if (c === 1) {
        await s.wait(1.6);
        await s.say('Voz no interfone', 'Tô?', { dur: 2, kind: 'enemy', tts: 'inq' });
        audio.play('intercom_static', { dur: 1.2, vol: 1.1 });
        await s.say('Voz no interfone', 'Então quem tá no quarto?', { dur: 2.8, kind: 'enemy' });
      } else if (c === 2) {
        F.askedCats = true;
        await s.wait(1.4);
        await s.say('Voz no interfone', '...do gato, filha. Abre.', { dur: 2.8, kind: 'enemy', tts: 'mae' });
        audio.play('intercom_static', { dur: 1.2, vol: 1.1 });
        await s.say('{rafa}', '*"Do gato"? A gente tem DOIS.*', { dur: 2.8 });
      } else {
        await s.wait(0.6);
      }
      audio.play('switch');
      this.cut(false);
      this.afterIntercom(1);
    });
  }
  afterIntercom(delay) {
    const F = this.F;
    F.intercomDone = true;
    this.after(delay, () => this.run(async (s) => {
      const g = this.g;
      // as luzes piscam; a casa muda enquanto está escuro
      audio.play('power_down', { vol: 0.5 });
      g.lightMul = 0;
      await s.wait(0.6);
      F.corridorLong = true;
      F.oldKeyShown = true;
      const pp = g.player.pos.clone(), yaw = g.player.yaw;
      g.rebuildWorld();
      this.setupLights();
      g.player.teleport(pp.x, pp.z, yaw, g.player.pitch);
      await s.wait(0.6);
      audio.play('power_up', { vol: 0.5 });
      g.lightMul = 1;
      audio.play('wrong', { v: 0.6 });
      await s.wait(1.5);
      if (F.invited) this.msg('Você abriu.');
      else this.msg('Não abra a porta pra ninguém.');
      await s.wait(1.8);
      this.msg('Agora volte para o seu quarto e fique lá.');
      this.objective('bed');
      g.checkpoint('a1_intercom');
    }));
  }
  sawExtraDoor() {
    const F = this.F;
    F.sawExtraDoor = true;
    audio.play('wrong', { v: 0.9 });
    this.warp = 1.2;
    this.progress();
    this.run(async (s) => {
      await s.say('{rafa}', '*Essa porta... essa porta não existia.*', { dur: 2.8 });
      await s.say('{rafa}', '*O corredor tá mais comprido. Tá. Mais. Comprido.*', { dur: 2.8 });
      await s.wait(1.0);
      this.msg('Essa porta não está no vídeo. Não abra.');
      if (!this.F.tvEventStarted) this.objective('extradoor');
    });
  }
  prompt_porta_extra() {
    const F = this.F;
    if (F.act === 1) return this.has('chave_velha') ? 'Tentar a chave velha' : 'Abrir';
    if (F.act === 2 && !F.extraUnlocked) return this.has('chave_velha') ? 'Tentar a chave velha' : 'Abrir';
    return undefined;
  }
  do_porta_extra(it) {
    const F = this.F, d = this.g.world.doors.get('porta_extra');
    if (F.extraUnlocked) return false;
    audio.play('locked', { pos: d.center });
    if (this.has('chave_velha')) { audio.play('unlock', { pos: d.center, vol: 0.6 }); this.say0('{rafa}', '*A chave gira... mas alguma coisa do outro lado segura a maçaneta.*'); }
    else this.say0('{rafa}', '*A maçaneta não gira. Parece de mentira.*');
    if (F.act === 1 && !F.extraHeld) { F.extraHeld = true; this.after(1.5, () => audio.play('knock', { pos: [12.2, 1.2, 8.1], n: 2, gap: 0.9, v: 0.7 })); }
    return true;
  }

  // ---- A TV (fim do ato 1)
  startTVEvent(resumed = false) {
    const F = this.F, g = this.g;
    if (F.tvEventStarted && !resumed) return;
    F.tvEventStarted = true;
    F.tvEventPending = true;
    g.clockMin = 3 * 60 + 32;
    g.tv.set('static');
    audio.play('tv_on', { pos: [0.3, 1.4, 2.8], vol: 1.4 });
    this.objective('tv');
    if (!resumed) g.checkpoint('a1_tv', true);
    this.tvArmed = true;
    if ((this.zones || []).includes('sala')) this.after(2, () => this.enter_sala());
  }
  enter_sala() {
    if (this.tvArmed && this.phase === 'a1') { this.tvArmed = false; this.run((s) => this.tvBroadcast(s)); }
  }
  async tvBroadcast(s) {
    const g = this.g, F = this.F;
    await s.wait(1.5);
    g.clockMin = 3 * 60 + 33;
    const lines = [
      ['', 'CANAL 0', 2.6], ['AVISO AOS MORADORES', '', 3],
      ['HÁ UM VISITANTE NO PRÉDIO.', '', 3.4],
      ['O VISITANTE NÃO PODE ENTRAR', 'EM UMA CASA QUE NÃO RECONHECE.', 4.6],
      ['MANTENHA A SUA CASA', 'COMO VOCÊ SE LEMBRA DELA.', 4.2],
      ['NÃO OLHE PARA TRÁS', 'DURANTE A TRANSMISSÃO.', 3.6],
    ];
    let cur = 0;
    let t0 = 0;
    g.tv.set('canvas', (x, w, h, t) => {
      const L0 = lines[Math.min(cur, lines.length - 1)];
      if (cur === 0) {
        const cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
        cols.forEach((c, i) => { x.fillStyle = c; x.fillRect((i * w) / 7, 0, w / 7 + 1, h * 0.7); });
        x.fillStyle = '#111'; x.fillRect(0, h * 0.7, w, h * 0.3);
        x.fillStyle = '#fff'; x.font = 'bold 44px monospace'; x.textAlign = 'center'; x.fillText('CANAL 0', w / 2, h * 0.88);
      } else {
        x.fillStyle = '#0a1a3a'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#e8e8e8'; x.textAlign = 'center';
        x.font = 'bold 30px monospace'; x.fillText(L0[0], w / 2, h * 0.42);
        x.font = 'bold 26px monospace'; x.fillText(L0[1], w / 2, h * 0.58);
        x.font = '14px monospace'; x.fillStyle = '#9ab'; x.textAlign = 'left'; x.fillText('CANAL 0 · 03:33', 14, 24);
      }
      for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`; x.fillRect(0, Math.random() * h, w, 1); }
      void t0;
    });
    audio.play('record_beep', { pos: [0.3, 1.4, 2.8], vol: 1.2 });
    for (let i = 0; i < lines.length; i++) {
      cur = i;
      if (i > 0) { this.voice((lines[i][0] + ' ' + lines[i][1]).toLowerCase(), { tts: 'tv' }); g.ui.say('TV', lines[i][0] + ' ' + lines[i][1], lines[i][2] - 0.2, 'house'); }
      await s.wait(lines[i][2]);
    }
    // CCTV: a sala vista de cima. Você... e algo atrás de você.
    const cc = g.cctvCam;
    cc.position.set(4.0, 2.45, 7.7);
    const P = g.player.pos;
    cc.lookAt(P.x, 1.0, P.z);
    const e = g.entity;
    const back = new THREE.Vector3(Math.sin(g.player.yaw), 0, Math.cos(g.player.yaw)).multiplyScalar(1.5);
    e.show(P.x + back.x, P.z + back.z, g.player.yaw, 'c');
    g.tv.set('cctv');
    this.cctvOverlay('CÂMERA 2 · SALA · AO VIVO');
    audio.play('swell', { dur: 5, v: 0.5 });
    g.ui.say('{rafa}', '*Essa imagem... é a sala. Agora. Aquela ali sou eu.*', 3.2);
    const startYaw = g.player.yaw;
    let tt = 0;
    while (tt < 7) {
      await s.wait(0.1);
      tt += 0.1;
      const pp = g.player.pos;
      const dir = new THREE.Vector3(Math.sin(g.player.yaw), 0, Math.cos(g.player.yaw));
      const dd = Math.max(0.55, 1.5 - tt * 0.14);
      e.place(pp.x + dir.x * dd, pp.z + dir.z * dd, g.player.yaw);
      cc.lookAt(pp.x, 1.2, pp.z);
      if (Math.abs(angleDiff(startYaw, g.player.yaw)) > 1.9) break;
    }
    // JUMP SCARE 1
    this.cut(true);
    g.tv.set('static');
    const pp = g.player.pos;
    const fwd = new THREE.Vector3(-Math.sin(g.player.yaw), 0, -Math.cos(g.player.yaw));
    await g.player.turnTo(g.player.yaw + Math.PI, 0.05, 0.25);
    const f2 = new THREE.Vector3(-Math.sin(g.player.yaw), 0, -Math.cos(g.player.yaw));
    e.show(pp.x + f2.x * 0.55, pp.z + f2.z * 0.55, g.player.yaw, 'ecv');
    e.model.position.y = -0.75;
    void fwd;
    if (settings.scare > 0) {
      audio.play('stinger', { v: settings.scare === 2 ? 1 : 0.5 });
      g.player.shake(settings.scare === 2 ? 1.2 : 0.5);
      this.glitch = 1;
      g.ui.flash(settings.scare === 2 ? 0.6 : 0.25, 0.2);
    } else audio.play('boom', { v: 0.6 });
    await s.wait(settings.scare === 2 ? 0.8 : 0.4);
    await g.ui.fade(1, 0.05);
    this.glitch = 0;
    e.hide();
    g.tv.set('off');
    g.stopAmbience();
    audio.play('power_down', { vol: 0.8 });
    audio.music(null);
    await s.wait(3.0);
    F.tvEventPending = false;
    this.startAct2(s);
  }
  cctvOverlay(text) {
    const g = this.g;
    const c = document.createElement('canvas'); c.width = 512; c.height = 288;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.font = 'bold 18px monospace'; x.fillText(text, 14, 26);
    x.fillStyle = '#e22'; x.beginPath(); x.arc(490, 20, 7, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.font = '16px monospace'; x.fillText('03:33:' + String(Math.floor(Math.random() * 60)).padStart(2, '0'), 14, 276);
    const ov = new THREE.CanvasTexture(c); ov.colorSpace = THREE.SRGBColorSpace;
    g.tv.cctvMat = new THREE.ShaderMaterial({
      uniforms: { tRT: { value: g.cctvRT.texture }, tOv: { value: ov }, time: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform sampler2D tRT; uniform sampler2D tOv; uniform float time; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
        void main(){ vec3 c = texture2D(tRT, vUv).rgb; float l = dot(c, vec3(0.3,0.59,0.11));
          c = vec3(l) * vec3(0.8, 1.0, 0.85) * 3.6 + vec3(0.02, 0.04, 0.02); c += (h(vUv*512.0 + time) - 0.5) * 0.12; c *= 0.85 + 0.15*sin(vUv.y*300.0);
          vec4 o = texture2D(tOv, vUv); c = mix(c, o.rgb, o.a); gl_FragColor = vec4(c, 1.0); }`,
    });
    g.tv.set('cctv');
  }

  enter_corredor() {
    if (this.phase === 'a2' && this.F.power && !this.F.hunt1Done) this.hunt1();
  }
}

Object.assign(Story.prototype, act2, act3);
