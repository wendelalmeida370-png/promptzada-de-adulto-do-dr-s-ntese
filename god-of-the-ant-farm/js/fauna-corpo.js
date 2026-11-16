'use strict';
// ============================================================
//  Corpo: the body of a beast on the ground, against the body
//  of the person the god lives (D-330 to D-334). In the god's
//  view a tile is four metres and a beast is a point: a hippo
//  bit from four metres off and walked through people. The
//  lived body is seen at its own size, so for it alone the
//  beasts have their own size too:
//    · a footprint — a capsule along the way the beast faces
//      (a.fx, a.fy: the world's own facing), from its rump to
//      its snout, as wide as its body; the sizes measured from
//      the game's meshes (DIM) and scaled as the 3D draws it
//      (the young smaller, a legend bigger) —;
//    · solid: the body slides along it (avatar.js) and the beast
//      stops at it (Corpo.step, in the world's step: a beast that
//      walked into the body is put back at its skin) — the small
//      ones (a hen, a cat, a hare, a frog, a snake, the birds on
//      the ground) are stepped round or over, and only a big
//      carcass is in the way;
//    · reached by its own skin: a blow at the lived body lands
//      when the beast touches it (Corpo.reach), not at the god's
//      four metres;
//    · a blow is seen before it lands: the attack's gesture is
//      given at once and the blow lands at its contact (the jaws
//      shut, the paw comes down), if the body is still there —
//      one who steps back in time is missed (Corpo.blow).
//  Everyone else lives by the world's old rules, untouched: with
//  no body lived nothing here changes the world (qa/det3.js).
//  Pure where it answers (DIM, stands, foot, near, gap, reach:
//  no chance, no writes — the guard counts, rule 107); the only
//  writes are the blows due and the beast put back at the skin,
//  in the world's step (Corpo.step, asked by Possess.update).
// ============================================================
(function (G) {
  const Co = G.Corpo = {};
  // what a beast's body is, in metres, as the game's meshes are made (js/faunamesh.js, bind pose, the tail left out): from the
  // origin the 3D puts at the world's point, back to the rump (z0) and forward to the snout (z1) along its facing; the half
  // width at the height of a person (hw); the height (h). Measured once with qa/visual/gestos-lib.js — the proof (qa/corpo-fera.js
  // f3) measures them again and says when a mesh has changed
  const DIM = Co.DIM = {
    anaconda: [-0.5, 2.56, 0.14, 0.25], arcticfox: [-0.26, 0.4, 0.05, 0.37], bear: [-0.93, 1.41, 0.33, 1.15], beaver: [-0.36, 0.47, 0.11, 0.39],
    bison: [-1.25, 1.77, 0.48, 2.31], boar: [-0.64, 1.09, 0.22, 0.93], buffalo: [-1.24, 1.77, 0.46, 1.64], cabra: [-0.49, 0.76, 0.15, 0.98],
    camel: [-1.07, 2.18, 0.35, 2.47], cao: [-0.34, 0.65, 0.11, 0.66], capybara: [-0.51, 0.84, 0.18, 0.59], cavalo: [-0.87, 1.66, 0.33, 2.15],
    croc: [-0.82, 1.82, 0.65, 0.45], deer: [-0.71, 1.16, 0.21, 2.2], eagle: [-0.26, 0.16, 0.12, 0.63], elephant: [-1.62, 2.9, 0.91, 3.26],
    fennec: [-0.18, 0.28, 0.04, 0.3], flamingo: [-0.23, 0.38, 0.1, 1.5], fox: [-0.3, 0.5, 0.06, 0.5], frog: [-0.05, 0.07, 0.04, 0.07],
    galinha: [-0.21, 0.22, 0.11, 0.48], gato: [-0.17, 0.29, 0.06, 0.33], gazelle: [-0.44, 0.76, 0.11, 1.27], giraffe: [-0.97, 1.94, 0.44, 4.41],
    gnu: [-0.91, 1.5, 0.31, 1.56], goose: [-0.29, 0.37, 0.14, 0.64], gull: [-0.18, 0.2, 0.07, 0.35], hare: [-0.2, 0.34, 0.06, 0.44],
    heron: [-0.23, 0.33, 0.09, 1.12], hippo: [-1.54, 2.2, 0.59, 1.62], hyena: [-0.61, 1.07, 0.17, 0.99], ibex: [-0.55, 0.86, 0.17, 1.33],
    jaguar: [-0.68, 0.97, 0.16, 0.81], leopard: [-0.64, 0.91, 0.12, 0.76], lion: [-0.92, 1.4, 0.28, 1.4], lizard: [-0.14, 0.31, 0.11, 0.1],
    monkey: [-0.23, 0.39, 0.08, 0.5], moose: [-1.03, 2, 0.35, 2.19], muskox: [-0.97, 1.37, 0.42, 1.41], ostrich: [-0.54, 0.64, 0.34, 2.39],
    otter: [-0.35, 0.48, 0.07, 0.29], ovelha: [-0.52, 0.77, 0.23, 0.83], owl: [-0.19, 0.1, 0.12, 0.48], parrot: [-0.16, 0.1, 0.07, 0.36],
    penguin: [-0.15, 0.16, 0.18, 0.87], peru: [-0.35, 0.37, 0.2, 0.93], polarbear: [-1.11, 1.89, 0.37, 1.42], pombo: [-0.15, 0.15, 0.06, 0.24],
    porco: [-0.61, 0.97, 0.22, 0.82], python: [-0.4, 1.89, 0.1, 0.18], rabbit: [-0.17, 0.24, 0.07, 0.27], raven: [-0.21, 0.2, 0.07, 0.36],
    reindeer: [-0.7, 1.22, 0.26, 2.18], rhino: [-1.45, 2.19, 0.52, 1.82], seal: [-1.02, 1.11, 0.32, 0.66], sloth: [-0.3, 0.4, 0.1, 0.36],
    snowleopard: [-0.6, 0.82, 0.13, 0.69], stork: [-0.26, 0.42, 0.12, 1.03], tapir: [-0.93, 1.36, 0.25, 1.07], tiger: [-0.97, 1.38, 0.21, 1.16],
    toucan: [-0.15, 0.23, 0.07, 0.33], vaca: [-0.9, 1.61, 0.38, 1.44], viper: [-0.08, 0.46, 0.06, 0.07], vulture: [-0.32, 0.27, 0.14, 0.68],
    walrus: [-1.86, 2.06, 0.75, 1.51], wolf: [-0.54, 1.01, 0.15, 1.05], zebra: [-0.84, 1.51, 0.28, 1.84],
  };
  // (the person's body, a circle on the ground — the plans' one rule, In.BODY —; how far a blow reaches past touching it; how much
  // farther a blow already given still lands — the lunge of the jaws, the swing of the paw)
  const BODY_R = Co.BODY_R = 0.32, REACH = Co.REACH = 0.35, LUNGE = Co.LUNGE = 0.45;
  // (the smallest that stands in the way: a dog does, a fox or a hen is stepped round; a bird only as tall as an ostrich; a
  // sprawler as long as a crocodile; a carcass lying as high as a cow's — 0,76 m in the finer meshes of 19e, L-1064)
  const STAND = 0.55, BIRD_H = 2, SPRAWL_L = 1.5, CARCASS = 0.72;
  const TILE = Co.TILE = 4; const tile = () => TILE; // (metres a tile: the world's own, the one the 3D draws it by — G.Space.TILE; the proof checks they are one)
  let GR = null; const groups = () => GR || (GR = { snake: new Set(G.Gestos.GROUPS.snake), bird: new Set(G.Gestos.GROUPS.bird), sprawl: new Set(G.Gestos.GROUPS.sprawl), cat: new Set(G.Gestos.GROUPS.cat), bear: new Set(G.Gestos.GROUPS.bear), horned: new Set(G.Gestos.GROUPS.horned), kicker: new Set(G.Gestos.GROUPS.kicker), canid: new Set(G.Gestos.GROUPS.canid) });
  // the scale of a beast as the 3D draws it (People3D's fsc: the young smaller, a legend bigger)
  const scaleOf = a => (a.big || 1) * (a.age !== undefined && a.age < 1 ? 0.55 + 0.45 * Math.max(0, a.age) : 1);
  Co.scaleOf = scaleOf;

  // ------------------------------ the footprint ------------------------------
  // does this beast stand in the way of a person's body? (in the air, up a tree, in the god's hand, of the sea: no)
  Co.stands = function (a) {
    if (!a || a.held || a.air || (a.z || 0) > 0.3) return false;
    const d = DIM[a.kind], sp = G.Animals && G.Animals.DEF[a.kind]; if (!d || !sp || sp.cls === 'water') return false;
    const k = scaleOf(a), g = groups();
    if (a.dead) return Math.min(2 * d[2], d[3]) * k >= CARCASS;
    if (g.snake.has(a.kind)) return false;
    if (g.bird.has(a.kind)) return d[3] * k >= BIRD_H;
    if (g.sprawl.has(a.kind)) return (d[1] - d[0]) * k >= SPRAWL_L;
    return d[3] * k >= STAND;
  };
  // its footprint, in tiles: the spine [x0, y0, x1, y1] (rump to snout) and the radius r — or null for a kind with no body
  // (a beast that has not yet faced anywhere — fresh from a save — is a round one, as big as its middle)
  Co.foot = function (a) {
    const d = a && DIM[a.kind]; if (!d) return null; const k = scaleOf(a) / tile();
    const fx = a.fx || 0, fy = a.fy || 0, l = Math.hypot(fx, fy);
    if (!(l > 1e-9)) { const R = Math.max(d[2], 0.6 * Math.min(-d[0], d[1])) * k; return [a.x, a.y, a.x, a.y, R]; }
    const ux = fx / l, uy = fy / l, r = d[2] * k; let z0 = d[0] * k + r, z1 = d[1] * k - r;
    if (z1 < z0) z0 = z1 = (z0 + z1) / 2;
    return [a.x + ux * z0, a.y + uy * z0, a.x + ux * z1, a.y + uy * z1, r];
  };
  // the point of a footprint's spine nearest to (x, y), and how far it is: [px, py, d] (tiles)
  Co.near = function (f, x, y) {
    const dx = f[2] - f[0], dy = f[3] - f[1], L2 = dx * dx + dy * dy;
    let t = L2 > 1e-12 ? ((x - f[0]) * dx + (y - f[1]) * dy) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = f[0] + dx * t, py = f[1] + dy * t; return [px, py, Math.hypot(x - px, y - py)];
  };
  // the gap between a body of radius R (tiles) at (x, y) and a beast's skin (below 0 they overlap); Infinity with no footprint
  Co.gap = function (a, x, y, R) { const f = Co.foot(a); if (!f) return Infinity; return Co.near(f, x, y)[2] - f[4] - R; };
  // the person the god lives — the only one whose meetings with beasts go by their bodies
  Co.body = v => !!(v && !v.kind && G.S && G.S.avatar && G.S.avatar.id === v.id && G.S.villagers.has(v.id));
  // does beast a reach o? the lived body by their skins (touching, and a hand more); anyone else by the world's own distance d0,
  // as always (the same comparison, the same world)
  Co.reach = function (a, o, d0) {
    if (o && Co.body(o)) { const g = Co.gap(a, o.x, o.y, BODY_R / tile()); if (Number.isFinite(g)) return g < REACH / tile(); }
    return G.dist(a.x, a.y, o.x, o.y) < d0;
  };

  // ------------------------------ the blow seen before it lands ------------------------------
  // the blow a kind gives a person standing before it — the first of its list it can make (the cats and the bears the paw and the
  // jaws in turn, by the world's clock: no chance drawn)
  const CONTACT = Co.CONTACT = { bite: 0.45, swipe: 0.42, gore: 0.5, toss: 0.5, kick: 0.45, stomp: 0.45, strike: 0.4 };
  function blowOf(a) {
    const g = groups(), k = a.kind; const turn = (Math.floor(G.S.clock / 1.1) + a.id) % 2;
    const list = g.cat.has(k) || g.bear.has(k) ? (turn ? ['swipe', 'bite'] : ['bite', 'swipe']) : k === 'elephant' ? ['toss', 'stomp'] : g.horned.has(k) || k === 'boar' ? ['gore', 'toss'] : g.kicker.has(k) ? ['kick', 'stomp'] : g.snake.has(k) ? ['strike', 'bite'] : ['bite', 'gore', 'kick', 'strike'];
    for (const n of list) if (G.Gestos.can(k, n)) return n;
    return null;
  }
  // (the gesture by the brain's door — which asks the vocabulary first —, or by the beasts' own)
  const gest = (a, n, o) => (G.Mente ? G.Mente.gesto(a, n, undefined, o) : G.Gestos.can(a.kind, n) && G.Animals.gesture(a, n, undefined, o));
  // the giants' blows throw a person down (a charge, a hippo's jaws)
  const GIANT = Co.GIANT = new Set(['hippo', 'elephant', 'rhino', 'buffalo', 'bison', 'muskox', 'moose', 'walrus']);
  let pend = [], stats = { blows: 0, landed: 0, missed: 0, dropped: 0, pushed: 0, moved: 0 };
  G.worldHooks.push(() => { pend = []; stats = { blows: 0, landed: 0, missed: 0, dropped: 0, pushed: 0, moved: 0 }; });
  // a blow of beast a at the lived body v: the gesture now (g: the one already given, or none), and land() — the world's own
  // effect of the blow, the one everybody else gets at once — at the gesture's contact, if v is still within the lunge of it:
  // of the beast as it struck — the jaws shut where the body was; one who stepped out of them in time is missed, whatever the
  // beast did since.
  // (Kept for the world's step, not in the save: the beasts' doings are not saved either — after a load each one decides again)
  Co.blow = function (a, v, land, o) {
    const S = G.S; o = o || {};
    let g = o.g; if (g === undefined) { g = blowOf(a); if (g && !gest(a, g, v.id)) g = null; }
    const D = g && G.Gestos.DEF[g]; const at = S.clock + (D ? (CONTACT[g] || 0.45) * D.d : 0.15);
    pend.push({ a: a.id, v: v.id, at, g: g || '', land, kind: a.kind, f: Co.foot(a) });
    stats.blows++;
    return g;
  };
  // (the body is no longer lived — dead, given back, taken by the world —: the blows at it go with it)
  Co.drop = function () { if (pend.length) { stats.dropped += pend.length; pend = []; } };
  Co.pending = () => pend.map(p => ({ a: p.a, v: p.v, at: p.at, g: p.g, kind: p.kind })); // (for the proofs and the verifier)
  Co.stats = () => Object.assign({}, stats);
  // the misses the body made, for its controller to hear (a step back in time: the jaws shut on the air)
  let missed = []; G.worldHooks.push(() => { missed = []; });
  Co.misses = () => missed;

  // ------------------------------ the world's step for the lived body ------------------------------
  // (Possess.update, every step of the world while a body is lived): the blows due land or miss; the beasts that walked into the
  // body are put back at its skin — or, where the ground behind a beast is no ground for it, the body is put out of it
  Co.step = function (v) {
    const S = G.S;
    if (!Co.body(v)) { if (pend.length) { stats.dropped += pend.length; pend = []; } return; }
    if (pend.length) {
      const now = S.clock, keep = [];
      for (const p of pend) {
        if (p.at > now + 1e-9) { keep.push(p); continue; }
        const a = S.animals.get(p.a);
        if (!a || a.dead || a.held || p.v !== v.id || !S.villagers.has(v.id)) { stats.dropped++; continue; }
        const g = p.f ? Co.near(p.f, v.x, v.y)[2] - p.f[4] - BODY_R / tile() : Co.gap(a, v.x, v.y, BODY_R / tile());
        if (g < (REACH + LUNGE) / tile() && !v.inside) { stats.landed++; p.land(); }
        else { stats.missed++; missed.push({ t: now, a: a.id, kind: a.kind, g: p.g, x: a.x, y: a.y }); if (missed.length > 6) missed.shift(); }
      }
      pend = keep;
    }
    if (!S.villagers.has(v.id) || v.inside || v.ug || v.aboard || v.held || v.air) return;
    const R = BODY_R / tile(), EPS = 0.01 / tile();
    G.Animals.near(v.x, v.y, 4, a => {
      if (!Co.stands(a)) return; const f = Co.foot(a); const q = Co.near(f, v.x, v.y); const over = f[4] + R - q[2]; if (over <= EPS) return;
      // (out along the line from the body to the nearest of its spine; dead on it, out to its side — the shortest way out)
      let nx = q[0] - v.x, ny = q[1] - v.y; const l = Math.hypot(nx, ny);
      if (l > 1e-6) { nx /= l; ny /= l; } else { const h = Math.hypot(a.fx || 0, a.fy || 0); nx = h > 1e-9 ? -(a.fy || 0) / h : 1; ny = h > 1e-9 ? (a.fx || 0) / h : 0; }
      const k = over + EPS, bx = a.x + nx * k, by = a.y + ny * k;
      // (one in a hold — the pegada puts both bodies, L.place —, or with no ground behind it: the body steps out instead)
      if (!a.caught && a.state !== 'hold' && G.Animals.walkOK(a, bx, by)) { a.x = bx; a.y = by; stats.pushed++; return; }
      const px = v.x - nx * k, py = v.y - ny * k; if (G.W.walkableXY(px, py)) { v.x = px; v.y = py; stats.moved++; }
    });
  };
})(window.G);
