'use strict';
// ============================================================
//  Save / Load (localStorage)
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const KEY = 'gotaf-save-v1';
  const Sv = G.Save = {};
  const r = (v, d) => { const m = Math.pow(10, d || 0); return Math.round(v * m) / m; };
  const arr = (a, d) => Array.from(a, v => r(v, d));
  // compact encodings for the per-tile arrays (big maps would not fit in localStorage otherwise)
  // z: zero runs -> negative counts (arrays of values >= 0, mostly zero)
  const zr = (a, m) => { const o = []; let z = 0; for (let k = 0; k < a.length; k++) { const v = Math.round(a[k] * m); if (v <= 0) { z++; continue; } if (z) { o.push(-z); z = 0; } o.push(v); } if (z) o.push(-z); return { z: o, m }; };
  // e: plain run-length pairs (tile types)
  const rl = a => { const o = []; let v = a[0], n = 0; for (let k = 0; k < a.length; k++) { if (a[k] === v) n++; else { o.push(v, n); v = a[k]; n = 1; } } o.push(v, n); return { e: o }; };
  // d: fixed-point deltas (smooth heights)
  const dl = (a, m) => { const o = new Array(a.length); let p = 0; for (let k = 0; k < a.length; k++) { const v = Math.round(a[k] * m); o[k] = v - p; p = v; } return { d: o, m }; };
  function setArr(into, o) {
    if (!o) return;
    if (Array.isArray(o)) { into.set(o); return; }
    if (o.z) { let p = 0; const m = o.m || 1; for (const v of o.z) { if (v < 0) { into.fill(0, p, p - v); p -= v; } else into[p++] = v / m; } }
    else if (o.e) { let p = 0; for (let k = 0; k < o.e.length; k += 2) { into.fill(o.e[k], p, p + o.e[k + 1]); p += o.e[k + 1]; } }
    else if (o.d) { let v = 0; const m = o.m || 1; for (let k = 0; k < o.d.length; k++) { v += o.d[k]; into[k] = v / m; } }
  }
  Sv.setArr = setArr;

  Sv.has = function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } };
  Sv.info = function () {
    try { const s = localStorage.getItem(KEY); if (!s) return null; const o = JSON.parse(s); return { day: o.day, pop: o.villagers.length, era: o.era, when: o.savedAt }; } catch (e) { return null; }
  };
  Sv.serialize = function () {
    const S = G.S;
    const vill = [...S.villagers.values()].map(v => {
      const o = Object.assign({}, v);
      delete o.path; delete o.task; delete o.emo; delete o.babyOn; delete o.torch; delete o._fc;
      o.coup = 0; o.rebel = 0; o.revolt = 0;
      o.pi = 0; o.moving = false; o.held = false;
      if (o.air) { o.air = false; o.z = 0; o.vz = 0; o.vx = 0; o.vy = 0; }
      if (o.inside) { const b = S.buildings.get(o.inside); if (b) { const d = G.Vg.door(b); o.x = d[0]; o.y = d[1]; } o.inside = 0; o.sleeping = false; }
      o.x = r(o.x, 2); o.y = r(o.y, 2); o.hunger = r(o.hunger, 1); o.energy = r(o.energy, 1); o.hp = r(o.hp, 1); o.age = r(o.age, 3);
      o.devotion = r(o.devotion, 1); o.fear = r(o.fear, 1);
      return o;
    });
    const out = {
      v: S.v, seed: S.seed, day: S.day, time: r(S.time, 4), clock: r(S.clock, 1), savedAt: Date.now(),
      H: dl(S.H, 100), type: rl(S.type), fert: zr(S.fert, 100), wear: zr(S.wear, 1), burnt: zr(S.burnt, 1), scar: zr(S.scar, 1),
      wet: zr(S.wet, 100), fire: zr(S.fire, 100), fireT: zr(S.fireT, 1), bloom: zr(S.bloom, 1),
      wl: zr(Float32Array.from(S.wl, v => v - G.SEA), 100), relief: S.relief,
      nextId: S.nextId,
      trees: [...S.trees.values()].map(t => [t.id, r(t.x, 2), r(t.y, 2), t.kind, r(t.size, 2), r(t.maxSize, 2), t.stage === 'fall' ? 'log' : t.stage, t.wood, t.v, r(t.t, 0), t.fallDir, t.burntLog ? 1 : 0, r(t.chop, 1)]),
      rocks: [...S.rocks.values()].map(o => [o.id, r(o.x, 2), r(o.y, 2), o.stone, o.max, o.v, o.meteor ? 1 : 0]),
      bushes: [...S.bushes.values()].map(o => [o.id, r(o.x, 2), r(o.y, 2), o.berries, r(o.grow, 2), o.v, r(o.burnt, 0)]),
      buildings: [...S.buildings.values()].map(b => { const o = Object.assign({}, b); delete o.res; if (o.crops) o.crops = o.crops.map(c => ({ s: c.s, g: r(c.g, 3), c: 0 })); o.incoming = { wood: 0, stone: 0 }; return o; }),
      villagers: vill,
      dead: [...S.dead.values()],
      animals: [...S.animals.values()].map(a => ({ id: a.id, kind: a.kind, x: r(a.x, 2), y: r(a.y, 2), z: r(a.z || 0, 0), age: r(a.age || 0, 2), grown: r(a.grown === undefined ? 1 : a.grown, 2), hunger: r(a.hunger || 0, 2), named: a.named, kills: a.kills, sink: a.sink, hp: r(a.hp, 1), maxHp: a.maxHp, dead: a.dead, meat: r(a.meat, 1), rot: r(a.rot, 0), leader: a.leader, leaveT: r(a.leaveT, 0), summoned: a.summoned, raid: a.raid, sated: r(a.sated || 0, 0), angry: 0, hx: r(a.hx, 1), hy: r(a.hy, 1), lifeMul: r(a.lifeMul || 1, 2), tamed: a.tamed || 0, guardSet: a.guardSet || 0, legend: a.legend || false, big: a.big || 1, epithet: a.epithet || null, mig: a.mig || false })),
      settlements: [...S.settlements.values()],
      N: S.N || N, mapType: S.mapType, temper: S.temper || 'normal', divinePeace: S.divinePeace || 0,
      factions: [...S.factions.values()].map(f => { const o = Object.assign({}, f); o.rel = {}; for (const k in f.rel) if (+k > f.id) o.rel[k] = Object.assign({}, f.rel[k], { envoy: 0 }); o.targets = null; o.coup = null; o.rev = null; o.revolt = null; o.exec = null; return o; }), usedNames: S.usedNames || [], starts: S.starts,
      faith: r(S.faith, 2), stats: S.stats, history: S.history, milestones: S.milestones,
      weather: S.weather, clouds: S.clouds, zones: S.zones, boats: S.boats, awareness: S.awareness, era: S.era,
      pendingDiscovery: S.pendingDiscovery || null, prayer: S.prayer || null, prayerCD: S.prayerCD || 0, popHist: S.popHist || [], start: S.start,
      cam: { x: r(G.Render.cam.x, 1), y: r(G.Render.cam.y, 1), zoom: r(G.Render.cam.zoom, 2), view: G.Render.rot() },
    };
    // cities, fleets, lore... each module saves its own state
    for (const h of G.saveHooks || []) h.save(out, r, arr);
    return JSON.stringify(out);
  };
  Sv.save = function (silent) {
    if (!G.S) return false;
    try {
      localStorage.setItem(KEY, Sv.serialize());
      if (!silent) G.UI && G.UI.notice('Mundo salvo.', 'save');
      return true;
    } catch (e) {
      console.warn('save failed', e);
      if (!silent) G.UI && G.UI.notice('Não foi possível salvar (armazenamento cheio?).', 'skull');
      return false;
    }
  };
  Sv.load = function () {
    let o;
    try { const s = localStorage.getItem(KEY); if (!s) return false; o = JSON.parse(s); } catch (e) { console.warn('load failed', e); return false; }
    try { Sv.apply(o); return true; } catch (e) { console.error('corrupt save', e); return false; }
  };
  Sv.apply = function (o) {
    G.setMapSize(o.N || 64);
    const S = G.newState(o.seed);
    S.N = o.N || 64; S.mapType = o.mapType || 'ilha'; S.usedNames = o.usedNames || []; S.starts = o.starts || [o.start]; S.temper = o.temper || 'normal'; S.divinePeace = o.divinePeace || 0;
    G.S = S;
    S.day = o.day; S.time = o.time; S.clock = o.clock; S.nextId = o.nextId;
    setArr(S.H, o.H); setArr(S.type, o.type); setArr(S.fert, o.fert); setArr(S.wear, o.wear); setArr(S.burnt, o.burnt); setArr(S.scar, o.scar);
    setArr(S.wet, o.wet); setArr(S.fire, o.fire); setArr(S.fireT, o.fireT); setArr(S.bloom, o.bloom);
    if (o.wl) { setArr(S.wl, o.wl); for (let i = 0; i < S.wl.length; i++) S.wl[i] += G.SEA; }
    if (o.relief) S.relief = Object.assign(S.relief, o.relief);
    G.Relief.cliffs(S);
    for (const a of o.trees) {
      const t = { id: a[0], x: a[1], y: a[2], kind: a[3], size: a[4], maxSize: a[5], stage: a[6], wood: a[7], v: a[8], t: a[9], fallDir: a[10], burntLog: !!a[11], chop: a[12] || 0, claim: 0, ph: Math.random() * 6.28, fallT: 1 };
      S.trees.set(t.id, t); S.treeAt[W.idx(t.x, t.y)] = t.id;
    }
    for (const a of o.rocks) { const k = { id: a[0], x: a[1], y: a[2], stone: a[3], max: a[4], v: a[5], meteor: !!a[6], claim: 0 }; S.rocks.set(k.id, k); S.objAt[W.idx(k.x, k.y)] = k.id; }
    for (const a of o.bushes) { const k = { id: a[0], x: a[1], y: a[2], berries: a[3], grow: a[4], v: a[5], burnt: a[6], max: 5, claim: 0 }; S.bushes.set(k.id, k); S.objAt[W.idx(k.x, k.y)] = k.id; }
    for (const b of o.buildings) {
      S.buildings.set(b.id, b);
      for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) S.occ[ty * N + tx] = b.id;
    }
    for (const v of o.villagers) { v.path = null; v.task = null; v.emo = null; v.think = Math.random(); v.scan = Math.random() * 0.3; S.villagers.set(v.id, v); }
    for (const d of o.dead) S.dead.set(d.id, d);
    for (const a of o.animals) {
      const x = G.Animals.spawn(a.kind, a.x, a.y, a); S.animals.delete(x.id); x.id = a.id; S.animals.set(a.id, x);
    }
    for (const s of o.settlements) S.settlements.set(s.id, s);
    if (o.factions && o.factions.length) {
      for (const f of o.factions) S.factions.set(f.id, f);
      // relations are shared objects between both peoples: relink them
      for (const f of S.factions.values()) for (const k in f.rel) { const g = S.factions.get(+k); if (g) g.rel[f.id] = f.rel[k]; }
    } else {
      // save from before kingdoms existed: everyone belongs to one people
      const f = G.Fac.create({ stock: o.stock, ci: 0 });
      for (const s of S.settlements.values()) { s.fac = f.id; if (!f.capital) f.capital = s.id; s.loyalty = 60; s.emptyT = 0; }
    }
    S.faith = o.faith; S.stats = Object.assign(S.stats, o.stats); S.history = o.history; S.milestones = o.milestones;
    S.weather = Object.assign(S.weather, o.weather); S.clouds = o.clouds || []; S.zones = o.zones || []; S.boats = o.boats || [];
    S.awareness = o.awareness; S.era = o.era; S.pendingDiscovery = o.pendingDiscovery; S.prayer = o.prayer || null; S.prayerCD = o.prayerCD || 0; S.popHist = o.popHist || []; S.start = o.start;
    Sv.computeDistances();
    G.Nature.rebuildFire();
    G.Render.setView((o.cam && o.cam.view) || 0);
    G.Render.buildTerrain(); G.Render.initSky();
    if (o.cam) { G.Render.cam.x = o.cam.x; G.Render.cam.y = o.cam.y; G.Render.cam.zoom = G.Render.cam.tz = o.cam.zoom; }
    for (const f of S.factions.values()) { if (f.civ === undefined) f.civ = null; G.Civ.initTech(f); }
    for (const h of G.saveHooks || []) h.load(o);
    G.Village.forceUpdate();
    G.Politics && G.Politics.afterLoad && G.Politics.afterLoad();
    G.Fac.updateTerritory();
  };
  Sv.computeDistances = function () {
    const S = G.S; const d = new Int32Array(N * N).fill(999); const q = [];
    for (let i = 0; i < N * N; i++) if (S.type[i] <= T.SEA) { d[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) {
      const a = q[h]; const x = a % N, y = (a / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (d[j] > d[a] + 1) { d[j] = d[a] + 1; q.push(j); } }
    }
    G.dOcean = d;
  };
  Sv.clear = function () { try { localStorage.removeItem(KEY); } catch (e) { } };
})(window.G);
