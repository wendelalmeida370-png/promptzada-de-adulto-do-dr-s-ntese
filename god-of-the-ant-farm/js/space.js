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
  // the bed of the rivers and lakes as the 3D carves it (metres below the world's own height): the world keeps one height
  // per corner and one level of water per tile, so a ford's bed sits at the water's face. Here it sinks inside a river tile —
  // to the shins in a ford, out of one's depth where the world says deep — and rises back to the world's height at the banks.
  // The feet of the body and of everyone drawn, and the land's picture, all stand on it
  Sp.bedDrop = function (x, y) {
    const S = G.S; const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= N || ty >= N) return 0;
    const i = ty * N + tx; if (S.type[i] !== T.RIVER || S.road[i] || (S.ice && S.ice[i])) return 0;
    const drop = W.hAt(x, y) * HM - (S.wl[i] * HM - (S.deep[i] ? 1.75 : 0.42)); if (drop <= 0) return 0;
    // (how far the point is from the land round the tile: nothing at the bank, all of it half a tile in)
    let d = 1;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = tx + dx, ny = ty + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const j = ny * N + nx; if (S.type[j] <= T.RIVER && !S.road[j]) continue;
      const ex = dx < 0 ? x - tx : tx + 1 - x, ey = dy < 0 ? y - ty : ty + 1 - y;
      const dd = dx && dy ? Math.hypot(ex, ey) : dx ? ex : ey; if (dd < d) d = dd;
    }
    return drop * G.smooth(0, 0.42, d);
  };
  // (between the points of the land's picture — every half tile — as the picture itself has it: what the feet stand on)
  Sp.bedAt = function (x, y) {
    const S = G.S; const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= N || ty >= N) return 0;
    let wet = false; for (let dy = -1; dy <= 1 && !wet; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = tx + dx, ny = ty + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N && S.type[ny * N + nx] === T.RIVER) { wet = true; break; } }
    if (!wet) return 0;
    const gx = x * 2, gy = y * 2, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const a = Sp.bedDrop(x0 / 2, y0 / 2), b = Sp.bedDrop((x0 + 1) / 2, y0 / 2), c = Sp.bedDrop(x0 / 2, (y0 + 1) / 2), d = Sp.bedDrop((x0 + 1) / 2, (y0 + 1) / 2);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
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
  // ------------------------------ the floor of a building ------------------------------
  // (a house stands on a plinth over the highest of its ground, as the god's view draws it; a field, a fence, a square lies on
  // the ground: the 3D's drawing and the body's feet read it here, one rule)
  Sp.BASELESS = { farm: 1, horta: 1, plantacao: 1, vinhedo: 1, doca: 1, praca: 1, cemetery: 1, curral: 1, cercado: 1, campfire: 1 };
  Sp.plinth = function (b) {
    let lo = 1e9, hi = -1e9; for (let ty = b.y; ty <= b.y + b.h; ty++) for (let tx = b.x; tx <= b.x + b.w; tx++) { const h = W.hAt(Math.min(N, tx), Math.min(N, ty)) * HM; lo = Math.min(lo, h); hi = Math.max(hi, h); }
    return { lo, hi, y0: hi + (Sp.BASELESS[b.type] ? 0.12 : 0.4) };
  };
  Sp.FLOOR_UP = 0.012; // (a drawn floor stands a hair over the plinth's top it lies on)

  // ------------------------------ the insides: the plans of G.Interiors ------------------------------
  // A plan is made a few at a time: Interiors.plan costs 5–50 ms (an insula's up to 0.7 s) and keeps a cache of its own that
  // may let one go. Asked here (Space.plan), a building is queued; Space.planTick — once a frame, while the body is lived —
  // makes the nearest one queued; what was made is kept here with the record it was made from, and read from here (never
  // Interiors.plan in the frame). A plan changes only when its record does — a renovation, a ruin, a new use: asked again.
  // Only read: a plan never changes the world, and neither does keeping it.
  let made = new Map(), asked = new Map();
  G.worldHooks.push(() => { made = new Map(); asked = new Map(); });
  const recKey = b => { const r = b.ip; return r ? b.type + ':' + r.r + ':' + r.f + ':' + r.s + ':' + (r.fx ? r.fx.length : 0) : ''; };
  const MADE_MAX = 500;
  // the plan of a building, made — or null (and asked for: a building without one is drawn and walked as before)
  Sp.plan = function (b) {
    const In = G.Interiors; if (!b || !b.built || !In || !In.has(b)) return null;
    const k = recKey(b); const m = made.get(b.id); if (m && m.k === k) { m.t = tick; return m.p; }
    asked.set(b.id, k); return null;
  };
  Sp.planEntry = id => made.get(id) || null; // (with its doors' cells: for the body's feet)
  // (made now, whatever it costs: the body is in it already — a game loaded with the body indoors)
  Sp.planNow = function (b) { return Sp.plan(b) || (b && b.built && G.Interiors && G.Interiors.has(b) ? make(b) : null); };
  let tick = 0;
  function make(b) {
    const p0 = G.Interiors.plan(b); const p = p0 && p0.ok && p0.shell && p0.grid ? p0 : null;
    made.set(b.id, { k: recKey(b), p, doors: p ? doorCells(p) : null, t: tick, y0: Sp.plinth(b).y0 }); asked.delete(b.id);
    if (made.size > MADE_MAX) { let old = null; for (const [id, m] of made) if (!old || m.t < old[1].t) old = [id, m]; if (old) made.delete(old[0]); }
    return p;
  }
  // once a frame: the nearest building asked for, made — one at most (what is far from the eye is forgotten)
  Sp.planTick = function (X, Z) {
    tick++; if (!asked.size) return null; const S = G.S; let best = null, bd = Infinity;
    for (const id of asked.keys()) { const b = S.buildings.get(id); if (!b) { asked.delete(id); continue; } const d = (b.x * TILE + b.w * TILE / 2 - X) ** 2 + (b.y * TILE + b.h * TILE / 2 - Z) ** 2; if (d > 160 * 160) { asked.delete(id); continue; } if (d < bd) { bd = d; best = b; } }
    return best ? (make(best), best.id) : null;
  };
  Sp.plansAsked = () => asked.size; // (for the tests)
  // (the cells of each door's opening, storey by storey: the door's id + 1 — as the grid marks a door's opening)
  function doorCells(p) {
    const n = p.grid.n, cs = p.grid.cs, out = {};
    const cellsOf = r => [Math.max(0, Math.ceil(r[0] / cs - 0.5)), Math.max(0, Math.ceil(r[1] / cs - 0.5)), Math.min(n - 1, Math.floor(r[2] / cs - 0.5)), Math.min(n - 1, Math.floor(r[3] / cs - 0.5))];
    for (const h of p.holes) {
      if (!(h.door >= 0) || h.kind === 'janela') continue; const d = p.doors[h.door]; const w = p.walls[h.wall]; if (!d || !w || d.kind === 'vao') continue;
      const arr = out[w.lv] || (out[w.lv] = new Int16Array(n * n));
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L; const ht = Math.max(w.t / 2, cs / 2 + 1e-3); const vert = Math.abs(w.a[0] - w.b[0]) < 1e-6;
      const c0 = [w.a[0] + tx * (h.at - h.w / 2), w.a[1] + tz * (h.at - h.w / 2)], c1 = [w.a[0] + tx * (h.at + h.w / 2), w.a[1] + tz * (h.at + h.w / 2)];
      const hr = vert ? [c0[0] - ht, Math.min(c0[1], c1[1]), c0[0] + ht, Math.max(c0[1], c1[1])] : [Math.min(c0[0], c1[0]), c0[1] - ht, Math.max(c0[0], c1[0]), c0[1] + ht];
      const [x0, z0, x1, z1] = cellsOf(hr); for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) arr[z * n + x] = h.door + 1;
    }
    return out;
  }
  // what is at a point of a storey of a plan (metres of the lot): one of Interiors.CELL
  Sp.cellIn = function (p, lv, x, z) { const g = p.grid.lv[lv]; if (!g) return 0; const n = p.grid.n, cs = p.grid.cs; const cx = Math.floor(x / cs), cz = Math.floor(z / cs); return cx < 0 || cz < 0 || cx >= n || cz >= n ? 0 : g[cz * n + cx]; };
  // the storey's floor at a point: on a flight, between its foot and its top (strictly over the flight: by its edge the
  // storey's own, as the grid has it)
  Sp.floorIn = function (p, lv, x, z) {
    const l = p.levels.find(q => q.lv === lv); const y0 = l ? l.y : 0;
    for (const s of p.stairs) {
      const r = s.r; if (!(x > r[0] && x < r[2] && z > r[1] && z < r[3])) continue;
      const len = s.dir[0] ? r[2] - r[0] : r[3] - r[1]; const t = s.dir[0] ? (s.dir[0] > 0 ? x - r[0] : r[2] - x) : (s.dir[1] > 0 ? z - r[1] : r[3] - z); const f = G.clamp(t / (len || 1), 0, 1);
      if (s.kind === 'degraus') { if (s.lv1 === lv) return y0 * f; continue; }
      if (s.lv0 !== lv) continue; const l1 = p.levels.find(q => q.lv === s.lv1); return y0 + ((l1 ? l1.y : y0) - y0) * f;
    }
    return y0;
  };
  // the stair a point of a storey is on (its flight, from that storey), or null
  Sp.stairIn = function (p, lv, x, z) { for (const s of p.stairs) { const r = s.r; if ((s.kind === 'degraus' ? s.lv1 : s.lv0) === lv && x > r[0] && x < r[2] && z > r[1] && z < r[3]) return s; } return null; };
  // a point of the world, for a body on storey lv of building 'of' (its own storey indoors; in another building, or coming in, the
  // entrance's):
  // null away from any building whose plan is made; else { b, p, lv, x, z (metres of the lot), code, walk, y (the floor drawn
  // there, metres), shell (inside the outer walls), door (the id of a door's opening, or -1) } — walk as the plan has it: the
  // floor, the opening of a door the world has open, the stairs, a shut hatch, and on a loft, under its slopes, what one crawls;
  // out of the walls only the doorstep before an outer door and the steps up to it
  Sp.indoor = function (X, Z, lv, of) {
    const S = G.S; const tx = Math.floor(X / TILE), ty = Math.floor(Z / TILE); if (tx < 0 || ty < 0 || tx >= N || ty >= N) return null;
    const id = S.occ[ty * N + tx]; const b = id && S.buildings.get(id); if (!b) return null; const p = Sp.plan(b); if (!p) return null;
    const m = made.get(b.id); const x = X - b.x * TILE, z = Z - b.y * TILE; const sh = p.shell;
    const shell = sh.kind === 'round' ? Math.hypot(x - sh.cx, z - sh.cz) < sh.r : x > sh.r[0] && x < sh.r[2] && z > sh.r[1] && z < sh.r[3];
    const L = of === b.id && lv !== undefined && lv !== null && p.levels.some(q => q.lv === lv) ? lv : p.entryLv || 0;
    const C = G.Interiors.CELL; let code = Sp.cellIn(p, L, x, z), walk = false, door = -1;
    if (shell) {
      const crawl = (p.levels.find(q => q.lv === L) || {}).kind === 'jirau';
      walk = code === C.FLOOR || code === C.STAIR || code === C.HATCH || (crawl && code === C.LOWROOF);
      if (code === C.DOOR) { const a = m.doors && m.doors[L]; const n = p.grid.n, cs = p.grid.cs; const k = a ? a[Math.floor(z / cs) * n + Math.floor(x / cs)] : 0;
        door = k - 1; walk = k === 0 || G.Interiors.doorState(b, k - 1).state === 'aberta'; }
    } else {
      // (the doorstep: from an outer door out to the lot's edge, as wide as the door — and the steps up a house on stilts)
      walk = !!Sp.stairIn(p, L, x, z) || stepOf(p, L, x, z);
    }
    // (the floor: the storey's, the flight's; in an outer door's opening and on the doorstep the street's — a sunken floor's
    // steps go down inside it, a house on stilts has its own up to its door)
    let fy = Sp.floorIn(p, L, x, z); if (!shell) { if (!Sp.stairIn(p, L, x, z)) fy = 0; } else if (door >= 0 && p.doors[door] && p.doors[door].outer) fy = Math.max(fy, 0);
    return { b, p, lv: L, x, z, code, walk, shell, door, y: m.y0 + fy + Sp.FLOOR_UP };
  };
  function stepOf(p, lv, x, z) {
    const lot = p.lot.w;
    for (const d of p.doors) {
      if (!d.outer) continue; const w = p.walls[d.wall]; if (!w || w.lv !== lv) continue;
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L;
      const s = (x - w.a[0]) * tx + (z - w.a[1]) * tz, o = (x - w.a[0]) * -tz + (z - w.a[1]) * tx;
      // (out of the wall on the street's side — the side away from the middle of the lot — as far as the lot goes)
      const out = ((lot / 2 - w.a[0]) * -tz + (lot / 2 - w.a[1]) * tx) > 0 ? -1 : 1;
      if (Math.abs(s - d.at) < d.w / 2 + 0.05 && o * out > w.t / 2 - 0.02 && o * out < w.t / 2 + 1.2) return true;
    }
    return false;
  }
})(window.G);
