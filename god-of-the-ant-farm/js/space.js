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
    // (a building that stands on the water is a building: what stops the feet there is its wall, not the water — L-150)
    if (W.blocked(i) && !S.cliff[i]) return { kind: 'building', walk: false, i, b: S.occ[i] };
    if (t <= T.RIVER) return { kind: S.cliff[i] ? 'cliff' : 'deep', walk: false, i };
    if (S.cliff[i]) return { kind: 'cliff', walk: false, i };
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
  // the deck the feet stand on over a river tile (tiles in, metres out; -Infinity where there is none): a bridge's, the ice's
  Sp.deckAt = function (x, y) {
    const S = G.S; if (!W.inb(x, y)) return -Infinity; const i = W.idx(x, y); if (S.type[i] !== T.RIVER) return -Infinity;
    return S.road[i] ? S.wl[i] * HM + 0.17 : S.ice && S.ice[i] ? S.wl[i] * HM + 0.1 : -Infinity;
  };
  // the ground the feet stand on out of doors (tiles in, metres out): the land, a bridge's deck or the ice over a river, the bed
  // of a ford under its water — the body's own ground (Avatar.floorAt, under the steps and the stones it adds) and the one the
  // world reckons a side flight's foot from (doorFlight, L-325): one rule for both. Pure: the world's ground only
  Sp.footAt = function (x, y) {
    if (!W.inb(x, y)) return W.hAt(G.clamp(x, 0, N), G.clamp(y, 0, N)) * HM;
    const h = W.hAt(x, y) * HM, dk = Sp.deckAt(x, y); return dk > -Infinity ? Math.max(h, dk) : h - Sp.bedAt(x, y);
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
  // (the near ground as its mesh draws it — realm3d's terrainGeo: a point every half tile, each cell cut from its +x corner to
  // its +y corner —, tiles in, metres out: what lies on the ground lies on what is seen — the 3D's pieces, the steps before a
  // door —, and the feet on those steps)
  const vH = (x, y) => W.hAt(Math.min(N, x), Math.min(N, y)) * HM - Sp.bedDrop(x, y);
  Sp.drawnAt = function (x, y) {
    const i = Math.floor(x * 2), j = Math.floor(y * 2), u = x * 2 - i, v = y * 2 - j; const xa = i / 2, ya = j / 2, xb = xa + 0.5, yb = ya + 0.5;
    if (u + v <= 1) { const ha = vH(xa, ya); return ha + (vH(xb, ya) - ha) * u + (vH(xa, yb) - ha) * v; }
    const hd = vH(xb, yb); return hd + (vH(xa, yb) - hd) * (1 - u) + (vH(xb, ya) - hd) * (1 - v);
  };

  // ------------------------------ the steps before an outer door (L-163) ------------------------------
  // (a side of a rectangle — of a shell, of an annex —, or the straight piece of a round hut's wall: its line, the way out of
  // it, its run; u along it, n out of its line — the 3D's own frame for a side: Build3D's rside, wside)
  const SIDEO = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const rside = (r, sd) => { const ax = sd === 'N' || sd === 'S'; return { sd, ax, o: SIDEO[sd], line: sd === 'N' ? r[1] : sd === 'S' ? r[3] : sd === 'W' ? r[0] : r[2], u0: ax ? r[0] : r[1], u1: ax ? r[2] : r[3] }; };
  function wside(w, out) {
    const ax = Math.abs(w.b[1] - w.a[1]) < 1e-3; const u0 = ax ? Math.min(w.a[0], w.b[0]) : Math.min(w.a[1], w.b[1]), u1 = ax ? Math.max(w.a[0], w.b[0]) : Math.max(w.a[1], w.b[1]);
    return { sd: ax ? (out > 0 ? 'S' : 'N') : (out > 0 ? 'E' : 'W'), ax, o: ax ? [0, out] : [out, 0], line: (ax ? w.a[1] : w.a[0]) + out * w.t / 2, u0: u0 - w.t / 2, u1: u1 + w.t / 2 };
  }
  const wallOn = (w, F) => { const along = F.ax ? Math.abs(w.b[1] - w.a[1]) < 1e-3 : Math.abs(w.b[0] - w.a[0]) < 1e-3; if (!along) return false;
    const face = (F.ax ? w.a[1] : w.a[0]) + (F.ax ? F.o[1] : F.o[0]) * w.t / 2; if (Math.abs(face - F.line) > 0.03) return false;
    const a = F.ax ? Math.min(w.a[0], w.b[0]) : Math.min(w.a[1], w.b[1]), b = F.ax ? Math.max(w.a[0], w.b[0]) : Math.max(w.a[1], w.b[1]); return b > F.u0 + 0.05 && a < F.u1 - 0.05; };
  // (the side a wall of the outside is on: a side of the shell's rectangle, of an annex's, or the wall's own — out away from the
  // middle of the lot)
  function sideOf(sh, lot, w) {
    if (sh.kind !== 'round') for (const r of [sh.r].concat((sh.annex || []).map(a => a.r))) for (const sd of ['N', 'E', 'S', 'W']) { const F = rside(r, sd); if (wallOn(w, F)) return F; }
    const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L;
    const side = ((lot / 2 - w.a[0]) * -tz + (lot / 2 - w.a[1]) * tx) > 0 ? -1 : 1; const ax = Math.abs(w.b[1] - w.a[1]) < 1e-3;
    return wside(w, ax ? Math.sign(tx * side) || 1 : Math.sign(-tz * side) || 1);
  }
  // (a body's rim round its middle, as the steps are stood on — the body's own radius, Avatar.TUNE.radius: kept here, not read
  // from there, for the developer's panel turns that one, and the world asks these steps where a door may be — L-207)
  const BODY_R = 0.32;
  // a grown tree's trunk, as the body meets it — Avatar's pushRound walks it round —: its radius in metres, 0 for a tree too
  // small, a stump, a log, a tree falling; at a size given, the radius it would have at that size
  Sp.trunk = (t, size) => (t && t.stage !== 'stump' && t.stage !== 'log' && t.stage !== 'fall' && t.size >= 0.3 ? 0.28 + 0.32 * Math.min(1.2, size === undefined ? t.size : size) : 0);
  // (the size the steps reckon a tree at: its next tenth up — they never stand in the trunk of a tree grown since, and are not
  // reckoned again until it grows past that)
  const tenth = t => Math.min(12, Math.ceil(t.size * 10 - 1e-9));
  // (the street on some tiles, as a number: its grown trees — a tree born there, grown a tenth, fallen, felled changes it, L-197 —
  // and its ground, whose lot it is and whether the world walks it — a building, a wall, a ruin come or gone changes it: the
  // steps into the street are reckoned from that ground, open(), and were kept by the memo over a street built over, L-213)
  const treesOn = tiles => { const S = G.S; let s = 0; for (const i of tiles) { const id = S.treeAt[i]; const t = id && S.trees.get(id); if (Sp.trunk(t)) s = (s * 31 + id * 7 + tenth(t)) | 0; s = (s * 17 + (S.occ[i] || 0) * 3 + (W.walkable(i) ? 1 : 2)) | 0; } return s; };
  let flights = new Map(), under = new Map(); G.worldHooks.push(() => { flights = new Map(); under = new Map(); });
  // the grown trees about the steps a building's doors run on into the street, as a number (0 where none do): what the 3D draws
  // its steps again for — Build3D.sig —, the steps reckoned round a tree come and gone (L-197). The tiles are those of the
  // flights reckoned so far, kept here; only read
  Sp.treeSig = b => { const t = under.get(b.id); return t ? treesOn(t) : 0; };
  // the grown trees about a building, as a number — on its lot and two tiles round it: as far as the steps of its doors run on
  // into the street (room + 5.3 m out of a door's line, a trunk's reach beside them) —, by the same rule and the same tenth:
  // what the world keys its word on the way in by (Interiors' entrySaid, L-206). Read from the world alone, never from what
  // the 3D kept (Space.treeSig): a tree born there, grown a tenth, fallen or felled changes it
  Sp.treesAround = function (b) {
    const S = G.S; let s = 0;
    for (let y = Math.max(0, b.y - 2); y <= Math.min(N - 1, b.y + b.h + 1); y++) for (let x = Math.max(0, b.x - 2); x <= Math.min(N - 1, b.x + b.w + 1); x++) {
      const id = S.treeAt[y * N + x]; const t = id && S.trees.get(id); if (Sp.trunk(t)) s = (s * 31 + id * 7 + tenth(t)) | 0;
    }
    return s;
  };
  // the steps before an outer door down to the ground, for a door on the ground storey of a building whose floor stands over
  // the street (its plinth) — and before the foot of an outside flight (Interiors' 'degraus', from the plinth's top: Space.feet)
  // —: the ones the 3D lays (Build3D's dressing of a door) and the ones the feet go up (Space.indoor on the doorstep,
  // Space.stepTop in the street) — one reckoning, here (L-163). One step where the drop is small; a flight straight out where
  // the lot before the door has room for it; along the wall, to the side with room, where it has not — its landing at the
  // door —; else as many as the lot takes; and where that leaves its last tread too high over the ground before it, on into
  // the street before the door, where that is open ground the world walks (the steps of a door over a slope come down to the
  // street). Heights over the plinth's top; on the door's side: a along it from the opening's middle, n out of its face (the
  // 3D's frame: Build3D's F).
  //   sh: the shell (rect, annexes, kind); lot: { w, d } metres; w: the door's wall; h: its opening; ly: its storey's floor;
  //   raised: a floor on posts (the outside flight up to it has the steps); F0, uc0: a side given (a flight's foot)
  // → { F, uc, P, top, w (the steps' width), treads: [{ k, a, n, wa, wn, y, gy, kind }], cut, room } — or null: no steps there
  // (a tile out of its own lot that a door's way in never takes — its treads, the ground before them, the body on them —, though
  // the world walks it, as the body's own rule has it (Avatar's solidAt): the tile of a gate, whose piers are the feet's walls
  // since L-308 — where they stand is the 3D's to say, never asked here: the whole tile —, L-323, the house#8974 and the
  // sobrado#14759, their steps down onto the gate of a wall's line; and the lot of another building of walls with its plan,
  // the body in only by its door — the steps of one never on another's lot, L-213 —, L-324, the house#24793, whose fourteen
  // steps came down into the feira#10950)
  const barred = i => { const S = G.S; if (S.wall[i] === 2 || S.wall[i] === 4) return true; const B = S.occ[i] && S.buildings.get(S.occ[i]); return !!(B && !Sp.BASELESS[B.type] && G.Interiors && G.Interiors.has(B)); };
  Sp.doorFlight = function (b, sh, lot, w, h, ly, raised, F0, uc0, fresh) {
    const y = ly + (h.sill || 0); if (raised || y >= 0.3 || !w || !h) return null;
    // (kept by the wall's place too — its ends —, and the side given for a flight's foot: a door moved to another side of its
    // shell with the same wall id and the same place along it is another flight)
    const y0 = Sp.plinth(b).y0; const key = b.id + ':' + w.id + ':' + h.at + ':' + h.w; const k0 = y0.toFixed(3) + ':' + (G.S.typeVer || 0) + ':' + ly + ':' + (h.sill || 0) + ':' + sh.r + ':' + w.t + ':' + w.a + ':' + w.b + (F0 ? ':' + F0.sd + F0.line + ':' + uc0 : '');
    // (fresh: reckoned anew, and not kept — Space.entryFits; one that runs on into the street, kept while the trees about it
    // are as they were — L-197)
    const m = !fresh && flights.get(key); if (m && m.k === k0 && (!m.tiles || treesOn(m.tiles) === m.ts)) return m.f;
    let F = F0, uc = uc0;
    if (!F) { F = sideOf(sh, lot.w, w); const Lw = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; uc = F.ax ? w.a[0] + (w.b[0] - w.a[0]) / Lw * h.at : w.a[1] + (w.b[1] - w.a[1]) / Lw * h.at; }
    const P = (a, n) => (F.ax ? [uc + a, F.line + F.o[1] * n] : [F.line + F.o[0] * n, uc + a]);
    // (the ground as it is drawn there, over the plinth's top — or a bridge's deck over it, where the feet stand on that)
    const gAt = (a, n) => { const p = P(a, n); const x = Math.min(N - 0.001, b.x + p[0] / TILE), z = Math.min(N - 0.001, b.y + p[1] / TILE); return Math.max(Sp.drawnAt(x, z), Sp.deckAt(x, z)) - y0; };
    const reach = (a, ta, n, sd, yt) => { let d = 0; for (let j = 1; j <= 4; j++) { const q = n + sd * j / 4; if (Math.max(gAt(a, q), gAt(a - ta / 2, q), gAt(a + ta / 2, q)) > yt - 0.025) break; d = sd * j / 4; } return d; };
    const room = (F.o[1] > 0 ? lot.d - F.line : F.o[1] < 0 ? F.line : F.o[0] > 0 ? lot.w - F.line : F.line) + 0.15;
    const top = y + 0.02, wd = h.w + 0.5, n0 = 0.1, free = [uc - F.u0, F.u1 - uc];
    let treads = []; let cut = null; let sideK = null; let tiles = null;
    // (no rise over 0.30 anywhere: over treads of 0.29 the body's rim meets two at once, past its step, and stops it halfway up —
    // L-183 —: a drop that eight treads of a span would rise more over takes as many as bring it to 0.30)
    const drop = top - gAt(0, n0 + 0.3), need = Math.max(Math.min(8, Math.ceil(drop / 0.26)), Math.ceil(drop / 0.30)), nOut = Math.floor(room / 0.22);
    // (a flight straight out: down to where its next tread would stand under the ground the feet come up — along its middle; a
    // street sloping across it narrows a tread to the part of it over the ground — Build3D.check: a tread's top cut by the
    // ground —, as wide as a stride at least: where even that is not over it, its end goes into the slope, as a step cut in it)
    const aboveAt = (q, sn, t, yt) => Math.max(gAt(q, sn - t / 2 - 0.01), gAt(q, sn), gAt(q, sn + t / 2 + 0.01)) < yt - 0.02;
    let buried = 0;
    const out = (n, rise, rm, a0, w0) => { const t = Math.min(0.32, (rm || room) / n), a = a0 || 0, ww = w0 || wd; buried = 0;
      for (let k = 0; k < n; k++) { const sn = n0 + (k + 0.5) * t, yt = top - k * rise; if (k && yt < Math.max(gAt(a, sn - t / 2), gAt(a, sn), gAt(a, sn + t / 2)) + 0.03) break;
        let hw = (ww - k * 0.02) / 2; if (k) while (hw > 0.3 && !(aboveAt(a - hw, sn, t, yt) && aboveAt(a + hw, sn, t, yt))) hw -= 0.05; // (on its line, as the count of treads was made)
        if (k) for (const q of [a - hw, a + hw]) buried = Math.max(buried, Math.max(gAt(q, sn - t / 2 - 0.01), gAt(q, sn), gAt(q, sn + t / 2 + 0.01)) - (yt - 0.02)); // (how deep an end goes into the slope)
        treads.push({ k, a, n: sn, wa: 2 * hw, wn: t + 0.02, y: yt, gy: Math.min(yt - rise, gAt(a, sn)) - 0.04, kind: 'out' }); } };
    const one = () => { const sd = reach(0, wd, n0, Math.min(0.7, room), top); if (sd < 0.1) return; const sn = n0 + sd / 2; treads.push({ k: 0, a: 0, n: sn, wa: wd, wn: sd, y: top, gy: Math.min(top - 0.4, gAt(0, sn) - 0.04), kind: 'one' }); };
    // (how high the lowest tread laid stands over the ground before it — what the feet must step up from the street —, and
    // whether that is too high: a lone step up to a span and a half; at the foot of a flight, no more than its rise or so —
    // the body's rim, a stride ahead, meets the tread above it too: the two together within one step, Avatar.TUNE.stepUp)
    // (the ground taken where the feet stand when the body's rim meets the steps: a stride's tip before the lowest tread; before a
    // tread of a side flight, narrower than the body, further out — its rim, aslant, meets the tread beside it, a rise up, while
    // the feet are still in the street)
    // (that of a side flight is taken at the very point where the body stops — its rim r·√½ out, 0.23; the body stood 0.24 out —,
    // on the ground the feet stand on there (Space.footAt): by a river's bank the drawn ground stood 7 cm over it, and the
    // forja#27885's side flight, 0.55 by the drawn ground of the 0.56 its feet walk, was 0.61 to the body, climbed with the
    // hands — L-325. A straight flight's is taken 0.12 out, ten centimetres past where the feet are when the rim meets its
    // second tread (0.02 out): a margin that holds the difference — on the feet's ground, two doors of the new metropole would
    // move for nothing, the sobrados 21323 and 24763 between 0.56 and 0.60, and 22 flights would be laid anew)
    const footG = (a, n) => { const p = P(a, n); return Sp.footAt(Math.min(N - 0.001, b.x + p[0] / TILE), Math.min(N - 0.001, b.y + p[1] / TILE)) - y0; };
    const footStep = () => { const t = treads[treads.length - 1]; const sd = t && t.kind === 'side', g = sd ? footG : gAt; const off = sd ? 0.25 : 0.12; const n = t ? t.n + t.wn / 2 : n0, a = t ? t.a : 0, q = (t ? t.wa : wd) / 4; return (t ? t.y : top) - Math.min(g(a, n + off), g(a - q, n + off), g(a + q, n + off)); };
    // (the foot of a flight with the rise above it within one step, with a margin — 0.56 of the body's 0.6 —; a lone step within
    // a span and a half: L-183, the flights the body walked up and could not — soleira 4b, T-090)
    const riseUp = () => (treads.length > 1 ? treads[treads.length - 2].y - treads[treads.length - 1].y : 0);
    const walks = (fs, ru, n) => (n > 1 ? fs + ru <= 0.56 : fs <= 0.45);
    const tooHigh = () => !walks(footStep(), riseUp(), treads.length);
    if (drop <= 0.5 || need < 2) one();
    else if (nOut >= need) out(need, drop / need);
    else {
      // (the side with room for it; of two, the one whose ground is higher where the flight would end — the shorter way down)
      const dp = Math.min(room, 0.6), sn = n0 + dp / 2; let sg = 0, run = 0, hi = -1e9;
      if (room >= 0.3) for (const s of [1, -1]) { const r = free[s > 0 ? 1 : 0] - wd / 2 - 0.3; if (r < (need - 1) * 0.24) continue; const g = gAt(s * (wd / 2 + (need - 1) * 0.28), sn); if (g > hi) { hi = g; sg = s; run = r; } }
      if (sg) {
        // (down along the wall, as far as the side has room, to where its next tread would stand under the ground along its
        // middle — as the flight out: a street that falls away along the wall takes a tread or two more)
        const rise = G.clamp((top - hi) / need, 0.12, 0.26), t = Math.min(0.32, run / (need - 1));
        treads.push({ k: 0, a: 0, n: sn, wa: wd, wn: dp, y: top, gy: Math.min(top - rise, gAt(0, sn)) - 0.04, kind: 'landing' });
        for (let k = 1; k * t <= run + 1e-6 && k < 12; k++) { const a = sg * (wd / 2 + (k - 0.5) * t), yt = top - k * rise; if (yt < Math.max(gAt(a - t / 2, sn), gAt(a, sn), gAt(a + t / 2, sn)) + 0.03) break; treads.push({ k, a, n: sn, wa: t + 0.02, wn: Math.max(0.2, dp - k * 0.01), y: yt, gy: Math.min(yt - rise, gAt(a, sn)) - 0.04, kind: 'side' }); }
        const m = treads.length - 1; cut = [sg * m * t / 2, wd + m * t];
        // (its foot too high a step over the street before it — a street falling away from the wall —, or its treads narrower than
        // the body's rim, which meets two of them at once from the street: the straight way out and down the street instead, kept
        // where its feet walk, or come nearer the ground: L-183)
        if (tooHigh() || t < 0.3) { sideK = { treads, cut, fs: footStep(), ru: riseUp(), narrow: t < 0.3 }; treads = []; cut = null; if (nOut < 2) one(); else out(nOut, 0.26); }
      } else if (nOut < 2) one(); else out(nOut, 0.26);
    }
    // (the last of them too high a step from the ground before it: on into the street, treads a foot and more deep, as many as
    // come down to the ground where the flight ends — a street falls away —, where what it stands on is the building's own
    // ground or open ground the world walks — never a gate's tile, nor another's lot of walls: barred)
    if (!cut && tooHigh()) {
      // (a rise of a span at most over a tread a little deeper — what the feet take one stride at a time —, as many as come down
      // to the ground the feet stand on before the flight's foot, along its middle a: the last of them a rise over it)
      const span = a => { let nS = Math.min(14, Math.max(2, need)), end = n0 + nS * 0.29;
        for (let it = 0; it < 4; it++) { const nn = Math.min(14, Math.max(2, Math.ceil((top - gAt(a, end + 0.12)) / 0.26))); if (nn === nS) break; nS = nn; end = n0 + nS * 0.29; }
        // (where fourteen would rise more than 0.30 — a door over a fall of four metres and more —, a tread more at a time, the
        // flight going on a little further into the street: L-183; the fourteen kept beside, for a street with no room for more)
        const n14 = nS, e14 = end, r14 = (top - gAt(a, end + 0.12)) / nS;
        for (let it = 0; it < 8 && (top - gAt(a, end + 0.12)) / nS > 0.30; it++) { nS++; end = n0 + nS * 0.29; }
        return { nS, end, rise: (top - gAt(a, end + 0.12)) / nS, n14, e14, r14 }; };
      const open = (a, n) => { const p = P(a, n); const x = b.x + p[0] / TILE, z = b.y + p[1] / TILE; if (!W.inb(x, z)) return false; const i = W.idx(x, z); return G.S.occ[i] === b.id || (W.walkableXY(x, z) && !barred(i)); };
      // (the world walks under a tree, and the body is walked round its trunk: the steps never stand in the trunk of a grown
      // tree — a tread its radius from its middle at least, the tree reckoned at its next tenth up —, and the body on them, a
      // rim inside their edge, is never pushed off them — L-197, the ourives#22497 and its acacia. The tiles a flight of these
      // runs over, and about them as far as a trunk reaches: the trunks on them in the flight's frame)
      const c0 = P(-(wd / 2 + 1.4), n0), c1 = P(wd / 2 + 1.4, room + 5.3); const trunks = []; tiles = [];
      for (let ty = Math.max(0, Math.floor(b.y + Math.min(c0[1], c1[1]) / TILE)); ty <= Math.min(N - 1, Math.floor(b.y + Math.max(c0[1], c1[1]) / TILE)); ty++)
        for (let tx = Math.max(0, Math.floor(b.x + Math.min(c0[0], c1[0]) / TILE)); tx <= Math.min(N - 1, Math.floor(b.x + Math.max(c0[0], c1[0]) / TILE)); tx++) {
          const i = ty * N + tx; tiles.push(i); const id = G.S.treeAt[i]; const t = id && G.S.trees.get(id); const r = Sp.trunk(t) && Sp.trunk(t, tenth(t) / 10); if (!r) continue;
          const X = t.x * TILE - b.x * TILE, Z = t.y * TILE - b.y * TILE; trunks.push([(F.ax ? X : Z) - uc, ((F.ax ? Z : X) - F.line) * (F.ax ? F.o[1] : F.o[0]), r]); }
      const clear = (s0, w2, e) => trunks.every(([ta, tn, r]) => Math.hypot(Math.max(s0 - w2 / 2 - ta, 0, ta - s0 - w2 / 2), Math.max(n0 - 0.01 - tn, 0, tn - e - 0.03)) >= r);
      // (straight out from the door's middle, as wide as its steps; where the street has something beside the way, narrower, or to
      // one side of the middle — always before the door: a good stride of its width over it —; of those the street has room for,
      // one whose foot is a step over the ground before it, its treads' ends least in the slope — a street sloping across
      // narrows them, and may bury the ends of the narrowest —; else the one whose foot is lowest; the first of them on a tie)
      let best = null; const over = Math.min(0.9, h.w); const keep = treads, f0 = footStep();
      const ok1 = c => walks(c.fs, c.ru, c.treads.length);
      const worse = (q, r) => ok1(q) !== ok1(r) ? !ok1(q) : !ok1(q) ? q.fs > r.fs + 0.01 : q.buried > r.buried + 0.01;
      search: for (const w2 of [wd, Math.max(1, h.w + 0.1), 1]) for (const s0 of [0, 0.3, -0.3, 0.5, -0.5, 0.7, -0.7]) {
        if (Math.min(s0 + w2 / 2, h.w / 2) - Math.max(s0 - w2 / 2, -h.w / 2) < over) continue;
        // (as many treads as span says; where the street goes on falling past the flight's end, its foot stands high still: a
        // tread more at a time, as far as the street lets the flight go, until the feet walk it)
        let { nS, end, rise, n14, e14, r14 } = span(s0); const lay = (n, e, r) => { treads = []; out(n, r, e - n0 + 0.02, s0, w2); const c = { fs: footStep(), ru: riseUp(), buried: Math.max(0, buried), treads }; if (!best || worse(best, c)) best = c; return c; };
        const room2 = (n, e) => { if (e + 0.02 > room + (n > 14 ? 4.6 : 4.2) || !clear(s0, w2, e)) return false; for (const q of [room, (room + e) / 2, e - 0.05]) for (const a of [s0 - w2 / 2 + 0.1, s0, s0 + w2 / 2 - 0.1]) if (!open(a, q)) return false; return true; };
        let walked = false;
        for (let more = 0; more < 6; more++) {
          if (more) { nS++; end = n0 + nS * 0.29; rise = (top - gAt(s0, end + 0.12)) / nS; }
          if (!room2(nS, end)) break; if (rise > 0.30) continue; if (ok1(lay(nS, end, rise))) { walked = true; break; } }
        // (no flight of rises of 0.30 the street has room for: the fourteen, steeper — the hands may be needed on it, never a lone
        // step of a man's height)
        if (!walked && (n14 !== nS || r14 > 0.30) && room2(n14, e14)) lay(n14, e14, r14);
        if (best && ok1(best) && best.buried <= 0) break search; }
      // (kept where its feet walk, or where it brings them nearer the street than the steps of the lot alone)
      treads = best && (ok1(best) || best.fs < f0) ? best.treads : keep;
    }
    // (the side flight, where the way down the street does no better: its feet walk and these do not, or its foot is the lower)
    if (sideK && !walks(footStep(), riseUp(), treads.length) && ((!sideK.narrow && walks(sideK.fs, sideK.ru, sideK.treads.length)) || sideK.fs <= footStep())) { treads = sideK.treads; cut = sideK.cut; }
    // (and what the feet find at its foot: the step up from the street with the rise above it — whether it walks —, and whether
    // there is ground the world walks a stride before its lowest tread — not a barred tile —: what Space.entryFits answers)
    const lo = treads.length ? treads.reduce((q, t) => (t.y < q.y ? t : q)) : null; const gp = lo ? P(lo.a, lo.n + lo.wn / 2 + 0.5) : null;
    const ground = !gp || (() => { const x = b.x + gp[0] / TILE, z = b.y + gp[1] / TILE; if (!W.inb(x, z)) return false; const i = W.idx(x, z); return G.S.occ[i] === b.id || (W.walkableXY(x, z) && !barred(i)); })();
    // (and whether the body goes up them and in, along the way it takes — as a player does: up a side flight over the middle of
    // each tread, over the landing from its end to the door's middle; else up the flight's line —: where its middle goes, and
    // under its rim to either side across its way — the points of the rim a step meets, aslant ahead: r·√½ out —, ground the
    // body stands on by its own rule (Avatar's solidAt): the building's own lot — the plan's doorstep —; out of it, what the
    // world walks, or the water a body swims, the feet on the tread's top. Never another building, a wall, a cliff, the map's
    // edge, a barred tile (a gate's, another's lot of walls: L-323, L-324): a landing over a quay built since before the door
    // is none — L-207, the taverna#9656 —, nor one over a cliff beyond the lot's edge — L-208, the quartel#4882. What lies
    // beyond the door's middle, on the landing's far side, the body never goes over)
    const off = (a, n) => { const p = P(a, n); const X = b.x * TILE + p[0], Z = b.y * TILE + p[1]; if (!W.inb(X / TILE, Z / TILE)) return true;
      const i = W.idx(X / TILE, Z / TILE); if (G.S.occ[i] === b.id) return false; if (barred(i)) return true; const s = Sp.surface(X, Z); return !s.walk && s.kind !== 'deep'; };
    const RIM = BODY_R * Math.SQRT1_2;
    const stand = (() => {
      const side = treads.filter(t => t.kind === 'side'), L = treads.find(t => t.kind === 'landing');
      if (side.length && L) {
        for (const t of side) { const r = Math.min(RIM, t.wn / 2); if (off(t.a, t.n) || off(t.a, t.n - r) || off(t.a, t.n + r)) return false; }
        const sg = Math.sign(side[0].a) || 1, rl = Math.min(RIM, L.wn / 2);
        for (let a = Math.max(0, L.wa / 2 - BODY_R); a > 1e-9; a -= 0.2) if (off(sg * a, L.n) || off(sg * a, L.n - rl) || off(sg * a, L.n + rl)) return false;
        return !off(0, L.n);
      }
      return treads.every(t => { const r = Math.min(RIM, t.wa / 2); return !off(t.a, t.n) && !off(t.a - r, t.n) && !off(t.a + r, t.n); });
    })();
    const fs = treads.length ? footStep() : 0, ru = riseUp();
    const f = { F, uc, P, top, w: wd, treads, cut, room, foot: fs, rise: ru, walks: !treads.length || walks(fs, ru, treads.length), ground, stand };
    if (!fresh) { if (flights.size > 2000) flights.clear(); flights.set(key, { k: k0, f, tiles, ts: tiles ? treesOn(tiles) : 0 });
      if (tiles) { const u = under.get(b.id) || []; for (const i of tiles) if (!u.includes(i)) u.push(i); under.set(b.id, u); } }
    return f;
  };
  // the foot of an outside flight (Interiors' 'degraus': up a house on stilts, down into a sunken floor), as a door's side for
  // the steps down from it to the ground (Interiors starts the flight at the plinth's top — the ground of a flat lot —: on a
  // slope it stands over the ground, as a door does): the wall, the opening and the side to give Space.doorFlight
  Sp.feet = function (s) {
    const r = s.r, dx = s.dir[0], dz = s.dir[1];
    const F = dx ? { sd: dx > 0 ? 'W' : 'E', ax: false, o: [-Math.sign(dx), 0], line: dx > 0 ? r[0] : r[2], u0: r[1], u1: r[3] } : { sd: dz > 0 ? 'N' : 'S', ax: true, o: [0, -Math.sign(dz)], line: dz > 0 ? r[1] : r[3], u0: r[0], u1: r[2] };
    const wid = F.u1 - F.u0; return { F, uc: (F.u0 + F.u1) / 2, w: { id: 'pe' + s.id, t: 0, a: [0, 0], b: [0, 0] }, h: { at: 0, w: Math.max(0.3, wid - 0.5), sill: 0 } };
  };
  // (the raised floor of a plan: on posts — its own steps up to its door)
  const raisedOf = p => { const l0 = p.levels.filter(l => l.kind !== 'porao' && l.kind !== 'terraco' && l.kind !== 'jirau').sort((a, c) => a.y - c.y)[0] || p.levels[0]; return !!l0 && (l0.kind === 'elevado' || p.shell.base === 'esteios'); };
  // (the steps before the outer doors of a building whose plan is made, as the feet read them — kept with the plan, as the
  // ground under the lot is)
  let stepMemo = new Map(); G.worldHooks.push(() => { stepMemo = new Map(); });
  // does the way in fit before the door of a plan — or of a shell a plan is being made for, as a plan has it: shell, walls, holes,
  // levels, entrance —: steps the feet walk up, from ground the world walks a stride before their foot (L-195 asks it, for the
  // side a door is put on). The same reckoning as the steps drawn and walked (Space.doorFlight), reckoned anew and not kept;
  // pure: it never writes the world, and draws no chance. The worst of the door's steps and the feet of the flights outside:
  // { ok, foot, rise, n, kind, ground, de: 'porta' | 'pé' }
  Sp.entryFits = function (b, c) {
    const lot = { w: b.w * TILE, d: b.h * TILE }; let worst = null;
    const look = (fl, de) => { if (!fl || !fl.treads.length) return; const kind = fl.treads.some(t => t.kind === 'side') ? 'lado' : fl.treads.length === 1 ? 'um' : fl.treads.some(t => t.n > fl.room + 0.3) ? 'rua' : 'lote';
      const r = { ok: fl.walks && fl.ground && fl.stand, foot: +fl.foot.toFixed(2), rise: +fl.rise.toFixed(2), n: fl.treads.length, kind, ground: fl.ground, stand: fl.stand, de }; if (!worst || (worst.ok && !r.ok)) worst = r; };
    const e = c.entrance; const h = e && c.holes.find(q => q.door === e.door && q.kind !== 'janela'); const w = h && c.walls[h.wall];
    if (w) { const l = c.levels.find(q => q.lv === w.lv); look(Sp.doorFlight(b, c.shell, lot, w, h, l ? l.y : 0, raisedOf(c), undefined, undefined, true), 'porta'); }
    // (a floor on posts — the door's own steps are the plan's flight up to it —, and every flight up from the ground outside the
    // walls: the steps before its foot. The plan's stairs, or a shell's steps: the same id, r and dir — those inside the walls,
    // down into a sunken floor, are no way in)
    for (const st of (c.stairs || c.steps || [])) { if (st.kind !== 'degraus' || inShell(c.shell, st)) continue; const fo = Sp.feet(st); look(Sp.doorFlight(b, c.shell, lot, fo.w, fo.h, 0, false, fo.F, fo.uc, true), 'pé'); }
    return worst || { ok: true, foot: 0, rise: 0, n: 0, kind: 'nenhum', ground: true, stand: true, de: '' };
  };
  function flightsOf(b, p) {
    // (kept while the trees about its steps into the street are as they were, too — L-197)
    const y0 = Sp.plinth(b).y0; const k = y0.toFixed(3) + ':' + (G.S.typeVer || 0);
    const m = stepMemo.get(b.id); if (m && m.p === p && m.k === k && m.ts === Sp.treeSig(b)) return m.list;
    const list = []; const lot = { w: b.w * TILE, d: b.h * TILE }; const raised = raisedOf(p);
    for (const h of p.holes) {
      const d = h.door >= 0 ? p.doors[h.door] : null; if (!d || !d.outer || h.kind === 'janela') continue; const w = p.walls[h.wall]; if (!w) continue;
      const l = p.levels.find(q => q.lv === w.lv); const fl = Sp.doorFlight(b, p.shell, lot, w, h, l ? l.y : 0, raised); if (fl) list.push({ fl, h, w, y0 });
    }
    // (and before the foot of each flight outside the walls, on the storey it serves)
    for (const st of p.stairs) { if (st.kind !== 'degraus' || inShell(p.shell, st)) continue; const f = Sp.feet(st); const fl = Sp.doorFlight(b, p.shell, lot, f.w, f.h, 0, false, f.F, f.uc); if (fl) list.push({ fl, h: f.h, w: { lv: st.lv1 }, y0, foot: st }); }
    if (stepMemo.size > 400) stepMemo.clear(); stepMemo.set(b.id, { p, k, ts: Sp.treeSig(b), list }); return list;
  }
  // (a flight of the plan inside the shell — its middle within its walls —, or out of them)
  const inShell = (sh, st) => { const cx = (st.r[0] + st.r[2]) / 2, cz = (st.r[1] + st.r[3]) / 2; return sh.kind === 'round' ? Math.hypot(cx - sh.cx, cz - sh.cz) < sh.r : cx > sh.r[0] && cx < sh.r[2] && cz > sh.r[1] && cz < sh.r[3]; };
  // (a point of the lot — metres — in a flight's frame: a along the door's side, n out of its face)
  const inFlight = (fl, x, z) => { const F = fl.F; return [(F.ax ? x : z) - fl.uc, ((F.ax ? z : x) - F.line) * (F.ax ? F.o[1] : F.o[0])]; };
  // the top of the steps before a door at a point of the world (metres; -Infinity where there are none): those that run on into
  // the street before a door are ground the feet stand on — the body's, and those of everyone drawn —, as a boulder's faces are
  // (on the lot itself the doorstep is the plan's: Space.indoor)
  // (of the buildings two tiles round: a flight runs on into the street a tile and more — room + 4.6, L-183 —, and its lowest
  // treads, beyond the tile next to the lot, are ground the feet stand on too)
  Sp.stepTop = function (X, Z) {
    const S = G.S; const tx = Math.floor(X / TILE), ty = Math.floor(Z / TILE); let best = -Infinity; const seen = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = tx + dx, y = ty + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue;
      const id = S.occ[y * N + x]; if (!id || seen.includes(id)) continue; seen.push(id);
      const b = S.buildings.get(id); const p = b && Sp.planMade(b); if (!p) continue;
      for (const q of flightsOf(b, p)) { const [a, n] = inFlight(q.fl, X - b.x * TILE, Z - b.y * TILE);
        for (const t of q.fl.treads) if (Math.abs(a - t.a) <= t.wa / 2 && Math.abs(n - t.n) <= t.wn / 2) { const yy = q.y0 + t.y + Sp.FLOOR_UP; if (yy > best) best = yy; } }
    }
    return best;
  };

  // ------------------------------ the insides: the plans of G.Interiors ------------------------------
  // A plan is made in one go (5–50 ms; an insula's up to 0.7 s), so the frame never makes one: asked here (Space.plan)
  // through Interiors.want — the plan if made, else null and the building in Interiors' line —, made by Space.pump once a
  // frame while the body is lived, within a few ms (Interiors.pump). Only the buildings near the body are asked for: the
  // one it is in, the ones its feet and hands touch, the ones drawn open round it. Kept here beside each plan read: its
  // doors' cells (for the body's feet) — and the plan itself while its record is the same, so the building the body is in
  // never loses its walls for a frame when Interiors' own cache lets the plan go (a plan is its record's: the same one).
  // Only read: a plan never changes the world, and neither does keeping it.
  let kept = new Map();
  G.worldHooks.push(() => { kept = new Map(); });
  // (the record a plan is made from — Interiors' own key where it says it)
  const recKey = b => { const In = G.Interiors; if (In.keyOf) return In.keyOf(b); const r = b.ip; return r ? b.id + ':' + r.r + ':' + r.f + ':' + b.type + ':' + r.s + ':' + (r.fx || []).length : ''; };
  const KEPT_MAX = 160;
  // the plan of a building, made — or null (and asked for: a building without one is drawn and walked as before)
  // (a ruin is walked as the world has it — open ground, its rubble drawn the old way, D-050 —: no plan for the feet either)
  const planned = b => !!b && b.built && b.type !== 'ruin' && !!G.Interiors && G.Interiors.has(b);
  Sp.plan = function (b) {
    const In = G.Interiors; if (!planned(b) || !In.want) return null;
    const k = recKey(b); const m = kept.get(b.id); if (m && m.k === k) return m.p;
    const p = In.want(b); return p ? keep(b, p, k) : null;
  };
  // (the plan if it is made — kept here, or in Interiors' cache —, never asked for: what the drawing of the outside reads)
  Sp.planMade = function (b) {
    const In = G.Interiors; if (!planned(b)) return null;
    const m = kept.get(b.id); if (m && m.k === recKey(b)) return m.p;
    return In.ready && In.ready(b) ? In.plan(b) : null;
  };
  // (what is kept with it: the plan and its doors' cells; the plinth it stands on, as the ground is now)
  Sp.planEntry = id => { const m = kept.get(id); const b = m && G.S.buildings.get(id); if (!b) return null; m.y0 = Sp.plinth(b).y0; return m; };
  // (made now, whatever it costs: the body is in it already — a game loaded with the body indoors)
  Sp.planNow = function (b) {
    const In = G.Interiors; if (!planned(b)) return null;
    const k = recKey(b); const m = kept.get(b.id); if (m && m.k === k) return m.p;
    return keep(b, In.plan(b), k);
  };
  function keep(b, p0, k) {
    const p = p0 && p0.ok && p0.shell && p0.grid ? p0 : null;
    kept.delete(b.id); kept.set(b.id, { k, p, doors: p ? doorCells(p) : null, y0: 0 });
    if (kept.size > KEPT_MAX) kept.delete(kept.keys().next().value);
    return p;
  }
  // once a frame, while the body is lived: the plans asked for made, a few ms of them (one at least, when any is asked)
  Sp.pump = function (ms) { const In = G.Interiors; return In && In.pump && In.waiting && In.waiting() ? In.pump(ms) : 0; };
  Sp.plansAsked = () => (G.Interiors && G.Interiors.waiting ? G.Interiors.waiting() : 0); // (for the tests)
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
  // the storey's floor at a point: on a flight, between its foot and its top — Interiors' own reading (over the flight
  // where its grid has the flight: by its edge the storey's own)
  Sp.floorIn = (p, lv, x, z) => G.Interiors.floorYOf(p, lv, x, z);
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
    const m = kept.get(b.id); const x = X - b.x * TILE, z = Z - b.y * TILE; const sh = p.shell;
    const shell = sh.kind === 'round' ? Math.hypot(x - sh.cx, z - sh.cz) < sh.r : x > sh.r[0] && x < sh.r[2] && z > sh.r[1] && z < sh.r[3];
    const L = of === b.id && lv !== undefined && lv !== null && p.levels.some(q => q.lv === lv) ? lv : p.entryLv || 0;
    const C = G.Interiors.CELL; let code = Sp.cellIn(p, L, x, z), walk = false, door = -1;
    let step = null;
    if (shell) {
      const crawl = (p.levels.find(q => q.lv === L) || {}).kind === 'jirau';
      walk = code === C.FLOOR || code === C.STAIR || code === C.HATCH || (crawl && code === C.LOWROOF);
      // (an outer door's opening goes through its whole wall, whatever cells of the grid the wall's outer face falls in — L-163)
      const od = outerDoorAt(p, L, x, z);
      if (od >= 0) { door = od; walk = p.doors[od].kind === 'vao' || G.Interiors.doorState(b, od).state === 'aberta'; }
      else if (code === C.DOOR) { const a = m.doors && m.doors[L]; const n = p.grid.n, cs = p.grid.cs; const k = a ? a[Math.floor(z / cs) * n + Math.floor(x / cs)] : 0;
        door = k - 1; walk = k === 0 || G.Interiors.doorState(b, k - 1).state === 'aberta'; }
    } else {
      // (the steps up a house on stilts; the doorstep: from an outer door out to the lot's edge, its steps down to the ground)
      walk = !!Sp.stairIn(p, L, x, z); if (!walk) { step = doorstep(b, p, L, x, z); walk = !!step; }
    }
    // (the floor: the storey's, the flight's; in an outer door's opening the street's door-sill; on the doorstep its steps, or
    // the ground before them — a sunken floor's steps go down inside it, a house on stilts has its own up to its door)
    let fy = Sp.floorIn(p, L, x, z);
    if (!shell) { const st = Sp.stairIn(p, L, x, z); if (!st) fy = step ? step.fy : 0;
      // (an outside flight: from the plinth's top at its foot — the steps before it come down to the ground, Space.feet — to the
      // storey it serves, all along it, its ends too: as the 3D lays its steps)
      else if (st.kind === 'degraus') { const l1 = p.levels.find(q => q.lv === st.lv1); const y1 = l1 ? l1.y : 0; const r = st.r;
        const len = st.dir[0] ? r[2] - r[0] : r[3] - r[1], t = st.dir[0] ? (st.dir[0] > 0 ? x - r[0] : r[2] - x) : (st.dir[1] > 0 ? z - r[1] : r[3] - z); fy = y1 * G.clamp(t / (len || 1), 0, 1); } }
    else if (door >= 0 && p.doors[door] && p.doors[door].outer) fy = Math.max(fy, 0);
    return { b, p, lv: L, x, z, code, walk, shell, door, y: Sp.plinth(b).y0 + fy + Sp.FLOOR_UP };
  };
  // (the outer door whose opening a point of the wall's thickness is in — across the whole wall, along it inside its jambs —,
  // or -1)
  function outerDoorAt(p, lv, x, z) {
    for (const h of p.holes) {
      const d = h.door >= 0 ? p.doors[h.door] : null; if (!d || !d.outer || h.kind === 'janela') continue; const w = p.walls[h.wall]; if (!w || w.lv !== lv) continue;
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L;
      const s = (x - w.a[0]) * tx + (z - w.a[1]) * tz, o = (x - w.a[0]) * -tz + (z - w.a[1]) * tx;
      if (Math.abs(s - h.at) < h.w / 2 - 0.02 && Math.abs(o) <= w.t / 2 + 0.02) return h.door;
    }
    return -1;
  }
  // the doorstep of a point out of the walls (metres of the lot), or null: before an outer door out to the lot's edge — where the
  // street the world walks begins, however deep the yard before the door (L-163) —, as wide as the door and its steps; its
  // floor (fy, over the plinth's top) the steps the 3D lays there (Space.doorFlight), the ground where there are none — the
  // landing at the door's foot. A door with no steps (a raised floor; up a storey): out a stride at the plinth's top, as before
  function doorstep(b, p, lv, x, z) {
    const lot = b.w * TILE; let best = null; const list = flightsOf(b, p);
    for (const { fl, h, w, foot } of list) {
      if (!foot && w.lv !== lv) continue; const [a, n] = inFlight(fl, x, z); // (the ground before a flight's foot: whatever the storey)
      // (the doorstep's ground: across the door and its steps, from the wall's face to the lot's edge)
      let a0 = -Math.max(h.w / 2 + 0.05, fl.w / 2), a1 = -a0, n1 = fl.room - 0.15 + 0.05;
      for (const t of fl.treads) { a0 = Math.min(a0, t.a - t.wa / 2); a1 = Math.max(a1, t.a + t.wa / 2); n1 = Math.max(n1, t.n + t.wn / 2); }
      if (n < -0.02 || n > n1 || a < a0 || a > a1) continue;
      // (its floor: the highest of the ground and the treads over the point; the strip between the wall and the first of them,
      // at the door's foot, the landing's)
      const gx = Math.min(N - 0.001, b.x + x / TILE), gz = Math.min(N - 0.001, b.y + z / TILE);
      let fy = Sp.drawnAt(gx, gz) - Sp.plinth(b).y0;
      if (n < 0.1 && Math.abs(a) < fl.w / 2) fy = Math.max(fy, fl.top);
      for (const t of fl.treads) if (Math.abs(a - t.a) <= t.wa / 2 && Math.abs(n - t.n) <= t.wn / 2) fy = Math.max(fy, t.y);
      if (!best || fy > best.fy) best = { fy, fl };
    }
    if (best) return best;
    // (a door with no steps of its own — a raised floor's, a door up a storey: an outside flight goes up to it —: out to the lot's
    // edge, a stride at least; at the plinth's top, or on the ground under a raised floor)
    const raised = raisedOf(p);
    for (const h of p.holes) {
      const d = h.door >= 0 ? p.doors[h.door] : null; if (!d || !d.outer || h.kind === 'janela' || list.some(q => q.h === h)) continue; const w = p.walls[h.wall]; if (!w || w.lv !== lv) continue;
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L;
      const s = (x - w.a[0]) * tx + (z - w.a[1]) * tz, o = (x - w.a[0]) * -tz + (z - w.a[1]) * tx;
      const out = ((lot / 2 - w.a[0]) * -tz + (lot / 2 - w.a[1]) * tx) > 0 ? -1 : 1;
      const nx = -tz * out, nz = tx * out; const edge = Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? lot - w.a[0] : w.a[0]) : (nz > 0 ? lot - w.a[1] : w.a[1]);
      if (Math.abs(s - h.at) < h.w / 2 + 0.05 && o * out > w.t / 2 - 0.02 && o * out < Math.max(w.t / 2 + 1.2, edge + 0.05))
        return { fy: raised ? Sp.drawnAt(Math.min(N - 0.001, b.x + x / TILE), Math.min(N - 0.001, b.y + z / TILE)) - Sp.plinth(b).y0 : 0 };
    }
    return null;
  }
})(window.G);
