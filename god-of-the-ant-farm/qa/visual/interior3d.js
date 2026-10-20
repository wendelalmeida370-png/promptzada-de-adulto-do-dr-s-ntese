// interior3d: the inside of the buildings drawn from G.Interiors' plans — in Node, without a graphics card (qa/visual/
// tres-node.js: the game's own 3D files, building the geometry the game builds — Build3D.interior):
//   node qa/visual/interior3d.js [mundo]       (default: the ready world «metropole»: houses, sobrados, insulas, huts)
// For every planned building of the world — and a round hut laid out in its own family, the round shell the world has none
// of — rays are cast at the geometry the 3D builds, against what the plan says:
//   1. every number a number; nothing out of the lot; what the inside costs to draw (triangles), by type
//   2. the walls: from inside each room, along each wall between its openings, a ray meets the wall's face where the plan
//      has it (±1.2 cm), a face turned to the room (one the renderer draws, not one it culls)
//   3. the openings: through the middle of each door and window the ray goes out — nothing stands in an opening
//   4. the floors: from above, the floor is where Interiors.floorY says on every cell the grid has as floor (±1.5 cm; on a
//      flight of steps within a step); over a hole a stair comes up through, the lid is that floor, shut
//   5. the ceilings: over every cell where the grid lets one stand, a ceiling turned down to the room — the storey above's
//      or the roof's — high enough for a body of 1.75 m (on a loft, for one on hands and knees), never the sky
//   6. the furniture: each piece within its own rectangle and on its floor, every kind of the catalogue drawn
//   7. the doors' leaves: shut, in their opening; opened, into their first room. The lids: opened, up off their hole
//   8. pure: the same plan, the same picture; no draw on the world's chance nor on the eye's; the world untouched
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M, THREE } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | interior3d ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'metropole');
const S = G.S, In = G.Interiors, B3 = G.Build3D, TL = G.Space.TILE, CELL = In.CELL;
const FLOOR_UP = 0.012;

// ------------------------------ the rays ------------------------------
// (the triangles of some geometries, in the world's metres, each with its box: for the nearest hit along a ray)
function tris(geos) {
  const out = [];
  for (const g of geos) { const P = g.p || g; for (let k = 0; k + 8 < P.length; k += 9) {
    const a = [P[k], P[k + 1], P[k + 2]], b = [P[k + 3], P[k + 4], P[k + 5]], c = [P[k + 6], P[k + 7], P[k + 8]];
    out.push({ a, b, c, lo: [Math.min(a[0], b[0], c[0]), Math.min(a[1], b[1], c[1]), Math.min(a[2], b[2], c[2])], hi: [Math.max(a[0], b[0], c[0]), Math.max(a[1], b[1], c[1]), Math.max(a[2], b[2], c[2])] }); } }
  return out;
}
const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
// the nearest hit of a ray from o along d (unit), within len: { t, front } — front: the face is turned toward the ray's
// origin (its winding, as the renderer reads it); a face turned away at the same place as one turned toward it (a box's
// foot on the floor) is the one the renderer culls: the one seen is the other
function cast(T3, o, d, len) {
  let f = null, bk = null;
  for (const h of hits(T3, o, d, len)) { if (h.front) { if (!f || h.t < f.t) f = h; } else if (!bk || h.t < bk.t) bk = h; }
  return bk && (!f || bk.t < f.t - 0.002) ? bk : f;
}
function hits(T3, o, d, len) {
  const all = [];
  const e = [o[0] + d[0] * len, o[1] + d[1] * len, o[2] + d[2] * len]; const lo = [Math.min(o[0], e[0]), Math.min(o[1], e[1]), Math.min(o[2], e[2])], hi = [Math.max(o[0], e[0]), Math.max(o[1], e[1]), Math.max(o[2], e[2])];
  for (const q of T3) {
    if (q.hi[0] < lo[0] - 1e-4 || q.lo[0] > hi[0] + 1e-4 || q.hi[1] < lo[1] - 1e-4 || q.lo[1] > hi[1] + 1e-4 || q.hi[2] < lo[2] - 1e-4 || q.lo[2] > hi[2] + 1e-4) continue;
    const e1 = sub(q.b, q.a), e2 = sub(q.c, q.a); const p = cross(d, e2); const det = dot(e1, p); if (Math.abs(det) < 1e-12) continue;
    const iv = 1 / det; const s = sub(o, q.a); const u = dot(s, p) * iv; if (u < -1e-6 || u > 1 + 1e-6) continue; const qq = cross(s, e1); const v = dot(d, qq) * iv; if (v < -1e-6 || u + v > 1 + 1e-6) continue;
    const t = dot(e2, qq) * iv; if (t < 1e-5 || t > len) continue;
    all.push({ t, front: dot(cross(e1, e2), d) < 0 });
  }
  return all;
}
// (a leaf or a lid placed: its own geometry turned by yaw — and pitch about its own X, a lid opened — and moved to at)
function placed(g, at, yaw, pitch) {
  const m = new THREE.Matrix4().makeRotationY(yaw); if (pitch) m.multiply(new THREE.Matrix4().makeRotationX(pitch)); m.setPosition(at[0], at[1], at[2]);
  const P = g.p; const out = new Float32Array(P.length); const v = new THREE.Vector3();
  for (let k = 0; k < P.length; k += 3) { v.set(P[k], P[k + 1], P[k + 2]).applyMatrix4(m); out[k] = v.x; out[k + 1] = v.y; out[k + 2] = v.z; }
  return out;
}

