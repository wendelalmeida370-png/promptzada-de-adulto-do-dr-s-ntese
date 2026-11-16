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
// ============================================================
(function (G) {
  const It = G.Itens = {};

  // ------------------------------ the kinds ------------------------------
  // tipo: ferramenta | arma | escudo | arco | municao | protecao | luz | recipiente
  // maos: hands it takes in use (2: both — the spear, the bow, the oar, the hoe…)
  // slots: where it may be (the hands — mao, the other hand — outra; stowed — costas, cinto; worn — cabeca, corpo)
  // pega: how the hand closes on it (the 3D's hold: punho a fist round a handle; duas two hands on a shaft; escudo the forearm
  //   through the straps; arco the bow hand; vara a rod's butt; tocha upright in the fist; alca a handle hanging)
  // peso: kilos; bem: the economy's good it counts as in a people's store (ferramentas, armas) and vale how many of it
  // tags: what it is good for (the activities and the fight ask the tags, never the kind)
  // mats: the materials it is made in (the first is the plainest); tech: what a people must know to make it
  // dano, alcance: a rough first measure for the fight (the fight's own module tunes them, wave 2)
  const K = It.KINDS = {
    // the tools
    machado: { nome: 'machado', plural: 'machados', tipo: 'ferramenta', maos: 1, slots: ['mao', 'costas', 'cinto'], pega: 'punho', peso: 1.8, bem: 'ferramentas', vale: 1, tags: ['cortar', 'lenha', 'golpe'], mats: ['pedra', 'bronze', 'ferro'], dano: 11, alcance: 0.75 },
    picareta: { nome: 'picareta', plural: 'picaretas', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.6, bem: 'ferramentas', vale: 1, tags: ['minerar', 'pedra', 'golpe'], mats: ['pedra', 'bronze', 'ferro'], dano: 10, alcance: 0.85 },
    pa: { nome: 'pá', plural: 'pás', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 1.9, bem: 'ferramentas', vale: 1, tags: ['cavar'], mats: ['madeira', 'bronze', 'ferro'], dano: 5, alcance: 0.9 },
    enxada: { nome: 'enxada', plural: 'enxadas', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 1.7, bem: 'ferramentas', vale: 1, tags: ['lavrar', 'cavar'], mats: ['madeira', 'bronze', 'ferro'], dano: 6, alcance: 0.95 },
    foice: { nome: 'foice', plural: 'foices', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 0.7, bem: 'ferramentas', vale: 1, tags: ['colher', 'cortar'], mats: ['pedra', 'bronze', 'ferro'], dano: 6, alcance: 0.6 },
    martelo: { nome: 'martelo', plural: 'martelos', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 1.2, bem: 'ferramentas', vale: 1, tags: ['construir', 'forjar', 'golpe'], mats: ['pedra', 'bronze', 'ferro'], dano: 8, alcance: 0.55 },
    faca: { nome: 'faca', plural: 'facas', tipo: 'ferramenta', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 0.3, bem: 'ferramentas', vale: 1, tags: ['esfolar', 'cortar', 'lutar', 'perfurar'], mats: ['pedra', 'bronze', 'ferro'], dano: 7, alcance: 0.45 },
    vara: { nome: 'vara de pescar', plural: 'varas de pescar', tipo: 'ferramenta', maos: 1, slots: ['mao', 'costas'], pega: 'vara', peso: 0.8, bem: 'ferramentas', vale: 1, tags: ['pescar'], mats: ['madeira'], tech: 'bronze' },
    rede: { nome: 'rede', plural: 'redes', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.5, bem: 'ferramentas', vale: 1, tags: ['pescar'], mats: ['corda'] },
    remo: { nome: 'remo', plural: 'remos', tipo: 'ferramenta', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.2, bem: 'ferramentas', vale: 1, tags: ['remar', 'golpe'], mats: ['madeira'], dano: 5, alcance: 1.1 },
    cajado: { nome: 'cajado', plural: 'cajados', tipo: 'ferramenta', maos: 1, slots: ['mao', 'costas'], pega: 'punho', peso: 1.1, bem: null, vale: 0, tags: ['apoio', 'golpe'], mats: ['madeira'], dano: 5, alcance: 1.0 },
    tocha: { nome: 'tocha', plural: 'tochas', tipo: 'luz', maos: 1, slots: ['outra', 'mao'], pega: 'tocha', peso: 0.6, bem: null, vale: 0, tags: ['luz', 'fogo'], mats: ['madeira'] },
    cesto: { nome: 'cesto', plural: 'cestos', tipo: 'recipiente', maos: 1, slots: ['outra', 'costas'], pega: 'alca', peso: 0.5, bem: null, vale: 0, tags: ['colher', 'levar'], mats: ['vime'] },
    balde: { nome: 'balde', plural: 'baldes', tipo: 'recipiente', maos: 1, slots: ['outra', 'mao'], pega: 'alca', peso: 0.9, bem: null, vale: 0, tags: ['agua', 'levar'], mats: ['madeira'] },
    // the weapons
    espada: { nome: 'espada', plural: 'espadas', tipo: 'arma', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 1.3, bem: 'armas', vale: 1, tags: ['lutar', 'cortar', 'perfurar'], mats: ['bronze', 'ferro'], tech: 'bronze', dano: 15, alcance: 0.9 },
    lanca: { nome: 'lança', plural: 'lanças', tipo: 'arma', maos: 2, slots: ['mao', 'costas'], pega: 'duas', peso: 2.0, bem: 'armas', vale: 1, tags: ['lutar', 'perfurar', 'cacar', 'pescar'], mats: ['pedra', 'bronze', 'ferro'], dano: 14, alcance: 1.9 },
    clava: { nome: 'clava', plural: 'clavas', tipo: 'arma', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 1.5, bem: 'armas', vale: 1, tags: ['lutar', 'golpe'], mats: ['madeira'], dano: 12, alcance: 0.75 },
    arco: { nome: 'arco', plural: 'arcos', tipo: 'arco', maos: 2, slots: ['outra', 'costas'], pega: 'arco', peso: 0.9, bem: 'armas', vale: 1, tags: ['atirar', 'cacar'], mats: ['madeira'], tech: 'arco', dano: 9, alcance: 22 },
    flecha: { nome: 'flecha', plural: 'flechas', tipo: 'municao', maos: 0, slots: [], pega: null, peso: 0.04, bem: 'armas', vale: 0.05, tags: ['municao', 'arco'], mats: ['pedra', 'bronze', 'ferro'], tech: 'arco' },
    funda: { nome: 'funda', plural: 'fundas', tipo: 'arco', maos: 1, slots: ['mao', 'cinto'], pega: 'punho', peso: 0.2, bem: 'armas', vale: 1, tags: ['atirar', 'cacar'], mats: ['corda'], dano: 7, alcance: 16 },
    escudo: { nome: 'escudo', plural: 'escudos', tipo: 'escudo', maos: 1, slots: ['outra', 'costas'], pega: 'escudo', peso: 4.0, bem: 'armas', vale: 1, tags: ['bloquear'], mats: ['madeira', 'bronze'] },
    // what is worn
    elmo: { nome: 'elmo', plural: 'elmos', tipo: 'protecao', maos: 0, slots: ['cabeca'], pega: null, peso: 1.6, bem: 'armas', vale: 1, tags: ['proteger'], mats: ['couro', 'bronze', 'ferro'], tech: 'bronze' },
    couraca: { nome: 'couraça', plural: 'couraças', tipo: 'protecao', maos: 0, slots: ['corpo'], pega: null, peso: 6.0, bem: 'armas', vale: 1, tags: ['proteger'], mats: ['couro', 'bronze', 'ferro'] },
  };
  // the materials: what they change in a thing (the weight, the bite of an edge) and how they are said
  const M = It.MATS = {
    madeira: { nome: 'de madeira', peso: 1, dano: 0.85 },
    pedra: { nome: 'de pedra', peso: 1.1, dano: 0.8 },
    vime: { nome: 'de vime', peso: 1, dano: 1 },
    corda: { nome: 'de corda', peso: 1, dano: 1 },
    couro: { nome: 'de couro', peso: 0.8, dano: 1 },
    bronze: { nome: 'de bronze', peso: 1, dano: 1, tech: 'bronze' },
    ferro: { nome: 'de ferro', peso: 1.05, dano: 1.15, tech: 'ferro' },
  };
  // the equipment's places on a body, in the order the screen lists them
  It.SLOTS = ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo'];
  It.SLOT_NOME = { mao: 'mão', outra: 'outra mão', costas: 'costas', cinto: 'cinto', cabeca: 'cabeça', corpo: 'corpo' };

  // ------------------------------ reading a key ------------------------------
  // a key: 'machado' (its plainest material) or 'machado.ferro'
  It.parse = key => { const s = String(key || ''); const i = s.indexOf('.'); return i > 0 ? [s.slice(0, i), s.slice(i + 1)] : [s, null]; };
  It.key = (kind, mat) => (mat ? kind + '.' + mat : kind);
  It.isThing = key => !!K[It.parse(key)[0]];
  // the whole description of a key — a thing of the catalog with its material, or a good of the economy as a thing one carries
  // (null for what is neither); the same object every time for the same key (read only: never written)
  const cache = new Map();
  It.def = function (key) {
    if (cache.has(key)) return cache.get(key);
    const [kind, mat0] = It.parse(key); const k = K[kind]; let d = null;
    if (k) {
      const mat = mat0 && k.mats.includes(mat0) ? mat0 : k.mats[0]; const m = M[mat] || M.madeira;
      d = Object.freeze(Object.assign({}, k, { id: It.key(kind, mat0 && k.mats.includes(mat0) ? mat0 : null), kind, mat, peso: +(k.peso * m.peso).toFixed(3), dano: k.dano ? +(k.dano * m.dano).toFixed(2) : 0, nomeMat: m.nome, tech: m.tech || k.tech || null, coisa: true }));
    } else {
      // a good of the economy (wood, food, a hide…): carried as it is, counted in units
      const E = G.Eco; const g = E && E.GOODS && E.GOODS[key];
      const base = { food: 'comida', wood: 'madeira', stone: 'pedra', water: 'água' };
      if (g || base[key]) d = Object.freeze({ id: key, kind: key, mat: null, nome: (g && g.name) || base[key], plural: (g && g.name) || base[key], tipo: 'bem', maos: 0, slots: [], pega: null, peso: G.Depot && G.Depot.kg ? G.Depot.kg(key, 1) : 1, bem: key, vale: 1, tags: ['bem'], coisa: false });
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
})(window.G);
