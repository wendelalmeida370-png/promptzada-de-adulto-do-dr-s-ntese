'use strict';
// ============================================================
//  Props3D: what lies about a building, only seen. Firewood
//  stacked under a house's eaves, a chopping block with its axe,
//  a barrel by the door, a bench; the anvil, the coal and the
//  tools of a smithy; nets and rope at a quay; pots at a potter's;
//  baskets at a market. What a building has about it comes from
//  what its people and their trades really have (G.Atmos.about,
//  D-163): the firewood of the woodcutter who lives there, a cask
//  for each drink the house keeps, the bench and the washing of a
//  house someone lives in, the nets of the fisher, the pots a
//  pottery has drying, the casks of what a tavern has to pour, the
//  baskets of what a market has on its shelf — an empty house has
//  nothing about it; the id (G.hash) only says where each thing
//  lies and how big it is, so the same house keeps its look. None
//  of it is moved or counted here (only read), nothing stands in
//  the way of anyone. A store shows its people's stock as the
//  god's view draws it (Props3D.piles), and the crates on a quay
//  are the world's own, drawn by People3D. Each piece stands in the strip between
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
    if (B.shell && !B.open) { const sl = shellSlots(K); if (sl) return sl; }
    const m = K.footed ? 0.05 : 0.13; // (the plinth stops 10 cm short of the lot's edge)
    const out = [];
    for (const [side, o] of [['S', [0, 1]], ['N', [0, -1]], ['E', [1, 0]], ['W', [-1, 0]]]) {
      if (B.lean && B.lean[0] === o[0] && B.lean[1] === o[1]) continue;
      const ax = o[1] !== 0; const len = ax ? B.sx : B.sz; const wall = ax ? B.z + o[1] * B.sz / 2 : B.x + o[0] * B.sx / 2;
      // (clear of the footing's stones, that stand out a hand from the wall)
      const off = K.footed ? 0.2 : 0.02; const edge = o[0] + o[1] > 0 ? (ax ? K.d : K.w) - m : m; const depth = Math.abs(edge - wall) - off - 0.02;
      if (depth < 0.22) continue;
      const mid = ax ? B.x : B.z; let spans = [[mid - len / 2 + 0.06, mid + len / 2 - 0.06]];
      // (cut where the door is — and where its steps run along the wall, when it has a flight there: Build3D's door.cut)
      const D = B.door; if (D && D.side === side) { const a = mid + (D.cut ? D.cut[0] : D.a), cw = D.cut ? Math.max(D.w, D.cut[1] + 0.1) : D.w; spans = [[spans[0][0], a - cw / 2 - 0.4], [a + cw / 2 + 0.4, spans[0][1]]].filter(s => s[1] - s[0] > 0.3); }
      for (const s of spans) out.push({ side, o, ax, a0: s[0], a1: s[1], cur: s[0], wall: wall + (o[0] + o[1]) * off, depth, ry: Math.atan2(o[0], o[1]), door: !!(D && D.side === side), da: D && D.side === side ? mid + D.a : 0, near: D && D.side === side ? Math.abs((s[0] + s[1]) / 2 - (mid + D.a)) : 0 });
    }
    return out;
  }
  // The strips of a building drawn from its plan (Build3D's shell: D-186). Its walls, its annexes and its yard's fence fill
  // the lot or nearly: what lies about it lies on its own lot still — where nobody walks: the world's map has the lot
  // blocked, the body stands on it only at its doors' steps (Space.indoor) —, in the strip each side leaves from its outer
  // face — the nearest of the shell, an annex, the yard's fence — to the lot's edge. A strip deep enough beyond the footing's
  // stones is the yard of before: things stand on its ground. A shallow one (a hand or two: the house of a town's centre) is
  // thin: things a hand deep stand on the ledge of the footing — the stones' top, at the floor's height — or hang on the wall,
  // clear of the ground storey's windows (wins: each one's span with its shutters' reach, and how high a thing under it may
  // stand). Never before a door or a gate, nor where a flight of steps is laid (Build3D's own: K.steps); nothing on a side an
  // outside flight goes up along; none round a house on posts but on its ground. Null: no shell to read (drawn as before)
  const LEDGE = -0.02, THIN = 0.06, THIN_MAX = 0.15, GROUND = 0.22;
  function shellSlots(K) {
    const B3 = G.Build3D; const S = B3 && B3.shellOf ? B3.shellOf(K.b) : null; if (!S || !S.shell) return null;
    if (S.shell.kind === 'round') return roundSlots(K, S); if (S.shell.kind !== 'rect') return null;
    const sh = S.shell; const byLv = new Map(S.levels.map(l => [l.lv, l]));
    const body = S.levels.filter(l => l.kind !== 'porao' && l.kind !== 'terraco' && l.kind !== 'jirau').sort((a, c) => a.y - c.y); const l0 = body[0] || S.levels[0];
    const raised = !!l0 && (l0.kind === 'elevado' || sh.base === 'esteios');
    // (the peoples whose windows have shutters, open flat on the wall beside them: Build3D's winDress)
    const shut = K.st === 'classico' || K.st === 'grego' || K.st === 'romano' || K.st === 'nordico';
    const solids = [{ r: sh.r, k: 'wall' }]; for (const a of sh.annex || []) solids.push({ r: a.r, k: 'wall' });
    if (sh.yard) solids.push({ r: sh.yard.r, k: 'fence' }); for (const st of S.steps || []) solids.push({ r: st.r, k: 'stair' });
    // (the treads Build3D laid before the doors and the gates, on the lot)
    const treads = (K.steps || []).map(t => [t[0] - K.x0, t[2] - K.z0, t[1] - K.x0, t[3] - K.z0]);
    const out = [];
    for (const [side, o] of [['S', [0, 1]], ['N', [0, -1]], ['E', [1, 0]], ['W', [-1, 0]]]) {
      const ax = o[1] !== 0, sg = o[0] + o[1]; const edge = sg > 0 ? (ax ? K.d : K.w) : 0;
      const ext = q => (ax ? [q.r[0], q.r[2]] : [q.r[1], q.r[3]]), faceOf = q => (sg > 0 ? (ax ? q.r[3] : q.r[2]) : (ax ? q.r[1] : q.r[0]));
      // (along the side, piece by piece: the outer face nearest the lot's edge there)
      const cuts = [...new Set(solids.flatMap(q => ext(q)))].sort((a, b) => a - b); const runs = [];
      for (let k = 0; k + 1 < cuts.length; k++) {
        const u0 = cuts[k], u1 = cuts[k + 1], mid = (u0 + u1) / 2; if (u1 - u0 < 0.05) continue; let best = null;
        for (const q of solids) { const e = ext(q); if (mid <= e[0] || mid >= e[1]) continue; const d = Math.abs(edge - faceOf(q)); if (!best || d < best.d - 1e-6 || (Math.abs(d - best.d) <= 1e-6 && q.k === 'wall' && best.q.k === 'fence')) best = { q, d }; }
        if (!best) continue; const last = runs[runs.length - 1];
        if (last && last.q === best.q && Math.abs(last.u1 - u0) < 1e-6) last.u1 = u1; else runs.push({ q: best.q, d: best.d, u0, u1 });
      }
      for (const run of runs) {
        const q = run.q; if (q.k === 'stair') continue; const face = faceOf(q); const fence = q.k === 'fence';
        const off = fence ? 0.03 : raised ? 0.1 : 0.2; const gd = run.d - 0.05 - off - 0.02;
        let depth, thin = false;
        if (gd >= GROUND) depth = gd; else if (!fence && !raised) { depth = Math.min(THIN_MAX, run.d - 0.02); thin = true; if (depth < THIN) continue; } else continue;
        // (the openings of the walls on this face: the doors and the gates cut the strip; the windows of the ground storey
        // keep what is thin clear of them)
        const F = { ax, o, line: face, u0: run.u0, u1: run.u1 }; const cut = [], wins = []; let da = null;
        for (const h of S.holes) {
          const w = S.byId.get(h.wall); const l = w && byLv.get(w.lv); if (!l || l.kind === 'terraco' || w.kind === 'parapeito' || w.kind === 'guarda-corpo' || !wallOn(w, F)) continue;
          const Lw = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const uc = ax ? w.a[0] + (w.b[0] - w.a[0]) / Lw * h.at : w.a[1] + (w.b[1] - w.a[1]) / Lw * h.at; const y0 = l.y + (h.sill || 0);
          if (h.kind !== 'janela') { if (y0 < 2.2) { cut.push([uc - h.w / 2 - 0.65, uc + h.w / 2 + 0.65]); if (da === null || Math.abs(uc - (run.u0 + run.u1) / 2) < Math.abs(da - (run.u0 + run.u1) / 2)) da = uc; } }
          else if (y0 < 2.4) { const reach = h.w / 2 + 0.2 + (shut ? h.w / 2 + 0.13 : 0); wins.push([uc - reach, uc + reach, y0 - 0.45]); }
        }
        // (and the steps laid in the strip: a flight along the wall, the steps of a gate)
        const n0 = Math.min(face, edge) - 0.05, n1 = Math.max(face, edge) + 0.05;
        for (const t of treads) { const a = ax ? [t[0], t[2]] : [t[1], t[3]], n = ax ? [t[1], t[3]] : [t[0], t[2]]; if (n[1] > n0 && n[0] < n1 && a[1] > run.u0 && a[0] < run.u1) cut.push([a[0] - 0.12, a[1] + 0.12]); }
        const inset = fence || K.st !== 'nordico' ? 0.1 : 0.22; // (clear of the corners: the north's posts stand a hand out of them)
        let spans = [[run.u0 + inset, run.u1 - inset]];
        for (const c of cut) spans = spans.flatMap(s => (c[1] <= s[0] || c[0] >= s[1] ? [s] : [[s[0], c[0]], [c[1], s[1]]]));
        for (const s of spans) { if (s[1] - s[0] < 0.3) continue;
          out.push({ side, o, ax, a0: s[0], a1: s[1], cur: s[0], wall: face + sg * (thin ? 0 : off), depth, ry: Math.atan2(o[0], o[1]), door: da !== null, da: da === null ? 0 : da, near: da === null ? 0 : Math.abs((s[0] + s[1]) / 2 - da), thin, fence, wins: thin ? wins : NOWINS }); }
      }
    }
    return out;
  }
  const NOWINS = [];
  // (a round hut fills its lot to its edge on the four sides: what lies about it stands on the ground of the lot's corners,
  // out of its ring and of the stones round its foot — a square a stride across at the most; none where a step is laid)
  function roundSlots(K, S) {
    const sh = S.shell, m = 0.05, out = []; const D = K.body && K.body.door; const da = D ? (D.o[1] !== 0 ? K.body.x : K.body.z) + D.a : 0;
    const treads = (K.steps || []).map(t => [t[0] - K.x0, t[2] - K.z0, t[1] - K.x0, t[3] - K.z0]);
    for (const [side, o, e] of [['S', [0, 1], 0], ['S', [0, 1], 1], ['N', [0, -1], 0], ['N', [0, -1], 1]]) {
      const cx = e ? K.w : 0, cz = o[1] > 0 ? K.d : 0; const a = Math.min(1, (Math.hypot(cx - sh.cx, cz - sh.cz) - sh.r - 0.22) / Math.SQRT2 - m); if (a < 0.3) continue;
      const a0 = e ? K.w - m - a : m, z0 = o[1] > 0 ? K.d - m - a : m; if (treads.some(t => t[2] > a0 - 0.1 && t[0] < a0 + a + 0.1 && t[3] > z0 - 0.1 && t[1] < z0 + a + 0.1)) continue;
      const door = !!D && D.side === side;
      out.push({ side, o, ax: true, a0, a1: a0 + a, cur: a0, wall: o[1] > 0 ? z0 : z0 + a, depth: a - 0.02, ry: Math.atan2(o[0], o[1]), door, da: door ? da : 0, near: door ? Math.abs(a0 + a / 2 - da) : 0, thin: false, fence: false, corner: true, wins: NOWINS });
    }
    return out;
  }
  // (a wall of the shell on a side: along it, its outer face on the side's line, over part of its run — Build3D's own rule)
  function wallOn(w, F) {
    const along = F.ax ? Math.abs(w.b[1] - w.a[1]) < 1e-3 : Math.abs(w.b[0] - w.a[0]) < 1e-3; if (!along) return false;
    const face = (F.ax ? w.a[1] : w.a[0]) + (F.ax ? F.o[1] : F.o[0]) * w.t / 2; if (Math.abs(face - F.line) > 0.03) return false;
    const a = F.ax ? Math.min(w.a[0], w.b[0]) : Math.min(w.a[1], w.b[1]), b = F.ax ? Math.max(w.a[0], w.b[0]) : Math.max(w.a[1], w.b[1]);
    return b > F.u0 + 0.05 && a < F.u1 - 0.05;
  }
  // (in a thin strip: where a piece of l, hgt high, stands clear of the windows it would reach — from the strip's start, or
  // from its end —, or null)
  function fit(s, l, at, hgt) {
    const bad = a => s.wins.some(w => w[2] < hgt && a < w[1] && a + l > w[0]);
    if (at === 'end') { for (let a = s.a1 - l; a >= s.cur - 1e-6; a -= 0.1) if (!bad(a)) return a; }
    else for (let a = s.cur; a + l <= s.a1 + 1e-6; a += 0.1) if (!bad(a)) return a;
    return null;
  }
  // a piece of l along the wall and dp out from it, in a strip: where it goes (its middle on the lot), how it is turned, the
  // ground under it; the strip's room taken. null: no room. (at: 'start', 'end' or a fraction of the strip; hgt: how high it
  // stands, in a thin strip — under a window only what is lower than it)
  function take(K, s, l, dp, at, must, hgt) {
    if (dp > s.depth + 1e-9 || s.a1 - s.cur < l) return null;
    // (the preset's share of the decoration — Realm.Q().props, all of it where the preset has none: each piece kept or left out
    // by the house's id and its turn among the pieces, so the same house always has the same things. What is the world's — must
    // — is never left out)
    if (!must && K.props < 1 && K.hv(2100 + (K.nTake = (K.nTake || 0) + 1)) >= K.props) return null;
    let a;
    if (s.thin) { const a0 = fit(s, l, at, hgt || 0.3); if (a0 === null) return null; a = a0 + l / 2; if (at === 'end') s.a1 = a0 - 0.08; else s.cur = a0 + l + 0.08; }
    else if (at === 'end') { a = s.a1 - l / 2; s.a1 -= l + 0.08; } else if (typeof at === 'number') { a = Math.max(s.cur + l / 2, Math.min(s.a1 - l / 2, s.a0 + (s.a1 - s.a0) * at)); s.cur = a + l / 2 + 0.08; } else { a = s.cur + l / 2; s.cur += l + 0.08; }
    const w = s.wall + (s.o[0] + s.o[1]) * (dp / 2 + (s.thin ? 0.01 : 0.02)); const cx = s.ax ? a : w, cz = s.ax ? w : a;
    // (on a footed house the ground of the yard, its lowest corner; on a plinth its top; in a thin strip the footing's ledge)
    let y = 0; if (s.thin) y = LEDGE; else if (K.footed) { y = 1e9; for (const [p, q] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const X = cx + (s.ax ? p * l / 2 : q * dp / 2), Z = cz + (s.ax ? q * dp / 2 : p * l / 2); y = Math.min(y, K.gy(X, Z)); } y -= 0.03; }
    const f = { cx, cz, ry: s.ry, y, l, dp, s };
    if (rec) rec.push({ b: K.b, x0: cx - (s.ax ? l : dp) / 2, x1: cx + (s.ax ? l : dp) / 2, z0: cz - (s.ax ? dp : l) / 2, z1: cz + (s.ax ? dp : l) / 2, y, ground: K.footed ? K.gy(cx, cz) : 0, footed: K.footed, side: s.side, door: K.body && K.body.door, thin: !!s.thin, fence: !!s.fence, hgt: hgt || 0 });
    return f;
  }
  // (a point of a piece's own frame — lx along the wall, lz out from it, from its middle — on the lot)
  const pt = (f, lx, lz) => [f.cx + lx * Math.cos(f.ry) + lz * Math.sin(f.ry), f.cz - lx * Math.sin(f.ry) + lz * Math.cos(f.ry)];
  // ------------------------------ the pieces ------------------------------
  // firewood: split logs stacked in rows, their pale ends to the street, bark on their sides (len along the wall, dep its
  // depth, hgt how high; ry turns it): also the woodshed's
  P3.woodpile = function (K, x, y, z, len, dep, hgt, ry, thin) {
    const r = 0.085; const nx = Math.max(2, Math.floor(len / (r * 2.1))), ny = Math.max(1, Math.floor(hgt / (r * 1.9)));
    const ca = Math.cos(ry), sa = Math.sin(ry);
    const end = [208, 178, 132], bark = [120, 94, 68]; const seed = K.b.id * 31 + Math.round(x * 7 + z * 13);
    const col = (X, Y, Z, nx2, ny2, nz2) => (Math.abs(nx2 * sa + nz2 * ca) > 0.7 ? end : bark);
    K.as('bark', () => { for (let j = 0; j < ny; j++) for (let i = 0; i < nx - (j % 2); i++) {
      const h1 = G.hash(seed + i * 17 + j * 131), h2 = G.hash(seed + i * 7 + j * 53 + 5);
      const lx = -len / 2 + r * 1.05 + (i + (j % 2) * 0.5) * r * 2.1, ly = y + j * r * 1.85; const lz = thin ? 0 : (h1 - 0.5) * 0.06;
      const X = x + lx * ca + lz * sa, Z = z - lx * sa + lz * ca;
      K.rbox(X, ly, Z, r * (1.6 + h2 * 0.5), r * (1.5 + h1 * 0.4), dep * (0.86 + h2 * 0.14), col, ry, 0, thin ? (h1 - 0.5) * 0.25 : (h1 - 0.5) * 0.9);
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
  // (what the world says the building has about it: G.Atmos.about — nothing where there is no world to ask)
  const NOTHING = { res: 0, roles: [], wood: false, cask: 0, bench: false, wash: 0, pots: 0, casks: 0, baskets: 0, nets: 0, rope: 0 };
  const aboutOf = K => (G.Atmos && G.Atmos.about ? G.Atmos.about(K.b) : NOTHING);
  P3.aboutOf = aboutOf;
  // (for the proofs: the piece just put is this thing)
  const tag = (n0, thing) => { if (rec && rec.length > n0) rec[n0].thing = thing; };
  function home(K, S0) {
    const h = k => K.hv(900 + k); const A = aboutOf(K); const S = S0.filter(q => !q.thin), T = S0.filter(q => q.thin);
    // the firewood under the eaves of the house a woodcutter lives in, the block beside it (a house keeps no wood of its own)
    let wood = false;
    if (A.wood) { const n0 = rec ? rec.length : 0; const s = pick(S, 0, q => q.depth >= 0.36); if (s) { const l = Math.min(s.a1 - s.cur, 0.9 + h(2) * 1.1); const f = take(K, s, l, Math.min(0.42, s.depth - 0.02), h(3) < 0.5 ? 'start' : 'end', true);
      if (f) { wood = true; P3.woodpile(K, f.cx, f.y, f.cz, l, f.dp, 0.5 + h(4) * 0.5, f.ry + Math.PI / 2 * 0); tag(n0, 'lenha'); const g = take(K, s, 0.5, Math.min(0.45, s.depth), 'start', true) || take(K, s, 0.5, Math.min(0.45, s.depth), undefined, true); if (g) block(K, g); } }
      if (!wood) { wood = rick(K, T, h); if (wood) tag(n0, 'lenha'); } }
    // a cask by the door for a drink or an oil the house keeps, a bench against the wall of a house someone lives in
    const ds = S.filter(q => q.door).sort((a, b) => a.near - b.near); let cask = false, seat = false;
    if (A.cask) { const n0 = rec ? rec.length : 0;
      if (ds.length) { const s = ds[0]; const dp = Math.min(0.52, s.depth); if (dp >= 0.34) { const f = take(K, s, Math.max(dp, Math.min(dp + 0.06, s.a1 - s.cur)), dp, s.a1 <= s.da ? 'end' : 'start', true); if (f) { cask = true; barrel(K, f.cx, f.y, f.cz, dp / 2 - 0.02, 0.62 + dp * 0.12, h(7) < 0.5 ? [112, 80, 50] : [130, 96, 60]); } } }
      if (!cask) cask = flasks(K, T, A.cask, h); if (cask) tag(n0, 'barril'); }
    if (A.bench && (ds.length > 1 || (ds.length && h(8) < 0.5))) { const n0 = rec ? rec.length : 0; const s = ds[ds.length - 1]; const f = take(K, s, 1.1, Math.min(0.36, s.depth)); if (f && f.dp >= 0.3) { seat = true; bench(K, f); tag(n0, 'banco'); } }
    // what the trade of the people who live there leaves about the house (the world's own: who has this house for home), and
    // the washing on its line — as many cloths as the house has people to wash for — at the houses that hang it out (the id)
    let trade = false;
    // (in a yard, the first of its trades that has room; on the walls of a house with a hand of room, two of them: each wall
    // has a span for one, and a house of a fisher and a hunter is told as both)
    let nt = 0; const seen = new Set();
    for (const [r, fn, thin] of TRADE) { if (!A.roles.includes(r) || seen.has(fn)) continue; const n0 = rec ? rec.length : 0; const got = (!nt && !!fn(K, S)) || !!thin(K, T); tag(n0, r); if (got) { trade = true; seen.add(fn); if (++nt >= (T.length ? 2 : 1)) break; } }
    let wash = false;
    if (A.wash && h(12) < 0.4) { const n0 = rec ? rec.length : 0; wash = !!washing(K, S, A.wash) || !!line(K, T, A.wash); tag(n0, 'varal'); }
    // (a house someone lives in, with only a hand of room at its walls: by its door its broom, its washing tub on a peg or a
    // braid of onions — which, by the house's id; where its windows leave no wall for them, a basket on the ledge —: a lived
    // house is told from an empty one)
    if (A.bench && !seat && T.length) { const k = Math.floor(h(9) * 3) % 3;
      for (const [fn, name] of [LIVED[k], LIVED[(k + 1) % 3], LIVED[(k + 2) % 3], [hamper, 'cesto']]) { const n0 = rec ? rec.length : 0; if (fn(K, T)) { tag(n0, name); break; } } }
    // (and the round hut someone lives in, with nothing else in its corners: a basket by its door)
    if (A.bench && !(wood || cask || seat || trade || wash)) { const s = ds.concat(S).find(q => q.corner && q.a1 - q.cur >= 0.34); const n0 = rec ? rec.length : 0; const f = s ? take(K, s, 0.34, 0.34, s.a1 <= s.da ? 'end' : 'start') : null;
      if (f) { K.as('thatch', () => K.cyl(f.cx, f.y, f.cz, 0.16, 0.2, [168, 132, 76])); const fr = [[196, 64, 48], [226, 168, 58], [118, 160, 64]][Math.floor(K.hv(1830) * 3)]; for (let q = 0; q < 3; q++) K.sph(f.cx + Math.cos(q * 2.1) * 0.06, f.y + 0.22, f.cz + Math.sin(q * 2.1) * 0.06, 0.06, fr); tag(n0, 'cesto'); } }
  }
  // (a pole from a to b: a stake, a shaft)
  const pole = (K, a, b, r, col) => K.as('beam', () => K.log(a, b, r, col));
  // (where the wall's face is in a piece's frame, out from its middle: the strip starts clear of the footing's stones; a thin
  // one at the wall itself, one along a fence a finger from it)
  const wallZ = (K, f) => (f.s && f.s.thin ? -(f.dp / 2 + 0.01) : -(f.dp / 2 + 0.02 + (f.s && (f.s.fence || f.s.corner) ? 0.03 : K.footed ? 0.2 : 0.02)));
  // ------------------------------ what is thin: on the footing's ledge, on the wall ------------------------------
  // (D-186: a house of a town's centre fills its lot but for a hand or two; what it has is told there all the same — the
  // wood split small and stacked one billet deep, flasks for the casks, things hung on the wall. Each is its strip deep
  // at the most; lz out from the piece's middle, the wall at wallZ. The wood, the flasks and the things of a trade are the
  // world's — who lives there —: never left out for the preset's sake; the washing and the house's own small things are)
  const outOf = f => [Math.sin(f.ry), 0, Math.cos(f.ry)];
  // (the strips in the order a thing takes them: by the door first or last, the roomier first)
  const byDoor = T => T.filter(q => q.door).sort((a, b) => a.near - b.near).concat(T.filter(q => !q.door).sort((a, b) => (b.a1 - b.cur) - (a.a1 - a.cur)));
  const away = T => T.slice().sort((a, b) => (a.door - b.door) || (b.a1 - b.cur) - (a.a1 - a.cur));
  // (a peg in the wall, at lx along and y up: its head a hand out)
  const peg = (K, f, lx, y, out) => K.as('beam', () => K.rbox(...xyz(f, lx, y - 0.02, wallZ(K, f) + (out || 0.07) / 2), 0.035, 0.035, out || 0.07, [96, 74, 52], f.ry));
  // the woodcutter's wood: billets stacked one deep, their ends to the street; where the wall is free above it, his axe on its pegs
  function rick(K, T, h) {
    const full = 0.5 + h(4) * 0.4;
    for (const [hgt, axe] of [[full, true], [full, false], [0.34, false]]) for (const s of away(T)) {
      const l = Math.min(s.a1 - s.cur, 0.9 + h(2) * 0.9); if (l < 0.6) continue; const f = take(K, s, l, s.depth, h(3) < 0.5 ? 'start' : 'end', true, axe ? hgt + 0.55 : hgt); if (!f) continue;
      P3.woodpile(K, f.cx, f.y, f.cz, l, f.dp, hgt, f.ry, true);
      if (axe) { const wz = wallZ(K, f) + 0.035, y = hgt + 0.3; peg(K, f, -0.12, y, 0.08); peg(K, f, 0.14, y, 0.08);
        K.as('jamb', () => K.bar(xyz(f, -0.32, y + 0.02, wz), xyz(f, 0.3, y + 0.02, wz), [0, 0.035, 0], [Math.sin(f.ry) * 0.03, 0, Math.cos(f.ry) * 0.03], [130, 100, 64]));
        K.as('iron', () => K.rbox(...xyz(f, 0.3, y - 0.1, wz), 0.07, 0.19, 0.03, '#3a3836', f.ry)); }
      return true; }
    return false;
  }
  // a flask a drink or an oil the house keeps, by the door: a lentil of clay with its neck, stopped (the north's, of leather)
  function flasks(K, T, n, h) {
    const R3 = G.Realm; n = G.clamp(n, 1, 3);
    for (const s of byDoor(T)) { const f = take(K, s, n * 0.3 + 0.04, s.depth, s.door && s.a1 <= s.da ? 'end' : 'start', true, 0.34); if (!f) continue;
      for (let q = 0; q < n; q++) { const k = K.hv(1900 + q); const p = xyz(f, (q - (n - 1) / 2) * 0.3, 0, 0); const col = K.st === 'nordico' ? mix([104, 76, 52], [128, 96, 64], k) : mix([176, 110, 72], [150, 96, 66], k); const sy = 0.24 + k * 0.05;
        K.as(K.st === 'nordico' ? 'leather' : 'mud', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + p[0], K.y0 + p[1] + sy / 2, K.z0 + p[2], f.ry, 0.24, sy, f.dp * 0.96), K.c(col)));
        K.cyl(p[0], p[1] + sy - 0.02, p[2], 0.03, 0.08, dim(col, 0.88)); K.cyl(p[0], p[1] + sy + 0.06, p[2], 0.036, 0.015, [92, 70, 48]); }
      return true; }
    return false;
  }
  // the broom of a house someone lives in, standing on its twigs by the door
  function broom(K, T) {
    for (const s of byDoor(T)) { const dp = Math.min(s.depth, 0.12); const f = take(K, s, 0.3, dp, s.door && s.a1 <= s.da ? 'end' : 'start', false, 1.5); if (!f) continue;
      const wz = wallZ(K, f); const foot = xyz(f, -0.03, 0.2, dp / 2 - 0.04), head = xyz(f, 0.04, 1.42, wz + 0.03);
      K.as('jamb', () => K.bar(foot, head, [Math.cos(f.ry) * 0.03, 0, -Math.sin(f.ry) * 0.03], [Math.sin(f.ry) * 0.03, 0, Math.cos(f.ry) * 0.03], [140, 112, 78]));
      K.as('thatch', () => { K.rbox(...xyz(f, -0.03, 0, dp / 2 - 0.04), 0.2, 0.3, Math.min(0.07, dp - 0.01), [170, 142, 88], f.ry); K.rbox(...xyz(f, -0.03, 0.27, dp / 2 - 0.04), 0.1, 0.06, Math.min(0.06, dp - 0.01), [120, 96, 62], f.ry); });
      return true; }
    return false;
  }
  // the washing tub of the house, hung on its peg by the door: its boards, its hoop, the dark of its hollow
  function tub(K, T) {
    for (const s of byDoor(T)) { const dp = Math.min(s.depth, 0.09); const f = take(K, s, 0.62, dp, s.door && s.a1 <= s.da ? 'end' : 'start', false, 1.5); if (!f) continue;
      const wz = wallZ(K, f), y = 0.98, r = 0.27; peg(K, f, 0, y + r - 0.03, dp);
      K.as('plankV', () => K.log(xyz(f, 0, y, wz + 0.005), xyz(f, 0, y, wz + dp - 0.012), r, [132, 100, 66]));
      K.as('iron', () => K.log(xyz(f, 0, y, wz + dp * 0.45), xyz(f, 0, y, wz + dp * 0.45 + 0.02), r + 0.008, '#3c3a36'));
      K.log(xyz(f, 0, y, wz + dp - 0.014), xyz(f, 0, y, wz + dp - 0.004), r - 0.035, [70, 54, 38]);
      return true; }
    return false;
  }
  // a braid of onions and garlic hung to dry by the door (in the lands of the maize, of red peppers)
  function braid(K, T) {
    const R3 = G.Realm;
    for (const s of byDoor(T)) { const dp = Math.min(s.depth, 0.09); const f = take(K, s, 0.26, dp, s.door && s.a1 <= s.da ? 'end' : 'start', false, 1.65); if (!f) continue;
      const wz = wallZ(K, f) + dp / 2, top = 1.56; peg(K, f, 0, top, dp);
      K.as('rope', () => K.log(xyz(f, 0, top, wz), xyz(f, 0, top - 0.62, wz), 0.008, [176, 152, 108]));
      for (let q = 0; q < 8; q++) { const k = K.hv(1810 + q); const p = xyz(f, (q % 2 ? 0.04 : -0.04) + (k - 0.5) * 0.02, top - 0.1 - q * 0.07, wz);
        const col = K.st === 'asteca' ? mix([176, 48, 40], [150, 36, 30], k) : k < 0.3 ? [226, 220, 200] : mix([198, 150, 92], [176, 120, 70], k);
        K.g.put(R3.SH.ico0, R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], q * 1.7, 0.095, K.st === 'asteca' ? 0.13 : 0.095, Math.min(0.08, dp - 0.01)), K.c(col)); }
      return true; }
    return false;
  }
  // a basket of the house on the ledge by its door, flat against the wall: low enough to stand under a window
  function hamper(K, T) {
    const R3 = G.Realm;
    for (const s of byDoor(T)) { const dp = Math.min(s.depth, 0.12); const f = take(K, s, 0.4, dp, s.door && s.a1 <= s.da ? 'end' : 'start', false, 0.32); if (!f) continue;
      const p = xyz(f, 0, 0, 0); K.as('wicker', () => { K.g.put(R3.SH.sph, R3.mat(K.x0 + p[0], K.y0 + p[1] + 0.1, K.z0 + p[2], f.ry, 0.36, 0.3, dp * 0.94), K.c([168, 132, 76])); K.rbox(p[0], p[1] + 0.2, p[2], 0.34, 0.035, dp * 0.9, [140, 108, 62], f.ry); });
      const fr = [[196, 64, 48], [226, 168, 58], [118, 160, 64]][Math.floor(K.hv(1830) * 3)]; for (let q = 0; q < 3; q++) { const c = xyz(f, -0.09 + q * 0.09, 0.245, 0); K.g.put(R3.SH.ico0, R3.mat(K.x0 + c[0], K.y0 + c[1], K.z0 + c[2], q, 0.09, 0.08, Math.min(0.08, dp * 0.8)), K.c(fr)); }
      return true; }
    return false;
  }
  const LIVED = [[broom, 'vassoura'], [tub, 'tina'], [braid, 'restia']];
  // the washing of a house with a hand of room: a line along the wall on two pegs, the cloths flat against it
  function line(K, T, cloths) {
    const CL = [[228, 220, 196], [214, 206, 180], [168, 72, 56], [70, 96, 140], [122, 106, 86], [196, 170, 110]];
    for (const l of [2.2, 1.6, 1.1, 0.8]) for (const s of away(T)) { const dp = Math.min(s.depth, 0.1); const f = take(K, s, l, dp, 'end', false, 2.0); if (!f) continue;
      const y = 1.82, e = l / 2 - 0.05; peg(K, f, -e, y, dp); peg(K, f, e, y, dp);
      const A = xyz(f, -e, y, 0.01), B = xyz(f, e, y, 0.01), M = xyz(f, 0, y - 0.06, 0.01);
      K.as('rope', () => { K.log(A, M, 0.01, [190, 176, 140]); K.log(M, B, 0.01, [190, 176, 140]); });
      const n = Math.min(G.clamp(cloths || 2, 1, 4), Math.floor((l - 0.2) / 0.42));
      for (let q = 0; q < n; q++) { const t = (q + 0.5) / n; const w = 0.3 + K.hv(1721 + q) * 0.1, hgt = 0.42 + K.hv(1731 + q) * 0.3; const p = xyz(f, -e + 0.1 + (2 * e - 0.2) * t, 0, 0.012);
        const yy = y - 0.06 * (1 - Math.pow(2 * t - 1, 2)) - 0.01; const col = CL[Math.floor(K.hv(1741 + q) * CL.length)];
        K.as(K.hv(1751 + q) < 0.5 ? 'linen' : 'wool', () => K.rbox(p[0], yy - hgt, p[2], w, hgt, 0.015, col, f.ry)); }
      return true; }
    return false;
  }
  // the fisher's net hung on two pegs, its floats at its foot, an oar upright beside it
  function netsFlat(K, T) {
    for (const oar of [true, false]) for (const s of away(T)) { const dp = Math.min(s.depth, 0.1); const f = take(K, s, oar ? 1.5 : 0.96, dp, undefined, true, 1.95); if (!f) continue;
      const wz = wallZ(K, f), top = 1.62, x0 = oar ? -0.68 : -0.42, nw = oar ? 1.1 : 0.84; peg(K, f, x0, top, 0.07); peg(K, f, x0 + nw, top, 0.07);
      const nu = 6, nv = 2, P = []; for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const t = i / nu, d = j / nv; const p = xyz(f, x0 + nw * t, top - 0.03 - Math.sin(t * Math.PI) * 0.07 * (1 - d) - d * (0.95 + 0.2 * t - Math.sin(t * Math.PI * 2) * 0.06), wz + 0.035 + Math.sin(t * Math.PI * 3) * 0.012 * d); P.push(p); }
      K.as('wicker', () => K.sheet(P, nu, nv, [112, 108, 92], outOf(f)));
      const R3 = G.Realm; for (let q = 0; q < 4; q++) { const k = P[nv * (nu + 1) + 1 + q]; K.g.put(R3.SH.ico0, R3.mat(K.x0 + k[0], K.y0 + k[1] - 0.03, K.z0 + k[2], q, 0.07, 0.07, 0.05), K.c([188, 160, 112])); }
      if (!oar) return true; const a = xyz(f, 0.62, 0.02, wz + 0.04), e = xyz(f, 0.62, 1.86, wz + 0.04);
      K.as('jamb', () => { K.bar(a, e, [Math.cos(f.ry) * 0.045, 0, -Math.sin(f.ry) * 0.045], [Math.sin(f.ry) * 0.035, 0, Math.cos(f.ry) * 0.035], [150, 120, 86]);
        K.bar(xyz(f, 0.62, 1.4, wz + 0.035), xyz(f, 0.62, 1.86, wz + 0.035), [Math.cos(f.ry) * 0.14, 0, -Math.sin(f.ry) * 0.14], [Math.sin(f.ry) * 0.02, 0, Math.cos(f.ry) * 0.02], [150, 120, 86]); });
      return true; }
    return false;
  }
  // the hunter's hide pegged out flat on the wall to dry
  function hideFlat(K, T) {
    for (const s of away(T)) { const dp = Math.min(s.depth, 0.08); const f = take(K, s, 1.02, dp, undefined, true, 1.7); if (!f) continue;
      const wz = wallZ(K, f) + 0.03; const P = []; const W = [0.44, 0.38, 0.46], Y = [1.5, 1.02, 0.55];
      for (let j = 0; j <= 2; j++) for (let i = 0; i <= 2; i++) P.push(xyz(f, (i - 1) * W[j] + (K.hv(1770 + j) - 0.5) * 0.04, Y[j] + (i === 1 ? (j === 0 ? 0.06 : j === 2 ? -0.07 : 0) : 0), wz));
      K.as('leather', () => K.sheet(P, 2, 2, [150, 118, 84], outOf(f)));
      for (const [lx, y] of [[-0.46, 1.52], [0.46, 1.52], [-0.48, 0.53], [0.48, 0.53]]) peg(K, f, lx, y, 0.06);
      return true; }
    return false;
  }
  // the warrior's round shield on the wall, painted in the house's colours, his spear upright beside it
  function armsFlat(K, T) {
    for (const spear of [true, false]) for (const s of byDoor(T)) { const dp = Math.min(s.depth, 0.1); const f = take(K, s, spear ? 0.95 : 0.76, dp, s.door && s.a1 <= s.da ? 'end' : 'start', true, spear ? 1.95 : 1.62); if (!f) continue;
      const P = K.P; const col = [P.trim || '#a23c2a', P.acc || '#d8b25a', '#3f6fb0', '#e8e0c8'][Math.floor(K.hv(1700) * 4)]; const wz = wallZ(K, f); const w = xyz(f, spear ? -0.1 : 0, 1.22, wz + 0.005), o = outOf(f);
      const R3 = G.Realm; const th = Math.min(0.09, dp * 1.6);
      K.as('plankV', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + w[0], K.y0 + w[1], K.z0 + w[2], f.ry, 0.72, 0.72, th), K.c(col)));
      K.as('iron', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + w[0] + o[0] * th * 0.45, K.y0 + w[1], K.z0 + w[2] + o[2] * th * 0.45, f.ry, 0.16, 0.16, 0.05), K.c('#6a6660')));
      if (!spear) return true; const a = xyz(f, 0.38, 0.02, wz + 0.035), e = xyz(f, 0.38, 1.7, wz + 0.035);
      K.as('jamb', () => K.bar(a, e, [Math.cos(f.ry) * 0.03, 0, -Math.sin(f.ry) * 0.03], [Math.sin(f.ry) * 0.03, 0, Math.cos(f.ry) * 0.03], [128, 100, 70]));
      K.as('iron', () => K.bar(e, xyz(f, 0.38, 1.92, wz + 0.035), [Math.cos(f.ry) * 0.06, 0, -Math.sin(f.ry) * 0.06], [Math.sin(f.ry) * 0.015, 0, Math.cos(f.ry) * 0.015], '#5a5652'));
      return true; }
    return false;
  }
  // the weaver's skeins of dyed yarn hung from a rail to dry
  function yarn(K, T) {
    const DYE = [[176, 70, 52], [70, 96, 140], [196, 170, 110], [122, 106, 86], [84, 120, 76]];
    for (const n of [5, 3]) for (const s of away(T)) { const dp = Math.min(s.depth, 0.09); const e = n * 0.1; const f = take(K, s, 2 * e + 0.1, dp, undefined, true, 1.7); if (!f) continue;
      const wz = wallZ(K, f), y = 1.52; peg(K, f, -e, y, dp); peg(K, f, e, y, dp);
      K.as('beam', () => K.log(xyz(f, -e - 0.02, y, wz + dp - 0.02), xyz(f, e + 0.02, y, wz + dp - 0.02), 0.014, [110, 86, 60]));
      const R3 = G.Realm; for (let q = 0; q < n; q++) { const p = xyz(f, (q - (n - 1) / 2) * 0.2, y - 0.24 - K.hv(1790 + q) * 0.05, wz + dp - 0.03);
        K.as('wool', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], f.ry, 0.12, 0.42, Math.min(0.06, dp - 0.02)), K.c(DYE[Math.floor(K.hv(1780 + q) * DYE.length)]))); }
      return true; }
    return false;
  }
  // a hay fork and a rake upright against the wall, a flat basket on its peg
  function toolsFlat(K, T) {
    for (const bk of [true, false]) for (const s of away(T)) { const dp = Math.min(s.depth, 0.09); const f = take(K, s, bk ? 0.95 : 0.6, dp, undefined, true, 1.85); if (!f) continue;
      const wz = wallZ(K, f) + 0.035; const x0 = bk ? 0 : 0.12; const u = [Math.cos(f.ry), 0, -Math.sin(f.ry)], o = outOf(f); const sc = (v, k) => [v[0] * k, v[1] * k, v[2] * k];
      K.as('jamb', () => { K.bar(xyz(f, x0 - 0.3, 0.3, wz), xyz(f, x0 - 0.3, 1.72, wz), sc(u, 0.032), sc(o, 0.032), [140, 112, 78]); K.bar(xyz(f, x0 - 0.02, 0.02, wz), xyz(f, x0 - 0.02, 1.68, wz), sc(u, 0.032), sc(o, 0.032), [140, 112, 78]);
        K.bar(xyz(f, x0 - 0.2, 1.7, wz), xyz(f, x0 + 0.16, 1.7, wz), [0, 0.05, 0], sc(o, 0.035), [140, 112, 78]); });
      K.as('iron', () => { for (const t of [-0.06, 0, 0.06]) K.bar(xyz(f, x0 - 0.3 + t, 0.02, wz), xyz(f, x0 - 0.3 + t, 0.32, wz), sc(u, 0.012), sc(o, 0.012), '#4a4844'); });
      if (!bk) return true; const R3 = G.Realm; const p = xyz(f, 0.3, 1.05, wz); peg(K, f, 0.3, 1.24, 0.06);
      K.as('wicker', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + p[0], K.y0 + p[1], K.z0 + p[2], f.ry, 0.36, 0.36, Math.min(0.06, dp - 0.02)), K.c([168, 132, 76])));
      return true; }
    return false;
  }
  // nets hung to dry on a rack of two posts and a rail, floats along their foot; two oars leaning on the wall
  function nets(K, S) {
    const s = pick(S, 0, q => q.depth >= 0.42 && q.a1 - q.cur >= 1.7); if (!s) return false; const f = take(K, s, 1.7, Math.min(0.5, s.depth)); if (!f) return false;
    const A = xyz(f, -0.75, 0, 0.05), B = xyz(f, 0.75, 0, 0.05); const yA = gyAt(K, A[0], A[2], 0.05), yB = gyAt(K, B[0], B[2], 0.05);
    pole(K, [A[0], yA - 0.15, A[2]], [A[0], yA + 1.62, A[2]], 0.04, [104, 80, 56]); pole(K, [B[0], yB - 0.15, B[2]], [B[0], yB + 1.62, B[2]], 0.04, [104, 80, 56]);
    const top = Math.max(yA, yB) + 1.58; pole(K, [A[0], top, A[2]], [B[0], top, B[2]], 0.03, [110, 86, 60]);
    // (the net: a sheet hanging from the rail in folds, a little longer at one end)
    const nu = 6, nv = 2, P = []; for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const t = i / nu, d = j / nv; const lx = -0.72 + 1.44 * t; const p = xyz(f, lx, 0, 0.05 + Math.sin(t * Math.PI * 3) * 0.05 * d);
      P.push([p[0], top - 0.03 - d * (1.05 + 0.25 * t) , p[2]]); }
    K.as('wicker', () => K.sheet(P, nu, nv, [86, 82, 70], [Math.sin(f.ry), 0, Math.cos(f.ry)]));
    const R3 = G.Realm; for (let q = 0; q < 4; q++) { const k = P[nv * (nu + 1) + 1 + q]; K.g.put(R3.SH.ico0, R3.mat(K.x0 + k[0], K.y0 + k[1] - 0.03, K.z0 + k[2], q, 0.07, 0.07, 0.07), K.c([188, 160, 112])); }
    // (the oars, beside the rack, against the wall)
    const o = pick(S, 0, q => q.depth >= 0.3 && q.a1 - q.cur >= 0.5); if (!o) return true; const g = take(K, o, 0.5, 0.3); if (!g) return true;
    for (const e of [-0.1, 0.12]) { const foot = xyz(g, e, 0, 0.12), head = xyz(g, e + 0.08, 0, wallZ(K, g) + 0.04); const y = gyAt(K, foot[0], foot[2], 0.05);
      K.as('jamb', () => { K.bar([foot[0], y + 0.02, foot[2]], [head[0], y + 2.3, head[2]], [0, 0, 0.045], [0.045, 0, 0], [150, 120, 86]); K.bar([foot[0], y + 0.02, foot[2]], [foot[0] + (head[0] - foot[0]) * 0.22, y + 0.52, foot[2] + (head[2] - foot[2]) * 0.22], [0, 0, 0.13], [0.02, 0, 0], [150, 120, 86]); }); }
    return true;
  }
  // a hide stretched on a frame of poles, leaning on the wall
  function hide(K, S) {
    const s = pick(S, 0, q => q.depth >= 0.42 && q.a1 - q.cur >= 1.3); if (!s) return false; const f = take(K, s, 1.3, Math.min(0.5, s.depth)); if (!f) return false;
    const y = gyAt(K, f.cx, f.cz, 0.5); const lo = (lx) => xyz(f, lx, 0, 0.2), hi = (lx) => xyz(f, lx, 0, wallZ(K, f) + 0.05);
    const c = [112, 88, 60]; const a = lo(-0.6), b = lo(0.6), c2 = hi(-0.6), d = hi(0.6);
    pole(K, [a[0], y, a[2]], [c2[0], y + 1.5, c2[2]], 0.035, c); pole(K, [b[0], y, b[2]], [d[0], y + 1.5, d[2]], 0.035, c);
    pole(K, [a[0] * 0.8 + c2[0] * 0.2, y + 0.3, a[2] * 0.8 + c2[2] * 0.2], [b[0] * 0.8 + d[0] * 0.2, y + 0.3, b[2] * 0.8 + d[2] * 0.2], 0.03, c);
    pole(K, [a[0] * 0.15 + c2[0] * 0.85, y + 1.28, a[2] * 0.15 + c2[2] * 0.85], [b[0] * 0.15 + d[0] * 0.85, y + 1.28, b[2] * 0.15 + d[2] * 0.85], 0.03, c);
    const P = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= 2; i++) { const t = i / 2, u = j ? 0.82 : 0.24; const A = [a[0] + (c2[0] - a[0]) * u, y + 1.5 * u, a[2] + (c2[2] - a[2]) * u], B = [b[0] + (d[0] - b[0]) * u, y + 1.5 * u, b[2] + (d[2] - b[2]) * u];
      const w = 0.12 + Math.sin(t * Math.PI) * 0.04; P.push([A[0] + (B[0] - A[0]) * (0.08 + t * 0.84) + Math.sin(f.ry) * w * 0.1, A[1] + (j ? -0.02 : 0.03) * Math.sin(t * Math.PI), A[2] + (B[2] - A[2]) * (0.08 + t * 0.84) + Math.cos(f.ry) * w * 0.1]); }
    K.as('leather', () => K.sheet(P, 2, 1, [150, 118, 84], [Math.sin(f.ry), 0.5, Math.cos(f.ry)]));
    return true;
  }
  // a round shield on the wall by the door, painted in the house's colours, a spear leaning beside it
  function arms(K, S) {
    const ds = S.filter(q => q.door && q.depth >= 0.25).sort((a, b) => a.near - b.near); const s = ds[0]; if (!s) return false; const f = take(K, s, 0.62, 0.25, s.a1 <= s.da ? 'end' : 'start'); if (!f) return false;
    const P = K.P; const col = [P.trim || '#a23c2a', P.acc || '#d8b25a', '#3f6fb0', '#e8e0c8'][Math.floor(K.hv(1700) * 4)]; const wz = wallZ(K, f); const w = xyz(f, 0, 0, wz + 0.005), y = gyAt(K, w[0], w[2], 0.1);
    const out = [Math.sin(f.ry), 0, Math.cos(f.ry)]; const top = 1.25; // (on the wall, a little over the floor's height)
    // (the shield: a shallow dome of boards against the wall — a sphere flattened through the wall — its iron boss in the middle)
    const R3 = G.Realm; K.as('plankV', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + w[0], K.y0 + top, K.z0 + w[2], f.ry, 0.78, 0.78, 0.09), K.c(col)));
    K.as('iron', () => K.g.put(R3.SH.sph, R3.mat(K.x0 + w[0] + out[0] * 0.045, K.y0 + top, K.z0 + w[2] + out[2] * 0.045, f.ry, 0.16, 0.16, 0.08), K.c('#6a6660')));
    const sp = xyz(f, 0.24, 0, 0.06), sh = xyz(f, 0.3, 0, wz + 0.05); K.as('jamb', () => K.bar([sp[0], y, sp[2]], [sh[0], y + 2.2, sh[2]], [0, 0, 0.035], [0.035, 0, 0], [128, 100, 70]));
    K.as('iron', () => K.bar([sh[0], y + 2.18, sh[2]], [sh[0] + (sh[0] - sp[0]) * 0.12, y + 2.46, sh[2] + (sh[2] - sp[2]) * 0.12], [0, 0, 0.06], [0.015, 0, 0], '#5a5652'));
    return true;
  }
  // a warp-weighted loom leaning on the wall: two uprights, the beam, the cloth half woven, the stone weights at its foot
  function loom(K, S) {
    const s = pick(S, 0, q => q.depth >= 0.45 && q.a1 - q.cur >= 1.4); if (!s) return false; const f = take(K, s, 1.4, Math.min(0.55, s.depth)); if (!f) return false;
    const y = gyAt(K, f.cx, f.cz, 0.5); const ft = lx => xyz(f, lx, 0, 0.18), hd = lx => xyz(f, lx, 0, wallZ(K, f) + 0.07);
    for (const e of [-0.6, 0.6]) { const a = ft(e), b = hd(e); pole(K, [a[0], y, a[2]], [b[0], y + 1.85, b[2]], 0.04, [118, 92, 64]); }
    const t0 = hd(-0.66), t1 = hd(0.66); pole(K, [t0[0], y + 1.72, t0[2]], [t1[0], y + 1.72, t1[2]], 0.045, [118, 92, 64]);
    const P = []; for (let j = 0; j <= 1; j++) for (let i = 0; i <= 1; i++) { const u = j ? 0.92 : 0.35; const a = ft(-0.52 + i * 1.04), b = hd(-0.52 + i * 1.04); P.push([a[0] + (b[0] - a[0]) * u + Math.sin(f.ry) * 0.03, y + 1.85 * u - 0.1, a[2] + (b[2] - a[2]) * u + Math.cos(f.ry) * 0.03]); }
    const cl = [[176, 70, 52], [70, 96, 140], [196, 170, 110], [122, 106, 86]][Math.floor(K.hv(1710) * 4)];
    K.as('wool', () => K.sheet(P, 1, 1, cl, [Math.sin(f.ry), 0.5, Math.cos(f.ry)]));
    const R3 = G.Realm; for (let q = 0; q < 6; q++) { const a = ft(-0.45 + q * 0.18); K.g.put(R3.SH.ico0, R3.mat(K.x0 + a[0] - Math.sin(f.ry) * 0.04, K.y0 + y + 0.42, K.z0 + a[2] - Math.cos(f.ry) * 0.04, q, 0.11, 0.1, 0.06), K.c([128, 120, 108])); }
    return true;
  }
  // a hay fork and a rake against the wall, a basket at their feet
  function tools(K, S) {
    const s = pick(S, 0, q => q.depth >= 0.3 && q.a1 - q.cur >= 0.8); if (!s) return false; const f = take(K, s, 0.8, 0.3); if (!f) return false;
    for (const [e, kind] of [[-0.22, 0], [0.08, 1]]) { const a = xyz(f, e, 0, 0.12), b = xyz(f, e + 0.06, 0, wallZ(K, f) + 0.04); const y = gyAt(K, a[0], a[2], 0.05);
      K.as('jamb', () => K.bar([a[0], y + (kind ? 0.02 : 0.3), a[2]], [b[0], y + 1.75, b[2]], [0, 0, 0.035], [0.035, 0, 0], [140, 112, 78]));
      if (!kind) K.as('iron', () => { for (const t of [-0.05, 0, 0.05]) { const p = xyz(f, e + t, 0, 0.13); K.bar([p[0], y + 0.02, p[2]], [p[0], y + 0.32, p[2]], [0.012, 0, 0], [0, 0, 0.012], '#4a4844'); } });
      else K.as('jamb', () => { const p = xyz(f, e + 0.065, 0, wallZ(K, f) + 0.06); K.bar([p[0] - 0.2, y + 1.74, p[2]], [p[0] + 0.2, y + 1.74, p[2]], [0, 0.05, 0], [0, 0, 0.04], [140, 112, 78]); }); }
    const p = xyz(f, 0.3, 0, 0.02); K.as('wicker', () => K.cyl(p[0], gyAt(K, p[0], p[2], 0.2), p[2], 0.2, 0.28, [168, 132, 76]));
    return true;
  }
  // (each trade: what it leaves in a yard, and what it hangs on the wall of a house with only a hand of room)
  const TRADE = [['pescador', nets, netsFlat], ['cacador', hide, hideFlat], ['guerreiro', arms, armsFlat], ['arqueiro', arms, armsFlat], ['tecelao', loom, yarn], ['agricultor', tools, toolsFlat], ['coletor', tools, toolsFlat], ['vinhateiro', tools, toolsFlat]];
  // the washing: a line between two posts along a wall, cloths hanging on it — linen, a dyed wool — the people's colours
  function washing(K, S, cloths) {
    const s = pick(S, 0, q => !q.door && q.depth >= 0.42 && q.a1 - q.cur >= 2.0); if (!s) return false; const l = Math.min(3.2, s.a1 - s.cur); const f = take(K, s, l, Math.min(0.5, s.depth), 'end'); if (!f) return false;
    const A = xyz(f, -l / 2 + 0.08, 0, 0.08), B = xyz(f, l / 2 - 0.08, 0, 0.08); const yA = gyAt(K, A[0], A[2], 0.05), yB = gyAt(K, B[0], B[2], 0.05);
    pole(K, [A[0], yA - 0.1, A[2]], [A[0], yA + 1.75, A[2]], 0.035, [110, 86, 60]); pole(K, [B[0], yB - 0.1, B[2]], [B[0], yB + 1.75, B[2]], 0.035, [110, 86, 60]);
    const ty = (yA + yB) / 2 + 1.7, sag = 0.12; const M = [(A[0] + B[0]) / 2, ty - sag, (A[2] + B[2]) / 2];
    K.as('rope', () => { K.log([A[0], yA + 1.7, A[2]], M, 0.01, [190, 176, 140]); K.log(M, [B[0], yB + 1.7, B[2]], 0.01, [190, 176, 140]); });
    const CL = [[228, 220, 196], [214, 206, 180], [168, 72, 56], [70, 96, 140], [122, 106, 86], [196, 170, 110]]; const n = G.clamp(cloths || 2, 1, 4);
    for (let q = 0; q < n; q++) { const t = (q + 0.5) / n; const w = 0.35 + K.hv(1721 + q) * 0.3, hgt = 0.45 + K.hv(1731 + q) * 0.35; const p = xyz(f, -l / 2 + 0.2 + (l - 0.4) * t, 0, 0.08);
      const y = ty - sag * (1 - Math.pow(2 * t - 1, 2)) - 0.02; const col = CL[Math.floor(K.hv(1741 + q) * CL.length)];
      K.as(K.hv(1751 + q) < 0.5 ? 'linen' : 'wool', () => K.rbox(p[0], y - hgt, p[2], w, hgt, 0.015, col, f.ry + (K.hv(1761 + q) - 0.5) * 0.1)); }
    return true;
  }
  // (the ground under a small piece at (x, z) of the lot, r its half size: its lowest point, on a footed house; the plinth's top)
  const gyAt = (K, x, z, r) => (K.footed ? Math.min(K.gy(x - r, z - r), K.gy(x + r, z - r), K.gy(x - r, z + r), K.gy(x + r, z + r)) - 0.03 : 0);
  // (the room a yard leaves out from the wall: up to the fence Build3D put a hand inside the lot — K.body.yard)
  const yardRoom = (K, s) => { const Y = K.body && K.body.yard; return Y && s.door && Y.side === s.side ? Math.min(s.depth, Y.n1 - (K.footed ? 0.2 : 0.02) - 0.3) : 0; };
  // barrels: two or three standing against the wall, one on its side before them, chocked
  function barrels(K, f, k, count) {
    const h = q => K.hv(1500 + k * 11 + q); const n = count ? G.clamp(count, 1, 3) : h(0) < 0.5 ? 2 : 3;
    for (let i = 0; i < n; i++) { const lx = (i - (n - 1) / 2) * 0.58; const p = pt(f, lx, -f.dp / 2 + 0.3); barrel(K, p[0], gyAt(K, p[0], p[1], 0.26), p[1], 0.27, 0.74 + h(1 + i) * 0.1, h(5 + i) < 0.5 ? [112, 80, 50] : [130, 96, 60]); }
    if (f.dp > 0.75 && n >= 3) { const r = 0.25, A = pt(f, -0.36, f.dp / 2 - 0.27), B = pt(f, 0.36, f.dp / 2 - 0.27); const y = Math.min(gyAt(K, A[0], A[1], 0.2), gyAt(K, B[0], B[1], 0.2)) + r;
      K.as('plankV', () => K.log([A[0], y, A[1]], [B[0], y, B[1]], r, [122, 88, 56]));
      K.as('iron', () => { for (const t of [0.16, 0.84]) { const a = [A[0] + (B[0] - A[0]) * (t - 0.03), y, A[1] + (B[1] - A[1]) * (t - 0.03)], b = [A[0] + (B[0] - A[0]) * (t + 0.03), y, A[1] + (B[1] - A[1]) * (t + 0.03)]; K.log(a, b, r + 0.012, '#3c3a36'); } }); }
  }
  // what a store shows of its people's stock: the counts the god's view draws by the storehouse (render.js drawPiles) — wood up to
  // eight, stone up to six, food up to six, by how full the people's stores are; an empty store shows nothing. (Build3D's chunk
  // signature has them: the yard is drawn again when a count changes.) [wood, stone, food]
  const capOf = new Map(); G.worldHooks.push(() => capOf.clear());
  P3.shows = b => KIND[b.type] === store; // (the buildings whose yard shows their people's stock)
  P3.piles = function (b) {
    const f = G.Fac.ofSet ? G.Fac.ofSet(b.set) : null; if (!f) return [0, 0, 0];
    const S = G.S; let c = capOf.get(f.id); if (!c || c.t !== S.clock) { c = { t: S.clock, cap: Math.max(1, G.Village.cap(f.id)) }; capOf.set(f.id, c); }
    const st = f.stock, q = (k, m) => Math.ceil(Math.min(1, Math.max(0, st[k] || 0) / c.cap) * m);
    return [q('wood', 8), q('stone', 6), q('food', 6)];
  };
  // (the heaps of the stock: the wood stacked, the stones in a heap, the food in sacks — or the hay of a barn — as many as the count)
  function woodHeap(K, f, n) { P3.woodpile(K, f.cx, f.y, f.cz, f.l, Math.min(0.5, f.dp), 0.2 + n * 0.07, f.ry); }
  function stoneHeap(K, f, n) {
    const R3 = G.Realm; for (let q = 0; q < n; q++) { const row = Math.floor(q / 3), i = q % 3, h = K.hv(1350 + q); const p = pt(f, (i - 1) * 0.3 + (row % 2) * 0.15 + (h - 0.5) * 0.06, -f.dp / 2 + 0.24 + Math.min(row, 1) * 0.06);
      K.as('rock', () => K.g.put(R3.SH.ico0, R3.mat(K.x0 + p[0], K.y0 + gyAt(K, p[0], p[1], 0.15) + 0.13 + row * 0.2, K.z0 + p[1], q * 1.3, 0.34, 0.24, 0.3), K.c(q % 2 ? [150, 144, 132] : [128, 122, 112]))); }
  }
  function foodHeap(K, f, n, k) {
    for (let q = 0; q < n; q++) { const row = Math.floor(q / 3), i = q % 3; const p = pt(f, (i - 1) * 0.42 + row * 0.2, -f.dp / 2 + 0.26); const y = gyAt(K, p[0], p[1], 0.2) + (row ? 0.4 : 0);
      if (K.b.type === 'celeiro' && !row) K.as('thatch', () => K.sph(p[0], y, p[1], 0.24, [200, 170, 96], 0.85)); else sack(K, p[0], y, p[1], row ? 0.4 : 0.46, k * 7 + q); }
  }
  function store(K, S) { // (the people's stock, heaped in the yard — on each side of the way to the door — and then along the walls)
    const [nw, ns, nf] = P3.piles(K.b); const want = [];
    if (nw) want.push([woodHeap, 0.5 + nw * 0.12, nw, 'wood']); if (ns) want.push([stoneHeap, 0.95, ns, 'stone']); if (nf) want.push([foodHeap, 1.35, nf, 'food']);
    const yards = S.filter(s => yardRoom(K, s) >= 0.6), walls = S.filter(s => !(yardRoom(K, s) >= 0.6) && s.depth >= 0.42); let k = 0;
    for (const [fn, l, n, good] of want) {
      let f = null;
      for (const s of yards) { f = take(K, s, l, Math.min(0.9, yardRoom(K, s)), s.a1 <= s.da ? 'start' : 'end', true); if (f) break; }
      if (!f) for (const s of walls) { f = take(K, s, l, Math.min(0.62, s.depth), undefined, true); if (f) break; }
      if (f) { fn(K, f, n, k++); if (rec && rec.length) rec[rec.length - 1].pile = [good, n]; } // (the proofs see which heap it is)
    }
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
  function quay(K, S) { // (nets hung to dry where the quay has fishing boats, coils of rope, a mooring post — the crates on the quay are the world's: People3D)
    const n0 = rec ? rec.length : 0; const s = aboutOf(K).nets ? pick(S, 0, q => q.depth >= 0.5) : null; if (s) { const f = take(K, s, 1.6, 0.4, undefined, true); if (f) {
      tag(n0, 'redes');
      K.as('beam', () => { for (const sd of [-1, 1]) K.rbox(...xyz(f, sd * 0.75, 0, 0), 0.08, 1.7, 0.08, [104, 80, 56], f.ry); K.rbox(...xyz(f, 0, 1.62, 0), 1.6, 0.07, 0.07, [104, 80, 56], f.ry); });
      K.as('cloth', () => K.rbox(...xyz(f, 0, 0.35, 0.02), 1.4, 1.25, 0.02, [74, 84, 76], f.ry)); } }
    // (a coil of rope where the quay works — Atmos.about: a ship of its own, a busy port —, the mooring posts always)
    const rope = aboutOf(K).rope;
    for (const q of S) { if (q.depth < 0.5) continue; const r = K.hv(970 + (q.side.charCodeAt(0))); if (r < 0.5 && !rope) continue; const n1 = rec ? rec.length : 0; const f = take(K, q, 0.6, Math.min(0.6, q.depth)); if (!f) continue;
      if (r < 0.5) { tag(n1, 'corda'); K.cyl(f.cx, f.y, f.cz, 0.24, 0.12, [190, 166, 120]); K.cyl(f.cx, f.y + 0.12, f.cz, 0.12, 0.01, [92, 78, 58]); }
      else { K.as('bark', () => K.cyl(f.cx, f.y, f.cz, 0.13, 0.62, [96, 74, 52])); K.as('rope', () => K.cyl(f.cx, f.y + 0.4, f.cz, 0.145, 0.07, [176, 152, 108])); } }
  }
  // the potter's pots set out to dry: a row against the wall, in the yard a second row before it (and never by the kiln, which
  // Build3D put in the yard: K.body.kiln); each pot its size and clay by the house's id, on its own ground
  // (as many as the pottery has drying — the raw pieces of its batches, G.Oficio.show —, none when it has none)
  // (a pottery drawn from its plan — its shed and its yard fill the lot —: a row at the foot of its fence, out on the lot's
  // edge before the street, by its gate first; the pots as big as the strip takes: D-186)
  function potter(K, S) { const kl = K.body && K.body.kiln; let k = 0; const CL = [[176, 98, 64], [160, 110, 76], [196, 132, 90], [150, 92, 62]]; const want = aboutOf(K).pots; if (!want) return;
    if (K.body && K.body.shell) { const R = S.filter(q => !q.thin && q.depth >= 0.2).sort((a, b) => (b.door - a.door) || (a.near - b.near) || (b.a1 - b.cur) - (a.a1 - a.cur));
      for (const s of R) { while (k < want) { const sz = Math.min(0.46, s.depth - 0.01); const n = Math.min(3, want - k); const l = n * (sz + 0.08); const n0 = rec ? rec.length : 0;
        const f = take(K, s, l, sz, s.door && s.a1 <= s.da ? 'end' : 'start', true); if (!f) break; tag(n0, 'potes');
        for (let q = 0; q < n; q++) { const h = K.hv(990 + k); const p = pt(f, (q - (n - 1) / 2) * (sz + 0.08), 0); const s2 = sz * (0.8 + h * 0.2); pot(K, p[0], gyAt(K, p[0], p[1], s2 * 0.4), p[1], s2, CL[(k++ + K.b.id) % 4]); } }
        if (k >= want) break; }
      return; }
    for (const s of S) { if (s.depth < 0.4 || (kl && kl.side === s.side && kl.at > s.a0 - 0.8 && kl.at < s.a1 + 0.8)) continue; const room = yardRoom(K, s); const rows = room >= 0.8 ? 2 : 1;
      if (k >= want) break; const n0 = rec ? rec.length : 0; const f = take(K, s, 1.2, rows > 1 ? Math.min(0.95, room) : Math.min(0.5, s.depth), undefined, true); if (!f) continue;
      tag(n0, 'potes');
      for (let r = 0; r < rows; r++) for (let q = 0; q < 3 - r; q++) { if (k >= want) break; const h = K.hv(990 + k); const p = pt(f, -0.4 + q * 0.4 + r * 0.2 + (h - 0.5) * 0.08, rows > 1 ? -f.dp / 2 + 0.24 + r * 0.44 : 0); const s2 = (0.32 + h * 0.16) * (r ? 0.8 : 1);
        pot(K, p[0], gyAt(K, p[0], p[1], s2 * 0.4), p[1], s2, CL[(k++ + K.b.id) % 4]); } } }
  // the inn's yard: barrels on one side of the way to the door, a trestle table with its two benches on the other
  // (an inn drawn from its plan — its yard is the plan's, its table and its rack of barrels the plan's own pieces —: the casks
  // of what it has to pour stand on its lot out of the yard — against its house's wall where the lot leaves a strip beside it,
  // else small ones at the foot of its fence by the gate: D-186)
  function tavern(K, S) {
    if (K.body && K.body.shell) { const casks = aboutOf(K).casks; if (!casks) return; const n0 = rec ? rec.length : 0;
      const big = S.filter(q => !q.thin && !q.fence && q.depth >= 0.62 && q.a1 - q.cur >= 1.35).sort((a, b) => (b.a1 - b.cur) - (a.a1 - a.cur))[0];
      if (big) { const f = take(K, big, 1.35, Math.min(0.85, big.depth), K.hv(1800) < 0.5 ? 'start' : 'end', true); if (f) { barrels(K, f, 40, casks); tag(n0, 'barris'); return; } }
      for (const s of S.filter(q => !q.thin && q.depth >= 0.24).sort((a, b) => (b.door - a.door) || (a.near - b.near))) { const r = Math.min(0.2, (s.depth - 0.02) / 2); const n = G.clamp(casks, 1, 3);
        const f = take(K, s, n * (2 * r + 0.05), 2 * r + 0.02, s.door && s.a1 <= s.da ? 'end' : 'start', true); if (!f) continue; tag(n0, 'barris');
        for (let q = 0; q < n; q++) { const p = pt(f, (q - (n - 1) / 2) * (2 * r + 0.05), 0); barrel(K, p[0], gyAt(K, p[0], p[1], r), p[1], r, 0.46 + K.hv(1501 + q) * 0.1, K.hv(1505 + q) < 0.5 ? [112, 80, 50] : [130, 96, 60]); }
        return; }
      return; }
    const ds = S.filter(q => q.door && yardRoom(K, q) >= 0.6); if (!ds.length) return home(K, S);
    const first = Math.floor(K.hv(1800) * ds.length) % ds.length; const casks = aboutOf(K).casks; // (the casks of what it has to pour: none on an empty shelf)
    ds.forEach((s, i) => { const room = yardRoom(K, s); const far = s.a1 <= s.da;
      if (i === first) { if (!casks) return; const n0 = rec ? rec.length : 0; const f = take(K, s, 1.35, Math.min(0.85, room), far ? 'start' : 'end', true); if (f) { barrels(K, f, 40, casks); tag(n0, 'barris'); } return; }
      const f = take(K, s, 1.9, Math.min(1.3, room), far ? 'start' : 'end'); if (!f) return;
      const P = (lx, lz) => pt(f, lx, lz); const y = gyAt(K, f.cx, f.cz, 0.6); const wc = [118, 90, 60];
      // (the table: a top of planks on two trestles; a bench along each long side)
      const tz = f.dp >= 1.15 ? 0 : -0.1; K.as('plankH', () => K.rbox(...xyz(f, 0, 0.74, tz), 1.5, 0.05, 0.62, [136, 104, 70], f.ry));
      K.as('beam', () => { for (const e of [-0.6, 0.6]) for (const t of [-0.22, 0.22]) { const a = P(e, tz + t), b = P(e, tz); K.bar([a[0], y, a[1]], [b[0], f.y + 0.74, b[1]], [0, 0, 0.05], [0.05, 0, 0], wc); } });
      if (f.dp >= 1.15) for (const sd of [-1, 1]) { const g = { cx: P(0, sd * 0.5)[0], cz: P(0, sd * 0.5)[1], ry: f.ry, y: f.y, l: 1.4, dp: 0.3 }; bench(K, g); } else bench(K, { cx: P(0, 0.38)[0], cz: P(0, 0.38)[1], ry: f.ry, y: f.y, l: 1.4, dp: 0.3 });
    });
  }
  function market(K, S) { void S; if (K.banca) return; // (baskets of what is sold beside the stalls — the stalls made in Blender bring their own)
    // (a basket a good on its shelf: none on an empty one)
    const n = Math.min(K.b.type === 'mercado_negro' ? 2 : 4, aboutOf(K).baskets); for (let k = 0; k < n; k++) { const px = K.w * ((k % 2) * 0.5 + 0.25) + 1.25, pz = K.d * (Math.floor(k / 2) * 0.5 + 0.25) + 0.3;
      if (px > K.w - 0.4 || pz > K.d - 0.4) continue; const y = K.footed ? K.gy(px, pz) - 0.03 : 0; basket(K, px, y, pz, k + K.b.id); if (rec) rec.push({ b: K.b, x0: px - 0.24, x1: px + 0.24, z0: pz - 0.24, z1: pz + 0.24, y, ground: y, footed: true, thing: 'cesto' }); } }
  // (one rune stone to a town of the north, at its oldest well: in the well's lot — the body does not walk into it — behind the
  // well from the side people come to it, its carved face to them; not the well's own — the god's well has none —, what lies
  // about it, D-092)
  function wellStone(K) {
    if (K.st !== 'nordico' || [...G.S.buildings.values()].some(q => q.type === 'well' && q.set === K.b.set && q.id < K.b.id)) return;
    const o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[G.Build3D.doorSide(K.b)]; const x = K.w / 2, z = K.d / 2;
    G.Build3D.runeStone(K, x - o[0] * 1.48, z - o[1] * 1.48, Math.atan2(o[0], o[1]), 0.7);
  }
  const KIND = { well: wellStone, hut: home, house: home, sobrado: home, insula: home, barraco: home, storehouse: store, armazem: store, celeiro: store, workshop: smithy, forja: smithy, doca: quay, olaria: potter, mercado: market, feira: market, mercado_negro: market, taverna: tavern };
  // what a built building has about it (build3d calls this after drawing it, with its kit)
  // (whether a building's picture has room for what lies about it: one drawn from its kit, always — its yard, its woodshed —;
  // one drawn from its plan fills its lot, and has it only if its last picture found a strip to put things on. Build3D's
  // signature asks: what a house with no yard has about it changes nothing in its picture)
  const yard = new Map(); G.worldHooks.push(() => yard.clear());
  P3.yardOf = b => !!KIND[b.type] && (!(G.Build3D && G.Build3D.shellOf && G.Build3D.shellOf(b)) || yard.get(b.id) > 0);
  P3.roomOf = b => yard.get(b.id); // (for the proofs: the strips its last picture had for things — undefined, never drawn)
  const span = new Map(); G.worldHooks.push(() => span.clear());
  P3.spanOf = b => span.get(b.id) || 0; // (and the longest of them, metres along its wall)
  P3.made = () => !!(G.Build3D && G.Build3D.made && G.Build3D.made()); // (the 3D's builders made: pieces can be asked)
  P3.into = function (K) { const f = KIND[K.b.type]; if (!f) return; let S = f === wellStone ? [] : slots(K); if (f !== home) S = S.filter(q => !q.thin); // (what is thin is a house's)
    yard.set(K.b.id, f === market ? 1 : S.length); span.set(K.b.id, S.reduce((m, q) => Math.max(m, q.a1 - q.a0), 0)); if (!S.length && f !== market && f !== wellStone) return;
    const q = G.Realm && G.Realm.Q ? G.Realm.Q() : null; K.props = q && q.props !== undefined ? q.props : 1; K.nTake = 0; f(K, S); };
  // (for the proofs: the pieces about a building as they are put — each one's box on the lot, its base, and which heap of the
  // stock it is, when it is one)
  P3.pieces = function (b) { if (!P3.made()) return []; rec = []; G.Build3D.propsOf(b); const got = rec; rec = null; return got; };
  // the drawing's own proof: the pieces of the buildings given (Build3D.check passes the ones near the body) drawn again and
  // looked at — on its lot, never in front of its door, standing on its ground, numbers that are numbers
  P3.check = function (list) {
    const out = []; if (!G.Build3D || !G.Build3D.propsOf || !G.Realm.renderer || !G.Realm.renderer()) return out; const L = G.Space.TILE; // (only once the 3D is made)
    // (called with nothing, as every X.check() may be: the buildings near the body, as Build3D.check takes them)
    if (!list) { const f = G.Possess && G.Possess.body && G.Possess.body(); const cx = f ? f.x : G.N / 2, cy = f ? f.y : G.N / 2; list = [...G.S.buildings.values()].filter(b => G.dist(b.x + b.w / 2, b.y + b.h / 2, cx, cy) < 14); }
    for (const b of list) {
      rec = []; const B = G.Build3D.propsOf(b); const got = rec; rec = null;
      const tag = `${b.type}#${b.id} (enfeite)`;
      for (const r of got) {
        if (![r.x0, r.x1, r.z0, r.z1, r.y].every(Number.isFinite)) { out.push(`${tag}: números que não são números`); continue; }
        // (on its own lot: the box of the lot in metres from its corner)
        const e = 0.06; if (r.x0 < -e || r.z0 < -e || r.x1 > b.w * L + e || r.z1 > b.h * L + e) out.push(`${tag}: fora do lote (${r.x0.toFixed(2)}..${r.x1.toFixed(2)}, ${r.z0.toFixed(2)}..${r.z1.toFixed(2)})`);
        // (what is thin stands on the footing's ledge, at the floor's height; the rest on the ground)
        if (r.thin) { if (Math.abs(r.y - LEDGE) > 1e-6) out.push(`${tag}: fora da soleira da fundação (${r.y.toFixed(2)} m)`); continue; }
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
