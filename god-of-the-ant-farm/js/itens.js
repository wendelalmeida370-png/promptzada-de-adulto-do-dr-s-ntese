'use strict';
// ============================================================
//  Itens: the catalog of the things a person can carry, hold
//  and wear — the tools, the weapons, the shield, the bow and
//  its arrows, the helmet, the torch, the basket. Pure (D-337):
//  a table and the functions that read it, the same for every
//  world; no world, no chance, no drawing (the guard's rule 112).
//  A thing's key is its kind, or its kind and its material
//  ('machado', 'machado.ferro'); a good of the economy ('wood',
//  'food', 'couro'…) is a key too, read from the economy's own
//  table. Who carries what is G.Inv (inventario.js); how a thing
//  looks is G.ItemArt (itemarte.js); the contract of the whole
//  gameplay base is JOGABILIDADE.md.
//  The canonical key (D-370): a kind made in more than one
//  material always says its material ('machado.pedra', never a
//  bare 'machado' in a bag); a kind of one material never does
//  ('vara'). It.canon gives it; the bags keep only canonical keys.
//  The store's anonymous goods and the things (D-371): a thing
//  counts in a people's store as its good — `bem`, `vale` of
//  them (an axe is one of `ferramentas`, twenty arrows one of
//  `armas`) —, or, when it is no good of the store, as what it is
//  made of (`feito`: a staff is half a unit of wood).
// ============================================================
(function (G) {
  const It = G.Itens = {};

  // ------------------------------ the kinds ------------------------------
  // tipo: ferramenta | arma | escudo | arco | municao | protecao | luz | recipiente | brinquedo | instrumento
  // maos: hands it takes in use (2: both — the spear, the bow, the oar, the hoe…)
  // slots: where it may be (the hands — mao, the other hand — outra; stowed — costas, cinto; worn — cabeca, corpo)
  // pega: how the hand closes on it (the 3D's hold: punho a fist round a handle; duas two hands on a shaft; escudo the forearm
  //   through the straps; arco the bow hand; vara a rod's butt; tocha upright in the fist; alca a handle hanging)
  // peso: kilos; bem: the economy's good it counts as in a people's store (ferramentas, armas) and vale how many of it
  // tags: what it is good for (the activities and the fight ask the tags, never the kind)
  // mats: the materials it is made in (the first is the plainest); tech: what a people must know to make it
  // dano, alcance: a rough first measure for the fight (the fight's own module tunes them, wave 2)
  // (added by the inventory, D-372 — first measures, read by nothing of the world yet: desc, a line for the screen; ritmo, the
  //  seconds of a stroke; trabalho, how much a stroke of work does against a bronze tool's; bloqueio, the share of a blow a
  //  shield takes; protecao, the share a helmet or a cuirass takes; feito, what a thing that is no good of the store is made of)
  const K = It.KINDS = {
    // the tools
    machado: { nome: 'machado', plural: 'machados', tipo: 'ferramenta', maos: 1, slots: ['mao', 'costas', 'cinto'], pega: 'punho', peso: 1.8, bem: 'ferramentas', vale: 1, tags: ['cortar', 'lenha', 'golpe'], mats: ['pedra', 'bronze', 'ferro'], dano: 11, alcance: 0.75, desc: 'Derruba árvores e racha lenha; numa briga, um golpe pesado.', ritmo: 1.1, trabalho: 1 },
    picareta: { nome: 'picareta', plural: 'picaretas', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.6, bem: 'ferramentas', vale: 1, tags: ['minerar', 'pedra', 'golpe'], mats: ['pedra', 'bronze', 'ferro'], dano: 10, alcance: 0.85, desc: 'Quebra a rocha na pedreira e o minério na mina.', ritmo: 1.3, trabalho: 1 },
    pa: { nome: 'pá', plural: 'pás', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 1.9, bem: 'ferramentas', vale: 1, tags: ['cavar'], mats: ['madeira', 'bronze', 'ferro'], dano: 5, alcance: 0.9, desc: 'Cava a terra, abre valas, mexe o sal e o carvão.', ritmo: 1, trabalho: 1 },
    enxada: { nome: 'enxada', plural: 'enxadas', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 1.7, bem: 'ferramentas', vale: 1, tags: ['lavrar', 'cavar'], mats: ['madeira', 'bronze', 'ferro'], dano: 6, alcance: 0.95, desc: 'Revolve a terra da lavoura antes de plantar.', ritmo: 1, trabalho: 1 },
    foice: { nome: 'foice', plural: 'foices', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 0.7, bem: 'ferramentas', vale: 1, tags: ['colher', 'cortar'], mats: ['pedra', 'bronze', 'ferro'], dano: 6, alcance: 0.6, desc: 'Colhe o trigo e a uva, corta o capim.', ritmo: 0.8, trabalho: 1 },
    martelo: { nome: 'martelo', plural: 'martelos', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 1.2, bem: 'ferramentas', vale: 1, tags: ['construir', 'forjar', 'golpe'], mats: ['pedra', 'bronze', 'ferro'], dano: 8, alcance: 0.55, desc: 'Ergue as obras e bate o metal na forja.', ritmo: 0.8, trabalho: 1 },
    faca: { nome: 'faca', plural: 'facas', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 0.3, bem: 'ferramentas', vale: 1, tags: ['esfolar', 'cortar', 'lutar', 'perfurar'], mats: ['pedra', 'bronze', 'ferro'], dano: 7, alcance: 0.45, desc: 'Esfola a caça e corta a carne; de perto, uma arma curta.', ritmo: 0.5, trabalho: 1 },
    vara: { nome: 'vara de pescar', plural: 'varas de pescar', tipo: 'ferramenta', maos: 1, slots: ['mao', 'costas'], pega: 'vara', peso: 0.8, bem: 'ferramentas', vale: 1, tags: ['pescar'], mats: ['madeira'], tech: 'bronze', desc: 'Linha e anzol de bronze: um peixe de cada vez, da margem ou do barco.', ritmo: 6, trabalho: 1 },
    rede: { nome: 'rede', plural: 'redes', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.5, bem: 'ferramentas', vale: 1, tags: ['pescar'], mats: ['corda'], desc: 'Lançada na água, traz muitos peixes de uma vez.', ritmo: 7.5, trabalho: 1 },
    remo: { nome: 'remo', plural: 'remos', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.2, bem: 'ferramentas', vale: 1, tags: ['remar', 'golpe'], mats: ['madeira'], dano: 5, alcance: 1.1, desc: 'Move o barco; num aperto, também bate.', ritmo: 1.2, trabalho: 1 },
    cajado: { nome: 'cajado', plural: 'cajados', tipo: 'ferramenta', maos: 1, slots: ['mao', 'costas'], pega: 'punho', peso: 1.1, bem: null, vale: 0, tags: ['apoio', 'golpe'], mats: ['madeira'], dano: 5, alcance: 1.0, desc: 'Apoio para as pernas cansadas e para guiar o rebanho; afasta um bicho.', ritmo: 1, feito: { wood: 0.5 } },
    tocha: { nome: 'tocha', plural: 'tochas', tipo: 'luz', maos: 1, slots: ['outra', 'mao'], pega: 'tocha', peso: 0.6, bem: null, vale: 0, tags: ['luz', 'fogo'], mats: ['madeira'], desc: 'Clareia a noite e espanta as feras; acende um fogo.', feito: { wood: 0.25 } },
    cesto: { nome: 'cesto', plural: 'cestos', tipo: 'recipiente', maos: 1, slots: ['outra', 'costas'], pega: 'alca', peso: 0.5, bem: null, vale: 0, tags: ['colher', 'levar'], mats: ['vime'], desc: 'Leva o que se colhe: frutas, grãos, conchas.', feito: { wood: 0.2 } },
    balde: { nome: 'balde', plural: 'baldes', tipo: 'recipiente', maos: 1, slots: ['outra', 'mao'], pega: 'alca', peso: 0.9, bem: null, vale: 0, tags: ['agua', 'levar'], mats: ['madeira'], desc: 'Busca água no poço e no rio; apaga um fogo.', feito: { wood: 0.5 } },
    // the weapons
    espada: { nome: 'espada', plural: 'espadas', tipo: 'arma', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 1.3, bem: 'armas', vale: 1, tags: ['lutar', 'cortar', 'perfurar'], mats: ['bronze', 'ferro'], tech: 'bronze', dano: 15, alcance: 0.9, desc: 'A arma de quem luta de perto, com escudo na outra mão.', ritmo: 0.9 },
    lanca: { nome: 'lança', plural: 'lanças', tipo: 'arma', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.0, bem: 'armas', vale: 1, tags: ['lutar', 'perfurar', 'cacar', 'pescar'], mats: ['pedra', 'bronze', 'ferro'], dano: 14, alcance: 1.9, desc: 'Alcança longe: a arma do soldado na linha, do caçador e do pescador de arpão.', ritmo: 1 },
    clava: { nome: 'clava', plural: 'clavas', tipo: 'arma', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 1.5, bem: 'armas', vale: 1, tags: ['lutar', 'golpe'], mats: ['madeira'], dano: 12, alcance: 0.75, desc: 'Madeira dura e pesada: a arma de quem não tem outra.', ritmo: 1.1 },
    arco: { nome: 'arco', plural: 'arcos', tipo: 'arco', maos: 2, slots: ['outra', 'costas'], pega: 'arco', peso: 0.9, bem: 'armas', vale: 1, tags: ['atirar', 'cacar'], mats: ['madeira'], tech: 'arco', dano: 9, alcance: 22, desc: 'Atira flechas de longe — na guerra, da muralha, na caçada.', ritmo: 1.4 },
    flecha: { nome: 'flecha', plural: 'flechas', tipo: 'municao', maos: 0, slots: [], pega: null, peso: 0.04, bem: 'armas', vale: 0.05, tags: ['municao', 'arco'], mats: ['pedra', 'bronze', 'ferro'], tech: 'arco', desc: 'A munição do arco: vinte delas valem uma arma no armazém.' },
    funda: { nome: 'funda', plural: 'fundas', tipo: 'arco', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 0.2, bem: 'armas', vale: 1, tags: ['atirar', 'cacar'], mats: ['corda'], dano: 7, alcance: 16, desc: 'Uma tira de corda que atira pedras longe.', ritmo: 1.2 },
    escudo: { nome: 'escudo', plural: 'escudos', tipo: 'escudo', maos: 1, slots: ['outra', 'costas'], pega: 'escudo', peso: 4.0, bem: 'armas', vale: 1, tags: ['bloquear'], mats: ['madeira', 'bronze'], desc: 'Apara os golpes e as flechas; no braço da outra mão.', bloqueio: 0.6 },
    // what is worn
    elmo: { nome: 'elmo', plural: 'elmos', tipo: 'protecao', maos: 0, slots: ['cabeca'], pega: null, peso: 1.6, bem: 'armas', vale: 1, tags: ['proteger'], mats: ['couro', 'bronze', 'ferro'], tech: 'bronze', desc: 'Protege a cabeça dos golpes.', protecao: 0.2 },
    couraca: { nome: 'couraça', plural: 'couraças', tipo: 'protecao', maos: 0, slots: ['corpo'], pega: null, peso: 6.0, bem: 'armas', vale: 1, tags: ['proteger'], mats: ['couro', 'bronze', 'ferro'], desc: 'Protege o peito e as costas.', protecao: 0.35 },
    // the things of daily life the gestures hold (22c, D-612): the cup of who drinks, the children's ball, the bonds of who is led
    // bound, the crutch of who lost a leg — each in what its people has (G.Origem.matOK), none a weapon (no dano: the fight's fists)
    caneca: { nome: 'caneca', plural: 'canecas', tipo: 'recipiente', maos: 1, slots: ['mao'], pega: 'copo', peso: 0.3, bem: null, vale: 0, tags: ['beber'], mats: ['madeira', 'barro'], desc: 'Para a cerveja, o vinho e a água: na taverna, na festa, no brinde.' },
    // (P7, D-768: the plate the keeper carries to the table — one in a hand, held by its rim —, of the tavern's own, as the cup)
    prato: { nome: 'prato', plural: 'pratos', tipo: 'recipiente', maos: 1, slots: ['mao'], pega: 'copo', peso: 0.4, bem: null, vale: 0, tags: ['servir'], mats: ['madeira', 'barro'], desc: 'O prato da taverna: o taverneiro o traz à mesa com a comida da casa.' },
    // (P7, D-805: the tavern's game and its cloth — the five knucklebones of a sheep's or a goat's ankle, of the beast's own bone: a
    // people that never slaughtered, hunted nor offered a beast has none, and no game; thrown on the board from the fist. And the rag
    // the keeper wipes a table with: of the loom's wool where the people has had woven cloth, else a twist of straw — the place's, as
    // the cup; none a weapon)
    ossinhos: { nome: 'ossinhos', plural: 'ossinhos', tipo: 'brinquedo', maos: 1, slots: ['mao'], pega: 'bola', peso: 0.06, bem: null, vale: 0, tags: ['jogar'], mats: ['osso'], desc: 'Cinco ossinhos do tornozelo de um carneiro: lançados na mesa, o jogo da taverna.' },
    pano: { nome: 'pano', plural: 'panos', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'bola', peso: 0.12, bem: null, vale: 0, tags: ['limpar'], mats: ['palha', 'la'], desc: 'Limpa a mesa da taverna: um pano de lã onde o povo tece, um feixe de palha onde não.' },
    bola: { nome: 'bola', plural: 'bolas', tipo: 'brinquedo', maos: 1, slots: ['mao'], pega: 'bola', peso: 0.25, bem: null, vale: 0, tags: ['brincar'], mats: ['vime', 'couro'], desc: 'O brinquedo das crianças: de vime trançado, ou de couro cosido e cheio.' },
    grilhoes: { nome: 'grilhões', plural: 'grilhões', tipo: 'ferramenta', maos: 2, slots: ['mao'], pega: 'algema', peso: 1.6, bem: 'ferramentas', vale: 0.5, tags: ['prender'], mats: ['corda', 'ferro'], desc: 'Prendem as mãos de quem é levado: corda trançada, ou duas argolas de ferro com a corrente.' },
    muleta: { nome: 'muleta', plural: 'muletas', tipo: 'ferramenta', maos: 1, slots: ['mao', 'outra'], pega: 'muleta', peso: 1.2, bem: null, vale: 0, tags: ['apoio'], mats: ['madeira'], desc: 'Debaixo do braço, faz as vezes da perna que falta.', feito: { wood: 0.5 } },
    // the instruments of the musician of the night (P7, D-764): the lyre of the peoples of the Old World — the arms and the yoke of
    // wood, the sound box covered with hide, the strings of gut —, and the drum of the Aztec, the huehuetl: a log hollowed out, the
    // hide stretched over its mouth — held in one hand (the other plucks, or beats). Their material is the beast's (its hide and gut: a people that never had a hide has none, the
    // song with the voice alone); what they are made of, the hide and the wood of the store (It.feitoDe). Of the place — the tavern's
    // —, as the cup (G.Inv's kit), none a weapon
    lira: { nome: 'lira', plural: 'liras', tipo: 'instrumento', maos: 1, slots: ['mao', 'costas'], pega: 'lira', peso: 0.9, bem: null, vale: 0, tags: ['tocar'], mats: ['couro'], desc: 'Os braços e a travessa de madeira, a caixa coberta de couro, as cordas de tripa: a música da taverna e da festa.' },
    tambor: { nome: 'tambor', plural: 'tambores', tipo: 'instrumento', maos: 1, slots: ['mao', 'costas'], pega: 'tambor', peso: 2.4, bem: null, vale: 0, tags: ['tocar'], mats: ['couro'], desc: 'O tronco escavado, com o couro esticado na boca: batido com as mãos, marca o passo da dança.' },
  };
  // the materials: what they change in a thing (the weight, the bite of an edge) and how they are said
  // (ord: the plainest 0, bronze 1, iron 2 — the best a people knows is the highest it may make; cor: the material's colour,
  //  for a sign on the screen; trabalho, bloqueio, protecao: how the material changes the kind's measure)
  const M = It.MATS = {
    madeira: { nome: 'de madeira', peso: 1, dano: 0.85, ord: 0, cor: '#a8753f', trabalho: 0.75, bloqueio: 0.85, protecao: 0.5 },
    pedra: { nome: 'de pedra', peso: 1.1, dano: 0.8, ord: 0, cor: '#a09a8e', trabalho: 0.75, bloqueio: 0.8, protecao: 0.5 },
    vime: { nome: 'de vime', peso: 1, dano: 1, ord: 0, cor: '#c9a464', trabalho: 1, bloqueio: 0.5, protecao: 0.3 },
    corda: { nome: 'de corda', peso: 1, dano: 1, ord: 0, cor: '#c2a676', trabalho: 1, bloqueio: 0.5, protecao: 0.3 },
    couro: { nome: 'de couro', peso: 0.8, dano: 1, ord: 0, cor: '#8f5d35', trabalho: 1, bloqueio: 0.7, protecao: 0.6 },
    bronze: { nome: 'de bronze', peso: 1, dano: 1, tech: 'bronze', ord: 1, cor: '#cf8f45', trabalho: 1, bloqueio: 1, protecao: 1 },
    ferro: { nome: 'de ferro', peso: 1.05, dano: 1.15, tech: 'ferro', ord: 2, cor: '#a4adb8', trabalho: 1.2, bloqueio: 1.1, protecao: 1.15 },
    // (the fired clay of the pottery: a cup — 22c, D-612; a people has it once its pottery made it or it came in, G.Origem)
    barro: { nome: 'de barro', peso: 1.4, dano: 0.7, ord: 0, cor: '#b0603a', trabalho: 0.6, bloqueio: 0.4, protecao: 0.3 },
    // (P7, D-805: the carcass's bone; the field's and the meadow's straw; the loom's wool — G.Origem.matOK says who has each)
    osso: { nome: 'de osso', peso: 1, dano: 0.8, ord: 0, cor: '#e6dcc2', trabalho: 0.6, bloqueio: 0.3, protecao: 0.3 },
    palha: { nome: 'de palha', peso: 0.8, dano: 0.5, ord: 0, cor: '#d4b56a', trabalho: 0.5, bloqueio: 0.2, protecao: 0.2 },
    la: { nome: 'de lã', peso: 1, dano: 0.5, ord: 0, cor: '#e8e0cc', trabalho: 0.5, bloqueio: 0.3, protecao: 0.4 },
  };
  // the equipment's places on a body, in the order the screen lists them
  It.SLOTS = ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo'];
  It.SLOT_NOME = { mao: 'mão', outra: 'outra mão', costas: 'costas', cinto: 'cinto', cabeca: 'cabeça', corpo: 'corpo' };
  // what each kind of thing is called as a kind, and what each tag says it is good for (the screen's card)
  It.TIPO_NOME = { ferramenta: 'Ferramenta', arma: 'Arma', escudo: 'Escudo', arco: 'Arma de tiro', municao: 'Munição', protecao: 'Proteção', luz: 'Luz', recipiente: 'Recipiente', brinquedo: 'Brinquedo', instrumento: 'Instrumento', bem: 'Bem' };
  It.TAG_NOME = { cortar: 'cortar', lenha: 'derrubar árvores', golpe: 'golpear', minerar: 'minerar', pedra: 'quebrar pedra', cavar: 'cavar', lavrar: 'lavrar a terra', colher: 'colher', construir: 'construir', forjar: 'forjar', esfolar: 'esfolar a caça', lutar: 'lutar', perfurar: 'perfurar', pescar: 'pescar', remar: 'remar', apoio: 'apoiar-se', luz: 'iluminar', fogo: 'acender fogo', levar: 'levar coisas', agua: 'buscar água', cacar: 'caçar', atirar: 'atirar de longe', municao: 'munição do arco', arco: 'atirar com o arco', bloquear: 'aparar golpes', proteger: 'proteger o corpo', beber: 'beber', brincar: 'brincar', prender: 'prender as mãos de alguém', tocar: 'tocar música', servir: 'servir a comida', jogar: 'jogar à mesa', limpar: 'limpar a mesa', bem: 'um bem do armazém' };

  // ------------------------------ reading a key ------------------------------
  // a key: 'machado' (its plainest material) or 'machado.ferro'
  It.parse = key => { const s = String(key || ''); const i = s.indexOf('.'); return i > 0 ? [s.slice(0, i), s.slice(i + 1)] : [s, null]; };
  It.key = (kind, mat) => (mat ? kind + '.' + mat : kind);
  It.isThing = key => !!K[It.parse(key)[0]];
  // the canonical key of every thing of the catalog, made once: KEYS[kind][mat] (no string is built where a frame asks), and
  // the set of them — a fast «is this a thing?» for the doors the goods of the whole world pass through
  const KEYS = {}; const THINGS = new Set();
  for (const kind in K) { KEYS[kind] = {}; for (const m of K[kind].mats) { const c = K[kind].mats.length > 1 ? kind + '.' + m : kind; KEYS[kind][m] = c; THINGS.add(c); } }
  It.THINGS = THINGS;
  // the canonical key of a thing of this kind in this material (null: no such thing); with no material, its plainest
  It.keyOf = (kind, mat) => { const t = KEYS[kind]; if (!t) return null; return t[mat || K[kind].mats[0]] || null; };
  // any spelling of a key → the canonical one ('machado' → 'machado.pedra', 'vara.madeira' → 'vara'); a good stays as it is;
  // a key of neither → null
  It.canon = function (key) {
    if (THINGS.has(key)) return key;
    const [kind, mat] = It.parse(key); const k = K[kind];
    if (k) return mat && !k.mats.includes(mat) ? null : It.keyOf(kind, mat);
    return It.def(key) ? key : null;
  };
  // the whole description of a key — a thing of the catalog with its material, or a good of the economy as a thing one carries
  // (null for what is neither); the same object every time for the same key (read only: never written). Its id is the
  // canonical key (D-370)
  const cache = new Map();
  const mul = (x, f) => (x ? +(x * f).toFixed(3) : 0);
  It.def = function (key) {
    if (cache.has(key)) return cache.get(key);
    const [kind, mat0] = It.parse(key); const k = K[kind]; let d = null;
    if (k && (!mat0 || k.mats.includes(mat0))) {
      const mat = mat0 || k.mats[0]; const m = M[mat] || M.madeira;
      d = Object.freeze(Object.assign({}, k, {
        id: It.keyOf(kind, mat), kind, mat, peso: +(k.peso * m.peso).toFixed(3), dano: k.dano ? +(k.dano * m.dano).toFixed(2) : 0, nomeMat: m.nome, tech: m.tech || k.tech || null, coisa: true,
        trabalho: mul(k.trabalho, m.trabalho), bloqueio: mul(k.bloqueio, m.bloqueio), protecao: mul(k.protecao, m.protecao), ord: m.ord, cor: m.cor,
        guarda: k.slots.includes('costas') && (k.maos >= 2 || !k.slots.includes('cinto')) ? 'costas' : k.slots.includes('cinto') ? 'cinto' : k.slots.includes('costas') ? 'costas' : null,
        maoSlot: k.slots.find(s => s === 'mao' || s === 'outra') || null, // (the first hand its slots name: the torch, the basket, the shield in the other)
        veste: k.slots.includes('cabeca') ? 'cabeca' : k.slots.includes('corpo') ? 'corpo' : null,
      }));
    } else if (!k) {
      // a good of the economy (wood, food, a hide…): carried as it is, counted in units
      const E = G.Eco; const g = E && E.GOODS && E.GOODS[key];
      const base = { food: 'comida', wood: 'madeira', stone: 'pedra', water: 'água' };
      if (g || base[key]) d = Object.freeze({ id: key, kind: key, mat: null, nome: (g && g.name) || base[key], plural: (g && g.name) || base[key], tipo: 'bem', maos: 0, slots: [], pega: null, peso: G.Depot && G.Depot.kg ? G.Depot.kg(key, 1) : 1, bem: key, vale: 1, tags: ['bem'], coisa: false, cor: (g && g.col) || '#c8a878', desc: '' });
    }
    cache.set(key, d); return d;
  };
  // what a thing is called ('um machado de ferro', 'três flechas')
  It.nome = function (key, n) { const d = It.def(key); if (!d) return String(key); const many = (n || 1) > 1.5; return (many ? d.plural : d.nome) + (d.coisa && d.mat && K[d.kind].mats.length > 1 ? ' ' + d.nomeMat : ''); };
  // has the thing this tag (cortar, pescar, lutar…)?
  It.has = (key, tag) => { const d = It.def(key); return !!d && d.tags.includes(tag); };
  // the kinds that are good for a tag, in the catalog's order
  It.withTag = tag => Object.keys(K).filter(k => K[k].tags.includes(tag));
  // may a slot hold this thing?
  It.fits = (key, slot) => { const d = It.def(key); return !!d && d.slots.includes(slot); };

  // ------------------------------ what a people can make, and what a thing is worth ------------------------------
  // (known: what a people knows — its arts, f.tech.known, { art: the day it was learned } —, or null for none: the catalog is
  // asked with it, never reads a people itself)
  const knowsMat = (m, known) => { const t = M[m] && M[m].tech; return !t || !!(known && known[t]); };
  // can a people with these arts make this kind of thing at all (its own art: the bow, the bronze of a sword)?
  It.can = (kind, known) => { const k = K[kind]; return !!k && (!k.tech || !!(known && known[k.tech])) && k.mats.some(m => knowsMat(m, known)); };
  // the best material of a kind a people with these arts knows (the last of its materials it knows), or null
  It.bestMat = function (kind, known) { const k = K[kind]; if (!k) return null; for (let i = k.mats.length - 1; i >= 0; i--) if (knowsMat(k.mats[i], known)) return k.mats[i]; return null; };
  // the thing of that kind a people would make — its canonical key in the best material it knows —, or null if it cannot (the art
  // only: what a people makes and carries is asked of what it has, It.bestOf with the world's materials — 20h, D-442)
  It.best = (kind, known) => (It.can(kind, known) ? It.keyOf(kind, It.bestMat(kind, known)) : null);
  // the best material of a kind among those a caller allows (ok: material → true or false — the materials a people has had, asked
  // of the world by whoever asks: the catalog never reads a people), or null
  It.bestOf = function (kind, ok) { const k = K[kind]; if (!k) return null; for (let i = k.mats.length - 1; i >= 0; i--) if (ok(k.mats[i])) return k.mats[i]; return null; };
  // may a people with these arts make this very thing (the kind's art and the material's)?
  It.knows = function (key, known) { const d = It.def(key); return !!d && d.coisa && It.can(d.kind, known) && knowsMat(d.mat, known); };
  // what a thing counts as in a people's store: { k: the good, n: how much of it } — its own good (bem/vale), or what it is
  // made of (feito) —, or null for what the store does not keep (a good of the economy is itself)
  // (the first of what it is made of: It.feitoDe has them all — a stone axe is stone and wood)
  It.bemOf = function (key) { const L = It.feitoDe(key); return L && L.length ? { k: L[0].k, n: L[0].n } : null; };
  // what a thing is made of, by its material (20h, D-442, nada vem do nada): what making it takes from a store and what it gives
  // back there — a list of { k: the good, n: how much, of: the part of the good it is (the metal of a store's tools and weapons) }.
  // A thing of bronze or iron is one of the store's tools or weapons of that metal (bem, vale; the forge made it of its metal); a
  // thing of leather is the hide of the store (couro); a thing of stone or wood is the stone and the wood of the store — the
  // wicker and the cord are the fibres of the wood (the thin shoots and the inner bark of what is felled), never a good of their
  // own; a thing that is no good of the store says it (feito)
  const PLAIN = {
    machado: { stone: 0.5, wood: 0.5 }, picareta: { stone: 0.5, wood: 0.5 }, pa: { wood: 1 }, enxada: { wood: 1 }, foice: { stone: 0.25, wood: 0.25 },
    martelo: { stone: 0.5, wood: 0.25 }, faca: { stone: 0.25 }, vara: { wood: 0.5 }, rede: { wood: 1 }, remo: { wood: 1 },
    lanca: { stone: 0.25, wood: 0.75 }, clava: { wood: 1 }, arco: { wood: 1 }, flecha: { stone: 0.0125, wood: 0.0125 }, funda: { wood: 0.25 }, escudo: { wood: 1 },
    caneca: { wood: 0.1 }, bola: { wood: 0.1 }, grilhoes: { wood: 0.1 }, // (22c: a cup carved of wood; the withies of a ball, the cord of a binding)
    prato: { wood: 0.15 }, // (P7: a plate turned of wood)
  };
  const HIDE = { elmo: 1, couraca: 3, bola: 0.15 };
  // (a thing of the beast's hide and gut and of wood: the instruments — P7, D-764 — the hide of the store and its wood)
  const BEAST = { lira: { couro: 0.1, wood: 0.3 }, tambor: { couro: 0.3, wood: 0.6 } };
  // (the fired clay of a thing is the pottery's ware of the store — the good ceramica: 22c, D-612)
  const CLAY = { caneca: 0.25, prato: 0.3 };
  // (the loom's wool of a rag is the store's cloth — tecido; the bones of a carcass and a twist of straw are no good of a store: what
  // they are made of is nothing it keeps — P7, D-805)
  const CLOTH = { pano: 0.05 };
  const NOGOOD = { osso: 1, palha: 1 };
  It.METALS = { bronze: 1, ferro: 1 };
  const feitoCache = new Map();
  It.feitoDe = function (key) {
    if (feitoCache.has(key)) return feitoCache.get(key);
    const d = It.def(key); let out = null;
    if (d && !d.coisa) out = [{ k: d.id, n: 1, of: null }];
    else if (d) {
      if (It.METALS[d.mat] && d.bem && d.vale > 0) out = [{ k: d.bem, n: d.vale, of: d.mat }];
      else if (d.mat === 'couro' && BEAST[d.kind]) out = Object.keys(BEAST[d.kind]).map(g => ({ k: g, n: BEAST[d.kind][g], of: null }));
      else if (d.mat === 'couro' && HIDE[d.kind]) out = [{ k: 'couro', n: HIDE[d.kind], of: null }];
      else if (d.mat === 'barro' && CLAY[d.kind]) out = [{ k: 'ceramica', n: CLAY[d.kind], of: null }];
      else if (d.mat === 'la' && CLOTH[d.kind]) out = [{ k: 'tecido', n: CLOTH[d.kind], of: null }];
      else if (NOGOOD[d.mat]) out = [];
      else if (d.feito) out = Object.keys(d.feito).map(g => ({ k: g, n: d.feito[g], of: null }));
      else if (PLAIN[d.kind]) out = Object.keys(PLAIN[d.kind]).map(g => ({ k: g, n: PLAIN[d.kind][g], of: null }));
      if (out) { for (const o of out) Object.freeze(o); Object.freeze(out); }
    }
    feitoCache.set(key, out); return out;
  };
  // the kinds a store's good can become (ferramentas → the tools, armas → the weapons; wood → the staff, the torch…)
  It.fromBem = g => Object.keys(K).filter(kind => K[kind].bem === g || (!K[kind].bem && K[kind].feito && K[kind].feito[g] > 0));
  // kilos of n of a key (a thing's or a good's own weight)
  It.peso = (key, n) => { const d = It.def(key); return d ? d.peso * (n === undefined ? 1 : n) : 0; };
  // what a thing is worth in coins: what it counts as in the store, at the economy's price (0 where there is none)
  It.valor = function (key) { const L = It.feitoDe(key); const P = G.Eco && G.Eco.PRICE; if (!L || !P) return 0; let v = 0; for (const o of L) v += o.n * (P[o.k] || 0); return +v.toFixed(2); };
  // what a thing is good for, said ('derrubar árvores, golpear')
  It.usos = key => { const d = It.def(key); return d ? d.tags.map(t => It.TAG_NOME[t] || t).filter((t, i, a) => a.indexOf(t) === i) : []; };
  // the place it is put away when the hands let it go (costas or cinto, or null: it goes to the bag), the hand it is held in
  // (mao, or outra: the shield, the bow, the torch, the basket), the place it is worn (cabeca, corpo)
  It.guarda = key => { const d = It.def(key); return d ? d.guarda || null : null; };
  It.mao = key => { const d = It.def(key); return d ? d.maoSlot || null : null; };
  It.veste = key => { const d = It.def(key); return d ? d.veste || null : null; };

  // (the table is read, never written: frozen, so a module that writes it fails loudly, at once — the guard's rule 130)
  for (const kind in K) { Object.freeze(K[kind].slots); Object.freeze(K[kind].tags); Object.freeze(K[kind].mats); if (K[kind].feito) Object.freeze(K[kind].feito); Object.freeze(K[kind]); }
  Object.freeze(K); for (const m in M) Object.freeze(M[m]); Object.freeze(M);
  Object.freeze(It.SLOTS); Object.freeze(It.SLOT_NOME);
})(window.G);
