'use strict';
// ============================================================
//  Audio — a cena: o que soaria agora, para um ouvido.
//  A outra metade do audio.js: aquele toca, este decide. Todo
//  som de lugar vem de uma coisa que o mundo tem perto do
//  ouvido — uma pessoa num gesto, um prédio em atividade, uma
//  operação, um navio que anda, um bicho, um fogo —, com a
//  direção, a distância e as paredes no meio; o fundo do bairro
//  é misturado da vida que o bairro de fato teve (a média lenta
//  do G.Urban) e das mãos que trabalham nele agora; a música
//  tira a escala e o timbre do povo daquele chão e das artes que
//  ele sabe. Puro: lê o mundo, não escreve nada, não tira de
//  acaso nenhum — o mesmo mundo e o mesmo ouvido dão a mesma
//  cena (qa/som.js prova em Node, onde nada toca).
// ============================================================
(function (G) {
  const A = G.Audio || (G.Audio = {});
  const r3 = x => Math.round(x * 1000) / 1000;
  const NONE = {};
  const NADA = Object.freeze([]);

  // ------------------------------ the gestures' sounds ------------------------------
  // every gesture of G.Act.ANIM has its line: its sound (a name of the library, audio.js) or a silence said on purpose (por).
  //   q: 'contato' — once, when the gesture reaches its contact; 'curso' — again every `cada` seconds while it lasts
  //   v: how loud at the ear's side (0..1); alc: how far it carries, in ears (A.EAR tiles each)
  //   fam: the life of the quarter it is part of (G.Urban's keys), when the gesture alone says it
  // (qa/som.js fails on a gesture with no line, on a line with neither sound nor reason, and on a sound the library lacks)
  const still = por => ({ s: null, por });
  A.GESTO = {
    levantar: { s: 'heave', q: 'contato', v: 0.5, alc: 0.8 },
    pousar: { s: 'thud', q: 'contato', v: 0.55, alc: 1 },
    empilhar: { s: 'clack', q: 'contato', v: 0.45, alc: 0.8 },
    carregar: still('o peso vai nos braços: quem carrega não faz um gesto que soe'),
    carregarPesado: still('o peso vai nos braços: quem carrega não faz um gesto que soe'),
    carregarDois: still('a caixa vai entre os dois: só soa quando pousa'),
    porNaBanca: { s: 'clack', q: 'contato', v: 0.3, alc: 0.6, fam: 'troca' },
    tirarDaBanca: { s: 'clack', q: 'contato', v: 0.3, alc: 0.6, fam: 'troca' },
    entregar: still('a coisa passa de uma mão à outra sem ruído'),
    receberMoedas: { s: 'coin', q: 'contato', v: 0.45, alc: 0.5, fam: 'troca' },
    pagar: { s: 'coin', q: 'contato', v: 0.45, alc: 0.5 },
    pechinchar: { s: 'voz', q: 'curso', cada: 1.2, v: 0.5, alc: 0.7, fam: 'troca' },
    examinar: still('olha e apalpa a mercadoria calado'),
    contar: still('conta nos dedos, baixo demais para se ouvir'),
    chamarAjuda: { s: 'hey', q: 'contato', v: 0.7, alc: 1.3 },
    apontar: still('um dedo estendido não soa'),
    esperar: still('quem espera está parado'),
    vender: { s: 'pregao', q: 'curso', cada: 6, v: 0.55, alc: 1.1, fam: 'troca' },
    comprar: still('o freguês olha a banca; a fala dele é a do regateio (pechinchar)'),
    comer: still('come de boca fechada'),
    comerMesa: still('come à mesa da taverna, de boca fechada'), // (P7, D-769: the plate on the table, the hand to the mouth)
    sentar: still('quem está sentado não soa'),
    banhar: { s: 'slosh', q: 'curso', cada: 2.6, v: 0.4, alc: 0.6, fam: 'banho' },
    assistir: still('a plateia assiste calada: soa quem está no palco'),
    pescarMaos: { s: 'splash', q: 'contato', v: 0.35, alc: 0.7, fam: 'pesca' },
    pescarArpao: { s: 'splash', q: 'contato', v: 0.45, alc: 0.8, fam: 'pesca' },
    pescarLinha: { s: 'splash', q: 'contato', v: 0.3, alc: 0.7, fam: 'pesca' },
    pescarRede: { s: 'splash', q: 'contato', v: 0.5, alc: 0.9, fam: 'pesca' },
    cavar: { s: 'dig', q: 'curso', cada: 1.2, v: 0.45, alc: 0.9 },
    amassar: { s: 'squelch', q: 'curso', cada: 1, v: 0.3, alc: 0.5, fam: 'oficio' },
    encher: { s: 'pour', q: 'contato', v: 0.4, alc: 0.5 },
    moldar: { s: 'slap', q: 'curso', cada: 1.1, v: 0.3, alc: 0.5, fam: 'oficio' },
    tornear: { s: 'wheel', q: 'curso', cada: 2, v: 0.3, alc: 0.5, fam: 'oficio' },
    enfornar: { s: 'clack', q: 'contato', v: 0.4, alc: 0.7, fam: 'oficio' },
    desenfornar: { s: 'clack', q: 'contato', v: 0.4, alc: 0.7, fam: 'oficio' },
    alimentarFogo: { s: 'fire', q: 'contato', v: 0.55, alc: 0.9 },
    fiar: { s: 'whirr', q: 'curso', cada: 1.6, v: 0.2, alc: 0.4, fam: 'oficio' },
    tecer: { s: 'loom', q: 'curso', cada: 0.9, v: 0.4, alc: 0.7, fam: 'oficio' },
    forjar: { s: 'anvil', q: 'curso', cada: 0.85, v: 0.9, alc: 1.5, fam: 'oficio' },
    lavrar: { s: 'tink', q: 'curso', cada: 0.6, v: 0.35, alc: 0.6, fam: 'oficio' },
    // (P9: the keeper fills the cup from the jar at the shelf — the drink poured —; who drinks takes a draught and sets the cup down
    // on the table, in the material of the cup in the hand — the kit's, G.Inv.held: the clay of a people that had the potter's ware,
    // else turned wood, mat: 1 —; the player of the tavern plays the instrument in the hand — the lyre, the drum —, or sings, D-764)
    servir: { s: 'verter', q: 'contato', v: 0.45, alc: 0.5, fam: 'noite' },
    beber: { s: 'gole', q: 'contato', v: 0.4, alc: 0.4, mat: 1 },
    tocar: { s: 'lute', q: 'curso', cada: 0.5, v: 0.7, alc: 1.2, fam: 'noite' },
    despir: still('o pano não faz barulho'),
    treinar: { s: 'drill', q: 'curso', cada: 1.1, v: 0.6, alc: 1.2, fam: 'armas' },
    escrever: { s: 'scratch', q: 'curso', cada: 1.3, v: 0.2, alc: 0.3 },
    cunhar: { s: 'mint', q: 'contato', v: 0.6, alc: 0.9 },
    cobrar: { s: 'knock', q: 'contato', v: 0.6, alc: 1 },
    atuar: { s: 'voz', q: 'curso', cada: 1.3, v: 0.7, alc: 1.3, fam: 'noite' },
    lutarJogo: { s: 'clang', q: 'curso', cada: 0.9, v: 0.6, alc: 1.2, fam: 'noite' },
    falar: { s: 'voz', q: 'curso', cada: 1.6, v: 0.5, alc: 0.8 },
    ler: still('lê calado'),
    copiar: { s: 'scratch', q: 'curso', cada: 1.3, v: 0.2, alc: 0.3, fam: 'saber' },
    cozinhar: { s: 'cook', q: 'curso', cada: 1.7, v: 0.3, alc: 0.5 },
    ninar: { s: 'hum', q: 'curso', cada: 3.2, v: 0.25, alc: 0.4 },
    rezar: { s: 'chant', q: 'curso', cada: 2.8, v: 0.35, alc: 0.7, fam: 'fe' },
  };
  // the acts the world shows outside the activities' gestures (the fields, the pens, the feast, the fire brigade): the same
  // line — or a function of the person and the errand, where the same act is two things. `mundo`: the world rings it itself
  // at the blow (G.Audio.at, in its own step): a line here would ring it twice
  const blow = por => ({ s: null, por, mundo: 1 });
  const RING = 'o mundo toca o golpe na hora dele (G.Audio.at)';
  A.ATO = {
    chop: blow(RING), mine: blow(RING), build: blow(RING), hammer: blow(RING), shoot: blow(RING), stab: blow(RING), brandish: blow(RING), axe: blow(RING), sword2: blow(RING),
    // (the fight of the body, 20f — G.Combate: the blow rings by the world's hand at its contact, the arrow's loosing too; the guard
    // held and the bow drawn are still)
    golpe: blow(RING), guarda: still('a guarda erguida espera calada'), mirar: still('o arco retesado não soa: a flecha, quando sai'),
    fight: (v, t) => (t.type === 'drill' || t.type === 'muster' ? { s: 'clack', q: 'curso', cada: 0.85, v: 0.5, alc: 1.1, fam: 'armas' } : blow(RING)),
    beat: (v, t) => (t.type === 'fire' ? { s: 'thud', q: 'curso', cada: 0.7, v: 0.45, alc: 0.9 } : { s: 'hit', q: 'curso', cada: 0.9, v: 0.5, alc: 1 }),
    fill: (v, t) => ({ s: 'pour', q: 'curso', cada: 2.2, v: 0.35, alc: 0.6 }),
    throw: (v, t) => (t.type === 'fire' ? { s: 'splash', q: 'curso', cada: 1.2, v: 0.5, alc: 0.9 } : still('o que se atira soa onde cai')),
    feed: still('o feno no cocho não soa'),
    craft: still('mãos ocupadas com coisa miúda'),
    harvest: { s: 'scythe', q: 'curso', cada: 1.2, v: 0.4, alc: 0.9, fam: 'campo' },
    plant: { s: 'hoe', q: 'curso', cada: 1.3, v: 0.35, alc: 0.8, fam: 'campo' },
    rake: { s: 'hoe', q: 'curso', cada: 1.3, v: 0.3, alc: 0.7, fam: 'campo' },
    pick: { s: 'rustle', q: 'curso', cada: 1.6, v: 0.2, alc: 0.5, fam: 'campo' },
    gather: { s: 'rustle', q: 'curso', cada: 1.9, v: 0.2, alc: 0.5 },
    shear: { s: 'snip', q: 'curso', cada: 0.7, v: 0.3, alc: 0.6, fam: 'campo' },
    milk: { s: 'pour', q: 'curso', cada: 1, v: 0.2, alc: 0.4, fam: 'campo' },
    sweep: { s: 'sweep', q: 'curso', cada: 1.1, v: 0.3, alc: 0.6, fam: 'campo' },
    crank: { s: 'creak', q: 'curso', cada: 1.4, v: 0.4, alc: 0.8, fam: 'campo' },
    press: { s: 'creak', q: 'curso', cada: 1.6, v: 0.4, alc: 0.8, fam: 'campo' },
    herd: { s: 'hey', q: 'curso', cada: 5, v: 0.5, alc: 1.2, fam: 'campo' },
    haul: { s: 'heave', q: 'curso', cada: 2.2, v: 0.35, alc: 0.7 },
    pull: { s: 'heave', q: 'curso', cada: 2.2, v: 0.35, alc: 0.7 },
    butcher: { s: 'cleaver', q: 'curso', cada: 1.2, v: 0.45, alc: 0.8 },
    salt: still('o sal na carne não soa'), skin: still('a faca na pele não se ouve'), smoke: still('o defumador é mudo'),
    mend: still('a agulha na rede não se ouve'), reel: still('a linha recolhida não soa'),
    dance: { s: 'clap', q: 'curso', cada: 0.62, v: 0.4, alc: 1.1 },
    act: { s: 'voz', q: 'curso', cada: 1.3, v: 0.65, alc: 1.2 },
    story: { s: 'voz', q: 'curso', cada: 1.5, v: 0.55, alc: 0.9 },
    sittalk: { s: 'voz', q: 'curso', cada: 2.4, v: 0.35, alc: 0.6 },
    chat: { s: 'voz', q: 'curso', cada: 2, v: 0.4, alc: 0.7 }, question: { s: 'voz', q: 'curso', cada: 2, v: 0.45, alc: 0.7 }, beg: { s: 'voz', q: 'curso', cada: 2.2, v: 0.35, alc: 0.6 },
    shout: { s: 'hey', q: 'curso', cada: 2, v: 0.6, alc: 1.3 }, boo: { s: 'hey', q: 'curso', cada: 1.7, v: 0.5, alc: 1.1 }, riot: { s: 'cheer', q: 'curso', cada: 1.9, v: 0.6, alc: 1.3 }, cheer: { s: 'cheer', q: 'curso', cada: 2.4, v: 0.55, alc: 1.2 },
    scream: { s: 'scream', q: 'curso', cada: 2.6, v: 0.5, alc: 1.4 }, rite: { s: 'chant', q: 'curso', cada: 2.8, v: 0.4, alc: 0.8 },
    mourn: { s: 'sob', q: 'curso', cada: 3.4, v: 0.4, alc: 0.7 }, weep: { s: 'sob', q: 'curso', cada: 3, v: 0.4, alc: 0.7 }, weepk: { s: 'sob', q: 'curso', cada: 3, v: 0.4, alc: 0.7 }, sad: still('a tristeza calada'),
    kneel: still('ajoelhado, calado'), swear: still('a jura é dita baixo'), cower: still('quem se encolhe de medo não soa'), sick: still('o doente está quieto'), zzz: still('quem dorme não soa'), lie: still('quem está deitado não soa'),
    hold: still('segura calado'), catch: still('apanha calado'), reach: still('a mão do ladrão não quer ser ouvida'), cut: still('a faca corta calada'), groom: still('a escova no pelo não se ouve'),
    writhe: still('o corpo se torce sem voz'), stagger: still('o cambaleio é dos pés'), struggle: still('debate-se calado'), shove: still('um empurrão não soa'), lantern: still('a lanterna não soa'), walk: still('o andar é dos pés'), follow: still('o andar é dos pés'),
    joy: { s: 'cheer', q: 'curso', cada: 2.6, v: 0.55, alc: 1.2 },
    swim: { s: 'splash', q: 'curso', cada: 1.4, v: 0.3, alc: 0.7 }, dive: { s: 'splash', q: 'contato', v: 0.5, alc: 0.9 },
    sleep: still('quem dorme não soa'), listen: still('quem escuta está calado'), look: still('quem olha está calado'),
    guard: still('a sentinela fica calada'), sneak: still('quem se esgueira não quer ser ouvido'), lurk: still('quem espreita não quer ser ouvido'),
    hide: still('quem se esconde não quer ser ouvido'), run: still('a corrida é dos pés, não de um gesto'), climb: still('sobe calado'),
    bound: still('o preso vai calado'), cross: still('o condenado não soa'), hangd: still('o enforcado não soa'), drag: still('arrasta o corpo calado'),
    wave: still('um aceno não soa'), hug: still('um abraço não soa'), embrace: still('um abraço não soa'), heart: still('o amor não soa'),
    unmask: still('o gesto de um instante'), torchfwd: still('a tocha à frente não soa'),
    // (22b: the acts the society gives — the argument is voices raised; the help and the being helped are still)
    argue: { s: 'voz', q: 'curso', cada: 1.4, v: 0.6, alc: 1.1 }, help: still('a ajuda é dada em silêncio'), helped: still('quem é ajudado recebe calado'),
    // (phase 4: the answers to the body's word — a greeting, a thanks, a refusal are a word; the insult and the threat are raised;
    // a kiss, a nod and the shoulder that comforts are still; what is told is a voice kept low)
    greet: { s: 'voz', q: 'curso', cada: 2.2, v: 0.35, alc: 0.8 }, nod: still('o aceno de cabeça é calado'), kiss: still('o beijo é calado'),
    insult: { s: 'voz', q: 'curso', cada: 1.2, v: 0.7, alc: 1.2 }, threaten: { s: 'voz', q: 'curso', cada: 1.6, v: 0.6, alc: 1.1 },
    refuse: { s: 'voz', q: 'curso', cada: 2.4, v: 0.35, alc: 0.8 }, accept: { s: 'voz', q: 'curso', cada: 2.4, v: 0.4, alc: 0.9 },
    agree: { s: 'voz', q: 'curso', cada: 2.4, v: 0.35, alc: 0.8 }, disagree: { s: 'voz', q: 'curso', cada: 2.4, v: 0.35, alc: 0.8 },
    laugh: { s: 'riso', q: 'curso', cada: 2, v: 0.45, alc: 0.9 }, tell: { s: 'voz', q: 'curso', cada: 2.2, v: 0.3, alc: 0.7 },
    console: still('quem consola fala baixo demais para se ouvir longe'),
    // (P6, D-796: the acts of the tavern's night the sounds of P9 do not have — the stagger is the feet's, the keeper's call to the body a
    // word; the others are the TAVERNA_ATO below)
    cambalear: still('o cambaleio é dos pés'), 'chamar-pedido': { s: 'voz', q: 'curso', cada: 2.2, v: 0.45, alc: 0.9 },
  };
  // the acts of the tavern's night (P7: the toast, the knucklebones, the dance and the claps and the song with the music, the doze at
  // the table, the cloth on the table, the cups gathered, the coin of the tip, the one thrown out, the closing) — the sounds of P9
  // (D-781). A line the fronts of the acts write in A.ATO comes first; these are the ones the table lacks (only where none is):
  //   em: the seconds into the act its blow falls (an act of no gesture has no contact of its own); mat: the material of the cup in
  //   the hand (the kit); piso: the floor under the feet (the plan's); compasso: on the pulse of the music the room has (A.compasso)
  const TAVERNA_ATO = {
    brinde: { s: 'brinde', q: 'contato', em: 0.55, v: 0.6, alc: 0.8, fam: 'noite', mat: 1 },
    'jogo-ossos': { s: 'ossos', q: 'curso', cada: 3.4, v: 0.5, alc: 0.6, fam: 'noite' },
    danca: { s: 'pe', q: 'curso', cada: 0.6, v: 0.5, alc: 0.8, fam: 'noite', piso: 1, compasso: 1 },
    palmas: { s: 'palmas', q: 'curso', cada: 0.6, v: 0.5, alc: 0.9, fam: 'noite', compasso: 1 },
    'cantar-junto': { s: 'canto', q: 'curso', cada: 0.6, v: 0.45, alc: 0.9, fam: 'noite', compasso: 1 },
    cochilo: { s: 'ronco', q: 'curso', cada: 3.4, v: 0.25, alc: 0.35 },
    'limpar-mesa': { s: 'pano', q: 'curso', cada: 1.2, v: 0.35, alc: 0.5, fam: 'noite' },
    'recolher-canecas': { s: 'canecas', q: 'contato', em: 0.5, v: 0.45, alc: 0.6, fam: 'noite', mat: 1 },
    gorjeta: { s: 'gorjeta', q: 'contato', em: 0.4, v: 0.5, alc: 0.5, fam: 'noite' },
    expulsar: { s: 'expulsa', q: 'curso', cada: 1.8, v: 0.65, alc: 1.1 },
    fechar: { s: 'fechar', q: 'contato', em: 0.5, v: 0.55, alc: 0.8 },
  };
  A.TAVERNA_ATO = TAVERNA_ATO;
  for (const k in TAVERNA_ATO) if (!A.ATO[k]) A.ATO[k] = TAVERNA_ATO[k];
  // a beast's voice (the moment of it is the ear's own chance: `cada` seconds between two, about); `dia` / `noite`: only then
  A.BICHO = {
    cao: { s: 'bark', cada: 9, v: 0.6, alc: 1.3 }, galinha: { s: 'cluck', cada: 7, v: 0.4, alc: 0.7, dia: 1 }, pombo: { s: 'coo', cada: 9, v: 0.25, alc: 0.5, dia: 1 },
    ovelha: { s: 'baa', cada: 11, v: 0.5, alc: 1.1, dia: 1 }, cabra: { s: 'baa', cada: 12, v: 0.45, alc: 1, dia: 1, tom: 1.3 }, vaca: { s: 'moo', cada: 15, v: 0.55, alc: 1.3, dia: 1 },
    porco: { s: 'oink', cada: 10, v: 0.4, alc: 0.8, dia: 1 }, cavalo: { s: 'neigh', cada: 18, v: 0.55, alc: 1.3, dia: 1 }, peru: { s: 'gobble', cada: 12, v: 0.4, alc: 0.8, dia: 1 },
    gato: { s: 'meow', cada: 22, v: 0.3, alc: 0.6 }, gull: { s: 'gull', cada: 9, v: 0.5, alc: 1.4, dia: 1 }, raven: { s: 'caw', cada: 11, v: 0.5, alc: 1.3, dia: 1 },
    frog: { s: 'frog', cada: 4, v: 0.4, alc: 0.8, noite: 1 }, owl: { s: 'owl', cada: 13, v: 0.5, alc: 1.2, noite: 1 }, monkey: { s: 'monkey', cada: 11, v: 0.45, alc: 1.1, dia: 1 },
    parrot: { s: 'trill', cada: 8, v: 0.4, alc: 1, dia: 1 }, toucan: { s: 'cuckoo', cada: 10, v: 0.4, alc: 1, dia: 1 },
  };

  // ------------------------------ which gesture a person is making ------------------------------
  // the world shows an act (v.act); the gesture is the one of G.Act.ANIM with that act — and where several share one, the
  // errand, the batch's stage and the load in the arms say which. Null: no gesture of the activities (A.ATO may have it)
  let byAct = null, byActN = -1;
  function index() {
    const AN = (G.Act && G.Act.ANIM) || NONE; const n = Object.keys(AN).length; if (byAct && byActN === n) return byAct;
    byAct = {}; byActN = n; for (const k in AN) { const a = AN[k].act; if (a) (byAct[a] = byAct[a] || []).push(k); }
    return byAct;
  }
  const loaded = v => !!(v.carry && v.carry.n > 1e-6);
  const opOf = t => (t.op && G.Act && G.Act.get ? G.Act.get(t.op) : null);
  // (the hand stage of a trade's batch says its own gesture: kneading, spinning, hammering)
  function stageAnim(t, act) {
    if (t.type !== 'oficio' || t.do !== 'mao' || !G.Oficio || !G.Oficio.stage) return null;
    const s = G.Oficio.stage(opOf(t)); const g = s && s.anim && G.Act.ANIM[s.anim];
    return g && g.act === act ? s.anim : null;
  }
  const FISH = { maos: 'pescarMaos', arpao: 'pescarArpao', linha: 'pescarLinha', rede: 'pescarRede' };
  const PICK = {
    lift: (v, t) => stageAnim(t, 'lift') || (loaded(v) ? 'pousar' : 'levantar'),
    craft: (v, t) => stageAnim(t, 'craft') || (t.type === 'mint' ? 'cunhar' : null),
    fill: (v, t) => stageAnim(t, 'fill'),
    sit: (v, t) => (t.type === 'termas' ? 'banhar' : t.type === 'teatro' ? 'assistir' : 'sentar'),
    talk: (v, t) => (t.type === 'atuar' ? 'atuar' : 'falar'),
    write: (v, t) => (t.type === 'copiar' ? 'copiar' : 'escrever'),
    pay: (v, t) => (t.type === 'banca' || t.type === 'sell' ? 'receberMoedas' : 'pagar'),
    arrange: (v, t) => (loaded(v) ? 'porNaBanca' : 'tirarDaBanca'),
    fish: (v, t) => FISH[t.how] || 'pescarMaos',
    fight: (v, t) => (t.type === 'atuar' ? 'lutarJogo' : null),
    feed: (v, t) => (t.type === 'fodder' ? null : 'alimentarFogo'),
  };
  A.gestoDe = function (v) {
    const act = v && v.act; if (!act) return null;
    const L = index()[act]; if (!L) return null;
    const pick = PICK[act]; if (pick) { const g = pick(v, v.task || NONE); return g && G.Act.ANIM[g] ? g : null; }
    return L[0];
  };
  // the line of what a person is doing now: { g (the gesture, or null), ato, tipo ('gesto' | 'ato'), linha } — or null
  A.linhaDe = function (v) {
    const act = v && v.act; if (!act) return null;
    const g = A.gestoDe(v); if (g) return { g, ato: act, tipo: 'gesto', linha: A.GESTO[g] || null };
    let L = A.ATO[act]; if (typeof L === 'function') L = L(v, v.task || NONE);
    return { g: null, ato: act, tipo: 'ato', linha: L || null };
  };
  // (for the proofs: the gestures of G.Act.ANIM with no line, the lines of no gesture)
  A.semLinha = () => Object.keys((G.Act && G.Act.ANIM) || NONE).filter(k => !A.GESTO[k]);
  A.linhaSemGesto = () => Object.keys(A.GESTO).filter(k => !(G.Act && G.Act.ANIM && G.Act.ANIM[k]));

  // ------------------------------ the life a pair of hands belongs to ------------------------------
  // (G.Urban's keys: what the world counts where the same work closes — the operation's, the errand's, the gesture's)
  A.FAMS = ['cais', 'pesca', 'troca', 'oficio', 'mina', 'campo', 'armas', 'fe', 'saber', 'noite', 'banho'];
  const FAM_DEF = { descarga: 'cais', negocio: 'troca', pesca: 'pesca', oficio: 'oficio', taverna: 'noite', termas: 'banho', lenhaTermas: 'banho', espetaculo: 'noite', leitura: 'saber' };
  const FAM_TASK = { farm: 'campo', horta: 'campo', estate: 'campo', herd: 'campo', tend: 'campo', penwork: 'campo', fodder: 'campo', slaughter: 'campo', mine: 'mina', minejob: 'mina', quarry: 'mina',
    drill: 'armas', muster: 'armas', pray: 'fe', banca: 'troca', sell: 'troca', shop: 'troca', compra: 'troca', atacado: 'troca', fish: 'pesca', redes: 'pesca', barco: 'pesca',
    tavern: 'noite', atender: 'noite', teatro: 'noite', atuar: 'noite', termas: 'banho', fornalha: 'banho', copiar: 'saber', ler: 'saber', descarga: 'cais', cais: 'cais', conferir: 'cais', oficio: 'oficio' };
  A.famDe = function (v, r) {
    const t = v.task || NONE;
    if (r && r.g === 'cavar') return t.type === 'oficio' ? 'mina' : t.type === 'horta' ? 'campo' : null;
    const op = opOf(t); if (op && FAM_DEF[op.def]) return FAM_DEF[op.def];
    if (r && r.linha && r.linha.fam) return r.linha.fam;
    return FAM_TASK[t.type] || null;
  };

  // ------------------------------ the ear ------------------------------
  A.EAR = 12;    // how far a body hears a plain sound, in tiles
  A.WALL = 0.35; // what a wall leaves of a sound
  A.MIN = 0.02;  // below this nothing is heard
  A.VOZES = 24;  // the ear tells this many sources apart: the loudest
  A.BICHOS = 6;  // (and of them, this many beasts)
  // a building one is shut in: built, roofed — not a ruin, not an open ground (a square, a theatre's rows)
  const closed = b => {
    if (!b || !b.built || b.type === 'ruin') return false;
    const In = G.Interiors; const s = In && In.shellOf ? In.shellOf(b) : null;
    if (s && s.shell) return s.shell.kind !== 'aberta';
    return !!(G.BDEF && G.BDEF[b.type] && G.BDEF[b.type].housing);
  };
  const shut = id => { const b = id ? G.S.buildings.get(id) : null; return closed(b) ? b.id : 0; };
  A.fechado = shut;
  // an ear: where it is, where its right side points (a unit vector on the ground — from the body's eye, yaw, or given by
  // the god's screen), how far it hears (r, tiles), how much of it (k: the god from high above hears little), the building
  // it is shut in (dentro), under the ground or not
  A.earOf = function (o) {
    o = o || NONE; let rx = null, ry = null;
    if (Number.isFinite(o.rx) && Number.isFinite(o.ry)) { const n = Math.hypot(o.rx, o.ry) || 1; rx = o.rx / n; ry = o.ry / n; }
    else if (Number.isFinite(o.yaw)) { rx = -Math.sin(o.yaw); ry = Math.cos(o.yaw); }
    return { x: +o.x || 0, y: +o.y || 0, rx, ry, r: o.r > 0 ? o.r : A.EAR, k: o.k === undefined ? 1 : G.clamp(o.k, 0, 1), dentro: G.S ? shut(o.inside) : 0, ug: o.ug ? 1 : 0, modo: o.modo || 'corpo' };
  };
  // how a point sounds to an ear: the distance, what is left of it (the distance, the walls between), the side, the muffle
  A.hear = function (ear, x, y, dentro, alc) {
    const dx = x - ear.x, dy = y - ear.y, d = Math.hypot(dx, dy); const reach = ear.r * (alc || 1);
    let g = d >= reach ? 0 : 1 - d / reach; g = g * g * ear.k;
    dentro = dentro || 0; const walls = dentro === ear.dentro ? 0 : (dentro ? 1 : 0) + (ear.dentro ? 1 : 0);
    if (walls) g *= Math.pow(A.WALL, walls);
    const lat = ear.rx === null ? 0 : dx * ear.rx + dy * ear.ry;
    return { d: r3(d), gain: r3(g), pan: r3(d < 1e-6 ? 0 : G.clamp(lat / Math.max(d, 1.5), -1, 1)), muf: walls ? 1 : 0 };
  };

  // ------------------------------ the music of a people and of its age ------------------------------
  // the scale and the timbre are the people's of that ground and of the arts it knows — never a tune by quarter. A people of
  // stone sings on three notes with breath and drum; of bronze, on five with its own instrument; of iron, on its whole mode
  A.MODOS = {
    classico: { nome: 'pentatônica maior', tonica: 261.63, graus: [0, 2, 4, 7, 9], cinco: [0, 1, 2, 3, 4], tres: [0, 2, 3], timbre: { onda: 'triangle', onda2: 'sine', brilho: 2800, ataque: 0.01, cauda: 2.2 } },
    grego: { nome: 'dórico antigo', tonica: 293.66, graus: [0, 1, 3, 5, 7, 8, 10], cinco: [0, 1, 3, 4, 5], tres: [0, 1, 4], timbre: { onda: 'triangle', onda2: 'triangle', brilho: 3600, ataque: 0.004, cauda: 1.6 } },
    nordico: { nome: 'menor com bordão', tonica: 196, graus: [0, 2, 3, 5, 7, 8, 10], cinco: [0, 2, 3, 4, 6], tres: [0, 2, 4], timbre: { onda: 'sawtooth', onda2: 'sine', brilho: 1500, ataque: 0.09, cauda: 2.8 } },
    egipcio: { nome: 'hijaz', tonica: 246.94, graus: [0, 1, 4, 5, 7, 8, 10], cinco: [0, 1, 2, 4, 5], tres: [0, 1, 2], timbre: { onda: 'sine', onda2: 'triangle', brilho: 4200, ataque: 0.006, cauda: 2.6 } },
    asteca: { nome: 'pentatônica sem semitons', tonica: 329.63, graus: [0, 2, 5, 7, 9], cinco: [0, 1, 2, 3, 4], tres: [0, 1, 3], timbre: { onda: 'sine', onda2: 'sine', brilho: 2200, ataque: 0.05, cauda: 1.2, sopro: 0.5 } },
    romano: { nome: 'lídio', tonica: 349.23, graus: [0, 2, 4, 6, 7, 9, 11], cinco: [0, 1, 2, 4, 5], tres: [0, 3, 4], timbre: { onda: 'square', onda2: 'triangle', brilho: 2000, ataque: 0.03, cauda: 1.8 } },
  };
  // the age of a people by its arts: 0 before bronze, 1 with bronze, 2 with iron
  A.eraDe = known => (known && known.ferro ? 2 : known && known.bronze ? 1 : 0);
  A.ERAS = ['da pedra', 'do bronze', 'do ferro'];
  A.musicOf = function (civ, known) {
    const id = A.MODOS[civ] ? civ : 'classico'; const M = A.MODOS[id]; const era = A.eraDe(known);
    const use = era === 2 ? M.graus.map((x, k) => k) : era === 1 ? M.cinco : M.tres;
    const graus = use.map(k => M.graus[k]);
    // (the ladder: three octaves of the degrees in use, from the tonic)
    const notas = []; for (let o = 0; o < 3; o++) for (const g of graus) notas.push(r3(M.tonica * Math.pow(2, o + g / 12))); notas.push(r3(M.tonica * 8));
    const T = M.timbre;
    const timbre = era === 0 ? { onda: 'sine', onda2: 'sine', brilho: Math.min(T.brilho, 1800), ataque: Math.max(T.ataque, 0.05), cauda: Math.min(T.cauda, 1.4), sopro: Math.max(T.sopro || 0, 0.6), dobra: 0 }
      : { onda: T.onda, onda2: T.onda2, brilho: T.brilho, ataque: T.ataque, cauda: T.cauda, sopro: T.sopro || 0, dobra: era === 2 ? 1 : 0 };
    return { civ: id, era, epoca: A.ERAS[era], nome: M.nome, tonica: M.tonica, graus, notas, timbre, tambor: era === 0 ? 1 : id === 'asteca' || id === 'nordico' ? 0.5 : 0 };
  };
  // the people of a ground: the town's whose quarter it is; in the wild, nobody's (the plain scale)
  A.musicAt = function (x, y) {
    const S = G.S; const q = G.Urban && G.Urban.at ? G.Urban.at(x, y) : null; const set = q ? S.settlements.get(q.set) : null;
    const f = set && G.Fac ? G.Fac.get(G.Village.facOfSet(set.id)) : null;
    return A.musicOf(f ? f.civ : null, f && f.tech ? f.tech.known : null);
  };

  // (the music of a person's own people: the lute in a tavern plays its player's scale)
  const povo = v => { const f = v && G.Fac && G.Fac.ofV ? G.Fac.ofV(v) : null; return A.musicOf(f ? f.civ : null, f && f.tech ? f.tech.known : null); };

  // ------------------------------ the quarter's bed ------------------------------
  // what a quarter sounds like from within, beyond the sources one can tell apart: for each life of it, its habit (the slow
  // mean of what really happened there, against the mark that makes a profile of it — G.Urban) times the hands at that
  // work in it now. No cargo on the quay, no hands: the port is silent, whatever it is called. The rain covers what is far
  const TAG_OF = { cais: 'porto', pesca: 'pesqueiro', troca: 'mercado', oficio: 'oficinas', mina: 'minas', campo: 'campo', armas: 'quartel', fe: 'sagrado', saber: 'letrado', noite: 'boemio', banho: 'termal' };
  A.HANDS = 2; // (this many pairs of hands at a work make the whole of its presence)
  A.habito = function (q) {
    const U = G.Urban; const h = {}; const v = (q && q.vida) || NONE;
    for (const f of A.FAMS) h[f] = r3(Math.min(1, (v[f] || 0) / U.mark(q, TAG_OF[f], false)));
    return h;
  };
  // the mix moves slowly towards what the scene asks (dt seconds on, a time constant of A.TAU): no cut between two quarters
  A.TAU = 4;
  A.blend = function (cur, alvo, dt, tau) {
    const k = 1 - Math.exp(-Math.max(0, dt) / (tau || A.TAU)); const out = {};
    for (const f of A.FAMS) { const c = (cur && cur[f]) || 0, a = (alvo && alvo[f]) || 0; out[f] = c + (a - c) * k; }
    return out;
  };

  // ------------------------------ the little things that sound (22c fase 6, D-610) ------------------------------
  // The micro-action of the idle the 3D draws for someone now — the same pure count (G.Anim3D.ocioAt: the id and the world's clock,
  // with the reader's context — the view's own where it draws them, else read from the world) — and its sound at its moment: the
  // cough, the sneeze, the yawn, the sigh, the drunk's hiccup; and the teeth chattering in the cold, a while apart. Only reads
  const OCIO_R2 = 3.5 * 3.5; // (tiles: near the ear only — a cough is heard a few steps off)
  const OC_SOM = { 'oc-tossir': ['cough', 0.3, 0.5], 'oc-espirrar': ['sneeze', 0.42, 0.55], 'oc-bocejar': ['yawn', 0.3, 0.4], 'oc-suspirar': ['sigh', 0.35, 0.35], 'oc-solucar': ['hiccup', 0.3, 0.45] };
  const OC_P = {}, OC_C = {}, OC_R = { s: '', q: '', cada: 0, f: 0, c: 0, v: 0, n: 0, k: '' };
  A.OC_SOM = OC_SOM;
  A.ocioSom = function (v) {
    const A3 = G.Anim3D, V3 = G.Vida3D; if (!A3 || !A3.ocioAt || !A3.stateOf || !V3 || v.moving || v.act || v.sleeping || v.inside || !G.S) return null;
    const st = A3.stateOf(v, 0, null); if (st !== 'idle' && st !== 'sit' && st !== 'rest') return null;
    const p = V3.porteOf(v, OC_P); const vs = G.People3D && G.People3D.visOf ? G.People3D.visOf(v.id) : null; const ctx = vs && vs.ctx ? vs.ctx : V3.ctxOf(v, p, null, OC_C);
    const o = A3.ocioAt(v.id, G.S.clock, ctx, 0); const R = OC_R;
    if (o) { const k = o.k.replace(/~m$/, ''), m = OC_SOM[k], C = A3.CLIPS && A3.CLIPS[o.k];
      if (m && C) { R.s = m[0]; R.q = 'contato'; R.cada = 0; R.f = o.u * C.dur; R.c = m[1] * C.dur; R.v = m[2]; R.n = o.n; R.k = k; return R; } }
    if (p.frio > 0.6) { R.s = 'teeth'; R.q = 'curso'; R.cada = 2.6; R.f = 0; R.c = 0; R.v = 0.3 * p.frio; R.n = 't'; R.k = 'frio'; return R; }
    return null;
  };

  // ------------------------------ the room: a building heard from within (P9, D-780 to D-787) ------------------------------
  // What a room sounds like is what it is made of and how big it is — the plan's (G.Interiors): the floor the feet walk on, the walls,
  // the roof the rain beats on, the air between them (the echo), the people in it (they drink the echo too). Pure, as all of this file
  const TILE = 4; // (the lot's metres to a tile of the map: the plans' own, Space.TILE)
  const shellOf = b => (b && G.Interiors && G.Interiors.shellOf ? G.Interiors.shellOf(b) : null);
  const estilo = b => b.style || ((G.Fac && G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || NONE).civ || 'classico';
  // the floor under the feet: the one the 3D lays (build3d.js FLOOR and floorMat — the same table; the guard ties the two, rule 332):
  // each people its own floor by the building's standing, boards over a room and in a loft, earth in a cellar, flags on a terrace
  A.CHAO = {
    romano: { noble: 'mosaico', mid: 'lajota', low: 'terra' }, grego: { noble: 'mosaico', mid: 'lajes', low: 'terra' },
    egipcio: { noble: 'lajes', mid: 'terra', low: 'terra' }, asteca: { noble: 'lajes', mid: 'terra', low: 'terra' },
    classico: { noble: 'lajes', mid: 'lajota', low: 'terra' }, nordico: { noble: 'tabuado', mid: 'terra', low: 'terra' },
  };
  const NOBRE = { palacio: 1, paco: 1, grande_palacio: 1, palacio_colossal: 1, temple: 1, biblioteca: 1, banhos: 1, administracao: 1, coletoria: 1 };
  A.chaoDe = function (b, lv) {
    const P = shellOf(b); const l = P ? P.levels.find(x => x.lv === (lv || 0)) || P.levels[0] : null;
    if (l && l.kind === 'terraco') return 'lajes';
    if (l && (l.lv > 0 || l.kind === 'jirau' || l.kind === 'elevado')) return 'tabuado';
    if (l && l.kind === 'porao') return 'terra';
    const F = A.CHAO[estilo(b)] || A.CHAO.classico; return NOBRE[b.type] || (b.type === 'house' && b.w > 1) ? F.noble : b.type === 'taverna' ? F.mid : F.low;
  };
  A.PASSO = { terra: 'terra', tabuado: 'tabua', lajota: 'lajota', lajes: 'laje', mosaico: 'laje' }; // (what each floor sounds like under a foot)
  // the roof over the room, as the 3D lays it (build3d.js: the plan's straw and turf, the flat terrace; a pitched roof of the people's
  // tiles — the Roman's, the Greek's, the classical's, the Egyptian's of fired mud —, the north's shingles of boards, the Aztec's straw):
  // what the rain beats on (rule 332 ties the people's to the 3D's)
  A.TELHA = { classico: 'telha', grego: 'telha', romano: 'telha', egipcio: 'telha', asteca: 'palha', nordico: 'tabua' };
  A.telhadoDe = function (b) {
    const P = shellOf(b); const R = P && P.shell ? P.shell.roof : null; if (!R) return null;
    const k = R.kind; if (k === 'palha' || k === 'palha-conica') return 'palha'; if (k === 'turfa') return 'turfa'; if (k === 'plano') return 'terraco';
    return A.TELHA[estilo(b)] || 'telha';
  };
  // the walls: the boards of the north, the earth (adobe, rammed earth, wattle and daub), the stone and the plaster on it
  const PAREDE = { tabua: 'madeira', madeira: 'madeira', enxaimel: 'madeira', adobe: 'barro', 'adobe-caiado': 'barro', 'adobe-estuque': 'barro', taipa: 'barro', 'pau-a-pique': 'barro' };
  A.paredeDe = b => { const P = shellOf(b); return P && P.shell ? PAREDE[P.shell.mat] || 'pedra' : 'pedra'; };
  // how much of a sound each face drinks (Sabine's coefficients, about the middle of a voice): a soft room is short and dark, a hard
  // one long and bright. The people drink it too (a full tavern echoes less than an empty one), and the tables, the benches, the jars
  A.ABS = { chao: { terra: 0.2, tabuado: 0.1, lajota: 0.03, lajes: 0.02, mosaico: 0.02 }, parede: { madeira: 0.1, barro: 0.06, pedra: 0.03 },
    teto: { palha: 0.45, turfa: 0.15, telha: 0.1, tabua: 0.12, terraco: 0.12 }, gente: 0.45, moveis: 0.15 };
  // the echo of a room: its floor, its height (to the roof's middle where the hall is open to it, a tavern's; a storey's where one
  // is over it), its volume, the time a sound takes to die (rt, s), the first reflection (pre, s), how much of the high end it keeps
  // (tom, Hz) and the share of the echo in what one hears (mix). Null for no room: an open ground, a building with no plan
  A.ecoDe = function (b) {
    const P = shellOf(b); if (!P || !P.shell || P.shell.kind === 'aberta' || !P.levels.length) return null;
    const sh = P.shell; const L0 = P.levels.find(l => l.lv === (P.entryLv || 0)) || P.levels[0];
    const round = sh.kind === 'round'; const m2 = round ? Math.PI * sh.r * sh.r : sh.sx * sh.sz; const per = round ? 2 * Math.PI * sh.r : 2 * (sh.sx + sh.sz);
    if (!(m2 > 0.5)) return null;
    const R = sh.roof; const rise = R && R.kind !== 'plano' ? (R.h || 0) : 0;
    const over = P.levels.some(l => l.lv > L0.lv && l.kind !== 'galeria' && l.kind !== 'jirau' && l.kind !== 'terraco');
    const h = Math.max(2.2, over ? L0.h : (sh.eave || L0.y + L0.h) - (L0.y || 0) + rise * 0.5);
    const piso = A.chaoDe(b, L0.lv), parede = A.paredeDe(b), telhado = over ? 'tabua' : A.telhadoDe(b) || 'tabua';
    const gente = G.Atmos && G.Atmos.inside ? G.Atmos.inside(b) : 0;
    const V = m2 * h, Sf = 2 * m2 + per * h;
    const Aa = A.ABS.chao[piso] * m2 + A.ABS.teto[telhado] * m2 + A.ABS.parede[parede] * per * h + A.ABS.moveis * m2 + A.ABS.gente * gente;
    const rt = G.clamp(0.161 * V / Math.max(1, Aa), 0.3, 1.6), pre = G.clamp(4 * V / Sf / 343, 0.004, 0.05);
    const tom = Math.round(G.clamp(9000 - 30000 * Aa / Sf, 2500, 8000) / 250) * 250, mix = r3(G.clamp(0.12 + 0.17 * rt, 0.15, 0.45));
    const o = { b: b.id, m2: r3(m2), h: r3(h), vol: r3(V), piso, parede, telhado, gente, rt: r3(rt), pre: r3(pre), tom, mix };
    o.sig = `${Math.round(rt * 20)}:${Math.round(pre * 500)}:${tom}:${Math.round(Math.min(sh.sx || sh.r * 2, 40) * 2)}`; // (the echo's own figure: what the player makes it from)
    return o;
  };
  // where someone the world has inside a building is: the place the plan gives them (In.placeOf) — on the way in from the door, along
  // the walk the plan times (In.pathIn: the drawing walks it at the same pace); on the way out, at the door —, in the tiles of the
  // map; outside, or with no plan made yet, where the world has them (the door they went in by, for one inside). → [x, y, lv]
  A.ondeDe = function (v) {
    const In = G.Interiors; const b = v && v.inside > 0 && In && In.ready ? G.S.buildings.get(v.inside) : null;
    if (!b || !b.ip || !In.ready(b) || !In.tableReady(b)) return [v.x, v.y, 0];
    const pl = In.placeOf(v); if (!pl) return [v.x, v.y, 0];
    let x = pl.x, z = pl.z, lv = pl.lv || 0; const ps = In.passage(v);
    if (ps && !ps.out) { const w = In.pathIn(b, pl); if (w && w.pts.length > 1 && w.len > 0) {
      let at = Math.max(0, w.len - Math.max(0, ps.until - G.S.clock) * G.Vg.walkMS(v));
      for (let i = 1; i < w.pts.length; i++) { const p0 = w.pts[i - 1], p1 = w.pts[i]; const d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); if (at <= d || i === w.pts.length - 1) { const u = d > 1e-6 ? G.clamp(at / d, 0, 1) : 1; x = p0[0] + (p1[0] - p0[0]) * u; z = p0[1] + (p1[1] - p0[1]) * u; lv = u < 0.5 ? p0[2] : p1[2]; break; } at -= d; } } }
    return [b.x + x / TILE, b.y + z / TILE, lv];
  };
  // (and for an ear: inside, the plan's place only near the ear, where one is heard — far off, the door is as good, and asks no plan of
  // the repartidor: the scene is asked four times a second)
  A.lugarDe = (v, ear) => (v.inside > 0 && (v.x - ear.x) * (v.x - ear.x) + (v.y - ear.y) * (v.y - ear.y) < ear.r * ear.r * 6.25 ? A.ondeDe(v) : [v.x, v.y, 0]);
  // a source in the room the ear is in: the same distance and side, but at a room's scale — the voice a metre off is louder than the
  // one across the hall, and a step to the side is a side (pan) — and no wall between: what a room sounds like near (sala, its id)
  A.NEAR = 1.6; // (metres: nearer than this, the whole of a sound)
  A.perto = function (ear, x, y, alc) {
    const h = A.hear(ear, x, y, ear.dentro, alc); const k = G.clamp(A.NEAR / Math.max(A.NEAR, h.d * TILE), 0.3, 1);
    const lat = ear.rx === null ? 0 : (x - ear.x) * ear.rx + (y - ear.y) * ear.ry;
    return { d: h.d, gain: r3(h.gain * k), pan: r3(h.d < 1e-6 ? 0 : G.clamp(lat / Math.max(h.d, 0.35), -1, 1)), muf: 0, sala: ear.dentro };
  };
  // the talk of a room: who is awake in it and talking now — at a table with company (the pose of the talk), or in an act of the
  // tongue —, how drunk they are (G.Atmos.drunk) and the people whose tongue it is (the timbre; no words). Nobody talking: silence
  A.FALA = new Set(['sittalk', 'talk', 'chat', 'argue', 'laugh', 'tell', 'question', 'greet', 'insult', 'threaten', 'refuse', 'accept', 'agree', 'disagree', 'story', 'brinde', 'jogo-ossos', 'cantar-junto']);
  A.falando = v => !v.sleeping && (A.FALA.has(v.act) || !!(v.task && v.task.pose === 'sittalk'));
  // (the tongue is of who talks — the people most of them are of —, never the building's style: an Egyptian-built tavern in a town of
  // the north talks in the north's voice)
  A.vozesDe = function (b, quem) {
    let fala = 0, beb = 0; const At = G.Atmos; const civ = {}; let povo = null, pn = 0;
    for (const v of quem || NADA) if (v.inside === b.id && A.falando(v)) { fala++; beb += At && At.drunk ? At.drunk(v) : 0; const c = (G.Fac && G.Fac.ofV ? (G.Fac.ofV(v) || NONE).civ : null) || 'classico'; civ[c] = (civ[c] || 0) + 1; if (civ[c] > pn || (civ[c] === pn && c < povo)) { pn = civ[c]; povo = c; } }
    const bebado = fala ? r3(beb / fala) : 0;
    return { fala, bebado, forca: r3(fala * (1 + 0.6 * bebado)), povo: povo || estilo(b) };
  };
  A.ROOM_R = 6; // (tiles: as far as a room's own sounds carry out of it — the tavern is heard near, from the street and from the god's eye)
  // the pulse of a people's music (the meter and the pace of its dances: the Greek's seven of the kalamatianós, the north's three, the
  // Egyptian's maqsum, the Aztec's drum) — the pulse the player plays the tune on and the room claps, dances and sings to. The pulse is
  // the world's: it counts from the set's start (the musician's own clock, t.mw) in the world's seconds of a pulse (periodo: the pace
  // of the body, Space.TIME — what the 3D's clap can follow too). Pure
  A.RITMO = { classico: { bpm: 100, ciclo: [1, 0, 0.5, 0] }, grego: { bpm: 132, ciclo: [1, 0, 0, 0.6, 0, 0.6, 0] }, nordico: { bpm: 88, ciclo: [1, 0, 0] },
    egipcio: { bpm: 100, ciclo: [1, 0.5, 0, 0.5, 1, 0, 0.5, 0] }, asteca: { bpm: 116, ciclo: [1, 0, 0.6, 0, 1, 0, 0.6, 0.6] }, romano: { bpm: 108, ciclo: [1, 0, 0.5, 0] } };
  A.compasso = function (v) {
    const m = povo(v); const R = A.RITMO[m.civ] || A.RITMO.classico; const T = (G.Space && G.Space.TIME) || 0.27; const t = v && v.task;
    return { de: v ? v.id : 0, civ: m.civ, era: m.era, bpm: R.bpm, ciclo: R.ciclo, periodo: r3(60 / R.bpm * T), t0: t && Number.isFinite(t.mw) ? t.mw : 0, notas: m.notas, timbre: m.timbre };
  };
  // the instrument in the hands of who plays (the kit's, G.Inv.held — the lyre, the drum, of what the people had: D-764), or none: one sings
  A.instrumentoDe = function (v) {
    const I = G.Inv, It = G.Itens; const k = I && I.held ? I.held(v).mao : null; const d = k && It && It.def ? It.def(k) : null;
    return d && (d.kind === 'lira' || d.kind === 'tambor') ? d.kind : null;
  };
  // the material of the cup in the hand (the kit's: the clay of a people that had the potter's ware, else turned wood; a metal one)
  const matDe = v => { const I = G.Inv, It = G.Itens; const k = I && I.held ? I.held(v).mao : null; const d = k && It && It.def ? It.def(k) : null; const m = d && d.mat ? d.mat : k ? String(k).split('.')[1] : null; return m === 'barro' || m === 'madeira' ? m : m ? 'metal' : 'madeira'; };
  // the rain on a building's roof: the sky's, or a cloud's over it (as the ear has it: audio.js)
  const chuvaEm = (x, y) => { const S = G.S; const N = G.Nature; return r3(Math.max((S.weather && S.weather.rain) || 0, N && N.rainAt ? N.rainAt(x, y) * 0.8 : 0)); };
  // (how loud each fire of a plan crackles: the long fire of the north's hall, the hearth, a stove's covered fire)
  A.FOGO = { 'fogo-comprido': 1.2, lar: 1, lareira: 0.9, 'fogo-chao': 0.9, braseiro: 0.6, fogao: 0.7, 'fogao-comal': 0.6, forno: 0.5, 'forno-barro': 0.55, fogareiro: 0.45 };
  // a door shut: who passes makes it swing — but the door that stands open by its own rule (the tavern in its hours, the workshop by
  // day with its worker in) swings for nobody: the feet only cross its threshold
  const ficaAberta = (b, quem) => {
    const In = G.Interiors; const T = In && In.TYPES ? In.TYPES[b.ip.t] : null; if (!T) return false;
    if (T.use === 'taverna') return !!(G.Taverna && G.Taverna.aberta && G.Taverna.aberta(b));
    return !!(T.open && !(G.isNight && G.isNight()) && (quem || NADA).some(v => v.job === b.id && v.inside === b.id));
  };

  // ------------------------------ the scene ------------------------------
  // what would sound now for this ear: the sources (each with what it is of — a person, a building and its operation, a
  // ship, a beast —, its sound, how loud, which side, how muffled), the quarter's bed, the people about, the music's people
  A.scene = function (ear) {
    const S = G.S; if (!S || !ear) return null;
    const U = G.Urban; const q = U && U.at ? U.at(ear.x, ear.y) : null; const night = G.isNight ? G.isNight() : false;
    const all = []; const count = {}; const far = {}; let gente = 0;
    // (whose quarter a pair of hands is: where it stands; on a patch of ground no town has, its work's — the building of its
    // operation, where the work is noted (G.Urban.noteB). Lêda heaving a crate of the quay of Corinto, in the metropole of the
    // generation 26, stood beside the quay a hand off the town's last patch, and the port's bed counted no hands while she
    // worked: L-817)
    const handsQ = v => { const at = U.at(v.x, v.y); if (at) return at; const op = opOf(v.task || NONE); const b = op && op.at ? S.buildings.get(op.at) : null; return b ? U.at(b.x + (b.w || 1) / 2, b.y + (b.h || 1) / 2) : null; };
    const push = (o, h, L) => { o.d = h.d; o.gain = r3(h.gain * L.v); o.pan = h.pan; o.muf = h.muf; if (h.sala) o.sala = h.sala; if (o.gain >= A.MIN) all.push(o); return o.gain >= A.MIN; };
    // (who is awake inside each building, and who is passing a way in: the rooms' own counts, P9)
    const dentro = new Map(), passam = []; const In = G.Interiors; const At = G.Atmos;
    // (the musician a tavern has playing now: the pulse its claps, its dance and its song go to)
    const musicoEm = bid => { const T = G.Taverna; const bb = T && T.dia ? S.buildings.get(bid) : null; const op = bb ? T.dia(bb) : null; const m = op && op.data && op.data.mus ? S.villagers.get(op.data.mus) : null; return m && m.act === 'play' && m.inside === bid ? m : null; };
    // ---- the people: a gesture, an act
    for (const v of S.villagers.values()) {
      if (v.aboard || v.held || v.air || v.sleeping || !!v.ug !== !!ear.ug) continue;
      if (v.inside > 0) { let L0 = dentro.get(v.inside); if (!L0) dentro.set(v.inside, L0 = []); L0.push(v); if (In && In.passage && In.passage(v)) passam.push(v); }
      const r = v.act ? A.linhaDe(v) : null; let L = r && r.linha && r.linha.s ? r.linha : null;
      // (the drunk at a table talks louder, slurred, and laughs at his own jokes: the drink's — G.Atmos.drunk —, never the air's)
      if (L && L.s === 'voz' && At && At.drunk && At.drunk(v) >= 0.5) L = Object.assign({}, L, { s: 'vozBebado', v: Math.min(1, L.v * 1.25) });
      const fam = A.famDe(v, r); const mine = !!(fam && q && handsQ(v) === q);
      if (mine) count[fam] = (count[fam] || 0) + 1;
      const dx = v.x - ear.x, dy = v.y - ear.y;
      if (!v.inside && dx * dx + dy * dy < ear.r * ear.r) gente++;
      if (!L) {
        // (no act that sounds: the little thing of the idle that does, near the ear — a cough, a sneeze, a yawn, a sigh, a hiccup, the
        // teeth in the cold; 22c fase 6, D-610)
        const oc = !v.inside && dx * dx + dy * dy < OCIO_R2 ? A.ocioSom(v) : null;
        if (oc) push({ k: 'o' + v.id + ':' + oc.n, tipo: 'ocio', s: oc.s, g: null, ato: oc.k, de: { v: v.id, op: 0, b: 0 }, x: r3(v.x), y: r3(v.y), q: oc.q, cada: oc.cada, fase: r3(oc.f), contato: r3(oc.c), fam: null, notas: null,
          tom: r3((v.g === 'f' ? 1.5 : 1) * (v.age < 14 ? 1.4 : 1) * (0.88 + 0.24 * G.hash(v.id))) }, A.hear(ear, v.x, v.y, 0, 0.45), oc);
        continue;
      }
      // (where the one is: inside a building, the place the plan gives them — the room's own side and distance, P9)
      const [px, py, plv] = A.lugarDe(v, ear); const sin = shut(v.inside);
      // (and from outside a shut building, one inside carries only as far as a room's own sounds do: A.ROOM_R — L-1963)
      const h = ear.dentro && sin === ear.dentro ? A.perto(ear, px, py, L.alc) : A.hear(ear, px, py, sin, sin ? Math.min(L.alc, A.ROOM_R / ear.r) : L.alc);
      const o = { k: 'v' + v.id, tipo: r.tipo, s: L.s, g: r.g, ato: r.ato, de: { v: v.id, op: (v.task && Number.isInteger(v.task.op) && v.task.op) || 0, b: v.inside || 0 }, x: r3(px), y: r3(py), q: L.q, cada: L.cada || 0,
        fase: r3(v.actT || 0), contato: r.g ? G.Act.ANIM[r.g].contact : L.em || 0, fam, notas: L.s === 'lute' ? povo(v).notas : null, tom: r3((v.g === 'f' ? 1.5 : 1) * (v.age < 14 ? 1.4 : 1) * (0.88 + 0.24 * G.hash(v.id))),
        povo: (G.Fac && G.Fac.ofV ? (G.Fac.ofV(v) || NONE).civ : null) || 'classico' };
      // (P9: the cup's material in the hand; the floor under the feet; the music of who plays — the instrument in the hand, or the voice —
      // and its pulse; and the room's pulse for who claps, dances or sings along with it)
      if (L.mat) o.mat = matDe(v);
      if (L.piso && v.inside > 0) { const bb = S.buildings.get(v.inside); o.piso = bb && bb.ip ? A.PASSO[A.chaoDe(bb, plv)] || 'terra' : 'terra'; }
      if (r.g === 'tocar') { const ins = A.instrumentoDe(v); o.s = ins || 'canto'; o.musica = A.compasso(v); }
      if (L.compasso && v.inside > 0) { const m = musicoEm(v.inside); if (m) o.ritmo = A.compasso(m); }
      // (too far to tell apart, but of this quarter's work: one of the bed's own far voices — the nearest three of each life)
      if (!push(o, h, L) && mine) { const F = far[fam] || (far[fam] = []); F.push(o); }
    }
    // ---- the buildings at work: a room of people at their tables, a kiln or a furnace alight
    const acts = G.Act && G.Act.all ? G.Act.all() : [];
    for (const op of acts) {
      if (!G.Act.live(op) || !op.at || ear.ug) continue; const b = S.buildings.get(op.at); if (!b) continue;
      const bx = b.x + (b.w || 1) / 2, by = b.y + (b.h || 1) / 2; let L = null, n = 0, V = null;
      // (the talk of a tavern's room, P9 — D-780: who is awake in it and talking now, louder with the drink, in the timbre of its people;
      // nobody talking, nothing. n: who is at its tables)
      if (op.def === 'taverna') { n = Object.keys((op.data && op.data.mesa) || NONE).length; V = A.vozesDe(b, dentro.get(b.id)); if (V.fala >= 2) L = { s: 'murmur', q: 'leito', cada: Math.max(0.6, 2.4 - V.fala * 0.25), v: Math.min(0.75, 0.14 + 0.06 * V.forca), alc: A.ROOM_R / ear.r }; }
      else if (op.def === 'oficio') { const s = G.Oficio && G.Oficio.stage ? G.Oficio.stage(op) : null; if (s && s.kind === 'fogo' && op.data.calor > 0) L = { s: 'fornalha', q: 'curso', cada: 1.1, v: 0.45, alc: 0.8 }; }
      else if (op.def === 'termas') { if (op.data && op.data.calor > 0) L = { s: 'fornalha', q: 'curso', cada: 1.4, v: 0.3, alc: 0.6 }; }
      if (!L) continue;
      const o = { k: 'b' + b.id + ':' + op.def, tipo: 'predio', s: L.s, g: null, ato: null, de: { b: b.id, op: op.id }, x: r3(bx), y: r3(by), q: L.q, cada: L.cada, fase: 0, contato: 0, fam: FAM_DEF[op.def] || null, n };
      if (V) { o.fala = V.fala; o.bebado = V.bebado; o.forca = V.forca; o.povo = V.povo; }
      const hb = A.hear(ear, bx, by, shut(b.id), L.alc); if (ear.dentro && ear.dentro === shut(b.id)) hb.sala = ear.dentro;
      push(o, hb, L);
    }
    // ---- the room the ear is in (P9, D-782 to D-786): the fire burning in it (G.Atmos.fire: lit, never by itself), the pot on it (the
    // fire cooking with food in store, G.Atmos.within), the rain on its roof (the rain over it, on the roof the 3D lays); and, near the
    // ear, the doors someone passes (In.passage: the door swings for them — or stands open by its rule) and the feet of who walks inside
    let sala = null;
    if (!ear.ug && In && In.ready) {
      const eb = ear.dentro ? S.buildings.get(ear.dentro) : null;
      if (eb && eb.ip && In.ready(eb)) {
        const P = In.plan(eb); const E = A.ecoDe(eb); const ex = eb.x + (eb.w || 1) / 2, ey = eb.y + (eb.h || 1) / 2;
        const ent = P.entrance; const porta = ent && ent.door >= 0 && In.doorState ? In.doorState(eb, ent.door) : null;
        sala = { b: eb.id, tipo: eb.type, nome: G.Village && G.Village.buildName ? G.Village.buildName(eb) : eb.type, eco: E, piso: E ? E.piso : A.chaoDe(eb, 0), telhado: A.telhadoDe(eb),
          porta: porta ? porta.state : null, fora: porta && porta.state === 'aberta' ? 0.55 : 1, chuva: 0 };
        const fire = At && At.fire ? At.fire(eb) : null; let lar = null;
        if (fire && P.items) for (const it of P.items) {
          if (!it.fire) continue; const x = eb.x + it.x / TILE, y = eb.y + it.z / TILE; const k = A.FOGO[it.kind] || 0.6; if (!lar) lar = { x, y, it };
          push({ k: 'f' + eb.id + ':' + it.id, tipo: 'fogo', s: 'lareira', g: null, ato: null, de: { b: eb.id }, x: r3(x), y: r3(y), q: 'leito', cada: 0.3, fase: 0, contato: 0, fam: null, forca: k, peca: it.kind, why: fire.why }, A.perto(ear, x, y, 0.6), { v: G.clamp(0.35 + 0.3 * k, 0.3, 0.8) });
        }
        const w = At && At.within ? At.within(eb) : null;
        if (lar && w && w.cozinha) push({ k: 'n' + eb.id + ':panela', tipo: 'panela', s: 'panela', g: null, ato: null, de: { b: eb.id }, x: r3(lar.x), y: r3(lar.y), q: 'leito', cada: 0.3, fase: 0, contato: 0, fam: null, mat: w.cozinha.mat || 'barro', why: w.cozinha.why }, A.perto(ear, lar.x, lar.y, 0.5), { v: 0.4 });
        const rain = chuvaEm(ex, ey); const tel = sala.telhado;
        if (rain > 0.02 && tel) {
          // (an old roof no one cares for lets the rain in: a drip — G.Atmos.wear, the years and the care of the quarter)
          const wr = At && At.wear ? At.wear(eb) : null; const got = !!(wr && wr.ageLv >= 3 && wr.care === 0 && rain > 0.4);
          sala.chuva = rain;
          push({ k: 'c' + eb.id, tipo: 'chuva', s: 'chuvaTelhado', g: null, ato: null, de: { b: eb.id }, x: r3(ex), y: r3(ey), q: 'leito', cada: 0.3, fase: 0, contato: 0, fam: null, telhado: tel, chuva: rain, goteira: got ? 1 : 0, eco: E ? E.h : 3 }, { d: 0, gain: 1, pan: 0, muf: 0, sala: eb.id }, { v: G.clamp(0.25 + 0.6 * rain, 0, 0.85) });
        }
      }
      // the doors someone passes (one source a door: who passes, how many), and the feet of who passes inside, on the plan's floor
      const doors = new Map();
      for (const v of passam) {
        const b = S.buildings.get(v.inside); if (!b || !b.ip || !In.ready(b)) continue; const P = In.plan(b); const ent = P && P.entrance; if (!ent) continue;
        const dx = b.x + ent.x / TILE, dy = b.y + ent.z / TILE; if (Math.hypot(dx - ear.x, dy - ear.y) > A.ROOM_R) continue;
        const ps = In.passage(v); const kd = 'p' + b.id + ':' + ent.door; let D = doors.get(kd);
        if (!D) { const st = In.doorState ? In.doorState(b, ent.door) : null; D = { k: kd, tipo: 'porta', s: 'porta', g: null, ato: null, de: { b: b.id, v: v.id }, x: r3(dx), y: r3(dy), q: 'estado', cada: 0, fase: 0, contato: 0, fam: null, estado: st ? st.state : 'aberta', fica: ficaAberta(b, dentro.get(b.id)) ? 1 : 0, n: 0 };
          doors.set(kd, D); const hd = A.hear(ear, dx, dy, ear.dentro === b.id ? b.id : 0, A.ROOM_R / ear.r); if (ear.dentro === b.id) hd.sala = b.id; push(D, hd, { v: 0.6 }); }
        D.n++;
        // (the feet: on the way in the walk to the place; on the way out, the steps to the door — with the scrape of the bench one gets up
        // from, or sits down on, where the plan's place is a seat)
        const [px, py, plv] = A.ondeDe(v); const pl = In.placeOf(v); const T = G.Taverna; const keeper = T && T.keeperOf ? T.keeperOf(b) : null;
        const banco = ps.out ? (b.type === 'taverna' && keeper !== v ? 1 : 0) : (pl && pl.use === 'sentar' ? 1 : 0);
        const hp = ear.dentro === b.id ? A.perto(ear, px, py, 0.4) : A.hear(ear, px, py, b.id, 0.4);
        push({ k: 's' + v.id, tipo: 'passos', s: 'passo', g: null, ato: null, de: { v: v.id, b: b.id }, x: r3(px), y: r3(py), q: 'curso', cada: 0.52, fase: 0, contato: 0, fam: null, piso: A.PASSO[A.chaoDe(b, plv)] || 'terra', pass: ps.out ? 'sai' : 'entra', banco, tom: r3((v.g === 'f' ? 0.85 : 1) * (v.age < 14 ? 0.7 : 1)) }, hp, { v: 0.4 });
      }
      // (and the body's own feet, on the floor of the room it walks in — the drawing's motion, G.Avatar.motion: the speed of the feet)
      if (sala && ear.modo === 'corpo' && S.avatar && G.Avatar && G.Avatar.motion) {
        const m = G.Avatar.motion(); const me = S.villagers.get(S.avatar.id); const eb = S.buildings.get(sala.b);
        if (m && me && m.ground && m.speed > 0.35) push({ k: 's' + me.id, tipo: 'passos', s: 'passo', g: null, ato: null, de: { v: me.id, b: sala.b }, x: r3(ear.x), y: r3(ear.y), q: 'curso', cada: r3(G.clamp(0.72 - 0.09 * m.speed, 0.3, 0.62)), fase: 0, contato: 0, fam: null, piso: A.PASSO[A.chaoDe(eb, 0)] || 'terra', pass: null, banco: 0, tom: 1, meu: 1 }, { d: 0, gain: 1, pan: 0, muf: 0, sala: sala.b }, { v: 0.32 });
      }
    }
    // ---- the ships under way
    if (!ear.ug) for (const s of S.ships) {
      if (!s.moving) continue; const small = G.Naval && G.Naval.small && G.Naval.small(s);
      const L = { v: small ? 0.3 : 0.5, alc: small ? 0.9 : 1.4 };
      push({ k: 'n' + s.id, tipo: 'navio', s: 'sail', g: null, ato: null, de: { navio: s.id }, x: r3(s.x), y: r3(s.y), q: 'curso', cada: small ? 2.6 : 2, fase: 0, contato: 0, fam: null }, A.hear(ear, s.x, s.y, 0, L.alc), L);
    }
    // ---- the beasts with a voice
    if (!ear.ug) for (const a of S.animals.values()) {
      const L = A.BICHO[a.kind]; if (!L || a.dead || a.held || (L.dia && night) || (L.noite && !night)) continue;
      const dx = a.x - ear.x, dy = a.y - ear.y; if (dx * dx + dy * dy > ear.r * ear.r * 2.2) continue;
      push({ k: 'a' + a.id, tipo: 'bicho', s: L.s, g: null, ato: null, de: { bicho: a.id }, x: r3(a.x), y: r3(a.y), q: 'acaso', cada: L.cada, fase: 0, contato: 0, fam: null, tom: L.tom || 1 }, A.hear(ear, a.x, a.y, 0, L.alc), L);
    }
    // ---- a fight (the blows ring by the world's own hand; the press of many is the ear's): the nearest fighter, and how many
    const fighters = (G.War && G.War.fighters) || [];
    if (!ear.ug && fighters.length) {
      let best = null, bd = 1e9, n = 0;
      // (the war's list is made again every half second: who fell since is still in it, and no blow of the dead rings — the
      // nearest fighter of a fight in the second world of the proof was one killed a moment before, L-818)
      for (const v of fighters) { if (!S.villagers.has(v.id)) continue; const d = Math.hypot(v.x - ear.x, v.y - ear.y); if (d < ear.r * 1.3) { n++; if (d < bd) { bd = d; best = v; } } }
      if (best && n > 1) push({ k: 'luta', tipo: 'luta', s: 'clang', g: null, ato: 'fight', de: { v: best.id }, x: r3(best.x), y: r3(best.y), q: 'acaso', cada: G.clamp(4 / (n + 2), 0.2, 1.2), fase: 0, contato: 0, fam: null, n }, A.hear(ear, best.x, best.y, 0, 1.3), { v: 0.6 });
    }
    // (the loudest first, the same order for the same world; of the beasts, the ear keeps a few — a yard of hens is no choir)
    const order = (a, b) => b.gain - a.gain || (a.k < b.k ? -1 : a.k > b.k ? 1 : 0);
    all.sort(order); let beasts = 0;
    const heard = all.filter(o => o.tipo !== 'bicho' || ++beasts <= A.BICHOS);
    // ---- the quarter's bed
    let fundo = null;
    if (q) {
      const set = S.settlements.get(q.set); const h = A.habito(q); const agora = {}, w = {}, de = {};
      const wet = 1 - 0.5 * G.clamp((S.weather && S.weather.rain) || 0, 0, 1);
      for (const f of A.FAMS) {
        agora[f] = r3(Math.min(1, (count[f] || 0) / A.HANDS)); w[f] = r3(h[f] * agora[f] * wet);
        de[f] = (far[f] || []).sort((a, b) => a.d - b.d || (a.k < b.k ? -1 : 1)).slice(0, 3).map(o => ({ k: o.k, s: o.s, de: o.de, x: o.x, y: o.y, d: o.d, pan: o.pan, muf: o.muf, tom: o.tom, notas: o.notas }));
      }
      fundo = { q: q.whole ? 'w' + q.set : 'd' + q.id, set: q.set, nome: q.whole ? (set ? set.name : '') : q.name, perfil: (q.tags || []).slice(), h, agora, w, de, maos: Object.assign({}, count) };
    }
    // (the ear tells apart the loudest A.VOZES; the beds of the room the ear is in — its talk, its fire, its pot, its rain — are always
    // there under them, P9)
    let told = 0; const fontes = heard.filter(o => o.q === 'leito' || ++told <= A.VOZES);
    return { ear, n: heard.length, fontes, fundo, gente, musica: A.musicAt(ear.x, ear.y), hora: r3(S.time), noite: night, chuva: r3((S.weather && S.weather.rain) || 0), sala };
  };
})(window.G);
