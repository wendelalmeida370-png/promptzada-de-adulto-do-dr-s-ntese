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
  // middle and toward the front, and its wind-catcher at the back on the right, its mouth to the front; the Aztec's three
  // pots of flowers along the front — none on a roof one lives on (Fo.lived: a room on it is its shade; a terrace is where
  // people walk and the plan's own things stand — the awning was at 1.5 m over it, the tower in the way, the pots in the
  // parapet's foot: L-272) — in lot metres, over the roof:
  // { front, across, items: [{ k: 'toldo', x, z, w, d, h (its back), h1 (its front) } | { k: 'torre', x, z, w, h, boca }
  // | { k: 'vaso', x, z, r, cor }] } (the god's numbers: its awning 0.3 × 0.22 tiles and 5 px, its tower 0.16 tiles and 6 px)
  // (a roof one lives on, of a shell's record — Interiors' shellOf, a plan: a room on its roof, or a terrace over its storeys)
  Fo.lived = s => !!(s && ((s.shell && s.shell.roof && s.shell.roof.room) || (s.levels || []).some(l => l.kind === 'terraco')));
  Fo.deck = function (r, s, L, st, lived) {
    const a = Fo.toCan(s, L, r[0], r[1]), b = Fo.toCan(s, L, r[2], r[3]);
    const u0 = Math.min(a[0], b[0]), u1 = Math.max(a[0], b[0]), v0 = Math.min(a[1], b[1]), v1 = Math.max(a[1], b[1]);
    const at = (u, v) => Fo.toLot(s, L, u, v); const items = [];
    if (lived) return { front: Fo.dirLot(s, 0, 1), across: Fo.dirLot(s, 1, 0), items };
    if (st === 'egipcio') {
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
  //   janelas    a row of windows on a face — na 'frente' or 'fundo' at v = em, 'direita' or 'esquerda' at u = em —, from de to
  //              ate along it, y0..y1: n panes evenly, each as wide as a gap (the god's winsL, winsR), or the one opening de..ate
  //              (n 0); tinta: an opening painted that colour, not glass (the dark of an arch, a patch of boards); grade: bars
  //   placa      a plate on the front: v, u, w wide, y0..y1, cor (a sign, a painted relief, an iron band)
  //   bandeira   a flag: its pole from p [u, v, y] up h, the pennant at its top, cor
  //   bola       a ball: c [u, v, y], r, cor
  //   tora       a round timber from a [u, v, y] to b, r, cor (a leg, a brace, a post, the beam of a shaduf)
  //   tina       a tub of staves: c [u, v], r, y0..y1, cor; aros (its hoops) of aro's colour, borda: its rim, agua: its water
  //   pano       a sheet of four corners p [[u, v, y], …] seen from both sides (a lean-to of boards, a curtain), cor; grosso: as
  //              thick as that
  //   letreiro   a sign on its arm out of a corner: p [u, v, y] the corner, cor; moeda: the coin painted on it
  //   bacia      a round basin of stone: c [u, v], r (its outer round), t (its rim), y0..y1, nivel (the water under the rim),
  //              blocos (its rim of so many dressed blocks; none: a ring), cor, agua (its water), fundo (the colour of its floor)
  //   banco      a bench: its plank over r, its seat y up, on two feet of stone (pes), cor
  //   morro      a hill of rock or a heap — the god's dome turned round (Fo.dome) —: c [u, v], r (its round at its foot), y0..y1,
  //              cor [up it, at its foot]; ouro: its colours in a mine of gold (the ore in its cart); veios: so many glints of ore
  //              in it — gold in a mine of gold
  //   (telhado quatro: a hip — the god's hip, its ridge along the longer side —; dragao ao 'v': along the way in; colunata
  //   papiro { h, r, cor }: the papyrus capitals of Egypt)
  //   (cavea, a part of the round: arco [a0, a1], the angles it spans — from +u toward +v —; fecho: the colour of its back
  //   wall and its ends, standing on the ground where no drum holds it)
  // (mat on an element: the stuff it is built of — 'base' the people's own stone, 'parede' its walls')
  // (and for the plan — D-093: G.Forma.uses, solids, body —: uso, what a piece is for — 'fonte', 'tribuna', 'banco' —, vira
  // [du, dv] the way one faces using it; piso: a floor one walks on (the square's pavement); degrau: a tread of a flight — 1
  // the body's way in, or the use it climbs to ('tribuna'); a form's body: { walls, porch: { r, y1, cols }, base, steps })
  // ------------------------------ the god's units ------------------------------
  const px = z => z / ZPX;
  const at = (L, d) => L / 2 + d * TILE; // (tiles from the middle of the lot, the god's dx or dy, to metres from its corner)
  const rect = (L, x0, y0, x1, y1) => [at(L, x0), at(L, y0), at(L, x1), at(L, y1)];
  // ------------------------------ the forms ------------------------------
  // (each a function of the lot's side L, metres: the god draws the wonder on a 3 × 3 lot)
  const FORMS = {};
  const def = (type, style, fn) => { (FORMS[type] = FORMS[type] || {})[style] = fn; };

  // ------------------------------ the god's kit, as forms ------------------------------
  // (arch.js and cityart.js draw a building with a few helpers — a plinth, the walls, a row of windows, a band, the people's
  // roof, a row of columns, a hall, a longhouse, cityart's small house —: the same helpers here give their elements, in the
  // god's numbers — x, y tiles from the lot's middle, z px)
  const BASE = ['base0', 'base1', 'base2'], WALL = ['wl', 'wr', 'top'], COL = ['col0', 'col1', 'col0'];
  // (the people's roof as the god's palette has it — arch.js PAL: its kind and its pitch)
  const ROOFK = { classico: ['gable', 0.9], grego: ['gable', 0.5], romano: ['hip', 0.55], egipcio: ['flat', 0.8], asteca: ['flat', 0.8], nordico: ['turf', 1.3] };
  const blocoF = (L, x0, y0, x1, y1, z0, z1, cor, o) => Object.assign({ k: 'bloco', r: rect(L, x0, y0, x1, y1), y0: px(z0), y1: px(z1), cor: cor || WALL }, o);
  const faixaF = (L, x0, y0, x1, y1, z0, z1, cor) => ({ k: 'faixa', r: rect(L, x0, y0, x1, y1), y0: px(z0), y1: px(z1), cor });
  // (arch.js plinth: the rect and 0.05 tiles round it, h px of the people's stone; cityart's house, 0.04)
  const plinthF = (L, x0, y0, x1, y1, h, e) => { const m = e === undefined ? 0.05 : e; return blocoF(L, x0 - m, y0 - m, x1 + m, y1 + m, 0, h, BASE); };
  // (arch.js walls: from z0 to z1 px; battered — ins tiles in at their top — the Egyptian's)
  const wallsF = (L, x0, y0, x1, y1, z0, z1, ins, o) => (ins ? Object.assign({ k: 'talude', r: rect(L, x0, y0, x1, y1), r1: rect(L, x0 + ins, y0 + ins, x1 - ins, y1 - ins), y0: px(z0), y1: px(z1), cor: WALL, mat: 'parede' }, o) : blocoF(L, x0, y0, x1, y1, z0, z1, WALL, Object.assign({ mat: 'parede' }, o)));
  const doorF = (L, y1, a, b, z0, z1, cor) => ({ k: 'porta', na: 'frente', v: at(L, y1), u: at(L, (a + b) / 2), w: (b - a) * TILE, y0: px(z0), y1: px(z1), cor: cor || 'door' });
  // (a row of windows: arch.js winsL on the front at y, winsR on the right at x — n panes evenly from a to b —; n 0, the one
  // opening from a to b, the god's onL and onR; the god sees the front and the right, the 3D every side: winsLR puts the
  // right's on the left too, at its own face)
  const winsF = (L, na, em, a, b, z, h, n, o) => Object.assign({ k: 'janelas', na, em: at(L, em), de: at(L, a), ate: at(L, b), y0: px(z), y1: px(z + h), n }, o);
  const winsLR = (L, x0, x1, a, b, z, h, n, o) => [winsF(L, 'direita', x1, a, b, z, h, n, o), winsF(L, 'esquerda', x0, a, b, z, h, n, o)];
  // (arch.js parapet: four rails of 0.05 tiles round the rect, h px over z)
  const parapetF = (L, x0, y0, x1, y1, z, h) => { const w = 0.05, c = ['par0', 'par1', 'par0']; return [blocoF(L, x0, y0, x1, y0 + w, z, z + h, c), blocoF(L, x0, y0 + w, x0 + w, y1 - w, z, z + h, c), blocoF(L, x0, y1 - w, x1, y1, z, z + h, c), blocoF(L, x1 - w, y0 + w, x1, y1 - w, z, z + h, c)]; };
  // the people's roof (arch.js roof): flat — the walls' top, and its parapet of 1.4 px (o.par; 0: none) —, a hip, thatch, a
  // gable or turf, ov tiles out, rh px high (the god's: 18 px a tile of the rect's narrower side × the pitch), the ridge along
  // y where the rect is longer that way, the turf's dragon at the ridge's end — its elements and its top, px
  function roofF(L, st, x0, y0, x1, y1, z, o) {
    o = o || {}; const [k0, pitch] = ROOFK[st] || ROOFK.classico; const kind = o.kind || k0; const ov = o.ov !== undefined ? o.ov : 0.08;
    if (kind === 'flat') { const h = o.par === 0 ? 0 : o.par || 1.4; return { els: h ? parapetF(L, x0, y0, x1, y1, z, h) : [], z: z + h }; }
    const rh = o.rh || Math.min(x1 - x0, y1 - y0) * 18 * pitch; const alongY = o.alongY || (x1 - x0 < y1 - y0 - 0.01);
    const t = { k: 'telhado', r: rect(L, x0, y0, x1, y1), y0: px(z), y1: px(z + rh), ao: alongY ? 'v' : 'u', ov: ov * TILE, cor: o.cor || ['roof0', 'roof1', 'gable', 'roof2'] };
    if (kind === 'hip') t.quatro = true;
    if (kind === 'thatch') Object.assign(t, { ov: (ov + 0.04) * TILE, cor: ['thatch0', 'thatch1', 'wl', '#7a5a2e'], mat: 'thatch' });
    const els = [t];
    if (kind === 'turf') { t.mat = 'turf'; els.push(alongY ? { k: 'dragao', p: [at(L, (x0 + x1) / 2), at(L, y1 + ov), px(z + rh)], dir: 1, ao: 'v', cor: '#3a2616' } : { k: 'dragao', p: [at(L, x1 + ov), at(L, (y0 + y1) / 2), px(z + rh)], dir: 1, cor: '#3a2616' }); }
    return { els, z: z + rh };
  }
  // a row of columns (arch.js colonnade): along the back and the left (B), the front (L: y1), the right (R: x1), n a side, r
  // tiles, z0..z1 px; flared: the papyrus capitals of Egypt, wider, in the second accent
  function colsF(L, x0, y0, x1, y1, z0, z1, n, r, sides, flared) {
    const pts = []; const add = (x, y) => { if (!pts.some(p => Math.abs(p[0] - x) < 1e-6 && Math.abs(p[1] - y) < 1e-6)) pts.push([x, y]); };
    if (sides.includes('B')) { for (let k = 0; k < n; k++) add(x0 + (x1 - x0) * k / (n - 1), y0); for (let k = 1; k < n; k++) add(x0, y0 + (y1 - y0) * k / (n - 1)); }
    if (sides.includes('L')) for (let k = 0; k < n; k++) add(x0 + (x1 - x0) * k / (n - 1), y1);
    if (sides.includes('R')) for (let k = 0; k < n - (sides.includes('L') ? 1 : 0); k++) add(x1, y0 + (y1 - y0) * k / (n - 1));
    const e = { k: 'colunata', pts: pts.map(([x, y]) => [at(L, x), at(L, y)]), r: r * TILE, y0: px(z0), y1: px(z1), cor: ['col0', 'col1'] };
    if (flared) e.papiro = { h: px(1.6), r: r * 2.1 * TILE, cor: 'acc2' };
    return e;
  }
  // a longhouse (arch.js longhouse): its footing of 1.2 px, its walls of planks to H px, the door — dw tiles each side of the
  // middle, 0.08 the god's —, the red band under the eaves, two little windows high on the front and one a side, the turf rh px
  // over all with its dragon; big: the three painted shields on its front — its elements, its top (px) and its door
  function longhouseF(L, lx, ly, H, rh, big, z0, dw) {
    const x0 = -lx, x1 = lx, y0 = -ly, y1 = ly; const zw = Math.max(1.2, z0 || 0); const d1 = Math.min(H, 7.5); const hw = dw || 0.08;
    const els = [plinthF(L, x0, y0, x1, y1, 1.2, 0.04), wallsF(L, x0, y0, x1, y1, zw, H, 0, { tabuas: 10 }), doorF(L, y1, -hw, hw, zw, d1), faixaF(L, x0, y0, x1, y1, H - 0.8, H, 'trim'),
      winsF(L, 'frente', y1, x0 + 0.12, x0 + 0.2, H - 4, 2, 0), winsF(L, 'frente', y1, x1 - 0.2, x1 - 0.12, H - 4, 2, 0), ...winsLR(L, x0, x1, -0.05, 0.05, H - 4, 2, 0)];
    if (big) for (const [x, cor] of [[x0 + 0.2, '#a23c2a'], [0.2 * lx, '#d8b25a'], [x1 - 0.25, '#3f6fb0']]) els.push({ k: 'disco', na: 'frente', u: at(L, x), v: at(L, y1), y: px(H * 0.55), r: 0.42, cor, olho: '#d8c89a' });
    const rf = roofF(L, 'nordico', x0, y0, x1, y1, H, { rh, ov: 0.1 });
    return { els: els.concat(rf.els), z: rf.z, door: { u: L / 2, w: 2 * hw * TILE, y0: px(zw), y1: px(d1) } };
  }
  // a hall (arch.js hall): its plinth (2 px), its walls to H px — the Egyptian's battered —, the door in the middle of the front,
  // its windows halfway up, the people's roof — the Egyptian's and the Aztec's flat behind its parapet, their two painted bands
  // under it —; the Norse's a longhouse on the plinth (its door o.doorW tiles each side) — its elements, its top (px) and its
  // door
  function hallF(L, st, o) {
    const { x0, y0, x1, y1, H } = o; const z0 = o.plinth || 2; const els = [plinthF(L, x0, y0, x1, y1, z0)];
    if (st === 'nordico') { const lh = longhouseF(L, (x1 - x0) / 2, (y1 - y0) / 2, H * 0.6, H * 0.75, o.big, z0, o.doorW); return { els: els.concat(lh.els), z: lh.z, door: lh.door }; }
    const ins = st === 'egipcio' ? 0.04 : 0; const xm = (x0 + x1) / 2, d1 = z0 + Math.min(10, (H - z0) * 0.7), zw = z0 + (H - z0) * 0.5;
    const ra = ins * (zw + 1.5 - z0) / (H - z0); // (a window on a battered face: where the face is at its middle)
    els.push(wallsF(L, x0, y0, x1, y1, z0, H, ins), doorF(L, y1, xm - 0.12, xm + 0.12, z0, d1), winsF(L, 'frente', y1 - ra, x0, x1, zw, 3, Math.max(1, Math.round((x1 - x0) * 2))), ...winsLR(L, x0 + ra, x1 - ra, y0, y1, zw, 3, Math.max(1, Math.round((y1 - y0) * 2))));
    let rf;
    if (st === 'egipcio' || st === 'asteca') { els.push(faixaF(L, x0, y0, x1, y1, H - 2.2, H - 0.8, 'trim'), faixaF(L, x0, y0, x1, y1, H - 3.4, H - 2.4, 'trim2')); rf = roofF(L, st, x0, y0, x1, y1, H, { par: 1.4 }); }
    else rf = roofF(L, st, x0, y0, x1, y1, H, { alongY: o.alongY, rh: o.rh });
    return { els: els.concat(rf.els), z: rf.z, door: { u: at(L, xm), w: 0.24 * TILE, y0: px(z0), y1: px(d1) } };
  }
  // a small house of the people (cityart.js house): its footing (1.5 px), its walls to H px — the Egyptian's battered 0.03, the
  // Norse's of planks —, the door (o.door false: none) and the windows a little over halfway up; the Egyptian's and the
  // Aztec's two bands under the flat roof and its parapet of 1.2 px, the Norse's turf, the others' roof of their palette — its
  // elements, its top (px) and its door
  function casaF(L, st, x0, y0, x1, y1, H, o) {
    o = o || {}; const z0 = o.plinth !== undefined ? o.plinth : 1.5; const ins = st === 'egipcio' ? 0.03 : 0;
    const els = [plinthF(L, x0, y0, x1, y1, z0, 0.04), wallsF(L, x0, y0, x1, y1, z0, H, ins, st === 'nordico' ? { tabuas: 8 } : undefined)];
    let door = null;
    if (o.door !== false) { const dx = o.doorX !== undefined ? o.doorX : (x0 + x1) / 2; const d1 = z0 + Math.min(8, (H - z0) * 0.72); els.push(doorF(L, y1, dx - 0.1, dx + 0.1, z0, d1)); door = { u: at(L, dx), w: 0.2 * TILE, y0: px(z0), y1: px(d1) }; }
    if (o.win !== false) { const zw = z0 + (H - z0) * 0.52; els.push(winsF(L, 'frente', y1, x0, x1, zw, 2.6, Math.max(1, Math.round((x1 - x0) * 1.6))), ...winsLR(L, x0, x1, y0, y1, zw, 2.6, Math.max(1, Math.round((y1 - y0) * 1.6)))); }
    let rf;
    if (st === 'egipcio' || st === 'asteca') { els.push(faixaF(L, x0, y0, x1, y1, H - 2, H - 0.9, 'trim'), faixaF(L, x0, y0, x1, y1, H - 3, H - 2.2, 'trim2')); rf = roofF(L, st, x0, y0, x1, y1, H, { par: 1.2 }); }
    else if (st === 'nordico') rf = roofF(L, st, x0, y0, x1, y1, H, { kind: 'turf', rh: o.rh, alongY: o.alongY });
    else rf = roofF(L, st, x0, y0, x1, y1, H, { rh: o.rh, alongY: o.alongY, kind: o.kind });
    return { els: els.concat(rf.els), z: rf.z, door };
  }

  // (D-084, the seats one sits on — the Colosseum's and the arena's: four balconies round the arena, the maeniana, each a tread
  // as deep from the arena's wall to the drum's inner face, their floors evenly up from the god's lowest ring (0.4 of its
  // height) to a step under its rim, the parapet 0.9 m high at the edge of each over the drop; the god's six rings were 70°)
  const balcoes = (R, t, H, fundo) => { const tr = (R - t - fundo) / 4, y0 = H * 0.4, st = (H - y0) / 4; const a = [[R, H]]; for (let k = 3; k >= 0; k--) a.push([fundo + (k + 1) * tr, y0 + k * st]); return a; };
  // the Colosseum (arch.js maravilha, romano): the god's bowl of r 1.45 tiles and 42 px — three tiers of arches round it, its
  // seats inside (D-084), the arena at its heart (the god's floor, 0.3 of the height up: under it, inside the drum, the
  // arena's undercroft), and the masts of the awning (ten on the half the god shows: twenty round). The arches of the god's
  // tiers stand from 0.175 to 0.725 of a tier (its zc ± ah/2); the ground tier's reach the ground: they are the ways in
  def('maravilha', 'romano', L => {
    const R = 1.45 * TILE, H = px(42), c = [L / 2, L / 2]; const rings = balcoes(R, R * 0.1, H, R * 0.4);
    return { els: [
      { k: 'tambor', c, r: R, t: R * 0.1, y0: 0, y1: H, andares: 3, arcos: 24, arcoW: 0.6, arcoA: 0.175, arcoB: 0.725, cor: ['#e8d2a6', '#b89a70'], escuro: '#2a1e18', mat: 'ashlar' },
      { k: 'cavea', c, aneis: rings, fundo: R * 0.4, cor: '#c8b8a0', parapeito: 0.9, muro: '#b8a888' },
      { k: 'arena', c, r: R * 0.4, y: px(42 * 0.3), cor: '#e8d8a8', muro: rings[rings.length - 1][1] },
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
  // the arena (romano): the god's bowl of r 1.35 tiles and 26 px, two tiers of arches round it, its seats inside (D-084: the
  // balconies, rows of 0.675 m), the arena at its heart 0.3 of its height up — the Colosseum's own, smaller, no awning
  def('teatro', 'romano', L => {
    const R = 1.35 * TILE, H = px(26), c = [L / 2, L / 2]; const rings = balcoes(R, R * 0.1, H, R * 0.4);
    return { els: [
      { k: 'tambor', c, r: R, t: R * 0.1, y0: 0, y1: H, andares: 2, arcos: 24, arcoW: 0.6, arcoA: 0.175, arcoB: 0.725, cor: ['#e0c79a', '#b09268'], escuro: '#2a1e18', mat: 'ashlar' },
      { k: 'cavea', c, aneis: rings, fundo: R * 0.4, cor: '#c8b8a0', parapeito: 0.9, muro: '#b8a888' },
      { k: 'arena', c, r: R * 0.4, y: px(26 * 0.3), cor: '#e8d8a8', muro: rings[rings.length - 1][1] },
    ], door: { u: L / 2, w: 0.9, y0: 0, y1: H / 2 * 0.725 } };
  });
  // the Greek (and classical) theatre (D-084: the slope of a real one): on its paved ground, the orchestra — a round of 2 m,
  // its middle 1 m before the lot's — and round its back half the rows of seats as many as the lot holds, 0.70 m deep and
  // 0.40 m up each, a gangway of 0.4 m between the orchestra and the first (six rows from 2.4 m to 6.6 m: the four inner on
  // the whole half round, the outer ones cut where they would leave the lot, 0.3 m from its sides), their back wall and
  // their ends standing on the ground; the stage building along the front (the skene of 1.8 × 0.3 tiles and 9 px; the
  // Greek's painted band at its top) with its six columns before it, 7 px
  const ROW = 0.7, RISE = 0.4;
  const theatre = grego => L => {
    const c = [L / 2, L / 2 + 1.0], ri = 2.4, side = L / 2 - 0.3; const rows = Math.floor((c[1] - 0.3 - ri) / ROW + 1e-6);
    const ring = (k0, k1) => { const a = []; for (let k = k1; k >= k0; k--) a.push([ri + (k + 1) * ROW, RISE * (k + 1)]); return a; };
    const arc = r => (r <= side ? [Math.PI, 2 * Math.PI] : [Math.PI + Math.acos(side / r), 2 * Math.PI - Math.acos(side / r)]);
    const els = [{ k: 'bloco', r: rect(L, -1.4, -1.4, 1.4, 1.4), y0: 0, y1: px(0.2), cor: ['#a8a08c', '#988f7c', '#b8b09c'], mat: 'slab' }];
    const whole = Math.min(rows, Math.floor((side - ri) / ROW + 1e-6));
    els.push({ k: 'cavea', c, aneis: ring(0, whole - 1), fundo: ri, cor: '#d8d0bc', arco: [Math.PI, 2 * Math.PI], fecho: 'wl' });
    for (let k = whole; k < rows; k++) els.push({ k: 'cavea', c, aneis: ring(k, k), fundo: ri + k * ROW, cor: '#d8d0bc', arco: arc(ri + (k + 1) * ROW), fecho: 'wl' });
    els.push({ k: 'arena', c, r: 2.0, y: px(0.3), cor: '#e8dcc0' });
    els.push({ k: 'bloco', r: rect(L, -0.9, 0.85, 0.9, 1.15), y0: 0, y1: px(9), cor: ['wl', 'wr', 'top'] });
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

  // ------------------------------ the library (arch.js biblioteca) ------------------------------
  // (the treads of a plinth's front, from its top at z px down to the ground in n − 1 treads of 0.075 tiles — 0.3 m: the body's
  // flight, no riser over 0.3 m, D-093 —, the plinth's front at y tiles, from x0 to x1; the first tread's back at y − 0.075·(n − 1))
  const treadsF = (L, x0, x1, y, z, n) => { const out = []; for (let k = 1; k < n; k++) out.push(blocoF(L, x0, y - 0.075 * (n - k), x1, y - 0.075 * (n - k - 1), 0, z * (n - k) / n, BASE, { degrau: 1 })); return out; };
  // the classical one (and the Greek's, the Roman's): its plinth of 0.85 tiles and 2.5 px — its front the two treads down to the
  // street, three risers of 0.27 m (D-093: the body climbs it) —, the hall of 1.45 × 1.1 tiles to 17 px with the door behind the
  // portico and two windows a side, the portico of five columns along the front, the entablature to 19 px and over all the roof
  // — the gable along the way in, 9 px, with the library's plaque on its pediment; the Roman's the hip of its palette. Its body
  // (D-093: what the plan raises its shell on): the hall's walls, the portico on the plinth before them, the plinth, the treads
  const library = st => L => {
    const walls = wallsF(L, -0.7, -0.8, 0.75, 0.3, 2.5, 17), cols = colsF(L, -0.7, 0.3, 0.75, 0.68, 2.5, 17, 5, 0.04, 'L');
    const base = blocoF(L, -0.9, -0.9, 0.9, 0.75, 0, 2.5, BASE), steps = treadsF(L, -0.9, 0.9, 0.9, 2.5, 3);
    const els = [base, ...steps, walls, ...winsLR(L, -0.7, 0.75, -0.8, 0.3, 9, 5, 2), doorF(L, 0.3, -0.12, 0.12, 2.5, 11, '#3a2e24'), cols, blocoF(L, -0.75, -0.85, 0.8, 0.72, 17, 19, COL)];
    if (st === 'romano') els.push(...roofF(L, st, -0.75, -0.85, 0.8, 0.72, 19, { kind: 'hip' }).els);
    else els.push({ k: 'telhado', r: rect(L, -0.75, -0.85, 0.8, 0.72), y0: px(19), y1: px(28), ao: 'v', ov: 0.04 * TILE, cor: ['roof0', 'roof1', 'gable', 'roof2'] },
      { k: 'placa', v: at(L, 0.72 + 0.04), u: L / 2, w: 5 / 16 * TILE, y0: px(20.5), y1: px(23.5), cor: '#e8d8a8' });
    return { els, door: { u: L / 2, w: 0.24 * TILE, y0: px(2.5), y1: px(11) }, body: { walls, porch: { r: rect(L, -0.7, 0.3, 0.75, 0.75), y1: px(17), cols }, base, steps } };
  };
  def('biblioteca', 'classico', library('classico')); def('biblioteca', 'grego', library('grego')); def('biblioteca', 'romano', library('romano'));
  // the Egyptian's and the Aztec's: the hall of 1.6 × 1.15 tiles to 16 px (arch.js hall: its plinth, its door, its windows, the
  // flat roof behind its parapet and the two painted bands), and before it the portico — five columns, the Egyptian's with the
  // papyrus capitals — under its architrave of 12.5–14 px, on a floor of the plinth's stone (the god's columns stood on air),
  // the two treads down from it to the street (three risers of 0.22 m: D-093)
  const libraryHall = st => L => {
    const h = hallF(L, st, { x0: -0.8, y0: -0.8, x1: 0.8, y1: 0.35, H: 16 });
    const floor = plinthF(L, -0.8, 0.35, 0.8, 0.66, 2), cols = colsF(L, -0.7, 0.35, 0.7, 0.62, 2, 12.5, 5, 0.045, 'L', st === 'egipcio'), steps = treadsF(L, -0.85, 0.85, 0.86, 2, 3);
    const walls = h.els.find(e => e.mat === 'parede'), base = { k: 'bloco', r: rect(L, -0.85, -0.85, 0.85, 0.71), y0: 0, y1: px(2) };
    return { els: h.els.concat([floor, ...steps, cols, blocoF(L, -0.8, 0.35, 0.8, 0.66, 12.5, 14, ['trim', 'trim', 'top'])]), door: h.door,
      body: { walls, porch: { r: rect(L, -0.8, 0.35, 0.8, 0.71), y1: px(12.5), cols }, base, steps } };
  };
  def('biblioteca', 'egipcio', libraryHall('egipcio')); def('biblioteca', 'asteca', libraryHall('asteca'));
  // the Norse's: a longhouse of 1.6 × 1 tiles on the hall's plinth (its walls to 9.6 px, the turf 12 px over them; its door of
  // 0.8 m — the body's: D-093 —, the god's was 0.64), the flight of two treads down from its door, 1.6 m wide, and before its
  // front the two carved posts of 12 px with their dragons
  def('biblioteca', 'nordico', L => {
    const h = hallF(L, 'nordico', { x0: -0.8, y0: -0.5, x1: 0.8, y1: 0.5, H: 16, doorW: 0.1 }); const steps = treadsF(L, -0.2, 0.2, 0.7, 2, 3);
    const els = h.els.concat(steps); const walls = els.find(e => e.mat === 'parede');
    for (const x of [-0.6, 0.6]) els.push(blocoF(L, x - 0.04, 0.72, x + 0.04, 0.8, 0, 12, ['#6a4a30', '#4e3620', '#7a5a3a'], { mat: 'beam' }), { k: 'dragao', p: [at(L, x), at(L, 0.76), px(12)], dir: x > 0 ? 1 : -1, cor: '#3a2616' });
    return { els, door: h.door, body: { walls, base: els[0], steps } };
  });

  // ------------------------------ the temple (arch.js temple) ------------------------------
  // (the body's flight cut into the front of a base — D-093: no riser over 0.30 m —: n risers from the street at v0 tiles up
  // to the base's top at z px, its treads d tiles deep from −s to s across; the last riser onto the base itself)
  const flightF = (L, s, v0, z, n, d) => { const out = []; for (let j = 0; j < n - 1; j++) out.push(blocoF(L, -s, v0 - d * (j + 1), s, v0 - d * j, 0, z * (j + 1) / n, BASE, { degrau: 1 })); return out; };
  // (a block of a base, its half side q tiles, with the flight's slot cut out of its front — from −s to s, from vS forward: the
  // three pieces round it)
  const slottedF = (L, q, vS, s, z0, z1) => [blocoF(L, -q, -q, q, vS, z0, z1, BASE), blocoF(L, -q, vS, -s, q, z0, z1, BASE), blocoF(L, s, vS, q, q, z0, z1, BASE)];
  // (the braziers at the base's front corners: a stand of stone 4 px high, its fire on it)
  const templeFires = L => [-0.9, 0.9].flatMap(bx => [blocoF(L, bx - 0.05, 0.85, bx + 0.05, 0.95, 0, 4, ['#8a7a5a', '#6a5a40', '#9a8a6a']), { k: 'braseiro', p: [at(L, bx), at(L, 0.9), px(4)], r: 0.16 }]);
  // the Greek's (and the classical people's): the crepidoma — three steps of 1.4 px, each 0.07 tiles in, the flight of five
  // risers on the axis —, the peristyle of 0.0435 tiles columns round the cella (six on the front and the back, five on the
  // sides; between two of the front's 0.80 m at least, where the body passes: the plan's rule for a way through) to 17 px over
  // the stylobate, the cella of 0.95 tiles with its door of 0.3 × 10 px, the entablature of 2.5 px with
  // its band, the pediment roof along the way in to 9.5 px over it, the gilded round in the gable; the Roman's: the podium of
  // 7 px and 1.7 tiles, the flight of eight risers on the axis from the street to the porch, the four columns of the porch
  // before the cella of 1.1 × 0.9 tiles, the entablature and the roof as the Greek's
  const templeGR = st => L => {
    const ro = st === 'romano'; const els = []; let z0, walls, door, cols, steps, base, extra;
    if (!ro) {
      const s = 0.0875, vS = 0.63; for (let k = 0; k < 3; k++) els.push(...slottedF(L, 0.95 - k * 0.07, vS, s, 1.4 * k, 1.4 * (k + 1)));
      steps = flightF(L, s, 0.95, 4.2, 5, 0.08); z0 = 4.2;
      base = { r: rect(L, -0.81, -0.81, 0.81, 0.81), y1: px(4.2), degraus: [0, 1, 2].map(k => ({ r: rect(L, -0.95 + k * 0.07, -0.95 + k * 0.07, 0.95 - k * 0.07, 0.95 - k * 0.07), y1: px(1.4 * (k + 1)) })) };
      const pts = []; for (let k = 0; k < 6; k++) { const x = -0.72 + 1.44 * k / 5; pts.push([x, -0.72], [x, 0.72]); } for (let k = 1; k < 4; k++) { const y = -0.72 + 1.44 * k / 4; pts.push([-0.72, y], [0.72, y]); }
      cols = { k: 'colunata', pts: pts.map(([x, y]) => [at(L, x), at(L, y)]), r: 0.0435 * TILE, y0: px(z0), y1: px(z0 + 17), cor: ['col0', 'col1'] };
      walls = wallsF(L, -0.5, -0.5, 0.45, 0.45, z0, z0 + 17); door = doorF(L, 0.45, -0.15, 0.15, z0, z0 + 10, '#3a2e24');
      extra = { peristyle: { r: rect(L, -0.81, -0.81, 0.81, 0.81), y1: px(z0 + 17), cols } };
    } else {
      const s = 0.125, n = 8, d = 0.08125, vS = 1.0 - d * (n - 1); els.push(...slottedF(L, 0.85, vS, s, 0, 7));
      steps = flightF(L, s, 1.0, 7, n, d); z0 = 7; base = { r: rect(L, -0.85, -0.85, 0.85, 0.85), y1: px(7) };
      cols = colsF(L, -0.62, 0.3, 0.62, 0.72, z0, z0 + 17, 4, 0.05, 'L');
      walls = wallsF(L, -0.55, -0.7, 0.55, 0.2, z0, z0 + 17); door = doorF(L, 0.2, -0.15, 0.15, z0, z0 + 10, '#3a2e24');
      extra = { porch: { r: rect(L, -0.67, 0.2, 0.67, 0.85), y1: px(z0 + 17), cols } };
    }
    const H = z0 + 17, ey0 = ro ? -0.72 : -0.78, ey1 = ro ? 0.76 : 0.78;
    els.push(...steps, walls, door, cols, ...templeFires(L),
      blocoF(L, -0.78, ey0, 0.78, ey1, H, H + 2.5, COL), faixaF(L, -0.78, ey0, 0.78, ey1, H + 1, H + 2, ro ? 'acc2' : 'acc'),
      { k: 'telhado', r: rect(L, -0.78, ey0, 0.78, ey1), y0: px(H + 2.5), y1: px(H + 12), ao: 'v', ov: 0.05 * TILE, cor: ['roof0', 'roof1', 'gable', 'roof2'] },
      { k: 'disco', na: 'frente', u: L / 2, v: at(L, ey1 + 0.05), y: px(H + 6), r: 0.28, cor: ro ? 'acc' : '#f2c14e' });
    return { els, door: { u: L / 2, w: 0.3 * TILE, y0: px(z0), y1: px(z0 + 10) }, body: Object.assign({ walls, base, steps }, extra) };
  };
  def('temple', 'grego', templeGR('grego')); def('temple', 'romano', templeGR('romano'));
  def('temple', 'classico', templeGR('classico')); // (the classical people's: the Greek's, as the god draws it now)
  // (the treads of a flight set into a stepped pyramid — Build3D's escada: no riser over 0.26 m —, from its foot: [{ r, y1 }])
  const stairTreads = e => { const run = e.a[1] - e.b[1], rise = e.b[2] - e.a[2], n = Math.max(2, Math.ceil(rise / 0.26)), u = e.a[0], hw = e.w / 2; const out = [];
    for (let k = 0; k < n; k++) out.push({ r: [u - hw, e.a[1] - run * (k + 1) / n, u + hw, e.a[1] - run * k / n], y1: e.a[2] + rise * (k + 1) / n }); return out; };
  // the Aztec's: the pyramid of four levels of 6.5 px, from half side 0.95 to 0.55 tiles, the stair up its front set into it
  // (0.2 tiles each side of the middle, its ramps of 0.06), the shrine on its top — 0.84 × 0.87 tiles, its back on the back
  // edge of the top (inside 2.76 × 2.88 m: the image, the priest's place, the altar with the way past it, the way in from the
  // door — P4's plan, D-093 —; 0.92 m before it on the top), 9 px, its band at the top, its door of 0.24 tiles and 6 px to the
  // front —, the crest of 8 px on its roof, the two braziers before the shrine's sides where the priests light them
  def('temple', 'asteca', L => {
    const n = 4, h = px(6.5), H = n * h, e0 = 0.95 * TILE, e1 = 0.55 * TILE; const niveis = [];
    for (let k = 0; k < n; k++) niveis.push([e0 - (e0 - e1) * k / (n - 1), k * h, (k + 1) * h]);
    const escada = { k: 'escada', a: [L / 2, at(L, 0.97), 0], b: [L / 2, at(L, 0.55), H], w: 0.4 * TILE, cor: 'wl', clara: 1.08, alfarda: 0.06 * TILE };
    const z = 26, walls = blocoF(L, -0.42, -0.55, 0.42, 0.32, z, z + 9, WALL, { mat: 'parede' });
    const els = [{ k: 'escalonada', c: [L / 2, L / 2], niveis, cor: WALL, friso: px(0.8), mat: 'stucco' }, escada, walls, faixaF(L, -0.42, -0.55, 0.42, 0.32, z + 6.5, z + 9, 'trim'),
      doorF(L, 0.32, -0.12, 0.12, z, z + 6, '#2a1c14'), blocoF(L, -0.3, -0.08, 0.3, 0.02, z + 9, z + 17, ['trim', 'trim', 'trim'], { crista: true })];
    for (const bx of [-0.47, 0.47]) els.push(blocoF(L, bx - 0.05, 0.37, bx + 0.05, 0.47, z, z + 2.5, ['#6a5a50', '#4a3e36', '#7a6a60']), { k: 'braseiro', p: [at(L, bx), at(L, 0.42), px(z + 2.5)], r: 0.15, uso: 'acender' });
    return { els, door: { u: L / 2, w: 0.24 * TILE, y0: px(z), y1: px(z + 6) },
      body: { walls, base: { r: rect(L, -0.95, -0.95, 0.95, 0.95), y1: H, degraus: niveis.map(([s, , yb]) => ({ r: [L / 2 - s, L / 2 - s, L / 2 + s, L / 2 + s], y1: yb })) }, steps: stairTreads(escada) } };
  });
  // the Norse's stave church: its base of 1.5 px and 0.75 tiles; the gallery round the nave under the skirt roof — from 7 px
  // at its edge up to the nave's walls at 11 px —, its staves at the edge (0.096 m, a metre apart: 0.81 m between two, where
  // the body passes — the god does not draw them), the portal at its front where the god paints the
  // door (1.5–7 px); the nave of 0.55 tiles, its walls to 12 px, its door under the gallery, the roof along the width to 22 px
  // with its dragon; the upper tier of 0.32 tiles from 18 to 27 px with its windows, its roof along the way in to 35 px with
  // its dragon; the tower of 0.12 tiles to 38 px and its spire to 50; the fire before it
  def('temple', 'nordico', L => {
    const SHG = ['shingle0', 'shingle1', 'wl', 'shingle2']; const walls = blocoF(L, -0.55, -0.55, 0.55, 0.55, 1.5, 12, WALL, { mat: 'parede', tabuas: 10 });
    const pts = []; const m = 6; for (let k = 0; k <= m; k++) { const a = -0.75 + 1.5 * k / m; pts.push([a, -0.75], [a, 0.75]); if (k && k < m) pts.push([-0.75, a], [0.75, a]); }
    const staves = { k: 'colunata', pts: pts.filter(([a, b]) => !(b > 0.7 && Math.abs(a) < 0.2)).map(([a, b]) => [at(L, a), at(L, b)]), r: 0.024 * TILE, y0: px(1.5), y1: px(7), cor: ['wr', 'wl'], mat: 'beam' };
    const skirt = [[[-0.75, 0.75], [0.75, 0.75], [0.55, 0.55], [-0.55, 0.55], 'shingle0'], [[0.75, 0.75], [0.75, -0.75], [0.55, -0.55], [0.55, 0.55], 'shingle1'],
      [[0.75, -0.75], [-0.75, -0.75], [-0.55, -0.55], [0.55, -0.55], 'shingle0'], [[-0.75, -0.75], [-0.75, 0.75], [-0.55, 0.55], [-0.55, -0.55], 'shingle1']]
      .map(([a, b, c, d, cor]) => ({ k: 'pano', p: [[at(L, a[0]), at(L, a[1]), px(7)], [at(L, b[0]), at(L, b[1]), px(7)], [at(L, c[0]), at(L, c[1]), px(11)], [at(L, d[0]), at(L, d[1]), px(11)]], cor, mat: 'shingle' }));
    const steps = treadsF(L, -0.2, 0.2, 0.83, 1.5, 2);
    const els = [blocoF(L, -0.75, -0.75, 0.75, 0.75, 0, 1.5, BASE), ...steps, walls, doorF(L, 0.55, -0.1, 0.1, 1.5, 7, 'door'), staves, ...skirt,
      { k: 'porta', na: 'frente', v: at(L, 0.75), u: L / 2, w: 0.2 * TILE, y0: px(1.5), y1: px(7), cor: 'door' },
      { k: 'telhado', r: rect(L, -0.55, -0.55, 0.55, 0.55), y0: px(12), y1: px(22), ao: 'u', ov: 0.08 * TILE, cor: SHG, mat: 'shingle' }, { k: 'dragao', p: [at(L, 0.63), L / 2, px(22)], dir: 1, cor: '#3a2616' },
      blocoF(L, -0.32, -0.32, 0.32, 0.32, 18, 27, WALL, { tabuas: 8 }), winsF(L, 'frente', 0.32, -0.08, 0.04, 21, 3, 0), winsF(L, 'direita', 0.32, -0.04, 0.08, 21, 3, 0),
      { k: 'telhado', r: rect(L, -0.32, -0.32, 0.32, 0.32), y0: px(27), y1: px(35), ao: 'v', ov: 0.06 * TILE, cor: SHG, mat: 'shingle' }, { k: 'dragao', p: [L / 2, at(L, 0.38), px(35)], dir: 1, ao: 'v', cor: '#3a2616' },
      blocoF(L, -0.12, -0.12, 0.12, 0.12, 32, 38, ['wl', 'wr', 'shingle2'], { tabuas: 4 }), { k: 'piramide', c: [L / 2, L / 2], e: 0.14 * TILE, y0: px(38), y1: px(50), cor: ['shingle0', 'shingle1'], mat: 'shingle' },
      { k: 'braseiro', p: [at(L, -0.9), at(L, 0.9), 0], r: 0.2, uso: 'acender' }];
    return { els, door: { u: L / 2, w: 0.2 * TILE, y0: px(1.5), y1: px(7) },
      body: { walls, porta: { u: L / 2, w: 0.2 * TILE, y0: px(1.5), y1: px(7) }, base: { r: rect(L, -0.75, -0.75, 0.75, 0.75), y1: px(1.5) }, steps, peristyle: { r: rect(L, -0.75, -0.75, 0.75, 0.75), y1: px(7), cols: staves } } };
  });
  // the Egyptian's: the hall at the back, 15 px with its band of 12–13.5 px, its top flat; its door to the court, 0.2 tiles
  // and 10 px (behind the pylon: the god does not show it); the row of six papyrus columns of 13 px across the court, symmetric
  // round the axis of the gate and the door — the gap in the middle 0.95 m clear: the body's way from the gate to the door
  // (P4's plan: D-093) —, the court 0.8 m deep between the hall and them; the
  // pylon — two towers of 30 px, battered 0.1 tiles, their bands at the top, the flags of 36 px before them —, the gate's
  // block of 20 px between them with its band, the passage through it 0.2 tiles wide and 13 px high under its lintel, the
  // dark gate the god paints on its face; the two braziers before the pylon (the god's fires), where one lights them
  def('temple', 'egipcio', L => {
    const walls = blocoF(L, -0.7, -0.9, 0.85, 0.3, 0, 15, WALL, { mat: 'parede' }); const cols = colsF(L, -0.84375, 0.3, 0.84375, 0.55, 0, 13, 6, 0.05, 'L', true);
    const els = [walls, faixaF(L, -0.7, -0.9, 0.85, 0.3, 12, 13.5, 'trim'), doorF(L, 0.3, -0.1, 0.1, 0, 10, '#2a2016'), cols];
    const torres = [];
    for (const [a, b] of [[-0.92, -0.18], [0.18, 0.92]]) {
      torres.push(rect(L, a, 0.55, b, 0.92));
      els.push({ k: 'talude', r: rect(L, a, 0.55, b, 0.92), r1: rect(L, a + 0.1, 0.65, b - 0.1, 0.82), y0: 0, y1: px(30), cor: WALL }, faixaF(L, a + 0.1, 0.65, b - 0.1, 0.82, 28, 30, 'trim'),
        { k: 'bandeira', p: [at(L, (a + b) / 2), at(L, 0.93), 0], h: px(36), cor: 'trim2' });
    }
    els.push(blocoF(L, -0.18, 0.62, -0.1, 0.86, 0, 20, WALL), blocoF(L, 0.1, 0.62, 0.18, 0.86, 0, 20, WALL), blocoF(L, -0.1, 0.62, 0.1, 0.86, 13, 20, WALL), faixaF(L, -0.18, 0.62, 0.18, 0.86, 18, 20, 'trim'),
      { k: 'porta', na: 'frente', v: at(L, 0.86), u: L / 2, w: 0.2 * TILE, y0: 0, y1: px(13), cor: '#2a2016', portao: true });
    for (const x of [-0.6, 0.6]) els.push({ k: 'braseiro', p: [at(L, x), at(L, 0.96), 0], r: 0.2, uso: 'acender' });
    return { els, door: { u: L / 2, w: 0.2 * TILE, y0: 0, y1: px(13) }, body: { walls, porta: { u: L / 2, w: 0.2 * TILE, y0: 0, y1: px(10) },
      court: { r: rect(L, -0.92, 0.3, 0.92, 0.55), cols }, gate: { r: rect(L, -0.1, 0.62, 0.1, 0.86), u: L / 2, w: 0.2 * TILE, y0: 0, y1: px(13), v: at(L, 0.86) }, towers: torres } };
  });

  // ------------------------------ the administration (cityart.js administracao) ------------------------------
  // the classical one: its base of 0.95 tiles and 2 px, the hall of 1.6 × 1.1 tiles to 17 px with three windows a side, the
  // six columns along its front, the entablature to 18.6 px, the roof along the front 7.4 px over it, the blue flag at its
  // front corner (no door: the god draws none)
  def('administracao', 'classico', L => ({ els: [
    blocoF(L, -0.95, -0.95, 0.95, 0.95, 0, 2, BASE), wallsF(L, -0.8, -0.8, 0.8, 0.3, 2, 17), ...winsLR(L, -0.8, 0.8, -0.7, 0.2, 10, 3.2, 3),
    colsF(L, -0.8, 0.45, 0.8, 0.75, 2, 17, 6, 0.045, 'L'), blocoF(L, -0.84, -0.84, 0.84, 0.8, 17, 18.6, COL),
    { k: 'telhado', r: rect(L, -0.84, -0.84, 0.84, 0.8), y0: px(18.6), y1: px(26), ao: 'u', ov: 0.04 * TILE, cor: ['roof0', 'roof1', 'gable', 'roof2'] },
    { k: 'bandeira', p: [at(L, 0.75), at(L, 0.9), px(2)], h: px(14), cor: '#3f6fb0' }, // (its cloth of 1.25 m across inside the lot)
  ] }));
  // the Greek's bouleuterion: its two steps of 0.95 tiles and 1.3 px, the hall of 1.6 × 1.05 tiles to 18 px with three windows a
  // side, the six columns along its front, the entablature with its painted band to 20 px, the roof along the front to 28 px
  def('administracao', 'grego', L => ({ els: [
    ...degraus(L, 0.95, 2, 1.3, 0.06), wallsF(L, -0.8, -0.8, 0.8, 0.25, 2.6, 18), ...winsLR(L, -0.8, 0.8, -0.7, 0.2, 11, 3, 3),
    colsF(L, -0.8, 0.4, 0.8, 0.72, 2.6, 18, 6, 0.04, 'L'), blocoF(L, -0.84, -0.84, 0.84, 0.76, 18, 20, COL), faixaF(L, -0.84, -0.84, 0.84, 0.76, 18.6, 19.4, 'acc'),
    { k: 'telhado', r: rect(L, -0.84, -0.84, 0.84, 0.76), y0: px(20), y1: px(28), ao: 'u', ov: 0.04 * TILE, cor: ['roof0', 'roof1', 'gable', 'roof2'] },
  ] }));
  // the Roman's basilica: its base of 0.95 tiles and 2.5 px, the nave of 1.7 × 1.1 tiles to 16 px with three windows a side and
  // on its front, the seven columns before it, the entablature to 17.6 px, the clerestory over the middle — 1.1 × 0.8 tiles to
  // 23 px, four windows on its front — under its roof of 7 px, the red flag at the front corner
  def('administracao', 'romano', L => ({ els: [
    blocoF(L, -0.95, -0.95, 0.95, 0.95, 0, 2.5, BASE), wallsF(L, -0.85, -0.8, 0.85, 0.3, 2.5, 16), ...winsLR(L, -0.85, 0.85, -0.7, 0.2, 9, 3.5, 3), winsF(L, 'frente', 0.3, -0.8, 0.85, 9, 3.5, 3),
    colsF(L, -0.85, 0.45, 0.85, 0.78, 2.5, 16, 7, 0.045, 'L'), blocoF(L, -0.88, -0.83, 0.88, 0.82, 16, 17.6, COL),
    wallsF(L, -0.55, -0.6, 0.55, 0.2, 17.6, 23), winsF(L, 'frente', 0.2, -0.55, 0.55, 19, 2.6, 4), ...roofF(L, 'romano', -0.55, -0.6, 0.55, 0.2, 23, { kind: 'gable', rh: 7 }).els,
    { k: 'bandeira', p: [at(L, 0.75), at(L, 0.9), px(2.5)], h: px(14), cor: '#8e2f2f' },
  ] }));
  // the Egyptian's house of the vizier: the house of 1.7 × 1.1 tiles to 14 px (cityart's: no door of its own), and before it the
  // two pylons of 0.5 × 0.45 tiles to 20 px, their painted band and their reliefs, the gate between them to 11 px, the green
  // flags on their poles before them (the god's were set on the pylons' top: their poles stand on the ground now)
  def('administracao', 'egipcio', L => {
    const h = casaF(L, 'egipcio', -0.85, -0.85, 0.85, 0.25, 14, { door: false }); const els = h.els.slice();
    for (const x of [-0.7, 0.2]) els.push(blocoF(L, x, 0.3, x + 0.5, 0.75, 0, 20), faixaF(L, x, 0.3, x + 0.5, 0.75, 17, 18.4, 'trim'), { k: 'placa', v: at(L, 0.75), u: at(L, x + 0.25), w: 0.26 * TILE, y0: px(6), y1: px(14), cor: '#a7bb9a' });
    els.push(doorF(L, 0.75, -0.2, 0.2, 0, 11), ...[-0.6, 0.6].map(x => ({ k: 'bandeira', p: [at(L, x), at(L, 0.8), 0], h: px(30), cor: '#2f8f8a' })));
    return { els, door: { u: L / 2, w: 0.4 * TILE, y0: 0, y1: px(11) } };
  });
  // the Aztec's tecpan: its platform of 0.95 tiles and 5 px with the painted band and the steps up its front, the house of 1.6 ×
  // 1.3 tiles to 18 px on it (cityart's, its door and its windows, its two bands and its parapet), the seven merlons along its
  // front
  def('administracao', 'asteca', L => {
    const els = [blocoF(L, -0.95, -0.95, 0.95, 0.95, 0, 5, BASE), faixaF(L, -0.95, -0.95, 0.95, 0.95, 3.2, 4.2, 'trim'),
      { k: 'escada', a: [L / 2, at(L, 1.06), 0], b: [L / 2, at(L, 0.95), px(5)], w: 0.5 * TILE, cor: 'base2', clara: 1.05 }];
    const h = casaF(L, 'asteca', -0.8, -0.8, 0.8, 0.5, 18, { plinth: 5 }); els.push(...h.els);
    for (let k = 0; k < 7; k++) { const x = -0.78 + k * 0.26; els.push(blocoF(L, x, 0.46, x + 0.1, 0.52, 18.6, 21, ['wl', 'wr', 'wl'])); }
    return { els, door: h.door };
  });
  // the Norse's thing hall: the house of 1.8 × 1.1 tiles to 11 px under its turf of 15 px, the two carved posts before it with
  // their red heads, and the rune stone of 3.6 m with its red serpent at the front corner
  def('administracao', 'nordico', L => {
    const h = casaF(L, 'nordico', -0.9, -0.75, 0.9, 0.35, 11, { rh: 15 }); const els = h.els.slice();
    for (const x of [-0.6, 0.6]) els.push(blocoF(L, x - 0.05, 0.42, x + 0.05, 0.52, 0, 12, ['#6a4a30', '#4e3620', '#7a5a3a'], { mat: 'beam' }), { k: 'bola', c: [at(L, x), at(L, 0.47), px(13)], r: 0.23, cor: '#a23c2a' });
    els.push({ k: 'pedra', c: [at(L, 0.6), at(L, 0.8)], e: 2.2 / 32 * TILE, e1: 1.8 / 32 * TILE, y0: 0, y1: px(11), cai: [0, 0], cor: ['#8e877b', '#7e7870'], cobra: '#a23c2a' });
    return { els, door: h.door };
  });

  // ------------------------------ the tax office (cityart.js coletoria) ------------------------------
  // the strongroom: its base of 0.88 tiles and 2 px, the walls of stone 0.76 tiles to 17 px, the door banded twice with iron, the
  // barred window high on the right, the people's roof — a hip of 8 px; the Egyptian's and the Aztec's flat behind a parapet
  // of 1.6 px; the Norse's turf —, the sign with its coin at the front corner, the chest by the door
  const taxes = st => L => {
    const stone = st === 'nordico' ? ['#8e877b', '#6e685e', '#a09a8e'] : ['base2', 'base0', 'base2'];
    const els = [blocoF(L, -0.44, -0.44, 0.44, 0.44, 0, 2, BASE), blocoF(L, -0.38, -0.38, 0.38, 0.38, 2, 17, stone, { mat: 'base' }),
      doorF(L, 0.38, -0.12, 0.12, 2, 10, '#3a2618'), ...[4, 7.4].map(z => ({ k: 'placa', v: at(L, 0.38), u: L / 2, w: 0.24 * TILE, y0: px(z), y1: px(z + 0.6), cor: '#5a5a62' })),
      winsF(L, 'direita', 0.38, -0.12, 0.02, 11, 2.4, 0, { grade: 3 })];
    const rf = st === 'egipcio' || st === 'asteca' ? roofF(L, st, -0.38, -0.38, 0.38, 0.38, 17, { par: 1.6 }) : st === 'nordico' ? roofF(L, st, -0.38, -0.38, 0.38, 0.38, 17, { kind: 'turf' }) : roofF(L, st, -0.38, -0.38, 0.38, 0.38, 17, { kind: 'hip', rh: 8 });
    els.push(...rf.els, { k: 'letreiro', p: [at(L, 0.38), at(L, 0.38), px(13)], cor: '#3a2a1c', moeda: '#f2c14e' },
      blocoF(L, 0.24, 0.38, 0.36, 0.48, 0, 2.4, ['#6a4a2a', '#5a3e24', '#8a6a3a'], { mat: 'plankH' }), blocoF(L, 0.24, 0.38, 0.36, 0.48, 2.4, 3.2, ['#8a6a3a', '#7a5a32', '#8a6a3a'], { mat: 'plankH' })); // (the chest against the front, in the lot)
    return { els, door: { u: L / 2, w: 0.24 * TILE, y0: px(2), y1: px(10) } };
  };
  for (const st of ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico']) def('coletoria', st, taxes(st));

  // ------------------------------ the watchtower (arch.js torre; art.js the timber one) ------------------------------
  // of stone (the Greek's, the Roman's, the Egyptian's, the Aztec's): its footing of 0.84 tiles and 3 px, the shaft of 0.68
  // tiles to 34 px, battered 0.03, a window on the front and one a side, the band under the top, the walk on top out 0.04
  // tiles, its merlons — four a side, 4 px —, the fire of the watch on it
  const towerStone = L => {
    const e = 0.34; const els = [blocoF(L, -0.42, -0.42, 0.42, 0.42, 0, 3, BASE), wallsF(L, -e, -e, e, e, 3, 34, 0.03),
      winsF(L, 'frente', e - 0.02, -0.06, 0.06, 20, 5, 0), ...winsLR(L, -(e - 0.02), e - 0.02, -0.06, 0.06, 26, 4, 0),
      faixaF(L, -e, -e, e, e, 30.5, 32, 'trim'), blocoF(L, -e - 0.04, -e - 0.04, e + 0.04, e + 0.04, 33.6, 34, ['top', 'top', 'top'])];
    for (let k = 0; k < 4; k++) { const a = -e + k * (2 * e / 3.5); const m = ['wl', 'wr', 'wl'];
      els.push(blocoF(L, a, e - 0.02, a + 0.1, e + 0.04, 34, 38, m), blocoF(L, e - 0.02, a, e + 0.04, a + 0.1, 34, 38, m), blocoF(L, a, -e - 0.04, a + 0.1, -e + 0.02, 34, 38, m), blocoF(L, -e - 0.04, a, -e + 0.02, a + 0.1, 34, 38, m)); }
    els.push({ k: 'braseiro', p: [at(L, 0.1), at(L, 0.1), px(34)], r: 0.3 });
    return { els };
  };
  // of timber (the classical one and the Norse's): its footing of stone 0.84 tiles and 3 px, the four legs leaning in from 0.32
  // to 0.25 tiles up to 31 px, the braces crossed on each side, the platform of 0.8 tiles at 30–32.5 px, its rail of planks to
  // 36 px, the four posts to 41 px and the pyramid roof of a tile from 40 to 52 px; the fire of the watch on the platform
  const towerWood = L => {
    const els = [blocoF(L, -0.42, -0.42, 0.42, 0.42, 0, 3, ['#8e8578', '#6f675c', '#a0988c'], { mat: 'stone' })];
    const legs = [[-0.32, -0.32], [0.32, -0.32], [0.32, 0.32], [-0.32, 0.32]];
    for (const [x, y] of legs) els.push({ k: 'tora', a: [at(L, x), at(L, y), px(3)], b: [at(L, x * 0.78), at(L, y * 0.78), px(31)], r: 0.13, cor: '#6e4a2c' });
    for (let s = 0; s < 4; s++) { const A = legs[s], B = legs[(s + 1) % 4];
      els.push({ k: 'tora', a: [at(L, A[0]), at(L, A[1]), px(5)], b: [at(L, B[0] * 0.84), at(L, B[1] * 0.84), px(20)], r: 0.05, cor: '#5a3a20' },
        { k: 'tora', a: [at(L, B[0]), at(L, B[1]), px(5)], b: [at(L, A[0] * 0.84), at(L, A[1] * 0.84), px(20)], r: 0.05, cor: '#5a3a20' },
        { k: 'tora', a: [at(L, A[0] * 0.86), at(L, A[1] * 0.86), px(18)], b: [at(L, B[0] * 0.8), at(L, B[1] * 0.8), px(30)], r: 0.05, cor: '#5a3a20' }); }
    els.push(blocoF(L, -0.4, -0.4, 0.4, 0.4, 30, 32.5, ['#8a6038', '#6a4628', '#a07448'], { mat: 'plankH' }));
    { const w = 0.03, c = ['#805630', '#624024', '#805630']; els.push(blocoF(L, -0.4, 0.4 - w, 0.4, 0.4, 32.5, 36, c, { mat: 'plankV' }), blocoF(L, 0.4 - w, -0.4, 0.4, 0.4, 32.5, 36, c, { mat: 'plankV' }), blocoF(L, -0.4, -0.4, 0.4, -0.4 + w, 32.5, 36, c, { mat: 'plankV' }), blocoF(L, -0.4, -0.4, -0.4 + w, 0.4, 32.5, 36, c, { mat: 'plankV' })); }
    for (const [x, y] of [[0.36, 0.36], [0.36, -0.36], [-0.36, 0.36], [-0.36, -0.36]]) els.push({ k: 'tora', a: [at(L, x), at(L, y), px(36)], b: [at(L, x), at(L, y), px(41)], r: 0.07, cor: '#5a3a20' });
    els.push({ k: 'piramide', c: [L / 2, L / 2], e: 0.5 * TILE, y0: px(40), y1: px(52), cor: ['#7a3a2a', '#5e2c20'], mat: 'shingle' }, { k: 'braseiro', p: [at(L, 0.2), at(L, 0.25), px(32.5)], r: 0.25 });
    return { els };
  };
  for (const st of ['grego', 'romano', 'egipcio', 'asteca']) def('torre', st, towerStone);
  def('torre', 'classico', towerWood); def('torre', 'nordico', towerWood);

  // ------------------------------ the cistern of an aqueduct (arch.js aqueduto) ------------------------------
  // the classical one (and the Greek's, the Roman's — under the hip of 6 px of its palette — and the Aztec's, open to the sky):
  // its plinth of 0.76 tiles and 2 px, the walls to 18 px with two dark arches a side, the band under the top, the water inside
  // its rim at the top
  const cistern = st => L => {
    const e = 0.38; const els = [plinthF(L, -e, -e, e, e, 2), wallsF(L, -e, -e, e, e, 2, 18, 0, { mat: 'base' })];
    for (const a of [-0.18, 0.1]) els.push(winsF(L, 'frente', e, a, a + 0.1, 2, 7, 0, { escuro: '#30261e' }), winsF(L, 'direita', e, a, a + 0.1, 2, 7, 0, { escuro: '#30261e' }), winsF(L, 'esquerda', -e, a, a + 0.1, 2, 7, 0, { escuro: '#30261e' }), winsF(L, 'fundo', -e, a, a + 0.1, 2, 7, 0, { escuro: '#30261e' }));
    els.push(faixaF(L, -e, -e, e, e, 15, 16.5, 'trim'), { k: 'lamina', r: rect(L, -e + 0.07, -e + 0.07, e - 0.07, e - 0.07), y: px(18) + 0.04, cor: '#4a9ac0' });
    if (st !== 'asteca') els.push(...roofF(L, st, -e - 0.02, -e - 0.02, e + 0.02, e + 0.02, 18, { kind: 'hip', rh: 6 }).els);
    return { els };
  };
  for (const st of ['classico', 'grego', 'romano', 'asteca']) def('aqueduto', st, cistern(st));
  // the Egyptian's: the tank of 0.9 tiles and 4 px, its water 0.6 px under the rim, and the shaduf over it — its post to 14 px,
  // the beam across it from 18 px down to 10.5, its end over the lot's edge
  def('aqueduto', 'egipcio', L => ({ els: [
    ...[[-0.45, -0.45, 0.45, -0.36], [-0.45, 0.36, 0.45, 0.45], [-0.45, -0.36, -0.36, 0.36], [0.36, -0.36, 0.45, 0.36]].map(q => blocoF(L, ...q, 0, 4, BASE)),
    blocoF(L, -0.36, -0.36, 0.36, 0.36, 0, 1, ['base1', 'base1', '#2f6f98']), { k: 'lamina', r: rect(L, -0.36, -0.36, 0.36, 0.36), y: px(3.4), cor: '#3f8fb8' },
    { k: 'tora', a: [at(L, 0.3), at(L, 0.3), px(4)], b: [at(L, 0.3), at(L, 0.3), px(14)], r: 0.09, cor: '#7a5a3a' },
    { k: 'tora', a: [at(L, -0.2), at(L, 0.1), px(18)], b: [at(L, 0.55), at(L, 0.475), px(10.5)], r: 0.08, cor: '#7a5a3a' },
  ] }));
  // the Norse's: the tub of staves on four legs of 12 px — its round of 1.6 m, 3 m high, three hoops, the water at its rim
  def('aqueduto', 'nordico', L => ({ els: [
    ...[[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]].map(([x, y]) => blocoF(L, x - 0.04, y - 0.04, x + 0.04, y + 0.04, 0, 12, ['#5a4030', '#4a3222', '#6a4a36'], { mat: 'beam' })),
    { k: 'tina', c: [L / 2, L / 2], r: 9 / 22.6 * TILE, y0: px(12), y1: px(21), cor: '#7a5230', aros: 3, aro: '#5a3a20', borda: '#9a7040', agua: '#4a9ac0' },
  ] }));

  // ------------------------------ the smugglers' shack (cityart.js mercado_negro) ------------------------------
  // a leaning shack of scraps: its base of 0.8 tiles and 0.6 px, the walls of boards of 0.6 × 0.56 tiles to 8 px with two
  // patches, the roof of one slope over it — 11 px at its back, 7.2 at its front —, the boards closing the walls up to it, the
  // dark curtain hanging out of its right side, the three crates by its front, the lantern at its corner
  const shack = st => L => {
    const wood = st === 'egipcio' || st === 'asteca' ? ['#a08a66', '#7e6a4c', '#a08a66'] : ['#6a5440', '#4e3c2c', '#6a5440'];
    const R = [[-0.42, -0.42, 11], [0.34, -0.42, 10], [0.34, 0.3, 7.2], [-0.42, 0.3, 8]]; // (the roof's corners: x, y tiles, z px)
    const zAt = (x, y) => { const s = (x + 0.42) / 0.76, t = (y + 0.42) / 0.72; return (R[0][2] * (1 - s) + R[1][2] * s) * (1 - t) + (R[3][2] * (1 - s) + R[2][2] * s) * t; };
    const P = (x, y, z) => [at(L, x), at(L, y), px(z)];
    const x0 = -0.34, y0 = -0.36, x1 = 0.26, y1 = 0.2;
    return { els: [
      blocoF(L, -0.4, -0.4, 0.4, 0.4, 0, 0.6, ['#5a5046', '#463e36', '#6a6056']), blocoF(L, x0, y0, x1, y1, 0.6, 8, wood, { mat: 'plankV' }),
      // (the boards between the walls' top and the slope: the back, the two sides)
      { k: 'pano', p: [P(x0, y0, 8), P(x1, y0, 8), P(x1, y0, zAt(x1, y0)), P(x0, y0, zAt(x0, y0))], cor: wood[1], mat: 'plankV' },
      { k: 'pano', p: [P(x0, y0, 8), P(x0, y1, 8), P(x0, y1, zAt(x0, y1)), P(x0, y0, zAt(x0, y0))], cor: wood[0], mat: 'plankV' },
      { k: 'pano', p: [P(x1, y0, 8), P(x1, y1, 8), P(x1, y1, Math.max(8, zAt(x1, y1))), P(x1, y0, zAt(x1, y0))], cor: wood[1], mat: 'plankV' },
      winsF(L, 'frente', y1, -0.28, -0.12, 1.4, 2.6, 0, { tinta: '#8a7a5a' }), winsF(L, 'direita', x1, -0.3, -0.05, 3, 3, 0, { tinta: '#5a6a4a' }),
      { k: 'pano', p: R.map(([x, y, z]) => P(x, y, z)), cor: '#5a4a3a', mat: 'plankH', grosso: 0.06 },
      { k: 'pano', p: [P(0.26, -0.3, 7.6), P(0.26, 0.14, 7.2), P(0.5, 0.14, 1), P(0.5, -0.3, 1.2)], cor: '#3a2440', mat: 'linen' },
      blocoF(L, -0.27, 0.27, -0.13, 0.41, 0, 3, ['#6a5238', '#56422c', '#7a6044'], { mat: 'plankH' }), blocoF(L, -0.013, 0.297, 0.113, 0.423, 0, 2.7, ['#5e4a34', '#4c3c2a', '#6e5840'], { mat: 'plankH' }),
      blocoF(L, -0.176, 0.284, -0.064, 0.396, 3, 5.4, ['#7a6044', '#624e36', '#8a7054'], { mat: 'plankH' }),
      { k: 'bola', c: [at(L, 0.34), at(L, 0.24), px(7)], r: 0.09, cor: '#ffcf6a' },
    ] };
  };
  for (const st of ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico']) def('mercado_negro', st, shack(st));

  // ------------------------------ the square (arch.js praca; D-093) ------------------------------
  // its pavement — the god paints it on the ground under the picture (render.js): the lot less 0.02 tiles, in the people's
  // colour (arch.js plazaColor), the north's the green of the thing's field — and on it each people's square as the god draws
  // it, with the pieces the plan uses where the form puts them (D-093: what is seen is the form; the plan reads its uses —
  // G.Forma.uses — and its solids): the fountain where the god has water, the speaker's stone (one stands on it to speak; the
  // Roman's the rostra, up their stair), the benches. On a piece, uso: what it is for; vira [du, dv]: the way one faces using
  // it. (The god's pieces stand on its pavement, 0.4 px: on the ground here, their tops where the god has them)
  const PLAZA = { nordico: '#86a84e', egipcio: '#e2cfa2', asteca: '#e0d6c0', romano: '#d8cbb0' };
  const pavedF = (L, st) => { const c = PLAZA[st] || '#ddd6c6'; return { k: 'bloco', r: rect(L, -0.98, -0.98, 0.98, 0.98), y0: 0, y1: 0.04, cor: [c, c, c], mat: st === 'nordico' ? 'turf' : 'slab', piso: 1 }; };
  // (a bench: its plank over x0..x1 × y0..y1 tiles, the seat 0.45 m up — the plan's — on two feet of stone; the way one sits)
  const benchF = (L, x0, y0, x1, y1, vira) => ({ k: 'banco', r: rect(L, x0, y0, x1, y1), y: 0.45, cor: '#8a6a44', pes: 'base0', uso: 'banco', vira });
  // (the speaker's stone: x0..x1 × y0..y1 tiles, 0.45 m high — the body steps up onto it —, facing the square)
  const stoneF = (L, x0, y0, x1, y1, vira) => blocoF(L, x0, y0, x1, y1, 0, 0.45 * ZPX, BASE, { uso: 'tribuna', vira });
  // (a tree of the square, the god's: its trunk of 4.4 px, its crown of two rounds — at 6.6 px, 0.66 m, and at 7.7 px, 0.5 m)
  const treeF = (L, x, y) => [{ k: 'tora', a: [at(L, x), at(L, y), 0], b: [at(L, x), at(L, y), px(4.4)], r: 0.1, cor: '#6e4a2b' },
    { k: 'bola', c: [at(L, x) + 0.09, at(L, y) - 0.09, px(6.6)], r: 0.66, cor: '#3f7d34' }, { k: 'bola', c: [at(L, x) - 0.05, at(L, y) + 0.05, px(7.7)], r: 0.5, cor: '#56a043' }];
  // the classical one: the fountain in the middle — its basin of 1.4 m round with its rim of fourteen dressed blocks to 0.72 m,
  // the water in it, the column and its bowl spilling into it (the plan's fountain: the god's basin was 2.3 m round) —, a
  // bench on either side of it facing it, the speaker's stone at its left, facing it, the god's three trees in the corners
  def('praca', 'classico', L => ({ els: [pavedF(L, 'classico'), ...treeF(L, -0.75, -0.75), ...treeF(L, 0.7, -0.75), ...treeF(L, -0.75, 0.7),
    { k: 'bacia', c: [L / 2, L / 2], r: 1.4, t: 0.26, y0: 0, y1: 0.72, nivel: 0.12, blocos: 14, cor: 'base0', agua: '#5aaed0', uso: 'fonte' },
    { k: 'coluna', c: [L / 2, L / 2], r: 0.17, y0: 0, y1: 1.5, cor: ['base2', 'base1'] },
    { k: 'bacia', c: [L / 2, L / 2], r: 0.5, t: 0.07, y0: 1.5, y1: 1.75, nivel: 0.03, cor: 'base2', agua: '#5aaed0' },
    benchF(L, -0.225, -0.73, 0.225, -0.62, [0, 1]), benchF(L, -0.225, 0.62, 0.225, 0.73, [0, -1]), stoneF(L, -0.85, -0.125, -0.6, 0.125, [1, 0]),
  ] }));
  // the Greek's: the stoa along the back — its back wall (the god's block behind the columns, a wall of 0.08 tiles: the benches
  // are under its roof), the seven columns along its front to 12 px, its roof along it from 12 to 16 px —, the marble Athena
  // with her spear 12 px tall, the basin of 0.18 tiles at the front left (its fountain: the water a hand under its rim), the
  // speaker's stone at the right
  def('praca', 'grego', L => ({ els: [pavedF(L, 'grego'),
    blocoF(L, -0.9, -0.9, 0.9, -0.82, 0, 12, ['wl', 'wr', 'top']),
    { k: 'colunata', pts: [0, 1, 2, 3, 4, 5, 6].map(k => [at(L, -0.9 + 0.3 * k), at(L, -0.5)]), r: 0.035 * TILE, y0: 0, y1: px(12), cor: ['col0', 'col1'] },
    { k: 'telhado', r: rect(L, -0.92, -0.92, 0.92, -0.48), y0: px(12), y1: px(16), ao: 'u', ov: 0.04 * TILE, cor: ['roof0', 'roof1', 'gable', 'roof2'] },
    benchF(L, -0.7, -0.81, -0.25, -0.7, [0, 1]), benchF(L, 0.25, -0.81, 0.7, -0.7, [0, 1]),
    { k: 'estatua', p: [at(L, 0.15), at(L, 0.2), 0], h: px(12), w: robe(12), cor: '#f0ebe0', lanca: true },
    { k: 'bacia', c: [at(L, -0.45), at(L, 0.35)], r: 0.18 * TILE, t: 0.12, y0: 0, y1: px(0.8), nivel: 0.06, cor: 'base0', agua: '#5aaed0', uso: 'fonte' },
    stoneF(L, 0.6, -0.25, 0.85, 0, [-1, 0]),
  ] }));
  // the Roman's: the rostra along the back, 5 px — the speaker's platform, up the stair of five treads at its right end (six
  // risers of 0.27 m) — with the four columns before it to 5.5 px, the column of 26 px at the front right with the golden
  // emperor on it, the statue with its spear at the front left, two benches facing the rostra
  def('praca', 'romano', L => {
    const els = [pavedF(L, 'romano'), blocoF(L, -0.4, -0.9, 0.5, -0.55, 0, 5, BASE, { uso: 'tribuna', vira: [0, 1] }),
      { k: 'colunata', pts: [-0.3, -0.05, 0.2, 0.45].map(x => [at(L, x), at(L, -0.5)]), r: 0.02 * TILE, y0: 0, y1: px(5.5), cor: ['col0', 'col1'] },
      blocoF(L, 0.45, 0.45, 0.6, 0.6, 0, 3, COL), blocoF(L, 0.5, 0.5, 0.55, 0.55, 3, 26, COL),
      { k: 'estatua', p: [at(L, 0.525), at(L, 0.525), px(26)], h: px(6), w: robe(6), cor: '#e0b84a' },
      { k: 'estatua', p: [at(L, -0.4), at(L, 0.3), 0], h: px(10), w: robe(10), cor: '#b8a888', lanca: true },
      benchF(L, -0.3, 0.05, 0.15, 0.16, [0, -1]), benchF(L, 0.225, 0.05, 0.675, 0.16, [0, -1])];
    for (let k = 1; k <= 5; k++) els.push({ k: 'bloco', r: [at(L, 0.5) + (k - 1) * 0.3, at(L, -0.85), at(L, 0.5) + k * 0.3, at(L, -0.6)], y0: 0, y1: px(5) * (6 - k) / 6, cor: BASE, degrau: 'tribuna' });
    return { els };
  });
  // the Egyptian's: the obelisk in the middle — its pedestal of 0.12 tiles and 3 px, the shaft tapering from 0.08 to 0.05 tiles
  // up to 30 px, the gilded pyramidion to 34 px —, the four palms at the corners, two benches facing the obelisk, the speaker's
  // stone at the left (no fountain: the well gives the water)
  def('praca', 'egipcio', L => ({ els: [pavedF(L, 'egipcio'),
    ...[[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].map(([x, y]) => ({ k: 'palmeira', p: [at(L, x), at(L, y), 0], h: px(13.2), s: 1.1 })),
    blocoF(L, -0.12, -0.12, 0.12, 0.12, 0, 3, BASE),
    { k: 'talude', r: rect(L, -0.08, -0.08, 0.08, 0.08), r1: rect(L, -0.05, -0.05, 0.05, 0.05), y0: px(3), y1: px(30), cor: ['#e6dfcc', '#bdb39c', '#e6dfcc'], mat: 'base' },
    { k: 'piramide', c: [L / 2, L / 2], e: 0.05 * TILE, y0: px(30), y1: px(34), cor: ['#f7d66a', '#d9a93a'], mat: 'slab' },
    benchF(L, -0.225, -0.73, 0.225, -0.62, [0, 1]), benchF(L, -0.225, 0.62, 0.225, 0.73, [0, -1]), stoneF(L, -0.85, -0.125, -0.6, 0.125, [1, 0]),
  ] }));
  // the Aztec's: the altar of the fire in the middle — 0.2 tiles and 3.5 px, its painted band, the fire on it —, the four stalls
  // of the market round it (each on its four posts to 7 px, its counter of 2.5–3.4 px with the fruit on it, its roof of cloth up
  // to 10 px), the speaker's stone at the left (no fountain: the well gives the water)
  const AZT = [['#b33a2a'], ['#2fae8f'], ['#e8b83a']]; // (the god's cloths: each stall's first colour, on all its sides)
  const stallF = (L, x, y, c1) => {
    const s = 0.2, o = s + 0.04; const P = (dx, dy, z) => [at(L, x + dx), at(L, y + dy), px(z)]; const top = P(0, 0, 10);
    const els = [[-s, -s], [s, -s], [s, s], [-s, s]].map(([dx, dy]) => ({ k: 'tora', a: P(dx, dy, 0), b: P(dx, dy, 7), r: 0.05, cor: '#6a4a2c' }));
    els.push(blocoF(L, x - s, y - s, x + s, y + s, 2.5, 3.4, ['#8a6a44', '#6a4e30', '#9a7a52'], { mat: 'plankH' }));
    [[-o, o, o, o], [o, o, o, -o], [o, -o, -o, -o], [-o, -o, -o, o]].forEach(([ax, ay, bx, by]) => els.push({ k: 'pano', p: [P(ax, ay, 7), P(bx, by, 7), top, top], cor: c1, mat: 'linen' }));
    ['#e05a3a', '#f0b040', '#6ab04a'].forEach((cor, k) => els.push({ k: 'bola', c: [at(L, x - 0.1 + k * 0.1), at(L, y + 0.05), px(3.4) + 0.1], r: 0.1, cor }));
    return els;
  };
  def('praca', 'asteca', L => {
    const els = [pavedF(L, 'asteca'), blocoF(L, -0.2, -0.2, 0.2, 0.2, 0, 3.5, ['wl', 'wr', 'top']), faixaF(L, -0.2, -0.2, 0.2, 0.2, 2.4, 3.5, 'trim'),
      { k: 'braseiro', p: [L / 2, L / 2, px(3.5)], r: 0.35 }, stoneF(L, -0.85, -0.125, -0.6, 0.125, [1, 0])];
    for (const [x, y, k] of [[-0.55, -0.55, 0], [0.55, -0.5, 1], [-0.55, 0.5, 2], [0.5, 0.55, 0]]) els.push(...stallF(L, x, y, AZT[k][0]));
    return { els };
  });
  // the Norse's thing: on its field of grass the nine stones standing in a ring of 0.72 tiles — 8, 10 and 12 px by turns —, the
  // law stone in the middle (3.5 px) with the god of wood on it, and before it the low stone the law speaker stands on
  def('praca', 'nordico', L => {
    const els = [pavedF(L, 'nordico')];
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; const x = Math.cos(a) * 0.72, y = Math.sin(a) * 0.72;
      els.push(blocoF(L, x - 0.06, y - 0.05, x + 0.06, y + 0.05, 0, 8 + (k % 3) * 2, ['#a09a90', '#7e7870', '#b8b2a8'], { mat: 'stone' })); }
    els.push(blocoF(L, -0.18, -0.12, 0.18, 0.14, 0, 3.5, ['#9a948a', '#787268', '#b0aa9e'], { mat: 'stone' }),
      { k: 'estatua', p: [L / 2, L / 2, px(3.5)], h: px(7), w: robe(7), cor: '#6a4a30' }, stoneF(L, -0.125, 0.165, 0.125, 0.365, [0, 1]));
    return { els };
  });

  // ------------------------------ the mine (cityart.js mina; D-092) ------------------------------
  // the rocky hill over the galleries, filling the lot (D-092): its round of 2.02 m about a point a quarter metre back and left
  // of the lot's middle — 0.27 m out of the lot at its back and its left, within the 0.3 m —, 5.46 m high (the god's dome — 20 px over
  // a round of 2.47 m — kept to its shape), the ore glinting in it; at its foot toward the front corner the timbered mouth of
  // the gallery — its two posts and the lintel at 1.95 m, the dark of the gallery behind them —, the lantern at its side, the
  // two rails from it into that corner and the cart of ore on them (in the lot, never in the street: D-092), the spoil heap
  // against the hill's right. The same for every people
  const MINE = { c: [1.75, 1.75], r: 2.02, h: 5.46 };
  def('mina', 'classico', L => {
    // (a point r metres from the hill's middle toward the front corner, s across that way — to the right of one who looks at
    // the mouth from the corner —, y up)
    const D = Math.SQRT1_2, P2 = (r, s2, y) => [MINE.c[0] + D * (r + s2), MINE.c[1] + D * (r - s2), y || 0];
    const cart = 2.445, cl = 0.375, cb = 0.3, ct = 0.36, wood = '#5a4030'; // (the cart: its middle, half its length on top and at its bottom, half its width)
    const tub = (a, b2, c, d) => ({ k: 'pano', p: [a, b2, c, d], cor: wood, mat: 'plankV' });
    const lo = (r, s2) => P2(r, s2, 0.4), hi = (r, s2) => P2(r, s2, 1.02);
    return { els: [
      { k: 'morro', c: MINE.c.slice(), r: MINE.r, y0: 0, y1: MINE.h, cor: ['#948a7c', '#62594f'], veios: 7, mat: 'rock' }, // (its veins of gold in a mine of gold: the 3D's glints, the god's specks)
      { k: 'morro', c: [3.35, 1.25], r: 0.7, y0: 0, y1: 0.8, cor: ['#9a9286', '#7a7266'], mat: 'rock' },
      { k: 'pano', p: [P2(1.85, 0.45, 0), P2(1.85, -0.45, 0), P2(1.85, -0.45, 1.8), P2(1.85, 0.45, 1.8)], cor: '#16100c', mat: 'soil' },
      ...[-0.5, 0.5].map(s2 => ({ k: 'tora', a: P2(1.9, s2, 0), b: P2(1.9, s2, 2.05), r: 0.11, cor: '#6e4a2c' })),
      { k: 'tora', a: P2(1.92, -0.62, 1.95), b: P2(1.92, 0.62, 1.95), r: 0.1, cor: '#6e4a2c' },
      { k: 'bola', c: P2(1.96, 0.78, 1.72), r: 0.08, cor: '#ffcf6a' },
      ...[-0.3, 0.3].map(s2 => ({ k: 'tora', a: P2(1.9, s2, 0.04), b: P2(2.85, s2, 0.04), r: 0.035, cor: '#5a4a3a', mat: 'iron' })),
      tub(lo(cart - cb, -ct + 0.06), lo(cart + cb, -ct + 0.06), hi(cart + cl, -ct), hi(cart - cl, -ct)),
      tub(lo(cart - cb, ct - 0.06), lo(cart + cb, ct - 0.06), hi(cart + cl, ct), hi(cart - cl, ct)),
      tub(lo(cart - cb, -ct + 0.06), lo(cart - cb, ct - 0.06), hi(cart - cl, ct), hi(cart - cl, -ct)),
      tub(lo(cart + cb, -ct + 0.06), lo(cart + cb, ct - 0.06), hi(cart + cl, ct), hi(cart + cl, -ct)),
      tub(lo(cart - cb, -ct + 0.06), lo(cart + cb, -ct + 0.06), lo(cart + cb, ct - 0.06), lo(cart - cb, ct - 0.06)),
      ...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b2]) => ({ k: 'bola', c: P2(cart + a * 0.22, b2 * (ct + 0.02), 0.18), r: 0.17, cor: '#2a2420' })),
      { k: 'morro', c: P2(cart, 0).slice(0, 2), r: 0.34, y0: 0.95, y1: 1.28, cor: ['#8a5a42', '#6a4a36'], ouro: ['#d8b04a', '#b08a2a'], mat: 'rock' },
    ] };
  });

  // ------------------------------ the well (art.js well; D-092) ------------------------------
  // the god's well-house at the scale of people (D-092: some 3.5 to 4 m high — the god's was 6.6 —, the god's picture the same
  // shape, smaller — 0.57 of it —, and the 3D the same), standing where the god has it, a quarter metre toward the lot's front
  // corner: the curb of eleven dressed stones, 0.71 m round and 0.94 m high, its water deep in the dark of the shaft; the two
  // posts on it, across the god's picture (0.59 m each side of its middle, along the line from the lot's left corner to its
  // right), up into the roof; the windlass between them at 1.45 m — a person's height, where the crank is turned — with its
  // rope and its bucket; the roof of two slopes of boards as the god draws it, its ridge running toward the front corner —
  // 0.6 m long, at 3.66 m —, its eaves 0.91 m out each way at 2.53 m
  const well = st => L => {
    const wood = st === 'nordico' ? '#4a3626' : '#68503a', D = Math.SQRT1_2; const c = L / 2 + 0.25;
    const Q = (s2, d, y) => [c + D * (s2 + d), c + D * (d - s2), y]; // (s across the picture — to its right —, d toward the front corner)
    const rc = st === 'nordico' ? ['#5a4430', '#46342a'] : st === 'egipcio' || st === 'asteca' ? ['roof0', 'roof1'] : ['#9a4a32', '#7a3826'];
    const rm = st === 'nordico' ? 'shingle' : st === 'egipcio' || st === 'asteca' ? 'thatch' : 'tile';
    const post = s2 => { const p = Q(s2, 0, 0); return { k: 'bloco', r: [p[0] - 0.065, p[1] - 0.065, p[0] + 0.065, p[1] + 0.065], y0: 0, y1: 2.92, cor: [wood, wood, wood], mat: 'beam' }; };
    return { els: [
      { k: 'bacia', c: [c, c], r: 0.71, t: 0.22, y0: 0, y1: 0.94, nivel: 0.58, blocos: 11, cor: 'base1', agua: '#223e46', fundo: '#2a2824' },
      post(-0.59), post(0.59),
      { k: 'tora', a: Q(-0.62, 0, 1.45), b: Q(0.62, 0, 1.45), r: 0.075, cor: '#76603f', mat: 'bark' },
      { k: 'tora', a: Q(0.68, 0, 1.45), b: Q(0.8, 0.1, 1.28), r: 0.03, cor: wood },
      { k: 'tora', a: [c, c, 1.42], b: [c, c, 0.98], r: 0.012, cor: '#b09c76', mat: 'rope' },
      { k: 'tina', c: [c, c], r: 0.13, y0: 0.72, y1: 0.98, cor: '#785838', aros: 1, aro: '#3c3a36' },
      { k: 'pano', p: [Q(-0.907, -0.3, 2.53), Q(-0.907, 0.3, 2.53), Q(0, 0.3, 3.66), Q(0, -0.3, 3.66)], cor: rc[0], mat: rm, grosso: 0.05 },
      { k: 'pano', p: [Q(0.907, 0.3, 2.53), Q(0.907, -0.3, 2.53), Q(0, -0.3, 3.66), Q(0, 0.3, 3.66)], cor: rc[1], mat: rm, grosso: 0.05 },
    ] };
  };
  for (const st of ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico']) def('well', st, well(st));

  // ------------------------------ the silk house, the salting yard (estates.js), the divers' hut (waters.js) ------------------------------
  // (the estates' house: its footing of 1.5 px, its walls to H px, the door in the middle of its front, two windows on its right
  // halfway up, the people's roof — the Norse's turf, the Egyptian's and the Aztec's flat behind a parapet of 1.2 px)
  function estateF(L, st, x0, y0, x1, y1, H) {
    const els = [blocoF(L, x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, 0, 1.5, BASE), wallsF(L, x0, y0, x1, y1, 1.5, H, 0), doorF(L, y1, (x0 + x1) / 2 - 0.1, (x0 + x1) / 2 + 0.1, 1.5, 8),
      winsF(L, 'direita', x1, y0, y1, H * 0.55, 2.4, 2)];
    const rf = st === 'nordico' ? roofF(L, st, x0, y0, x1, y1, H, { kind: 'turf' }) : st === 'egipcio' || st === 'asteca' ? roofF(L, st, x0, y0, x1, y1, H, { par: 1.2 }) : roofF(L, st, x0, y0, x1, y1, H, {});
    return { els: els.concat(rf.els), door: { u: at(L, (x0 + x1) / 2), w: 0.2 * TILE, y0: px(1.5), y1: px(8) } };
  }
  const WOOD = ['#6e4a2c', '#553820', '#6e4a2c'];
  // the silk house: the house of 1.1 × 1 tiles to 15 px at the back left, and beside it the racks of trays under an open roof —
  // four posts of 11 px, the trays at 3, 6 and 9 px white with cocoons, the roof of one slope from 12.5 to 11 px —; the line of
  // skeins drying before the house and the mulberry bush at the front corner
  const silk = st => L => {
    const h = estateF(L, st, -0.9, -0.9, 0.2, 0.1, 15); const els = h.els.slice(); const P = (x, y, z) => [at(L, x), at(L, y), px(z)];
    for (const [x, y] of [[0.4, -0.75], [0.85, -0.75], [0.4, -0.1], [0.85, -0.1]]) els.push(blocoF(L, x - 0.03, y - 0.03, x + 0.03, y + 0.03, 0, 11, WOOD, { mat: 'beam' }));
    for (const z of [3, 6, 9]) els.push(blocoF(L, 0.35, -0.8, 0.9, -0.05, z, z + 0.25, ['#c8b088', '#a8905a', '#e8dcc0'], { mat: 'plankH' }));
    els.push({ k: 'pano', p: [P(0.3, -0.85, 12.5), P(0.95, -0.85, 12), P(0.95, 0, 11), P(0.3, 0, 11.5)], cor: st === 'nordico' ? '#5a7631' : 'roof0', mat: st === 'nordico' ? 'turf' : 'shingle', grosso: 0.06 });
    for (const x of [-0.8, 0.6]) els.push({ k: 'tora', a: P(x, 0.6, 0), b: P(x, 0.6, 9.4), r: 0.05, cor: '#6a4a2c' });
    els.push({ k: 'tora', a: P(-0.8, 0.6, 9), b: P(0.6, 0.6, 9), r: 0.012, cor: '#7a6a50', mat: 'rope' });
    ['#f6eede', '#f2e6a8', '#e8c8c0', '#f6eede', '#d8e0f0'].forEach((cor, k) => els.push({ k: 'tora', a: P(-0.65 + k * 0.28, 0.6, 9), b: P(-0.65 + k * 0.28, 0.6, 7.6), r: 0.07, cor, mat: 'linen' }));
    els.push({ k: 'bola', c: [at(L, 0.75), at(L, 0.6), px(4)], r: 0.6, cor: '#4a7a2a' });
    return { els, door: h.door };
  };
  // the salting yard: the house of 1 × 0.9 tiles to 13 px at the back left, the two racks across the yard hung with fish and
  // meat — their posts of 10 px at the yard's sides, the bars at 6 and 9.6 px —, the two barrels of salt by the house
  const salting = st => L => {
    const h = estateF(L, st, -0.9, -0.9, 0.1, 0, 13); const els = h.els.slice(); const P = (x, y, z) => [at(L, x), at(L, y), px(z)];
    for (const y of [0.25, 0.75]) {
      for (const x of [-0.85, 0.85]) els.push({ k: 'tora', a: P(x, y, 0), b: P(x, y, 10), r: 0.07, cor: '#6a4a2c' });
      for (const z of [9.6, 6]) els.push({ k: 'tora', a: P(-0.85, y, z), b: P(0.85, y, z), r: 0.04, cor: '#5a3c22' });
      for (let k = 0; k < 7; k++) { const fish = (k + (y > 0.5 ? 1 : 0)) % 2; els.push({ k: 'tora', a: P(-0.75 + k * 0.25, y, 9.6), b: P(-0.75 + k * 0.25, y, fish ? 7.6 : 8), r: fish ? 0.11 : 0.09, cor: fish ? '#d8d0b8' : '#8a3a2a', mat: 'linen' }); }
    }
    for (const [x, y] of [[0.45, -0.6], [0.7, -0.35]]) els.push({ k: 'tina', c: [at(L, x), at(L, y)], r: 0.25, y0: 0, y1: px(3.2), cor: '#7a5230', aros: 2, aro: '#5a3a20', agua: '#f4f4f0' });
    return { els, door: h.door };
  };
  // the divers' hut: its footing of 0.62 tiles and 1 px toward the back left, the walls of reed to 8 px, the roof of thatch 7 px
  // high; the dugout lying at the front corner, the two baskets of shells before the hut, the pole with its line at the right
  const divers = L => {
    const P = (x, y, z) => [at(L, x), at(L, y), px(z)];
    const els = [blocoF(L, -0.42, -0.42, 0.2, 0.2, 0, 1, BASE), blocoF(L, -0.38, -0.38, 0.16, 0.16, 1, 8, ['#b8905a', '#98703a', '#a8804a'], { mat: 'plankV' }),
      ...roofF(L, 'classico', -0.45, -0.45, 0.24, 0.24, 8, { kind: 'gable', rh: 7, cor: ['#c8a860', '#a8884a', '#8a6a3a', '#8a6a3a'] }).els,
      { k: 'tora', a: P(0.265, 0.31, 0.9), b: P(0.49, 0.075, 0.9), r: 0.16, cor: '#6a4a2a', mat: 'bark' },
      ...[[-0.3, 0.38], [-0.08, 0.42]].map(([x, y]) => ({ k: 'tina', c: [at(L, x), at(L, y)], r: 0.3, y0: 0, y1: 0.3, cor: '#a07040', agua: '#e8d8c0' })),
      { k: 'tora', a: P(0.3, -0.3, 0), b: P(0.3, -0.3, 9), r: 0.04, cor: '#6a4a2c' }, { k: 'tora', a: P(0.3, -0.3, 8.6), b: P(0.48, -0.1, 8.2), r: 0.012, cor: '#7a6a50', mat: 'rope' }];
    els[2].mat = 'thatch';
    return { els };
  };
  for (const st of ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico']) { def('sericultura', st, silk(st)); def('salga', st, salting(st)); }
  def('perolaria', 'classico', divers);

  // ------------------------------ the pens (cityart.js: the paddock, the stable, the shelter) ------------------------------
  // the fence round a pen as the god draws it on its ground and among the beasts (cityart.js rail and drawRailSeg; T-150): the
  // lot less 0.05 tiles round, each side in as many bays as it has tiles, a post of 1.4 by 7.2 px at each end of a bay, the two
  // rails at 3 and 5.6 px; the gate the middle bay of the front, its brace across. from: how far along each side, from its back
  // end, a building stands on it (the fence runs from there); col: the rails' colour and the posts'
  function penFence(L, from, col) {
    const a = 0.05 * TILE, b = L - a, n = Math.max(1, Math.round((b - a) / TILE)); const els = []; const seen = new Set();
    const post = (u, v) => { const k = u.toFixed(2) + ',' + v.toFixed(2); if (seen.has(k)) return; seen.add(k); els.push({ k: 'bloco', r: [u - 0.09, v - 0.09, u + 0.09, v + 0.09], y0: 0, y1: px(7.2), cor: [col[1], col[1], col[1]], mat: 'beam' }); };
    const bay = (p0, p1, gate) => { for (const z of [3, 5.6]) els.push({ k: 'tora', a: [p0[0], p0[1], px(z)], b: [p1[0], p1[1], px(z)], r: 0.08, cor: col[0], mat: 'beam' }); if (gate) els.push({ k: 'tora', a: [p0[0], p0[1], px(5.6)], b: [p1[0], p1[1], px(3)], r: 0.04, cor: col[1], mat: 'beam' }); };
    // (a side from its back end to its front: its bays where the fence stands, its posts)
    const side = (P, s0, gate) => { for (let k = 0; k < n; k++) { const t0 = a + (b - a) * k / n, t1 = a + (b - a) * (k + 1) / n; if (t1 <= s0 + 1e-6) continue; bay(P(Math.max(t0, s0)), P(t1), gate && k === Math.floor(n / 2)); }
      for (let k = 0; k <= n; k++) { const t = a + (b - a) * k / n; if (t >= s0 - 1e-6) post(...P(t)); } };
    side(t => [t, b], 0, true); side(t => [a, t], (from && from.esquerda) || 0); side(t => [b, t], (from && from.direita) || 0); side(t => [t, a], (from && from.fundo) || 0);
    return els;
  }
  // (the trough of a pen, as the god lays it on the ground of both: three metres of planks along the yard's right, its water)
  const troughF = L => { const tu = L - 0.45 * TILE, tv = L / 2; return [{ k: 'bloco', r: [tu - 2, tv - 0.25, tu + 1, tv + 0.25], y0: 0, y1: 0.53, cor: ['#6a4a2c', '#5a3c22', '#6a4a2c'], mat: 'plankH' }, { k: 'lamina', r: [tu - 1.9, tv - 0.17, tu + 0.9, tv + 0.17], y: 0.54, cor: '#5aaed0' }]; }; // (the water over the planks' top: seen)
  // the stable (economy.js estabulo): its paddock fenced round, and along its back the god's long low stable — 2.9 × 0.85 tiles,
  // its footing of 1 px, its walls to 11 px (the Norse's of their palette), the five stalls open to the yard with their half
  // doors, the window at its right end, the people's roof (the Norse's turf, rh 9; the Egyptian's and the Aztec's flat with its
  // parapet; the others' gable, rh 8) —; the trough at the right of the yard
  const stable = st => L => {
    const A0 = (x, y) => [L / 2 + x * TILE, 0.5 * TILE + y * TILE]; const x0 = -1.45, x1 = 1.45, y0 = -0.45, y1 = 0.4;
    const r = [A0(x0, y0)[0], A0(x0, y0)[1], A0(x1, y1)[0], A0(x1, y1)[1]];
    const wood = st === 'nordico' ? ['wl', 'wr', 'top'] : ['#9a7a52', '#7a5c3a', '#9a7a52'];
    const els = [{ k: 'bloco', r: r.slice(), y0: 0, y1: px(1), cor: BASE }, { k: 'bloco', r: r.slice(), y0: px(1), y1: px(11), cor: wood, mat: st === 'nordico' ? 'parede' : 'plankV', tabuas: st === 'nordico' ? 6 : 0 }];
    for (let k = 0; k < 5; k++) { const a = x0 + 0.12 + k * 0.57; const u0 = A0(a, 0)[0], u1 = A0(a + 0.4, 0)[0];
      els.push({ k: 'janelas', na: 'frente', em: r[3], de: u0, ate: u1, y0: px(1), y1: px(8), n: 0, tinta: '#2a1e14' }, { k: 'placa', v: r[3] + 0.02, u: (u0 + u1) / 2, w: u1 - u0, y0: px(4), y1: px(4.6), cor: '#8a6a44' }); }
    els.push({ k: 'janelas', na: 'direita', em: r[2], de: A0(0, -0.1)[1], ate: A0(0, 0.1)[1], y0: px(5), y1: px(8), n: 0 });
    const rf = st === 'nordico' ? { kind: 'turf', rh: 9 } : st === 'egipcio' || st === 'asteca' ? { par: 1 } : { rh: 8 };
    els.push(...roofF(L, st, x0, (r[1] - L / 2) / TILE, x1, (r[3] - L / 2) / TILE, 11, rf).els);
    els.push(...penFence(L, { esquerda: r[3], direita: r[3], fundo: L }, ['#7a5634', '#5a3c22']));
    els.push(...troughF(L));
    return { els };
  };
  // the pen for the flocks (curral): its fence round, and in its back left corner the god's shelter — four posts of 9 px, its
  // back wall of planks, the roof of boards from 12 px at the back down to 8 at the front with its edge, the hay under it —; the
  // trough at the right of the yard
  const fold = st => L => {
    const A0 = (x, y) => [0.5 * TILE + x * TILE, 0.5 * TILE + y * TILE]; const P = (x, y, z) => { const q = A0(x, y); return [q[0], q[1], px(z)]; };
    const rc = st === 'nordico' ? '#5a7631' : st === 'egipcio' || st === 'asteca' ? '#caa85c' : 'roof0', re = st === 'nordico' ? '#44591f' : st === 'egipcio' || st === 'asteca' ? '#987e45' : 'roof1';
    const els = [...[[-0.45, -0.45], [0.35, -0.45], [-0.45, 0.35], [0.35, 0.35]].map(([x, y]) => { const q = A0(x, y); return { k: 'bloco', r: [q[0] - 0.12, q[1] - 0.12, q[0] + 0.12, q[1] + 0.12], y0: 0, y1: px(9), cor: WOOD, mat: 'beam' }; }),
      (() => { const a = A0(-0.45, -0.48), b2 = A0(0.35, -0.42); return { k: 'bloco', r: [a[0], a[1], b2[0], b2[1]], y0: 0, y1: px(9), cor: ['#8a6a44', '#6a4e30', '#8a6a44'], mat: 'plankV' }; })(),
      { k: 'pano', p: [P(-0.55, -0.55, 12), P(0.45, -0.55, 12), P(0.45, 0.45, 8), P(-0.55, 0.45, 8)], cor: rc, mat: st === 'nordico' ? 'turf' : 'shingle', grosso: 0.06 },
      (() => { const a = A0(-0.55, 0.45), b2 = A0(0.45, 0.45); return { k: 'bloco', r: [a[0], a[1] - 0.05, b2[0], b2[1]], y0: px(7.2), y1: px(8), cor: [re, re, re] }; })(),
      ...[0, 1, 2].map(k => { const q = A0(-0.3 + k * 0.2, -0.3); return { k: 'bloco', r: [q[0] - 0.36, q[1] - 0.26, q[0] + 0.36, q[1] + 0.26], y0: 0, y1: 0.45, cor: ['#d8b862', '#b8984a', '#e8c872'], mat: 'thatch' }; }),
      ...penFence(L, null, ['#8a6440', '#6a4a2c']), ...troughF(L)];
    return { els };
  };
  for (const st of ['classico', 'grego', 'romano', 'egipcio', 'asteca', 'nordico']) { def('estabulo', st, stable(st)); def('curral', st, fold(st)); }

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
    F = Object.freeze({ type, style: F0[style] ? style : 'classico', L, els: o.els, door: o.door || null, body: o.body || null, top: topOf(o.els) });
    memo.set(key, F); return F;
  };
  Fo.has = (type, style) => !!(FORMS[type] && (FORMS[type][style] || FORMS[type].classico));
  Fo.types = () => Object.keys(FORMS);
  // the highest point of a form (m over the lot's highest ground): its far figure's height and the camera's
  function topOf(els) {
    let t = 0;
    for (const e of els) {
      const y = e.k === 'mastros' ? e.y0 + e.h : e.k === 'estatua' ? Math.max(...Fo.figure(e).map(partTop)) : e.k === 'roda' ? e.y + e.r : e.k === 'flores' ? e.y + 0.2 : e.k === 'palmeira' ? e.p[2] + e.h + 0.5 : e.k === 'aro' ? e.c[2] + e.r + e.t : e.k === 'lamina' ? e.y : e.k === 'braseiro' ? e.p[2] + 0.8 : e.k === 'dragao' ? e.p[2] + 1.1 : e.k === 'escalonada' ? e.niveis[e.niveis.length - 1][2] : e.k === 'arena' ? e.y : e.k === 'cavea' ? Math.max(...e.aneis.map(a => a[1])) : e.k === 'escada' ? Math.max(e.a[2], e.b[2]) : e.k === 'disco' || e.k === 'porta' || e.k === 'janelas' || e.k === 'placa' ? 0 : e.k === 'bandeira' ? e.p[2] + e.h : e.k === 'bola' ? e.c[2] + e.r : e.k === 'tora' ? Math.max(e.a[2], e.b[2]) + e.r : e.k === 'pano' ? Math.max(...e.p.map(q => q[2])) : e.k === 'letreiro' ? e.p[2] + 0.3 : e.k === 'banco' ? e.y : e.y1;
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
      else if (e.k === 'tina' || e.k === 'bacia' || e.k === 'morro') out.push({ k: 'circ', c: e.c, r: e.r });
      else if (e.k === 'banco') out.push({ k: 'rect', r: e.r });
    }
    return out;
  };
  // the far figure of a form: its masses alone, the simplest solids that keep its silhouette — a box, a battered block, a
  // pyramid, a drum, a gable roof, a round (tronco: from a [u, v, y], r0 round, to b, r1 round), a sheet (pano: its points) —
  // in the canonical frame:
  // [{ k, … }]
  Fo.mass = function (F) {
    const out = [];
    for (const e of F.els) {
      if (e.k === 'bloco') out.push({ k: 'box', r: e.r, y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'talude') out.push({ k: 'talude', r: e.r, r1: e.r1, y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'piramide') out.push({ k: 'piramide', c: e.c, e: e.e, y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'escalonada') for (const [s, y0, y1] of e.niveis) out.push({ k: 'box', r: [e.c[0] - s, e.c[1] - s, e.c[0] + s, e.c[1] + s], y0, y1, cor: e.cor[0] });
      else if (e.k === 'tambor') out.push({ k: 'anel', c: e.c, r: e.r, t: Math.max(e.t, e.r * 0.5), y0: e.y0, y1: e.y1, cor: e.cor[0] });
      else if (e.k === 'telhado') out.push({ k: 'telhado', r: e.r, y0: e.y0, y1: e.y1, ao: e.ao, ov: e.ov, quatro: !!e.quatro, cor: e.cor[0] });
      else if (e.k === 'tina' || e.k === 'bacia') out.push({ k: 'tronco', a: [e.c[0], e.c[1], e.y0], b: [e.c[0], e.c[1], e.y1], r0: e.r, r1: e.r, cor: e.cor });
      else if (e.k === 'banco') out.push({ k: 'box', r: e.r, y0: 0, y1: e.y, cor: e.cor });
      else if (e.k === 'morro') for (let k = 0; k < 4; k++) { const a = Fo.dome(k / 4), b = Fo.dome((k + 1) / 4); out.push({ k: 'tronco', a: [e.c[0], e.c[1], e.y0 + (e.y1 - e.y0) * a[1]], b: [e.c[0], e.c[1], e.y0 + (e.y1 - e.y0) * b[1]], r0: e.r * a[0], r1: Math.max(0.02, e.r * b[0]), cor: e.cor[0] }); }
      else if (e.k === 'tora') out.push({ k: 'tronco', a: e.a, b: e.b, r0: e.r, r1: e.r, cor: e.cor });
      else if (e.k === 'pano') out.push({ k: 'pano', p: e.p, cor: e.cor });
      else if (e.k === 'bandeira') out.push({ k: 'tronco', a: e.p, b: [e.p[0], e.p[1], e.p[2] + e.h], r0: 0.06, r1: 0.05, cor: '#5a3c22' });
      else if (e.k === 'bola') out.push({ k: 'tronco', a: [e.c[0], e.c[1], e.c[2] - 0.7 * e.r], b: [e.c[0], e.c[1], e.c[2] + 0.7 * e.r], r0: e.r, r1: e.r, cor: e.cor });
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
  // ------------------------------ the plan's questions (D-093) ------------------------------
  // What the plan of a type with a form reads of it to put its function there — never a shell of its own (D-093). Pure: of the
  // type and the people alone (the form is the same for every building of them), in the form's frame — the plan's, In.toLoc's:
  // u across, v from the back, the entrance at v = L —, before it is turned to the street's side; metres over the lot's
  // highest ground. Each answer kept with its form, frozen
  const asked = new WeakMap();
  const keep = (F, k, fn) => { let m = asked.get(F); if (!m) asked.set(F, m = {}); if (!(k in m)) m[k] = Object.freeze(fn()); return m[k]; };
  const lowFoot = y => y <= 0.15; // (standing on the ground: on it, or on the square's pavement)
  const HEAD = 1.9; // (what is lower than this over the ground is in the body's way: a person of 1.75 m and a hand)
  // the pieces one uses: [{ uso: 'fonte' | 'tribuna' | 'banco' | 'acender' (a brazier), r: [u0, v0, u1, v1] — its foot —, pe — the
  // foot of what it stands on, when it stands on something of the form (a brazier's stand) —, c, rad — a round one's middle
  // and reach —, y1 — its top: where one stands or sits, the rim one drinks at —, vira [du, dv] — the way one faces using it —,
  // escada — the treads up to the top of a high one, from the lowest: [{ r, y1 }] }]
  Fo.uses = F => keep(F, 'uses', () => {
    const out = [];
    for (const e of F.els) {
      if (!e.uso) continue; const u = { uso: e.uso, vira: e.vira || null };
      if (e.k === 'bacia') Object.assign(u, { r: [e.c[0] - e.r, e.c[1] - e.r, e.c[0] + e.r, e.c[1] + e.r], c: e.c.slice(), rad: e.r, y1: e.y1 });
      else if (e.k === 'braseiro') { Object.assign(u, { r: [e.p[0] - e.r, e.p[1] - e.r, e.p[0] + e.r, e.p[1] + e.r], c: [e.p[0], e.p[1]], rad: e.r, y1: e.p[2] + 0.72 }); // (its bowl's rim)
        const st = e.p[2] > 0.02 && F.els.find(q => q.k === 'bloco' && Math.abs(q.y1 - e.p[2]) < 0.02 && e.p[0] > q.r[0] && e.p[0] < q.r[2] && e.p[1] > q.r[1] && e.p[1] < q.r[3]); if (st) u.pe = st.r.slice(); }
      else Object.assign(u, { r: e.r.slice(), y1: e.k === 'banco' ? e.y : e.y1 });
      const st = F.els.filter(q => q.degrau === e.uso).map(q => ({ r: q.r.slice(), y1: q.y1 })).sort((a, b) => a.y1 - b.y1);
      if (st.length) u.escada = st;
      out.push(u);
    }
    return out;
  });
  // what stands solid on the ground of the form, for the plan to keep the body and its marks off it: [{ k: 'rect', r, y1 } |
  // { k: 'circ', c, r, y1 }] — not its floors (piso), its treads (degrau), its pieces of use, nor what stands in one of them (the
  // fountain's column in its basin), nor its body (Fo.body: the walls, the porch and the plinth the plan raises its shell on);
  // what hangs over the ground higher than one's head (a roof, an architrave) is not in it
  Fo.solids = F => keep(F, 'solids', () => {
    const uses = Fo.uses(F); const B = Fo.body(F); const out = [];
    const inside = (r, u, v) => u > r[0] && u < r[2] && v > r[1] && v < r[3];
    const inUse = (u, v) => uses.some(q => inside(q.r, u, v)) || (B && (inside(B.r, u, v) || (B.base && inside(B.base.r, u, v)) || (B.portico && inside(B.portico.r, u, v))));
    const rectOf = (r, y1) => { if (!inUse((r[0] + r[2]) / 2, (r[1] + r[3]) / 2)) out.push({ k: 'rect', r: r.slice(), y1 }); };
    const circOf = (c, r, y1) => { if (!inUse(c[0], c[1])) out.push({ k: 'circ', c: [c[0], c[1]], r, y1 }); };
    for (const e of F.els) {
      if (e.piso || e.degrau || e.uso) continue;
      if ((e.k === 'bloco' || e.k === 'talude') && e.y0 < HEAD && e.y1 > 0.15) rectOf(e.r, e.y1); // (a counter, a ledge: what the body cannot pass under)
      else if (e.k === 'pedra' && lowFoot(e.y0)) rectOf([e.c[0] - e.e, e.c[1] - e.e, e.c[0] + e.e, e.c[1] + e.e], e.y1);
      else if ((e.k === 'coluna' || e.k === 'tina' || e.k === 'bacia' || e.k === 'tambor' || e.k === 'morro') && lowFoot(e.y0)) circOf(e.c, e.r, e.y1);
      else if (e.k === 'colunata' && lowFoot(e.y0)) for (const p of e.pts) circOf(p, e.r, e.y1);
      else if (e.k === 'piramide' && lowFoot(e.y0)) rectOf([e.c[0] - e.e, e.c[1] - e.e, e.c[0] + e.e, e.c[1] + e.e], e.y1);
      else if (e.k === 'escalonada') { const s0 = e.niveis[0][0]; rectOf([e.c[0] - s0, e.c[1] - s0, e.c[0] + s0, e.c[1] + s0], e.niveis[0][2]); }
      else if (e.k === 'estatua' && lowFoot(e.p[2])) circOf(e.p, Math.max(0.25, (e.w || 0.2) * 1.1), e.p[2] + e.h);
      else if (e.k === 'palmeira' && lowFoot(e.p[2])) circOf(e.p, 0.15, e.p[2] + e.h);
      else if (e.k === 'tora' && (lowFoot(e.a[2]) || lowFoot(e.b[2]))) { const lo = e.a[2] <= e.b[2] ? e.a : e.b; circOf(lo, e.r, Math.max(e.a[2], e.b[2])); }
      else if (e.k === 'bandeira' && lowFoot(e.p[2])) circOf(e.p, 0.06, e.p[2] + e.h);
    }
    return out;
  });
  // the body of a form one goes in by its door — or null: { r — its walls' foot —, r1 — their top, a battered wall's —, y0 — the
  // floor —, y1 — the eaves: where the roof starts over the walls (over an entablature, its top: the walls of the plan rise to
  // it) —, tabuas — walls of planks —, porta: { u, w, y0, y1 } on the front face (v = r[3]), janelas: [{ na: 'frente' |
  // 'fundo' | 'direita' | 'esquerda', de, ate (along the face), y0, y1 }] (but the pane of the god's row over the door: its
  // top's, not an opening of its own), portico: { r, y1 (the ceiling),
  // colunas: [{ c, r }] } or null, peristilo: the same round the walls (a Greek temple's) or null; patio: { r, colunas } — an
  // open court before the walls (the Egyptian temple's) —, portao: { r (its passage), u, w, y0, y1, v (its face) } — the street's
  // door where it is another than the walls' (the pylon's gate) —, torres: [r] (its towers), or null; base: { r, h, degraus? } —
  // the plinth under the floor, and its own steps from the ground ([{ r, y1 }]: a crepidoma's) —, degraus: [{ r, y1 }] — the treads from the
  // street up to it, from the lowest —, telhado: { tipo: 'duas-aguas' | 'quatro-aguas' | 'turfa' | 'plano', r, y0, y1, ao, ov } }
  Fo.body = F => (F.body ? keep(F, 'body', () => {
    const B = F.body, w = B.walls, r = w.r; const tol = 0.3;
    const face = { frente: r[3], fundo: r[1], direita: r[2], esquerda: r[0] };
    const janelas = [];
    for (const e of F.els) {
      if (e.k !== 'janelas' || face[e.na] === undefined || Math.abs(e.em - face[e.na]) > tol) continue;
      if (!e.n) { janelas.push({ na: e.na, de: e.de, ate: e.ate, y0: e.y0, y1: e.y1 }); continue; }
      const g = (e.ate - e.de) / (e.n * 2 + 1); for (let k = 0; k < e.n; k++) janelas.push({ na: e.na, de: e.de + g * (1 + 2 * k), ate: e.de + g * (2 + 2 * k), y0: e.y0, y1: e.y1 });
    }
    const D = B.porta || F.door; const onDoor = j => !!D && j.na === 'frente' && j.de < D.u + D.w / 2 && j.ate > D.u - D.w / 2 && j.y0 < D.y1 && j.y1 > D.y0;
    for (let k = janelas.length - 1; k >= 0; k--) if (onDoor(janelas[k])) janelas.splice(k, 1);
    const cu = (r[0] + r[2]) / 2, cv = (r[1] + r[3]) / 2;
    const rf = F.els.find(e => e.k === 'telhado' && cu > e.r[0] && cu < e.r[2] && cv > e.r[1] && cv < e.r[3]);
    const telhado = rf ? { tipo: rf.quatro ? 'quatro-aguas' : rf.mat === 'turf' ? 'turfa' : 'duas-aguas', r: rf.r.slice(), y0: rf.y0, y1: rf.y1, ao: rf.ao, ov: rf.ov || 0 } : { tipo: 'plano', r: r.slice(), y0: w.y1, y1: w.y1, ao: null, ov: 0 };
    const P = B.porch;
    const D0 = B.porta || F.door;
    return { r: r.slice(), r1: w.r1 ? w.r1.slice() : null, y0: w.y0, y1: Math.max(w.y1, telhado.y0), tabuas: !!w.tabuas, porta: D0 ? { u: D0.u, w: D0.w, y0: D0.y0, y1: D0.y1 } : null, janelas,
      patio: B.court ? { r: B.court.r.slice(), colunas: B.court.cols.pts.map(q => ({ c: q.slice(), r: B.court.cols.r })) } : null,
      portao: B.gate ? { r: B.gate.r.slice(), u: B.gate.u, w: B.gate.w, y0: B.gate.y0, y1: B.gate.y1, v: B.gate.v } : null, torres: B.towers ? B.towers.map(q => q.slice()) : null,
      portico: P ? { r: P.r.slice(), y1: P.y1, colunas: P.cols.pts.map(q => ({ c: q.slice(), r: P.cols.r })) } : null,
      peristilo: B.peristyle ? { r: B.peristyle.r.slice(), y1: B.peristyle.y1, colunas: B.peristyle.cols.pts.map(q => ({ c: q.slice(), r: B.peristyle.cols.r })) } : null,
      base: B.base ? Object.assign({ r: B.base.r.slice(), h: B.base.y1 }, B.base.degraus ? { degraus: B.base.degraus.map(q => ({ r: q.r.slice(), y1: q.y1 })) } : {}) : null, degraus: (B.steps || []).map(q => ({ r: q.r.slice(), y1: q.y1 })).sort((a, b) => a.y1 - b.y1), telhado };
  }) : null);
  // the faces of a hip roof (the god's hip): its four slopes from the eaves — r out by ov, at y0 — to the ridge at y1 along its
  // longer way, as long as the longer side less the shorter: [{ p: [[u, v, y], …], n: [du, dv, up] }] (the way each faces)
  Fo.hip = function (r, y0, y1, ov) {
    const X0 = r[0] - ov, X1 = r[2] + ov, Y0 = r[1] - ov, Y1 = r[3] + ov; const lx = X1 - X0, ly = Y1 - Y0; const up = Math.min(lx, ly) / 2 / Math.max(0.01, y1 - y0);
    if (lx >= ly) { const d = ly / 2, ym = (Y0 + Y1) / 2; const a = [X0 + d, ym, y1], b = [X1 - d, ym, y1];
      return [{ p: [[X0, Y1, y0], [X1, Y1, y0], b, a], n: [0, 1, up] }, { p: [[X1, Y0, y0], [X0, Y0, y0], a, b], n: [0, -1, up] }, { p: [[X0, Y0, y0], [X0, Y1, y0], a], n: [-1, 0, up] }, { p: [[X1, Y1, y0], [X1, Y0, y0], b], n: [1, 0, up] }]; }
    const d = lx / 2, xm = (X0 + X1) / 2; const a = [xm, Y0 + d, y1], b = [xm, Y1 - d, y1];
    return [{ p: [[X1, Y0, y0], [X1, Y1, y0], b, a], n: [1, 0, up] }, { p: [[X0, Y1, y0], [X0, Y0, y0], a, b], n: [-1, 0, up] }, { p: [[X0, Y1, y0], [X1, Y1, y0], b], n: [0, 1, up] }, { p: [[X1, Y0, y0], [X0, Y0, y0], a], n: [0, -1, up] }];
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
  // the god's dome (arch.js dome: its outline from its foot up to its top, the curve of two bends), at t of the way along it —
  // [its round's share, its height's share]: the hill a mine is (morro), its far figure, the god's own picture of it
  Fo.dome = function (t) {
    const s = Math.max(0, Math.min(1, t)), a = 1 - s; const b = [a * a * a, 3 * a * a * s, 3 * a * s * s, s * s * s];
    return [b[0] + b[1] + b[2] * 0.45, b[1] * 0.62 + b[2] + b[3]];
  };
  // (for the proofs: the god's units of a form's number)
  Fo.px = y => y * ZPX;
})(window.G);
