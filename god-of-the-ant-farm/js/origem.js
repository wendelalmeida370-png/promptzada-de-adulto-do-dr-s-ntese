'use strict';
// ============================================================
//  A origem das coisas (G.Origem; a parte 20h, D-440: nada vem
//  do nada). Three goods of the world are kept by parts, each part
//  saying where that much of it came from, and the parts always
//  add up to what the holder has:
//   - the food (food): the grain of each field (trigo, cevada,
//     arroz, milho, sorgo), the fish, the shellfish, the meat, the
//     milk, the eggs, the garden's, the fruit, the founders' stores;
//   - the tools and the weapons of a store (ferramentas, armas):
//     the metal they were forged of (bronze, ferro) — or the stone
//     of a save from before.
//  The parts move with the good, by the one door every good moves
//  by (G.Depot): a move, a make, a use, a drop carries its parts
//  along — the ones a recipe asks for (c.of: the beer takes only
//  grain), or by a fixed rule, no chance (O.RULE: what spoils first
//  is eaten first; the best tool or weapon is the one taken). What
//  the world still writes by hand (the levy, a ship's cargo, a gift
//  between peoples) passes its parts by O.carried; what appears
//  with no part known is counted as of unknown origin ('?'), never
//  hidden. And what a people has ever had of each material
//  (O.had: copper, tin, bronze, iron, gold, leather), entered by
//  a true source — mined, forged, hunted, bought, looted — is
//  what lets its kit be drawn in it: the art only permits, the
//  material makes it possible. The map of the causes: ORIGEM.md.
// ============================================================
(function (G) {
  const D = G.Depot, E = G.Eco; if (!D || !E) return;
  const O = G.Origem = {};
  const EPS = 1e-6;
  const r4 = x => Math.round(x * 1e4) / 1e4;
  const fin = x => typeof x === 'number' && isFinite(x);

  // ------------------------------ the parts ------------------------------
  // the food's kinds (nome: how it is said; cereal: grain a vat brews; peixe: the catch)
  O.FOOD = {
    trigo: { nome: 'trigo', cereal: 1 }, cevada: { nome: 'cevada', cereal: 1 }, arroz: { nome: 'arroz', cereal: 1 }, milho: { nome: 'milho', cereal: 1 }, sorgo: { nome: 'sorgo', cereal: 1 },
    peixe: { nome: 'peixe', peixe: 1 }, marisco: { nome: 'marisco' }, carne: { nome: 'carne' }, leite: { nome: 'leite' }, ovos: { nome: 'ovos' },
    horta: { nome: 'legumes da horta' }, fruta: { nome: 'fruta' }, mel: { nome: 'mel' }, azeite: { nome: 'azeite' }, provisao: { nome: 'provisões dos fundadores' }, '?': { nome: 'de origem desconhecida' },
  };
  O.CEREAL = Object.keys(O.FOOD).filter(k => O.FOOD[k].cereal);
  O.MEAT = ['carne', 'peixe']; // (what the salting yard salts)
  // the metal of a tool or a weapon of a store (stone: a save from before, or what a stone people keeps)
  O.METAL = { ferro: { nome: 'de ferro', ord: 2 }, bronze: { nome: 'de bronze', ord: 1 }, pedra: { nome: 'de pedra', ord: 0 }, '?': { nome: 'de origem desconhecida', ord: 0 } };
  O.KEPT = { food: O.FOOD, ferramentas: O.METAL, armas: O.METAL };
  O.kept = k => !!O.KEPT[k];
  // the fixed rule: the order the parts leave in when nobody asks which — the unknown first (it is let go first), what spoils
  // first eaten first (the grain keeps, and goes last); the best tool and weapon is the one taken (the levy, the thief, the wear)
  O.RULE = {
    food: ['?', 'peixe', 'marisco', 'carne', 'leite', 'ovos', 'horta', 'fruta', 'mel', 'azeite', 'provisao', 'sorgo', 'milho', 'arroz', 'cevada', 'trigo'],
    ferramentas: ['ferro', 'bronze', 'pedra', '?'], armas: ['ferro', 'bronze', 'pedra', '?'],
  };
  // what a make with no part named makes, by the cause the ledger gives it (the code)
  const CODE_OF = { food: { pesca: 'peixe', ordenha: 'leite', ovos: 'ovos', abate: 'carne', caca: 'carne', sacrificio: 'carne', horta: 'horta', fruta: 'fruta' } };
  // the food of a load in the hands, by its marks (the same marks the fair reads: Riches.foodKey)
  function fromMarks(c) {
    if (!c || c.k !== 'food') return null;
    if (c.meat) return 'carne';
    if (c.fish) return 'peixe';
    if (c.shell) return 'marisco';
    if (typeof c.grain === 'string' && O.FOOD[c.grain]) return c.grain;
    if (c.berries || (c.basket && !c.leaves && !c.must)) return 'fruta';
    return null;
  }
  O.fromMarks = fromMarks;

  // ------------------------------ where the parts live ------------------------------
  // S.orig = { p: { holder: { good: { part: n } } }, had: { people: { material: day } }, q: { good: n of unknown origin } }
  const st = () => { const S = G.S; if (!S) return null; return S.orig || (S.orig = { p: {}, had: {}, q: {} }); };
  const rec = (ref, k, make) => { const o = st(); if (!o) return null; let h = o.p[ref]; if (!h) { if (!make) return null; h = o.p[ref] = {}; } let p = h[k]; if (!p && make) p = h[k] = {}; return p || null; };
  const sum = p => { let s = 0; if (p) for (const t in p) s += p[t]; return s; };
  // (an amount of unknown origin, counted with its cause: the measure of the holes, ORIGEM.md)
  function odd(k, n, why) { const o = st(); o.q[k] = r4((o.q[k] || 0) + n); const w = o.qw || (o.qw = {}); const key = k + ' · ' + why; w[key] = r4((w[key] || 0) + n); }
  const drop = (ref, k) => { const o = st(); const h = o && o.p[ref]; if (!h) return; delete h[k]; for (const x in h) return; delete o.p[ref]; };
  // (the order to take in: the rule's, then any other part a save may hold, by name)
  function order(k, p) { const R = O.RULE[k] || []; const out = R.filter(t => p[t] > EPS); for (const t of Object.keys(p).sort()) if (!R.includes(t) && p[t] > EPS) out.push(t); return out; }
  const setOf = of => (!of ? null : typeof of === 'string' ? [of] : of);
  O.amountIn = (p, of) => { if (!p) return 0; const L = setOf(of); if (!L) return sum(p); let s = 0; for (const t of L) s += p[t] || 0; return s; };
  // n out of the parts p, by the rule, only of the parts asked (of); → the parts taken
  function take(p, k, n, of) {
    const out = {}; if (!p || !(n > EPS)) return out; const L = setOf(of); let left = n;
    for (const t of order(k, p)) { if (left <= EPS) break; if (L && !L.includes(t)) continue; const m = Math.min(p[t], left); if (m <= EPS) continue; p[t] = r4(p[t] - m); left = r4(left - m); out[t] = r4((out[t] || 0) + m); if (p[t] <= EPS) delete p[t]; }
    return out;
  }
  const addAll = (p, mv) => { for (const t in mv) if (mv[t] > EPS) p[t] = r4((p[t] || 0) + mv[t]); };
  // what an amount found with no part known is, at a holder: the hands say it by their load's marks; the rest is unknown
  function unknownAt(ref, k) {
    if (k !== 'food') return '?';
    const [kind, id] = D.parse(ref);
    if (kind === 'v') { const v = G.S.villagers.get(id); const t = v && fromMarks(v.carry); if (t) return t; }
    if (kind === 'q') { const b = G.S.buildings.get(id); if (b && (b.crates || []).some(x => x.k === 'food' && x.fish)) return 'peixe'; }
    if (kind === 'g') { const o = (G.S.loose || []).find(x => x.id === id); if (o && o.fish) return 'peixe'; }
    return '?';
  }
  // (where an unknown amount was found, for the measure: the kind of holder; for the hands, who and doing what, with what marks)
  const whereOf = ref => { const [kind, id] = D.parse(ref); if (kind !== 'v') return kind; const v = G.S.villagers.get(id); return v ? `v (${v.role || '-'}, ${v.task ? v.task.type : '-'}, ${Object.keys(v.carry || {}).filter(x => x !== 'n' && x !== 'k').join('+') || 'sem marca'})` : 'v'; };
  // (what a holder has of a good: the depot's count — but a cart's, both its loads: it shows the one of its way, the load it took
  // or the one it brings back (city.js), and turning back changes which, with nothing moved — L-1362)
  function total(ref, k) {
    if (ref.charCodeAt(0) === 99 && ref[1] === ':') { const c = (G.S.carts || []).find(x => x.id === +ref.slice(2)); if (!c) return 0; let n = 0; for (const L of [c.goods, c.ret]) if (L && L.k === k) n += L.n || 0; return n; }
    return D.get(ref, k);
  }
  // the parts of a holder made to add up to what it has (the truth: G.Depot.get — or tot, what it had before a make): what is gone
  // by hand leaves by the rule, what came by hand is what the holder's marks say, else unknown — counted. Only the world writes
  // it (write: in a move, a make, the step's own look); from outside, a copy that writes nothing
  function sync(ref, k, write, tot) {
    if (tot === undefined) tot = Math.max(0, total(ref, k));
    const p0 = rec(ref, k, false);
    const p = write ? (p0 || rec(ref, k, true)) : Object.assign({}, p0 || {});
    const s = sum(p);
    if (s > tot + EPS) take(p, k, s - tot, null);
    else if (s < tot - EPS) {
      const t = unknownAt(ref, k); const m = r4(tot - s); p[t] = r4((p[t] || 0) + m);
      if (write && t === '?') odd(k, m, 'à mão em ' + whereOf(ref));
    }
    if (write) { const o = st(); (o.t || (o.t = {}))[ref + '|' + k] = tot; } // (the total these parts were made to add up to: the checker's)
    if (write && !(sum(p) > EPS)) { drop(ref, k); return p; }
    return p;
  }
  // the parts of a holder: { part: n }, adding up to what it has (a fresh copy, for whoever asks: the step, a panel, the checker)
  O.parts = (ref, k) => { if (!O.KEPT[k] || !G.S) return {}; return Object.assign({}, sync(ref, k, G.inSim > 0)); };
  // how much of a good of these parts a holder has, and how much is free of the operations' reservations (a recipe asks it)
  O.amount = (ref, k, of) => O.amountIn(O.parts(ref, k), of);
  O.free = (ref, k, of, exceptOp) => Math.max(0, Math.min(O.amount(ref, k, of), D.free(ref, k, exceptOp)));
  // the part a holder has most of (the drawing of a stall), or null; the part that leaves next by the rule (the dish of a meal)
  O.most = (ref, k, of) => { const p = O.parts(ref, k); const L = setOf(of); let best = null; for (const t of order(k, p)) if ((!L || L.includes(t)) && (!best || p[t] > p[best] + EPS)) best = t; return best; };
  O.next = (ref, k, of) => { const p = O.parts(ref, k); const L = setOf(of); for (const t of order(k, p)) if (!L || L.includes(t)) return t; return null; };

  // ------------------------------ what a people has had (the materials) ------------------------------
  // a material entered a people when its good came into a holder of the people — the store, a house, the hands, a bag — from a
  // true source or from another people that had it; the day it first came is kept (the kit and the fight read it)
  O.MAT_OF = { couro: 'couro', cobre: 'cobre', estanho: 'estanho', ouro: 'ouro', minerio: 'minerio' };
  const ownerFac = ref => { const o = D.owner(ref); return o && o.fac ? o.fac : 0; };
  function mark(fid, m) { if (!fid || !m || m === '?' || O.PLAIN[m]) return; const o = st(); const h = o.had[fid] || (o.had[fid] = {}); if (!h[m]) h[m] = G.S.day || 1; }
  O.had = (fid, m) => { const o = G.S && G.S.orig; const h = o && o.had[fid]; return h ? h[m] || 0 : 0; };
  // a material a people may make and draw things in: wood, stone, and the fibres of the wood (wicker, cord) always — every people
  // fells and quarries —; leather once it has had hides; bronze and iron with the art and the metal had (D-442)
  O.PLAIN = { madeira: 1, pedra: 1, vime: 1, corda: 1 };
  O.matOK = function (fid, m, arts) {
    if (O.PLAIN[m]) return true;
    if (m === 'couro' || m === 'ouro') return !!O.had(fid, m);
    if (m === 'bronze' || m === 'ferro') return !!(arts && arts[m] !== undefined) && !!O.had(fid, m);
    return false;
  };
  // the art of a metal, and the metal had: what the fight and the kit read where they read «bronze» or «ferro» (D-443)
  O.forged = (fid, m) => !!(G.Civ && G.Civ.has(fid, m)) && !!O.had(fid, m);

  // ------------------------------ the door: the depot's moves carry their parts ------------------------------
  // (the parts that came into a holder: its own first, as they were before this came — its hands' marks, the crates —, then
  // these on top; a metal into a holder of a people is a metal the people has had)
  function moved(to, k, mv, n) {
    sync(to, k, true, Math.max(0, total(to, k) - n)); addAll(rec(to, k, true), mv);
    const fid = ownerFac(to); if (fid && k !== 'food') for (const t in mv) if (mv[t] > EPS) mark(fid, t);
    sync(to, k, true);
  }
  const It = G.Itens;
  const thing = k => !!(It && It.THINGS && It.THINGS.has(k));
  // (a material comes into a people with its good — a hide, the ore, the tin — whatever the door; a thing that moves into a
  // people — given, picked up, looted — brings its material with it: it exists, it came from somewhere. A thing made is no
  // proof of its material: the maker must have had it, and the checker asks the ledger, qa/origem-inv.js)
  function arrived(to, k) {
    const fid = ownerFac(to); if (!fid) return;
    if (O.MAT_OF[k]) mark(fid, O.MAT_OF[k]);
    else if (thing(k)) { const m = It.def(k).mat; if (m && !O.PLAIN[m]) mark(fid, m); }
  }
  const move0 = D.move;
  D.move = function (from, to, k, n, c) {
    if (!O.KEPT[k] || !G.S) { const r = move0.apply(this, arguments); if (r && r.ok && !r.again && G.S && (O.MAT_OF[k] || thing(k))) arrived(to, k); return r; }
    c = c || {}; const of = setOf(c.of);
    const pa = sync(from, k, true);
    if (of) { const have = O.amountIn(pa, of); if (have + EPS < n) { if (!c.part) return { ok: false, n: 0, why: 'não há tanto' }; n = r4(have); if (!(n > EPS)) return { ok: false, n: 0, why: 'não há' }; } }
    const r = move0.call(this, from, to, k, n, c);
    if (!r || !r.ok || r.again) return r;
    const mv = take(pa, k, r.n, of); moved(to, k, mv, r.n); sync(from, k, true);
    return r;
  };
  const make0 = D.make;
  D.make = function (to, k, n, c) {
    const r = make0.apply(this, arguments);
    if (!r || !r.ok || r.again || !G.S) return r;
    c = c || {};
    if (O.MAT_OF[k]) { const fid = ownerFac(to); if (fid) mark(fid, O.MAT_OF[k]); }
    if (!O.KEPT[k]) return r;
    // (what it is: the part the maker names, the cause's, the marks of the load it makes — else unknown, counted)
    let t = typeof c.of === 'string' && O.KEPT[k][c.of] ? c.of : null;
    if (!t && CODE_OF[k] && CODE_OF[k][c.code]) t = CODE_OF[k][c.code];
    if (!t && k === 'food') t = fromMarks(Object.assign({ k }, c.rec || {}, c.tag || {}));
    if (!t) { t = '?'; odd(k, r.n, 'feito: ' + (c.code || '?')); }
    moved(to, k, { [t]: r.n }, r.n);
    return r;
  };
  const use0 = D.use;
  D.use = function (from, k, n, c) {
    if (!O.KEPT[k] || !G.S) return use0.apply(this, arguments);
    c = c || {}; const of = setOf(c.of);
    const pa = sync(from, k, true);
    if (of) { const have = O.amountIn(pa, of); if (have + EPS < n) { if (!c.part) return { ok: false, n: 0, why: 'não há tanto' }; n = r4(have); if (!(n > EPS)) return { ok: false, n: 0, why: 'não há' }; } }
    const r = use0.call(this, from, k, n, c);
    if (!r || !r.ok || r.again) return r;
    take(pa, k, r.n, of); sync(from, k, true);
    return r;
  };
  const drop0 = D.drop;
  D.drop = function (from, k, n, x, y, c) {
    if (!O.KEPT[k] || !G.S) return drop0.apply(this, arguments);
    const pa = sync(from, k, true);
    const r = drop0.apply(this, arguments);
    if (!r || !r.ok || r.again) return r;
    const mv = take(pa, k, r.n, null); moved('g:' + r.g, k, mv, r.n); sync(from, k, true);
    return r;
  };
  // what the world still moves by hand (a good out of a store into a ship's hold, into the hands of a raider, into another
  // people's store; the levy's weapon): its parts pass along with it. Called right after the hand that moved it — the giver no
  // longer has it, the receiver has it already (to: null, it went out of the world's holders: an army's wagons, the levy). → the
  // parts carried
  O.carried = function (from, to, k, n) {
    if (!G.S || !(n > EPS)) return {};
    if (!O.KEPT[k]) { if (to) arrived(to, k); return {}; }
    const pa = rec(from, k, true); sync(from, k, true, Math.max(0, total(from, k)) + n); const mv = take(pa, k, n, null);
    const got = sum(mv); if (got < n - EPS) { odd(k, n - got, 'levado à mão'); mv['?'] = r4((mv['?'] || 0) + (n - got)); }
    sync(from, k, true);
    if (to) moved(to, k, mv, n);
    return mv;
  };
  // (two sets of parts as one — what an expedition took aboard at each loading, kept with it to come home: expeditions.js)
  O.mix = (a, b) => { const out = {}; for (const p of [a, b]) if (p && typeof p === 'object') for (const t in p) if (fin(p[t]) && p[t] > EPS) out[t] = r4((out[t] || 0) + p[t]); return out; };
  // a good that came into a holder by hand from a true source (a catch landed, the weapon a soldier brings home): its part — or
  // the parts it came with (t an object: what O.carried took from the giver; as much of them as came, in the same shares)
  O.came = function (to, k, n, t, why) {
    if (!G.S || !(n > EPS)) return;
    if (!O.KEPT[k]) { const fid = ownerFac(to); if (fid && O.MAT_OF[k]) mark(fid, O.MAT_OF[k]); return; }
    if (t && typeof t === 'object') {
      const s = sum(t); if (!(s > EPS)) { odd(k, n, 'chegou: ' + (why || '?')); moved(to, k, { '?': n }, n); return; }
      const mv = {}; let left = n; const ks = order(k, t);
      ks.forEach((x, i) => { const m = i === ks.length - 1 ? r4(left) : r4(n * t[x] / s); if (m > EPS) { mv[x] = r4((mv[x] || 0) + m); left = r4(left - m); } });
      moved(to, k, mv, n); return; // (an unknown part among them is no new unknown: it only moves)
    }
    const ok = !!(t && O.KEPT[k][t] && t !== '?');
    if (!ok) odd(k, n, 'chegou: ' + (why || '?'));
    moved(to, k, { [ok ? t : '?']: n }, n);
  };
  // (the ores of the bronze in the arms: heavy as the iron ore, in sacks — the depot's own weights and packs know the goods of before)
  const weight0 = D.weight; D.weight = (k, n) => (k === 'cobre' || k === 'estanho' ? 3 * (n || 0) : weight0(k, n));
  const form0 = D.form; D.form = (k, civ, r) => (k === 'cobre' || k === 'estanho' ? (r && r.crate ? 'caixa' : 'saco') : form0(k, civ, r));
  // the old door of a delivery into a people's store (G.Village.addStock), now with the part of what came (of)
  const addStock0 = G.Village.addStock;
  G.Village.addStock = function (k, n, fid, of) {
    const add = addStock0.call(this, k, n, fid);
    if (add > 0 && G.S) O.came('f:' + fid, k, add, of || null, 'addStock');
    return add;
  };

  // ------------------------------ the levy (army.js, wars.js): the weapon a levy takes, and gives back ------------------------------
  // (the levy takes the best weapon of the armory, by the rule; its metal goes with the soldier — v._levy — and comes back with
  // him; a soldier of a save from before gives back a weapon of unknown metal)
  O.levy = function (f) { const mv = O.carried('f:' + f.id, null, 'armas', 1); let m = null; for (const t in mv) if (mv[t] > EPS) m = t; return m && m !== '?' ? m : true; };
  O.unlevy = function (f, v) { const m = v && typeof v._levy === 'string' && O.METAL[v._levy] ? v._levy : '?'; O.came('f:' + f.id, 'armas', 1, m, 'a leva de antes'); };

  // ------------------------------ the step's look, the world, the save ------------------------------
  // (once a second of the world: every people's store made to add up — the hands of the world that write it, the meals eaten
  // at the store; once a day, the parts of holders gone or empty let go)
  if (G.Act && G.Act.hooks) G.Act.hooks.tick.push(function () {
    const S = G.S; if (!S) return; const o = st();
    for (const f of S.factions.values()) for (const k in O.KEPT) { const ref = 'f:' + f.id; if ((f.stock[k] || 0) > EPS || (o.p[ref] && o.p[ref][k])) sync(ref, k, true); }
    if (G.mod('orig.day') !== S.day) {
      G.mod('orig.day', S.day); o.t = {};
      for (const ref of Object.keys(o.p)) { if (!D.exists(ref)) { delete o.p[ref]; continue; } for (const k of Object.keys(o.p[ref])) sync(ref, k, true); }
      for (const fid of Object.keys(o.had)) if (!S.factions.has(+fid)) delete o.had[fid];
    }
  });
  // a people born (a world's founders, the freed, a new folk): what its store starts with is the founders' provisions
  const create0 = G.Fac.create;
  G.Fac.create = function () {
    const f = create0.apply(this, arguments);
    if (f && G.S) { const n = f.stock.food || 0; if (n > EPS) { const p = rec('f:' + f.id, 'food', true); p.provisao = r4((p.provisao || 0) + n); } }
    return f;
  };
  // the counts of unknown origin since the world began (the measure: a hole of the map, ORIGEM.md)
  O.unknown = () => Object.assign({}, (G.S && G.S.orig && G.S.orig.q) || {});
  O.unknownWhy = () => Object.assign({}, (G.S && G.S.orig && G.S.orig.qw) || {});
  // (a save of before: the parts born once, by the honest guess — the food of each store by what the people brought home of late
  // (f.foodSrc, the fair's own tally), the houses' and the shelves' as their people's; the tools and the weapons in the metal the
  // people's art knew (a world of before forged them so); the materials had, by what the people holds — D-447)
  const SRC = { grao: null, bagas: 'fruta', marisco: 'marisco', caca: 'carne', porco: 'carne', boi: 'carne', cordeiro: 'carne', aves: 'carne', baleia: 'carne', coelho: 'carne' };
  function guessFood(f) {
    const S = G.S; const m = f.foodSrc || {}; const out = {}; let tot = 0;
    // (the grain of each farm of the people: the one it has, or the one it would have — asked on a copy, never kept: L-394)
    const grainKey = b => { if (b.grain) return b.grain; if (!G.Estates) return null; const c = Object.assign({}, b); G.Estates.grainOf(c); return c.grain || null; };
    const grains = {}; let ng = 0; for (const b of S.buildings.values()) { if (b.type !== 'farm' || G.Village.facOfSet(b.set) !== f.id) continue; const g = grainKey(b); if (g && O.FOOD[g]) { grains[g] = (grains[g] || 0) + 1; ng++; } }
    for (const key of Object.keys(m).sort()) {
      const w = m[key]; if (!(w > 0)) continue; tot += w;
      const t = key.startsWith('peixe') ? 'peixe' : key.startsWith('fruta') ? 'fruta' : SRC[key] !== undefined ? SRC[key] : '?';
      if (t === null) { if (ng) for (const g of Object.keys(grains).sort()) out[g] = (out[g] || 0) + w * grains[g] / ng; else out['?'] = (out['?'] || 0) + w; }
      else out[t] = (out[t] || 0) + w;
    }
    if (!(tot > 0)) return { '?': 1 };
    for (const t in out) out[t] /= tot; return out;
  }
  const metalOf = f => { const K = (f && f.tech && f.tech.known) || {}; return K.ferro !== undefined ? 'ferro' : K.bronze !== undefined ? 'bronze' : 'pedra'; };
  function seedOld() {
    const S = G.S; const o = st(); const shares = new Map();
    for (const f of S.factions.values()) shares.set(f.id, guessFood(f));
    const put = (ref, k, n, share) => { if (!(n > EPS)) return; const p = rec(ref, k, true); let s = 0; const ks = Object.keys(share).sort(); ks.forEach((t, i) => { const m = i === ks.length - 1 ? r4(n - s) : r4(n * share[t]); if (m > EPS) { p[t] = r4((p[t] || 0) + m); s = r4(s + m); } }); };
    for (const f of S.factions.values()) {
      put('f:' + f.id, 'food', f.stock.food || 0, shares.get(f.id));
      const metal = metalOf(f);
      for (const k of ['ferramentas', 'armas']) if ((f.stock[k] || 0) > EPS) { put('f:' + f.id, k, f.stock[k], { [metal]: 1 }); mark(f.id, metal); }
      for (const g of ['couro', 'cobre', 'estanho', 'ouro', 'minerio']) if ((f.stock[g] || 0) > EPS) mark(f.id, O.MAT_OF[g]);
    }
    for (const b of S.buildings.values()) {
      const fid = G.Village.facOfSet(b.set); const sh = shares.get(fid) || { '?': 1 };
      const ref = (G.Village.bedsOf(b) > 0 ? 'h:' : 'b:') + b.id; if (!D.exists(ref)) continue;
      put(ref, 'food', D.get(ref, 'food'), sh);
      const metal = metalOf(G.Fac.get(fid));
      for (const k of ['ferramentas', 'armas']) put(ref, k, D.get(ref, k), { [metal]: 1 });
    }
    // (and what is on its way: the carts, the ships' holds, the stalls, the crates of a quay, what lies on the ground, the hands and
    // the bags — each as its people's, or as its marks say: the catch in a crate, the grain of the fields in a farmer's arms)
    const share = fid => shares.get(fid) || { '?': 1 };
    const grainShare = fid => { const sh = share(fid); const g = {}; let s = 0; for (const t in sh) if (O.FOOD[t] && O.FOOD[t].cereal) { g[t] = sh[t]; s += sh[t]; } if (!(s > 0)) return null; for (const t in g) g[t] /= s; return g; };
    const putAll = (ref, fid) => { if (!D.exists(ref)) return; for (const k in O.KEPT) { const n = total(ref, k); if (!(n > EPS)) continue; put(ref, k, n, k === 'food' ? share(fid) : { [metalOf(G.Fac.get(fid))]: 1 }); } };
    for (const c of S.carts || []) putAll('c:' + c.id, c.fac);
    for (const s of S.ships || []) for (const h of ['s:', 'r:', 'l:', 'y:']) putAll(h + s.id, s.fac);
    for (const z of S.biz || []) putAll('z:' + z.id, z.fac);
    for (const g of S.loose || []) { const ref = 'g:' + g.id; if (g.k === 'food' && g.fish) put(ref, 'food', g.n, { peixe: 1 }); else putAll(ref, g.fac); }
    for (const b of S.buildings.values()) if (b.crates && b.crates.length) { const ref = 'q:' + b.id; const fid = G.Village.facOfSet(b.set); const fish = b.crates.filter(x => x.k === 'food' && x.fish).reduce((a, x) => a + x.n, 0); if (fish > EPS) put(ref, 'food', fish, { peixe: 1 }); const rest = r4(D.get(ref, 'food') - fish); if (rest > EPS) put(ref, 'food', rest, share(fid)); for (const k of ['ferramentas', 'armas']) put(ref, k, D.get(ref, k), { [metalOf(G.Fac.get(fid))]: 1 }); }
    for (const v of S.villagers.values()) {
      const fid = G.Fac.idOfV(v); const c = v.carry;
      if (c && c.k === 'food' && c.n > EPS) { const t = fromMarks(c); const gs = c.grain && !t ? grainShare(fid) : null; put('v:' + v.id, 'food', c.n, t ? { [t]: 1 } : gs || share(fid)); }
      else if (c && O.KEPT[c.k] && c.n > EPS) put('v:' + v.id, c.k, c.n, { [metalOf(G.Fac.get(fid))]: 1 });
      putAll('m:' + v.id, fid);
    }
    o.old = S.day || 1; // (the day the parts of a save from before were born by the guess)
  }
  O.seedOld = seedOld;
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { const o = G.S.orig; out.orig = o ? { p: o.p, had: o.had, q: o.q, qw: o.qw || {}, old: o.old || 0 } : null; },
    load(o) {
      const S = G.S; const x = o.orig;
      const clean = m => { const out = {}; if (m && typeof m === 'object' && !Array.isArray(m)) for (const t of Object.keys(m)) if (fin(m[t]) && m[t] > EPS) out[t] = r4(m[t]); return out; };
      if (x && typeof x === 'object' && x.p && typeof x.p === 'object' && !Array.isArray(x.p)) {
        const p = {};
        for (const ref of Object.keys(x.p)) {
          if (!D.exists(ref)) continue; const h = x.p[ref]; if (!h || typeof h !== 'object') continue;
          for (const k of Object.keys(h)) if (O.KEPT[k]) { const c = clean(h[k]); for (const t of Object.keys(c)) if (!O.KEPT[k][t]) { c['?'] = r4((c['?'] || 0) + c[t]); delete c[t]; } if (Object.keys(c).length) (p[ref] || (p[ref] = {}))[k] = c; }
        }
        const had = {};
        if (x.had && typeof x.had === 'object' && !Array.isArray(x.had)) for (const fid of Object.keys(x.had)) { const h = x.had[fid]; if (!h || typeof h !== 'object') continue; const c = {}; for (const m of Object.keys(h)) if (fin(h[m]) && h[m] > 0) c[m] = h[m]; had[fid] = c; }
        S.orig = { p, had, q: clean(x.q), qw: clean(x.qw), old: fin(x.old) ? x.old : 0 };
      } else { S.orig = { p: {}, had: {}, q: {} }; seedOld(); }
    },
  });
  // (the checker's round trip of a save: the parts and the materials had, as they are)
  if (G.Act && G.Act.hooks) G.Act.hooks.canon.push(['origem', () => {
    const o = G.S && G.S.orig; if (!o) return null;
    const p = Object.keys(o.p).sort().map(ref => ref + ':' + Object.keys(o.p[ref]).sort().map(k => k + '=' + Object.keys(o.p[ref][k]).sort().map(t => t + r4(o.p[ref][k][t])).join('/')).join(','));
    const had = Object.keys(o.had).sort().map(f => f + ':' + Object.keys(o.had[f]).sort().join('/'));
    return [p.join(';'), had.join(';')];
  }]);
})(window.G);
