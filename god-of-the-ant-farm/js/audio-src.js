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
    sentar: still('quem está sentado não soa'),
    banhar: { s: 'slosh', q: 'curso', cada: 2.6, v: 0.4, alc: 0.6, fam: 'noite' },
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
    servir: { s: 'cup', q: 'contato', v: 0.4, alc: 0.5, fam: 'noite' },
    beber: { s: 'cup', q: 'contato', v: 0.3, alc: 0.4 },
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
  };
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
  A.FAMS = ['cais', 'pesca', 'troca', 'oficio', 'mina', 'campo', 'armas', 'fe', 'saber', 'noite'];
  const FAM_DEF = { descarga: 'cais', negocio: 'troca', pesca: 'pesca', oficio: 'oficio', taverna: 'noite', termas: 'noite', lenhaTermas: 'noite', espetaculo: 'noite', leitura: 'saber' };
  const FAM_TASK = { farm: 'campo', horta: 'campo', estate: 'campo', herd: 'campo', tend: 'campo', penwork: 'campo', fodder: 'campo', slaughter: 'campo', mine: 'mina', minejob: 'mina', quarry: 'mina',
    drill: 'armas', muster: 'armas', pray: 'fe', banca: 'troca', sell: 'troca', shop: 'troca', compra: 'troca', atacado: 'troca', fish: 'pesca', redes: 'pesca', barco: 'pesca',
    tavern: 'noite', atender: 'noite', teatro: 'noite', atuar: 'noite', termas: 'noite', fornalha: 'noite', copiar: 'saber', ler: 'saber', descarga: 'cais', cais: 'cais', conferir: 'cais', oficio: 'oficio' };
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
  const povo = v => { const f = G.Fac && G.Fac.ofV ? G.Fac.ofV(v) : null; return A.musicOf(f ? f.civ : null, f && f.tech ? f.tech.known : null); };

  // ------------------------------ the quarter's bed ------------------------------
  // what a quarter sounds like from within, beyond the sources one can tell apart: for each life of it, its habit (the slow
  // mean of what really happened there, against the mark that makes a profile of it — G.Urban) times the hands at that
  // work in it now. No cargo on the quay, no hands: the port is silent, whatever it is called. The rain covers what is far
  const TAG_OF = { cais: 'porto', pesca: 'pesqueiro', troca: 'mercado', oficio: 'oficinas', mina: 'minas', campo: 'campo', armas: 'quartel', fe: 'sagrado', saber: 'letrado', noite: 'boemio' };
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

  // ------------------------------ the scene ------------------------------
  // what would sound now for this ear: the sources (each with what it is of — a person, a building and its operation, a
  // ship, a beast —, its sound, how loud, which side, how muffled), the quarter's bed, the people about, the music's people
  A.scene = function (ear) {
    const S = G.S; if (!S || !ear) return null;
    const U = G.Urban; const q = U && U.at ? U.at(ear.x, ear.y) : null; const night = G.isNight ? G.isNight() : false;
    const all = []; const count = {}; const far = {}; let gente = 0;
    const push = (o, h, L) => { o.d = h.d; o.gain = r3(h.gain * L.v); o.pan = h.pan; o.muf = h.muf; if (o.gain >= A.MIN) all.push(o); return o.gain >= A.MIN; };
    // ---- the people: a gesture, an act
    for (const v of S.villagers.values()) {
      if (v.aboard || v.held || v.air || v.sleeping || !!v.ug !== !!ear.ug) continue;
      const r = v.act ? A.linhaDe(v) : null; const L = r && r.linha && r.linha.s ? r.linha : null;
      const fam = A.famDe(v, r); const mine = !!(fam && q && U.at(v.x, v.y) === q);
      if (mine) count[fam] = (count[fam] || 0) + 1;
      const dx = v.x - ear.x, dy = v.y - ear.y;
      if (!v.inside && dx * dx + dy * dy < ear.r * ear.r) gente++;
      if (!L) continue;
      const h = A.hear(ear, v.x, v.y, shut(v.inside), L.alc);
      const o = { k: 'v' + v.id, tipo: r.tipo, s: L.s, g: r.g, ato: r.ato, de: { v: v.id, op: (v.task && Number.isInteger(v.task.op) && v.task.op) || 0, b: v.inside || 0 }, x: r3(v.x), y: r3(v.y), q: L.q, cada: L.cada || 0,
        fase: r3(v.actT || 0), contato: r.g ? G.Act.ANIM[r.g].contact : 0, fam, notas: L.s === 'lute' ? povo(v).notas : null, tom: r3((v.g === 'f' ? 1.5 : 1) * (v.age < 14 ? 1.4 : 1) * (0.88 + 0.24 * G.hash(v.id))) };
      // (too far to tell apart, but of this quarter's work: one of the bed's own far voices — the nearest three of each life)
      if (!push(o, h, L) && mine) { const F = far[fam] || (far[fam] = []); F.push(o); }
    }
    // ---- the buildings at work: a room of people at their tables, a kiln or a furnace alight
    const acts = G.Act && G.Act.all ? G.Act.all() : [];
    for (const op of acts) {
      if (!G.Act.live(op) || !op.at || ear.ug) continue; const b = S.buildings.get(op.at); if (!b) continue;
      const bx = b.x + (b.w || 1) / 2, by = b.y + (b.h || 1) / 2; let L = null, n = 0;
      if (op.def === 'taverna') { n = Object.keys((op.data && op.data.mesa) || NONE).length; if (n >= 2) L = { s: 'murmur', q: 'curso', cada: Math.max(0.6, 2.4 - n * 0.25), v: Math.min(0.7, 0.2 + n * 0.07), alc: 0.9 }; }
      else if (op.def === 'oficio') { const s = G.Oficio && G.Oficio.stage ? G.Oficio.stage(op) : null; if (s && s.kind === 'fogo' && op.data.calor > 0) L = { s: 'fornalha', q: 'curso', cada: 1.1, v: 0.45, alc: 0.8 }; }
      else if (op.def === 'termas') { if (op.data && op.data.calor > 0) L = { s: 'fornalha', q: 'curso', cada: 1.4, v: 0.3, alc: 0.6 }; }
      if (!L) continue;
      push({ k: 'b' + b.id + ':' + op.def, tipo: 'predio', s: L.s, g: null, ato: null, de: { b: b.id, op: op.id }, x: r3(bx), y: r3(by), q: L.q, cada: L.cada, fase: 0, contato: 0, fam: FAM_DEF[op.def] || null, n }, A.hear(ear, bx, by, shut(b.id), L.alc), L);
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
      for (const v of fighters) { const d = Math.hypot(v.x - ear.x, v.y - ear.y); if (d < ear.r * 1.3) { n++; if (d < bd) { bd = d; best = v; } } }
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
    return { ear, n: heard.length, fontes: heard.slice(0, A.VOZES), fundo, gente, musica: A.musicAt(ear.x, ear.y), hora: r3(S.time), noite: night, chuva: r3((S.weather && S.weather.rain) || 0) };
  };
})(window.G);
