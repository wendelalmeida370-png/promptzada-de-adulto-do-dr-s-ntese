// ATO 2 — "A casa contradiz a memória".
import * as THREE from 'three';
import { audio } from '../core/audio.js';
import { names, settings, T } from '../core/settings.js';
import { angleDiff, norm } from '../core/util.js';
import { EYE } from './player.js';
import { buildFigure, echoMaterial } from './characters.js';
import { vis } from '../world/layers.js';
import { box } from '../world/geom.js';

export const act2 = {
  // ------------------------------------------------------------ início
  async startAct2(s) {
    const g = this.g, F = this.F;
    F.act = 2;
    F.power = false;
    this.phase = 'a2';
    g.clockMin = 3 * 60 + 34;
    g.rebuildWorld();
    this.setupLights();
    this.setupActors();
    g.phone.battery = Math.max(g.phone.battery, 30);
    g.phone.flashlight = false;
    g.player.teleport(1.3, 2.9, Math.PI, 0.5);
    g.player.eyeH = 0.3;
    this.cut(true, { look: true });
    g.startAmbience('act2');
    this.powerAmbience(false);
    await g.ui.fade(0, 3);
    await s.say('{rafa}', '*...o que... o que foi aquilo?*', { dur: 2.6 });
    for (let i = 0; i < 30; i++) { g.player.eyeH += (EYE - g.player.eyeH) * 0.12; g.player.pitch *= 0.9; await s.wait(0.05); }
    g.player.eyeH = EYE;
    await s.say('{rafa}', '*A luz caiu. Até a geladeira parou. Nunca ouvi essa casa tão quieta.*', { dur: 3.6 });
    this.cut(false);
    this.msg('{rafaela}.');
    await s.wait(1.2);
    this.msg('A luz caiu. O quadro de luz fica do lado da porta de entrada.');
    this.objective('breaker');
    this.toast('F: lanterna', 2.5);
    g.checkpoint('a2_start');
  },

  resume_a2() {
    const F = this.F, g = this.g;
    this._prevZones = [];
    F.armFridgeClown = false;
    this.fridgeClown = null;
    this._blocked = false;
    if (!F.power) { this.objective('breaker'); return; }
    if (!F.familyIntro) this.objective('lookvideo');
    else this.objective('family');
    if (F.hasIce && !F.hunt2Done) this.after(3, () => this.startHunt2());
    if (F.laptopUnlocked && F.webcamDone && !F.hunt3Done) this.after(2, () => this.startHunt3(true));
    if (F.hunt1Started && !F.hunt1Done) { F.hunt1Started = false; }
  },
  resume_a2_door() {
    this._prevZones = [];
    this.objective(this.F.extraOpened ? 'descend' : 'door');
    this.doorPhaseAmbience();
  },

  setupFamilyEchoes() {
    const g = this.g, F = this.F, Px = g.layout.P;
    const col = 0xcfe0ff;
    if (!F.momFound) g.echoes.add('v_mae', { x: -2.25, z: 6.1, yaw: -Math.PI / 2, spec: 'v', hair: 'bun', anim: 'breathe', color: col, caption: 'A mãe, parada na bancada, dentro do vídeo.' });
    if (!F.dadFound) g.echoes.add('v_pai', { x: Px + 1.8, z: 6.2, yaw: Math.PI, spec: 'v', hat: true, anim: 'breathe', color: col, h: 1.78, caption: 'O pai, de chapéu, olhando o espelho. Dentro do vídeo.' });
    if (!F.juliaFound) {
      g.echoes.add('v_julia', { x: 4.74, z: 4.9, yaw: Math.PI / 2, spec: 'v', hair: 'long', sitting: true, anim: 'breathe', color: col, h: 1.6, caption: 'A {julia}, sentada na cama. Dentro do vídeo.' });
      g.echoes.add('m_julia', { x: 4.74, z: 4.9, yaw: Math.PI / 2, spec: 'm', hair: 'long', sitting: true, anim: 'look', color: 0xffe6c8, alpha: 0.85, h: 1.6 });
    }
    if (!F.pedroFound) g.echoes.add('v_pedro', { x: 8.2, z: 4.4, yaw: -Math.PI / 2, spec: 'v', hair: 'short', sitting: true, anim: 'type', color: col, h: 1.7, caption: 'O {pedro}, na escrivaninha. Dentro do vídeo.' });
    if (!F.momFound && F.power) this.startMomRoutine();
  },

  // ------------------------------------------------------------ quadro de luz
  prompt_breaker() { return this.F.act === 2 && !this.F.power ? 'Abrir o quadro e subir a chave GERAL' : 'Quadro de luz'; },
  do_breaker() {
    const F = this.F, g = this.g;
    if (!(F.act === 2 && !F.power)) { this.say0('', 'O quadro de luz. Todas as chaves estão pra cima.'); return; }
    this.run(async (s) => {
      const bb = g.world.get('breaker');
      if (bb) bb.switches.forEach((sw) => { sw.rotation.x = -0.5; });
      audio.play('breaker', { pos: [0.06, 1.75, 7.0] });
      F.power = true;
      this.progress();
      await s.wait(0.4);
      audio.play('power_up');
      this.setupLights();
      ['sala', 'entrada', 'cozinha', 'corredor1', 'corredor2', 'roxo', 'meninos', 'banheiro', 'pais'].forEach((id) => g.setLight(id, true, 1.6));
      this.powerAmbience(true);
      g.flags.fanSpeed = 3;
      await s.wait(2.0);
      this.setupActors();
      await s.say('{rafa}', '*Mãe? ...Pai?*', { dur: 2.2 });
      await s.wait(1.2);
      this.msg('{rafaela}. Eles não estão mais aí.');
      await s.wait(1.6);
      this.msg('Ele levou eles para dentro do vídeo.');
      await s.wait(1.4);
      this.msg('Olhe no vídeo.');
      this.objective('lookvideo');
      g.checkpoint('a2_lights');
    });
  },

  update_a2(dt) {
    const g = this.g, F = this.F;
    // viu a família no vídeo
    if (F.power && !F.familyIntro && g.phone.raised && g.phone.mode === 'video') {
      for (const id of ['v_mae', 'v_pai', 'v_julia', 'v_pedro']) {
        const e = g.echoes.get(id);
        if (e && this.lookingAt([e.f.position.x, 1.1, e.f.position.z], 0.45, 9)) { this.familyIntro(); break; }
      }
    }
    if (F.power && !F.familyIntro) { this._fiT = (this._fiT || 0) + dt; if (this._fiT > 100) this.familyIntro(); }
    // susto do palhaço depois da primeira caçada
    if (F.armClownScare && !g.player.hidden && this._wasHidden) this.clownExitScare();
    this._wasHidden = !!g.player.hidden;
    if (F.armClownScare && this.t - (F.armClownAt || 0) > 25) F.armClownScare = false;
    // o palhaço atrás da geladeira
    if (this.fridgeClown) {
      const c = g.clown.model.position;
      if (this.lookingAt([c.x, 1.7, c.z], 0.5, 3) || this.t - this.fridgeClown > 6) this.fridgeClownReveal();
    }
    // o pai esquecido
    const es = g.esquecido;
    if (es.active && !es.calm) {
      const d = Math.hypot(es.pos.x - g.player.pos.x, es.pos.z - g.player.pos.z);
      if (this.has('caixinha') && d < 4 && this.lookingAt([es.pos.x, 1.3, es.pos.z], 0.6, 4.5)) {
        this.customPrompt = 'Tocar a caixinha de música';
        this._customAction = () => this.playMusicBox();
      }
      const me = g.echoes.get('m_pai');
      if (me) { me.f.position.set(es.pos.x, 0, es.pos.z); me.f.rotation.y = es.model.rotation.y; }
    }
    // a Lili miando dentro do rack
    if (!F.liliFollow && this.zones && this.zones.includes('sala') && F.power) {
      this._liliT = (this._liliT || 12) - dt;
      if (this._liliT < 0) { this._liliT = 20 + Math.random() * 15; audio.play('meow', { pos: [0.3, 0.3, 3.68], v: 0.35, pitch: 700 }); F.liliHint = true; }
    }
    // rádio do Canal 0
    if (g.phone.radioOn && F.juliaFound && !F.radioBroadcast) { F.radioBroadcast = true; this.after(3, () => this.radioBroadcast()); }
    // saindo do quarto que não existe depois da caçada 3
    if (F.hunt3Done && !F.extraRelocked && !(this.zones || []).includes('extra')) {
      F.extraRelocked = true;
      const d = g.world.doors.get('porta_extra');
      if (d) { d.close(); d.locked = true; }
    }
    // entidade barrada pela casa
    const e = g.entity;
    if (e.hunt && this.huntId === 3 && !F.hunt3Done && (this.zones || []).includes('extra')) {
      if (Math.hypot(e.pos.x - 12.21, e.pos.z - 7.2) < 1.6) this.entityBlocked();
    }
  },

  familyIntro() {
    const F = this.F;
    if (F.familyIntro) return;
    F.familyIntro = true;
    F.showSim = true;
    this.progress();
    this.run(async (s) => {
      await s.say('{rafa}', '*Eles... estão no vídeo. Parados. Como se fossem parte da casa.*', { dur: 3.4 });
      await s.wait(1.0);
      this.msg('Viu? Eles estão presos no vídeo.');
      await s.wait(1.4);
      this.msg('Se a casa ficar IGUAL ao vídeo, eles voltam.');
      await s.wait(1.4);
      this.msg(`A casa está ${Math.round(this.sim())}% igual. Conserte o que estiver diferente. Ache eles.`);
      this.objective('family');
      this.F.liliHint = true;
      this.toast('Dica: pelo vídeo, o que está diferente ganha uma etiqueta vermelha.\nPela câmera (sem vídeo) aparecem PRESENÇAS.', 5);
    });
  },

  familyHints() {
    const F = this.F;
    if (!F.juliaFound) return ['A {julia} aparece no vídeo sentada na cama do quarto roxo. O vídeo não é o único jeito de ver o que a casa lembra: espelhos também mostram.', 'Olhe o espelho redondo da penteadeira. Compare a cômoda do reflexo com a cômoda de verdade.', 'No reflexo, as gavetas 1 e 4 (de cima para baixo) estão abertas e a 2 e a 3 fechadas. Deixe a cômoda igual e abra o guarda-roupa branco.'];
    if (!F.momFound) return ['Na cozinha, levante o celular no modo CÂMERA (não o vídeo). Tem uma presença repetindo alguma coisa.', 'A mãe faz sempre a mesma rotina: um armário de cima, o fogão, a geladeira. Repita na mesma ordem.', 'Abra o armário de cima em frente à porta da cozinha, acenda o fogão, abra o congelador. Pegue o gelo e use o micro-ondas.'];
    if (!F.dadFound) return ['O pai está no quarto dos pais, mas não te reconhece. Se ele te alcançar, te empurra pra fora.', 'Leia o bilhete da caixinha de música (na mochila, I). A mãe explica o que faz ele lembrar.', 'Chegue perto do pai com a caixinha de música, olhe pra ele e aperte E.'];
    if (!F.pedroFound) return [F.hasMomKeys ? 'O chaveiro da mãe abre o quarto dos meninos.' : 'O quarto dos meninos está trancado. A mãe tem as chaves reserva.', 'O notebook do {wendel} pede senha. A dica fala dos "donos da casa".', 'A senha é o nome dos dois gatos, juntos, sem espaço (ex.: ' + norm(names.bento + names.lili) + ').'];
    return ['Todos voltaram pro espelho da casa. Algo mudou no corredor.'];
  },

  // ------------------------------------------------------------ CAÇADA 1
  hunt1() {
    const F = this.F, g = this.g;
    if (F.hunt1Started || F.hunt1Done) return;
    g.checkpoint('a2_hunt1', true);
    F.hunt1Started = true;
    this.huntId = 1;
    this.run(async (s) => {
      audio.play('honk', { pos: [5.4, 1.4, 8.9], v: 0.8, rev: 0.8 });
      g.setLight('corredor1', true, 2.5); g.setLight('corredor2', true, 2.5);
      await s.wait(1.6);
      this.msg('ESCONDA-SE.', { glitch: true });
      this.toast('ESCONDA-SE!\nGuarda-roupas e embaixo das camas (E).\nCorrer faz barulho. Agachar (C) é silencioso.', 6);
      await s.wait(3.0);
      const d = g.world.doors.get('porta_pais');
      if (d) { d.locked = false; d.openNow(false, { speed: 0.5 }); }
      audio.play('creak', { pos: [g.layout.P, 1.5, 7.2], dur: 2.5, v: 1.2 });
      await s.wait(1.5);
      g.entity.startHunt({ from: 'pp1', duration: 38, exit: 'pp1', strength: 0.95, patrol: ['c3', 'c2', 'c1', 'c0', 's_cd', 's3', 's2', 'c2', 'r1', 'm1', 'c1'], onEnd: () => this.hunt1End() });
    });
  },
  hunt1End() {
    const F = this.F, g = this.g;
    F.hunt1Done = true;
    audio.music(null);
    this.rule('ouve', 'Ele ouve. Correr, bater porta e fazer barulho chamam ele. Agachada eu quase não faço som.');
    this.rule('buzina', 'Antes dele aparecer, alguém buzina. Uma buzina de palhaço.');
    this.rule('esconde', 'Escondida, ele não me vê — a não ser que me veja entrando. Se chegar muito perto, prender a respiração (ESPAÇO).');
    if (g.player.hidden) { F.armClownScare = true; F.armClownAt = this.t; }
    else this.after(2, () => { g.clown.show(g.layout.P - 0.6, 7.2, -Math.PI / 2, 'ec'); this.after(1.2, () => { g.setLight('corredor2', true, 1.2); this.after(0.6, () => g.clown.hide()); }); });
    this.after(6, () => { this.msg('Esse palhaço está com ele. Não confie.'); g.checkpoint('a2_after_hunt1'); });
  },
  clownExitScare() {
    const g = this.g, F = this.F;
    F.armClownScare = false;
    const p = g.player.pos;
    const fwd = new THREE.Vector3(-Math.sin(g.player.yaw), 0, -Math.cos(g.player.yaw));
    g.clown.show(p.x + fwd.x * 0.95, p.z + fwd.z * 0.95, g.player.yaw + Math.PI, 'ec');
    const lvl = settings.scare;
    g.clown.honk(lvl === 2 ? 1.3 : 0.7);
    if (lvl > 0) { audio.play('stinger_small', { v: lvl === 2 ? 1 : 0.5 }); g.player.shake(lvl === 2 ? 0.7 : 0.3); g.ui.flash(lvl === 2 ? 0.35 : 0.15, 0.3); }
    this.after(1.3, () => { g.lightMul = 0; this.after(0.35, () => { g.clown.hide(); g.lightMul = 1; }); });
  },

  // ------------------------------------------------------------ JÚLIA: espelho redondo + cômoda
  mirrorJulia() {
    const F = this.F;
    if (F.juliaFound) { this.say0('', 'No espelho, a cama está vazia. A {julia} não está mais lá.'); return; }
    F.sawMirrorJulia = true;
    this.run(async (s) => {
      await s.say('{rafa}', '*No espelho, a {julia} tá sentada na cama. Olhando pra mim.*', { dur: 3.2 });
      await s.say('{rafa}', '*E a cômoda do reflexo... tá com gavetas abertas. A de verdade não.*', { dur: 3.4 });
      this.note('espelho_redondo', 'Espelho redondo', 'No reflexo: a {julia} sentada na cama.\nA cômoda do reflexo tem gavetas abertas e fechadas num padrão.\n(Olhe de novo para conferir.)', { show: false, where: 'quarto roxo' });
    });
  },
  checkDresser() {
    const F = this.F, g = this.g;
    if (F.act !== 2 || F.wardrobeRoxoUnlocked) return;
    const d = g.world.get('dresser_drawers');
    if (!d) return;
    const want = [true, false, false, true];
    if (d.every((dr, i) => dr.isOpen === want[i])) {
      F.wardrobeRoxoUnlocked = true;
      this.progress();
      audio.play('unlock', { pos: [6.72, 1.0, 4.0] });
      this.after(0.8, () => { audio.play('chime', { notes: [64, 67, 71], v: 0.5 }); this.say0('{rafa}', '*Clique. O guarda-roupa destravou sozinho.*'); });
      const mj = g.echoes.get('m_julia');
      if (mj) mj.opts.pointAt = { x: 6.72, z: 3.8 }, mj.anim = 'point';
    }
  },
  prompt_wardrobe_roxo() {
    const F = this.F;
    if (F.act === 2 && F.wardrobeRoxoUnlocked && !F.gotJuliaItems) return 'Abrir o guarda-roupa';
    return undefined;
  },
  do_wardrobe_roxo() {
    const F = this.F, g = this.g;
    if (!(F.act === 2 && F.wardrobeRoxoUnlocked && !F.gotJuliaItems)) {
      if (F.act === 2 && !F.wardrobeRoxoUnlocked && !g.entity.hunt) { audio.play('locked', { pos: [6.72, 1, 4] }); this.say0('{rafa}', '*Emperrado. Como se estivesse preso por dentro.*'); return true; }
      return false;
    }
    this.run(async (s) => {
      const lv = g.world.get('wr_roxo');
      lv.forEach((l) => { l.target = 1; });
      audio.play('door_open', { pos: [6.72, 1, 4], creakChance: 1 });
      F.wardrobeRoxoOpen = true;
      g.applyWorld();
      await s.wait(0.8);
      F.gotJuliaItems = true;
      this.give('fone', true);
      this.give('caixinha', true);
      g.phone.apps.radio = true;
      g.applyWorld();
      this.toast('Pegou: Fone de ouvido da {julia} e Caixinha de música\nR: rádio — o chiado aumenta quando ELE está perto.', 5);
      await s.wait(1.5);
      this.note('caixinha', 'Bilhete na caixinha de música', '[[Quando o seu pai esquecer da gente, toca isso pra ele. É a música que faz ele lembrar. Ele sempre volta.]]\n\n— Mãe', { where: 'guarda-roupa do quarto roxo' });
      await s.wait(0.5);
      await this.juliaFound(s);
      lv.forEach((l) => { l.target = 0; });
    });
    return true;
  },
  async juliaFound(s) {
    const g = this.g, F = this.F;
    F.juliaFound = true;
    g.echoes.remove('v_julia');
    const e = g.echoes.get('m_julia');
    if (e) e.anim = 'look';
    await s.say('{julia}', '*(no reflexo, sussurrando)* {rafa}... não deixa ele lembrar da casa.', { dur: 3.6, tts: 'julia' });
    g.echoes.fadeOut('m_julia', 2.5);
    audio.play('chime', { v: 0.6 });
    this.toast(`{julia}: encontrada (${this.familyCount()}/4) · casa.mp4: ${Math.round(this.sim())}% igual`, 3.5);
    this.objective('family');
    this.after(4, () => this.familyComplaint());
    g.checkpoint('a2_julia');
    this.checkFamilyDone();
  },
  familyComplaint() {
    const n = this.familyCount();
    const L = ['', 'A porcentagem caiu. O que você fez?', 'Pare de mexer nos espelhos. Conserte a casa.', '{rafaela}. Estou avisando.', ''];
    if (L[n]) this.msg(L[n]);
  },
  radioBroadcast() {
    this.run(async (s) => {
      this.radioExtra = 0.5;
      await s.say('RÁDIO', '...kssshh... atenção, moradores... o visitante foi visto... usando a voz de familiares...', { dur: 4.4, kind: 'house', tts: 'tv' });
      await s.say('RÁDIO', '...não respondam mensagens... recebidas sem sinal... repetindo: sem sinal...', { dur: 4.2, kind: 'house' });
      await s.say('RÁDIO', '...e se o antigo morador acordar... kssshh... fiquem parados... ele só enxerga... quem se mexe...', { dur: 4.8, kind: 'house' });
      await s.say('RÁDIO', '...não deixem a casa... kssshh... igual...', { dur: 3.2, kind: 'house' });
      this.radioExtra = 0;
      this.F.heardRadio = true;
      await s.wait(2);
      this.msg('Desliga esse rádio. Ele está com ELE.');
    });
  },

  // ------------------------------------------------------------ MÃE: rotina na cozinha
  startMomRoutine() {
    const g = this.g;
    if (g.echoes.get('mae_route')) return;
    g.echoes.add('mae_route', {
      x: -1.4, z: 6.4, spec: 'k', hair: 'bun', color: 0xffe0c0, alpha: 0.75, caption: 'A mãe, repetindo uma rotina.',
      route: [
        { x: -2.3, z: 5.85, wait: 2.4, yaw: -Math.PI / 2, act: 'cab' },
        { x: -2.3, z: 5.2, wait: 2.4, yaw: -Math.PI / 2, act: 'stove' },
        { x: -0.55, z: 5.25, wait: 2.4, yaw: Math.PI, act: 'freezer' },
        { x: -1.4, z: 6.5, wait: 2.0 },
      ],
    });
  },
  onEchoAct(id, act) {
    if (id !== 'mae_route') return;
    const g = this.g;
    if (!g.phone.raised || g.phone.mode !== 'camera') return;
    if (act === 'cab') audio.play('door_open', { pos: [-2.7, 1.9, 5.85], vol: 0.25, creakChance: 0 });
    if (act === 'stove') audio.play('stove', { pos: [-2.7, 1.0, 5.2], vol: 0.35 });
    if (act === 'freezer') audio.play('fridge_open', { pos: [-0.55, 1.4, 4.8], vol: 0.35 });
    if (!this.F.sawRoutine) { this.F.sawRoutine = true; this.after(1, () => this.say0('{rafa}', '*É a mãe... só aparece na câmera. Ela faz sempre a mesma coisa. Na mesma ordem.*')); }
  },
  routineStep(step) {
    const F = this.F, g = this.g;
    if (F.act !== 2 || F.momFound || F.iceVisible || F.hasIce || F.hasMomKeys) return;
    const order = ['cab', 'stove', 'freezer'];
    this.routine = this.routine || [];
    const expect = order[this.routine.length];
    if (step === expect) {
      this.routine.push(step);
      audio.play('musicbox_note', { f: [523, 659, 784][this.routine.length - 1], v: 0.12 });
      if (this.routine.length === 3) { F.iceVisible = true; this.progress(); g.applyWorld(); this.after(0.8, () => this.say0('{rafa}', '*Tem um bloco de gelo no congelador. Com um chaveiro dentro.*')); }
    } else if (this.routine.length > 0) {
      this.routine = [];
      const cabs = g.world.get('cabinets');
      if (cabs) cabs.forEach((c) => c.set(0));
      audio.play('door_slam', { pos: [-2.7, 1.9, 6.1], vol: 0.7 });
      audio.play('whisper', { pos: [-1.5, 1.6, 6], v: 0.8 });
      this.say0('{rafa}', '*As portas bateram sozinhas. Não era essa a ordem.*');
    }
  },
  do_cab_4() { const l = this.g.world.get('cabinets')[3]; if (l && l.target < 0.5) this.routineStep('cab'); return false; },
  do_cab_1() { const l = this.g.world.get('cabinets')[0]; if (l && l.target < 0.5) this.routineStep('x'); return false; },
  do_cab_2() { const l = this.g.world.get('cabinets')[1]; if (l && l.target < 0.5) this.routineStep('x'); return false; },
  do_cab_3() { const l = this.g.world.get('cabinets')[2]; if (l && l.target < 0.5) this.routineStep('x'); return false; },
  do_cab_5() { const l = this.g.world.get('cabinets')[4]; if (l && l.target < 0.5) this.routineStep('x'); return false; },
  do_cab_6() { const l = this.g.world.get('cabinets')[5]; if (l && l.target < 0.5) this.routineStep('x'); return false; },
  prompt_stove() { return this.F.act === 2 && !this.F.momFound ? 'Acender o fogão' : 'Fogão'; },
  do_stove() {
    const g = this.g;
    if (!(this.F.act === 2 && !this.F.momFound)) { this.say0('', 'O fogão. Ainda tem cheiro de café.'); return; }
    audio.play('stove', { pos: [-2.7, 1.0, 5.2] });
    const fl = g.world.get('stove_flame'); if (fl) { fl.visible = true; this.after(5, () => { fl.visible = false; }); }
    this.routineStep('stove');
  },
  do_freezer_door() {
    const F = this.F, g = this.g;
    const d = g.world.get('freezer_door');
    if (d && d.target < 0.5) { audio.play('fridge_open', { pos: [-0.55, 1.4, 4.8] }); this.routineStep('freezer'); g.setLight('fridge_light', true); }
    else { g.setLight('fridge_light', false); if (F.armFridgeClown) { F.armFridgeClown = false; this.after(0.3, () => this.fridgeClownStart()); } }
    return false;
  },
  do_fridge_door() {
    const d = this.g.world.get('fridge_door');
    if (d && d.target < 0.5) { audio.play('fridge_open', { pos: [-0.55, 0.8, 4.8] }); this.g.setLight('fridge_light', true); }
    else this.g.setLight('fridge_light', false);
    return false;
  },
  prompt_fridge_note() { return 'Ler o bilhete'; },
  do_fridge_note() { this.note('bilhete_geladeira', 'Bilhete na geladeira', '[[{rafa}: ração dos gatos de manhã e de noite. A {lili} só come se ninguém estiver olhando.\nNão mexe na gaveta do rack, é das fotos antigas.\nTe amo. — Mãe]]', { where: 'geladeira' }); },
  prompt_ice_block() { return this.F.iceVisible && !this.F.hasIce ? 'Pegar o bloco de gelo' : null; },
  do_ice_block() {
    const F = this.F, g = this.g;
    F.hasIce = true;
    this.give('gelo');
    audio.play('ice');
    g.applyWorld();
    this.progress();
    F.armFridgeClown = true;
    g.checkpoint('a2_ice', true);
    F.armFridgeClown = true;
    this.after(8, () => { if (F.armFridgeClown) { F.armFridgeClown = false; this.fridgeClownStart(); } });
  },
  fridgeClownStart() {
    const g = this.g;
    const p = g.player.pos;
    const back = new THREE.Vector3(Math.sin(g.player.yaw), 0, Math.cos(g.player.yaw));
    let x = p.x + back.x * 1.0, z = p.z + back.z * 1.0;
    x = Math.max(-2.3, Math.min(-0.3, x)); z = Math.max(4.9, Math.min(7.6, z));
    g.clown.show(x, z, Math.atan2(p.x - x, p.z - z), 'ec');
    audio.play('honk', { pos: [x, 1.4, z], v: 0.35, single: true });
    this.fridgeClown = this.t;
  },
  fridgeClownReveal() {
    const g = this.g;
    this.fridgeClown = null;
    const lvl = settings.scare;
    g.clown.honk(lvl === 2 ? 1.3 : 0.7);
    if (lvl > 0) { audio.play('stinger_small', { v: lvl === 2 ? 1 : 0.5 }); g.player.shake(lvl === 2 ? 0.8 : 0.3); g.ui.flash(lvl === 2 ? 0.3 : 0.12, 0.3); }
    this.after(1.2, () => { g.lightMul = 0; this.after(0.4, () => { g.clown.hide(); g.lightMul = 1; this.startHunt2(); }); });
  },
  startHunt2() {
    const F = this.F, g = this.g;
    if (F.hunt2Started && g.entity.hunt) return;
    F.hunt2Started = true;
    this.huntId = 2;
    this.toast('Ele está vindo. ESCONDA-SE.', 3);
    if (F.invited) {
      const d = g.world.doors.get('porta_entrada');
      if (d) { d.locked = false; d.openNow(false, { slam: true, speed: 6 }); }
      g.entity.startHunt({ from: 's_ent', duration: 40, exit: 's_ent', strength: 1.0, patrol: ['k1', 'k2', 'k3', 'sv1', 's2', 's3', 'k0', 's1'], onEnd: () => this.hunt2End() });
    } else {
      g.entity.startHunt({ from: 'c3', duration: 45, exit: 'c3', strength: 1.0, patrol: ['k1', 'k2', 'k3', 'sv1', 's2', 's3', 'k0', 'c1'], investigate: { x: -1.2, z: 5.8 }, onEnd: () => this.hunt2End() });
    }
  },
  hunt2End() {
    const F = this.F, g = this.g;
    F.hunt2Done = true;
    audio.music(null);
    const d = g.world.doors.get('porta_entrada');
    if (d) { d.close(); d.locked = true; }
    if (F.invited) this.after(2, () => this.say0('{rafa}', '*Ele entrou pela porta da frente. ...Porque eu deixei.*'));
    this.after(4, () => g.checkpoint('a2_hunt2'));
  },
  prompt_microwave() { return this.has('gelo') ? 'Descongelar o gelo no micro-ondas' : 'Micro-ondas'; },
  do_microwave() {
    const F = this.F, g = this.g;
    if (!this.has('gelo')) { this.say0('', F.act === 1 ? 'O micro-ondas marca 03:07.' : 'O relógio do micro-ondas pisca 03:33, 03:33, 03:33.'); return; }
    this.run(async (s) => {
      this.take('gelo');
      audio.play('microwave', { pos: [-1.3, 1.05, 4.32], dur: 3.5 });
      g.noise(-1.3, 4.3, 7);
      await s.wait(4.5);
      this.give('chaves_mae');
      F.hasMomKeys = true;
      g.applyWorld();
      this.progress();
      await s.wait(0.8);
      await this.momFound(s);
    });
  },
  async momFound(s) {
    const g = this.g, F = this.F;
    const e = g.echoes.get('mae_route');
    if (e) { e.route = null; e.anim = 'look'; e.f.position.set(-1.3, 0, 5.0); e.opts.spec = 'ekc'; vis(e.f, 'ekcv'); }
    await s.say('Mãe', '*(bem baixinho)* Filha... a chave reserva tá com você agora.', { dur: 3.4, tts: 'mae', vol: 0.5 });
    await s.say('Mãe', '*(bem baixinho)* Cuidado com o que você conserta.', { dur: 3, tts: 'mae', vol: 0.5 });
    F.momFound = true;
    g.echoes.remove('v_mae');
    await g.echoes.fadeOut('mae_route', 2.5);
    audio.play('chime', { v: 0.6 });
    this.toast(`Mãe: encontrada (${this.familyCount()}/4) · casa.mp4: ${Math.round(this.sim())}% igual`, 3.5);
    this.objective('family');
    this.after(3, () => this.familyComplaint());
    g.checkpoint('a2_mae');
    this.checkFamilyDone();
  },

  // gaveta do rack (chave pequena da mãe)
  prompt_rack_drawer() { return this.has('chaves_mae') && !this.F.rackOpened ? 'Abrir a gaveta com a chave pequena' : undefined; },
  do_rack_drawer() {
    const F = this.F, g = this.g;
    if (!this.has('chaves_mae') || F.rackOpened) return false;
    F.rackOpened = true;
    const dr = g.world.get('rack_drawer_obj');
    if (dr) { dr.locked = false; dr.set(1); }
    audio.play('unlock', { pos: [0.4, 0.33, 3.1] });
    audio.play('drawer', { pos: [0.4, 0.33, 3.1], delay: 0.3 });
    this.give('foto_festa');
    F.clownLooked = true;
    g.applyWorld();
    this.note('cartao_festa', 'Cartão guardado com a foto', '[[Tique-Taque — o palhaço que para o tempo.\nContratado pra festa de 5 anos da {rafa}.\nEla chorou quando ele foi embora. Ele disse que ia lembrar dela pra sempre.]]\n\n(A letra é da mãe. Embaixo, com outra letra, torta: "EU LEMBRO.")', { where: 'gaveta do rack' });
    return true;
  },

  // ------------------------------------------------------------ PAI: o Esquecido
  enter_pais() {
    const F = this.F, g = this.g;
    if (F.act !== 2 || !F.power || F.dadFound || g.esquecido.active) return;
    const Px = g.layout.P;
    g.esquecido.spawn(Px + 2.3, 8.7);
    g.esquecido.model.rotation.y = Math.PI;
    g.echoes.add('m_pai', { x: Px + 2.3, z: 8.7, spec: 'm', hat: true, color: 0xffe6c8, alpha: 0.8, h: 1.78 });
    g.flags.fanPais = 2.5;
    audio.play('creak', { pos: [Px + 1.8, 2.4, 7.2], dur: 2, v: 0.8 });
    if (!F.metEsquecido) {
      F.metEsquecido = true;
      this.after(1.5, () => this.say0('{rafa}', '*Pai...? Por que você tá tão escuro?*'));
    }
  },
  onEsquecidoSpeak() {
    const L = ['Quem é você?', 'Essa casa não é minha.', 'Eu esqueci alguma coisa... eu esqueci alguém.', 'Sai do meu quarto.', 'Tinha uma música... como era a música?'];
    this._esqI = ((this._esqI || 0) + 1) % L.length;
    this.voice(L[this._esqI], { tts: 'pai' });
    this.g.ui.say('O pai (?)', L[this._esqI], 2.6, 'enemy');
  },
  onEsquecidoTouch() {
    const g = this.g, F = this.F;
    this.run(async (s) => {
      this.cut(true);
      audio.play('thud', { v: 0.9 });
      audio.play('gasp');
      g.player.shake(0.8);
      g.ui.flash(0.3, 0.3, '#200');
      await g.ui.fade(1, 0.4);
      const Px = g.layout.P;
      g.player.teleport(Px - 0.8, 7.2, Math.PI / 2, 0);
      const d = g.world.doors.get('porta_pais');
      if (d) d.set(0);
      g.esquecido.pos.set(Px + 2.3, 0, 8.7);
      g.esquecido.pushed = false;
      await s.wait(0.6);
      await g.ui.fade(0, 0.8);
      this.cut(false);
      await s.say('{rafa}', '*Ele me empurrou pra fora. Ele não me reconheceu.*', { dur: 3 });
      if (!F.pushedOnce) { F.pushedOnce = true; this.toast(this.has('caixinha') ? 'Você tem a caixinha de música...' : 'Talvez exista alguma coisa que faça ele lembrar.', 4); }
    });
  },
  playMusicBox() {
    const g = this.g, F = this.F;
    const es = g.esquecido;
    this.run(async (s) => {
      this.cut(true, { look: true });
      es.calm = true;
      const dur = audio.musicBox(g.player.eye, 1.0);
      await s.wait(3.0);
      await s.say('O pai', '...essa música...', { dur: 2.4, tts: 'pai' });
      await s.wait(1.5);
      await s.say('O pai', 'A {mae} colocava ela pra... {rafa}? Filha?', { dur: 3.4, tts: 'pai' });
      await s.say('O pai', 'Eu tava esquecendo vocês. Tava esquecendo a nossa casa.', { dur: 3.6, tts: 'pai' });
      await s.wait(Math.max(0, dur - 11));
      es.model.traverse((o) => { if (o.material) { o.material.transparent = true; } });
      for (let i = 0; i < 20; i++) { es.model.traverse((o) => { if (o.material && o.material.opacity !== undefined) o.material.opacity = Math.max(0, 1 - i / 20); }); await s.wait(0.08); }
      es.hide();
      g.echoes.fadeOut('m_pai', 2);
      F.dadFound = true;
      g.echoes.remove('v_pai');
      g.flags.fanPais = 0;
      g.applyWorld();
      audio.play('chime', { v: 0.6 });
      this.toast(`Pai: encontrado (${this.familyCount()}/4) · casa.mp4: ${Math.round(this.sim())}% igual`, 3.5);
      this.rule('musica', 'A música da caixinha acalma quem esqueceu.');
      await s.wait(1.5);
      // no espelho (a memória da casa): alguém muito alto, de mãos pra cima, atrás de você
      const Px = g.layout.P, pale = g.pale;
      await g.player.lookAt(new THREE.Vector3(Px + 1.8, 1.35, 5.51), 1.0);
      await s.say('{rafa}', '*Tem alguma coisa escrita no espelho... só no reflexo. Em vermelho.*', { dur: 3.2 });
      pale.show(Px + 1.15, 8.85, 0, 'look', 'm');
      pale.state = 'static';
      pale.setEyes(true, 1); pale.eyes = 1;
      audio.play('pale_click', { pos: [Px + 1.15, 2.0, 8.85], v: 0.5 });
      audio.play('pale_inhale', { pos: [Px + 1.15, 2.0, 8.85], v: 0.5, delay: 0.2 });
      await s.wait(2.4);
      pale.setPose('stand', false, 2); pale.eyesTarget = 0;
      await s.say('{rafa}', '*...e atrás de mim, no reflexo, alguém muito alto. Com as mãos levantadas, viradas pra mim.*', { dur: 3.8 });
      pale.hide();
      await s.say('{rafa}', '*Sumiu. Não tem ninguém atrás de mim. Não tem. Não tem.*', { dur: 3 });
      this.cut(false);
      this.msg('Ignore o espelho. É ele tentando te confundir.');
      this.objective('family');
      g.checkpoint('a2_pai');
      this.checkFamilyDone();
    });
  },
  prompt_hat() { return undefined; },
  prompt_hat_floor() { return this.F.act >= 3 && !this.F.hasDadKey ? 'Olhar dentro do chapéu' : 'Chapéu de palha'; },
  do_hat_floor() {
    const F = this.F;
    if (F.act >= 3 && !F.hasDadKey) { F.hasDadKey = true; this.give('chave_pai'); this.g.applyWorld(); this.say0('{rafa}', '*A chave do pai. Tava escondida no chapéu.*'); return; }
    this.say0('', 'O chapéu de palha do pai. Cheira a chuva, e a uma noite muito longa.');
  },

  // ------------------------------------------------------------ PEDRO: notebook
  prompt_porta_meninos() { if (this.F.act === 2 && !this.F.hasMomKeys) return 'Porta trancada'; return undefined; },
  prompt_laptop() { if (this.phase === 'hn') return this.prompt_hn_laptop(); const F = this.F; if (!F.laptopUnlocked) return 'Ligar o notebook do {wendel}'; if (F.act === 2 && !F.webcamDone) return 'Mexer no notebook'; return 'Notebook'; },
  do_laptop() {
    const F = this.F, g = this.g;
    if (this.phase === 'hn') { this.do_hn_laptop(); return true; }
    if (!F.laptopUnlocked) {
      this.run(async (s) => {
        let tries = 0;
        const bento = names.bento, lili = names.lili;
        const ok = [bento + lili, lili + bento, bento + 'e' + lili, lili + 'e' + bento].map(norm);
        const r = await g.ui.keypad({
          title: 'Notebook do {wendel}', hint: 'Dica de senha: "os donos da casa" 🐱🐱', mode: 'text',
          check: (v) => { if (ok.includes(norm(v))) return true; tries++; return tries >= 3 ? 'Senha incorreta. (Quem manda de verdade nesta casa? Dois nomes, juntos.)' : 'Senha incorreta.'; },
        });
        g.resumePointer(true);
        if (r === null || r === undefined) return;
        F.laptopUnlocked = true;
        this.progress();
        audio.play('record_beep');
        const lp = g.world.get('laptop'); if (lp) lp.screen.material = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        await this.showDesktop();
        if (F.act === 2) this.webcamSequence();
      });
      return;
    }
    if (F.act === 2 && !F.webcamDone) { this.webcamSequence(); return; }
    this.showDesktop();
  },
  async showDesktop() {
    this.F.laptopSeen = true;
    await this.note('notebook', 'Notebook do {wendel}',
      'Papel de parede: preto, com uma faixa branca atravessada.\n\n' +
      '▸ Upload concluído: casa.mp4 (2 min 11 s) — enviado ontem, 16:44\n\n' +
      '▸ Conversa aberta com "desconhecido":\n' +
      '16:45  desconhecido: Recebido. Obrigado por me mostrar a casa.\n' +
      '16:45  desconhecido: Agora eu vou me lembrar dela.\n' +
      '16:46  desconhecido: Quantas pessoas moram aí?\n' +
      '16:46  {wendel}: seis kkkk oito contando os gatos\n' +
      '16:47  desconhecido: Vou conhecer todas.\n\n' +
      '▸ projeto.txt\n"gravar a casa inteira, todos os cômodos. mandar o vídeo.\n(ideia: fazer um jogo de terror pra {rafa} kkkk)"',
      { style: 'screen', where: 'quarto dos meninos' });
  },
  webcamSequence() {
    const F = this.F, g = this.g;
    if (F.webcamDone) return;
    F.webcamDone = true;
    g.checkpoint('a2_laptop', true);
    this.run(async (s) => {
      const lp = g.world.get('laptop');
      const cc = g.cctvCam;
      cc.position.set(7.78, 1.02, 4.3);
      cc.lookAt(9.2, 1.2, 5.6);
      const mat = new THREE.ShaderMaterial({
        uniforms: { tRT: { value: g.cctvRT.texture } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform sampler2D tRT; varying vec2 vUv; void main(){ vec3 c = texture2D(tRT, vUv).rgb * 2.4; float l = dot(c, vec3(0.3,0.59,0.11)); gl_FragColor = vec4(mix(c, vec3(l), 0.4), 1.0); }',
      });
      const old = lp.screen.material;
      lp.screen.material = mat;
      g.cctvOn = true;
      g.setLight('laptop_glow', true);
      // o Pedro aparece sentado na cama, só pela webcam
      g.echoes.add('k_pedro', { x: 9.9, z: 4.9, yaw: -Math.PI / 2, spec: 'ck', hair: 'short', sitting: true, anim: 'look', color: 0xffe0c0, alpha: 0.8, h: 1.7 });
      await s.say('{rafa}', '*Abriu a câmera sozinha. "AO VIVO".*', { dur: 2.6 });
      await s.say('{rafa}', '*...o {pedro} tá sentado na cama. Atrás de mim. Só na tela.*', { dur: 3.2 });
      const e = g.entity;
      e.show(8.71, 6.55, 0, 'c');
      audio.play('swell', { dur: 3, v: 0.4 });
      await s.wait(2.0);
      await s.say('{rafa}', '*E tem mais alguém. Na porta.*', { dur: 2.4 });
      const y0 = g.player.yaw;
      let tt = 0, turned = false;
      while (tt < 8) {
        await s.wait(0.1); tt += 0.1;
        const p = g.player.pos;
        const k = Math.min(1, tt / 8);
        e.place(8.71 + (p.x + 0.4 - 8.71) * k * 0.8, 6.55 + (p.z - 6.55) * k * 0.8, Math.atan2(-(p.x - 8.71), -(p.z - 6.55)));
        if (Math.abs(angleDiff(y0, g.player.yaw)) > 1.6) { turned = true; break; }
      }
      if (turned) {
        e.hide();
        await s.say('{rafa}', '*...não tem ninguém.*', { dur: 2 });
        await s.wait(1.5);
        while (!this.lookingAt([7.72, 0.95, 4.3], 0.5, 3)) await s.wait(0.1);
      }
      // de volta pra tela: o rosto
      e.show(7.55, 4.3, -Math.PI / 2, 'c');
      e.model.position.y = -1.3;
      cc.lookAt(7.4, 1.0, 4.3);
      cc.position.set(7.85, 1.02, 4.3);
      const lvl = settings.scare;
      if (lvl > 0) { audio.play('stinger', { v: lvl === 2 ? 0.9 : 0.45 }); g.player.shake(lvl === 2 ? 1 : 0.4); this.glitch = 1; }
      else audio.play('boom', { v: 0.5 });
      await s.wait(0.9);
      this.glitch = 0;
      e.hide();
      g.cctvOn = false;
      lp.screen.material = old;
      g.setLight('laptop_glow', false);
      g.echoes.remove('k_pedro');
      this.startHunt3(false);
    });
  },
  startHunt3(resumed) {
    const F = this.F, g = this.g;
    this.huntId = 3;
    g.setLight('meninos', false); g.setLight('corredor2', false, 0);
    g.setLight('corredor1', true, 3);
    // a casa abre a porta que não existe
    const d = g.world.doors.get('porta_extra');
    if (d) { d.locked = false; d.openNow(false, { speed: 1.2 }); }
    g.setLight('extra', true);
    const f = g.fixture('extra'); if (f) f.intensity = 3;
    this.toast('CORRA! A porta que não existe se abriu!', 3.5);
    g.entity.startHunt({ x: resumed ? 4.6 : 8.71, z: resumed ? 7.2 : 6.2, duration: 60, exit: 'c0', strength: 0.95, patrol: ['c2', 'c4', 'c1', 'c3'] });
    if (!resumed) { g.entity.state = 'chase'; g.entity.lastSeen = { x: g.player.pos.x, z: g.player.pos.z }; audio.music('chase'); }
    g.entity.hunt.onEnd = () => this.hunt3End();
  },
  onEntityBlocked(t) {
    if (this.huntId === 3 && !this.F.hunt3Done && t > 0.6) this.entityBlocked();
  },
  entityBlocked() {
    const F = this.F, g = this.g;
    if (this._blocked) return;
    this._blocked = true;
    this.run(async (s) => {
      const e = g.entity;
      e.state = 'static';
      e.place(12.21, 7.25, Math.PI); // de frente para a porta que não existe
      audio.play('scream', { pos: e.pos, v: 0.9, dur: 2 });
      for (let i = 0; i < 6; i++) { audio.play('crack', { pos: [12.2, 1.2, 7.6] }); audio.play('knock', { pos: [12.2, 1.2, 7.65], n: 1, v: 1 }); await s.wait(0.5); }
      await s.say('{rafa}', '*Ele parou. Ele não consegue passar dessa porta.*', { dur: 3 });
      e.endHunt();
      e.state = 'leave';
      await s.wait(2);
      this.hunt3End();
    });
  },
  hunt3End() {
    const F = this.F, g = this.g;
    if (F.hunt3Done) return;
    F.hunt3Done = true;
    this._blocked = false;
    audio.music(null);
    g.entity.hide();
    this.rule('porta', 'Ele não atravessa a porta que não existe. Ele não entra no que a casa fez.');
    this.run(async (s) => {
      await s.wait(2.5);
      this.msg('Ele não conhece essa porta porque ela não está no vídeo.');
      await s.wait(1.6);
      this.msg('É por isso que a casa precisa ficar igual. Para ele não ter onde se esconder de você.');
      await s.wait(2);
      // o Pedro aparece na porta da casa
      g.echoes.add('k_pedro2', { x: 12.2, z: 8.1, yaw: Math.PI, spec: 'ek', hair: 'short', anim: 'look', color: 0xffe0c0, alpha: 0.7, h: 1.7 });
      await s.say('{pedro}', '*(de dentro da porta)* Ele não entra nas portas que a casa faz, {rafa}. Só nas que ele conhece.', { dur: 4 });
      F.pedroFound = true;
      g.echoes.remove('v_pedro');
      await g.echoes.fadeOut('k_pedro2', 2.5);
      audio.play('chime', { v: 0.6 });
      this.toast(`{pedro}: encontrado (${this.familyCount()}/4) · casa.mp4: ${Math.round(this.sim())}% igual`, 3.5);
      this.objective('family');
      this.after(3, () => this.familyComplaint());
      g.checkpoint('a2_pedro');
      this.checkFamilyDone();
    });
  },

  // ------------------------------------------------------------ LILI (opcional)
  prompt_rack_door() {
    const F = this.F;
    if (F.act === 2 && !F.liliFollow) return F.sawLiliRack ? (this.has('racao') ? 'Chamar a {lili} com a ração' : 'Chamar a {lili}') : 'Abrir a portinha do rack';
    return 'Portinha do rack';
  },
  do_rack_door() {
    const F = this.F, g = this.g;
    if (!(F.act === 2 && !F.liliFollow)) { this.say0('', 'Só cabos e controles velhos.'); return; }
    if (!F.sawLiliRack) { F.sawLiliRack = true; g.cats.lili.hiss(); this.say0('{rafa}', '*Dois olhos brilhando lá no fundo. A {lili}! Ela tá tremendo.*'); return; }
    if (!this.has('racao')) { g.cats.lili.hiss(); this.say0('{rafa}', '*Ela não sai. Talvez com comida.*'); return; }
    F.liliFollow = true;
    audio.play('ice', { pos: [0.4, 0.2, 3.7] });
    const l = g.cats.lili;
    l.place(0.8, 3.7, Math.PI / 2);
    l.meow(0.9);
    l.mode = 'follow';
    this.after(2, () => this.say0('{rafa}', '*Vem, {lili}. Fica comigo.*'));
    this.rule('lili', 'A {lili} fica comigo. Ela sibila e arrepia quando ele está perto — mesmo quando eu não vejo nada.');
    g.checkpoint('a2_lili', true);
  },

  // ------------------------------------------------------------ VASCO (segredo)
  prompt_flag() { return 'Bandeira (tem um bilhete)'; },
  do_flag() { this.note('bilhete_bandeira', 'Bilhete preso na bandeira', '[[senha da gaveta: o ano em que o Gigante nasceu.\nvocê sabe, {rafa} 🖤🤍\n— W]]', { where: 'quarto dos meninos' }); },
  prompt_vasco_drawer() { return this.F.vascoOpen ? 'Gaveta (aberta)' : 'Gaveta com cadeado'; },
  do_vasco_drawer() {
    const F = this.F, g = this.g;
    if (F.vascoOpen) { this.say0('', 'A gaveta está vazia agora. Só um cheiro de camisa guardada.'); return; }
    this.run(async (s) => {
      const r = await g.ui.keypad({
        title: 'Cadeado de 4 dígitos', mode: 'wheels', wheels: [0, 1, 2, 3].map(() => ({ values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] })),
        hint: '', check: (v) => (v === '1898' ? true : 'Não abriu.'),
      });
      g.resumePointer(true);
      if (!r) return;
      F.vascoOpen = true;
      audio.play('unlock');
      const lk = g.world.get('vasco_lock'); if (lk) lk.visible = false;
      this.give('powerbank');
      await this.note('vasco', 'Dentro da gaveta', 'Uma bateria portátil carregada, e um papel dobrado:\n\n[[Camisa preta, faixa branca atravessada no peito.\nQuem veste essa camisa não desiste no meio do jogo.\nNunca tira a sua, {rafa}. Dá sorte.\n— W 🖤🤍]]', { where: 'gaveta do quarto dos meninos' });
      this.toast('Segredo encontrado: Gigante da Colina', 3.5);
      F.secretVasco = true;
    });
  },

  // ------------------------------------------------------------ diferenças do ato 2
  prompt_chair_open() { return this.F.act === 2 && !this.F.d_cadeira ? 'Fechar a cadeira e encostar (como no vídeo)' : null; },
  do_chair_open() { this.F.d_cadeira = true; audio.play('thud', { v: 0.5 }); this.g.applyWorld(); this.onFix('cadeira'); this.after(1.5, () => this.msg('Isso.')); },
  prompt_towel_mirror() { return this.F.act === 2 && !this.F.d_toalha ? 'Tirar a toalha do espelho (como no vídeo)' : null; },
  do_towel_mirror() { this.F.d_toalha = true; audio.play('page'); this.g.applyWorld(); this.onFix('toalha'); this.after(1.5, () => this.msg('Isso.')); },

  // ------------------------------------------------------------ fim do ato 2
  checkFamilyDone() {
    const F = this.F, g = this.g;
    if (this.familyCount() < 4 || F.familyDone) return;
    F.familyDone = true;
    this.run(async (s) => {
      await s.wait(4);
      this.phase = 'a2_door';
      audio.play('unlock', { pos: [12.2, 1, 7.7], vol: 1.2 });
      await s.wait(1.0);
      this.doorPhaseAmbience();
      this.msg(`A casa está ${Math.round(this.sim())}% igual. Estava quase.`);
      await s.wait(1.8);
      this.msg('O que você fez, {rafaela}?');
      await s.wait(1.5);
      this.msg('NÃO desça. Conserte a casa.', { glitch: true });
      this.objective('door');
      g.checkpoint('a2_door');
    });
  },
  doorPhaseAmbience() {
    const g = this.g;
    g.setLight('extra', true);
    const f = g.fixture('extra'); if (f) f.intensity = 2.5;
    if (!this._partyLoop) this._partyLoop = audio.loop('party', { pos: [12.2, 0.5, 8.6], vol: 0.6 });
  },
  prompt_porta_extra2() { return undefined; },
};

// hooks das gavetas da cômoda
export function wireDresser(story) {
  const d = story.g.world.get('dresser_drawers');
  if (d) d.forEach((dr) => { const prev = dr.onChange; dr.onChange = (v) => { if (prev) prev(v); story.after(0.4, () => story.checkDresser()); }; });
}
