'use strict';
// ============================================================
//  Forma: the architecture of a building as one definition —
//  the shapes the god's view paints, in metres, from which the
//  3D builds its body (Build3D.formInto), its far figure and its
//  height, and the plan of a monument lays out its shell (int-
//  monumentos.js). The god's drawing is the owner's reference:
//  its numbers are read here once (js/arch.js) — x, y in tiles
//  from the middle of the lot become metres × 4, z in pixels
//  becomes metres ÷ 3.04, the descent's own scale (D-016) — and
//  qa/visual/fidelidade.js holds the two to each other.
//  Pure: it never reads the world (G.S) nor draws on any chance;
//  a form is the same for every building of its type and people
//  (what varies, the tones of the stones, comes from the id, and
//  only in what is seen: the 3D's own business).
// ============================================================
(function (G) {
  const Fo = G.Forma = {};
  const ZPX = Fo.ZPX = 3.04; // (one metre of height is 3.04 px of the god's picture: 5.657 px/m × cos 30° × 0.62)
  const TILE = 4;
  // ------------------------------ the frame ------------------------------
  // A form is laid out as a plan is (In.toLoc): its entrance at the front, v = L (the side the building opens to — the god's
  // front-left face, +y), u across it (the right hand of one who stands outside looking in), y up from the lot's highest
  // ground (the god's z = 0: the anchor of its picture). Turned to the real side by Fo.toLot, never mirrored.
  Fo.toLot = (s, L, u, v) => (s === 'S' ? [u, v] : s === 'N' ? [L - u, L - v] : s === 'E' ? [v, L - u] : [L - v, u]);
  // (a direction in the canonical frame to the lot's)
  Fo.dirLot = (s, du, dv) => (s === 'S' ? [du, dv] : s === 'N' ? [-du, -dv] : s === 'E' ? [dv, -du] : [-dv, du]);
  // ------------------------------ the vocabulary ------------------------------
  // Each element of a form: { k: kind, ... } in metres of the canonical frame; colours as the god's palette names them ('wl',
  // 'wr', 'top', 'trim', 'acc', 'base0'… 'roof1', 'col0'), or as the god's own hex where the god paints its own:
  //   bloco      a block: r [u0, v0, u1, v1], y0..y1, cor [front-left, front-right, top] (the god's cl, cr, ct)
  //   talude     a battered block: r at its foot, r1 at its top, y0..y1, cor (the rock of the Acropolis)
  //   piramide   a smooth pyramid: c [u, v], half its base e, y0..y1, cor [lit, shaded]; ponta { f, cor }: the capstone
  //              (its top fraction f, gilded); fiadas: the courses the god draws on it
  //   escalonada a stepped pyramid: c, niveis [[e, y0, y1], …] (each level's half side and its heights, from the lowest), cor;
  //              friso: the god's darker line under each level's top
  //   escada     a flight up the front, set into the levels it climbs: from [u, v, y] to [u, v, y], w wide, cor, clara (how
  //              much lighter than the levels); alfarda: the ramps at its sides, divisor: the painted line down its middle
  //   tambor     a drum of arcades: c, r (outer), t (its wall's thickness), y0..y1, andares (tiers), arcos (arches round a
  //              tier), arcoW (an arch's share of its bay), arcoA..arcoB (where in its tier an arch stands: shares of the
  //              tier's height; the ground tier's from the ground), cor [lit, shaded], escuro: the dark behind the arches
  //   cavea      the seats round an arena, terraced: c, aneis [[r, y], …] from the top row down (the god's six rings), fundo:
  //              the radius of the lowest ring's inner edge (the arena's)
  //   arena      the floor of the arena: c, r, y, cor; muro: the wall round it, up to the lowest row
  //   mastros    the masts of the awning on the rim: c, r, n round, y0, h
  //   colunata   columns: pts [[u, v], …], r, y0..y1, cor [lit, shaded]
  //   telhado    a roof: r, y0 (the eaves) … y1 (the ridge), ao 'u'|'v' (the ridge's way), ov (the eaves' reach), cor
  //              [lit, shaded, gable, edge]; escudos { linhas, n, cor }: a roof of gilded shields (Valhalla)
  //   faixa      a painted band round a block: r, y0..y1, cor
  //   porta      a door or a dark opening on a face: na 'frente' (v = the face's line), u, w, y0..y1, cor; lacrada: seen,
  //              never gone through (the Great Pyramid's)
  //   disco      a round of gold (an eye, a shield) on the front face of a block: u, v, y, r, cor, olho: its dark pupil
  //   estatua    a statue: p [u, v, y], h, cor; lanca: the spear and the shield (Athena Promachos)
  //   dragao     a dragon's head at a gable's end: p [u, v, y], dir (along u: ±1)
  //   braseiro   a brazier: p [u, v, y], r
  // ------------------------------ the god's units ------------------------------
  const px = z => z / ZPX;
  const at = (L, d) => L / 2 + d * TILE; // (tiles from the middle of the lot, the god's dx or dy, to metres from its corner)
  const rect = (L, x0, y0, x1, y1) => [at(L, x0), at(L, y0), at(L, x1), at(L, y1)];
  // ------------------------------ the forms ------------------------------
  // (each a function of the lot's side L, metres: the god draws the wonder on a 3 × 3 lot)
  const FORMS = {};
  const def = (type, style, fn) => { (FORMS[type] = FORMS[type] || {})[style] = fn; };

  // the Colosseum (arch.js maravilha, romano): the god's bowl of r 1.45 tiles and 42 px — three tiers of arches round it, its
  // six rings of seats inside, from the rim down to half its radius, the arena at its heart (the god's floor, 0.3 of the
  // height up: under it, inside the drum, the arena's undercroft), and the masts of the awning (ten on the half the god
  // shows: twenty round). The arches of the god's tiers stand from 0.175 to 0.725 of a tier (its zc ± ah/2); the ground
  // tier's reach the ground: they are the ways in
  def('maravilha', 'romano', L => {
    const R = 1.45 * TILE, H = px(42), c = [L / 2, L / 2];
    const rings = []; for (let k = 0; k < 6; k++) rings.push([R * (1 - k * 0.1), px(42 - k * 42 * 0.12)]);
    return { els: [
      { k: 'tambor', c, r: R, t: R * 0.1, y0: 0, y1: H, andares: 3, arcos: 24, arcoW: 0.6, arcoA: 0.175, arcoB: 0.725, cor: ['#e8d2a6', '#b89a70'], escuro: '#2a1e18', mat: 'ashlar' },
      { k: 'cavea', c, aneis: rings, fundo: R * 0.4, cor: '#c8b8a0' },
      { k: 'arena', c, r: R * 0.4, y: px(42 * 0.3), cor: '#e8d8a8', muro: rings[5][1] },
      { k: 'mastros', c, r: R - 0.08, n: 20, y0: H, h: px(6), cor: '#7a5a3a' },
    ], door: { u: L / 2, w: 0.9, y0: 0, y1: H / 3 * 0.725 } };
  });
  // the Great Pyramid (egipcio): a slab under it, the smooth pyramid of half side 1.45 tiles and 74 px, its eighteen courses,
  // the gilded capstone (its top tenth) and the dark door high on its front face (the sealed entrance, z 20–26 px)
  def('maravilha', 'egipcio', L => {
    const e = 1.45 * TILE, H = px(74);
    return { els: [
      { k: 'bloco', r: rect(L, -1.5, -1.5, 1.5, 1.5), y0: 0, y1: px(1), cor: ['base0', 'base1', 'base2'] },
      { k: 'piramide', c: [L / 2, L / 2], e, y0: px(1), y1: H, cor: ['#efe3c2', '#c9b48a'], fiadas: 18, ponta: { f: 0.1, cor: ['#ffe27a', '#d9a93a'] } },
      { k: 'porta', na: 'piramide', u: L / 2, w: 0.16 * TILE, y0: px(20), y1: px(26), cor: '#3a2a1c', lacrada: true },
    ], door: { u: L / 2, w: 0.64, y0: px(20), y1: px(26), sealed: true } };
  });
  // the Templo Mayor (asteca): five levels of 7.5 px from half side 1.45 to 0.7 tiles, the stair up the front (0.16 tiles each
  // side of the middle, its ramps at the sides, the red line down it), the two shrines on top — Tlaloc's blue on the left,
  // Huitzilopochtli's red on the right —, each with its band, its door and its crest, and the braziers before them
  def('maravilha', 'asteca', L => {
    const n = 5, h = px(7.5), H = n * h, e0 = 1.45 * TILE, e1 = 0.7 * TILE; const niveis = [];
    for (let k = 0; k < n; k++) niveis.push([e0 - (e0 - e1) * k / (n - 1), k * h, (k + 1) * h]);
    const els = [
      { k: 'escalonada', c: [L / 2, L / 2], niveis, cor: ['wl', 'wr', 'top'], friso: px(0.8), mat: 'stucco' },
      { k: 'escada', a: [L / 2, at(L, 1.47), 0], b: [L / 2, at(L, 0.72), H], w: 0.32 * TILE, cor: 'wl', clara: 1.08, alfarda: 0.06 * TILE, divisor: { u: 0.05 * TILE, w: 0.06 * TILE, cor: 'trim' } },
    ];
    for (const [x, col] of [[-0.35, '#3f7fd8'], [0.35, '#c8382a']]) {
      els.push({ k: 'bloco', r: rect(L, x - 0.28, -0.4, x + 0.28, 0.35), y0: H, y1: H + px(10), cor: ['wl', 'wr', 'top'] });
      els.push({ k: 'faixa', r: rect(L, x - 0.28, -0.4, x + 0.28, 0.35), y0: H + px(7), y1: H + px(10), cor: col });
      els.push({ k: 'porta', na: 'frente', v: at(L, 0.35), u: at(L, x), w: 0.2 * TILE, y0: H, y1: H + px(6), cor: '#2a1c14' });
      els.push({ k: 'bloco', r: rect(L, x - 0.24, -0.1, x + 0.24, 0.0), y0: H + px(10), y1: H + px(19), cor: [col, col, col], crista: true });
      els.push({ k: 'braseiro', p: [at(L, x), at(L, 0.45), H], r: 0.3 });
    }
    return { els, door: { u: L / 2, w: 0.64 * 2, y0: 0, y1: H, stair: true } };
  });
  // the Acropolis (grego): the rock, battered from 1.45 tiles at its foot to 1.35 at its top 12 px up; on it the temple — two
  // steps, eight columns a side 19.6 px tall round the cella, the entablature with its painted frieze, the pediment roof along
  // the way in with the gilded round in its gable — and the gilded Athena with her spear and shield at the front-left
  def('maravilha', 'grego', L => {
    const e = 1.45, z0 = px(12); const cols = [];
    const x0 = -1.0, x1 = 1.0, y0 = -0.8, y1 = 0.8, n = 8;
    for (let k = 0; k < n; k++) { const f = k / (n - 1); cols.push([at(L, x0 + (x1 - x0) * f), at(L, y0)], [at(L, x0 + (x1 - x0) * f), at(L, y1)]); }
    for (let k = 1; k < n - 1; k++) { const f = k / (n - 1); cols.push([at(L, x0), at(L, y0 + (y1 - y0) * f)], [at(L, x1), at(L, y0 + (y1 - y0) * f)]); }
    return { els: [
      { k: 'talude', r: rect(L, -e, -e, e, e), r1: rect(L, -e + 0.1, -e + 0.1, e - 0.1, e - 0.1), y0: 0, y1: z0, cor: ['#b8ae9c', '#948a78', '#d8d0bc'] },
      { k: 'bloco', r: rect(L, -1.1, -0.9, 1.1, 0.9), y0: z0, y1: z0 + px(1.2), cor: ['base0', 'base1', 'base2'] },
      { k: 'bloco', r: rect(L, -1.05, -0.85, 1.05, 0.85), y0: z0 + px(1.2), y1: z0 + px(2.4), cor: ['base0', 'base1', 'base2'] },
      { k: 'bloco', r: rect(L, -0.75, -0.55, 0.75, 0.5), y0: z0 + px(2.4), y1: z0 + px(22), cor: ['wl', 'wr', 'top'] },
      { k: 'colunata', pts: cols, r: 0.045 * TILE, y0: z0 + px(2.4), y1: z0 + px(22), cor: ['col0', 'col1'] },
      { k: 'bloco', r: rect(L, -1.05, -0.85, 1.05, 0.85), y0: z0 + px(22), y1: z0 + px(25), cor: ['col0', 'col1', 'col0'] },
      { k: 'faixa', r: rect(L, -1.05, -0.85, 1.05, 0.85), y0: z0 + px(23), y1: z0 + px(24.2), cor: 'acc' },
      { k: 'telhado', r: rect(L, -1.05, -0.85, 1.05, 0.85), y0: z0 + px(25), y1: z0 + px(34), ao: 'v', ov: 0.05 * TILE, cor: ['roof0', 'roof1', 'gable', 'roof2'] },
      { k: 'disco', na: 'frente', u: L / 2, v: at(L, 0.9), y: z0 + px(29), r: 0.6, cor: '#f2c14e' },
      { k: 'estatua', p: [at(L, -0.9), at(L, 1.1), z0], h: px(16), cor: '#e0b84a', lanca: true },
    ], door: { u: L / 2, w: 1.2, y0: z0 + px(2.4), y1: z0 + px(18) } };
  });
  // Valhalla (nordico): the great hall of 2.8 × 1.6 tiles on its stone base 2 px high, its walls of planks 10 px, the door of
  // light in its front, the steep roof 30 px of gilded shields — five rows of fourteen —, a dragon at each gable's end
  def('maravilha', 'nordico', L => {
    const x0 = -1.4, x1 = 1.4, y0 = -0.8, y1 = 0.8, H = px(12);
    return { els: [
      { k: 'bloco', r: rect(L, x0 - 0.05, y0 - 0.05, x1 + 0.05, y1 + 0.05), y0: 0, y1: px(2), cor: ['base0', 'base1', 'base2'] },
      { k: 'bloco', r: rect(L, x0, y0, x1, y1), y0: px(2), y1: H, cor: ['wl', 'wr', 'top'], tabuas: 16 },
      { k: 'porta', na: 'frente', v: at(L, y1), u: L / 2, w: 0.3 * TILE, y0: px(2), y1: px(10), cor: '#ffd27a', luz: true },
      { k: 'telhado', r: rect(L, x0, y0, x1, y1), y0: H, y1: H + px(30), ao: 'u', ov: 0.12 * TILE, cor: ['#e8b83a', '#c8962a', 'wl', '#8a6a1a'], escudos: { linhas: 5, n: 14, cor: ['#f2cc5a', '#d8a83a'] } },
      { k: 'dragao', p: [at(L, x1 + 0.12), L / 2, H + px(30)], dir: 1, cor: '#8a6a1a' },
      { k: 'dragao', p: [at(L, x0 - 0.12), L / 2, H + px(30)], dir: -1, cor: '#8a6a1a' },
    ], door: { u: L / 2, w: 1.2, y0: px(2), y1: px(10) } };
  });
  // the ziggurat (classico): four levels — half side 1.45, 1.1, 0.78, 0.46 tiles; 10, 10, 10 and 12 px —, the ramp up the
  // front to the top of the third, and the golden eye on the fourth
  def('maravilha', 'classico', L => {
    const lv = [[1.45, 10], [1.1, 10], [0.78, 10], [0.46, 12]]; const niveis = []; let z = 0;
    for (const [e, h] of lv) { niveis.push([e * TILE, px(z), px(z + h)]); z += h; }
    const els = [{ k: 'escalonada', c: [L / 2, L / 2], niveis, cor: ['wl', 'wr', 'top'], friso: px(1), mat: 'plaster' }];
    els.push({ k: 'escada', a: [L / 2, at(L, 1.47), 0], b: [L / 2, at(L, 0.46), px(z - 12)], w: 0.4 * TILE, cor: 'wl', clara: 1.05 });
    els.push({ k: 'disco', na: 'frente', u: L / 2, v: at(L, 0.46), y: px(z - 6), r: 0.7, cor: '#d9b34a', olho: '#6a4a1a' });
    return { els, door: { u: L / 2, w: 1.6, y0: 0, y1: px(z - 12), stair: true } };
  });

  // ------------------------------ asking ------------------------------
  const memo = new Map();
  // the form of a type in a people's style — { type, style, L, els, door, top } — or null (its shell, or its old drawing, is
  // its form); the same object for every building of it
  Fo.of = function (type, style) {
    const F0 = FORMS[type]; if (!F0) return null; const fn = F0[style] || F0.classico; if (!fn) return null;
    const key = type + ':' + (F0[style] ? style : 'classico'); let F = memo.get(key); if (F) return F;
    const d = G.BDEF && G.BDEF[type]; const L = (d ? d.w : 3) * TILE; const o = fn(L);
    F = Object.freeze({ type, style: F0[style] ? style : 'classico', L, els: o.els, door: o.door || null, top: topOf(o.els) });
    memo.set(key, F); return F;
  };
  Fo.has = (type, style) => !!(FORMS[type] && (FORMS[type][style] || FORMS[type].classico));
  Fo.types = () => Object.keys(FORMS);
  // the highest point of a form (m over the lot's highest ground): its far figure's height and the camera's
  function topOf(els) {
    let t = 0;
    for (const e of els) {
      const y = e.k === 'mastros' ? e.y0 + e.h : e.k === 'estatua' ? e.p[2] + e.h * 1.1 : e.k === 'braseiro' ? e.p[2] + 0.8 : e.k === 'dragao' ? e.p[2] + 1.1 : e.k === 'escalonada' ? e.niveis[e.niveis.length - 1][2] : e.k === 'arena' ? e.y : e.k === 'cavea' ? Math.max(...e.aneis.map(a => a[1])) : e.k === 'escada' ? Math.max(e.a[2], e.b[2]) : e.k === 'disco' || e.k === 'porta' ? 0 : e.y1;
      if (y > t) t = y;
    }
    return t;
  }
  // what a form covers from above, in the canonical frame: [{ k: 'rect', r }, { k: 'circ', c, r }] — its masses' feet (for
  // the proof, and for the plan of the monument: the shell follows it)
  Fo.foot = function (F) {
    const out = [];
    for (const e of F.els) {
      if (e.k === 'bloco' || e.k === 'talude') out.push({ k: 'rect', r: e.r });
      else if (e.k === 'piramide') out.push({ k: 'rect', r: [e.c[0] - e.e, e.c[1] - e.e, e.c[0] + e.e, e.c[1] + e.e] });
      else if (e.k === 'escalonada') { const s = e.niveis[0][0]; out.push({ k: 'rect', r: [e.c[0] - s, e.c[1] - s, e.c[0] + s, e.c[1] + s] }); }
      else if (e.k === 'tambor') out.push({ k: 'circ', c: e.c, r: e.r });
    }
    return out;
  };
  // the far figure of a form: its masses alone, the simplest solids that keep its silhouette — a box, a battered block, a
  // pyramid, a drum, a gable roof — in the canonical frame: [{ k, … }]
  Fo.mass = function (F) {
    const out = [];
    for (const e of F.els) {
      if (e.k === 'bloco') out.push({ k: 'box', r: e.r, y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'talude') out.push({ k: 'talude', r: e.r, r1: e.r1, y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'piramide') out.push({ k: 'piramide', c: e.c, e: e.e, y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'escalonada') for (const [s, y0, y1] of e.niveis) out.push({ k: 'box', r: [e.c[0] - s, e.c[1] - s, e.c[0] + s, e.c[1] + s], y0, y1, cor: e.cor[0] });
      else if (e.k === 'tambor') out.push({ k: 'anel', c: e.c, r: e.r, t: Math.max(e.t, e.r * 0.5), y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'telhado') out.push({ k: 'telhado', r: e.r, y0: e.y0, y1: e.y1, ao: e.ao, ov: e.ov, cor: e.cor[0] });
      else if (e.k === 'colunata') { let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9; for (const p of e.pts) { u0 = Math.min(u0, p[0]); v0 = Math.min(v0, p[1]); u1 = Math.max(u1, p[0]); v1 = Math.max(v1, p[1]); } out.push({ k: 'box', r: [u0 - e.r, v0 - e.r, u1 + e.r, v1 + e.r], y0: e.y0, y1: e.y1, cor: e.cor[0], ralo: true }); }
    }
    return out;
  };
  // (for the proofs: the god's units of a form's number)
  Fo.px = y => y * ZPX;
})(window.G);
