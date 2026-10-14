'use strict';
// ============================================================
//  Props3D: what lies about a building, only seen. Firewood
//  stacked under a house's eaves, a chopping block with its axe,
//  a barrel by the door, a bench; the anvil, the coal and the
//  tools of a smithy; nets, rope, crates and barrels at a quay;
//  sacks and crates at a store; pots at a potter's; baskets at a
//  market. What a building has about it comes from its kind and
//  its id (G.hash): the same house always has the same woodpile,
//  and nothing here belongs to the economy — no wood counted,
//  nothing moved, nothing in the way of anyone (the world does
//  not know it is there). Each piece stands in the strip between
//  the walls and the edge of the lot, never before the door,
//  never out on a street, on the ground (or on the plinth), and
//  goes into the chunk's one geometry with its building (no draw
//  calls of its own). Only where the machine carries detail.
// ============================================================
(function (G) {
  const W = G.W;
  const P3 = G.Props3D = {};
  const TAU = Math.PI * 2;
  let rec = null; // (while checking: every piece put — its box on the lot and its base — to be looked at)
  // the strips round a body where things may lie: for each wall the span along it (cut where the door is), how deep the strip
  // is to the edge of the lot, the way out; none on the side of a woodshed
  function slots(K) {
    const B = K.body; if (!B) return [];
    const m = K.footed ? 0.05 : 0.13; // (the plinth stops 10 cm short of the lot's edge)
    const out = [];
    for (const [side, o] of [['S', [0, 1]], ['N', [0, -1]], ['E', [1, 0]], ['W', [-1, 0]]]) {
      if (B.lean && B.lean[0] === o[0] && B.lean[1] === o[1]) continue;
      const ax = o[1] !== 0; const len = ax ? B.sx : B.sz; const wall = ax ? B.z + o[1] * B.sz / 2 : B.x + o[0] * B.sx / 2;
      // (clear of the footing's stones, that stand out a hand from the wall)
      const off = K.footed ? 0.2 : 0.02; const edge = o[0] + o[1] > 0 ? (ax ? K.d : K.w) - m : m; const depth = Math.abs(edge - wall) - off - 0.02;
      if (depth < 0.22) continue;
      const mid = ax ? B.x : B.z; let spans = [[mid - len / 2 + 0.06, mid + len / 2 - 0.06]];
      const D = B.door; if (D && D.side === side) { const a = mid + D.a; spans = [[spans[0][0], a - D.w / 2 - 0.4], [a + D.w / 2 + 0.4, spans[0][1]]].filter(s => s[1] - s[0] > 0.3); }
      for (const s of spans) out.push({ side, o, ax, a0: s[0], a1: s[1], cur: s[0], wall: wall + (o[0] + o[1]) * off, depth, ry: Math.atan2(o[0], o[1]), door: !!(D && D.side === side), da: D && D.side === side ? mid + D.a : 0, near: D && D.side === side ? Math.abs((s[0] + s[1]) / 2 - (mid + D.a)) : 0 });
    }
    return out;
  }
  // a piece of l along the wall and dp out from it, in a strip: where it goes (its middle on the lot), how it is turned, the
  // ground under it; the strip's room taken. null: no room. (at: 'start', 'end' or a fraction of the strip)
  function take(K, s, l, dp, at) {
    if (dp > s.depth || s.a1 - s.cur < l) return null;
    let a; if (at === 'end') { a = s.a1 - l / 2; s.a1 -= l + 0.08; } else if (typeof at === 'number') { a = Math.max(s.cur + l / 2, Math.min(s.a1 - l / 2, s.a0 + (s.a1 - s.a0) * at)); s.cur = a + l / 2 + 0.08; } else { a = s.cur + l / 2; s.cur += l + 0.08; }
    const w = s.wall + (s.o[0] + s.o[1]) * (dp / 2 + 0.02); const cx = s.ax ? a : w, cz = s.ax ? w : a;
    // (on a footed house the ground of the yard, its lowest corner; on a plinth its top)
    let y = 0; if (K.footed) { y = 1e9; for (const [p, q] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const X = cx + (s.ax ? p * l / 2 : q * dp / 2), Z = cz + (s.ax ? q * dp / 2 : p * l / 2); y = Math.min(y, K.gy(X, Z)); } y -= 0.03; }
    const f = { cx, cz, ry: s.ry, y, l, dp, s };
    if (rec) rec.push({ b: K.b, x0: cx - (s.ax ? l : dp) / 2, x1: cx + (s.ax ? l : dp) / 2, z0: cz - (s.ax ? dp : l) / 2, z1: cz + (s.ax ? dp : l) / 2, y, ground: K.footed ? K.gy(cx, cz) : 0, footed: K.footed, side: s.side, door: K.body && K.body.door });
    return f;
  }
  // (a point of a piece's own frame — lx along the wall, lz out from it, from its middle — on the lot)
  const pt = (f, lx, lz) => [f.cx + lx * Math.cos(f.ry) + lz * Math.sin(f.ry), f.cz - lx * Math.sin(f.ry) + lz * Math.cos(f.ry)];
  // ------------------------------ the pieces ------------------------------
  // firewood: split logs stacked in rows, their pale ends to the street, bark on their sides (len along the wall, dep its
  // depth, hgt how high; ry turns it): also the woodshed's
  P3.woodpile = function (K, x, y, z, len, dep, hgt, ry) {
    const r = 0.085; const nx = Math.max(2, Math.floor(len / (r * 2.1))), ny = Math.max(1, Math.floor(hgt / (r * 1.9)));
    const ca = Math.cos(ry), sa = Math.sin(ry);
    const end = [208, 178, 132], bark = [120, 94, 68]; const seed = K.b.id * 31 + Math.round(x * 7 + z * 13);
    const col = (X, Y, Z, nx2, ny2, nz2) => (Math.abs(nx2 * sa + nz2 * ca) > 0.7 ? end : bark);
    K.as('bark', () => { for (let j = 0; j < ny; j++) for (let i = 0; i < nx - (j % 2); i++) {
      const h1 = G.hash(seed + i * 17 + j * 131), h2 = G.hash(seed + i * 7 + j * 53 + 5);
      const lx = -len / 2 + r * 1.05 + (i + (j % 2) * 0.5) * r * 2.1, ly = y + j * r * 1.85; const lz = (h1 - 0.5) * 0.06;
      const X = x + lx * ca + lz * sa, Z = z - lx * sa + lz * ca;
      K.rbox(X, ly, Z, r * (1.6 + h2 * 0.5), r * (1.5 + h1 * 0.4), dep * (0.86 + h2 * 0.14), col, ry, 0, (h1 - 0.5) * 0.9);
    } });
  };
  function block(K, f) { // (a chopping block with the axe in it)
    const p = pt(f, 0, 0); K.as('bark', () => K.cyl(p[0], f.y, p[1], 0.21, 0.45, [104, 80, 56])); K.cyl(p[0], f.y + 0.45, p[1], 0.19, 0.012, [188, 158, 112]);
    const a = [p[0] + 0.05, f.y + 0.47, p[1]], e = [p[0] + 0.32 * Math.cos(f.ry + 0.6), f.y + 0.95, p[1] - 0.32 * Math.sin(f.ry + 0.6)];
    K.bar(a, e, [0, 0, 0.035], [0.035, 0, 0], [130, 100, 64]);
    K.as('iron', () => K.rbox(p[0] + 0.02, f.y + 0.44, p[1], 0.16, 0.09, 0.03, '#3a3836', f.ry));
  }
  function barrel(K, x, y, z, r, h, col) {
    K.as('plankV', () => K.cyl(x, y, z, r, h, col || [120, 84, 52]));
    K.as('iron', () => { for (const f of [0.18, 0.78]) K.cyl(x, y + h * f, z, r + 0.012, 0.045, '#3c3a36'); });
    K.cyl(x, y + h, z, r * 0.92, 0.015, [96, 68, 44]);
  }
  function bench(K, f) {
    K.as('plankH', () => K.rbox(...xyz(f, 0, 0.42), f.l, 0.06, 0.32, [118, 90, 60], f.ry));
    K.as('beam', () => { for (const s of [-1, 1]) K.rbox(...xyz(f, s * (f.l / 2 - 0.12), 0, 0), 0.07, 0.42, 0.26, [96, 72, 48], f.ry); });
  }
  const xyz = (f, lx, y, lz) => { const p = pt(f, lx, lz || 0); return [p[0], f.y + y, p[1]]; };
  function crate(K, f, lx, lz, s, col) {
    const p = pt(f, lx, lz); K.as('plankH', () => K.rbox(p[0], f.y, p[1], s, s * 0.8, s * 0.86, col || [150, 116, 76], f.ry + (G.hash(K.b.id + lx * 100) - 0.5) * 0.3));
    K.as('beam', () => K.rbox(p[0], f.y + s * 0.8, p[1], s * 1.02, 0.03, s * 0.88, dim(col || [150, 116, 76], 0.78), f.ry));
  }
  function sack(K, x, y, z, s, k) {
    const R3 = G.Realm; K.as('cloth', () => K.g.put(R3.SH.ico0, R3.mat(K.x0 + x, K.y0 + y + s * 0.42, K.z0 + z, k * 1.7, s, s * 1.15, s * 0.85), K.c(mix([196, 178, 136], [168, 150, 112], G.hash(k * 7)))));
    K.cyl(x, y + s * 0.92, z, s * 0.16, s * 0.18, [150, 130, 96]);
  }
  function pot(K, x, y, z, s, col) {
    K.as('mud', () => { K.sph(x, y + s * 0.5, z, s * 0.5, col, s * 0.48); K.cyl(x, y + s * 0.86, z, s * 0.24, s * 0.22, dim(col, 0.9)); });
  }
  function basket(K, x, y, z, k) {
    K.as('thatch', () => K.cyl(x, y, z, 0.23, 0.24, [168, 132, 76]));
    const fr = [[196, 64, 48], [226, 168, 58], [118, 160, 64], [150, 96, 160]][k % 4]; for (let q = 0; q < 3; q++) K.sph(x + Math.cos(q * 2.1 + k) * 0.08, y + 0.27, z + Math.sin(q * 2.1 + k) * 0.08, 0.075, fr);
  }
  const dim = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  // ------------------------------ what each kind has about it ------------------------------
  // (a strip of a side, preferring one without the door, the biggest first)
  const pick = (S, want, fn) => { const c = S.filter(fn || (() => true)).sort((a, b) => (a.door - b.door) || (b.a1 - b.cur) - (a.a1 - a.cur)); return c[0] || null; };
  function home(K, S) {
    const nord = K.st === 'nordico'; const h = k => K.hv(900 + k);
    // the firewood under the eaves (the north always; elsewhere now and then), the block beside it
    if (nord ? h(1) < 0.88 : h(1) < 0.4) { const s = pick(S, 0, q => q.depth >= 0.36); if (s) { const l = Math.min(s.a1 - s.cur, 0.9 + h(2) * 1.1); const f = take(K, s, l, Math.min(0.42, s.depth - 0.02), h(3) < 0.5 ? 'start' : 'end');
      if (f) { P3.woodpile(K, f.cx, f.y, f.cz, l, f.dp, 0.5 + h(4) * 0.5, f.ry + Math.PI / 2 * 0); if (h(5) < 0.65) { const g = take(K, s, 0.5, Math.min(0.45, s.depth), 'start') || take(K, s, 0.5, Math.min(0.45, s.depth)); if (g) block(K, g); } } } }
    // a barrel or a tub by the door, a bench against the wall beside it
    const ds = S.filter(q => q.door).sort((a, b) => a.near - b.near);
    if (ds.length && h(6) < 0.7) { const s = ds[0]; const dp = Math.min(0.52, s.depth); if (dp >= 0.38) { const f = take(K, s, dp + 0.06, dp, s.a1 <= s.da ? 'end' : 'start'); if (f) barrel(K, f.cx, f.y, f.cz, dp / 2 - 0.02, 0.62 + dp * 0.12, h(7) < 0.5 ? [112, 80, 50] : [130, 96, 60]); } }
    if (ds.length > 1 || (ds.length && h(8) < 0.5)) { const s = ds[ds.length - 1]; const f = take(K, s, 1.1, Math.min(0.36, s.depth)); if (f && f.dp >= 0.3) bench(K, f); }
  }
  // (the ground under a small piece at (x, z) of the lot, r its half size: its lowest point, on a footed house; the plinth's top)
  const gyAt = (K, x, z, r) => (K.footed ? Math.min(K.gy(x - r, z - r), K.gy(x + r, z - r), K.gy(x - r, z + r), K.gy(x + r, z + r)) - 0.03 : 0);
  // (the room a yard leaves out from the wall: up to the fence Build3D put a hand inside the lot — K.body.yard)
  const yardRoom = (K, s) => { const Y = K.body && K.body.yard; return Y && s.door && Y.side === s.side ? Math.min(s.depth, Y.n1 - (K.footed ? 0.2 : 0.02) - 0.3) : 0; };
  // a heap of sacks against the wall, three in a row, two before them, two on top (f: the room it is given)
  function sackHeap(K, f, k) {
    const h = q => K.hv(1300 + k * 11 + q);
    for (let i = 0; i < 3; i++) { const p = pt(f, (i - 1) * 0.4 + (h(i) - 0.5) * 0.06, -f.dp / 2 + 0.25); sack(K, p[0], gyAt(K, p[0], p[1], 0.2), p[1], 0.46 + h(3 + i) * 0.06, k + i); }
    if (f.dp > 0.85) for (let i = 0; i < 2; i++) { const p = pt(f, (i - 0.5) * 0.44 + (h(6 + i) - 0.5) * 0.08, -f.dp / 2 + 0.68); sack(K, p[0], gyAt(K, p[0], p[1], 0.2), p[1], 0.42, k + 4 + i); }
    for (let i = 0; i < 2; i++) { if (h(9 + i) < 0.3) continue; const p = pt(f, (i - 0.5) * 0.4, -f.dp / 2 + 0.3); sack(K, p[0], gyAt(K, p[0], p[1], 0.2) + 0.41, p[1], 0.4, k + 7 + i); }
  }
  // crates stacked: two against the wall, one on them turned a little, a small one before them
  function crateStack(K, f, k) {
    const h = q => K.hv(1400 + k * 11 + q); const box = (lx, lz, y, s, col, dr) => { const p = pt(f, lx, lz); const y0 = y === null ? gyAt(K, p[0], p[1], s / 2) : y;
      K.as('plankH', () => K.rbox(p[0], y0, p[1], s, s * 0.8, s * 0.86, col, f.ry + dr)); K.as('beam', () => K.rbox(p[0], y0 + s * 0.8, p[1], s * 1.02, 0.03, s * 0.88, dim(col, 0.78), f.ry + dr)); return y0 + s * 0.8 + 0.03; };
    const a = box(-0.29, -f.dp / 2 + 0.3, null, 0.56, [150, 116, 76], (h(0) - 0.5) * 0.12), b = box(0.3, -f.dp / 2 + 0.29, null, 0.52, [136, 104, 70], (h(1) - 0.5) * 0.12);
    if (h(2) < 0.75) box((h(3) - 0.5) * 0.2, -f.dp / 2 + 0.3, Math.max(a, b), 0.46, [158, 124, 84], 0.25 + h(4) * 0.3);
    if (f.dp > 0.8) box(-0.1 + h(5) * 0.2, -f.dp / 2 + 0.72, null, 0.38, [142, 110, 72], (h(6) - 0.5) * 0.6);
  }
  // barrels: two or three standing against the wall, one on its side before them, chocked
  function barrels(K, f, k) {
    const h = q => K.hv(1500 + k * 11 + q); const n = h(0) < 0.5 ? 2 : 3;
    for (let i = 0; i < n; i++) { const lx = (i - (n - 1) / 2) * 0.58; const p = pt(f, lx, -f.dp / 2 + 0.3); barrel(K, p[0], gyAt(K, p[0], p[1], 0.26), p[1], 0.27, 0.74 + h(1 + i) * 0.1, h(5 + i) < 0.5 ? [112, 80, 50] : [130, 96, 60]); }
    if (f.dp > 0.75) { const r = 0.25, A = pt(f, -0.36, f.dp / 2 - 0.27), B = pt(f, 0.36, f.dp / 2 - 0.27); const y = Math.min(gyAt(K, A[0], A[1], 0.2), gyAt(K, B[0], B[1], 0.2)) + r;
      K.as('plankV', () => K.log([A[0], y, A[1]], [B[0], y, B[1]], r, [122, 88, 56]));
      K.as('iron', () => { for (const t of [0.16, 0.84]) { const a = [A[0] + (B[0] - A[0]) * (t - 0.03), y, A[1] + (B[1] - A[1]) * (t - 0.03)], b = [A[0] + (B[0] - A[0]) * (t + 0.03), y, A[1] + (B[1] - A[1]) * (t + 0.03)]; K.log(a, b, r + 0.012, '#3c3a36'); } }); }
  }
  // hay in a heap, a fork stuck in it
  function hayHeap(K, f, k) {
    const h = q => K.hv(1600 + k * 11 + q); const p = pt(f, 0, -f.dp / 2 + Math.min(0.62, f.dp / 2)); const y = gyAt(K, p[0], p[1], 0.4) + 0.05; const r = Math.min(0.72, f.l / 2 - 0.05, f.dp / 2);
    K.as('thatch', () => { K.sph(p[0], y, p[1], r, [200, 170, 96], 0.85 + h(0) * 0.25); const q = pt(f, (h(1) - 0.5) * 0.4, -f.dp / 2 + 0.4); K.sph(q[0], y, q[1], r * 0.62, [188, 160, 90], 0.6); });
    if (h(2) < 0.7) { const a = [p[0] + 0.12, y + 0.55, p[1]], e = [p[0] + 0.32, y + 1.65, p[1] - 0.18]; K.bar(a, e, [0, 0, 0.04], [0.04, 0, 0], [126, 98, 64]); }
  }
  function store(K, S) { // (sacks, crates and barrels: the goods of a store or a barn heaped in its yard, and along its other walls)
    let k = 0; for (const s of S) { const room = yardRoom(K, s);
      if (room >= 0.6) { // (the yard: a heap on each side of the way to the door, the farther from the door first)
        const kinds = K.b.type === 'celeiro' ? [[hayHeap, 1.55], [sackHeap, 1.3], [crateStack, 1.2]] : [[sackHeap, 1.3], [crateStack, 1.2], [barrels, 1.35]];
        const j = Math.floor(K.hv(1290 + (s.a1 <= s.da ? 0 : 1)) * kinds.length); const far = s.a1 <= s.da; // (a strip before the door: its far end is a0)
        for (let q = 0; q < 2; q++) { const [fn, l] = kinds[(j + q) % kinds.length]; const f = take(K, s, l, room, far ? 'start' : 'end'); if (!f) break; fn(K, f, k++); }
        continue; }
      if (s.depth < 0.42) continue; const n = Math.floor((s.a1 - s.cur) / 0.75);
      for (let q = 0; q < n; q++) { const r = K.hv(950 + k); const f = take(K, s, 0.62, Math.min(0.62, s.depth)); if (!f) break; k++;
        if (r < 0.4) { sack(K, f.cx, f.y, f.cz, 0.42, k); if (r < 0.2) sack(K, f.cx + 0.08, f.y + 0.4, f.cz + 0.05, 0.36, k + 3); }
        else if (r < 0.75) { crate(K, f, 0, 0, 0.56); if (r < 0.55) crate(K, f, 0.02, 0.01, 0.4, [136, 104, 70]); }
        else barrel(K, f.cx, f.y, f.cz, 0.26, 0.7); } }
  }
  // the open work floor of a smithy or a workshop (Build3D leaves it: K.body.floor): what is worked there, out of the way
  // from the edge of the lot to the shop's door
  function floor(K, F) {
    const R3 = G.Realm; const hw = 0.95; // (the way to the door kept clear: its half width)
    const P = (a, n) => { const p = F.at(a, 0, n); return [p[0], p[2]]; };
    const ry = Math.atan2(F.od[0], F.od[1]); // (a piece's own Z out toward the door side, X along the wall)
    const put = (a, n, l, dp) => { const lo = a - l / 2, hi = a + l / 2; if (hi > F.doorA - hw && lo < F.doorA + hw) return null; if (lo < F.a0 || hi > F.a1 || n - dp / 2 < F.n0 || n + dp / 2 > F.n1 + 0.2) return null;
      const p = P(a, n); const f = { cx: p[0], cz: p[1], ry, y: F.y, l, dp }; if (rec) { const ex = F.ax ? l : dp, ez = F.ax ? dp : l; rec.push({ b: K.b, x0: p[0] - ex / 2, x1: p[0] + ex / 2, z0: p[1] - ez / 2, z1: p[1] + ez / 2, y: F.y, ground: F.y, footed: false }); } return f; };
    const nm = (F.n0 + F.n1) / 2; const away = F.doorA >= 0 ? -1 : 1; // (the side of the floor away from the door)
    if (F.kind === 'forge') {
      const hA = F.hearthA !== null ? F.hearthA : away * (F.a1 - 0.8); const toward = -Math.sign(hA) || 1;
      // (the anvil on its stump before the hearth, the tub beside it, the coal by the hearth, the rack of tools, a grindstone)
      let f = put(hA + toward * 0.25, nm + 0.35, 0.6, 0.5); if (f) { const p = pt(f, 0, 0); K.as('bark', () => K.cyl(p[0], f.y, p[1], 0.24, 0.5, [96, 74, 52]));
        K.as('iron', () => { K.rbox(p[0], f.y + 0.5, p[1], 0.22, 0.12, 0.13, '#3a3a3e', f.ry); K.rbox(p[0], f.y + 0.62, p[1], 0.48, 0.14, 0.18, '#45454a', f.ry); const hp = pt(f, 0.3, 0); K.rbox(hp[0], f.y + 0.66, hp[1], 0.18, 0.08, 0.09, '#45454a', f.ry, 0, -0.3);
          const t = pt(f, -0.1, 0.06); K.bar([t[0], f.y + 0.77, t[1]], [t[0] + 0.25 * Math.cos(f.ry + 0.4), f.y + 0.79, t[1] - 0.25 * Math.sin(f.ry + 0.4)], [0, 0.03, 0], [0.03 * Math.sin(f.ry), 0, 0.03 * Math.cos(f.ry)], '#2e2c2a'); }); }
      f = put(hA + toward * 1.0, nm + 0.35, 0.6, 0.6); if (f) barrel(K, f.cx, f.y, f.cz, 0.28, 0.5, [104, 78, 52]);
      f = put(hA + toward * 1.05, F.n0 + 0.3, 0.7, 0.4); if (f) { for (let q = 0; q < 6; q++) { const p = pt(f, (G.hash(K.b.id + q) - 0.5) * 0.5, (G.hash(K.b.id * 3 + q) - 0.5) * 0.25); K.g.put(R3.SH.ico0, R3.mat(K.x0 + p[0], K.y0 + f.y + 0.05 + (q % 3) * 0.05, K.z0 + p[1], q, 0.2, 0.15, 0.19), K.c(q % 2 ? '#24221f' : '#2e2b28')); } }
      f = put(-Math.sign(hA) * (F.a1 - 0.3), nm, 0.25, 1.0); if (f) rack(K, f, 1);
      f = put(-Math.sign(hA) * (F.a1 - 1.1), F.n1 - 0.15, 0.7, 0.5); if (f) { const p = pt(f, 0, 0); K.as('beam', () => { for (const s of [-1, 1]) { const q = pt(f, 0, s * 0.18); K.rbox(q[0], f.y, q[1], 0.06, 0.62, 0.06, [100, 76, 52], f.ry); } });
        const a = pt(f, 0, -0.06), e = pt(f, 0, 0.06); K.as('rock', () => K.log([a[0], f.y + 0.62, a[1]], [e[0], f.y + 0.62, e[1]], 0.3, [150, 140, 126])); void p; }
    } else {
      // (the joiner's bench with its tools, the trestle with a log on it, planks stacked against the shop)
      let f = put(away * (F.a1 - 0.95), F.n0 + 0.45, 1.7, 0.7); if (f) { K.as('plankH', () => K.rbox(...xyz(f, 0, 0.8), 1.7, 0.08, 0.7, [150, 116, 76], f.ry)); K.as('beam', () => { for (const s of [-1, 1]) for (const t of [-1, 1]) K.rbox(...xyz(f, s * 0.72, 0, t * 0.26), 0.08, 0.8, 0.08, [110, 84, 56], f.ry); });
        K.as('iron', () => { K.rbox(...xyz(f, -0.4, 0.88, 0.1), 0.26, 0.05, 0.06, '#5a5652', f.ry + 0.3); K.rbox(...xyz(f, 0.3, 0.88, -0.12), 0.34, 0.03, 0.05, '#6a6460', f.ry - 0.2); }); }
      f = put(-away * (F.a1 - 1.0), nm + 0.2, 1.3, 0.7); if (f) { const lx = [Math.cos(f.ry) * 0.05, 0, -Math.sin(f.ry) * 0.05]; K.as('beam', () => { for (const s of [-1, 1]) for (const t of [-1, 1]) K.bar(xyz(f, s * 0.5, 0, t * 0.25), xyz(f, s * 0.5, 0.62, 0), lx, [0, 0.05, 0], [110, 84, 56]); });
        const a = xyz(f, -0.65, 0.68, 0), e = xyz(f, 0.65, 0.68, 0); K.as('bark', () => K.log(a, e, 0.13, [118, 92, 64])); }
      f = put(-away * (F.a1 - 0.3), F.n0 + 0.25, 0.5, 0.35); if (f) K.as('plankV', () => { for (let q = 0; q < 4; q++) K.rbox(...xyz(f, -0.15 + q * 0.1, 0, 0.05 * q), 0.04, 1.7 - q * 0.08, 0.3, [176, 140, 96], f.ry, -0.12, 0); });
    }
  }
  // (a rack of tools: two posts, a rail, three tools leaning on it — hammers, tongs)
  function rack(K, f, ir) {
    K.as('beam', () => { for (const sd of [-1, 1]) K.rbox(...xyz(f, 0, 0, sd * 0.42), 0.06, 1.1, 0.06, [100, 76, 52], f.ry); K.rbox(...xyz(f, 0, 0.95, 0), 0.05, 0.05, 0.9, [100, 76, 52], f.ry); });
    K.as('iron', () => { for (let q = 0; q < 3; q++) { const a = xyz(f, 0.08, 0.02, -0.25 + q * 0.25), e = xyz(f, 0.02, 0.92, -0.22 + q * 0.25); K.bar(a, e, [0.03, 0, 0], [0, 0, 0.03], q === 1 && !ir ? [118, 92, 62] : '#4a4a4e'); } });
  }
  function smithy(K, S) { // (the anvil on its stump, the coal, the quench tub, the tools on a rack)
    if (K.body && K.body.floor) return floor(K, K.body.floor);
    const s = pick(S, 0, q => q.depth >= 0.5); if (s) { const f = take(K, s, 0.7, Math.min(0.6, s.depth), 0.3); if (f) {
      const p = pt(f, 0, 0); K.as('bark', () => K.cyl(p[0], f.y, p[1], 0.24, 0.48, [96, 74, 52]));
      K.as('iron', () => { K.rbox(p[0], f.y + 0.48, p[1], 0.24, 0.12, 0.14, '#3a3a3e', f.ry); K.rbox(p[0], f.y + 0.6, p[1], 0.46, 0.14, 0.18, '#45454a', f.ry); const hp = pt(f, 0.3, 0); K.rbox(hp[0], f.y + 0.64, hp[1], 0.18, 0.08, 0.09, '#45454a', f.ry, 0, -0.3); }); }
      const c = take(K, s, 0.7, Math.min(0.6, s.depth)); if (c) { const R3 = G.Realm; for (let q = 0; q < 6; q++) { const p = pt(c, (G.hash(K.b.id + q) - 0.5) * 0.5, (G.hash(K.b.id * 3 + q) - 0.5) * 0.3); K.g.put(R3.SH.ico0, R3.mat(K.x0 + p[0], K.y0 + c.y + 0.06 + (q % 3) * 0.06, K.z0 + p[1], q, 0.22, 0.16, 0.2), K.c(q % 2 ? '#24221f' : '#2e2b28')); } } }
    const t = pick(S, 0, q => q.depth >= 0.26); if (t) { const f = take(K, t, 1.0, 0.22); if (f) {
      K.as('beam', () => { for (const sd of [-1, 1]) K.rbox(...xyz(f, sd * 0.45, 0, -0.05), 0.06, 1.1, 0.06, [100, 76, 52], f.ry); K.rbox(...xyz(f, 0, 0.95, -0.05), 1.0, 0.05, 0.05, [100, 76, 52], f.ry); });
      K.as('iron', () => { for (let q = 0; q < 3; q++) { const a = xyz(f, -0.25 + q * 0.25, 0.02, 0.05), e = xyz(f, -0.25 + q * 0.25 + 0.04, 0.92, -0.02); K.bar(a, e, [0.03, 0, 0], [0, 0, 0.03], q === 1 ? [118, 92, 62] : '#4a4a4e'); } }); } }
  }
  function quay(K, S) { // (nets hung to dry, a coil of rope, crates and barrels)
    const s = pick(S, 0, q => q.depth >= 0.5); if (s) { const f = take(K, s, 1.6, 0.4); if (f) {
      K.as('beam', () => { for (const sd of [-1, 1]) K.rbox(...xyz(f, sd * 0.75, 0, 0), 0.08, 1.7, 0.08, [104, 80, 56], f.ry); K.rbox(...xyz(f, 0, 1.62, 0), 1.6, 0.07, 0.07, [104, 80, 56], f.ry); });
      K.as('cloth', () => K.rbox(...xyz(f, 0, 0.35, 0.02), 1.4, 1.25, 0.02, [74, 84, 76], f.ry)); } }
    for (const q of S) { if (q.depth < 0.5) continue; const f = take(K, q, 0.6, Math.min(0.6, q.depth)); if (!f) continue; const r = K.hv(970 + (q.side.charCodeAt(0)));
      if (r < 0.35) { K.cyl(f.cx, f.y, f.cz, 0.24, 0.12, [190, 166, 120]); K.cyl(f.cx, f.y + 0.12, f.cz, 0.12, 0.01, [92, 78, 58]); }
      else if (r < 0.7) crate(K, f, 0, 0, 0.55, [140, 112, 80]); else barrel(K, f.cx, f.y, f.cz, 0.26, 0.7); }
  }
  // the potter's pots set out to dry: a row against the wall, in the yard a second row before it (and never by the kiln, which
  // Build3D put in the yard: K.body.kiln); each pot its size and clay by the house's id, on its own ground
  function potter(K, S) { const kl = K.body && K.body.kiln; let k = 0; const CL = [[176, 98, 64], [160, 110, 76], [196, 132, 90], [150, 92, 62]];
    for (const s of S) { if (s.depth < 0.4 || (kl && kl.side === s.side && kl.at > s.a0 - 0.8 && kl.at < s.a1 + 0.8)) continue; const room = yardRoom(K, s); const rows = room >= 0.8 ? 2 : 1;
      const f = take(K, s, 1.2, rows > 1 ? Math.min(0.95, room) : Math.min(0.5, s.depth)); if (!f) continue;
      for (let r = 0; r < rows; r++) for (let q = 0; q < 3 - r; q++) { const h = K.hv(990 + k); const p = pt(f, -0.4 + q * 0.4 + r * 0.2 + (h - 0.5) * 0.08, rows > 1 ? -f.dp / 2 + 0.24 + r * 0.44 : 0); const s2 = (0.32 + h * 0.16) * (r ? 0.8 : 1);
        pot(K, p[0], gyAt(K, p[0], p[1], s2 * 0.4), p[1], s2, CL[(k++ + K.b.id) % 4]); } } }
  // the inn's yard: barrels on one side of the way to the door, a trestle table with its two benches on the other
  function tavern(K, S) {
    const ds = S.filter(q => q.door && yardRoom(K, q) >= 0.6); if (!ds.length) return home(K, S);
    const first = Math.floor(K.hv(1800) * ds.length) % ds.length;
    ds.forEach((s, i) => { const room = yardRoom(K, s); const far = s.a1 <= s.da;
      if (i === first) { const f = take(K, s, 1.35, Math.min(0.85, room), far ? 'start' : 'end'); if (f) barrels(K, f, 40); return; }
      const f = take(K, s, 1.9, Math.min(1.3, room), far ? 'start' : 'end'); if (!f) return;
      const P = (lx, lz) => pt(f, lx, lz); const y = gyAt(K, f.cx, f.cz, 0.6); const wc = [118, 90, 60];
      // (the table: a top of planks on two trestles; a bench along each long side)
      const tz = f.dp >= 1.15 ? 0 : -0.1; K.as('plankH', () => K.rbox(...xyz(f, 0, 0.74, tz), 1.5, 0.05, 0.62, [136, 104, 70], f.ry));
      K.as('beam', () => { for (const e of [-0.6, 0.6]) for (const t of [-0.22, 0.22]) { const a = P(e, tz + t), b = P(e, tz); K.bar([a[0], y, a[1]], [b[0], f.y + 0.74, b[1]], [0, 0, 0.05], [0.05, 0, 0], wc); } });
      if (f.dp >= 1.15) for (const sd of [-1, 1]) { const g = { cx: P(0, sd * 0.5)[0], cz: P(0, sd * 0.5)[1], ry: f.ry, y: f.y, l: 1.4, dp: 0.3 }; bench(K, g); } else bench(K, { cx: P(0, 0.38)[0], cz: P(0, 0.38)[1], ry: f.ry, y: f.y, l: 1.4, dp: 0.3 });
    });
  }
  function market(K, S) { void S; // (baskets of what is sold beside the stalls)
    const n = K.b.type === 'mercado_negro' ? 2 : 4; for (let k = 0; k < n; k++) { const px = K.w * ((k % 2) * 0.5 + 0.25) + 1.25, pz = K.d * (Math.floor(k / 2) * 0.5 + 0.25) + 0.3;
      if (px > K.w - 0.4 || pz > K.d - 0.4) continue; const y = K.footed ? K.gy(px, pz) - 0.03 : 0; basket(K, px, y, pz, k + K.b.id); if (rec) rec.push({ b: K.b, x0: px - 0.24, x1: px + 0.24, z0: pz - 0.24, z1: pz + 0.24, y, ground: y, footed: true }); } }
  const KIND = { hut: home, house: home, sobrado: home, insula: home, barraco: home, storehouse: store, armazem: store, celeiro: store, workshop: smithy, forja: smithy, doca: quay, olaria: potter, mercado: market, feira: market, mercado_negro: market, taverna: tavern };
  // what a built building has about it (build3d calls this after drawing it, with its kit)
  P3.into = function (K) { const f = KIND[K.b.type]; if (!f) return; const S = slots(K); if (!S.length && f !== market) return; f(K, S); };
  // the drawing's own proof: the pieces of the buildings given (Build3D.check passes the ones near the body) drawn again and
  // looked at — on its lot, never in front of its door, standing on its ground, numbers that are numbers
  P3.check = function (list) {
    const out = []; if (!G.Build3D || !G.Build3D.propsOf || !G.Realm.renderer || !G.Realm.renderer()) return out; const L = G.Space.TILE; // (only once the 3D is made)
    for (const b of list) {
      rec = []; const B = G.Build3D.propsOf(b); const got = rec; rec = null;
      const tag = `${b.type}#${b.id} (enfeite)`;
      for (const r of got) {
        if (![r.x0, r.x1, r.z0, r.z1, r.y].every(Number.isFinite)) { out.push(`${tag}: números que não são números`); continue; }
        // (on its own lot: the box of the lot in metres from its corner)
        const e = 0.06; if (r.x0 < -e || r.z0 < -e || r.x1 > b.w * L + e || r.z1 > b.h * L + e) out.push(`${tag}: fora do lote (${r.x0.toFixed(2)}..${r.x1.toFixed(2)}, ${r.z0.toFixed(2)}..${r.z1.toFixed(2)})`);
        if (r.footed && r.y > r.ground + 0.02) out.push(`${tag}: flutua ${(r.y - r.ground).toFixed(2)} m`);
        if (r.footed && r.y < r.ground - 0.6) out.push(`${tag}: enterrado ${(r.ground - r.y).toFixed(2)} m`);
      }
      // (never in front of the door: the strip there is cut — nothing put in it)
      if (B && B.door) { const o = B.door.o; const ax = o[1] !== 0; const a = (ax ? B.x : B.z) + B.door.a; const hw = B.door.w / 2 + 0.3; const wall = ax ? B.z + o[1] * B.sz / 2 : B.x + o[0] * B.sx / 2;
        for (const r of got) { const lo = ax ? r.x0 : r.z0, hi = ax ? r.x1 : r.z1; const oLo = ax ? r.z0 : r.x0, oHi = ax ? r.z1 : r.x1;
          const before = o[0] + o[1] > 0 ? oLo >= wall - 0.05 : oHi <= wall + 0.05; if (before && hi > a - hw && lo < a + hw) out.push(`${tag}: na frente da porta`); } }
    }
    return out;
  };
})(window.G);
