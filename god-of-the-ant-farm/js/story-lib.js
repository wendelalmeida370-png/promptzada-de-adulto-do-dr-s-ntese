'use strict';
// ============================================================
//  The first library of stories: handcrafted shapes over real facts.
//  Each archetype says who could carry a story out of a fact and how strongly, how the story moves
//  as the world moves, how its people spend a little of their free time, and how it can end.
//  The storylets are the words: small beats with variants (some by culture), reused by the archetypes.
//  (Prepared for later, not written yet because the world does not make their facts well enough:
//   redemption and honour, love across peoples, mysteries with secrets and false trails.)
// ============================================================
(function (G) {
  const St = G.Stories;
  const W = G.W;
  const P = id => (id ? G.person(id) : null);
  const alive = id => !!(id && G.S.villagers.has(id));
  const pe = v => G.Politics.persona(v);
  const has = (v, t) => (v.traits || []).includes(t);
  const facOf = v => (!v ? 0 : v.dead ? v.fac || 0 : G.Fac.idOfV(v));
  const facName = id => { const f = G.Fac.get(id); return f ? f.name : 'um povo que já não existe'; };
  const setName = id => { const s = G.S.settlements.get(id); return s ? s.name : null; };
  const atWar = (a, b) => !!(a && b && a !== b && G.Fac.atWar(a, b));
  const peopleOf = v => (!v ? 0 : v.captive ? v.captive.from : facOf(v)); // (a captive still belongs to the people they were taken from)
  const warSince = (a, b) => { const r = a && b && a !== b ? G.Fac.rel(a, b) : null; return r && r.st === 'guerra' ? r.since : null; };
  const fighting = v => !!(v && v.task && (v.task.type === 'band' || v.task.type === 'combat' || v.task.type === 'fight'));
  const REL_W = { pai: 1, mae: 1, filho: 1, filha: 1, companheiro: 0.9, companheira: 0.9, irmao: 0.72, irma: 0.72 };
  const REL_POSS = { pai: 'seu pai', mae: 'sua mãe', filho: 'seu filho', filha: 'sua filha', companheiro: 'seu companheiro', companheira: 'sua companheira', irmao: 'seu irmão', irma: 'sua irmã' };
  const deathTxt = id => { const r = P(id); return r && r.dead ? G.Village.deathText(r) : 'morreu'; };
  const free = v => v && !v.dead && !v.captive && !v.held && !v.aboard && v.hp > 55 && v.hunger < 60 && v.energy > 35;
  const homeSafe = v => !(G.War && G.War.threat && G.War.threat(v.set));
  const art = name => (/^(a |o |os |as )/.test(name) ? '' : /^(Lagoa|Cachoeira|Agulha|Garganta|Trilha|Escadaria|Subida|Portela|Gruta|Lapa|Furna|Toca|Caverna|Queda|Serra|Cordilheira|Pedra)/.test(name) ? 'a ' : 'o ');
  // a place's name with its article ('o Pico do Lobo', 'a Gruta do Eco', 'o mar'), and the contractions
  const withArt = name => (!name ? name : /^(o|a|os|as) /.test(name) ? name : art(name) + name);
  const deArt = name => { const n = withArt(name); return n.replace(/^o /, 'do ').replace(/^a /, 'da ').replace(/^os /, 'dos ').replace(/^as /, 'das '); };
  const em = name => { const n = withArt(name); return n.replace(/^o /, 'no ').replace(/^a /, 'na ').replace(/^os /, 'nos ').replace(/^as /, 'nas '); };
  const ao = name => { const n = withArt(name); return n.replace(/^o /, 'ao ').replace(/^a /, 'à ').replace(/^os /, 'aos ').replace(/^as /, 'às '); };
  const titled = name => { const n = withArt(name) || ''; const a = n.match(/^(o|a|os|as) /); return (a ? a[1] + ' ' : '') + capName(n.replace(/^(o|a|os|as) /, '')); };
  const capName = name => (name ? name.charAt(0).toUpperCase() + name.slice(1) : name);
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const K = (k, d) => St.storylet(k, d);

  // ====================================================================================
  //  VINGANÇA — someone close killed by a known hand; the one who killed still lives
  // ====================================================================================
  K('vg-crianca', { text: [
    c => `${c.P}, com ${c.age} anos, viu ${c.REL}, ${c.V}, morrer pelas mãos de ${c.T}${c.at}. Nunca esqueceu aquele rosto.`,
    c => `${c.P} era criança quando viu ${c.T} matar ${c.REL}, ${c.V}${c.at ? ',' + c.at : ''}. Guardou aquele nome como quem guarda uma pedra no bolso.`,
  ] });
  K('vg-juramento', { text: [
    c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Naquela noite, jurou vingança.`,
    c => `${c.T} matou ${c.REL}, ${c.V}, diante dos olhos de ${c.P}${c.at}. ${c.P} jurou que ${c.T} pagaria.`,
  ], civ: {
    nordico: [c => `${c.P} viu ${c.REL}, ${c.V}, tombar diante de ${c.T}${c.at}. Jurou sobre o machado de ${c.V} que ${c.T} pagaria com sangue.`],
    romano: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou diante dos deuses da casa que ${c.V} seria vingad${c.oV}.`],
    egipcio: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou diante de Maat que o coração de ${c.T} seria pesado.`],
    asteca: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou ao Sol que o sangue de ${c.T} correria.`],
    grego: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou pelas Erínias que ${c.T} não escaparia.`],
  } });
  K('vg-noticia', { text: [
    c => `${c.V} foi mort${c.oV} por ${c.T}${c.at}. Quando a notícia chegou, ${c.P} jurou que ${c.T} pagaria.`,
    c => `A notícia chegou antes do corpo: ${c.T} tinha matado ${c.REL}, ${c.V}${c.at ? ',' + c.at : ''}. ${c.P} não chorou; prometeu.`,
  ] });
  K('vg-execucao', { text: [
    c => c.s.data.saw ? `${c.V} foi executad${c.oV} por ordem de ${c.T}. ${c.P} assistiu calad${c.o} — e guardou o ódio.` : `${c.V} foi executad${c.oV} por ordem de ${c.T}. ${c.P} soube, e guardou o ódio.`,
  ] });
  K('vg-cresceu', { text: [c => `${c.P} cresceu. A lembrança de ${c.V} cresceu junto.`, c => `Os anos passaram, mas ${c.P} não esqueceu ${c.T}.`] });
  K('vg-treino', { text: [
    c => `${c.P} começou a treinar com a lança nas horas livres: queria estar pront${c.o} quando chegasse a hora.`,
    c => `${c.P} passou a treinar com os guerreiros ${c.cityNow ? 'de ' + c.cityNow : ''} no fim do dia.`,
  ] });
  K('vg-guerra', { text: [
    c => c.FP !== c.FT ? `${c.FP} e ${c.FT} voltaram a guerrear. Para ${c.P}, era a chance que esperava.` : null,
    c => c.FP !== c.FT ? `Veio a guerra entre ${c.FP} e ${c.FT}. ${c.T} ainda estava viv${c.oT}.` : null,
    c => c.FP === c.FT ? `Os dois lados de ${c.FP} pegaram em armas um contra o outro. Para ${c.P}, era a chance que esperava.` : null,
  ] });
  K('vg-parte', { text: [c => `${c.P} partiu com o exército de ${c.FP}${c.DEST ? ' rumo a ' + c.DEST : ''}.`] });
  K('vg-mesmo-campo', { text: [c => `${c.P} e ${c.T} estavam no mesmo campo de batalha${c.at}.`, c => `No meio da batalha${c.at}, ${c.P} e ${c.T} ficaram frente a frente.`] });
  K('vg-alvo-cativo', { text: [c => `${c.T} caiu cativ${c.oT} nas mãos do povo de ${c.P}${c.city ? ' e está em ' + c.city : ''}.`] });
  K('vg-conspira', { text: [c => `${c.P} entrou na conspiração contra ${c.T}.`, c => `Quando começaram a conspirar contra ${c.T}, ${c.P} foi d${c.o === 'a' ? 'as' : 'os'} primeir${c.o}s a pegar em armas.`] });
  K('vg-de-novo', { text: [c => `${c.P} e ${c.T} voltaram a se cruzar numa batalha${c.at}.`] });
  K('vg-paz', { text: [c => `${c.FP} e ${c.FT} fizeram as pazes. ${c.T} ficou fora de alcance.`] });
  K('vg-cumprida', { text: [
    c => `${c.P} matou ${c.T}${c.at}. ${c.V} estava vingad${c.oV}.`,
    c => c.yrs > 2 ? `Depois de ${c.an(c.yrs)}, ${c.P} encontrou ${c.T}${c.at} — e foi ${c.P} quem saiu viv${c.o}.` : null,
  ] });
  K('vg-outro', { text: [c => c.MET ? `Na mesma luta, foi ${c.K} quem derrubou ${c.T}. ${c.P} chegou tarde.` : c.SAME ? `${c.T} caiu${c.at} diante de ${c.K}. ${c.P} não estava lá.` : `${c.T} morreu pelas mãos de ${c.K}${c.at}, longe de ${c.P}. A vingança não aconteceu.`] });
  K('vg-velhice', { text: [c => `${c.T} morreu de velhice. ${c.P} ficou com a promessa na mão e ninguém para cumpri-la.`] });
  K('vg-acaso', { text: [c => `${c.T} ${c.DEATH}. Ninguém cobrou a dívida.`] });
  K('vg-morto-pelo-alvo', { text: [
    c => c.CAUSE === 'execution' ? `${c.T} mandou executar também ${c.P}.` : `${c.T} matou também ${c.P}${c.at}.`,
    c => c.CAUSE !== 'execution' ? `${c.P} caiu diante de ${c.T}, como ${c.V} antes.` : null,
  ] });
  K('vg-morreu', { text: [c => `${c.P} ${c.DEATH} sem ver ${c.T} pagar.`] });
  K('vg-esquecer', { text: [c => (c.age < 58 ? `Os anos de paz apagaram a raiva. ${c.P} deixou a lança encostada e cuidou dos seus.` : null), c => (c.age >= 58 ? `${c.P} envelheceu. A promessa ficou para trás, como ${c.V}.` : null)] });
  K('vg-oracao', { text: [c => `${c.P} trocou a vingança pela prece: decidiu rezar por ${c.V} em vez de caçar ${c.T}.`] });

  St.define('vinganca', {
    name: 'Vingança', icon: 'sword', tone: 'sombrio', tags: ['vingança', 'família'], struct: 'perda-perseguicao', seedLife: 5, maxDays: 90, ripe: 0.6,
    on: {
      morte(f) {
        if (!f.b || !{ war: 1, arrow: 1, massacre: 1, execution: 1, coup: 1 }[f.cause]) return null;
        if (!alive(f.b)) return null; // a revenge needs someone to take it on
        const killer = P(f.b), victim = P(f.a); if (!victim) return null;
        const out = [];
        for (const pid of f.kn) { // only those who know who did it: they saw it, or the hand was famous
          const p = P(pid); if (!p || p.dead || pid === f.b || p.age < 5) continue;
          const rel = St.relOf(p, victim); if (!rel || !REL_W[rel]) continue;
          const q = pe(p);
          // the same loss, other answers: the gentle devout pray; the fearful keep away
          if (q.pie > 0.68 && q.agg < 0.38) continue;
          if (has(p, 'Medroso') && q.agg < 0.45) continue;
          const saw = f.w.includes(pid);
          let sc = REL_W[rel] * (saw ? 1 : 0.62) * (0.42 + q.agg * 0.62 + (has(p, 'Corajoso') ? 0.15 : 0) + q.cru * 0.1);
          if (p.age < 16) sc *= 1.06; else if (p.age > 55) sc *= 0.5;
          if (killer.hero || killer.reigned) sc *= 1.12;
          if (sc < 0.36) continue;
          const w = St.where(f.x, f.y);
          out.push({
            protag: pid, score: Math.min(1, sc), keyExtra: f.a,
            cast: { victim: f.a, target: f.b }, place: { kind: 'lugar', name: w.name, x: f.x, y: f.y, town: !!w.town },
            data: { rel, saw, at: w.at, ft: facOf(killer), cause: f.cause, oath: Math.floor(p.age), names: { [f.a]: f.n.a, [f.b]: f.n.b } },
            motifs: ['rel:' + rel, 'gatilho:morte-violenta', 'amb:' + (f.cause === 'war' || f.cause === 'arrow' ? 'guerra' : f.cause), p.age < 16 ? 'idade:crianca' : 'idade:adulto'],
          });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => alive(sd.cast.target),
    begin(s) {
      const p = P(s.protag); s.phase = p.age < 16 ? 'crescer' : 'remoer'; s.data.peaceFrom = -1;
      s.data.war = warSince(peopleOf(p), peopleOf(P(s.cast.target)));
      const k = s.data.cause === 'execution' || s.data.cause === 'coup' ? 'vg-execucao' : p.age < 12 ? 'vg-crianca' : s.data.saw ? 'vg-juramento' : 'vg-noticia';
      St.beat(s, k, null, { x: s.place.x, y: s.place.y });
      if (G.Life) G.Life.bio(p, 'note', `Jurou vingar ${REL_POSS[s.data.rel] || ''} ${(P(s.cast.victim) || {}).name || ''}`.replace(/\s+/g, ' ').trim());
    },
    tick(s) {
      const S = G.S; const p = P(s.protag), t = P(s.cast.target); if (!p || p.dead || !t || t.dead) return;
      const q = pe(p); const fp = peopleOf(p), ft = peopleOf(t); s.data.ft = ft;
      if (s.phase === 'crescer' && p.age >= 16) { s.phase = 'remoer'; St.beat(s, 'vg-cresceu'); }
      if (s.phase === 'remoer' && p.age >= 16 && (q.agg > 0.42 || has(p, 'Corajoso'))) s.phase = 'preparar';
      // the peoples at war again: the chance
      // (a war that flares up again within a few days is the same war, for the one waiting)
      if (atWar(fp, ft)) { const r = G.Fac.rel(fp, ft); if (r && s.data.war !== r.since) { s.data.war = r.since; s.data.peaceFrom = -1; if (!(G.S.day - (s.data.warBeat || -99) < 8)) { s.data.warBeat = G.S.day; St.beat(s, 'vg-guerra', { FP: facName(fp), FT: facName(ft) }); } } }
      else if (s.data.peaceFrom < 0 && fp !== ft) s.data.peaceFrom = S.day;
      // marching against them
      if (p.task && p.task.type === 'band' && G.War.bands) { const b = G.War.bands.get(p.task.band); if (b && b.enemy === ft && s.data.band !== b.id) { s.data.band = b.id; if (!(S.day - (s.data.parte || -99) < 5)) { s.data.parte = S.day; St.beat(s, 'vg-parte', { DEST: setName(b.set), FP: facName(fp) }); } } }
      // the same field: the world brought them together — what happens is the world's
      if (!p.captive && !t.captive && fighting(p) && fighting(t) && G.dist(p.x, p.y, t.x, t.y) < 7 && !(S.day - (s.data.met || -99) < 4)) {
        s.data.met = S.day; s.data.meets = (s.data.meets || 0) + 1; s.phase = 'confronto';
        St.beat(s, s.data.meets > 1 ? 'vg-de-novo' : 'vg-mesmo-campo', { at: St.where(p.x, p.y).at }, { x: p.x, y: p.y, hot: 30, toast: s.data.meets === 1, big: 1 });
      }
      if (t.captive && facOf(t) === facOf(p) && !s.data.caught) { s.data.caught = 1; St.beat(s, 'vg-alvo-cativo', { city: setName(t.set) }); }
      if (p.coup && G.Politics && G.Fac.get(p.coup) && G.Politics.ruler(G.Fac.get(p.coup)) === t && !s.data.plot) { s.data.plot = 1; St.beat(s, 'vg-conspira', null, { x: p.x, y: p.y, log: true, hot: 25, big: 1 }); }
      // years of peace soften a gentle heart, or turn it to prayer; old age too
      const long = s.data.peaceFrom >= 0 && S.day - s.data.peaceFrom > 18;
      if (p.age >= 18 && ((long && q.agg < 0.5) || p.age > 60) && G.R() < 0.006) {
        if (q.pie > 0.58) { St.plantFrom('peregrinacao', { protag: p.id, score: 0.75, cast: { lost: s.cast.victim }, data: { rel: s.data.rel, lost: s.cast.victim, from: s.id }, motifs: ['gatilho:transformacao'] }, s.origin[0]); St.finish(s, 'transformada', 'sereno', St.say(s, 'vg-oracao')); }
        else St.finish(s, 'abandonada', 'sereno', St.say(s, 'vg-esquecer'));
      }
    },
    react(s, f) {
      if (f.k === 'paz' && ((f.fa === s.fac && f.fb === s.data.ft) || (f.fb === s.fac && f.fa === s.data.ft))) { s.data.peaceFrom = G.S.day; St.beat(s, 'vg-paz', { FT: facName(s.data.ft) }); return true; }
      if (f.k !== 'morte') return false;
      const at = St.where(f.x, f.y).at;
      if (f.a === s.cast.target) {
        if (f.b === s.protag) St.finish(s, 'cumprida', 'agridoce', St.say(s, 'vg-cumprida', { at }), { x: f.x, y: f.y, log: true, toast: true, hot: 30, big: 1, clima: s.phase === 'confronto' ? 'duelo' : 'emboscada', legend: true });
        else if (f.b) { const k = P(f.b); St.finish(s, 'roubada', 'agridoce', St.say(s, 'vg-outro', { K: k ? k.name : 'outra mão', SAME: k && facOf(k) === s.fac, MET: s.data.met === G.S.day && P(s.protag) && G.dist(P(s.protag).x, P(s.protag).y, f.x, f.y) < 14, at }), { x: f.x, y: f.y, log: true }); }
        else if (f.cause === 'old') St.finish(s, 'roubada', 'sereno', St.say(s, 'vg-velhice'));
        else St.finish(s, 'roubada', 'sereno', St.say(s, 'vg-acaso', { DEATH: deathTxt(f.a) }));
        return true;
      }
      if (f.a === s.protag) {
        const byT = f.b === s.cast.target;
        const txt = St.say(s, byT ? 'vg-morto-pelo-alvo' : 'vg-morreu', { at, DEATH: deathTxt(f.a), CAUSE: f.cause });
        St.chapter(s, txt, { x: f.x, y: f.y, big: byT ? 1 : 0, log: byT, toast: byT });
        if (!St.bequeath(s, P(f.a), byT ? 'alvo' : 'morte')) St.finish(s, byT ? 'fracassada' : 'interrompida', 'tragico', null, { clima: byT ? 'duelo' : '' });
        return true;
      }
      return false;
    },
    // a few evenings of training, when the anger has a plan
    urge(s, v) { return s.phase === 'preparar' && v.age >= 16 && alive(s.cast.target) && !fighting(v) ? 0.16 + pe(v).agg * 0.08 : 0; },
    task(s, v, H) {
      if (!s.data.trained) { s.data.trained = 1; St.beat(s, 'vg-treino'); }
      const t = H.setTask(v, { type: 'drill', pri: 1.02, saga: s.id }); return t;
    },
    warPull: (s, v, enemy) => (alive(s.cast.target) && enemy === peopleOf(P(s.cast.target)) ? 2.6 : 0),
    foe: s => (alive(s.cast.target) ? s.cast.target : 0),
    goal: (s, c) => `Vingar ${c.V}${c.RELde ? ', ' + c.RELde + ' de ' + c.P : ''}, matando ${c.T}.`,
    status(s, c) {
      const t = P(s.cast.target);
      if (s.phase === 'crescer') return `${c.P} ainda é criança. Brinca, aprende um ofício — e lembra.`;
      if (s.phase === 'confronto') return `${c.P} e ${c.T} já se encontraram num campo de batalha.`;
      const where = t && !t.dead ? (t.captive ? `cativ${c.oT} em ${setName(t.set)}` : `vive em ${setName(t.set) || 'algum lugar'}`) : '';
      if (s.phase === 'preparar') return `${c.P} treina quando sobra tempo. ${c.T} ${where}.`;
      return `${c.P} leva a vida de sempre, mas não esqueceu. ${c.T} ${where}.`;
    },
    obstacles(s, c) {
      const out = []; const t = P(s.cast.target); const p = P(s.protag);
      if (p && p.age < 16) out.push(`${c.P} ainda é criança`);
      if (t && !t.dead && !atWar(peopleOf(p), peopleOf(t)) && peopleOf(p) !== peopleOf(t)) out.push(`${c.FP} e ${facName(peopleOf(t))} estão em paz`);
      if (t && (t.hero || (t.kills || 0) >= 4)) out.push(`${c.T} é um guerreiro temido`);
      return out;
    },
    open: (s, c) => [`encontrar ${c.T} numa batalha`, `${c.T} morrer antes, de outra forma`, `a raiva se apagar com os anos de paz`, `${c.P} morrer tentando — e alguém da família herdar a promessa`],
    heirs: {
      minAge: 12, chance: 0.45,
      fit: (s, c) => (St.knows(c.id, s.origin[0]) ? 1 : 0.7) * (0.35 + pe(c).agg * 0.85) * (has(c, 'Medroso') ? 0.4 : 1),
      text: (s, c, why) => why === 'alvo' ? `${c.H}, ${c.DEADREL}, viu a mesma mão levar mais um dos seus. A promessa passou para ${c.oH === 'a' ? 'ela' : 'ele'}.` : `${c.P} morreu sem vingar ${c.V}. ${c.H}, ${c.DEADREL}, guardou a promessa.`,
    },
    // the one the heir avenges is now the one who carried the promise, if the target killed them
    inherited(s, heir, dead, why) { if (why === 'alvo') { s.data.firstVictim = s.data.firstVictim || s.cast.victim; s.cast.victim = dead.id; } s.phase = heir.age < 16 ? 'crescer' : 'preparar'; s.data.trained = 0; },
    titles: {
      juramento: c => `O Juramento de ${c.P}`,
      sangue: c => (c.s.place && c.s.place.name && c.s.place.town ? `O Sangue de ${c.s.place.name}` : null),
      duelo: c => `${c.P} e ${c.T}`,
      divida: c => `A Dívida de ${c.T}`,
      filho: c => (c.s.data.rel === 'pai' || c.s.data.rel === 'mae' ? `${c.p.g === 'f' ? 'A Filha' : 'O Filho'} de ${c.V}` : null),
      viuva: c => (c.s.data.rel === 'companheiro' ? `A Viúva de ${c.V}` : c.s.data.rel === 'companheira' ? `O Viúvo de ${c.V}` : null),
      irmao: c => (c.s.data.rel === 'irmao' || c.s.data.rel === 'irma' ? `${c.p.g === 'f' ? 'A Irmã' : 'O Irmão'} de ${c.V}` : null),
      sombra: c => `A Sombra de ${c.T}`,
    },
    forgotten: (s, c) => `Os anos passaram, e o nome de ${c.T} deixou de doer.`,
    taskText: (s, v, t) => 'Treinando para o dia do acerto de contas',
  });

  // ====================================================================================
  //  RESGATE — someone close carried off in chains; the captive still lives, somewhere
  // ====================================================================================
  K('rs-levado', { text: [
    c => `${c.FT} levou ${c.REL}, ${c.C}, acorrentad${c.oC}${c.at}. ${c.P} ficou para trás.`,
    c => `${c.C} foi levad${c.oC} por ${c.FT}${c.at}. Desde então, ${c.P} conta os dias.`,
  ] });
  K('rs-vigia', { text: [c => `${c.P} passou a ir até a beira de ${c.cityNow || 'casa'} no fim da tarde, olhando para o lado de ${c.city}.`] });
  K('rs-mudou', { text: [c => `${c.C} foi levad${c.oC} para ${c.city}.`] });
  K('rs-guerra', { text: [c => `${c.FP} entrou em guerra contra ${c.FT}. ${c.C} ainda estava em ${c.city}.`] });
  K('rs-parte', { text: [c => `${c.P} marchou com o exército de ${c.FP} contra ${c.city}, onde ${c.C} estava.`] });
  K('rs-voltou', { text: [
    c => `${c.C} voltou para ${c.cityNow || 'casa'}. ${c.P} estava lá.`,
    c => c.yrs > 1 ? `Depois de ${c.an(c.yrs)}, ${c.C} voltou para casa — e ${c.P} ainda esperava.` : null,
  ] });
  K('rs-voltou-povo', { text: [c => `${c.C} está livre e de volta entre ${c.FP}${c.CNOW ? ', em ' + c.CNOW : ''}.`] });
  K('rs-assimilado', { text: [c => `${c.C} deixou de ser cativ${c.oC}: agora vive entre ${c.FT}, como gente de lá.`] });
  K('rs-livre-longe', { text: [c => `${c.C} está livre, mas vive ${c.CNOW ? 'em ' + c.CNOW : 'longe'}, longe de ${c.P}.`] });
  K('rs-correntes-juntos', { text: [c => `${c.P} também foi capturad${c.o} — e reencontrou ${c.C} no cativeiro, em ${c.city}.`] });
  K('rs-correntes', { text: [c => `${c.P} também foi capturad${c.o} por ${c.FT}.`] });
  K('rs-morto', { text: [c => `${c.C} ${c.DEATH} no cativeiro${c.city ? ', em ' + c.city : ''}.`] });
  K('rs-morreu', { text: [c => `${c.P} ${c.DEATH} sem rever ${c.C}.`] });

  St.define('resgate', {
    name: 'Resgate', icon: 'chain', tone: 'esperanca', tags: ['resgate', 'família'], struct: 'separacao-reencontro', seedLife: 5, maxDays: 70, ripe: 1,
    on: {
      captura(f) {
        const c = P(f.a); if (!c || c.dead || !c.captive) return null;
        const out = [];
        for (const p of St.kin(c)) {
          if (p.captive || p.age < 8 || facOf(p) === f.fb) continue;
          const rel = St.relOf(p, c); if (!rel || !REL_W[rel]) continue;
          const q = pe(p);
          let sc = REL_W[rel] * (0.42 + p.courage * 0.32 + q.agg * 0.18 + ((rel === 'companheiro' || rel === 'companheira') && has(p, 'Romântico') ? 0.15 : 0));
          if (p.age < 14) sc *= 0.85;
          if (sc < 0.38) continue;
          const w = St.where(f.x, f.y);
          out.push({ protag: p.id, score: Math.min(1, sc), keyExtra: f.a, cast: { captive: f.a }, place: { kind: 'cidade', name: f.n.set, x: f.x, y: f.y, set: f.set },
            data: { rel, ft: f.fb, city: f.set, cityName: f.n.set, at: w.at, names: { [f.a]: f.n.a } }, motifs: ['rel:' + rel, 'gatilho:captura', 'amb:guerra'] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => { const c = P(sd.cast.captive); return !!(c && !c.dead && c.captive); },
    begin(s) { s.phase = 'saudade'; s.data.war = warSince(facOf(P(s.protag)), s.data.ft); St.beat(s, 'rs-levado', null, { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const S = G.S; const p = P(s.protag), c = P(s.cast.captive); if (!p || p.dead || !c || c.dead) return;
      if (!c.captive) {
        const cn = setName(c.set);
        if (!p.dead && c.set === p.set) St.finish(s, 'reencontro', 'feliz', St.say(s, 'rs-voltou'), { x: c.x, y: c.y, log: true, toast: true });
        else if (facOf(c) === s.fac) St.finish(s, 'reencontro', 'feliz', St.say(s, 'rs-voltou-povo', { CNOW: cn }), { x: c.x, y: c.y, log: true });
        else if (facOf(c) === s.data.ft) St.finish(s, 'transformada', 'agridoce', St.say(s, 'rs-assimilado'));
        else St.finish(s, 'reencontro', 'agridoce', St.say(s, 'rs-livre-longe', { CNOW: cn }));
        return;
      }
      if (c.set !== s.data.city && setName(c.set)) { s.data.city = c.set; s.data.cityName = setName(c.set); s.data.ft = facOf(c); St.beat(s, 'rs-mudou'); }
      if (p.captive && !s.data.pcap) {
        s.data.pcap = 1;
        if (p.set === c.set) { St.finish(s, 'reencontro', 'agridoce', St.say(s, 'rs-correntes-juntos'), { log: true, x: p.x, y: p.y }); return; }
        St.beat(s, 'rs-correntes');
      }
      const fp = facOf(p), ft = facOf(c);
      if (!p.captive && atWar(fp, ft)) { const r = G.Fac.rel(fp, ft); if (r && s.data.war !== r.since) { s.data.war = r.since; if (!(G.S.day - (s.data.warBeat || -99) < 8)) { s.data.warBeat = G.S.day; St.beat(s, 'rs-guerra', { FP: facName(fp), FT: facName(ft) }); } } }
      if (p.task && p.task.type === 'band' && G.War.bands) { const b = G.War.bands.get(p.task.band); if (b && b.set === c.set && s.data.band !== b.id) { s.data.band = b.id; St.beat(s, 'rs-parte', { FP: facName(fp) }); } }
      void S;
    },
    react(s, f) {
      if (f.k !== 'morte') return false;
      if (f.a === s.cast.captive) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'rs-morto', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y, log: true }); return true; }
      if (f.a === s.protag) {
        St.chapter(s, St.say(s, 'rs-morreu', { DEATH: deathTxt(f.a) }));
        if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'tragico', null);
        return true;
      }
      return false;
    },
    // an evening now and then at the edge of town, looking the way the captive was taken
    urge(s, v) { const c = P(s.cast.captive); return v.age >= 12 && !v.captive && c && c.captive && homeSafe(v) ? 0.1 : 0; },
    task(s, v, H) {
      const c = P(s.cast.captive); const set = G.S.settlements.get(v.set), to = G.S.settlements.get(c.set); if (!set || !to) return null;
      const a = Math.atan2(to.cy - set.cy, to.cx - set.cx), r = (set.radius || 6) + 2;
      const spot = W.nearestLand(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 4); if (!spot) return null;
      if (!s.data.watched) { s.data.watched = 1; St.beat(s, 'rs-vigia'); }
      return St.go(s, v, H, { x: spot[0], y: spot[1], sub: 'vigia', dur: 10, emo: 'sad', fx: to.cx, fy: to.cy });
    },
    warPull: (s, v, enemy) => { const c = P(s.cast.captive); return c && c.captive && enemy === facOf(c) ? 2.2 : 0; },
    // a people at war with the captors goes for the city where its own are held — when the one who
    // grieves is its ruler, or kin of the ruler; otherwise only sometimes
    target(s, f, enemy) {
      const c = P(s.cast.captive); if (!c || c.dead || !c.captive || facOf(c) !== enemy.id || s.fac !== f.id) return 0;
      const ruler = P(f.leader); const close = ruler && (ruler.id === s.protag || St.relOf(ruler, c));
      return close || G.hash(s.id * 7 + G.S.day) < 0.3 ? c.set : 0;
    },
    goal: (s, c) => `Ver ${c.C}${c.REL ? ', ' + c.REL.replace(/^(seu|sua) /, '') + ' de ' + c.P : ''}, livre outra vez.`,
    status(s, c) { const cp = P(s.cast.captive); return cp && cp.captive ? `${c.C} está cativ${c.oC} em ${setName(cp.set) || '?'}, entre ${facName(facOf(cp))}. ${c.P} espera.` : ''; },
    obstacles(s, c) { const cp = P(s.cast.captive), p = P(s.protag); const out = []; if (cp && p && !atWar(facOf(p), facOf(cp))) out.push(`${c.FP} não está em guerra com quem tem ${c.C}`); if (cp) out.push(`${setName(cp.set) || 'a cidade'} é guardada`); return out; },
    open: (s, c) => [`${c.FP} atacar a cidade onde ${c.C} está`, `${c.C} fugir`, `${c.C} ser aceit${c.oC} como gente de lá`, `${c.C} morrer no cativeiro`],
    heirs: { minAge: 12, chance: 0.4, fit: (s, cand) => (St.relOf(cand, P(s.cast.captive)) ? 1 : 0.25) * (0.5 + cand.courage * 0.5), text: (s, c) => `${c.P} morreu sem rever ${c.C}. ${c.H}, ${c.DEADREL}, não desistiu.` },
    titles: {
      correntes: c => (c.s.data.rel === 'filha' ? 'A Filha das Correntes' : c.s.data.rel === 'filho' ? 'O Filho das Correntes' : null),
      por: c => `Por ${c.C}`, resgate: c => `O Resgate de ${c.C}`, as: c => `As Correntes de ${c.C}`, espera: c => `A Espera de ${c.P}`,
      caminho: c => (c.city ? `O Caminho até ${c.city}` : null),
    },
    forgotten: (s, c) => `Os anos passaram. ${c.P} parou de olhar para o lado de ${c.city || 'longe'}.`,
    taskText: (s, v, t) => (t.st < 2 ? 'Indo até a beira da vila' : `Olhando para o lado de ${(G.S.settlements.get(P(s.cast.captive) ? P(s.cast.captive).set : 0) || {}).name || 'longe'}`),
  });

  // ====================================================================================
  //  VOLTA — the road home: a captive who escapes, or a freed one who misses the old city
  // ====================================================================================
  K('vt-fugiu', { text: [
    c => `Depois de ${c.an(c.CAPT)} de cativeiro em ${c.FROM}, ${c.P} fugiu, rumo a ${c.home}.`,
    c => `${c.P} escapou de ${c.FROM} e tomou o caminho de ${c.home}.`,
  ] });
  K('vt-recapturado', { text: [c => `${c.P} foi peg${c.o} de volta antes de chegar.`, c => `Pegaram ${c.P} de novo, antes que chegasse.`] });
  K('vt-de-novo', { text: [c => `${c.P} tentou de novo.`] });
  K('vt-chegou', { text: [c => (c.KIN ? `${c.P} chegou a ${c.home}. ${c.KIN} ainda morava lá.` : `${c.P} chegou a ${c.home}. Estava em casa.`)] });
  K('vt-saudade', { text: [c => `${c.P} ajudou a fundar ${c.NEW}, longe de ${c.home}. Mas a casa de ${c.P} era ${c.home}.`] });
  K('vt-partiu', { text: [c => `${c.P} deixou ${c.cityNow || 'a vila'} para rever ${c.home}.`] });
  K('vt-reviu', { text: [c => (c.OWN ? `${c.P} voltou a ver ${c.home}. A cidade agora era de ${c.OWN}.` : `${c.P} voltou a ver ${c.home}.`)] });
  K('vt-morreu-longe', { text: [c => `${c.P} morreu${c.WHERE || ' longe'}, sem voltar a ver ${c.home}.`] });
  K('vt-morto-fuga', { text: [c => `${c.P} ${c.DEATH} durante a fuga.`] });
  K('vt-sem-casa', { text: [c => `${c.homeName} não existe mais. Não havia para onde voltar.`] });
  K('vt-sem-caminho', { text: [c => `O caminho até ${c.home} estava fechado. ${c.P} desistiu.`] });

  St.define('volta', {
    name: 'Volta para casa', icon: 'home', tone: 'esperanca', tags: ['retorno', 'esperança'], struct: 'exilio-retorno', seedLife: 3, maxDays: 50, ripe: 0,
    on: {
      fuga(f) {
        const v = P(f.a); const home = G.S.settlements.get(f.dest); if (!v || v.dead || !home) return null;
        const capt = Math.max(0, G.S.day - (f.since || G.S.day));
        // (a long road home is a story; a dash across the river is an escape)
        const from = G.S.settlements.get(f.set); const far = from ? G.dist(from.cx, from.cy, home.cx, home.cy) : 20;
        let sc = 0.42 + Math.min(0.25, capt * 0.04) + (St.kin(v).some(k => k.set === home.id) ? 0.15 : 0) + (far < 16 ? -0.18 : far > 30 ? 0.08 : 0);
        return [{ protag: v.id, score: Math.min(1, sc), keyExtra: 'fuga' + G.S.day, place: { kind: 'cidade', name: home.name, x: home.cx, y: home.cy, set: home.id },
          data: { mode: 'fuga', home: home.id, homeName: home.name, from: f.set, fromName: f.n.set, capt }, tone: 'esperanca', motifs: ['gatilho:fuga', 'amb:viagem'] }];
      },
      'povo-livre'(f) {
        const out = [];
        for (const [id, home] of f.homes || []) {
          const v = P(id); const h = G.S.settlements.get(home); if (!v || v.dead || !h || v.age < 25) continue;
          const nw = G.S.settlements.get(f.set); if (!nw || G.dist(nw.cx, nw.cy, h.cx, h.cy) < 10) continue;
          let sc = 0.36 + (v.age >= 45 ? 0.15 : 0) + (St.kin(v).some(k => k.set === h.id) ? 0.2 : 0) + (has(v, 'Romântico') || has(v, 'Sociável') ? 0.08 : 0);
          out.push({ protag: id, score: sc, keyExtra: 'livre' + home, place: { kind: 'cidade', name: h.name, x: h.cx, y: h.cy, set: h.id },
            data: { mode: 'saudade', home: h.id, homeName: h.name, homeFac: h.fac, newSet: f.set, newName: f.n.set }, tone: 'contemplativo', motifs: ['gatilho:exilio', 'amb:viagem'] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => !!G.S.settlements.get(sd.data.home),
    begin(s) {
      s.phase = s.data.mode;
      if (s.data.mode === 'fuga') St.beat(s, 'vt-fugiu', { CAPT: s.data.capt || 1, FROM: s.data.fromName || 'terra estranha' });
      else St.beat(s, 'vt-saudade', { NEW: s.data.newName });
    },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      const home = G.S.settlements.get(s.data.home);
      if (!home) { St.finish(s, 'interrompida', 'agridoce', St.say(s, 'vt-sem-casa', { homeName: s.data.homeName })); return; }
      if (s.data.mode === 'fuga') {
        if (!p.captive && p.set === home.id) {
          const k = St.kin(p).find(q => q.set === home.id); const rel = k ? St.relOf(p, k) : null;
          St.finish(s, 'cumprida', 'feliz', St.say(s, 'vt-chegou', { KIN: k ? (rel ? `${cap1(REL_POSS[rel])}, ${k.name},` : k.name) : '' }), { x: p.x, y: p.y, log: true });
          return;
        }
        if (!p.captive) { St.finish(s, 'transformada', 'agridoce', `${p.name} está livre, mas longe de ${home.name}.`); return; }
        const escaping = p.task && p.task.type === 'escape';
        if (s.phase === 'fuga' && !escaping && p.task && p.task.type === 'escorted') { s.phase = 'cativeiro'; St.beat(s, 'vt-recapturado'); }
        else if (s.phase === 'cativeiro' && escaping) { s.phase = 'fuga'; St.beat(s, 'vt-de-novo'); }
      }
    },
    react(s, f) {
      if (f.k === 'morte' && f.a === s.protag) {
        if (s.data.mode === 'fuga') St.finish(s, 'fracassada', 'tragico', St.say(s, 'vt-morto-fuga', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y });
        else St.finish(s, 'interrompida', 'agridoce', St.say(s, 'vt-morreu-longe', { WHERE: St.where(f.x, f.y).at }));
        return true;
      }
      return false;
    },
    urge(s, v) {
      if (s.data.mode !== 'saudade' || !free(v) || v.age > 74 || !homeSafe(v)) return 0;
      const home = G.S.settlements.get(s.data.home); if (!home || atWar(facOf(v), home.fac)) return 0;
      return 0.09;
    },
    task(s, v, H) {
      const home = G.S.settlements.get(s.data.home); if (!home) return null;
      const spot = W.nearestLand(home.cx + 0.5, home.cy + 0.5, 4); if (!spot) return null;
      if (!s.data.left) { s.data.left = 1; St.beat(s, 'vt-partiu'); }
      return St.go(s, v, H, { x: spot[0], y: spot[1], sub: 'viagem', dur: 12, emo: 'happy', max: 240 });
    },
    done(s, v) { const home = G.S.settlements.get(s.data.home); const own = home && s.data.homeFac && home.fac !== s.data.homeFac ? facName(home.fac) : ''; St.finish(s, 'cumprida', own ? 'agridoce' : 'feliz', St.say(s, 'vt-reviu', { OWN: own }), { x: v.x, y: v.y, log: true }); },
    blocked(s) { s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) St.finish(s, 'interrompida', 'agridoce', St.say(s, 'vt-sem-caminho')); },
    goal: (s, c) => `Chegar a ${c.home}.`,
    status(s, c) { const p = P(s.protag); if (!p) return ''; if (s.data.mode === 'fuga') return p.captive && s.phase === 'cativeiro' ? `${c.P} foi recapturad${c.o}, mas não esqueceu o caminho.` : `${c.P} está em fuga, a caminho de ${c.home}.`; return `${c.P} vive em ${setName(p.set) || '?'}, e pensa em ${c.home}.`; },
    obstacles(s, c) { const home = G.S.settlements.get(s.data.home), p = P(s.protag); const out = []; if (s.data.mode === 'fuga') out.push('os guardas de quem o mantinha cativo'); if (home && p && atWar(facOf(p), home.fac)) out.push(`${c.home} pertence a um povo em guerra com ${c.FP}`); return out; },
    open: (s, c) => [`chegar a ${c.home}`, s.data.mode === 'fuga' ? `ser recapturad${c.o}` : 'fazer de outro lugar a sua casa', 'morrer no caminho'],
    titles: {
      volta: c => 'O Caminho de Volta', de: c => `De Volta a ${c.home}`, estrada: c => `A Longa Estrada de ${c.P}`,
      saudade: c => (c.s.data.mode === 'saudade' ? `Saudade de ${c.home}` : null), fuga: c => (c.s.data.mode === 'fuga' ? `A Fuga de ${c.P}` : null),
    },
    forgotten: (s, c) => `${c.P} acabou fazendo de outro lugar a sua casa.`,
    taskText: (s, v, t) => (t.st < 2 ? `A caminho de ${(G.S.settlements.get(s.data.home) || {}).name || 'casa'}` : `Revendo ${(G.S.settlements.get(s.data.home) || {}).name || 'a cidade antiga'}`),
  });

  // ====================================================================================
  //  RECONQUISTA — a ruler who lost a city; the loss leans on the choices a ruler already makes
  // ====================================================================================
  K('rq-perda', { text: [
    c => `${c.city} caiu para ${c.FT}${c.s.data.cap ? ' — e era a capital' : ''}. ${c.TITLE ? cap1(c.TITLE) + ' ' : ''}${c.P} não esqueceu.`,
    c => pe(c.p).amb >= 0.5 ? `${c.FT} tomou ${c.city}. ${c.P}, que governava ${c.FP}, jurou que a cidade voltaria.` : null,
  ] });
  K('rq-guerra', { text: [c => `${c.FP} voltou a guerrear com ${c.FT}. ${c.P} queria ${c.city} de volta.`] });
  K('rq-declarou', { text: [c => `${c.P} declarou guerra a ${c.FT}. O motivo tinha nome: ${c.city}.`] });
  K('rq-marcha', { text: [c => `O exército de ${c.FP} marchou contra ${c.city}.`] });
  K('rq-retomada', { text: [c => `${c.city} voltou a ser de ${c.FP}${c.alive ? ', e ' + c.P + ' viveu para ver' : ''}.`] });
  K('rq-queda', { text: [c => `${c.FP} deixou de existir. ${c.city} ficou para sempre com ${c.FT}.`] });
  K('rq-aceitou', { text: [c => `Os anos de paz com ${c.FT} pesaram mais. ${c.P} deixou ${c.city} para os cronistas.`] });
  K('rq-sumiu', { text: [c => `${c.city} foi abandonada. Não havia mais o que retomar.`] });
  K('rq-deposto', { text: [c => `${c.P} perdeu o poder. A obsessão por ${c.city} ficou sem trono.`] });
  K('rq-novo-dono', { text: [c => `${c.city} passou para ${c.FT}.`] });
  K('rq-esquecida', { text: [c => `${c.P} morreu sem retomar ${c.city}. Quem veio depois tinha outras guerras.`] });

  St.define('reconquista', {
    name: 'Reconquista', icon: 'crown', tone: 'epico', ripe: 1, tags: ['política', 'guerra', 'legado'], struct: 'perda-retomada', seedLife: 6, maxDays: 90,
    on: {
      conquista(f) {
        const old = G.Fac.get(f.fa); if (!old || !old.alive) return null;
        const r = P(old.leader); if (!r || r.dead || r.captive) return null; // whoever governs what is left of the people
        const q = pe(r);
        const sc = 0.42 + (f.cap ? 0.25 : 0) + q.amb * 0.25 + q.agg * 0.15;
        return [{ protag: r.id, score: Math.min(1, sc), keyExtra: 'city' + f.set, place: { kind: 'cidade', name: f.n.set, x: f.x, y: f.y, set: f.set },
          data: { city: f.set, cityName: f.n.set, ft: f.fb, fp: f.fa, cap: f.cap }, motifs: ['gatilho:conquista', 'amb:politica'] }];
      },
    },
    valid: sd => { const s = G.S.settlements.get(sd.data.city); const f = G.Fac.get(sd.data.fp); return !!(s && f && f.alive && s.fac !== f.id && f.leader === sd.protag); },
    begin(s) { s.phase = 'obsessao'; s.data.war = warSince(s.data.fp, s.data.ft); St.beat(s, 'rq-perda', null, { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const S = G.S; const city = S.settlements.get(s.data.city); const fp = G.Fac.get(s.data.fp);
      if (!city) { St.finish(s, 'interrompida', 'agridoce', St.say(s, 'rq-sumiu')); return; }
      if (!fp || !fp.alive) return; // the fall of the people comes as a fact
      if (city.fac === fp.id) { St.finish(s, 'cumprida', 'feliz', St.say(s, 'rq-retomada'), { x: city.cx, y: city.cy, log: true, toast: true, legend: true }); return; }
      if (city.fac !== s.data.ft) { s.data.ft = city.fac; St.beat(s, 'rq-novo-dono'); }
      const p = P(s.protag);
      if (s.data.waitHeir) { if (S.day - s.data.waitHeir > 3) St.finish(s, 'esquecida', 'sereno', St.say(s, 'rq-esquecida')); return; }
      if (p && !p.dead && fp.leader !== p.id) { St.finish(s, 'interrompida', 'agridoce', St.say(s, 'rq-deposto')); return; }
      if (atWar(fp.id, city.fac)) { const r = G.Fac.rel(fp.id, city.fac); if (r && s.data.war !== r.since) { s.data.war = r.since; s.data.peaceFrom = -1; if (!s.data.declared) St.beat(s, 'rq-guerra'); s.data.declared = 0; } }
      else if (!(s.data.peaceFrom >= 0)) s.data.peaceFrom = S.day;
      for (const b of G.War.bands ? G.War.bands.values() : []) if (b.fac === fp.id && b.set === city.id && s.data.band !== b.id) { s.data.band = b.id; if (!(G.S.day - (s.data.marcha || -99) < 5)) { s.data.marcha = G.S.day; St.beat(s, 'rq-marcha', null, { x: city.cx, y: city.cy }); } }
      if (p && !p.dead && s.data.peaceFrom >= 0 && S.day - s.data.peaceFrom > 25 && pe(p).amb < 0.5 && G.R() < 0.006) St.finish(s, 'abandonada', 'sereno', St.say(s, 'rq-aceitou'));
    },
    react(s, f) {
      if (f.k === 'queda' && f.fac === s.data.fp) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'rq-queda'), { log: true }); return true; }
      if (f.k === 'guerra' && f.story === s.id) { s.data.declared = 1; St.beat(s, 'rq-declarou'); return true; }
      if (f.k === 'morte' && f.a === s.protag) { s.data.waitHeir = G.S.day; s.data.dead = f.a; return true; }
      // the crown passes: kin of the one who lost the city may take up the obsession with it
      if (f.k === 'coroa' && f.fac === s.data.fp && s.data.waitHeir) {
        const heir = P(f.a), dead = P(s.data.dead);
        const kin = heir && dead && St.relOf(heir, dead);
        if (heir && kin && G.R() < 0.35 + pe(heir).amb * 0.4) {
          St.chapter(s, `${dead.name} morreu sem retomar ${s.data.cityName}. ${heir.name}, que herdou a coroa, herdou também a obsessão.`, { log: true, big: 1, k: 'heranca' });
          s.prev.push(s.protag); s.protag = heir.id; s.gen++; s.data.waitHeir = 0; St.reindex();
          G.Life && G.Life.bio(heir, 'note', `Herdou a obsessão por ${s.data.cityName}`);
        } else St.finish(s, 'esquecida', 'sereno', St.say(s, 'rq-esquecida'));
        return true;
      }
      return false;
    },
    // the war a ruler leans to: a little more will to fight the people who holds the city, and its name as the reason
    lean(s, a, b) {
      const city = G.S.settlements.get(s.data.city); if (!city || a.id !== s.data.fp || b.id !== city.fac || a.leader !== s.protag) return null;
      return { w: 0.1 + pe(P(s.protag)).amb * 0.15, why: 'reconquista', city: city.name, story: s.id };
    },
    target(s, f, enemy) { const city = G.S.settlements.get(s.data.city); return city && f.id === s.data.fp && city.fac === enemy.id ? city.id : 0; },
    goal: (s, c) => `Devolver ${c.city} a ${c.FP}.`,
    status(s, c) { const city = G.S.settlements.get(s.data.city); return city ? `${c.city} pertence a ${facName(city.fac)}. ${c.P} governa ${c.FP}${atWar(s.data.fp, city.fac) ? ', e os dois povos estão em guerra' : ''}.` : ''; },
    obstacles(s, c) { const city = G.S.settlements.get(s.data.city); const out = []; if (city) { if (!atWar(s.data.fp, city.fac)) out.push('a paz entre os dois povos'); if (city.walls) out.push(`as muralhas de ${c.city}`); } return out; },
    open: (s, c) => [`uma guerra para retomar ${c.city}`, 'a paz fazer a perda ser aceita', `${c.P} morrer e a obsessão passar — ou não — ao herdeiro`],
    titles: { coroa: c => `A Coroa de ${c.city}`, volta: c => `De Volta a ${c.city}`, perdida: c => `${c.city} Perdida`, trono: c => `O Trono sem ${c.city}`, promessa: c => `A Promessa de ${c.P}` },
    forgotten: (s, c) => `Ninguém mais em ${c.FP} falava em retomar ${c.city}.`,
  });

  // ====================================================================================
  //  SONHO — a child hears a tale about a real place far away, and wants to see it
  // ====================================================================================
  K('sn-ouviu', { text: [
    c => `${c.P}, aos ${c.AGE} anos, ouviu ${c.TELLER} contar sobre ${c.X}. Desde então quis ver com os próprios olhos.`,
    c => `Junto à fogueira, ${c.TELLER} falou ${deArt(c.X)}. ${c.P} tinha ${c.AGE} anos e nunca mais tirou aquilo da cabeça.`,
  ] });
  K('sn-cresceu', { text: [c => `${c.P} cresceu sem esquecer ${c.X}.`] });
  K('sn-partiu', { text: [c => `${c.P} deixou ${c.cityNow || 'a vila'} e partiu rumo ${ao(c.X)}.`] });
  K('sn-chegou', { text: [
    c => c.KIND === 'mar' ? `${c.P} chegou ao mar de que tanto ouvira falar. Ficou muito tempo olhando as ondas.` : null,
    c => c.KIND === 'pico' ? `${c.P} chegou ao pé ${c.DE} e ficou olhando para cima por muito tempo.` : null,
    c => c.KIND === 'caverna' ? `${c.P} chegou à boca ${c.DE} e olhou para dentro do escuro.` : null,
    c => !/^(mar|pico|caverna)$/.test(c.KIND) ? `${c.P} enfim chegou ${ao(c.X)}${c.yrs > 2 ? ', depois de ' + c.an(c.yrs) + ' sonhando' : ''}.` : null,
  ] });
  K('sn-envelheceu', { text: [c => `${c.P} envelheceu sem ver ${c.X}.`] });
  K('sn-nunca-viu', { text: [c => `${c.P} morreu sem ver ${c.X}.`] });
  K('sn-morreu-caminho', { text: [c => `${c.P} ${c.DEATH} a caminho ${deArt(c.X)}.`] });
  K('sn-sem-caminho', { text: [c => `O caminho até ${c.X} estava fechado. ${c.P} acabou desistindo.`] });
  K('sn-epilogo', { text: [c => `${c.P} morreu${c.WHERE ? ' em ' + c.WHERE : ''}, ${c.an(c.SINCE)} depois de ver ${c.X}.`] });

  function placeAlive(pl) {
    if (!pl) return false;
    if (pl.kind === 'caverna' && G.Caves) { const cv = G.Caves.get(pl.ref); return !!(cv && cv.mouths && cv.mouths.length); }
    if (pl.kind === 'maravilha') return G.S.buildings.has(pl.ref);
    return true;
  }
  St.define('sonho', {
    name: 'Sonho', icon: 'eye', tone: 'contemplativo', tags: ['exploração', 'sonho'], struct: 'desejo-jornada', seedLife: 6, maxDays: 120,
    on: {
      conto(f) {
        const pl = f.place; if (!pl) return null; const out = [];
        for (const id of f.kids || []) {
          const v = P(id); if (!v || v.dead || v.age < 6 || v.age >= 18) continue;
          const curious = has(v, 'Curioso'); if (!curious && !(pe(v).amb > 0.62 && v.age < 14)) continue;
          // (a place across the water is a tale, not a road: only what can be walked to becomes a wish to go)
          const set = G.S.settlements.get(v.set); const lp = W.nearestLand(pl.x, pl.y, 4) || [pl.x, pl.y];
          if (!set || G.dist(set.cx, set.cy, pl.x, pl.y) < 12 || !W.sameLand(set.cx, set.cy, lp[0], lp[1])) continue;
          const sc = 0.32 + (curious ? 0.25 : 0) + (v.age < 12 ? 0.08 : 0) + (pl.kind === 'mar' ? 0.06 : 0);
          out.push({ protag: id, score: sc, keyExtra: 'pl' + Math.round(pl.x) + ':' + Math.round(pl.y), place: Object.assign({}, pl), cast: { teller: f.a },
            data: { teller: f.a, tellerName: f.n.a, heard: Math.floor(v.age), home: v.set, names: { [f.a]: f.n.a } }, motifs: ['gatilho:conto', 'amb:viagem', 'lugar:' + pl.kind] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => placeAlive(sd.place),
    begin(s) { s.place.name = withArt(s.place.name); const p = P(s.protag); s.phase = p.age < 16 ? 'sonhar' : 'esperar'; St.beat(s, 'sn-ouviu', { TELLER: s.data.tellerName || 'um velho', AGE: s.data.heard }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      if (!placeAlive(s.place)) { St.finish(s, 'interrompida', 'agridoce', `${capName(s.place.name)} já não existe.`); return; }
      if (s.phase === 'sonhar' && p.age >= 16) { s.phase = 'esperar'; St.beat(s, 'sn-cresceu'); }
      if (s.phase === 'esperar' && p.age > 64 && !s.data.went && G.R() < 0.01) {
        St.chapter(s, St.say(s, 'sn-envelheceu'));
        if (!St.bequeath(s, p, 'velho')) St.finish(s, 'esquecida', 'agridoce', null);
      }
    },
    react(s, f) {
      if (f.k !== 'morte' || f.a !== s.protag) return false;
      if (s.data.onRoad) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'sn-morreu-caminho', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y }); return true; }
      St.chapter(s, St.say(s, 'sn-nunca-viu'));
      if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'esquecida', 'agridoce', null);
      return true;
    },
    // years later, the one who saw it dies: the story gets its last line
    after(s, f) {
      if (f.k !== 'morte' || f.a !== s.protag || s.end.k !== 'cumprida' || s.data.epi) return false;
      s.data.epi = 1; const r = P(f.a);
      s.chapters.push({ d: G.S.day, txt: St.say(s, 'sn-epilogo', { WHERE: setName((r && r.set) || 0) || '', SINCE: Math.max(1, G.S.day - s.end.d) }), k: 'epilogo' });
      return true;
    },
    urge(s, v) {
      if (s.phase !== 'esperar' || !free(v) || v.age < 16 || v.age > 66 || !homeSafe(v)) return 0;
      const own = G.Fac.ownerAt ? G.Fac.ownerAt(s.place.x | 0, s.place.y | 0) : 0; if (own && atWar(facOf(v), own)) return 0;
      return 0.11 + (has(v, 'Curioso') ? 0.05 : 0);
    },
    task(s, v, H) {
      if (!s.data.left) { s.data.left = 1; St.beat(s, 'sn-partiu'); }
      s.data.onRoad = 1;
      return St.go(s, v, H, { x: s.place.x, y: s.place.y, sub: 'viagem', dur: 14, emo: 'happy', fx: s.place.x, fy: s.place.y - 1, max: 260 });
    },
    done(s, v) {
      s.data.onRoad = 0; s.data.went = 1; s.data.saw = 1;
      St.finish(s, 'cumprida', 'feliz', St.say(s, 'sn-chegou', { KIND: s.place.kind, DE: deArt(s.place.name) }), { x: v.x, y: v.y, log: true, hot: 20 });
    },
    blocked(s) { s.data.onRoad = 0; s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) St.finish(s, 'interrompida', 'agridoce', St.say(s, 'sn-sem-caminho')); },
    goal: (s, c) => `Ver ${c.X} com os próprios olhos.`,
    status(s, c) { const p = P(s.protag); if (!p) return ''; if (s.phase === 'sonhar') { const at = St.where(s.place.x, s.place.y).at.trim(); const self = at.includes(s.place.name.replace(/^(o|a|os|as) /, '')); return `${c.P} ainda é criança. ${capName(c.X)} fica longe${self || !at ? (c.cityNow ? ' de ' + c.cityNow : '') : ', ' + at}.`; } return s.data.onRoad ? `${c.P} está a caminho ${deArt(c.X)}.` : `${c.P} vive em ${setName(p.set) || '?'} e ainda pensa em ${c.X}.`; },
    obstacles(s, c) { const p = P(s.protag); const out = []; if (p && p.age < 16) out.push(`${c.P} é jovem demais para viajar sozinh${c.o}`); if (p && G.War.threat && G.War.threat(p.set)) out.push('a guerra perto de casa'); return out; },
    open: (s, c) => [`chegar ${ao(c.X)}`, 'envelhecer sem ir', 'passar o sonho a um filho'],
    heirs: { minAge: 10, chance: 0.5, fit: (s, c) => (has(c, 'Curioso') ? 1 : 0.35) * (c.age < 50 ? 1 : 0.4), text: (s, c, why) => `${c.P} ${why === 'velho' ? 'envelheceu' : 'morreu'} sem ver ${c.X}. ${c.H}, ${c.DEADREL}, decidiu ir no lugar ${c.del}.` },
    inherited(s, heir) { s.phase = heir.age < 16 ? 'sonhar' : 'esperar'; s.data.left = 0; s.data.fail = 0; },
    titles: {
      sonho: c => `O Sonho de ${c.P}`, e: c => `${c.P} e ${titled(c.X)}`, caminho: c => `O Caminho até ${titled(c.X)}`,
      alem: c => (c.cityNow ? `Além de ${c.cityNow}` : null),
    },
    retitle(s, c) {
      if (!s.end || s.end.k === 'cumprida' || s.data.saw) return null;
      const n = withArt(c.X); const a = n.match(/^(o|a) /); const base = n.replace(/^(o|a) /, '');
      return `${a ? a[1].toUpperCase() + ' ' : ''}${capName(base)} que ${c.P} Nunca Viu`;
    },
    forgotten: (s, c) => `A vida foi acontecendo, e ${c.X} ficou para depois — para sempre.`,
    taskText: (s, v, t) => (t.st < 2 ? `Viajando para ver ${s.place.name}` : `Olhando ${s.place.name}, enfim`),
  });

  // ====================================================================================
  //  PEREGRINAÇÃO — the devout answer a loss with a road to a holy place that really exists
  // ====================================================================================
  K('pg-promessa', { text: [
    c => c.ALT ? `${c.L} foi mort${c.oL} por ${c.KILLER}. ${c.P} não pegou em armas: prometeu ir até ${c.X} rezar por ${c.oL === 'a' ? 'ela' : 'ele'}.` : null,
    c => !c.ALT ? `${c.P} perdeu ${c.REL}, ${c.L}. Prometeu ir até ${c.X} rezar por ${c.oL === 'a' ? 'ela' : 'ele'}.` : null,
  ] });
  K('pg-virou', { text: [
    c => `Em vez de cobrar o sangue de ${c.L}, ${c.P} prometeu ir até ${c.X} rezar por ${c.oL === 'a' ? 'ela' : 'ele'}.`,
    c => `${c.P} guardou a lança. Ia até ${c.X}, rezar por ${c.L}.`,
  ] });
  K('pg-partiu', { text: [c => `${c.P} partiu em peregrinação ${ao(c.X)}.`] });
  K('pg-rezou', { text: [
    c => c.WAS ? `${c.P} subiu até ${c.X}, onde ${c.L} ouvia a voz dos céus, e rezou por ${c.oL === 'a' ? 'ela' : 'ele'} ali mesmo.` : null,
    c => !c.WAS && c.ORACLE ? `${c.P} subiu até ${c.X}, onde ${c.ORACLE} ouve a voz dos céus, e rezou por ${c.L}.` : null,
    c => !c.WAS && !c.ORACLE ? `${c.P} rezou diante ${c.DE} por ${c.L}.` : null,
  ], civ: {
    egipcio: [c => (c.WAS ? null : `${c.P} chegou ${ao(c.X)}, deixou pão e cerveja e pediu que ${c.L} atravessasse em paz.`)],
    nordico: [c => (c.WAS ? null : `${c.P} chegou ${ao(c.X)} e pediu que ${c.L} tivesse lugar à mesa dos que já partiram.`)],
  } });
  K('pg-morreu', { text: [c => `${c.P} ${c.DEATH} sem chegar ${ao(c.X)}.`] });
  K('pg-sem-caminho', { text: [c => `O caminho até ${c.X} estava fechado. ${c.P} rezou de longe.`] });
  K('pg-sem-lugar', { text: [c => `${capName(c.X)} já não existe. A promessa ficou sem lugar.`] });

  function holyFor(v) {
    const S = G.S; const fid = facOf(v); const out = [];
    if (G.Caves) for (const cv of G.Caves.all()) if (cv.oracle && cv.known && cv.known[fid] && cv.mouths.length) { const m = cv.mouths[0]; out.push({ kind: 'oraculo', name: G.Caves.a(cv), x: m.x + 0.5, y: m.y + 0.5, ref: cv.id, oracle: cv.oracle.name, w: 3 }); }
    for (const b of S.buildings.values()) {
      if (!b.built) continue; const s = S.settlements.get(b.set); if (!s || s.fac !== fid || s.id === v.set) continue;
      if (b.type === 'maravilha') { const c = G.Village.center(b); out.push({ kind: 'maravilha', name: `a maravilha de ${s.name}`, x: c[0], y: c[1] + 2, ref: b.id, w: 2.5 }); }
      else if (b.type === 'temple' && G.Fac.capitalOf(fid) === s) { const c = G.Village.frontTile(b); out.push({ kind: 'templo', name: `o templo de ${s.name}`, x: c[0], y: c[1], ref: b.id, w: 1.5 }); }
      else if (b.type === 'monument') { const c = G.Village.frontTile(b); out.push({ kind: 'monumento', name: `o monumento de ${s.name}`, x: c[0], y: c[1], ref: b.id, w: 1 }); }
    }
    const far = out.filter(h => G.dist(h.x, h.y, v.x, v.y) > 7 && W.sameLand(h.x, h.y, v.x, v.y));
    far.sort((a, b) => b.w - a.w || G.dist(a.x, a.y, v.x, v.y) - G.dist(b.x, b.y, v.x, v.y));
    return far[0] || null;
  }
  function holyAlive(h) { if (!h) return false; if (h.kind === 'oraculo') { const cv = G.Caves && G.Caves.get(h.ref); return !!(cv && cv.mouths.length); } return G.S.buildings.has(h.ref); }
  St.define('peregrinacao', {
    name: 'Peregrinação', icon: 'faith', tone: 'contemplativo', tags: ['fé', 'luto'], struct: 'perda-oracao', seedLife: 4, maxDays: 45,
    on: {
      morte(f) {
        const victim = P(f.a); if (!victim) return null; const out = [];
        for (const p of St.kin(victim)) {
          if (p.dead || p.age < 16 || p.captive) continue;
          const q = pe(p); if (!(q.pie >= 0.66 || has(p, 'Devoto'))) continue;
          const rel = St.relOf(p, victim); if (!rel || (REL_W[rel] || 0) < 0.72) continue;
          // the one who died served at an oracle: that is where the grieving go
          const shrine = G.Caves && G.Caves.all().find(cv => cv.mouths.length && ((cv.oracle && cv.oracle.id === f.a) || (cv.oraclePast || []).some(x => x.name === f.n.a && x.to >= G.S.day - 1)));
          const m = shrine && shrine.mouths[0];
          const holy = m && W.sameLand(m.x, m.y, p.x, p.y) && G.dist(m.x, m.y, p.x, p.y) > 7 ? { kind: 'oraculo', name: G.Caves.a(shrine), x: m.x + 0.5, y: m.y + 0.5, ref: shrine.id, oracle: f.n.a, was: 1, w: 3 } : holyFor(p);
          if (!holy) continue;
          const violent = !!f.b;
          const sc = REL_W[rel] * (0.35 + q.pie * 0.5) + (violent ? 0.05 : 0) + (holy.was ? 0.1 : 0);
          if (sc < 0.4) continue;
          out.push({ protag: p.id, score: Math.min(1, sc), keyExtra: f.a, cast: { lost: f.a }, place: holy,
            data: { rel, lost: f.a, alt: violent && f.kn.includes(p.id) ? (f.n.b || '') : '', names: { [f.a]: f.n.a } }, motifs: ['rel:' + rel, 'gatilho:luto', 'amb:viagem', 'destino:' + holy.kind + holy.ref] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => !sd.place || holyAlive(sd.place) || !!holyFor(P(sd.protag) || {}),
    begin(s, sd) {
      if (!s.place) { const h = holyFor(P(s.protag)); if (h) s.place = h; }
      s.phase = 'promessa';
      St.beat(s, s.data.from ? 'pg-virou' : 'pg-promessa', { ALT: s.data.alt, KILLER: s.data.alt });
    },
    tick(s) { const p = P(s.protag); if (!p || p.dead) return; if (!holyAlive(s.place)) St.finish(s, 'interrompida', 'sereno', St.say(s, 'pg-sem-lugar')); },
    react(s, f) {
      if (f.k !== 'morte' || f.a !== s.protag) return false;
      St.finish(s, s.data.onRoad ? 'fracassada' : 'interrompida', s.data.onRoad ? 'tragico' : 'sereno', St.say(s, 'pg-morreu', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y });
      return true;
    },
    urge(s, v) {
      // (the first days are for mourning at home; the road comes after)
      if (!free(v) || v.age > 76 || !homeSafe(v) || !s.place || G.S.day - s.born < 1) return 0;
      const own = G.Fac.ownerAt ? G.Fac.ownerAt(s.place.x | 0, s.place.y | 0) : 0; if (own && atWar(facOf(v), own)) return 0;
      return 0.13;
    },
    task(s, v, H) {
      if (!s.data.left) { s.data.left = 1; St.beat(s, 'pg-partiu'); }
      s.data.onRoad = 1;
      return St.go(s, v, H, { x: s.place.x, y: s.place.y, sub: 'peregrinar', dur: 14, act: 'pray', fx: s.place.x, fy: s.place.y - 1, max: 260 });
    },
    done(s, v) {
      s.data.onRoad = 0; v.devotion = Math.min(100, (v.devotion || 0) + 20); G.FX && G.FX.prayer && G.FX.prayer(v.x, v.y);
      // (the oracle as it is today — not who it was when the promise was made, nor the one being mourned)
      const cv = s.place.kind === 'oraculo' && G.Caves ? G.Caves.get(s.place.ref) : null; const o = cv && cv.oracle;
      const lost = P(s.cast.lost); const ORACLE = o && o.id !== s.cast.lost && (!lost || o.name !== lost.name) ? o.name : '';
      St.finish(s, 'cumprida', 'sereno', St.say(s, 'pg-rezou', { ORACLE, WAS: s.place.was ? 1 : 0, DE: deArt(s.place.name) }), { x: v.x, y: v.y, log: true });
    },
    blocked(s) { s.data.onRoad = 0; s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) St.finish(s, 'interrompida', 'sereno', St.say(s, 'pg-sem-caminho')); },
    goal: (s, c) => `Rezar por ${c.L} diante ${deArt(c.X)}.`,
    status: (s, c) => (s.data.onRoad ? `${c.P} está a caminho ${deArt(c.X)}.` : `${c.P} espera o momento de partir para ${c.X}.`),
    obstacles(s, c) { const p = P(s.protag); return p && G.War.threat && G.War.threat(p.set) ? ['a guerra perto de casa'] : []; },
    open: (s, c) => [`chegar ${ao(c.X)} e rezar`, 'adiar até esquecer', 'morrer no caminho'],
    titles: { pereg: c => `A Peregrinação de ${c.P}`, prece: c => `Uma Prece por ${c.L}`, caminho: c => { const a = c.X.match(/^(o|a|os|as) /); return `O Caminho de ${c.P} até ${a ? a[1] + ' ' : ''}${capName(c.X.replace(/^(o|a|os|as) /, ''))}`; }, velas: c => `As Velas de ${c.L}` },
    forgotten: (s, c) => 'A promessa foi ficando para depois, até ser esquecida.',
    taskText: (s, v, t) => (t.st < 2 ? `Em peregrinação a ${s.place.name}` : `Rezando por ${(P(s.cast.lost) || {}).name || 'quem partiu'}`),
  });

  // ====================================================================================
  //  CAÇADA — a beast with a name killed someone close; the beast still roams
  // ====================================================================================
  K('cf-presa', { text: [
    c => `${c.B}, ${c.BK}, matou ${c.REL}, ${c.V}${c.at ? ',' + c.at : ''}. ${c.P} pegou a lança.`,
    c => `Depois que ${c.B} matou ${c.REL}, ${c.V}, ${c.P} passou a seguir seu rastro.`,
  ] });
  K('cf-cacador', { text: [c => `${c.B}, ${c.BK}, já tinha matado gente perto de ${c.cityNow || 'casa'}. ${c.P}, ${c.ROLE}, decidiu caçá-l${c.oB}.`] });
  K('cf-rastro', { text: [c => `${c.P} saiu sozinh${c.o} atrás do rastro de ${c.B}.`] });
  K('cf-confronto', { text: [c => `${c.P} encontrou ${c.B}${c.at}.`] });
  K('cf-matou', { text: [c => `${c.P} matou ${c.B}${c.at}.`, c => `${c.B} caiu diante da lança de ${c.P}${c.at}.`] });
  K('cf-outro', { text: [c => `${c.B} foi abatid${c.oB} por ${c.K}. ${c.P} não estava lá.`] });
  K('cf-outra-fera', { text: [c => `${c.B} morreu nas garras de outro bicho.`] });
  K('cf-morreu-so', { text: [c => `${c.B} morreu sem que ninguém ${c.oB === 'a' ? 'a' : 'o'} caçasse.`] });
  K('cf-morto', { text: [c => `${c.B} matou também ${c.P}${c.at}.`] });
  K('cf-mais-uma', { text: [c => `${c.B} matou mais uma pessoa: ${c.V2}${c.at}.`] });
  K('cf-sumiu', { text: [c => `${c.B} sumiu dos arredores. Ninguém sabe para onde foi.`, c => `Dias sem rastro de ${c.B}. ${c.P} acabou pendurando a lança.`] });
  K('cf-toca', { text: [c => `${c.B} se enfiou ${em(c.DEN)} para dormir. ${c.P} sabe onde esperar.`, c => `O rastro de ${c.B} terminava na boca ${deArt(c.DEN)}.`] });
  K('cf-morreu', { text: [c => `${c.P} ${c.DEATH} sem ver ${c.B} cair.`] });

  const beastOf = s => G.S.animals.get(s.cast.beast);
  // a beast that went to ground (asleep or sheltering in a cave) is not gone: it comes out again
  const denOf = id => { if (!G.Caves) return null; for (const cv of G.Caves.all()) if ((cv.sleepers || []).some(a => a.id === id) || (cv.sheltered || []).some(a => a.id === id)) return cv; return null; };
  const bctx = s => { const d = G.Animals.DEF[s.data.kind] || {}; return { B: s.data.beastName, BK: d.nameA || 'uma fera', oB: d.g === 'f' ? 'a' : 'o' }; };
  St.define('cacada', {
    name: 'Caçada', icon: 'wolf', tone: 'sombrio', tags: ['criatura', 'caçada'], struct: 'perda-perseguicao', seedLife: 4, maxDays: 60,
    on: {
      morte(f) {
        if (!f.beast) return null;
        const a = G.S.animals.get(f.beast); if (!a || a.dead || !(a.named || a.legend)) return null;
        const victim = P(f.a); if (!victim) return null; const out = [];
        for (const p of St.kin(victim)) {
          if (p.dead || p.age < 14 || p.captive) continue;
          const rel = St.relOf(p, victim); if (!rel || !REL_W[rel]) continue;
          const q = pe(p);
          let sc = REL_W[rel] * (0.38 + p.courage * 0.35 + q.agg * 0.22 + (p.role === 'cacador' || p.role === 'guerreiro' ? 0.15 : 0)) * (a.legend ? 1.15 : 1);
          if (has(p, 'Medroso')) sc *= 0.5;
          if (sc < 0.42) continue;
          const w = St.where(f.x, f.y);
          out.push({ protag: p.id, score: Math.min(1, sc), keyExtra: 'b' + a.id, cast: { beast: a.id, victim: f.a }, place: { kind: 'rastro', name: w.name, x: f.x, y: f.y },
            data: { rel, kind: a.kind, beastName: a.named || G.cap(G.Animals.DEF[a.kind].nameA), at: w.at, lx: f.x, ly: f.y, names: { [f.a]: f.n.a } }, motifs: ['rel:' + rel, 'gatilho:fera', 'amb:ermos'] });
        }
        // a man-eater just named: the best hunter of the nearest town decides to end it
        if (!out.length && (a.kills === 2 || a.legend)) {
          const set = G.Village.nearestSettlement ? G.Village.nearestSettlement(f.x, f.y) : null;
          if (set && G.dist(set.cx, set.cy, f.x, f.y) < 18) {
            let best = null; for (const v of G.S.villagers.values()) if (v.set === set.id && (v.role === 'cacador' || v.role === 'guerreiro') && v.courage > 0.5 && !v.captive && v.age >= 18 && (!best || v.courage > best.courage)) best = v;
            if (best) out.push({ protag: best.id, score: 0.45, keyExtra: 'b' + a.id, cast: { beast: a.id }, place: { kind: 'rastro', name: set.name, x: f.x, y: f.y },
              data: { hunter: 1, kind: a.kind, beastName: a.named || G.cap(G.Animals.DEF[a.kind].nameA), at: St.where(f.x, f.y).at, lx: f.x, ly: f.y }, motifs: ['gatilho:fera', 'amb:ermos', 'rel:nenhuma'] });
          }
        }
        out.sort((x, y) => y.score - x.score); return out.slice(0, 1);
      },
    },
    valid: sd => { const a = G.S.animals.get(sd.cast.beast); return !!(a && !a.dead); },
    begin(s) { const p = P(s.protag); s.phase = 'cacar'; St.beat(s, s.data.hunter ? 'cf-cacador' : 'cf-presa', Object.assign(bctx(s), { ROLE: p ? G.roleName(p).toLowerCase() : 'caçador' }), { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      const a = beastOf(s);
      if (!a) {
        const den = denOf(s.cast.beast);
        if (den) { s.data.gone = 0; if (s.data.den !== den.id) { s.data.den = den.id; s.data.lx = den.mouths[0] ? den.mouths[0].x + 0.5 : s.data.lx; s.data.ly = den.mouths[0] ? den.mouths[0].y + 0.5 : s.data.ly; St.beat(s, 'cf-toca', Object.assign(bctx(s), { DEN: G.Caves.a ? G.Caves.a(den) : den.name })); } return; }
        // gone from the land: only after some days without a sign does the hunt fade
        if (!s.data.gone) s.data.gone = G.S.day;
        if (G.S.day - s.data.gone >= 3) St.finish(s, 'esquecida', 'sereno', St.say(s, 'cf-sumiu', bctx(s)));
        return;
      }
      s.data.gone = 0; s.data.den = 0;
      if (a.dead) return; // its death comes as a fact
      // what the town knows: where it was last seen near home
      const set = G.S.settlements.get(p.set);
      if ((set && G.dist(a.x, a.y, set.cx, set.cy) < 14) || G.dist(a.x, a.y, p.x, p.y) < 8) { s.data.lx = +a.x.toFixed(1); s.data.ly = +a.y.toFixed(1); }
      if (p.task && (p.task.type === 'fight' || p.task.type === 'hunt') && p.task.id === a.id && s.data.met !== G.S.day) {
        s.data.met = G.S.day; s.phase = 'confronto';
        St.beat(s, 'cf-confronto', Object.assign(bctx(s), { at: St.where(a.x, a.y).at }), { x: a.x, y: a.y, hot: 25, toast: true, big: 1 });
      }
    },
    react(s, f) {
      const b = bctx(s);
      if (f.k === 'fera-morta' && f.beast === s.cast.beast) {
        const at = St.where(f.x, f.y).at;
        if (f.by === s.protag) St.finish(s, 'cumprida', 'feliz', St.say(s, 'cf-matou', Object.assign(b, { at })), { x: f.x, y: f.y, log: true, toast: true, hot: 25, big: 1, clima: 'caçada', legend: true });
        else if (f.by) St.finish(s, 'roubada', 'agridoce', St.say(s, 'cf-outro', Object.assign(b, { K: (P(f.by) || {}).name || 'outra pessoa' })), { log: true });
        else if (f.byBeast) St.finish(s, 'roubada', 'sereno', St.say(s, 'cf-outra-fera', b));
        else St.finish(s, 'roubada', 'sereno', St.say(s, 'cf-morreu-so', b));
        return true;
      }
      if (f.k === 'morte' && f.beast === s.cast.beast) {
        const at = St.where(f.x, f.y).at;
        if (f.a === s.protag) {
          St.chapter(s, St.say(s, 'cf-morto', Object.assign(b, { at })), { x: f.x, y: f.y, big: 1, log: true, toast: true });
          if (!St.bequeath(s, P(f.a), 'fera')) St.finish(s, 'fracassada', 'tragico', null, { clima: 'caçada' });
        } else if ((s.data.more || 0) < 2) { s.data.more = (s.data.more || 0) + 1; St.beat(s, 'cf-mais-uma', Object.assign(b, { V2: f.n.a, at }), { x: f.x, y: f.y }); }
        return true;
      }
      if (f.k === 'morte' && f.a === s.protag) {
        St.chapter(s, St.say(s, 'cf-morreu', Object.assign(b, { DEATH: deathTxt(f.a) })));
        if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'sereno', null);
        return true;
      }
      return false;
    },
    urge(s, v) {
      const a = beastOf(s); if (!a || a.dead || !free(v) || v.age < 16 || v.hp < 70 || !homeSafe(v)) return 0;
      const set = G.S.settlements.get(v.set); if (set && G.dist(a.x, a.y, set.cx, set.cy) > 32) return 0;
      return 0.14 + (has(v, 'Corajoso') ? 0.05 : 0);
    },
    task(s, v, H) {
      const a = beastOf(s); if (!a) return null;
      if (G.dist(v.x, v.y, a.x, a.y) < 7) return H.setTask(v, { type: 'fight', id: a.id, pri: 4, rt: 0, saga: s.id });
      if (!s.data.tracked) { s.data.tracked = 1; St.beat(s, 'cf-rastro', bctx(s)); }
      return St.go(s, v, H, { x: s.data.lx, y: s.data.ly, sub: 'rastro', dur: 5, emo: 'angry', max: 120 });
    },
    // at the end of the trail: if the beast is there, the fight is the world's
    arrive(s, v) { const a = beastOf(s); if (a && !a.dead && G.dist(v.x, v.y, a.x, a.y) < 7) G.Vg.H.setTask(v, { type: 'fight', id: a.id, pri: 4, rt: 0, saga: s.id }); },
    goal: (s, c) => `Matar ${s.data.beastName}.`,
    status(s, c) { const a = beastOf(s); return a && !a.dead ? `${s.data.beastName} ronda ${St.where(a.x, a.y).at.trim() || 'os ermos'}${a.kills ? ` — já matou ${a.kills} ${a.kills > 1 ? 'pessoas' : 'pessoa'}` : ''}.` : ''; },
    obstacles(s, c) { const a = beastOf(s); const d = a ? G.Animals.DEF[a.kind] : null; const out = []; if (a && a.legend) out.push('é uma fera lendária, do tamanho de uma casa'); else if (d && d.apex) out.push(`${d.nameA} não tem quem a cace`); return out; },
    open: (s, c) => [`encontrar ${s.data.beastName} e lutar`, 'outra pessoa abatê-la antes', 'a fera ir embora', `a fera matar também ${c.P}`],
    heirs: { minAge: 14, chance: 0.4, fit: (s, c) => 0.3 + c.courage * 0.8, text: (s, c) => `${c.P} morreu sem matar ${s.data.beastName}. ${c.H}, ${c.DEADREL}, pegou a lança.` },
    titles: { cacada: c => `A Caçada a ${c.s.data.beastName}`, e: c => `${c.P} e ${c.s.data.beastName}`, rastro: c => `O Rastro de ${c.s.data.beastName}`, dentes: c => `Os Dentes de ${c.s.data.beastName}` },
    forgotten: (s, c) => `Ninguém mais saiu atrás de ${s.data.beastName}.`,
    taskText: (s, v, t) => `No rastro de ${s.data.beastName}`,
  });

  St.init();
})(window.G);
