'use strict';
// ============================================================
//  Dentro3D: what a building shows inside, only seen (the interiors
//  2.0, D-651; the front P5 — planos/interiores-2-contrato.md, D-740
//  to D-749). The rule above all (the owner, 23/11/2026): every thing
//  shown has its cause, never a draw — what the building has, said by
//  G.Atmos.within (the drink of its book in the jars on its shelves,
//  the food of its store hung from the pegs and the beams and laid on
//  its counter, the cup and the plate of who sits at its tables, the
//  pot on the fire that cooks, the cloth of a people that weaves, the
//  lamp lit by someone awake in the dark, the marks of its years).
//  Each thing rests on its piece — on the tops, the shelves, the
//  ledges the furniture's model says (G.Movel3D anchors) —, hangs from
//  a peg in a wall clear of windows and doors or from the joists of a
//  floor above, lies on the floor beside a piece against a wall —
//  never in the way of anyone (the corridor, the doors, the stairs,
//  the places where one stands to use a piece: the plan's), never in
//  a piece, never out of the lot. Where and which of the true ways is
//  the building's id (G.hash), never a chance.
//   · D.plan(b, p): the things and their causes, in the lot's frame
//     (pure: the plan and the world in, the list out; kept a building
//     while the cause is the same — its signature, D.sig);
//   · D.fontes(b): the lamps and the candles lit among them (G.Luz3D
//     bakes their light into the inside's: P1);
//   · D.draw(o, grp, meshes): the things of an inside open, a mesh a
//     thing's part (instances), into the furniture's group; D.step(o)
//     draws them again only when their cause changes;
//   · D.builder(uso, fn), D.oficio(oficio, fn): what each use and each
//     trade puts inside, a wave's in a file of its own, with the kit of
//     the ways of putting things (D.KIT) — the interiors 3, F7 (D-1010;
//     the manual: planos/interiores-3-decoracao.md).
//  Nothing here touches the world, nor draws on any chance.
// ============================================================
(function (G) {
  const D = G.Dentro3D = {};
  const TAU = Math.PI * 2, HALF = Math.PI / 2, EPS = 1e-6;
  const FLOOR_UP = 0.012; // (the floor a hair over the plinth's top — Build3D's: what stands on it stands on that)
  // (a thing's model: the dishes and the drinks by their own names — 'comida-<prato>', 'bebida-<bebida>', D-748 —, the rest 'deco-<coisa>')
  const NAME = k => (k.startsWith('comida-') || k.startsWith('bebida-') ? k : 'deco-' + k);
  const MESH = k => (G.MESH3D ? G.MESH3D[NAME(k)] : null);
  D.has = k => !!MESH(k);
  // (a number of the building, the same at every look: which of the true ways)
  const hv = (b, k) => G.hash(Math.imul((b.id | 0) + 101, 7919) + (k | 0) * 131 + 17);
  const r3 = x => Math.round(x * 1000) / 1000;

  // ------------------------------ the plan's frame ------------------------------
  // (a piece's frame to the lot's: a across its front, n out of it — as Build3D lays it)
  const frame = it => { const c = Math.cos(it.ry || 0), s = Math.sin(it.ry || 0); return (a, n) => [it.x + a * c + n * s, it.z - a * s + n * c]; };
  const lvOf = (p, lv) => p.levels.find(q => q.lv === lv) || null;
  const cellAt = (p, lv, x, z) => { const g = p.grid; const lg = g && g.lv[lv]; if (!lg) return 0; const i = Math.floor(x / g.cs), j = Math.floor(z / g.cs); return i < 0 || j < 0 || i >= g.n || j >= g.n ? 0 : lg[j * g.n + i]; };
  const inR = (r, x, z, m) => x > r[0] - (m || 0) && x < r[2] + (m || 0) && z > r[1] - (m || 0) && z < r[3] + (m || 0);
  const ovR = (a, c, m) => a[0] < c[2] + (m || 0) && c[0] < a[2] + (m || 0) && a[1] < c[3] + (m || 0) && c[1] < a[3] + (m || 0);
  // the rectangles a storey keeps clear (the lot's frame): the doors' ways in, the stairs and their feet and tops, the corridor the
  // plan grows from the door (the aisle's strips, D-721), its zones — the plan's own keepClear (P3), turned to the lot — and where one
  // stands to use each piece (its spots off the piece: half a metre square)
  const clears = new WeakMap();
  D.clear = function (p, lv) {
    let m = clears.get(p); if (!m) clears.set(p, m = new Map()); let out = m.get(lv); if (out) return out; out = [];
    const In = G.Interiors, P0 = p._P, s = p.side, L = p.lot ? p.lot.w : 0;
    const loc = r => { const a = In.toLoc(s, L, r[0], r[1]), c = In.toLoc(s, L, r[2], r[3]); return [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1])]; };
    if (p.zones) for (const z of p.zones) { if (z.lv === lv) out.push(z.r.slice()); }
    if (P0 && P0.keepClear) for (const r of P0.keepClear(lv)) out.push(loc(r));
    else for (const st of p.stairs) { if (st.lv0 === lv || st.lv1 === lv) out.push(st.r.slice()); }
    for (const it of p.items) if (it.lv === lv) for (const sp of it.spots || []) if (!sp.on) out.push([sp.x - 0.28, sp.z - 0.28, sp.x + 0.28, sp.z + 0.28]);
    m.set(lv, out); return out;
  };
  // the rectangles of the pieces of a storey (an L in its parts)
  const rectsOf = it => (it.parts && it.parts.length ? it.parts : [it.r]);
  // is a rectangle of floor free for a thing that stands on it: all of it over the storey's floor, clear of every piece and of what
  // the storey keeps clear
  function floorFree(p, lv, r) {
    const C = G.Interiors.CELL;
    for (let z = r[1] + 0.04; z < r[3]; z += 0.12) for (let x = r[0] + 0.04; x < r[2]; x += 0.12) { if (cellAt(p, lv, x, z) !== C.FLOOR) return false; }
    if (cellAt(p, lv, r[2] - 0.04, r[3] - 0.04) !== C.FLOOR) return false;
    for (const it of p.items) if (it.lv === lv) for (const q of rectsOf(it)) if (ovR(q, r, 0.02)) return false;
    for (const q of D.clear(p, lv)) if (ovR(q, r, -0.01)) return false;
    return true;
  }
  // (how high a piece stands over its foot, drawn as it is: its model's top, or its rectangle's height)
  const pickOf = (it, look) => (look && G.Movel3D && G.MESH3D ? G.Movel3D.pick(it.kind, look.civ, it.w, it.d, it.h, look.rico >= 2 ? 'rico' : '') : null);
  const topOf = (it, look) => { const mv = pickOf(it, look); return mv ? G.Movel3D.top(mv) : it.h; };

  // ------------------------------ the walls: where a thing may hang ------------------------------
  // the runs of a storey's walls a thing may be put on between y0 and y1 over the floor: for each face of a wall into a room (both
  // faces of a wall between two), the stretches clear of its openings — a window only where it is between those heights, a door
  // always — and of every piece standing against it taller than y0, and of the stairs along it: [{ x, z (the face at its start),
  // tx, tz (along it), nx, nz (into the room), s0, s1 (the stretch, along it), wall }]
  function runs(p, lv, y0, y1, look) {
    const C = G.Interiors.CELL; const out = []; const l = lvOf(p, lv); if (!l) return out;
    for (const w of p.walls) {
      if (w.lv !== lv || w.kind === 'colunata' || w.kind === 'ruina' || (w.h || 0) < y1 + 0.05) continue;
      const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); if (len < 0.6) continue; const tx = (w.b[0] - w.a[0]) / len, tz = (w.b[1] - w.a[1]) / len;
      for (const sg of [1, -1]) {
        const nx = -tz * sg, nz = tx * sg; const mx = (w.a[0] + w.b[0]) / 2 + nx * (w.t / 2 + 0.15), mz = (w.a[1] + w.b[1]) / 2 + nz * (w.t / 2 + 0.15);
        const c = cellAt(p, lv, mx, mz); if (c !== C.FLOOR && c !== C.SOLID && c !== C.LOW) continue;
        const fx = w.a[0] + nx * w.t / 2, fz = w.a[1] + nz * w.t / 2; const cut = [];
        for (const h of p.holes) { if (h.wall !== w.id) continue; const hy0 = h.sill || 0, hy1 = hy0 + h.h; if (h.door < 0 && (hy1 < y0 - 0.05 || hy0 > y1 + 0.05)) continue; cut.push([h.at - h.w / 2 - 0.14, h.at + h.w / 2 + 0.14]); }
        const near = (r, gap) => { // (a rectangle against this face: its stretch along it)
          const cs = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]].map(q => [(q[0] - fx) * tx + (q[1] - fz) * tz, (q[0] - fx) * nx + (q[1] - fz) * nz]);
          const dn = Math.min(...cs.map(q => q[1])); if (dn > gap || Math.max(...cs.map(q => q[1])) < -0.05) return null;
          return [Math.min(...cs.map(q => q[0])), Math.max(...cs.map(q => q[0]))];
        };
        for (const it of p.items) if (it.lv === lv && (it.fire || (it.y || 0) + topOf(it, look) > y0 - 0.05)) for (const r of rectsOf(it)) { const q = near(r, it.fire ? 0.6 : 0.35); if (q) cut.push([q[0] - (it.fire ? 0.25 : 0.08), q[1] + (it.fire ? 0.25 : 0.08)]); }
        for (const st of p.stairs) if (st.lv0 === lv || st.lv1 === lv) { const q = near(st.r, 0.4); if (q) cut.push([q[0] - 0.15, q[1] + 0.15]); }
        // (the face's own ends: the corners of the room, where another wall stands)
        let free = [[w.t / 2 + 0.12, len - w.t / 2 - 0.12]];
        for (const [a, c2] of cut) { const nf = []; for (const [s0, s1] of free) { if (c2 <= s0 || a >= s1) { nf.push([s0, s1]); continue; } if (a > s0) nf.push([s0, a]); if (c2 < s1) nf.push([c2, s1]); } free = nf; }
        for (const [s0, s1] of free) if (s1 - s0 > 0.2) {
          // (the face over the storey's floor all along: no wall standing in front of it — the corner of another room)
          let ok = true; for (let s = s0; s <= s1 && ok; s += 0.25) { const c2 = cellAt(p, lv, fx + tx * s + nx * 0.14, fz + tz * s + nz * 0.14); if (c2 === C.WALL || c2 === C.OUT || c2 === C.VOID) ok = false; }
          if (ok) out.push({ x: fx, z: fz, tx, tz, nx, nz, s0, s1, wall: w.id, outer: !!w.outer });
        }
      }
    }
    return out;
  }
  // (the height of what is over a point of a storey: the floor of a storey above that covers it, or the roof's eaves — for what
  // hangs from the joists; Infinity where nothing is near enough to hang from)
  function ceilAt(p, l, x, z) {
    let y = p.shell && Number.isFinite(p.shell.eave) ? p.shell.eave : Infinity;
    for (const q of p.levels) { if (q.y <= l.y + 0.5) continue; const A = q.areas || [q.area]; if (A.some(r => r && inR(r, x, z, -0.05))) y = Math.min(y, q.y); }
    return y;
  }

  // ------------------------------ the things, placed ------------------------------
  // a thing: { k (its model: deco-<k>), x, y, z (the lot's frame: y over the plinth's top), ry, s: [sx, sy, sz], lv, on (what it rests
  // on: 'tampo', 'prateleira', 'chao', 'parede', 'teto', 'canto'), it (the piece's id, when on one), key (its place, the same at every
  // look), why (its cause), c: { part: [r, g, b] } (the colours that are the thing's own: the dish, the drink, what fills a basket) }
  function Ctx(b, p, W, look, near) {
    const out = []; const ctx = { b, p, W, look, near, out, used: new Map(), wall: [] };
    // (the walls' things never one over the other: what hangs on a peg, the marks, the lamps on their shelves, the hanging cloth —
    // a stretch of a face between two heights each, at its point of the face)
    ctx.wallFree = (x, z, w, y0, y1) => !ctx.wall.some(q => Math.hypot(q.x - x, q.z - z) < (q.w + w) / 2 + 0.05 && q.y0 < y1 + 0.03 && y0 < q.y1 + 0.03);
    ctx.wallTake = (x, z, w, y0, y1) => { ctx.wall.push({ x, z, w, y0, y1 }); };
    // (a thing at a point of a piece's frame, facing as the piece does, ry more)
    ctx.put = function (k, x, y, z, ry, o) { const m = MESH(k); if (!m) return null; const t = Object.assign({ k, x: r3(x), y: r3(y), z: r3(z), ry: r3(ry || 0), s: [1, 1, 1], lv: 0, on: 'chao', it: null, key: '', why: '', c: null }, o || {}); out.push(t); return t; };
    return ctx;
  }
  // (a row of things along a surface of a piece — a shelf, a top —, from one end, each with its gap; what does not fit is given back)
  // (small things of one kind — the cups — in two rows where the surface is deep enough for them: the back row, then the front one a
  // half step along, each turned a little its own way by the id; the place taken along a shelf is kept for the next row of things)
  function pack(ctx, it, a, list, o) {
    const fr = frame(it); const left = []; const x0 = a.x - a.w / 2 + 0.03 + (o && o.from || 0) + (ctx.used.get(a) || 0); const end = a.x + a.w / 2 - 0.02; const room = o && Number.isFinite(o.room) ? o.room : 9;
    const cur = [x0, x0]; let row = 0;
    for (const q of list) {
      const m = MESH(q.k); if (!m) continue; const w = m.w * (q.sc || 1), dd = m.d * (q.sc || 1), h = m.h * (q.sc || 1);
      const two = q.two && dd * 2 + 0.03 <= a.d; const r = two ? row : 0; const at = two && r === 1 && cur[1] === x0 ? x0 + w * 0.5 : cur[r];
      if (h > room || dd > a.d + 0.06 || at + w > end) { left.push(q); continue; }
      const ac = at + w / 2; const nOff = q.n !== undefined ? q.n : two ? (r ? 1 : -1) * (a.d / 2 - dd / 2 - 0.01) : 0; const P = fr(ac, a.z + nOff);
      const ry = q.ry !== undefined ? q.ry : q.two ? (hv(ctx.b, 300 + ctx.out.length) - 0.5) * 2.6 : 0;
      ctx.put(q.k, P[0], a.y, P[1], (it.ry || 0) + ry, { lv: it.lv, on: a.k, it: it.id, key: `${it.id}/${a.k}${a.i}/${q.key || q.k}`, why: q.why, c: q.c || null, s: q.sc ? [q.sc, q.sc, q.sc] : [1, 1, 1] });
      cur[r] = at + w + (q.gap !== undefined ? q.gap : 0.025); if (!two) cur[1] = Math.max(cur[1], cur[0]); else row = 1 - row;
    }
    if (o && o.track) ctx.used.set(a, Math.max(cur[0], cur[1]) - (x0 - (ctx.used.get(a) || 0)));
    return left;
  }
  // the surfaces of a building's pieces where things may rest — the anchors of each piece's model (its tops, its shelves, its ledges),
  // the top of a table drawn without one —, in the lot's frame and its storey: [{ it, k, i, x (a), y, z (n), w, d, yAbs, room (the
  // height clear over it) }]
  const TABLES = { mesa: 1, 'mesa-redonda': 1, 'mesa-taverna': 1, 'mesa-casa': 1, 'mesa-baixa': 1, 'mesa-terreiro': 1, bancada: 1, 'mesa-leitura': 1, 'mesa-escriba': 1, 'esteira-comer': 1, arca: 1 };
  // (the pieces Build3D draws by its boxes whose top is not the whole piece: the table among its benches, the mat on the floor)
  const FURN_TOP = { 'mesa-casa': 1, 'esteira-comer': 1, 'banco-comer': 1 };
  // (the top of a piece Build3D draws by its boxes — its table part —: the boxes put no clay of their own on it any more, L-1880)
  function furnTop(it, foot) {
    const { w, d, h } = it;
    if (it.kind === 'mesa-casa') { const two = w >= 1.05, tw = two ? w - 0.72 : w - 0.4, ta = two ? 0 : -0.2;
      return { it, k: 'tampo', i: 0, x: ta, y: foot + h, z: 0, w: tw - 0.06, d: d - 0.12, lv: it.lv }; }
    if (it.kind === 'esteira-comer') return { it, k: 'tampo', i: 0, x: 0, y: foot + 0.025, z: 0, w: w - 0.06, d: d - 0.06, lv: it.lv };
    return null;
  }
  // (things laid about a top, each at the free point nearest its own spot along it — clear of what is on it already and of the
  // pots Build3D puts on its own pieces)
  function scatter(ctx, s, list, why0) {
    const fr = frame(s.it); const done = [];
    const taken = ctx.out.filter(t => t.it === s.it.id && t.on === s.k).map(t => { const m = MESH(t.k); const c = Math.cos(s.it.ry || 0), sn = Math.sin(s.it.ry || 0); const dx = t.x - s.it.x, dz = t.z - s.it.z; return [dx * c - dz * sn, dx * sn + dz * c, m ? Math.max(m.w, m.d) / 2 * t.s[0] : 0.08]; });
    list.forEach((q, i) => {
      const m = MESH(q.k); if (!m) return; const sc = q.sc || 1; if (m.h * sc > s.room) return; const rad = Math.max(m.w, m.d) / 2 * sc * 0.82;
      const ta = q.at ? s.x + q.at[0] : s.x - s.w / 2 + (i + 0.5) * s.w / list.length, tn = q.at ? s.z + q.at[1] : s.z + (i % 2 ? -1 : 1) * s.d * 0.12;
      let best = null, bd = 1e9;
      for (let a = s.x - s.w / 2 + rad; a <= s.x + s.w / 2 - rad + EPS; a += 0.03) for (let n = s.z - s.d / 2 + rad; n <= s.z + s.d / 2 - rad + EPS; n += 0.03) {
        if ((s.avoid || []).some(v => Math.hypot(v[0] - a, v[1] - n) < v[2] + rad + 0.01)) continue;
        if (taken.some(v => Math.hypot(v[0] - a, v[1] - n) < v[2] * 0.82 + rad + 0.012)) continue;
        const dd = Math.abs(a - ta) + Math.abs(n - tn) * 0.6; if (dd < bd) { bd = dd; best = [a, n]; } }
      if (!best) return; taken.push([best[0], best[1], rad / 0.82]);
      const P = fr(best[0], best[1]); const t = ctx.put(q.k, P[0], s.y, P[1], (s.it.ry || 0) + (q.ry !== undefined ? q.ry : (hv(ctx.b, 200 + i + (s.it.k | 0) * 7) - 0.5) * 2), Object.assign({ lv: s.lv, on: s.k, it: s.it.id, key: `${s.it.id}/${s.k}${s.i}/${q.key || q.k}`, why: q.why || why0, c: q.c || null, s: [sc, sc, sc] }, q.o || {}));
      if (t) done.push(t);
    });
    return done;
  }
  function surfaces(p, look) {
    const out = [];
    for (const it of p.items) {
      const l = lvOf(p, it.lv); if (!l) continue; const foot = l.y + (it.y || 0) + FLOOR_UP; const mv = pickOf(it, look);
      const anc = mv ? G.Movel3D.anchorsOf(mv) : [];
      const tops = anc.filter(a => a.k === 'tampo' || a.k === 'prateleira'); let i = 0;
      for (const a of tops) out.push({ it, k: a.k, i: i++, x: a.x, y: foot + a.y, z: a.z, w: a.w, d: a.d, lv: it.lv });
      if (!tops.length && TABLES[it.kind] && !FURN_TOP[it.kind]) out.push({ it, k: 'tampo', i: 0, x: 0, y: foot + (mv ? G.Movel3D.top(mv) : it.h), z: 0, w: it.w - 0.12, d: it.d - 0.12, lv: it.lv });
      else if (!tops.length && !mv && FURN_TOP[it.kind]) { const f = furnTop(it, foot); if (f) out.push(f); }
    }
    // (the height clear over each: to the next surface over it on the same piece, or to what is over the room there)
    for (const s of out) { const l = lvOf(p, s.lv); const P = frame(s.it)(s.x, s.z); let top = Math.min(ceilAt(p, l, P[0], P[1]), l.y + Math.max(l.h, 2.2));
      for (const q of out) if (q.it === s.it && q !== s && q.y > s.y + 0.05 && Math.abs(q.x - s.x) < (q.w + s.w) / 2 && Math.abs(q.z - s.z) < (q.d + s.d) / 2) top = Math.min(top, q.y - 0.03);
      s.room = top - s.y; }
    return out;
  }

  // (for the checker: the surfaces of a building's pieces, as the things are put on them)
  D.surfacesOf = (b, p) => surfaces(p, G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null);

  // ------------------------------ what each thing is, by its cause ------------------------------
  // (the cups of a people: the potter's mug, the Greek's and the Roman's two-handled cup, the bowl-cup of the Nile and of the lake —
  // of turned wood where the people has never had the potter's ware)
  const CUP = { classico: 'caneca', romano: 'taca', grego: 'taca', egipcio: 'copo', nordico: 'caneca', asteca: 'copo' };
  const cupOf = W => (W.barro ? CUP[W.civ] || 'caneca' : 'caneca-madeira');
  // (the vessel a drink stands in: its own where the people has the potter's ware — the amphora, the jar, the pot, the gourd —, the
  // jug of staves where it has not; the gourd is a gourd: no potter needed)
  const VESSEL = { vinho: 'anforeta', cerveja: 'jarra', mel: 'pote', pulque: 'cabaca', azeite: 'anforeta', oleo: 'anforeta' };
  const vesselOf = (W, k) => { const v = k === 'cerveja' && W.civ === 'egipcio' ? 'jarra-alta' : VESSEL[k] || 'jarra'; return v === 'cabaca' || W.barro ? v : 'jarro-madeira'; };
  // (the colour of each drink in a cup and in an open jar)
  const DRINK = { vinho: [92, 24, 34], cerveja: [150, 96, 34], mel: [176, 124, 44], pulque: [222, 214, 190], azeite: [150, 130, 40], oleo: [120, 100, 40] };
  // (the dish each part of the food makes, and its colour: what was served on a plate, in a bowl)
  const DISH = { trigo: ['prato', [168, 112, 60]], cevada: ['tigela', [150, 112, 62]], sorgo: ['tigela', [188, 150, 102]], arroz: ['tigela', [232, 226, 206]], milho: ['tortilhas', null],
    peixe: ['prato-peixe', null], marisco: ['prato', [204, 124, 92]], carne: ['prato', [126, 60, 38]], leite: ['tigela', [236, 232, 218]], ovos: ['prato', [232, 202, 124]],
    horta: ['tigela', [112, 120, 54]], fruta: ['tigela', [176, 58, 44]], mel: ['tigela', [200, 140, 40]], azeite: ['prato', [168, 112, 60]], provisao: ['prato', [150, 110, 70]], '?': ['tigela', [150, 110, 70]] };
  // (what fills a basket: the fruit of each people, the eggs, the shellfish)
  const FRUIT = { grego: [96, 52, 86], romano: [176, 54, 44], classico: [176, 54, 44], egipcio: [120, 70, 40], nordico: [170, 40, 40], asteca: [214, 150, 40] };
  // (the tablets of a game of cards, by what the people makes them of — their face and their edge: the papyrus, the amate bark, the
  // wood, the wax in its frame, the clay; T7, D-884)
  const CARTA = { papiro: [[226, 210, 162], [196, 176, 128]], amate: [[168, 128, 86], [128, 92, 60]], madeira: [[206, 172, 122], [150, 112, 72]], cera: [[86, 68, 46], [150, 112, 72]], barro: [[204, 140, 96], [176, 102, 66]] };
  // (what hangs, by the part of the food it shows: the garden's braid and herbs, the ham, the fish dried, the maize)
  const HANG = { horta: ['alho', 'ervas'], carne: ['presunto'], peixe: ['peixe-seco'], marisco: [], milho: ['milho'] };

  // ------------------------------ the plan of a building's things ------------------------------
  const memo = new Map(); G.worldHooks.push(() => memo.clear());
  // the signature of what a building shows: the cause (G.Atmos.within), the plan, what its pieces are made of, and where each one
  // with a cup or a plate sits (the share-out of the places, In.placeOf: derived from the world)
  D.sig = function (b, p) {
    const W = G.Atmos.within(b); const look = G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null; let s = W.sig + '#' + (p ? p.sig : '') + '#' + (look ? look.sig : '');
    for (const q of W.mesa) { const v = G.S.villagers.get(q.id); const pl = v && G.Interiors.placeOf ? G.Interiors.placeOf(v) : null; s += '#' + q.id + (pl ? `@${pl.x},${pl.z}` : ''); }
    return s;
  };
  // the things of a building and its lights: { sig, list, fontes } — kept while the signature is the same
  D.plan = function (b, p, near) {
    if (!b || !p || !p.items || !p.levels || !p.levels.length || !G.Atmos || !G.Atmos.within) return { sig: '', list: [], fontes: [] };
    const sig = D.sig(b, p) + (near === false ? '#far' : '');
    const m = memo.get(b.id); if (m && m.sig === sig && m.p === p) return m;
    const W = G.Atmos.within(b); const look = G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null;
    const ctx = Ctx(b, p, W, look, near !== false);
    build(ctx);
    const out = { sig, p, list: ctx.out, fontes: lightsOf(ctx) };
    memo.set(b.id, out); if (memo.size > 64) memo.delete(memo.keys().next().value);
    return out;
  };
  // ------------------------------ the decoration by use (F7, the interiors 3 — D-1010): the builders ------------------------------
  // What each use puts inside — the tavern's drink on its shelves and what is served at its tables, the house's table, pantry and
  // chest — is its builder's: G.Dentro3D.builder(uso, fn), fn(ctx, K), registered by whoever makes the use's decoration, in a file of
  // its own if it likes (the manual: planos/interiores-3-decoracao.md). ctx is the building's: ctx.b, ctx.p (its plan), ctx.W (its
  // within: every cause), ctx.look (its furniture's look), ctx.near (the body near: every thing; far, only the lamps and the cloth),
  // ctx.S (the surfaces of its pieces), ctx.put, ctx.wallFree, ctx.wallTake; K the kit of the ways of putting things (D.KIT, below).
  // The use of a building is its plan's (G.Atmos.usoOf); one with no builder of its own where a household lives (the seat of who
  // rules) is built as a house. After the builder, the layers every building has: the cloth, the lamps, the cobwebs
  // (→ the door that puts back the builder there was: for the proofs that try one)
  const BUILD = new Map();
  D.builder = function (uso, fn) { if (!uso || typeof fn !== 'function') return () => { }; const was = BUILD.get(uso); BUILD.set(uso, fn); memo.clear();
    return () => { if (BUILD.get(uso) !== fn) return; if (was) BUILD.set(uso, was); else BUILD.delete(uso); memo.clear(); }; };
  D.builderOf = b => (b ? BUILD.get(G.Atmos && G.Atmos.usoOf ? G.Atmos.usoOf(b) : b.type) || (G.Village.bedsOf(b) > 0 ? BUILD.get('casa') || null : null) : null);
  // what a trade shows at its post, wherever it works (the within's W.oficios, G.Atmos.oficioRule): G.Dentro3D.oficio(oficio, fn),
  // fn(ctx, K, q) puts the things of one entry — after the use's builder (→ the door that puts back the one there was)
  const OFDRAW = new Map();
  D.oficio = function (oficio, fn) { if (!oficio || typeof fn !== 'function') return () => { }; const was = OFDRAW.get(oficio); OFDRAW.set(oficio, fn); memo.clear();
    return () => { if (OFDRAW.get(oficio) !== fn) return; if (was) OFDRAW.set(oficio, was); else OFDRAW.delete(oficio); memo.clear(); }; };
  function build(ctx) {
    const { b, p } = ctx; ctx.S = surfaces(p, ctx.look);
    const fn = D.builderOf(b); if (fn) fn(ctx, KIT);
    for (const q of ctx.W.oficios || NOFS) { const f2 = OFDRAW.get(q.oficio); if (f2) f2(ctx, KIT, q); }
    cloth(ctx); lamps(ctx); webs(ctx);
  }
  const NOFS = Object.freeze([]);

  // ---- the tavern: its drink, its cups, its food, who sits at its tables, its fire, its years
  function tavern(ctx) {
    const { b, p, W, S } = ctx; const hall = S.filter(s => s.lv === (p.entryLv || 0));
    // (the shelves behind the bar: the rack's, the counter's own under its top, the steps of the masonry counter)
    const bar = hall.filter(s => s.k === 'prateleira' && (s.it.kind === 'prateleira-bar' || s.it.kind === 'balcao' || s.it.kind === 'balcao-alvenaria'));
    const order = pref => bar.slice().sort((a, c) => Math.abs(a.y - pref) - Math.abs(c.y - pref) || a.it.k - c.it.k || a.i - c.i);
    const shelve = (list, pref) => { let left = list; for (const s of order(pref)) { if (!left.length) break; left = pack(ctx, s.it, s, left, { room: s.room - 0.02, track: 1 }); } return left; };
    // the drink: a vessel each whole unit of it in the book; the people's own first
    const own = ((G.Tavern && G.Tavern.DRINK && G.Tavern.DRINK[W.civ]) || {}).k;
    const drinks = W.bebida.slice().sort((a, c) => (c.k === own) - (a.k === own));
    const vessels = []; for (const q of drinks) for (let i = 0; i < q.n; i++) vessels.push({ k: vesselOf(W, q.k), key: q.k + i, why: `${q.why}: uma ${q.vaso} cheia`, c: { liquido: DRINK[q.k] }, ry: (hv(b, 30 + vessels.length) - 0.5) * 0.9 });
    // the open one, being poured, on the counter: the drink on offer (G.Taverna.drinkOn), or a broken unit of one
    const offer = (G.Taverna && G.Taverna.drinkOn ? G.Taverna.drinkOn(b) : null) || (drinks.find(q => q.aberta) || {}).k || null;
    const counter = hall.find(s => s.k === 'tampo' && (s.it.kind === 'balcao' || s.it.kind === 'balcao-alvenaria'));
    // the cups: as many as the seats, less those at the tables (and in the hands that drink)
    const seats = p.items.filter(it => (it.spots || []).some(q => q.on && (q.use === 'sentar' || q.use === 'comer'))).length;
    const atTable = W.mesa.filter(q => q.cup).length; const cups = Math.max(0, Math.min(14, seats) - atTable - (offer ? 2 : 0));
    const cup = cupOf(W); const cupWhy = `as canecas da taverna (${seats} lugares; ${atTable} nas mesas): ${W.why.louca}`;
    // the food of the store: the loaves of the bread grains, the baskets of the fruit, the eggs and the shellfish
    const food = new Map(W.comida.map(q => [q.k, q]));
    const bread = W.comida.filter(q => q.pao).reduce((n, q) => n + q.n, 0); const loaves = Math.min(4, Math.ceil(bread / 2));
    const baskets = []; for (const k of ['fruta', 'ovos', 'marisco']) { const q = food.get(k); if (q) for (let i = 0; i < Math.min(2, Math.ceil(q.n / 3)); i++) baskets.push({ k: 'cesto', key: k + i, why: q.why, c: { conteudo: k === 'fruta' ? FRUIT[W.civ] || FRUIT.classico : k === 'ovos' ? [236, 226, 200] : [196, 132, 104] } }); }
    // (on the counter, the open jar and two cups beside it; a loaf of the day's bread)
    if (counter) {
      const L = []; if (offer) { L.push({ k: vesselOf(W, offer), key: 'aberta', why: `${offer} à venda agora (G.Taverna.drinkOn)`, c: { liquido: DRINK[offer] } }); for (let i = 0; i < 2; i++) L.push({ k: cup, key: 'c' + i, why: cupWhy, c: { liquido: DRINK[offer] }, gap: 0.04 }); }
      if (loaves) L.push({ k: 'pao', key: 'pao', why: `pão: ${W.comida.filter(q => q.pao).map(q => q.k).join(' e ')} na comida da taverna`, gap: 0.05 });
      const from = counter.w > 1 ? hv(b, 3) * Math.max(0, counter.w - 1.0) : 0;
      pack(ctx, counter.it, counter, L, { room: counter.room, from });
    }
    // (the shelves: the drink at the eyes' height, the cups over it, the bread and the baskets under)
    shelve(vessels, 1.1); shelve(Array.from({ length: cups }, (_, i) => ({ k: cup, key: 'cup' + i, why: cupWhy, c: { liquido: [42, 30, 24] }, gap: 0.02, two: 1 })), 1.6);
    const under = Array.from({ length: Math.max(0, loaves - 1) }, (_, i) => ({ k: 'pao', key: 'pao' + i, why: 'o pão da taverna' })).concat(baskets);
    const leftFood = shelve(under, 0.2);
    // (who sits at the tables: the cup of who has drunk, the plate of who eats; a light at a table with people at it, at night)
    tables(ctx);
    // the fire: the pot over it while it cooks; the cakes on the comal, the loaves at the oven's mouth; the firewood by it
    hearth(ctx, food, true);
    // the grain the vat brews and the kitchen boils: sacks by the vat
    const grain = W.comida.filter(q => q.k === 'trigo' || q.k === 'cevada' || q.k === 'sorgo' || q.k === 'arroz' || q.k === 'milho').reduce((n, q) => n + q.n, 0);
    const vat = p.items.find(it => it.kind === 'cuba') || p.items.find(it => it.kind === 'barril' || it.kind === 'pipas' || it.kind === 'anforeira');
    if (grain >= 1 && vat) near(ctx, vat, Array.from({ length: Math.min(3, Math.ceil(grain / 3)) }, (_, i) => ({ k: 'saco', key: 'saco' + i, why: `o grão da comida da taverna (${W.comida.filter(q => ['trigo', 'cevada', 'sorgo', 'arroz', 'milho'].includes(q.k)).map(q => q.k).join(', ')}): o da cuba e o da cozinha`, sk: W.weave ? 'pano' : 'couro' })));
    if (leftFood.length && vat) near(ctx, vat, leftFood.filter(q => q.k === 'cesto'));
    // what hangs: the garden's, the meat, the fish dried, the maize — on pegs in the walls by the fire and the bar, else from the joists
    hangFood(ctx, food);
    // the feast of the day: its decorations on the walls and the tables, its platter (T7, D-880)
    festa(ctx);
    // the marks of charcoal of the customers of years, on the walls by the tables
    marks(ctx);
    // what a brawl left on the floor; the door barred or broken in; the games at the tables; who fainted; the words at the door
    spilt(ctx); door(ctx); games(ctx); fainted(ctx); slate(ctx);
  }
  // ---- the feast (W.festa, D-880, D-881): each decoration by what it is made of — the garlands, the bunting and the drapes high on
  // the walls of the hall over the heads, the people's standard on a wall clear down to the floor, the petals and the feast's candles
  // on the tables —, and the feast's platter of the people on the largest table, its parts what the recipe spent
  const FESTA_AT = { guirlanda: [1.9, 2.28], fita: [2.02, 2.34], pano: [1.76, 2.28], estandarte: [0.86, 2.2] };
  function festa(ctx) {
    const { b, p, W, S } = ctx; const F = W.festa; if (!F) return;
    const lv = p.entryLv || 0; const l = lvOf(p, lv); if (!l) return;
    const tops = S.filter(s => s.k === 'tampo' && s.lv === lv && TABLES[s.it.kind] && s.it.kind !== 'arca' && s.it.kind !== 'mesa-leitura' && s.it.kind !== 'mesa-escriba');
    // (on the walls: each its band of heights, the free stretches of the hall's walls, the nearest to the tables first — and as far from
    // the others of the feast as the walls allow; never over a thing already on the wall)
    const tabs = p.items.filter(it => it.lv === lv && TABLES[it.kind]); const placed = [];
    F.enfeites.forEach((e, i) => {
      const band = FESTA_AT[e.k]; if (!band) return; const m = MESH(e.modelo); if (!m) return;
      const y0 = l.y + band[0], y1 = l.y + band[1]; const cand = [];
      for (const r of runs(p, lv, band[0], band[1], ctx.look)) { if (r.s1 - r.s0 < m.w + 0.1) continue;
        for (let s = r.s0 + m.w / 2 + 0.05; s <= r.s1 - m.w / 2 - 0.05 + EPS; s += 0.25) { const x = r.x + r.tx * s, z = r.z + r.tz * s; if (ceilAt(p, l, x, z) < y1 + 0.05) continue;
          cand.push({ r, x, z, d: tabs.length ? Math.min(...tabs.map(t => Math.hypot(t.x - x, t.z - z))) : 0, h: hv(b, Math.round(x * 31 + z * 17) + i) }); } }
      cand.sort((a, c) => (placed.length ? Math.min(...placed.map(q => Math.hypot(q.x - c.x, q.z - c.z))) - Math.min(...placed.map(q => Math.hypot(q.x - a.x, q.z - a.z))) : 0) || a.d - c.d || a.h - c.h);
      const at = cand.find(q => ctx.wallFree(q.x, q.z, m.w, y0, y1)); if (!at) return;
      ctx.wallTake(at.x, at.z, m.w, y0, y1); placed.push(at); const out = m.d / 2 + 0.002;
      ctx.put(e.modelo, at.x + at.r.nx * out, y0, at.z + at.r.nz * out, Math.atan2(at.r.nx, at.r.nz), { lv, on: 'parede', key: `festa/${e.modelo}/${i}`, why: e.why, festa: 1 });
    });
    // (on the tables: the petals in the middle of each, the feast's candles — two to a table, lit in the dark with someone awake)
    const pet = F.enfeites.find(e => e.k === 'petalas'), vel = F.enfeites.find(e => e.k === 'vela');
    for (const s of tops.slice(0, 8)) {
      const L = []; if (pet && MESH('petalas') && s.w > 0.4 && s.d > 0.3) L.push({ k: 'petalas', key: 'petalas', why: pet.why, at: [0, 0], ry: hv(b, 700 + (s.it.k | 0)) * TAU, o: { festa: 1 } });
      if (vel && MESH('vela')) for (const sd of [-1, 1]) L.push({ k: 'vela', key: 'vela-festa' + sd, why: vel.why, at: [sd * (s.w / 2 - 0.12), sd * (s.d / 2 - 0.1)], o: { festa: 1, lit: F.acesa ? 1 : 0, lmat: W.luz ? W.luz.mat : W.barro ? 'barro' : 'pedra', vs: 0 } });
      if (L.length) scatter(ctx, s, L);
    }
    // (the platter: on the largest table, its middle)
    const pk = F.prato ? 'comida-festa-' + F.prato.civ : null;
    if (pk && MESH(pk)) { const big = tops.slice().sort((a, c) => c.w * c.d - a.w * a.d)[0];
      if (big) scatter(ctx, big, [{ k: pk, key: 'prato-festa', why: F.prato.why, at: [0, 0], ry: hv(b, 720) * 0.6, o: { de: F.prato.de, festa: 1 } }]); }
  }
  // ---- the door (W.porta, D-882): locked — the wooden bar across it in its brackets, on its inner face —; broken in — its leaf fallen
  // flat inside, where the blows threw it, and the splinters at the threshold (the leaf in the doorway is not drawn: Build3D) — till mended
  function doorAt(p) {
    const e = p.entrance; if (!e) return null; const h = p.holes.find(q => q.door === e.door); const w = h && p.walls.find(q => q.id === h.wall); if (!w) return null;
    const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / len, tz = (w.b[1] - w.a[1]) / len; const cx = w.a[0] + tx * h.at, cz = w.a[1] + tz * h.at;
    const C = G.Interiors.CELL; let nx = -tz, nz = tx; const lv = w.lv | 0;
    if (cellAt(p, lv, cx + nx * (w.t / 2 + 0.35), cz + nz * (w.t / 2 + 0.35)) !== C.FLOOR) { nx = -nx; nz = -nz; } // (the inside: the room's floor)
    return { cx, cz, nx, nz, t: w.t, w: h.w, h: h.h, lv };
  }
  function door(ctx) {
    const { b, p, W } = ctx; const P = W.porta; if (!P) return; const d = doorAt(p); const l = d && lvOf(p, d.lv); if (!l) return;
    const ry = Math.atan2(d.nx, d.nz);
    if (P.estado === 'trancada') { const m = MESH('tranca'); if (!m) return; const sx = Math.max(1, (d.w + 0.35) / 1.3); const o = d.t / 2 + m.d / 2 + 0.002;
      ctx.wallTake(d.cx + d.nx * o, d.cz + d.nz * o, m.w * sx, l.y + 0.9, l.y + 0.9 + m.h);
      ctx.put('tranca', d.cx + d.nx * o, l.y + 0.9, d.cz + d.nz * o, ry, { lv: d.lv, on: 'parede', key: 'porta/tranca', why: P.why, s: [sx, 1, 1] }); return; }
    if (P.estado === 'arrombada') {
      const m = MESH('porta-caida'); if (m) { const sx = G.clamp(d.w / 0.95, 0.7, 1.6); const n = d.t / 2 + m.d / 2 + 0.06; const a = (hv(b, 730) - 0.5) * 0.3;
        ctx.put('porta-caida', d.cx + d.nx * n, l.y + FLOOR_UP, d.cz + d.nz * n, ry + a, { lv: d.lv, on: 'chao', solto: 1, key: 'porta/caida', why: P.why, s: [sx, 1, 1] }); }
      if (MESH('lascas')) ctx.put('lascas', d.cx + d.nx * (d.t / 2 + 0.24), l.y + FLOOR_UP + 0.001, d.cz + d.nz * (d.t / 2 + 0.24), ry + hv(b, 731) * TAU, { lv: d.lv, on: 'chao', solto: 1, key: 'porta/lascas', why: P.why });
    }
  }
  // ---- the games at the tables (W.jogos, D-884): the dice in the middle of the table, each turned up on the face the world threw
  // (the throw is the world's: G.JogoDados), their cup by them; the tablets of the game of cards thrown and the hands fanned, the deck
  const FACE_UP = { 1: null, 6: [1, 0, 0, Math.PI], 2: [0, 0, 1, Math.PI / 2], 5: [0, 0, 1, -Math.PI / 2], 3: [1, 0, 0, -Math.PI / 2], 4: [1, 0, 0, Math.PI / 2] };
  function faceUp(f, s) {
    // (a turn about the die's middle, s over its foot: the face f up — column-major, put after the die's own place)
    const r = FACE_UP[f]; if (!r) return null; const [x, y, z, a] = r; const c = Math.cos(a), sn = Math.sin(a), k = 1 - c;
    const R = [c + x * x * k, y * x * k + z * sn, z * x * k - y * sn, 0, x * y * k - z * sn, c + y * y * k, z * y * k + x * sn, 0, x * z * k + y * sn, y * z * k - x * sn, c + z * z * k, 0, 0, 0, 0, 1];
    // (T(0, s, 0) · R · T(0, -s, 0))
    R[12] = -(R[4] * s); R[13] = s - R[5] * s; R[14] = -(R[6] * s); return R;
  }
  function games(ctx) {
    const { b, W, S } = ctx; if (!W.jogos.length) return;
    for (const j of W.jogos) {
      const s = S.find(q => q.k === 'tampo' && q.it.id === j.it); if (!s) continue; const fr = frame(s.it);
      const put = (k, a, n, ry, o, key) => { const P = fr(s.x + a, s.z + n); return ctx.put(k, P[0], s.y, P[1], (s.it.ry || 0) + ry, Object.assign({ lv: s.lv, on: 'tampo', it: s.it.id, key: `${s.it.id}/jogo/${key}`, why: j.why }, o)); };
      const both = j.dados && j.cartas;
      if (j.dados && MESH('dado')) {
        const dm = MESH('dado'); const ox = both ? -0.12 : 0;
        j.dados.faces.forEach((f, i) => { const a = ox + ((i % 3) - 1) * 0.034 + (hv(b, 740 + i) - 0.5) * 0.012, n = (Math.floor(i / 3) - 0.5) * 0.034 + (hv(b, 750 + i) - 0.5) * 0.012;
          put('dado', a, n, hv(b, 760 + i) * TAU, { pre: faceUp(f, dm.h / 2), dmat: j.dados.mat, face: f }, 'dado' + i); });
        if (j.dados.copo && MESH('copo-dados')) put('copo-dados', ox + 0.11, -0.05, 0, { dmat: j.dados.mat }, 'copo');
      }
      if (j.cartas && MESH('cartas')) {
        const ox = both ? 0.1 : 0; put('cartas', ox, 0, hv(b, 770) * 0.8 - 0.4, { cmat: j.cartas.mat }, 'cartas');
        if (j.cartas.monte && MESH('monte')) put('monte', ox + Math.min(0.2, s.w / 2 - 0.08), Math.min(0.08, s.d / 2 - 0.07), hv(b, 771) * 0.5, { cmat: j.cartas.mat }, 'monte');
      }
    }
  }
  // ---- who fainted (W.caidos, D-885): the cup fallen from the hand beside them and the drink run on the floor round it
  function fainted(ctx) {
    const { b, p, W } = ctx; if (!W.caidos.length) return; const C = G.Interiors.CELL;
    W.caidos.forEach((q, i) => {
      const l = lvOf(p, q.lv); if (!l) return; let at = null;
      for (let k = 0; k < 8 && !at; k++) { const a = hv(b, 780 + i) * TAU + k * TAU / 8; const x = q.x + Math.cos(a) * 0.45, z = q.z + Math.sin(a) * 0.45; if (x > 0 && z > 0 && x < p.lot.w && z < p.lot.w && cellAt(p, q.lv, x, z) === C.FLOOR) at = [x, z, a]; }
      if (!at) return;
      ctx.put('caneca-caida', at[0], l.y + FLOOR_UP, at[1], at[2], { lv: q.lv, on: 'chao', solto: 1, key: `caido/${q.id}/caneca`, why: q.why });
      if (MESH('poca')) ctx.put('poca', at[0] + Math.cos(at[2]) * 0.12, l.y + FLOOR_UP + 0.0004, at[1] + Math.sin(at[2]) * 0.12, at[2], { lv: q.lv, on: 'chao', solto: 1, key: `caido/${q.id}/poca`, why: q.why, c: { liquido: DRINK[q.bebida] || DRINK.cerveja }, s: [0.42, 1, 0.42] });
    });
  }
  // ---- what lies on the floor after a brawl (W.chao, D-749): the shards where the mug broke, the spill where the drink ran — at the
  // world's own point, on a floor of its storey (never where a wall or a piece stands), until someone cleans it
  function spilt(ctx) {
    const { b, p, W } = ctx; if (!ctx.near || !W.chao.length) return; const C = G.Interiors.CELL;
    W.chao.forEach((q, i) => {
      const l = lvOf(p, q.lv); const m = MESH(q.k); if (!l || !m || cellAt(p, q.lv, q.x, q.z) !== C.FLOOR) return;
      const sc = q.k === 'poca' ? q.n : 1;
      ctx.put(q.k, q.x, l.y + FLOOR_UP + 0.0005 * (i % 4), q.z, hv(b, 500 + i) * TAU, { lv: q.lv, on: 'chao', solto: 1, key: `chao/${q.k}/${r3(q.x)},${r3(q.z)}`, why: q.why, c: q.bebida ? { liquido: DRINK[q.bebida] || DRINK.cerveja } : null, s: [sc, 1, sc] });
    });
  }
  // ---- the words at the door (W.lousa, D-749): the slate, the board or the painted plaque on the front wall by the door — under the
  // inn's sign (Build3D.innSignSide), else on the other side of the door where a window is under it —, its top a hand under the sign's
  // board, at the eyes of one in the street; its words what the kitchen and the shelf have today (the menu's own reading, in within)
  const SIDEO = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };
  function slate(ctx) {
    const { b, p, W } = ctx; const L = W.lousa; const m = L && MESH(L.k); const B3 = G.Build3D; if (!m || !B3 || !B3.shellOf || !B3.formSide) return;
    const S0 = B3.shellOf(b); if (!S0 || !S0.shell || !S0.entrance || !S0.shell.r) return;
    const R = S0.shell.r; const od = SIDEO[B3.formSide(b, S0)]; if (!od) return; const ax = od[1] !== 0;
    const face = ax ? (od[1] > 0 ? R[3] : R[1]) : (od[0] > 0 ? R[2] : R[0]); const lo = ax ? R[0] : R[1], hi = ax ? R[2] : R[3];
    const e = S0.entrance; const dA = ax ? e.x : e.z; const dw = (e.w || 1) + 0.5; const sign = B3.innSignSide ? B3.innSignSide(b) : 1;
    const lv = e.lv | 0; const y0 = 1.72 - m.h, y1 = 1.72;
    // (the openings of the front wall: its walls on that face, their holes along it)
    const holes = [];
    for (const w of p.walls) { if (w.lv !== lv) continue; const A = ax ? w.a[1] : w.a[0], B = ax ? w.b[1] : w.b[0]; if (Math.abs(A - face) > w.t + 0.08 || Math.abs(B - face) > w.t + 0.08) continue;
      const a0 = ax ? w.a[0] : w.a[1], a1 = ax ? w.b[0] : w.b[1]; const len = Math.abs(a1 - a0); if (len < 0.1) continue; const l = lvOf(p, w.lv); const ly = l ? l.y : 0;
      for (const h of p.holes) if (h.wall === w.id) { const c = a0 + Math.sign(a1 - a0) * h.at; holes.push([c - h.w / 2 - 0.08, c + h.w / 2 + 0.08, ly + (h.sill || 0), ly + (h.sill || 0) + h.h]); } }
    const fits = a => a - m.w / 2 > lo + 0.15 && a + m.w / 2 < hi - 0.15 && !holes.some(h => a + m.w / 2 > h[0] && a - m.w / 2 < h[1] && y1 > h[2] && y0 < h[3]);
    const a = [dA + sign * (dw / 2 + 0.35), dA - sign * (dw / 2 + 0.14 + m.w / 2)].find(fits); if (a === undefined) return;
    const n = face + (ax ? od[1] : od[0]) * (m.d / 2 + 0.004); const x = ax ? a : n, z = ax ? n : a;
    ctx.put(L.k, x, y0, z, Math.atan2(od[0], od[1]), { lv, on: 'fora', key: 'porta/' + L.k, why: L.why, lousa: { prato: L.prato, bebidas: L.bebidas } });
  }

  // (the dish a part of the food makes — the plate of the day where the world no longer says what the plate held —, and the cup a
  // drink is served in: the people's — the Greek's and the Roman's skyphos of wine, the beaker of the Nile and of the lake, the gourd
  // of pulque, the horn of mead where the people has had the hides of its slaughter, the mug —, of clay or of turned wood by its ware)
  const dishOf = part => { const k = 'comida-' + (part && part !== '?' ? part : 'provisao'); return MESH(k) ? k : 'comida-provisao'; };
  const CLASSIC = { grego: 1, romano: 1, classico: 1 }, BEAKER = { egipcio: 1, asteca: 1 };
  const vesselName = (W, k) => (k === 'vinho' ? (CLASSIC[W.civ] ? 'bebida-vinho' : 'bebida-vinho-copo') : k === 'pulque' ? 'bebida-pulque'
    : k === 'mel' ? (W.couro ? 'bebida-mel' : 'bebida-mel-caneca') : BEAKER[W.civ] ? 'bebida-cerveja-copo' : 'bebida-cerveja');
  // ---- the tables: what was served each who sits at one, by their place (In.placeOf) — the plate as much of it as is eaten, steaming
  // while hot; the empty plate and cup of the round done —, what the guests left on them once up, the knucklebones of a game, and
  // the rings of the years of doses on the boards
  function tables(ctx) {
    const { b, p, W, S } = ctx; const tops = S.filter(s => s.k === 'tampo' && TABLES[s.it.kind] && s.it.kind !== 'arca');
    const byTable = new Map();
    const onto = (x, z, lv) => { let best = null, bd = 1.1; for (const s of tops) { if (s.lv !== lv) continue; const r = s.it.r; const d = Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3])); if (d < bd) { bd = d; best = s; } } return best; };
    const add = (s, e) => { let L = byTable.get(s); if (!L) byTable.set(s, L = []); L.push(e); };
    for (const q of W.mesa) {
      const v = G.S.villagers.get(q.id); const pl = v && G.Interiors.placeOf ? G.Interiors.placeOf(v) : null; if (!pl || !Number.isFinite(pl.x)) continue;
      const s = onto(pl.x, pl.z, pl.lv); if (s) add(s, { q, x: pl.x, z: pl.z, key: q.id });
    }
    for (const q of W.sujo) { const s = onto(q.x, q.z, q.lv); if (s) add(s, { q, x: q.x, z: q.z, key: `s${r3(q.x)},${r3(q.z)}` }); }
    ctx.tableGuests = byTable;
    for (const [s, guests] of byTable) {
      const it = s.it; const c = Math.cos(it.ry || 0), sn = Math.sin(it.ry || 0); const taken = []; let game = null;
      for (const { q, x, z, key } of guests) {
        // (the guest's point in the table's frame, brought onto its top a hand in from the edge)
        const dx = x - it.x, dz = z - it.z; let a = dx * c - dz * sn, n = dx * sn + dz * c;
        const ha = s.w / 2 - 0.11, hn = s.d / 2 - 0.11; const out = Math.max(Math.abs(a) / Math.max(ha, 0.01), Math.abs(n) / Math.max(hn, 0.01));
        if (out > 1) { a /= out; n /= out; } else { if (Math.abs(a) / ha > Math.abs(n) / hn) a = Math.sign(a || 1) * ha; else n = Math.sign(n || 1) * hn; }
        const toward = Math.atan2(-a, -n); // (facing the table's middle)
        const put = (k, a2, n2, o, why, kk) => {
          const m = MESH(k); const rr = m ? Math.max(m.w, m.d) * 0.5 : 0.08;
          for (const t of taken) if (Math.hypot(t[0] - a2, t[1] - n2) < t[2] + rr * 0.8) { a2 += (t[2] + rr * 0.8) * Math.sign(a2 - t[0] || 1); }
          a2 = G.clamp(a2, -ha, ha); n2 = G.clamp(n2, -hn, hn); taken.push([a2, n2, rr * 0.8]);
          const P = frame(it)(a2 + s.x, n2 + s.z); return ctx.put(k, P[0], s.y, P[1], (it.ry || 0) + toward, Object.assign({ lv: it.lv, on: 'tampo', it: it.id, key: `${it.id}/mesa/${key}/${kk}`, why }, o));
        };
        // (the plate before them, the cup to one side of it)
        if (q.prato) put(dishOf(q.prato), a * 0.8, n * 0.8, { st: q.st !== undefined ? q.st : q.ps, quente: q.quente || 0, t0: q.t0 || 0 }, q.why, 'prato');
        if (q.cup) { const side = hv(b, q.id || 7) < 0.5 ? -1 : 1; const ta = Math.abs(n) >= Math.abs(a) ? 1 : 0; put(vesselName(W, q.cup), a + (ta ? side * 0.19 : 0), n + (ta ? 0 : side * 0.19), { st: q.st !== undefined ? q.st : q.cs }, q.why, 'caneca'); }
        if (q.jogo && !game) game = q;
      }
      // (the knucklebones in the middle of a table where a game is being played)
      if (game && MESH('ossos')) { const P = frame(it)(s.x, s.z); ctx.put('ossos', P[0], s.y, P[1], (it.ry || 0) + hv(b, 90 + (it.k | 0)) * TAU, { lv: it.lv, on: 'tampo', it: it.id, key: `${it.id}/ossos`, why: `os ossinhos do jogo na mesa: ${game.why}` }); }
    }
    // the rings of beer the years of doses left on the boards (W.manchas): on the tables and the counter, a few on each, where the
    // cups stand — each at its own point of the top and turned its own way (the building's id)
    if (W.manchas && ctx.near) {
      const boards = S.filter(s => s.k === 'tampo' && (TABLES[s.it.kind] || s.it.kind === 'balcao') && s.it.kind !== 'arca' && s.it.kind !== 'esteira-comer' && s.it.kind !== 'mesa-leitura' && s.it.kind !== 'mesa-escriba').sort((a2, c2) => a2.it.k - c2.it.k);
      const kinds = ['mancha-a', 'mancha-b', 'mancha-c', 'mancha-d'];
      for (let i = 0; i < W.manchas && boards.length; i++) {
        const s = boards[i % boards.length]; const k = kinds[Math.floor(hv(b, 400 + i) * kinds.length) % kinds.length]; const m = MESH(k); if (!m) continue;
        const rad = Math.hypot(m.w, m.d) / 2; if (rad * 2 + 0.04 > Math.min(s.w, s.d)) continue; const hw = s.w / 2 - rad - 0.02, hd = s.d / 2 - rad - 0.02;
        const P = frame(s.it)(s.x + (hv(b, 420 + i) * 2 - 1) * hw, s.z + (hv(b, 440 + i) * 2 - 1) * hd);
        ctx.put(k, P[0], s.y + 0.0004 * (i % 3), P[1], (s.it.ry || 0) + hv(b, 460 + i) * TAU, { lv: s.lv, on: s.k, it: s.it.id, key: `${s.it.id}/mancha/${i}`, why: W.why.manchas });
      }
    }
  }
  // ---- the fire: the pot while it cooks; the cakes, the loaves; the firewood beside it
  function hearth(ctx, food, wood) {
    const { b, p, W, S } = ctx;
    for (const it of p.items) {
      if (!it.fire) continue; const tops = S.filter(s => s.it === it && s.k === 'tampo');
      if (W.cozinha && tops.length) {
        const s = tops[0]; const milho = food && food.get('milho'); const bread = W.comida.some(q => q.pao);
        if (it.kind === 'fogao-comal' && milho) pack(ctx, it, s, [{ k: 'tortilhas', key: 'comal', why: `o milho da comida, no comal (${W.cozinha.why})` }], { room: s.room, from: Math.max(0, (s.w - 0.18) / 2) });
        else if (it.kind === 'forno-barro' && bread) pack(ctx, it, s, [{ k: 'pao', key: 'forno0', why: `o pão saindo do forno (${W.cozinha.why})` }, { k: 'pao', key: 'forno1', why: 'o pão saindo do forno' }], { room: s.room, from: 0.12 });
        else if (W.cozinha.mat && s.w >= 0.25 && s.d >= 0.2) {
          const big = it.kind === 'fogo-comprido' && W.metal && MESH('caldeirao') && s.room > 0.85; const k = big ? 'caldeirao' : 'panela';
          const P = frame(it)(s.x, s.z); ctx.put(k, P[0], s.y, P[1], (it.ry || 0) + (hv(b, 7) - 0.5), { lv: it.lv, on: 'tampo', it: it.id, key: `${it.id}/fogo/${k}`, why: `${W.cozinha.why} (a panela de ${W.cozinha.mat})`, pmat: W.cozinha.mat });
        }
      }
      if (wood && W.lenha && ctx.near) near(ctx, it, [{ k: 'lenha', key: 'lenha', why: `a lenha do fogo: ${W.lenha.why}`, o: { st: 4 - W.lenha.q } }]); // (the pile as much of it as is left: D-749)
    }
  }
  // ---- what stands on the floor beside a piece against a wall: flush with the wall, to one side of it (which first, the id), clear
  // of the pieces, the corridor, the doors, the stairs and where one stands
  function beside(ctx, it, list) {
    const { b, p } = ctx; if (!list.length) return []; const left = [];
    const l = lvOf(p, it.lv); if (!l) return list; const fr = frame(it); const c = Math.cos(it.ry || 0), s = Math.sin(it.ry || 0);
    let side = hv(b, 50 + (it.k | 0)) < 0.5 ? -1 : 1; let cursor = { '-1': it.w / 2 + 0.05, 1: it.w / 2 + 0.05 };
    for (const q of list) {
      const m = MESH(q.k); if (!m) continue; let done = false;
      // (to one side, then the other; a hand further along each time — up to most of a metre from the piece — where the first is taken)
      for (let step = 0; step < 8 && !done; step++) for (const sd of [side, -side]) {
        const a = sd * (cursor[sd] + step * 0.1 + m.w / 2); const n = -it.d / 2 + m.d / 2 + 0.02; const P = fr(a, n);
        const hw = Math.abs(m.w / 2 * c) + Math.abs(m.d / 2 * s), hd = Math.abs(m.w / 2 * s) + Math.abs(m.d / 2 * c);
        const r = [P[0] - hw, P[1] - hd, P[0] + hw, P[1] + hd];
        if (!floorFree(p, it.lv, r) || ctx.out.some(t => t.on === 'chao' && t.lv === it.lv && ovR(r, t.r || [t.x, t.z, t.x, t.z], 0.02))) continue;
        const t = ctx.put(q.k, P[0], l.y + FLOOR_UP, P[1], (it.ry || 0) + (q.ry || 0), Object.assign({ lv: it.lv, on: 'chao', it: null, key: `${it.id}/ao-lado/${q.key}`, why: q.why, c: q.c || null, sk: q.sk }, q.o || {}));
        if (t) t.r = r.map(r3); cursor[sd] += step * 0.1 + m.w + 0.04; side = sd; done = true; break;
      }
      if (!done) left.push(q);
    }
    return left;
  }
  // (beside the piece, or else against a wall near it)
  const near = (ctx, it, list) => byWall(ctx, it, beside(ctx, it, list));
  // ---- what stands on the floor against a wall near a piece, where nothing stands beside the piece itself: along the walls of its
  // storey, flush with a face clear of pieces, the nearest to the piece first — clear of the corridor, the doors, the stairs, where one
  // stands
  function byWall(ctx, it, list) {
    const { p } = ctx; if (!list.length) return []; const l = lvOf(p, it.lv); if (!l) return list;
    const R = runs(p, it.lv, 0.0, 0.5, ctx.look); const left = [];
    for (const q of list) {
      const m = MESH(q.k); if (!m) continue; let best = null, bd = 1e9;
      for (const r of R) for (let s = r.s0 + m.w / 2 + 0.03; s <= r.s1 - m.w / 2 - 0.03 + EPS; s += 0.1) {
        const x = r.x + r.tx * s + r.nx * (m.d / 2 + 0.02), z = r.z + r.tz * s + r.nz * (m.d / 2 + 0.02); const d = Math.hypot(x - it.x, z - it.z); if (d >= bd || d > 4) continue;
        const ry = Math.atan2(r.nx, r.nz); const c = Math.abs(Math.cos(ry)), sn = Math.abs(Math.sin(ry)); const hw = m.w / 2 * c + m.d / 2 * sn, hd = m.w / 2 * sn + m.d / 2 * c;
        const rr = [x - hw, z - hd, x + hw, z + hd]; if (!floorFree(p, it.lv, rr) || ctx.out.some(t => t.on === 'chao' && t.lv === it.lv && t.r && ovR(rr, t.r, 0.02))) continue;
        bd = d; best = { x, z, ry, rr };
      }
      if (!best) { left.push(q); continue; }
      const t = ctx.put(q.k, best.x, l.y + FLOOR_UP, best.z, best.ry + (q.ry || 0), Object.assign({ lv: it.lv, on: 'chao', key: `${it.id}/parede/${q.key}`, why: q.why, c: q.c || null, sk: q.sk }, q.o || {}));
      if (t) t.r = best.rr.map(r3);
    }
    return left;
  }
  // ---- what hangs: from pegs in a wall near the fire and the bar, else from the joists of a floor above them
  function hangFood(ctx, food) {
    const { b, p, W } = ctx; if (!ctx.near) return;
    const items = [];
    for (const k in HANG) { const q = food.get(k); if (!q) continue; const n = Math.min(3, Math.ceil(q.n / (k === 'horta' ? 1 : 1.5)));
      for (let i = 0; i < n; i++) { const kk = HANG[k][i % HANG[k].length]; if (kk) items.push({ k: kk, key: k + i, why: q.why }); } }
    for (const q of W.bens) if (q.como === 'presunto' || q.como === 'peixe-seco') for (let i = 0; i < Math.min(2, q.n); i++) items.push({ k: q.como, key: q.k + i, why: q.why });
    if (!items.length) return;
    // (near the fire and the bar first: the smoke cures what hangs over it)
    const lv = p.entryLv || 0;
    pendura(ctx, items, p.items.filter(it => it.lv === lv && (it.fire || it.kind === 'prateleira-bar' || it.kind === 'balcao' || it.kind === 'fogao' || it.kind === 'despensa')), { lv });
  }
  // ---- what hangs from a peg in a wall near some pieces (perto: within o.raio of the nearest — 4.5 m —, the nearest first), else —
  // o.teto, the default — from the joists of a floor above them: items [{ k, key, why }] on storey o.lv (the hall's), each with its peg,
  // clear of the openings and of what stands taller there; → what found no place. Two calls never take one place: the wall has an owner
  // (ctx.wallFree), a joist taken is kept (ctx.teto); o.tag names the keys of a call of its own (the tools of a trade on a wall: F7)
  function pendura(ctx, items, perto, o) {
    const { b, p } = ctx; o = o || {}; if (!items.length) return items;
    const lv = o.lv !== undefined ? o.lv : p.entryLv || 0; const l = lvOf(p, lv); if (!l) return items;
    const hot = perto || []; const raio = o.raio || 4.5; const tag = o.tag ? o.tag + '/' : ''; const used = ctx.teto || (ctx.teto = new Set());
    const dHot = (x, z) => hot.length ? Math.min(...hot.map(it => Math.hypot(x - it.x, z - it.z))) : 0;
    // the joists: points a hand from a wall under a floor above, low enough to reach, high over the heads and the pieces
    const spots = [];
    if (o.teto !== false) for (const r of runs(p, lv, 1.95, 2.0, ctx.look)) for (let s = r.s0 + 0.2; s <= r.s1 - 0.15; s += 0.42) {
      const x = r.x + r.tx * s + r.nx * 0.32, z = r.z + r.tz * s + r.nz * 0.32; const cy = ceilAt(p, l, x, z) - 0.05; if (!(cy - l.y >= 2.45 && cy - l.y <= 3.6)) continue;
      if (spots.some(q => Math.hypot(q.x - x, q.z - z) < 0.36)) continue; spots.push({ x, z, y: cy, kind: 'teto', ry: Math.atan2(r.nx, r.nz), d: dHot(x, z), at: `${r3(x)},${r3(z)}` });
    }
    // the pegs in a wall: 1.9 m up, clear of the openings and of what stands taller there
    const pegs = []; for (const r of runs(p, lv, 1.3, 1.95, ctx.look)) for (let s = r.s0 + 0.18; s <= r.s1 - 0.18; s += 0.38) { const x = r.x + r.tx * s, z = r.z + r.tz * s; const d = dHot(x, z); if (d < raio) pegs.push({ x, z, y: l.y + 1.92, kind: 'parede', r, ry: Math.atan2(r.nx, r.nz), d }); }
    // (the pegs first — what hangs there is seen against its wall, whatever the eye cuts away of a ceiling —, then the joists)
    const pool = pegs.sort((a, c) => a.d - c.d).concat(spots.sort((a, c) => a.d - c.d));
    let k = 0;
    for (let i = 0; i < items.length; i++) {
      const q = items[i]; const m = MESH(q.k); if (!m) continue; let at = null;
      while (k < pool.length && !at) { const s = pool[k++]; if (s.kind === 'teto' && (s.y - m.h - l.y < 1.95 || used.has(s.at))) continue; if (s.kind === 'parede' && !ctx.wallFree(s.x, s.z, Math.max(m.w, 0.12), s.y - m.h, s.y + 0.03)) continue; at = s; }
      if (at && at.kind === 'parede') ctx.wallTake(at.x, at.z, Math.max(m.w, 0.12), at.y - m.h, at.y + 0.03);
      if (!at) return items.slice(i);
      if (at.kind === 'teto') { used.add(at.at); ctx.put(q.k, at.x, at.y - m.h, at.z, at.ry + (hv(b, 60 + k) - 0.5) * 0.8, { lv, on: 'teto', key: `${tag}teto/${at.at}`, why: `${q.why} — pendurado nas vigas do soalho de cima` }); }
      else {
        const out = Math.max(0.06, m.d / 2 + 0.012); const x = at.x + at.r.nx * out, z = at.z + at.r.nz * out;
        ctx.put('cavilha', at.x + at.r.nx * 0.04, at.y - 0.015, at.z + at.r.nz * 0.04, at.ry, { lv, on: 'parede', key: `${tag}cavilha/${r3(at.x)},${r3(at.z)}`, why: 'a cavilha de onde pende' });
        ctx.put(q.k, x, at.y - m.h - 0.004, z, at.ry, { lv, on: 'parede', key: `${tag}pende/${r3(at.x)},${r3(at.z)}`, why: `${q.why} — pendurado na parede` });
      }
    }
    return [];
  }
  // ---- the marks of charcoal: on the walls by the tables, at the height of one sitting and drinking
  function marks(ctx) {
    const { b, p, W } = ctx; const n = W.rabiscos; if (!n || !ctx.near) return;
    const lv = p.entryLv || 0; const l = lvOf(p, lv); const tabs = p.items.filter(it => it.lv === lv && TABLES[it.kind]);
    const R = runs(p, lv, 0.95, 1.6, ctx.look).filter(r => r.s1 - r.s0 > 0.4);
    const slots = []; for (const r of R) for (let s = r.s0 + 0.2; s <= r.s1 - 0.2; s += 0.34) { const x = r.x + r.tx * s, z = r.z + r.tz * s; slots.push({ r, s, x, z, d: tabs.length ? Math.min(...tabs.map(t => Math.hypot(x - t.x, z - t.z))) : 0 }); }
    slots.sort((a, c) => a.d - c.d || hv(b, Math.round(a.s * 100)) - hv(b, Math.round(c.s * 100)));
    const kinds = ['rabisco-a', 'rabisco-b', 'rabisco-c', 'rabisco-d'];
    for (let i = 0, j = 0; i < n && j < slots.length; j++) {
      const s = slots[j]; const k = kinds[Math.floor(hv(b, 70 + i) * kinds.length)]; const m = MESH(k); if (!m) continue;
      const y = l.y + 1.0 + hv(b, 80 + i) * 0.38; const out = m.d / 2 + 0.002; if (!ctx.wallFree(s.x, s.z, m.w, y, y + m.h)) continue; ctx.wallTake(s.x, s.z, m.w, y, y + m.h); i++;
      ctx.put(k, s.x + s.r.nx * out, y, s.z + s.r.nz * out, Math.atan2(s.r.nx, s.r.nz), { lv, on: 'parede', key: `rabisco/${i}`, why: W.why.rabiscos });
    }
  }

  // ---- the house: the family's table, the food of the pantry, its goods, the cloth of a people that weaves
  const CORE = ['mesa-casa', 'mesa', 'mesa-baixa', 'esteira-comer', 'mesa-terreiro', 'bancada'];
  function house(ctx) {
    const { b, p, W, S } = ctx; const food = new Map(W.comida.map(q => [q.k, q]));
    // (the table the family eats at: the plan's core — D-196 —, a free top of it)
    let table = null; for (const k of CORE) { table = S.find(s => s.k === 'tampo' && s.it.kind === k); if (table) break; }
    if (table && ctx.near) {
      const L = [];
      const bread = W.comida.filter(q => q.pao); if (bread.length) L.push({ k: 'pao', key: 'pao', why: `pão: ${bread.map(q => q.k).join(' e ')} na despensa (G.Origem)` });
      const milho = food.get('milho'); if (milho) L.push({ k: 'tortilhas', key: 'tortilhas', why: milho.why });
      const dishK = ['arroz', 'fruta', 'ovos', 'horta', 'leite', 'cevada', 'sorgo', 'carne', 'peixe'].find(k => food.has(k));
      if (dishK) { const dsh = DISH[dishK]; L.push({ k: dsh[0], key: 'prato', why: `${food.get(dishK).why}: a comida da casa`, c: dsh[1] ? { comida: dsh[1] } : null }); }
      const cheese = W.bens.find(q => q.k === 'queijo'); if (cheese) L.push({ k: 'queijo', key: 'queijo', why: cheese.why });
      if (W.louca) for (let i = 0; i < Math.min(3, W.louca.n); i++) L.push({ k: cupOf(W), key: 'cup' + i, why: `a louça da casa (${W.louca.n} moradores): ${W.why.louca}`, c: { liquido: [42, 30, 24] }, gap: 0.02 });
      scatter(ctx, table, L);
    }
    // (the chest: the blankets folded on it, where the people weaves or the house has cloth)
    const chest = S.find(s => s.k === 'tampo' && s.it.kind === 'arca'); const tec = W.bens.find(q => q.k === 'tecido');
    if (chest && (tec || W.weave) && ctx.near) pack(ctx, chest.it, chest, [{ k: 'pano-dobrado', key: 'pano', why: tec ? tec.why : W.why.pano, sc: Math.min(1, (chest.w - 0.06) / 0.42) }], { room: chest.room, from: Math.max(0, (chest.w - 0.44) / 2) });
    // (the pots of the house's ware, the jars of its wine and oil and honey: by the fire on the floor)
    const fire = p.items.find(it => it.fire) || p.items.find(it => it.kind === 'arca' || it.kind === 'jarros');
    if (fire && ctx.near) {
      const L = [];
      for (const q of W.bens) { if (q.como === 'potes') for (let i = 0; i < Math.min(2, q.n); i++) L.push({ k: W.barro ? 'pote' : 'jarro-madeira', key: 'pote' + i, why: q.why, c: { liquido: [40, 30, 24] } });
        else if (q.como === 'anforeta' || q.como === 'pote') L.push({ k: W.barro ? q.como : 'jarro-madeira', key: q.k, why: q.why, c: { liquido: DRINK[q.k] || [40, 30, 24] } }); }
      const grain = W.comida.filter(q => ['trigo', 'cevada', 'sorgo', 'arroz', 'milho'].includes(q.k)).reduce((n, q) => n + q.n, 0);
      if (grain >= 1) L.push({ k: 'saco', key: 'saco', why: `o grão da despensa (${grain.toFixed(1)})`, sk: W.weave ? 'pano' : 'couro' });
      if (W.lenha && fire.fire && !p.items.some(it => it.kind === 'lenha')) L.unshift({ k: 'lenha', key: 'lenha', why: `a lenha do fogo: ${W.lenha.why}`, o: { st: 4 - W.lenha.q } });
      near(ctx, fire, L);
    }
    hearth(ctx, food, false); hangFood(ctx, food);
  }

  // ---- the lamps: on the tables with people at them in a tavern, on the counter; the family's table; a bench of work — lit with
  // someone awake inside in the dark (G.Atmos.within.luz), out otherwise; nothing where there is nothing to burn
  function lamps(ctx) {
    const { b, p, W, S } = ctx; const L = W.luz; if (!L) return;
    const kind = L.oleo && (!L.cera || hv(b, 11) < 0.6) ? 'lamparina' : L.cera ? 'vela' : null; if (!kind || !MESH(kind)) return;
    const why = `${kind === 'vela' ? 'uma vela de cera' : `uma lamparina de ${L.oleo}`}: ${L.why}`;
    // (as much of the candle as the night has left — its stage, cera0 whole … cera3 a stub —, the oil left in the lamp: D-749)
    const burn = kind === 'vela' ? { vs: Math.min(3, Math.floor((1 - L.vela) * 4 + 1e-6)) } : { oil: L.azeite };
    const spots = [];
    if (b.type === 'taverna') {
      if (ctx.tableGuests) for (const [s] of ctx.tableGuests) spots.push(s);
      const counter = S.find(s => s.k === 'tampo' && (s.it.kind === 'balcao' || s.it.kind === 'balcao-alvenaria')); if (counter) spots.push(counter);
    } else {
      let t = null; for (const k of CORE) { t = S.find(s => s.k === 'tampo' && s.it.kind === k); if (t) break; }
      if (t) spots.push(t);
    }
    // (the free point of each top nearest its middle: the lamp among the cups, never in one)
    // (on a counter, at one end of it — the keeper works the middle —; on a table, among the cups)
    for (const s of spots.slice(0, 8)) { const bar = s.it.kind === 'balcao' || s.it.kind === 'balcao-alvenaria'; const end = hv(b, 13) < 0.5 ? -1 : 1;
      scatter(ctx, s, [{ k: kind, key: 'luz', why, ry: (hv(b, 12 + s.it.k) - 0.5) * 2.4, at: bar ? [end * (s.w / 2 - 0.1), 0] : null, o: Object.assign({ lit: L.acesa ? 1 : 0, lmat: L.mat }, burn) }]); }
    // (and the lamps on the walls of a tavern's hall — the light of a room people sit in at night —: one for every eighteen square
    // metres of it, four at most, each on its little shelf a hand over the heads of who sits, clear of the windows, the doors and
    // what stands against the wall; the first by the tables, the others as far from each other as the walls allow)
    if (b.type !== 'taverna' || !MESH('suporte')) return;
    const lv = p.entryLv || 0; const l = lvOf(p, lv); const hall = p.rooms.filter(m => m.lv === lv && !m.open && !m.circ).sort((a, c) => (c.r[2] - c.r[0]) * (c.r[3] - c.r[1]) - (a.r[2] - a.r[0]) * (a.r[3] - a.r[1]))[0]; if (!l || !hall) return;
    const area = (hall.r[2] - hall.r[0]) * (hall.r[3] - hall.r[1]); const n = G.clamp(Math.round(area / 18), 1, 4);
    const tabs = p.items.filter(it => it.lv === lv && TABLES[it.kind]); const cand = [];
    for (const r of runs(p, lv, 1.3, 1.85, ctx.look)) for (let s = r.s0 + 0.15; s <= r.s1 - 0.15 + EPS; s += 0.25) { const x = r.x + r.tx * s, z = r.z + r.tz * s; if (!inR(hall.r, x, z, 0.4)) continue; cand.push({ r, x, z, d: tabs.length ? Math.min(...tabs.map(t => Math.hypot(t.x - x, t.z - z))) : 0 }); }
    const got = []; cand.sort((a, c) => a.d - c.d || hv(b, Math.round(a.x * 40 + a.z * 7)) - hv(b, Math.round(c.x * 40 + c.z * 7)));
    const lm = MESH(kind); const top = 1.45 + MESH('suporte').h + lm.h; for (let i = cand.length - 1; i >= 0; i--) if (!ctx.wallFree(cand[i].x, cand[i].z, 0.22, l.y + 1.42, l.y + top)) cand.splice(i, 1);
    while (got.length < n && cand.length) { let best = null, bs = -1; for (const q of cand) { const s = got.length ? Math.min(...got.map(g => Math.hypot(g.x - q.x, g.z - q.z))) : 1e9 - q.d; if (got.length && s < 2.4) continue; if (s > bs) { bs = s; best = q; } } if (!best) break; got.push(best); }
    const sm = MESH('suporte'); got.forEach((q, i) => {
      const ry = Math.atan2(q.r.nx, q.r.nz); const y = l.y + 1.45; const o = sm.d / 2 + 0.002; ctx.wallTake(q.x, q.z, 0.22, y - 0.03, l.y + top);
      ctx.put('suporte', q.x + q.r.nx * o, y, q.z + q.r.nz * o, ry, { lv, on: 'parede', key: `parede-luz/${i}`, why: `o suporte de uma lamparina do salão (${area.toFixed(0)} m²): ${L.why}` });
      ctx.put(kind, q.x + q.r.nx * (o + 0.012), y + sm.h, q.z + q.r.nz * (o + 0.012), ry, Object.assign({ lv, on: 'parede', key: `parede-luz/${i}/${kind}`, why, lit: L.acesa ? 1 : 0, lmat: L.mat }, burn));
    });
  }
  // ---- the cloth: the hanging on the wall behind the musician, the rug on his stage (a people that weaves; a house rich now); the
  // rug — or the pelt — of a rich house on its floor
  function cloth(ctx) {
    const { b, p, W, S } = ctx; const C = W.pano; if (!C) return;
    const lv = p.entryLv || 0; const l = lvOf(p, lv); if (!l) return;
    const stage = p.items.find(it => it.kind === 'estrado-musico');
    if (C.tapecaria && MESH('tapecaria')) {
      const R = runs(p, lv, 0.62, 1.98, ctx.look).filter(r => r.s1 - r.s0 >= 0.95); const at = stage ? [stage.x, stage.z] : null;
      const score = r => { const s = (r.s0 + r.s1) / 2; const x = r.x + r.tx * s, z = r.z + r.tz * s; return at ? Math.hypot(x - at[0], z - at[1]) : -(r.s1 - r.s0); };
      const r = R.sort((a, c) => score(a) - score(c))[0];
      if (r) { const w = Math.min(1.25, r.s1 - r.s0 - 0.1); let s = (r.s0 + r.s1) / 2; if (at) s = G.clamp((at[0] - r.x) * r.tx + (at[1] - r.z) * r.tz, r.s0 + w / 2, r.s1 - w / 2);
        const m = MESH('tapecaria'); const fx = r.x + r.tx * s, fz = r.z + r.tz * s; const x = fx + r.nx * (m.d / 2 + 0.004), z = fz + r.nz * (m.d / 2 + 0.004);
        if (ctx.wallFree(fx, fz, w, l.y + 0.64, l.y + 0.64 + m.h)) { ctx.wallTake(fx, fz, w, l.y + 0.64, l.y + 0.64 + m.h); ctx.put('tapecaria', x, l.y + 0.64, z, Math.atan2(r.nx, r.nz), { lv, on: 'parede', key: 'tapecaria', why: C.why, s: [w / m.w, 1, 1], pcor: C.cor }); } }
    }
    if (stage && W.weave && MESH('tapete')) { const top = S.find(s => s.it === stage && s.k === 'tampo'); const P = [stage.x, stage.z]; const y = top ? top.y : lvOf(p, stage.lv).y + (stage.y || 0) + FLOOR_UP + stage.h;
      ctx.put('tapete', P[0], y, P[1], stage.ry || 0, { lv: stage.lv, on: 'tampo', it: stage.id, key: 'tapete-estrado', why: `o tapete do músico: ${C.why}`, s: [(stage.w - 0.16) / 1.6, 1, (stage.d - 0.16) / 1.0], pcor: C.cor }); }
    // (a house's floor: where the family sits by the fire — the largest clear patch of the room with the fire, nearest its middle)
    if (C.tapete && b.type !== 'taverna' && ctx.near) {
      const fire = p.items.find(it => it.fire) || p.items[0]; if (!fire) return; const room = p.rooms.find(m => m.id === fire.room) || p.rooms[0]; if (!room) return;
      const r = room.r; const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2; let best = null, bd = 1e9;
      for (const sc of [1, 0.8, 0.65]) for (const turn of [0, 1]) { const w = (turn ? 1.0 : 1.6) * sc, d = (turn ? 1.6 : 1.0) * sc;
        for (let z = r[1] + d / 2 + 0.05; z <= r[3] - d / 2 - 0.05; z += 0.125) for (let x = r[0] + w / 2 + 0.05; x <= r[2] - w / 2 - 0.05; x += 0.125) {
          const q = [x - w / 2, z - d / 2, x + w / 2, z + d / 2]; if (p.items.some(it => it.lv === fire.lv && (it.fire ? ovR(q, it.r, 0.5) : rectsOf(it).some(rr => ovR(q, rr, 0.02))))) continue;
          if (p.stairs.some(st => (st.lv0 === fire.lv || st.lv1 === fire.lv) && ovR(q, st.r, 0.1))) continue;
          const C2 = G.Interiors.CELL; let ok = true; for (const [px, pz] of [[q[0] + 0.05, q[1] + 0.05], [q[2] - 0.05, q[1] + 0.05], [q[2] - 0.05, q[3] - 0.05], [q[0] + 0.05, q[3] - 0.05], [x, z]]) if (cellAt(p, fire.lv, px, pz) !== C2.FLOOR && cellAt(p, fire.lv, px, pz) !== C2.DOOR) ok = false; if (!ok) continue;
          const dd = Math.hypot(x - cx, z - cz) + (1 - sc) * 2; if (dd < bd) { bd = dd; best = { x, z, sc, turn }; } }
        if (best) break; }
      if (best) ctx.put('tapete', best.x, lvOf(p, fire.lv).y + FLOOR_UP + 0.001, best.z, best.turn ? HALF : 0, { lv: fire.lv, on: 'chao', key: 'tapete', why: C.why, s: [best.sc, 1, best.sc], pcor: C.cor, pele: C.pele });
    }
  }
  // ---- the cobwebs: in the top corners of the room where the fire is, of a building old and uncared for
  function webs(ctx) {
    const { b, p, W } = ctx; if (!W.teia || !ctx.near || !MESH('teia')) return;
    const lv = p.entryLv || 0; const l = lvOf(p, lv); const room = p.rooms.filter(m => m.lv === lv && !m.open && !m.circ).sort((a, c) => (c.r[2] - c.r[0]) * (c.r[3] - c.r[1]) - (a.r[2] - a.r[0]) * (a.r[3] - a.r[1]))[0]; if (!room || !l) return;
    const r = room.r; const cs = [[r[0], r[1], 0], [r[2], r[1], -HALF], [r[2], r[3], Math.PI], [r[0], r[3], HALF]]; const m = MESH('teia');
    const order = cs.map((c, i) => [c, hv(b, 100 + i)]).sort((a, c) => a[1] - c[1]);
    for (let i = 0; i < Math.min(W.teia.n, 4); i++) {
      const [c] = order[i]; const y = ceilAt(p, l, c[0] + (c[0] === r[0] ? 0.2 : -0.2), c[1] + (c[1] === r[1] ? 0.2 : -0.2)) - 0.01; if (!(y - l.y < 3.6 && y - l.y > 2.2)) continue;
      const cc = Math.cos(c[2]), sn = Math.sin(c[2]); const ox = m.w / 2, oz = m.d / 2; const x = c[0] + ox * cc + oz * sn, z = c[1] - ox * sn + oz * cc;
      ctx.put('teia', x, y - m.h, z, c[2], { lv, on: 'canto', key: `teia/${i}`, why: W.teia.why });
    }
  }

  // ------------------------------ the kit of the builders (F7) ------------------------------
  // the ways of putting things a builder has (each thing with its cause in `why`, never a draw: the place, the side, the turn by the
  // building's id — K.hv): K.pack (a row along a shelf or a top), K.scatter (about a top, each at the free point nearest its own),
  // K.beside / K.near / K.byWall (on the floor beside a piece, or against a wall near it), K.pendura (from the pegs of a wall near some
  // pieces, else the joists: the tools of a trade, what is cured), K.hangFood (the food of the store, by the fire and the bar), K.runs
  // (the free stretches of a storey's walls between two heights), K.ceilAt, K.floorFree, the plan's frame and cells; the cups, the
  // vessels and the dishes of each people (K.cupOf, K.vesselOf, K.vesselName, K.dishOf); and the builders of the tavern and of the house
  // (K.taverna, K.casa), for a use that is one of them and more (the palace: a house of who rules)
  const KIT = D.KIT = Object.freeze({ pack, scatter, beside, near, byWall, pendura, hangFood, runs, ceilAt, floorFree, surfaces, frame, lvOf, cellAt, inR, ovR, rectsOf, topOf,
    hv, r3, has: D.has, TABLES, CORE, FLOOR_UP, TAU, HALF, cupOf, vesselOf, vesselName, dishOf, DRINK, DISH, FRUIT, taverna: tavern, casa: house });
  D.builder('taverna', tavern);
  D.builder('casa', house);

  // ------------------------------ the lights ------------------------------
  // the lamps and candles lit, at the flame of each (its model's anchor), in the lot's frame: [{ x, y, z, cor, forca, raio, tremor,
  // why, kind, id }] — G.Luz3D bakes them with the others (P1)
  const LAMP = [1, 0.74, 0.44], CANDLE = [1, 0.8, 0.52];
  function lightsOf(ctx) {
    const out = [];
    for (const t of ctx.out) {
      if (!t.lit) continue; const m = MESH(t.k); const ak = t.vs ? 'chama' + t.vs : 'chama'; const a = m && ((m.anc || []).find(q => q.k === ak) || (m.anc || []).find(q => q.k === 'chama')); if (!a) continue;
      const c = Math.cos(t.ry), s = Math.sin(t.ry); const sx = t.s[0], sy = t.s[1], sz = t.s[2];
      const x = t.x + a.x * sx * c + a.z * sz * s, z = t.z - a.x * sx * s + a.z * sz * c, y = t.y + a.y * sy;
      const candle = t.k === 'vela';
      // (a lamp low on oil burns low: its light by what is left in it — D-749)
      const oil = candle || !Number.isFinite(t.oil) ? 1 : 0.45 + 0.55 * G.clamp(t.oil * 2.5, 0, 1);
      out.push({ x: r3(x), y: r3(y + 0.06), z: r3(z), cor: candle ? CANDLE : LAMP, forca: r3((candle ? 0.2 : 0.3) * oil), raio: r3((candle ? 3.5 : 4.5) * (0.7 + 0.3 * oil)), tremor: candle ? 0.07 : oil < 0.8 ? 0.09 : 0.05, why: t.why, kind: t.k, id: 'd:' + t.key });
    }
    return out;
  }
  // the lights a building's decoration has lit now — from the plan as the world has it now (G.Space.planMade: never one made for the
  // asking); G.Luz3D.sources asks it of every inside it bakes
  D.fontes = function (b) {
    const p = b && G.Space && G.Space.planMade ? G.Space.planMade(b) : null; if (!p) return [];
    return D.plan(b, p, nearOf(b)).fontes;
  };

  // ------------------------------ the drawing ------------------------------
  // (what each part of a thing is painted in: the building's people, what it has, the thing's own colours — [r, g, b] 0–255 and the
  // pattern of the stack — or null: a part not drawn)
  const PAT = () => (G.Build3D && G.Build3D.PAT) || {};
  function paintOf(part, t, W, look) {
    const civ = W.civ, MV = G.Movel3D; const wood = (MV && MV.WOOD && (MV.WOOD[civ] || MV.WOOD.classico)) || [[122, 88, 58], [88, 62, 42]]; const clay = (MV && MV.CLAY && (MV.CLAY[civ] || MV.CLAY.classico)) || [176, 102, 66];
    const own = t.c && t.c[part]; const tone = 0.92 + G.hash(Math.imul(t.key.length + 7, 131) + t.x * 977 + t.z * 31) * 0.14;
    const mul = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
    const metal = m => (m === 'ferro' ? [[62, 60, 58], 'iron'] : m === 'bronze' ? [[150, 108, 56], 'bronze'] : m === 'pedra' ? [[150, 146, 138], 'stone'] : [mul(clay, 0.9), 'barro']);
    switch (part) {
      case 'louca': return W.barro ? [mul(clay, tone), 'barro'] : [mul(wood[0], tone * 1.05), 'madeira'];
      case 'barro': return [mul(clay, tone), W.rico >= 2 && (civ === 'grego' || civ === 'romano') ? 'vidrado' : 'barro'];
      case 'tampa': return [civ === 'egipcio' ? [150, 120, 84] : [120, 92, 66], 'mud'];
      case 'madeira': return [mul(wood[0], tone), 'madeira'];
      case 'madeira2': return [mul(wood[1], tone), 'madeira2'];
      case 'pano': { if (t.pele) return [[130, 96, 66], 'fur']; if (!W.weave) return [[150, 116, 82], 'fur']; const c = t.pcor ? G.hex2rgb(t.pcor) : null; return t.k === 'tapete' || t.k === 'tapecaria' ? [c ? mul(c, 1.25) : civ === 'nordico' ? [170, 152, 126] : [206, 192, 164], 'tapete'] : [civ === 'nordico' ? [170, 152, 126] : [214, 204, 182], civ === 'nordico' ? 'wool' : 'linen']; }
      case 'pano2': { if (t.pele) return [[96, 70, 48], 'fur']; if (!W.weave) return [[128, 96, 66], 'fur']; const L = (MV && MV.PAINT && (MV.PAINT[civ] || MV.PAINT.classico)) || ['#8a4a2a']; const c = t.pcor ? G.hex2rgb(t.pcor) : G.hex2rgb(L[Math.floor(G.hash(((look && look.id) | 0) * 13 + 5) * L.length) % L.length]); return [mul(c, 0.9), 'wool']; }
      case 'corda': return [[150, 118, 74], 'rope'];
      case 'palha': return [civ === 'egipcio' ? [182, 160, 104] : [190, 160, 100], 'wicker'];
      case 'saco': return t.sk === 'couro' ? [[120, 84, 52], 'leather'] : [[168, 140, 100], 'canvas'];
      case 'comida': return [own || [168, 112, 60], 0];
      case 'conteudo': return [own || [176, 54, 44], 0];
      case 'liquido': return [own || [42, 30, 24], 0];
      case 'pao': return [t.k === 'tortilhas' ? [218, 186, 116] : [178, 118, 58], 0];
      case 'carne': return [[142, 62, 44], 0];
      case 'peixe': return [[156, 134, 102], 0];
      case 'alho': return [[228, 220, 202], 0];
      case 'erva': return [[86, 112, 50], 0];
      case 'milho': return [[218, 162, 42], 0];
      case 'cabaca': return [[176, 140, 80], 0];
      case 'queijo': return [[224, 186, 98], 0];
      case 'lampada': { const q = metal(t.lmat); return [q[0], q[1]]; }
      case 'castical': return t.lmat === 'pedra' ? [mul(wood[1], 1), 'madeira2'] : metal(t.lmat);
      case 'cera': return [[234, 220, 182], 0];
      case 'panela': { const q = metal(t.pmat || (W.metal || 'barro')); return [mul(q[0], 0.8), q[1]]; }
      case 'ferro': return W.metal ? metal(W.metal) : [[138, 112, 74], 'wicker']; // (the hoops of a jug of staves: withies where there is no metal)
      case 'carvao': return [[30, 28, 26], 0];
      case 'teia': return [[196, 196, 190], 0];
      // (what is served, the marks of the night — D-748, D-749: the dish's own colours are in its points, the part painted white)
      case 'resto': case 'osso': case 'giz': case 'nv': case 'flor': case 'pinta': return [[255, 255, 255], 0];
      // (the fourth wave's — T7: a die of bone or of wood, the cup of turned wood or of leather, the tablets of the game of cards — their
      // backs in the people's colour, their faces and edges the stuff they are made of)
      case 'dado': return t.dmat === 'madeira' ? [mul(wood[0], 1.25), 'madeira'] : [[232, 220, 194], 0];
      case 'copo': return W.couro ? [[108, 72, 44], 'leather'] : [mul(wood[1], 1.1), 'madeira2'];
      case 'verso': { const L = (MV && MV.PAINT && (MV.PAINT[civ] || MV.PAINT.classico)) || ['#7a2a1e']; return [G.hex2rgb(L[0]), 0]; }
      case 'face': return [CARTA[t.cmat] ? CARTA[t.cmat][0] : CARTA.madeira[0], 0];
      case 'borda': return [CARTA[t.cmat] ? CARTA[t.cmat][1] : CARTA.madeira[1], t.cmat === 'barro' ? 'barro' : t.cmat === 'madeira' || t.cmat === 'cera' ? 'madeira' : 0];
      case 'mancha': return [mul(wood[0], 0.8), 'madeira']; // (a ring the wood drank: darker, never a drawn line)
      case 'ardosia': return [[56, 60, 62], 'slab'];
      case 'tinta': { const L = (MV && MV.PAINT && (MV.PAINT[civ] || MV.PAINT.classico)) || ['#7a2a1e']; return [G.hex2rgb(L[0]), 0]; }
      case 'tinta2': { const L = (MV && MV.PAINT && (MV.PAINT[civ] || MV.PAINT.classico)) || ['#7a2a1e', '#c9a24a']; return [G.hex2rgb(L[1] || '#c9a24a'), 0]; }
    }
    if (part.startsWith('x-')) return [[255, 255, 255], 0];
    if (STG.test(part)) {
      const s = STG.exec(part)[1]; if (s === 'cera') return [[234, 220, 182], 0];
      if (s === 'f') return [FRUIT[civ] || FRUIT.classico, 0];
      return [[255, 255, 255], 0];
    }
    return null; // (a part with no paint of its own is not drawn — never painted as wood by default: qa/dentro.js d8 asks each one)
  }
  // (for the proofs: whether a part of the vocabulary has its paint — the steam and the words are drawn apart)
  D.paintable = pt => pt === 'vapor' || pt === 'escrita' || !!paintOf(pt, { k: '', key: '', x: 0, z: 0, c: null }, { civ: 'classico', barro: true, weave: true, rico: 1, metal: 'ferro' }, null);
  // (near: the inside the body is in, or at its door, with the qualities that carry detail — every thing; the others open round it,
  // only the lamps and the cloth)
  function nearOf(b) {
    const R = G.Realm; const q = R && R.Q ? R.Q() : null; if (q && !q.detail) return false;
    const v0 = G.Possess && G.Possess.body ? G.Possess.body() : null; if (!v0) return true;
    if (v0.inside === b.id) return true; const L = G.Space.TILE; const X = v0.x * L, Z = v0.y * L;
    return Math.hypot(Math.max(b.x * L - X, 0, X - (b.x + b.w) * L), Math.max(b.y * L - Z, 0, Z - (b.y + b.h) * L)) < 3;
  }
  D.near = nearOf;
  // (which parts of a thing show now — D-748: bN a bite, there while fewer than N quarters are eaten; fN the same, the fruit; nN a
  // level, only at stage N; rN a remains, once N quarters are gone; e0 / e1 a beer's head, fresh and settled, at the full level;
  // ceraN the candle, as much of it as the night has left; nv the level that goes down — one surface, set at the stage's height and
  // width by the model's niv (levelAt). The steam and the words are drawn apart, by their own light)
  const STG = /^([bfnre]|cera)(\d)$/;
  function shows(pt, t) {
    if (pt === 'vapor' || pt === 'escrita') return false; if (pt === 'nv') return (t.st | 0) < 4;
    if (pt.startsWith('x-')) return !t.de || t.de.includes(pt); // (a part of the feast's platter: there where the recipe spent it, T7)
    const m = STG.exec(pt); if (!m) return true; const n = +m[2], s = t.st | 0;
    switch (m[1]) { case 'b': case 'f': return s < n; case 'n': return s === n; case 'r': return s >= n; case 'e': return s === 0 && (n === 0) === !!t.fresco; default: return n === (t.vs | 0); }
  }
  D.shows = shows;
  // (the level of a broth at a stage: its model's own drop and narrowing about its axis — a matrix in the model's frame, column-major —,
  // and that matrix after the thing's: e × level)
  D.levelAt = function (name, st) {
    const d = G.MESH3D && G.MESH3D[name]; const nv = d && d.niv; const k = nv && nv.k[Math.min(3, st | 0)]; if (!k) return null;
    const c = nv.c, sc = k[1]; return [sc, 0, 0, 0, 0, 1, 0, 0, 0, 0, sc, 0, c[0] - sc * c[0], k[0], c[1] - sc * c[1], 1];
  };
  const mul4 = (a, b) => { const o = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; };
  // the instanced meshes of a plan's things: one a thing's model, part and pattern — [{ name, pt, pat, list: [[matrix 16, colour]] }],
  // and, apart, the steam of the hot plates (.steam: [{ name, e, t0 }]) and the boards at the door with their words (.words)
  function groupsOf(pl, b, at, lod) {
    const W = G.Atmos.within(b); const look = G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null; const R3 = G.Realm; const P = PAT();
    const groups = new Map(); const X0 = at[0], Y0 = at[1], Z0 = at[2]; const steam = [], words = [];
    for (const t of pl.list) {
      const base = NAME(t.k); const name = base + (lod && G.MESH3D[base + '@1'] ? '@1' : ''); const parts = G.Mesh3D ? G.Mesh3D.parts(base) : [];
      const m = R3.mat(X0 + t.x, Y0 + t.y, Z0 + t.z, t.ry, t.s[0], t.s[1], t.s[2]); const e0 = Array.from(m.elements); const e = t.pre ? mul4(e0, t.pre) : e0; // (a die on its face: T7)
      for (const pt of parts) { if (!shows(pt, t)) continue; const pp = paintOf(pt, t, W, look); if (!pp) continue; const pat = P[pp[1]] || 0; const key = name + '/' + pt + '/' + pat;
        const lv = pt === 'nv' ? D.levelAt(base, t.st) : null;
        let g = groups.get(key); if (!g) groups.set(key, g = { name, pt, pat, list: [] }); g.list.push([lv ? mul4(e, lv) : e, pp[0]]); }
      if (t.quente && parts.includes('vapor')) steam.push({ name, e, t0: t.t0 || 0 });
      if (t.lousa && parts.includes('escrita')) words.push({ name, e, t });
    }
    const out = [...groups.values()]; out.steam = steam; out.words = words; return out;
  }
  D.groupsOf = groupsOf; // (for the proofs)
  // ---- the steam (D-748): a hot plate's wisps — lit by nothing, added to what is behind them, as bright as the plate is hot (the
  // time since it came from the fire, of At.COOL), their noise rising. One material for all, its noise made once (the hash, no chance)
  let STEAM = null;
  function steamMat(THREE) {
    if (STEAM) return STEAM;
    const N = 64, data = new Uint8Array(N * N * 4); const cell = (i, j, f, s) => G.hash(((i % f) + f) % f + (((j % f) + f) % f) * 97 + s * 7919);
    const noise = (x, y, f, s) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j; const a = u * u * (3 - 2 * u), c = v * v * (3 - 2 * v);
      return (cell(i, j, f, s) * (1 - a) + cell(i + 1, j, f, s) * a) * (1 - c) + (cell(i, j + 1, f, s) * (1 - a) + cell(i + 1, j + 1, f, s) * a) * c; };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      // (wisps: the noise's tops only, faded to nothing at the ribbon's two edges — the texture's sides —, the fade up it in the points)
      const v = noise(i / N * 4, j / N * 4, 4, 1) * 0.6 + noise(i / N * 8, j / N * 8, 8, 2) * 0.4; const x = Math.round(255 * G.clamp((v - 0.42) * 2.4, 0, 1) * Math.pow(Math.sin(Math.PI * (i + 0.5) / N), 1.2));
      const k = (j * N + i) * 4; data[k] = data[k + 1] = data[k + 2] = x; data[k + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat); tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.RepeatWrapping; tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
    STEAM = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    return STEAM;
  }
  const STEAM_K = 0.14; // (how bright the steam of a plate just served is: a breath over it, never a glow — the bloom of the 3D adds to it)
  const heatOf = t0 => { const h = 1 - (G.S.clock - t0) / ((G.Atmos && G.Atmos.COOL) || 6); return h > 0 ? STEAM_K * Math.pow(Math.min(1, h), 0.7) : 0; };
  // ---- the words at the door (D-749): what the board says, in the tavern's words — the dish of the day by the part of the food it is
  // made of, what it pours —, from the cause within says (the menu's reading); and their picture: chalk on the slate and the board
  // (the strokes worn, the old words rubbed out under them), paint on the plaque. Kept a few, by what they say
  const LABEL = { peixe: 'Peixe do dia', marisco: 'Mariscos', carne: 'Carne na brasa', arroz: 'Arroz', trigo: 'Pão e caldo', cevada: 'Caldo de cevada', milho: 'Tortilhas',
    sorgo: 'Mingau de sorgo', horta: 'Sopa da horta', ovos: 'Ovos cozidos', leite: 'Coalhada', fruta: 'Frutas', mel: 'Pão com mel', azeite: 'Pão com azeite', provisao: 'Prato do dia', '?': 'Prato do dia' };
  const POUR = { cerveja: 'Cerveja', vinho: 'Vinho', mel: 'Hidromel', pulque: 'Pulque' };
  D.words = L => { if (!L) return []; const out = ['Hoje']; out.push(L.prato ? LABEL[L.prato.de] || L.prato.nome : 'Sem comida');
    const d = (L.bebidas || []).map(k => POUR[k] || k); if (d.length) out.push(d.join(' · ')); if (!L.prato && !d.length) out.splice(1, 1, 'Volte amanhã'); return out; };
  const wordTex = new Map();
  function wordsOf(THREE, b, w) {
    const lines = D.words(w.t.lousa); const key = b.id + '|' + w.t.k + '|' + lines.join('|'); let got = wordTex.get(key); if (got) return got;
    const doc = typeof document !== 'undefined' ? document : null; if (!doc || !doc.createElement) return null;
    const geo = G.Movel3D.partGeo(w.name, 'escrita', 0); if (!geo) return null; if (!geo.boundingBox) geo.computeBoundingBox(); const bb = geo.boundingBox;
    const gw = bb.max.x - bb.min.x, gh = bb.max.y - bb.min.y; const S = 640 / Math.max(gw, gh); const cw = Math.round(gw * S), ch = Math.round(gh * S);
    const cv = doc.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext && cv.getContext('2d'); if (!g) return null;
    const paint = w.t.k === 'placa'; const hb = k => G.hash(Math.imul((b.id | 0) + 7, 131) + k * 977);
    const fit = (txt, px, font) => { let s = px; g.font = font(s); while (s > 10 && g.measureText(txt).width > cw * 0.86) { s -= 2; g.font = font(s); } return s; };
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (!paint) {
      // (the slate rubbed and written again: the ghost of other days' words under the chalk, blurred by the cloth — the house's own
      // dishes of other days, by its id —, then today's)
      const ghost = Object.values(LABEL); g.save(); if ('filter' in g) g.filter = 'blur(7px)'; g.fillStyle = 'rgba(226,224,216,0.05)';
      for (let i = 0; i < 4; i++) { g.font = `italic 600 ${Math.round(ch * (0.09 + 0.05 * hb(i + 40)))}px Nunito, cursive`; g.fillText(ghost[Math.floor(hb(i + 50) * ghost.length) % ghost.length], cw * (0.3 + 0.4 * hb(i + 60)), ch * (0.15 + 0.7 * hb(i + 70))); }
      g.restore();
      const ys = lines.length === 3 ? [0.2, 0.5, 0.79] : [0.25, 0.6]; const sz = [0.12, 0.17, 0.1];
      lines.forEach((txt, i) => { const font = s => `italic ${i === 1 ? 700 : 600} ${s}px Nunito, 'Segoe Print', 'Comic Sans MS', cursive`; fit(txt, Math.round(ch * sz[Math.min(i, 2)]), font);
        g.save(); g.translate(cw / 2, ch * ys[i]); g.rotate((hb(30 + i) - 0.5) * 0.06); g.fillStyle = 'rgba(240,238,228,0.93)'; g.fillText(txt, 0, 0);
        if (i === 0) { const tw = g.measureText(txt).width; g.fillRect(-tw / 2, ch * 0.06, tw, Math.max(2, ch * 0.008)); } g.restore(); });
      // (the chalk's grain: the strokes broken where the slate shows through)
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,0.75)';
      for (let i = 0; i < 2600; i++) { const x = hb(100 + i) * cw, y = hb(5000 + i) * ch, r = 0.6 + hb(9000 + i) * 1.4; g.fillRect(x, y, r, r); }
      g.globalCompositeOperation = 'source-over';
    } else {
      // (the plaque's letters painted: the people's gold on its colour, a dark edge to each)
      const ys = lines.length === 3 ? [0.19, 0.5, 0.8] : [0.26, 0.64]; const sz = [0.13, 0.2, 0.12];
      lines.forEach((txt, i) => { const font = s => `${i === 1 ? 700 : 600} ${s}px Georgia, 'Times New Roman', serif`; fit(txt, Math.round(ch * sz[Math.min(i, 2)]), font);
        g.lineWidth = Math.max(2, ch * 0.012); g.strokeStyle = 'rgba(30,18,10,0.75)'; g.strokeText(txt, cw / 2, ch * ys[i]); g.fillStyle = i === 1 ? '#f2dca0' : '#e8d6aa'; g.fillText(txt, cw / 2, ch * ys[i]); });
    }
    const tex = new THREE.CanvasTexture(cv); if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false });
    got = { tex, mat }; wordTex.set(key, got);
    // (a few kept; the oldest given back)
    while (wordTex.size > 6) { const k0 = wordTex.keys().next().value; const o0 = wordTex.get(k0); wordTex.delete(k0); o0.tex.dispose(); o0.mat.dispose(); }
    return got;
  }
  G.worldHooks.push(() => { for (const o of wordTex.values()) { o.tex.dispose(); o.mat.dispose(); } wordTex.clear(); });
  const DRAWN = new WeakMap(); // (an inside open → what of it is drawn: its group, its meshes, its signature)
  // draw the things of an inside open (o: Build3D's record of it — its building, its plan, its material, its shade) into the group
  // of its furniture; their meshes added to the furniture's, so they go when the furniture goes
  D.draw = function (o, grp, meshes) {
    if (!o || !o.b || !o.p || !grp || !G.MESH3D || !G.Mesh3D || !G.Movel3D || !G.Movel3D.partGeo) return;
    const THREE = (G.Realm && G.Realm.three && G.Realm.three()) || window.THREE; if (!THREE) return;
    const near = nearOf(o.b); const pl = D.plan(o.b, o.p, near); const at = o.out && o.out.at ? o.out.at : [o.b.x * G.Space.TILE, G.Space.plinth(o.b).y0, o.b.y * G.Space.TILE];
    const dg = new THREE.Group(); dg.matrixAutoUpdate = false; dg.name = 'dentro'; const mine = [], steam = [], words = [];
    const MT = new THREE.Matrix4(), CL = new THREE.Color(); const GR = groupsOf(pl, o.b, at, near ? 0 : 1);
    for (const g of GR) {
      const geo = G.Movel3D.partGeo(g.name, g.pt, g.pat); if (!geo) continue;
      const m = new THREE.InstancedMesh(geo, o.MI, g.list.length); m.name = 'dentro:' + g.name + '/' + g.pt; m.receiveShadow = true; if (o.shade) o.shade(m); m.matrixAutoUpdate = false;
      g.list.forEach(([e, col], k) => { MT.fromArray(e); m.setMatrixAt(k, MT); const L = G.Realm.lin(col); m.setColorAt(k, CL.setRGB(L[0], L[1], L[2])); });
      m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.computeBoundingSphere(); dg.add(m); mine.push(m);
    }
    // (the steam: one mesh a model, an instance a plate, its brightness each frame — D.step)
    const byName = new Map(); for (const s of GR.steam) { let L = byName.get(s.name); if (!L) byName.set(s.name, L = []); L.push(s); }
    for (const [name, L] of byName) { const geo = G.Movel3D.partGeo(name, 'vapor', 0); if (!geo) continue;
      const m = new THREE.InstancedMesh(geo, steamMat(THREE), L.length); m.name = 'dentro:vapor/' + name; m.matrixAutoUpdate = false; m.renderOrder = 3; m.frustumCulled = false;
      L.forEach((s, k) => { MT.fromArray(s.e); m.setMatrixAt(k, MT); const h = heatOf(s.t0); m.setColorAt(k, CL.setRGB(h, h, h)); });
      m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; dg.add(m); mine.push(m); steam.push({ m, t0: L.map(s => s.t0) }); }
    // (the words on a board: its own picture, a mesh of its own)
    for (const w of GR.words) { const tw = wordsOf(THREE, o.b, w); const geo = G.Movel3D.partGeo(w.name, 'escrita', 0); if (!tw || !geo) continue;
      const m = new THREE.Mesh(geo, tw.mat); m.name = 'dentro:escrita/' + w.name; m.matrixAutoUpdate = false; m.matrix.fromArray(w.e); m.renderOrder = 2; dg.add(m); words.push(m); }
    grp.add(dg); if (meshes) for (const m of mine) meshes.push(m);
    DRAWN.set(o, { grp: dg, parent: grp, meshes: mine, list: meshes || null, sig: pl.sig, near, t: G.S.clock, n: pl.list.length, steam, words });
  };
  // each frame, the steam of the hot plates of an inside open rising and fading as they cool; once a second of the world, the things
  // drawn again — only them — when their cause has changed (the signature), or the body came near or went (the level of what is drawn)
  D.step = function (o) {
    const d = o && DRAWN.get(o); if (!d) return;
    if (d.steam.length && STEAM) {
      const now = (typeof performance !== 'undefined' ? performance.now() : 0) / 1000; STEAM.map.offset.set(Math.sin(now * 0.6) * 0.05, -((now * 0.11) % 1));
      const THREE = (G.Realm && G.Realm.three && G.Realm.three()) || window.THREE; const CL = d.CL || (d.CL = new THREE.Color());
      for (const s of d.steam) { s.t0.forEach((t0, k) => { const h = heatOf(t0); s.m.setColorAt(k, CL.setRGB(h, h, h)); }); if (s.m.instanceColor) s.m.instanceColor.needsUpdate = true; }
    }
    if (!o.items || d.parent !== o.items.grp || Math.abs(G.S.clock - d.t) < 1) return; d.t = G.S.clock;
    const near = nearOf(o.b); if (d.sig === D.sig(o.b, o.p) + (near ? '' : '#far') && d.near === near) return;
    d.parent.remove(d.grp); for (const m of d.meshes) { m.dispose(); if (d.list) { const i = d.list.indexOf(m); if (i >= 0) d.list.splice(i, 1); } }
    D.draw(o, d.parent, d.list);
  };
  // (for the proofs: what is drawn of an inside open — its things and its signature, its steam and its boards)
  D.drawn = o => { const d = o && DRAWN.get(o); return d ? { sig: d.sig, n: d.n, near: d.near, meshes: d.meshes.length, steam: d.steam.reduce((n, s) => n + s.t0.length, 0), heat: d.steam.length ? d.steam.map(s => s.t0.map(heatOf)) : [], words: d.words.length } : null; };
  // what a person holds of a tavern's now, as the 3D draws it in the hands (the front P6: the cup the keeper carries, the cup a guest
  // drinks from, the plate the body holds) — { name (the model: 'comida-<prato>', 'bebida-<bebida>'), parts (those that show now),
  // paint(part) → [rgb 0–255, pattern], level(part) → the matrix of the part in the model's frame (the broth's level that goes down:
  // put after the thing's own), st, fresco, quente, t0, why }; null when it holds nothing of a tavern's. Only reads
  D.served = function (v) {
    const s = G.Atmos && G.Atmos.serving ? G.Atmos.serving(v) : null; if (!s) return null; const b = G.S.buildings.get(s.b); if (!b) return null;
    const W = G.Atmos.within(b); const look = G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null;
    const name = s.k === 'food' ? dishOf(s.prato) : vesselName(W, s.k); const t = { k: name, key: 'mao/' + v.id, x: 0, z: 0, st: s.st, fresco: s.fresco, c: null };
    const parts = (G.Mesh3D ? G.Mesh3D.parts(name) : []).filter(pt => shows(pt, t));
    return { name, parts, paint: pt => { const pp = paintOf(pt, t, W, look); return pp ? [pp[0], (PAT()[pp[1]] || 0)] : null; }, level: pt => (pt === 'nv' ? D.levelAt(name, s.st) : null), st: s.st, fresco: s.fresco, quente: s.quente, t0: s.t0, why: s.why };
  };
  // the keeper's cloth over his shoulder, for the drawing of the body (the front P6): { name, parts, paint(part), why } for the keeper of
  // a tavern whose people weaves, at his counter now (G.Atmos.within's ombro); null otherwise. Only reads
  D.ombro = function (v) {
    const b = v && v.job ? G.S.buildings.get(v.job) : null; if (!b || b.type !== 'taverna' || !G.Atmos || !G.Atmos.within) return null;
    const W = G.Atmos.within(b); if (!W.ombro || W.ombro.id !== v.id) return null; const look = G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null;
    const name = NAME('pano-ombro'); const t = { k: 'pano-ombro', key: 'ombro/' + v.id, x: 0, z: 0, c: null };
    return { name, parts: G.Mesh3D ? G.Mesh3D.parts(name) : [], paint: pt => { const pp = paintOf(pt, t, W, look); return pp ? [pp[0], (PAT()[pp[1]] || 0)] : null; }, why: W.ombro.why };
  };
})(window.G = window.G || {});
