'use strict';
// ============================================================
//  Movel3D: the furniture modelled outside the game (the interiors
//  2.0, D-650; the front P2 — planos/interiores-2-contrato.md,
//  D-710 to D-719): the pieces of the plan's catalogue (int-moveis.js)
//  as Blender shapes, written by arte/blender/moveis.py into
//  js/movelmesh.js, for each kind, people and size — read back
//  through G.Mesh3D. Where there is no model, has() says false and
//  the 3D draws the piece as it did before (Build3D's FURN).
//  A model fits the plan's piece: the nearest of its kind for the
//  piece's people (or the people whose model it borrows:
//  G.MOVEIS.alias), turned a quarter when the piece lies the other
//  way, stretched only a little to its rectangle — never out of it
//  (the body bumps the rectangle, not the mesh).
//  What each part is made of is the people's: its woods, its paint,
//  its stone and plaster, its cloth (woven only where the people
//  weaves; skins where it does not), its leather and its fired clay
//  only where it has had them, and its fittings of iron where it has
//  iron, of bronze where only bronze, of withies where it has
//  neither (D-440: nada vem do nada — G.Origem.matOK); the rich
//  house's piece its own (the inlaid table, the round table of
//  stone). Only seen: nothing here touches the world, nor draws on
//  any chance; a piece's look is chosen by its kind, its people, its
//  size and its id (G.hash), never by a draw.
// ============================================================
(function (G) {
  const V = G.Movel3D = {};
  const TAU = Math.PI * 2;
  // (how far a model may be stretched to its piece: a bench a fifth shorter, a table a little wider — no more, or it is not the piece)
  V.FIT = [0.78, 1.28];
  // the parts a model is made of, in the order the file keeps them (arte/blender/moveis_pecas.py)
  V.PARTS = ['madeira', 'madeira2', 'pintura', 'ferro', 'bronze', 'pano', 'pano2', 'couro', 'palha', 'barro', 'pedra', 'reboco', 'liquido', 'brasa'];

  // ------------------------------ the models of the file ------------------------------
  // (kind → the people's tag — 'romano', 'romano~rico' — → its models, by size; made once, from what the file holds)
  let IDX = null, IDXN = -1;
  function index() {
    const M = G.MESH3D || {}; const names = Object.keys(M);
    if (IDX && IDXN === names.length) return IDX;
    IDX = {}; IDXN = names.length;
    for (const name of names) {
      if (name.slice(0, 6) !== 'movel-' || name.slice(-2) === '@1') continue; const d = M[name]; if (!d || !d.kind) continue;
      const tag = d.civ + (d.var ? '~' + d.var : ''); const k = IDX[d.kind] || (IDX[d.kind] = {}); const l = k[tag] || (k[tag] = []);
      l.push({ name, lod1: M[name + '@1'] ? name + '@1' : name, kind: d.kind, w: d.w, d: d.d, h: d.h, anc: d.anc || [] });
    }
    return IDX;
  }
  V.kinds = () => Object.keys(index());
  // (the tag whose models a people uses for a kind: its own, or the one it borrows — and the rich house's, where there is one)
  function tagOf(kind, civ, vr) {
    const I = index()[kind]; if (!I) return null; const A = (G.MOVEIS && G.MOVEIS.alias && G.MOVEIS.alias[kind]) || {};
    if (vr) { const t = civ + '~' + vr; const o = A[t] || t; if (I[o]) return o; }
    const o = A[civ] || civ; return I[o] ? o : null;
  }
  // the model that fits a piece of the plan — { name, lod1, e, rot (a quarter turn: the model's width along the piece's depth),
  // sx, sy, sz (its stretch, in the model's own axes) } — or null. vr: the rich house's ('rico'), if its people has one
  V.pick = function (kind, civ, w, d, h, vr) {
    const t = tagOf(kind, civ, vr); if (!t) return null; const L = index()[kind][t]; let best = null, bs = 1e9;
    const lo = V.FIT[0], hi = V.FIT[1];
    for (const e of L) for (const rot of [0, 1]) {
      const sx = (rot ? d : w) / e.w, sz = (rot ? w : d) / e.d, sy = h > 0 ? h / e.h : 1;
      if (sx < lo || sx > hi || sz < lo || sz > hi || sy < lo || sy > hi) continue;
      const s = Math.abs(Math.log(sx)) + Math.abs(Math.log(sz)) + Math.abs(Math.log(sy)) + rot * 0.05;
      if (s < bs) { bs = s; best = { name: e.name, lod1: e.lod1, e, rot, sx, sy, sz }; }
    }
    return best;
  };
  // (how high a picked model stands over its foot, stretched as it is: the top of its box)
  V.top = p => { const d = G.MESH3D && G.MESH3D[p.name]; return d ? d.box[4] * p.sy : 0; };
  // is there a model for this kind of piece, for this people, at this size?
  V.has = (kind, civ, w, d, h) => !!V.pick(kind, civ, w, d, h);
  // the model's geometry (the whole of it: its parts are its groups), at a level of detail — or null
  V.geo = function (kind, civ, w, d, lod, h) { const p = V.pick(kind, civ, w, d, h); return p && G.Mesh3D ? G.Mesh3D.geo(lod ? p.lod1 : p.name) : null; };
  // where things may rest on the piece, in its own frame (a across, n out of its front, y up from its foot): [{ k: 'tampo' |
  // 'prateleira' | 'gancho' | 'nicho' | 'chamine', x, y, z, w, d }] — the model's own, turned and stretched as the piece is
  V.anchors = function (kind, civ, w, d, h, vr) {
    const p = V.pick(kind, civ, w, d, h, vr); return p ? V.anchorsOf(p) : [];
  };
  V.anchorsOf = p => p.e.anc.map(q => {
    const x = q.x * p.sx, z = q.z * p.sz, y = q.y * p.sy;
    return p.rot ? { k: q.k, x: z, y, z: -x, w: q.d * p.sz, d: q.w * p.sx } : { k: q.k, x, y, z, w: q.w * p.sx, d: q.d * p.sz };
  });

  // ------------------------------ what a building's pieces are made of ------------------------------
  const PAL = () => (G.Arch && G.Arch.PAL) || {};
  const rgb = c => (typeof c === 'string' ? G.hex2rgb(c) : c);
  // (a colour calmed: the palette's paint as a worn piece of furniture has it — less saturated, a little darker)
  const calm = (c, s, v) => { c = rgb(c); const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; return [0, 1, 2].map(k => G.clamp((l + (c[k] - l) * s) * v, 0, 255)); };
  const mul = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
  // the woods of each people (the piece's, and its second: the darker rails and the inlay) — BIBLIA §2.2, wood 22–36°
  V.WOOD = { classico: [[122, 88, 58], [88, 62, 42]], romano: [[130, 86, 54], [84, 52, 34]], grego: [[150, 116, 78], [100, 74, 50]],
    egipcio: [[172, 130, 86], [64, 48, 36]], nordico: [[112, 84, 58], [72, 54, 38]], asteca: [[138, 96, 62], [94, 64, 42]] };
  // (the paint of each people: the Greek's blue, the Roman's red, the Egyptian's green and red, the Aztec's red and turquoise)
  V.PAINT = { classico: ['#8a4a2a'], romano: ['#8e2f2f', '#b0782a'], grego: ['#3f6fb0', '#b8452f'], egipcio: ['#2f8f8a', '#b8452f'], nordico: ['#a23c2a'], asteca: ['#b33a2a', '#2fae8f'] };
  V.CLAY = { classico: [176, 102, 66], romano: [178, 96, 60], grego: [186, 108, 66], egipcio: [168, 112, 72], nordico: [150, 96, 66], asteca: [162, 86, 58] };
  V.DRINK = { classico: [70, 26, 26], romano: [64, 22, 26], grego: [60, 20, 28], egipcio: [104, 64, 26], nordico: [98, 60, 24], asteca: [206, 198, 176] };
  // (the patterns of the stack each part is drawn with — Build3D.PAT —, by what it turned out to be)
  const PATK = { madeira: 'jamb', madeira2: 'beam', pintura: 'painted', ferro: 'iron', bronze: 'iron', vime: 'wicker', pano: 'linen', la: 'wool', pele: 'fur',
    couro: 'leather', palha: 'wicker', barro: 'mud', pedra: 'ashlar', marmore: 'marble', reboco: 'plaster', liquido: 0, brasa: 0 };
  const STONE = { egipcio: 'sandstone', asteca: 'tezontle', nordico: 'rock' };
  const RENDER = { egipcio: 'mud', asteca: 'stucco', grego: 'whitewash' };

  // how rich the house of a piece is now (D-660: the wealth that shows inside is today's): 0 poor, 1 middling, 2 rich — the
  // house's own (its coins, its merchant's flag) for a dwelling, the keeper's house for a tavern; a seat of rule rich; the
  // others by the dearness of their ground. Only read
  V.rico = function (b) {
    const S = G.S; if (!S || !b) return 1;
    const ofHouse = h => (!h ? 1 : h.elite ? 2 : (h.coin || 0) >= 150 ? 2 : (h.coin || 0) >= 40 ? 1 : 0);
    const def = G.BDEF && G.BDEF[b.type];
    if (def && def.housing) return ofHouse(b);
    if (G.Casa && G.Casa.isSeat && G.Casa.isSeat(b)) return 2;
    if (b.type === 'taverna' && G.Taverna && G.Taverna.keeperOf) { const k = G.Taverna.keeperOf(b); return k && k.home ? ofHouse(S.buildings.get(k.home)) : 1; }
    const set = S.settlements && S.settlements.get(b.set);
    if (set && G.Urban && G.Urban.valueAt) { const v = G.Urban.valueAt(set, b.x + b.w / 2, b.y + b.h / 2); return v >= 80 ? 2 : v >= 40 ? 1 : 0; }
    return 1;
  };
  // the look of a building's furniture: its people, what it has of each material, how rich it is, its id — read from the
  // world, never written; its signature (sig) says when what the inside shows has changed
  V.look = function (b) {
    const S = G.S; const st = b.style || ((G.Fac && G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || 'classico';
    const civ = V.WOOD[st] ? st : 'classico';
    const f = G.Fac && G.Fac.ofSet ? G.Fac.ofSet(b.set) : null; const fid = f ? f.id : 0; const arts = f && f.tech ? f.tech.known : null; const O = G.Origem;
    const ok = m => (O && O.matOK ? !!O.matOK(fid, m, arts) : true);
    const metal = ok('ferro') ? 'ferro' : ok('bronze') ? 'bronze' : null;
    const L = f && f.eco && f.eco.last; const w = L && L.veste; const weave = w && typeof w === 'object' ? w.tear > 0 || w.pano >= 1 : true;
    const r = V.rico(b);
    const out = { civ, metal, bronze: ok('bronze'), couro: ok('couro'), barro: ok('barro'), weave, rico: r, id: b.id | 0 };
    out.sig = [civ, metal || '-', out.bronze ? 1 : 0, out.couro ? 1 : 0, out.barro ? 1 : 0, weave ? 1 : 0, r].join('|');
    return out;
  };
  // (a number of the piece, the same at every look: its building and its own key — the wood's tone, the paint's choice)
  const hv = (look, k, n) => G.hash(look.id * 7919 + (k | 0) * 131 + n);
  // what one part of a model is drawn as, for a building's look and a piece's key: { c: [r, g, b] (0–255, before the house's soot),
  // p: the pattern's name — or null where the part is not drawn at all (a jar of clay where the people has no fired clay)
  V.paint = function (part, look, k) {
    const civ = look.civ, P = PAL()[civ] || {}; const W = V.WOOD[civ]; const tone = 0.9 + hv(look, k, 1) * 0.18;
    switch (part) {
      case 'madeira': return { c: mul(W[0], tone), p: PATK.madeira };
      case 'madeira2': return { c: mul(W[1], 0.94 + hv(look, k, 2) * 0.12), p: PATK.madeira2 };
      case 'pintura': { const L = V.PAINT[civ] || V.PAINT.classico; return { c: calm(L[Math.floor(hv(look, 0, 3) * L.length) % L.length], 0.8, 0.9), p: PATK.pintura }; }
      case 'ferro': return look.metal === 'ferro' ? { c: [60, 58, 56], p: PATK.ferro } : look.metal === 'bronze' ? { c: [150, 108, 56], p: PATK.bronze } : { c: [138, 112, 74], p: PATK.vime };
      case 'bronze': return look.bronze ? { c: [158, 114, 58], p: PATK.bronze } : look.metal === 'ferro' ? { c: [62, 60, 58], p: PATK.ferro } : { c: mul(W[1], 1.05), p: PATK.madeira2 };
      case 'pano': return look.weave ? { c: civ === 'nordico' ? [170, 152, 126] : look.rico >= 2 ? calm((V.PAINT[civ] || ['#8a4a2a'])[0], 0.55, 1.35) : [222, 212, 190], p: civ === 'nordico' ? PATK.la : PATK.pano }
        : { c: [150, 116, 82], p: PATK.pele };
      case 'pano2': return look.weave ? { c: look.rico >= 1 ? calm((V.PAINT[civ] || ['#8a4a2a'])[(look.id | 0) % (V.PAINT[civ] || [0]).length], 0.7, 0.95) : civ === 'nordico' ? [104, 96, 84] : [150, 128, 100], p: PATK.la }
        : { c: [128, 96, 66], p: PATK.pele };
      case 'couro': return look.couro ? { c: [118, 80, 50], p: PATK.couro } : { c: [176, 152, 98], p: PATK.palha };
      case 'palha': return { c: civ === 'egipcio' ? [182, 160, 104] : civ === 'asteca' ? [188, 164, 100] : [196, 170, 110], p: PATK.palha };
      case 'barro': return look.barro ? { c: V.CLAY[civ], p: PATK.barro } : null;
      case 'pedra': { const rich = look.rico >= 2 && (civ === 'romano' || civ === 'grego' || civ === 'classico'); return { c: rich ? [228, 222, 208] : rgb((P.base && P.base[2]) || '#a09a8e'), p: rich ? PATK.marmore : STONE[civ] || PATK.pedra }; }
      case 'reboco': return { c: calm(P.wr || '#d2c19e', 0.9, 0.97), p: RENDER[civ] || PATK.reboco };
      case 'liquido': return { c: V.DRINK[civ], p: PATK.liquido };
      case 'brasa': return { c: [226, 98, 40], p: PATK.brasa };
    }
    return { c: W[0], p: PATK.madeira };
  };

  // ------------------------------ the shapes the 3D puts, a part at a time ------------------------------
  // (a part of a model as the inside's material reads it: the model's own points, normals, uv and the light it gives itself in
  // its colours — G.Mesh3D.part —, and the pattern every point of it is drawn with: aP. Made once a part and a pattern, shared)
  const partGeos = new Map();
  V.partGeo = function (name, part, pat) {
    const key = name + '/' + part + '/' + pat; let g = partGeos.get(key); if (g) return g;
    const M3 = G.Mesh3D; const base = M3 && M3.part(name, part); if (!base) return null;
    const THREE = (G.Realm && G.Realm.three && G.Realm.three()) || window.THREE;
    g = new THREE.BufferGeometry(); for (const k in base.attributes) g.setAttribute(k, base.attributes[k]); g.setIndex(base.index);
    const n = base.attributes.position.count; g.setAttribute('aP', new THREE.BufferAttribute(new Float32Array(n).fill(pat), 1));
    g.boundingSphere = base.boundingSphere; if (!g.boundingSphere) g.computeBoundingSphere();
    partGeos.set(key, g); return g;
  };
  V.parts = name => (G.Mesh3D ? G.Mesh3D.parts(name) : []);
  V.tris = name => { const d = G.MESH3D && G.MESH3D[name]; return d ? d.t : 0; };

  // ------------------------------ its own proof ------------------------------
  // every model of the file read back: its kind and size said, its parts of the vocabulary, inside its rectangle and on its
  // floor, its middle level a third of it or less, within its budget (V.BUDGET: the hero pieces more), its anchors within it; and
  // every people with a model of every kind the file has (its own or the one it borrows)
  // (the near level of a piece ≤ 1,500 triangles, a hero's ≤ 3,000; the middle one ≤ 45 % of it — or ≤ 260, a small piece's: D-715)
  V.BUDGET = { peca: 1500, heroi: 3000, meio: 0.45, meioMin: 260 };
  V.HERO = { 'balcao-alvenaria': 1, lareira: 1, 'fogo-comprido': 1, pipas: 1, cama: 1, 'cama-casal': 1, lar: 1 };
  V.check = function () {
    const bad = []; const M = G.MESH3D || {}; const I = index();
    for (const kind in I) for (const tag in I[kind]) for (const e of I[kind][tag]) {
      const d = M[e.name], d1 = M[e.lod1]; if (!d) { bad.push(`${e.name}: sem dados`); continue; }
      for (const p of d.parts) if (V.PARTS.indexOf(p[0]) < 0) bad.push(`${e.name}: a parte ${p[0]} não é do vocabulário`);
      const b = d.box, t = 0.005;
      if (b[0] < -e.w / 2 - t || b[3] > e.w / 2 + t || b[2] < -e.d / 2 - t || b[5] > e.d / 2 + t) bad.push(`${e.name}: fora do seu retângulo (${b.map(v => v.toFixed(2)).join(' ')})`);
      if (b[1] < -t) bad.push(`${e.name}: abaixo do chão (${b[1].toFixed(3)} m)`);
      const lim = V.HERO[kind] ? V.BUDGET.heroi : V.BUDGET.peca; if (d.t > lim) bad.push(`${e.name}: ${d.t} triângulos (orçamento ${lim})`);
      if (e.lod1 === e.name) bad.push(`${e.name}: sem o nível do meio`);
      else if (d1 && d1.t > Math.max(d.t * V.BUDGET.meio, V.BUDGET.meioMin)) bad.push(`${e.name}: o nível do meio com ${d1.t} de ${d.t} triângulos (≤ ${Math.round(V.BUDGET.meio * 100)} %, ou ${V.BUDGET.meioMin})`);
      for (const a of e.anc) if (Math.abs(a.x) > e.w / 2 + t || Math.abs(a.z) > e.d / 2 + t || a.y < -t) bad.push(`${e.name}: a âncora ${a.k} fora da peça`);
    }
    const civs = Object.keys(V.WOOD);
    for (const kind in I) for (const c of civs) if (!tagOf(kind, c)) bad.push(`${kind}: o povo ${c} sem modelo`);
    return bad;
  };
  // (nothing of a world is kept here: the index and the shapes are the file's — the same for every world)
})(window.G = window.G || {});
