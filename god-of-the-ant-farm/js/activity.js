'use strict';
// ============================================================
//  Activities: the ground every job of the world stands on.
//  Who keeps things (G.Depot) is one door for every holder — a
//  people's store, a house, a shelf, a stall, a quay, a ship's
//  hold, two hands, a purse, a thing left on the ground — over
//  the very fields that already hold them. A change is a transfer
//  that checks everything first and then happens whole, or not at
//  all, and is written in the ledger with its cause; what does not
//  fit stays where it was (nothing is ever lost for want of room).
//  What is being done (G.Act) lives in the world, in S.acts: an
//  operation with its people and their roles, its goods, what is
//  reserved, what is done (confirmed, step by step), what is owed
//  and paid, and what happened. A person's task is only the hand
//  that does the next step: a save, the god taking the body, the
//  years going by in the skip — none of them ends an operation;
//  its overseer hands the next step to whoever holds the role,
//  from what is confirmed. The god's body and the people of the
//  world change the world through the same steps, at the same
//  pace, with the same results.
// ============================================================
(function (G) {
  const W = G.W;
  const D = G.Depot = { onMove: [] };
  const A = G.Act = { DEFS: {} };
  const EPS = 1e-6;
  const fin = x => typeof x === 'number' && isFinite(x);
  const r4 = x => Math.round(x * 1e4) / 1e4;

  // ============================== the holders ==============================
  // a holder is a short text, the same everywhere: 'f:12' a people's store, 'h:345' a house, 'b:345' a building's shelf,
  // 'z:7' a business's stall, 'q:345' a quay (crates), 's:678' a ship's hold, 'v:901' two hands, 'p:901' a purse,
  // 'g:55' a thing on the ground
  D.ref = (kind, id) => kind + ':' + id;
  D.parse = ref => { const i = typeof ref === 'string' ? ref.indexOf(':') : -1; return i > 0 ? [ref.slice(0, i), +ref.slice(i + 1)] : [null, 0]; };
  const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  const loose = () => G.S.loose || (G.S.loose = []);
  // the furniture that keeps things inside a building: a port the interiors fill (G.Depot.stores = b => [{ id, kind, keys:
  // [goods] | '*', cap, slot }]); with nothing there, the room of today (no limit)
  D.stores = null;
  const storesOf = b => { if (!D.stores || !b) return null; try { return D.stores(b) || null; } catch (e) { return null; } };
  const furnRoom = (b, k, have) => {
    const L = storesOf(b);
    if (!L || !L.length) return Infinity;
    let cap = 0; for (const m of L) if (m && (m.keys === '*' || (Array.isArray(m.keys) && m.keys.includes(k)))) cap += m.cap || 0;
    return Math.max(0, cap - have);
  };
  // a business by its id (G.S.biz is G.Biz's; the index follows the list and its version, bumped when one opens or ends)
  let zIdx = null, zArr = null, zV = -1;
  D.zVer = 0;
  function zOf(id) {
    const L = G.S.biz || [];
    if (!zIdx || zArr !== L || zV !== D.zVer) { zIdx = new Map(); for (const z of L) zIdx.set(z.id, z); zArr = L; zV = D.zVer; }
    const z = zIdx.get(id); return z && z.st !== 'fim' ? z : null;
  }
  D.zOf = zOf;
  // what a stall's counter holds of a good: the counters of its place in the market (the interiors say, by slot), or 24
  const ZCAP = 24;
  function zRoom(z, k) {
    const b = G.S.buildings.get(z.b); const L = storesOf(b); let cap = ZCAP;
    if (L && L.length) { const mine = L.filter(m => m && m.slot === z.slot); if (mine.length) { cap = 0; for (const m of mine) if (m.keys === '*' || (Array.isArray(m.keys) && m.keys.includes(k))) cap += m.cap || 0; } }
    return Math.max(0, cap - ((z.inv && z.inv[k]) || 0));
  }
  // each kind of holder: the object, how much of a good it has, how much more fits, taking and putting (items keep their marks)
  const AD = {
    f: { // a people's store (the storehouses, barns, docks and fires are its doors)
      obj: id => G.Fac.get(id) || null,
      get: (o, k) => (k === 'water' ? 0 : o.stock[k] || 0),
      room: (o, k) => (k === 'water' ? 0 : k === 'moedas' ? Infinity : Math.max(0, G.Village.cap(o.id) - (o.stock[k] || 0))),
      take: (o, k, n) => { o.stock[k] = r4((o.stock[k] || 0) - n); },
      put: (o, rec) => { o.stock[rec.k] = r4((o.stock[rec.k] || 0) + rec.n); },
      list: o => o.stock,
      owner: o => ({ fac: o.id }),
    },
    h: { // a house: the pantry, the family's coins, the goods
      obj: id => { const b = G.S.buildings.get(id); return housing(b) ? b : null; },
      get: (b, k) => (k === 'food' ? b.pantry || 0 : k === 'moedas' ? b.coin || 0 : (b.inv && b.inv[k]) || 0),
      room: (b, k) => (k === 'moedas' ? Infinity : k === 'water' ? 0 : furnRoom(b, k, AD.h.get(b, k))),
      take: (b, k, n) => { if (k === 'food') b.pantry = r4((b.pantry || 0) - n); else if (k === 'moedas') b.coin = r4((b.coin || 0) - n); else b.inv[k] = r4((b.inv[k] || 0) - n); },
      put: (b, rec) => { const k = rec.k; if (k === 'food') b.pantry = r4((b.pantry || 0) + rec.n); else if (k === 'moedas') b.coin = r4((b.coin || 0) + rec.n); else { const I = b.inv || (b.inv = {}); I[k] = r4((I[k] || 0) + rec.n); } },
      list: b => { const o = Object.assign({}, b.inv || {}); if (b.pantry) o.food = b.pantry; if (b.coin) o.moedas = b.coin; return o; },
      owner: b => ({ fac: G.Village.facOfSet(b.set), home: b.id }),
    },
    b: { // a building's own shelf (a fair, a tavern, a workshop, a court)
      obj: id => { const b = G.S.buildings.get(id); return b && !housing(b) ? b : null; },
      get: (b, k) => (b.inv && b.inv[k]) || 0,
      room: (b, k) => (k === 'water' ? 0 : k === 'moedas' ? Infinity : furnRoom(b, k, AD.b.get(b, k))),
      take: (b, k, n) => { b.inv[k] = r4((b.inv[k] || 0) - n); },
      put: (b, rec) => { const I = b.inv || (b.inv = {}); I[rec.k] = r4((I[rec.k] || 0) + rec.n); },
      list: b => b.inv || {},
      owner: b => ({ fac: G.Village.facOfSet(b.set), bld: b.id }),
    },
    q: { // a quay: the crates set down by the water (ten of up to four) — and what is left of one that burnt, with its crates
      obj: id => { const b = G.S.buildings.get(id); return b && (b.type === 'doca' || (b.type === 'ruin' && b.origType === 'doca' && b.crates)) ? b : null; },
      get: (b, k, c) => { let n = 0; for (const x of b.crates || []) if (x.k === k && (!c || !c.cid || x.id === c.cid)) n += x.n; return n; },
      room: (b, k, c) => { if (b.type !== 'doca') return 0; const L = b.crates || []; const per = c && c.crate ? c.crate : 4; return Math.max(0, 10 - L.length) * per; },
      take: (b, k, n, c) => {
        const L = b.crates || []; let left = n; const rec = { k, n: 0 };
        for (let i = 0; i < L.length && left > EPS; i++) {
          const x = L[i]; if (x.k !== k || (c && c.cid && x.id !== c.cid)) continue;
          const m = Math.min(left, x.n); x.n = r4(x.n - m); left = r4(left - m); rec.n = r4(rec.n + m);
          if (!rec.cid) Object.assign(rec, { cid: x.id, crate: 1, fish: x.fish, fishCol: x.col, catchOf: x.boat, imp: x.imp, op: x.op || 0, ship: x.ship || 0, gen: x.gen || 0 });
          if (x.n <= EPS) { L.splice(i, 1); i--; }
        }
        return rec;
      },
      put: (b, rec, c) => {
        const L = b.crates || (b.crates = []); let n = rec.n; const per = c && c.crate ? c.crate : 4;
        // (one crate keeps its name: set back whole on the quay it is the same crate — once more set down: its generation)
        if (rec.cid && n <= per) { L.unshift({ id: rec.cid, k: rec.k, n, col: rec.fishCol || colOf(rec.k), fish: rec.fish, boat: rec.catchOf, imp: rec.imp, op: (c && c.op) || rec.op || 0, ship: rec.ship || 0, gen: (rec.gen || 0) + 1 }); return; }
        while (n > EPS) { const m = Math.min(per, n); L.push({ id: G.S.nextId++, k: rec.k, n: r4(m), col: rec.fishCol || colOf(rec.k), fish: rec.fish, boat: rec.catchOf, imp: rec.imp, op: (c && c.op) || 0, ship: rec.ship || 0 }); n = r4(n - m); }
      },
      list: b => { const o = {}; for (const x of b.crates || []) o[x.k] = r4((o[x.k] || 0) + x.n); return o; },
      owner: b => ({ fac: G.Village.facOfSet(b.set), bld: b.id }),
      items: b => (b.crates || []).map((x, i) => ({ cid: x.id, k: x.k, n: x.n, op: x.op || 0, by: x.by || 0, i, fish: x.fish || null })),
    },
    s: { // a ship's hold (the merchant's cargo: one good)
      obj: id => G.S.ships.find(o => o.id === id) || null,
      get: (s, k) => (s.goods && s.goods.k === k ? s.goods.n : 0),
      room: (s, k) => (s.goods && s.goods.k !== k && s.goods.n > EPS ? 0 : Math.max(0, 40 - (s.goods ? s.goods.n : 0))),
      take: (s, k, n) => { s.goods.n = r4(s.goods.n - n); const rec = { k, n, imp: 1, ship: s.id }; if (s.goods.n <= EPS) s.goods = null; return rec; },
      put: (s, rec) => { if (s.goods && s.goods.k === rec.k) s.goods.n = r4(s.goods.n + rec.n); else s.goods = { k: rec.k, n: rec.n }; },
      list: s => (s.goods ? { [s.goods.k]: s.goods.n } : {}),
      owner: s => ({ fac: s.fac }),
    },
    v: { // two hands: one load
      obj: id => G.S.villagers.get(id) || null,
      get: (v, k, c) => (v.carry && v.carry.k === k && (!c || !c.cid || v.carry.cid === c.cid) ? v.carry.n : 0),
      room: (v, k, c) => {
        // (loads of different errands never mix in the hands: a crate is its own, a purchase is the house's)
        const cur = v.carry; if (cur && cur.n > EPS && (cur.k !== k || cur.cid || (c && c.cid) || (cur.op || 0) !== ((c && c.op) || 0) || (cur.to || null) !== ((c && c.to) || null))) return 0;
        const each = D.weight(k, 1); const str = D.strength(v) * ((c && c.pair) ? 1.8 : 1);
        return Math.max(0, Math.floor((str + EPS) / each) - (cur && cur.n > EPS ? cur.n : 0));
      },
      take: (v, k, n) => { const c = v.carry; const rec = Object.assign({}, c, { k, n }); c.n = r4(c.n - n); if (c.n <= EPS) v.carry = null; return rec; },
      put: (v, rec, c) => {
        if (v.carry && v.carry.n > EPS && v.carry.k === rec.k && !rec.cid) { v.carry.n = r4(v.carry.n + rec.n); return; }
        const o = { k: rec.k, n: rec.n };
        for (const q of ['crate', 'cid', 'gen', 'fish', 'fishCol', 'catchOf', 'imp', 'ship', 'bought', 'stolen', 'meat', 'berries', 'jar']) if (rec[q] !== undefined && rec[q] !== null && rec[q] !== 0) o[q] = rec[q];
        if (c && c.op) o.op = c.op; else if (rec.op) o.op = rec.op;
        if (c && c.to) o.to = c.to; if (c && c.tag) Object.assign(o, c.tag);
        v.carry = o;
      },
      list: v => (v.carry && v.carry.n > EPS ? { [v.carry.k]: v.carry.n } : {}),
      owner: v => ({ fac: G.Fac.idOfV(v), who: v.id, home: v.home }),
      items: v => (v.carry && v.carry.n > EPS ? [{ cid: v.carry.cid || 0, k: v.carry.k, n: v.carry.n, op: v.carry.op || 0, to: v.carry.to || null, fish: v.carry.fish || null }] : []),
    },
    p: { // a purse: coins only
      obj: id => G.S.villagers.get(id) || null,
      get: (v, k) => (k === 'moedas' ? v.purse || 0 : 0),
      room: (v, k) => (k === 'moedas' ? Infinity : 0),
      take: (v, k, n) => { v.purse = r4((v.purse || 0) - n); },
      put: (v, rec) => { v.purse = r4((v.purse || 0) + rec.n); },
      list: v => (v.purse ? { moedas: v.purse } : {}),
      owner: v => ({ fac: G.Fac.idOfV(v), who: v.id }),
    },
    z: { // a business's stall: the merchant's own stock on the counter (the businesses live in G.S.biz; G.Biz runs them)
      obj: id => zOf(id),
      get: (z, k) => (z.inv && z.inv[k]) || 0,
      room: (z, k) => (k === 'water' || k === 'moedas' ? 0 : zRoom(z, k)),
      take: (z, k, n) => { z.inv[k] = r4((z.inv[k] || 0) - n); if (z.inv[k] <= EPS) delete z.inv[k]; },
      put: (z, rec) => { const I = z.inv || (z.inv = {}); I[rec.k] = r4((I[rec.k] || 0) + rec.n); },
      list: z => z.inv || {},
      owner: z => ({ fac: z.fac, biz: z.id, home: z.home, who: z.owner }),
      place: z => G.S.buildings.get(z.b) || null,
    },
    g: { // a thing left on the ground (who fell with a crate in the arms)
      obj: id => loose().find(o => o.id === id) || null,
      get: (o, k) => (o.k === k ? o.n : 0),
      room: () => 0,
      take: (o, k, n) => { const rec = Object.assign({}, o, { n }); delete rec.x; delete rec.y; delete rec.day; rec.cid = o.cid || o.id; o.n = r4(o.n - n); if (o.n <= EPS) { const L = loose(); L.splice(L.indexOf(o), 1); } return rec; },
      put: () => { },
      list: o => ({ [o.k]: o.n }),
      owner: o => ({ fac: o.fac || 0, op: o.op || 0 }),
      items: o => [{ cid: o.cid || o.id, k: o.k, n: o.n, op: o.op || 0, x: o.x, y: o.y }],
    },
  };
  // (a module that keeps a holder of its own registers its kind: the businesses' stalls are 'z', act-negocio.js)
  D.addKind = function (kind, ad) { AD[kind] = ad; D.KINDS = Object.keys(AD); };
  D.KINDS = Object.keys(AD);
  const COL = { food: '#b8a060', wood: '#8a6440', stone: '#a8a49a' };
  function colOf(k) { const E = G.Eco; return COL[k] || (E && E.GOODS[k] && E.GOODS[k].col) || '#c8a878'; }
  function hold(ref) { const [kind, id] = D.parse(ref); const ad = AD[kind]; if (!ad) return null; const o = ad.obj(id); return o ? { ad, o, kind, id } : null; }
  D.exists = ref => !!hold(ref);

  // ------------------------------ reading ------------------------------
  D.get = function (ref, k, c) { const h = hold(ref); return h ? h.ad.get(h.o, k, c) : 0; };
  D.room = function (ref, k, c) { const h = hold(ref); return h ? h.ad.room(h.o, k, c) : 0; };
  D.list = function (ref) { const h = hold(ref); if (!h) return {}; const out = {}; const L = h.ad.list(h.o) || {}; for (const k in L) if (fin(L[k]) && L[k] > EPS) out[k] = L[k]; return out; };
  D.owner = function (ref) { const h = hold(ref); return h ? h.ad.owner(h.o) : null; };
  D.items = function (ref) { const h = hold(ref); if (!h) return []; return h.ad.items ? h.ad.items(h.o) : Object.entries(D.list(ref)).map(([k, n]) => ({ cid: 0, k, n })); };
  // what the reservations of the operations (other than this one) hold back
  let rsvIdx = null, rsvVer = -1; A._rv = 0;
  G.worldHooks.push(() => { rsvIdx = null; rsvVer = -1; });
  function reserved(ref, k, exceptOp) {
    if (!rsvIdx || rsvVer !== A._rv) {
      rsvIdx = new Map(); rsvVer = A._rv;
      for (const op of ops()) if (live(op)) for (const r of op.rsv || []) { const key = r[0] + '|' + r[1]; const m = rsvIdx.get(key) || []; m.push([op.id, r[2]]); rsvIdx.set(key, m); }
    }
    const m = rsvIdx.get(ref + '|' + k); if (!m) return 0;
    let n = 0; for (const [id, q] of m) if (id !== exceptOp) n += q; return n;
  }
  D.free = (ref, k, exceptOp, c) => Math.max(0, D.get(ref, k, c) - reserved(ref, k, exceptOp));
  D.reserved = (ref, k) => reserved(ref, k, -1);

  // ------------------------------ weight, packing, strength ------------------------------
  // (a unit of each good, as a load in the arms: stone and ore are heavy, cloth and jewels light)
  const WT = { food: 1, wood: 1.6, stone: 3, minerio: 3, ouro: 3.2, argila: 2.5, sal: 1.6, vinho: 2.2, azeite: 2.2, mel: 2, cerveja: 2, pulque: 2, tecido: 0.6, la: 0.5, seda: 0.3, joias: 0.2, moedas: 0.05, ferramentas: 2, armas: 2.2, ceramica: 1.2, couro: 0.8, peles: 0.8, marfim: 2.5, perolas: 0.1, coral: 0.8, bacalhau: 1, atum: 1.2, carne_seca: 1, queijo: 1, cera: 0.8, incenso: 0.6, especiarias: 0.6, cafe: 1, cacau: 1, tamaras: 1, plumas: 0.2, chifre: 1.5, pele_rara: 1, couro_exotico: 0.9, oleo: 2.2, camarao: 1, cocar: 0.3 };
  D.weight = (k, n) => (WT[k] === undefined ? 1 : WT[k]) * (n || 0);
  // what one body can lift: a grown body more than a child or an old one; a lost arm, sickness and tiredness count
  D.strength = function (v) {
    if (!v) return 0;
    let s = v.age < 10 ? 3 : v.age < 14 ? 5 : v.age < 16 ? 7 : v.age >= 70 ? 4 : v.age >= 62 ? 6 : 10;
    if (v.lost) s *= v.lost.armL && v.lost.armR ? 0 : v.lost.armL || v.lost.armR ? 0.55 : 1;
    if (v.sick > 0) s *= 0.7;
    if (v.traits && v.traits.includes('Resistente')) s *= 1.15;
    return s;
  };
  // how many people a load takes: one, two (carried between them), or none can (a cart, an animal, or less of it)
  D.hands = function (k, n, v) { const w = D.weight(k, n); const s = v ? D.strength(v) : 10; return w <= s + EPS ? 1 : w <= s * 1.8 + EPS ? 2 : 0; };
  // what a load is packed in, by the good and by the people (wine in amphorae in the south, in casks in the north)
  const FORM = { food: 'cesta', wood: 'feixe', stone: 'pedra', minerio: 'saco', ouro: 'saco', argila: 'cesta', sal: 'saco', tecido: 'fardo', la: 'fardo', seda: 'fardo', couro: 'fardo', peles: 'fardo', moedas: 'bolsa', joias: 'caixa', ferramentas: 'caixa', armas: 'feixe', ceramica: 'pote', cerveja: 'pote', pulque: 'pote', mel: 'pote', queijo: 'cesta', carne_seca: 'cesta', especiarias: 'saco', cafe: 'saco', cacau: 'saco', incenso: 'saco', tamaras: 'cesta', perolas: 'caixa', coral: 'cesta', marfim: 'fardo', bacalhau: 'cesta', atum: 'peixe', camarao: 'cesta', cera: 'caixa', plumas: 'fardo' };
  const CASK = { nordico: 1 };
  D.form = function (k, civ, rec) {
    if (rec && rec.crate) return 'caixa';
    if (rec && rec.fish && k === 'food') return 'peixe';
    if (k === 'vinho' || k === 'azeite' || k === 'oleo') return CASK[civ] ? 'barril' : 'anfora';
    if (k === 'cerveja') return CASK[civ] ? 'barril' : 'pote';
    if (k === 'cacau' && civ === 'asteca') return 'cesta';
    return FORM[k] || 'caixa';
  };
  D.kg = (k, n) => Math.round(D.weight(k, n) * 6); // (a unit of food weighs about six kilos in the arms)

  // ============================== the ledger ==============================
  // every transfer of the activities, with its cause: [n, day, clock, from, to, good, amount, op, code, who]
  const LEDGER_MAX = 4000;
  const ledger = () => G.S.ledger || (G.S.ledger = []);
  function note(from, to, k, n, c) {
    const S = G.S; S.ledgerN = (S.ledgerN || 0) + 1;
    const e = [S.ledgerN, S.day, Math.round(S.clock * 100) / 100, from, to, k, r4(n), (c && c.op) || 0, (c && c.code) || '', (c && c.by) || 0];
    const L = ledger(); L.push(e); if (L.length > LEDGER_MAX) L.splice(0, L.length - LEDGER_MAX * 0.75);
    if (!G.inSim) D.outside = (D.outside || 0) + 1; // (a world change from outside the world's step: the checker counts it)
    for (const f of D.onMove) { try { f(e); } catch (er) { /* a listener is never worth an error of the world */ } }
    return e;
  }
  D.ledger = () => ledger();
  // keys already applied (the same step twice does nothing the second time)
  function keyStore(c) { const op = c && c.op ? A.get(c.op) : null; if (op) return op.keys || (op.keys = []); const S = G.S; return S.actKeys || (S.actKeys = []); }
  function seen(c) { if (!c || !c.key) return null; const L = keyStore(c); for (let i = L.length - 1; i >= 0; i--) if (L[i][0] === c.key) return L[i]; return null; }
  function remember(c, n) { if (!c || !c.key) return; const L = keyStore(c); L.push([c.key, r4(n)]); if (L.length > 160) L.splice(0, L.length - 120); }

  // ============================== writing ==============================
  // a transfer: checked whole first (the source has it, free of others' reservations; the destination has room; the
  // operation is alive), then both sides at once. cause = { op, code, by, key, part, cid, to, tag, crate }
  D.move = function (from, to, k, n, c) {
    c = c || {};
    if (!(n > EPS) || !fin(n) || !k) return { ok: false, n: 0, why: 'nada a levar' };
    const was = seen(c); if (was) return { ok: true, n: was[1], again: true };
    const a = hold(from), b = hold(to);
    if (!a) return { ok: false, n: 0, why: 'a origem não existe mais' };
    if (!b) return { ok: false, n: 0, why: 'o destino não existe mais' };
    if (c.op) { const op = A.get(c.op); if (!op || !live(op)) return { ok: false, n: 0, why: 'a operação já terminou' }; }
    const have = Math.max(0, a.ad.get(a.o, k, c) - (c.mine ? 0 : reserved(from, k, c.op || -1)));
    const room = b.ad.room(b.o, k, c);
    let m = n;
    if (have + EPS < m) { if (!c.part) return { ok: false, n: 0, why: 'não há tanto' }; m = have; }
    if (room + EPS < m) { if (!c.part) return { ok: false, n: 0, why: 'não cabe' }; m = Math.min(m, room); }
    m = r4(m); if (!(m > EPS)) return { ok: false, n: 0, why: have <= EPS ? 'não há' : 'não cabe' };
    const rec = a.ad.take(a.o, k, m, c) || { k, n: m };
    rec.k = k; rec.n = m;
    b.ad.put(b.o, rec, c);
    remember(c, m);
    const e = note(from, to, k, m, c);
    if (c.op) account(A.get(c.op), from, to, k, m, c);
    return { ok: true, n: m, e };
  };
  // an operation's own books, from its transfers: what came into its hands (from its source, or born of the world), what
  // reached its destination, what went back, what was lost — so that what came in = what arrived + lost + back + what is
  // still in its custody: in hands, on the ground, or in its yard (op.stage: the quay of an unloading) — the checker
  function account(op, from, to, k, m, c) {
    if (!op) return; op.upd = G.S.clock;
    const mv = op.moved || (op.moved = {}); mv[k] = r4((mv[k] || 0) + m);
    if (!op.goods || op.goods[k] === undefined || (c && c.code === 'paga')) return;
    const add = (f, q) => { const o = op[f] || (op[f] = {}); o[k] = r4((o[k] || 0) + q); };
    const dst = op.to;
    // (an operation may draw from more than one source: the holds of two ships unloading at the same quay)
    const isSrc = ref => !!ref && (ref === op.from || (!!op.srcs && op.srcs.includes(ref)));
    const inside = ref => !!ref && (ref[0] === 'v' || ref[0] === 'g' || (!!op.stage && ref === op.stage));
    if ((isSrc(from) && !isSrc(to)) || from === '@mundo') add('taken', m);
    else if (isSrc(to) && inside(from)) add('back', m);
    if (to === dst && from !== dst) add('done', m);
    else if (from === dst && to !== dst && inside(to)) add('done', -m); // (taken back out of the destination: it is no longer arrived)
    if (to === '@uso' && from !== dst) add('lost', m);
  }
  A.account = account;
  // a good born of the world (a fish from its water, wood from a felled tree) or gone from it with a cause (eaten, burnt)
  D.make = function (to, k, n, c) {
    c = c || {}; if (!(n > EPS) || !fin(n) || !k) return { ok: false, n: 0, why: 'nada' };
    const was = seen(c); if (was) return { ok: true, n: was[1], again: true };
    const b = hold(to); if (!b) return { ok: false, n: 0, why: 'o destino não existe mais' };
    let m = n; const room = b.ad.room(b.o, k, c);
    if (room + EPS < m) { if (!c.part) return { ok: false, n: 0, why: 'não cabe' }; m = room; }
    m = r4(m); if (!(m > EPS)) return { ok: false, n: 0, why: 'não cabe' };
    b.ad.put(b.o, Object.assign({ k, n: m }, c.rec || {}), c); remember(c, m);
    const e = note('@mundo', to, k, m, c);
    if (c.op) account(A.get(c.op), '@mundo', to, k, m, c);
    return { ok: true, n: m, e };
  };
  D.use = function (from, k, n, c) {
    c = c || {}; if (!(n > EPS) || !fin(n) || !k) return { ok: false, n: 0, why: 'nada' };
    const was = seen(c); if (was) return { ok: true, n: was[1], again: true };
    const a = hold(from); if (!a) return { ok: false, n: 0, why: 'a origem não existe mais' };
    let m = n; const have = a.ad.get(a.o, k, c) - (c.mine ? 0 : reserved(from, k, c.op || -1));
    if (have + EPS < m) { if (!c.part) return { ok: false, n: 0, why: 'não há tanto' }; m = Math.max(0, have); }
    m = r4(m); if (!(m > EPS)) return { ok: false, n: 0, why: 'não há' };
    a.ad.take(a.o, k, m, c); remember(c, m);
    const e = note(from, '@uso', k, m, c);
    if (c.op) account(A.get(c.op), from, '@uso', k, m, c);
    return { ok: true, n: m, e };
  };
  // a load set down on the ground (a porter called away between the quay and the store, a ship's cargo with no room on the
  // quay): a thing that lies there, marked with its operation, until a hand picks it up
  D.drop = function (from, k, n, x, y, c) {
    c = c || {}; const a = hold(from); if (!a) return { ok: false, n: 0, why: 'a origem não existe mais' };
    if (!fin(x) || !fin(y)) return { ok: false, n: 0, why: 'sem lugar' };
    const m = r4(Math.min(n, a.ad.get(a.o, k, c))); if (!(m > EPS)) return { ok: false, n: 0, why: 'não há' };
    const rec = a.ad.take(a.o, k, m, c) || { k, n: m };
    const S = G.S; const o = { id: S.nextId++, k, n: m, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, op: c.op || rec.op || 0, cid: rec.cid || 0, crate: rec.crate ? 1 : 0, fac: c.fac || 0, day: S.day, fish: rec.fish || null };
    loose().push(o); remember(c, m);
    const e = note(from, 'g:' + o.id, k, m, c);
    if (c.op) account(A.get(c.op), from, 'g:' + o.id, k, m, c);
    return { ok: true, n: m, g: o.id, e };
  };
  // two transfers that are one deal (goods for coin): both or neither
  D.swap = function (x, y, c) {
    const okX = D.can(x[0], x[1], x[2], x[3], c), okY = D.can(y[0], y[1], y[2], y[3], c);
    if (!okX.ok) return okX; if (!okY.ok) return okY;
    const r1 = D.move(x[0], x[1], x[2], x[3], Object.assign({}, c, { key: c.key ? c.key + ':a' : undefined }));
    if (!r1.ok) return r1;
    const r2 = D.move(y[0], y[1], y[2], y[3], Object.assign({}, c, { key: c.key ? c.key + ':b' : undefined }));
    if (!r2.ok) { D.move(x[1], x[0], x[2], r1.n, Object.assign({}, c, { code: 'desfeito', key: undefined })); return r2; } // (checked a moment ago: cannot fail, but never half a deal)
    return { ok: true, n: r1.n, m: r2.n };
  };
  // would it go through? (the same checks as move, nothing changed)
  D.can = function (from, to, k, n, c) {
    c = c || {}; const a = hold(from), b = hold(to);
    if (!a) return { ok: false, why: 'a origem não existe mais' }; if (!b) return { ok: false, why: 'o destino não existe mais' };
    if (!(n > EPS)) return { ok: false, why: 'nada' };
    const have = a.ad.get(a.o, k, c) - (c.mine ? 0 : reserved(from, k, c.op || -1)); if (have + EPS < n) return { ok: false, why: 'não há tanto' };
    if (b.ad.room(b.o, k, c) + EPS < n) return { ok: false, why: 'não cabe' };
    return { ok: true };
  };
  // reservations: an operation holds back goods it is on its way to take
  D.reserve = function (ref, k, n, opId) {
    const op = A.get(opId); if (!op || !(n > EPS)) return false;
    if (D.free(ref, k, opId) + EPS < n) return false;
    (op.rsv || (op.rsv = [])).push([ref, k, r4(n)]); A._rv++; return true;
  };
  D.unreserve = function (opId, ref, k) {
    const op = A.get(opId); if (!op || !op.rsv || !op.rsv.length) return;
    op.rsv = ref ? op.rsv.filter(r => !(r[0] === ref && (!k || r[1] === k))) : []; A._rv++;
  };
  // who may take from / put into a holder: its owner and family, the hands of an operation that holds it, its people
  D.may = function (v, ref, mode, opId) {
    const h = hold(ref); if (!h || !v) return { ok: false, why: 'não existe' };
    const op = opId ? A.get(opId) : null;
    if (op && live(op) && op.roles && op.roles[v.id] && (op.from === ref || op.to === ref || (op.refs || []).includes(ref))) return { ok: true };
    const fid = G.Fac.idOfV(v);
    switch (h.kind) {
      case 'v': case 'p': return h.o.id === v.id ? { ok: true } : { ok: false, why: 'É de outra pessoa.' };
      case 'h': return h.o.id === v.home ? { ok: true } : { ok: false, why: 'É de outra família.' };
      case 'z': { const z = h.o; if (z.owner === v.id || (z.home && z.home === v.home) || (z.help || []).includes(v.id)) return { ok: true }; return { ok: false, why: 'A banca é de outra pessoa.' }; }
      case 'f': return h.o.id === fid ? { ok: true } : { ok: false, why: 'É o estoque de outro povo.' };
      case 'b': case 'q': return G.Village.facOfSet(h.o.set) === fid ? (h.kind === 'q' || mode === 'put' || h.o.type === 'feira' || v.job === h.o.id ? { ok: true } : { ok: false, why: 'Não é seu: é de quem trabalha aqui.' }) : { ok: false, why: 'É de outro povo.' };
      case 'g': return { ok: true };
      case 's': return h.o.fac === fid ? { ok: true } : { ok: false, why: 'É de outro povo.' };
    }
    return { ok: false, why: '?' };
  };
  // the share of a people's store that a storehouse holds (the pile drawn in it: the same stock, never a second one)
  D.share = function (b) {
    if (!b || !G.BDEF[b.type] || !G.BDEF[b.type].storage) return {};
    const fid = G.Village.facOfSet(b.set); const f = G.Fac.get(fid); if (!f) return {};
    let tot = 0; for (const o of G.S.buildings.values()) if (o.built && G.BDEF[o.type].storage && G.Village.facOfSet(o.set) === fid) tot += G.BDEF[o.type].storage;
    const part = tot ? G.BDEF[b.type].storage / (80 + tot) : 0; const out = {};
    for (const k in f.stock) { const n = (f.stock[k] || 0) * part; if (k !== 'moedas' && n >= 0.5) out[k] = Math.round(n * 10) / 10; }
    return out;
  };
  // what each piece of furniture of C2 holds of its owner's goods: always the same split for the same goods (a view, not a store)
  D.slots = function (ref) {
    const h = hold(ref); if (!h) return [];
    const b = h.ad.place ? h.ad.place(h.o) : (h.kind === 'h' || h.kind === 'b') ? h.o : null;
    const L = storesOf(b); const slot = h.ad.slot ? h.ad.slot(h.o) : undefined;
    const goods = Object.entries(D.list(ref)).filter(([k]) => k !== 'moedas').sort((x, y) => (x[0] < y[0] ? -1 : 1));
    if (!L || !L.length) return goods.map(([k, n]) => ({ m: 0, k, n }));
    const left = L.map(m => ({ m, room: m.cap || 0 }));
    const out = [];
    for (const [k, n0] of goods) {
      let n = n0;
      for (const s of left) { if (n <= EPS) break; if (slot !== undefined && s.m.slot !== undefined && s.m.slot !== slot) continue; if (!(s.m.keys === '*' || (Array.isArray(s.m.keys) && s.m.keys.includes(k)))) continue; const q = Math.min(n, s.room); if (q <= EPS) continue; out.push({ m: s.m.id, k, n: r4(q) }); s.room -= q; n -= q; }
      if (n > EPS) out.push({ m: 0, k, n: r4(n) }); // (what does not fit on a shelf lies in a pile on the floor)
    }
    return out;
  };
  // the sum of a good over every holder of the world (for the tests of conservation)
  D.total = function (k) {
    const S = G.S; let n = 0;
    for (const f of S.factions.values()) n += AD.f.get(f, k);
    for (const b of S.buildings.values()) { if (housing(b)) n += AD.h.get(b, k); else n += AD.b.get(b, k); if (b.crates) n += AD.q.get(b, k); }
    for (const v of S.villagers.values()) { n += AD.v.get(v, k); n += AD.p.get(v, k); }
    for (const s of S.ships) n += AD.s.get(s, k);
    for (const o of loose()) n += AD.g.get(o, k);
    for (const kind in AD) if (AD[kind].all) for (const o of AD[kind].all()) n += AD[kind].get(o, k);
    return r4(n);
  };

  // ============================== operations ==============================
  // (the modules of the activities hang their parts here: a body taken or given back, the diary, the canon, the checker)
  A.hooks = { possess: [], diary: [], canon: [], tick: [], gone: [] }; // (tick: once a second of the world; gone: (v, why) when one leaves for good or is taken)
  const ops = () => G.S.acts || (G.S.acts = []);
  const LIVE = { plan: 1, rsv: 1, on: 1, wait: 1 };
  const live = op => !!(op && LIVE[op.st]);
  A.live = live;
  A.STATES = { plan: 'planejada', rsv: 'reservada', on: 'em andamento', wait: 'parada', ok: 'concluída', int: 'interrompida', cancel: 'cancelada', fail: 'falhou' };
  let idx = new Map(), idxS = null, idxN = -1;
  G.worldHooks.push(() => { idx = new Map(); idxS = null; idxN = -1; byP = null; });
  A.get = function (id) {
    const S = G.S; const L = ops();
    if (idxS !== S || idxN !== L.length) { idx = new Map(); for (const op of L) idx.set(op.id, op); idxS = S; idxN = L.length; }
    return idx.get(id) || null;
  };
  A.all = () => ops();
  // a definition: what an activity is for, when it can be, who does what, its steps, its words, how it ends (see auditoria-c1 §4.2)
  A.def = function (id, spec) { A.DEFS[id] = Object.assign({ id, acts: {} }, spec); return A.DEFS[id]; };
  A.log = function (op, code, a, b) { const L = op.log || (op.log = []); L.push([G.S.day, Math.round(G.S.clock * 10) / 10, code, a === undefined ? 0 : a, b === undefined ? 0 : b]); if (L.length > 40) L.splice(1, L.length - 40); };
  A.start = function (id, o) {
    const S = G.S; const def = A.DEFS[id]; if (!def) return null;
    o = o || {};
    const op = {
      id: S.nextId++, def: id, st: o.st || 'on', born: S.day, t0: Math.round(S.clock * 10) / 10, upd: S.clock,
      set: o.set || 0, fac: o.fac || 0, at: o.at || 0, from: o.from || null, srcs: o.srcs || [], to: o.to || null, stage: o.stage || null, refs: o.refs || [],
      goods: Object.assign({}, o.goods || {}), done: {}, lost: {}, moved: {}, taken: {}, back: {}, roles: {}, rsv: [], pay: o.pay || null, keys: [], log: [],
      why: o.why || '', by: o.by || 0, end: null, x: o.x || 0, y: o.y || 0, data: o.data || {},
    };
    ops().push(op); idxN = -1; byP = null;
    if (!G.inSim) A.outside = (A.outside || 0) + 1;
    A.log(op, 'inicio', o.why || '');
    if (def.onStart) def.onStart(op, o);
    return op;
  };
  // the end of an operation: what it held is let go, what is owed is settled by its own rule, the evidence stays
  A.end = function (op, st, why) {
    if (!op || !live(op)) return;
    const S = G.S; const def = A.DEFS[op.def];
    op.st = st || 'ok'; op.end = { day: S.day, t: Math.round(S.clock * 10) / 10, why: why || '' };
    op.rsv = []; A._rv++;
    // (crates of this operation still on the quay are nobody's errand now: free for the next one)
    if (op.at) { const b = S.buildings.get(op.at); if (b && b.crates) for (const c of b.crates) if (c.op === op.id) { c.by = 0; c.op = 0; } }
    for (const o of loose()) if (o.op === op.id) o.op = 0;
    A.log(op, st || 'ok', why || '');
    if (def && def.onEnd) try { def.onEnd(op, st, why); } catch (e) { console.error('[Atividades] fim', e); }
    byP = null;
  };
  A.pause = function (op, why) { if (!op || !live(op) || op.st === 'wait' && op.wait === why) return; op.st = 'wait'; op.wait = why; A.log(op, 'parou', why); };
  A.resume = function (op) { if (!op || op.st !== 'wait') return; op.st = 'on'; A.log(op, 'voltou', op.wait); op.wait = ''; };
  // the people of an operation and their roles
  A.join = function (op, v, role) {
    if (!op || !v || !live(op)) return false;
    const cur = A.roleOf(v); if (cur && cur.op !== op && cur.op.def === op.def && !A.DEFS[op.def].many) A.leave(cur.op, v, 'outra');
    const R = op.roles || (op.roles = {});
    if (!R[v.id]) { R[v.id] = { r: role || 'mao', t: Math.round(G.S.clock * 10) / 10, n: 0, body: G.Possess && G.Possess.is(v) ? 1 : 0 }; A.log(op, 'entrou', v.id, role || 'mao'); }
    byP = null; return true;
  };
  A.leave = function (op, v, why) {
    if (!op || !op.roles || !op.roles[v.id || v]) return;
    const id = v.id || v; delete op.roles[id]; A.log(op, 'saiu', id, why || ''); byP = null;
    if (op.at) { const b = G.S.buildings.get(op.at); if (b && b.crates) for (const c of b.crates) if (c.op === op.id && c.by === id) c.by = 0; }
  };
  // which operation a person works in (one at a time; a business is another thing: G.Biz)
  let byP = null, byS = null;
  A.roleOf = function (v) {
    const S = G.S; if (!v) return null;
    if (!byP || byS !== S) { byP = new Map(); byS = S; for (const op of ops()) if (live(op)) for (const id in op.roles || {}) byP.set(+id, op); }
    const op = byP.get(v.id || v); if (!op) return null;
    return { op, role: op.roles[v.id || v].r, me: op.roles[v.id || v] };
  };
  A.role = v => { const r = A.roleOf(v); return r ? { op: r.op.id, def: r.op.def, role: r.role, step: v.task && v.task.op === r.op.id ? v.task.st : null } : null; };
  A.of = v => ops().filter(op => op.roles && op.roles[v.id || v]);
  // who can still work: alive, free, not a captive, not jailed, not at sea, not in a cave
  A.able = function (v) { return !!(v && G.S.villagers.has(v.id) && !v.captive && !v.jail && !v.aboard && !v.ug && !v.held && v.age >= 12 && v.hp > 15); };

  // ------------------------------ the overseer ------------------------------
  // once a second of the world (in the skip too): each operation looks at its people, its places and its goods
  let tick = 0, tPrune = 0, lastBody = 0;
  G.worldHooks.push(() => { tick = 0; tPrune = 0; lastBody = 0; caps.clear(); });
  A.update = function (dt) {
    const S = G.S; if (!S) return;
    // (the god took a body or gave one back: the person stays in what they were doing)
    const body = S.avatar ? S.avatar.id : 0;
    if (body !== lastBody) { if (lastBody) A.possessed(lastBody, false); if (body) A.possessed(body, true); lastBody = body; }
    // the people, every step: whoever died, was taken, jailed or carried off leaves the operation (what they carried stays
    // where it fell) — the doors of those fates let go at once (below); this catches any other way
    for (const op of ops()) {
      if (!live(op)) continue;
      for (const id in op.roles || {}) {
        const v = S.villagers.get(+id);
        if (!v) { A.leave(op, +id, 'morte'); continue; }
        if (!A.able(v) && !(op.roles[id].body)) A.leave(op, v, v.captive ? 'cativo' : v.jail ? 'preso' : v.aboard ? 'embarcou' : 'incapaz');
      }
    }
    tick += dt; if (tick < 1) return; const step = tick; tick = 0;
    for (const op of ops()) {
      if (!live(op)) continue;
      const def = A.DEFS[op.def]; if (!def) { A.end(op, 'cancel', 'sem definição'); continue; }
      try { if (def.tick) def.tick(op, step); } catch (e) { G.modErr.Atividades = (G.modErr.Atividades || 0) + 1; if (G.modErr.Atividades <= 3) console.error('[Atividades]', op.def, e); }
    }
    for (const f of A.hooks.tick) { try { f(step); } catch (e) { G.modErr.Atividades = (G.modErr.Atividades || 0) + 1; if (G.modErr.Atividades <= 3) console.error('[Atividades]', e); } }
    // the ended ones are kept a day for the diary, the summaries and the checker, then let go
    tPrune += step; if (tPrune >= 20) { tPrune = 0; const L = ops(); const keep = L.filter(op => live(op) || (op.end && S.day - op.end.day < 1.5)); if (keep.length !== L.length) { S.acts = keep; idxN = -1; byP = null; A._rv++; } }
  };
  // the god's body: it keeps its role (the overseer gives it no task: the player does the steps, or not)
  A.possessed = function (v, on) {
    const S = G.S; const id = v && v.id ? v.id : v; const r = A.roleOf(id);
    if (r) { r.me.body = on ? 1 : 0; if (on) r.me.bt = S.clock; A.log(r.op, on ? 'corpo' : 'devolvido', id); }
    for (const f of A.hooks.possess) f(id, on);
  };
  A.isBody = v => !!(G.Possess && G.Possess.is && G.Possess.is(v));

  // ------------------------------ the hand: a task for a step of an operation ------------------------------
  // (an operation's step is given through setTask/Vg.give, so the jail, the god's body and the world's emergencies
  // are asked first, as for any errand)
  A.give = function (v, t, force) {
    if (A.isBody(v)) { if (G.Possess && G.Possess.ask) G.Possess.ask(v, t); return null; } // (a call the player sees)
    if (force) return G.Vg.setTask(v, t);
    return G.Vg.give(v, t) ? v.task : null;
  };
  // a load that knows where it goes (a crate of an operation, a purchase on its way home) after its errand was lost
  // (a save, an interruption): the operation, or the destination written on it, takes it there
  A.resumeCarry = function (v, H) {
    const c = v.carry; if (!c || !(c.n > EPS)) return null;
    if (c.op) {
      const op = A.get(c.op);
      if (op && live(op)) {
        const def = A.DEFS[op.def]; if (def && def.resume) { const t = def.resume(op, v, H); if (t) return t; }
        // (an operation with no rule of its own for it: the load goes on to the operation's destination, or back to its source)
        const to = op.to && D.exists(op.to) ? op.to : op.from && D.exists(op.from) ? op.from : null;
        if (to && reachable(v, to)) return H.setTask(v, { type: 'carga', to, op: op.id, pri: 1, st: 0 });
      } else c.op = 0; // (its operation is over: the load is simply a load now)
    }
    if (c.to && D.exists(c.to) && reachable(v, c.to)) return H.setTask(v, { type: 'carga', to: c.to, pri: 1, st: 0 });
    return null;
  };
  // ... and when it cannot get there now (the way cut): a load of an operation is set down where its porter stands, by its
  // rule, for a hand that can reach it; a load for a place — a purchase for the house, goods for a stall — stays in the
  // arms, the day's work waiting, and goes when the way opens; after a whole day of it, or with its place gone, the
  // people's store keeps it, written in the ledger (never the common store in silence, never lost)
  A.holdCarry = function (v, H) {
    const c = v.carry; if (!c || !(c.n > EPS)) return null;
    if (c.op) {
      const op = A.get(c.op); const def = op && A.DEFS[op.def];
      if (op && live(op)) { if (def && def.drop) def.drop(op, v, 'sem caminho'); else D.drop('v:' + v.id, c.k, c.n, v.x, v.y, { op: op.id, code: 'pousou', by: v.id, fac: G.Fac.idOfV(v) }); return null; }
      c.op = 0;
    }
    if (!c.to) return null;
    const S = G.S;
    if (D.exists(c.to)) { if (!c.held) c.held = S.clock; if (S.clock - c.held < G.DAY_LEN) return H.setTask(v, { type: 'idle', wait: 8, pri: 0.3 }); }
    const f = 'f:' + G.Fac.idOfV(v);
    if (D.exists(f)) D.move('v:' + v.id, f, c.k, c.n, { code: D.exists(c.to) ? 'sem-caminho' : 'sem-destino', by: v.id, part: true });
    if (v.carry) { v.carry.to = null; v.carry.held = 0; } // (what the store had no room for: a plain load now)
    return null;
  };
  // (a place one cannot walk to now is no errand now — a wall went up, the bridge fell: the load stays in the arms,
  // still the house's, and goes there when the way opens; asked of the map of regions)
  function reachable(v, ref) {
    const [kind] = D.parse(ref); const b = kind === 'f' ? G.Village.nearestDropoff(v.x, v.y, v.set) : placeOf(ref);
    if (!b) return true; // (gone: the errand itself finds another place)
    const d = G.Vg.door(b); return G.W.reaches(v, d[0], d[1]);
  }
  // carrying a load to where it belongs (home, a stall, a store): the walk, then the transfer
  function placeOf(ref) {
    const [kind, id] = D.parse(ref); const S = G.S;
    if (kind === 'h' || kind === 'b' || kind === 'q') return S.buildings.get(id) || null;
    const ad = AD[kind]; if (ad && ad.place) { const o = ad.obj(id); return o ? ad.place(o) : null; }
    return null;
  }
  A.placeOf = placeOf;
  function runCarga(v, t, dt, H) {
    const c = v.carry; if (!c || !(c.n > EPS)) return H.end(v);
    let to = t.to; const [kind, fid] = D.parse(to);
    let b = kind === 'f' ? G.Village.nearestDropoff(v.x, v.y, v.set) : placeOf(to);
    if (kind === 'f' && b && G.Village.facOfSet(b.set) !== fid) b = null;
    if (!b) { // (the place is gone: home without a house is the purse or the people's store)
      const alt = v.home && G.S.buildings.get(v.home) ? 'h:' + v.home : 'f:' + G.Fac.idOfV(v);
      if (alt === to) return H.end(v); t.to = alt; c.to = alt; t.wk = null; return;
    }
    // (no way there now: the errand ends and the load keeps where it belongs — it goes when the way opens, never elsewhere)
    if (t.st === 0) { if (!G.Vg.gotoB(v, b, 0.2)) return H.end(v); t.st = 1; return; }
    // (the walk ends when the path does; a path cut on the way is no arrival: one puts things away only at the door)
    if (t.st === 1) { if (!H.move(v, dt)) return; if (G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) > Math.max(b.w, b.h) + 1.2) { t.rt = (t.rt || 0) + 1; if (t.rt > 3) return H.end(v); t.st = 0; return; } t.st = 2; v.actT = 0; v.act = A.ANIM.pousar.act; return; }
    v.act = A.ANIM.pousar.act; G.Village.center && G.faceTo(v, b.x + b.w / 2 - v.x, b.y + b.h / 2 - v.y);
    if (v.actT < A.ANIM.pousar.contact) return;
    const r = D.move('v:' + v.id, to, c.k, c.n, { op: c.op || 0, code: c.bought ? 'compra-em-casa' : 'entrega', by: v.id, part: true });
    if (r.ok && c && c.n > EPS) { t.st = 3; } // (what did not fit stays in the arms)
    if (!v.carry) { G.FX && G.FX.deposit(v.x, v.y, r.e ? r.e[5] : 'food', r.n); return H.end(v); }
    // (the rest did not fit: the people's store, or it stays in the arms for later)
    v.carry.to = kind === 'f' ? null : 'f:' + G.Fac.idOfV(v); H.end(v);
  }
  A.ANIM = {
    // the gestures of the activities: the act the 3D shows, its length and the moment of contact (seconds of the world)
    levantar: { act: 'lift', dur: 1.0, contact: 0.6, hands: 2 },
    pousar: { act: 'lift', dur: 0.8, contact: 0.5, hands: 2 },
    empilhar: { act: 'lift', dur: 1.1, contact: 0.7, hands: 2 },
    carregar: { act: '', dur: 0, contact: 0, hands: 2 },
    carregarPesado: { act: '', dur: 0, contact: 0, hands: 2, heavy: 1 },
    carregarDois: { act: '', dur: 0, contact: 0, hands: 2, pair: 1 },
    porNaBanca: { act: 'arrange', dur: 1.2, contact: 0.8, hands: 2 },
    tirarDaBanca: { act: 'arrange', dur: 0.9, contact: 0.5, hands: 2 },
    entregar: { act: 'give', dur: 0.8, contact: 0.5, hands: 1 },
    receberMoedas: { act: 'pay', dur: 0.8, contact: 0.5, hands: 1 },
    pagar: { act: 'pay', dur: 0.8, contact: 0.5, hands: 1 },
    pechinchar: { act: 'haggle', dur: 2.2, contact: 1.6, hands: 0 },
    examinar: { act: 'examine', dur: 1.6, contact: 1.2, hands: 1 },
    contar: { act: 'count', dur: 2.4, contact: 2.0, hands: 1 },
    chamarAjuda: { act: 'call', dur: 1.2, contact: 0.6, hands: 0 },
    apontar: { act: 'point', dur: 1.0, contact: 0.5, hands: 1 },
    esperar: { act: 'wait', dur: 0, contact: 0, hands: 0 },
    vender: { act: 'sell', dur: 0, contact: 0, hands: 0 },
    comprar: { act: 'buy', dur: 0, contact: 0, hands: 0 },
  };

  // ============================== the body: offers, begin, commit ==============================
  // (what the god's body can do here, by the same steps the people use; offers only read and may be asked from a frame,
  // begin/commit/abort change the world and belong in the world's step: the body's queue of intentions)
  A.offers = function (v, x, y, r) {
    const out = []; if (!v) return out;
    for (const id in A.DEFS) { const def = A.DEFS[id]; if (!def.offers) continue; try { for (const o of def.offers(v, x, y, r || 2.5) || []) { o.def = id; out.push(o); } } catch (e) { /* an offer that fails to be read is not offered */ } }
    return out;
  };
  const hands = new Map(); let handN = 0;
  G.worldHooks.push(() => { hands.clear(); handN = 0; });
  A.begin = function (v, offer) {
    const def = offer && A.DEFS[offer.def]; const act = def && def.acts[offer.act]; if (!act) return { ok: false, why: 'Não dá para fazer isso.' };
    const c = act.can ? act.can(v, offer) : { ok: true }; if (!c.ok) return c;
    const b = act.begin ? act.begin(v, offer) : { ok: true }; if (!b.ok) return b;
    const h = ++handN; hands.set(h, { v: v.id, offer, t: G.S.clock, b }); return { ok: true, h };
  };
  A.commit = function (h) {
    const H0 = hands.get(h); if (!H0) return { ok: false, why: 'O gesto já tinha terminado.' }; hands.delete(h);
    const v = G.S.villagers.get(H0.v); const def = A.DEFS[H0.offer.def]; const act = def && def.acts[H0.offer.act];
    if (!v || !act) return { ok: false, why: 'Não dá mais.' };
    const c = act.can ? act.can(v, H0.offer, H0.b) : { ok: true }; if (!c.ok) { if (act.abort) act.abort(v, H0.offer, H0.b, c.why); return c; }
    const r = act.run(v, H0.offer, H0.b) || { ok: true };
    if (r.ok && G.Possess && G.Possess.is(v) && act.deed) G.Possess.deed(act.deed, r.n || 1);
    return r;
  };
  A.abort = function (h, why) { const H0 = hands.get(h); if (!H0) return; hands.delete(h); const v = G.S.villagers.get(H0.v); const def = A.DEFS[H0.offer.def]; const act = def && def.acts[H0.offer.act]; if (v && act && act.abort) act.abort(v, H0.offer, H0.b, why); };
  A.perform = function (v, offer) { const b = A.begin(v, offer); if (!b.ok) return b; return A.commit(b.h); };

  // ============================== what a place can do (the world's capability profile) ==============================
  const caps = new Map();
  A.caps = function (set) {
    const S = G.S; if (!set) return null; const key = set.id;
    const c0 = caps.get(key); if (c0 && c0.day === S.day && c0.S === S) return c0.c;
    const f = G.Fac.get(set.fac); const has = t => !!(f && G.Civ.has(f.id, t));
    const mine = []; for (const b of S.buildings.values()) if (b.set === set.id && b.built) mine.push(b);
    const of = t => mine.filter(b => b.type === t);
    const N = G.N; const T = G.T; let sea = 0, river = 0;
    for (let dy = -14; dy <= 14; dy += 2) for (let dx = -14; dx <= 14; dx += 2) { const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; if (!W.inb(x, y)) continue; const t = S.type[y * N + x]; if (t === T.RIVER) river++; else if (t <= T.SEA) sea++; }
    const docks = of('doca'), wh = of('armazem');
    const fish = (S.fish || []).some(q => G.dist(q.x, q.y, set.cx, set.cy) < 30);
    const term = wh[0] || of('storehouse')[0] || of('celeiro')[0] || of('mercado')[0] || of('praca')[0] || of('campfire')[0] || null;
    const c = {
      agua: { mar: sea > 0, rio: river > 0, costa: sea > 0 && docks.length > 0 || sea > 3, peixe: fish || river > 0 || sea > 0 },
      porto: { docas: docks.map(b => b.id), armazem: wh.length ? wh[0].id : 0, navios: S.ships.filter(s => docks.some(d => d.id === s.dock)).length, nome: docks.length ? G.Village.buildName(docks[0]) : null },
      terminal: term ? { id: term.id, tipo: term.type, nome: G.Village.buildName(term) } : null,
      comercio: { moeda: has('moeda'), troca: !has('moeda'), mercado: of('mercado').map(b => b.id), feira: of('feira').map(b => b.id), taverna: of('taverna').map(b => b.id), rotas: (S.seaRoutes || []).filter(r => r.ok && docks.some(d => d.id === r.a || d.id === r.b)).length, carrocas: (S.routes || []).filter(r => r.ok && (r.a === set.id || r.b === set.id)).length },
      tecnica: { conhece: f && f.tech ? Object.keys(f.tech.known || {}).filter(k => f.tech.known[k]) : [], roda: has('roda'), escrita: has('escrita'), navegacao: has('navegacao'), moeda: has('moeda'), engenharia: has('engenharia'), era: S.era || 0 },
      povo: { civ: f ? f.civ : null, nome: f ? f.name : '', gov: f ? f.gov : null, pop: G.Village.pop(set.id), tier: set.tier || 0 },
      clima: { bioma: G.Biome && G.Biome.nameAt ? G.Biome.nameAt(set.cx, set.cy) : null, frio: !!(G.Biome && G.Biome.coldAt && G.Biome.coldAt(set.cx, set.cy)) },
      materiais: { madeira: f ? Math.floor(f.stock.wood || 0) : 0, pedra: f ? Math.floor(f.stock.stone || 0) : 0, argila: river > 0, bens: f ? Object.keys(f.stock).filter(k => (f.stock[k] || 0) >= 1 && k !== 'moedas') : [] },
      transporte: { animal: f && f.civ === 'asteca' ? null : 'cavalo', costas: !!(f && f.civ === 'asteca'), carroca: has('roda'), barco: docks.length ? (f && (f.civ === 'asteca' || f.civ === 'egipcio') ? 'canoa' : 'barco') : null },
    };
    caps.set(key, { day: S.day, S, c });
    return c;
  };
  // what this person could take up here and now (what has no ground in the world is not offered at all)
  A.avail = function (v) {
    const out = []; const set = v && G.S.settlements.get(v.set); if (!set) return out; const c = A.caps(set);
    for (const id in A.DEFS) { const def = A.DEFS[id]; if (!def.avail) continue; let r = null; try { r = def.avail(c, v, set); } catch (e) { r = null; } if (r && (r.ok || r.why)) out.push(Object.assign({ def: id, name: def.name || id }, r)); }
    return out;
  };

  // ============================== the diary of a life (the data; C3 draws it) ==============================
  // only what the person did, saw, heard or promised: nothing the god knows and they do not
  A.note = function (v, kind, txt, o) {
    if (!v || !txt) return;
    const L = v.diary || (v.diary = []);
    if (L.length && L[L.length - 1].txt === txt) return;
    L.push(Object.assign({ kind, txt, day: G.S.day }, o || {})); if (L.length > 30) L.splice(0, L.length - 30);
  };
  A.diary = function (v) {
    const S = G.S; const out = { doing: [], goals: [], promises: [], found: [], rumors: [], memories: [], options: [] }; if (!v) return out;
    for (const op of A.of(v)) { if (!live(op)) continue; const def = A.DEFS[op.def]; out.doing.push({ id: op.id, kind: 'doing', txt: def && def.title ? def.title(op, v) : op.def, day: op.born, st: op.st, op: op.id }); }
    for (const f of A.hooks.diary) { try { f(v, out); } catch (e) { /* a part of the diary that fails is left out */ } }
    for (const e of v.diary || []) { const k = e.kind === 'goal' ? 'goals' : e.kind === 'promise' ? 'promises' : e.kind === 'found' ? 'found' : e.kind === 'rumor' ? 'rumors' : e.kind === 'option' ? 'options' : 'memories'; out[k].push(Object.assign({ id: 0 }, e)); }
    if (G.Life) for (const e of G.Life.bioList(v).slice(-8)) out.memories.push({ id: 0, kind: 'memory', txt: e.txt, day: e.d });
    // (rumours: what the person's people heard, with how sure it is — a rumour is not a fact)
    if (G.Know && G.Know.rumorsOf) { try { for (const r of G.Know.rumorsOf(G.Fac.idOfV(v)) || []) out.rumors.push({ id: r.id || 0, kind: 'rumor', txt: r.claim || r.text || '', day: r.day || 0, conf: r.conf }); } catch (e) { /* a people without rumours */ } }
    for (const a of A.avail(v)) if (a.ok && a.known !== false) out.options.push({ id: 0, kind: 'option', txt: a.txt || a.name, day: S.day, def: a.def });
    return out;
  };
  // what an operation was, for the person in it and for the panel: its title, its state, its goods, its people
  A.summary = function (op, v) {
    if (!op) return null; const def = A.DEFS[op.def] || {};
    const me = v && op.roles && op.roles[v.id];
    const goods = {}; for (const k of new Set(Object.keys(op.goods || {}).concat(Object.keys(op.done || {})))) goods[k] = { manifesto: (op.goods || {})[k] || 0, feito: (op.done || {})[k] || 0, perdido: (op.lost || {})[k] || 0 };
    const pay = op.pay || {}; const id = v && v.id;
    return { id: op.id, def: op.def, title: def.title ? def.title(op, v) : op.def, state: A.STATES[op.st] || op.st, wait: op.wait || '', goods, team: Object.keys(op.roles || {}).map(Number), me: me ? { papel: me.r, feito: me.n || 0, pago: (pay.paid || {})[id] || 0, devido: (pay.owed || {})[id] || 0 } : null, end: op.end, log: (op.log || []).slice(-12) };
  };

  // ============================== the hands of the world (the old errands, kept honest) ==============================
  // an errand ended (a call to a fire, a feast, the god's body taken): a load of an operation goes back where the
  // operation keeps it, unless the hands keep it (keepLoad: the god's body goes on carrying it)
  const end0 = G.Vg.endTask;
  G.Vg.endTask = function (v, o) {
    const t = v.task;
    if (!(o && o.keepLoad) && t && v.carry && v.carry.op && t.op === v.carry.op) {
      const op = A.get(v.carry.op); const def = op && A.DEFS[op.def];
      if (op && live(op) && def && def.drop) def.drop(op, v, 'chamado');
    }
    const r = end0(v, o);
    // (an errand ended because the person was led to a cell, or taken: out of the operations at once)
    if (v && !A.able(v) && G.S.villagers.has(v.id) && A.roleOf(v) && !A.isBody(v)) letGo(v, v.jail ? 'preso' : v.captive ? 'cativo' : 'incapaz');
    return r;
  };
  // whoever can no longer work — taken captive, carried off to sea, led to a cell — leaves every operation at once, and a
  // load of an operation in the arms stays where they stood (a thing on the ground, for another hand)
  function letGo(v, why) {
    if (!v || !G.S.villagers.has(v.id)) return;
    const c = v.carry;
    if (c && c.n > EPS && c.op && !v.aboard) { const op = A.get(c.op); if (op && live(op)) { D.drop('v:' + v.id, c.k, c.n, v.x, v.y, { op: op.id, code: 'pousou', by: v.id, fac: G.Fac.idOfV(v) }); A.log(op, 'pousou', v.id, why); } }
    for (const op of ops()) if (live(op) && op.roles && op.roles[v.id]) A.leave(op, v, why);
    for (const f of A.hooks.gone) f(v, why);
  }
  A.letGo = letGo;
  const enslave0 = G.War && G.War.enslave;
  if (enslave0) G.War.enslave = function (v) { if (v) letGo(v, 'cativo'); return enslave0.apply(this, arguments); };
  const board0 = G.Naval && G.Naval.board;
  if (board0) G.Naval.board = function (v) { if (v) letGo(v, 'embarcou'); return board0.apply(this, arguments); };
  // who dies with a load of an operation in the arms drops it where they fell (a thing on the ground, for another hand)
  const kill0 = G.Village.kill;
  G.Village.kill = function (v, cause, byGod) {
    const c = v && v.carry;
    if (c && c.n > EPS && (c.op || c.cid) && G.S.villagers.has(v.id) && !v.aboard) {
      const op = c.op && A.get(c.op);
      D.drop('v:' + v.id, c.k, c.n, v.x, v.y, { op: op && live(op) ? op.id : 0, code: 'caiu', by: v.id, fac: G.Fac.idOfV(v) });
      if (op) A.log(op, 'caiu', v.id, cause || '');
    }
    // (death is the one door out of the world: the dead leave every operation, and what they ran, at once)
    if (v && G.S.villagers.has(v.id)) { for (const op of ops()) if (live(op) && op.roles && op.roles[v.id]) A.leave(op, v, 'morte'); for (const f of A.hooks.gone) f(v, 'morte'); }
    return kill0.apply(this, arguments);
  };

  // ============================== the task machines of this file ==============================
  const E = G.Eco;
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'carga') { runCarga(v, t, dt, H); return true; } return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'carga') { const [kind, id] = D.parse(t.to); const nm = v.carry ? E.name(v.carry.k) : 'a carga'; return kind === 'h' ? (id === v.home ? `Levando ${nm} para casa` : `Levando ${nm} para outra casa`) : kind === 'z' ? `Levando ${nm} para a banca` : `Levando ${nm} ao armazém`; }
    if (t.op) { const op = A.get(t.op); const def = op && A.DEFS[op.def]; if (def && def.text) { const s = def.text(v, t, op); if (s) return s; } }
    return oldText(v, t);
  };

  // ============================== the checker's canon and the save ==============================
  A.canon = function () {
    const S = G.S;
    const o = ops().filter(live).map(op => [op.id, op.def, op.st, Object.keys(op.goods || {}).sort().map(k => k + '=' + r4(op.goods[k])).join(','), Object.keys(op.done || {}).sort().map(k => k + '=' + r4(op.done[k])).join(','), Object.keys(op.roles || {}).length]);
    const more = A.hooks.canon.map(([k, f]) => [k, f()]);
    return { ops: o, loose: loose().map(x => [x.id, x.k, r4(x.n)]), ledgerN: S.ledgerN || 0, more };
  };
  const num = (x, d) => (fin(x) ? x : d);
  const cleanMap = m => { const o = {}; if (m && typeof m === 'object') for (const k in m) if (fin(m[k])) o[k] = m[k]; return o; };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) {
      const S = G.S;
      out.acts = ops().filter(op => live(op) || (op.end && S.day - op.end.day < 1.5));
      out.loose = loose(); out.ledger = ledger().slice(-400); out.ledgerN = S.ledgerN || 0; out.actKeys = (S.actKeys || []).slice(-120);
    },
    load(o) {
      const S = G.S;
      // (a save from before the activities has none of this: the world simply starts without operations)
      S.acts = Array.isArray(o.acts) ? o.acts.filter(op => op && Number.isInteger(op.id) && typeof op.def === 'string').map(op => Object.assign(op, {
        goods: cleanMap(op.goods), done: cleanMap(op.done), lost: cleanMap(op.lost), moved: cleanMap(op.moved), taken: cleanMap(op.taken), back: cleanMap(op.back), roles: op.roles && typeof op.roles === 'object' ? op.roles : {},
        rsv: Array.isArray(op.rsv) ? op.rsv.filter(r => Array.isArray(r) && typeof r[0] === 'string' && fin(r[2])) : [], keys: Array.isArray(op.keys) ? op.keys : [], log: Array.isArray(op.log) ? op.log : [],
        data: op.data && typeof op.data === 'object' ? op.data : {}, upd: num(op.upd, S.clock), born: num(op.born, S.day),
        srcs: Array.isArray(op.srcs) ? op.srcs.filter(x => typeof x === 'string') : [], stage: typeof op.stage === 'string' ? op.stage : null,
      })) : [];
      S.loose = Array.isArray(o.loose) ? o.loose.filter(x => x && Number.isInteger(x.id) && fin(x.n) && x.n > 0 && fin(x.x) && fin(x.y)) : [];
      S.ledger = Array.isArray(o.ledger) ? o.ledger.filter(Array.isArray) : []; S.ledgerN = num(o.ledgerN, S.ledger.length ? S.ledger[S.ledger.length - 1][0] : 0);
      S.actKeys = Array.isArray(o.actKeys) ? o.actKeys : [];
      // (the errands were not saved: the people of an operation get their steps again from what is confirmed; the
      // operations whose definitions this build does not know are closed, and nobody waits on them)
      for (const op of S.acts) { if (live(op) && !A.DEFS[op.def]) { op.st = 'cancel'; op.end = { day: S.day, t: S.clock, why: 'desconhecida' }; } for (const id in op.roles) if (op.roles[id]) op.roles[id].body = 0; }
      // (crates of a quay saved before they had names get one now — a crate is a thing, and things have names)
      for (const b of S.buildings.values()) if (b.crates) for (const c of b.crates) { if (!Number.isInteger(c.id)) c.id = S.nextId++; if (c.op && !S.acts.some(op => op.id === c.op && live(op))) c.op = 0; c.by = 0; }
      idxN = -1; byP = null; A._rv++; caps.clear(); hands.clear();
    },
  });
})(window.G);
