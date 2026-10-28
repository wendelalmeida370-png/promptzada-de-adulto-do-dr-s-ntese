'use strict';
// ============================================================
//  World: state, procedural island, terrain queries, pathfinding
// ============================================================
(function (G) {
  let N = G.N = 64;
  let V = N + 1;
  const SEA = G.SEA = 2.0;
  const T = G.T = { DEEP: 0, SEA: 1, RIVER: 2, SAND: 3, GRASS: 4, MEADOW: 5, ROCKY: 6 };
  // seconds of game time per day (1 day == 1 year of life): long enough for a walk to a far wood, a full
  // day's work and the way home before dark. What happens once a day (meals, sleep, births, ageing,
  // harvests) is measured in days; walking and working in seconds, so a longer day gets more done.
  G.DAY_LEN = 200;
  G.DAY_K = G.DAY_LEN / 100; // (rhythms first tuned for a 100-second day divide by this)
  G.WEAR_MAX = 60;           // footpath wear saturation

  G.newState = function (seed) {
    return {
      v: 4, seed, N, mapType: 'ilha', rng: G.rngSeed(seed, 0),
      day: 1, time: 0.1, clock: 0,
      H: new Float32Array(V * V),
      type: new Uint8Array(N * N),
      fert: new Float32Array(N * N),
      wear: new Float32Array(N * N),
      burnt: new Float32Array(N * N),
      scar: new Float32Array(N * N),
      wet: new Float32Array(N * N),
      fire: new Float32Array(N * N),
      fireT: new Float32Array(N * N),
      occ: new Int32Array(N * N),
      treeAt: new Int32Array(N * N),
      objAt: new Int32Array(N * N),
      bloom: new Float32Array(N * N),
      wl: new Float32Array(N * N).fill(SEA),   // water surface of each tile (mountain rivers and lakes sit high)
      cliff: new Uint8Array(N * N),            // cliff faces nobody can walk
      deep: new Uint8Array(N * N),             // water too deep to wade (middle of lakes, broad rivers)
      slope: new Float32Array(N * N), th: new Float32Array(N * N), // (cached: steepness and height of each tile)
      relief: { ranges: [], passes: [], peaks: [], falls: [], lakes: [] },
      nextId: 1,
      trees: new Map(), rocks: new Map(), bushes: new Map(), buildings: new Map(),
      villagers: new Map(), dead: new Map(), animals: new Map(), graves: new Map(),
      settlements: new Map(), factions: new Map(),
      faith: 60,
      stats: {
        maxPop: 0, births: 0, deaths: 0, godKills: 0, foodProduced: 0, woodProduced: 0, stoneProduced: 0,
        oldest: 0, oldestName: '', built: 0, treesFelled: 0, faithSpent: 0, powers: {}, immigrants: 0, couples: 0,
      },
      history: [],
      milestones: {},
      weather: { kind: 'clear', t: 0, rain: 0, windA: 0.6, windS: 0.3, drought: 0, storm: 0, nextEvent: 3.2 },
      clouds: [],        // divine / natural rain clouds
      meteors: [],       // pending meteors
      zones: [],         // fertility zones, etc
      boats: [],
      awareness: 0,      // has the tribe noticed the god yet?
      era: 0,
      cam: null,
      road: new Uint8Array(N * N),   // 1 dirt path, 2 paved street, 3 stone highway
      wall: new Uint8Array(N * N),   // 1 wall, 2 gate
      wallFac: new Int32Array(N * N),
      carts: [], ships: [], aqueducts: [], routes: [], fish: [], seaRoutes: [], walls: [], wallHp: {}, missiles: [], lore: null,
      biome: new Uint8Array(N * N), temp: null, moist: null, clima: 'variado',
    };
  };

  const W = G.W = {};
  W.idx = (x, y) => (y | 0) * N + (x | 0);
  W.inb = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  W.vh = (vx, vy) => G.S.H[vy * V + vx];
  W.hAt = function (x, y) {
    const H = G.S.H;
    x = G.clamp(x, 0, N - 0.001); y = G.clamp(y, 0, N - 0.001);
    const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi;
    const a = H[yi * V + xi], b = H[yi * V + xi + 1], c = H[(yi + 1) * V + xi], d = H[(yi + 1) * V + xi + 1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
  // the surface under a point: water where there is water (at its own level), ground elsewhere
  W.groundH = (x, y) => {
    const S = G.S; const h = W.hAt(x, y);
    const xi = x < 0 ? 0 : x >= N ? N - 1 : x | 0, yi = y < 0 ? 0 : y >= N ? N - 1 : y | 0; const i = yi * N + xi;
    // (the bed of a parted sea: the ground is the sea floor, down between the walls of water)
    return S.type[i] === T.RIVER ? Math.max(h, S.wl[i]) : S.dry && S.dry[i] ? h : Math.max(h, SEA);
  };
  W.waterH = (x, y) => { const S = G.S; const xi = G.clamp(x | 0, 0, N - 1), yi = G.clamp(y | 0, 0, N - 1); const i = yi * N + xi; return S.type[i] === T.RIVER ? S.wl[i] : S.dry && S.dry[i] ? W.hAt(x, y) : SEA; };
  W.isCliff = i => G.S.cliff[i] === 1;
  W.tileH = i => { // average vertex height of tile
    const x = i % N, y = (i / N) | 0, H = G.S.H;
    return (H[y * V + x] + H[y * V + x + 1] + H[(y + 1) * V + x] + H[(y + 1) * V + x + 1]) * 0.25;
  };
  W.isWater = i => G.S.type[i] <= T.RIVER;
  W.isOcean = i => G.S.type[i] <= T.SEA;
  W.isLand = i => G.S.type[i] >= T.SAND;
  W.blocked = i => { const b = G.S.occ[i]; if (!b) return false; const B = G.S.buildings.get(b); return !!(B && B.blocks); };
  // walls block, open gates (2) and aqueduct arches (3) let people through, shut gates (4) don't
  // the fences of pens, stables, captives' pens and graveyards: an animal crosses them only at the gate
  // (the middle of the pen's lower side); the flock of a pen may always go in and out of its own
  const FENCED = { curral: 1, estabulo: 1, cercado: 1, cemetery: 1 };
  let fenceMap = null, fenceT = -1e9, fenceN = 0;
  G.worldHooks.push(() => { fenceMap = null; fenceT = -1e9; fenceN = 0; }); // (a new world, or a save loaded: it starts over)
  W.fenceMap = function () {
    const S = G.S; if (!S) return null;
    if (!G.inSim && fenceMap && fenceN === N) return fenceMap;
    if (!fenceMap || fenceN !== N || S.clock - fenceT > 2 || S.clock < fenceT) {
      if (!fenceMap || fenceMap.length !== N * N) fenceMap = new Int32Array(N * N); else fenceMap.fill(0);
      fenceN = N; fenceT = S.clock;
      for (const b of S.buildings.values()) { if (!FENCED[b.type] || !b.built) continue; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (x >= 0 && y >= 0 && x < N && y < N) fenceMap[y * N + x] = b.id; }
    }
    return fenceMap;
  };
  W.fenceBlocks = function (a, x0, y0, x1, y1) {
    const F = W.fenceMap(); if (!F) return false;
    const i0 = W.idx(x0, y0), i1 = W.idx(x1, y1); const f0 = F[i0], f1 = F[i1];
    if (f0 === f1) return false;
    for (const f of [f0, f1]) {
      // one that found itself shut in someone else's pen may always get out; going in is at the gate
      if (!f || (a && a.pen === f) || (f === f0 && f0 !== f1 && !(a && a.pen))) continue;
      const b = G.S.buildings.get(f); if (!b) continue;
      const gx = b.x + b.w / 2, gy = b.y + b.h; const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      if (Math.abs(mx - gx) < 0.55 && Math.abs(my - gy) < 0.45) continue; // through the gate
      return true;
    }
    return false;
  };
  // (a deep river or a lake frozen by the god's Inverno Súbito is ground while the ice holds: S.ice, written only by
  // winter.js; and the bed of a sea the god parted is ground while the waters stand aside: S.dry, written only by
  // seapart.js — each tells the maps every time)
  W.walkable = i => { const S = G.S; const t = S.type[i]; if ((t < T.RIVER && !(S.dry && S.dry[i])) || S.cliff[i] || W.blocked(i)) return false; if (t === T.RIVER && S.deep[i] && !S.road[i] && !(S.ice && S.ice[i])) return false; const w = S.wall[i]; return !w || w === 2 || w === 3; };
  // where one can lie down or stand around: walkable and out of the water
  W.dryXY = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return G.S.type[i] >= T.SAND && W.walkable(i); };
  W.walkableXY = (x, y) => W.inb(x, y) && W.walkable(W.idx(x, y));
  // landmass labels: who can walk to whom (4-connected land, rivers included)
  let landIds = null, landKey = null, landVer = -1;
  W.invalidateLand = () => { landIds = null; W.invalidateReach && W.invalidateReach(); };
  W.landIds = function () {
    const S = G.S;
    if (landIds && landKey === S && landVer === (S.typeVer || 0) && landIds.length === N * N) return landIds;
    landIds = new Int32Array(N * N).fill(-1); landKey = S; landVer = S.typeVer || 0;
    let id = 0;
    for (let i = 0; i < N * N; i++) {
      if (landIds[i] >= 0 || (S.type[i] < T.RIVER && !(S.dry && S.dry[i])) || S.cliff[i] || (S.deep[i] && !S.road[i] && !(S.ice && S.ice[i]))) continue;
      const st = [i]; landIds[i] = id;
      while (st.length) {
        const a = st.pop(); const x = a % N, y = (a / N) | 0;
        const ok = j => landIds[j] < 0 && (S.type[j] >= T.RIVER || (S.dry && S.dry[j])) && !S.cliff[j] && !(S.deep[j] && !S.road[j] && !(S.ice && S.ice[j]));
        if (x > 0 && ok(a - 1)) { landIds[a - 1] = id; st.push(a - 1); }
        if (x < N - 1 && ok(a + 1)) { landIds[a + 1] = id; st.push(a + 1); }
        if (y > 0 && ok(a - N)) { landIds[a - N] = id; st.push(a - N); }
        if (y < N - 1 && ok(a + N)) { landIds[a + N] = id; st.push(a + N); }
      }
      id++;
    }
    return landIds;
  };
  W.landAt = (x, y) => W.inb(x, y) ? W.landIds()[W.idx(x, y)] : -1;
  W.sameLand = (ax, ay, bx, by) => { const L = W.landIds(); const a = L[W.idx(ax, ay)], b = L[W.idx(bx, by)]; return a < 0 || b < 0 || a === b; };

  // ---- where one can walk to. The walkable tiles joined side by side: findPath walks exactly this graph (a diagonal step
  // needs both sides open, so it joins nothing the sides do not), so two places in different regions never have a path.
  // A closed gate counts as open here (it opens again; findPath itself still finds it shut), so the map never says "no way"
  // where there is one. Rebuilt when the ground, a building or a wall changes, and every 20 s of game time all the same.
  let reachIds = null, reachStack = null, reachKey = null, reachWV = -1, reachTV = -1, reachT = -1e9;
  W.reachBuilds = 0;
  W.touchWalk = () => { const S = G.S; if (S) S.walkVer = (S.walkVer || 0) + 1; };
  // (the ground one could walk, whatever wall stands on it — the wall planner asks it of the tiles of its plan —; and that
  // ground with the wall: walls block, gates and aqueduct arches let through)
  const ground = W.ground = i => { const S = G.S; const t = S.type[i]; if ((t < T.RIVER && !(S.dry && S.dry[i])) || S.cliff[i] || W.blocked(i)) return false; if (t === T.RIVER && S.deep[i] && !S.road[i] && !(S.ice && S.ice[i])) return false; return true; };
  W.wallOpen = w => !w || w === 2 || w === 3 || w === 4;
  const passable = i => ground(i) && W.wallOpen(G.S.wall[i]);
  W.reachIds = function (peek) {
    const S = G.S; const n = N * N;
    if (reachIds && reachKey === S && reachWV === (S.walkVer || 0) && reachTV === (S.typeVer || 0) && reachIds.length === n && (peek || (S.clock >= reachT && S.clock - reachT < 20))) return reachIds;
    if (!reachIds || reachIds.length !== n) { reachIds = new Int32Array(n); reachStack = new Int32Array(n); }
    reachKey = S; reachWV = S.walkVer || 0; reachTV = S.typeVer || 0; reachT = S.clock; W.reachBuilds++;
    const L = reachIds, st = reachStack; L.fill(-1); let id = 0;
    for (let i = 0; i < n; i++) {
      if (L[i] >= 0 || !passable(i)) continue;
      let sp = 0; st[sp++] = i; L[i] = id;
      while (sp) {
        const a = st[--sp]; const x = a % N;
        if (x > 0 && L[a - 1] < 0 && passable(a - 1)) { L[a - 1] = id; st[sp++] = a - 1; }
        if (x < N - 1 && L[a + 1] < 0 && passable(a + 1)) { L[a + 1] = id; st[sp++] = a + 1; }
        if (a >= N && L[a - N] < 0 && passable(a - N)) { L[a - N] = id; st[sp++] = a - N; }
        if (a + N < n && L[a + N] < 0 && passable(a + N)) { L[a + N] = id; st[sp++] = a + N; }
      }
      id++;
    }
    return L;
  };
  W.invalidateReach = () => { reachIds && (reachWV = -1); };
  // the regions a point can step into: its own, or (standing where one cannot stand) those beside it
  function stepRegs(i, out) {
    const L = W.reachIds(); if (L[i] >= 0) { out.push(L[i]); return out; }
    const x = i % N;
    if (x > 0 && L[i - 1] >= 0) out.push(L[i - 1]); if (x < N - 1 && L[i + 1] >= 0) out.push(L[i + 1]);
    if (i >= N && L[i - N] >= 0) out.push(L[i - N]); if (i + N < N * N && L[i + N] >= 0) out.push(L[i + N]);
    return out;
  }
  // the regions that reach (tx, ty), or the tiles around it (adj)
  function goalRegs(t, adj, out) {
    const L = W.reachIds(); if (!adj) { if (L[t] >= 0) out.push(L[t]); return out; }
    const tx = t % N, ty = (t / N) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = tx + dx, y = ty + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const r = L[y * N + x]; if (r >= 0 && !out.includes(r)) out.push(r); }
    return out;
  }
  const meet = (a, b) => { for (const r of a) if (b.includes(r)) return true; return false; };
  // can someone at (sx, sy) walk to (tx, ty), or beside it (adj, the default): the answer findPath gives with no node limit
  W.canWalk = function (sx, sy, tx, ty, adj) {
    if (!W.inb(sx, sy) || !W.inb(tx, ty)) return false;
    if (adj === undefined) adj = true;
    const s = W.idx(sx, sy), t = W.idx(tx, ty);
    if (!adj && !W.walkable(t)) adj = true;
    if (adj ? (Math.max(Math.abs(s % N - t % N), Math.abs(((s / N) | 0) - ((t / N) | 0))) <= 1 && (s !== t || W.walkable(s))) : s === t) return true;
    return meet(stepRegs(s, []), goalRegs(t, adj, []));
  };
  // the main streets of a town: the largest region among the walkable tiles around its centre (its centre itself can be a palace,
  // or a yard boxed in by its own houses)
  // — unless its homes say otherwise: a town the god cut in two lives on the side where most of its houses open (L-089)
  const townReg = new Map(); let townAt = -1, townHomes = null;
  function homesByRegion() {
    const S = G.S; const L = W.reachIds(); const out = new Map();
    for (const b of S.buildings.values()) {
      if (!b.built || !b.set) continue; const d = G.BDEF[b.type]; if (!d || !d.housing) continue;
      const p = G.Vg && G.Vg.door(b); if (!p || !W.inb(p[0], p[1])) continue;
      const k = L[W.idx(p[0], p[1])]; if (k < 0) continue;
      let m = out.get(b.set); if (!m) out.set(b.set, m = new Map()); m.set(k, (m.get(k) || 0) + 1);
    }
    return out;
  }
  W.townRegion = function (set) {
    W.reachIds(); if (townAt !== W.reachBuilds) { townReg.clear(); townHomes = null; townAt = W.reachBuilds; }
    let r = townReg.get(set.id); if (r !== undefined) return r;
    if (!townHomes) townHomes = homesByRegion();
    const hm = townHomes.get(set.id);
    if (hm && hm.size) {
      let a = -1, an = 0, bn = 0; for (const [k, c] of hm) { if (c > an) { bn = an; an = c; a = k; } else if (c > bn) bn = c; }
      if (an > bn) { townReg.set(set.id, a); return a; }
    }
    const L = W.reachIds(); const cnt = new Map(); const R = Math.max(3, Math.min(10, Math.round((set.radius || 6) * 0.6)));
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const x = cx + dx, y = cy + dy; if (!W.inb(x, y)) continue; const k = L[y * N + x]; if (k >= 0) cnt.set(k, (cnt.get(k) || 0) + 1); }
    r = -1; let bn = 0; for (const [k, c] of cnt) if (c > bn) { bn = c; r = k; }
    townReg.set(set.id, r); return r;
  };
  // where a person stands, as regions: inside a building, at the door they come out by — the people's door, Vg.door: the
  // plan's, on the street —, never the middle of its south front, which may give onto other ground (a pocket, a yard, the far
  // side of a cliff: whoever slept there was taken for lost, woken and set down outside — L-217); on no walkable ground, what
  // is within two steps. null when nothing is near at all (the caller then does not judge)
  W.regsOf = function (v) {
    let x = v.x, y = v.y;
    if (v.inside > 0) { const b = G.S.buildings.get(v.inside); if (b) { const d = G.Vg ? G.Vg.door(b) : G.Village.door(b); x = d[0]; y = d[1]; } }
    if (!W.inb(x, y)) return null;
    const i = W.idx(x, y); const out = stepRegs(i, []); if (out.length) return out;
    const L = W.reachIds(); const x0 = i % N, y0 = (i / N) | 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x0 + dx, yy = y0 + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; const r = L[yy * N + xx]; if (r >= 0 && !out.includes(r)) out.push(r); }
    return out.length ? out : null;
  };
  // can this person walk to that town / that place (unknown → yes: the map does not judge what it cannot see)
  W.reachesTown = function (v, set) { if (!set) return false; const r = W.townRegion(set); if (r < 0) return W.sameLand(v.x, v.y, set.cx, set.cy); const a = W.regsOf(v); return !a || a.includes(r); };
  W.reaches = function (v, x, y) { if (!W.inb(x, y)) return false; const a = W.regsOf(v); return !a || meet(a, goalRegs(W.idx(x, y), true, [])); };
  // from a point (no person), and between a town and a place or another town
  W.reachesTownXY = function (x, y, set) { if (!set || !W.inb(x, y)) return false; const r = W.townRegion(set); if (r < 0) return W.sameLand(x, y, set.cx, set.cy); const a = stepRegs(W.idx(x, y), []); return !a.length || a.includes(r); };
  W.townReaches = function (set, x, y) { if (!set || !W.inb(x, y)) return false; const r = W.townRegion(set); if (r < 0) return W.sameLand(set.cx, set.cy, x, y); return goalRegs(W.idx(x, y), true, []).includes(r); };
  W.townsLinked = function (a, b) { if (!a || !b) return false; const ra = W.townRegion(a), rb = W.townRegion(b); if (ra < 0 || rb < 0) return W.sameLand(a.cx, a.cy, b.cx, b.cy); return ra === rb; };
  W.buildable = i => { const t = G.S.type[i]; return t >= T.SAND && !G.S.cliff[i] && !G.S.occ[i] && !G.S.objAt[i] && G.S.fire[i] < 0.05 && !(G.Caves && G.Caves.isMouth(i)); };
  W.slope = (x, y, w, h) => {
    let mn = 1e9, mx = -1e9;
    for (let vy = y; vy <= y + h; vy++) for (let vx = x; vx <= x + w; vx++) {
      const v = G.S.H[vy * V + vx]; if (v < mn) mn = v; if (v > mx) mx = v;
    }
    return mx - mn;
  };
  W.maxH = (x, y, w, h) => {
    let mx = -1e9;
    for (let vy = y; vy <= y + h; vy++) for (let vx = x; vx <= x + w; vx++) mx = Math.max(mx, G.S.H[vy * V + vx]);
    return mx;
  };
  W.minH = (x, y, w, h) => {
    let mn = 1e9;
    for (let vy = y; vy <= y + h; vy++) for (let vx = x; vx <= x + w; vx++) mn = Math.min(mn, G.S.H[vy * V + vx]);
    return mn;
  };
  // (ok, when given: only land where ok(x, y) — the swimmer's, land from which home is reached, not a pocket the sea and the
  // houses close in: L-306)
  W.nearestLand = function (x, y, maxR, ok) {
    maxR = maxR || 20;
    const x0 = x | 0, y0 = y | 0;
    let best = null, bd = 1e9;
    for (let r = 0; r <= maxR && !best; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const tx = x0 + dx, ty = y0 + dy;
        if (!W.inb(tx, ty)) continue;
        const i = W.idx(tx, ty);
        if (W.isLand(i) && W.walkable(i) && (!ok || ok(tx + 0.5, ty + 0.5))) {
          const d = G.dist2(x, y, tx + 0.5, ty + 0.5);
          if (d < bd) { bd = d; best = [tx + 0.5, ty + 0.5]; }
        }
      }
    }
    return best;
  };
  // random walkable land point near (x,y)
  W.randomNear = function (x, y, r, tries) {
    tries = tries || 12;
    for (let k = 0; k < tries; k++) {
      const a = G.R() * Math.PI * 2, d = G.R() * r;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
      if (!W.inb(px, py)) continue;
      const i = W.idx(px, py);
      if (W.walkable(i) && G.S.type[i] !== T.RIVER && G.S.fire[i] < 0.05) return [px, py];
    }
    return null;
  };

  // ------------------------------------------------------------
  // Procedural worlds: island, continent, archipelago, isthmus
  // ------------------------------------------------------------
  G.MAP_TYPES = {
    ilha: { name: 'Ilha', desc: 'Uma ilha única, com rio e lago. Clássico.' },
    continente: { name: 'Continente', desc: 'Uma grande massa de terra com montanhas. Espaço para muitos reinos.' },
    arquipelago: { name: 'Arquipélago', desc: 'Várias ilhas ligadas por vaus rasos. Fronteiras naturais e pontos de passagem.' },
    istmo: { name: 'Istmo', desc: 'Duas terras unidas por uma faixa estreita. Uma fronteira feita para a guerra.' },
    mar: { name: 'Mar Aberto', desc: 'Ilhas separadas pelo mar. Sem navios, nenhum povo encontra o outro.' },
  };
  function landShapeFn(type, rng, n1) {
    const angNoise = (a, s) => G.fbm(n1, Math.cos(a) * 1.4 + s, Math.sin(a) * 1.4 + 7.7 + s, 3);
    if (type === 'continente') {
      const ox = (rng() - 0.5) * 0.06, oy = (rng() - 0.5) * 0.06;
      return (u, w) => {
        u -= ox; w -= oy;
        const d = Math.pow(Math.pow(Math.abs(u), 3) + Math.pow(Math.abs(w), 3), 1 / 3);
        const a = Math.atan2(w, u);
        const sh = Math.min(0.95, 0.86 + 0.2 * angNoise(a, 3.1));
        return 1 - G.smooth(sh * 0.62, sh * 0.99, d);
      };
    }
    if (type === 'arquipelago' || type === 'mar') {
      const sea = type === 'mar';
      const isl = [];
      if (sea) {
        // one home island per people around a ring, and a small free island in the middle
        const homes = Math.max(2, G._genTribes);
        const a0 = rng() * 6.283;
        const ring = homes <= 2 ? 0.5 : homes === 3 ? 0.55 : 0.58;
        const rr = homes <= 2 ? 0.56 : homes === 3 ? 0.54 : 0.46;
        for (let k = 0; k < homes; k++) { const a = a0 + k * 6.283 / homes + (rng() - 0.5) * 0.3; const d = ring * (0.95 + rng() * 0.1); isl.push([Math.cos(a) * d, Math.sin(a) * d, rr * (0.93 + rng() * 0.14), rng() * 10]); }
        isl.push([(rng() - 0.5) * 0.06, (rng() - 0.5) * 0.06, homes <= 2 ? 0.16 : homes === 3 ? 0.19 : 0.22, rng() * 10]);
      } else {
        const K = 4 + Math.floor(rng() * 2) + (G._genTribes >= 3 ? 1 : 0);
        let guard = 0;
        while (isl.length < K && guard++ < 400) {
          const a = rng() * 6.283, r = Math.sqrt(rng()) * 0.62;
          const c = [Math.cos(a) * r, Math.sin(a) * r];
          if (isl.some(o => Math.hypot(o[0] - c[0], o[1] - c[1]) < 0.5)) continue;
          isl.push([c[0], c[1], 0.26 + rng() * 0.12, rng() * 10]);
        }
      }
      return (u, w) => {
        let best = 0;
        for (const [ix, iy, r, s] of isl) {
          const du = u - ix, dw = w - iy; const d = Math.hypot(du, dw); if (d > r * 1.2) continue;
          const sh = 0.85 + 0.25 * angNoise(Math.atan2(dw, du), s);
          best = Math.max(best, 1 - G.smooth(r * sh * 0.4, r * sh, d));
        }
        return best;
      };
    }
    if (type === 'istmo') {
      const tilt = (rng() - 0.5) * 0.3;
      const A = [-0.5, tilt], B = [0.5, -tilt];
      return (u, w) => {
        let best = 0;
        for (const [cx, cy, s] of [[A[0], A[1], 1.3], [B[0], B[1], 5.7]]) {
          const du = u - cx, dw = w - cy; const d = Math.hypot(du, dw);
          const sh = 0.85 + 0.22 * angNoise(Math.atan2(dw, du), s);
          best = Math.max(best, 1 - G.smooth(0.46 * sh * 0.45, 0.46 * sh, d));
        }
        // the narrow land bridge
        const t = G.clamp(((u - A[0]) * (B[0] - A[0]) + (w - A[1]) * (B[1] - A[1])) / ((B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2), 0, 1);
        const px = A[0] + (B[0] - A[0]) * t, py = A[1] + (B[1] - A[1]) * t;
        const wob = G.fbm(n1, t * 4 + 30, 2.2, 2) * 0.05;
        const dc = Math.hypot(u - px, w - py + wob);
        return Math.max(best, 1 - G.smooth(0.03, 0.075, dc));
      };
    }
    // ilha
    const ox = (rng() - 0.5) * 0.1, oy = (rng() - 0.5) * 0.1;
    return (u, w) => {
      u -= ox; w -= oy;
      const d = Math.hypot(u, w); const a = Math.atan2(w, u);
      const sh = Math.min(0.93, 0.83 + 0.24 * angNoise(a, 3.1));
      return 1 - G.smooth(sh * 0.5, sh * 0.97, d);
    };
  }

  G.genWorld = function (seed, opts) {
    opts = opts || {};
    const mapType = G.MAP_TYPES[opts.type] ? opts.type : 'ilha';
    const tribes = G.clamp(opts.tribes || 1, 1, N >= 128 ? 6 : 4);
    G._genTribes = tribes;
    const S = G.newState(seed);
    S.mapType = mapType; S.N = N;
    G.S = S;
    const rng = G.mulberry32(seed);
    const n1 = G.makeNoise(seed), n2 = G.makeNoise(seed + 101), n3 = G.makeNoise(seed + 202), n4 = G.makeNoise(seed + 303);
    const H = S.H;
    const shape = landShapeFn(mapType, rng, n1);
    const cx = N / 2, cy = N / 2;
    // ---- relief: hills, mountain ranges, plateaus, basins; then the rain wears it down ----
    const ro = G.Relief.resolve(opts, rng);
    G.Relief.heights(S, { shape, rng, n2, n3, o: ro, mapType });
    G.Relief.erode(S, G.Relief.preset(ro).erode, rng);

    // ---- classify tiles ----
    const type = S.type;
    const water = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) water[i] = W.tileH(i) < SEA ? 1 : 0;
    const NB4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const ocean = new Uint8Array(N * N);
    const q = [];
    for (let k = 0; k < N; k++) q.push(k, (N - 1) * N + k, k * N, k * N + N - 1);
    for (const i of q) ocean[i] = 1;
    while (q.length) {
      const i = q.pop(); const x = i % N, y = (i / N) | 0;
      for (const [dx, dy] of NB4) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (!ocean[j] && water[j]) { ocean[j] = 1; q.push(j); } }
    }
    const comp = new Int32Array(N * N).fill(-1);
    for (let i = 0; i < N * N; i++) {
      if (water[i] && !ocean[i] && comp[i] < 0) {
        const list = [i]; comp[i] = i; const st = [i];
        while (st.length) {
          const a = st.pop(); const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of NB4) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (water[j] && !ocean[j] && comp[j] < 0) { comp[j] = i; list.push(j); st.push(j); } }
        }
        for (const j of list) water[j] = 0;
      }
    }
    for (let i = 0; i < N * N; i++) type[i] = ocean[i] ? T.SEA : T.GRASS;

    // ---- land components (islands); join them with shallow fords ----
    const landComp = new Int32Array(N * N).fill(-1);
    const compSize = [];
    for (let i = 0; i < N * N; i++) {
      if (type[i] >= T.RIVER && landComp[i] < 0) {
        const id = compSize.length; let size = 0; const st = [i]; landComp[i] = id;
        while (st.length) {
          const a = st.pop(); size++; const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of NB4) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (type[j] >= T.RIVER && landComp[j] < 0) { landComp[j] = id; st.push(j); } }
        }
        compSize.push(size);
      }
    }
    S.fords = 0;
    if (compSize.length > 1 && mapType !== 'mar') {
      let main = 0; for (let k = 1; k < compSize.length; k++) if (compSize[k] > compSize[main]) main = k;
      const joined = new Set([main]);
      const big = compSize.map((s, k) => k).filter(k => compSize[k] >= 24);
      for (let loop = 0; loop < 10 && big.some(k => !joined.has(k)); loop++) {
        // multi-source BFS through the sea from every joined island
        const prev = new Int32Array(N * N).fill(-2);
        const bq = [];
        for (let i = 0; i < N * N; i++) if (landComp[i] >= 0 && joined.has(landComp[i])) { prev[i] = -1; bq.push(i); }
        let hit = -1;
        for (let h = 0; h < bq.length && hit < 0; h++) {
          const a = bq[h]; const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of NB4) {
            const nx = x + dx, ny = y + dy; if (nx < 3 || ny < 3 || nx >= N - 3 || ny >= N - 3) continue;
            const j = ny * N + nx; if (prev[j] !== -2) continue;
            prev[j] = a;
            if (landComp[j] >= 0 && !joined.has(landComp[j]) && compSize[landComp[j]] >= 24) { hit = j; break; }
            if (type[j] <= T.SEA) bq.push(j);
          }
        }
        if (hit < 0) break;
        joined.add(landComp[hit]);
        for (let c = prev[hit]; c >= 0 && prev[c] !== -1; c = prev[c]) {
          if (type[c] <= T.SEA) { type[c] = T.RIVER; S.fords++; }
          const x = c % N, y = (c / N) | 0;
          const side = (x + y) % 2 ? W.idx(x + 1, y) : W.idx(x, y + 1);
          if (W.inb(x + 1, y + 1) && type[side] <= T.SEA) type[side] = T.RIVER;
        }
      }
    }
    // keep only the biggest walkable landmass
    const land = new Int32Array(N * N).fill(-1);
    let bestC = -1, bestSize = 0;
    for (let i = 0; i < N * N; i++) {
      if (type[i] >= T.RIVER && land[i] < 0) {
        let size = 0; const st = [i]; land[i] = i;
        while (st.length) {
          const a = st.pop(); size++; const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of NB4) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (type[j] >= T.RIVER && land[j] < 0) { land[j] = i; st.push(j); } }
        }
        if (size > bestSize) { bestSize = size; bestC = i; }
      }
    }
    // (open sea: every sizeable island stays; the peoples will need ships to meet)
    const sizes = {}; if (mapType === 'mar') for (let i = 0; i < N * N; i++) if (land[i] >= 0) sizes[land[i]] = (sizes[land[i]] || 0) + 1;
    for (let i = 0; i < N * N; i++) if (type[i] >= T.RIVER && (mapType === 'mar' ? sizes[land[i]] < 60 : land[i] !== bestC)) type[i] = T.SEA;

    // ---- cliffs over the sea, rivers from the peaks, lakes in the basins, ways up every plateau ----
    G.Relief.coast(S, ro);
    const hi = ro.relevo === 'montanhoso' || ro.relevo === 'alpino';
    const rivers = mapType === 'mar' ? 0 : mapType === 'arquipelago' ? (hi ? 1 : 0) : (mapType === 'ilha' ? (rng() < 0.85 ? 1 : 0) + (hi && N >= 80 ? 1 : 0) : (N >= 80 ? 2 : 1) + (hi ? 1 : 0)) + (N >= 160 ? 2 : N >= 128 ? 1 : 0);
    G.Relief.hydro(S, { o: ro, rivers });
    G.Relief.normalize(S);
    G.Relief.connect(S);
    G.Relief.findPeaks(S);
    G.Relief.nameAll(S);

    const bfsFrom = (test) => {
      const d = new Int32Array(N * N).fill(999); const bq = [];
      for (let i = 0; i < N * N; i++) if (test(i)) { d[i] = 0; bq.push(i); }
      for (let h = 0; h < bq.length; h++) {
        const a = bq[h]; const x = a % N, y = (a / N) | 0;
        for (const [dx, dy] of NB4) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx; if (d[j] > d[a] + 1) { d[j] = d[a] + 1; bq.push(j); } }
      }
      return d;
    };
    const dOcean = bfsFrom(i => type[i] <= T.SEA);
    G.dOcean = dOcean;
    const dRiver = bfsFrom(i => type[i] === T.RIVER);

    // the highest ~10% of the land becomes rocky highland (stone source)
    const landH = [];
    for (let i = 0; i < N * N; i++) if (type[i] === T.GRASS) landH.push(W.tileH(i));
    landH.sort((a, b) => a - b);
    // (with mountains, only their upper half turns to bare rock: plateaus and foothills stay green)
    const rockTh = Math.max(G.clamp(landH[Math.floor(landH.length * 0.9)] || SEA + 4.3, SEA + 2.4, SEA + 4.3), SEA + ((landH[landH.length - 1] || SEA) - SEA) * 0.55);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const th = W.tileH(i);
      if (type[i] === T.SEA) {
        let nearLand = false;
        for (let dy = -2; dy <= 2 && !nearLand; dy++) for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && type[ny * N + nx] >= T.RIVER) { nearLand = true; break; }
        }
        type[i] = (nearLand || th > SEA - 0.9) ? T.SEA : T.DEEP;
        continue;
      }
      if (type[i] === T.RIVER) { S.fert[i] = 0; continue; }
      const f = G.clamp(0.5 + G.fbm(n4, x * 0.07 + 40, y * 0.07 - 20, 3) * 1.1 + (dRiver[i] < 4 ? (4 - dRiver[i]) * 0.09 : 0) - Math.min(th - SEA, 12) * 0.035, 0, 1);
      S.fert[i] = f;
      const steep = G.Relief.range(i);
      if (dOcean[i] <= 2 && th < SEA + 0.6 && steep < 1) type[i] = T.SAND;
      else if (steep > G.Relief.STEEP || th > rockTh + n2(x * 0.3, y * 0.3) * 0.5) type[i] = T.ROCKY;
      else if (f > 0.7) type[i] = T.MEADOW;
      else type[i] = T.GRASS;
      if (type[i] === T.SAND) S.fert[i] *= 0.3;
      if (type[i] === T.ROCKY) S.fert[i] *= 0.4;
    }
    // ---- climate & biomes: snow, taiga, woods, swamp, jungle, savanna, desert ----
    S.clima = opts.clima || 'variado';
    G.Biome.assign(S);
    const BI = G.Biome.ID;

    // ---- choose start locations (far apart when there are several peoples) ----
    const forest = (x, y) => G.fbm(n1, x * 0.09 + 50, y * 0.09 + 50, 3);
    // (never on a ledge cut off by cliffs)
    const LID = W.landIds(); const lsz = {}; for (let i = 0; i < N * N; i++) if (LID[i] >= 0) lsz[LID[i]] = (lsz[LID[i]] || 0) + 1;
    let cands = [];
    // (rugged worlds: if the good valleys are too few, settle for rougher ground)
    for (const [minO, maxSl] of [[5, 1.4], [3, 2.1], [2, 3]]) {
    if (cands.length >= tribes * 4) break;
    cands = [];
    for (let y = 8; y < N - 8; y++) for (let x = 8; x < N - 8; x++) {
      const i = y * N + x;
      if (type[i] !== T.GRASS && type[i] !== T.MEADOW) continue;
      if (dOcean[i] < minO) continue;
      if (dRiver[i] < 2) continue;
      const sl = W.slope(x - 2, y - 2, 5, 5); if (sl > maxSl || S.cliff[i] || !(lsz[LID[i]] >= 80)) continue;
      let s = -G.dist(x, y, cx, cy) * (tribes > 1 ? 0.05 : 0.35);
      let forestNear = 0, landNear = 0;
      for (let dy = -9; dy <= 9; dy += 2) for (let dx = -9; dx <= 9; dx += 2) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const d = Math.hypot(dx, dy); if (d > 9) continue;
        const j = ny * N + nx;
        if (type[j] >= T.SAND) landNear++;
        if (d > 3.5 && forest(nx, ny) > 0.08 && type[j] >= T.GRASS) forestNear++;
      }
      s += Math.min(forestNear, 12) * 0.4 + landNear * 0.13;
      if (dRiver[i] < 8) s += 2.5;
      const bm = S.biome[i]; s += bm === BI.NEVE ? -5 : bm === BI.PANTANO ? -2.5 : bm === BI.TAIGA ? -0.6 : bm === BI.SELVA ? -0.4 : 0;
      s += S.fert[i] * 2 - sl * 2 - Math.max(0, W.tileH(i) - SEA - 6) * 0.35;
      cands.push([x, y, s, landComp[i]]);
    }
    }
    cands.sort((a, b) => b[2] - a[2]);
    const starts = [];
    let minD = tribes === 1 ? 0 : N * (tribes === 2 ? 0.5 : tribes === 3 ? 0.4 : tribes === 4 ? 0.34 : tribes === 5 ? 0.3 : 0.27);
    while (starts.length < tribes && minD >= 6) {
      for (const c of cands) {
        if (starts.length >= tribes) break;
        if (starts.some(s => G.dist(s[0], s[1], c[0], c[1]) < minD)) continue;
        if (((mapType === 'arquipelago' && minD > N * 0.2) || mapType === 'mar') && starts.some(s => s[3] === c[3])) continue;
        starts.push(c);
      }
      minD *= 0.8;
    }
    // small islands: accept rougher spots, as far as possible from the other peoples
    while (starts.length && starts.length < tribes) {
      let best = null, bd = 0;
      for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) {
        const i = y * N + x;
        if ((type[i] !== T.GRASS && type[i] !== T.MEADOW) || dOcean[i] < 2) continue;
        let md = 1e9; for (const s of starts) md = Math.min(md, G.dist(s[0], s[1], x, y));
        if (md > bd) { bd = md; best = [x, y, 0, landComp[i]]; }
      }
      if (!best || bd < 5) break;
      starts.push(best);
    }
    if (!starts.length) {
      for (let r = 0; r < N && !starts.length; r++) for (let k = 0; k < 64; k++) {
        const a = k / 64 * Math.PI * 2; const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
        if (W.inb(x, y) && type[y * N + x] >= T.SAND) { starts.push([x, y, 0, 0]); break; }
      }
    }

    // ---- vegetation & rocks, by biome ----
    const topH = landH[landH.length - 1] || SEA; const treeLine = topH > SEA + 12 ? SEA + (topH - SEA) * 0.68 : 0;
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x; const t = type[i];
      if (t < T.SAND || t === T.RIVER) continue;
      if (starts.some(s => G.dist(x + 0.5, y + 0.5, s[0] + 0.5, s[1] + 0.5) < 3.2)) continue;
      if (S.cliff[i] || (treeLine && W.tileH(i) > treeLine && rng() < 0.9)) continue;
      const bm = S.biome[i]; const BD = G.BIOMES[bm];
      const fd = forest(x, y);
      const th = W.tileH(i);
      const jit = () => (rng() - 0.5) * 0.4;
      if (t === T.SAND) {
        if (bm === BI.DESERTO) {
          if (dRiver[i] <= 2 && rng() < 0.25) G.Nature.addTree(x + 0.5 + jit(), y + 0.5 + jit(), 'palm', 0.8 + rng() * 0.3);
          else if (rng() < (fd > BD.patch ? BD.dens : BD.sparse)) G.Nature.addTree(x + 0.5 + jit(), y + 0.5 + jit(), 'cactus', 0.7 + rng() * 0.4);
          else if (rng() < 0.006) G.Nature.addRock(x + 0.5, y + 0.5, 20 + Math.floor(rng() * 14));
        } else if (dOcean[i] <= 2 && S.temp[i] > 90 && rng() < (bm === BI.SELVA ? 0.18 : 0.07)) G.Nature.addTree(x + 0.5 + jit(), y + 0.5 + jit(), 'palm', 0.8 + rng() * 0.3);
        continue;
      }
      if (t === T.ROCKY) {
        if (rng() < 0.2) G.Nature.addRock(x + 0.5, y + 0.5, 30 + Math.floor(rng() * 30));
        else if (rng() < 0.12 && bm !== BI.DESERTO) G.Nature.addTree(x + 0.5 + jit(), y + 0.5 + jit(), S.temp[i] < 80 ? 'snowpine' : 'pine', 0.7 + rng() * 0.35);
        continue;
      }
      // small islands keep more of their woods
      const dense = fd > BD.patch + (mapType === 'mar' ? -0.09 : 0);
      if ((dense && rng() < BD.dens) || rng() < BD.sparse * (mapType === 'mar' ? 2 : 1)) {
        let kind = G.Biome.pickTree(bm, rng);
        if (bm === BI.TEMP && th > SEA + 2.6 + (landH[landH.length - 1] - SEA) * 0.2 && rng() < 0.7) kind = 'pine';
        const size = rng() < 0.15 ? 0.3 + rng() * 0.3 : 0.75 + rng() * 0.3;
        G.Nature.addTree(x + 0.5 + (rng() - 0.5) * 0.45, y + 0.5 + (rng() - 0.5) * 0.45, kind, size);
      } else if ((fd > -0.08 && fd < 0.1 && rng() < BD.bush) || (t === T.MEADOW && rng() < 0.03)) {
        G.Nature.addBush(x + 0.5, y + 0.5);
      } else if (rng() < 0.01) {
        G.Nature.addRock(x + 0.5, y + 0.5, 20 + Math.floor(rng() * 14));
      }
    }
    // guarantee a few resources close to every camp
    for (const [sx, sy] of starts) {
      const ensure = (count, radius, fn, test) => {
        let have = 0;
        for (let y = sy - radius; y <= sy + radius; y++) for (let x = sx - radius; x <= sx + radius; x++) {
          if (!W.inb(x, y)) continue; if (test(y * N + x)) have++;
        }
        let guard = 0;
        while (have < count && guard++ < 400) {
          const a = rng() * Math.PI * 2, d = 3.5 + rng() * (radius - 3.5);
          const x = Math.floor(sx + Math.cos(a) * d), y = Math.floor(sy + Math.sin(a) * d);
          if (!W.inb(x, y)) continue; const i = y * N + x;
          if (type[i] < T.SAND || type[i] === T.RIVER || S.treeAt[i] || S.objAt[i]) continue;
          fn(x, y); have++;
        }
      };
      ensure(5, 8, (x, y) => G.Nature.addBush(x + 0.5, y + 0.5), i => { const b = S.objAt[i]; return b && S.bushes.has(b); });
      ensure(5, 13, (x, y) => G.Nature.addRock(x + 0.5, y + 0.5, 40), i => { const b = S.objAt[i]; return b && S.rocks.has(b); });
      ensure(18, 9, (x, y) => { const i = y * N + x; const b = S.biome[i]; const k = G.Biome.pickTree(b === BI.DESERTO || b === BI.NEVE ? BI.TAIGA : b, rng); G.Nature.addTree(x + 0.5, y + 0.5, b === BI.DESERTO ? 'palm' : b === BI.NEVE ? 'snowpine' : k === 'cactus' ? 'palm' : k, 0.8 + rng() * 0.2); }, i => S.treeAt[i] > 0);
    }

    S.starts = starts.map(s => [s[0] + 0.5, s[1] + 0.5]);
    S.start = S.starts[0];
    // veins of iron and gold: someone will have them, someone will want them
    if (G.Eco) G.Eco.genDeposits(S);
    // the layer below: caves under the hills
    if (G.Caves) G.Caves.gen(S, ro.cavernas);
    return S;
  };

  // ------------------------------------------------------------
  // Pathfinding (A* on the tile grid, 8-way, with string pulling)
  // ------------------------------------------------------------
  let gS, came, seen, closed;
  function allocPath() { gS = new Float32Array(N * N); came = new Int32Array(N * N); seen = new Uint32Array(N * N); closed = new Uint32Array(N * N); }
  allocPath();
  G.mapHooks.push(n => { N = n; V = n + 1; allocPath(); });
  let gen = 1;
  const heap = new G.Heap();
  const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
  W.cost = function (i) {
    const S = G.S; const t = S.type[i];
    const rd = S.road[i];
    if (rd) return (rd >= 3 ? 0.5 : 0.58) + (S.fire[i] > 0.02 ? 30 : 0); // streets, highways and bridges
    let c = t === T.RIVER ? 3.2 : t === T.SAND ? 1.08 : t === T.ROCKY ? 1.25 : 1;
    if (t >= T.SAND) c *= 1 + S.slope[i] * 0.22; // slopes are hard going
    if (S.biome) c *= G.BIOMES[S.biome[i]].cost;
    const w = S.wear[i]; if (w > 8) c *= 1 - 0.38 * Math.min(1, w / G.WEAR_MAX);
    if (S.fire[i] > 0.02) c += 30;
    return c;
  };
  // how hard the search leans towards the goal: 0.62 keeps it exact even along roads (they cost less than 1);
  // while years are skipped it leans harder (a slightly longer walk nobody sees, a much shorter search)
  W.PATH_EXACT = 0.62; W.PATH_GREEDY = 1.3; W.pathGreed = W.PATH_EXACT;
  W.findPath = function (sx, sy, tx, ty, adj, maxNodes, greed) {
    maxNodes = maxNodes || 3500; const gr = greed || W.pathGreed;
    if (!W.inb(sx, sy) || !W.inb(tx, ty)) return null;
    const s = W.idx(sx, sy), t = W.idx(tx, ty);
    const tX = t % N, tY = (t / N) | 0;
    if (!adj && !W.walkable(t)) adj = true;
    // no walking there (another island, a pocket boxed in by buildings, a cliff, a wall): fail at once instead of flooding the map
    if (!W.canWalk(sx, sy, tx, ty, !!adj)) return null;
    if (s === t && !adj) return [[tx, ty]];
    gen++; heap.clear();
    const TH = G.S.th;
    gS[s] = 0; seen[s] = gen; came[s] = -1;
    heap.push(s, 0);
    let found = -1, nodes = 0;
    while (heap.size) {
      const a = heap.pop();
      if (closed[a] === gen) continue;
      closed[a] = gen;
      const ax = a % N, ay = (a / N) | 0;
      if (adj ? (Math.max(Math.abs(ax - tX), Math.abs(ay - tY)) <= 1 && (a !== t || W.walkable(a))) : a === t) { found = a; break; }
      if (++nodes > maxNodes) break;
      for (let k = 0; k < 8; k++) {
        const nx = ax + DX[k], ny = ay + DY[k];
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const j = ny * N + nx;
        if (closed[j] === gen) continue;
        if (!W.walkable(j)) continue;
        if (k >= 4 && (!W.walkable(ay * N + nx) || !W.walkable(ny * N + ax))) continue;
        // climbing costs more than walking on the flat: the path prefers valleys and passes
        const g = gS[a] + (k >= 4 ? 1.4142 : 1) * W.cost(j) + Math.max(0, TH[j] - TH[a]) * 0.55;
        if (seen[j] !== gen || g < gS[j]) {
          seen[j] = gen; gS[j] = g; came[j] = a;
          const hx = Math.abs(nx - tX), hy = Math.abs(ny - tY);
          const h = (Math.max(hx, hy) + 0.4142 * Math.min(hx, hy)) * gr;
          heap.push(j, g + h);
        }
      }
    }
    if (found < 0) return null;
    const tiles = [];
    for (let c = found; c !== -1; c = came[c]) tiles.push(c);
    tiles.reverse();
    const pts = tiles.map(i => [(i % N) + 0.5, ((i / N) | 0) + 0.5]);
    if (!adj) pts[pts.length - 1] = [tx, ty];
    pts[0] = [sx, sy];
    return smoothPath(pts);
  };
  W.losClear = (ax, ay, bx, by) => losClear(ax, ay, bx, by);
  // (whether the straight walk from a to b stays on ground one walks: every tile it passes through, from where it leaves a to b
  // itself — never samples along it: one every 0.3 of a tile let a smoothed path cut the corner of a building between two of
  // them, the walker inside the building for an instant, L-354 —; where it passes over the corner of four tiles, the two beside
  // the corner as well, as the search asks of a diagonal step. Onto a river only when it starts or ends on one; never fire)
  function losClear(ax, ay, bx, by) {
    const S = G.S; const riverOK = S.type[W.idx(ax, ay)] === T.RIVER || S.type[W.idx(bx, by)] === T.RIVER;
    const bad = (x, y) => { if (x < 0 || y < 0 || x >= N || y >= N) return true; const i = y * N + x; return !W.walkable(i) || (!riverOK && S.type[i] === T.RIVER) || S.fire[i] > 0.02; };
    const dx = bx - ax, dy = by - ay; const len = Math.hypot(dx, dy); if (len < 1e-9) return true;
    const sx = dx > 0 ? 1 : dx < 0 ? -1 : 0, sy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
    // (the tile the walk is in a hair after a — a start on a tile's edge is in the tile it goes into —, and b's own tile)
    const e = 1e-7 / len; let x = Math.floor(ax + dx * e), y = Math.floor(ay + dy * e); const x1 = Math.floor(bx), y1 = Math.floor(by);
    // (how far along the walk — 0 at a, 1 at b — the next line across x and the next across y are, and from one line to the next)
    const tdx = sx ? 1 / Math.abs(dx) : Infinity, tdy = sy ? 1 / Math.abs(dy) : Infinity;
    let tx = sx > 0 ? (x + 1 - ax) * tdx : sx < 0 ? (ax - x) * tdx : Infinity, ty = sy > 0 ? (y + 1 - ay) * tdy : sy < 0 ? (ay - y) * tdy : Infinity;
    if (bad(x, y)) return false;
    for (let n = 0; n < 4 * N && (x !== x1 || y !== y1) && Math.min(tx, ty) <= 1; n++) {
      if (Math.abs(tx - ty) * len < 1e-7) { if (bad(x + sx, y) || bad(x, y + sy)) return false; x += sx; y += sy; tx += tdx; ty += tdy; }
      else if (tx < ty) { x += sx; tx += tdx; } else { y += sy; ty += tdy; }
      if (bad(x, y)) return false;
    }
    return !bad(x1, y1);
  }
  function smoothPath(pts) {
    if (pts.length <= 2) return pts.slice(1);
    const out = [];
    let a = 0;
    while (a < pts.length - 1) {
      let b = pts.length - 1;
      while (b > a + 1 && !losClear(pts[a][0], pts[a][1], pts[b][0], pts[b][1])) b--;
      out.push(pts[b]); a = b;
    }
    return out;
  }
})(window.G);
