'use strict';
// ============================================================
//  Meio: the world around the beasts as they feel it (D-276) — the
//  water and the thirst, the wind that carries a scent, the cover
//  of the grass and the wood, the dark, the heat and the cold, the
//  rain and the storm, the mud, the shade, the shelter, the high
//  ground, the people (fear learnt where they hunt, curiosity where
//  they never did), the other kinds. World module (G.R only); its
//  marks on a beast live in a.meio.
//  (D-300 a D-309) What the world does to a beast is read here and
//  only here, and turned into three things the rest already knows:
//    · the options of the brain (G.Mente.option: to drink, to the
//      shade, to the mud, into the water, to the sun, to shelter,
//      into the burrow, together against the cold, a sentinel on
//      the hill, the leaves up high, the fruit, the fields of the
//      people, the scraps of a town, a look at a calm person, where
//      the vultures circle, waiting at the water);
//    · the doors of animals.js: the senses (A.senseHooks: the wind,
//      the cover, the dark, the hill, the head down at the water,
//      the fear people taught), the stride (A.speedHooks: the hill
//      climbed, the snow, the heat, the thirst), the life
//      (A.lifeHooks: the thirst, the heat, the cold, the wet coat,
//      the mud and the dust; the flight to a refuge — the water,
//      the cliff, the burrow —; the alarm heard across kinds; the
//      river crossed by a migrating herd);
//    · the gestures (only through G.Animals.gesture, and only what
//      the kind can make: G.Gestos.can).
//  a.meio (numbers, in the save whole; the 3D reads the coat):
//    th thirst, wet, mud, dust, cold, hot (0..1, three decimals);
//    wx, wy the water it last drank at (a tile; -1 none); bx, by
//    its burrow or den (a tile; -1 none); al seconds of alert left
//    (an alarm heard, a predator seen); g the gesture it was given
//    here (its index in G.Gestos.ids + 1; 0 none).
//  What a beast is doing for this module (the option, its phase,
//  its goal) is not in the save: the animals' states are not
//  either — after a load every beast is idle and decides again.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Mi = G.Meio = {};
  // (the parts of the meio a proof may turn off, to weigh each one: the senses, the stride, the options of the brain, the thirst,
  // the flights to a refuge and the calls — never the world itself)
  Mi.off = {};
  const A = G.Animals, SP = A.DEF, Me = G.Mente, Ge = G.Gestos, GR = Ge.GROUPS;
  const DAY = () => G.DAY_LEN;
  const r3 = x => Math.round(x * 1000) / 1000;
  const c01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const where = (x, y) => (G.Stories && G.Stories.where ? G.Stories.where(x, y) : { name: '', at: '' });
  const nm = (k, n) => (n > 1 ? A.plural(SP[k], n).replace(/^\d+ /, '') : SP[k].name.toLowerCase());
  const set = l => { const s = new Set(); for (const k of l) { if (k[0] === '=') s.add(k.slice(1)); else if (GR[k]) for (const x of GR[k]) s.add(x); else s.add(k); } return s; }; // ('=bear': the kind, not its group)

  // ------------------------------ who is who ------------------------------
  // how fast each kind grows thirsty in a day (0: it drinks where it lives, or lives on the water of its food)
  // (about one drink a day for the grazers of the open land: the walk to the water is time not grazing — a quarter of the day of
  // a zebra went to it, and the herds starved: L-1018)
  const THIRST = {
    elephant: 0.55, hippo: 0.4, buffalo: 0.55, gnu: 0.5, zebra: 0.5, rhino: 0.45, giraffe: 0.25, bison: 0.45, deer: 0.4, moose: 0.4, reindeer: 0.2, muskox: 0.15, tapir: 0.45,
    capybara: 0.45, boar: 0.45, monkey: 0.1, camel: 0.1, gazelle: 0.2, ostrich: 0.15, ibex: 0.2, lion: 0.35, leopard: 0.25, tiger: 0.4, jaguar: 0.4, snowleopard: 0.15,
    wolf: 0.3, hyena: 0.3, fox: 0.2, arcticfox: 0.12, fennec: 0.05, bear: 0.3, polarbear: 0, rabbit: 0.08, hare: 0.08, otter: 0.4, beaver: 0.4, croc: 0.2,
    anaconda: 0.15, python: 0.1, viper: 0.05, lizard: 0.03, sloth: 0.03,
  };
  // seconds to drink from thirsty to full
  const SIP = { elephant: 11, hippo: 8, buffalo: 9, rhino: 9, giraffe: 7, camel: 10, bison: 8, moose: 8 };
  // how much of the heat and of the cold a kind feels (its coat, its size, its land)
  const HEAT = { camel: 0.3, fennec: 0.4, gazelle: 0.6, ostrich: 0.6, lizard: 0.3, viper: 0.3, muskox: 1.8, polarbear: 1.8, reindeer: 1.5, arcticfox: 1.5, hare: 1.4, snowleopard: 1.5, bison: 1.3, wolf: 1.2, bear: 1.3, moose: 1.4, elephant: 1.2, rhino: 1.2, hippo: 1.6, buffalo: 1.2 };
  const COLD = { otter: 0.4, beaver: 0.45, rabbit: 0.7, fox: 0.7, muskox: 0.25, polarbear: 0.2, reindeer: 0.3, arcticfox: 0.3, hare: 0.35, snowleopard: 0.3, wolf: 0.45, bison: 0.45, ibex: 0.45, moose: 0.5, bear: 0.55, penguin: 0.2, seal: 0.2, walrus: 0.2,
    hippo: 1.4, elephant: 1.2, giraffe: 1.2, monkey: 1.3, capybara: 1.3, tapir: 1.3, jaguar: 1.2, croc: 1.6, python: 1.5, anaconda: 1.5, frog: 1.3, lizard: 1.6, viper: 1.5, sloth: 1.4, gazelle: 1.2, zebra: 1.1, gnu: 1.1, lion: 1.1, camel: 0.8 };
  const REPTILE = set(['croc', 'lizard', 'python', 'viper', 'anaconda']);
  // who sees in the dark (the night costs them nothing)
  const NIGHT = set(['owl', 'hyena', 'lion', 'leopard', 'tiger', 'jaguar', 'snowleopard', 'wolf', 'fox', 'arcticfox', 'fennec', 'bear', 'croc', 'python', 'anaconda', 'viper', 'hippo', 'gato', 'cao']);
  const NOSE = set(['mammal']);
  // who climbs a hill as if it were flat
  const CLIMBER = set(['ibex', 'snowleopard', 'cabra', 'leopard', 'monkey']);
  const SNOWOK = set(['reindeer', 'muskox', 'arcticfox', 'hare', 'polarbear', 'snowleopard', 'wolf', 'bison', 'moose', 'penguin', 'ibex']);
  // the options' kinds
  const K = {
    shade: set(['cat', 'canid', 'bear', 'ruminant', 'equid', 'swine', 'elephant', 'rhino', 'monkey']),
    wallow: set(['boar', 'hippo', 'rhino', 'buffalo', 'elephant', 'bison', 'tapir', 'capybara']),
    dust: set(['elephant', 'bison', 'zebra', 'ostrich']),
    soak: set(['elephant', 'buffalo', 'tiger', 'jaguar', 'bear', 'moose', 'tapir', 'capybara']),
    bask: set(['croc', 'lizard', 'python', 'anaconda']),
    huddle: set(['muskox', 'penguin', 'wolf', 'arcticfox', 'lion', 'ostrich', 'reindeer', 'bison', 'gnu', 'zebra', 'buffalo', 'elephant', 'gazelle']),
    curl: set(['canid', 'cat', 'rabbit', 'hare', 'bear', 'snake']),
    burrow: set(['rabbit', 'hare', 'fox', 'arcticfox', 'fennec', 'lizard', 'viper', 'beaver', 'otter']),
    sentinel: set(['zebra', 'gnu', 'gazelle', 'deer', 'reindeer', 'elephant', 'ostrich', 'buffalo', 'giraffe']),
    browse: set(['giraffe', 'elephant', 'moose', 'camel', 'ibex', 'tapir', 'deer', 'rhino']),
    fruit: set(['=bear', 'boar', 'elephant']),
    raid: set(['elephant', 'boar', 'deer', 'buffalo', 'bison', 'moose', '=bear']),
    scav: set(['fox', 'hyena', '=bear']),
    curious: set(['deer', 'gazelle', 'zebra', 'giraffe', 'elephant', 'camel', 'capybara', 'reindeer', 'ostrich', 'fox', '=bear', 'moose', 'bison', 'gnu']),
    vult: set(['hyena', 'lion', 'leopard', 'tiger', 'jaguar', 'wolf', 'bear']),
    ambush: set(['lion', 'leopard', 'tiger', 'jaguar', 'hyena', 'croc', 'anaconda']),
    hideYoung: set(['deer', 'gazelle', 'reindeer', 'rabbit', 'hare', 'ibex', 'giraffe', 'zebra', 'gnu', 'tapir']),
    toWater: set(['capybara', 'otter', 'beaver', 'hippo', 'frog', 'moose', 'tapir', 'buffalo']),
    toCliff: set(['ibex']),
    caller: { monkey: 'call', zebra: 'snort', gnu: 'snort', gazelle: 'stot', elephant: 'trumpet', buffalo: 'bellow', deer: 'call', ibex: 'call', capybara: 'call', ostrich: 'call', giraffe: 'snort', reindeer: 'call', bison: 'snort' },
    roost: set(['parrot', 'raven', 'toucan', 'eagle', 'vulture', 'gull']),
    flush: set(['parrot', 'raven', 'toucan', 'heron', 'flamingo', 'goose', 'stork', 'gull']),
  };
  const MIGR = k => SP[k] && (SP[k].migr === 'herd' || (SP[k].herd && SP[k].herd[1] >= 6));
  // (the beasts a town keeps out by day: the big hunters and the giants that kill — not the fox at the scraps, nor the deer)
  const DANGER = new Set(A.ids.filter(k => { const d = SP[k]; return d.cls !== 'air' && d.cls !== 'water' && !d.dom && !d.town && ((A.predator(k) && d.size >= 0.9 && d.diet !== 'scav') || ['elephant', 'rhino', 'hippo', 'buffalo', 'hyena'].includes(k)); }));
  const wild = (a, sp) => !a.dom && !a.pen && !a.tamed && !a.summoned && !a.raid && !a.legend && !sp.dom && !sp.town && !a.held && !a.air;
  const land = sp => sp.cls === 'land' || sp.cls === 'amph';
  // the gesture's index (a.meio.g)
  const GIDX = {}; Ge.ids.forEach((n, i) => { GIDX[n] = i; });

  // ------------------------------ the beast's own: a.meio ------------------------------
  const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  const KEYS = ['th', 'wet', 'mud', 'dust', 'cold', 'hot', 'wx', 'wy', 'bx', 'by', 'al', 'g'];
  const fresh = () => ({ th: 0, wet: 0, mud: 0, dust: 0, cold: 0, hot: 0, wx: -1, wy: -1, bx: -1, by: -1, al: 0, g: 0 });
  // (a save of before, or a damaged one: what is a number in range is kept, the rest starts afresh — and one shape always)
  function tidy(m) {
    const o = fresh(); if (!m || typeof m !== 'object') return o;
    for (const k of KEYS) { const v = m[k]; if (typeof v === 'number' && Number.isFinite(v)) o[k] = v; }
    for (const k of ['th', 'wet', 'mud', 'dust', 'cold', 'hot']) o[k] = r3(c01(o[k]));
    for (const k of ['wx', 'wy', 'bx', 'by']) { o[k] = Math.round(o[k]); if (o[k] < -1 || o[k] >= N) o[k] = -1; }
    if (o.wx < 0 || o.wy < 0) { o.wx = -1; o.wy = -1; } if (o.bx < 0 || o.by < 0) { o.bx = -1; o.by = -1; }
    o.al = Math.max(0, Math.min(60, Math.round(o.al))); o.g = o.g >= 1 && o.g <= Ge.ids.length ? Math.round(o.g) : 0;
    return o;
  }
  const OKM = Symbol('meio'); // (the mark of an a.meio already put in order: a symbol, which JSON leaves out of the save)
  function meioOf(a) { const m0 = a.meio; if (m0 && m0[OKM]) return m0; const m = a.meio = tidy(m0); m[OKM] = 1; return m; }
  Mi.of = meioOf;

  // ------------------------------ what a beast is doing here (not saved) ------------------------------
  const RUN = new Map(), SLOW = new Map(), FLED = new Map(), SEED = new Map(), URGE = new Map(), CALL = new Map(), PUSH = new Map();
  G.worldHooks.push(() => { TOWN = null; tw = 0; townT = -1; RUN.clear(); SLOW.clear(); FLED.clear(); SEED.clear(); XS.clear(); URGE.clear(); CALL.clear(); PUSH.clear(); });
  const MINE = {};
  function runStart(a, name) {
    const r = { o: name, p: 0, q: 0, t0: G.S.clock, gx: a.x, gy: a.y, fx: 0, fy: 0, wi: -1, id: 0, sc: 0, n: 0, k: 0, b: 0, re: 0, gn: null, fast: 0 };
    RUN.set(a.id, r); a.state = name; a.t = 99; a.moving = false; a.path = null; a.target = 0;
    return r;
  }
  function endRun(a, r) { if (r.gn && a.gest === r.gn) A.gestEnd(a, r.gn); if (a.meio) a.meio.g = 0; RUN.delete(a.id); }
  // out of the option, back to the old ways (with a gesture to close it, when the kind has one)
  function quit(a, g, t) { const r = RUN.get(a.id); if (r) endRun(a, r); a.state = 'idle'; a.t = t === undefined ? G.rr(0.5, 2) : t; a.moving = false; if (g) gest(a, g); return true; }
  Mi.phase = a => { const r = RUN.get(a.id); return r && r.o === a.state ? r : null; };
  // the one place this module gives a gesture: only what the kind makes (no refusal to count), and over the flavour of another
  // only (a hunt's or a fight's gesture is not cut short by the weather); own: the body is in this module's state
  function gest(a, n, d, o, v, own) {
    if (!Ge.can(a.kind, n)) return false;
    if (a.gest === n && (a.gestO || 0) === (o || 0)) return true; // (already so: let it play on)
    if (!own && a.gest && a.gest !== n) { const c = Ge.DEF[a.gest], p = Ge.DEF[n].p; if (c && (c.p < p || (c.p === p && !(a.meio && a.meio.g === GIDX[a.gest] + 1)))) return false; }
    if (!A.gesture(a, n, d, o, v)) return false;
    if (a.meio) a.meio.g = GIDX[n] + 1;
    const r = RUN.get(a.id); if (r && own) r.gn = n;
    return true;
  }
  // the fear scan of a beast on its way (the world's own fearCheck): out of the option, and the world's scan flees
  function watch(a, r, dt) { r.sc -= dt; if (r.sc > 0) return false; r.sc = 0.5; if (A.fearOf && A.fearOf(a)) { quit(a, null, 0); a.scan = 0; return true; } return false; }
  // walking to the option's goal: true on arrival (false while on the way; a beast that gave up is out)
  function walk(a, r, dt, speed, near) {
    a.tx = r.gx; a.ty = r.gy;
    const done = A.moveTo(a, dt, speed);
    const d = G.dist(a.x, a.y, r.gx, r.gy);
    if (done && d > (near || 0.9)) { quit(a); return null; }
    return done || d < 0.2;
  }

  // ------------------------------ the fields of the map (D-300) ------------------------------
  // dF: steps over the ground to the nearest fresh water (a river or a lake, never the sea: 0 in it, 1 on its bank, 255 out of
  // reach); dL: the same to the water that lasts a drought (the deep, the broad, the lakes). Made again only when the ground
  // changes (S.typeVer): the god who dries a river or raises a mountain changes them; the ice of a sudden winter is read where
  // the beast drinks.
  let dF = null, dL = null, fS = null, fV = -1, fN = 0, Q = null;
  const FMAX = 60, REACH = 20; // (the field reaches sixty steps; water more than twenty away is not in a beast's reach)
  function fields() {
    const S = G.S; const v = S.typeVer || 0;
    if (dF && fS === S && fV === v && fN === N) return;
    fS = S; fV = v; fN = N; const n = N * N;
    if (!dF || dF.length !== n) { dF = new Uint8Array(n); dL = new Uint8Array(n); Q = new Int32Array(n); }
    const lasting = i => { if (S.deep[i]) return true; const x = i % N, y = (i / N) | 0; let w = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < N && yy < N && S.type[yy * N + xx] === T.RIVER) w++; } return w >= 10; };
    bfs(dF, i => S.type[i] === T.RIVER); bfs(dL, i => S.type[i] === T.RIVER && lasting(i));
    // (the drinking places counted and the walls of the water drawn where the water was: they go with the map)
  }
  function bfs(D, src) {
    const S = G.S; D.fill(255); let h = 0, t = 0;
    for (let i = 0; i < N * N; i++) if (src(i)) { D[i] = 0; Q[t++] = i; }
    while (h < t) {
      const i = Q[h++]; const d = D[i]; if (d >= FMAX) continue; const x = i % N, y = (i / N) | 0;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const j = ny * N + nx; if (D[j] <= d + 1) continue; if (S.type[j] < T.SAND || S.cliff[j]) continue; D[j] = d + 1; Q[t++] = j;
      }
    }
  }
  const drought = () => G.S.weather.drought > 0;
  const field = () => (drought() ? dL : dF);
  const freshAt = i => i >= 0 && G.S.type[i] === T.RIVER && !(G.S.ice && G.S.ice[i]) && (!drought() || dL[i] === 0);
  Mi.waterDist = (x, y) => { fields(); return W.inb(x, y) ? field()[W.idx(x, y)] : 255; };
  // down the field from a tile to the bank (a tile on dry ground beside the water), or the water itself where one stands in it
  function bankFrom(i, D) {
    let d = D[i]; if (d === 255) return -1;
    for (let k = 0; k < FMAX + 4 && d > 1; k++) {
      const x = i % N, y = (i / N) | 0; let bj = -1, bd = d;
      for (let q = 0; q < 8; q++) { const dx = q < 3 ? q - 1 : q < 5 ? (q === 3 ? -1 : 1) : q - 6, dy = q < 3 ? -1 : q < 5 ? 0 : 1; const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (D[j] < bd) { bd = D[j]; bj = j; } }
      if (bj < 0) break; i = bj; d = bd;
    }
    return d <= 1 ? i : -1;
  }
  // the water tile a bank looks onto (the first one around it)
  function waterBy(i) { const S = G.S; const x = i % N, y = (i / N) | 0; if (S.type[i] === T.RIVER) return i; for (const [dx, dy] of D8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (freshAt(j)) return j; } return -1; }
  // where a beast stands to drink: its own water (the memory) if it still runs, else down the field; the herd spreads along the
  // bank (the next bank tiles, by the beast's id)
  function drinkSpot(a) {
    fields(); const S = G.S; const m = meioOf(a); const D = field(); let b = -1;
    if (m.wx >= 0) { const wi = m.wy * N + m.wx; if (freshAt(wi) && G.dist(a.x, a.y, m.wx + 0.5, m.wy + 0.5) < 30) { for (const [dx, dy] of D8) { const x = m.wx + dx, y = m.wy + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const j = y * N + x; if (D[j] === 1 && A.walkOK(a, x + 0.5, y + 0.5)) { b = j; break; } } } else { m.wx = -1; m.wy = -1; } }
    if (b < 0) { const i0 = W.idx(a.x, a.y); if (D[i0] > REACH) return null; b = bankFrom(i0, D); }
    if (b < 0) return null;
    if (D[b] === 1) { const alt = []; const x = b % N, y = (b / N) | 0; for (const [dx, dy] of D8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (D[j] === 1 && !S.occ[j] && A.walkOK(a, nx + 0.5, ny + 0.5)) alt.push(j); } if (alt.length && G.hash(a.id) < 0.6) b = alt[a.id % alt.length]; }
    const w = waterBy(b); if (w < 0) return null;
    const bx = (b % N) + 0.5, by = ((b / N) | 0) + 0.5, wx = (w % N) + 0.5, wy = ((w / N) | 0) + 0.5;
    let x = bx + (wx - bx) * 0.34, y = by + (wy - by) * 0.34; if (!A.walkOK(a, x, y)) { x = bx; y = by; } if (!A.walkOK(a, x, y)) return null;
    return { x, y, w };
  }

  // ------------------------------ cover, shade and the high ground ------------------------------
  // the cover at a tile (0 open .. 1 deep wood): the trees, a bush, the tall grass the grazers left standing, the reeds of a
  // marsh by the water — read where it is, never kept (it changes as the grass is grazed and the trees grow and fall)
  const COVERB = [0.45, 0.1, 0.4, 0.6, 0.55, 0.6, 0.1];
  function coverAt(i) {
    const S = G.S; if (i < 0 || i >= N * N) return 0; const t = S.type[i]; if (t < T.SAND || S.road[i]) return 0;
    let c = 0; const tr = S.treeAt[i];
    if (tr) { const q = S.trees.get(tr); if (q && q.stage === 'grow') c = q.size >= 0.6 ? 0.8 : 0.45; }
    const o = S.objAt[i]; if (o && c < 0.5 && S.bushes.has(o)) c = 0.55;
    if (c < 0.5 && (t === T.GRASS || t === T.MEADOW) && S.veg && S.veg[i] > 0.95 && !S.occ[i]) c = Math.max(c, COVERB[S.biome ? S.biome[i] : 0]); // (only a rich land's grass grows so high)
    if (c < 0.6 && S.biome && S.biome[i] === 3 && dF && dF[i] <= 1) c = 0.65; // (the reeds)
    return c;
  }
  Mi.cover = (x, y) => (W.inb(x, y) ? coverAt(W.idx(x, y)) : 0);
  const shadeAt = i => { const S = G.S; const x = i % N, y = (i / N) | 0; for (let q = -1; q < 4; q++) { const nx = q < 0 ? x : x + D8[q][0], ny = q < 0 ? y : y + D8[q][1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const t = S.treeAt[ny * N + nx]; if (t) { const tr = S.trees.get(t); if (tr && tr.stage === 'grow' && tr.size >= 0.6 && tr.kind !== 'cactus') return true; } } return false; };
  // a higher place to look out from, near: the highest of twelve, if it stands above the herd's ground
  function hill(a) {
    const S = G.S; const h0 = S.th[W.idx(a.x, a.y)]; let best = null, bh = h0 + 0.4;
    for (let k = 0; k < 12; k++) { const ang = k / 12 * 6.283 + G.hash(a.id) * 6, r = k < 6 ? 3 : 5.5; const x = a.x + Math.cos(ang) * r, y = a.y + Math.sin(ang) * r; if (!W.inb(x, y) || !A.walkOK(a, x, y)) continue; const h = S.th[W.idx(x, y)]; if (h > bh && A.lineOK(a, x, y)) { bh = h; best = [x, y]; } }
    return best;
  }

  // ------------------------------ the world now: the sun, the night, the wind (D-301) ------------------------------
  const ENV = { sun: 0, night: false, day: true, rain: 0, storm: false, dry: false, wx: 1, wy: 0, ws: 0.6, t: 0 };
  function env() {
    const S = G.S; const w = S.weather || {}; const t = S.time;
    ENV.t = t; ENV.sun = t > 0.02 && t < 0.73 ? Math.sin(Math.PI * (t - 0.02) / 0.71) : 0; ENV.night = G.isNight(); ENV.day = !ENV.night;
    ENV.rain = w.rain || 0; ENV.storm = (w.storm || 0) > 0 && ENV.rain > 0.3; ENV.dry = (w.drought || 0) > 0;
    const wa = w.windA || 0; ENV.wx = Math.cos(wa); ENV.wy = Math.sin(wa); ENV.ws = Math.max(0.35, Math.min(1.4, (w.windS || 0.3) * 2));
  }
  // the scent carried by the wind from o to a — a (downwind of o) smells it from farther; upwind it does not reach. Even round
  // the compass (a hunter coming from anywhere is smelt on the whole as before): the hunter that comes from downwind gains
  // what the one from upwind loses. Rain washes the air; a storm's wind carries it far, and its rain takes it again
  function scent(a, o) {
    const dx = a.x - o.x, dy = a.y - o.y; const d = Math.hypot(dx, dy); if (d < 0.05) return 1;
    const al = (dx * ENV.wx + dy * ENV.wy) / d; let k = 1 + 0.6 * al * ENV.ws;
    if (o.kind === undefined) k = 1 + (k - 1) * 1.15; // (people smell strong)
    return 1 + (k - 1) * (1 - 0.6 * ENV.rain);
  }
  Mi.wind = () => ({ a: Math.atan2(ENV.wy, ENV.wx), s: ENV.ws, x: ENV.wx, y: ENV.wy });
  Mi.scent = (a, o) => scent(a, o);

  // ------------------------------ people: fear where they hunt (D-305) ------------------------------
  // the people's fear, per cell of 8 tiles: a beast killed or wounded by a person teaches it to the ground, and it fades (a
  // hunted valley is avoided for days, not for ever); a town's ground is feared as long as it stands. In the save.
  const CF = 8; let cw = 0, PF = null, HS = null, HW = null, TF = null;
  function cells() { const c = Math.ceil(N / CF); if (PF && cw === c) return; cw = c; PF = new Float32Array(c * c); HS = new Float32Array(c * c); HW = new Int32Array(c * c).fill(-1); TF = new Uint8Array(c * c); tfDay = -1; }
  const cellOf = (x, y) => Math.min(cw - 1, Math.max(0, (y / CF) | 0)) * cw + Math.min(cw - 1, Math.max(0, (x / CF) | 0));
  let tfDay = -1, tfSets = -1;
  function townFear() {
    const S = G.S; if (tfDay === S.day && tfSets === S.settlements.size) return; tfDay = S.day; tfSets = S.settlements.size; TF.fill(0);
    for (const s of S.settlements.values()) { const R = (s.radius || 8) + 6; for (let cy = 0; cy < cw; cy++) for (let cx = 0; cx < cw; cx++) { const d = G.dist(cx * CF + CF / 2, cy * CF + CF / 2, s.cx, s.cy); if (d < R + CF * 0.7) { const v = d < (s.radius || 8) ? 140 : 80; const j = cy * cw + cx; if (TF[j] < v) TF[j] = v; } } }
  }
  const fearAt = (x, y) => { cells(); const j = cellOf(x, y); return Math.min(1, PF[j] + TF[j] / 255); };
  Mi.fearAt = fearAt;
  Mi.learnt = (x, y) => { cells(); return PF[cellOf(x, y)]; }; // (what the hunts taught, without the towns' own fear)
  // a person hurt or killed a wild beast here: the ground remembers
  function taught(x, y, k) { cells(); const c = cellOf(x, y); const cx = c % cw, cy = (c / cw) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x1 = cx + dx, y1 = cy + dy; if (x1 < 0 || y1 < 0 || x1 >= cw || y1 >= cw) continue; const j = y1 * cw + x1; PF[j] = Math.min(1, r3(PF[j] + (dx || dy ? k * 0.35 : k))); } }
  Mi.taught = taught;
  // fire in a person's hand or beside them at night: the beasts keep off
  function fireGuard(v) {
    if (!ENV.night) return false; if (v.holdTorch || v.lantern) return true;
    const S = G.S; const x = v.x | 0, y = v.y | 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const b = S.occ[ny * N + nx]; if (b) { const B = S.buildings.get(b); if (B && B.type === 'campfire' && B.built) return true; } }
    return false;
  }
  Mi.fireGuard = fireGuard;
  const person = o => o.kind === undefined;

  // ------------------------------ the town: a place the wild avoids by day (D-305) ------------------------------
  // the ground of a town, by cells of two tiles: the settlement whose radius (and two tiles of fields and outskirts) covers it —
  // made again in the world's step on every tenth second of the clock and when the towns change (a town is founded, falls); a
  // question from outside the step reads the grid as it is (L-760's rule: the checker must not make the world's grid)
  const TC = 2; let tw = 0, TOWN = null, townT = -1, townN = -1; const TOWNS = [], FIRES = [];
  function townGrid() {
    const S = G.S; const c = Math.ceil(N / TC); const ep = Math.floor(S.clock / 10);
    if (TOWN && tw === c && townN === S.settlements.size && ep === townT) return;
    tw = c; if (!TOWN || TOWN.length !== c * c) TOWN = new Uint16Array(c * c); else TOWN.fill(0); townT = ep; townN = S.settlements.size; TOWNS.length = 0; FIRES.length = 0;
    for (const st of S.settlements.values()) {
      const R = (st.radius || 8) + 2; TOWNS.push(st); const k = TOWNS.length; if (k > 65000) break;
      const x0 = Math.max(0, ((st.cx - R) / TC) | 0), x1 = Math.min(c - 1, ((st.cx + R) / TC) | 0), y0 = Math.max(0, ((st.cy - R) / TC) | 0), y1 = Math.min(c - 1, ((st.cy + R) / TC) | 0);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (G.dist(x * TC + 1, y * TC + 1, st.cx, st.cy) < R && !TOWN[y * c + x]) TOWN[y * c + x] = k;
    }
    // (and the built ground past the ring: the farm out in the fields, the house at the far end of the road)
    const K = new Map(TOWNS.map((st, i) => [st.id, i + 1]));
    for (const b of S.buildings.values()) {
      const k = K.get(b.set); if (!k || b.type === 'ruin' || b.type === 'cemetery') continue; if (b.type === 'campfire' && b.built) FIRES.push(b.x + 0.5, b.y + 0.5);
      for (let y = Math.max(0, (b.y / TC) | 0); y <= Math.min(c - 1, ((b.y + (b.h || 1) - 1) / TC) | 0); y++) for (let x = Math.max(0, (b.x / TC) | 0); x <= Math.min(c - 1, ((b.x + (b.w || 1) - 1) / TC) | 0); x++) if (!TOWN[y * c + x]) TOWN[y * c + x] = k;
    }
  }
  // the night's fire of a town near a point (four tiles): the beasts that the day keeps out keep off it by night
  function fireNear(x, y) { for (let k = 0; k < FIRES.length; k += 2) if (Math.abs(FIRES[k] - x) < 4 && Math.abs(FIRES[k + 1] - y) < 4) return k; return -1; }
  const roadAt = (x, y) => W.inb(x, y) && !!G.S.road[W.idx(x, y)];
  // a place off the road, a few tiles from it (the side chosen by the beast's own number, no chance)
  function offRoad(a, x, y) {
    const k0 = Math.floor(G.hash(a.id * 13 + 5) * 8);
    for (let d = 2; d <= 5; d++) for (let k = 0; k < 8; k++) { const an = (k0 + k) * Math.PI / 4; const px = x + Math.cos(an) * d, py = y + Math.sin(an) * d; if (W.inb(px, py) && !roadAt(px, py) && !townAt(px, py) && A.walkOK(a, px, py)) return [px, py]; }
    return null;
  }
  const townAt = (x, y) => { if (!TOWN || x < 0 || y < 0 || x >= N || y >= N) return null; const k = TOWN[((y / TC) | 0) * tw + ((x / TC) | 0)]; return k ? TOWNS[k - 1] : null; };
  Mi.townAt = townAt;
  // a dangerous beast the town keeps out now — by day, and not one the town cannot keep out: the one that guards its own (angry);
  // the hunt on a person (the man-eater, D-276) or on the herd of a pen (the raid); the starving, wounded or old hunter after
  // whatever it found (a cold-blooded hunter is not driven by hunger into the houses). Idle, even those walk out.
  const HUNT = { chase: 1, stalk: 1, flank: 1, lunge: 1, pounce: 1, strike: 1 };
  const desperate = (a, sp) => A.predator(a.kind) && !REPTILE.has(a.kind) && (a.hunger > 0.85 || a.hp < a.maxHp * 0.4 || a.age > sp.life * a.lifeMul * 0.88);
  function shunned(a, sp) {
    if (Mi.off.town || !DANGER.has(a.kind) || !ENV.day || ENV.t > 0.7 || a.angry > 0) return false;
    if (HUNT[a.state] && a.target && !a.carc && (a.onPerson || (G.S.animals.get(a.target) || {}).dom || desperate(a, sp))) return false;
    return true;
  }
  Mi.shunned = a => { const sp = SP[a.kind]; return !!sp && wild(a, sp) && shunned(a, sp); };
  // the way out: away from the town's heart, on ground it stands on, a few tiles past the edge
  function wayOut(a, st) {
    const a0 = Math.atan2(a.y - st.cy, a.x - st.cx);
    for (const R of [(st.radius || 8) + 5, (st.radius || 8) + 10]) for (let k = 0; k < 16; k++) {
      const an = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.39; const x = st.cx + Math.cos(an) * R, y = st.cy + Math.sin(an) * R;
      if (W.inb(x, y) && A.walkOK(a, x, y) && !townAt(x, y) && W.canWalk(a.x, a.y, x, y, true)) return [x, y];
    }
    return null;
  }
  // out of the town: not among the houses, the nearest way to the open (and the home range with it, when the town grew over it)
  function leaveStep(a, dt, sp, S) {
    const r = RUN.get(a.id); if (!r || r.o !== 'sair') { a.state = 'idle'; return true; } r.q += dt;
    if (r.q > 45 || !townAt(a.x, a.y)) { if (G.dist(a.hx, a.hy, a.x, a.y) > 3 && townAt(a.hx, a.hy)) { a.hx = r.gx; a.hy = r.gy; } return quit(a, null, 1); }
    // (on its way out it minds the hunters that eat it, not the people it is already walking away from)
    r.sc -= dt; if (r.sc <= 0) { r.sc = 0.5; const th = A.fearOf(a); if (th && th.kind) { quit(a, null, 0); a.scan = 0; return false; } }
    const w = walk(a, r, dt, r.fast ? sp.run * 0.85 : sp.sp * 1.25, 2.5); if (w === null) return true;
    if (w) { const st = townAt(a.x, a.y); const g = st && wayOut(a, st); if (!g || ++r.re > 3) return quit(a); r.gx = g[0]; r.gy = g[1]; }
    return true;
  }
  function leaveTown(a, sp, st, fast) {
    const g = wayOut(a, st); if (!g) return false;
    const r = runStart(a, 'sair'); r.gx = g[0]; r.gy = g[1]; r.fast = fast ? 1 : 0; if (!fast) gest(a, Ge.can(a.kind, 'alert') ? 'alert' : 'stare', undefined, 0, 0, true); count(fast ? 'boltedOut' : 'leftTown');
    return true;
  }

  // ------------------------------ the senses (A.senseHooks, D-301) ------------------------------
  // how far a beast notices another (or a person): pure — it reads and never writes, never draws a chance (the guard, rule 103)
  function sense(a, o) {
    const sa = SP[a.kind]; if (!sa || sa.cls === 'water' || Mi.off.sense || a.dom || sa.dom || sa.town || a.pen || a.tamed) return 1; // (the herds and the town's beasts are the people's: as they were)
    const S = G.S;
    if (o.state === 'toca') return 0.12; // (down the burrow: nothing to see, little to smell)
    let k = 1;
    // the wind and the nose
    if (NOSE.has(a.kind)) k *= scent(a, o);
    // the cover the other keeps still in (a stalker in the tall grass, a fawn lying hidden); running, it is seen
    const io = W.idx(o.x, o.y), ia = W.idx(a.x, a.y);
    if ((o.crouch || !o.moving) && o.state !== 'chase' && o.state !== 'flee' && o.state !== 'strike') {
      const c = coverAt(io); if (c > 0) k *= 1 - 0.35 * c;
      if (o.crouch || o.gest === 'hide') k *= 0.8;
    }
    // the dark, the rain, the storm's noise
    if (ENV.night && !NIGHT.has(a.kind)) k *= 0.85;
    if (ENV.rain > 0) k *= 1 - 0.2 * ENV.rain; if (ENV.storm) k *= 0.85;
    // the head down at the water (the giraffe splayed, worst of all); a look from a hill; an alarm heard; many eyes about
    if (a.gest === 'drink') k *= a.kind === 'giraffe' ? 0.6 : 0.75;
    else if (a.state === 'graze') k *= 0.88;
    const dh = S.th[ia] - S.th[io]; if (dh > 1) k *= dh > 2.5 ? 1.15 : 1.08;
    if (a.state === 'vigia') k *= 1.15;
    const m = a.meio; if (m && m.al > 0) k *= 1.15;
    const ey = EYES.get(a.id); if (ey) k *= 1 + 0.015 * ey;
    // people: where they hunted, sooner; where they never did, later; a torch at night, from far
    if (person(o) && !a.shelter) { cells(); const j = cellOf(a.x, a.y); /* (the storm drives one to a cave's roof past what the hunts taught) */ const f = Math.min(1, PF[j] + 0.45 * TF[j] / 255); k *= f < 0.04 ? 0.85 : 1 + 0.7 * f; if (fireGuard(o)) k *= 1.5; if (m && m.th > 0.8) k *= 1 - (m.th - 0.8) * 1.5; } // (the thirsty dare more)
    return k < 0.1 ? 0.1 : k > 1.8 ? 1.8 : k; // (the wind, the hill and an alarm together: not twice as far)
  }
  Mi.sense = sense;

  // ------------------------------ the stride (A.speedHooks) ------------------------------
  // pure as the senses: the hill climbed (the climbers do not feel it — the ibex leaves the wolf below), the snow, the heat
  // and the thirst that slow a body, the cold that slows a reptile; and the panic of a herd in the water
  function speed(a) {
    const sp = SP[a.kind]; if (!sp || !land(sp) || Mi.off.speed || a.dom || sp.dom || sp.town || a.pen || a.tamed) return 1;
    const S = G.S; let k = 1;
    const dx = a.tx - a.x, dy = a.ty - a.y; const l = Math.abs(dx) + Math.abs(dy); const i0 = W.idx(a.x, a.y);
    if (l > 0.05 && S.slope[i0] > 0.25) { /* (flat ground: no hill to climb) */ const h = Math.hypot(dx, dy); const x1 = a.x + dx / h * 0.8, y1 = a.y + dy / h * 0.8; if (x1 >= 0 && y1 >= 0 && x1 < N && y1 < N) { const d = S.th[W.idx(x1, y1)] - S.th[i0]; if (d > 0.05) k /= 1 + d * (CLIMBER.has(a.kind) ? 0.06 : 0.4); else if (d < -0.05) k *= 1 + Math.min(0.12, -d * 0.05); } }
    const m = a.meio; if (!m) return k;
    if (m.cold > 0.6 && !SNOWOK.has(a.kind) && snowAt(a.x, a.y)) k *= 0.75;
    if (m.hot > 0.85) k *= 0.88; if (m.th >= 0.95) k *= 0.85;
    if (REPTILE.has(a.kind) && m.cold > 0.3) k *= 1 - 0.45 * (m.cold - 0.3);
    if (a.state === 'travessia') { const r = RUN.get(a.id); if (r && r.p === 2) k *= 1.25; }
    return k;
  }
  Mi.speed = speed;
  function snowAt(x, y) { const S = G.S; const i = W.idx(x, y); if (S.biome && S.biome[i] === 1) return true; if (S.winters) for (const q of S.winters) if (q.t > 2 && G.dist(x, y, q.x, q.y) <= q.r) return true; return false; }

  // ------------------------------ the life of the body (A.lifeHooks) ------------------------------
  const C = {}; // the counts of what the world made the beasts do (S.meio.n: in the save)
  const count = k => { C[k] = (C[k] || 0) + 1; };
  function lifeHook(a, sp, dt, S) {
    if (!land(sp)) return true;
    if (!wild(a, sp)) { if (a.dom && a.flee > 0 && !a.gest) gest(a, 'call', undefined, 0, 0); return true; } // (the herd's cry at the wolf)
    const m = meioOf(a); const i = W.idx(a.x, a.y); const t = S.type[i]; const rate = Mi.off.thirst ? 0 : THIRST[a.kind] || 0;
    const r = RUN.get(a.id);
    // a state of this module left for another (a flight, a hunt, the world's hand): what it held goes with it
    if (r && r.o !== a.state) endRun(a, r);
    else if (!r && m.g) { const gn = Ge.ids[m.g - 1]; if (a.gest !== gn) m.g = 0; else if (Ge.DEF[gn].d === 0 && !MINE[a.state]) { A.gestEnd(a, gn); m.g = 0; } }
    if (m.al > 0) m.al = Math.max(0, Math.round(m.al - dt));
    const st = a.state;
    // ---- the town by day (D-305): the shunned one inside walks out; its wander into a town is turned back; a chase of a wild
    // prey into the houses is given up
    if (DANGER.has(a.kind) && st !== 'sair' && shunned(a, sp)) {
      const tin = townAt(a.x, a.y);
      if (tin && (st === 'idle' || st === 'wander' || st === 'graze' || st === 'lurk' || (MINE[st] && st !== 'beber'))) { if (leaveTown(a, sp, tin)) return true; }
      // (startled among the houses, it bolts for the open, not deeper in away from whoever startled it)
      else if (tin && st === 'flee') { if (leaveTown(a, sp, tin, true)) return true; }
      else if (!tin && st === 'wander') { const to = townAt(a.tx, a.ty); const g = to ? wayOut({ x: a.tx, y: a.ty, kind: a.kind }, to) : roadAt(a.tx, a.ty) ? offRoad(a, a.tx, a.ty) : null; if (g) { a.tx = g[0]; a.ty = g[1]; a.path = null; count('turnedBack'); } }
      else if ((st === 'chase' || st === 'stalk' || st === 'flank' || st === 'lunge') && a.target) { const p = S.animals.get(a.target); if (p && (a.carc || !p.dom) && townAt(p.x, p.y)) { a.state = 'idle'; a.target = 0; a.crouch = 0; a.rest = Math.max(a.rest || 0, 8); a.t = 1; count('chaseOff'); } }
    }
    // ---- the fire of a town at night: the wander that would end beside it turns away (D-305)
    else if (DANGER.has(a.kind) && ENV.night && st === 'wander' && !Mi.off.town && FIRES.length && !(a.hunger > 0.85)) {
      const k = fireNear(a.tx, a.ty); if (k >= 0) { const dx = a.tx - FIRES[k], dy = a.ty - FIRES[k + 1], d = Math.hypot(dx, dy) || 1; const x = FIRES[k] + dx / d * 7, y = FIRES[k + 1] + dy / d * 7; if (W.inb(x, y) && A.walkOK(a, x, y)) { a.tx = x; a.ty = y; a.path = null; count('fireKept'); } }
    }
    // ---- a flight just begun: to the refuge the ground gives, and the call that warns the others
    if (st === 'flee' && !Mi.off.flee) { const f = FLED.get(a.id); if (f === undefined || S.clock - f > 3) { FLED.set(a.id, S.clock); fled(a, sp); } }
    else if (st === 'idle' && FLED.has(a.id)) { FLED.delete(a.id); const rf = REFUGE.get(a.id); if (rf) { REFUGE.delete(a.id); refugeArrived(a, sp, rf); } }
    // ---- the thirst that cannot wait: the migrant on its way (the brain is not asked while it travels), the beast the brain left
    // to the old ways — near the end of its thirst, it goes down to the water whatever it was doing at leisure
    if (rate && m.th > 0.78 && !r && !a.shelter && (st === 'idle' || st === 'wander' || st === 'graze') && !(URGE.get(a.id) > S.clock - 6)) { URGE.set(a.id, S.clock); if (DRINK.start(a, sp, S)) count('urge'); }
    // ---- the storm stops a herd on its way: backs to the wind, heads down, together
    else if (ENV.storm && a.mig && !a.shelter && st === 'wander' && (MIGR(a.kind) || K.huddle.has(a.kind)) && !(URGE.get(a.id) > S.clock - 6)) { URGE.set(a.id, S.clock); HUDDLE.start(a, sp, S); }
    // ---- the migrating herd at a river (D-302)
    else if (a.mig && st === 'wander' && MIGR(a.kind)) toRiver(a, sp);
    // ---- the slow part: the wet, the mud and the dust on the coat, the shake, the shiver and the pant, the eyes about
    let s = (SLOW.get(a.id) || 0) + dt; if (s < 2) { SLOW.set(a.id, s); return true; } SLOW.set(a.id, 0);
    const water = t === T.RIVER && !(S.ice && S.ice[i]);
    if (!body(a, sp, s, S, m, i, water)) return false;
    return slow(a, sp, s, S, m, i, water);
  }
  // the thirst, the heat and the cold: they change over tens of seconds — looked at every two seconds, with the time gone by
  function body(a, sp, dt, S, m, i, water) {
    const dayF = dt / DAY();
    // ---- the thirst
    const rate = Mi.off.thirst ? 0 : THIRST[a.kind] || 0;
    if (rate) {
      if (water && (sp.cls === 'amph' || a.swim || a.state === 'banho' || a.state === 'rio')) m.th = 0; // (it lives in it, or stands in it)
      else {
        fields(); const D = field(); const far = D[i] > REACH;
        const cap = far ? (ENV.dry ? 0.9 : 0.6) : 1; // (no water in reach: it lives on the wet of its food — the drought makes it suffer)
        if (m.th < cap) m.th = r3(Math.min(cap, m.th + dayF * rate * (1 + 0.4 * m.hot) * (ENV.dry ? 1.6 : 1)));
        if (m.th >= 1) { a.hp -= dt * sp.hp / (DAY() * 2.2); if (a.hp <= 0) { thirstDeath(a); return false; } }
        // (the drought takes the weak first: the young and the old)
        else if (ENV.dry && m.th > 0.8 && (a.grown < 0.5 || a.age > sp.life * a.lifeMul * 0.9)) { a.hp -= dt * sp.hp / (DAY() * 3); if (a.hp <= 0) { thirstDeath(a); return false; } }
      }
    }
    // ---- the heat (the sun on the tile, the land's warmth; the shade, the water and the mud cool) and the cold
    const tp = S.temp ? S.temp[i] / 255 : 0.5; const hk = HEAT[a.kind] || 1, ck = COLD[a.kind] || 1;
    let he = c01((tp - 0.45) * 2.2) * ENV.sun * (ENV.rain > 0.3 ? 0.35 : 1) * (ENV.dry ? 1.25 : 1);
    if (water || a.swim) he = 0; else { if (he > 0.05 && shadeAt(i)) he *= 0.35; he *= 1 - 0.5 * m.mud; if (a.state === 'chase' || a.state === 'flee') he += 0.25 * ENV.sun; }
    m.hot = r3(c01(m.hot + (c01(he * hk) - m.hot) * Math.min(1, dt / 35)));
    let ce = c01((0.42 - tp) * 2.4) + (ENV.night ? 0.18 : 0) + ENV.rain * 0.2 + (ENV.storm ? 0.15 : 0) + ENV.ws * 0.05 + m.wet * 0.15;
    if (S.winters && S.winters.length) for (const q of S.winters) if (q.t > 2 && G.dist(a.x, a.y, q.x, q.y) <= q.r) { ce += 0.7; break; }
    if (REPTILE.has(a.kind) && ENV.sun > 0.15 && !(ENV.rain > 0.3)) ce -= 0.35 * ENV.sun * (a.state === 'sol' ? 2.2 : 1);
    ce *= ck; const st = a.state;
    if (st === 'toca') ce *= 0.2; else if (st === 'aconchego') ce *= 0.5; else if (st === 'enrolar' || st === 'abrigo') ce *= 0.65; else if (ce > 0.3 && coverAt(i) >= 0.7) ce *= 0.85;
    m.cold = r3(c01(m.cold + (c01(ce) - m.cold) * Math.min(1, dt / 30)));
    if (m.cold > 0.45 && !REPTILE.has(a.kind)) a.hunger = Math.min(1, a.hunger + dayF * 0.12 * m.cold); // (the cold burns the body's fat)
    return true;
  }

  function slow(a, sp, dt, S, m, i, water) {
    const rain = ENV.rain > 0.05 ? Math.max(ENV.rain * 0.5, G.Nature.rainAt(a.x, a.y)) : G.Nature.rainAt(a.x, a.y);
    if (water || a.swim) { m.wet = 1; m.mud = r3(Math.max(0, m.mud - dt / 8)); m.dust = 0; }
    else {
      if (rain > 0.05) m.wet = r3(c01(m.wet + rain * dt / 8));
      else if (m.wet > 0) m.wet = r3(Math.max(0, m.wet - dt / (DAY() * 0.3) * (0.5 + ENV.sun + ENV.ws * 0.3))); // (dry in a few dozen seconds of sun and wind)
      if (rain > 0.4) { m.mud = r3(Math.max(0, m.mud - dt * rain / 30)); m.dust = r3(Math.max(0, m.dust - dt * rain / 20)); }
    }
    if (m.mud > 0) m.mud = r3(Math.max(0, m.mud - dt / (DAY() * 0.7)));
    if (m.dust > 0) m.dust = r3(Math.max(0, m.dust - dt / (DAY() * 0.5)));
    const st = a.state; const still = !a.moving && (st === 'idle' || st === 'graze' || MINE[st]) && !RUNNING[st];
    // the shake: the coat soaked, out of the water and the rain, standing — the spray of drops
    if (m.wet > 0.4 && !water && !a.swim && rain < 0.1 && still && !WETST[st]) { if (gest(a, 'shake')) { m.wet = r3(m.wet * 0.35); count('shake'); } }
    else if (m.cold > 0.62 && still && st !== 'aconchego' && st !== 'enrolar' && st !== 'toca') gest(a, 'shiver', 5);
    else if (m.hot > 0.66 && still) gest(a, 'pant', 5);
    // many eyes: the grazers of any kind around (a mixed herd keeps watch for all)
    if (!A.predator(a.kind) && (st === 'idle' || st === 'graze' || st === 'beber' || st === 'wander')) { let n = 0; A.near(a.x, a.y, 3.5, o => { if (o !== a && !o.dead && !A.predator(o.kind) && SP[o.kind] && land(SP[o.kind])) n++; }); if (n) EYES.set(a.id, Math.min(6, n)); else EYES.delete(a.id); }
    else EYES.delete(a.id);
    // the seed in the belly of a fruit eater, dropped where it rests (D-304)
    const sd = SEED.get(a.id); if (sd && S.clock - sd.t > 50 && (st === 'idle' || st === 'sombra' || st === 'graze')) { SEED.delete(a.id); if (G.R() < 0.35) plant(a, sd.k); }
    return true;
  }
  const EYES = new Map(); G.worldHooks.push(() => EYES.clear());
  const RUNNING = { flee: 1, chase: 1, stalk: 1, pounce: 1, flank: 1, strike: 1, lunge: 1 };
  const WETST = { beber: 1, banho: 1, lama: 1, rio: 1, travessia: 1, toca: 1 }; // (in the water, or in the mud: no shaking yet)
  function thirstDeath(a) {
    const S = G.S; A.kill(a, null, 'thirst'); count('thirstDead');
    const d = st0().dr; if (d) { d.dead = (d.dead || 0) + 1; d.k = d.k || {}; d.k[a.kind] = (d.k[a.kind] || 0) + 1; d.x = r3(a.x); d.y = r3(a.y); }
    void S;
  }

  // ------------------------------ the refuge the ground gives (D-303) ------------------------------
  // a prey that runs runs to where its hunter cannot follow: the capybara, the otter and the hippo into the water, the ibex up
  // to the rock, the rabbit and the fox down their burrow (its own, a.meio.bx/by) — where there is one near, and not back
  // towards what it flees (the flight's own way out, a.tx/a.ty). A module of the hunt that steers its own flights asks the
  // same here (G.Meio.refuge) and sets G.Luta.ownsFlee
  const REFUGE = new Map(); G.worldHooks.push(() => REFUGE.clear());
  function refuge(a, fx, fy) {
    const sp = SP[a.kind]; if (!sp) return null; const S = G.S; fields();
    const ux = a.x - fx, uy = a.y - fy; const ul = Math.hypot(ux, uy) || 1;
    const ok = (x, y) => ((x - a.x) * ux + (y - a.y) * uy) / ul / (Math.hypot(x - a.x, y - a.y) || 1) > -0.35;
    if (K.toWater.has(a.kind)) {
      const i = W.idx(a.x, a.y); if (dF[i] <= 5) { const b = bankFrom(i, dF); const w = b >= 0 ? waterBy(b) : -1; if (w >= 0) { const x = (w % N) + 0.5, y = ((w / N) | 0) + 0.5; if (ok(x, y) && A.walkOK(a, x, y)) return [x, y, 'agua']; } }
    }
    if (K.burrow.has(a.kind)) { const m = meioOf(a); if (m.bx >= 0) { const x = m.bx + 0.5, y = m.by + 0.5; if (G.dist(a.x, a.y, x, y) < 6 && ok(x, y) && A.walkOK(a, x, y)) return [x, y, 'toca']; } }
    if (K.toCliff.has(a.kind)) {
      const h0 = S.th[W.idx(a.x, a.y)]; let best = null, bh = h0 + 0.8;
      for (let k = 0; k < 12; k++) { const ang = k / 12 * 6.283; const x = a.x + Math.cos(ang) * 5, y = a.y + Math.sin(ang) * 5; if (!W.inb(x, y) || !ok(x, y) || !A.walkOK(a, x, y)) continue; const j = W.idx(x, y); const h = S.th[j] + (S.cliff[j] ? 1.5 : 0); if (h > bh) { bh = h; best = [x, y, 'alto']; } }
      if (best) return best;
    }
    return null;
  }
  Mi.refuge = refuge;
  function fled(a, sp) {
    // (where it runs from: back along its flight's way out)
    const fx = a.x - (a.tx - a.x), fy = a.y - (a.ty - a.y);
    // (not every flight finds its refuge: in a hurry, seven in ten — by the beast and the moment, no chance drawn)
    if (!(G.Luta && G.Luta.ownsFlee) && G.hash(a.id * 31 + (G.S.clock | 0)) < 0.7) { const rf = refuge(a, fx, fy); if (rf) { a.tx = rf[0]; a.ty = rf[1]; a.path = null; a.t = Math.max(a.t || 0, 4); REFUGE.set(a.id, rf); count('refuge'); } }
    // the call: the zebra's snort, the monkey's bark, the gazelle's leaps — heard by every kind around
    const g = K.caller[a.kind]; if (g && !(CALL.get(a.id) > G.S.clock - 40)) alarm(a, g);
  }
  function refugeArrived(a, sp, rf) {
    if (G.dist(a.x, a.y, rf[0], rf[1]) > 1.2) return;
    if (rf[2] === 'toca' && MINE.toca) startToca(a, sp, 8 + G.hash(a.id + (G.S.clock | 0)) * 6);
    else if (rf[2] === 'agua') { gest(a, 'dive'); if (a.kind === 'hippo') { const r = runStart(a, 'rio'); r.p = 1; r.k = 1; } else if (K.soak.has(a.kind) || a.kind === 'capybara') { const r = runStart(a, 'banho'); r.p = 1; r.gx = a.x; r.gy = a.y; r.b = 12; } }
    else if (rf[2] === 'alto') gest(a, 'stare', 3);
  }

  // ------------------------------ the alarm across kinds (D-306) ------------------------------
  // a call is heard by every grazer around, of any kind: on alert (a.meio.al) its senses reach farther for a while, and it
  // lifts its head. The brain's own answer to an alarm (fear, the herd's flight) is the brain's: G.Mente.alarm, when it has one
  function alarm(a, g) {
    // (a hunter after it, or near and awake to it: the call; people only where people are a strange sight — by a town's fields
    // a deer runs in silence; and one call in a while from each, not a cry at every start)
    const S = G.S; let lvl = 0; const eat = A.eatenBy[a.kind];
    if (eat) A.near(a.x, a.y, 9, o => { if (!o.dead && eat.includes(o.kind) && (RUNNING[o.state] || G.dist2(a.x, a.y, o.x, o.y) < 36)) lvl = 2; });
    if (!lvl) { cells(); if (TF[cellOf(a.x, a.y)] > 0 || PF[cellOf(a.x, a.y)] > 0.2) return; lvl = 1; }
    CALL.set(a.id, S.clock); gest(a, g, undefined, 0, 0); count('alarm');
    const R = a.kind === 'monkey' || a.kind === 'elephant' ? 11 : 8; const kinds = {};
    A.near(a.x, a.y, R, o => {
      if (o === a || o.dead || o.held || A.predator(o.kind)) return; const so = SP[o.kind]; if (!so || !land(so) || !wild(o, so)) return;
      if (G.dist2(a.x, a.y, o.x, o.y) > R * R) return;
      const m = meioOf(o); m.al = Math.max(m.al, lvl > 1 ? 25 : 12);
      if (o.state === 'idle' || o.state === 'graze' || o.state === 'beber' || MINE[o.state]) { G.faceTo(o, a.x - o.x, a.y - o.y); gest(o, 'alert', undefined, a.id, 0); }
      if (o.kind !== a.kind && !kinds[o.kind]) { kinds[o.kind] = 1; count('alarmX'); }
    });
    if (G.Mente && G.Mente.alarm) G.Mente.alarm(a.x, a.y, a.kind, lvl);
  }
  Mi.alarm = alarm;

  // ------------------------------ the river crossing of a migrating herd (D-302) ------------------------------
  // the herd that follows the grass meets a river: it does not walk in. It gathers at the bank, heads low, snorting at the water;
  // the press of the ones behind grows, one goes in, and the rest pour after it — swimming, the crocodiles of the ford waiting.
  // On the far bank they shake the water off. Nobody wrote the scene: the herd's way, the river and the crocodile's wait meet.
  const XS = new Map(); // (the crossings now, by herd: { x, y, fx, fy, t0, go, n, crossed, lost, kind, last })
  Mi.crossings = () => [...XS.values()].map(c => ({ x: c.x, y: c.y, fx: c.fx, fy: c.fy, kind: c.kind, n: c.n, crossed: c.crossed, lost: c.lost, go: c.go }));
  function toRiver(a, sp) {
    const S = G.S; if (RUN.has(a.id)) return;
    const dx = a.tx - a.x, dy = a.ty - a.y; const d = Math.hypot(dx, dy); if (d < 0.5) return;
    const ux = dx / d, uy = dy / d; let wet = -1, bank = null;
    for (let s = 0.5; s <= Math.min(4, d + 1); s += 0.5) { const x = a.x + ux * s, y = a.y + uy * s; if (!W.inb(x, y)) return; const j = W.idx(x, y); if (S.type[j] === T.RIVER && !(S.ice && S.ice[j])) { wet = s; break; } bank = [x, y]; }
    if (wet < 0) return;
    // the far bank, along the way home (a lake too wide to swim is walked round)
    let far = null, deep = false; for (let s = wet; s <= wet + 7; s += 0.5) { const x = a.x + ux * s, y = a.y + uy * s; if (!W.inb(x, y)) return; const j = W.idx(x, y); if (S.type[j] === T.RIVER) { if (S.deep[j]) deep = true; continue; } if (S.type[j] < T.SAND) return; far = [x + ux * 0.6, y + uy * 0.6]; break; }
    if (!far || (deep && !sp.swims) || !A.walkOK(a, far[0], far[1])) return;
    if (!bank) bank = [a.x, a.y];
    // (the herd's crossing here — another river further on is another crossing)
    const L = (a.leader || a.id) * 4096 + cellOf(bank[0], bank[1]); let c = XS.get(L);
    if (!c || S.clock - c.last > 40) { c = { x: r3(bank[0] - ux * 0.4), y: r3(bank[1] - uy * 0.4), fx: r3(far[0]), fy: r3(far[1]), ux, uy, t0: S.clock, go: 0, n: 0, crossed: 0, lost: 0, kind: a.kind, last: S.clock, members: 0, deep }; let n = 0; A.near(a.x, a.y, 15, o => { if (!o.dead && o.kind === a.kind && (o.leader || o.id) === L) n++; }); c.members = n; XS.set(L, c); }
    const r = runStart(a, 'travessia'); r.k = L;
    // (each to its own place on the bank: a front along the water, by the beast's id)
    const side = (G.hash(a.id) - 0.5) * 3; r.gx = c.x - c.uy * side; r.gy = c.y + c.ux * side; if (!A.walkOK(a, r.gx, r.gy)) { r.gx = bank[0]; r.gy = bank[1]; }
    r.fx = c.fx - c.uy * side; r.fy = c.fy + c.ux * side; if (!A.walkOK(a, r.fx, r.fy)) { r.fx = c.fx; r.fy = c.fy; }
    c.last = S.clock;
  }
  function crossStep(a, dt, sp, S) {
    const r = RUN.get(a.id); if (!r || r.o !== 'travessia') { a.state = 'idle'; return true; }
    const c = XS.get(r.k); if (!c) return quit(a);
    r.q += dt; c.last = S.clock;
    if (S.clock - r.t0 > 110) return quit(a);
    if (r.p === 0) { // to the bank
      if (watch(a, r, dt)) return false;
      const w = walk(a, r, dt, sp.sp * 1.1, 1.6); if (w === null) return true;
      if (w) { r.p = 1; r.q = 0; c.n++; G.faceTo(a, c.fx - a.x, c.fy - a.y); }
      return true;
    }
    if (r.p === 1) { // at the bank: the herd gathers, and stares at the water
      a.moving = false; G.faceTo(a, c.fx - a.x, c.fy - a.y);
      const cyc = (r.q + G.hash(a.id) * 6) % 6;
      gest(a, cyc < 2.5 ? 'stare' : cyc < 3.6 ? (Ge.can(a.kind, 'snort') ? 'snort' : 'alert') : cyc < 4.6 ? (Ge.can(a.kind, 'paw') ? 'paw' : 'sniff') : 'alert', cyc < 2.5 ? 0 : undefined, 0, 0, true);
      // the press from behind: enough of the herd on the bank, or the wait too long — and one goes in, and they all follow
      if (!c.go && ((c.n >= Math.max(3, Math.ceil(c.members * 0.55)) && r.q > 5) || r.q > 18)) { c.go = S.clock; if (c.n >= 6) count('crossBig'); }
      if (c.go && S.clock - c.go > G.hash(a.id + 7) * 3.2) { r.p = 2; r.q = 0; r.gx = r.fx; r.gy = r.fy; gest(a, 'startle', undefined, 0, 0, true); }
      return false; // (standing: the world's fear scan — a lion on the bank, and the herd breaks)
    }
    if (r.p === 2) { // in the water
      const j = W.idx(a.x, a.y); const inw = S.type[j] === T.RIVER;
      if (inw) gest(a, a.swim || S.deep[j] ? 'swim' : 'wade', 0, 0, 0, true);
      const w = walk(a, r, dt, sp.run * 0.75, 1.4); if (w === null) return true;
      if (w || (!inw && r.q > 2 && G.dist(a.x, a.y, r.gx, r.gy) < 1.4)) { r.p = 3; r.q = 0; meioOf(a).wet = 1; c.crossed++; count('cross'); gest(a, 'shake', undefined, 0, 0, true); }
      return true;
    }
    a.moving = false; // on the far bank: the water off the coat
    if (r.q > 1.5) return quit(a, null, 0.5);
    return true;
  }
  // a crossing ends when nobody of it has been in it for a while: the chronicle hears of a great one
  function crossingsTick() {
    const S = G.S;
    for (const [L, c] of XS) {
      if (S.clock - c.last < 25) continue; XS.delete(L);
      if (c.crossed >= 6) {
        const lg = st0().lg; const key = 'x' + cellOf(c.x, c.y);
        if (!(lg[key] > S.day - 3) && !(lg.x > S.day - 1)) { lg[key] = S.day; lg.x = S.day;
          log(`Uma grande travessia: ${c.crossed} ${nm(c.kind, c.crossed)} se lançaram ao rio${where(c.x, c.y).at}, ${SP[c.kind].g === 'f' ? 'uma atrás da outra' : 'um atrás do outro'}, nadando contra a correnteza${c.lost ? ` — e o rio ficou com ${c.lost > 1 ? c.lost : 'um'} del${SP[c.kind].g === 'f' ? 'as' : 'es'}` : ''}.`, 'deer', c.x, c.y); }
      }
    }
  }

  // ------------------------------ the options of the brain ------------------------------
  // (an option whose place the beast could not find — no tree near, no mud, no bank — is not asked again for a while: the brain
  // would pick the same impossible best every time, and never the second)
  const FAIL = new Map(); G.worldHooks.push(() => FAIL.clear()); let optN = 0;
  function opt(name, def, kinds) {
    MINE[name] = 1; const code = ++optN;
    const who0 = def.who; def.who = (a, sp) => !Mi.off.options && (!kinds || kinds.has(a.kind)) && !a.shelter && wild(a, sp) && land(sp) && (!who0 || who0(a, sp)) && !(FAIL.get(a.id * 64 + code) > G.S.clock - 15); // (on its way to a cave's roof, it is the cave's: caves.js)
    const start0 = def.start; def.start = (a, sp, S) => {
      if (start0(a, sp, S) === false) { FAIL.set(a.id * 64 + code, G.S.clock); return false; }
      // (the town keeps the shunned out by day: no goal of theirs among the houses — but the last water of a drought, D-305)
      const r = RUN.get(a.id); if (r && DANGER.has(a.kind) && !(name === 'beber' && ENV.dry) && shunned(a, sp) && (townAt(r.gx, r.gy) || (def.rest && roadAt(r.gx, r.gy)))) { endRun(a, r); a.state = 'idle'; a.t = 1; FAIL.set(a.id * 64 + code, G.S.clock); return false; }
      return true; };
    // (a rest — the shade, the burrow, the huddle, the look-out — gives way to hunger: from where the old ways go to graze (0,25)
    // it weighs less and less, and at 0,45 it is gone; one resting that grows hungry gets up at 0,5. The time to graze is the
    // life of the herd: the births wait on a belly below 0,45 — rests that held the grazers above it emptied the land, L-1019)
    if (def.rest) { const score0 = def.score, step0 = def.step;
      def.score = (a, sp, S) => { const v = score0(a, sp, S); return a.hunger > 0.25 ? v * Math.max(0, 1 - (a.hunger - 0.25) * 5) : v; };
      def.step = (a, dt, sp, S) => (a.hunger > 0.5 && !(def.storm && ENV.storm) ? quit(a) : step0(a, dt, sp, S)); }
    if (Me && Me.option) Me.option(name, def);
    else A.behave(name, def.step, def);
    return def;
  }
  const hungry = (a, h) => a.hunger > h;
  const calm = a => !(a.meio && a.meio.al > 0) && !(a.mind && a.mind.f > 0.35);
  // ---- to the water, to drink (D-300)
  const DRINK = opt('beber', {
    who: a => !!THIRST[a.kind],
    score(a, sp, S) { const m = a.meio; if (!m || m.th < 0.45) return 0; const dw = dF ? field()[W.idx(a.x, a.y)] : 0; return -0.012 * (dw > REACH ? REACH : dw) + Math.min(0.97, 0.18 + (m.th - 0.45) * 1.45) - (m.th < 0.8 ? 0.5 * Math.max(0, a.hunger - 0.35) : 0); }, // (hungry, it grazes first — until the thirst is near its end)
    start(a, sp, S) {
      const b = drinkSpot(a); if (!b) return false;
      const r = runStart(a, 'beber'); r.gx = b.x; r.gy = b.y; r.wi = b.w;
      // (the herd comes down to the water together: the thirsty of its own follow the one that goes)
      if (!a.leader || a.leader === a.id) A.near(a.x, a.y, 10, o => { if (o === a || o.dead || o.kind !== a.kind || o.leader !== a.id || RUN.has(o.id) || !(o.state === 'idle' || o.state === 'graze' || o.state === 'wander')) return; const m = meioOf(o); if (m.th < 0.3) return; const q = drinkSpot(o); if (!q) return; const s = runStart(o, 'beber'); s.gx = q.x; s.gy = q.y; s.wi = q.w; });
      return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) {
        if (r.q > 90) return quit(a);
        if (watch(a, r, dt)) return false;
        if (!freshAt(r.wi)) { const b = drinkSpot(a); if (!b || ++r.re > 2) return quit(a, 'startle'); r.gx = b.x; r.gy = b.y; r.wi = b.w; } // (the water gone: the god dried it, a winter froze it)
        const w = walk(a, r, dt, sp.sp * (m.th > 0.85 ? 1.3 : 1.05), 0.5); if (w === null) return true;
        if (w) { r.p = 1; r.q = 0; r.b = bout(a); jostle(a); }
        return true;
      }
      a.moving = false; const wx = (r.wi % N) + 0.5, wy = ((r.wi / N) | 0) + 0.5; G.faceTo(a, wx - a.x, wy - a.y);
      if (!freshAt(r.wi)) return quit(a, 'startle');
      if (r.p === 1) { // the head down
        gest(a, 'drink', 0, 0, a.kind === 'giraffe' ? 1 : 0, true);
        m.th = r3(Math.max(0, m.th - dt / (SIP[a.kind] || 6)));
        if (m.th <= 0.03) {
          m.wx = r.wi % N; m.wy = (r.wi / N) | 0; drank(a, r.wi); count('drink');
          if (a.kind === 'elephant' && (m.hot > 0.3 || G.hash(a.id + G.S.day) < 0.4)) { r.p = 3; r.q = 0; return false; }
          return quit(a, Ge.can(a.kind, 'shake') && G.hash(a.id + 3) < 0.25 ? 'shake' : null);
        }
        if (r.q > r.b) { r.p = 2; r.q = 0; gest(a, m.al > 0 || G.hash(a.id + (r.n++)) < 0.5 ? 'alert' : (Ge.can(a.kind, 'listen') ? 'listen' : 'alert'), undefined, 0, 0, true); }
      } else if (r.p === 2) { // the head up: a look round, an ear to the wind
        if (r.q > 1.3 + (m.al > 0 ? 1.4 : 0)) { r.p = 1; r.q = 0; r.b = bout(a); }
      } else if (r.p === 3) { // the elephant's shower
        gest(a, 'spray', undefined, 0, 0, true); if (r.q > 3) { m.wet = 1; m.hot = r3(m.hot * 0.3); m.dust = 0; count('spray'); return quit(a); }
      }
      return false; // (standing at the water: the world's scans run — the prey's fear, the predator's hunt, the crocodile's strike)
    },
  });
  // a drinking bout: the prey sip and look up, the predators and the giants drink long
  function bout(a) { const m = a.meio; const base = A.predator(a.kind) || a.kind === 'elephant' || a.kind === 'hippo' || a.kind === 'rhino' ? 6.5 : 2.6; return (m && m.al > 0 ? base * 0.55 : base) * (0.8 + G.hash(a.id * 13 + (RUN.get(a.id) || {}).n) * 0.5); }
  // the giants take the water: an elephant come to drink moves the others off the bank
  function jostle(a) {
    if (a.kind !== 'elephant' && a.kind !== 'hippo' && a.kind !== 'rhino') return;
    A.near(a.x, a.y, 2.4, o => { if (o === a || o.dead || o.kind === a.kind || o.state !== 'beber' || PUSH.get(o.id) > G.S.clock - 20) return; PUSH.set(o.id, G.S.clock); const so = SP[o.kind]; if (A.predator(o.kind) && so.apex) return; const r = RUN.get(o.id); if (!r || r.p === 0) return; quit(o, 'startle', 4); const dx = o.x - a.x, dy = o.y - a.y, d = Math.hypot(dx, dy) || 1; const x = o.x + dx / d * 3, y = o.y + dy / d * 3; if (A.walkOK(o, x, y)) { o.tx = x; o.ty = y; o.state = 'wander'; o.t = 3; } count('compet'); });
  }
  // a drink counted where it was drunk: the predators learn the place (G.Meio.waterWait), the drought's last water shows
  function drank(a, wi) {
    cells(); const j = cellOf(wi % N, (wi / N) | 0); HS[j] = Math.min(250, HS[j] + 1); HW[j] = wi;
    const d = st0().dr; if (d && ENV.dry) { const c = d.c || (d.c = {}); const e = c[j] || (c[j] = { n: 0, k: {} }); e.n++; e.k[a.kind] = 1; const nk = Object.keys(e.k).length; if (!d.told && e.n >= 10 && nk >= 3) { d.told = G.S.day; const ks = Object.keys(e.k); const x = wi % N, y = (wi / N) | 0; log(`A seca juntou ${e.n} bichos de ${nk} espécies na última água${where(x, y).at}: ${ks.slice(0, 3).map(k => nm(k, 2)).join(', ')} bebem lado a lado${ks.some(k => A.predator(k)) ? '' : ' — e os predadores sabem onde esperar'}.`, 'rain', x, y); } }
  }
  // the busiest drinking place within r of a beast — where its prey come (the bank and the water): for the hunt
  Mi.waterWait = function (a, r) {
    cells(); const R = Math.ceil((r || 22) / CF); const c = cellOf(a.x, a.y); const cx = c % cw, cy = (c / cw) | 0; let best = -1, bn = 1.5;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= cw || y >= cw) continue; const j = y * cw + x; if (HS[j] > bn && HW[j] >= 0 && freshAt(HW[j])) { bn = HS[j]; best = j; } }
    if (best < 0) return null; const w = HW[best]; return { x: (w % N) + 0.5, y: ((w / N) | 0) + 0.5, n: Math.round(HS[best]) };
  };
  // the drinking places the beasts use (cells of 8 tiles, by the drinks of the last days): { x, y, n } at the water
  Mi.places = function () { cells(); const out = []; for (let j = 0; j < HS.length; j++) if (HS[j] > 0 && HW[j] >= 0) out.push({ x: (HW[j] % N) + 0.5, y: ((HW[j] / N) | 0) + 0.5, n: r3(HS[j]) }); return out; };
  // water that lasts a drought (the deep, the broad, the lakes)
  Mi.lasting = (x, y) => { fields(); return W.inb(x, y) && dL[W.idx(x, y)] === 0; };
  // the beasts drinking near a point now
  Mi.drinkers = function (x, y, r) { const out = []; A.near(x, y, r, o => { if (o.dead || o.state !== 'beber') return; const q = RUN.get(o.id); if (q && q.p >= 1 && G.dist2(x, y, o.x, o.y) < r * r) out.push(o); }); return out; };
  // ---- the predators wait where the prey come to drink (D-300): the cats in the cover by the bank, the crocodile in the water
  opt('aguada', {
    score(a, sp, S) {
      if (!hungry(a, 0.55) || a.rest > 0) return 0; const w = Mi.waterWait(a, a.kind === 'croc' ? 26 : 22); if (!w) return 0;
      let s = 0.3 + 0.35 * (a.hunger - 0.5) + Math.min(0.1, w.n * 0.01);
      if (a.kind === 'croc') for (const c of XS.values()) if (G.dist(a.x, a.y, c.x, c.y) < 26) { s += 0.25; break; }
      return s;
    },
    start(a, sp, S) {
      let w = Mi.waterWait(a, a.kind === 'croc' ? 26 : 22);
      if (a.kind === 'croc') { let bc = null, bd = 26; for (const c of XS.values()) { const d = G.dist(a.x, a.y, c.x, c.y); if (d < bd) { bd = d; bc = c; } } if (bc) { const wi = W.idx((bc.x + bc.fx) / 2, (bc.y + bc.fy) / 2); if (G.S.type[wi] === T.RIVER) w = { x: (wi % N) + 0.5, y: ((wi / N) | 0) + 0.5 }; } }
      if (!w) return false; let g = null;
      if (a.kind !== 'croc') { let big = false; A.near(w.x, w.y, 6, o => { if (!o.dead && (o.kind === 'hippo' || o.kind === 'elephant' || o.kind === 'rhino' || o.kind === 'buffalo')) big = true; }); if (big) return false; } // (a hippo's pool is no place to wait: it kills the lion that does)
      if (a.kind === 'croc' || a.kind === 'anaconda') { if (A.walkOK(a, w.x, w.y)) g = [w.x, w.y]; }
      else { let bc = -1; for (let k = 0; k < 12; k++) { const ang = k / 12 * 6.283, d = 1.8 + (k % 3) * 0.8; const x = w.x + Math.cos(ang) * d, y = w.y + Math.sin(ang) * d; if (!W.inb(x, y) || !A.walkOK(a, x, y) || G.S.type[W.idx(x, y)] === T.RIVER) continue; const c = coverAt(W.idx(x, y)); if (c > bc) { bc = c; g = [x, y]; } } }
      if (!g) return false; const r = runStart(a, 'aguada'); r.gx = g[0]; r.gy = g[1]; r.fx = w.x; r.fy = w.y; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      if (r.p === 0) { if (r.q > 70) return quit(a); const w = walk(a, r, dt, sp.sp, 1.4); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('ambush'); } return true; }
      if (a.kind === 'croc' && S.type[W.idx(a.x, a.y)] <= T.RIVER) { quit(a); a.state = 'lurk'; a.sub = 1; a.t = 40; a.target = 0; return true; } // (the old lurk: under the surface at the ford)
      a.moving = false; G.faceTo(a, r.fx - a.x, r.fy - a.y);
      gest(a, Ge.can(a.kind, 'hide') ? 'hide' : 'lie', 0, 0, 0, true);
      if (r.q > 55 || a.hunger < 0.3) return quit(a, Ge.can(a.kind, 'stretch') ? 'stretch' : null);
      return false; // (lying in wait: the world's hunt scan finds the prey that come down)
    },
  }, K.ambush);
  // ---- to the shade at midday (D-301)
  opt('sombra', { rest: true,
    score(a) { const m = a.meio; if (!m || m.hot < 0.5 || !ENV.day) return 0; return Math.min(0.75, (m.hot - 0.42) * 1.5); },
    start(a, sp, S) {
      const t = A.treeNear(a.x, a.y, 9, q => q.kind !== 'cactus'); if (!t) return false;
      const ang = G.hash(a.id) * 6.283; let x = t.x + Math.cos(ang) * 0.55, y = t.y + Math.sin(ang) * 0.5; if (!A.walkOK(a, x, y)) { x = t.x + 0.3; y = t.y + 0.35; } if (!A.walkOK(a, x, y)) return false;
      const r = runStart(a, 'sombra'); r.gx = x; r.gy = y; r.id = t.id; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      const t = S.trees.get(r.id); if (!t || t.stage !== 'grow') return quit(a, Ge.can(a.kind, 'startle') ? 'startle' : 'rise'); // (the tree felled over it)
      if (r.p === 0) { if (r.q > 50) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp * 0.85); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('shade'); } return true; }
      a.moving = false;
      gest(a, m.hot > 0.62 && Ge.can(a.kind, 'pant') && (r.q % 14) < 5 ? 'pant' : Ge.can(a.kind, 'lie') ? 'lie' : 'shelter', 0, 0, 0, true);
      if ((m.hot < 0.2 && r.q > 15) || ENV.t > 0.64 || r.q > 100 || ENV.night) return quit(a, Ge.can(a.kind, 'stretch') ? 'stretch' : Ge.can(a.kind, 'rise') ? 'rise' : null);
      return false;
    },
  }, K.shade);
  // a muddy place near: the bank (down the field) or a puddle the rain left
  function mudSpot(a) {
    const S = G.S; fields(); const i = W.idx(a.x, a.y);
    if (dF[i] <= 10) { const b = bankFrom(i, dF); if (b >= 0 && S.type[b] >= T.SAND) { const x = (b % N) + 0.5, y = ((b / N) | 0) + 0.5; if (A.walkOK(a, x, y)) return [x, y]; } }
    for (let k = 0; k < 16; k++) { const ang = k / 16 * 6.283, d = 1 + (k % 4) * 1.5; const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d; if (!W.inb(x, y)) continue; const j = W.idx(x, y); if (S.wet[j] > 0.4 && S.type[j] >= T.GRASS && A.walkOK(a, x, y)) return [x, y]; }
    return null;
  }
  // ---- the mud wallow (D-301): the heat and the flies, and a coat of mud against both
  opt('lama', { rest: true,
    score(a, sp, S) { const m = a.meio; if (!m || m.mud > 0.5 || !ENV.day) return 0; const i = W.idx(a.x, a.y); if (!(dF && dF[i] <= 10) && !(S.wet[i] > 0.3)) return 0; const base = a.kind === 'rhino' || a.kind === 'buffalo' || a.kind === 'boar' ? 0.3 : 0.38; if (m.hot < base) return 0; return Math.min(0.72, (m.hot - base) * 1.25 + 0.27); },
    start(a) { const p = mudSpot(a); if (!p) return false; const r = runStart(a, 'lama'); r.gx = p[0]; r.gy = p[1]; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 60) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp); if (w === null) return true; if (w) { r.p = 1; r.q = 0; r.b = 12 + G.hash(a.id) * 8; count('wallow'); } return true; }
      a.moving = false; gest(a, 'wallow', 0, 0, 0, true);
      m.mud = r3(c01(m.mud + dt / 6)); m.hot = r3(Math.max(0, m.hot - dt / 10)); m.wet = r3(Math.max(m.wet, 0.6));
      if (r.q > r.b) { if (a.kind === 'elephant' || a.kind === 'bison') { r.p = 2; } else return quit(a); }
      if (r.p === 2) { quit(a); if (gest(a, 'dustbath')) { m.dust = 1; count('dust'); } return true; } // (the dust thrown over the mud)
      return false;
    },
  }, K.wallow);
  // ---- the dust bath on dry ground (D-301)
  opt('poeira', { rest: true,
    score(a, sp, S) { const m = a.meio; if (!m || m.dust > 0.4 || !ENV.day || m.hot < 0.35) return 0; const i = W.idx(a.x, a.y); if (S.wet[i] > 0.15 || S.type[i] < T.SAND || (dF && dF[i] <= 3)) return 0; return 0.27 + 0.15 * m.hot; },
    start(a) { const r = runStart(a, 'poeira'); r.gx = a.x; r.gy = a.y; return true; },
    step(a, dt) { const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; a.moving = false; gest(a, 'dustbath', undefined, 0, 0, true); if (r.q > 5) { const m = meioOf(a); m.dust = 1; m.hot = r3(m.hot * 0.8); count('dust'); return quit(a, Ge.can(a.kind, 'shake') ? 'shake' : null); } return false; },
  }, K.dust);
  // the shallow water near (a tile one stands in): down the field to the bank, and the water beside it
  function shallow(a) { const S = G.S; fields(); const i = W.idx(a.x, a.y); if (dF[i] > 12) return null; const b = bankFrom(i, dF); const w = b >= 0 ? waterBy(b) : -1; if (w < 0) return null; const x = (w % N) + 0.5, y = ((w / N) | 0) + 0.5; if ((S.deep[w] && !SP[a.kind].swims && SP[a.kind].cls !== 'amph') || !A.walkOK(a, x, y)) return null; return [x, y]; }
  // ---- into the water to cool off (D-301): the tiger, the buffalo, the moose and the elephants soak
  opt('banho', { rest: true,
    score(a) { const m = a.meio; if (!m || m.hot < 0.5 || !ENV.day) return 0; return Math.min(0.74, (m.hot - 0.4) * 1.3); },
    start(a) { const p = shallow(a); if (!p) return false; const r = runStart(a, 'banho'); r.gx = p[0]; r.gy = p[1]; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 60) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; r.b = 14 + G.hash(a.id) * 14; count('bath'); } return true; }
      a.moving = false; m.wet = 1; m.hot = r3(Math.max(0, m.hot - dt / 6)); m.mud = 0; m.th = r3(Math.max(0, m.th - dt / 8));
      gest(a, a.kind === 'elephant' ? ((r.q % 9) < 4 ? 'splash' : 'spray') : 'soak', a.kind === 'elephant' ? undefined : 0, 0, 0, true);
      if (r.q > r.b || (ENV.night && r.q > 4)) return quit(a, 'shake');
      return false;
    },
  }, K.soak);
  // ---- the hippos: in the water by day, out to graze at night (D-301)
  opt('rio', { rest: true,
    score(a, sp, S) { if (!ENV.day || ENV.t > 0.68) return 0; return a.hunger > 0.75 ? 0.2 : 0.72; }, // (a starving hippo grazes by day too)
    start(a, sp, S) {
      fields(); const i = W.idx(a.x, a.y); let g = null;
      if (S.type[i] === T.RIVER) g = [a.x, a.y]; else { const b = bankFrom(i, dF); const w = b >= 0 ? waterBy(b) : -1; if (w >= 0) g = [(w % N) + 0.5, ((w / N) | 0) + 0.5]; }
      if (!g || !A.walkOK(a, g[0], g[1])) return false; const r = runStart(a, 'rio'); r.gx = g[0]; r.gy = g[1]; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      if (r.p === 0) { if (r.q > 60) return quit(a); const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; } return true; }
      if (S.type[W.idx(a.x, a.y)] !== T.RIVER && r.q > 3) return quit(a);
      a.moving = false; gest(a, 'soak', 0, 0, 0, true);
      // the hippo's pool is the hippo's: a crocodile waiting in it is shown the teeth and goes (D-306)
      r.sc -= dt; if (r.sc <= 0) { r.sc = 3; A.near(a.x, a.y, 2.5, o => { if (o.kind !== 'croc' || o.dead || o.state === 'drown' || o.state === 'roll' || o.state === 'eat' || PUSH.get(o.id) > S.clock - 30) return; PUSH.set(o.id, S.clock); if (gest(a, 'display', undefined, o.id, 0, true)) { const dx = o.x - a.x, dy = o.y - a.y, d = Math.hypot(dx, dy) || 1; const x = o.x + dx / d * 4, y = o.y + dy / d * 4; if (A.walkOK(o, x, y)) { o.state = 'wander'; o.tx = x; o.ty = y; o.t = 4; o.sub = 0; count('compet'); } } }); }
      if (ENV.night || ENV.t > 0.7 || r.q > 160) return quit(a);
      return false;
    },
  }, set(['hippo']));
  // ---- the reptiles warm up in the morning sun on the bank (D-301): the crocodile's gape at midday
  opt('sol', { rest: true,
    score(a) { const m = a.meio; if (!m || !ENV.day || ENV.sun < 0.2 || ENV.rain > 0.3 || m.cold < 0.22 || m.hot > 0.55) return 0; return Math.min(0.7, 0.3 + m.cold * 0.5); },
    start(a, sp, S) {
      let g = [a.x, a.y]; fields();
      if (a.kind === 'croc' || a.kind === 'anaconda') { const i = W.idx(a.x, a.y); let b = S.type[i] === T.RIVER ? -1 : dF[i] <= 4 ? bankFrom(i, dF) : -1; if (b < 0) { const x = a.x | 0, y = a.y | 0; for (const [dx, dy] of D8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (S.type[j] >= T.SAND && dF[j] === 1 && A.walkOK(a, nx + 0.5, ny + 0.5)) { b = j; break; } } } if (b < 0) return false; g = [(b % N) + 0.5, ((b / N) | 0) + 0.5]; }
      if (!A.walkOK(a, g[0], g[1])) return false; const r = runStart(a, 'sol'); r.gx = g[0]; r.gy = g[1]; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 40) return quit(a); const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('bask'); } return true; }
      a.moving = false; gest(a, m.hot > 0.4 && Ge.can(a.kind, 'gape') ? 'gape' : 'bask', 0, 0, 0, true);
      if ((m.cold < 0.06 && r.q > 20) || m.hot > 0.6 || ENV.rain > 0.3 || ENV.night || r.q > 120) return quit(a);
      return false;
    },
  }, K.bask);
  // the best cover near (the deep wood against the storm)
  function coverSpot(a, R) { const S = G.S; let best = null, bc = 0.45; for (let k = 0; k < 16; k++) { const ang = k / 16 * 6.283 + G.hash(a.id), d = 1 + (k % 4) * (R / 4); const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d; if (!W.inb(x, y) || !A.walkOK(a, x, y)) continue; const c = coverAt(W.idx(x, y)); if (c > bc) { bc = c; best = [x, y]; } } void S; return best; }
  const stormy = () => ENV.storm;
  // ---- shelter from the storm and the bitter cold (D-301): the wood, where the caves did not take it (caves.js)
  opt('abrigo', { rest: true, storm: true,
    who: (a, sp) => !K.burrow.has(a.kind) && !sp.sea, // (the seal, the walrus, the penguin stay by their sea)
    score(a) { if (a.shelter) return 0; const m = a.meio; if (stormy()) return 0.62; if (m && m.cold > 0.72) return Math.min(0.7, (m.cold - 0.6) * 1.5 + 0.3); return 0; },
    start(a) { const p = coverSpot(a, 8) || [a.x, a.y]; const r = runStart(a, 'abrigo'); r.gx = p[0]; r.gy = p[1]; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 40) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp * 1.15, 1.5); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('shelter'); } return true; }
      a.moving = false; gest(a, 'shelter', 0, 0, 0, true);
      if ((!stormy() && m.cold < 0.5 && r.q > 6) || r.q > 140 || a.shelter) return quit(a, 'shake');
      return false;
    },
  });
  // ---- together against the cold and the storm (D-301): the musk oxen in a ring, the wolves in a heap, the herd bunched
  const HUDDLE = opt('aconchego', { rest: true, storm: true,
    score(a) { const m = a.meio; if (stormy()) return 0.66; if (!m || m.cold < 0.55) return 0; return Math.min(0.72, (m.cold - 0.45) * 1.4); }, // (in the storm the herd bunches, heads down)
    start(a, sp, S) {
      const L = a.leader && S.animals.get(a.leader); const cx = L && !L.dead && L !== a ? L.x : a.x, cy = L && !L.dead && L !== a ? L.y : a.y;
      const ang = G.hash(a.id) * 6.283, d = L && L !== a ? 0.6 + G.hash(a.id + 1) * 0.5 : 0; let x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d; if (!A.walkOK(a, x, y)) { x = cx; y = cy; } if (!A.walkOK(a, x, y)) return false;
      const r = runStart(a, 'aconchego'); r.gx = x; r.gy = y; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 30) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('huddle'); } return true; }
      a.moving = false; gest(a, Ge.can(a.kind, 'huddle') ? 'huddle' : 'shelter', 0, 0, 0, true);
      if ((m.cold < 0.3 && !stormy() && r.q > 8) || r.q > 110) return quit(a);
      return false;
    },
  }, K.huddle);
  // ---- curled up against the cold, the tail over the nose (D-301)
  opt('enrolar', { rest: true,
    score(a) { const m = a.meio; if (!m || m.cold < 0.5 || a.hunger > 0.6) return 0; return Math.min(0.66, (m.cold - 0.35) * 1.4); },
    start(a) { const p = coverSpot(a, 3) || [a.x, a.y]; const r = runStart(a, 'enrolar'); r.gx = p[0]; r.gy = p[1]; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 20) return quit(a); const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('curl'); } return true; }
      a.moving = false; gest(a, 'curl', 0, 0, 0, true);
      if (m.cold < 0.25 || r.q > 80 || a.hunger > 0.7) return quit(a, Ge.can(a.kind, 'stretch') ? 'stretch' : 'shake');
      return false;
    },
  }, K.curl);
  // ---- the burrow and the den (D-307): a place of its own, remembered (a.meio.bx/by) — under a bush, by a rock, in the bank
  function burrowOf(a) {
    const S = G.S; const m = meioOf(a);
    if (a.kind === 'beaver' && a.dam && S.dams) { const d = S.dams.find(q => q.id === a.dam); if (d && d.lodge) { m.bx = Math.floor(d.x); m.by = Math.floor(d.y); } }
    if (m.bx >= 0 && A.walkOK(a, m.bx + 0.5, m.by + 0.5) && G.dist(a.x, a.y, m.bx + 0.5, m.by + 0.5) < 30) return [m.bx + 0.5, m.by + 0.5];
    let best = null, bs = -1;
    for (let k = 0; k < 14; k++) { const ang = k / 14 * 6.283 + G.hash(a.id) * 3, d = 1 + (k % 4); const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d; if (!W.inb(x, y) || !A.walkOK(a, x, y)) continue; const j = W.idx(x, y); if (S.type[j] < T.SAND || S.occ[j] || S.road[j]) continue; const s = coverAt(j) + (S.rocks && S.objAt[j] && S.rocks.has(S.objAt[j]) ? 0.4 : 0) + (a.kind === 'otter' && dF && dF[j] === 1 ? 0.6 : 0) + G.hash(j) * 0.1; if (s > bs) { bs = s; best = [Math.floor(x), Math.floor(y)]; } }
    if (!best) return null; m.bx = best[0]; m.by = best[1]; return [best[0] + 0.5, best[1] + 0.5];
  }
  function startToca(a, sp, dur) { const p = burrowOf(a); if (!p) return false; const r = runStart(a, 'toca'); r.gx = p[0]; r.gy = p[1]; r.b = dur; if (G.dist(a.x, a.y, p[0], p[1]) < 1.2) { r.p = 1; r.q = 0; gest(a, 'burrow', undefined, 0, 0, true); } return true; }
  // the young of a mother in a den: with her (the wolves and foxes with cubs)
  const withYoung = a => { let y = false; A.near(a.x, a.y, 5, o => { if (!o.dead && o.kind === a.kind && o.grown < 0.6 && o.leader === a.id) y = true; }); return y; };
  opt('toca', { rest: true,
    score(a, sp) {
      const m = a.meio; if (stormy() || (m && m.cold > 0.75)) return 0.6;
      const nightly = NIGHT.has(a.kind); const rest = nightly ? ENV.day && ENV.t > 0.12 && ENV.t < 0.6 : ENV.night;
      if (rest && !hungry(a, 0.5)) return 0.34;
      if ((a.kind === 'fox' || a.kind === 'arcticfox' || a.kind === 'wolf') && a.grown >= 1 && withYoung(a)) return 0.4;
      return 0;
    },
    start(a, sp) { return startToca(a, sp, 20 + G.hash(a.id + G.S.day) * 25); },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt; const m = meioOf(a);
      if (r.p === 0) { if (r.q > 30) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp * 1.1, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; gest(a, 'burrow', undefined, 0, 0, true); count('burrow'); } return true; }
      a.moving = false;
      if (r.p === 1) { if (r.q > 1.2) { r.p = 2; r.q = 0; } return true; }
      gest(a, Ge.can(a.kind, 'toca') ? 'toca' : 'lie', 0, 0, 0, true);
      // out when the time is up and nothing waits outside (an ear to the ground every few seconds)
      const nightly = NIGHT.has(a.kind); const rest = stormy() || m.cold > 0.7 || (nightly ? ENV.day && ENV.t > 0.12 && ENV.t < 0.6 : ENV.night);
      // (a hunter waiting outside keeps it in a while more — never past the hunger, nor a minute over its time)
      if (r.q > r.b && (!rest || a.hunger > 0.6 || r.q > r.b + 40)) { let near = false; if (a.hunger < 0.7 && r.q < r.b + 15) A.near(a.x, a.y, 7, o => { if (!o.dead && A.eatenBy[a.kind] && A.eatenBy[a.kind].includes(o.kind)) near = true; }); if (!near) return quit(a, Ge.can(a.kind, 'listen') ? 'listen' : 'alert'); }
      return true; // (down the burrow: no scan, nothing to flee)
    },
  }, K.burrow);
  // ---- the young lie hidden in the cover while the mother grazes (D-301): the fawn in the tall grass
  opt('esconder', { rest: true,
    who: a => a.grown < 0.55,
    score(a, sp, S) { if (a.hunger > 0.5) return 0; const L = a.leader && S.animals.get(a.leader); if (!L || L.dead || L.state !== 'graze' || G.dist(a.x, a.y, L.x, L.y) > 3) return 0; return coverAt(W.idx(a.x, a.y)) >= 0.4 ? 0.4 : 0.3; },
    start(a) { const p = coverSpot(a, 3) || [a.x, a.y]; const r = runStart(a, 'esconder'); r.gx = p[0]; r.gy = p[1]; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      if (r.p === 0) { if (r.q > 15) return quit(a); const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('hide'); } return true; }
      a.moving = false; gest(a, Ge.can(a.kind, 'hide') ? 'hide' : 'lie', 0, 0, 0, true);
      const L = a.leader && S.animals.get(a.leader);
      if (r.q > 30 || !L || L.dead || L.state === 'flee' || G.dist(a.x, a.y, L.x, L.y) > 4 || a.hunger > 0.6) return quit(a);
      return false;
    },
  }, K.hideYoung);
  // ---- a sentinel on the hill (D-303): one of the herd stands high and looks while the rest graze
  opt('vigia', { rest: true,
    who: (a, sp) => sp.herd && sp.herd[1] >= 3 && a.grown >= 1,
    score(a, sp, S) {
      if (!ENV.day || hungry(a, 0.45) || (a.meio && (a.meio.th > 0.5 || a.meio.hot > 0.55))) return 0;
      if (G.hash(a.id + S.day * 7 + ((S.time * 8) | 0)) > 0.3) return 0;
      let other = false; A.near(a.x, a.y, 12, o => { if (o !== a && o.kind === a.kind && o.state === 'vigia') other = true; }); if (other) return 0;
      return 0.3;
    },
    start(a, sp, S) { const h = hill(a); const r = runStart(a, 'vigia'); r.gx = h ? h[0] : a.x; r.gy = h ? h[1] : a.y; r.b = 15 + G.hash(a.id) * 12; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      if (r.p === 0) { if (r.q > 25) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('sentinel'); } return true; }
      a.moving = false; const c = r.q % 8;
      gest(a, c < 3 ? 'alert' : c < 6 ? 'stare' : Ge.can(a.kind, 'scent') ? 'scent' : 'listen', c >= 3 && c < 6 ? 0 : undefined, 0, 0, true);
      if (r.q > r.b) return quit(a);
      return false; // (standing high: its scan, with the hill's reach, sees the hunter first — and its flight warns the herd)
    },
  }, K.sentinel);
  // ---- the leaves up high (D-304): the giraffe at the acacia, the elephants — who may push the tree down
  opt('ramos', {
    score(a, sp, S) { if (!hungry(a, 0.35)) return 0; if ((a.kind === 'deer' || a.kind === 'rhino' || a.kind === 'ibex' || a.kind === 'tapir') && G.hash(a.id + S.day) > 0.4) return 0; return Math.min(0.6, 0.27 + (a.hunger - 0.35) * 0.6); },
    start(a, sp, S) {
      const t = A.treeNear(a.x, a.y, 7, q => q.kind !== 'cactus' && q.size >= 0.5 && (a.kind !== 'giraffe' || q.kind === 'acacia' || q.kind === 'baobab' || G.hash(q.id) < 0.5)); if (!t) return false;
      const ang = G.hash(a.id + t.id) * 6.283; let x = t.x + Math.cos(ang) * 0.6, y = t.y + Math.sin(ang) * 0.55; if (!A.walkOK(a, x, y)) { x = t.x + 0.4; y = t.y + 0.4; } if (!A.walkOK(a, x, y)) return false;
      const r = runStart(a, 'ramos'); r.gx = x; r.gy = y; r.id = t.id; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      const t = S.trees.get(r.id); if (!t || (t.stage !== 'grow' && t.stage !== 'fall' && t.stage !== 'log')) return quit(a);
      if (r.p === 0) { if (r.q > 40) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('browse'); } return true; }
      a.moving = false; G.faceTo(a, t.x - a.x, t.y - a.y);
      if (r.p === 2) { // the elephant's head against the trunk: the tree goes over
        gest(a, 'fell', undefined, 0, 0, true);
        if (r.q > 5.5) { if (t.stage === 'grow') { G.Nature.fellTree(t, a.face || 1); count('fell'); felled(a, t); } r.p = 1; r.q = 0; }
        return false;
      }
      gest(a, (Ge.can(a.kind, 'rear') && (a.kind === 'cabra' || a.kind === 'ibex') && (r.q % 10) < 2.5) ? 'rear' : 'browse', 0, t.id, 0, true);
      a.hunger = Math.max(0, a.hunger - dt * 0.035 * Math.min(1, t.size + 0.3)); a.eating = 0.4;
      if (t.fruit > 0) t.fruit = Math.max(0, t.fruit - dt * 0.02);
      // (a bull elephant tires of reaching: a small tree, a push — a few in a day over a whole land, never every one)
      if (a.kind === 'elephant' && t.stage === 'grow' && t.size < 1.15 && r.q > 6 && !r.n) { r.n = 1; const lg = st0().lg; if (!(lg.fellN >= 4 && lg.fellD === S.day) && G.R() < 0.08) { lg.fellD === S.day ? lg.fellN++ : (lg.fellD = S.day, lg.fellN = 1); r.p = 2; r.q = 0; } }
      if (a.hunger < 0.08 || r.q > 45) return quit(a);
      return false;
    },
  }, K.browse);
  function felled(a, t) {
    const S = G.S; const lg = st0().lg; if (lg.fell > S.day - 6) return; lg.fell = S.day;
    log(`Um elefante encostou a cabeça numa árvore${where(t.x, t.y).at} e a empurrou até cair, para comer as folhas do alto. O tronco ficou no chão para quem quiser a lenha.`, 'deer', t.x, t.y);
  }
  // ---- the fruit trees (D-304): the bear standing up at the branch, the boar under it, the seeds carried off in the belly
  opt('fruta', {
    score(a, sp, S) { if (!hungry(a, 0.4)) return 0; return 0.33 + 0.3 * (a.hunger - 0.4); },
    start(a, sp, S) {
      if (!G.Flora) return false; const t = A.treeNear(a.x, a.y, 10, q => G.Flora.isFruit(q.kind) && q.fruit > 0.5); if (!t) return false;
      const ang = G.hash(a.id) * 6.283; let x = t.x + Math.cos(ang) * 0.5, y = t.y + Math.sin(ang) * 0.45; if (!A.walkOK(a, x, y)) { x = t.x + 0.4; y = t.y + 0.4; } if (!A.walkOK(a, x, y)) return false;
      const r = runStart(a, 'fruta'); r.gx = x; r.gy = y; r.id = t.id; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      const t = S.trees.get(r.id); if (!t || t.stage !== 'grow' || !(t.fruit > 0.05)) return quit(a);
      if (r.p === 0) { if (r.q > 45) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('fruit'); } return true; }
      a.moving = false; G.faceTo(a, t.x - a.x, t.y - a.y);
      const g = a.kind === 'boar' ? 'root' : a.kind === 'elephant' ? 'browse' : (r.q % 6) < 2.5 && Ge.can(a.kind, 'rear') ? 'rear' : 'chew';
      gest(a, g, g === 'rear' || g === 'chew' ? undefined : 0, t.id, 0, true);
      r.sc -= dt; if (r.sc <= 0) { r.sc = 2; t.fruit = Math.max(0, t.fruit - 0.25); a.hunger = Math.max(0, a.hunger - 0.12); a.eating = 0.4; if (!SEED.has(a.id)) SEED.set(a.id, { k: t.kind, t: S.clock }); }
      if (a.hunger < 0.08 || r.q > 40) return quit(a);
      return false;
    },
  }, K.fruit);
  // a seed dropped where the eater rests: a sapling of its tree, where that tree grows (the world's own planting door)
  function plant(a, kind) {
    const S = G.S; const lg = st0().lg; if (lg.seedD === S.day && lg.seedN >= 5) return;
    const i = W.idx(a.x, a.y); const ty = S.type[i]; if (!(ty === T.GRASS || ty === T.MEADOW || ty === T.SAND) || S.treeAt[i] || S.objAt[i] || S.occ[i] || S.road[i] || S.wear[i] >= 10 || S.burnt[i] > 0) return;
    if (!G.Biome.canGrow(kind, i)) return;
    const x = a.x | 0, y = a.y | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.occ[ny * N + nx]) return; }
    if (G.Nature.addTree(x + 0.5, y + 0.5, kind, 0.12)) { if (lg.seedD === S.day) lg.seedN++; else { lg.seedD = S.day; lg.seedN = 1; } count('seed'); }
  }
  // ---- the fields of the people (D-305): the elephants, the boars and the deer come at night and eat the crop
  let FARMS = [], farmT = 0, PC = null, pcw = 0;
  function farmCrop(b) { let best = -1, bg = 0.35; for (let k = 0; k < 9; k++) { const c = b.crops[k]; if (c.s >= 2 && c.g > bg) { bg = c.g; best = k; } } return best; }
  opt('lavoura', {
    score(a, sp, S) {
      if (!hungry(a, 0.4) || !FARMS.length) return 0; let f = null, fd = 16 * 16;
      for (const q of FARMS) { const d = G.dist2(a.x, a.y, q.x, q.y); if (d < fd) { fd = d; f = q; } } if (!f || (f.watched && ENV.day)) return 0;
      // (at night, hungry, the wild grass poor: the field is worth the risk; where people chased it off before, less)
      return 0.32 + 0.3 * (a.hunger - 0.4) + (ENV.night ? 0.15 : 0) + (S.veg && S.veg[W.idx(a.x, a.y)] < 0.2 ? 0.1 : 0) + (a.kind === 'elephant' ? 0.1 : 0) - 0.2 * fearAt(f.x, f.y);
    },
    start(a, sp, S) {
      let f = null, fd = 16 * 16; for (const q of FARMS) { const d = G.dist2(a.x, a.y, q.x, q.y); if (d < fd) { fd = d; f = q; } } if (!f) return false;
      const b = S.buildings.get(f.id); if (!b || !b.crops) return false; const k = farmCrop(b); if (k < 0) return false;
      const p = G.Village.cropPos(b, k); if (!A.walkOK(a, p[0], p[1])) return false;
      const r = runStart(a, 'lavoura'); r.gx = p[0]; r.gy = p[1]; r.id = b.id; r.k = k; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      const b = S.buildings.get(r.id); if (!b || !b.crops || !b.built) return quit(a);
      if (r.p === 0) { if (r.q > 60) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp, 1.2); if (w === null) return true; if (w) { r.p = 1; r.q = 0; r.sc = 0; count('raid'); } return true; }
      a.moving = false;
      // the people see it: shouts, a stone thrown — it runs, and the ground remembers (the next time it keeps off sooner)
      r.n -= dt; if (r.n <= 0) { r.n = 1; if (peopleNear(a.x, a.y, ENV.night ? 0 : 1)) { taught(a.x, a.y, 0.15); count('raidScared'); const dx = a.x - (b.x + 1.5), dy = a.y - (b.y + 1.5), d = Math.hypot(dx, dy) || 1; const x = a.x + dx / d * 6, y = a.y + dy / d * 6; quit(a, Ge.can(a.kind, 'startle') ? 'startle' : null, 3); if (W.inb(x, y) && A.walkOK(a, x, y)) { a.tx = x; a.ty = y; a.state = 'flee'; a.t = 3; } return true; } }
      const c = b.crops[r.k]; if (!c || c.s < 2 || c.g < 0.2) { const k = farmCrop(b); if (k < 0 || r.q > 40) return quit(a); const p = G.Village.cropPos(b, k); r.k = k; r.p = 0; r.q = 0; r.gx = p[0]; r.gy = p[1]; return true; }
      gest(a, Ge.can(a.kind, 'forage') ? 'forage' : 'chew', Ge.can(a.kind, 'forage') ? 0 : undefined, 0, 0, true);
      r.sc -= dt; if (r.sc <= 0) { r.sc = 1.5; c.g = r3(Math.max(0, c.g - 0.12)); c.s = c.g < 0.3 ? 1 : c.g < 1 ? 2 : 3; a.hunger = Math.max(0, a.hunger - 0.08); a.eating = 0.4; raided(a, b); }
      if (a.hunger < 0.06 || r.q > 30) return quit(a);
      return false;
    },
  }, K.raid);
  // the people out of doors near a point (counted every two seconds, by cells of four tiles)
  // (by day from some eight tiles; in the dark only from beside it)
  function peopleNear(x, y, r) { if (!PC) return false; const R = r === undefined ? 1 : r; const cx = (x / 4) | 0, cy = (y / 4) | 0; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const X = cx + dx, Y = cy + dy; if (X >= 0 && Y >= 0 && X < pcw && Y < pcw && PC[Y * pcw + X]) return true; } return false; }
  function raided(a, b) {
    const S = G.S; const s = S.settlements.get(b.set); if (!s) return; const lg = st0().lg; const key = 'r' + s.id;
    const e = RAIDS.get(s.id) || { n: 0, k: {}, x: a.x, y: a.y, d: S.day }; if (e.d !== S.day) { e.n = 0; e.k = {}; e.d = S.day; } e.n++; e.k[a.kind] = (e.k[a.kind] || 0) + 1; RAIDS.set(s.id, e);
    if (e.n >= 6 && !(lg[key] > S.day - 4)) { lg[key] = S.day; const ks = Object.keys(e.k).sort((p, q) => e.k[q] - e.k[p]); const k = ks[0]; let n = 0; A.near(a.x, a.y, 8, o => { if (!o.dead && o.kind === k && o.state === 'lavoura') n++; });
      const who = n > 1 ? `${n} ${nm(k, n)}` : SP[k].nameA; log(`${ENV.night ? 'À noite, ' + who : G.cap(who)} entr${n > 1 ? 'aram' : 'ou'} nas plantações de ${s.name} e com${n > 1 ? 'eram' : 'eu'} o que ia ser colheita.`, 'deer', a.x, a.y); }
  }
  const RAIDS = new Map(); G.worldHooks.push(() => { RAIDS.clear(); FARMS = []; farmT = 0; PC = null; });
  // ---- the scraps at a town's edge at night (D-305): the hyenas, the foxes and the bears at the people's refuse
  function townNear(a, R) { const S = G.S; let best = null, bd = R * R; for (const s of S.settlements.values()) { const d = G.dist2(a.x, a.y, s.cx, s.cy); if (d < bd) { bd = d; best = s; } } return best; }
  opt('restos', {
    score(a, sp, S) { if (!ENV.night || !hungry(a, 0.5) || a.rest > 0) return 0; const s = townNear(a, 24); if (!s) return 0; return 0.27 + 0.2 * (a.hunger - 0.5) - 0.3 * Math.max(0, fearAt(a.x, a.y) - 0.3); },
    start(a, sp, S) {
      const s = townNear(a, 24); if (!s) return false; const R = (s.radius || 8) + 1.5; const dx = a.x - s.cx, dy = a.y - s.cy, d = Math.hypot(dx, dy) || 1;
      let g = null; for (let k = 0; k < 7 && !g; k++) { const an = Math.atan2(dy, dx) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.35; const x = s.cx + Math.cos(an) * R, y = s.cy + Math.sin(an) * R; if (W.inb(x, y) && A.walkOK(a, x, y)) g = [x, y]; } void d;
      if (!g) return false; const r = runStart(a, 'restos'); r.gx = g[0]; r.gy = g[1]; r.id = s.id; return true;
    },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      if (r.p === 0) { if (r.q > 60) return quit(a); if (watch(a, r, dt)) return false; const w = walk(a, r, dt, sp.sp * 0.9, 1.4); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('scav'); scavTold(a, r.id); } return true; }
      a.moving = false; gest(a, r.q < 2.5 ? 'sniff' : A.predator(a.kind) && Ge.can(a.kind, 'gnaw') ? 'gnaw' : 'chew', r.q < 2.5 ? undefined : 0, 0, 0, true);
      if (r.q > 2.5) a.hunger = Math.max(0, a.hunger - dt * 0.03);
      if (r.q > 14 || a.hunger < 0.1 || !ENV.night) return quit(a);
      return false; // (the dogs, the people — the world's fear scan sends it off)
    },
  }, K.scav);
  function scavTold(a, sid) { const S = G.S; const s = S.settlements.get(sid); if (!s) return; const lg = st0().lg; const key = 's' + sid; if (lg[key]) return; lg[key] = S.day; log(`${G.cap(nm(a.kind, 2))} rondam ${s.name} à noite, revirando os restos que o povo joga fora.`, 'wolf', a.x, a.y); }
  // ---- a curious look at a calm person, where people never hunted (D-305)
  let LONE = new Map(); G.worldHooks.push(() => { LONE = new Map(); });
  function lonePerson(a, R) { let best = null, bd = R * R; const cx = (a.x / 8) | 0, cy = (a.y / 8) | 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const l = LONE.get((cx + dx) + (cy + dy) * 4096); if (l) for (const v of l) { const d = G.dist2(a.x, a.y, v.x, v.y); if (d < bd) { bd = d; best = v; } } } return best; }
  opt('curioso', { rest: true,
    who: (a) => a.grown >= 0.6,
    score(a, sp, S) { if (!ENV.day || hungry(a, 0.4) || !calm(a) || (a.meio && (a.meio.th > 0.5 || a.meio.hot > 0.6))) return 0; if (fearAt(a.x, a.y) >= 0.08) return 0; if (G.hash(a.id + S.day * 3) > 0.5) return 0; const v = lonePerson(a, 12); return v ? 0.36 : 0; },
    start(a, sp, S) { const v = lonePerson(a, 12); if (!v) return false; const r = runStart(a, 'curioso'); r.id = v.id; r.b = 5 + G.hash(a.id) * 6; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      const v = S.villagers.get(r.id); if (!v || v.inside || v.aboard || v.held || v.dead) return quit(a);
      const d = G.dist(a.x, a.y, v.x, v.y); const stop = Math.max(2.4, (sp.fear || 3) * 0.75 + 0.6);
      if (r.p === 0) {
        if (r.q > 40 || d > 16) return quit(a);
        if (d <= stop + 0.3) { r.p = 1; r.q = 0; count('curious'); return false; }
        if (watch(a, r, dt)) return false;
        const ux = (a.x - v.x) / (d || 1), uy = (a.y - v.y) / (d || 1); r.gx = v.x + ux * stop; r.gy = v.y + uy * stop;
        const w = walk(a, r, dt, sp.sp * 0.55, 2.5); if (w === null) return true; if (w) { r.p = 1; r.q = 0; count('curious'); } return true;
      }
      a.moving = false; G.faceTo(a, v.x - a.x, v.y - a.y);
      const c = r.q % 7; gest(a, c < 4 ? 'curious' : Ge.can(a.kind, 'scent') && c < 5.5 ? 'scent' : 'stare', c < 4 ? 0 : undefined, v.id, 0, true);
      if (r.p === 1 && r.q > 3) { r.p = 2; curiousTold(a, v); }
      if (r.q > r.b + 4 || d < stop - 1.2) return quit(a, d < stop - 1.2 ? (Ge.can(a.kind, 'startle') ? 'startle' : null) : null, 1);
      return false; // (the person comes nearer: the world's fear scan, and it is gone)
    },
  }, K.curious);
  function curiousTold(a, v) { const S = G.S; const lg = st0().lg; if (lg.cu === S.day || !G.Life || !G.Life.bio) return; lg.cu = S.day; G.Life.bio(v, 'note', `${G.cap(SP[a.kind].nameA)} se aproximou, curios${SP[a.kind].g === 'f' ? 'a' : 'o'}, e ficou olhando de perto`); }
  // ---- look up: where the vultures circle, there is meat (D-306)
  let VU = [], WO = [], PR = []; const VUM = new Map(); G.worldHooks.push(() => VUM.clear());
  opt('abutres', {
    score(a, sp, S) { if (!hungry(a, 0.4) || !VU.length || a.rest > 0) return 0; const v = vultureSign(a); return v ? 0.45 + 0.3 * (a.hunger - 0.4) : 0; },
    start(a, sp, S) { const v = vultureSign(a); if (!v) return false; const r = runStart(a, 'abutres'); r.id = v.c; r.k = v.v; r.gx = v.x; r.gy = v.y; return true; },
    step(a, dt, sp, S) {
      const r = RUN.get(a.id); if (!r) { a.state = 'idle'; return true; } r.q += dt;
      const c = S.animals.get(r.id); if (!c || !c.dead || c.meat <= 0.5) return quit(a);
      if (r.p === 0) { gest(a, 'stare', 0, r.k, 0, true); if (r.q > 1.6) { r.p = 1; r.q = 0; count('vult'); vultTold(a, c); } return false; } // (the head up at the birds in the sky)
      if (r.q > 50) return quit(a);
      r.gx = c.x; r.gy = c.y; const d = G.dist(a.x, a.y, c.x, c.y);
      if (d < 6) { quit(a); a.target = c.id; a.state = 'chase'; a.carc = true; a.t = 12; return true; } // (the meat in sight: the old ways take it)
      const w = walk(a, r, dt, sp.run * 0.7, 4); if (w === null) return true;
      return true;
    },
  }, K.vult);
  function vultureSign(a) { let best = null, bd = 32 * 32; for (const v of VU) { const d = G.dist2(a.x, a.y, v.x, v.y); if (d < bd && d > 49) { bd = d; best = v; } } return best; }
  function vultTold(a, c) { const S = G.S; const lg = st0().lg; if (lg.vu > S.day - 4) return; lg.vu = S.day; log(`Os abutres rodando no céu${where(c.x, c.y).at} chamaram ${nm(a.kind, 2)} de longe até a carcaça — quem chega primeiro come.`, 'bird', c.x, c.y); }

  // ------------------------------ the world's tick (G.Animals.updateAll, wrapped) ------------------------------
  // the birds, the people, the fields and the signs in the sky are looked at every two seconds; the day's slow things once a
  // day (G.mod('meio.day'), in the save)
  let tick2 = 0, tickF = 0;
  G.worldHooks.push(() => { tick2 = 0; tickF = 0; VU = []; WO = []; PR = []; for (const k in C) delete C[k]; cw = 0; PF = null; dF = null; fS = null; });
  function tick(dt) {
    const S = G.S; if (!S || !S.animals) return; env(); fields(); cells();
    townFear(); townGrid();
    tick2 -= dt; if (tick2 <= 0) { tick2 = 2; scan2(); crossingsTick(); }
    tickF -= dt; if (tickF <= 0) { tickF = 10; farms(); }
    if (G.mod('meio.day') !== S.day) { G.mod('meio.day', S.day); daily(); }
    const d = st0(); if (ENV.dry && !d.dr) d.dr = { on: S.day }; else if (!ENV.dry && d.dr) droughtOver(d);
  }
  function scan2() {
    const S = G.S; VU = []; WO = []; PR = [];
    for (const a of S.animals.values()) {
      if (a.dead) continue; const k = a.kind;
      if (k === 'vulture' && (a.state === 'circle' || a.state === 'eat') && a.target) { const c = S.animals.get(a.target); if (c && c.dead && c.meat > 2) VUM.set(c.id, { x: c.x, y: c.y, c: c.id, v: a.id, t: S.clock }); }
      else if (k === 'wolf' && (a.state === 'chase' || a.state === 'stalk' || a.state === 'flank' || a.state === 'eat')) WO.push(a);
      if ((a.state === 'stalk' || a.state === 'chase' || a.state === 'flank') && !a.carc && SP[k] && SP[k].cls !== 'air') PR.push(a);
    }
    for (const [id, v] of VUM) { const c = S.animals.get(id); if (!c || !c.dead || c.meat <= 2 || S.clock - v.t > 40) VUM.delete(id); else VU.push(v); }
    birds();
    // the people out of doors: who is near (cells of four tiles), and who walks alone and calm outside the towns
    const n4 = Math.ceil(N / 4); if (!PC || pcw !== n4) { pcw = n4; PC = new Uint16Array(n4 * n4); } else PC.fill(0);
    const all = new Map(); LONE = new Map();
    for (const v of S.villagers.values()) {
      if (v.inside || v.held || v.aboard || v.air || v.dead) continue; const j = Math.min(n4 - 1, (v.y / 4) | 0) * n4 + Math.min(n4 - 1, (v.x / 4) | 0); if (PC[j] < 65000) PC[j]++;
      if (v.age < 14 || v.captive || v.unit || v.role === 'guerreiro' || v.role === 'arqueiro' || v.role === 'cacador' || (v.task && (v.task.type === 'hunt' || v.task.type === 'fight' || v.task.type === 'flee' || v.task.type === 'patrol'))) continue;
      const key = ((v.x / 8) | 0) + ((v.y / 8) | 0) * 4096; let l = all.get(key); if (!l) all.set(key, l = []); l.push(v);
    }
    for (const [key, l] of all) { const ok = l.filter(v => { const j = Math.min(n4 - 1, (v.y / 4) | 0) * n4 + Math.min(n4 - 1, (v.x / 4) | 0); return PC[j] <= 1 && fearAt(v.x, v.y) < 0.08; }); if (ok.length) LONE.set(key, ok); }
  }
  // the birds: to roost at dusk and in the storm (the owl by day), the ravens after the wolves, the flock that bursts up from a
  // stalking hunter — and its alarm, heard by the grazers
  function birds() {
    const S = G.S; const night = ENV.night || ENV.t > 0.7;
    for (const a of S.animals.values()) {
      const sp = SP[a.kind]; if (!sp || sp.cls !== 'air' || a.dead || a.held || a.tamed || a.nest && a.state === 'perch') continue;
      if (K.flush.has(a.kind) && (a.state === 'perch' || a.state === 'idle' || a.state === 'wade') && (a.z || 0) < 25 && PR.length) {
        let h = null; for (const p of PR) if (G.dist2(a.x, a.y, p.x, p.y) < 25) { h = p; break; }
        if (h) { const dx = a.x - h.x, dy = a.y - h.y, d = Math.hypot(dx, dy) || 1; a.state = 'fly'; a.tx = G.clamp(a.x + dx / d * 8, 1, N - 1); a.ty = G.clamp(a.y + dy / d * 8, 1, N - 1); a.t = 4; a.z = Math.max(a.z || 0, 2); count('flush'); alarmAt(a, h); continue; }
      }
      if (a.kind === 'raven' && a.state === 'fly' && a.hunger > 0.3 && WO.length) { let w = null, bd = 25 * 25; for (const o of WO) { const d = G.dist2(a.x, a.y, o.x, o.y); if (d < bd) { bd = d; w = o; } } if (w) { a.tx = G.clamp(w.x + (G.hash(a.id) - 0.5) * 3, 1, N - 1); a.ty = G.clamp(w.y + (G.hash(a.id + 1) - 0.5) * 3, 1, N - 1); a.t = Math.max(a.t, 2.5); if (!RAVEN.has(a.id)) { RAVEN.add(a.id); count('ravens'); } continue; } }
      if (a.gest === 'brood' && a.state !== 'perch') A.gestEnd(a, 'brood');
      if (a.nest && night && a.state === 'fly' && G.Nests && G.Nests.get) { const ne = G.Nests.get(a.nest); if (ne && (ne.st === 'eggs' || ne.st === 'chicks' || ne.st === 'build')) { const tr = ne.type === 'tree' ? S.trees.get(ne.host) : null; if (G.dist(a.x, a.y, ne.x, ne.y) < 0.8) { a.state = 'perch'; a.perchZ = tr ? 22 * tr.size : ne.type === 'roof' ? (a.z || 0) : 0; a.x = ne.x; a.y = ne.y; a.t = Math.max(4, ((ENV.t > 0.5 ? 1.02 - ENV.t : 0.02 - ENV.t) * DAY()) + 2); if (gest(a, 'brood', 0)) count('brood'); } else { a.tx = ne.x; a.ty = ne.y; a.t = Math.max(a.t, 3); } continue; } }
      const rest = a.kind === 'owl' ? ENV.day && ENV.t > 0.1 && ENV.t < 0.62 : (night || ENV.storm);
      if (rest && (K.roost.has(a.kind) || a.kind === 'owl') && a.state === 'fly' && a.hunger < 0.65) {
        let t = S.trees.get(ROOST.get(a.id)); if (!t || t.stage !== 'grow') { t = A.treeNear(a.x, a.y, 7, q => q.kind !== 'cactus'); if (!t) { ROOST.set(a.id, 0); continue; } ROOST.set(a.id, t.id); }
        if (G.dist(a.x, a.y, t.x, t.y) < 0.8) { a.state = 'perch'; a.perchZ = 22 * t.size; a.x = t.x; a.y = t.y; a.t = ENV.storm ? Math.max(20, (S.weather.storm || 0) + 2) : a.kind === 'owl' ? (0.62 - ENV.t) * DAY() + 2 : ((ENV.t > 0.5 ? 1.02 - ENV.t : 0.02 - ENV.t) * DAY()) + 2; a.t = Math.max(4, a.t); count('roost'); }
        else { a.tx = t.x; a.ty = t.y; a.t = Math.max(a.t, 3); }
      }
    }
  }
  const RAVEN = new Set(), ROOST = new Map(); G.worldHooks.push(() => { RAVEN.clear(); ROOST.clear(); });
  // a bird's alarm: the grazers around lift their heads (the bird is not on the ground: the alarm is heard from its place)
  function alarmAt(b, h) {
    const kinds = {}; let n = 0;
    A.near(b.x, b.y, 10, o => { if (o.dead || o.held || A.predator(o.kind)) return; const so = SP[o.kind]; if (!so || !land(so) || !wild(o, so)) return; const m = meioOf(o); m.al = Math.max(m.al, 20); n++; if (o.state === 'idle' || o.state === 'graze' || MINE[o.state]) { G.faceTo(o, h.x - o.x, h.y - o.y); gest(o, 'alert', undefined, b.id, 0); } if (!kinds[o.kind]) { kinds[o.kind] = 1; count('alarmX'); } });
    if (n && G.Mente && G.Mente.alarm) G.Mente.alarm(b.x, b.y, b.kind, 2);
  }
  // the fields with a crop worth the raid (and whether people are about them now)
  function farms() {
    const S = G.S; FARMS = [];
    for (const b of S.buildings.values()) { if (b.type !== 'farm' || !b.built || !b.crops) continue; let n = 0; for (const c of b.crops) if (c.s >= 2 && c.g > 0.35) n++; if (n < 2) continue; FARMS.push({ id: b.id, x: b.x + 1.5, y: b.y + 1.5, n, watched: peopleNear(b.x + 1.5, b.y + 1.5) }); }
  }
  function daily() {
    cells(); townFear();
    for (let j = 0; j < PF.length; j++) { if (PF[j] > 0) PF[j] = PF[j] < 0.01 ? 0 : r3(PF[j] * 0.88); if (HS[j] > 0) HS[j] = HS[j] < 0.2 ? 0 : r3(HS[j] * 0.6); }
  }
  function droughtOver(d) {
    const S = G.S; const r = d.dr; d.dr = null; if (!r || !(r.dead >= 3)) return;
    const ks = Object.keys(r.k || {}).sort((p, q) => r.k[q] - r.k[p]); const k = ks[0];
    log(`A seca acabou, mas deixou os ossos: ${r.dead} bichos morreram de sede${k ? `, a maioria ${nm(k, 2)}` : ''}, longe da água que restava.`, 'skull', r.x, r.y);
  }

  // ------------------------------ the world's state of this module (S.meio, in the save) ------------------------------
  function st0() { const S = G.S; if (!S.meio || typeof S.meio !== 'object') S.meio = { lg: {}, dr: null }; if (!S.meio.lg) S.meio.lg = {}; return S.meio; }
  Mi.counts = () => Object.assign({}, C);
  (G.saveHooks = G.saveHooks || []).push({
    save(out) {
      cells(); const pf = [], hs = [], hw = [];
      for (let j = 0; j < PF.length; j++) { if (PF[j] > 0) pf.push(j, Math.round(PF[j] * 1000) / 1000); if (HS[j] > 0) { hs.push(j, Math.round(HS[j] * 1000) / 1000); hw.push(HW[j]); } }
      const d = st0(); out.meio = { pf, hs, hw, n: Object.assign({}, C), lg: d.lg, dr: d.dr, N };
    },
    load(o) {
      const S = G.S; const q = o && o.meio; S.meio = { lg: {}, dr: null }; cw = 0; PF = null; cells(); for (const k in C) delete C[k];
      if (!q || typeof q !== 'object' || q.N !== N) return; // (a save of before, or of another map: the ground learns again)
      const pf = Array.isArray(q.pf) ? q.pf : [], hs = Array.isArray(q.hs) ? q.hs : [], hw = Array.isArray(q.hw) ? q.hw : [];
      for (let k = 0; k + 1 < pf.length; k += 2) { const j = pf[k], v = pf[k + 1]; if (Number.isInteger(j) && j >= 0 && j < PF.length && Number.isFinite(v)) PF[j] = c01(v); }
      for (let k = 0, h = 0; k + 1 < hs.length; k += 2, h++) { const j = hs[k], v = hs[k + 1]; if (Number.isInteger(j) && j >= 0 && j < HS.length && Number.isFinite(v)) { HS[j] = Math.max(0, Math.min(250, v)); const w = hw[h]; HW[j] = Number.isInteger(w) && w >= 0 && w < N * N ? w : -1; } }
      if (q.n && typeof q.n === 'object') for (const k in q.n) if (Number.isFinite(q.n[k])) C[k] = q.n[k];
      if (q.lg && typeof q.lg === 'object' && !Array.isArray(q.lg)) { const lg = {}; for (const k in q.lg) if (Number.isFinite(q.lg[k])) lg[k] = q.lg[k]; S.meio.lg = lg; }
      if (q.dr && typeof q.dr === 'object' && Number.isFinite(q.dr.on)) S.meio.dr = q.dr;
      for (const a of S.animals.values()) if (a.meio) meioOf(a);
    },
  });

  // ------------------------------ the doors, hung (D-276) ------------------------------
  A.senseHooks.push(sense);
  A.speedHooks.push(speed);
  A.lifeHooks.push(lifeHook);
  A.behave('travessia', crossStep, { busy: true }); MINE.travessia = 1;
  A.behave('sair', leaveStep, { busy: true }); MINE.sair = 1;
  { const up0 = A.updateAll; A.updateAll = function (dt) { G.tryRun ? G.tryRun('Meio', tick, dt) : tick(dt); return up0.call(this, dt); }; }
  // what people taught: a beast wounded or killed by a person (the kill and the wound of the hunt, wrapped)
  { const kill0 = A.kill; A.kill = function (a, by, cause) { const was = !a.dead; const r = was && RUN.get(a.id); const out = kill0.apply(this, arguments);
      if (was && a.dead) { if (by && person(by) && G.S.villagers.has(by.id) && SP[a.kind] && !SP[a.kind].dom && !SP[a.kind].town && !a.dom) taught(a.x, a.y, 0.35);
        if (r) { if (r.o === 'travessia' && r.p >= 1) { const c = XS.get(r.k); if (c) c.lost++; } endRun(a, r); } REFUGE.delete(a.id); SEED.delete(a.id); }
      return out; }; }
  { const dmg0 = A.damage; A.damage = function (a, dmg, by) { if (!a.dead && by && person(by) && G.S.villagers.has(by.id) && SP[a.kind] && !SP[a.kind].dom && !a.dom) taught(a.x, a.y, 0.05); return dmg0.apply(this, arguments); }; }
  // a beast sent off by a town's dog learns the town's ground (pets.js)
  const SCARED = new Map(); G.worldHooks.push(() => SCARED.clear());
  Mi.scared = function (a, x, y) { if (!a || a.dead || SCARED.get(a.id) > G.S.clock - 5) return; SCARED.set(a.id, G.S.clock); taught(a.x, a.y, 0.08); count('dogs'); gest(a, Ge.can(a.kind, 'startle') ? 'startle' : Ge.can(a.kind, 'threat') ? 'threat' : 'alert'); };
  // what the inspector says of this module's states
  Mi.TXT = { beber: 'Bebendo água', aguada: 'De tocaia na beira d’água', sombra: 'Descansando na sombra', lama: 'Chafurdando na lama', poeira: 'Tomando banho de terra', banho: 'Refrescando-se na água', rio: 'Na água, longe do sol', sol: 'Tomando sol', abrigo: 'Abrigando-se', aconchego: 'Encolhido junto dos outros', enrolar: 'Enrolado contra o frio', toca: 'Na toca', esconder: 'Escondido no capim', vigia: 'De vigia', ramos: 'Comendo folhas no alto', fruta: 'Comendo frutos', lavoura: 'Comendo a plantação', restos: 'Revirando os restos da cidade', curioso: 'Olhando, curioso', abutres: 'Seguindo os abutres', travessia: 'Atravessando o rio', sair: 'Saindo da cidade' };
  Mi.stateText = a => Mi.TXT[a.state] || null;
  Mi.MINE = MINE; Mi.DANGER = DANGER;
})(window.G);