// ------------------------------ the buildings ------------------------------
const list = [...S.buildings.values()].filter(b => b.built && In.has(b)).sort((a, b) => a.id - b.id);
// (a round hut: the hut of a people that builds them round, laid out in that family — the world's huts are square)
const roundPlans = [];
// (the record of a lot of the world, as a hut of a people that builds round huts: the plan of that family on it)
// (its only complaint: fewer beds than a hut's household — the plan is whole, and drawn as it is)
for (const b of list) { if (b.w !== 1 || roundPlans.length >= 3) continue; const st = ['grego', 'classico', 'asteca'][roundPlans.length]; const p = In.makeFam(b, Object.assign({}, b.ip, { t: 'hut', c: st }), 'redonda.terreo');
  if (p && p.shell && p.shell.kind === 'round' && p.grid && (p.ok || p.errs.every(e => /lugares para dormir/.test(e)))) { p.ok = true; roundPlans.push([b, p]); } }
// (the readings of a plan of one's own, as Interiors reads the cached one — for a plan the cache does not hold)
const cellP = (p, lv, x, z) => { const g = p.grid.lv[lv]; if (!g) return 0; const cx = Math.floor(x / In.CS), cz = Math.floor(z / In.CS); return cx < 0 || cz < 0 || cx >= p.grid.n || cz >= p.grid.n ? 0 : g[cz * p.grid.n + cx]; };
const walkP = (p, lv, x, z) => { const r = 0.32; for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) { const c = cellP(p, lv, x + dx, z + dz); if (!(c === CELL.FLOOR || c === CELL.DOOR || c === CELL.STAIR || c === CELL.HATCH)) return false; } return true; };
const floorYP = (p, lv, x, z) => { const l = p.levels.find(q => q.lv === lv); return l ? l.y : 0; }; // (a round hut: one storey, no stairs)
const jobs = list.map(b => [b, In.plan(b), 0]).filter(j => j[1] && j[1].ok && j[1].shell).concat(roundPlans.map(j => [j[0], j[1], 1]));
ok('há plantas de lares neste mundo, e uma cabana redonda', jobs.length > 10 && roundPlans.length > 0, `${jobs.length} plantas (${[...new Set(jobs.map(j => j[0].type))].join(', ')}); redondas: ${roundPlans.length}`);

