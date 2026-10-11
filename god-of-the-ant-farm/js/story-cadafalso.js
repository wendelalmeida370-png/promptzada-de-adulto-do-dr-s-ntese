'use strict';
// ============================================================
//  O CADAFALSO, staged.
//  Someone you love will die at noon. The story is the same as ever —
//  the world decides if the rope is cut in time — but now every step of
//  it is played out where it happens:
//    O PREGÃO      a neighbour comes running with the news; the basket falls.
//    PELA GRADE    the night before, a whisper through the bars of the cell,
//                  with the guard's torch coming and going.
//    O PLANO       the few who will come, round a lantern: fire in the barn,
//                  an arrow for the rope, a crowd to raise, or only a knife.
//    O MEIO-DIA    the square full, the drums, the eyes that meet across the
//                  crowd, the signal — and what the world does with it: the
//                  barn burning while she climbs, the arrow in the air as the
//                  trapdoor drops, the crowd that rises, the guards that run.
//    A FUGA        the two of them running through the alleys, the guards
//                  behind, the friends who stand in their way.
//    NA MATA       a small fire in the woods at night: what is said after.
//    O LUTO        or, if it went wrong: she cuts the body down at night.
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn || !St.DEF.cadafalso) return;
  const L = St.lib;
  const { pe, setName, desc, deathTxt, cap1, REL_W } = L;
  const W = G.W;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const J = () => G.Justice;
  const exOf = s => (J() ? J().list().find(q => q.id === s.data.ex) || null : null);
  const party = s => (St.party ? St.party.of(s).filter(v => G.S.villagers.has(v.id)) : []);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const lo = v => (v && v.g === 'f' ? 'la' : 'lo');
  const ele = v => (v && v.g === 'f' ? 'ela' : 'ele');
  const pick = (arr, k) => arr[Math.floor((k === undefined ? G.R() : G.hash(k)) * arr.length) % arr.length];
  const names = vs => { const n = vs.map(v => v.name); return n.length <= 1 ? n[0] || '' : n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1]; };
  const inIds = (f, id) => !!(f.ids && f.ids.includes(id));
  const byScaffold = f => f.cause === 'execution' || f.cause === 'sacrifice';
  const OLD = St.DEF.cadafalso;
  const townOf = s => { const set = G.S.settlements.get(s.data.set); return set ? set.name : s.data.town || ''; };
  const hourWord = () => { const t = G.S.time; return t < 0.2 ? 'de madrugada' : t < 0.38 ? 'de manhã' : t < 0.47 ? 'quase meio-dia' : t < 0.6 ? 'à tarde' : t < 0.73 ? 'no fim da tarde' : 'de noite'; };
  // 'enforcá-lo', 'queimá-la'...
  const VERB = { forca: 'enforcá-', machado: 'decapitá-', espada: 'decapitá-', fogueira: 'queimá-', cruz: 'crucificá-', pedras: 'apedrejá-', guilhotina: 'guilhotiná-', sacrificio: 'oferecê-' };
  const verbTo = (m, v) => (VERB[m] || 'matá-') + lo(v) + (m === 'sacrificio' ? ' aos deuses' : '');
  const DONE = { forca: ['enforcado', 'enforcada'], machado: ['decapitado', 'decapitada'], espada: ['decapitado', 'decapitada'], fogueira: ['queimado vivo', 'queimada viva'], cruz: ['crucificado', 'crucificada'], pedras: ['apedrejado', 'apedrejada'], guilhotina: ['guilhotinado', 'guilhotinada'], sacrificio: ['sacrificado', 'sacrificada'] };
  const doneTo = (m, v) => (DONE[m] || ['executado', 'executada'])[v && v.g === 'f' ? 1 : 0];
  const REL_POSS = { pai: 'seu pai', mae: 'sua mãe', filho: 'seu filho', filha: 'sua filha', companheiro: 'seu companheiro', companheira: 'sua companheira', irmao: 'seu irmão', irma: 'sua irmã' };
  const REL_OF = { pai: 'pai', mae: 'mãe', filho: 'filho', filha: 'filha', companheiro: 'companheiro', companheira: 'companheira', irmao: 'irmão', irma: 'irmã' };
  const rulerWord = fid => { const f = G.Fac.get(fid); const r = f && f.leader && P(f.leader); if (!f || !r) return 'Quem governa'; return (r.g === 'f' ? 'A ' : 'O ') + G.Politics.title(f, r).toLowerCase(); };
  function ctx(s) {
    const old = St.DEF.cadafalso; void old;
    const c = PD(s.cast.captive); const set = G.S.settlements.get(s.data.set); const e = exOf(s);
    const now = e ? (e.start - G.S.clock) / DAY() : 0;
    const crew = party(s);
    const all = [(PD(s.protag) || {}).name].concat(crew.map(v => v.name)).filter(Boolean);
    return {
      TOWN: set ? set.name : s.data.town || '', WHY: (s.data.reason || 'por seus crimes').replace('pertencerem', 'pertencer').replace('tentarem', 'tentar').replace('conspirarem', 'conspirar'),
      ALL: all.length <= 1 ? all[0] || '' : all.slice(0, -1).join(', ') + ' e ' + all[all.length - 1], COMMA: all.join(', '),
      DO: doneTo(s.data.method, c), DONE: doneTo(s.data.method, c), DO2: doneTo(s.data.method2 || s.data.method, PD(s.protag)), DONE2: doneTo(s.data.method2 || s.data.method, PD(s.protag)),
      WILL: 'será', WILL2: 'será', WHEN: now > 0.55 ? 'amanhã, ao meio-dia' : 'ao meio-dia', PARTY: names(crew), PN: crew.length, PARTY_DEAD: s.data.deadParty || '',
      SHOUT: 'Soltem!', oC: oa(c), ROPE: s.data.method === 'forca',
    };
  }

  // ====================================================================================
  //  the words
  // ====================================================================================
  // what the one running with the news says
  function newsLine(s, p, cap) {
    const rel = St.relOf(p, cap); const poss = REL_POSS[rel] || cap.name; const RU = rulerWord(s.data.fac);
    const when = ctx(s).WHEN;
    return pick([
      `Levaram ${poss}! ${RU} mandou ${verbTo(s.data.method, cap)} ${when}!`,
      `${p.name}... é ${poss}. Vão ${verbTo(s.data.method, cap)} na praça, ${when}.`,
      `O arauto acabou de passar! ${cap.name} — ${when}, no cadafalso!`,
    ]);
  }
  function thinkLine(p, cap) { const v = Sn.voc(p, cap); return pick([`Não... não pode ser.`, `${v}... não.`, `Não, não, não...`]); }
  function resolveLine(p, cap, s) {
    const v = Sn.voc(p, cap); const t = Sn.temper(p);
    const L1 = {
      bravo: [`Ninguém vai encostar n${cap.g === 'f' ? 'ela' : 'ele'}.`, `Então eu tenho até o meio-dia.`, `Eles vão ter que passar por mim.`],
      medroso: [`O que eu faço... o que eu faço?`, `Eu não sei lutar... mas eu vou.`],
      frio: [`Ao meio-dia, então.`, `Quem deu essa ordem vai se arrepender.`],
      devoto: [`Deuses, me deem coragem.`, `${Sn.oath(p).replace('!', ',')} me ajudem.`],
      firme: [`Eu vou tirar ${ele(cap)} de lá.`, `Aguenta, ${Sn.vocL(p, cap)}. Eu vou.`],
    };
    void s; return pick(L1[t] || L1.firme);
  }
  function warnLine(m, p) { return pick([`Não faz besteira, ${p.name}... os guardas estão por toda parte.`, `Se você for lá, morre junt${oa(p)}!`, `Eu sinto muito. De verdade.`, `Pensa bem, ${p.name}. Pensa bem.`]); }
  // the condemned, through the bars
  function cellCounsel(cap, p, s) {
    const t = Sn.temper(cap); const v = Sn.voc(cap, p);
    const other = St.kin(p).find(k => k.id !== cap.id && (St.relOf(p, k) === 'mae' || St.relOf(p, k) === 'pai'));
    const out = [];
    if (other && t !== 'bravo') out.push(`Não. Cuide d${other.g === 'f' ? 'a sua mãe' : 'o seu pai'}. Prometa, ${Sn.vocL(cap, p)}.`);
    if (t === 'bravo' || t === 'frio') out.push(`Se vier, venha com gente. Sozinh${oa(p)}, você morre comigo.`);
    out.push(`Leve isto. Era da sua avó. Se eu não... guarde.`);
    if (t === 'medroso') out.push(`Eu estou com medo, ${Sn.vocL(cap, p)}. Muito medo.`);
    if (t === 'devoto') out.push(`Reze por mim. É o que se pode fazer agora.`);
    return pick(out);
  }

  // ====================================================================================
  //  the plan: what the ones who come can do
  // ====================================================================================
  function choosePlan(s, p, crew, e) {
    const archer = crew.find(v => v.role === 'cacador' || v.role === 'arqueiro') || (p.role === 'cacador' || p.role === 'arqueiro' ? p : null);
    const hot = crew.find(v => pe(v).agg > 0.55 && v.courage > 0.45);
    const set = G.S.settlements.get(s.data.set);
    const barn = e ? barnNear(e) : null;
    if (archer && archer !== p) return { k: 'flecha', who: archer.id };
    if ((hot || crew.length >= 2) && barn) return { k: 'fogo', who: (hot || crew[0]).id, b: barn.id };
    if (set && set.loyalty < 46) return { k: 'multidao' };
    return { k: crew.length ? 'investida' : 'sozinha' };
  }
  // a building near the square that would burn well (and is not the temple or the palace)
  const BURN = { celeiro: 3, storehouse: 2.5, house: 1.2, hut: 1.5, workshop: 1.5, sobrado: 1, estabulo: 3, cercado: 0.6 };
  function barnNear(e) {
    let best = null, bs = 0;
    for (const b of G.S.buildings.values()) {
      if (!b.built || !BURN[b.type]) continue;
      const c = G.Village.center(b); const d = G.dist(c[0], c[1], e.x, e.y);
      if (d < 4 || d > 14) continue;
      const sc = BURN[b.type] / (1 + Math.abs(d - 8) * 0.2); if (sc > bs) { bs = sc; best = b; }
    }
    return best;
  }
  const PLAN_TXT = {
    flecha: (s, c) => `O plano: quando o alçapão abrir, ${c.ARCHER} corta a corda com uma flecha.`,
    fogo: (s, c) => `O plano: fogo ${c.BARN}, gritaria, os guardas correndo — e alguém sobe no cadafalso.`,
    multidao: () => 'O plano: levantar a praça. Metade da cidade odeia quem governa; só falta alguém que grite primeiro.',
    investida: () => 'O plano: quando o carrasco subir, subir atrás. Não há outro.',
    sozinha: (s, c) => `Não há plano. Há uma faca, e ${c.P}.`,
  };

  // ====================================================================================
  //  O PREGÃO — the news, and the basket that falls
  // ====================================================================================
  Sn.define('cd-pregao', { imp: 2, kick: 'O Cadafalso', present: true, *gen(c) {
    const s = c.story(); const p = c.v('p'); const cap = PD(s && s.cast.captive);
    if (!s || !p || !cap) return 'sem';
    if (!c.take('p', { vital: true })) return 'ocupada';
    const relPC = St.relOf(p, cap);
    c.tag('p', `${REL_OF[St.relOf(cap, p)] || 'família'} de ${cap.name}`);
    c.mood('tense');
    c.chapter(St.say(s, 'cd-sentenca', ctx(s)) || `${p.name} soube da sentença.`, { k: 'cd-sentenca' });
    yield c.title('O Cadafalso', 'O Pregão');
    c.caption(`${townOf(s)}, ${hourWord()}.`);
    // what they were doing a moment ago
    const was = p.act && !/sleep|swim/.test(p.act) ? p.act : 'gather';
    c.pose('p', was);
    c.cam(['p'], { zoom: 3.2 });
    yield 1.6;
    let m = c.v('m');
    if (m && c.take('m')) {
      c.tag('m', m.g === 'f' ? 'a vizinha' : 'o vizinho');
      c.cam(['m', 'p'], { zoom: 2.8 });
      yield c.say('m', p.name.toUpperCase() + '!', { style: 'shout' });
      yield c.approach('m', 'p', 1.1, { run: true, max: 7 });
      c.face('m', 'p'); c.face('p', 'm'); c.pose('p', '');
      yield c.say('m', newsLine(s, p, cap));
    } else {
      m = null;
      c.face('p', [s.data.x || p.x, s.data.y || p.y]);
      yield c.caption(`O arauto passa gritando: ${cap.name} ${ctx(s).WILL} ${ctx(s).DO} ${ctx(s).WHEN}, ${ctx(s).WHY}.`, { hold: 4 });
    }
    // the basket falls
    c.prop('basket', p.x + 0.3, p.y + 0.2, { secs: 40 });
    c.sfx('thud'); c.sfx('gasp');
    c.pose('p', 'weepk'); c.emote('p', 'sad', 3.5);
    c.cam(['p'], { zoom: 4.2 });
    c.snap(`${p.name} ouve a notícia`);
    yield 1.2;
    yield c.say('p', thinkLine(p, cap), { style: 'think' });
    yield 1.4;
    c.pose('p', '');
    c.mood('dread');
    yield c.say('p', resolveLine(p, cap, s));
    if (m) yield c.say('m', warnLine(m, p));
    void relPC;
    // and goes — towards the square, where they are already raising the scaffold
    const e = exOf(s);
    const to = e ? Sn.spot(p.x + (e.x - p.x) * 0.25, p.y + (e.y - p.y) * 0.25, 2.5) : c.beside('p', 4);
    if (to) yield c.walk('p', to, { max: 6 });
    return 'ok';
  } });

  // ====================================================================================
  //  PELA GRADE — the night before, at the cell
  // ====================================================================================
  Sn.define('cd-cela', { imp: 2, kick: 'O Cadafalso', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Indo às escondidas até a cela' : null), *gen(c) {
    const s = c.story(); const p = c.v('p'); const cap = c.v('cap');
    if (!s || !p || !cap) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    c.tag('p', `${REL_OF[St.relOf(cap, p)] || 'família'} de ${cap.name}`); c.tag('cap', 'pres' + oa(cap));
    // the guard with the torch
    let g = c.v('g'); let post = null, far = null;
    if (g && c.take('g', { keep: true })) {
      g.holdTorch = true; c.tag('g', 'o guarda');
      post = Sn.spot(cap.x + 1.2, cap.y + 0.8, 2) || [cap.x + 1.2, cap.y + 0.8];
      far = Sn.spot(cap.x + 5, cap.y - 2.5, 3) || [cap.x + 4, cap.y];
      c.walk('g', post, { max: 20 });
    } else g = null;
    // her way in: from the dark side, away from the guard (the walk there is not shown; the sneaking is)
    const away = g ? Math.atan2(cap.y - (post ? post[1] : g.y), cap.x - (post ? post[0] : g.x)) : G.R() * TAU;
    const hide = Sn.spot(cap.x + Math.cos(away) * 3.4, cap.y + Math.sin(away) * 3.4, 2.5) || c.beside('cap', 3.5);
    const edge = Sn.spot(cap.x + Math.cos(away) * 7.5, cap.y + Math.sin(away) * 7.5, 3) || hide;
    yield c.walk('p', edge, { max: 90 });
    if (!(G.S.time > 0.7 || G.S.time < 0.24)) { c.chapter(`${p.name} rondou a noite inteira o lugar onde ${cap.name} estava pres${oa(cap)}. O dia clareou antes que conseguisse chegar perto.`); return 'dia'; }
    c.ready();
    c.mood('night');
    c.chapter(`Na noite antes do cadafalso, ${p.name} foi às escondidas até onde ${cap.name} estava pres${oa(cap)}.`, { k: 'cd-cela' });
    c.title('O Cadafalso', 'Pela Grade');
    c.caption(`A noite antes. ${cap.name} espera, amarrad${oa(cap)}, sem dormir.`);
    c.cam(['p', 'cap'], { zoom: 'fit' });
    yield c.walk('p', hide, { sneak: true, max: 14 });
    c.pose('p', 'hide');
    c.cam(['p', 'cap'].concat(g ? ['g'] : []), { zoom: 'fit' });
    if (g) { yield c.say('g', pick(['Frio dos diabos...', 'Mais uma noite inteira nisso.', 'Amanhã acaba.']), { style: 'think' }); c.walk('g', far, { slow: true }); }
    yield c.wait(1.6);
    c.sfx('heartbeat');
    yield c.approach('p', 'cap', 0.8, { sneak: true, max: 20 });
    c.pose('p', 'hide'); c.face('p', 'cap'); c.face('cap', 'p');
    c.cam(['p', 'cap'], { zoom: 4.4 });
    c.snap('Pela grade');
    yield c.say('p', `${Sn.voc(p, cap)}... sou eu.`, { style: 'whisper' });
    yield c.say('cap', `${p.name}? Você não devia estar aqui!`, { style: 'whisper' });
    yield c.say('p', pick([`Eu vou te tirar daí. Amanhã.`, `Não vão fazer isso com você. Eu não deixo.`, `Aguenta até o meio-dia. Só isso.`]), { style: 'whisper' });
    const counsel = cellCounsel(cap, p, s);
    yield c.say('cap', counsel, { style: 'whisper' });
    if (/Leve isto/.test(counsel)) { c.pose('p', 'catch'); s.data.token = 1; c.sfx('click'); yield 1; c.pose('p', 'hide'); yield c.say('p', `Eu devolvo amanhã. Na sua mão.`, { style: 'whisper' }); }
    else if (/venha com gente/.test(counsel)) { s.data.wantCrew = 1; yield c.say('p', `Eu não vou sozinh${oa(p)}.`, { style: 'whisper' }); }
    else yield c.say('p', pick([`Eu prometo.`, `...Eu prometo.`]), { style: 'whisper' });
    // the guard comes back
    if (g) {
      c.walk('g', post, { slow: true });
      c.cam(['g', 'p'], { zoom: 3.4 });
      yield 2.2;
      const risk = 0.18 + (1 - p.courage) * 0.25 + (s.data.wantCrew ? 0 : 0.05);
      if (G.R() < risk) {
        c.sfx('twig'); c.face('g', 'p'); c.emote('g', 'question', 2);
        c.slow(0.45, 1.4);
        yield c.say('g', 'Quem está aí?!', { style: 'shout' });
        const out = Sn.spot(p.x + (p.x - g.x) * 2.5, p.y + (p.y - g.y) * 2.5, 3) || c.beside('p', 7);
        c.walk('p', out, { run: true, max: 10 });
        yield c.approach('g', 'p', 1, { run: true, max: 3.5 });
        yield c.say('g', pick(['Eu vi você! Volte aqui!', 'Alarme! Tem alguém aqui!']), { style: 'shout' });
        s.data.alarm = 1;
        c.chapter(`O guarda viu uma sombra correndo no escuro. Amanhã haverá mais lanças em volta do cadafalso.`);
        return 'visto';
      }
      c.pose('p', 'cower');
      yield c.say('p', '...', { style: 'think' });
      yield 1.4;
    }
    c.cam(['p'], { zoom: 3.2 });
    yield c.walk('p', hide, { sneak: true, max: 10 });
    const back = c.beside('p', 6, away);
    if (back) yield c.walk('p', back, { sneak: true, max: 8 });
    return 'ok';
  } });

  // ====================================================================================
  //  O PLANO — round a lantern, the ones who will come
  // ====================================================================================
  Sn.define('cd-plano', { imp: 2, kick: 'O Cadafalso', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Voltando para casa, para planejar' : 'Indo à casa de quem vai salvar o condenado'), *gen(c) {
    const s = c.story(); const p = c.v('p'); const cap = PD(s && s.cast.captive); const e = exOf(s);
    if (!s || !p || !cap) return 'sem';
    if (!c.take('p', { vital: true, force: true })) return 'ocupada';
    const crew = party(s).filter(v => G.dist(v.x, v.y, p.x, p.y) < 40 && c.take(v));
    c.tag('p', `${REL_OF[St.relOf(cap, p)] || 'família'} de ${cap.name}`);
    for (const v of crew) c.tag(v, St.relOf(p, v) ? REL_OF[St.relOf(p, v)] || 'amigo' : v.role === 'cacador' ? 'caçador' + (v.g === 'f' ? 'a' : '') : v.g === 'f' ? 'amiga' : 'amigo');
    const plan = choosePlan(s, p, crew, e); s.data.plan = plan;
    c.mood('night');
    const home = G.S.buildings.get(p.home); const fr = home && home.built ? G.Village.frontTile(home) : [p.x, p.y];
    const at = Sn.spot(fr[0] + 0.6, fr[1] + 0.9, 2.5) || [p.x, p.y];
    const pl = PLAN_TXT[plan.k](s, { ARCHER: (P(plan.who) || {}).name || 'alguém', BARN: plan.b ? 'no ' + (G.Village.buildName(G.S.buildings.get(plan.b)) || 'celeiro').toLowerCase() : 'num celeiro', P: p.name });
    yield c.walk('p', at, { max: 70 });
    c.ready();
    c.chapter(crew.length ? `Na véspera, ${names([p].concat(crew))} se reuniram em volta de uma lanterna. ${pl}` : `Na véspera, ninguém veio. ${p.name} afiou uma faca à luz de uma lanterna. ${pl}`, { k: 'cd-plano' });
    yield c.title('O Cadafalso', crew.length ? 'Os Que Vêm' : 'Sozinh' + oa(p));
    p.lantern = true; c.prop('candle', at[0] + 0.5, at[1] + 0.35, { secs: 50 });
    if (!crew.length) {
      c.pose('p', 'sit'); c.cam(['p'], { zoom: 4.2 });
      c.caption(`Ninguém quis vir. ${p.name} afia a faca até o fio cortar um fio de cabelo.`);
      yield 2.4; c.pose('p', 'cut'); c.sfx('swish'); yield 1.6;
      c.snap('A faca');
      yield c.say('p', pick([`Então vou eu.`, `Ninguém vem. Tudo bem.`, `Aguenta, ${Sn.vocL(p, cap)}.`]), { style: 'think' });
      p.lantern = false;
      return 'sozinha';
    }
    // they come, one by one, and sit
    crew.forEach((v, i) => { const a = (i + 1) / (crew.length + 1) * Math.PI * 1.4 + 0.3; c.walk(v, Sn.spot(at[0] + Math.cos(a) * 1.3, at[1] + Math.sin(a) * 1.0, 1.5) || at, { max: 30 }); });
    c.pose('p', 'sit'); c.cam([at], { zoom: 3.6 });
    yield c.until(() => crew.every(v => !c.has(v) || G.dist(v.x, v.y, at[0], at[1]) < 2.2), 30);
    for (const v of crew) { c.face(v, at); c.pose(v, 'sittalk'); }
    c.face('p', crew[0]);
    c.snap('Em volta da lanterna');
    yield c.say('p', pick([`Amanhã, ao meio-dia, vão ${verbTo(s.data.method, cap)}.`, `Vocês sabem por que estão aqui.`, `Eu não vou pedir duas vezes.`]));
    const a = crew[0];
    yield c.say(a, pick([`Diz o que fazer.`, `A gente sabe. Qual é o plano?`, `Por ${cap.name}, qualquer coisa.`]));
    const W1 = P(plan.who);
    if (plan.k === 'flecha' && W1) {
      c.cam([W1], { zoom: 4 });
      yield c.say(W1, pick([`Eu acerto um coelho a cem passos. Uma corda não foge.`, `Me dá um telhado e um arco. Só isso.`, `Quando ${s.data.method === 'forca' ? 'o alçapão abrir' : 'o carrasco erguer o braço'}, eu atiro.`]));
      const other = crew.find(v => v !== W1);
      if (other) yield c.say(other, `E se errar?`);
      yield c.say(W1, pick([`Não erro.`, `Então reza.`]));
    } else if (plan.k === 'fogo' && W1) {
      const bn = (G.Village.buildName(G.S.buildings.get(plan.b)) || 'celeiro').toLowerCase();
      c.cam([W1], { zoom: 4 });
      yield c.say(W1, pick([`O ${bn} fica de frente pra praça. Feno seco, madeira velha.`, `Eu ponho fogo no ${bn}. O resto é com você.`]));
      yield c.say('p', `Fogo, gritaria, os guardas correm... e eu subo.`);
    } else if (plan.k === 'multidao') {
      yield c.say('p', `Metade dessa cidade odeia quem governa. Só falta alguém gritar primeiro.`);
      yield c.say(a, pick([`E esse alguém é você.`, `Se a praça não vier junto, a gente morre.`]));
    } else {
      yield c.say('p', `Quando o carrasco subir, a gente sobe atrás.`);
      yield c.say(a, pick([`Isso não é um plano.`, `Isso é loucura.`]));
      yield c.say('p', `É o que tem.`);
    }
    // the oath, hands together
    c.cam([at], { zoom: 3.8 });
    c.pose('p', 'swear'); for (const v of crew) c.pose(v, 'swear');
    c.sfx('sting', null, 0.6);
    yield c.say('p', `Por ${cap.name}.`);
    for (const v of crew) c.say(v, `Por ${cap.name}.`, { wait: 0 });
    c.snap('O juramento');
    yield 2.2;
    p.lantern = false;
    for (const v of crew) c.pose(v, '');
    return plan.k;
  } });

  // ====================================================================================
  //  O MEIO-DIA — the square
  // ====================================================================================
  // where a companion takes their place for the plan
  function postFor(plan, v, e, i) {
    if (plan.k === 'flecha' && plan.who === v.id) return Sn.spot(e.x - 4.5, e.y + 4.2, 3, { notNear: [e.x, e.y], notR: 3.5 });
    if (plan.k === 'fogo' && plan.who === v.id) { const b = G.S.buildings.get(plan.b); if (b) { const f = G.Village.frontTile(b); return Sn.spot(f[0], f[1] + 0.4, 2); } }
    return Sn.spot(e.x + 1.2 + i * 0.7, e.y + 2.6 - i * 0.4, 2.5);
  }
  Sn.define('cd-praca', { imp: 3, kick: 'O Cadafalso', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Correndo para a praça, para o cadafalso' : null), *gen(c) {
    const s = c.story(); const p = c.v('p'); const cap = c.v('cap'); const e0 = exOf(s);
    if (!s || !p || !cap || !e0) return 'sem';
    if (!c.take('p', { vital: true, calm: true, force: true })) return 'ocupada';
    const eid = e0.id; const E = () => (J() ? J().list().find(q => q.id === eid) || null : null);
    const f = G.Fac.get(s.data.fac); const set = G.S.settlements.get(s.data.set);
    const relCP = REL_OF[St.relOf(cap, p)] || 'família';
    c.tag('p', `${relCP} de ${cap.name}`); c.tag('cap', 'condenad' + oa(cap));
    const ex = P(e0.exe); if (ex) c.tag(ex, 'o carrasco');
    let crew = party(s).filter(v => G.dist(v.x, v.y, e0.x, e0.y) < 45 && !(v.task && (v.task.type === 'condemned' || v.task.type === 'jail')));
    const plan = s.data.plan || choosePlan(s, p, crew, e0); s.data.plan = plan;
    crew = crew.filter(v => c.take(v, { calm: true, force: true }));
    for (const v of crew) c.tag(v, v.id === plan.who ? (plan.k === 'flecha' ? 'o arco' : plan.k === 'fogo' ? 'a tocha' : 'junto') : 'junto');
    // into the crowd, near the steps (the run to the square is not shown; the square is)
    const mark = Sn.spot(e0.x + 1.7, e0.y + 2.3, 2.5) || [e0.x + 1.5, e0.y + 2];
    c.walk('p', mark, { max: 90 });
    crew.forEach((v, i) => { const at = postFor(plan, v, e0, i); if (at) c.walk(v, at, { max: 90 }); });
    yield c.until(() => { const e = E(); return !e || G.dist(p.x, p.y, e0.x, e0.y) < 9 || e.phase === 'read' || e.phase === 'kill' || e.phase === 'after'; }, 90);
    c.ready();
    c.mood('tense');
    c.chapter(`Meio-dia em ${townOf(s)}. ${p.name}${crew.length ? ', com ' + names(crew) + ',' : ''} foi para a praça.`, { k: 'cd-praca' });
    c.title('O Cadafalso', 'O Meio-Dia');
    c.caption(`Meio-dia em ${townOf(s)}. A praça está cheia.`);
    c.cam([[e0.x, e0.y], 'p'], { zoom: 'fit' }); c.sfx('drum');
    yield 3.5;
    c.cam(['p'], { zoom: 3 });
    // (wait for the reading: if they get there late, the world has not waited)
    yield c.until(() => { const e = E(); return !e || e.phase === 'read' || e.phase === 'kill' || e.phase === 'after'; }, 80);
    let e = E();
    if (e && e.phase === 'read' && G.dist(p.x, p.y, mark[0], mark[1]) > 2.5) { e.hold = G.S.clock + 30; yield c.until(() => G.dist(p.x, p.y, mark[0], mark[1]) < 2.5 || !E(), 28); e = E(); }
    const capAlive = () => !!P(cap.id) && !!(P(cap.id).task && P(cap.id).task.type === 'condemned');
    if (!e || !capAlive()) {
      // freed by someone else, or it was over before
      if (P(cap.id) && !capAlive()) return yield* reunion(c, s, p, cap, crew, e0, 'outro');
      return yield* tooLate(c, s, p, cap, e0);
    }
    const late = e.phase === 'kill' && (e.done || []).length > 0;
    if (late && !capAlive()) return yield* tooLate(c, s, p, cap, e0);
    // hold the moment: the sentence is read again, over the drums
    e.hold = G.S.clock + 24;
    const near = G.dist(p.x, p.y, e.x, e.y) < 6;
    c.cam([cap], { zoom: 4 }); c.focus(cap);
    yield 1.3;
    if (near) {
      c.face('cap', 'p'); c.cam([cap, p], { zoom: 'fit' });
      yield c.say('cap', `${Sn.voc(cap, p)}... não.`, { style: 'whisper' });
      c.snap('O olhar');
      c.cam(['p'], { zoom: 4.4 });
      yield c.say('p', pick([`Hoje não, ${Sn.vocL(p, cap)}.`, `Aguenta mais um pouco.`, `Olha pra mim. Só pra mim.`]), { style: 'think' });
    }
    c.sfx('drumroll'); c.cam([[e.x, e.y]], { zoom: 3.1, soft: 1 });
    yield 2.4;
    // THE SIGNAL
    e = E(); if (!e || !capAlive()) return yield* reunion(c, s, p, cap, crew, e0, 'outro');
    let freed = false, caught = false;
    const H = (v, z) => c.lift(v, z);
    const kind = J().METHOD[e.method] ? J().METHOD[e.method].kind : '';
    const zTop = kind === 'gallows' || kind === 'block' || kind === 'guillotine' ? 5 : 0;
    const steps = e.pyr ? [e.fx, e.fy] : [e.x + 1.05, e.y + 0.05];
    const climb = function* (who) { yield c.walk(who, Sn.spot(steps[0] + 0.5, steps[1], 1.2) || steps, { run: true, max: 14 }); if (zTop) { H(who, zTop); yield c.walk(who, [e.x + 0.45, e.y + 0.1], { max: 4 }); } };
    c.cam(['p'], { zoom: 4 });
    c.slow(0.4, 2.2);
    yield c.say('p', plan.k === 'multidao' ? `${(f && P(f.leader)) ? 'ASSASSINOS!' : 'AGORA!'}` : 'AGORA!', { style: 'shout' });
    const W1 = P(plan.who);
    if (plan.k === 'flecha' && W1 && c.has(W1)) {
      // the arrow: let the hangman pull — and cut the rope as the floor opens
      c.pose(W1, 'draw'); c.face(W1, cap);
      c.cam([W1, cap], { zoom: 'fit' });
      e.hold = 0;
      yield c.until(() => { const q = E(); return !q || q.sub >= 2 || !capAlive(); }, 16);
      e = E();
      if (e && capAlive()) {
        c.cam([cap], { zoom: 3.8 }); c.slow(0.22, 3.2); c.mood('tense');
        c.sfx('arrow');
        const hit = G.R() < (W1.role === 'cacador' || W1.role === 'arqueiro' ? 0.82 : 0.6);
        yield c.shoot(W1, cap, { z0: 9, z1: e.method === 'forca' ? 22 : 12, dy: e.method === 'forca' ? -0.05 : 0, dx: hit ? 0 : 0.6, dur: 0.75 });
        e = E();
        if (hit && e && capAlive()) {
          if (e.method === 'forca') { const sc = J().scaffoldOf(e); if (sc) sc.ropeCut = true; c.sfx('ropecut'); }
          else { const xv = P(e.exe); if (xv) { G.Vg.damage(xv, 70, 'arrow', false, W1.id); c.sfx('hit'); } }
          J().free(e, 'resgate'); freed = true;
          c.snap('A flecha');
        } else { c.sfx('thud'); c.say(W1, pick(['Não!', 'Errei!']), { style: 'shout', wait: 0 }); }
      }
    } else if (plan.k === 'fogo' && W1 && c.has(W1)) {
      const b = G.S.buildings.get(plan.b);
      if (b) {
        W1.holdTorch = true; c.pose(W1, 'torchfwd'); c.cam([W1], { zoom: 3.6 });
        yield 0.8;
        c.ignite(b.x + 0.5, b.y + 0.5, 1); c.ignite(b.x + b.w - 0.5, b.y + b.h - 0.5, 0.9);
        c.sfx('fire'); c.sfx('whoosh');
        yield 0.8;
        // the crowd turns, the guards run to the fire
        const ws = []; for (const o of G.S.villagers.values()) if (o.task && o.task.j === e.id && o.task.role === 'watch' && ws.length < 14) ws.push(o);
        c.murmur(ws, ['FOGO!', 'Fogo no celeiro!', 'Água! Tragam água!', 'Corram!'], { p: 0.6, style: 'shout' });
        c.cam([[b.x, b.y], [e.x, e.y]], { zoom: 'fit' });
        c.snap('O fogo');
        const fc = G.Village.center(b);
        for (const o of G.S.villagers.values()) if (o.task && o.task.j === e.id && o.task.role === 'guard' && c.take(o, { force: true })) c.walk(o, Sn.spot(fc[0], fc[1] + 1.5, 2.5) || fc, { run: true, max: 20 });
        W1.holdTorch = false; c.pose(W1, '');
        yield 1.2;
        e = E();
      }
      if (e && capAlive()) {
        yield* climb('p');
        const xv = P(e.exe);
        if (xv && G.dist(xv.x, xv.y, p.x, p.y) < 3 && c.take(xv, { force: true })) { c.face('p', xv); c.pose('p', 'shove'); c.sfx('hit'); xv.stagT = G.S.clock + 0.6; yield 0.5; c.pose(xv, 'lie'); c.lift(xv, 0); }
        c.cam(['p', cap], { zoom: 4.2 }); c.face('p', cap); c.pose('p', 'cut'); c.sfx('ropecut');
        c.slow(0.35, 1.6);
        yield 1.4;
        e = E(); if (e && capAlive()) { J().free(e, 'resgate'); freed = true; }
        c.snap('As cordas cortadas');
      }
    } else if (plan.k === 'multidao' && f && set && G.Riots) {
      c.lift('p', 2.5); c.pose('p', 'shout');
      yield c.say('p', pick([`Vocês vão deixar isso acontecer?!`, `Hoje é ${cap.name}! Amanhã é você!`, `Quantos mais?! QUANTOS MAIS?!`]), { style: 'shout' });
      const R = G.Riots.start(f, set, 'execucao', { free: e.id, lead: p.id, at: [e.x, e.y + 1.4], boost: 0.34 + crew.length * 0.07, whyTxt: 'para salvar ' + cap.name + ' do cadafalso' });
      c.lift('p', 0);
      if (R) {
        s.data.riot = R.id; e.hold = G.S.clock + 30;
        c.cam([[e.x, e.y + 1]], { zoom: 2.2 }); c.mood('tense');
        c.snap('A praça se levanta');
        yield c.until(() => !capAlive() || !E(), 30);
        freed = !!P(cap.id) && !capAlive();
      } else {
        c.say('p', '...', { style: 'think', wait: 0 });
        yield 1;
      }
    }
    // no plan worked yet: the charge (alone or with the few)
    e = E();
    if (!freed && e && capAlive()) {
      c.mood('tense');
      for (const v of crew) c.walk(v, Sn.spot(steps[0] + 0.6, steps[1] + 0.6, 1.5) || steps, { run: true, max: 10 });
      yield* climb('p');
      const xv = P(e.exe);
      let guards = 0; for (const o of G.S.villagers.values()) if (o.task && o.task.j === e.id && o.task.role === 'guard') guards++;
      if (xv && c.take(xv, { force: true })) {
        c.face('p', xv); c.face(xv, 'p'); c.pose('p', 'struggle'); c.pose(xv, 'struggle'); c.sfx('hit');
        c.cam(['p', xv], { zoom: 4.4 }); c.slow(0.5, 2);
        yield 2.2;
      }
      const odds = 0.24 + crew.length * 0.13 + p.courage * 0.2 + (pe(p).agg - 0.5) * 0.2 - guards * 0.12 - (s.data.alarm ? 0.1 : 0) + (s.data.token ? 0.03 : 0);
      e = E();
      if (e && capAlive() && G.R() < odds) {
        if (xv && c.has(xv)) { c.pose(xv, 'lie'); c.lift(xv, 0); c.sfx('thud'); }
        c.face('p', cap); c.pose('p', 'cut'); c.sfx('ropecut'); yield 1.2;
        e = E(); if (e && capAlive()) { J().free(e, 'resgate'); freed = true; }
        c.snap('As cordas cortadas');
      } else if (e && capAlive()) {
        // the guards were faster
        caught = true;
        c.say('p', pick(['Não! Me larguem!', 'SOLTEM ' + (cap.g === 'f' ? 'ELA' : 'ELE') + '!']), { style: 'shout', wait: 0 });
        c.pose('p', 'bound');
        yield 1.6;
      }
    }
    if (freed) return yield* reunion(c, s, p, cap, crew, e0, 'nos');
    if (caught) {
      const taken2 = [p].concat(crew.filter(() => G.R() < 0.7));
      for (const v of taken2) c.release(v);
      if (f && J()) J().sentence(f, taken2.filter(v => G.S.villagers.has(v.id)), `por tentar${taken2.length > 1 ? 'em' : ''} libertar ${cap.name} do cadafalso`, { set: s.data.set, quiet: true });
      s.data.caught = taken2.map(v => v.id); s.phase = 'preso';
      St.beat(s, 'cd-preso', Object.assign(ctx(s), { PARTY: names(taken2.slice(1)), PN: taken2.length - 1 }), { x: p.x, y: p.y, log: true, big: 1 });
      return 'preso';
    }
    // nothing could be done: the world goes on, and they watch
    const e2 = E(); if (e2) e2.hold = 0;
    c.cam([cap], { zoom: 3.4 });
    yield c.until(() => !capAlive(), 30);
    if (P(cap.id)) return yield* reunion(c, s, p, cap, crew, e0, 'outro');
    return yield* tooLate(c, s, p, cap, e0);
  } });
  // it was over (or ends now) — the scream across the square
  function* tooLate(c, s, p, cap, e0) {
    c.mood('sad');
    c.cam(['p'], { zoom: 4.2 });
    c.slow(0.3, 2.6);
    c.say('p', `${Sn.voc(p, cap).toUpperCase()}! NÃO!`, { style: 'shout', wait: 0 });
    yield c.walk('p', Sn.spot(e0.x + 1.4, e0.y + 1.2, 1.5) || [e0.x + 1, e0.y + 1], { run: true, max: 6 });
    c.pose('p', 'weepk'); c.sfx('sob');
    c.snap('Tarde demais');
    yield 3;
    s.data.late = 1;
    return 'tarde';
  }
  // the rope is cut: the two of them, and the run
  function* reunion(c, s, p, cap, crew, e0, how) {
    const cv = P(cap.id); if (!cv) return 'sem';
    s.data.freedBy = how;
    c.take(cv, { force: true, calm: true }); c.lift(cv, 0);
    c.mood('tense');
    c.cam(['p', cv], { zoom: 3.6 });
    if (G.dist(p.x, p.y, cv.x, cv.y) > 1.4) yield c.approach('p', cv, 1, { run: true, max: 8 });
    c.lift('p', 0);
    c.face('p', cv); c.face(cv, 'p');
    c.pose('p', 'embrace'); c.pose(cv, 'embrace');
    yield c.say(cv, `${Sn.voc(cv, p)}!`, { style: 'shout' });
    yield c.say('p', pick(['Vem! Corre!', 'Agora não! Corre!', 'Depois! CORRE!']), { style: 'shout' });
    // the way out: away from the square, towards the woods
    let best = null, bd = 0;
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; const q = Sn.spot(e0.x + Math.cos(a) * 13, e0.y + Math.sin(a) * 13, 3); if (!q) continue; let trees = 0; for (const t of G.S.trees.values()) if (Math.abs(t.x - q[0]) < 3 && Math.abs(t.y - q[1]) < 3) trees++; let gd = 99; for (const o of G.S.villagers.values()) if (o.role === 'guerreiro' && o.set === s.data.set) gd = Math.min(gd, G.dist(o.x, o.y, q[0], q[1])); const sc = trees + Math.min(10, gd) * 0.5; if (sc > bd) { bd = sc; best = q; } }
    const out = best || c.beside('p', 12);
    c.walk('p', out, { run: true, max: 30 }); c.walk(cv, out, { run: true, max: 30 });
    // the guards come after them; the friends stand in their way
    const guards = [];
    for (const o of G.S.villagers.values()) {
      if (guards.length >= 3) break;
      if (o.role !== 'guerreiro' || o.captive || G.dist(o.x, o.y, e0.x, e0.y) > 12 || o === p || o === cv || crew.includes(o)) continue;
      if (c.take(o, { force: true })) { guards.push(o); c.tag(o, 'guarda'); }
    }
    if (guards.length) { c.say(guards[0], pick(['Peguem os dois!', 'Fugiram! Atrás deles!', 'Não deixem escapar!']), { style: 'shout', wait: 0 }); c.sfx('horn', null, 0.6); }
    for (const g of guards) c.approach(g, 'p', 0.8, { run: true, max: 30 });
    crew.forEach((v, i) => { const g = guards[i % Math.max(1, guards.length)]; if (g) c.approach(v, g, 0.9, { run: true, max: 20 }); else c.walk(v, out, { run: true, max: 30 }); });
    c.cam(['p', cv], { zoom: 2.8 });
    c.snap('A fuga');
    let held = new Set(), lostOne = null;
    const t0 = c.sc.t;
    while (c.sc.t - t0 < 26) {
      yield 0.4;
      const pp = P(p.id), cc = P(cv.id); if (!pp) break;
      // a friend reaches a guard: they wrestle
      for (const v of crew) { if (!P(v.id)) continue; for (const g of guards) { if (held.has(g.id) || !P(g.id)) continue; if (G.dist(v.x, v.y, g.x, g.y) < 1) { held.add(g.id); c.pose(v, 'struggle'); c.pose(g, 'struggle'); c.face(v, g); c.face(g, v); c.sfx('hit'); if (!lostOne && G.R() < 0.4) lostOne = v; break; } } }
      // a free guard catches up
      for (const g of guards) {
        if (held.has(g.id) || !P(g.id)) continue;
        if (cc && G.dist(g.x, g.y, cc.x, cc.y) < 0.9 || G.dist(g.x, g.y, pp.x, pp.y) < 0.9) {
          if (G.R() < 0.3) { c.say(g, 'Peguei!', { style: 'shout', wait: 0 }); c.release('p'); c.release(cv); s.data.recaught = 1; const fct = G.Fac.get(s.data.fac); if (fct && J()) J().sentence(fct, [pp].concat(cc ? [cc] : []).filter(v => G.S.villagers.has(v.id)), `por fugirem do cadafalso`.replace('fugirem', cc ? 'fugirem' : 'fugir'), { set: s.data.set, quiet: true }); return 'recapturados'; }
          held.add(g.id); c.pose(g, 'lie'); c.sfx('thud'); c.say('p', pick(['Sai!', 'Me larga!']), { style: 'shout', wait: 0 });
        }
      }
      if (G.dist(pp.x, pp.y, out[0], out[1]) < 1.2 && (!cc || G.dist(cc.x, cc.y, out[0], out[1]) < 1.6)) break;
    }
    if (lostOne && P(lostOne.id)) { s.data.stayed = lostOne.id; c.chapter(`${lostOne.name} ficou para trás, segurando os guardas para que os dois fugissem.`); }
    c.mood('triumph');
    c.cam(['p', cv], { zoom: 3.4 });
    c.pose('p', ''); c.pose(cv, '');
    c.face('p', cv);
    yield c.say(cv, pick([`Você... você veio.`, `Eu disse pra não vir.`, `Eu achei que ia morrer.`]));
    yield c.say('p', pick([`Eu prometi.`, `Você faria o mesmo.`, `Ainda não acabou. Vamos.`]));
    c.snap('Livres');
    s.data.free = 1;
    return 'livre';
  }

  // ====================================================================================
  //  NA MATA — a small fire, that night
  // ====================================================================================
  Sn.define('cd-mata', { imp: 2, kick: 'O Cadafalso', lazy: true, doing: () => 'Fugindo para o mato', *gen(c) {
    const s = c.story(); const p = c.v('p'); const cv = c.v('cap'); if (!s || !p || !cv) return 'sem';
    if (!c.take('p', { vital: true }) || !c.take('cap', { vital: true, force: true })) return 'ocupada';
    c.tag('p', REL_OF[St.relOf(cv, p)] || 'família'); c.tag('cap', REL_OF[St.relOf(p, cv)] || 'família');
    const home = G.S.settlements.get(s.data.set);
    let at = null; for (let k = 0; k < 10 && !at; k++) { const a = G.hash(s.id * 13 + k) * TAU; const q = Sn.spot((home ? home.cx : p.x) + Math.cos(a) * 15, (home ? home.cy : p.y) + Math.sin(a) * 15, 3); if (q) at = q; }
    at = at || c.beside('p', 6);
    c.walk('p', Sn.spot(at[0] - 0.7, at[1], 1) || at, { max: 80 }); yield c.walk('cap', Sn.spot(at[0] + 0.7, at[1] + 0.2, 1) || at, { max: 80 });
    yield c.until(() => G.dist(p.x, p.y, at[0], at[1]) < 1.6, 20);
    c.ready();
    c.mood('night');
    c.chapter(`Naquela noite, longe de ${townOf(s)}, ${p.name} e ${cv.name} acenderam um fogo pequeno no mato.`, { k: 'cd-mata' });
    c.title('O Cadafalso', 'Na Mata');
    c.prop('fire', at[0], at[1] + 0.1, { secs: 120 }); c.sfx('fire');
    c.pose('p', 'sit'); c.pose('cap', 'sit'); c.face('p', at); c.face('cap', at);
    c.cam([at], { zoom: 4.2, soft: 1 });
    c.caption(`O fogo estala. Ao longe, ${townOf(s)} ainda procura os dois.`);
    yield 2.4;
    c.snap('O fogo na mata');
    const t = Sn.temper(cv);
    yield c.say('cap', t === 'frio' ? `Você devia ter me deixado lá.` : t === 'medroso' ? `Eu ainda sinto a corda.` : `Você devia ter me deixado lá.`);
    c.face('p', 'cap');
    yield c.say('p', `Nunca.`);
    yield c.say('cap', pick([`Eles vão caçar a gente agora.`, `Não dá mais pra voltar pra ${townOf(s)}.`]));
    yield c.say('p', pick([`Então que cacem.`, `A gente acha outro lugar.`, `Eu sei.`]));
    yield 1;
    yield c.say('cap', pick([`Você tem a teimosia da sua mãe.`, `Quando foi que você cresceu assim?`, `Obrigad${oa(cv)}.`]));
    c.emote('p', 'happy', 2); c.emote('cap', 'heart', 2.5);
    c.pose('p', 'embrace'); c.pose('cap', 'embrace'); c.face('cap', 'p');
    c.mood('awe');
    c.snap('Depois');
    yield 3.4;
    return 'ok';
  } });

  // ====================================================================================
  //  O LUTO — the night after, at the gallows
  // ====================================================================================
  Sn.define('cd-luto', { imp: 2, kick: 'O Cadafalso', lazy: true, doing: () => 'Voltando à praça, de noite', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true })) return 'ocupada';
    const capName = (PD(s.cast.captive) || {}).name || 'quem morreu';
    c.mood('sad');
    const body = G.Carnage && G.Carnage.byVid(s.cast.captive);
    const at = body ? [body.x, body.y] : [s.data.x || p.x, s.data.y || p.y];
    const near = Sn.spot(at[0] + 4, at[1] + 3, 2) || at;
    yield c.walk('p', near, { max: 80 });
    c.ready();
    c.chapter(`Na noite seguinte, ${p.name} voltou à praça vazia de ${townOf(s)}.`, { k: 'cd-luto' });
    c.title('O Cadafalso', 'O Luto');
    c.caption(`A praça vazia. Só o vento e os corvos.`);
    c.cam([at, 'p'], { zoom: 3.2 });
    yield c.walk('p', Sn.spot(at[0] + 0.9, at[1] + 0.5, 1.5) || at, { sneak: true, max: 20 });
    c.face('p', at);
    if (body && body.pose === 'hang') {
      c.lift('p', 5); c.pose('p', 'reach'); yield 1.4; c.pose('p', 'cut'); c.sfx('ropecut'); yield 1.4;
      body.pose = null; body.sc = 0; c.sfx('thud'); c.lift('p', 0);
      c.snap('A corda');
    } else { c.pose('p', 'kneel'); yield 1.6; }
    c.pose('p', 'weepk'); c.sfx('sob'); c.cam(['p'], { zoom: 4.3 });
    yield 2.2;
    yield c.say('p', pick([`${capName}...`, `Me perdoa. Eu não cheguei a tempo.`, `Eu estava lá. Eu estava lá e não fiz nada.`]), { style: 'whisper' });
    yield 2;
    c.pose('p', ''); c.mood('dread');
    const r = G.Fac.get(s.data.fac); const ru = r && r.leader && P(r.leader);
    yield c.say('p', ru ? `${ru.name}... isso não vai ficar assim.` : `Isso não vai ficar assim.`, { style: 'think' });
    c.snap('O juramento');
    s.data.vow = ru ? ru.id : 0;
    yield 1.5;
    return 'ok';
  } });

  // ====================================================================================
  //  the story, with its scenes
  // ====================================================================================
  // a neighbour who can run with the news
  function messenger(p, cap) {
    let best = null, bd = 1e9;
    for (const o of G.S.villagers.values()) {
      if (o === p || o.id === cap.id || o.set !== p.set || o.age < 14 || o.captive || o.sleeping || o.inside || o.held || o.aboard || (o.task && o.task.pri >= 2)) continue;
      const d = G.dist(o.x, o.y, p.x, p.y); if (d < 2.5 || d > 9) continue;
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  const free = v => v && !v.dead && !v.captive && !v.held && !v.aboard && !v.ug && !(v.task && (v.task.type === 'jail' || v.task.type === 'condemned' || v.task.type === 'combat' || v.task.type === 'band'));
  const canStage = v => free(v) && !v.sleeping && !v.inside;
  function cellGuard(s, cap) {
    let best = null, bd = 1e9;
    for (const o of G.S.villagers.values()) { if (o.role !== 'guerreiro' || o.captive || o.sleeping || o.aboard || (o.task && o.task.pri >= 3) || G.Fac.idOfV(o) !== s.data.fac) continue; const d = G.dist(o.x, o.y, cap.x, cap.y); if (d < bd && d < 30) { bd = d; best = o; } }
    return best;
  }
  // after the square: the end, or the night that comes first
  function afterSquare(s, res) {
    const p = P(s.protag); const cap = P(s.cast.captive);
    // the scene could not be played (or was cut short): if the hour has not passed, the square is tried again
    if (/^(abortada|sem|ocupada|erro)/.test(res || '')) { const e = exOf(s); if (e && p && (s.data.tries = (s.data.tries || 0) + 1) < 3) { s.data.praca = 0; return; } const condemned = cap && cap.task && cap.task.type === 'condemned'; res = cap && !condemned ? 'outro' : cap ? 'preso' : 'tarde'; if (res === 'preso' && !(p && p.task && (p.task.type === 'jail' || p.task.type === 'condemned'))) { s.data.praca = 1; return; } }
    s.data.square = res;
    if (res === 'livre' && cap) { s.phase = 'mata'; St.expect(s, 'Esta noite, na mata', G.S.clock + DAY() * Math.max(0.05, ((0.8 - G.S.time + 1) % 1)), undefined, undefined); return; }
    if (res === 'preso' || res === 'recapturados') { s.phase = 'preso'; St.unexpect(s); return; }
    if (res === 'tarde' || (!cap && !s.data.free)) {
      if (p && !(p.task && (p.task.type === 'jail' || p.task.type === 'condemned'))) { s.phase = 'luto'; St.expect(s, 'A noite seguinte, na praça', G.S.clock + DAY() * Math.max(0.05, ((0.8 - G.S.time + 1) % 1)), s.data.x, s.data.y); return; }
      St.finish(s, 'fracassada', 'tragico', St.say(s, p && s.data.late ? 'cd-tarde' : 'cd-longe', ctx(s)), { x: s.data.x, y: s.data.y, log: true, big: 1, clima: 'cadafalso' });
      return;
    }
    // freed by others (the crowd, a pardon)
    if (cap) { St.finish(s, 'cumprida', 'feliz', St.say(s, s.data.tried ? 'cd-livre' : 'cd-livre-outro', ctx(s)), { log: true, toast: true, big: 1, legend: true, clima: 'cadafalso' }); }
  }
  function finishFree(s) {
    const p = P(s.protag); const cap = P(s.cast.captive);
    // they leave: a refuge in another people's town, if there is one
    let ref = null, rd = 1e9; const fac = s.data.fac;
    for (const t of G.S.settlements.values()) { if (G.Village.facOfSet(t.id) === fac || !p) continue; const d = G.dist(t.cx, t.cy, p.x, p.y); if (d < rd) { rd = d; ref = t; } }
    let tail = '';
    if (ref && p) { for (const v of [p, cap].filter(Boolean)) { v.set = ref.id; v.home = 0; G.Vg.setTask(v, { type: 'migrate', pri: 1.6, st: 0 }); } tail = ` Na manhã seguinte, partiram para ${ref.name}, onde ninguém conhecia os dois.`; }
    St.finish(s, 'cumprida', 'feliz', `${cap ? cap.name : 'Quem ia morrer'} está viv${oa(cap)}. ${p ? p.name : ''} cortou as cordas no meio da praça de ${townOf(s)} — e os dois sumiram no mato.${tail}`, { log: true, toast: true, big: 1, legend: true, clima: 'cadafalso' });
  }

  St.define('cadafalso', Object.assign({}, OLD, {
    stages: [['pregao', 'O pregão'], ['cela', 'A cela'], ['plano', 'O plano'], ['praca', 'O meio-dia'], ['fim', 'Depois']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 4 : -1; return s.data.square ? 4 : s.data.praca ? 3 : s.data.plan ? 2 : s.data.cela ? 1 : 0; },
    begin(s) {
      s.phase = 'juntar';
      const p = P(s.protag); const cap = P(s.cast.captive); const e = exOf(s);
      if (e) { s.data.x = +e.x.toFixed(1); s.data.y = +e.y.toFixed(1); St.expect(s, 'A execução, ao meio-dia', e.start, e.x, e.y); }
      if (p && St.party) { St.party.gather(s, p); s.data.gathered = 1; }
      // the news is played where they are, a moment later (if they are awake and free); otherwise only told
      if (!(p && cap && canStage(p) && G.Scene)) { s.data.pregao = 1; St.beat(s, 'cd-sentenca', ctx(s)); }
      s.data.crewTold = 0;
    },
    urge: () => 0,
    arrive() { },
    tick(s) {
      const p = P(s.protag); if (!p) return;
      if (!s.data.pregao) {
        s.data.pregao = 1; const cap = P(s.cast.captive); const m = cap ? messenger(p, cap) : null;
        const sc = cap && canStage(p) ? St.scene(s, 'cd-pregao', { cap: cap.id, m: m ? m.id : 0 }, { at: [p.x, p.y], onEnd: () => crewNote(s) }) : null;
        if (!sc) { St.beat(s, 'cd-sentenca', ctx(s)); crewNote(s); }
        return;
      }
      // the night after: the woods, or the gallows
      if ((s.phase === 'mata' || s.phase === 'luto') && !G.Scene.running(s.id)) {
        const night = G.S.time > 0.74 || G.S.time < 0.15;
        if (night && canStage(p) && !s.data.epi) {
          s.data.epi = 1;
          if (s.phase === 'mata') { const cap = P(s.cast.captive); if (cap && St.scene(s, 'cd-mata', { cap: cap.id }, { at: [p.x, p.y], onEnd: () => finishFree(s) })) return; finishFree(s); return; }
          if (St.scene(s, 'cd-luto', {}, { at: [s.data.x, s.data.y], onEnd: () => mourned(s) })) return;
          mourned(s); return;
        }
        if (G.S.day - (s.data.sqDay || G.S.day) > 1) { if (s.phase === 'mata') finishFree(s); else mourned(s); }
        return;
      }
      if (s.phase !== 'juntar' || s.data.praca) return;
      const e = exOf(s); if (!e) return;
      // the evening before: the plan; the night before: the cell (people sleep at night: the story wakes them)
      if (e.phase === 'wait' && free(p) && !G.Scene.running(s.id)) {
        const t = G.S.time, left = (e.start - G.S.clock) / DAY(); const night = t > 0.74 || t < 0.12, eve = t > 0.6 && t <= 0.74;
        const cap = P(s.cast.captive);
        if (!s.data.planTried && (eve || (night && s.data.cela)) && left > 0.1) { s.data.planTried = 1; if (!St.scene(s, 'cd-plano', { cap: s.cast.captive }, { at: [p.x, p.y], onEnd: () => { if (!s.data.plan) s.data.plan = choosePlan(s, p, party(s), exOf(s)); } })) s.data.plan = choosePlan(s, p, party(s), e); return; }
        if (!s.data.cela && night && left > 0.1 && cap) {
          s.data.cela = 1;
          if (G.dist(p.x, p.y, cap.x, cap.y) > 45) { St.chapter(s, `${p.name} quis ver ${cap.name} uma última vez antes do meio-dia, mas a cela ficava longe demais.`); return; }
          const g = cellGuard(s, cap);
          if (!St.scene(s, 'cd-cela', { cap: cap.id, g: g ? g.id : 0 }, { at: [cap.x, cap.y] })) St.chapter(s, `Na noite antes do cadafalso, ${p.name} rondou o lugar onde ${cap.name} estava pres${oa(cap)}, sem conseguir chegar perto.`);
          return;
        }
      }
      // the drums: to the square, whatever they were doing
      if ((e.phase === 'gather' || e.phase === 'march' || e.phase === 'read' || e.phase === 'kill') && free(p)) {
        s.data.praca = 1; s.data.tried = 1; s.data.sqDay = G.S.day;
        const sc = St.scene(s, 'cd-praca', { cap: s.cast.captive }, { at: [e.x, e.y], onEnd: res => afterSquare(s, res) });
        if (!sc) { s.data.praca = 0; s.data.tried = 0; }
        else St.unexpect(s);
      }
    },
    react(s, f) {
      const me = s.protag, cap = s.cast.captive;
      const staging = G.Scene && G.Scene.running(s.id);
      // (while the square is being played, the scene decides what it meant)
      if (staging && (f.k === 'resgatado' || f.k === 'executado' || f.k === 'preso' || f.k === 'sentenca') && (inIds(f, cap) || inIds(f, me))) return true;
      if (s.phase === 'mata' || s.phase === 'luto') { if (f.k === 'morte' && f.a === me && !byScaffold(f)) { St.finish(s, 'interrompida', 'tragico', `${(PD(me) || {}).name} ${deathTxt(me)} antes do fim daquela noite.`); return true; } if ((f.k === 'executado' || f.k === 'resgatado') && (inIds(f, cap) || inIds(f, me))) return true; if (!(f.k === 'executado' && inIds(f, me))) return false; }
      if (f.k === 'resgatado' && inIds(f, cap) && s.phase !== 'preso') { if (s.phase === 'mata') return true; afterSquare(s, 'outro'); return true; }
      if (f.k === 'executado' && inIds(f, cap) && s.phase === 'juntar' && !s.data.praca) { s.data.late = 0; afterSquare(s, 'tarde'); return true; }
      // they took the scaffold too (the death comes before the sentence's own news)
      if (f.k === 'morte' && f.a === me && byScaffold(f) && s.st === 'ativa') { const e = exOf(s); s.data.method2 = (e && e.method) || s.data.method; s.data.deadParty = names((s.data.caught || []).filter(id => id !== me && !G.S.villagers.has(id)).map(id => PD(id)).filter(Boolean)); St.finish(s, 'tragica', 'tragico', St.say(s, 'cd-fim-proprio', ctx(s)), { x: f.x, y: f.y, log: true, toast: true, big: 1, legend: true, clima: 'cadafalso' }); return true; }
      if (f.k === 'morte' && f.a === cap && !byScaffold(f) && s.st === 'ativa') { St.finish(s, 'fracassada', 'tragico', `${(PD(cap) || {}).name} morreu antes do meio-dia: ${deathTxt(cap)}.`, { log: true }); return true; }
      return OLD.react.call(this, s, f);
    },
    status(s, c) {
      if (s.phase === 'mata') return `${c.P} e ${c.C} fugiram. A noite vai ser longa.`;
      if (s.phase === 'luto') return `${c.C} se foi. ${c.P} ainda não voltou para casa.`;
      return OLD.status.call(this, s, c);
    },
    open: () => ['cortar as cordas', 'levantar a praça', 'ser pego junto', 'chegar tarde demais', 'fugir pelo mato'],
  }));
  function crewNote(s) { if (s.data.crewTold) return; s.data.crewTold = 1; St.beat(s, party(s).length ? 'cd-chamado' : 'cd-sozinho', ctx(s)); }
  function mourned(s) {
    const p = P(s.protag); const r = s.data.vow && P(s.data.vow);
    St.finish(s, 'fracassada', 'tragico', `${(PD(s.cast.captive) || {}).name} foi ${ctx(s).DONE} na praça de ${townOf(s)}. Na noite seguinte, ${p ? p.name : 'quem tentou salvar'} ${s.data.vow ? 'voltou ao cadafalso, desceu o corpo e jurou vingança.' : 'voltou ao cadafalso e ficou ali até o dia clarear.'}`, { log: true, big: 1, clima: 'cadafalso' });
    // the oath becomes a story of its own
    if (p && r && St.DEF.vinganca && s.origin[0] && G.S.villagers.has(r.id)) St.plantFrom('vinganca', { protag: p.id, score: 0.9, cast: { victim: s.cast.captive, target: r.id }, data: { rel: St.relOf(p, PD(s.cast.captive)), cause: 'execution', saw: 1, town: townOf(s), ft: G.Fac.idOfV(r) }, motifs: ['gatilho:cadafalso', 'rel:' + (St.relOf(p, PD(s.cast.captive)) || '')] }, s.origin[0]);
  }
})(window.G);
