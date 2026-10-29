'use strict';
// ============================================================
//  The road, staged — for every story that takes someone far:
//    A PARTIDA     at the door: the family comes out, the long embrace, the child
//                  who asks for something from the end of the road, the hand that
//                  waves until the road turns.
//    O FOGO        the first night out, a small fire, a thought about home.
//    A CHEGADA     the place itself: the camera pulls back to show it whole, then
//                  comes down to the one who walked all that way to see it.
//    A VOLTA       the town sees them from afar; the children run first.
//  (The road's own facts — where they slept, what they crossed — are still the
//  world's; these scenes only show them.)
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn) return;
  const L = St.lib;
  const TAU = Math.PI * 2;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const REL = { pai: 'pai', mae: 'mãe', filho: 'filho', filha: 'filha', companheiro: 'companheiro', companheira: 'companheira', irmao: 'irmão', irma: 'irmã' };
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : ''; };
  // which stories walk far, and what the end of the road is to them
  const ROAD = { sonho: 1, peregrinacao: 1, volta: 1, resgate: 1, reconquista: 0, caravana: 1, migracao: 1 };
  const placeName = s => (s.place && s.place.name) || (s.type === 'volta' ? setName(s.data.home) || 'casa' : '');
  const capName = n => (n ? n.charAt(0).toUpperCase() + n.slice(1) : n);
  const titleOfPlace = s => { const n = placeName(s).replace(/^(o|a|os|as) /, ''); return capName(n) || 'A Chegada'; };
  function kinAround(v, r, max) {
    const out = [];
    for (const k of St.kin(v)) { if (k.captive || k.sleeping || k.inside || k.age < 4 || k.held || k.aboard || (k.task && k.task.pri >= 2.5)) continue; if (G.dist(k.x, k.y, v.x, v.y) < r) out.push(k); }
    out.sort((a, b) => G.dist(a.x, a.y, v.x, v.y) - G.dist(b.x, b.y, v.x, v.y));
    return out.slice(0, max || 3);
  }

  // ====================================================================================
  //  A PARTIDA
  // ====================================================================================
  Sn.define('jn-partida', { imp: 1, kick: 'A Partida', lazy: false, *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const fam = (c.data.fam || []).map(P).filter(Boolean).filter(k => c.take(k, { keep: true }));
    const goal = placeName(s);
    c.tag('p', 'parte');
    fam.forEach(k => c.tag(k, REL[St.relOf(p, k)] || 'família'));
    c.mood('awe');
    c.title(St.DEF[s.type].name, 'A Partida');
    c.caption(goal ? `${p.name} vai ${s.type === 'volta' ? 'voltar para' : 'até'} ${goal}. A trouxa está pronta.` : `${p.name} vai partir.`);
    c.cam(['p'].concat(fam), { zoom: 'fit' });
    // they come to the door
    fam.forEach((k, i) => c.approach(k, 'p', 1 + i * 0.35, { max: 14 }));
    yield c.until(() => fam.every(k => !P(k.id) || G.dist(k.x, k.y, p.x, p.y) < 2.2), 14);
    const k0 = fam[0];
    if (k0) {
      c.face('p', k0); c.face(k0, 'p'); c.cam(['p', k0], { zoom: 4.3 });
      const rel = St.relOf(p, k0);
      const child = k0.age < 14;
      if (child) {
        yield c.say(k0, pick([`Traz uma coisa de lá pra mim?`, `Você volta, né? Promete?`, `Eu quero ir junto!`]));
        yield c.say('p', pick([`Trago. A mais bonita que eu achar.`, `Prometo. Antes de você crescer mais um palmo.`, `Da próxima vez. Agora cuida da casa por mim.`]));
      } else if (rel === 'companheiro' || rel === 'companheira') {
        yield c.say(k0, pick([`Volte para mim.`, `Eu sabia que esse dia ia chegar.`, `Leve o casaco. As noites lá são frias.`]));
        yield c.say('p', pick([`Antes da colheita. Eu juro.`, `Sempre volto.`, `Espera por mim.`]));
      } else if (rel === 'mae' || rel === 'pai') {
        yield c.say(k0, pick([`Desde pequen${oa(p)} você falava disso.`, `Que os deuses te levem e te tragam.`, `Coma direito. E volte inteir${oa(p)}.`]));
        yield c.say('p', pick([`Eu volto, ${Sn.vocL(p, k0)}.`, `Não chore. É só uma estrada.`, `Eu conto tudo quando voltar.`]));
      } else {
        yield c.say(k0, pick([`Vai mesmo?`, `Cuidado na estrada.`, `Boa viagem.`]));
        yield c.say('p', pick([`Vou.`, `Volto logo.`]));
      }
      c.pose('p', 'embrace'); c.pose(k0, 'embrace'); c.emote(k0, k0.age < 14 ? 'sad' : 'heart', 2.5);
      c.snap('A despedida');
      yield 2.4;
      c.pose('p', ''); c.pose(k0, '');
    } else {
      c.cam(['p'], { zoom: 4 });
      yield c.say('p', pick([`Ninguém pra se despedir. Melhor assim.`, `Até um dia, ${setName(p.set) || 'casa'}.`]), { style: 'think' });
    }
    // and goes; they wave until the road turns
    const dest = s.place && s.place.x !== undefined ? [s.place.x, s.place.y] : null;
    const a = dest ? Math.atan2(dest[1] - p.y, dest[0] - p.x) : G.R() * TAU;
    const out = Sn.spot(p.x + Math.cos(a) * 4.5, p.y + Math.sin(a) * 4.5, 2);
    for (const k of fam) c.pose(k, 'wave');
    c.cam(['p'].concat(fam), { zoom: 'fit', soft: 1 });
    if (out) yield c.walk('p', out, { max: 10 });
    c.face('p', fam[0] || out); c.pose('p', 'wave');
    yield 1.4;
    for (const k of fam) c.release(k);
    return 'ok';
  } });

  // ====================================================================================
  //  O FOGO — the first night out
  // ====================================================================================
  Sn.define('jn-fogo', { imp: 1, kick: 'A Estrada', present: true, *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, keepSt: true, force: true })) return 'ocupada';
    const at = [c.data.cx || p.x + 0.5, c.data.cy || p.y + 0.3];
    c.prop('fire', at[0], at[1], { secs: 90 }); c.sfx('fire');
    c.mood('night'); c.tag('p', 'na estrada');
    c.pose('p', 'sit'); c.face('p', at);
    c.cam(['p', at], { zoom: 4.4, soft: 1 });
    c.caption(`A primeira noite fora de casa. Só o fogo e as estrelas.`);
    yield 2.6;
    const home = St.kin(p).find(k => k.set === p.set && (St.relOf(p, k) === 'companheiro' || St.relOf(p, k) === 'companheira' || k.age < 14));
    const goal = placeName(s);
    yield c.say('p', pick([
      home ? `Será que ${home.name} está dormindo agora?` : `Tão longe de casa...`,
      goal ? `${capName(goal)}... falta pouco. Falta muito.` : `Amanhã, mais estrada.`,
      `As estrelas são as mesmas daqui. Que estranho.`,
    ]), { style: 'think' });
    c.snap('O fogo na estrada');
    yield 2;
    return 'ok';
  } });

  // ====================================================================================
  //  A CHEGADA — the place itself
  // ====================================================================================
  const ARRIVE = {
    mar: { cap: 'O mar. Até onde a vista alcança.', act: 'joy', lines: s => [`É maior do que ${s.data.tellerName || 'ele'} contava.`, `Então é isso. O mar.`, `Escuta só esse barulho...`] },
    monte: { cap: 'Lá do alto, o mundo inteiro, pequeno.', act: 'look', lines: () => [`Dá pra ver tudo daqui.`, `Valeu cada passo.`, `Tão perto do céu...`] },
    pico: { cap: 'A montanha, enorme, de perto.', act: 'look', lines: () => [`Ninguém lá em casa vai acreditar.`, `É mais alta que nos contos.`] },
    caverna: { cap: 'A boca da caverna, escura, respirando.', act: 'look', lines: () => [`Dizem que lá dentro mora a noite.`, `Então ela existe mesmo.`] },
    lago: { cap: 'A água parada, espelhando o céu.', act: 'kneel', lines: () => [`Nunca vi água tão quieta.`, `Bonito. Bonito demais.`] },
    cachoeira: { cap: 'A água caindo, o barulho enchendo tudo.', act: 'joy', lines: () => [`Escuta isso!`, `Parece que o céu está caindo.`] },
    maravilha: { cap: 'A maravilha, maior do que qualquer casa.', act: 'look', lines: () => [`Como gente fez uma coisa dessas?`, `Mãos como as minhas fizeram isso...`] },
    oraculo: { cap: 'O lugar santo. O ar é diferente aqui.', act: 'pray', lines: () => [`Cheguei. Agora me ouçam.`, `Aqui eles escutam. Dizem que escutam.`] },
    cratera: { cap: 'A cratera da estrela que caiu.', act: 'look', lines: () => [`Uma estrela caiu aqui. Uma estrela.`, `A terra ainda está ferida.`] },
  };
  Sn.define('jn-chegada', { imp: 2, kick: 'A Chegada', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, keepSt: true, force: true })) return 'ocupada';
    const pl = s.place && s.place.x !== undefined ? [s.place.x, s.place.y] : [p.x, p.y];
    const A = ARRIVE[s.place && s.place.kind] || (s.type === 'peregrinacao' ? ARRIVE.oraculo : null);
    const crew = (St.party ? St.party.of(s) : []).filter(v => G.S.villagers.has(v.id) && G.dist(v.x, v.y, p.x, p.y) < 6).filter(v => c.take(v, { keep: true, keepSt: true }));
    c.attach();
    c.tag('p', s.type === 'peregrinacao' ? 'peregrin' + oa(p) : 'chegou');
    c.mood('awe');
    // pull back: the place whole
    c.cam([pl, 'p'], { zoom: 1.35, soft: 1 });
    c.title(St.DEF[s.type].name, titleOfPlace(s));
    if (A) c.caption(A.cap);
    c.sfx('reveal', null, 0.7);
    yield 3.6;
    c.snap(capName(placeName(s)) || 'A chegada');
    // down to whoever walked all that way
    c.cam(['p'], { zoom: 3.8, soft: 1 });
    const step = Sn.spot(p.x + (pl[0] - p.x) * 0.25, p.y + (pl[1] - p.y) * 0.25, 1.2);
    if (step && G.dist(step[0], step[1], p.x, p.y) > 0.6) yield c.walk('p', step, { slow: true, max: 6 });
    c.face('p', pl);
    c.pose('p', A ? A.act : 'look'); c.emote('p', 'awe', 3);
    yield 1.4;
    yield c.say('p', pick(A ? A.lines(s) : [`Cheguei.`, `Enfim.`, `Tanto caminho... e aqui estou.`]), { style: 'think' });
    for (const v of crew) { c.face(v, pl); c.pose(v, 'look'); }
    if (crew[0]) yield c.say(crew[0], pick([`Você tinha razão.`, `Valeu a viagem.`, `...`]));
    c.snap(`${p.name}, enfim`);
    yield 2;
    c.pose('p', ''); for (const v of crew) c.pose(v, '');
    return 'ok';
  } });

  // ====================================================================================
  //  A VOLTA — the children run first
  // ====================================================================================
  Sn.define('jn-volta', { imp: 2, kick: 'A Volta', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const fam = (c.data.fam || []).map(P).filter(Boolean).filter(k => c.take(k));
    c.attach();
    c.tag('p', 'voltou'); fam.forEach(k => c.tag(k, REL[St.relOf(p, k)] || 'família'));
    c.mood('awe');
    c.title(St.DEF[s.type].name, 'A Volta');
    c.caption(`${setName(p.set) || 'Casa'}. A gente da cidade reconhece quem vem pela estrada.`);
    c.cam(['p'].concat(fam), { zoom: 'fit' });
    if (fam.length) {
      const kid = fam.find(k => k.age < 14) || fam[0];
      c.say(kid, pick([`${p.name.toUpperCase()}!`, `${Sn.voc(kid, p).toUpperCase()}!`, `Voltou! Voltou!`]), { style: 'shout', wait: 0 });
      fam.forEach((k, i) => c.approach(k, 'p', 0.9 + i * 0.3, { run: true, max: 16 }));
      yield c.until(() => fam.every(k => !P(k.id) || G.dist(k.x, k.y, p.x, p.y) < 2), 16);
      c.face('p', kid); c.pose('p', 'embrace'); c.pose(kid, 'embrace'); fam.forEach(k => c.emote(k, 'heart', 3));
      c.cam(['p', kid], { zoom: 4.3 });
      c.snap('A volta');
      yield 2.2;
      c.pose('p', ''); c.pose(kid, '');
      yield c.say(kid, pick([`Você viu? Viu mesmo?`, `Como é lá? Conta!`, `Trouxe alguma coisa?`]));
      c.pose('p', 'story'); fam.forEach(k => { c.pose(k, k.age < 16 ? 'listen' : ''); c.face(k, 'p'); });
      yield c.say('p', pick([`Vi. Senta aqui que eu conto tudo.`, `Trouxe uma história. A melhor de todas.`, `Era ${s.place && s.place.kind === 'mar' ? 'água até o fim do mundo' : 'maior do que eu sonhava'}.`]));
      yield 2.4;
    } else {
      c.cam(['p'], { zoom: 4 });
      yield c.say('p', pick([`Em casa. Enfim.`, `Nada mudou. Ou tudo mudou.`]), { style: 'think' });
      yield 1.5;
    }
    for (const k of fam) c.release(k);
    return 'ok';
  } });

  // ====================================================================================
  //  the hooks on the road
  // ====================================================================================
  const prevDepart = St.onDepart, prevCamp = St.onCamp, prevArrive = St.onArrive, prevHome = St.onHome;
  St.onDepart = function (s, v, t) {
    if (prevDepart) prevDepart(s, v, t);
    if (!ROAD[s.type] || s.data.jnDep || Sn.running(s.id) || v.sleeping) return;
    s.data.jnDep = 1;
    const set = G.S.settlements.get(v.set); if (set && G.dist(v.x, v.y, set.cx, set.cy) > 16) return;
    const fam = kinAround(v, 12, 2).filter(k => !(St.party && St.party.has(s, k.id)));
    St.scene(s, 'jn-partida', {}, { at: [v.x, v.y], data: { fam: fam.map(k => k.id) } });
  };
  St.onCamp = function (s, v, t) {
    if (prevCamp) prevCamp(s, v, t);
    if (!ROAD[s.type] || s.data.jnFogo || Sn.running(s.id) || St.followed() !== s.id) return;
    s.data.jnFogo = 1;
    St.scene(s, 'jn-fogo', {}, { at: [v.x, v.y], data: { cx: t.cx, cy: t.cy } });
  };
  St.onArrive = function (s, v, t) {
    if (prevArrive) prevArrive(s, v, t);
    if (!ROAD[s.type] || t.leg || Sn.running(s.id) || s.data.jnArr === G.S.day) return;
    // (only where there is something to see: a dream's place, a holy one, a far city)
    if (!(s.place && s.place.x !== undefined) && s.type !== 'caravana' && s.type !== 'volta') return;
    s.data.jnArr = G.S.day;
    St.scene(s, 'jn-chegada', {}, { at: [v.x, v.y] });
  };
  St.onHome = function (s, v, t) {
    if (prevHome) prevHome(s, v, t);
    if (!ROAD[s.type] || s.data.jnHome || Sn.running(s.id)) return;
    s.data.jnHome = 1;
    const fam = kinAround(v, 18, 3);
    St.scene(s, 'jn-volta', {}, { at: [v.x, v.y], data: { fam: fam.map(k => k.id) } });
  };
  void L; void PD;
})(window.G);
