'use strict';
// ============================================================
//  A CONVOCAÇÃO — a war, seen from one house.
//    The levy is called and one name on the list has a family. The story
//    follows that one soldier through the war the world is actually fighting:
//      O CHAMADO   at the door of the house: the news, the fear or the pride,
//                  and something given to carry (a token that will matter).
//      A COLUNA    at the roadside: the army leaves the rally point, wagons,
//                  standards, and the ones who stay; a child runs alongside.
//      A VÉSPERA   at a camp fire on the march (or in the siege lines): a
//                  comrade, the token shown, the rumours, a promise made.
//      A VOLTA     the column comes home: the run, the embrace, what the war
//                  took (an arm, the voice); the token given back.
//      A NOTÍCIA   or the column comes home without them: the comrade who
//                  promised walks to the house with the token in his hand.
//    Nothing is scripted but the staging: who dies, who is taken, who runs is
//    decided by the battles, the hunger and the march.
// ============================================================
(function (G) {
  const St = G.Stories, Sn = G.Scene;
  if (!St || !St.lib || !Sn || !G.Wars) return;
  const L = St.lib; const { pe, desc } = L;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const pick = arr => arr[Math.floor(G.R() * arr.length)];
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const de = t => (t ? t.replace(/^(a|o|as|os) /, (m, x) => 'd' + x + ' ') : t);
  const em = t => (t ? t.replace(/^(a|o|as|os) /, (m, x) => 'n' + x + ' ') : t);
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : ''; };
  const facName = id => { const f = G.Fac.get(id); return f ? f.name : ''; };
  const DAY = () => G.DAY_LEN;
  const K = (k, d) => St.storylet(k, d);
  const REL_TXT = { companheiro: 'o companheiro', companheira: 'a companheira', filho: 'o filho', filha: 'a filha', mae: 'a mãe', pai: 'o pai', irmao: 'o irmão', irma: 'a irmã' };
  // what is given at the door, to carry to the war
  const TOKEN = {
    nordico: ['um amuleto do martelo de Thor, de osso', 'uma trança de cabelo amarrada com fio vermelho', 'uma runa riscada numa lasca de chifre'],
    romano: ['uma moeda velha com o rosto do avô', 'um pequeno lar de barro, do altar da casa', 'um anel de ferro do casamento'],
    grego: ['uma fita azul do festival', 'uma coruja de barro do tamanho de um dedo', 'um ramo de oliveira seco'],
    egipcio: ['um escaravelho de faiança azul', 'um olho de Hórus pintado num caco', 'um amuleto de Ísis num cordão'],
    asteca: ['uma pena de quetzal', 'um colar de contas de jade', 'uma pedrinha de obsidiana polida'],
    classico: ['um lenço bordado', 'um amuleto de osso num cordão', 'uma mecha de cabelo num pano'],
  };
  const KID_TOKEN = ['uma pedrinha pintada com o sol', 'um boneco de palha', 'um desenho riscado numa casca de árvore', 'uma concha', 'um cavalinho de madeira'];
  function tokenFor(p, k, rel) {
    if (rel === 'filho' || rel === 'filha') return pick(KID_TOKEN);
    if (rel === 'pai' || rel === 'mae') return pick(['o amuleto que era do avô', 'a faca do pai, a de cabo de chifre', 'um punhado de terra da casa, num saquinho']);
    return pick(TOKEN[p.civ] || TOKEN.classico);
  }
  const kinRel = (p, k) => St.relOf(p, k);
  // the one at home who will see them go: a partner, a small child, a mother
  function kinOf(p) {
    // (someone who can stand at a door and say something: not a baby in arms)
    const ks = St.kin(p).filter(k => !k.captive && k.age >= 4 && !(k.task && k.task.type === 'muster') && !(k.task && k.task.type === 'band'));
    const w = k => { const r = kinRel(p, k); return (r === 'companheiro' || r === 'companheira' ? 3 : (r === 'filho' || r === 'filha') && k.age < 14 ? 3.4 : r === 'mae' || r === 'pai' ? 2 : 1) - G.dist(k.x, k.y, p.x, p.y) / 40; };
    return ks.sort((a, b) => w(b) - w(a))[0] || null;
  }
  const armyOf = s => G.Wars.army(s.data.army);
  const bandOf = s => { const a = armyOf(s); return a && a.band ? G.War.bands.get(a.band) : null; };
  const inArmy = (s, v) => { if (!v) return false; const a = G.Wars.armyOf(v) || (G.Scene.prevTask && (() => { const t = G.Scene.prevTask(v); if (!t) return null; if (t.type === 'muster') return G.Wars.army(t.army); const b = t.type === 'band' && G.War.bands.get(t.band); return b ? G.Wars.armyOfBand(b) : null; })()); return !!a && a.id === s.data.army; };

  // ------------------------------ the observer: the war's moments become facts ------------------------------
  St.observe('mobilized', d => { const a = G.Wars.army(d.army); if (!a || a.role === 'defesa' || (d.ids || []).length < 14) return; St.offer(St.draft('convocacao', { army: d.army, war: d.war, fa: d.fac, ids: d.ids.slice(0, 260), x: d.x, y: d.y })); });
  St.observe('armyMarched', d => St.offer(St.draft('marcha', { army: d.army, x: d.x, y: d.y })));
  St.observe('battleEnd', d => St.offer(St.draft('batalha', { battle: d.battle, war: d.war, winner: d.winner, ids: (d.ids || []).slice(0, 160), x: d.x, y: d.y, dead: d.dead })));
  St.observe('deserted', d => St.offer(St.draft('desercao', { a: d.v, army: d.army })));
  St.observe('armyHome', d => St.offer(St.draft('regresso', { army: d.army, ids: (d.ids || []).slice(0, 260), fa: d.fac })));
  St.observe('warEnded', d => St.offer(St.draft('fim-guerra', { war: d.war, winner: d.winner })));
  St.observe('cityBesieged', d => St.offer(St.draft('cerco', { set: d.set, war: d.war, by: d.by, x: d.x, y: d.y })));

  // ------------------------------ the chapters ------------------------------
  K('cv-chamado', { h: 'O chamado', text: [
    c => `${c.FP} chamou ${c.N} para ${c.WAR}. Em ${c.HOME}, o nome de ${c.P} estava na lista${c.KIN ? `, e ${c.KIN} ouviu junto` : ''}.`,
    c => `O pregão passou pela rua de ${c.P}: ${c.WAR} precisa de braços. ${c.P} largou o que fazia${c.KIN ? ` e foi procurar ${c.KIN}` : ''}.`,
    c => (c.SIGNS ? `Fazia dias que os ferreiros de ${c.HOME} trabalhavam à noite. Agora todo mundo sabe para quê: ${c.P} foi chamad${c.o} para ${c.WAR}.` : null),
  ] });
  K('cv-partiu', { h: 'A coluna', text: [
    c => `${cap1(c.ARMY)} saiu de ${c.FRONT} com ${c.N} soldados e ${c.W} carroças. ${c.P} ia no meio da coluna${c.TOKEN ? `, com ${c.TOKEN} amarrad${c.TOKO} no pescoço` : ''}.`,
    c => `${c.P} marchou com ${c.ARMY}${c.KIN ? `; ${c.KIN} ficou na beira da estrada até a poeira baixar` : ''}.`,
  ] });
  K('cv-fogo', { h: 'A véspera', text: [
    c => `Na fogueira do acampamento, ${c.P} mostrou ${c.TOKEN || 'o que trouxe de casa'} a ${c.COM}. Falaram de ${c.HOME} até o fogo virar brasa.`,
    c => (c.PROM ? `${c.P} fez ${c.COM} prometer: se não voltar, ${c.TOKEN || 'o que trouxe de casa'} volta por el${c.COMO}.` : null),
  ] });
  K('cv-batalha', { h: 'A batalha', text: [
    c => (c.WON ? `${c.P} lutou ${em(c.BATTLE)}. Quando acabou, o campo era ${de('o ' + c.FP).replace('do o ', 'do ')}${c.WOUND ? ` — e ${c.P} saiu com ${c.WOUND}` : ''}.` : null),
    c => (!c.WON ? `${c.P} estava ${em(c.BATTLE)}. Quando a linha quebrou, correu como todos${c.WOUND ? `, com ${c.WOUND}` : ''}.` : null),
    c => (c.WON ? `${cap1(c.BATTLE)}: ${c.P} viu a linha inimiga ceder${c.WOUND ? `, e só depois sentiu ${c.WOUND}` : ''}.` : null),
  ] });
  K('cv-cativo', { h: 'Cativ', text: [c => `${c.P} foi feit${c.o} prisioneir${c.o} por ${c.FT}. Em ${c.HOME}, ninguém sabe ainda.`] });
  K('cv-desertou', { h: 'A noite sem comida', text: [c => `${c.P} largou ${c.ARMY} numa noite sem pão e sem esperança, e tomou o caminho de ${c.HOME} pelo mato.`] });
  K('cv-morreu', { h: 'Ficou pelo caminho', text: [
    c => `${c.P} morreu ${c.WHERE}${c.BATTLE ? ', ' + em(c.BATTLE) : ''}${c.TOKEN ? `. Ainda tinha ${c.TOKEN} consigo` : ''}.`,
    c => (c.HUNGER ? `A fome do cerco levou ${c.P}, longe de ${c.HOME}.` : null),
  ] });
  K('cv-voltou', { h: 'A volta', text: [
    c => `${c.P} voltou para ${c.HOME}${c.KIN ? ` — ${c.KIN} correu até a estrada` : ''}${c.TOKEN ? `. Trouxe de volta ${c.TOKEN}` : ''}.`,
    c => (c.LIMB ? `${c.P} voltou para ${c.HOME} sem ${c.LIMB}. Mas voltou.` : null),
    c => (c.BTL >= 2 ? `${c.P} voltou ${de(c.WAR)} depois de ${c.BTL} batalhas, e não quis falar de nenhuma.` : null),
  ] });
  K('cv-voltou-desertor', { h: 'A volta escondida', text: [c => `${c.P} chegou a ${c.HOME} de madrugada, pelos fundos. Ninguém pode saber como voltou.`] });
  K('cv-voltou-livre', { h: 'A troca', text: [c => `${c.P} voltou para ${c.HOME} na troca de prisioneiros${c.KIN ? `; ${c.KIN} esperava na estrada` : ''}.`] });
  K('cv-noticia', { h: 'A notícia', text: [
    c => (c.MSG ? `${c.MSG} bateu na porta ${c.KIN ? de(c.KIN) : 'da casa'} com ${c.TOKEN || 'um embrulho'} na mão. Não precisou dizer nada.` : null),
    c => `${cap1(c.ARMY)} voltou para ${c.FRONT}. ${c.KIN ? cap1(c.KIN) : 'A família'} procurou ${c.P} em cada rosto da coluna.`,
  ] });
  K('cv-sem-volta', { h: 'Sem volta', text: [c => `${c.WAR} acabou e ${c.P} não voltou do cativeiro. ${c.KIN ? cap1(c.KIN) + ' ainda olha para a estrada.' : ''}`] });

  // the words a chapter needs from this story
  function vars(s, extra) {
    const d = s.data; const a = armyOf(s); const k = PD(s.cast.kin); const p = PD(s.protag);
    const com = PD(s.cast.com);
    return Object.assign({
      N: d.n || (a ? a.n0 : ''), WAR: d.warName || 'a guerra', HOME: d.homeName || 'casa', ARMY: d.armyName || 'o exército', FRONT: d.frontName || d.homeName,
      KIN: k ? `${REL_TXT[d.rel] || ''} ${k.name}`.trim() : '', TOKEN: d.token || '', TOKO: d.token && /^(uma|a) /.test(d.token) ? 'a' : 'o', W: a ? a.wagons || 1 : 1,
      COM: com ? com.name : 'um companheiro', COMO: com && com.g === 'f' ? 'a' : 'e', PROM: d.promise ? 1 : 0, SIGNS: d.signs ? 1 : 0,
      FT: facName(d.ft), o: oa(p),
    }, extra || {});
  }
  function woundTxt(v) { if (!v || !v.wound || G.S.day - v.wound.d > 1) return ''; return v.wound.sev === 'grave' ? pick(['um talho fundo no flanco', 'uma flecha no ombro', 'a cabeça aberta']) : pick(['um corte no braço', 'a perna sangrando', 'um dedo a menos']); }
  const LIMBS = { armL: 'o braço esquerdo', armR: 'o braço direito', leg: 'uma perna' };

  // ====================================================================================
  //  THE STORY
  // ====================================================================================
  St.define('convocacao', {
    name: 'A Convocação', icon: 'sword', tone: 'agridoce', tags: ['guerra', 'família'], struct: 'partida-retorno', seedLife: 1, maxDays: 60, ripe: 0,
    stages: [['chamado', 'O chamado'], ['partida', 'A partida'], ['campanha', 'A campanha'], ['volta', 'A volta']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' || s.end.k === 'reencontro' ? 3 : -1; return { chamado: 0, partida: 1, campanha: 2, volta: 3, luto: 3, cativo: 2, fuga: 3 }[s.phase] || 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.homeName))}, chamad${c.o} para ${s.data.warName || 'a guerra'}${s.data.kinName ? `, deixa ${REL_TXT[s.data.rel] || ''} ${s.data.kinName} na porta de casa` : ''}.`,
    on: {
      convocacao(f) {
        const a = G.Wars.army(f.army); const w = G.Wars.get(f.war); if (!a || !w) return null;
        let best = null, bs = 0, bk = null;
        for (const id of f.ids) {
          const v = P(id); if (!v || v.captive || v.age < 17 || v.age > 50 || G.Fac.all().some(x => x.leader === v.id)) continue;
          const k = kinOf(v); if (!k) continue;
          const r = kinRel(v, k); const young = (v.kids || []).some(i => { const q = P(i); return q && q.age < 14; });
          let sc = 0.46 + (r === 'companheiro' || r === 'companheira' ? 0.12 : 0) + (young ? 0.16 : 0) + (v.role !== 'guerreiro' ? 0.08 : 0) + ((v.traits || []).some(t => t === 'Romântico' || t === 'Sociável') ? 0.04 : 0) - G.dist(k.x, k.y, v.x, v.y) / 300;
          if (sc > bs) { bs = sc; best = v; bk = k; }
        }
        if (!best || bs < 0.45) return null;
        const home = G.S.settlements.get(best.set); const front = G.S.settlements.get(a.front);
        const t = G.Wars.tension(a.fac, F0(w, a.fac));
        return [{ protag: best.id, score: Math.min(0.9, bs + 0.12), keyExtra: 'cv' + a.id, cast: { kin: bk.id }, place: home ? { kind: 'cidade', name: home.name, x: home.cx, y: home.cy, set: home.id } : { kind: 'lugar', name: '', x: best.x, y: best.y },
          data: { army: a.id, war: w.id, ft: F0(w, a.fac), warName: w.name, armyName: a.name, n: a.n0, home: best.set, homeName: home ? home.name : '', front: a.front, frontName: front ? front.name : '', rel: kinRel(best, bk), kinName: bk.name, signs: t && t.stage >= 2 ? 1 : 0, kidAge0: bk.age },
          motifs: ['gatilho:convocacao', 'amb:guerra', 'rel:familia'] }];
      },
    },
    valid: sd => { const a = G.Wars.army(sd.data.army); return !!a && !a.done && a.phase === 'mobilizar'; },
    begin(s) {
      s.phase = 'chamado';
      const p = P(s.protag); const k = P(s.cast.kin);
      St.beat(s, 'cv-chamado', vars(s), { x: p ? p.x : undefined, y: p ? p.y : undefined, toast: true });
      s.data.call = k ? k.id : -1; // (the scene at the door plays on the next tick, once the story is in the book)
    },
    tick(s) {
      const p = P(s.protag); const a = armyOf(s);
      // dead, and nobody came home to tell it: the war forgets them
      if (!p) { if (s.data.died && !s.data.told && G.S.day - s.data.died.d > 6) { s.data.told = 1; St.finish(s, 'tragica', 'tragico', St.say(s, 'cv-noticia', vars(s, { MSG: '' }))); } return; }
      if (s.data.call) { const k = s.data.call > 0 ? s.data.call : 0; s.data.call = 0; if (s.phase === 'chamado' && !Sn.running(s.id)) St.scene(s, 'cv-chamado', { k }, { at: [p.x, p.y] }); }
      // the camp fire on the march, or in the siege lines, once
      if (!s.data.fire && a && !a.done && (a.phase === 'acampado' || (a.phase === 'cerco' && G.isNight())) && inArmy(s, p) && !Sn.running(s.id)) {
        const b = bandOf(s); if (b) { s.data.fire = 1; s.phase = 'campanha'; St.scene(s, 'cv-fogueira', {}, { at: [p.x, p.y], data: { siege: a.phase === 'cerco' }, guard: () => { const a2 = armyOf(s); return !!a2 && (a2.phase === 'acampado' || a2.phase === 'cerco'); } }); }
      }
      // home again, whatever the way: deserted, freed, or the army back
      const home = G.S.settlements.get(s.data.home) || G.S.settlements.get(p.set);
      const atHome = home && G.dist(p.x, p.y, home.cx, home.cy) < (home.radius || 8) + 4;
      if ((s.data.deserted || s.data.freed || (a && a.done && !s.data.died)) && !s.data.back && atHome && !p.captive && !inArmy(s, p) && !Sn.running(s.id)) {
        s.data.back = 1; s.phase = 'volta';
        const mode = s.data.deserted ? 'desertor' : s.data.freed ? 'livre' : 'volta';
        const k = P(s.cast.kin);
        St.scene(s, 'cv-volta', { k: k ? k.id : 0 }, { at: [p.x, p.y], data: { mode }, onEnd: () => endHome(s, mode) });
      }
      // an army that never left (a peace while it gathered): the story ends at the door
      if (a && a.done && s.phase === 'chamado' && !s.data.back) St.finish(s, 'transformada', 'sereno', `${cap1(s.data.warName)} acabou antes que ${s.data.armyName} saísse de ${s.data.frontName}. ${p.name} voltou para casa no mesmo dia.`);
    },
    react(s, f) {
      const p = P(s.protag); const d = s.data;
      if (f.k === 'marcha' && f.army === d.army && s.phase === 'chamado') {
        s.phase = 'partida';
        St.beat(s, 'cv-partiu', vars(s), { x: f.x, y: f.y });
        const k = P(s.cast.kin);
        if (k && G.dist(k.x, k.y, f.x, f.y) < 36) St.scene(s, 'cv-coluna', { k: k.id }, { at: [f.x, f.y] });
        return true;
      }
      if (f.k === 'batalha' && (f.ids || []).includes(s.protag)) {
        const bt = G.Wars.battle(f.battle); if (!bt || bt.kind === 'refrega' || (d.btlSeen || []).includes(bt.id)) return false;
        (d.btlSeen = d.btlSeen || []).push(bt.id); if (d.btlSeen.length > 12) d.btlSeen.shift();
        d.btl = (d.btl || 0) + 1; d.lastBattle = bt.name; d.btlDay = G.S.day; s.phase = 'campanha';
        d.lastWon = f.winner === (p ? G.Fac.idOfV(p) : 0) ? 1 : 0;
        if (p) St.beat(s, 'cv-batalha', vars(s, { BATTLE: bt.name, WON: f.winner === G.Fac.idOfV(p) ? 1 : 0, WOUND: woundTxt(p), FP: facName(G.Fac.idOfV(p)) }), { x: f.x, y: f.y });
        return true;
      }
      if (f.k === 'morte' && f.a === s.protag) {
        const violent = { war: 1, arrow: 1, massacre: 1, siege: 1, oil: 1, rock: 1 }[f.cause];
        if (!violent && f.cause !== 'hunger' && f.cause !== 'sick') { St.finish(s, 'interrompida', 'agridoce', `${PD(s.protag).name} morreu longe da guerra que o chamou.`); return true; }
        d.died = { d: G.S.day, battle: d.lastBattle && G.S.day - (d.btlDay || G.S.day) < 1 ? d.lastBattle : '', cause: f.cause, x: f.x, y: f.y };
        const bt = G.Wars.state().battles.find(b => b.open && G.dist(b.x, b.y, f.x, f.y) < 20); if (bt) d.died.battle = bt.name;
        s.phase = 'luto'; d.waitHeir = G.S.day; // (the story goes on without them: someone has to bring the news home)
        St.beat(s, 'cv-morreu', vars(s, { WHERE: (St.where(f.x, f.y).at || '').trim() || 'longe de casa', BATTLE: d.died.battle, HUNGER: f.cause === 'hunger' ? 1 : 0 }), { x: f.x, y: f.y });
        return true;
      }
      if (f.k === 'captura' && f.a === s.protag) { s.phase = 'cativo'; d.captive = 1; St.beat(s, 'cv-cativo', vars(s), { x: f.x, y: f.y }); return true; }
      if (f.k === 'liberdade' && f.a === s.protag && d.captive) { d.freed = 1; d.captive = 0; s.phase = 'fuga'; return true; }
      if (f.k === 'desercao' && f.a === s.protag) { d.deserted = 1; s.phase = 'fuga'; St.beat(s, 'cv-desertou', vars(s)); return true; }
      if (f.k === 'regresso' && f.army === d.army && d.died && !d.told) {
        d.told = 1;
        // the comrade who promised — or anyone from the column who knew them
        const promised = P(d.promise); const msg = promised && (f.ids || []).includes(promised.id) ? promised : (f.ids || []).map(P).find(v => v && v.set === d.home && v.id !== s.protag);
        const k = P(s.cast.kin);
        St.beat(s, 'cv-noticia', vars(s, { MSG: msg ? msg.name : '' }), { toast: true });
        if (k) St.scene(s, 'cv-noticia', { k: k.id, m: msg ? msg.id : 0 }, { at: [k.x, k.y], onEnd: () => St.finish(s, 'tragica', 'tragico', null, { big: 1 }) });
        else St.finish(s, 'tragica', 'tragico', null);
        return true;
      }
      if (f.k === 'fim-guerra' && f.war === d.war) {
        if (d.captive && p && p.captive) { St.finish(s, 'roubada', 'tragico', St.say(s, 'cv-sem-volta', vars(s))); return true; }
        if (d.died && !d.told) { d.told = 1; const k = P(s.cast.kin); St.beat(s, 'cv-noticia', vars(s, { MSG: '' })); if (k) St.scene(s, 'cv-noticia', { k: k.id, m: 0 }, { at: [k.x, k.y], onEnd: () => St.finish(s, 'tragica', 'tragico', null) }); else St.finish(s, 'tragica', 'tragico', null); return true; }
      }
      return false;
    },
    urge: () => 0,
    goal: (s, c) => `Voltar para ${s.data.homeName || 'casa'}${s.data.kinName ? ' e para ' + s.data.kinName : ''}.`,
    status(s, c) {
      const a = armyOf(s); const d = s.data; const p = P(s.protag);
      if (d.died) return `${c.P} não volta mais.`;
      if (d.captive) return `${c.P} está cativ${c.o} de ${facName(d.ft)}.`;
      if (d.deserted) return `${c.P} desertou e tenta chegar em casa.`;
      if (!a || !p) return '';
      const ph = { mobilizar: 'no ponto de reunião, esperando os outros', reunir: 'formando com a companhia', marcha: 'em marcha', acampado: 'no acampamento', batalha: 'em batalha', cerco: 'no cerco', assalto: 'no assalto', retorno: 'voltando para casa', retirada: 'em retirada' }[a.phase];
      return ph ? `${c.P} está ${ph}, com ${a.name}.` : `${c.P} está em ${setName(p.set) || 'casa'}.`;
    },
    obstacles: s => ['a guerra', 'a fome do caminho', `os soldados de ${facName(s.data.ft)}`],
    open: s => ['voltar para casa', 'morrer longe', 'ser feito prisioneiro', 'desertar'],
    titles: {
      convocacao: () => 'A Convocação',
      nome: c => `O Nome de ${c.P} na Lista`,
      porta: c => (c.s.data.kinName ? `${c.s.data.kinName} na Porta` : null),
      guerra: c => `${c.P} Vai à Guerra`,
    },
    retitle(s, c) { if (s.end && s.end.k === 'tragica') return `${c.P} Não Voltou`; if (s.end && s.end.k === 'cumprida') return `A Volta de ${c.P}`; return null; },
    forgotten: (s, c) => `${c.P} voltou para a vida de antes, e a guerra virou uma história que não se conta.`,
  });
  function F0(w, fac) { const sa = w.a.includes(fac) ? w.b : w.a; return sa[0]; }
  function endHome(s, mode) {
    const p = PD(s.protag); if (!p || s.st !== 'ativa') return;
    const d = s.data; const limb = p.limb && LIMBS[p.limb] ? LIMBS[p.limb] : '';
    const key = mode === 'desertor' ? 'cv-voltou-desertor' : mode === 'livre' ? 'cv-voltou-livre' : 'cv-voltou';
    const tone = mode === 'desertor' || limb ? 'agridoce' : 'feliz';
    St.finish(s, mode === 'desertor' ? 'transformada' : 'cumprida', tone, St.say(s, key, vars(s, { LIMB: limb, BTL: d.btl || 0 })), { x: p.x, y: p.y, log: true, toast: true, big: 1 });
  }

  // ====================================================================================
  //  THE SCENES
  // ====================================================================================
  const TEMPER_K = {
    medroso: [`Diz que não é você. Diz que leram o nome errado.`, `Não vai. A gente foge para o mato, ninguém acha.`],
    bravo: [`Então vai. E volta com os dez dedos.`, `Se tem que ir, vai de cabeça erguida.`],
    devoto: [`Eu já pedi aos deuses. Eles vão te trazer de volta.`, `Vou acender uma vela todo dia até você voltar.`],
    frio: [`Quantos dias de comida eles te dão?`, `Leva as botas novas. As velhas não aguentam a estrada.`],
    firme: [`Eu sabia. Desde que os ferreiros começaram a bater de noite, eu sabia.`, `Vai. A casa fica de pé até você voltar.`],
  };
  const TEMPER_P = {
    bravo: [`É a nossa guerra. Volto antes da colheita.`, `Vão lembrar o meu nome em ${'{HOME}'}.`],
    medroso: [`Eu nunca segurei uma lança na vida...`, `Eu não sei lutar. Eu sei plantar.`],
    frio: [`Se eu não for, eles vêm me buscar.`, `É o que tem que ser.`],
    devoto: [`Se os deuses quiserem, eu volto.`, `Reza por mim. Eu rezo por você.`],
    firme: [`Cuida de tudo. Eu volto.`, `Guarda o meu lado da cama. Eu volto.`],
  };
  // ---- O CHAMADO: at the door ----
  Sn.define('cv-chamado', { imp: 2, kick: 'A Convocação', lazy: true, doing: (sc, v) => (v.id === sc.cast.p ? 'Despedindo-se antes da guerra' : 'Ouvindo a notícia da convocação'), *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const k = c.v('k'); const hasK = k && G.dist(k.x, k.y, p.x, p.y) < 30 && c.take('k', { keep: true, force: true });
    if (k && !hasK) (c.sc.dbg = c.sc.dbg || []).push('k ' + Math.round(G.dist(k.x, k.y, p.x, p.y)) + ' ' + (k.task ? k.task.type : '-'));
    const d = s.data; const rel = hasK ? kinRel(p, k) : null; const kid = hasK && k.age < 13;
    // the door of the house (or wherever they are)
    const house = p.home && G.S.buildings.get(p.home); const door = house ? G.Vg.door(house) : [p.x, p.y];
    const at = Sn.spot(door[0], door[1] + 0.6, 2) || [p.x, p.y];
    yield c.walk('p', at, { max: 30 });
    if (hasK) yield c.approach('k', 'p', 1.1, { max: 30 });
    c.ready();
    c.mood('sad');
    c.tag('p', 'convocad' + oa(p)); if (hasK) c.tag('k', REL_TXT[rel] ? REL_TXT[rel].replace(/^(o|a) /, '') : 'família');
    c.title('A Convocação', 'O Chamado');
    c.caption(`${facName(G.Fac.idOfV(p))} chama ${d.n || 'os seus'} para ${d.warName}. Em ${d.homeName}, o nome de ${p.name} está na lista.`, { hold: 3.4 });
    c.cam(hasK ? ['p', 'k'] : ['p'], { zoom: 4.4 });
    yield 2.6;
    let token = null;
    if (hasK) {
      c.face('k', 'p'); c.face('p', 'k');
      const tk = Sn.temper(k), tp = Sn.temper(p);
      if (kid) {
        yield c.say('k', pick([`${Sn.voc(k, p)}, é verdade? Você vai pra guerra?`, `${Sn.voc(k, p)}... os homens da praça disseram o seu nome.`]));
        c.pose('p', 'kneel'); c.cam(['p', 'k'], { zoom: 5 });
        yield c.say('p', pick([`Vou. E você vai cuidar da casa enquanto eu estiver fora. Promete?`, `Vou. Mas eu volto antes de você crescer mais um palmo.`]));
        yield c.say('k', pick([`E se você não voltar?`, `Leva eu junto.`]), { style: 'whisper' });
        c.slow(0.7, 1.6);
        yield c.say('p', pick([`Olha pra mim. Eu volto.`, `Eu volto. Ninguém vai me impedir de voltar pra você.`]));
      } else if (rel === 'mae' || rel === 'pai') {
        const past = G.Wars.state().wars.filter(w => w.end && (w.a.includes(G.Fac.idOfV(p)) || w.b.includes(G.Fac.idOfV(p)))).slice(-1)[0];
        yield c.say('k', past ? pick([`Eu vi ${past.name}. Vi quem voltou e quem não voltou.`, `Teu avô foi ${em(past.name)}. Volta melhor do que ele voltou.`]) : pick([`Come alguma coisa antes de ir. Ninguém luta de barriga vazia.`, `Eu te carreguei no colo. Não foi pra isso.`]));
        yield c.say('p', pick(TEMPER_P[tp]).replace('{HOME}', d.homeName));
      } else {
        yield c.say('k', pick(d.signs ? TEMPER_K[tk] : TEMPER_K[tk].filter(t => !/ferreiros/.test(t)).concat([`Quando?`])));
        if (tp === 'medroso') c.pose('p', 'cower');
        yield c.say('p', pick(TEMPER_P[tp]).replace('{HOME}', d.homeName));
        c.pose('p', '');
      }
      // something to carry
      token = tokenFor(p, k, rel);
      c.pose('k', 'gift'); c.cam(['p', 'k'], { zoom: 5.2 });
      yield c.say('k', kid ? pick([`Toma. Pra você não esquecer de mim.`, `Leva isso. Dá sorte.`]) : pick([`Leva isto. E traz de volta.`, `Isto vai com você. Eu quero de volta, entendeu?`]), { style: 'whisper' });
      c.caption(`${k.name} deu a ${p.name} ${token}.`, { hold: 2.8 });
      yield 2.2;
      c.pose('k', 'embrace'); c.pose('p', 'embrace'); c.emote('p', 'heart', 2.6); c.emote('k', 'sad', 2.6);
      c.snap('A despedida');
      yield 2.8;
    } else {
      // no one at the door: the house looked at once more
      c.pose('p', 'look'); c.face('p', door);
      yield c.say('p', pick([`Vou voltar pra você, casa velha.`, `Fecha bem a porta, ${p.name}. Fecha bem.`]), { style: 'think' });
      token = pick(['um punhado de terra da casa, num saquinho', 'a chave da porta']);
      yield 1.6;
    }
    d.token = token;
    c.attach();
    // and walks off to the rally point; the one who stays, stays
    const a = G.Wars.army(d.army);
    if (a && a.muster) {
      const dir = Math.atan2(a.muster[1] - p.y, a.muster[0] - p.x);
      const away = Sn.spot(p.x + Math.cos(dir) * 6, p.y + Math.sin(dir) * 6, 3);
      c.pose('p', ''); if (away) c.walk('p', away, { max: 10 });
      if (hasK) { c.pose('k', kid ? 'wave' : Sn.temper(k) === 'medroso' ? 'weepk' : 'wave'); c.cam(['k', 'p'], { zoom: 4 }); }
      yield 3.4;
      if (hasK) c.cam(['k'], { zoom: 4.6 });
      yield 1.6;
    }
    return 'ok';
  } });

  // ---- A COLUNA: at the roadside ----
  Sn.define('cv-coluna', { imp: 2, kick: 'A Convocação', lazy: true, doing: () => 'Na beira da estrada, vendo o exército partir', *gen(c) {
    const s = c.story(); const p = c.v('p'); const k = c.v('k'); if (!s || !p || !k) return 'sem';
    const a = G.Wars.army(s.data.army); const b = a && a.band && G.War.bands.get(a.band); if (!a || !b) return 'sem';
    if (!c.take('k', { vital: true, keep: true, force: true })) { (c.sc.dbg = c.sc.dbg || []).push('k ' + (k.task ? k.task.type : '-') + (k.ug ? ' ug' : '') + (k.held ? ' held' : '') + (k.aboard ? ' aboard' : '')); return 'ocupada'; }
    // a spot on the roadside a little ahead of the column
    const ang = Math.atan2(b.ty - b.ry, b.tx - b.rx); const side = G.R() < 0.5 ? 1 : -1;
    const road = [b.rx + Math.cos(ang) * 8, b.ry + Math.sin(ang) * 8];
    const at = Sn.spot(road[0] - Math.sin(ang) * 2.6 * side, road[1] + Math.cos(ang) * 2.6 * side, 3) || road;
    yield c.walk('k', at, { max: 40, run: G.dist(k.x, k.y, at[0], at[1]) > 14 });
    // a few more from the town at the roadside
    const crowd = [...G.S.villagers.values()].filter(o => o !== k && o.set === k.set && !o.captive && !o.sleeping && !o.inside && o.age >= 5 && G.dist(o.x, o.y, at[0], at[1]) < 16 && !(o.task && o.task.pri >= 3)).slice(0, 5).filter(o => c.take(o, { keep: true }));
    crowd.forEach((o, i) => c.walk(o, Sn.spot(at[0] + Math.cos(ang) * (i - 2) * 1.1, at[1] + Math.sin(ang) * (i - 2) * 1.1, 1.5) || at, { max: 25 }));
    yield c.until(() => G.dist(k.x, k.y, at[0], at[1]) < 1.5, 20);
    c.ready();
    c.mood('epic');
    c.tag('k', 'quem fica'); c.tag('p', 'na coluna');
    c.title('A Convocação', 'A Coluna');
    c.caption(`${cap1(a.name)} deixa ${setName(a.front)}: ${b.members.length} soldados, ${a.wagons || 1} ${a.wagons > 1 ? 'carroças' : 'carroça'}, os estandartes ${G.Wars.ofF(G.Fac.get(a.fac))}. Na beira da estrada, quem fica.`, { hold: 4 });
    const gen = P(a.gen);
    c.cam(gen ? [gen, 'k'] : ['k'], { zoom: 3.2 });
    c.face('k', road); crowd.forEach(o => { c.face(o, road); c.pose(o, G.R() < 0.4 ? 'wave' : ''); });
    c.sfx('horn', road, 0.6);
    // the column passes; the one in it, at last
    yield c.until(() => P(p.id) && G.dist(p.x, p.y, k.x, k.y) < 7, 45);
    c.cam(['p', 'k'], { zoom: 4.2 });
    const kid = k.age < 13;
    if (kid) {
      yield c.say('k', `${Sn.voc(k, p).toUpperCase()}!`, { style: 'shout' });
      c.approach('k', 'p', 1.2, { run: true, max: 7 });
      yield 2.6;
      c.say('p', pick([`Volta pra casa! Eu volto!`, `Cuida da casa!`]), { style: 'shout' });
      c.emote('p', 'heart', 2.4);
      yield 2.4;
      c.pose('k', 'wave');
    } else {
      c.pose('k', 'wave');
      yield c.say('k', pick([`Volta!`, `${Sn.voc(k, p)}! Volta pra mim!`, `Que os deuses te guardem!`]), { style: 'shout' });
      c.emote('p', 'heart', 2.4);
      c.say('p', pick([`Eu volto!`, `Guarda o meu lugar na mesa!`]), { style: 'shout' });
      yield 2.6;
    }
    c.murmur(crowd, [`Tão novos...`, `Volta, filho!`, `Que os deuses tragam todos.`, `Olha as carroças...`], { p: 0.6 });
    c.snap('A coluna');
    yield c.until(() => !P(p.id) || G.dist(p.x, p.y, k.x, k.y) > 10, 20);
    c.pose('k', Sn.temper(k) === 'medroso' || kid ? 'weepk' : 'look'); c.face('k', [b.tx, b.ty]);
    c.cam(['k'], { zoom: 4.6 });
    c.caption(`A poeira da estrada demorou a baixar.`, { hold: 2.6 });
    yield 3;
    return 'ok';
  } });

  // ---- A VÉSPERA: at the camp fire ----
  const RUMOR = [
    (en, n) => (n ? `Dizem que ${en} juntou ${n} homens atrás dos muros.` : `Dizem que eles têm o dobro de homens.`),
    () => `Ouvi dizer que eles envenenam as flechas.`,
    () => `O sargento diz que eles fogem no primeiro grito. O sargento diz muita coisa.`,
  ];
  Sn.define('cv-fogueira', { imp: 2, kick: 'A Convocação', lazy: true, doing: () => 'Junto à fogueira do acampamento', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    const a = G.Wars.army(s.data.army); const b = a && a.band && G.War.bands.get(a.band); if (!a || !b || !b.army) return 'sem';
    const myCo = b.army.cos.find(co => co.members.includes(p.id)) || b.army.cos[0];
    // a comrade: from the same town if possible, else from the same company
    const pool = b.members.map(P).filter(v => v && v.id !== p.id && v.id !== b.army.gen && G.dist(v.x, v.y, p.x, p.y) < 14);
    const com = pool.sort((x, y) => (y.set === p.set) - (x.set === p.set) || (myCo.members.includes(y.id) - myCo.members.includes(x.id)) || G.dist(x.x, x.y, p.x, p.y) - G.dist(y.x, y.y, p.x, p.y))[0];
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const hasC = com && c.take(com, { keep: true, force: true });
    if (hasC) { c.cast2('c', com); s.cast.com = com.id; }
    const camp = myCo.camp || [myCo.ax, myCo.ay]; const fire = [camp[0] + 0.6, camp[1] + 0.6];
    yield c.walk('p', Sn.spot(fire[0] - 0.9, fire[1] + 0.2, 1.2) || fire, { max: 20 });
    if (hasC) yield c.walk('c', Sn.spot(fire[0] + 0.8, fire[1] - 0.3, 1.2) || fire, { max: 20 });
    c.ready();
    c.mood('night');
    c.face('p', fire); if (hasC) c.face('c', fire);
    c.pose('p', 'sit'); if (hasC) c.pose('c', 'sittalk');
    c.tag('p', 'convocad' + oa(p)); if (hasC) c.tag('c', 'companheir' + oa(com) + ' de fogueira');
    const tgt = G.S.settlements.get(a.target); const home = G.S.settlements.get(s.data.home);
    const siege = c.data.siege;
    c.title('A Convocação', 'A Véspera');
    c.caption(siege ? `Nas trincheiras diante de ${tgt ? tgt.name : 'a cidade'}, à noite. O fogo é pequeno para não chamar flechas.` : `Acampamento ${de(a.name)}${home ? `, longe de ${home.name}` : ''}. ${tgt ? `${tgt.name} fica a menos de um dia de marcha.` : ''}`, { hold: 3.6 });
    c.cam(hasC ? ['p', 'c', fire] : ['p', fire], { zoom: 4.6 });
    yield 2.4;
    const d = s.data; const tk = hasC ? Sn.temper(com) : 'firme', tp = Sn.temper(p);
    if (hasC) {
      if (d.lastBattle) yield c.say('c', pick([`Na ${d.lastBattle.replace(/^(a|o) /, '')}... achei que era o fim.`, `Você ainda ouve os gritos? Eu ouço.`]));
      else {
        const def = G.Wars.state().armies.find(x => !x.done && x.role === 'defesa' && x.target === a.target);
        yield c.say('c', tk === 'medroso' ? pick(RUMOR)(facName(s.data.ft), def ? def.members.length : 0) : tk === 'bravo' ? pick([`Amanhã a gente mostra pra eles.`, `Mal posso esperar.`]) : pick([`Não consigo dormir.`, `Você tem família?`, `Faz frio pra essa época.`]));
      }
      c.pose('p', 'look');
      yield c.say('p', d.token ? `${s.data.kinName || 'Lá em casa'} me deu isto antes de eu sair. ${cap1(d.token)}.` : `Fico pensando em ${home ? home.name : 'casa'}.`, { style: 'whisper' });
      c.cam(['p', 'c'], { zoom: 5.4 });
      yield c.say('c', tk === 'frio' ? pick([`Guarda bem. Aqui roubam até as botas de defunto.`, `Isso não para flecha.`]) : tk === 'devoto' ? pick([`Os deuses estão vendo. Vai te proteger.`, `É bom ter algo de casa.`]) : pick([`Eu deixei ${com.g === 'f' ? 'dois filhos' : 'uma moça'} em ${setName(com.set) || 'casa'}. Ela nem sabe que eu vim.`, `Bonito. Quem fez?`, `Então você tem pra quem voltar.`]));
      // the promise
      if (tp === 'medroso' || tp === 'devoto' || G.R() < 0.4) {
        c.pose('p', ''); c.face('p', 'c');
        yield c.say('p', `Se eu não voltar... leva isto pra ${s.data.kinName || 'minha família'}. Promete.`, { style: 'whisper' });
        c.slow(0.7, 1.4);
        yield c.say('c', tk === 'frio' ? `Você vai voltar. Mas prometo.` : `Prometo. E você faz o mesmo por mim.`);
        d.promise = com.id;
      }
    } else {
      c.pose('p', 'look');
      yield c.say('p', d.token ? `${cap1(d.token)}... ${s.data.kinName || 'casa'}.` : `Casa...`, { style: 'think' });
    }
    // the commander passing by the fires
    const gen = P(a.gen);
    if (gen && gen.id !== p.id && G.dist(gen.x, gen.y, p.x, p.y) < 18 && c.take(gen, { keep: true, force: true })) {
      c.cast2('g', gen);
      yield c.walk('g', Sn.spot(fire[0], fire[1] - 1.6, 1.2) || fire, { max: 12 });
      c.face('g', fire); c.cam(['g', 'p'], { zoom: 4.4 });
      yield c.say('g', siege ? pick([`Durmam. A fome está do lado de dentro, não do nosso.`, `Mais uns dias e eles abrem os portões sozinhos.`]) : pick([`Durmam. Amanhã ${tgt ? tgt.name + ' estará diante de nós' : 'marchamos cedo'}.`, `Apaguem esse fogo antes do sol. E durmam.`]));
      c.release('g');
    }
    c.pose('p', 'lie'); if (hasC) c.pose('c', 'lie');
    c.cam(hasC ? ['p', 'c', fire] : ['p', fire], { zoom: 4.2 });
    c.snap('A véspera');
    St.beat(s, 'cv-fogo', vars(s));
    c.attach();
    yield 3;
    return 'ok';
  } });

  // ---- A VOLTA: home ----
  Sn.define('cv-volta', { imp: 3, kick: 'A Convocação', lazy: true, doing: () => 'Voltando para casa', *gen(c) {
    const s = c.story(); const p = c.v('p'); if (!s || !p) return 'sem';
    if (!c.take('p', { vital: true, keep: true, force: true })) return 'ocupada';
    const k = c.v('k'); const hasK = k && G.dist(k.x, k.y, p.x, p.y) < 40 && c.take('k', { keep: true, force: true });
    const mode = c.data.mode; const d = s.data;
    const house = p.home && G.S.buildings.get(p.home); const door = house ? G.Vg.door(house) : hasK ? [k.x, k.y] : [p.x, p.y];
    if (hasK) yield c.walk('k', Sn.spot(door[0], door[1] + 0.5, 2) || door, { max: 30 });
    const from = Sn.spot(door[0] + 5, door[1] + 4, 3) || [p.x, p.y];
    if (G.dist(p.x, p.y, from[0], from[1]) > 2) yield c.walk('p', from, { max: 30 });
    c.ready();
    c.mood(mode === 'desertor' ? 'night' : 'hope');
    c.tag('p', mode === 'desertor' ? 'desertor' + (p.g === 'f' ? 'a' : '') : 'de volta'); if (hasK) c.tag('k', 'quem esperou');
    c.title('A Convocação', mode === 'desertor' ? 'A Volta Escondida' : 'A Volta');
    const a = G.Wars.army(d.army);
    c.caption(mode === 'desertor' ? `${p.name} chega a ${d.homeName} de madrugada, pelos fundos, sem a lança.` : mode === 'livre' ? `Trocado na paz por um prisioneiro do outro lado, ${p.name} chega a ${d.homeName}.` : `${cap1(d.armyName)} voltou${a && a.dead ? ` — dos ${a.n0} que partiram, ${a.dead} ficaram pelo caminho` : ''}. ${p.name} sobe a rua de casa.`, { hold: 3.6 });
    c.cam(hasK ? ['p', 'k'] : ['p'], { zoom: 3.8 });
    c.walk('p', Sn.spot(door[0] + 1.4, door[1] + 1, 1.5) || door, { max: 20, slow: mode !== 'desertor', sneak: mode === 'desertor' });
    yield 2.2;
    if (!hasK) {
      yield c.until(() => !c.v('p').task || !c.v('p').task.mv, 10);
      c.pose('p', 'look'); c.face('p', door);
      yield c.say('p', pick([`Ninguém em casa...`, `Voltei.`]), { style: 'whisper' });
      c.snap('A volta'); yield 2; return 'ok';
    }
    const limb = p.limb && LIMBS[p.limb] ? LIMBS[p.limb] : '';
    const grew = k.age < 18 && d.kidAge0 && k.age - d.kidAge0 >= 1.5;
    if (mode === 'desertor') {
      c.face('k', 'p');
      yield c.say('k', pick([`${Sn.voc(k, p)}?! A guerra acabou?`, `Você... como voltou?`]), { style: 'whisper' });
      yield c.say('p', pick([`Pra mim acabou.`, `Não pergunta. Por favor, não pergunta.`]), { style: 'whisper' });
      const tk = Sn.temper(k);
      if (tk === 'bravo') { c.pose('k', 'point'); yield c.say('k', `Você fugiu? E os outros? E os filhos dos outros?`); c.pose('p', 'cower'); yield 1.6; c.pose('k', ''); yield c.say('k', `...Entra. Antes que alguém veja.`, { style: 'whisper' }); }
      else { yield c.say('k', `Entra, antes que alguém veja.`, { style: 'whisper' }); }
      c.pose('k', 'embrace'); c.pose('p', 'embrace');
      c.caption(`Ninguém em ${d.homeName} pode saber como ${p.name} voltou.`, { hold: 2.8 });
    } else {
      c.face('k', 'p'); c.emote('k', 'heart', 2.4);
      c.cam(['p', 'k'], { zoom: 4.4 });
      yield c.say('k', k.age < 13 ? `${Sn.voc(k, p).toUpperCase()}!` : pick([`${Sn.voc(k, p)}!`, `Você voltou... você voltou!`]), { style: 'shout' });
      yield c.approach('k', 'p', 0.9, { run: true, max: 12 });
      c.pose('k', 'embrace'); c.pose('p', 'embrace'); c.slow(0.6, 2.2);
      if (grew) c.caption(`${k.name} cresceu. ${p.name} quase não ${k.g === 'f' ? 'a' : 'o'} reconheceu.`, { hold: 2.6 });
      yield 2.8;
      // what the war did, said in a few words at the door
      const lostBattle = d.lastBattle && d.lastWon === 0;
      const fallen = a ? a.members.length < (a.n0 || 0) * 0.5 : false;
      if (k.age < 13) yield c.say('k', pick([`Você tá com cheiro de fumaça.`, `Eu cuidei da casa. Juro que cuidei.`, `Você trouxe? Trouxe?`]));
      else yield c.say('k', lostBattle ? pick([`Disseram que vocês fugiram. Eu não acreditei, eu só rezei.`, `Chegaram uns antes. Contaram coisas...`]) : fallen ? pick([`Tantos não voltaram... a rua inteira está de luto.`, `Eu ia na estrada todo dia ver se você vinha.`]) : pick([`Eu ia na estrada todo dia ver se você vinha.`, `Olha pra você. Magr${oa(p)} que dá dó.`]), { style: 'whisper' });
      if (lostBattle) yield c.say('p', pick([`Fugimos. E é por isso que eu estou aqui.`, `A linha quebrou. Eu corri. Não me orgulho, mas estou vivo.`]), { style: 'whisper' });
      if (limb) { c.pose('k', ''); c.cam(['p', 'k'], { zoom: 5.2 }); c.caption(`${p.name} voltou sem ${limb}.`, { hold: 2.4 }); yield c.say('k', pick([`O que fizeram com você...`, `Ah, não... ah, não.`]), { style: 'whisper' }); yield c.say('p', pick([`Estou aqui. É o que importa.`, `Eu ainda tenho o outro. E tenho você.`])); }
      else if ((d.btl || 0) >= 2) { c.pose('p', 'sit'); yield c.say('p', pick([`Não me pergunta da guerra. Hoje não.`, `Eu vi coisas... depois eu conto. Talvez.`]), { style: 'whisper' }); }
      if (d.token) { c.pose('p', 'gift'); c.cam(['p', 'k'], { zoom: 5.4 }); yield c.say('p', pick([`Trouxe de volta. Como prometi.`, `${cap1(d.token)}. Esteve comigo o tempo todo.`]), { style: 'whisper' }); c.emote('k', 'heart', 2.4); }
    }
    c.snap(mode === 'desertor' ? 'A volta escondida' : 'A volta');
    c.attach();
    yield 2.6;
    return 'ok';
  } });

  // ---- A NOTÍCIA: the column comes home without them ----
  Sn.define('cv-noticia', { imp: 3, kick: 'A Convocação', lazy: true, doing: (sc, v) => (v.id === sc.cast.m ? 'Levando uma notícia que ninguém quer ouvir' : 'Esperando na porta'), *gen(c) {
    const s = c.story(); const k = c.v('k'); if (!s || !k) return 'sem';
    if (!c.take('k', { vital: true, keep: true, force: true })) { (c.sc.dbg = c.sc.dbg || []).push('k ' + (k.task ? k.task.type : '-') + (k.ug ? ' ug' : '') + (k.held ? ' held' : '')); return 'ocupada'; }
    const m = c.v('m'); const hasM = m && G.dist(m.x, m.y, k.x, k.y) < 50 && c.take('m', { keep: true, force: true });
    const d = s.data; const p = PD(s.protag);
    const house = k.home && G.S.buildings.get(k.home); const door = house ? G.Vg.door(house) : [k.x, k.y];
    yield c.walk('k', Sn.spot(door[0], door[1] + 0.5, 2) || door, { max: 30 });
    if (hasM) yield c.walk('m', Sn.spot(door[0] + 4, door[1] + 3.5, 2) || door, { max: 40 });
    c.ready();
    c.mood('sad');
    c.tag('k', 'quem esperou'); if (hasM) c.tag('m', d.promise === m.id ? 'quem prometeu' : 'companheir' + oa(m) + ' de armas');
    c.title('A Convocação', 'A Notícia');
    c.caption(`${cap1(d.armyName)} voltou para ${d.frontName}. ${k.name} procurou ${p ? p.name : 'um rosto'} em cada rosto da coluna.`, { hold: 3.8 });
    c.cam(['k'], { zoom: 4.2 }); c.pose('k', 'look');
    yield 3;
    if (!hasM) {
      c.caption(`Não estava lá.`, { hold: 2.4 });
      c.pose('k', 'weepk'); c.sfx('sob');
      c.snap('A notícia'); c.attach();
      yield 3.2;
      return 'ok';
    }
    c.cam(['m', 'k'], { zoom: 3.8 });
    yield c.approach('m', 'k', 1.3, { slow: true, max: 20 });
    c.face('m', 'k'); c.face('k', 'm');
    c.cam(['m', 'k'], { zoom: 4.8 });
    yield 1.8;
    c.emote('k', 'question', 2);
    yield c.say('k', pick([`Cadê ${p ? p.name : 'ele'}? Ficou pra trás? Está ferid${oa(p)}?`, `Não. Não diz nada.`]), { style: 'whisper' });
    c.pose('m', 'gift'); c.slow(0.55, 2.6);
    const promised = d.promise === m.id;
    yield c.say('m', promised ? `${p ? p.name : 'Ele'}... me fez prometer. Pediu que eu te desse isto.` : `Encontrei isto com ${p ? p.name : 'ele'}, depois. Achei que devia voltar pra você.`, { style: 'whisper' });
    if (d.token) c.caption(`${cap1(d.token)}.`, { hold: 2.4 });
    yield 2.2;
    c.pose('k', 'weepk'); c.sfx('sob');
    const how = d.died ? (d.died.cause === 'hunger' ? `Foi a fome. No cerco. Dividia o pão com quem tinha menos.` : d.died.cause === 'sick' ? `Foi a doença do acampamento. Não sofreu muito.` : d.died.battle ? `${cap1(em(d.died.battle))}. Foi rápido. Não sofreu.` : `Lutando. Até o fim.`) : `Lutando.`;
    yield c.say('m', how, { style: 'whisper' });
    const kills = p && p.kills;
    if (kills) yield c.say('m', `Derrubou ${kills} antes de cair. Vão cantar o nome ${p.g === 'f' ? 'dela' : 'dele'}.`, { style: 'whisper' });
    c.pose('m', 'kneel'); c.cam(['k', 'm'], { zoom: 5.2 });
    c.snap('A notícia'); c.attach();
    yield 3.4;
    return 'ok';
  } });
})(window.G);
