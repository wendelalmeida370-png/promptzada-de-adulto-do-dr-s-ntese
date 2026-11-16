'use strict';
// ============================================================
//  Gait: how a person walks, jogs and runs — the stride as real
//  people take it at each speed (20a, D-340). Pure: numbers in,
//  a pose out; no world, no chance, no drawing (it is in the
//  guard's list of what only is seen — rule 113).
//  The speed (m/s) gives the cadence (steps a minute) as gait
//  studies measure it — a walk of 1.4 m/s at ~115, a jog of
//  3 m/s at ~162 —, the stride is what that speed and cadence
//  leave (no cap), and the switch from the walk to the jog is
//  where people switch (~2.2 m/s), with a margin each way. A
//  body smaller than a grown one moves as a grown one would at
//  the same Froude number (v / √leg). The legs are the keys of
//  real gait curves (hip, knee, foot pitch through the cycle),
//  scaled until the foot on the ground travels under the body
//  exactly as far as the body goes over it; the hips, the
//  trunk, the arms and the head follow the phase directly —
//  computed every frame from it, never filtered.
//  Phase u: 0..1 per stride, 0 = the left heel striking; the
//  right leg half a stride behind.
// ============================================================
(function (G) {
  const Ga = G.Gait = {};
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ------------------------------ cadence, stride, duty ------------------------------
  // (speeds normalized to a grown body: v̂ = v / √s, s = height / 1.75 — Froude similarity: a child at the same v̂ moves as an adult)
  // the walk: cadence rising with speed (≈ 97 at 0.8 m/s, 115 at 1.4, 134 at 2.0); the run: 158 at 2.5, 162 at 3, 183 at 6
  Ga.cadWalk = v => 72 + 31 * v;
  Ga.cadRun = v => 141 + 7 * v;
  // (the walk to the jog where people switch, ~2.2 m/s: up past 2.3, down under 2.05 — one stride's crossfade between)
  Ga.UP = 2.3; Ga.DOWN = 2.05;
  // the share of a stride each foot stands: the walk ~0.62 (more at a stroll), the run ~0.39 at a jog to 0.27 at a sprint
  Ga.dutyWalk = v => clamp(0.66 - 0.03 * v, 0.58, 0.66);
  Ga.dutyRun = v => clamp(0.47 - 0.033 * v, 0.25, 0.42);
  // steps a minute at speed v (m/s) for size s, the run's weight w (0 walk .. 1 run)
  Ga.cadence = (v, s, w) => { const k = Math.sqrt(s || 1), n = Math.max(0, v) / k; return lerp(Ga.cadWalk(n), Ga.cadRun(n), w || 0) / k; };
  // strides a second (one stride = two steps)
  Ga.freq = (v, s, w) => Ga.cadence(v, s, w) / 120;
  Ga.duty = (v, s, w) => { const n = Math.max(0, v) / Math.sqrt(s || 1); return lerp(Ga.dutyWalk(n), Ga.dutyRun(n), w || 0); };
  // the gait a speed is in, from the one it was in (the margin each way: no flicker at the edge)
  Ga.mode = (run, v, s) => { const n = v / Math.sqrt(s || 1); return run ? n > Ga.DOWN : n > Ga.UP; };

  // ------------------------------ the curves ------------------------------
  // Keys in degrees through one leg's stride from its heel strike (the hip: minus is forward; the knee: its bend; the foot: its
  // pitch to the ground, plus is the toes down — the ankle is what makes it). The walk stands until 0.62 of it (the keys' own
  // toe-off: a speed's own duty is a warp of them), the run until 0.38 and flies between its steps. From gait laboratories'
  // normative curves (the shape; the numbers are the rig's).
  const K = {
    walk: {
      hip: [[0, -27], [0.15, -20], [0.3, -7], [0.45, 7], [0.58, 15], [0.66, 10], [0.78, -12], [0.87, -29], [0.94, -30.5], [1, -27]],
      knee: [[0, 6], [0.12, 17], [0.27, 9], [0.42, 5], [0.52, 10], [0.62, 34], [0.71, 60], [0.79, 55], [0.87, 28], [0.94, 10], [1, 6]],
      foot: [[0, -16], [0.06, -4], [0.12, 0], [0.4, 0], [0.5, 14], [0.58, 40], [0.63, 52], [0.7, 36], [0.78, 13], [0.86, -4], [0.95, -14], [1, -16]],
      toe: 0.62,
      // (a slow stride's knee, late in its swing: it straightens later — the short step has the hips high over a straight leg, and
      // the heel would meet the ground early)
      kneeSlow: [[0, 6], [0.12, 17], [0.27, 9], [0.42, 5], [0.52, 10], [0.62, 34], [0.71, 60], [0.79, 60], [0.9, 40], [0.96, 16], [1, 6]],
    },
    run: {
      hip: [[0, -30], [0.12, -15], [0.26, 4], [0.38, 19], [0.5, 10], [0.66, -26], [0.82, -44], [0.93, -36], [1, -30]],
      knee: [[0, 20], [0.11, 40], [0.25, 26], [0.38, 14], [0.5, 62], [0.62, 104], [0.74, 96], [0.86, 52], [0.95, 24], [1, 20]],
      foot: [[0, -6], [0.08, 0], [0.22, 4], [0.32, 18], [0.4, 44], [0.5, 32], [0.66, 6], [0.84, -8], [1, -6]],
      toe: 0.38,
    },
  };
  Ga.KEYS = K;
  // (each curve sampled round its cycle, radians — a periodic Catmull-Rom through its keys)
  const N = 256, T = {};
  for (const g in K) { T[g] = {}; for (const c of ['hip', 'knee', 'foot', 'kneeSlow']) { const k = K[g][c]; if (!k) continue; const out = new Float32Array(N + 1);
    for (let i = 0; i <= N; i++) { const u = i / N; let j = 0; while (j < k.length - 2 && k[j + 1][0] <= u) j++;
      const P = q => k[(q + k.length - 1) % (k.length - 1)]; const p0 = P(j - 1), p1 = k[j], p2 = k[j + 1], p3 = P(j + 2);
      const t = (u - p1[0]) / Math.max(1e-6, p2[0] - p1[0]), t2 = t * t, t3 = t2 * t;
      out[i] = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3) * D2R; }
    T[g][c] = out; } }
  const cur = (A, u) => { u -= Math.floor(u); const x = u * N, i = x | 0, f = x - i; return A[i] + (A[i + 1] - A[i]) * f; };
  // (a speed's duty read as a warp of the keys' own: its toe-off lands on the keys' toe-off)
  const warp = (u, duty, toe) => { u -= Math.floor(u); return u < duty ? u * toe / duty : toe + (u - duty) * (1 - toe) / (1 - duty); };
  Ga.warp = warp;

  // ------------------------------ the legs' measures (the rig's own: People3D, BODYMESH) ------------------------------
  const BM = G.BODYMESH || {};
  const LEG = Ga.LEG = { hipX: 0.095, hipY: -0.04, L1: 0.44, L2: BM.shin || 0.4, fz: 0.02, sole: 0.044, heel: 0.062, ball: 0.122, pel: 0.92 };
  // the sagittal reach of a leg (the pelvis's frame, body units): the ankle, the heel and the ball for hip, knee, ankle angles
  // (the same chain the rig makes: hip → 0.44 → knee → 0.4 (+0.02 forward) → ankle → the sole under it)
  const FK = { ay: 0, az: 0, hy: 0, hz: 0, by: 0, bz: 0 };
  // (a point (0, y, z) of a frame pitched by a: y cos a − z sin a, y sin a + z cos a — the rig's Rx, plus is the toes down)
  function fk(hp, kn, an, pp) {
    const a1 = hp + pp, a2 = a1 + kn, a3 = a2 + an;
    const ky = LEG.hipY * Math.cos(pp) - LEG.L1 * Math.cos(a1), kz = LEG.hipY * Math.sin(pp) - LEG.L1 * Math.sin(a1);
    FK.ay = ky - LEG.L2 * Math.cos(a2) - LEG.fz * Math.sin(a2); FK.az = kz - LEG.L2 * Math.sin(a2) + LEG.fz * Math.cos(a2);
    const c = Math.cos(a3), s = Math.sin(a3); // (the foot's frame: the sole under the ankle, the heel behind it, the ball before)
    FK.hy = FK.ay - LEG.sole * c + LEG.heel * s; FK.hz = FK.az - LEG.sole * s - LEG.heel * c;
    FK.by = FK.ay - LEG.sole * c - LEG.ball * s; FK.bz = FK.az - LEG.sole * s + LEG.ball * c;
    return FK;
  }
  // (the pelvis's own tilt forward: a walk's few degrees, the run's more — the thighs hang from it)
  const pelPitch = (n, w) => lerp(0.03 + 0.01 * Math.min(n, 2.5), 0.1, w);
  Ga.pelPitch = pelPitch;
  Ga.fk = fk;

  // ------------------------------ the stride's own scale ------------------------------
  // (how much of the keys' hip swing a speed needs: the foot standing on the ground travels under the body from the heel's
  // strike to the ball's push-off — the body must go, meanwhile, from over the one to over the other: v · duty / f)
  // (the hip's swing forward is not the stance's reach: a long stance — a run's — needs the thigh far back and well forward at
  // the strike, but the swing's own peak in between is held to what people swing a thigh to (~40° walking, ~60° running))
  const hipScale = (g, A, q) => { const cap = g === 'run' ? 1.36 : 1.25; if (A <= cap) return A; const t = sstep(K[g].toe, K[g].toe + 0.12, q) * (1 - sstep(0.88, 1, q)); return lerp(A, cap, t); };
  // (the knee's swing folds more as the speed grows; the run's knee on the ground stays a spring of ~40°, whatever the speed)
  const kneeSw = (g, n) => (g === 'run' ? clamp(66 + 10 * n, 84, 118) / 104 : clamp(48 + 7 * n, 52, 66) / 60);
  const kneeScale = (g, n, q) => { const a = kneeSw(g, n); if (g !== 'run' || q === undefined) return a; const t = sstep(K.run.toe - 0.06, K.run.toe + 0.08, q); return lerp(clamp(0.92 + 0.03 * n, 0.95, 1.05), a, t); };
  const footScale = (g, A) => (g === 'run' ? clamp(0.7 + 0.3 * A, 0.7, 1.15) : clamp(0.25 + 0.65 * A, 0.45, 1.2)); // (a slow step lands flatter)
  function travel(g, A, n) {
    const C = T[g], ks = kneeScale(g, n), toe = K[g].toe, pp = pelPitch(n, g === 'run' ? 1 : 0);
    const at = (u, heel) => { const hp = cur(C.hip, u) * A, kn = cur(C.knee, u) * kneeScale(g, n, u), pit = cur(C.foot, u) * footScale(g, A); fk(hp, kn, pit - hp - kn - pp, pp); return heel ? FK.hz : FK.bz; };
    return at(0, true) - at(toe, false) + LEG.heel + LEG.ball;
  }
  Ga.travel = travel;
  const AMP = { walk: new Map(), run: new Map() };
  // the hip swing for normalized speed n (cached by 1 cm/s)
  Ga.amp = function (g, n) {
    const key = Math.round(n * 100); let A = AMP[g].get(key); if (A !== undefined) return A;
    const w = g === 'run' ? 1 : 0, need = Math.max(0, n) * Ga.duty(n, 1, w) / Ga.freq(n, 1, w);
    let lo = 0, hi = 2.2; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (travel(g, m, n) < need) lo = m; else hi = m; }
    A = (lo + hi) / 2; AMP[g].set(key, A); if (AMP[g].size > 2000) AMP[g].clear(); return A;
  };

  // ------------------------------ the hips' height ------------------------------
  // In each moment of the stride, how high the hips are: as high as the leg on the ground lets them be — its own curve's knee,
  // the heel or the ball under it —, no higher than standing; in the run's flight, an arc from the push-off to the next strike.
  // A table a speed (body units, the bend below standing: ≤ 0), made once
  const HT = { walk: new Map(), run: new Map() }, NH = 64;
  function heightTable(g, n) {
    const C = T[g], A = Ga.amp(g, n), ks = kneeScale(g, n), fs = footScale(g, A), w = g === 'run' ? 1 : 0, duty = Ga.duty(n, 1, w), toe = K[g].toe, pp = pelPitch(n, w);
    const need = new Float32Array(NH), has = new Uint8Array(NH), out = new Float32Array(NH + 1);
    // (the walk: each standing foot where it struck — its heel where the stride's own strike put it, gone back under the body as
    // far as the body went on — and the leg reaching it with the knee a little bent, the heel rising as far as it must, as the
    // rig's feet do; the run: its legs as the curves bend them, the knee's spring in the stance)
    const f = Ga.freq(n, 1, w); let hz0 = 0;
    if (g === 'walk') { const hp = cur(C.hip, 0) * A, kn = cur(C.knee, 0) * ks, pit = cur(C.foot, 0) * fs; fk(hp, kn, pit - hp - kn - pp, pp); hz0 = FK.hz; }
    for (let i = 0; i < NH; i++) {
      const u = i / NH; let lo = -1e9, top = 1e9;
      for (let k = 0; k < 2; k++) {
        const uu = (u + k * 0.5) % 1; if (uu >= duty) continue;
        const q = warp(uu, duty, toe); const hp = cur(C.hip, q) * hipScale(g, A, q), kn = cur(C.knee, q) * kneeScale(g, n, q), pit = cur(C.foot, q) * fs; has[i] = 1;
        // (the hips' own turn brings the hip of the leg in front forward, and the other back: L·sin of it)
        if (g === 'walk') { const sd = k ? -1 : 1, py = -(0.035 + 0.04 * Math.min(n, 2.2)) * Math.cos(TAU * u); top = Math.min(top, plantedTop(hz0 - n * uu / f + sd * LEG.hipX * Math.sin(py), pit)); continue; }
        fk(hp, kn, pit - hp - kn - pp, pp); const foot = Math.min(FK.hy, FK.by); lo = Math.max(lo, foot);
      }
      need[i] = !has[i] ? 0 : g === 'walk' ? Math.min(0, top - LEG.pel) : Math.min(0, -(LEG.pel + lo));
    }
    // (no foot on the ground: an arc from the push-off's height to the next strike's, rising over it as a leap does)
    for (let i = 0; i < NH; i++) if (!has[i]) {
      let a = i, b = i; while (!has[(a + NH - 1) % NH] && a > i - NH) a--; while (!has[(b + 1) % NH] && b < i + NH) b++;
      const ha = need[(a - 1 + NH) % NH], hb = need[(b + 1) % NH], t = (i - a + 1) / (b - a + 2), fl = (b - a + 1) / NH / Ga.freq(n, 1, w);
      need[i] = Math.min(0, lerp(ha, hb, t) + 0.5 * 9.8 * fl * fl * t * (1 - t) * 0.5);
    }
    for (let i = 0; i < NH; i++) { let v = 0; for (let d = -2; d <= 2; d++) v += need[(i + d + NH) % NH] * [0.1, 0.2, 0.4, 0.2, 0.1][d + 2]; out[i] = v; }
    // (the walk's hips go up and down as an inverted pendulum's: a smooth wave twice a stride, highest over the standing foot and
    // lowest as the weight passes from one foot to the other — never above what the legs allow. The bare limit has a corner at
    // each strike, where the heel would come down onto the ground from above it, L-1103)
    if (g === 'walk') {
      let lo = 0, il = 0, hi = -1e9; for (let i = 0; i < NH; i++) { if (out[i] < lo) { lo = out[i]; il = i; } hi = Math.max(hi, out[i]); }
      const ul = (il / NH) % 0.5; for (let i = 0; i < NH; i++) out[i] = Math.min(out[i], lo + (hi - lo) * (0.5 - 0.5 * Math.cos(TAU * 2 * (i / NH - ul))));
    }
    out[NH] = out[0]; return out;
  }
  // (how high the pelvis may be over a foot standing with its heel hz (the hip's frame: forward +) at the stride's pitch p — rolled
  // further onto its ball as far as it helps, for a foot behind the hip: the leg's reach with the knee a little bent)
  const L2E = Math.hypot(LEG.L2, LEG.fz), REACH = Math.sqrt(LEG.L1 * LEG.L1 + L2E * L2E + 2 * LEG.L1 * L2E * Math.cos(0.1)), SIDE = LEG.hipX - 0.045;
  function plantedTop(hz, p) {
    let best = -1e9;
    for (let q = p, it = 0; it < 14; it++, q = Math.max(q, 0) + 0.07) {
      const c = Math.cos(q), sn = Math.sin(q); let az, ay;
      if (q <= 0) { az = hz + LEG.sole * sn + LEG.heel * c; ay = LEG.sole * c - LEG.heel * sn; }
      else { az = hz + LEG.heel + LEG.ball + LEG.sole * sn - LEG.ball * c; ay = LEG.sole * c + LEG.ball * sn; }
      const r2 = REACH * REACH - az * az - SIDE * SIDE; const h = r2 > 0 ? ay + Math.sqrt(r2) - LEG.hipY : -1e9;
      if (h > best) best = h; if (hz > 0 || q >= 1) break;
    }
    return best;
  }
  Ga.height = function (g, n, u) {
    const key = Math.round(n * 20); let t = HT[g].get(key); if (!t) { t = heightTable(g, key / 20); HT[g].set(key, t); if (HT[g].size > 400) HT[g].clear(); }
    u -= Math.floor(u); const x = u * NH, i = x | 0, f = x - i; return t[i] + (t[i + 1] - t[i]) * f;
  };

  // ------------------------------ the pose of a stride ------------------------------
  // writes into `out` (a pose: People3D's POSE0 fields) the legs, the hips, the trunk, the arms and the head of a stride at
  // phase u, speed v (m/s), size s, the run's weight w (0..1, blended phase to phase); o: { lean, arms } extra (a load's
  // stillness of the arms: 0..1 of the swing kept). Each leg's stance (stL, stR: 1 standing on it), its pitch to the ground
  // (pitL, pitR), how far its swing has come (swL, swR: 0 at the push-off .. 1 at the strike; −1 standing) for the rig's feet
  const LG = { hp: 0, kn: 0, pit: 0, st: 0, sw: 0 };
  function leg(g, u, n, A, duty) {
    const C = T[g], q = warp(u, duty, K[g].toe); u -= Math.floor(u);
    const slow = C.kneeSlow ? clamp((1.25 - n) / 0.65, 0, 1) : 0;
    LG.hp = cur(C.hip, q) * hipScale(g, A, q); LG.kn = (slow ? lerp(cur(C.knee, q), cur(C.kneeSlow, q), slow) : cur(C.knee, q)) * kneeScale(g, n, q); LG.pit = cur(C.foot, q) * footScale(g, A);
    LG.st = u < duty ? 1 : 0; LG.sw = u < duty ? -1 : (u - duty) / (1 - duty);
    return LG;
  }
  Ga.pose = function (out, u, v, s, w, o) {
    s = s || 1; w = clamp(w || 0, 0, 1); const n = Math.max(0, v) / Math.sqrt(s);
    const dW = Ga.dutyWalk(n), dR = Ga.dutyRun(n), duty = lerp(dW, dR, w);
    const AW = w < 1 ? Ga.amp('walk', n) : 0, AR = w > 0 ? Ga.amp('run', n) : 0;
    const c1 = Math.cos(TAU * u), s1 = Math.sin(TAU * u);
    // (the hips: as high as the standing leg lets them; turning forward with the leg that swings forward; dropping on the side of
    // the swing; over the standing foot)
    const hW = w < 1 ? Ga.height('walk', n, u) : 0, hR = w > 0 ? Ga.height('run', n, u) : 0;
    out.bob = lerp(hW, hR, w);
    out.pelY = -lerp(0.035 + 0.04 * Math.min(n, 2.2), 0.07 + 0.012 * n, w) * c1;
    out.pelR = lerp(0.035 + 0.02 * Math.min(n, 2), 0.04, w) * Math.sin(TAU * (u + 0.1));
    out.shift = lerp(clamp(0.032 - 0.007 * n, 0.012, 0.03), 0.012, w) * s1;
    out.pelP = pelPitch(n, w); out.rel = lerp(0.33, 0.5, w); // (the share of the swing in which the foot leaves its push-off's place)
    out.esw = w > 0.5 ? 0.93 : lerp(0.74, 0.9, clamp((n - 0.6) / 0.6, 0, 1)); // (how late in its swing a heel that meets the ground is a strike: a walk's near its end — a slow one's earlier, its short swing down sooner —; a run strikes on its stance)
    const pp = out.pelP, width = lerp(0.045, 0.026, w);
    for (let k = 0; k < 2; k++) {
      const uk = u + k * 0.5; let hp = 0, kn = 0, pit = 0;
      // (each gait on its own duty — their curves blended, phase to phase: a walk becoming a run never jumps its legs)
      if (w < 1) { const L = leg('walk', uk, n, AW, dW); hp = L.hp; kn = L.kn; pit = L.pit; }
      if (w > 0) { const L = leg('run', uk, n, AR, dR); hp = lerp(hp, L.hp, w); kn = lerp(kn, L.kn, w); pit = lerp(pit, L.pit, w); }
      const uu = uk - Math.floor(uk), st = uu < duty ? 1 : 0, sw = st ? -1 : (uu - duty) / (1 - duty);
      // (the swinging foot clears the ground: the knee folds a little more where the curve would drag the heel or the toes — a
      // slow stride's short swing — and lets it come down only at the strike)
      if (!st && w < 1) {
        // (a slow stride's short swing folds the knee a little more through its middle — smoothly, by the speed — and the heel
        // comes down to its strike late in it, meeting the ground as a strike)
        const lo = clamp((1.3 - n) / 0.7, 0, 1); if (lo > 0) kn += 28 * D2R * lo * (1 - w) * Math.pow(Math.sin(Math.PI * clamp((sw - 0.05) / 0.8, 0, 1)), 2);
      }
      // (the feet a little toed out, and set in toward the line the body walks on: the steps 9 cm apart walking, 5 running — the
      // hips are 19 cm apart; the leg turned in at the hip by what the hips' own shift and drop do not already do, the swing
      // leg a touch wider as it passes the other)
      const sd = k ? -1 : 1, off = sd * (width + (st ? 0 : 0.012 * Math.sin(Math.PI * sw))) - (out.shift + sd * LEG.hipX), roll = Math.asin(clamp(off / 0.84, -0.35, 0.35));
      const ad = -sd * (roll - out.pelR);
      if (k) { out.hipR = hp; out.knR = kn; out.anR = pit - hp - kn - pp; out.stR = st; out.pitR = pit; out.swR = sw; out.pgR = st ? uu / duty : -1; out.adR = ad; out.hyR = -out.pelY; out.tyR = -0.07; }
      // (the leg's swing turned against the hips' own turn: it swings the way the body goes; the foot a little toed out, turned
      // about the thigh's own length)
      else { out.hipL = hp; out.knL = kn; out.anL = pit - hp - kn - pp; out.stL = st; out.pitL = pit; out.swL = sw; out.pgL = st ? uu / duty : -1; out.adL = ad; out.hyL = -out.pelY; out.tyL = 0.07; }
    }
    out.sway = 0; out.twist = 0; out.crouch = 0;
    // (the trunk: a little forward with the speed, more in the run; the head kept level and still over it)
    const lean = lerp(0.035 + 0.02 * n, 0.12 + 0.025 * n, w) + ((o && o.lean) || 0);
    out.lean = lean + lerp(0.008, 0.02, w) * Math.cos(TAU * 2 * (u - 0.05));
    out.neck = -lean * 0.75 + 0.05;
    // (the arms against the legs, a beat behind, swinging more as the speed grows; the elbow bending as the arm comes forward;
    // the run's elbows bent near a right angle, pumping, the hands toward the middle)
    const kA = o && o.arms !== undefined ? o.arms : 1;
    const aw = lerp(0.12 + 0.17 * Math.min(n, 2.4), 0.45 + 0.05 * Math.min(n, 6), w) * kA, ab = lerp(0.06, 0.2, w);
    const aL = Math.cos(TAU * (u - 0.5 - 0.04)), aR = Math.cos(TAU * (u - 0.04));
    out.shLp = -aL * aw + ab; out.shRp = -aR * aw + ab;
    out.shLr = lerp(0.09, 0.08 - 0.06 * Math.max(0, aL), w); out.shRr = -lerp(0.09, 0.08 - 0.06 * Math.max(0, aR), w);
    const eW = 0.2 + 0.08 * n, eF = 0.3 * Math.min(n, 2.2) / 1.4;
    out.elL = lerp(eW + eF * Math.max(0, aL), 1.4 + 0.25 * Math.max(0, aL) - 0.1 * Math.max(0, -aL), w);
    out.elR = lerp(eW + eF * Math.max(0, aR), 1.4 + 0.25 * Math.max(0, aR) - 0.1 * Math.max(0, -aR), w);
    out.grip = lerp(0.15, 0.6, w); out.breath = Math.sin(TAU * u) * lerp(0.4, 1, w);
    return out;
  };
  // (the phase at which a leg's swing begins: to start walking with that leg — 0 the left, 1 the right)
  Ga.startPhase = (k, v, s, w) => { const d = Ga.duty(v || 0.8, s, w || 0); return (d + (k ? 0.5 : 0)) % 1; };
})(window.G);
