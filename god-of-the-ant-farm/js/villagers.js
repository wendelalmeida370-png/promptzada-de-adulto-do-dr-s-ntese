'use strict';
// ============================================================
//  Villagers: data, needs, utility-AI decisions, task machines
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Vg = G.Vg = {};
  const SKIN = ['#f3cfae', '#e6b48f', '#cf9669', '#a8744c', '#7d5236', '#5e3c26'];
  const HAIR = ['#2b1d14', '#4a3020', '#6e4a2c', '#a8793a', '#d6b26a', '#8c3a1d', '#151515', '#5a2f1c'];
  const KID_CLOTH = ['#4fa0d8', '#e36d8a', '#6cc27a', '#f0b340', '#9a7fd6', '#ef8a4a'];
  const TRAITS = ['Corajoso', 'Medroso', 'Trabalhador', 'Preguiçoso', 'Curioso', 'Sociável', 'Devoto', 'Cético', 'Romântico', 'Glutão', 'Resistente'];
  const CONFLICT = { Corajoso: 'Medroso', Medroso: 'Corajoso', Trabalhador: 'Preguiçoso', Preguiçoso: 'Trabalhador', Devoto: 'Cético', Cético: 'Devoto' };
  G.TRAIT_F = { Corajoso: 'Corajosa', Medroso: 'Medrosa', Trabalhador: 'Trabalhadora', Preguiçoso: 'Preguiçosa', Curioso: 'Curiosa', Devoto: 'Devota', Cético: 'Cética', Romântico: 'Romântica', Glutão: 'Glutona' };
  G.traitName = (v, t) => (v.g === 'f' && G.TRAIT_F[t]) ? G.TRAIT_F[t] : t;

  function uniqueName(g, civ) {
    const used = new Set(); for (const v of G.S.villagers.values()) used.add(v.name);
    return G.Civ.personName(civ, g, used);
  }
  function rollTraits(parents) {
    const tr = [];
    for (const p of parents) if (p && p.traits && p.traits.length && G.R() < 0.4) { const t = G.pick(p.traits); if (!tr.includes(t)) tr.push(t); }
    const n = G.R() < 0.55 ? 2 : 1;
    let guard = 0;
    while (tr.length < n && guard++ < 20) {
      const t = G.pick(TRAITS);
      if (tr.includes(t) || tr.includes(CONFLICT[t])) continue;
      tr.push(t);
    }
    return tr.slice(0, 2);
  }

  // A person is always laid out with the same keys in the same order. The browser's engine reads a field of objects that
  // share a layout in one go; a thousand people, each with a layout of its own (fields come and go over a life), made every
  // step a third slower. Keys this list does not know join it at the end (they only cost their own person a little).
  const SHAPE = [
    'id', 'name', 'age', 'born', 'civ', 'hp', 'hunger', 'energy', 'role', 'x', 'y', 'z', 'vx', 'vy', 'vz', 'air',
    'held', 'path', 'pi', 'task', 'act', 'actT', 'carry', 'home', 'set', 'partner', 'mother', 'father', 'kids',
    'widow', 'devotion', 'fear', 'sick', 'preg', 'lastBirth', 'conceiveDay', 'mourn', 'courtCD', 'emo', 'face',
    'walkPh', 'moving', 'think', 'scan', 'sleeping', 'inside', 'hurt', 'speed', 'work', 'skin', 'hair', 'kidCloth',
    'st', 'lastCause', 'lastGod', '_armed', '_bow', '_civ', '_decap', '_fc', '_ford', '_levy', '_noStore', '_ok',
    '_paveCD', '_pfI', '_pfN', '_pfT', '_pool', '_q', '_ruler', '_saw', '_stray', '_tide', '_vetWar', '_wave',
    '_wax', '_wd', '_whale', 'aboard', 'arm', 'arrowT', 'arrows', 'babyOn', 'bio', 'boat', 'captive', 'carried',
    'carrier', 'caught', 'cells', 'chosen', 'coup', 'courage', 'deserter', 'downT', 'drinkDay', 'drinks', 'drunk',
    'dz', 'elite', 'ep', 'expCD', 'fishXp', 'fury', 'fx', 'fy', 'g', 'gear', 'grp', 'guestOf', 'hang', 'heavyN',
    'hero', 'hh', 'hhType', 'holdTorch', 'hood', 'hunt', 'immune', 'jail', 'jailUntil', 'job', 'kills', 'lantern',
    'lastBeast', 'lastBeastId', 'lastBy', 'learn', 'lost', 'lostT', 'merchant', 'mob', 'moves', 'navXp', 'news',
    'ord', 'palace', 'pe', 'prophet', 'purse', 'rebel', 'reigned', 'revolt', 'rioted', 'robe', 'robeMark', 'rua',
    'ruaEnd', 'ruaWhy', 'saw', 'sceneHold', 'secret', 'seekT', 'seen', 'shackTry', 'skill', 'stagT', 'thefts',
    'torch', 'traits', 'ug', 'unit', 'unmask', 'unpaid', 'vet', 'voyages', 'wound', 'wrecked',
    'diary', '_hungerT',
  ];
  const SHAPED = new Set(SHAPE);
  Vg.shape = function (o) {
    for (const k in o) if (!SHAPED.has(k)) { SHAPED.add(k); SHAPE.push(k); }
    const v = {}; for (let i = 0; i < SHAPE.length; i++) { const k = SHAPE[i]; v[k] = o[k]; }
    return v;
  };

  Vg.create = function (o) {
    const S = G.S;
    const m = o.mother ? G.person(o.mother) : null, f = o.father ? G.person(o.father) : null;
    const g = o.g || (G.R() < 0.5 ? 'f' : 'm');
    const traits = o.traits || rollTraits([m, f]);
    const home = S.settlements.get(o.set); const civId = o.civ || (home ? G.Civ.idOfFac(home.fac) : null); const civ = G.CIVS[civId];
    let courage = G.clamp(0.45 + (G.R() - 0.5) * 0.5 + (traits.includes('Corajoso') ? 0.35 : 0) - (traits.includes('Medroso') ? 0.35 : 0) + (civ && civ.traits.courage || 0), 0, 1);
    const v = Vg.shape({
      id: o.id || S.nextId++, name: o.name || uniqueName(g, civId), g, age: o.age, born: S.day - o.age, civ: civId || null,
      hp: 100, hunger: G.rr(5, 35), energy: G.rr(65, 100),
      role: null, x: o.x, y: o.y, z: 0, vx: 0, vy: 0, vz: 0, air: false, held: false,
      path: null, pi: 0, task: null, act: '', actT: 0, carry: null,
      home: 0, set: o.set, partner: 0, mother: o.mother || 0, father: o.father || 0, kids: [], widow: 0,
      courage, traits, devotion: traits.includes('Devoto') ? G.rr(10, 20) : G.rr(1, 7), fear: 0,
      sick: 0, preg: 0, lastBirth: -99, conceiveDay: -1, mourn: 0, courtCD: G.rr(5, 25),
      emo: null, face: G.R() < 0.5 ? 1 : -1, walkPh: G.R() * 10, moving: false,
      think: G.R(), scan: G.R() * 0.3, sleeping: false, inside: 0, hurt: 0,
      speed: G.rr(1.25, 1.5), work: traits.includes('Trabalhador') ? 1.25 : traits.includes('Preguiçoso') ? 0.8 : 1,
      skin: o.skin || (m && f ? (G.R() < 0.5 ? m.skin : f.skin) : G.pick(civ ? civ.skin : SKIN)),
      hair: o.hair || (m && f ? (G.R() < 0.5 ? m.hair : f.hair) : G.pick(civ ? civ.hair : HAIR)),
      kidCloth: G.pick(KID_CLOTH), st: { wood: 0, food: 0, stone: 0, built: 0 }, lastCause: 'unknown', lastGod: false,
    });
    if (!v.skin) v.skin = G.pick(SKIN); if (!v.hair) v.hair = G.pick(HAIR);
    S.villagers.set(v.id, v);
    // (one brought back from the dead keeps the life already written: nobody is born twice)
    if (!o.back) G.Life && G.Life.onCreate(v);
    return v;
  };

  // ------------------------------ helpers ------------------------------
  const cap = v => (v.age < 12 ? 1 : v.age < 16 ? 2 : v.age >= 62 ? 2 : 4);
  Vg.cap = cap;
  Vg.workMul = v => workMul(v);
  const isAdult = v => v.age >= 16 && v.age < 62;
  function workMul(v) {
    let m = v.work * (v.sick > 0 ? 0.5 : 1) * (v.mourn > 0 ? 0.85 : 1) * (v.fear > 70 ? 0.85 : 1);
    const fid = G.Fac.idOfV(v);
    if (Vg.workshopFac.has(fid)) m *= 1.15;
    if (v.captive) m *= 0.8;
    else { const f = G.Fac.get(fid); if (f && G.Politics.tyr(f)) m *= 1.08; }
    // the trade learned as a child goes faster; a lost arm makes everything slower
    if (v.skill && v.skill === v.role) m *= 1.15;
    if (v.lost) m *= v.lost.armL || v.lost.armR ? 0.72 : 0.85;
    if (G.S.blessed) m *= 1.5; // years of plenty: everything gets done faster
    return m;
  }
  // a place that could not be reached is not searched for again at once: a failed search is the most
  // expensive kind (it spends the whole budget), and behind the cliffs of the highlands they are common
  Vg.goto = function (v, x, y, adj, maxNodes) {
    const ti = W.inb(x, y) ? W.idx(x, y) * 2 + (adj ? 1 : 0) : -1; const now = G.S.clock;
    if (ti === v._pfI && now - v._pfT < 12) { v.path = null; return false; }
    // (a long way the map of regions says is open, its budget spent before it was found — out of a walled town, round a lake:
    // the exact search floods the ground all round —: searched once more, greedier, as the skip searches every way; a trader
    // home from a caravan stood two minutes inside the walls of the town she had traded with, every search of her way home
    // spent, and then stayed there, L-343. A short way that fails is a shut gate, not the budget: no second search)
    const p = W.findPath(v.x, v.y, x, y, adj, maxNodes) || (ti >= 0 && G.dist(v.x, v.y, x, y) >= 24 && W.canWalk(v.x, v.y, x, y, !!adj || !W.walkable(W.idx(x, y))) ? W.findPath(v.x, v.y, x, y, adj, Math.max(maxNodes || 0, 12000), W.PATH_GREEDY) : null);
    if (!p) { v.path = null; v._pfI = ti; v._pfT = now; v._pfN = (v._pfN || 0) + 1; return false; }
    v.path = p; v.pi = 0; v._pfN = 0; return true;
  };
  // a tree, bush or boulder up on a ledge nobody from this town can climb to: for a day they go for another one
  const cantReach = (o, v) => !!o.noPath && G.S.clock - (o.noPath[v.set] || -1e9) < G.DAY_LEN;
  const noReach = (o, v) => { (o.noPath || (o.noPath = {}))[v.set] = G.S.clock; };
  // approach a small object (tree/bush/rock) standing just beside it
  function approach(v, ox, oy) {
    const dx = v.x - ox, dy = v.y - oy; const d = Math.hypot(dx, dy) || 1;
    const tx = ox + dx / d * 0.42, ty = oy + dy / d * 0.42;
    if (W.walkableXY(tx, ty)) { if (Vg.goto(v, tx, ty, false)) return true; }
    return Vg.goto(v, ox, oy, true);
  }
  function claimedByOther(obj, v) {
    if (!obj.claim || obj.claim === v.id) return false;
    const o = G.S.villagers.get(obj.claim);
    if (!o || !o.task || o.task.id !== obj.id) { obj.claim = 0; return false; }
    return true;
  }
  const arrived = v => !v.path || v.pi >= v.path.length;
  function setTask(v, t) {
    if (v.jail && G.Crime) { const kept = G.Crime.keeps(v, t); if (kept) return kept; }
    // (a body the player lives: the world asks first — a request becomes a call, a force of the world takes the body back)
    if (G.S.avatar && G.S.avatar.id === v.id && G.Possess) { const kept = G.Possess.ask(v, t); if (kept) return kept; }
    // (the water in the hands lives inside its errand — the house's jar on its way home, the bucket for a fire —: another
    // task cuts the errand and the water is set down, poured out in the ledger; a scene only lends the person for a moment.
    // It stayed in the hands, and the work that came next began over it — L-300)
    if (v.carry && v.carry.k === 'water' && t.type !== 'water' && t.type !== 'fire' && t.type !== 'scene' && G.Life && G.Life.jarHome) G.Life.jarHome(v, null);
    Vg.endTask(v);
    t.age = 0; if (t.st === undefined) t.st = 0;
    v.task = t; v.act = ''; v.actT = 0;
    return t;
  }
  function emote(v, k, t) { v.emo = { k, t: t || 2.5 }; }
  Vg.give = function (v, t) {
    // (the body the player lives: a request is a call it may answer; a force of the world goes through setTask and takes it)
    if (G.S.avatar && G.S.avatar.id === v.id && G.Possess) { if (!G.Possess.FORCE[t.type]) { G.Possess.ask(v, t); return false; } setTask(v, t); return true; }
    if (v.task && v.task.pri >= (t.pri || 0) + 0.01 && v.task.pri >= 2) return false; if (v.sleeping || v.inside || v.air || v.held || v.age < 3) return false;
    if (busyHands(v, t)) return false;
    setTask(v, t); return true; };
  // (hands busy with a load that has somewhere to go — an operation's crate, a purchase on its way home, goods for a stall:
  // an errand from outside waits until it is there, unless it is about that load or cannot wait; an errand that takes the
  // hands — a cave, a whale, a theft — would put its own things in them over it, and the load would be gone unwritten)
  function busyHands(v, t) {
    let c = v.carry;
    // (the second pair of hands under a heavy crate are as busy as the first: the crate the one who leads holds is theirs too —
    // G.Act.pair; a cave took the helper from under one and the lead went on alone with the helper's name on it, L-330)
    if (!(c && c.n > 1e-6) && v.task && v.task.st === 2 && G.Act && G.Act.pair) { const p = G.Act.pair(v); const l = p && p.side === 'tras' && G.S.villagers.get(p.lead); if (l) c = l.carry; }
    if (!c || !(c.n > 1e-6) || !(c.op || c.to || c.cid)) return false;
    if ((t.pri || 0) >= 3 || t.type === 'carga' || t.type === 'deliver') return false;
    return !(c.op && t.op === c.op);
  }
  Vg.emote = emote;

  // (o.keepLoad: the errand ends but the hands keep what they carry — the god taking the body goes on carrying it)
  Vg.endTask = function (v) {
    const S = G.S; const t = v.task; if (!t) return;
    G.Life && G.Life.onEndTask(v);
    G.Carnage && G.Carnage.onEndTask(v);
    if (t.type === 'chop') { const o = S.trees.get(t.id); if (o && o.claim === v.id) o.claim = 0; }
    else if (t.type === 'gather') { const o = S.bushes.get(t.id); if (o && o.claim === v.id) o.claim = 0; }
    else if (t.type === 'mine') { const o = S.rocks.get(t.id); if (o && o.claim === v.id) o.claim = 0; }
    else if (t.type === 'hunt' || t.type === 'fight') { const o = S.animals.get(t.id); if (o && o.claim === v.id) o.claim = 0; }
    else if (t.type === 'farm') { const b = S.buildings.get(t.id); if (b && b.crops && b.crops[t.k] && b.crops[t.k].c === v.id) b.crops[t.k].c = 0; }
    else if (t.type === 'fish' || t.type === 'quarry') { Vg.fishSpots.delete(t.spot); }
    else if ((t.type === 'mariscar' || t.type === 'pocas') && t.bx !== undefined && t.k > 0) { v.x = t.bx; v.y = t.by; } // (called away from the flats: back on the beach)
    else if (t.type === 'build') {
      const b = S.buildings.get(t.id);
      if (b && t.counted && v.carry && b.incoming[v.carry.k] !== undefined) b.incoming[v.carry.k] = Math.max(0, b.incoming[v.carry.k] - v.carry.n);
    }
    if (v.inside) {
      const b = S.buildings.get(v.inside);
      if (b) { const [dx, dy] = V_door(b); v.x = dx; v.y = dy; }
      v.inside = 0;
    }
    v.sleeping = false;
    v.task = null; v.path = null; v.act = '';
  };
  // the door of a building's plan, when the interiors give one (G.Vg.planDoor = b => [x, y] | null, in tiles, outside the
  // door): where people stand to go in is where the plan has its door; with no plan, the first walkable side of the front
  Vg.planDoor = null;
  function V_door(b) {
    if (Vg.planDoor) { const d = Vg.planDoor(b); if (d && W.walkableXY(d[0], d[1])) return d; }
    // find a walkable tile next to the building front
    const cands = [[b.x + b.w - 0.5, b.y + b.h + 0.4], [b.x + b.w + 0.4, b.y + b.h - 0.5], [b.x - 0.4, b.y + 0.5], [b.x + 0.5, b.y - 0.4]];
    for (const c of cands) if (W.walkableXY(c[0], c[1])) return c;
    const n = W.nearestLand(b.x + b.w / 2, b.y + b.h / 2, 4); return n || cands[0];
  }
  Vg.door = V_door;

  // ------------------------------ a delivery: one door for everyone ------------------------------
  // what is in the hands into a people's store, as the world has always counted it (up to the store's room; what does not
  // fit is lost, now with its cause) — through the depot, in the ledger: the caravans, the robbers, the deliveries
  Vg.toStore = function (v, fid, code) {
    const c = v.carry; if (!c || !(c.n > 0)) { v.carry = null; return 0; }
    const add = G.Depot.store('v:' + v.id, fid, c.k, c.n, { op: c.op || 0, code: code || 'entrega', by: v.id });
    v.carry = null; return add;
  };
  // the hands at the end of an errand of war (a band let go, raiders home, a soldier routed home, a ship back from a raid):
  // what was taken — the loot, a plain load — goes into the people's store, in the ledger ('saque'); a load that belongs
  // somewhere (a purchase on its way home, an operation's crate, goods for a stall) is nobody's loot: it stays in the arms,
  // and the next errand takes it on to its place (start → G.Act.resumeCarry; with the way cut, holdCarry)
  Vg.spoils = function (v, fid) {
    const c = v.carry; if (!c) return 0;
    if (c.n > 0 && (c.op || c.to || c.cid)) return 0;
    return fid ? Vg.toStore(v, fid, 'saque') : 0;
  };
  // what a gathering puts in the hands — berries, fruit, honey, the flats' shellfish —: added to the same plain good already
  // there; hands with another thing, or with a load that belongs somewhere, are never filled over it — what was in them would
  // be gone with no line in the ledger (L-186) —: nothing goes in, and the gathering leaves it where it was. → how much went in
  Vg.plainLoad = v => { const c = v.carry; return !!(c && c.n > 1e-6 && c.k !== 'water' && !c.op && !c.to && !c.cid); };
  Vg.handsFor = (v, k) => { const c = v.carry; return !c || !(c.n > 1e-6) || (c.k === k && !c.op && !c.to && !c.cid); };
  Vg.fillHands = function (v, k, n, look) {
    if (!(n > 0) || !Vg.handsFor(v, k)) return 0;
    const c = v.carry; if (c && c.n > 1e-6) { c.n += n; return n; }
    v.carry = Object.assign({ k, n }, look); return n;
  };
  // a plain load brought to a store (the world's delivery, villagers' and the god's body's alike): into the people's store;
  // a year of plenty doubles the stone and the wood (born of the world, with its cause), what came along with the load goes
  // in too, and the person's tally counts it
  function deliverPlain(v, fid) {
    const S = G.S; const c = Object.assign({}, v.carry); const k = c.k, n = c.n;
    let add = Vg.toStore(v, fid, 'entrega');
    if (S.blessed && (k === 'stone' || k === 'wood') && add > 0) { const r = G.Depot.make('f:' + fid, k, n, { code: 'fartura', by: v.id, part: true }); if (r.ok) { add += r.n; if (k === 'wood') S.stats.woodProduced += r.n; else S.stats.stoneProduced += r.n; } }
    v.st[k] = (v.st[k] || 0) + n;
    if (add > 0) G.FX && G.FX.deposit(v.x, v.y, k, add);
    // what came along with it: the hide off the deer's back, the tusks, a second sack
    if (c.extra) G.Riches && G.Riches.unload(v, c.extra);
    G.Riches && G.Riches.delivered && G.Riches.delivered(v, c, add);
    return { ok: true, k, n, add };
  }
  // the door of a delivery at a store (the god's body calls it too: interact.js): a load that belongs somewhere goes only
  // there (G.Act.boundOf: an operation's crate, a purchase), and what does not fit stays in the arms; a plain load as above.
  // → { ok, k, n } or { ok: false, why }
  Vg.deliver = function (v, b) {
    const S = G.S; const c = v.carry; if (!c || !(c.n > 0)) return { ok: false, why: 'Suas mãos estão vazias.' };
    if (!b || !S.buildings.has(b.id) || !b.built) return { ok: false, why: 'Não existe mais.' };
    const fid = G.Fac.idOfV(v); if (G.Village.facOfSet(b.set) !== fid) return { ok: false, why: 'Isto é de outro povo: o estoque daqui não é do seu.' };
    const bound = G.Act ? G.Act.boundOf(c) : null;
    if (bound) {
      if (bound !== 'f:' + fid) return { ok: false, why: G.Act.whyBound(bound) };
      const k = c.k; const r = G.Depot.move('v:' + v.id, bound, k, c.n, { op: c.op || 0, code: 'entrega', by: v.id, part: true });
      if (!r.ok) return { ok: false, why: 'Não cabe mais nada no estoque do seu povo.' };
      G.FX && G.FX.deposit(v.x, v.y, k, r.n); return { ok: true, k, n: r.n };
    }
    const r = deliverPlain(v, fid); return { ok: true, k: r.k, n: r.n };
  };

  Vg.damage = function (v, amt, cause, byGod, by) {
    if (!G.S.villagers.has(v.id)) return;
    v.hp -= amt; v.lastCause = cause; v.lastGod = !!byGod; v.hurt = 0.3; v.lastBy = by || 0;
    if (cause === 'arrow' && G.Carnage) G.Carnage.onArrow(v);
    if (v.hp <= 0) G.Village.kill(v, cause, byGod);
  };

  // ------------------------------ movement ------------------------------
  function move(v, dt, mul) {
    const S = G.S;
    if (v.downT > S.clock) { v.moving = false; return false; } // knocked down (a beast on top of them)
    if (!v.path || v.pi >= v.path.length) { v.moving = false; return true; }
    const p = v.path[v.pi];
    const dx = p[0] - v.x, dy = p[1] - v.y; const d = Math.hypot(dx, dy);
    const i = W.idx(v.x, v.y);
    const ty = S.type[i];
    const sp = v.speed * (mul || 1) * (ty === T.RIVER ? (S.road[i] ? 1 : 0.5) : 1) * (S.road[i] ? (S.road[i] >= 3 ? 1.4 : 1.3) : S.wear[i] > 28 ? 1.15 : 1) * (v.sick > 0 ? 0.75 : 1)
      * (v.age < 8 ? 0.8 : v.age >= 62 ? 0.72 : 1) * (v.carry && v.carry.n >= 4 ? 0.9 : 1) * (v.lost && v.lost.leg ? 0.6 : 1) * (v.elite === 'carro' ? 1.45 : 1) * (ty >= T.SAND && !S.road[i] ? 1 / (1 + S.slope[i] * 0.16) : 1);
    const step = sp * dt;
    if (d <= step || d < 0.001) { v.x = p[0]; v.y = p[1]; v.pi++; }
    else { v.x += dx / d * step; v.y += dy / d * step; }
    if (Math.abs(dx) + Math.abs(dy) > 0.02) G.faceTo(v, dx, dy);
    v.walkPh += step * 8.5;
    v.moving = true;
    // wading: counted, so that a town knows where it needs a bridge (once per tile stepped into)
    if (ty === T.RIVER && !S.road[i] && v._ford !== i && G.City) { v._ford = i; G.City.ford(i); }
    if (ty >= T.SAND) {
      const lv = G.pathLevel(S.wear[i]);
      S.wear[i] = Math.min(G.WEAR_MAX, S.wear[i] + step * 1.3);
      if (G.pathLevel(S.wear[i]) !== lv) G.Nature.markDirty(i);
    }
    // path got blocked (new building): replan next think
    const ni = W.idx(v.x, v.y);
    if (!W.walkable(ni) && v.pi < v.path.length) {
      const last = v.path[v.path.length - 1];
      if (!Vg.goto(v, last[0], last[1], true)) { v.path = null; }
    }
    return v.pi >= (v.path ? v.path.length : 0);
  }

  // ------------------------------ needs ------------------------------
  function needs(v, dt) {
    const S = G.S; const day = G.DAY_LEN;
    const awake = !v.sleeping;
    // meals and sleep keep the rhythm of the day, however long the day is
    const dd = dt / G.DAY_K;
    v.age += dt / day;
    v.hunger = Math.min(100, v.hunger + dd * (awake ? 0.95 : 0.45) * (v.age < 12 ? 0.6 : 1) * (v.traits.includes('Glutão') ? 1.2 : 1));
    if (v.age >= 2) v.energy = G.clamp(v.energy + (awake ? -dd * (100 / 80) * (v.age >= 62 ? 1.12 : 1) * (v.task && v.task.type === 'flee' ? 1.6 : 1) : dd * (100 / 22)), 0, 100);
    if (v.hurt > 0) v.hurt -= dt;
    // babies are fed from the common stock
    if (v.age < 2 && v.hunger > 60) { const st = G.Fac.stockV(v); if (st.food >= 1) { st.food -= 0.5; v.hunger -= 50; } }
    // on campaign, on a mission or under siege there is no time for a meal: they eat provisions
    if (v.hunger > 80 && v.task && (FIELD[v.task.type] || v.task.type === 'escorted') && (!v.captive || v.task.type === 'escorted') && v.age >= 2) { const pv = G.Wars ? G.Wars.provision(v) : null; if (pv === true) v.hunger = Math.max(0, v.hunger - 50); else if (pv === null) { const st = G.Fac.stockV(v); if (st.food >= 1) { st.food -= 1; v.hunger = Math.max(0, v.hunger - 50); } } }
    if (v.hunger >= 100) { v.hp -= 0.45 * dd; v.lastCause = 'hunger'; v.lastGod = false; if (G.R() < dt * 0.3) emote(v, 'food'); }
    if (v.immune > 0) v.immune -= dt;
    if (v.sick > 0) {
      v.sick -= dt; v.hp -= 0.08 * dd * (v.age < 6 || v.age > 60 ? 1.7 : 1); v.lastCause = 'sick'; v.lastGod = false;
      if (v.sick <= 0) v.immune = G.DAY_LEN * 3;
      if (G.R() < dt * 0.08) emote(v, 'sick');
    }
    const i = W.idx(v.x, v.y);
    if (!v.inside && S.fire[i] > 0.1) { Vg.damage(v, S.fire[i] * 22 * dt, 'fire', !!S.fireGod); if (!S.villagers.has(v.id)) return; }
    if (v.inside) { const b = S.buildings.get(v.inside); if (b) { const fi = W.idx(b.x, b.y); if (S.fire[fi] > 0.2) { Vg.endTask(v); fleeFrom(v, b.x + 0.5, b.y + 0.5, 6, 'fire'); } } }
    if (v.hunger < 75 && v.sick <= 0 && v.hp < 100) v.hp = Math.min(100, v.hp + dt * (v.sleeping ? 0.9 : 0.3) * (v.traits.includes('Resistente') ? 1.5 : 1));
    if (v.mourn > 0) v.mourn -= dt;
    if (v.courtCD > 0) v.courtCD -= dt;
    if (v.fear > 0) v.fear = Math.max(0, v.fear - dt * 0.12);
    if (v.devotion > 6) v.devotion -= dd * 0.012;
    // pregnancy
    if (v.preg > 0) { v.preg -= dt; if (v.preg <= 0) { v.preg = 0; G.Village.birth(v); } }
    // old age
    if (v.age > 55 && G.R() < dt / day * Math.pow((v.age - 55) / 30, 2.2) * 0.75) { v.lastCause = 'old'; v.hp = 0; }
    if (v.hp <= 0) G.Village.kill(v, v.lastCause, v.lastGod);
  }

  // (the crew waiting on the quay for its voyage — 'cais', an errand of 3,25 that the hunger cannot outweigh — is in the field
  // too: a voyage made ready for a day and more kept them from every meal, and Solveig of Birka starved on the quay with the
  // store seven steps away, L-201)
  const FIELD = { praia: 1, reembarque: 1, expl: 1, naufrago: 1, saga: 1, scene: 1, band: 1, muster: 1, refugio: 1, combat: 1, envoy: 1, trade: 1, escort: 1, hide: 1, assembly: 1, migrate: 1, aboard: 1, embark: 1, boardBack: 1, pave: 1, cais: 1 };
  // ------------------------------ emergencies ------------------------------
  Vg.alarms = new Map(); // settlement id -> [tile indices]
  Vg.fireFighters = new Map();
  Vg.fishSpots = new Map();
  function emergency(v) {
    const S = G.S;
    if (v.ug) return; // underground: the cave errand decides (the hidden stay hidden)
    const t = v.task;
    if (t && t.type === 'flee' && t.age < 3.5) return;
    if (t && (t.type === 'swim' || t.type === 'condemned' || t.type === 'escorted' || t.type === 'jail')) return;
    const child = v.age < 16;
    // meteors
    for (const m of S.meteors) {
      if (m.t < 0.8) continue;
      const d = G.dist(v.x, v.y, m.x, m.y);
      if (d < m.r + 4) { if (v.inside) Vg.endTask(v); fleeFrom(v, m.x, m.y, m.r + 6 - d, 'meteor'); emote(v, 'fear', 3); return; }
    }
    // panic zones (lightning, explosions)
    for (const p of S.panic || []) {
      const d = G.dist(v.x, v.y, p.x, p.y);
      if (d < p.r && !(t && (t.type === 'fire' || t.type === 'fight' || t.type === 'dragao'))) { if (v.inside) Vg.endTask(v); fleeFrom(v, p.x, p.y, p.r + 3 - d, p.why || 'panic'); emote(v, 'fear', 2.5); return; }
    }
    if (G.War.emergency(v, H)) return;
    if (t && (t.type === 'riot' || t.type === 'riotguard')) return;
    const inScene = !!(t && t.type === 'scene');
    if (inScene && t.calm) return; // (a scene that needs them steady: the one who lit the fire does not run from it)
    if (v.inside || v.sleeping && !t) return;
    // predators (only the ones that mean harm right now)
    const beasts = []; G.Animals.nearThreat(v.x, v.y, 6, a => { if (G.Animals.threat(a)) beasts.push(a); });
    for (const a of beasts) {
      const d2 = G.dist2(v.x, v.y, a.x, a.y);
      if (d2 > 30) continue;
      if (t && ((t.type === 'fight' && t.id) || t.type === 'combat' || t.type === 'band')) return;
      const brave = !child && v.age < 62 && v.hp > 45 && (v.role === 'cacador' || v.courage > 0.62);
      if (brave) {
        let fighters = 0; for (const o of S.villagers.values()) if (o.task && o.task.type === 'fight' && o.task.id === a.id) fighters++;
        if (fighters < 3) { setTask(v, { type: 'fight', id: a.id, pri: 4, rt: 0 }); emote(v, 'angry', 2); return; }
      }
      if (d2 < 20) { fleeFrom(v, a.x, a.y, 7, 'wolf'); emote(v, 'fear', 2.5); return; }
    }
    // wolves at the herd: shepherds, soldiers and hunters run to drive them off
    if (!child && !inScene && (v.role === 'pastor' || v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'cavalarico') && v.hp > 45 && !(t && (t.type === 'fight' || t.type === 'combat' || t.type === 'band' || t.type === 'army'))) {
      let raider = null; G.Animals.nearThreat(v.x, v.y, 9, a => { if (!raider && G.Animals.raider(a)) raider = a; });
      if (raider) { let fighters = 0; for (const o of S.villagers.values()) if (o.task && o.task.type === 'fight' && o.task.id === raider.id) fighters++; if (fighters < 3) { setTask(v, { type: 'fight', id: raider.id, pri: 4, rt: 0 }); emote(v, 'angry', 2); return; } }
    }
    // fire close by (the ones on their way to a dragon's lair do not turn round for a burning bush)
    if (t && (t.type === 'fire' || t.type === 'dragao')) return;
    const xi = v.x | 0, yi = v.y | 0;
    let fx = -1, fy = -1, fmax = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = xi + dx, ny = yi + dy; if (!W.inb(nx, ny)) continue;
      const f = S.fire[ny * N + nx]; if (f > fmax) { fmax = f; fx = nx + 0.5; fy = ny + 0.5; }
    }
    const canFight = !child && v.age < 62 && v.courage > 0.3 && v.hp > 40;
    if (fmax > 0.12) {
      if (canFight && (Vg.fireFighters.get(v.set) || 0) < 10) { setTask(v, { type: 'fire', pri: 4, st: 0 }); emote(v, 'fire', 2.5); return; }
      fleeFrom(v, fx, fy, 6, 'fire'); emote(v, 'fear', 2.5); return;
    }
    // settlement alarm
    const al = Vg.alarms.get(v.set);
    if (al && al.length && canFight && !inScene && (!t || t.pri < 3) && (Vg.fireFighters.get(v.set) || 0) < 9) {
      const i = al[0]; const ax = (i % N) + 0.5, ay = ((i / N) | 0) + 0.5;
      if (G.dist2(v.x, v.y, ax, ay) < 18 * 18) { setTask(v, { type: 'fire', pri: 4, st: 0 }); emote(v, 'fire', 2.5); Vg.fireFighters.set(v.set, (Vg.fireFighters.get(v.set) || 0) + 1); }
    }
  }
  function fleeFrom(v, fx, fy, dist, why) {
    const S = G.S;
    let dx = v.x - fx, dy = v.y - fy; const d = Math.hypot(dx, dy);
    if (d < 0.01) { const a = G.R() * 6.28; dx = Math.cos(a); dy = Math.sin(a); } else { dx /= d; dy /= d; }
    dist = Math.max(3, dist);
    const t = setTask(v, { type: 'flee', pri: 5, why, fx, fy });
    for (const ang of [0, 0.45, -0.45, 0.9, -0.9, 1.5, -1.5, 2.4, -2.4]) {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const ex = dx * ca - dy * sa, ey = dx * sa + dy * ca;
      const tx = v.x + ex * dist, ty = v.y + ey * dist;
      if (!W.inb(tx, ty)) continue;
      const i = W.idx(tx, ty);
      if (!W.walkable(i) || S.fire[i] > 0 || S.type[i] === T.RIVER) continue;
      if (Vg.goto(v, tx, ty, false)) return t;
    }
    // no route: run straight away
    v.path = [[G.clamp(v.x + dx * 2, 0.5, N - 0.5), G.clamp(v.y + dy * 2, 0.5, N - 0.5)]]; v.pi = 0;
    return t;
  }
  Vg.fleeFrom = fleeFrom;

  // ------------------------------ decisions ------------------------------
  Vg.relatedClose = (a, b) => relatedClose(a, b);
  function relatedClose(a, b) {
    if (a.mother && (a.mother === b.id || a.mother === b.mother)) return true;
    if (a.father && (a.father === b.id || a.father === b.father)) return true;
    if (b.mother === a.id || b.father === a.id) return true;
    return false;
  }
  function courtTarget(v) {
    const S = G.S; let best = null, bd = 1e9;
    for (const o of S.villagers.values()) {
      if (o === v || o.g === v.g || o.partner || o.set !== v.set || o.age < 17 || o.age > 55 || o.mourn > 0 || o.sleeping || o.inside || !o.captive !== !v.captive) continue;
      if (Math.abs(o.age - v.age) > 16 || relatedClose(v, o)) continue;
      if (o.task && o.task.pri > 1) continue;
      const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd && d < 400) { bd = d; best = o; }
    }
    return best;
  }
  const canCourt = v => !v.partner && v.age >= 17 && v.age <= 50 && v.mourn <= 0 && v.courtCD <= 0;
  function socialTarget(v) {
    const S = G.S; let best = null, bd = 1e9;
    for (const o of S.villagers.values()) {
      if (o === v || o.age < 10 || o.set !== v.set || o.sleeping || o.inside || o.held || o.air || !o.captive !== !v.captive) continue;
      if (o.task && o.task.pri >= 1) continue;
      const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd && d < 144) { bd = d; best = o; }
    }
    return best;
  }
  function relativeTarget(v) {
    const S = G.S; const ids = [v.mother, v.father, v.partner, ...v.kids];
    const list = ids.map(id => S.villagers.get(id)).filter(o => o && o.age >= 2 && o.set === v.set && !o.inside && !o.sleeping && !o.air && !o.held);
    return list.length ? G.pick(list) : null;
  }

  function decide(v) {
    const S = G.S; const cur = v.task;
    if (v.ug) return;
    if (cur && cur.pri >= 3) return;
    if (cur && cur.type === 'tell' && S.time < 0.8) return;
    if (v.captive) return G.War.captiveDecide(v, H);
    if (v.age < 16) return childDecide(v);
    const night = G.isNight(), eve = G.isEvening();
    let best = null, bs = -1, bp = 0;
    const opt = (score, pri, kind) => { if (score > bs) { bs = score; best = kind; bp = pri; } };
    if (v.hunger > 50) opt((v.hunger - 40) / 60 * 1.3 + (v.hunger > 88 ? 1 : 0), v.hunger > 85 ? 2.5 : 1.2, 'eat');
    const atTav = cur && cur.type === 'tavern' && v.energy > 20 && S.time > 0.5 && S.time < (cur.st === 1 ? 0.88 : 0.78);
    if (night) opt(0.95 + (100 - v.energy) / 250, atTav ? 0.3 : 1.5, 'sleep');
    else if (v.energy < 22) opt(0.6 + (22 - v.energy) / 30, v.energy < 8 ? 2.5 : 1.2, 'sleep');
    const elder = v.age >= 62;
    // a night watch keeps a torch lit when the village is big enough
    const watch = night && v.role === 'cacador' && v.energy > 45 && Vg.nightWatch.get(v.set) === v.id;
    let wU = night ? (watch ? 1.4 : 0.05) : 0.55 * v.work;
    if (elder) wU *= 0.55;
    if (v.mourn > 0) wU *= 0.7;
    if (v.fear > 60) wU *= 0.8;
    if (eve) wU *= 0.7;
    opt(wU, watch ? 1.6 : 1, watch ? 'watch' : 'work');
    if (S.weather.storm > 0 && !night && S.weather.rain > 0.3) { const h = S.buildings.get(v.home); if (h && h.built && h.type !== 'ruin') opt(0.8 + G.R() * 0.3, 1.05, 'shelter'); }
    if (!night) {
      opt((v.traits.includes('Sociável') ? 0.3 : 0.15) * (eve ? 2.3 : 1) * (elder ? 1.8 : 1) * G.R() * 1.6, 0, 'social');
      if (canCourt(v)) opt((v.traits.includes('Romântico') ? 0.95 : 0.72) * (0.55 + G.R() * 0.8), 0.5, 'court');
      if (v.devotion + v.fear * 0.7 > 28 || (S.awareness && v.traits.includes('Devoto'))) opt((0.1 + (v.devotion + v.fear * 0.8) / 320) * G.R() * 1.6, 0.5, 'pray');
      if (S.prayer && S.prayer.set === v.set) opt(0.3 + G.R() * 0.35, 0.6, 'pray');
      if (v.traits.includes('Curioso') && !elder) opt(0.22 * G.R(), 0, 'explore');
      // a story this person carries takes a little of the free time (training, a vigil, a journey)
      // (a wish, not a duty: at a free moment, now and then — about one free choice in ten)
      if (G.Stories) { const u = G.Stories.urge(v); if (u > 0 && G.R() < u * (eve ? 0.7 : 1.2)) opt(0.9 + u * 0.8, 0.5, 'saga'); }
      opt(0.14 * G.R(), 0, 'visit');
      if (eve || elder) opt(0.3 * G.R() * (elder ? 2 : 1), 0, 'rest');
      // the working day ends: home, or a cup at the tavern
      if (eve && v.home) opt(0.55 + G.R() * 0.4, 0.45, 'home');
      if (eve && G.Eco && G.Eco.byType(v.set, 'taverna').length) opt((v.traits.includes('Sociável') ? 0.62 : 0.4) + G.R() * 0.5 + (v.mourn > 0 ? 0.15 : 0) - (v.traits.includes('Devoto') ? 0.2 : 0), 0.4, 'tavern');
      if (G.Eco && !eve) opt(0.16 * G.R() * 1.6, 0.35, 'shop');
      // (the house lacks something it uses up, and can pay: one of the family goes to buy it — act-compras.js)
      if (G.Compras) { const u = G.Compras.urge(v); if (u > 0) opt(u, 0.6, 'compras'); }
      if (G.Urban && v.home && G.Urban.gardenDue(v)) opt(((elder ? 0.6 : 0.3) + G.R() * 0.4) * (eve ? 1.4 : S.time < 0.16 ? 1.25 : 0.8), 0.4, 'garden');
    }
    opt(0.04, 0, 'wander');
    if (cur) {
      if (cur.kind === best) return;
      if (cur.pri >= bp) return;
    }
    start(v, best, bp);
  }

  function start(v, kind, pri) {
    const S = G.S;
    let t = null;
    // (a load that knows where it goes — a purchase for the house, a crate of an unloading, goods for a stall — goes there
    // before the free time; hunger, sleep and a storm come first)
    if (v.carry && (v.carry.to || v.carry.op) && G.Act && kind !== 'eat' && kind !== 'sleep' && kind !== 'shelter' && kind !== 'watch') { t = G.Act.resumeCarry(v, H); if (t) { t.kind = kind; return; } }
    switch (kind) {
      // (nothing to eat in reach — no store, the store out of the way or empty, no berries —: at night back to sleep, the
      // hunger waking one again in a while (runSleep); by day the work, which may be what brings food or a store — the fire
      // of a town just founded, the field, the hunt —, not a day of wandering. L-165, L-171)
      case 'eat': t = eatTask(v); if (!t) t = G.isNight() ? setTask(v, { type: 'sleep', pri: 1.5 }) : workTask(v); break;
      case 'sleep': t = setTask(v, { type: 'sleep', pri: Math.max(pri, 1.2) }); break;
      case 'work': t = workTask(v); break;
      case 'watch': t = setTask(v, { type: 'patrol', pri: 1.6, torch: true }); break;
      case 'social': { const o = socialTarget(v); if (o) t = setTask(v, { type: 'social', id: o.id, pri: 0.3 }); break; }
      case 'court': { const o = courtTarget(v); if (o) t = setTask(v, { type: 'court', id: o.id, pri: 0.6 }); else v.courtCD = G.rr(12, 30); break; }
      case 'pray': t = setTask(v, { type: 'pray', pri: 0.6 }); break;
      case 'explore': t = exploreTask(v); break;
      case 'visit': { const o = relativeTarget(v); if (o) t = setTask(v, { type: 'visit', id: o.id, pri: 0.3 }); break; }
      case 'rest': t = setTask(v, { type: 'rest', pri: 0.2 }); break;
      case 'shelter': t = setTask(v, { type: 'shelter', pri: 1.05 }); emote(v, 'fear', 1.5); break;
      case 'home': t = (G.Urban && G.R() < (G.Urban.gardenDue(v) ? 0.75 : 0) && G.Urban.gardenTask(v, H)) || (G.Life && G.Life.familyTask(v, H)) || (G.Eco && G.Eco.goHomeTask(v, H)); break;
      case 'tavern': t = G.Eco && G.Eco.tavernTask(v, H); break;
      case 'shop': t = G.Eco && G.Eco.shopTask(v, H); break;
      case 'compras': t = G.Compras && G.Compras.task(v, H); break;
      case 'garden': t = G.Urban && G.Urban.gardenTask(v, H); break;
      case 'saga': t = G.Stories && G.Stories.task(v, H); break;
    }
    if (!t) { if (!v.task) wander(v, 4); }
    else t.kind = kind;
  }
  function wander(v, r) {
    const set = G.S.settlements.get(v.set);
    const cx = set ? set.cx : v.x, cy = set ? set.cy : v.y;
    const lim = Math.max(16, set ? (set.radius || 0) + 4 : 0); const hm = v.home && G.S.buildings.get(v.home); const byHome = !!hm && G.dist(v.x, v.y, hm.x + 0.5, hm.y + 0.5) < 7;
    if (set && !byHome && G.dist(v.x, v.y, cx, cy) > lim && (!v.task || v.task.type !== 'migrate')) { setTask(v, { type: 'migrate', pri: 1.5, kind: 'migrate' }); return; }
    const base = !byHome && G.dist(v.x, v.y, cx, cy) > lim - 6 ? [cx, cy] : [v.x, v.y];
    const p = W.randomNear(base[0], base[1], r || 4);
    setTask(v, { type: 'wander', pri: 0, kind: 'wander' });
    if (p) Vg.goto(v, p[0], p[1], false);
    v.task.wait = G.rr(1, 3);
  }

  function childDecide(v) {
    const S = G.S; const cur = v.task;
    if (v.age < 2) return;
    if (cur && cur.pri >= 3) return;
    const night = G.isNight();
    // a story by the fire, or the family at the door, keeps them up a little longer
    if (night && cur && (cur.type === 'listen' || cur.type === 'family') && S.time > 0.5 && S.time < 0.8) return;
    // (to bed at night — but a child the hunger woke goes to bed after the meal, not before: L-171)
    if (night) { if (!cur || (cur.type !== 'sleep' && cur.kind !== 'eat')) setTask(v, { type: 'sleep', pri: 1.5, kind: 'sleep' }); return; }
    if (v.hunger > 60 && (!cur || cur.pri < 1.2)) { const t = eatTask(v); if (t) { t.kind = 'eat'; return; } }
    if (v.energy < 15 && (!cur || cur.pri < 1.2)) { setTask(v, { type: 'sleep', pri: 1.2, kind: 'sleep' }); return; }
    if (S.weather.storm > 0 && S.weather.rain > 0.3 && (!cur || cur.pri < 1.05)) { const h = S.buildings.get(v.home); if (h && h.built) { setTask(v, { type: 'shelter', pri: 1.05, kind: 'shelter' }); return; } }
    // (by day, a load in the hands goes to its place first — the people's store, or where a load that belongs somewhere
    // goes —, as the grown-ups' work does: the night's sleep cut the errand that was taking it there, and play, an
    // apprenticeship or a gathering would keep it in the hands for days, or fill them over it — L-186)
    const c = v.carry;
    if (c && c.n > 1e-6 && c.k !== 'water' && (!cur || (cur.pri < 1 && cur.type !== 'deliver')) && !(v._noStore > S.clock)) {
      const t = (c.op || c.to) && G.Act ? G.Act.resumeCarry(v, H) || G.Act.holdCarry(v, H) : deliverTask(v);
      if (t) { t.kind = 'deliver'; return; }
    }
    if (cur && cur.type !== 'wander') return;
    const m = S.villagers.get(v.mother);
    const r = G.R();
    // while the years are skipped nobody sees their games: the children stay put between meals,
    // lessons and errands, and the world runs lighter
    if (G.Skip && G.Skip.on && r >= 0.4) { setTask(v, { type: 'idle', pri: 0.1, wait: 5 + G.R() * 5, kind: 'play' }); return; }
    if (G.isEvening() && G.Life && r < 0.7) { const t = G.Life.familyTask(v, H); if (t) { t.kind = 'family'; return; } }
    if (v.age < 7 && m && !m.inside && !m.sleeping && !m.aboard && !m.ug && !m.held && !m.air && m.set === v.set && r < 0.5) { setTask(v, { type: 'follow', id: m.id, pri: 0.2, kind: 'follow' }); return; }
    // from nine on, a child often goes along to learn a parent's trade
    if (v.age >= 9 && G.Life && !G.isEvening() && r < 0.4) { const t = G.Life.apprenticeTask(v, H); if (t) return; }
    if (v.age >= 10 && r < 0.22) { const t = gatherTask(v); if (t) { t.kind = 'help'; return; } }
    // low water: the pools left among the rocks and the sand are full of things to catch
    if (v.age >= 5 && G.Sea && G.Sea.lowTide() && G.R() < 0.4) { const sp = G.Sea.shellSpot(v.x, v.y, 11); if (sp) { setTask(v, { type: 'pocas', x: sp.x, y: sp.y, wx: sp.wx, wy: sp.wy, rock: sp.rock, pri: 0.1, kind: 'play' }); return; } }
    setTask(v, { type: 'play', pri: 0.1, kind: 'play' });
  }

  // ------------------------------ task factories ------------------------------
  function eatTask(v) {
    const S = G.S;
    if (v.carry && v.carry.k === 'food' && !v.carry.op && !v.carry.to && !v.carry.cid) { // eat what you carry (not a load that is someone's errand, not a crate)
      v.carry.n -= 1; v.hunger = Math.max(0, v.hunger - 55); if (v.carry.n <= 0) v.carry = null; emote(v, 'food', 1.5); return setTask(v, { type: 'idle', pri: 0, wait: 1 });
    }
    // (a meal at the store needs a store: a people with food in its stock and no store anywhere — a town just founded, its
    // fire not lit — looks for something to eat around it, L-165)
    if (((G.Army && G.Army.larder(v)) || G.Fac.stockV(v)).food >= 1 && !(v._noStore > S.clock) && G.Village.nearestDropoff(v.x, v.y, v.set)) return setTask(v, { type: 'eat', pri: v.hunger > 85 ? 2.5 : 1.2 });
    const b = nearestBush(v, 20); if (b) return setTask(v, { type: 'forage', id: b.id, pri: 1.4 });
    emote(v, 'food', 2);
    return null;
  }
  function nearestInGrid(v, maxR, test) {
    const S = G.S; const set = S.settlements.get(v.set);
    const x0 = v.x | 0, y0 = v.y | 0;
    for (let r = 0; r <= maxR; r++) {
      let best = null, bd = 1e9;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = x0 + dx, y = y0 + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue;
        const o = test(y * N + x); if (!o) continue;
        if (set && G.dist2(o.x, o.y, set.cx, set.cy) > 28 * 28) continue;
        if (!W.reaches(v, o.x, o.y)) continue;
        const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; best = o; }
      }
      if (best) return best;
    }
    return null;
  }
  function nearestTree(v, maxR) {
    const S = G.S;
    return nearestInGrid(v, maxR || 22, i => {
      const id = S.treeAt[i]; if (!id) return null; const t = S.trees.get(id);
      if (!t || !G.Nature.isChoppable(t) || (t.stage === 'grow' && t.size < 0.7) || claimedByOther(t, v) || S.fire[i] > 0 || cantReach(t, v)) return null;
      return t;
    });
  }
  function nearestBush(v, maxR) {
    const S = G.S;
    return nearestInGrid(v, maxR || 18, i => {
      const id = S.objAt[i]; if (!id) return null; const b = S.bushes.get(id);
      if (!b || b.berries < 1 || claimedByOther(b, v) || S.fire[i] > 0 || cantReach(b, v)) return null; return b;
    });
  }
  function nearestRock(v, maxR) {
    const S = G.S;
    return nearestInGrid(v, maxR || 24, i => {
      const id = S.objAt[i]; if (!id) return null; const r = S.rocks.get(id);
      if (!r || r.stone < 1 || claimedByOther(r, v) || cantReach(r, v)) return null; return r;
    });
  }
  function chopTask(v) { const t = nearestTree(v); if (!t) return null; t.claim = v.id; return setTask(v, { type: 'chop', id: t.id, pri: 1 }); }
  // an island without forest still has its beaches: the sea brings planks, branches, whole trunks
  function driftTask(v) {
    const S = G.S;
    const spot = nearestInGrid(v, 22, i => {
      if (S.type[i] !== T.SAND || !W.walkable(i) || S.occ[i] || G.R() < 0.5) return null;
      const x = i % N, y = (i / N) | 0;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.type[ny * N + nx] <= T.SEA) return { x: x + 0.5 + dx * 0.2, y: y + 0.5 + dy * 0.2, wx: dx, wy: dy }; }
      return null;
    });
    if (!spot) return null;
    return setTask(v, { type: 'drift', x: spot.x, y: spot.y, wx: spot.wx, wy: spot.wy, pri: 1 });
  }
  function gatherTask(v) {
    // the fruit trees and the wild bees, now and then, if they are not much further than the bushes
    if (G.Flora && v.age >= 12 && G.R() < 0.45) { const t = G.Flora.pickTask(v, H); if (t) return t; }
    if (G.Flora && v.age >= 16 && G.R() < 0.12) { const t = G.Flora.honeyTask(v, H); if (t) return t; }
    const b = nearestBush(v); if (!b) return (G.Flora && v.age >= 12 && G.Flora.pickTask(v, H)) || null; b.claim = v.id; return setTask(v, { type: 'gather', id: b.id, pri: 1 });
  }
  // at low water the beaches give food too: clams and cockles in the wet sand, crabs in the pools
  function shellTask(v) {
    if (!G.Sea || !G.Sea.lowTide()) return null;
    const sp = G.Sea.shellSpot(v.x, v.y, 18); if (!sp) return null;
    return setTask(v, { type: 'mariscar', x: sp.x, y: sp.y, wx: sp.wx, wy: sp.wy, rock: sp.rock, pri: 1 });
  }
  function mineTask(v) {
    const r = nearestRock(v);
    if (r) { r.claim = v.id; return setTask(v, { type: 'mine', id: r.id, pri: 1 }); }
    // no loose boulders left: quarry the rocky highlands (slow but endless)
    const S = G.S;
    const q = nearestInGrid(v, 26, i => (S.type[i] === T.ROCKY && W.walkable(i) && !S.objAt[i] && !S.treeAt[i] && S.fire[i] <= 0 && G.R() < 0.6) ? { x: (i % N) + 0.5, y: ((i / N) | 0) + 0.5, i } : null);
    if (!q) return null;
    return setTask(v, { type: 'quarry', spot: -1, x: q.x, y: q.y, pri: 1 });
  }
  Vg.canQuarry = function (set) {
    if (set._quarry !== undefined && set._qday === G.S.day) return set._quarry;
    const S = G.S; let ok = false;
    for (let dy = -24; dy <= 24 && !ok; dy++) for (let dx = -24; dx <= 24; dx++) {
      const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; if (!W.inb(x, y)) continue;
      if (S.type[y * N + x] === T.ROCKY) { ok = true; break; }
    }
    set._quarry = ok; set._qday = S.day; return ok;
  };
  function fishTask(v) {
    const S = G.S; const set = S.settlements.get(v.set);
    // (the people's way of fishing — act-pesca.js —, and only a water that still has fish worth the walk: a water fished out
    // is left alone until it comes back; in a storm, nobody goes)
    const Pe = G.Pesca; const how = Pe ? Pe.how(G.Fac.idOfV(v)) : null;
    if (Pe && S.weather.storm > 0) return null;
    const spot = nearestInGrid(v, 16, i => {
      if (Vg.fishSpots.has(i)) return null;
      if (!W.walkable(i) || S.type[i] === T.RIVER || S.type[i] < T.SAND) return null;
      const x = i % N, y = (i / N) | 0;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        if (S.type[ny * N + nx] > T.RIVER) continue;
        if (Pe && (Pe.abundance(nx + 0.5, ny + 0.5) < Pe.WORTH || !Pe.can(v, nx + 0.5, ny + 0.5, how).ok)) continue;
        return { x: x + 0.5 + dx * 0.3, y: y + 0.5 + dy * 0.3, i, wx: dx, wy: dy };
      }
      return null;
    });
    if (!spot) return null;
    Vg.fishSpots.set(spot.i, v.id);
    return setTask(v, { type: 'fish', spot: spot.i, x: spot.x, y: spot.y, wx: spot.wx, wy: spot.wy, how, pri: 1 });
  }
  // (a cast lasts the gesture of the people's way, by the fisher's work — G.Pesca.castDur, the god's body's too —, give or take a
  // fifth; after a miss as at first: L-212)
  const castT = (v, t) => G.Pesca.castDur(v, t.how) * G.rr(0.8, 1.2);
  function huntTask(v, maxD) {
    const S = G.S; const set = S.settlements.get(v.set);
    let best = null, bd = 1e9;
    for (const a of S.animals.values()) {
      if (a.dead || !G.Animals.huntable(a)) continue;
      if (a.claim && a.claim !== v.id && S.villagers.has(a.claim)) continue;
      if (set && G.dist2(a.x, a.y, set.cx, set.cy) > (maxD || 24) * (maxD || 24)) continue;
      if (!W.reaches(v, a.x, a.y)) continue;
      // when tusks and hides sell abroad, the hunters go for the beasts that carry them
      const d = G.dist2(v.x, v.y, a.x, a.y) - (G.Riches ? G.Riches.huntPull(v, a) : 0); if (d < bd) { bd = d; best = a; }
    }
    if (!best) return null;
    best.claim = v.id;
    return setTask(v, { type: 'hunt', id: best.id, pri: 1, rt: 0 });
  }
  function farmTask(v) {
    const S = G.S; let best = null, bk = -1, bd = 1e9, harvest = false;
    for (const b of S.buildings.values()) {
      if (b.type !== 'farm' || !b.built || b.set !== v.set) continue;
      for (let k = 0; k < 9; k++) {
        const c = b.crops[k];
        if (c.c && c.c !== v.id) { const o = S.villagers.get(c.c); if (o && o.task && o.task.type === 'farm' && o.task.id === b.id && o.task.k === k) continue; c.c = 0; }
        const [px, py] = G.Village.cropPos(b, k);
        if (S.fire[W.idx(px, py)] > 0 || S.burnt[W.idx(px, py)] > G.DAY_LEN * 0.5) continue;
        const isH = c.s === 3;
        if (!(isH || c.s === 0)) continue;
        const d = G.dist2(v.x, v.y, px, py) - (isH ? 30 : 0);
        if (d < bd) { bd = d; best = b; bk = k; harvest = isH; }
      }
    }
    if (!best) return null;
    best.crops[bk].c = v.id;
    return setTask(v, { type: 'farm', id: best.id, k: bk, harvest, pri: 1 });
  }
  // reach a building from its front, or from any free side (a coast, a wall, a crowded block)
  function gotoB(v, b, jit) {
    const S = G.S; const [fx, fy] = G.Village.frontTile(b);
    const j = jit || 0;
    if (Vg.goto(v, fx + (j ? G.rr(-j, j) : 0), fy + (j ? G.rr(-j, j) : 0), true)) return true;
    if (b.unreachT && S.clock - b.unreachT < 8) return false; // failed a moment ago: don't flood the pathfinder
    const ring = [];
    for (let y = b.y - 1; y <= b.y + b.h; y++) for (let x = b.x - 1; x <= b.x + b.w; x++) {
      if (y >= b.y && y < b.y + b.h && x >= b.x && x < b.x + b.w) continue;
      if (!W.inb(x, y) || !W.walkable(y * N + x)) continue;
      ring.push([x + 0.5, y + 0.5, G.dist2(v.x, v.y, x + 0.5, y + 0.5)]);
    }
    ring.sort((a, c) => a[2] - c[2]);
    for (let k = 0; k < Math.min(3, ring.length); k++) if (Vg.goto(v, ring[k][0], ring[k][1], false)) { b.unreach = 0; return true; }
    b.unreach = (b.unreach || 0) + 1; b.unreachT = S.clock;
    return false;
  }
  Vg.gotoB = gotoB;
  // a site nobody can reach (walled in, cut off by the sea) is given up and its materials go back to the store
  function abandonSite(b) {
    const def = G.BDEF[b.type]; const fid = G.Village.facOfSet(b.set);
    if (b.upgradeFrom) {
      const od = G.BDEF[b.upgradeFrom]; if (!od || od.w !== b.w || od.h !== b.h) return;
      b.type = b.upgradeFrom; b.upgradeFrom = null; b.built = true; b.progress = 1; b.need = { wood: 0, stone: 0 }; b.incoming = { wood: 0, stone: 0 }; b.unreach = 0;
    } else {
      for (const k in def.cost) { const got = Math.max(0, (def.cost[k] || 0) - (b.need[k] || 0)); if (got > 0) G.Village.addStock(k, got, fid); }
      G.Village.removeBuilding(b);
    }
    for (const o of G.S.villagers.values()) if (o.task && o.task.type === 'build' && o.task.id === b.id) end(o);
  }
  function buildTask(v) {
    const S = G.S; let best = null, bd = 1e9;
    for (const b of S.buildings.values()) {
      if (b.built || b.set !== v.set || b.type === 'ruin') continue;
      if (b.unreach) { if (b.unreach >= 6) { abandonSite(b); continue; } if (S.clock - b.unreachT < 30) continue; }
      const st = G.Fac.stockOfSet(b.set);
      let needMat = false; for (const k in b.need) if (b.need[k] - (b.incoming[k] || 0) > 0 && G.Fac.free(b.set, k) >= 1) { needMat = true; break; }
      const work = canWork(b);
      const carryFits = v.carry && b.need[v.carry.k] > 0;
      if (!needMat && !work && !carryFits) continue;
      let builders = 0; for (const o of S.villagers.values()) if (o.task && o.task.type === 'build' && o.task.id === b.id) builders++;
      const [cx, cy] = G.Village.center(b);
      // (a family's house paid for — its materials paid at the town's prices, act-casa.js — has its turn before the city's
      // own works: the stone of the store went to a palace, and the house stood at 92% for years, L-313)
      const d = G.dist2(v.x, v.y, cx, cy) + builders * 40 + (b.type === 'campfire' ? -500 : 0) + (b.type === 'hut' || b.type === 'house' ? -30 : 0) + (b.type === 'doca' ? -40 : 0) + (b.encomenda ? -200 : 0);
      if (d < bd) { bd = d; best = b; }
    }
    if (!best) return null;
    return setTask(v, { type: 'build', id: best.id, pri: 1, st: 0 });
  }
  // the progress the materials allow: all of it with every material in — a hair left by the sum of the loads (three of 3.3
  // for 10 leave 4e-16) is nothing missing, or the ratio would stop the last stroke at 0.9999999999999999
  function allowedProgress(b) {
    const def = G.BDEF[b.type]; const tot = G.Village.totalCost(def);
    if (!tot) return 1;
    let left = 0; for (const k in b.need) left += b.need[k];
    return left < 1e-9 ? 1 : 1 - left / tot;
  }
  Vg.allowedProgress = allowedProgress;
  // work left on a site: with every material in, until it stands — the very opposite of runBuild's "progress >= 1" —;
  // short of materials, what they allow, within a thousandth. (L-164: a work its builder left in the last thousandth, or
  // whose strokes add up to 0.9999999999999999 — six sixths, a fire of work 3 in the skip —, was no one's work any more)
  function canWork(b) { const al = allowedProgress(b); return al >= 1 ? b.progress < 1 : b.progress < al - 0.001; }
  Vg.canWork = canWork;
  function deliverTask(v) { return setTask(v, { type: 'deliver', pri: 1 }); }
  function exploreTask(v) {
    const S = G.S; const set = S.settlements.get(v.set);
    const cx = set ? set.cx : v.x, cy = set ? set.cy : v.y;
    for (let k = 0; k < 10; k++) {
      const a = G.R() * 6.28, d = G.rr(10, 24);
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      if (!W.inb(x, y)) continue;
      const i = W.idx(x, y); if (!W.walkable(i) || S.type[i] === T.RIVER) continue;
      const t = setTask(v, { type: 'explore', pri: 0.4, tx: x, ty: y });
      if (Vg.goto(v, x, y, false)) return t;
    }
    return null;
  }

  function leisureTask(v) {
    const S = G.S; const r = G.R();
    let t = null;
    // a nest on a roof or in a tree: people stop and look
    if (G.Nests && G.R() < 0.1) { t = G.Nests.watchTask(v, H); if (t) { t.leisure = true; return t; } }
    // city life: the market, the plaza, the baths, the theatre
    if (G.Eco && G.R() < 0.3) { t = G.Eco.shopTask(v, H); if (t) { t.leisure = true; return t; } }
    if (G.City && G.R() < 0.4) { t = G.City.leisureTask(v, H); if (t) { t.leisure = true; return t; } }
    if (r < 0.3) { const o = socialTarget(v); if (o) t = setTask(v, { type: 'social', id: o.id, pri: 0.3 }); }
    else if (r < 0.5 && (v.devotion > 15 || S.awareness)) t = setTask(v, { type: 'pray', pri: 0.4 });
    else if (r < 0.65) { const o = relativeTarget(v); if (o) t = setTask(v, { type: 'visit', id: o.id, pri: 0.3 }); }
    else if (r < 0.85) t = setTask(v, { type: 'rest', pri: 0.2 });
    if (!t) { wander(v, 5); t = v.task; }
    if (t) t.leisure = true;
    return t;
  }
  let preyN = 0, preyT = -1;
  G.worldHooks.push(() => { preyN = 0; preyT = -1; }); // (a new world, or a save loaded: it starts over)
  function preyCount() { const S = G.S; if (preyT !== S.clock) { preyT = S.clock; preyN = 0; for (const a of S.animals.values()) if (!a.dead && G.Animals.huntable(a)) preyN++; } return preyN; }
  function workTask(v) {
    const S = G.S; const fac = G.Fac.ofV(v); if (!fac) return null;
    const st = fac.stock; const capS = G.Village.cap(fac.id);
    // (a crate of an operation, a purchase on its way home: it goes where it belongs, never into the common store — and
    // with the way there cut, as its rule says: G.Act.holdCarry)
    if (v.carry && v.carry.k !== 'water' && (v.carry.op || v.carry.to) && G.Act) { const t = G.Act.resumeCarry(v, H) || G.Act.holdCarry(v, H); if (t) return t; }
    if (v.carry && v.carry.k !== 'water') {
      if (v.role === 'construtor') { const t = buildTask(v); if (t) return t; }
      return deliverTask(v);
    }
    const tg = fac.targets || { food: 60, wood: 60, stone: 30 };
    const need = k => st[k] < Math.min(capS - 1, tg[k]);
    let t = null;
    if (v.captive) {
      // forced labour: whatever the masters need most
      t = (G.Estates && G.R() < 0.45 && G.Estates.captiveTask(v, H)) || (G.R() < 0.35 && buildTask(v)) || (need('stone') && mineTask(v)) || (need('wood') && chopTask(v)) || farmTask(v) || (need('food') && gatherTask(v)) || chopTask(v);
      return t || setTask(v, { type: 'rest', pri: 0.2 });
    }
    if (G.Eco && (G.Eco.isJobRole(v.role) || (v.role === 'mineiro' && v.job))) {
      t = G.Eco.jobTask(v, H) || (need('food') && (farmTask(v) || gatherTask(v))) || (need('wood') && chopTask(v));
      return t || leisureTask(v);
    }
    switch (v.role) {
      case 'guerreiro': {
        const r = G.R();
        const hungry = st.food < G.Fac.pop(fac.id) * 1.5;
        // soldiers in peacetime: drill, then a shift on the walls, the towers and the gates
        t = (need('food') && r < (hungry ? 0.8 : 0.2) && ((preyCount() > 6 && huntTask(v)) || gatherTask(v) || fishTask(v))) || (r < 0.35 ? setTask(v, { type: 'drill', pri: 1 }) : (G.Eco && G.Eco.guardTask(v, H)) || setTask(v, { type: 'patrol', pri: 1 }));
        break;
      }
      case 'lenhador': t = (need('wood') && (chopTask(v) || driftTask(v))) || (need('food') && gatherTask(v)); break;
      case 'coletor': t = need('food') ? ((G.R() < 0.5 && shellTask(v)) || gatherTask(v) || (G.R() < 0.7 ? fishTask(v) : (preyCount() > 8 && huntTask(v, 14))) || fishTask(v)) : (need('wood') && chopTask(v)); break;
      case 'agricultor': t = farmTask(v) || (need('food') && gatherTask(v)); break;
      case 'construtor': t = buildTask(v) || (G.City && G.City.paveTask(v, H)) || (need('wood') && chopTask(v)) || (need('stone') && mineTask(v)); break;
      case 'mineiro': t = (need('stone') && mineTask(v)) || (need('wood') && chopTask(v)); break;
      case 'cacador': t = ((need('food') || G.R() < 0.2) && preyCount() > 6 && huntTask(v)) || setTask(v, { type: 'patrol', pri: 1 }); break;
      case 'sacerdote': t = setTask(v, { type: 'pray', pri: 1, priest: true }); break;
      case 'anciao': t = G.R() < 0.35 && need('food') ? (shellTask(v) || gatherTask(v)) : setTask(v, { type: 'rest', pri: 0.5, stories: true }); break;
      default: t = (G.R() < 0.3 && shellTask(v)) || gatherTask(v) || chopTask(v);
    }
    return t || leisureTask(v);
  }

  // ------------------------------ task runner ------------------------------
  function end(v) { Vg.endTask(v); v.think = Math.min(v.think, 0.2); }
  function runTask(v, dt) {
    const S = G.S; const t = v.task;
    t.age += dt;
    if (t.age > 70 && !LONG[t.type]) return end(v);
    v.actT += dt;
    switch (t.type) {
      case 'idle': v.act = ''; t.wait = (t.wait || 1.5) - dt; if (t.wait <= 0) end(v); break;
      case 'wander':
        if (move(v, dt, 0.8)) { v.act = ''; t.wait = (t.wait || 1) - dt; if (t.wait <= 0) end(v); }
        break;
      case 'deliver': {
        if (!v.carry) return end(v);
        if (t.st === 0 && (v.carry.op || v.carry.to) && G.Act) { if (G.Act.resumeCarry(v, H) || G.Act.holdCarry(v, H)) return; if (!v.carry) return end(v); }
        if (t.st === 0) {
          const d = G.Village.nearestDropoff(v.x, v.y, v.set);
          // (no store of the people anywhere — a town whose only fire fell, one just founded —: a plain load is set down where
          // one stands, for a hand later — water is poured out —, and the hands are free for the work that brings a store
          // back — L-169)
          if (!d) { const c = v.carry; if (c && c.n > 0 && !c.op && !c.to && !c.cid) { if (c.k === 'water') G.Depot.use('v:' + v.id, 'water', c.n, { code: 'agua', by: v.id, mine: true }); else G.Depot.drop('v:' + v.id, c.k, c.n, v.x, v.y, { code: 'pousou', by: v.id, fac: G.Fac.idOfV(v) }); } return end(v); }
          t.drop = d.id; const [fx, fy] = G.Village.frontTile(d);
          // (the store out of reach: not asked again at once — a child would ask at each look, L-186 —, as the meal does)
          if (!Vg.goto(v, fx, fy, true)) { v._noStore = S.clock + 12; return end(v); }
          t.st = 1;
        } else if (move(v, dt)) { deliverPlain(v, G.Fac.idOfV(v)); end(v); }
        break;
      }
      case 'chop': {
        const tr = S.trees.get(t.id);
        if (!tr || (tr.stage !== 'fall' && !G.Nature.isChoppable(tr))) return end(v);
        if (t.st === 0) { if (!approach(v, tr.x, tr.y)) { noReach(tr, v); return end(v); } t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.act = 'chop'; v.actT = 0; } }
        else {
          G.faceTo(v, tr.x - v.x, tr.y - v.y);
          if (tr.stage === 'grow' || tr.stage === 'burnt') {
            v.act = 'chop';
            tr.chop += dt * workMul(v);
            if (v.actT > 0.55) { v.actT = 0; G.Audio && G.Audio.at(tr.x, tr.y, 'chop'); G.FX && G.FX.chips(tr.x, tr.y, '#c9a26b'); }
            if (tr.chop >= 3 * Math.max(0.5, tr.size)) G.Nature.fellTree(tr, v.face);
          } else if (tr.stage === 'fall') { v.act = ''; }
          else if (tr.stage === 'log') {
            const n = Math.min(cap(v), tr.wood); tr.wood -= n;
            if (tr.wood <= 0) { tr.stage = 'stump'; tr.t = 0; tr.claim = 0; }
            v.carry = { k: 'wood', n }; emote(v, 'wood', 1.5);
            deliverTask(v);
          }
        }
        break;
      }
      case 'gather': case 'forage': {
        const b = S.bushes.get(t.id);
        if (!b || b.berries < 1) return end(v);
        if (t.st === 0) { if (!approach(v, b.x, b.y)) { noReach(b, v); return end(v); } t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; } }
        else {
          v.act = 'gather';
          if (v.actT > 2.2 / workMul(v)) {
            if (t.type === 'forage') {
              const n = Math.min(b.berries, 2); b.berries -= n; v.hunger = Math.max(0, v.hunger - 32 * n); emote(v, 'food', 1.5); end(v);
            } else {
              // (into the hands, on top of what they hold of the same; what they cannot take stays on the bush — L-186)
              const held = v.carry && v.carry.n > 1e-6 ? v.carry.n : 0;
              const n = Vg.fillHands(v, 'food', Math.min(Math.max(0, cap(v) - held), b.berries), { berries: 1 }); b.berries -= n; b.claim = 0;
              deliverTask(v);
            }
          }
        }
        break;
      }
      case 'mine': {
        const r = S.rocks.get(t.id);
        if (!r || r.stone < 1) return end(v);
        if (t.st === 0) { if (!approach(v, r.x, r.y)) { noReach(r, v); return end(v); } t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; t.w = 0; } }
        else {
          v.act = 'mine'; G.faceTo(v, r.x - v.x, r.y - v.y);
          t.w += dt * workMul(v);
          if (v.actT > 0.6) { v.actT = 0; G.Audio && G.Audio.at(r.x, r.y, 'mine'); G.FX && G.FX.chips(r.x, r.y, '#a9a9a9'); }
          if (t.w > 3.8) {
            const n = Math.min(cap(v), r.stone); r.stone -= n;
            if (r.stone <= 0) G.Nature.removeRock(r);
            v.carry = { k: 'stone', n }; deliverTask(v);
          }
        }
        break;
      }
      case 'baleia': {
        // cutting up the whale on the beach, and carrying the meat home
        const c = G.Sea && G.Sea.whaleAt(); if (!c || c.meat <= 0) return end(v);
        if (t.st === 0) { if (!Vg.goto(v, t.x, t.y, false) && !Vg.goto(v, t.x, t.y, true)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; t.w = 0; v.actT = 0; } }
        else {
          v.act = 'butcher'; G.faceTo(v, t.fx - v.x, t.fy - v.y); t.w += dt * workMul(v);
          if (v.actT > 0.8) { v.actT = 0; G.FX && G.FX.blood && G.FX.blood(t.fx, t.fy, 0.3); }
          if (t.w > 6) { const n = G.Sea.cutWhale(v); if (n) { v.carry = { k: 'food', n: Math.min(cap(v), n), meat: 'whale', extra: G.R() < 0.5 ? { oleo: 1 } : undefined }; emote(v, 'food', 1.2); deliverTask(v); } else end(v); }
        }
        break;
      }
      case 'olhar': {
        // going to watch something happen (the little turtles running for the sea...)
        if (G.S.clock > t.until) return end(v);
        if (t.st === 0) { if (!Vg.goto(v, t.x, t.y, false)) { if (!Vg.goto(v, t.x, t.y, true)) return end(v); } t.st = 1; }
        else if (t.st === 1) { if (move(v, dt, 1.2)) { t.st = 2; v.actT = 0; if (t.ev) v._saw = t.ev; } }
        else { v.moving = false; v.act = v.age < 10 && Math.sin(G.S.clock * 2 + v.id) > 0.55 ? 'act' : ''; G.faceTo(v, t.fx - v.x, t.fy - v.y); if (G.R() < dt * 0.25) emote(v, 'happy', 1.2); }
        break;
      }
      case 'mariscar': case 'pocas': {
        const kid = t.type === 'pocas';
        if (t.st === 0) { if (!Vg.goto(v, t.x, t.y, false)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt, kid ? 1.15 : 1)) { t.st = 2; t.w = 0; t.k = 0; t.bx = v.x; t.by = v.y; v.actT = 0; } }
        else if (t.st === 2) {
          // out onto the wet sand, following the water down
          const sh = G.Sea.shift();
          if (sh < 0.14) { t.st = 3; if (t.k > 0.2 && !v._tide) { v._tide = 1; emote(v, 'fear', 1.6); G.Life && G.Life.bio(v, 'note', kid ? 'A maré subiu de repente na poça onde brincava e voltou correndo, molhado até o peito' : 'A maré voltou de repente enquanto catava mariscos e saiu da água correndo, com o cesto na cabeça'); } break; }
          const want = Math.min(sh - 0.1, kid ? 0.32 : 0.36);
          t.k = Math.min(want, t.k + dt * 0.22); v.moving = t.k < want - 0.01;
          v.x = t.bx + t.wx * t.k; v.y = t.by + t.wy * t.k;
          if (!v.moving) {
            v.act = 'gather'; G.faceTo(v, t.wx, t.wy);
            t.w += dt * (kid ? 1 : workMul(v));
            if (v.actT > 1.6) { v.actT = 0; G.FX && G.FX.splash && G.FX.splash(v.x + t.wx * 0.15, v.y + t.wy * 0.15, 0.1); if (kid && G.R() < 0.35) emote(v, 'happy', 1); }
          }
          if (kid && t.w > 10) {
            if (!v._pool) { v._pool = 1; G.Life && G.Life.bio(v, 'note', t.rock ? ['Achou um polvinho numa poça entre as pedras da maré baixa', 'Pegou um caranguejo numa poça da maré baixa e saiu correndo com ele na mão', 'Achou uma estrela-do-mar numa poça da maré baixa'][Math.floor(G.R() * 3)] : 'Cavou a areia molhada da maré baixa atrás dos mariscos que esguicham água'); }
            t.st = 3;
          } else if (!kid && t.w > 9) { t.got = Math.min(cap(v), G.ri(2, 4)); t.st = 3; }
        } else {
          // back up the beach (in a hurry if the water is coming back)
          const hurry = G.Sea.shift() < 0.14;
          t.k = Math.max(0, t.k - dt * (hurry ? 0.75 : 0.35)); v.moving = t.k > 0;
          v.x = t.bx + t.wx * t.k; v.y = t.by + t.wy * t.k;
          if (t.k <= 0) {
            v.moving = false;
            if (t.got) {
              // (on top of what the hands hold of the same; with another thing in them, the catch goes back to the water — L-186)
              if (Vg.fillHands(v, 'food', t.got, { shell: 1 })) emote(v, 'food', 1.2);
              const f = G.Fac.ofV(v); if (f && !f.shell) { f.shell = 1; const set = S.settlements.get(v.set); G.Village.log(`Na maré baixa, ${v.name}, de ${set ? set.name : f.name}, descobriu que a areia molhada esconde mariscos: agora a praia também dá de comer.`, 'sea', v.x, v.y); }
              deliverTask(v);
            } else end(v);
          }
        }
        break;
      }
      case 'drift': {
        if (t.st === 0) { if (!Vg.goto(v, t.x, t.y, false)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; t.w = 0; } }
        else {
          v.act = 'gather'; G.faceTo(v, t.wx, t.wy);
          t.w += dt * workMul(v);
          if (t.w > 6) { v.carry = { k: 'wood', n: Math.min(cap(v), G.ri(2, 4)) }; emote(v, 'wood', 1.2); deliverTask(v); }
        }
        break;
      }
      case 'quarry': {
        if (t.st === 0) { if (!Vg.goto(v, t.x + G.rr(-0.2, 0.2), t.y + G.rr(-0.2, 0.2), false)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; t.w = 0; } }
        else {
          v.act = 'mine';
          t.w += dt * workMul(v);
          if (v.actT > 0.6) { v.actT = 0; G.Audio && G.Audio.at(t.x, t.y, 'mine'); G.FX && G.FX.chips(t.x + 0.2, t.y + 0.2, '#b0aca4'); }
          if (t.w > 5) { v.carry = { k: 'stone', n: Math.min(cap(v), 3) }; deliverTask(v); }
        }
        break;
      }
      case 'fish': {
        if (t.st === 0) { if (!Vg.goto(v, t.x, t.y, false)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; t.dur = G.Pesca ? castT(v, t) : G.rr(5, 9) / workMul(v); } }
        else {
          v.act = 'fish'; G.faceTo(v, t.wx, t.wy);
          if (G.Pesca && !v.gear) v.gear = G.Pesca.gearOf(t.how || G.Pesca.how(G.Fac.idOfV(v)));
          if (v.actT > t.dur) {
            // (one cast through the fishing's door — the same as the god's body: that water's fish, out of its ground, into the
            // hands through the ledger; a water with no fish, ice or a storm ends it)
            const wx = t.x + t.wx * 0.8, wy = t.y + t.wy * 0.8;
            if (G.Pesca) {
              const r = G.Pesca.cast(v, wx, wy, { how: t.how });
              if (r.ok) { v.gear = null; emote(v, 'fish', 1.8); G.FX && G.FX.splash(wx, wy, 0.5); deliverTask(v); }
              else if (r.miss) { v.actT = 0; t.dur = castT(v, t); t.miss = (t.miss || 0) + 1; if (t.miss > 6) { v.gear = null; end(v); } }
              else { v.gear = null; end(v); }
            } else if (G.R() < 0.8 * Math.min(1.2, G.Civ.tV(v, 'fish'))) { const n = Math.min(cap(v), Math.round(G.ri(1, 3) * G.Civ.tV(v, 'fish'))); v.carry = G.Waters ? G.Waters.catchCarry(v, wx, wy, n) : { k: 'food', n, fish: 1 }; emote(v, 'fish', 1.8); G.FX && G.FX.splash(wx, wy, 0.5); deliverTask(v); }
            else { v.actT = 0; t.dur = G.rr(4, 7); }
          }
        }
        break;
      }
      case 'hunt': case 'fight': {
        const a = S.animals.get(t.id);
        if (!a || a.held) return end(v);
        if (a.dead) {
          if (t.type === 'fight') { emote(v, 'happy', 2); if (G.Riches && G.Riches.spoils(v, a, t)) return; return end(v); }
          // collect the meat
          if (G.dist(v.x, v.y, a.x, a.y) > 0.8) { if (!t.carc) { if (!Vg.goto(v, a.x, a.y, false)) return end(v); t.carc = true; } move(v, dt); }
          else if (G.Riches && G.Riches.carcass(v, a, t, dt, H)) { /* skinned at the kill, then home with meat and hide */ }
          else { const take = Math.min(8, Math.max(1, a.meat)); v.carry = { k: 'food', n: Math.max(1, Math.round(take * G.Civ.tV(v, 'hunt'))), meat: a.kind }; a.meat -= take; if (a.meat <= 0.5) G.Animals.remove(a); else a.claim = 0; emote(v, 'food', 1.5); deliverTask(v); }
          break;
        }
        if (t.type === 'fight' && v.hp < 30) { fleeFrom(v, a.x, a.y, 7, 'wolf'); return; }
        const d = G.dist(v.x, v.y, a.x, a.y);
        if (t.age > (t.type === 'fight' ? 40 : 28) || d > 30) return end(v);
        t.rt -= dt;
        if (d > 1.2) {
          if (t.rt <= 0 || arrived(v)) { t.rt = 0.7; if (!Vg.goto(v, a.x, a.y, false)) { if (t.age > 3) return end(v); } }
          move(v, dt, 1.25); v.act = '';
        } else {
          v.act = 'fight'; G.faceTo(v, a.x - v.x, a.y - v.y); v.path = null;
          t.cd = (t.cd || 0) - dt;
          if (t.cd <= 0) {
            t.cd = 0.9; v.actT = 0;
            const dmg = (v.role === 'cacador' ? 20 : 11) * (0.8 + v.courage * 0.4);
            if (G.R() < 0.75) G.Animals.damage(a, dmg, v);
            G.Audio && G.Audio.at(a.x, a.y, 'hit');
          }
        }
        break;
      }
      case 'patrol': {
        if (t.st === 0) {
          const set = S.settlements.get(v.set); if (!set) return end(v);
          const a = G.R() * 6.28, r = G.rr(4, 11);
          const p = W.randomNear(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 2);
          if (!p || !Vg.goto(v, p[0], p[1], false)) return end(v);
          t.st = 1;
        } else if (move(v, dt, 0.75)) { t.n = (t.n || 0) + 1; t.st = 0; if (t.n > 3 || (!G.isNight() && t.torch)) end(v); }
        break;
      }
      case 'farm': {
        const b = S.buildings.get(t.id); if (!b || !b.built || b.type !== 'farm') return end(v);
        const c = b.crops[t.k]; if (!c) return end(v);
        if (t.harvest ? c.s !== 3 : c.s !== 0) { // crop changed: look for next
          if (v.carry && v.carry.n >= 5) return deliverTask(v);
          const nt = farmTask(v); if (!nt) { if (v.carry) deliverTask(v); else end(v); } return;
        }
        const [px, py] = G.Village.cropPos(b, t.k);
        if (t.st === 0) { if (!Vg.goto(v, px + G.rr(-0.15, 0.15), py + G.rr(-0.15, 0.15), false)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; } }
        else {
          v.act = t.harvest ? 'harvest' : 'plant';
          if (v.actT > 1.5 / workMul(v)) {
            c.c = 0;
            if (t.harvest) {
              // Egyptian river floods, Aztec maize... each people farms differently
              let yf = (3 + (S.fert[W.idx(px, py)] > 0.7 ? 1 : 0)) * G.Civ.tV(v, 'farm');
              if (G.Civ.tV(v, 'riverFarm') > 1 && G.Civ.nearRiver(px, py, 5)) yf *= G.Civ.tV(v, 'riverFarm');
              if (b.aqua) yf *= 1.2;
              const y = Math.floor(yf) + (G.R() < yf % 1 ? 1 : 0);
              c.s = 0; c.g = 0;
              if (v.carry && v.carry.k === 'food') v.carry.n += y; else v.carry = { k: 'food', n: y, grain: 1 };
              G.FX && G.FX.chips(px, py, '#e8c24a');
            } else { c.s = 1; c.g = 0.02; G.FX && G.FX.chips(px, py, '#7a5a36'); }
            if (v.carry && v.carry.n >= 6) return deliverTask(v);
            const nt = farmTask(v); if (!nt) { if (v.carry) deliverTask(v); else end(v); }
          }
        }
        break;
      }
      case 'build': runBuild(v, t, dt); break;
      case 'eat': {
        if (t.st === 0) {
          // (no store at all — gone since the choice —: a while of looking elsewhere for food, as when the store is out of reach)
          const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) { v._noStore = S.clock + 12; return end(v); }
          const alt = G.Village.dropoffs(v.set).filter(o => o !== d).sort((p, q) => G.dist2(p.x, p.y, v.x, v.y) - G.dist2(q.x, q.y, v.x, v.y)).slice(0, 3);
          const n0 = v._pfN || 0; let ok = false; for (const b of [d].concat(alt)) { const [fx, fy] = G.Village.frontTile(b); if (Vg.goto(v, fx, fy, true, b === d ? 8000 : 0)) { ok = true; break; } }
          if (!ok) { v._pfN = n0 + 1; v._noStore = S.clock + 12; unstick(v); return end(v); } t.st = 1;
        } else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; } }
        else {
          v.act = 'eat';
          if (v.actT > 1.6) {
            const units = v.hunger > 80 ? 2 : 1;
            const stk = (G.Army && G.Army.larder(v)) || G.Fac.stockV(v);
            const got = Math.min(units, Math.floor(stk.food));
            if (got <= 0) { emote(v, 'food', 2); const nt = eatTask(v); if (!nt) end(v); return; }
            stk.food -= got; v.hunger = Math.max(0, v.hunger - 58 * got);
            end(v);
          }
        }
        break;
      }
      case 'sleep': runSleep(v, t, dt); break;
      case 'flee':
        v.act = 'run';
        if (move(v, dt, 1.75)) { t.wait = (t.wait === undefined ? G.rr(0.8, 2) : t.wait) - dt; v.act = ''; if (t.wait <= 0) end(v); }
        break;
      case 'fire': runFire(v, t, dt); break;
      case 'social': case 'court': case 'visit': {
        const o = S.villagers.get(t.id);
        if (!o || o.sleeping || o.inside || o.held || o.air) return end(v);
        if (t.st === 0) {
          if (G.dist(v.x, v.y, o.x, o.y) < 1.1) { t.st = 2; v.actT = 0; }
          else { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || arrived(v)) { t.rt = 1.2; if (!Vg.goto(v, o.x, o.y, false)) return end(v); } move(v, dt); }
          if (t.age > 25) return end(v);
        } else {
          if (t.st === 2) {
            t.st = 3;
            if (!o.task || o.task.pri <= (t.type === 'court' ? 1 : 0.9)) setTask(o, { type: 'talk', id: v.id, pri: 0.9, wait: 4, kind: 'talk', court: t.type === 'court' });
          }
          v.act = 'talk'; G.faceTo(v, o.x - v.x, o.y - v.y);
          if (v.actT > 0.9 && (!v.emo || v.emo.t < 0.2)) emote(v, t.type === 'court' ? 'heart' : t.type === 'visit' ? 'heart' : 'chat', 1.2);
          if (v.actT > (t.type === 'visit' ? 2.5 : 4)) {
            if (t.type === 'court') {
              v.courtCD = G.rr(20, 50);
              if (!o.partner && !v.partner && G.R() < (v.traits.includes('Romântico') || o.traits.includes('Romântico') ? 0.85 : 0.62)) {
                v.partner = o.id; o.partner = v.id; v.widow = 0; o.widow = 0;
                S.stats.couples++;
                if (G.Life) { G.Life.bio(v, 'couple', o.id); G.Life.bio(o, 'couple', v.id); }
                G.FX && G.FX.hearts((v.x + o.x) / 2, (v.y + o.y) / 2);
                const [a, b] = v.g === 'f' ? [v, o] : [o, v];
                if (S.villagers.size < 35) G.Village.log(`${a.name} e ${b.name} formaram um casal.`, 'heart', v.x, v.y); else if (G.UI.selected === v || G.UI.selected === o) G.UI.notice(`${a.name} e ${b.name} formaram um casal.`, 'heart');
                if (!S.milestones.firstCouple) S.milestones.firstCouple = S.day;
              }
            } else if (v.age >= 62 && o.age < 16) { o.devotion += 1; }
            end(v);
          }
        }
        break;
      }
      case 'talk': {
        const o = S.villagers.get(t.id);
        if (!o) return end(v);
        // (a talk, or the body's hug or dance answered: arms round it, dancing with it)
        v.act = t.hug ? 'hug' : t.dance ? 'dance' : 'talk'; v.path = null; G.faceTo(v, o.x - v.x, o.y - v.y);
        if (v.actT > 1.4 && (!v.emo || v.emo.t < 0.2)) emote(v, t.court || t.hug ? 'heart' : t.dance ? 'happy' : 'chat', 1.2);
        // (dancing with someone who has stopped dancing: a last turn, and back to one's life)
        if (t.dance && o.act !== 'dance' && v.actT > 0.4) t.wait = Math.min(t.wait, 0.3);
        t.wait -= dt; if (t.wait <= 0) end(v);
        break;
      }
      case 'pray': {
        if (t.st === 0) {
          let target = null, bd = 1e9;
          for (const b of S.buildings.values()) if (b.built && (b.type === 'temple' || b.type === 'monument') && b.set === v.set) { const d = G.dist2(v.x, v.y, b.x, b.y); if (d < bd) { bd = d; target = b; } }
          if (!target) { const set = S.settlements.get(v.set); target = set && S.buildings.get(set.campfire); }
          if (!target) return end(v);
          t.b = target.id; const [fx, fy] = G.Village.frontTile(target);
          // the faithful kneel in rows before the temple; the priest leads from the front
          const row = (target.type === 'temple' || target.type === 'monument') && G.Life && G.Life.rowSpot(target, v, 4, 0.62, t.priest ? 0.2 : 0.95);
          if (row) { t.row = target.id; if (!Vg.goto(v, row[0], row[1], false)) { G.Life.rowRelease(v); t.row = 0; if (!Vg.goto(v, fx + G.rr(-0.4, 0.4), fy + G.rr(-0.4, 0.4), true)) return end(v); } }
          else if (!Vg.goto(v, fx + G.rr(-0.4, 0.4), fy + G.rr(-0.4, 0.4), true)) return end(v);
          t.st = 1;
        } else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; } }
        else {
          v.act = 'pray';
          const b = S.buildings.get(t.b);
          if (b) G.faceTo(v, b.x - v.x, b.y - v.y);
          if (G.R() < dt * 1.5) G.FX && G.FX.prayer(v.x, v.y);
          const dur = t.priest ? 12 : 5;
          if (v.actT > dur) {
            const temple = b && (b.type === 'temple' || b.type === 'monument');
            const gain = (t.priest ? 3 : 0.8) * (temple ? 1 : 0.4) * (0.5 + v.devotion / 60);
            S.faith = Math.min(999, S.faith + gain);
            v.devotion = Math.min(100, v.devotion + (temple ? 1.2 : 0.6));
            G.FX && G.FX.faithText(v.x, v.y, gain);
            end(v);
          }
        }
        break;
      }
      case 'explore':
        if (move(v, dt)) {
          v.act = 'look'; if (!t.looked) { t.looked = true; v.actT = 0; emote(v, 'question', 2); }
          if (v.actT > 2.2) { G.Events && G.Events.onExplore(v); end(v); }
        }
        break;
      case 'rest': {
        if (t.st === 0) {
          const set = S.settlements.get(v.set); const cf = set && S.buildings.get(set.campfire);
          if (!cf) return end(v);
          const a = G.R() * 6.28; const tx = cf.x + 0.5 + Math.cos(a) * 1.25, ty = cf.y + 0.5 + Math.sin(a) * 1.25;
          if (!W.walkableXY(tx, ty) || !Vg.goto(v, tx, ty, false)) return end(v);
          t.st = 1; t.cx = cf.x + 0.5; t.cy = cf.y + 0.5;
        } else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; } }
        else {
          v.act = 'sit'; G.faceTo(v, t.cx - v.x, t.cy - v.y);
          if (G.R() < dt * 0.25) emote(v, t.stories ? 'chat' : 'happy', 1.5);
          if (v.actT > (t.stories ? 14 : 8)) end(v);
        }
        break;
      }
      case 'play': {
        if (t.st === 0) {
          const home = S.buildings.get(v.home); const set = S.settlements.get(v.set);
          const bx = home ? home.x + 0.5 : set ? set.cx : v.x, by = home ? home.y + 0.5 : set ? set.cy : v.y;
          // chase another child sometimes
          if (G.R() < 0.4) {
            let other = null; for (const o of S.villagers.values()) if (o !== v && o.age >= 3 && o.age < 13 && o.set === v.set && !o.inside && !o.sleeping && G.dist2(o.x, o.y, v.x, v.y) < 64) { other = o; break; }
            if (other) { t.chase = other.id; t.st = 2; t.rt = 0; break; }
          }
          const p = W.randomNear(bx, by, 4.5); if (!p || !Vg.goto(v, p[0], p[1], false)) return end(v);
          t.st = 1;
        } else if (t.st === 1) { if (move(v, dt, 1.15)) { t.n = (t.n || 0) + 1; t.st = 0; if (t.n > 2) end(v); } }
        else {
          const o = S.villagers.get(t.chase); if (!o || t.age > 10) return end(v);
          t.rt -= dt; if (t.rt <= 0) { t.rt = 0.8; Vg.goto(v, o.x, o.y, false); }
          move(v, dt, 1.3);
          if (G.R() < dt * 0.4) emote(v, 'happy', 1);
        }
        break;
      }
      case 'follow': {
        const m = S.villagers.get(t.id);
        if (!m || m.inside || m.sleeping || m.aboard || m.ug || m.held || m.air || t.age > 20) return end(v);
        if (G.dist(v.x, v.y, m.x, m.y) > 1.8) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || arrived(v)) { t.rt = 1; const a = G.R() * 6.28; if (!Vg.goto(v, m.x + Math.cos(a) * 0.7, m.y + Math.sin(a) * 0.7, false)) return end(v); } move(v, dt, 1.1); }
        else v.act = '';
        break;
      }
      case 'migrate': {
        const set = S.settlements.get(v.set); if (!set) return end(v);
        if (t.st === 0) {
          if (!Vg.goto(v, set.cx + G.rr(-1.5, 1.5), set.cy + G.rr(-1.5, 1.5), true, N * N)) {
            // no way there: settle with the nearest village of the same people instead
            let best = null, bd = 1e9;
            for (const o of S.settlements.values()) if (o.fac === set.fac && o !== set && W.reachesTown(v, o)) { const d = G.dist2(v.x, v.y, o.cx, o.cy); if (d < bd) { bd = d; best = o; } }
            if (!best && !W.reachesTown(v, set)) for (const o of S.settlements.values()) if (o !== set && W.reachesTown(v, o)) { const d = G.dist2(v.x, v.y, o.cx, o.cy); if (d < bd) { bd = d; best = o; } }
            if (best && !v.captive) { v.set = best.id; v.home = 0; }
            t.st = 9; return end(v);
          }
          t.st = 1;
        }
        else if (move(v, dt)) end(v);
        break;
      }
      case 'shelter': {
        const h = S.buildings.get(v.home);
        if (!h || !h.built || h.type === 'ruin') return end(v);
        if (t.st === 0) { const [fx, fy] = G.Village.frontTile(h); if (!Vg.goto(v, fx, fy, true)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt, 1.25)) { t.st = 2; v.inside = h.id; } }
        else if (S.weather.storm <= 0 || S.weather.rain < 0.2 || t.age > 45) end(v);
        break;
      }
      case 'funeral': {
        const b = S.buildings.get(t.id); if (!b || b.type !== 'cemetery') return end(v);
        if (t.st === 0) { const [fx, fy] = G.Village.frontTile(b); if (!Vg.goto(v, fx + G.rr(-0.6, 0.6), fy + G.rr(-0.6, 0.6), true)) return end(v); t.st = 1; }
        else if (t.st === 1) { if (move(v, dt, 0.8)) { t.st = 2; v.actT = 0; } if (t.age > 40) return end(v); }
        else {
          v.act = 'mourn'; G.faceTo(v, b.x - v.x, b.y - v.y);
          if (!v.emo || v.emo.t < 0.2) emote(v, 'sad', 2);
          if (v.actT > 7) end(v);
        }
        break;
      }
      case 'celebrate': {
        const set = S.settlements.get(v.set); const cf = set && S.buildings.get(set.campfire);
        if (!cf) return end(v);
        if (t.st === 0) {
          const a = G.R() * 6.28, r = G.rr(1.3, 2.6);
          const tx = cf.x + 0.5 + Math.cos(a) * r, ty = cf.y + 0.5 + Math.sin(a) * r;
          if (!W.walkableXY(tx, ty) || !Vg.goto(v, tx, ty, false)) return end(v);
          t.st = 1;
        } else if (t.st === 1) { if (move(v, dt, 1.1)) { t.st = 2; v.actT = 0; } if (t.age > 30) return end(v); }
        else {
          v.act = 'dance';
          if (G.R() < dt * 0.6) emote(v, G.R() < 0.5 ? 'happy' : 'heart', 1.4);
          if (G.R() < dt * 0.8) G.FX && G.FX.sparkle(cf.x + 0.5 + G.rr(-0.5, 0.5), cf.y + 0.5 + G.rr(-0.5, 0.5));
          if (v.actT > 14) end(v);
        }
        break;
      }
      case 'swim': {
        v.act = 'swim';
        // (for the nearest land; when home is not reached from it — a pocket of sand the sea and the houses close in, where one
        // would stand with every way failing: L-306 —, a shore that reaches home a few strokes farther, if there is one)
        if (!t.to) {
          const n0 = W.nearestLand(v.x, v.y, 30) || W.nearestLand(v.x, v.y, 90); const home = G.S.settlements.get(v.set); let to = n0;
          if (n0 && home && !W.reachesTownXY(n0[0], n0[1], home)) { const d0 = Math.ceil(Math.max(Math.abs(n0[0] - v.x), Math.abs(n0[1] - v.y))); to = W.nearestLand(v.x, v.y, d0 + 6, (x, y) => W.reachesTownXY(x, y, home)) || n0; }
          t.to = to;
        }
        const tgt = t.to;
        if (!tgt) { Vg.damage(v, 999, 'drown', true); return; }
        const dx = tgt[0] - v.x, dy = tgt[1] - v.y; const d = Math.hypot(dx, dy);
        const sp = 0.7 * dt;
        if (d < sp + 0.05) { v.x = tgt[0]; v.y = tgt[1]; end(v); }
        else { v.x += dx / d * sp; v.y += dy / d * sp; G.faceTo(v, dx, dy); v.walkPh += sp * 6; }
        v.energy -= dt * 3;
        if (v.energy <= 0) Vg.damage(v, dt * 6, 'drown', true);
        if (G.R() < dt * 2) G.FX && G.FX.splash(v.x, v.y, 0.25);
        break;
      }
      case 'saga': if (G.Stories) G.Stories.run(v, t, dt, H); else end(v); break;
      default: if (!(G.Scene && G.Scene.run(v, t, dt, H)) && !(G.Caves && G.Caves.run(v, t, dt, H)) && !G.War.run(v, t, dt, H) && !(G.Wars && G.Wars.run(v, t, dt, H)) && !(G.City && G.City.run(v, t, dt, H)) && !(G.Urban && G.Urban.run(v, t, dt, H)) && !(G.Naval && G.Naval.run(v, t, dt, H)) && !(G.Eco && G.Eco.run(v, t, dt, H)) && !(G.Army && G.Army.run(v, t, dt, H)) && !(G.Fest && G.Fest.run(v, t, dt, H)) && !(G.Life && G.Life.run(v, t, dt, H)) && !(G.Carnage && G.Carnage.run(v, t, dt, H)) && !(G.Flora && G.Flora.run(v, t, dt, H)) && !(G.Nests && G.Nests.run(v, t, dt, H)) && !(G.Polity && G.Polity.run(v, t, dt, H)) && !(G.Justice && G.Justice.run(v, t, dt, H)) && !(G.Riots && G.Riots.run(v, t, dt, H)) && !(G.Secrets && G.Secrets.run(v, t, dt, H)) && !(G.Stories && G.Stories.party && G.Stories.party.run(v, t, dt, H)) && !(G.Riches && G.Riches.run(v, t, dt, H))) end(v);
    }
  }
  const LONG = { praia: 1, muster: 1, reembarque: 1, contato: 1, adeus: 1, barco: 1, descarga: 1, expl: 1, naufrago: 1, estaleiro: 1, cais: 1, redes: 1, embark: 1, boardBack: 1, scene: 1, saga: 1, caverna: 1, corpse: 1, water: 1, sleep: 1, migrate: 1, swim: 1, pray: 1, band: 1, escorted: 1, condemned: 1, envoy: 1, trade: 1, escape: 1, hide: 1, assembly: 1, escort: 1, combat: 1, pave: 1, sail: 1, siege: 1, sacrifice: 1, herd: 1, taxes: 1, army: 1, fest: 1, slaughter: 1, carga: 1, ajudar: 1, banca: 1, compra: 1, atacado: 1, devolver: 1, shop: 1 };

  function runBuild(v, t, dt) {
    const S = G.S;
    const b = S.buildings.get(t.id);
    if (!b || b.built || b.type === 'ruin') return end(v);
    const def = G.BDEF[b.type];
    if (t.st === 0) {
      if (v.carry && b.need[v.carry.k] !== undefined && v.carry.k !== 'food') {
        if (b.need[v.carry.k] > 0) {
          t.mat = v.carry.k;
          if (!t.counted) { b.incoming[t.mat] = (b.incoming[t.mat] || 0) + v.carry.n; t.counted = true; }
          if (!gotoB(v, b)) { b.incoming[t.mat] = Math.max(0, b.incoming[t.mat] - v.carry.n); t.counted = false; end(v); return deliverTask(v); }
          t.st = 2; return;
        }
        return deliverTask(v);
      }
      if (v.carry) return deliverTask(v);
      const stk = G.Fac.stockOfSet(b.set);
      const mat = Object.keys(b.need).find(k => b.need[k] - (b.incoming[k] || 0) > 0 && G.Fac.free(b.set, k) >= 1);
      if (mat) {
        const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) return end(v);
        const [dx, dy] = G.Village.frontTile(d);
        if (!Vg.goto(v, dx, dy, true)) return end(v);
        t.mat = mat; t.st = 1; return;
      }
      if (canWork(b)) { if (!gotoB(v, b, 0.3)) return end(v); t.st = 3; return; }
      return end(v);
    }
    if (t.st === 1) {
      if (!move(v, dt)) return;
      const stk = G.Fac.stockOfSet(b.set);
      const n = Math.min(cap(v), Math.ceil(b.need[t.mat] - (b.incoming[t.mat] || 0)), Math.floor(G.Fac.free(b.set, t.mat)));
      if (n <= 0) { t.st = 0; return; }
      stk[t.mat] -= n; v.carry = { k: t.mat, n }; b.incoming[t.mat] = (b.incoming[t.mat] || 0) + n; t.counted = true;
      if (!gotoB(v, b)) { b.incoming[t.mat] = Math.max(0, b.incoming[t.mat] - n); t.counted = false; end(v); return deliverTask(v); }
      t.st = 2; return;
    }
    if (t.st === 2) {
      if (!move(v, dt)) return;
      if (v.carry) {
        const n = v.carry.n; const k = v.carry.k;
        b.incoming[k] = Math.max(0, (b.incoming[k] || 0) - n);
        const used = Math.min(n, b.need[k]); b.need[k] -= used;
        v.carry = null; t.counted = false;
        if (n - used > 0) G.Village.addStock(k, n - used, G.Village.facOfSet(b.set));
        G.FX && G.FX.chips((b.x + b.w / 2), (b.y + b.h / 2), k === 'wood' ? '#a67c4e' : '#9a9a9a');
      }
      t.st = canWork(b) ? 4 : 0;
      v.actT = 0;
      return;
    }
    if (t.st === 3) { if (move(v, dt)) { t.st = 4; v.actT = 0; } return; }
    if (t.st === 4) {
      const allowed = allowedProgress(b);
      const [cx, cy] = G.Village.center(b);
      G.faceTo(v, cx - v.x, cy - v.y);
      if (b.progress < allowed) {
        v.act = 'build';
        b.progress = Math.min(allowed, b.progress + dt * workMul(v) * G.Civ.tV(v, 'build') / Math.max(1, def.work));
        if (v.actT > 0.5) { v.actT = 0; G.Audio && G.Audio.at(cx, cy, 'hammer'); G.FX && G.FX.dust(cx + G.rr(-0.5, 0.5), cy + G.rr(-0.5, 0.5)); }
        if (b.progress >= 1) { G.Village.completeBuilding(b); v.st.built++; emote(v, 'happy', 2.5); return end(v); }
      } else { t.st = 0; v.act = ''; }
    }
  }

  function runSleep(v, t, dt) {
    const S = G.S;
    const night = G.isNight();
    if (t.st === 0) {
      const pen = v.captive && G.War.penOf(v.set);
      if (pen) {
        const a = G.R() * 6.28, r = G.rr(0.2, 0.7);
        if (Vg.goto(v, pen.x + 1 + Math.cos(a) * r, pen.y + 1 + Math.sin(a) * r, false)) { t.st = 1; t.home = 0; return; }
      }
      const home = S.buildings.get(v.home);
      if (home && home.built && home.type !== 'ruin') {
        const [fx, fy] = G.Village.frontTile(home);
        if (Vg.goto(v, fx, fy, true)) { t.st = 1; t.home = home.id; return; }
      }
      const set = S.settlements.get(v.set); const cf = set && S.buildings.get(set.campfire);
      const cx = cf ? cf.x + 0.5 : v.x, cy = cf ? cf.y + 0.5 : v.y;
      // under the stars, but on dry ground: never in a river or a lake
      let tx = 0, ty = 0, ok = false;
      for (let k = 0; k < 6 && !ok; k++) { const a = G.R() * 6.28, r = G.rr(1.2, 2.3); tx = cx + Math.cos(a) * r; ty = cy + Math.sin(a) * r; ok = W.dryXY(tx, ty); }
      if (!ok) { const p = W.dryXY(v.x, v.y) ? [v.x, v.y] : W.nearestLand(v.x, v.y, 6); if (p) { tx = p[0]; ty = p[1]; } else { tx = v.x; ty = v.y; } }
      if (!Vg.goto(v, tx, ty, false)) v.path = null;
      t.st = 1; t.home = 0;
      return;
    }
    if (t.st === 1) {
      if (hungerWakes(v)) return; // (on the way to bed as in it)
      if (!move(v, dt)) return;
      // a path that never came: they climb out of the water before lying down
      if (!t.home && !W.dryXY(v.x, v.y)) { const p = W.nearestLand(v.x, v.y, 3); if (p) { v.x = p[0]; v.y = p[1]; } }
      t.st = 2; v.sleeping = true;
      if (t.home) { const h = S.buildings.get(t.home); if (h && h.built) v.inside = h.id; }
      // conception happens at night when partners share a bed
      if (v.g === 'f') tryConceive(v);
      return;
    }
    v.sleeping = true; v.act = 'sleep';
    if (!v.inside && G.R() < dt * 0.3) emote(v, 'zzz', 1.6);
    if (!night && v.energy >= 96) end(v);
    else if (!night && v.energy > 60 && v.hunger > 80) end(v);
    else hungerWakes(v);
  }
  // (the hunger at the top and the life going — a wound, a long road —: up to eat, at night too, by the same choice of a
  // meal as awake, on the way to bed as in it; with nothing to eat in reach, sleep on, not woken again for a while. The
  // body the player lives is never woken by the world — L-171)
  function hungerWakes(v) {
    const S = G.S;
    if (!(v.hunger >= 99.9 && v.hp < 60) || v._hungerT > S.clock || (S.avatar && S.avatar.id === v.id)) return false;
    v._hungerT = S.clock + G.DAY_LEN * 0.1;
    const e = eatTask(v); if (e) e.kind = 'eat';
    return !!e;
  }

  function tryConceive(v) {
    const S = G.S;
    if (v.conceiveDay === S.day) return; v.conceiveDay = S.day;
    if (v.preg > 0 || v.age < 17 || v.age > 46 || !v.partner || v.sick > 0) return;
    const p = S.villagers.get(v.partner); if (!p || p.set !== v.set) return;
    if (S.day - v.lastBirth < 1.5) return;
    const kids = v.kids.length; if (kids >= 6) return;
    const pop = S.villagers.size;
    const fpop = G.Fac.pop(G.Fac.idOfV(v)); const fst = G.Fac.stockV(v);
    const foodOk = fst.food > fpop * 0.9 || fst.food > 60;
    // the land feeds a limited number of people: bigger maps hold more
    const capPop = 90 * (N / 64) * (N / 64) * (N >= 128 ? 1.4 : 1);
    const crowd = G.Village.pop(v.set) > (G.City ? G.City.crowdCap(v.set) : 48) ? 0.5 : 1;
    let chance = 0.55 * G.Civ.tV(v, 'growth') * (foodOk ? 1 : 0.2) * crowd * (v.home ? 1 : 0.6) * (v.fear > 60 ? 0.5 : 1) * (kids >= 4 ? 0.6 : 1) * G.clamp(1 - (pop - capPop) / (capPop * 1.4), 0.06, 1);
    chance *= G.Nature.zoneMul(v.x, v.y, 'fertility');
    if (G.Nests && v.home && G.Nests.storkOn(v.home)) chance *= 1.25; // the stork on the roof
    if (S.weather.fertility > 0) chance *= 2;
    chance *= G.dv('births');
    if (G.R() < chance) { v.preg = G.DAY_LEN * 0.55; }
  }

  function runFire(v, t, dt) {
    const S = G.S;
    const set = S.settlements.get(v.set);
    // nearest burning tile to me
    const nearestFire = () => {
      let best = -1, bd = 1e9;
      for (const i of G.Nature.fireSet) { const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const d = G.dist2(v.x, v.y, x, y); if (d < bd) { bd = d; best = i; } }
      return bd < 22 * 22 ? best : -1;
    };
    if (t.st === 0) {
      if (nearestFire() < 0) return end(v);
      // (hands that carry something — a crate, a purchase, wood — keep it and beat the flames: the bucket would take its place)
      if (v.carry && v.carry.n > 0 && v.carry.k !== 'water') { t.beat = true; t.st = 3; t.target = -1; return; }
      // water source: well of the settlement, or any water tile nearby
      let src = null, bd = 1e9;
      for (const b of S.buildings.values()) if (b.type === 'well' && b.built) { const d = G.dist2(v.x, v.y, b.x, b.y); if (d < bd && d < 200) { bd = d; src = { well: b }; } }
      if (!src) {
        const spot = nearestInGrid(v, 9, i => {
          if (!W.walkable(i) || S.fire[i] > 0) return null;
          const x = i % N, y = (i / N) | 0;
          for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.type[ny * N + nx] <= T.RIVER) return { x: x + 0.5, y: y + 0.5 }; }
          return null;
        });
        if (spot) src = { x: spot.x, y: spot.y };
      }
      if (src) {
        const ok = src.well ? Vg.goto(v, ...G.Village.frontTile(src.well), true) : Vg.goto(v, src.x, src.y, false);
        if (ok) { t.st = 1; return; }
      }
      t.beat = true; t.st = 3; t.target = -1; return;
    }
    if (t.st === 1) { if (move(v, dt, 1.3)) { t.st = 2; v.actT = 0; } return; }
    if (t.st === 2) { v.act = 'fill'; if (v.actT > 0.8) { v.carry = { k: 'water', n: 1 }; t.st = 3; t.target = -1; } return; }
    if (t.st === 3) {
      // (the bucket is poured out or set down; a load that was in the hands stays in them)
      const i = nearestFire(); if (i < 0) { if (v.carry && v.carry.k === 'water') v.carry = null; return end(v); }
      t.target = i; const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
      if (!Vg.goto(v, x, y, true)) { if (v.carry && v.carry.k === 'water') v.carry = null; return end(v); }
      t.st = 4; return;
    }
    if (t.st === 4) {
      if (S.fire[t.target] <= 0) { t.st = 3; return; }
      if (move(v, dt, 1.3)) { t.st = 5; v.actT = 0; }
      return;
    }
    if (t.st === 5) {
      const i = t.target; const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
      G.faceTo(v, x - v.x, y - v.y);
      if (t.beat) {
        v.act = 'beat'; G.Nature.extinguish(i, 0.22 * dt * workMul(v));
        if (v.actT > 0.5) { v.actT = 0; G.FX && G.FX.smokePuff(x, y); }
        if (S.fire[i] <= 0) t.st = 3;
        if (t.age > 30) return end(v);
      } else {
        v.act = 'throw';
        if (v.actT > 0.45) {
          G.Nature.extinguish(i, 0.65);
          const xi = i % N, yi = (i / N) | 0;
          for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) if (W.inb(xi + dx, yi + dy)) G.Nature.extinguish((yi + dy) * N + xi + dx, 0.15);
          G.FX && G.FX.splash(x, y, 1); G.Audio && G.Audio.at(x, y, 'splash');
          v.carry = null; t.st = 0;
          v.devotion = v.devotion; // no-op, keeps shape
        }
      }
    }
  }

  // ------------------------------ physics (divine hand) ------------------------------
  G.airUpdate = function (e, dt, onLand) {
    e.z += e.vz * dt; e.vz -= 520 * dt;
    e.x = G.clamp(e.x + e.vx * dt, 0.3, N - 0.3); e.y = G.clamp(e.y + e.vy * dt, 0.3, N - 0.3);
    if (e.z <= 0) { const impact = -e.vz; e.z = 0; e.vz = 0; e.air = false; const sp = Math.hypot(e.vx, e.vy); e.vx = 0; e.vy = 0; onLand(impact + sp * 25); }
  };
  function land(v, impact) {
    const S = G.S; const i = W.idx(v.x, v.y);
    if ((S.type[i] <= T.SEA && !(S.dry && S.dry[i])) || (S.type[i] === T.RIVER)) {
      G.FX && G.FX.splash(v.x, v.y, 1.2); G.Audio && G.Audio.at(v.x, v.y, 'splash', true);
      if (S.type[i] <= T.SEA) { setTask(v, { type: 'swim', pri: 6 }); emote(v, 'fear', 3); return; }
    } else {
      G.FX && G.FX.dust(v.x, v.y, 6); G.Audio && G.Audio.at(v.x, v.y, 'thud', true);
      const dmg = Math.max(0, (impact - 230) * 0.4);
      if (dmg > 0) Vg.damage(v, dmg, 'fall', true);
      if (!S.villagers.has(v.id)) return;
      if (!W.walkable(i)) { const n = W.nearestLand(v.x, v.y, 6); if (n) { v.x = n[0]; v.y = n[1]; } }
    }
    v.fear = Math.min(100, v.fear + 18);
    emote(v, 'fear', 3);
    Vg.endTask(v);
    fleeFrom(v, v.x + G.rr(-1, 1), v.y + G.rr(-1, 1), 3, 'panic');
  }

  // ------------------------------ babies ------------------------------
  // nobody takes a baby to a battlefield: soldiers, hunters and guards leave it with someone at home
  const ROUGH = { band: 1, fight: 1, patrol: 1, drill: 1, guard: 1, hunt: 1, flee: 0 };
  const unfitCarrier = c => !c || c.dead || c.captive || c.role === 'guerreiro' || (c.task && (ROUGH[c.task.type] || c.task.kind === 'band' || (c.task.type === 'caverna' && c.task.kind === 'raid'))) || c.fury > 0 || atSea(c);
  // (nor out to sea: a baby stays ashore with someone while the boat fishes or the ship explores — only colonists take the whole family)
  function atSea(c) { if (!c.aboard) return false; const e = G.Expe && G.Expe.memberOf(c.id); return !(e && e.kind === 'colonia'); }
  function babyUpdate(v, dt) {
    const S = G.S;
    v.task = null;
    let c = S.villagers.get(v.carrier);
    if (!c || c.set !== v.set || c.age < 14 || unfitCarrier(c)) {
      c = null;
      if ((v.seekT = (v.seekT || 0) - dt) <= 0) {
        v.seekT = 1;
        const ok = o => o && o !== v && o.set === v.set && o.age >= 14 && !unfitCarrier(o);
        c = [S.villagers.get(v.mother), S.villagers.get(v.father)].find(ok) || null;
        // a grandmother, an aunt, a neighbour: the women of the village, then anyone grown
        if (!c) { let bd = 1e9; for (const o of S.villagers.values()) if (ok(o) && o.age >= 16 && o.age < 70) { const d = G.dist2(o.x, o.y, v.x, v.y) + (o.g === 'f' ? 0 : 400); if (d < bd) { bd = d; c = o; } } }
      }
      v.carrier = c ? c.id : 0;
    }
    if (c) {
      v.x = c.x + c.face * -0.08; v.y = c.y + 0.02; v.inside = c.inside; v.sleeping = c.sleeping; G.faceAs(v, c);
      v.carried = !c.inside && !c.sleeping;
    } else {
      // no one free to hold it: the baby sleeps at home
      v.carried = false; v.sleeping = G.isNight();
      const h = !v.ug && (S.buildings.get(v.home) || S.buildings.get((S.villagers.get(v.mother) || {}).home));
      if (h && h.built) { const [hx, hy] = G.Village.center(h); v.x = hx; v.y = hy; v.inside = h.id; }
    }
  }

  // ------------------------------ per-frame update ------------------------------
  let tAlarm = 0, tPush = 0;
  G.worldHooks.push(() => { tAlarm = 0; tPush = 0; });
  Vg.nightWatch = new Map();
  Vg.workshopFac = new Set();
  const roster = [], sleepAcc = new Map(); let sleepTick = 0;
  G.worldHooks.push(() => { sleepAcc.clear(); sleepTick = 0; });
  G.worldHooks.push(() => { Vg.alarms.clear(); Vg.fireFighters.clear(); Vg.fishSpots.clear(); Vg.nightWatch.clear(); Vg.workshopFac.clear(); roster.length = 0; }); // (a new world, or a save loaded: it starts over)
  Vg.updateAll = function (dt) {
    const S = G.S;
    tAlarm -= dt; tPush -= dt;
    if (tAlarm <= 0) {
      tAlarm = 1;
      Vg.alarms.clear(); Vg.fireFighters.clear();
      Vg.workshopFac.clear();
      for (const b of S.buildings.values()) if (b.type === 'workshop' && b.built) Vg.workshopFac.add(G.Village.facOfSet(b.set));
      if (G.Nature.fireSet.size) {
        for (const i of G.Nature.fireSet) {
          if (S.fire[i] < 0.08) continue;
          const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
          for (const s of S.settlements.values()) {
            if (G.dist2(x, y, s.cx, s.cy) < 15 * 15) { if (!Vg.alarms.has(s.id)) Vg.alarms.set(s.id, []); Vg.alarms.get(s.id).push(i); }
          }
        }
        for (const v of S.villagers.values()) if (v.task && v.task.type === 'fire') Vg.fireFighters.set(v.set, (Vg.fireFighters.get(v.set) || 0) + 1);
      }
      // choose a night watch per settlement (only for bigger villages)
      Vg.nightWatch.clear();
      for (const s of S.settlements.values()) {
        if (G.Village.pop(s.id) < 14) continue;
        let w = null; for (const v of S.villagers.values()) if (v.set === s.id && v.role === 'cacador' && v.energy > 40) { w = v; break; }
        if (w) Vg.nightWatch.set(s.id, w.id);
      }
      // spread sickness (neighbours only: a coarse grid of the sick)
      const sickGrid = new Map(); let anySick = false;
      for (const v of S.villagers.values()) if (v.sick > 0) { anySick = true; const k = ((v.x >> 2) << 12) | (v.y >> 2); let l = sickGrid.get(k); if (!l) sickGrid.set(k, l = []); l.push(v); }
      if (anySick) {
        const R2 = S.plague ? 4 : 1.5;
        for (const o of S.villagers.values()) {
          if (o.sick > 0 || o.immune > 0) continue;
          const cx = o.x >> 2, cy = o.y >> 2; let hit = false;
          for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) {
            const l = sickGrid.get(((cx + dx) << 12) | (cy + dy)); if (!l) continue;
            for (const v of l) if (G.dist2(v.x, v.y, o.x, o.y) < R2 && G.R() < (S.plague ? 0.05 : 0.012) * (Vg.hasWell(o.set) ? 0.4 : 1) * (o.traits.includes('Resistente') ? 0.4 : 1) * (G.Life ? G.Life.dirtMul(o) : 1)) { o.sick = G.DAY_LEN * G.rr(0.4, 0.8); hit = true; break; }
          }
        }
      }
    }
    if (tPush <= 0) {
      tPush = 1;
      // unstick villagers standing inside blocking footprints
      for (const v of S.villagers.values()) {
        if (v.inside || v.air || v.held || v.age < 2 || v.aboard || (v.task && (v.task.perch || (v.task.type === 'barco' && v.task.st === 4)))) continue;
        if (G.Possess && G.Possess.afloat(v)) continue; // (the body swimming by the player's will: not pulled out — it swims or drowns)
        if (G.Possess && G.Possess.onPlan && G.Possess.onPlan(v)) continue; // (the body where a plan lets it stand: a doorstep the map has blocked)
        const i = W.idx(v.x, v.y);
        if (!W.walkable(i) && S.type[i] !== T.SEA && S.type[i] !== T.DEEP) {
          const n = W.nearestLand(v.x, v.y, 5); if (n) { const e = v.path && v.pi < v.path.length ? v.path[v.path.length - 1] : null; v.x = n[0]; v.y = n[1]; v.path = null; if (v.task && e && !Vg.goto(v, e[0], e[1], false)) v.task.st = 0; }
        } else if (watch(v)) { /* (moved somewhere it can get out of) */
        } else if (S.type[i] <= T.SEA && !(S.dry && S.dry[i]) && (!v.task || v.task.type !== 'swim') && !(v.task && (v.task.type === 'mariscar' || v.task.type === 'pocas') && v.task.st >= 2) && !(v.task && v.task.type === 'dive' && v.task.st >= 1)) { setTask(v, { type: 'swim', pri: 6 }); }
      }
    }
    // (a list of its own: people die and are born while the loop runs)
    roster.length = 0; for (const v of S.villagers.values()) roster.push(v);
    const lod = !!(G.Skip && G.Skip.on); if (lod) sleepTick++; else if (sleepAcc.size) sleepAcc.clear();
    for (let k = 0; k < roster.length; k++) {
      const v = roster[k];
      if (v.held) continue;
      if (v.air) { G.airUpdate(v, dt, imp => land(v, imp)); continue; }
      let vdt = dt;
      // (the skip: one asleep in bed lives every other half-step, the time added up — nothing that happens to a sleeper
      // turns on half a second; a fire in the house still wakes them, in the needs)
      if (lod && v.sleeping && v.task && v.task.type === 'sleep') {
        if ((v.id + sleepTick) & 1) { sleepAcc.set(v.id, (sleepAcc.get(v.id) || 0) + dt); continue; }
        const w = sleepAcc.get(v.id); if (w) { vdt += w; sleepAcc.delete(v.id); }
      }
      // at sea: only the body's needs go on (provisions come from the stores)
      if (v.aboard) {
        if (!G.Naval || !G.Naval.aboard(v.aboard)) { if (G.Naval) G.Naval.unboard(v); else { v.aboard = 0; v.task = null; } const p = W.nearestLand(v.x, v.y, 8); if (p) { v.x = p[0]; v.y = p[1]; } }
        else { if (!v.task || v.task.type !== 'aboard') v.task = { type: 'aboard', ship: v.aboard, pri: 9, st: 0, age: 0 }; needs(v, vdt); v.moving = false; if (v.emo) { v.emo.t -= vdt; if (v.emo.t <= 0) v.emo = null; } continue; }
      }
      needs(v, vdt);
      if (!S.villagers.has(v.id)) continue;
      // nobody stays up in the air once the ladder or the pyramid steps are behind them
      if (v.z && !v.air && !(v.task && (v.task.perch || v.task.ladder || v.task.type === 'fest'))) v.z = 0;
      if (v.age < 2) { babyUpdate(v, vdt); if (v.emo) { v.emo.t -= vdt; if (v.emo.t <= 0) v.emo = null; } continue; }
      if (v.carried) { v.carried = false; v.carrier = 0; }
      // (the body the player lives: its needs went on above; its will is the player's — no deciding of its own)
      if (S.avatar && S.avatar.id === v.id) { G.Possess.live(v, vdt); if (v.emo) { v.emo.t -= vdt; if (v.emo.t <= 0) v.emo = null; } continue; }
      v.scan -= vdt;
      if (v.scan <= 0) { v.scan = 0.3 + G.R() * 0.15; emergency(v); }
      v.think -= vdt;
      if (!v.task || v.think <= 0) { v.think = 1.4 + G.R() * 1.6; decide(v); }
      if (v.task) runTask(v, vdt); else v.moving = false;
      if (!v.task || !v.path || v.pi >= v.path.length) v.moving = false;
      if (v.emo) { v.emo.t -= vdt; if (v.emo.t <= 0) v.emo = null; }
      if (v.preg > 0 && G.R() < vdt * 0.02) emote(v, 'heart', 1.5);
    }
    // (the operations of the world: each looks at its people, its places and its goods, and hands out the next steps)
    if (G.Act) G.tryRun('Atividades', d => G.Act.update(d), dt);
  };
  // ------------------------------ the stuck: someone who has not moved for a long while ------------------------------
  // (a pocket between cliffs, a ledge, a gap between houses and a fence: every errand fails, or the feet keep walking
  // in place. Twenty seconds of that and they are set down on the nearest spot from which home can be reached)
  const STILL = { praia: 1, reembarque: 1, contato: 1, adeus: 1, barco: 1, descarga: 1, expl: 1, naufrago: 1, estaleiro: 1, cais: 1, redes: 1, scene: 1, jail: 1, condemned: 1, escorted: 1, hide: 1, sleep: 1, pray: 1, aboard: 1, swim: 1, dive: 1, mariscar: 1, pocas: 1, fest: 1, assembly: 1, avatar: 1, ajudar: 1, conferir: 1, banca: 1 };
  function watch(v) {
    if (v.sleeping || v.captive && !(v.task && v.task.type === 'escape')) { v._wd = null; return false; }
    const wd = v._wd || (v._wd = { x: v.x, y: v.y, t: 0, mv: 0 });
    wd.t += 1; if (v.moving) wd.mv += 1;
    if (wd.t < 20) return false;
    const moved = G.dist(v.x, v.y, wd.x, wd.y); const mv = wd.mv;
    wd.x = v.x; wd.y = v.y; wd.t = 0; wd.mv = 0;
    if (v.task && STILL[v.task.type]) return false;
    if (moved > 0.6) return (v._pfN || 0) >= 8 ? unstick(v) : false;
    const failing = (v._pfN || 0) >= 4, treading = mv >= 15 && moved < 0.4;
    if (!failing && !treading) return false;
    return unstick(v);
  }
  const KEEP_TASK = { band: 1, muster: 1, refugio: 1 };
  function unstick(v) {
    const S = G.S; const set = S.settlements.get(v.set);
    const home = set ? [set.cx, set.cy] : null;
    const ok = (x, y) => W.walkableXY(x, y) && (!home || W.reachesTownXY(x, y, set));
    if (home && ok(v.x, v.y)) { v._pfN = 0; v._pfI = -1; if (v.task && !v.task.pri) G.Vg.endTask(v); return false; }
    for (const r of [1, 1.5, 2.2, 3, 4.5, 6, 8]) for (let k = 0; k < 8; k++) {
      const a = k / 8 * Math.PI * 2; const x = Math.floor(v.x + Math.cos(a) * r) + 0.5, y = Math.floor(v.y + Math.sin(a) * r) + 0.5;
      if (!ok(x, y)) continue;
      v.x = x; v.y = y; v.path = null; v._pfN = 0; v._pfI = -1; v.moving = false;
      // (a soldier stays in the army, a refugee on the road: only the errand that kept failing is given up)
      if (v.task && v.task.pri < 4 && !KEEP_TASK[v.task.type]) G.Vg.endTask(v);
      v.think = 0;
      return true;
    }
    v._pfN = 0;
    return false;
  }
  Vg.unstick = unstick;
  // (the round of every second for one person, at once — for whoever the ground just changed under (miracles.js): off ground
  // that no longer bears them — a ford gone deep, a slope gone steep — to the nearest that does, on the way they were going;
  // in the sea with no boat, swimming for the shore. Before the panic sends them looking for a way from where there is no
  // ground, a failed way each step — L-306). True when it did
  Vg.reground = function (v) {
    const S = G.S; const t = v.task;
    if (v.inside || v.air || v.held || v.age < 2 || v.aboard || v.ug || (t && (t.perch || (t.type === 'barco' && t.st === 4)))) return false;
    if (G.Possess && (G.Possess.afloat(v) || (G.Possess.onPlan && G.Possess.onPlan(v)))) return false;
    const i = W.idx(v.x, v.y);
    if (!W.walkable(i) && S.type[i] !== T.SEA && S.type[i] !== T.DEEP) {
      const n = W.nearestLand(v.x, v.y, 5); if (!n) return false; const e = v.path && v.pi < v.path.length ? v.path[v.path.length - 1] : null;
      v.x = n[0]; v.y = n[1]; v.path = null; v._pfN = 0; v._pfI = -1; if (v.task && e && !Vg.goto(v, e[0], e[1], false)) v.task.st = 0; return true;
    }
    if (!(S.type[i] <= T.SEA) || (S.dry && S.dry[i])) return false;
    if (t && (t.type === 'swim' || ((t.type === 'mariscar' || t.type === 'pocas') && t.st >= 2) || (t.type === 'dive' && t.st >= 1))) return false;
    v.path = null; v._pfN = 0; v._pfI = -1; setTask(v, { type: 'swim', pri: 6 }); return true;
  };
  Vg.hasWell = G.perPart(function (setId) { for (const b of G.S.buildings.values()) if (b.type === 'well' && b.built && b.set === setId) return true; return false; });

  // helpers shared with the war & politics modules
  const H = Vg.H = { setTask, end, move, goto: (v, x, y, adj, max) => Vg.goto(v, x, y, adj, max), arrived, flee: fleeFrom, eatTask, workTask, childDecide };
  Vg.setTask = setTask;

  // ------------------------------ descriptions ------------------------------
  const MAT = new Proxy({ wood: 'madeira', food: 'comida', stone: 'pedra', water: 'água' }, { get: (o, k) => o[k] || (G.Eco ? G.Eco.name(k) : k) });
  const ANIMAL = new Proxy({}, { get: (o, k) => (G.Animals.DEF[k] ? G.Animals.DEF[k].nameA : 'um animal') });
  Vg.taskText = function (v) {
    const S = G.S; const t = v.task;
    if (v.held) return 'Nas mãos de deus!';
    if (v.air) return 'Voando pelos ares!';
    if (v.age < 2) { const c = S.villagers.get(v.carrier); return c ? (v.sleeping ? 'Dormindo' : `No colo de ${c.name}`) : 'Chorando sozinho'; }
    if (!t) return v.sleeping ? 'Dormindo' : 'Pensando no que fazer';
    const wt = (G.Scene && G.Scene.taskText(v, t)) || (G.Justice && G.Justice.taskText(v, t)) || (G.Riots && G.Riots.taskText(v, t)) || (G.Secrets && G.Secrets.taskText(v, t)) || (G.Stories && G.Stories.party && G.Stories.party.taskText(v, t)) || (G.Polity && G.Polity.taskText(v, t)) || (G.Flora && G.Flora.taskText(v, t)) || (G.Nests && G.Nests.taskText(v, t)) || (G.Riches && G.Riches.taskText && G.Riches.taskText(v, t)) || (G.Caves && G.Caves.taskText(v, t)) || (G.Army && G.Army.taskText(v, t)) || G.War.taskText(v, t) || (G.Wars && G.Wars.taskText(v, t)) || (G.City && G.City.taskText(v, t)) || (G.Urban && G.Urban.taskText(v, t)) || (G.Naval && G.Naval.taskText(v, t)) || (G.Eco && G.Eco.taskText(v, t)) || (G.Army && G.Army.taskText(v, t)) || (G.Fest && G.Fest.taskText(v, t)) || (G.Life && G.Life.taskText(v, t)) || (G.Carnage && G.Carnage.taskText(v, t)); if (wt) return wt;
    const bname = id => { const b = S.buildings.get(id); return b ? G.Village.buildName(b) : 'construção'; };
    const pname = id => { const o = S.villagers.get(id); return o ? o.name : 'alguém'; };
    switch (t.type) {
      case 'idle': return 'Descansando';
      case 'wander': return 'Passeando';
      case 'deliver': { const d = S.buildings.get(t.drop); return v.carry ? `Levando ${MAT[v.carry.k]} ${d && d.type === 'storehouse' ? 'ao armazém' : 'à fogueira'}` : 'Guardando recursos'; }
      case 'chop': return t.st < 2 ? 'Indo cortar uma árvore' : 'Cortando lenha';
      case 'gather': return t.kind === 'help' ? 'Ajudando a colher frutas' : 'Colhendo frutas silvestres';
      case 'forage': return 'Procurando algo para comer';
      case 'mine': return t.st < 2 ? 'Indo quebrar pedras' : 'Quebrando pedras';
      case 'quarry': return t.st < 2 ? 'Indo à pedreira' : 'Extraindo pedra da encosta';
      case 'drift': return t.st < 2 ? 'Indo à praia' : 'Catando madeira que o mar trouxe';
      case 'saga': return G.Stories ? G.Stories.taskText(v, t) : 'Pensando na vida';
      case 'mariscar': return t.st < 2 ? 'Indo à praia na maré baixa' : t.st === 3 ? (G.Sea.shift() < 0.14 ? 'Fugindo da maré que volta!' : 'Voltando com o cesto de mariscos') : t.rock ? 'Catando mariscos e caranguejos nas pedras da maré baixa' : 'Cavando mariscos na areia molhada da maré baixa';
      case 'baleia': return t.st < 2 ? 'Correndo para a praia: uma baleia encalhou!' : 'Cortando a carne da baleia encalhada';
      case 'olhar': return t.what === 'tartarugas' ? (t.st < 2 ? 'Correndo para a praia: as tartaruguinhas estão nascendo!' : 'Vendo as tartaruguinhas correrem para o mar') : 'Olhando';
      case 'pocas': return t.st < 2 ? 'Correndo para a praia: a maré baixou!' : t.st === 3 ? 'Voltando da praia' : 'Brincando nas poças da maré baixa';
      case 'fish': return t.st < 2 ? 'Indo pescar' : 'Pescando';
      case 'hunt': { const a = S.animals.get(t.id); return a && a.dead ? 'Recolhendo a caça' : `Caçando ${a ? ANIMAL[a.kind] : 'um animal'}`; }
      case 'fight': { const a = S.animals.get(t.id); return `Lutando contra ${a ? ANIMAL[a.kind] : 'uma fera'}!`; }
      case 'patrol': return t.torch ? 'Vigiando a vila durante a noite' : v.role === 'guerreiro' ? 'Montando guarda' : 'Patrulhando os arredores';
      case 'farm': return t.harvest ? 'Colhendo trigo' : 'Plantando trigo';
      case 'build': {
        const n = bname(t.id);
        if (t.st === 1) return `Buscando ${MAT[t.mat]} para ${n}`;
        if (t.st === 2 && v.carry) return `Levando ${MAT[v.carry.k]} para a construção de ${n}`;
        if (t.st >= 3) return `Construindo ${n}`;
        return `Trabalhando em ${n}`;
      }
      case 'eat': return t.st < 2 ? 'Indo comer' : 'Comendo';
      case 'sleep': return v.sleeping ? (v.inside ? 'Dormindo em casa' : 'Dormindo ao relento') : 'Indo dormir';
      case 'flee': return t.why === 'play' ? 'Correndo do eco da caverna, rindo' : t.why === 'meteor' ? 'Fugindo do céu em chamas!' : t.why === 'fire' ? 'Fugindo do incêndio!' : t.why === 'wolf' ? 'Fugindo de uma fera!' : t.why === 'war' ? 'Fugindo dos invasores!' : t.why === 'ghost' ? 'Fugindo de um fantasma!' : t.why === 'dragon' ? 'Fugindo do dragão!' : 'Correndo em pânico!';
      case 'fire': return t.st === 2 ? 'Enchendo o balde' : t.beat ? 'Abafando as chamas' : 'Combatendo o incêndio!';
      case 'social': return `Conversando com ${pname(t.id)}`;
      case 'talk': return t.hug ? `Abraçando ${pname(t.id)}` : t.dance ? `Dançando com ${pname(t.id)}` : t.court ? `Flertando com ${pname(t.id)}` : `Conversando com ${pname(t.id)}`;
      case 'court': return `Cortejando ${pname(t.id)}`;
      case 'visit': { const o = S.villagers.get(t.id); if (!o) return 'Visitando a família'; const rel = o.id === v.mother ? 'a mãe' : o.id === v.father ? 'o pai' : o.id === v.partner ? (o.g === 'f' ? 'a parceira' : 'o parceiro') : (o.g === 'f' ? 'a filha' : 'o filho'); return `Visitando ${rel}, ${o.name}`; }
      case 'pray': return t.priest ? 'Conduzindo orações' : v.captive ? 'Rezando por liberdade' : 'Rezando para você';
      case 'explore': return 'Explorando a ilha';
      case 'rest': return t.stories ? 'Contando histórias junto à fogueira' : 'Descansando junto à fogueira';
      case 'play': return 'Brincando';
      case 'follow': return 'Seguindo a mãe';
      case 'migrate': { const s = S.settlements.get(v.set); return `Migrando para ${s ? s.name : 'novas terras'}`; }
      case 'swim': return 'Nadando desesperadamente até a margem!';
      case 'funeral': return 'De luto, visitando um túmulo';
      case 'shelter': return v.inside ? 'Abrigado da tempestade' : 'Correndo para casa, fugindo da tempestade';
      case 'celebrate': return 'Celebrando com a vila!';
    }
    return '…';
  };
})(window.G);
