'use strict';
// ============================================================
//  Interiors: the space inside every building — storeys, rooms,
//  walls, doors, windows, stairs and the furniture with its uses —
//  one definition for the god's plan, the body and the people of
//  the world, in metres from the north-west corner of the lot.
//  A plan is a pure function of the building's id and of a small
//  record kept on it (b.ip): what its builders knew, the climate
//  and the place it was built in, the family of plan they chose,
//  and every fact of its life since (the works, the people moving
//  in, renovations, a new use, damage, abandonment, the ruin). It
//  draws from a chance of its own, seeded by the id — never the
//  world's (G.R) nor the eye's (G.VR) — so it is the same plan
//  entered, left, saved, seen from above or found a century
//  later, until a fact of its life changes the record.
//  The record is written in the world's step only (the life of
//  the buildings in village.js calls in here); the plan, its
//  inner grid, the state of its doors and who sleeps in which bed
//  are read from anywhere, and never change the world.
// ============================================================
(function (G) {
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const In = G.Interiors = {};
  const TILE = 4;
  const CS = In.CS = 0.25; // (a cell of the inner grid, in metres)
  In.VERSION = 1; // (the grammar's version: a newer grammar makes new plans of the same records)
  In.TRIES = 12; // (how many times a recipe is laid out, each with its own dice, before its family gives way)
  In.CACHE = 900; // (plans kept made at once; the others are made again when asked — the same)
  const ITEMS = In.ITEMS = {}, FAMS = In.FAMS = {}, TYPES = In.TYPES = {}, TRAD = In.TRAD = {};
  const FAMLIST = [];
  In.addItems = o => { for (const k in o) ITEMS[k] = Object.assign({ kind: k }, o[k]); };
  In.addFamilies = list => { for (const f of list) { if (!FAMS[f.id]) FAMLIST.push(f.id); FAMS[f.id] = f; } };
  In.addTypes = o => { for (const k in o) TYPES[k] = Object.assign({ type: k }, o[k]); };
  In.addTraditions = o => { for (const k in o) TRAD[k] = o[k]; };
  const famIndex = id => { const k = FAMLIST.indexOf(id); return k < 0 ? 0 : k; };

  // ------------------------------ the canonical frame ------------------------------
  // A plan is laid out with its entrance at the front (v = L, the side the building opens to), u across it (the right hand
  // of one who stands outside looking in), then turned to the real side. Only turns, never a mirror.
  const toLoc = (s, L, u, v) => (s === 'S' ? [u, v] : s === 'N' ? [L - u, L - v] : s === 'E' ? [v, L - u] : [L - v, u]);
  const dirLoc = (s, du, dv) => (s === 'S' ? [du, dv] : s === 'N' ? [-du, -dv] : s === 'E' ? [dv, -du] : [-dv, du]);
  const toCan = (s, L, x, z) => (s === 'S' ? [x, z] : s === 'N' ? [L - x, L - z] : s === 'E' ? [L - z, x] : [z, L - x]);
  const rectLoc = (s, L, r) => { const a = toLoc(s, L, r[0], r[1]), b = toLoc(s, L, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  In.toLoc = toLoc; In.toCan = toCan;
  // the roof's height over a point of the plan (canonical metres): the slopes of a gable from its eaves to its ridge, the four
  // of a hip, the cone of a round hut; flat, the eaves themselves (what a loft's headroom is measured under)
  In.roofY = function (R, u, v) {
    if (!R || !R.rise) return R ? R.eave : 0;
    const r = R.R; const mu = (r[0] + r[2]) / 2, mv = (r[1] + r[3]) / 2, hu = (r[2] - r[0]) / 2, hv = (r[3] - r[1]) / 2;
    if (R.kind === 'palha-conica') return R.eave + R.rise * Math.max(0, 1 - Math.hypot(u - mu, v - mv) / Math.max(hu, 0.1));
    const across = R.along === 'u' ? Math.abs(v - mv) / hv : Math.abs(u - mu) / hu;
    if (R.kind === 'quatro-aguas') { const lenH = R.along === 'u' ? hu : hv, depH = R.along === 'u' ? hv : hu; const end = (Math.abs(R.along === 'u' ? u - mu : v - mv) - (lenH - depH)) / depH; return R.eave + R.rise * Math.max(0, 1 - Math.max(across, end)); }
    return R.eave + R.rise * Math.max(0, 1 - across);
  };
  const r2 = x => Math.round(x * 100) / 100;
  const ov = (a, b, g) => a[0] < b[2] - (g || 0) && b[0] < a[2] - (g || 0) && a[1] < b[3] - (g || 0) && b[1] < a[3] - (g || 0);
  const inside = (a, R, e) => a[0] >= R[0] - (e || 1e-6) && a[1] >= R[1] - (e || 1e-6) && a[2] <= R[2] + (e || 1e-6) && a[3] <= R[3] + (e || 1e-6);
  const ptIn = (p, R, e) => p[0] >= R[0] - (e || 0) && p[0] <= R[2] + (e || 0) && p[1] >= R[1] - (e || 0) && p[1] <= R[3] + (e || 0);
  In.ov = ov;
  // how much of a piece's outline touches the walls of its room and the pieces already standing (m): what packs a small house
  function touch(rr, R, F) {
    const E = 0.04; const r = R.r; const wu = rr[2] - rr[0], wv = rr[3] - rr[1]; let c = 0;
    if (R.circ) c += Math.max(wu, wv) * 0.8; // (a round room: one side against the ring)
    else { if (Math.abs(rr[0] - r[0]) < E) c += wv; if (Math.abs(rr[2] - r[2]) < E) c += wv; if (Math.abs(rr[1] - r[1]) < E) c += wu; if (Math.abs(rr[3] - r[3]) < E) c += wu; }
    for (const it of F.solid) {
      const a = it.r; const ou = Math.min(rr[2], a[2]) - Math.max(rr[0], a[0]), ovv = Math.min(rr[3], a[3]) - Math.max(rr[1], a[1]);
      if (ovv > 0 && (Math.abs(rr[0] - a[2]) < E || Math.abs(rr[2] - a[0]) < E)) c += ovv;
      if (ou > 0 && (Math.abs(rr[1] - a[3]) < E || Math.abs(rr[3] - a[1]) < E)) c += ou;
    }
    return c;
  }
  // a rectangle inside a circle [cu, cv, rad] (its four corners), by a margin
  const inCirc = (r, c, e) => [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].every(p => Math.hypot(p[0] - c[0], p[1] - c[1]) <= c[2] - (e || 0));

  // ------------------------------ the record ------------------------------
  // what the builders knew and where they built, frozen the day the building was placed (the plan never reads today's world)
  const CLIMA = { 0: 't', 1: 'f', 2: 'f', 3: 'u', 4: 'u', 5: 'q', 6: 'q' }; // (Biome.ID: temperado, neve, taiga, pântano, selva, savana, deserto)
  const SIDES = ['S', 'E', 'W', 'N'];
  // the point before the middle of a side's k-th tile (tiles), and whether one can stand there
  const outside = (b, s, k) => s === 'S' ? [b.x + k + 0.5, b.y + b.h + 0.4] : s === 'N' ? [b.x + b.w - 1 - k + 0.5, b.y - 0.4] : s === 'E' ? [b.x + b.w + 0.4, b.y + b.h - 1 - k + 0.5] : [b.x - 0.4, b.y + k + 0.5];
  // (k counts along u, the canonical across: for S left to right is west to east; the others turn with it)
  function openTiles(b, s) { let m = 0; const n = s === 'S' || s === 'N' ? b.w : b.h; for (let k = 0; k < n; k++) { const p = outside(b, s, k); if (G.W.walkableXY(p[0], p[1])) m |= 1 << k; } return m; }
  function blindSides(b) {
    // (a side against another building's wall at the founding: a party wall, no window in it)
    const S = G.S; let m = 0;
    const occ = (x, y) => { if (!G.W.inb(x, y)) return false; const o = S.occ[y * N + x]; if (!o || o === b.id) return false; const ob = S.buildings.get(o); return !!(ob && ob.blocks); };
    const any = (pts) => pts.some(([x, y]) => occ(x, y));
    const xs = [], ys = []; for (let k = 0; k < b.w; k++) xs.push(b.x + k); for (let k = 0; k < b.h; k++) ys.push(b.y + k);
    if (any(xs.map(x => [x, b.y - 1]))) m |= 1; if (any(ys.map(y => [b.x + b.w, y]))) m |= 2; if (any(xs.map(x => [x, b.y + b.h]))) m |= 4; if (any(ys.map(y => [b.x - 1, y]))) m |= 8;
    return m;
  }
  // the context of a building as it is today (only ever read into a record, never into a plan)
  In.contextOf = function (b) {
    const S = G.S; const fid = G.Village.facOfSet(b.set); const f = G.Fac.get(fid);
    const cx = Math.min(N - 1, Math.floor(b.x + b.w / 2)), cy = Math.min(N - 1, Math.floor(b.y + b.h / 2));
    const bio = G.Biome ? G.Biome.at(cx, cy) : 0;
    const set = S.settlements.get(b.set);
    let d = 0, w = 0, fl = 0;
    if (G.Urban && set) {
      const sn = G.Urban.peek(set.id); const c = sn && sn.cells.get(G.Urban.cellOf(b.x + b.w / 2, b.y + b.h / 2));
      if (c) { const dens = c.tiles / (G.Urban.C * G.Urban.C); d = dens > 0.5 ? 3 : dens > 0.32 ? 2 : dens > 0.16 ? 1 : 0; fl = c.flood ? 1 : 0; const v = c.value || 0; w = v >= 58 ? 2 : v >= 40 ? 1 : 0; }
    }
    let side = 'S', o = 0;
    for (const s of SIDES) { const m = openTiles(b, s); if (m) { side = s; o = m; break; } }
    const k = (f && G.Civ.has(f.id, 'alvenaria') ? 'a' : '') + (f && G.Civ.has(f.id, 'engenharia') ? 'e' : '');
    return { t: b.type, c: b.style || 'classico', e: f ? f.era || 0 : 0, k, cl: CLIMA[bio] || 't', fl, d, w, pw: blindSides(b), s: side, o };
  };
  function newRecord(b, ctx, migrated) {
    const T = TYPES[ctx.t];
    const rec = { v: 1, f: '', r: 0, t: ctx.t, u: T ? T.use : '', s: ctx.s, o: ctx.o, c: ctx.c, e: ctx.e, k: ctx.k, cl: ctx.cl, fl: ctx.fl, d: ctx.d, w: ctx.w, pw: ctx.pw, h: [], m: migrated ? 1 : 0, fx: [], dr: {} };
    rec.f = chooseFamily(b, rec);
    return rec;
  }
  In.newRecord = newRecord; // (for the proofs: a record from a context given by hand)

  // ------------------------------ the families valid for a combination ------------------------------
  // A combination is what the plan depends on besides the id: type, tradition, techniques, climate, flood, density, wealth.
  // Each family says by its own rules whether it can be built there (and why not) — read live, they are cheap. What passes
  // must also be laid out validly on the probe buildings: that is the work of the proofs, done once for each type, people,
  // hot land or not and wealth (all a home's plan reads of its context), and shipped in js/int-catalogo.js (made by
  // qa/catalogo.js, never by hand). A combination the table does not have is probed here, the slow way.
  const comboKey = rec => [rec.t, rec.c, rec.k, rec.cl, rec.fl, rec.d, rec.w, rec.e >= 2 ? 2 : rec.e].join('|');
  const probeKey = rec => [rec.t, rec.c, rec.cl === 'q' ? 1 : 0, rec.w >= 2 ? 2 : rec.w >= 1 ? 1 : 0].join('|');
  In.probeKey = probeKey;
  const CAT = new Map();
  G.worldHooks.push(() => { CAT.clear(); cache.clear(); }); // (a new world: nothing remembered from the one before)
  const PROBES = In.PROBES = [101, 2203, 30307, 404011];
  const PROBED = In.PROBED = {}; // (probe key → { family: 1 | why it cannot be laid out })
  // (the table, compact: for each key, one number for each family of the type in its own order — 1 it is laid out, n the
  // reason msgs[n - 2] it is not —, and for each type the fingerprint of its list of families: a list changed since the
  // table was made leaves that type to the slow way)
  In.famPrint = t => { const f = (TYPES[t] && TYPES[t].fams) || []; let h = 5381; const str = f.join(','); for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) + str.charCodeAt(i)) | 0; return f.length + ':' + (h >>> 0).toString(36); };
  In.addProbed = (ver, o) => {
    if (ver !== In.VERSION || !o || !o.keys) return;
    for (const k in o.keys) {
      const t = k.split('|')[0]; if (!TYPES[t] || !o.fams || o.fams[t] !== In.famPrint(t)) continue;
      const row = o.keys[k]; const fams = TYPES[t].fams; const tab = {};
      for (let q = 0; q < fams.length; q++) tab[fams[q]] = row[q] === 1 ? 1 : o.msgs[row[q] - 2];
      PROBED[k] = tab;
    }
  };
  // the probe of one family under one key: 1, or the first reason it fails (for the table and the slow way)
  In.probe = function (rec, id) {
    for (const pid of PROBES) {
      const pb = { id: pid, type: rec.t, x: 8, y: 8, w: (G.BDEF[rec.t] || {}).w || 1, h: (G.BDEF[rec.t] || {}).h || 1 };
      const p = make(pb, Object.assign({}, rec, { f: id }), id, true);
      if (!p.ok) return p.errs[0] || 'inválida';
    }
    return 1;
  };
  In.familiesFor = function (rec) {
    const key = comboKey(rec); let c = CAT.get(key); if (c) return c;
    const T = TYPES[rec.t]; c = { ok: [], why: {} };
    const tab = PROBED[probeKey(rec)] || PROBED[[rec.t, rec.c, 0, 0].join('|')] || null;
    if (T) for (const id of T.fams || []) {
      const F = FAMS[id]; if (!F) continue;
      const why = F.can ? F.can(rec, T, TRAD[rec.c] || TRAD.classico) : null;
      if (why) { c.why[id] = why; continue; }
      const pr = tab && tab[id] !== undefined ? tab[id] : In.probe(rec, id);
      if (pr !== 1) c.why[id] = 'não se arma: ' + pr; else c.ok.push(id);
    }
    CAT.set(key, c); return c;
  };
  // the family of a new building: by the tradition's taste, not the same as the two nearest of its kind when there is another
  function chooseFamily(b, rec) {
    const c = In.familiesFor(rec); if (!c.ok.length) return (TYPES[rec.t] && TYPES[rec.t].fams && TYPES[rec.t].fams[0]) || '';
    const tr = TRAD[rec.c] || TRAD.classico || {};
    let near = [];
    if (G.S && G.S.buildings && b.x !== undefined) {
      const list = [];
      for (const o of G.S.buildings.values()) { if (o === b || o.type !== b.type || !o.ip) continue; const d = Math.abs(o.x - b.x) + Math.abs(o.y - b.y); if (d <= 4) list.push([d, o.id, o.ip.f]); }
      list.sort((p, q) => p[0] - q[0] || p[1] - q[1]); near = list.slice(0, 2).map(q => q[2]);
    }
    let opts = c.ok.filter(f => !near.includes(f)); if (!opts.length) opts = c.ok;
    const wt = f => Math.max(0.05, (tr.taste && tr.taste[f]) || 1);
    let tot = 0; for (const f of opts) tot += wt(f);
    let x = G.hash(Math.imul(b.id | 0, 7919) + 13) * tot;
    for (const f of opts) { x -= wt(f); if (x <= 0) return f; }
    return opts[opts.length - 1];
  }

  // ------------------------------ the plan under construction (canonical) ------------------------------
  function seedOf(id, fam, attempt) { return (Math.imul(id | 0, 0x9E3779B1) ^ Math.imul(famIndex(fam) + 7, 0x85EBCA6B) ^ Math.imul(attempt + 3, 0xC2B2AE35)) | 0; }
  function Plan(b, rec, fam, attempt) {
    const L = b.w * TILE; const rnd = G.mulberry32(seedOf(b.id, fam, attempt));
    const P = {
      b, rec, fam: FAMS[fam], famId: fam, L, rnd, T: TYPES[rec.t], tr: TRAD[rec.c] || TRAD.classico || {}, attempt,
      levels: [], rooms: [], walls: [], holes: [], doors: [], stairs: [], items: [], annex: [], zones: [], errs: [], shell: null, roof: null, entrance: null, need: {}, notes: [],
    };
    P.rr = (a, c) => a + rnd() * (c - a);
    P.pick = arr => arr[Math.floor(rnd() * arr.length)];
    P.chance = p => rnd() < p;
    Object.assign(P, KIT);
    return P;
  }
  // the kit the recipes build with (all in canonical metres)
  const KIT = {
    level(lv, y, h, kind, area) { const o = { lv, y, h, kind, area: area.slice() }; this.levels.push(o); this.levels.sort((a, b) => a.lv - b.lv); return o; },
    lvl(lv) { return this.levels.find(l => l.lv === lv); },
    room(lv, fn, r, open, circ) { const id = this.rooms.length; this.rooms.push({ id, lv, fn, r: r.slice(), open: open ? 1 : 0, circ: circ ? circ.slice() : null }); return id; },
    wall(lv, a, b, t, h, outer, kind, mat) { const id = this.walls.length; this.walls.push({ id, lv, a: a.slice(), b: b.slice(), t, h, outer: outer ? 1 : 0, kind: kind || 'parede', mat: mat || (this.shell && this.shell.mat) || '' }); return id; },
    // the four walls round a rectangle given by its centre lines: back, right, front, left (each a → b round it)
    walls4(lv, R, t, h, outer, kind, skip) {
      const ids = {}; const [u0, v0, u1, v1] = R;
      const W4 = { fundo: [[u0, v0], [u1, v0]], direita: [[u1, v0], [u1, v1]], frente: [[u1, v1], [u0, v1]], esquerda: [[u0, v1], [u0, v0]] };
      for (const k in W4) if (!(skip && skip[k])) ids[k] = this.wall(lv, W4[k][0], W4[k][1], t, h, outer, kind);
      return ids;
    },
    // a wall's own length, and how far along it (a → b) a point falls
    wlen(id) { const w = this.walls[id]; return Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); },
    atOf(id, p) { const w = this.walls[id]; const L = this.wlen(id) || 1; return ((p[0] - w.a[0]) * (w.b[0] - w.a[0]) + (p[1] - w.a[1]) * (w.b[1] - w.a[1])) / L; },
    ptOn(id, at) { const w = this.walls[id]; const L = this.wlen(id) || 1; return [w.a[0] + (w.b[0] - w.a[0]) * at / L, w.a[1] + (w.b[1] - w.a[1]) * at / L]; },
    hole(wall, at, w, h, sill, kind, door) { const o = { wall, at, w, h, sill, kind, door: door === undefined ? -1 : door }; this.holes.push(o); return o; },
    // a door in a wall between two rooms (or a room and the street: 'rua'); hinge and swing from the plan's chance
    door(wall, at, w, h, ra, rb, outer, kind) {
      const id = this.doors.length; const d = { id, wall, at, w, h, hinge: this.chance(0.5) ? 'a' : 'b', into: 1, outer: outer ? 1 : 0, rooms: [ra, rb], kind: kind || 'porta' };
      this.doors.push(d); this.hole(wall, at, w, h, 0, kind === 'vao' ? 'vao' : 'porta', id); return id;
    },
    // a room cut in two by a partition along v (front/back: at is a v) or u (left/right): [low side, high side, wall]
    split(id, axis, at, t, h, kind) {
      const R = this.rooms[id]; const r = R.r; const lv = R.lv; let a, b2, w;
      if (axis === 'v') { a = [r[0], r[1], r[2], at - t / 2]; b2 = [r[0], at + t / 2, r[2], r[3]]; w = this.wall(lv, [r[0], at], [r[2], at], t, h, 0, kind || 'divisoria'); }
      else { a = [r[0], r[1], at - t / 2, r[3]]; b2 = [at + t / 2, r[1], r[2], r[3]]; w = this.wall(lv, [at, r[1]], [at, r[3]], t, h, 0, kind || 'divisoria'); }
      R.r = a; const nb = this.room(lv, R.fn, b2, R.open);
      return [id, nb, w];
    },
    // a flight between storeys: its footprint on lv0, the way up (du, dv); foot and top are where one stands to take it
    stair(kind, lv0, lv1, r, du, dv, hole) {
      const id = this.stairs.length; const cu = (r[0] + r[2]) / 2, cv = (r[1] + r[3]) / 2;
      const len = du ? r[2] - r[0] : r[3] - r[1];
      const foot = [cu - du * (len / 2 + 0.4), cv - dv * (len / 2 + 0.4)], top = [cu + du * (len / 2 + 0.35), cv + dv * (len / 2 + 0.35)];
      const s = { id, kind, lv0, lv1, r: r.slice(), dir: [du, dv], w: du ? r[3] - r[1] : r[2] - r[0], foot, top, hole: hole ? hole.slice() : null };
      this.stairs.push(s); return s;
    },
    // the inner rectangle of the main shell (the walls' insides)
    inner() { const s = this.shell; const t = s.t; return [s.r[0] + t, s.r[1] + t, s.r[2] - t, s.r[3] - t]; },
    // the clear zones a door and a stair keep (no furniture there)
    keepClear(lv) {
      const out = [];
      for (const d of this.doors) {
        const w = this.walls[d.wall]; if (w.lv !== lv) continue;
        const p = this.ptOn(d.wall, d.at); const L = this.wlen(d.wall) || 1; const tx = (w.b[0] - w.a[0]) / L, tz = (w.b[1] - w.a[1]) / L; const nx = -tz, nz = tx;
        const half = d.w / 2 + 0.12, dep = 0.85 + w.t / 2;
        const pts = [[p[0] + tx * half + nx * dep, p[1] + tz * half + nz * dep], [p[0] - tx * half - nx * dep, p[1] - tz * half - nz * dep]];
        out.push([Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])]);
      }
      for (const s of this.stairs) {
        const pad = (p, r) => [p[0] - r, p[1] - r, p[0] + r, p[1] + r];
        if (s.lv0 === lv) { out.push(s.r.slice()); out.push(pad(s.foot, 0.4)); }
        if (s.lv1 === lv) { if (s.hole) out.push(s.hole.slice()); out.push(pad(s.top, 0.4)); }
      }
      for (const z of this.zones) if (z.lv === lv) out.push(z.r);
      return out;
    },
    // a piece of furniture at a rectangle, facing (fu, fv): where its users stand
    item(kind, lv, room, r, fu, fv, extra) {
      const D = ITEMS[kind]; if (!D) { this.errs.push('móvel desconhecido: ' + kind); return null; }
      const it = Object.assign({ k: this.items.length, kind, lv, room, r: r.slice(), face: [fu, fv], y: 0, h: D.h, opt: this.optNext ? 1 : 0 }, extra || {});
      it.w = fu ? r[3] - r[1] : r[2] - r[0]; it.d = fu ? r[2] - r[0] : r[3] - r[1];
      this.items.push(it); return it;
    },
    // the spots of an item in the canonical frame (q: its number among the piece's own; the ones lost are left out)
    spotsAll(it) {
      const D = ITEMS[it.kind]; const cu = (it.r[0] + it.r[2]) / 2, cv = (it.r[1] + it.r[3]) / 2; const [fu, fv] = it.face;
      const au = -fv, av = fu; // (across: the right hand of one facing the item from its front)
      return (D.spots ? D.spots({ w: it.w, d: it.d, h: it.h }) : []).map((s, q) => ({ q, use: s.use, on: s.on ? 1 : 0, u: cu + fu * s.n + au * s.a, v: cv + fv * s.n + av * s.a, f: Math.abs(s.a) > Math.abs(s.n) ? [-au * Math.sign(s.a), -av * Math.sign(s.a)] : [-fu * Math.sign(s.n || 1), -fv * Math.sign(s.n || 1)] }));
    },
    spotsOf(it) { const all = this.spotsAll(it); return it.drop && it.drop.length ? all.filter(sp => !it.drop.includes(sp.q)) : all; },
    // what stands on a storey, for the placing of one piece (taken once per piece: the pieces, the places one stands to use
    // them, the ways the doors and the stairs keep, the windows)
    floorOf(lv) {
      const items = this.items.filter(it => it.lv === lv); const own = items.map(it => this.spotsOf(it).filter(sp => !sp.on));
      const solid = items.filter(it => !it.niche); // (a niche is in the wall: it takes no floor)
      const wins = []; for (const h of this.holes) { if (h.kind !== 'janela') continue; if (this.walls[h.wall].lv === lv) wins.push(this.ptOn(h.wall, h.at)); }
      return { lv, items, own, solid, zones: this.keepClear(lv), wins };
    },
    // can a rectangle take a piece here? (inside the room, off the other pieces, the doors' and stairs' ways, the windows if tall)
    // false, or what the piece costs: its own spots lost there (covered by another piece, out of the room) and the spots of
    // the pieces already standing that it covers — each piece keeps one place at least for each of its uses
    fits(r, lv, room, kind, spots, wallSide, F) {
      F = F || this.floorOf(lv);
      const R = this.rooms[room]; if (!inside(r, R.r)) return false;
      if (R.circ && !inCirc(r, R.circ, 0.02)) return false;
      const D = ITEMS[kind];
      for (const it of F.solid) if (ov(r, it.r, -0.02)) return false;
      for (const z of F.zones) if (ov(r, z)) return false;
      const steal = [];
      for (let i = 0; i < F.items.length; i++) {
        const sps = F.own[i]; if (!sps.length) continue; const hit = sps.filter(sp => ptIn([sp.u, sp.v], r, 0.12)); if (!hit.length) continue;
        for (const sp of hit) if (!sps.some(o => o.use === sp.use && !hit.includes(o))) return false;
        for (const sp of hit) steal.push([F.items[i], sp.q]);
      }
      const drop = [], kept = {}, uses = {};
      for (const sp of spots || []) {
        if (sp.on) continue; uses[sp.use] = 1;
        let bad = !ptIn([sp.u, sp.v], R.r, -0.1) || (R.circ && Math.hypot(sp.u - R.circ[0], sp.v - R.circ[1]) > R.circ[2] - 0.2);
        if (!bad) for (const it of F.solid) if (ptIn([sp.u, sp.v], it.r, 0.12)) { bad = true; break; }
        if (bad) drop.push(sp.q); else kept[sp.use] = 1;
      }
      for (const u in uses) if (!kept[u]) return false;
      if (D.fire) for (const it of F.solid) if (ITEMS[it.kind].low && ov(r, it.r, -0.3)) return false;
      if (D.low) for (const it of F.solid) if (ITEMS[it.kind].fire && ov(r, it.r, -0.3)) return false;
      if (D.tall && wallSide) for (const p of F.wins) if (ptIn(p, r, 0.3)) return false;
      if (this.under && D.fire) for (const u of this.under(lv)) if (ov(r, u)) return false;
      if (this.headOK && !this.headOK(lv, r, kind)) return false;
      return { drop, steal };
    },
    // a piece placed where fits said: the spots it covers taken from the pieces around it — and taken back, the piece with
    // them, if with it there some piece of the storey, some room or the end of a stair is no longer reached on foot
    put(kind, lv, room, rr, fu, fv, f, extra) {
      const it = this.item(kind, lv, room, rr, fu, fv, Object.assign({ drop: f.drop }, extra || {})); if (!it) return null;
      const prev = f.steal.map(([o]) => [o, o.drop ? o.drop.slice() : null]);
      for (const [o, q] of f.steal) { if (!o.drop) o.drop = []; if (!o.drop.includes(q)) o.drop.push(q); }
      if (this.walks(lv)) return it;
      this.items.pop(); for (const [o, d] of prev) o.drop = d;
      return null;
    },
    // is everything of a storey still reached on foot (the plan as it stands, in its own frame): every piece by one of its
    // places for each use, every room, the ends of its stairs — from the street door on the entrance storey, from the
    // stairs' ends on the others
    walks(lv) {
      const pp = draft(this, lv); const g = pp.grid.lv[lv]; if (!g) return true; const n = pp.grid.n;
      const seen = new Uint8Array(n * n); const q = [];
      const push = (x, z) => { if (x < 0 || z < 0 || x >= n || z >= n || seen[z * n + x] || !passable(pp, lv, x, z)) return; seen[z * n + x] = 1; q.push(x, z); };
      const near = (p, rad) => { const cx = Math.floor(p[0] / CS), cz = Math.floor(p[1] / CS); const k = Math.ceil(rad / CS); for (let dz = -k; dz <= k; dz++) for (let dx = -k; dx <= k; dx++) { const x = cx + dx, z = cz + dz; if (x >= 0 && z >= 0 && x < n && z < n && seen[z * n + x]) return true; } return false; };
      // (the ways in to this storey: from the street on the entrance one; elsewhere the end of the flight that comes from the
      // side of the entrance — the others, the flights going on, are ends to reach)
      const e0 = this.entryLv || 0; const ins = [], ends = [];
      for (const st of this.stairs) {
        if (st.kind === 'degraus') continue;
        if (st.lv1 === lv) (lv > e0 && st.lv0 < lv ? ins : ends).push(st.top);
        if (st.lv0 === lv) (lv < e0 && st.lv1 > lv ? ins : ends).push(st.foot);
      }
      const entry = lv === (this.entryLv || 0) && this.entrance;
      if (entry) { const e = this.entrance; const ex = Math.floor(e.u / CS), ez = Math.floor(e.v / CS); for (let dz = -5; dz <= 5; dz++) for (let dx = -5; dx <= 5; dx++) if (Math.hypot(dx, dz) * CS <= 1.25) push(ex + dx, ez + dz); }
      else for (const p of ins) { const cx = Math.floor(p[0] / CS), cz = Math.floor(p[1] / CS); for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) push(cx + dx, cz + dz); }
      if (!q.length) return !entry && !ins.length && !ends.length;
      for (let k = 0; k < q.length; k += 2) { const x = q[k], z = q[k + 1]; push(x + 1, z); push(x - 1, z); push(x, z + 1); push(x, z - 1); }
      const cr = crawl(pp, lv);
      for (const p of ends) if (!near(p, 0.45)) return false;
      for (const m of this.rooms) {
        if (m.lv !== lv) continue; let ok = false;
        const x0 = Math.max(0, Math.floor((m.r[0] + 0.01) / CS)), x1 = Math.min(n - 1, Math.floor((m.r[2] - 0.01) / CS)), z0 = Math.max(0, Math.floor((m.r[1] + 0.01) / CS)), z1 = Math.min(n - 1, Math.floor((m.r[3] - 0.01) / CS));
        for (let z = z0; z <= z1 && !ok; z++) for (let x = x0; x <= x1; x++) if (seen[z * n + x]) { ok = true; break; }
        if (!ok) return false;
      }
      for (const it of this.items) {
        if (it.lv !== lv) continue; const uses = {};
        for (const sp of this.spotsOf(it)) { if (sp.on) continue; uses[sp.use] = uses[sp.use] || near([sp.u, sp.v], 0.3) || (cr && near([sp.u, sp.v], 0.45)); }
        for (const u in uses) if (!uses[u]) return false;
      }
      return true;
    },
    // put a piece against a wall of the room or free in it; null when it does not go anywhere. Against a wall, of all the
    // places it fits the one that touches most of the walls and of the pieces already there — packed into the corners and one
    // beside the other, as people do in a small house —, the sides in order of taste breaking the ties; free, the nearest
    // the middle (by chance a little, unless it is the middle one wants), never closer to a wall than the margin
    place(kind, lv, room, o) {
      o = o || {}; const D = ITEMS[kind]; const R = this.rooms[room]; if (!R) return null; const r = R.r;
      const w = o.w || D.w, d = o.d || D.d; const F = this.floorOf(lv);
      const sides = o.sides || (D.free && !o.wall ? ['livre'] : ['fundo', 'esquerda', 'direita', 'frente']);
      const all = []; let tries = 0;
      const tryAll = () => { all.sort((a, b) => b.sc - a.sc); for (const c of all) { if (++tries > 14) return null; const it = this.put(kind, lv, room, c.rr, c.fu, c.fv, c.f, Object.assign(c.s ? { side: c.s } : {}, o.extra || {})); if (it) return it; } all.length = 0; return null; };
      for (let si = 0; si < sides.length; si++) {
        const s = sides[si];
        if (s === 'livre' || s === 'centro') {
          const cands = []; const cu = (r[0] + r[2]) / 2, cv = (r[1] + r[3]) / 2; const n = 9; const mg = o.margin !== undefined ? o.margin : 0.4;
          for (const [fu, fv] of o.faces || [[0, 1], [1, 0]]) {
            const ww = fu ? d : w, dd = fu ? w : d; const su = r[2] - r[0] - 2 * mg - ww, sv = r[3] - r[1] - 2 * mg - dd; if (su < -1e-6 || sv < -1e-6) continue;
            for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const u = r[0] + mg + ww / 2 + su * i / (n - 1), v = r[1] + mg + dd / 2 + sv * j / (n - 1); cands.push([Math.hypot(u - cu, v - cv) + (s === 'centro' ? 0 : this.rnd() * 1.5), u, v, fu, fv, ww, dd]); }
          }
          cands.sort((p, q) => p[0] - q[0]);
          for (const [dist, u, v, fu, fv, ww, dd] of cands) {
            const rr = [u - ww / 2, v - dd / 2, u + ww / 2, v + dd / 2];
            const f = this.fits(rr, lv, room, kind, this.spotsAll({ r: rr, face: [fu, fv], kind, w, d, h: D.h }), null, F); if (f) all.push({ sc: -dist, rr, fu, fv, s: null, f });
          }
          const it = tryAll(); if (it) return it; continue;
        }
        // (a bed lies with its head to the wall or along it: both ways are tried)
        const turns = D.rot && !o.fixed ? [[w, d], [d, w]] : [[w, d]];
        for (const [W, Dp] of turns) {
          const across = s === 'fundo' || s === 'frente'; const along = across ? [r[0], r[2]] : [r[1], r[3]];
          const len = along[1] - along[0] - W; if (len < -1e-6) continue;
          const ps = new Set([0, Math.max(0, len)]); const nmid = Math.floor(len / 0.15); for (let k = 1; k < nmid; k++) ps.add(k * 0.15);
          if (o.center) ps.add(len / 2);
          else {
            // (right beside what stands by this wall already)
            const strip = s === 'fundo' ? [r[0], r[1], r[2], r[1] + Dp] : s === 'frente' ? [r[0], r[3] - Dp, r[2], r[3]] : s === 'esquerda' ? [r[0], r[1], r[0] + Dp, r[3]] : [r[2] - Dp, r[1], r[2], r[3]];
            for (const z of F.solid.map(q => q.r).concat(F.zones)) { if (!ov(z, strip, -0.05)) continue; const lo = across ? z[0] : z[1], hi = across ? z[2] : z[3]; for (const p of [hi + 0.03 - along[0], lo - 0.03 - W - along[0]]) if (p > 1e-6 && p < len - 1e-6) ps.add(p); }
          }
          for (const p of ps) {
            const a0 = along[0] + p; let rr, fu, fv;
            if (s === 'fundo') { rr = [a0, r[1], a0 + W, r[1] + Dp]; fu = 0; fv = 1; }
            else if (s === 'frente') { rr = [a0, r[3] - Dp, a0 + W, r[3]]; fu = 0; fv = -1; }
            else if (s === 'esquerda') { rr = [r[0], a0, r[0] + Dp, a0 + W]; fu = 1; fv = 0; }
            else { rr = [r[2] - Dp, a0, r[2], a0 + W]; fu = -1; fv = 0; }
            if (R.circ) {
              // (a round room: the piece pushed in from the square's side until its outer corners touch the ring)
              const [cu, cv, rad] = R.circ; const dm = across ? Math.max(Math.abs(rr[0] - cu), Math.abs(rr[2] - cu)) : Math.max(Math.abs(rr[1] - cv), Math.abs(rr[3] - cv)); if (dm >= rad - 0.05) continue;
              const e = Math.sqrt(rad * rad - dm * dm) - 0.03;
              if (s === 'fundo') rr = [rr[0], cv - e, rr[2], cv - e + Dp]; else if (s === 'frente') rr = [rr[0], cv + e - Dp, rr[2], cv + e];
              else if (s === 'esquerda') rr = [cu - e, rr[1], cu - e + Dp, rr[3]]; else rr = [cu + e - Dp, rr[1], cu + e, rr[3]];
            }
            const f = this.fits(rr, lv, room, kind, this.spotsAll({ r: rr, face: [fu, fv], kind, w: W, d: Dp, h: D.h }), s, F); if (!f) continue;
            const pl = D.places || 0; const spend = pl ? 0.5 * W / pl : 0; // (a bed: how much of the wall it takes for each sleeper)
            all.push({ sc: (o.center ? -Math.abs(p - len / 2) : touch(rr, R, F)) - spend - 0.25 * si + 0.1 * this.rnd(), rr, fu, fv, s, f });
          }
        }
        // (the free sides come after the walls: the walls' places are tried first, all of them together)
        if (si === sides.length - 1 || sides[si + 1] === 'livre' || sides[si + 1] === 'centro') { const it = tryAll(); if (it) return it; }
      }
      return null;
    },
    // a niche cut into a thick outer wall of the room (where a house of adobe or stone keeps its things): it takes no floor,
    // only the wall — never by a door or a window, never in a party wall's way of another room
    niche(kind, lv, room, o) {
      o = o || {}; const D = ITEMS[kind]; const R = this.rooms[room]; if (!R || R.circ) return null; const r = R.r; const F = this.floorOf(lv);
      const W = D.w, dep = D.d; const all = [];
      for (const s of this.shuffle(['fundo', 'esquerda', 'direita', 'frente'])) {
        const across = s === 'fundo' || s === 'frente'; const edge = s === 'fundo' ? r[1] : s === 'frente' ? r[3] : s === 'esquerda' ? r[0] : r[2];
        const wl = this.walls.find(w => {
          if (w.lv !== lv || !w.outer || w.t < dep + 0.06) return false; const hz = Math.abs(w.a[1] - w.b[1]) < 1e-6; if (hz !== across) return false;
          const c = across ? w.a[1] : w.a[0]; const out = s === 'fundo' || s === 'esquerda' ? -1 : 1; return Math.abs(c - (edge + out * w.t / 2)) < 0.04;
        });
        if (!wl) continue;
        const lo = (across ? r[0] : r[1]) + 0.15, hi = (across ? r[2] : r[3]) - 0.15 - W;
        for (let a0 = lo; a0 <= hi + 1e-6; a0 += 0.15) {
          const mid = a0 + W / 2;
          if (this.holes.some(h => { if (h.wall !== wl.id) return false; const p = this.ptOn(h.wall, h.at); return Math.abs((across ? p[0] : p[1]) - mid) < (h.w + W) / 2 + 0.2; })) continue;
          let rr, fu, fv;
          if (s === 'fundo') { rr = [a0, r[1] - dep, a0 + W, r[1]]; fu = 0; fv = 1; } else if (s === 'frente') { rr = [a0, r[3], a0 + W, r[3] + dep]; fu = 0; fv = -1; }
          else if (s === 'esquerda') { rr = [r[0] - dep, a0, r[0], a0 + W]; fu = 1; fv = 0; } else { rr = [r[2], a0, r[2] + dep, a0 + W]; fu = -1; fv = 0; }
          if (F.items.some(it => it.niche && ov(rr, it.r, -0.3))) continue;
          const sps = this.spotsAll({ r: rr, face: [fu, fv], kind, w: W, d: dep, h: D.h });
          if (sps.some(sp => !sp.on && (!ptIn([sp.u, sp.v], r, -0.1) || F.solid.some(it => ptIn([sp.u, sp.v], it.r, 0.12))))) continue;
          all.push({ rr, fu, fv, s, sc: this.rnd() });
        }
      }
      all.sort((a, b) => b.sc - a.sc);
      for (const c of all.slice(0, 10)) { const it = this.put(kind, lv, room, c.rr, c.fu, c.fv, { drop: [], steal: [] }, { side: c.s, niche: 1, y: D.y || 1 }); if (it) return it; }
      return null;
    },
    // a sleeping bench as long as the wall leaves (between the corners and the doors), one sleeper every 0.7 m
    bench(lv, room, s, o) {
      o = o || {}; const R = this.rooms[room]; const r = R.r; const D = ITEMS['banco-cama']; const d = o.d || D.d; const F = this.floorOf(lv);
      const along = s === 'fundo' || s === 'frente' ? [r[0], r[2]] : [r[1], r[3]];
      const free = []; let a = along[0];
      const zones = F.zones.concat(F.solid.map(it => it.r));
      const strip = s === 'fundo' ? [r[0], r[1], r[2], r[1] + d] : s === 'frente' ? [r[0], r[3] - d, r[2], r[3]] : s === 'esquerda' ? [r[0], r[1], r[0] + d, r[3]] : [r[2] - d, r[1], r[2], r[3]];
      const cuts = zones.filter(z => ov(z, strip)).map(z => (s === 'fundo' || s === 'frente' ? [z[0], z[2]] : [z[1], z[3]])).sort((p, q) => p[0] - q[0]);
      for (const [c0, c1] of cuts) { if (c0 > a) free.push([a, c0]); a = Math.max(a, c1); }
      if (along[1] > a) free.push([a, along[1]]);
      free.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]));
      for (const [f0, f1] of free) {
        const len = Math.floor((f1 - f0 - 0.02) / 0.7) * 0.7; if (len < 0.7 * (o.min || 2)) continue;
        const a0 = f0 + 0.01; let rr, fu, fv;
        if (s === 'fundo') { rr = [a0, r[1], a0 + len, r[1] + d]; fu = 0; fv = 1; } else if (s === 'frente') { rr = [a0, r[3] - d, a0 + len, r[3]]; fu = 0; fv = -1; }
        else if (s === 'esquerda') { rr = [r[0], a0, r[0] + d, a0 + len]; fu = 1; fv = 0; } else { rr = [r[2] - d, a0, r[2], a0 + len]; fu = -1; fv = 0; }
        const it = { r: rr, face: [fu, fv], kind: 'banco-cama', w: len, d, h: D.h };
        const f = this.fits(rr, lv, room, 'banco-cama', this.spotsAll(it), s, F); if (f) { const b = this.put('banco-cama', lv, room, rr, fu, fv, f, { side: s, places: Math.round(len / 0.7) }); if (b) return b; }
      }
      return null;
    },
    ovr(a, b) { return ov(a, b); },
    places() { let n = 0; for (const it of this.items) n += it.places !== undefined ? it.places : (ITEMS[it.kind].places || 0); return n; },
    shuffle(a) { const o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; },
    // (what is put in for comfort, and may go if it closes the way: P.opt(() => P.place(...)))
    opt(fn) { this.optNext = true; try { return fn(); } finally { this.optNext = false; } },
  };

  // ------------------------------ making a plan ------------------------------
  // the family's recipe, tried a few times with its own dice; a family that cannot be laid out gives way to the next one
  // the type allows (always the same way: the plan stays a function of the record)
  const cache = new Map();
  function make(b, rec, famId, probe, relax) {
    const F = FAMS[famId]; let last = null;
    if (F) for (let a = 0; a < In.TRIES; a++) {
      const P = Plan(b, rec, famId, a); if (relax) P.relax = 1;
      try { F.build(P); } catch (e) { P.errs.push('receita: ' + (e && e.message)); }
      let plan = finish(P);
      // (a plan that fails only on the way through: what was put in for comfort — the table, the bench, the wood — goes
      // first, the last one in first, until the way is open or nothing of comfort is left)
      while (!plan.ok && P.errs.length === 0 && P.items.some(it => it.opt)) {
        let k = -1; for (let q = P.items.length - 1; q >= 0; q--) if (P.items[q].opt) { k = q; break; }
        P.items.splice(k, 1); P.items.forEach((it, q) => { it.k = q; });
        plan = finish(P);
      }
      if (In.trace) In.trace(a, plan); // (for the proofs: what each attempt came to)
      if (plan.ok) return plan;
      last = plan;
    }
    return last || { id: b.id, ok: false, errs: ['família desconhecida: ' + famId] };
  }
  In.plan = function (b) {
    if (!b || !b.ip || !TYPES[b.ip.t]) return null;
    const rec = b.ip; const key = b.id + ':' + rec.r + ':' + rec.f + ':' + b.type + ':' + rec.s + ':' + (rec.fx || []).length;
    let p = cache.get(b.id); if (p && p.key === key) { cache.delete(b.id); cache.set(b.id, p); return p; }
    p = build(b, rec); p.key = key; cache.set(b.id, p);
    if (cache.size > In.CACHE) cache.delete(cache.keys().next().value); // (a plan is a function of its record: made again when asked)
    return p;
  };
  function build(b, rec) {
    const T = TYPES[rec.t];
    let p = make(b, rec, rec.f);
    if (!p.ok) {
      // (the family the record chose does not go on this lot: the next one the catalogue offers there that does — always
      // the same one; and if none does, the record's own laid out for fewer sleepers than the house holds: the ones left
      // over sleep on the floor, and the plan says so)
      const offered = In.familiesFor(rec).ok;
      for (const f of offered) { if (f === rec.f) continue; const q = make(b, Object.assign({}, rec, { f }), f); if (q.ok) { q.fell = rec.f; q.errsOf = p.errs; p = q; break; } }
      if (!p.ok) { const q = make(b, rec, rec.f, false, true); if (q.ok) { q.errsOf = p.errs; p = q; } }
    }
    if (b.type === 'ruin') p = ruinOf(p, b);
    return p;
  }
  In.make = (b, rec) => build(b, rec); // (for the proofs: a plan from a record given by hand, outside the cache)
  In.makeFam = (b, rec, f) => make(b, Object.assign({}, rec, { f }), f); // (for the proofs: that family only, no fallback)

  // ------------------------------ from the canonical plan to the lot (metres from its corner) ------------------------------
  function finish(P) {
    const s = P.rec.s, L = P.L; const loc = (u, v) => toLoc(s, L, u, v).map(r2); const R = r => rectLoc(s, L, r).map(r2);
    const plan = { id: P.b.id, hot: P.rec.cl === 'q' ? 1 : 0, ver: P.rec.r + '.' + P.rec.t, type: P.rec.t, use: P.rec.u, fam: P.famId, famName: P.fam ? P.fam.name : P.famId, style: P.rec.c, side: s, lot: { w: L, d: L }, errs: P.errs.slice(), notes: P.notes };
    if (!P.shell) { plan.ok = false; plan.errs.push('sem casca'); return plan; }
    const sh = P.shell;
    if (sh.kind === 'round') { const c = loc(sh.cu, sh.cv); plan.shell = { kind: 'round', cx: c[0], cz: c[1], r: r2(sh.rad), t: sh.t, mat: sh.mat, eave: r2(sh.eave), base: sh.base, floors: sh.floors, roof: P.roof }; }
    else { const r = R(sh.r); plan.shell = { kind: 'rect', x: r2((r[0] + r[2]) / 2), z: r2((r[1] + r[3]) / 2), sx: r2(r[2] - r[0]), sz: r2(r[3] - r[1]), r, t: sh.t, mat: sh.mat, eave: r2(sh.eave), base: sh.base, floors: sh.floors, roof: P.roof ? Object.assign({}, P.roof, { along: P.roof.along ? (dirLoc(s, P.roof.along === 'u' ? 1 : 0, P.roof.along === 'v' ? 1 : 0)[0] ? 'x' : 'z') : null }, P.roof.room ? { room: Object.assign({}, P.roof.room, { r: R(P.roof.room.r) }) } : {}) : null }; }
    plan.shell.annex = P.annex.map(a => Object.assign({}, a, { r: R(a.r) }));
    plan.levels = P.levels.map(l => ({ lv: l.lv, y: r2(l.y), h: r2(l.h), kind: l.kind, area: R(l.area) }));
    plan.walls = P.walls.map(w => ({ id: w.id, lv: w.lv, a: loc(w.a[0], w.a[1]), b: loc(w.b[0], w.b[1]), t: w.t, h: r2(w.h), outer: w.outer, kind: w.kind, mat: w.mat }));
    plan.holes = P.holes.map(h => ({ wall: h.wall, at: r2(h.at), w: r2(h.w), h: r2(h.h), sill: r2(h.sill), kind: h.kind, door: h.door }));
    plan.doors = P.doors.map(d => ({ id: d.id, wall: d.wall, at: r2(d.at), w: r2(d.w), h: r2(d.h), hinge: d.hinge, into: d.into, outer: d.outer, rooms: d.rooms.slice(), kind: d.kind }));
    plan.rooms = P.rooms.map(m => {
      const r = R(m.r); const o = { id: m.id, lv: m.lv, fn: m.fn, r, poly: [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], open: m.open };
      // (a round room: its circle, and its outline as sixteen points)
      if (m.circ) { const c = loc(m.circ[0], m.circ[1]); o.circ = [c[0], c[1], r2(m.circ[2])]; o.poly = []; for (let q = 0; q < 16; q++) { const a = q / 16 * Math.PI * 2; o.poly.push([r2(c[0] + Math.cos(a) * m.circ[2]), r2(c[1] + Math.sin(a) * m.circ[2])]); } }
      return o;
    });
    plan.stairs = P.stairs.map(st => ({ id: st.id, kind: st.kind, lv0: st.lv0, lv1: st.lv1, r: R(st.r), a: loc(st.foot[0], st.foot[1]), b: loc(st.top[0], st.top[1]), dir: dirLoc(s, st.dir[0], st.dir[1]), w: r2(st.w), hole: st.hole ? R(st.hole) : null }));
    plan.items = P.items.map(it => {
      const r = R(it.r); const f = dirLoc(s, it.face[0], it.face[1]); const D = ITEMS[it.kind];
      const o = { id: P.b.id + ':' + it.k, k: it.k, kind: it.kind, name: D.name, room: it.room, lv: it.lv, x: r2((r[0] + r[2]) / 2), z: r2((r[1] + r[3]) / 2), y: r2(it.y || 0), ry: r2(Math.atan2(f[0], f[1])), w: r2(it.w), d: r2(it.d), h: r2(it.h), r, solid: D.low ? 0 : 1, low: D.low ? 1 : 0, places: it.places !== undefined ? it.places : (D.places || 0), job: D.job ? 1 : 0, fire: D.fire ? 1 : 0, niche: it.niche ? 1 : 0 };
      if (D.store) o.store = Object.assign({}, D.store, { cap: it.cap || D.store.cap });
      o.spots = P.spotsOf(it).map(sp => { const p = loc(sp.u, sp.v); const fd = dirLoc(s, sp.f[0], sp.f[1]); return { use: sp.use, on: sp.on, x: p[0], z: p[1], ry: r2(Math.atan2(fd[0], fd[1])), y: r2(it.y || 0) + (sp.on ? r2(D.h) : 0) }; });
      return o;
    });
    if (P.entrance) { const e = P.entrance; const p = loc(e.u, e.v); plan.entrance = { door: e.door, side: s, x: p[0], z: p[1], w: e.w, lv: e.lv, out: loc(e.u, L + 1.6) }; }
    plan.entryLv = P.entryLv || 0;
    plan.cap = { places: P.places(), jobs: plan.items.filter(i => i.job).length, store: plan.items.reduce((n, i) => n + (i.store && i.store.dep === 'povo' ? i.store.cap : 0), 0), seats: plan.items.filter(i => i.spots.some(q => q.use === 'sentar' || q.use === 'comer')).length };
    plan.head = P.headAt ? P.headAt : null; void plan.head; delete plan.head;
    plan.roofGeo = P.roofGeo || null; // (canonical: what the loft's headroom is measured under)
    plan._P = P; // (the canonical builder kept for the grid's headroom; not part of the contract)
    grid(plan);
    validate(plan);
    plan.sig = signature(plan);
    Object.defineProperty(plan, '_P', { enumerable: false, value: P }); // (out of any JSON)
    return plan;
  }

  // ------------------------------ the inner grid (for the body, the people and the proofs) ------------------------------
  // one byte per 25 cm cell per storey: 0 outside · 1 floor · 2 wall · 3 solid furniture · 4 low furniture (lie or sit on it)
  // · 5 stair · 6 door or opening · 7 void (no floor here: one would fall) · 8 roof too low to stand · 9 a trapdoor over a
  // ladder (shut, it is floor: one walks over it; one opens it to go down)
  const C = In.CELL = { OUT: 0, FLOOR: 1, WALL: 2, SOLID: 3, LOW: 4, STAIR: 5, DOOR: 6, VOID: 7, LOWROOF: 8, HATCH: 9 };
  function grid(plan, only) {
    const L = plan.lot.w; const n = Math.round(L / CS); const P = plan._P;
    plan.grid = { cs: CS, n, lv: {} };
    const idx = (x, z) => z * n + x;
    const cellsOf = (r, pad) => { const x0 = Math.max(0, Math.ceil((r[0] - (pad || 0)) / CS - 0.5)), x1 = Math.min(n - 1, Math.floor((r[2] + (pad || 0)) / CS - 0.5)), z0 = Math.max(0, Math.ceil((r[1] - (pad || 0)) / CS - 0.5)), z1 = Math.min(n - 1, Math.floor((r[3] + (pad || 0)) / CS - 0.5)); return [x0, z0, x1, z1]; };
    for (const l of plan.levels) {
      if (only !== undefined && l.lv !== only) continue;
      const g = new Uint8Array(n * n);
      // the storey's floor where it has floor (a loft: only over its area; beyond, the void over the room below)
      const shellR = plan.shell.kind === 'round' ? [plan.shell.cx - plan.shell.r, plan.shell.cz - plan.shell.r, plan.shell.cx + plan.shell.r, plan.shell.cz + plan.shell.r] : plan.shell.r;
      { const [x0, z0, x1, z1] = cellsOf(shellR); for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) g[idx(x, z)] = C.VOID; }
      for (const a of plan.shell.annex || []) if (l.lv === (a.lv || 0)) { const [x0, z0, x1, z1] = cellsOf(a.r); for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) g[idx(x, z)] = C.VOID; }
      for (const m of plan.rooms) { if (m.lv !== l.lv) continue; const [x0, z0, x1, z1] = cellsOf(m.r); for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) g[idx(x, z)] = C.FLOOR; }
      if (plan.shell.kind === 'round') { const cx = plan.shell.cx, cz = plan.shell.cz, rr = plan.shell.r - plan.shell.t; for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) { const px = (x + 0.5) * CS, pz = (z + 0.5) * CS; const d = Math.hypot(px - cx, pz - cz); if (d > rr && d <= plan.shell.r + CS * 0.5) g[idx(x, z)] = C.WALL; else if (d > plan.shell.r + CS * 0.5 && g[idx(x, z)] !== C.FLOOR) g[idx(x, z)] = C.OUT; else if (d > rr) g[idx(x, z)] = C.WALL; } }
      // walls (at least a cell thick), with their doors and openings
      for (const w of plan.walls) {
        if (w.lv !== l.lv) continue;
        const ht = Math.max(w.t / 2, CS / 2 + 1e-3); const ax = Math.min(w.a[0], w.b[0]), az = Math.min(w.a[1], w.b[1]), bx = Math.max(w.a[0], w.b[0]), bz = Math.max(w.a[1], w.b[1]);
        const vert = Math.abs(w.a[0] - w.b[0]) < 1e-6; const r = vert ? [ax - ht, az - w.t / 2, bx + ht, bz + w.t / 2] : [ax - w.t / 2, az - ht, bx + w.t / 2, bz + ht];
        const [x0, z0, x1, z1] = cellsOf(r); const code = w.kind === 'guarda-corpo' || w.kind === 'parapeito' ? C.WALL : C.WALL;
        for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) g[idx(x, z)] = code;
        for (const h of plan.holes) {
          if (h.wall !== w.id || h.kind === 'janela') continue;
          const L2 = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / L2, tz = (w.b[1] - w.a[1]) / L2;
          const c0 = [w.a[0] + tx * (h.at - h.w / 2), w.a[1] + tz * (h.at - h.w / 2)], c1 = [w.a[0] + tx * (h.at + h.w / 2), w.a[1] + tz * (h.at + h.w / 2)];
          const hr = vert ? [c0[0] - ht, Math.min(c0[1], c1[1]), c0[0] + ht, Math.max(c0[1], c1[1])] : [Math.min(c0[0], c1[0]), c0[1] - ht, Math.max(c0[0], c1[0]), c0[1] + ht];
          const [hx0, hz0, hx1, hz1] = cellsOf(hr); for (let z = hz0; z <= hz1; z++) for (let x = hx0; x <= hx1; x++) g[idx(x, z)] = C.DOOR;
        }
      }
      // stairs: the flight on its lower storey, the hole over it on the upper one
      for (const s of plan.stairs) {
        if (s.lv0 === l.lv && s.kind !== 'degraus') { const [x0, z0, x1, z1] = cellsOf(s.r); for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) g[idx(x, z)] = C.STAIR; }
        if (s.lv1 === l.lv && s.hole) { const [x0, z0, x1, z1] = cellsOf(s.hole); for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) g[idx(x, z)] = C.HATCH; }
      }
      // furniture: by the cells whose middle it covers
      for (const it of plan.items) {
        if (it.lv !== l.lv || it.niche) continue; const [x0, z0, x1, z1] = cellsOf(it.r, -1e-3); const code = it.low ? C.LOW : C.SOLID;
        for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (g[idx(x, z)] === C.FLOOR || g[idx(x, z)] === C.LOWROOF) g[idx(x, z)] = code;
      }
      // the roof too low to stand under (a loft): lying still goes, standing does not
      if (P && P.headAt) for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) { const c = g[idx(x, z)]; if (c !== C.FLOOR) continue; const can = toCan(plan.side, L, (x + 0.5) * CS, (z + 0.5) * CS); if (P.headAt(l.lv, can[0], can[1]) < 1.3) g[idx(x, z)] = C.LOWROOF; }
      plan.grid.lv[l.lv] = g;
    }
  }
  // the plan as it stands while it is laid out, in its own frame (the entrance at the front): what the walk of a storey needs
  function draft(P, lv) {
    const sh = P.shell; const shell = sh.kind === 'round' ? { kind: 'round', cx: sh.cu, cz: sh.cv, r: sh.rad, t: sh.t, annex: P.annex } : { kind: 'rect', r: sh.r, t: sh.t, annex: P.annex };
    const pp = { lot: { w: P.L }, side: 'S', shell, levels: P.levels, rooms: P.rooms, walls: P.walls, holes: P.holes, stairs: P.stairs, items: P.items.map(it => ({ lv: it.lv, r: it.r, low: ITEMS[it.kind].low ? 1 : 0, niche: it.niche ? 1 : 0 })), _P: P };
    grid(pp, lv); return pp;
  }
  const PASS = c => c === C.FLOOR || c === C.DOOR || c === C.HATCH;
  const NEAR = c => c === C.FLOOR || c === C.DOOR || c === C.STAIR || c === C.HATCH;
  // a loft is crawled, not walked: there a cell is enough (under the low roof too)
  const crawl = (plan, lv) => { const l = plan.levels.find(q => q.lv === lv); return !!(l && l.kind === 'jirau'); };
  // a cell one can stand on with a body of 0.32 m: itself and its four neighbours open (passages of 0.75 m and more)
  function passable(plan, lv, x, z) {
    const n = plan.grid.n; const g = plan.grid.lv[lv]; if (!g || x < 0 || z < 0 || x >= n || z >= n) return false;
    if (crawl(plan, lv)) { const c = g[z * n + x]; return c === C.FLOOR || c === C.LOWROOF || c === C.DOOR || c === C.HATCH; }
    if (!PASS(g[z * n + x])) return false;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Z = z + dz; if (X < 0 || Z < 0 || X >= n || Z >= n) return false; if (!NEAR(g[Z * n + X])) return false; }
    return true;
  }
  const cellAt = (plan, p) => [Math.floor(p[0] / CS), Math.floor(p[1] / CS)];
  // the walk from the entrance: every storey's cells one reaches on foot (by the stairs between them)
  function reach(plan) {
    const n = plan.grid.n; const seen = {}; for (const l of plan.levels) seen[l.lv] = new Uint8Array(n * n);
    const q = []; const push = (lv, x, z) => { if (!seen[lv] || !passable(plan, lv, x, z) || seen[lv][z * n + x]) return; seen[lv][z * n + x] = 1; q.push([lv, x, z]); };
    if (!plan.entrance) return seen;
    // (just inside the door: the first passable cells within 1.2 m of it, on the entrance's storey)
    const e = plan.entrance; const [ex, ez] = cellAt(plan, [e.x, e.z]); const lv0 = e.lv || 0;
    for (let dz = -5; dz <= 5; dz++) for (let dx = -5; dx <= 5; dx++) { const x = ex + dx, z = ez + dz; if (Math.hypot(dx, dz) * CS <= 1.25) push(lv0, x, z); }
    const links = plan.stairs.map(s => ({ s, f: cellAt(plan, s.a), t: cellAt(plan, s.b) }));
    for (let k = 0; k < q.length; k++) {
      const [lv, x, z] = q[k];
      push(lv, x + 1, z); push(lv, x - 1, z); push(lv, x, z + 1); push(lv, x, z - 1);
      for (const L of links) {
        if (L.s.kind === 'degraus') continue;
        if (lv === L.s.lv0 && Math.abs(x - L.f[0]) <= 2 && Math.abs(z - L.f[1]) <= 2) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) push(L.s.lv1, L.t[0] + dx, L.t[1] + dz);
        if (lv === L.s.lv1 && Math.abs(x - L.t[0]) <= 2 && Math.abs(z - L.t[1]) <= 2) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) push(L.s.lv0, L.f[0] + dx, L.f[1] + dz);
      }
    }
    return seen;
  }
  const reachedNear = (plan, seen, lv, p, r) => { const n = plan.grid.n; const s = seen[lv]; if (!s) return false; const [cx, cz] = cellAt(plan, p); const k = Math.ceil((r || 0.3) / CS); for (let dz = -k; dz <= k; dz++) for (let dx = -k; dx <= k; dx++) { const x = cx + dx, z = cz + dz; if (x >= 0 && z >= 0 && x < n && z < n && s[z * n + x]) return true; } return false; };

  // ------------------------------ validation ------------------------------
  const P0 = plan => plan._P || {};
  function validate(plan) {
    const E = plan.errs; const T = TYPES[plan.type] || {}; const def = G.BDEF[plan.type] || {}; const L = plan.lot.w;
    const lotR = [0, 0, L, L]; const sh = plan.shell;
    const shR = sh.kind === 'round' ? [sh.cx - sh.r, sh.cz - sh.r, sh.cx + sh.r, sh.cz + sh.r] : sh.r;
    if (!inside(shR, lotR, 1e-3)) E.push('a casca sai do lote');
    for (const a of sh.annex || []) if (!inside(a.r, lotR, 1e-3)) E.push('um anexo sai do lote');
    if (!plan.entrance) E.push('sem entrada');
    // rooms inside the shell, not over each other on a storey
    for (const m of plan.rooms) { const host = [shR].concat((sh.annex || []).map(a => a.r)); if (!host.some(h => inside(m.r, h, 0.02))) E.push(`cômodo ${m.fn} fora da casca`); }
    for (let i = 0; i < plan.rooms.length; i++) for (let j = i + 1; j < plan.rooms.length; j++) { const a = plan.rooms[i], b = plan.rooms[j]; if (a.lv === b.lv && ov(a.r, b.r, 0.01)) E.push(`cômodos sobrepostos: ${a.fn} e ${b.fn}`); }
    // furniture inside its room, never over another piece
    for (const it of plan.items) { const m = plan.rooms[it.room]; if (!m || !inside(it.r, it.niche ? [m.r[0] - 0.5, m.r[1] - 0.5, m.r[2] + 0.5, m.r[3] + 0.5] : m.r, 0.02)) E.push(`${it.kind} fora do cômodo`); }
    for (let i = 0; i < plan.items.length; i++) for (let j = i + 1; j < plan.items.length; j++) { const a = plan.items[i], b = plan.items[j]; if (a.lv === b.lv && (!a.niche || b.niche) && (!b.niche || a.niche) && ov(a.r, b.r, 0.01)) E.push(`móveis sobrepostos: ${a.kind} e ${b.kind}`); }
    // doors wide enough, stairs between storeys that exist
    for (const d of plan.doors) if (d.w < 0.8 - 1e-6) E.push('porta estreita demais');
    for (const s of plan.stairs) if (s.kind !== 'degraus' && (!plan.levels.some(l => l.lv === s.lv0) || !plan.levels.some(l => l.lv === s.lv1))) E.push('escada para um pavimento que não existe');
    // what the building is for, in numbers the world uses
    if (def.housing && plan.cap.places < def.housing) { if (P0(plan).relax && plan.cap.places >= Math.ceil(def.housing / 2)) plan.short = def.housing - plan.cap.places; else E.push(`só ${plan.cap.places} lugares para dormir (a casa abriga ${def.housing})`); }
    if ((T.jobs === undefined ? def.jobs : T.jobs) && plan.cap.jobs < (T.jobs === undefined ? def.jobs : T.jobs)) E.push(`só ${plan.cap.jobs} postos de trabalho (o prédio emprega ${def.jobs})`);
    if (def.storage && T.storeAll && plan.cap.store < def.storage) E.push(`depósitos para ${plan.cap.store} (o armazém guarda ${def.storage})`);
    // (the room a household lives in: its closed rooms, and half its roof terrace in the hot lands, where one lives on the roof)
    if (def.housing) { let a = 0; for (const m of plan.rooms) a += (m.circ ? Math.PI * m.circ[2] * m.circ[2] : (m.r[2] - m.r[0]) * (m.r[3] - m.r[1])) * (m.open ? (plan.hot ? 0.5 : 0) : 1); if (a / def.housing < 1.5 && !plan.short) E.push(`${(a / def.housing).toFixed(2)} m² por pessoa (menos que 1,5)`); }
    if (T.need) for (const k in T.need) { const have = plan.items.filter(i => i.kind === k || (ITEMS[i.kind].as === k)).length; if (have < T.need[k]) E.push(`falta ${k}`); }
    // the walk: every room, every place of use, from the door
    if (!E.length) {
      const seen = reach(plan);
      for (const m of plan.rooms) {
        const cx = (m.r[0] + m.r[2]) / 2, cz = (m.r[1] + m.r[3]) / 2; let ok = false; const n = plan.grid.n; const s = seen[m.lv];
        if (s) { const [x0, z0] = cellAt(plan, [m.r[0] + 0.01, m.r[1] + 0.01]), [x1, z1] = cellAt(plan, [m.r[2] - 0.01, m.r[3] - 0.01]); for (let z = Math.max(0, z0); z <= Math.min(n - 1, z1) && !ok; z++) for (let x = Math.max(0, x0); x <= Math.min(n - 1, x1); x++) if (s[z * n + x]) { ok = true; break; } }
        if (!ok) E.push(`não se chega ao cômodo ${m.fn} (piso ${m.lv})`); void cx; void cz;
      }
      // (every use of every piece: one of its places for that use is enough — a long bench is reached at one of its ends)
      for (const it of plan.items) {
        const uses = new Map(); for (const sp of it.spots) { if (sp.on) continue; const ok = reachedNear(plan, seen, it.lv, [sp.x, sp.z], 0.3) || (crawl(plan, it.lv) && reachedNear(plan, seen, it.lv, [sp.x, sp.z], 0.45)); uses.set(sp.use, (uses.get(sp.use) || false) || ok); }
        for (const [use, ok] of uses) if (!ok) { E.push(`não se chega a ${ITEMS[it.kind].name.toLowerCase()} (${use}, piso ${it.lv})`); break; }
      }
      plan.reach = seen;
    }
    plan.ok = !E.length;
  }

  // ------------------------------ the signature: what makes two plans the same plan, and two families different ------------------------------
  // the graph of its spaces — storeys and their kind, rooms by what they are for, the ways between the rooms of a storey (a
  // door or an opening), the ways up between storeys (a stair or a ladder, from whichever room of the storey it rises: that
  // is a variation of the lot, like where the door falls), the steps outside, the open spaces, the room one enters — never
  // sizes, furniture, colours, nor whether a way through has a leaf or a way up is a ladder
  function signature(plan) {
    const lab = id => (id === 'rua' ? 'rua' : (() => { const m = plan.rooms[id]; return m ? m.lv + ':' + m.fn + (m.open ? '*' : '') : '?'; })());
    const lv = plan.levels.map(l => l.lv + ':' + l.kind).join(',');
    const rooms = plan.rooms.map(m => m.lv + ':' + m.fn + (m.open ? '*' : '')).sort().join(',');
    const edges = [];
    for (const d of plan.doors) { const a = lab(d.rooms[0]), b = lab(d.rooms[1]); edges.push([a, b].sort().join('~')); }
    for (const s of plan.stairs) {
      if (s.kind === 'degraus') { edges.push('degraus:' + s.lv0 + '-' + s.lv1); continue; }
      edges.push(s.lv0 + '^' + s.lv1);
    }
    edges.sort();
    const ent = plan.entrance && plan.doors[plan.entrance.door] ? lab(plan.doors[plan.entrance.door].rooms[0]) : '-';
    return `V[${lv}] R[${rooms}] E[${edges.join(',')}] in[${ent}] a${(plan.shell.annex || []).length}`;
  }
  In.signature = signature;

  // ------------------------------ the ruin of a plan ------------------------------
  // what stands of a house when it falls: the walls of its ground storey, broken low (stepped over), no roof, no storey
  // above, its things gone but the rubble; the way through it open, as the world has a ruin
  function ruinOf(p, b) {
    if (!p || !p.shell) return p;
    const o = Object.assign({}, p); o.ruin = 1; o.ver = p.ver + '.ruina';
    o.levels = p.levels.filter(l => l.lv === (p.entryLv || 0)).map(l => Object.assign({}, l));
    o.walls = p.walls.filter(w => w.lv === (p.entryLv || 0)).map(w => Object.assign({}, w, { h: r2(0.15 + G.hash(Math.imul(b.id, 31) + w.id) * 0.3), kind: 'ruina' }));
    o.holes = []; o.doors = []; o.stairs = []; o.shell = Object.assign({}, p.shell, { roof: null, eave: 0.45, floors: 1 });
    o.items = p.items.filter(it => it.lv === (p.entryLv || 0) && G.hash(Math.imul(b.id, 17) + it.k) < 0.35).map(it => Object.assign({}, it, { id: it.id, kind: 'entulho', name: 'Entulho', solid: 0, low: 1, h: 0.4, spots: [], store: undefined, places: 0, job: 0, fire: 0 }));
    o.rooms = p.rooms.filter(m => m.lv === (p.entryLv || 0));
    o.cap = { places: 0, jobs: 0, store: 0, seats: 0 };
    o.sig = 'ruina:' + p.sig; o.ok = true; o.errs = [];
    Object.defineProperty(o, '_P', { enumerable: false, value: p._P });
    grid(o);
    return o;
  }

  // ------------------------------ readings (pure: from anywhere, never a change to the world) ------------------------------
  In.has = b => !!(b && TYPES[b.ip ? b.ip.t : b.type]);
  In.local = (b, X, Z) => [X - b.x * TILE, Z - b.y * TILE];
  // what is at a point of a storey (metres of the lot): one of In.CELL
  In.cell = function (b, lv, x, z) {
    const p = In.plan(b); if (!p || !p.grid) return C.OUT; const g = p.grid.lv[lv]; if (!g) return C.OUT;
    const cx = Math.floor(x / CS), cz = Math.floor(z / CS); if (cx < 0 || cz < 0 || cx >= p.grid.n || cz >= p.grid.n) return C.OUT;
    return g[cz * p.grid.n + cx];
  };
  // can a body of radius r stand at (x, z) of that storey
  In.walk = function (b, lv, x, z, r) {
    const p = In.plan(b); if (!p || !p.grid) return false; r = r || 0.32; const k = [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]];
    for (const [dx, dz] of k) { const c = In.cell(b, lv, x + dx, z + dz); if (!(c === C.FLOOR || c === C.DOOR || c === C.STAIR || c === C.HATCH)) return false; }
    return true;
  };
  // the height of the floor under a point of a storey (on a flight, between its foot and its top)
  In.floorY = function (b, lv, x, z) {
    const p = In.plan(b); if (!p) return 0; const l = p.levels.find(q => q.lv === lv); const y0 = l ? l.y : 0;
    for (const s of p.stairs) {
      // (steps: from the ground outside, at 0, to the storey they serve — down into a sunken floor, up to a house on stilts)
      if (s.kind === 'degraus') { if (s.lv1 !== lv || !ptIn([x, z], s.r, 0.01)) continue; const len = s.dir[0] ? s.r[2] - s.r[0] : s.r[3] - s.r[1]; const t = s.dir[0] ? (s.dir[0] > 0 ? x - s.r[0] : s.r[2] - x) : (s.dir[1] > 0 ? z - s.r[1] : s.r[3] - z); return y0 * G.clamp(t / (len || 1), 0, 1); }
      if (s.lv0 !== lv || !ptIn([x, z], s.r, 0.01)) continue; const l1 = p.levels.find(q => q.lv === s.lv1); const y1 = l1 ? l1.y : y0;
      const len = s.dir[0] ? s.r[2] - s.r[0] : s.r[3] - s.r[1]; const t = s.dir[0] ? (s.dir[0] > 0 ? x - s.r[0] : s.r[2] - x) : (s.dir[1] > 0 ? z - s.r[1] : s.r[3] - z);
      return y0 + (y1 - y0) * G.clamp(t / (len || 1), 0, 1);
    }
    return y0;
  };
  // the world's door of a building (tiles): the point before the plan's entrance — or, when that is not open ground now, the
  // first open corner (the old rule), until the turn of the day records that the door moved
  In.door = function (b) {
    const p = In.plan(b);
    if (p && p.entrance) { const o = p.entrance.out; const x = b.x + o[0] / TILE, y = b.y + o[1] / TILE; if (G.W.walkableXY(x, y)) return [x, y]; }
    return oldDoor(b);
  };
  function oldDoor(b) {
    const cands = [[b.x + b.w - 0.5, b.y + b.h + 0.4], [b.x + b.w + 0.4, b.y + b.h - 0.5], [b.x - 0.4, b.y + 0.5], [b.x + 0.5, b.y - 0.4]];
    for (const c of cands) if (G.W.walkableXY(c[0], c[1])) return c;
    const n = G.W.nearestLand(b.x + b.w / 2, b.y + b.h / 2, 4); return n || cands[0];
  }
  // the furniture that keeps things, as C1's store reads it: [{ id, kind, keys: [goods] | '*', cap, slot }] — the house's
  // pantry (food), its chest and niches (goods; the coins have no limit), a building's shelves, a people's bays
  const KEYS = { pantry: ['food'], inv: '*', stock: '*' };
  In.depotStores = function (b) {
    const p = In.plan(b); if (!p || !p.ok) return null;
    const out = []; for (const it of p.items) { if (!it.store) continue; const st = it.store; const keys = st.goods ? st.goods.slice() : KEYS[st.key] || '*'; out.push({ id: it.id, kind: it.kind, keys, cap: st.cap, slot: it.k, dep: st.dep }); }
    return out;
  };
  // the door the world's people use (tiles, before the plan's own door, on open ground), or null
  In.planDoor = function (b) { const p = In.plan(b); if (!p || !p.ok || !p.entrance) return null; const o = p.entrance.out; const x = b.x + o[0] / TILE, y = b.y + o[1] / TILE; return G.W.walkableXY(x, y) ? [x, y] : null; };
  In.slots = function (b, use) { const p = In.plan(b); if (!p) return []; const out = []; for (const it of p.items) for (const sp of it.spots) if (!use || sp.use === use) out.push({ item: it, spot: sp }); return out; };
  In.stores = function (b) { const p = In.plan(b); return p ? p.items.filter(it => it.store) : []; };
  In.capacity = function (b) { const p = In.plan(b); return p ? p.cap : null; };

  // ------------------------------ who sleeps where, who is in, what the doors are ------------------------------
  // the beds of a house go to its people by a rule (derived from who lives there, never stored): the couples first, in the
  // widest beds, then the grown, then the children by age; who is left over sleeps on the floor (said, not hidden)
  In.beds = function (b) {
    const p = In.plan(b); if (!p) return { by: new Map(), floor: [] };
    const S = G.S; const res = []; for (const v of S.villagers.values()) if (v.home === b.id) res.push(v);
    res.sort((x, y) => (y.age >= 16) - (x.age >= 16) || y.age - x.age || x.id - y.id);
    const places = [];
    for (const it of p.items) { const n = it.places || 0; if (!n) continue; const lie = it.spots.filter(s => s.use === 'deitar'); for (let k = 0; k < n; k++) places.push({ it, spot: lie[k] || lie[0], k, n, double: n === 2 }); }
    places.sort((a, c) => c.n - a.n || a.it.lv - c.it.lv || a.it.k - c.it.k || a.k - c.k);
    const by = new Map(); const used = new Set(); const floor = [];
    const take = (v, pl) => { by.set(v.id, pl); used.add(pl); };
    for (const v of res) {
      if (by.has(v.id)) continue;
      const mate = v.partner && res.find(o => o.id === v.partner);
      if (mate && !by.has(mate.id)) { const pair = places.filter(q => !used.has(q) && q.double); const a = pair.find(q => pair.some(o => o !== q && o.it === q.it)); if (a) { const b2 = pair.find(o => o !== a && o.it === a.it); take(v, a); take(mate, b2); continue; } }
      const pl = places.find(q => !used.has(q)); if (pl) take(v, pl); else floor.push(v.id);
    }
    return { by, floor, places };
  };
  In.bedOf = function (v) { const b = v && G.S.buildings.get(v.home); if (!b || !b.ip) return null; const r = In.beds(b); const pl = r.by.get(v.id); return pl ? { b, item: pl.it, spot: pl.spot } : null; };
  // where someone the world has inside a building is, inside it (for the drawing): in bed asleep, at the bench of their trade,
  // by the fire — from their task, their sleep and their work; never stored, always the same answer for the same world
  In.placeOf = function (v) {
    if (!v || !(v.inside > 0)) return null; const b = G.S.buildings.get(v.inside); const p = b && In.plan(b); if (!p) return null;
    if (v.sleeping && v.home === b.id) { const bd = In.bedOf(v); if (bd) return { b, lv: bd.item.lv, x: bd.spot.x, z: bd.spot.z, y: bd.spot.y, ry: bd.spot.ry, pose: 'deitado', item: bd.item.id }; }
    const jobs = p.items.filter(it => it.job); const t = v.task;
    if (v.job === b.id && jobs.length) { const k = Math.abs((v.id | 0) % jobs.length); const it = jobs[k]; const sp = it.spots.find(s => !s.on) || it.spots[0]; if (sp) return { b, lv: it.lv, x: sp.x, z: sp.z, y: sp.y, ry: sp.ry, pose: 'trabalhando', item: it.id }; }
    const fire = p.items.find(it => it.fire); const seat = p.items.find(it => it.spots.some(s => s.use === 'sentar' || s.use === 'comer'));
    const pick = (t && t.type === 'goHome' && seat) || fire || seat || p.items[0];
    if (pick) { const sp = pick.spots.find(s => !s.on) || pick.spots[0]; if (sp) return { b, lv: pick.lv, x: sp.x, z: sp.z, y: sp.y, ry: sp.ry, pose: pick === seat ? 'sentado' : 'de pé', item: pick.id }; }
    const e = p.entrance; return e ? { b, lv: e.lv || 0, x: e.x, z: e.z, y: 0, ry: 0, pose: 'de pé', item: null } : null;
  };
  // the doors as the world has them now: a rule of the world (time and who is in), or what someone made of them today
  const DS = ['fechada', 'aberta', 'trancada', 'bloqueada'];
  In.doorState = function (b, id) {
    const p = In.plan(b); if (!p) return null; const d = p.doors[id]; if (!d) return null;
    const S = G.S; const rec = b.ip;
    if (S.fire && S.fire[b.y * N + b.x] > 0.2) return { state: 'bloqueada', by: 'fogo' };
    if (rec.dr && rec.dr[id] !== undefined && rec.dr[id] !== null) return { state: DS[rec.dr[id]] || 'fechada', by: 'pessoa' };
    const T = TYPES[rec.t] || {}; const night = G.isNight && G.isNight();
    if (!d.outer) return { state: d.kind === 'vao' ? 'aberta' : 'fechada', by: 'regra' };
    if (T.use === 'casa') { let home = 0, out = 0; for (const v of S.villagers.values()) if (v.home === b.id) { if (v.inside === b.id) home++; else out++; } return { state: night && home && !out ? 'trancada' : 'fechada', by: 'regra' }; }
    if (T.open && !night) { for (const v of S.villagers.values()) if (v.job === b.id && v.inside === b.id) return { state: 'aberta', by: 'regra' }; return { state: 'fechada', by: 'regra' }; }
    return { state: night && T.lockNight ? 'trancada' : 'fechada', by: 'regra' };
  };
  In.state = function (b) {
    const p = In.plan(b); if (!p) return null; const S = G.S; const doors = {};
    for (const d of p.doors) doors[d.id] = In.doorState(b, d.id);
    const items = {}; const inn = []; for (const v of S.villagers.values()) if (v.inside === b.id) inn.push(v.id);
    if (TYPES[b.ip.t] && TYPES[b.ip.t].use === 'casa') { const r = In.beds(b); for (const [vid, pl] of r.by) { const v = S.villagers.get(vid); if (v && v.sleeping && v.inside === b.id) (items[pl.it.id] = items[pl.it.id] || { occ: [] }).occ.push(vid); } }
    for (const it of p.items) if (it.store) { const f = fillOf(b, it); if (f !== null) (items[it.id] = items[it.id] || { occ: [] }).fill = f; }
    return { doors, items, inside: inn, dmg: b.maxHp ? r2(1 - G.clamp(b.hp / b.maxHp, 0, 1)) : 0, ruin: b.type === 'ruin' ? 1 : 0 };
  };
  // how full a keeping piece is: its share of the store it shows (a view of the world's own numbers, never a number of its own)
  function fillOf(b, it) {
    const st = it.store; const p = In.plan(b);
    if (st.dep === 'casa') { const v = st.key === 'pantry' ? b.pantry || 0 : st.key === 'inv' ? Object.values(b.inv || {}).reduce((n, q) => n + (q || 0), 0) + (st.coin ? (b.coin || 0) / 10 : 0) : 0; const all = p.items.filter(q => q.store && q.store.dep === 'casa' && q.store.key === st.key); const cap = all.reduce((n, q) => n + q.store.cap, 0) || 1; return r2(G.clamp(v / cap, 0, 1)); }
    if (st.dep === 'predio') { const v = Object.values(b.inv || {}).reduce((n, q) => n + (q || 0), 0); const all = p.items.filter(q => q.store && q.store.dep === 'predio'); const cap = all.reduce((n, q) => n + q.store.cap, 0) || 1; return r2(G.clamp(v / cap, 0, 1)); }
    if (st.dep === 'povo') { const fid = G.Village.facOfSet(b.set); const f = G.Fac.get(fid); if (!f) return 0; const cap = G.Village.cap(fid) || 1; const tot = (f.stock.food || 0) + (f.stock.wood || 0) + (f.stock.stone || 0); return r2(G.clamp(tot / (cap * 3), 0, 1)); }
    return null;
  }

  // ------------------------------ the life of a building (only in the world's step) ------------------------------
  const H_MAX = 12;
  function fact(b, kind, what) { const h = b.ip.h; h.push(what === undefined ? [G.S.day, kind] : [G.S.day, kind, what]); if (h.length > H_MAX) h.splice(1, h.length - H_MAX); } // (the first fact, its building, always stays)
  In.found = function (b) {
    if (!b || !TYPES[b.type] || b.ip) return;
    b.ip = newRecord(b, In.contextOf(b), false);
    fact(b, b.built ? 'pronto' : 'obra');
  };
  In.complete = function (b, from) {
    if (!b) return; if (!b.ip) { if (TYPES[b.type]) In.found(b); return; }
    if (b.ip.t !== b.type) return retype(b, b.ip.t, 'reforma');
    fact(b, 'pronto');
  };
  // the type changed under the record (a hut rebuilt as a house, a shack made a hut): a renovation, with its own new plan —
  // the family kept if the new type still has it, the record's frozen context otherwise kept as it was
  function retype(b, from, why) {
    const rec = b.ip; if (!TYPES[b.type]) { rec.t = b.type; rec.r++; fact(b, why, from + '>' + b.type); return; }
    const ctx = In.contextOf(b); rec.t = b.type; rec.u = TYPES[b.type].use; rec.k = ctx.k; rec.e = ctx.e;
    const c = In.familiesFor(rec); if (!c.ok.includes(rec.f)) rec.f = chooseFamily(b, rec);
    rec.r++; rec.fx = []; fact(b, why, from + '>' + b.type);
  }
  In.retype = (b, from) => { if (b && b.ip && b.ip.t !== b.type) retype(b, from || b.ip.t, 'reforma'); };
  In.ruin = function (b, cause) { if (!b || !b.ip) return; b.ip.r++; fact(b, 'ruina', cause || ''); };
  In.abandon = function (b) { if (!b || !b.ip) return; b.ip.r++; fact(b, 'abandono'); };
  In.damage = function (b, cause) { if (!b || !b.ip) return; const h = b.ip.h; const last = h[h.length - 1]; if (last && last[1] === 'dano' && last[0] === G.S.day) return; fact(b, 'dano', cause || ''); };
  // a renovation asked for by someone (the owner who rebuilds: C1's activity, after the real work and the real cost)
  In.renovate = function (b, o) {
    if (!b || !b.ip || !G.inSim) return { ok: false, why: 'fora do passo do mundo' };
    const rec = b.ip; o = o || {};
    if (o.fam) { const c = In.familiesFor(Object.assign({}, rec)); if (!c.ok.includes(o.fam)) return { ok: false, why: c.why[o.fam] || 'essa planta não vale aqui' }; rec.f = o.fam; }
    if (o.side && SIDES.includes(o.side)) { const m = openTiles(b, o.side); if (!m) return { ok: false, why: 'esse lado não dá para a rua' }; rec.s = o.side; rec.o = m; }
    rec.r++; fact(b, 'reforma', o.fam || o.side || ''); return { ok: true };
  };
  // a new use for the same walls (a house become a shop, a hall become a temple): the shell stays, the inside follows the use
  In.reuse = function (b, use) {
    if (!b || !b.ip || !G.inSim) return { ok: false, why: 'fora do passo do mundo' };
    const rec = b.ip; if (rec.u === use) return { ok: true };
    rec.u = use; rec.r++; fact(b, 'uso', use); return { ok: true };
  };
  // a door opened, shut, locked or unlocked by someone (the body and the people the same): forgotten at the turn of the day
  In.useDoor = function (b, id, act, v) {
    if (!b || !b.ip || !G.inSim) return { ok: false, why: 'fora do passo do mundo' };
    const p = In.plan(b); const d = p && p.doors[id]; if (!d) return { ok: false, why: 'essa porta não existe' };
    const st = In.doorState(b, id); if (st.state === 'bloqueada') return { ok: false, why: 'a porta está bloqueada' };
    const own = v && (v.home === b.id || v.job === b.id || (b.owner && G.S.buildings.get(b.owner) && v.home === b.owner));
    if ((act === 'trancar' || act === 'destrancar') && !own) return { ok: false, why: 'só quem mora ou trabalha aqui tem a chave' };
    if (act === 'abrir' && st.state === 'trancada') return { ok: false, why: 'está trancada' };
    rec_dr(b)[id] = act === 'abrir' ? 1 : act === 'trancar' ? 2 : 0;
    return { ok: true, state: In.doorState(b, id).state };
  };
  const rec_dr = b => b.ip.dr || (b.ip.dr = {});
  // the turn of the day: the doors back to their rule; a door that no longer opens on open ground moves (a renovation);
  // a type changed by someone else becomes a renovation; the households that moved in, a fact
  In.onNewDay = function () {
    const S = G.S;
    const heads = new Map(); for (const v of S.villagers.values()) { if (!v.home || v.age < 16) continue; const h = heads.get(v.home); if (!h || v.age > h.age || (v.age === h.age && v.id < h.id)) heads.set(v.home, v); }
    for (const b of S.buildings.values()) {
      if (!TYPES[b.type] && !(b.ip && b.type === 'ruin')) continue;
      if (!b.ip) { In.found(b); continue; }
      const rec = b.ip;
      if (rec.dr && Object.keys(rec.dr).length) rec.dr = {};
      if (b.type === 'ruin') continue;
      if (rec.t !== b.type && b.built) { retype(b, rec.t, 'reforma'); continue; }
      if (!b.built) continue;
      // (the street the door opens to is closed now — a wall, a building, the water: the door moves to a side still open)
      const m0 = openTiles(b, rec.s); if (!(m0 & (rec.o || m0)) || !m0) { for (const s of SIDES) { const m = openTiles(b, s); if (m) { if (s !== rec.s || m !== rec.o) { rec.s = s; rec.o = m; rec.r++; fact(b, 'reforma', 'porta ' + s); } break; } } }
      if (TYPES[b.type].use === 'casa') { const head = heads.get(b.id) || null; const hid = head ? head.id : 0; if ((rec.hh || 0) !== hid) { rec.hh = hid; if (hid) fact(b, 'morada', head.name); } }
    }
  };
  // a record broken or lost (a damaged save, a building of an older world): made again from the building as it stands
  function repair(b) {
    const r = b.ip; const ok = r && typeof r === 'object' && typeof r.f === 'string' && FAMS[r.f] && Number.isInteger(r.r) && typeof r.t === 'string' && SIDES.includes(r.s) && Array.isArray(r.h);
    if (ok) { if (!Array.isArray(r.fx)) r.fx = []; if (!r.dr || typeof r.dr !== 'object') r.dr = {}; return false; }
    const t = TYPES[b.type] ? b.type : TYPES[b.origType] ? b.origType : null; if (!t) { delete b.ip; return false; }
    const ctx = In.contextOf(b); ctx.t = t; b.ip = newRecord(b, ctx, true); b.ip.h.push([G.S.day, 'migrado']); return true;
  }
  In.migrate = function () { let n = 0; for (const b of G.S.buildings.values()) if ((TYPES[b.type] || (b.type === 'ruin' && TYPES[b.origType])) && repair(b)) n++; return n; };
  G.saveHooks = G.saveHooks || [];
  // (the record goes into the save with its building; loading a world without records — an older save, a ready-made world —
  // gives each building one from what it is on the day it is loaded, the same each time)
  G.saveHooks.push({ save() { }, load() { cache.clear(); In.migrate(); } });

  // ------------------------------ the catalogue (what the proofs and the god read) ------------------------------
  In.catalog = function (rec) { const c = In.familiesFor(rec); return { ok: c.ok.map(id => ({ id, name: FAMS[id].name })), no: Object.keys(c.why).map(id => ({ id, name: FAMS[id].name, why: c.why[id] })) }; };
  In.famName = id => (FAMS[id] ? FAMS[id].name : id);
  In.uncache = () => cache.clear(); // (for the proofs)
})(window.G);
