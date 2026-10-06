'use strict';
// ============================================================
//  Naval: docks, fishing boats and fish shoals, explorers that
//  find other peoples, merchant fleets on sea routes, warships
//  and naval battles, sea raids, and colonists sailing to new
//  islands. Ships are real: they cost wood, carry people and
//  goods, and sink.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  const Nv = G.Naval = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const TAU = Math.PI * 2;
  const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
  let comp = null, compSize = [], compKey = null;
  let gS, came, seen, closed, gen = 1; const heap = new G.Heap();
  function alloc() { gS = new Float32Array(N * N); came = new Int32Array(N * N); seen = new Uint32Array(N * N); closed = new Uint32Array(N * N); comp = null; }
  alloc();
  G.mapHooks.push(n => { N = n; alloc(); });
  const water = i => G.S.type[i] <= T.SEA;

  Nv.SHIP = {
    pesca: { hp: 40, sp: 1.5, cost: 12 },
    explorador: { hp: 50, sp: 1.9, cost: 10 },
    mercante: { hp: 70, sp: 1.3, cost: 28 },
    guerra: { hp: 130, sp: 1.8, cost: 34, dmg: 11 },
    transporte: { hp: 95, sp: 1.55, cost: 22, dmg: 5 },
  };
  let tFleet = 0, tShoal = 0, tRoute = 0, tScan = 0;
  Nv.reset = function () { comp = null; tFleet = 2; tShoal = 0; tRoute = 5; tScan = 0; };

  // ------------------------------ seas ------------------------------
  function comps() {
    const S = G.S;
    if (comp && compKey === S) return;
    comp = new Int32Array(N * N).fill(-1); compSize = []; compKey = S;
    for (let i = 0; i < N * N; i++) {
      if (!water(i) || comp[i] >= 0) continue;
      const id = compSize.length; let n = 0; const st = [i]; comp[i] = id;
      while (st.length) {
        const a = st.pop(); n++; const x = a % N, y = (a / N) | 0;
        for (let k = 0; k < 4; k++) { const nx = x + DX[k], ny = y + DY[k]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (comp[j] < 0 && water(j)) { comp[j] = id; st.push(j); } }
      }
      compSize.push(n);
    }
  }
  Nv.invalidate = () => { comp = null; };
  Nv.compAt = (x, y) => { comps(); return W.inb(x, y) ? comp[W.idx(x, y)] : -1; };
  Nv.openSea = function (x, y) {
    comps();
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = Math.floor(x) + dx, ny = Math.floor(y) + dy; if (!W.inb(nx, ny)) continue; const c = comp[ny * N + nx]; if (c >= 0 && compSize[c] >= 80) return true; }
    return false;
  };
  function losWater(ax, ay, bx, by) { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 0.3); for (let k = 1; k < n; k++) { const f = k / n; if (!water(W.idx(ax + (bx - ax) * f, ay + (by - ay) * f))) return false; } return true; }
  function smooth(pts) {
    if (pts.length <= 2) return pts.slice(1);
    const out = []; let a = 0;
    while (a < pts.length - 1) { let b = Math.min(pts.length - 1, a + 30); while (b > a + 1 && !losWater(pts[a][0], pts[a][1], pts[b][0], pts[b][1])) b--; out.push(pts[b]); a = b; }
    return out;
  }
  Nv.seaPath = function (sx, sy, tx, ty, maxNodes) {
    if (!W.inb(sx, sy) || !W.inb(tx, ty)) return null;
    const s = W.idx(sx, sy), t = W.idx(tx, ty);
    if (!water(s) || !water(t)) return null;
    comps(); if (comp[s] !== comp[t]) return null;
    maxNodes = maxNodes || N * N;
    const tX = t % N, tY = (t / N) | 0;
    gen++; heap.clear(); gS[s] = 0; seen[s] = gen; came[s] = -1; heap.push(s, 0);
    let found = -1, nodes = 0;
    while (heap.size) {
      const a = heap.pop(); if (closed[a] === gen) continue; closed[a] = gen;
      if (a === t) { found = a; break; }
      if (++nodes > maxNodes) break;
      const ax = a % N, ay = (a / N) | 0;
      for (let k = 0; k < 8; k++) {
        const nx = ax + DX[k], ny = ay + DY[k]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const j = ny * N + nx; if (closed[j] === gen || !water(j)) continue;
        if (k >= 4 && (!water(ay * N + nx) || !water(ny * N + ax))) continue;
        const g = gS[a] + (k >= 4 ? 1.4142 : 1) * (G.S.type[j] === T.SEA ? 1.12 : 1);
        if (seen[j] !== gen || g < gS[j]) { seen[j] = gen; gS[j] = g; came[j] = a; const hx = Math.abs(nx - tX), hy = Math.abs(ny - tY); heap.push(j, g + Math.max(hx, hy) + 0.4142 * Math.min(hx, hy)); }
      }
    }
    if (found < 0) return null;
    const tiles = []; for (let c = found; c !== -1; c = came[c]) tiles.push(c); tiles.reverse();
    const pts = tiles.map(i => [(i % N) + 0.5, ((i / N) | 0) + 0.5]);
    pts[0] = [sx, sy]; pts[pts.length - 1] = [tx, ty];
    return smooth(pts);
  };
  function nearestWater(x, y, r) {
    let best = null, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const nx = Math.floor(x) + dx, ny = Math.floor(y) + dy; if (!W.inb(nx, ny) || !water(ny * N + nx)) continue; const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = [nx + 0.5, ny + 0.5]; } }
    return best;
  }

  // ------------------------------ docks ------------------------------
  Nv.docksOf = fid => { const out = []; for (const b of G.S.buildings.values()) if (b.type === 'doca' && b.built && G.Village.facOfSet(b.set) === fid) out.push(b); return out; };
  Nv.dockInfo = function (b) {
    if (b._dock && b._dockV === G.S.day) return b._dock;
    let best = [1, 0], bw = -1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let n = 0;
      for (let k = 0; k < b.w; k++) { const x = dx > 0 ? b.x + b.w : dx < 0 ? b.x - 1 : b.x + k, y = dy > 0 ? b.y + b.h : dy < 0 ? b.y - 1 : b.y + k; if (W.inb(x, y) && water(W.idx(x, y))) n++; }
      if (n > bw) { bw = n; best = [dx, dy]; }
    }
    b.wd = best;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    let moor = null;
    for (let r = 2.2; r < 5 && !moor; r += 0.4) { const x = cx + best[0] * r, y = cy + best[1] * r; if (W.inb(x, y) && water(W.idx(x, y))) moor = [Math.floor(x) + 0.5, Math.floor(y) + 0.5]; }
    if (!moor) moor = nearestWater(cx, cy, 5);
    const quay = moor ? (W.nearestLand(moor[0], moor[1], 4) || G.Vg.door(b)) : G.Vg.door(b);
    b._dock = { moor, quay }; b._dockV = G.S.day;
    return b._dock;
  };
  Nv.canSail = function (fac) { return G.Civ.has(fac.id, 'navegacao') && Nv.docksOf(fac.id).some(d => { const i = Nv.dockInfo(d); return i.moor && Nv.openSea(i.moor[0], i.moor[1]); }); };
  function homeDock(fac, near) {
    let best = null, bd = 1e9;
    for (const d of Nv.docksOf(fac.id)) { const i = Nv.dockInfo(d); if (!i.moor) continue; const dd = near ? G.dist(d.x, d.y, near.cx, near.cy) : 0; if (dd < bd) { bd = dd; best = d; } }
    return best;
  }
  // a beach near a settlement, reachable from the given sea region
  Nv.landing = function (set, seaComp) {
    comps(); const S = G.S; let best = null, bd = 1e9;
    const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let dy = -20; dy <= 20; dy++) for (let dx = -20; dx <= 20; dx++) {
      const x = cx + dx, y = cy + dy; if (!W.inb(x, y)) continue; const i = y * N + x;
      if (S.type[i] < T.SAND || !W.walkable(i) || S.type[i] === T.RIVER) continue;
      let wt = null;
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ax, ny = y + ay; if (W.inb(nx, ny) && water(ny * N + nx) && (seaComp === undefined || comp[ny * N + nx] === seaComp)) { wt = [nx + 0.5, ny + 0.5]; break; } }
      if (!wt) continue;
      const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = { land: [x + 0.5, y + 0.5], water: wt }; }
    }
    return best;
  };

  // ------------------------------ ships ------------------------------
  function spawn(kind, fac, dock, o) {
    const d = Nv.dockInfo(dock); if (!d.moor) return null;
    const def = Nv.SHIP[kind];
    if (fac.stock.wood < def.cost + (kind === 'pesca' ? 0 : 6)) return null;
    fac.stock.wood -= def.cost;
    const s = Object.assign({ id: G.S.nextId++, kind, fac: fac.id, civ: fac.civ || null, dock: dock.id, x: d.moor[0], y: d.moor[1], path: null, pi: 0, st: 'idle', t: 0, hp: def.hp, maxHp: def.hp, face: 1, crew: [], cd: 0, born: G.S.day }, o || {});
    G.S.ships.push(s);
    return s;
  }
  Nv.shipsOf = (fid, kind) => G.S.ships.filter(s => s.fac === fid && (!kind || s.kind === kind));
  function sailTo(s, x, y) { const p = Nv.seaPath(s.x, s.y, x, y); if (!p) return false; s.path = p; s.pi = 0; return true; }
  function moveShip(s, dt) {
    s.moving = false;
    if (!s.path || s.pi >= s.path.length) return true;
    const p = s.path[s.pi]; const dx = p[0] - s.x, dy = p[1] - s.y; const d = Math.hypot(dx, dy);
    const sp = Nv.SHIP[s.kind].sp * G.Civ.t(s.fac, 'naval') * (G.S.weather.storm > 0 ? 0.7 : 1) * (s.hp < s.maxHp * 0.4 ? 0.7 : 1) * (s.wind || 1) * dt;
    if (d <= sp) { s.x = p[0]; s.y = p[1]; s.pi++; } else { s.x += dx / d * sp; s.y += dy / d * sp; }
    if (Math.abs(dx - dy) > 0.02) G.faceTo(s, dx, dy);
    s.moving = true;
    if (G.R() < dt * 2.2) G.FX && G.FX.spawn({ x: s.x - dx / (d || 1) * 0.5, y: s.y - dy / (d || 1) * 0.5, h: G.SEA, z: 0, vz: 0, life: 1.4, s0: 1.5, s1: 4, c: 'rgba(255,255,255,0.45)', k: 2 });
    return s.pi >= s.path.length;
  }
  function home(s) { const d = G.S.buildings.get(s.dock); return d && d.type === 'doca' ? Nv.dockInfo(d) : null; }
  function removeShip(s) {
    const S = G.S; const k = S.ships.indexOf(s); if (k >= 0) S.ships.splice(k, 1);
    // nobody is left floating: whoever is still aboard steps ashore
    for (const id of s.crew || []) { const v = S.villagers.get(id); if (v && v.aboard === s.id) { v.aboard = 0; v.task = null; v.path = null; const p = W.nearestLand(s.x, s.y, 8); if (p) { v.x = p[0]; v.y = p[1]; } } }
  }
  Nv.sink = function (s, by, why) {
    const S = G.S; const f = G.Fac.get(s.fac);
    let drowned = 0;
    for (const id of s.crew) { const v = S.villagers.get(id); if (v && v.aboard === s.id) { v.aboard = 0; G.Village.kill(v, 'drown', why === 'god'); drowned++; } }
    const nm = shipName(s);
    if (s.kind !== 'pesca' || G.R() < 0.4) log(`${G.cap(nm)} de ${f ? f.name : 'um povo'} afundou${by ? ', atacad' + G.gen(nm) + ' por ' + (G.Fac.get(by.fac) || {}).name : why === 'storm' ? ' na tempestade' : why === 'fire' ? ' em chamas' : why === 'god' ? ' pela fúria do mar' : ''}${drowned ? ` — ${drowned} ${drowned > 1 ? 'afogados' : 'afogado'}` : ''}.`, 'naval', s.x, s.y);
    G.FX && G.FX.splash(s.x, s.y, 1.4);
    for (let k = 0; k < 8; k++) G.FX && G.FX.spawn({ x: s.x + G.rr(-0.5, 0.5), y: s.y + G.rr(-0.5, 0.5), h: G.SEA, z: G.rr(2, 8), vz: G.rr(10, 30), vx: G.rr(-0.6, 0.6), vy: G.rr(-0.6, 0.6), g: 60, life: G.rr(1, 2), s0: 1.6, s1: 1, c: '#6e4a2c', k: 0 });
    G.Audio && G.Audio.at(s.x, s.y, 'collapse', true);
    if (by) { const bf = G.Fac.get(by.fac); if (bf) bf.st.kills += drowned; }
    removeShip(s);
  };
  function shipName(s) {
    const c = G.CIVS[s.civ];
    if (s.kind === 'pesca') return 'um barco de pesca';
    if (s.kind === 'explorador') return 'um barco explorador';
    if (s.kind === 'mercante') return c ? (G.gen(c.units.trader) === 'a' ? 'uma ' : 'um ') + c.units.trader.toLowerCase() : 'um navio mercante';
    return c ? (G.gen(c.units.ship) === 'a' ? 'uma ' : 'um ') + c.units.ship.toLowerCase() : 'um navio de guerra';
  }
  Nv.shipName = shipName;
  Nv.aboard = id => G.S.ships.find(s => s.id === id);

  // ------------------------------ fishing ------------------------------
  function fishingSpot(s) {
    const S = G.S; comps(); const c = comp[W.idx(s.x, s.y)];
    let best = null, bd = 1e9;
    for (const f of S.fish) { if (comp[W.idx(f.x, f.y)] !== c) continue; const d = G.dist(s.x, s.y, f.x, f.y); if (d < 18 && d < bd) { bd = d; best = [f.x, f.y, f]; } }
    if (best) return best;
    for (let k = 0; k < 14; k++) {
      const a = G.R() * TAU, r = G.rr(3, 9); const x = s.x + Math.cos(a) * r, y = s.y + Math.sin(a) * r;
      if (!W.inb(x, y)) continue; const i = W.idx(x, y); if (!water(i) || comp[i] !== c) continue;
      let coast = false; for (let dy = -1; dy <= 1 && !coast; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = Math.floor(x) + dx, ny = Math.floor(y) + dy; if (W.inb(nx, ny) && !water(ny * N + nx)) { coast = true; break; } }
      if (!coast) return [Math.floor(x) + 0.5, Math.floor(y) + 0.5, null];
    }
    return null;
  }
  function runFishing(s, dt) {
    const S = G.S; const h = home(s); if (!h) return removeShip(s);
    s.t += dt;
    if (s.st !== 'back' && s.st !== 'idle' && threat(s, 6)) { if (sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; }
    switch (s.st) {
      case 'idle': if (s.t > 5 && !G.isNight() && !Nv.blockaded(G.S.buildings.get(s.dock))) { const sp = fishingSpot(s); if (sp && sailTo(s, sp[0], sp[1])) { s.st = 'out'; s.shoal = sp[2] ? sp[2].id : 0; } s.t = 0; } break;
      case 'out': if (moveShip(s, dt)) { s.st = 'fish'; s.t = 0; s.dur = G.rr(16, 26); } break;
      case 'fish': {
        if (G.R() < dt * 0.4) G.FX && G.FX.splash(s.x + G.rr(-0.4, 0.4), s.y + G.rr(-0.4, 0.4), 0.3);
        if (s.t > s.dur) {
          const sh = S.fish.find(f => f.id === s.shoal && G.dist(f.x, f.y, s.x, s.y) < 3);
          let n = G.rr(4, 8) * G.Civ.t(s.fac, 'fish') * (sh ? 1.8 : 1);
          if (sh) { sh.n -= n; if (sh.n <= 0) S.fish.splice(S.fish.indexOf(sh), 1); }
          s.cargo = Math.round(n); s.catchKind = G.Waters ? G.Waters.fishAt(s.x, s.y, true) : null;
          if (sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; else removeShip(s);
        }
        break;
      }
      case 'back': if (moveShip(s, dt)) { if (s.cargo) { if (G.Waters) G.Waters.landBoat(s); else G.Village.addStock('food', s.cargo, s.fac); G.FX && G.FX.floater(s.x, s.y, '+' + s.cargo, '#b8e070', 1.4); s.cargo = 0; } s.st = 'idle'; s.t = 0; if (s.hp < s.maxHp) s.hp = Math.min(s.maxHp, s.hp + 20); } break;
    }
  }
  function updateShoals(dt) {
    const S = G.S;
    for (const f of S.fish) f.t = (f.t || 0) + dt;
    S.fish = S.fish.filter(f => f.n > 0 && f.t < G.DAY_LEN * 6);
    if (S.fish.length >= Math.round(N / 14)) return;
    for (let k = 0; k < 20; k++) {
      const x = G.ri(3, N - 4), y = G.ri(3, N - 4); const i = y * N + x; if (!water(i)) continue;
      let land = 0, near = false;
      for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny) || water(ny * N + nx)) continue; land++; if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) near = true; }
      if (!land || near) continue;
      Nv.addShoal(x + 0.5, y + 0.5, G.rr(30, 50));
      return;
    }
  }
  Nv.addShoal = function (x, y, n) { const s = { id: G.S.nextId++, x, y, n, t: 0 }; G.S.fish.push(s); return s; };

  // ------------------------------ threats & combat ------------------------------
  function enemiesNear(s, r) {
    const out = [];
    for (const o of G.S.ships) if (o !== s && o.fac !== s.fac && G.Fac.atWar(s.fac, o.fac) && G.dist2(s.x, s.y, o.x, o.y) < r * r) out.push(o);
    return out;
  }
  function threat(s, r) { for (const o of enemiesNear(s, r)) if (o.kind === 'guerra') return o; return null; }
  function fire(s, o) {
    const def = Nv.SHIP[s.kind];
    let dmg = (def.dmg || 4) * G.rr(0.7, 1.3) * Math.min(1.4, G.Civ.t(s.fac, 'naval')) * (G.Civ.has(s.fac, 'bronze') ? 1.1 : 1) * (G.Civ.has(s.fac, 'ferro') ? 1.1 : 1);
    if (G.R() < 0.3) dmg *= 0; // miss
    o.hp -= dmg; o.hurt = 0.3;
    // arrows / fire arrows arc across the water
    G.FX && G.FX.spawn({ x: s.x, y: s.y, h: G.SEA, z: 6, vz: 30, vx: (o.x - s.x) * 1.1, vy: (o.y - s.y) * 1.1, g: 60, life: 0.9, s0: 1.2, s1: 1.2, c: '#ffcf6a', k: 4, layer: 1 });
    if (dmg > 0 && G.R() < 0.3) G.FX && G.FX.spawn({ x: o.x, y: o.y, h: G.SEA, z: 5, vz: 12, life: 1.2, s0: 2, s1: 6, c: 'rgba(80,70,65,0.5)', k: 2 });
    if (!s.announced && G.R() < 0.3) { s.announced = true; const a = G.Fac.get(s.fac), b = G.Fac.get(o.fac); if (a && b && (!G.S._navalLog || G.S.day - G.S._navalLog > 2)) { G.S._navalLog = G.S.day; log(`Batalha naval: navios de ${a.name} e ${b.name} trocam flechas no mar.`, 'naval', o.x, o.y); } }
    if (o.hp <= 0) Nv.sink(o, s);
  }
  function runWarship(s, dt) {
    const S = G.S; const h = home(s); if (!h) return removeShip(s);
    s.t += dt; s.cd -= dt;
    if (s.st === 'repair') { if (moveShip(s, dt)) { s.hp = Math.min(s.maxHp, s.hp + dt * 4); if (s.hp >= s.maxHp) { s.st = 'idle'; s.t = 0; } } return; }
    if (s.hp < s.maxHp * 0.35) { if (sailTo(s, h.moor[0], h.moor[1])) { s.st = 'repair'; return; } }
    // hunt the nearest enemy ship; transports first
    s.scan = (s.scan || 0) - dt;
    if (s.scan <= 0) {
      s.scan = 0.6;
      const es = enemiesNear(s, 13);
      es.sort((a, b) => (a.kind === 'transporte' ? -5 : 0) + G.dist(s.x, s.y, a.x, a.y) - ((b.kind === 'transporte' ? -5 : 0) + G.dist(s.x, s.y, b.x, b.y)));
      s.target = es.length ? es[0].id : 0;
    }
    const tg = s.target && S.ships.find(o => o.id === s.target);
    if (tg) {
      const d = G.dist(s.x, s.y, tg.x, tg.y);
      s.ramCd = (s.ramCd || 0) - dt;
      const hull = HULL[s.civ] || HULL.classico;
      // the bronze ram: row hard, straight at the enemy's side
      if (hull.ram && d < 3.2 && s.ramCd <= 0 && tg.kind !== 'pesca') {
        const sp = Nv.SHIP[s.kind].sp * 1.6 * dt; const k = Math.min(1, sp / Math.max(0.01, d));
        const nx = s.x + (tg.x - s.x) * k, ny = s.y + (tg.y - s.y) * k;
        if (W.inb(nx, ny) && water(W.idx(nx, ny))) { s.x = nx; s.y = ny; s.moving = true; s.path = null; }
        G.faceTo(s, tg.x - s.x, tg.y - s.y);
        if (d < 0.95) { s.ramCd = 7; ram(s, tg); }
        s.st = 'hunt'; return;
      }
      // boarding: hooks and the corvus bridge, and the enemy ship changes hands
      if (d < 1.3 && tg.hp < tg.maxHp * 0.45 && BOARD[s.civ] && tg.kind !== 'pesca' && s.cd <= 0) { s.cd = 2; if (board2(s, tg)) { s.target = 0; return; } }
      if (d > 2.4) { if (!s.path || s.pi >= s.path.length || (s.rt = (s.rt || 0) - dt) <= 0) { s.rt = 1.5; const w = nearestWater(tg.x, tg.y, 1) || [tg.x, tg.y]; sailTo(s, w[0], w[1]); } moveShip(s, dt); }
      else { s.moving = false; G.faceTo(s, tg.x - s.x, tg.y - s.y); if (s.cd <= 0) { s.cd = 1.3; fire(s, tg); } }
      s.st = 'hunt'; return;
    }
    if (s.st === 'hunt') { s.st = s.post ? 'blockade' : 'idle'; s.t = 0; s.path = null; }
    if (s.st === 'blockade') {
      const f = G.Fac.get(s.fac); if (!f || !f.fleet || !f.fleet.blockade || !s.post) { s.post = null; s.st = 'idle'; return; }
      if (!s.path || s.pi >= s.path.length) { if (G.dist(s.x, s.y, s.post[0], s.post[1]) > 1) sailTo(s, s.post[0], s.post[1]); }
      moveShip(s, dt); return;
    }
    // escort the people's own transports, otherwise patrol the home waters
    if (s.st === 'idle' && s.t > 3) {
      const tr = S.ships.find(o => o.fac === s.fac && o.kind === 'transporte' && (o.st === 'sail' || o.st === 'wait'));
      let p = null;
      if (tr) p = nearestWater(tr.x + G.rr(-1.5, 1.5), tr.y + G.rr(-1.5, 1.5), 2);
      else for (let k = 0; k < 8 && !p; k++) { const a = G.R() * TAU, r = G.rr(3, 11); const q = [h.moor[0] + Math.cos(a) * r, h.moor[1] + Math.sin(a) * r]; if (W.inb(q[0], q[1]) && water(W.idx(q[0], q[1]))) p = q; }
      if (p && sailTo(s, p[0], p[1])) s.st = 'patrol';
      s.t = 0;
    } else if (s.st === 'patrol') { if (moveShip(s, dt)) { s.st = 'idle'; s.t = 0; } }
  }

  // ------------------------------ naval tactics ------------------------------
  const BOARD = { romano: 'o corvo, a ponte de abordagem', nordico: 'ganchos e machados', grego: 'fuzileiros', egipcio: 'ganchos', asteca: null, classico: 'ganchos' };
  function ram(s, o) {
    const S = G.S;
    const dmg = G.rr(34, 52) * (G.Civ.has(s.fac, 'bronze') ? 1.15 : 1);
    o.hp -= dmg; o.hurt = 0.5; s.hp -= dmg * 0.15;
    for (let k = 0; k < 10; k++) G.FX && G.FX.spawn({ x: o.x + G.rr(-0.4, 0.4), y: o.y + G.rr(-0.4, 0.4), h: G.SEA, z: G.rr(2, 5), vz: G.rr(15, 35), vx: G.rr(-0.6, 0.6), vy: G.rr(-0.6, 0.6), g: 60, life: G.rr(0.8, 1.4), s0: 1.2, s1: 0.8, c: '#6e4a2c', k: 0 });
    G.FX && G.FX.splash(o.x, o.y, 1); G.Audio && G.Audio.at(o.x, o.y, 'collapse');
    const a = G.Fac.get(s.fac), b = G.Fac.get(o.fac);
    if (a && b && (!a._ramLog || S.day - a._ramLog > 1)) { a._ramLog = S.day; log(`${G.cap(shipName(s))} de ${a.name} abalroou ${shipName(o)} de ${b.name} com o esporão de bronze!`, 'naval', o.x, o.y); }
    if (o.hp <= 0) Nv.sink(o, s);
  }
  function board2(s, o) {
    const S = G.S; const a = G.Fac.get(s.fac), b = G.Fac.get(o.fac); if (!a || !b) return false;
    // the side with more fighting spirit takes the deck
    const win = G.R() < 0.55 + (G.Civ.t(s.fac, 'war') - G.Civ.t(o.fac, 'war')) * 0.4 + (s.civ === 'romano' ? 0.1 : 0) + (s.civ === 'nordico' ? 0.08 : 0);
    if (!win) { s.hp -= 18; o.hp -= 8; return false; }
    for (const id of o.crew || []) { const v = S.villagers.get(id); if (v && v.aboard === o.id) { v.aboard = 0; G.Village.kill(v, 'war', false); } }
    o.crew = []; o.fac = s.fac; o.civ = s.civ; o.dock = s.dock; o.st = 'idle'; o.path = null; o.target = 0; o.hp = Math.max(o.hp, o.maxHp * 0.3); o.burn = 0;
    if (o.kind === 'transporte') o.kind = 'guerra';
    a.st.prizes = (a.st.prizes || 0) + 1;
    log(`Abordagem! Com ${BOARD[s.civ]}, marinheiros de ${a.name} tomaram ${shipName(o)} de ${b.name}.`, 'naval', o.x, o.y);
    return true;
  }
  // the admiral and the fleet: gathered when a war is fought at sea
  const ADM = { grego: 'navarco', romano: 'prefeito da frota', egipcio: 'comandante da frota do rei', asteca: 'senhor das canoas', nordico: 'jarl do mar', classico: 'almirante' };
  function fleetCouncil() {
    const S = G.S;
    for (const f of G.Fac.all()) {
      const war = Nv.shipsOf(f.id, 'guerra'); const enemies = G.Fac.enemiesOf(f.id);
      if (war.length < 2 || !enemies.length) { f.fleet = null; continue; }
      if (!f.fleet) {
        const cand = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === f.id && !v.captive && v.age >= 25 && v.age < 60).sort((a, b) => (b.kills || 0) + b.courage - (a.kills || 0) - a.courage)[0];
        f.fleet = { adm: cand ? cand.name : null, since: S.day, tactic: null };
        if (cand) log(`${f.name} reúne uma frota de ${war.length} navios de guerra sob o ${ADM[f.civ || 'classico']} ${cand.name}.`, 'naval', war[0].x, war[0].y);
      }
      // the plan at sea: blockade their ports when our ships outnumber theirs, fire ships when they outnumber ours
      const their = enemies.reduce((n, e) => n + Nv.shipsOf(e.id, 'guerra').length, 0);
      const fl = f.fleet;
      if ((war.length > their || (war.length === their && G.Politics.leaderPe(f).agg > 0.35)) && !fl.blockade) {
        const en = enemies.find(e => Nv.docksOf(e.id).length);
        const dock = en && Nv.docksOf(en.id).sort((a, b) => G.Village.pop(b.set) - G.Village.pop(a.set))[0];
        const di = dock && Nv.dockInfo(dock);
        if (di && di.moor) {
          fl.blockade = { dock: dock.id, fac: en.id, x: di.moor[0], y: di.moor[1] }; fl.tactic = 'bloqueio';
          const set = S.settlements.get(dock.set);
          if (!(f._blockLog && f._blockLog[dock.id] > S.day - 2)) { (f._blockLog = f._blockLog || {})[dock.id] = S.day; log(`A frota de ${f.name} bloqueia o porto de ${set ? set.name : en.name}: nenhum barco de pesca ou mercante sai nem entra.`, 'naval', di.moor[0], di.moor[1]); }
          war.slice(0, Math.max(1, Math.ceil(war.length * 0.6))).forEach((sh, k) => { const a = k / 3 * TAU; const p = nearestWater(di.moor[0] + Math.cos(a) * 3.5, di.moor[1] + Math.sin(a) * 3.5, 2); if (p) { sh.post = p; sh.st = 'blockade'; sailTo(sh, p[0], p[1]); } });
        }
      }
      if (fl.blockade) {
        const d = S.buildings.get(fl.blockade.dock);
        if (!d || !G.Fac.atWar(f.id, fl.blockade.fac) || !war.some(sh => sh.st === 'blockade')) { fl.blockade = null; fl.tactic = null; }
        else d.blockT = S.clock + 6;
      }
      // fire ships: an old boat full of pitch and brushwood, set alight and sent at the enemy line
      if (their >= war.length + 1 && f.stock.wood > 30 && !(fl.fireCd > S.clock)) {
        const enemyShips = S.ships.filter(o => o.kind === 'guerra' && G.Fac.atWar(f.id, o.fac));
        const boat = Nv.shipsOf(f.id, 'pesca').find(b => enemyShips.some(o => G.dist(o.x, o.y, b.x, b.y) < 14));
        if (boat) {
          const tgt = enemyShips.sort((a, b) => G.dist(a.x, a.y, boat.x, boat.y) - G.dist(b.x, b.y, boat.x, boat.y))[0];
          boat.fireship = tgt.id; boat.st = 'fireship'; f.stock.wood -= 10; fl.fireCd = S.clock + 60; fl.tactic = 'brulote';
          log(`Desesperada no mar, ${f.name} acende um brulote — um barco em chamas lançado contra a frota inimiga.`, 'naval', boat.x, boat.y);
        }
      }
    }
  }
  function runFireship(s, dt) {
    const S = G.S; const tg = S.ships.find(o => o.id === s.fireship);
    if (!tg) { Nv.sink(s, null, 'fire'); return; }
    if (G.R() < dt * 8) G.FX && G.FX.spawn({ x: s.x + G.rr(-0.3, 0.3), y: s.y + G.rr(-0.3, 0.3), h: G.SEA, z: G.rr(2, 6), vz: G.rr(12, 25), life: G.rr(0.6, 1.2), s0: 1.6, s1: 0.4, c: G.R() < 0.5 ? '#ffb040' : '#ff6a20', k: 4, layer: 1 });
    const d = G.dist(s.x, s.y, tg.x, tg.y);
    if (d < 1) {
      for (const o of S.ships) if (o !== s && G.Fac.atWar(s.fac, o.fac) && G.dist(o.x, o.y, s.x, s.y) < 1.8) { o.hp -= 30; o.burn = 10; o.hurt = 0.5; }
      G.FX && G.FX.ring(s.x, s.y, 0.2, 2, 1, 'rgba(255,150,50,0.9)', 2, true);
      removeShip(s); return;
    }
    const sp = 2.1 * dt; const nx = s.x + (tg.x - s.x) / d * sp, ny = s.y + (tg.y - s.y) / d * sp;
    if (W.inb(nx, ny) && water(W.idx(nx, ny))) { s.x = nx; s.y = ny; s.moving = true; G.faceTo(s, tg.x - s.x, tg.y - s.y); }
    else { if (!s.path || s.pi >= s.path.length) sailTo(s, tg.x, tg.y); moveShip(s, dt); }
  }
  Nv.blockaded = function (dock) { return dock && dock.blockT > G.S.clock; };

  // ------------------------------ exploration & contact ------------------------------
  function runExplorer(s, dt) {
    const S = G.S; const h = home(s); if (!h) return removeShip(s);
    s.t += dt;
    if (s.st === 'idle' || (s.st === 'out' && moveShip(s, dt))) {
      s.legs = (s.legs || 0) + (s.st === 'out' ? 1 : 0);
      if (s.legs >= 4 || s.t > 260) { if (sailTo(s, h.moor[0], h.moor[1])) { s.st = 'back'; return; } return removeShip(s); }
      // aim at far waters, away from home and from where we have been
      comps(); const c = comp[W.idx(s.x, s.y)];
      let best = null, bs = -1e9;
      for (let k = 0; k < 16; k++) {
        const x = G.rr(3, N - 3), y = G.rr(3, N - 3); const i = W.idx(x, y); if (!water(i) || comp[i] !== c) continue;
        const sc = G.dist(x, y, h.moor[0], h.moor[1]) * 0.6 - (s.lx !== undefined ? Math.max(0, 12 - G.dist(x, y, s.lx, s.ly)) * 2 : 0) + G.dist(x, y, s.x, s.y) * 0.2 + G.R() * 6;
        if (sc > bs) { bs = sc; best = [Math.floor(x) + 0.5, Math.floor(y) + 0.5]; }
      }
      s.lx = s.x; s.ly = s.y;
      if (best && sailTo(s, best[0], best[1])) s.st = 'out'; else if (sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; else removeShip(s);
      return;
    }
    if (s.st === 'back' && moveShip(s, dt)) removeShip(s);
  }
  function scanContacts() {
    const S = G.S;
    for (const s of S.ships) {
      const a = G.Fac.get(s.fac); if (!a || !a.alive) continue;
      for (const set of S.settlements.values()) {
        if (set.fac === s.fac) continue;
        const b = G.Fac.get(set.fac); if (!b || !b.alive) continue;
        const r = G.Fac.rel(a.id, b.id); if (!r || r.met) continue;
        if (G.dist(s.x, s.y, set.cx, set.cy) < (set.radius || 8) + 8) {
          G.Politics.meet(a, b);
          log(`${G.cap(shipName(s))} de ${a.name} avistou ${set.name}, terra de ${b.name}.`, 'ship', set.cx, set.cy);
        }
      }
    }
  }

  // ------------------------------ sea trade ------------------------------
  const PEACE = { paz: 1, alianca: 1, vassalo: 1 };
  const RES = ['food', 'wood', 'stone'];
  function updateSeaRoutes() {
    const S = G.S;
    for (const r of S.seaRoutes) {
      const da = S.buildings.get(r.a), db = S.buildings.get(r.b);
      if (!da || !db || da.type !== 'doca' || db.type !== 'doca' || !da.built || !db.built) { r.dead = true; continue; }
      const fa = G.Village.facOfSet(da.set), fb = G.Village.facOfSet(db.set);
      if (fa === fb) { r.ok = true; continue; }
      const rel = G.Fac.rel(fa, fb); r.ok = !!rel && !!PEACE[rel.st];
    }
    S.seaRoutes = S.seaRoutes.filter(r => !r.dead);
    for (const f of G.Fac.all()) {
      if (!Nv.canSail(f) || !(G.Civ.has(f.id, 'moeda') || G.Civ.has(f.id, 'roda') || G.Civ.t(f.id, 'trade') > 1.1)) continue;
      const mine = Nv.docksOf(f.id);
      if (S.seaRoutes.filter(r => mine.some(d => d.id === r.a)).length >= 1 + (G.Civ.has(f.id, 'moeda') ? 1 : 0)) continue;
      for (const o of G.Fac.all()) {
        if (o.id === f.id) continue;
        const rel = G.Fac.rel(f.id, o.id); if (!rel || !rel.met || !PEACE[rel.st] || rel.op < -5) continue;
        const theirs = Nv.docksOf(o.id); if (!theirs.length) continue;
        let pair = null;
        for (const a of mine) for (const b of theirs) { const ia = Nv.dockInfo(a), ib = Nv.dockInfo(b); if (ia.moor && ib.moor && Nv.compAt(ia.moor[0], ia.moor[1]) === Nv.compAt(ib.moor[0], ib.moor[1])) pair = [a, b]; }
        if (!pair) continue;
        if (S.seaRoutes.some(r => (r.a === pair[0].id && r.b === pair[1].id) || (r.a === pair[1].id && r.b === pair[0].id))) continue;
        S.seaRoutes.push({ id: S.nextId++, a: pair[0].id, b: pair[1].id, ok: true, t: G.rr(5, 20), trips: 0 });
        const sa = S.settlements.get(pair[0].set), sb = S.settlements.get(pair[1].set);
        log(`Abre-se uma rota marítima entre ${sa ? sa.name : f.name} e ${sb ? sb.name : o.name}.`, 'ship', sb ? sb.cx : undefined, sb ? sb.cy : undefined);
        G.Lore && G.Lore.note('route', { a: f.id, b: o.id, sea: true });
        return;
      }
    }
  }
  function runMerchant(s, dt) {
    const S = G.S; const r = S.seaRoutes.find(q => q.id === s.route);
    const hb = S.buildings.get(s.dock), ob = r ? S.buildings.get(r.a === s.dock ? r.b : r.a) : null;
    if (!r || !r.ok || !hb || !ob) { const h = home(s); if (h && s.st !== 'back2' && sailTo(s, h.moor[0], h.moor[1])) { s.st = 'back2'; return; } if (s.st === 'back2' && !moveShip(s, dt)) return; return removeShip(s); }
    if (s.st === 'back2') { if (moveShip(s, dt)) removeShip(s); return; }
    if (threat(s, 5) && s.st === 'go') { const h = home(s); if (h && sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; }
    if (s.st === 'idle') { const oi = Nv.dockInfo(ob); if (oi.moor && sailTo(s, oi.moor[0], oi.moor[1])) s.st = 'go'; else removeShip(s); return; }
    if (s.st === 'go' && moveShip(s, dt)) {
      const fa = G.Fac.get(s.fac), fb = G.Fac.get(G.Village.facOfSet(ob.set));
      if (fa && fb) {
        if (s.goods) G.Village.addStock(s.goods.k, s.goods.n, fb.id);
        if (fa !== fb) {
          const deal = 1.1 * G.Civ.t(fa.id, 'trade') * (G.Civ.has(fa.id, 'moeda') ? 1.15 : 1);
          const want = RES.filter(k => !s.goods || k !== s.goods.k).sort((x, y) => (fb.stock[y] - fa.stock[y]) - (fb.stock[x] - fa.stock[x]))[0];
          const m = Math.min(Math.round((s.goods ? s.goods.n : 6) * deal), Math.floor(fb.stock[want] * 0.12));
          if (m > 0) { fb.stock[want] -= m; s.ret = { k: want, n: m }; }
          const rel = G.Fac.rel(fa.id, fb.id); if (rel) { rel.op = Math.min(100, rel.op + 2); rel.trade = (rel.trade || 0) + 1; }
          r.trips++;
          if (r.trips === 1) { const st = S.settlements.get(ob.set); log(`${G.cap(shipName(s))} de ${fa.name} atracou em ${st ? st.name : fb.name}, carregad${G.gen(shipName(s).replace(/^(um|uma) /, ''))} de ${({ food: 'comida', wood: 'madeira', stone: 'pedra' })[s.goods ? s.goods.k : 'food']}.`, 'ship', s.x, s.y); }
        }
      }
      s.goods = null;
      const h = home(s); if (h && sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; else removeShip(s);
      return;
    }
    if (s.st === 'back' && moveShip(s, dt)) { if (s.ret) G.Village.addStock(s.ret.k, s.ret.n, s.fac); removeShip(s); }
  }

  // ------------------------------ expeditions: raids & colonies ------------------------------
  function pickCrew(fac, from, n, warriors) {
    const S = G.S; const cands = [];
    for (const v of S.villagers.values()) {
      if (v.captive || v.aboard || v.age < 16 || v.age >= 58 || v.hp < 55 || v.preg > 0 || v.held || v.air) continue;
      if (G.Fac.idOfV(v) !== fac.id || v.id === fac.leader) continue;
      if (v.task && (v.task.type === 'band' || v.task.type === 'combat' || v.task.type === 'embark' || v.task.pri >= 4)) continue;
      if (G.dist(v.x, v.y, from.cx, from.cy) > 30) continue;
      cands.push([warriors ? (v.role === 'guerreiro' ? 3 : v.role === 'cacador' ? 1.5 : 0) + v.courage + (v.fury > 0 ? 3 : 0) : G.R(), v]);
    }
    cands.sort((a, b) => b[0] - a[0]);
    return cands.slice(0, n).map(c => c[1]);
  }
  Nv.launchRaid = function (f, enemy, opts) {
    const S = G.S; opts = opts || {};
    if (!Nv.canSail(f)) return null;
    if (Nv.shipsOf(f.id, 'transporte').length >= 2) return null;
    const docks = Nv.docksOf(f.id).filter(d => Nv.dockInfo(d).moor);
    let best = null, bd = 1e9;
    for (const d of docks) {
      const di = Nv.dockInfo(d); const c = Nv.compAt(di.moor[0], di.moor[1]);
      for (const s of G.Fac.settlementsOf(enemy.id)) {
        const l = Nv.landing(s, c); if (!l) continue;
        const dd = G.dist(di.moor[0], di.moor[1], l.water[0], l.water[1]); if (dd < bd) { bd = dd; best = { dock: d, set: s, l }; }
      }
    }
    if (!best) return null;
    const from = S.settlements.get(best.dock.set); if (!from) return null;
    const pe = G.Politics.leaderPe(f);
    const cap = f.civ === 'nordico' ? 12 : 9;
    const crew = pickCrew(f, from, Math.min(cap, Math.max(4, Math.round(G.Fac.pop(f.id) * (0.14 + pe.agg * 0.12)))), true);
    if (crew.length < 4) return null;
    let defenders = 0; for (const v of S.villagers.values()) if (v.set === best.set.id && !v.captive && v.age >= 16 && v.age < 62) defenders++;
    if (!opts.fury && crew.length < defenders * (0.5 - pe.agg * 0.2)) return null;
    const ship = spawn('transporte', f, best.dock, { st: 'embark', purpose: 'raid', enemy: enemy.id, target: best.set.id, land: best.l.land, water: best.l.water, goal: opts.goal || G.War.chooseGoal(f, enemy, best.set, crew.length), fury: !!opts.fury });
    if (!ship) return null;
    board(ship, crew);
    f.attackCD = G.rr(140, 220) * (1.2 - pe.agg * 0.5);
    const c = G.CIVS[f.civ];
    log(`${f.name} prepara ${c ? (G.gen(c.units.ship) === 'a' ? 'uma ' : 'um ') + c.units.ship.toLowerCase() : 'um navio'} para atacar ${best.set.name} pelo mar.`, 'naval', from.cx, from.cy);
    return ship;
  };
  Nv.colonize = function (set, fac) {
    const S = G.S;
    if (!Nv.canSail(fac) || Nv.shipsOf(fac.id, 'transporte').length) return false;
    const dock = homeDock(fac, set); if (!dock) return false;
    const di = Nv.dockInfo(dock); const c = Nv.compAt(di.moor[0], di.moor[1]);
    // a fertile shore far from every town, across the water
    let best = null, bs = -1e9;
    for (let k = 0; k < 500; k++) {
      const x = G.ri(4, N - 5), y = G.ri(4, N - 5); const i = y * N + x;
      if (S.type[i] !== T.GRASS && S.type[i] !== T.MEADOW) continue;
      if (S.occ[i] || S.objAt[i]) continue;
      let md = 1e9; for (const o of S.settlements.values()) md = Math.min(md, G.dist(x, y, o.cx, o.cy));
      if (md < 16) continue;
      const fake = { cx: x + 0.5, cy: y + 0.5 };
      const l = Nv.landing(fake, c); if (!l || G.dist(l.land[0], l.land[1], x, y) > 7) continue;
      const land = !!W.findPath(set.cx, set.cy, x + 0.5, y + 0.5, true, 2500);
      const sc = S.fert[i] * 4 - (land ? 6 : 0) + Math.min(md, 30) * 0.1 - G.dist(di.moor[0], di.moor[1], x, y) * 0.04 + G.R();
      if (sc > bs) { bs = sc; best = { x: x + 0.5, y: y + 0.5, l }; }
    }
    if (!best) return false;
    const crew = [];
    const members = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v.aboard);
    for (const m of members.filter(v => v.g === 'f' && v.partner && v.age < 42).sort(() => G.R() - 0.5)) {
      if (crew.length >= 10) break;
      const p = S.villagers.get(m.partner); if (!p || p.set !== set.id || p.aboard || p.id === fac.leader) continue;
      crew.push(m, p);
      for (const k of members) if ((k.mother === m.id || k.father === p.id) && k.age < 16 && k.age >= 2 && crew.length < 12) crew.push(k);
    }
    for (const v of members.filter(v => !v.partner && v.age >= 17 && v.age < 35 && v.id !== fac.leader)) { if (crew.length >= 10) break; if (!crew.includes(v)) crew.push(v); }
    if (crew.length < 5) return false;
    const ship = spawn('transporte', fac, dock, { st: 'embark', purpose: 'colony', site: [best.x, best.y], land: best.l.land, water: best.l.water });
    if (!ship) return false;
    board(ship, crew);
    log(`Em ${set.name}, ${crew.length} colonos embarcam rumo a uma terra do outro lado do mar.`, 'ship', set.cx, set.cy);
    return true;
  };
  function board(ship, crew) {
    ship.crew = crew.map(v => v.id); ship.t = 0;
    const h = home(ship);
    for (const v of crew) { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'embark', ship: ship.id, pri: 3.3, kind: 'embark', x: h.quay[0], y: h.quay[1] }); }
  }
  // the villager side: walk to the quay and step aboard
  function runEmbark(v, t, dt, H) {
    const s = G.S.ships.find(o => o.id === t.ship);
    if (!s || s.st !== 'embark') return H.end(v);
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false, N * N) && !H.goto(v, t.x, t.y, true, N * N)) { t.st = 9; return; } t.st = 1; return; }
    if (t.st === 1) { if (H.move(v, dt, 1.1) || G.dist(v.x, v.y, t.x, t.y) < 1.4) { G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; } return; }
    if (t.age > 60) H.end(v);
  }
  function runBoardBack(v, t, dt, H) {
    const s = G.S.ships.find(o => o.id === t.ship);
    if (!s || s.st !== 'wait') return H.end(v);
    if (t.st === 0) { if (!H.goto(v, s.land[0], s.land[1], false, N * N) && !H.goto(v, s.land[0], s.land[1], true, N * N)) return H.end(v); t.st = 1; return; }
    H.move(v, dt, 1.1);
    if (t.age > 120) H.end(v);
  }
  Nv.run = function (v, t, dt, H) {
    if (t.type === 'embark') { runEmbark(v, t, dt, H); return true; }
    if (t.type === 'boardBack') { runBoardBack(v, t, dt, H); return true; }
    if (t.type === 'aboard') return true;
    return false;
  };
  Nv.taskText = function (v, t) {
    if (t.type === 'embark') { const s = G.S.ships.find(o => o.id === t.ship); return s && s.purpose === 'colony' ? 'Embarcando para colonizar novas terras' : 'Embarcando para uma expedição'; }
    if (t.type === 'aboard' || v.aboard) { const s = G.S.ships.find(o => o.id === v.aboard); return s ? (s.purpose === 'colony' ? 'No mar, rumo a uma nova terra' : s.st === 'return' ? 'Voltando para casa pelo mar' : 'No mar, rumo à batalha') : 'No mar'; }
    return null;
  };
  function disembark(s, at) {
    const S = G.S; const out = [];
    for (const id of s.crew) {
      const v = S.villagers.get(id); if (!v || v.aboard !== s.id) continue;
      v.aboard = 0; v.task = null; v.path = null;
      const p = W.randomNear(at[0], at[1], 1.2) || at; v.x = p[0]; v.y = p[1];
      out.push(v);
    }
    s.crew = s.crew.filter(id => { const v = S.villagers.get(id); return v && v.aboard === s.id; });
    return out;
  }
  function runTransport(s, dt) {
    const S = G.S; const h = home(s);
    s.t += dt;
    const aboard = () => s.crew.filter(id => { const v = S.villagers.get(id); return v && v.aboard === s.id; }).length;
    switch (s.st) {
      case 'embark': {
        const walking = s.crew.filter(id => { const v = S.villagers.get(id); return v && !v.aboard && v.task && v.task.type === 'embark' && v.task.ship === s.id; }).length;
        const n = aboard();
        if ((!walking && n) || s.t > 45) {
          for (const id of s.crew) { const v = S.villagers.get(id); if (v && !v.aboard && v.task && v.task.type === 'embark') G.Vg.endTask(v); }
          s.crew = s.crew.filter(id => { const v = S.villagers.get(id); return v && v.aboard === s.id; });
          if (n < (s.purpose === 'colony' ? 3 : 3) || !sailTo(s, s.water[0], s.water[1])) { disembark(s, h ? h.quay : [s.x, s.y]); const f = G.Fac.get(s.fac); if (f) f.stock.wood += Nv.SHIP.transporte.cost; removeShip(s); return; }
          s.st = 'sail'; s.t = 0;
          const f = G.Fac.get(s.fac); const tg = S.settlements.get(s.target);
          if (s.purpose === 'raid' && tg && G.UI && (G.UI.viewFac === tg.fac || G.UI.viewFac === s.fac)) G.UI.notice(`${f.name} zarpou para atacar ${tg.name}!`, 'naval');
        }
        break;
      }
      case 'sail':
        if (s.purpose === 'raid' && !G.Fac.atWar(s.fac, s.enemy)) { if (h && sailTo(s, h.moor[0], h.moor[1])) { s.st = 'return'; } break; }
        if (moveShip(s, dt)) { s.st = 'land'; s.t = 0; }
        break;
      case 'land': {
        const people = disembark(s, s.land);
        if (s.purpose === 'raid') {
          const f = G.Fac.get(s.fac), en = G.Fac.get(s.enemy), set = S.settlements.get(s.target);
          if (f && en && set && people.length && set.fac === en.id) {
            const b = G.War.makeBand(f, en, set, people, s.goal || 'saque', { ship: s.id, landed: true, fury: s.fury, from: h ? S.buildings.get(s.dock).set : 0 });
            s.band = b ? b.id : 0;
            log(`${people.length} guerreiros de ${f.name} desembarcaram perto de ${set.name}!`, 'naval', s.land[0], s.land[1]);
            if (G.UI && (G.UI.viewFac === en.id || G.UI.viewFac === f.id)) G.UI.notice(`Invasão pelo mar em ${set.name}!`, 'naval');
            set.alarmT = Math.max(set.alarmT || 0, 20);
          }
          s.st = 'wait'; s.t = 0;
        } else {
          const f = G.Fac.get(s.fac);
          if (f && people.length) {
            const name = G.Village.newSettlementName(f.id);
            const ns = G.Village.addSettlement(name, s.site[0], s.site[1], f.id);
            for (const v of people) { v.set = ns.id; v.home = 0; G.Vg.setTask(v, { type: 'migrate', pri: 1.6, kind: 'migrate' }); }
            log(`Colonos de ${f.name} desembarcaram e fundaram ${name} numa nova terra.`, 'settle', s.site[0], s.site[1]);
            G.Village.milestone('colony', 'Colônia além-mar', `${name} nasceu do outro lado da água.`, 'ship');
            G.Lore && G.Lore.note('colony', { fac: f.id, name });
          }
          if (h && sailTo(s, h.moor[0], h.moor[1])) s.st = 'return'; else removeShip(s);
        }
        break;
      }
      case 'wait': {
        const b = s.band && G.War.bands.get(s.band);
        if (!b || b.st === 'retorno' || s.t > 240) {
          // gather the survivors on the beach
          for (const v of S.villagers.values()) {
            if (v.aboard || G.Fac.idOfV(v) !== s.fac || v.captive) continue;
            const on = (v.task && v.task.type === 'band' && v.task.band === s.band) || (v.task && v.task.type === 'boardBack' && v.task.ship === s.id);
            if (on && G.dist(v.x, v.y, s.land[0], s.land[1]) < 2.2) { G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; if (!s.crew.includes(v.id)) s.crew.push(v.id); }
          }
          // captives walk aboard with their captors
          for (const v of S.villagers.values()) if (v.captive && v.task && v.task.type === 'escorted' && G.dist(v.x, v.y, s.land[0], s.land[1]) < 2.5) { const c = S.villagers.get(v.task.by); if (c && c.aboard === s.id) { G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; s.crew.push(v.id); } }
          let still = 0; if (b) for (const id of b.members) { const v = S.villagers.get(id); if (v && !v.aboard) still++; }
          for (const v of S.villagers.values()) if (v.task && v.task.type === 'boardBack' && v.task.ship === s.id && !v.aboard) still++;
          if (!still || s.t > (b ? 300 : 260)) {
            if (b) G.War.disband(b);
            if (h && sailTo(s, h.moor[0], h.moor[1])) { s.st = 'return'; s.t = 0; } else removeShip(s);
          }
        }
        break;
      }
      case 'return':
        if (moveShip(s, dt)) {
          const people = disembark(s, h ? h.quay : [s.x, s.y]);
          const f = G.Fac.get(s.fac);
          for (const v of people) { if (v.carry && f) { G.Village.addStock(v.carry.k, v.carry.n, f.id); v.carry = null; } }
          removeShip(s);
        }
        break;
    }
  }
  // band members walk back to their ship instead of home
  Nv.bandReturn = function (v, b, t, dt, H) {
    const s = G.S.ships.find(o => o.id === b.ship);
    if (!s || s.st !== 'wait') return false;
    if (!t.shipGo) { t.shipGo = true; if (!H.goto(v, s.land[0], s.land[1], false, N * N) && !H.goto(v, s.land[0], s.land[1], true, N * N)) return false; }
    H.move(v, dt, 1.05);
    return true;
  };

  // ------------------------------ fleets ------------------------------
  function manageFleets() {
    const S = G.S;
    for (const f of G.Fac.all()) {
      f._rsv = 0;
      if (!G.Civ.has(f.id, 'navegacao')) continue;
      // no timber on the island: the quay is finished in stone, block by block
      if (f.stock.wood < 4 && f.stock.stone >= 12) for (const b of S.buildings.values()) {
        if (b.type !== 'doca' || b.built || G.Village.facOfSet(b.set) !== f.id) continue;
        const r = Math.min(4, Math.floor(b.need.wood - (b.incoming.wood || 0)));
        if (r >= 1) { b.need.wood -= r; b.need.stone += Math.ceil(r * 1.5); }
        break;
      }
      const docks = Nv.docksOf(f.id); if (!docks.length) continue;
      const pop = G.Fac.pop(f.id);
      // fishing boats
      const fishers = Nv.shipsOf(f.id, 'pesca').length;
      // hunger sends more boats out: the sea is the biggest pantry there is
      const hungry = f.stock.food < pop * 1.6;
      const wantF = Math.min(docks.length * (hungry ? 4 : 2), 1 + Math.floor(pop / (hungry ? 12 : 22)) + (hungry ? 1 : 0));
      // the first boats are worth more than another hut: the builders leave their wood alone
      if (fishers < Math.min(wantF, docks.length * (hungry ? 2 : 1))) f._rsv = Nv.SHIP.pesca.cost + 2;
      if (fishers < wantF && f.stock.wood >= (hungry || fishers < docks.length ? Nv.SHIP.pesca.cost : 26)) { const d = G.pick(docks); if (Nv.dockInfo(d).moor && !Nv.blockaded(d)) spawn('pesca', f, d); }
      // explorers look for peoples we have not met yet
      const unmet = G.Fac.all().some(o => o.id !== f.id && G.Fac.rel(f.id, o.id) && !G.Fac.rel(f.id, o.id).met);
      if (unmet && !Nv.shipsOf(f.id, 'explorador').length && G.R() < 0.25) { const d = G.pick(docks); const di = Nv.dockInfo(d); if (di.moor && Nv.openSea(di.moor[0], di.moor[1])) { const s = spawn('explorador', f, d); if (s && !f._explored) { f._explored = 1; const st = S.settlements.get(d.set); log(`Um barco de ${f.name} parte de ${st ? st.name : 'seu porto'} para explorar o horizonte.`, 'ship', s.x, s.y); } } }
      // warships when there is a war to fight at sea
      const enemies = G.Fac.enemiesOf(f.id);
      const want = enemies.length ? Math.min(1 + Math.floor(pop / 40) + (f.civ === 'nordico' || f.civ === 'grego' ? 1 : 0), 4) : (G.Politics.leaderPe(f).agg > 0.6 && pop > 40 ? 1 : 0);
      const war = Nv.shipsOf(f.id, 'guerra').length;
      if (war < want && f.stock.wood > 60) { const d = G.pick(docks); if (Nv.dockInfo(d).moor) { const s = spawn('guerra', f, d); if (s && G.R() < 0.5) { const st = S.settlements.get(d.set); log(`${st ? st.name : f.name} lançou ao mar ${shipName(s)}.`, 'naval', s.x, s.y); } } }
      // merchant ships on the sea routes
      for (const r of S.seaRoutes) {
        if (!r.ok || !docks.some(d => d.id === r.a || d.id === r.b)) continue;
        r.t = (r.t || 0) - 4; if (r.t > 0) continue;
        r.t = G.rr(50, 80);
        if (S.ships.filter(s => s.route === r.id).length >= 2) continue;
        const mine = docks.find(d => d.id === r.a || d.id === r.b);
        if (Nv.blockaded(S.buildings.get(r.a)) || Nv.blockaded(S.buildings.get(r.b))) continue;
        const give = RES.slice().sort((x, y) => f.stock[y] - f.stock[x])[0];
        const n = Math.min(16, Math.floor(f.stock[give] * 0.08)); if (n < 4) continue;
        const s = spawn('mercante', f, mine, { route: r.id }); if (!s) continue;
        f.stock[give] -= n; s.goods = { k: give, n };
      }
    }
  }

  // ------------------------------ update ------------------------------
  Nv.update = function (dt) {
    const S = G.S;
    tFleet -= dt; tShoal -= dt; tRoute -= dt; tScan -= dt;
    if (tFleet <= 0) { tFleet = 4; manageFleets(); fleetCouncil(); }
    if (tShoal <= 0) { tShoal = 30; updateShoals(30); }
    if (tRoute <= 0) { tRoute = 20; updateSeaRoutes(); }
    if (tScan <= 0) { tScan = 1; scanContacts(); }
    for (const s of [...S.ships]) {
      if (!S.ships.includes(s)) continue;
      if (s.hurt > 0) s.hurt -= dt;
      // storms can sink small boats
      if (S.weather.storm > 0 && (s.kind === 'pesca' || s.kind === 'explorador') && s.st !== 'idle' && G.R() < dt * 0.002) { Nv.sink(s, null, 'storm'); continue; }
      if (s.dead) { removeShip(s); continue; }
      if (s.burn > 0) { s.burn -= dt; s.hp -= dt * 4; if (G.R() < dt * 6) G.FX && G.FX.spawn({ x: s.x + G.rr(-0.4, 0.4), y: s.y + G.rr(-0.4, 0.4), h: G.SEA, z: G.rr(3, 8), vz: G.rr(10, 22), life: G.rr(0.6, 1.1), s0: 1.4, s1: 0.3, c: '#ff8a30', k: 4, layer: 1 }); if (s.hp <= 0) { Nv.sink(s, null, 'fire'); continue; } }
      if (s.st === 'fireship') { runFireship(s, dt); continue; }
      switch (s.kind) {
        case 'pesca': runFishing(s, dt); break;
        case 'explorador': runExplorer(s, dt); break;
        case 'mercante': runMerchant(s, dt); break;
        case 'guerra': runWarship(s, dt); break;
        case 'transporte': runTransport(s, dt); break;
      }
      // people aboard ride with the ship
      if (s.kind === 'transporte') for (const id of s.crew) { const v = S.villagers.get(id); if (v && v.aboard === s.id) { v.x = s.x; v.y = s.y; } }
      if (s.kind === 'transporte' && (s.st === 'sail' || s.st === 'return' || s.st === 'wait')) { const e = threat(s, 3); if (e && s.cd <= 0) { s.cd = 1.8; fire(s, e); } s.cd -= dt; }
    }
  };

  // ------------------------------ drawing ------------------------------
  const HULL = {
    nordico: { col: '#6e4a2c', dark: '#4e321c', len: 11, h: 2.6, bow: 6, stern: 5, sail: ['#b33a2a', '#f1e6d0'], stripes: true, shields: true, head: 'dragon', oars: 6 },
    grego: { col: '#2a2a30', dark: '#1a1a20', len: 12, h: 2.4, bow: 1.5, stern: 5, sail: ['#f1ead6', '#f1ead6'], eye: true, ram: true, oars: 9, rows: 2 },
    romano: { col: '#7a3a24', dark: '#5a2a18', len: 12, h: 2.8, bow: 2, stern: 4.5, sail: ['#a8322a', '#a8322a'], ram: true, oars: 8, rows: 2 },
    egipcio: { col: '#c9b060', dark: '#a08a44', len: 11, h: 2.2, bow: 5, stern: 6, sail: ['#f4efe0', '#f4efe0'], tall: true, reed: true, oars: 5 },
    asteca: { col: '#8a5a34', dark: '#6a4424', len: 9, h: 1.8, bow: 1, stern: 1, sail: null, paddlers: true, paint: '#2fae8f' },
    classico: { col: '#6e4a2c', dark: '#4e321c', len: 10, h: 2.4, bow: 2, stern: 2, sail: ['#f4ecd8', '#f4ecd8'], oars: 0 },
  };
  Nv.drawShip = function (ctx, s, sx, sy, t, nightF, light, emisTorch) {
    const st = HULL[s.civ] || HULL.classico;
    const small = s.kind === 'pesca' || s.kind === 'explorador';
    const sc = small ? 0.62 : s.kind === 'mercante' ? 0.9 : 1.05;
    const bob = Math.sin(t * 2 + s.id) * 0.7;
    ctx.save(); ctx.translate(sx, sy + bob); ctx.scale(G.Render.sface(s) * sc, sc);
    const L = st.len, Hh = st.h;
    // shadow & wake on the water
    ctx.fillStyle = 'rgba(20,50,70,0.25)'; ctx.beginPath(); ctx.ellipse(0, 1.5, L + 2, 2.6, 0, 0, TAU); ctx.fill();
    if (s.moving) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-L - 1, 0.8); ctx.quadraticCurveTo(-L - 6, 2.5, -L - 11, 1.5); ctx.moveTo(-L - 1, -0.2); ctx.quadraticCurveTo(-L - 6, -1.5, -L - 10, -1); ctx.stroke(); }
    // oars
    if (st.oars && !small) {
      const sw = s.moving ? Math.sin(t * 6 + s.id) : 0;
      ctx.strokeStyle = st.dark; ctx.lineWidth = 0.55;
      for (let r = 0; r < (st.rows || 1); r++) for (let k = 0; k < st.oars; k++) { const x = -L * 0.7 + k * (L * 1.4 / st.oars); ctx.beginPath(); ctx.moveTo(x, -Hh * 0.2 - r * 0.8); ctx.lineTo(x - 1.2 - sw * 1.4, 3.2 + r * 0.6); ctx.stroke(); }
    }
    // hull
    ctx.fillStyle = st.col; ctx.beginPath();
    ctx.moveTo(-L, -Hh); ctx.quadraticCurveTo(-L - 1.5, -Hh - st.stern * 0.5, -L - 0.5, -Hh - st.stern);
    ctx.quadraticCurveTo(-L + 1, 1.2, -L * 0.3, 1.6); ctx.lineTo(L * 0.4, 1.6);
    ctx.quadraticCurveTo(L + 0.5, 1.2, L + 0.5, -Hh - st.bow);
    ctx.quadraticCurveTo(L - 1, -Hh * 0.9, L - 1.5, -Hh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = st.dark; ctx.fillRect(-L + 0.4, -Hh, L * 2 - 1.8, 0.9);
    if (st.reed) { ctx.strokeStyle = 'rgba(120,90,40,0.6)'; ctx.lineWidth = 0.4; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * 2.6 - 1, -Hh + 0.4); ctx.lineTo(k * 2.6 + 1, 1.4); ctx.stroke(); } }
    if (st.paint) { ctx.fillStyle = st.paint; ctx.fillRect(-L * 0.6, -Hh * 0.4, L * 1.2, 0.6); }
    if (st.eye) { ctx.fillStyle = '#f4efe0'; ctx.beginPath(); ctx.ellipse(L - 2.5, -Hh * 0.45, 1, 0.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#b33a2a'; ctx.beginPath(); ctx.arc(L - 2.4, -Hh * 0.45, 0.35, 0, TAU); ctx.fill(); }
    if (st.ram && !small) { ctx.fillStyle = '#b08a3a'; ctx.beginPath(); ctx.moveTo(L, 0.6); ctx.lineTo(L + 3, 0.9); ctx.lineTo(L, 1.5); ctx.fill(); }
    if (st.head === 'dragon' && !small) { ctx.strokeStyle = st.dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L + 0.4, -Hh - st.bow); ctx.quadraticCurveTo(L + 2.5, -Hh - st.bow - 1.5, L + 2, -Hh - st.bow - 3); ctx.stroke(); ctx.fillStyle = st.dark; ctx.beginPath(); ctx.arc(L + 2.2, -Hh - st.bow - 3, 1, 0, TAU); ctx.fill(); }
    const fc = G.Fac.hex(s.fac);
    if (st.shields && !small) for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? fc : '#e8c24a'; ctx.beginPath(); ctx.arc(-L * 0.6 + k * (L * 1.2 / 5), -Hh - 0.3, 1, 0, TAU); ctx.fill(); }
    // cargo
    if (s.kind === 'mercante') { for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? '#b8683a' : '#7a5230'; ctx.fillRect(-4 + k * 3, -Hh - 2.4, 2.2, 2.4); } }
    // people aboard
    const n = s.kind === 'transporte' ? s.crew.length : s.kind === 'pesca' ? 1 : s.kind === 'guerra' ? 4 : 1;
    if (st.paddlers || s.kind === 'transporte' || s.kind === 'guerra') {
      for (let k = 0; k < Math.min(6, n); k++) { const x = -L * 0.55 + k * (L * 1.1 / 5.5); ctx.fillStyle = fc; ctx.fillRect(x - 0.8, -Hh - 3, 1.6, 2.6); ctx.fillStyle = '#c99569'; ctx.beginPath(); ctx.arc(x, -Hh - 3.8, 0.9, 0, TAU); ctx.fill(); if (st.paddlers) { ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 0.5; const sw = s.moving ? Math.sin(t * 5 + k) * 1.2 : 0; ctx.beginPath(); ctx.moveTo(x + 0.6, -Hh - 2); ctx.lineTo(x + 1.5 + sw, 2.4); ctx.stroke(); } }
    }
    // mast & sail
    if (st.sail) {
      const mh = (st.tall ? 18 : 15) * (small ? 0.85 : 1);
      ctx.strokeStyle = st.dark; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -Hh); ctx.lineTo(0, -Hh - mh); ctx.stroke();
      const billow = s.moving ? 1.5 : 0.4;
      const sw2 = st.tall ? 8 : 6.5;
      ctx.fillStyle = st.sail[0];
      ctx.beginPath(); ctx.moveTo(-sw2, -Hh - mh + 1); ctx.lineTo(sw2, -Hh - mh + 1); ctx.quadraticCurveTo(sw2 + billow, -Hh - mh * 0.55, sw2 - 0.5, -Hh - 3.5); ctx.lineTo(-sw2 + 0.5, -Hh - 3.5); ctx.quadraticCurveTo(-sw2 + billow, -Hh - mh * 0.55, -sw2, -Hh - mh + 1); ctx.fill();
      if (st.stripes) { ctx.fillStyle = st.sail[1]; for (let k = 0; k < 3; k++) { const x0 = -sw2 + 1.2 + k * (sw2 * 2 / 3); ctx.fillRect(x0, -Hh - mh + 1.2, sw2 * 0.34, mh - 5); } }
      else if (!small) { ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(0.3, -Hh - mh * 0.55, 1.8, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = 'rgba(40,30,20,0.5)'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(-sw2, -Hh - mh + 1); ctx.lineTo(sw2, -Hh - mh + 1); ctx.stroke();
      ctx.fillStyle = fc; ctx.beginPath(); ctx.moveTo(0, -Hh - mh); ctx.lineTo(3 + Math.sin(t * 4 + s.id) * 0.5, -Hh - mh + 0.8); ctx.lineTo(0, -Hh - mh + 1.6); ctx.fill();
    }
    // fishing net
    if (s.kind === 'pesca' && s.st === 'fish') { ctx.strokeStyle = 'rgba(240,235,220,0.7)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(L * 0.5, -Hh); ctx.quadraticCurveTo(L + 4, -1, L + 6, 2); ctx.stroke(); }
    // damage
    if (s.hp < s.maxHp * 0.5) { ctx.fillStyle = 'rgba(30,20,15,0.35)'; ctx.fillRect(-L * 0.5, -Hh, L * 0.6, Hh); }
    ctx.restore();
    if (s.hurt > 0) { ctx.fillStyle = 'rgba(255,120,60,0.5)'; ctx.beginPath(); ctx.arc(sx, sy - 6, 5, 0, TAU); ctx.fill(); }
    if (nightF > 0.4) { const lx = sx + G.Render.sface(s) * 6, ly = sy - 6; light(lx, ly, 26, 'warm', 0.6 * nightF); emisTorch.push(lx, ly); }
  };
  // fish shoals glint under the waves
  Nv.drawWater = function (ctx, proj, t, view) {
    const S = G.S; if (!S.fish || !S.fish.length) return;
    for (const f of S.fish) {
      const p = proj(f.x, f.y, G.SEA); if (p[0] < view[0] || p[0] > view[2] || p[1] < view[1] || p[1] > view[3]) continue;
      const a = Math.min(1, f.n / 30);
      ctx.strokeStyle = `rgba(255,255,255,${0.25 * a})`; ctx.lineWidth = 0.6;
      for (let k = 0; k < 2; k++) { const r = ((t * 0.5 + k * 0.5 + f.id * 0.13) % 1); ctx.globalAlpha = (1 - r) * a; ctx.beginPath(); ctx.ellipse(p[0], p[1], 6 + r * 14, 3 + r * 7, 0, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (let k = 0; k < 5; k++) {
        const ang = t * 0.8 + k * 1.3 + f.id; const x = p[0] + Math.cos(ang) * 7, y = p[1] + Math.sin(ang) * 3.5;
        if (Math.sin(t * 5 + k * 2 + f.id) > 0.75) { ctx.fillStyle = `rgba(230,245,255,${0.8 * a})`; ctx.fillRect(x - 1, y - 0.3, 2, 0.6); }
        else { ctx.fillStyle = `rgba(30,60,90,${0.35 * a})`; ctx.beginPath(); ctx.ellipse(x, y, 1.4, 0.6, ang, 0, TAU); ctx.fill(); }
      }
    }
  };

  // ------------------------------ save ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save(out, r) {
      const S = G.S;
      out.ships = S.ships.map(s => Object.assign({}, s, { x: r(s.x, 2), y: r(s.y, 2), path: null, pi: 0 }));
      out.fish = S.fish; out.seaRoutes = S.seaRoutes;
    },
    load(o) {
      const S = G.S;
      S.ships = o.ships || []; S.fish = o.fish || []; S.seaRoutes = o.seaRoutes || [];
      // ships reloaded mid-voyage recompute their course
      for (const s of S.ships) {
        s.path = null;
        if (s.st === 'sail' && s.water) sailTo(s, s.water[0], s.water[1]);
        else if (s.st === 'return' || s.st === 'back' || s.st === 'back2') { const h = home(s); if (h && h.moor) sailTo(s, h.moor[0], h.moor[1]); }
        else if (s.st === 'out' || s.st === 'go' || s.st === 'patrol') { s.st = s.kind === 'mercante' ? 'idle' : 'idle'; }
      }
      Nv.reset();
    },
  });
})(window.G);
