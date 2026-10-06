'use strict';
// ============================================================
//  The great migrations, each for a reason the world can see.
//  Gnus, zebras and gazelles leave the savanna they have grazed
//  bare (sooner in a drought) for the greenest grass in reach,
//  swimming the rivers where the crocodiles wait, the lions and
//  hyenas in their wake. Bison follow the grass of the plains.
//  Every year the reindeer go up to the tundra to calve and come
//  back down to the shelter of the taiga, wolves behind them.
//  Geese and storks fly in a V from the cold to the warm
//  wetlands and back. And at the end of every summer the salmon
//  climb the cold rivers, leaping at the falls — where the bears
//  stand in the water and catch them.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Mg = G.Migrate = {};
  const A = G.Animals; const SP = A.DEF;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const where = (x, y) => (G.Stories && G.Stories.where ? G.Stories.where(x, y) : { name: '', at: '' });

  // ------------------------------ the herds that follow the grass ------------------------------
  const GRASS = { gnu: 1, zebra: 1, gazelle: 1, bison: 1 };
  let CELL = 14;
  const cellOf = (x, y) => Math.floor(x / CELL) + ',' + Math.floor(y / CELL);
  // the chronicle hears of each migration the first time, and then only now and then
  function news(key) { const S = G.S; const m = S.migNews || (S.migNews = {}); if (m[key] !== undefined && S.day - m[key] < 5) return false; m[key] = S.day; return true; }
  function herds(kind) {
    const S = G.S; const m = new Map();
    for (const a of S.animals.values()) { if (a.kind !== kind || a.dead || a.dom || a.tamed || a.legend || a.held || a.mig) continue; const k = cellOf(a.x, a.y); let l = m.get(k); if (!l) m.set(k, l = []); l.push(a); }
    return [...m.values()].filter(l => l.length >= 5);
  }
  function grassQ(x, y, r) {
    const S = G.S; if (!S.veg) return 1; let v = 0, c = 0;
    for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) { const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy; if (!W.inb(xx, yy)) continue; const i = yy * N + xx; if (S.type[i] < T.SAND || S.type[i] === T.RIVER) continue; const cap = A.vegCap(i) || 0; if (cap < 0.15) continue; v += S.veg[i] / cap; c++; }
    return c ? v / c : 0;
  }
  function waterNear(x, y, r) { const S = G.S; for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) { const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy; if (W.inb(xx, yy) && S.type[yy * N + xx] === T.RIVER) return true; } return false; }
  // the best ground in reach for this kind (a biome it wants, if any)
  function destination(sp, x0, y0, biome, minD) {
    const S = G.S; let best = null, bs = -1e9;
    for (let k = 0; k < 160; k++) {
      const ang = G.R() * TAU, d = G.rr(minD || 16, 60); const x = Math.floor(x0 + Math.cos(ang) * d), y = Math.floor(y0 + Math.sin(ang) * d);
      if (x < 3 || y < 3 || x > N - 4 || y > N - 4) continue; const i = y * N + x;
      if (S.type[i] < T.SAND || S.type[i] === T.RIVER || !A.habitat(sp, i)) continue;
      if (biome !== undefined && S.biome[i] !== biome) continue;
      if (!W.sameLand(x0, y0, x + 0.5, y + 0.5)) continue;
      if ([...S.settlements.values()].some(s => G.dist(s.cx, s.cy, x, y) < (s.radius || 8) + 4)) continue;
      const q = grassQ(x, y, 4); const sc = q * 10 + (waterNear(x, y, 5) ? 2 : 0) - d * 0.04;
      if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5, q]; }
    }
    return best;
  }
  // the rivers on the way, and who waits at the ford
  function crossing(x0, y0, x1, y1) {
    const S = G.S; const n = Math.ceil(G.dist(x0, y0, x1, y1));
    for (let k = 1; k < n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; if (S.type[W.idx(x, y)] === T.RIVER) return [x, y]; }
    return null;
  }
  function move(group, dest, why, key, toOver) {
    const S = G.S; const sp = SP[group[0].kind];
    let cx = 0, cy = 0; for (const a of group) { cx += a.x; cy += a.y; } cx /= group.length; cy /= group.length;
    for (const a of group) { a.hx = dest[0] + G.rr(-4, 4); a.hy = dest[1] + G.rr(-4, 4); a.mig = true; a.state = 'idle'; a.t = G.rr(0, 4); a.migFrom = S.day; }
    // the hunters follow
    let preds = 0; const pk = new Set(A.eatenBy[group[0].kind] || []);
    for (const a of S.animals.values()) {
      if (!pk.has(a.kind) || a.dead || a.tamed || a.legend || a.dom || G.dist(a.x, a.y, cx, cy) > 24) continue;
      const ps = SP[a.kind]; if (ps.cls === 'water' || ps.cls === 'air' || !A.habitat(ps, W.idx(dest[0], dest[1]))) continue;
      if (G.R() < 0.6) { a.hx = dest[0] + G.rr(-7, 7); a.hy = dest[1] + G.rr(-7, 7); a.mig = true; preds++; }
    }
    // a river on the way: the crocodiles gather at the ford
    const ford = sp.swims ? crossing(cx, cy, dest[0], dest[1]) : null; let crocs = 0;
    if (ford) for (const a of S.animals.values()) { if ((a.kind === 'croc' || a.kind === 'anaconda') && !a.dead && G.dist(a.x, a.y, ford[0], ford[1]) < 18) { a.hx = ford[0] + G.rr(-2, 2); a.hy = ford[1] + G.rr(-2, 2); a.mig = true; crocs++; } }
    Mg.last = { kind: group[0].kind, x: cx, y: cy, tx: dest[0], ty: dest[1], day: S.day };
    if (!news(key || group[0].kind)) return;
    const nm = A.plural(sp, group.length).replace(/^\d+ /, '');
    const from = where(cx, cy), to = where(dest[0], dest[1]);
    const toTxt = toOver ? ' ' + toOver : to.town ? ` rumo aos arredores de ${to.name}` : ` rumo ${G.Biome.toAt(Math.floor(dest[0]), Math.floor(dest[1]))}`;
    void from;
    log(`${G.cap(why)}: ${group.length} ${nm} partiram${toTxt}${ford ? `, cruzando o rio${crocs ? ' — e os crocodilos esperam na travessia' : ''}` : ''}${preds ? `, com ${preds > 1 ? 'predadores' : 'um predador'} no rastro` : ''}.`, 'deer', cx, cy);
    G.Lore && G.Lore.note('migration', { kind: group[0].kind, n: group.length, where: to.name });
    G.Stories && G.Stories.signal('migration', { kind: group[0].kind, n: group.length, x: cx, y: cy, tx: dest[0], ty: dest[1], ford: !!ford, fx: ford ? ford[0] : 0, fy: ford ? ford[1] : 0, crocs, preds });
  }
  // the savanna herds follow the rains: to the wettest grass when the dry season comes, back to the open plains with the rains
  const SAVANNA = ['gnu', 'zebra', 'gazelle'];
  function rainsTick(dry) {
    const S = G.S; CELL = 26;
    for (const kind of SAVANNA) {
      if (!SP[kind]) continue;
      for (const g of herds(kind)) {
        let cx = 0, cy = 0; for (const a of g) { cx += a.x; cy += a.y; } cx /= g.length; cy /= g.length;
        let best = null, bs = -1e9;
        for (let k = 0; k < 160; k++) {
          const ang = G.R() * TAU, d = G.rr(14, 55); const x = Math.floor(cx + Math.cos(ang) * d), y = Math.floor(cy + Math.sin(ang) * d);
          if (x < 3 || y < 3 || x > N - 4 || y > N - 4) continue; const i = y * N + x;
          if (S.type[i] < T.SAND || S.type[i] === T.RIVER || !A.habitat(SP[kind], i) || !W.sameLand(cx, cy, x + 0.5, y + 0.5)) continue;
          if ([...S.settlements.values()].some(st => G.dist(st.cx, st.cy, x, y) < (st.radius || 8) + 4)) continue;
          const wet = (S.moist ? S.moist[i] / 255 : 0.5) + (waterNear(x, y, 5) ? 0.25 : 0);
          const sc = (dry ? wet : -wet) * 6 + grassQ(x, y, 3) * 2 - d * 0.02;
          if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
        }
        if (!best) continue;
        const here = (S.moist ? S.moist[W.idx(cx, cy)] / 255 : 0.5) + (waterNear(cx, cy, 5) ? 0.25 : 0);
        const there = (S.moist ? S.moist[W.idx(best[0], best[1])] / 255 : 0.5) + (waterNear(best[0], best[1], 5) ? 0.25 : 0);
        if (dry ? there < here + 0.1 : there > here - 0.1) continue;
        move(g, best, dry ? 'a estação seca chegou à savana e a manada segue as chuvas' : 'as chuvas voltaram às planícies', 'rains' + kind + (dry ? 1 : 0), dry ? (waterNear(best[0], best[1], 5) ? 'rumo às margens verdes do rio' : 'rumo às terras mais úmidas') : 'de volta ao capim novo das planícies');
      }
    }
    CELL = 14;
  }
  function grassTick() {
    const S = G.S; const dry = S.weather.drought > 0;
    for (const kind in GRASS) {
      if (!SP[kind]) continue;
      for (const g of herds(kind)) {
        if (g.some(a => S.day - (a.migFrom || -9) < 1.5)) continue;
        let cx = 0, cy = 0; for (const a of g) { cx += a.x; cy += a.y; } cx /= g.length; cy /= g.length;
        const q = grassQ(cx, cy, 6); if (q > (dry ? 0.55 : 0.32)) continue;
        const d = destination(SP[kind], cx, cy, undefined, 18); if (!d || d[2] < q + 0.25) continue;
        move(g, d, dry ? 'a seca secou o capim' : 'o capim acabou', 'grass' + kind);
      }
    }
  }
  // the reindeer go up to the tundra every year and come back to the taiga
  function reindeerTick(up) {
    if (!SP.reindeer) return;
    for (const g of herds('reindeer')) {
      let cx = 0, cy = 0; for (const a of g) { cx += a.x; cy += a.y; } cx /= g.length; cy /= g.length;
      const here = G.S.biome[W.idx(cx, cy)]; const want = up ? 1 : 2; if (here === want) continue;
      const d = destination(SP.reindeer, cx, cy, want, 12); if (!d) continue;
      move(g, d, up ? 'como todo ano, as renas sobem para a tundra para parir' : 'como todo ano, as renas descem para o abrigo da taiga', 'reindeer' + (up ? 1 : 0));
    }
  }

  // ------------------------------ birds in a V ------------------------------
  const BIRDS = { goose: { summer: [2], winter: [3, 0] }, stork: { summer: [0], winter: [5, 3] } };
  Mg.flocks = [];
  function wetland(biomes, near) {
    const S = G.S; let best = null, bs = -1e9;
    for (let k = 0; k < 220; k++) {
      const x = Math.floor(3 + G.R() * (N - 6)), y = Math.floor(3 + G.R() * (N - 6)); const i = y * N + x;
      if (S.type[i] < T.SAND || S.type[i] === T.RIVER || !biomes.includes(S.biome[i]) || !waterNear(x, y, 3)) continue;
      const d = G.dist(x, y, near[0], near[1]); if (d < 22) continue;
      const sc = -Math.abs(d - 45) * 0.1 + G.R();
      if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
    }
    return best;
  }
  function birdTick(toSummer) {
    const S = G.S;
    for (const kind in BIRDS) {
      if (!SP[kind]) continue;
      const birds = [...S.animals.values()].filter(a => a.kind === kind && !a.dead && !a.held && !a.tamed);
      if (birds.length < 3) continue;
      const want = toSummer ? BIRDS[kind].summer : BIRDS[kind].winter;
      const leaving = birds.filter(a => !want.includes(S.biome[W.idx(a.x, a.y)]));
      if (leaving.length < 3) continue;
      let cx = 0, cy = 0; for (const a of leaving) { cx += a.x; cy += a.y; } cx /= leaving.length; cy /= leaving.length;
      const dest = wetland(want, [cx, cy]); if (!dest) continue;
      const take = leaving.slice(0, 14);
      const f = { kind, n: take.length, x: cx, y: cy, sx: cx, sy: cy, tx: dest[0], ty: dest[1], t: 0, ages: take.map(a => a.age || 3) };
      for (const a of take) A.remove(a);
      Mg.flocks.push(f);
      if (!news('bird' + kind + (toSummer ? 1 : 0))) continue;
      const sp = SP[kind]; const dirTxt = dest[1] < cy - 8 ? 'para o norte' : dest[1] > cy + 8 ? 'para o sul' : dest[0] > cx ? 'para o leste' : 'para o oeste';
      log(`${toSummer ? 'Como todo ano, voltam para criar os filhotes' : 'Como todo ano, fogem do frio'}: ${f.n} ${A.plural(sp, f.n).replace(/^\d+ /, '')} passaram em V ${dirTxt}, rumo ${G.Biome.toAt(Math.floor(dest[0]), Math.floor(dest[1]))}.`, 'bird', cx, cy);
      G.Audio && G.Audio.at(cx, cy, 'gull', true);
    }
  }
  function flyFlocks(dt) {
    for (let k = Mg.flocks.length - 1; k >= 0; k--) {
      const f = Mg.flocks[k]; const d = G.dist(f.x, f.y, f.tx, f.ty); const sp = 3.2 * dt;
      if (d <= sp) {
        // landing: the birds walk the new marsh
        for (let q = 0; q < f.n; q++) { const p = W.randomNear(f.tx + G.rr(-2, 2), f.ty + G.rr(-2, 2), 2) || [f.tx, f.ty]; A.spawn(f.kind, p[0], p[1], { grown: 1, age: f.ages[q] || 3 }); }
        Mg.flocks.splice(k, 1); continue;
      }
      f.x += (f.tx - f.x) / d * sp; f.y += (f.ty - f.y) / d * sp; f.t += dt;
      if (G.R() < dt * 0.15) G.Audio && G.Audio.at(f.x, f.y, 'flap');
    }
  }
  // drawn high in the sky, with their shadows racing over the land
  const oldAir = A.drawAir;
  A.drawAir = function (ctx, proj, t, view, zoom) {
    oldAir && oldAir(ctx, proj, t, view, zoom);
    for (const f of Mg.flocks) {
      const gh = W.groundH(f.x, f.y); const p = proj(f.x, f.y, gh);
      if (p[0] < view[0] - 200 || p[0] > view[2] + 200 || p[1] < view[1] - 200 || p[1] > view[3] + 200) continue;
      const q = proj(f.tx, f.ty, gh); const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const z = 60; const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
      const big = f.kind === 'stork';
      for (let k = 0; k < f.n; k++) {
        const row = Math.ceil(k / 2), side = k === 0 ? 0 : k % 2 ? 1 : -1;
        const bx = p[0] - ux * row * 7 + vx * side * row * 6, by = p[1] - uy * row * 7 + vy * side * row * 6;
        ctx.fillStyle = 'rgba(20,30,20,0.12)'; ctx.beginPath(); ctx.ellipse(bx, by + 10, 2.2, 0.9, 0, 0, TAU); ctx.fill();
        const flap = Math.sin(t * 7 + k * 0.7) * 2.2; const s = big ? 1.4 : 1;
        ctx.strokeStyle = big ? '#2a2a2a' : '#4a4438'; ctx.lineWidth = 1.1 * s;
        ctx.beginPath(); ctx.moveTo(bx - 4 * s, by - z + flap); ctx.quadraticCurveTo(bx - 1.6 * s, by - z - 1.2, bx, by - z); ctx.quadraticCurveTo(bx + 1.6 * s, by - z - 1.2, bx + 4 * s, by - z + flap); ctx.stroke();
        ctx.fillStyle = big ? '#f2f0ea' : '#6a6458'; ctx.beginPath(); ctx.ellipse(bx, by - z, 1.3 * s, 0.7 * s, ang, 0, TAU); ctx.fill();
      }
    }
  };

  // ------------------------------ the salmon run ------------------------------
  Mg.run = null; // { falls: [[x, y, tx, ty]], until }
  function startRun() {
    const S = G.S; const falls = ((S.relief && S.relief.falls) || []).filter(f => S.temp && S.temp[W.idx(f.x, f.y)] / 255 < 0.5);
    if (!falls.length) return;
    Mg.run = { falls: falls.slice(0, 8).map(f => [f.x + 0.5, f.y + 0.5, f.tx + 0.5, f.ty + 0.5]), until: S.clock + DAY() * 0.14, day: S.day };
    const f0 = Mg.run.falls[0];
    if (!S.salmonSeen) { S.salmonSeen = S.day; log(`No fim do verão, os salmões sobem o rio contra a correnteza e saltam a cachoeira${where(f0[0], f0[1]).at}. Os ursos já estão esperando na água.`, 'fish', f0[0], f0[1]); }
    // the bears come down to the falls
    for (const a of S.animals.values()) {
      if (a.kind !== 'bear' || a.dead || a.tamed || a.legend) continue;
      let best = null, bd = 30; for (const f of Mg.run.falls) { const d = G.dist(a.x, a.y, f[2], f[3]); if (d < bd) { bd = d; best = f; } }
      if (!best) continue;
      const bank = W.randomNear(best[2] + G.rr(-1, 1), best[3] + G.rr(-1, 1), 2); if (!bank) continue;
      a.hx = bank[0]; a.hy = bank[1]; a.mig = true; a.fishAt = [best[2], best[3]];
    }
  }
  function runTick(dt) {
    const S = G.S; const r = Mg.run; if (!r) return;
    if (S.clock > r.until) { Mg.run = null; for (const a of S.animals.values()) if (a.fishAt) a.fishAt = null; return; }
    // bears at the water: a paw in the river, a salmon in the jaws
    for (const a of S.animals.values()) {
      if (!a.fishAt || a.dead || a.state === 'chase' || a.state === 'flee') continue;
      if (G.dist(a.x, a.y, a.fishAt[0], a.fishAt[1]) > 3.5) continue;
      a.state = 'idle'; a.t = Math.max(a.t || 0, 1); G.faceTo(a, a.fishAt[0] - a.x, a.fishAt[1] - a.y);
      if (G.R() < dt * 0.35) { a.catchT = S.clock + 2.2; a.hunger = Math.max(0, a.hunger - 0.35); G.FX && G.FX.splash(a.fishAt[0] + G.rr(-0.4, 0.4), a.fishAt[1] + G.rr(-0.4, 0.4), 0.4); }
    }
  }
  // people fishing the river during the run catch salmon
  if (G.Waters) { const oldAt = G.Waters.fishAt; G.Waters.fishAt = function (x, y, boat) { const r = Mg.run; if (r && !boat) for (const f of r.falls) if (G.dist(x, y, f[2], f[3]) < 10 && G.R() < 0.75) return 'salmao'; return oldAt(x, y, boat); }; }
  // the leaping fish at the falls
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const leapEnt = { fn: drawLeaps };
  G.renderHooks.ents.push(function (add, view, zoom) { if (!Mg.run || zoom < 0.7) return; for (const f of Mg.run.falls) add(f[2] + f[3] + 0.3, { fn: drawLeaps, f }, f[2], f[3]); void leapEnt; });
  function drawLeaps(c, e, sx, sy, t) {
    const f = e.f; const dx = (f[0] - f[2]), dy = (f[1] - f[3]); const o = G.Render.off(dx, dy);
    for (let k = 0; k < 4; k++) {
      const ph = (t * 0.9 + k * 0.27 + f[0] * 0.13) % 1; if (ph > 0.55) continue;
      const u = ph / 0.55; const x = sx + o[0] * u * 0.8 + (k - 1.5) * 2.2, y = sy + o[1] * u * 0.8 - Math.sin(u * Math.PI) * 9 - u * 4;
      c.save(); c.translate(x, y); c.rotate(-0.7 + u * 1.4); c.fillStyle = '#e88a6a'; c.beginPath(); c.ellipse(0, 0, 2.2, 0.8, 0, 0, TAU); c.fill(); c.fillStyle = '#c8604a'; c.beginPath(); c.moveTo(1.8, 0); c.lineTo(3, -0.8); c.lineTo(3, 0.8); c.fill(); c.restore();
    }
  }
  // a bear with a salmon in its jaws
  Mg.drawCatch = function (c, a, sp) {
    if (!(a.catchT > G.S.clock) || !sp.q) return;
    const q = sp.q; const x = q.len * 0.95, y = -(q.leg + q.h * 0.75);
    c.save(); c.translate(x, y); c.rotate(0.3 + Math.sin(G.S.clock * 9) * 0.25); c.fillStyle = '#e88a6a'; c.beginPath(); c.ellipse(0, 0, 2.2, 0.75, 0, 0, TAU); c.fill(); c.fillStyle = '#c8604a'; c.beginPath(); c.moveTo(1.9, 0); c.lineTo(3, -0.8); c.lineTo(3, 0.8); c.fill(); c.restore();
  };

  // ------------------------------ the year's clock ------------------------------
  let tG = 0, lastPhase = -1, lastDay = -1;
  Mg.update = function (dt) {
    const S = G.S; if (!S || !S.biome) return;
    if (Mg._S !== S) { Mg._S = S; if (!S._flocksLoaded) Mg.reset(); }
    flyFlocks(dt); runTick(dt);
    tG += dt; if (tG >= 20) { tG = 0; grassTick(); }
    if (lastDay !== S.day) { lastDay = S.day; lastPhase = -1; }
    const ph = S.time < 0.1 ? 0 : S.time < 0.2 ? 1 : S.time < 0.55 ? 2 : S.time < 0.66 ? 3 : 4;
    if (ph !== lastPhase) {
      if (lastPhase !== -1) {
        if (ph === 1) { birdTick(true); reindeerTick(true); rainsTick(false); }   // spring: the rains
        if (ph === 3) { birdTick(false); startRun(); rainsTick(true); }          // the end of summer: the dry season
        if (ph === 4) reindeerTick(false);                      // autumn
      }
      lastPhase = ph;
    }
  };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.flocks = Mg.flocks; out.salmonSeen = G.S.salmonSeen || 0; },
    load(o) { Mg.flocks = o.flocks || []; Mg.run = null; G.S.salmonSeen = o.salmonSeen || 0; G.S._flocksLoaded = 1; Mg._S = G.S; },
  });
  Mg.reset = () => { Mg.flocks = []; Mg.run = null; };
})(window.G);
