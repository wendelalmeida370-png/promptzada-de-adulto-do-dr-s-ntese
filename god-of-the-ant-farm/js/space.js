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
