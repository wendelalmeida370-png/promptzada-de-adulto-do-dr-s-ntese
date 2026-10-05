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
    // what floats: the kelp's canopy, the ice of the cold seas
    Sea.holeE = Sea.holes.map(h => ({ fn: drawHole, x: h.x + 0.5, y: h.y + 0.5, i: h.i }));
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
    const S = G.S; if (!Sea.ice.length || !S.weather) return;
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
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ents.push(function (add, view, zoom) {
    if (!Sea.floor || G.Render.under) return;
    const SEA = G.SEA;
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
