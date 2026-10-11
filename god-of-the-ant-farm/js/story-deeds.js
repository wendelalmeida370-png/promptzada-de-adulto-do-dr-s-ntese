'use strict';
// ============================================================
//  Deeds, staged: the moments of the other great stories.
//    VINGANÇA    the oath over the body; the killer in chains, face to face (the
//                knife, the mercy, or only silence); the grave, told it is done;
//                and, on a field of battle, the two of them seeing each other.
//    RESGATE     the night in the captors' town: the guard's torch, the whisper,
//                the bonds cut, the run.
//    CAÇADA      the tracks at the edge of the woods; the beast coming out of the
//                trees; the spear raised over it.
//    INSURREIÇÃO the first night: a candle and a name sworn on.
//    and for every story followed, its strong chapters are not only written: the
//    camera goes to who lives them (O MOMENTO).
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn) return;
  const L = St.lib;
  const { pe, desc } = L;
  const TAU = Math.PI * 2;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : ''; };
  const free = v => v && !v.dead && !v.captive && !v.held && !v.aboard && !v.ug && !v.sleeping && !(v.task && (v.task.type === 'jail' || v.task.type === 'condemned' || v.task.type === 'combat' || v.task.type === 'band' || v.task.type === 'army' || v.task.type === 'riot'));
  const OATH = {
    nordico: (T, V) => `Pelo machado de ${V}: ${T} vai pagar com sangue.`,
    romano: (T) => `Diante dos deuses da casa: ${T} vai pagar.`,
    egipcio: (T) => `Que Maat me ouça: o coração de ${T} vai ser pesado.`,
    asteca: (T) => `Juro ao Sol: o sangue de ${T} vai correr nas pedras.`,
    grego: (T) => `Pelas Erínias: ${T} não escapa.`,
  };

  // ====================================================================================
  //  VINGANÇA
  // ====================================================================================
  Sn.define('vg-juramento', { imp: 2, kick: 'Vingança', lazy: true, doing: () => 'Voltando ao lugar onde tudo aconteceu', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const V = PD(s.cast.victim), T = PD(s.cast.target);
    const body = G.Carnage && G.Carnage.byVid(s.cast.victim);
    const at = body ? [body.x, body.y] : [s.place.x, s.place.y];
    yield c.walk('p', Sn.spot(at[0] + 0.8, at[1] + 0.5, 1.5) || at, { max: 60 });
    c.ready();
    c.tag('p', ({ pai: 'filh', mae: 'filh', filho: 'pai', filha: 'pai' })[s.data.rel] ? (s.data.rel === 'pai' || s.data.rel === 'mae' ? (p.g === 'f' ? 'filha' : 'filho') : (p.g === 'f' ? 'mãe' : 'pai')) + ' de ' + (V ? V.name : '') : 'quem ficou');
    c.mood('sad');
    c.title('Vingança', 'O Juramento');
    c.caption(s.data.saw ? `${p.name} viu tudo. ${V ? V.name : 'Quem amava'} no chão, e ${T ? T.name : 'o assassino'} indo embora.` : `${V ? V.name : 'Quem amava'} está morto. Todos sabem quem foi.`);
    c.face('p', at); c.cam(['p', at], { zoom: 4.2 });
    c.pose('p', 'weepk'); c.sfx('sob');
    yield 2.4;
    if (V) yield c.say('p', `${Sn.voc(p, V)}...`, { style: 'whisper' });
    yield 1.6;
    c.mood('dread');
    if (p.age < 14) {
      c.pose('p', 'cower');
      yield c.say('p', pick([`Eu nunca vou esquecer esse rosto.`, `${T ? T.name : 'Ele'}. ${T ? T.name : 'Ele'}. ${T ? T.name : 'Ele'}.`]), { style: 'think' });
    } else {
      c.pose('p', ''); yield 0.8;
      const civ = p._civ || p.civ;
      c.pose('p', p.role === 'guerreiro' || p.role === 'cacador' ? 'brandish' : 'swear');
      c.slow(0.6, 1.6);
      const words = OATH[civ] ? OATH[civ](T ? T.name : 'quem fez isso', V ? V.name : '') : `${T ? T.name : 'Quem fez isso'}. Eu vou te encontrar.`;
      s.data.oathTxt = words;
      yield c.say('p', words, { style: 'say' });
    }
    c.snap('O juramento');
    c.attach();
    yield 1.5;
    return 'ok';
  } });
  // face to face with the killer in chains
  Sn.define('vg-frente', { imp: 3, kick: 'Vingança', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Indo ver o assassino de perto' : null), *gen(c) {
    const s = c.story(); const p = c.v('p'); const t = c.v('t'); if (!s || !p || !t) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const V = PD(s.cast.victim); const VN = V ? V.name : 'quem morreu';
    // (unseen until the last steps: then the camera walks the rest with them)
    if (G.dist(p.x, p.y, t.x, t.y) > 6.5) yield c.approach('p', 't', 6, { max: 60 });
    if (!P(t.id) || !t.captive) return 'sem';
    const held = c.take('t', { keep: true, force: true });
    c.ready();
    s.data.visits = (s.data.visits || 0) + 1;
    const first = s.data.visits === 1;
    c.tag('p', 'quem jurou'); c.tag('t', 'acorrentad' + oa(t));
    c.mood('dread');
    c.title('Vingança', first ? 'Frente a Frente' : 'De Novo, Frente a Frente');
    c.cam(['p', 't'], { zoom: 3.8 });
    if (held) c.pose('t', 'dig');
    yield c.approach('p', 't', 1.2, { slow: true, max: 12 });
    // the chained one feels it before seeing it
    if (held) { c.pose('t', ''); c.face('t', 'p'); c.emote('t', first ? 'fear' : 'question', 2.4); }
    c.face('p', 't'); c.cam(['p', 't'], { zoom: 4.6 });
    yield 1.6;
    yield c.say('p', first ? pick([`Olha pra mim.`, `Lembra de mim? Eu estava lá.`, `Você lembra de ${VN}?`]) : pick([`Voltei.`, `Ainda não decidi o que fazer com você.`, `Não consigo dormir. Sabe por quê?`]));
    const tt = Sn.temper(t);
    const ans = { frio: [`Lembro. ${VN} gritou o seu nome.`, `Era ${VN} ou eu.`], medroso: [`Era guerra... eu só obedecia...`, `Por favor. Por favor.`], bravo: [`Faça logo, se tem coragem.`, `Vai ficar só olhando?`], devoto: [`Rezo por ${VN} toda noite. Não que isso mude nada.`], firme: [`Eu sei quem você é.`, `Eu esperava por você.`] }[tt];
    if (held && tt === 'medroso') c.pose('t', 'beg');
    yield c.say('t', pick(ans));
    // the oath, remembered
    c.cam(['p'], { zoom: 5 });
    if (s.data.oathTxt) c.caption(`${first ? 'Naquela noite' : 'Um dia'}, ${p.name} jurou: "${s.data.oathTxt}"`, { hold: 3.2 });
    c.pose('p', 'draw'); c.sfx('swish', null, 0.6); c.sfx('heartbeat'); c.mood('tense');
    c.slow(0.55, 2.4);
    yield 3;
    c.snap('A faca na mão');
    const q = pe(p);
    const strike = (q.cru > 0.55 || q.agg > 0.68) && q.pie < 0.62;
    const spare = !strike && (q.pie > 0.6 || (q.agg < 0.4 && s.data.visits >= 2) || s.data.visits >= 3);
    if (strike) {
      c.cam(['p', 't'], { zoom: 4.8 });
      c.slow(0.4, 2.6);
      yield c.say('p', `Por ${VN}.`, { style: 'shout' });
      if (held) { c.release('t'); }
      c.release('p');
      G.Vg.H.setTask(p, { type: 'combat', id: t.id, pri: 4.2, any: true, kind: 'combat', cause: 'vinganca' });
      c.cam([p, t], { zoom: 4.2 });
      yield c.until(() => !P(t.id) || !P(p.id), 12);
      if (!P(t.id)) { c.snap('O acerto'); c.mood('sad'); yield 2; }
      return 'matou';
    }
    if (spare) {
      c.mood('sad');
      yield 1.4;
      c.pose('p', ''); c.sfx('thud', null, 0.4);
      c.caption(`A faca cai na terra.`, { hold: 2 });
      yield 1.2;
      yield c.say('p', pick([`${VN} não ia querer isso.`, `Viva com isso. É pior.`, `Eu não sou você.`]));
      if (held) yield c.say('t', pick([`Por quê...?`, `...Obrigad${oa(t)}.`, `Você vai se arrepender.`]), { style: 'whisper' });
      const away = c.beside('p', 6);
      c.cam(['p', 't'], { zoom: 3.6, soft: 1 });
      if (away) yield c.walk('p', away, { slow: true, max: 9 });
      c.snap('O perdão');
      return 'poupou';
    }
    c.pose('p', '');
    yield c.say('p', pick([`Ainda não.`, `Hoje não.`, '...']), { style: 'think' });
    if (held) c.pose('t', 'dig');
    yield 1.6;
    const away = c.beside('p', 5); if (away) yield c.walk('p', away, { max: 7 });
    return 'hesitou';
  } });
  Sn.define('vg-tumulo', { imp: 2, kick: 'Vingança', lazy: true, doing: () => 'Indo ao túmulo de quem morreu', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    const r = G.S.dead && G.S.dead.get(s.cast.victim); const g = r && r.grave && G.S.buildings.get(r.grave); if (!g) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const f = G.Village.frontTile(g);
    yield c.walk('p', f, { max: 80 });
    c.ready();
    const V = PD(s.cast.victim);
    c.mood('sad'); c.tag('p', 'quem cumpriu');
    c.title('Vingança', 'O Túmulo');
    c.prop('candle', f[0] + 0.4, f[1] - 0.3, { secs: 60 });
    c.face('p', [g.x + 1, g.y + 1]); c.pose('p', 'pray');
    c.cam(['p'], { zoom: 4.4, soft: 1 });
    yield 2.4;
    yield c.say('p', pick([`Está feito, ${V ? Sn.vocL(p, V) : 'ouviu'}. Pode descansar.`, `Ele não respira mais. Eu juro que não.`, `Eu cumpri. Agora me deixa dormir.`]), { style: 'whisper' });
    c.mood('awe');
    c.snap('O túmulo');
    yield 2.6;
    return 'ok';
  } });
  // the field of battle: nothing is staged — the camera only finds them
  Sn.define('vg-campo', { imp: 3, kick: 'Vingança', *gen(c) {
    const s = c.story(); const p = c.v('p'); const t = c.v('t'); if (!s || !p || !t) return 'sem';
    const V = PD(s.cast.victim);
    c.tag('p', 'quem jurou'); c.tag('t', 'o alvo');
    c.mood('tense'); c.focus('p', 't');
    c.title('Vingança', 'No Meio da Batalha');
    c.caption(`No meio da poeira, ${p.name} reconhece ${t.name}.`);
    c.cam(['p', 't'], { zoom: 'fit' });
    c.slow(0.5, 2);
    yield c.say('p', `${t.name.toUpperCase()}! Lembra de ${V ? V.name : 'mim'}?!`, { style: 'shout' });
    c.snap('Frente a frente');
    yield c.until(() => !P(t.id) || !P(p.id) || G.dist(p.x, p.y, t.x, t.y) > 12, 18);
    if (!P(t.id)) c.snap(`${t.name} cai`);
    return 'ok';
  } });

  const OV = St.DEF.vinganca;
  if (OV) St.define('vinganca', Object.assign({}, OV, {
    tick(s) {
      const p = P(s.protag);
      if (!G.Scene.running(s.id) && p) {
        // the oath, played (if they are near the place, on the day)
        if (!s.data.jur) { s.data.jur = 1; if (free(p) && G.dist(p.x, p.y, s.place.x, s.place.y) < 30 && G.S.day - s.born < 1) { St.scene(s, 'vg-juramento', {}, { at: [s.place.x, s.place.y] }); return; } }
        // the field of battle (the world brought them together)
        const t = P(s.cast.target);
        if (t && s.phase === 'confronto' && s.data.campo !== s.data.met && G.dist(p.x, p.y, t.x, t.y) < 7) { s.data.campo = s.data.met; St.scene(s, 'vg-campo', { t: t.id }, { at: [p.x, p.y] }); }
      }
      return OV.tick.call(this, s);
    },
    arrive(s, v, t) {
      if (G.Scene.running(s.id)) return;
      // face to face: the scene takes them from the errand (and decides)
      if (t.sub === 'frente' && s.phase === 'frente') {
        const tg = P(s.cast.target);
        if (tg && tg.captive && St.scene(s, 'vg-frente', { t: tg.id }, { at: [tg.x, tg.y], onEnd: res => {
          if (res === 'poupou') { St.finish(s, 'perdoada', 'sereno', St.say(s, 'vg-perdao'), { x: v.x, y: v.y, log: true, toast: true, big: 1, clima: 'perdao', legend: true }); G.Life && G.Life.bio(tg, 'note', `${v.name}, que jurou vingança, ${tg.g === 'f' ? 'a' : 'o'} poupou`); }
          else if (res === 'hesitou' && s.data.visits === 2) St.beat(s, 'vg-hesitou');
          if ((s.data.visits || 0) === 1 && res !== 'sem' && res !== 'ocupada' && s.st === 'ativa') St.beat(s, 'vg-diante', null, { x: v.x, y: v.y });
        } })) return;
      }
      // the grave: told it is done
      if (t.sub === 'tumulo' && s.phase === 'tumulo' && !s.data.tumScene) {
        s.data.tumScene = 1;
        if (St.scene(s, 'vg-tumulo', {}, { at: [v.x, v.y], onEnd: () => { if (s.st === 'ativa') St.finish(s, 'cumprida', 'agridoce', St.say(s, 'vg-tumulo'), { x: v.x, y: v.y, log: true, clima: s.data.clima, legend: true }); } })) return;
      }
      if (OV.arrive) return OV.arrive.call(this, s, v, t);
    },
    done(s, v, t) {
      if (G.Scene.running(s.id)) return;
      return OV.done.call(this, s, v, t);
    },
  }));

  // ====================================================================================
  //  RESGATE — the night in their town
  // ====================================================================================
  Sn.define('rs-noite', { imp: 3, kick: 'Resgate', *gen(c) {
    const s = c.story(); const p = c.v('p'); const cap = c.v('cap'); const jt = c.data.jt;
    if (!s || !p || !cap || !jt) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true, calm: true })) return 'ocupada';
    const city = setName(cap.set);
    c.tag('p', 'veio buscar'); c.tag('cap', 'cativ' + oa(cap));
    c.mood('night');
    p.lantern = false;
    c.title('Resgate', 'A Noite');
    c.caption(`${city}, noite fechada. ${cap.name} dorme acorrentad${oa(cap)} em algum lugar ali dentro.`);
    c.chapter(`${p.name} entrou em ${city} no escuro, procurando ${cap.name}.`, { k: 'rs-noite' });
    c.cam(['p'], { zoom: 3.6 });
    c.pose('p', 'sneak');
    const inWay = c.approach('p', 'cap', 1.1, { sneak: true, max: 70 });
    yield 1.2;
    yield c.say('p', pick([`Devagar... devagar.`, `Não pisa no cascalho.`, `Se me pegarem, ninguém mais vem por você.`]), { style: 'think' });
    c.sfx('heartbeat', null, 0.5);
    yield c.any(inWay, 4);
    if (G.dist(p.x, p.y, cap.x, cap.y) > 1.6) { c.cam(['p', 'cap'], { zoom: 'fit', soft: 1 }); yield c.say('p', pick([`Ali. É ${oa(cap) === 'a' ? 'ela' : 'ele'}.`, `${cap.name}...`]), { style: 'think' }); }
    yield inWay;
    if (!P(cap.id) || !cap.captive) return 'sem';
    // who is awake nearby
    const cf = G.Fac.idOfV(cap); let guard = null, risk = 0;
    for (const o of G.S.villagers.values()) {
      if (o.captive || o.sleeping || o.inside || o.age < 16 || G.Fac.idOfV(o) !== cf) continue;
      if (G.dist2(o.x, o.y, p.x, p.y) > 49) continue;
      const r = o.role === 'guerreiro' ? 0.4 : 0.15; risk = 1 - (1 - risk) * (1 - r); if (!guard || o.role === 'guerreiro') guard = o;
    }
    if ((p.traits || []).includes('Medroso')) risk *= 1.3;
    if (guard && c.take(guard, { keep: true, force: true })) {
      guard.holdTorch = true; c.tag(guard, guard.role === 'guerreiro' ? 'guarda' : 'acordad' + oa(guard));
      c.pose('p', 'hide'); c.cam(['p', guard], { zoom: 'fit' }); c.sfx('heartbeat'); c.mood('tense');
      c.walk(guard, Sn.spot(p.x + (guard.x - p.x) * 0.5, p.y + (guard.y - p.y) * 0.5, 1.2) || [guard.x, guard.y], { slow: true, max: 6 });
      yield c.say(guard, pick([`Quem anda aí?`, `Tem alguém aí?`, `...Hm?`]), { style: 'whisper' });
      c.slow(0.45, 2.2); yield 2;
      if (G.R() < risk) {
        c.face(guard, 'p');
        yield c.say(guard, pick([`ALARME! UM INTRUSO!`, `PEGUEM! TEM ALGUÉM AQUI!`]), { style: 'shout' });
        guard.holdTorch = false;
        if (guard.role === 'guerreiro' && G.R() < 0.6) { c.release(guard); c.release('p'); St.beat(s, 'rs-pego', { GUARD: guard.name }, { x: p.x, y: p.y, log: true, big: 1 }); G.War.capture(p, guard); s.phase = 'plano'; c.snap('Pego'); return 'pego'; }
        c.release(guard); c.release('p'); St.beat(s, 'rs-fugiu', { GUARD: guard.name }, { x: p.x, y: p.y, big: 1 }); s.phase = 'plano'; G.Vg.fleeFrom(p, guard.x, guard.y, 10, 'war'); return 'fugiu';
      }
      c.sfx('owl'); guard.holdTorch = false; c.release(guard);
      yield 1.4;
    }
    // the whisper, the bonds
    c.mood('dread');
    c.face('p', 'cap'); c.face('cap', 'p'); c.pose('p', 'hide');
    c.cam(['p', 'cap'], { zoom: 4.5 });
    yield c.say('p', `${Sn.voc(p, cap)}. Sou eu.`, { style: 'whisper' });
    yield c.say('cap', pick([`${Sn.voc(cap, p)}?! Você... veio.`, `Eu achei que ninguém viesse.`, `Você é louc${oa(p)}...`]), { style: 'whisper' });
    yield c.say('p', pick([`Shh. Agora corre comigo.`, `Depois você chora. Agora corre.`]), { style: 'whisper' });
    c.pose('p', 'cut'); c.sfx('ropecut'); yield 1.4;
    c.snap('As correntes');
    if (!G.War.startEscape(cap)) return 'falhou';
    s.data.freed = 1; s.phase = 'fuga';
    St.beat(s, 'rs-libertou', { city }, { x: p.x, y: p.y, log: true, toast: true, big: 1 });
    G.Life && G.Life.bio(p, 'note', `Entrou em ${city} de noite e libertou ${cap.name}`);
    // home, running (the road takes them from here)
    jt.leg = 1; jt.legs = 2; jt.st = 0; jt.hurry = 1.25; jt.road = []; jt.noCamp = 1;
    c.mood('tense'); c.pose('p', '');
    c.cam(['p', 'cap'], { zoom: 3.2 });
    yield 1.2;
    return 'livre';
  } });
  const OR = St.DEF.resgate;
  if (OR) St.define('resgate', Object.assign({}, OR, {
    step(s, v, t, dt, H) {
      if (G.Scene.running(s.id)) return; // (a moment being shown: the night waits for it)
      if (!t.scened) {
        t.scened = 1; const c = P(t.tid);
        if (c && c.captive && St.scene(s, 'rs-noite', { cap: c.id }, { at: [v.x, v.y], data: { jt: t } })) return;
      }
      return OR.step.call(this, s, v, t, dt, H);
    },
  }));

  // ====================================================================================
  //  CAÇADA
  // ====================================================================================
  Sn.define('cf-rastro', { imp: 1, kick: 'Caçada', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    c.tag('p', 'caça'); c.mood('dread');
    c.title('Caçada', 'O Rastro');
    c.cam(['p'], { zoom: 4.4 });
    c.pose('p', 'kneel'); c.emote('p', 'question', 2.4);
    yield 2;
    const a = G.S.animals.get(s.cast.beast);
    yield c.say('p', pick([`Pegadas. Fundas. É grande.`, `Pelo de ${s.data.beastName} preso no espinho.`, `Ainda está quente. Passou aqui faz pouco.`]), { style: 'think' });
    c.pose('p', 'point'); if (a) c.face('p', a);
    yield c.say('p', pick([`Foi pra lá.`, `Te achei.`]), { style: 'think' });
    c.snap('O rastro'); c.attach();
    yield 1.2;
    return 'ok';
  } });
  Sn.define('cf-luta', { imp: 3, kick: 'Caçada', *gen(c) {
    const s = c.story(); const p = c.v('p'); const a = G.S.animals.get(s && s.cast.beast); if (!s || !p || !a) return 'sem';
    c.tag('p', 'caça'); c.mood('tense'); c.focus('p', a);
    c.title('Caçada', 'A Fera');
    c.caption(`${s.data.beastName} sai do mato.`);
    c.cam(['p', a], { zoom: 'fit' });
    c.sfx('howl'); c.slow(0.4, 2.2); c.shake(0.3);
    yield c.say('p', pick([`Vem! VEM!`, `É hoje, ${s.data.beastName}.`, `Por ${(PD(s.cast.victim) || {}).name || 'todos'}!`]), { style: 'shout' });
    c.snap('A fera');
    const t0 = c.sc.t; let beat = t0, hurt = false;
    const GRUNT = [`Aguenta!`, `Vem! Mais perto!`, `Agora!`, `Não corre, não corre...`, `Olha nos olhos dele...`];
    while (c.sc.t - t0 < 26 && !a.dead && P(p.id)) {
      yield 0.4;
      c.cam([p, a], { zoom: G.dist(p.x, p.y, a.x, a.y) < 4 ? 4.6 : 'fit', soft: 1 });
      if (!hurt && p.hp < 45) { hurt = true; c.slow(0.4, 1.8); c.sfx('gasp'); c.emote('p', 'pain', 2); c.say('p', pick([`Aaah!`, `Me pegou...`]), { style: 'shout', wait: 0 }); beat = c.sc.t; continue; }
      if (c.sc.t - beat > 3.8) { beat = c.sc.t; if (G.R() < 0.6) c.say('p', pick(GRUNT), { style: 'shout', wait: 0 }); else { c.sfx('howl', null, 0.5); c.shake(0.15); } }
    }
    if (!a.dead && P(p.id)) { c.caption(`${s.data.beastName} some no mato, ferid${(G.Animals.DEF[s.data.kind] || {}).g === 'f' ? 'a' : 'o'}. Não acabou.`, { hold: 3 }); c.cam(['p'], { zoom: 4.2 }); yield c.say('p', pick([`Eu volto. Eu sempre volto.`, `Da próxima vez...`]), { style: 'think' }); }
    if (a.dead && P(p.id)) {
      c.cam(['p'], { zoom: 4.4 }); c.mood('triumph'); c.slow(0.5, 1.5);
      if (c.take('p', { force: true })) { c.pose('p', 'brandish'); }
      yield c.say('p', pick([`${s.data.beastName} está mort${(G.Animals.DEF[s.data.kind] || {}).g === 'f' ? 'a' : 'o'}!`, `Acabou. Acabou!`]), { style: 'shout' });
      c.snap('O troféu');
      yield 2;
    }
    return 'ok';
  } });
  const OC = St.DEF.cacada;
  if (OC) St.define('cacada', Object.assign({}, OC, {
    arrive(s, v, t) {
      if (t.sub === 'rastro' && !s.data.rastroScene && !G.Scene.running(s.id)) { s.data.rastroScene = 1; const r = OC.arrive.call(this, s, v, t); if (v.task === t) St.scene(s, 'cf-rastro', {}, { at: [v.x, v.y] }); return r; }
      return OC.arrive.call(this, s, v, t);
    },
    tick(s) {
      const r = OC.tick.call(this, s);
      if (s.phase === 'confronto' && s.data.lutaScene !== s.data.met && !G.Scene.running(s.id)) { s.data.lutaScene = s.data.met; St.scene(s, 'cf-luta', {}, { at: [s.data.lx, s.data.ly] }); }
      return r;
    },
  }));

  // ====================================================================================
  //  INSURREIÇÃO — a candle, a name
  // ====================================================================================
  Sn.define('in-vela', { imp: 2, kick: 'A Insurreição', lazy: true, doing: () => 'Esperando os outros no escuro', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const crew = (St.party ? St.party.of(s) : []).filter(v => G.S.villagers.has(v.id) && G.dist(v.x, v.y, p.x, p.y) < 30).filter(v => c.take(v, { keep: true }));
    const V = PD(s.cast.victim);
    c.mood('night'); c.tag('p', 'quem chamou'); crew.forEach(v => c.tag(v, 'junto'));
    c.prop('candle', p.x + 0.5, p.y + 0.4, { secs: 60 });
    crew.forEach((v, i) => { const a = (i + 1) / (crew.length + 1) * Math.PI * 1.6; c.walk(v, Sn.spot(p.x + 0.5 + Math.cos(a) * 1.2, p.y + 0.4 + Math.sin(a) * 0.9, 1) || [p.x, p.y], { max: 30 }); });
    yield c.until(() => crew.every(v => !P(v.id) || G.dist(v.x, v.y, p.x, p.y) < 2.2), 25);
    c.ready();
    c.title('A Insurreição', 'A Vela');
    c.caption(crew.length ? `${crew.length + 1} pessoas, uma vela, e um nome.` : `Uma vela. Um nome. Ainda ninguém.`);
    c.cam([[p.x + 0.5, p.y + 0.4]], { zoom: 4.2 });
    for (const v of crew) { c.face(v, 'p'); c.pose(v, 'sittalk'); }
    c.pose('p', 'sit');
    yield c.say('p', pick([`Hoje foi ${V ? V.name : 'um dos nossos'}. Amanhã é qualquer um de nós.`, `Quantos mais vão morrer antes da gente se mexer?`, `Eles têm lanças. A gente tem a cidade inteira.`]), { style: 'whisper' });
    if (crew[0]) yield c.say(crew[0], pick([`E se alguém falar?`, `Eu estou dentro.`, `Diz o que fazer.`]), { style: 'whisper' });
    c.pose('p', 'swear'); crew.forEach(v => c.pose(v, 'swear'));
    yield c.say('p', `Por ${V ? V.name : 'eles'}.`, { style: 'whisper' });
    crew.forEach(v => c.say(v, `Por ${V ? V.name : 'eles'}.`, { style: 'whisper', wait: 0 }));
    c.sfx('sting', null, 0.5); c.snap('A vela');
    yield 2.4;
    c.attach();
    return 'ok';
  } });
  const OI = St.DEF.insurreicao;
  if (OI) St.define('insurreicao', Object.assign({}, OI, {
    arrive(s, v, t) {
      const r = OI.arrive.call(this, s, v, t);
      if (t.sub === 'conspirar' && !s.data.vela && !G.Scene.running(s.id) && v.task === t) { s.data.vela = 1; St.scene(s, 'in-vela', {}, { at: [v.x, v.y] }); }
      return r;
    },
  }));

  // ====================================================================================
  //  O MOMENTO — the strong chapters of a followed story, seen
  // ====================================================================================
  Sn.define('momento', { imp: 2, kick: '', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    // (never pulled out of a fight, a flight or a march: then the camera only watches)
    const t0 = p.task; const busy = t0 && (t0.pri >= 3 || /^(fight|hunt|flee|escape|riot|army|combat|band|siege|panic|fire)$/.test(t0.type));
    const got = !busy && c.take('p', { keep: true, keepSt: true });
    c.tag('p', '');
    const tone = c.data.tone;
    c.mood(tone === 'tragico' ? 'sad' : tone === 'feliz' ? 'awe' : 'dread');
    c.title(St.DEF[s.type] ? St.DEF[s.type].name : '', c.data.head || s.title);
    c.caption(c.data.txt);
    c.cam(['p'], { zoom: 3.9, soft: 1 });
    if (got) { c.pose('p', tone === 'tragico' ? 'weepk' : tone === 'feliz' ? 'joy' : 'look'); c.emote('p', tone === 'tragico' ? 'sad' : tone === 'feliz' ? 'happy' : 'awe', 3); }
    c.attach();
    yield 2.2;
    c.snap(c.data.head || s.title);
    yield Math.min(6, 2 + c.data.txt.length / 30);
    return 'ok';
  } });
  // (right after a scene of the same story, its ending words are not shown twice)
  const lastEnd = {};
  const endPrev = Sn.onEnd; Sn.onEnd = function (sc) { if (endPrev) endPrev(sc); if (sc.story && sc.key !== 'momento') lastEnd[sc.story] = G.S.clock; };
  const chapter0 = St.chapter;
  St.chapter = function (story, txt, o) {
    const ch = chapter0.apply(this, arguments);
    try {
      o = o || {};
      if (ch && (o.big || o.hot) && story && story.id === St.followed() && !Sn.list.some(x => x.story === story.id) && !(G.S.clock - (lastEnd[story.id] || -99) < 15) && txt && !String(o.k || '').match(/^(cd-|iq-|tt-|vg-|rs-noite|cf-|in-vela|jn-)/)) {
        const p = P(story.protag);
        if (p && free(p) && (ch.x === undefined || G.dist(p.x, p.y, ch.x, ch.y) < 12)) {
          const heading = (St.BEATS[o.k] && St.BEATS[o.k].h) || '';
          Sn.play('momento', { story: story.id, cast: { p: p.id }, at: [p.x, p.y], data: { txt: txt.length > 190 ? txt.slice(0, 188).replace(/\s+\S*$/, '') + '…' : txt, head: heading, tone: story.st === 'fim' && story.end ? story.end.tone : story.tone === 'sombrio' ? 'sombrio' : '' } });
        }
      }
    } catch (e) { console.warn('momento', e); }
    return ch;
  };
  void desc; void TAU;
})(window.G);
