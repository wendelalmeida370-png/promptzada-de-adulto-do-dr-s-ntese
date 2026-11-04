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
    const arc = (c, r0, su, sv, t0, t1) => prims.push({ k: 'arco', c, r0, su, sv, t0, t1 });
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
      wall([c.u0 - wt, lo, c.u0, hi], 0, yc); wall([c.u1, lo, c.u1 + wt, hi], 0, yc); wall([c.u0 - wt, c.sv > 0 ? hi : lo - wt, c.u1 + wt, c.sv > 0 ? hi + wt : lo], 0, yc);
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
      if (su < 0) { const m = Math.ceil(ya / 0.225 - 1e-9), run = m * TR; const r = [e0 - run, cv - h / 2, e0, cv + h / 2].map(k3); els.push(...flight(r, ya, 1, 0).out); ways.esquerda = { r, m, run, bridge: br }; }
      else { wall([e0, cv - h / 2, e0 + wt, cv + h / 2], yc, yb - 0.3); ways.direita = { bridge: br }; }
    }
    // (the arena: its sand on the split oval's edge, the hatch open in it)
    els.push({ k: 'areia', c: [cu, cv], pts: outline(O, 0, 0.07), y: ya, d: 0.2, cor: '#e8d8a8', buracos: [hatch] });
    // (the seats: of each quarter, the podium's walk on each of its two arcs — its parapet over the sand — and the rows over it to
    // the facade, an aisle up the middle of each: each a part of the round about its own centre, its ends — the passages' walls,
    // and the line where the two arcs of a quarter meet — on the lines through it, from the ground)
    const blocks = [];
    for (const [su, sv] of QUADS) for (const small of [true, false]) {
      const r0 = small ? rs : rb; const c = small ? [cu + su * (O.a + g / 2), cv + sv * h / 2] : [cu + su * g / 2, cv + sv * (h / 2 - O.b)];
      const arco = small ? arcOf(su, sv, 0, phi) : arcOf(su, sv, phi, HALF); const mid = k3((arco[0] + arco[1]) / 2);
      els.push({ k: 'cavea', c: c.map(k3), aneis: [[k3(r0 + dp), yb]], fundo: k3(r0), cor: SEAT, parapeito: 0.9, muro: RISER, fecho: SEAT, arco });
      const aneis = [[k3(r0 + D - t), yTop]]; for (let j = rows - 1; j >= 1; j--) aneis.push([k3(r0 + dp + j * TREAD), k3(yb + j * RISE)]);
      els.push({ k: 'cavea', c: c.map(k3), aneis, fundo: k3(r0 + dp), cor: SEAT, muro: RISER, fecho: SEAT, arco, escadas: { a: [mid], l: 1.0, n: 2 } });
      blocks.push({ c: c.map(k3), r0: k3(r0 + dp), r1: k3(r0 + D - t), arco, aisles: [mid], small, su, sv });
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
      // (on the front or back passage: the wall at u = cu + su·g/2, the rows along v; on the left or right one: at v = cv + sv·h/2)
      const ue = cu + su * g / 2, va = cv + sv * (Bv + d0), vb = cv + sv * (Bv + d1x);
      par([su > 0 ? ue : ue - PT, Math.min(va, vb), su > 0 ? ue + PT : ue, Math.max(va, vb)], y);
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
      prims: O.prims, blocks, ways, hypo, hatch, cages, nb, pts, pts1, axes, aw, ah, way,
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
})(window.G = window.G || {});
