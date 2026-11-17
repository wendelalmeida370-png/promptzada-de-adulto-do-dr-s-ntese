'use strict';
// ============================================================
//  Mata3D: the forest between the ground and the crowns, in the
//  round — the floor's plants (the ferns, the aroids, the
//  heliconias, the seedlings, the bromeliads, the reeds, the
//  tussocks, the low shrubs, the fallen logs), the shrubs (the
//  clumps of palms, the broadleaf and the thorn bushes) and the
//  hard stems (the tree ferns, the young trees, the slim palms,
//  the bamboo, the embaúba of the gaps: G.Space.stems, where the
//  body cannot walk through them). Where each grows and how thick
//  is the forest's own rule (G.Mata: the growth, the canopy, the
//  wet, the edges, the gaps); which plant grows there is its
//  niche (the light, the water, the edge, the land), each in
//  patches, never strewn; its shape is one of the shapes of
//  PlantaFormas, varied by its size, its turn, its lean toward the
//  light, the spread of its leaves and its tint.
//  Drawn by the graphics card from one shape per kind, many times
//  (instancing): the plants of each chunk are made once — a few
//  rows at a time, never a third of a second in one frame — kept
//  in blocks of 8 × 8 m, and the blocks the eye sees within each
//  layer's reach are packed into one draw per kind. The wind of
//  the world sways them (the 3D's one wind, R3.U.wind) and the
//  body, the people and the beasts walking part them; under the
//  closed canopy they are in its shade (the canopy's map).
//  Only seen: nothing here touches the world (G.Mata only reads it).
// ============================================================
(function (G) {
  const M3 = G.Mata3D = { on: false, stats: { chunks: 0, built: 0, inst: 0, tris: 0, packs: 0, ms: 0, calls: 0 } };
  const TAU = Math.PI * 2, C = 16, TL = 4, SUB = 2, NS = C / SUB; // (a chunk of 16 tiles; blocks of 2 × 2 tiles, 8 × 8 a chunk)
  const STRIDE = 12; // (an instance: x, y, z, size · turn, lean x, lean z, phase · r, g, b, accent + spread)
  let THREE = null, R3 = null, PF = null; const KINDS = [];
  let canTex = null, canData = null, canN = 0;
  const U = { uEye: { value: null }, uBodyP: { value: null }, uPush: { value: [] }, uGust: { value: null }, uCan: { value: null }, uN: { value: 1 }, uShade: { value: 1 } };
  const PUSH = 8;
  // the quality's share of the forest (NATUREZA.md §3.3: each pillar adds its own fields — R3.qualAdd, never the table): mataR, the
  // reach of the floor's plants (m; 0 none) and mataRD the share of them drawn; mataA, the reach of the shrubs and the hard stems,
  // mataAD the share of the shrubs; cipo, the lianas and the epiphytes on the trees of the world (0 none, 1 near, 2 more of them)
  M3.qual = function () {
    if (!G.Realm || !G.Realm.qualAdd) return;
    const qa = G.Realm.qualAdd;
    qa('mataR', { baixa: 0, media: 16, alta: 34, ultra: 50 });
    qa('mataRD', { baixa: 0, media: 0.55, alta: 0.85, ultra: 1 });
    qa('mataA', { baixa: 30, media: 64, alta: 120, ultra: 190 });
    qa('mataAD', { baixa: 0.3, media: 0.65, alta: 1, ultra: 1 });
    qa('cipo', { baixa: 0, media: 1, alta: 1, ultra: 2 });
  };
  M3.qual();

  // ------------------------------ the recipes: which plant grows where ------------------------------
  // per land (G.Biome ids: 0 temperado, 1 neve, 2 taiga, 3 pântano, 4 selva, 5 savana, 6 deserto): the floor's plants and the shrubs,
  // each [kind, weight, niche]: niche — 'sombra' the deep shade of the canopy, 'luz' the gaps and the open, 'borda' the edges and the
  // trail sides, 'umido' the wet ground and the banks, '' anywhere; rd/ad: how many cells of the floor and of the shrubs grow at a
  // full growth (the jungle the most); and the hard stem of a young tree of the land
  const REC = [
    /* temperado */ { r: [['samambaia', 3, 'luz'], ['feto', 1.5, 'sombra'], ['plantula', 2, ''], ['rasteiro', 1, 'sombra'], ['tronco', 0.12, 'sombra']], a: [['arbusto', 3, ''], ['espinho', 0.4, 'luz']], rd: 0.55, ad: 0.45, young: 'arvoreta' },
    /* neve */ { r: [['tufo', 3, ''], ['rasteiro', 2, '']], a: [['espinho', 0.6, '']], rd: 0.4, ad: 0.12, young: 'abeto' },
    /* taiga */ { r: [['rasteiro', 3, ''], ['feto', 1, 'sombra'], ['tufo', 1, 'luz'], ['tronco', 0.15, 'sombra']], a: [['arbusto', 1, ''], ['espinho', 0.4, 'luz']], rd: 0.55, ad: 0.3, young: 'abeto' },
    /* pântano */ { r: [['junco', 4, 'agua'], ['feto', 1.5, 'sombra'], ['aracea', 1.2, 'umido'], ['tronco', 0.12, '']], a: [['touceira', 1.5, 'umido'], ['arbusto', 1, '']], rd: 0.8, ad: 0.45, young: 'arvoreta' },
    /* selva */ { r: [['feto', 3.2, 'sombra'], ['aracea', 2.6, 'sombra'], ['heliconia', 2.2, 'luz'], ['plantula', 2.2, ''], ['bromelia', 0.9, 'sombra'], ['tronco', 0.18, 'sombra'], ['junco', 0.8, 'agua']], a: [['touceira', 3, 'umido'], ['arbusto', 2.4, ''], ['plantula', 2.2, 'sombra'], ['heliconia', 1.0, 'luz'], ['aracea', 0.8, 'sombra']], rd: 1, ad: 1, young: 'arvoreta' },
    /* savana */ { r: [['tufo', 4, ''], ['rasteiro', 0.4, '']], a: [['espinho', 3, ''], ['arbusto', 0.5, 'umido']], rd: 0.5, ad: 0.25, young: 'arvoreta' },
    /* deserto */ { r: [['tufo', 3, '']], a: [['espinho', 2, '']], rd: 0.25, ad: 0.12, young: 'arvoreta' },
  ];
  // (the hard stem's drawing, by the kind G.Mata gives it: 0 tree fern, 1 young tree (the land's own), 2 slim palm, 3 bamboo, 4 embaúba)
  const STEMK = ['fetoArbo', null, 'palmeira', 'bambu', 'embauba'];
  // (the size of each drawn shape against the stem the body meets: a tree fern's trunk is 0,13 m at its foot, a slim palm's 0,11, an
  // embaúba's 0,12, a young tree's 0,07, a bamboo clump's culms within 0,2)
  const STEMS = { fetoArbo: 0.13, palmeira: 0.11, embauba: 0.12, arvoreta: 0.07, abeto: 0.06, bambu: 0.2 };
  // how wide each shape stands (m, at size 1): no plant inside a trunk, a stem or a boulder
  const WIDE = { feto: 0.5, samambaia: 0.4, aracea: 0.45, heliconia: 0.4, plantula: 0.15, bromelia: 0.25, touceira: 0.9, arbusto: 0.75, espinho: 0.6, tufo: 0.3, rasteiro: 0.4, junco: 0.3, tronco: 0.4 };
  // (the size of each, its spread: [least, most])
  const SIZE = { feto: [0.7, 1.45], samambaia: [0.7, 1.3], aracea: [0.7, 1.6], heliconia: [0.75, 1.4], plantula: [0.6, 1.6], bromelia: [0.7, 1.3], touceira: [0.75, 1.3], arbusto: [0.7, 1.5], espinho: [0.7, 1.4], tufo: [0.6, 1.4], rasteiro: [0.7, 1.4], junco: [0.8, 1.3], tronco: [0.8, 1.25] };
  // (the floor's plants grown into the shrubs' storey: the sapling of the shade to two or three metres, the big heliconia, the giant aroid)
  const SIZEA = { plantula: [3.2, 5.6], heliconia: [1.6, 2.4], aracea: [1.8, 2.8] };
  // (the land's tint over a kind's own green: the jungle's deep green, the taiga's cold dark, the savanna's straw, the desert's grey)
  const TINT = [[1, 1, 1], [0.92, 0.98, 1.02], [0.85, 0.95, 1.0], [0.98, 1.0, 0.92], [0.86, 0.96, 0.86], [1.25, 1.12, 0.82], [1.3, 1.18, 0.95]];
  const hh = (a, b) => G.hash(((a | 0) * 73856093) ^ ((b | 0) * 19349663));
  // (a slow noise of a kind's patches over the land: each plant grows where its kind is thick, in patches of some seven metres)
  function patch(kn, X, Z) { const s = 7, gx = X / s, gz = Z / s, x0 = Math.floor(gx), z0 = Math.floor(gz), fx = gx - x0, fz = gz - z0; const sd = (G.S.seed | 0) + kn * 7919;
    const a = hh(x0 + sd, z0), b = hh(x0 + 1 + sd, z0), c = hh(x0 + sd, z0 + 1), d = hh(x0 + 1 + sd, z0 + 1); const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz); return (a + (b - a) * ux) * (1 - uz) + (c + (d - c) * ux) * uz; }
  const nicheW = (n, nc) => (n === 'sombra' ? 0.25 + 1.5 * (1 - nc.luz) : n === 'luz' ? 0.15 + 1.6 * Math.max(nc.luz, nc.clar, nc.borda) : n === 'borda' ? 0.2 + 1.6 * nc.borda : n === 'umido' ? 0.05 + 2 * Math.max(0, nc.umid - 0.45) : n === 'agua' ? 0.02 + 3 * nc.agua : 1);

  // ------------------------------ making the plants of a chunk ------------------------------
  // the plants of a chunk, from the world as it is now: per kind, its instances sorted in the blocks of 8 m (each block by a rank
  // of its own, so a share of a block is its first plants — the qualities draw a share without making them again)
  M3.plan = function (cx, cy) { const g = makeGen(cx, cy); let r; do { r = g.next(); } while (!r.done); return r.value; };
  function* makeGen(cx, cy) {
    const S = G.S, N = G.N, W = G.W, T = G.T, Ma = G.Mata, HM = G.Space.HM; PF = PF || G.PlantaFormas;
    const reg = Ma.region(cx, cy); const out = { cx, cy, sig: reg ? reg.sig : 0, kinds: new Map(), n: 0 };
    if (!reg) return out;
    const x0 = cx * C, y0 = cy * C; const lists = new Map();
    const add = (kid, layer, X, Z, s, rot, lx, lz, col, acc, sp, rank) => {
      const tx = X / TL, tz = Z / TL; const Y = W.hAt(Math.min(N - 0.001, tx), Math.min(N - 0.001, tz)) * HM - 0.03;
      const key = kid + '|' + layer; let L = lists.get(key); if (!L) lists.set(key, L = { kid, layer, items: [] });
      const sb = Math.floor((tz - y0) / SUB) * NS + Math.floor((tx - x0) / SUB);
      L.items.push([sb, rank, X, Y, Z, s, rot, lx, lz, hh(X * 100, Z * 100) * TAU, col[0], col[1], col[2], acc + Math.min(0.99, Math.max(0, sp))]);
    };
    const R = Ma.R; const rk = (x, y) => (y - reg.y0) * R + (x - reg.x0);
    const at = (x, y) => (x >= x0 && y >= y0 && x < x0 + C && y < y0 + C) ? rk(x, y) : -1;
    const densAt = (X, Z) => { // (the growth between the tiles' middles, smooth: the edge of a thicket never follows the grid)
      const gx = X / TL - 0.5, gz = Z / TL - 0.5; const ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz; let s = 0, w = 0;
      for (let dz = 0; dz <= 1; dz++) for (let dx = 0; dx <= 1; dx++) { const k = at(ix + dx, iz + dz); const ww = (dx ? fx : 1 - fx) * (dz ? fz : 1 - fz); if (k >= 0) { s += reg.dens[k] * ww; w += ww; } else { const i = (iz + dz) * N + ix + dx; if (ix + dx >= 0 && iz + dz >= 0 && ix + dx < N && iz + dz < N) { const o = Ma.regionNow(Math.floor((ix + dx) / R), Math.floor((iz + dz) / R)); if (o) { s += o.dens[(iz + dz - o.y0) * R + (ix + dx - o.x0)] * ww; w += ww; } } } }
      return w > 0 ? s / w / 255 : 0; };
    // (what is hard round a point: the trunks of the trees of the world, the stems, the boulders; and the land under it)
    const trunks = [], stems = [], stones = [];
    for (let y = y0 - 1; y <= y0 + C; y++) for (let x = x0 - 1; x <= x0 + C; x++) { if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x;
      // (each trunk where the save keeps it, to the hundredth, and a hair wider: the same forest after a load)
      const t = S.trees.get(S.treeAt[i]); if (t) { const tx = Ma.r2(t.x) * TL, tz = Ma.r2(t.y) * TL; const tr = t.stage === 'grow' ? (G.Space.trunk(t, Math.ceil(Ma.r2(t.size) * 10) / 10) || 0.2) + 0.03 : t.stage === 'log' || t.stage === 'fall' ? 0 : 0.35; if (tr) trunks.push([tx, tz, tr]);
        if (t.stage === 'log') { const L2 = 4.5 * Math.max(0.4, Ma.r2(t.size)) / 2; for (let q = -2; q <= 2; q++) trunks.push([tx + q * L2 / 2, tz, 0.35]); } }
      const o = S.objAt[i]; if (o) { const rk2 = S.rocks.get(o); if (rk2) for (const st of G.Space.stones(rk2)) stones.push([st.X, st.Z, Math.max(st.sx, st.sz) * 0.55]); else { const b = S.bushes.get(o); if (b) stones.push([b.x * TL, b.y * TL, 0.8]); } }
      for (const st of Ma.stemsOf(i)) stems.push(st); }
    const clear = (X, Z, rr, soft) => { for (const t of trunks) if ((X - t[0]) ** 2 + (Z - t[1]) ** 2 < (t[2] + rr) ** 2) return false; for (const s of stones) if ((X - s[0]) ** 2 + (Z - s[1]) ** 2 < (s[2] + rr) ** 2) return false;
      for (const s of stems) if ((X - s[0]) ** 2 + (Z - s[1]) ** 2 < (s[2] + (soft ? 0.08 : rr)) ** 2) return false; return true; };
    const landOK = i => { const ty = S.type[i]; if ((ty <= T.RIVER && !(S.dry && S.dry[i])) || S.road[i] || S.occ[i] || S.wall[i] || S.cliff[i] || S.fire[i] > 0.05 || G.pathLevel(S.wear[i]) >= 2) return false; return !(G.Caves && G.Caves.isMouth && G.Caves.isMouth(i)); };
    const colOf = (kid, b, nc, X, Z) => { const k = PF.BY[kid]; const t = TINT[b] || TINT[0]; const v = 0.86 + hh(X * 31, Z * 17) * 0.28, w = hh(X * 7, Z * 13) - 0.5;
      // (yellower in the light of a gap, bluer in the deep shade; a young leaf now and then a little red, as the new leaves of the south are)
      const sun = nc.luz; let c = [k.col[0] * t[0] * v * (1 + w * 0.1) * (0.94 + sun * 0.1), k.col[1] * t[1] * v * (0.97 + sun * 0.05), k.col[2] * t[2] * v * (1 - w * 0.1) * (1.06 - sun * 0.1)];
      if (b === 4 && hh(X * 3, Z * 5) < 0.03 && k.layer === 'r') c = [c[0] * 1.5, c[1] * 0.85, c[2] * 0.8];
      const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]; c = c.map(q => l + (q - l) * 0.82); // (quiet: moss and leaf, never neon — the BIBLE's line)
      return c.map(q => Math.pow(Math.min(255, Math.max(0, q)) / 255, 2.2)); };
    const pick = (list, nc, X, Z, h) => { let tot = 0; const ws = list.map(([kid, w, n]) => { const p = patch(PF.BY[kid].n, X, Z); const ww = w * nicheW(n, nc) * (0.15 + 1.7 * p * p); tot += ww; return ww; }); let r = h * tot; for (let q = 0; q < list.length; q++) { r -= ws[q]; if (r <= 0) return list[q][0]; } return list[list.length - 1][0]; };
    const nicheAt = (x, y) => { const k = at(x, y); return k < 0 ? null : Ma.niche(reg, x - reg.x0, y - reg.y0, x, y); };
    // the floor's plants: a cell of 1,2 m, its plant where the hash of the cell puts it
    const CR = 64 / 54; let rows = 0;
    for (let gz = 0; gz < 54; gz++) {
      for (let gx = 0; gx < 54; gx++) {
        const hc = hh(cx * 54 + gx + 1e5, cy * 54 + gz); const X = (x0 * TL) + (gx + 0.1 + hh(gx + cx * 999, gz + cy * 777) * 0.8) * CR, Z = (y0 * TL) + (gz + 0.1 + hh(gz + cy * 555, gx + cx * 333) * 0.8) * CR;
        const x = Math.floor(X / TL), y = Math.floor(Z / TL); if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (!landOK(i)) continue;
        const b = S.biome ? S.biome[i] : 0; const rc = REC[b] || REC[0]; const d = densAt(X, Z) + (hh(X * 9, Z * 11) - 0.5) * 0.18;
        if (hc > d * rc.rd) continue;
        const nc = nicheAt(x, y); if (!nc) continue; const kid = pick(rc.r, nc, X, Z, hh(X * 13, Z * 19)); const sz = SIZE[kid] || [0.8, 1.2];
        const s = sz[0] + (sz[1] - sz[0]) * Math.pow(hh(X * 17, Z * 23), 1.3) * (0.7 + d * 0.3); if (!clear(X, Z, (WIDE[kid] || 0.3) * s * 0.6, true)) continue;
        // (they lean toward the light of a gap or an edge)
        const lean = 0.05 + nc.borda * 0.22; const la = hh(X * 41, Z * 43) * TAU;
        const acc = PF.BY[kid].acc ? Math.floor(hh(X * 5, Z * 7) * 3) : 0;
        add(kid, kid === 'tronco' ? 'a' : 'r', X, Z, s, hh(X * 29, Z * 31) * TAU, Math.cos(la) * lean, Math.sin(la) * lean, colOf(kid, b, nc, X, Z), acc, hh(X * 37, Z * 47), hh(X * 53, Z * 59));
      }
      if (++rows % 9 === 0) yield null;
    }
    // the shrubs: a cell of 2,56 m
    for (let gz = 0; gz < 25; gz++) {
      for (let gx = 0; gx < 25; gx++) {
        const hc = hh(cx * 25 + gx + 3e5, cy * 25 + gz); const X = x0 * TL + (gx + 0.15 + hh(gx + cx * 91, gz + cy * 97) * 0.7) * 2.56, Z = y0 * TL + (gz + 0.15 + hh(gz + cy * 89, gx + cx * 83) * 0.7) * 2.56;
        const x = Math.floor(X / TL), y = Math.floor(Z / TL); if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (!landOK(i) || G.pathLevel(S.wear[i]) >= 1) continue;
        const b = S.biome ? S.biome[i] : 0; const rc = REC[b] || REC[0]; const d = densAt(X, Z);
        if (hc > d * rc.ad) continue;
        const nc = nicheAt(x, y); if (!nc) continue; const kid = pick(rc.a, nc, X, Z, hh(X * 61, Z * 67)); const sz = SIZEA[kid] || SIZE[kid] || [0.8, 1.2];
        const s = sz[0] + (sz[1] - sz[0]) * hh(X * 71, Z * 73) * (0.6 + d * 0.4); if (!clear(X, Z, (WIDE[kid] || 0.6) * s, false)) continue;
        const lean = 0.03 + nc.borda * 0.15; const la = hh(X * 79, Z * 81) * TAU;
        add(kid, 'a', X, Z, s, hh(X * 83, Z * 87) * TAU, Math.cos(la) * lean, Math.sin(la) * lean, colOf(kid, b, nc, X, Z), PF.BY[kid].acc ? Math.floor(hh(X * 5, Z * 3) * 3) : 0, hh(X * 89, Z * 97), hh(X * 101, Z * 103));
      }
      if (gz % 7 === 6) yield null;
    }
    // the hard stems: where the forest's rule puts them, exactly (the body meets them there)
    for (const st of stems) { const x = Math.floor(st[0] / TL), y = Math.floor(st[1] / TL); if (at(x, y) < 0) continue; const i = y * N + x; const b = S.biome ? S.biome[i] : 0;
      const kid = STEMK[st[3]] || (REC[b] || REC[0]).young; const nc = nicheAt(x, y); const s = (st[2] / (STEMS[kid] || 0.1)) * (st[3] === 3 ? 1 : 1) * (0.97 + hh(st[0] * 3, st[1] * 5) * 0.06);
      const hs = st[3] === 1 ? 0.75 + hh(st[0], st[1]) * 0.6 : 0.85 + hh(st[0] * 7, st[1] * 3) * 0.35; // (a young tree's height its own; the trunk's girth the stem's)
      add(kid, 's', st[0], st[1], s, hh(st[0] * 11, st[1] * 13) * TAU, 0, 0, colOf(kid, b, nc, st[0], st[1]), 0, Math.min(0.99, hs - 0.6), hh(st[0] * 17, st[1] * 19)); }
    // (each kind's instances, sorted by block and then by rank: a share of a block is its first ones)
    for (const L of lists.values()) {
      L.items.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const n = L.items.length; const data = new Float32Array(n * STRIDE); const start = new Int32Array(NS * NS + 1);
      let k = 0; for (let sb = 0; sb < NS * NS; sb++) { start[sb] = k; while (k < n && L.items[k][0] === sb) { const it = L.items[k]; for (let q = 0; q < STRIDE; q++) data[k * STRIDE + q] = it[q + 2]; k++; } } start[NS * NS] = n;
      out.kinds.set(L.kid + '|' + L.layer, { kid: L.kid, layer: L.layer, data, start, n }); out.n += n;
    }
    // (and the canopy of this region into the 3D's map of it: the shade under the trees)
    if (canData && reg) { for (let ly = 0; ly < R; ly++) for (let lx = 0; lx < R; lx++) { const x = reg.x0 + lx, y = reg.y0 + ly; if (x < canN && y < canN) canData[y * canN + x] = reg.dossel[ly * R + lx]; } if (canTex) canTex.needsUpdate = true; }
    return out;
  }

  // ------------------------------ the drawing ------------------------------
  // the shader: each instance placed, turned, leaning, its leaves spread or gathered, swaying with the wind and the gusts, parted by
  // who walks in it, thinned out at the edge of its layer's reach; coloured from its own tint, darker at the base and lighter at the
  // tips, its accent (a bract, a berry, a fungus), in the shade of the canopy over it; never between the eye and the body
  function material(kind) {
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }); m.defines = { RIM: 0.22 };
    const acc = (kind.acc || [[200, 60, 40], [200, 60, 40], [200, 60, 40]]).map(c => new THREE.Color().setRGB(Math.pow(c[0] / 255, 2.2), Math.pow(c[1] / 255, 2.2), Math.pow(c[2] / 255, 2.2)));
    const bark = kind.bark ? new THREE.Color().setRGB(Math.pow(kind.bark[0] / 255, 2.2), Math.pow(kind.bark[1] / 255, 2.2), Math.pow(kind.bark[2] / 255, 2.2)) : null;
    const moss = kind.moss ? new THREE.Color().setRGB(Math.pow(kind.moss[0] / 255, 2.2), Math.pow(kind.moss[1] / 255, 2.2), Math.pow(kind.moss[2] / 255, 2.2)) : null;
    const uR = { value: 30 };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U, { uTime: R3.U.time, uWind: R3.U.wind, uBody: R3.U.body, uR, uAcc: { value: acc }, uBark: { value: bark || new THREE.Color(0.2, 0.15, 0.1) }, uMoss: { value: moss || new THREE.Color(0.05, 0.1, 0.03) } });
      sh.vertexShader = `attribute vec4 iA; attribute vec4 iB; attribute vec4 iC; attribute float aK; attribute float aC; attribute float aA;
        uniform vec3 uEye; uniform float uR; uniform float uTime; uniform vec3 uWind; uniform vec4 uBody; uniform vec4 uPush[${PUSH}]; uniform sampler2D uGust; uniform sampler2D uCan; uniform float uN; uniform vec3 uAcc[3]; uniform vec3 uBark; uniform vec3 uMoss;
        varying vec3 vMC; varying vec3 vMW; varying float vMU;
        ` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
        float mDist = length(iA.xyz - uEye); float mFade = 1.0 - smoothstep(uR * 0.78, uR, mDist);
        float mSp = fract(iC.w), mAcc = floor(iC.w + 0.001); float ca = cos(iB.x), sa = sin(iB.x);
        vec3 objectNormal = vec3(ca * normal.x + sa * normal.z, normal.y, -sa * normal.x + ca * normal.z);
        // (a leaf is lit as much from above as along itself: the undergrowth in the shade is the shade's green, not black)
        objectNormal = normalize(mix(objectNormal, vec3(0.0, 1.0, 0.0), 0.3 * step(0.02, aK)));`)
        .replace('#include <begin_vertex>', `
        vec3 mp = position; mp.y *= 0.84 + 0.32 * mSp; mp.xz *= 1.16 - 0.32 * mSp;
        mp = vec3(ca * mp.x + sa * mp.z, mp.y, -sa * mp.x + ca * mp.z) * iA.w * mFade;
        mp.xz += iB.yz * mp.y;
        vec3 transformed = iA.xyz + mp;
        { vec2 wd = uWind.xy; float ws = length(wd) + 1e-4; float gust = smoothstep(0.42, 0.86, texture2D(uGust, (transformed.xz - uWind.xy * uTime * 1.7) / 52.0).r);
          float sw = sin(uTime * (1.4 + uWind.z * 1.2) + iB.w * 6.28 + transformed.y * 0.35) * 0.55 + sin(uTime * 3.1 + iB.w * 11.0 + position.x * 2.0) * 0.18;
          // (the shrub's tips move, its foot not; the gusts run over the forest as over the meadow)
          transformed.xz += (wd / ws) * aK * (sw * (0.1 + uWind.z * 0.22) + gust * (0.18 + uWind.z * 0.25)) * (0.4 + 0.6 * min(1.0, mp.y * 0.6));
          // (who walks in it parts it: the body, the people, the beasts nearest)
          vec2 push = vec2(0.0); float pk = 0.0;
          { vec2 dv = transformed.xz - uBody.xz; float dd = length(dv); float k = uBody.w * (1.0 - smoothstep(0.35, 1.25, dd)); push += dv / max(dd, 1e-3) * k; pk = max(pk, k); }
          for (int j = 0; j < ${PUSH}; j++) { vec2 dv = transformed.xz - uPush[j].xz; float dd = length(dv); float k = uPush[j].w * (1.0 - smoothstep(0.3, 0.6 + uPush[j].w * 0.6, dd)); push += dv / max(dd, 1e-3) * k * 0.85; pk = max(pk, k * 0.85); }
          transformed.xz += push * aK * 0.55; transformed.y -= pk * aK * 0.25 * min(1.0, mp.y); }
        // (its colour: the instance's tint, darker at the base, lighter and warmer at the tips; a hard stem's wood its kind's bark; the
        // accent of a bract, a berry, a fungus; a fallen log's back green with moss)
        { vec3 base = iC.rgb; vec3 tip = base * vec3(1.18, 1.14, 0.96) + vec3(0.012, 0.012, 0.0);
          vec3 c = mix(base * 0.55, tip, aC);
          ${bark ? 'c = mix(uBark * (0.75 + aC * 0.4), c, step(0.02, aK));' : ''}
          ${moss ? 'c = mix(c, uMoss * (0.8 + aC * 0.3), smoothstep(0.55, 0.8, normal.y) * 0.85);' : ''}
          vec3 ac = mAcc < 0.5 ? uAcc[0] : mAcc < 1.5 ? uAcc[1] : uAcc[2]; c = mix(c, ac, aA);
          // (the shade of the canopy over it: deeper and a little blue-green — the forest's own light, Mata's map)
          float can = texture2D(uCan, (iA.xz / 4.0) / uN).r; c *= mix(vec3(1.0), vec3(0.6, 0.66, 0.66), can * uShade);
          vMC = c; vMU = aC; }
        vMW = transformed;`);
      sh.fragmentShader = `uniform vec3 uEye; uniform vec4 uBody; varying vec3 vMC; varying vec3 vMW; varying float vMU;\n` + sh.fragmentShader
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        // (never a wall of leaves across the view: right at the eye they thin out, and between the eye and the body none stands)
        { float hz = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453); float ed = length(vMW - cameraPosition);
          if (ed < 1.4 && hz > smoothstep(0.5, 1.4, ed)) discard;
          if (uBody.w > 0.0) { vec3 a = cameraPosition, b = uBody.xyz + vec3(0.0, 1.0, 0.0); vec3 ab = b - a; float t = clamp(dot(vMW - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
            float dl = length(vMW - (a + ab * t)); if (t < 0.97 && dl < 0.7 && hz > smoothstep(0.35, 0.7, dl)) discard; } }`)
        .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = vMC;')
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = normal * faceDirection;')
        .replace('#include <opaque_fragment>', `
        #if NUM_DIR_LIGHTS > 0
        // (the sun behind the leaves shines through them)
        { float bl = saturate(dot(-normalize(vViewPosition), directionalLights[0].direction)); outgoingLight += vMC * directionalLights[0].color * pow(bl, 3.0) * 0.3 * vMU; }
        #endif
        outgoingLight += vMC * 0.04 * (0.5 + vMU);
        #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => 'mata3d-' + (bark ? 'b' : '') + (moss ? 'm' : '');
    m.uR = uR; return m;
  }
  // a kind's draw: its shape (shared), the instances packed for this frame, its material
  function pool(kind) {
    const s = PF.shape(kind.id); const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(s.P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(s.N, 3));
    g.setAttribute('aK', new THREE.BufferAttribute(s.K, 1)); g.setAttribute('aC', new THREE.BufferAttribute(s.C, 1)); g.setAttribute('aA', new THREE.BufferAttribute(s.A, 1)); g.setIndex(new THREE.BufferAttribute(s.I, 1));
    const p = { kind, shape: s, geo: g, mat: material(kind), cap: 0, buf: null, mesh: null, n: 0 };
    grow(p, 256); p.mesh = new THREE.Mesh(g, p.mat); p.mesh.frustumCulled = false; p.mesh.receiveShadow = true; p.mesh.castShadow = false; p.mesh.visible = false; p.mesh.matrixAutoUpdate = false;
    return p;
  }
  function grow(p, n) {
    if (n <= p.cap) return; p.cap = Math.max(n, Math.ceil(p.cap * 1.5)); p.buf = new Float32Array(p.cap * STRIDE);
    const ib = new THREE.InstancedInterleavedBuffer(p.buf, STRIDE, 1); ib.setUsage(THREE.DynamicDrawUsage);
    p.geo.setAttribute('iA', new THREE.InterleavedBufferAttribute(ib, 4, 0)); p.geo.setAttribute('iB', new THREE.InterleavedBufferAttribute(ib, 4, 4)); p.geo.setAttribute('iC', new THREE.InterleavedBufferAttribute(ib, 4, 8)); p.ib = ib;
  }
  const pools = new Map(); // (kid|layer → pool)
  M3.init = function (three, realm) {
    THREE = three; R3 = realm; PF = G.PlantaFormas; if (!PF) return;
    U.uEye.value = new THREE.Vector3(); U.uBodyP.value = new THREE.Vector3(); for (let k = 0; k < PUSH; k++) U.uPush.value.push(new THREE.Vector4(0, -1e4, 0, 0));
    U.uGust.value = G.Ground3D.cloudNoise();
    canTex = new THREE.DataTexture(new Uint8Array(4), 2, 2, THREE.RedFormat, THREE.UnsignedByteType); canTex.magFilter = canTex.minFilter = THREE.LinearFilter; canTex.generateMipmaps = false; canTex.flipY = false; canTex.needsUpdate = true; U.uCan.value = canTex;
  };
  function poolOf(kid, layer) { const key = kid + '|' + layer; let p = pools.get(key); if (!p) { const kind = PF.BY[kid]; if (!kind) return null; p = pool(kind); p.layer = layer; pools.set(key, p); R3.scene().add(p.mesh); } return p; }
  // (the canopy's map for the shade, one texel a tile: made again for a new world)
  function canopyTex() { const N = G.N; if (canData && canN === N) return; canN = N; canData = new Uint8Array(N * N); canTex.dispose(); canTex = new THREE.DataTexture(canData, N, N, THREE.RedFormat, THREE.UnsignedByteType); canTex.magFilter = canTex.minFilter = THREE.LinearFilter; canTex.generateMipmaps = false; canTex.flipY = false; canTex.needsUpdate = true; U.uCan.value = canTex; U.uN.value = N; }

  // ------------------------------ the chunks round the eye ------------------------------
  let plans = new Map(), jobs = [], cur = null, packKey = '', checkAt = 0, forS = null, qKey = '';
  G.worldHooks.push(() => { plans = new Map(); jobs = []; cur = null; packKey = ''; forS = null; canData = null; canN = 0; });
  const ck = (cx, cy) => cy * 4096 + cx;
  const _fr = { f: null, m: null };
  M3.update = function (dt, focus, cam) {
    if (!THREE || !PF || !focus || !G.Mata) return; const q = R3.Q(); const S = G.S; const N = G.N;
    if (forS !== S) { forS = S; plans = new Map(); jobs = []; cur = null; packKey = ''; canData = null; canN = 0; }
    canopyTex();
    const RR = Number.isFinite(q.mataR) ? q.mataR : 16, RA = Number.isFinite(q.mataA) ? q.mataA : 64; const DR = Number.isFinite(q.mataRD) ? q.mataRD : 0.55, DA = Number.isFinite(q.mataAD) ? q.mataAD : 0.65;
    M3.on = RA > 0; if (!M3.on) { for (const p of pools.values()) p.mesh.visible = false; return; }
    const t0 = performance.now(); const e = cam ? cam.position : { x: focus.X, y: focus.Y, z: focus.Z };
    U.uEye.value.set(e.x, e.y, e.z);
    // (the chunks within the shrubs' reach: their plans made, the nearest first, a few rows a frame; those far behind let go)
    const ccx = Math.floor(focus.X / TL / C), ccy = Math.floor(focus.Z / TL / C), RC = Math.ceil(RA / (C * TL)) + 1; const want = new Set();
    for (let dy = -RC; dy <= RC; dy++) for (let dx = -RC; dx <= RC; dx++) { const cx = ccx + dx, cy = ccy + dy; if (cx < 0 || cy < 0 || cx * C >= N || cy * C >= N) continue;
      const nx = Math.max(cx * C * TL - focus.X, 0, focus.X - (cx + 1) * C * TL), nz = Math.max(cy * C * TL - focus.Z, 0, focus.Z - (cy + 1) * C * TL); if (Math.hypot(nx, nz) > RA + 8) continue; want.add(ck(cx, cy)); }
    for (const k of [...plans.keys()]) if (!want.has(k)) { plans.delete(k); packKey = ''; }
    // (a plan whose forest changed — a tree felled, a fire, a road — is made again: one looked at each frame, the body's own often)
    if ((checkAt += dt) > 0.3) { checkAt = 0; for (const k of want) { const p = plans.get(k); if (!p || p.stale) continue; const cx = k % 4096, cy = Math.floor(k / 4096); const r = G.Mata.regionNow(cx, cy); if (r && r.sig !== p.sig) { p.stale = true; } } }
    const order = [...want].map(k => { const cx = k % 4096, cy = Math.floor(k / 4096); return [Math.hypot((cx + 0.5) * C * TL - focus.X, (cy + 0.5) * C * TL - focus.Z), cx, cy, k]; }).sort((a, b) => a[0] - b[0]);
    const budget = q.near >= 4 ? 4 : 2.5;
    while (performance.now() - t0 < budget) {
      if (!cur) { const nx = order.find(o => !plans.has(o[3]) || plans.get(o[3]).stale); if (!nx) break; cur = { k: nx[3], gen: makeGen(nx[1], nx[2]) }; }
      const r = cur.gen.next(); if (r.done) { plans.set(cur.k, r.value); M3.stats.built++; cur = null; packKey = ''; }
    }
    // (the blocks the eye sees within each layer's reach, packed into one draw per kind — made again only when what is seen changes)
    if (cam) { if (!_fr.f) { _fr.f = new THREE.Frustum(); _fr.m = new THREE.Matrix4(); } _fr.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); _fr.f.setFromProjectionMatrix(_fr.m); }
    const sph = M3._sph || (M3._sph = new THREE.Sphere(new THREE.Vector3(), 14)); const vis = [];
    for (const [k, p] of plans) { const cx = p.cx, cy = p.cy;
      for (let sb = 0; sb < NS * NS; sb++) { const X = (cx * C + (sb % NS) * SUB + SUB / 2) * TL, Z = (cy * C + Math.floor(sb / NS) * SUB + SUB / 2) * TL; const d = Math.hypot(X - focus.X, Z - focus.Z); if (d > RA + 8) continue;
        if (cam) { sph.center.set(X, G.W.hAt(Math.min(N - 0.01, X / TL), Math.min(N - 0.01, Z / TL)) * G.Space.HM + 4, Z); if (!_fr.f.intersectsSphere(sph)) continue; }
        vis.push(k * 64 + sb); } }
    const key = vis.join(',') + '|' + RR + '|' + RA + '|' + DR + '|' + DA;
    if (key !== packKey) { packKey = key; pack(vis, focus, RR, RA, DR, DA); M3.stats.packs++; }
    // (who walks in it: the people drawn nearest, and the beasts)
    const W3 = (G.People3D && G.People3D.walkers) || []; let j = 0;
    for (const w of W3) { if (j >= PUSH - 3) break; if ((w[0] - focus.X) ** 2 + (w[2] - focus.Z) ** 2 > 30 * 30) continue; U.uPush.value[j++].set(w[0], w[1], w[2], 1); }
    if (G.Animals && G.Animals.near) G.Animals.near(focus.X / TL, focus.Z / TL, 6, a => { if (j >= PUSH || a.dead || a.air || a.swim) return; const sz = (G.Animals.SP && G.Animals.SP[a.kind] && G.Animals.SP[a.kind].size) || 1; U.uPush.value[j++].set(a.x * TL, 0, a.y * TL, Math.min(1.6, 0.5 + sz * 0.4)); });
    for (; j < PUSH; j++) U.uPush.value[j].set(0, -1e4, 0, 0);
    for (const p of pools.values()) p.mat.uR.value = p.layer === 'r' ? RR : RA;
    M3.stats.ms = M3.stats.ms * 0.95 + (performance.now() - t0) * 0.05; M3.stats.chunks = plans.size;
  };
  // (copy the blocks seen into each kind's buffer: the share of a block the quality draws, fewer of the floor's toward its edge)
  function pack(vis, focus, RR, RA, DR, DA) {
    const counts = new Map(); for (const p of pools.values()) counts.set(p, 0);
    const parts = [];
    for (const v of vis) { const k = Math.floor(v / 64), sb = v % 64; const plan = plans.get(k); if (!plan) continue; const X = (plan.cx * C + (sb % NS) * SUB + SUB / 2) * TL, Z = (plan.cy * C + Math.floor(sb / NS) * SUB + SUB / 2) * TL; const d = Math.hypot(X - focus.X, Z - focus.Z);
      for (const L of plan.kinds.values()) { const s0 = L.start[sb], s1 = L.start[sb + 1]; if (s1 <= s0) continue; const R = L.layer === 'r' ? RR : RA; if (d > R + 6) continue;
        const share = L.layer === 'r' ? DR * (d > R * 0.55 ? 0.65 : 1) : L.layer === 'a' ? DA * (d > R * 0.6 ? 0.7 : 1) : 1; const n = Math.ceil((s1 - s0) * share); if (n <= 0) continue;
        const p = poolOf(L.kid, L.layer); if (!p) continue; parts.push([p, L.data, s0, n]); counts.set(p, (counts.get(p) || 0) + n); } }
    for (const [p, n] of counts) grow(p, n);
    for (const p of pools.values()) p.n = 0;
    for (const [p, data, s0, n] of parts) { p.buf.set(data.subarray(s0 * STRIDE, (s0 + n) * STRIDE), p.n * STRIDE); p.n += n; }
    let inst = 0, tris = 0, calls = 0;
    for (const p of pools.values()) { p.geo.instanceCount = p.n; p.mesh.visible = p.n > 0; if (p.n) { p.ib.needsUpdate = true; p.ib.clearUpdateRanges && p.ib.clearUpdateRanges(); p.ib.addUpdateRange && p.ib.addUpdateRange(0, p.n * STRIDE); inst += p.n; tris += p.n * p.shape.tris; calls++; } }
    M3.stats.inst = inst; M3.stats.tris = tris; M3.stats.calls = calls;
  }
  M3.clear = function () { plans = new Map(); jobs = []; cur = null; packKey = ''; for (const p of pools.values()) { p.mesh.visible = false; p.n = 0; } };
  // (for the tests: what is wrong in the drawing — a plan not a number, a plant off the ground, on what cannot have one, inside a trunk)
  M3.check = function (plan) {
    const out = []; const S = G.S, N = G.N, T = G.T, W = G.W, HM = G.Space.HM; const list = plan ? [plan] : [...plans.values()];
    for (const p of list) for (const L of p.kinds.values()) for (let k = 0; k < L.n; k++) {
      const o = k * STRIDE; const X = L.data[o], Y = L.data[o + 1], Z = L.data[o + 2], s = L.data[o + 3];
      if (![X, Y, Z, s].every(Number.isFinite) || s <= 0) { out.push(`mata: ${L.kid} com um número que não é número`); continue; }
      const x = Math.floor(X / TL), y = Math.floor(Z / TL); if (!W.inb(x, y)) { out.push(`mata: ${L.kid} fora do mapa`); continue; } const i = y * N + x;
      const g = W.hAt(X / TL, Z / TL) * HM; if (Math.abs(Y - g) > 0.2) out.push(`mata: ${L.kid} em ${x},${y} a ${(Y - g).toFixed(2)} m do chão`);
      if (S.road[i] || S.occ[i] || S.wall[i] || (S.type[i] <= T.RIVER && !(S.dry && S.dry[i]))) out.push(`mata: ${L.kid} em ${x},${y} sobre ${S.road[i] ? 'estrada' : S.occ[i] ? 'prédio' : S.wall[i] ? 'muro' : 'água'}`);
      if (out.length > 20) return out;
    }
    return out;
  };
  M3.plans = () => plans;
  M3.STRIDE = STRIDE; M3.REC = REC; M3.SUB = SUB;
  M3._gen = (cx, cy) => makeGen(cx, cy); // (for the proofs: the plan of a chunk, slice by slice)
})(window.G);
