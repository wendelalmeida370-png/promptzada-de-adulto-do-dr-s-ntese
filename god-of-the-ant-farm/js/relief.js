'use strict';
// ============================================================
//  Relief: the shape of the land. Mountain ranges pushed up along
//  a spine, rolling hills, plateaus and mesas with cliff rims,
//  basins, cliffs over the sea, rain that carves valleys, rivers
//  that run down from the peaks to the sea (through lakes and over
//  waterfalls), and passes: every high place big enough to live
//  on keeps a way down.
// ============================================================
(function (G) {
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const T = G.T, W = G.W, SEA = G.SEA;
  const TAU = Math.PI * 2;
  const Rf = G.Relief = {};
  Rf.CLIFF = 2.8;  // a tile whose corners differ by more than this is a cliff face: no one walks it
  Rf.STEEP = 2.05; // bare rock from here on

  // ------------------------------ world options ------------------------------
  Rf.OPTS = {
    relevo: { label: 'Relevo', def: 'montanhoso', v: [['plano', 'Plano', 'planícies e colinas baixas'], ['suave', 'Suave', 'colinas e serras'], ['montanhoso', 'Montanhoso', 'montanhas altas'], ['alpino', 'Alpino', 'picos gigantes, neve eterna'], ['aleatorio', 'Aleatório', 'o mundo decide']] },
    cordilheiras: { label: 'Cordilheiras', def: 'uma', v: [['nenhuma', 'Nenhuma'], ['uma', 'Uma'], ['varias', 'Várias'], ['aleatorio', 'Aleatório']] },
    planaltos: { label: 'Planaltos e mesas', def: 'alguns', v: [['nenhum', 'Nenhum'], ['alguns', 'Alguns'], ['muitos', 'Muitos'], ['aleatorio', 'Aleatório']] },
    costa: { label: 'Costa', def: 'mista', v: [['praias', 'Praias'], ['mista', 'Mista'], ['falesias', 'Falésias'], ['aleatorio', 'Aleatório']] },
    lagos: { label: 'Lagos e depressões', def: 'normais', v: [['poucos', 'Poucos'], ['normais', 'Normais'], ['muitos', 'Muitos'], ['aleatorio', 'Aleatório']] },
  };
  Rf.resolve = function (opts, rng) {
    const o = {};
    for (const k in Rf.OPTS) {
      const vals = Rf.OPTS[k].v.map(e => e[0]).filter(x => x !== 'aleatorio');
      let v = opts && opts[k];
      if (v === 'aleatorio') v = vals[Math.floor(rng() * vals.length)];
      else if (!vals.includes(v)) v = Rf.OPTS[k].def;
      o[k] = v;
    }
    return o;
  };
  const RELEVO = {
    plano: { hill: 2.6, peak: 9, erode: 0.55, detail: 0.9, plat: 3.6 },
    suave: { hill: 5.5, peak: 15, erode: 0.8, detail: 1.1, plat: 5.5 },
    montanhoso: { hill: 6.5, peak: 25, erode: 1, detail: 1.25, plat: 7.5 },
    alpino: { hill: 7.5, peak: 36, erode: 1.1, detail: 1.35, plat: 9 },
  };
  Rf.preset = o => RELEVO[o.relevo] || RELEVO.montanhoso;

  // ------------------------------ heights ------------------------------
  // the island's outline comes from the map type; everything above it from the relief options
  Rf.heights = function (S, ctx) {
    const { shape, rng, n2, n3, o } = ctx;
    const V = N + 1; const H = S.H; const P = Rf.preset(o);
    const n5 = G.makeNoise(S.seed + 606), n6 = G.makeNoise(S.seed + 707), n7 = G.makeNoise(S.seed + 808);
    const cx = N / 2, cy = N / 2;
    const hillOffX = rng() * 100, hillOffY = rng() * 100;
    const isl = new Float32Array(V * V);
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      const k = vy * V + vx;
      const u = (vx - cx) / (N / 2), w = (vy - cy) / (N / 2);
      const island = shape(u, w); isl[k] = island;
      const detail = G.fbm(n2, vx * 0.085, vy * 0.085, 4);
      const hills = Math.max(0, G.fbm(n3, vx * 0.05 + hillOffX, vy * 0.05 + hillOffY, 3) + 0.05);
      // the coastline is drawn by the classic formula; the relief options only scale what stands above the sea
      const h0 = island * (2.95 + detail * 1.25 + hills * 8.5) + (1 - island) * 0.3;
      H[k] = h0 > SEA ? SEA + (h0 - SEA) * P.hill / 8.5 + detail * (P.detail - 1) * island : h0;
    }
    // ---- mountain ranges: a spine that wanders across the land, peaks and saddles along it ----
    const rel = S.relief = { ranges: [], passes: [], peaks: [], falls: [], lakes: [], opts: o };
    let nR = o.cordilheiras === 'nenhuma' ? 0 : o.cordilheiras === 'uma' ? 1 : (N >= 128 ? 3 : 2) + (rng() < 0.3 ? 1 : 0);
    const best = new Float32Array(V * V).fill(1e9), bestS = new Float32Array(V * V), bestR = new Int16Array(V * V).fill(-1), bestSide = new Int8Array(V * V);
    for (let r = 0; r < nR; r++) {
      let start = null;
      for (let t = 0; t < 80 && !start; t++) {
        const x = N * (0.18 + rng() * 0.64), y = N * (0.18 + rng() * 0.64);
        if (isl[Math.round(y) * V + Math.round(x)] < 0.75) continue;
        if (rel.ranges.some(R => R.pts.some(p => Math.hypot(p[0] - x, p[1] - y) < N * 0.2))) continue;
        start = [x, y];
      }
      if (!start) continue;
      const dir = rng() * TAU, L = N * (0.45 + rng() * 0.35);
      const half = sgn => {
        const out = []; let x = start[0], y = start[1], d = dir + (sgn < 0 ? Math.PI : 0);
        for (let s = 0; s < L / 2; s++) {
          d += n7(s * 0.09 + r * 13 + (sgn < 0 ? 50 : 0), 3.3) * 0.16;
          x += Math.cos(d); y += Math.sin(d);
          if (x < 2 || y < 2 || x > N - 2 || y > N - 2) break;
          out.push([x, y]);
        }
        return out;
      };
      const pts = half(-1).reverse().concat([start], half(1));
      if (pts.length < 8) continue;
      const w = Math.max(3.1, N * 0.052) * (0.85 + rng() * 0.3);
      const asym = (rng() - 0.5) * 0.6;
      const peak = P.peak * (0.85 + rng() * 0.3);
      // passes: one or two saddles cut low across the spine
      const np = pts.length > 40 ? 2 : 1; const passS = [];
      for (let k = 0; k < np; k++) { let s; let g = 0; do { s = 0.25 + rng() * 0.5; } while (g++ < 20 && passS.some(q => Math.abs(q - s) < 0.25)); passS.push(s); }
      const R = { id: r, pts, w, peak, asym, passS, len: pts.length };
      rel.ranges.push(R);
      // nearest spine point for every vertex around the range
      const rad = Math.ceil(w * 3.2);
      for (let k = 0; k < pts.length; k++) {
        const [px, py] = pts[k]; const s = k / (pts.length - 1);
        const nx = pts[Math.min(pts.length - 1, k + 1)][0] - pts[Math.max(0, k - 1)][0], ny = pts[Math.min(pts.length - 1, k + 1)][1] - pts[Math.max(0, k - 1)][1];
        for (let vy = Math.max(0, Math.floor(py - rad)); vy <= Math.min(N, Math.ceil(py + rad)); vy++) for (let vx = Math.max(0, Math.floor(px - rad)); vx <= Math.min(N, Math.ceil(px + rad)); vx++) {
          const d = Math.hypot(vx - px, vy - py); const i = vy * V + vx;
          if (d < best[i]) { best[i] = d; bestS[i] = s; bestR[i] = r; bestSide[i] = (nx * (vy - py) - ny * (vx - px)) > 0 ? 1 : -1; }
        }
      }
    }
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      const i = vy * V + vx; const r = bestR[i]; if (r < 0) continue;
      const R = rel.ranges.find(q => q.id === r); const s = bestS[i];
      const w = R.w * (1 + R.asym * bestSide[i]);
      const g = Math.exp(-Math.pow(best[i] / w, 2));
      if (g < 0.01) continue;
      let along = R.peak * (0.72 + 0.32 * n7(s * 5 + r * 7, 9.1)) * G.smooth(0, 0.14, s) * G.smooth(1, 0.86, s);
      for (const ps of R.passS) along *= 1 - 0.74 * Math.exp(-Math.pow((s - ps) * R.len / 2.4, 2));
      let rn = 1 - Math.abs(G.fbm(n6, vx * 0.11, vy * 0.11, 3)); rn *= rn;
      H[i] += along * g * (0.6 + 0.6 * rn) * G.smooth(0.05, 0.55, isl[i]);
    }
    for (const R of rel.ranges) for (const ps of R.passS) { const p = R.pts[Math.round(ps * (R.pts.length - 1))]; rel.passes.push({ x: p[0], y: p[1], range: R.id, kind: 'passo' }); }
    // ---- plateaus and mesas: flat tops, cliff rims, a ramp here and there ----
    if (o.planaltos !== 'nenhum') {
      const th = o.planaltos === 'muitos' ? 0.08 : 0.2;
      for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
        const k = vy * V + vx; if (isl[k] < 0.55) continue;
        const p = G.fbm(n5, vx * 0.045 + 3, vy * 0.045 - 9, 3);
        if (p < th) continue;
        const ramp = G.fbm(n7, vx * 0.07 + 40, vy * 0.07, 2) > 0.2;
        const rim = ramp ? 0.2 : 0.016;
        const top = SEA + P.plat * (0.85 + 0.35 * G.fbm(n7, vx * 0.03, vy * 0.03 + 77, 2)) + G.fbm(n2, vx * 0.21, vy * 0.21, 2) * 0.35;
        const t1 = G.smooth(th, th + rim, p), t2 = G.smooth(th + 0.15, th + 0.15 + rim, p);
        const target = top + t2 * P.plat * 0.55;
        const land = G.smooth(0.55, 0.8, isl[k]);
        H[k] = Math.max(H[k], H[k] + (target - H[k]) * Math.max(t1, t2 > 0 ? 1 : 0) * land);
      }
    }
    // ---- basins: where lakes gather ----
    const nB = o.lagos === 'poucos' ? 0 : Math.round(N * N / (o.lagos === 'muitos' ? 1300 : 3400));
    for (let b = 0; b < nB; b++) {
      let c = null;
      for (let t = 0; t < 40 && !c; t++) { const x = 6 + rng() * (N - 12), y = 6 + rng() * (N - 12); const k = Math.round(y) * V + Math.round(x); if (isl[k] > 0.8 && H[k] < SEA + 6 && bestR[k] < 0 || (isl[k] > 0.8 && best[k] > 6 && H[k] < SEA + 6)) c = [x, y]; }
      if (!c) continue;
      const big = o.lagos === 'muitos' && b === 0;
      const r = big ? Math.max(4, N * 0.06) : 2.2 + rng() * 3, depth = big ? 3.4 : 1.6 + rng() * 2;
      for (let vy = Math.max(0, Math.floor(c[1] - r * 2.6)); vy <= Math.min(N, Math.ceil(c[1] + r * 2.6)); vy++) for (let vx = Math.max(0, Math.floor(c[0] - r * 2.6)); vx <= Math.min(N, Math.ceil(c[0] + r * 2.6)); vx++) {
        const k = vy * V + vx; const d = Math.hypot(vx - c[0], vy - c[1]);
        H[k] = Math.max(SEA - 1, H[k] - depth * Math.exp(-Math.pow(d / r, 2)) * G.smooth(0.6, 0.9, isl[k]));
      }
    }
    // the world ends in open water
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      const edge = Math.min(vx, vy, N - vx, N - vy);
      if (edge < 5) { const k = vy * V + vx; H[k] = Math.min(H[k], 0.6 + edge * 0.15); }
    }
    return isl;
  };

  // ------------------------------ erosion ------------------------------
  // raindrops run downhill, pick up soil where they speed up and drop it where they slow:
  // gullies on the flanks, fans at the feet of the mountains
  Rf.erode = function (S, amount, rng) {
    const V = N + 1; const H = S.H;
    const drops = Math.round(V * V * 1.3 * amount);
    const inertia = 0.06, capF = 3.2, minCap = 0.01, dep = 0.3, ero = 0.28, evap = 0.025, grav = 4, life = 36, maxStep = 0.9;
    const at = (x, y) => { const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, k = yi * V + xi; return (H[k] * (1 - fx) + H[k + 1] * fx) * (1 - fy) + (H[k + V] * (1 - fx) + H[k + V + 1] * fx) * fy; };
    for (let d = 0; d < drops; d++) {
      let x = 2 + rng() * (V - 5), y = 2 + rng() * (V - 5);
      if (at(x, y) < SEA + 0.6) continue;
      let dx = 0, dy = 0, sp = 1, water = 1, sed = 0;
      for (let l = 0; l < life; l++) {
        const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, k = yi * V + xi;
        const a = H[k], b = H[k + 1], c = H[k + V], e = H[k + V + 1];
        const gx = (b - a) * (1 - fy) + (e - c) * fy, gy = (c - a) * (1 - fx) + (e - b) * fx;
        const h0 = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + e * fx) * fy;
        dx = dx * inertia - gx * (1 - inertia); dy = dy * inertia - gy * (1 - inertia);
        const len = Math.hypot(dx, dy); if (len < 1e-6) break;
        dx /= len; dy /= len;
        const nx = x + dx * 0.9, ny = y + dy * 0.9;
        if (nx < 1 || ny < 1 || nx >= V - 2 || ny >= V - 2) break;
        const dh = at(nx, ny) - h0;
        const cap = Math.max(-dh * sp * water * capF, minCap);
        const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        if (sed > cap || dh > 0) {
          const amt = dh > 0 ? Math.min(dh, sed) : (sed - cap) * dep;
          sed -= amt;
          H[k] += amt * w00; H[k + 1] += amt * w10; H[k + V] += amt * w01; H[k + V + 1] += amt * w11;
        } else {
          const amt = Math.min(Math.min((cap - sed) * ero, -dh), maxStep);
          // take it from a small brush so gullies are soft, not pits
          for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
            const q = k + oy * V + ox; const wgt = (ox === 0 && oy === 0) ? 0.36 : (ox === 0 || oy === 0) ? 0.11 : 0.05;
            if (H[q] > SEA + 0.2) H[q] -= amt * wgt;
          }
          sed += amt;
        }
        sp = Math.sqrt(Math.max(0, sp * sp + dh * grav)); water *= 1 - evap;
        x = nx; y = ny;
        if (h0 < SEA) break;
      }
    }
  };

  // ------------------------------ cliffs over the sea ------------------------------
  Rf.coast = function (S, o) {
    if (o.costa === 'praias') return;
    const V = N + 1; const H = S.H; const type = S.type;
    const n7 = G.makeNoise(S.seed + 909);
    const dv = new Int16Array(V * V).fill(99); const q = [];
    for (let vy = 0; vy < V; vy++) for (let vx = 0; vx < V; vx++) {
      let sea = false;
      for (let dy = -1; dy <= 0 && !sea; dy++) for (let dx = -1; dx <= 0; dx++) { const x = vx + dx, y = vy + dy; if (!W.inb(x, y) || type[y * N + x] <= T.SEA) { sea = true; break; } }
      if (sea) { dv[vy * V + vx] = 0; q.push(vy * V + vx); }
    }
    for (let h = 0; h < q.length; h++) {
      const a = q[h]; const x = a % V, y = (a / V) | 0; if (dv[a] >= 14) continue;
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= V || ny >= V) continue; const j = ny * V + nx; if (dv[j] > dv[a] + 1) { dv[j] = dv[a] + 1; q.push(j); } }
    }
    for (let k = 0; k < V * V; k++) {
      const d = dv[k]; if (d < 1 || d > 14) continue;
      const vx = k % V, vy = (k / V) | 0;
      const n = G.fbm(n7, vx * 0.06 + 11, vy * 0.06 + 5, 2);
      const m = o.costa === 'falesias' ? G.smooth(-0.5, -0.25, n) : G.smooth(0.04, 0.2, n);
      if (m <= 0) continue;
      const hgt = (2.6 + 2.8 * (0.5 + 0.5 * G.fbm(n7, vx * 0.13, vy * 0.13 + 31, 2))) * m;
      H[k] += hgt * (1 - G.smooth(5, 14, d) * 0.55);
    }
  };

  // ------------------------------ rivers and lakes ------------------------------
  // the land is flooded from the sea upward (priority flood): every tile learns where its water
  // goes, basins learn how high they fill before they spill. Where enough rain gathers, a river.
  Rf.hydro = function (S, ctx) {
    const { o, rivers } = ctx; const type = S.type; const H = S.H; const V = N + 1;
    const n8 = G.makeNoise(S.seed + 1010);
    const th = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; th[i] = W.tileH(i) + G.fbm(n8, x * 0.22, y * 0.22, 2) * 0.35; }
    const fill = new Float32Array(N * N), down = new Int32Array(N * N).fill(-1), seen = new Uint8Array(N * N);
    const heap = new G.Heap(); const order = [];
    for (let i = 0; i < N * N; i++) if (type[i] <= T.SEA) { seen[i] = 1; fill[i] = SEA; heap.push(i, SEA); }
    const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (heap.size) {
      const a = heap.pop(); const x = a % N, y = (a / N) | 0;
      if (type[a] > T.SEA) order.push(a);
      for (const [dx, dy] of NB) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const j = ny * N + nx; if (seen[j]) continue; seen[j] = 1;
        fill[j] = Math.max(th[j], fill[a] + 0.0004); down[j] = a; heap.push(j, fill[j]);
      }
    }
    // ---- lakes: basins deep enough to hold water ----
    const minDepth = o.lagos === 'poucos' ? 0.9 : o.lagos === 'muitos' ? 0.28 : 0.45;
    const lakeOf = new Int32Array(N * N).fill(-1); const lakes = [];
    for (let i = 0; i < N * N; i++) {
      if (lakeOf[i] >= 0 || type[i] <= T.SEA || fill[i] - th[i] < 0.06) continue;
      const tiles = [i]; lakeOf[i] = lakes.length; let deep = 0, lvl = 1e9;
      for (let h = 0; h < tiles.length; h++) {
        const a = tiles[h]; deep = Math.max(deep, fill[a] - th[a]); lvl = Math.min(lvl, fill[a]);
        const x = a % N, y = (a / N) | 0;
        for (const [dx, dy] of NB) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (lakeOf[j] < 0 && type[j] > T.SEA && fill[j] - th[j] >= 0.06) { lakeOf[j] = lakes.length; tiles.push(j); } }
      }
      lakes.push({ tiles, deep, lvl, ok: deep >= minDepth && tiles.length >= 3 });
    }
    // a basin as big as a sea only holds a lake in its deepest part (the rest is a plain around it)
    let landN = 0; for (let i = 0; i < N * N; i++) if (type[i] > T.SEA) landN++;
    const maxLake = Math.max(24, Math.round(landN * (o.lagos === 'muitos' ? 0.03 : 0.018)));
    const dry = new Uint8Array(N * N);
    lakes.forEach((L, id) => {
      if (!L.ok || L.tiles.length <= maxLake) return;
      const byH = L.tiles.slice().sort((a, b) => th[a] - th[b]);
      const lvl = th[byH[maxLake - 1]] + 0.05;
      const keep = byH.filter(i => th[i] < lvl);
      for (const i of L.tiles) if (th[i] >= lvl) { lakeOf[i] = -1; dry[i] = 1; }
      L.tiles = keep; L.lvl = lvl; L.shrunk = true;
      if (keep.length < 3) L.ok = false;
    });
    // ---- rain gathers downstream ----
    const acc = new Float32Array(N * N);
    for (const i of order) acc[i] = 1;
    for (let k = order.length - 1; k >= 0; k--) { const i = order[k]; const d = down[i]; if (d >= 0 && type[d] > T.SEA) acc[d] += acc[i]; }
    const isLake = i => lakeOf[i] >= 0 && lakes[lakeOf[i]].ok;
    let riv = new Uint8Array(N * N);
    const want = rivers * N * 0.8;
    if (want > 0) {
      let lo = 4, hi = 1; for (const i of order) hi = Math.max(hi, acc[i]);
      const count = T0 => { let c = 0; for (const i of order) if (acc[i] >= T0 && !isLake(i)) c++; return c; };
      for (let it = 0; it < 24; it++) { const mid = (lo + hi) / 2; if (count(mid) > want) lo = mid; else hi = mid; }
      const T0 = Math.max(6, hi);
      for (const i of order) if (acc[i] >= T0 && !isLake(i)) riv[i] = 1;
      for (const L of lakes) if (L.ok && L.shrunk) for (const i of L.tiles) for (let c = down[i]; c >= 0 && dry[c]; c = down[c]) riv[c] = 0;
      // mountain torrents: smaller streams high up, running down to a river (they make the waterfalls)
      if (Rf.preset(o).peak >= 14) {
        let added = 0; const cap = want * 0.7;
        const cands = order.filter(i => !riv[i] && !isLake(i) && acc[i] >= T0 * 0.22 && th[i] > SEA + 7).sort((a, b) => th[b] - th[a]);
        for (const i of cands) {
          if (added > cap || riv[i]) continue;
          const path = []; let c = i, ok = false;
          while (c >= 0 && path.length < 16) { if (type[c] <= T.SEA || riv[c] || isLake(c)) { ok = true; break; } path.push(c); c = down[c]; }
          if (!ok || path.length < 3) continue;
          for (const j of path) riv[j] = 1; added += path.length;
        }
      }
      // no stubs: a river shorter than a few tiles before it meets another water is just a wet gully
      for (const i of order) {
        if (!riv[i]) continue;
        const x = i % N, y = (i / N) | 0; let up = false;
        for (const [dx, dy] of NB) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (riv[j] && down[j] === i) up = true; }
        if (up) continue;
        let len = 0; for (let c = i; c >= 0 && riv[c] && len < 8; c = down[c]) len++;
        if (len < 5) for (let c = i, k = 0; c >= 0 && riv[c] && k < len; c = down[c], k++) { let other = false; const cx = c % N, cy = (c / N) | 0; for (const [dx, dy] of NB) { const j = (cy + dy) * N + cx + dx; if (cx + dx >= 0 && cy + dy >= 0 && cx + dx < N && cy + dy < N && riv[j] && down[j] === c && j !== i) other = true; } if (other) break; riv[c] = 0; }
      }
    }
    // ---- water levels, downstream first ----
    const wl = S.wl;
    const minV = i => { const x = i % N, y = (i / N) | 0; return Math.min(H[y * V + x], H[y * V + x + 1], H[(y + 1) * V + x], H[(y + 1) * V + x + 1]); };
    for (const L of lakes) if (L.ok) for (const i of L.tiles) wl[i] = L.lvl - 0.06;
    for (const i of order) {
      if (!riv[i] || isLake(i)) continue;
      const d = down[i]; const base = d < 0 || type[d] <= T.SEA ? SEA : (riv[d] || isLake(d)) ? wl[d] : SEA;
      wl[i] = Math.max(base, minV(i) - 0.3, SEA);
    }
    // steep stretches gather their descent into pools and falls instead of a hundred little steps
    const Pq = Rf.preset(o); const Q = 1.6 + Pq.peak * 0.035;
    const raw = Float32Array.from(wl);
    const drop3 = i => { let c = i, n = 0; while (n < 3) { const d = down[c]; if (d < 0 || type[d] <= T.SEA || !(riv[d] || isLake(d))) break; c = d; n++; } return n ? (raw[i] - raw[c]) / n : 0; };
    for (const i of order) {
      if (!riv[i] || isLake(i) || drop3(i) < 0.3) continue;
      const d = down[i]; const base = d < 0 || type[d] <= T.SEA ? SEA : (riv[d] || isLake(d)) ? wl[d] : SEA;
      wl[i] = Math.max(base, SEA + Math.floor((raw[i] - SEA) / Q) * Q + 0.02);
    }
    // a lake never sits below the river that feeds it, a river never runs uphill
    for (const i of order) if (isLake(i)) { const d = down[i]; if (d >= 0 && (riv[d] || isLake(d)) && wl[d] > wl[i]) wl[d] = wl[i]; }
    const rel = S.relief; rel.falls = []; rel.lakes = [];
    for (const i of order) {
      if (!riv[i] && !isLake(i)) continue;
      type[i] = T.RIVER;
      const d = down[i];
      if (d >= 0 && type[d] <= T.RIVER && (riv[d] || isLake(d)) && wl[i] - wl[d] > 0.8 && !isLake(i)) rel.falls.push({ x: i % N, y: (i / N) | 0, tx: d % N, ty: (d / N) | 0, drop: +(wl[i] - wl[d]).toFixed(2) });
    }
    for (const L of lakes) if (L.ok) { let sx = 0, sy = 0; for (const i of L.tiles) { sx += i % N; sy += (i / N) | 0; } rel.lakes.push({ x: sx / L.tiles.length + 0.5, y: sy / L.tiles.length + 0.5, n: L.tiles.length, lvl: +(L.lvl - 0.06).toFixed(2) }); }
    // ---- valleys: the banks fall toward the water ----
    const P = Rf.preset(o);
    const k = 0.95 + P.peak * 0.012;
    for (let i = 0; i < N * N; i++) {
      if (!riv[i]) continue;
      const x = i % N, y = (i / N) | 0;
      for (let vy = Math.max(0, y - 2); vy <= Math.min(N, y + 3); vy++) for (let vx = Math.max(0, x - 2); vx <= Math.min(N, x + 3); vx++) {
        const d = Math.max(0, Math.hypot(vx - (x + 0.5), vy - (y + 0.5)) - 0.72);
        const cap = wl[i] + 0.22 + d * k;
        const q = vy * V + vx; if (H[q] > cap) H[q] = cap;
      }
    }
    return { riv, down, order, acc };
  };

  // ------------------------------ where water meets land ------------------------------
  // banks sit exactly at the water's surface; beds under it; land always above the water beside it
  Rf.normalize = function (S, x0, y0, x1, y1) {
    const V = N + 1; const H = S.H; const type = S.type; const wl = S.wl;
    const all = x0 === undefined;
    const vx0 = all ? 0 : Math.max(0, x0 | 0), vy0 = all ? 0 : Math.max(0, y0 | 0), vx1 = all ? N : Math.min(N, Math.ceil(x1)), vy1 = all ? N : Math.min(N, Math.ceil(y1));
    for (let vy = vy0; vy <= vy1; vy++) for (let vx = vx0; vx <= vx1; vx++) {
      let tw = false, tl = false, wmax = -1e9, wmin = 1e9, sea = false;
      for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) {
        const x = vx + dx, y = vy + dy;
        if (!W.inb(x, y)) { tw = true; sea = true; wmax = Math.max(wmax, SEA); wmin = Math.min(wmin, SEA); continue; }
        const i = y * N + x;
        if (type[i] <= T.RIVER) { tw = true; const l = type[i] <= T.SEA ? SEA : wl[i]; if (type[i] <= T.SEA) sea = true; if (l > wmax) wmax = l; if (l < wmin) wmin = l; } else tl = true;
      }
      const k = vy * V + vx;
      if (tw && tl) H[k] = wmax;
      else if (tw) H[k] = Math.min(H[k], wmin - (sea ? 0.08 : 0.32));
      else H[k] = Math.max(H[k], SEA + 0.06);
    }
    // land next to a lake or a mountain river stands above its surface
    for (let y = Math.max(0, vy0 - 1); y < Math.min(N, vy1 + 1); y++) for (let x = Math.max(0, vx0 - 1); x < Math.min(N, vx1 + 1); x++) {
      const i = y * N + x;
      if (type[i] !== T.RIVER || wl[i] <= SEA + 0.05) continue;
      const lv = wl[i] + 0.05;
      for (let vy = Math.max(0, y - 1); vy <= Math.min(N, y + 2); vy++) for (let vx = Math.max(0, x - 1); vx <= Math.min(N, x + 2); vx++) {
        let water = false;
        for (let dy = -1; dy <= 0 && !water; dy++) for (let dx = -1; dx <= 0; dx++) { const tx = vx + dx, ty = vy + dy; if (!W.inb(tx, ty) || type[ty * N + tx] <= T.RIVER) { water = true; break; } }
        if (!water) { const k = vy * V + vx; if (H[k] < lv) H[k] = lv; }
      }
    }
  };

  // after the god (or a meteor) has changed the ground: water, banks and cliffs agree again
  Rf.fixArea = function (x0, y0, x1, y1) {
    const S = G.S; if (!S || !S.wl) return;
    for (let y = Math.max(0, y0 | 0); y <= Math.min(N - 1, y1 | 0); y++) for (let x = Math.max(0, x0 | 0); x <= Math.min(N - 1, x1 | 0); x++) { const i = y * N + x; if (S.type[i] <= T.SEA) S.wl[i] = SEA; }
    Rf.normalize(S, x0, y0, x1 + 1, y1 + 1);
    Rf.cliffs(S, x0 - 1, y0 - 1, x1 + 1, y1 + 1);
  };
  // ------------------------------ cliffs ------------------------------
  Rf.range = function (i) {
    const H = G.S.H; const V = N + 1; const x = i % N, y = (i / N) | 0;
    const a = H[y * V + x], b = H[y * V + x + 1], c = H[(y + 1) * V + x], d = H[(y + 1) * V + x + 1];
    return Math.max(a, b, c, d) - Math.min(a, b, c, d);
  };
  // cliff faces, and two cached arrays the hot paths read (how steep a tile is, how high it stands)
  Rf.cliffs = function (S, x0, y0, x1, y1) {
    if (!S.cliff || S.cliff.length !== N * N) S.cliff = new Uint8Array(N * N);
    if (!S.slope || S.slope.length !== N * N) { S.slope = new Float32Array(N * N); S.th = new Float32Array(N * N); x0 = y0 = x1 = y1 = undefined; }
    x0 = Math.max(0, x0 === undefined ? 0 : x0 | 0); y0 = Math.max(0, y0 === undefined ? 0 : y0 | 0);
    x1 = Math.min(N - 1, x1 === undefined ? N - 1 : x1 | 0); y1 = Math.min(N - 1, y1 === undefined ? N - 1 : y1 | 0);
    const H = S.H; const V = N + 1;
    let n = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * N + x;
      const a = H[y * V + x], b = H[y * V + x + 1], cc = H[(y + 1) * V + x], d = H[(y + 1) * V + x + 1];
      const rg = Math.max(a, b, cc, d) - Math.min(a, b, cc, d);
      S.slope[i] = rg; S.th[i] = (a + b + cc + d) * 0.25;
      const c = S.type[i] >= T.SAND && rg > Rf.CLIFF ? 1 : 0;
      if (S.cliff[i] !== c) { S.cliff[i] = c; n++; }
    }
    if (n) { S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand && W.invalidateLand(); }
  };

  // ------------------------------ ways down ------------------------------
  // a plateau or a valley walled in by cliffs gets a ramp cut into its rim, so no people is trapped
  Rf.connect = function (S) {
    const V = N + 1; const H = S.H; const type = S.type;
    const walk = i => type[i] >= T.RIVER && !S.cliff[i];
    for (let round = 0; round < 6; round++) {
      Rf.cliffs(S);
      // physical landmasses (cliffs included) and, inside each, the walkable pieces
      const mass = new Int32Array(N * N).fill(-1), comp = new Int32Array(N * N).fill(-1);
      const flood = (arr, i, id, ok) => { const st = [i]; arr[i] = id; let n = 0; while (st.length) { const a = st.pop(); n++; const x = a % N, y = (a / N) | 0; if (x > 0 && arr[a - 1] < 0 && ok(a - 1)) { arr[a - 1] = id; st.push(a - 1); } if (x < N - 1 && arr[a + 1] < 0 && ok(a + 1)) { arr[a + 1] = id; st.push(a + 1); } if (y > 0 && arr[a - N] < 0 && ok(a - N)) { arr[a - N] = id; st.push(a - N); } if (y < N - 1 && arr[a + N] < 0 && ok(a + N)) { arr[a + N] = id; st.push(a + N); } } return n; };
      let nm = 0; for (let i = 0; i < N * N; i++) if (mass[i] < 0 && type[i] >= T.RIVER) flood(mass, i, nm++, j => type[j] >= T.RIVER);
      const sizes = [], massOf = []; let nc = 0;
      for (let i = 0; i < N * N; i++) if (comp[i] < 0 && walk(i)) { sizes.push(flood(comp, i, nc, walk)); massOf.push(mass[i]); nc++; }
      const mainOf = {};
      for (let c = 0; c < nc; c++) { const m = massOf[c]; if (mainOf[m] === undefined || sizes[c] > sizes[mainOf[m]]) mainOf[m] = c; }
      let fixed = 0;
      for (let c = 0; c < nc; c++) {
        const m = massOf[c]; const main = mainOf[m];
        if (c === main || sizes[c] < 10) continue;
        // nearest tile of the main piece (through cliffs)
        const dist = new Int32Array(N * N).fill(-1), from = new Int32Array(N * N).fill(-1); const q = [];
        for (let i = 0; i < N * N; i++) if (comp[i] === c) { dist[i] = 0; from[i] = i; q.push(i); }
        let hit = -1;
        for (let h = 0; h < q.length && hit < 0; h++) {
          const a = q[h]; const x = a % N, y = (a / N) | 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx;
            if (dist[j] >= 0 || type[j] < T.RIVER) continue;
            dist[j] = dist[a] + 1; from[j] = from[a]; q.push(j);
            if (comp[j] === main) { hit = j; break; }
          }
        }
        if (hit < 0) continue;
        const a = from[hit]; const ax = a % N + 0.5, ay = ((a / N) | 0) + 0.5, bx = hit % N + 0.5, by = ((hit / N) | 0) + 0.5;
        const ha = W.tileH(a), hb = W.tileH(hit);
        let len = Math.hypot(bx - ax, by - ay) || 1; const ux = (bx - ax) / len, uy = (by - ay) / len;
        const need = Math.abs(ha - hb) / 1.25 + 1; const ext = Math.max(1, (need - len) / 2);
        const sx = ax - ux * ext, sy = ay - uy * ext, ex = bx + ux * ext, ey = by + uy * ext;
        const hs = W.hAt(G.clamp(sx, 0, N - 0.01), G.clamp(sy, 0, N - 0.01)), he = W.hAt(G.clamp(ex, 0, N - 0.01), G.clamp(ey, 0, N - 0.01));
        len = Math.hypot(ex - sx, ey - sy);
        const x0 = Math.max(0, Math.floor(Math.min(sx, ex) - 3)), x1 = Math.min(N, Math.ceil(Math.max(sx, ex) + 3));
        const y0 = Math.max(0, Math.floor(Math.min(sy, ey) - 3)), y1 = Math.min(N, Math.ceil(Math.max(sy, ey) + 3));
        for (let vy = y0; vy <= y1; vy++) for (let vx = x0; vx <= x1; vx++) {
          // skip vertices on the water's edge
          let wet = false; for (let dy = -1; dy <= 0 && !wet; dy++) for (let dx = -1; dx <= 0; dx++) { const tx = vx + dx, ty = vy + dy; if (W.inb(tx, ty) && type[ty * N + tx] <= T.RIVER) { wet = true; break; } }
          if (wet) continue;
          const t = G.clamp(((vx - sx) * ux + (vy - sy) * uy) / len, 0, 1);
          const px = sx + (ex - sx) * t, py = sy + (ey - sy) * t; const d = Math.hypot(vx - px, vy - py);
          const wgt = 1 - G.smooth(1.1, 2.2, d); if (wgt <= 0) continue;
          const k = vy * V + vx; const target = hs + (he - hs) * t;
          H[k] = H[k] + (target - H[k]) * wgt;
        }
        if (Math.abs(ha - hb) > 3) S.relief.passes.push({ x: (ax + bx) / 2, y: (ay + by) / 2, kind: 'rampa' });
        fixed++;
      }
      if (!fixed) break;
    }
    Rf.cliffs(S);
  };

  // ------------------------------ named places ------------------------------
  // the highest point of every range (and of lone mountains) becomes a peak with a name later
  Rf.findPeaks = function (S) {
    const V = N + 1; const H = S.H; const peaks = [];
    const isMax = (vx, vy, r) => { const h = H[vy * V + vx]; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (!dx && !dy) continue; const x = vx + dx, y = vy + dy; if (x < 0 || y < 0 || x > N || y > N) continue; if (H[y * V + x] > h) return false; } return true; };
    for (let vy = 2; vy < N - 1; vy++) for (let vx = 2; vx < N - 1; vx++) {
      const h = H[vy * V + vx]; if (h < SEA + 9) continue;
      if (isMax(vx, vy, 5)) peaks.push({ x: vx, y: vy, h: +h.toFixed(2) });
    }
    peaks.sort((a, b) => b.h - a.h);
    const out = [];
    for (const p of peaks) if (!out.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 9)) out.push(p);
    S.relief.peaks = out.slice(0, Math.max(3, Math.round(N / 14)));
  };

  // names: every range, peak, pass, waterfall and lake of the world gets one
  const PM = ['Lobo', 'Corvo', 'Vento', 'Trovão', 'Gigante', 'Velho', 'Urso', 'Falcão', 'Sol', 'Dragão', 'Eremita', 'Pastor', 'Rei', 'Silêncio', 'Gelo', 'Fogo', 'Guardião', 'Chifre', 'Carneiro', 'Touro'];
  const PF = ['Águia', 'Névoa', 'Lua', 'Aurora', 'Coroa', 'Sentinela', 'Serpente', 'Viúva', 'Donzela', 'Estrela', 'Garça', 'Neve', 'Brisa', 'Rainha', 'Lança', 'Espada', 'Harpa', 'Cabra'];
  const S1 = ['Al', 'Bar', 'Cor', 'Dor', 'El', 'Gor', 'Kar', 'Mor', 'Nar', 'Or', 'Tar', 'Vel', 'Zor', 'Ar', 'Is', 'Um', 'Tor', 'Ul'];
  const S2 = ['dor', 'gan', 'mir', 'ath', 'ul', 'en', 'ras', 'bel', 'ion', 'ak', 'or', 'ith', 'une', 'ara'];
  Rf.nameAll = function (S) {
    const rng = G.mulberry32((S.seed ^ 0x5eed) >>> 0); const pk = a => a[Math.floor(rng() * a.length)];
    const used = new Set();
    const uniq = f => { for (let k = 0; k < 30; k++) { const n = f(); if (!used.has(n)) { used.add(n); return n; } } return f() + ' ' + (used.size + 1); };
    const proper = () => pk(S1) + pk(S2);
    const ofM = () => 'do ' + pk(PM), ofF = () => 'da ' + pk(PF), of = () => (rng() < 0.5 ? ofM() : ofF());
    const rel = S.relief;
    for (const R of rel.ranges) { R.name = uniq(() => pk([() => 'Cordilheira ' + proper(), () => 'Serra ' + of(), () => 'Montes ' + pk(['Azuis', 'Brancos', 'Partidos', 'Sombrios', 'Dourados', 'do Fim']), () => 'Espinhaço ' + of()])()); R.pts = R.pts.filter((p, k) => k % 3 === 0).map(p => [+p[0].toFixed(1), +p[1].toFixed(1)]); }
    for (const p of rel.peaks) p.name = uniq(() => pk([() => 'Monte ' + proper(), () => 'Pico ' + of(), () => 'Agulha ' + ofF(), () => 'Cume ' + ofM(), () => 'Dente ' + ofM(), () => proper()])());
    for (const p of rel.passes) { p.x = +p.x.toFixed(1); p.y = +p.y.toFixed(1); p.name = uniq(() => p.kind === 'rampa' ? pk([() => 'Trilha ' + of(), () => 'Escadaria ' + ofF(), () => 'Subida ' + ofM()])() : pk([() => 'Passo ' + of(), () => 'Garganta ' + ofM(), () => 'Portela dos Ventos', () => 'Boqueirão ' + ofM(), () => 'Passo ' + proper()])()); }
    // only the great falls get a name (a mountain world has a hundred little ones)
    const falls = rel.falls.slice().sort((a, b) => b.drop - a.drop).filter(f => f.drop >= 1.5).slice(0, Math.max(3, Math.round(N / 14)));
    for (const f of falls) f.name = uniq(() => pk([() => 'Cachoeira ' + of(), () => 'Salto ' + ofM(), () => 'Véu ' + ofF(), () => 'Queda ' + proper()])());
    for (const l of rel.lakes) { l.x = +l.x.toFixed(1); l.y = +l.y.toFixed(1); if (l.n < 5) continue; l.name = uniq(() => pk([() => 'Lago ' + proper(), () => 'Lago ' + ofM(), () => 'Lagoa ' + ofF(), () => 'Lago Espelho', () => 'Lago dos Juncos', () => 'Lagoa Funda'])()); }
  };
  // heights as the peoples would count them
  Rf.meters = h => Math.max(0, Math.round((h - SEA) * 150 / 10) * 10);
  Rf.metersTxt = h => Rf.meters(h).toLocaleString('pt-BR') + ' m';
  // the named places, for maps, the book and the camera
  Rf.places = function () {
    const S = G.S; const rel = S && S.relief; if (!rel) return [];
    const out = [];
    for (const p of rel.peaks || []) if (p.name) out.push({ kind: 'pico', name: p.name, x: p.x, y: p.y, h: p.h, alt: Rf.metersTxt(p.h) });
    for (const p of rel.passes || []) if (p.name && p.kind === 'passo') out.push({ kind: 'passo', name: p.name, x: p.x, y: p.y });
    for (const f of rel.falls || []) if (f.name) out.push({ kind: 'cachoeira', name: f.name, x: f.tx + 0.5, y: f.ty + 0.5, drop: f.drop, alt: Math.round(f.drop * 150 / 5) * 5 + ' m de queda' });
    for (const l of rel.lakes || []) if (l.name) out.push({ kind: 'lago', name: l.name, x: l.x, y: l.y, n: l.n, alt: Rf.metersTxt(l.lvl) + ' de altitude' });
    return out;
  };

  // ------------------------------ helpers ------------------------------
  // water surface of a tile (rivers and lakes can sit high in the mountains)
  Rf.waterLevel = i => { const S = G.S; return S.wl && S.type[i] === T.RIVER ? S.wl[i] : SEA; };
})(window.G);
