'use strict';
// ============================================================
//  Fortunes, staged: the court and the riches.
//    A CAUSA       the back of the shop, the shutters closed, a candle and the
//                  merchants' coins on the table.
//    A CONSPIRAÇÃO the knives under the cloaks, the ruler calling for the guard,
//                  and — if it goes that way — the crown, and the knees around it.
//    FERA RARA     the eyes of the white beast (or the black one), seen at last;
//                  the hunt, when it is a hunt.
//    PÉROLA NEGRA  the gift ("close your eyes"), the sea that gets it back, the
//                  merchant who bites it to see if it is glass.
//    CEGONHA       the nest on the roof, looked at from the street.
//    PALÁCIO       the ruler before the scaffolding: higher, wider, more.
//  The archetypes still decide what happens; the scenes only show it.
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn) return;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const rulerOf = fid => { const f = G.Fac.get(fid); return f && f.leader ? P(f.leader) : null; };
  const titleOf = (fid, r) => { const f = G.Fac.get(fid); return f && r ? G.Politics.title(f, r).toLowerCase() : 'senhor'; };
  const free = v => v && !v.dead && !v.captive && !v.held && !v.aboard && !v.ug && !(v.task && /^(jail|condemned|combat|band|army|riot|escape|flee)$/.test(v.task.type));
  // the people around who will stand in a scene (taken gently: their errands come back after)
  const around = (c, v, r, n, pred) => [...G.S.villagers.values()].filter(o => o !== v && !o.captive && !o.sleeping && !o.inside && o.age >= 6 && G.dist(o.x, o.y, v.x, v.y) < r && !(o.task && o.task.pri >= 3) && (!pred || pred(o))).sort((a, b) => G.dist(a.x, a.y, v.x, v.y) - G.dist(b.x, b.y, v.x, v.y)).slice(0, n).filter(o => c.take(o, { keep: true }));
  const ring = (c, vs, at, r) => vs.forEach((o, i) => { const a = (i + 0.5) / vs.length * Math.PI * 2; c.walk(o, Sn.spot(at[0] + Math.cos(a) * r, at[1] + Math.sin(a) * r * 0.8, 1) || at, { max: 25 }); });

  // ====================================================================================
  //  A CAUSA — the table at the back of the shop
  // ====================================================================================
  Sn.define('cm-mesa', { imp: 2, kick: 'A Causa dos Mercadores', lazy: true, doing: () => 'Nos fundos da loja, com as janelas fechadas', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const n = s.data.meet || 1;
    const crew = (St.party ? St.party.of(s) : []).filter(v => G.S.villagers.has(v.id) && G.dist(v.x, v.y, p.x, p.y) < 28).filter(v => c.take(v, { keep: true }));
    const at = [p.x + 0.5, p.y + 0.4];
    ring(c, crew, at, 1.3);
    yield c.until(() => crew.every(v => !P(v.id) || G.dist(v.x, v.y, at[0], at[1]) < 2.2), 22);
    c.ready();
    c.mood('night'); c.tag('p', 'quem perdeu'); crew.forEach(v => c.tag(v, 'mercador' + (v.g === 'f' ? 'a' : '')));
    c.prop('candle', at[0], at[1], { secs: 50 }); c.prop('coins', at[0] + 0.3, at[1] + 0.1, { secs: 50 });
    c.title('A Causa dos Mercadores', n === 1 ? 'A Mesa dos Fundos' : n === 2 ? 'O Ouro e as Tochas' : 'A Última Mesa');
    c.caption(crew.length ? `Nos fundos da loja de ${p.name}. ${crew.length + 1} mercadores e uma vela.` : `Nos fundos da loja de ${p.name}, sozinh${oa(p)}, contando o que sobrou.`);
    c.cam([at], { zoom: 4.3 });
    c.pose('p', 'sit'); crew.forEach(v => { c.face(v, 'p'); c.pose(v, 'sittalk'); });
    const r = rulerOf(s.data.fac); const RT = r ? titleOf(s.data.fac, r) : 'trono';
    if (n === 1) {
      yield c.say('p', pick([`Levaram tudo. O cofre, a bandeira, o nome da família.`, `Eles chamam de "tesouro do reino". Eu chamo de roubo.`, `Vinte anos de estrada. E um decreto levou em uma manhã.`]), { style: 'whisper' });
      if (crew[0]) yield c.say(crew[0], pick([`E o que a gente pode fazer? Eles têm a guarda.`, `Eu tenho três filhos e nenhuma moeda.`, `Falar disso já é perigoso.`]), { style: 'whisper' });
      c.pose('p', 'point');
      yield c.say('p', pick([`A guarda come o pão que a gente vende. Sem nós, não há pão.`, `Que ${r && r.g === 'f' ? 'a' : 'o'} ${RT} tente governar com os celeiros vazios.`]), { style: 'whisper' });
    } else {
      c.sfx('coin', null, 0.6);
      yield c.say('p', pick([`Isto é tudo que sobrou. Vai para quem tiver coragem de gritar na praça.`, `Ouro compra tochas. E tochas compram ouvidos.`]), { style: 'whisper' });
      if (crew[1] || crew[0]) yield c.say(crew[1] || crew[0], pick([`E se der errado?`, `Se a guarda souber, é o cadafalso.`]), { style: 'whisper' });
      yield c.say('p', pick([`Se der errado, a gente morre pobre. Já estamos morrendo.`, `Então que não saiba.`]), { style: 'whisper' });
    }
    crew.forEach(v => c.emote(v, G.R() < 0.5 ? 'angry' : 'question', 2));
    c.snap(n === 1 ? 'A mesa' : 'O ouro');
    c.attach();
    yield 2.2;
    return 'ok';
  } });
  const OCM = St.DEF.causa;
  if (OCM) St.define('causa', Object.assign({}, OCM, {
    arrive(s, v, t) {
      const r = OCM.arrive.call(this, s, v, t);
      if (t.sub === 'trama' && (s.data.meet || 0) <= 2 && !Sn.running(s.id) && v.task === t) St.scene(s, 'cm-mesa', {}, { at: [v.x, v.y] });
      return r;
    },
  }));

  // ====================================================================================
  //  A CONSPIRAÇÃO — the knives, and the crown
  // ====================================================================================
  Sn.define('cs-golpe', { imp: 3, kick: 'A Conspiração', *gen(c) {
    const s = c.story(); const p = c.v('p'); const r = c.v('r'); if (!s || !p || !r) return 'sem';
    const RT = titleOf(s.data.fac, r);
    c.tag('p', 'quer o trono'); c.tag('r', RT);
    c.mood('tense'); c.focus('p', 'r');
    c.title('A Conspiração', 'O Golpe');
    c.caption(`${p.name} vai até ${r.name} com a faca debaixo do manto.`);
    c.cam(['p'], { zoom: 4.2 });
    yield c.say('p', pick([`Hoje acaba.`, `Pelo povo. E por mim.`, `Ninguém fica no trono para sempre.`]), { style: 'think' });
    c.cam(['p', 'r'], { zoom: 'fit' });
    yield c.until(() => !P(r.id) || !P(p.id) || G.dist(p.x, p.y, r.x, r.y) < 6, 25);
    if (P(r.id) && P(p.id)) {
      c.slow(0.5, 1.8);
      yield c.say('p', pick([`${RT.toUpperCase()}! Seu tempo acabou!`, `Morte ${r.g === 'f' ? 'à' : 'ao'} ${RT}!`]), { style: 'shout' });
      if (P(r.id)) yield c.say('r', pick([`GUARDAS! GUARDAS!`, `Traição! Peguem ${p.g === 'f' ? 'essa mulher' : 'esse homem'}!`]), { style: 'shout' });
    }
    c.snap('As facas');
    let beat = c.sc.t;
    while (c.sc.t < 60 && P(r.id) && P(p.id) && !p.captive) {
      yield 0.5;
      c.cam([p, r], { zoom: G.dist(p.x, p.y, r.x, r.y) < 5 ? 4.4 : 'fit', soft: 1 });
      if (c.sc.t - beat > 4) { beat = c.sc.t; if (G.R() < 0.5) c.say('p', pick([`Segurem os guardas!`, `Agora! AGORA!`, `Não deixem fugir!`]), { style: 'shout', wait: 0 }); else if (P(r.id)) c.say('r', pick([`A mim! A mim!`, `Vocês vão pagar com a cabeça!`]), { style: 'shout', wait: 0 }); }
    }
    if (!P(r.id)) { c.slow(0.4, 2.2); c.cam(['p'], { zoom: 4.6 }); c.mood('dread'); c.snap(`${r.name} cai`); yield 2.4; return 'caiu'; }
    if (!P(p.id)) { c.mood('sad'); c.snap(`${p.name} cai`); yield 2; return 'morreu'; }
    return 'ok';
  } });
  Sn.define('cs-coroa', { imp: 3, kick: 'A Conspiração', lazy: true, *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const f = G.Fac.get(s.data.fac);
    const crowd = around(c, p, 18, 7, o => G.Fac.idOfV(o) === s.data.fac);
    ring(c, crowd, [p.x, p.y], 2.2);
    yield c.until(() => crowd.every(o => !P(o.id) || G.dist(o.x, o.y, p.x, p.y) < 3.2), 14);
    c.ready();
    c.mood('awe'); c.tag('p', f && G.Politics ? G.Politics.title(f, p).toLowerCase() : 'no trono');
    c.title('A Conspiração', 'A Coroa');
    c.caption(`Lavaram o sangue do chão antes da coroação.`);
    c.cam(['p'].concat(crowd.slice(0, 4)), { zoom: 3.8 });
    crowd.forEach(o => c.face(o, 'p'));
    yield 1.6;
    c.pose('p', 'brandish'); c.sfx('sting', null, 0.6);
    yield c.say('p', pick([`De joelhos.`, `${f ? f.name : 'Este reino'} tem um novo senhor. Olhem bem para mim.`, `Quem estava do outro lado... ainda pode escolher o lado certo.`]), { style: 'shout' });
    crowd.forEach((o, i) => { if (i % 3 === 2) { c.emote(o, 'fear', 2.5); } else c.pose(o, 'kneel'); });
    c.murmur(crowd, ['Viva!', 'Salve!', '...', 'Viva o novo senhor!'], { p: 0.6 });
    c.slow(0.6, 2);
    c.snap('A coroa');
    yield 3;
    c.cam(['p'], { zoom: 4.8 }); c.pose('p', '');
    yield c.say('p', pick([`Agora vem a parte difícil.`, `Ninguém mais vai mandar em nós. A não ser eu.`, `Quanto tempo até alguém afiar uma faca para mim?`]), { style: 'think' });
    return 'ok';
  } });
  const OCS = St.DEF.conspiracao;
  if (OCS) St.define('conspiracao', Object.assign({}, OCS, {
    tick(s) {
      if (!s.data.golpeScene && !Sn.running(s.id)) {
        s.data.golpeScene = 1; const f = G.Fac.get(s.data.fac); const r = f && rulerOf(f.id);
        if (f && f.coup && r && P(s.protag)) St.scene(s, 'cs-golpe', { r: r.id }, { at: [r.x, r.y] });
      }
      return OCS.tick.call(this, s);
    },
    react(s, f) {
      if (f.k === 'coroa' && f.a === s.protag && s.st === 'ativa') {
        const p = P(s.protag);
        const end = () => { if (s.st === 'ativa') OCS.react.call(St.DEF.conspiracao, s, f); };
        if (p && St.scene(s, 'cs-coroa', {}, { at: [p.x, p.y], onEnd: end })) return true;
        if (Sn.running(s.id)) { s.data.pend = f; return true; }
      }
      return OCS.react.call(this, s, f);
    },
  }));
  // (a pending crown is delivered as soon as the coup's scene is over)
  const csTick = St.DEF.conspiracao && St.DEF.conspiracao.tick;
  if (csTick) St.DEF.conspiracao.tick = function (s) { if (s.data.pend && !Sn.running(s.id)) { const f = s.data.pend; s.data.pend = null; St.DEF.conspiracao.react(s, f); return; } return csTick.call(this, s); };

  // ====================================================================================
  //  FERA RARA — the eyes, at last
  // ====================================================================================
  Sn.define('fr-visao', { imp: 2, kick: 'Fera Rara', *gen(c) {
    const s = c.story(); const p = c.v('p'); const a = G.S.animals.get(s && s.cast.beast); if (!s || !p || !a) return 'sem';
    if (!c.take('p', { vital: true, force: true, calm: true })) return 'ocupada';
    const nm = s.data.bname ? (s.data.art ? s.data.art + ' ' : '') + s.data.bname : 'a fera';
    c.tag('p', 'veio ver'); c.mood('awe');
    c.title('Fera Rara', 'Os Olhos');
    c.cam(['p', a], { zoom: 'fit' });
    c.pose('p', 'hide'); c.face('p', a);
    yield 1.6;
    c.caption(s.data.morph === 'albino' ? `Branc${s.data.art === 'a' ? 'a' : 'o'} como a neve, de olhos cor-de-rosa. ${cap1(nm)}.` : s.data.morph ? `Negr${s.data.art === 'a' ? 'a' : 'o'} como a noite sem lua. ${cap1(nm)}.` : `${cap1(nm)}.`, { hold: 3 });
    c.cam([a], { zoom: 4.6, soft: 1 }); c.slow(0.5, 3);
    yield 3.2;
    c.snap(cap1(nm));
    c.cam(['p'], { zoom: 4.6 }); c.pose('p', 'kneel');
    yield c.say('p', pick([`Então é verdade.`, `Nunca vi nada tão bonito.`, `Os velhos diziam... e eu não acreditava.`]), { style: 'whisper' });
    c.cam(['p', a], { zoom: 4 });
    yield c.say('p', pick([`Vai. Ninguém vai te caçar enquanto eu viver.`, `Obrigad${oa(p)} por me deixar ver.`, `Vai em paz.`]), { style: 'whisper' });
    c.emote('p', 'star', 3);
    yield 2;
    return 'ok';
  } });
  Sn.define('fr-caca', { imp: 3, kick: 'Fera Rara', *gen(c) {
    const s = c.story(); const p = c.v('p'); const a = G.S.animals.get(s && s.cast.beast); if (!s || !p || !a) return 'sem';
    const nm = s.data.bname ? (s.data.art ? s.data.art + ' ' : '') + s.data.bname : 'a fera';
    c.tag('p', 'caça'); c.mood('tense'); c.focus('p', a);
    c.title('Fera Rara', s.data.apex ? 'Frente à Fera' : 'A Caçada');
    c.cam(['p', a], { zoom: 'fit' }); c.slow(0.5, 1.8);
    yield c.say('p', pick([`Essa pele vale uma vida inteira.`, `Calma... calma...`, `É agora.`]), { style: 'think' });
    let beat = c.sc.t;
    while (c.sc.t < 30 && !a.dead && P(p.id)) {
      yield 0.4;
      c.cam([p, a], { zoom: G.dist(p.x, p.y, a.x, a.y) < 4 ? 4.6 : 'fit', soft: 1 });
      if (c.sc.t - beat > 4) { beat = c.sc.t; c.say('p', pick([`Não corre...`, `Agora!`, `Pega!`]), { style: 'shout', wait: 0 }); }
    }
    if (a.dead && P(p.id)) { c.mood('triumph'); c.cam(['p'], { zoom: 4.4 }); c.snap(`${cap1(nm)} abatid${s.data.art === 'a' ? 'a' : 'o'}`); yield c.say('p', pick([`Consegui... consegui!`, `Vão contar essa história por cem anos.`]), { style: 'shout' }); }
    else if (P(p.id)) c.caption(`${cap1(nm)} some entre as árvores.`, { hold: 2.6 });
    yield 1.6;
    return 'ok';
  } });
  const OFR = St.DEF['fera-rara'];
  if (OFR) St.define('fera-rara', Object.assign({}, OFR, {
    arrive(s, v, t) {
      const a = G.S.animals.get(s.cast.beast);
      if (a && !a.dead && !Sn.running(s.id)) {
        if (s.data.motive === 'sagrado' && G.dist(v.x, v.y, a.x, a.y) < 9) {
          if (St.scene(s, 'fr-visao', {}, { at: [v.x, v.y], onEnd: () => { if (s.st === 'ativa') OFR.arrive.call(St.DEF['fera-rara'], s, P(s.protag) || v, t); } })) return;
        }
        const r = OFR.arrive.call(this, s, v, t);
        if (s.data.motive !== 'sagrado' && v.task && (v.task.type === 'fight' || v.task.type === 'hunt') && !s.data.cacaScene) { s.data.cacaScene = 1; St.scene(s, 'fr-caca', {}, { at: [v.x, v.y] }); }
        return r;
      }
      return OFR.arrive.call(this, s, v, t);
    },
  }));

  // ====================================================================================
  //  PÉROLA NEGRA — the gift, the sea, the market
  // ====================================================================================
  Sn.define('pe-presente', { imp: 2, kick: 'A Pérola Negra', *gen(c) {
    const s = c.story(); const p = c.v('p'); const t = c.v('t'); if (!s || !p || !t) return 'sem';
    if (!c.take('p', { vital: true, force: true }) || !c.take('t', { keep: true })) return 'ocupada';
    c.tag('p', 'guarda um segredo'); c.tag('t', 'não sabe de nada');
    c.mood('awe');
    yield c.approach('p', 't', 1.1, { max: 20 });
    c.face('p', 't'); c.face('t', 'p');
    c.title('A Pérola Negra', 'O Presente');
    c.cam(['p', 't'], { zoom: 4.6 });
    yield c.say('p', pick([`Fecha os olhos.`, `Estende a mão. Não, a outra.`, `Eu trouxe uma coisa do fundo do mar.`]));
    yield c.say('t', pick([`O que foi agora?`, `Você está me assustando.`, `...Está bem.`]));
    c.pose('p', 'reach'); c.sfx('reveal', null, 0.5);
    c.caption(`Uma pérola negra, do tamanho de um olho, na palma da mão.`, { hold: 2.6 });
    c.slow(0.6, 2.4);
    yield 2.4;
    c.snap('A pérola');
    yield c.say('t', pick([`...É pra mim?`, `Isso vale mais que a nossa casa.`, `Eu não sei o que dizer.`]), { style: 'whisper' });
    c.pose('p', 'embrace'); c.pose('t', 'embrace'); c.emote('p', 'heart', 3); c.emote('t', 'heart', 3);
    c.cam(['p', 't'], { zoom: 5, soft: 1 });
    yield 3;
    return 'ok';
  } });
  Sn.define('pe-mar', { imp: 2, kick: 'A Pérola Negra', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const sea = [s.data.rx || p.x + 2, s.data.ry || p.y + 2];
    c.tag('p', 'devolve'); c.mood('awe');
    c.title('A Pérola Negra', 'O Que é do Mar');
    c.face('p', sea); c.cam(['p', sea], { zoom: 4.2 });
    c.pose('p', 'kneel');
    c.caption(c.data.temple ? `No templo, diante do altar, ${p.name} abre o pano.` : `Na beira da água, ${p.name} abre o pano pela última vez.`);
    yield 2.4;
    yield c.say('p', pick([`O mar deu. O mar recebe de volta.`, `Não é minha. Nunca foi.`, `Desculpa ter tirado você de lá.`]), { style: 'whisper' });
    if (!c.data.temple) { c.pose('p', ''); c.shoot('p', sea, { z0: 9, z1: 0, dur: 1.1, k: 'pearl' }); yield 1.1; c.sfx('splash', sea, 0.7); c.caption(`Um ponto escuro afunda e some.`, { hold: 2.4 }); }
    else { c.pose('p', 'pray'); c.prop('candle', p.x + 0.4, p.y - 0.4, { secs: 40 }); }
    c.snap('A oferenda');
    c.cam(['p'], { zoom: 4.6, soft: 1 }); c.pose('p', 'pray');
    yield 3;
    return 'ok';
  } });
  Sn.define('pe-venda', { imp: 1, kick: 'A Pérola Negra', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const m = around(c, p, 9, 1, o => o.age >= 25 && /^(mercador|feirante|ourives|joalheiro)$/.test(o.role || ''))[0] || around(c, p, 12, 1, o => o.age >= 25)[0];
    c.tag('p', 'vende a pérola'); if (m) c.tag(m, 'quem compra');
    c.title('A Pérola Negra', 'O Preço');
    if (m) { yield c.approach(m, 'p', 1.1, { max: 10 }); c.face('p', m); c.face(m, 'p'); }
    c.cam(m ? ['p', m] : ['p'], { zoom: 4.4 });
    c.pose('p', 'reach');
    if (m) {
      yield c.say(m, pick([`Hm. Pode ser vidro.`, `Já vi falsas mais bonitas.`, `De onde veio isso?`]));
      yield c.say('p', pick([`Morde. Vidro não range no dente.`, `Do recife. Eu mesm${oa(p)} mergulhei.`, `Se não quer, tem quem queira.`]));
      c.pose(m, 'look'); yield 1.6;
      yield c.say(m, pick([`...Vamos conversar.`, `Está bem. Está bem. Quanto?`, `Pelos deuses. É de verdade.`]), { style: 'whisper' });
    }
    else { c.pose('p', 'shout'); yield c.say('p', pick([`Quem dá mais por isto? Uma pérola negra, do fundo do recife!`, `Olhem! Nunca viram uma destas!`]), { style: 'shout' }); yield 1.4; }
    c.sfx('coin', null, 0.7); c.prop('coins', p.x + 0.3, p.y + 0.2, { secs: 20 }); c.emote('p', 'happy', 2.4);
    c.snap('O preço');
    yield 2;
    return 'ok';
  } });
  const OPN = St.DEF.perola;
  if (OPN) St.define('perola', Object.assign({}, OPN, {
    arrive(s, v, t) {
      if (!Sn.running(s.id) && !t.scened) {
        t.scened = 1;
        const after = () => { if (s.st === 'ativa') OPN.arrive.call(St.DEF.perola, s, P(s.protag) || v, t); };
        const plan = s.data.plan;
        const k = plan === 'amor' ? 'pe-presente' : plan === 'mar' ? 'pe-mar' : 'pe-venda';
        const cast = plan === 'amor' ? { t: s.cast.target } : {};
        if ((plan !== 'amor' || P(s.cast.target)) && St.scene(s, k, cast, { at: [v.x, v.y], data: { temple: plan === 'mar' && !!s.data.temple }, onEnd: after })) return;
      }
      return OPN.arrive.call(this, s, v, t);
    },
  }));

  // ====================================================================================
  //  CEGONHA — the nest, from the street
  // ====================================================================================
  Sn.define('nh-ninho', { imp: 1, kick: 'A Cegonha', *gen(c) {
    const s = c.story(); const p = c.v('p'); const n = c.data.nest; if (!s || !p || !n) return 'sem';
    if (!c.take('p', { vital: true, keep: true, keepSt: true })) return 'ocupada';
    const kid = p.age < 14; const T = P(s.cast.target);
    c.tag('p', kid ? 'olha o ninho' : 'espera');
    c.mood('awe');
    c.title(s.data.mode === 'filho' ? `Uma Cegonha no Telhado` : `O Ninho`, n.st === 'chicks' ? 'Os Filhotes' : n.st === 'eggs' ? 'Os Ovos' : 'O Ninho');
    c.face('p', [n.x, n.y]); c.pose('p', 'look');
    c.cam(['p', [n.x, n.y - 1]], { zoom: 4.4, lift: 1 });
    yield 2;
    if (n.st === 'chicks') yield c.say('p', kid ? pick([`Olha! Eles abriram o bico!`, `Um, dois... três! Três filhotes!`, `A mãe voltou com comida!`]) : pick([`Os filhotes nasceram.`, `Ouve? Estão pedindo comida.`]), { style: kid ? 'shout' : 'say' });
    else if (s.data.mode === 'filho') yield c.say('p', pick([`Dizem que cegonha no telhado é filho a caminho.`, `Será que é verdade, o que dizem?`, `Fica. Por favor, fica.`]), { style: 'whisper' });
    else yield c.say('p', pick([`Ainda estão chocando.`, `Quando vão nascer?`, `Ela não sai de cima dos ovos nem para comer.`]), { style: 'think' });
    if (T && s.data.mode === 'filho' && G.dist(T.x, T.y, p.x, p.y) < 10 && c.take(T, { keep: true, keepSt: true })) { yield c.approach(T, 'p', 1.2, { max: 8 }); c.face(T, [n.x, n.y]); c.pose(T, 'look'); yield c.say(T, pick([`Vem pra dentro. Está esfriando.`, `Se for menina, o nome é da sua mãe.`, `Eu também olho, quando você não está vendo.`]), { style: 'whisper' }); }
    c.emote('p', 'heart', 2.4);
    c.snap(n.st === 'chicks' ? 'Os filhotes' : 'O ninho');
    yield 2;
    return 'ok';
  } });
  const ONH = St.DEF.ninho;
  if (ONH) St.define('ninho', Object.assign({}, ONH, {
    arrive(s, v, t) {
      if (t.sub === 'ninho' && !Sn.running(s.id)) {
        const n = G.Nests && G.Nests.get ? G.Nests.get(s.data.nest) : null;
        const key = n ? n.st : '';
        if (n && s.data.nhSeen !== key) { s.data.nhSeen = key; St.scene(s, 'nh-ninho', {}, { at: [v.x, v.y], data: { nest: n } }); return; }
      }
      if (ONH.arrive) return ONH.arrive.call(this, s, v, t);
    },
  }));

  // ====================================================================================
  //  PALÁCIO — before the scaffolding
  // ====================================================================================
  Sn.define('pc-obras', { imp: 1, kick: 'O Palácio', *gen(c) {
    const s = c.story(); const p = c.v('p'); const b = G.S.buildings.get(s && s.data.b); if (!s || !p || !b) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const mid = [b.x + b.w / 2, b.y + b.h / 2];
    const w = around(c, p, 14, 1, o => o.age >= 16 && o.task && (o.task.type === 'build' || o.task.type === 'haul'))[0] || around(c, p, 10, 1, o => o.age >= 16)[0];
    c.tag('p', 'quer um palácio'); if (w) c.tag(w, 'mestre de obras');
    c.title('O Palácio', (s.data.visits || 1) <= 1 ? 'As Primeiras Pedras' : 'Mais Alto');
    c.cam([mid], { zoom: 3.2, lift: 1.5 });
    yield 2.2;
    c.cam(['p', mid], { zoom: 3.8 });
    c.face('p', mid); c.pose('p', 'point');
    if (w) { yield c.approach(w, 'p', 1.3, { max: 10 }); c.face(w, 'p'); }
    yield c.say('p', pick([`Mais alto. Quero que vejam do outro lado do rio.`, `Quantas pedras ainda faltam?`, `Quando os embaixadores chegarem, isto tem que estar pronto.`, `Uma torre aqui. E outra ali.`]));
    if (w) yield c.say(w, pick([`Faltam muitas, ${titleOf(G.Fac.idOfV(p), p)}. E faltam braços.`, `Os homens estão cansados. E com fome.`, `Vai ficar pronto. Vai ficar pronto.`]), { style: 'whisper' });
    c.pose('p', ''); c.emote('p', s.data.visits > 1 ? 'angry' : 'happy', 2);
    c.snap('As obras');
    yield 1.6;
    return 'ok';
  } });
  const OPC = St.DEF.palacio;
  if (OPC) St.define('palacio', Object.assign({}, OPC, {
    arrive(s, v, t) {
      const r = OPC.arrive.call(this, s, v, t);
      if (t.sub === 'obras' && (s.data.visits || 0) <= 2 && !Sn.running(s.id) && v.task === t) St.scene(s, 'pc-obras', {}, { at: [v.x, v.y] });
      return r;
    },
  }));
})(window.G);
