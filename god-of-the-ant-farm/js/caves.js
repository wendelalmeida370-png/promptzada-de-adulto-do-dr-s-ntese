'use strict';
// ============================================================
//  Caves: a whole layer under the world. Galleries and halls
//  carved by water in the hills, underground streams and black
//  lakes, ore veins in the walls, stalactites, crystal grottoes
//  and glow-worms; mouths that open on the hillsides. Bats pour
//  out at dusk and their guano feeds the fields; bears sleep the
//  long night inside; spiders, blind salamanders and pale fish
//  live in the dark. People find the caves and make them part of
//  their history: they paint it on the walls, bury their kings
//  there, climb up to hear the oracle, hide there from war, dig
//  the veins — and outlaws make them their den.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const C = G.Caves = {};
  const DAY = () => G.DAY_LEN;
  const TAU = Math.PI * 2;

  // ------------------------------ the layer ------------------------------
  // cell kinds below the ground (one per tile)
  const ROCK = 0, GAL = 1, HALL = 2, STREAM = 3, LAKE = 4, MOUTH = 5, DUG = 6, PIT = 7;
  C.K = { ROCK, GAL, HALL, STREAM, LAKE, MOUTH, DUG, PIT };
  C.walk = k => k === GAL || k === HALL || k === STREAM || k === MOUTH || k === DUG;
  C.FLOOR = 2.0; C.WALL = 3.2; // the floor of the caves and the height of their walls, in the view below
  // what lies on a cave floor
  const FT = C.FT = { STAL: 1, COL: 2, CRYS: 3, GLOW: 4, SHROOM: 5, BONES: 6, FOSSIL: 7, GUANO: 8 };
  // what shines in the walls
  const ORES = C.ORES = [null,
    { id: 'cobre', name: 'cobre', col: '#4cbf96', good: 'minerio', n: 2 },
    { id: 'estanho', name: 'estanho', col: '#cfd6e0', good: 'minerio', n: 2 },
    { id: 'ferro', name: 'ferro', col: '#c2633e', good: 'minerio', n: 3 },
    { id: 'ouro', name: 'ouro', col: '#f6c84e', good: 'ouro', n: 2 },
    { id: 'sal', name: 'sal-gema', col: '#f6f1e6', good: 'food', n: 6 },
    { id: 'gemas', name: 'gemas', col: '#cf62ea', good: 'joias', n: 1 }];
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const UGIN = -1; // v.inside while underground: out of the surface world's sight
  C.UGIN = UGIN;

  // ------------------------------ what a cave is cut in ------------------------------
  // the stone of the land above decides how it looks inside: grey limestone, red sandstone under the
  // deserts, blue ice under the tundra, wet mossy rock under the jungle, black basalt in the high peaks
  C.ROCKS = {
    calcario: { name: 'calcário', floor: [138, 122, 104], gal: [126, 112, 96], wall: [116, 106, 96], deep: [64, 56, 50] },
    gelo: { name: 'gelo', floor: [178, 198, 214], gal: [160, 184, 204], wall: [112, 146, 180], deep: [40, 62, 92] },
    arenito: { name: 'arenito', floor: [178, 128, 90], gal: [164, 116, 82], wall: [150, 92, 64], deep: [76, 42, 30] },
    musgo: { name: 'pedra úmida e musgo', floor: [100, 108, 78], gal: [92, 100, 72], wall: [84, 98, 74], deep: [34, 44, 34] },
    basalto: { name: 'basalto', floor: [94, 90, 94], gal: [84, 80, 86], wall: [64, 62, 70], deep: [24, 22, 28] },
  };
  C.rockOf = function (cv) {
    if (cv.rock) return cv.rock;
    const S = G.S; const i = G.clamp(Math.round(cv.cy), 0, N - 1) * N + G.clamp(Math.round(cv.cx), 0, N - 1);
    const b = S.biome ? S.biome[i] : 0; const h = W.tileH(i) - G.SEA;
    cv.rock = b === 1 ? 'gelo' : b === 5 || b === 6 ? 'arenito' : b === 4 || b === 3 ? 'musgo' : (h > 7 && G.hash(cv.id * 31 + 7) < 0.55) || (b === 2 && G.hash(cv.id * 13) < 0.3) ? 'basalto' : 'calcario';
    return cv.rock;
  };
  // the door follows the ground: a cut in a cliff, a shelter under a ledge on a slope, a sinkhole in the
  // flat land, a crack between boulders, a shaft in bare rock — and, where a stream runs inside, a spring
  function kindAt(S, x, y) {
    const i = y * N + x; const h0 = W.tileH(i); let cliff = 0, up = 0;
    for (const [dx, dy] of D8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (S.cliff && S.cliff[j]) cliff = 1; up = Math.max(up, W.tileH(j) - h0); }
    if (cliff || up > 2.6) return 'paredao';
    if (up > 1.1) return 'abrigo';
    if (S.type[i] === T.ROCKY) return G.hash(i * 3 + 1) < 0.5 ? 'fenda' : 'poco';
    return 'dolina';
  }
  C.mouthKind = function (m, cv) {
    if (m.fx === undefined) {
      if (!m.kind) m.kind = kindAt(G.S, m.x, m.y);
      // the lowest door of a cave with a stream lets the water out
      if (cv && cv.stream && m.kind !== 'poco') { let low = null; for (const o of cv.mouths) if (!low || W.tileH(o.y * N + o.x) < W.tileH(low.y * N + low.x)) low = o; if (low === m) m.spring = 1; }
      // which way the ground falls: the door faces it
      let bx = 0, by = 0; const h0 = W.tileH(m.y * N + m.x);
      for (const [dx, dy] of D8) { const nx = m.x + dx, ny = m.y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const d = h0 - W.tileH(ny * N + nx); bx += dx * d; by += dy * d; }
      m.fx = Math.sign(Math.round(bx * 4) / 4); m.fy = Math.sign(Math.round(by * 4) / 4);
    }
    return m.kind;
  };
  C.MOUTH_NAME = { paredao: 'uma boca num paredão de pedra', abrigo: 'um abrigo sob a rocha, na encosta', dolina: 'uma dolina: o chão afundou num buraco de pedra', fenda: 'uma fenda estreita entre pedras', poco: 'um poço que desce reto para o escuro' };

  // ------------------------------ the floor is not flat ------------------------------
  // the galleries go down as they go in, the halls have ledges by the walls and hollows in the middle,
  // the lakes lie low, a chasm drops out of sight
  C.LV = { step: 0.6, max: 3, ledge: 0.95, hollow: -0.6, lake: -0.75, stream: -0.35, pit: -6.5 };
  let lvNoise = null;
  function relevel(U) {
    const NN = N * N; if (!U.lv || U.lv.length !== NN) U.lv = new Float32Array(NN);
    const lv = U.lv; lv.fill(0); U.lvVer = U.ver;
    if (!lvNoise) lvNoise = G.makeNoise(((G.S && G.S.seed) || 1) + 911);
    const dist = new Int16Array(NN).fill(-1); const LV = C.LV;
    const stepOf = d => -Math.min(LV.max, Math.floor(d / 6) * LV.step);
    for (const cv of U.caves) {
      if (cv.gone) continue;
      const q = [];
      for (const m of cv.mouths) { const i = m.y * N + m.x; if (U.id[i] === cv.id && dist[i] < 0) { dist[i] = 0; q.push(i); } }
      if (!q.length && cv.halls[0]) { const i = cv.halls[0].y * N + cv.halls[0].x; if (U.id[i] === cv.id) { dist[i] = 6; q.push(i); } }
      for (let h = 0; h < q.length; h++) { const c = q[h]; const x = c % N, y = (c / N) | 0; for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (dist[j] >= 0 || U.id[j] !== cv.id || U.k[j] === ROCK) continue; dist[j] = dist[c] + 1; q.push(j); } }
      const hallBase = cv.halls.map(hh => { const i = hh.y * N + hh.x; return stepOf(dist[i] >= 0 ? dist[i] : 8); });
      for (const c of q) {
        const k = U.k[c]; const x = c % N, y = (c / N) | 0;
        if (k === MOUTH) { lv[c] = 0; continue; }
        if (k === PIT) { lv[c] = LV.pit; continue; }
        if (k === HALL || k === LAKE) {
          let b = stepOf(dist[c]), bd = 1e9; cv.halls.forEach((hh, n) => { const dd = (hh.x - x) ** 2 + (hh.y - y) ** 2; if (dd < bd && dd <= (hh.r + 1.5) ** 2) { bd = dd; b = hallBase[n]; } });
          if (k === LAKE) { lv[c] = b + LV.lake; continue; }
          let edge = 0; for (const [dx, dy] of D4) if (U.k[(y + dy) * N + x + dx] === ROCK) edge++;
          const nz = lvNoise(x * 0.42 + cv.id * 3.1, y * 0.42);
          lv[c] = b + (edge && nz > 0.18 ? LV.ledge : !edge && nz < -0.3 ? LV.hollow : 0);
        } else lv[c] = stepOf(dist[c]) + (k === STREAM ? LV.stream : 0);
      }
    }
  }
  C.level = i => { const U = C.U(); if (!U) return 0; if (U.lvVer !== U.ver || !U.lv) relevel(U); return U.lv[i]; };
  C.floorAt = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y); if (xi < 0 || yi < 0 || xi >= N || yi >= N) return C.FLOOR; return C.FLOOR + C.level(yi * N + xi); };
  const fresh = () => { const NN = N * N; return { k: new Uint8Array(NN), f: new Uint8Array(NN), ore: new Uint8Array(NN), oreN: new Uint8Array(NN), id: new Int16Array(NN), caves: [], beasts: [], ver: 1, nextBeast: 1 }; };
  C.U = () => G.S && G.S.ug;
  C.get = id => { const U = C.U(); return U && id > 0 ? U.caves[id - 1] || null : null; };
  C.all = () => { const U = C.U(); return U ? U.caves.filter(c => !c.gone) : []; };
  C.at = i => { const U = C.U(); return U && U.id[i] ? C.get(U.id[i]) : null; };
  C.isMouth = i => { const U = C.U(); return !!(U && U.k[i] === MOUTH); };
  C.inside = new Set();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rr = (a, b) => a + G.R() * (b - a);
  const pick = a => a[Math.floor(G.R() * a.length)];
  const log = (txt, ic, x, y) => G.Village.log(txt, ic || 'cave', x, y);
  const bio = (v, a, b) => { if (G.Life && v) G.Life.bio(v, 'note', a, b); };
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');

  // ------------------------------ names ------------------------------
  const NOUN = [['Gruta', 'f'], ['Caverna', 'f'], ['Lapa', 'f'], ['Furna', 'f'], ['Toca', 'f'], ['Covão', 'm'], ['Algar', 'm'], ['Abismo', 'm']];
  const QUAL = {
    crystal: ['dos Cristais', 'das Ametistas', 'do Cristal'], lake: ['do Lago Escuro', 'das Águas Negras', 'do Espelho'],
    stream: ['do Rio Oculto', 'da Água que Canta', 'do Rio sem Sol'], glow: ['das Estrelas', 'do Céu de Pedra', 'dos Mil Olhos'],
    fossil: ['do Gigante', 'dos Ossos Antigos'], bats: ['dos Morcegos', 'das Asas', 'do Morcego'], den: ['do Urso', 'da Ursa', 'do Sono Longo'],
    big: ['das Mil Salas', 'dos Ecos'], ice: ['de Gelo', 'do Gelo Azul', 'do Inverno'], pit: ['do Abismo', 'sem Fundo'], gen: ['do Eco', 'das Vozes', 'do Vento', 'da Serpente', 'do Silêncio', 'da Lua', 'das Sombras', 'dos Ancestrais', 'da Coruja', 'do Trovão'],
  };
  const ADJ = [['Escura', 'Escuro'], ['Fria', 'Frio'], ['Funda', 'Fundo'], ['Encantada', 'Encantado'], ['Velha', 'Velho'], ['Grande', 'Grande']];
  function nameCave(cv, rng, used) {
    for (let k = 0; k < 30; k++) {
      const [n, g] = NOUN[Math.floor(rng() * (cv.halls.length >= 4 ? NOUN.length : NOUN.length - 1))];
      let q = null;
      const tags = [C.rockOf(cv) === 'gelo' && 'ice', cv.pit && 'pit', cv.crystal && 'crystal', cv.lake && 'lake', cv.stream && 'stream', cv.glow && 'glow', cv.fossil && 'fossil', cv.bats > 60 && 'bats', cv.den && 'den', cv.halls.length >= 5 && 'big'].filter(Boolean);
      if (tags.length && rng() < 0.8) q = QUAL[tags[Math.floor(rng() * Math.min(2, tags.length))]];
      const name = q ? `${n} ${q[Math.floor(rng() * q.length)]}` : rng() < 0.35 ? `${n} ${ADJ[Math.floor(rng() * ADJ.length)][g === 'f' ? 0 : 1]}` : `${n} ${QUAL.gen[Math.floor(rng() * QUAL.gen.length)]}`;
      if (!used.has(name)) { used.add(name); cv.g = g; return name; }
    }
    cv.g = 'f'; return 'Gruta ' + cv.id;
  }
  // "na Gruta das Vozes", "no Algar do Eco"
  C.na = cv => (cv.g === 'm' ? 'no ' : 'na ') + cv.name;
  C.da = cv => (cv.g === 'm' ? 'do ' : 'da ') + cv.name;
  C.a = cv => (cv.g === 'm' ? 'o ' : 'a ') + cv.name;

  // ------------------------------ making the caves ------------------------------
  C.AMOUNT = { nenhuma: 0, poucas: 0.5, normais: 1, muitas: 2 };
  C.gen = function (S, amount) {
    const U = S.ug = fresh();
    const m = C.AMOUNT[amount] === undefined ? 1 : C.AMOUNT[amount];
    S.cavesOpt = amount || 'normais';
    if (!m) { C.rebuildNear(); return; }
    const rng = G.mulberry32(((S.seed || 1) * 7919 + 17) >>> 0);
    const nk = G.makeNoise((S.seed || 1) + 4242);
    let land = 0; const cands = [];
    for (let y = 5; y < N - 5; y++) for (let x = 5; x < N - 5; x++) {
      const i = y * N + x; const t = S.type[i]; if (t < T.SAND || t === T.RIVER) continue;
      land++;
      const h = W.tileH(i) - G.SEA; if (h < 0.8) continue;
      const karst = G.fbm(nk, x * 0.06, y * 0.06, 2);
      cands.push([x, y, h * 0.3 + karst * 3 + rng() * 1.4]);
    }
    const want = Math.max(1, Math.round(land / 900 * m));
    cands.sort((a, b) => b[2] - a[2]);
    const seeds = [];
    const far = (x, y, d) => !seeds.some(s => Math.hypot(s[0] - x, s[1] - y) < d);
    // every people gets a cave within reach (if the land has hills for one)
    if (S.starts) for (const st of S.starts) {
      if (m < 0.5) break;
      let best = null, bs = -1e9;
      for (const c of cands) { const d = Math.hypot(c[0] - st[0], c[1] - st[1]); if (d < 7 || d > 22 || !far(c[0], c[1], 11)) continue; const s = c[2] - Math.abs(d - 13) * 0.15; if (s > bs) { bs = s; best = c; } }
      if (best) seeds.push(best);
    }
    for (const c of cands) { if (seeds.length >= want + (S.starts ? S.starts.length * 0.5 : 0)) break; if (far(c[0], c[1], 13)) seeds.push(c); }
    for (const [x, y] of seeds) carve(S, U, x, y, rng, nk);
    const used = new Set();
    for (const cv of U.caves) cv.name = nameCave(cv, rng, used);
    C.rebuildNear(); U.ver++;
  };

  function carve(S, U, sx, sy, rng, nk) {
    const id = U.caves.length + 1;
    const cv = { id, name: '', halls: [], mouths: [], n: 0, cx: sx, cy: sy, known: {}, found: null, paintings: [], tombs: [], oracle: null, bandits: null, treasures: [], sleepers: [], guano: 0, bats: 0, roost: null, visits: 0, day: S.day || 1 };
    const ok = (x, y) => x >= 2 && y >= 2 && x < N - 2 && y < N - 2 && S.type[y * N + x] >= T.RIVER && (U.id[y * N + x] === 0 || U.id[y * N + x] === id);
    const set = (x, y, k) => { if (!ok(x, y)) return false; const i = y * N + x; if (U.k[i] === ROCK || (k === HALL && U.k[i] === GAL)) { U.k[i] = k; U.id[i] = id; } return true; };
    const nh = 2 + Math.floor(rng() * 3) + (rng() < 0.3 ? 1 : 0) + (N >= 128 ? 1 : 0);
    let tries = 0;
    while (cv.halls.length < nh && tries++ < 80) {
      let hx, hy;
      if (!cv.halls.length) { hx = sx; hy = sy; }
      else { const b = cv.halls[Math.floor(rng() * cv.halls.length)]; const a = rng() * TAU, d = 4.5 + rng() * 4.5; hx = Math.round(b.x + Math.cos(a) * d); hy = Math.round(b.y + Math.sin(a) * d); }
      if (!ok(hx, hy)) continue;
      let clash = false;
      for (let dy = -6; dy <= 6 && !clash; dy++) for (let dx = -6; dx <= 6; dx++) { const x = hx + dx, y = hy + dy; if (x >= 0 && y >= 0 && x < N && y < N && U.id[y * N + x] && U.id[y * N + x] !== id) { clash = true; break; } }
      if (clash || cv.halls.some(h => Math.hypot(h.x - hx, h.y - hy) < 3.6)) continue;
      const r = 1.5 + rng() * 1.8 + (rng() < 0.25 ? 1.1 : 0);
      for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
        const d = Math.hypot(dx * 0.85, dy) + G.fbm(nk, (hx + dx) * 0.5 + 9, (hy + dy) * 0.5, 2) * 1.1;
        if (d < r) set(hx + dx, hy + dy, HALL);
      }
      set(hx, hy, HALL);
      cv.halls.push({ x: hx, y: hy, r });
    }
    if (!cv.halls.length) return null;
    const paths = [];
    const worm = (ax, ay, bx, by) => {
      let x = ax, y = ay; const path = [];
      for (let s = 0; s < 180; s++) {
        const dx = bx - x, dy = by - y; if (!dx && !dy) break;
        const ang = Math.atan2(dy, dx) + (rng() - 0.5) * 1.7; const cx = Math.cos(ang), cy = Math.sin(ang);
        let nx = x, ny = y;
        if (Math.abs(cx) > Math.abs(cy)) nx += Math.sign(cx); else ny += Math.sign(cy);
        if (!ok(nx, ny)) { nx = x; ny = y; if (Math.abs(cx) > Math.abs(cy)) ny += Math.sign(dy) || 1; else nx += Math.sign(dx) || 1; if (!ok(nx, ny)) break; }
        x = nx; y = ny; set(x, y, GAL); path.push(y * N + x);
        if (rng() < 0.13) set(x + (rng() < 0.5 ? 1 : 0), y + (rng() < 0.5 ? 0 : 1), GAL);
      }
      paths.push(path); return path;
    };
    for (let k = 1; k < cv.halls.length; k++) {
      const a = cv.halls[k]; let b = cv.halls[0], bd = 1e9;
      for (let q = 0; q < k; q++) { const d = Math.hypot(cv.halls[q].x - a.x, cv.halls[q].y - a.y); if (d < bd) { bd = d; b = cv.halls[q]; } }
      worm(a.x, a.y, b.x, b.y);
    }
    if (cv.halls.length >= 3 && rng() < 0.45) worm(cv.halls[0].x, cv.halls[0].y, cv.halls[cv.halls.length - 1].x, cv.halls[cv.halls.length - 1].y);
    const nb = 1 + Math.floor(rng() * 3);
    for (let k = 0; k < nb; k++) { const h = cv.halls[Math.floor(rng() * cv.halls.length)]; const a = rng() * TAU, L = 3 + rng() * 7; worm(h.x, h.y, Math.round(h.x + Math.cos(a) * L), Math.round(h.y + Math.sin(a) * L)); }
    // keep only what is joined to the first hall
    keepJoined(U, id, cv.halls[0].y * N + cv.halls[0].x);
    cv.halls = cv.halls.filter(h => U.id[h.y * N + h.x] === id);
    // mouths on the hillsides around
    const nm = rng() < 0.07 ? 0 : rng() < 0.62 ? 1 : rng() < 0.82 ? 2 : 3;
    for (let k = 0; k < nm; k++) { const m = findMouth(S, U, cv, id, rng); if (!m) break; worm(m.fx, m.fy, m.x, m.y); const i = m.y * N + m.x; U.k[i] = MOUTH; U.id[i] = id; cv.mouths.push({ x: m.x, y: m.y, kind: kindAt(S, m.x, m.y) }); }
    keepJoined(U, id, cv.halls[0].y * N + cv.halls[0].x);
    cv.mouths = cv.mouths.filter(m => U.id[m.y * N + m.x] === id && U.k[m.y * N + m.x] === MOUTH);
    // water: a black lake in the biggest hall, a stream along a gallery
    const big = cv.halls.slice().sort((a, b) => b.r - a.r)[0];
    if (cv.halls.length >= 3 && big.r > 2.3 && rng() < 0.5) {
      const was = [];
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = big.x + dx, y = big.y + dy; const i = y * N + x; if (x < 0 || y < 0 || x >= N || y >= N || U.id[i] !== id || U.k[i] !== HALL) continue; if (Math.hypot(dx * 0.85, dy) < big.r - 1.05) { was.push(i); U.k[i] = LAKE; } }
      if (was.length < 2 || !joined(U, id)) { for (const i of was) U.k[i] = HALL; } else cv.lake = big;
    }
    if (rng() < 0.38) { const p = paths.filter(q => q.length >= 5).sort((a, b) => b.length - a.length)[0]; if (p) { for (const i of p) if (U.id[i] === id && U.k[i] === GAL) U.k[i] = STREAM; cv.stream = 1; } }
    // a chasm at the side of a big hall: a fall nobody has measured (only where the cave stays whole around it)
    const pitHalls = cv.halls.filter(h => h !== cv.lake && h.r > 2.1);
    if (pitHalls.length && rng() < 0.5) {
      const ph = pitHalls[Math.floor(rng() * pitHalls.length)];
      const a = rng() * TAU, off = Math.max(0.8, ph.r - 1.4);
      const px = Math.round(ph.x + Math.cos(a) * off), py = Math.round(ph.y + Math.sin(a) * off), pr = 0.75 + rng() * 0.9;
      const centers = new Set(cv.halls.map(h => h.y * N + h.x)); const was = [];
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = px + dx, y = py + dy; if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1) continue; const i = y * N + x; if (U.id[i] !== id || U.k[i] !== HALL || centers.has(i)) continue; if (Math.hypot(dx, dy * 1.1) <= pr) { was.push(i); U.k[i] = PIT; } }
      if (!was.length || was.length > 7 || !joined(U, id)) { for (const i of was) U.k[i] = HALL; } else cv.pit = 1;
    }
    // what grows and lies in it
    cv.crystal = rng() < 0.14; cv.glow = !!(cv.lake || cv.stream || rng() < 0.25);
    let n = 0, sx2 = 0, sy2 = 0;
    for (let i = 0; i < N * N; i++) {
      if (U.id[i] !== id) continue; n++; sx2 += i % N; sy2 += (i / N) | 0;
      const k = U.k[i]; if (k !== HALL && k !== GAL) continue;
      const hall = k === HALL, r = rng();
      // (each kind gets its own slice of chance)
      const P = hall ? [cv.crystal ? 0.14 : 0, 0.12, 0.04, cv.glow ? 0.1 : 0, 0.05, 0.018, 0.006] : [0, 0.04, 0, cv.glow ? 0.06 : 0, 0.01, 0.012, 0];
      const KS = [FT.CRYS, FT.STAL, FT.COL, FT.GLOW, FT.SHROOM, FT.BONES, FT.FOSSIL];
      let acc = 0;
      for (let q = 0; q < KS.length; q++) { acc += P[q]; if (r < acc) { if (KS[q] === FT.COL && nearRock(U, i) > 0) break; U.f[i] = KS[q]; if (KS[q] === FT.FOSSIL) cv.fossil = 1; break; } }
    }
    cv.n = n; cv.cx = sx2 / Math.max(1, n); cv.cy = sy2 / Math.max(1, n);
    // ores in the walls, in veins
    for (let i = 0; i < N * N; i++) {
      if (U.id[i] !== id || !C.walk(U.k[i]) && U.k[i] !== LAKE) continue;
      const x = i % N, y = (i / N) | 0;
      for (const [dx, dy] of D8) {
        const rx = x + dx, ry = y + dy; if (rx < 1 || ry < 1 || rx >= N - 1 || ry >= N - 1) continue;
        const j = ry * N + rx; if (U.k[j] !== ROCK || U.ore[j] || U.id[j]) continue;
        if (G.fbm(nk, rx * 0.22 + 100, ry * 0.22 - 40, 2) < 0.06) continue;
        const h = W.tileH(j) - G.SEA, b = S.biome ? S.biome[j] : 0;
        let o = 0;
        if ((b === 6 || b === 5) && rng() < 0.1) o = 5;
        else if (cv.crystal && rng() < 0.06) o = 6;
        else if (h > 6 && rng() < 0.05) o = 4;
        else if (h > 4 && rng() < 0.1) o = 3;
        else if (rng() < 0.08) o = 1;
        else if (rng() < 0.05) o = 2;
        if (o) { U.ore[j] = o; U.oreN[j] = ORES[o].n + Math.floor(rng() * 3); }
      }
    }
    // bats in a high hall, a bear's den near the door
    const mb = cv.mouths[0] ? S.biome[cv.mouths[0].y * N + cv.mouths[0].x] : -1;
    if (cv.mouths.length && mb !== 1) {
      cv.bats = Math.min(260, Math.round((18 + n * 0.9) * (0.5 + rng())));
      cv.roost = { x: big.x, y: big.y, r: big.r };
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const i = (big.y + dy) * N + big.x + dx; if (U.id[i] === id && U.k[i] === HALL && !U.f[i] && rng() < 0.4) U.f[i] = FT.GUANO; }
    }
    cv.den = cv.mouths.length && (mb === 0 || mb === 1 || mb === 2) && rng() < 0.85 ? 1 : 0;
    // things left in the dark long ago
    const TK = ['geodo', 'reliquia', 'tesouro', 'idolo', 'ossada'];
    const nt = rng() < 0.35 ? 0 : rng() < 0.75 ? 1 : 2;
    for (let k = 0; k < nt; k++) {
      const h = cv.halls[Math.floor(rng() * cv.halls.length)]; const c = freeCell(U, id, h.x, h.y, 3, rng); if (!c) continue;
      cv.treasures.push({ x: c % N, y: (c / N) | 0, kind: cv.crystal && rng() < 0.6 ? 'geodo' : TK[Math.floor(rng() * TK.length)], found: 0 });
    }
    C.rockOf(cv); for (const m of cv.mouths) C.mouthKind(m, cv);
    // a little clearing at each door: the wind, the animals and the people keep it open
    for (const m of cv.mouths) for (const [dx, dy] of D8.concat([[0, 2], [2, 0], [0, -2], [-2, 0]])) { const x = m.x + dx, y = m.y + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const tid = S.treeAt[y * N + x]; const tr = tid && S.trees.get(tid); if (tr && G.Nature.removeTree) G.Nature.removeTree(tr); }
    U.caves.push(cv);
    // its creatures
    const sp = (kind, num, where) => { for (let k = 0; k < num; k++) { const c = where(); if (c >= 0) U.beasts.push({ id: U.nextBeast++, kind, cave: id, x: (c % N) + 0.2 + rng() * 0.6, y: ((c / N) | 0) + 0.2 + rng() * 0.6, t: rng() * 4, face: 1, tx: 0, ty: 0 }); } };
    const cellsOf = test => { const out = []; for (let i = 0; i < N * N; i++) if (U.id[i] === id && test(U.k[i], i)) out.push(i); return out; };
    const floor = cellsOf(k => k === HALL || k === GAL), water = cellsOf(k => k === LAKE || k === STREAM);
    const rnd = list => () => list.length ? list[Math.floor(rng() * list.length)] : -1;
    sp('aranha', 2 + Math.floor(rng() * 4), rnd(floor));
    sp('grilo', 3 + Math.floor(rng() * 5), rnd(floor));
    if (water.length) { sp('peixe', 3 + Math.floor(rng() * 5), rnd(water)); sp('salamandra', 2 + Math.floor(rng() * 3), rnd(floor.filter(i => nearKind(U, i, LAKE) || nearKind(U, i, STREAM)).concat(water.filter(i => U.k[i] === STREAM)))); }
    else if (cv.glow) sp('salamandra', 1 + Math.floor(rng() * 2), rnd(floor));
    return cv;
  }
  function nearRock(U, i) { const x = i % N, y = (i / N) | 0; let n = 0; for (const [dx, dy] of D8) { const j = (y + dy) * N + x + dx; if (U.k[j] === ROCK) n++; } return n; }
  function nearKind(U, i, k) { const x = i % N, y = (i / N) | 0; for (const [dx, dy] of D8) { const j = (y + dy) * N + x + dx; if (U.k[j] === k) return true; } return false; }
  function freeCell(U, id, x, y, r, rng) {
    for (let t = 0; t < 30; t++) { const cx = x + Math.round((rng() - 0.5) * 2 * r), cy = y + Math.round((rng() - 0.5) * 2 * r); if (cx < 0 || cy < 0 || cx >= N || cy >= N) continue; const i = cy * N + cx; if (U.id[i] === id && U.k[i] === HALL && U.f[i] !== FT.COL) return i; }
    return -1;
  }
  // only one piece: what the worms left cut off goes back to rock
  function keepJoined(U, id, start) {
    const seen = new Uint8Array(N * N); const q = [start]; seen[start] = 1;
    for (let h = 0; h < q.length; h++) { const c = q[h]; const x = c % N, y = (c / N) | 0; for (const [dx, dy] of D4) { const j = (y + dy) * N + x + dx; if (!seen[j] && U.id[j] === id && U.k[j] !== ROCK) { seen[j] = 1; q.push(j); } } }
    for (let i = 0; i < N * N; i++) if (U.id[i] === id && !seen[i]) { U.id[i] = 0; U.k[i] = ROCK; U.f[i] = 0; }
  }
  function joined(U, id) {
    let start = -1, total = 0; for (let i = 0; i < N * N; i++) if (U.id[i] === id && C.walk(U.k[i])) { total++; if (start < 0) start = i; }
    if (start < 0) return true;
    const seen = new Uint8Array(N * N); const q = [start]; seen[start] = 1;
    for (let h = 0; h < q.length; h++) { const c = q[h]; const x = c % N, y = (c / N) | 0; for (const [dx, dy] of D4) { const j = (y + dy) * N + x + dx; if (!seen[j] && U.id[j] === id && C.walk(U.k[j])) { seen[j] = 1; q.push(j); } } }
    return q.length === total;
  }
  // a door on a hillside, above the dry land the people walk
  function findMouth(S, U, cv, id, rng) {
    const dist = new Int16Array(N * N).fill(99); const q = [];
    for (let i = 0; i < N * N; i++) if (U.id[i] === id) { dist[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) { const c = q[h]; if (dist[c] >= 10) continue; const x = c % N, y = (c / N) | 0; for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const j = ny * N + nx; if (dist[j] > dist[c] + 1) { dist[j] = dist[c] + 1; q.push(j); } } }
    const LID = W.landIds(); const sizes = {}; for (let i = 0; i < N * N; i++) if (LID[i] >= 0) sizes[LID[i]] = (sizes[LID[i]] || 0) + 1;
    let avg = 0, na = 0; for (const h of cv.halls) { avg += W.tileH(h.y * N + h.x); na++; } avg /= Math.max(1, na);
    let best = null, bs = -1e9;
    const wr = rng(); const wish = wr < 0.38 ? 'paredao' : wr < 0.58 ? 'abrigo' : wr < 0.8 ? 'dolina' : wr < 0.9 ? 'fenda' : 'poco';
    for (let i = 0; i < N * N; i++) {
      const d = dist[i]; if (d < 2 || d > 9) continue;
      const x = i % N, y = (i / N) | 0; if (x < 3 || y < 3 || x >= N - 3 || y >= N - 3) continue;
      const t = S.type[i]; if (t < T.SAND || t === T.RIVER || S.cliff[i] || S.occ[i] || S.treeAt[i] || S.objAt[i] || !W.walkable(i)) continue;
      if (!(sizes[LID[i]] >= 60) || U.k[i] !== ROCK || U.id[i]) continue;
      if (cv.mouths.some(m => Math.hypot(m.x - x, m.y - y) < 6)) continue;
      if (S.starts && S.starts.some(s => Math.hypot(s[0] - x, s[1] - y) < 5)) continue;
      const rg = G.Relief ? G.Relief.range(i) : 0;
      let cliffNb = 0; for (const [dx, dy] of D4) if (S.cliff[(y + dy) * N + x + dx]) cliffNb = 1;
      // each cave wishes for a kind of door the ground may or may not give; a second door is another kind
      const kd = kindAt(S, x, y);
      const s = (Math.min(rg, 2.6) * 1.3 + cliffNb * 1.6) * (wish === 'paredao' ? 1 : 0.5) + (avg - W.tileH(i)) * 0.25 - d * 0.22 + rng() * 0.8
        + (kd === wish ? 2.2 : 0) + (cv.mouths.length && !cv.mouths.some(mm => mm.kind === kd) ? 1.4 : 0);
      if (s > bs) { bs = s; best = i; }
    }
    if (best === null) return null;
    // the cave cell nearest to it, where the passage starts
    const bx = best % N, by = (best / N) | 0; let f = -1, fd = 1e9;
    for (let i = 0; i < N * N; i++) if (U.id[i] === id && C.walk(U.k[i])) { const d = Math.hypot((i % N) - bx, ((i / N) | 0) - by); if (d < fd) { fd = d; f = i; } }
    if (f < 0) return null;
    return { x: bx, y: by, fx: f % N, fy: (f / N) | 0 };
  }
  // surface tiles near a mouth: whoever walks by finds it
  C.rebuildNear = function () {
    const U = C.U(); if (!U) return;
    U.near = new Int16Array(N * N);
    for (const cv of U.caves) if (!cv.gone) for (const m of cv.mouths) for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = m.x + dx, y = m.y + dy; if (x >= 0 && y >= 0 && x < N && y < N && dx * dx + dy * dy <= 10) U.near[y * N + x] = cv.id; }
  };

  // ------------------------------ ways underground ------------------------------
  function route(cid, a, b) {
    const U = C.U(); if (a === b) return [a];
    const prev = new Map(); prev.set(a, -1); const q = [a];
    for (let h = 0; h < q.length; h++) {
      const c = q[h]; const x = c % N, y = (c / N) | 0;
      for (const [dx, dy] of D8) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const j = ny * N + nx; if (prev.has(j) || U.id[j] !== cid || !C.walk(U.k[j])) continue;
        if (dx && dy && (!C.walk(U.k[y * N + nx]) || !C.walk(U.k[ny * N + x]))) continue;
        prev.set(j, c);
        if (j === b) { const p = [j]; let k = c; while (k >= 0) { p.push(k); k = prev.get(k); } return p.reverse(); }
        q.push(j);
      }
    }
    return null;
  }
  C.route = route;
  const cellsOfCave = (cv, test) => { const U = C.U(); const out = []; for (let i = 0; i < N * N; i++) if (U.id[i] === cv.id && test(U.k[i], i)) out.push(i); return out; };
  C.cellsOf = cellsOfCave;
  // the hall furthest from the door: tombs, the oracle and the hidden go deep
  function deepHall(cv) {
    const U = C.U(); const m = cv.mouths[0]; if (!m) return cv.halls[0];
    let best = cv.halls[0], bd = -1;
    for (const h of cv.halls) { if (U.k[h.y * N + h.x] === LAKE) continue; const d = Math.hypot(h.x - m.x, h.y - m.y); if (d > bd) { bd = d; best = h; } }
    return best;
  }
  function spotIn(cv, h, avoid) {
    const U = C.U();
    for (let t = 0; t < 40; t++) {
      const x = h.x + Math.round(rr(-h.r, h.r)), y = h.y + Math.round(rr(-h.r, h.r)); if (x < 0 || y < 0 || x >= N || y >= N) continue;
      const i = y * N + x; if (U.id[i] !== cv.id || (U.k[i] !== HALL && U.k[i] !== GAL) || U.f[i] === FT.COL) continue;
      if (avoid && avoid(i)) continue; return i;
    }
    for (let i = 0; i < N * N; i++) if (U.id[i] === cv.id && (U.k[i] === HALL || U.k[i] === GAL) && !(avoid && avoid(i))) return i;
    return -1;
  }
  // a floor cell beside a wall (paintings face the rock)
  function wallSpot(cv) {
    const U = C.U(); const used = new Set(cv.paintings.map(p => p.i));
    const rockSides = i => { const x = i % N, y = (i / N) | 0; return D4.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < N && U.k[ny * N + nx] === ROCK; }); };
    const list = cellsOfCave(cv, (k, i) => (k === HALL || k === GAL) && !used.has(i) && U.f[i] !== FT.COL && nearRock(U, i) >= 2 && rockSides(i).length > 0);
    if (!list.length) return null;
    const i = pick(list);
    return { i, w: pick(rockSides(i)) };
  }
  const nearestMouth = (cv, x, y) => { let b = null, bd = 1e9; for (const m of cv.mouths) { const d = G.dist2(x, y, m.x + 0.5, m.y + 0.5); if (d < bd) { bd = d; b = m; } } return b; };
  C.nearestMouth = nearestMouth;
  // a known cave a people can walk to from a town
  function caveFor(set, maxD, test) {
    let best = null, bd = maxD * maxD;
    for (const cv of C.all()) {
      if (!cv.mouths.length || !cv.known[set.fac] || (test && !test(cv))) continue;
      for (const m of cv.mouths) { const d = G.dist2(set.cx, set.cy, m.x, m.y); if (d < bd && W.sameLand(set.cx, set.cy, m.x, m.y)) { bd = d; best = cv; } }
    }
    return best;
  }
  C.caveFor = caveFor;

  // ------------------------------ going in and out ------------------------------
  function enter(v, cv, t) {
    const m = t.mouth; v.ug = cv.id; v.inside = UGIN; v.x = m.x + 0.5; v.y = m.y + 0.5; v.path = null; v.moving = false; v.sleeping = false;
    C.inside.add(v.id); cv.visits++;
    // a baby in the arms comes too
    for (const b of G.S.villagers.values()) if (b.age < 2 && b.carried && b.carrier === v.id) { b.ug = cv.id; b.inside = UGIN; b.x = v.x; b.y = v.y; C.inside.add(b.id); }
    t.cell = (m.y * N + m.x);
  }
  function exit(v) {
    const S = G.S; const cv = C.get(v.ug);
    let m = cv && nearestMouth(cv, v.x, v.y);
    let x = m ? m.x + 0.5 : v.x, y = m ? m.y + 0.5 : v.y;
    if (!W.walkableXY(x, y)) { const n = W.nearestLand(x, y, 5); if (n) { x = n[0]; y = n[1]; } }
    v.ug = 0; if (v.inside === UGIN) v.inside = 0; v.x = x; v.y = y; v.path = null; v.moving = false;
    C.inside.delete(v.id);
    for (const b of S.villagers.values()) if (b.ug && b.age < 2 && b.carrier === v.id) { b.ug = 0; if (b.inside === UGIN) b.inside = 0; b.x = x; b.y = y; C.inside.delete(b.id); }
  }
  C.exitNow = exit;
  function walkUG(v, t, dt) {
    if (!t.up || t.ui >= t.up.length) { v.moving = false; return true; }
    const c = t.up[t.ui]; const px = (c % N) + 0.5 + (t.jx || 0), py = ((c / N) | 0) + 0.5 + (t.jy || 0);
    const dx = px - v.x, dy = py - v.y; const d = Math.hypot(dx, dy);
    const sp = (v.speed || 1) * 0.85 * (v.age < 8 ? 0.8 : v.age >= 62 ? 0.72 : 1) * (G.Caves.U().k[c] === STREAM ? 0.6 : 1);
    const step = sp * dt;
    if (d <= step || d < 0.001) { v.x = px; v.y = py; t.ui++; } else { v.x += dx / d * step; v.y += dy / d * step; }
    if (Math.abs(dx) + Math.abs(dy) > 0.02) G.faceTo(v, dx, dy);
    v.walkPh += step * 8.5; v.moving = true;
    return t.ui >= t.up.length;
  }
  function goUG(v, t, cv, to) {
    const from = W.idx(v.x, v.y);
    t.up = route(cv.id, from, to) || [to]; t.ui = 1; t.jx = rr(-0.22, 0.22); t.jy = rr(-0.22, 0.22);
  }

  // ------------------------------ the people's errands below ------------------------------
  // kind: explore · paint · guano · pilgrim · oracle · tomb · refuge · mine · raid (against outlaws)
  const ACT = { explore: '', paint: 'craft', guano: 'dig', pilgrim: 'pray', oracle: 'pray', tomb: 'mourn', refuge: 'sittalk', mine: 'mine', raid: 'fight', treasure: 'dig' };
  C.give = function (v, kind, cv, goal, o) {
    const m = nearestMouth(cv, v.x, v.y); if (!m) return false;
    const t = Object.assign({ type: 'caverna', kind, cave: cv.id, goal, pri: 1.3, st: 0, stay: rr(8, 14), torch: 1, mouth: m }, o || {});
    if (o && o.force) { G.Vg.setTask(v, t); return true; }
    return G.Vg.give(v, t);
  };
  C.run = function (v, t, dt, H) {
    if (t.type !== 'caverna') return false;
    const cv = C.get(t.cave);
    if (!cv || cv.gone) { if (v.ug) exit(v); H.end(v); return true; }
    switch (t.st) {
      case 0: if (!H.goto(v, t.mouth.x + 0.5, t.mouth.y + 0.5, true)) { if (G.dist(v.x, v.y, t.mouth.x + 0.5, t.mouth.y + 0.5) > 1.6) { H.end(v); return true; } } t.st = 1; break;
      case 1: if (H.move(v, dt)) { if (t.kind === 'dare') { t.st = 10; t.t = 0; v.act = 'act'; v.actT = 0; G.faceTo(v, t.mouth.x + 0.5 - v.x, t.mouth.y + 0.5 - v.y); break; } enter(v, cv, t); goUG(v, t, cv, t.goal); t.st = 2; } break;
      case 10: { // a child shouts into the dark... and the dark shouts back
        t.t += dt; v.moving = false; const mx = t.mouth.x + 0.5, my = t.mouth.y + 0.5;
        if (!t.said && t.t > 0.6) { t.said = 1; G.FX && G.FX.floater(v.x, v.y, t.word, '#fff7dc', 1.6); G.Audio && G.Audio.at && G.Audio.at(v.x, v.y, 'cheer'); }
        if (t.said === 1 && t.t > 1.7) { t.said = 2; G.FX && G.FX.floater(mx, my, t.word.toLowerCase().replace(/!/g, '…'), 'rgba(255,247,220,0.7)', 1.4); }
        if (t.said === 2 && t.t > 2.6) { t.said = 3; G.FX && G.FX.floater(mx, my, t.word.slice(-2).toLowerCase().replace(/!/g, '') + '…', 'rgba(255,247,220,0.4)', 1.2); }
        if (t.t > 3.6) { v.act = ''; G.Vg.emote(v, G.R() < 0.5 ? 'happy' : 'fear', 2); if (G.Vg.fleeFrom) G.Vg.fleeFrom(v, mx, my, 5, 'play'); else H.end(v); if (v.task === t) H.end(v); }
        break;
      }
      case 2: if (walkUG(v, t, dt)) { t.st = 3; t.t = 0; v.act = ACT[t.kind] || ''; v.actT = 0; arrive(v, t, cv); } break;
      case 3: {
        t.t += dt; v.moving = false;
        if (t.face) G.faceTo(v, t.face[0], t.face[1]);
        work(v, t, cv, dt);
        // hunger and the night call everyone home (the hidden stay while the danger lasts)
        const late = t.kind !== 'refuge' && t.kind !== 'oracle' && t.kind !== 'raid' && (G.isNight() || v.hunger > 86);
        if (t.done || t.t >= t.stay || late) { v.act = ''; done(v, t, cv); const m = nearestMouth(cv, v.x, v.y); goUG(v, t, cv, m.y * N + m.x); t.st = 4; }
        break;
      }
      case 4: if (walkUG(v, t, dt)) {
        exit(v); const carry = t.carry; H.end(v);
        if (carry && carry.k === 'guano') manure(v, carry.n, cv);
        else if (carry && carry.n > 0) { v.carry = carry; G.Vg.setTask(v, { type: 'deliver', pri: 1.1 }); }
        after(v, t, cv);
      } break;
    }
    return true;
  };
  C.taskText = function (v, t) {
    if (t.type !== 'caverna') return null;
    const cv = C.get(t.cave); const where = cv ? C.na(cv) : 'na caverna'; const into = cv ? C.a(cv) : 'a caverna';
    const going = t.st < 2;
    switch (t.kind) {
      case 'explore': return going ? `Indo explorar ${into}` : `Explorando ${C.a(cv)} com uma tocha`;
      case 'paint': return going ? 'Levando ocre e carvão para a caverna' : t.st === 3 ? `Pintando a história do povo ${where}` : `Pintando ${where}`;
      case 'guano': return t.st < 4 ? `Recolhendo guano dos morcegos ${where}` : 'Trazendo guano para adubar os campos';
      case 'pilgrim': return going ? `Em peregrinação ao oráculo ${C.da(cv)}` : 'Ouvindo o oráculo';
      case 'oracle': return going ? `Subindo ${C.a(cv).replace(/^./, c => c)} para profetizar` : `Profetizando ${where}`;
      case 'tomb': return going ? 'Acompanhando o cortejo fúnebre do governante' : `Velando o túmulo real ${where}`;
      case 'refuge': return going ? `Fugindo para se esconder ${where}` : `Escondid${oa(v)} ${where}, esperando o perigo passar`;
      case 'mine': { const o = ORES[t.ore || 0]; return t.st === 3 ? `Picando um veio de ${o ? o.name : 'minério'} ${where}` : t.st === 4 ? 'Saindo da mina carregad' + oa(v) : `Descendo à mina ${where}`; }
      case 'raid': return going ? `Marchando contra os bandidos ${where}` : `Lutando contra os bandidos ${where}!`;
      case 'treasure': return `Desenterrando algo que brilha ${where}`;
      case 'dare': return t.st === 10 ? `Gritando na boca ${C.da(cv)} para ouvir o eco` : `Correndo com as outras crianças até ${into}`;
    }
    return `Dentro ${C.da(cv)}`;
  };
  function arrive(v, t, cv) {
    const U = C.U();
    if (t.kind === 'paint' && t.wall) t.face = t.wall;
    if (t.kind === 'mine' && t.vein >= 0) { const vx = t.vein % N, vy = (t.vein / N) | 0; t.face = [vx + 0.5 - v.x, vy + 0.5 - v.y]; }
    if (t.kind === 'raid') { const b = cv.bandits; if (b) b.fightT = (b.fightT || 0); }
    if (t.kind === 'oracle' && cv.oracle) cv.oracle.here = v.id;
    if (t.kind === 'explore') findAround(v, cv, t);
    void U;
  }
  function work(v, t, cv, dt) {
    const U = C.U();
    if (t.kind === 'mine' && t.vein >= 0) {
      t.dig = (t.dig || 0) + dt;
      if (v.actT > 0.6) { v.actT = 0; G.Audio && G.Audio.at && G.Audio.at(v.x, v.y, 'chop'); }
      if (t.dig > 7 && !t.carry) {
        const o = U.ore[t.vein]; const def = ORES[o];
        if (def) { t.carry = { k: def.good, n: def.good === 'food' ? 4 : def.good === 'joias' ? 1 : def.good === 'ouro' ? 1 : 2 }; t.ore = o; }
        U.oreN[t.vein] = Math.max(0, U.oreN[t.vein] - 1);
        // the vein gives out: the miners have dug a new gallery into the rock
        if (!U.oreN[t.vein]) { U.ore[t.vein] = 0; U.k[t.vein] = DUG; U.id[t.vein] = cv.id; cv.n++; cv.dug = (cv.dug || 0) + 1; U.ver++; seedVeins(t.vein, cv); }
        t.done = true;
      }
    } else if (t.kind === 'paint') {
      t.p = (t.p || 0) + dt;
      if (t.p > t.stay * 0.9 && !t.painted) { t.painted = 1; paintNow(v, t, cv); }
    } else if (t.kind === 'guano') {
      if (t.t > 5 && !t.carry && cv.guano >= 1) { const n = Math.min(4, Math.floor(cv.guano)); cv.guano -= n; t.carry = { k: 'guano', n }; t.done = true; }
    } else if (t.kind === 'refuge') {
      const s = G.S.settlements.get(v.set);
      if (!s || !(s.alarmT > 0)) { t.calm = (t.calm || 0) + dt; if (t.calm > 10) t.done = true; } else t.calm = 0;
      t.stay = 1e9; if (t.t > DAY() * 0.6) t.done = true;
    } else if (t.kind === 'oracle') {
      t.stay = 1e9; if (G.S.time > 0.7 || !cv.oracle || cv.oracle.id !== v.id) t.done = true;
    } else if (t.kind === 'raid') fightBandits(v, t, cv, dt);
    else if (t.kind === 'treasure' && t.t > 5) t.done = true;
  }
  function done(v, t, cv) {
    if (t.kind === 'oracle' && cv.oracle && cv.oracle.here === v.id) cv.oracle.here = 0;
    if (t.kind === 'pilgrim' && cv.oracle) {
      v.devotion = Math.min(100, (v.devotion || 0) + 6); G.S.faith = Math.min(999, G.S.faith + 0.6);
      if (!cv.oracle.pilgrims) cv.oracle.pilgrims = 0; cv.oracle.pilgrims++;
      bio(v, `Subiu ${C.a(cv)} para ouvir o oráculo.`, `Subi ${C.a(cv)} para ouvir o oráculo`);
    }
    if (t.kind === 'tomb') bio(v, `Velou o túmulo real ${C.na(cv)}.`, null);
    if (t.kind === 'treasure') takeTreasure(v, t, cv);
  }
  function after(v, t, cv) {
    if (t.kind === 'refuge') G.Vg.emote(v, 'happy', 2);
  }
  // the bats' droppings make the fields of the town richer
  function manure(v, n, cv) {
    const S = G.S; let farms = 0;
    for (const b of S.buildings.values()) {
      if (b.type !== 'farm' || b.set !== v.set) continue; farms++;
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { const i = y * N + x; S.fert[i] = Math.min(1, S.fert[i] + 0.035 * n); }
      if (b.crops) for (const c of b.crops) if (c && c.s > 0 && c.s < 3) c.g = Math.min(1, (c.g || 0) + 0.06 * n);
    }
    if (farms) { const set = S.settlements.get(v.set); if (set && set._guanoDay !== S.day && G.R() < 0.4) { set._guanoDay = S.day; log(`${v.name} trouxe guano dos morcegos ${C.da(cv)} e adubou os campos de ${set.name}.`, 'food', set.cx, set.cy); } }
  }
  // new veins appear as the miners go deeper
  function seedVeins(i, cv) {
    const U = C.U(); const S = G.S; const x = i % N, y = (i / N) | 0;
    for (const [dx, dy] of D4) {
      const j = (y + dy) * N + x + dx; if (U.k[j] !== ROCK || U.ore[j] || U.id[j]) continue;
      if (G.R() < 0.45) { const h = W.tileH(j) - G.SEA; const b = S.biome ? S.biome[j] : 0; const o = (b === 6 || b === 5) && G.R() < 0.3 ? 5 : h > 6 && G.R() < 0.12 ? 4 : h > 4 && G.R() < 0.4 ? 3 : G.R() < 0.6 ? 1 : 2; U.ore[j] = o; U.oreN[j] = ORES[o].n + Math.floor(G.R() * 2); }
    }
    void cv;
  }

  // ------------------------------ found: the first one in ------------------------------
  function discover(v, cv) {
    const S = G.S; const f = G.Fac.ofV(v); if (!f) return;
    const first = !cv.found;
    cv.known[f.id] = S.day;
    const set = S.settlements.get(v.set);
    const m = nearestMouth(cv, v.x, v.y);
    if (first) {
      cv.found = { id: v.id, name: v.name, fac: f.id, day: S.day };
      log(`${v.name}, de ${set ? set.name : f.name}, achou uma boca escura na encosta e entrou com uma tocha: era ${C.a(cv)}.`, 'cave', m.x, m.y);
      G.Village.milestone('caverna', 'Uma caverna!', `${v.name} achou ${C.a(cv)}. Toque no botão Subterrâneo (U) para ver o mundo de baixo.`, 'cave');
      bio(v, `Descobriu ${C.a(cv)}.`, `Fui ${v.g === 'f' ? 'a primeira' : 'o primeiro'} a entrar ${C.na(cv)}, com uma tocha na mão`);
    } else log(`${f.name} conheceu ${C.a(cv)}, que outros já sabiam onde ficava.`, 'cave', m.x, m.y);
    // the finder goes in to see how deep it is
    if (v.age >= 14 && !v.captive) { const h = deepHall(cv); const c = spotIn(cv, h); if (c >= 0) C.give(v, 'explore', cv, c, { pri: 1.6, stay: rr(4, 7) }); }
  }
  function findAround(v, cv, t) {
    for (const tr of cv.treasures) {
      if (tr.found) continue;
      if (Math.hypot(tr.x + 0.5 - v.x, tr.y + 0.5 - v.y) < 4.5) { t.kind = 'treasure'; t.tr = tr; t.face = [tr.x + 0.5 - v.x, tr.y + 0.5 - v.y]; v.act = 'dig'; return; }
    }
  }
  const TREASURE = {
    geodo: { name: 'um geodo do tamanho de um homem, cheio de cristais roxos', good: 'joias', n: 4 },
    reliquia: { name: 'uma espada de bronze verde de um povo esquecido', good: 'ouro', n: 2, legend: 1 },
    tesouro: { name: 'um pote de barro cheio de moedas que ninguém sabe cunhar', good: 'ouro', n: 5 },
    idolo: { name: 'um ídolo de ouro com olhos de pedra negra', good: 'ouro', n: 6, legend: 1 },
    ossada: { name: 'a ossada de uma fera gigante, maior que três bois', good: null, n: 0, legend: 1 },
  };
  C.TREASURE = TREASURE;
  function takeTreasure(v, t, cv) {
    const tr = t.tr; if (!tr || tr.found) return;
    const S = G.S; const f = G.Fac.ofV(v); const T0 = TREASURE[tr.kind] || TREASURE.tesouro;
    tr.found = S.day; tr.by = v.name;
    if (T0.good && f) { G.Eco && G.Eco.ensure(f); f.stock[T0.good] = (f.stock[T0.good] || 0) + T0.n; }
    log(`${v.name} achou ${C.na(cv)} ${T0.name}${T0.good ? ' e levou para ' + (f ? f.name : 'o seu povo') : ''}.`, 'star', tr.x, tr.y);
    bio(v, `Achou ${T0.name} ${C.na(cv)}.`, `Achei ${T0.name} no fundo ${C.da(cv)}`);
    if (T0.legend && G.Lore && G.Lore.legend) G.Lore.legend('cave-tr:' + cv.id + ':' + tr.kind, tr.kind === 'ossada' ? `Os Ossos ${C.da(cv)}` : `O Achado ${C.da(cv)}`, `No ano ${S.day}, ${v.name} desceu ${C.a(cv)} com uma tocha e voltou com ${T0.name}. ${tr.kind === 'ossada' ? 'Os velhos dizem que eram os ossos do primeiro dragão.' : 'Ninguém sabe quem o deixou lá.'}`, { kind: 'cave' });
    G.Vg.emote(v, 'joy', 2.5);
  }

  // ------------------------------ paintings on the walls ------------------------------
  const SCENE_OF = { war: 'guerra', battle: 'guerra', siege: 'guerra', army: 'guerra', massacre: 'guerra', general: 'guerra', crown: 'rei', tyrant: 'rei', split: 'rei', naval: 'mar', ship: 'mar', boat: 'mar', wolf: 'fera', deer: 'caca', meteor: 'deus', bolt: 'deus', storm: 'deus', wave: 'deus', mountain: 'deus', prophecy: 'deus', eye: 'deus', star: 'deus', sun: 'deus', rain: 'deus', lore: 'deus', fest: 'festa', heart: 'festa', peace: 'festa', plague: 'morte', sick: 'morte', skull: 'morte', sacrifice: 'morte', campfire: 'povo', settle: 'povo', city: 'povo', era: 'povo', aqueduct: 'povo', wall: 'povo', free: 'correntes', chain: 'correntes' };
  const SCENE_TXT = {
    caca: 'homens com lanças cercam um cervo grande', guerra: 'duas fileiras de guerreiros com lanças, uma contra a outra', rei: 'uma figura alta de coroa, e o povo pequeno a seus pés',
    mar: 'um barco cheio de gente sobre ondas', fera: 'uma fera enorme e gente correndo', deus: 'um sol de muitos raios sobre gente de joelhos', festa: 'gente dançando em roda',
    morte: 'um corpo deitado e gente chorando em volta', povo: 'casas, fogo e gente', correntes: 'gente amarrada numa fila', maos: 'mãos espalmadas, dezenas delas',
  };
  C.SCENE_TXT = SCENE_TXT;
  function paintNow(v, t, cv) {
    const S = G.S; const f = G.Fac.ofV(v); const set = S.settlements.get(v.set);
    // what the people lived lately, told in pictures
    let ev = null;
    // the great things are painted: wars, kings, the god's signs, beasts; not the small news
    const W8 = { guerra: 4, rei: 3, deus: 5, fera: 3, mar: 2, morte: 2, correntes: 3, festa: 1, povo: 1 };
    const recent = S.history.slice(-160).filter(e => SCENE_OF[e.ic] && e.d >= S.day - 8 && !/·|decaiu|terminou|terminaram|foi acesa/i.test(e.txt) && (!f || e.txt.includes(f.name) || (set && e.txt.includes(set.name)) || (e.x !== undefined && set && G.dist(e.x, e.y, set.cx, set.cy) < 30)));
    const old = new Set(cv.paintings.map(p => p.ev));
    const cand = recent.filter(e => !old.has(e.n));
    let tot = 0; for (const e of cand) tot += W8[SCENE_OF[e.ic]] || 1;
    let roll = G.R() * tot; for (const e of cand) { roll -= W8[SCENE_OF[e.ic]] || 1; if (roll <= 0) { ev = e; break; } }
    const scene = ev ? SCENE_OF[ev.ic] : pick(['caca', 'caca', 'maos', 'fera', 'festa', 'deus']);
    const p = { i: t.cell2, w: t.wall, scene, ev: ev ? ev.n : 0, txt: ev ? ev.txt : null, by: v.name, pid: v.id, fac: f ? f.id : 0, civ: f ? f.civ : null, day: S.day, seed: (Math.random() * 1e9) | 0, fade: 0 };
    cv.paintings.push(p); if (cv.paintings.length > 40) cv.paintings.shift();
    const what = ev ? `“${trim(ev.txt.replace(/[.!…]+$/, ''), 110)}”` : SCENE_TXT[scene];
    log(`${v.name} pintou nas paredes ${C.da(cv)} ${ev ? 'o que viu: ' + what : SCENE_TXT[scene]}.`, 'paint', (p.i % N), (p.i / N) | 0);
    bio(v, `Pintou ${C.na(cv)}: ${ev ? what : SCENE_TXT[scene]}.`, `Pintei ${C.na(cv)} ${ev ? what : SCENE_TXT[scene]}, para ninguém esquecer`);
    if (cv.paintings.length === 1 && G.Lore && G.Lore.legend) G.Lore.legend('cave-paint:' + cv.id, `As Pinturas ${C.da(cv)}`, `No ano ${S.day}, ${v.name} levou ocre e carvão ${C.a(cv).startsWith('o') ? 'ao ' : 'à '}${cv.name} e pintou nas paredes ${what}. Desde então o povo volta lá para contar a sua história à luz das tochas.`, { kind: 'cave' });
  }
  const trim = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  // the elders tell what is painted on the walls
  C.talesFor = function (set) {
    const out = [];
    for (const cv of C.all()) {
      if (!cv.known[set.fac]) continue;
      for (const p of cv.paintings) if (p.fac === set.fac && G.S.day - p.day >= 1) out.push({ w: 2.5, txt: `Nas paredes ${C.da(cv)} está pintado: ${p.txt ? trim(p.txt, 120) : SCENE_TXT[p.scene]}. Foi ${p.by} quem pintou.`, mood: 'awe', d: p.day });
      for (const tb of cv.tombs) if (tb.fac === set.fac) out.push({ w: 2, txt: `${tb.name} dorme ${C.na(cv)}, com ${tb.goods}.${tb.robbed ? ' Mas ladrões roubaram o túmulo.' : ''}`, mood: tb.robbed ? 'sad' : 'awe', d: tb.day });
      if (cv.oracle && cv.oracle.fac === set.fac) for (const q of cv.oracle.said.slice(-3)) if (q.st === 'cumprida') out.push({ w: 3, txt: `O oráculo ${C.da(cv)} disse: “${q.text}” — e assim foi.`, mood: 'awe', d: q.day });
    }
    return out;
  };

  // ------------------------------ the oracle ------------------------------
  const PROPH = {
    guerra: { pre: f => !G.Fac.enemiesOf(f.id).length && G.Fac.all().length > 1, text: f => `Antes que três invernos passem, o ferro e o fogo virão sobre ${f.name}.`, test: f => G.Fac.enemiesOf(f.id).length > 0 },
    paz: { pre: f => G.Fac.enemiesOf(f.id).length > 0, text: () => 'A guerra vai cansar, e as lanças vão dormir antes do terceiro inverno.', test: f => !G.Fac.enemiesOf(f.id).length },
    coroa: { pre: f => { const r = f.leader && G.S.villagers.get(f.leader); return !!r && (r.age > 48 || G.Fac.enemiesOf(f.id).length > 0); }, text: () => 'Uma coroa vai cair, e outra cabeça vai carregá-la.', test: (f, q) => f.leader !== q.leader },
    fome: { pre: f => f.stock.food < G.Fac.pop(f.id) * 3, text: () => 'Os celeiros vão chorar e as crianças vão pedir pão.', test: f => f.stock.food < G.Fac.pop(f.id) * 0.6 },
    fartura: { pre: f => f.stock.food > G.Fac.pop(f.id) * 2, text: () => 'Vêm anos de mesa farta: os celeiros não vão caber o que a terra der.', test: f => f.stock.food > G.Fac.pop(f.id) * 5 },
    ceu: { pre: () => true, text: () => 'O céu vai se abrir sobre nós, e a mão do deus vai descer.', test: (f, q) => (G.S.stats.faithSpent || 0) > (q.spent || 0) + 25 },
    cidade: { pre: f => G.Fac.settlementsOf(f.id).length < 6, text: () => 'Os filhos dos nossos filhos vão acender um fogo novo, longe daqui.', test: (f, q) => G.Fac.settlementsOf(f.id).length > (q.sets || 0) },
  };
  function prophesy(cv) {
    const S = G.S; const o = cv.oracle; const f = G.Fac.get(o.fac); if (!f || !f.alive) return;
    if (o.said.some(q => q.st === 'aberta')) return;
    const kinds = Object.keys(PROPH).filter(k => PROPH[k].pre(f) && !o.said.slice(-3).some(q => q.k === k)); if (!kinds.length) return;
    const k = pick(kinds); const P = PROPH[k];
    const q = { k, text: P.text(f), day: S.day, until: S.day + 3, st: 'aberta', leader: f.leader, spent: S.stats.faithSpent || 0, sets: G.Fac.settlementsOf(f.id).length };
    o.said.push(q); if (o.said.length > 30) o.said.shift();
    const m = cv.mouths[0];
    log(`O oráculo ${C.da(cv)}, ${o.name}, falou entre a fumaça: “${q.text}”`, 'prophecy', m ? m.x : cv.cx, m ? m.y : cv.cy);
  }
  function judge(cv) {
    const S = G.S; const o = cv.oracle; const f = G.Fac.get(o.fac);
    for (const q of o.said) {
      if (q.st !== 'aberta') continue;
      if (f && f.alive && PROPH[q.k].test(f, q)) {
        q.st = 'cumprida'; q.doneD = S.day; o.cred = Math.min(100, (o.cred || 50) + 15);
        log(`Cumpriu-se o que o oráculo ${C.da(cv)} disse: “${q.text}” O povo de ${f.name} sobe a montanha em procissão.`, 'prophecy');
        for (const v of S.villagers.values()) if (G.Fac.idOfV(v) === f.id) v.devotion = Math.min(100, (v.devotion || 0) + 4);
        S.faith = Math.min(999, S.faith + 6);
        G.Lore && G.Lore.legend && G.Lore.legend('oracle:' + cv.id, `O Oráculo ${C.da(cv)}`, `No ano ${q.day}, ${o.name} falou ${C.na(cv)}: “${q.text}” No ano ${S.day}, aconteceu. Desde então os peregrinos sobem a encosta com oferendas.`, { kind: 'cave' });
      } else if (S.day > q.until) {
        q.st = 'falhou'; o.cred = Math.max(0, (o.cred || 50) - 20);
        log(`O que o oráculo ${C.da(cv)} anunciou não aconteceu. Há quem diga que a voz da gruta mente.`, 'prophecy');
      }
    }
  }
  function ensureOracle(cv) {
    const S = G.S; const o = cv.oracle; if (!o) return;
    const v = S.villagers.get(o.id);
    if (!v || v.captive || G.Fac.idOfV(v) !== o.fac) {
      log(`${o.name}, a voz ${C.da(cv)}, ${v ? 'foi levada' : 'morreu'}. O oráculo se calou.`, 'prophecy', cv.cx, cv.cy);
      cv.oraclePast = (o.past || []).concat([{ name: o.name, from: o.day, to: S.day }]); cv.oracle = null;
    }
  }
  function newOracle(cv, set) {
    const S = G.S; let best = null, bs = -1;
    for (const v of S.villagers.values()) {
      if (v.set !== set.id || v.age < 18 || v.captive || v.ug) continue;
      const s = (v.role === 'sacerdote' ? 50 : 0) + (v.g === 'f' ? 25 : 0) + (v.devotion || 0) * 0.4 + (v.age > 40 ? 10 : 0);
      if (s > bs) { bs = s; best = v; }
    }
    if (!best || bs < 30) return;
    cv.oracle = { fac: set.fac, id: best.id, name: best.name, g: best.g, day: S.day, said: [], cred: 50, here: 0, past: cv.oraclePast || [] };
    log(`${best.name} começou a ouvir vozes ${C.na(cv)}. Agora é o oráculo de ${G.Fac.get(set.fac).name}: os peregrinos sobem com oferendas para saber o futuro.`, 'prophecy', cv.cx, cv.cy);
    bio(best, `Tornou-se o oráculo ${C.da(cv)}.`, `Ouvi as vozes ${C.da(cv)} e falei o que diziam`);
    best.devotion = Math.min(100, (best.devotion || 0) + 20);
  }

  // ------------------------------ royal tombs ------------------------------
  const GOODS = {
    egipcio: 'um sarcófago pintado e uma máscara de ouro', grego: 'uma urna de bronze e uma coroa de louros', romano: 'um sarcófago de mármore entalhado',
    nordico: 'um barco de pedra e a sua espada', asteca: 'uma máscara de jade e oferendas de cacau', classico: 'ossos pintados de ocre, colares e as suas ferramentas',
  };
  C.GOODS = GOODS;
  function onRulerDeath(v, f, cause) {
    const S = G.S; const cap = G.Fac.capitalOf(f.id); if (!cap) return;
    const cv = caveFor(cap, 34); if (!cv) return;
    const h = deepHall(cv);
    const c = spotIn(cv, h, i => cv.tombs.some(t => Math.abs((t.i % N) - (i % N)) + Math.abs(((t.i / N) | 0) - ((i / N) | 0)) < 2) || (cv.oracle && cv.oracle.cell === i)); if (c < 0) return;
    G.Eco && G.Eco.ensure(f);
    const gold = Math.min(Math.floor(f.stock.ouro || 0), 4) + Math.min(Math.floor(f.stock.joias || 0), 2);
    if (gold) { const g1 = Math.min(Math.floor(f.stock.ouro || 0), 4); f.stock.ouro -= g1; f.stock.joias = Math.max(0, (f.stock.joias || 0) - (gold - g1)); }
    const styled = G.Politics && G.Politics.styled ? G.Politics.styled(f, v) : v.name;
    const tb = { i: c, id: v.id, name: styled, plain: v.name, g: v.g, fac: f.id, civ: f.civ || 'classico', day: S.day, goods: GOODS[f.civ] || GOODS.classico, gold, robbed: 0, cause };
    cv.tombs.push(tb);
    log(`${styled} foi sepultad${oa(v)} ${C.na(cv)}, com ${tb.goods}${gold ? ' e ' + gold + ' peças de ouro' : ''}. O cortejo desceu com tochas.`, 'crown', c % N, (c / N) | 0);
    if (cv.tombs.length === 1) G.Lore && G.Lore.legend && G.Lore.legend('tomb:' + cv.id, `O Túmulo dos Reis ${C.da(cv)}`, `No ano ${S.day}, ${f.name} levou ${styled} para dormir no fundo ${C.da(cv)}, com ${tb.goods}. Desde então, ${C.a(cv)} guarda os seus governantes.`, { kind: 'cave' });
    // the procession: family and priests
    const kin = new Set([v.partner, v.mother, v.father].filter(Boolean)); const list = [];
    for (const o of S.villagers.values()) { if (list.length >= 6) break; if (o.captive || o.age < 10 || o.ug || G.Fac.idOfV(o) !== f.id) continue; if (kin.has(o.id) || o.mother === v.id || o.father === v.id || (o.role === 'sacerdote' && G.dist(o.x, o.y, cap.cx, cap.cy) < 20)) list.push(o); }
    for (const o of list) { const s = spotIn(cv, h); if (s >= 0) C.give(o, 'tomb', cv, s, { pri: 1.7, stay: rr(10, 15) }); }
  }

  // ------------------------------ outlaws ------------------------------
  const BAND = ['Os Lobos {d}', 'Os Corvos {d}', 'A Irmandade {d}', 'Os Sem-Rei', 'Os Filhos da Noite', 'Os Ratos {d}', 'Os Mascarados {d}'];
  const EPI = [['o Caolho', 'a Caolha'], ['Mão-Leve', 'Mão-Leve'], ['o Ruivo', 'a Ruiva'], ['Dente-de-Lobo', 'Dente-de-Lobo'], ['a Raposa', 'a Raposa'], ['o Sem-Nome', 'a Sem-Nome'], ['Faca-Fina', 'Faca-Fina'], ['o Manco', 'a Manca']];
  function formBand() {
    const S = G.S;
    const caves = C.all().filter(cv => cv.mouths.length && !cv.bandits && !cv.oracle);
    const opts = [];
    for (const cv of caves) {
      const m = cv.mouths[0]; let nd = 1e9, near = null;
      for (const s of S.settlements.values()) { const d = G.dist(s.cx, s.cy, m.x, m.y); if (d < nd) { nd = d; near = s; } }
      if (near && nd > 9 && nd < 42) opts.push([cv, near]);
    }
    if (!opts.length) return;
    const [cv, near] = pick(opts);
    const civ = (G.Fac.get(near.fac) || {}).civ || null; const g = G.R() < 0.25 ? 'f' : 'm';
    const leader = (G.Civ.personName(civ, g, new Set()) || 'Sem-Nome') + ', ' + pick(EPI)[g === 'f' ? 1 : 0];
    const name = pick(BAND).replace('{d}', C.da(cv));
    const h = cv.halls.slice().sort((a, b) => b.r - a.r)[0];
    cv.bandits = { name, leader, g, n: 3 + Math.floor(G.R() * 3), loot: { food: 0, ouro: 0, tecido: 0, moedas: 0 }, day: S.day, raids: 0, camp: spotIn(cv, h), night: -1, victims: {} };
    const m = cv.mouths[0];
    log(`Um bando de foras-da-lei, ${name}, fez ${C.da(cv)} o seu esconderijo. Quem manda é ${leader}.`, 'skull', m.x, m.y);
  }
  // a night raid: they walk out, steal, and walk back with the loot
  C.actors = [];
  function raid(cv) {
    const S = G.S; const b = cv.bandits; const m = cv.mouths[0]; if (!m) return;
    let tgt = null, bd = 44 * 44;
    for (const s of S.settlements.values()) { const d = G.dist2(s.cx, s.cy, m.x, m.y); if (d < bd && W.sameLand(s.cx, s.cy, m.x, m.y)) { bd = d; tgt = s; } }
    if (!tgt) return;
    const p = W.findPath(m.x + 0.5, m.y + 0.5, tgt.cx, tgt.cy, true, 6000); if (!p) return;
    const k = Math.min(b.n, 3);
    for (let q = 0; q < k; q++) C.actors.push({ kind: 'bandit', cave: cv.id, set: tgt.id, path: p, pi: 0, x: m.x + 0.5 + rr(-0.3, 0.3), y: m.y + 0.5 + rr(-0.3, 0.3), st: 0, lead: q === 0, look: look(q + cv.id * 7), delay: q * 0.7, ox: rr(-0.4, 0.4), oy: rr(-0.4, 0.4) });
    b.night = S.day;
  }
  function look(k) {
    const SK = ['#c99a74', '#a8784e', '#7a5232', '#e0b894'], HA = ['#2a1e16', '#4a3020', '#6a4a2a', '#1a1a1a'];
    return { id: 9e6 + k, age: 30, g: 'm', skin: SK[k % 4], hair: HA[(k * 3) % 4], role: 'cacador', _cloth: '#3b3530', traits: [], face: 1, walkPh: 0, act: '', actT: 0, moving: true, kidCloth: '#555' };
  }
  function moveActors(dt) {
    const S = G.S;
    for (let k = C.actors.length - 1; k >= 0; k--) {
      const a = C.actors[k]; const cv = C.get(a.cave);
      if (!cv || !cv.bandits) { C.actors.splice(k, 1); continue; }
      if (a.delay > 0) { a.delay -= dt; continue; }
      const p = a.path[a.pi]; if (!p) { a.st++; if (a.st === 1) { strike(cv, a); a.path = a.path.slice().reverse(); a.pi = 0; continue; } C.actors.splice(k, 1); continue; }
      const tx = p[0] + a.ox * 0.5, ty = p[1] + a.oy * 0.5; const dx = tx - a.x, dy = ty - a.y; const d = Math.hypot(dx, dy); const step = 1.15 * dt;
      if (d <= step) { a.x = tx; a.y = ty; a.pi++; } else { a.x += dx / d * step; a.y += dy / d * step; }
      a.look.moving = true; a.look.walkPh += step * 8.5; G.faceTo(a.look, dx, dy); a.look.act = 'sneak';
      if (S.time > 0.12 && S.time < 0.6 && a.st === 0) { a.path = a.path.slice(0, a.pi + 1).reverse(); a.pi = 0; a.st = 1; }
    }
  }
  function strike(cv, a) {
    if (!a.lead) return;
    const S = G.S; const b = cv.bandits; const set = S.settlements.get(a.set); if (!set) return;
    const f = G.Fac.get(set.fac); if (!f) return;
    let guards = 0; for (const v of S.villagers.values()) if (v.set === set.id && v.role === 'guerreiro' && !v.captive && G.dist(v.x, v.y, set.cx, set.cy) < 14) guards++;
    const tower = [...S.buildings.values()].some(o => o.type === 'torre' && o.built && o.set === set.id);
    const repel = G.R() < Math.min(0.85, guards * 0.12 + (tower ? 0.3 : 0));
    if (repel) {
      const dead = G.R() < 0.5; if (dead) b.n--;
      log(`A guarda de ${set.name} pegou ${b.name} roubando à noite${dead ? ' e matou um deles' : ' e os pôs para correr'}.`, 'skull', set.cx, set.cy);
      if (b.n <= 0) breakBand(cv, `${b.name} acabaram: o último morreu nas ruas de ${set.name}.`);
      return;
    }
    G.Eco && G.Eco.ensure(f);
    const take = (k, frac, cap) => { const n = Math.min(cap, Math.floor((f.stock[k] || 0) * frac)); if (n > 0) { f.stock[k] -= n; b.loot[k] = (b.loot[k] || 0) + n; } return n; };
    const fo = take('food', 0.08, 14), go = take('ouro', 0.3, 3), te = take('tecido', 0.3, 3), mo = take('moedas', 0.15, 10);
    const what = [fo && fo + ' de comida', go && go + ' de ouro', te && te + ' de tecido', mo && mo + ' moedas'].filter(Boolean);
    b.raids++; b.victims[f.id] = (b.victims[f.id] || 0) + 1;
    log(`${b.name} assaltaram ${set.name} na calada da noite${what.length ? ' e levaram ' + what.join(', ') : ''}. As pegadas voltam para ${C.a(cv)}.`, 'skull', set.cx, set.cy);
    if (!cv.known[f.id]) cv.known[f.id] = S.day; // the tracks lead there
  }
  function breakBand(cv, txt) {
    const m = cv.mouths[0];
    log(txt, 'skull', m ? m.x : cv.cx, m ? m.y : cv.cy);
    cv.pastBands = (cv.pastBands || []).concat([{ name: cv.bandits.name, leader: cv.bandits.leader, from: cv.bandits.day, to: G.S.day }]);
    cv.bandits = null; C.actors = C.actors.filter(a => a.cave !== cv.id);
  }
  // a people sends its warriors to clean the den
  function sendRaid(cv, fid) {
    const S = G.S; const b = cv.bandits; if (!b || b.hunt) return;
    const m = cv.mouths[0]; const list = [];
    for (const v of S.villagers.values()) { if (list.length >= 6) break; if (v.role !== 'guerreiro' || v.captive || v.ug || G.Fac.idOfV(v) !== fid || G.dist(v.x, v.y, m.x, m.y) > 40) continue; if (v.task && v.task.pri >= 2) continue; list.push(v); }
    if (list.length < 3) return;
    b.hunt = { fac: fid, ids: list.map(v => v.id), t: 0, day: S.day };
    for (const v of list) { const s = spotIn(cv, cv.halls.find(h => Math.hypot(h.x - (b.camp % N), h.y - ((b.camp / N) | 0)) < h.r + 2) || cv.halls[0]); C.give(v, 'raid', cv, s >= 0 ? s : b.camp, { pri: 3.1, stay: 40, force: 1 }); }
    log(`${G.Fac.get(fid).name} mandou ${list.length} guerreiros acabar com ${b.name} ${C.na(cv)}.`, 'war', m.x, m.y);
  }
  function fightBandits(v, t, cv, dt) {
    const b = cv.bandits; if (!b || !b.hunt) { t.done = true; return; }
    b.hunt.t += dt / Math.max(1, b.hunt.ids.length);
    if (b.hunt.t < 6) return;
    const S = G.S; const here = b.hunt.ids.map(id => S.villagers.get(id)).filter(o => o && o.ug === cv.id && o.task && o.task.st === 3);
    const pow = here.reduce((a, o) => a + 1 + (o.kills || 0) * 0.05, 0), bp = b.n * 0.9 + 0.6;
    const win = G.R() < pow / (pow + bp);
    const fallen = []; for (const o of here) if (G.R() < (win ? 0.12 : 0.35)) fallen.push(o);
    const f = G.Fac.get(b.hunt.fac);
    if (win) {
      const lt = b.loot; if (f) { G.Eco && G.Eco.ensure(f); for (const k in lt) f.stock[k] = (f.stock[k] || 0) + lt[k]; }
      const got = Object.entries(lt).filter(([, n]) => n > 0).map(([k, n]) => n + ' de ' + (G.Eco ? G.Eco.name(k) : k)).join(', ');
      breakBand(cv, `Os guerreiros de ${f ? f.name : '?'} entraram ${C.na(cv)} com tochas e acabaram com ${b.name}. ${b.leader} caiu.${got ? ' Recuperaram ' + got + '.' : ''}`);
      for (const o of here) { o.kills = (o.kills || 0) + 1; bio(o, `Entrou ${C.na(cv)} e acabou com os bandidos.`, `Entrei ${C.na(cv)} com uma tocha e acabei com os bandidos`); }
    } else {
      b.hunt = null; b.n = Math.max(1, b.n - (G.R() < 0.5 ? 1 : 0));
      log(`${b.name} emboscaram os guerreiros de ${f ? f.name : '?'} no escuro ${C.da(cv)}. Os que sobraram fugiram.`, 'skull', cv.cx, cv.cy);
    }
    for (const o of fallen) { o.lastCause = 'war'; G.Village.kill(o, 'war'); }
    for (const o of here) if (o.task && o.task.type === 'caverna') o.task.done = true;
  }

  // ------------------------------ bats & bears ------------------------------
  // the bats leave at dusk in a black ribbon and come back before dawn
  C.batPhase = function (cv) {
    if (!cv.bats || !cv.mouths.length) return null;
    const t = G.S.time;
    if (t > 0.6 && t < 0.71) return { out: 1, k: (t - 0.6) / 0.11 };
    if (t > 0.03 && t < 0.11) return { out: 0, k: (t - 0.03) / 0.08 };
    if (t >= 0.71 || t <= 0.03) return { night: 1 };
    return null;
  };
  function bears() {
    const S = G.S; const t = S.time;
    const evening = t > 0.66 && t < 0.72, morning = t > 0.12 && t < 0.2;
    if (evening) for (const a of [...S.animals.values()]) {
      if (a.kind !== 'bear' || a.dead || a.tamed || a.legend || a.held || a.summoned || a.raid || a._denDay === S.day) continue;
      a._denDay = S.day;
      let best = null, bd = 18 * 18;
      for (const cv of C.all()) { if (!cv.den || !cv.mouths.length || cv.bandits || cv.sleepers.length >= 3) continue; const m = cv.mouths[0]; const d = G.dist2(a.x, a.y, m.x, m.y); if (d < bd) { bd = d; best = cv; } }
      if (!best) continue;
      const m = best.mouths[0]; const h = best.halls[best.halls.length - 1]; const c = spotIn(best, h);
      S.animals.delete(a.id); a.sx = c % N + 0.5; a.sy = ((c / N) | 0) + 0.5; best.sleepers.push(a);
      void m;
    }
    if (morning) for (const cv of C.all()) {
      if (!cv.sleepers.length) continue;
      const m = cv.mouths[0];
      for (const a of cv.sleepers) {
        if (!m) continue;
        a.x = m.x + 0.5; a.y = m.y + 0.5; a.state = 'idle'; a.t = 1; a.hunger = Math.min(0.9, (a.hunger || 0) + 0.15); S.animals.set(a.id, a);
        if (a.grown >= 1 && G.R() < 0.18 && G.Animals.counts().bear < G.Animals.capacity('bear') + 2) {
          const cub = G.Animals.spawn('bear', a.x + 0.4, a.y + 0.3, { grown: 0.1, age: 0 });
          if (cub && G.R() < 0.4) log(`Uma ursa saiu ${C.da(cv)} com um filhote que nasceu no escuro.`, 'wolf', m.x, m.y);
        }
      }
      cv.sleepers = [];
    }
  }

  // ------------------------------ the creatures of the dark ------------------------------
  function beasts(dt) {
    const U = C.U();
    for (const b of U.beasts) {
      b.t -= dt;
      if (b.t > 0) { if (b.tx) { const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy); const sp = b.kind === 'grilo' ? 1.4 : b.kind === 'peixe' ? 0.5 : b.kind === 'aranha' ? 0.6 : 0.18; if (d < 0.03) b.tx = 0; else { const s = Math.min(d, sp * dt); b.x += dx / d * s; b.y += dy / d * s; b.face = dx - dy > 0 ? 1 : -1; b.moving = 1; } } else b.moving = 0; continue; }
      b.t = b.kind === 'salamandra' ? rr(3, 9) : b.kind === 'grilo' ? rr(0.6, 2.5) : rr(1.5, 5);
      const x = b.x | 0, y = b.y | 0; const r = b.kind === 'grilo' ? 1 : 2;
      const nx = x + Math.round(rr(-r, r)), ny = y + Math.round(rr(-r, r)); if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const k = U.k[ny * N + nx]; if (U.id[ny * N + nx] !== b.cave) continue;
      const water = k === LAKE || k === STREAM;
      if (b.kind === 'peixe' ? !water : !(C.walk(k) || (b.kind === 'salamandra' && k === STREAM))) continue;
      b.tx = nx + rr(0.2, 0.8); b.ty = ny + rr(0.2, 0.8);
    }
  }

  // ------------------------------ every tick ------------------------------
  let tSec = 0, tPlan = 0, lastDay = -1, tRefuge = 0, tShelter = 0;
  // a storm drives the wild animals into the caves: deer and a wolf under the same roof, and nobody bites
  function shelter() {
    const S = G.S; const W8 = S.weather || {}; const storm = W8.storm > 0 && W8.rain > 0.3;
    for (const cv of C.all()) {
      if (!cv.sheltered) cv.sheltered = [];
      const m = cv.mouths[0]; if (!m) continue;
      const mx = m.x + 0.5, my = m.y + 0.5;
      if (!storm) {
        if (cv.sheltered.length) { for (const a of cv.sheltered) { a.x = mx + rr(-0.4, 0.4); a.y = my + rr(-0.4, 0.4); a.state = 'idle'; a.t = 1; a.shelter = 0; S.animals.set(a.id, a); } cv.sheltered = []; }
        continue;
      }
      let heading = 0;
      for (const a of S.animals.values()) {
        if (a.shelter !== cv.id) continue;
        if (a.dead || a.held) { a.shelter = 0; continue; }
        if (G.dist(a.x, a.y, mx, my) < 1) {
          // in, out of the rain: a spot just inside the door
          S.animals.delete(a.id); const c = innerCell(cv, m); a.sx = (c % N) + 0.25 + G.R() * 0.5; a.sy = ((c / N) | 0) + 0.25 + G.R() * 0.5; a.moving = false; cv.sheltered.push(a);
        } else { heading++; if (a.state !== 'flee' && a.state !== 'chase') { a.tx = mx; a.ty = my; a.state = 'wander'; a.seek = true; } }
      }
      if (cv.sheltered.length >= 2 && cv.shelterLog !== S.day) {
        cv.shelterLog = S.day;
        const kinds = {}; for (const a of cv.sheltered) kinds[a.kind] = (kinds[a.kind] || 0) + 1;
        const D = G.Animals.DEF; const ks = Object.keys(kinds);
        const pred = ks.find(k => D[k].diet === 'carn'), prey = ks.find(k => D[k].diet !== 'carn');
        const nm = k => kinds[k] > 1 ? `${kinds[k]} ${C.plural(D[k].name.toLowerCase())}` : D[k].nameA;
        if (cv.known && Object.keys(cv.known).length && G.R() < 0.7) log(pred && prey ? `A tempestade empurrou para dentro ${C.da(cv)} ${nm(pred)} e ${nm(prey)}. Esperam a chuva passar lado a lado — e ninguém ataca ninguém.` : `Fugindo da tempestade, ${ks.map(nm).join(' e ')} se abrigaram ${C.na(cv)}.`, 'deer', mx, my);
      }
      if (cv.sheltered.length + heading >= 5) continue;
      for (const a of S.animals.values()) {
        if (cv.sheltered.length + heading >= 5) break;
        if (a.shelter || a.dom || a.tamed || a.summoned || a.legend || a.raid || a.held || a.dead || a.pen) continue;
        const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls !== 'land' || sp.size < 0.75 || sp.size > 1.2) continue;
        if (G.dist2(a.x, a.y, mx, my) > 144 || G.R() < 0.5) continue;
        a.shelter = cv.id; heading++;
      }
    }
  }
  // "boi-almiscarado" → "bois-almiscarados", "leão" → "leões", "chacal" → "chacais"
  C.plural = w => w.split('-').map(p => (/^(de|do|da)$/.test(p) ? p : /ão$/.test(p) ? p.replace(/ão$/, 'ões') : /[aeou]l$/.test(p) ? p.replace(/l$/, 'is') : /[rz]$/.test(p) ? p + 'es' : /m$/.test(p) ? p.replace(/m$/, 'ns') : /s$/.test(p) ? p : p + 's')).join('-');
  function innerCell(cv, m) {
    const U = C.U(); const i0 = m.y * N + m.x; let best = i0, bd = 1e9;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = m.x + dx, y = m.y + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (U.id[i] !== cv.id || !C.walk(U.k[i]) || U.k[i] === MOUTH) continue; const d = dx * dx + dy * dy + G.R() * 2; if (d < bd) { bd = d; best = i; } }
    return best;
  }
  // the children dare each other to shout into the dark — and run when it answers
  const DARE = ['Ôôô!', 'Ei!', 'Uuuh!', 'Olá!', 'Quem tá aí?', 'Ahhh!'];
  C.dares = dares;
  function dares() {
    const S = G.S;
    for (const set of S.settlements.values()) {
      if (G.R() > 0.3 || (set.alarmT || 0) > 0) continue;
      let cv = null, bd = 18 * 18, m = null;
      for (const c of C.all()) { if (!c.known[set.fac]) continue; for (const mm of c.mouths) { const d = G.dist2(mm.x, mm.y, set.cx, set.cy); if (d < bd) { bd = d; cv = c; m = mm; } } }
      if (!cv) continue;
      const kids = []; for (const v of S.villagers.values()) if (v.set === set.id && v.age >= 5 && v.age < 15 && !v.ug && !v.inside && !v.captive && (!v.task || v.task.pri < 1.2)) kids.push(v);
      if (!kids.length) continue;
      const n = Math.min(kids.length, 2 + Math.floor(G.R() * 2)); const went = [];
      for (let k = 0; k < n; k++) { const v = kids.splice(Math.floor(G.R() * kids.length), 1)[0]; if (C.give(v, 'dare', cv, -1, { torch: 0, pri: 1.15, word: pick(DARE), force: 1 })) went.push(v); }
      if (went.length && !cv.dared) {
        cv.dared = S.day; const v = went[0];
        log(went.length > 1 ? `As crianças de ${set.name} desafiam umas às outras a gritar na boca ${C.da(cv)}. O eco responde lá de dentro — e todo mundo sai correndo, rindo.` : `${v.name}, de ${set.name}, foi sozinh${oa(v)} até a boca ${C.da(cv)} gritar no escuro. O eco respondeu — e ${v.g === 'f' ? 'ela' : 'ele'} voltou correndo.`, 'pop', m.x, m.y);
        for (const k of went) bio(k, `Gritou na boca ${C.da(cv)} e ouviu o eco responder.`, `Gritei na boca ${C.da(cv)} e o escuro respondeu.`);
      }
    }
  }
  C.update = function (dt) {
    const S = G.S; const U = S.ug; if (!U) return;
    if (!U.near) C.rebuildNear();
    tSec += dt; tPlan += dt; tRefuge += dt;
    if (C.actors.length) moveActors(dt);
    if (G.Render && G.Render.under) beasts(dt);
    for (const cv of U.caves) { const ph = cv.bats && C.batPhase(cv); if (ph && ph.night) cv.guano = Math.min(80, cv.guano + cv.bats * dt / DAY() * 0.035); }
    if (tSec >= 1) {
      tSec = 0;
      // whoever is underground without an errand there comes out
      for (const id of [...C.inside]) {
        const v = S.villagers.get(id); if (!v) { C.inside.delete(id); continue; }
        if (v.age < 2) { const c = S.villagers.get(v.carrier); if (!c || !c.ug) exit(v); continue; }
        if (!v.task || v.task.type !== 'caverna') exit(v);
      }
      for (const v of S.villagers.values()) {
        if (v.ug && !C.inside.has(v.id)) { if (v.task && v.task.type === 'caverna') C.inside.add(v.id); else exit(v); }
        if (v.ug || v.inside || v.captive || v.age < 10) continue;
        const cid = U.near[W.idx(v.x, v.y)]; if (!cid) continue;
        const cv = C.get(cid); const fid = G.Fac.idOfV(v); if (cv && fid && !cv.known[fid]) discover(v, cv);
      }
      bears();
      if ((tShelter += 1) >= 2) { tShelter = 0; shelter(); }
    }
    if (tRefuge >= 1.5) { tRefuge = 0; refuge(); }
    if (S.day !== lastDay) { lastDay = S.day; daily(); }
    if (tPlan >= DAY() / 12) { tPlan = 0; plan(); }
    // a raid each night for a band that is hungry for it
    if (S.time > 0.76 && S.time < 0.8) for (const cv of U.caves) { const b = cv.bandits; if (b && b.night !== S.day && G.R() < 0.6 && !C.actors.some(a => a.cave === cv.id)) raid(cv); else if (b && b.night !== S.day) b.night = S.day; }
    // the oracle speaks at noon, if she is in her cave
    if (S.time > 0.45 && S.time < 0.5) for (const cv of U.caves) { const o = cv.oracle; if (o && o.here && o.spoke !== S.day) { o.spoke = S.day; if (G.R() < 0.45) prophesy(cv); } }
  };
  // once a day: the slow things
  function daily() {
    const S = G.S;
    dares();
    for (const cv of C.all()) {
      if (cv.oracle) { ensureOracle(cv); if (cv.oracle) judge(cv); }
      const b = cv.bandits;
      if (b) {
        // the outlaws plunder the tombs of kings
        const tb = cv.tombs.find(t => !t.robbed && t.gold > 0);
        if (tb && G.R() < 0.35) { tb.robbed = S.day; b.loot.ouro = (b.loot.ouro || 0) + tb.gold; log(`${b.name} saquearam o túmulo de ${tb.name} ${C.na(cv)}.`, 'skull', tb.i % N, (tb.i / N) | 0); }
        // the most robbed people goes after them
        for (const fid in b.victims) if (b.victims[fid] >= 2 && G.R() < 0.5) { sendRaid(cv, +fid); break; }
        if (b.hunt && S.day - b.hunt.day > 2) { const f = G.Fac.get(b.hunt.fac); b.hunt = null; log(`Os guerreiros${f ? ' de ' + f.name : ''} voltaram sem achar ${b.name}: o escuro ${C.da(cv)} os protege.`, 'skull', cv.cx, cv.cy); }
        if (b.n < 6 && G.R() < 0.15) b.n++;
      }
    }
    const nBands = C.all().filter(c => c.bandits).length;
    if (S.day >= 5 && nBands < Math.max(1, Math.floor(C.all().length / 3)) && G.R() < 0.14) formBand();
  }
  // a few times a day: the people's errands
  function plan() {
    const S = G.S; if (G.Skip && G.Skip.on && G.R() < 0.5) return;
    const night = G.isNight() || S.time > 0.62 || S.time < 0.08;
    for (const set of S.settlements.values()) {
      const pop = G.Village.pop(set.id); if (pop < 5) continue;
      const cv = caveFor(set, 28); if (!cv) continue;
      const f = G.Fac.get(set.fac); if (!f) continue;
      if (night) continue;
      const people = [];
      for (const v of S.villagers.values()) if (v.set === set.id && !v.captive && !v.ug && !v.inside && !v.sleeping && v.age >= 12 && (!v.task || v.task.pri < 1.2) && v.hunger < 70) people.push(v);
      if (!people.length) continue;
      const one = test => { const l = people.filter(test); return l.length ? l[Math.floor(G.R() * l.length)] : null; };
      // painters: young and old, the ones with time on their hands
      if (G.R() < 0.14 && cv.paintings.filter(p => p.fac === f.id && S.day - p.day < 2).length < 2) {
        const v = one(o => o.role !== 'guerreiro' && (o.age < 20 || o.age > 50 || o.traits.includes('Criativo') || o.role === 'anciao' || o.role === 'oleiro'));
        if (v) { const w = wallSpot(cv); if (w) C.give(v, 'paint', cv, w.i, { cell2: w.i, wall: w.w, stay: rr(10, 16) }); }
      }
      // guano for the fields
      if (cv.guano >= 3 && G.R() < 0.4 && [...S.buildings.values()].some(b => b.type === 'farm' && b.set === set.id)) {
        const v = one(o => o.role !== 'guerreiro' && o.age >= 16); const r = cv.roost;
        if (v && r) { const c = spotIn(cv, { x: r.x, y: r.y, r: r.r }); if (c >= 0) C.give(v, 'guano', cv, c, { stay: 6 }); }
      }
      // miners to the veins (bronze for copper and tin, iron for iron)
      if (G.R() < 0.35) {
        const vein = veinFor(cv, f); if (vein >= 0) { const v = one(o => o.role === 'mineiro' || (o.role !== 'guerreiro' && o.age >= 16 && o.age < 50 && G.R() < 0.3)); const c = standBy(cv, vein); if (v && c >= 0) C.give(v, 'mine', cv, c, { vein, stay: 12, pri: 1.25 }); }
      }
      // pilgrims to the oracle
      if (cv.oracle && (cv.oracle.fac === f.id || G.Fac.rel(cv.oracle.fac, f.id) && G.Fac.rel(cv.oracle.fac, f.id).st !== 'guerra') && cv.oracle.here && G.R() < 0.3 + (cv.oracle.cred || 50) / 200) {
        const v = one(o => o.age >= 16); const c = spotIn(cv, nearHall(cv, cv.oracle.cell));
        if (v && c >= 0) C.give(v, 'pilgrim', cv, c, { stay: rr(6, 10), pri: 1.3 });
      }
      // the oracle goes up every morning
      if (cv.oracle && cv.oracle.fac === f.id && !cv.oracle.here && S.time < 0.5) {
        const o = S.villagers.get(cv.oracle.id);
        if (o && !o.ug && o.set === set.id && (!o.task || o.task.type !== 'caverna')) {
          if (!cv.oracle.cell) { const h = deepHall(cv); cv.oracle.cell = spotIn(cv, h, i => cv.tombs.some(t => t.i === i)); }
          if (cv.oracle.cell >= 0) C.give(o, 'oracle', cv, cv.oracle.cell, { pri: 1.6, force: o.task && o.task.pri < 1.5 ? 1 : 0 });
        }
      }
      // a holy cave and a temple: someone starts hearing voices
      if (!cv.oracle && !cv.bandits && G.R() < 0.05 && S.day - (cv.known[f.id] || S.day) >= 3 && (S.day >= 12 || [...S.buildings.values()].some(b => b.type === 'temple' && b.built && G.Village.facOfSet(b.set) === f.id)) && !C.all().some(c => c.oracle && c.oracle.fac === f.id)) newOracle(cv, set);
      // the curious go to see the treasures nobody found
      if (cv.treasures.some(t => !t.found) && G.R() < 0.06) { const v = one(o => o.role === 'cacador' || o.age < 30); const h = pick(cv.halls); const c = spotIn(cv, h); if (v && c >= 0) C.give(v, 'explore', cv, c, { stay: rr(4, 7) }); }
    }
  }
  const nearHall = (cv, i) => { if (!(i >= 0)) return deepHall(cv); let b = cv.halls[0], bd = 1e9; for (const h of cv.halls) { const d = Math.hypot(h.x - (i % N), h.y - ((i / N) | 0)); if (d < bd) { bd = d; b = h; } } return b; };
  function veinFor(cv, f) {
    const U = C.U(); const has = k => G.Civ && G.Civ.has(f.id, k);
    const ok = o => o === 1 || o === 2 ? has('bronze') || has('alvenaria') : o === 3 ? has('ferro') || has('bronze') : o === 4 || o === 6 ? has('bronze') : o === 5;
    const list = [];
    const x0 = Math.max(1, Math.floor(cv.cx - 16)), x1 = Math.min(N - 2, Math.ceil(cv.cx + 16)), y0 = Math.max(1, Math.floor(cv.cy - 16)), y1 = Math.min(N - 2, Math.ceil(cv.cy + 16));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * N + x; if (U.ore[i] && ok(U.ore[i]) && standBy(cv, i) >= 0) list.push(i); }
    return list.length ? list[Math.floor(G.R() * list.length)] : -1;
  }
  function standBy(cv, i) { const U = C.U(); const x = i % N, y = (i / N) | 0; for (const [dx, dy] of D4) { const j = (y + dy) * N + x + dx; if (U.id[j] === cv.id && C.walk(U.k[j])) return j; } return -1; }
  // war at the gates: the children and the old run to the cave
  function refuge() {
    const S = G.S;
    for (const set of S.settlements.values()) {
      if (!(set.alarmT > 0)) continue;
      const cv = caveFor(set, 24); if (!cv) continue;
      let n = 0; const mothers = new Set();
      for (const b of S.villagers.values()) if (b.age < 2 && b.carried && b.set === set.id) mothers.add(b.carrier);
      for (const v of S.villagers.values()) {
        if (v.set !== set.id || v.captive || v.ug || v.inside || v.held || v.air || v.aboard) continue;
        if (!(v.age >= 3 && v.age < 14) && v.age < 60 && !mothers.has(v.id)) continue;
        if (v.task && v.task.type === 'caverna') continue;
        const h = deepHall(cv); const c = spotIn(cv, h); if (c < 0) continue;
        if (C.give(v, 'refuge', cv, c, { pri: 2.7, stay: 1e9, force: !v.task || v.task.pri < 2.7 ? 1 : 0 })) n++;
      }
      if (n >= 2 && !(S.day - (set._refugeDay || -9) < 3)) { set._refugeDay = S.day; log(`Enquanto ${set.name} era atacada, ${n} crianças, velhos e mães com bebês fugiram para se esconder ${C.na(cv)}.`, 'cave', set.cx, set.cy); }
    }
  }

  // ------------------------------ the god's hand ------------------------------
  // open a new cave under a hill
  C.openAt = function (x, y) {
    const S = G.S; const U = S.ug || (S.ug = fresh());
    if (!W.inb(x, y)) return null;
    const rng = G.mulberry32((Math.random() * 1e9) >>> 0); const nk = G.makeNoise((Math.random() * 1e9) | 0);
    // under the clicked hill, or as near to it as the rock allows
    let best = null, bd = 1e9;
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const cx = Math.round(x) + dx, cy = Math.round(y) + dy; if (cx < 4 || cy < 4 || cx >= N - 4 || cy >= N - 4) continue; const i = cy * N + cx; if (S.type[i] < T.SAND || U.id[i]) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [cx, cy]; } }
    if (!best) return null;
    const cv = carve(S, U, best[0], best[1], rng, nk); if (!cv) return null;
    const used = new Set(U.caves.map(c => c.name)); cv.name = nameCave(cv, rng, used); cv.day = S.day;
    if (!cv.mouths.length) { const m = findMouth(S, U, cv, cv.id, rng); if (m) { const i = m.y * N + m.x; U.k[i] = MOUTH; U.id[i] = cv.id; cv.mouths.push({ x: m.x, y: m.y }); keepJoinedPath(U, cv, m); } }
    // a gift from the depths
    cv.treasures.push(...[0].map(() => { const c = spotIn(cv, deepHall(cv)); return c >= 0 ? { x: c % N, y: (c / N) | 0, kind: pick(['geodo', 'idolo', 'tesouro']), found: 0 } : null; }).filter(Boolean));
    C.rebuildNear(); U.ver++;
    return cv;
  };
  function keepJoinedPath(U, cv, m) {
    // dig the passage from the nearest floor up to the new door
    let x = m.fx, y = m.fy;
    for (let s = 0; s < 40 && (x !== m.x || y !== m.y); s++) { if (x !== m.x) x += Math.sign(m.x - x); else y += Math.sign(m.y - y); const i = y * N + x; if (U.k[i] === ROCK) { U.k[i] = GAL; U.id[i] = cv.id; } }
  }
  // bring a cave down: whoever is inside is buried with it
  C.collapse = function (cv) {
    const S = G.S; const U = S.ug; if (!cv || cv.gone) return 0;
    let dead = 0;
    for (const id of [...C.inside]) { const v = S.villagers.get(id); if (v && v.ug === cv.id) { exit(v); v.lastCause = 'god'; G.Village.kill(v, 'god', true); dead++; } }
    const band = cv.bandits;
    if (band) { dead += band.n; breakBand(cv, `A terra engoliu ${C.a(cv)} com ${band.name} lá dentro. Nunca mais se viu ${band.leader}.`); }
    for (const a of cv.sleepers) { dead++; void a; } cv.sleepers = [];
    for (let i = 0; i < N * N; i++) if (U.id[i] === cv.id) { U.k[i] = ROCK; U.f[i] = 0; U.id[i] = 0; S.scar[i] = Math.max(S.scar[i], G.DAY_LEN * 0.5); }
    U.beasts = U.beasts.filter(b => b.cave !== cv.id);
    cv.gone = S.day; cv.mouths = [];
    C.rebuildNear(); U.ver++;
    return dead;
  };

  // ------------------------------ powers ------------------------------
  const CAVEP = [
    { id: 'gruta', tab: 'terra', name: 'Abrir Gruta', cost: 34, r: 3, good: true, under: 1, desc: 'Uma caverna se abre sob a colina que você tocar: galerias, salões, um rio no escuro — e, no fundo, algo que brilha. Quem a achar vai pintar ali a sua história.' },
    { id: 'desabar', tab: 'terra', name: 'Desabamento', cost: 45, r: 3, good: false, under: 1, desc: 'O teto de uma caverna desaba e a entrada some: quem estiver lá dentro fica soterrado — bandidos, ursos, tesouros e túmulos.' },
  ];
  for (const p of CAVEP) G.POWERS.push(p);
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });
  function caveNear(x, y, r) {
    const U = C.U(); if (!U) return null; let best = null, bd = r * r;
    for (let dy = -Math.ceil(r); dy <= r; dy++) for (let dx = -Math.ceil(r); dx <= r; dx++) { const tx = Math.floor(x) + dx, ty = Math.floor(y) + dy; if (!W.inb(tx, ty)) continue; const id = U.id[ty * N + tx]; if (!id) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = C.get(id); } }
    return best && !best.gone ? best : null;
  }
  const P = G.Powers; const oldCheck = P.check;
  P.check = function (p, x, y) {
    if (p.id === 'gruta') {
      const S = G.S; const i = W.idx(x, y);
      if (S.type[i] < T.SAND || S.type[i] === T.RIVER) { P.why = 'A gruta precisa de terra firme por cima.'; return false; }
      if (x < 5 || y < 5 || x > N - 5 || y > N - 5) { P.why = 'Perto demais da borda do mundo.'; return false; }
      if (caveNear(x, y, 6)) { P.why = 'Já existe uma caverna aqui embaixo.'; return false; }
      return true;
    }
    if (p.id === 'desabar') { if (!caveNear(x, y, 3)) { P.why = 'Não há caverna aqui embaixo para desabar.'; return false; } return true; }
    return oldCheck ? oldCheck(p, x, y) : true;
  };
  P.gruta = function (x, y) {
    const cv = C.openAt(x, y); const S = G.S;
    if (!cv) { G.UI && G.UI.notice('A rocha não se abriu aqui.', 'eye'); return; }
    G.Render && G.Render.shake(0.5); G.Audio && G.Audio.play && G.Audio.play('quake');
    for (const m of cv.mouths) { G.FX.dust(m.x + 0.5, m.y + 0.5, 14); }
    log(`A terra roncou e uma boca se abriu na encosta: nasceu ${C.a(cv)}, com ${cv.halls.length} salões no escuro.`, 'cave', cv.mouths[0] ? cv.mouths[0].x : cv.cx, cv.mouths[0] ? cv.mouths[0].y : cv.cy);
    P.witness(x, y, 12, 4, 10);
    void S;
  };
  P.desabar = function (x, y) {
    const cv = caveNear(x, y, 3); if (!cv) return;
    const m = cv.mouths[0]; const name = C.a(cv); const tombs = cv.tombs.length, art = cv.paintings.length;
    G.Render && G.Render.shake(0.9); G.Audio && G.Audio.play && G.Audio.play('quake');
    for (const q of cv.mouths) G.FX.dust(q.x + 0.5, q.y + 0.5, 22);
    for (let k = 0; k < 18; k++) G.FX.dust(cv.cx + rr(-4, 4), cv.cy + rr(-4, 4), 3);
    const dead = C.collapse(cv);
    log(`O teto ${C.da(cv)} desabou: ${name} deixou de existir${dead ? ', e levou ' + dead + (dead > 1 ? ' vidas' : ' vida') + ' com ela' : ''}${tombs ? `; ${tombs > 1 ? 'os túmulos dos reis ficaram' : 'o túmulo real ficou'} sob a pedra para sempre` : ''}${art ? `; as pinturas nunca mais serão vistas` : ''}.`, 'skull', m ? m.x : cv.cx, m ? m.y : cv.cy);
    P.witness(x, y, 14, 0, 30);
  };

  // ------------------------------ the things of the dark, one by one ------------------------------
  // a tap underground on a beast, a glow-worm, a crystal, a bone, a painting: what is it?
  const THING = {
    aranha: ['Aranha-das-cavernas', 'Fera do escuro', 'Pernas longas e quase nenhum olho. Estende os fios nas fendas por onde o ar corre e espera os grilos e as mariposas que entram com o vento. Pode passar meses sem comer.'],
    grilo: ['Grilo-das-cavernas', 'Fera do escuro', 'Não canta e não tem asas; as antenas são mais compridas que o corpo, para tatear o que não vê. Come o guano dos morcegos e o que cai do mundo de cima — e é o pão das aranhas.'],
    peixe: ['Peixe cego', 'Fera do escuro', 'Branco como a lua e sem olhos: nunca precisou deles. Sente a água tremer na pele e vive de quase nada, por muitos anos, no lago negro.'],
    salamandra: ['Salamandra cega', 'Fera do escuro', 'Rosada e translúcida, com guelras de pluma. Pode ficar um ano inteiro sem comer, imóvel na água fria. Os antigos achavam que era filhote de dragão.'],
    abrigado: ['Abrigado da tempestade', 'Esperando a chuva passar', 'Entrou para fugir da chuva e do vento. Aqui dentro, caça e caçador fazem trégua: cada um no seu canto, de olho no outro, até o céu abrir.'],
    urso: ['Urso dormindo', 'Hibernando', 'Dorme no fundo da caverna com o coração batendo devagar, gordo da comida do verão. Acorda de manhã com fome — e às vezes com um filhote que nasceu no escuro.'],
    morcegos: ['Colônia de morcegos', 'Dormem de cabeça para baixo', 'Penduram-se no teto do salão aos milhares. Saem num rio negro ao entardecer para caçar insetos e voltam antes do sol. O guano que deixam no chão é o melhor adubo que existe.'],
    1: ['Estalagmite', 'Pedra que cresce', 'Gota a gota, a água que pinga do teto deixa um fio de calcário. Um palmo leva mil anos. Em cima, no teto, uma estalactite cresce ao encontro dela.'],
    2: ['Coluna', 'Pedra que cresceu', 'Quando a estalactite do teto e a estalagmite do chão finalmente se tocam, nasce uma coluna: dez mil anos de gotas.'],
    3: ['Cristais', 'Água que virou pedra', 'Água carregada de minério secou devagar no escuro e deixou pontas transparentes, roxas, frias. Brilham quando uma tocha passa.'],
    4: ['Vaga-lumes das cavernas', 'Larvas que brilham no teto', 'Não são estrelas: são larvas penduradas no teto, cada uma com fios de seda pegajosa e uma luz azul-esverdeada. Os insetos voam para essa noite falsa e ficam presos.'],
    5: ['Cogumelos pálidos', 'Vivem sem sol', 'Nascem no guano e na madeira podre que a água traz. Alguns brilham fraco no escuro. Os caçadores dizem que um deles faz sonhar acordado.'],
    6: ['Ossos', 'Alguém que não achou a saída', 'Os ossos de um bicho que entrou para morrer, ou que se perdeu no escuro. Às vezes, de gente.'],
    7: ['Fóssil', 'Mais velho que os deuses', 'Ossos de pedra de um bicho que não existe mais, presos na rocha desde antes de qualquer povo. Ninguém sabe o nome dele.'],
    8: ['Guano', 'O adubo dos morcegos', 'Montes de excremento de morcego. Fede, mas faz o trigo crescer como nada: os povos vêm buscar em cestos.'],
    lago: ['Lago subterrâneo', 'Água que nunca viu o sol', 'Tão parada e tão clara que parece não estar lá — até uma gota cair do teto e o círculo correr a caverna inteira.'],
    rio: ['Rio subterrâneo', 'Corre no escuro', 'Água que entrou pela montanha como chuva e corre sem pressa por baixo da terra, até sair numa fonte lá fora.'],
    abismo: ['Abismo', 'Ninguém sabe o fundo', 'Uma fenda que desce até onde a tocha não alcança. Uma pedra jogada lá dentro demora a bater.'],
    veio: ['Veio de minério', 'Na parede', ''],
    boca: ['A boca da caverna', 'A luz do dia', 'Por aqui entra o dia, o vento, as folhas — e quem tem coragem.'],
  };
  C.pickThing = function (x, y) {
    const U = C.U(); if (!U) return null;
    let best = null, bd = 0.75;
    for (const b of U.beasts) { const d = G.dist(b.x, b.y, x, y); if (d < bd) { bd = d; best = { isCaveThing: 1, kind: b.kind, beast: b.id, cave: b.cave, x: b.x, y: b.y }; } }
    if (best) return best;
    for (const cv of C.all()) for (const a of cv.sleepers) if (G.dist(a.sx, a.sy, x, y) < 0.9) return { isCaveThing: 1, kind: 'urso', cave: cv.id, x: a.sx, y: a.sy };
    for (const cv of C.all()) for (const a of cv.sheltered || []) if (G.dist(a.sx, a.sy, x, y) < 0.8) return { isCaveThing: 1, kind: 'abrigado', animal: a.kind, cave: cv.id, x: a.sx, y: a.sy };
    const xi = Math.floor(x), yi = Math.floor(y); if (xi < 0 || yi < 0 || xi >= N || yi >= N) return null;
    const i = yi * N + xi; const cv = C.at(i);
    const mk = (kind, o) => Object.assign({ isCaveThing: 1, kind, cave: cv ? cv.id : 0, cell: i, x: xi + 0.5, y: yi + 0.5 }, o || {});
    if (cv) {
      if (cv.bats && cv.roost && G.dist(cv.roost.x + 0.5, cv.roost.y + 0.5, x, y) < Math.max(1.2, cv.roost.r * 0.6)) return mk('morcegos');
      const tb = cv.tombs.find(t => t.i === i); if (tb) return mk('tumulo', { tomb: tb.name });
      if (cv.oracle && cv.oracle.cell === i) return mk('oraculo');
      if (cv.bandits && cv.bandits.camp === i) return mk('bandidos');
      const p = cv.paintings.find(q => q.i === i); if (p) return mk('pintura', { paint: cv.paintings.indexOf(p) });
      if (U.f[i]) return mk(U.f[i]);
      if (U.k[i] === LAKE) return mk('lago');
      if (U.k[i] === STREAM) return mk('rio');
      if (U.k[i] === PIT) return mk('abismo');
      if (U.k[i] === MOUTH) return mk('boca');
    }
    // the wall itself: a vein?
    if (U.k[i] === ROCK && U.ore[i]) { for (const [dx, dy] of D4) { const j = (yi + dy) * N + xi + dx; if (j >= 0 && j < N * N && U.id[j]) return Object.assign(mk('veio', { ore: U.ore[i] }), { cave: U.id[j] }); } }
    return null;
  };
  function thingHTML(o) {
    const cv = C.get(o.cave); const S = G.S;
    let [title, sub, text] = THING[o.kind] || ['?', '', ''];
    let extra = '';
    if (o.kind === 'morcegos' && cv) { const ph = C.batPhase(cv); sub = `${cv.bats} morcegos` + (ph && ph.night ? ' — lá fora, caçando' : ph && ph.out ? ' — saindo para caçar' : ph ? ' — voltando para dormir' : ' — dormindo de cabeça para baixo'); extra = `<div class="doing">${Math.floor(cv.guano)} cestos de guano no chão.</div>`; }
    if (o.kind === 'abrigado') { const D = G.Animals.DEF[o.animal]; if (D) title = `${D.name}, abrigad${D.g === 'f' ? 'a' : 'o'} da tempestade`; }
    if (o.kind === 'veio') { const ore = ORES[o.ore]; title = `Veio de ${ore.name}`; text = ore.id === 'ouro' ? 'Um fio amarelo na rocha escura. Por ele, povos inteiros já foram à guerra.' : ore.id === 'gemas' ? 'Pedras de cor presas na parede, como olhos. Os ourives pagam caro.' : ore.id === 'sal' ? 'Sal de pedra, limpo e branco: conserva a carne do inverno inteiro.' : `Minério de ${ore.name} na parede. Com a técnica certa, os mineiros abrem galerias atrás dele.`; }
    if (o.kind === 'tumulo' && cv) { const tb = cv.tombs.find(t => t.name === o.tomb); title = `O túmulo de ${tb ? tb.name : '?'}`; sub = tb ? `Sepultad${tb.g === 'f' ? 'a' : 'o'} no ano ${tb.day}` : ''; text = tb ? `Com ${tb.goods}.${tb.robbed ? ' Ladrões já abriram a tampa e levaram o que puderam.' : ' Ninguém mexeu aqui desde o cortejo.'}` : ''; }
    if (o.kind === 'oraculo' && cv && cv.oracle) { const q = cv.oracle; title = `O oráculo ${C.da(cv)}`; sub = `${q.name} · credibilidade ${Math.round(q.cred || 50)}%`; text = q.here ? 'Está lá agora, sentad' + (q.g === 'f' ? 'a' : 'o') + ' sobre a fenda de onde sobe a fumaça. Fala com a voz de outro.' : 'A fenda de onde sobe a fumaça. Ao meio-dia, quem tem coragem desce para ouvir o que o escuro diz.'; const said = q.said.slice(-2).reverse(); if (said.length) extra = `<div class="doing">${said.map(d => `“${esc(d.text)}” <small>(${d.st})</small>`).join('<br>')}</div>`; }
    if (o.kind === 'bandidos' && cv && cv.bandits) { const b = cv.bandits; title = b.name; sub = `${b.n} foras-da-lei sob ${b.leader}`; text = `A fogueira deles nunca apaga. Saem à noite, pelas trilhas, para roubar das vilas — ${b.raids} assaltos até agora.`; }
    if (o.kind === 'pintura' && cv) { const p = cv.paintings[o.paint]; if (p) { title = 'Pintura na parede'; sub = `Ano ${p.day} · ${p.by}`; text = p.txt ? `Conta: “${esc(trim(p.txt, 160))}”` : SCENE_TXT[p.scene]; } }
    if ((o.kind === 'aranha' || o.kind === 'grilo' || o.kind === 'peixe' || o.kind === 'salamandra') && cv) { const n = C.U().beasts.filter(b => b.cave === cv.id && b.kind === o.kind).length; extra = `<div class="doing">${n > 1 ? `${n} delas nesta caverna.` : 'A única que se vê por aqui.'}</div>`; }
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(title)}</h3><div class="sub">${esc(sub)}${cv ? ' · ' + esc(cv.name) : ''}</div></div><button class="x" data-act="close">${G.ICON.close}</button></div><div class="doing">${text}</div>${extra}` +
      (cv ? `<div class="btns"><button data-act="cave-panel" data-id="${cv.id}">${G.ICON.cave} Sobre ${esc(C.a(cv))}</button></div>` : '');
    void S;
  }
  C.thingTitle = o => (THING[o.kind] || ['?'])[0];

  // ------------------------------ panel ------------------------------
  C.owns = o => !!(o && (o.isCave || o.isCaveThing));
  // look inside a cave (or come back up to its door)
  C.view = function (id, under) {
    const cv = C.get(id); const R = G.Render; if (!cv) return;
    const go = under === undefined ? !R.under : !!under;
    R.setUnder(go ? 1 : 0); R.cam.follow = 0;
    const m = cv.mouths[0];
    if (go) R.panTo(cv.cx + 0.5, cv.cy + 0.5); else R.panTo(m ? m.x + 0.5 : cv.cx, m ? m.y + 0.5 : cv.cy);
    R.cam.tz = Math.max(R.cam.tz, 1.5);
    // going in, the panel steps aside so the cave can be seen (a tap on the rock brings it back)
    if (G.UI) { if (go) { G.UI.select(null); G.UI.notice(`${G.cap(cv.name)} — toque nas pessoas, nos bichos e nas coisas da caverna; U volta à superfície.`, 'cave'); } else G.UI.select(C.selectCave(cv)); }
  };
  C.selectCave = cv => ({ isCave: 1, id: cv.id, cave: cv });
  C.inspectorHTML = function (o) {
    if (o.isCaveThing) return thingHTML(o);
    const S = G.S; const cv = C.get(o.id); if (!cv) return '<div class="muted">A caverna desabou.</div>';
    const U = C.U();
    let veins = {}; for (let i = 0; i < N * N; i++) { if (!U.ore[i]) continue; const x = i % N, y = (i / N) | 0; if (Math.abs(x - cv.cx) > 18 || Math.abs(y - cv.cy) > 18) continue; let adj = false; for (const [dx, dy] of D4) { const j = (y + dy) * N + x + dx; if (U.id[j] === cv.id) { adj = true; break; } } if (adj) veins[ORES[U.ore[i]].name] = (veins[ORES[U.ore[i]].name] || 0) + 1; }
    const inside = [...C.inside].map(id => S.villagers.get(id)).filter(v => v && v.ug === cv.id && v.age >= 2);
    const peoples = Object.keys(cv.known).map(Number).map(id => G.Fac.get(id)).filter(Boolean);
    const feats = [cv.lake && 'um lago negro', cv.stream && 'um rio que corre no escuro', cv.crystal && 'cristais', cv.glow && 'vaga-lumes de caverna no teto', cv.fossil && 'ossos de bichos que não existem mais', cv.dug && `${cv.dug} galerias cavadas por mineiros`].filter(Boolean);
    const beasts = {}; for (const b of U.beasts) if (b.cave === cv.id) beasts[b.kind] = (beasts[b.kind] || 0) + 1;
    const BN = { aranha: 'aranhas', grilo: 'grilos-das-cavernas', peixe: 'peixes cegos', salamandra: 'salamandras cegas' };
    const ph = C.batPhase(cv);
    let h = `<div class="insp-head"><div class="insp-title"><h3>${esc(cv.name)}</h3><div class="sub">Caverna · ${cv.halls.length} ${cv.halls.length > 1 ? 'salões' : 'salão'} · ${cv.n} passos de galerias · ${cv.mouths.length ? cv.mouths.length + (cv.mouths.length > 1 ? ' entradas' : ' entrada') : 'sem entrada'}</div></div><button class="x" data-act="close">${G.ICON.close}</button></div>`;
    h += `<div class="doing">${cv.found ? `Descoberta por <a data-pid="${cv.found.id}">${esc(cv.found.name)}</a> no ano ${cv.found.day}` : 'Ninguém entrou aqui ainda.'}${peoples.length ? ' · conhecida por ' + peoples.map(f => esc(f.name)).join(', ') : ''}</div>`;
    if (feats.length) h += `<div class="doing">Lá dentro: ${feats.join(', ')}.</div>`;
    const vk = Object.entries(veins); if (vk.length) h += `<div class="doing">Veios nas paredes: ${vk.map(([k, n]) => `<b>${k}</b> (${n})`).join(', ')}.</div>`;
    if (cv.bats) h += `<div class="doing">${cv.bats} morcegos${ph && ph.night ? ' — caçando insetos lá fora' : ph && ph.out ? ' — saindo para caçar' : ' dormindo de cabeça para baixo'} · ${Math.floor(cv.guano)} cestos de guano para adubo.</div>`;
    if (cv.sleepers.length) h += `<div class="doing">${cv.sleepers.length > 1 ? cv.sleepers.length + ' ursos dormem' : 'Um urso dorme'} no fundo.</div>`;
    const bk = Object.entries(beasts); if (bk.length) h += `<div class="doing">Vivem no escuro: ${bk.map(([k, n]) => n + ' ' + BN[k]).join(', ')}.</div>`;
    if (cv.oracle) { const o = cv.oracle; const op = o.said.filter(q => q.st === 'aberta'); h += `<div class="doing"><b>Oráculo:</b> <a data-pid="${o.id}">${esc(o.name)}</a>${o.here ? ' — está lá agora, entre a fumaça' : ''} · credibilidade ${Math.round(o.cred || 50)}% · ${o.pilgrims || 0} peregrinos${op.length ? `<br>Anunciou: “${esc(op[0].text)}” (até o ano ${op[0].until})` : ''}</div>`; }
    if (cv.bandits) { const b = cv.bandits; h += `<div class="doing"><b>${esc(b.name)}</b> moram aqui: ${b.n} foras-da-lei sob ${esc(b.leader)} · ${b.raids} assaltos${b.hunt ? ' · <b>guerreiros vieram atrás deles!</b>' : ''}</div>`; }
    if (cv.tombs.length) h += `<div class="doing"><b>Túmulos:</b> ${cv.tombs.map(t => `${esc(t.name)} <small>(ano ${t.day}${t.robbed ? ', saqueado' : ''})</small>`).join(' · ')}</div>`;
    if (cv.paintings.length) h += `<div class="cv-paint"><b>Pinturas nas paredes (${cv.paintings.length})</b>${cv.paintings.slice(-5).reverse().map(p => `<p>Ano ${p.day} · ${esc(p.by)}: ${esc(p.txt ? trim(p.txt, 120) : SCENE_TXT[p.scene])}</p>`).join('')}</div>`;
    const tr = cv.treasures.filter(t => t.found); if (tr.length) h += `<div class="doing">Achados: ${tr.map(t => `${TREASURE[t.kind].name} <small>(${esc(t.by || '?')}, ano ${t.found})</small>`).join('; ')}</div>`;
    if (inside.length) h += `<div class="doing">Lá dentro agora: ${inside.slice(0, 8).map(v => `<a data-pid="${v.id}">${esc(v.name)}</a>`).join(', ')}${inside.length > 8 ? ' e mais ' + (inside.length - 8) : ''}.</div>`;
    h += `<div class="btns"><button data-act="cave-view" data-id="${cv.id}">${G.ICON.cave} ${G.Render && G.Render.under ? 'Voltar à superfície' : 'Ver o interior'}</button></div>`;
    return h;
  };
  C.bookHTML = function () {
    const S = G.S; const list = C.all();
    if (!list.length) return `<p class="muted">${S.cavesOpt === 'nenhuma' ? 'Este mundo foi criado sem cavernas.' : 'Nenhuma caverna conhecida neste mundo.'}</p>`;
    let out = `<p class="facts">${list.length} cavernas sob ${G.S.lore && G.S.lore.world ? esc(G.S.lore.world) : 'o mundo'} · ${list.filter(c => c.found).length} descobertas · ${list.reduce((a, c) => a + c.paintings.length, 0)} pinturas · ${list.reduce((a, c) => a + c.tombs.length, 0)} túmulos</p>`;
    for (const cv of list.sort((a, b) => (b.found ? 1 : 0) - (a.found ? 1 : 0) || b.n - a.n)) {
      const bits = [cv.found ? `descoberta por ${esc(cv.found.name)} no ano ${cv.found.day}` : 'ainda escondida', cv.halls.length + ' salões', cv.lake && 'lago', cv.stream && 'rio subterrâneo', cv.crystal && 'cristais', cv.bats && cv.bats + ' morcegos', cv.oracle && 'oráculo de ' + esc(cv.oracle.name), cv.bandits && esc(cv.bandits.name), cv.tombs.length && cv.tombs.length + ' túmulos reais', cv.paintings.length && cv.paintings.length + ' pinturas'].filter(Boolean);
      out += `<div class="bk-geo"><b>${esc(cv.name)}</b><span>${bits.join(' · ')}</span><button class="bk-go" data-m="cave-go" data-id="${cv.id}">ver</button></div>`;
      if (cv.paintings.length) out += `<div class="bk-cvp">${cv.paintings.slice(-3).reverse().map(p => `<p>“${esc(p.txt ? trim(p.txt, 140) : SCENE_TXT[p.scene])}” <small>— pintado por ${esc(p.by)}, ano ${p.day}</small></p>`).join('')}</div>`;
      if (cv.oracle || cv.oraclePast) { const said = (cv.oracle ? cv.oracle.said : []).slice(-3).reverse(); if (said.length) out += `<div class="bk-cvp">${said.map(q => `<p>Oráculo, ano ${q.day}: “${esc(q.text)}” <small>— ${q.st === 'cumprida' ? 'cumpriu-se' : q.st === 'falhou' ? 'não se cumpriu' : 'aguardando'}</small></p>`).join('')}</div>`; }
    }
    return out;
  };

  // ------------------------------ hooks into the world ------------------------------
  // a ruler's death: to the tomb of kings, if the people knows a cave
  const oldKill = G.Village.kill;
  G.Village.kill = function (v, cause, byGod) {
    let f = null; if (v && !v.dead) { f = G.Fac.ofV(v); if (f && f.leader !== v.id) f = null; }
    if (v && v.ug) exit(v);
    const r = oldKill.apply(this, arguments);
    if (f && G.S && G.S.ug) try { onRulerDeath(v, f, cause); } catch (e) { console.warn(e); }
    return r;
  };
  C.reset = function () { C.inside.clear(); C.actors.length = 0; lastDay = -1; };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) {
      const U = G.S.ug; if (!U) return;
      const rl = a => { const o = []; let v = a[0], n = 0; for (let k = 0; k < a.length; k++) { if (a[k] === v) n++; else { o.push(v, n); v = a[k]; n = 1; } } o.push(v, n); return { e: o }; };
      out.ug = { k: rl(U.k), f: rl(U.f), ore: rl(U.ore), oreN: rl(U.oreN), id: rl(U.id), nextBeast: U.nextBeast, opt: G.S.cavesOpt,
        beasts: U.beasts.map(b => [b.id, b.kind, b.cave, +b.x.toFixed(2), +b.y.toFixed(2)]),
        caves: U.caves.map(cv => Object.assign({}, cv, { sleepers: cv.sleepers.map(a => ({ id: a.id, kind: a.kind, age: a.age, grown: a.grown, named: a.named, sx: a.sx, sy: a.sy })), sheltered: (cv.sheltered || []).map(a => ({ id: a.id, kind: a.kind, age: a.age, grown: a.grown, sx: a.sx, sy: a.sy })), bandits: cv.bandits ? Object.assign({}, cv.bandits, { hunt: null }) : null, oracle: cv.oracle ? Object.assign({}, cv.oracle, { here: 0 }) : null })) };
    },
    load(o) {
      const S = G.S; C.reset();
      if (!o.ug) { C.gen(S, 'normais'); return; }
      const U = S.ug = fresh(); const sa = G.Save.setArr;
      sa(U.k, o.ug.k); sa(U.f, o.ug.f); sa(U.ore, o.ug.ore); sa(U.oreN, o.ug.oreN); sa(U.id, o.ug.id); U.nextBeast = o.ug.nextBeast || 1; S.cavesOpt = o.ug.opt || 'normais';
      U.beasts = (o.ug.beasts || []).map(a => ({ id: a[0], kind: a[1], cave: a[2], x: a[3], y: a[4], t: Math.random() * 3, face: 1, tx: 0, ty: 0 }));
      U.caves = (o.ug.caves || []).map(cv => {
        cv.sleepers = (cv.sleepers || []).map(a => { const x = G.Animals.spawn(a.kind, a.sx || cv.cx, a.sy || cv.cy, a); S.animals.delete(x.id); x.id = a.id; x.sx = a.sx; x.sy = a.sy; return x; });
        cv.sheltered = (cv.sheltered || []).map(a => { const x = G.Animals.spawn(a.kind, a.sx || cv.cx, a.sy || cv.cy, a); S.animals.delete(x.id); x.id = a.id; x.sx = a.sx; x.sy = a.sy; x.shelter = 0; return x; }).filter(Boolean);
        return cv;
      });
      C.rebuildNear(); U.ver++;
      for (const v of S.villagers.values()) if (v.ug) exit(v);
    },
  });
})(window.G);
