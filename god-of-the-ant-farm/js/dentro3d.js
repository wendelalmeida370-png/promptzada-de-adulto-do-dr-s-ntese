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
//     draws them again only when their cause changes.
//  Nothing here touches the world, nor draws on any chance.
// ============================================================
(function (G) {
  const D = G.Dentro3D = {};
  const TAU = Math.PI * 2, HALF = Math.PI / 2, EPS = 1e-6;
  const FLOOR_UP = 0.012; // (the floor a hair over the plinth's top — Build3D's: what stands on it stands on that)
  const MESH = k => (G.MESH3D ? G.MESH3D['deco-' + k] : null);
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
  function build(ctx) {
    const { b, p } = ctx; ctx.S = surfaces(p, ctx.look);
    if (b.type === 'taverna') tavern(ctx);
    else if (G.Village.bedsOf(b) > 0) house(ctx);
    cloth(ctx); lamps(ctx); webs(ctx);
  }

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
    // the marks of charcoal of the customers of years, on the walls by the tables
    marks(ctx);
  }

  // ---- the tables: what was served each who sits at one, by their place (In.placeOf)
  function tables(ctx) {
    const { b, p, W, S } = ctx; const tops = S.filter(s => s.k === 'tampo' && TABLES[s.it.kind] && s.it.kind !== 'arca');
    const byTable = new Map();
    for (const q of W.mesa) {
      const v = G.S.villagers.get(q.id); const pl = v && G.Interiors.placeOf ? G.Interiors.placeOf(v) : null; if (!pl || !Number.isFinite(pl.x)) continue;
      let best = null, bd = 1.1; for (const s of tops) { if (s.lv !== pl.lv) continue; const r = s.it.r; const d = Math.hypot(Math.max(r[0] - pl.x, 0, pl.x - r[2]), Math.max(r[1] - pl.z, 0, pl.z - r[3])); if (d < bd) { bd = d; best = s; } }
      if (!best) continue; let e = byTable.get(best); if (!e) byTable.set(best, e = []); e.push({ q, pl });
    }
    ctx.tableGuests = byTable;
    for (const [s, guests] of byTable) {
      const it = s.it; const c = Math.cos(it.ry || 0), sn = Math.sin(it.ry || 0); const taken = [];
      for (const { q, pl } of guests) {
        // (the guest's point in the table's frame, brought onto its top a hand in from the edge)
        const dx = pl.x - it.x, dz = pl.z - it.z; let a = dx * c - dz * sn, n = dx * sn + dz * c;
        const ha = s.w / 2 - 0.11, hn = s.d / 2 - 0.11; const out = Math.max(Math.abs(a) / Math.max(ha, 0.01), Math.abs(n) / Math.max(hn, 0.01));
        if (out > 1) { a /= out; n /= out; } else { if (Math.abs(a) / ha > Math.abs(n) / hn) a = Math.sign(a || 1) * ha; else n = Math.sign(n || 1) * hn; }
        const toward = Math.atan2(-a, -n); // (facing the table's middle)
        const put = (k, a2, n2, cc, why, key) => {
          for (const t of taken) if (Math.hypot(t[0] - a2, t[1] - n2) < 0.14) { a2 += 0.12 * Math.sign(a2 - t[0] || 1); }
          a2 = G.clamp(a2, -ha, ha); n2 = G.clamp(n2, -hn, hn); taken.push([a2, n2]);
          const P = frame(it)(a2 + s.x, n2 + s.z); ctx.put(k, P[0], s.y, P[1], (it.ry || 0) + toward, { lv: it.lv, on: 'tampo', it: it.id, key: `${it.id}/mesa/${q.id}/${key}`, why, c: cc });
        };
        // (the plate before them, the cup to one side of it)
        if (q.prato) { const dsh = DISH[q.prato] || DISH['?']; const k = dsh[0] === 'tortilhas' && !MESH('tortilhas') ? 'tigela' : dsh[0]; put(k, a * 0.82, n * 0.82, dsh[1] ? { comida: dsh[1] } : null, q.why, 'prato'); }
        if (q.cup) { const side = hv(b, q.id) < 0.5 ? -1 : 1; const ta = Math.abs(n) >= Math.abs(a) ? 1 : 0; put(cupOf(W), a + (ta ? side * 0.17 : 0), n + (ta ? 0 : side * 0.17), { liquido: DRINK[q.cup] || DRINK.cerveja }, q.why, 'caneca'); }
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
      if (wood && W.lenha && ctx.near) near(ctx, it, [{ k: 'lenha', key: 'lenha', why: `a lenha do fogo: ${W.lenha.why}` }]);
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
        const t = ctx.put(q.k, P[0], l.y + FLOOR_UP, P[1], (it.ry || 0) + (q.ry || 0), { lv: it.lv, on: 'chao', it: null, key: `${it.id}/ao-lado/${q.key}`, why: q.why, c: q.c || null, sk: q.sk });
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
      const t = ctx.put(q.k, best.x, l.y + FLOOR_UP, best.z, best.ry + (q.ry || 0), { lv: it.lv, on: 'chao', key: `${it.id}/parede/${q.key}`, why: q.why, c: q.c || null, sk: q.sk });
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
    const lv = p.entryLv || 0; const l = lvOf(p, lv); if (!l) return;
    // (near the fire and the bar first: the smoke cures what hangs over it)
    const hot = p.items.filter(it => it.lv === lv && (it.fire || it.kind === 'prateleira-bar' || it.kind === 'balcao' || it.kind === 'fogao' || it.kind === 'despensa'));
    const dHot = (x, z) => hot.length ? Math.min(...hot.map(it => Math.hypot(x - it.x, z - it.z))) : 0;
    // the joists: points a hand from a wall under a floor above, low enough to reach, high over the heads and the pieces
    const R = runs(p, lv, 1.95, 2.0, ctx.look); const spots = [];
    for (const r of R) for (let s = r.s0 + 0.2; s <= r.s1 - 0.15; s += 0.42) {
      const x = r.x + r.tx * s + r.nx * 0.32, z = r.z + r.tz * s + r.nz * 0.32; const cy = ceilAt(p, l, x, z) - 0.05; if (!(cy - l.y >= 2.45 && cy - l.y <= 3.6)) continue;
      if (spots.some(q => Math.hypot(q.x - x, q.z - z) < 0.36)) continue; spots.push({ x, z, y: cy, kind: 'teto', ry: Math.atan2(r.nx, r.nz), d: dHot(x, z) });
    }
    // the pegs in a wall: 1.9 m up, clear of the openings and of what stands taller there
    const pegs = []; for (const r of runs(p, lv, 1.3, 1.95, ctx.look)) for (let s = r.s0 + 0.18; s <= r.s1 - 0.18; s += 0.38) { const x = r.x + r.tx * s, z = r.z + r.tz * s; const d = dHot(x, z); if (d < 4.5) pegs.push({ x, z, y: l.y + 1.92, kind: 'parede', r, ry: Math.atan2(r.nx, r.nz), d }); }
    // (the pegs first — what hangs there is seen against its wall, whatever the eye cuts away of a ceiling —, then the joists)
    const pool = pegs.sort((a, c) => a.d - c.d).concat(spots.sort((a, c) => a.d - c.d));
    let k = 0;
    for (const q of items) {
      const m = MESH(q.k); if (!m) continue; let at = null;
      while (k < pool.length && !at) { const s = pool[k++]; if (s.kind === 'teto' && s.y - m.h - l.y < 1.95) continue; if (s.kind === 'parede' && !ctx.wallFree(s.x, s.z, Math.max(m.w, 0.12), s.y - m.h, s.y + 0.03)) continue; at = s; }
      if (at && at.kind === 'parede') ctx.wallTake(at.x, at.z, Math.max(m.w, 0.12), at.y - m.h, at.y + 0.03);
      if (!at) break;
      if (at.kind === 'teto') ctx.put(q.k, at.x, at.y - m.h, at.z, at.ry + (hv(b, 60 + k) - 0.5) * 0.8, { lv, on: 'teto', key: `teto/${r3(at.x)},${r3(at.z)}`, why: `${q.why} — pendurado nas vigas do soalho de cima` });
      else {
        const out = Math.max(0.06, m.d / 2 + 0.012); const x = at.x + at.r.nx * out, z = at.z + at.r.nz * out;
        ctx.put('cavilha', at.x + at.r.nx * 0.04, at.y - 0.015, at.z + at.r.nz * 0.04, at.ry, { lv, on: 'parede', key: `cavilha/${r3(at.x)},${r3(at.z)}`, why: 'a cavilha de onde pende' });
        ctx.put(q.k, x, at.y - m.h - 0.004, z, at.ry, { lv, on: 'parede', key: `pende/${r3(at.x)},${r3(at.z)}`, why: `${q.why} — pendurado na parede` });
      }
    }
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
      if (W.lenha && fire.fire && !p.items.some(it => it.kind === 'lenha')) L.unshift({ k: 'lenha', key: 'lenha', why: `a lenha do fogo: ${W.lenha.why}` });
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
      scatter(ctx, s, [{ k: kind, key: 'luz', why, ry: (hv(b, 12 + s.it.k) - 0.5) * 2.4, at: bar ? [end * (s.w / 2 - 0.1), 0] : null, o: { lit: L.acesa ? 1 : 0, lmat: L.mat } }]); }
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
      ctx.put(kind, q.x + q.r.nx * (o + 0.012), y + sm.h, q.z + q.r.nz * (o + 0.012), ry, { lv, on: 'parede', key: `parede-luz/${i}/${kind}`, why, lit: L.acesa ? 1 : 0, lmat: L.mat });
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

  // ------------------------------ the lights ------------------------------
  // the lamps and candles lit, at the flame of each (its model's anchor), in the lot's frame: [{ x, y, z, cor, forca, raio, tremor,
  // why, kind, id }] — G.Luz3D bakes them with the others (P1)
  const LAMP = [1, 0.74, 0.44], CANDLE = [1, 0.8, 0.52];
  function lightsOf(ctx) {
    const out = [];
    for (const t of ctx.out) {
      if (!t.lit) continue; const m = MESH(t.k); const a = m && (m.anc || []).find(q => q.k === 'chama'); if (!a) continue;
      const c = Math.cos(t.ry), s = Math.sin(t.ry); const sx = t.s[0], sy = t.s[1], sz = t.s[2];
      const x = t.x + a.x * sx * c + a.z * sz * s, z = t.z - a.x * sx * s + a.z * sz * c, y = t.y + a.y * sy;
      const candle = t.k === 'vela';
      out.push({ x: r3(x), y: r3(y + 0.06), z: r3(z), cor: candle ? CANDLE : LAMP, forca: candle ? 0.2 : 0.3, raio: candle ? 3.5 : 4.5, tremor: candle ? 0.07 : 0.05, why: t.why, kind: t.k, id: 'd:' + t.key });
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
    }
    return [wood[0], 'madeira'];
  }
  // (near: the inside the body is in, or at its door, with the qualities that carry detail — every thing; the others open round it,
  // only the lamps and the cloth)
  function nearOf(b) {
    const R = G.Realm; const q = R && R.Q ? R.Q() : null; if (q && !q.detail) return false;
    const v0 = G.Possess && G.Possess.body ? G.Possess.body() : null; if (!v0) return true;
    if (v0.inside === b.id) return true; const L = G.Space.TILE; const X = v0.x * L, Z = v0.y * L;
    return Math.hypot(Math.max(b.x * L - X, 0, X - (b.x + b.w) * L), Math.max(b.y * L - Z, 0, Z - (b.y + b.h) * L)) < 3;
  }
  D.near = nearOf;
  // the instanced meshes of a plan's things: one a thing's model, part and pattern — [{ name, pt, pat, list: [[matrix 16, colour]] }]
  function groupsOf(pl, b, at, lod) {
    const W = G.Atmos.within(b); const look = G.Movel3D && G.Movel3D.look ? G.Movel3D.look(b) : null; const R3 = G.Realm; const P = PAT();
    const groups = new Map(); const X0 = at[0], Y0 = at[1], Z0 = at[2];
    for (const t of pl.list) {
      const name = 'deco-' + t.k + (lod && G.MESH3D['deco-' + t.k + '@1'] ? '@1' : ''); const parts = G.Mesh3D ? G.Mesh3D.parts('deco-' + t.k) : [];
      const m = R3.mat(X0 + t.x, Y0 + t.y, Z0 + t.z, t.ry, t.s[0], t.s[1], t.s[2]); const e = Array.from(m.elements);
      for (const pt of parts) { const pp = paintOf(pt, t, W, look); if (!pp) continue; const pat = P[pp[1]] || 0; const key = name + '/' + pt + '/' + pat;
        let g = groups.get(key); if (!g) groups.set(key, g = { name, pt, pat, list: [] }); g.list.push([e, pp[0]]); }
    }
    return [...groups.values()];
  }
  D.groupsOf = groupsOf; // (for the proofs)
  const DRAWN = new WeakMap(); // (an inside open → what of it is drawn: its group, its meshes, its signature)
  // draw the things of an inside open (o: Build3D's record of it — its building, its plan, its material, its shade) into the group
  // of its furniture; their meshes added to the furniture's, so they go when the furniture goes
  D.draw = function (o, grp, meshes) {
    if (!o || !o.b || !o.p || !grp || !G.MESH3D || !G.Mesh3D || !G.Movel3D || !G.Movel3D.partGeo) return;
    const THREE = (G.Realm && G.Realm.three && G.Realm.three()) || window.THREE; if (!THREE) return;
    const near = nearOf(o.b); const pl = D.plan(o.b, o.p, near); const at = o.out && o.out.at ? o.out.at : [o.b.x * G.Space.TILE, G.Space.plinth(o.b).y0, o.b.y * G.Space.TILE];
    const dg = new THREE.Group(); dg.matrixAutoUpdate = false; dg.name = 'dentro'; const mine = [];
    const MT = new THREE.Matrix4(), CL = new THREE.Color();
    for (const g of groupsOf(pl, o.b, at, near ? 0 : 1)) {
      const geo = G.Movel3D.partGeo(g.name, g.pt, g.pat); if (!geo) continue;
      const m = new THREE.InstancedMesh(geo, o.MI, g.list.length); m.name = 'dentro:' + g.name + '/' + g.pt; m.receiveShadow = true; if (o.shade) o.shade(m); m.matrixAutoUpdate = false;
      g.list.forEach(([e, col], k) => { MT.fromArray(e); m.setMatrixAt(k, MT); const L = G.Realm.lin(col); m.setColorAt(k, CL.setRGB(L[0], L[1], L[2])); });
      m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.computeBoundingSphere(); dg.add(m); mine.push(m);
    }
    grp.add(dg); if (meshes) for (const m of mine) meshes.push(m);
    DRAWN.set(o, { grp: dg, parent: grp, meshes: mine, list: meshes || null, sig: pl.sig, near, t: G.S.clock, n: pl.list.length });
  };
  // once a second of the world: the things of an inside drawn again — only them — when their cause has changed (the signature), or
  // the body came near or went (the level of what is drawn)
  D.step = function (o) {
    const d = o && DRAWN.get(o); if (!d || !o.items || d.parent !== o.items.grp || Math.abs(G.S.clock - d.t) < 1) return; d.t = G.S.clock;
    const near = nearOf(o.b); if (d.sig === D.sig(o.b, o.p) + (near ? '' : '#far') && d.near === near) return;
    d.parent.remove(d.grp); for (const m of d.meshes) { m.dispose(); if (d.list) { const i = d.list.indexOf(m); if (i >= 0) d.list.splice(i, 1); } }
    D.draw(o, d.parent, d.list);
  };
  // (for the proofs: what is drawn of an inside open — its things and its signature)
  D.drawn = o => { const d = o && DRAWN.get(o); return d ? { sig: d.sig, n: d.n, near: d.near, meshes: d.meshes.length } : null; };
})(window.G = window.G || {});
