'use strict';
// ============================================================
//  Village: buildings, settlements, stockpile, planner, jobs,
//  housing, chronicle, milestones, births & deaths
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const V = G.Village = {};

  G.BDEF = {
    campfire: { name: 'Fogueira', w: 1, h: 1, cost: {}, work: 3, blocks: true, dropoff: true, hp: 60 },
    hut: { name: 'Cabana', w: 1, h: 1, cost: { wood: 10 }, work: 14, housing: 4, blocks: true, hp: 60 },
    house: { name: 'Casa', w: 1, h: 1, cost: { wood: 14, stone: 10 }, work: 24, housing: 6, blocks: true, hp: 110 },
    storehouse: { name: 'Armazém', w: 2, h: 2, cost: { wood: 26, stone: 6 }, work: 30, blocks: true, dropoff: true, storage: 150, hp: 140 },
    farm: { name: 'Fazenda', w: 3, h: 3, cost: { wood: 12 }, work: 10, blocks: false, hp: 60 },
    well: { name: 'Poço', w: 1, h: 1, cost: { wood: 6, stone: 12 }, work: 14, blocks: true, hp: 150 },
    workshop: { name: 'Oficina', w: 2, h: 2, cost: { wood: 30, stone: 22 }, work: 38, blocks: true, hp: 160 },
    temple: { name: 'Templo', w: 2, h: 2, cost: { wood: 28, stone: 55 }, work: 65, blocks: true, hp: 260 },
    monument: { name: 'Monumento', w: 2, h: 2, cost: { wood: 15, stone: 90 }, work: 90, blocks: true, hp: 400 },
    cemetery: { name: 'Cemitério', w: 2, h: 2, cost: {}, work: 0, blocks: false, hp: 999 },
    quartel: { name: 'Quartel', w: 2, h: 2, cost: { wood: 34, stone: 18 }, work: 40, blocks: true, hp: 220 },
    torre: { name: 'Torre de Vigia', w: 1, h: 1, cost: { wood: 18, stone: 12 }, work: 22, blocks: true, hp: 180 },
    cercado: { name: 'Cercado', w: 2, h: 2, cost: { wood: 18 }, work: 14, blocks: false, hp: 90 },
    ruin: { name: 'Ruínas', w: 1, h: 1, cost: {}, work: 0, blocks: false, hp: 1 },
  };
  G.BDESC = {
    campfire: 'O coração do acampamento. Ponto de encontro, depósito e abrigo para quem não tem casa.',
    hut: 'Abrigo simples de palha e madeira. Abriga uma pequena família.',
    house: 'Casa de pedra e madeira. Mais espaço, mais resistente ao fogo.',
    storehouse: 'Guarda comida, madeira e pedra. Aumenta a capacidade de estoque.',
    farm: 'Campos de trigo. Plantar, esperar, colher. A chuva ajuda muito.',
    well: 'Água limpa: menos doenças e baldes para apagar incêndios.',
    workshop: 'Ferramentas melhores (+15% de trabalho) e casas de pedra.',
    temple: 'Onde rezam para você. Gera fé continuamente.',
    monument: 'Um monumento ao deus da ilha. Marca uma vila desenvolvida.',
    cemetery: 'Onde descansam os que partiram.',
    quartel: 'Armas e treino: guerreiros mais fortes e mais bem protegidos.',
    torre: 'Arqueiros vigiam a vila e atiram flechas em invasores.',
    cercado: 'Paliçada onde os cativos são mantidos à noite. Fugir fica mais difícil.',
    ruin: 'Restos do que existiu aqui.',
  };
  G.ROLE = {
    lenhador: ['Lenhador', 'Lenhadora'], coletor: ['Coletor', 'Coletora'], agricultor: ['Agricultor', 'Agricultora'],
    construtor: ['Construtor', 'Construtora'], mineiro: ['Mineiro', 'Mineira'], cacador: ['Caçador', 'Caçadora'],
    sacerdote: ['Sacerdote', 'Sacerdotisa'], anciao: ['Ancião', 'Anciã'], crianca: ['Criança', 'Criança'], bebe: ['Bebê', 'Bebê'],
    guerreiro: ['Guerreiro', 'Guerreira'], cativo: ['Cativo', 'Cativa'],
  };
  G.roleName = v => {
    if (!v.captive && G.Army) { const t = G.Army.title(v); if (t) return t; }
    if (!v.captive && v.role === 'guerreiro' && G.Siege) { const u = G.Siege.unitName(v); if (u) return u; }
    const r = G.ROLE[v.captive ? 'cativo' : v.role] || G.ROLE.coletor; return r[v.g === 'f' ? 1 : 0];
  };
  G.ERAS = ['Acampamento', 'Aldeia', 'Povoado', 'Comunidade Agrícola', 'Vila Artesã', 'Vila Sagrada', 'Vila Desenvolvida', 'Pequena Civilização'];

  // ------------------------------ time ------------------------------
  G.isNight = () => { const t = G.S.time; return t > 0.73 || t < 0.02; };
  G.isEvening = () => { const t = G.S.time; return t > 0.6 && t <= 0.73; };
  G.person = id => G.S.villagers.get(id) || G.S.dead.get(id);

  // ------------------------------ chronicle ------------------------------
  V.log = function (text, icon, x, y) {
    // (two systems telling the same thing the same day: once is enough)
    const H = G.S.history; for (let k = H.length - 1, m = 0; k >= 0 && m < 30; k--, m++) { if (H[k].d !== G.S.day) break; if (H[k].txt === text) return; }
    const e = { d: G.S.day, txt: text, ic: icon || 'info', n: G.S.logN = (G.S.logN || 0) + 1 };
    if (Number.isFinite(x) && Number.isFinite(y)) { e.x = +x.toFixed(1); e.y = +y.toFixed(1); }
    G.S.history.push(e);
    if (G.S.history.length > 700) G.S.history.splice(0, G.S.history.length - 700);
    G.UI && G.UI.onLog(e);
  };
  V.notice = function (text, icon) { G.UI && G.UI.notice(text, icon); };
  V.milestone = function (key, title, sub, icon) {
    const S = G.S; if (S.milestones[key]) return;
    S.milestones[key] = S.day;
    G.UI && G.UI.toast(title, sub, icon || 'star');
    G.Audio && G.Audio.play('milestone');
  };

  // ------------------------------ buildings ------------------------------
  // (a log of a grown tree cleared for a work, into its people's store: born of the world, in the ledger — up to the
  // store's room, and counted in the town's tally, as the store's own count always did. A work of a bigger step takes it into
  // itself while it still needs wood — the timber of its lot goes into it, D-120)
  function clearing(fid, work) {
    const D = G.Depot; if (!D || !G.Fac.get(fid)) return;
    const to = work && D.exists('o:' + work.id) && D.room('o:' + work.id, 'wood') >= 1 ? 'o:' + work.id : 'f:' + fid;
    const r = D.make(to, 'wood', 1, { code: 'clareira', part: true }); if (r.ok && G.S.stats) G.S.stats.woodProduced += r.n;
  }
  // step: the step of the type's ladder it is raised at (G.Escala, D-106) — its lot (n × n tiles) and its bill; absent, the
  // classic step, the size of the type's table
  V.addBuilding = function (type, x, y, setId, built, step) {
    const S = G.S; const def = G.BDEF[type]; const st = step || G.Escala.classic(type); const bill = G.Escala.bill(type, st);
    const b = {
      id: S.nextId++, type, x, y, w: st.n, h: st.n, built: !!built, progress: built ? 1 : 0,
      need: Object.assign({ wood: 0, stone: 0 }, built ? {} : bill.cost), incoming: Object.fromEntries(Object.keys(Object.assign({ wood: 0, stone: 0 }, bill.cost)).map(k => [k, 0])),
      hp: def.hp, maxHp: def.hp, set: setId, blocks: def.blocks, v: Math.floor(G.R() * 3), born: S.day, burnHp: 0,
      style: G.Civ.idOfFac(V.facOfSet(setId)) || null, // architecture of the people who built it
      esc: st.id, // (its step of the ladder: the lot's size, the bill — written here only, D-106)
      ip: null, // (the record of its plan: what its builders knew and where they built, and the facts of its life — interiors.js)
    };
    if (type === 'farm') b.crops = Array.from({ length: 9 }, () => ({ s: 0, g: 0, c: 0 }));
    if (type === 'cemetery') b.graves = [];
    S.buildings.set(b.id, b);
    // (a bigger step of a public work breaks the rocks of its lot, the stone into the work — D-121)
    const big = !built && st.n !== G.Escala.n0(type) && publicWork(type); const rocks = [];
    for (let ty = y; ty < y + b.h; ty++) for (let tx = x; tx < x + b.w; tx++) {
      const i = ty * N + tx;
      S.occ[i] = b.id;
      // (a grown tree where the work goes is a log for the store — born of the world, in the ledger)
      const tid = S.treeAt[i]; if (tid) { const t = S.trees.get(tid); if (t) { G.Nature.removeTree(t); if (t.stage === 'grow' && t.size > 0.5) clearing(V.facOfSet(setId), st.n !== G.Escala.n0(type) ? b : null); G.FX && G.FX.poof(tx + 0.5, ty + 0.5, '#6d8f3c'); } }
      const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid); if (bu) G.Nature.removeBush(bu); else if (big) { const rk = S.rocks.get(oid); if (rk) { rocks.push(rk.stone || 0); G.Nature.removeRock(rk); } } }
    }
    W.touchWalk();
    resPlaced(b); // (a lot kept for a great work: its work founded on it, or anything else put down on it, lets it go — D-121)
    // (the walls keep the towns' ways: a gate where one now shuts a building of its town off — before the plan is frozen, on the
    // ground as it will be, L-382)
    G.Siege && G.Siege.placed(b);
    unburyBeasts(b);
    G.Interiors && G.Interiors.found(b); // (the plan's record, frozen the day it is placed)
    if (!built) V.brickSwap(b); // (where its people builds with brick, part of the stone is brick: D-075)
    for (const n of rocks) quarry(V.facOfSet(setId), b, n);
    return b;
  };
  // (a beast where a lot that blocks now stands — a house, a granary, a theatre raised over it, or the new part of a building
  // grown — steps out to the nearest ground it stands on, from where it reaches its home (Animals.aside), within reach of the
  // lot's edge: one in the middle of a lot of 40 m is five tiles from it. It stayed inside for good — twelve beasts in a
  // theatre of the metrópole, a buffalo in a granary, a cat in a market, L-629. tiles: only those, when the lot grew)
  function unburyBeasts(b, tiles) {
    if (!b.blocks || !G.Animals || !G.Animals.aside) return;
    const S = G.S; const r = Math.ceil(Math.max(b.w, b.h) / 2) + 2;
    for (const a of S.animals.values()) {
      const tx = Math.floor(a.x), ty = Math.floor(a.y);
      if (tx < b.x || tx >= b.x + b.w || ty < b.y || ty >= b.y + b.h || (tiles && !tiles.has(ty * N + tx))) continue;
      G.Animals.aside(a, r);
    }
  }
  // (the stone of a rock broken on a work's lot: into the work while it needs stone, the rest to its people's store — born of the
  // world, in the ledger)
  function quarry(fid, work, n) {
    const D = G.Depot; if (!D || !(n > 0)) return;
    const w = 'o:' + work.id; const m = D.exists(w) ? Math.min(n, D.room(w, 'stone')) : 0;
    if (m > 1e-6) D.make(w, 'stone', m, { code: 'pedreira', part: true });
    if (n - m > 1e-6 && G.Fac.get(fid)) D.make('f:' + fid, 'stone', n - m, { code: 'pedreira', part: true });
  }

  // ------------------------------ the brick of the works (D-075) ------------------------------
  // where a people builds with brick — the sun-dried adobe of the Nile and of the lakes, the fired brick of the Greeks and the
  // Romans (G.Eco.BRICK) — and its town has a pottery standing (or the bricks in its store), a work founded there takes part
  // of its stone as brick, a unit for a unit (the work's total does not change: the progress the materials allow is the
  // same): the houses most, the halls of work and of trade half, the temples and palaces less — their noble stone stays —, and
  // none where only stone serves (a well, a tower, a quay, an aqueduct, a wall, the fields). Decided once, at the foundation
  // or when a reform begins (V.refound), and kept on the work: b.brick = { k, n, day }
  const BRICK_SHARE = { house: 0.6, sobrado: 0.6, insula: 0.6, quarteirao: 0.6, storehouse: 0.5, celeiro: 0.5, armazem: 0.5, workshop: 0.5, mercado: 0.5, taverna: 0.5, olaria: 0.5, tecelagem: 0.5, acougue: 0.5, estabulo: 0.5, sericultura: 0.5, salga: 0.5, forja: 0.4, ourives: 0.4, quartel: 0.4, administracao: 0.4, coletoria: 0.4, paco: 0.4, banhos: 0.4, cadeia: 0.3, temple: 0.3, biblioteca: 0.3, teatro: 0.3, palacio: 0.3, grande_palacio: 0.3, palacio_colossal: 0.3, maravilha: 0.3 };
  V.BRICK_SHARE = BRICK_SHARE;
  const potteryIn = setId => { for (const o of G.S.buildings.values()) if (o.set === setId && o.type === 'olaria' && o.built) return true; return false; };
  // (the brick a town's works would take — its people's, with a pottery of the town standing or bricks in the store —, or null)
  const brickOf = setId => {
    const fid = V.facOfSet(setId); const k = G.Eco && G.Eco.brickOf ? G.Eco.brickOf(fid) : null; if (!k) return null;
    const f = G.Fac.get(fid); return potteryIn(setId) || (f && (f.stock[k] || 0) >= 1) ? k : null;
  };
  V.brickSwap = function (b) {
    if (!b || b.built || b.brick || !b.need) return null;
    const share = BRICK_SHARE[b.type] || 0; if (!(share > 0)) return null;
    const k = brickOf(b.set); if (!k) return null;
    const n = Math.floor((b.need.stone || 0) * share); if (n < 1) return null;
    b.need.stone -= n; b.need[k] = (b.need[k] || 0) + n; if (!b.incoming) b.incoming = {}; if (b.incoming[k] === undefined) b.incoming[k] = 0;
    b.brick = { k, n, day: G.S.day };
    return b.brick;
  };
  // the bill of a work begun again in place (a hut rebuilt as a house, a house raised a floor): what its type costs, the brick
  // decided anew
  V.refound = function (b) {
    b.need = Object.assign({ wood: 0, stone: 0 }, G.Escala.billOf(b).cost); b.incoming = { wood: 0, stone: 0 }; b.brick = null; b.troca = null;
    V.brickSwap(b);
  };
  // a material a work still needs traded for another on the way — the quay finished in stone where the people has no timber
  // (naval.js): what the work costs and what it still needs change together, kept on the work (b.troca: what each material
  // went up or down by), so that what it got stays what the ledger brought it. The need alone changed made wood come into the
  // work with no line and stone vanish in it, L-416. → whether it traded
  V.swapBill = function (b, from, n, to, m) {
    if (!b || b.built || !b.need || !(n > 0) || !(m >= 0)) return false;
    b.need[from] = (b.need[from] || 0) - n; b.need[to] = (b.need[to] || 0) + m;
    const t = b.troca || (b.troca = {}); t[from] = (t[from] || 0) - n; t[to] = (t[to] || 0) + m;
    if (!b.incoming) b.incoming = {}; if (b.incoming[to] === undefined) b.incoming[to] = 0;
    return true;
  };
  // what a work's bill is: its type's cost, with the brick that took the place of stone and the materials traded on the way
  V.bill = function (b) {
    const out = Object.assign({}, G.Escala.billOf(b).cost);
    if (b.brick && b.brick.n > 0) { out.stone = Math.max(0, (out.stone || 0) - b.brick.n); out[b.brick.k] = (out[b.brick.k] || 0) + b.brick.n; }
    if (b.troca) for (const k in b.troca) { const d = b.troca[k]; if (typeof d === 'number' && isFinite(d)) out[k] = Math.max(0, (out[k] || 0) + d); }
    return out;
  };
  // what was delivered to a work: its bill less what it still needs — what goes back to the store when the work is given
  // up (the type's cost alone would give back stone that never came, where brick took its place)
  V.delivered = function (b) {
    const bill = V.bill(b); const out = {};
    for (const k in bill) { const n = Math.max(0, (bill[k] || 0) - ((b.need && b.need[k]) || 0)); if (n > 0) out[k] = n; }
    return out;
  };
  // the work's materials, a holder of the depot ('o', the work's id): what came to a site and is not built in yet — its bill
  // less what it still needs —, so that what the builders and the god's body bring to a work, and what comes back of one
  // let go, is in the ledger with its cause: nothing a work got is lost, or born, with no line (L-246). A work takes only
  // what it still needs; what is taken from it is needed again — always, so that what it holds is always its bill less its
  // need (the work that stands has its need cleared after: completeBuilding). (Registered with the first world: the depot,
  // activity.js, loads after this file)
  const r4 = x => Math.round(x * 1e4) / 1e4;
  const isSite = b => !!b && !b.built && !!b.need && b.type !== 'ruin';
  const SITE = {
    obj: id => { const b = G.S.buildings.get(id); return isSite(b) ? b : null; },
    get: (b, k) => V.delivered(b)[k] || 0,
    room: (b, k) => Math.max(0, b.need[k] || 0),
    take: (b, k, n) => { b.need[k] = r4((b.need[k] || 0) + n); },
    put: (b, rec) => { b.need[rec.k] = r4(Math.max(0, (b.need[rec.k] || 0) - rec.n)); },
    list: b => V.delivered(b),
    owner: b => ({ fac: V.facOfSet(b.set), bld: b.id }),
    place: b => b,
    all: () => { const out = []; for (const b of G.S.buildings.values()) if (isSite(b)) out.push(b); return out; },
  };
  G.worldHooks.push(() => { if (G.Depot && G.Depot.addKind && !G.Depot.KINDS.includes('o')) G.Depot.addKind('o', SITE); });
  // what a work got goes back to its people's store, in the ledger — a work given up, a reform let go (what the store has
  // no room for is lost with its cause, as in any delivery); with its people gone, lost with the work
  V.siteBack = function (b, code) {
    const D = G.Depot; const ref = 'o:' + b.id; if (!D || !D.exists(ref)) return;
    const fid = V.facOfSet(b.set); const got = V.delivered(b);
    for (const k of Object.keys(got).sort()) {
      if (fid && D.exists('f:' + fid)) D.store(ref, fid, k, got[k], { code });
      else D.use(ref, k, got[k], { code, mine: true });
    }
  };
  // what a work got is gone with it — it burnt, it fell, it was left to the wind; or it stands, and is what it was made of
  V.siteGone = function (b, code) {
    const D = G.Depot; const ref = 'o:' + b.id; if (!D || !D.exists(ref)) return;
    D.unclaim(ref); // (and every claim on it: L-444)
    const got = V.delivered(b); for (const k of Object.keys(got).sort()) D.use(ref, k, got[k], { code, mine: true });
  };
  // what a building keeps — a house's pantry and chest, a shelf of work, a temple's treasure — is lost with it, in the ledger:
  // a ruin keeps nothing (the coins of a house have their own line). It went unwritten with a house that fell and with a town
  // left to the wind, and the ruin cleared away took it, L-377
  V.keptGone = function (b, code) {
    const D = G.Depot; if (!D || !b) return;
    const home = !!(G.BDEF[b.type] && G.BDEF[b.type].housing); const ref = (home ? 'h:' : 'b:') + b.id; if (!D.exists(ref)) return;
    D.unclaim(ref); // (the operations that held part of it back hold nothing now: L-444)
    const L = D.list(ref); for (const k of Object.keys(L).sort()) if (L[k] > 1e-6 && !(home && k === 'moedas')) D.use(ref, k, L[k], { code, mine: true });
  };
  // the town's works still waiting for this brick (what is not on its way already)
  V.brickWant = function (set, k) {
    let n = 0; const id = set && (set.id || set);
    for (const o of G.S.buildings.values()) if (o.set === id && !o.built && o.type !== 'ruin' && o.need && o.need[k] > 0) n += Math.max(0, o.need[k] - ((o.incoming && o.incoming[k]) || 0));
    return n;
  };
  // the bricks a town's works will have: the free ones in its people's store, those on the shelves of its potteries and what their
  // batches under way will still give
  function brickHave(setId, k) {
    const S = G.S, D = G.Depot, O = G.Oficio; const f = G.Fac.get(V.facOfSet(setId)); if (!f) return 0;
    let n = D ? D.free('f:' + f.id, k) : f.stock[k] || 0;
    for (const o of S.buildings.values()) {
      if (o.set !== setId || o.type !== 'olaria') continue;
      if (D) n += D.get('b:' + o.id, k);
      if (O && O.batches) for (const op of O.batches(o)) { const R = O.rx(op); if (R && R.k === k) n += Math.max(0, op.data.n - op.data.feitos - op.data.quebrados); }
    }
    return n;
  }
  // a work waiting for brick a whole day goes back to stone for what it still lacks when the bricks to come will not reach it — no
  // brick in the store, no pottery standing, or the store, the potteries' shelves and their batches under way short of what the
  // town's works wait for: the works that waited longest go back first, until the rest is covered. No work waits for ever on a
  // brick nobody makes, nor on one made a dozen a year for a town that asks a hundred — the theatre of Tenochtitlan stood 18 years
  // at 85%, 40 adobes short with 118 stone in the store, while each batch of its pottery went to the houses (L-540)
  function brickBack() {
    const S = G.S; const towns = new Map();
    const lacks = b => Math.max(0, (b.need[b.brick.k] || 0) - ((b.incoming && b.incoming[b.brick.k]) || 0));
    for (const b of S.buildings.values()) {
      if (b.built || !b.brick || !b.need || b.type === 'ruin' || !(lacks(b) > 0) || S.day - (b.brick.day || 0) < 1) continue;
      const key = b.set + ':' + b.brick.k; let t = towns.get(key); if (!t) towns.set(key, t = { set: b.set, k: b.brick.k, list: [] }); t.list.push(b);
    }
    for (const t of towns.values()) {
      let short = V.brickWant(t.set, t.k) - brickHave(t.set, t.k); if (!(short > 1e-6)) continue;
      t.list.sort((a, b) => (a.brick.day || 0) - (b.brick.day || 0) || a.id - b.id);
      for (const b of t.list) {
        if (!(short > 1e-6)) break;
        const k = t.k, left = lacks(b);
        b.need[k] -= left; b.need.stone = (b.need.stone || 0) + left; b.brick.n -= left; b.brick.back = (b.brick.back || 0) + left; short -= left;
      }
    }
  }
  V.center = b => [b.x + b.w / 2, b.y + b.h / 2];
  V.door = b => [b.x + b.w - 0.5, b.y + b.h + 0.05]; // front-left side
  V.frontTile = b => {
    const x1 = b.x + b.w - 1, y1 = b.y + b.h - 1;
    for (const [cx, cy] of [[x1, y1], [b.x, y1], [x1, b.y], [b.x, b.y]]) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = cx + dx, y = cy + dy; if ((dx || dy) && W.inb(x, y) && (x < b.x || x > x1 || y < b.y || y > y1) && W.walkable(W.idx(x, y))) return [cx + 0.5, cy + 0.5];
      }
    }
    return [x1 + 0.5, y1 + 0.5];
  };
  V.removeBuilding = function (b) {
    const S = G.S; S.buildings.delete(b.id);
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) { const i = ty * N + tx; if (S.occ[i] === b.id) S.occ[i] = 0; }
    W.touchWalk();
    G.Act && G.Act.atGone(b); // (its operations end with it, by their own rule: L-444)
    G.Court && G.Court.audGone && G.Court.audGone(b); // (and the audience in it: D-124)
  };
  V.totalCost = def => { let n = 0; for (const k in def.cost) n += def.cost[k] || 0; return n; };
  V.workOf = b => G.Escala.billOf(b).work; // (the work a building takes: its step's, D-106)
  V.nameOf = (type, b) => G.Civ.bname(type, b ? b.style : null);
  V.buildName = b => (b.upgradeFrom && !b.built ? V.nameOf(b.type, b) + ' (obra)' : V.nameOf(b.type === 'ruin' ? (b.origType || 'ruin') : b.type, b));
  // a house that serves to live in: standing, or being raised further over its family by the city (b.upgradeFrom: the old
  // house stands while the new floor goes up — as the work given up gives it back whole). The one question for sleeping at
  // home, the evening at home, the water, the family's evening, the minding of the little ones and the town's day of houses:
  // the family under the works slept outdoors with no water and no home, and nobody saw it needed a roof, L-371
  V.livable = b => !!b && b.type !== 'ruin' && !!G.BDEF[b.type] && !!G.BDEF[b.type].housing && (b.built || !!b.upgradeFrom);

  V.completeBuilding = function (b) {
    const S = G.S; b.progress = 1;
    V.siteGone(b, 'obra-feita'); // (what the work got is built in: out of its holder, in the ledger — and it needs nothing)
    b.built = true; for (const k in b.need) b.need[k] = 0; b.upgradeFrom = null;
    G.Siege && G.Siege.keepWays(b.set); // (a building of the town now, to be reached: one finished in a pocket its wall shuts gets its gate, L-382)
    G.Interiors && G.Interiors.complete(b); // (a fact of its life; a type made over — a hut become a house — a new plan)
    S.stats.built++;
    const [cx, cy] = V.center(b);
    G.FX && G.FX.complete(cx, cy, b);
    G.Audio && G.Audio.at(cx, cy, 'built', true);
    const set = S.settlements.get(b.set);
    const nm = V.buildName(b);
    // (an enlargement done, D-116: its town's own line — the type's story was told the day it first stood)
    if (b.amp && !b.amp.fim) {
      b.amp.fim = S.day; if (growing) growing.delete(b.id);
      V.log(`${set ? set.name + ' terminou' : 'Terminou'} a ampliação ${G.gen(nm) === 'a' ? 'da' : 'do'} ${nm}: agora com ${b.w * 4} metros de lado.`, b.type, cx, cy);
      V.updateEra(); return;
    }
    const firsts = {
      hut: ['firstHut', 'A primeira cabana foi construída.', 'Primeiro abrigo', 'Eles não dormem mais ao relento.'],
      storehouse: ['firstStore', 'O primeiro armazém foi construído.', 'Armazém', 'Agora conseguem guardar muito mais.'],
      farm: ['firstFarm', 'A primeira fazenda foi construída.', 'Primeira fazenda', 'A agricultura chegou à ilha.'],
      well: ['firstWell', 'O primeiro poço foi cavado.', 'Poço', 'Água limpa para todos.'],
      workshop: ['firstWorkshop', 'A oficina abriu suas portas.', 'Oficina', 'Ferramentas melhores, casas de pedra.'],
      temple: ['firstTemple', 'Um templo foi erguido em sua honra.', 'Primeiro templo', 'Eles construíram um lugar para você.'],
      monument: ['firstMonument', 'O Monumento ao Deus foi concluído.', 'Monumento', 'Uma obra que vai durar gerações.'],
      house: ['firstHouse', 'A primeira casa de pedra foi construída.', 'Casa de pedra', 'A aldeia começa a mudar de cara.'],
    };
    const f = firsts[b.type];
    if (f && !S.milestones[f[0]]) {
      V.log(f[1], b.type, cx, cy);
      V.milestone(f[0], f[2], f[3], b.type);
    } else if (G.City && G.City.onComplete(b, set)) { /* the city tells its own story */ }
    else if (b.type !== 'campfire' && b.type !== 'cemetery' && !G.BDEF[b.type].housing && b.type !== 'farm') {
      V.log(`${set ? set.name + ': ' : ''}${nm} construíd${G.gen(nm)}.`, b.type, cx, cy);
    }
    if (b.type === 'campfire' && set && S.settlements.size > 1 && !set.lit) {
      set.lit = true; V.log(`A fogueira de ${set.name} foi acesa.`, 'campfire', cx, cy);
    }
    V.updateEra();
  };

  V.damageBuilding = function (b, amount, cause) {
    if (!b || b.hp <= 0 || b.type === 'ruin' || b.type === 'cemetery') return;
    b.hp -= amount;
    if (b.hp <= 0) V.destroyBuilding(b, cause);
  };
  V.destroyBuilding = function (b, cause) {
    const S = G.S;
    const [cx, cy] = V.center(b);
    const nm = V.buildName(b);
    const set = S.settlements.get(b.set);
    // return delivered materials partially? no: destroyed
    for (const v of S.villagers.values()) {
      if (v.home === b.id) v.home = 0;
      if (v.inside === b.id) { v.inside = 0; v.sleeping = false; G.Vg.endTask(v); }
    }
    G.Court && G.Court.audGone && G.Court.audGone(b); // (the audience in a palace that falls ends with it, on the way in too: D-124)
    // (the coins kept in a house that falls are lost with it — in the ledger: the ruin is no house to hold them)
    if (G.BDEF[b.type] && G.BDEF[b.type].housing && (b.coin || 0) > 0 && G.Depot) G.Depot.use('h:' + b.id, 'moedas', b.coin, { code: 'ruina', mine: true });
    V.keptGone(b, 'ruina'); // (and what it kept, the house's pantry and chest or the shelf, L-377)
    V.siteGone(b, 'ruina'); // (and what a work had got falls with it, in the ledger)
    if (b.type === 'farm' || b.type === 'campfire') {
      V.removeBuilding(b);
      if (b.type === 'campfire' && set) set.campfire = 0;
    } else {
      // turn into ruins in place (non-blocking); what stands now is the ruin, finished or not what it was going to be (L-081)
      b.origType = b.type; b.type = 'ruin'; b.blocks = false; b.built = true; b.progress = 1; b.upgradeFrom = null; b.ruinT = G.DAY_LEN * 3; b.hp = 1; W.touchWalk();
      G.Interiors && G.Interiors.ruin(b, cause); // (its plan becomes the ruin of itself)
      G.Act && G.Act.atGone(b); // (and what was being done in it ends there: L-444)
    }
    G.FX && G.FX.collapse(cx, cy, b);
    G.Audio && G.Audio.at(cx, cy, 'collapse', true);
    G.City && G.City.onDestroyed(b);
    if (b.origType !== 'hut' || G.R() < 0.6)
      V.log(`${nm}${set ? ' de ' + set.name : ''} foi destruíd${G.gen(nm)}${cause === 'fire' ? ' pelo fogo' : cause === 'meteor' ? ' por um meteoro' : cause === 'lightning' ? ' por um raio' : cause === 'quake' ? ' pelo terremoto' : cause === 'siege' ? ' pelas máquinas de cerco' : cause === 'wave' ? ' pelo maremoto' : cause === 'lava' ? ' pela lava' : cause === 'sea' ? ' pelo mar' : cause === 'riot' ? ' pela multidão' : ''}.`, cause === 'quake' ? 'stone' : 'fire', cx, cy);
  };

  // ------------------------------ stock (each people has its own) ------------------------------
  V.facOfSet = setId => { const s = G.S.settlements.get(setId); return s ? s.fac : 0; };
  V.cap = G.perPart(function (fid) {
    let c = 80;
    for (const b of G.S.buildings.values()) if (b.built && G.BDEF[b.type].storage && V.facOfSet(b.set) === fid) c += G.BDEF[b.type].storage;
    return c;
  });
  V.addStock = function (k, n, fid) {
    const S = G.S; const f = G.Fac.get(fid); if (!f) return 0;
    // (the water of the well is drunk and cooked, not stored: whoever was carrying a jar just puts it down)
    if (!k || k === 'water' || !(n > 0)) return 0;
    const cap = V.cap(fid); const cur = f.stock[k] || 0;
    const add = Math.max(0, Math.min(n, cap - cur));
    f.stock[k] = cur + add;
    if (k === 'food') S.stats.foodProduced += add;
    if (k === 'wood') S.stats.woodProduced += add;
    if (k === 'stone') S.stats.stoneProduced += add;
    return add;
  };
  // a town whose streets reach one of its stores, or a fire of it rising (L-368)
  V.fed = function (set) {
    for (const b of G.S.buildings.values()) {
      if (b.set !== set.id || !G.BDEF[b.type] || !(b.built ? G.BDEF[b.type].dropoff : b.type === 'campfire')) continue;
      const [fx, fy] = V.frontTile(b); if (W.townReaches(set, fx, fy)) return true;
    }
    return false;
  };
  V.dropoffs = function (setId) {
    const out = [];
    for (const b of G.S.buildings.values()) if (b.built && G.BDEF[b.type].dropoff && (setId === undefined || b.set === setId)) out.push(b);
    return out;
  };
  // a tile beside a gate (open or shut, or only planned: the builders raise it later on the tiles it has): the way through it
  let gatesKey = -1, planned = new Set();
  G.worldHooks.push(() => { gatesKey = -1; planned = new Set(); }); // (a new world, or a save loaded: asked again)
  V.byGate = (x, y) => {
    const S = G.S; const key = S.walls.length * 1e6 + (S.walkVer || 0);
    if (key !== gatesKey) { gatesKey = key; planned = new Set(); for (const w of S.walls) if (!w.done) for (const g of w.gates) planned.add(g); }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (!W.inb(xx, yy)) continue; const j = yy * N + xx; const w = S.wall[j]; if (w === 2 || w === 4 || planned.has(j)) return true; }
    return false;
  };
  // (asked for someone, the nearest store that one can walk to — the nearest by the map's distance across the water was the
  // other island's, and every load of the day failed its search there, L-349 —; none reached, the nearest as before)
  V.nearestDropoff = function (x, y, setId, v) {
    let list = V.dropoffs(setId);
    if (!list.length) { const fid = V.facOfSet(setId); list = V.dropoffs().filter(b => V.facOfSet(b.set) === fid); }
    let best = null, bd = 1e9, near = null, nd = 1e9;
    for (const b of list) { const [cx, cy] = V.center(b); const d = G.dist2(x, y, cx, cy); if (d < bd) { bd = d; best = b; } if (v && d < nd) { const [fx, fy] = V.frontTile(b); if (W.reaches(v, fx, fy)) { nd = d; near = b; } } }
    return near || best;
  };

  // ------------------------------ settlements ------------------------------
  V.addSettlement = function (name, cx, cy, fac) {
    const S = G.S;
    const s = { id: S.nextId++, name, cx, cy, founded: S.day, campfire: 0, fails: 0, cemetery: 0, lit: false, fac: fac || 0, emptyT: 0, loyalty: 60 };
    S.settlements.set(s.id, s);
    return s;
  };
  V.nearSettlementName = function (x, y) {
    let best = null, bd = 1e9;
    for (const s of G.S.settlements.values()) { const d = G.dist(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    return best && bd < 16 ? best.name : null;
  };
  V.nearestSettlement = function (x, y) {
    let best = null, bd = 1e9;
    for (const s of G.S.settlements.values()) { const d = G.dist(x, y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } }
    return best;
  };
  V.pop = G.perPart(setId => { let n = 0; for (const v of G.S.villagers.values()) if (setId === undefined || v.set === setId) n++; return n; });
  V.mainSettlement = () => { let best = null, bp = -1; for (const s of G.S.settlements.values()) { const p = V.pop(s.id); if (p > bp) { bp = p; best = s; } } return best; };
  V.newSettlementName = function (fid) {
    const civ = fid ? G.Civ.idOfFac(fid) : null;
    if (civ) return G.Civ.cityName(civ);
    const used = new Set([...G.S.settlements.values()].map(s => s.name).concat(G.S.usedNames || []));
    const n = G.SETTLEMENT_NAMES.find(n => !used.has(n)) || ('Assentamento ' + (G.S.nextId % 1000));
    (G.S.usedNames = G.S.usedNames || []).push(n);
    return n;
  };

  // ------------------------------ farms ------------------------------
  V.farmTileIndex = (b, x, y) => { const lx = Math.floor(x) - b.x, ly = Math.floor(y) - b.y; return (lx >= 0 && ly >= 0 && lx < 3 && ly < 3) ? ly * 3 + lx : -1; };
  V.cropPos = (b, k) => [b.x + (k % 3) + 0.5, b.y + Math.floor(k / 3) + 0.5];
  function updateFarms(dt) {
    const S = G.S; const drought = S.weather.drought > 0;
    for (const b of S.buildings.values()) {
      if (b.type !== 'farm' || !b.built) continue;
      for (let k = 0; k < 9; k++) {
        const c = b.crops[k]; if (c.s === 0 || c.s === 3) continue;
        const [px, py] = V.cropPos(b, k); const i = W.idx(px, py);
        const rate = (1 / (G.DAY_LEN * 0.7)) * (0.55 + S.fert[i] * 0.7) * (1 + S.wet[i] * 0.9 + S.weather.rain * 0.5)
          * (drought ? 0.35 : 1) * G.Nature.zoneMul(px, py, 'fertility') * (1 + (G.Nature.zoneMul(px, py, 'growth') - 1) * 0.5) * (S.blessed ? 1.5 : 1);
        c.g = Math.min(1, c.g + rate * dt);
        c.s = c.g < 0.3 ? 1 : c.g < 1 ? 2 : 3;
      }
    }
  }

  // ------------------------------ era ------------------------------
  V.updateEra = function () {
    const S = G.S;
    for (const f of G.Fac.all()) {
      const e = G.Fac.eraOf(f.id);
      if (e <= f.era) continue;
      f.era = e;
      // the people gathers around the fire to celebrate
      for (const s of G.Fac.settlementsOf(f.id)) {
        for (const v of S.villagers.values()) if (v.set === s.id && v.age >= 3 && !v.captive && (!v.task || v.task.pri < 2) && G.dist(v.x, v.y, s.cx, s.cy) < 22) G.Vg.give(v, { type: 'celebrate', pri: 1.1, kind: 'celebrate' });
      }
      const many = G.Fac.all().length > 1;
      V.log(many ? `${f.name} alcançou uma nova era: ${G.ERAS[e]}.` : `A civilização alcançou uma nova era: ${G.ERAS[e]}.`, 'era');
      if (e > S.era) { S.era = e; V.milestone('era' + e, G.ERAS[e], many ? `${f.name} chegou primeiro.` : 'Uma nova era começou.', 'era'); }
    }
  };

  // ------------------------------ site placement ------------------------------
  // (reach, when given: only where it says — the fire of a town cut off from its stores, on its streets' side, L-368)
  // (n: the lot's side of the step it is sought for — G.Escala, D-106 —; absent, the type's own. A step of another size stands
  // on its podium: the ground's relief under its lot up to V.PODIUM, D-115)
  V.findSite = function (set, type, reach, n) {
    const S = G.S; const def0 = G.BDEF[type];
    const def = n && n !== def0.w ? Object.assign({}, def0, { w: n, h: n, podium: true }) : def0;
    // (a town with no store left to eat at — its fire and its stores taken by a disaster — asks for its fire anew, not held by what
    // the same day found while a store still stood, and looks further when its ground has no room: the ruins the disaster leaves
    // stand three days, and the ring of a fire takes no building at all — Hedeby, in the chaos of seed 13 of the generation 17, its
    // fire, its store and its dock taken by the lava of a volcano at its heart, found no tile for a fire for three days, and starved
    // with 152 of food in its people's stock)
    const bare = type === 'campfire' && def === def0 && !V.dropoffs(set.id).length;
    const nk = (def === def0 ? type : type + ':' + n) + (bare ? '!' : '');
    if (type === 'doca' && G.City) return G.City.dockSite(set);
    if (G.Eco && def === def0) { const e = G.Eco.findSite(set, type); if (e !== undefined) return e; }
    // a search that found nothing today is not repeated until tomorrow (big cities ask many times a day)
    const noSite = set._noSite || (set._noSite = {});
    if (noSite[nk] === S.day) return null;
    // (the great work the town keeps a lot for: on its lot, D-121)
    if (def !== def0) { const e = resSite(set, type, n); if (e) return e; }
    // (a palace of a step of the ladder: where the court puts it, at the step's size — court.js — and, none there, as any work)
    if (def !== def0 && G.Court && G.Court.site) { const e = G.Court.site(set, type, n); if (e) return e; }
    const field = type === 'farm' || type === 'cercado' || type === 'curral' || type === 'estabulo';
    const pop = V.pop(set.id);
    const R = G.Urban ? G.Urban.radius(set, def, pop) : Math.min(17 + (set.tier || 0) * 3 + (def.w >= 3 ? 2 : 0), Math.round(6 + Math.sqrt(pop + 1) * 1.5 + (def.w >= 3 ? 2 : 0)));
    const counts = {}; for (const b of S.buildings.values()) if (b.set === set.id) counts[b.type] = (counts[b.type] || 0) + 1;
    // (a block that finds no room in the heart settles for a lower house, wherever a family would like to live)
    let best = type === 'quarteirao' && G.Urban ? V.blockSite(set) : null;
    if (!best) best = search(set, type, def, R, field, counts, false, undefined, reach);
    // (a public work of a bigger step looks further, D-120: the ones that stand outside a town — the amphitheatre, the pyramid —
    // as far as twenty tiles past its edge, the others six and then twelve; the old quarter of a work of the type's own size, as
    // before. A bigger step opens its room by its own rules — V.openSite)
    if (def.podium && publicWork(type)) { for (const e of V.reachOf(set, type)) if (!best) best = search(set, type, def, R + e, field, counts, false); }
    else {
      // a full city puts its great buildings out by its edge, beyond the walls if need be,
      // and when even there is no room, it builds them over its own old fields and houses
      if (!best && def.civic) best = search(set, type, def, R + 6, field, counts, false);
      if (!best && def.civic && def === def0) best = search(set, type, def, R + 6, field, counts, true);
    }
    if (bare) for (const e of [6, 12]) if (!best) best = search(set, type, def, R + e, field, counts, false, undefined, reach);
    if (!best) noSite[nk] = S.day;
    return best;
  };
  // a block of a metropolis goes where the land is dear enough for it — and that heart is full: so it pulls down
  // the low houses, the gardens and the fields still standing there (L-077)
  V.blockSite = function (set) {
    const S = G.S; const noSite = set._noSite || (set._noSite = {});
    if (noSite.bloco === S.day) return null;
    const def = G.BDEF.quarteirao, dear = G.Urban.DEAR.quarteirao, R = G.Urban.radius(set, def, V.pop(set.id));
    const counts = {}; for (const b of S.buildings.values()) if (b.set === set.id) counts[b.type] = (counts[b.type] || 0) + 1;
    const best = search(set, 'quarteirao', def, R, false, counts, false, dear) || search(set, 'quarteirao', def, R, false, counts, true, dear);
    if (!best) noSite.bloco = S.day;
    return best;
  };
  // what a town may pull down for a great work (and how much it hurts to): never tall houses or anything civic;
  // a block may also take a sobrado and the gardens of the heart, and the low houses on its ring, but it must
  // bring more beds than it takes (24 of its 40)
  // — and never the town's last two farms, nor the last field of its kind (a city with no farm is a village again:
  // Argos fell to one under a block, and found no room to plough again)
  const RENEW = { farm: 1, hut: 2, house: 3 };
  const RENEW_BLOCK = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, hut: 2, house: 3, sobrado: 4 };
  const KEEP = { farm: 2, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 };
  // (a site whose work the town's streets reach: a tile round the lot that one walks, from which the town reaches — the ring of
  // V.townReachesWork, the lot not yet standing —, on a side of the lot and on the town's own ground: the map of reach steps only
  // north, south, east and west, so a corner of the ring touches no tile of the lot, and whoever comes out of a door stands on
  // the side tile itself, not beside it, as W.townReaches asks of a goal. A house of Mênfis, in the mega of the generation 14,
  // had the town only at a corner and diagonal to its one open side, a pocket of one tile between cliffs: its door went there,
  // and the family never walked out again — the envoy of the fundadores among them, L-543)
  const siteReached = (set, x, y, def) => { for (let ty = y - 1; ty <= y + def.h; ty++) for (let tx = x - 1; tx <= x + def.w; tx++) { if ((tx >= x && tx < x + def.w) === (ty >= y && ty < y + def.h)) continue; if (W.inb(tx, ty) && W.walkable(W.idx(tx, ty)) && W.reachesTownXY(tx + 0.5, ty + 0.5, set)) return true; } return false; };
  V.siteReached = siteReached; // (for the proofs: muros.js 8b)
  // (for the proofs: qa/quarteirao.js 7b — the rules one lot of a block of the heart is judged by, with renewal: the lot, or null.
  // It draws from the world's draw as the search does: a proof holds it still)
  V.blockLot = (set, x, y) => {
    const def = G.BDEF.quarteirao; const counts = {}; for (const b of G.S.buildings.values()) if (b.set === set.id) counts[b.type] = (counts[b.type] || 0) + 1;
    return search(set, 'quarteirao', def, G.Urban.radius(set, def, V.pop(set.id)), false, counts, true, G.Urban.DEAR.quarteirao, undefined, [x, y]);
  };
  function search(set, type, def, R, field, counts, renew, dear, reach, only) {
    const S = G.S; const block = renew && type === 'quarteirao'; const may = block ? RENEW_BLOCK : RENEW;
    const left = gone => { const n = {}; for (const id of gone) { const t = S.buildings.get(id).type; if (KEEP[t] && (counts[t] || 0) - (n[t] = (n[t] || 0) + 1) < KEEP[t]) return false; } return true; };
    const bad = (gone, beds) => renew && ((!gone && !block) || (gone && (gone.length > 4 || !left(gone))) || beds > (block ? 24 : 12));
    const homes = (counts.hut || 0) + (counts.house || 0) + (counts.sobrado || 0) + (counts.insula || 0) + (counts.quarteirao || 0);
    let best = null, bestSc = -1e9;
    const cxi = Math.floor(set.cx), cyi = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cxi + dx - Math.floor((def.w - 1) / 2), y = cyi + dy - Math.floor((def.h - 1) / 2);
      if (only && (x !== only[0] || y !== only[1])) continue; // (one lot only: V.blockLot)
      if (x < 2 || y < 2 || x + def.w > N - 2 || y + def.h > N - 2) continue;
      const fx = x + def.w / 2, fy = y + def.h / 2;
      const d = G.dist(fx, fy, set.cx, set.cy);
      if (d > R) continue;
      if (dear && G.Urban.valueAt(set, fx, fy) < dear) continue;
      if (reach && !reach(x, y)) continue;
      if (resOver(set, type, x, y, def.w, def.h, def.blocks)) continue; // (a lot kept for a great work — another's, or this town's for another work: D-121)
      let ok = true, trees = 0, fert = 0, gone = null, cost = 0, beds = 0, streets = false;
      for (let ty = y; ty < y + def.h && ok; ty++) for (let tx = x; tx < x + def.w; tx++) {
        const i = ty * N + tx; const t = S.type[i];
        if (renew && S.occ[i]) {
          const o = S.buildings.get(S.occ[i]);
          if (!o || !o.built || !may[o.type] || o.set !== set.id) { ok = false; break; }
          if (!gone) gone = [];
          if (!gone.includes(o.id)) { gone.push(o.id); cost += may[o.type]; beds += G.BDEF[o.type].housing || 0; }
        } else if (S.occ[i]) { ok = false; break; }
        // (a podium's lot clears its bushes, breaks its rocks into the work — D-121 — and takes the town's minor streets the ring
        // joins again, never the highway: D-120)
        if (def.podium) {
          if (t < T.SAND || S.fire[i] > 0 || S.scar[i] > G.DAY_LEN * 2 || S.wall[i] || S.road[i] >= 3) { ok = false; break; }
          if (S.road[i] || (G.City && G.City.onStreet(set, i))) streets = true;
        } else if (block) {
          // (and so does a block of the heart, keeping its bushes and rocks out: the dear heart of a metropolis is half paved
          // streets — the paving is what makes it dear —, every building in it keeps a ring that becomes a lane, and a lot with no
          // street in it was nowhere. Mênfis of the mega stood at two blocks from the year 64 to the 149, with the people and
          // the stone for seven: L-602)
          if (t < T.SAND || S.objAt[i] || S.fire[i] > 0 || S.scar[i] > G.DAY_LEN * 2 || S.wall[i] || S.road[i] >= 3) { ok = false; break; }
          if (S.road[i] || (G.City && G.City.onStreet(set, i))) streets = true;
        } else if (t < T.SAND || S.objAt[i] || S.fire[i] > 0 || S.scar[i] > G.DAY_LEN * 2 || S.wall[i] || S.road[i] >= 2 || (S.road[i] && G.City && G.City.onStreet(set, i))) { ok = false; break; }
        if (field && (t === T.SAND || t === T.ROCKY)) { ok = false; break; }
        // (never in the way of a gate: a blocking building on a tile beside one shuts it — two houses, one on each side of a gate of
        // Tenochtitlan's wall, left it a tile of nowhere, and a visitor whose host's door gave onto it was shut in there, L-348)
        if (def.blocks && V.byGate(tx, ty)) { ok = false; break; }
        if (S.treeAt[i]) trees++;
        fert += S.fert[i];
      }
      if (!ok || bad(gone, beds)) continue;
      // keep a walkable ring around blocking buildings (when renewing: no wall of buildings that stay)
      for (let ty = y - 1; ty <= y + def.h && ok; ty++) for (let tx = x - 1; tx <= x + def.w; tx++) {
        if (ty >= y && ty < y + def.h && tx >= x && tx < x + def.w) continue;
        if (!W.inb(tx, ty)) { ok = false; break; }
        const i = ty * N + tx; const o = S.occ[i];
        if (def.podium && S.type[i] >= T.SAND && S.cliff[i]) { ok = false; break; } // (a podium's ring is where one walks: no cliff — D-115)
        if (o) {
          const ob = S.buildings.get(o); if (ob && gone && gone.includes(ob.id)) continue;
          if (ob && block && ob.blocks && ob.built && ob.set === set.id && G.BDEF[ob.type].housing && may[ob.type]) { if (!gone) gone = []; gone.push(ob.id); cost += may[ob.type]; beds += G.BDEF[ob.type].housing; continue; }
          if (ob && (renew ? ob.blocks : (def.blocks || ob.blocks))) { ok = false; break; } if (ob && field && ob.type !== 'farm') { ok = false; break; }
        }
        if (def.blocks && S.type[i] < T.RIVER) { /* water side ok */ }
      }
      if (!ok || bad(gone, beds)) continue;
      const sl = W.slope(x, y, def.w, def.h);
      if (sl > (type === 'farm' ? 1.6 : def.podium ? V.PODIUM : 1.15)) continue;
      if (streets && !relinks(set, x, y, def.w, gone)) continue;
      let ideal = 3;
      if (def.housing) ideal = 2.6 + homes * (type === 'insula' || type === 'sobrado' ? 0.28 : 0.33);
      else if (G.City && G.City.IDEAL[type]) ideal = G.City.IDEAL[type];
      else if (type === 'storehouse') ideal = 3.5 + (counts.storehouse || 0) * 3;
      else if (type === 'farm') ideal = 7 + (counts.farm || 0) * 1.6;
      else if (type === 'well') ideal = 3;
      else if (type === 'workshop') ideal = 5.5;
      else if (type === 'temple') ideal = 5;
      else if (type === 'monument') ideal = 3.2;
      else if (type === 'cemetery') ideal = 8;
      else if (type === 'quartel') ideal = 6.5;
      else if (type === 'torre') ideal = Math.max(5, R * 0.75);
      else if (type === 'cercado') ideal = 6;
      // (a vila and smaller: so far from the hearth; a city: so far from where the building belongs — the port, the market, the other workshops)
      const place = G.Urban && (set.tier || 0) >= 2 ? G.Urban.siteScore(set, type, def, x, y, fx, fy, d, ideal) : -Math.abs(d - ideal) * 1.2;
      let sc = place - trees * 0.7 - sl * 1.5 + G.R() * 0.8 - cost * 2;
      if (type === 'farm') sc += (fert / 9) * 7;
      if (S.type[y * N + x] === T.SAND) sc -= 1.5;
      // (and only where the town's streets reach the work — the builders' own rule, V.townReachesWork: a tile beside the lot the
      // town reaches —; asked of the best so far only, after the draw, so that the world's draws stay as they were. The best site
      // of a house of Mênfis, in the metrópole of the generation 11, was a tile of beach between its wall and the sea, a pocket of
      // one tile: its work given up after its tries, L-349, and the same site asked again — L-465)
      if (sc > bestSc && !siteReached(set, x, y, def)) continue;
      if (sc > bestSc) { bestSc = sc; best = gone ? Object.assign([x, y], { demolish: gone }) : [x, y]; }
    }
    return best;
  }

  // ------------------------------ room for a monument (D-115) ------------------------------
  // a bigger step of a public work with no free lot of its size: the town opens room for it — it pulls down its own low houses,
  // its sobrados and its fields there (as a block of the heart does, V.blockSite: never a public building, an ínsula, a
  // workshop, nor its last two farms or the last field of a kind), up to the step's limit (V.openLimit), and moves what it pulls
  // down: each field to a lot of its own, and the families to new homes with more beds than they lose — all of it found before
  // anything comes down, or nothing comes down. The relief under the lot is the podium's (V.PODIUM: the form covers it); the ring
  // round it, where one walks, free of what stays
  V.PODIUM = 3; // (the ground's relief under a step of another size: three of the map's levels of 1.5 m — 4.5 m, D-120)
  // (how far past its edge a town looks for a bigger step of a public work, D-120: the ones that stand outside a town — the
  // amphitheatre, the pyramid: the Colosseum in its valley, Pompeii's by the wall, Giza on its plateau — as far as twenty tiles,
  // on its fields and empty ground; the others six, and with no lot there twelve)
  const FORA = { maravilha: { romano: 1, egipcio: 1 } };
  V.fora = (set, type) => !!(FORA[type] && FORA[type][G.Civ.idOfFac(set.fac) || 'classico']);
  V.reachOf = (set, type) => (V.fora(set, type) ? [20] : [6, 12]);
  // (a lot of a bigger step may take the town's minor streets — dirt and stone, never the highway — when the ring round it joins
  // again every street it cuts: the street tiles of the ring beside a street of the lot, the ends of the cut, all reach each other
  // along the ring, on tiles one walks or that come down with the lot — D-120; and a block of the heart's, L-602)
  function relinks(set, x, y, n, gone) {
    const S = G.S; const street = i => S.road[i] > 0 || !!(G.City && G.City.onStreet(set, i));
    const inLot = (tx, ty) => tx >= x && tx < x + n && ty >= y && ty < y + n; const ring = new Map();
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
      if (inLot(tx, ty) || !W.inb(tx, ty)) continue; const i = ty * N + tx; const o = S.occ[i];
      ring.set(i, W.walkable(i) || (!!o && !!gone && gone.includes(o)));
    }
    const ends = [];
    for (const [i, pass] of ring) {
      if (!street(i)) continue; const tx = i % N, ty = (i / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (inLot(tx + dx, ty + dy) && street((ty + dy) * N + tx + dx)) { if (!pass) return false; ends.push(i); break; } }
    }
    if (ends.length < 2) return true;
    const seen = new Set([ends[0]]); const st = [ends[0]];
    while (st.length) { const i = st.pop(); const tx = i % N, ty = (i / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (ty + dy) * N + tx + dx; if (!seen.has(j) && ring.get(j)) { seen.add(j); st.push(j); } } }
    return ends.every(i => seen.has(i));
  }
  V.relinks = relinks; // (for the proofs: qa/escala.js)
  const OPEN = V.OPEN = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, hut: 2, house: 3, sobrado: 4 }; // (what may come down, and how much it hurts to)
  V.openLimit = n => ({ bld: Math.max(2, n - 2), beds: 3 * n }); // (what one step may pull down: buildings, beds)
  const publicWork = type => !!G.BDEF[type] && (!!G.BDEF[type].civic || type === 'temple' || type === 'monument');
  V.opens = (type, step) => !!step && step.n !== G.Escala.n0(type) && !step.familia && publicWork(type);
  // (a lot of n × n at x, y for a step that opens room: every tile dry — the town's own low houses and fields on it come down
  // whole; own, the building being enlarged, is its own —, no wall, highway, gate, fire nor rock, the minor streets it takes joined
  // again round it (relinks); the ring round it free of a blocking building that stays (a low house of the town there comes down
  // too); within the step's limit, the farms kept; its relief within the podium, and the town's streets reaching it.
  // → { gone, beds, cost, trees, sl }, or null)
  function lotFor(set, def, x, y, own, counts, lim) {
    const S = G.S; const n = def.w;
    if (x < 2 || y < 2 || x + n > N - 2 || y + n > N - 2) return null;
    if (resOver(set, def.rt, x, y, n, n, def.blocks)) return null; // (a lot kept for another great work: D-121)
    const gone = []; let beds = 0, cost = 0, trees = 0, streets = false;
    const take = o => { if (gone.includes(o.id)) return true; if (!o.built || o.set !== set.id || !OPEN[o.type]) return false; gone.push(o.id); cost += OPEN[o.type]; beds += G.BDEF[o.type].housing || 0; return gone.length <= lim.bld && beds <= lim.beds; };
    for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) {
      const i = ty * N + tx;
      if (S.type[i] < T.SAND || S.wall[i] || S.fire[i] > 0 || S.scar[i] > G.DAY_LEN * 2 || S.road[i] >= 3) return null; // (never the highway, D-120)
      if (S.road[i] || (G.City && G.City.onStreet(set, i))) streets = true;
      // (a bush goes, as for any work; a rock is broken into the work, D-121)
      if (def.blocks && V.byGate(tx, ty)) return null;
      const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null;
      if (o && o !== own && !take(o)) return null;
      if (S.treeAt[i]) trees++;
    }
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
      if (ty >= y && ty < y + n && tx >= x && tx < x + n) continue;
      if (!W.inb(tx, ty)) return null;
      const j = ty * N + tx; if (S.type[j] >= T.SAND && S.cliff[j]) return null; // (the ring is where one walks: no cliff)
      const o = S.occ[j] ? S.buildings.get(S.occ[j]) : null;
      if (o && o !== own && o.blocks && !(G.BDEF[o.type].housing && take(o))) return null;
    }
    const left = {}; for (const id of gone) { const t = S.buildings.get(id).type; left[t] = (left[t] || 0) + 1; if (KEEP[t] && (counts[t] || 0) - left[t] < KEEP[t]) return null; }
    const sl = W.slope(x, y, n, n); if (sl > V.PODIUM) return null;
    if (streets && !relinks(set, x, y, n, gone)) return null; // (the minor streets it takes, joined again round it)
    if (!siteReached(set, x, y, def)) return null;
    return { gone, beds, cost, trees, sl };
  }
  V.lotFor = (set, type, n, x, y, own) => { // (for the proofs: qa/escala.js — the rules one lot is judged by)
    const counts = {}; for (const b of G.S.buildings.values()) if (b.set === set.id) counts[b.type] = (counts[b.type] || 0) + 1;
    return lotFor(set, Object.assign({}, G.BDEF[type], { w: n, h: n, podium: true, rt: type }), x, y, own || null, counts, V.openLimit(n));
  };
  // why a town finds no lot for a step of a type — the proofs', the developer's (D-120: a capital that does not raise its great
  // work says why, with numbers) —: every lot of n × n as far as it looks for one (V.reachOf), what bars it — water, a building
  // of another town, one of its own that stays (a public building, a workshop, an ínsula), a wall or a highway, a rock, a cliff
  // on the ring, the relief past the podium, more of its houses and fields than the step may take, the town's streets not
  // reaching it —, and the nearest dry lot with no building on it. Reads the world only. → { n, R, lots, free, why: {…}, near,
  // txt }
  const WHY = { agua: 'água', outra: 'prédio de outra cidade', fica: 'prédio da cidade que não cai', muro: 'muro ou estrada', pedra: 'pedra', penhasco: 'penhasco em volta', relevo: 'relevo além do pódio', casas: 'casas e campos demais', longe: 'longe das ruas' };
  V.landWhy = function (set, type, n) {
    const S = G.S; const lim = V.openLimit(n); const R = Math.round(G.Urban ? G.Urban.radius(set, { w: n }, V.pop(set.id)) : 20) + Math.max(...V.reachOf(set, type));
    const why = {}; for (const k in WHY) why[k] = 0; let lots = 0, free = 0, near = null; const cxi = Math.floor(set.cx), cyi = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cxi + dx - Math.floor((n - 1) / 2), y = cyi + dy - Math.floor((n - 1) / 2); const d = G.dist(x + n / 2, y + n / 2, set.cx, set.cy);
      if (d > R || x < 2 || y < 2 || x + n > N - 2 || y + n > N - 2) continue;
      lots++; const w = {}; const take = new Set(); let beds = 0, rocks = 0;
      for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
        const i = ty * N + tx; const inLot = tx >= x && tx < x + n && ty >= y && ty < y + n; const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null;
        if (!inLot) { if (S.type[i] >= T.SAND && S.cliff[i]) w.penhasco = 1; if (o && o.blocks) { if (o.set !== set.id) w.outra = 1; else if (!(OPEN[o.type] && o.built && G.BDEF[o.type].housing)) w.fica = 1; else if (!take.has(o.id)) { take.add(o.id); beds += G.BDEF[o.type].housing; } } continue; }
        if (S.type[i] < T.SAND) w.agua = 1; if (S.wall[i] || S.road[i] >= 3) w.muro = 1;
        if (S.objAt[i] && !S.bushes.has(S.objAt[i])) { w.pedra = 1; rocks++; }
        if (o) { if (o.set !== set.id) w.outra = 1; else if (!(OPEN[o.type] && o.built)) w.fica = 1; else if (!take.has(o.id)) { take.add(o.id); beds += G.BDEF[o.type].housing || 0; } }
      }
      const sl = W.slope(x, y, n, n); if (sl > V.PODIUM) w.relevo = 1;
      if (take.size > lim.bld || beds > lim.beds) w.casas = 1;
      if (!Object.keys(w).length && !siteReached(set, x, y, { w: n, h: n })) w.longe = 1;
      if (!Object.keys(w).length) free++; for (const k in w) why[k]++;
      if (!w.agua && !w.outra && !w.fica && !take.size && (!near || d < near.d)) near = { d: Math.round(d), m: Math.round(sl * 15) / 10, rocks, cliffs: !!w.penhasco };
    }
    const pc = k => Math.round(100 * why[k] / Math.max(1, lots));
    const top = Object.keys(WHY).filter(k => why[k]).sort((a, b) => why[b] - why[a]).slice(0, 4).map(k => `${pc(k)}% com ${WHY[k]}`).join(', ');
    const txt = free ? `${free} de ${lots} lotes de ${n} × ${n} casas até ${R} do centro servem` : `nenhum dos ${lots} lotes de ${n} × ${n} casas até ${R} do centro serve: ${top}` +
      (near ? `; o mais perto sem água nem prédio, a ${near.d} casas, tem ${String(near.m).replace('.', ',')} m de relevo${near.rocks ? ` e ${near.rocks} ${near.rocks > 1 ? 'pedras' : 'pedra'}` : ''}${near.cliffs ? ', penhasco em volta' : ''}` : '; nenhum seco e sem prédio');
    return { n, R, lots, free, why, near, txt };
  };
  // (where what a step pulls down goes, found before anything comes down — none of it on the work's lot nor its ring, nor on
  // another's: each field a lot of its kind, the families homes of the kind the town raises now with more beds than they
  // lose. → [[type, [x, y]]…], or null: then nothing comes down)
  function relocation(set, x0, y0, n, gone) {
    const S = G.S; const held = [[x0 - 1, y0 - 1, x0 + n + 1, y0 + n + 1]];
    const clear = (w, h) => (x, y) => !held.some(r => x - 1 < r[2] && x + w + 1 > r[0] && y - 1 < r[3] && y + h + 1 > r[1]);
    const put = t => { const d = G.BDEF[t]; const p = V.findSite(set, t, clear(d.w, d.h)); if (!p || p.demolish) return null; held.push([p[0], p[1], p[0] + d.w, p[1] + d.h]); return p; };
    const out = []; let need = 0;
    for (const id of gone.slice().sort((a, b) => a - b)) {
      const o = S.buildings.get(id); const d = G.BDEF[o.type];
      if (d.housing) { need += d.housing; continue; }
      const p = put(o.type); if (!p) return null; out.push([o.type, p]);
    }
    if (!need) return out;
    const fac = G.Fac.get(set.fac); if (!fac) return null;
    // (a block finds its own room — V.blockSite —: the families get the tallest single house the town raises)
    let t = G.City ? G.City.homeType(set, fac, G.Fac.has(fac.id, 'workshop'), fac.stock) : 'house'; if (t === 'quarteirao') t = 'insula';
    let beds = 0;
    for (let k = 0; beds <= need && k < 12; k++) { const p = put(t); if (!p) return null; const tt = G.Urban ? G.Urban.homeFor(set, t, p) : t; beds += G.BDEF[tt].housing || 0; out.push([tt, p]); }
    return beds > need ? out : null;
  }
  // the room a step opens (V.opens): the best lots of its size within the town's edge (its radius and six), those with the least
  // to pull down first — each with its moves found, the first whose fields and families have somewhere to go. → [x, y] with
  // .demolish (the ids), .moves (what goes up elsewhere) and .beds (the beds that come down), or null
  V.openSite = function (set, type, step) {
    const S = G.S; const n = step.n; const def = Object.assign({}, G.BDEF[type], { w: n, h: n, podium: true, rt: type });
    const noSite = set._noSite || (set._noSite = {}); const nk = type + ':' + n + ':abre'; if (noSite[nk] === S.day) return null;
    const pop = V.pop(set.id); const R = (G.Urban ? G.Urban.radius(set, def, pop) : 20) + Math.max(...V.reachOf(set, type)); const lim = V.openLimit(n);
    const counts = {}; for (const b of S.buildings.values()) if (b.set === set.id) counts[b.type] = (counts[b.type] || 0) + 1;
    const ideal = (G.City && G.City.IDEAL[type]) || (type === 'temple' ? 5 : 3.2);
    const cands = []; const cxi = Math.floor(set.cx), cyi = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cxi + dx - Math.floor((n - 1) / 2), y = cyi + dy - Math.floor((n - 1) / 2);
      const fx = x + n / 2, fy = y + n / 2; const d = G.dist(fx, fy, set.cx, set.cy); if (d > R) continue;
      const L = lotFor(set, def, x, y, null, counts, lim); if (!L || !L.gone.length) continue; // (a free lot is the plain search's)
      const place = G.Urban && (set.tier || 0) >= 2 ? G.Urban.siteScore(set, type, def, x, y, fx, fy, d, ideal) : -Math.abs(d - ideal) * 1.2;
      cands.push([place - L.trees * 0.7 - L.sl * 1.5 - L.cost * 2 - L.beds * 0.3, x, y, L]);
    }
    cands.sort((a, b) => b[0] - a[0] || a[2] - b[2] || a[1] - b[1]);
    for (const [, x, y, L] of cands.slice(0, 6)) { const moves = relocation(set, x, y, n, L.gone); if (moves) return Object.assign([x, y], { demolish: L.gone, moves, beds: L.beds }); }
    noSite[nk] = S.day; return null;
  };

  // ------------------------------ the lot kept for a great work (D-121) ------------------------------
  // the capital of a people that knows a bigger step of a great work — the wonder, else the colossal palace —, once a city,
  // keeps the lot of that work's biggest step it can raise (or, with no room for it, of a smaller one), where the land serves —
  // dry, its relief under the podium, no building on it but the town's own fields, the ring free of what stays and of a cliff,
  // the minor streets on it joined again round it, the town's streets reaching it —, the nearest to its middle as far as its
  // radius and twenty: set.urb.res, in the save. Fields and paths may stay on it (they move when the work begins); no building
  // goes up on it: the searches leave it out, and a building put down on it all the same — the god's hand, a module that does
  // not ask — lets it go, to be kept elsewhere at the town's next look. It goes when its work is founded on it, after RES_YEARS
  // years of the town below a city, when the town is no more its people's capital or its people no more knows the work; the
  // town gone, it goes with it. Looked at once a day, by the town's planner
  V.RES_TIER = 3; V.RES_YEARS = 10; V.RES_REACH = 20;
  const RES_TYPES = ['maravilha', 'palacio_colossal'];
  const FIELDS = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 };
  // (the great work a town keeps a lot for — the first of RES_TYPES its people knows a bigger step of — and those steps, small to big)
  function resWork(set) {
    const style = G.Civ.idOfFac(set.fac) || 'classico';
    for (const t of RES_TYPES) { const steps = G.Escala.steps(t).filter(st => st.n !== G.Escala.n0(t) && !st.legado && !st.familia && G.Escala.can(t, style, st.n)); if (steps.length) return { type: t, steps }; }
    return null;
  }
  V.resWork = resWork;
  // (the town's kept lot, for the god's eyes and the proofs: its work, its step, its corner and its side in tiles — pure)
  V.reserva = set => { const r = set && set.urb && set.urb.res; return r ? { type: r.type, esc: r.esc, x: r.x, y: r.y, n: r.n } : null; };
  // (the town whose kept lot a rect of a work of type would fall on — its ring too, for a blocking one —: any but the town's own
  // for that type, and but its own fields on its own lot. → the town, or null)
  function resOver(set, type, x, y, w, h, blocks) {
    const S = G.S; if (!S || !S.settlements) return null;
    for (const s of S.settlements.values()) {
      const r = s.urb && s.urb.res; if (!r || (s === set && (r.type === type || FIELDS[type]))) continue;
      const m = blocks ? 1 : 0;
      if (x < r.x + r.n + m && x + w > r.x - m && y < r.y + r.n + m && y + h > r.y - m) return s;
    }
    return null;
  }
  V.resOver = resOver;
  // (a lot of n serves a reserve of the town: every tile on the map, dry, with no wall, highway nor fire, no building on it but
  // the town's own fields; the ring with no blocking building and no cliff on land; the relief within the podium; no other
  // town's lot over it; the minor streets on it joined again round it; the town's streets reaching it. One kept (keep) is
  // judged by what stays: a field on fire burns out, and the streets the town lays over it are joined again when the work
  // comes, or the work waits — Argos let go of its lot of 40 m for the fire in its wheat, year 21 of a life from scratch)
  function resFits(set, type, x, y, n, keep) {
    const S = G.S; if (x < 2 || y < 2 || x + n > N - 2 || y + n > N - 2) return false;
    let streets = false;
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
      const i = ty * N + tx; const inLot = tx >= x && tx < x + n && ty >= y && ty < y + n; const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null;
      if (inLot) {
        if (S.type[i] < T.SAND || S.wall[i] || S.road[i] >= 3 || (!keep && S.fire[i] > 0)) return false;
        if (o && !(FIELDS[o.type] && o.set === set.id)) return false;
        if (S.road[i] || (G.City && G.City.onStreet(set, i))) streets = true;
      } else {
        if (S.type[i] >= T.SAND && S.cliff[i]) return false;
        if (o && o.blocks) return false;
      }
    }
    if (W.slope(x, y, n, n) > V.PODIUM || resOver(set, type, x, y, n, n, true)) return false;
    if (streets && !keep && !relinks(set, x, y, n, null)) return false;
    return siteReached(set, x, y, { w: n, h: n });
  }
  // (the nearest lot of n that serves, as far as the town's radius and RES_REACH. → [x, y], or null)
  function resLot(set, type, n) {
    const R = Math.round(G.Urban ? G.Urban.radius(set, { w: n }, V.pop(set.id)) : 20) + V.RES_REACH; const cxi = Math.floor(set.cx), cyi = Math.floor(set.cy);
    let best = null, bd = 1e9;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cxi + dx - Math.floor((n - 1) / 2), y = cyi + dy - Math.floor((n - 1) / 2); const d = G.dist(x + n / 2, y + n / 2, set.cx, set.cy);
      if (d > R || d >= bd) continue;
      if (resFits(set, type, x, y, n)) { best = [x, y]; bd = d; }
    }
    return best;
  }
  const WORK_NAME = { maravilha: 'a sua maravilha', palacio_colossal: 'o palácio colossal do seu governante' };
  function letGo(set, why) { const u = set.urb; if (u && u.res) { u.res = null; u.resGone = { why, day: G.S.day }; } return null; }
  // (the town's daily look at its kept lot. → the lot, or null)
  V.reservaDia = function (set) {
    const S = G.S; const u = set.urb || (set.urb = { d: [], names: [] }); const r = u.res; const fac = G.Fac.get(set.fac);
    if (r) {
      r.chk = S.day;
      if ((set.tier || 0) >= V.RES_TIER) r.lost = 0; else if (!r.lost) r.lost = S.day;
      if (r.lost && S.day - r.lost >= V.RES_YEARS) return letGo(set, 'nivel');
      const w = resWork(set);
      if (!fac || G.Fac.capitalOf(fac.id) !== set) return letGo(set, 'capital');
      if (!w || w.type !== r.type || !w.steps.some(st => st.id === r.esc && st.n === r.n)) return letGo(set, 'povo');
      if (!resFits(set, r.type, r.x, r.y, r.n, true)) return letGo(set, 'terra');
      return r;
    }
    if ((set.tier || 0) < V.RES_TIER || !fac || G.Fac.capitalOf(fac.id) !== set) return null;
    if (u.resGone && u.resGone.day === S.day) return null; // (let go today: looked for again tomorrow)
    const w = resWork(set); if (!w) return null;
    // (its great work standing or going up, of the people: nothing to keep)
    for (const b of S.buildings.values()) if (b.type === w.type && b.type !== 'ruin' && V.facOfSet(b.set) === fac.id) return null;
    for (const st of w.steps.slice().reverse()) {
      const p = resLot(set, w.type, st.n); if (!p) continue;
      u.res = { type: w.type, esc: st.id, n: st.n, x: p[0], y: p[1], d: S.day, chk: S.day, lost: 0 };
      const cx = p[0] + st.n / 2, cy = p[1] + st.n / 2;
      V.log(`${set.name} guardou um campo de ${st.n * 4} metros a ${Math.round(G.dist(cx, cy, set.cx, set.cy))} casas do centro para ${WORK_NAME[w.type] || 'a sua grande obra'}: ali não se ergue nada.`, 'city', cx, cy);
      return u.res;
    }
    return null;
  };
  // (a building put down on a kept lot: the work of it founded on it lets it go — its job is done —, and so does any other
  // building, but the town's own fields on its own lot. Asked by V.addBuilding, for every building)
  function resPlaced(b) {
    const S = G.S; if (!S.settlements) return;
    for (const s of S.settlements.values()) {
      const r = s.urb && s.urb.res; if (!r) continue;
      if (!(b.x < r.x + r.n && b.x + b.w > r.x && b.y < r.y + r.n && b.y + b.h > r.y)) continue;
      if (b.set === s.id && FIELDS[b.type]) continue;
      letGo(s, b.set === s.id && b.type === r.type ? 'fundada' : 'ocupada');
    }
  }
  // (the lot of a step of n of the kept work on the town's lot — its corner, the step centred in it —, with the town's fields on
  // it to come down and go up elsewhere when they can. → [x, y] (.demolish, .moves), or null)
  function resSite(set, type, n) {
    const r = set.urb && set.urb.res; if (!r || r.type !== type || n > r.n) return null;
    if (!resFits(set, type, r.x, r.y, r.n)) return null;
    const x = r.x + Math.floor((r.n - n) / 2), y = r.y + Math.floor((r.n - n) / 2); const S = G.S; const gone = [];
    for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) { const o = S.occ[ty * N + tx]; if (o && !gone.includes(o)) gone.push(o); }
    if (!gone.length) return [x, y];
    const moves = relocation(set, x, y, n, gone);
    return Object.assign([x, y], { demolish: gone, moves: moves || [] });
  }
  V.resSite = resSite;

  // (at: a site chosen by the caller — for the step given with it, else the type's classic lot. Else the town tries the steps
  // of the type's ladder from the biggest it justifies and can pay for — G.Escala.choose —: the first one it finds land for
  // is raised, D-106; a step of a public work with no free lot opens its room, by its rules — V.openSite, D-115 —, and a bigger
  // step of a public work only with the stone for it, V.affords — D-120)
  V.startProject = function (set, type, at, given) {
    let pos = at, step = at && given ? given : null;
    if (!pos) for (const st of G.Escala.choose(set, type)) {
      if (st.n !== G.Escala.n0(type) && !V.affords(set, type, st)) continue;
      pos = V.findSite(set, type, undefined, st.n);
      if (!pos && V.opens(type, st)) pos = V.openSite(set, type, st);
      if (pos) { step = st; break; }
    }
    // (a wonder is its people's: with no lot by the capital, any city of its people with the land for a bigger step — its kept
    // lot, or room —, the most peopled first: the Colosseum of Rome, and the arena of Verona — D-121)
    if (!pos && !at && type === 'maravilha') {
      const fid = V.facOfSet(set.id);
      for (const o of [...G.S.settlements.values()].filter(q => q !== set && V.facOfSet(q.id) === fid && (q.tier || 0) >= V.RES_TIER).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)) {
        for (const st of G.Escala.choose(o, type)) {
          if (st.n === G.Escala.n0(type) || !V.affords(o, type, st)) continue;
          const p = V.findSite(o, type, undefined, st.n) || (V.opens(type, st) ? V.openSite(o, type, st) : null);
          if (p) { pos = p; step = st; break; }
        }
        if (pos) { set = o; break; }
      }
    }
    if (!pos) { set.fails++; return null; }
    // (a city builds tall only where its land is dear; on cheap ground the same family builds a house with a yard)
    if (G.Urban && !pos.demolish) { const t = G.Urban.homeFor(set, type, pos); if (t !== type) { type = t; step = null; } }
    if (pos.demolish) renew(set, type, pos.demolish, pos.moves);
    const b = V.addBuilding(type, pos[0], pos[1], set.id, false, step);
    if (type === 'cemetery') V.completeBuilding(b);
    G.Eco && G.Eco.onPlaced(b);
    // (what the step pulled down goes up again elsewhere: the fields on their new lots, the families' new homes)
    if (pos.moves) for (const [t, p] of pos.moves) V.startProject(set, t, p);
    return b;
  };

  // the god's hand founds a step of a type's ladder (the proofs and the developer's panel, D-106): on the nearest lot of its
  // size to the point asked (the town's middle by default) — every tile of it and of the ring round it dry, free of buildings
  // and walls, no main street nor fire on the lot; the ground's steps under it are the form's base to cover (its plinth, its
  // footing), trees and bushes go as for any work —, raised whole when asked (built). Within its radius it takes first a lot the
  // podium covers (the relief under it up to V.PODIUM, the ring with no cliff: D-115), and only with none such one steeper — the
  // nearest free lot of the metrópole's Rome was a slope of 13.5 m, its way in fitting before no street. → the building, or null
  V.handFound = function (set, type, stepId, o) {
    const S = G.S; const step = G.Escala.steps(type).find(s => s.id === stepId || s.n === stepId); if (!step || !set) return null;
    // (only a step its people knows how to raise: a form, or a plan, of its size — else there would be nothing to draw nor walk)
    if (!G.Escala.can(type, G.Civ.idOfFac(set.fac) || 'classico', step.n)) return null;
    const n = step.n; const ox = Math.floor(o && o.x !== undefined ? o.x : set.cx), oy = Math.floor(o && o.y !== undefined ? o.y : set.cy);
    const free = (x, y) => {
      for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
        if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return false; const i = ty * N + tx;
        if (S.occ[i] || S.wall[i] || S.type[i] < T.SAND) return false;
        if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0)) return false;
      }
      return true;
    };
    const flat = (x, y) => {
      if (W.slope(x, y, n, n) > V.PODIUM) return false;
      for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) if ((ty < y || ty >= y + n || tx < x || tx >= x + n) && S.cliff[ty * N + tx]) return false;
      return true;
    };
    for (const pass of [flat, null]) for (let r = 0; r <= (o && o.R || 40); r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - Math.floor(n / 2), y = oy + dy - Math.floor(n / 2);
      if (!free(x, y) || (pass && !pass(x, y))) continue;
      const b = V.startProject(set, type, [x, y], step); if (b && o && o.built && !b.built) V.completeBuilding(b);
      return b;
    }
    return null;
  };

  // ------------------------------ the enlargement (D-116) ------------------------------
  // a town grown since it raised one of its public works raises it a step up the type's ladder, in place: the same building —
  // its id, its name, its history, whoever has it for work or for palace —, its lot grown round the old one over free ground
  // or room opened by the rules of a step that opens it (lotFor, relocation), its bill what the bigger step costs more than the
  // one it had (b.troca: the part that stands is off the bill — what the work holds is still what the ledger brings it), its
  // work what is left of the bigger step's. While it grows it is a work (b.amp: the lot and step it had, the day it began).
  // One at a time — no great work of the town going up —, where the town justifies the bigger step (G.Escala.choose) and has a
  // quarter of the new part's stone in store (at most 120)
  let growing = null; // (the enlargements under way, by id: found again from the world after a new world or a load)
  G.worldHooks.push(() => { growing = null; });
  const growingNow = () => { if (!growing) { growing = new Set(); for (const b of G.S.buildings.values()) if (b.amp && !b.amp.fim && !b.built && b.type !== 'ruin') growing.add(b.id); } return growing; };
  // (the lot of n tiles round the old one: every candidate that holds it — the fewest to pull down, then the nearest to centred —,
  // with the moves of what it pulls down found. → [x, y] (.demolish, .moves when it pulls down), or null)
  V.growLot = function (set, b, step) {
    const S = G.S; const n = step.n, n0 = b.w; const def = Object.assign({}, G.BDEF[b.type], { w: n, h: n, podium: true, rt: b.type });
    const counts = {}; for (const o of S.buildings.values()) if (o.set === set.id) counts[o.type] = (counts[o.type] || 0) + 1;
    const lim = V.openLimit(n); const mx = b.x + b.w / 2, my = b.y + b.h / 2; const cands = [];
    for (let y = b.y + n0 - n; y <= b.y; y++) for (let x = b.x + n0 - n; x <= b.x; x++) {
      const L = lotFor(set, def, x, y, b, counts, lim); if (!L) continue;
      cands.push([L.cost * 2 + L.beds * 0.3 + L.sl * 1.5 + L.trees * 0.7 + (Math.abs(x + n / 2 - mx) + Math.abs(y + n / 2 - my)) * 0.3, x, y, L]);
    }
    cands.sort((p, q) => p[0] - q[0] || p[2] - q[2] || p[1] - q[1]);
    for (const [, x, y, L] of cands.slice(0, 4)) {
      if (!L.gone.length) return [x, y];
      const moves = relocation(set, x, y, n, L.gone); if (moves) return Object.assign([x, y], { demolish: L.gone, moves, beds: L.beds });
    }
    return null;
  };
  V.enlarge = function (b, step, pos) {
    const S = G.S; const set = b && S.settlements.get(b.set);
    if (!set || !b.built || b.type === 'ruin' || !step || step.n <= b.w || !pos) return null;
    const s0 = G.Escala.of(b), n0 = b.w, n = step.n; const nm = V.buildName(b);
    if (pos.demolish) renew(set, b.type, pos.demolish, pos.moves);
    b.amp = { de: n0, esc: s0.id, x: b.x, y: b.y, d: S.day };
    b.x = pos[0]; b.y = pos[1]; b.w = b.h = n; b.esc = step.id; // (its step and its lot: written here only, D-106)
    let logs = 0; const grown = new Set();
    for (let ty = b.y; ty < b.y + n; ty++) for (let tx = b.x; tx < b.x + n; tx++) {
      const i = ty * N + tx; if (S.occ[i] === b.id) continue;
      S.occ[i] = b.id; grown.add(i);
      const tid = S.treeAt[i]; if (tid) { const t = S.trees.get(tid); if (t) { G.Nature.removeTree(t); if (t.stage === 'grow' && t.size > 0.5) logs++; G.FX && G.FX.poof(tx + 0.5, ty + 0.5, '#6d8f3c'); } }
      const oid = S.objAt[i]; if (oid) { const bu = S.bushes.get(oid); if (bu) G.Nature.removeBush(bu); }
    }
    W.touchWalk();
    // (the bill of what grows: the bigger step's less the part that stands; the progress, that part's share of the work)
    const B0 = G.Escala.bill(b.type, s0), B1 = G.Escala.bill(b.type, step);
    b.built = false; b.need = { wood: 0, stone: 0 }; b.incoming = { wood: 0, stone: 0 }; b.brick = null; b.troca = {}; b.unreach = 0;
    for (const k in B1.cost) { b.need[k] = Math.max(0, B1.cost[k] - (B0.cost[k] || 0)); b.incoming[k] = 0; }
    for (const k in B0.cost) b.troca[k] = -Math.min(B0.cost[k], B1.cost[k] || 0);
    const t0 = V.totalCost(B0), t1 = V.totalCost(B1);
    b.progress = Math.min(t1 ? t0 / t1 : 0, B1.work ? B0.work / B1.work : 0);
    // (whoever was inside goes out, and what was being done there ends by its own rule: it is a work now — its plan grows with it)
    for (const v of S.villagers.values()) if (v.inside === b.id) { v.inside = 0; v.sleeping = false; G.Vg.endTask(v); }
    G.Act && G.Act.atGone(b);
    G.Siege && G.Siege.placed(b);
    unburyBeasts(b, grown); // (the beasts on its new part: L-629)
    G.Interiors && G.Interiors.resized(b, n0);
    V.brickSwap(b);
    for (let k = 0; k < logs; k++) clearing(set.fac, b); // (the timber of the new part's ground, into the work: D-120)
    growingNow().add(b.id);
    const [cx, cy] = V.center(b);
    V.log(`${set.name} começou a ampliar ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}: de ${n0 * 4} para ${n * 4} metros de lado.`, 'city', cx, cy);
    if (pos.moves) for (const [t, p] of pos.moves) V.startProject(set, t, p);
    return b;
  };
  // an enlargement the builders cannot reach (the ring of the work cut off since — a wall, the water) is given up before their
  // rule lets the whole building go with it (an unreached work is let go, villagers.js): what came for the new part goes back
  // to the store, in the ledger, and the building is again what it was, on the lot it had
  V.ungrow = function (b) {
    const S = G.S; const a = b && b.amp; if (!a || a.fim || b.built || b.type === 'ruin') return false;
    V.siteBack(b, 'obra-largada');
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) { const i = ty * N + tx; if (S.occ[i] === b.id) S.occ[i] = 0; }
    const n = b.w; b.x = a.x; b.y = a.y; b.w = b.h = a.de; b.esc = a.esc;
    for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) S.occ[ty * N + tx] = b.id;
    W.touchWalk();
    b.built = true; b.progress = 1; b.need = { wood: 0, stone: 0 }; b.incoming = { wood: 0, stone: 0 }; b.brick = null; b.troca = null; b.unreach = 0; b.amp = null;
    if (growing) growing.delete(b.id);
    for (const o of S.villagers.values()) if (o.task && o.task.type === 'build' && o.task.id === b.id) G.Vg.endTask(o);
    G.Siege && G.Siege.keepWays(b.set);
    G.Interiors && G.Interiors.resized(b, n);
    const set = S.settlements.get(b.set); const nm = V.buildName(b); const [cx, cy] = V.center(b);
    V.log(`${set ? set.name + ' desistiu' : 'Desistiram'} de ampliar ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}: ninguém chegava à obra.`, 'city', cx, cy);
    return true;
  };
  // (each time the planner plans a town: an enlargement of it its builders have failed to reach four times is given up — they
  // let a work go at six)
  V.growStuck = function (set) {
    const S = G.S; if (!growingNow().size) return;
    for (const id of [...growing]) {
      const b = S.buildings.get(id); if (!b || b.built || b.type === 'ruin' || !b.amp || b.amp.fim) { growing.delete(id); continue; }
      if (b.set === set.id && (b.unreach || 0) >= 4) V.ungrow(b);
    }
  };
  // ------------------------------ the stone a people brings in, and when it asks for a great work (D-120) ------------------------------
  // what a people's store gets of stone from its own hands — the loads its quarrymen and miners bring ('entrega') and what a
  // year of plenty adds to them ('fartura') —, counted by the ledger as it comes: f.pedra = [the day, that day's, the day
  // before's]. The year of a people is the day before (this one's, once it has passed it)
  const EARN = { entrega: 1, fartura: 1 };
  function earn(e) {
    if (e[5] !== 'stone' || !EARN[e[8]]) return; const to = e[4];
    if (typeof to !== 'string' || to.charCodeAt(0) !== 102 || to.charCodeAt(1) !== 58) return; // ('f:' + the people)
    const f = G.Fac.get(+to.slice(2)); if (!f) return; const d = G.S.day; const p = f.pedra || (f.pedra = [d, 0, 0]);
    if (p[0] !== d) { p[2] = p[0] === d - 1 ? p[1] : 0; p[0] = d; p[1] = 0; }
    p[1] += e[6];
  }
  G.worldHooks.push(() => { if (G.Depot && G.Depot.onMove && !G.Depot.onMove.includes(earn)) G.Depot.onMove.push(earn); });
  V.stoneIncome = function (fid) {
    const f = G.Fac.get(fid); const p = f && f.pedra; if (!p) return 0; const d = G.S.day;
    return p[0] === d ? Math.max(p[1], p[2]) : p[0] === d - 1 ? p[1] : 0;
  };
  // (a people's food is safe — D-102, D-120 —: its store holds two days of its eating, at two and a half a head a day, or it is nine
  // tenths full: then what holds it back is the store, not the fields)
  V.FOOD_DAYS = 2;
  V.foodSafe = function (fid) {
    const f = G.Fac.get(fid); if (!f) return false; const food = f.stock.food || 0;
    return food >= G.Fac.pop(fid) * 2.5 * V.FOOD_DAYS || food >= V.cap(fid) * 0.9;
  };
  // (a step a town can pay for, by its stone: one of its type's own size by the stone in store, as before (have: what it asked);
  // a bigger one of a public work by what it will have in V.YEARS years — the stone in store and its people's income —, past the
  // bricks the work will take (V.brickSwap) and the part of it that stands (from: the step it grows from). The work keeps the
  // stone as it comes, V.greatWork. D-120)
  V.YEARS = 20;
  V.affords = function (set, type, step, have, from) {
    const f = G.Fac.get(V.facOfSet(set.id)); if (!f || !step) return false;
    if (step.n === G.Escala.n0(type) || !publicWork(type)) return (f.stock.stone || 0) >= (have || 0);
    let stone = (G.Escala.bill(type, step).cost.stone || 0) - (from ? G.Escala.bill(type, from).cost.stone || 0 : 0);
    if (brickOf(set.id)) stone -= Math.floor(stone * (BRICK_SHARE[type] || 0));
    return (f.stock.stone || 0) + V.YEARS * V.stoneIncome(f.id) >= stone;
  };
  // (whether a town asks for a work of a type, by its stone: a step of it the town would raise it can pay for — the planners'
  // gate, city.js and court.js: have, the stone in store a step of the type's own size asks)
  V.stoneGate = (set, type, have) => G.Escala.choose(set, type).some(st => V.affords(set, type, st, have));
  // (a great work of the town going up and waiting for stone: a public work of a step of another size than its type's, or one
  // being enlarged — asked only when the town has a public work under way, c.siteTypes. → the building, or null)
  V.greatWork = function (set, c) {
    let any = false; for (const k in c.siteTypes) if (publicWork(k)) { any = true; break; } if (!any) return null;
    for (const b of G.S.buildings.values()) {
      if (b.set !== set.id || b.built || b.type === 'ruin' || !publicWork(b.type) || !(b.amp || b.w !== G.Escala.n0(b.type))) continue;
      if ((b.need.stone || 0) > ((b.incoming && b.incoming.stone) || 0) + 1e-6) return b;
    }
    return null;
  };
  // (the turn a work has with the builders who choose where to bring materials and hands — the builders' choice, villagers.js,
  // adds it to the walk to each work: a great work of the town comes before the smaller works about it as if it were V.GREAT_PRI
  // (tiles²) nearer, else every work nearer the builders took its stone and the Colosseum of Rome got none in eight years —
  // D-117 —, but only while its town is fed and housed (set.vez, the planner's: its people's food safe, nobody grown without a
  // home — D-120): a hungry or crowded town builds its fields and houses first. Nothing for any other work: with only the
  // classic steps, no turn changes)
  V.GREAT_PRI = 400;
  const great = b => !b.built && b.type !== 'ruin' && publicWork(b.type) && (!!b.amp || b.w !== G.Escala.n0(b.type));
  V.workPri = b => { if (!great(b)) return 0; const s = G.S.settlements.get(b.set); return s && s.vez ? -V.GREAT_PRI : 0; };
  // (a great work of the town under way — asked only when a public work of it is, c.siteTypes)
  const greatUp = (set, c) => { let any = false; for (const k in c.siteTypes) if (publicWork(k)) { any = true; break; } if (!any) return false; for (const b of G.S.buildings.values()) if (b.set === set.id && great(b)) return true; return false; };
  // (the turn of a town's great work, set.vez — its planner's, each time it plans it: with a great work under way, its people's
  // food safe and nobody grown of it without a home. → 1 or 0)
  V.vez = function (set, c, hi) {
    c = c || counts(set.id); hi = hi || housingInfo(set.id); const gw = greatUp(set, c);
    if (gw || set.vez) set.vez = gw && !hi.homeless && V.foodSafe(V.facOfSet(set.id)) ? 1 : 0;
    return set.vez || 0;
  };
  // (the planner's question, with nothing the town needs to live first: with no great work going up, the first public work of
  // the town that a bigger step it justifies now fits round. Nothing while only each type's classic step is known: no step
  // bigger than the one it has)
  V.grow = function (set, fac, c) {
    const S = G.S;
    if ((set.tier || 0) < 2 || (G.City && G.City.saving(set, fac))) return null;
    for (const k in c.siteTypes) if (G.BDEF[k] && G.BDEF[k].civic) return null; // (one great work at a time)
    const grows = {}; let any = false;
    for (const t in c) { if (!(c[t] > 0) || !publicWork(t)) continue; const st = G.Escala.choose(set, t)[0]; if (st && st.n > G.Escala.n0(t) && !st.familia) { grows[t] = st; any = true; } }
    if (!any) return null;
    const noSite = set._noSite || (set._noSite = {}); if (noSite.amplia === S.day) return null;
    for (const b of S.buildings.values()) {
      if (b.set !== set.id || !b.built || b.type === 'ruin' || !grows[b.type] || grows[b.type].n <= b.w) continue;
      const st = grows[b.type];
      if (!V.affords(set, b.type, st, 0, G.Escala.of(b))) continue; // (the stone of what grows, by the people's income: D-120)
      const pos = V.growLot(set, b, st); if (!pos) continue;
      return V.enlarge(b, st, pos);
    }
    noSite.amplia = S.day; return null;
  };
  // the old quarter comes down for the great work: its people look for new homes, as after a fire — or, for a step that opened
  // its room (moves: what goes up elsewhere, D-115), in the new homes the town raises for them, and its fields go elsewhere
  function renew(set, type, ids, moves) {
    const S = G.S; let homes = 0, fields = 0, houses = 0, plots = 0, cx = set.cx, cy = set.cy;
    for (const id of ids) {
      const o = S.buildings.get(id); if (!o) continue;
      let head = null;
      for (const v of S.villagers.values()) {
        if (v.home === o.id) { v.home = 0; if (!head || v.age > head.age) head = v; }
        if (v.inside === o.id) { v.inside = 0; v.sleeping = false; G.Vg.endTask(v); }
      }
      // (the family's savings do not come down with the house: the eldest carries them in his purse — with nobody, the
      // people's treasury keeps them —, in the ledger)
      if (o.coin > 0) G.Depot.move('h:' + o.id, head ? 'p:' + head.id : 'f:' + set.fac, 'moedas', o.coin, { code: 'obra-da-cidade', by: head ? head.id : 0, part: true });
      // (and what the house kept — the pantry, the chest — comes down with it, in the ledger: the family's, not the people's
      // (D-059), and the ground keeps no owner nor anyone to pick it up for the family — it went unwritten, L-377)
      V.keptGone(o, 'obra-da-cidade');
      // (and a work pulled down — a field of the town begun on its kept lot, D-121, which the great work founded there takes —:
      // what it had got goes back to its people's store, as a work given up. It vanished with the site: 4 of wood of the
      // farm#12117 of the mega of the generation 16, L-632)
      if (!o.built) V.siteBack(o, 'obra-da-cidade');
      if (o.type === 'farm') fields++; else homes++;
      if (G.BDEF[o.type] && G.BDEF[o.type].housing) houses++; else plots++;
      [cx, cy] = V.center(o);
      G.FX && G.FX.dust(cx, cy, 4);
      V.removeBuilding(o);
    }
    const nm = V.nameOf(type, { style: G.Civ.idOfFac(set.fac) });
    if (!moves) {
      const what = [homes ? (homes === 1 ? 'uma casa velha' : `${homes} casas velhas`) : '', fields ? (fields === 1 ? 'um campo' : `${fields} campos`) : ''].filter(Boolean).join(' e ');
      V.log(`${set.name} derrubou ${what} para dar lugar ${G.gen(nm) === 'a' ? 'à' : 'ao'} ${nm}.`, 'city', cx, cy); return;
    }
    const what = [houses ? (houses === 1 ? 'uma casa velha' : `${houses} casas velhas`) : '', plots ? (plots === 1 ? 'um campo' : `${plots} campos`) : ''].filter(Boolean).join(' e ');
    const nh = moves.filter(m => G.BDEF[m[0]].housing).length, nf = moves.length - nh;
    const to = [nh ? `as famílias vão morar em ${nh === 1 ? 'uma casa nova' : nh + ' casas novas'}` : '', nf ? (nf === 1 ? 'o campo vai para outro lugar' : 'os campos vão para outro lugar') : ''].filter(Boolean).join(', e ');
    V.log(`${set.name} abriu espaço para ${G.gen(nm) === 'a' ? 'a' : 'o'} ${nm}: derrubou ${what}, e ${to}.`, 'city', cx, cy);
  }

  // ------------------------------ planner ------------------------------
  function counts(setId) {
    const c = { hut: 0, house: 0, storehouse: 0, farm: 0, well: 0, workshop: 0, temple: 0, monument: 0, campfire: 0, quartel: 0, torre: 0, cercado: 0, sites: 0, siteTypes: {} };
    for (const b of G.S.buildings.values()) {
      if (b.set !== setId || b.type === 'ruin') continue;
      if (!b.built) { c.sites++; c.siteTypes[b.type] = (c.siteTypes[b.type] || 0) + 1; }
      c[b.type] = (c[b.type] || 0) + 1;
    }
    return c;
  }
  V.counts = counts;
  function globalHas(type) { for (const b of G.S.buildings.values()) if (b.type === type && b.built) return true; return false; }
  function housingInfo(setId) {
    const S = G.S; let cap = 0, homeless = 0, pop = 0;
    for (const b of S.buildings.values()) if (b.set === setId && b.built && G.BDEF[b.type].housing && b.type !== 'barraco') cap += G.BDEF[b.type].housing;
    for (const v of S.villagers.values()) if (v.set === setId && !v.captive) { pop++; if ((!v.home || (S.buildings.get(v.home) || {}).type === 'barraco') && v.age >= 16) homeless++; }
    return { cap, homeless, pop };
  }
  V.housingInfo = housingInfo;

  // what a growing town builds before any extra, and what it builds to defend itself
  const ESSENTIAL = { hut: 1, house: 1, storehouse: 1, farm: 1, well: 1, workshop: 1, praca: 1, mercado: 1, temple: 1, celeiro: 1, doca: 1 };
  const DEFENCE = { quartel: 1, torre: 1, muralha: 1, portao: 1, wall: 1, gate: 1 };
  function plan(set) {
    const S = G.S;
    const c = counts(set.id);
    const hi = housingInfo(set.id);
    const pop = hi.pop; if (pop === 0) return;
    const fac = G.Fac.get(set.fac); if (!fac) return;
    V.growStuck(set); // (an enlargement its builders cannot reach is given up before their rule takes the building: D-116)
    V.vez(set, c, hi); // (the builders' turn of a great work, V.workPri: while the town is fed and housed — D-120)
    if (!(set.urb && set.urb.resDay === S.day)) { (set.urb || (set.urb = { d: [], names: [] })).resDay = S.day; V.reservaDia(set); } // (the kept lot, once a day: D-121)
    const isMain = G.Fac.capitalOf(fac.id) === set;
    const facHas = type => G.Fac.has(fac.id, type);
    if (!c.campfire) { const b = V.startProject(set, 'campfire'); if (b) { set.campfire = b.id; } return; }
    // (a town eats at a store its streets reach: with every store and fire of it cut off by the water — Tenochtitlan, cut in two,
    // kept its fire and its quay on the far side of its houses, and a child starved at home for three days —, it lights a
    // fire on its streets' side, L-368)
    if (!V.fed(set)) { const pos = V.findSite(set, 'campfire', (x, y) => W.townReaches(set, x + 0.5, y + 0.5)); const b = pos && V.startProject(set, 'campfire', pos); if (b) set.campfire = b.id; return; }
    const maxSites = Math.min(4 + Math.max(0, (set.tier || 0) - 2) * 2, 1 + Math.floor(pop / 11));
    if (c.sites >= maxSites) return;
    const st = fac.stock; const cap = V.cap(fac.id);
    const workshop = facHas('workshop');
    const homeType = G.City ? G.City.homeType(set, fac, workshop, st) : (workshop && st.stone >= 6 ? 'house' : 'hut');
    let pendingHousing = 0; for (const k in c.siteTypes) pendingHousing += (G.BDEF[k].housing || 0) * c.siteTypes[k];
    const want = [];
    if ((hi.homeless > 0 || hi.cap - pop < 2) && hi.cap + pendingHousing < pop + 3) want.push(homeType);
    if (!c.storehouse && (pop >= 10 || S.day >= 3) && !c.siteTypes.storehouse) want.push('storehouse');
    if (c.farm === 0 && (S.day >= 4 || pop >= 13)) want.push('farm');
    else if (c.farm > 0 && c.farm * 11 < pop && !c.siteTypes.farm && st.food < pop * 8) want.push('farm');
    if (!c.well && (c.hut + c.house + (c.sobrado || 0)) >= 3) want.push('well');
    const allPop = G.Fac.pop(fac.id);
    if (isMain && !c.workshop && !workshop && c.storehouse && allPop >= 18) want.push('workshop');
    if (isMain && !c.temple && workshop && !facHas('temple') && allPop >= 26) want.push('temple');
    if (isMain && !c.monument && c.temple && facHas('temple') && allPop >= 45 && pop >= 16) want.push('monument');
    G.Politics && G.Politics.planExtra && G.Politics.planExtra(set, fac, c, want, pop);
    G.City && G.City.plan(set, fac, c, want, pop);
    G.Eco && G.Eco.plan(set, fac, c, want, pop);
    G.Harbor && G.Harbor.plan(set, fac, c, want, pop);
    if (c.storehouse && !c.siteTypes.storehouse && (st.wood > cap * 0.9 || st.food > cap * 0.9 || st.stone > cap * 0.9) && c.storehouse < 1 + Math.floor(pop / 30)) want.push('storehouse');
    // (a public work the town has outgrown goes a step up its ladder, in place — before a new great work, after what it needs to
    // live and to keep itself: D-116)
    if (!want.some(t => ESSENTIAL[t] || DEFENCE[t]) && V.grow(set, fac, c)) return;
    // the town improves what it has: an old hut becomes a stone house, stone houses grow a second
    // floor and then become apartment blocks
    const improve = () => {
      if (workshop && c.hut > 0 && !c.siteTypes.house && st.stone >= 10 && st.wood >= 14) {
        let old = null;
        for (const b of S.buildings.values()) if (b.set === set.id && b.type === 'hut' && b.built && (!old || b.born < old.born)) old = b;
        if (old) {
          old.type = 'house'; old.built = false; old.progress = 0; old.upgradeFrom = 'hut';
          V.refound(old);
          old.hp = G.BDEF.house.hp; old.maxHp = old.hp;
          return true;
        }
      }
      return !!(G.City && G.City.upgradeHomes(set, fac, c, st));
    };
    let improved = false;
    // a vila one step from city, short of stone houses: the huts are rebuilt before any extra
    const stoneHomes = (c.house || 0) + (c.sobrado || 0) + (c.insula || 0);
    // a town still on its way to city does not sink its stone into big extras (a monument, a forge,
    // a hall of scribes...) until its houses, square and temple are up — or the stone piles up
    if (G.City && G.City.saving(set, fac)) {
      for (let k = want.length - 1; k >= 0; k--) { const t = want[k], d = G.BDEF[t]; if (d && !ESSENTIAL[t] && !DEFENCE[t] && ((d.cost && d.cost.stone) || 0) >= 16) want.splice(k, 1); }
    }
    // (a great work of a bigger step going up — the town's monument, raised for years — keeps the town's stone: while it waits for
    // stone, no other extra that costs stone is begun, and what the town needs to live and to keep itself goes on. Its stone
    // went to every smaller work begun beside it, and the Colosseum of Rome got none in eight years: D-117)
    if (V.greatWork(set, c)) for (let k = want.length - 1; k >= 0; k--) { const t = want[k], d = G.BDEF[t]; if (d && !ESSENTIAL[t] && !DEFENCE[t] && ((d.cost && d.cost.stone) || 0) >= 8) want.splice(k, 1); }
    if ((set.tier || 0) === 2 && stoneHomes < 6 && c.hut > 0 && !want.some(t => ESSENTIAL[t])) { if (improve()) return; improved = true; }
    if (!want.length && !improved) { if (improve()) return; improved = true; }
    // proactive housing for growing families
    if (!want.length && hi.cap + pendingHousing < pop + 5 && c.sites === 0) want.push(homeType);
    for (const type of want) {
      if (c.siteTypes[type] && !G.BDEF[type].housing) continue;
      const def = G.BDEF[type];
      // don't open too many sites when materials are scarce
      if (c.sites > 0 && (st.wood < (def.cost.wood || 0) * 0.3 && (def.cost.wood || 0) > 0) && !(type === 'doca' && !c.doca)) continue;
      const b = V.startProject(set, type);
      if (b) return;
    }
    // what it wished for found no room (or no materials): a full town grows upwards instead
    if (!improved) improve();
  }

  // ------------------------------ jobs ------------------------------
  const BASE_ROLES = ['lenhador', 'coletor', 'agricultor', 'construtor', 'mineiro', 'cacador', 'sacerdote', 'guerreiro'];
  let WORK_ROLES = BASE_ROLES;
  // who can walk to a work — to its front, or to any free side of it (the builder's own rule, Vg.gotoB) —, and can the town
  // (its streets, W.townRegion): by the map of regions, never «the same island» (L-389)
  const ringOf = b => { const out = []; for (let y = b.y - 1; y <= b.y + b.h; y++) for (let x = b.x - 1; x <= b.x + b.w; x++) { if (y >= b.y && y < b.y + b.h && x >= b.x && x < b.x + b.w) continue; if (W.inb(x, y) && W.walkable(W.idx(x, y))) out.push([x + 0.5, y + 0.5]); } return out; };
  V.reachesWork = function (v, b) { const [fx, fy] = V.frontTile(b); return W.reaches(v, fx, fy) || ringOf(b).some(p => W.reaches(v, p[0], p[1])); };
  V.townReachesWork = function (set, b) { const [fx, fy] = V.frontTile(b); return W.townReaches(set, fx, fy) || ringOf(b).some(p => W.townReaches(set, p[0], p[1])); };
  // the works of a town its streets reach (a site across the water is none of them: it is given up after its tries, L-349)
  const townWorks = set => { const out = []; for (const b of G.S.buildings.values()) if (b.set === set.id && !b.built && b.type !== 'ruin' && V.townReachesWork(set, b)) out.push(b); return out; };
  function assignJobs(set, keep) {
    const S = G.S;
    // (the trades of the economy module load after this file)
    if (WORK_ROLES === BASE_ROLES && G.Eco) WORK_ROLES = BASE_ROLES.concat(G.Eco.JOB_ROLES);
    const adults = [];
    let pop = 0;
    for (const v of S.villagers.values()) {
      if (v.set !== set.id) continue;
      if (v.captive) { v.role = 'cativo'; continue; }
      pop++;
      const prev = v.role;
      if (v.age < 2) v.role = 'bebe';
      else if (v.age < 16) v.role = 'crianca';
      else if (v.age >= 62) { v.role = 'anciao'; if (prev !== 'anciao' && G.Life) G.Life.onRole(v, prev); }
      else { if (!WORK_ROLES.includes(v.role)) v.role = null; adults.push(v); }
    }
    const A = adults.length; if (!A) return;
    const c = counts(set.id);
    let sites = 0, matNeed = 0, woodNeed = 0, stoneNeed = 0;
    for (const b of S.buildings.values()) if (b.set === set.id && !b.built && b.type !== 'ruin') { sites++; woodNeed += b.need.wood; stoneNeed += b.need.stone; }
    matNeed = woodNeed + stoneNeed;
    const fac = G.Fac.get(set.fac); if (!fac) return;
    const cap = V.cap(fac.id); const st = fac.stock;
    let farmsBuilt = 0; for (const b of S.buildings.values()) if (b.set === set.id && b.type === 'farm' && b.built) farmsBuilt++;
    let templeBuilt = false; for (const b of S.buildings.values()) if (b.set === set.id && (b.type === 'temple') && b.built) templeBuilt = true;
    let threats = 0; for (const a of S.animals.values()) if (!a.dead && (G.Animals.danger(a) || (G.Animals.DEF[a.kind] && G.Animals.DEF[a.kind].bold > 0.3)) && G.dist(a.x, a.y, set.cx, set.cy) < 20) threats++;
    const want = {}; for (const r of WORK_ROLES) want[r] = 0;
    // workplaces: shepherds, weavers, smiths, merchants... — what they ask, under the ceiling of the trades once (D-090)
    const eco = G.Eco ? (G.Eco.share ? G.Eco.share(G.Eco.demand(set, fac, A), set, fac, A) : G.Eco.demand(set, fac, A)) : {};
    let ecoN = 0; for (const r in eco) { if (r === 'mineiro') continue; want[r] = eco[r]; ecoN += eco[r]; }
    const mineJobs = eco.mineiro || 0;
    want.sacerdote = templeBuilt ? (pop >= 45 ? 2 : 1) : 0;
    want.guerreiro = G.War.warriorWant(set, fac, A);
    // full granaries send half the farmers to the quarries and the woods (sooner in years of plenty)
    const fed = st.food > Math.max(50, G.Fac.pop(fac.id) * (S.blessed ? 5 : 7));
    want.agricultor = Math.min(farmsBuilt * (fed ? 1 : 2), Math.ceil(A * (fed ? 0.25 : 0.45)));
    want.construtor = sites ? Math.min(Math.max(1, Math.ceil(sites * 1.4) + (matNeed > 40 ? 1 : 0)), Math.max(1, Math.floor(A * 0.35))) : 0;
    // a great palace going up takes the town's hands
    G.Court && G.Court.builders(set, fac, want, A);
    want.cacador = (A >= 7 ? 1 : 0) + (A >= 22 ? 1 : 0) + Math.min(3, threats);
    const restOf = () => A - want.sacerdote - want.agricultor - want.construtor - want.cacador - want.guerreiro - ecoN;
    // at least two hands for wood and forage; the trades give way last
    const MIN_REST = A >= 30 ? 4 : A >= 18 ? 3 : A >= 12 ? 2 : 1;
    let rest = restOf();
    if (rest < MIN_REST) { want.construtor = Math.min(want.construtor, Math.max(1, Math.floor(A * 0.2))); want.cacador = Math.min(want.cacador, 1 + (threats > 1 ? 1 : 0)); rest = restOf(); }
    if (rest < MIN_REST) { want.guerreiro = Math.max(0, want.guerreiro - 1); rest = restOf(); }
    if (rest < MIN_REST) {
      // (the smugglers first — nobody is ordered into crime —, then the trades by the rule of the sharing, G.Eco.cut — D-090:
      // a trade of one hand is not cut before one of four, and the tavern, the market and the fair go last; the tavern's
      // keeper was the third to go, whatever the rest)
      if (want.contrabandista > 0) { const cut = Math.min(want.contrabandista, MIN_REST - rest); want.contrabandista -= cut; ecoN -= cut; rest += cut; }
      // (the hands a town with its food safe keeps for its open services stay, D-102)
      if (rest < MIN_REST && G.Eco && G.Eco.cut) { const cut = G.Eco.cut(want, MIN_REST - rest, G.Eco.kept ? G.Eco.kept(set, fac, want) : null); ecoN -= cut; rest += cut; }
    }
    let rocks = 0; for (const r of S.rocks.values()) if (G.dist(r.x, r.y, set.cx, set.cy) < 26) { rocks++; if (rocks > 2) break; }
    if (!rocks && G.Vg.canQuarry(set)) rocks = 1;
    // how much of each resource the whole island wants to keep in stock
    const totalPop = G.Fac.pop(fac.id);
    let allWood = 0, allStone = 0;
    for (const b of S.buildings.values()) if (!b.built && b.type !== 'ruin' && V.facOfSet(b.set) === fac.id) { allWood += b.need.wood; allStone += b.need.stone; }
    const tg = fac.targets = {
      food: Math.min(cap * 0.95, Math.max(50, totalPop * 5)),
      wood: Math.min(cap * 0.95, 45 + totalPop * 1.1 + allWood * 1.5 + (fac._rsv || 0) * 2),
      stone: Math.min(cap * 0.95, (G.Fac.has(fac.id, 'storehouse') ? 25 + totalPop * 0.6 : 8) + allStone * 1.5),
    };
    const lack = k => G.clamp((tg[k] - st[k]) / tg[k], 0, 1);
    const wF = 0.25 + lack('food') * 3;
    const wW = lack('wood') * 2.2 + (woodNeed > st.wood ? 0.8 : 0) + (fac._rsv && st.wood < fac._rsv ? 0.5 : 0);
    const wS = rocks ? lack('stone') * 2 + (stoneNeed > st.stone ? 0.6 : 0) : 0;
    const tot = wF + wW + wS;
    if (rest > 0) {
      want.coletor = Math.max(fed ? 0 : 1, Math.round(rest * wF / tot));
      want.mineiro = Math.round(rest * wS / tot);
      want.lenhador = Math.max(0, rest - want.coletor - want.mineiro);
    }
    // the mines take their crews from the quarrymen and woodcutters
    if (mineJobs) { const m = Math.min(mineJobs, want.lenhador + want.coletor - 1); if (m > 0) { want.mineiro += m; const fromL = Math.min(m, want.lenhador); want.lenhador -= fromL; want.coletor -= m - fromL; } }
    // current counts
    const have = {}; for (const r of WORK_ROLES) have[r] = [];
    const none = [];
    for (const v of adults) { if (v.role) have[v.role].push(v); else none.push(v); }
    // (the builders counted by the side of the works: a town cut in two by the water, a wall or the god, its builders on the far
    // side, had the builders it wanted counted for the whole town, and the works its streets reach stood still — L-389. A builder
    // who can walk to none of them changes trades with a forager or a woodcutter of the streets — the one nearest a work he
    // reaches, by the distance and then the id, no chance drawn —: the counts of the trades stay, and a town with no hand to
    // spare has its builder at once (with the trade left to the deficit, its foragers' want took the islet's builders and the
    // streets had none). With no such one on the streets, the builder is left without a trade, and a new builder is one who
    // reaches the works: the first of them no builder reaches, while there is one. With no work the streets reach, nothing
    // changes; and one at sea, underground or held is not judged: the map does not see where he stands. Never at a load (keep):
    // the trades come back as they were saved, and the world's own step makes the swap, as it deals the trades out, L-419)
    const works = townWorks(set); const left = new Set();
    const swapFor = () => {
      let best = null, bd = Infinity;
      for (const r of ['coletor', 'lenhador']) for (const o of have[r]) {
        if (o.aboard || o.ug || o.held || (S.avatar && o.id === S.avatar.id)) continue;
        for (const b of works) { if (!V.reachesWork(o, b)) continue; const f = V.frontTile(b); const d = G.dist(o.x, o.y, f[0], f[1]); if (d < bd || (d === bd && best && o.id < best.o.id)) { bd = d; best = { o, r }; } }
      }
      return best;
    };
    if (works.length && !keep) for (const v of have.construtor.slice()) if (!v.aboard && !v.ug && !v.held && !(S.avatar && v.id === S.avatar.id) && !works.some(b => V.reachesWork(v, b))) {
      have.construtor.splice(have.construtor.indexOf(v), 1); v.job = 0;
      const p = swapFor();
      if (p) { have[p.r].splice(have[p.r].indexOf(p.o), 1); p.o.role = 'construtor'; p.o.job = 0; have.construtor.push(p.o); v.role = p.r; have[p.r].push(v); G.Life && G.Life.onRole(p.o, p.r); G.Life && G.Life.onRole(v, 'construtor'); }
      else { v.role = null; none.push(v); left.add(v); }
    }
    let lone = null; const uncovered = () => { lone = works.find(b => !have.construtor.some(o => V.reachesWork(o, b))) || null; };
    const fits = (v, r) => r !== 'construtor' || !works.length || (lone ? V.reachesWork(v, lone) : works.some(b => V.reachesWork(v, b)));
    // unassigned first
    const deficit = () => WORK_ROLES.filter(r => have[r].length < want[r]).sort((a, b) => (have[a].length - want[a]) - (have[b].length - want[b]));
    for (const v of none) {
      if (works.length) uncovered();
      const d = deficit().filter(r => fits(v, r)); const r = d.length ? pickRoleFor(v, d) : 'coletor';
      v.role = r; have[r].push(v); G.Life && G.Life.onRole(v, left.has(v) ? 'construtor' : null);
    }
    // move surplus to deficit (max 3 changes) — never at a load (keep): the trades come back as they were saved, and the
    // world's own step deals them out anew, four seconds on (L-419)
    let changes = 0;
    while (!keep && changes < 3) {
      const d = deficit(); if (!d.length) break;
      const sur = WORK_ROLES.filter(r => have[r].length > want[r]);
      if (!sur.length) break;
      // choose surplus role with biggest surplus
      sur.sort((a, b) => (have[b].length - want[b]) - (have[a].length - want[a]));
      if (works.length) uncovered();
      const from = sur[0]; const to = pickRoleForList(have[from], d, fits); if (!to) break;
      const v = to.v; const r = to.r;
      have[from].splice(have[from].indexOf(v), 1); v.role = r; v.job = 0; have[r].push(v); changes++; G.Life && G.Life.onRole(v, from);
    }
    G.Eco && G.Eco.place(set);
  }
  function pickRoleFor(v, roles) {
    // the trade learned beside a parent comes first
    const learned = G.Life && G.Life.learned(v); if (learned && roles.includes(learned) && learned !== 'contrabandista') return learned;
    if (roles.includes('guerreiro') && v.courage > 0.55 && v.g === 'm') return 'guerreiro';
    if (roles.includes('contrabandista')) { const r = roles.filter(q => q !== 'contrabandista'); if (r.length) return pickRoleFor(v, r); }
    if (roles.includes('cacador') && v.courage > 0.6) return 'cacador';
    if (roles.includes('sacerdote') && v.traits.includes('Devoto')) return 'sacerdote';
    return roles[0];
  }
  function pickRoleForList(list, roles, fits) {
    // prefer a villager who isn't busy with a task
    let best = null, bs = -1e9;
    for (const v of list) {
      for (const r of roles) {
        let s = (v.task ? 0 : 2) + G.R();
        // (the god's body keeps its trade while the god lives it — the player's to change, as its house is (D-098): a potter of the
        // cidade, lived for a few seconds, came back a farmer, L-473. After the draw, as the next one)
        if (G.S.avatar && v.id === G.S.avatar.id) continue;
        // (one who cannot take this trade here — a builder who reaches none of the town's works, L-389 —: after the draw, so
        // the world's chance runs the same whoever is left out)
        if (fits && !fits(v, r)) continue;
        if (r === 'cacador') s += v.courage * 3;
        if (r === 'guerreiro') s += v.courage * 3 + (v.g === 'm' ? 1 : 0) + (v.kills || 0) * 0.5;
        if (r === 'sacerdote' && v.traits.includes('Devoto')) s += 3;
        if (r === 'contrabandista') s -= 20; // nobody is ordered into crime
        if (v.job && G.Eco && G.Eco.isJobRole(v.role)) s -= 1.5; // artisans keep their trade
        if (v.skill && v.skill === r) s += 2.5; if (v.skill && v.skill === v.role) s -= 2; // and the ones who learned it as children
        if (r === roles[0]) s += 1.5;
        if (s > bs) { bs = s; best = { v, r }; }
      }
    }
    return best;
  }

  // ------------------------------ housing ------------------------------
  function assignHousing(set) {
    const S = G.S;
    const homes = [];
    for (const b of S.buildings.values()) if (b.set === set.id && V.livable(b)) { b.res = 0; homes.push(b); } // (standing, or under the works: the one rule, L-371)
    const byId = new Map(homes.map(b => [b.id, b]));
    const vs = [];
    for (const v of S.villagers.values()) if (v.set === set.id) { if (v.captive) { v.home = 0; continue; } vs.push(v); }
    for (const v of vs) {
      if (v.home && !byId.has(v.home)) v.home = 0;
      if (v.home) byId.get(v.home).res++;
    }
    const space = b => G.BDEF[b.type].housing - b.res;
    const findHome = (need) => { let best = null; for (const b of homes) if (b.built && space(b) >= need && (!best || space(b) > space(best))) best = b; return best; };
    // children live with parents
    for (const v of vs) {
      if (v.age >= 16) continue;
      const m = S.villagers.get(v.mother), f = S.villagers.get(v.father);
      const h = (m && m.set === v.set && m.home) || (f && f.set === v.set && f.home) || 0;
      if (h && h !== v.home) { if (v.home && byId.get(v.home)) byId.get(v.home).res--; v.home = h; byId.get(h).res++; }
    }
    for (const v of vs) {
      if (v.age < 16) continue;
      const p = v.partner ? S.villagers.get(v.partner) : null;
      if (p && p.set === v.set) {
        if (p.home && v.home !== p.home) {
          const ph = byId.get(p.home);
          if (ph && space(ph) >= 1) { if (v.home && byId.get(v.home)) byId.get(v.home).res--; v.home = p.home; ph.res++; continue; }
        }
        if (!v.home && !p.home) { const b = findHome(2); if (b) { v.home = b.id; p.home = b.id; b.res += 2; } continue; }
      }
      if (!v.home) { const b = findHome(1); if (b) { v.home = b.id; b.res++; } }
    }
    // grown single adults move out of an overcrowded home when possible, the youngest first — never the parent the children
    // follow, the house's owner, the old one who minds the little ones there (G.Lar.minder), nor the god's body (its house is
    // the player's to leave, as in act-casa.js): D-098
    const minders = new Set(); for (const v of vs) if (v.age < 16 && v.home) { const m = S.villagers.get(v.mother), f = S.villagers.get(v.father); if (m && m.home === v.home) minders.add(m.id); else if (f && f.home === v.home) minders.add(f.id); }
    const cares = v => !!(G.Lar && G.Lar.minder && G.Lar.minder(v));
    const body = S.avatar ? S.avatar.id : 0;
    for (const b of homes) {
      if (!b.built || space(b) >= 0) continue;
      for (const v of vs.filter(o => o.home === b.id).sort((p, q) => p.age - q.age || p.id - q.id)) {
        if (v.age < 18 || v.partner || minders.has(v.id) || v.id === b.dono || v.id === body || cares(v)) continue;
        const nb = findHome(1); if (nb && nb !== b) { v.home = nb.id; nb.res++; b.res--; }
        if (space(b) >= 0) break;
      }
    }
  }

  // ------------------------------ expansion ------------------------------
  // the founders of a new village: young couples with their children first, then singles — only who the town can send, and
  // a family only whole (G.Vg.canSend: never the god's body, one in the cell, a soldier, an envoy…: L-440; qa/fundadores.js)
  V.pickFounders = function (set, pop) {
    const S = G.S;
    const members = [...S.villagers.values()].filter(v => v.set === set.id);
    const target = G.clamp(Math.round(pop * 0.33), 6, 14);
    const chosen = new Set();
    const couples = members.filter(v => v.g === 'f' && v.partner && !v.captive && v.age < 42 && S.villagers.get(v.partner));
    G.shuffle(couples);
    for (const m of couples) {
      if (chosen.size >= target) break;
      const f = S.villagers.get(m.partner); if (f.set !== set.id) continue;
      const kids = members.filter(k => (k.mother === m.id || k.father === f.id) && k.age < 16);
      if (!G.Vg.canSend(m) || !G.Vg.canSend(f) || !kids.every(k => G.Vg.canSend(k))) continue;
      chosen.add(m); chosen.add(f);
      for (const k of kids) chosen.add(k);
    }
    for (const v of G.shuffle(members.filter(v => !v.partner && !v.captive && v.age >= 17 && v.age < 32))) {
      if (chosen.size >= target) break; if (G.Vg.canSend(v)) chosen.add(v);
    }
    return chosen;
  };
  function checkExpansion() {
    const S = G.S;
    const maxSets = N >= 192 ? 24 : N >= 160 ? 19 : N >= 128 ? 14 : N >= 96 ? 9 : N >= 80 ? 7 : 5;
    if (S.settlements.size >= maxSets) return;
    for (const set of [...S.settlements.values()]) {
      // Romans and Norse spread further; capitals keep growing into cities instead of always splitting
      const ex = G.Civ.t(set.fac, 'expansion');
      if (G.Fac.settlementsOf(set.fac).length >= (ex > 1.1 ? 5 : 4) + (N >= 128 ? Math.floor(N / 48) : 0)) continue;
      const pop = V.pop(set.id);
      const cap = G.Fac.capitalOf(set.fac) === set;
      // real cities keep their people and grow up and out instead of sending settlers away
      const crowd = G.City ? G.City.crowdCap(set.id) : 48;
      let need = Math.round(Math.max((cap ? 44 : 34) / ex, (set.tier || 0) >= 3 ? crowd * 0.9 : 0));
      // a capital keeps its young couples until it is a city (unless it is bursting)
      const holding = cap && (set.tier || 0) < 3;
      if (holding) need = Math.max(need, 48);
      if (!(pop >= need || (!holding && pop >= Math.round(26 / ex) && set.fails >= 6))) continue;
      if (S.day - set.founded < 8) continue;
      if (G.R() > 0.5) continue;
      // find location
      let best = null, bs = -1e9;
      for (let y = 6; y < N - 6; y += 1) for (let x = 6; x < N - 6; x += 1) {
        const i = y * N + x; const t = S.type[i];
        if (t !== T.GRASS && t !== T.MEADOW) continue;
        if (S.occ[i] || S.objAt[i]) continue;
        let md = 1e9; for (const o of S.settlements.values()) md = Math.min(md, G.dist(x, y, o.cx, o.cy));
        if (md < 15) continue;
        if (G.dOcean && G.dOcean[i] < 4) continue;
        const sl = W.slope(x - 2, y - 2, 5, 5); if (sl > 1.6) continue;
        let trees = 0, land = 0;
        for (let dy = -7; dy <= 7; dy += 2) for (let dx = -7; dx <= 7; dx += 2) {
          const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx;
          if (S.treeAt[j]) trees++; if (S.type[j] >= T.SAND) land++;
        }
        const sc = Math.min(trees, 20) * 0.3 + land * 0.12 + S.fert[i] * 3 - sl * 2 - Math.abs(md - 20) * 0.1 + G.R();
        if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
      }
      // seafaring peoples (and anyone boxed in on an island) sail off to found colonies
      const fac = G.Fac.get(set.fac);
      const seaChance = Math.max(0.15, (G.Civ.t(set.fac, 'colonize') - 1) * 0.6);
      const reachable = best && W.findPath(set.cx, set.cy, best[0], best[1], true, N * N);
      if ((!reachable || G.R() < seaChance) && G.Naval && fac && G.Naval.colonize(set, fac)) { set.fails = 0; return; }
      if (!reachable) { set.fails = 0; continue; }
      const name = V.newSettlementName(set.fac);
      const ns = V.addSettlement(name, best[0], best[1], set.fac);
      const chosen = V.pickFounders(set, pop);
      if (chosen.size < 4) { S.settlements.delete(ns.id); continue; }
      for (const v of chosen) { G.Vg.endTask(v); v.set = ns.id; v.home = 0; v.sleeping = false; v.inside = 0; v.task = { type: 'migrate', pri: 1.5 }; }
      set.fails = 0;
      V.log(`${chosen.size} pessoas partiram de ${set.name} para fundar ${name}.`, 'settle', best[0], best[1]);
      V.milestone('settle2', 'Novo assentamento', `${name} foi fundado.`, 'settle');
      return;
    }
  }

  // ------------------------------ births & deaths ------------------------------
  V.birth = function (mother) {
    const S = G.S;
    const father = S.villagers.get(mother.partner) || S.dead.get(mother.partner);
    const twins = G.R() < 0.05 ? 2 : 1;
    const names = [];
    for (let k = 0; k < twins; k++) {
      const g = G.R() < 0.5 ? 'f' : 'm';
      const c = G.Vg.create({ g, age: 0, x: mother.x + G.rr(-0.2, 0.2), y: mother.y + G.rr(-0.2, 0.2), set: mother.set, mother: mother.id, father: father ? father.id : 0 });
      c.home = mother.home;
      mother.kids.push(c.id); if (father) father.kids.push(c.id);
      S.stats.births++;
      names.push([c.name, g]);
      G.FX && G.FX.hearts(mother.x, mother.y);
    }
    mother.lastBirth = S.day;
    const fn = father ? father.name : null;
    let txt;
    const had = fn ? ' e ' + fn + ' tiveram' : ' teve';
    if (twins === 2) txt = `${mother.name}${had} gêmeos: ${names[0][0]} e ${names[1][0]}.`;
    else txt = `${mother.name}${had} ${names[0][1] === 'f' ? 'uma filha' : 'um filho'}, ${names[0][0]}.`;
    V.log(txt, 'baby', mother.x, mother.y);
    G.Audio && G.Audio.at(mother.x, mother.y, 'birth', true);
    if (!S.milestones.firstBirth) V.milestone('firstBirth', 'Primeiro nascimento', 'Uma nova geração começa na ilha.', 'baby');
  };

  const CAUSE = {
    old: (v) => `morreu de velhice aos ${Math.floor(v.age)} anos`,
    hunger: (v) => `morreu de fome aos ${Math.floor(v.age)} anos`,
    wolf: (v) => `foi mort${v.g === 'f' ? 'a' : 'o'} por lobos aos ${Math.floor(v.age)} anos`,
    boar: (v) => `foi mort${v.g === 'f' ? 'a' : 'o'} por um javali aos ${Math.floor(v.age)} anos`,
    fire: (v) => `morreu queimad${v.g === 'f' ? 'a' : 'o'} aos ${Math.floor(v.age)} anos`,
    lightning: (v) => `foi atingid${v.g === 'f' ? 'a' : 'o'} por um raio aos ${Math.floor(v.age)} anos`,
    meteor: (v) => `foi esmagad${v.g === 'f' ? 'a' : 'o'} por um meteoro aos ${Math.floor(v.age)} anos`,
    sick: (v) => `sucumbiu à doença aos ${Math.floor(v.age)} anos`,
    fall: (v) => `caiu das mãos de deus aos ${Math.floor(v.age)} anos`,
    queda: (v) => `morreu de uma queda aos ${Math.floor(v.age)} anos`,
    quake: (v) => `morreu soterrad${v.g === 'f' ? 'a' : 'o'} no terremoto aos ${Math.floor(v.age)} anos`,
    drown: (v) => `se afogou aos ${Math.floor(v.age)} anos`,
    war: (v) => `tombou em combate aos ${Math.floor(v.age)} anos`,
    arrow: (v) => `foi atingid${v.g === 'f' ? 'a' : 'o'} por uma flecha aos ${Math.floor(v.age)} anos`,
    massacre: (v) => `foi massacrad${v.g === 'f' ? 'a' : 'o'} aos ${Math.floor(v.age)} anos`,
    execution: (v) => `foi executad${v.g === 'f' ? 'a' : 'o'} aos ${Math.floor(v.age)} anos`,
    coup: (v) => `foi assassinad${v.g === 'f' ? 'a' : 'o'} aos ${Math.floor(v.age)} anos`,
    riot: (v) => `foi mort${v.g === 'f' ? 'a' : 'o'} pela guarda num motim aos ${Math.floor(v.age)} anos`,
    sacrifice: (v) => `foi sacrificad${v.g === 'f' ? 'a' : 'o'} aos deuses aos ${Math.floor(v.age)} anos`,
    lava: (v) => `foi engolid${v.g === 'f' ? 'a' : 'o'} pela lava aos ${Math.floor(v.age)} anos`,
    beast: (v) => `foi devorad${v.g === 'f' ? 'a' : 'o'} por ${v.lastBeast && G.Animals.DEF[v.lastBeast] ? G.Animals.DEF[v.lastBeast].nameA : 'uma fera'} aos ${Math.floor(v.age)} anos`,
    wave: (v) => `foi levad${v.g === 'f' ? 'a' : 'o'} pelo maremoto aos ${Math.floor(v.age)} anos`,
    dragon: (v) => `foi mort${v.g === 'f' ? 'a' : 'o'} pelo dragão aos ${Math.floor(v.age)} anos`,
    kraken: (v) => `foi arrastad${v.g === 'f' ? 'a' : 'o'} para as profundezas pelo Kraken aos ${Math.floor(v.age)} anos`,
    unknown: (v) => `morreu aos ${Math.floor(v.age)} anos`,
  };
  V.deathText = rec => (CAUSE[rec.cause] || CAUSE.unknown)(rec);
  V.kill = function (v, cause, byGod) {
    const S = G.S;
    if (!S.villagers.has(v.id)) return;
    // a violent death leaves a body on the ground, to be carried away later (or not)
    const body = !!(G.Carnage && G.Carnage.onKill(v, cause));
    G.Vg.endTask(v);
    S.villagers.delete(v.id);
    S.stats.deaths++;
    if (byGod) S.stats.godKills++;
    const rec = {
      id: v.id, name: v.name, g: v.g, born: v.born, died: S.day, age: v.age, mother: v.mother, father: v.father,
      partner: v.partner, kids: v.kids.slice(), cause, role: v.role, dead: true, traits: v.traits,
      fac: G.Fac.idOfV(v), captive: !!v.captive, ord: v.ord, ep: v.ep, reigned: v.reigned, kills: v.kills, hero: v.hero, by: v.lastBy || 0, skin: v.skin, hair: v.hair,
    };
    if (v.bio) rec.bio = v.bio;
    if (v.lost) rec.lost = v.lost;
    S.dead.set(v.id, rec);
    G.Life && G.Life.onDeath(v);
    const violent = cause === 'war' || cause === 'arrow' || cause === 'massacre' || cause === 'execution' || cause === 'coup' || cause === 'sacrifice';
    if (violent) G.War.noteDeath(v, cause);
    G.War && G.War.onGone(v);
    const wasRuler = G.Fac.all().some(f => f.leader === v.id);
    const p = S.villagers.get(v.partner);
    if (p) { p.partner = 0; p.widow = v.id; p.mourn = G.DAY_LEN * 1.5; p.emo = { k: 'sad', t: 6 }; }
    // mourning & devotion effects on family
    for (const o of S.villagers.values()) {
      const rel = o.mother === v.id || o.father === v.id || v.mother === o.id || v.father === o.id || (o.mother && o.mother === v.mother);
      if (rel) { o.mourn = Math.max(o.mourn, G.DAY_LEN * 0.8); o.emo = { k: 'sad', t: 5 }; if (byGod) { o.devotion = Math.max(0, o.devotion - 25); o.fear = Math.min(100, o.fear + 20); } }
    }
    const txt = `${v.name} ${(CAUSE[cause] || CAUSE.unknown)(v)}${v.captive ? ', no cativeiro' : ''}.`;
    if (!violent && !wasRuler) { V.log(txt, cause === 'old' ? 'grave' : 'skull', v.x, v.y); V.notice(txt, 'grave'); }
    else if (G.UI && G.UI.selected === v) V.notice(txt, 'grave');
    G.Politics.onDeath(v, cause, v.lastBy, byGod);
    G.FX && G.FX.death(v.x, v.y);
    G.Audio && G.Audio.at(v.x, v.y, 'death', true);
    if (!S.milestones.firstDeath) S.milestones.firstDeath = S.day;
    // bury in the cemetery
    const set = S.settlements.get(v.set) || V.mainSettlement();
    if (set && !body) {
      const cem = V.cemeteryFor(set);
      if (cem) {
        V.bury(cem, rec);
        // the family comes to say goodbye
        for (const o of S.villagers.values()) {
          const rel = o.id === v.partner || o.mother === v.id || o.father === v.id || v.mother === o.id || v.father === o.id || (v.mother && o.mother === v.mother);
          if (rel && o.set === v.set && G.dist(o.x, o.y, cem.x, cem.y) < 28) G.Vg.give(o, { type: 'funeral', id: cem.id, pri: 1.1, kind: 'funeral' });
        }
      }
    }
    if (G.UI && G.UI.selected === v) G.UI.select(null);
    G.Politics.lastSoul && G.Politics.lastSoul(v);
    if (S.villagers.size === 0) {
      V.log('Não resta ninguém na ilha. O silêncio toma conta.', 'skull');
      G.UI && G.UI.toast('A ilha está vazia', 'Todos se foram. Você pode trazer viajantes com o tempo…', 'skull');
    }
  };

  // ------------------------------ faith ------------------------------
  V.faithRate = 0;
  function updateFaith(dt) {
    const S = G.S; let r = S.villagers.size ? 0.12 : 0;
    // pious peoples (Egyptians, Aztecs) pray more
    const fm = {}; for (const f of S.factions.values()) if (f.alive) fm[f.id] = G.Civ.t(f.id, 'faith');
    for (const v of S.villagers.values()) { const s = S.settlements.get(v.set); r += (0.003 + v.devotion * 0.002 + v.fear * 0.0013) * ((s && fm[s.fac]) || 1); }
    for (const b of S.buildings.values()) if (b.built) { const s = S.settlements.get(b.set); const m = (s && fm[s.fac]) || 1; if (b.type === 'temple') r += 0.2 * m; else if (b.type === 'monument') r += 0.4 * m; else if (b.type === 'maravilha') r += 1.2 * m; }
    V.faithRate = r;
    S.faith = Math.min(999, S.faith + r * dt);
  }
  V.perception = function (fid) {
    const S = G.S; let d = 0, f = 0, n = 0;
    for (const v of S.villagers.values()) { if (v.age < 6) continue; if (fid && V.facOfSet(v.set) !== fid) continue; d += v.devotion; f += v.fear; n++; }
    if (!n) return ['Ninguém', 'none'];
    d /= n; f /= n;
    if (d < 12 && f < 12) return ['Um mistério', 'mist'];
    if (d > f * 1.5) return [d < 35 ? 'Um espírito gentil' : d < 65 ? 'Protetor' : 'Deus amado', 'love'];
    if (f > d * 1.5) return [f < 35 ? 'Uma força estranha' : f < 65 ? 'Deus temido' : 'Tirano divino', 'fear'];
    return ['Deus imprevisível', 'mixed'];
  };

  // ------------------------------ population milestones ------------------------------
  function checkMilestones() {
    const S = G.S; const pop = S.villagers.size;
    if (pop > S.stats.maxPop) S.stats.maxPop = pop;
    const pm = [[15, 'Crescendo'], [20, 'Vinte almas'], [30, 'Trinta almas'], [50, 'Cinquenta almas'], [75, 'Setenta e cinco almas'], [100, 'Cem almas'], [150, 'Cento e cinquenta almas'], [200, 'Duzentas almas']];
    for (const [n, t] of pm) {
      if (pop >= n && !S.milestones['pop' + n]) {
        V.log(`A população chegou a ${n} habitantes.`, 'pop');
        if (n >= 20) V.milestone('pop' + n, t, `A população chegou a ${n} habitantes.`, 'pop'); else S.milestones['pop' + n] = S.day;
      }
    }
    const age = S.day - 1;
    for (const y of [10, 25, 50, 100, 200]) {
      if (age >= y && !S.milestones['years' + y]) {
        V.log(`A civilização completou ${y} anos.`, 'era');
        V.milestone('years' + y, `${y} anos`, `A civilização completou ${y} anos de história.`, 'era');
      }
    }
    for (const v of S.villagers.values()) if (v.age > S.stats.oldest) { S.stats.oldest = v.age; S.stats.oldestName = v.name; }
  }

  // ------------------------------ ruins ------------------------------
  function updateRuins(dt) {
    for (const b of [...G.S.buildings.values()]) if (b.type === 'ruin') { b.ruinT -= dt; if (b.ruinT <= 0) V.removeBuilding(b); }
  }

  // ------------------------------ main update ------------------------------
  let tPlan = 0, tJobs = 0, tHouse = 0, tSlow = 0;
  G.worldHooks.push(() => { tPlan = 0; tJobs = 0; tHouse = 0; tSlow = 0; }); // (a new world, or a save loaded: it starts over)
  V.update = function (dt) {
    const S = G.S;
    tPlan += dt; tJobs += dt; tHouse += dt; tSlow += dt;
    updateFaith(dt);
    G.Fac.update(dt);
    if (tSlow >= 1) { updateFarms(tSlow); updateRuins(tSlow); checkMilestones(); tSlow = 0; }
    // (during the time skip homes and trades are dealt out half as often: a few seconds more for a new house to fill
    // or a trade to change hands is nothing in a year of two hundred, and nobody is watching)
    const sk = G.Skip && G.Skip.on ? 2 : 1;
    if (tHouse >= 2.5 * sk) { tHouse = 0; for (const s of S.settlements.values()) assignHousing(s); }
    if (tJobs >= 4 * sk) { tJobs = 0; for (const s of S.settlements.values()) assignJobs(s); }
    if (tPlan >= 3.5) {
      const step = tPlan; tPlan = 0;
      for (const s of [...S.settlements.values()]) {
        if (V.pop(s.id) === 0) {
          s.emptyT = (s.emptyT || 0) + step;
          let migrating = false; for (const v of S.villagers.values()) if (v.set === s.id) { migrating = true; break; }
          if (s.emptyT > G.DAY_LEN * 0.8 && !migrating) V.abandon(s);
          continue;
        }
        s.emptyT = 0;
        plan(s);
        if (V.pop(s.id) >= 100) plan(s); // big cities run several building projects at once
      }
    }
  };
  // an empty settlement is left to the wind
  V.abandon = function (s) {
    const S = G.S;
    if (!S.settlements.has(s.id)) return;
    S.settlements.delete(s.id);
    for (const b of [...S.buildings.values()]) {
      if (b.set !== s.id) continue;
      if (b.type === 'cemetery') { b.set = 0; continue; }
      V.siteGone(b, 'abandono'); // (what a work had got is left to the wind with it, in the ledger)
      V.keptGone(b, 'abandono'); // (and what a house or a shelf kept: a ruin keeps nothing, L-377)
      if (b.type === 'farm' || b.type === 'campfire' || !b.built) { V.removeBuilding(b); continue; }
      // (a house left to the wind keeps no coins: what was in it is lost, in the ledger)
      if (G.BDEF[b.type] && G.BDEF[b.type].housing && (b.coin || 0) > 0 && G.Depot) G.Depot.use('h:' + b.id, 'moedas', b.coin, { code: 'ruina', mine: true });
      if (b.type !== 'ruin') { b.origType = b.type; b.type = 'ruin'; b.blocks = false; b.built = true; b.ruinT = G.DAY_LEN * (2 + G.R() * 3); b.hp = 1; W.touchWalk(); G.Interiors && G.Interiors.abandon(b); }
      b.set = 0;
      G.Act && G.Act.atGone(b); // (what was being done in it ends with the town: L-444)
    }
    const f = G.Fac.get(s.fac);
    V.log(`${s.name} foi abandonada. Só restam casas vazias.`, 'grave', s.cx, s.cy);
    if (f && !G.Fac.settlementsOf(f.id).length) G.Politics ? G.Politics.extinct(f, null) : (f.alive = false);
    G.Fac.updateTerritory();
  };
  // (keep: a load — the homes and the trades given back as they were saved, mended where a saved one no longer fits, never dealt
  // out anew: that is the world's own step, L-419)
  V.forceUpdate = function (keep) {
    for (const s of G.S.settlements.values()) { assignHousing(s); assignJobs(s, keep); }
    V.updateEra();
  };
  // someone who lives in a town across the water they cannot walk to (a captive freed overseas, a migrant whose road broke):
  // after a day of it, a village of their own people on this land takes them in — or a town not at war with them, as a guest
  const IN_TRANSIT = { band: 1, swim: 1, naufrago: 1, muster: 1, scene: 1, embark: 1, aboard: 1, escorted: 1, cais: 1, expl: 1 };
  function strays() {
    const S = G.S;
    for (const v of S.villagers.values()) {
      if (v.captive || v.aboard || v.ug || v.wrecked || v.held || v.air || v.age < 3 || (v.task && IN_TRANSIT[v.task.type]) || (G.Expe && G.Expe.memberOf(v.id))) { v._stray = 0; continue; }
      const set = S.settlements.get(v.set); if (!set || W.reachesTown(v, set)) { v._stray = 0; continue; }
      const f = G.Fac.get(set.fac); const ruler = !!(f && f.leader === v.id);
      if (!v._stray) { v._stray = S.day; continue; }
      // (a pocket beside home — a quay the god sank around, a gap between houses: set down where home is reached on foot,
      // as the stuck are; only farther than that another town, a castaway's camp)
      if (G.Vg.unstick(v)) { v._stray = 0; continue; }
      let best = null, bd = 1e18, own = false, foe = null, fd = 1e18;
      for (const o of S.settlements.values()) {
        if (!W.reachesTown(v, o)) continue; const mine = o.fac === set.fac; const d = G.dist2(v.x, v.y, o.cx, o.cy);
        if (!mine && G.Fac.atWar(o.fac, set.fac)) { if (d < fd) { fd = d; foe = o; } continue; }
        if (d + (mine ? 0 : 1e9) < bd) { bd = d + (mine ? 0 : 1e9); best = o; own = mine; }
      }
      // (a ruler is never made a guest or a captive for being cut off: they rule from a town of their own on this land,
      // or wait as a castaway for a way home — the camp, the raft, the hamlet of the shipwrecked)
      if (ruler && !(best && own)) { v.wrecked = { ship: 0, name: 'o barco', d: S.day, fac: set.fac, exp: 0, x: +v.x.toFixed(1), y: +v.y.toFixed(1) }; v._stray = 0; continue; }
      // (only enemies on this land: like a castaway on a hostile shore, they are taken)
      if (!best && foe && G.War && G.War.enslave) { G.Vg.endTask(v); G.War.enslave(v, set.fac, set.id); v.set = foe.id; v.home = 0; v._stray = 0; continue; }
      // (nobody at all on this land: stranded like a castaway — the camp, the raft, the hamlet of the shipwrecked)
      if (!best && !foe) { v.wrecked = { ship: 0, name: 'o barco', d: S.day, fac: set.fac, exp: 0, x: +v.x.toFixed(1), y: +v.y.toFixed(1) }; v._stray = 0; continue; }
      if (!best) continue;
      G.Vg.endTask(v); v.set = best.id; v.home = 0; v._stray = 0;
      if (!own) v.guestOf = { fac: best.fac, from: set.fac, d: S.day };
    }
  }
  // ------------------------------ the memory of the dead ------------------------------
  // A cemetery holds twelve. A full one opens a new one — until the town has as many as its size calls for: then the
  // oldest is reused, its bones gone to the ossuary (a town of three hundred souls does not grow forty cemeteries).
  const GRAVES = 12, BONES = 30;
  V.cemeteryFor = function (set) {
    const S = G.S;
    const cur = S.buildings.get(set.cemetery);
    if (cur && cur.type === 'cemetery' && (cur.graves || []).length < GRAVES) return cur;
    let old = null, n = 0;
    for (const b of S.buildings.values()) {
      if (b.type !== 'cemetery' || b.set !== set.id || !b.built) continue;
      n++; if (!old || lastBurial(b) < lastBurial(old)) old = b;
    }
    if (old && (S.day - lastBurial(old) >= BONES || n >= 2 + Math.floor(V.pop(set.id) / 60))) {
      for (const id of old.graves || []) { const d = S.dead.get(id); if (d && d.grave === old.id) { d.grave = 0; d.buried = 'ossuario'; } }
      old.graves = []; set.cemetery = old.id;
      return old;
    }
    const cem = V.startProject(set, 'cemetery'); if (cem) set.cemetery = cem.id;
    return cem;
  };
  // (an old world's cemetery does not know its last burial: its dead do)
  function lastBurial(b) { if (b.last !== undefined) return b.last; let m = 0; for (const id of b.graves || []) { const d = G.S.dead.get(id); if (d && d.died > m) m = d.died; } return m; }
  // (a body carried a long way may find its cemetery full: the town's next one takes it, or the common pit)
  V.bury = function (cem, rec, how) {
    if ((cem.graves || []).length >= GRAVES) { const set = G.S.settlements.get(cem.set); cem = set ? V.cemeteryFor(set) : null; }
    if (!cem) { rec.grave = 0; rec.buried = 'vala'; return null; }
    (cem.graves = cem.graves || []).push(rec.id); cem.last = G.S.day; rec.grave = cem.id; if (how) rec.buried = how;
    return cem;
  };
  // The registry of the dead remembers three generations. After that a name fades — unless someone living still calls
  // them father, mother or grandparent, or they mattered: rulers, heroes, those with an epithet, great killers.
  // (a thousand years would otherwise keep tens of thousands of strangers, heavier than the world itself)
  const FORGET = 80;
  // one brought back from the dead leaves an empty grave (the only other hand on the graves: the god's)
  V.unbury = function (rec) {
    const cem = rec.grave && G.S.buildings.get(rec.grave);
    if (cem && cem.graves) cem.graves = cem.graves.filter(id => id !== rec.id);
    rec.grave = 0;
  };
  V.remembered = d => !!(d.reigned || d.hero || d.ep || (d.kills || 0) >= 5);
  V.forget = function () {
    const S = G.S; if (!S.dead.size) return 0;
    const keep = new Set();
    for (const v of S.villagers.values()) {
      if (v.widow) keep.add(v.widow);
      for (const id of [v.mother, v.father]) { if (!id) continue; keep.add(id); const p = G.person(id); if (p) { if (p.mother) keep.add(p.mother); if (p.father) keep.add(p.father); } }
    }
    let n = 0;
    for (const [id, d] of S.dead) if (S.day - (d.died || 0) >= FORGET && !keep.has(id) && !V.remembered(d)) { S.dead.delete(id); n++; }
    return n;
  };
  V.onNewDay = function () {
    V.forget();
    strays();
    brickBack();
    checkExpansion();
    V.updateEra();
    G.Politics.onNewDay();
    G.Interiors && G.Interiors.onNewDay(); // (the doors back to their rule, a door moved, a type made over, who heads each house)
  };
})(window.G);
