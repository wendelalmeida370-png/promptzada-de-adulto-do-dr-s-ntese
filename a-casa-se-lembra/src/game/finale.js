// Os finais. Um bom, um ruim e três secretos:
//  BOM      "A Casa Se Lembra"   — gravar o Inquilino e apagar casa.mp4
//  RUIM     "O Inquilino"        — dar um cômodo a ele (ou guardar o vídeo)
//  SECRETO  "Sem Sinal"          — na segunda noite, desmascarar o falso irmão logo no começo
//  SECRETO  "Achados e Perdidos" — lembrar o nome do Morador de Antes na hora do clímax
//  SECRETO  "A Hora Nenhuma"     — usar o relógio-ovo no balde e desfazer o momento do envio
import * as THREE from 'three';
import { audio } from '../core/audio.js';
import { names, settings, T } from '../core/settings.js';
import { escapeHtml } from '../core/util.js';
import * as TX from '../core/textures.js';
import { texMat } from '../world/geom.js';
import { vis } from '../world/layers.js';
import { EYE } from './player.js';
import { buildSister } from './characters.js';
import { ENDINGS, KIND_LABEL, unlockEnding, endingsCount, anyEnding, seenEndings } from './endings.js';
import { lostItem } from '../world/antes.js';
import { BX, BY } from '../world/basement.js';

