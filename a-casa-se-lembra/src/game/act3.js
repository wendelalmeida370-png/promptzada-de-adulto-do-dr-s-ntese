// ATO 3 — "O que a casa guarda": a memória da casa, a virada, o clímax e os finais.
import * as THREE from 'three';
import { audio } from '../core/audio.js';
import { names, settings, T } from '../core/settings.js';
import { norm, clamp, angleDiff } from '../core/util.js';
import { buildBasement, BX, BY } from '../world/basement.js';
import { vis } from '../world/layers.js';

const CARDS_A = [
  'OI, {RAFA}.',
  'VOCÊ CRESCEU.',
  'LEMBRA DE MIM? TIQUE-TAQUE. SUA FESTA DE 5 ANOS.',
  'EU SOU A CASA. ESSE FOI O ÚNICO ROSTO QUE EU ACHEI PRA FALAR COM VOCÊ.',
  'EU ESCONDI SUA FAMÍLIA AQUI, NA MINHA MEMÓRIA. ELE NÃO ENTRA AQUI.',
  'TUDO QUE EU MUDEI NA CASA ERA UMA PORTA TRANCADA PRA ELE.',
  'O {wendel} NÃO TE MANDOU NENHUMA MENSAGEM.',
  'OLHA O SEU CELULAR.',
];
const CARDS_B = [
  'ELE PRECISA QUE A CASA FIQUE IGUAL AO VÍDEO PRA MORAR NELA. NO LUGAR DE VOCÊS.',
  'ME AJUDA. DEIXA A CASA DIFERENTE. TRÊS COISAS QUE SÓ A GENTE SABE.',
  'O QUADRO DE CABEÇA PRA BAIXO. O SEU NOME NO ESPELHO. A FAMÍLIA NO PORTA-CHAVES.',
  'VAI, {RAFA}. EU BUZINO QUANDO ELE CHEGAR PERTO.',
];

