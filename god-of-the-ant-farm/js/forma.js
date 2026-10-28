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
  // (a point of the lot to the canonical frame: Fo.toLot turned back)
  Fo.toCan = (s, L, x, z) => (s === 'S' ? [x, z] : s === 'N' ? [L - x, L - z] : s === 'E' ? [L - z, x] : [z, L - x]);
  // ------------------------------ the roof one lives on ------------------------------
  // the people's own pieces on a flat roof, where the god paints them and the 3D builds them (L-267) — from the shell's rect
  // (lot metres) and the side its door opens to: the Egyptian's awning of cloth on four poles, a little to the left of the
  // middle and toward the front, and its wind-catcher at the back on the right, its mouth to the front (none on a roof with
  // a room on it: the room is its shade); the Aztec's three pots of flowers along the front — in lot metres, over the roof:
  // { front, across, items: [{ k: 'toldo', x, z, w, d, h (its back), h1 (its front) } | { k: 'torre', x, z, w, h, boca }
  // | { k: 'vaso', x, z, r, cor }] } (the god's numbers: its awning 0.3 × 0.22 tiles and 5 px, its tower 0.16 tiles and 6 px)
  Fo.deck = function (r, s, L, st, room) {
    const a = Fo.toCan(s, L, r[0], r[1]), b = Fo.toCan(s, L, r[2], r[3]);
    const u0 = Math.min(a[0], b[0]), u1 = Math.max(a[0], b[0]), v0 = Math.min(a[1], b[1]), v1 = Math.max(a[1], b[1]);
    const at = (u, v) => Fo.toLot(s, L, u, v); const items = [];
    if (st === 'egipcio' && !room) {
      const c = at((u0 + u1) / 2 - 0.4, (v0 + v1) / 2 + 0.2); items.push({ k: 'toldo', x: c[0], z: c[1], w: 1.2, d: 0.88, h: px(5), h1: px(4.4) });
      const t = at(u1 - 0.8, v0 + 0.64); items.push({ k: 'torre', x: t[0], z: t[1], w: 0.64, h: px(6), boca: px(2) });
    }
    if (st === 'asteca') for (let k = 0; k < 3; k++) { const q = at(u0 + 0.4 + k * (u1 - u0 - 0.8) / 2, v1 - 0.16); items.push({ k: 'vaso', x: q[0], z: q[1], r: 0.19, cor: k % 2 ? '#5a9a3c' : '#e05a7a' }); }
    return { front: Fo.dirLot(s, 0, 1), across: Fo.dirLot(s, 1, 0), items };
  };
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
  //   estatua    a statue: p [u, v, y], h, cor; w: the half width of its robe; lanca: the spear and the shield (Athena
  //              Promachos); corvos: the colour of the two ravens on its shoulders; pose 'trono' (enthroned in the nemes:
  //              its colour, nemes) or 'serpente' (the feathered serpent: penas, olho) — its parts are Fo.figure's
  //   dragao     a dragon's head at a gable's end: p [u, v, y], dir (along u: ±1)
  //   braseiro   a brazier: p [u, v, y], r
  //   coluna     a round shaft standing alone: c, r, y0..y1, cor [lit, shaded]; espiral { y0, passo, w }: the frieze winding
  //              up it from y0, a turn every passo, w wide (the shaft's stone a little darker)
  //   pedra      a standing stone: c, e (half its side at its foot), e1 (at its top), y0..y1 (y1 its front corner on the
  //              right: the highest), cai [left, back]: how far its top falls across it each way; cobra: the colour of the
  //              serpent carved down its front
  //   roda       a stone wheel standing on its edge, facing the front: c [u, v] (its middle), y (its axle's height), r, t
  //              (thick), cor [rim, face]; aneis [[f, cor], …]: the painted rings on its face (at f of r, larg of r wide),
  //              raios { n, r0, r1, a, cor }: the rays between them (from r0 to r1 of r, a their half angle at r1)
  //   flores     flower beds on a floor: pts [[u, v], …], y, r (how far round each the blooms are), cor (theirs, by turns);
  //              n: the blooms at each (6), b: how big (0.13); chato: lying flat on water (the lotus's pads)
  //   lamina     a still sheet of water: r, y, cor
  //   palmeira   a palm: p [u, v, y], h (its trunk), s (its fronds' reach)
  //   aro        a ring of stone standing, facing along v: c [u, v, y], r, t (its thickness), dir (±1: the way it faces), cor
  //   (cavea, a part of the round: arco [a0, a1], the angles it spans — from +u toward +v —; fecho: the colour of its back
  //   wall and its ends, standing on the ground where no drum holds it)
  // (mat on an element: the stuff it is built of — 'base' the people's own stone)
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

  // ------------------------------ the monuments (arch.js monument; art.js the obelisk) ------------------------------
  // (the god's steps — arch.js steps(): n blocks of h px from half side e tiles, each `shrink` tiles less)
  const degraus = (L, e, n, h, shrink) => { const out = []; for (let k = 0; k < n; k++) { const q = e - k * shrink; out.push({ k: 'bloco', r: rect(L, -q, -q, q, q), y0: px(k * h), y1: px((k + 1) * h), cor: ['base0', 'base1', 'base2'] }); } return out; };
  // (the god's robed figure hp px tall is max(1.4, 0.13 hp) px wide each side of its middle; the 3D's robe, 2w across and
  // 1.3w deep, seen from the god's corner is as wide — 3.3w × 4 px a metre each side — when w is that over 6.6)
  const robe = hp => Math.max(1.4, hp * 0.13) / 6.6;
  // the obelisk (art.js: the classical monument and the Egyptian — the Egyptian has no other): the paved square of 0.95 tiles
  // and 1.5 px, its two pedestals, the shaft tapering from 0.2 to 0.12 tiles between 8 and 58 px, the gilded pyramidion 9 px
  // over it, the golden eye on its front 34 px up and the flower beds at three corners of the square
  def('monument', 'classico', L => {
    const a0 = 0.2, a1 = 0.12, z0 = 8, z1 = 58; const aEye = a0 - (a0 - a1) * (34 - z0) / (z1 - z0);
    return { els: [
      { k: 'bloco', r: rect(L, -0.95, -0.95, 0.95, 0.95), y0: 0, y1: px(1.5), cor: ['#c9c1ae', '#aaa18c', '#ddd6c5'], mat: 'slab' },
      { k: 'flores', pts: [[at(L, -0.75), at(L, 0.75)], [at(L, 0.75), at(L, -0.75)], [at(L, 0.75), at(L, 0.75)]], y: px(1.5), r: 0.35, cor: ['#ff8fb0', '#ffd85a', '#ffffff', '#b98cff'] },
      { k: 'bloco', r: rect(L, -0.36, -0.36, 0.36, 0.36), y0: px(1.5), y1: px(5), cor: ['#b8ae98', '#978d78', '#cbc2ae'] },
      { k: 'bloco', r: rect(L, -0.28, -0.28, 0.28, 0.28), y0: px(5), y1: px(8), cor: ['#c4baa4', '#a39984', '#d6ceba'] },
      { k: 'talude', r: rect(L, -a0, -a0, a0, a0), r1: rect(L, -a1, -a1, a1, a1), y0: px(z0), y1: px(z1), cor: ['#e6dfcc', '#bdb39c', '#e6dfcc'], mat: 'base' },
      { k: 'piramide', c: [L / 2, L / 2], e: a1 * TILE, y0: px(z1), y1: px(z1 + 9), cor: ['#f7d66a', '#d9a93a'], mat: 'slab' },
      { k: 'disco', na: 'frente', u: L / 2, v: at(L, aEye), y: px(34), r: 0.5, cor: '#d9b34a', olho: '#6a4a1a' },
    ] };
  });
  // the god's statue (grego): two steps of 0.9 tiles and 1.3 px, the marble pedestal of 0.3 tiles to 12 px with its painted
  // band at the top, and on it the gilded god 30 px tall with his spear and shield
  def('monument', 'grego', L => ({ els: [
    ...degraus(L, 0.9, 2, 1.3, 0.1),
    { k: 'bloco', r: rect(L, -0.3, -0.3, 0.3, 0.3), y0: px(2.6), y1: px(12), cor: ['col0', 'col1', 'col0'], mat: 'marble' },
    { k: 'faixa', r: rect(L, -0.3, -0.3, 0.3, 0.3), y0: px(10.5), y1: px(12), cor: 'acc' },
    { k: 'estatua', p: [L / 2, L / 2, px(12)], h: px(30), w: robe(30), cor: '#c9a24a', lanca: true },
  ] }));
  // the triumphal column (romano): two steps of 0.85 tiles and 1.4 px, the pedestal of 0.28 tiles to 9 px, the shaft to 56 px
  // — round where the god's is square (as the 3D's columns are), its girth between that square's inner and outer rounds —
  // with the frieze winding up it from 11 px, a turn every 8.4 px; the capital of 0.2 tiles and 2 px, and on it the gilded
  // emperor 10 px tall
  def('monument', 'romano', L => ({ els: [
    ...degraus(L, 0.85, 2, 1.4, 0.12),
    { k: 'bloco', r: rect(L, -0.28, -0.28, 0.28, 0.28), y0: px(2.8), y1: px(9), cor: ['col0', 'col1', 'col0'], mat: 'marble' },
    { k: 'coluna', c: [L / 2, L / 2], r: 0.14 * TILE * 1.2, y0: px(9), y1: px(56), cor: ['col0', 'col1'], mat: 'marble', espiral: { y0: px(11), passo: px(8.4), w: 0.24 } },
    { k: 'bloco', r: rect(L, -0.2, -0.2, 0.2, 0.2), y0: px(56), y1: px(58), cor: ['col0', 'col1', 'col0'], mat: 'marble' },
    { k: 'estatua', p: [L / 2, L / 2, px(58)], h: px(10), w: robe(10), cor: '#e0b84a', lanca: true },
  ] }));
  // the Sun Stone (asteca): three steps of 0.9 tiles and 1.5 px, and on the top one the stone wheel standing on its edge,
  // facing the front, in the low cradle of stone that holds it — the god's round of 13 px over the top step (a wheel facing
  // the front is a little flatter seen from the god's corner: 3.4 m reach its height and its width): its rim, its face, the
  // four painted rings (at 10, 7.5, 5 and 2.6 of its 13) and the eight rays between the inner ones
  def('monument', 'asteca', L => {
    const R = 3.4, y0 = px(4.5), cr = 0.3;
    return { els: [
      ...degraus(L, 0.9, 3, 1.5, 0.12),
      { k: 'bloco', r: rect(L, -0.3, 0.1 - 0.15, 0.3, 0.1 + 0.15), y0, y1: y0 + cr, cor: ['#8a8478', '#6f6a60', '#a09a8e'] },
      { k: 'roda', c: [L / 2, at(L, 0.1)], y: y0 + cr + R, r: R, t: 0.8, cor: ['#9a9488', '#b8b2a4'], aneis: [[10 / 13, '#2fae8f'], [7.5 / 13, '#b33a2a'], [5 / 13, '#e8c24a'], [2.6 / 13, '#b33a2a']], larg: 1.2 / 13, raios: { n: 8, r0: 5.5 / 13, r1: 9.5 / 13, a: 0.15, cor: '#7a746a' } },
    ] };
  });
  // the rune stones (nordico): on the grass of 0.9 tiles the god's three standing stones — at [x, y] tiles, so many px tall,
  // so many tiles each side of their middle —, tapering to three quarters, their tops falling 2 px to the left and 1 px to
  // the back from the front corner, the red serpent carved down the front of each
  def('monument', 'nordico', L => ({ els: [
    { k: 'bloco', r: rect(L, -0.9, -0.9, 0.9, 0.9), y0: 0, y1: px(0.3), cor: ['#6a8a3a', '#5e7e36', '#7a9a4a'], mat: 'turf' },
    ...[[-0.4, -0.35, 26, 0.13], [0.35, -0.2, 34, 0.16], [0, 0.35, 22, 0.12]].map(([x, y, h, w]) => (
      { k: 'pedra', c: [at(L, x), at(L, y)], e: w * TILE, e1: w * TILE * 0.75, y0: 0, y1: px(h), cai: [px(2), px(1)], cor: ['#a09a90', '#7e7870'], cobra: '#b33a2a' })),
  ] }));

  // ------------------------------ the golden statue (cityart.js estatua) ------------------------------
  // its two steps of 0.46 and 0.34 tiles, 2 px each, the column of 0.2 tiles to 11 px with its golden band, and on it the
  // god in gold as each people makes him: robed, with spear and shield (the classical, the Greek, the Roman: 26 px); with his
  // two ravens (the Norse: 24 px); enthroned in the nemes with the crook (the Egyptian: to 20.6 px); the feathered serpent
  // rising in its coils (the Aztec: to 27.4 px, the top of its crest)
  const pedestal = L => [
    { k: 'bloco', r: rect(L, -0.46, -0.46, 0.46, 0.46), y0: 0, y1: px(2), cor: ['base0', 'base1', 'base2'] },
    { k: 'bloco', r: rect(L, -0.34, -0.34, 0.34, 0.34), y0: px(2), y1: px(4), cor: ['base0', 'base1', 'base2'] },
    { k: 'bloco', r: rect(L, -0.2, -0.2, 0.2, 0.2), y0: px(4), y1: px(11), cor: ['col0', 'col1', 'col0'] },
    { k: 'faixa', r: rect(L, -0.2, -0.2, 0.2, 0.2), y0: px(9.6), y1: px(10.4), cor: '#e8b83a' },
  ];
  const GOLD = '#f2c14e';
  def('estatua', 'classico', L => ({ els: [...pedestal(L), { k: 'estatua', p: [L / 2, L / 2, px(11)], h: px(26), w: robe(26), cor: GOLD, lanca: true }] }));
  def('estatua', 'nordico', L => ({ els: [...pedestal(L), { k: 'estatua', p: [L / 2, L / 2, px(11)], h: px(24), w: robe(24), cor: GOLD, lanca: true, corvos: '#2a2a30' }] }));
  def('estatua', 'egipcio', L => ({ els: [...pedestal(L), { k: 'estatua', p: [L / 2, L / 2, px(11)], h: px(20.6), cor: GOLD, pose: 'trono', nemes: '#2f5fae' }] }));
  def('estatua', 'asteca', L => ({ els: [...pedestal(L), { k: 'estatua', p: [L / 2, L / 2, px(11)], h: px(27.4), cor: GOLD, pose: 'serpente', penas: '#2fae8f', olho: '#b33a2a' }] }));

  // ------------------------------ the theatre of each people (arch.js teatro) ------------------------------
  // (the rings of a bowl as the god paints them: six, from the rim of r and H px, each a tenth narrower and 12% of H lower —
  // arch.js bowl(); the rows a body sits on come with the plan's tiers, and both views follow them: D-084)
  const bowlRings = (r, hp) => { const out = []; for (let k = 0; k < 6; k++) out.push([r * (1 - k * 0.1), px(hp - k * hp * 0.12)]); return out; };
  // the arena (romano): the god's bowl of r 1.35 tiles and 26 px, two tiers of arches round it, its rings of seats inside, the
  // arena at its heart 0.3 of its height up — the Colosseum's own, smaller and without the awning
  def('teatro', 'romano', L => {
    const R = 1.35 * TILE, H = px(26), c = [L / 2, L / 2]; const rings = bowlRings(R, 26);
    return { els: [
      { k: 'tambor', c, r: R, t: R * 0.1, y0: 0, y1: H, andares: 2, arcos: 24, arcoW: 0.6, arcoA: 0.175, arcoB: 0.725, cor: ['#e0c79a', '#b09268'], escuro: '#2a1e18', mat: 'ashlar' },
      { k: 'cavea', c, aneis: rings, fundo: R * 0.4, cor: '#c8b8a0' },
      { k: 'arena', c, r: R * 0.4, y: px(26 * 0.3), cor: '#e8d8a8', muro: rings[5][1] },
    ], door: { u: L / 2, w: 0.9, y0: 0, y1: H / 2 * 0.725 } };
  });
  // the Greek (and classical) theatre: on its paved ground, the half bowl of r 1.3 tiles and 16 px opening to the front —
  // its back wall and its ends standing on the ground —, the orchestra round before it, the stage building along the front
  // (the skene of 1.8 × 0.3 tiles and 9 px; the Greek's painted band at its top) with its six columns before it, 7 px
  const theatre = grego => L => {
    const R = 1.3 * TILE, c = [L / 2, L / 2]; const els = [
      { k: 'bloco', r: rect(L, -1.4, -1.4, 1.4, 1.4), y0: 0, y1: px(0.2), cor: ['#a8a08c', '#988f7c', '#b8b09c'], mat: 'slab' },
      { k: 'cavea', c, aneis: bowlRings(R, 16), fundo: R * 0.4, cor: '#d8d0bc', arco: [Math.PI, 2 * Math.PI], fecho: 'wl' },
      { k: 'arena', c: [L / 2, at(L, 0.3)], r: 0.53 * TILE, y: px(0.3), cor: '#e8dcc0' },
      { k: 'bloco', r: rect(L, -0.9, 0.85, 0.9, 1.15), y0: 0, y1: px(9), cor: ['wl', 'wr', 'top'] },
    ];
    if (grego) els.push({ k: 'faixa', r: rect(L, -0.9, 0.85, 0.9, 1.15), y0: px(7.5), y1: px(9), cor: 'acc' });
    const cols = []; for (let k = 0; k < 6; k++) cols.push([at(L, -0.85 + 1.7 * k / 5), at(L, 1.25)]);
    els.push({ k: 'colunata', pts: cols, r: 0.03 * TILE, y0: 0, y1: px(7), cor: ['col0', 'col1'] });
    return { els };
  };
  def('teatro', 'classico', theatre(false));
  def('teatro', 'grego', theatre(true));
  // the sacred garden (egipcio): its lawn, its walls at the back and the left (5 px), the pool of 1.4 × 1 tiles in its rim
  // of stone with the lotus on its water, the six palms, the sphinx in the front corner
  def('teatro', 'egipcio', L => {
    const e = 1.4; const els = [
      { k: 'bloco', r: rect(L, -e, -e, e, e), y0: 0, y1: px(0.3), cor: ['#76983e', '#668a36', '#86a84e'], mat: 'turf' },
      { k: 'bloco', r: rect(L, -e, -e, e, -e + 0.08), y0: 0, y1: px(5), cor: ['wl', 'wr', 'top'] },
      { k: 'bloco', r: rect(L, -e, -e, -e + 0.08, e), y0: 0, y1: px(5), cor: ['wl', 'wr', 'top'] },
      // (the pool: its rim of stone round the water, the floor under it)
      ...[[-0.7, -0.5, 0.7, -0.42], [-0.7, 0.42, 0.7, 0.5], [-0.7, -0.42, -0.62, 0.42], [0.62, -0.42, 0.7, 0.42]].map(q => ({ k: 'bloco', r: rect(L, ...q), y0: 0, y1: px(1.6), cor: ['base0', 'base1', 'base2'] })),
      { k: 'bloco', r: rect(L, -0.62, -0.42, 0.62, 0.42), y0: 0, y1: px(0.5), cor: ['base1', 'base1', '#3a6a7a'] },
      { k: 'lamina', r: rect(L, -0.62, -0.42, 0.62, 0.42), y: px(1.2), cor: '#4a9ac0' },
    ];
    const lotus = []; for (let k = 0; k < 6; k++) lotus.push([at(L, -0.5 + k * 0.2), at(L, -0.2 + (k % 2) * 0.35)]);
    els.push({ k: 'flores', pts: lotus, y: px(1.2), r: 0, n: 1, b: 0.24, chato: true, cor: ['#5a9a3c', '#f0a0c0'] });
    for (const [x, y] of [[-1.1, -0.9], [-0.9, 1.1], [1.1, -1.1], [1.1, 0.9], [0, -1.15], [-1.15, 0.1]]) els.push({ k: 'palmeira', p: [at(L, x), at(L, y), px(0.3)], h: px(14.4), s: 1.2 });
    els.push({ k: 'estatua', p: [at(L, 0.95), at(L, 0.95), px(0.3)], h: px(9.2), cor: 'wl', pose: 'esfinge' });
    return { els };
  });
  // the ball court (asteca): on its ground, the two walls of 2.4 × 0.75 tiles and 7 px, their faces to the court sloping down
  // to it (the benches), the painted band at their tops, the alley between them with its band, and the stone ring on each
  // wall's slope, facing the alley
  def('teatro', 'asteca', L => {
    const e = 1.4, H = px(7); const els = [{ k: 'bloco', r: rect(L, -e, -e, e, e), y0: 0, y1: px(0.3), cor: ['top', 'top', 'top'] }];
    for (const s of [-1, 1]) {
      const r = s < 0 ? rect(L, -1.2, -1.2, 1.2, -0.25) : rect(L, -1.2, 0.25, 1.2, 1.2), r1 = s < 0 ? rect(L, -1.2, -1.2, 1.2, -0.45) : rect(L, -1.2, 0.45, 1.2, 1.2);
      els.push({ k: 'talude', r, r1, y0: 0, y1: H, cor: ['wl', 'wr', 'top'], mat: 'stucco' }, { k: 'faixa', r: r1, y0: px(5.5), y1: H, cor: 'trim' });
    }
    els.push({ k: 'bloco', r: rect(L, -1.2, -0.25, 1.2, 0.25), y0: 0, y1: px(0.4), cor: ['#b8a888', '#a89878', '#b8a888'] });
    els.push({ k: 'faixa', r: rect(L, -1.2, -0.25, 1.2, 0.25), y0: px(0.3), y1: px(0.6), cor: 'trim2' });
    for (const s of [-1, 1]) els.push({ k: 'aro', c: [L / 2, at(L, s * 0.3), px(4.5)], r: 0.5, t: 0.08, dir: -s, cor: '#6a645a' });
    return { els };
  });
  // the mead hall (nordico): the god's longhouse of 2.5 × 1.2 tiles — its footing of 1.2 px, its walls of planks to 9 px with
  // the red band under the eaves, the door, the three painted shields on its front, the steep roof of turf 22 px high and
  // the dragon at its gable
  def('teatro', 'nordico', L => {
    const lx = 1.25, ly = 0.6, z0 = px(1.2), H = px(9), rh = px(22);
    return { els: [
      { k: 'bloco', r: rect(L, -lx - 0.04, -ly - 0.04, lx + 0.04, ly + 0.04), y0: 0, y1: z0, cor: ['base0', 'base1', 'base2'] },
      { k: 'bloco', r: rect(L, -lx, -ly, lx, ly), y0: z0, y1: H, cor: ['wl', 'wr', 'top'], tabuas: 10 },
      { k: 'faixa', r: rect(L, -lx, -ly, lx, ly), y0: H - px(0.8), y1: H, cor: 'trim' },
      { k: 'porta', na: 'frente', v: at(L, ly), u: L / 2, w: 0.16 * TILE, y0: z0, y1: px(7.5), cor: 'door' },
      ...[[-lx + 0.2, '#a23c2a'], [0.2 * lx, '#d8b25a'], [lx - 0.25, '#3f6fb0']].map(([x, cor]) => ({ k: 'disco', na: 'frente', u: at(L, x), v: at(L, ly), y: H * 0.55, r: 0.42, cor, olho: '#d8c89a' })),
      { k: 'telhado', r: rect(L, -lx, -ly, lx, ly), y0: H, y1: H + rh, ao: 'u', ov: 0.1 * TILE, cor: ['roof0', 'roof1', 'wl', 'roof2'], mat: 'turf' },
      { k: 'dragao', p: [at(L, lx + 0.1), L / 2, H + rh], dir: 1, cor: '#3a2616' },
    ], door: { u: L / 2, w: 0.64, y0: z0, y1: px(7.5) } };
  });

  // ------------------------------ the statues' figures ------------------------------
  // the parts of a statue (estatua), in the canonical frame — what the 3D builds, and what its far figure and its height
  // keep (the god paints the figure flat; these are its solids, as wide seen from the god's corner):
  //   caixa   a block standing on c [u, v, y]: a across, d deep, h up
  //   bola    a ball at c: r, ry (its half height, when not round)
  //   haste   a round bar from a to b, r: a spear, a staff, a neck, a feather
  //   escudo  a round at c facing the front, r
  //   espira  the coils of a serpent: a tube winding up from c, h high, voltas turns, its ring from R0 to R1 and its
  //           thickness from t0 to t1, beginning (and so ending) on its left; its turns darker and lighter by turns (toms)
  // each with its colour (cor) and, where the god shades it, how much darker (tom)
  Fo.figure = function (e) {
    const [u, v, y] = e.p, h = e.h, c = e.cor, out = [];
    if (e.pose === 'esfinge') {
      // (the god's sphinx in the garden's corner: the lion lying, 1.6 m long, its head in the nemes up at its front, 2.3 m)
      const k = h / 3.03; const c2 = c;
      out.push({ k: 'caixa', c: [u, v - 0.1 * k, y], a: 0.55 * k, d: 1.5 * k, h: 0.95 * k, cor: c2, tom: 0.92 });
      out.push({ k: 'caixa', c: [u, v + 0.45 * k, y + 0.95 * k], a: 0.5 * k, d: 0.45 * k, h: 0.7 * k, cor: c2 });
      out.push({ k: 'bola', c: [u, v + 0.5 * k, y + 2.0 * k], r: 0.36 * k, ry: 0.42 * k, cor: c2 });
      out.push({ k: 'caixa', c: [u, v + 0.45 * k, y + 1.65 * k], a: 0.72 * k, d: 0.5 * k, h: 0.45 * k, cor: c2, tom: 0.85 });
    } else if (e.pose === 'trono') {
      // (the god's seated king: the throne and the legs to 0.39 of its height, a little darker; the body to 0.78; the head;
      // the nemes over it — its crown from 0.85 to the top, its lappets down beside the face —; the crook in his right hand)
      out.push({ k: 'caixa', c: [u, v + 0.02 * h, y], a: 0.118 * h, d: 0.103 * h, h: 0.388 * h, cor: c, tom: 0.8 });
      out.push({ k: 'caixa', c: [u, v - 0.012 * h, y + 0.388 * h], a: 0.092 * h, d: 0.071 * h, h: 0.39 * h, cor: c });
      out.push({ k: 'bola', c: [u, v + 0.004 * h, y + 0.84 * h], r: 0.058 * h, ry: 0.07 * h, cor: c });
      out.push({ k: 'caixa', c: [u, v - 0.012 * h, y + 0.855 * h], a: 0.125 * h, d: 0.09 * h, h: 0.145 * h, cor: e.nemes });
      for (const s of [-1, 1]) out.push({ k: 'caixa', c: [u + s * 0.052 * h, v + 0.012 * h, y + 0.73 * h], a: 0.024 * h, d: 0.04 * h, h: 0.13 * h, cor: e.nemes });
      out.push({ k: 'haste', a: [u + 0.045 * h, v + 0.03 * h, y + 0.66 * h], b: [u + 0.09 * h, v + 0.03 * h, y + 0.66 * h], r: 0.018 * h, cor: c });
      out.push({ k: 'haste', a: [u + 0.09 * h, v + 0.035 * h, y + 0.553 * h], b: [u + 0.09 * h, v + 0.035 * h, y + 0.8 * h], r: 0.016 * h, cor: c });
      out.push({ k: 'bola', c: [u + 0.09 * h, v + 0.035 * h, y + 0.825 * h], r: 0.028 * h, cor: c });
    } else if (e.pose === 'serpente') {
      // (the god's feathered serpent, in metres of its 9 m: three coils on the column, the lowest as wide as the column, the
      // neck rising from the top one on the left and bending to the right, the head to the right with its jaw and its red
      // eye, the crest of five feathers — jade and gold by turns — up from the back of the head)
      const k = h / 9.0, R1 = 0.36 * k, t1 = 0.28 * k, hc = 3.9 * k;
      out.push({ k: 'espira', c: [u, v, y], h: hc, voltas: 3, R0: 0.5 * k, R1, t0: 0.35 * k, t1, cor: c, toms: [1, 0.8] });
      const A = [u - R1, v, y + hc - t1], B = [u - 0.15 * k, v, y + 7.3 * k], C = [u + 0.55 * k, v, y + 6.75 * k]; const n = 6;
      const bz = t => [0, 1, 2].map(i => (1 - t) * (1 - t) * A[i] + 2 * (1 - t) * t * B[i] + t * t * C[i]);
      for (let j = 0; j < n; j++) out.push({ k: 'haste', a: bz(j / n), b: bz((j + 1) / n), r: t1 + (0.24 * k - t1) * j / (n - 1), cor: c, tom: j % 2 ? 0.8 : 1 });
      out.push({ k: 'caixa', c: [u + 0.95 * k, v, y + 6.35 * k], a: 0.9 * k, d: 0.52 * k, h: 0.55 * k, cor: c });
      out.push({ k: 'caixa', c: [u + 0.9 * k, v, y + 5.95 * k], a: 0.7 * k, d: 0.42 * k, h: 0.26 * k, cor: c, tom: 0.8 });
      for (const s of [-1, 1]) out.push({ k: 'bola', c: [u + 1.12 * k, v + s * 0.25 * k, y + 6.68 * k], r: 0.08 * k, cor: e.olho });
      // (the feathers fan out across the god's view, as its crest is, a hand apart at their tips)
      for (let j = 0; j < 5; j++) out.push({ k: 'haste', a: [u + (0.52 + 0.04 * j) * k, v + (0.08 - 0.04 * j) * k, y + 6.85 * k], b: [u + (0.1 + 0.125 * j) * k, v + (0.1 - 0.06 * j) * k, y + (8.6 + 0.08 * j) * k], r: 0.15 * k, cor: j % 2 ? e.penas : c });
    } else {
      // (the robed god: the robe to 0.62 of his height, the belt and the shoulders, the head; the spear upright at his right
      // hand and the round shield on his left arm; the ravens on his shoulders)
      const w = e.w || Math.max(0.32, h * 0.085);
      out.push({ k: 'caixa', c: [u, v, y], a: 2 * w, d: 1.3 * w, h: 0.62 * h, cor: c });
      out.push({ k: 'caixa', c: [u, v, y + 0.62 * h], a: 2.2 * w, d: 1.4 * w, h: 0.1 * h, cor: c, tom: 0.9 });
      out.push({ k: 'bola', c: [u, v, y + 0.78 * h], r: 0.75 * w, cor: c });
      if (e.lanca) { out.push({ k: 'haste', a: [u + 1.3 * w, v, y + 0.05 * h], b: [u + 1.3 * w, v, y + 1.1 * h], r: 0.05, cor: c, tom: 0.7 });
        out.push({ k: 'escudo', c: [u - 1.25 * w, v + 0.2 * w, y + 0.42 * h], r: 1.1 * w, cor: c, tom: 0.85 }); }
      if (e.corvos) for (const s of [-1, 1]) { const q = [u + s * 1.05 * w, v - 0.1 * w, y + 0.72 * h];
        out.push({ k: 'bola', c: [q[0], q[1], q[2] + 0.16], r: 0.2, ry: 0.15, cor: e.corvos }, { k: 'bola', c: [q[0], q[1] + 0.16, q[2] + 0.34], r: 0.1, cor: e.corvos }); }
    }
    return out;
  };
  // (the top of a figure's part, m: a bar's is its higher end's, and its round's rim as far as it leans)
  const partTop = p => {
    if (p.k === 'haste') { const d = [p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]]; const l = Math.hypot(...d) || 1; return Math.max(p.a[2], p.b[2]) + p.r * Math.sqrt(Math.max(0, 1 - (d[2] / l) * (d[2] / l))); }
    return p.k === 'caixa' ? p.c[2] + p.h : p.k === 'bola' ? p.c[2] + (p.ry || p.r) : p.k === 'escudo' ? p.c[2] + p.r : p.k === 'espira' ? p.c[2] + p.h : 0;
  };
  // (a figure's part as a mass: a block, or a round from one end to the other — a ball as the round that holds most of it)
  const partMass = p => (p.k === 'caixa' ? { k: 'box', r: [p.c[0] - p.a / 2, p.c[1] - p.d / 2, p.c[0] + p.a / 2, p.c[1] + p.d / 2], y0: p.c[2], y1: p.c[2] + p.h, cor: p.cor }
    : p.k === 'bola' ? { k: 'tronco', a: [p.c[0], p.c[1], p.c[2] - 0.7 * (p.ry || p.r)], b: [p.c[0], p.c[1], p.c[2] + 0.7 * (p.ry || p.r)], r0: p.r, r1: p.r, cor: p.cor }
    : p.k === 'haste' ? { k: 'tronco', a: p.a, b: p.b, r0: p.r, r1: p.r, cor: p.cor }
    : p.k === 'escudo' ? { k: 'tronco', a: [p.c[0], p.c[1] - 0.03, p.c[2]], b: [p.c[0], p.c[1] + 0.03, p.c[2]], r0: p.r, r1: p.r, cor: p.cor }
    : p.k === 'espira' ? { k: 'tronco', a: p.c, b: [p.c[0], p.c[1], p.c[2] + p.h], r0: p.R0 + p.t0, r1: p.R1 + p.t1, cor: p.cor } : null);

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
      const y = e.k === 'mastros' ? e.y0 + e.h : e.k === 'estatua' ? Math.max(...Fo.figure(e).map(partTop)) : e.k === 'roda' ? e.y + e.r : e.k === 'flores' ? e.y + 0.2 : e.k === 'palmeira' ? e.p[2] + e.h + 0.5 : e.k === 'aro' ? e.c[2] + e.r + e.t : e.k === 'lamina' ? e.y : e.k === 'braseiro' ? e.p[2] + 0.8 : e.k === 'dragao' ? e.p[2] + 1.1 : e.k === 'escalonada' ? e.niveis[e.niveis.length - 1][2] : e.k === 'arena' ? e.y : e.k === 'cavea' ? Math.max(...e.aneis.map(a => a[1])) : e.k === 'escada' ? Math.max(e.a[2], e.b[2]) : e.k === 'disco' || e.k === 'porta' ? 0 : e.y1;
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
      else if (e.k === 'tambor' || e.k === 'coluna') out.push({ k: 'circ', c: e.c, r: e.r });
      else if (e.k === 'pedra') out.push({ k: 'rect', r: [e.c[0] - e.e, e.c[1] - e.e, e.c[0] + e.e, e.c[1] + e.e] });
      else if (e.k === 'roda') out.push({ k: 'rect', r: [e.c[0] - e.r, e.c[1] - e.t / 2, e.c[0] + e.r, e.c[1] + e.t / 2] });
    }
    return out;
  };
  // the far figure of a form: its masses alone, the simplest solids that keep its silhouette — a box, a battered block, a
  // pyramid, a drum, a gable roof, a round (tronco: from a [u, v, y], r0 round, to b, r1 round) — in the canonical frame:
  // [{ k, … }]
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
      else if (e.k === 'coluna') out.push({ k: 'tronco', a: [e.c[0], e.c[1], e.y0], b: [e.c[0], e.c[1], e.y1], r0: e.r, r1: e.r, cor: e.cor[0] });
      else if (e.k === 'pedra') out.push({ k: 'talude', r: [e.c[0] - e.e, e.c[1] - e.e, e.c[0] + e.e, e.c[1] + e.e], r1: [e.c[0] - e.e1, e.c[1] - e.e1, e.c[0] + e.e1, e.c[1] + e.e1], y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'roda') out.push({ k: 'tronco', a: [e.c[0], e.c[1] - e.t / 2, e.y], b: [e.c[0], e.c[1] + e.t / 2, e.y], r0: e.r, r1: e.r, cor: e.cor[1] });
      else if (e.k === 'estatua') for (const p of Fo.figure(e)) { const m = partMass(p); if (m) out.push(m); }
      else if (e.k === 'cavea' && e.arco) out.push({ k: 'anel', c: e.c, r: e.aneis[0][0], t: e.aneis[0][0] - e.fundo, y0: 0, y1: e.aneis[0][1], a0: e.arco[0], a1: e.arco[1], cor: e.cor });
      else if (e.k === 'palmeira') out.push({ k: 'tronco', a: e.p, b: [e.p[0], e.p[1], e.p[2] + e.h], r0: 0.12, r1: 0.1, cor: '#8a6a44' }, { k: 'tronco', a: [e.p[0], e.p[1], e.p[2] + e.h - 0.35], b: [e.p[0], e.p[1], e.p[2] + e.h + 0.3], r0: e.s, r1: e.s * 0.5, cor: '#4f9d45' });
    }
    return out;
  };
  // the faces of a round mass (tronco) in the canonical frame: triangles with the way each faces, [{ p: [A, B, C], n }] —
  // for whoever draws the far figure (the thinner, the fewer sides)
  Fo.faces = function (m) {
    const d = [m.b[0] - m.a[0], m.b[1] - m.a[1], m.b[2] - m.a[2]]; const l = Math.hypot(...d) || 1; const ax = d.map(q => q / l);
    let e1 = Math.abs(ax[2]) > 0.9 ? [1, 0, 0] : [-ax[1], ax[0], 0]; const l1 = Math.hypot(...e1); e1 = e1.map(q => q / l1);
    const e2 = [ax[1] * e1[2] - ax[2] * e1[1], ax[2] * e1[0] - ax[0] * e1[2], ax[0] * e1[1] - ax[1] * e1[0]];
    const R = Math.max(m.r0, m.r1); const n = R < 0.15 ? 6 : R < 0.6 ? 10 : 16; const TAU = Math.PI * 2;
    const way = t => [Math.cos(t) * e1[0] + Math.sin(t) * e2[0], Math.cos(t) * e1[1] + Math.sin(t) * e2[1], Math.cos(t) * e1[2] + Math.sin(t) * e2[2]];
    const at3 = (o, r, t) => { const w = way(t); return [o[0] + w[0] * r, o[1] + w[1] * r, o[2] + w[2] * r]; };
    const out = []; const down = ax.map(q => -q);
    for (let k = 0; k < n; k++) {
      const t0 = k / n * TAU, t1 = (k + 1) / n * TAU; const nn = way((t0 + t1) / 2);
      const A0 = at3(m.a, m.r0, t0), A1 = at3(m.a, m.r0, t1), B0 = at3(m.b, m.r1, t0), B1 = at3(m.b, m.r1, t1);
      out.push({ p: [A0, A1, B1], n: nn }, { p: [A0, B1, B0], n: nn }, { p: [m.a, A1, A0], n: down }, { p: [m.b, B0, B1], n: ax });
    }
    return out;
  };
  // (for the proofs: the god's units of a form's number)
  Fo.px = y => y * ZPX;
})(window.G);
