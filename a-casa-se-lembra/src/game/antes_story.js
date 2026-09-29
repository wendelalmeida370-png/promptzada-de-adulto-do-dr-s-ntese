// ATO 3 — o apartamento de antes e o Morador de Antes (o Pálido).
// A casa guarda uma memória mais velha que a da família: a de quem morou aqui antes.
import * as THREE from 'three';
import { audio } from '../core/audio.js';
import { settings, T } from '../core/settings.js';
import { clamp } from '../core/util.js';
import { buildAntes, AX, AZ } from '../world/antes.js';

const X = (x) => AX + x, Z = (z) => AZ + z;
const WALTZ_HOME = [X(5.67), 1.0, Z(7.9)];

export const antesStory = {
  // ------------------------------------------------------------ a porta de entrada vira a porta de antes
  prompt_porta_entrada() {
    const F = this.F;
    if (F.act >= 3 && this.phase === 'a3') {
      const d = this.g.world.doors.get('porta_entrada');
      if (d && d.target > 0.5) return 'Fechar a porta';
      return F.antesVisited ? 'Abrir a porta (o apartamento de antes)' : 'Abrir a porta de entrada (tem música do outro lado)';
    }
    return undefined;
  },
  do_porta_entrada() {
    const F = this.F, g = this.g;
    if (!(F.act >= 3 && this.phase === 'a3')) return false;
    const d = g.world.doors.get('porta_entrada');
    if (!d) return false;
    if (d.target > 0.5) { d.close(true); return true; }
    this.openAntes();
    d.locked = false;
    d.openNow(true, { speed: 0.8 });
    if (!F.antesSeenDark) {
      F.antesSeenDark = true;
      this.after(1.2, () => this.say0('{rafa}', '*Do outro lado não tem o corredor do prédio. Só escuro. E a valsa, mais alta.*'));
    }
    return true;
  },
  openAntes() {
    const F = this.F, g = this.g;
    if (!F.antesOpen) F.antesOpen = true;
    if (!F.antesBuilt) { F.antesBuilt = true; buildAntes(g.world, F); this.setupLights(); }
    g.applyWorld();
  },
  // música de vitrola: dentro do apartamento de antes, ou abafada atrás da porta de entrada
  antesAudio(inside) {
    const F = this.F;
    const playing = !F.antesTook || F.antesCalm;
    const wantDoor = F.act >= 3 && this.phase === 'a3' && !inside && !F.antesDone;
    if (this._waltz) { this._waltz.stop(0.4); this._waltz = null; }
    if (inside && playing) this._waltz = audio.loop('waltz', { pos: WALTZ_HOME, vol: 0.9, ref: 1.6, rolloff: 1.1, rev: 0.25 });
    else if (wantDoor && playing) this._waltz = audio.loop('waltz', { pos: [0.97, 1.3, 8.6], vol: 0.35, ref: 1.0, rolloff: 1.6 });
  },
  antesRecord(on, withSound) {
    const g = this.g;
    const arm = g.world.get('antes_arm');
    if (arm) arm.rotation.y = on ? 0 : 0.5;
    if (withSound) audio.play(on ? 'needle_drop' : 'needle_scratch', { pos: WALTZ_HOME, v: 1 });
    this.antesAudio(g.player.pos.x > 150);
  },

  // ------------------------------------------------------------ entrar e sair
  enter_antes_in() {
    const F = this.F, g = this.g;
    // o Inquilino não entra na memória de outra pessoa: a caçada dele pausa aqui dentro
    if (g.entity.hunt && g.entity.hunt.endless) { g.entity.hide(); this._huntPaused = true; }
    this.antesAudio(true);
    g.startAmbience('antes');
    this.antesSetupPale();
    if (!F.antesVisited) { F.antesVisited = true; this.run((s) => this.antesFirst(s)); }
    else if (F.antesTook && !F.antesCalm) this.objective('antes_vitrola', true);
  },
  enter_antes_out() {
    const F = this.F, g = this.g;
    this.antesAudio(false);
    g.startAmbience('act3');
    g.pale.hide();
    const d = g.world.doors.get('porta_entrada'); if (d) this.after(0.6, () => d.close());
    if (F.antesDone && !F.antesLeftOnce) {
      F.antesLeftOnce = true;
      this.after(1.0, () => this.say0('{rafa}', '*O registro. Agora o chuveiro.*'));
    }
    if (this.phase === 'a3') this.objective('ruptures', true);
    if (this._huntPaused && this.phase === 'a3') { this._huntPaused = false; this.startEndlessHunt(12); }
  },
  async antesFirst(s) {
    const g = this.g;
    this.objective('antes');
    await s.wait(0.6);
    await s.say('{rafa}', '*A nossa sala... de antes da gente morar aqui.*', { dur: 3 });
    await s.say('{rafa}', '*Tudo coberto com lençol. Como casa de quem foi embora e não voltou.*', { dur: 3.4 });
    const d = g.world.doors.get('porta_antes');
    if (d && d.target > 0.5 && g.player.pos.z > Z(0.9)) d.close(false, { speed: 0.6 });
    else this.after(2.5, () => { const dd = g.world.doors.get('porta_antes'); if (dd && g.player.pos.z > Z(0.9)) dd.close(false, { speed: 0.6 }); });
    g.checkpoint('a3_antes', true);
  },
  // coloca o Morador no estado certo (dormindo embaixo do lençol, ou acordado)
  antesSetupPale() {
    const F = this.F, g = this.g, pale = g.pale;
    pale.onCatch = (fromHide) => g.caughtByPale(fromHide);
    pale.onEvent = (ev) => this.onPaleEvent(ev);
    if (F.antesTook && !F.antesCalm) {
      pale.show(X(3.0), Z(6.05), 0, 'grope');
      pale.setEyes(true, 0);
      pale.wake({ firstLook: 4 });
      F.antesLocked = true;
      g.applyWorld();
    } else {
      pale.show(X(3.0), Z(6.6), 0, 'sit');
      pale.setEyes(false, 0);
      pale.state = 'sleep';
      pale.model.visible = false; // embaixo do lençol
      pale.startBreath(0.45);
      if (pale.breath) pale.breath.set('rate', 0.7);
    }
  },
  onPaleEvent(ev) {
    const F = this.F;
    if (ev === 'look' && !F.tutPaleLook) {
      F.tutPaleLook = true;
      this.toast('AS MÃOS SUBIRAM: fique PARADA.\nEle só enxerga o que se mexe.', 3.5);
    }
    if (ev === 'felt' && !F.tutPaleFelt) {
      F.tutPaleFelt = true;
      this.after(0.3, () => this.toast('Ele sentiu o chão tremer.\nAgachada (C) você não faz tremer.', 3.5));
    }
    if (ev === 'spotted' && !F.tutPaleSpot) {
      F.tutPaleSpot = true;
      this.after(0.4, () => this.toast('Ele te viu! Corra pra longe e se esconda debaixo de um lençol.', 3));
    }
    if (ev === 'feel' && !F.tutPaleFeel) {
      F.tutPaleFeel = true;
      this.toast('Ele está apalpando o lençol. SEGURE ESPAÇO (prender a respiração).', 3.2);
    }
    if (ev === 'feelPassed' && !F.tutPaleFeelOk) {
      F.tutPaleFeelOk = true;
      this.rule('palido_lencol', 'Debaixo de um lençol eu viro móvel. Se ele apalpar, prendo a respiração até ele desistir.');
    }
  },
  update_antes() {
    const F = this.F, g = this.g;
    if (g.player.pos.x < 150) return;
    // chegando perto da mesa pela primeira vez
    if (!F.antesSawHim && (this.zones || []).includes('antes_mesa')) {
      F.antesSawHim = true;
      this.run(async (s) => {
        audio.play('pale_inhale', { pos: [X(3.0), 1.6, Z(6.6)], v: 0.5, dur: 1.4 });
        await s.say('{rafa}', '*Tem alguém sentado na cabeceira. Embaixo do lençol.*', { dur: 3 });
        await s.say('{rafa}', '*...da última vez, era só o lençol.*', { dur: 2.6 });
      });
    }
    // (a câmera lê a plaquinha: ver viewfinderData, em story.js)
  },

  // ------------------------------------------------------------ objetos
  prompt_antes_table() { return 'Olhar a mesa'; },
  do_antes_table() {
    const F = this.F;
    if (!F.antesTableSeen) {
      F.antesTableSeen = true;
      this.run(async (s) => {
        await s.say('{rafa}', '*O controle da TV que sumiu no Natal. Os óculos da mãe. O tênis do {pedro}...*', { dur: 3.6 });
        await s.say('{rafa}', '*...a minha chupeta?*', { dur: 2 });
        await s.say('{rafa}', '*Tudo o que a gente perdeu nessa casa veio parar aqui. Arrumado em pratos, como um jantar.*', { dur: 3.8 });
        if (!this.has('registro') && !F.valveFixed) await s.say('{rafa}', '*E o registro do chuveiro. Bem na frente dele.*', { dur: 2.8 });
      });
      return;
    }
    this.say0('', 'Uma mesa posta com o que a família perdeu: meias sem par, moedas, fotos, o ratinho de brinquedo do {bento}, um chaveiro preto com uma faixa branca.');
  },
  prompt_eyes_glass() { return 'Olhar o copo d\'água'; },
  do_eyes_glass() {
    const F = this.F;
    if (F.antesEyesOut) { this.say0('', 'O copo está vazio. Só água turva.'); return; }
    this.say0('{rafa}', '*Um copo d\'água... com dois olhos boiando dentro. Como vó que deixa a dentadura de molho. Um deles tá virado pra mim.*', 4.5);
    F.sawEyesGlass = true;
  },
  prompt_pale_sheet() {
    const F = this.F;
    if (F.antesSheetOff || (F.antesTook && !F.antesCalm)) return null;
    return 'Puxar o lençol';
  },
  do_pale_sheet() {
    const F = this.F, g = this.g;
    this._sheetTries = (this._sheetTries || 0) + 1;
    audio.play('pale_inhale', { pos: [X(3.0), 1.6, Z(6.6)], v: 0.7, dur: 1.2 });
    const sh = g.world.get('pale_sheet');
    if (sh) { sh.rotation.y = 0.12; this.after(1.6, () => { sh.rotation.y = 0; }); }
    if (this._sheetTries === 1) this.say0('{rafa}', '*Não. Dessa vez eu não vou puxar.*');
    else this.say0('{rafa}', '*A cabeça embaixo do lençol virou pro meu lado. Eu NÃO vou puxar.*');
    void F;
  },
  prompt_registro_antes() { return this.F.antesTook ? null : 'Pegar o registro do chuveiro'; },
  do_registro_antes() {
    const F = this.F, g = this.g;
    if (F.antesTook) return;
    F.antesTook = true;
    F.hasRegistro = true;
    this.give('registro', true);
    g.applyWorld();
    this.progress();
    this.run((s) => this.antesWake(s));
  },
  async antesSheetSlide(off, dur) {
    const g = this.g;
    const sh = g.world.get('pale_sheet');
    if (!sh) return;
    const n = Math.max(1, Math.round(dur / 0.05));
    for (let i = 0; i <= n; i++) {
      const k = i / n, e = k * k * (3 - 2 * k);
      const t = off ? e : 1 - e;
      sh.position.set(X(3.0), -0.02 * t, Z(6.6) + 0.55 * t);
      sh.scale.set(1, 1 - 0.96 * t, 1);
      sh.rotation.x = Math.sin(t * Math.PI) * 0.25;
      await g.wait(0.05);
    }
    sh.rotation.x = 0;
  },
  async antesWake(s) {
    const g = this.g, F = this.F, pale = g.pale;
    this.cut(true, { look: true });
    this.antesRecord(false, true);
    await s.wait(1.3);
    await s.say('{rafa}', '*...a música parou.*', { dur: 2.2 });
    pale.startBreath(1.0); if (pale.breath) pale.breath.set('rate', 0.55);
    await g.player.lookAt(new THREE.Vector3(X(3.0), 1.45, Z(6.5)), 0.9);
    await s.wait(0.5);
    audio.play('sheet_rustle', { pos: [X(3.0), 1.2, Z(6.6)], v: 1.2, dur: 1.4 });
    pale.show(X(3.0), Z(6.6), 0, 'sit');
    pale.setEyes(false, 0);
    pale.state = 'script';
    await this.antesSheetSlide(true, 1.5);
    F.antesSheetOff = true;
    await s.wait(0.7);
    pale.setPose('wake', false, 0.9);
    audio.play('pale_inhale', { pos: pale.headPos(), v: 0.8, dur: 1.6 });
    await s.wait(2.0);
    pale.setPose('reach', false, 2.0);
    await s.wait(1.1);
    audio.play('plop', { pos: [X(3.0), 0.85, Z(5.52)] });
    audio.play('plop', { pos: [X(3.0), 0.85, Z(5.52)], delay: 0.35 });
    F.antesEyesOut = true;
    g.applyWorld();
    await s.wait(0.5);
    pale.setPose('press', false, 2.6);
    await s.wait(0.9);
    audio.play('squelch', { pos: pale.headPos(), v: 1 });
    pale.setEyes(true, 0);
    await s.wait(0.55);
    audio.play('squelch', { pos: pale.headPos(), v: 0.9 });
    await s.wait(0.7);
    pale.setPose('seatlook', false, 2.2);
    await s.wait(0.9);
    audio.play('pale_click', { pos: pale.handPos(), v: 1 });
    pale.eyesTarget = 1;
    if (settings.scare > 0) { audio.play('stinger_small', { v: settings.scare === 2 ? 0.7 : 0.35 }); g.player.shake(0.3); }
    this.say0('{rafa}', '*(sussurrando) Não se mexe. Não se mexe. Não se mexe.*', 3.2);
    for (let i = 0; i < 60; i++) { pale.sweep = Math.sin(i * 0.07) * 0.55; await s.wait(0.05); }
    pale.sweep = 0;
    pale.eyesTarget = 0;
    audio.play('pale_lids', { pos: pale.handPos(), v: 0.6 });
    await s.wait(0.5);
    audio.play('chair_scrape', { pos: [X(3.0), 0.4, Z(6.6)], v: 1, dur: 0.9 });
    pale.setPose('stand', false, 1.6);
    for (let i = 0; i <= 24; i++) { const k = i / 24; pale.place(X(3.0), Z(6.6) - 0.55 * k * k * (3 - 2 * k), 0); await s.wait(0.05); }
    const d = g.world.doors.get('porta_antes');
    if (d) { d.close(false, { slam: true, speed: 5 }); if (d.target === 0) audio.play('door_slam', { pos: d.center }); }
    F.antesLocked = true;
    g.applyWorld();
    await s.wait(0.4);
    this.cut(false);
    pale.wake({ firstLook: 4.5 });
    this.rule('palido_ve', 'O Morador de Antes enxerga pelas mãos — e só enxerga o que se MEXE. Quando as mãos subirem, eu fico parada.');
    this.rule('palido_sente', 'Ele sente o chão tremer. Correr perto dele é pedir pra ser achada. Agachada, ele não sente.');
    this.toast('ELE SÓ ENXERGA O QUE SE MEXE.\nMãos pra cima: fique PARADA. Mãos pra baixo: ele tateia, cego.\nCorrer faz o chão tremer.', 6);
    this.objective('antes_vitrola');
    g.checkpoint('a3_antes_awake', true, { x: X(3.0), z: Z(1.0), yaw: Math.PI });
  },
  prompt_vitrola() {
    const F = this.F;
    if (F.antesTook && !F.antesCalm) return 'Colocar a agulha no disco';
    return 'Vitrola';
  },
  do_vitrola() {
    const F = this.F, g = this.g;
    if (F.antesTook && !F.antesCalm) {
      F.antesCalm = true;
      this.antesRecord(true, true);
      this.progress();
      const pale = g.pale;
      this.run(async (s) => {
        await s.wait(0.7);
        this.say0('{rafa}', '*A música...*', 1.8);
        if (g.player.hidden) g.player.exitHide();
        if (pale.feelHide) pale.endFeel(false);
        pale.goHome(() => this.run((s2) => this.antesSitDown(s2)));
      });
      return;
    }
    this.say0('', F.antesCalm ? 'A valsa gira devagar. Melhor não mexer.' : 'Uma vitrola antiga, tocando uma valsa que você nunca ouviu. Mesmo assim, você sabe como ela continua.');
  },
  async antesSitDown(s) {
    const g = this.g, F = this.F, pale = g.pale;
    pale.state = 'script';
    pale.setPose('sit', false, 1.4);
    for (let i = 0; i <= 24; i++) { const k = i / 24; pale.place(X(3.0), Z(6.05) + 0.55 * k * k * (3 - 2 * k), 0); await s.wait(0.05); }
    await s.wait(0.4);
    pale.setPose('reach', false, 2.0);
    await s.wait(0.9);
    audio.play('plop', { pos: [X(3.0), 0.85, Z(5.52)] });
    audio.play('plop', { pos: [X(3.0), 0.85, Z(5.52)], delay: 0.3 });
    pale.setEyes(false, 0);
    F.antesEyesOut = false;
    g.applyWorld();
    await s.wait(0.5);
    pale.setPose('sit', false, 1.5);
    audio.play('sheet_rustle', { pos: [X(3.0), 1.2, Z(6.6)], v: 0.9, dur: 1.5 });
    await this.antesSheetSlide(false, 1.6);
    F.antesSheetOff = false;
    pale.model.visible = false;
    pale.state = 'sleep';
    pale.startBreath(0.45); if (pale.breath) pale.breath.set('rate', 0.7);
    F.antesLocked = false;
    g.applyWorld();
    audio.play('unlock', { pos: [X(3.0), 1.0, Z(0.1)], v: 0.8 });
    F.antesDone = true;
    this.rule('palido_musica', 'A valsa da vitrola faz o Morador de Antes voltar pro lugar dele e dormir.');
    await s.say('{rafa}', '*Ele voltou pro lugar dele. Como quem só queria ouvir a música dele.*', { dur: 3.6 });
    this.objective('ruptures');
    g.checkpoint('a3_antes_done', true);
  },
  prompt_antes_diary1() { return 'Ler a folha de caderno'; },
  do_antes_diary1() {
    this.F.paleDiary = true;
    this.note('antes_diario1', 'Folha arrancada de um caderno',
      '[[Ele veio pela foto que eu mandei pro jornal do bairro. A foto da minha sala.\n' +
      'Agora ele usa a minha cara. Anda pela minha casa. Atende o interfone por mim.\n' +
      'Ninguém percebe. Nem a minha filha, quando liga. Ela diz: pai, o senhor tá diferente.\n\n' +
      'Eu fiquei aqui embaixo, na memória da casa. Meus olhos cansaram de procurar e eu tirei eles.\n' +
      'Agora só vejo com as mãos. E só o que se mexe.\n\n' +
      'Se alguém lembrar do meu nome, eu acordo de verdade.\nE aí eu vou lembrar DELE.]]', { where: 'apartamento de antes' });
  },
  prompt_antes_diary2() { return 'Ler a outra folha'; },
  do_antes_diary2() {
    this.F.paleDiary2 = true;
    this.note('antes_diario2', 'Outra folha, com a letra mais tremida',
      '[[Chegou uma família nova. Pintaram a sala de amarelo, trocaram a fechadura, mudaram os móveis de lugar.\n' +
      'Ele não reconheceu mais a casa, e foi embora. Eu fiquei.\n\n' +
      'Tem uma menina de cabelo cacheado que conversa com a casa quando acha que ninguém está ouvindo.\n' +
      'Eu escuto. Eu guardo as coisas que ela perde.\n\n' +
      'Se a música parar, eu acordo. Não é culpa de ninguém.]]', { where: 'apartamento de antes, perto da vitrola' });
  },
  prompt_antes_calendar() { return 'Calendário'; },
  do_antes_calendar() { this.say0('', 'Setembro. Todos os domingos circulados de vermelho. Embaixo, na letra dele: "eles vêm". Ninguém riscou nenhum domingo como "vieram".'); },
  prompt_antes_nameplate() { return 'Plaquinha da porta'; },
  do_antes_nameplate() {
    const F = this.F;
    if (F.paleName) { this.say0('', 'Aqui mora: Custódio. (A câmera leu o que o olho não lê.)'); return; }
    this.say0('', F.paleDiary ? 'Uma plaquinha: "Aqui mora:" — e o nome raspado, riscado, apagado. ...A casa lembra de tudo, não lembra?' : 'Uma plaquinha de madeira: "Aqui mora:". O nome foi raspado, como se alguém quisesse que ninguém lembrasse.');
  },
  prompt_antes_photos() { return 'Fotos antigas'; },
  do_antes_photos() { this.say0('', 'Um senhor, sempre sozinho. Na foto mais antiga, uma menina segura a mão dele. Nas outras, o rosto dele está desbotado — como se a própria foto tivesse esquecido.'); },
  prompt_antes_mirror() { return this.F.antesMirrorOpen ? 'Olhar o espelho' : 'Tirar o lençol do espelho'; },
  do_antes_mirror() {
    const F = this.F, g = this.g;
    if (!F.antesMirrorOpen) {
      F.antesMirrorOpen = true;
      audio.play('sheet_rustle', { pos: [X(5.8), 1.2, Z(3.55)], v: 0.9 });
      g.applyWorld();
      this.antesMirrorEcho();
      this.run(async (s) => {
        await s.wait(0.8);
        await s.say('{rafa}', '*No espelho a sala não tem lençol nenhum. Não tem móvel nenhum. Só a mesa.*', { dur: 3.6 });
        await s.say('{rafa}', '*E numa das cadeiras, bem atrás de mim... um senhor de cardigã, lendo jornal. Sozinho.*', { dur: 3.8 });
        await s.say('{rafa}', '*...não tem ninguém na cadeira. Só no espelho.*', { dur: 2.8 });
      });
      return;
    }
    this.say0('', 'No reflexo, o senhor da cadeira vira a página do jornal. Ele nunca levanta os olhos. Na cadeira de verdade, não tem ninguém.');
  },
  antesMirrorEcho() {
    const g = this.g;
    if (!this.F.antesMirrorOpen || g.echoes.get('antes_velho')) return;
    // numa das cadeiras da mesa, bem atrás de quem olha o espelho — só no reflexo
    g.echoes.add('antes_velho', { x: X(3.95), z: Z(4.42), yaw: -Math.PI / 2, spec: 'm', sitting: true, hair: 'short', color: 0xffe2b8, alpha: 0.95, anim: 'breathe', h: 1.72 });
  },
};
