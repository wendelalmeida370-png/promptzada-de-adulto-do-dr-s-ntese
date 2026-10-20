'use strict';
// ============================================================
//  The furniture of the interiors (data). Each piece is a thing
//  of the world, not a picture: its size in metres, whether it
//  blocks the way, how many sleep on it, where one stands to use
//  it (its spots) and, for what keeps things, which of the
//  world's own stores it shows — the house's pantry, coins and
//  goods, the building's inventory, the people's stock shared
//  among its stores, the crates of a quay. A piece never keeps
//  anything of its own: there is one store, and it is the
//  world's (C1's single store interface takes over dep/key).
//    w across its front, d deep, h high (m); low: one lies or
//    sits on it (not walked over); tall: not under a window;
//    wall: stands with its back to a wall; places: sleepers;
//    job: a work station of the building's trade.
// ============================================================
(function (G) {
  const In = G.Interiors;
  // spots in the piece's own frame: across (a, −w/2..w/2) and out from its front (n, + toward the user)
  const front = (use, n) => it => [{ use, a: 0, n: it.d / 2 + (n || 0.45) }];
  // (a bed is got into from its foot or from either long side — one of them free is enough; a sleeping bench from its front,
  // before any of its sleepers)
  const lie = (k, bench) => it => {
    const out = []; for (let q = 0; q < k; q++) out.push({ use: 'deitar', a: -it.w / 2 + it.w * (q + 0.5) / k, n: 0, on: 1 });
    if (bench) for (let q = 0; q < k; q++) out.push({ use: 'acesso', a: -it.w / 2 + it.w * (q + 0.5) / k, n: it.d / 2 + 0.35 });
    else { out.push({ use: 'acesso', a: 0, n: it.d / 2 + 0.35 }); out.push({ use: 'acesso', a: -(it.w / 2 + 0.35), n: 0.25 }); out.push({ use: 'acesso', a: it.w / 2 + 0.35, n: 0.25 }); }
    return out;
  };
  In.SPOTS = { front, lie }; // (for the pieces other files add: int-civicos.js)
  In.addItems({
    // ---- sleeping ----
    'cama-casal': { name: 'Cama de casal', w: 1.4, d: 1.95, h: 0.55, low: 1, wall: 1, rot: 1, places: 2, spots: lie(2) },
    cama: { name: 'Cama', w: 0.9, d: 1.95, h: 0.5, low: 1, wall: 1, rot: 1, places: 1, spots: lie(1) },
    // (leva: what a household takes with it when it leaves — the house left behind keeps the rest)
    esteira: { name: 'Esteira', w: 0.72, d: 1.8, h: 0.06, low: 1, wall: 1, rot: 1, places: 1, leva: 1, spots: lie(1) },
    // (the couple's mat, or the pallet two share where there are no beds)
    'esteira-casal': { name: 'Esteira de casal', w: 1.25, d: 1.85, h: 0.08, low: 1, wall: 1, rot: 1, places: 2, leva: 1, spots: lie(2) },
    // (the sleeping bench along the long wall of a northern house: one sleeper every 0.7 m of it)
    'banco-cama': { name: 'Banco-cama', w: 0, d: 0.85, h: 0.45, low: 1, wall: 1, per: 0.7, spots: it => { const k = Math.max(1, Math.floor(it.w / 0.7 + 1e-6)); return lie(k, 1)(it); } },
    berco: { name: 'Berço', w: 0.55, d: 0.95, h: 0.5, low: 1, wall: 1, places: 0, leva: 1, spots: front('cuidar') },
    // ---- fire and food ----
    // (the long hearth of the open hall: stone-lined, along the room; one cooks at either end of it)
    lar: { name: 'Lar', w: 0.8, d: 1.2, h: 0.25, solid: 1, fire: 1, free: 1, spots: it => [{ use: 'cozinhar', a: 0, n: it.d / 2 + 0.45 }, { use: 'cozinhar', a: 0, n: -(it.d / 2 + 0.45) }] },
    fogao: { name: 'Fogão de parede', w: 1.2, d: 0.6, h: 0.9, solid: 1, fire: 1, wall: 1, tall: 1, spots: front('cozinhar') },
    forno: { name: 'Forno de pão', w: 0.9, d: 0.9, h: 1.1, solid: 1, fire: 1, wall: 1, tall: 1, spots: front('assar') },
    // (the small clay stove of a poor house: a pot over the coals)
    fogareiro: { name: 'Fogareiro de barro', w: 0.6, d: 0.6, h: 0.5, solid: 1, fire: 1, wall: 1, leva: 1, spots: front('cozinhar', 0.4) },
    braseiro: { name: 'Braseiro', w: 0.5, d: 0.5, h: 0.6, solid: 1, fire: 1, wall: 1, leva: 1, spots: front('aquecer', 0.4) },
    mesa: { name: 'Mesa', w: 1.1, d: 0.7, h: 0.75, solid: 1, free: 1, spots: it => [{ use: 'comer', a: 0, n: it.d / 2 + 0.4 }, { use: 'comer', a: 0, n: -(it.d / 2 + 0.4) }] },
    'mesa-baixa': { name: 'Mesa baixa', w: 0.9, d: 0.6, h: 0.35, solid: 1, free: 1, spots: it => [{ use: 'comer', a: 0, n: it.d / 2 + 0.4 }, { use: 'comer', a: 0, n: -(it.d / 2 + 0.4) }] },
    banco: { name: 'Banco', w: 1.1, d: 0.35, h: 0.45, low: 1, wall: 1, spots: it => [{ use: 'sentar', a: 0, n: 0, on: 1 }, { use: 'acesso', a: 0, n: it.d / 2 + 0.35 }] },
    // ---- what keeps the house's things (the world's own: h.pantry, h.coin, h.inv) ----
    arca: { name: 'Arca', w: 0.9, d: 0.5, h: 0.55, solid: 1, wall: 1, rot: 1, leva: 1, store: { dep: 'casa', key: 'inv', cap: 12, coin: 1 }, spots: front('guardar') },
    despensa: { name: 'Prateleiras da despensa', w: 1.0, d: 0.4, h: 1.7, solid: 1, wall: 1, tall: 1, store: { dep: 'casa', key: 'pantry', cap: 30 }, spots: front('guardar') },
    // (a niche cut into a thick wall: a house of adobe or stone keeps there its box, its lamp, its few goods)
    nicho: { name: 'Nicho na parede', w: 0.6, d: 0.2, h: 0.5, y: 1.1, solid: 1, wall: 1, mount: 'nicho', store: { dep: 'casa', key: 'inv', cap: 6, coin: 1 }, spots: front('guardar', 0.35) },
    // (hung on a wall above head height: no floor taken — the shelf on pegs, the baskets of food from the beams)
    'prateleira-parede': { name: 'Prateleira na parede', w: 0.8, d: 0.25, h: 0.3, y: 1.45, solid: 1, wall: 1, mount: 'parede', store: { dep: 'casa', key: 'inv', cap: 6, coin: 1 }, spots: front('guardar', 0.35) },
    'cesto-pendurado': { name: 'Cestos pendurados', w: 0.7, d: 0.35, h: 0.5, y: 1.5, solid: 1, wall: 1, mount: 'parede', leva: 1, store: { dep: 'casa', key: 'pantry', cap: 8 }, spots: front('guardar', 0.35) },
    jarros: { name: 'Jarros', w: 0.9, d: 0.5, h: 0.75, solid: 1, wall: 1, rot: 1, leva: 1, store: { dep: 'casa', key: 'pantry', cap: 24 }, spots: front('guardar') },
    cesto: { name: 'Cestos', w: 0.7, d: 0.5, h: 0.5, solid: 1, wall: 1, rot: 1, leva: 1, store: { dep: 'casa', key: 'pantry', cap: 12 }, spots: front('guardar') },
    lenha: { name: 'Pilha de lenha', w: 1.0, d: 0.5, h: 0.9, solid: 1, wall: 1, leva: 1, spots: front('pegar') },
    tear: { name: 'Tear', w: 1.3, d: 0.8, h: 1.6, solid: 1, wall: 1, tall: 1, job: 1, spots: front('tecer', 0.5) },
    // ---- the storehouse: bays of the people's stock, shared among its stores ----
    baia: { name: 'Baia', w: 1.8, d: 1.4, h: 1.4, solid: 1, wall: 1, store: { dep: 'povo', key: 'stock', cap: 30 }, spots: front('guardar', 0.5) },
    prateleira: { name: 'Prateleira', w: 1.6, d: 0.6, h: 2.0, solid: 1, wall: 1, tall: 1, store: { dep: 'povo', key: 'stock', cap: 14 }, spots: front('guardar') },
    tulha: { name: 'Tulha de grão', w: 1.6, d: 1.2, h: 1.5, solid: 1, wall: 1, store: { dep: 'povo', key: 'stock', cap: 28, goods: ['food'] }, spots: front('guardar', 0.5) },
    pipas: { name: 'Pipas', w: 1.4, d: 0.8, h: 1.0, solid: 1, wall: 1, store: { dep: 'povo', key: 'stock', cap: 16 }, spots: front('guardar') },
    // (the harbour's loading floor by the big door: a low platform where the stevedore sets the crate down to be counted)
    estrado: { name: 'Estrado de carga', w: 1.2, d: 0.8, h: 0.2, solid: 1, low: 1, wall: 1, job: 1, spots: it => [{ use: 'entregar', a: 0, n: it.d / 2 + 0.45 }] },
    'mesa-conferencia': { name: 'Mesa de conferência', w: 1.2, d: 0.7, h: 0.8, solid: 1, free: 1, job: 1, spots: it => [{ use: 'conferir', a: 0, n: -(it.d / 2 + 0.4) }, { use: 'entregar', a: 0, n: it.d / 2 + 0.45 }] },
    // ---- the market: a stall shows the stock of its business (C1's), a counter between the seller and the buyer ----
    banca: { name: 'Banca', w: 1.6, d: 0.8, h: 0.9, solid: 1, free: 1, job: 1, show: 1, across: 'comprar', store: { dep: 'predio', key: 'inv', cap: 20 }, spots: it => [{ use: 'vender', a: 0, n: -(it.d / 2 + 0.45) }, { use: 'comprar', a: 0, n: it.d / 2 + 0.5 }] },
    // (the small stall of a shop cell: room behind it for the one who sells)
    banquinha: { name: 'Banca da loja', w: 1.1, d: 0.6, h: 0.9, solid: 1, free: 1, job: 1, show: 1, across: 'comprar', store: { dep: 'predio', key: 'inv', cap: 12 }, spots: it => [{ use: 'vender', a: 0, n: -(it.d / 2 + 0.45) }, { use: 'comprar', a: 0, n: it.d / 2 + 0.5 }] },
    balcao: { name: 'Balcão', w: 1.8, d: 0.6, h: 1.0, solid: 1, wall: 0, free: 1, job: 1, show: 1, across: 'comprar', store: { dep: 'predio', key: 'inv', cap: 16 }, spots: it => [{ use: 'vender', a: 0, n: -(it.d / 2 + 0.45) }, { use: 'comprar', a: 0, n: it.d / 2 + 0.5 }] },
    // ---- the trades ----
    bancada: { name: 'Bancada', w: 1.5, d: 0.7, h: 0.85, solid: 1, wall: 1, job: 1, store: { dep: 'predio', key: 'inv', cap: 8 }, spots: front('trabalhar', 0.5) },
    'forja-fogo': { name: 'Forja', w: 1.3, d: 1.0, h: 0.85, solid: 1, fire: 1, wall: 1, tall: 1, job: 1, spots: front('forjar', 0.55) },
    bigorna: { name: 'Bigorna', w: 0.5, d: 0.5, h: 0.75, solid: 1, free: 1, spots: front('martelar', 0.5) },
    tina: { name: 'Tina de têmpera', w: 0.7, d: 0.7, h: 0.6, solid: 1, free: 1, spots: front('temperar', 0.4) },
    'roda-oleiro': { name: 'Roda de oleiro', w: 0.8, d: 0.8, h: 0.7, solid: 1, free: 1, job: 1, spots: front('tornear', 0.45) },
    'forno-olaria': { name: 'Forno de olaria', w: 1.5, d: 1.5, h: 1.6, solid: 1, fire: 1, free: 1, tall: 1, spots: front('cozer', 0.6) },
    secador: { name: 'Estante de secar', w: 1.6, d: 0.5, h: 1.6, solid: 1, wall: 1, tall: 1, store: { dep: 'predio', key: 'inv', cap: 12 }, spots: front('guardar') },
    'bancada-ourives': { name: 'Bancada de ourives', w: 1.1, d: 0.6, h: 0.8, solid: 1, wall: 1, job: 1, spots: front('lavrar', 0.45) },
    fornalha: { name: 'Fornalha', w: 0.6, d: 0.6, h: 0.9, solid: 1, fire: 1, wall: 1, spots: front('fundir', 0.45) },
    cepo: { name: 'Cepo', w: 0.7, d: 0.7, h: 0.8, solid: 1, free: 1, job: 1, spots: front('cortar', 0.45) },
    ganchos: { name: 'Ganchos da carne', w: 1.4, d: 0.4, h: 2.0, solid: 1, wall: 1, tall: 1, store: { dep: 'predio', key: 'inv', cap: 10 }, spots: front('pendurar') },
    'mesa-escriba': { name: 'Mesa do escriba', w: 1.0, d: 0.6, h: 0.75, solid: 1, wall: 1, job: 1, spots: front('escrever', 0.45) },
    cofre: { name: 'Cofre', w: 0.7, d: 0.6, h: 0.7, solid: 1, wall: 1, store: { dep: 'predio', key: 'inv', cap: 6 }, spots: front('guardar') },
    redes: { name: 'Redes e cestos', w: 1.2, d: 0.5, h: 1.4, solid: 1, wall: 1, tall: 1, job: 1, store: { dep: 'predio', key: 'inv', cap: 6 }, spots: front('remendar', 0.45) },
    // ---- what a ruin keeps of a house ----
    entulho: { name: 'Entulho', w: 1.0, d: 0.8, h: 0.4, low: 1, free: 1, spots: () => [] },
  });
})(window.G);