const bad = { num: [], lot: [], wall: [], hole: [], floor: [], ceil: [], item: [], kind: new Set(), leaf: [], lid: [], pure: [] };
const cost = {}; const found = []; let edgeY = 0, nWall = 0, nHole = 0, nFloor = 0, nCeil = 0, nItem = 0, nLeaf = 0, nLid = 0;
const draws = [0, 0]; const watch0 = G.rngWatch;
for (const [b, plan, own] of jobs) {
  const Q = own ? { walk: (lv, x, z) => walkP(plan, lv, x, z), floorY: (lv, x, z) => floorYP(plan, lv, x, z) } : { walk: (lv, x, z) => In.walk(b, lv, x, z), floorY: (lv, x, z) => In.floorY(b, lv, x, z) };
  const tag = `${b.type}#${b.id}${plan.shell.kind === 'round' ? '(redonda)' : ''}`;
  const rng0 = JSON.stringify(S.rng), bj0 = JSON.stringify(b, (k, v) => (k === '_dock' ? undefined : v));
  G.rngWatch = k => { draws[k ? 1 : 0]++; };
  const out = B3.interior(plan, b, { fine: true }); const again = B3.interior(plan, b, { fine: true }); const lean = B3.interior(plan, b, { fine: false });
  G.rngWatch = watch0;
  if (!out) { bad.pure.push(`${tag}: sem desenho`); continue; }
  // 8. pure
  { const sum = o => { let s2 = 0, n = 0; for (const g of Object.values(o.lv).concat([o.roof], o.leaf.map(f => f.g), o.hatch.map(f => f.g))) for (let k = 0; k < g.p.length; k += 7) { s2 = (s2 + g.p[k] * (k % 13 + 1)) % 1e9; n++; } return n + ':' + s2.toFixed(3); };
    if (sum(out) !== sum(again)) bad.pure.push(`${tag}: duas vezes, dois desenhos`);
    if (JSON.stringify(S.rng) !== rng0) bad.pure.push(`${tag}: o acaso do mundo mudou`);
    if (JSON.stringify(b, (k, v) => (k === '_dock' ? undefined : v)) !== bj0) bad.pure.push(`${tag}: o prédio mudou`); }
  const [X0, Y0, Z0] = out.at; const W3 = p => [X0 + p[0], Y0 + p[1], Z0 + p[2]];
  const geos = Object.values(out.lv).concat([out.roof]);
  // 1. numbers, the lot, the cost
  // (from the lowest floor — or the ground, where the steps of a building raised on posts come down to it — to the roof)
  { let nb = 0, far = 0; const lot = plan.lot.w; const ylo = Math.min(0, ...plan.levels.map(l => l.y)) - 0.4, yhi = plan.shell.eave + ((plan.shell.roof && plan.shell.roof.h) || 0) + 0.6 + Math.max(0, ...plan.levels.map(l => l.y + l.h - plan.shell.eave));
    for (const g of geos.concat(out.leaf.map(f => f.g), out.hatch.map(f => f.g))) { for (const a of [g.p, g.n]) for (let k = 0; k < a.length; k++) if (!Number.isFinite(a[k])) nb++; }
    for (const g of geos) for (let k = 0; k < g.p.length; k += 3) { const x = g.p[k] - X0, y = g.p[k + 1] - Y0, z = g.p[k + 2] - Z0; if (x < -0.05 || z < -0.05 || x > lot + 0.05 || z > lot + 0.05 || y < ylo || y > yhi) far++; }
    if (nb) bad.num.push(`${tag}: ${nb}`); if (far) bad.lot.push(`${tag}: ${far} pontos`);
    const c = cost[b.type] = cost[b.type] || { n: 0, sum: 0, max: 0, lean: 0 }; c.n++; c.sum += out.tris; c.max = Math.max(c.max, out.tris); c.lean += lean.tris; }
  const T3 = tris(geos);
  const lids = out.hatch.map(f => placed(f.g, f.at, f.yaw, 0)); const T3L = T3.concat(tris(lids));
  const lvOf = lv => plan.levels.find(l => l.lv === lv);
  const inRoom = (lv, x, z, m) => plan.rooms.some(r => r.lv === lv && x > r.r[0] + (m || 0) && x < r.r[2] - (m || 0) && z > r.r[1] + (m || 0) && z < r.r[3] - (m || 0) && (!r.circ || Math.hypot(x - r.circ[0], z - r.circ[1]) < r.circ[2] - (m || 0)));
  // (does a segment at a storey's height cross a piece of furniture, a stair or a hole a stair comes through?)
  const blocked = (lv, A, B, Y, skip) => { for (let k = 0; k <= 8; k++) { const x = A[0] + (B[0] - A[0]) * k / 8, z = A[1] + (B[1] - A[1]) * k / 8;
    for (const it of plan.items) if (it.lv === lv && x > it.r[0] - 0.05 && x < it.r[2] + 0.05 && z > it.r[1] - 0.05 && z < it.r[3] + 0.05 && Y < (it.kind === 'fogao' || it.kind === 'forja-fogo' ? 99 : lvOf(it.lv).y + (it.y || 0) + it.h + 0.5) && Y > lvOf(it.lv).y + (it.y || 0) - 0.05) return true;
    for (const s of plan.stairs) for (const r of [s.r, s.hole]) if (r && x > r[0] - 0.08 && x < r[2] + 0.08 && z > r[1] - 0.08 && z < r[3] + 0.08) return true;
    // (a storey above, its slab and joists over the point: a loft low over a window's head)
    for (const q of plan.levels) if (q.y > lvOf(lv).y + 0.5 && Y > q.y - 0.32 && Y < q.y + 0.05 && x > q.area[0] && x < q.area[2] && z > q.area[1] && z < q.area[3]) return true;
    // (another wall of the storey between: the room on a terrace, back to back with its parapet)
    for (const w2 of plan.walls) { if (w2.lv !== lv || w2.id === skip || k === 0 || k === 8) continue; const L2 = Math.hypot(w2.b[0] - w2.a[0], w2.b[1] - w2.a[1]) || 1; const ux = (w2.b[0] - w2.a[0]) / L2, uz = (w2.b[1] - w2.a[1]) / L2;
      const s2 = (x - w2.a[0]) * ux + (z - w2.a[1]) * uz, o2 = (x - w2.a[0]) * -uz + (z - w2.a[1]) * ux; if (s2 > -0.02 && s2 < L2 + 0.02 && Math.abs(o2) < w2.t / 2 + 0.01 && Y < lvOf(lv).y + w2.h) return true; } }
    return false; };
  // (the plan's own: a window whose head goes past the floor of a storey above it — a loft low over a window)
  for (const h of plan.holes) { if (h.kind !== 'janela') continue; const w = plan.walls[h.wall]; const l = w && lvOf(w.lv); if (!l) continue;
    const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const px = w.a[0] + (w.b[0] - w.a[0]) * h.at / L, pz = w.a[1] + (w.b[1] - w.a[1]) * h.at / L;
    const q = plan.levels.find(q2 => q2.y > l.y + 0.5 && q2.y - 0.12 < l.y + h.sill + h.h && q2.y > l.y + h.sill && px > q2.area[0] - 0.5 && px < q2.area[2] + 0.5 && pz > q2.area[1] - 0.5 && pz < q2.area[3] + 0.5);
    if (q) found.push(`${tag} janela na parede ${w.id} (${(l.y + h.sill).toFixed(2)}–${(l.y + h.sill + h.h).toFixed(2)} m) sob o piso ${q.lv} (${q.kind}, a ${q.y} m)`); }
  // 2 and 3. the walls and their openings
  for (const w of plan.walls) {
    if (w.kind === 'guarda-corpo') continue; const l = lvOf(w.lv); if (!l) continue;
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az); if (L < 0.5) continue; const tx = ax / L, tz = az / L, nx = -tz, nz = tx;
    const holes = plan.holes.filter(h => h.wall === w.id);
    const nich = plan.items.filter(it => it.niche && it.lv === w.lv).map(it => (it.x - w.a[0]) * tx + (it.z - w.a[1]) * tz);
    for (const sg of [1, -1]) {
      const fx = s => [w.a[0] + tx * s + nx * sg * (w.t / 2 + 0.35), w.a[1] + tz * s + nz * sg * (w.t / 2 + 0.35)];
      const into = (s, m) => { const p = fx(s); return inRoom(w.lv, p[0], p[1], m); };
      for (let k = 1; k <= 5; k++) {
        const s = 0.15 + (L - 0.3) * k / 6; if (!into(s, 0.02)) continue;
        if (holes.some(h => Math.abs(s - h.at) < h.w / 2 + 0.16) || nich.some(a => Math.abs(s - a) < 0.5)) continue;
        for (const y of [0.4, Math.min(w.h - 0.25, 1.8)]) {
          const A = fx(s), B = [w.a[0] + tx * s, w.a[1] + tz * s]; const Y = l.y + y; if (blocked(w.lv, A, B, Y, w.id)) continue;
          nWall++; const hit = cast(T3, W3([A[0], Y, A[1]]), [-nx * sg, 0, -nz * sg], 1.2);
          if (!hit || Math.abs(hit.t - 0.35) > 0.012 || !hit.front) bad.wall.push(`${tag} parede ${w.id} (${w.kind}, piso ${w.lv}) a ${s.toFixed(2)} m, ${y} m: ${hit ? (hit.t - 0.35 >= 0 ? '+' : '') + ((hit.t - 0.35) * 100).toFixed(1) + ' cm' + (hit.front ? '' : ' (face do avesso)') : 'nada'}`);
        }
      }
      for (const h of holes) {
        if (!into(h.at, 0.02)) continue; const A = fx(h.at), Y = l.y + h.sill + h.h / 2; if (blocked(w.lv, A, [w.a[0] + tx * h.at, w.a[1] + tz * h.at], Y, w.id)) continue;
        nHole++; const hit = cast(T3, W3([A[0], Y, A[1]]), [-nx * sg, 0, -nz * sg], 0.35 + w.t + 0.3);
        if (hit) bad.hole.push(`${tag} ${h.kind} na parede ${w.id} (piso ${w.lv}, a ${h.at} m, peitoril ${h.sill}, lado ${sg}): algo a ${(hit.t * 100).toFixed(0)} cm`);
      }
    }
  }
  // (a round hut's ring: from the middle out, at eight bearings off the door, its inner face — within the chord of its sides)
  if (plan.shell.kind === 'round') { const sh = plan.shell, l = plan.levels[0], ri = sh.r - sh.t; const seg = plan.walls.find(w => w.kind === 'anel'); const e = seg ? Math.atan2((seg.a[1] + seg.b[1]) / 2 - sh.cz, (seg.a[0] + seg.b[0]) / 2 - sh.cx) : 9;
    for (let k = 0; k < 8; k++) { const a = e + Math.PI / 8 + k * Math.PI / 4 * 0.85; if (Math.abs(Math.atan2(Math.sin(a - e), Math.cos(a - e))) < 0.7) continue;
      for (const y of [0.5, 1.5]) { const o = [sh.cx + Math.cos(a) * 0.3, l.y + y, sh.cz + Math.sin(a) * 0.3]; if (blocked(l.lv, [o[0], o[2]], [sh.cx + Math.cos(a) * ri, sh.cz + Math.sin(a) * ri], o[1])) continue;
        nWall++; const hit = cast(T3, W3(o), [Math.cos(a), 0, Math.sin(a)], 3); if (!hit || Math.abs(hit.t - (ri - 0.3)) > 0.02 || !hit.front) bad.wall.push(`${tag} anel a ${(a * 57.3).toFixed(0)}°, ${y} m: ${hit ? ((hit.t - ri + 0.3) * 100).toFixed(1) + ' cm' + (hit.front ? '' : ' (avesso)') : 'nada'}`); } } }
  // 4 and 5. the floors and the ceilings, cell by cell of the grid
  const n = plan.grid.n, cs = plan.grid.cs;
  for (const l of plan.levels) {
    const g = plan.grid.lv[l.lv]; if (!g) continue;
    for (let cz = 0; cz < n; cz++) for (let cx = 0; cx < n; cx++) {
      const c = g[cz * n + cx]; if (c !== CELL.FLOOR && c !== CELL.HATCH && c !== CELL.STAIR && c !== CELL.LOWROOF) continue;
      const x = (cx + 0.5) * cs, z = (cz + 0.5) * cs;
      const st = plan.stairs.find(s => s.lv0 === l.lv && s.kind !== 'degraus' && x > s.r[0] && x < s.r[2] && z > s.r[1] && z < s.r[3]);
      if (st && st.kind === 'escada-de-mao') continue; // (a ladder's rungs stand over its cells)
      const deg = plan.stairs.find(s => s.kind === 'degraus' && s.lv1 === l.lv && x > s.r[0] && x < s.r[2] && z > s.r[1] && z < s.r[3]);
      // (where a body can stand the floor is floorY's — on a flight, within a step; by a wall, where one cannot, the storey's own)
      // (a cell by a flight's edge, just off it: Interiors.floorY reads it on the flight — its 1 cm of tolerance — and the grid as
      // floor; the plan's own ambiguity, counted apart)
      if (!st && !deg && plan.stairs.some(s => s.kind !== 'degraus' && s.lv0 === l.lv && x > s.r[0] - 0.02 && x < s.r[2] + 0.02 && z > s.r[1] - 0.02 && z < s.r[3] + 0.02) && Math.abs(Q.floorY(l.lv, x, z) - l.y) > 0.02) { edgeY++; continue; }
      const walk = Q.walk(l.lv, x, z); if ((st || deg) && !walk) continue; // (a flight by a wall: a window's frame may hang over its edge; the body walks its middle)
      const fy = walk || st || deg ? Q.floorY(l.lv, x, z) : l.y; const up = st || deg ? 0.3 : 0.05;
      nFloor++; const hit = cast(c === CELL.HATCH ? T3L : T3, W3([x, fy + up, z]), [0, -1, 0], up + 0.6);
      const y = hit ? fy + up - hit.t : null; const step = st || deg ? Math.abs((st ? lvOf(st.lv1).y - l.y : l.y)) / Math.max(2, Math.round(Math.abs(st ? lvOf(st.lv1).y - l.y : l.y) / 0.19)) + 0.01 : 0;
      if (y === null || !hit.front || Math.abs(y - (fy + FLOOR_UP)) > (step || 0.015)) bad.floor.push(`${tag} piso ${l.lv} (${['', 'chão', '', '', '', 'escada', '', '', 'teto baixo', 'alçapão'][c]}) em ${x.toFixed(2)},${z.toFixed(2)}: ${y === null ? 'nada' : ((y - fy - FLOOR_UP) * 100).toFixed(1) + ' cm' + (hit.front ? '' : ' (avesso)')}`);
      // (the ceiling: not over a terrace nor a room open to the sky; every other cell, as the cells go)
      if ((cx + cz) % 2 || st || deg || l.kind === 'terraco' || plan.rooms.some(r => r.lv === l.lv && r.open && x > r.r[0] && x < r.r[2] && z > r.r[1] && z < r.r[3])) continue;
      if (!walk && l.kind !== 'jirau') continue; // (where a body can stand: not against a wall, under its sills)
      // (nor over a hole a stair comes up through, nor by it: the stair's top, a ladder's rails, stand up through it)
      if (plan.stairs.some(q => (q.lv1 === l.lv || q.lv0 === l.lv) && [q.hole, q.r].some(r => r && x > r[0] - 0.35 && x < r[2] + 0.35 && z > r[1] - 0.35 && z < r[3] + 0.35))) continue;
      // (a loft is crawled, under the slopes down to the eaves: there a ceiling, however low; elsewhere one stands)
      const low = l.kind === 'jirau' || c === CELL.LOWROOF, from = low ? 0.06 : 0.3;
      nCeil++; const top = cast(T3L, W3([x, fy + from, z]), [0, 1, 0], 14);
      const need = low ? 0.1 : 1.75;
      if (!top || !top.front || top.t + from < need) bad.ceil.push(`${tag} piso ${l.lv} (${l.kind}) em ${x.toFixed(2)},${z.toFixed(2)}: ${top ? 'teto a ' + (top.t + 0.3).toFixed(2) + ' m' + (top.front ? '' : ' (avesso)') : 'céu aberto'}`);
    }
  }
  // 6. the furniture
  for (const it of plan.items) {
    nItem++; if (!B3.FURN[it.kind]) bad.kind.add(it.kind); const R = out.item[it.id]; if (!R || R[2] <= R[1]) { bad.item.push(`${tag} ${it.kind}: nada desenhado`); continue; }
    const g = out.lv[R[0]]; const l = lvOf(it.lv); const foot = l.y + (it.y || 0); const ceil = Math.min(l.y + l.h, plan.shell.eave) + 0.01;
    const roof = it.kind === 'fogao' || it.kind === 'forja-fogo'; let worst = 0, wy = 0;
    for (let k = R[1]; k < R[2]; k++) { const x = g.p[k * 3] - X0, y = g.p[k * 3 + 1] - Y0, z = g.p[k * 3 + 2] - Z0;
      worst = Math.max(worst, it.r[0] - x, x - it.r[2], it.r[1] - z, z - it.r[3]); if (y < foot - 0.01 || y > (roof ? ceil : foot + it.h + 0.5)) wy++; }
    if (worst > 0.045 || wy) bad.item.push(`${tag} ${it.kind}: ${worst > 0.045 ? (worst * 100).toFixed(0) + ' cm fora do seu retângulo' : ''}${wy ? ' ' + wy + ' pontos fora da altura' : ''}`);
  }
  // 7. the leaves and the lids
  for (const f of out.leaf) {
    const d = plan.doors.find(q => q.id === f.id); const w = plan.walls[d.wall]; const l = lvOf(w.lv); nLeaf++;
    const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1]; const L = Math.hypot(ax, az); const tx = ax / L, tz = az / L, nx = -tz, nz = tx;
    const shut = placed(f.g, f.at, f.yaw, 0); let out1 = 0, s0 = 1e9, s1 = -1e9;
    for (let k = 0; k < shut.length; k += 3) { const x = shut[k] - X0, y = shut[k + 1] - Y0, z = shut[k + 2] - Z0; const s = (x - w.a[0]) * tx + (z - w.a[1]) * tz, o = (x - w.a[0]) * nx + (z - w.a[1]) * nz;
      s0 = Math.min(s0, s); s1 = Math.max(s1, s); if (s < d.at - d.w / 2 - 0.01 || s > d.at + d.w / 2 + 0.01 || Math.abs(o) > w.t / 2 + 0.07 || y < l.y - 0.01 || y > l.y + d.h + 0.02) out1++; }
    const m = plan.rooms.find(q => q.id === d.rooms[0]); const rn = m ? (((m.r[0] + m.r[2]) / 2 - (w.a[0] + w.b[0]) / 2) * nx + ((m.r[1] + m.r[3]) / 2 - (w.a[1] + w.b[1]) / 2) * nz >= 0 ? 1 : -1) : 1;
    const open = placed(f.g, f.at, f.yaw + f.swing * Math.PI / 2, 0); let into = -1e9; for (let k = 0; k < open.length; k += 3) { const x = open[k] - X0, z = open[k + 2] - Z0; into = Math.max(into, ((x - w.a[0]) * nx + (z - w.a[1]) * nz) * rn); }
    if (out1 || s1 - s0 < d.w - 0.08 || into < d.w * 0.7) bad.leaf.push(`${tag} porta ${d.id}: ${out1 ? out1 + ' pontos fora do vão; ' : ''}cobre ${(s1 - s0).toFixed(2)} de ${d.w}; aberta entra ${into.toFixed(2)} m no cômodo`);
  }
  for (const f of out.hatch) {
    const s = plan.stairs.find(q => q.id === f.id); const l = lvOf(s.lv1); nLid++;
    const shut = placed(f.g, f.at, f.yaw, 0); let top = -1e9, offR = 0;
    for (let k = 0; k < shut.length; k += 3) { const x = shut[k] - X0, y = shut[k + 1] - Y0, z = shut[k + 2] - Z0; top = Math.max(top, y); if (x < s.hole[0] - 0.02 || x > s.hole[2] + 0.02 || z < s.hole[1] - 0.02 || z > s.hole[3] + 0.02) offR++; }
    const open = placed(f.g, f.at, f.yaw, -1.5); let hi = -1e9; for (let k = 1; k < open.length; k += 3) hi = Math.max(hi, open[k] - Y0);
    if (offR || Math.abs(top - (l.y + FLOOR_UP + 0.008)) > 0.01 || hi < l.y + f.d * 0.8) bad.lid.push(`${tag} alçapão ${s.id}: ${offR ? offR + ' pontos fora do buraco; ' : ''}topo ${(top - l.y).toFixed(3)}; aberto sobe ${(hi - l.y).toFixed(2)} m`);
  }
}
const few = a => (a.length ? ': ' + a.slice(0, 4).join(' · ') + (a.length > 4 ? ` … (${a.length})` : '') : '');
ok('1. todo número é número', !bad.num.length, `${jobs.length} prédios${few(bad.num)}`);
ok('1. nada fora do lote nem fora da altura do prédio', !bad.lot.length, `${jobs.length} prédios${few(bad.lot)}`);
ok('2. as paredes estão onde a planta diz, com a face virada para o cômodo', nWall > 100 && !bad.wall.length, `${nWall} raios${few(bad.wall)}`);
ok('3. portas e janelas abertas: nada no vão', nHole > 20 && !bad.hole.length, `${nHole} vãos${few(bad.hole)}`);
if (found.length) console.log(`achado da planta (Interiores): ${found.length} janelas com a verga acima do piso de cima (o piso as corta) — ${found.slice(0, 3).join(' · ')}`);
if (edgeY) console.log(`achado da planta (Interiores): ${edgeY} casas de chão junto à borda de uma escada que Interiors.floorY lê na escada (tolerância de 1 cm)`);
ok('4. o chão é o de Interiors.floorY em cada casa do piso (os degraus dentro de um degrau; o alçapão fechado é chão)', nFloor > 500 && !bad.floor.length, `${nFloor} casas${few(bad.floor)}`);
ok('5. um teto virado para o cômodo, alto bastante para ficar de pé (no jirau, sob as águas até o beiral), nunca o céu', nCeil > 200 && !bad.ceil.length, `${nCeil} casas${few(bad.ceil)}`);
ok('6. cada móvel no seu retângulo e no seu piso; todo tipo do catálogo desenhado', nItem > 50 && !bad.item.length && !bad.kind.size, `${nItem} móveis${few(bad.item)}${bad.kind.size ? '; tipos sem desenho: ' + [...bad.kind].join(', ') : ''}`);
ok('7. as folhas das portas: fechadas no vão, abertas para o primeiro cômodo; os alçapões: fechados no buraco, abertos para cima', nLeaf > 10 && !bad.leaf.length && !bad.lid.length, `${nLeaf} portas, ${nLid} alçapões${few(bad.leaf.concat(bad.lid))}`);
ok('8. puro: o mesmo desenho duas vezes, nenhum sorteio, o prédio e o acaso do mundo como estavam', !bad.pure.length && !draws[0] && !draws[1], `sorteios do mundo ${draws[0]}, do olhar ${draws[1]}${few(bad.pure)}`);
console.log('custo (triângulos, com detalhe / sem):', Object.entries(cost).map(([t, c]) => `${t} ${c.n}: média ${Math.round(c.sum / c.n)}, máx ${c.max}, leve ${Math.round(c.lean / c.n)}`).join(' · '));
ok('sem erros de módulo', JSON.stringify(G.modErr) === '{}', JSON.stringify(G.modErr));
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