export const act3 = {
  // ------------------------------------------------------------ a porta que não existe (versão completa)
  prompt_porta_extra() {
    const F = this.F;
    if (this.phase === 'a2_door' && !F.extraOpened) return this.has('chave_velha') ? 'Abrir com a chave velha' : 'A porta que não existe (precisa de uma chave)';
    if (F.act === 1 || (F.act === 2 && !F.extraUnlocked && this.phase !== 'a2_door')) return this.has('chave_velha') ? 'Tentar a chave velha' : 'Abrir';
    return undefined;
  },
  do_porta_extra() {
    const F = this.F, g = this.g;
    const d = g.world.doors.get('porta_extra');
    if (this.phase === 'a2_door' && !F.extraOpened) {
      if (!this.has('chave_velha')) { audio.play('locked', { pos: d.center }); this.say0('{rafa}', '*Precisa de uma chave velha. O porta-chaves da entrada tinha uma chave estranha...*'); return true; }
      F.extraOpened = true; F.extraUnlocked = true;
      audio.play('unlock', { pos: d.center });
      d.locked = false; d.openNow(true, { speed: 0.8 });
      F.stairsOpen = true;
      if (!F.basementBuilt) { F.basementBuilt = true; buildBasement(g.world, F); this.setupLights(); }
      g.applyWorld();
      this.objective('descend');
      this.after(1.2, () => this.say0('{rafa}', '*Uma escada. A gente mora num apartamento. Não existe escada aqui.*'));
      g.checkpoint('a2_opened', true);
      return true;
    }
    if (F.extraUnlocked || F.act >= 3) return false;
    audio.play('locked', { pos: d.center });
    if (this.has('chave_velha')) { audio.play('unlock', { pos: d.center, vol: 0.6 }); this.say0('{rafa}', '*A chave gira... mas alguma coisa do outro lado segura a maçaneta.*'); }
    else this.say0('{rafa}', '*A maçaneta não gira. Parece de mentira.*');
    if (F.act === 1 && !F.extraHeld) { F.extraHeld = true; this.after(1.5, () => audio.play('knock', { pos: [12.2, 1.2, 8.1], n: 2, gap: 0.9, v: 0.7 })); }
    return true;
  },

  // ------------------------------------------------------------ descida
  enter_descida() {
    const F = this.F, g = this.g;
    if (this._partyLoop) { this._partyLoop.stop(1); this._partyLoop = null; }
    if (!F.descended) { F.descended = true; this.phase = 'a3_basement'; g.stopAmbience(); audio.music('memory'); }
    else if (F.act >= 3) audio.music('memory');
  },
  enter_subida() {
    const F = this.F;
    audio.music(null);
    if (F.revealDone && !F.act3Started) this.startAct3Up();
  },
  enter_porao() {
    const F = this.F, g = this.g;
    audio.music('memory');
    if (this._nowhere) { this._nowhere = false; }
    if (F.basementIntro) return;
    F.basementIntro = true;
    this.setupBasementActors();
    this.run(async (s) => {
      await s.wait(1.2);
      await s.say('{rafa}', '*A sala... de quando eu era pequena. A parede era amarela.*', { dur: 3.2 });
      await s.say('{rafa}', '*A minha festa. Parada. Como uma foto que dá pra entrar.*', { dur: 3.2 });
      await s.wait(1.5);
      await s.say('{rafa}', '*Mãe? Pai? ...Eles estão aqui. Todos. Quietos.*', { dur: 3 });
      this.objective('clown');
      g.checkpoint('a3_basement', true);
    });
  },
  enter_horanenhuma() {
    const F = this.F;
    this._nowhere = true;
    audio.music('nowhere');
    if (!F.nowhereIntro) {
      F.nowhereIntro = true;
      this.after(1.5, () => this.say0('???', '*Chegou cedo, ou tarde demais? Tanto faz. Aqui é a Hora Nenhuma. O tempo descansa aqui.*', 4.5));
    }
  },
  prompt_egg_watch() { return this.has('relogio_ovo') ? null : 'Pegar o relógio'; },
  do_egg_watch() {
    const F = this.F, g = this.g;
    if (this.has('relogio_ovo')) return;
    this.give('relogio_ovo');
    F.secretChrono = true;
    const egg = g.world.get('egg_watch'); if (egg) egg.visible = false;
    audio.play('chime', { notes: [62, 66, 69, 74, 78], v: 0.5 });
    this.run(async (s) => {
      await s.say('???', '*Leva. Um dia você vai precisar desfazer um momento. Só um.*', { dur: 3.6 });
      this.toast('Segredo encontrado: A Hora Nenhuma', 3.5);
    });
  },
  setupBasementActors() {
    const g = this.g, F = this.F;
    g.echoes.clear();
    const warm = 0xffd6a0;
    const add = (id, o) => g.echoes.add(id, { spec: 'ec', color: warm, alpha: 0.38, ...o });
    add('b_mae', { x: BX + 13.9, z: 15.2, y: BY, yaw: -Math.PI / 2, hair: 'bun', sitting: true });
    add('b_pai', { x: BX + 13.2, z: 17.3, y: BY, yaw: -Math.PI / 2 - 0.4, hat: true, h: 1.78 });
    add('b_julia', { x: BX + 13.9, z: 16.1, y: BY, yaw: -Math.PI / 2, hair: 'long', sitting: true, h: 1.6 });
    add('b_pedro', { x: BX + 11.3, z: 17.4, y: BY, yaw: Math.PI / 2, hair: 'short', h: 1.6 });
    add('b_wendel', { x: BX + 11.0, z: 14.7, y: BY, yaw: Math.PI / 2 + 0.3, hair: 'short', h: 1.72, anim: 'wave' });
    add('b_rafa5', { x: BX + 12.0, z: 15.45, y: BY, yaw: 0.2, hair: 'curly', h: 1.05, alpha: 0.6 });
    for (let i = 0; i < 4; i++) add('b_kid' + i, { x: BX + 11.2 + i * 0.7, z: 18.6 + (i % 2) * 0.4, y: BY, yaw: Math.PI, h: 1.0 + (i % 2) * 0.15, alpha: 0.3 });
    for (const e of g.echoes.list.values()) e.f.position.y = BY;
    if (!F.revealDone || true) g.clown.show(BX + 12.9, 16.95, 0, 'ec', true);
    g.clown.model.position.y = BY;
    this.cardI = F.revealDone ? CARDS_A.length + CARDS_B.length - 1 : (F.cardI || 0);
  },
  resume_a3_basement() {
    const F = this.F, g = this.g;
    this._prevZones = [];
    g.stopAmbience();
    audio.music('memory');
    this.setupBasementActors();
    this.objective(F.revealDone ? 'ruptures' : 'clown');
  },
  update_a3_basement() {
    const g = this.g, F = this.F;
    if (!g.clown.model.visible || this.cardBusy) return;
    const c = g.clown.model.position;
    const d = Math.hypot(c.x - g.player.pos.x, c.z - g.player.pos.z);
    if (d < 2.6 && this.lookingAt([c.x, c.y + 1.5, c.z], 0.6, 3)) {
      this.customPrompt = this.cardI === 0 ? 'Falar com o palhaço' : 'Próximo cartão';
      this._customAction = () => this.nextCard();
    }
  },
  nextCard() {
    const F = this.F, g = this.g;
    const all = [...CARDS_A, '__REVEAL__', ...CARDS_B];
    let i = this.cardI || 0;
    if (i >= all.length) i = all.length - 1;
    const text = all[i];
    if (text === '__REVEAL__') { this.cardI = i + 1; F.cardI = this.cardI; this.phoneReveal(); return; }
    const t = T(text).toUpperCase();
    g.clown.showCard(t);
    audio.play('page', { vol: 0.8 });
    g.ui.say('Tique-Taque', t, Math.max(3, t.length * 0.06), 'house');
    this.cardI = Math.min(all.length - 1, i + 1);
    F.cardI = this.cardI;
    if (i === all.length - 2) this.afterCards();
  },
  phoneReveal() {
    const F = this.F, g = this.g, ph = g.phone;
    this.cardBusy = true;
    this.run(async (s) => {
      g.clown.showCard(null);
      F.signal = true;
      audio.play('phone_vibrate', { n: 4 });
      await s.wait(1.0);
      // separa o que era do irmão de verdade
      const t = ph.thread('wendel');
      const real = t ? t.msgs.filter((m) => m.day === 'ontem') : [];
      if (t) { t.msgs = t.msgs.filter((m) => m.day !== 'ontem').map((m) => ({ ...m, glitch: true })); t.name = '??? (sem número)'; t.status = 'número não encontrado'; }
      const rt = ph.ensureThread('wendel_real', '{wendel} 🖤');
      rt.msgs = real;
      rt.status = 'online agora';
      const delayed = [
        ['rafinha kkkk tô na casa do Léo', '23:12', 'ontem'],
        ['esqueci de falar, mandei o vídeo da casa pro meu projeto lá, se chegar coisa estranha no meu notebook ignora kkkk', '23:13', 'ontem'],
        ['cuida do {bento} e da {lili} 🖤🤍 boa noite', '23:14', 'ontem'],
        ['rafa?? acordei do nada com um pesadelo com a nossa casa. tá tudo bem aí? 🖤', '03:36', 'hoje'],
      ];
      for (const [txt, time, day] of delayed) { ph.receive('wendel_real', '{wendel} 🖤', txt, { time, day }); await s.wait(0.9); }
      await s.say('{rafa}', '*Essas são do {wendel}. Do {wendel} DE VERDADE. Com "kkkk". Com coraçãozinho.*', { dur: 3.6 });
      await s.say('{rafa}', '*Tava sem sinal a noite inteira. Então quem... quem tava falando comigo?*', { dur: 3.6 });
      await s.wait(1.0);
      ph.receive('wendel', '??? (sem número)', 'Tarde demais.', { glitch: true });
      await s.wait(1.4);
      ph.receive('wendel', '??? (sem número)', `A casa está ${Math.round(this.sim())}% igual. Eu já estou aí em cima.`, { glitch: true });
      await s.wait(1.6);
      ph.receive('wendel', '??? (sem número)', 'Obrigado por consertar tudo, {rafaela}.', { glitch: true });
      audio.play('phone_glitch');
      F.simAtReveal = this.sim();
      F.evidence = true;
      await s.wait(2.0);
      this.toast('Nova aba no diário: EVIDÊNCIAS', 3);
      g.ui.openJournal('ev');
      this.cardBusy = false;
      F.revealDone = true;
      this.nextCard();
    });
  },
  afterCards() {
    const F = this.F, g = this.g;
    if (F.threeThings) return;
    F.threeThings = true;
    this.note('tres_coisas', 'As três coisas', 'Deixar a casa DIFERENTE do vídeo:\n\n1. O quadro de cabeça pra baixo (sala).\n2. O meu nome no espelho (banheiro).\n3. A família no porta-chaves (entrada).\n\nEle está lá em cima. O palhaço buzina quando ele chega perto.', { show: false, where: 'a memória da casa' });
    this.objective('ruptures');
    this.toast('Anotado no diário: "As três coisas" (J)', 3);
    g.checkpoint('a3_reveal', true);
  },

  // ------------------------------------------------------------ ATO 3: lá em cima
  startAct3Up() {
    const F = this.F, g = this.g;
    F.act = 3;
    F.act3Started = true;
    this.phase = 'a3';
    g.clockMin = 4 * 60 + 44;
    g.applyWorld();
    this.setupLights();
    g.echoes.clear();
    g.clown.hide();
    g.cats.bento.setVisible(false);
    if (F.liliFollow) { g.cats.lili.setVisible(true); g.cats.lili.place(g.player.pos.x + 0.5, g.player.pos.z - 0.4, 0); g.cats.lili.mode = 'follow'; }
    g.startAmbience('act3');
    audio.play('wrong', { v: 0.8 });
    this.after(2, () => g.phone.receive('wendel', '??? (sem número)', 'Eu sei onde você está.', { glitch: true }));
    this.objective('ruptures');
    g.checkpoint('a3_up');
    this.startEndlessHunt(14);
  },
  resume_a3() {
    const F = this.F, g = this.g;
    this._prevZones = [];
    g.cats.bento.setVisible(false);
    if (F.liliFollow) { g.cats.lili.setVisible(true); g.cats.lili.place(g.player.pos.x + 0.5, g.player.pos.z - 0.4, 0); g.cats.lili.mode = 'follow'; }
    this.objective('ruptures');
    this.startEndlessHunt(9);
  },
  huntStrength() { const s = this.F.simAtReveal || this.sim(); return clamp(0.85 + (s - 75) / 60, 0.85, 1.15) + this.ruptureCount() * 0.03; },
  startEndlessHunt(delay) {
    const g = this.g;
    this.after(delay, () => {
      if (this.phase !== 'a3') return;
      const nodes = [...g.world.navNodes.keys()].filter((id) => !/^(x|pb)/.test(id));
      g.entity.startHunt({ from: 'pp1', endless: true, strength: this.huntStrength(), patrol: nodes, exit: 'pp1' });
      this.huntId = 4;
    });
  },
  ruptureCount() { const F = this.F; return (F.paintingMode === 'upside' ? 1 : 0) + (F.nameWritten ? 1 : 0) + (F.keysHung ? 1 : 0); },
  ruptureHints() {
    const F = this.F;
    if (F.paintingMode !== 'upside') return ['O quadro colorido fica na sala, perto da porta de entrada.', 'Lembra do reflexo da TV no começo? Ele mostrava como a casa queria o quadro.', 'Vá até o quadro e escolha "Pendurar de cabeça pra baixo".'];
    if (!F.nameWritten) return [F.valveFixed ? 'Espelho só embaça com vapor.' : 'O registro do chuveiro sumiu. Procure num lugar com água: a área de serviço.', (F.swapSeen ? 'As portas do banheiro e do seu quarto trocaram: para chegar no banheiro, entre pela porta do quarto roxo. ' : '') + 'Encaixe o registro no chuveiro e abra a água quente. Espere o espelho embaçar.', 'Depois de embaçado, interaja com o espelho do banheiro e escreva o seu nome.'];
    if (!F.keysHung) return ['O porta-chaves "Família" está vazio. A casa quer a família de volta nele.', `Você precisa de três chaves: a da mãe${this.has('chaves_mae') ? ' (tem)' : ''}, a do pai${this.has('chave_pai') ? ' (tem)' : ' (o chapéu dele ficou no chão do quarto)'} e a chave velha${this.has('chave_velha') ? ' (tem)' : ''}.`, 'Com as três chaves, interaja com o porta-chaves na entrada.'];
    return ['Vá para a sala.'];
  },
  update_a3(dt) {
    const g = this.g, F = this.F, e = g.entity;
    // buzina de aviso
    this._honkCd = (this._honkCd || 0) - dt;
    const prox = e.proximity();
    if (e.hunt && prox > 0.42 && (this._lastProx || 0) <= 0.42 && this._honkCd <= 0) {
      this._honkCd = 18;
      audio.play('honk', { pos: [e.pos.x, 1.5, e.pos.z], v: 0.9, rev: 0.8 });
    }
    this._lastProx = prox;
    // Lili arrepiada
    const l = g.cats.lili;
    if (F.liliFollow && e.model.visible && Math.hypot(e.pos.x - l.pos.x, e.pos.z - l.pos.z) < 7) { if (l.mode !== 'stare') { l.mode = 'stare'; l.stareAt = e.pos; l.hiss(); } }
    else if (F.liliFollow && l.mode === 'stare') l.mode = 'follow';
    // chuveiro fazendo barulho
    if (F.showerOn && !F.nameWritten) {
      this._showerT = (this._showerT || 0) - dt;
      if (this._showerT < 0) { this._showerT = 4; g.noise(6.1, 9.3, 7); }
      const bm = g.world.get('bath_mirror');
      if (bm && bm.fog < 0.75) { bm.fog = Math.min(0.75, bm.fog + dt * 0.12); if (bm.fog >= 0.75 && !F.fogNoted) { F.fogNoted = true; this.toast('O espelho do banheiro embaçou.', 3); } }
    }
  },

  // ------------------------------------------------------------ as três rupturas
  rupturePainting() {
    const F = this.F, g = this.g;
    F.paintingMode = 'upside';
    g.applyWorld();
    audio.play('thud', { v: 0.7 });
    this.afterRupture('Quadro');
  },
  prompt_shower_valve() {
    const F = this.F;
    if (F.act < 3) return 'Registro do chuveiro';
    if (!F.valveFixed) return this.has('registro') ? 'Encaixar o registro' : 'Registro do chuveiro (falta a manopla)';
    if (!F.showerOn) return 'Abrir o chuveiro quente';
    return F.nameWritten ? 'Fechar o chuveiro' : 'Chuveiro ligado (espere o espelho embaçar)';
  },
  do_shower_valve() {
    const F = this.F, g = this.g;
    if (F.act < 3) { this.say0('', 'O registro do chuveiro. Emperra se girar demais.'); return; }
    if (!F.valveFixed) {
      if (!this.has('registro')) { this.say0('{rafa}', '*Alguém arrancou a manopla do registro. Sem ela não abre.*'); return; }
      this.take('registro'); F.valveFixed = true; g.applyWorld(); audio.play('unlock', { pos: [6.5, 1.2, 9.3] }); return;
    }
    if (!F.showerOn) {
      F.showerOn = true;
      audio.play('switch');
      this.showerLoop = audio.loop('shower', { pos: [6.2, 2, 9.4], vol: 0.8 });
      g.setLight('shower_steam', true);
      const f = g.fixture('shower_steam'); if (f) f.intensity = 1.5;
      this.say0('{rafa}', '*Água quente. Tá fazendo barulho demais... ele vai ouvir.*');
      return;
    }
    if (F.nameWritten) { F.showerOn = false; if (this.showerLoop) { this.showerLoop.stop(); this.showerLoop = null; } g.setLight('shower_steam', false); }
  },
  prompt_registro() { return 'Pegar o registro do chuveiro'; },
  do_registro() { this.F.hasRegistro = true; this.give('registro'); this.g.applyWorld(); },
  ruptureMirror() {
    const F = this.F, g = this.g;
    const bm = g.world.get('bath_mirror');
    if (!bm || bm.fog < 0.7) { this.say0('{rafa}', '*Ainda não embaçou o suficiente.*'); return; }
    this.run(async (s) => {
      const r = await g.ui.keypad({ title: 'Escrever no espelho embaçado', hint: 'Escreva com o dedo.', mode: 'text', check: (v) => (String(v).trim().length ? true : 'Escreva alguma coisa.') });
      g.resumePointer(true);
      if (!r) return;
      F.nameWritten = String(r).trim().slice(0, 24);
      this.drawMirrorName(F.nameWritten);
      g.applyWorld();
      audio.play('page');
      const mine = [names.rafaela, names.rafa, names.rafaela + ' ' + names.sobrenome].map(norm).includes(norm(r));
      await s.wait(0.8);
      await s.say('{rafa}', mine ? '*A casa lembra de mim. Eu moro aqui.*' : '*Não era bem o meu nome... mas a casa entendeu.*', { dur: 3 });
      this.afterRupture('Espelho');
    });
  },
  ruptureKeys() {
    const F = this.F, g = this.g;
    const need = [['chaves_mae', 'o chaveiro da mãe'], ['chave_pai', 'a chave do pai'], ['chave_velha', 'a chave velha']];
    const missing = need.filter(([id]) => !this.has(id)).map(([, n]) => n);
    if (missing.length) { this.say0('{rafa}', '*Falta ' + missing.join(' e ') + '.*'); return; }
    need.forEach(([id]) => this.take(id));
    F.keysHung = true; F.oldKeyHung = true;
    g.applyWorld();
    audio.play('pickup'); audio.play('chime', { notes: [60, 64, 67, 72], v: 0.4, delay: 0.3 });
    this.afterRupture('Porta-chaves');
  },
  afterRupture(what) {
    const g = this.g, F = this.F;
    this.progress();
    audio.play('wrong', { v: 1 });
    audio.play('boom', { v: 0.6, delay: 0.3 });
    this.warp = 1.4;
    g.player.shake(0.4);
    const n = this.ruptureCount();
    this.toast(`A casa ficou diferente (${n}/3) · casa.mp4: ${Math.round(this.sim())}% igual`, 3.5);
    const L = ['', 'PARE.', 'VOCÊ NÃO SABE O QUE ESTÁ FAZENDO', ''];
    if (L[n]) this.after(1.5, () => g.phone.receive('wendel', '??? (sem número)', L[n], { glitch: true }));
    const e = g.entity;
    if (e.hunt) { e.strength = this.huntStrength(); e.investigate(g.player.pos.x, g.player.pos.z); }
    this.objective('ruptures');
    if (n >= 3) { this.after(2.5, () => this.startClimaxPhase()); return; }
    g.checkpoint('a3_r' + n);
  },

  // ------------------------------------------------------------ clímax
  startClimaxPhase() {
    const g = this.g, F = this.F;
    g.entity.hide();
    this.phase = 'a3_climax';
    F.climaxReady = true;
    for (const f of g.world.fixtures) if (!['varanda', 'extra', 'porao1', 'porao2', 'porao_escada', 'lamppost'].includes(f.id)) f.on = false;
    g.tv.set('static');
    audio.play('tv_on', { pos: [0.3, 1.4, 2.8], vol: 1.5 });
    g.phone.receive('wendel', '??? (sem número)', 'Então venha me dizer isso na cara.', { glitch: true });
    this.objective('climax');
    g.checkpoint('a3_climax');
    this.climaxArmed = true;
    if ((this.zones || []).includes('sala')) this.after(1.5, () => this.enter_a3_climax_sala());
  },
  resume_a3_climax() {
    const g = this.g;
    this._prevZones = [];
    for (const f of g.world.fixtures) if (!['varanda', 'extra', 'porao1', 'porao2', 'porao_escada', 'lamppost'].includes(f.id)) f.on = false;
    g.tv.set('static');
    this.objective('climax');
    this.climaxArmed = true;
  },
  enter_a3_climax_sala() {
    if (!this.climaxArmed) return;
    this.climaxArmed = false;
    this.run((s) => this.climax(s));
  },
  async climax(s) {
    const g = this.g, F = this.F, e = g.entity, c = g.clown;
    this.cut(true, { look: true });
    g.setLight('sala', true, 1.5);
    await s.wait(1.0);
    await g.player.lookAt(new THREE.Vector3(0.2, 1.4, 2.8), 1.2);
    await s.wait(1.5);
    // sai da TV
    e.show(0.3, 2.8, Math.PI / 2, 'ecv');
    e.model.scale.setScalar(0.25);
    e.model.position.y = 1.0;
    g.tv.set('static');
    for (let i = 0; i <= 30; i++) {
      const k = i / 30;
      e.model.scale.setScalar(0.25 + 0.75 * k);
      e.place(0.3 + 1.0 * k, 2.8, Math.PI / 2);
      e.model.position.y = 1.0 * (1 - k);
      await s.wait(0.08);
    }
    g.tv.set('off');
    await s.wait(1.2);
    audio.play('scream', { pos: e.pos, v: 1, dur: 2.2 });
    const growl = audio.loop('growl', { pos: e.pos, vol: 1 });
    g.player.shake(0.6);
    await s.wait(1.2);
    c.show(2.1, 3.4, -Math.PI / 2 - 0.3, 'ec', true);
    c.honk(1.2);
    await s.wait(1.2);
    await s.say('O Inquilino', 'Eu só quero uma casa, {rafaela}.', { tts: 'inq', kind: 'enemy', dur: 3 });
    await s.say('O Inquilino', 'Todo mundo quer uma casa.', { tts: 'inq', kind: 'enemy', dur: 2.6 });
    await s.say('O Inquilino', 'Me dá um cômodo. Um só. Um que ninguém vá lembrar. E eu devolvo eles pra você. Agora.', { tts: 'inq', kind: 'enemy', dur: 5 });
    const ch = await g.ui.choice('O Inquilino estende a mão comprida. Atrás dele, o palhaço balança a cabeça devagar: não.', ['Dar um cômodo pra ele.', 'Não. Essa casa é nossa.']);
    g.resumePointer(true);
    if (ch === 0) { growl.stop(1); return this.endingInquilino(s); }
    // luta: gravar
    audio.play('scream', { pos: e.pos, v: 1.1, dur: 1.6 });
    for (let i = 0; i < 6; i++) { e.place(1.3 + i * 0.12, 2.8, Math.PI / 2); await s.wait(0.05); }
    c.show(e.pos.x + 0.3, e.pos.z + 0.25, -Math.PI / 2, 'ec', true);
    c.honk(1.4);
    await s.say('', '*O palhaço agarra ele por trás!*', { dur: 2 });
    this.objective('record');
    this.toast('GRAVE ELE! Segure o botão direito e mantenha ele no centro.', 4);
    g.allowPhoneInCutscene = true;
    g.player.lookLock = false;
    this.recordProgress = 0;
    let out = 0, t = 0;
    while (this.recordProgress < 1) {
      await s.wait(0.05);
      t += 0.05;
      const x = 1.55 + Math.sin(t * 1.1) * 0.35, z = 2.8 + Math.sin(t * 1.7) * 0.9;
      e.place(x, z, Math.PI / 2 + Math.sin(t * 3) * 0.4);
      c.model.position.set(x + 0.3, 0, z + 0.2);
      growl.setPos(e.pos);
      const on = g.phone.raised && this.lookingAt([x, 2.0, z], 0.24, 8);
      if (on) { this.recordProgress = Math.min(1, this.recordProgress + 0.05 / 9); out = 0; this.glitch = 0.15; e.stunT = 0; }
      else { out += 0.05; this.glitch = Math.min(0.6, out * 0.2); }
      if (out > 3.5) {
        this.recordProgress = undefined; this.glitch = 0;
        growl.stop(0.2);
        g.allowPhoneInCutscene = false;
        c.hide();
        await s.say('', '*Ele se soltou!*', { dur: 1 });
        g.caught(false);
        return;
      }
    }
    this.recordProgress = undefined;
    this.glitch = 0;
    g.allowPhoneInCutscene = false;
    audio.play('record_beep');
    this.toast('casa.mp4 — gravação substituída', 3);
    audio.play('scream', { pos: e.pos, v: 1.2, dur: 2.5 });
    // sugado pra dentro do celular
    const cam = g.camera;
    for (let i = 0; i <= 25; i++) {
      const k = i / 25;
      const fx = cam.position.x - Math.sin(g.player.yaw) * 0.6, fz = cam.position.z - Math.cos(g.player.yaw) * 0.6;
      e.place(e.pos.x + (fx - e.pos.x) * 0.15, e.pos.z + (fz - e.pos.z) * 0.15, e.yaw + 0.3);
      e.model.scale.setScalar(Math.max(0.02, 1 - k));
      e.model.position.y = k * 1.2;
      await s.wait(0.05);
    }
    e.hide();
    e.model.scale.setScalar(1);
    growl.stop(0.3);
    g.player.shake(0.8);
    audio.play('boom', { v: 1 });
    g.ui.flash(0.5, 0.6);
    await s.wait(1.5);
    await s.say('{rafa}', '*Ele tá... dentro do meu celular. Dentro do vídeo.*', { dur: 3 });
    const ch2 = await g.ui.choice('casa.mp4 agora só tem uma coisa gravada: ele.', ['Apagar casa.mp4', 'Guardar o vídeo']);
    g.resumePointer(true);
    if (ch2 === 1) return this.endingEpilogue(s, 'copia');
    // apagar
    this.toast('Excluindo casa.mp4...', 2);
    audio.play('phone_glitch');
    await s.wait(2.0);
    audio.play('boom', { v: 0.8 });
    audio.play('chime', { notes: [57, 64, 69, 73, 76, 81], v: 0.7 });
    for (const f of g.world.fixtures) if (['sala', 'entrada'].includes(f.id)) f.on = true;
    await s.wait(1.2);
    c.show(2.0, 3.2, -Math.PI / 2, 'ec', true);
    c.showCard(T('OBRIGADO POR LEMBRAR DE MIM, {RAFA}.').toUpperCase());
    g.ui.say('Tique-Taque', T('OBRIGADO POR LEMBRAR DE MIM, {RAFA}.').toUpperCase(), 3.5, 'house');
    await s.wait(3.5);
    // começa a sumir
    let saved = false;
    if (this.has('relogio_ovo')) {
      const ch3 = await g.ui.choice('O palhaço começa a sumir, como uma foto velha desbotando.\nNo seu bolso, o relógio-ovo esquenta: "PARA DESFAZER UM MOMENTO".', ['Apertar o botão do relógio-ovo', 'Deixar ele ir']);
      g.resumePointer(true);
      if (ch3 === 0) {
        saved = true;
        for (let i = 0; i < 8; i++) { audio.play('clock', { tock: i % 2 === 1, vol: 1.2 }); await s.wait(0.25); }
        this.warp = 2;
        g.ui.flash(0.4, 1.2, '#cfe0ff');
        await s.wait(1.2);
        c.showCard('...TIQUE-TAQUE.');
        g.ui.say('Tique-Taque', '...TIQUE-TAQUE.', 2.5, 'house');
        F.clownSaved = true;
        await s.wait(2.5);
      }
    }
    if (!saved) {
      c.model.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; } });
      for (let i = 0; i < 25; i++) { c.model.traverse((o) => { if (o.material) o.material.opacity = 1 - i / 25; }); await s.wait(0.08); }
      c.hide();
    }
    return this.endingEpilogue(s, 'casa');
  },

  // ------------------------------------------------------------ finais
  async endingInquilino(s) {
    const g = this.g;
    audio.speak(T('Obrigado, {rafaela}.'), { pitch: 0.1, rate: 0.6 });
    await s.say('O Inquilino', 'Obrigado, {rafaela}.', { dur: 2.6, kind: 'enemy' });
    g.ui.flash(1, 3, '#fff');
    await g.ui.fade(1, 2);
    g.entity.hide(); g.clown.hide();
    this.finish('inquilino');
  },
  async endingEpilogue(s, kind) {
    const g = this.g, F = this.F;
    await g.ui.fade(1, 2);
    g.clown.hide();
    g.entity.hide();
    g.stopAmbience();
    audio.music('end');
    // amanhecer
    F.act = 1;
    g.clockMin = 6 * 60;
    for (const f of g.world.fixtures) f.on = false;
    const v = g.fixture('varanda'); if (v) { v.on = true; v.color.set(0xffb070); v.intensity = 9; v.dist = 12; }
    g.fixture('sala') && (g.fixture('sala').on = true);
    this.tint = [1.12, 1.0, 0.9];
    g.player.teleport(2.6, 6.6, Math.PI, 0);
    g.echoes.clear();
    g.cats.bento.setVisible(true); g.cats.bento.place(3.4, 3.0, 0);
    if (F.liliFollow) { g.cats.lili.setVisible(true); g.cats.lili.place(2.9, 6.9, Math.PI); g.cats.lili.mode = 'idle'; }
    this.cut(true, { look: true });
    await g.ui.fade(0, 3);
    g.ui.toast('06:00', 3);
    await s.say('{rafa}', '*Amanheceu. A geladeira voltou a zumbir. O {bento} tá pedindo ração.*', { dur: 3.6 });
    await s.wait(1.5);
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
  finish(kind) {
    const g = this.g, F = this.F;
    g._endingNow = true;
    this.cut(false);
    g.state = 'ending';
    g.input.unlock();
    audio.stopAllLoops(1);
    audio.music('end');
    try { localStorage.removeItem('casa-se-lembra/save/v1'); } catch (e) { /* ok */ }
    const mins = Math.max(1, Math.round(g.time / 60));
    const lines = [];
    if (kind === 'inquilino') {
      lines.push('06:00. A sua mãe te acorda no sofá. Todo mundo em casa. O {bento} miando pela ração.');
      lines.push('Ninguém lembra de nada. Ninguém lembra de uma porta roxa no corredor.');
      lines.push('— Que quarto roxo, {rafa}? Você sempre dormiu na sala.');
      lines.push('À noite, alguém muito alto se mexe no quarto que ninguém lembra.\nEle é um ótimo inquilino. Nunca faz barulho.');
    } else {
      lines.push('A sua família acordou cada um na sua cama, dizendo que teve o mesmo sonho: uma festa, uma sala amarela, um palhaço com um relógio no peito.');
      lines.push(kind === 'copia'
        ? 'Mas casa.mp4 continua no seu celular. Toda noite, às 3:33, o arquivo fica um pouquinho maior.\n\n[notificação] casa.mp4 — 101% igual.'
        : F.clownSaved ? 'Na foto da festa de 5 anos, o palhaço agora está olhando pra você. E sorrindo.' : 'Na foto da festa de 5 anos, o palhaço está de olhos fechados. Como quem dorme depois de um dia muito longo.');
    }
    lines.push(F.liliFollow ? 'A {lili} dormiu em cima do seu pé a manhã inteira.' : 'A {lili} ficou três dias sem sair de dentro do rack.');
    lines.push(F.invited ? 'Na porta da frente ficaram arranhões fundos, do lado de dentro. Ninguém soube explicar.' : 'A porta da frente nunca foi aberta naquela noite. Você não convidou ninguém.');
    const fx = this.fixCount();
    lines.push(fx <= 1 ? 'Você só consertou o que te mandaram consertar. Desconfiou cedo. A casa gostou disso.' : fx >= 5 ? 'Você consertou quase tudo o que a casa tinha mudado pra te proteger. Ela te perdoou mesmo assim.' : `Você consertou ${fx} coisas que a casa tinha mudado pra te proteger.`);
    if (F.secretVasco) lines.push('A camisa preta com a faixa ficou pendurada na cadeira. Pra dar sorte.');
    if (F.secretChrono) lines.push('Às vezes, quando a casa fica em silêncio, dá pra ouvir um tique-taque que não vem de relógio nenhum.');
    const title = kind === 'inquilino' ? 'FINAL: O INQUILINO' : kind === 'copia' ? 'FINAL: CÓPIA DE SEGURANÇA' : F.clownSaved ? 'FINAL: A CASA SE LEMBRA (e o palhaço também)' : 'FINAL: A CASA SE LEMBRA';
    const found = ['Vasco', 'Chrono', 'Bloodborne'].filter((k) => (k === 'Vasco' ? F.secretVasco : k === 'Chrono' ? F.secretChrono : F.dadFound)).length;
    const html = `<div class="end-tag">${title}</div><h1>A CASA SE LEMBRA</h1>` +
      lines.map((l) => `<p>${T(l).replace(/\n/g, '<br>')}</p>`).join('') +
      `<p class="end-tag">tempo de jogo: ${mins} min · vezes que a casa esqueceu: ${g.deaths} · segredos: ${found}/3</p>` +
      `<p style="margin-top:30px">${T('Para {rafaela}.')}<br>${T('Com carinho, {wendel}.')}</p>` +
      (kind !== 'casa' ? '<p class="end-tag">(existe outro final)</p>' : '');
    g.ui.ending(html, () => { g._endingNow = false; g.quitToMenu(); });
  },
};
