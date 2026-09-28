'use strict';
// ============================================================
//  World: state, procedural island, terrain queries, pathfinding
// ============================================================
(function (G) {
  let N = G.N = 64;
  let V = N + 1;
  const SEA = G.SEA = 2.0;
  const T = G.T = { DEEP: 0, SEA: 1, RIVER: 2, SAND: 3, GRASS: 4, MEADOW: 5, ROCKY: 6 };
  G.DAY_LEN = 100;           // seconds of game time per day (1 day == 1 year of life)
  G.WEAR_MAX = 60;           // footpath wear saturation

  G.newState = function (seed) {
    return {
      v: 4, seed, N, mapType: 'ilha',
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
  W.groundH = (x, y) => Math.max(W.hAt(x, y), SEA);
  W.tileH = i => { // average vertex height of tile
    const x = i % N, y = (i / N) | 0, H = G.S.H;
    return (H[y * V + x] + H[y * V + x + 1] + H[(y + 1) * V + x] + H[(y + 1) * V + x + 1]) * 0.25;
  };
  W.isWater = i => G.S.type[i] <= T.RIVER;
  W.isOcean = i => G.S.type[i] <= T.SEA;
  W.isLand = i => G.S.type[i] >= T.SAND;
  W.blocked = i => { const b = G.S.occ[i]; if (!b) return false; const B = G.S.buildings.get(b); return !!(B && B.blocks); };
  // walls block, open gates (2) and aqueduct arches (3) let people through, shut gates (4) don't
  W.walkable = i => { const S = G.S; const t = S.type[i]; if (t < T.RIVER || W.blocked(i)) return false; const w = S.wall[i]; return !w || w === 2 || w === 3; };
  W.walkableXY = (x, y) => W.inb(x, y) && W.walkable(W.idx(x, y));
  // landmass labels: who can walk to whom (4-connected land, rivers included)
  let landIds = null, landKey = null, landVer = -1;
  W.invalidateLand = () => { landIds = null; };
  W.landIds = function () {
    const S = G.S;
    if (landIds && landKey === S && landVer === (S.typeVer || 0) && landIds.length === N * N) return landIds;
    landIds = new Int32Array(N * N).fill(-1); landKey = S; landVer = S.typeVer || 0;
    let id = 0;
    for (let i = 0; i < N * N; i++) {
      if (landIds[i] >= 0 || S.type[i] < T.RIVER) continue;
      const st = [i]; landIds[i] = id;
      while (st.length) {
        const a = st.pop(); const x = a % N, y = (a / N) | 0;
        if (x > 0 && landIds[a - 1] < 0 && S.type[a - 1] >= T.RIVER) { landIds[a - 1] = id; st.push(a - 1); }
        if (x < N - 1 && landIds[a + 1] < 0 && S.type[a + 1] >= T.RIVER) { landIds[a + 1] = id; st.push(a + 1); }
        if (y > 0 && landIds[a - N] < 0 && S.type[a - N] >= T.RIVER) { landIds[a - N] = id; st.push(a - N); }
        if (y < N - 1 && landIds[a + N] < 0 && S.type[a + N] >= T.RIVER) { landIds[a + N] = id; st.push(a + N); }
      }
      id++;
    }
    return landIds;
  };
  W.landAt = (x, y) => W.inb(x, y) ? W.landIds()[W.idx(x, y)] : -1;
  W.sameLand = (ax, ay, bx, by) => { const L = W.landIds(); const a = L[W.idx(ax, ay)], b = L[W.idx(bx, by)]; return a < 0 || b < 0 || a === b; };
  W.buildable = i => { const t = G.S.type[i]; return t >= T.SAND && !G.S.occ[i] && !G.S.objAt[i] && G.S.fire[i] < 0.05; };
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
  W.nearestLand = function (x, y, maxR) {
    maxR = maxR || 20;
    const x0 = x | 0, y0 = y | 0;
    let best = null, bd = 1e9;
    for (let r = 0; r <= maxR && !best; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const tx = x0 + dx, ty = y0 + dy;
        if (!W.inb(tx, ty)) continue;
        const i = W.idx(tx, ty);
        if (W.isLand(i) && W.walkable(i)) {
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
    const tribes = G.clamp(opts.tribes || 1, 1, 4);
    G._genTribes = tribes;
    const S = G.newState(seed);
    S.mapType = mapType; S.N = N;
    G.S = S;
    const rng = G.mulberry32(seed);
    const n1 = G.makeNoise(seed), n2 = G.makeNoise(seed + 101), n3 = G.makeNoise(seed + 202), n4 = G.makeNoise(seed + 303);
    const H = S.H;
    const shape = landShapeFn(mapType, rng, n1);
    const cx = N / 2, cy = N / 2;
    const hillOffX = rng() * 100, hillOffY = rng() * 100;
    const hillAmp = mapType === 'continente' ? 9.5 : 8.5;
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      const u = (vx - cx) / (N / 2), w = (vy - cy) / (N / 2);
      const island = shape(u, w);
      const detail = G.fbm(n2, vx * 0.085, vy * 0.085, 4);
      const hills = Math.max(0, G.fbm(n3, vx * 0.05 + hillOffX, vy * 0.05 + hillOffY, 3) + 0.05);
      let h = island * (2.95 + detail * 1.25 + hills * hillAmp) + (1 - island) * 0.3;
      const edge = Math.min(vx, vy, N - vx, N - vy);
      if (edge < 5) h = Math.min(h, 0.6 + edge * 0.15);
      H[vy * V + vx] = h;
    }

    // ---- river + lake (carved valley at sea level) ----
    const rivers = mapType === 'arquipelago' || mapType === 'mar' ? 0 : mapType === 'ilha' ? (rng() < 0.8 ? 1 : 0) : (N >= 80 ? 2 : 1);
    for (let rv = 0; rv < rivers; rv++) {
      // start on high-ish land
      let sx0 = cx, sy0 = cy, tries = 0;
      do { sx0 = cx + (rng() - 0.5) * N * 0.5; sy0 = cy + (rng() - 0.5) * N * 0.5; tries++; } while (tries < 40 && H[Math.round(sy0) * V + Math.round(sx0)] < SEA + 2);
      const ang = rng() * Math.PI * 2;
      let px = sx0, py = sy0;
      const pts = [[px, py]];
      let dir = ang;
      for (let k = 0; k < 400; k++) {
        dir += (n4(k * 0.15, 3.3 + rv * 7) * 0.9);
        dir = ang + G.clamp(dir - ang, -0.9, 0.9);
        px += Math.cos(dir) * 0.5; py += Math.sin(dir) * 0.5;
        pts.push([px, py]);
        if (px < 2 || py < 2 || px > N - 2 || py > N - 2) break;
        const hv = H[Math.round(py) * V + Math.round(px)];
        if (hv < SEA - 0.6 && k > 10) { for (let e = 0; e < 4; e++) { px += Math.cos(dir) * 0.5; py += Math.sin(dir) * 0.5; pts.push([px, py]); } break; }
      }
      const lx = pts[0][0], ly = pts[0][1];
      const minX = Math.max(0, Math.floor(Math.min(...pts.map(p => p[0])) - 6)), maxX = Math.min(N, Math.ceil(Math.max(...pts.map(p => p[0])) + 6));
      const minY = Math.max(0, Math.floor(Math.min(...pts.map(p => p[1])) - 6)), maxY = Math.min(N, Math.ceil(Math.max(...pts.map(p => p[1])) + 6));
      for (let vy = minY; vy <= maxY; vy++) for (let vx = minX; vx <= maxX; vx++) {
        let dm = 1e9;
        for (let k = 0; k < pts.length; k += 1) { const d2 = G.dist2(vx, vy, pts[k][0], pts[k][1]); if (d2 < dm) dm = d2; }
        dm = Math.sqrt(dm);
        const dl = Math.max(0, G.dist(vx, vy, lx, ly) - 1.5);
        const d = Math.min(dm, dl);
        if (d < 5) {
          const target = SEA - 0.5 + Math.pow(d, 1.35) * 0.72;
          const i = vy * V + vx;
          if (target < H[i]) H[i] = G.lerp(target, H[i], G.smooth(2.5, 5, d));
        }
      }
    }

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
        if (list.length < 4) for (const j of list) water[j] = 0;
      }
    }
    for (let i = 0; i < N * N; i++) type[i] = ocean[i] ? T.SEA : water[i] ? T.RIVER : T.GRASS;

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

    // ---- normalise vertices so water meets land exactly at sea level ----
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      let tw = false, tl = false;
      for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) {
        const x = vx + dx, y = vy + dy; if (!W.inb(x, y)) { tw = true; continue; }
        if (type[y * N + x] <= T.RIVER) tw = true; else tl = true;
      }
      const i = vy * V + vx;
      if (tw && tl) H[i] = SEA;
      else if (tw) H[i] = Math.min(H[i], SEA - 0.08);
      else H[i] = Math.max(H[i], SEA + 0.06);
    }

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
    const rockTh = G.clamp(landH[Math.floor(landH.length * 0.9)] || SEA + 4.3, SEA + 2.4, SEA + 4.3);
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
      const f = G.clamp(0.5 + G.fbm(n4, x * 0.07 + 40, y * 0.07 - 20, 3) * 1.1 + (dRiver[i] < 4 ? (4 - dRiver[i]) * 0.09 : 0) - (th - SEA) * 0.04, 0, 1);
      S.fert[i] = f;
      if (dOcean[i] <= 2 && th < SEA + 0.6) type[i] = T.SAND;
      else if (th > rockTh + n2(x * 0.3, y * 0.3) * 0.5) type[i] = T.ROCKY;
      else if (f > 0.7) type[i] = T.MEADOW;
      else type[i] = T.GRASS;
      if (type[i] === T.SAND) S.fert[i] *= 0.3;
      if (type[i] === T.ROCKY) S.fert[i] *= 0.4;
    }

    // ---- choose start locations (far apart when there are several peoples) ----
    const forest = (x, y) => G.fbm(n1, x * 0.09 + 50, y * 0.09 + 50, 3);
    const cands = [];
    for (let y = 8; y < N - 8; y++) for (let x = 8; x < N - 8; x++) {
      const i = y * N + x;
      if (type[i] !== T.GRASS && type[i] !== T.MEADOW) continue;
      if (dOcean[i] < 5) continue;
      if (dRiver[i] < 2) continue;
      const sl = W.slope(x - 2, y - 2, 5, 5); if (sl > 1.4) continue;
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
      s += S.fert[i] * 2 - sl * 2;
      cands.push([x, y, s, landComp[i]]);
    }
    cands.sort((a, b) => b[2] - a[2]);
    const starts = [];
    let minD = tribes === 1 ? 0 : N * (tribes === 2 ? 0.5 : tribes === 3 ? 0.4 : 0.34);
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

    // ---- vegetation & rocks ----
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x; const t = type[i];
      if (t < T.SAND || t === T.RIVER) continue;
      if (starts.some(s => G.dist(x + 0.5, y + 0.5, s[0] + 0.5, s[1] + 0.5) < 3.2)) continue;
      const fd = forest(x, y);
      const th = W.tileH(i);
      if (t === T.SAND) {
        if (dOcean[i] <= 2 && rng() < 0.07) G.Nature.addTree(x + 0.5 + (rng() - 0.5) * 0.4, y + 0.5 + (rng() - 0.5) * 0.4, 'palm', 0.8 + rng() * 0.3);
        continue;
      }
      if (t === T.ROCKY) {
        if (rng() < 0.2) G.Nature.addRock(x + 0.5, y + 0.5, 30 + Math.floor(rng() * 30));
        else if (rng() < 0.12) G.Nature.addTree(x + 0.5 + (rng() - 0.5) * 0.4, y + 0.5 + (rng() - 0.5) * 0.4, 'pine', 0.7 + rng() * 0.35);
        continue;
      }
      // small islands keep more of their woods
      const dense = fd > (mapType === 'mar' ? -0.02 : 0.07);
      if ((dense && rng() < 0.58) || rng() < (mapType === 'mar' ? 0.08 : 0.035)) {
        const pine = th > SEA + 2.6 ? rng() < 0.8 : rng() < 0.3;
        const size = rng() < 0.15 ? 0.3 + rng() * 0.3 : 0.75 + rng() * 0.3;
        G.Nature.addTree(x + 0.5 + (rng() - 0.5) * 0.45, y + 0.5 + (rng() - 0.5) * 0.45, pine ? 'pine' : 'oak', size);
      } else if ((fd > -0.08 && fd < 0.1 && rng() < 0.07) || (t === T.MEADOW && rng() < 0.03)) {
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
          if (type[i] < T.GRASS || S.treeAt[i] || S.objAt[i]) continue;
          fn(x, y); have++;
        }
      };
      ensure(5, 8, (x, y) => G.Nature.addBush(x + 0.5, y + 0.5), i => { const b = S.objAt[i]; return b && S.bushes.has(b); });
      ensure(5, 13, (x, y) => G.Nature.addRock(x + 0.5, y + 0.5, 40), i => { const b = S.objAt[i]; return b && S.rocks.has(b); });
      ensure(18, 9, (x, y) => G.Nature.addTree(x + 0.5, y + 0.5, 'oak', 0.8 + rng() * 0.2), i => S.treeAt[i] > 0);
    }

    S.starts = starts.map(s => [s[0] + 0.5, s[1] + 0.5]);
    S.start = S.starts[0];
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
    const w = S.wear[i]; if (w > 8) c *= 1 - 0.38 * Math.min(1, w / G.WEAR_MAX);
    if (S.fire[i] > 0.02) c += 30;
    return c;
  };
  W.findPath = function (sx, sy, tx, ty, adj, maxNodes) {
    maxNodes = maxNodes || 3500;
    if (!W.inb(sx, sy) || !W.inb(tx, ty)) return null;
    const s = W.idx(sx, sy), t = W.idx(tx, ty);
    const tX = t % N, tY = (t / N) | 0;
    if (!adj && !W.walkable(t)) adj = true;
    // different islands: no walking there (fail fast instead of flooding the map)
    const L = W.landIds(), ls = L[s];
    if (ls >= 0) {
      let ok = L[t] === ls;
      if (!ok && adj) for (let k = 0; k < 8 && !ok; k++) { const nx = tX + DX[k], ny = tY + DY[k]; if (nx >= 0 && ny >= 0 && nx < N && ny < N && L[ny * N + nx] === ls) ok = true; }
      if (!ok) return null;
    }
    if (s === t && !adj) return [[tx, ty]];
    gen++; heap.clear();
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
        const g = gS[a] + (k >= 4 ? 1.4142 : 1) * W.cost(j);
        if (seen[j] !== gen || g < gS[j]) {
          seen[j] = gen; gS[j] = g; came[j] = a;
          const hx = Math.abs(nx - tX), hy = Math.abs(ny - tY);
          const h = (Math.max(hx, hy) + 0.4142 * Math.min(hx, hy)) * 0.62;
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
  function losClear(ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay); const steps = Math.ceil(d / 0.3);
    const ta = W.idx(ax, ay), tb = W.idx(bx, by);
    const riverOK = G.S.type[ta] === T.RIVER || G.S.type[tb] === T.RIVER;
    for (let k = 1; k < steps; k++) {
      const f = k / steps; const x = ax + (bx - ax) * f, y = ay + (by - ay) * f;
      const i = W.idx(x, y);
      if (!W.walkable(i)) return false;
      if (!riverOK && G.S.type[i] === T.RIVER) return false;
      if (G.S.fire[i] > 0.02) return false;
    }
    return true;
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
