'use strict';
// ============================================================
//  Nature: trees, bushes, rocks, fire, weather, ground state
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Nat = G.Nature = {};
  // how much wild the land can hold grows with the land itself
  let landN = 0, landKey = null;
  Nat.landTiles = function () {
    const S = G.S; if (landKey === S && landN) return landN;
    landKey = S; landN = 0; for (let i = 0; i < S.type.length; i++) if (S.type[i] >= T.SAND) landN++;
    return landN;
  };
  const maxTrees = () => Math.max(1100, Math.round(Nat.landTiles() * 0.42));
  const wildTarget = () => Math.max(380, Math.round(Nat.landTiles() * 0.14));
  const WOOD = { palm: 3, pine: 5, snowpine: 4, oak: 6, birch: 5, jungle: 8, acacia: 3, baobab: 7, cactus: 1, willow: 4 };

  Nat.id = () => G.S.nextId++;
  Nat.dirty = new Set(); // tiles whose look changed (for terrain cache)
  Nat.markDirty = i => Nat.dirty.add(i);

  // ------------------------------ trees ------------------------------
  Nat.addTree = function (x, y, kind, size) {
    const S = G.S; const i = W.idx(x, y);
    if (S.treeAt[i] || S.objAt[i] || S.occ[i]) return null;
    const t = {
      id: Nat.id(), x, y, kind, size: size, maxSize: kind === 'palm' || kind === 'cactus' ? 1 : kind === 'jungle' || kind === 'baobab' ? 1 + G.R() * 0.25 : 0.85 + G.R() * 0.3,
      stage: 'grow', wood: 0, chop: 0, claim: 0, v: Math.floor(G.R() * 3), ph: G.R() * 6.28, fallT: 0, fallDir: 1, t: 0,
    };
    if (t.size > t.maxSize) t.maxSize = t.size;
    S.trees.set(t.id, t); S.treeAt[i] = t.id;
    return t;
  };
  Nat.removeTree = function (t) {
    const S = G.S; S.trees.delete(t.id);
    const i = W.idx(t.x, t.y); if (S.treeAt[i] === t.id) S.treeAt[i] = 0;
  };
  Nat.treeWood = t => Math.max(1, Math.round((WOOD[t.kind] || 5) * t.size));
  Nat.isChoppable = t => t.kind !== 'cactus' && ((t.stage === 'grow' && t.size >= 0.6) || t.stage === 'log' || t.stage === 'burnt');
  Nat.fellTree = function (t, dir) {
    const wasBurnt = t.stage === 'burnt';
    t.wood = wasBurnt ? 2 : Nat.treeWood(t);
    t.burntLog = wasBurnt;
    t.stage = 'fall'; t.fallT = 0; t.fallDir = dir || (G.R() < 0.5 ? -1 : 1);
    G.S.stats.treesFelled++;
    G.Audio && G.Audio.at(t.x, t.y, 'treeFall');
  };

  // ------------------------------ rocks & bushes ------------------------------
  Nat.addRock = function (x, y, stone) {
    const S = G.S; const i = W.idx(x, y);
    if (S.treeAt[i] || S.objAt[i] || S.occ[i]) return null;
    const r = { id: Nat.id(), x: x + (G.R() - 0.5) * 0.2, y: y + (G.R() - 0.5) * 0.2, stone, max: stone, claim: 0, v: Math.floor(G.R() * 3), meteor: false };
    S.rocks.set(r.id, r); S.objAt[i] = r.id; return r;
  };
  Nat.removeRock = function (r) { const S = G.S; S.rocks.delete(r.id); const i = W.idx(r.x, r.y); if (S.objAt[i] === r.id) S.objAt[i] = 0; };
  Nat.addBush = function (x, y) {
    const S = G.S; const i = W.idx(x, y);
    if (S.treeAt[i] || S.objAt[i] || S.occ[i]) return null;
    const b = { id: Nat.id(), x: x + (G.R() - 0.5) * 0.3, y: y + (G.R() - 0.5) * 0.3, berries: 2 + Math.floor(G.R() * 4), max: 5, grow: 0, claim: 0, v: Math.floor(G.R() * 3), burnt: 0 };
    S.bushes.set(b.id, b); S.objAt[i] = b.id; return b;
  };
  Nat.removeBush = function (b) { const S = G.S; S.bushes.delete(b.id); const i = W.idx(b.x, b.y); if (S.objAt[i] === b.id) S.objAt[i] = 0; };

  // ------------------------------ zones (miracles) ------------------------------
  Nat.zoneMul = function (x, y, kind) {
    let m = 1;
    for (const z of G.S.zones) if (z.kind === kind && G.dist2(x, y, z.x, z.y) < z.r * z.r) m += z.power || 2;
    return m;
  };

  // ------------------------------ fire ------------------------------
  Nat.fireSet = new Set();
  Nat.rebuildFire = function () { Nat.fireSet.clear(); const F = G.S.fire; for (let i = 0; i < F.length; i++) if (F[i] > 0) Nat.fireSet.add(i); };
  Nat.fuel = function (i) {
    const S = G.S;
    const tid = S.treeAt[i]; if (tid) { const t = S.trees.get(tid); if (t && (t.stage === 'grow' || t.stage === 'log') && t.size > 0.25) return 'tree'; }
    const bid = S.occ[i]; if (bid) { const b = S.buildings.get(bid); if (b && b.hp > 0 && b.type !== 'campfire' && b.type !== 'well' && b.type !== 'ruin' && b.type !== 'monument') return b.type === 'farm' ? 'crop' : 'building'; }
    const oid = S.objAt[i]; if (oid && S.bushes.has(oid)) return 'bush';
    const ty = S.type[i];
    if ((ty === T.GRASS || ty === T.MEADOW) && S.burnt[i] <= 0 && S.scar[i] <= 0 && G.Biome.grassFire(i) > 0) return 'grass';
    return null;
  };
  Nat.ignite = function (i, f) {
    const S = G.S; if (i < 0 || i >= N * N) return false;
    if (!Nat.fuel(i)) return false;
    if (S.wet[i] > 0.5 && f < 0.9) return false;
    if (S.fire[i] <= 0) S.fireT[i] = 0;
    S.fire[i] = Math.max(S.fire[i], f || 0.35);
    Nat.fireSet.add(i);
    return true;
  };
  Nat.extinguish = function (i, amount) {
    const S = G.S; if (S.fire[i] <= 0) return;
    S.fire[i] -= amount; S.wet[i] = Math.min(1, S.wet[i] + amount * 0.8);
    if (S.fire[i] <= 0.02) { S.fire[i] = 0; Nat.fireSet.delete(i); }
  };
  const NB8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function updateFire(dt) {
    const S = G.S; const wth = S.weather;
    const dry = 1 + (wth.drought > 0 ? 0.9 : 0) - wth.rain * 0.8;
    const wx = Math.cos(wth.windA), wy = Math.sin(wth.windA);
    const toIgnite = [];
    for (const i of Nat.fireSet) {
      const fuel = Nat.fuel(i);
      let f = S.fire[i];
      const x = i % N, y = (i / N) | 0;
      if (!fuel) f -= 0.45 * dt;
      else f = Math.min(fuel === 'grass' ? 0.55 : 1, f + 0.22 * dt);
      f -= (S.wet[i] * 0.9 + wth.rain * 0.7 + Nat.rainAt(x + 0.5, y + 0.5) * 1.6) * dt;
      S.fireT[i] += dt;
      if (fuel === 'tree' && S.fireT[i] > 13) {
        const t = S.trees.get(S.treeAt[i]); if (t) { t.stage = 'burnt'; t.t = 0; t.claim = 0; }
        S.burnt[i] = G.DAY_LEN * 2.2; Nat.markDirty(i);
      } else if ((fuel === 'grass' || fuel === 'crop') && S.fireT[i] > 4.5) {
        S.burnt[i] = G.DAY_LEN * 1.6; Nat.markDirty(i);
        if (fuel === 'crop') { const b = S.buildings.get(S.occ[i]); if (b && b.crops) { const k = G.Village.farmTileIndex(b, x, y); if (k >= 0) { b.crops[k].g = 0; b.crops[k].s = 0; } } }
      } else if (fuel === 'bush' && S.fireT[i] > 5) {
        const b = S.bushes.get(S.objAt[i]); if (b) { b.berries = 0; b.burnt = G.DAY_LEN; }
        S.burnt[i] = G.DAY_LEN * 1.5; Nat.markDirty(i);
      } else if (fuel === 'building') {
        const b = S.buildings.get(S.occ[i]);
        if (b) G.Village.damageBuilding(b, (b.built ? 5 : 9) * f * dt / Math.max(1, b.w * b.h) * 1.3, 'fire');
      }
      if (f <= 0.01) { S.fire[i] = 0; S.fireT[i] = 0; Nat.fireSet.delete(i); continue; }
      S.fire[i] = f;
      // spread
      if (f > 0.2) {
        for (const [dx, dy] of NB8) {
          const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
          const j = ny * N + nx; if (S.fire[j] > 0) continue;
          const fu = Nat.fuel(j); if (!fu) continue;
          const base = (fu === 'tree' ? 0.24 : fu === 'building' ? 0.2 : fu === 'bush' ? 0.24 : fu === 'crop' ? 0.18 : 0.045) * (fu === 'building' || fu === 'crop' ? 1 : Math.max(0.1, G.Biome.grassFire(j)));
          const wind = 1 + ((dx * wx + dy * wy) / Math.hypot(dx, dy)) * wth.windS * 1.6;
          const diag = (dx && dy) ? 0.6 : 1;
          const p = f * base * dry * wind * diag * (1 - S.wet[j]) * dt;
          if (G.R() < p) toIgnite.push(j);
        }
      }
    }
    for (const j of toIgnite) Nat.ignite(j, 0.3);
  }

  // ------------------------------ rain clouds ------------------------------
  Nat.addCloud = function (x, y, r, life, kind) {
    const c = { x, y, r, life, max: life, kind, vx: 0, vy: 0, ph: G.R() * 10, strike: G.rr(2, 6) };
    if (kind !== 'divine') { c.vx = Math.cos(G.S.weather.windA) * 0.35; c.vy = Math.sin(G.S.weather.windA) * 0.35; }
    G.S.clouds.push(c); return c;
  };
  Nat.rainAt = function (x, y) {
    let r = 0;
    for (const c of G.S.clouds) {
      const d2 = G.dist2(x, y, c.x, c.y); if (d2 < c.r * c.r) r = Math.max(r, Nat.cloudIntensity(c));
    }
    return r;
  };
  Nat.cloudIntensity = c => {
    const a = Math.min(1, (c.max - c.life) / 2.5), b = Math.min(1, c.life / 3);
    return Math.min(a, b) * (c.kind === 'natural' ? 0.6 : 1);
  };
  function updateClouds(dt) {
    const S = G.S;
    for (let k = S.clouds.length - 1; k >= 0; k--) {
      const c = S.clouds[k];
      c.life -= dt; c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.life <= 0 || c.x < -8 || c.y < -8 || c.x > N + 8 || c.y > N + 8) { S.clouds.splice(k, 1); continue; }
      const inten = Nat.cloudIntensity(c);
      // wet the ground under the cloud
      const r = Math.ceil(c.r);
      for (let y = Math.floor(c.y - r); y <= c.y + r; y++) for (let x = Math.floor(c.x - r); x <= c.x + r; x++) {
        if (!W.inb(x, y)) continue;
        if (G.dist2(x + 0.5, y + 0.5, c.x, c.y) > c.r * c.r) continue;
        const i = y * N + x;
        S.wet[i] = Math.min(1, S.wet[i] + inten * dt * 0.25);
        if (S.fire[i] > 0) Nat.extinguish(i, inten * dt * 0.9);
      }
      if (c.kind === 'storm') {
        c.strike -= dt;
        if (c.strike <= 0) {
          c.strike = G.rr(5, 12);
          const a = G.R() * 6.28, d = G.R() * c.r;
          G.Powers.naturalLightning(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d);
        }
      }
    }
  }

  // ------------------------------ weather ------------------------------
  function updateWeather(dt) {
    const S = G.S; const w = S.weather;
    // wind slowly wanders
    w.windA += (G.R() - 0.5) * 0.02 * dt;
    const targetWind = w.storm > 0 ? 0.95 : w.drought > 0 ? 0.45 : 0.3;
    w.windS += (targetWind - w.windS) * 0.1 * dt;
    if (w.storm > 0) {
      w.storm -= dt;
      w.rain = Math.min(0.85, w.rain + dt * 0.1);
      const storms = S.clouds.filter(c => c.kind === 'storm').length;
      if (storms < 4 && G.R() < dt * 0.6) {
        const lx = G.rr(8, N - 8), ly = G.rr(8, N - 8);
        Nat.addCloud(lx, ly, G.rr(6, 9), G.rr(25, 40), 'storm');
      }
      if (w.storm <= 0) G.Village.log('A tempestade passou.', 'storm');
    } else {
      w.rain = Math.max(0, w.rain - dt * 0.08);
    }
    if (w.drought > 0) {
      w.drought -= dt;
      if (w.drought <= 0) { w.drought = 0; G.Village.log('A seca terminou. A terra respira de novo.', 'rain'); }
    } else if (w.storm <= 0) {
      // occasional gentle natural showers
      const naturals = S.clouds.filter(c => c.kind === 'natural').length;
      if (naturals < 2 && G.R() < dt * 0.006) {
        const a = w.windA + Math.PI; // come from upwind side
        const x = N / 2 + Math.cos(a) * N * 0.55 + G.rr(-10, 10), y = N / 2 + Math.sin(a) * N * 0.55 + G.rr(-10, 10);
        Nat.addCloud(x, y, G.rr(4, 6.5), G.rr(60, 110), 'natural');
      }
    }
  }

  // ------------------------------ slow ground updates ------------------------------
  function slowUpdate(dt) {
    const S = G.S;
    const dayF = dt / G.DAY_LEN;
    const drought = S.weather.drought > 0;
    // tiles
    for (let i = 0; i < N * N; i++) {
      if (S.wet[i] > 0) S.wet[i] = Math.max(0, S.wet[i] - dayF * (drought ? 3 : 1.6));
      if (S.burnt[i] > 0) { const before = S.burnt[i]; S.burnt[i] -= dt; if (S.burnt[i] <= 0 || (before > G.DAY_LEN * 0.5 && S.burnt[i] <= G.DAY_LEN * 0.5)) Nat.markDirty(i); if (S.burnt[i] < 0) S.burnt[i] = 0; }
      if (S.scar[i] > 0) { const before = S.scar[i]; S.scar[i] -= dt; if (S.scar[i] <= 0 || (before > G.DAY_LEN * 2 && S.scar[i] <= G.DAY_LEN * 2)) Nat.markDirty(i); if (S.scar[i] < 0) S.scar[i] = 0; }
      if (S.bloom[i] > 0) { S.bloom[i] -= dt; if (S.bloom[i] <= 0) { S.bloom[i] = 0; Nat.markDirty(i); } }
      // footpaths fade slowly if unused
      if (S.wear[i] > 0) {
        const lvBefore = G.pathLevel(S.wear[i]);
        S.wear[i] = Math.max(0, S.wear[i] - dayF * 5);
        if (G.pathLevel(S.wear[i]) !== lvBefore) Nat.markDirty(i);
      }
    }
    // trees
    let nTrees = S.trees.size; const MAX = maxTrees();
    for (const t of S.trees.values()) {
      if (t.stage === 'grow') {
        if (t.size < t.maxSize) {
          const i = W.idx(t.x, t.y);
          const rate = (0.22 + S.fert[i] * 0.2) * (drought ? 0.35 : 1) * (1 + S.wet[i]) * Nat.zoneMul(t.x, t.y, 'growth') * G.Biome.def(i).grow;
          t.size = Math.min(t.maxSize, t.size + rate * dayF);
        } else if (nTrees < MAX && G.R() < dayF * (t.kind === 'palm' ? 0.03 : t.kind === 'cactus' ? 0.015 : 0.07) * (drought ? 0.2 : 1) * G.Biome.def(W.idx(t.x, t.y)).grow) {
          const a = G.R() * 6.28, d = G.rr(1, 2.4);
          const nx = t.x + Math.cos(a) * d, ny = t.y + Math.sin(a) * d;
          if (W.inb(nx, ny)) {
            const j = W.idx(nx, ny);
            const ok = G.Biome.canGrow(t.kind, j);
            if (ok && S.wear[j] < 10 && !nearBuilding(nx, ny) && S.burnt[j] <= 0 && S.scar[j] <= 0) {
              if (Nat.addTree(Math.floor(nx) + 0.5 + G.rr(-0.2, 0.2), Math.floor(ny) + 0.5 + G.rr(-0.2, 0.2), t.kind, 0.12)) nTrees++;
            }
          }
        }
      } else if (t.stage === 'stump') {
        t.t += dt;
        if (t.t > G.DAY_LEN * 1.4) {
          if (G.R() < 0.45 && !nearBuilding(t.x, t.y)) { t.stage = 'grow'; t.size = 0.12; t.t = 0; t.chop = 0; t.claim = 0; }
          else Nat.removeTree(t);
        }
      } else if (t.stage === 'burnt') {
        t.t += dt; if (t.t > G.DAY_LEN * 1.2) { t.stage = 'stump'; t.t = 0; t.claim = 0; }
      }
    }
    // the wild slowly reclaims empty land
    const WILD = wildTarget();
    if (nTrees < WILD && !drought) {
      const want = dayF * (WILD - nTrees) * 0.18;
      let n = Math.floor(want) + (G.R() < want % 1 ? 1 : 0);
      const trees = n ? [...S.trees.values()] : null;
      while (n-- > 0) {
        let x, y;
        if (trees.length && G.R() < 0.75) { const p = G.pick(trees); const a = G.R() * 6.28, d = G.rr(1, 3.5); x = p.x + Math.cos(a) * d; y = p.y + Math.sin(a) * d; }
        else { x = G.rr(2, N - 2); y = G.rr(2, N - 2); }
        if (!W.inb(x, y)) continue;
        const j = W.idx(x, y); const ty = S.type[j];
        const kind = G.Biome.pickTree(G.Biome.of(j));
        if ((ty === T.GRASS || ty === T.MEADOW || ty === T.SAND) && G.Biome.canGrow(kind, j) && G.R() < Math.max(0.15, G.Biome.def(j).dens) && S.wear[j] < 10 && !nearBuilding(x, y) && S.burnt[j] <= 0 && S.scar[j] <= 0 && !S.objAt[j]) {
          let farFromHome = true; for (const s of S.settlements.values()) if (G.dist2(x, y, s.cx, s.cy) < 36) { farFromHome = false; break; }
          if (farFromHome && Nat.addTree(Math.floor(x) + 0.5 + G.rr(-0.2, 0.2), Math.floor(y) + 0.5 + G.rr(-0.2, 0.2), kind, 0.12)) nTrees++;
        }
      }
    }
    // bushes
    for (const b of S.bushes.values()) {
      if (b.burnt > 0) { b.burnt -= dt; continue; }
      if (b.berries < b.max) {
        const i = W.idx(b.x, b.y);
        b.grow += dayF * 4.2 * (0.6 + S.fert[i]) * (drought ? 0.3 : 1) * (1 + S.wet[i] * 0.8) * Nat.zoneMul(b.x, b.y, 'fertility') * Nat.zoneMul(b.x, b.y, 'growth');
        while (b.grow >= 1 && b.berries < b.max) { b.grow -= 1; b.berries++; }
      }
    }
    // zones expire
    for (let k = S.zones.length - 1; k >= 0; k--) { S.zones[k].t -= dt; if (S.zones[k].t <= 0) S.zones.splice(k, 1); }
  }
  function nearBuilding(x, y) {
    const S = G.S;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.occ[W.idx(nx, ny)]) return true;
    }
    return false;
  }
  G.pathLevel = w => (w < 14 ? 0 : w < 28 ? 1 : w < 45 ? 2 : 3);

  let fireAcc = 0, slowAcc = 0;
  Nat.update = function (dt) {
    fireAcc += dt; slowAcc += dt;
    if (fireAcc >= 0.2) { updateFire(fireAcc); fireAcc = 0; }
    updateClouds(dt);
    updateWeather(dt);
    if (slowAcc >= 1) { slowUpdate(slowAcc); slowAcc = 0; }
    for (const t of G.S.trees.values()) if (t.stage === 'fall') { t.fallT += dt; if (t.fallT > 0.9) { t.stage = 'log'; } }
  };
})(window.G);
