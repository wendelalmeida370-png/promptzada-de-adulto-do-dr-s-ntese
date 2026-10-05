'use strict';
// ============================================================
//  The sea: what lies under the water near the coasts (sand, rock, sea grass, coral reefs in the warm
//  seas, kelp forests in the cold ones, the mud a river brings, the rare blue hole), the stacks and
//  arches standing off the cliffs, and how the water looks over all of it.
//  Everything here comes from the shape of the land, so it is rebuilt (not saved) with the map.
// ============================================================
(function (G) {
  const Sea = G.Sea = {};
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const T = G.T, W = G.W;
  const F = Sea.F = { SAND: 0, ROCK: 1, GRASS: 2, REEF: 3, KELP: 4, HOLE: 5, MUD: 6 };
  Sea.NAME = ['areia', 'pedra', 'pradaria de algas', 'recife de coral', 'floresta de kelp', 'buraco azul', 'lama do rio'];
  Sea.floor = null;  // Uint8Array: the bottom of each water tile
  Sea.dl = null;     // Uint8Array: how far each water tile is from land
  Sea.stacks = [];   // stacks and arches standing in the sea off the cliffs
  Sea.holes = [];    // blue holes
  let noise = null, noise2 = null, seedUsed = -1;

  const temp = i => (G.S.temp ? G.S.temp[i] / 255 : 0.5);
  Sea.temp = temp;
  Sea.depth = i => G.SEA - W.tileH(i);

  Sea.build = function () {
    const S = G.S; if (!S || !S.type) return;
    // a new world: nothing of the old one's sea comes along
    if (Sea._S !== S) { Sea._S = S; Sea.nest = null; Sea.carcass = null; Sea.bones = []; Sea.glowDay = -1; }
    const NN = N * N;
    if (seedUsed !== S.seed || !noise) { noise = G.makeNoise((S.seed | 0) + 7717); noise2 = G.makeNoise((S.seed | 0) + 991); seedUsed = S.seed; }
    // distance of every water tile from the land
    const dl = Sea.dl = new Uint8Array(NN).fill(99);
    const q = [];
    for (let i = 0; i < NN; i++) if (S.type[i] >= T.SAND) { dl[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) {
      const a = q[h], x = a % N, y = (a / N) | 0;
      if (dl[a] >= 12) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const j = ny * N + nx; if (dl[j] > dl[a] + 1) { dl[j] = dl[a] + 1; q.push(j); }
      }
    }
    const fl = Sea.floor = new Uint8Array(NN);
    const edge = Sea.edge = new Uint8Array(NN);
    const near = (x, y, r, test) => {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && test(ny * N + nx)) return true; }
      return false;
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; if (S.type[i] !== T.SEA) continue;
      const d = G.SEA - W.tileH(i), tp = temp(i);
      if (near(x, y, 1, j => S.type[j] === T.DEEP)) edge[i] = 1;
      const n1 = noise(x * 0.21, y * 0.21), n2 = noise2(x * 0.37 + 11, y * 0.37 - 4);
      let f = F.SAND;
      if (near(x, y, 2, j => S.type[j] === T.RIVER)) f = F.MUD;
      else if (near(x, y, 1, j => S.type[j] === T.ROCKY || S.cliff[j] === 1)) f = n2 > -0.25 ? F.ROCK : F.SAND;
      else if (d > 0.45 && n1 > -0.05) f = F.ROCK;
      // the warm shallows grow reefs; the cold rocky ones, kelp; the calm sandy ones, sea grass
      if (tp > 0.56 && d > 0.25 && d < 1.6 && dl[i] >= 1 && f !== F.MUD && n2 + (tp - 0.56) * 1.6 > 0.02) f = F.REEF;
      else if (tp < 0.4 && d > 0.35 && (f === F.ROCK || n1 > 0.15) && n2 > -0.2) f = F.KELP;
      else if (f === F.SAND && tp >= 0.3 && d > 0.2 && d < 1.2 && n1 < -0.18) f = F.GRASS;
      fl[i] = f;
    }
    // blue holes: a round shaft in the middle of a shallow reef or sandy flat, seen from far away
    Sea.holes = [];
    const cand = [];
    for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) {
      const i = y * N + x; if (S.type[i] !== T.SEA || dl[i] < 2) continue;
      if (fl[i] !== F.REEF && fl[i] !== F.SAND && fl[i] !== F.GRASS) continue;
      let ok = true; for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * N + x + dx; if (S.type[j] !== T.SEA) { ok = false; break; } }
      if (ok) cand.push(i);
    }
    const nHole = Math.min(cand.length, Math.round(N * N / 9000) + (G.hash(S.seed * 3 + 1) < 0.5 ? 1 : 0));
    for (let k = 0; k < nHole && cand.length; k++) {
      const pick = cand[Math.floor(G.hash(S.seed * 17 + k * 31) * cand.length)];
      if (Sea.holes.some(h => Math.abs(h.x - pick % N) + Math.abs(h.y - ((pick / N) | 0)) < 12)) continue;
      fl[pick] = F.HOLE; Sea.holes.push({ x: pick % N, y: (pick / N) | 0, i: pick });
    }
    buildStacks();
    buildTide();
    // what floats: the kelp's canopy, the ice of the cold seas
    Sea.holeE = Sea.holes.map(h => ({ fn: drawHole, x: h.x + 0.5, y: h.y + 0.5, i: h.i }));
    // the reef's own fish: little shoals of colour turning over the corals (and over the kelp, silver ones)
    Sea.shoals = [];
    for (let i = 0; i < NN; i++) {
      if ((fl[i] === F.REEF && G.hash(i * 23 + 7) < 0.28) || (fl[i] === F.KELP && G.hash(i * 29 + 3) < 0.12)) Sea.shoals.push({ fn: drawShoal, x: i % N + 0.3 + G.hash(i) * 0.4, y: ((i / N) | 0) + 0.3 + G.hash(i * 5) * 0.4, seed: i, reef: fl[i] === F.REEF });
    }
    buildIce();
  };

  // ------------------------------ stacks and arches ------------------------------
  // where a high, rocky coast falls into the sea, the waves leave pillars standing offshore,
  // and now and then an arch the sea has bored through
  function buildStacks() {
    const S = G.S; Sea.stacks = [];
    const used = new Set();
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x; if (S.type[i] !== T.SEA || Sea.dl[i] !== 1) continue;
      if (G.hash(i * 7 + (S.seed | 0)) > 0.16) continue;
      // the land behind: high and rocky
      let best = null, bh = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const j = (y + dy) * N + x + dx; if (S.type[j] < T.SAND) continue;
        const h = W.tileH(j) - G.SEA; if ((S.type[j] === T.ROCKY || S.cliff[j]) && h > bh) { bh = h; best = [dx, dy]; }
      }
      if (!best || bh < 1.6) continue;
      if (S.road[i] || [...used].some(u => Math.abs(u % N - x) + Math.abs(((u / N) | 0) - y) < 4)) continue;
      used.add(i);
      const r = G.hash(i * 13 + 5);
      const arch = r < 0.3 && bh > 2.4;
      const nm = arch ? ARCH_N : STACK_N;
      Sea.stacks.push({ fn: drawStack, x: x + 0.5 - best[0] * 0.3, y: y + 0.5 - best[1] * 0.3, i, h: G.clamp(bh * (0.5 + r * 0.45), 2.6, 6.5), arch, ax: -best[1], ay: best[0], seed: i, birds: G.hash(i * 3) < 0.6, name: nm[Math.floor(G.hash(i * 5 + 2) * nm.length)] });
    }
    // sea grottos: where a cliff stands in the sea, the waves bore into its foot
    Sea.grottos = [];
    const want = Math.max(1, Math.round(N * N / 1700));
    const cand = [];
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const i = y * N + x; if (S.type[i] !== T.SEA) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const j = (y + dy) * N + x + dx; if (S.type[j] < T.SAND) continue;
        const h = W.tileH(j) - G.SEA; if (h < 1.7 || !(S.cliff[j] || S.type[j] === T.ROCKY)) continue;
        cand.push({ i, x, y, dx, dy, h, r: G.hash(i * 11 + (S.seed | 0) * 3) });
      }
    }
    cand.sort((a, b) => a.r - b.r);
    for (const c of cand) {
      if (Sea.grottos.length >= want) break;
      if (Sea.grottos.some(g => Math.abs(g.x - c.x) + Math.abs(g.y - c.y) < 10) || Sea.stacks.some(st => Math.abs(st.x - c.x) + Math.abs(st.y - c.y) < 2)) continue;
      Sea.grottos.push({ fn: drawGrotto, x: c.x + 0.5 + c.dx * 0.42, y: c.y + 0.5 + c.dy * 0.42, tx: c.x, ty: c.y, i: c.i, dx: c.dx, dy: c.dy, h: c.h, seed: c.i, name: GROTTO_N[Math.floor(G.hash(c.i * 7 + 1) * GROTTO_N.length)] });
    }
  }
  const STACK_N = ['a Agulha', 'a Pedra da Gaivota', 'o Velho do Mar', 'a Pedra do Sino', 'o Dedo do Gigante', 'a Torre das Aves', 'a Pedra Sozinha', 'o Monge de Pedra'];
  const ARCH_N = ['o Arco do Mar', 'a Porta das Ondas', 'o Arco da Baleia', 'a Ponte dos Deuses', 'o Arco do Vento'];
  const GROTTO_N = ['a Gruta Azul', 'a Furna das Ondas', 'a Gruta que Ronca', 'a Lapa da Maré', 'a Gruta das Focas', 'a Boca do Mar', 'a Gruta do Contrabando', 'a Furna do Trovão'];
  // the stone of a stack: the rock of the coast it broke from
  function stoneOf(i) {
    const S = G.S; const tp = temp(i); const b = S.biome ? S.biome[i] : 0;
    if (b === 5 || b === 6 || (tp > 0.62 && b !== 4)) return { lit: [204, 146, 102], dark: [150, 96, 68], line: 'rgba(110,64,44,0.45)' };
    if (tp < 0.3) return { lit: [128, 128, 136], dark: [84, 84, 94], line: 'rgba(40,40,50,0.4)', snow: tp < 0.2 };
    return { lit: [188, 178, 160], dark: [128, 120, 108], line: 'rgba(80,72,60,0.4)', green: true };
  }
  // ------------------------------ drawing the stacks, the arches, the grottos ------------------------------
  function pillar(c, x, y, w, hp, st, seed, top) {
    // a rough column, waisted where the waves bite, the lit face and the shadowed one, its layers, its cap
    const n = 6, L = [], Rr = [];
    for (let k = 0; k <= n; k++) {
      const f = k / n, yy = y - hp * f;
      const waist = 1 - 0.22 * Math.exp(-Math.pow((f - 0.18) / 0.12, 2)) - f * 0.18;
      L.push([x - w * waist + (G.hash(seed * 7 + k) - 0.5) * w * 0.3, yy]);
      Rr.push([x + w * waist + (G.hash(seed * 11 + k) - 0.5) * w * 0.3, yy]);
    }
    const mid = k => (L[k][0] + Rr[k][0]) / 2 + w * 0.12;
    c.fillStyle = G.rgb(st.lit); c.beginPath(); c.moveTo(L[0][0], L[0][1]);
    for (let k = 1; k <= n; k++) c.lineTo(L[k][0], L[k][1]);
    for (let k = n; k >= 0; k--) c.lineTo(mid(k), L[k][1] + (k === 0 ? w * 0.3 : 0));
    c.closePath(); c.fill();
    c.fillStyle = G.rgb(st.dark); c.beginPath(); c.moveTo(mid(0), y + w * 0.3);
    for (let k = 0; k <= n; k++) c.lineTo(mid(k), Rr[k][1]);
    for (let k = n; k >= 0; k--) c.lineTo(Rr[k][0], Rr[k][1]);
    c.closePath(); c.fill();
    c.strokeStyle = st.line; c.lineWidth = 0.5; c.beginPath();
    for (let k = 1; k * 3.2 < hp - 2; k++) { const f = k * 3.2 / hp, j = Math.min(n - 1, Math.floor(f * n)); const yy = y - k * 3.2; c.moveTo(L[j][0] + 0.6, yy + 0.7); c.lineTo(Rr[j][0] - 0.6, yy - 0.5); }
    c.stroke();
    // the waterline: dark, wet, with weed
    c.fillStyle = 'rgba(40,52,44,0.55)'; c.beginPath(); c.moveTo(L[0][0], L[0][1]); c.lineTo(Rr[0][0], Rr[0][1]); c.lineTo(Rr[1][0] - 0.3, Rr[0][1] - 2.2); c.lineTo(L[1][0] + 0.3, L[0][1] - 2.2); c.closePath(); c.fill();
    if (top) {
      const tw = (Rr[n][0] - L[n][0]) / 2, tx = (Rr[n][0] + L[n][0]) / 2;
      c.fillStyle = st.snow ? '#eef3f8' : st.green ? '#6f9a4e' : G.rgb([st.lit[0] * 1.06, st.lit[1] * 1.04, st.lit[2]]);
      c.beginPath(); c.ellipse(tx, y - hp, tw * 1.05, tw * 0.5, 0, 0, 6.283); c.fill();
      if (st.green) { c.fillStyle = '#86b25c'; c.beginPath(); c.ellipse(tx - tw * 0.3, y - hp - 0.6, tw * 0.45, tw * 0.25, 0, 0, 6.283); c.fill(); }
      // white streaks where the sea birds sit
      if (!st.snow) { c.fillStyle = 'rgba(245,245,240,0.7)'; c.fillRect(tx - tw * 0.4, y - hp + 1, 0.8, hp * 0.3); c.fillRect(tx + tw * 0.5, y - hp + 2, 0.7, hp * 0.2); }
    }
  }
  function foam(c, x, y, w, t, seed) {
    const a = 0.45 + 0.3 * Math.sin(t * 1.4 + seed);
    c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 1.1; c.beginPath(); c.ellipse(x, y + 0.5, w * 1.25 + Math.sin(t * 1.4 + seed) * 0.8, w * 0.55, 0, 0, 6.283); c.stroke();
  }
  function drawStack(c, e, sx, sy, t) {
    const st = stoneOf(e.i), hp = e.h * 4, R = G.Render;
    if (!e.arch) {
      const w = 3.2 + e.h * 0.55;
      foam(c, sx, sy, w, t, e.seed); pillar(c, sx, sy, w, hp, st, e.seed, true);
      if (e.birds) birds(c, sx, sy - hp, t, e.seed);
      return;
    }
    // an arch: two legs along the coast and the span over the water
    const o = R.off(e.ax * 0.55, e.ay * 0.55), w = 3.6 + e.h * 0.5;
    let A = [sx - o[0], sy - o[1]], B = [sx + o[0], sy + o[1]];
    if (A[1] > B[1]) { const tmp = A; A = B; B = tmp; } // (the leg further back first)
    foam(c, A[0], A[1], w, t, e.seed); foam(c, B[0], B[1], w, t, e.seed + 2);
    pillar(c, A[0], A[1], w, hp, st, e.seed, false);
    // the span
    const top = hp + w * 0.2, th = Math.min(hp * 0.38, 7);
    c.fillStyle = G.rgb(st.dark); c.beginPath();
    c.moveTo(A[0] - w * 0.7, A[1] - top); c.lineTo(B[0] + w * 0.7, B[1] - top); c.lineTo(B[0] + w * 0.6, B[1] - top + th);
    c.quadraticCurveTo((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - top + th * 0.7, A[0] - w * 0.6, A[1] - top + th); c.closePath(); c.fill();
    c.fillStyle = G.rgb(st.lit); c.beginPath();
    c.moveTo(A[0] - w * 0.7, A[1] - top); c.lineTo(B[0] + w * 0.7, B[1] - top); c.lineTo(B[0] + w * 0.66, B[1] - top + th * 0.45); c.lineTo(A[0] - w * 0.66, A[1] - top + th * 0.45); c.closePath(); c.fill();
    c.fillStyle = st.snow ? '#eef3f8' : st.green ? '#6f9a4e' : G.rgb(st.lit);
    c.beginPath(); c.moveTo(A[0] - w * 0.6, A[1] - top - 0.6); c.lineTo(B[0] + w * 0.6, B[1] - top - 0.6); c.lineTo(B[0] + w * 0.4, B[1] - top + 1); c.lineTo(A[0] - w * 0.4, A[1] - top + 1); c.closePath(); c.fill();
    pillar(c, B[0], B[1], w, hp, st, e.seed + 1, false);
    if (e.birds) birds(c, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - top - 1, t, e.seed);
  }
  // gulls and cormorants resting on the rock; now and then one takes off
  function birds(c, x, y, t, seed) {
    for (let k = 0; k < 3; k++) {
      const u = (G.hash(seed + k * 13) - 0.5) * 8, ph = (t * 0.07 + G.hash(seed * 3 + k)) % 1;
      if (ph > 0.88) { // circling
        const a = (ph - 0.88) / 0.12 * 6.283; const bx = x + u + Math.cos(a) * 9, by = y - 6 + Math.sin(a) * 3.5;
        c.strokeStyle = '#f4f4f0'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(bx - 2, by - 0.8); c.lineTo(bx, by); c.lineTo(bx + 2, by - 0.8); c.stroke();
      } else {
        const cormorant = G.hash(seed + k) < 0.35;
        c.fillStyle = cormorant ? '#26292e' : '#f6f6f2'; c.beginPath(); c.ellipse(x + u, y - 1.3, 1.1, 1.6, 0, 0, 6.283); c.fill();
        c.fillStyle = cormorant ? '#26292e' : '#f6f6f2'; c.beginPath(); c.arc(x + u + 0.3, y - 3.1, 0.75, 0, 6.283); c.fill();
        c.fillStyle = cormorant ? '#c8a040' : '#e8b440'; c.fillRect(x + u + 0.9, y - 3.2, 0.9, 0.4);
      }
    }
  }
  // a grotto at the foot of a cliff: a dark mouth at the waterline, the sea going in and out of it
  function drawGrotto(c, e, sx, sy, t) {
    const R = G.Render;
    // only when its face looks at the god
    if (R.depth(e.tx + 0.5 + e.dx, e.ty + 0.5 + e.dy) > R.depth(e.tx + 0.5, e.ty + 0.5)) return;
    const ex = e.dx ? e.tx + (e.dx > 0 ? 1 : 0) : 0, ey = e.dy ? e.ty + (e.dy > 0 ? 1 : 0) : 0;
    const a = e.dx ? R.proj(ex, e.ty + 0.12, G.SEA) : R.proj(e.tx + 0.12, ey, G.SEA), b = e.dx ? R.proj(ex, e.ty + 0.88, G.SEA) : R.proj(e.tx + 0.88, ey, G.SEA);
    const hp = Math.min(16, e.h * 4 * 0.6);
    const pt = s => { const k = Math.sqrt(Math.max(0, 1 - Math.pow((s - 0.5) / 0.5, 2))); return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s - hp * k]; };
    c.fillStyle = '#0d1b26'; c.beginPath(); c.moveTo(a[0], a[1]);
    for (let k = 1; k <= 12; k++) { const p = pt(k / 12); c.lineTo(p[0], p[1]); }
    c.closePath(); c.fill();
    // the blue the sun lights under the water, deep inside
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const g = c.createRadialGradient(mx, my, 0.5, mx, my, Math.abs(b[0] - a[0]) * 0.5 + 2);
    g.addColorStop(0, 'rgba(90,210,240,0.85)'); g.addColorStop(1, 'rgba(40,120,170,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(mx, my - 1, Math.abs(b[0] - a[0]) * 0.42 + 1, hp * 0.32 + 0.5, 0, 0, 6.283); c.fill();
    // the rim of the rock, and the wave going in
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k <= 12; k++) { const p = pt(k / 12); if (k) c.lineTo(p[0], p[1] - 0.6); else c.moveTo(p[0], p[1] - 0.6); } c.stroke();
    const w = (t * 0.5 + e.seed * 0.1) % 1;
    c.strokeStyle = `rgba(255,255,255,${0.75 * (1 - w)})`; c.lineWidth = 1; c.beginPath();
    const s0 = 0.18 + w * 0.12, s1 = 0.82 - w * 0.12; const p0 = [a[0] + (b[0] - a[0]) * s0, a[1] + (b[1] - a[1]) * s0 + 1 - w * 2], p1 = [a[0] + (b[0] - a[0]) * s1, a[1] + (b[1] - a[1]) * s1 + 1 - w * 2];
    c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
  }

  // ------------------------------ the tide ------------------------------
  // Twice a day the sea goes out and comes back. On the low shores it leaves a band of wet sand bare
  // (pools among the rocks, the holes of the clams), and at high water it climbs up the beach.
  Sea.tide = function () { const S = G.S; return Math.cos(((S.time || 0) * 2 + (S.day || 0) * 0.13) * Math.PI * 2); }; // 1 high .. -1 low
  Sea.OUT = 0.48; Sea.IN = 0.2;
  Sea.shift = function () { const t = Sea.tide(); return t < 0 ? -t * Sea.OUT : -t * Sea.IN; }; // + bare toward the sea, - water up the beach
  Sea.lowTide = () => Sea.tide() < -0.45;
  // a shore the tide can uncover: a beach or a low bank, not a cliff
  Sea.lowLand = function (j) { const S = G.S; const t = S.type[j]; if (t < T.SAND || S.cliff[j]) return false; return t === T.SAND || W.tileH(j) < G.SEA + 0.55; };
  Sea.tideSegs = []; Sea.tideMask = null;
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function buildTide() {
    const S = G.S; Sea.tideSegs = []; const mask = Sea.tideMask = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; if (S.type[i] !== T.SEA) continue;
      for (let k = 0; k < 4; k++) {
        const [dx, dy] = D4[k], nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue;
        const j = ny * N + nx; if (!Sea.lowLand(j)) continue;
        mask[i] |= 1 << k;
        const e = dx === 1 ? [x + 1, y, x + 1, y + 1] : dx === -1 ? [x, y + 1, x, y] : dy === 1 ? [x + 1, y + 1, x, y + 1] : [x, y, x + 1, y];
        Sea.tideSegs.push([e[0], e[1], e[2], e[3], -dx, -dy, S.type[j] === T.SAND ? 0 : 1, i, j]);
      }
    }
    // The edges join into lines along the shore; each corner moves along the mean of its edges'
    // normals, so the band of the tide is one smooth strip (no notches, no crossings on a staircase coast).
    const segs = Sea.tideSegs, from = new Map(), used = new Uint8Array(segs.length);
    segs.forEach((g, k) => { const key = g[0] * 4096 + g[1]; (from.get(key) || from.set(key, []).get(key)).push(k); });
    const chains = [], to = new Map();
    segs.forEach((g, q) => { const key = g[2] * 4096 + g[3]; (to.get(key) || to.set(key, []).get(key)).push(q); });
    for (let k0 = 0; k0 < segs.length; k0++) {
      if (used[k0]) continue;
      // walk back to where this line begins (or once round a loop)
      let k = k0, guard = 0;
      while (guard++ < segs.length) { const g = segs[k]; const prev = (to.get(g[0] * 4096 + g[1]) || []).find(q => !used[q]); if (prev === undefined || prev === k0) break; k = prev; }
      const ch = []; let cur = k;
      while (cur !== undefined && !used[cur]) {
        used[cur] = 1; ch.push(cur); const g = segs[cur];
        const nx = (from.get(g[2] * 4096 + g[3]) || []).find(q => !used[q]); cur = nx;
      }
      if (!ch.length) continue;
      const P = [[segs[ch[0]][0], segs[ch[0]][1]]]; for (const q of ch) P.push([segs[q][2], segs[q][3]]);
      const Nn = P.map((_, v) => {
        let x = 0, y = 0; if (v > 0) { x += segs[ch[v - 1]][4]; y += segs[ch[v - 1]][5]; } if (v < ch.length) { x += segs[ch[v]][4]; y += segs[ch[v]][5]; }
        const l = Math.hypot(x, y) || 1; return [x / l, y / l];
      });
      chains.push({ P, Nn, segs: ch });
    }
    Sea.tideChains = chains;
  }
  // is this point of a sea tile left dry by the low water?
  Sea.dryAt = function (x, y) {
    if (!Sea.tideMask) return false; const sh = Sea.shift(); if (sh <= 0.02) return false;
    const xi = x | 0, yi = y | 0; if (!W.inb(xi, yi)) return false; const m = Sea.tideMask[yi * N + xi]; if (!m) return false;
    for (let k = 0; k < 4; k++) {
      if (!(m & (1 << k))) continue; const [dx, dy] = D4[k];
      const d = dx === 1 ? xi + 1 - x : dx === -1 ? x - xi : dy === 1 ? yi + 1 - y : y - yi;
      if (d < sh) return true;
    }
    return false;
  };
  // a place on a beach to go down to the water from (for the shellfish, the pools)
  Sea.shellSpot = function (x, y, R) {
    let best = [], R2 = R * R;
    for (const s of Sea.tideSegs) {
      const j = s[8], jx = j % N + 0.5, jy = ((j / N) | 0) + 0.5; const d = G.dist2(jx, jy, x, y); if (d > R2) continue;
      if (G.S.occ[j]) continue;
      best.push([d, s]); 
    }
    if (!best.length) return null;
    best.sort((a, b) => a[0] - b[0]); best = best.slice(0, 6);
    const s = best[Math.floor(G.R() * best.length)][1]; const j = s[8];
    // the edge of the land, at a random place along the shore
    const u = 0.2 + G.R() * 0.6, ex = s[0] + (s[2] - s[0]) * u, ey = s[1] + (s[3] - s[1]) * u;
    return { x: ex - s[4] * 0.12, y: ey - s[5] * 0.12, wx: s[4], wy: s[5], rock: s[6], j };
  };
  // the bare flats and the water climbing the sand, drawn under the foam
  Sea.drawTide = function (c, proj, t, view) {
    if (!Sea.tideSegs.length) return;
    const sh = Sea.shift();
    const SEA = G.SEA, inV = p => p[0] > view[0] - 30 && p[0] < view[2] + 30 && p[1] > view[1] - 30 && p[1] < view[3] + 30;
    const quad = (s, d0, d1) => {
      const a0 = proj(s[0] + s[4] * d0, s[1] + s[5] * d0, SEA), b0 = proj(s[2] + s[4] * d0, s[3] + s[5] * d0, SEA);
      if (!inV(a0)) return false;
      const b1 = proj(s[2] + s[4] * d1, s[3] + s[5] * d1, SEA), a1 = proj(s[0] + s[4] * d1, s[1] + s[5] * d1, SEA);
      c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath(); return true;
    };
    const chains = Sea.tideChains || [];
    // a strip along each line of shore, between two distances from it (per edge, joined at the corners)
    const strip = (pick, d0, d1) => {
      for (const ch of chains) {
        const P = ch.P, Nn = ch.Nn;
        const q0 = proj(P[0][0], P[0][1], SEA); if (!inV(q0) && !inV(proj(P[P.length - 1][0], P[P.length - 1][1], SEA))) continue;
        for (let v = 0; v < ch.segs.length; v++) {
          if (pick && !pick(Sea.tideSegs[ch.segs[v]])) continue;
          const A = P[v], B = P[v + 1], na = Nn[v], nb = Nn[v + 1];
          const a0 = proj(A[0] + na[0] * d0, A[1] + na[1] * d0, SEA), b0 = proj(B[0] + nb[0] * d0, B[1] + nb[1] * d0, SEA);
          const b1 = proj(B[0] + nb[0] * d1, B[1] + nb[1] * d1, SEA), a1 = proj(A[0] + na[0] * d1, A[1] + na[1] * d1, SEA);
          c.moveTo(a0[0], a0[1]); c.lineTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); c.lineTo(a1[0], a1[1]); c.closePath();
        }
      }
    };
    if (sh < 0) { // high water over the sand
      c.fillStyle = 'rgba(104,196,204,0.5)'; c.beginPath(); strip(null, 0, sh); c.fill();
    } else {
      // low water: wet sand, dark wet rock, a shine where the sea just left
      c.fillStyle = 'rgba(174,158,116,0.95)'; c.beginPath(); strip(g => !g[6], -0.03, sh); c.fill();
      c.fillStyle = 'rgba(84,90,76,0.95)'; c.beginPath(); strip(g => g[6], -0.03, sh); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.13)'; c.beginPath(); strip(null, sh * 0.62, sh); c.fill();
    }
    // the foam follows the water's edge
    for (let pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (const ch of chains) {
        const P = ch.P, Nn = ch.Nn;
        const q0 = proj(P[0][0], P[0][1], SEA); if (!inV(q0) && !inV(proj(P[P.length - 1][0], P[P.length - 1][1], SEA))) continue;
        for (let v = 0; v < P.length; v++) {
          const ph = t * (pass ? 0.9 : 1.3) + (P[v][0] + P[v][1]) * 0.8 + pass * 2;
          const off = Math.max(sh, 0) + (sh < 0 ? sh : 0) + (pass ? 0.22 + 0.16 * (0.5 + 0.5 * Math.sin(ph)) : 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(ph)));
          const q = proj(P[v][0] + Nn[v][0] * off, P[v][1] + Nn[v][1] * off, SEA);
          if (v) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]);
        }
      }
      c.strokeStyle = pass ? `rgba(255,255,255,${0.16 + 0.1 * Math.sin(t * 0.9)})` : `rgba(255,255,255,${0.55 + 0.15 * Math.sin(t * 1.3)})`;
      c.lineWidth = pass ? 1 : 1.5; c.lineJoin = 'round'; c.stroke();
    }
    if (sh < 0.16 || G.Render.cam.zoom < 1) return;
    // crabs running sideways over the wet sand
    if (G.Render.cam.zoom > 1.4) {
      c.fillStyle = 'rgba(214,92,52,0.95)'; c.beginPath();
      for (const ch of chains) {
        const P = ch.P, Nn = ch.Nn;
        for (let v = 0; v < P.length - 1; v++) {
          const hsd = G.hash(P[v][0] * 131 + P[v][1] * 71); if (hsd > 0.14) continue;
          const tx = P[v + 1][0] - P[v][0], ty = P[v + 1][1] - P[v][1], run = 0.5 + Math.sin(t * (0.5 + hsd * 3) + hsd * 40) * 0.45, d = sh * (0.3 + hsd * 3);
          const q = proj(P[v][0] + tx * run + Nn[v][0] * d, P[v][1] + ty * run + Nn[v][1] * d, SEA); if (!inV(q)) continue;
          c.moveTo(q[0] + 1.3, q[1]); c.ellipse(q[0], q[1], 1.3, 0.8, 0, 0, 6.283);
          c.moveTo(q[0] - 1.2, q[1] + 0.2); c.lineTo(q[0] - 2.3, q[1] + 0.9); c.lineTo(q[0] - 2.1, q[1] + 1.1); c.lineTo(q[0] - 1, q[1] + 0.5);
          c.moveTo(q[0] + 1.2, q[1] + 0.2); c.lineTo(q[0] + 2.3, q[1] + 0.9); c.lineTo(q[0] + 2.1, q[1] + 1.1); c.lineTo(q[0] + 1, q[1] + 0.5);
        }
      }
      c.fill();
    }
    // pools in the rocks, weed, the little holes the clams breathe through
    for (const s of Sea.tideSegs) {
      const a = proj(s[0], s[1], SEA); if (!inV(a)) continue;
      const i = s[7];
      for (let k = 0; k < 2; k++) {
        const u = 0.15 + G.hash(i * 13 + k * 5 + s[4] * 3) * 0.7, d = sh * (0.25 + G.hash(i * 7 + k + s[5] * 5) * 0.55);
        const p = proj(s[0] + (s[2] - s[0]) * u + s[4] * d, s[1] + (s[3] - s[1]) * u + s[5] * d, SEA);
        if (s[6]) {
          c.fillStyle = k ? 'rgba(70,110,60,0.85)' : 'rgba(126,196,214,0.9)'; c.beginPath(); c.ellipse(p[0], p[1], k ? 2 : 3.2, k ? 0.8 : 1.3, 0, 0, 6.283); c.fill();
        } else {
          c.fillStyle = 'rgba(92,80,56,0.7)'; c.fillRect(p[0], p[1], 0.9, 0.5); c.fillRect(p[0] + 3, p[1] + 0.8, 0.8, 0.45);
        }
      }
    }
  };

  // ------------------------------ ice on the cold seas ------------------------------
  // floes drift with the wind along the frozen coasts, and melt back where the water warms
  Sea.ice = [];
  function coldWater(x, y) { const S = G.S; if (!W.inb(x | 0, y | 0)) return false; const i = (y | 0) * N + (x | 0); return S.type[i] <= T.SEA && temp(i) < 0.2 && Sea.dl[i] <= 7; }
  function buildIce() {
    const S = G.S; Sea.ice = [];
    let cold = 0; for (let i = 0; i < N * N; i++) if (S.type[i] <= T.SEA && temp(i) < 0.2 && Sea.dl[i] <= 7) cold++;
    const n = Math.min(70, Math.round(cold / 26));
    for (let k = 0; k < n; k++) { const f = newFloe(k); if (f) Sea.ice.push(f); }
  }
  function newFloe(k) {
    for (let tr = 0; tr < 40; tr++) {
      const x = Math.random() * N, y = Math.random() * N;
      if (!coldWater(x, y)) continue;
      return { fn: drawFloe, x, y, r: 0.25 + Math.random() * 0.55, seed: Math.floor(Math.random() * 1e6), a: Math.random() * 6.28, k };
    }
    return null;
  }
  Sea.update = function (dt) {
    const S = G.S; if (!S || !S.weather || !Sea.floor) return;
    Sea.tick && Sea.tick(dt);
    if (!Sea.ice.length) return;
    const wa = S.weather.windA || 0, ws = 0.03 + (S.weather.windS || 0) * 0.06;
    for (let k = 0; k < Sea.ice.length; k++) {
      const f = Sea.ice[k];
      const nx = f.x + Math.cos(wa) * ws * dt, ny = f.y + Math.sin(wa) * ws * dt;
      if (coldWater(nx, ny)) { f.x = nx; f.y = ny; f.a += dt * 0.02; }
      else { const g = newFloe(f.k); if (g) Sea.ice[k] = g; }
    }
  };
  function drawFloe(c, f, sx, sy) {
    const z = 16, n = 6;
    c.fillStyle = 'rgba(120,170,200,0.55)'; c.beginPath();
    for (let k = 0; k < n; k++) { const a = f.a + k / n * 6.283, r = f.r * (0.75 + G.hash(f.seed + k) * 0.5); const px = sx + Math.cos(a) * r * z, py = sy + 1.2 + Math.sin(a) * r * z * 0.5; if (k) c.lineTo(px, py); else c.moveTo(px, py); }
    c.closePath(); c.fill();
    c.fillStyle = '#eef6fb'; c.beginPath();
    for (let k = 0; k < n; k++) { const a = f.a + k / n * 6.283, r = f.r * (0.75 + G.hash(f.seed + k) * 0.5); const px = sx + Math.cos(a) * r * z, py = sy - 0.6 + Math.sin(a) * r * z * 0.5; if (k) c.lineTo(px, py); else c.moveTo(px, py); }
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(160,200,225,0.9)'; c.lineWidth = 0.5; c.stroke();
  }
  // the kelp's fronds lie on the water (painted with the water itself, in the cached picture)
  Sea.kelpCanopy = function (c, proj, x, y, i) {
    const p0 = proj(x + 0.5, y + 0.5, G.SEA);
    for (let k = 0; k < 4; k++) {
      const px = p0[0] + (G.hash(i * 17 + k * 7) - 0.5) * 22, py = p0[1] + (G.hash(i * 31 + k * 5) - 0.5) * 10, a = 0.15 + G.hash(i * 3 + k) * 0.5;
      c.fillStyle = 'rgba(98,84,34,0.82)'; c.beginPath(); c.ellipse(px, py, 3, 1.05, a, 0, 6.283); c.ellipse(px + 2.6, py - 0.9, 2.2, 0.8, a - 0.5, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(146,128,54,0.85)'; c.beginPath(); c.ellipse(px + 1.2, py - 0.3, 1.5, 0.5, a, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(186,166,86,0.95)'; c.beginPath(); c.arc(px - 1.8, py + 0.2, 0.55, 0, 6.283); c.fill(); // (the float)
    }
  };
  // a blue hole: a round shaft in the shallows, dark as the abyss, with the reef's rim around it
  function drawHole(c, e, sx, sy) {
    const g = c.createRadialGradient(sx, sy, 1, sx, sy, 15);
    g.addColorStop(0, 'rgba(6,28,84,0.97)'); g.addColorStop(0.55, 'rgba(14,52,124,0.9)'); g.addColorStop(0.85, 'rgba(30,110,170,0.5)'); g.addColorStop(1, 'rgba(60,170,200,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(sx, sy, 16, 8, 0, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(150,236,226,0.35)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(sx, sy, 13.5, 6.75, 0, 0, 6.283); c.stroke();
  }
  // ------------------------------ life in the water ------------------------------
  const FISHC = [['rgba(250,214,70,0.8)', 'rgba(70,150,240,0.8)'], ['rgba(250,140,60,0.8)', 'rgba(240,240,240,0.75)'], ['rgba(120,220,200,0.8)', 'rgba(230,90,140,0.75)']];
  function drawShoal(c, e, sx, sy, t) {
    const cols = e.reef ? FISHC[e.seed % 3] : ['rgba(200,214,226,0.75)', 'rgba(150,170,190,0.7)'];
    const dir = e.seed & 1 ? 1 : -1, n = e.reef ? 7 : 9;
    for (let pass = 0; pass < 2; pass++) {
      c.fillStyle = cols[pass]; c.beginPath();
      for (let k = pass; k < n; k += 2) {
        const a = t * 0.7 * dir + k * 0.85 + e.seed, r = 5 + Math.sin(t * 0.9 + k * 1.7) * 2.2 + (k % 3);
        const px = sx + Math.cos(a) * r * 1.4, py = sy + Math.sin(a) * r * 0.55;
        const ang = Math.atan2(Math.cos(a) * 0.55 * dir, -Math.sin(a) * 1.4 * dir);
        c.moveTo(px + Math.cos(ang) * 1.3, py + Math.sin(ang) * 1.3); c.ellipse(px, py, 1.3, 0.55, ang, 0, 6.283);
      }
      c.fill();
    }
  }
  // ------------------------------ the sea that shines at night ------------------------------
  // On some warm, calm nights every breaking wave lights up blue, and so does the wake of the boats.
  Sea.glowing = function () { const S = G.S; return Sea.glowDay === S.day && S.time > 0.7; };
  const GLOW_SAY = {
    grego: 'Os velhos disseram que era Poseidon passando com seu carro.',
    romano: 'Os áugures disseram que Netuno estava contente.',
    egipcio: 'Os sacerdotes disseram que eram as almas a caminho do Ocidente, com suas lamparinas.',
    asteca: 'Disseram que era o brilho de Chalchiuhtlicue, a da saia de jade.',
    nordico: 'Os velhos chamaram aquilo de fogo do mar e prometeram arenque farto.',
  };
  function glowCheck() {
    const S = G.S;
    if (Sea._glowAsk === S.day || S.time < 0.62 || S.time > 0.7) return;
    Sea._glowAsk = S.day;
    if ((S.weather.rain || 0) > 0.1 || (S.weather.storm || 0) > 0) return;
    const warm = Sea.tideSegs.filter(g => temp(g[7]) > 0.45); if (!warm.length || G.R() > 0.12) return;
    Sea.glowDay = S.day;
    // the first time a people sees it, the chronicle keeps it — and what they made of it
    for (const f of G.Fac.all()) {
      if (f.seaGlow) continue;
      for (const set of S.settlements.values()) {
        if (set.fac !== f.id) continue;
        const g = warm.find(q => Math.abs(q[0] - set.cx) < 9 && Math.abs(q[1] - set.cy) < 9); if (!g) continue;
        f.seaGlow = 1;
        G.Village.log(`Naquela noite o mar diante de ${set.name} se acendeu de azul a cada onda. ${GLOW_SAY[f.civ] || 'Os velhos disseram que eram as almas dos afogados acendendo lanternas.'}`, 'sea', g[0], g[1]);
        for (const v of S.villagers.values()) if (v.set === set.id && !v.dead) v.devotion = Math.min(100, (v.devotion || 0) + 4);
        break;
      }
    }
  }
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.glow = G.renderHooks.glow || [];
  G.renderHooks.glow.push(function (c, proj, view, t, nightF) {
    if (!Sea.floor || G.Render.under || !Sea.glowing() || nightF < 0.3) return;
    const SEA = G.SEA, sh = Sea.shift(), inV = p => p[0] > view[0] - 30 && p[0] < view[2] + 30 && p[1] > view[1] - 30 && p[1] < view[3] + 30;
    for (let pass = 0; pass < 2; pass++) {
      c.beginPath();
      for (const ch of Sea.tideChains || []) {
        if (temp(Sea.tideSegs[ch.segs[0]][7]) <= 0.45) continue;
        const P = ch.P, Nn = ch.Nn; if (!inV(proj(P[0][0], P[0][1], SEA)) && !inV(proj(P[P.length - 1][0], P[P.length - 1][1], SEA))) continue;
        for (let v = 0; v < P.length; v++) {
          const ph = t * 1.3 + (P[v][0] + P[v][1]) * 0.8;
          const off = Math.max(sh, 0) + (sh < 0 ? sh : 0) + 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(ph)) + pass * 0.12;
          const q = proj(P[v][0] + Nn[v][0] * off, P[v][1] + Nn[v][1] * off, SEA);
          if (v) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]);
        }
      }
      c.strokeStyle = pass ? `rgba(40,160,255,${0.22 * nightF})` : `rgba(110,235,255,${(0.55 + 0.3 * Math.sin(t * 1.3)) * nightF})`;
      c.lineWidth = pass ? 5 : 1.8; c.lineJoin = 'round'; c.stroke();
    }
    // the wakes of the boats
    c.strokeStyle = `rgba(110,235,255,${0.5 * nightF})`; c.lineWidth = 1.4; c.beginPath();
    for (const sh2 of G.S.ships) {
      if (!sh2.moving) continue; const fx = sh2.fx || 0, fy = sh2.fy || 0, l = Math.hypot(fx, fy) || 1;
      const a = proj(sh2.x, sh2.y, SEA); if (!inV(a)) continue; const b = proj(sh2.x - fx / l * 1.6, sh2.y - fy / l * 1.6, SEA);
      c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]);
    }
    c.stroke();
  });

  // ------------------------------ the turtles come ashore ------------------------------
  // On a warm beach, on a quiet night, a sea turtle crawls up the sand, digs, lays and goes back.
  // The next evening the little ones break out and run for the water — and the gulls are waiting.
  Sea.nest = null;
  function nestCheck() {
    const S = G.S;
    if (Sea.nest || Sea._nestAsk === S.day || S.time < 0.78 || S.time > 0.86) return;
    Sea._nestAsk = S.day;
    if (G.R() > 0.35) return;
    const cand = Sea.tideSegs.filter(g => !g[6] && temp(g[7]) > 0.56 && !S.occ[g[8]]);
    for (let tr = 0; tr < 12 && cand.length; tr++) {
      const g = cand[Math.floor(G.R() * cand.length)], j = g[8], jx = j % N + 0.5, jy = ((j / N) | 0) + 0.5;
      let busy = false;
      for (const b of S.buildings.values()) if (Math.abs(b.x + b.w / 2 - jx) < 3.5 && Math.abs(b.y + b.h / 2 - jy) < 3.5) { busy = true; break; }
      if (!busy) for (const v of S.villagers.values()) if (!v.inside && Math.abs(v.x - jx) < 3 && Math.abs(v.y - jy) < 3) { busy = true; break; }
      if (busy) continue;
      const u = 0.35 + G.R() * 0.3, ex = g[0] + (g[2] - g[0]) * u, ey = g[1] + (g[3] - g[1]) * u;
      Sea.nest = { id: Math.round(S.clock * 10) + 1, ex, ey, nx: g[4], ny: g[5], x: ex - g[4] * 0.55, y: ey - g[5] * 0.55, st: 'crawl', p: 0, t: 0, hatchDay: S.day + 1, babies: [], kids: [], taken: 0, fn: drawNest };
      return;
    }
  }
  function nestUpdate(dt) {
    const S = G.S, n = Sea.nest; if (!n) return;
    n.t += dt;
    if (n.st === 'crawl') { n.p = Math.min(1, n.p + dt / 22); if (n.p >= 1) { n.st = 'dig'; n.t = 0; } }
    else if (n.st === 'dig') { if (G.R() < dt * 1.5) G.FX && G.FX.dust && G.FX.dust(n.x, n.y, 2); if (n.t > 16) { n.st = 'back'; n.t = 0; n.mound = 1; } }
    else if (n.st === 'back') { n.p = Math.max(0, n.p - dt / 20); if (n.p <= 0) { n.st = 'wait'; n.t = 0; } }
    else if (n.st === 'wait') {
      if (S.day > n.hatchDay + 1) { Sea.nest = null; return; }
      if (S.day >= n.hatchDay && S.time >= 0.645 && S.time < 0.75) startHatch(n);
    } else if (n.st === 'hatch') {
      let left = 0;
      for (const b of n.babies) {
        if (b.done) continue; left++;
        if (n.t < b.delay) continue;
        b.k = Math.min(1, b.k + dt * b.sp);
        if (b.k >= 1) { b.done = 'sea'; G.FX && G.FX.splash && G.FX.splash(b.tx, b.ty, 0.08); }
      }
      // the gulls take a few
      n.gt -= dt;
      if (n.gt <= 0) {
        n.gt = 3 + G.R() * 4;
        const out = n.babies.filter(b => !b.done && n.t >= b.delay && b.k > 0.15 && b.k < 0.9);
        if (out.length && n.taken < Math.max(2, n.babies.length * 0.25)) { const b = out[Math.floor(G.R() * out.length)]; b.done = 'gull'; b.dive = 1; n.taken++; n.dive = { x: n.x + (b.tx - n.x) * b.k, y: n.y + (b.ty - n.y) * b.k, t: 0 }; }
      }
      if (n.dive) { n.dive.t += dt; if (n.dive.t > 1.6) n.dive = null; }
      if (!left || n.t > 60) endHatch(n);
    } else if (n.st === 'done') { if (n.t > 8) Sea.nest = null; }
  }
  function startHatch(n) {
    const S = G.S; n.st = 'hatch'; n.t = 0; n.gt = 4;
    const k = 14 + Math.floor(G.R() * 10);
    for (let q = 0; q < k; q++) {
      const lat = (G.R() - 0.5) * 0.9;
      n.babies.push({ delay: q * 0.7 + G.R() * 0.5, k: 0, sp: 0.07 + G.R() * 0.05, tx: n.ex + n.nx * 0.3 + n.ny * lat, ty: n.ey + n.ny * 0.3 + n.nx * lat, seed: q });
    }
    // the children of the nearest town come running to watch
    let set = null, sd = 16 * 16;
    for (const st of S.settlements.values()) { const d = G.dist2(st.cx, st.cy, n.x, n.y); if (d < sd) { sd = d; set = st; } }
    n.set = set ? set.id : 0;
    if (set) {
      const kids = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 4 && v.age < 15 && !v.inside && !v.sleeping && !v.held && !v.air && !v.dead && G.dist2(v.x, v.y, n.x, n.y) < 18 * 18);
      kids.sort(() => G.R() - 0.5);
      for (const v of kids.slice(0, 5)) {
        const side = (G.R() - 0.5) * 1.6, px = n.x - n.nx * 0.9 + n.ny * side, py = n.y - n.ny * 0.9 + n.nx * side;
        if (G.Vg.give(v, { type: 'olhar', x: px, y: py, fx: n.x, fy: n.y, pri: 1.1, until: S.clock + 55, what: 'tartarugas', ev: n.id })) n.kids.push(v.id);
      }
    }
  }
  function endHatch(n) {
    const S = G.S; n.st = 'done'; n.t = 0;
    const set = S.settlements.get(n.set);
    const sea = n.babies.filter(b => b.done === 'sea').length;
    const kids = n.kids.map(id => S.villagers.get(id)).filter(v => v && !v.dead && v._saw === n.id);
    for (const v of kids) G.Life && G.Life.bio(v, 'note', 'Viu as tartaruguinhas saírem da areia ao entardecer e correrem para o mar');
    if (kids.length && n.taken < 3) { const v = kids[Math.floor(G.R() * kids.length)]; G.Life && G.Life.bio(v, 'note', 'Espantou as gaivotas para as tartaruguinhas chegarem ao mar'); }
    if (set && (kids.length || !S._turtleLog)) {
      S._turtleLog = 1;
      const names = kids.map(v => v.name);
      G.Village.log(`Ao entardecer, na praia perto de ${set.name}, ${n.babies.length} tartaruguinhas saíram da areia e correram para o mar${n.taken ? `; as gaivotas levaram ${n.taken}` : ''}.${names.length ? ' ' + (names.length > 1 ? names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1] + ' viram tudo.' : names[0] + ' viu tudo.') : ''}`, 'sea', n.x, n.y);
    }
    void sea;
  }
  // a turtle on the sand: the shell, the flippers rowing, the head up
  function turtle(c, x, y, s, t, dx, dy, row) {
    const R = G.Render, f = R.sdir(dx, dy);
    const sw = Math.sin(t * (row ? 6 : 3)) * 0.35 * s;
    c.fillStyle = '#4a5a34';
    c.beginPath(); c.ellipse(x - 2.6 * s * f, y + 0.6 * s - sw, 1.6 * s, 0.6 * s, 0.5 * f, 0, 6.283); c.ellipse(x + 2.4 * s * f, y + 0.4 * s + sw, 1.4 * s, 0.55 * s, -0.5 * f, 0, 6.283); c.fill();
    c.beginPath(); c.arc(x + 3.3 * s * f, y - 0.6 * s, 0.9 * s, 0, 6.283); c.fill();
    c.fillStyle = '#6b5a36'; c.beginPath(); c.ellipse(x, y - 0.6 * s, 3 * s, 1.9 * s, 0, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(40,30,16,0.55)'; c.lineWidth = 0.35 * s; c.beginPath(); c.moveTo(x - 1.5 * s, y - 0.6 * s); c.lineTo(x + 1.5 * s, y - 0.6 * s); c.moveTo(x, y - 2.2 * s); c.lineTo(x, y + 1 * s); c.stroke();
  }
  function drawNest(c, n, sx, sy, t) {
    const R = G.Render, SEA = G.SEA;
    // the tracks up the beach and the mound
    if (n.st !== 'crawl' || n.p > 0.05) {
      const a = R.proj(n.ex + n.nx * 0.2, n.ey + n.ny * 0.2, SEA), b = R.proj(n.x, n.y, G.W.groundH(n.x, n.y));
      c.strokeStyle = 'rgba(120,98,64,0.45)'; c.lineWidth = 0.6; c.setLineDash([1, 1.6]);
      const o = R.off(n.ny * 0.12, -n.nx * 0.12);
      c.beginPath(); c.moveTo(a[0] + o[0], a[1] + o[1]); c.lineTo(b[0] + o[0], b[1] + o[1]); c.moveTo(a[0] - o[0], a[1] - o[1]); c.lineTo(b[0] - o[0], b[1] - o[1]); c.stroke(); c.setLineDash([]);
    }
    if (n.mound) { c.fillStyle = 'rgba(214,190,140,0.95)'; c.beginPath(); c.ellipse(sx, sy, 4, 1.8, 0, 0, 6.283); c.fill(); c.fillStyle = 'rgba(180,156,110,0.8)'; c.beginPath(); c.ellipse(sx + 0.6, sy - 0.3, 2.2, 0.8, 0, 0, 6.283); c.fill(); }
    if (n.st === 'crawl' || n.st === 'dig' || n.st === 'back') {
      const px = n.ex + n.nx * 0.25 + (n.x - n.ex - n.nx * 0.25) * n.p, py = n.ey + n.ny * 0.25 + (n.y - n.ey - n.ny * 0.25) * n.p;
      const q = R.proj(px, py, G.W.groundH(px, py));
      const dir = n.st === 'back' ? 1 : -1;
      turtle(c, q[0], q[1], 1.15, t, n.nx * dir, n.ny * dir, n.st !== 'dig');
      if (n.st === 'dig' && Math.sin(t * 5) > 0.6) { c.fillStyle = 'rgba(220,200,150,0.8)'; c.fillRect(q[0] - 4, q[1] - 2, 1, 1); c.fillRect(q[0] + 3, q[1] - 3, 1, 1); }
    }
    if (n.st === 'hatch' || n.st === 'done') {
      for (const b of n.babies) {
        if (b.done || n.t < b.delay) continue;
        const px = n.x + (b.tx - n.x) * b.k, py = n.y + (b.ty - n.y) * b.k;
        const q = R.proj(px, py, Math.max(SEA, G.W.groundH(px, py)));
        turtle(c, q[0], q[1], 0.32, t + b.seed, b.tx - n.x, b.ty - n.y, true);
      }
      // gulls over the beach, one diving
      for (let k = 0; k < 2; k++) {
        const a = t * 0.9 + k * 3.1, gx = sx + Math.cos(a) * 16, gy = sy - 26 + Math.sin(a) * 6;
        c.strokeStyle = '#f4f4f0'; c.lineWidth = 0.9; c.beginPath(); const w = Math.sin(t * 7 + k) * 1.2; c.moveTo(gx - 2.4, gy - w); c.lineTo(gx, gy); c.lineTo(gx + 2.4, gy - w); c.stroke();
      }
      if (n.dive) {
        const q = R.proj(n.dive.x, n.dive.y, G.W.groundH(n.dive.x, n.dive.y)), k = n.dive.t / 1.6, h = (k < 0.5 ? 1 - k * 2 : (k - 0.5) * 2) * 26;
        c.strokeStyle = '#f4f4f0'; c.lineWidth = 1; c.beginPath(); c.moveTo(q[0] - 2.6, q[1] - h - 1.5); c.lineTo(q[0], q[1] - h); c.lineTo(q[0] + 2.6, q[1] - h - 1.5); c.stroke();
      }
    }
  }
  // ------------------------------ a whale on the beach ------------------------------
  // Once in a long while a whale comes ashore and cannot get back. The town nearby goes down with
  // knives and baskets — meat for many days — and the bones stay on the sand for years.
  Sea.carcass = null; Sea.bones = [];
  function strandCheck() {
    const S = G.S;
    if (Sea.carcass || Sea._strandAsk === S.day || S.time < 0.15 || S.time > 0.45) return;
    Sea._strandAsk = S.day;
    if (G.R() > 0.03) return;
    for (const a of S.animals.values()) {
      if (a.kind !== 'whale' || a.dead) continue;
      let best = null, bd = 12 * 12;
      for (const g of Sea.tideSegs) { if (g[6] || S.occ[g[8]]) continue; const d = G.dist2(g[0], g[1], a.x, a.y); if (d < bd) { bd = d; best = g; } }
      if (!best) continue;
      const u = 0.5, ex = best[0] + (best[2] - best[0]) * u, ey = best[1] + (best[3] - best[1]) * u;
      let set = null, sd = 18 * 18; for (const st of S.settlements.values()) { const d = G.dist2(st.cx, st.cy, ex, ey); if (d < sd) { sd = d; set = st; } }
      G.Animals.remove(a);
      Sea.carcass = { fn: drawCarcass, x: ex - best[4] * 0.25, y: ey - best[5] * 0.25, nx: best[4], ny: best[5], meat: 84, max: 84, day: S.day, set: set ? set.id : 0, cut: [] };
      G.Village.log(`Uma baleia encalhou na praia${set ? ' perto de ' + set.name : ''} e não conseguiu voltar ao mar. ${set ? 'O povo desceu com facas e cestos: haverá carne para muitos dias.' : 'Ninguém mora perto: só as gaivotas vieram.'}`, 'sea', ex, ey);
      return;
    }
  }
  function carcassUpdate(dt) {
    const S = G.S, c = Sea.carcass; if (!c) return;
    const set = S.settlements.get(c.set);
    // nobody to cut it: it rots, and the gulls and the crabs take their part
    if (!set || S.day - c.day > 3) c.meat -= dt * 0.02;
    if (set && c.meat > 0) {
      c.ask = (c.ask || 0) - dt;
      if (c.ask <= 0) {
        c.ask = 3;
        let busy = 0; for (const v of S.villagers.values()) if (v.task && v.task.type === 'baleia') busy++;
        if (busy < 6) {
          const cand = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 14 && v.age < 62 && !v.inside && !v.sleeping && !v.held && !v.captive && !v.dead && (!v.task || v.task.pri < 1.05) && G.dist2(v.x, v.y, c.x, c.y) < 22 * 22);
          cand.sort((a, b) => G.dist2(a.x, a.y, c.x, c.y) - G.dist2(b.x, b.y, c.x, c.y));
          for (const v of cand.slice(0, 6 - busy)) {
            const side = (G.R() - 0.5) * 1.4, px = c.x - c.nx * 0.45 + c.ny * side, py = c.y - c.ny * 0.45 + c.nx * side;
            G.Vg.give(v, { type: 'baleia', x: px, y: py, fx: c.x, fy: c.y, pri: 1.05 });
          }
        }
      }
    }
    if (c.meat <= 0) {
      Sea.bones.push({ fn: drawBones, x: c.x, y: c.y, nx: c.nx, ny: c.ny, day: S.day });
      if (Sea.bones.length > 4) Sea.bones.shift();
      Sea.carcass = null;
      if (set) G.Village.log(`Da baleia de ${set.name} só sobraram os ossos na praia. As crianças brincam entre as costelas.`, 'sea', c.x, c.y);
    }
  }
  // a cut of meat for whoever is working on it
  Sea.cutWhale = function (v) {
    const c = Sea.carcass; if (!c || c.meat <= 0) return 0;
    const n = Math.min(3, Math.ceil(c.meat)); c.meat -= n;
    if (c.cut.length < 8) c.cut.push(G.R());
    if (!v._whale) { v._whale = 1; G.Life && G.Life.bio(v, 'note', 'Ajudou a cortar a baleia que encalhou na praia'); }
    return n;
  };
  Sea.whaleAt = () => Sea.carcass;
  // the body along the beach: the axis runs with the shore
  function whaleAxis(o) { const R = G.Render; const ax = -o.ny, ay = o.nx; const h = R.proj(o.x + ax * 0.75, o.y + ay * 0.75, G.W.groundH(o.x, o.y)), t = R.proj(o.x - ax * 0.75, o.y - ay * 0.75, G.W.groundH(o.x, o.y)); return [h, t]; }
  function drawCarcass(c, o, sx, sy, t) {
    const [h, tl] = whaleAxis(o); const k = Math.max(0.35, o.meat / o.max);
    const mx = (h[0] + tl[0]) / 2, my = (h[1] + tl[1]) / 2, ang = Math.atan2(tl[1] - h[1], tl[0] - h[0]), len = Math.hypot(tl[0] - h[0], tl[1] - h[1]);
    c.save(); c.translate(mx, my); c.rotate(ang);
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(0, 3, len * 0.55, 5, 0, 0, 6.283); c.fill();
    // the tail
    c.fillStyle = '#3e4a58'; c.beginPath(); c.moveTo(len * 0.42, -1); c.lineTo(len * 0.62, -6); c.lineTo(len * 0.56, 0); c.lineTo(len * 0.62, 5); c.lineTo(len * 0.42, 1.5); c.closePath(); c.fill();
    // the body, thinner as it is cut
    c.fillStyle = '#4a5868'; c.beginPath(); c.ellipse(-len * 0.02, -2, len * 0.48, 6.5 * k + 1.5, 0, 0, 6.283); c.fill();
    c.fillStyle = '#c9c4b4'; c.beginPath(); c.ellipse(-len * 0.06, 1.2, len * 0.38, 2.6 * k + 0.6, 0, 0, Math.PI); c.fill();
    c.strokeStyle = 'rgba(150,140,128,0.7)'; c.lineWidth = 0.4; c.beginPath(); for (let q = -3; q <= 3; q++) { c.moveTo(-len * 0.3 + q * 3, 1.5); c.lineTo(-len * 0.28 + q * 3, 3.2); } c.stroke();
    c.fillStyle = '#3e4a58'; c.beginPath(); c.ellipse(-len * 0.18, 2, 4, 1.4, 0.6, 0, 6.283); c.fill();
    c.fillStyle = '#1c222a'; c.beginPath(); c.arc(-len * 0.38, -2.2, 0.7, 0, 6.283); c.fill();
    // where it was cut: red, and the white of the ribs showing
    for (let q = 0; q < o.cut.length; q++) { const u = -len * 0.25 + o.cut[q] * len * 0.55; c.fillStyle = '#8a2c2a'; c.fillRect(u - 2, -6 * k - 1, 4, 5 * k + 2); }
    if (k < 0.6) { c.strokeStyle = '#ece6d6'; c.lineWidth = 0.8; c.beginPath(); for (let q = 0; q < 6; q++) { const u = -len * 0.18 + q * len * 0.07; c.moveTo(u, -5 * k); c.quadraticCurveTo(u + 1.5, -8 * k - 2, u + 3, -4 * k); } c.stroke(); }
    c.restore();
    // gulls on it
    for (let q = 0; q < 2; q++) { const ph = (t * 0.1 + q * 0.5) % 1; const gx = mx + (q ? 8 : -6), gy = my - 8 * k - 3; if (ph < 0.7) { c.fillStyle = '#f6f6f2'; c.beginPath(); c.ellipse(gx, gy, 1.2, 1.6, 0, 0, 6.283); c.fill(); c.beginPath(); c.arc(gx + 0.3, gy - 1.9, 0.75, 0, 6.283); c.fill(); } }
  }
  function drawBones(c, o) {
    const [h, tl] = whaleAxis(o);
    const mx = (h[0] + tl[0]) / 2, my = (h[1] + tl[1]) / 2, ang = Math.atan2(tl[1] - h[1], tl[0] - h[0]), len = Math.hypot(tl[0] - h[0], tl[1] - h[1]);
    c.save(); c.translate(mx, my); c.rotate(ang);
    c.strokeStyle = '#efe9da'; c.lineWidth = 1; c.beginPath(); c.moveTo(-len * 0.4, 0); c.lineTo(len * 0.5, 0.5); c.stroke();
    c.lineWidth = 0.9; c.beginPath();
    for (let q = 0; q < 9; q++) { const u = -len * 0.22 + q * len * 0.055; c.moveTo(u, 0); c.quadraticCurveTo(u + 1.2, -6, u + 2.6, -1.5); c.moveTo(u, 0.4); c.quadraticCurveTo(u + 1.2, 4, u + 2.6, 2); }
    c.stroke();
    c.fillStyle = '#e8e2d2'; c.beginPath(); c.ellipse(-len * 0.42, -0.4, 5, 2.4, 0, 0, 6.283); c.fill();
    c.restore();
  }
  Sea.tick = function (dt) { glowCheck(); nestCheck(); nestUpdate(dt); strandCheck(); carcassUpdate(dt); };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { out.sea = { c: Sea.carcass ? Object.assign({}, Sea.carcass, { fn: undefined }) : null, b: Sea.bones.map(b => ({ x: b.x, y: b.y, nx: b.nx, ny: b.ny, day: b.day })), glow: Sea.glowDay }; },
    load(o) {
      Sea._S = G.S; Sea.nest = null;
      const d = o.sea || {};
      Sea.carcass = d.c ? Object.assign({}, d.c, { fn: drawCarcass }) : null;
      Sea.bones = (d.b || []).map(b => Object.assign({ fn: drawBones }, b));
      Sea.glowDay = d.glow === undefined ? -1 : d.glow;
    },
  });

  G.renderHooks.ents.push(function (add, view, zoom) {
    if (!Sea.floor || G.Render.under) return;
    const SEA = G.SEA;
    if (zoom > 1.05) for (const e of Sea.shoals) add(e.x + e.y - 0.45, e, e.x, e.y, SEA);
    if (Sea.nest) add(Sea.nest.x + Sea.nest.y + 0.3, Sea.nest, Sea.nest.x, Sea.nest.y);
    if (Sea.carcass) add(Sea.carcass.x + Sea.carcass.y, Sea.carcass, Sea.carcass.x, Sea.carcass.y);
    for (const b of Sea.bones) add(b.x + b.y - 0.2, b, b.x, b.y);
    for (const e of Sea.stacks) add(e.x + e.y + 0.2, e, e.x, e.y, SEA);
    for (const e of Sea.grottos) add(e.x + e.y - 0.5, e, e.x, e.y, SEA);
    for (const e of Sea.holeE) add(e.x + e.y - 0.6, e, e.x, e.y, SEA);
    for (const f of Sea.ice) add(f.x + f.y - 0.2, f, f.x, f.y, SEA);
  });

  // ------------------------------ how the water looks ------------------------------
  // returns [r,g,b] of the water over a tile and how thick it is (0 clear .. 1 you see nothing)
  const SH = { warm: [72, 216, 204], mild: [92, 196, 204], cold: [104, 168, 172] };
  const MID = { warm: [30, 164, 192], mild: [50, 146, 184], cold: [58, 124, 148] };
  const DEEPC = [38, 104, 152];
  Sea.look = function (i, dlv) {
    const S = G.S; const d = G.SEA - W.tileH(i), tp = temp(i);
    const dl = dlv !== undefined ? dlv : Sea.dl ? Sea.dl[i] : 2;
    let k = G.clamp(Math.max((d - 0.1) / 1.6, (dl - 1) / 3), 0, 1);
    const f = Sea.floor ? Sea.floor[i] : 0;
    // at the edge of the shelf the water is already the open sea's
    if (Sea.edge && Sea.edge[i]) k = Math.max(k, 0.82);
    const sh = tp > 0.58 ? SH.warm : tp < 0.34 ? SH.cold : G.lerpColor(SH.mild, tp > 0.46 ? SH.warm : SH.cold, Math.abs(tp - 0.46) / 0.12 * 0.5);
    const md = tp > 0.58 ? MID.warm : tp < 0.34 ? MID.cold : MID.mild;
    let col = k < 0.5 ? G.lerpColor(sh, md, k * 2) : G.lerpColor(md, DEEPC, (k - 0.5) * 2);
    if (f === F.MUD) col = G.lerpColor(col, [128, 150, 120], 0.35);
    const a = (0.34 + k * k * 0.64) * (f === F.REEF ? 0.82 : 1);
    return [col, a, k];
  };
  // the bottom's own colour, before the water
  const FLOOR = {
    0: { warm: [226, 210, 164], mild: [208, 192, 150], cold: [156, 152, 138] },
    1: { warm: [140, 130, 112], mild: [124, 120, 110], cold: [108, 108, 104] },
    2: { warm: [110, 150, 80], mild: [96, 132, 74], cold: [88, 116, 76] },
    3: { warm: [214, 196, 160], mild: [200, 184, 150], cold: [190, 176, 146] },
    4: { warm: [86, 92, 66], mild: [80, 88, 64], cold: [72, 82, 62] },
    5: { warm: [226, 210, 164], mild: [208, 192, 150], cold: [156, 152, 138] }, // (the hole itself is drawn over it)
    6: { warm: [150, 136, 100], mild: [140, 128, 96], cold: [124, 118, 96] },
  };
  Sea.floorCol = function (i) {
    const tp = temp(i); const f = Sea.floor ? Sea.floor[i] : 0;
    const set = FLOOR[f] || FLOOR[0];
    return tp > 0.58 ? set.warm : tp < 0.34 ? set.cold : set.mild;
  };
  // one colour for the tile seen from far away (the floor through the water)
  Sea.seen = function (i, dlv) {
    const [wc, a] = Sea.look(i, dlv); return G.lerpColor(Sea.floorCol(i), wc, a);
  };

  // ------------------------------ the god taps the sea ------------------------------
  const THING = {
    recife: ['Recife de coral', 'Mar quente e raso', 'Bichos minúsculos constroem casas de pedra uns sobre os outros, por milhares de anos, até virar uma floresta colorida debaixo d\'água. Metade dos peixes do mar nasce num recife.'],
    kelp: ['Floresta de kelp', 'Mar frio', 'Algas gigantes que sobem das pedras do fundo até a luz, presas por boias cheias de ar. Os peixes se escondem entre os talos e as focas vêm caçá-los ali.'],
    capim: ['Pradaria de algas', 'Água calma', 'Um campo verde no fundo do mar, onde as tartarugas pastam e os cavalos-marinhos se seguram pelo rabo.'],
    pedra: ['Fundo de pedra', 'Costão', 'Pedras cobertas de algas, ouriços e mariscos. As ondas batem e o mar fica branco.'],
    areia: ['Fundo de areia', 'Raso', 'As ondas desenham a areia em sulcos. Conchas, estrelas-do-mar, um caranguejo enterrado até os olhos.'],
    lama: ['Lama do rio', 'Onde o rio chega ao mar', 'O rio traz a terra das montanhas e larga tudo aqui: a água fica turva e cheia de comida — e os peixes vêm atrás.'],
    buraco: ['Buraco azul', 'Ninguém sabe o fundo', 'Um poço redondo no meio do raso, azul-escuro como a noite. Era uma caverna, de quando o mar era mais baixo; o mar subiu e entrou. Os pescadores evitam passar por cima.'],
    pilar: ['Pilar de pedra', 'O que sobrou da costa', 'A costa já chegou até aqui. O mar comeu a pedra mole em volta e deixou de pé a parte dura — um dia ele cai também. As aves do mar fazem ninho lá em cima, onde nada as alcança.'],
    arco: ['Arco de pedra', 'O mar furou a rocha', 'As ondas cavaram uma gruta de cada lado da ponta, até as duas se encontrarem: uma porta no meio do mar. Quando o teto cair, sobram dois pilares.'],
    gruta: ['Gruta marinha', 'O mar entra na rocha', 'Com o mar calmo dá para entrar de barco. Lá dentro, a luz do sol passa por baixo d\'água e acende tudo de azul; quando a onda entra, a gruta ronca.'],
    baleia: ['Baleia encalhada', 'Na praia', 'Veio dar na areia e não conseguiu voltar ao mar. O povo corta a carne em pedaços e leva em cestos; as gaivotas brigam pelo resto.'],
    ossada: ['Ossada de baleia', 'O que o mar deixou', 'As costelas brancas na areia, maiores que uma casa. Os velhos lembram do dia em que ela encalhou; as crianças brincam de esconder entre os ossos.'],
    ninho: ['Ninho de tartaruga', 'Debaixo da areia', 'Uma tartaruga-marinha subiu a praia de noite, cavou e pôs os ovos aqui. Ao entardecer, os filhotes vão sair e correr para o mar.'],
    gelo: ['Gelo à deriva', 'Mar gelado', 'Placas de gelo que se soltaram da costa e andam com o vento. As focas sobem nelas para descansar, longe dos ursos — quase sempre.'],
  };
  const FLOOR_THING = ['areia', 'pedra', 'capim', 'recife', 'kelp', 'buraco', 'lama'];
  Sea.pickThing = function (x, y, zoom) {
    if (!Sea.floor) return null;
    const near = (o, r) => G.dist(o.x, o.y, x, y) < r;
    for (const e of Sea.stacks) if (near(e, e.arch ? 0.9 : 0.6)) return { isSeaThing: 1, kind: e.arch ? 'arco' : 'pilar', name: e.name, x: e.x, y: e.y };
    for (const e of Sea.grottos) if (near(e, 0.7)) return { isSeaThing: 1, kind: 'gruta', name: e.name, x: e.x, y: e.y };
    for (const e of Sea.holeE) if (near(e, 0.8)) return { isSeaThing: 1, kind: 'buraco', x: e.x, y: e.y };
    for (const f of Sea.ice) if (near(f, f.r + 0.2)) return { isSeaThing: 1, kind: 'gelo', x: f.x, y: f.y };
    if (Sea.carcass && near(Sea.carcass, 0.9)) return { isSeaThing: 1, kind: 'baleia', x: Sea.carcass.x, y: Sea.carcass.y };
    for (const b of Sea.bones) if (near(b, 0.9)) return { isSeaThing: 1, kind: 'ossada', x: b.x, y: b.y, day: b.day };
    if (Sea.nest && near(Sea.nest, 0.6)) return { isSeaThing: 1, kind: 'ninho', x: Sea.nest.x, y: Sea.nest.y };
    // the bottom itself, only from close (a tap on the open water still closes the panels)
    if (zoom < 1.9) return null;
    const xi = x | 0, yi = y | 0; if (!W.inb(xi, yi)) return null; const i = yi * N + xi;
    if (G.S.type[i] !== T.SEA) return null;
    const k = FLOOR_THING[Sea.floor[i]]; if (k === 'areia' || k === 'pedra') return null;
    return { isSeaThing: 1, kind: k, x: xi + 0.5, y: yi + 0.5 };
  };
  Sea.owns = o => !!(o && o.isSeaThing);
  Sea.inspectorHTML = function (o) {
    const th = THING[o.kind] || ['?', '', ''];
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    return `<div class="insp-head"><div class="insp-title"><h3>${esc(o.name ? G.cap(o.name) : th[0])}</h3><div class="sub">${o.name ? th[0] + ' · ' : ''}${th[1]}</div></div><button class="x" data-act="close">${G.ICON.close}</button></div><div class="doing">${th[2]}</div>`;
  };
  Sea.describe = function (i) {
    if (!Sea.floor || G.S.type[i] !== T.SEA) return null;
    return Sea.NAME[Sea.floor[i]];
  };
})(window.G = window.G || {});
