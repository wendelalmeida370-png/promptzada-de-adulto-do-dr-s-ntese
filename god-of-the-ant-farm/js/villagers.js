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

  Vg.create = function (o) {
    const S = G.S;
    const m = o.mother ? G.person(o.mother) : null, f = o.father ? G.person(o.father) : null;
    const g = o.g || (G.R() < 0.5 ? 'f' : 'm');
    const traits = o.traits || rollTraits([m, f]);
    const home = S.settlements.get(o.set); const civId = o.civ || (home ? G.Civ.idOfFac(home.fac) : null); const civ = G.CIVS[civId];
    let courage = G.clamp(0.45 + (G.R() - 0.5) * 0.5 + (traits.includes('Corajoso') ? 0.35 : 0) - (traits.includes('Medroso') ? 0.35 : 0) + (civ && civ.traits.courage || 0), 0, 1);
    const v = {
      id: S.nextId++, name: o.name || uniqueName(g, civId), g, age: o.age, born: S.day - o.age, civ: civId || null,
      hp: 100, hunger: G.rr(5, 35), energy: G.rr(65, 100),
      role: null, x: o.x, y: o.y, z: 0, vx: 0, vy: 0, vz: 0, air: false, held: false,
      path: null, pi: 0, task: null, act: '', actT: 0, carry: null,
      home: 0, set: o.set, partner: 0, mother: o.mother || 0, father: o.father || 0, kids: [], widow: 0,
      courage, traits, devotion: traits.includes('Devoto') ? G.rr(10, 20) : G.rr(1, 7), fear: 0,
      sick: 0, preg: 0, lastBirth: -99, conceiveDay: -1, mourn: 0, courtCD: G.rr(5, 25),
      emo: null, face: G.R() < 0.5 ? 1 : -1, walkPh: G.R() * 10, moving: false,
      think: G.R(), scan: G.R() * 0.3, sleeping: false, inside: 0, hurt: 0,
      speed: G.rr(1.25, 1.5), work: traits.includes('Trabalhador') ? 1.25 : traits.includes('Preguiçoso') ? 0.8 : 1,
      skin: m && f ? (G.R() < 0.5 ? m.skin : f.skin) : (o.skin || G.pick(civ ? civ.skin : SKIN)),
      hair: m && f ? (G.R() < 0.5 ? m.hair : f.hair) : G.pick(civ ? civ.hair : HAIR),
      kidCloth: G.pick(KID_CLOTH), st: { wood: 0, food: 0, stone: 0, built: 0 }, lastCause: 'unknown', lastGod: false,
    };
    if (!v.skin) v.skin = G.pick(SKIN); if (!v.hair) v.hair = G.pick(HAIR);
    S.villagers.set(v.id, v);
    G.Life && G.Life.onCreate(v);
    return v;
  };

  // ------------------------------ helpers ------------------------------
  const cap = v => (v.age < 12 ? 1 : v.age < 16 ? 2 : v.age >= 62 ? 2 : 4);
  Vg.cap = cap;
  const isAdult = v => v.age >= 16 && v.age < 62;
  function workMul(v) {
    let m = v.work * (v.sick > 0 ? 0.5 : 1) * (v.mourn > 0 ? 0.85 : 1) * (v.fear > 70 ? 0.85 : 1);
    const fid = G.Fac.idOfV(v);
    if (Vg.workshopFac.has(fid)) m *= 1.15;
    if (v.captive) m *= 0.8;
    else { const f = G.Fac.get(fid); if (f && f.gov === 'tirania') m *= 1.08; }
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
    const p = W.findPath(v.x, v.y, x, y, adj, maxNodes);
    if (!p) { v.path = null; v._pfI = ti; v._pfT = now; return false; }
    v.path = p; v.pi = 0; return true;
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
    Vg.endTask(v);
    t.age = 0; if (t.st === undefined) t.st = 0;
    v.task = t; v.act = ''; v.actT = 0;
    return t;
  }
  function emote(v, k, t) { v.emo = { k, t: t || 2.5 }; }
  Vg.give = function (v, t) { if (v.task && v.task.pri >= (t.pri || 0) + 0.01 && v.task.pri >= 2) return false; if (v.sleeping || v.inside || v.air || v.held || v.age < 3) return false; setTask(v, t); return true; };
  Vg.emote = emote;

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
  function V_door(b) {
    // find a walkable tile next to the building front
    const cands = [[b.x + b.w - 0.5, b.y + b.h + 0.4], [b.x + b.w + 0.4, b.y + b.h - 0.5], [b.x - 0.4, b.y + 0.5], [b.x + 0.5, b.y - 0.4]];
    for (const c of cands) if (W.walkableXY(c[0], c[1])) return c;
    const n = W.nearestLand(b.x + b.w / 2, b.y + b.h / 2, 4); return n || cands[0];
  }
  Vg.door = V_door;

  Vg.damage = function (v, amt, cause, byGod, by) {
    if (!G.S.villagers.has(v.id)) return;
    v.hp -= amt; v.lastCause = cause; v.lastGod = !!byGod; v.hurt = 0.3; v.lastBy = by || 0;
    if (cause === 'arrow' && G.Carnage) G.Carnage.onArrow(v);
    if (v.hp <= 0) G.Village.kill(v, cause, byGod);
  };

  // ------------------------------ movement ------------------------------
  function move(v, dt, mul) {
    const S = G.S;
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
    if (v.hunger > 80 && v.task && (FIELD[v.task.type] || v.task.type === 'escorted') && (!v.captive || v.task.type === 'escorted') && v.age >= 2) { const st = G.Fac.stockV(v); if (st.food >= 1) { st.food -= 1; v.hunger = Math.max(0, v.hunger - 50); } }
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

  const FIELD = { band: 1, combat: 1, envoy: 1, trade: 1, escort: 1, hide: 1, assembly: 1, migrate: 1, aboard: 1, embark: 1, boardBack: 1, pave: 1 };
  // ------------------------------ emergencies ------------------------------
  Vg.alarms = new Map(); // settlement id -> [tile indices]
  Vg.fireFighters = new Map();
  Vg.fishSpots = new Map();
  function emergency(v) {
    const S = G.S;
    if (v.ug) return; // underground: the cave errand decides (the hidden stay hidden)
    const t = v.task;
    if (t && t.type === 'flee' && t.age < 3.5) return;
    if (t && (t.type === 'swim' || t.type === 'condemned' || t.type === 'escorted')) return;
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
      if (d < p.r && !(t && (t.type === 'fire' || t.type === 'fight'))) { if (v.inside) Vg.endTask(v); fleeFrom(v, p.x, p.y, p.r + 3 - d, p.why || 'panic'); emote(v, 'fear', 2.5); return; }
    }
    if (G.War.emergency(v, H)) return;
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
    if (!child && (v.role === 'pastor' || v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'cavalarico') && v.hp > 45 && !(t && (t.type === 'fight' || t.type === 'combat' || t.type === 'band' || t.type === 'army'))) {
      let raider = null; G.Animals.nearThreat(v.x, v.y, 9, a => { if (!raider && G.Animals.raider(a)) raider = a; });
      if (raider) { let fighters = 0; for (const o of S.villagers.values()) if (o.task && o.task.type === 'fight' && o.task.id === raider.id) fighters++; if (fighters < 3) { setTask(v, { type: 'fight', id: raider.id, pri: 4, rt: 0 }); emote(v, 'angry', 2); return; } }
    }
    // fire close by
    if (t && t.type === 'fire') return;
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
    if (al && al.length && canFight && (!t || t.pri < 3) && (Vg.fireFighters.get(v.set) || 0) < 9) {
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
    if (night) opt(0.95 + (100 - v.energy) / 250, 1.5, 'sleep');
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
      opt(0.14 * G.R(), 0, 'visit');
      if (eve || elder) opt(0.3 * G.R() * (elder ? 2 : 1), 0, 'rest');
      // the working day ends: home, or a cup at the tavern
      if (eve && v.home) opt(0.55 + G.R() * 0.4, 0.45, 'home');
      if (eve && G.Eco) opt((v.traits.includes('Sociável') ? 0.6 : 0.35) * G.R() * 1.5, 0.4, 'tavern');
      if (G.Eco && !eve) opt(0.16 * G.R() * 1.6, 0.35, 'shop');
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
    switch (kind) {
      case 'eat': t = eatTask(v); break;
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
      case 'home': t = (G.Life && G.Life.familyTask(v, H)) || (G.Eco && G.Eco.goHomeTask(v, H)); break;
      case 'tavern': t = G.Eco && G.Eco.tavernTask(v, H); break;
      case 'shop': t = G.Eco && G.Eco.shopTask(v, H); break;
    }
    if (!t) { if (!v.task) wander(v, 4); }
    else t.kind = kind;
  }
  function wander(v, r) {
    const set = G.S.settlements.get(v.set);
    const cx = set ? set.cx : v.x, cy = set ? set.cy : v.y;
    if (set && G.dist(v.x, v.y, cx, cy) > 16 && (!v.task || v.task.type !== 'migrate')) { setTask(v, { type: 'migrate', pri: 1.5, kind: 'migrate' }); return; }
    const base = G.dist(v.x, v.y, cx, cy) > 10 ? [cx, cy] : [v.x, v.y];
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
    if (night) { if (!cur || cur.type !== 'sleep') setTask(v, { type: 'sleep', pri: 1.5, kind: 'sleep' }); return; }
    if (v.hunger > 60 && (!cur || cur.pri < 1.2)) { const t = eatTask(v); if (t) { t.kind = 'eat'; return; } }
    if (v.energy < 15 && (!cur || cur.pri < 1.2)) { setTask(v, { type: 'sleep', pri: 1.2, kind: 'sleep' }); return; }
    if (S.weather.storm > 0 && S.weather.rain > 0.3 && (!cur || cur.pri < 1.05)) { const h = S.buildings.get(v.home); if (h && h.built) { setTask(v, { type: 'shelter', pri: 1.05, kind: 'shelter' }); return; } }
    if (cur && cur.type !== 'wander') return;
    const m = S.villagers.get(v.mother);
    const r = G.R();
    // while the years are skipped nobody sees their games: the children stay put between meals,
    // lessons and errands, and the world runs lighter
    if (G.Skip && G.Skip.on && r >= 0.4) { setTask(v, { type: 'idle', pri: 0.1, wait: 5 + G.R() * 5, kind: 'play' }); return; }
    if (G.isEvening() && G.Life && r < 0.7) { const t = G.Life.familyTask(v, H); if (t) { t.kind = 'family'; return; } }
    if (v.age < 7 && m && !m.inside && !m.sleeping && m.set === v.set && r < 0.5) { setTask(v, { type: 'follow', id: m.id, pri: 0.2, kind: 'follow' }); return; }
    // from nine on, a child often goes along to learn a parent's trade
    if (v.age >= 9 && G.Life && !G.isEvening() && r < 0.4) { const t = G.Life.apprenticeTask(v, H); if (t) return; }
    if (v.age >= 10 && r < 0.22) { const t = gatherTask(v); if (t) { t.kind = 'help'; return; } }
    setTask(v, { type: 'play', pri: 0.1, kind: 'play' });
  }

  // ------------------------------ task factories ------------------------------
  function eatTask(v) {
    const S = G.S;
    if (v.carry && v.carry.k === 'food') { // eat what you carry
      v.carry.n -= 1; v.hunger = Math.max(0, v.hunger - 55); if (v.carry.n <= 0) v.carry = null; emote(v, 'food', 1.5); return setTask(v, { type: 'idle', pri: 0, wait: 1 });
    }
    if (((G.Army && G.Army.larder(v)) || G.Fac.stockV(v)).food >= 1) return setTask(v, { type: 'eat', pri: v.hunger > 85 ? 2.5 : 1.2 });
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
        if (!W.sameLand(v.x, v.y, o.x, o.y)) continue;
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
  function gatherTask(v) { const b = nearestBush(v); if (!b) return null; b.claim = v.id; return setTask(v, { type: 'gather', id: b.id, pri: 1 }); }
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
    const spot = nearestInGrid(v, 16, i => {
      if (Vg.fishSpots.has(i)) return null;
      if (!W.walkable(i) || S.type[i] === T.RIVER || S.type[i] < T.SAND) return null;
      const x = i % N, y = (i / N) | 0;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        if (S.type[ny * N + nx] <= T.RIVER) return { x: x + 0.5 + dx * 0.3, y: y + 0.5 + dy * 0.3, i, wx: dx, wy: dy };
      }
      return null;
    });
    if (!spot) return null;
    Vg.fishSpots.set(spot.i, v.id);
    return setTask(v, { type: 'fish', spot: spot.i, x: spot.x, y: spot.y, wx: spot.wx, wy: spot.wy, pri: 1 });
  }
  function huntTask(v, maxD) {
    const S = G.S; const set = S.settlements.get(v.set);
    let best = null, bd = 1e9;
    for (const a of S.animals.values()) {
      if (a.dead || !G.Animals.huntable(a)) continue;
      if (a.claim && a.claim !== v.id && S.villagers.has(a.claim)) continue;
      if (set && G.dist2(a.x, a.y, set.cx, set.cy) > (maxD || 24) * (maxD || 24)) continue;
      if (!W.sameLand(v.x, v.y, a.x, a.y)) continue;
      const d = G.dist2(v.x, v.y, a.x, a.y); if (d < bd) { bd = d; best = a; }
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
      const canWork = b.progress < allowedProgress(b) - 0.001;
      const carryFits = v.carry && b.need[v.carry.k] > 0;
      if (!needMat && !canWork && !carryFits) continue;
      let builders = 0; for (const o of S.villagers.values()) if (o.task && o.task.type === 'build' && o.task.id === b.id) builders++;
      const [cx, cy] = G.Village.center(b);
      const d = G.dist2(v.x, v.y, cx, cy) + builders * 40 + (b.type === 'campfire' ? -500 : 0) + (b.type === 'hut' || b.type === 'house' ? -30 : 0) + (b.type === 'doca' ? -40 : 0);
      if (d < bd) { bd = d; best = b; }
    }
    if (!best) return null;
    return setTask(v, { type: 'build', id: best.id, pri: 1, st: 0 });
  }
  function allowedProgress(b) {
    const def = G.BDEF[b.type]; const tot = G.Village.totalCost(def);
    if (!tot) return 1;
    let left = 0; for (const k in b.need) left += b.need[k];
    return 1 - left / tot;
  }
  Vg.allowedProgress = allowedProgress;
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
  function preyCount() { const S = G.S; if (preyT !== S.clock) { preyT = S.clock; preyN = 0; for (const a of S.animals.values()) if (!a.dead && G.Animals.huntable(a)) preyN++; } return preyN; }
  function workTask(v) {
    const S = G.S; const fac = G.Fac.ofV(v); if (!fac) return null;
    const st = fac.stock; const capS = G.Village.cap(fac.id);
    if (v.carry && v.carry.k !== 'water') {
      if (v.role === 'construtor') { const t = buildTask(v); if (t) return t; }
      return deliverTask(v);
    }
    const tg = fac.targets || { food: 60, wood: 60, stone: 30 };
    const need = k => st[k] < Math.min(capS - 1, tg[k]);
    let t = null;
    if (v.captive) {
      // forced labour: whatever the masters need most
      t = (G.R() < 0.35 && buildTask(v)) || (need('stone') && mineTask(v)) || (need('wood') && chopTask(v)) || farmTask(v) || (need('food') && gatherTask(v)) || chopTask(v);
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
      case 'coletor': t = need('food') ? (gatherTask(v) || (G.R() < 0.7 ? fishTask(v) : (preyCount() > 8 && huntTask(v, 14))) || fishTask(v)) : (need('wood') && chopTask(v)); break;
      case 'agricultor': t = farmTask(v) || (need('food') && gatherTask(v)); break;
      case 'construtor': t = buildTask(v) || (G.City && G.City.paveTask(v, H)) || (need('wood') && chopTask(v)) || (need('stone') && mineTask(v)); break;
      case 'mineiro': t = (need('stone') && mineTask(v)) || (need('wood') && chopTask(v)); break;
      case 'cacador': t = ((need('food') || G.R() < 0.2) && preyCount() > 6 && huntTask(v)) || setTask(v, { type: 'patrol', pri: 1 }); break;
      case 'sacerdote': t = setTask(v, { type: 'pray', pri: 1, priest: true }); break;
      case 'anciao': t = G.R() < 0.35 && need('food') ? gatherTask(v) : setTask(v, { type: 'rest', pri: 0.5, stories: true }); break;
      default: t = gatherTask(v) || chopTask(v);
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
        if (t.st === 0) {
          const d = G.Village.nearestDropoff(v.x, v.y, v.set);
          if (!d) return end(v);
          t.drop = d.id; const [fx, fy] = G.Village.frontTile(d);
          if (!Vg.goto(v, fx, fy, true)) return end(v);
          t.st = 1;
        } else if (move(v, dt)) {
          // years of plenty: the quarries and the woods give twice what they cost
          const n = v.carry.n * (S.blessed && (v.carry.k === 'stone' || v.carry.k === 'wood') ? 2 : 1);
          const add = G.Village.addStock(v.carry.k, n, G.Fac.idOfV(v));
          v.st[v.carry.k] = (v.st[v.carry.k] || 0) + v.carry.n;
          if (add > 0) G.FX && G.FX.deposit(v.x, v.y, v.carry.k, add);
          v.carry = null; end(v);
        }
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
              const n = Math.min(cap(v), b.berries); b.berries -= n; v.carry = { k: 'food', n }; b.claim = 0;
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
        else if (t.st === 1) { if (move(v, dt)) { t.st = 2; v.actT = 0; t.dur = G.rr(5, 9) / workMul(v); } }
        else {
          v.act = 'fish'; G.faceTo(v, t.wx, t.wy);
          if (v.actT > t.dur) {
            if (G.R() < 0.8 * Math.min(1.2, G.Civ.tV(v, 'fish'))) { v.carry = { k: 'food', n: Math.min(cap(v), Math.round(G.ri(1, 3) * G.Civ.tV(v, 'fish'))) }; emote(v, 'fish', 1.8); G.FX && G.FX.splash(t.x + t.wx * 0.8, t.y + t.wy * 0.8, 0.5); deliverTask(v); }
            else { v.actT = 0; t.dur = G.rr(4, 7); }
          }
        }
        break;
      }
      case 'hunt': case 'fight': {
        const a = S.animals.get(t.id);
        if (!a || a.held) return end(v);
        if (a.dead) {
          if (t.type === 'fight') { emote(v, 'happy', 2); return end(v); }
          // collect the meat
          if (G.dist(v.x, v.y, a.x, a.y) > 0.8) { if (!t.carc) { if (!Vg.goto(v, a.x, a.y, false)) return end(v); t.carc = true; } move(v, dt); }
          else { const take = Math.min(8, Math.max(1, a.meat)); v.carry = { k: 'food', n: Math.max(1, Math.round(take * G.Civ.tV(v, 'hunt'))) }; a.meat -= take; if (a.meat <= 0.5) G.Animals.remove(a); else a.claim = 0; emote(v, 'food', 1.5); deliverTask(v); }
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
              if (v.carry && v.carry.k === 'food') v.carry.n += y; else v.carry = { k: 'food', n: y };
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
          const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) return end(v);
          const [fx, fy] = G.Village.frontTile(d);
          if (!Vg.goto(v, fx, fy, true)) return end(v); t.st = 1;
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
                if (S.villagers.size < 35 || G.UI.selected === v || G.UI.selected === o) G.Village.log(`${a.name} e ${b.name} formaram um casal.`, 'heart', v.x, v.y);
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
        v.act = 'talk'; v.path = null; G.faceTo(v, o.x - v.x, o.y - v.y);
        if (v.actT > 1.4 && (!v.emo || v.emo.t < 0.2)) emote(v, t.court ? 'heart' : 'chat', 1.2);
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
        if (!m || m.inside || m.sleeping || t.age > 20) return end(v);
        if (G.dist(v.x, v.y, m.x, m.y) > 1.8) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || arrived(v)) { t.rt = 1; const a = G.R() * 6.28; Vg.goto(v, m.x + Math.cos(a) * 0.7, m.y + Math.sin(a) * 0.7, false); } move(v, dt, 1.1); }
        else v.act = '';
        break;
      }
      case 'migrate': {
        const set = S.settlements.get(v.set); if (!set) return end(v);
        if (t.st === 0) {
          if (!Vg.goto(v, set.cx + G.rr(-1.5, 1.5), set.cy + G.rr(-1.5, 1.5), true, N * N)) {
            // no way there: settle with the nearest village of the same people instead
            let best = null, bd = 1e9;
            for (const o of S.settlements.values()) if (o.fac === set.fac && o !== set) { const d = G.dist2(v.x, v.y, o.cx, o.cy); if (d < bd) { bd = d; best = o; } }
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
        const tgt = t.to || (t.to = W.nearestLand(v.x, v.y, 30));
        if (!tgt) return end(v);
        const dx = tgt[0] - v.x, dy = tgt[1] - v.y; const d = Math.hypot(dx, dy);
        const sp = 0.7 * dt;
        if (d < sp + 0.05) { v.x = tgt[0]; v.y = tgt[1]; end(v); }
        else { v.x += dx / d * sp; v.y += dy / d * sp; G.faceTo(v, dx, dy); v.walkPh += sp * 6; }
        v.energy -= dt * 3;
        if (v.energy <= 0) Vg.damage(v, dt * 6, 'drown', true);
        if (G.R() < dt * 2) G.FX && G.FX.splash(v.x, v.y, 0.25);
        break;
      }
      default: if (!(G.Caves && G.Caves.run(v, t, dt, H)) && !G.War.run(v, t, dt, H) && !(G.City && G.City.run(v, t, dt, H)) && !(G.Naval && G.Naval.run(v, t, dt, H)) && !(G.Eco && G.Eco.run(v, t, dt, H)) && !(G.Army && G.Army.run(v, t, dt, H)) && !(G.Fest && G.Fest.run(v, t, dt, H)) && !(G.Life && G.Life.run(v, t, dt, H)) && !(G.Carnage && G.Carnage.run(v, t, dt, H))) end(v);
    }
  }
  const LONG = { caverna: 1, corpse: 1, water: 1, sleep: 1, migrate: 1, swim: 1, pray: 1, band: 1, escorted: 1, condemned: 1, envoy: 1, trade: 1, escape: 1, hide: 1, assembly: 1, escort: 1, combat: 1, pave: 1, sail: 1, siege: 1, sacrifice: 1, herd: 1, taxes: 1, army: 1, fest: 1, slaughter: 1 };

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
      if (b.progress < allowedProgress(b) - 0.001) { if (!gotoB(v, b, 0.3)) return end(v); t.st = 3; return; }
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
      t.st = b.progress < allowedProgress(b) - 0.001 ? 4 : 0;
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
    if (S.weather.fertility > 0) chance *= 2;
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
      const i = nearestFire(); if (i < 0) { v.carry = null; return end(v); }
      t.target = i; const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
      if (!Vg.goto(v, x, y, true)) { v.carry = null; return end(v); }
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
    if (S.type[i] <= T.SEA || (S.type[i] === T.RIVER)) {
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
  const unfitCarrier = c => !c || c.dead || c.captive || c.role === 'guerreiro' || (c.task && (ROUGH[c.task.type] || c.task.kind === 'band' || (c.task.type === 'caverna' && c.task.kind === 'raid'))) || c.fury > 0;
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
  Vg.nightWatch = new Map();
  Vg.workshopFac = new Set();
  const roster = [];
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
        if (v.inside || v.air || v.held || v.age < 2 || v.aboard || (v.task && v.task.perch)) continue;
        const i = W.idx(v.x, v.y);
        if (!W.walkable(i) && S.type[i] !== T.SEA && S.type[i] !== T.DEEP) {
          const n = W.nearestLand(v.x, v.y, 5); if (n) { v.x = n[0]; v.y = n[1]; v.path = null; if (v.task) v.task.st = 0; }
        } else if (S.type[i] <= T.SEA && (!v.task || v.task.type !== 'swim')) { setTask(v, { type: 'swim', pri: 6 }); }
      }
    }
    // (a list of its own: people die and are born while the loop runs)
    roster.length = 0; for (const v of S.villagers.values()) roster.push(v);
    for (let k = 0; k < roster.length; k++) {
      const v = roster[k];
      if (v.held) continue;
      if (v.air) { G.airUpdate(v, dt, imp => land(v, imp)); continue; }
      // at sea: only the body's needs go on (provisions come from the stores)
      if (v.aboard) {
        if (!G.Naval || !G.Naval.aboard(v.aboard)) { v.aboard = 0; v.task = null; const p = W.nearestLand(v.x, v.y, 8); if (p) { v.x = p[0]; v.y = p[1]; } }
        else { if (!v.task || v.task.type !== 'aboard') v.task = { type: 'aboard', ship: v.aboard, pri: 9, st: 0, age: 0 }; needs(v, dt); v.moving = false; if (v.emo) { v.emo.t -= dt; if (v.emo.t <= 0) v.emo = null; } continue; }
      }
      needs(v, dt);
      if (!S.villagers.has(v.id)) continue;
      // nobody stays up in the air once the ladder or the pyramid steps are behind them
      if (v.z && !v.air && !(v.task && (v.task.perch || v.task.ladder || v.task.type === 'fest'))) v.z = 0;
      if (v.age < 2) { babyUpdate(v, dt); if (v.emo) { v.emo.t -= dt; if (v.emo.t <= 0) v.emo = null; } continue; }
      v.scan -= dt;
      if (v.scan <= 0) { v.scan = 0.3 + G.R() * 0.15; emergency(v); }
      v.think -= dt;
      if (!v.task || v.think <= 0) { v.think = 1.4 + G.R() * 1.6; decide(v); }
      if (v.task) runTask(v, dt); else v.moving = false;
      if (!v.task || !v.path || v.pi >= v.path.length) v.moving = false;
      if (v.emo) { v.emo.t -= dt; if (v.emo.t <= 0) v.emo = null; }
      if (v.preg > 0 && G.R() < dt * 0.02) emote(v, 'heart', 1.5);
    }
  };
  Vg.hasWell = function (setId) { for (const b of G.S.buildings.values()) if (b.type === 'well' && b.built && b.set === setId) return true; return false; };

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
    const wt = (G.Caves && G.Caves.taskText(v, t)) || (G.Army && G.Army.taskText(v, t)) || G.War.taskText(v, t) || (G.City && G.City.taskText(v, t)) || (G.Naval && G.Naval.taskText(v, t)) || (G.Eco && G.Eco.taskText(v, t)) || (G.Army && G.Army.taskText(v, t)) || (G.Fest && G.Fest.taskText(v, t)) || (G.Life && G.Life.taskText(v, t)) || (G.Carnage && G.Carnage.taskText(v, t)); if (wt) return wt;
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
      case 'flee': return t.why === 'play' ? 'Correndo do eco da caverna, rindo' : t.why === 'meteor' ? 'Fugindo do céu em chamas!' : t.why === 'fire' ? 'Fugindo do incêndio!' : t.why === 'wolf' ? 'Fugindo de uma fera!' : t.why === 'war' ? 'Fugindo dos invasores!' : 'Correndo em pânico!';
      case 'fire': return t.st === 2 ? 'Enchendo o balde' : t.beat ? 'Abafando as chamas' : 'Combatendo o incêndio!';
      case 'social': return `Conversando com ${pname(t.id)}`;
      case 'talk': return t.court ? `Flertando com ${pname(t.id)}` : `Conversando com ${pname(t.id)}`;
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