export const finale = {
  // ============================================================ utilidades de amanhecer
  dawnSetup(opts = {}) {
    const g = this.g, F = this.F;
    g.clown.hide(); g.entity.hide(); g.pale.hide(); g.echoes.clear(); g.esquecido.hide();
    if (this._waltz) { this._waltz.stop(0.5); this._waltz = null; }
    if (this.showerLoop) { this.showerLoop.stop(0.5); this.showerLoop = null; }
    this.stopDawn();
    g.tv.set('off');
    g.stopAmbience();
    audio.music(null);
    F.act = 1;
    g.clockMin = 6 * 60;
    this.tint = [1.12, 1.0, 0.9];
    this.exposure = 1;
    for (const f of g.world.fixtures) { f.on = false; f.flicker = 0; }
    const v = g.fixture('varanda'); if (v) { v.on = true; v.color.set(0xffb070); v.intensity = 9; v.dist = 12; }
    ['sala', 'cozinha'].forEach((id) => { const f = g.fixture(id); if (f) f.on = true; });
    g.flags.fanSpeed = 5;
    g.startAmbience('house');
    this._dawn = [audio.loop('birds', { bus: 'amb', pos: [2.1, 1.6, -1.8], vol: 0.9 })];
    if (opts.hum !== false) this._dawn.push(audio.loop('hum', { pos: [-1.6, 1.5, 5.8], vol: 0.9, ref: 1.2 }));
    g.cats.bento.setVisible(true); g.cats.bento.place(3.4, 3.0, 0); g.cats.bento.mode = 'idle';
    if (F.liliFollow) { g.cats.lili.setVisible(true); g.cats.lili.place(2.9, 6.9, Math.PI); g.cats.lili.mode = 'idle'; }
    else g.cats.lili.setVisible(false);
  },
  stopDawn() { if (this._dawn) { this._dawn.forEach((l) => l && l.stop(1)); this._dawn = null; } },

  // ============================================================ FINAL RUIM (1): dar um cômodo
  async endingInquilino(s) {
    const g = this.g, F = this.F;
    audio.speak(T('Obrigado, {rafaela}.'), { pitch: 0.1, rate: 0.6 });
    await s.say('O Inquilino', 'Obrigado, {rafaela}.', { dur: 2.6, kind: 'enemy' });
    await s.say('O Inquilino', 'Eu fico com o seu quarto. Ninguém vai sentir falta dele.', { dur: 3.4, kind: 'enemy', tts: 'inq' });
    g.ui.flash(1, 3, '#fff');
    await g.ui.fade(1, 2);
    g.entity.hide(); g.clown.hide();
    F.roomGiven = true;
    F.corridorLong = false;
    F.act = 1;
    g.rebuildWorld();
    this.dawnSetup();
    g.player.teleport(3.0, 5.2, -Math.PI / 2 + 0.3, 0);
    g.player.eyeH = EYE;
    await g.ui.fade(0, 3);
    this.cut(false);
    await s.say('{rafa}', '*Amanheceu. Todo mundo em casa. A mãe cantando na cozinha.*', { dur: 3.4 });
    await s.say('{rafa}', '*...como se nada tivesse acontecido.*', { dur: 2.4 });
    this.objective('bad_room');
    this.badArmed = true;
  },
  prompt_sealed_wall() { return this.badArmed ? 'Encostar o ouvido na parede' : null; },
  do_sealed_wall() {
    if (!this.badArmed) return false;
    this.badArmed = false;
    const g = this.g;
    this.run(async (s) => {
      this.cut(true, { look: true });
      await s.say('{rafa}', '*A porta do meu quarto... não tem porta. Só parede. Pintada, lisinha, como se sempre tivesse sido assim.*', { dur: 4.2 });
      await s.wait(1.2);
      audio.play('breath', { pos: [5.41, 1.4, 5.8], dur: 2.8, v: 0.8, out: true });
      await s.wait(2.8);
      audio.play('knock', { pos: [5.41, 1.2, 6.6], n: 3, gap: 0.9, v: 0.9 });
      g.player.shake(0.2);
      await s.wait(3.0);
      audio.play('whisper', { pos: [5.41, 1.5, 6.4], v: 0.9, syl: 5 });
      await s.say('???', '*(do outro lado da parede)* ...{rafaela}...', { dur: 2.6, kind: 'enemy' });
      await s.wait(0.8);
      await s.say('Mãe', '*(lá da cozinha)* {rafa}? Tá falando com quem aí no corredor?', { tts: 'mae', dur: 3.4 });
      await s.say('{rafa}', '*Mãe... cadê o meu quarto?*', { dur: 2.4 });
      await s.say('Mãe', 'Que quarto, filha? Você sempre dormiu na sala. Vem tomar café.', { tts: 'mae', dur: 3.8 });
      await s.wait(1.0);
      await g.ui.fade(1, 3);
      this.finish('inquilino', { variant: 'room' });
    });
    return true;
  },

  // ============================================================ FINAL RUIM (2): guardar o vídeo
  async endingKeepVideo(s) {
    const g = this.g, F = this.F, e = g.entity;
    F.keptVideo = true;
    await s.say('{rafa}', '*Se eu apagar, ele some. Se eu guardar... ninguém vai dizer que eu inventei.*', { dur: 3.8 });
    this.toast('casa.mp4 — guardado', 2.2);
    await s.wait(1.6);
    await g.ui.fade(1, 2);
    this.dawnSetup();
    g.player.teleport(3.55, 3.3, Math.PI / 2, -0.05);
    g.player.eyeH = 0.98;
    this.cut(true, { look: true });
    await g.ui.fade(0, 3);
    await s.say('{rafa}', '*Amanheceu. Todo mundo voltou. A mãe cantando na cozinha. Acabou.*', { dur: 3.6 });
    await s.wait(1.4);
    audio.play('phone_vibrate', { n: 2 });
    g.phone.receive('galeria', 'Galeria', 'casa.mp4 foi atualizado às 03:33.', {});
    await s.wait(1.6);
    await s.say('{rafa}', '*...atualizado?*', { dur: 1.8 });
    // a TV liga sozinha e passa casa.mp4: a sala, agora
    const cc = g.cctvCam;
    cc.position.set(0.35, 1.9, 2.8); cc.lookAt(3.55, 0.9, 3.2);
    this.cctvOverlay('casa.mp4 · 101% igual');
    audio.play('tv_on', { pos: [0.3, 1.4, 2.8], vol: 1.2 });
    e.show(4.35, 3.3, Math.PI / 2, 'c');
    await g.player.lookAt(new THREE.Vector3(0.3, 1.42, 2.8), 1.0);
    await s.say('{rafa}', '*Sou eu. No sofá. Agora.*', { dur: 2.4 });
    await s.say('{rafa}', '*E atrás do sofá...*', { dur: 2.2 });
    const y0 = g.player.yaw;
    let t = 0;
    while (t < 5) {
      await s.wait(0.1); t += 0.1;
      const k = Math.min(1, t / 5);
      e.place(4.35 - 0.7 * k, 3.3 - 0.15 * k, Math.PI / 2);
      if (Math.abs(((g.player.yaw - y0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > 1.7) break;
    }
    // susto
    const fwd = new THREE.Vector3(-Math.sin(g.player.yaw), 0, -Math.cos(g.player.yaw));
    const cam = g.camera;
    e.show(cam.position.x + fwd.x * 0.5, cam.position.z + fwd.z * 0.5, Math.atan2(fwd.x, fwd.z), 'ecv');
    e.model.position.y = cam.position.y - 2.3;
    g.tv.set('static');
    if (settings.scare > 0) { audio.play('stinger', { v: settings.scare === 2 ? 1 : 0.5 }); g.player.shake(settings.scare === 2 ? 1.1 : 0.4); this.glitch = 1; g.ui.flash(settings.scare === 2 ? 0.6 : 0.25, 0.25); }
    else audio.play('boom', { v: 0.6 });
    await s.wait(0.9);
    await g.ui.fade(1, 0.08);
    this.glitch = 0;
    e.hide();
    g.tv.set('off');
    this.finish('inquilino', { variant: 'video' });
  },

  // ============================================================ FINAL BOM: amanhecer
  async endingEpilogue(s, kind) {
    const g = this.g, F = this.F;
    await g.ui.fade(1, 2);
    this.dawnSetup();
    g.player.teleport(2.6, 6.6, Math.PI, 0);
    g.player.eyeH = EYE;
    this.cut(true, { look: true });
    await g.ui.fade(0, 3);
    g.ui.toast('06:00', 3);
    await s.say('{rafa}', '*Amanheceu. A geladeira voltou a zumbir. O {bento} tá pedindo ração.*', { dur: 3.6 });
    await s.say('{rafa}', '*E alguém tá cantando na cozinha. A música da caixinha.*', { dur: 3.2 });
    await s.say('O pai', '*(do corredor, bocejando)* Bom dia, filha. Dormiu no sofá de novo?', { tts: 'pai', dur: 3.4 });
    await s.wait(1.2);
    audio.play('intercom', { pos: [0.07, 1.45, 7.65], dur: 1.3 });
    await s.wait(1.6);
    audio.play('intercom', { pos: [0.07, 1.45, 7.65], dur: 1.3 });
    await s.say('{rafa}', '*O interfone. De novo.*', { dur: 2.2 });
    await g.player.lookAt(new THREE.Vector3(0.07, 1.45, 7.65), 1.2);
    audio.play('switch');
    await s.say('Interfone', 'rafinha? abre aí, esqueci a chave kkkk', { tts: 'wendel', dur: 3.2 });
    const c = await g.ui.choice('A voz é do {wendel}. Parece o {wendel}.', ['Abrir', 'Qual o nome dos gatos?']);
    g.resumePointer(true);
    if (c === 1) {
      await s.say('Interfone', '{bento} e {lili}, né?? tá doida? kkkkk abre logo que eu tô morrendo de fome', { tts: 'wendel', dur: 4 });
      await s.say('{rafa}', '*...é ele.*', { dur: 2 });
    }
    audio.play('intercom', { dur: 0.6 });
    await s.wait(1.2);
    await g.ui.fade(1, 2.5);
    this.finish(kind);
  },

  // ============================================================ SECRETO: Achados e Perdidos
  async endingAchados(s) {
    const g = this.g, F = this.F, e = g.entity, c = g.clown, pale = g.pale;
    F.calledCustodio = true;
    await s.say('{rafa}', 'SEU CUSTÓDIO!', { dur: 2 });
    await s.wait(0.9);
    audio.speak('Ninguém lembra desse nome.', { pitch: 0.1, rate: 0.7 });
    await s.say('O Inquilino', 'Ninguém lembra desse nome.', { dur: 2.8, kind: 'enemy' });
    await s.say('{rafa}', '*Eu lembro.*', { dur: 1.8 });
    audio.play('keys', { pos: [1.75, 1.45, 7.9], v: 1 });
    await s.wait(1.0);
    const fd = g.world.doors.get('porta_entrada');
    audio.play('unlock', { pos: [0.97, 1.0, 8.0] });
    await s.wait(0.7);
    if (fd) { fd.locked = false; fd.openNow(false, { speed: 0.4 }); }
    const hall = g.world.get('hall_col'); if (hall) hall.enabled = false;
    this._dawn = [audio.loop('waltz', { pos: [0.97, 1.3, 8.4], vol: 0.85, ref: 1.4, rolloff: 1.1 })];
    await g.player.lookAt(new THREE.Vector3(0.97, 1.5, 7.9), 1.2);
    await s.wait(1.8);
    // ele entra, tateando
    pale.onCatch = null; pale.onEvent = null;
    pale.show(0.97, 8.35, 0, 'grope');
    pale.setEyes(true, 0);
    pale.state = 'script';
    pale.scriptWalk = true;
    pale.startBreath(0.9);
    const target = new THREE.Vector3(e.pos.x + 0.75, 0, e.pos.z + 1.55);
    const start = pale.pos.clone();
    for (let i = 0; i <= 80; i++) {
      const k = i / 80;
      const x = start.x + (target.x - start.x) * k, z = start.z + (target.z - start.z) * k;
      pale.walkPhase += 0.05 * 5.2 * 0.6;
      pale.place(x, z, Math.atan2(-(target.x - start.x), -(target.z - start.z)));
      if (i % 12 === 0) audio.play('pale_step', { pos: [x, 0.1, z], v: 0.8 });
      if (i === 40) await g.player.lookAt(new THREE.Vector3((x + e.pos.x) / 2, 1.6, (z + e.pos.z) / 2), 1.0);
      await s.wait(0.05);
    }
    pale.scriptWalk = false;
    pale.yaw = Math.atan2(-(e.pos.x - pale.pos.x), -(e.pos.z - pale.pos.z));
    e.place(e.pos.x, e.pos.z, Math.atan2(-(pale.pos.x - e.pos.x), -(pale.pos.z - e.pos.z)));
    audio.play('pale_click', { pos: pale.handPos(), v: 1.2 });
    pale.setPose('look', false, 3);
    pale.eyesTarget = 1;
    await s.wait(1.4);
    audio.speak('Eu... lembro... de você.', { pitch: 0.3, rate: 0.55, vol: 1 });
    await s.say('O Morador de Antes', 'Eu... lembro... de você.', { dur: 3.2, kind: 'house' });
    await s.say('O Morador de Antes', 'Você morou na minha casa. Com a minha cara.', { dur: 3.4, kind: 'house' });
    audio.play('scream', { pos: e.pos, v: 1.2, dur: 2.4 });
    g.player.shake(0.6);
    this.glitch = 0.4;
    pale.setPose('lunge', false, 7);
    for (let i = 0; i < 10; i++) {
      const dx = e.pos.x - pale.pos.x, dz = e.pos.z - pale.pos.z, d = Math.hypot(dx, dz);
      if (d > 0.5) pale.place(pale.pos.x + (dx / d) * 0.12, pale.pos.z + (dz / d) * 0.12, pale.yaw);
      await s.wait(0.04);
    }
    audio.play('pale_shriek', { pos: pale.headPos(), v: 1.1 });
    pale.setPose('grab', false, 6);
    this.glitch = 0;
    await s.wait(0.8);
    // arrasta ele até a porta de antes
    audio.play('drag', { pos: [e.pos.x, 0.2, e.pos.z], v: 1, dur: 3.2 });
    const p0 = pale.pos.clone(), e0 = e.pos.clone(), dst = new THREE.Vector3(0.97, 0, 8.45);
    for (let i = 0; i <= 64; i++) {
      const k = i / 64, kk = k * k;
      const px = p0.x + (dst.x - p0.x) * kk, pz = p0.z + (dst.z - p0.z) * kk;
      pale.place(px, pz, Math.atan2(-(e.pos.x - px), -(e.pos.z - pz)));
      pale.walkPhase -= 0.12;
      const ex = e0.x + (dst.x - 0.1 - e0.x) * kk, ez = e0.z + (dst.z - 0.55 - e0.z) * kk;
      e.place(ex, ez, e.yaw);
      e.model.rotation.x = -0.35 - 0.2 * Math.sin(i * 0.7);
      if (i % 16 === 0) audio.play('scream', { pos: e.pos, v: 0.6, dur: 0.6 });
      await s.wait(0.05);
    }
    e.model.rotation.x = 0;
    e.hide(); pale.hide();
    if (fd) { fd.close(false, { slam: true, speed: 7 }); }
    audio.play('door_slam', { pos: [0.97, 1.0, 8.0], vol: 1.2 });
    this.stopDawn();
    g.player.shake(0.5);
    await s.wait(1.4);
    audio.play('keys', { pos: [1.75, 1.4, 7.9], v: 0.6 });
    F.oldKeyHung = false;
    g.applyWorld();
    await s.wait(1.2);
    audio.play('power_up', { vol: 0.6 });
    for (const f of g.world.fixtures) if (['sala', 'entrada'].includes(f.id)) { f.on = true; f.flicker = 0.8; }
    await s.wait(1.2);
    c.show(2.1, 3.4, -Math.PI / 2, 'ec', true);
    const card = T('AGORA A CASA LEMBRA DE TODO MUNDO, {RAFA}.').toUpperCase();
    c.showCard(card);
    g.ui.say('Tique-Taque', card, 3.5, 'house');
    await s.wait(3.6);
    await s.say('{rafa}', '*...obrigada, Seu Custódio.*', { dur: 2.6 });
    await g.ui.fade(1, 2.2);
    // manhã: achados e perdidos em cima do sofá
    this.dawnSetup();
    g.world.addTo('sala', (grp) => {
      const y = 0.47;
      const it = [['oculos', 3.62, 2.05, 0.3], ['controle', 3.66, 2.4, 1.3], ['chupeta', 3.58, 2.72, 0.5], ['tenis', 3.66, 3.1, 1.5], ['meia', 3.6, 3.45, 0.2], ['presilha', 3.62, 3.7, 1.0], ['chaveiro', 3.6, 3.9, 0.4], ['ratinho', 3.56, 2.25, 2.0], ['bilhete', 3.5, 3.25, 0.15]];
      it.forEach(([k, x, z, r]) => lostItem(grp, k, x, y + (k === 'tenis' ? -0.01 : 0), z, r, '#f2d64b'));
    });
    g.player.teleport(2.3, 2.9, -Math.PI / 2, -0.35);
    g.player.eyeH = EYE;
    this.cut(true, { look: true });
    await g.ui.fade(0, 2.6);
    await s.say('{rafa}', '*Amanheceu. E em cima do sofá...*', { dur: 2.6 });
    await s.say('{rafa}', '*Os óculos da mãe. O controle que sumiu no Natal. O tênis do {pedro}. A minha chupeta.*', { dur: 4.2 });
    await s.say('{rafa}', '*E um bilhete, de letra tremida: "Obrigado por lembrar. — C."*', { dur: 3.8 });
    await s.wait(0.8);
    await s.say('Mãe', '*(lá da cozinha)* {rafa}? Quem achou os meus óculos?!', { tts: 'mae', dur: 3.2 });
    await s.wait(1.4);
    await g.ui.fade(1, 2.5);
    this.finish('achados');
  },

  // ============================================================ SECRETO: A Hora Nenhuma (o balde)
  prompt_bucket() {
    const F = this.F;
    if (F.act >= 3 && this.phase === 'a3' && this.has('relogio_ovo')) return 'Olhar dentro do balde (o relógio-ovo bate mais rápido)';
    return 'Balde';
  },
  do_bucket() {
    const F = this.F, g = this.g;
    if (!(F.act >= 3 && this.phase === 'a3' && this.has('relogio_ovo'))) return false;
    this.run(async (s) => {
      this.cut(true, { look: true });
      await g.player.lookAt(new THREE.Vector3(BX + 5.0, BY + 0.05, 17.4), 0.8);
      audio.play('clock', { vol: 1.2 }); audio.play('clock', { tock: true, vol: 1.2, delay: 0.3 });
      await s.say('{rafa}', '*Lá no fundo, em vez de água... luz de fim de tarde. O quarto dos meninos.*', { dur: 3.8 });
      await s.say('{rafa}', '*O {wendel} no notebook. Na tela: "Enviando casa.mp4..."*', { dur: 3.4 });
      await s.say('???', '*Agora é a hora. Um momento só, lembra? Escolha bem qual.*', { dur: 3.6, kind: 'house' });
      const ch = await g.ui.choice('O relógio-ovo tiquetaqueia na sua mão, cada vez mais rápido.', ['Pular no balde e desfazer o momento em que ele viu a casa', 'Ainda não']);
      g.resumePointer(true);
      if (ch !== 0) { this.cut(false); return; }
      await this.hnYesterday(s);
    });
    return true;
  },
  enter_a3_horanenhuma() {
    const F = this.F;
    if (this.has('relogio_ovo') && !F.hnHinted) {
      F.hnHinted = true;
      this.after(1.2, () => this.say0('???', '*O relógio no seu bolso anda mais depressa aqui. Você já sabe qual momento quer desfazer, não sabe?*', 4.6));
    }
  },
  async hnYesterday(s) {
    const g = this.g;
    this._realFlags = JSON.parse(JSON.stringify(this.F));
    this.phase = 'hn';
    g.entity.hide(); g.clown.hide(); g.pale.hide(); g.echoes.clear();
    if (this._waltz) { this._waltz.stop(0.3); this._waltz = null; }
    if (this.showerLoop) { this.showerLoop.stop(0.3); this.showerLoop = null; }
    audio.play('rewind', { v: 1, dur: 2.2 });
    for (let i = 0; i < 12; i++) audio.play('clock', { tock: i % 2 === 1, vol: 1.1, delay: i * (0.3 - i * 0.018) });
    this.warp = 2.5;
    g.ui.flash(0.9, 2.2, '#fff4e0');
    await g.ui.fade(1, 1.6);
    g.stopAmbience();
    audio.music(null);
    // ontem, 16:44: a casa como estava no vídeo (o quadro ainda no chão)
    g.flags = { act: 1, yesterday: true, paintingMode: 'floor', d_bike: true, d_fotos: true, d_lencol: true, fedCats: false };
    g.rebuildWorld();
    this.setupLights();
    for (const f of g.world.fixtures) f.on = false;
    const m = g.fixture('meninos'); if (m) { m.on = true; m.color.set(0xffd8a4); m.intensity = 8; m.dist = 9; }
    const c1 = g.fixture('corredor1'); if (c1) { c1.on = true; c1.color.set(0xffe6c0); c1.intensity = 4; }
    const sky = g.world.get('city_sky'); if (sky) { this._nightSky = sky.material; sky.material = new THREE.MeshBasicMaterial({ color: 0xfff0d8, side: THREE.BackSide, fog: false }); }
    this._hemi = g.hemi.intensity; g.hemi.intensity = 0.75;
    this.tint = [1.16, 1.02, 0.86]; this.exposure = 1.2;
    g.clockMin = 16 * 60 + 44;
    g.cats.bento.setVisible(true); g.cats.bento.place(9.0, 5.6, 1.2); g.cats.bento.mode = 'idle';
    g.cats.lili.setVisible(false);
    g.echoes.add('hn_wendel', { x: 8.25, z: 4.4, yaw: -Math.PI / 2, spec: 'ec', hair: 'short', sitting: true, anim: 'type', color: 0xffe2b8, alpha: 0.8, h: 1.72 });
    this._dawn = [audio.loop('typing', { pos: [7.7, 0.9, 4.3], vol: 0.55 }), audio.loop('birds', { bus: 'amb', pos: [8.7, 1.6, 3.0], vol: 0.6 }), audio.loop('city', { bus: 'amb', pos: [8.7, 1.2, 2.5], vol: 0.6 })];
    this.hnProgress = 0.96;
    this.hnLines = ['desconhecido: pode mandar', 'desconhecido: quero ver como é uma casa de verdade', 'Enviando casa.mp4 para "desconhecido"...'];
    this.hnScreen();
    g.player.teleport(8.71, 6.25, 0.55, -0.1);
    g.player.eyeH = EYE;
    await g.ui.fade(0, 1.6);
    this.cut(false);
    g.ui.toast('Ontem · 16:44', 3);
    await s.say('{rafa}', '*Ontem. De tarde. O {wendel} tá mandando o vídeo.*', { dur: 3 });
    await s.say('{rafa}', '*Ele não me vê. Eu não tô aqui de verdade.*', { dur: 2.8 });
    this.objective('hn_undo');
    this.hnArmed = true;
  },
  // tela do notebook de ontem (canvas)
  hnScreen(webcam = false) {
    const g = this.g;
    const lp = g.world.get('laptop');
    if (!lp) return;
    if (!this._hnCanvas) {
      const c = document.createElement('canvas'); c.width = 512; c.height = 320;
      this._hnCanvas = c;
      this._hnTex = new THREE.CanvasTexture(c); this._hnTex.colorSpace = THREE.SRGBColorSpace;
      this._hnMat = new THREE.MeshBasicMaterial({ map: this._hnTex, toneMapped: false });
    }
    const x = this._hnCanvas.getContext('2d');
    x.fillStyle = '#0c0f14'; x.fillRect(0, 0, 512, 320);
    x.fillStyle = '#111'; x.fillRect(0, 0, 512, 26);
    x.fillStyle = '#ddd'; x.font = '14px monospace'; x.fillText('Conversa com: desconhecido', 10, 18);
    x.font = '16px monospace';
    (this.hnLines || []).forEach((l, i) => { x.fillStyle = i === this.hnLines.length - 1 ? '#9fd' : '#cfd6e0'; x.fillText(l, 16, 62 + i * 30); });
    const p = Math.max(0, Math.min(1, this.hnProgress || 0));
    x.strokeStyle = '#6ab7ff'; x.lineWidth = 2; x.strokeRect(16, 180, 480, 22);
    x.fillStyle = '#6ab7ff'; x.fillRect(18, 182, 476 * p, 18);
    x.fillStyle = '#fff'; x.font = 'bold 16px monospace'; x.fillText(Math.round(p * 100) + '%', 230, 228);
    if (webcam) {
      x.fillStyle = '#000'; x.fillRect(330, 236, 170, 76);
      x.fillStyle = '#e22'; x.beginPath(); x.arc(344, 248, 5, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#fff'; x.font = '11px monospace'; x.fillText('webcam', 354, 252);
    }
    this._hnTex.needsUpdate = true;
    lp.screen.material = this._hnMat;
  },
  update_hn(dt) {
    const g = this.g;
    if (!this.hnArmed) return;
    this.hnProgress = Math.min(0.99, (this.hnProgress || 0.96) + dt * 0.002);
    this._hnT = (this._hnT || 0) + dt;
    if (this._hnT > 0.25) { this._hnT = 0; this.hnScreen(!!this.hnWebcam); }
    const d = Math.hypot(g.player.pos.x - 7.9, g.player.pos.z - 4.3);
    if (d < 1.7 && !this.hnWebcam) this.hnWebcamScare();
  },
  hnWebcamScare() {
    const g = this.g, e = g.entity;
    this.hnWebcam = true;
    this.hnLines = [...this.hnLines, 'desconhecido: oi, {rafaela}.'].map((l) => T(l));
    this.hnScreen(true);
    audio.play('phone_notify', { pos: [7.7, 0.9, 4.3] });
    // pela webcam: ele está em pé atrás de você
    const cc = g.cctvCam;
    cc.position.set(7.8, 1.0, 4.3);
    const p = g.player.pos;
    cc.lookAt(p.x, 1.3, p.z);
    const back = new THREE.Vector3(p.x - 7.8, 0, p.z - 4.3).normalize();
    e.show(p.x + back.x * 0.9, p.z + back.z * 0.9, Math.atan2(back.x, back.z), 'c');
    g.cctvOn = true;
    const lp = g.world.get('laptop');
    const mat = new THREE.ShaderMaterial({
      uniforms: { tRT: { value: g.cctvRT.texture }, tUI: { value: this._hnTex } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform sampler2D tRT; uniform sampler2D tUI; varying vec2 vUv; void main(){ vec3 ui = texture2D(tUI, vUv).rgb; vec2 w = (vUv - vec2(0.645, 0.025)) / vec2(0.33, 0.24); vec3 c = ui; if (w.x > 0.0 && w.x < 1.0 && w.y > 0.0 && w.y < 1.0) { vec3 cam = texture2D(tRT, w).rgb * 2.6; float l = dot(cam, vec3(0.3,0.59,0.11)); c = mix(cam, vec3(l), 0.35); } gl_FragColor = vec4(c, 1.0); }',
    });
    if (lp) lp.screen.material = mat;
    this._hnWebMat = mat;
    if (settings.scare > 0) audio.play('stinger_small', { v: settings.scare === 2 ? 0.7 : 0.35 });
    this.after(0.8, () => this.say0('{rafa}', '*No cantinho da tela... a webcam. E atrás de mim, na imagem... ele. Ontem também.*', 4));
    this._hnFollow = true;
  },
  prompt_hn_laptop() { return this.hnArmed ? 'Apertar o relógio-ovo (desfazer este momento)' : null; },
  do_hn_laptop() {
    if (!this.hnArmed) return;
    this.hnArmed = false;
    this.run((s) => this.hnUndo(s));
  },
  async hnUndo(s) {
    const g = this.g, e = g.entity;
    this.cut(true, { look: true });
    if (!this.hnWebcam) this.hnWebcamScare();
    this.take('relogio_ovo');
    await s.say('{rafa}', '*Desfaz. Só esse momento.*', { dur: 2.2 });
    for (let i = 0; i < 12; i++) audio.play('clock', { tock: i % 2 === 1, vol: 1.3, delay: i * 0.11 });
    audio.play('rewind', { v: 1.2, dur: 2.6 });
    this.warp = 2.2;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      this.hnProgress = 0.99 * (1 - i / steps);
      if (i === 10) this.hnLines = this.hnLines.slice(0, -1);
      if (i === 20) { this.hnLines = this.hnLines.slice(0, -1); audio.play('scream', { pos: e.pos, v: 0.9, dur: 1.6 }); this.glitch = 0.8; }
      if (i === 26) { e.hide(); this.glitch = 0; }
      if (i === 30) this.hnLines = ['Upload cancelado.'];
      this.hnScreen(true);
      await s.wait(0.065);
    }
    g.cctvOn = false;
    this.hnScreen(false);
    await s.wait(0.6);
    await s.say('{wendel}', '*(sem te ver)* ué... caiu a internet? kkkk ...ah, depois eu mando.', { tts: 'wendel', dur: 3.8 });
    g.ui.flash(1, 2.6, '#fff');
    await g.ui.fade(1, 1.4);
    await this.hnNight(s);
  },
  async hnNight(s) {
    const g = this.g;
    this.stopDawn();
    g.echoes.clear();
    const sky = g.world.get('city_sky'); if (sky && this._nightSky) sky.material = this._nightSky;
    if (this._hemi !== undefined) g.hemi.intensity = this._hemi;
    this.tint = null; this.exposure = 1;
    // a noite que não aconteceu
    g.flags = { act: 1, hnNight: true };
    g.rebuildWorld();
    this.setupLights();
    this.setupActors();
    g.clockMin = 3 * 60 + 7;
    g.tv.set('static');
    g.startAmbience('house');
    this.seedPhone();
    g.player.teleport(3.55, 2.5, Math.PI / 2, -0.12);
    g.player.eyeH = 0.98;
    this.cut(true, { look: true });
    await s.wait(1.0);
    for (let i = 0; i < 3; i++) audio.play('clock', { tock: i % 2 === 1, vol: 1.2, delay: i * 0.9 });
    await g.ui.fade(0, 3);
    await s.say('{rafa}', '*...dormi no sofá de novo.*', { dur: 2.6 });
    g.ui.toast('03:07', 2.5);
    await s.wait(1.0);
    await s.say('{rafa}', '*Nenhuma mensagem nova. Só a TV chiando.*', { dur: 2.8 });
    g.tv.set('off'); audio.play('tv_off', { pos: [0.3, 1.4, 2.8] });
    await s.wait(0.8);
    g.player.eyeH = EYE;
    await g.player.lookAt(new THREE.Vector3(0.24, 0.72, 3.75), 1.6);
    const bp = g.world.get('bday_photo'); if (bp) bp.material = texMat(TX.birthdayPhoto(2), { roughness: 0.6 });
    audio.play('clock', { vol: 0.9 }); audio.play('clock', { tock: true, vol: 0.9, delay: 0.5 });
    await s.say('{rafa}', '*...o palhaço da foto piscou pra mim?*', { dur: 2.8 });
    await s.wait(1.6);
    await g.ui.fade(1, 2.2);
    // manhã
    this.dawnSetup();
    g.player.teleport(2.6, 6.6, Math.PI, 0);
    g.player.eyeH = EYE;
    this.cut(true, { look: true });
    await g.ui.fade(0, 2.6);
    g.ui.toast('06:00', 2.5);
    audio.play('intercom', { pos: [0.07, 1.45, 7.65], dur: 1.3 });
    await s.wait(1.8);
    await g.player.lookAt(new THREE.Vector3(0.07, 1.45, 7.65), 1.2);
    audio.play('switch');
    await s.say('Interfone', 'rafinha? abre aí, esqueci a chave kkkk', { tts: 'wendel', dur: 3 });
    await s.say('Interfone', 'ah, ontem eu ia mandar um vídeo da casa pra um cara que ia me ajudar a fazer um jogo de terror pra você... mas a internet caiu bem na hora kkkkk', { tts: 'wendel', dur: 5.8 });
    await s.say('{rafa}', '*Não manda. Nunca.*', { dur: 2.2 });
    await s.say('Interfone', 'credo kkkk tá bom. abre logo', { tts: 'wendel', dur: 2.4 });
    audio.play('intercom', { dur: 0.6 });
    await s.wait(1.2);
    await g.ui.fade(1, 2.5);
    this.finish('horanenhuma', { F: this._realFlags });
  },

  // ============================================================ SECRETO: Sem Sinal
  // respostas no chat do falso irmão (a pergunta dos gatos só existe depois do primeiro final)
  replyOptions(tid) {
    const F = this.F, g = this.g;
    if (tid !== 'wendel' || F.act !== 1 || this.phase !== 'a1' || F.tvEventStarted || F.semSinal) return null;
    const t = g.phone.thread('wendel');
    if (!t || !t.msgs.some((m) => m.day === 'hoje' && !m.out)) return null;
    const opts = [];
    if (!F.rep_quem) opts.push({ id: 'quem', text: 'quem é?' });
    if (!F.rep_sinal) opts.push({ id: 'sinal', text: 'como vc mandou msg se tá sem sinal??' });
    if (anyEnding() && !F.rep_gatos) opts.push({ id: 'gatos', text: 'se é vc mesmo fala o nome dos gatos' });
    return opts.length ? opts : null;
  },
  onReply(tid, id) {
    const g = this.g, F = this.F, ph = g.phone;
    const opt = (this.replyOptions(tid) || []).find((o) => o.id === id);
    if (!opt) return;
    F['rep_' + id] = true;
    ph.receive('wendel', '{wendel} 🖤', opt.text, { out: true, silent: true });
    const answer = (sec, text, glitch) => this.after(sec, () => {
      ph.receive('wendel', '{wendel} 🖤', text, { glitch });
      if (g.ui.overlay === 'phone' && g.ui.phoneView === 'chat') g.ui.renderPhone('chat', 'wendel');
    });
    if (id === 'quem') { answer(1.6, 'Sou eu, {rafaela}. O seu irmão.'); this.after(4.5, () => this.say0('{rafa}', '*"O seu irmão"? Ele nunca fala assim.*')); }
    if (id === 'sinal') { answer(1.8, 'O sinal não importa. A casa importa.'); this.after(4.6, () => this.say0('{rafa}', '*...que resposta é essa?*')); }
    if (id === 'gatos') {
      answer(2.0, 'Não temos tempo para isso, {rafaela}.');
      answer(4.4, 'O gato está bem.');
      this.after(6.8, () => this.run(async (s) => {
        if (g.ui.overlay) g.ui.closeOverlay();
        await s.say('{rafa}', '*"O gato". No singular. A gente tem DOIS.*', { dur: 3 });
        await s.say('{rafa}', '*O {wendel} de verdade nunca erraria o nome do {bento} e da {lili}.*', { dur: 3.4 });
        const ch = await g.ui.choice('Você sabe quem está do outro lado. A casa inteira parece prender a respiração.', ['Não obedecer mais esse número. Acordar a {julia}.', 'Deve ser brincadeira dele. Deixa pra lá.']);
        g.resumePointer(true);
        if (ch === 0) await this.ssStart(s);
      }));
    }
  },
  async ssStart(s) {
    const g = this.g, F = this.F, ph = g.phone;
    F.semSinal = true;
    this.phase = 'ss';
    this.ringing = false;
    this.timers = this.timers.filter((t) => t.tk !== this.token);
    const t = ph.thread('wendel'); if (t) t.status = 'digitando...';
    await s.say('{rafa}', '*Eu não vou fazer mais nada que esse número mandar.*', { dur: 3 });
    ph.receive('wendel', '{wendel} 🖤', '{rafaela}.', { glitch: true });
    await s.wait(1.2);
    ph.receive('wendel', '{wendel} 🖤', 'RAFAELA.', { glitch: true });
    audio.play('phone_glitch');
    await s.wait(1.0);
    this.objective('ss_wake');
    g.checkpoint('ss_start', true);
  },
  resume_ss() { this.objective('ss_wake'); this.ringing = false; },
  ssWakeJulia() {
    const F = this.F, g = this.g;
    if (F.ssJulia) return;
    F.ssJulia = true;
    this.run(async (s) => {
      this.cut(true, { look: true });
      await s.say('{rafa}', '*{julia}. {julia}! Acorda.*', { dur: 2.2 });
      await s.say('{julia}', 'Hm...? {rafa}? Que foi? ...Que horas são?', { tts: 'julia', dur: 3 });
      await s.say('{rafa}', '*Chegou mensagem do {wendel}. Mas tá sem sinal. E ele errou o nome dos gatos.*', { dur: 3.8 });
      await s.wait(0.8);
      await s.say('{julia}', '...ele tá na casa do Léo. E ele não escreve assim.', { tts: 'julia', dur: 3.2 });
      await s.say('{julia}', 'Não responde mais nada. Vamos pra sala. Luz acesa. Ninguém abre porta pra ninguém até amanhecer.', { tts: 'julia', dur: 5 });
      await g.ui.fade(1, 1.2);
      await this.ssVigil(s);
    });
    return true;
  },
  ssSister(show) {
    const g = this.g;
    if (!this._sister) {
      this._sister = buildSister();
      vis(this._sister, 'evmc');
      g.scene.add(this._sister);
      const u = this._sister.userData;
      u.legs.forEach((l) => { l.rotation.x = -Math.PI / 2; l.position.y = 0.46; });
      u.body.position.y = -0.36;
    }
    this._sister.visible = show;
    this._sister.position.set(3.62, 0, 2.3);
    this._sister.rotation.y = -Math.PI / 2;
  },
  async ssVigil(s) {
    const g = this.g, F = this.F, e = g.entity;
    this.phase = 'ss_vigil';
    F.ssVigil = true;
    this.ssSister(true);
    const u = this._sister.userData;
    u.head.rotation.set(0, 0, 0);
    this.setupLights();
    ['sala', 'entrada', 'cozinha', 'corredor1'].forEach((id) => { const f = g.fixture(id); if (f) { f.on = true; f.level = 1; } });
    g.tv.set('off');
    g.cats.bento.setVisible(true); g.cats.bento.place(2.6, 3.4, Math.PI / 2); g.cats.bento.mode = 'idle';
    g.cats.lili.setVisible(false);
    g.player.teleport(3.55, 3.25, Math.PI / 2, -0.05);
    g.player.eyeH = 0.98;
    this.cut(true, { look: true });
    g.allowPhoneInCutscene = true;
    await g.ui.fade(0, 1.5);
    this.objective('ss_vigil');
    g.checkpoint('ss_vigil', true);
    g.clockMin = 3 * 60 + 21;
    await s.say('{julia}', 'Se o celular vibrar, não olha.', { tts: 'julia', dur: 2.8 });
    await s.wait(5);
    // 1. a mensagem
    g.phone.receive('wendel', '??? (sem número)', 'A {julia} não é a {julia}.', { glitch: true });
    await s.wait(2.2);
    await s.say('{rafa}', '*...*', { dur: 1.2 });
    await s.say('{julia}', '*(sem tirar os olhos da porta)* Eu falei pra não olhar.', { tts: 'julia', dur: 3 });
    await s.wait(5);
    // 2. a cozinha
    audio.play('door_slam', { pos: [-2.7, 1.9, 6.0], vol: 0.9 });
    audio.play('door_slam', { pos: [-2.7, 1.9, 5.4], vol: 0.7, delay: 0.25 });
    g.cats.bento.hiss(); g.cats.bento.mode = 'stare'; g.cats.bento.stareAt = new THREE.Vector3(-1.5, 0, 6);
    g.setLight('cozinha', true, 1.2);
    await s.wait(1.5);
    await s.say('{julia}', 'É só barulho. Barulho não entra.', { tts: 'julia', dur: 2.6 });
    await s.wait(5);
    g.clockMin = 3 * 60 + 30;
    // 3. o interfone
    let ringing = true;
    const ring = () => { if (!ringing) return; audio.play('intercom', { pos: [0.07, 1.45, 7.65], dur: 1.3, vol: 1.1 }); this.after(2.6, ring); };
    ring();
    await s.wait(3.5);
    let ch = await g.ui.choice('O interfone está tocando. Às três e meia da manhã.', ['Atender', 'Deixar tocar']);
    g.resumePointer(true);
    if (ch === 0) {
      await s.say('{julia}', '{rafa}, NÃO.', { tts: 'julia', dur: 1.6 });
      ch = await g.ui.choice('A {julia} segura o seu braço.', ['Atender mesmo assim', 'Voltar pro sofá']);
      g.resumePointer(true);
      if (ch === 0) {
        ringing = false;
        audio.play('switch');
        await s.say('Voz no interfone', 'Filha? É a mãe. Abre pra mim?', { tts: 'mae', dur: 3 });
        await s.say('{julia}', 'A mãe tá DORMINDO, {rafa}!', { tts: 'julia', dur: 2.2 });
        return this.ssFail(s);
      }
    }
    for (let i = 0; i < 4; i++) await s.wait(2.6);
    ringing = false;
    await s.wait(3);
    // 4. a TV liga sozinha
    g.clockMin = 3 * 60 + 33;
    audio.play('tv_on', { pos: [0.3, 1.4, 2.8], vol: 1.3 });
    const lines = [['AVISO AOS MORADORES', ''], ['HÁ UM VISITANTE NO PRÉDIO.', ''], ['ELE NÃO PODE ENTRAR', 'EM UMA CASA QUE NÃO RECONHECE.'], ['ESTA CASA NÃO FOI ARRUMADA.', ''], ['BOA NOITE.', '']];
    let cur = 0;
    g.tv.set('canvas', (x, w, h) => {
      const L0 = lines[Math.min(cur, lines.length - 1)];
      x.fillStyle = '#0a1a3a'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#e8e8e8'; x.textAlign = 'center';
      x.font = 'bold 30px monospace'; x.fillText(L0[0], w / 2, h * 0.42);
      x.font = 'bold 26px monospace'; x.fillText(L0[1], w / 2, h * 0.58);
      x.font = '14px monospace'; x.fillStyle = '#9ab'; x.textAlign = 'left'; x.fillText('CANAL 0 · 03:33', 14, 24);
      for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`; x.fillRect(0, Math.random() * h, w, 1); }
    });
    await s.say('{julia}', 'Não olha pra TV.', { tts: 'julia', dur: 2 });
    for (let i = 0; i < lines.length; i++) { cur = i; g.ui.say('TV', lines[i][0] + ' ' + lines[i][1], 2.6, 'house'); this.voice((lines[i][0] + ' ' + lines[i][1]).toLowerCase(), { tts: 'tv' }); await s.wait(2.9); }
    g.tv.set('off');
    audio.play('tv_off', { pos: [0.3, 1.4, 2.8] });
    await s.wait(4);
    // 5. batidas na porta
    audio.play('knock', { pos: [0.97, 1.2, 8.1], n: 3, gap: 1.1, v: 1 });
    await s.wait(3.6);
    await s.say('Voz atrás da porta', 'rafa? abre aí, esqueci a chave kkkk', { tts: 'wendel', dur: 3 });
    ch = await g.ui.choice('A voz é igualzinha à do {wendel}.', ['Abrir a porta', 'Perguntar o nome dos gatos', 'Ficar quieta']);
    g.resumePointer(true);
    if (ch === 0) { await s.say('{julia}', 'NÃO!', { tts: 'julia', dur: 1.2 }); return this.ssFail(s); }
    if (ch === 1) {
      await s.say('{rafa}', 'Qual o nome dos gatos?', { dur: 2 });
      await s.wait(2.2);
      await s.say('Voz atrás da porta', '...do gato.', { dur: 2.2, kind: 'enemy', tts: 'inq' });
      await s.say('{julia}', 'Não é ele.', { tts: 'julia', dur: 1.8 });
      audio.play('knock', { pos: [0.97, 1.2, 8.1], n: 6, gap: 0.25, v: 1.4 });
      g.player.shake(0.3);
      await s.wait(2.4);
    } else {
      await s.wait(2.5);
      audio.play('whisper', { pos: [0.97, 0.3, 8.05], v: 0.9, syl: 6 });
      await s.say('???', '*(por baixo da porta)* ...{rafaela}...', { dur: 2.6, kind: 'enemy' });
      await s.wait(2);
    }
    // 6. escuro
    audio.play('power_down', { vol: 0.8 });
    g.lightMul = 0;
    g.stopAmbience();
    await s.wait(1.2);
    await s.say('{julia}', 'Tá tudo bem. Fica aqui do meu lado.', { tts: 'julia', dur: 2.8 });
    this.toast('F: lanterna · botão direito: câmera', 2.5);
    e.show(1.15, 7.3, Math.atan2(-(3.55 - 1.15), -(3.25 - 7.3)), 's');
    let seen = false;
    for (let i = 0; i < 90; i++) {
      await s.wait(0.1);
      if (!seen && g.phone.raised && g.phone.mode === 'camera' && this.lookingAt([1.15, 1.8, 7.3], 0.35, 9)) {
        seen = true;
        if (settings.scare > 0) audio.play('stinger_small', { v: settings.scare === 2 ? 0.7 : 0.35 });
        await s.say('{rafa}', '*Pela câmera... tem alguém em pé do lado da porta. Do lado de DENTRO.*', { dur: 3.4 });
        await s.say('{julia}', 'Abaixa isso. Ele não pode fazer nada. A casa não é dele.', { tts: 'julia', dur: 3.4 });
        break;
      }
    }
    await s.wait(seen ? 3 : 1);
    e.hide();
    g.allowPhoneInCutscene = false;
    await s.say('{rafa}', '*A gente ficou ali, no escuro, até parar de ouvir qualquer coisa.*', { dur: 3.6 });
    await g.ui.fade(1, 3.5);
    g.lightMul = 1;
    await this.ssDawn(s);
  },
  async ssFail(s) {
    const g = this.g;
    void s;
    this.ssSister(false);
    g.allowPhoneInCutscene = false;
    g.lightMul = 1;
    g.caught(false);
  },
  resume_ss_vigil() { this.run((s) => this.ssVigil(s)); },
  async ssDawn(s) {
    const g = this.g;
    this.dawnSetup({ hum: false });
    this.ssSister(true);
    const u = this._sister.userData; u.head.rotation.set(0.35, 0, 0.35);
    g.player.teleport(3.55, 3.25, Math.PI / 2, -0.05);
    g.player.eyeH = 0.98;
    this.cut(true, { look: true });
    await g.ui.fade(0, 3);
    g.ui.toast('06:00', 2.5);
    await s.say('{rafa}', '*Amanheceu. A {julia} dormiu sentada, de boca aberta. A geladeira voltou a zumbir.*', { dur: 4 });
    await s.wait(1.2);
    audio.play('intercom', { pos: [0.07, 1.45, 7.65], dur: 1.3 });
    await s.wait(1.8);
    audio.play('switch');
    await s.say('Interfone', 'rafinha? abre aí kkkk trouxe pão', { tts: 'wendel', dur: 3 });
    const c = await g.ui.choice('Parece o {wendel}. Mas ontem também parecia.', ['Abrir', 'Qual o nome dos gatos?']);
    g.resumePointer(true);
    if (c === 1) {
      await s.say('Interfone', '{bento} e {lili}, né?? tá doida? kkkkk abre logo', { tts: 'wendel', dur: 3.4 });
      await s.say('{rafa}', '*...é ele. É ele de verdade.*', { dur: 2.4 });
    }
    audio.play('intercom', { dur: 0.6 });
    await s.wait(1.4);
    audio.play('door_open', { pos: [0.97, 1.0, 8.0], creakChance: 1 });
    await s.wait(1.0);
    await s.say('{wendel}', 'que cara é essa? vocês dormiram na sala?', { tts: 'wendel', dur: 2.8 });
    await s.say('{rafa}', '*{wendel}. Apaga aquele vídeo da casa. Agora.*', { dur: 2.8 });
    await s.say('{wendel}', 'que víd... ué. como você sabe do vídeo?', { tts: 'wendel', dur: 3 });
    await g.ui.fade(1, 2.5);
    this.ssSister(false);
    this.finish('semsinal');
  },

  // ============================================================ tela de final
  endingLines(kind, extra, F) {
    const L = [];
    if (kind === 'casa') {
      L.push('A sua família acordou cada um na sua cama, dizendo que teve o mesmo sonho: uma festa, uma sala amarela, um palhaço com um relógio no peito.');
      L.push(F.clownSaved ? 'Na foto da festa de 5 anos, o palhaço agora está olhando pra você. E sorrindo.' : 'Na foto da festa de 5 anos, o palhaço está de olhos fechados. Como quem dorme depois de um dia muito longo.');
      L.push('casa.mp4 sumiu do seu celular, do notebook do {wendel} e da conversa com o "desconhecido". Como se nunca tivesse existido.');
      L.push(F.paleName ? 'Você sabia o nome do Morador de Antes, e não chamou. Às vezes, de madrugada, dá pra ouvir uma valsa atrás da porta de entrada.' : 'Lá embaixo, na memória mais velha da casa, alguém ainda espera que lembrem o nome dele.');
    } else if (kind === 'inquilino') {
      if (extra.variant === 'video') {
        L.push('A sua família voltou com o sol. Ninguém lembra de nada.');
        L.push('Mas casa.mp4 continua no seu celular. Toda noite, às 3:33, o arquivo fica um pouquinho maior.');
        L.push('[notificação] casa.mp4 — 101% igual.');
      } else {
        L.push('A sua família voltou com o sol. Todo mundo em casa. Ninguém lembra de nada.');
        L.push('Ninguém lembra de uma porta roxa no corredor. — Que quarto, {rafa}? Você sempre dormiu na sala.');
        L.push('De noite, alguém muito alto se mexe no cômodo que ninguém lembra. Às vezes bate três vezes na parede, bem onde era a sua cama.');
      }
      L.push('Ele é um ótimo inquilino. Nunca faz barulho.');
    } else if (kind === 'semsinal') {
      L.push('Você não respondeu. Não consertou nada. Não abriu a porta pra ninguém.');
      L.push('A casa não precisou esconder ninguém. Todo mundo acordou na própria cama — menos você e a {julia}, que acordaram no sofá, de mãos dadas.');
      L.push('O {wendel} apagou casa.mp4 do notebook na mesma hora. E a conversa com o "desconhecido".');
      L.push('Três noites depois, às 3:03, o seu celular vibrou. Sem serviço. Uma mensagem só: "Outra noite?"');
      L.push('Você não respondeu.');
    } else if (kind === 'achados') {
      L.push('O Morador de Antes voltou pra casa dele — a de antes. E levou junto o único inquilino que ele nunca esqueceu.');
      L.push('Naquela manhã, em cima do sofá, apareceram arrumadinhos: os óculos da mãe, o controle da TV que sumiu no Natal, o tênis do {pedro}, a sua chupeta de quando você tinha três anos. E um bilhete: "Obrigado por lembrar. — C."');
      L.push('casa.mp4 agora mostra só um apartamento antigo, com lençóis nos móveis. Às vezes um lençol se mexe, e embaixo dele tem um rosto de chiado procurando uma porta que não existe mais.');
      L.push('De vez em quando alguma coisa perdida volta sozinha pra mesinha da sala. A família chama isso de sorte. Você chama de Seu Custódio.');
    } else if (kind === 'horanenhuma') {
      L.push('A noite nunca aconteceu. Ninguém lembra do interfone, da porta nova no corredor, da TV ligando sozinha.');
      L.push('Você lembra de tudo. A casa esquece o que aconteceu. Você não.');
      L.push('O relógio-ovo sumiu do seu bolso. Às vezes, às 3:33, você ouve um tique-taque baixinho que mais ninguém escuta.');
      L.push('Na foto da festa de 5 anos, o palhaço está piscando um olho. Sempre esteve? Ninguém sabe dizer.');
      L.push('Numa conversa que não existe mais, um desconhecido digitou: "Tudo bem. Outra casa."');
    }
    // detalhes que dependem do que você fez
    if (kind !== 'horanenhuma' && kind !== 'semsinal') {
      L.push(F.liliFollow ? 'A {lili} dormiu em cima do seu pé a manhã inteira.' : 'A {lili} ficou três dias sem sair de dentro do rack.');
      L.push(F.invited ? 'Na porta da frente ficaram arranhões fundos, do lado de dentro. Ninguém soube explicar.' : 'A porta da frente nunca foi aberta pra ele naquela noite. Você não convidou ninguém.');
      const fx = this.fixCount(F);
      L.push(fx <= 1 ? 'Você só consertou o que te mandaram consertar. Desconfiou cedo. A casa gostou disso.' : fx >= 5 ? 'Você consertou quase tudo o que a casa tinha mudado pra te proteger. Ela te perdoou mesmo assim.' : `Você consertou ${fx} coisas que a casa tinha mudado pra te proteger.`);
    }
    if (F.secretVasco) L.push('A camisa preta com a faixa ficou pendurada na cadeira. Pra dar sorte.');
    if (F.secretChrono && kind !== 'horanenhuma') L.push('Às vezes, quando a casa fica em silêncio, dá pra ouvir um tique-taque que não vem de relógio nenhum.');
    return L;
  },
  finish(kind, extra = {}) {
    const g = this.g;
    const F = extra.F || this.F;
    g._endingNow = true;
    this.cut(false);
    g.state = 'ending';
    g.input.unlock();
    this.stopDawn();
    if (this._waltz) { this._waltz.stop(0.5); this._waltz = null; }
    audio.stopAllLoops(1);
    audio.music('end');
    try { localStorage.removeItem('casa-se-lembra/save/v1'); } catch (e) { /* ok */ }
    const mins = Math.max(1, Math.round(g.time / 60));
    const meta = ENDINGS.find((x) => x.id === kind) || ENDINGS[0];
    const isNew = unlockEnding(kind, { mins, deaths: g.deaths });
    const lines = this.endingLines(kind, extra, F);
    const found = [F.secretVasco, F.secretChrono, F.dadFound].filter(Boolean).length;
    const n = endingsCount();
    const seen = seenEndings();
    const next = ENDINGS.filter((x) => !seen[x.id]);
    const esc = (t) => escapeHtml(T(t)).replace(/\n/g, '<br>');
    const html = `<div class="end-kind ${meta.kind}">${KIND_LABEL[meta.kind]}</div><h1>${esc(meta.title.toUpperCase())}</h1>` +
      (isNew ? '<div class="end-new">novo final desbloqueado</div>' : '') +
      lines.map((l) => `<p>${esc(l)}</p>`).join('') +
      `<p class="end-tag">tempo de jogo: ${mins} min · vezes que a casa esqueceu: ${g.deaths} · segredos: ${found}/3</p>` +
      `<div class="end-count">finais descobertos: ${n}/5</div>` +
      (next.length ? `<div class="end-next">${next.slice(0, 2).map((x) => `<div><b>${KIND_LABEL[x.kind]}</b> — ${esc(x.hint)}</div>`).join('')}</div>` : '<div class="end-next"><div>Você encontrou todos os finais. A casa se lembra de você.</div></div>') +
      `<p class="end-dedic">${esc('Para {rafaela}.')}<br>${esc('Com carinho, {wendel}.')}</p>`;
    g.ui.ending(html, () => { g._endingNow = false; g.quitToMenu(); });
  },
};
