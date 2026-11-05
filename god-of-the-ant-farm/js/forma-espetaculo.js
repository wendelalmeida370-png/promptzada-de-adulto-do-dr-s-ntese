'use strict';
// ============================================================
//  Forma, the steps of spectacle and wonder (D-106; the
//  specialist M1): the forms of the bigger steps of the ladders
//  of the amphitheatre and the theatres, the wonders of each
//  people (the Colosseum, the Great Pyramid, the Templo Mayor…)
//  and the monuments — put in by G.Forma.def(type, style,
//  fn(L, n), sizes). Pure as js/forma.js (rule 36): no chance,
//  no world, no 3D; the body's rules hold at every size (a
//  step of 0.30 m at most, a public door of 2.2 m at least).
// ============================================================
(function (G) {
  const Fo = G.Forma; if (!Fo) return;
  const TAU = Math.PI * 2, HALF = Math.PI / 2;
  const k3 = x => Math.round(x * 1000) / 1000;
  // ------------------------------ the pieces this file adds to the vocabulary (js/forma.js) ------------------------------
  //   arcada  the arcaded ring of a building round an arena (the Colosseum's facade): pts — the corners of its outer face,
  //           round it from +u toward +v, closed (each side one bay, flat) —, pts1 — the corners of its inner face, the same
  //           count, each the one across from its fellow (each bay a prism from pts[k], pts[k+1] to pts1[k], pts1[k+1]) —,
  //           y0..y1 (a foot on the ground reaches the lot's lowest ground, as every piece's), andares: its storeys from the
  //           ground up, [{ y0, y1, arco: { w (its share of the bay), a, b (shares of the storey's height: its sill — 0, the
  //           ground — and the top of its round head) } | null, janela: { w (metres), a, b, cada (every so many bays) } |
  //           null, ordem: 'toscana' | 'jonica' | 'corintia' | 'pilastra' (the half-columns, or the pilasters, at the
  //           piers) }]; each arch is dark behind (the galleries the god draws: closed) but on the bays of abertos (their
  //           numbers: the bay k from pts[k] to pts[k+1]), whose ground arch is a way in, through the ring's whole depth —
  //           its soffit the passage's vault —; dentro: { y0 } — its inner face, from y0 up (under it the seats lean on it;
  //           no face there), with the same storeys' arches, dark behind —; cor [lit, shaded], escuro (the dark), mat
  //   areia   the floor of an arena whose outline is no circle: pts — its edge, round it, closed —, c (its middle), y (its
  //           top), d (its thickness: its underside, over the undercroft, d lower), cor, buracos: [[u0, v0, u1, v1], …] —
  //           the openings in it (the hatch over the undercroft's flight)
  //   (piramide entrada { u, w, y0, y1 }: an opening through its front face — a way in, its corridor behind it —, not painted
  //   on it as the sealed door is (D-108); oculto on any piece: inside a mass — the pyramid's corridor, its gallery, its
  //   chamber —, seen only from within: the god does not paint it, the 3D draws it for whoever goes in)
  // ------------------------------ the split oval (the Colosseum's plan: D-107) ------------------------------
  // An amphitheatre is an oval of four centres, as the Colosseum is drawn: two small arcs about the ends of its long axis
  // (along u, across the lot) and two big ones along its sides, each pair tangent where they meet — on the line through both
  // their centres —; the arena's edge, every row of seats and the facade the same oval moved out by as much (the same
  // centres, the radii grown by d). Split on its two axes — its quarters pulled apart, g along u and h along v —, its four
  // ways in run straight through it to the arena, square to the lot: the plan's flights and walls are square to it, and so
  // are the walls of each passage (the ends of the rows either side, each on the line through its arc's centre) and their
  // parapets. → its numbers, and its outline as primitives — the four straight bits and the eight arcs, from the right end
  // of the long axis round it from +u toward +v —, each at any offset d out of the arena's edge
  const QUADS = [[1, 1], [-1, 1], [-1, -1], [1, -1]]; // (the quarters from +u toward +v: front-right, front-left, back-left, back-right)
  function ovalOf(L) {
    const cu = L / 2, cv = L / 2, g = 2.8, h = 2.8; // (the ways in: a passage of 2.8 m, the axial arch's)
    const D = k3(0.21 * L), t = k3(0.035 * L), Ao = L / 2 - 1.5; // (the depth from the arena's edge to the facade, the facade's own, its long half axis: 1.5 m off the lot's ends — the square's way round them)
    const Aa = Ao - g / 2 - D, Ba = 0.6 * Aa, rs = 0.7 * Ba; // (the arena's half axes before the split; its small radius)
    const a = Aa - rs, e = Ba - rs, b = (a * a - e * e) / (2 * e), rb = Ba + b, phi = Math.atan2(b, a); // (the small arcs' centres a out along u, the big ones' b back along v: tangent at phi)
    const prims = [];
    const line = (p0, p1, n) => prims.push({ k: 'reta', p0, p1, n });
    // (each arc with the canonical angles it spans about its centre — the cávea's arco over it, the polygon the 3D draws its
    // edges on: the plan's walls round the sand follow it, L-599)
    const arc = (c, r0, su, sv, t0, t1) => prims.push({ k: 'arco', c, r0, su, sv, t0, t1, arco: arcOf(su, sv, Math.min(t0, t1), Math.max(t0, t1)) });
    const Au = Aa + g / 2, Bv = Ba + h / 2; // (the arena's half axes, split)
    line([cu + Au, cv], [cu + Au, cv + h / 2], [1, 0]);
    arc([cu + a + g / 2, cv + h / 2], rs, 1, 1, 0, phi); arc([cu + g / 2, cv + h / 2 - b], rb, 1, 1, phi, HALF);
    line([cu + g / 2, cv + Bv], [cu - g / 2, cv + Bv], [0, 1]);
    arc([cu - g / 2, cv + h / 2 - b], rb, -1, 1, HALF, phi); arc([cu - a - g / 2, cv + h / 2], rs, -1, 1, phi, 0);
    line([cu - Au, cv + h / 2], [cu - Au, cv - h / 2], [-1, 0]);
    arc([cu - a - g / 2, cv - h / 2], rs, -1, -1, 0, phi); arc([cu - g / 2, cv - h / 2 + b], rb, -1, -1, phi, HALF);
    line([cu - g / 2, cv - Bv], [cu + g / 2, cv - Bv], [0, -1]);
    arc([cu + g / 2, cv - h / 2 + b], rb, 1, -1, HALF, phi); arc([cu + a + g / 2, cv - h / 2], rs, 1, -1, phi, 0);
    line([cu + Au, cv - h / 2], [cu + Au, cv], [1, 0]);
    return { L, cu, cv, g, h, D, t, Aa, Ba, Au, Bv, rs, rb, a, b, phi, prims };
  }
  // (a primitive's point at the share f of it, d out of the arena's edge; its length there)
  const primAt = (q, f, d) => (q.k === 'reta' ? [q.p0[0] + (q.p1[0] - q.p0[0]) * f + q.n[0] * d, q.p0[1] + (q.p1[1] - q.p0[1]) * f + q.n[1] * d]
    : (() => { const th = q.t0 + (q.t1 - q.t0) * f; return [q.c[0] + (q.r0 + d) * q.su * Math.cos(th), q.c[1] + (q.r0 + d) * q.sv * Math.sin(th)]; })());
  const primLen = (q, d) => (q.k === 'reta' ? Math.hypot(q.p1[0] - q.p0[0], q.p1[1] - q.p0[1]) : (q.r0 + d) * Math.abs(q.t1 - q.t0));
  // (the outline d out, closed, round it: each straight bit its two ends, each arc a point every `step` radians at most)
  function outline(O, d, step) {
    const out = [];
    for (const q of O.prims) { const m = q.k === 'reta' ? 1 : Math.max(1, Math.ceil(Math.abs(q.t1 - q.t0) / (step || 0.07))); for (let j = 0; j < m; j++) out.push(primAt(q, j / m, d).map(k3)); }
    return out;
  }
  // (the same, as its sides: [{ a, b, i }] — i the primitive each is of: the plan's walls along the arena's edge, d out of it)
  function sides(O, d, step) {
    const out = [];
    O.prims.forEach((q, i) => { const m = q.k === 'reta' ? 1 : Math.max(1, Math.ceil(Math.abs(q.t1 - q.t0) / (step || 0.14))); for (let j = 0; j < m; j++) out.push({ a: primAt(q, j / m, d).map(k3), b: primAt(q, (j + 1) / m, d).map(k3), i }); });
    return out;
  }
  // (the bays of a ring d out: n of them, as long each along it, one centred on each axis — the right end's the last, from
  // the corner n-1 to the corner 0 —: each corner where it falls on the outline, as a primitive and a share of it, to be put at
  // any offset)
  function bays(O, d, n) {
    const lens = O.prims.map(q => primLen(q, d)); const tot = lens.reduce((s, x) => s + x, 0); const W = tot / n; const out = [];
    for (let k = 0; k < n; k++) { let s = (k + 0.5) * W, i = 0; while (i < lens.length - 1 && s > lens[i]) { s -= lens[i]; i++; } out.push({ i, f: Math.min(1, s / lens[i]) }); }
    return { W, tot, at: out };
  }
  // (the canonical angles a local range of a quarter's arc spans — local from its axis along u toward its axis along v —,
  // from +u toward +v, the smaller first)
  function arcOf(su, sv, t0, t1) {
    const ang = th => Math.atan2(sv * Math.sin(th) + 0, su * Math.cos(th));
    let a0 = ang(t0), a1 = ang(t1); if (su * sv < 0) [a0, a1] = [a1, a0];
    while (a1 <= a0) a1 += TAU; return [k3(a0), k3(a1)];
  }
  // ------------------------------ the Colosseum (maravilha, romano: the steps of 10 and 13 tiles) ------------------------------
  // The amphitheatre of a capital, on a lot of 40 m (52 m, the colossal), its plan the split oval: the square of travertine
  // round it, its posts along the lot's edges (the cippi) but where the way in comes from the street, 1.5 m of it at least
  // between the facade and the lot's ends (the way round them); the facade — three storeys of arches, the Tuscan, the Ionic
  // and the Corinthian, each bay ~4.5 m and its arch ~2.7 × 5.7 m on the ground, and the attic with its windows and the masts
  // of the awning over its piers —, open at the four ends of the axes, the ways in, through its whole depth; the arena of more
  // than 20 × 12 m, its sand 2.4 m over the ground — the undercroft under it, at the ground's level: the long corridor from the
  // right way in, the cross one, the beasts' cages either side behind bars, the flight up through the hatch to the sand —; the
  // podium 2.5 m over the sand, its walk behind its parapet; the rows of seats from it to the facade (0.42 m high, 0.72 m deep:
  // the body's), an aisle up each of their eight wedges — the top ring of a wedge is its top row and the walk behind it: its
  // aisle's steps within a row's depth (the next ring's), the walk flat —; the passages through it on the axes, the front and
  // the back ones with the flight up to the podium's landing, the left with the flight up to the gate of the sand (the Porta
  // Triumphalis), the right into the undercroft; over the left and the right ones, the podium's bridges; a parapet wherever
  // the floor falls more than a metre. → the elements, and the numbers the plan reads (amphi.oval)
  const TRAV = ['#e8d2a6', '#b89a70'], SEAT = '#c8b8a0', RISER = '#b8a888', STONE = ['#c8b8a0', '#a89880', '#d8c8b0'];
  const YA = 2.4, POD = 2.5, RISE = 0.42, TREAD = 0.72; // (the sand over the ground, the podium over the sand, a row of seats)
  function coliseu(L, n) {
    const O = ovalOf(L); const { cu, cv, g, h, D, t, Au, Bv, rs, rb, phi } = O;
    const ya = YA, yb = YA + POD, dp = k3(0.03 * L); const rows = Math.floor((D - t - dp - 0.7) / TREAD + 1e-9); const yTop = k3(yb + rows * RISE); // (the walk behind the top row: 0.7 m at least)
    // (the storeys of the facade: the ground's up to the top of the seats — its arches as tall as the Colosseum's, twice as
    // high as wide —, the two over it, the attic)
    const s1 = k3(yTop + 0.135 * L), s2 = k3(s1 + 0.125 * L), H = k3(s2 + 0.07 * L);
    const andares = [
      { y0: 0, y1: yTop, arco: { w: 0.6, a: 0, b: 0.725 }, ordem: 'toscana' },
      { y0: yTop, y1: s1, arco: { w: 0.6, a: 0.175, b: 0.725 }, ordem: 'jonica' },
      { y0: s1, y1: s2, arco: { w: 0.6, a: 0.175, b: 0.725 }, ordem: 'corintia' },
      { y0: s2, y1: H, janela: { w: 0.7, a: 0.3, b: 0.65, cada: 2 }, ordem: 'pilastra' },
    ];
    const els = [];
    // (the square: the travertine over the lot, a step from the street; the posts along its edges)
    els.push({ k: 'bloco', r: [0.04, 0.04, L - 0.04, L - 0.04], y0: 0, y1: 0.04, cor: ['#e2d8c0', '#cbbf9f', '#e8dec8'], mat: 'slab', piso: 1 });
    const way = [cu - 2.4, cu + 2.4]; // (the way in from the street, at the front: as wide as an axial bay's arch and a stride either side)
    for (let x = 1.2; x <= L - 1.2 + 1e-6; x += 2.8) for (const [u, v] of [[x, L - 0.3], [x, 0.3], [0.3, x], [L - 0.3, x]]) {
      if (v > L - 1 && u > way[0] - 0.5 && u < way[1] + 0.5) continue;
      els.push({ k: 'coluna', c: [k3(u), k3(v)], r: 0.17, y0: 0, y1: 0.95, cor: ['#e8dcc0', '#c8b890'], mat: 'base' });
    }
    // (the undercroft: the long corridor, the cross one, their walls under the sand — 0.2 m thick, up to the sand's underside —,
    // the cages behind the long one's walls, a barred window onto it each; the flight up to the hatch, rising to the front)
    const yc = ya - 0.2, wt = 0.2;
    const wall = (r, y0, y1, cor, o) => els.push(Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(y0), y1: k3(y1), cor: cor || STONE, mat: 'ashlar' }, o));
    for (const sv of [1, -1]) {
      const v0 = sv > 0 ? cv + h / 2 : cv - h / 2 - wt;
      for (const [u0, u1] of [[cu - Au, cu - g / 2 - wt], [cu + g / 2 + wt, cu + Au]]) wall([u0, v0, u1, v0 + wt], 0, yc);
      const w0 = sv > 0 ? cv + h / 2 : cv - O.Bv; const w1 = sv > 0 ? cv + O.Bv : cv - h / 2;
      for (const su of [1, -1]) { const u0 = su > 0 ? cu + g / 2 : cu - g / 2 - wt; wall([u0, w0, u0 + wt, w1], 0, yc); }
    }
    const cages = cagesOf(O); const ch = 1.6;
    for (const c of cages) {
      const vin = c.sv > 0 ? cv + h / 2 + wt : cv - h / 2 - wt, vout = vin + c.sv * ch; const lo = Math.min(vin, vout), hi = Math.max(vin, vout);
      // (its two sides and its back, each kept for the plan too — its walls the same, L-600)
      c.walls = [[c.u0 - wt, lo, c.u0, hi], [c.u1, lo, c.u1 + wt, hi], [c.u0 - wt, c.sv > 0 ? hi : lo - wt, c.u1 + wt, c.sv > 0 ? hi + wt : lo]].map(q => q.map(k3));
      for (const q of c.walls) wall(q, 0, yc);
      els.push({ k: 'janelas', na: c.sv > 0 ? 'fundo' : 'frente', em: k3(c.sv > 0 ? cv + h / 2 : cv - h / 2), de: k3(c.u0 + 0.4), ate: k3(c.u1 - 0.4), y0: 0.9, y1: 1.9, n: 0, grade: 6 });
    }
    // (a flight's treads, each a block from the ground to its top — no riser over 0.225: m of them —, the way up dir: along v
    // (du 0) rising to dv, along u rising to du)
    const flight = (r, rise, du, dv) => { const m = Math.ceil(rise / 0.225 - 1e-9); const out = [];
      for (let j = 0; j < m; j++) { const f0 = j / m, f1 = (j + 1) / m; let q;
        if (du) q = du > 0 ? [r[0] + (r[2] - r[0]) * f0, r[1], r[0] + (r[2] - r[0]) * f1, r[3]] : [r[2] - (r[2] - r[0]) * f1, r[1], r[2] - (r[2] - r[0]) * f0, r[3]];
        else q = dv > 0 ? [r[0], r[1] + (r[3] - r[1]) * f0, r[2], r[1] + (r[3] - r[1]) * f1] : [r[0], r[3] - (r[3] - r[1]) * f1, r[2], r[3] - (r[3] - r[1]) * f0];
        out.push({ k: 'bloco', r: q.map(k3), y0: 0, y1: k3(rise * (j + 1) / m), cor: STONE, mat: 'slab', degrau: 1 }); }
      return { m, out }; };
    const TR = 0.25; // (a tread's depth: 0.25 m — 0.22 up, 42°)
    const hypo = (() => { const m = Math.ceil(ya / 0.225 - 1e-9), run = m * TR; const v0 = cv + h / 2 + 0.75; return { r: [cu - g / 2, v0, cu + g / 2, v0 + run].map(k3), m, run }; })();
    els.push(...flight(hypo.r, ya, 0, 1).out);
    const hatch = [hypo.r[0], k3(hypo.r[1] + hypo.run * (ya - 0.2 - 1.9) / ya), hypo.r[2], hypo.r[3]]; // (over its upper part: where a head would meet the sand's underside)
    // (the flights up to the podium's landings, in the front and the back passages, rising toward the arena; the gate's up to
    // the sand in the left passage, rising toward it; their treads; the landings — solid from the ground —, the bridges over
    // the left and the right passages at the podium, 0.3 m thick; the end wall of the arena over the right passage)
    const ways = {};
    for (const sv of [1, -1]) {
      const m = Math.ceil(yb / 0.225 - 1e-9), run = m * TR; const e0 = cv + sv * Bv, e1 = e0 + sv * dp; // (the arena's edge, the landing's outer edge)
      const r = sv > 0 ? [cu - g / 2, e1, cu + g / 2, e1 + run] : [cu - g / 2, e1 - run, cu + g / 2, e1];
      ways[sv > 0 ? 'frente' : 'fundo'] = { r: r.map(k3), m, run, landing: [cu - g / 2, Math.min(e0, e1), cu + g / 2, Math.max(e0, e1)].map(k3) };
      els.push(...flight(r, yb, 0, -sv).out);
      wall(ways[sv > 0 ? 'frente' : 'fundo'].landing, 0, yb, STONE, { mat: 'slab' });
    }
    for (const su of [1, -1]) {
      const e0 = cu + su * Au, e1 = e0 + su * dp; const br = [Math.min(e0, e1), cv - h / 2, Math.max(e0, e1), cv + h / 2].map(k3);
      wall(br, yb - 0.3, yb, STONE, { mat: 'slab' });
      // (the passage's vault, from the bridge out to the facade's inner face at the bridge's height: under the rows either side
      // the passage is a tunnel — from it the sky showed between the rows' ends, a blue gap beside the bridge)
      const ef = cu + su * (Au + D - t); wall([Math.min(e1, ef), cv - h / 2, Math.max(e1, ef), cv + h / 2], yb - 0.3, yb, STONE, { mat: 'slab' });
      if (su < 0) { const m = Math.ceil(ya / 0.225 - 1e-9), run = m * TR; const r = [e0 - run, cv - h / 2, e0, cv + h / 2].map(k3); els.push(...flight(r, ya, 1, 0).out); ways.esquerda = { r, m, run, bridge: br }; }
      else { wall([e0, cv - h / 2, e0 + wt, cv + h / 2], yc, yb - 0.3); ways.direita = { bridge: br }; }
    }
    // (the arena: its sand on the split oval's edge, the hatch open in it)
    els.push({ k: 'areia', c: [cu, cv], pts: outline(O, 0, 0.07), y: ya, d: 0.2, cor: '#e8d8a8', buracos: [hatch] });
    // (the seats: of each quarter, the podium's walk on each of its two arcs — its parapet over the sand — and the rows over it to
    // the facade, an aisle up the middle of each: each a part of the round about its own centre, its ends — the passages' walls,
    // and the line where the two arcs of a quarter meet — on the lines through it, from the ground)
    // (the emperor's box — the pulvinar, D-125 —: either side of the back landing, on the minor axis, the first two rows taken
    // out of the back's big arcs along BOX m of the first row: its floor the podium's walk carried two rows deep, at its height;
    // the third row over it its back, with the parapet on its edge (a drop of three rows) — no seat on it: one seated there
    // has the parapet's top over his eyes —; in the right one the throne against it, in the left one the court's bench. Its
    // parts at the end of each arc by the passage, the rows' aisle clear of it)
    const BOX = 2.5, boxes = [];
    const blocks = [];
    for (const [su, sv] of QUADS) for (const small of [true, false]) {
      const r0 = small ? rs : rb; const c = small ? [cu + su * (O.a + g / 2), cv + sv * h / 2] : [cu + su * g / 2, cv + sv * (h / 2 - O.b)];
      const arco = small ? arcOf(su, sv, 0, phi) : arcOf(su, sv, phi, HALF); const mid = k3((arco[0] + arco[1]) / 2);
      const box = !small && sv < 0, dB = BOX / (r0 + dp); const span = box ? (su > 0 ? [arco[0], k3(arco[0] + dB)] : [k3(arco[1] - dB), arco[1]]) : null;
      const rest = box ? (su > 0 ? [span[1], arco[1]] : [arco[0], span[0]]) : arco;
      els.push({ k: 'cavea', c: c.map(k3), aneis: [[k3(r0 + dp), yb]], fundo: k3(r0), cor: SEAT, parapeito: 0.9, muro: RISER, fecho: SEAT, arco });
      // (the top ring — the top row and the walk behind it — out to the polygon round the facade's inner face, the sides' middles
      // on it and the corners in its stone: on the polygon through it, between the corners the back of the rows stood before the
      // facade's flat bays, up to 0.9 cm in the colossal, L-600)
      const rT = k3((r0 + D - t) / Math.cos(Math.PI / Fo.SEG));
      const aneis = [[rT, yTop]]; for (let j = rows - 1; j >= 1; j--) aneis.push([k3(r0 + dp + j * TREAD), k3(yb + j * RISE)]);
      // (by the box the rows in two pieces: the first three over the rest of the arc, and from the fourth over the whole arc —
      // the box under them —: no end of the rows where they go on over it, which the god would paint as a wall across them)
      const esc = { a: [mid], l: 1.0, n: 2 };
      if (!box) els.push({ k: 'cavea', c: c.map(k3), aneis, fundo: k3(r0 + dp), cor: SEAT, muro: RISER, fecho: SEAT, arco, escadas: esc });
      else els.push({ k: 'cavea', c: c.map(k3), aneis: aneis.slice(-3), fundo: k3(r0 + dp), cor: SEAT, muro: RISER, fecho: SEAT, arco: rest, escadas: esc },
        { k: 'cavea', c: c.map(k3), aneis: aneis.slice(0, -3), fundo: k3(r0 + dp + 3 * TREAD), cor: SEAT, muro: RISER, fecho: SEAT, arco, escadas: esc });
      // (the plan's rows: by the box the first three over the rest of the arc, and from the fourth on the whole arc — the rings the
      // same as the form's pieces; cut in two blocks a row loses a seat at the cut)
      if (!box) blocks.push({ c: c.map(k3), r0: k3(r0 + dp), r1: rT, arco, aisles: [mid], small, su, sv });
      else blocks.push({ c: c.map(k3), r0: k3(r0 + dp), r1: k3(r0 + dp + 3 * TREAD), arco: rest, aisles: [mid], small, su, sv, n: 3 },
        { c: c.map(k3), r0: k3(r0 + dp + 3 * TREAD), r1: rT, arco, aisles: [mid], small, su, sv, skip: 3 });
      if (!box) continue;
      // (the box: its floor; the third row, alone, its parapet on its edge — the parapet of a piece is on every row's edge)
      const rB = k3(r0 + dp + 2 * TREAD), r3 = k3(rB + TREAD), y3 = k3(yb + 3 * RISE);
      els.push({ k: 'cavea', c: c.map(k3), aneis: [[rB, yb]], fundo: k3(r0 + dp), cor: '#d8c8b0', muro: RISER, fecho: SEAT, arco: span });
      els.push({ k: 'cavea', c: c.map(k3), aneis: [[r3, y3]], fundo: rB, cor: SEAT, parapeito: 0.9, muro: RISER, fecho: SEAT, arco: span });
      // (what stands in it, square to the lot — the arc's tilt there under a tenth —: its middle, the riser's line along it)
      const am = (span[0] + span[1]) / 2, at = r => [c[0] + r * Math.cos(am), c[1] + r * Math.sin(am)];
      const seat = (r, w, d, y0, y1, cor, o) => { const [pu, pv] = at(r); return Object.assign({ k: 'bloco', r: [pu - w / 2, pv - d / 2, pu + w / 2, pv + d / 2].map(k3), y0: k3(y0), y1: k3(y1), cor }, o); };
      const MARB = ['#e8e0d0', '#c8c0b0', '#f2ece0'], GILT = ['#e8c060', '#c8a040', '#f2d070'];
      // (the throne: its seat 1.0 × 0.8 m, 0.5 m high — the hips of one seated —, its gilded back, the purple round on it; the
      // court's bench of 2.4 m, four to sit on it — one row: the box is two rows deep, and a second bench would stand on the
      // podium's walk —; each a hand clear of the back's foot)
      if (su > 0) { const rT = rB - 0.17 - 0.4; els.push(seat(rT, 1.0, 0.8, yb, yb + 0.5, MARB), seat(rT + 0.325, 1.0, 0.15, yb + 0.5, yb + 1.6, GILT), { k: 'disco', na: 'frente', u: k3(at(rT)[0]), v: k3(at(rT)[1] - 0.25), y: k3(yb + 1.25), r: 0.22, cor: '#7a2a5a' });
        boxes.push({ su, c: c.map(k3), span, rB, r3, y3, seat: 'trono', r: seat(rT, 1.0, 0.8, 0, 1).r }); }
      else { const bench = seat(rB - 0.18 - 0.2, 2.4, 0.4, yb, yb + 0.45, MARB); els.push(bench); boxes.push({ su, c: c.map(k3), span, rB, r3, y3, seat: 'corte', r: bench.r }); }
    }
    // (the parapets: along the podium's edge where it crosses a passage — the landings', the bridges' —, on the bridges' outer
    // edges, and along each passage's two walls on the rows, step by step — over the drop into the passage —; 0.12 m thick, 0.9
    // m over the floor)
    const PT = 0.12, PH = 0.9, par = (r, y) => wall(r, y, y + PH, STONE, { mat: 'slab' });
    for (const sv of [1, -1]) { const e0 = cv + sv * Bv; par([cu - g / 2, sv > 0 ? e0 : e0 - PT, cu + g / 2, sv > 0 ? e0 + PT : e0], yb); }
    for (const su of [1, -1]) { const e0 = cu + su * Au, e1 = e0 + su * dp; par([su > 0 ? e0 : e0 - PT, cv - h / 2, su > 0 ? e0 + PT : e0, cv + h / 2], yb); par([su > 0 ? e1 - PT : e1, cv - h / 2, su > 0 ? e1 : e1 + PT, cv + h / 2], yb); }
    const steps = j => (j < rows ? [dp + j * TREAD, dp + (j + 1) * TREAD] : null);
    for (const [su, sv] of QUADS) for (let j = 0; j < rows; j++) {
      const [d0, d1] = steps(j); const d1x = j === rows - 1 ? D - t : d1; const y = yb + (j + 1) * RISE;
      // (on the front or back passage: the wall at u = cu + su·g/2, the rows along v; on the left or right one: at v = cv + sv·h/2 —
      // by the box, where the first two rows are its floor, one parapet at its height over the flight's drop)
      const ue = cu + su * g / 2, va = cv + sv * (Bv + d0), vb = cv + sv * (Bv + d1x);
      if (sv < 0 && j < 2) { if (!j) { const vz = cv + sv * (Bv + dp + 2 * TREAD); par([su > 0 ? ue : ue - PT, Math.min(va, vz), su > 0 ? ue + PT : ue, Math.max(va, vz)], yb); } }
      else par([su > 0 ? ue : ue - PT, Math.min(va, vb), su > 0 ? ue + PT : ue, Math.max(va, vb)], y);
      const ve = cv + sv * h / 2, ua = cu + su * (Au + d0), ub = cu + su * (Au + d1x);
      par([Math.min(ua, ub), sv > 0 ? ve : ve - PT, Math.max(ua, ub), sv > 0 ? ve + PT : ve], y);
    }
    // (the facade: its bays as long each round its outer face, ~4.6 m; the ways in the four on the axes)
    const nb = 4 * Math.max(3, Math.round(bays(O, D, 4).tot / 4 / 4.6)); const B = bays(O, D, nb);
    const pts = B.at.map(p => primAt(O.prims[p.i], p.f, D).map(k3)), pts1 = B.at.map(p => primAt(O.prims[p.i], p.f, D - t).map(k3));
    const axes = [nb - 1, nb / 4 - 1, nb / 2 - 1, (3 * nb) / 4 - 1]; // (the bays on the axes: the right end, the front, the left end, the back)
    els.push({ k: 'arcada', pts, pts1, y0: 0, y1: H, andares, cor: TRAV, escuro: '#2a1e18', mat: 'ashlar', abertos: axes, dentro: { y0: yTop } });
    // (the masts of the awning: one over each pier, out of the attic's face on its corbels)
    for (let k = 0; k < nb; k++) { const p = pts[k], q = pts1[k]; const l = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1; const x = k3(p[0] + (p[0] - q[0]) / l * 0.18), z = k3(p[1] + (p[1] - q[1]) / l * 0.18);
      els.push({ k: 'tora', a: [x, z, k3(H - 1.4)], b: [x, z, k3(H + 4.5)], r: 0.11, cor: '#7a5a3a' }); }
    // (the arch of a way in: as the facade's ground storey has it)
    const aw = k3(0.6 * B.W * Math.min(1, Math.hypot(pts[axes[1] + 1][0] - pts[axes[1]][0], pts[axes[1] + 1][1] - pts[axes[1]][1]) / B.W)), ah = k3(0.725 * yTop);
    // (and the plan's questions of it: the arena's edge d out, as sides — its primitives: 0 and 12 the right end's halves, 3 the
    // front's, 6 the left end's, 9 the back's straight bits —; whether a point is inside the oval d out)
    const oval = { L, n, cu, cv, g, h, D, t, Au, Bv, rs, rb, a: O.a, b: O.b, phi, ya, yb, dp, rows, rise: RISE, tread: TREAD, yTop, H, storeys: [yTop, s1, s2, H],
      prims: O.prims, blocks, boxes, ways, hypo, hatch, cages, nb, pts, pts1, axes, aw, ah, way,
      sides: (d, step) => sides(O, d, step), inside: (u, v, d) => insideOval(O, u, v, d || 0) };
    return { els, door: { u: cu, w: aw, y0: 0, y1: ah }, amphi: { oval } };
  }
  // (the cages of the undercroft: either side of the long corridor, between the arena's ends and the cross corridor, as many of
  // 2 m as the arena's edge leaves room for — each 1.6 m deep behind the corridor's wall, all of it 0.3 m inside the sand's
  // edge): [{ u0, u1, sv }]
  function cagesOf(O) {
    const { cu, cv, g, h, Au } = O; const out = []; const inside = (u, v) => insideOval(O, u, v, -0.3);
    for (const sv of [1, -1]) for (const su of [1, -1]) {
      const near = cu + su * (g / 2 + 0.2 + 0.4), far = cu + su * (Au - 0.6); let x = near;
      while (Math.abs(far - x) >= 2.2) { const u0 = su > 0 ? x : x - 2.0, u1 = su > 0 ? x + 2.0 : x; const vb = cv + sv * (h / 2 + 0.2 + 1.6 + 0.2);
        if (inside(u0 - 0.2, vb) && inside(u1 + 0.2, vb)) out.push({ u0: k3(u0), u1: k3(u1), sv }); x += su * 2.2; }
    }
    return out.sort((p, q) => p.sv - q.sv || p.u0 - q.u0);
  }
  // (a point inside the split oval moved out by d — inside the arena when d is 0, by as much as -d when it is less): the
  // axes' strips, and each quarter's arcs about their centres, the line through both centres between them
  function insideOval(O, u, v, d) {
    const { cu, cv, g, h, Au, Bv } = O; const x = Math.abs(u - cu) - g / 2, y = Math.abs(v - cv) - h / 2;
    if (x <= 0 && y <= 0) return true; if (x <= 0) return Math.abs(v - cv) <= Bv + d; if (y <= 0) return Math.abs(u - cu) <= Au + d;
    // (in the quarter's own frame: the small arc's centre at (a, 0), the big one's at (0, -b); the side of the line through both)
    const side = O.b * x - O.a * y - O.a * O.b; // (> 0: beyond the line from (0, -b) through (a, 0) — the small arc's)
    return side >= 0 ? Math.hypot(x - O.a, y) <= O.rs + d : Math.hypot(x, y + O.b) <= O.rb + d;
  }
  Fo.def('maravilha', 'romano', (L, n) => coliseu(L, n), [10, 13]);

  // ------------------------------ the Great Pyramid (maravilha, egipcio: the steps of 10 and 13 tiles — D-108) ------------------------------
  // Khufu's on a lot of 40 m (52 m): smooth, its faces at 51.84° — its height 4/π of its half base, the Great Pyramid's —, 36 m
  // at its foot (38 m), 1.2 m off the lot's back, on its slab of a hand (0.15 m: the ground's own — where the lot falls away
  // to the street, the steps before the way in come down to it, Space); its gilded capstone. Its way in on the front face, at
  // its foot: the corridor 1.6 m wide and 2.4 m high into it — its mouth a portal of stone where it leaves the sloping face
  // (the face open there: the piramide's entrada) —; at its end the great gallery up to the king's chamber — the flight of
  // 44°, its walls 2 m apart, its vault stepped up over it (corbelled) —, the landing at its top, the chamber of granite (6 ×
  // 4 m, 4.4 m high) through its door, the sarcophagus at its back. On the colossal's lot, before the face, the pyramid's
  // temple: its court with the pillars along its sides, the altar, the gate to the street. What is inside the mass is seen
  // only from within: its pieces come before the pyramid, marked so (oculto). → the elements, and the numbers the plan reads
  // (amphi.piramide)
  const LIME = ['#efe3c2', '#c9b48a'], GRANITE = ['#8a5a4a', '#6a4436', '#9a6a58'], LSTONE = ['#d8c8a0', '#b8a884', '#e4d6b0'];
  const SEKED = Math.atan(4 / Math.PI); // (51.84°)
  function piramide(L, n) {
    const cu = L / 2, big = n >= 13; const e = big ? 19 : 18, H = k3(e * Math.tan(SEKED)), cv = e + 1.2, y0 = 0.15; const face = cv + e;
    const box = (r, a, b, cor, o) => Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(a), y1: k3(b), cor: cor || LSTONE, mat: 'ashlar' }, o);
    const inner = [], els = [box([0, 0, L, L], 0, y0, ['base0', 'base1', 'base2'], { mat: 'slab', piso: 1 })];
    // (the corridor: from the face's foot 5 m in; its walls 0.4 m, its ceiling 0.4 m)
    const cw = 0.8, ct = 0.4, ch = 2.4, vC = face - 5.0;
    inner.push(box([cu - cw - ct, vC, cu - cw, face], y0, y0 + ch), box([cu + cw, vC, cu + cw + ct, face], y0, y0 + ch), box([cu - cw - ct, vC, cu + cw + ct, face], y0 + ch, y0 + ch + 0.4));
    // (the great gallery: its flight up toward the back, a tread of 0.25 m and no riser over 0.25, from the ground; its walls
    // 0.5 m, as high as its vault; the vault in four courses, each over a quarter of the flight, 3 m over its steps there)
    const yK = k3(y0 + 5.4), m = Math.ceil((yK - y0) / 0.25 - 1e-9), run = m * 0.25, vG = vC - run, gw = 1.0;
    for (let j = 0; j < m; j++) inner.push(box([cu - gw, vC - (j + 1) * 0.25, cu + gw, vC - j * 0.25], 0, y0 + (yK - y0) * (j + 1) / m, LSTONE, { mat: 'slab', degrau: 1 }));
    for (let q = 0; q < 4; q++) { const a = vC - run * (q + 1) / 4, b = vC - run * q / 4, top = y0 + (yK - y0) * (q + 1) / 4 + 3.0;
      inner.push(box([cu - gw - 0.5, a, cu - gw, b], 0, top), box([cu + gw, a, cu + gw + 0.5, b], 0, top), box([cu - gw - 0.5, a, cu + gw + 0.5, b], top, top + 0.5)); }
    inner.push(box([cu - gw - 0.5, vC, cu + gw + 0.5, vC + 0.4], y0 + ch, y0 + (yK - y0) / 4 + 3.5)); // (the gallery's end wall over the corridor's mouth)
    // (the landing at the gallery's top, the chamber behind its wall — the door of 1.2 × 2.3 m in it —, the sarcophagus)
    const vL = vG - 1.2, kw = 3.0, kd = 4.0, kh = 4.4, vK = vL - 0.4 - kd; // (the landing's back; the chamber's half width, depth, height; its back)
    inner.push(box([cu - gw, vL, cu + gw, vG], 0, yK, LSTONE, { mat: 'slab' }), box([cu - gw - 0.5, vL, cu - gw, vG], yK, yK + 3.6), box([cu + gw, vL, cu + gw + 0.5, vG], yK, yK + 3.6), box([cu - gw - 0.5, vL, cu + gw + 0.5, vG], yK + 3.6, yK + 4.1));
    inner.push(box([cu - kw - 0.4, vK - 0.4, cu + kw + 0.4, vL], 0, yK, GRANITE, { mat: 'slab' }));
    inner.push(box([cu - kw - 0.4, vL - 0.4, cu - 0.6, vL], yK, yK + kh, GRANITE), box([cu + 0.6, vL - 0.4, cu + kw + 0.4, vL], yK, yK + kh, GRANITE), box([cu - 0.6, vL - 0.4, cu + 0.6, vL], yK + 2.3, yK + kh, GRANITE));
    inner.push(box([cu - kw - 0.4, vK - 0.4, cu + kw + 0.4, vK], yK, yK + kh, GRANITE), box([cu - kw - 0.4, vK, cu - kw, vL - 0.4], yK, yK + kh, GRANITE), box([cu + kw, vK, cu + kw + 0.4, vL - 0.4], yK, yK + kh, GRANITE));
    inner.push(box([cu - kw - 0.4, vK - 0.4, cu + kw + 0.4, vL], yK + kh, yK + kh + 0.6, GRANITE));
    const sarco = [cu - 1.1, vK + 0.5, cu + 1.1, vK + 1.5].map(k3); inner.push(box(sarco, yK, yK + 1.05, ['#5a3a30', '#4a2e26', '#6a4a3e']));
    for (const q of inner) q.oculto = 1;
    els.push(...inner);
    els.push({ k: 'piramide', c: [cu, cv], e, y0, y1: k3(y0 + H), cor: LIME, fiadas: 60, ponta: { f: 0.05, cor: ['#ffe27a', '#d9a93a'] }, entrada: { u: cu, w: 2 * cw, y0, y1: y0 + ch } });
    // (the temple before the face, on the colossal's lot: its court's walls — the gate in the front one —, the pillars along its
    // sides, the altar before the way in)
    let temple = null;
    if (L - face >= 10) { const t0 = face + 1.5, t1 = L - 3.2, tw = 7.5, wt = 0.6, gate = 1.6; temple = { r: [cu - tw, t0, cu + tw, t1].map(k3), gate: [k3(cu - gate), k3(cu + gate)] };
      els.push(box([cu - tw - wt, t0, cu - tw, t1 + wt], y0, y0 + 3.5, LSTONE), box([cu + tw, t0, cu + tw + wt, t1 + wt], y0, y0 + 3.5, LSTONE),
        box([cu - tw - wt, t1, cu - gate, t1 + wt], y0, y0 + 3.5, LSTONE), box([cu + gate, t1, cu + tw + wt, t1 + wt], y0, y0 + 3.5, LSTONE), box([cu - gate, t1, cu + gate, t1 + wt], y0 + 3.0, y0 + 3.5, LSTONE));
      const pil = []; for (let j = 0; j < 5; j++) { const v = t0 + 1.2 + j * (t1 - t0 - 2.4) / 4; pil.push([k3(cu - tw + 1.2), k3(v)], [k3(cu + tw - 1.2), k3(v)]); }
      els.push({ k: 'colunata', pts: pil, r: 0.35, y0, y1: y0 + 3.5, cor: ['#c8a878', '#a88858'] });
      temple.altar = [cu - 0.9, t0 + 1.4, cu + 0.9, t0 + 2.2].map(k3); els.push(box(temple.altar, y0, y0 + 0.95, ['#b8a070', '#98804e', '#c8b080']));
      temple.pil = pil; }
    const piramide = { L, n, cu, cv, e, H: k3(H), y0, face: k3(face), cw, ch, vC: k3(vC), gallery: { r: [cu - gw, vG, cu + gw, vC].map(k3), m, run }, yK, landing: [cu - gw, vL, cu + gw, vG].map(k3),
      chamber: [cu - kw, vK, cu + kw, vL - 0.4].map(k3), doorK: [k3(cu - 0.6), k3(cu + 0.6), k3(vL - 0.4), k3(vL), 2.3], sarco, temple };
    return { els, door: { u: cu, w: 2 * cw, y0, y1: y0 + ch }, amphi: { piramide } };
  }
  Fo.def('maravilha', 'egipcio', (L, n) => piramide(L, n), [10, 13]);

  // ------------------------------ the Templo Mayor (maravilha, asteca: the steps of 10 and 13 tiles — D-108) ------------------------------
  // The twin temple of Tenochtitlan on a lot of 40 m (52 m): its ceremonial square of beaten earth round it; the pyramid of
  // five terraces — from 30 m at its foot to 15 m at its top (38 to 19), 18 m high (22) — and up its front the double stair
  // to the top, out over the square: two lanes and the ridge of stucco between them, the ramps at its sides (each step 0.26 m
  // at most, the god's steep flight: 59°, climbed facing it — D-086); on the top, toward its back, the two shrines side by
  // side — Tlaloc's blue on the left, Huitzilopochtli's red on the right —, each with its band, its door to the front (2.4 m),
  // its crest, and the brazier before its outer corner; the platform before them where the priests stand. → the elements,
  // and the numbers the plan reads (amphi.mayor)
  function mayorGrande(L, n) {
    const cu = L / 2, cv = L / 2, big = n >= 13; const e0 = big ? 19 : 15, e1 = big ? 9.5 : 7.5, lv = 5, H = big ? 22 : 18, h = H / lv;
    const niveis = []; for (let k = 0; k < lv; k++) niveis.push([k3(e0 - (e0 - e1) * k / (lv - 1)), k3(k * h), k3((k + 1) * h)]);
    // (the square's top; the stair's foot on it, 1.5 m off the lot's front; its width: two lanes of 2.7 m and the ridge)
    const yq = 0.06, vFoot = L - 1.5, sw = 6.0;
    const els = [{ k: 'bloco', r: [0, 0, L, L], y0: 0, y1: yq, cor: ['#b8a07a', '#a89068', '#c8b08a'], mat: 'slab', piso: 1 },
      { k: 'escalonada', c: [cu, cv], niveis, cor: ['wl', 'wr', 'top'], friso: 0.3, mat: 'stucco' },
      { k: 'escada', a: [cu, k3(vFoot), yq], b: [cu, k3(cv + e1), H], w: sw, cor: 'wl', clara: 1.08, alfarda: 0.5, divisor: { u: 0, w: 0.6, cor: 'trim' } }];
    // (the shrines: 6.2 × 6.0 m each, 0.6 m apart, their backs 1 m off the top's back edge; 7 m of walls, the band at their top,
    // the door 2.4 m high, the crest 2.6 m over the roof; the brazier on its stand before each outer corner)
    const sw2 = 3.1, sd = 6.0, sh = 7.0, gap = 0.3, vb = cv - e1 + 1.0, vf = vb + sd; const shrines = [];
    for (const [s, col] of [[-1, '#3f7fd8'], [1, '#c8382a']]) {
      const u0 = s < 0 ? cu - gap - 2 * sw2 : cu + gap, u1 = u0 + 2 * sw2, uc = (u0 + u1) / 2;
      els.push({ k: 'bloco', r: [u0, vb, u1, vf].map(k3), y0: H, y1: H + sh, cor: ['wl', 'wr', 'top'] });
      els.push({ k: 'faixa', r: [u0, vb, u1, vf].map(k3), y0: H + sh - 1.4, y1: H + sh, cor: col });
      els.push({ k: 'porta', na: 'frente', v: k3(vf), u: k3(uc), w: 1.6, y0: H, y1: H + 2.4, cor: '#2a1c14' });
      els.push({ k: 'bloco', r: [uc - 2.3, vb + 2.4, uc + 2.3, vb + 2.8].map(k3), y0: H + sh, y1: H + sh + 2.6, cor: [col, col, col], crista: true });
      const bu = s < 0 ? u0 + 0.6 : u1 - 0.6; els.push({ k: 'bloco', r: [bu - 0.3, vf + 0.8, bu + 0.3, vf + 1.4].map(k3), y0: H, y1: H + 0.9, cor: ['#6a5a50', '#4a3e36', '#7a6a60'] }, { k: 'braseiro', p: [k3(bu), k3(vf + 1.1), H + 0.9], r: 0.45, uso: 'acender' });
      shrines.push({ r: [u0, vb, u1, vf].map(k3), door: k3(uc) });
    }
    // (the parapet round the top, over the drop of a terrace — 0.9 m, 0.2 m thick, on its edge —, open where the stair comes up)
    const T = [cu - e1, cv - e1, cu + e1, cv + e1], pt = 0.2, par = r => els.push({ k: 'bloco', r: r.map(k3), y0: H, y1: H + 0.9, cor: ['wl', 'wr', 'top'], mat: 'stucco' });
    par([T[0], T[1], T[2], T[1] + pt]); par([T[0], T[1] + pt, T[0] + pt, T[3]]); par([T[2] - pt, T[1] + pt, T[2], T[3]]);
    par([T[0] + pt, T[3] - pt, cu - sw / 2, T[3]]); par([cu + sw / 2, T[3] - pt, T[2] - pt, T[3]]);
    const mayor = { L, n, cu, cv, H, e0, e1, niveis, top: T.map(k3), pt, stair: { u: cu, w: sw, foot: k3(vFoot), top: k3(cv + e1) }, shrines };
    return { els, door: { u: cu, w: sw, y0: 0, y1: H, stair: true }, amphi: { mayor } };
  }
  Fo.def('maravilha', 'asteca', (L, n) => mayorGrande(L, n), [10, 13]);

  // ------------------------------ the theatres (teatro, romano and grego: the steps of 6, 8 and 10 tiles — D-109) ------------------------------
  // The theatre of a city, on a lot of 24, 32 or 40 m: the orchestra's middle at the lot's, the rows round its back — the Roman's
  // a half round, the Greek's 20° more each side, round its whole round orchestra — out to 0.3 m off the lot's back and sides:
  // the lower rows, on the grande and the monumental the walk round them (the praecinctio, the diazoma) and the upper ones, at
  // the top the gallery behind the last row and its parapet (the theatre's outer wall); the stairways up the rows (twice as many
  // above the walk); at the rows' ends, outside them, the stepped walls 0.9 m over each row (the analemmata, over the ways in).
  // Before the rows the ways in between their ends and the stage building — the aditus, the parodoi — from the yards along its
  // sides and the forecourt on the street. The Roman's stage (the pulpitum) 1 m over the orchestra, twice its round wide (26 m
  // on the monumental), its two flights up from the orchestra; behind it the scaenae frons — one or two tiers of columns, its
  // three doors, the royal one in the middle —, the corridor behind it, the rooms behind that (a dressing room either side, the
  // hall in the middle up its flight from the forecourt), their roof. The Greek's whole round orchestra, where they act; the
  // skene behind it — the proskenion's columns and the logeion over them, its three doors, its corridor and rooms, its door on
  // the forecourt, its roof and its band. The rows are the body's (0.72 × 0.42 m, the Greek's 0.70 × 0.40: D-084); the
  // orchestra a hair over the floor (the plan's: L-494) → the elements, and the numbers the plan reads (amphi.teatro)
  // (each step: the orchestra's round ro; the rows below the walk (lo), above it (up: 0, one level), the walk dz wide; the
  // stairways up them (al, au); the stage building w wide — its stage ds deep (the Greek's proskenion), the wall behind it tf
  // thick (the scaenae frons, the skene's), the corridor behind dc deep (0: the doors into the rooms), the rooms dr deep, its
  // height hf over its floor (the frons's; the rooms' hb under their roof) —; the aditus ad deep, the parodos pw wide at the
  // building's corner; the frons's tiers of columns)
  const TEATRO = {
    romano: { tr: 0.72, rs: 0.42, alfa: 0, gang: 0.6, ys: 1.0, cor: '#ddd2b8',
      6: { ro: 4.0, lo: 8, up: 0, dz: 0, al: 3, au: 0, w: 16, ad: 2.2, ds: 4.0, tf: 0.8, dc: 0, dr: 2.4, hf: 4.6, hb: 3.0, ord: 1 },
      8: { ro: 5.0, lo: 7, up: 3, dz: 1.2, al: 5, au: 9, w: 20, ad: 2.5, ds: 5.0, tf: 1.0, dc: 1.4, dr: 3.0, hf: 6.6, hb: 3.2, ord: 2 },
      10: { ro: 6.5, lo: 8, up: 6, dz: 1.4, al: 5, au: 11, w: 26, ad: 3.0, ds: 6.0, tf: 1.2, dc: 1.6, dr: 3.8, hf: 8.6, hb: 3.4, ord: 2 } },
    grego: { tr: 0.70, rs: 0.40, alfa: 20 * Math.PI / 180, gang: 0.5, ys: 0, cor: '#d8d0bc',
      6: { ro: 4.0, lo: 8, up: 0, dz: 0, al: 5, au: 0, w: 13, pw: 2.0, ds: 1.6, tf: 0.4, dc: 1.2, dr: 2.0, hf: 4.0, hb: 4.0 },
      8: { ro: 5.0, lo: 7, up: 4, dz: 1.2, al: 7, au: 13, w: 18, pw: 2.5, ds: 2.0, tf: 0.4, dc: 1.4, dr: 3.0, hf: 5.0, hb: 5.0 },
      10: { ro: 6.5, lo: 9, up: 5, dz: 1.4, al: 7, au: 15, w: 22, pw: 3.0, ds: 2.4, tf: 0.4, dc: 1.6, dr: 3.8, hf: 6.0, hb: 6.0 } },
  };
  TEATRO.classico = TEATRO.grego; // (the classical people's theatre the Greek's, as the god draws it, its skene with no band)
  const DOORS = { 6: [1.6, 2.6, 1.2, 2.3], 8: [1.8, 3.0, 1.3, 2.5], 10: [2.0, 3.2, 1.4, 2.6] }; // (the middle door's width and height, the side ones')
  function teatroGrande(L, n, st) {
    const T = TEATRO[st], S = T[n], roman = st === 'romano'; const cu = L / 2, vD = L / 2, yq = 0.06, R = L / 2 - 0.3;
    const { tr, rs, alfa } = T, ri = S.ro + T.gang, a0 = Math.PI - alfa, a1 = TAU + alfa, span = a1 - a0;
    const box = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(y0), y1: k3(y1), cor: cor || ['wl', 'wr', 'top'] }, o);
    const els = [box([0, 0, L, L], 0, yq, ['#b0a68e', '#a0967e', '#c0b69e'], { mat: 'slab', piso: 1 })];
    // (the rows: each piece's rings from the top one down — [its outer edge, its top] —, its top ring its last row and the walk
    // behind it: the lower piece's the walk round, the upper's — or the lower's, with no upper — the gallery to the parapet)
    const rL = ri + tr * S.lo, rW = rL + S.dz, top = yq + rs * (S.lo + S.up), rG = R - 0.2; const up = S.up > 0;
    const aisles = m => { const o = []; for (let j = 1; j <= m; j++) o.push(k3(a0 + span * j / (m + 1))); return o; };
    const rows = []; // (every ring as the plan and the end walls read it: [its inner edge, its outer, its top])
    const cav = (r0, k0, m, rTop, na) => { const A = []; for (let k = m - 1; k >= 0; k--) { const ro = k === m - 1 ? rTop : r0 + (k + 1) * tr, y = yq + rs * (k0 + k + 1); A.push([k3(ro), k3(y)]); rows.push([k3(r0 + k * tr), k3(ro), k3(y)]); }
      return { k: 'cavea', c: [cu, vD], aneis: A, fundo: k3(r0), cor: T.cor, arco: [k3(a0), k3(a1)], fecho: 'wl', escadas: { a: aisles(na), l: 1.0, n: 2 } }; };
    els.push(cav(ri, 0, S.lo, up ? rW : rG, S.al)); if (up) els.push(cav(rW, S.lo, S.up, rG, S.au));
    // (the parapet round the gallery — the outer wall, from the ground —; at each row's end, outside it, its stepped wall 0.9 m
    // over the row, of the plan's wall's width, 0.2 m: in pieces 0.25 m deep at most, each a wedge 0.2 m wide at its middle, its
    // outer edge's angle to 1e-5 — one wedge the row's whole depth, its angle to 1e-3, stood 1.28 cm off the plan's wall at the
    // row's ends, and more on the deep top rows, L-507)
    els.push({ k: 'cavea', c: [cu, vD], aneis: [[k3(R), k3(top + 0.9)]], fundo: k3(rG), cor: T.cor, arco: [k3(a0), k3(a1)], fecho: 'wl' });
    const k5 = x => Math.round(x * 1e5) / 1e5, e0 = k3(a0), e1 = k3(a1);
    for (const [r0, r1, y] of rows) { const nk = Math.max(1, Math.ceil((r1 - r0) / 0.25 - 1e-9));
      for (let i = 0; i < nk; i++) { const ra = i ? k3(r0 + (r1 - r0) * i / nk) : r0, rb = i < nk - 1 ? k3(r0 + (r1 - r0) * (i + 1) / nk) : r1, d = 0.2 / ((ra + rb) / 2);
        for (const ar of [[k5(e0 - d), e0], [e1, k5(e1 + d)]]) els.push({ k: 'cavea', c: [cu, vD], aneis: [[rb, k3(y + 0.9)]], fundo: ra, cor: T.cor, arco: ar, fecho: 'wl' }); } }
    els.push({ k: 'arena', c: [cu, vD], r: S.ro, y: k3(yq + 0.01), cor: roman ? '#d6c9ac' : '#e8dcc0' });
    // (the stage building: its back vP — the Roman's stage's front, the Greek's proskenion's columns: the parodos pw wide between
    // its corner and the rows' end —, the wall behind the stage from vS, the corridor from vC, the rooms from vR, its front vF)
    const w = S.w, u0 = cu - w / 2, u1 = cu + w / 2, ys = roman ? T.ys : yq;
    const vP = k3(roman ? vD + S.ad : vD + (S.pw + Math.sin(alfa) * w / 2) / Math.cos(alfa) + 0.2);
    const vS = k3(vP + S.ds), vC = k3(vS + S.tf), vR = k3(vC + (S.dc ? S.dc + 0.3 : 0)), vF = k3(vR + S.dr + 0.3), wm = k3(w / 3);
    const [dW, dH, sW, sH] = DOORS[n]; const doorsB = [[cu, dW, dH], [cu - w / 4, sW, sH], [cu + w / 4, sW, sH]];
    // (a wall along u from ua to ub at v0..v1, from y0 up to y1, open where its doors are — each [u, w, h] — under its lintels)
    const wallU = (ua, ub, v0, v1, y0, y1, ds, cor) => { let at = ua; for (const [u, dw, dh] of ds.slice().sort((p, q) => p[0] - q[0])) { if (u - dw / 2 > at) els.push(box([at, v0, u - dw / 2, v1], y0, y1, cor)); els.push(box([u - dw / 2, v0, u + dw / 2, v1], y0 + dh, y1, cor)); at = u + dw / 2; } if (ub > at) els.push(box([at, v0, ub, v1], y0, y1, cor)); };
    // (the columns along the wall behind the stage, at v from ua to ub: at its ends and either side of each door, half a metre off
    // its jambs, and between them none more than 2.4 m apart)
    const colsAlong = (ua, ub, v) => { const out = [], cuts = [ua]; for (const [du, dw] of doorsB.slice().sort((p, q) => p[0] - q[0])) cuts.push(du - dw / 2 - 0.5, du + dw / 2 + 0.5); cuts.push(ub);
      for (let i = 0; i < cuts.length; i += 2) { const a = cuts[i], b = cuts[i + 1], k = Math.max(1, Math.ceil((b - a) / 2.4 - 1e-9)); for (let j = 0; j <= k; j++) out.push([k3(a + (b - a) * j / k), k3(v)]); }
      return out; };
    if (roman) {
      // (the stage: its podium the whole building's — the floor of the stage and of the rooms —; its two flights up from the
      // orchestra, the treads 0.3 m deep, each riser a quarter of the stage's height — each flight's treads in the numbers, the
      // plan's flight on them: L-506)
      els.push(box([u0, vP, u1, vF], 0, ys, ['base0', 'base1', 'base2'], { mat: 'ashlar', piso: 1 }));
      const step = (r, j) => { const e = box(r, 0, yq + (ys - yq) * (j + 1) / m, ['base0', 'base1', 'base2'], { degrau: 1 }); els.push(e); return { r: e.r, y: e.y1 }; };
      const m = Math.ceil((ys - yq) / 0.26 - 1e-9), fl = [], flT = []; for (const ux of [cu - (S.ro - 1.2), cu + (S.ro - 1.2)]) { fl.push([k3(ux - 0.8), k3(vP - 0.3 * m), k3(ux + 0.8), vP]);
        const tr = []; for (let j = 0; j < m; j++) tr.push(step([ux - 0.8, vP - 0.3 * (m - j), ux + 0.8, vP - 0.3 * (m - j - 1)], j)); flT.push(tr); }
      // (the scaenae frons: its wall to hf over the stage with its three doors; its tiers of columns before it on the stage, the
      // ledge over each tier, the cornice at its top)
      wallU(u0, u1, vS, vC, ys, ys + S.hf, doorsB, ['wl', 'wr', 'top']);
      const h1 = S.ord > 1 ? (S.hf - 0.6) / 2 : S.hf - 0.6, cols = colsAlong(u0 + 0.6, u1 - 0.6, vS - 0.5);
      for (let t = 0; t < S.ord; t++) { const yb = ys + t * (h1 + 0.3); els.push({ k: 'colunata', pts: cols, r: 0.22, y0: k3(yb), y1: k3(yb + h1), cor: ['col0', 'col1'], mat: 'marble' }); els.push(box([u0, vS - 0.9, u1, vS], yb + h1, yb + h1 + 0.3, ['trim', 'trim', 'trim'])); }
      // (behind it: the corridor and the rooms under their roof — the side walls, the partition with a door to each room, the
      // rooms' walls, the front with the hall's opening up its flight)
      const yb = ys + S.hb; els.push(box([u0, vC, u0 + 0.4, vF - 0.3], ys, yb), box([u1 - 0.4, vC, u1, vF - 0.3], ys, yb));
      if (S.dc) wallU(u0 + 0.4, u1 - 0.4, vC + S.dc, vR, ys, yb, [[cu - wm, 1.0, 2.2], [cu, 1.0, 2.2], [cu + wm, 1.0, 2.2]]);
      for (const s of [-1, 1]) els.push(box([cu + s * wm / 2 - 0.1, vR, cu + s * wm / 2 + 0.1, vF - 0.3], ys, yb));
      wallU(u0, u1, vF - 0.3, vF, ys, yb, [[cu, 1.6, 2.4]]);
      const frT = []; for (let j = 0; j < m; j++) frT.push(step([cu - 0.8, vF + 0.3 * (m - j - 1), cu + 0.8, vF + 0.3 * (m - j)], j));
      els.push({ k: 'telhado', r: [k3(u0), vC, k3(u1), vF], y0: k3(yb), y1: k3(yb + 1.4), ao: 'u', ov: 0.3, cor: ['roof0', 'roof1', 'gable', 'roof2'] });
      // (teto: the ceiling of the stage building — a closed part, D-131 —, the foot of the form's roof over its rooms: the plan's
      // storey of it up to there and no wall of it above, the 3D's ceiling there — one number, the form's)
      const teatro = { L, n, st, cu, vD, yq, ys, ro: S.ro, ri: k3(ri), R, rG, rW: k3(rW), a0: k3(a0), a1: k3(a1), tr, rs, lo: S.lo, up: S.up, top: k3(top), rows, w, u0: k3(u0), u1: k3(u1), wm, vP, vS, vC, vR, vF, dc: S.dc, dr: S.dr, hb: S.hb, hf: S.hf, teto: k3(yb), doors: doorsB.map(q => q.map(k3)), flights: fl, treads: flT, front: [k3(cu - 0.8), vF, k3(cu + 0.8), k3(vF + 0.3 * m)], frontTreads: frT, cols };
      return { els, amphi: { teatro } };
    }
    // (the Greek's skene: the proskenion's columns along its back and the logeion over them; its wall with the three doors — the
    // thyromata —, the corridor behind, the rooms, the front with the hall's door; its roof, its band)
    const hp = k3(Math.min(3.0, S.hf - 1.0)), cols = colsAlong(u0 + 0.5, u1 - 0.5, vP + 0.3);
    els.push({ k: 'colunata', pts: cols, r: 0.2, y0: yq, y1: hp, cor: ['col0', 'col1'], mat: 'marble' }, box([u0, vP, u1, vS], hp, hp + 0.3, ['trim', 'trim', 'trim']));
    wallU(u0, u1, vS, vC, yq, yq + S.hf, doorsB, ['wl', 'wr', 'top']);
    els.push(box([u0, vC, u0 + 0.4, vF - 0.3], yq, yq + S.hb), box([u1 - 0.4, vC, u1, vF - 0.3], yq, yq + S.hb));
    wallU(u0 + 0.4, u1 - 0.4, vC + S.dc, vR, yq, yq + S.hb, [[cu - wm, 1.0, 2.2], [cu, 1.0, 2.2], [cu + wm, 1.0, 2.2]]);
    for (const s of [-1, 1]) els.push(box([cu + s * wm / 2 - 0.1, vR, cu + s * wm / 2 + 0.1, vF - 0.3], yq, yq + S.hb));
    wallU(u0, u1, vF - 0.3, vF, yq, yq + S.hb, [[cu, 1.6, 2.4]]);
    if (st === 'grego') els.push({ k: 'faixa', r: [k3(u0), vS, k3(u1), vF], y0: k3(yq + S.hf - 0.6), y1: k3(yq + S.hf), cor: 'acc' }); // (the Greek's band: the classical people's skene has none, as the god draws it)
    els.push({ k: 'telhado', r: [k3(u0), vS, k3(u1), vF], y0: k3(yq + S.hf), y1: k3(yq + S.hf + 1.4), ao: 'u', ov: 0.3, cor: ['roof0', 'roof1', 'gable', 'roof2'] });
    // (teto: the skene's ceiling, the foot of its roof — D-131, as the Roman's)
    const teatro = { L, n, st, cu, vD, yq, ys, ro: S.ro, ri: k3(ri), R, rG, rW: k3(rW), a0: k3(a0), a1: k3(a1), tr, rs, lo: S.lo, up: S.up, top: k3(top), rows, w, u0: k3(u0), u1: k3(u1), wm, vP, vS, vC, vR, vF, dc: S.dc, dr: S.dr, hb: S.hb, hf: S.hf, teto: k3(yq + S.hf), doors: doorsB.map(q => q.map(k3)), flights: [], front: null, cols, hp };
    return { els, amphi: { teatro } };
  }
  Fo.def('teatro', 'romano', (L, n) => teatroGrande(L, n, 'romano'), [6, 8, 10]);
  Fo.def('teatro', 'grego', (L, n) => teatroGrande(L, n, 'grego'), [6, 8, 10]);
  Fo.def('teatro', 'classico', (L, n) => teatroGrande(L, n, 'classico'), [6, 8, 10]);
  // the mead hall of a city (teatro, nordico: the steps of 6, 8 and 10 tiles): the god's longhouse grown — 20 × 9 m (27 × 11,
  // 34 × 13) on its stone base, its walls of planks 3.2 m (3.6, 4.0) with the red band under the eaves and the windows high on
  // its front and ends, the door in its middle up its three treads, the six painted shields along its front, the roof of turf
  // 6 m over the eaves (7, 8.5), the dragon at its gable; inside, the two rows of posts. Its body is the hall's (hallGrande,
  // Valhalla's): the plan furnishes it — the long hearths, the benches where one sits to hear the skald, the tables —
  const HIDROMEL = { 6: { hu: 10, hv: 4.5, hh: 3.2, rf: 6.0, yb: 0.45 }, 8: { hu: 13.5, hv: 5.5, hh: 3.6, rf: 7.0, yb: 0.45 }, 10: { hu: 17, hv: 6.5, hh: 4.0, rf: 8.5, yb: 0.6 } };
  Fo.def('teatro', 'nordico', (L, n) => hallGrande(L, n, HIDROMEL[n], 0), [6, 8, 10]);
  // the sacred garden of a city (teatro, egipcio: the steps of 6, 8 and 10 tiles): the god's garden grown — its lawn, its walls
  // round the back and the sides 2.4 m high, open to the street —; the sacred lake in its rim of stone, 10 × 6 m (14 × 8,
  // 18 × 10), with the lotus on its water, its middle 1.5 m behind the lot's; the palms along the walls; the two sphinxes on
  // their plinths at the front, either side of the way in. Before the lake, where the rite is performed, and the lawn before it
  // where the crowd stands to watch (the plan's). → the elements, and the numbers the plan reads (amphi.jardim)
  const JARDIM = { 6: { pw: 5.0, pd: 3.0, rows: 4, ph: 4.5 }, 8: { pw: 7.0, pd: 4.0, rows: 5, ph: 5.0 }, 10: { pw: 9.0, pd: 5.0, rows: 6, ph: 5.5 } };
  function jardimGrande(L, n) {
    const S = JARDIM[n], cu = L / 2, m = 0.3, wt = 0.4, wh = 2.4, yl = 0.08, rim = 0.35, rh = 0.45; const pv = L / 2 - 1.5;
    const box = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(y0), y1: k3(y1), cor: cor || ['wl', 'wr', 'top'] }, o);
    const els = [box([m, m, L - m, L - m], 0, yl, ['#76983e', '#668a36', '#86a84e'], { mat: 'turf' })];
    // (the walls: the back, the left, the right)
    els.push(box([m, m, L - m, m + wt], 0, wh), box([m, m + wt, m + wt, L - m], 0, wh), box([L - m - wt, m + wt, L - m, L - m], 0, wh));
    // (the lake: its rim of stone round the water, the floor under it, the water, the lotus)
    const R = [cu - S.pw, pv - S.pd, cu + S.pw, pv + S.pd].map(k3), W = [R[0] + rim, R[1] + rim, R[2] - rim, R[3] - rim].map(k3);
    for (const q of [[R[0], R[1], R[2], W[1]], [R[0], W[3], R[2], R[3]], [R[0], W[1], W[0], W[3]], [W[2], W[1], R[2], W[3]]]) els.push(box(q, 0, rh, ['base0', 'base1', 'base2']));
    els.push(box(W, 0, 0.12, ['base1', 'base1', '#3a6a7a']), { k: 'lamina', r: W, y: 0.32, cor: '#4a9ac0' });
    const lotus = []; for (let k = 0; k < Math.round(S.pw * 1.6); k++) lotus.push([k3(W[0] + 0.6 + (W[2] - W[0] - 1.2) * (k + 0.5) / Math.round(S.pw * 1.6)), k3(W[1] + 0.8 + (k % 3) * (W[3] - W[1] - 1.6) / 2)]);
    els.push({ k: 'flores', pts: lotus, y: 0.32, r: 0, n: 1, b: 0.3, chato: true, cor: ['#5a9a3c', '#f0a0c0'] });
    // (the palms along the walls, 1.6 m in from them, every 3.6 m or so)
    const pin = m + wt + 1.6, np = Math.max(3, Math.round((L - 2 * pin) / 3.6));
    for (let k = 0; k <= np; k++) { const t = k3(pin + (L - 2 * pin) * k / np); els.push({ k: 'palmeira', p: [t, k3(pin), yl], h: S.ph, s: 1.4 }); if (k && t < L - 4.0) els.push({ k: 'palmeira', p: [k3(pin), t, yl], h: S.ph, s: 1.4 }, { k: 'palmeira', p: [k3(L - pin), t, yl], h: S.ph, s: 1.4 }); }
    // (the sphinxes on their plinths, 1 m outside the lake's sides, 2.6 m in from the front)
    for (const s of [-1, 1]) { const u = cu + s * (S.pw + 1.0), v = L - 2.6; els.push(box([u - 0.7, v - 1.1, u + 0.7, v + 1.1], 0, 0.5, ['base0', 'base1', 'base2']), { k: 'estatua', p: [k3(u), k3(v), 0.5], h: 3.0, cor: 'wl', pose: 'esfinge' }); }
    const jardim = { L, n, lago: R, agua: W, rows: S.rows, yl };
    return { els, amphi: { jardim } };
  }
  Fo.def('teatro', 'egipcio', (L, n) => jardimGrande(L, n), [6, 8, 10]);

  // ------------------------------ the great ball court (teatro, asteca: the steps of 6, 8 and 10 tiles — D-109) ------------------------------
  // The tlachtli of a city, as the god draws the Aztec's theatre: the alley along the lot (16, 22 and 28 m long, 4 to 6 m wide)
  // between its two walls — their faces to it sloping down to it (the benches the ball runs along), their ends and backs
  // straight, 2.6 to 4.2 m high, the band at their top —, the stone ring on each slope over the alley's middle; at the alley's
  // ends the fields of the I, wider than it. On each wall's top the stand: the walk along the slope's edge behind its parapet,
  // the rows rising away from the alley (the body's, 0.72 × 0.42 m) with their stairways, the walk behind the last one and the
  // parapet at the back; at the stand's ends the walks the flights come up to — one up each wall's left end from the field —,
  // the rows' ends stepped walls 0.9 m over them. → the elements, and the numbers the plan reads (amphi.campo)
  // (each step: the alley La × Wa, the slope's foot ta deep, the rows on each wall, its height Hw, the fields Le × We)
  const CAMPO = { 6: { La: 16, Wa: 4, ta: 1.4, rows: 2, Hw: 2.6, Le: 3.0, We: 10, ring: 0.45 }, 8: { La: 22, Wa: 5, ta: 1.8, rows: 2, Hw: 3.4, Le: 3.5, We: 13, ring: 0.5 }, 10: { La: 28, Wa: 6, ta: 2.0, rows: 3, Hw: 4.2, Le: 4.5, We: 16, ring: 0.6 } };
  function campoGrande(L, n) {
    const S = CAMPO[n], cu = L / 2, cv = L / 2, yq = 0.06, TR = 0.72, RS = 0.42, pt = 0.2, ew = 1.5, Hw = S.Hw; // (a row's depth and rise; the parapets' thickness; the walks at a stand's ends)
    const top = 1.0 + S.rows * TR + 0.8 + 2 * pt; // (a wall's top: its parapet, the walk along the slope, the rows, the walk behind them, the parapet at the back)
    const ua = cu - S.La / 2, ub = cu + S.La / 2, earth = ['#c8b48e', '#b8a47e', '#d4c09a'];
    const box = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(y0), y1: k3(y1), cor: cor || ['wl', 'wr', 'top'] }, o);
    const els = [box([0, 0, L, L], 0, yq, ['#b8a07a', '#a89068', '#c8b08a'], { mat: 'slab', piso: 1 }), box([ua, cv - S.Wa / 2, ub, cv + S.Wa / 2], yq, yq + 0.01, earth, { piso: 1 })];
    for (const [a, b] of [[ua - S.Le, ua], [ub, ub + S.Le]]) els.push(box([a, cv - S.We / 2, b, cv + S.We / 2], yq, yq + 0.01, earth, { piso: 1 }));
    const m = Math.ceil((Hw - yq) / 0.26 - 1e-9), run = 0.25 * m, na = Math.max(1, Math.round((S.La - 2 * ew) / 7)); const stands = [];
    const aisles = []; for (let j = 1; j <= na; j++) aisles.push(k3(ua + ew + (S.La - 2 * ew) * j / (na + 1)));
    for (const s of [-1, 1]) { // (the back wall, the front one)
      const at = d => cv + s * (S.Wa / 2 + S.ta + d); // (v at d out of the slope's top edge)
      const span = (d0, d1) => (s < 0 ? [at(d1), at(d0)] : [at(d0), at(d1)]); // ([v0, v1] from d0 to d1 out)
      const vI = cv + s * S.Wa / 2, vT = at(0), vO = at(top); // (the slope's foot at the alley, its top edge, the wall's back)
      els.push({ k: 'talude', r: (s < 0 ? [ua, vO, ub, vI] : [ua, vI, ub, vO]).map(k3), r1: (s < 0 ? [ua, vO, ub, vT] : [ua, vT, ub, vO]).map(k3), y0: 0, y1: k3(Hw), cor: ['wl', 'wr', 'top'], mat: 'stucco' });
      els.push({ k: 'faixa', r: (s < 0 ? [ua, vO, ub, vT] : [ua, vT, ub, vO]).map(k3), y0: k3(Hw - 0.5), y1: k3(Hw), cor: 'trim' });
      // (the ring on the slope over the alley's middle, facing it)
      els.push({ k: 'aro', c: [k3(cu), k3(vI + s * 0.6 * S.ta), k3(0.6 * Hw)], r: S.ring, t: 0.1, dir: -s, cor: '#6a645a' });
      // (the stand: the parapet along the slope; the rows — between the stairways a block each, in each stairway two steps a
      // row —; the walk behind them; the parapet at the back; the rows' ends stepped walls)
      const [p0, p1] = span(0, pt); els.push(box([ua, p0, ub, p1], Hw, Hw + 0.9, ['wl', 'wr', 'top']));
      const d0 = pt + 1.0, cuts = [ua + ew].concat(...aisles.map(u => [u - 0.5, u + 0.5]), [ub - ew]);
      for (let k = 0; k < S.rows; k++) { const [r0, r1] = span(d0 + k * TR, d0 + (k + 1) * TR), y = Hw + RS * (k + 1);
        for (let i = 0; i < cuts.length; i += 2) els.push(box([cuts[i], r0, cuts[i + 1], r1], Hw, y, ['wl', 'wr', 'top'], { piso: 1 }));
        for (const u of aisles) { const [h0, h1] = span(d0 + k * TR, d0 + (k + 0.5) * TR), [g0, g1] = span(d0 + (k + 0.5) * TR, d0 + (k + 1) * TR);
          els.push(box([u - 0.5, h0, u + 0.5, h1], Hw, y - RS / 2, ['wl', 'wr', 'top'], { degrau: 1 }), box([u - 0.5, g0, u + 0.5, g1], Hw, y, ['wl', 'wr', 'top'], { degrau: 1 })); }
        for (const [a, b] of [[ua + ew - pt, ua + ew], [ub - ew, ub - ew + pt]]) els.push(box([a, r0, b, r1], Hw, y + 0.9)); }
      const yb = Hw + RS * S.rows, [w0, w1] = span(d0 + S.rows * TR, top - pt), [q0, q1] = span(top - pt, top);
      els.push(box([ua + ew, w0, ub - ew, w1], Hw, yb, ['wl', 'wr', 'top'], { piso: 1 }));
      for (const [a, b] of [[ua + ew - pt, ua + ew], [ub - ew, ub - ew + pt]]) els.push(box([a, w0, b, w1], Hw, yb + 0.9));
      els.push(box([ua + ew, q0, ub - ew, q1], Hw, yb + 0.9), box([ua, q0, ua + ew, q1], Hw, Hw + 0.9), box([ub - ew, q0, ub, q1], Hw, Hw + 0.9));
      // (the walls at the stand's ends — the left one open where the flight comes up —, the flight's treads from the field)
      const vm = (vT + vO) / 2, [e0, e1] = span(pt, top - pt);
      els.push(box([ua, e0, ua + pt, vm - 0.7], Hw, Hw + 0.9), box([ua, vm + 0.7, ua + pt, e1], Hw, Hw + 0.9), box([ub - pt, e0, ub, e1], Hw, Hw + 0.9));
      for (let j = 0; j < m; j++) els.push(box([ua - run + 0.25 * j, vm - 0.7, ua - run + 0.25 * (j + 1), vm + 0.7], 0, yq + (Hw - yq) * (j + 1) / m, ['base0', 'base1', 'base2'], { degrau: 1 }));
      stands.push({ s, vI: k3(vI), vT: k3(vT), vO: k3(vO), rows: span(d0, top - pt).map(k3), room: span(pt, top - pt).map(k3), vm: k3(vm), flight: [k3(ua - run), k3(vm - 0.7), k3(ua), k3(vm + 0.7)] });
    }
    const campo = { L, n, cu, cv, yq, Hw, ua, ub, Wa: S.Wa, ta: S.ta, top: k3(top), Le: S.Le, We: S.We, rows: S.rows, tr: TR, rs: RS, pt, ew, aisles, stands };
    return { els, amphi: { campo } };
  }
  Fo.def('teatro', 'asteca', (L, n) => campoGrande(L, n), [6, 8, 10]);

  // ------------------------------ the great monuments (monument: the step of 4 tiles — D-109) ------------------------------
  // The monument of a city on a lot of 16 m: up its three steps along the front — each in two, a body's step of 0.25 m (the
  // crepis, D-097) — to the top, 12.8 m across, round what stands in its middle: the Egyptian's obelisk, 22 m of shaft and its
  // gilded pyramidion on its pedestal, the golden eye on its front, the two sphinxes on their plinths before it; the classical
  // people's obelisk of 24 m, the god's — its eye, its flower beds, no sphinxes —; the Roman's
  // column of the triumph, 26 m with its frieze winding up it, on its pedestal with the plate of the deeds, the gilded emperor
  // on its capital; the Aztec's Sun Stone of 8.4 m standing in its cradle on its altar, a feathered serpent either side, the two
  // braziers before it; the Greek's god of 9 m in gold, spear and shield, on his pedestal of marble with its band. What the
  // plan reads is the classic's (int-monumentos.js, monumentPlan): the steps, the top, what stands in its middle — the offering
  // before it, the prayers behind —, the braziers where one lights them. → the elements
  const CREPIS = { h: 0.5, shrink: 0.6, n: 3 }; // (each step 0.5 m, split in two along the front; 0.6 m narrower each side than the one under it)
  const BASEM = { egipcio: ['#d8c8a0', '#b8a884', '#e4d6b0'], romano: ['#e0d8c8', '#bdb4a2', '#ece6d8'], asteca: ['#b8a07a', '#a89068', '#c8b08a'], grego: ['#e8e2d4', '#c6beac', '#f2ede2'], classico: ['#c9c1ae', '#aaa18c', '#ddd6c5'] };
  function monumentoGrande(L, n, st) {
    const cu = L / 2, e0 = L / 2 - 0.4, { h, shrink } = CREPIS, ty = CREPIS.n * h; const cor = BASEM[st];
    const box = (r, y0, y1, c, o) => Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(y0), y1: k3(y1), cor: c || cor }, o);
    const sq = (hw, y0, y1, c, o) => box([cu - hw, cu - hw, cu + hw, cu + hw], y0, y1, c, o);
    const els = [];
    for (let k = 0; k < CREPIS.n; k++) { const q = e0 - k * shrink; els.push(box([cu - q, cu - q, cu + q, cu + q], k * h, k * h + h / 2, cor, { degrau: 1 }), box([cu - q, cu - q, cu + q, cu + q - shrink / 2], k * h + h / 2, (k + 1) * h, cor, { degrau: 1 })); }
    const gold = ['#f7d66a', '#d9a93a'];
    if (st === 'egipcio') {
      const y1 = ty + 2.4, H = 22, a0 = 1.5, a1 = 0.95;
      els.push(sq(2.1, ty, ty + 1.2), sq(1.8, ty + 1.2, y1, ['#c8b890', '#a89870', '#d8c8a0']));
      els.push({ k: 'talude', r: [cu - a0, cu - a0, cu + a0, cu + a0].map(k3), r1: [cu - a1, cu - a1, cu + a1, cu + a1].map(k3), y0: k3(y1), y1: k3(y1 + H), cor: ['#e6dfcc', '#bdb39c', '#e6dfcc'], mat: 'base' });
      els.push({ k: 'piramide', c: [cu, cu], e: a1, y0: k3(y1 + H), y1: k3(y1 + H + 2.0), cor: gold, mat: 'slab' });
      els.push({ k: 'disco', na: 'frente', u: cu, v: k3(cu + a0 - (a0 - a1) * 0.55), y: k3(y1 + 0.55 * H), r: 0.8, cor: '#d9b34a', olho: '#6a4a1a' });
      for (const s of [-1, 1]) { const u = cu + s * 3.8, v = cu + 3.4; els.push(box([u - 0.55, v - 1.1, u + 0.55, v + 1.1], ty, ty + 0.6, ['#c8b890', '#a89870', '#d8c8a0'])); els.push({ k: 'estatua', p: [k3(u), k3(v), k3(ty + 0.6)], h: 2.4, cor: '#d8c8a0', pose: 'esfinge' }); }
    } else if (st === 'romano') {
      const yP = ty + 5.0, yC = yP + 0.6, H = 26;
      els.push(sq(2.5, ty, yP, ['col0', 'col1', 'col0'], { mat: 'marble' }), { k: 'faixa', r: [cu - 2.5, cu - 2.5, cu + 2.5, cu + 2.5].map(k3), y0: k3(yP - 0.6), y1: k3(yP), cor: 'acc' });
      els.push({ k: 'placa', v: k3(cu + 2.5), u: cu, w: 3.2, y0: k3(ty + 1.6), y1: k3(ty + 3.6), cor: '#d8d0b8' });
      els.push(sq(2.0, yP, yC, ['col0', 'col1', 'col0'], { mat: 'marble' }));
      els.push({ k: 'coluna', c: [cu, cu], r: 1.6, y0: k3(yC), y1: k3(yC + H), cor: ['col0', 'col1'], mat: 'marble', espiral: { y0: k3(yC + 1.0), passo: 3.6, w: 0.6 } });
      els.push(sq(2.0, yC + H, yC + H + 1.0, ['col0', 'col1', 'col0'], { mat: 'marble' }));
      els.push({ k: 'estatua', p: [cu, cu, k3(yC + H + 1.0)], h: 4.5, w: 0.5, cor: '#e0b84a', lanca: true });
    } else if (st === 'asteca') {
      const yA = ty + 0.6, R = 4.2, cr = 0.5;
      els.push(box([cu - 3.5, cu - 1.5, cu + 3.5, cu + 1.5], ty, yA, ['#8a8478', '#6f6a60', '#a09a8e']), box([cu - 2.4, cu - 0.4, cu + 2.4, cu + 0.4], yA, yA + cr, ['#8a8478', '#6f6a60', '#a09a8e']));
      els.push({ k: 'roda', c: [cu, cu], y: k3(yA + cr + R), r: R, t: 0.9, cor: ['#9a9488', '#b8b2a4'], aneis: [[10 / 13, '#2fae8f'], [7.5 / 13, '#b33a2a'], [5 / 13, '#e8c24a'], [2.6 / 13, '#b33a2a']], larg: 1.2 / 13, raios: { n: 8, r0: 5.5 / 13, r1: 9.5 / 13, a: 0.15, cor: '#7a746a' } });
      for (const s of [-1, 1]) { const u = cu + s * 4.8; els.push(box([u - 0.6, cu - 0.6, u + 0.6, cu + 0.6], ty, ty + 0.5, ['#8a8478', '#6f6a60', '#a09a8e'])); els.push({ k: 'estatua', p: [k3(u), cu, k3(ty + 0.5)], h: 5.0, cor: '#2fae8f', pose: 'serpente', penas: '#2fae8f', olho: '#b33a2a' }); }
      for (const s of [-1, 1]) { const u = cu + s * 2.6, v = cu + 3.0; els.push(box([u - 0.3, v - 0.3, u + 0.3, v + 0.3], ty, ty + 0.9, ['#6a5a50', '#4a3e36', '#7a6a60']), { k: 'braseiro', p: [k3(u), k3(v), k3(ty + 0.9)], r: 0.45, uso: 'acender' }); }
    } else if (st === 'classico') {
      // (the classical people's obelisk, as the god draws it: its two pedestals, the shaft, the gilded pyramidion, the golden
      // eye on its front, the flower beds at three corners of the top — no sphinxes: the Egyptian's)
      const y1 = ty + 2.6, H = 24, a0 = 1.3, a1 = 0.8;
      els.push({ k: 'flores', pts: [[cu - 4.8, cu + 4.8], [cu + 4.8, cu - 4.8], [cu + 4.8, cu + 4.8]].map(q => q.map(k3)), y: ty, r: 0.8, cor: ['#ff8fb0', '#ffd85a', '#ffffff', '#b98cff'] });
      els.push(sq(2.2, ty, ty + 1.4, ['#b8ae98', '#978d78', '#cbc2ae']), sq(1.7, ty + 1.4, y1, ['#c4baa4', '#a39984', '#d6ceba']));
      els.push({ k: 'talude', r: [cu - a0, cu - a0, cu + a0, cu + a0].map(k3), r1: [cu - a1, cu - a1, cu + a1, cu + a1].map(k3), y0: k3(y1), y1: k3(y1 + H), cor: ['#e6dfcc', '#bdb39c', '#e6dfcc'], mat: 'base' });
      els.push({ k: 'piramide', c: [cu, cu], e: a1, y0: k3(y1 + H), y1: k3(y1 + H + 1.8), cor: gold, mat: 'slab' });
      els.push({ k: 'disco', na: 'frente', u: cu, v: k3(cu + a0 - (a0 - a1) * 0.45), y: k3(y1 + 0.45 * H), r: 0.9, cor: '#d9b34a', olho: '#6a4a1a' });
    } else {
      const yP = ty + 5.0;
      els.push(sq(2.1, ty, ty + 1.0, ['col0', 'col1', 'col0'], { mat: 'marble' }), sq(1.7, ty + 1.0, yP, ['col0', 'col1', 'col0'], { mat: 'marble' }), { k: 'faixa', r: [cu - 1.7, cu - 1.7, cu + 1.7, cu + 1.7].map(k3), y0: k3(yP - 0.6), y1: k3(yP), cor: 'acc' });
      els.push({ k: 'estatua', p: [cu, cu, k3(yP)], h: 9.0, w: 0.75, cor: '#c9a24a', lanca: true });
    }
    return { els };
  }
  for (const st of ['egipcio', 'romano', 'asteca', 'grego', 'classico']) Fo.def('monument', st, (L, n) => monumentoGrande(L, n, st), [4]);
  // the Norse's: the god's rune stones grown to the stone ship of a king — on its grass, the ship's outline of standing stones
  // 14 m long and 6 m across, broadside to the street, its stem and stern the tallest (3.2 m), its middle open to the front
  // (2.5 m between the stones: the way in); within it the great rune stone, 9 m, with the red serpent carved down it, and the
  // two of 6 and 7 m behind it either side (the god's three). The god paints the far ones first. → the elements, and the
  // numbers the plan reads (amphi.runas: the great stone, where the prayers stand)
  function runasGrande(L, n) {
    const cu = L / 2, cv = L / 2, half = 6.8, wide = 3.0; const stones = [];
    const stone = (u, v, e, h, cobra) => stones.push({ k: 'pedra', c: [k3(u), k3(v)], e, e1: k3(e * 0.75), y0: 0, y1: h, cai: [k3(h * 0.065), k3(h * 0.033)], cor: ['#a09a90', '#7e7870'], cobra: cobra || null });
    stone(cu - half - 0.4, cv, 0.4, 3.2); stone(cu + half + 0.4, cv, 0.4, 3.2);
    for (const off of [-5.4, -3.6, -1.6, 1.6, 3.6, 5.4]) { const w = wide * Math.sqrt(1 - (off / half) ** 2), h = k3(2.0 + 0.7 * Math.abs(off) / 5.4); stone(cu + off, cv - w, 0.35, h); stone(cu + off, cv + w, 0.35, h); }
    const great = [cu, cv - 0.9, 1.0]; stone(great[0], great[1], great[2], 9.0, '#b33a2a'); stone(cu - 2.4, cv - 1.6, 0.6, 6.0, '#b33a2a'); stone(cu + 2.4, cv - 1.3, 0.65, 7.0, '#b33a2a');
    stones.sort((a, b) => a.c[0] + a.c[1] - (b.c[0] + b.c[1]));
    const els = [{ k: 'bloco', r: [0.4, 0.4, L - 0.4, L - 0.4], y0: 0, y1: 0.075, cor: ['#6a8a3a', '#5e7e36', '#7a9a4a'], mat: 'turf' }, ...stones];
    return { els, amphi: { runas: { L, n, cu, cv, grande: great.map(k3), fila: k3(cv + 1.3) } } };
  }
  Fo.def('monument', 'nordico', (L, n) => runasGrande(L, n), [4]);

  // ------------------------------ Valhalla (maravilha, nordico: the steps of 10 and 13 tiles) ------------------------------
  // The god's great hall of the Norse grown to a capital's lot of 40 m (52 m): the hall of 34 × 13 m (46 × 17) along the street on
  // its stone base, the treads of its front up to it from the street, its walls of planks 4.5 m (5 m) with the gilded shields
  // hung along its front, the door of light in its middle, the roof of gilded shields — its ridge 9 m (11 m) over the eaves —,
  // a dragon at each gable's end; inside, the two rows of posts under the roof. Its body is the hall's (D-093: the walls the
  // plan raises its shell on, the base, the treads): the plan furnishes it — the king's high seat, the long hearths, the
  // benches, the tables of the feast, the skald. → the elements (and the hall's body)
  const HALL = { 10: { hu: 17, hv: 6.5, hh: 4.5, rf: 9, yb: 0.6 }, 13: { hu: 23, hv: 8.5, hh: 5.0, rf: 11, yb: 0.6 } };
  // (the hall of the Norse grown — Valhalla's, gilded (gold), the mead hall's of a theatre, of turf, as the god draws each —:
  // S its half length and half depth, its walls' height, its roof's rise, its base's)
  function hallGrande(L, n, S, gold) {
    const cu = L / 2, cv = L / 2, yb = S.yb, H = yb + S.hh; const u0 = cu - S.hu, u1 = cu + S.hu, v0 = cv - S.hv, v1 = cv + S.hv;
    const base = { k: 'bloco', r: [u0 - 0.2, v0 - 0.2, u1 + 0.2, v1 + 0.2].map(k3), y0: 0, y1: yb, cor: ['base0', 'base1', 'base2'], mat: 'ashlar' };
    const walls = { k: 'bloco', r: [u0, v0, u1, v1].map(k3), y0: yb, y1: k3(H), cor: ['wl', 'wr', 'top'], tabuas: Math.round(S.hu * 2 / 1.1), mat: 'parede' };
    // (the treads up to the base: three, 0.3 m deep, 3 m wide before the door, the lowest on the street side)
    const steps = []; for (let j = 0; j < 3; j++) steps.push({ k: 'bloco', r: [cu - 1.5, v1 + 0.2 + 0.3 * (2 - j), cu + 1.5, v1 + 0.2 + 0.3 * (3 - j)].map(k3), y0: 0, y1: k3(yb * (j + 1) / 3), cor: ['base0', 'base1', 'base2'], degrau: 1 });
    // (the two rows of posts under the roof, a third of the way in from each long wall, every 4 m or so — an odd number of bays:
    // none on the axis, before the door —: inside, before the roof in the list — the god paints in its order, and the roof hides
    // them —, oculto)
    const np = Math.round(S.hu * 2 / 4) | 1, posts = [], inner = []; for (const v of [v0 + S.hv * 2 / 3, v1 - S.hv * 2 / 3]) for (let k = 1; k < np; k++) { const u = u0 + S.hu * 2 * k / np; inner.push({ k: 'tora', a: [k3(u), k3(v), yb], b: [k3(u), k3(v), k3(H)], r: 0.22, cor: '#6a4a2c', oculto: 1 }); posts.push([k3(u), k3(v), 0.22]); }
    const els = [base, ...steps, walls, ...inner], R = [u0, v0, u1, v1].map(k3);
    if (gold) els.push({ k: 'porta', na: 'frente', v: k3(v1), u: cu, w: 2.0, y0: yb, y1: k3(yb + 3.0), cor: '#ffd27a', luz: true },
      { k: 'telhado', r: R, y0: k3(H), y1: k3(H + S.rf), ao: 'u', ov: 0.5, cor: ['#e8b83a', '#c8962a', 'wl', '#8a6a1a'], escudos: { linhas: Math.round(S.rf / 1.6), n: Math.round(S.hu * 2 / 1.3), cor: ['#f2cc5a', '#d8a83a'] } },
      { k: 'dragao', p: [k3(u1 + 0.5), cv, k3(H + S.rf)], dir: 1, cor: '#8a6a1a' }, { k: 'dragao', p: [k3(u0 - 0.5), cv, k3(H + S.rf)], dir: -1, cor: '#8a6a1a' });
    else {
      // (the mead hall's: its door, the red band under the eaves, the windows high on its front either side of the door and
      // on its ends, the roof of turf, the dragon at its gable)
      els.push({ k: 'porta', na: 'frente', v: k3(v1), u: cu, w: 2.0, y0: yb, y1: k3(yb + 2.6), cor: 'door' }, { k: 'faixa', r: R, y0: k3(H - 0.6), y1: k3(H), cor: 'trim' });
      for (const [a, b] of [[u0 + 1.5, cu - 3.0], [cu + 3.0, u1 - 1.5]]) els.push({ k: 'janelas', na: 'frente', em: k3(v1), de: k3(a), ate: k3(b), y0: k3(H - 1.6), y1: k3(H - 0.9), n: Math.max(2, Math.round((b - a) / 3)) });
      for (const [na, em] of [['direita', u1], ['esquerda', u0]]) els.push({ k: 'janelas', na, em: k3(em), de: k3(cv - 1.6), ate: k3(cv + 1.6), y0: k3(H - 1.6), y1: k3(H - 0.9), n: 2 });
      els.push({ k: 'telhado', r: R, y0: k3(H), y1: k3(H + S.rf), ao: 'u', ov: 0.5, cor: ['roof0', 'roof1', 'gable', 'roof2'], mat: 'turf' }, { k: 'dragao', p: [k3(u1 + 0.5), cv, k3(H + S.rf)], dir: 1, cor: '#3a2616' });
    }
    // (the shields hung along the front, either side of the door: Valhalla's sixteen, the mead hall's six painted)
    if (gold) for (let k = 1; k <= 8; k++) for (const s of [-1, 1]) { const u = cu + s * (2.2 + (S.hu - 3.2) * k / 8); els.push({ k: 'disco', na: 'frente', u: k3(u), v: k3(v1), y: k3(yb + 2.6), r: 0.45, cor: k % 2 ? '#d8a83a' : '#b33a2a' }); }
    else for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { const u = cu + s * (2.0 + (S.hu - 3.5) * (k + 0.5) / 3); els.push({ k: 'disco', na: 'frente', u: k3(u), v: k3(v1), y: k3(yb + 1.5), r: 0.42, cor: ['#a23c2a', '#d8b25a', '#3f6fb0'][k], olho: '#d8c89a' }); }
    const salao = { L, n, cu, cv, yb, hh: S.hh, r: R, posts, hearth: k3(S.hu / 3.4) }; // (the long hearths' middles either side of the hall's)
    return { body: { walls, base, steps }, els, door: { u: cu, w: 2.0, y0: yb, y1: k3(yb + (gold ? 3.0 : 2.6)) }, amphi: { salao } };
  }
  const valhallaGrande = (L, n) => hallGrande(L, n, HALL[n], 1);
  Fo.def('maravilha', 'nordico', (L, n) => valhallaGrande(L, n), [10, 13]);

  // ------------------------------ the Acropolis (maravilha, grego: the steps of 10 and 13 tiles) ------------------------------
  // The god's Acropolis grown to a capital's lot of 40 m (52 m): the rock, battered from 31 m at its foot to 27 m at its top 6 m
  // up (41 to 36 m, 8 m), the great stair up its front from the street to its top (the Propylaea: 8 m wide, its ramps, 48°);
  // round its top the parapet over the drop, open at the stair. On it the temple — the Parthenon —: its two steps (0.25 m each)
  // round the stylobate, 8 columns at its ends — the middle bay wider — and 13 along its sides (10 and 17), the entablature with its painted frieze, the
  // pediment roof along the way in with the gilded round in its gable; inside the colonnade the cella, its great door to the
  // front, and in it Athena in gold on her pedestal, facing the door. Before the temple the great altar and, at the front-left,
  // Athena Promachos in gold with her spear and shield on her pedestal. → the elements, and the numbers the plan reads
  // (amphi.acropole)
  const ACRO = { 10: { e0: 15.5, e1: 13.5, zr: 6.0, tw: 6.5, t0: 8.5, t1: 28.5, cw: 4.0, c0: 11.0, c1: 25.5, cr: 0.42, ch: 7.5, nf: 8, ns: 13, ath: 7.0, pro: 9.0 },
    13: { e0: 20.5, e1: 18.0, zr: 8.0, tw: 8.5, t0: 10.0, t1: 38.0, cw: 5.2, c0: 13.0, c1: 34.0, cr: 0.5, ch: 9.0, nf: 10, ns: 17, ath: 8.5, pro: 11.0 } };
  function acropoleGrande(L, n) {
    const S = ACRO[n], cu = L / 2, cv = L / 2, zr = S.zr, ys = zr + 0.5, yc = ys + S.ch, ye = yc + 1.2; const marble = ['col0', 'col1', 'col0'];
    const box = (r, y0, y1, cor, o) => Object.assign({ k: 'bloco', r: r.map(k3), y0: k3(y0), y1: k3(y1), cor: cor || ['base0', 'base1', 'base2'] }, o);
    const T = [cu - S.e1, cv - S.e1, cu + S.e1, cv + S.e1], sw = 8.0, st = [cu - S.tw, S.t0, cu + S.tw, S.t1].map(k3); // (the top; the stair's width; the stylobate)
    const els = [{ k: 'talude', r: [cu - S.e0, cv - S.e0, cu + S.e0, cv + S.e0].map(k3), r1: T.map(k3), y0: 0, y1: zr, cor: ['#b8ae9c', '#948a78', '#d8d0bc'] },
      { k: 'escada', a: [cu, k3(L - 1.0), 0], b: [cu, k3(cv + S.e1), zr], w: sw, cor: '#c8bea8', clara: 1.0, alfarda: 0.5 }];
    // (the parapet round the top, 0.25 m thick and 0.9 m over it, open at the stair)
    const pt = 0.25, par = r => els.push(box(r, zr, zr + 0.9, ['#c8bea8', '#a89e88', '#d8cec0']));
    par([T[0], T[1], T[2], T[1] + pt]); par([T[0], T[1] + pt, T[0] + pt, T[3]]); par([T[2] - pt, T[1] + pt, T[2], T[3]]); par([T[0] + pt, T[3] - pt, cu - sw / 2, T[3]]); par([cu + sw / 2, T[3] - pt, T[2] - pt, T[3]]);
    // (the temple: its two steps round the stylobate — the lower 0.35 m out —, its columns 0.6 m in from the stylobate's edge;
    // at its ends the middle bay wider, 1.4 m clear between the columns' bases — the way in up the steps between them, as the
    // Propylaea's middle bay, the procession's —, the others even)
    els.push(box([st[0] - 0.35, st[1] - 0.35, st[2] + 0.35, st[3] + 0.35], zr, zr + 0.25, ['base0', 'base1', 'base2'], { degrau: 1 }), box(st, zr + 0.25, ys, ['base0', 'base1', 'base2'], { degrau: 1 }));
    const cols = [], ci = [st[0] + 0.6, st[1] + 0.6, st[2] - 0.6, st[3] - 0.6];
    const bay = 1.4 + S.cr * Fo.COLUMN_BASE, gap = (ci[2] - ci[0] - bay) / (S.nf - 2), mid = S.nf / 2 - 1;
    for (let k = 0; k < S.nf; k++) { const u = ci[0] + gap * k + (k > mid ? bay - gap : 0); cols.push([k3(u), k3(ci[1])], [k3(u), k3(ci[3])]); }
    for (let k = 1; k < S.ns - 1; k++) { const v = ci[1] + (ci[3] - ci[1]) * k / (S.ns - 1); cols.push([k3(ci[0]), k3(v)], [k3(ci[2]), k3(v)]); }
    // (the cella: its walls, 0.6 m thick, up to the entablature; its door to the front, 2.4 × 5 m — the wall either side and
    // the lintel over it —; inside, Athena on her pedestal against the back wall, facing the door)
    const C = [cu - S.cw, S.c0, cu + S.cw, S.c1].map(k3), wt = 0.6, dw = 2.4, dh = 5.0;
    els.push(box([C[0], C[1], C[2], C[1] + wt], ys, yc, ['wl', 'wr', 'top']), box([C[0], C[1] + wt, C[0] + wt, C[3]], ys, yc, ['wl', 'wr', 'top']), box([C[2] - wt, C[1] + wt, C[2], C[3]], ys, yc, ['wl', 'wr', 'top']));
    els.push(box([C[0] + wt, C[3] - wt, cu - dw / 2, C[3]], ys, yc, ['wl', 'wr', 'top']), box([cu + dw / 2, C[3] - wt, C[2] - wt, C[3]], ys, yc, ['wl', 'wr', 'top']), box([cu - dw / 2, C[3] - wt, cu + dw / 2, C[3]], ys + dh, yc, ['wl', 'wr', 'top']));
    const ped = [cu - 1.1, C[1] + wt + 0.6, cu + 1.1, C[1] + wt + 2.4].map(k3); els.push(box(ped, ys, ys + 0.8, marble, { mat: 'marble' }));
    els.push({ k: 'estatua', p: [cu, k3((ped[1] + ped[3]) / 2), k3(ys + 0.8)], h: S.ath, w: 0.6, cor: '#e8c060', lanca: true });
    // (the colonnade, the entablature with the frieze, the pediment roof along the way in, the gilded round in its gable)
    els.push({ k: 'colunata', pts: cols, r: S.cr, y0: k3(ys), y1: k3(yc), cor: ['col0', 'col1'], mat: 'marble' });
    els.push(box(st, yc, ye, marble, { mat: 'marble' }), { k: 'faixa', r: st, y0: k3(yc + 0.4), y1: k3(yc + 0.9), cor: 'acc' });
    els.push({ k: 'telhado', r: st, y0: k3(ye), y1: k3(ye + S.tw * 0.28), ao: 'v', ov: 0.3, cor: ['roof0', 'roof1', 'gable', 'roof2'] });
    els.push({ k: 'disco', na: 'frente', u: cu, v: k3(st[3] + 0.31), y: k3(ye + S.tw * 0.12), r: 0.9, cor: '#f2c14e' });
    // (before the temple the great altar; at the front-left Athena Promachos on her pedestal)
    const alt = [cu + 1.6, S.t1 + 1.8, cu + 4.6, S.t1 + 3.0].map(k3); els.push(box(alt, zr, zr + 1.0, ['#d8d0bc', '#b8b09c', '#e8e0cc']));
    const pp = [cu - S.tw - 2.6, S.t1 + 1.2, cu - S.tw - 0.8, S.t1 + 3.0].map(k3); els.push(box(pp, zr, zr + 1.4, marble, { mat: 'marble' }));
    els.push({ k: 'estatua', p: [k3((pp[0] + pp[2]) / 2), k3((pp[1] + pp[3]) / 2), k3(zr + 1.4)], h: S.pro, w: 0.7, cor: '#e0b84a', lanca: true });
    const acropole = { L, n, cu, cv, zr, ys, yc, top: T.map(k3), pt, sw, stair: { foot: k3(L - 1.0), top: k3(cv + S.e1) }, stylo: st, krepis: 0.35, cella: C, wt, door: [cu, dw, dh], ped, alt, pp, cols };
    return { els, door: { u: cu, w: sw, y0: 0, y1: zr, stair: true }, amphi: { acropole } };
  }
  Fo.def('maravilha', 'grego', (L, n) => acropoleGrande(L, n), [10, 13]);

  // ------------------------------ the ziggurat (maravilha, classico: the steps of 10 and 13 tiles) ------------------------------
  // The god's ziggurat grown to a capital's lot of 40 m (52 m), as Ur's: on its paved court, four levels — 32, 25, 17 and 11 m a
  // side (42, 33, 24 and 15), 4.5, 4.0, 3.5 and 5.0 m high (5.5, 5.0, 4.5 and 6.0) —, the great stair up its front from the
  // court to the third's top, the terrace round the fourth 12 m up (15; the stair 49°, as steep as the god's lets the feet up it,
  // D-086), the parapet round the terrace
  // open at the stair, the braziers on their stands before the fourth's front corners, and on the fourth's front the golden
  // eye. The god paints in the list's order: the parapet behind the fourth and left of it before it, the rest after (the
  // fourth stood in front of them, and the parapet over it). → the elements, and the numbers the plan reads (amphi.zigurate)
  const ZIG = { 10: { e: [16, 12.5, 8.5, 5.5], h: [4.5, 4.0, 3.5, 5.0], sw: 5.0, eye: 1.4 }, 13: { e: [21, 16.5, 12, 7.5], h: [5.5, 5.0, 4.5, 6.0], sw: 6.0, eye: 1.8 } };
  function zigurateGrande(L, n) {
    const S = ZIG[n], cu = L / 2, cv = L / 2, yq = 0.06, vFoot = L - 1.0; const niveis = []; let y = 0;
    for (let k = 0; k < 3; k++) { niveis.push([S.e[k], k3(y), k3(y + S.h[k])]); y += S.h[k]; }
    const yt = k3(y), e3 = S.e[2], e4 = S.e[3], y4 = k3(yt + S.h[3]); const T = [cu - e3, cv - e3, cu + e3, cv + e3].map(k3), Q = [cu - e4, cv - e4, cu + e4, cv + e4].map(k3);
    const els = [{ k: 'bloco', r: [0, 0, L, L], y0: 0, y1: yq, cor: ['#c9c1ae', '#aaa18c', '#ddd6c5'], mat: 'slab', piso: 1 },
      { k: 'escalonada', c: [cu, cv], niveis, cor: ['wl', 'wr', 'top'], friso: 0.3, mat: 'plaster' }];
    // (the parapet round the terrace — 0.9 m, 0.25 m thick, on its edge —, open where the stair comes up: behind and left first)
    const pt = 0.25, par = r => els.push({ k: 'bloco', r: r.map(k3), y0: yt, y1: k3(yt + 0.9), cor: ['wl', 'wr', 'top'], mat: 'plaster' });
    par([T[0], T[1], T[2], T[1] + pt]); par([T[0], T[1] + pt, T[0] + pt, T[3]]);
    els.push({ k: 'bloco', r: Q, y0: yt, y1: y4, cor: ['wl', 'wr', 'top'], mat: 'plaster' }, { k: 'faixa', r: Q, y0: k3(y4 - 0.3), y1: y4, cor: 'trim' });
    par([T[2] - pt, T[1] + pt, T[2], T[3]]); par([T[0] + pt, T[3] - pt, cu - S.sw / 2, T[3]]); par([cu + S.sw / 2, T[3] - pt, T[2] - pt, T[3]]);
    // (the braziers on their stands, 1.2 m before the fourth's front, 1 m in from its corners)
    for (const s of [-1, 1]) { const bu = cu + s * (e4 - 1.0), bv = cv + e4 + 1.2; els.push({ k: 'bloco', r: [bu - 0.3, bv - 0.3, bu + 0.3, bv + 0.3].map(k3), y0: yt, y1: k3(yt + 0.9), cor: ['#6a5a50', '#4a3e36', '#7a6a60'] }, { k: 'braseiro', p: [k3(bu), k3(bv), k3(yt + 0.9)], r: 0.45, uso: 'acender' }); }
    els.push({ k: 'escada', a: [cu, k3(vFoot), yq], b: [cu, k3(cv + e3), yt], w: S.sw, cor: 'wl', clara: 1.05, alfarda: 0.5 });
    els.push({ k: 'disco', na: 'frente', u: cu, v: Q[3], y: k3(yt + S.h[3] * 0.55), r: S.eye, cor: '#d9b34a', olho: '#6a4a1a' });
    const zigurate = { L, n, cu, cv, yt, e0: S.e[0], top: T, pt, sw: S.sw, stair: { foot: k3(vFoot), top: T[3] }, quarto: Q };
    return { els, door: { u: cu, w: S.sw, y0: 0, y1: yt, stair: true }, amphi: { zigurate } };
  }
  Fo.def('maravilha', 'classico', (L, n) => zigurateGrande(L, n), [10, 13]);
})(window.G = window.G || {});
