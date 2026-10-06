'use strict';
// ============================================================
//  The library of stories: handcrafted shapes over real facts.
//  Each archetype says who could carry a story out of a fact and how strongly — and checks that the
//  premise is TRUE in this world (a dream of the sea only for someone who lives far from it and has
//  never seen it; a pilgrimage only to a holy place that is a real road away). Then how the story
//  moves as the world moves, what its people do with a little of their time (a journey with nights
//  by a small fire, a rescue at night, standing before the killer in chains), and how it can end.
//  The storylets are the words: beats with a heading and many variants, some by culture, many by the
//  hour, the weather and the ground — never saying something happened that did not.
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
  const onJourney = v => !!(v && v.task && v.task.type === 'saga' && v.task.j);
  const REL_W = { pai: 1, mae: 1, filho: 1, filha: 1, companheiro: 0.9, companheira: 0.9, irmao: 0.72, irma: 0.72 };
  const REL_POSS = { pai: 'seu pai', mae: 'sua mãe', filho: 'seu filho', filha: 'sua filha', companheiro: 'seu companheiro', companheira: 'sua companheira', irmao: 'seu irmão', irma: 'sua irmã' };
  const REL_BARE = { pai: 'o pai', mae: 'a mãe', filho: 'o filho', filha: 'a filha', companheiro: 'o companheiro', companheira: 'a companheira', irmao: 'o irmão', irma: 'a irmã' };
  const deathTxt = id => { const r = P(id); return r && r.dead ? G.Village.deathText(r) : 'morreu'; };
  const free = v => v && !v.dead && !v.captive && !v.held && !v.aboard && v.hp > 55 && v.hunger < 60 && v.energy > 35;
  const homeSafe = v => !(G.War && G.War.threat && G.War.threat(v.set));
  const art = name => (/^(a |o |os |as )/.test(name) ? '' : /^(Lagoa|Cachoeira|Agulha|Garganta|Trilha|Escadaria|Subida|Portela|Gruta|Lapa|Furna|Toca|Caverna|Queda|Serra|Cordilheira|Pedra|Boca|Cova|Fenda|Ponta|Montanha|Colina|Cratera)/.test(name) ? 'a ' : 'o ');
  // a place's name with its article ('o Pico do Lobo', 'a Gruta do Eco', 'o mar'), and the contractions
  const withArt = name => (!name ? name : /^(o|a|os|as) /.test(name) ? name : art(name) + name);
  const deArt = name => { const n = withArt(name); return n.replace(/^o /, 'do ').replace(/^a /, 'da ').replace(/^os /, 'dos ').replace(/^as /, 'das '); };
  const em = name => { const n = withArt(name); return n.replace(/^o /, 'no ').replace(/^a /, 'na ').replace(/^os /, 'nos ').replace(/^as /, 'nas '); };
  const ao = name => { const n = withArt(name); return n.replace(/^o /, 'ao ').replace(/^a /, 'à ').replace(/^os /, 'aos ').replace(/^as /, 'às '); };
  const por = name => { const n = withArt(name); return n.replace(/^o /, 'pelo ').replace(/^a /, 'pela ').replace(/^os /, 'pelos ').replace(/^as /, 'pelas '); };
  const capName = name => (name ? name.charAt(0).toUpperCase() + name.slice(1) : name);
  const titled = name => { const n = withArt(name) || ''; const a = n.match(/^(o|a|os|as) /); return (a ? a[1] + ' ' : '') + capName(n.replace(/^(o|a|os|as) /, '')); };
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const lhe = o => (o === 'a' ? 'ela' : 'ele');
  const K = (k, d) => St.storylet(k, d);
  const FAR = () => St.far(), PFAR = () => St.pilgrimFar();
  // who someone is, the way a storyteller says it: "uma pastora de Hedeby", "um menino de Birka"
  function desc(p, town) {
    if (!p) return 'alguém';
    const f = p.g === 'f'; const a = Math.floor(p.age); const t = town === undefined ? setName(p.set) : town;
    let w;
    if (a < 13) w = f ? 'uma menina' : 'um menino';
    else if (a < 18) w = f ? 'uma moça' : 'um rapaz';
    else if (a >= 62) w = f ? 'uma velha' : 'um velho';
    else { const r = p.role && G.ROLE && G.ROLE[p.role] ? (G.ROLE[p.role][f ? 1 : 0] || '').toLowerCase() : ''; w = r && p.role !== 'cativo' ? (f ? 'uma ' : 'um ') + r : (f ? 'uma mulher' : 'um homem'); }
    return w + (t ? ' de ' + t : '');
  }
  // someone close, close by: who sees them off at the edge of town
  function kinNear(v, r) {
    let best = null, bd = r * r;
    for (const k of St.kin(v)) { if (k.captive || k.sleeping || k.inside || k.age < 4) continue; const d = G.dist2(k.x, k.y, v.x, v.y); if (d < bd) { bd = d; best = k; } }
    if (!best) return null; const rel = St.relOf(v, best);
    return { id: best.id, name: best.name, rel, txt: rel ? `${cap1(REL_BARE[rel])}, ${best.name},` : best.name };
  }
  const homeOf = v => G.S.settlements.get(v && v.set);
  const TIME = { noite: 'de noite', amanhecer: 'ao amanhecer', manha: 'de manhã', meiodia: 'ao meio-dia', tarde: 'à tarde', entardecer: 'ao entardecer' };

  // ====================================================================================
  //  THE ROAD — beats shared by every journey (a pass, a ford, another people's town, the night)
  // ====================================================================================
  K('rd-pico', { h: 'A montanha', text: [
    c => `${c.P} passou ao pé ${deArt(c.NAME)}${c.ALT ? ' — ' + c.ALT + ' de pedra' : ''}${c.SNOW ? ', com a neve brilhando lá no alto' : ''}.`,
    c => `${cap1(titled(c.NAME))} ficou um tempo enorme ao lado do caminho, e depois para trás. ${c.P} olhou para ${art(c.NAME) === 'a ' ? 'ela' : 'ele'} até o pescoço doer.`,
  ] });
  K('rd-passo', { h: 'O passo', text: [
    c => `${c.P} subiu ${por(c.NAME)}, onde o vento corta e o ar fica fino.`,
    c => `A estrada subia ${por(c.NAME)}. ${c.P} atravessou com o fôlego curto e as pernas tremendo.`,
  ] });
  K('rd-lago', { h: 'A água', text: [
    c => `${c.P} bebeu água na margem ${deArt(c.NAME)}, lavou o rosto e seguiu.`,
    c => `O caminho contornava ${withArt(c.NAME)}. ${c.P} parou para encher o odre.`,
  ] });
  K('rd-cachoeira', { h: 'A cachoeira', text: [
    c => `${c.P} ouviu ${withArt(c.NAME)} muito antes de ${art(c.NAME) === 'a ' ? 'vê-la' : 'vê-lo'}, e parou um pouco para olhar a água caindo.`,
    c => `O caminho passava junto ${ao(c.NAME)}, e a névoa da água molhou a roupa de ${c.P}.`,
  ] });
  K('rd-cidade', { h: 'Gente estranha', text: [
    c => c.OTHER ? `${c.P} passou por ${c.TOWN}, cidade de outro povo (${c.OTHER}). Ninguém ali sabia quem ${lhe(c.o)} era.` : `${c.P} passou por ${c.TOWN} e pediu água numa porta.`,
    c => c.OTHER ? `${c.P} atravessou ${c.TOWN} de cabeça baixa: era terra de outro povo, e lá se falava de outro jeito.` : null,
  ] });
  K('rd-cidade-guerra', { h: 'Terra inimiga', text: [
    c => `${c.P} deu a volta longe de ${c.TOWN}: era terra inimiga, e havia guerra.`,
    c => `Perto de ${c.TOWN}, ${c.P} andou só pela mata, longe da estrada: ${c.OTHER} estava em guerra com os seus.`,
  ] });
  K('rd-vau', { h: 'O vau', text: [
    c => `${c.P} atravessou o rio a vau, com água pela cintura e a trouxa erguida acima da cabeça.`,
    c => `Um rio cortava o caminho. ${c.P} achou um lugar raso e passou, escorregando nas pedras do fundo.`,
  ] });
  K('rd-bioma', { h: 'Terra nova', text: [
    c => ({ neve: `O chão foi ficando branco: ${c.P} entrou na tundra gelada, onde a respiração vira fumaça.`, taiga: `${c.P} entrou na taiga, entre pinheiros escuros e silêncio.`, pantano: `Chegou ao pântano: ${c.P} afundava até os tornozelos a cada passo.`, selva: `A mata fechou em volta de ${c.P}: era a floresta tropical, quente e cheia de gritos de bicho.`, savana: `A terra se abriu em capim alto e árvores esparsas: ${c.P} estava na savana.`, deserto: `Depois veio o deserto: areia, sol e nenhuma sombra. ${c.P} andou com um pano na cabeça.`, temperado: `${c.P} desceu para os bosques, onde a sombra é fresca e a água é fácil.` })[c.BIOME] || null,
  ] });
  K('rd-chuva', { h: 'A chuva', text: [
    c => c.COLD ? `Nevou no caminho. ${c.P} seguiu com os pés dormentes e os cílios brancos.` : `Choveu o caminho inteiro; ${c.P} seguiu encharcad${c.o}, sem reclamar.`,
    c => c.COLD ? null : `A chuva pegou ${c.P} no meio do caminho. Esperou debaixo de uma árvore, e seguiu ainda pingando.`,
  ] });
  K('rd-tempestade', { h: 'A tempestade', text: [
    c => `Uma tempestade pegou ${c.P} na estrada. Seguiu mesmo assim, contando os segundos entre o raio e o trovão.`,
    c => `O céu desabou: vento, raios, água de lado. ${c.P} se encolheu numa pedra até passar o pior.`,
  ] });
  K('rd-acampou', { h: 'A primeira noite', text: [
    c => `A noite pegou ${c.P} na estrada${c.AT}. Acendeu um fogo pequeno, comeu um pedaço de pão e dormiu ao relento.`,
    c => c.COLD ? `${c.P} passou a noite${c.AT} encolhid${c.o} perto de um fogo que não esquentava quase nada.` : `${c.P} dormiu sob as estrelas${c.AT}, com a trouxa de travesseiro e o fogo estalando baixinho.`,
    c => c.FOOD ? null : `${c.P} dormiu${c.AT} sem comer: o pão tinha acabado. Ainda faltava caminho.`,
  ] });
  // a road beat from what the world showed (St.roadWatch); one line each, at most a few per road
  function roadBeat(s, v, r) {
    let key = null; const vars = { AT: '' };
    if (r.K === 'lugar') { key = { pico: 'rd-pico', passo: 'rd-passo', lago: 'rd-lago', cachoeira: 'rd-cachoeira' }[r.KIND]; Object.assign(vars, { NAME: r.NAME, ALT: r.ALT, SNOW: r.SNOW }); }
    else if (r.K === 'set') { key = r.WAR ? 'rd-cidade-guerra' : 'rd-cidade'; Object.assign(vars, { TOWN: r.TOWN, OTHER: r.OTHER }); }
    else if (r.K === 'vau') key = 'rd-vau';
    else if (r.K === 'bioma') { key = 'rd-bioma'; vars.BIOME = r.BIOME; }
    else if (r.K === 'tempo') { key = r.W === 'tempestade' ? 'rd-tempestade' : 'rd-chuva'; vars.COLD = r.COLD; }
    if (key) St.beat(s, key, vars, { x: v.x, y: v.y });
  }
  function campBeat(s, v, t) {
    if (t.camps > 1 || s.data.camped) return; s.data.camped = 1;
    const w = St.where(v.x, v.y);
    St.beat(s, 'rd-acampou', { AT: w.at && !w.town ? w.at : '', COLD: St.cold(v.x, v.y), FOOD: t.food > 0 }, { x: v.x, y: v.y });
  }
  // the one who went comes home and tells the children: what they saw becomes a tale (and maybe a new dream)
  function tellKids(s, v, txt, place, ic) {
    const S = G.S; const kids = [];
    for (const k of S.villagers.values()) {
      if (kids.length >= 6) break;
      if (k.set !== v.set || k.age < 4 || k.age >= 16 || k.captive || k.inside || k.sleeping) continue;
      if (G.dist2(k.x, k.y, v.x, v.y) < 15 * 15) kids.push(k);
    }
    if (!kids.length) return 0;
    for (const k of kids) G.Life && G.Life.bio(k, 'story', v.id, txt.slice(0, 88));
    G.Life && G.Life.bio(v, 'told', txt.slice(0, 88));
    St.signal('tale', { teller: v.id, kids: kids.map(k => k.id), tale: { txt, x: place.x, y: place.y, ic, mood: 'awe' } });
    G.Vg.emote(v, 'chat', 2);
    return kids.length;
  }

  // ====================================================================================
  //  VINGANÇA — someone close killed by a known hand; the one who killed still lives
  // ====================================================================================
  K('vg-crianca', { h: 'O rosto', text: [
    c => `${c.P}, com ${c.age} anos, viu ${c.REL}, ${c.V}, morrer pelas mãos de ${c.T}${c.at}. Nunca esqueceu aquele rosto.`,
    c => `${c.P} era criança quando viu ${c.T} matar ${c.REL}, ${c.V}${c.at ? ',' + c.at : ''}. Guardou aquele nome como quem guarda uma pedra no bolso.`,
    c => `Escondid${c.o} atrás de uma parede${c.at}, ${c.P} viu tudo: ${c.T} derrubou ${c.REL}, ${c.V}, e foi embora limpando a arma. ${c.P} tinha ${c.age} anos.`,
  ] });
  K('vg-juramento', { h: 'O juramento', text: [
    c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Naquela noite, jurou vingança.`,
    c => `${c.T} matou ${c.REL}, ${c.V}, diante dos olhos de ${c.P}${c.at}. ${c.P} fechou os olhos de ${c.V} com a mão ainda tremendo, e jurou que ${c.T} pagaria.`,
    c => `${c.P} chegou tarde demais: ${c.V} já estava no chão${c.at}, e ${c.T} ainda segurava a arma. ${c.P} gravou cada detalhe daquele rosto.`,
  ], civ: {
    nordico: [c => `${c.P} viu ${c.REL}, ${c.V}, tombar diante de ${c.T}${c.at}. Jurou sobre o machado de ${c.V} que ${c.T} pagaria com sangue.`],
    romano: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou diante dos deuses da casa que ${c.V} seria vingad${c.oV}.`],
    egipcio: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou diante de Maat que o coração de ${c.T} seria pesado — e achado culpado.`],
    asteca: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou ao Sol que o sangue de ${c.T} correria nas pedras.`],
    grego: [c => `${c.P} viu ${c.REL}, ${c.V}, cair diante de ${c.T}${c.at}. Jurou pelas Erínias que ${c.T} não escaparia.`],
  } });
  K('vg-noticia', { h: 'A notícia', text: [
    c => `${c.V} foi mort${c.oV} por ${c.T}${c.at}. Quando a notícia chegou, ${c.P} jurou que ${c.T} pagaria.`,
    c => `A notícia chegou antes do corpo: ${c.T} tinha matado ${c.REL}, ${c.V}${c.at ? ',' + c.at : ''}. ${c.P} não chorou; prometeu.`,
    c => `Todos em ${c.cityNow || 'casa'} sabiam o nome de quem matou ${c.V}: ${c.T}. ${c.P} repetiu aquele nome baixinho a noite inteira.`,
  ] });
  K('vg-execucao', { h: 'A execução', text: [
    c => c.s.data.saw ? `${c.V} foi executad${c.oV} por ordem de ${c.T}. ${c.P} assistiu calad${c.o} — e guardou o ódio.` : `${c.V} foi executad${c.oV} por ordem de ${c.T}. ${c.P} soube, e guardou o ódio.`,
    c => c.s.data.saw ? `Na praça, diante de todos, ${c.T} mandou matar ${c.V}. ${c.P} estava na multidão e não conseguiu desviar os olhos.` : null,
  ] });
  K('vg-cresceu', { h: 'Os anos', text: [c => `${c.P} cresceu. A lembrança de ${c.V} cresceu junto.`, c => `Os anos passaram, mas ${c.P} não esqueceu ${c.T}.`, c => `${c.P} virou gente grande. Quem ${o2(c)} conhece diz que ${lhe(c.o)} quase não sorri.`] });
  K('vg-treino', { h: 'O preparo', text: [
    c => `${c.P} começou a treinar com a lança nas horas livres: queria estar pront${c.o} quando chegasse a hora.`,
    c => `${c.P} passou a treinar com os guerreiros${c.cityNow ? ' de ' + c.cityNow : ''} no fim do dia, até as mãos sangrarem.`,
    c => `Toda tarde, ${c.P} batia num tronco com um pau até o sol se pôr. Quem passava não perguntava por quê.`,
  ] });
  K('vg-guerra', { h: 'A guerra', text: [
    c => c.FP !== c.FT ? `${c.FP} e ${c.FT} voltaram a guerrear. Para ${c.P}, era a chance que esperava.` : null,
    c => c.FP !== c.FT ? `Veio a guerra entre ${c.FP} e ${c.FT}. ${c.T} ainda estava viv${c.oT} — e do outro lado.` : null,
    c => c.FP === c.FT ? `Os dois lados de ${c.FP} pegaram em armas um contra o outro. Para ${c.P}, era a chance que esperava.` : null,
  ] });
  K('vg-parte', { h: 'A marcha', text: [c => `${c.P} partiu com o exército de ${c.FP}${c.DEST ? ' rumo a ' + c.DEST : ''}. Perguntava a todo mundo se ${c.T} estaria lá.`, c => `${c.P} foi d${c.o === 'a' ? 'as' : 'os'} primeir${c.o}s a se alistar quando o exército de ${c.FP} partiu${c.DEST ? ' contra ' + c.DEST : ''}.`] });
  K('vg-mesmo-campo', { h: 'Frente a frente', text: [c => `${c.P} e ${c.T} estavam no mesmo campo de batalha${c.at}.`, c => `No meio da batalha${c.at}, ${c.P} e ${c.T} ficaram frente a frente.`, c => `${c.P} reconheceu ${c.T} no meio da poeira${c.at} — e foi direto na direção ${c.oT === 'a' ? 'dela' : 'dele'}.`] });
  K('vg-alvo-cativo', { h: 'O alvo acorrentado', text: [c => `${c.T} caiu cativ${c.oT} nas mãos do povo de ${c.P}${c.city ? ' e está em ' + c.city : ''}.`, c => `Trouxeram ${c.T} acorrentad${c.oT}${c.city ? ' para ' + c.city : ''}. ${c.P} soube no mesmo dia.`] });
  K('vg-diante', { h: 'Diante das correntes', text: [
    c => `${c.P} foi até onde ${c.T} trabalhava acorrentad${c.oT} e ficou olhando, sem dizer nada.`,
    c => `${c.P} parou diante de ${c.T}. Pela primeira vez, de perto: ${lhe(c.oT)} era menor do que na lembrança.`,
  ] });
  K('vg-hesitou', { h: 'Diante das correntes', text: [c => `${c.P} ficou parad${c.o} diante de ${c.T} até o sol mudar de lugar. Depois voltou para casa, sem ter decidido nada.`] });
  K('vg-correntes', { h: 'O acerto', text: [
    c => `${c.P} matou ${c.T} ali mesmo, entre as correntes. Ninguém chegou a tempo de impedir.`,
    c => `${c.T} não teve como se defender: ${c.P} veio de frente, à luz do dia, e acabou com aquilo.`,
  ] });
  K('vg-perdao', { h: 'O perdão', text: [
    c => `${c.P} olhou ${c.T} nos olhos por muito tempo. Depois deu as costas e foi embora. Nunca mais falou daquilo.`,
    c => `${c.P} foi até ${c.T} com a faca na cintura — e não a tirou. Voltou para casa e chorou por ${c.V} como não tinha chorado antes.`,
    c => `${c.P} deixou ${c.T} viver. Disse só: "${c.V} não ia querer isso."`,
  ] });
  K('vg-conspira', { h: 'A conspiração', text: [c => `${c.P} entrou na conspiração contra ${c.T}.`, c => `Quando começaram a conspirar contra ${c.T}, ${c.P} foi d${c.o === 'a' ? 'as' : 'os'} primeir${c.o}s a pegar em armas.`] });
  K('vg-de-novo', { h: 'De novo', text: [c => `${c.P} e ${c.T} voltaram a se cruzar numa batalha${c.at}.`, c => `De novo${c.at}, ${c.P} viu ${c.T} no meio da luta — e de novo a multidão separou os dois.`] });
  K('vg-paz', { h: 'A paz', text: [c => `${c.FP} e ${c.FT} fizeram as pazes. ${c.T} ficou fora de alcance.`, c => `Veio a paz entre ${c.FP} e ${c.FT}. Para ${c.P}, foi como uma porta fechada.`] });
  K('vg-cumprida', { h: 'O acerto', text: [
    c => `${c.P} matou ${c.T}${c.at}. ${c.V} estava vingad${c.oV}.`,
    c => c.yrs > 2 ? `Depois de ${c.an(c.yrs)}, ${c.P} encontrou ${c.T}${c.at} — e foi ${c.P} quem saiu viv${c.o}.` : null,
    c => `${c.T} caiu${c.at}, e foi a mão de ${c.P} que ${o3(c.oT)} derrubou. O nome de ${c.V} foi a última coisa que ${c.T} ouviu.`,
  ] });
  K('vg-tumulo', { h: 'O túmulo', text: [
    c => `${c.P} foi até o túmulo de ${c.V} e contou, em voz baixa, que estava feito.`,
    c => `${c.P} ajoelhou-se no túmulo de ${c.V}, ficou ali um tempo e foi embora mais leve.`,
  ], civ: {
    nordico: [c => `${c.P} foi até o túmulo de ${c.V} e enterrou ali o machado do juramento. Estava feito.`],
    romano: [c => `${c.P} foi ao túmulo de ${c.V}, derramou vinho na terra e disse que os deuses da casa podiam descansar.`],
    egipcio: [c => `${c.P} foi ao túmulo de ${c.V} e deixou pão e cerveja: o coração de ${c.T} já tinha sido pesado.`],
    asteca: [c => `${c.P} foi ao túmulo de ${c.V} e queimou copal. O Sol tinha bebido o sangue prometido.`],
    grego: [c => `${c.P} foi ao túmulo de ${c.V} e derramou mel e vinho: as Erínias podiam dormir.`],
  } });
  K('vg-outro', { h: 'Outra mão', text: [c => c.MET ? `Na mesma luta, foi ${c.K} quem derrubou ${c.T}. ${c.P} chegou tarde.` : c.SAME ? `${c.T} caiu${c.at} diante de ${c.K}. ${c.P} não estava lá.` : `${c.T} morreu pelas mãos de ${c.K}${c.at}, longe de ${c.P}. A vingança não aconteceu.`] });
  K('vg-velhice', { h: 'O tempo', text: [c => `${c.T} morreu de velhice, na cama. ${c.P} ficou com a promessa na mão e ninguém para cumpri-la.`] });
  K('vg-acaso', { h: 'O acaso', text: [c => `${c.T} ${c.DEATH}. Ninguém cobrou a dívida.`, c => `${c.T} ${c.DEATH} — e ${c.P} descobriu que não sentia nada.`] });
  K('vg-morto-pelo-alvo', { h: 'Como antes', text: [
    c => c.CAUSE === 'execution' ? `${c.T} mandou executar também ${c.P}.` : `${c.T} matou também ${c.P}${c.at}.`,
    c => c.CAUSE !== 'execution' ? `${c.P} caiu diante de ${c.T}, como ${c.V} antes.` : null,
  ] });
  K('vg-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} sem ver ${c.T} pagar.`] });
  K('vg-esquecer', { h: 'Os anos de paz', text: [c => (c.age < 58 ? `Os anos de paz apagaram a raiva. ${c.P} deixou a lança encostada e cuidou dos seus.` : null), c => (c.age >= 58 ? `${c.P} envelheceu. A promessa ficou para trás, como ${c.V}.` : null)] });
  K('vg-oracao', { h: 'A prece', text: [c => `${c.P} trocou a vingança pela prece: decidiu rezar por ${c.V} em vez de caçar ${c.T}.`] });
  function o2(c) { return c.o === 'a' ? 'a' : 'o'; }
  function o3(o) { return o === 'a' ? 'a' : 'o'; }

  // the victim's grave, if there is one: where the one who kept the promise goes to say it is done
  function graveOf(id) { const r = G.S.dead && G.S.dead.get(id); const b = r && r.grave && G.S.buildings.get(r.grave); return b && b.built !== false ? b : null; }

  St.define('vinganca', {
    name: 'Vingança', icon: 'sword', tone: 'sombrio', tags: ['vingança', 'família'], struct: 'perda-perseguicao', seedLife: 5, maxDays: 90, ripe: 0.6,
    stages: [['juramento', 'O juramento'], ['espera', 'A espera'], ['preparo', 'O preparo'], ['encontro', 'O encontro'], ['acerto', 'O acerto']],
    stage(s) { return s.st === 'fim' ? (s.end.k === 'cumprida' || s.end.k === 'perdoada' ? 4 : -1) : s.phase === 'tumulo' ? 4 : s.phase === 'confronto' || s.phase === 'frente' ? 3 : s.phase === 'preparar' ? 2 : 1; },
    logline(s, c) {
      const ex = s.data.cause === 'execution' || s.data.cause === 'coup';
      const verb = s.data.saw ? `viu ${c.T} ${ex ? 'mandar executar' : 'matar'}` : `soube que ${c.T} ${ex ? 'mandou executar' : 'matou'}`;
      const oath = St.pick(['e jurou cobrar esse sangue', 'e jurou que aquilo não ia ficar assim', `e jurou que ${c.oT === 'a' ? 'ela' : 'ele'} ia pagar`], s.id);
      return `${cap1(desc(c.p, s.data.town))} que ${verb} ${c.REL}, ${c.V} — ${oath}.`;
    },
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
            data: { rel, saw, at: w.at, ft: facOf(killer), cause: f.cause, oath: Math.floor(p.age), town: setName(p.set), names: { [f.a]: f.n.a, [f.b]: f.n.b } },
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
      const k = s.data.cause === 'execution' || s.data.cause === 'coup' ? 'vg-execucao' : !s.data.saw ? 'vg-noticia' : p.age < 12 ? 'vg-crianca' : 'vg-juramento';
      St.beat(s, k, null, { x: s.place.x, y: s.place.y });
      if (G.Life) G.Life.bio(p, 'note', `Jurou vingar ${REL_POSS[s.data.rel] || ''} ${(P(s.cast.victim) || {}).name || ''}`.replace(/\s+/g, ' ').trim());
    },
    tick(s) {
      const S = G.S; const p = P(s.protag), t = P(s.cast.target);
      // the promise is kept: a last visit to the grave, if there is one, or the story closes by itself
      if (s.phase === 'tumulo') { if (!p || p.dead || S.day - s.data.doneDay > 2) St.finish(s, 'cumprida', 'agridoce', null, { bio: false }); return; }
      if (!p || p.dead || !t || t.dead) return;
      const q = pe(p); const fp = peopleOf(p), ft = peopleOf(t); s.data.ft = ft;
      if (s.phase === 'crescer' && p.age >= 16) { s.phase = 'remoer'; St.beat(s, 'vg-cresceu'); }
      if (s.phase === 'remoer' && p.age >= 16 && (q.agg > 0.42 || has(p, 'Corajoso'))) s.phase = 'preparar';
      // the peoples at war again: the chance (a war that flares up again within days is the same war)
      if (atWar(fp, ft)) { const r = G.Fac.rel(fp, ft); if (r && s.data.war !== r.since) { s.data.war = r.since; s.data.peaceFrom = -1; if (!(G.S.day - (s.data.warBeat || -99) < 8)) { s.data.warBeat = G.S.day; St.beat(s, 'vg-guerra', { FP: facName(fp), FT: facName(ft) }); } } }
      else if (s.data.peaceFrom < 0 && fp !== ft) s.data.peaceFrom = S.day;
      // marching against them
      if (p.task && p.task.type === 'band' && G.War.bands) { const b = G.War.bands.get(p.task.band); if (b && b.enemy === ft && s.data.band !== b.id) { s.data.band = b.id; if (!(S.day - (s.data.parte || -99) < 5)) { s.data.parte = S.day; St.beat(s, 'vg-parte', { DEST: setName(b.set), FP: facName(fp) }); } } }
      // the same field: the world brought them together — what happens is the world's
      if (!p.captive && !t.captive && fighting(p) && fighting(t) && G.dist(p.x, p.y, t.x, t.y) < 7 && !(S.day - (s.data.met || -99) < 4)) {
        s.data.met = S.day; s.data.meets = (s.data.meets || 0) + 1; s.phase = 'confronto';
        St.beat(s, s.data.meets > 1 ? 'vg-de-novo' : 'vg-mesmo-campo', { at: St.where(p.x, p.y).at }, { x: p.x, y: p.y, hot: 30, toast: s.data.meets === 1, big: 1 });
      }
      // the killer in chains, among the protagonist's own people: one day they will stand before them
      if (t.captive && facOf(t) === facOf(p) && !p.captive && (t.set === p.set || G.dist(t.x, t.y, p.x, p.y) < 24)) { if (!s.data.caught) { s.data.caught = 1; St.beat(s, 'vg-alvo-cativo', { city: setName(t.set) }, { x: t.x, y: t.y }); } if (p.age >= 16 && s.phase !== 'frente') { s.data.prevPhase = s.phase; s.phase = 'frente'; } }
      else if (s.phase === 'frente') s.phase = s.data.prevPhase || 'preparar';
      if (p.coup && G.Politics && G.Fac.get(p.coup) && G.Politics.ruler(G.Fac.get(p.coup)) === t && !s.data.plot) { s.data.plot = 1; St.beat(s, 'vg-conspira', null, { x: p.x, y: p.y, log: true, hot: 25, big: 1 }); }
      // years of peace soften a gentle heart, or turn it to prayer; old age too
      const long = s.data.peaceFrom >= 0 && S.day - s.data.peaceFrom > 18;
      if (s.phase !== 'frente' && p.age >= 18 && ((long && q.agg < 0.5) || p.age > 60) && G.R() < 0.006) {
        if (q.pie > 0.58) { St.plantFrom('peregrinacao', { protag: p.id, score: 0.75, cast: { lost: s.cast.victim }, data: { rel: s.data.rel, lost: s.cast.victim, from: s.id }, motifs: ['gatilho:transformacao'] }, s.origin[0]); St.finish(s, 'transformada', 'sereno', St.say(s, 'vg-oracao')); }
        else St.finish(s, 'abandonada', 'sereno', St.say(s, 'vg-esquecer'));
      }
    },
    react(s, f) {
      if (f.k === 'paz' && ((f.fa === s.fac && f.fb === s.data.ft) || (f.fb === s.fac && f.fa === s.data.ft))) { if (s.phase !== 'tumulo') { s.data.peaceFrom = G.S.day; St.beat(s, 'vg-paz', { FT: facName(s.data.ft) }); } return true; }
      if (f.k !== 'morte' || s.phase === 'tumulo') return false;
      const at = St.where(f.x, f.y).at;
      if (f.a === s.cast.target) {
        if (f.b === s.protag) {
          const chains = !!f.cap;
          St.beat(s, chains ? 'vg-correntes' : 'vg-cumprida', { at }, { x: f.x, y: f.y, log: true, toast: true, hot: 30, big: 1 });
          const p = P(s.protag); if (p && G.Life) G.Life.bio(p, 'note', `Vingou ${REL_POSS[s.data.rel] || ''} ${(P(s.cast.victim) || {}).name || ''}: matou ${f.n.a}`.replace(/\s+/g, ' ').trim());
          if (p) { p.courage = Math.min(1, (p.courage || 0.5) + 0.06); }
          s.data.clima = chains ? 'correntes' : s.phase === 'confronto' ? 'duelo' : 'emboscada';
          if (graveOf(s.cast.victim) && p && !p.dead) { s.phase = 'tumulo'; s.data.doneDay = G.S.day; }
          else St.finish(s, 'cumprida', 'agridoce', null, { clima: s.data.clima, legend: true, bio: false });
        }
        else if (f.b) { const k = P(f.b); St.finish(s, 'roubada', 'agridoce', St.say(s, 'vg-outro', { K: k ? k.name : 'outra mão', SAME: k && facOf(k) === s.fac, MET: s.data.met === G.S.day && P(s.protag) && G.dist(P(s.protag).x, P(s.protag).y, f.x, f.y) < 14, at }), { x: f.x, y: f.y, log: true }); }
        else if (f.cause === 'old') St.finish(s, 'roubada', 'sereno', St.say(s, 'vg-velhice'));
        else St.finish(s, 'roubada', 'sereno', St.say(s, 'vg-acaso', { DEATH: deathTxt(f.a) }));
        return true;
      }
      if (f.a === s.protag) {
        const byT = f.b === s.cast.target;
        const txt = St.say(s, byT ? 'vg-morto-pelo-alvo' : 'vg-morreu', { at, DEATH: deathTxt(f.a), CAUSE: f.cause });
        St.chapter(s, txt, { x: f.x, y: f.y, big: byT ? 1 : 0, log: byT, toast: byT, k: byT ? 'vg-morto-pelo-alvo' : 'vg-morreu' });
        if (!St.bequeath(s, P(f.a), byT ? 'alvo' : 'morte')) St.finish(s, byT ? 'fracassada' : 'interrompida', 'tragico', null, { clima: byT ? 'duelo' : '' });
        return true;
      }
      return false;
    },
    // a few evenings of training when the anger has a plan; standing before the killer in chains; the grave
    urge(s, v) {
      if (s.phase === 'tumulo') return free(v) && graveOf(s.cast.victim) ? 0.4 : 0;
      if (s.phase === 'frente') return free(v) && alive(s.cast.target) && (s.data.visits || 0) < 3 && G.S.day - (s.data.visitDay || -99) >= 1 ? 0.3 : 0;
      return s.phase === 'preparar' && v.age >= 16 && alive(s.cast.target) && !fighting(v) ? 0.16 + pe(v).agg * 0.08 : 0;
    },
    task(s, v, H) {
      if (s.phase === 'tumulo') { const g = graveOf(s.cast.victim); if (!g) return null; const f = G.Village.frontTile(g); return St.go(s, v, H, { x: f[0], y: f[1], sub: 'tumulo', dur: 9, act: 'pray', emo: 'sad', fx: g.x + 1, fy: g.y + 1, max: 200 }); }
      if (s.phase === 'frente') { const t = P(s.cast.target); if (!t || !t.captive) return null; s.data.visitDay = G.S.day; return St.go(s, v, H, { x: t.x, y: t.y, follow: t.id, sub: 'frente', dur: 6, emo: 'angry', fx: t.x, fy: t.y, max: 160 }); }
      if (!s.data.trained) { s.data.trained = 1; St.beat(s, 'vg-treino'); }
      return H.setTask(v, { type: 'drill', pri: 1.02, saga: s.id });
    },
    done(s, v) {
      if (s.phase === 'tumulo') { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'vg-tumulo'), { x: v.x, y: v.y, log: true, clima: s.data.clima, legend: true }); return; }
      if (s.phase !== 'frente') return;
      // (they met when the errand arrived: the captive may have been led on since)
      const t = P(s.cast.target); if (!t || t.dead || !t.captive || G.dist(v.x, v.y, t.x, t.y) > 14) return;
      s.data.visits = (s.data.visits || 0) + 1;
      const q = pe(v);
      // what they do there is who they are: the cruel strike, the gentle let it go, the rest come back another day
      const strike = (q.cru > 0.55 || q.agg > 0.68) && q.pie < 0.62;
      const spare = !strike && (q.pie > 0.6 || (q.agg < 0.4 && s.data.visits >= 2) || s.data.visits >= 3);
      if (s.data.visits === 1) St.beat(s, 'vg-diante', null, { x: v.x, y: v.y, hot: 15 });
      if (strike) G.Vg.H.setTask(v, { type: 'combat', id: t.id, pri: 4.2, any: true, kind: 'combat', cause: 'vinganca' });
      else if (spare) {
        St.finish(s, 'perdoada', 'sereno', St.say(s, 'vg-perdao'), { x: v.x, y: v.y, log: true, toast: true, big: 1, clima: 'perdao', legend: true });
        G.Life && G.Life.bio(t, 'note', `${v.name}, que jurou vingança, ${t.g === 'f' ? 'a' : 'o'} poupou`);
      } else if (s.data.visits === 2) St.beat(s, 'vg-hesitou');
    },
    // (not while the killer is already in chains at home: the reckoning is here, not in a war)
    warPull: (s, v, enemy) => (alive(s.cast.target) && s.phase !== 'frente' && s.phase !== 'tumulo' && !(P(s.cast.target).captive && facOf(P(s.cast.target)) === facOf(v)) && enemy === peopleOf(P(s.cast.target)) ? 2.6 : 0),
    foe: s => (alive(s.cast.target) && s.phase !== 'tumulo' ? s.cast.target : 0),
    goal: (s, c) => (s.phase === 'tumulo' ? `Contar a ${c.V} que está feito.` : `Vingar ${c.V}${c.RELde ? ', ' + c.RELde + ' de ' + c.P : ''}, matando ${c.T}.`),
    status(s, c) {
      const t = P(s.cast.target);
      if (s.phase === 'tumulo') return `${c.T} está mort${c.oT}. Falta uma coisa: o túmulo de ${c.V}.`;
      if (s.phase === 'crescer') return `${c.P} ainda é criança. Brinca, aprende um ofício — e lembra.`;
      if (s.phase === 'frente') return `${c.T} trabalha acorrentad${c.oT} em ${setName(t && t.set) || 'algum lugar'}, perto de ${c.P}. ${s.data.visits ? `${c.P} já foi ${o3(c.oT) === 'a' ? 'vê-la' : 'vê-lo'} ${s.data.visits > 1 ? s.data.visits + ' vezes' : 'uma vez'}.` : 'Um dia, vão ficar cara a cara.'}`;
      if (s.phase === 'confronto') return `${c.P} e ${c.T} já se encontraram num campo de batalha.`;
      const where = t && !t.dead ? (t.captive ? `cativ${c.oT} em ${setName(t.set)}` : `vive em ${setName(t.set) || 'algum lugar'}`) : '';
      if (s.phase === 'preparar') return `${c.P} treina quando sobra tempo. ${c.T} ${where}.`;
      return `${c.P} leva a vida de sempre, mas não esqueceu. ${c.T} ${where}.`;
    },
    obstacles(s, c) {
      const out = []; const t = P(s.cast.target); const p = P(s.protag);
      if (p && p.age < 16) out.push(`${c.P} ainda é criança`);
      if (t && !t.dead && !t.captive && !atWar(peopleOf(p), peopleOf(t)) && peopleOf(p) !== peopleOf(t)) out.push(`${c.FP} e ${facName(peopleOf(t))} estão em paz`);
      if (t && (t.hero || (t.kills || 0) >= 4)) out.push(`${c.T} é um guerreiro temido — já derrubou ${t.kills || 'muitos'}`);
      if (t && t.reigned && G.Fac.get(t.reigned) && G.Fac.get(t.reigned).leader === t.id) out.push(`${c.T} governa, e anda cercad${c.oT} de guardas`);
      return out;
    },
    open: (s, c) => (s.phase === 'frente' ? [`matar ${c.T} entre as correntes`, `deixar ${c.T} viver`, `${c.T} fugir antes`] : [`encontrar ${c.T} numa batalha`, `${c.T} morrer antes, de outra forma`, `a raiva se apagar com os anos de paz`, `${c.P} morrer tentando — e alguém da família herdar a promessa`]),
    heirs: {
      minAge: 12, chance: 0.45,
      fit: (s, c) => (St.knows(c.id, s.origin[0]) ? 1 : 0.7) * (0.35 + pe(c).agg * 0.85) * (has(c, 'Medroso') ? 0.4 : 1),
      text: (s, c, why) => why === 'alvo' ? `${c.H}, ${c.DEADREL}, viu a mesma mão levar mais um dos seus. A promessa passou para ${c.oH === 'a' ? 'ela' : 'ele'}.` : `${c.P} morreu sem vingar ${c.V}. ${c.H}, ${c.DEADREL}, guardou a promessa.`,
    },
    // the one the heir avenges is now the one who carried the promise, if the target killed them
    inherited(s, heir, dead, why) { if (why === 'alvo') { s.data.firstVictim = s.data.firstVictim || s.cast.victim; s.cast.victim = dead.id; } s.phase = heir.age < 16 ? 'crescer' : 'preparar'; s.data.trained = 0; s.data.visits = 0; s.data.town = setName(heir.set); },
    titles: {
      juramento: c => `O Juramento de ${c.P}`,
      sangue: c => (c.s.place && c.s.place.name && c.s.place.town ? `O Sangue de ${c.s.place.name}` : null),
      duelo: c => `${c.P} e ${c.T}`,
      divida: c => `A Dívida de ${c.T}`,
      filho: c => (c.s.data.rel === 'pai' || c.s.data.rel === 'mae' ? `${c.p.g === 'f' ? 'A Filha' : 'O Filho'} de ${c.V}` : null),
      viuva: c => (c.s.data.rel === 'companheiro' ? `A Viúva de ${c.V}` : c.s.data.rel === 'companheira' ? `O Viúvo de ${c.V}` : null),
      irmao: c => (c.s.data.rel === 'irmao' || c.s.data.rel === 'irma' ? `${c.p.g === 'f' ? 'A Irmã' : 'O Irmão'} de ${c.V}` : null),
      sombra: c => `A Sombra de ${c.T}`, nome: c => `O Nome de ${c.T}`,
    },
    retitle(s, c) { return s.end && s.end.k === 'perdoada' ? `O Perdão de ${c.P}` : null; },
    forgotten: (s, c) => `Os anos passaram, e o nome de ${c.T} deixou de doer.`,
    taskText: (s, v, t) => (t.sub === 'tumulo' ? `Indo ao túmulo de ${(P(s.cast.victim) || {}).name || 'quem morreu'}` : t.sub === 'frente' ? `Indo ver ${(P(s.cast.target) || {}).name || 'o assassino'} de perto` : 'Treinando para o dia do acerto de contas'),
  });

  // ====================================================================================
  //  RESGATE — someone close carried off in chains; the captive still lives, somewhere
  // ====================================================================================
  K('rs-levado', { h: 'A captura', text: [
    c => `${c.FT} levou ${c.REL}, ${c.C}, acorrentad${c.oC}${c.at}. ${c.P} ficou para trás.`,
    c => `${c.C} foi levad${c.oC} por ${c.FT}${c.at}. Desde então, ${c.P} conta os dias.`,
    c => `Amarraram as mãos de ${c.C}${c.at} e ${o3(c.oC) === 'a' ? 'a' : 'o'} levaram com os outros cativos. ${c.P} viu a fila sumir na estrada.`,
  ] });
  K('rs-vigia', { h: 'A espera', text: [c => `${c.P} passou a ir até a beira de ${c.cityNow || 'casa'} no fim da tarde, olhando para o lado de ${c.city}.`, c => `Toda tarde, ${c.P} subia na mesma pedra na saída de ${c.cityNow || 'casa'} e ficava olhando o caminho de ${c.city}.`] });
  K('rs-plano', { h: 'O plano', text: [
    c => `${c.P} parou de olhar o horizonte: ia buscar ${c.C} em ${c.city}. Sozinh${c.o}, se fosse preciso.`,
    c => `${c.P} começou a juntar pão e a perguntar aos mercadores como era a estrada para ${c.city}. Não contou a ninguém por quê.`,
  ] });
  K('rs-partiu', { h: 'A partida', text: [c => `${c.P} saiu de ${c.cityNow || 'casa'} antes de clarear, rumo a ${c.city}, com uma faca e um pouco de pão.`, c => `${c.KIN ? c.KIN + ' implorou que não fosse. ' : ''}${c.P} foi assim mesmo, pelo caminho de ${c.city}.`] });
  K('rs-espreita', { h: 'Nos arredores', text: [c => `${c.P} chegou aos arredores de ${c.city} e se escondeu, esperando a noite.`, c => `Do mato, ${c.P} ficou olhando as casas de ${c.city} até o sol se pôr.`] });
  K('rs-libertou', { h: 'A noite', text: [
    c => `Na escuridão, ${c.P} entrou em ${c.city}, achou ${c.C} e cortou as cordas. Os dois correram para fora antes que alguém acordasse.`,
    c => `${c.P} atravessou ${c.city} de noite, de sombra em sombra, até onde ${c.C} dormia. Uma mão na boca, um sussurro — e os dois sumiram no escuro.`,
  ] });
  K('rs-pego', { h: 'A noite', text: [c => `${c.P} entrou em ${c.city} de noite, mas ${c.GUARD} viu. Antes de chegar perto de ${c.C}, ${c.P} já estava no chão, amarrad${c.o}.`, c => `Um cão latiu, uma tocha se acendeu: ${c.GUARD} pegou ${c.P} a poucos passos de ${c.C}.`] });
  K('rs-fugiu', { h: 'A noite', text: [c => `${c.P} chegou perto de ${c.C}, mas ${c.GUARD} deu o alarme. ${c.P} teve que correr — sozinh${c.o}.`] });
  K('rs-recapturado', { h: 'Pegos de novo', text: [c => `Pegaram ${c.C} de novo antes de chegar em casa. ${c.P} não desistiu.`] });
  K('rs-mudou', { h: 'Para mais longe', text: [c => `${c.C} foi levad${c.oC} para ${c.city}.`] });
  K('rs-guerra', { h: 'A guerra', text: [c => `${c.FP} entrou em guerra contra ${c.FT}. ${c.C} ainda estava em ${c.city}.`] });
  K('rs-parte', { h: 'A marcha', text: [c => `${c.P} marchou com o exército de ${c.FP} contra ${c.city}, onde ${c.C} estava.`] });
  K('rs-voltou', { h: 'O reencontro', text: [
    c => `${c.C} voltou para ${c.cityNow || 'casa'}. ${c.P} estava lá.`,
    c => c.yrs > 1 ? `Depois de ${c.an(c.yrs)}, ${c.C} voltou para casa — e ${c.P} ainda esperava.` : null,
    c => c.RESC ? `${c.P} e ${c.C} chegaram juntos a ${c.cityNow || 'casa'}, sujos, famintos e vivos.` : null,
  ] });
  K('rs-voltou-povo', { h: 'Livre', text: [
    c => c.CONQ && c.NEAR ? `${c.CNOW} caiu para ${c.FP} antes que a noite chegasse — e ${c.C} saiu das correntes sem precisar de ninguém. ${c.P}, que esperava escondid${c.o} no mato, correu ao encontro ${c.oC === 'a' ? 'dela' : 'dele'}.` : null,
    c => c.CONQ && !c.NEAR ? `${c.FP} tomou ${c.CNOW}, e as correntes de ${c.C} caíram junto com a cidade. ${c.P} soube no mesmo dia, e chorou de alívio.` : null,
    c => !c.CONQ ? `${c.C} está livre outra vez, entre a própria gente${c.CNOW ? ', em ' + c.CNOW : ''}.` : null,
  ] });
  K('rs-assimilado', { h: 'Gente de lá', text: [c => `${c.C} deixou de ser cativ${c.oC}: agora vive entre ${c.FT}, como gente de lá.`] });
  K('rs-livre-longe', { h: 'Livre, longe', text: [c => `${c.C} está livre, mas vive ${c.CNOW ? 'em ' + c.CNOW : 'longe'}, longe de ${c.P}.`] });
  K('rs-correntes-juntos', { h: 'Correntes', text: [c => (c.FREED ? `Os guardas alcançaram os dois antes da fronteira. ${c.P} e ${c.C} voltaram acorrentados para ${c.city} — juntos, pelo menos.` : `${c.P} também foi capturad${c.o} — e reencontrou ${c.C} no cativeiro, em ${c.city}.`)] });
  K('rs-correntes', { h: 'Correntes', text: [c => `${c.P} também foi capturad${c.o} por ${c.FT}.`] });
  K('rs-morto', { h: 'O fim', text: [c => `${c.C} ${c.DEATH} no cativeiro${c.city ? ', em ' + c.city : ''}.`] });
  K('rs-morreu', { h: 'O fim', text: [c => (c.ROAD ? `${c.P} ${c.DEATH} no caminho de ${c.city}, onde ${c.C} esperava sem saber de nada.` : `${c.P} ${c.DEATH} sem rever ${c.C}.`)] });

  // where to wait for the night: outside the captive's town, on the side one comes from
  function outskirts(to, from) {
    const a = Math.atan2(from.cy - to.cy, from.cx - to.cx), r = (to.radius || 6) + 4;
    return W.nearestLand(to.cx + Math.cos(a) * r, to.cy + Math.sin(a) * r, 5);
  }
  St.define('resgate', {
    name: 'Resgate', icon: 'chain', tone: 'esperanca', tags: ['resgate', 'família'], struct: 'separacao-reencontro', seedLife: 5, maxDays: 70, ripe: 1,
    stages: [['levado', 'Levado'], ['espera', 'A espera'], ['plano', 'O plano'], ['noite', 'A noite'], ['volta', 'De volta']],
    stage(s) { return s.st === 'fim' ? (s.end.k === 'reencontro' ? 4 : -1) : s.phase === 'fuga' ? 4 : s.phase === 'noite' ? 3 : s.phase === 'plano' ? 2 : 1; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.town))} que não aceita que ${c.C}, ${REL_BARE[s.data.rel] ? REL_BARE[s.data.rel].replace(/^(o|a) /, '') : 'alguém d' + c.o + ' família'} de ${c.P}, viva acorrentad${c.oC} em ${c.city}.`,
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
            data: { rel, ft: f.fb, city: f.set, cityName: f.n.set, at: w.at, town: setName(p.set), names: { [f.a]: f.n.a } }, motifs: ['rel:' + rel, 'gatilho:captura', 'amb:guerra'] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    // (not if they are already running home on their own: that is their story, not this one)
    valid: sd => { const c = P(sd.cast.captive); return !!(c && !c.dead && c.captive && !(c.task && c.task.type === 'escape')); },
    begin(s) { s.phase = 'saudade'; s.data.war = warSince(facOf(P(s.protag)), s.data.ft); St.beat(s, 'rs-levado', null, { x: s.place.x, y: s.place.y }); },
    tick(s) {
      const S = G.S; const p = P(s.protag), c = P(s.cast.captive); if (!p || p.dead || !c || c.dead) return;
      if (!c.captive) {
        const cn = setName(c.set);
        if (!p.dead && c.set === p.set) St.finish(s, 'reencontro', 'feliz', St.say(s, 'rs-voltou', { RESC: s.data.freed ? 1 : 0 }), { x: c.x, y: c.y, log: true, toast: true, big: s.data.freed ? 1 : 0, legend: !!s.data.freed, clima: s.data.freed ? 'resgate' : '' });
        else if (facOf(c) === s.fac) {
          // (freed because the town they were held in fell to their own people?)
          const cs = S.settlements.get(c.set); const conq = !!(cs && cs.fac === s.fac && c.set === s.data.city);
          St.finish(s, 'reencontro', 'feliz', St.say(s, 'rs-voltou-povo', { CNOW: cn, CONQ: conq ? 1 : 0, NEAR: G.dist(p.x, p.y, c.x, c.y) < 16 ? 1 : 0 }), { x: c.x, y: c.y, log: true, toast: conq, big: conq ? 1 : 0 });
        }
        else if (facOf(c) === s.data.ft) St.finish(s, 'transformada', 'agridoce', St.say(s, 'rs-assimilado'));
        else St.finish(s, 'reencontro', 'agridoce', St.say(s, 'rs-livre-longe', { CNOW: cn }));
        return;
      }
      if (c.set !== s.data.city && setName(c.set)) { s.data.city = c.set; s.data.cityName = setName(c.set); s.data.ft = facOf(c); St.beat(s, 'rs-mudou'); }
      if (p.captive && !s.data.pcap) {
        s.data.pcap = 1;
        if (p.set === c.set) { St.finish(s, 'reencontro', 'agridoce', St.say(s, 'rs-correntes-juntos', { FREED: s.data.freed ? 1 : 0 }), { log: true, x: p.x, y: p.y, big: s.data.freed ? 1 : 0 }); return; }
        St.beat(s, 'rs-correntes');
      }
      // freed by the one who came for them, then caught again on the way home
      if (s.phase === 'fuga' && c.captive && !(c.task && c.task.type === 'escape')) { s.phase = 'plano'; St.beat(s, 'rs-recapturado'); }
      const fp = facOf(p), ft = facOf(c);
      if (!p.captive && atWar(fp, ft)) { const r = G.Fac.rel(fp, ft); if (r && s.data.war !== r.since) { s.data.war = r.since; if (!(G.S.day - (s.data.warBeat || -99) < 8)) { s.data.warBeat = G.S.day; St.beat(s, 'rs-guerra', { FP: facName(fp), FT: facName(ft) }); } } }
      if (p.task && p.task.type === 'band' && G.War.bands) { const b = G.War.bands.get(p.task.band); if (b && b.set === c.set && s.data.band !== b.id) { s.data.band = b.id; if (!(G.S.day - (s.data.parteD || -99) < 6)) { s.data.parteD = G.S.day; St.beat(s, 'rs-parte', { FP: facName(fp) }); } } }
      // after a while of waiting, the brave decide to go and get them (only where a road leads there)
      if (s.phase === 'saudade' && s.data.watched && S.clock - (s.data.watchT || S.clock) > G.DAY_LEN * 0.35 && !p.captive && p.age >= 16 && p.age <= 60 && (p.courage >= 0.42 || REL_W[s.data.rel] >= 0.9) && !has(p, 'Medroso')) {
        const to = S.settlements.get(c.set), from = homeOf(p);
        if (to && from && to.id !== from.id && W.sameLand(from.cx, from.cy, to.cx, to.cy) && G.R() < 0.08) { s.phase = 'plano'; St.beat(s, 'rs-plano'); }
      }
    },
    react(s, f) {
      if (f.k !== 'morte') return false;
      if (f.a === s.cast.captive) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'rs-morto', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y, log: true }); return true; }
      if (f.a === s.protag) {
        St.chapter(s, St.say(s, 'rs-morreu', { DEATH: deathTxt(f.a), ROAD: s.phase === 'noite' || s.phase === 'fuga' }), { k: 'rs-morreu', x: f.x, y: f.y });
        if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'tragico', null);
        return true;
      }
      return false;
    },
    // an evening now and then at the edge of town; then, for the brave, the road to the captors' town
    urge(s, v) {
      const c = P(s.cast.captive); if (v.age < 12 || v.captive || !c || !c.captive) return 0;
      if (s.phase === 'plano') return free(v) && homeSafe(v) && (s.data.tries || 0) < 3 ? 0.24 : 0;
      if (s.phase === 'noite') return v.hunger < 75 ? 0.35 : 0; // the road to them, if something interrupted it
      return homeSafe(v) && s.phase === 'saudade' ? 0.1 : 0;
    },
    task(s, v, H) {
      const c = P(s.cast.captive); const set = homeOf(v), to = G.S.settlements.get(c.set); if (!set || !to) return null;
      if (s.phase === 'plano' || s.phase === 'noite') {
        const spot = outskirts(to, set); if (!spot) return null;
        if (s.phase === 'plano') { s.data.tries = (s.data.tries || 0) + 1; const k = kinNear(v, 10); St.beat(s, 'rs-partiu', { KIN: k ? k.txt : '' }, { x: v.x, y: v.y }); }
        s.phase = 'noite';
        return St.journey(s, v, H, { x: spot[0], y: spot[1], sub: 'resgate', dur: 4, back: false, emo: '', fx: to.cx, fy: to.cy });
      }
      const a = Math.atan2(to.cy - set.cy, to.cx - set.cx), r = (set.radius || 6) + 2;
      const spot = W.nearestLand(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 4); if (!spot) return null;
      if (!s.data.watched) { s.data.watched = 1; s.data.watchT = G.S.clock; St.beat(s, 'rs-vigia'); }
      return St.go(s, v, H, { x: spot[0], y: spot[1], sub: 'vigia', dur: 10, emo: 'sad', fx: to.cx, fy: to.cy });
    },
    road: (s, v, t, r) => roadBeat(s, v, r),
    camp: (s, v, t) => campBeat(s, v, t),
    arrive(s, v) { if (s.phase === 'noite' && !s.data.lurk) { s.data.lurk = 1; St.beat(s, 'rs-espreita', null, { x: v.x, y: v.y }); } },
    // at the town's edge: wait for the dark, then go in
    done(s, v, t) {
      if (s.phase !== 'noite') return;
      if (!G.isNight()) { t.left = 3; return 'stay'; }
      const c = P(s.cast.captive); if (!c || !c.captive) return;
      t.st = 6; t.tid = c.id; t.rt = 0; t.left = 0; return 'stay';
    },
    // the night: walk in, find them, and the world decides who is awake
    step(s, v, t, dt, H) {
      const c = P(t.tid); if (!c || !c.captive || c.dead) return H.end(v);
      t.rt -= dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 2; if (!H.goto(v, c.x, c.y, true, 20000)) return H.end(v); }
      v.act = ''; H.move(v, dt, 0.85);
      if (G.dist(v.x, v.y, c.x, c.y) > 1.4) { if (t.age > 900) H.end(v); return; }
      // who is awake nearby: guards above all
      const S = G.S; const cf = facOf(c); let guard = null, risk = 0;
      for (const o of S.villagers.values()) {
        if (o.captive || o.sleeping || o.inside || o.age < 16 || facOf(o) !== cf) continue;
        const d2 = G.dist2(o.x, o.y, v.x, v.y); if (d2 > 49) continue;
        const r = o.role === 'guerreiro' ? 0.4 : 0.15; risk = 1 - (1 - risk) * (1 - r); if (!guard || o.role === 'guerreiro') guard = o;
      }
      if (has(v, 'Medroso')) risk *= 1.3;
      const city = setName(c.set);
      if (guard && G.R() < risk) {
        if (guard.role === 'guerreiro' && G.R() < 0.6) { St.beat(s, 'rs-pego', { GUARD: guard.name }, { x: v.x, y: v.y, log: true, big: 1, hot: 15 }); G.War.capture(v, guard); s.phase = 'plano'; return; }
        St.beat(s, 'rs-fugiu', { GUARD: guard.name }, { x: v.x, y: v.y, big: 1 }); s.phase = 'plano';
        H.flee(v, guard.x, guard.y, 10, 'war'); return;
      }
      if (!G.War.startEscape(c)) return H.end(v);
      s.data.freed = 1; s.phase = 'fuga';
      St.beat(s, 'rs-libertou', { city }, { x: v.x, y: v.y, log: true, toast: true, big: 1, hot: 25 });
      G.Life && G.Life.bio(v, 'note', `Entrou em ${city} de noite e libertou ${c.name}`);
      // and home, running
      t.leg = 1; t.legs = 2; t.st = 0; t.hurry = 1.25; t.road = []; t.noCamp = 1; // (no sleeping on the way: they run all night)
    },
    home(s, v) { /* the reunion is seen by the tick, when the captive is home too */ },
    blocked(s) { s.phase = 'plano'; s.data.tries = (s.data.tries || 0) + 1; },
    warPull: (s, v, enemy) => { const c = P(s.cast.captive); return c && c.captive && enemy === facOf(c) ? 2.2 : 0; },
    // a people at war with the captors goes for the city where its own are held — when the one who
    // grieves is its ruler, or kin of the ruler; otherwise only sometimes
    target(s, f, enemy) {
      const c = P(s.cast.captive); if (!c || c.dead || !c.captive || facOf(c) !== enemy.id || s.fac !== f.id) return 0;
      const ruler = P(f.leader); const close = ruler && (ruler.id === s.protag || St.relOf(ruler, c));
      return close || G.hash(s.id * 7 + G.S.day) < 0.3 ? c.set : 0;
    },
    goal: (s, c) => `Ver ${c.C}${c.REL ? ', ' + c.REL.replace(/^(seu|sua) /, '') + ' de ' + c.P : ''}, livre outra vez.`,
    status(s, c) {
      const cp = P(s.cast.captive); if (!cp) return '';
      if (s.phase === 'fuga') return `${c.P} e ${c.C} fogem no escuro, de volta para casa.`;
      if (s.phase === 'noite') return `${c.P} foi buscar ${c.C} em ${setName(cp.set) || '?'}. Espera a noite cair.`;
      if (s.phase === 'plano') return `${c.C} está cativ${c.oC} em ${setName(cp.set) || '?'}. ${c.P} decidiu ir buscá-l${c.oC}${s.data.tries ? ` (já tentou ${s.data.tries > 1 ? s.data.tries + ' vezes' : 'uma vez'})` : ''}.`;
      return cp.captive ? `${c.C} está cativ${c.oC} em ${setName(cp.set) || '?'}, entre ${facName(facOf(cp))}. ${c.P} espera.` : '';
    },
    obstacles(s, c) { const cp = P(s.cast.captive), p = P(s.protag); const out = []; if (cp && p && !atWar(facOf(p), facOf(cp))) out.push(`${c.FP} não está em guerra com quem tem ${c.C}`); if (cp) out.push(`${setName(cp.set) || 'a cidade'} tem gente acordada à noite — e guerreiros`); return out; },
    open: (s, c) => [`${c.P} entrar em ${c.city} de noite e trazer ${c.C}`, `${c.FP} atacar a cidade`, `${c.C} fugir sozinh${c.oC}`, `${c.C} virar gente de lá`, `${c.C} morrer no cativeiro`],
    heirs: { minAge: 12, chance: 0.4, fit: (s, cand) => (St.relOf(cand, P(s.cast.captive)) ? 1 : 0.25) * (0.5 + cand.courage * 0.5), text: (s, c) => `${c.P} morreu sem rever ${c.C}. ${c.H}, ${c.DEADREL}, não desistiu.` },
    inherited(s, heir) { s.phase = 'saudade'; s.data.watched = 0; s.data.tries = 0; s.data.town = setName(heir.set); },
    titles: {
      correntes: c => (c.s.data.rel === 'filha' ? 'A Filha das Correntes' : c.s.data.rel === 'filho' ? 'O Filho das Correntes' : null),
      por: c => `Por ${c.C}`, resgate: c => `O Resgate de ${c.C}`, as: c => `As Correntes de ${c.C}`, espera: c => `A Espera de ${c.P}`,
      caminho: c => (c.city ? `O Caminho até ${c.city}` : null), noite: c => (c.city ? `Uma Noite em ${c.city}` : null),
    },
    forgotten: (s, c) => `Os anos passaram. ${c.P} parou de olhar para o lado de ${c.city || 'longe'}.`,
    taskText: (s, v, t) => (t.st === 6 ? `Entrando em ${(G.S.settlements.get((P(s.cast.captive) || {}).set) || {}).name || 'a cidade'} no escuro` : t.j ? (t.leg ? 'Fugindo de volta para casa' : t.st === 2 ? 'Escondid' + (v.g === 'f' ? 'a' : 'o') + ', esperando a noite' : `A caminho de ${(G.S.settlements.get((P(s.cast.captive) || {}).set) || {}).name || 'longe'}`) : t.st < 2 ? 'Indo até a beira da vila' : `Olhando para o lado de ${(G.S.settlements.get(P(s.cast.captive) ? P(s.cast.captive).set : 0) || {}).name || 'longe'}`),
  });

  // ====================================================================================
  //  VOLTA — the road home: a captive who escapes, or a freed one who misses the old city
  // ====================================================================================
  K('vt-fugiu', { h: 'A fuga', text: [
    c => `Depois de ${c.an(c.CAPT)} de cativeiro em ${c.FROM}, ${c.P} fugiu, rumo a ${c.home}.`,
    c => `${c.P} escapou de ${c.FROM} e tomou o caminho de ${c.home}.`,
    c => `${c.P} esperou o guarda virar as costas e correu. ${c.home} ficava ${c.DIR}.`,
  ] });
  K('vt-recapturado', { h: 'Pegos', text: [c => `${c.P} foi peg${c.o} de volta antes de chegar.`, c => `Pegaram ${c.P} de novo, antes que chegasse.`] });
  K('vt-de-novo', { h: 'De novo', text: [c => `${c.P} tentou de novo.`, c => `Nem as correntes mais curtas seguraram ${c.P}: fugiu outra vez.`] });
  K('vt-chegou', { h: 'Casa', text: [c => (c.KIN ? `${c.P} chegou a ${c.home}. ${c.KIN} ainda morava lá.` : `${c.P} chegou a ${c.home}. Estava em casa.`), c => (c.KIN2 ? `Quando ${c.P} apareceu na entrada de ${c.home}, ${c.KIN2} largou o que tinha nas mãos e correu.` : null)] });
  K('vt-saudade', { h: 'Saudade', text: [c => `${c.P} ajudou a fundar ${c.NEW}, longe de ${c.home}. Mas a casa de ${c.P} era ${c.home}.`] });
  K('vt-partiu', { h: 'A partida', text: [c => `${c.P} deixou ${c.cityNow || 'a vila'} para rever ${c.home}, ${c.DIR}.`, c => `${c.KIN ? c.KIN + ' foi até a saída da vila. ' : ''}${c.P} pegou o caminho de ${c.home}.`] });
  K('vt-reviu', { h: 'Rever', text: [c => (c.OWN ? `${c.P} voltou a ver ${c.home}. A cidade agora era de ${c.OWN}, e as ruas tinham outros nomes.` : `${c.P} voltou a ver ${c.home}. Andou pelas ruas tentando reconhecer as portas.`)] });
  K('vt-voltou-novo', { h: 'A outra casa', text: [c => `${c.P} voltou para ${c.NEW}. ${c.home} era um lugar da memória; a casa, agora, era esta.`] });
  K('vt-morreu-longe', { h: 'O fim', text: [c => `${c.P} morreu${c.WHERE || ' longe'}, sem voltar a ver ${c.home}.`] });
  K('vt-morto-fuga', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} durante a fuga.`] });
  K('vt-morto-cativo', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} de novo nas correntes, sem voltar a ver ${c.home}.`, c => `Pegaram ${c.P} de volta, e foi ali mesmo, cativ${c.o}, que ${c.P} ${c.DEATH.replace(/ aos \d+ anos/, '')}.`] });
  K('vt-sem-casa', { h: 'Sem casa', text: [c => `${c.homeName} não existe mais. Não havia para onde voltar.`] });
  K('vt-sem-caminho', { h: 'Sem caminho', text: [c => `O caminho até ${c.home} estava fechado. ${c.P} desistiu.`] });

  St.define('volta', {
    name: 'Volta para casa', icon: 'home', tone: 'esperanca', tags: ['retorno', 'esperança'], struct: 'exilio-retorno', seedLife: 3, maxDays: 50, ripe: 0,
    stages: [['cativeiro', 'O cativeiro'], ['fuga', 'A fuga'], ['estrada', 'A estrada'], ['casa', 'Casa']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; if (s.data.mode === 'saudade') return onJourney(P(s.protag)) ? 2 : 0; return s.phase === 'cativeiro' ? 0 : (s.data.road || []).length ? 2 : 1; },
    logline: (s, c) => (s.data.mode === 'fuga' ? `${cap1(desc(c.p, ''))} cativ${c.o} em ${s.data.fromName || 'terra estranha'} há ${c.an(Math.max(1, s.data.capt || 1))} foge de volta para ${c.home}.` : `${cap1(desc(c.p))} que nunca deixou de ser de ${c.home}.`),
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
          const nw = G.S.settlements.get(f.set); if (!nw || G.dist(nw.cx, nw.cy, h.cx, h.cy) < 14 || !W.sameLand(nw.cx, nw.cy, h.cx, h.cy)) continue;
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
      const p = P(s.protag); const home = G.S.settlements.get(s.data.home);
      if (s.data.mode === 'fuga') St.beat(s, 'vt-fugiu', { CAPT: s.data.capt || 1, FROM: s.data.fromName || 'terra estranha', DIR: p && home ? St.dir(p.x, p.y, home.cx, home.cy) : 'longe' });
      else St.beat(s, 'vt-saudade', { NEW: s.data.newName });
    },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      const home = G.S.settlements.get(s.data.home);
      if (!home) { St.finish(s, 'interrompida', 'agridoce', St.say(s, 'vt-sem-casa', { homeName: s.data.homeName })); return; }
      if (s.data.mode === 'fuga') {
        if (!p.captive && p.set === home.id) {
          const k = St.kin(p).find(q => q.set === home.id); const rel = k ? St.relOf(p, k) : null;
          St.finish(s, 'cumprida', 'feliz', St.say(s, 'vt-chegou', { KIN: k ? (rel ? `${cap1(REL_POSS[rel])}, ${k.name},` : k.name) : '', KIN2: k ? (rel ? `${REL_POSS[rel]}, ${k.name},` : k.name) : '' }), { x: p.x, y: p.y, log: true });
          return;
        }
        if (!p.captive) { St.finish(s, 'transformada', 'agridoce', `${p.name} está livre, mas longe de ${home.name}.`); return; }
        const escaping = p.task && p.task.type === 'escape';
        if (s.phase === 'fuga' && !escaping && p.task && p.task.type === 'escorted') { s.phase = 'cativeiro'; St.beat(s, 'vt-recapturado'); }
        else if (s.phase === 'cativeiro' && escaping) { s.phase = 'fuga'; St.beat(s, 'vt-de-novo'); }
        // the road of the escape: what the runner passes is the world's
        if (escaping) { const pt = s.data.rt || (s.data.rt = { x: home.cx, y: home.cy, road: [], homeBiome: St.biomeAt(p.x, p.y) }); St.trail(s, p); const r = St.roadWatch(s, p, pt); if (r) roadBeat(s, p, r); s.data.road = pt.road; }
      }
    },
    react(s, f) {
      if (f.k === 'morte' && f.a === s.protag) {
        if (s.data.mode === 'fuga' && s.phase === 'fuga') St.finish(s, 'fracassada', 'tragico', St.say(s, 'vt-morto-fuga', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y });
        else if (s.data.mode === 'fuga' && s.phase === 'cativeiro') St.finish(s, 'fracassada', 'tragico', St.say(s, 'vt-morto-cativo', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y });
        else St.finish(s, 'interrompida', 'agridoce', St.say(s, 'vt-morreu-longe', { WHERE: St.where(f.x, f.y).at }));
        return true;
      }
      return false;
    },
    urge(s, v) {
      if (s.data.mode !== 'saudade' || !free(v) || v.age > 74 || !homeSafe(v)) return 0;
      const home = G.S.settlements.get(s.data.home); if (!home || atWar(facOf(v), home.fac)) return 0;
      return s.data.went ? (s.data.back ? 0 : 0.2) : 0.09;
    },
    task(s, v, H) {
      const home = G.S.settlements.get(s.data.home); if (!home) return null;
      const spot = W.nearestLand(home.cx + 0.5, home.cy + 0.5, 4); if (!spot) return null;
      if (s.data.went) return St.journey(s, v, H, { x: spot[0], y: spot[1], leg: 1, sub: 'jornada' });
      if (!s.data.left) { s.data.left = 1; const k = kinNear(v, 10); St.beat(s, 'vt-partiu', { DIR: St.dir(v.x, v.y, home.cx, home.cy), KIN: k ? k.txt : '' }, { x: v.x, y: v.y }); }
      return St.journey(s, v, H, { x: spot[0], y: spot[1], sub: 'jornada', dur: 14, emo: 'happy' });
    },
    road: (s, v, t, r) => roadBeat(s, v, r),
    camp: (s, v, t) => campBeat(s, v, t),
    done(s, v) { s.data.went = 1; const home = G.S.settlements.get(s.data.home); const own = home && s.data.homeFac && home.fac !== s.data.homeFac ? facName(home.fac) : ''; s.data.own = own; St.beat(s, 'vt-reviu', { OWN: own }, { x: v.x, y: v.y, log: true, big: 1, hot: 15 }); },
    home(s, v) { s.data.back = 1; St.finish(s, 'cumprida', s.data.own ? 'agridoce' : 'sereno', St.say(s, 'vt-voltou-novo', { NEW: setName(v.set) || s.data.newName }), { x: v.x, y: v.y, log: true }); },
    blocked(s) { s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) St.finish(s, 'interrompida', 'agridoce', St.say(s, 'vt-sem-caminho')); },
    goal: (s, c) => (s.data.mode === 'saudade' ? `Rever ${c.home} antes de morrer.` : `Chegar a ${c.home}.`),
    status(s, c) { const p = P(s.protag); if (!p) return ''; if (s.data.mode === 'fuga') return p.captive && s.phase === 'cativeiro' ? `${c.P} foi recapturad${c.o}, mas não esqueceu o caminho.` : `${c.P} está em fuga, a caminho de ${c.home}.`; return onJourney(p) ? `${c.P} está na estrada${s.data.went ? ', voltando de ' + c.home : ' para ' + c.home}.` : `${c.P} vive em ${setName(p.set) || '?'}, e pensa em ${c.home}.`; },
    obstacles(s, c) { const home = G.S.settlements.get(s.data.home), p = P(s.protag); const out = []; if (s.data.mode === 'fuga') out.push('os guardas de quem o mantinha cativo'); if (home && p && atWar(facOf(p), home.fac)) out.push(`${c.home} pertence a um povo em guerra com ${c.FP}`); return out; },
    open: (s, c) => [`chegar a ${c.home}`, s.data.mode === 'fuga' ? `ser recapturad${c.o}` : 'fazer de outro lugar a sua casa', 'morrer no caminho'],
    titles: {
      volta: c => 'O Caminho de Volta', de: c => `De Volta a ${c.home}`, estrada: c => `A Longa Estrada de ${c.P}`,
      saudade: c => (c.s.data.mode === 'saudade' ? `Saudade de ${c.home}` : null), fuga: c => (c.s.data.mode === 'fuga' ? `A Fuga de ${c.P}` : null),
    },
    forgotten: (s, c) => `${c.P} acabou fazendo de outro lugar a sua casa.`,
    taskText: (s, v, t) => (t.st === 4 ? 'Dormindo ao relento, na estrada' : t.leg ? 'Voltando para casa' : t.st < 2 ? `A caminho de ${(G.S.settlements.get(s.data.home) || {}).name || 'casa'}` : `Revendo ${(G.S.settlements.get(s.data.home) || {}).name || 'a cidade antiga'}`),
  });

  // ====================================================================================
  //  RECONQUISTA — a ruler who lost a city; the loss leans on the choices a ruler already makes
  // ====================================================================================
  K('rq-perda', { h: 'A perda', text: [
    c => `${c.city} caiu para ${c.FT}${c.s.data.cap ? ' — e era a capital' : ''}. ${c.TITLE ? cap1(c.TITLE) + ' ' : ''}${c.P} não esqueceu.`,
    c => pe(c.p).amb >= 0.5 ? `${c.FT} tomou ${c.city}. ${c.P}, que governava ${c.FP}, jurou que a cidade voltaria.` : null,
    c => c.s.data.cap ? `Com ${c.city} perdida, ${c.FP} teve que mudar de capital. ${c.P} não perdoou — nem a si mesm${c.o}.` : null,
  ] });
  K('rq-guerra', { h: 'A guerra', text: [c => `${c.FP} voltou a guerrear com ${c.FT}. ${c.P} queria ${c.city} de volta.`] });
  K('rq-declarou', { h: 'A declaração', text: [c => `${c.P} declarou guerra a ${c.FT}. O motivo tinha nome: ${c.city}.`] });
  K('rq-marcha', { h: 'A marcha', text: [c => `O exército de ${c.FP} marchou contra ${c.city}.`, c => `As tropas de ${c.FP} saíram para retomar ${c.city}. ${c.P} foi vê-las partir.`] });
  K('rq-retomada', { h: 'A retomada', text: [c => `${c.city} voltou a ser de ${c.FP}${c.alive ? ', e ' + c.P + ' viveu para ver' : ''}.`, c => c.alive ? `${c.P} entrou em ${c.city} de novo — devagar, olhando cada casa, como quem volta para casa.` : null] });
  K('rq-queda', { h: 'O fim de um povo', text: [c => `${c.FP} deixou de existir. ${c.city} ficou para sempre com ${c.FT}.`] });
  K('rq-aceitou', { h: 'Os anos de paz', text: [c => `Os anos de paz com ${c.FT} pesaram mais. ${c.P} deixou ${c.city} para os cronistas.`] });
  K('rq-sumiu', { h: 'Ruínas', text: [c => `${c.city} foi abandonada. Não havia mais o que retomar.`] });
  K('rq-deposto', { h: 'Sem trono', text: [c => `${c.P} perdeu o poder. A obsessão por ${c.city} ficou sem trono.`] });
  K('rq-novo-dono', { h: 'Outras mãos', text: [c => `${c.city} passou para ${c.FT}.`] });
  K('rq-esquecida', { h: 'Esquecida', text: [c => `${c.P} morreu sem retomar ${c.city}. Quem veio depois tinha outras guerras.`] });

  St.define('reconquista', {
    name: 'Reconquista', icon: 'crown', tone: 'epico', ripe: 1, tags: ['política', 'guerra', 'legado'], struct: 'perda-retomada', seedLife: 6, maxDays: 90,
    stages: [['perda', 'A perda'], ['obsessao', 'A obsessão'], ['guerra', 'A guerra'], ['retomada', 'A retomada']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return atWar(s.data.fp, (G.S.settlements.get(s.data.city) || {}).fac) ? 2 : 1; },
    logline: (s, c) => `${c.TITLE ? cap1(c.TITLE) + ' ' : ''}${c.P} perdeu ${c.city} para ${c.FT} e não vai descansar até tê-la de volta.`,
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
      if (city.fac === fp.id) { St.finish(s, 'cumprida', 'feliz', St.say(s, 'rq-retomada'), { x: city.cx, y: city.cy, log: true, toast: true, big: 1, legend: true }); return; }
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
      if (f.k === 'guerra' && f.story === s.id) { s.data.declared = 1; St.beat(s, 'rq-declarou', null, { big: 1, log: true }); return true; }
      if (f.k === 'morte' && f.a === s.protag) { s.data.waitHeir = G.S.day; s.data.dead = f.a; return true; }
      // the crown passes: kin of the one who lost the city may take up the obsession with it
      if (f.k === 'coroa' && f.fac === s.data.fp && s.data.waitHeir) {
        const heir = P(f.a), dead = P(s.data.dead);
        const kin = heir && dead && St.relOf(heir, dead);
        if (heir && kin && G.R() < 0.35 + pe(heir).amb * 0.4) {
          St.chapter(s, `${dead.name} morreu sem retomar ${s.data.cityName}. ${heir.name}, que herdou a coroa, herdou também a obsessão.`, { log: true, big: 1, k: 'heranca' });
          s.prev.push(s.protag); s.protag = heir.id; s.gen++; s.data.waitHeir = 0; St.reindex(); St.logline(s);
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
  //  SONHO — a child hears a tale about a real place far away, and wants to see it one day.
  //  Only if it is TRUE: the place is far from their town, they have never been near anything like it
  //  (the sea for an inland child; a lake, a peak, a waterfall, a cave, a wonder), and a road leads there.
  // ====================================================================================
  const KIND_IC = { mar: 'sea', caverna: 'cave', maravilha: 'wonder', pico: 'mountain', lago: 'mountain', cachoeira: 'mountain', cratera: 'meteor', monte: 'mountain' };
  K('sn-ouviu', { h: 'O conto', text: [
    c => `${c.P}, aos ${c.AGE} anos, ouviu ${c.TELLER} contar sobre ${c.X}. Desde então quis ver com os próprios olhos.`,
    c => `Junto à fogueira, ${c.TELLER} falou ${deArt(c.X)}. ${c.P} tinha ${c.AGE} anos e nunca mais tirou aquilo da cabeça.`,
    c => c.KIND === 'mar' ? `${c.TELLER} contou do mar: água que não acaba, que mexe sozinha e é salgada. ${c.P}, ${c.AGE} anos, nascid${c.o} longe de tudo aquilo, não acreditou — e quis ver.` : null,
    c => c.KIND === 'pico' ? `${c.TELLER} falou ${deArt(c.X)}, tão alt${art(c.X) === 'a ' ? 'a' : 'o'} que, diziam, tinha neve até no verão. ${c.P} ficou a noite inteira tentando imaginar.` : null,
    c => c.KIND === 'caverna' ? `${c.TELLER} contou da boca ${deArt(c.X)}, de onde sai um vento frio e onde a própria voz responde. ${c.P} tinha ${c.AGE} anos e não dormiu direito por dias.` : null,
    c => c.KIND === 'cachoeira' ? `${c.TELLER} contou ${deArt(c.X)}, onde um rio inteiro cai do alto de uma pedra. ${c.P} passou a ouvir água caindo em todo barulho.` : null,
  ] });
  K('sn-cresceu', { h: 'Crescer', text: [c => `${c.P} cresceu sem esquecer ${c.X}.`, c => `${c.P} virou gente grande — e ${c.X} continuava lá, na cabeça, do mesmo tamanho.`, c => `Os amigos de infância de ${c.P} esqueceram as histórias de ${c.TELLER}. ${c.P}, não.`] });
  K('sn-partiu', { h: 'A partida', text: [
    c => `${c.P} amarrou uma trouxa com pão e saiu de ${c.cityNow || 'casa'} rumo ${ao(c.X)}, ${c.DIR}${c.BETWEEN ? ', além ' + deArt(c.BETWEEN) : ''}.`,
    c => c.KIN ? `${c.KIN} foi até a saída de ${c.cityNow || 'casa'} e ficou olhando até ${c.P} sumir no caminho ${deArt(c.X)}.` : null,
    c => `Um dia, ${c.TIME}, ${c.P} simplesmente foi: pegou o caminho ${deArt(c.X)}, ${c.DIR}, sem saber direito quanto ia andar.`,
  ] });
  K('sn-chegou', { h: 'O lugar', text: [
    c => c.KIND === 'mar' && c.TW !== 'noite' && !c.COLD ? `${c.P} chegou à praia ${c.TIME}. Tirou as sandálias, entrou na água até os joelhos e provou o sal com a ponta da língua: era verdade, a água do mar era salgada.` : null,
    c => c.KIND === 'mar' && c.TW !== 'noite' ? `Do alto da última subida, ${c.P} viu o mar — e parou. Era maior do que ${c.TELLER} tinha dito. Muito maior.` : null,
    c => c.KIND === 'mar' && c.COLD ? `O mar que ${c.P} encontrou era cinzento e frio, cheio de espuma batendo nas pedras. Mesmo assim, ficou na beira até os pés doerem.` : null,
    c => c.KIND === 'mar' && c.TW === 'noite' ? `${c.P} chegou ao mar de noite e só soube que tinha chegado pelo barulho das ondas. Esperou acordad${c.o} até clarear para ver.` : null,
    c => c.KIND === 'mar' && c.WX === 'tempestade' ? `${c.P} chegou ao mar no meio de uma tempestade: ondas da altura de uma casa batendo nas pedras. Ficou parad${c.o}, encharcad${c.o}, sem conseguir tirar os olhos.` : null,
    c => c.KIND === 'lago' ? `${c.P} chegou à margem ${deArt(c.X)}. A água estava tão parada que o céu inteiro cabia nela.` : null,
    c => c.KIND === 'lago' ? `${c.P} sentou na beira ${deArt(c.X)}, molhou as mãos e ficou ali até a luz mudar na água.` : null,
    c => c.KIND === 'pico' ? `${c.P} chegou ao pé ${deArt(c.X)} e olhou para cima até doer o pescoço${c.ALT ? ': ' + c.ALT + ' de pedra' : ''}.${c.SNOW ? ' Lá no alto, a neve não derretia nunca.' : ' Lá de cima devia dar para ver o mundo inteiro.'}` : null,
    c => c.KIND === 'pico' ? `${cap1(titled(c.X))} era exatamente como ${c.TELLER} tinha dito — só que maior. ${c.P} ficou ali sentad${c.o} numa pedra, sem pressa de voltar.` : null,
    c => c.KIND === 'cachoeira' ? `${c.P} ouviu ${withArt(c.X)} muito antes de ver. Quando chegou, a névoa molhou o rosto de ${c.P}, que riu como criança.` : null,
    c => c.KIND === 'caverna' ? `${c.P} parou na boca ${deArt(c.X)}. Do escuro vinha um vento frio, com cheiro de pedra molhada. Gritou o próprio nome — e o eco respondeu.` : null,
    c => c.KIND === 'caverna' ? `${c.P} entrou só alguns passos ${em(c.X)}, até onde a luz alcançava. Era escuro, frio e enorme — e era verdade.` : null,
    c => c.KIND === 'maravilha' ? `${c.P} chegou diante ${deArt(c.X)}. Nada do que ${c.TELLER} contara chegava aos pés daquilo.` : null,
    c => /^(cratera|monte)$/.test(c.KIND) ? `${c.P} chegou ${ao(c.X)} e ficou um tempo enorme olhando, em silêncio.` : null,
  ] });
  K('sn-voltou', { h: 'A volta', text: [
    c => c.KIDS ? `${c.P} voltou para ${c.cityNow || 'casa'}${c.KIND === 'mar' ? ' com areia nos bolsos e sal no cabelo' : ''}. Naquela noite, as crianças não deixaram ${lhe(c.o)} dormir: queriam saber tudo ${deArt(c.X)}.` : null,
    c => c.KIDS ? `De volta a ${c.cityNow || 'casa'}, ${c.P} contou ${deArt(c.X)} para as crianças, do jeito que um dia ${c.TELLER} tinha contado.` : null,
    c => !c.KIDS ? `${c.P} voltou para ${c.cityNow || 'casa'} e contou ${deArt(c.X)} para quem quisesse ouvir.` : null,
    c => c.TELLER_ALIVE ? `${c.P} voltou para ${c.cityNow || 'casa'} querendo contar a ${c.TELLER}, antes de todo mundo, que tinha visto ${c.X}.` : null,
  ] });
  K('sn-de-passagem', { h: 'De passagem', text: [
    c => c.BAND ? `${c.P} acabou vendo ${c.X} pela primeira vez marchando com o exército, sem tempo de parar. Não era assim que tinha sonhado.` : `A vida levou ${c.P} até perto ${deArt(c.X)} sem que procurasse. Viu — mas de passagem, sem a viagem que tinha sonhado.`,
  ] });
  K('sn-envelheceu', { h: 'Tarde demais', text: [c => `${c.P} envelheceu sem ver ${c.X}.`, c => `As pernas de ${c.P} já não aguentavam a estrada. ${capName(c.X)} ia ficar no conto.`] });
  K('sn-nunca-viu', { h: 'O fim', text: [c => `${c.P} morreu sem ver ${c.X}.`] });
  K('sn-morreu-caminho', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} a caminho ${deArt(c.X)}.`] });
  K('sn-morreu-volta', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} na volta — mas tinha visto ${c.X}.`] });
  K('sn-sem-caminho', { h: 'Sem caminho', text: [c => `O caminho até ${c.X} estava fechado. ${c.P} acabou desistindo.`] });
  K('sn-epilogo', { h: 'Depois', text: [c => `${c.P} morreu${c.WHERE ? ' em ' + c.WHERE : ''}, ${c.an(c.SINCE)} depois de ver ${c.X}.`, c => `${c.P} morreu${c.WHERE ? ' em ' + c.WHERE : ''}. Até o fim, quando ${lhe(c.o)} falava ${deArt(c.X)}, os olhos brilhavam.`] });

  function placeAlive(pl) {
    if (!pl) return false;
    if (pl.kind === 'caverna' && G.Caves) { const cv = G.Caves.get(pl.ref); return !!(cv && cv.mouths && cv.mouths.length); }
    if (pl.kind === 'maravilha') return G.S.buildings.has(pl.ref);
    return true;
  }
  // is this a TRUE dream for this child? (far, never seen, and a road leads there)
  function dreamPlace(v, pl) {
    const set = homeOf(v); if (!set || !pl) return null;
    const far = FAR();
    if (St.hasSeen(v, pl.kind)) return null;
    if (pl.kind === 'mar') {
      // the sea is far from home, and the child has never been to it: the road goes to the nearest shore
      const near = St.nearestSea(set.cx, set.cy, Math.ceil(far)); if (near) return null;
      const c = St.coastFor(set); if (!c || c.d < far) return null;
      return Object.assign({}, pl, { name: 'o mar', x: c.x, y: c.y });
    }
    const lp = W.nearestLand(pl.x, pl.y, 4) || [pl.x, pl.y];
    if (G.dist(set.cx, set.cy, pl.x, pl.y) < far || !W.sameLand(set.cx, set.cy, lp[0], lp[1])) return null;
    // they already live by one: a lake next to home makes a far lake a tale, not a longing
    if (/^(lago|pico|cachoeira|caverna)$/.test(pl.kind) && St.featureNear(pl.kind, set.cx, set.cy) < 14) return null;
    return Object.assign({}, pl, { x: lp[0], y: lp[1] });
  }
  St.define('sonho', {
    name: 'Sonho', icon: 'map', tone: 'contemplativo', tags: ['exploração', 'sonho'], struct: 'desejo-jornada', seedLife: 6, maxDays: 120,
    stages: [['conto', 'O conto'], ['crescer', 'Crescer'], ['partida', 'A partida'], ['estrada', 'A estrada'], ['lugar', 'O lugar'], ['volta', 'A volta']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 5 : -1; if (s.data.saw) return 5; if (s.data.onRoad) return 3; if (s.phase === 'esperar') return 2; return 1; },
    logline: (s, c) => (s.place.kind === 'mar' ? `${cap1(desc(c.p, s.data.town))} que nunca viu o mar e só o conhece pelas histórias de ${s.data.tellerName || 'um velho'}.` : `${cap1(desc(c.p, s.data.town))} que cresceu ouvindo ${s.data.tellerName || 'um velho'} falar ${deArt(c.X)} — e que um dia quer ver com os próprios olhos.`),
    on: {
      conto(f) {
        const pl = f.place; if (!pl) return null; const out = [];
        for (const id of f.kids || []) {
          const v = P(id); if (!v || v.dead || v.age < 6 || v.age >= 18) continue;
          const curious = has(v, 'Curioso'); if (!curious && !(pe(v).amb > 0.62 && v.age < 14)) continue;
          const place = dreamPlace(v, pl); if (!place) continue;
          const sc = 0.32 + (curious ? 0.25 : 0) + (v.age < 12 ? 0.08 : 0) + (place.kind === 'mar' ? 0.08 : 0);
          out.push({ protag: id, score: sc, keyExtra: 'pl' + Math.round(place.x) + ':' + Math.round(place.y), place, cast: { teller: f.a },
            data: { teller: f.a, tellerName: f.n.a, heard: Math.floor(v.age), home: v.set, town: setName(v.set), names: { [f.a]: f.n.a } }, motifs: ['gatilho:conto', 'amb:viagem', 'lugar:' + place.kind] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => placeAlive(sd.place) && !St.hasSeen(P(sd.protag), sd.place.kind),
    begin(s) { s.place.name = withArt(s.place.name); const p = P(s.protag); s.phase = p.age < 16 ? 'sonhar' : 'esperar'; St.beat(s, 'sn-ouviu', { TELLER: s.data.tellerName || 'um velho', AGE: s.data.heard, KIND: s.place.kind }); },
    tick(s) {
      const p = P(s.protag); if (!p || p.dead) return;
      if (!placeAlive(s.place)) { St.finish(s, 'interrompida', 'agridoce', `${capName(s.place.name)} já não existe.`); return; }
      if (s.phase === 'sonhar' && p.age >= 16) { s.phase = 'esperar'; St.beat(s, 'sn-cresceu', { TELLER: s.data.tellerName || 'um velho' }); }
      // life took them there another way (a march, a move): they saw it — but not the way they dreamed
      if (!s.data.onRoad && !s.data.saw && G.dist(p.x, p.y, s.place.x, s.place.y) < 5) {
        s.data.saw = 1; St.finish(s, 'cumprida', 'agridoce', St.say(s, 'sn-de-passagem', { BAND: p.task && p.task.type === 'band' }), { x: p.x, y: p.y });
        return;
      }
      if (s.phase === 'esperar' && p.age > 64 && !s.data.left && G.R() < 0.01) {
        St.chapter(s, St.say(s, 'sn-envelheceu'), { k: 'sn-envelheceu' });
        if (!St.bequeath(s, p, 'velho')) St.finish(s, 'esquecida', 'agridoce', null);
      }
    },
    react(s, f) {
      if (f.k !== 'morte' || f.a !== s.protag) return false;
      if (s.data.saw) { St.finish(s, 'cumprida', 'agridoce', St.say(s, 'sn-morreu-volta', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y }); return true; }
      if (s.data.onRoad) { St.finish(s, 'fracassada', 'tragico', St.say(s, 'sn-morreu-caminho', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y }); return true; }
      St.chapter(s, St.say(s, 'sn-nunca-viu'), { k: 'sn-nunca-viu' });
      if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'esquecida', 'agridoce', null);
      return true;
    },
    // years later, the one who saw it dies: the story gets its last line
    after(s, f) {
      if (f.k !== 'morte' || f.a !== s.protag || s.end.k !== 'cumprida' || s.data.epi || !s.data.went) return false;
      s.data.epi = 1; const r = P(f.a);
      s.chapters.push({ d: G.S.day, txt: St.say(s, 'sn-epilogo', { WHERE: setName((r && r.set) || 0) || '', SINCE: Math.max(1, G.S.day - s.end.d) }), k: 'sn-epilogo' });
      return true;
    },
    urge(s, v) {
      if (s.data.saw && !s.data.home2) return free(v) || v.hunger < 75 ? 0.3 : 0; // the way back, if it was interrupted
      if (s.phase !== 'esperar' || !free(v) || v.age < 16 || v.age > 66 || !homeSafe(v)) return 0;
      const own = G.Fac.ownerAt ? G.Fac.ownerAt(s.place.x | 0, s.place.y | 0) : 0; if (own && atWar(facOf(v), own)) return 0;
      return 0.11 + (has(v, 'Curioso') ? 0.05 : 0);
    },
    task(s, v, H) {
      if (s.data.saw) { const set = homeOf(v); return set ? St.journey(s, v, H, { x: set.cx, y: set.cy, leg: 1 }) : null; }
      if (!s.data.left) {
        s.data.left = 1; const k = kinNear(v, 10); const b = St.between(v.x, v.y, s.place.x, s.place.y);
        St.beat(s, 'sn-partiu', { DIR: St.dir(v.x, v.y, s.place.x, s.place.y), BETWEEN: b ? b.name : '', KIN: k ? k.txt : '', TIME: TIME[St.timeWord()] }, { x: v.x, y: v.y });
      }
      s.data.onRoad = 1;
      return St.journey(s, v, H, { x: s.place.x, y: s.place.y, sub: 'jornada', dur: 16, emo: 'happy', fx: s.place.x, fy: s.place.y - 1 });
    },
    road: (s, v, t, r) => roadBeat(s, v, r),
    camp: (s, v, t) => campBeat(s, v, t),
    // the moment: what they see is the place as it is now — the hour, the weather, the cold
    arrive(s, v) {
      s.data.saw = 1; s.data.onRoad = 0; s.data.went = 1;
      const pl = (G.Relief && G.Relief.places ? G.Relief.places() : []).find(q => q.name && withArt(q.name) === s.place.name);
      St.beat(s, 'sn-chegou', { KIND: s.place.kind, TELLER: s.data.tellerName || 'o velho', TIME: TIME[St.timeWord()], TW: St.timeWord(), WX: St.weatherWord(), COLD: St.cold(v.x, v.y), ALT: pl && pl.alt ? pl.alt : '', SNOW: St.snowy(pl) }, { x: v.x, y: v.y, log: true, toast: true, big: 1, hot: 25 });
      St.see(v);
      G.Life && G.Life.bio(v, 'note', `Viu ${s.place.name} com os próprios olhos, como sonhava desde os ${s.data.heard} anos`);
      G.Vg.emote(v, 'happy', 3);
    },
    home(s, v) {
      s.data.home2 = 1;
      const txt = s.place.kind === 'mar' ? `Fui até o mar, que ${s.data.tellerName || 'um velho'} contava quando eu era criança — e é tudo verdade` : `Andei até ${s.place.name}, que eu só conhecia de ouvir falar`;
      const n = tellKids(s, v, txt, s.place, KIND_IC[s.place.kind] || 'lore');
      St.finish(s, 'cumprida', 'feliz', St.say(s, 'sn-voltou', { KIDS: n, TELLER: s.data.tellerName || 'um velho', TELLER_ALIVE: alive(s.data.teller) && P(s.data.teller).set === v.set, KIND: s.place.kind }), { x: v.x, y: v.y, log: true, legend: true });
    },
    blocked(s) { s.data.onRoad = 0; s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) St.finish(s, 'interrompida', 'agridoce', St.say(s, 'sn-sem-caminho')); },
    goal: (s, c) => `Ver ${c.X} com os próprios olhos.`,
    status(s, c) {
      const p = P(s.protag); if (!p) return '';
      const set = homeOf(p); const dir = set ? St.dir(set.cx, set.cy, s.place.x, s.place.y) : ''; const b = set ? St.between(set.cx, set.cy, s.place.x, s.place.y) : null;
      const where = `${capName(c.X)} fica longe de ${c.cityNow || 'casa'}, ${dir}${b ? ', além ' + deArt(b.name) : ''}`;
      if (s.data.saw) return `${c.P} viu ${c.X}. Agora volta para casa, com o que tem para contar.`;
      if (s.data.onRoad) return `${c.P} está na estrada, a caminho ${deArt(c.X)}.`;
      if (s.phase === 'sonhar') return `${c.P} ainda é criança. ${where}.`;
      return `${c.P} já tem idade para ir. ${where}.`;
    },
    obstacles(s, c) { const p = P(s.protag); const out = []; if (p && p.age < 16) out.push(`${c.P} é jovem demais para viajar sozinh${c.o}`); if (p && G.War.threat && G.War.threat(p.set)) out.push('a guerra perto de casa'); const own = G.Fac.ownerAt ? G.Fac.ownerAt(s.place.x | 0, s.place.y | 0) : 0; if (p && own && atWar(facOf(p), own)) out.push(`${c.X} fica em terra de um povo em guerra com ${c.FP}`); return out; },
    open: (s, c) => [`chegar ${ao(c.X)}`, 'morrer no caminho', 'envelhecer sem ir', 'passar o sonho a um filho'],
    heirs: { minAge: 10, chance: 0.5, fit: (s, c) => (has(c, 'Curioso') ? 1 : 0.35) * (c.age < 50 ? 1 : 0.4) * (St.hasSeen(c, s.place.kind) ? 0.1 : 1), text: (s, c, why) => `${c.P} ${why === 'velho' ? 'envelheceu' : 'morreu'} sem ver ${c.X}. ${c.H}, ${c.DEADREL}, decidiu ir no lugar ${c.del}.` },
    inherited(s, heir) { s.phase = heir.age < 16 ? 'sonhar' : 'esperar'; s.data.left = 0; s.data.fail = 0; s.data.town = setName(heir.set); },
    titles: {
      sonho: c => `O Sonho de ${c.P}`, e: c => `${c.P} e ${titled(c.X)}`, caminho: c => `O Caminho até ${titled(c.X)}`,
      alem: c => (c.cityNow ? `Além de ${c.cityNow}` : null), longe: c => (c.s.place.kind === 'mar' ? `${c.P}, Longe do Mar` : null),
    },
    retitle(s, c) {
      if (!s.end || s.end.k === 'cumprida' || s.data.saw) return null;
      const n = withArt(c.X); const a = n.match(/^(o|a) /); const base = n.replace(/^(o|a) /, '');
      return `${a ? a[1].toUpperCase() + ' ' : ''}${capName(base)} que ${c.P} Nunca Viu`;
    },
    forgotten: (s, c) => `A vida foi acontecendo, e ${c.X} ficou para depois — para sempre.`,
    taskText: (s, v, t) => (t.st === 4 ? `Dormindo ao relento, a caminho ${deArt(s.place.name)}` : t.leg ? 'Voltando para casa, com muito para contar' : t.st < 2 ? `Viajando para ver ${s.place.name}` : `Olhando ${s.place.name}, enfim`),
  });

  // ====================================================================================
  //  PEREGRINAÇÃO — the devout answer a loss with a road to a holy place that really exists,
  //  a real road away (not the temple next door), with what their people carry for the dead
  // ====================================================================================
  const ORACLE_SAY = ['Quem é lembrado não se perde.', 'Já atravessou. Pode parar de procurar.', 'Ouvi o nome que você trouxe. Responderam.', 'Volte para casa. O caminho do morto está aberto.', 'A água leva, a pedra guarda.',
    'Você andou até aqui. Era isso que faltava.', 'O nome chegou antes de você.', 'Não chore na estrada de volta: chore aqui, e deixe aqui.', 'Os mortos não pedem pão. Pedem que alguém se lembre.', 'Ainda está perto. Mas já não sofre.'];
  const ORACLE_VIOLENT = ['O sangue que caiu já secou. O nome, não.', 'Quem matou vai carregar isso. Você, não precisa.'];
  const ORACLE_YOUNG = ['Os pequenos atravessam primeiro, e esperam.', 'Era cedo. Para os deuses, nunca é.'];
  // what the oracle of a cave says to this pilgrim (the dead's death decides some words; no two pilgrims hear the same)
  function oracleSays(s, lost) {
    const pool = ORACLE_SAY.slice(); if (lost && { war: 1, arrow: 1, massacre: 1, execution: 1, coup: 1 }[lost.cause]) pool.unshift(...ORACLE_VIOLENT); if (lost && lost.age < 14) pool.unshift(...ORACLE_YOUNG);
    const heard = new Set((St.state().stories || []).filter(x => x.type === 'peregrinacao' && x.id !== s.id && x.place && x.place.ref === s.place.ref && x.data.say).map(x => x.data.say));
    const fresh = pool.filter(t => !heard.has(t)); const t = St.pick(fresh.length ? fresh : pool, s.id * 7 + 3); s.data.say = t; return t;
  }
  K('pg-promessa', { h: 'A promessa', text: [
    c => c.ALT ? `${c.L} foi mort${c.oL} por ${c.KILLER}. ${c.P} não pegou em armas: prometeu ir até ${c.X} rezar por ${lhe(c.oL)}.` : null,
    c => !c.ALT ? `${c.P} perdeu ${c.REL}, ${c.L}. Prometeu ir até ${c.X}, ${c.DIR}, rezar por ${lhe(c.oL)}.` : null,
    c => !c.ALT ? `Na noite em que enterraram ${c.L}, ${c.P} fez uma promessa: andaria até ${c.X} para rezar por ${lhe(c.oL)}.` : null,
    c => c.WAS ? `${c.L} ouvia a voz dos céus ${em(c.X)}. Quando ${lhe(c.oL)} morreu, ${c.P} prometeu ir até lá rezar por ${lhe(c.oL)}, onde ${lhe(c.oL)} tinha vivido para os deuses.` : null,
  ] });
  K('pg-virou', { h: 'A prece', text: [
    c => `Em vez de cobrar o sangue de ${c.L}, ${c.P} prometeu ir até ${c.X} rezar por ${lhe(c.oL)}.`,
    c => `${c.P} guardou a lança. Ia até ${c.X}, rezar por ${c.L}.`,
  ] });
  K('pg-partiu', { h: 'A estrada', text: [
    c => `${c.P} saiu de ${c.cityNow || 'casa'} rumo ${ao(c.X)}, levando ${c.OFFER}.`,
    c => c.KIN ? `${c.KIN} ajudou ${c.P} a arrumar ${c.OFFER} numa trouxa, e depois ficou na porta, olhando ${c.P} ir.` : null,
    c => `${c.P} partiu em peregrinação ${ao(c.X)}${c.BETWEEN ? ', além ' + deArt(c.BETWEEN) : ''}, com ${c.OFFER} — e o nome de ${c.L} na boca.`,
  ] });
  K('pg-rezou', { h: 'A prece', text: [
    c => c.WAS ? `${c.P} chegou ${ao(c.X)}, onde ${c.L} ouvia a voz dos céus. Ali mesmo, ${c.RITE}.` : null,
    c => !c.WAS ? `Quando enfim chegou ${ao(c.X)}, ${c.P} ${c.RITE}.` : null,
    c => !c.WAS && c.TW !== 'noite' ? `${c.P} chegou ${ao(c.X)} com a poeira da estrada até os joelhos. Ali, ${c.RITE}.` : null,
    c => !c.WAS && c.TW === 'noite' ? `${c.P} chegou ${ao(c.X)} já de noite. À luz de uma tocha, ${c.RITE}.` : null,
  ] });
  K('pg-oraculo', { h: 'O oráculo', text: [c => `${c.ORACLE}, ${c.ORAC} ${deArt(c.X)}, saiu da sombra e disse a ${c.P} só uma coisa: “${c.SAY}”`] });
  K('pg-voltou', { h: 'A volta', text: [
    c => `${c.P} voltou para ${c.cityNow || 'casa'} com o rosto em paz. A promessa a ${c.L} estava cumprida.`,
    c => `De volta a ${c.cityNow || 'casa'}, ${c.P} pendurou a trouxa vazia na porta. Tinha rezado por ${c.L} onde prometeu.`,
  ] });
  K('pg-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} sem chegar ${ao(c.X)}.`] });
  K('pg-morreu-volta', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} na volta — mas tinha rezado por ${c.L} onde prometeu.`] });
  K('pg-sem-caminho', { h: 'De longe', text: [c => `O caminho até ${c.X} estava fechado. ${c.P} rezou de longe, virad${c.o} para o lado ${deArt(c.X)}.`] });
  K('pg-sem-lugar', { h: 'Sem lugar', text: [c => `${capName(c.X)} já não existe. A promessa ficou sem lugar.`] });

  // the holy places of someone's people that are a real road from their town
  function holyFor(v) {
    const S = G.S; const fid = facOf(v); const home = homeOf(v) || { cx: v.x, cy: v.y }; const out = []; const far = PFAR();
    if (G.Caves) for (const cv of G.Caves.all()) if (cv.oracle && cv.oracle.id !== v.id && cv.known && cv.known[fid] && cv.mouths.length) { const m = cv.mouths[0]; out.push({ kind: 'oraculo', name: G.Caves.a(cv), x: m.x + 0.5, y: m.y + 0.5, ref: cv.id, oracle: cv.oracle.name, w: 3 }); }
    for (const b of S.buildings.values()) {
      if (!b.built) continue; const s = S.settlements.get(b.set); if (!s || s.fac !== fid || s.id === v.set) continue;
      if (b.type === 'maravilha') { const c = G.Village.center(b); out.push({ kind: 'maravilha', name: `a maravilha de ${s.name}`, x: c[0], y: c[1] + 2, ref: b.id, w: 2.5 }); }
      else if (b.type === 'temple' && G.Fac.capitalOf(fid) === s) { const c = G.Village.frontTile(b); out.push({ kind: 'templo', name: `o templo de ${s.name}`, x: c[0], y: c[1], ref: b.id, w: 1.5 }); }
      else if (b.type === 'monument') { const c = G.Village.frontTile(b); out.push({ kind: 'monumento', name: `o monumento de ${s.name}`, x: c[0], y: c[1], ref: b.id, w: 1 }); }
    }
    const ok = out.filter(h => G.dist(h.x, h.y, home.cx, home.cy) >= far && W.sameLand(h.x, h.y, home.cx, home.cy));
    ok.sort((a, b) => b.w - a.w || G.dist(a.x, a.y, home.cx, home.cy) - G.dist(b.x, b.y, home.cx, home.cy));
    return ok[0] || null;
  }
  function holyAlive(h) { if (!h) return false; if (h.kind === 'oraculo') { const cv = G.Caves && G.Caves.get(h.ref); return !!(cv && cv.mouths.length); } return G.S.buildings.has(h.ref); }
  St.define('peregrinacao', {
    name: 'Peregrinação', icon: 'faith', tone: 'contemplativo', tags: ['fé', 'luto'], struct: 'perda-oracao', seedLife: 4, maxDays: 45,
    stages: [['luto', 'O luto'], ['promessa', 'A promessa'], ['estrada', 'A estrada'], ['prece', 'A prece'], ['volta', 'A volta']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 4 : -1; if (s.data.prayed) return 4; if (s.data.onRoad) return 2; return 1; },
    logline: (s, c) => { const p = c.p; const set = homeOf(p); return `${cap1(desc(p, s.data.town))} que perdeu ${c.REL || 'alguém'} e prometeu rezar por ${lhe(c.oL)} ${em(c.X)}${set ? ', ' + St.dir(set.cx, set.cy, s.place.x, s.place.y) + ' de ' + set.name : ''}.`; },
    on: {
      morte(f) {
        const victim = P(f.a); if (!victim) return null; const out = [];
        for (const p of St.kin(victim)) {
          if (p.dead || p.age < 16 || p.captive) continue;
          const q = pe(p); if (!(q.pie >= 0.66 || has(p, 'Devoto'))) continue;
          const rel = St.relOf(p, victim); if (!rel || (REL_W[rel] || 0) < 0.72) continue;
          const home = homeOf(p); if (!home) continue;
          // the one who died served at an oracle: that is where the grieving go (only if it is a real road away —
          // a cave at the edge of town is a walk, not a pilgrimage)
          const shrine = G.Caves && G.Caves.all().find(cv => cv.mouths.length && ((cv.oracle && cv.oracle.id === f.a) || (cv.oraclePast || []).some(x => x.name === f.n.a && x.to >= G.S.day - 1)));
          const m = shrine && shrine.mouths[0];
          const holy = m && W.sameLand(m.x, m.y, home.cx, home.cy) && G.dist(m.x, m.y, home.cx, home.cy) >= PFAR() ? { kind: 'oraculo', name: G.Caves.a(shrine), x: m.x + 0.5, y: m.y + 0.5, ref: shrine.id, oracle: f.n.a, was: 1, w: 3 } : holyFor(p);
          if (!holy) continue;
          const violent = !!f.b;
          const sc = REL_W[rel] * (0.35 + q.pie * 0.5) + (violent ? 0.05 : 0) + (holy.was ? 0.1 : 0);
          if (sc < 0.4) continue;
          out.push({ protag: p.id, score: Math.min(1, sc), keyExtra: f.a, cast: { lost: f.a }, place: holy,
            data: { rel, lost: f.a, alt: violent && f.kn.includes(p.id) ? (f.n.b || '') : '', town: home.name, names: { [f.a]: f.n.a } }, motifs: ['rel:' + rel, 'gatilho:luto', 'amb:viagem', 'destino:' + holy.kind + holy.ref] });
        }
        out.sort((a, b) => b.score - a.score); return out.slice(0, 1);
      },
    },
    valid: sd => !sd.place || holyAlive(sd.place) || !!holyFor(P(sd.protag) || {}),
    begin(s, sd) {
      const p = P(s.protag);
      if (!s.place) { const h = holyFor(p); if (h) s.place = h; }
      s.phase = 'promessa'; const set = homeOf(p);
      St.beat(s, s.data.from ? 'pg-virou' : 'pg-promessa', { ALT: s.data.alt, KILLER: s.data.alt, WAS: s.place && s.place.was, DIR: set && s.place ? St.dir(set.cx, set.cy, s.place.x, s.place.y) : 'longe' });
    },
    tick(s) { const p = P(s.protag); if (!p || p.dead) return; if (!holyAlive(s.place) && !s.data.prayed) St.finish(s, 'interrompida', 'sereno', St.say(s, 'pg-sem-lugar')); },
    react(s, f) {
      if (f.k !== 'morte' || f.a !== s.protag) return false;
      if (s.data.prayed) St.finish(s, 'cumprida', 'agridoce', St.say(s, 'pg-morreu-volta', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y });
      else St.finish(s, s.data.onRoad ? 'fracassada' : 'interrompida', s.data.onRoad ? 'tragico' : 'sereno', St.say(s, 'pg-morreu', { DEATH: deathTxt(f.a) }), { x: f.x, y: f.y });
      return true;
    },
    urge(s, v) {
      if (s.data.prayed) return v.hunger < 75 ? 0.3 : 0; // the way back
      // (the first days are for mourning at home; the road comes after)
      if (!free(v) || v.age > 76 || !homeSafe(v) || !s.place || G.S.day - s.born < 1) return 0;
      const own = G.Fac.ownerAt ? G.Fac.ownerAt(s.place.x | 0, s.place.y | 0) : 0; if (own && atWar(facOf(v), own)) return 0;
      return 0.13;
    },
    task(s, v, H) {
      if (s.data.prayed) { const set = homeOf(v); return set ? St.journey(s, v, H, { x: set.cx, y: set.cy, leg: 1 }) : null; }
      // (what is carried and what is done with it go together)
      const civ = St.civOf(v); const offers = St.OFFER[civ] || St.OFFER['']; if (s.data.oi === undefined) s.data.oi = Math.floor(G.hash(s.id * 5) * offers.length) % offers.length; const offer = offers[s.data.oi % offers.length]; s.data.offer = offer;
      if (!s.data.left) { s.data.left = 1; const k = kinNear(v, 10); const b = St.between(v.x, v.y, s.place.x, s.place.y); St.beat(s, 'pg-partiu', { OFFER: offer, KIN: k ? k.txt : '', BETWEEN: b ? b.name : '' }, { x: v.x, y: v.y }); }
      s.data.onRoad = 1;
      return St.journey(s, v, H, { x: s.place.x, y: s.place.y, sub: 'peregrinar', dur: 16, act: 'pray', fx: s.place.x, fy: s.place.y - 1 });
    },
    road: (s, v, t, r) => roadBeat(s, v, r),
    camp: (s, v, t) => campBeat(s, v, t),
    arrive(s, v) {
      const civ = St.civOf(v); const lost = P(s.cast.lost);
      const rites = St.RITE[civ] || St.RITE['']; const rite = rites[(s.data.oi || 0) % rites.length].replace(/\{L\}/g, lost ? lost.name : 'quem partiu');
      s.data.prayed = 1; s.data.onRoad = 0;
      St.beat(s, 'pg-rezou', { RITE: rite, WAS: s.place.was ? 1 : 0, TW: St.timeWord() }, { x: v.x, y: v.y, log: true, big: 1, hot: 20 });
      // (the oracle as it is today — not who it was when the promise was made, nor the one being mourned)
      const cv = s.place.kind === 'oraculo' && G.Caves ? G.Caves.get(s.place.ref) : null; const o = cv && cv.oracle;
      if (o && o.id !== s.cast.lost && o.id !== v.id && o.name !== v.name && (!lost || o.name !== lost.name) && G.S.villagers.has(o.id)) St.beat(s, 'pg-oraculo', { ORACLE: o.name, ORAC: o.g === 'f' ? 'a oráculo' : 'o oráculo', SAY: oracleSays(s, lost) });
      v.devotion = Math.min(100, (v.devotion || 0) + 20); G.FX && G.FX.prayer && G.FX.prayer(v.x, v.y);
      G.Life && G.Life.bio(v, 'note', `Andou até ${s.place.name} para rezar por ${lost ? lost.name : 'quem partiu'}`);
    },
    home(s, v) { St.finish(s, 'cumprida', 'sereno', St.say(s, 'pg-voltou'), { x: v.x, y: v.y, log: true }); },
    blocked(s) { s.data.onRoad = 0; s.data.fail = (s.data.fail || 0) + 1; if (s.data.fail >= 3) St.finish(s, 'interrompida', 'sereno', St.say(s, 'pg-sem-caminho')); },
    goal: (s, c) => `Rezar por ${c.L} diante ${deArt(c.X)}.`,
    status(s, c) { const p = P(s.protag); const set = homeOf(p); const where = set ? `${capName(c.X)} fica ${St.dir(set.cx, set.cy, s.place.x, s.place.y)} de ${set.name}` : ''; if (s.data.prayed) return `${c.P} rezou por ${c.L}. Volta para casa.`; return s.data.onRoad ? `${c.P} está na estrada, a caminho ${deArt(c.X)}.` : `${c.P} espera o momento de partir. ${where}.`; },
    obstacles(s, c) { const p = P(s.protag); return p && G.War.threat && G.War.threat(p.set) ? ['a guerra perto de casa'] : []; },
    open: (s, c) => [`chegar ${ao(c.X)} e rezar`, 'adiar até esquecer', 'morrer no caminho'],
    titles: { pereg: c => `A Peregrinação de ${c.P}`, prece: c => `Uma Prece por ${c.L}`, caminho: c => `O Caminho de ${c.P} até ${titled(c.X)}`, velas: c => `As Velas de ${c.L}` },
    forgotten: (s, c) => 'A promessa foi ficando para depois, até ser esquecida.',
    taskText: (s, v, t) => (t.st === 4 ? 'Dormindo ao relento, em peregrinação' : t.leg ? 'Voltando da peregrinação' : t.st < 2 ? `Em peregrinação a ${s.place.name}` : `Rezando por ${(P(s.cast.lost) || {}).name || 'quem partiu'}`),
  });

  // ====================================================================================
  //  CAÇADA — a beast with a name killed someone close; the beast still roams
  // ====================================================================================
  K('cf-presa', { h: 'A fera', text: [
    c => `${c.B}, ${c.BK}, matou ${c.REL}, ${c.V}${c.at ? ',' + c.at : ''}. ${c.P} pegou a lança.`,
    c => `Depois que ${c.B} matou ${c.REL}, ${c.V}, ${c.P} passou a seguir seu rastro.`,
    c => `Acharam o que sobrou de ${c.V}${c.at}. ${c.P} não esperou o enterro: foi ver as pegadas de ${c.B}.`,
  ] });
  K('cf-cacador', { h: 'A fera', text: [c => `${c.B}, ${c.BK}, já tinha matado gente perto de ${c.cityNow || 'casa'}. ${c.P}, ${c.ROLE}, decidiu caçá-l${c.oB}.`] });
  K('cf-rastro', { h: 'O rastro', text: [c => `${c.P} saiu sozinh${c.o} atrás do rastro de ${c.B}.`, c => `${c.P} achou pelos e pegadas de ${c.B} no barro, e foi atrás.`] });
  K('cf-toca', { h: 'A toca', text: [c => `${c.B} se enfiou ${em(c.DEN)} para dormir. ${c.P} sabe onde esperar.`, c => `O rastro de ${c.B} terminava na boca ${deArt(c.DEN)}.`] });
  K('cf-espera', { h: 'A espera', text: [c => `${c.P} sentou-se na frente ${deArt(c.DEN)} com a lança no colo, esperando ${c.B} sair.`] });
  K('cf-confronto', { h: 'A luta', text: [c => `${c.P} encontrou ${c.B}${c.at}.`, c => `${c.B} saiu do mato${c.at}, e ${c.P} não correu.`] });
  K('cf-matou', { h: 'A luta', text: [c => `${c.P} matou ${c.B}${c.at}. ${c.V ? c.V + ' estava vingad' + c.oV + '.' : 'Ninguém mais ia morrer por aquela fera.'}`, c => `${c.B} caiu diante da lança de ${c.P}${c.at}. Quando tudo parou, ${c.P} ficou um tempo sentad${c.o} ao lado do corpo, respirando.`] });
  K('cf-outro', { h: 'Outra lança', text: [c => `${c.B} foi abatid${c.oB} por ${c.K}. ${c.P} não estava lá.`] });
  K('cf-outra-fera', { h: 'O fim da fera', text: [c => `${c.B} morreu nas garras de outro bicho.`] });
  K('cf-morreu-so', { h: 'O fim da fera', text: [c => `${c.B} morreu sem que ninguém ${c.oB === 'a' ? 'a' : 'o'} caçasse.`] });
  K('cf-morto', { h: 'A fera venceu', text: [c => `${c.B} matou também ${c.P}${c.at}.`] });
  K('cf-mais-uma', { h: 'Mais uma', text: [c => `${c.B} matou mais uma pessoa: ${c.V2}${c.at}.`] });
  K('cf-sumiu', { h: 'Sem rastro', text: [c => `${c.B} sumiu dos arredores. Ninguém sabe para onde foi.`, c => `Dias sem rastro de ${c.B}. ${c.P} acabou pendurando a lança.`] });
  K('cf-morreu', { h: 'O fim', text: [c => `${c.P} ${c.DEATH} sem ver ${c.B} cair.`] });

  const beastOf = s => G.S.animals.get(s.cast.beast);
  // a beast that went to ground (asleep or sheltering in a cave) is not gone: it comes out again
  const denOf = id => { if (!G.Caves) return null; for (const cv of G.Caves.all()) if ((cv.sleepers || []).some(a => a.id === id) || (cv.sheltered || []).some(a => a.id === id)) return cv; return null; };
  const bctx = s => { const d = G.Animals.DEF[s.data.kind] || {}; return { B: s.data.beastName, BK: d.nameA || 'uma fera', oB: d.g === 'f' ? 'a' : 'o' }; };
  St.define('cacada', {
    name: 'Caçada', icon: 'wolves', tone: 'sombrio', tags: ['criatura', 'caçada'], struct: 'perda-perseguicao', seedLife: 4, maxDays: 60,
    stages: [['perda', 'A fera'], ['rastro', 'O rastro'], ['toca', 'A espera'], ['luta', 'A luta']],
    stage(s) { if (s.st === 'fim') return s.end.k === 'cumprida' ? 3 : -1; return s.phase === 'confronto' ? 3 : s.data.den ? 2 : s.data.tracked ? 1 : 0; },
    logline: (s, c) => `${cap1(desc(c.p, s.data.town))} atrás de ${s.data.beastName}, ${(G.Animals.DEF[s.data.kind] || {}).nameA || 'uma fera'} que ${s.data.hunter ? 'já matou gente perto de casa' : 'matou ' + (c.REL || 'alguém')}.`,
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
            data: { rel, kind: a.kind, beastName: a.named || G.cap(G.Animals.DEF[a.kind].nameA), at: w.at, lx: f.x, ly: f.y, town: setName(p.set), names: { [f.a]: f.n.a } }, motifs: ['rel:' + rel, 'gatilho:fera', 'amb:ermos'] });
        }
        // a man-eater just named: the best hunter of the nearest town decides to end it
        if (!out.length && (a.kills === 2 || a.legend)) {
          const set = G.Village.nearestSettlement ? G.Village.nearestSettlement(f.x, f.y) : null;
          if (set && G.dist(set.cx, set.cy, f.x, f.y) < 18) {
            let best = null; for (const v of G.S.villagers.values()) if (v.set === set.id && (v.role === 'cacador' || v.role === 'guerreiro') && v.courage > 0.5 && !v.captive && v.age >= 18 && (!best || v.courage > best.courage)) best = v;
            if (best) out.push({ protag: best.id, score: 0.45, keyExtra: 'b' + a.id, cast: { beast: a.id }, place: { kind: 'rastro', name: set.name, x: f.x, y: f.y },
              data: { hunter: 1, kind: a.kind, beastName: a.named || G.cap(G.Animals.DEF[a.kind].nameA), at: St.where(f.x, f.y).at, lx: f.x, ly: f.y, town: set.name }, motifs: ['gatilho:fera', 'amb:ermos', 'rel:nenhuma'] });
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
        if (den) { s.data.gone = 0; if (s.data.den !== den.id) { s.data.den = den.id; s.data.denName = G.Caves.a ? G.Caves.a(den) : den.name; s.data.lx = den.mouths[0] ? den.mouths[0].x + 0.5 : s.data.lx; s.data.ly = den.mouths[0] ? den.mouths[0].y + 0.5 : s.data.ly; St.beat(s, 'cf-toca', Object.assign(bctx(s), { DEN: s.data.denName }), { x: s.data.lx, y: s.data.ly }); } return; }
        // gone from the land: only after some days without a sign does the hunt fade
        if (!s.data.gone) s.data.gone = G.S.day;
        if (G.S.day - s.data.gone >= 3) St.finish(s, 'esquecida', 'sereno', St.say(s, 'cf-sumiu', bctx(s)));
        return;
      }
      s.data.gone = 0; if (s.data.den) { s.data.den = 0; s.data.waited = 0; }
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
        if (f.by === s.protag) {
          const p = P(s.protag); if (p) { p.courage = Math.min(1, (p.courage || 0.5) + 0.08); G.Life && G.Life.bio(p, 'note', `Matou ${s.data.beastName}, ${b.BK}`); }
          St.finish(s, 'cumprida', 'feliz', St.say(s, 'cf-matou', Object.assign(b, { at })), { x: f.x, y: f.y, log: true, toast: true, hot: 25, big: 1, clima: 'caçada', legend: true });
        }
        else if (f.by) St.finish(s, 'roubada', 'agridoce', St.say(s, 'cf-outro', Object.assign(b, { K: (P(f.by) || {}).name || 'outra pessoa' })), { log: true });
        else if (f.byBeast) St.finish(s, 'roubada', 'sereno', St.say(s, 'cf-outra-fera', b));
        else St.finish(s, 'roubada', 'sereno', St.say(s, 'cf-morreu-so', b));
        return true;
      }
      if (f.k === 'morte' && f.beast === s.cast.beast) {
        const at = St.where(f.x, f.y).at;
        if (f.a === s.protag) {
          St.chapter(s, St.say(s, 'cf-morto', Object.assign(b, { at })), { x: f.x, y: f.y, big: 1, log: true, toast: true, k: 'cf-morto' });
          if (!St.bequeath(s, P(f.a), 'fera')) St.finish(s, 'fracassada', 'tragico', null, { clima: 'caçada' });
        } else if ((s.data.more || 0) < 2) { s.data.more = (s.data.more || 0) + 1; St.beat(s, 'cf-mais-uma', Object.assign(b, { V2: f.n.a, at }), { x: f.x, y: f.y }); }
        return true;
      }
      if (f.k === 'morte' && f.a === s.protag) {
        St.chapter(s, St.say(s, 'cf-morreu', Object.assign(b, { DEATH: deathTxt(f.a) })), { k: 'cf-morreu' });
        if (!St.bequeath(s, P(f.a), 'morte')) St.finish(s, 'interrompida', 'sereno', null);
        return true;
      }
      return false;
    },
    urge(s, v) {
      if (!free(v) || v.age < 16 || v.hp < 70 || !homeSafe(v)) return 0;
      const set = G.S.settlements.get(v.set);
      if (s.data.den) return set && G.dist(s.data.lx, s.data.ly, set.cx, set.cy) < 36 && (s.data.waited || 0) < 3 ? 0.16 : 0; // waiting at the den's mouth
      const a = beastOf(s); if (!a || a.dead) return 0;
      if (set && G.dist(a.x, a.y, set.cx, set.cy) > 32) return 0;
      return 0.14 + (has(v, 'Corajoso') ? 0.05 : 0);
    },
    task(s, v, H) {
      if (s.data.den) { s.data.waited = (s.data.waited || 0) + 1; if (s.data.waited === 1) St.beat(s, 'cf-espera', Object.assign(bctx(s), { DEN: s.data.denName || 'a toca' })); return St.go(s, v, H, { x: s.data.lx, y: s.data.ly, sub: 'espera', dur: 16, emo: 'angry', max: 200 }); }
      const a = beastOf(s); if (!a) return null;
      if (G.dist(v.x, v.y, a.x, a.y) < 7) return H.setTask(v, { type: 'fight', id: a.id, pri: 4, rt: 0, saga: s.id });
      if (!s.data.tracked) { s.data.tracked = 1; St.beat(s, 'cf-rastro', bctx(s)); }
      return St.go(s, v, H, { x: s.data.lx, y: s.data.ly, sub: 'rastro', dur: 5, emo: 'angry', max: 120 });
    },
    // at the end of the trail: if the beast is there, the fight is the world's
    arrive(s, v) { const a = beastOf(s); if (a && !a.dead && G.dist(v.x, v.y, a.x, a.y) < 7) G.Vg.H.setTask(v, { type: 'fight', id: a.id, pri: 4, rt: 0, saga: s.id }); },
    goal: (s, c) => `Matar ${s.data.beastName}.`,
    status(s, c) { if (s.data.den) return `${s.data.beastName} dorme ${em(s.data.denName || 'a toca')}. ${c.P} espera na boca.`; const a = beastOf(s); return a && !a.dead ? `${s.data.beastName} ronda ${St.where(a.x, a.y).at.trim() || 'os ermos'}${a.kills ? ` — já matou ${a.kills} ${a.kills > 1 ? 'pessoas' : 'pessoa'}` : ''}.` : ''; },
    obstacles(s, c) { const a = beastOf(s); const d = a ? G.Animals.DEF[a.kind] : null; const out = []; if (a && a.legend) out.push('é uma fera lendária, do tamanho de uma casa'); else if (d && d.apex) out.push(`${d.nameA} não tem quem a cace`); return out; },
    open: (s, c) => [`encontrar ${s.data.beastName} e lutar`, 'outra pessoa abatê-la antes', 'a fera ir embora', `a fera matar também ${c.P}`],
    heirs: { minAge: 14, chance: 0.4, fit: (s, c) => 0.3 + c.courage * 0.8, text: (s, c) => `${c.P} morreu sem matar ${s.data.beastName}. ${c.H}, ${c.DEADREL}, pegou a lança.` },
    inherited(s, heir) { s.data.town = setName(heir.set); s.data.tracked = 0; },
    titles: { cacada: c => `A Caçada a ${c.s.data.beastName}`, e: c => `${c.P} e ${c.s.data.beastName}`, rastro: c => `O Rastro de ${c.s.data.beastName}`, dentes: c => `Os Dentes de ${c.s.data.beastName}` },
    forgotten: (s, c) => `Ninguém mais saiu atrás de ${s.data.beastName}.`,
    taskText: (s, v, t) => (t.sub === 'espera' ? `Esperando ${s.data.beastName} sair da toca` : `No rastro de ${s.data.beastName}`),
  });

  St.init();
})(window.G);
