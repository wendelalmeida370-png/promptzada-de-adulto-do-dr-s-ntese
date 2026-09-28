'use strict';
// ============================================================
//  Lore: every world gets its own creation myth, ancient
//  prophecies and origin tales for each people — and then the
//  book keeps writing itself: chapters of history, legends of
//  heroes, monsters, drowned cities and fulfilled prophecies.
// ============================================================
(function (G) {
  const L = G.Lore = {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const pick = a => G.pick(a);
  const CH_DAYS = 7;

  function lore() {
    const S = G.S;
    if (!S.lore) S.lore = { world: '', myth: [], peoples: {}, ancient: [], chapters: [], legends: [], acc: null, lastN: 0, seenFac: {} };
    return S.lore;
  }
  L.data = lore;

  // ------------------------------ words ------------------------------
  const W1 = ['Eld', 'Thal', 'Aur', 'Myr', 'Kal', 'Ves', 'Or', 'Sel', 'Ith', 'Zan', 'Bel', 'Cor', 'Ner', 'Lum', 'Ar', 'Val', 'Ys', 'Hal'];
  const W2 = ['mar', 'ora', 'heim', 'ia', 'ante', 'os', 'dun', 'ara', 'eth', 'ion', 'essa', 'or', 'untha', 'ael'];
  const worldName = () => pick(W1) + pick(W2);
  const MAPDESC = {
    ilha: 'uma única ilha no meio do mar sem fim', continente: 'uma grande terra de rios e florestas', arquipelago: 'um colar de ilhas espalhadas pelas ondas',
    istmo: 'duas terras unidas por um fio de chão', mar: 'ilhas distantes, perdidas num oceano imenso',
  };
  const BEFORE = [
    'No princípio havia apenas o mar, escuro e sem margens, e acima dele um olho que nunca piscava.',
    'Antes do tempo, tudo era névoa. Nada crescia, nada morria, nada lembrava.',
    'Contam que antes do primeiro dia o mundo era um sonho mal lembrado, e o céu não tinha estrelas.',
    'No começo o silêncio era tão grande que até o vento tinha medo de soprar.',
  ];
  const MAKING = [
    'Então Aquele que Observa estendeu a mão e ergueu {desc}. Chamou-a {world}, e o nome ficou.',
    'Uma única lágrima caiu do céu, e onde tocou a água nasceu {desc}: {world}.',
    'Do fundo do mar subiu uma pedra quente, e sobre ela cresceu {desc}. Os antigos a chamam {world}.',
    'O vento soprou areia sobre as ondas até que surgisse {desc}. Deram-lhe o nome de {world}.',
  ];
  const LIFE = [
    'Depois vieram as árvores, os cervos e os lobos; o coelho aprendeu a correr e o lobo aprendeu a esperar.',
    'A chuva ensinou a terra a ser verde. Os peixes encheram os rios e os pássaros inventaram a manhã.',
    'Brotaram florestas inteiras numa só noite, e os bichos saíram delas já sabendo seus nomes.',
  ];
  const COVENANT = [
    'E a voz disse: “Não vou mandar em vocês. Mas vou estar olhando.”',
    'E a voz disse: “Vivam. Eu escolho quando ajudar — e quando lembrar quem eu sou.”',
    'Ninguém ouviu a voz naquela noite. Mas todos sentiram que alguém estava olhando.',
  ];
  const ORIGIN = {
    grego: '{people} contam que nasceram da espuma do mar quando {god} riu pela primeira vez. Por isso amam as ondas — e as perguntas.',
    nordico: '{people} dizem que {god} soprou sobre o gelo eterno, e do gelo derretido saíram seus pais, já com fome e já com frio.',
    egipcio: '{people} ensinam que {god} moldou os primeiros homens do lodo do rio e os secou ao sol. Por isso a cheia é sagrada.',
    asteca: '{people} sabem que este é o Quinto Sol: {god} regou ossos antigos com o próprio sangue, e deles nasceu o povo — que desde então deve sangue ao céu.',
    romano: '{people} contam que dois irmãos, filhos {degod}, foram amamentados por uma loba. Um matou o outro, e da cidade que o sobrevivente fundou nasceu o povo.',
    classico: '{people} lembra apenas do calor da primeira fogueira e de uma voz que não falava.',
  };
  const SYMWHY = {
    sol: 'o sol que os aqueceu na primeira manhã', lua: 'a lua que os guiou na primeira noite', arvore: 'a árvore sob a qual dormiram pela primeira vez',
    onda: 'a onda que os trouxe até a praia', montanha: 'a montanha que os protegeu do vento', olho: 'o olho que os observa do céu',
    estrela: 'a estrela que caiu perto da primeira fogueira', chama: 'a primeira chama, que nunca deixaram apagar', lobo: 'o lobo que os encontrou e não os devorou', coroa: 'a coroa que um dia pretendem usar',
  };
  const ANCIENT = {
    fogo: { t: 'A Profecia da Montanha', text: 'Quando a montanha cuspir fogo, a terra dará frutos como nunca se viu.', on: 'volcano' },
    mar: { t: 'A Profecia da Cidade Afogada', text: 'O mar há de engolir parte de uma cidade orgulhosa.', on: 'sink', test: d => d.lost > 0 },
    monstro: { t: 'A Profecia da Fera', text: 'Das profundezas virá a fera dos mil braços, e os navios chorarão.', on: 'kraken' },
    ceu: { t: 'A Profecia do Sol Morto', text: 'O sol há de morrer ao meio-dia, e os fortes tremerão.', on: 'sign', test: d => d.kind === 'eclipse' },
    maravilha: { t: 'A Profecia da Obra', text: 'Uma obra tocará o céu, e o nome de seu povo não morrerá.', on: 'wonder' },
    terra: { t: 'A Profecia da Terra Nova', text: 'Uma terra nova subirá das águas.', on: 'raise' },
    heroi: { t: 'A Profecia do Campeão', text: 'Os céus escolherão um campeão entre os mortais.', on: 'hero' },
    metropole: { t: 'A Profecia da Grande Cidade', text: 'Haverá uma cidade tão grande que ninguém saberá o nome de todos os seus filhos.', on: 'city', test: d => d.tier >= 4 },
    imperio: { t: 'A Profecia do Trono', text: 'Um só trono há de reinar sobre muitas cidades.', on: 'gov', test: d => d.gov === 'imperio' },
    irmaos: { t: 'A Profecia dos Irmãos', text: 'Irmãos de sangue hão de erguer espadas uns contra os outros.', on: 'split' },
    estrela: { t: 'A Profecia da Estrela', text: 'Uma estrela de fogo cairá do céu claro.', on: 'meteor' },
    onda: { t: 'A Profecia da Onda', text: 'Uma onda maior que as árvores varrerá a costa.', on: 'tsunami' },
    velas: { t: 'A Profecia das Velas', text: 'Um povo cruzará o mar e fará casa do outro lado.', on: 'colony' },
    queda: { t: 'A Profecia da Queda', text: 'Um povo inteiro há de sumir da face do mundo.', on: 'extinct' },
  };

  const civOf = fid => { const f = G.Fac.get(fid); return f && f.civ ? G.CIVS[f.civ] : null; };
  const godOf = fid => { const c = civOf(fid); return c ? c.god[0] : 'Aquele que Observa'; };
  const chronOf = fid => { const c = civOf(fid); return c ? c.chronicler : 'os anciãos'; };
  const facName = fid => { const f = G.Fac.get(fid); return f ? f.name : 'um povo esquecido'; };
  // "da Casa de Amon", "do Clã de Hrafn"; "do Numen Supremo", "de Aquele que Observa"
  const deF = fid => { const f = G.Fac.get(fid); return f ? 'd' + G.Fac.oa(f) + ' ' + f.name : 'de um povo esquecido'; };
  const aF = fid => { const f = G.Fac.get(fid); return f ? (G.Fac.oa(f) === 'a' ? 'à ' : 'ao ') + f.name : 'a um povo esquecido'; };
  const deX = s => (/^o /.test(s) ? 'do ' + s.slice(2) : /^a /.test(s) ? 'da ' + s.slice(2) : 'de ' + s);
  const TECHN = t => (G.TECH[t] ? G.TECH[t].name.toLowerCase() : t);

  // ------------------------------ genesis ------------------------------
  L.genesis = function (opts) {
    const S = G.S; S.lore = null; const lo = lore();
    lo.world = worldName();
    const desc = MAPDESC[S.mapType] || MAPDESC.ilha;
    lo.myth = [pick(BEFORE), pick(MAKING).replace('{desc}', desc).replace('{world}', lo.world), pick(LIFE)];
    const facs = G.Fac.all();
    lo.myth.push(facs.length > 1 ? `Por último acordaram os povos — ${facs.length}, cada um em seu canto de ${lo.world}, sem saber uns dos outros.` : `Por último, ${S.villagers.size} almas acordaram ao redor de uma fogueira que ninguém havia acendido.`);
    lo.myth.push(pick(COVENANT));
    for (const f of facs) notePeople(f);
    // two ancient prophecies hang over every world
    const keys = Object.keys(ANCIENT).filter(k => k !== 'velas' || S.mapType === 'mar' || S.mapType === 'arquipelago');
    const chosen = []; while (chosen.length < 2 && keys.length) chosen.push(keys.splice(Math.floor(G.R() * keys.length), 1)[0]);
    lo.ancient = chosen.map(k => ({ k, text: ANCIENT[k].text, st: 'aberta' }));
    lo.chapters = []; lo.legends = [];
    lo.acc = freshAcc();
    lo.lastN = S.logN || 0;
  };
  function notePeople(f) {
    const lo = lore(); if (lo.peoples[f.id]) return;
    const cap = G.Fac.capitalOf(f.id); const r = G.Politics.ruler(f);
    const sym = G.Fac.SYMBOLS[(f.sym | 0) % G.Fac.SYMBOLS.length];
    const origin = f.parent
      ? `${f.name} nasceu de uma ruptura com ${facName(f.parent)}${cap ? ', em ' + cap.name : ''}. Seus fundadores juravam que ${godOf(f.id)} estava do lado deles.`
      : (ORIGIN[f.civ] || ORIGIN.classico).replace('{people}', f.civ && G.CIVS[f.civ] ? `Os ${G.CIVS[f.civ].name.toLowerCase()} ${deF(f.id)}` : `O povo ${deF(f.id)}`).replace('{god}', godOf(f.id)).replace('{degod}', deX(godOf(f.id)));
    lo.peoples[f.id] = { name: f.name, civ: f.civ || null, day: G.S.day, origin, symbol: SYMWHY[sym] ? `Seu símbolo lembra ${SYMWHY[sym]}.` : '', founder: r ? r.name : '', founderG: r ? r.g : 'm', city: cap ? cap.name : '', god: godOf(f.id) };
  }

  // ------------------------------ period accumulator ------------------------------
  function freshAcc() {
    const S = G.S; const st = S.stats;
    return { from: S.day, b0: st.births || 0, d0: st.deaths || 0, k0: st.godKills || 0, p0: Object.assign({}, st.powers || {}), pop0: S.villagers.size, ic: {}, notes: [] };
  }
  const MAJOR = { tech: 1, gov: 1, city: 1, wonder: 1, aqueduct: 1, route: 1, contact: 1, colony: 1, wall: 1, sacrifice: 1, raise: 1, sink: 1, forest: 1, volcano: 1, volcanoSleep: 1, volcanoWake: 1, tsunami: 1, kraken: 1, krakenSlain: 1, krakenGone: 1, prophecy: 1, prophecyDone: 1, prophecyFail: 1, law: 1, sign: 1, vision: 1, golden: 1, goldenEnd: 1, curse: 1, hero: 1, divwall: 1, sin: 1, war: 1, peace: 1, conquer: 1, massacre: 1, split: 1, extinct: 1, crown: 1, meteor: 1, beast: 1, extinctSpecies: 1, tamed: 1, legendBeast: 1, climate: 1, migration: 1, locusts: 1 };

  // ------------------------------ legends ------------------------------
  function legend(key, title, text, o) {
    const lo = lore(); if (lo.legends.some(l => l.key === key)) return null;
    const l = Object.assign({ key, title, text: [text], day: G.S.day }, o || {});
    lo.legends.push(l);
    G.UI && G.UI.notice(`Nasce uma lenda: “${title}”.`, 'lore');
    return l;
  }
  function append(key, text) { const l = lore().legends.find(q => q.key === key); if (l && !l.text.includes(text)) l.text.push(text); return l; }

  // ------------------------------ notes from the world ------------------------------
  L.note = function (kind, d) {
    const S = G.S; if (!S) return; const lo = lore(); d = d || {};
    if (!lo.acc) lo.acc = freshAcc();
    if (MAJOR[kind] && lo.acc.notes.length < 90) lo.acc.notes.push(Object.assign({ k: kind, day: S.day }, d));
    // ancient prophecies
    for (const a of lo.ancient) {
      const A = ANCIENT[a.k]; if (a.st !== 'aberta' || A.on !== kind || (A.test && !A.test(d))) continue;
      a.st = 'cumprida'; a.day = S.day;
      S.faith = Math.min(999, S.faith + 60);
      for (const v of S.villagers.values()) v.devotion = Math.min(100, v.devotion + 8);
      log(`Cumpriu-se a antiga profecia de ${lo.world}: “${a.text}” Os velhos choram; os jovens passam a acreditar.`, 'prophecy');
      G.UI && G.UI.toast('Profecia antiga cumprida', a.text, 'prophecy');
      legend('ancient:' + a.k, A.t || 'A Profecia Cumprida', `Desde o princípio de ${lo.world} se dizia: “${a.text}” No ano ${S.day}, aconteceu.`, { kind: 'profecia' });
    }
    const chron = d.fac ? chronOf(d.fac) : 'os cronistas';
    switch (kind) {
      case 'volcano': legend('volcano:' + d.name, `${d.name}, a Montanha de Fogo`, `No ano ${S.day} a terra${d.where ? ' perto de ' + d.where : ''} rasgou-se ao meio e dela nasceu ${d.name}. O céu ficou negro de cinzas e rios de fogo desceram pelas encostas.`, { kind: 'fogo' }); break;
      case 'volcanoSleep': append('volcano:' + d.name, `Quando adormeceu, ${d.kills ? 'havia engolido ' + d.kills + (d.kills > 1 ? ' vidas' : ' vida') : 'não havia tirado nenhuma vida'}${d.lost ? ' e ' + d.lost + (d.lost > 1 ? ' construções' : ' construção') : ''}. As cinzas deixaram a terra negra e fértil.`); break;
      case 'volcanoWake': append('volcano:' + d.name, `No ano ${S.day} despertou outra vez, e ninguém mais ousou chamá-lo de morto.`); break;
      case 'kraken': legend('kraken:' + d.name, `${d.name}, o Devorador de Navios`, `No ano ${S.day} o mar${d.where ? ' diante de ' + d.where : ''} ferveu, e das profundezas ergueu-se ${d.name}: olhos de ouro, mil braços, fome sem fim.`, { kind: 'monstro' }); break;
      case 'krakenSlain': append('kraken:' + d.name, d.fac ? `Foi morto pela frota ${deF(d.fac)}, e os marinheiros de lá nunca mais pagaram bebida.` : 'Foi morto no mar, ninguém sabe por quem.'); break;
      case 'krakenGone': append('kraken:' + d.name, d.eaten ? `Levou ${d.eaten} ${d.eaten > 1 ? 'navios' : 'navio'} para o fundo antes de sumir. Dizem que ainda dorme lá embaixo.` : 'Voltou às profundezas sem provar navio algum. Os pescadores ainda evitam aquelas águas.'); break;
      case 'hero': legend('hero:' + d.id, `A Saga de ${d.name}`, `No ano ${S.day}, os céus tocaram ${d.name}${d.fac ? ', ' + deF(d.fac) : ''}, e ${d.g === 'f' ? 'ela' : 'ele'} passou a lutar como dez.`, { kind: 'heroi', ref: d.id }); break;
      case 'vision': legend('vision:' + d.id, `${d.name}, ${d.g === 'f' ? 'a Profetisa' : 'o Profeta'}`, `No ano ${S.day}, ${d.name} caiu em transe diante de todos e acordou falando com a voz dos céus.`, { kind: 'profeta', ref: d.id }); break;
      case 'sink': if (d.lost >= 1 && d.name) legend('sink:' + d.set + ':' + S.day, `${d.name} Submersa`, `No ano ${S.day} o chão de ${d.name} cedeu e o mar entrou sem pedir licença. ${d.lost} ${d.lost > 1 ? 'construções foram engolidas' : 'construção foi engolida'}. Pescadores juram ouvir sinos sob as ondas.`, { kind: 'mar' }); break;
      case 'raise': legend('raise:' + S.day + ':' + Math.round(d.x), `A Ilha de ${G.mythName ? G.mythName() : 'Ninguém'}`, `No ano ${S.day} a água${d.where ? ' perto de ' + d.where : ''} ficou rasa, depois lamacenta, depois terra firme. Uma ilha nova subiu do mar em plena luz do dia.`, { kind: 'terra' }); break;
      case 'tsunami': if ((d.killed || 0) + (d.lost || 0) >= 2) legend('wave:' + S.day, `A Grande Onda do Ano ${S.day}`, `Uma parede de água maior que as árvores varreu a costa${d.where ? ' de ' + d.where : ''}${d.killed ? ', levando ' + d.killed + (d.killed > 1 ? ' vidas' : ' vida') : ''}${d.lost ? ' e ' + d.lost + (d.lost > 1 ? ' construções' : ' construção') : ''}.`, { kind: 'mar' }); break;
      case 'wonder': { const s = G.S.settlements.get(d.set); legend('wonder:' + d.set, `${d.name} de ${s ? s.name : '?'}`, `No ano ${S.day}, ${facName(d.fac)} terminou ${d.name}. ${G.cap(chron)} dizem que do topo se ouve ${godOf(d.fac)} respirar.`, { kind: 'maravilha' }); break; }
      case 'golden': legend('golden:' + d.fac + ':' + S.day, `A Era de Ouro ${deF(d.fac)}`, `No ano ${S.day} os celeiros ${deF(d.fac)} transbordaram, as obras subiram sozinhas e os sábios não dormiam.`, { kind: 'ouro', fac: d.fac }); break;
      case 'goldenEnd': { const l = lore().legends.filter(q => q.fac === d.fac && q.kind === 'ouro').pop(); if (l) append(l.key, `Durou até o ano ${S.day}. Os velhos ainda comparam tudo com aquele tempo.`); break; }
      case 'divwall': legend('divwall:' + d.set, `As Muralhas de Uma Noite`, `${d.name} dormiu desprotegida e acordou cercada de pedra. Ninguém carregou as rochas; ninguém ousa derrubá-las.`, { kind: 'milagre' }); break;
      case 'sacrifice': if (!lore().legends.some(q => q.kind === 'sangue' && q.fac === d.fac)) legend('sacrifice:' + d.fac, `O Primeiro Sacrifício ${deF(d.fac)}`, `No ano ${S.day}, ${d.name || 'um cativo'} subiu os degraus do templo e não desceu. ${G.cap(chron)} dizem que o sol precisava.`, { kind: 'sangue', fac: d.fac }); break;
      case 'prophecyDone': legend('prophecy:' + d.id, `A Profecia de ${d.setName}`, `No ano ${d.day} uma voz do céu disse a ${d.setName}: ${d.text} No ano ${S.day}, aconteceu.`, { kind: 'profecia' }); break;
      case 'beast': { const sp = G.Animals.DEF[d.kind]; legend('beast:' + d.name, `${d.name}, ${sp.g === 'f' ? 'a Devoradora' : 'o Devorador'}`, `No ano ${S.day}, ${sp.nameA}${d.where ? ' dos arredores de ' + d.where : ''} provou carne humana e gostou. Deram-lhe um nome, como se dá aos reis: ${d.name}.`, { kind: 'fera' }); break; }
      case 'legendBeast': { const sp = G.Animals.DEF[d.kind]; legend('beast:' + d.name, `${d.name}, ${d.title}`, `No ano ${S.day}, a terra${d.where ? ' perto de ' + d.where : ''} tremeu e dela saiu ${sp.nameA} do tamanho de uma casa. Os caçadores lhe deram um nome antes de fugir: ${d.name}.`, { kind: 'fera' }); break; }
      case 'tamed': { const sp = G.Animals.DEF[d.kind]; legend('tamed:' + d.name, `${d.name}, ${sp.g === 'f' ? 'a Guardiã' : 'o Guardião'} de ${d.setName}`, `No ano ${S.day}, ${sp.nameA} selvagem entrou em ${d.setName} e ninguém fugiu: os céus a tinham domado. Desde então, ${d.name} dorme na porta da cidade e ataca quem vem com más intenções.`.replace('a tinham', sp.g === 'f' ? 'a tinham' : 'o tinham'), { kind: 'fera', fac: d.fac }); break; }
      case 'climate': { const TT = ['A Primavera Devolvida', 'O Inverno Sem Fim', 'Os Pinheiros Escuros', 'As Águas Paradas', 'A Selva de Uma Noite', 'O Capim Dourado', 'O Ano em que a Terra Secou']; const TX = ['os bosques voltaram, verdes e mansos', 'a neve caiu e nunca mais derreteu', 'pinheiros escuros cobriram a terra', 'o chão virou lama e as águas não baixaram mais', 'árvores gigantes brotaram numa só noite', 'o capim ficou dourado e as acácias se abriram', 'a chuva parou para sempre e a areia tomou tudo']; legend('climate:' + S.day + ':' + d.b, TT[d.b] + (d.where ? ` de ${d.where}` : ''), `No ano ${S.day}${d.where ? ', perto de ' + d.where : ''}, ${TX[d.b]}. Os velhos juram que foi castigo; os jovens, que foi presente.`, { kind: 'terra' }); break; }
      case 'locusts': if (d.ate >= 8) legend('locusts:' + S.day, `A Praga dos Gafanhotos`, `No ano ${S.day} o céu escureceu ao meio-dia e zumbiu${d.where ? ' sobre ' + d.where : ''}. Quando a nuvem passou, ${d.ate} canteiros estavam nus. Naquele inverno, comeu-se casca de árvore.`, { kind: 'peste' }); break;
      case 'beastDied': append('beast:' + d.name, d.by ? `Foi abatid${G.Animals.DEF[d.kind].g === 'f' ? 'a' : 'o'} por ${d.by} no ano ${S.day}. Penduraram a pele na praça.` : `Morreu no ano ${S.day}, e ninguém sabe onde estão seus ossos.`); break;
      case 'law': { const p = lore().peoples[d.fac]; if (p) p.law = `Desde o ano ${S.day}, segue o mandamento “${d.name}”.`; break; }
      case 'city': if (d.tier >= 5) legend('mega:' + d.set, `${d.name}, a Infinita`, `No ano ${S.day}, ${d.name} já não cabia em si: bairros e mais bairros de prédios altos, mercados que nunca fechavam, gente de todos os povos. Os viajantes a chamavam de ${d.name}, a Infinita.`, { kind: 'cidade' });
        if (d.tier === 4) legend('metropole:' + d.set, `${d.name}, a Grande`, `No ano ${S.day}, ${d.name} tornou-se uma metrópole — a primeira ${deF(d.fac)} tão grande que ninguém conhecia todas as suas ruas.`, { kind: 'cidade' }); break;
    }
  };

  // wrap the political & military turning points so they reach the book
  function hook(obj, name, fn) {
    const orig = obj && obj[name]; if (!orig) return;
    obj[name] = function () { const pre = fn.pre ? fn.pre.apply(this, arguments) : null; const r = orig.apply(this, arguments); try { fn.post.apply(this, [r, pre].concat([].slice.call(arguments))); } catch (e) { console.warn(e); } return r; };
  }
  hook(G.Politics, 'declareWar', { pre: (a, b) => { const r = G.Fac.rel(a.id, b.id); return r && r.st !== 'guerra'; }, post: (r, was, a, b, reason) => { const rr = G.Fac.rel(a.id, b.id); if (was && rr && rr.st === 'guerra') L.note('war', { a: a.id, b: b.id, reason }); } });
  hook(G.War, 'onPeace', { post: (r, pre, a, b) => L.note('peace', { a: a.id, b: b.id }) });
  hook(G.War, 'conquer', { pre: (set, b) => set.fac, post: (r, old, set, b) => { if (set.fac !== old) L.note('conquer', { set: set.id, name: set.name, fac: set.fac, from: old }); } });
  hook(G.War, 'finishMassacre', { post: (r, pre, b, set, left) => L.note('massacre', { set: set.id, name: set.name, fac: b.fac, kills: b.kills }) });
  hook(G.Politics, 'secede', { pre: s => s.fac, post: (nf, old, s) => { if (nf) L.note('split', { set: s.id, name: s.name, fac: nf.id, from: old }); } });
  hook(G.Politics, 'extinct', { post: (r, pre, f, by) => L.note('extinct', { fac: f.id, name: f.name, by: by ? by.id : 0 }) });
  hook(G.Politics, 'meet', { pre: (a, b) => { const r = G.Fac.rel(a.id, b.id); return r && !r.met; }, post: (r, fresh, a, b) => { if (fresh) L.note('contact', { a: a.id, b: b.id, sea: !G.W.sameLand((G.Fac.capitalOf(a.id) || {}).cx || 0, (G.Fac.capitalOf(a.id) || {}).cy || 0, (G.Fac.capitalOf(b.id) || {}).cx || 0, (G.Fac.capitalOf(b.id) || {}).cy || 0) }); } });
  hook(G.Politics, 'crown', { post: (r, pre, f, v, how) => { if (v) L.note('crown', { fac: f.id, name: v.name, g: v.g, how }); } });

  // ------------------------------ chapters ------------------------------
  const THEME = {
    despertar: ['O Despertar', 'Os Primeiros Dias', 'O Tempo das Fogueiras'],
    espadas: ['O Tempo das Espadas', 'Os Anos de Sangue', 'A Era dos Estandartes', 'Quando os Tambores Não Paravam'],
    fogo: ['A Era do Fogo', 'Os Anos de Cinza', 'Quando o Céu Caiu', 'O Tempo da Ira'],
    mar: ['A Era das Velas', 'Os Anos do Mar Aberto', 'O Tempo dos Navegadores'],
    ouro: ['A Idade de Ouro', 'O Tempo das Colunas', 'Os Anos de Fartura', 'A Era dos Construtores'],
    peste: ['Os Anos da Febre', 'O Tempo do Luto', 'A Estação Magra'],
    fe: ['O Tempo dos Profetas', 'A Era dos Sinais', 'Quando os Céus Falaram'],
    coroas: ['O Tempo das Coroas', 'A Era dos Tronos Partidos', 'Os Anos dos Usurpadores'],
    paz: ['Os Anos Tranquilos', 'O Tempo das Colheitas', 'A Longa Paz', 'Os Dias Mansos'],
  };
  const CLOSE = {
    espadas: ['Os cronistas escreveram estes anos com tinta vermelha.', 'Poucos dormiram tranquilos.', 'Os ferreiros nunca foram tão ricos.'],
    fogo: ['Os céus não estavam de bom humor.', 'Até hoje há quem olhe para cima antes de sair de casa.'],
    mar: ['O horizonte deixou de ser o fim do mundo.', 'Cada porto ganhou histórias novas para contar.'],
    ouro: ['Foi um bom tempo para estar vivo.', 'As pedras daquela época ainda estão de pé.'],
    peste: ['As covas foram cavadas mais fundo.', 'Rezou-se muito, e baixinho.'],
    fe: ['Ninguém mais duvidou de que alguém observava.', 'Os templos nunca estiveram tão cheios.'],
    coroas: ['Coroas trocaram de cabeça mais depressa que as estações.', 'Aprendeu-se que o trono esfria rápido.'],
    paz: ['Nada de grandioso aconteceu — e isso foi uma bênção.', 'As crianças cresceram sem medo.'],
    despertar: ['Tudo estava por fazer.', 'O mundo ainda cheirava a novo.'],
  };
  const PNAME = id => { const p = G.Powers.byId(id); return p ? p.name : id; };
  function compose(acc, toDay, draft) {
    const S = G.S; const lo = lore(); const st = S.stats;
    const N = acc.notes; const count = k => N.filter(n => n.k === k).length; const ic = k => acc.ic[k] || 0;
    const births = (st.births || 0) - acc.b0, deaths = (st.deaths || 0) - acc.d0, gk = (st.godKills || 0) - acc.k0;
    const pw = []; for (const k in st.powers || {}) { const d = (st.powers[k] || 0) - (acc.p0[k] || 0); if (d > 0) pw.push([k, d]); } pw.sort((a, b) => b[1] - a[1]);
    const nPw = pw.reduce((s, p) => s + p[1], 0);
    const score = {
      espadas: count('war') * 3 + count('conquer') * 4 + count('massacre') * 5 + ic('war') * 0.3 + ic('siege') * 1.5,
      fogo: count('volcano') * 7 + count('meteor') * 4 + count('tsunami') * 5 + count('sink') * 4 + ic('fire') * 0.15 + (pw.find(p => p[0] === 'lightning') || [0, 0])[1] * 0.8,
      mar: count('colony') * 4 + count('kraken') * 5 + N.filter(n => (n.k === 'route' || n.k === 'contact') && n.sea).length * 3 + ic('naval') * 0.4,
      ouro: count('golden') * 7 + count('wonder') * 7 + count('city') * 2 + count('tech') * 1.5 + count('aqueduct') * 1.5,
      peste: ic('sick') * 1.2 + (deaths > births * 1.3 && deaths > 8 ? 6 : 0),
      fe: count('prophecy') * 3 + count('prophecyDone') * 5 + count('vision') * 3 + count('law') * 3 + count('sign') * 3,
      coroas: count('split') * 5 + ic('tyrant') * 2 + N.filter(n => n.k === 'crown' && n.how !== 'heranca' && n.how !== 'escolha').length * 3 + count('crown') * 0.6,
      paz: 3 + births * 0.04,
    };
    let theme = lo.chapters.length === 0 ? 'despertar' : 'paz', best = lo.chapters.length === 0 ? 14 : score.paz;
    for (const k in score) if (score[k] > best) { best = score[k]; theme = k; }
    const used = new Set(lo.chapters.map(c => c.title));
    const pool = THEME[theme].filter(t => !used.has(t));
    const title = pool.length ? pool[Math.floor(G.hash(acc.from * 31 + lo.chapters.length) * pool.length)] : THEME[theme][0] + ' (' + (lo.chapters.filter(c => c.theme === theme).length + 1) + ')';
    // sentences built from what really happened
    const out = [];
    const fn = id => facName(id);
    const volc = N.filter(n => n.k === 'volcano'); if (volc.length) out.push(`${volc.map(n => n.name).join(' e ')} ${volc.length > 1 ? 'nasceram do chão e cuspiram' : 'nasceu do chão e cuspiu'} fogo sobre ${lo.world}.`);
    const krk = N.filter(n => n.k === 'kraken'); if (krk.length) out.push(`${krk.map(n => n.name).join(' e ')} ${krk.length > 1 ? 'subiram' : 'subiu'} das profundezas para caçar navios.`);
    const sinks = N.filter(n => n.k === 'sink' && n.lost); if (sinks.length) out.push(`O mar engoliu parte de ${sinks.map(n => n.name || n.where).filter(Boolean).join(' e ') || 'uma cidade'}.`);
    const raises = N.filter(n => n.k === 'raise'); if (raises.length) out.push(raises.length > 1 ? `${raises.length} terras novas subiram do mar.` : 'Uma terra nova subiu do mar.');
    const tsu = N.filter(n => n.k === 'tsunami'); if (tsu.length) out.push(`${tsu.length > 1 ? 'Ondas gigantes varreram' : 'Uma onda gigante varreu'} a costa${tsu[0].where ? ' de ' + tsu[0].where : ''}.`);
    const wars = N.filter(n => n.k === 'war'); if (wars.length) out.push(wars.length > 2 ? `A guerra acendeu-se ${wars.length} vezes; a primeira, entre ${fn(wars[0].a)} e ${fn(wars[0].b)}.` : wars.map(n => `${fn(n.a)} declarou guerra ${aF(n.b)}.`).join(' '));
    const conq = N.filter(n => n.k === 'conquer'); if (conq.length) out.push(conq.slice(0, 3).map(n => `${fn(n.fac)} tomou ${n.name} ${deF(n.from)}`).join('; ') + (conq.length > 3 ? `, e mais ${conq.length - 3}` : '') + '.');
    const mas = N.filter(n => n.k === 'massacre'); if (mas.length) out.push(`Em ${mas.map(n => n.name).join(' e ')}, ${fn(mas[0].fac)} não poupou ninguém.`);
    const peace = N.filter(n => n.k === 'peace'); if (peace.length && wars.length) out.push(`A paz voltou${peace.length > 1 ? ' ' + peace.length + ' vezes' : ''}, cansada.`);
    const splits = N.filter(n => n.k === 'split'); if (splits.length) out.push(splits.map(n => `${n.name} rompeu com ${fn(n.from)} e virou ${fn(n.fac)}`).join('; ') + '.');
    const ext = N.filter(n => n.k === 'extinct'); if (ext.length) out.push(`${ext.map(n => n.name).join(' e ')} ${ext.length > 1 ? 'desapareceram' : 'desapareceu'} da face do mundo.`);
    const crowns = N.filter(n => n.k === 'crown' && (n.how === 'ungido' || n.how === 'golpe' || n.how === 'revolucao' || n.how === 'usurpacao')); if (crowns.length) out.push(crowns.slice(0, 2).map(n => `${n.name} tomou o poder em ${fn(n.fac)}${n.how === 'ungido' ? ', tocad' + (n.g === 'f' ? 'a' : 'o') + ' pelos céus' : ''}`).join('; ') + '.');
    const cityLast = {}; for (const n of N.filter(n => n.k === 'city')) cityLast[n.set] = n; const cities = Object.values(cityLast).filter(n => n.tier >= 2); if (cities.length) out.push(cities.slice(-3).map(n => `${n.name} tornou-se ${(G.City.TIERS[n.tier] || '').toLowerCase()}`).join(', ') + '.');
    const wonders = N.filter(n => n.k === 'wonder'); if (wonders.length) out.push(wonders.map(n => `${fn(n.fac)} ergueu ${n.name}`).join('; ') + '.');
    const techs = {}; for (const n of N.filter(n => n.k === 'tech')) (techs[n.fac] = techs[n.fac] || []).push(TECHN(n.tech));
    const tk = Object.keys(techs); if (tk.length) out.push(tk.slice(0, 3).map(f => `${fn(+f)} aprendeu ${techs[f].slice(0, 3).join(', ')}`).join('; ') + '.');
    const cols = N.filter(n => n.k === 'colony'); if (cols.length) out.push(cols.map(n => `${fn(n.fac)} cruzou o mar e fundou ${n.name}`).join('; ') + '.');
    const cont = N.filter(n => n.k === 'contact'); if (cont.length) { const who = [...new Set(cont.flatMap(n => [n.a, n.b]))].map(fn); out.push(`${who.length > 2 ? who.slice(0, -1).join(', ') + ' e ' + who[who.length - 1] : who.join(' e ')} se ${cont.some(n => n.sea) ? 'avistaram através do mar' : 'encontraram'} pela primeira vez.`); }
    const gold = N.filter(n => n.k === 'golden'); if (gold.length) out.push(`${fn(gold[0].fac)} viveu uma era de ouro.`);
    const curses = N.filter(n => n.k === 'curse'); if (curses.length) out.push(`${curses.map(n => fn(n.fac)).join(' e ')} ${curses.length > 1 ? 'foram amaldiçoados' : 'carregou uma maldição'}.`);
    const laws = N.filter(n => n.k === 'law'); if (laws.length) out.push(laws.map(n => `${fn(n.fac)} recebeu a lei “${n.name}”`).join('; ') + '.');
    const sins = N.filter(n => n.k === 'sin'); if (sins.length) out.push(`${fn(sins[0].fac)} quebrou o mandamento sagrado.`);
    const prDone = N.filter(n => n.k === 'prophecyDone'); if (prDone.length) out.push(`${prDone.length > 1 ? prDone.length + ' profecias se cumpriram' : 'Cumpriu-se a profecia sobre ' + prDone[0].setName}.`);
    const gone = N.filter(n => n.k === 'extinctSpecies'); if (gone.length) out.push(`${gone.map(n => G.cap(G.Animals.plural(G.Animals.DEF[n.kind], 2).replace(/^2 /, ''))).join(', ')} ${gone.length > 1 ? 'sumiram' : 'sumiram'} do mundo.`);
    const legs = N.filter(n => n.k === 'legendBeast'); if (legs.length) out.push(`${legs.map(n => n.name + ', ' + n.title).join(' e ')} ${legs.length > 1 ? 'despertaram' : 'despertou'} para caçar gente.`);
    const tames = N.filter(n => n.k === 'tamed'); if (tames.length) out.push(tames.map(n => `${n.name} passou a guardar ${n.setName}`).join('; ') + '.');
    const clim = N.filter(n => n.k === 'climate'); if (clim.length) out.push(`O clima mudou${clim.length > 1 ? ' ' + clim.length + ' vezes' : ''} pela vontade dos céus${clim[0].where ? ', a começar perto de ' + clim[0].where : ''}.`);
    const migs = N.filter(n => n.k === 'migration'); if (migs.length) out.push(migs.slice(0, 2).map(n => `${G.Animals.plural(G.Animals.DEF[n.kind], n.n)} atravessaram a terra${n.where ? ' até ' + n.where : ''}`).join('; ') + '.');
    const loc = N.filter(n => n.k === 'locusts' && n.ate); if (loc.length) out.push(`Gafanhotos devoraram ${loc.reduce((q, n) => q + n.ate, 0)} canteiros de plantação.`);
    const beasts = N.filter(n => n.k === 'beast'); if (beasts.length) out.push(`${beasts.map(n => n.name).join(' e ')} ${beasts.length > 1 ? 'aterrorizaram' : 'aterrorizou'} os caminhos.`);
    const heroes = N.filter(n => n.k === 'hero'); if (heroes.length) out.push(`${heroes.map(n => n.name).join(' e ')} ${heroes.length > 1 ? 'foram escolhidos' : 'foi escolhid' + (heroes[0].g === 'f' ? 'a' : 'o')} pelos céus.`);
    const signs = N.filter(n => n.k === 'sign'); if (signs.length) out.push(`${signs.length > 1 ? 'Sinais' : 'Um sinal'} no céu — ${signs.map(n => ({ cometa: 'um cometa', eclipse: 'um eclipse', aurora: 'uma aurora', estrelas: 'uma chuva de estrelas' })[n.kind]).join(', ')} — mudou o humor dos povos.`);
    if (!out.length && lo.chapters.length === 0) out.push(G.Fac.all().length > 1 ? `Os povos de ${lo.world} acenderam suas fogueiras, cortaram as primeiras árvores e ergueram as primeiras cabanas.` : 'O povo acendeu sua fogueira, cortou as primeiras árvores e ergueu as primeiras cabanas.');
    out.push(`${births ? `Nasceram ${births} ${births === 1 ? 'criança' : 'crianças'}` : 'Não nasceu ninguém'} e ${deaths ? deaths + (deaths === 1 ? ' pessoa morreu' : ' pessoas morreram') : 'ninguém morreu'}${gk > 0 ? `, ${gk === 1 ? 'uma delas' : gk + ' delas'} pela mão dos céus` : ''}. ${draft ? 'Agora' : 'Ao fim destes anos'} ${S.villagers.size === 1 ? 'vive uma alma' : 'vivem ' + S.villagers.size + ' almas'} em ${S.settlements.size} ${S.settlements.size === 1 ? 'povoado' : 'povoados'}.`);
    out.push(nPw === 1 ? `Os céus intervieram uma vez: ${PNAME(pw[0][0]).toLowerCase()}.` : nPw ? `Os céus intervieram ${nPw} vezes — sobretudo com ${pw.slice(0, 3).map(p => PNAME(p[0]).toLowerCase()).join(', ')}.` : 'Os céus ficaram em silêncio.');
    if (!draft) out.push(pick(CLOSE[theme]));
    // whose voice tells it: the largest people
    let big = null, bp = -1; for (const f of G.Fac.all()) { const p = G.Fac.pop(f.id); if (p > bp) { bp = p; big = f; } }
    const voice = big ? `Assim contam ${chronOf(big.id)} ${deF(big.id)}:` : 'Assim lembram as pedras:';
    return { n: lo.chapters.length + 1, title, theme, from: acc.from, to: toDay, voice, text: out };
  }
  function closeChapter() {
    const S = G.S; const lo = lore();
    const ch = compose(lo.acc, S.day - 1, false);
    lo.chapters.push(ch);
    lo.acc = freshAcc();
    G.UI && G.UI.notice(`Novo capítulo no Livro de ${lo.world}: “${ch.title}”.`, 'lore');
  }

  // ------------------------------ ticking ------------------------------
  let tick = 0;
  L.update = function (dt) {
    const S = G.S; if (!S) return; const lo = lore();
    if (!lo.world) L.genesis({});
    if (!lo.acc) lo.acc = freshAcc();
    tick += dt; if (tick < 1) return; tick = 0;
    // icon tallies of the chronicle since last time
    for (const e of S.history) { if (e.n <= lo.lastN) continue; lo.acc.ic[e.ic] = (lo.acc.ic[e.ic] || 0) + 1; if (e.ic === 'meteor' && /meteoro caiu/.test(e.txt)) L.note('meteor', {}); }
    lo.lastN = S.logN || 0;
    // new peoples (secessions, freed captives) get an origin
    for (const f of G.Fac.all()) if (!lo.peoples[f.id]) notePeople(f);
    for (const id in lo.peoples) { const f = S.factions.get(+id); const p = lo.peoples[id]; if (f && !f.alive && !p.end) p.end = `Desapareceu no ano ${f.died || S.day}${f.fate ? ' — ' + f.fate : ''}.`; }
    // legends of people end when they die
    for (const l of lo.legends) {
      if (!l.ref || l.closed || S.villagers.has(l.ref)) continue;
      l.closed = true; const r = S.dead.get(l.ref);
      if (!r) continue;
      const cause = r.cause;
      if (l.kind === 'heroi') append(l.key, cause === 'old' ? `Morreu velh${r.g === 'f' ? 'a' : 'o'}, aos ${Math.floor(r.age)} anos, com ${r.kills || 0} vitórias — coisa rara para quem vive de espada.` : cause === 'war' || cause === 'arrow' || cause === 'massacre' ? `Tombou em combate no ano ${r.died}, com ${r.kills || 0} vitórias. Cantam que sorriu ao cair.` : `Morreu no ano ${r.died}, aos ${Math.floor(r.age)} anos, com ${r.kills || 0} vitórias.`);
      else if (l.kind === 'profeta') append(l.key, `Calou-se para sempre no ano ${r.died}. Seus discípulos ainda repetem suas palavras.`);
    }
    if (S.day >= lo.acc.from + CH_DAYS) closeChapter();
  };

  // ------------------------------ the book ------------------------------
  L.tab = 'genese';
  const TABS = [['genese', 'Gênese'], ['cronicas', 'Crônicas'], ['lendas', 'Lendas'], ['povos', 'Povos'], ['bestiario', 'Bestiário'], ['profecias', 'Profecias']];

  // ------------------------------ the bestiary: the living food web, in numbers ------------------------------
  L.bestSel = null;
  const EATS = { herb: 'capim e ervas', browse: 'folhas, frutos e brotos', insect: 'insetos', fish: 'peixes', filter: 'plâncton e algas', carn: '', omni: 'frutos, raízes', scav: 'carniça' };
  const CAUSE = { hunger: 'fome', old: 'velhice', fire: 'fogo', gente: 'caçadores', stranded: 'encalhe', other: 'outras causas', hunt: 'caçadores', lava: 'lava', wave: 'maremoto', god: 'os céus' };
  const spCol = d => (d.col && d.col[0]) || (d.q && d.q.col) || (d.b && d.b.col) || { dolphin: '#6a8aa8', shark: '#7a8a96', orca: '#1e2228', whale: '#4a5a6e', turtle: '#6a8a4a', seal: '#8a8a86', penguin: '#2a2a30', elephant: '#8a8a8e', giraffe: '#e0a84a', wolf: '#8a8a90', boar: '#6a4a36', croc: '#5a6a3a', frog: '#6aa84a' }[d.id] || '#b8a890';
  function spark(vals, w, h, cap) {
    if (vals.length < 2) return '';
    const mx = Math.max(1, cap || 0, ...vals);
    const pts = vals.map((v, k) => `${(k / (vals.length - 1) * w).toFixed(1)},${(h - 1 - v / mx * (h - 2)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${cap ? `<line x1="0" x2="${w}" y1="${(h - 1 - cap / mx * (h - 2)).toFixed(1)}" y2="${(h - 1 - cap / mx * (h - 2)).toFixed(1)}" class="cap"/>` : ''}<polyline points="${pts}"/></svg>`;
  }
  function bestiary() {
    const S = G.S; const A = G.Animals; const D = A.DEF; const eco = S.eco || { deaths: {}, born: {} };
    const cnt = A.counts(); const hist = eco.hist || [];
    const series = k => hist.map(h => h.c[k] || 0).concat([cnt[k] || 0]);
    const live = A.ids.filter(k => A.capacity(k) > 0 || cnt[k] || (eco.gone && eco.gone[k]));
    const absent = A.ids.length - live.length;
    const sel = L.bestSel && D[L.bestSel] ? L.bestSel : null;
    const preyOf = sel ? new Set(D[sel].prey || []) : null, predOf = sel ? new Set(A.eatenBy[sel] || []) : null;
    let tot = 0; for (const k in cnt) tot += cnt[k];
    const born = Object.values(eco.born || {}).reduce((a, b) => a + b, 0), died = Object.values(eco.deaths || {}).reduce((a, b) => a + b, 0);
    const gone = Object.keys(eco.gone || {}).filter(k => eco.gone[k] && !cnt[k]);
    const chip = k => {
      const d = D[k]; const n = cnt[k] || 0;
      const rel = sel ? (k === sel ? 'me' : preyOf.has(k) ? 'prey' : predOf.has(k) ? 'pred' : 'dim') : '';
      return `<button class="be-sp ${rel}${n ? '' : ' none'}" data-m="best" data-k="${k}" title="${esc(A.dietName(k))}"><i style="background:${spCol(d)}"></i><b>${esc(d.name)}</b><em>${n}</em>${spark(series(k).slice(-16), 30, 12)}</button>`;
    };
    // producers: the plants and the sea
    let vegT = 0, vegC = 0; if (S.veg) for (let i = 0; i < S.veg.length; i += 3) { const c = A.vegCap(i); if (c > 0) { vegT += S.veg[i]; vegC += c; } }
    const fishN = (S.fish || []).reduce((a, f) => a + (f.n || 0), 0);
    const prodSel = sel && ['herb', 'browse', 'filter', 'insect', 'fish'].includes(D[sel].diet);
    const prod = `<span class="be-sp prod${prodSel && D[sel].diet !== 'fish' ? ' prey' : sel ? ' dim' : ''}"><i style="background:#7ab04a"></i><b>Capim e ervas</b><em>${vegC ? Math.round(vegT / vegC * 100) : 0}%</em></span>`
      + `<span class="be-sp prod${sel && D[sel].diet === 'browse' ? ' prey' : sel ? ' dim' : ''}"><i style="background:#3e7a3a"></i><b>Árvores e frutos</b><em>${S.trees.size}</em></span>`
      + `<span class="be-sp prod${sel && (D[sel].diet === 'fish' || D[sel].diet === 'filter') ? ' prey' : sel ? ' dim' : ''}"><i style="background:#4a8ab8"></i><b>Cardumes</b><em>${fishN}</em></span>`;
    const LV = [[3, 'Predadores de topo', 'ninguém os caça'], [2, 'Predadores', 'comem outros animais, peixes ou carniça'], [1, 'Herbívoros e filtradores', 'comem plantas, frutos, insetos ou plâncton'], [0, 'Produtores', 'o que alimenta todo o resto']];
    let web = '';
    for (const [lv, name, sub] of LV) {
      const ks = lv ? live.filter(k => A.level(k) === lv).sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0)) : null;
      web += `<div class="be-lv"><div class="be-lvn">${name}<small>${sub}</small></div><div class="be-row">${lv ? ks.map(chip).join('') || '<span class="muted">nenhum</span>' : prod}</div></div>`;
    }
    let det = '';
    if (sel) {
      const d = D[sel]; const n = cnt[sel] || 0; const cap = A.capacity(sel);
      const where = d.cls === 'water' ? ({ cold: 'mares frios', warm: 'mares quentes', mild: 'mares temperados e quentes', any: 'todos os mares' }[d.sea] || 'o mar') + (d.deep ? ', longe da costa' : '')
        : (d.hab || []).map(b => G.BIOMES[b].name.toLowerCase()).join(', ') + (d.near === 'water' ? ' — sempre perto da água' : d.near === 'sea' ? ' — na beira do mar' : d.coast ? ' — no litoral' : '');
      const eats = d.prey ? d.prey.map(q => D[q].name.toLowerCase()).join(', ') + (EATS[d.diet] ? ', ' + EATS[d.diet] : '') : EATS[d.diet];
      const by = (A.eatenBy[sel] || []).map(q => D[q].name.toLowerCase()).join(', ');
      const cz = (eco.cause && eco.cause[sel]) || {}; const czs = Object.entries(cz).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, v]) => `${D[c] ? D[c].name.toLowerCase() : CAUSE[c] || c} ${v}`).join(' · ');
      const famous = [...S.animals.values()].filter(a => a.kind === sel && !a.dead && a.named).map(a => `${a.named}${a.epithet ? ', ' + a.epithet : a.tamed ? ' (guardi' + (d.g === 'f' ? 'ã' : 'ão') + ')' : ''}`);
      det = `<div class="be-det"><div class="be-dh"><i style="background:${spCol(d)}"></i><b>${esc(d.name)}</b><span>${esc(A.dietName(sel))}${d.apex ? ' · predador de topo' : ''}</span></div>
        <div class="be-chart">${spark(series(sel), 260, 54, cap)}<div><b>${n}</b> vivos · o mundo comporta ~${cap}<br>${eco.born[sel] || 0} nascimentos · ${eco.deaths[sel] || 0} mortes</div></div>
        <p class="facts">Vive em: <b>${esc(where || '—')}</b></p>
        <p class="facts">Come: <b>${esc(eats || '—')}</b></p>
        <p class="facts">${by ? 'Caçad' + (d.g === 'f' ? 'a' : 'o') + ' por: <b>' + esc(by) + '</b>' : 'Ninguém o caça.'}${d.hunt ? ' · os caçadores o perseguem' : ''}${d.bold ? ' · <span class="warn">ataca gente</span>' : ''}</p>
        ${czs ? `<p class="facts">Mortes: ${esc(czs)}</p>` : ''}
        ${famous.length ? `<p class="facts">Célebres: <b>${esc(famous.join('; '))}</b></p>` : ''}
        ${eco.gone && eco.gone[sel] && !n ? `<p class="end">Extinto no ano ${eco.gone[sel]}.</p>` : ''}</div>`;
    }
    return `<div class="be-sum"><div><b>${tot}</b><span>animais vivos</span></div><div><b>${live.filter(k => cnt[k]).length}</b><span>espécies</span></div><div><b>${born}</b><span>nascimentos</span></div><div><b>${died}</b><span>mortes</span></div><div><b>${gone.length}</b><span>extintas</span></div></div>
      <p class="muted be-hint">${sel ? 'Verde: o que come. Vermelho: quem o caça. Clique de novo para limpar.' : 'Clique numa espécie para ver sua cadeia alimentar: de quem ela se alimenta e quem a caça.'}${absent ? ` ${absent} espécies não encontram lar neste mundo.` : ''}</p>
      <div class="be-web">${web}</div>${det}${gone.length ? `<p class="facts be-gone">Extintas: ${gone.map(k => esc(D[k].name)).join(', ')}</p>` : ''}`;
  }
  L.openBook = function (tab) {
    const S = G.S; if (!S) return; const lo = lore(); if (!lo.world) L.genesis({});
    if (tab) L.tab = tab;
    const I = G.ICON;
    let body = '';
    if (L.tab === 'genese') {
      body = `<div class="bk-myth">${lo.myth.map((p, k) => `<p${k === 0 ? ' class="drop"' : ''}>${esc(p)}</p>`).join('')}</div>`;
      if (lo.ancient.length) body += `<h4>Ditos antigos</h4>${lo.ancient.map(a => `<div class="bk-anc ${a.st}"><span>“${esc(a.text)}”</span><em>${a.st === 'cumprida' ? 'cumpriu-se no ano ' + a.day : 'ainda não se cumpriu'}</em></div>`).join('')}`;
    } else if (L.tab === 'cronicas') {
      const draft = lo.acc ? compose(lo.acc, S.day, true) : null;
      const ch = lo.chapters.slice().reverse();
      body = (draft ? `<div class="bk-ch draft"><div class="bk-cht"><b>Capítulo ${draft.n} — sendo escrito</b><span>anos ${draft.from}–${S.day}</span></div><p>${draft.text.map(esc).join(' ')}</p></div>` : '')
        + (ch.length ? ch.map(c => `<div class="bk-ch"><div class="bk-cht"><b>Capítulo ${c.n} — ${esc(c.title)}</b><span>anos ${c.from}–${c.to}</span></div><p class="voice">${esc(c.voice)}</p><p>${c.text.map(esc).join(' ')}</p></div>`).join('') : '<p class="muted">O primeiro capítulo ainda está sendo vivido.</p>');
    } else if (L.tab === 'lendas') {
      const ls = lo.legends.slice().reverse();
      body = ls.length ? ls.map(l => `<div class="bk-leg"><div class="bk-cht"><b>${esc(l.title)}</b><span>ano ${l.day}</span></div>${l.text.map(t => `<p>${esc(t)}</p>`).join('')}</div>`).join('')
        : '<p class="muted">Nenhuma lenda ainda. Lendas nascem de heróis, monstros, maravilhas, profecias cumpridas — e das coisas que só um deus faz.</p>';
    } else if (L.tab === 'povos') {
      const ids = Object.keys(lo.peoples).map(Number).sort((a, b) => (S.factions.get(b) && S.factions.get(b).alive) - (S.factions.get(a) && S.factions.get(a).alive) || a - b);
      body = ids.map(id => {
        const p = lo.peoples[id]; const f = S.factions.get(id);
        const rulers = f && f.rulers ? f.rulers.slice(-6).map(r => esc(r.name + (r.ep ? ', ' + r.ep : ''))).join(' → ') : '';
        const sets = f && f.alive ? G.Fac.settlementsOf(id).map(s => `${esc(s.name)} <small>(${G.City.TIERS[s.tier || 0].toLowerCase()})</small>`).join(', ') : '';
        const techs = f && f.tech ? Object.keys(f.tech.known).map(TECHN).join(', ') : '';
        const c = p.civ && G.CIVS[p.civ];
        return `<div class="bk-pp${f && f.alive ? '' : ' gone'}"><div class="bk-ph">${f ? G.UI.flag(id) : ''}<b>${esc(p.name)}</b>${c ? `<span class="civ">${G.UI.civIcon(p.civ)}${esc(c.name)}</span>` : ''}<span class="yr">desde o ano ${p.day}</span></div>
          <p>${esc(p.origin)} ${esc(p.symbol)}</p>
          <p class="facts">Deus: <b>${esc(p.god)}</b>${p.founder ? ` · ${p.founderG === 'f' ? 'primeira governante' : 'primeiro governante'}: <b>${esc(p.founder)}</b>` : ''}${p.city ? ` · primeira cidade: <b>${esc(p.city)}</b>` : ''}</p>
          ${p.law ? `<p class="facts">${esc(p.law)}</p>` : ''}
          ${rulers ? `<p class="facts">Governantes: ${rulers}</p>` : ''}
          ${sets ? `<p class="facts">Cidades: ${sets}</p>` : ''}
          ${techs ? `<p class="facts">Saberes: ${esc(techs)}</p>` : ''}
          ${f && f.st ? `<p class="facts">${f.st.battles || 0} batalhas · ${f.st.conquests || 0} conquistas · ${f.st.kills || 0} inimigos mortos${f.st.massacres ? ' · ' + f.st.massacres + ' massacres' : ''}${f.goldenN ? ' · ' + f.goldenN + (f.goldenN > 1 ? ' eras de ouro' : ' era de ouro') : ''}</p>` : ''}
          ${p.end ? `<p class="end">${esc(p.end)}</p>` : ''}</div>`;
      }).join('');
    } else if (L.tab === 'bestiario') {
      body = bestiary();
    } else if (L.tab === 'profecias') {
      const pr = (S.mir && S.mir.prophecies) || [];
      const ST = { aberta: 'aguardando', cumprida: 'cumpriu-se', falhou: 'falhou' };
      body = `<h4>Ditos antigos de ${esc(lo.world)}</h4>${lo.ancient.map(a => `<div class="bk-anc ${a.st}"><span>“${esc(a.text)}”</span><em>${a.st === 'cumprida' ? 'cumpriu-se no ano ' + a.day : 'ainda não se cumpriu'}</em></div>`).join('')}
        <h4>Profecias que você falou</h4>${pr.length ? pr.slice().reverse().map(q => `<div class="bk-anc ${q.st}"><span>Ano ${q.day}, a ${esc(q.setName)}: ${esc(q.text)}</span><em>${ST[q.st] || q.st}${q.st === 'aberta' ? ' — prazo: ano ' + q.until : q.doneDay ? ' no ano ' + q.doneDay : ''}</em></div>`).join('') : '<p class="muted">Nenhuma ainda. Use <b>Profecia</b>, na aba Palavra, para falar do futuro de uma cidade.</p>'}`;
    }
    G.UI.openModal(`<h2 class="bk-title">${I.book}<span>O Livro de ${esc(lo.world)}</span></h2>
      <div class="bk-tabs">${TABS.map(([k, n]) => `<button data-m="lore" data-tab="${k}" class="${k === L.tab ? 'on' : ''}">${n}${k === 'lendas' && lo.legends.length ? ` <em>${lo.legends.length}</em>` : k === 'cronicas' && lo.chapters.length ? ` <em>${lo.chapters.length}</em>` : ''}</button>`).join('')}</div>
      <div class="bk-page">${body}</div>
      <div class="mbtns"><button class="primary" data-m="close">Fechar</button></div>`, 'wide book');
  };

  // ------------------------------ save ------------------------------
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { out.lore = G.S.lore || null; },
    load(o) { G.S.lore = o.lore || null; const lo = lore(); if (!lo.world) L.genesis({}); lo.lastN = Math.max(lo.lastN || 0, 0); },
  });
})(window.G);
