'use strict';
// ============================================================
//  Luz3D: the light inside a building, baked from its plan (the
//  interiors 2.0, D-650; the front P1 — planos/interiores-2-contrato.md,
//  D-700 to D-709). For each open inside, a volume of light: the sky
//  that comes in through its openings, the fire and the lamps — each
//  with its cause (G.Atmos.fire / lit, G.Dentro3D.fontes) —, the
//  walls in between; read where the sky's light is read (ceu3d.js,
//  gxVolAt beside gxLightAt), so the walls, the furniture, the people
//  and what they hold take the same light: the dark corner, the
//  bright window, the warm fire. Only seen: pure — the same plan and
//  the same sources, the same volume —; nothing here touches the
//  world, nor draws on any chance (the flicker of a flame is the
//  view's clock: performance.now).
//   · the sources: L.sources(b, plan) — what lights the inside now
//     and why (pure: it reads the world, writes nothing of it);
//   · the bake: L.bake(plan, src) — a volume of voxels in the lot's
//     frame (x, z from the lot's corner, y from the plinth's top, as
//     the plan's metres): two pictures of RGBA bytes — R the sky that
//     comes in (the root of its share of the open sky), G the fire
//     (the root of its light), B the light the sky throws back off
//     the floor and the walls, A in a room (1) or out of one (0); and
//     where the fire's light comes from (RGB) and how much from one
//     side (A). Done in pieces (L.job: a few milliseconds a frame), so
//     a palace never costs one frame what it costs in all;
//   · the drawing: L.frame(open) — the volumes of the insides the 3D
//     has open, in three slots of one picture (the atlas), and the
//     uniforms every lit material reads (R3.GX: gxVol, gxVolD, gxVolA,
//     gxVolB, gxVolF, gxVolK); L.of(b) the volume drawn for a building,
//     L.at(X, Y, Z) the light at a point of the world (the eye that
//     gets used to the dark: ceu3d.js).
// ============================================================
(function (G) {
  const L = G.Luz3D = {};
  // the qualities' fields of the light inside (D-706, D-707): shine — the material of the insides with its sheen (the Alta and the
  // Ultra; the Lambert's in the Média and the Leve); lshadow — how many of the real lights of the flames have their picture of the
  // shadows (one in the Alta, two in the Ultra: fixed by the quality, or every material is made again)
  G.Realm.qualAdd('shine', { baixa: 0, media: 0, alta: 1, ultra: 1 });
  G.Realm.qualAdd('lshadow', { baixa: 0, media: 0, alta: 1, ultra: 2 });
  // the atlas: three slots of 64 × 32 × 64 voxels one after the other along Z (one sampler for all, D-700)
  const AX = 64, AY = 32, AZ = 64, SLOTS = 3;
  L.DIM = [AX, AY, AZ]; L.SLOTS = SLOTS;
  L.LAYER = 6; // (the layer of the insides' meshes: the flames' lights' pictures of the shadows read only it, D-707)
  // (the scales of the bake: the sky is a share of the open sky; the fire's light at a pace from a hearth is about 1)
  const VS0 = 0.5; // (the side of a voxel, where the lot allows: 0.5 m)
  const FIRE_REF = 3; // (the fire stored as the root of its light over this)
  const R0 = 0.85; // (how a flame's light falls: half at 0.85 m)
  const BOUNCE = 0.5; // (the share of the sky that comes in thrown back off the floor and the walls — a pale floor in the sun)
  // ------------------------------ the sources, with their causes ------------------------------
  // (the colour of each light: the hearth's embers and flame, the oil lamp's, a candle's)
  const HEARTH = [1, 0.6, 0.3], LAMP = [1, 0.74, 0.44], CANDLE = [1, 0.8, 0.52];
  // the lights a building has burning now, in its plan's frame — each with its cause (why) and what it is (kind, the piece):
  // the fires of its hearths, kitchens, forges and kilns while the world has it burning (G.Atmos.fire: the family asleep, the
  // hearth is out), the lamps on their stands and the altar's flame with someone awake inside (G.Atmos.lit), and the lamps and
  // candles the decoration puts (G.Dentro3D.fontes, P5: each with its own cause). Pure: reads the world, writes nothing
  const FIRE_K = { lar: 1, 'fogo-chao': 0.9, fogao: 0.7, forno: 0.5, fogareiro: 0.45, braseiro: 0.6, 'forja-fogo': 1, 'forno-olaria': 0.6, fornalha: 0.5, 'fornalha-banho': 0.55,
    lareira: 0.9, 'forno-barro': 0.55, 'fogao-comal': 0.6, 'fogo-comprido': 1.2 };
  L.FIRE_K = FIRE_K;
  // the lamps: the light of each — its strength (forca), its reach (raio), its colour (cor), its flicker (tremor) — and the flame drawn
  // (chama: its size; kind: the flame the 3D draws, a candle's, a lamp's, a torch's, a brazier's — Build3D draws a candle's and a lamp's
  // at their own size: L-1882). Two kinds of entry:
  //   · a piece of the plan that is a lamp (peca: 1; y: its flame over the piece's top): the altar's flame, lit with someone awake inside
  //     (G.Atmos.lit); the lamp stand, lit with someone awake and with what its people burns in it — the stand of each people, its light
  //     the entry G.Atmos.luzPeca names (nada vem do nada: L-2252);
  //   · the light of a thing of the decoration (the thing's `luz` — G.Dentro3D, by what it burns —, else its model's name): the lamp of
  //     olive oil; the seal's and the whale's, which smokes and flickers; the oil with salt of the Nile, which burns clear and steady; the
  //     candle; the lantern of horn, a candle behind its panes; the torch of ocote; the brazier's embers (the light of each people, D-1012).
  // A wave's new lamp — the palace's candelabrum, the hanging lucerna — is a line here, with its model and its cause (G.Atmos)
  const LAMPS = {
    lampadario: { peca: 1, y: 0.02, forca: 0.55, raio: 8, cor: LAMP, tremor: 0.05 }, altar: { peca: 1, y: 0.1, forca: 0.4, raio: 7, cor: HEARTH, tremor: 0.09 },
    // (the stands that are not an oil lamp's: the candle of the north's post, the brazier on the column of the lake)
    'lampadario-vela': { y: 0.045, forca: 0.36, raio: 6, cor: CANDLE, tremor: 0.07, chama: 0.12, kind: 'vela' },
    'lampadario-brasa': { y: -0.06, forca: 0.6, raio: 8, cor: [1, 0.52, 0.24], tremor: 0.1, chama: 0.3, kind: 'braseira' },
    // (the decoration's: oleo — its light goes down as the oil does, D-749)
    lamparina: { forca: 0.3, raio: 4.5, cor: LAMP, tremor: 0.05, chama: 0.15, kind: 'lamparina', oleo: 1 },
    'lamparina-foca': { forca: 0.32, raio: 4.5, cor: [1, 0.66, 0.36], tremor: 0.08, chama: 0.17, kind: 'lamparina', oleo: 1 },
    'lamparina-sal': { forca: 0.3, raio: 4.5, cor: [1, 0.78, 0.5], tremor: 0.035, chama: 0.15, kind: 'lamparina', oleo: 1 },
    vela: { forca: 0.2, raio: 3.5, cor: CANDLE, tremor: 0.07, chama: 0.12, kind: 'vela' },
    lanterna: { forca: 0.15, raio: 3.5, cor: [1, 0.72, 0.42], tremor: 0.02, chama: 0.1, kind: 'vela' },
    tocha: { forca: 0.55, raio: 6.5, cor: [1, 0.57, 0.27], tremor: 0.14, chama: 0.3, kind: 'tocha' },
    braseira: { forca: 0.34, raio: 4, cor: [1, 0.44, 0.19], tremor: 0.05, chama: 0.2, kind: 'braseira' },
  };
  L.LAMPS = LAMPS;
  L.sources = function (b, p) {
    const out = []; if (!b || !p || !p.items) return out;
    const At = G.Atmos; const fire = At && At.fire ? At.fire(b) : null; const lit = At && At.lit ? At.lit(b) : false;
    const lvY = lv => { const l = p.levels.find(q => q.lv === lv); return l ? l.y : 0; };
    for (const it of p.items) {
      if (it.fire) { if (!fire) continue; const k = (FIRE_K[it.kind] || 0.5) * (fire.k || 1);
        out.push({ x: it.x, y: lvY(it.lv) + (it.y || 0) + Math.min(it.h, 0.6), z: it.z, lv: it.lv, forca: k, raio: 7 + 3 * k, cor: HEARTH, tremor: 0.12, why: fire.why, kind: it.kind, id: it.id, fire: 1 }); continue; }
      const lp = LAMPS[it.kind]; if (!lp || !lp.peca || !lit) continue;
      // (the stand burns what its people burns in it — its oil, its candle, its embers —, or it is dark: L-2252; the altar's flame as before)
      const q = At && At.luzPeca ? At.luzPeca(b, it.kind) : undefined; if (q === null) continue; const lm = (q && LAMPS[q.luz]) || lp;
      out.push({ x: it.x, y: lvY(it.lv) + (it.y || 0) + it.h + (Number.isFinite(lm.y) ? lm.y : lp.y), z: it.z, lv: it.lv, forca: lm.forca, raio: lm.raio, cor: lm.cor, tremor: lm.tremor, why: q ? q.why : 'acordado', kind: lm.kind || it.kind, id: it.id, fire: 0, chama: lm.chama || 0, luz: q ? q.luz : it.kind });
    }
    // (the decoration's lamps and candles, P5: in the lot's frame, each with its cause; on the storey whose floor is under it — the flame
    // it is (kind, chama) and its light (luz) the G.Luz3D.LAMPS's, D-1012)
    const D = G.Dentro3D && G.Dentro3D.fontes ? G.Dentro3D.fontes(b) : null;
    if (D) for (const f of D) { let lv = p.levels[0].lv, ly = -1e9; for (const l of p.levels) if (l.y <= f.y + 0.05 && l.y > ly) { ly = l.y; lv = l.lv; }
      out.push({ x: f.x, y: f.y, z: f.z, lv, forca: f.forca, raio: f.raio || 5, cor: f.cor || LAMP, tremor: f.tremor || 0.05, why: f.why || 'decoracao', kind: f.kind || 'lamparina', id: f.id !== undefined ? f.id : 'd' + out.length, fire: 0, chama: f.chama || 0, luz: f.luz || f.kind || 'lamparina', modelo: f.modelo || '' }); }
    return out;
  };
  // (what the volume depends on: the sources lit, and which of the plan's doors stand open — the sky comes in through them)
  L.sig = (src, open) => src.map(s => s.id + ':' + s.forca.toFixed(2)).join(',') + '|' + (open || '');
  // ------------------------------ the bake ------------------------------
  const C = () => G.Interiors.CELL;
  // (the cells one stands in or over: inside a room)
  const INSIDE = c => { const K = C(); return c === K.FLOOR || c === K.SOLID || c === K.LOW || c === K.STAIR || c === K.DOOR || c === K.VOID || c === K.LOWROOF || c === K.HATCH; };
  // (a court open to the sky: no storey over it has a floor there)
  function courtOpen(p) {
    const c = p.shell && (p.shell.court || (p.shell.roof && p.shell.roof.court)); if (!c) return null; const g = p.grid, F = C().FLOOR;
    for (const l of p.levels) { if (l.lv <= 0) continue; const lg = g.lv[l.lv]; if (!lg) continue;
      for (let z = Math.max(0, Math.floor(c[1] / g.cs)); z < Math.min(g.n, Math.ceil(c[3] / g.cs)); z++) for (let x = Math.max(0, Math.floor(c[0] / g.cs)); x < Math.min(g.n, Math.ceil(c[2] / g.cs)); x++) if (lg[z * g.n + x] === F) return null; }
    return c;
  }
  // the openings of a plan the sky comes in through: every window, arch and open way of a wall with the open air on one side
  // (the street, a court open to the sky), and every door of one standing open (open: the doors' ids, a set) — each cut in
  // patches of half a metre or so, on the room's face of the wall: [x, y, z, area, nx, nz (into the room), lv]
  function skyPatches(p, open, court) {
    const g = p.grid, n = g.n, cs = g.cs, K = C(); const out = [];
    const at = (lv, x, z) => { const lg = g.lv[lv]; const i = Math.floor(x / cs), j = Math.floor(z / cs); if (!lg || i < 0 || j < 0 || i >= n || j >= n) return K.OUT; return lg[j * n + i]; };
    const outside = (lv, x, z) => { const c = at(lv, x, z); return c === K.OUT || (court && x > court[0] && x < court[2] && z > court[1] && z < court[3]); };
    const lvY = lv => { const l = p.levels.find(q => q.lv === lv); return l ? l.y : 0; };
    for (const h of p.holes) {
      const w = p.walls[h.wall]; if (!w) continue; const d = h.door >= 0 ? p.doors[h.door] : null;
      if (d && d.kind !== 'vao' && d.kind !== 'grade' && !(open && open.has(d.id))) continue; // (a shut leaf: no sky through it)
      const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const tx = (w.b[0] - w.a[0]) / len, tz = (w.b[1] - w.a[1]) / len; let nx = -tz, nz = tx;
      const cx = w.a[0] + tx * h.at, cz = w.a[1] + tz * h.at; const o = w.t / 2 + 0.2;
      const oA = outside(w.lv, cx + nx * o, cz + nz * o), oB = outside(w.lv, cx - nx * o, cz - nz * o); if (oA === oB) continue; // (between two rooms, or two outsides)
      if (oA) { nx = -nx; nz = -nz; } // (into the room)
      const nu = Math.max(1, Math.round(h.w / 0.55)), nv = Math.max(1, Math.round(h.h / 0.6)); const a = h.w * h.h / (nu * nv); const y0 = lvY(w.lv) + (h.sill || 0);
      for (let u = 0; u < nu; u++) { const s = -h.w / 2 + h.w * (u + 0.5) / nu; const x = cx + tx * s + nx * w.t / 2, z = cz + tz * s + nz * w.t / 2;
        for (let v = 0; v < nv; v++) out.push([x, y0 + h.h * (v + 0.5) / nv, z, a, nx, nz, w.lv, u]); }
    }
    return out;
  }
  // a job baking a plan's volume a piece at a time: step(ms) works its columns until the time is up — true once done — and its
  // volume is then .vol. Pure: the plan and the sources in, the bytes out
  L.job = function (p, src, open) {
    const g = p.grid; if (!g || !g.lv || !p.levels || !p.levels.length || !p.shell || p.shell.kind === 'aberta') return null;
    const K = C(), n = g.n, cs = g.cs, Lot = n * cs; const sh = p.shell;
    const lvs = p.levels.slice().sort((a, c) => a.y - c.y); const court = courtOpen(p);
    let ylo = Infinity, yhi = -Infinity; for (const l of lvs) { ylo = Math.min(ylo, l.y); yhi = Math.max(yhi, l.y + l.h); } yhi = Math.max(yhi, (sh.eave || 0) + ((sh.roof && sh.roof.h) || 0));
    ylo -= 0.25; yhi += 0.25;
    const vs = Math.max(VS0, Math.ceil(Lot / AX / 0.125) * 0.125); const nx = Math.min(AX, Math.ceil(Lot / vs)), nz = nx;
    const vy = Math.max(vs * 0.6, (yhi - ylo) / AY); const ny = Math.min(AY, Math.ceil((yhi - ylo) / vy));
    const N3 = nx * ny * nz; const sky = new Float32Array(N3), fir = new Float32Array(N3), fdx = new Float32Array(N3), fdy = new Float32Array(N3), fdz = new Float32Array(N3); const kind = new Uint8Array(N3); // (0 out, 1 in, 2 wall, 3 slab)
    const idx = (i, j, k) => (k * ny + j) * nx + i;
    const cell = (lv, x, z) => { const lg = g.lv[lv]; const i = Math.floor(x / cs), j = Math.floor(z / cs); if (!lg || i < 0 || j < 0 || i >= n || j >= n) return K.OUT; return lg[j * n + i]; };
    // (the storey a height is on, and whether it is within its room's height — the top one up under the roof)
    const top = lvs[lvs.length - 1];
    const storeyAt = y => { let s = null; for (const l of lvs) if (y >= l.y - 0.02) s = l; return s; };
    const capOf = l => (l === top ? yhi : l.y + l.h);
    const patches = skyPatches(p, open, court);
    // (the line of sight over a storey's plan, from (x0, z0) to (x1, z1): no wall, no outside cell between — the last cells at
    // the far end forgiven, where the opening or the hearth itself stands)
    const seen = (lv, x0, z0, x1, z1, slack) => { const lg = g.lv[lv]; if (!lg) return false; const d = Math.hypot(x1 - x0, z1 - z0); const m = Math.max(1, Math.ceil(d / (cs * 0.6)));
      const end = m - Math.ceil((slack || 0) / (cs * 0.6));
      for (let s = 1; s < end; s++) { const x = x0 + (x1 - x0) * s / m, z = z0 + (z1 - z0) * s / m; const i = Math.floor(x / cs), j = Math.floor(z / cs); if (i < 0 || j < 0 || i >= n || j >= n) return false; const c = lg[j * n + i]; if (c === K.WALL || c === K.OUT) return false; } return true; };
    const job = { p, nx, ny, nz, vs, vy, org: [0, ylo, 0], col: 0, done: false, vol: null, ms: 0, src };
    // (the colour and the flicker of the volume's fire: the sources', by their strength)
    let fw = 0; const fc = [0, 0, 0]; let tr = 0; for (const s of src) { fw += s.forca; for (let q = 0; q < 3; q++) fc[q] += s.cor[q] * s.forca; tr += s.tremor * s.forca; }
    job.fireCol = fw > 0 ? fc.map(c => c / fw) : [1, 0.6, 0.3]; job.tremor = fw > 0 ? tr / fw : 0; job.fireW = fw;
    // one column of voxels (i, k): what each is, the sky through every opening of its storey, the fire of every source on it
    const column = (i, k) => {
      const x = (i + 0.5) * vs, z = (k + 0.5) * vs; if (x >= Lot || z >= Lot) return;
      const inCourt = court && x > court[0] && x < court[2] && z > court[1] && z < court[3];
      // (the lines of sight from this column to each opening's place and each source, once per storey: the same at every height)
      const losP = new Map(), losF = new Map();
      for (let j = 0; j < ny; j++) {
        const y = ylo + (j + 0.5) * vy; const v = idx(i, j, k); const l = storeyAt(y);
        if (!l) { kind[v] = 0; continue; }
        const c = cell(l.lv, x, z);
        if (inCourt && !(l.lv > 0 && INSIDE(c))) { kind[v] = 0; continue; }
        if (c === K.OUT) { kind[v] = 0; continue; }
        if (c === K.WALL) { kind[v] = 2; continue; }
        if (y > capOf(l)) { kind[v] = 3; continue; } // (in the slab between two storeys)
        if (!INSIDE(c)) { kind[v] = 0; continue; }
        kind[v] = 1;
        let E = 0; for (let q = 0; q < patches.length; q++) { const P = patches[q]; if (P[6] !== l.lv) continue;
          const dx = x - P[0], dy = y - P[1], dz = z - P[2]; const dd = dx * dx + dy * dy + dz * dz + 0.04; const cos = (dx * P[4] + dz * P[5]) / Math.sqrt(dd); if (cos <= 0.02) continue;
          const e = P[3] * cos / (Math.PI * dd); if (e < 2e-5) continue;
          const key = l.lv * 4096 + q; let s = losP.get(key); if (s === undefined) { s = seen(l.lv, x, z, P[0] - P[4] * 0.05, P[2] - P[5] * 0.05, 0); losP.set(key, s); } if (s) E += e; }
        sky[v] = E;
        let F = 0, ax = 0, ay = 0, az = 0;
        for (let q = 0; q < src.length; q++) { const s = src[q]; if (s.lv !== l.lv) continue; const dx = s.x - x, dy = s.y - y, dz = s.z - z; const d2 = dx * dx + dy * dy + dz * dz; if (d2 > s.raio * s.raio) continue;
          const key = q; let ok = losF.get(key); if (ok === undefined) { ok = seen(l.lv, x, z, s.x, s.z, 0.35); losF.set(key, ok); } if (!ok) continue;
          const dl = Math.sqrt(d2) || 1e-3; const win = 1 - (dl / s.raio) ** 4; const f = s.forca / (1 + d2 / (R0 * R0)) * win; F += f; ax += f * dx / dl; ay += f * dy / dl; az += f * dz / dl; }
        fir[v] = F; fdx[v] = ax; fdy[v] = ay; fdz[v] = az;
      }
    };
    // (the end: the light thrown back off the floor and walls — the sky that came in, spread through the rooms —, the walls and
    // slabs given the light of the rooms beside them, so a face sampled at its own place reads its room's; the bytes)
    // (the end, in phases a step each — a palace's is a few frames' work: the light thrown back off the floor and walls — the sky that
    // came in, spread through the rooms —, the bytes, the slabs and the walls given the light of the rooms beside them, so a face
    // sampled at its own place reads its own room's — a slab the storey's it is nearer, never the other's: no light through a floor)
    let bnc = null, tmp = null, d1 = null, d2 = null, mean = 0, nowIn = null;
    // (each phase over a run of the volume's slices along z — sixteen at most —: a palace's end is many small steps, never one long one)
    const KS = 16;
    const blur = (k0, k1) => { for (let k = k0; k < k1; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = idx(i, j, k); if (kind[v] !== 1) { tmp[v] = 0; continue; } let s = bnc[v] * 2, w = 2;
        if (i > 0 && kind[v - 1] === 1) { s += bnc[v - 1]; w++; } if (i < nx - 1 && kind[v + 1] === 1) { s += bnc[v + 1]; w++; }
        if (j > 0 && kind[v - nx] === 1) { s += bnc[v - nx]; w++; } if (j < ny - 1 && kind[v + nx] === 1) { s += bnc[v + nx]; w++; }
        if (k > 0 && kind[v - nx * ny] === 1) { s += bnc[v - nx * ny]; w++; } if (k < nz - 1 && kind[v + nx * ny] === 1) { s += bnc[v + nx * ny]; w++; }
        tmp[v] = s / w; } };
    const OUTV = (o) => { d1[o] = 255; d1[o + 1] = 0; d1[o + 2] = 0; d1[o + 3] = 0; d2[o] = d2[o + 1] = d2[o + 2] = 128; d2[o + 3] = 0; };
    const copy = (o, q) => { for (let c = 0; c < 4; c++) { d1[o + c] = d1[q + c]; d2[o + c] = d2[q + c]; } };
    const enc = x => Math.round(Math.sqrt(G.clamp(x, 0, 1)) * 255);
    // (the bytes of a run of slices: the rooms' own; then a slab's voxel the nearest room's above or below it, in its column — the lower
    // one where both are as near)
    const bytes = (k0, k1) => { for (let k = k0; k < k1; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = idx(i, j, k); const o = v * 4;
        if (kind[v] === 0) { OUTV(o); continue; }
        if (kind[v] >= 2) continue; // (filled below, from its rooms)
        const b = bnc[v] * BOUNCE + mean * BOUNCE * 0.25;
        d1[o] = enc(sky[v]); d1[o + 1] = enc(fir[v] / FIRE_REF); d1[o + 2] = enc(b); d1[o + 3] = 255;
        const fl = Math.hypot(fdx[v], fdy[v], fdz[v]); if (fl > 1e-6) { d2[o] = Math.round((fdx[v] / fl * 0.5 + 0.5) * 255); d2[o + 1] = Math.round((fdy[v] / fl * 0.5 + 0.5) * 255); d2[o + 2] = Math.round((fdz[v] / fl * 0.5 + 0.5) * 255); d2[o + 3] = Math.round(G.clamp(fl / Math.max(1e-6, fir[v]), 0, 1) * 255); } else { d2[o] = d2[o + 1] = d2[o + 2] = 128; d2[o + 3] = 0; } }
      for (let k = k0; k < k1; k++) for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const v = idx(i, j, k); if (kind[v] !== 3) continue; let q = -1;
        for (let dj = 1; dj < ny && q < 0; dj++) { if (j - dj >= 0 && kind[idx(i, j - dj, k)] === 1) q = idx(i, j - dj, k); else if (j + dj < ny && kind[idx(i, j + dj, k)] === 1) q = idx(i, j + dj, k); }
        if (q < 0) OUTV(v * 4); else copy(v * 4, q * 4); } };
    // (a wall's voxel: the mean of the rooms round it on its own level — two passes, so a thick wall is filled through; what is in at
    // the start of a pass read once for it)
    const inNow = pass => { nowIn = new Uint8Array(N3); for (let v = 0; v < N3; v++) nowIn[v] = d1[v * 4 + 3] === 255 && (kind[v] === 1 || kind[v] === 3 || (kind[v] === 2 && pass)) ? 1 : 0; };
    const fillWalls = (pass, k0, k1) => {
      for (let k = k0; k < k1; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = idx(i, j, k); if (kind[v] !== 2 || nowIn[v]) continue;
        const sm = [0, 0, 0, 0], s2 = [0, 0, 0, 0]; let w = 0;
        for (const [di, dk] of NB2) { const I = i + di, Kk = k + dk; if (I < 0 || Kk < 0 || I >= nx || Kk >= nz) continue; const q = idx(I, j, Kk); if (!nowIn[q]) continue; w++; for (let c = 0; c < 4; c++) { sm[c] += d1[q * 4 + c]; s2[c] += d2[q * 4 + c]; } }
        const o = v * 4; if (!w) { if (pass === 1) OUTV(o); continue; }
        for (let c = 0; c < 4; c++) { d1[o + c] = Math.round(sm[c] / w); d2[o + c] = Math.round(s2[c] / w); } d1[o + 3] = 255; } };
    const runs = fn => { const out = []; for (let k0 = 0; k0 < nz; k0 += KS) { const a = k0, b = Math.min(nz, k0 + KS); out.push(() => fn(a, b)); } return out; };
    const PHASES = [() => { bnc = new Float32Array(N3); tmp = new Float32Array(N3); for (let v = 0; v < N3; v++) bnc[v] = kind[v] === 1 ? Math.min(sky[v], 0.5) : 0; }];
    for (let it = 0; it < 4; it++) PHASES.push(...runs(blur), () => { const t = bnc; bnc = tmp; tmp = t; });
    // (the mean of the rooms' light, for the corners no window sees: a room is never all black by day)
    PHASES.push(() => { let ms = 0, mn = 0; for (let v = 0; v < N3; v++) if (kind[v] === 1) { ms += sky[v]; mn++; } mean = mn ? ms / mn : 0; d1 = new Uint8Array(N3 * 4); d2 = new Uint8Array(N3 * 4); });
    PHASES.push(...runs(bytes));
    for (const pass of [0, 1]) PHASES.push(() => inNow(pass), ...runs((a, b) => fillWalls(pass, a, b)));
    let phase = 0;
    job.step = function (budget) {
      if (job.done) return true; const t0 = now(); const M = nx * nz;
      while (job.col < M) { const i = job.col % nx, k = (job.col / nx) | 0; column(i, k); job.col++; if (budget !== undefined && now() - t0 > budget) break; }
      // (the phases of the end, as many as the time left allows — the first one in a step of its own when the columns took it)
      while (job.col >= M && phase < PHASES.length && (budget === undefined || now() - t0 < budget)) PHASES[phase++]();
      job.ms += now() - t0;
      if (phase >= PHASES.length) { job.vol = { nx, ny, nz, vs, vy, org: job.org, d1, d2, fireCol: job.fireCol, tremor: job.tremor, fireW: job.fireW, ms: job.ms, mean, n: src.length }; job.done = true; }
      return job.done;
    };
    return job;
  };
  const NB2 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  // the whole volume at once (for the proofs)
  L.bake = function (p, src, open) { const j = L.job(p, src || [], open); if (!j) return null; j.step(); return j.vol; };
  // the light at a point of a volume (the plan's metres): { ceu, fogo, rebate, dentro } as the shader reads them — the nearest voxel
  L.sample = function (vol, x, y, z) {
    if (!vol) return null; const i = Math.floor(x / vol.vs), j = Math.floor((y - vol.org[1]) / vol.vy), k = Math.floor(z / vol.vs);
    if (i < 0 || j < 0 || k < 0 || i >= vol.nx || j >= vol.ny || k >= vol.nz) return null; const o = ((k * vol.ny + j) * vol.nx + i) * 4; const d = vol.d1; const dec = c => (c / 255) ** 2;
    return { ceu: dec(d[o]), fogo: dec(d[o + 1]) * FIRE_REF, rebate: dec(d[o + 2]), dentro: d[o + 3] / 255 };
  };
  // ------------------------------ the drawing: the atlas and the uniforms ------------------------------
  // (the volumes kept by building: the plan they are of, its signature, the job baking the next one; a few — the ones open)
  let THREE = null, tex = null, texD = null; const kept = new Map(); let slots = [null, null, null];
  G.worldHooks.push(() => { kept.clear(); slots = [null, null, null]; L.drawn = []; if (G.Realm && G.Realm.GX && G.Realm.GX.gxVolK) G.Realm.GX.gxVolK.value.x = 0; });
  L.init = function (three) {
    THREE = three; const R3 = G.Realm; const GX = R3.GX; if (!GX || !GX.gxVol) return;
    const mk = () => { const t = new THREE.Data3DTexture(new Uint8Array(AX * AY * AZ * SLOTS * 4), AX, AY, AZ * SLOTS); t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType;
      t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.unpackAlignment = 1; t.wrapS = t.wrapT = t.wrapR = THREE.ClampToEdgeWrapping; t.needsUpdate = true; t.clone = function () { return this; }; return t; };
    tex = mk(); texD = mk(); GX.gxVol.value = tex; GX.gxVolD.value = texD;
  };
  // (a volume into its slot of the atlas)
  function upload(s, vol) {
    const A = tex.image.data, B = texD.image.data; const z0 = s * AZ;
    for (let k = 0; k < AZ; k++) for (let j = 0; j < AY; j++) { const o = (((z0 + k) * AY + j) * AX) * 4;
      if (!vol || k >= vol.nz || j >= vol.ny) { A.fill(0, o, o + AX * 4); B.fill(128, o, o + AX * 4); continue; }
      const so = ((k * vol.ny + j) * vol.nx) * 4; A.set(vol.d1.subarray(so, so + vol.nx * 4), o); B.set(vol.d2.subarray(so, so + vol.nx * 4), o); if (vol.nx < AX) { A.fill(0, o + vol.nx * 4, o + AX * 4); B.fill(128, o + vol.nx * 4, o + AX * 4); } }
    tex.needsUpdate = true; texD.needsUpdate = true;
  }
  L.BUDGET = 3; // (the milliseconds a frame the bakes may take)
  // each frame, from the 3D's open insides: [{ b, p, open (the ids of its doors standing open, a set), main (the one the body is in) }]
  // — their sources read, a volume baked a piece at a time where they changed (the old one drawn until the new is done), the
  // volumes into the slots, the uniforms set. lampOf: which slot each building's lights are in (for FX3D)
  L.frame = function (list, opt) {
    const R3 = G.Realm; const GX = R3.GX; if (!tex || !GX || !GX.gxVol) return;
    opt = opt || {}; const t = now() / 1000; let budget = L.BUDGET;
    // (the ones open, and the ones about to open — baked ahead with the time left, so an inside never shows a frame of the open sky
    // before its light is ready: opt.pre, their doors as the plan has them shut)
    const want = list.slice(0, SLOTS); const pre = (opt.pre || []).filter(o => !want.some(q => q.b.id === o.b.id)).slice(0, 2);
    const ids = new Set(want.concat(pre).map(o => o.b.id));
    for (const id of [...kept.keys()]) if (!ids.has(id)) kept.delete(id);
    for (const o of want.concat(pre)) {
      const src = L.sources(o.b, o.p); const op = o.open ? [...o.open].sort((a, c) => a - c).join('.') : ''; const sig = L.sig(src, op);
      let e = kept.get(o.b.id); if (!e || e.p !== o.p) { e = { p: o.p, vol: null, sig: null, job: null, jsig: null, src }; kept.set(o.b.id, e); }
      if (sig !== e.sig && sig !== e.jsig) { e.job = L.job(o.p, src, o.open); e.jsig = e.job ? sig : null; e.at = G.S.clock; }
      if (e.job && budget > 0) { const t0 = now(); if (e.job.step(budget)) { e.vol = e.job.vol; e.sig = e.jsig; e.src = e.job.src; e.job = null; e.jsig = null; e.dirty = true; } budget -= now() - t0; }
    }
    // (each building keeps its slot while it is open: a volume new to its slot is uploaded)
    const next = [null, null, null];
    for (let s = 0; s < SLOTS; s++) { const id = slots[s]; if (id && ids.has(id) && kept.get(id) && kept.get(id).vol) next[s] = id; }
    for (const o of want) { const e = kept.get(o.b.id); if (!e || !e.vol || next.includes(o.b.id)) continue; const s = next.indexOf(null); if (s < 0) break; next[s] = o.b.id; e.dirty = true; }
    for (let s = 0; s < SLOTS; s++) { const id = next[s]; const e = id ? kept.get(id) : null; if (id !== slots[s] && !id) upload(s, null); if (e && e.dirty) { upload(s, e.vol); e.dirty = false; } }
    slots = next;
    const A = GX.gxVolA.value, B = GX.gxVolB.value, F = GX.gxVolF.value; let any = 0; L.drawn = [];
    for (let s = 0; s < SLOTS; s++) {
      const id = slots[s]; const e = id ? kept.get(id) : null; const o = id ? want.find(q => q.b.id === id) : null;
      if (!e || !o) { A[s * 4] = A[s * 4 + 1] = A[s * 4 + 2] = 0; A[s * 4 + 3] = 0; B[s * 4] = B[s * 4 + 1] = B[s * 4 + 2] = 0; B[s * 4 + 3] = 0; F[s * 4] = F[s * 4 + 1] = F[s * 4 + 2] = F[s * 4 + 3] = 0; continue; }
      const v = e.vol, TL = G.Space.TILE, y0 = G.Space.plinth(o.b).y0; any = 1;
      A[s * 4] = o.b.x * TL + v.org[0]; A[s * 4 + 1] = y0 + v.org[1]; A[s * 4 + 2] = o.b.y * TL + v.org[2]; A[s * 4 + 3] = 1 / v.vs;
      B[s * 4] = v.nx; B[s * 4 + 1] = v.ny; B[s * 4 + 2] = v.nz; B[s * 4 + 3] = 1 / v.vy;
      // (the fire's colour and strength now — its flicker by the view's clock, each slot its own —, and how much of it the baked fill
      // carries: less where a real light carries its strongest flame)
      const fl = 1 + v.tremor * (Math.sin(t * 7.3 + s * 1.7) * 0.55 + Math.sin(t * 12.9 + s) * 0.3 + Math.sin(t * 23.1 + s * 3) * 0.15);
      const I = L.FIRE_I * fl; const fill = opt.lit && opt.lit.has(id) ? L.FILL_LIT : 1;
      F[s * 4] = v.fireCol[0] * I; F[s * 4 + 1] = v.fireCol[1] * I; F[s * 4 + 2] = v.fireCol[2] * I; F[s * 4 + 3] = fill;
      L.drawn.push({ id, slot: s, sig: e.sig, ms: +v.ms.toFixed(2), n: [v.nx, v.ny, v.nz], vs: v.vs, src: e.src.length });
    }
    const K = GX.gxVolK.value; K.x = any; K.y = opt.shadows ? 1 : 0; K.z = 0.22; K.w = L.SKY_GAIN;
    L.frameClock = G.S.clock; // (the world's clock of the frame these volumes and their sources are of: the verifier compares only then)
  };
  // (the dials of the light inside, for the photos that compare: the sky's gain, the fire's strength, the baked fill under a real light)
  L.SKY_GAIN = 4.0; L.FIRE_I = 3.4; L.FILL_LIT = 0.55;
  // (for the verifier: the signature of the volume drawn for a building, and of the one baking)
  L.state = id => { const e = kept.get(id); return e ? { sig: e.sig, jsig: e.jsig, src: e.src, at: e.at } : null; };
  // which slot a building's volume is drawn in (-1 none)
  L.slotOf = id => slots.indexOf(id);
  // the volume drawn for a building (or null)
  L.of = b => { const e = b && kept.get(b.id); return e && e.vol ? Object.assign({ slot: slots.indexOf(b.id) }, e.vol) : null; };
  // the light at a point of the world, for the eye that gets used to the dark: { ceu, fogo, rebate, dentro }, or null out of every volume
  L.at = function (X, Y, Z) {
    const TL = G.Space.TILE;
    for (const id of slots) { if (!id) continue; const e = kept.get(id); const b = G.S.buildings.get(id); if (!e || !e.vol || !b) continue;
      const y0 = G.Space.plinth(b).y0; const r = L.sample(e.vol, X - b.x * TL, Y - y0, Z - b.y * TL); if (r) return r; }
    return null;
  };
  L.drawn = [];
})(window.G = window.G || {});
