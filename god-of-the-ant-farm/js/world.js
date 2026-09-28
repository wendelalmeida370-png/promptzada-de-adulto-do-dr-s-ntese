'use strict';
// ============================================================
//  World: state, procedural island, terrain queries, pathfinding
// ============================================================
(function (G) {
  const N = G.N = 64;
  const V = N + 1;
  const SEA = G.SEA = 2.0;
  const T = G.T = { DEEP: 0, SEA: 1, RIVER: 2, SAND: 3, GRASS: 4, MEADOW: 5, ROCKY: 6 };
  G.DAY_LEN = 100;           // seconds of game time per day (1 day == 1 year of life)
  G.WEAR_MAX = 60;           // footpath wear saturation

  G.newState = function (seed) {
    return {
      v: 3, seed, N,
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
      settlements: new Map(),
      stock: { food: 36, wood: 14, stone: 0 },
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
  W.walkable = i => { const t = G.S.type[i]; return (t >= T.RIVER) && !W.blocked(i); };
  W.walkableXY = (x, y) => W.inb(x, y) && W.walkable(W.idx(x, y));
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
  // Procedural island
  // ------------------------------------------------------------
  G.genWorld = function (seed) {
    const S = G.newState(seed);
    G.S = S;
    const rng = G.mulberry32(seed);
    const n1 = G.makeNoise(seed), n2 = G.makeNoise(seed + 101), n3 = G.makeNoise(seed + 202), n4 = G.makeNoise(seed + 303);
    const H = S.H;
    const cx = N / 2 + (rng() - 0.5) * 3, cy = N / 2 + (rng() - 0.5) * 3;
    const hillOffX = rng() * 100, hillOffY = rng() * 100;
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      const dx = (vx - cx) / (N / 2), dy = (vy - cy) / (N / 2);
      const d = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx);
      const shape = Math.min(0.93, 0.83 + 0.24 * G.fbm(n1, Math.cos(a) * 1.4 + 3.1, Math.sin(a) * 1.4 + 7.7, 3));
      const island = 1 - G.smooth(shape * 0.5, shape * 0.97, d);
      const detail = G.fbm(n2, vx * 0.085, vy * 0.085, 4);
      const hills = Math.max(0, G.fbm(n3, vx * 0.05 + hillOffX, vy * 0.05 + hillOffY, 3) + 0.05);
      let h = island * (2.95 + detail * 1.25 + hills * 8.5) + (1 - island) * 0.3;
      const edge = Math.min(vx, vy, N - vx, N - vy);
      if (edge < 5) h = Math.min(h, 0.6 + edge * 0.15);
      H[vy * V + vx] = h;
    }

    // ---- river + lake (carved valley at sea level) ----
    if (rng() < 0.8) {
      const ang = rng() * Math.PI * 2;
      let px = cx - Math.cos(ang) * N * 0.1, py = cy - Math.sin(ang) * N * 0.1;
      const pts = [[px, py]];
      let dir = ang;
      for (let k = 0; k < 200; k++) {
        dir += (n4(k * 0.15, 3.3) * 0.9);
        dir = ang + G.clamp(dir - ang, -0.9, 0.9);
        px += Math.cos(dir) * 0.5; py += Math.sin(dir) * 0.5;
        pts.push([px, py]);
        if (px < 2 || py < 2 || px > N - 2 || py > N - 2) break;
        const hv = H[Math.round(py) * V + Math.round(px)];
        if (hv < SEA - 0.6 && k > 10) { for (let e = 0; e < 4; e++) { px += Math.cos(dir) * 0.5; py += Math.sin(dir) * 0.5; pts.push([px, py]); } break; }
      }
      const lx = pts[0][0], ly = pts[0][1];
      for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
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
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      water[i] = W.tileH(i) < SEA ? 1 : 0;
    }
    // ocean flood fill from border
    const ocean = new Uint8Array(N * N);
    const q = [];
    for (let k = 0; k < N; k++) { q.push(k, (N - 1) * N + k, k * N, k * N + N - 1); }
    for (const i of q) ocean[i] = 1;
    while (q.length) {
      const i = q.pop(); const x = i % N, y = (i / N) | 0;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of nb) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const j = ny * N + nx; if (!ocean[j] && water[j]) { ocean[j] = 1; q.push(j); }
      }
    }
    // inland water bodies: keep if size >= 4, else fill
    const comp = new Int32Array(N * N).fill(-1);
    for (let i = 0; i < N * N; i++) {
      if (water[i] && !ocean[i] && comp[i] < 0) {
        const list = [i]; comp[i] = i; const st = [i];
        while (st.length) {
          const a = st.pop(); const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
            const j = ny * N + nx; if (water[j] && !ocean[j] && comp[j] < 0) { comp[j] = i; list.push(j); st.push(j); }
          }
        }
        if (list.length < 4) for (const j of list) water[j] = 0;
      }
    }
    for (let i = 0; i < N * N; i++) {
      if (ocean[i]) type[i] = T.SEA;
      else if (water[i]) type[i] = T.RIVER;
      else type[i] = T.GRASS;
    }
    // keep only the biggest walkable landmass
    const land = new Int32Array(N * N).fill(-1);
    let bestC = -1, bestSize = 0; const sizes = {};
    for (let i = 0; i < N * N; i++) {
      if (type[i] >= T.RIVER && land[i] < 0) {
        let size = 0; const st = [i]; land[i] = i;
        while (st.length) {
          const a = st.pop(); size++; const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
            const j = ny * N + nx; if (type[j] >= T.RIVER && land[j] < 0) { land[j] = i; st.push(j); }
          }
        }
        sizes[i] = size; if (size > bestSize) { bestSize = size; bestC = i; }
      }
    }
    for (let i = 0; i < N * N; i++) if (type[i] >= T.RIVER && land[i] !== bestC) type[i] = T.SEA;

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

    // distance to ocean (BFS)
    const dOcean = new Int32Array(N * N).fill(999);
    const bq = [];
    for (let i = 0; i < N * N; i++) if (type[i] <= T.SEA) { dOcean[i] = 0; bq.push(i); }
    for (let h = 0; h < bq.length; h++) {
      const a = bq[h]; const x = a % N, y = (a / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const j = ny * N + nx; if (dOcean[j] > dOcean[a] + 1) { dOcean[j] = dOcean[a] + 1; bq.push(j); }
      }
    }
    G.dOcean = dOcean;
    const dRiver = new Int32Array(N * N).fill(999);
    const rq = [];
    for (let i = 0; i < N * N; i++) if (type[i] === T.RIVER) { dRiver[i] = 0; rq.push(i); }
    for (let h = 0; h < rq.length; h++) {
      const a = rq[h]; const x = a % N, y = (a / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const j = ny * N + nx; if (dRiver[j] > dRiver[a] + 1) { dRiver[j] = dRiver[a] + 1; rq.push(j); }
      }
    }

    // the highest ~10% of the island becomes rocky highland (stone source)
    const landH = [];
    for (let i = 0; i < N * N; i++) if (type[i] === T.GRASS) landH.push(W.tileH(i));
    landH.sort((a, b) => a - b);
    const rockTh = G.clamp(landH[Math.floor(landH.length * 0.9)] || SEA + 4.3, SEA + 2.4, SEA + 4.3);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const th = W.tileH(i);
      if (type[i] === T.SEA) {
        // deep vs shallow
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

    // ---- choose start location ----
    let best = null, bestScore = -1e9;
    const forest = (x, y) => G.fbm(n1, x * 0.09 + 50, y * 0.09 + 50, 3);
    for (let y = 8; y < N - 8; y++) for (let x = 8; x < N - 8; x++) {
      const i = y * N + x;
      if (type[i] !== T.GRASS && type[i] !== T.MEADOW) continue;
      if (dOcean[i] < 6) continue;
      if (dRiver[i] < 2) continue;
      if (W.slope(x - 2, y - 2, 5, 5) > 1.4) continue;
      let sc = -G.dist(x, y, cx, cy) * 0.35;
      let forestNear = 0, landNear = 0;
      for (let dy = -9; dy <= 9; dy += 1) for (let dx = -9; dx <= 9; dx += 1) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const d = Math.hypot(dx, dy); if (d > 9) continue;
        const j = ny * N + nx;
        if (type[j] >= T.SAND) landNear++;
        if (d > 3.5 && forest(nx, ny) > 0.08 && type[j] >= T.GRASS) forestNear++;
      }
      sc += Math.min(forestNear, 40) * 0.12 + landNear * 0.04;
      if (dRiver[i] < 8) sc += 2.5;
      sc += S.fert[i] * 2;
      sc -= W.slope(x - 2, y - 2, 5, 5) * 2;
      if (sc > bestScore) { bestScore = sc; best = [x, y]; }
    }
    if (!best) {
      for (let r = 0; r < N && !best; r++) {
        for (let k = 0; k < 64; k++) {
          const a = k / 64 * Math.PI * 2; const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
          if (W.inb(x, y) && type[y * N + x] >= T.SAND) { best = [x, y]; break; }
        }
      }
    }
    const [sx, sy] = best;

    // ---- vegetation & rocks ----
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x; const t = type[i];
      if (t < T.SAND) continue;
      if (t === T.RIVER) continue;
      const dStart = G.dist(x + 0.5, y + 0.5, sx + 0.5, sy + 0.5);
      if (dStart < 3.2) continue;
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
      const dense = fd > 0.07;
      if ((dense && rng() < 0.58) || rng() < 0.035) {
        const pine = th > SEA + 2.6 ? rng() < 0.8 : rng() < 0.3;
        const size = rng() < 0.15 ? 0.3 + rng() * 0.3 : 0.75 + rng() * 0.3;
        G.Nature.addTree(x + 0.5 + (rng() - 0.5) * 0.45, y + 0.5 + (rng() - 0.5) * 0.45, pine ? 'pine' : 'oak', size);
      } else if ((fd > -0.08 && fd < 0.1 && rng() < 0.07) || (t === T.MEADOW && rng() < 0.03)) {
        G.Nature.addBush(x + 0.5, y + 0.5);
      } else if (rng() < 0.01) {
        G.Nature.addRock(x + 0.5, y + 0.5, 20 + Math.floor(rng() * 14));
      }
    }
    // guarantee a few resources close to camp
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

    S.start = [sx + 0.5, sy + 0.5];
    return S;
  };

  // ------------------------------------------------------------
  // Pathfinding (A* on the tile grid, 8-way, with string pulling)
  // ------------------------------------------------------------
  const gS = new Float32Array(N * N), came = new Int32Array(N * N), seen = new Uint32Array(N * N), closed = new Uint32Array(N * N);
  let gen = 1;
  const heap = new G.Heap();
  const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
  W.cost = function (i) {
    const S = G.S; const t = S.type[i];
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
