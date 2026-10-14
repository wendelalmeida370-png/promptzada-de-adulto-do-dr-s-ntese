'use strict';
// ============================================================
//  Space: the one conversion between the world's grid and the
//  body's metres. The truth of where anything is stays in the
//  world (v.x, v.y in tiles; heights in height units); the 3D
//  view and the body ask here, and only here.
//    X = x · TILE   (east)      Z = y · TILE   (south)
//    Y = h · HM     (up)
//  A tile is 4 m (a house of one tile is a 4×4 m cottage, a
//  person of 1.75 m fits its door); a height unit is 1.5 m (the
//  sea, G.SEA = 2, lies at 3 m; the hills of 10–20 units are
//  15–28 m). What one can stand on is what the world says one
//  can walk on: the same cliffs, walls, buildings, deep water.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Sp = G.Space = {};
  const TILE = Sp.TILE = 4, HM = Sp.HM = 1.5;
  // the pace of time in the body: one god-speed of the world is too quick for a human walk (D-015)
  Sp.TIME = 0.35;

  Sp.toWorld = (x, y, h) => ({ X: x * TILE, Y: (h === undefined ? W.groundH(x, y) : h) * HM, Z: y * TILE });
  Sp.toTile = (X, Z) => [X / TILE, Z / TILE];
  Sp.size = () => N * TILE; // (the world's side, in metres)
  // the ground under a point in metres: the land, or the water's surface over it
  Sp.groundY = (X, Z) => W.groundH(X / TILE, Z / TILE) * HM;
  // the land itself, under the water too
  Sp.floorY = (X, Z) => W.hAt(X / TILE, Z / TILE) * HM;
  Sp.waterY = (X, Z) => W.waterH(X / TILE, Z / TILE) * HM;
  Sp.seaY = () => G.SEA * HM;
  // the god's screen, for the transition between the two views (never a source of truth)
  Sp.screen = (x, y, h) => G.Render.proj(x, y, h === undefined ? W.groundH(x, y) : h);

  // what is there, at a point, for a body standing on it: asked of the world, not invented. Whether it can be stood
  // on is W.walkable itself — the one rule the people of the world walk by; the kind only says why, for the body
  // kind: 'ground' | 'shallow' (wading water) | 'deep' (water over one's head) | 'cliff' | 'building' | 'wall' | 'edge'
  Sp.surface = function (X, Z) {
    const S = G.S; const x = X / TILE, y = Z / TILE;
    if (!W.inb(x, y)) return { kind: 'edge', walk: false, i: -1 };
    const i = W.idx(x, y); const t = S.type[i];
    const ice = !!(S.ice && S.ice[i]), dry = !!(S.dry && S.dry[i]);
    if (W.walkable(i)) return { kind: t === T.RIVER && !ice && !S.road[i] ? 'shallow' : 'ground', walk: true, i, road: S.road[i], ice, dry };
    if (t <= T.RIVER) return { kind: S.cliff[i] ? 'cliff' : 'deep', walk: false, i };
    if (S.cliff[i]) return { kind: 'cliff', walk: false, i };
    if (W.blocked(i)) return { kind: 'building', walk: false, i, b: S.occ[i] };
    return { kind: 'wall', walk: false, i };
  };
  // a tile index can be stood on (the same rule, for the controller's quick tests)
  Sp.walk = i => i >= 0 && W.walkable(i);
  // a boulder's stones, one shape for the drawing and for the feet: the big one (twelve faces, as big as what is left
  // of it, a quarter sunk in the ground) and, beside a big one, a small one half sunk
  let stoneMemo = new Map();
  G.worldHooks.push(() => { stoneMemo = new Map(); });
  // (in tenths of what it was: a stone quarried a little does not change its shape, and the drawing remakes it on each tenth)
  Sp.stoneSize = r => Math.round(G.clamp(r.stone / Math.max(1, r.max || r.stone), 0.2, 1) * 10);
  Sp.stones = function (r) {
    const q = Sp.stoneSize(r); const m = stoneMemo.get(r.id); if (m && m.q === q && m.x === r.x && m.y === r.y && m.tv === G.S.typeVer) return m.list;
    const sc = 0.8 + 0.16 * q; const X = r.x * TILE, Z = r.y * TILE, Y = W.groundH(r.x, r.y) * HM;
    const list = [{ X, Y: Y + sc * 0.25, Z, ry: G.hash(r.id) * Math.PI * 2, sx: sc * 1.4, sy: sc, sz: sc * 1.2 }];
    if (!r.meteor && sc > 1.2) list.push({ X: X + Math.cos(r.id) * sc * 0.9, Y: Y + sc * 0.05, Z: Z + Math.sin(r.id) * sc * 0.9, ry: r.id, sx: sc * 0.55, sy: sc * 0.4, sz: sc * 0.5 });
    if (stoneMemo.size > 4000) stoneMemo.clear();
    stoneMemo.set(r.id, { q, x: r.x, y: r.y, tv: G.S.typeVer, list }); return list;
  };
  // the twelve faces of that stone (three.js's dodecahedron of radius 0.5): their normals, and how far each lies from the centre
  const FN = []; { const ph = (1 + Math.sqrt(5)) / 2, l = Math.hypot(ph, 1), a = ph / l, c = 1 / l; for (const s1 of [1, -1]) for (const s2 of [1, -1]) FN.push([0, a * s1, c * s2], [a * s1, c * s2, 0], [c * s1, 0, a * s2]); }
  const FD = 0.5 * 0.7946544722917661;
  // the top of one stone over a point (metres), or -Infinity beside it: the lowest of its upper faces there
  function stoneTop(st, X, Z) {
    const cs = Math.cos(st.ry), sn = Math.sin(st.ry); const qx = X - st.X, qz = Z - st.Z; let top = Infinity, bot = -Infinity;
    for (const n of FN) {
      // (a face in the world: its normal through the stone's size and turn)
      const ax = n[0] / st.sx, ay = n[1] / st.sy, az = n[2] / st.sz; const mx = cs * ax + sn * az, mz = -sn * ax + cs * az;
      const k = FD - mx * qx - mz * qz;
      if (ay === 0) { if (k < 0) return -Infinity; continue; }
      const y = k / ay; if (ay > 0) { if (y < top) top = y; } else if (y > bot) bot = y;
    }
    return top >= bot ? st.Y + top : -Infinity;
  }
  // the top of the stones under a point, where a body standing there has its feet (-Infinity: no stone there)
  Sp.stoneTop = function (X, Z) {
    const S = G.S; const x0 = Math.floor(X / TILE), y0 = Math.floor(Z / TILE); let best = -Infinity;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = x0 + dx, y = y0 + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue;
      const o = S.objAt[y * N + x]; const r = o && S.rocks.get(o); if (!r) continue;
      for (const st of Sp.stones(r)) { const t = stoneTop(st, X, Z); if (t > best) best = t; }
    }
    return best;
  };
  // the chunk a point is in, and the point in the chunk's own frame (64×64 m; the base of a floating origin, the day
  // the map grows past what single floats carry well — today 256 tiles are 1 km, far inside it)
  Sp.CHUNK = 16;
  Sp.chunk = (X, Z) => { const L = TILE * Sp.CHUNK; const cx = Math.floor(X / L), cy = Math.floor(Z / L); return { cx, cy, lx: X - cx * L, lz: Z - cy * L }; };
  // the tile a point is on (an index), or -1 out of the world
  Sp.tileAt = (X, Z) => { const x = X / TILE, y = Z / TILE; return W.inb(x, y) ? W.idx(x, y) : -1; };
  // where a person is, in metres (the 3D view draws the person here; the body is placed from here)
  // (which way someone faces is the view's own business: it follows their steps, the world keeps no such field)
  Sp.of = v => ({ X: v.x * TILE, Y: W.groundH(v.x, v.y) * HM, Z: v.y * TILE });
})(window.G);
