'use strict';
// ============================================================
//  Ceu: the sky, the light and the air of the instant — one
//  pure source (NATUREZA.md, 21d; D-466). The sun's and the
//  moon's way by the hour, the moon's phase by the day, the
//  colours of the light and of the sky at each height of the
//  sun (the god's hue of the hour over them), the world's wind,
//  the clouds drifting by the world's own clock, the map of the
//  air (the mist of each place and its cause; the canopy that
//  hides the sky), the shade the hills cast. It only reads the
//  world: no chance of any kind (the same question, the same
//  answer), nothing written, no wall clock, no drawing — the 3D
//  (ceu3d.js), the god's view (render.js, sky.js) and the other
//  pillars ask it, and so the light and the colours of both
//  views and of every pillar agree by construction. Regra 167.
// ============================================================
(function (G) {
  const Ce = G.Ceu = {};
  let N = G.N;
  G.mapHooks.push(n => { N = n; });
  const TAU = Math.PI * 2;
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sm = (a, b, v) => { const t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

  // ------------------------------ the way of the sun and of the moon ------------------------------
  // the hour is the world's (S.time) and nothing else. The sun is up from RISE to SET — the very hours the world calls day
  // (G.isNight: after 0.73, before 0.02) —: up in the east a little before the god's pink dawn, over the south at mid-day — no
  // higher than about 61° seen, so the walls keep a side of light and a side of shade and the shadows their length —, down in
  // the west at his purple dusk; at night it goes on under the world and the moon takes the sky: up in the east at dusk, over
  // the south, down at dawn. SHAPE is how long the sun lingers low (1: the plain arc; more, a longer golden hour — D-469): only
  // the curve between the two hours changes, never the hours themselves
  const RISE = -0.015, SET = 0.735, DAY = SET - RISE;
  Ce.RISE = RISE; Ce.SET = SET;
  Ce.SHAPE = 1.5; // (D-469: the sun from 6° to the horizon in about 35 s of the body's clock, against 18 with the plain arc)
  // (the angles of the hour: alt, az of the sun; malt, maz of the moon)
  function arc(t, o) {
    let k = t - RISE; k -= Math.floor(k);
    if (k <= DAY) { const u = k / DAY; o.alt = 0.96 * Math.pow(Math.sin(Math.PI * u), Ce.SHAPE); o.az = Math.PI * u; o.malt = -0.5; o.maz = 0; }
    else { const u = (k - DAY) / (1 - DAY); o.alt = -0.75 * Math.pow(Math.sin(Math.PI * u), 1.6); o.az = Math.PI * (1 + u); o.malt = 0.8 * Math.sin(Math.PI * u) - 0.03; o.maz = Math.PI * u; } // (slow just under the horizon: the dusk and the dawn last as long as the god's)
    return o;
  }
  // (a direction from its angles — leaning to the south — made a unit as the drawing does it)
  function dirOf(alt, az, out) {
    out.x = Math.cos(az) * Math.cos(alt); out.y = Math.sin(alt); out.z = 0.45 * Math.cos(alt) + 0.2;
    const l = Math.sqrt(out.x * out.x + out.y * out.y + out.z * out.z) || 1; const k = 1 / l; out.x *= k; out.y *= k; out.z *= k; return out;
  }
  const _a = { alt: 0, az: 0, malt: 0, maz: 0 };
  // the sun at the hour t: its direction (x east, y up, z south; a unit) and s, the sine of its height (every colour of the hour
  // is read by it); the moon's direction
  Ce.sun = function (t, out) { arc(t, _a); out = out || {}; dirOf(_a.alt, _a.az, out); out.s = out.y; out.alt = _a.alt; out.az = _a.az; return out; };
  Ce.moonDir = function (t, out) { arc(t, _a); out = out || {}; dirOf(_a.malt, _a.maz, out); return out; };
  // the moon's phase by the world's day: a month of MONTH days, the new moon on the first — 0 new, 0.5 full; lit, the share of its
  // face the sun lights (the night of the new moon much darker, the full moon's silver)
  Ce.MONTH = 8;
  Ce.moon = function (t, day, out) {
    // (the phase steps with the day, as the world counts it: a night lies inside one day — the sun sets at 0.735, rises at 0.985)
    out = Ce.moonDir(t, out); const d = Math.floor(day || 1) - 1;
    const ph = ((d % Ce.MONTH) + Ce.MONTH) % Ce.MONTH / Ce.MONTH; out.phase = ph; out.lit = 0.5 - 0.5 * Math.cos(ph * TAU); return out;
  };

  // ------------------------------ the god's hue of the hour ------------------------------
  // (the god's light of the hour — the pink of his dawn, the gold of his afternoon, the blue of his night, the grey of his rain —:
  // the tint the god's whole picture is multiplied by, and that the 3D's light takes its hue from: the same dawn from both
  // heights. Its keys are hours of the plain arc; read by the sun's height when the sun lingers, they keep with it — D-469)
  const AMB = [[0, [225, 186, 176]], [0.05, [255, 226, 206]], [0.12, [255, 255, 255]], [0.56, [255, 252, 244]], [0.63, [255, 216, 172]], [0.69, [232, 172, 140]], [0.725, [150, 138, 172]], [0.765, [104, 114, 172]], [0.965, [100, 110, 168]], [1.0, [225, 186, 176]]];
  Ce.AMB = AMB;
  // (the hour of the plain arc with the sun where it is now: by day, the same height on the same side of noon)
  Ce.plainHour = function (t) {
    if (Ce.SHAPE === 1) return t; let k = t - RISE; k -= Math.floor(k); if (k > DAY) return t;
    const u = k / DAY; const s = Math.pow(Math.sin(Math.PI * u), Ce.SHAPE); const u0 = Math.asin(cl(s, 0, 1)) / Math.PI; const v = u <= 0.5 ? u0 : 1 - u0;
    let h = RISE + v * DAY; h -= Math.floor(h); return h;
  };
  Ce.ambient = function (t, w) {
    t = Ce.plainHour(t); let c = AMB[0][1];
    for (let k = 0; k < AMB.length - 1; k++) {
      if (t >= AMB[k][0] && t <= AMB[k + 1][0]) { const u = (t - AMB[k][0]) / (AMB[k + 1][0] - AMB[k][0]); const a = AMB[k][1], b = AMB[k + 1][1]; c = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; break; }
    }
    if (w && w.rain > 0.05) { const u = Math.min(1, w.rain * 1.2); c = [c[0] + (c[0] * 0.66 - c[0]) * u, c[1] + (c[1] * 0.7 - c[1]) * u, c[2] + (c[2] * 0.8 - c[2]) * u]; }
    if (w && w.drought > 0) c = [c[0], c[1] + (c[1] * 0.95 - c[1]) * 0.6, c[2] + (c[2] * 0.85 - c[2]) * 0.6];
    return c;
  };
  // (how dark the hour is, from the god's hue: 0 noon, past 1 the deep night)
  Ce.nightness = function (t, w) { const a = Ce.ambient(t, w); return cl(1 - (a[0] + a[1] + a[2]) / 3 / 255, 0, 1) / 0.58; };

  // ------------------------------ the colours of the light at each height of the sun ------------------------------
  // what the light, the sky and the air are at each height of the sun (the sine of its altitude), in linear light: warm and
  // low at dawn, clean and white at noon, gold late in the day; the glow of the sky round the sun at its rise and set and the
  // pink band opposite it after sunset; the deep blue of the night
  const RAMP = {
    sun: [[-0.06, [1, 0.3, 0.1]], [0, [1, 0.45, 0.2]], [0.08, [1, 0.64, 0.38]], [0.2, [1, 0.8, 0.56]], [0.45, [1, 0.92, 0.8]], [0.8, [1, 0.97, 0.92]]],
    zen: [[-0.3, [0.0035, 0.006, 0.016]], [-0.12, [0.012, 0.02, 0.055]], [-0.04, [0.04, 0.06, 0.16]], [0.05, [0.08, 0.14, 0.34]], [0.2, [0.08, 0.2, 0.5]], [0.6, [0.07, 0.21, 0.56]]],
    hor: [[-0.3, [0.01, 0.014, 0.028]], [-0.12, [0.03, 0.035, 0.07]], [-0.04, [0.2, 0.14, 0.17]], [0, [0.62, 0.42, 0.33]], [0.08, [0.78, 0.66, 0.56]], [0.2, [0.7, 0.75, 0.82]], [0.6, [0.62, 0.74, 0.88]]],
    glow: [[-0.15, [0, 0, 0]], [-0.05, [0.35, 0.1, 0.04]], [0, [1.1, 0.45, 0.15]], [0.1, [0.85, 0.5, 0.22]], [0.3, [0.55, 0.4, 0.24]], [0.5, [0.24, 0.2, 0.15]], [0.8, [0.14, 0.13, 0.11]]],
    belt: [[-0.15, [0, 0, 0]], [-0.04, [0.12, 0.06, 0.1]], [0.03, [0.14, 0.08, 0.1]], [0.12, [0, 0, 0]]],
    // (the eye opens as the light goes: dusk and night are dark, but one sees in them)
    exp: [[-0.3, 1.75], [-0.1, 1.5], [0, 1.3], [0.1, 1.18], [0.3, 1.07], [0.55, 1]],
  };
  Ce.RAMP = RAMP;
  // (the same height of the sun is not the same hour: the morning's air is cool and clear, the afternoon's warmer — a touch
  // only, over the god's own light: by the hour, a tint of the sun and of the sky at the horizon)
  const AIRT = [[0, [1, 1, 1]], [0.08, [1, 1, 1]], [0.16, [0.96, 0.985, 1.05]], [0.32, [0.97, 0.99, 1.035]], [0.42, [1, 1, 1]], [0.52, [1.025, 1, 0.95]], [0.6, [1.02, 1, 0.96]], [0.68, [1, 1, 1]], [1, [1, 1, 1]]];
  // the low mist over the hours of the day (S.time): thick at dawn, still lying in the morning, burnt off by noon, a little
  // back at dusk and at night
  const MIST = [[0, 1], [0.06, 0.95], [0.16, 0.7], [0.3, 0.42], [0.42, 0.18], [0.6, 0.16], [0.72, 0.32], [0.8, 0.42], [0.95, 0.65], [1, 1]];
  Ce.MIST = MIST;
  // (a ramp of keys [s, value]: the value at s, eased between its keys)
  function ramp(R, s, out) {
    const n = R.length; let a = R[0], b = R[0], u = 0;
    if (s >= R[n - 1][0]) a = b = R[n - 1]; else if (s > R[0][0]) { let k = 0; while (s > R[k + 1][0]) k++; a = R[k]; b = R[k + 1]; u = (s - a[0]) / (b[0] - a[0]); u = u * u * (3 - 2 * u); }
    if (typeof a[1] === 'number') return a[1] + (b[1] - a[1]) * u;
    for (let k = 0; k < 3; k++) out[k] = a[1][k] + (b[1][k] - a[1][k]) * u; return out;
  }
  Ce.ramp = ramp;
  // (the light's own dials: 1 is the light as it is made — the exposure, the sun, the sky's light and how blue it is, the bounce
  // of the land, the deep of the sky overhead, the haze, the moon, the night's floor; the grade's richness, its S, its split;
  // the darks of the curve's toe given back by day and under the moon. The 3D's R3.TUNE is this very object)
  Ce.TUNE = { exp: 1, sun: 1, sky: 1, skySat: 1, bounce: 1, zen: 1, haze: 1, moon: 1, nf: 1, gsat: 0.09, gs: 0.25, gsplit: 1, toeD: 0.5, toeN: 0.65 };
  const v3 = () => [0, 0, 0];
  // the light of the hour (t: S.time; w: S.weather; nc: how many clouds the world has): every number the drawing's light is made
  // of, in L (made once, filled again each call) — the sun and the moon, their colours, the key light (the sun while it is up,
  // the moon when it is not) and its strength, the sky's light in the shade and the bounce of the land, the dome's colours, the
  // clouds' light and how much of the sky they cover, the stars, the night's grade, the exposure, the mist of the hour
  const mkL = () => ({ sd: { x: 0, y: 1, z: 0 }, md: { x: 0, y: -1, z: 0 }, s: 1, dayL: 1, night: 0, rain: 0, storm: 0, air: [1, 1, 1], sun: v3(), zen: v3(), hor: v3(), glow: v3(), belt: v3(), fill: v3(), sky: v3(), bounce: v3(), key: v3(),
    keyI: 0, sunI: 0, moonI: 0, byMoon: false, amb: 1, sunCol: v3(), disc: v3(), moonCol: v3(), cover: 0.36, cloudCol: v3(), cloudSh: v3(), stars: 0, grN: 0, toe: 0.5, exp: 1, mist: 1, top: v3() });
  Ce.L = mkL();
  Ce.light = function (t, w, nc, tune, L) {
    L = !L ? Ce.L : L.sd ? L : Object.assign(L, mkL()); const TU = tune || Ce.TUNE; w = w || {};
    const night = cl(Ce.nightness(t, w), 0, 1); L.night = night;
    const rain = cl(w.rain || 0, 0, 1), storm = cl(w.storm || 0, 0, 1); L.rain = rain; L.storm = storm;
    arc(t, _a); dirOf(_a.alt, _a.az, L.sd); dirOf(_a.malt, _a.maz, L.md);
    const s = L.sd.y; const dayL = sm(-0.15, 0.1, s); L.s = s; L.dayL = dayL;
    // (the god's light of the hour — its hue only — tints it all, as it tints his picture)
    const a = Ce.ambient(t, w); const am = Math.max(a[0], a[1], a[2], 1); const hue = [a[0] / am, a[1] / am, a[2] / am];
    const tint = (c, f) => { for (let q = 0; q < 3; q++) c[q] *= 1 - f + f * hue[q]; return c; };
    const sunC = tint(ramp(RAMP.sun, s, L.sun), 0.6), zen = tint(ramp(RAMP.zen, s, L.zen), 0.3), hor = tint(ramp(RAMP.hor, s, L.hor), 0.35);
    const glow = tint(ramp(RAMP.glow, s, L.glow), 0.65), belt = ramp(RAMP.belt, s, L.belt);
    { const at = ramp(AIRT, t - Math.floor(t), L.air); for (let q = 0; q < 3; q++) { sunC[q] *= at[q]; hor[q] *= 1 + (at[q] - 1) * 0.6; } }
    // (rain: the sky goes grey and low, the sun white and dim behind it, its glow gone)
    { const g = 0.06 + 0.3 * dayL; const wet = rain * 0.8 + storm * 0.2;
      for (let q = 0; q < 3; q++) { const gq = g * [0.95, 1, 1.08][q]; zen[q] += (gq * 0.85 - zen[q]) * wet; hor[q] += (gq - hor[q]) * wet * 0.85; glow[q] *= 1 - wet * 0.85; belt[q] *= 1 - wet; } }
    // the key light: the sun while it is up (dim and red near the horizon, through more air), the moon when it is not
    const sunI = 3 * TU.sun * (0.45 + 0.55 * sm(0, 0.6, s)) * sm(-0.03, 0.06, s) * (1 - rain * 0.72) * (1 - storm * 0.3);
    const moonI = 0.42 * TU.moon * sm(-0.02, 0.15, L.md.y) * sm(0.05, -0.1, s) * (1 - rain * 0.8) * Ce.moonLight(G.S ? G.S.day : 1); // (as bright as its phase: D-523)
    const byMoon = moonI > sunI; const key = L.key; L.sunI = sunI; L.moonI = moonI; L.byMoon = byMoon;
    if (byMoon) { key[0] = 0.62; key[1] = 0.72; key[2] = 1; tint(key, 0.4); } else { key[0] = sunC[0]; key[1] = sunC[1]; key[2] = sunC[2]; }
    const keyI = byMoon ? moonI : sunI; const kd = byMoon ? L.md : L.sd; L.keyI = keyI; L.kd = kd;
    // the sky's light in the shade: the sky that is drawn, averaged over the dome (blue by day, as a painter has it), and a
    // floor of night light — the stars, the moon's scattered glow: a night is dark, never black. From below, the warm
    // bounce of the land in the sun
    const fill = L.fill; for (let q = 0; q < 3; q++) fill[q] = hor[q] * 0.55 + zen[q] * 0.45;
    const skyIrr = L.sky, bounce = L.bounce; const NF = [0.045, 0.06, 0.11];
    for (let q = 0; q < 3; q++) { skyIrr[q] = fill[q] * 0.68 * Math.PI * TU.sky + NF[q] * TU.nf * (1 - dayL) * (1 - rain * 0.5); }
    if (TU.skySat !== 1) { const l = lum(skyIrr); for (let q = 0; q < 3; q++) skyIrr[q] = Math.max(0, l + (skyIrr[q] - l) * TU.skySat); }
    for (let q = 0; q < 3; q++) bounce[q] = (key[q] * keyI * Math.max(kd.y, 0) + skyIrr[q] * 0.4) * [0.22, 0.2, 0.15][q] * TU.bounce;
    L.amb = cl(lum(skyIrr) / 1.05, 0.1, 1);
    // the sky's dome: its colours, the discs, the clouds lit by the key light (gold at sunset, grey and low in the rain)
    { const top = L.top; if (TU.zen !== 1) { const l = lum(zen); for (let q = 0; q < 3; q++) top[q] = l + (zen[q] - l) * TU.zen; } else for (let q = 0; q < 3; q++) top[q] = zen[q]; }
    { const k1 = sm(-0.02, 0.04, s) * (1 - rain * 0.7), k2 = 24 * sm(-0.02, 0.02, s) * (1 - rain * 0.9), k3 = 2.4 * sm(-0.02, 0.06, L.md.y) * sm(0.08, -0.08, s) * (1 - rain);
      for (let q = 0; q < 3; q++) { L.sunCol[q] = sunC[q] * k1; L.disc[q] = sunC[q] * k2; L.moonCol[q] = [0.85, 0.9, 1][q] * k3; } }
    L.cover = cl(0.36 + rain * 0.55 + storm * 0.2 + Math.min(0.15, (nc || 0) * 0.01), 0, 0.98);
    for (let q = 0; q < 3; q++) { L.cloudCol[q] = key[q] * keyI * 0.24 + skyIrr[q] * 0.24; L.cloudSh[q] = skyIrr[q] * 0.27 + key[q] * keyI * 0.05; }
    L.stars = sm(-0.03, -0.16, s) * (1 - rain);
    // (the night's grade: the dim colours going out as the sun goes down; the toe given back: by day, and under the moon)
    L.grN = 0.6 * sm(0.02, -0.14, s) * (1 - rain * 0.3); L.toe = TU.toeD + (TU.toeN - TU.toeD) * sm(0.05, -0.12, s);
    L.exp = ramp(RAMP.exp, s) * (1 + rain * 0.12) * TU.exp;
    L.mist = ramp(MIST, t - Math.floor(t));
    return L;
  };

  // ------------------------------ the sky's physical base ------------------------------
  // the air of a place, as the eye feels it (x, y in tiles): the dry desert's hard and clear, the wet woods' and the swamp's milky,
  // the cold lands' clean — the lands round it, nine tiles to a side, weighed: no line where one land meets the next — and the
  // drought's dust, the rain's washed air. mie: how thick the haze round the sun is; haze: how soon the far land goes blue
  const AIRB = [[0.85, 1], [0.5, 0.75], [0.6, 0.85], [1.25, 1.2], [1.45, 1.35], [0.85, 1.05], [0.38, 0.82]]; // (temperate, snow, taiga, swamp, jungle, savanna, desert)
  Ce.airOf = function (x, y, w) {
    const S = G.S; w = w || (S && S.weather) || {}; let mie = 0.8, haze = 1;
    if (S && S.biome && x !== undefined) { let m = 0, h = 0, n = 0; const cx = cl(Math.floor(x), 0, N - 1), cy = cl(Math.floor(y), 0, N - 1);
      for (let j = cy - 4; j <= cy + 4; j++) for (let i = cx - 4; i <= cx + 4; i++) { if (i < 0 || j < 0 || i >= N || j >= N) continue; const b = AIRB[S.biome[j * N + i]] || AIRB[0]; m += b[0]; h += b[1]; n++; }
      if (n) { mie = m / n; haze = h / n; } }
    if (w.drought > 0) { mie += 0.55; haze *= 1.15; }
    mie *= 1 - cl(w.rain || 0, 0, 1) * 0.4; return { mie, haze };
  };
  // (the light of the sun through the air it crosses at its height: the airmass by Kasten and Young, the Rayleigh of the three
  // colours and the haze's Mie — red at the horizon, orange low, white high — and how much of it is left)
  const TAU_R = [0.0464, 0.108, 0.265];
  Ce.through = function (alt, mie, out) {
    out = out || [0, 0, 0]; const h = Math.max(alt, -0.02) * 180 / Math.PI; const m = 1 / (Math.sin(Math.max(alt, -0.02)) + 0.50572 * Math.pow(Math.max(h + 6.07995, 0.5), -1.6364));
    const tm = 0.06 * mie; for (let q = 0; q < 3; q++) out[q] = Math.exp(-(TAU_R[q] + tm * [0.92, 1, 1.08][q]) * Math.min(m, 40)); return out;
  };
  // the sky's physical base at the hour and the place: band — the glow of the dusk along the horizon, brightest toward the sun,
  // in the colour of the sun through the most air (rgb, and how strong); halo — the haze lit round the sun (the sun's colour
  // through the air, how thick: the place's air); shadow — the Earth's own shadow rising opposite the sun after it sets (its
  // height, a sine of the sky, and how dark), with the pink band over it; under — the light on the clouds' undersides while the
  // sun is low and just under the horizon, red and gold. Painted over by the hues of the hour, as the light is
  Ce.sky = function (t, x, y, w, out) {
    if (!out || !out.band) out = Object.assign(out || {}, { band: [0, 0, 0, 0], halo: [0, 0, 0, 0], shadow: [0, 0], under: [0, 0, 0] }); const S = G.S; w = w || (S && S.weather) || {};
    const sd = Ce.sun(t); const s = sd.y; const alt = Math.asin(cl(s, -1, 1)); const air = Ce.airOf(x, y, w); const rain = cl(w.rain || 0, 0, 1);
    // (the band in the colour of the sun through the air just over the horizon — a golden orange, not the last red of the disc)
    const tr = Ce.through(alt, air.mie), lo = Ce.through(Math.max(alt, 0) + 0.045, air.mie); const nl = a => { const m = Math.max(a[0], a[1], a[2], 1e-6); return [a[0] / m, a[1] / m, a[2] / m]; };
    const hue = nl(lo); const dusk = sm(-0.12, -0.01, s) * (1 - sm(0.06, 0.22, s)) * (1 - rain * 0.85);
    out.band[0] = hue[0]; out.band[1] = hue[1]; out.band[2] = hue[2]; out.band[3] = dusk * 0.42;
    const th = nl(tr); const up = sm(-0.05, 0.03, s) * (1 - rain * 0.75);
    out.halo[0] = th[0]; out.halo[1] = th[1]; out.halo[2] = th[2]; out.halo[3] = up * 0.012 * air.mie;
    out.shadow[0] = cl(-alt * 1.15, 0, 0.32); out.shadow[1] = sm(0.01, -0.03, s) * (1 - sm(-0.2, -0.3, s)) * (1 - rain) * 0.6;
    const ul = sm(-0.09, -0.005, s) * (1 - sm(0.07, 0.16, s)) * (1 - rain * 0.9); const hu = nl(Ce.through(Math.max(alt, 0) + 0.07, air.mie * 0.7));
    for (let q = 0; q < 3; q++) out.under[q] = hu[q] * ul * 0.5;
    out.mie = air.mie; out.haze = air.haze; return out;
  };

  // ------------------------------ the night, the bow, the lights of the north ------------------------------
  // the stars turn about the pole in a night as the sky does (the pole to the north, -z, forty degrees up): the angle of the
  // turn at the hour — the stars and the river of the galaxy go with it
  Ce.POLE = (() => { const a = 40 * Math.PI / 180; return { x: 0, y: Math.sin(a), z: -Math.cos(a) }; })();
  Ce.starTurn = t => -(t - Math.floor(t)) * TAU;
  // the rainbow, with its cause: a shower that has passed — the land of the place still wet with it (S.wet), no rain falling there
  // now (the weather's, and no rain cloud of the world over it) —, and the sun up and low behind the one who looks (under 42°:
  // the bow stands opposite it). 0 none to 1 the full bow
  Ce.rainbow = function (t, x, y, w) {
    const S = G.S; w = w || (S && S.weather) || {}; if (!S || !S.wet || x === undefined) return 0;
    const sd = Ce.sun(t); if (sd.y < 0.02) return 0; const alt = Math.asin(cl(sd.y, -1, 1)) * 180 / Math.PI; if (alt > 42) return 0;
    const rain = Math.max(w.rain || 0, G.Nature && G.Nature.rainAt ? G.Nature.rainAt(x, y) : 0); if (rain > 0.12) return 0;
    let wet = 0, n = 0; const cx = cl(Math.floor(x), 0, N - 1), cy = cl(Math.floor(y), 0, N - 1);
    for (let j = cy - 3; j <= cy + 3; j++) for (let i = cx - 3; i <= cx + 3; i++) { if (i < 0 || j < 0 || i >= N || j >= N) continue; wet += S.wet[j * N + i]; n++; }
    wet = n ? wet / n : 0; return sm(0.2, 0.45, wet) * (1 - sm(0.06, 0.12, rain)) * sm(0.02, 0.08, sd.y) * (1 - sm(36, 42, alt));
  };
  // the lights of the north, with their cause: a night of the cold lands (S.temp of the place low), the sky clear over it
  Ce.aurora = function (t, x, y, w, cover) {
    const S = G.S; w = w || (S && S.weather) || {}; if (!S || !S.temp || x === undefined) return 0;
    const s = Ce.sun(t).y; if (s > -0.1) return 0; const i = cl(Math.floor(y), 0, N - 1) * N + cl(Math.floor(x), 0, N - 1); const cold = S.temp[i] / 255;
    return (1 - sm(0.18, 0.32, cold)) * sm(-0.1, -0.22, s) * (1 - sm(0.45, 0.7, cover === undefined ? 0.36 : cover)) * (1 - cl(w.rain || 0, 0, 1));
  };
  // (how bright the moon's light is by its phase: the new moon's night much darker, the full moon's silver)
  Ce.moonLight = function (day) { const m = Ce.moon(0.85, day); return 0.22 + 0.78 * m.lit; };

  // ------------------------------ the wind ------------------------------
  // the world's wind, the one there is (S.weather: the angle that wanders, the strength — calm 0.3, the drought's 0.45, the
  // storm's 0.95): the very wind the beasts smell by (G.Meio.wind: k is its strength as the beasts feel it) — the leaves, the
  // grass, the water, the mist, the rain and the clouds all go with it
  Ce.wind = function (w) { w = w || (G.S && G.S.weather) || {}; const a = w.windA || 0, s = w.windS || 0; return { a, x: Math.cos(a), y: Math.sin(a), s, k: Math.max(0.35, Math.min(1.4, (s || 0.3) * 2)) }; };

  // ------------------------------ the clouds ------------------------------
  // one field of clouds over the whole world, on a plane CLOUD.h metres over the sea: the dome draws it, its shadow falls on
  // everything under it along the sun, and the god's view sees the same. Its stuff is a picture of soft noise (two channels:
  // the big shapes, the small), CLOUD.scale metres to its side, tiling; it drifts with the world's wind by the world's own clock
  // (S.clock) — the same sky at the same hour for any eye, for the god's and the body's, however long either has looked. The
  // wind wanders, so the drift is not one offset (the wind now times the clock would send the clouds racing when it turns):
  // two layers of the field, each sliding with the wind now for a span of CLOUD.span seconds of the world and starting again
  // (a new piece of the field) while the other is full — the two weighed in turn and kept as contrasted as one (the clouds
  // change their shape as they go, as clouds do)
  const CLOUD = Ce.CLOUD = { h: 350, scale: 2200, span: 240, size: 128 };
  // (the picture of the noise: made once, the same for every world)
  let noise = null;
  const hh = (x, y, s) => G.hash(((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) | 0);
  function vnoise(x, y, p, s) { // (a value noise of period p, at a point of its lattice's units)
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0; const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = (i, j) => hh(((i % p) + p) % p, ((j % p) + p) % p, s);
    return (a(x0, y0) * (1 - ux) + a(x0 + 1, y0) * ux) * (1 - uy) + (a(x0, y0 + 1) * (1 - ux) + a(x0 + 1, y0 + 1) * ux) * uy;
  }
  function fbm(S, x, y, f, oct, s) { let v = 0, a = 0.5, w = 0; for (let o = 0; o < oct; o++) { const p = f << o; v += vnoise(x / S * p, y / S * p, p, s + o * 7) * a; w += a; a *= 0.5; } return v / w; }
  Ce.noise = function () {
    if (noise) return noise; const S = CLOUD.size; const out = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4;
      // (the fbm sits near the middle: stretched so its range is used — a fair sky and a full one both have their clouds)
      const r = cl((fbm(S, x, y, 5, 4, 21) - 0.5) * 1.35 + 0.5, 0, 1), g = cl((fbm(S, x, y, 16, 3, 33) - 0.5) * 1.3 + 0.5, 0, 1);
      out[i] = Math.round(r * 255); out[i + 1] = Math.round(g * 255); out[i + 2] = Math.round(cl((fbm(S, x, y, 3, 3, 47) - 0.5) * 1.5 + 0.5, 0, 1) * 255); out[i + 3] = 255; }
    noise = out; return out;
  };
  // (a channel of the noise read as the graphics card reads it, between its four texels, wrapping)
  function bil(a, S, u, v, ch) {
    const x = u * S - 0.5, y = v * S - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const at = (i, j) => { i = ((i % S) + S) % S; j = ((j % S) + S) % S; return a[(j * S + i) * 4 + ch]; };
    return ((at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy) / 255;
  }
  Ce.bil = bil;
  // the drift of the clouds at the world's clock: the two layers' offsets in the noise's own units, their weights (w0 + w1 = 1)
  // and how much the mix is stretched back to one layer's contrast (k); how fast they go, with the wind (m a second of the world)
  Ce.drift = function (clock, w, out) {
    out = out || {}; const wd = Ce.wind(w); const v = 3 + 9 * cl(wd.s, 0, 1.5); const T = CLOUD.span, sc = 1 / CLOUD.scale;
    for (let k = 0; k < 2; k++) {
      const c = clock / T + k * 0.5; const cyc = Math.floor(c), ph = c - cyc; // (this layer's span, and how far into it)
      // (each span its own piece of the field: it starts where its weight is nothing, so the new piece never jumps in)
      const bx = hh(cyc, k, 5), bz = hh(cyc, k, 9); const d = v * T * (ph - 0.5) * sc;
      out['x' + k] = bx + wd.x * d; out['z' + k] = bz + wd.y * d; out['w' + k] = 1 - Math.abs(2 * ph - 1);
    }
    out.k = 1 / Math.sqrt(out.w0 * out.w0 + out.w1 * out.w1); out.v = v; return out;
  };
  const _dr = {};
  // the clouds' stuff over a point of the cloud plane (x, z in metres of the world: the tile × 4), 0..1: the big shapes and the
  // small, the two layers mixed — the very sum the dome and the shadows make on the graphics card
  Ce.cloudN = function (x, z, dr, fine) {
    const n = Ce.noise(), S = CLOUD.size, sc = 1 / CLOUD.scale; dr = dr || Ce.drift(G.S.clock || 0, G.S.weather, _dr);
    const one = (ox, oz) => { const u = x * sc + ox, v = z * sc + oz; const r = bil(n, S, u, v, 0); return fine ? r * 0.68 + bil(n, S, u * 3.1 + 0.37, v * 3.1 + 0.37, 1) * 0.32 : r; };
    return 0.5 + ((one(dr.x0, dr.z0) - 0.5) * dr.w0 + (one(dr.x1, dr.z1) - 0.5) * dr.w1) * dr.k;
  };
  // how much of the sky the clouds cover over a place at the hour: the fair sky of the day (D-469: a little more or less from
  // one day to the next, by the day and the place — never the world's chance —, more on the wet lands in the afternoon heat),
  // the world's rain and storm, the world's own rain clouds near
  Ce.dayAir = function (day) { const d = Math.floor(day || 1); return { cover: hh(d, 3, 1) * 0.16 - 0.06, cirrus: hh(d, 4, 2), haze: hh(d, 5, 3) }; };
  Ce.cover = function (t, w, nc, day, x, y) {
    const S = G.S; w = w || {}; const rain = cl(w.rain || 0, 0, 1), storm = cl(w.storm || 0, 0, 1);
    let c = 0.36 + rain * 0.55 + storm * 0.2 + Math.min(0.15, (nc || 0) * 0.01);
    // (a rain cloud of the world over the place: its rain is the place's, and the sky over it is grey with it)
    const local = x !== undefined && G.Nature && G.Nature.rainAt ? cl(G.Nature.rainAt(x, y), 0, 1) : 0; const wet = Math.max(rain, local);
    c += Math.max(0, local - rain) * 0.6;
    if (day !== undefined) {
      // (the fair sky of this day and the next, eased through the hours: no day jumps into the next)
      const a = Ce.dayAir(day), b = Ce.dayAir(day + 1); const u = sm(0.75, 1, t); c += (a.cover + (b.cover - a.cover) * u) * (1 - wet);
      // (the heat of the afternoon over a wet land raises its clouds)
      if (x !== undefined && S && S.moist && S.temp) { const i = (cl(Math.floor(y), 0, N - 1)) * N + cl(Math.floor(x), 0, N - 1); const mo = S.moist[i] / 255, hot = S.temp[i] / 255; c += mo * hot * 0.12 * sm(0.18, 0.4, t) * (1 - sm(0.55, 0.72, t)) * (1 - wet); }
    }
    return cl(c, 0, 0.98);
  };
  // the share of the key light that reaches a point of the world (X, Y, Z in metres) under the clouds: the stuff of the plane
  // where the line to the sun crosses it, as thick as the sky is covered; strength: how dark a cloud's shadow is now (none at
  // night, none in the grey of the rain, where there is no sun to shade). The same the materials make
  Ce.cloudShade = function (X, Y, Z, sd, cover, strength, dr) {
    if (!(strength > 0)) return 1; const k = (CLOUD.h + G.SEA * 1.5 - Y) / Math.max(sd.y, 0.12);
    const n = Ce.cloudN(X + sd.x * k, Z + sd.z * k, dr, false);
    return 1 - sm(0.98 - cover, 1.3 - cover, n) * strength;
  };

  // ------------------------------ the map of the air ------------------------------
  // the mist of each place and its cause, and the canopy that hides the sky: one picture of the corners of the tiles (N+1 to a
  // side, a corner at each point of S.H), made whole when asked and kept while the land is the same (S.typeVer, the
  // map's size, the woods' G.Mata). Per corner: dawn — the mist that lies at dawn and burns off by noon (the valley, by how far
  // it lies under the land round it; the river and the lake; the swamp); last — the mist that stays all day (the wet woods under
  // their canopy; the spray of a waterfall; the swamp); top — the height its top lies at (m, over the sea); canopy — how much of
  // the sky the woods' crowns hide there (the woods' own measure, G.Mata.at(i).luz, 0 open to 1 a roof: the woods say it, the
  // sky never works it out again — without them, nothing); why — the causes, by bits (Ce.WHY)
  Ce.WHY = { vale: 1, rio: 2, pantano: 4, queda: 8, mata: 16 };
  // (the ring of land a valley is measured against: sixteen points, eight tiles off)
  const RING = (() => { const r = []; for (let a = 0; a < 16; a++) { const an = a / 16 * TAU; r.push(Math.round(Math.cos(an) * 8), Math.round(Math.sin(an) * 8)); } return r; })();
  let air = null;
  // (the woods' canopy over a tile, read as the woods give it: a number, or nothing)
  // (the woods' source is js/mata.js — the 21a's G.Mata —, which may not be there yet: asked by its name, and nothing without it)
  const woods = () => G['Mata'];
  function canopyOf(i) {
    const M = woods(); if (!M) return 0;
    try { const v = typeof M.luz === 'function' ? M.luz(i) : M.at ? (M.at(i) || {}).luz : 0; return Number.isFinite(v) ? cl(v, 0, 1) : 0; } catch (e) { return 0; }
  }
  const verOf = M => (!M ? '' : typeof M.ver === 'function' ? M.ver() : M.ver !== undefined ? M.ver : 'm');
  // (the land's own version — S.typeVer: the heights, the water, the land's kind —, not the buildings': the air does not change
  // when a house goes up)
  Ce.airKey = function () { const S = G.S; return N + ':' + (S.typeVer || 0) + ':' + verOf(woods()) + ':' + (S.relief && S.relief.falls ? S.relief.falls.length : 0); };
  Ce.airMap = function () {
    const S = G.S; const key = Ce.airKey(); if (air && air.key === key && air.S === S) return air;
    const n = N + 1, HM = 1.5, TL = 4; const Hs = S.H; const typ = S.type; const bio = S.biome; const moist = S.moist;
    const dawn = new Float32Array(n * n), last = new Float32Array(n * n), top = new Float32Array(n * n), cano = new Float32Array(n * n), why = new Uint8Array(n * n);
    // (the woods' canopy over each tile, asked once a tile)
    const ct = new Float32Array(N * N); if (woods()) for (let t = 0; t < N * N; t++) ct[t] = canopyOf(t);
    const hc = (i, j) => Hs[cl(j, 0, N) * n + cl(i, 0, N)] * HM;
    const T = G.T; const RIV = T ? T.RIVER : 2, SEAT = T ? T.SEA : 1;
    // (the tiles round a corner: the four that touch it)
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      const c = j * n + i; const g = hc(i, j); let d = 0, l = 0, tp = g, w = 0; let land = 0, river = 0, swamp = 0, can = 0, wet = 0, desert = 0, tiles = 0;
      for (let dj = -1; dj <= 0; dj++) for (let di = -1; di <= 0; di++) { const x = i + di, y = j + dj; if (x < 0 || y < 0 || x >= N || y >= N) continue; const t = y * N + x; tiles++;
        if (typ[t] > SEAT) land++; if (typ[t] === RIV) river++; if (bio && bio[t] === 3) swamp++; if (bio && bio[t] === 6) desert++; can += ct[t]; if (moist) wet += moist[t] / 255; }
      if (tiles) { can /= tiles; wet /= tiles; }
      cano[c] = can;
      if (land) {
        // the valley: how far the land lies under the ring of land round it (sixteen points, eight tiles off) — the mist fills
        // it to a little under the ring
        let ring = 0; for (let a = 0; a < 16; a++) ring += hc(i + RING[a * 2], j + RING[a * 2 + 1]); ring /= 16;
        const deep = ring - g; if (deep > 1.5) { const k = sm(1.5, 7, deep) * (desert ? 0.15 : 1); d += k * 0.8; tp = Math.max(tp, g + Math.min(30, deep * 0.85)); w |= 1; }
        if (river) { d += 0.6 * river / tiles; tp = Math.max(tp, g + 3.5); w |= 2; }
        if (swamp) { const k = swamp / tiles; d += 0.7 * k; l += 0.25 * k; tp = Math.max(tp, g + 3); w |= 4; }
        // the wet woods: the air under a closed canopy over a wet land, milky all day
        if (can > 0.3) { const k = sm(0.3, 0.9, can) * wet; if (k > 0.02) { l += k * 0.55; tp = Math.max(tp, g + 9); w |= 16; } }
      }
      dawn[c] = d; last[c] = l; top[c] = tp; why[c] = w;
    }
    // the spray of the waterfalls the world has (S.relief.falls): thick round the foot, rising as high as the fall and more
    const rel = S.relief; const falls = rel && rel.falls ? rel.falls : [];
    for (const f of falls) {
      const drop = (f.drop || 1) * HM; const r = 2 + Math.min(4, drop * 0.4);
      for (const [px, py] of [[f.x + 0.5, f.y + 0.5], [f.tx + 0.5, f.ty + 0.5]]) for (let j = Math.floor(py - r); j <= Math.ceil(py + r); j++) for (let i = Math.floor(px - r); i <= Math.ceil(px + r); i++) {
        if (i < 0 || j < 0 || i > N || j > N) continue; const dd = Math.hypot(i - px, j - py) / r; if (dd >= 1) continue; const c = j * n + i; const k = (1 - dd) * (1 - dd);
        last[c] += 0.9 * k * Math.min(1, drop / 6 + 0.3); top[c] = Math.max(top[c], hc(i, j) + drop + 6); why[c] |= 8; }
    }
    const pic = new Uint8Array(n * n * 4);
    for (let c = 0; c < n * n; c++) { pic[c * 4] = Math.round(cl(dawn[c], 0, 1) * 255); pic[c * 4 + 1] = Math.round(cl(cano[c], 0, 1) * 255); pic[c * 4 + 2] = Math.round(cl(last[c], 0, 1) * 255); pic[c * 4 + 3] = Math.round(cl(top[c] / Ce.TOPM, 0, 1) * 255); }
    air = { key, S, n, dawn, last, top, cano, why, pic };
    return air;
  };
  Ce.TOPM = 76.5; // (the highest the picture holds: a height in metres over 255 steps of 0.3 m)
  // the air of a place (x, y in tiles): the mist that lies at dawn and the mist that stays, its top (m), the canopy, the causes —
  // read at the nearest corner
  Ce.air = function (x, y) {
    const A = Ce.airMap(); const i = cl(Math.round(x), 0, N), j = cl(Math.round(y), 0, N); const c = j * A.n + i; const why = [];
    for (const k in Ce.WHY) if (A.why[c] & Ce.WHY[k]) why.push(k);
    return { dawn: A.dawn[c], last: A.last[c], top: A.top[c], canopy: A.cano[c], why };
  };
  // how thick each mist is at the hour (t) and in the weather: the dawn's lies thick at sunrise, still in the morning, gone by
  // noon, a little back at dusk and at night (the hour's mist, MIST); thicker after a rain the sun is drying (the land steaming:
  // the wet land of the world, S.wet, without rain now); the one that stays, the same all day, more in the rain
  Ce.mistNow = function (t, w, wetMean) {
    w = w || {}; const m = ramp(MIST, t - Math.floor(t)); const rain = cl(w.rain || 0, 0, 1);
    const steam = (wetMean || 0) * (1 - rain) * sm(0.02, 0.1, t) * (1 - sm(0.4, 0.6, t));
    return { dawn: cl(m * (1 + steam * 1.5), 0, 1.6), last: 0.6 + rain * 0.5 };
  };

  // ------------------------------ the shade of the hills ------------------------------
  // where the land itself hides the key light (the sun by day, the moon by night): for the corners of the tiles, how high over
  // the ground the shadow of the land in front of it reaches (m; 0: in the light) — a ridge shading its valley at sunrise and at
  // sunset, at any distance, in every quality. Swept along the light's way over the map (each row from the one nearer the
  // light: the shadow's top there, the land there, less the fall of the light over one step), N² — made whole for a direction
  Ce.shadeFor = function (dir, out) {
    const S = G.S; const n = N + 1, HM = 1.5, TL = 4; const Hs = S.H; out = out && out.length === n * n ? out : new Float32Array(n * n);
    const hx = dir.x, hz = dir.z, hl = Math.hypot(hx, hz);
    if (hl < 1e-4 || dir.y > 0.995) { out.fill(0); return out; }
    const tanA = Math.max(dir.y, 0.012) / hl; const top = new Float32Array(n * n);
    const xMajor = Math.abs(hx) >= Math.abs(hz);
    // (one step toward the light: one tile along the major axis, a fraction of one along the other)
    const sa = xMajor ? Math.sign(hx) : Math.sign(hz); const fr = xMajor ? hz / Math.abs(hx) : hx / Math.abs(hz); const stepL = Math.hypot(1, fr) * TL; const fall = stepL * tanA;
    const h = (i, j) => Hs[j * n + i] * HM;
    // (the lines across, from the one nearest the light to the farthest)
    for (let s = 0; s < n; s++) {
      const a = sa > 0 ? n - 1 - s : s; // (the line's index on the major axis)
      for (let b = 0; b < n; b++) {
        const i = xMajor ? a : b, j = xMajor ? b : a; const c = j * n + i;
        const pa = a + sa; if (pa < 0 || pa >= n) { top[c] = -1e9; continue; }
        // (the point one step toward the light, between two of the line before)
        const pb = b + fr; if (pb < 0 || pb > n - 1) { top[c] = -1e9; continue; }
        const b0 = Math.floor(pb), f = pb - b0, b1 = Math.min(n - 1, b0 + 1);
        const c0 = xMajor ? b0 * n + pa : pa * n + b0, c1 = xMajor ? b1 * n + pa : pa * n + b1;
        const g0 = Hs[c0] * HM, g1 = Hs[c1] * HM; const t0 = Math.max(top[c0], g0), t1 = Math.max(top[c1], g1);
        top[c] = t0 + (t1 - t0) * f - fall;
      }
    }
    for (let c = 0; c < n * n; c++) { const g = Hs[c] * HM; out[c] = top[c] > g ? top[c] - g : 0; }
    return out;
  };
  // (whether a point of the world — X, Y, Z in metres — is in the shade of the land for the light coming from dir: the same
  // sweep's answer, read at the nearest corner; the brute look along the line, for the proofs)
  Ce.shadeAt = function (sh, X, Y, Z) { const n = N + 1; const i = cl(Math.round(X / 4), 0, N), j = cl(Math.round(Z / 4), 0, N); const g = G.S.H[j * n + i] * 1.5; return sh[j * n + i] > 0.05 && Y < g + sh[j * n + i]; };
  Ce.shadeRay = function (dir, X, Y, Z) {
    const hl = Math.hypot(dir.x, dir.z); if (hl < 1e-4) return false; const tanA = Math.max(dir.y, 0.012) / hl; const ux = dir.x / hl, uz = dir.z / hl;
    for (let d = 2; d < (N + 1) * 4 * 1.5; d += 1) { const x = X + ux * d, z = Z + uz * d; if (x < 0 || z < 0 || x > N * 4 || z > N * 4) return false; if (G.W.hAt(x / 4, z / 4) * 1.5 > Y + d * tanA + 0.4) return true; }
    return false;
  };
})(window.G);
