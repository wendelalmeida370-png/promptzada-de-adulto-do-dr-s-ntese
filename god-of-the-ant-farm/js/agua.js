'use strict';
// ============================================================
//  Agua: the water as the world keeps it, read only (21c,
//  NATUREZA.md §3.2, D-466, D-505). The world keeps one level
//  of water per tile (S.wl), the falls of its rivers
//  (S.relief.falls), the rain each tile caught (S.wet) — and
//  throws away which way its rivers run. Here, from what the
//  save has: the current of every river and lake (its way, its
//  speed, how much water passes), every step of water between
//  two tiles (the named falls, the rapids), the colour of each
//  water by its place (the tropics, the cold, the mud, the reef,
//  the glacier, the river turbid after the rain), where the foam
//  has a cause, the distance to the shore the breakers run to,
//  the wet of the ground and its puddles, and the height of the
//  drawn wave (the very sum the water's shader makes: what
//  floats on it is drawn on it).
//  Pure: no chance (neither the world's nor the view's), no
//  clock of the wall, no three.js, nothing written to the world.
//  The current is made whole when asked and the land changed
//  (S.typeVer, W.touchWalk) — never a little each frame: phase B
//  will read it in the world's step (the current that pushes the
//  swimmer), and the leap and the step must not part.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Ag = G.Agua = {};
  // (the body's metres: a tile is 4 m, a height unit 1,5 m — the Space's own numbers, the same here: the world's grid never changes)
  const TL = 4, HM = 1.5;
  Ag.TL = TL; Ag.HM = HM;
  // a step of water worth drawing (m): below it the two faces meet as one
  Ag.STEP = 0.05;
  // a step that is a fall, not a rapid (m): the world names its falls from 0,8 height units (1,2 m) up
  Ag.FALL = 1.2;
  const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const isRiver = (S, i) => S.type[i] === T.RIVER;
  const isSea = (S, i) => S.type[i] <= T.SEA && !(S.dry && S.dry[i]);
  // (the level of the water's face of a tile, in height units: a river's own, the sea's; NaN on land or on the parted sea)
  function level(S, i) { const t = S.type[i]; if (t === T.RIVER) return S.wl[i]; if (t <= T.SEA && !(S.dry && S.dry[i])) return G.SEA; return NaN; }
  Ag.level = i => level(G.S, i);

  // ------------------------------ the current ------------------------------
  // The world's rivers fall to the sea, level by level, and its lakes lie level. Each river tile runs toward its mouth: the way
  // found by walking up every river from the sea (never down a level going up: the water comes down), and the lakes with no way
  // out — the rivers the world shrank into a basin — drain to their lowest pool. The way is the fall of that distance; the
  // discharge, how many tiles of river drain through a tile (the same tree); the speed (m/s), from the slope of the water's
  // face, the discharge and how wide the water lies (a lake is still in its middle). The sea has no current here: its waves
  // run with the wind and to the shore.
  let memo = null;
  G.worldHooks.push(() => { memo = null; });
  const keyOf = S => S === (memo && memo.S) && memo.N === N && memo.tv === (S.typeVer || 0) && memo.wv === (S.walkVer || 0);
  Ag.field = function () { const S = G.S; if (memo && keyOf(S)) return memo; memo = build(S); return memo; };
  // (made from nothing, without the memory: the verifier compares the two)
  Ag.fresh = () => build(G.S);
  function build(S) {
    const NN = N * N, wl = S.wl;
    const D = new Float32Array(NN).fill(Infinity), par = new Int32Array(NN).fill(-1);
    const h = new G.Heap();
    const grow = () => { while (h.size) { const a = h.pop(); const ax = a % N, ay = (a / N) | 0;
      for (let k = 0; k < 8; k++) { const nx = ax + D8[k][0], ny = ay + D8[k][1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx;
        if (!isRiver(S, j) || wl[j] < wl[a] - 0.02) continue;
        // (a diagonal only where the water passes between the two tiles beside it, not across a corner of land)
        if (k >= 4 && !isRiver(S, ay * N + nx) && !isRiver(S, ny * N + ax)) continue;
        const c = D[a] + (k >= 4 ? 1.4142 : 1); if (c < D[j] - 1e-6) { D[j] = c; par[j] = a; h.push(j, c); } } } };
    // the mouths: a river beside the open sea, or at the edge of the map
    for (let i = 0; i < NN; i++) { if (!isRiver(S, i)) continue; const x = i % N, y = (i / N) | 0; let m = -1;
      for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) { m = -2; break; } const j = ny * N + nx; if (isSea(S, j)) { m = j; break; } }
      if (m !== -1) { D[i] = 1; par[i] = m; h.push(i, 1); } }
    grow();
    // the basins: each body of water no way down reaches drains to its lowest pool
    const seen = new Uint8Array(NN); const stack = [];
    for (let i = 0; i < NN; i++) { if (seen[i] || !isRiver(S, i) || D[i] < Infinity) continue;
      const comp = []; let lo = Infinity; stack.push(i); seen[i] = 1;
      while (stack.length) { const a = stack.pop(); comp.push(a); if (wl[a] < lo) lo = wl[a]; const ax = a % N, ay = (a / N) | 0;
        for (const [dx, dy] of D4) { const nx = ax + dx, ny = ay + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (!seen[j] && isRiver(S, j) && D[j] === Infinity) { seen[j] = 1; stack.push(j); } } }
      for (const a of comp) if (wl[a] <= lo + 0.02) { D[a] = 0.5; par[a] = -3; h.push(a, 0.5); } }
    grow();
    // the discharge: every tile gives its own and what came to it to the tile it runs to — farthest first
    const ord = []; for (let i = 0; i < NN; i++) if (isRiver(S, i) && D[i] < Infinity) ord.push(i);
    ord.sort((a, b) => D[b] - D[a] || a - b);
    const q = new Float32Array(NN); for (const i of ord) { q[i] += 1; const p = par[i]; if (p >= 0 && isRiver(S, p)) q[p] += q[i]; }
    // the way, the slope and the speed
    const dx = new Float32Array(NN), dz = new Float32Array(NN), sp = new Float32Array(NN);
    for (const i of ord) {
      const x = i % N, y = (i / N) | 0; let gx = 0, gz = 0;
      if (par[i] !== -3) for (let k = 0; k < 8; k++) { const nx = x + D8[k][0], ny = y + D8[k][1]; let dj;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) dj = k < 4 ? 0 : NaN; else { const j = ny * N + nx; dj = isSea(S, j) ? (k < 4 ? 0 : NaN) : isRiver(S, j) ? D[j] : NaN; }
        if (!(dj === dj) || dj === Infinity) continue; const l = k >= 4 ? 1.4142 : 1; const g = (D[i] - dj) / l; if (g > 0) { gx += D8[k][0] / l * g; gz += D8[k][1] / l * g; } }
      const l = Math.hypot(gx, gz); if (l < 1e-6) continue; dx[i] = gx / l; dz[i] = gz / l;
      // (the slope of the face toward where it runs: a step down is a torrent)
      const p = par[i]; const lp = p >= 0 ? level(S, p) : p === -2 ? wl[i] : NaN; const run = p >= 0 ? Math.hypot((p % N) - x, ((p / N) | 0) - y) * TL : TL;
      const slope = lp === lp ? G.clamp((wl[i] - lp) * HM / run, 0, 0.8) : 0;
      // (how wide the water lies at its own level: the middle of a lake hardly moves)
      let wide = 0; for (let ey = -2; ey <= 2; ey++) for (let ex = -2; ex <= 2; ex++) { const nx = x + ex, ny = y + ey; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (isRiver(S, j) && Math.abs(wl[j] - wl[i]) < 0.05) wide++; }
      const flowK = 0.55 + 0.45 * Math.min(1, Math.log2(1 + q[i]) / 5);
      sp[i] = G.clamp((0.3 + 2.4 * Math.sqrt(slope)) * flowK * (1 - 0.88 * G.smooth(0.42, 0.9, wide / 25)), 0, 3);
    }
    // (the way smoothed along the river: a bend turns, it does not snap tile to tile)
    for (let r = 0; r < 2; r++) { const px = dx.slice(), pz = dz.slice();
      for (const i of ord) { if (!sp[i]) continue; const x = i % N, y = (i / N) | 0; let sx = px[i] * 2, sz = pz[i] * 2;
        for (const [ex, ey] of D4) { const nx = x + ex, ny = y + ey; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (isRiver(S, j) && sp[j] && Math.abs(wl[j] - wl[i]) < 0.3) { sx += px[j]; sz += pz[j]; } }
        const l = Math.hypot(sx, sz); if (l > 1e-4) { dx[i] = sx / l; dz[i] = sz / l; } } }
    const sh = shoreOf(S);
    return { S, N, tv: S.typeVer || 0, wv: S.walkVer || 0, D, par, q, dx, dz, sp, dist: sh.dist, cx: sh.cx, cz: sh.cz, reach: ord.length, river: ord.length + countUnreached(S, D) };
  }
  function countUnreached(S, D) { let n = 0; for (let i = 0; i < N * N; i++) if (isRiver(S, i) && D[i] === Infinity) n++; return n; }
  // (the current of a tile: its way [x, z] (a unit, or nought), its speed in m/s, its discharge in tiles of river; none on the
  // sea, on land, under the ice of a sudden winter)
  Ag.flow = function (i) { const f = Ag.field(), S = G.S; if (!isRiver(S, i) || (S.ice && S.ice[i])) return { x: 0, z: 0, sp: 0, q: 0 }; return { x: f.dx[i], z: f.dz[i], sp: f.sp[i], q: f.q[i] }; };

  // ------------------------------ the shore ------------------------------
  // how far each tile of the sea lies from the land (m, to the nearest land's edge), and which way the land is: the breakers
  // come in square to the beach, their crests along it — the lines of equal distance. Two passes of a chamfer, from the land
  function shoreOf(S) {
    const NN = N * N; const d = new Float32Array(NN).fill(1e6);
    for (let i = 0; i < NN; i++) if (!isSea(S, i)) d[i] = 0;
    const A = 1, B = 1.4142;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; let v = d[i]; if (!v) continue;
      if (x > 0) v = Math.min(v, d[i - 1] + A); if (y > 0) { v = Math.min(v, d[i - N] + A); if (x > 0) v = Math.min(v, d[i - N - 1] + B); if (x < N - 1) v = Math.min(v, d[i - N + 1] + B); } d[i] = v; }
    for (let y = N - 1; y >= 0; y--) for (let x = N - 1; x >= 0; x--) { const i = y * N + x; let v = d[i]; if (!v) continue;
      if (x < N - 1) v = Math.min(v, d[i + 1] + A); if (y < N - 1) { v = Math.min(v, d[i + N] + A); if (x < N - 1) v = Math.min(v, d[i + N + 1] + B); if (x > 0) v = Math.min(v, d[i + N - 1] + B); } d[i] = v; }
    const dist = new Float32Array(NN), cx = new Float32Array(NN), cz = new Float32Array(NN);
    for (let i = 0; i < NN; i++) dist[i] = d[i] > 0 ? Math.min(d[i] - 0.5, 60) * TL : 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; if (!dist[i]) continue;
      const a = dist[y * N + Math.max(0, x - 1)], b = dist[y * N + Math.min(N - 1, x + 1)], c = dist[Math.max(0, y - 1) * N + x], e = dist[Math.min(N - 1, y + 1) * N + x];
      const gx = b - a, gz = e - c; const l = Math.hypot(gx, gz); if (l > 1e-4) { cx[i] = -gx / l; cz[i] = -gz / l; } }
    return { dist, cx, cz };
  }
  // (a tile of the sea: [the distance to the shore (m), the way to the land x, z])
  Ag.shore = function (i) { const f = Ag.field(); return [f.dist[i], f.cx[i], f.cz[i]]; };
  // (the distance to the shore at a point (m in, m out), read between the tiles' centres as the shader reads its picture)
  Ag.shoreAt = function (X, Z) { const f = Ag.field(); const gx = X / TL - 0.5, gz = Z / TL - 0.5; const x0 = Math.floor(gx), z0 = Math.floor(gz), fx = gx - x0, fz = gz - z0;
    const at = (x, z) => f.dist[G.clamp(z, 0, N - 1) * N + G.clamp(x, 0, N - 1)];
    return (at(x0, z0) * (1 - fx) + at(x0 + 1, z0) * fx) * (1 - fz) + (at(x0, z0 + 1) * (1 - fx) + at(x0 + 1, z0 + 1) * fx) * fz; };

  // ------------------------------ the steps of the water ------------------------------
  // Where two tiles of water side by side lie at different levels, the water spills from the higher over their shared side: a
  // fall from a world's fall (S.relief.falls, its name too), a rapid below that — the 3D draws its sheet, the god's view its
  // lip. Not across a bridge (the deck is the feet's), a building or a parted sea; frozen under the ice of a sudden winter.
  // Each: the two tiles (i the higher, j the lower), the shared side (from a to b, in tiles), the way out of the higher (n),
  // the faces (m: the river's face is drawn 5 cm over its level), the drop, the discharge and the speed coming over it
  let fallIx = null, fallFor = null, fallLen = -1;
  function fallsAt(S) {
    const L = (S.relief && S.relief.falls) || []; if (fallFor === L && fallLen === L.length && fallIx) return fallIx;
    fallIx = new Map(); fallFor = L; fallLen = L.length; for (const f of L) fallIx.set((f.y * N + f.x) * 4 + dirOf(f.tx - f.x, f.ty - f.y), f); return fallIx;
  }
  G.worldHooks.push(() => { fallIx = null; fallFor = null; fallLen = -1; });
  const dirOf = (dx, dy) => (dx > 0 ? 0 : dx < 0 ? 1 : dy > 0 ? 2 : 3);
  // (the face of a tile's water as the 3D draws it, m)
  const faceOf = (S, i) => (S.type[i] === T.RIVER ? S.wl[i] * HM + 0.05 : G.SEA * HM);
  Ag.face = i => faceOf(G.S, i);
  Ag.steps = function (x0, y0, w, h) {
    const S = G.S; const out = []; const fi = fallsAt(S); const fl = Ag.field();
    const xa = Math.max(0, x0 | 0), ya = Math.max(0, y0 | 0), xb = Math.min(N, (x0 | 0) + (w | 0)), yb = Math.min(N, (y0 | 0) + (h | 0));
    for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) {
      const i = y * N + x; if (!isRiver(S, i)) continue;
      for (let k = 0; k < 4; k++) {
        const nx = x + D4[k][0], ny = y + D4[k][1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx;
        const lj = level(S, j); if (!(lj === lj)) continue;
        const top = faceOf(S, i), low = faceOf(S, j); const drop = top - low; if (drop < Ag.STEP) continue;
        if (S.road[i] || S.road[j] || S.occ[i] || S.occ[j]) continue;
        const [ex, ey] = D4[k]; const ax = ex > 0 ? x + 1 : ex < 0 ? x : x, ay = ey > 0 ? y + 1 : ey < 0 ? y : y, bx = ex !== 0 ? ax : x + 1, by = ex !== 0 ? y + 1 : ay;
        const f = fi.get(i * 4 + k) || null;
        out.push({ i, j, x, y, tx: nx, ty: ny, ax, ay, bx, by, nx: ex, ny: ey, top, low, drop, q: fl.q[i] || 1, sp: fl.sp[i] || 0, fall: f, name: f && f.name || '', kind: drop >= Ag.FALL ? 'queda' : 'corredeira',
          frozen: !!(S.ice && (S.ice[i] || S.ice[j])), sea: !isRiver(S, j) });
      }
    }
    return out;
  };

  // ------------------------------ the colour of the water ------------------------------
  // what a water is by its place, as the god's view tells them apart: the warm sea turquoise over its sand, the mild one
  // blue-green, the cold one grey-green; the reef bright, the mud of a mangrove coast and the kelp dark; the stream of a
  // mountain clear, the river of a glacier milky, the slow river of the plain green-brown, the tea of a jungle or a swamp,
  // the sandy brown of a dry land's river; a lake by its warmth; the pool under a fall in the warm lands turquoise. And the
  // river after the rain turbid with the earth it washed down (S.wet round it). [r, g, b] (sRGB, the colour over clear sand),
  // its clearness (1 a clear sea; less, the sooner it hides what is under it), its kind, how turbid
  const PAL = {
    quente: [[68, 198, 194], 1.0], ameno: [[70, 166, 170], 0.78], frio: [[74, 130, 134], 0.58], recife: [[58, 212, 200], 1.2], mangue: [[116, 130, 92], 0.32], alga: [[62, 120, 102], 0.6],
    montanha: [[100, 168, 152], 0.95], glacial: [[150, 204, 208], 0.38], planicie: [[106, 126, 94], 0.42], cha: [[108, 90, 56], 0.3], barrento: [[148, 122, 82], 0.3],
    lago: [[60, 132, 138], 0.62], lagoFrio: [[66, 122, 134], 0.72], lagoQuente: [[64, 170, 160], 0.82], poco: [[70, 196, 186], 1.0],
  };
  Ag.PAL = PAL;
  const MUD = [142, 112, 72];
  Ag.look = function (i) {
    const S = G.S; const tp = S.temp ? S.temp[i] / 255 : 0.5; const x = i % N, y = (i / N) | 0; let kind;
    if (S.type[i] <= T.SEA) {
      const F = G.Sea && G.Sea.F, fl = G.Sea && G.Sea.floor ? G.Sea.floor[i] : 0;
      kind = F && fl === F.REEF ? 'recife' : F && fl === F.MUD ? 'mangue' : F && fl === F.KELP ? 'alga' : tp > 0.58 ? 'quente' : tp < 0.34 ? 'frio' : 'ameno';
    } else if (S.type[i] === T.RIVER) {
      const f = Ag.field(); const alt = S.wl[i] - G.SEA; const bio = S.biome ? S.biome[i] : 0;
      let n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N && isRiver(S, ny * N + nx)) n++; }
      const lake = n >= 13;
      // (a pool a fall pours into, in the warm lands: the turquoise of the reference)
      let pool = false; if (tp > 0.5) for (const [ex, ey] of D4) { const nx = x + ex, ny = y + ey; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (isRiver(S, j) && (S.wl[j] - S.wl[i]) * HM >= Ag.FALL) { pool = true; break; } }
      if (pool) kind = 'poco';
      else if (tp < 0.3 && alt > 4) kind = 'glacial';
      else if (lake) kind = tp > 0.58 ? 'lagoQuente' : tp < 0.34 ? 'lagoFrio' : 'lago';
      else if (alt > 3 || f.sp[i] > 1.1) kind = 'montanha';
      else kind = bio === 4 || bio === 3 ? 'cha' : bio === 5 || bio === 6 ? 'barrento' : 'planicie';
    } else return null;
    const p = PAL[kind]; const tur = Ag.turbid(i);
    const col = tur > 0 ? G.lerpColor(p[0], MUD, tur * 0.7) : p[0].slice();
    return { kind, col, clar: p[1] * (1 - 0.72 * tur), tur };
  };
  // (how turbid a water is now: the rain the land round it holds (S.wet) washing down a river — and, a little, the sea at its
  // mouth; 0 for the still sea and the lakes' middle)
  Ag.turbid = function (i) {
    const S = G.S; if (!S.wet) return 0; const x = i % N, y = (i / N) | 0; const riv = isRiver(S, i);
    if (!riv && !(S.type[i] <= T.SEA)) return 0;
    let w = 0, n = 0, mouth = riv;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; const t = S.type[j];
      if (t >= T.SAND) { w += S.wet[j]; n++; } else if (t === T.RIVER) mouth = true; }
    if (!n || !mouth) return 0; return G.clamp((w / n - 0.22) * 1.7, 0, 1) * (riv ? 1 : 0.55);
  };

  // ------------------------------ the foam ------------------------------
  // foam only where it has a cause: [churn — the foot of a fall or a rapid, carried down the river a few tiles, by its drop
  // and the water over it; edge — where the current runs against a bank or a stone of the world (S.rocks) standing in it]
  Ag.foam = function (i) {
    const S = G.S; if (!isRiver(S, i) || (S.ice && S.ice[i])) return [0, 0]; const f = Ag.field(); const x = i % N, y = (i / N) | 0;
    let churn = 0;
    // (the foot of a step: this tile under one, or a few tiles down from one)
    let c = i; for (let k = 0; k < 4 && c >= 0; k++) { const cx = c % N, cy = (c / N) | 0;
      for (const [ex, ey] of D4) { const nx = cx + ex, ny = cy + ey; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (!isRiver(S, j)) continue;
        const d = (S.wl[j] - S.wl[c]) * HM; if (d >= Ag.STEP) churn = Math.max(churn, G.clamp(0.25 + d * 0.22, 0, 1) * Math.min(1, 0.4 + Math.log2(1 + f.q[j]) * 0.15) * (1 - k * 0.28)); }
      const p = f.par[c]; c = p >= 0 && isRiver(S, p) ? p : -1; }
    // (the current against the land: a bank beside a running river, a stone standing in it)
    let edge = 0; const sp = f.sp[i];
    if (sp > 0.25) for (let k = 0; k < 8; k++) { const nx = x + D8[k][0], ny = y + D8[k][1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx;
      const oid = S.objAt[j]; const rock = oid && S.rocks.get(oid);
      if (rock) edge = Math.max(edge, G.clamp(sp * 0.55, 0, 1) * (k < 4 ? 1 : 0.7));
      else if (S.type[j] >= T.SAND && k < 4) edge = Math.max(edge, G.clamp((sp - 0.25) * 0.5, 0, 0.7) * Math.max(0, f.dx[i] * D8[k][0] + f.dz[i] * D8[k][1] + 0.4)); }
    return [G.clamp(churn, 0, 1), G.clamp(edge, 0, 1)];
  };

  // ------------------------------ the rain that wets ------------------------------
  // how wet a tile of land is now (0..1): what the world keeps of the rain that fell on it (S.wet, drying in days) and the rain
  // falling on it now (the storm's, a cloud's); and the spray of a fall wets the rock round its foot
  Ag.rainNow = function (x, y) { const S = G.S; const w = S.weather ? S.weather.rain || 0 : 0; return Math.max(w, G.Nature && G.Nature.rainAt ? G.Nature.rainAt(x, y) : 0); };
  Ag.wet = function (i) {
    const S = G.S; if (S.type[i] <= T.RIVER && !(S.dry && S.dry[i])) return 0; const x = i % N, y = (i / N) | 0;
    return G.clamp(Math.max(S.wet ? S.wet[i] : 0, Ag.rainNow(x + 0.5, y + 0.5) * 0.9), 0, 1);
  };
  // (the spray of the falls: the land a fall's foot wets round it, by its drop — a map, made with the current)
  Ag.spray = function (i) { const f = Ag.field(); if (!f.spray) f.spray = sprayOf(G.S); return f.spray[i] / 255; };
  function sprayOf(S) {
    const m = new Uint8Array(N * N);
    for (const s of Ag.steps(0, 0, N, N)) { if (s.drop < 0.8 || s.frozen) continue; const R = 1 + Math.min(3, s.drop / 3); const cx = s.tx + 0.5, cy = s.ty + 0.5;
      for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) { if (x < 0 || y < 0 || x >= N || y >= N) continue;
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); const v = Math.round(255 * G.clamp(1 - d / (R + 0.5), 0, 1) * G.clamp(s.drop / 4, 0.3, 1)); const j = y * N + x; if (v > m[j]) m[j] = v; } }
    return m;
  }
  // where the rain pools: flat ground, in patches of a metre or two that are always the same (the place's own, G.hash) — the
  // potential of a point (tiles in), 0..1; the puddle shows where it is wet enough. None on water, a building, a steep slope
  Ag.puddle = function (x, y) {
    const S = G.S; if (!W.inb(x, y)) return 0; const i = W.idx(x, y); const t = S.type[i];
    if (t <= T.RIVER || S.occ[i] || S.wall[i] || S.cliff[i]) return 0;
    const e = 0.2; const gx = (W.hAt(x + e, y) - W.hAt(x - e, y)) * HM / (2 * e * TL), gz = (W.hAt(x, y + e) - W.hAt(x, y - e)) * HM / (2 * e * TL);
    const flat = 1 - G.smooth(0.02, 0.07, Math.hypot(gx, gz)); if (flat <= 0) return 0;
    // (the blobs: a smooth noise over cells of 1,6 m, the seed's own)
    const sd = (S.seed | 0) * 7 + 3; const cs = TL / 2.5; const u = x * TL / cs, v = y * TL / cs; const u0 = Math.floor(u), v0 = Math.floor(v), fu = u - u0, fv = v - v0;
    const hh = (a, b) => G.hash(((a + sd) * 73856093) ^ (b * 19349663));
    const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
    const n = (hh(u0, v0) * (1 - su) + hh(u0 + 1, v0) * su) * (1 - sv) + (hh(u0, v0 + 1) * (1 - su) + hh(u0 + 1, v0 + 1) * su) * sv;
    // (the worn ways and the roads hold the rain more: the earth trodden hard)
    const worn = S.road[i] ? 0.12 : G.pathLevel ? Math.min(0.12, G.pathLevel(S.wear[i]) * 0.05) : 0;
    return G.clamp((n + worn - 0.58) * 4, 0, 1) * flat;
  };

  // ------------------------------ the drawn wave ------------------------------
  // The waves the water's shader moves its face by: three trains (two across, one with the wind), long on the sea and short on
  // a river, none in the last decimetres over the bed, never more than 15 cm up or down — the swimmer and the ship stay at the
  // world's flat level (W.waterH) and the drawn face never leaves them: the cap is the world's (D-506). One sum, two tongues:
  // this one for what is drawn on the water (the ships, the proofs), and the shader's own (Ag.waveGLSL), made from the very
  // same numbers. wind: the 3D's (R3.U.wind: [x, y, strength]); sea: 1 the sea's level, 0 a river or a lake; dep: how deep
  // the bed lies under the flat face (m)
  const WV = Ag.WAVE = { a1: 0.045, k1: 0.33, w1: 1.3, a2: 0.035, k2: 0.29, w2: 1.05, a3: 0.07, k3: 0.21, w3: 1.4, base: 0.35, wk: 0.5, river: 0.3, d0: 0.05, d1: 0.9, cap: 0.15 };
  Ag.waveY = function (X, Z, t, wind, sea, dep) {
    const wx = wind[0] + 0.001, wz = wind[1] + 0.001; const wl = Math.hypot(wx, wz); const ws = wind[2] || 0;
    const sw = (WV.base + ws * WV.wk) * (sea ? 1 : WV.river);
    const h = Math.sin(X * WV.k1 + t * WV.w1) * WV.a1 + Math.cos(Z * WV.k2 + t * WV.w2) * WV.a2 + Math.sin((X * wx + Z * wz) / wl * WV.k3 - t * WV.w3) * WV.a3 * sw;
    return G.clamp(h * G.smooth(WV.d0, WV.d1, dep), -WV.cap, WV.cap);
  };
  const f5 = v => { const s = String(+v); return s.includes('.') || s.includes('e') ? s : s + '.0'; };
  // (the shader's twin, from the same numbers: p the point (m), t the view's clock, wind as above, sea, dep)
  Ag.waveGLSL = function () {
    return `float aguaWaveY(vec2 p, float t, vec3 wind, float sea, float dep) {
  vec2 wd = normalize(wind.xy + vec2(0.001)); float sw = (${f5(WV.base)} + wind.z * ${f5(WV.wk)}) * mix(${f5(WV.river)}, 1.0, sea);
  float h = sin(p.x * ${f5(WV.k1)} + t * ${f5(WV.w1)}) * ${f5(WV.a1)} + cos(p.y * ${f5(WV.k2)} + t * ${f5(WV.w2)}) * ${f5(WV.a2)} + sin(dot(p, wd) * ${f5(WV.k3)} - t * ${f5(WV.w3)}) * ${f5(WV.a3)} * sw;
  return clamp(h * smoothstep(${f5(WV.d0)}, ${f5(WV.d1)}, dep), -${f5(WV.cap)}, ${f5(WV.cap)});
}`;
  };

  // ------------------------------ for the verifier ------------------------------
  // (the current against the land: every tile with a way has speed and lies on water; a lake's middle slow; nothing on the sea)
  Ag.check = function (n) {
    const S = G.S, f = Ag.field(); const out = []; const m = Math.min(n || 400, N * N);
    for (let q = 0; q < m; q++) { const i = Math.floor(G.hash(q * 7919 + (S.day | 0)) * N * N); const l = Math.hypot(f.dx[i], f.dz[i]);
      if (!isRiver(S, i) && (l > 1e-6 || f.sp[i] > 0)) out.push(`corrente fora da água em ${i % N},${(i / N) | 0}`);
      if (!(f.sp[i] >= 0 && f.sp[i] <= 3) || !(l === 0 || Math.abs(l - 1) < 1e-3)) out.push(`corrente sem número em ${i % N},${(i / N) | 0}`); }
    return out;
  };
})(window.G);
