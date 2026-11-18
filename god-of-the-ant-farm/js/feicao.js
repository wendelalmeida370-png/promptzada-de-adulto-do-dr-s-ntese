'use strict';
// ============================================================
//  Feicao: the shape and the colours a person is drawn with
//  (22a, SOCIEDADE.md §3.2, D-542, D-552 to D-555) — from their
//  genome (G.Genoma), their age, and what the world does to the
//  body. The skin, the hair and the eyes are the genome's colours
//  (the choice B' of the study: v.skin and v.hair are born as ever
//  and are only the seed of the colour of who was born before the
//  genome); the height is the genome's, about the height of their
//  age and sex. The shape is a sum of «targets» (ALVOS): smooth
//  fields of displacement over the body as modelled — the face of
//  the genes (the jaw, the nose, the cheekbones, the lips…), the
//  face of the years (the child's, the old one's), the body (fat,
//  thin, strong, the shoulders, the belly of a pregnancy, a limb
//  lost) and the face's movements (a smile, a frown) — each one
//  the same field on every mesh (the skin, the hair, the hats,
//  the clothes): what sits on the head follows the head, what is
//  worn follows the body. Only seen: nothing here is saved,
//  nothing changes the world, nothing draws a chance — one answer
//  a person, kept while what it reads is the same. A person with
//  no genome (a proof's bare person) is drawn as before: of(v)
//  gives null.
// ============================================================
(function (G) {
  const F = G.Feicao = {};
  const MEMO = new Map(); G.worldHooks.push(() => MEMO.clear());
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ------------------------------ the places of the face and the body (the bind pose, metres; the head grown 1.06) ------------------------------
  const EYE = [0.0371, 1.7036, 0.089], MY = 1.6145, TIP = [0, 1.6603, 0.127], BRIDGE = [0, 1.70, 0.104], NOSTRIL = [0.0146, 1.6561, 0.115];
  const CHEEK = [0.053, 1.6716, 0.07], CHIN = [0, 1.567, 0.098], JAWA = [0.062, 1.592, 0.012], BROW = [0.03, 1.731, 0.094], EAR = [0.093, 1.681, -0.013];
  const TEMPLE = [0.072, 1.722, 0.03], CORNER = [0.024, 1.6145, 0.104];
  const ROLL = 0.6, SH = [0.235, 1.44, 0], AD = [Math.sin(ROLL), -Math.cos(ROLL), 0]; // (the arm in the bind: from the shoulder, opened by the roll)
  F.PLACES = { EYE, MY, TIP, CHIN, EAR };
  const g2 = (dx, dy, dz, r) => Math.exp(-(dx * dx + dy * dy + dz * dz) / (r * r));
  // a gaussian blob, mirrored on the two sides when c is off the middle: the point moves by d (its x mirrored on the right)
  function blob(o, x, y, z, c, r, d, k) {
    const w0 = g2(x - c[0], y - c[1], z - c[2], r), w1 = c[0] ? g2(x + c[0], y - c[1], z - c[2], r) : 0;
    k = k === undefined ? 1 : k; o[0] += (d[0] * w0 - d[0] * w1) * k; o[1] += d[1] * (w0 + w1) * k; o[2] += d[2] * (w0 + w1) * k;
  }
  // a blob that scales about its centre (mirrored likewise)
  function swell(o, x, y, z, c, r, s, k) {
    k = k === undefined ? 1 : k;
    for (const sd of c[0] ? [1, -1] : [1]) { const cx = c[0] * sd, w = g2(x - cx, y - c[1], z - c[2], r) * s * k; o[0] += (x - cx) * w; o[1] += (y - c[1]) * w; o[2] += (z - c[2]) * w; }
  }
  // how much a point is of the face (in front of the ears, between the brow and the chin) and of the head
  const faceK = (x, y, z) => sm(-0.02, 0.03, z) * sm(1.5, 1.545, y) * sm(1.79, 1.74, y);
  const headK = y => sm(1.52, 1.58, y);
  // out from a limb's axis (a to b), within reach r of it, between its ends: the distance pushed out by f(t) (t 0 at a, 1 at b)
  function limb(o, x, y, z, a, b, r, f) {
    const ab0 = b[0] - a[0], ab1 = b[1] - a[1], ab2 = b[2] - a[2], L2 = ab0 * ab0 + ab1 * ab1 + ab2 * ab2;
    const t = ((x - a[0]) * ab0 + (y - a[1]) * ab1 + (z - a[2]) * ab2) / L2; if (t < -0.15 || t > 1.15) return;
    const tc = clamp(t, 0, 1), q0 = x - (a[0] + ab0 * tc), q1 = y - (a[1] + ab1 * tc), q2 = z - (a[2] + ab2 * tc); const d = Math.hypot(q0, q1, q2);
    if (d > r || d < 1e-5) return; const k = f(t) * sm(r, r * 0.6, d) / d; o[0] += q0 * k; o[1] += q1 * k; o[2] += q2 * k;
  }
  const ARM = sd => [[SH[0] * sd, SH[1], 0], [(SH[0] + AD[0] * 0.59) * sd, SH[1] + AD[1] * 0.59, 0]];
  const LEG = sd => [[0.095 * sd, 0.88, 0], [0.095 * sd, 0.08, 0.01]];
  // the trunk's girth: out from its middle (an ellipse), more at the belly in front
  function trunk(o, x, y, z, k, belly) {
    if (y < 0.72 || y > 1.52) return; const a = sm(0.72, 0.86, y) * sm(1.52, 1.4, y); const d = Math.hypot(x, z * 1.2); if (d < 1e-4 || d > 0.3) return;
    const armpit = Math.abs(x) > 0.17 && y < 1.4 ? sm(0.2, 0.17, Math.abs(x)) : 1; // (not the arms hanging by it)
    const w = a * armpit * k * sm(0.3, 0.2, d); o[0] += x / d * w; o[2] += (z * 1.2) / d * w;
    if (belly) o[2] += belly * g2(x * 0.7, y - 1.02, 0, 0.16) * sm(-0.02, 0.06, z) * armpit;
  }
  // the stump of a lost limb: what is past the cut closes in a round end at it
  function stump(o, x, y, z, a, b, at, r0, rFar) {
    const ab0 = b[0] - a[0], ab1 = b[1] - a[1], ab2 = b[2] - a[2], L = Math.hypot(ab0, ab1, ab2), u0 = ab0 / L, u1 = ab1 / L, u2 = ab2 / L;
    const t = (x - a[0]) * u0 + (y - a[1]) * u1 + (z - a[2]) * u2; const cut = L * at; if (t <= cut - 0.01) return;
    const q0 = x - (a[0] + u0 * t), q1 = y - (a[1] + u1 * t), q2 = z - (a[2] + u2 * t); const d = Math.hypot(q0, q1, q2); if (d > (t > cut + 0.06 ? rFar : r0 * 1.6)) return; // (past the cut the hand, the foot: wider than the limb)
    const s = t - (cut - 0.01); const cap = 0.045; const tt = Math.min(s, cap); const shrink = Math.sqrt(Math.max(0, 1 - (tt / cap) * (tt / cap)));
    const nt = cut - 0.01 + tt * 0.8, nd = Math.min(d, r0) * shrink; const k = d > 1e-6 ? nd / d : 0;
    o[0] += a[0] + u0 * nt + q0 * k - x; o[1] += a[1] + u1 * nt + q1 * k - y; o[2] += a[2] + u2 * nt + q2 * k - z;
  }

  // ------------------------------ the targets ------------------------------
  // [name, kind, field(out, x, y, z), the box it reaches (lo, hi), eye: how the eyeballs and their lids follow — 'move' (as the
  // field at the eye's centre: they move whole), 'scale' (the field itself: they grow), none (the eyes stay as they are)]
  const FACEBOX = [[-0.13, 1.48, -0.06], [0.13, 1.84, 0.16]], HEADBOX = [[-0.16, 1.5, -0.16], [0.16, 1.9, 0.17]], BODYBOX = [[-0.75, -0.05, -0.3], [0.75, 1.62, 0.36]];
  const A = [
    // the face of the genes (each a gene — or two, for the finer turns — about the middle of every people); the main lines of the
    // face (the skull, the length, the jaw, the chin, the cheekbones, the brow ridge, the nose, the forehead) reach far enough to be
    // told apart at a few steps, not only up close (the first sheet of five faces)
    ['cranio', 'id', (o, x, y, z) => { const k = headK(y) * sm(1.6, 1.7, y) * (1 - 0.85 * sm(0.03, 0.075, z)); o[0] += x * 0.1 * k; o[2] -= z * 0.022 * k; }, HEADBOX], // (the skull wider at the temples and behind, not the face round the eyes: the lids stay over them)
    ['rostoLongo', 'id', (o, x, y, z) => { o[1] -= Math.max(0, 1.70 - y) * 0.16 * sm(-0.03, 0.02, z) * sm(1.47, 1.53, y); }, FACEBOX],
    ['mandibula', 'id', (o, x, y, z) => blob(o, x, y, z, JAWA, 0.03, [0.017, -0.003, 0]), FACEBOX],
    ['queixo', 'id', (o, x, y, z) => blob(o, x, y, z, CHIN, 0.022, [0, -0.005, 0.013]), FACEBOX],
    ['macas', 'id', (o, x, y, z) => blob(o, x, y, z, CHEEK, 0.022, [0.0085, 0.0035, 0.0085]), FACEBOX],
    ['arcada', 'id', (o, x, y, z) => blob(o, x, y, z, BROW, 0.022, [0, 0.0015, 0.009]), FACEBOX],
    ['narizLongo', 'id', (o, x, y, z) => blob(o, x, y, z, TIP, 0.017, [0, -0.0085, 0.0135]), FACEBOX],
    ['narizLargo', 'id', (o, x, y, z) => blob(o, x, y, z, NOSTRIL, 0.012, [0.0075, 0, 0]), FACEBOX],
    ['narizPonte', 'id', (o, x, y, z) => blob(o, x, y, z, BRIDGE, 0.016, [0, 0, 0.01]), FACEBOX],
    ['labios', 'id', (o, x, y, z) => { const w = g2(x * 0.7, y - MY, z - 0.11, 0.016); o[1] += (y - MY) * 0.5 * w; o[2] += 0.004 * w; }, FACEBOX],
    ['olhosAfast', 'id', (o, x, y, z) => blob(o, x, y, z, EYE, 0.024, [0.0035, 0, 0]), FACEBOX, 'move'],
    ['olhoTam', 'id', (o, x, y, z) => swell(o, x, y, z, EYE, 0.026, 0.1), FACEBOX, 'scale'],
    ['palpebra', 'id', (o, x, y, z) => { for (const sd of [1, -1]) { const w = g2(x - EYE[0] * sd, y - EYE[1], z - EYE[2], 0.022); o[1] += (x * sd - EYE[0]) * 0.12 * w; } }, FACEBOX],
    ['orelhas', 'id', (o, x, y, z) => swell(o, x, y, z, EAR, 0.028, 0.2), HEADBOX],
    ['bocaLarga', 'id', (o, x, y, z) => blob(o, x, y, z, CORNER, 0.011, [0.004, 0, 0]), FACEBOX],
    ['testa', 'id', (o, x, y, z) => { const k = sm(1.72, 1.77, y) * sm(0.02, 0.07, z) * headK(y); o[2] += 0.008 * k; o[1] += 0.005 * k; }, HEADBOX],
    ['narizPonta', 'id', (o, x, y, z) => blob(o, x, y, z, TIP, 0.012, [0, 0.004, -0.001]), FACEBOX],
    ['olhosFundos', 'id', (o, x, y, z) => blob(o, x, y, z, EYE, 0.02, [0, 0, -0.0035]), FACEBOX, 'move'],
    ['queixoLargo', 'id', (o, x, y, z) => { const w = g2(x * 0.6, y - CHIN[1], z - CHIN[2], 0.022); o[0] += x * 0.4 * w; }, FACEBOX],
    ['bochechas', 'id', (o, x, y, z) => blob(o, x, y, z, [0.055, 1.62, 0.05], 0.03, [0.01, 0, 0.005]), FACEBOX],
    // the face of the years (the identity stays under them: the same person at five and at seventy)
    ['infancia', 'idade', (o, x, y, z) => {
      const f = faceK(x, y, z) * sm(1.75, 1.7, y); o[0] -= x * 0.12 * f; o[1] -= (y - 1.66) * 0.18 * f + 0.006 * f; o[2] -= (z - 0.04) * 0.1 * f;
      const k = headK(y) * sm(1.66, 1.74, y); o[0] += x * 0.05 * k; o[2] += (z + 0.01) * 0.04 * k; o[1] += 0.004 * k;
      blob(o, x, y, z, [0.05, 1.63, 0.07], 0.022, [0.003, 0, 0.005]); swell(o, x, y, z, TIP, 0.02, -0.3); blob(o, x, y, z, CHIN, 0.02, [0, 0.003, -0.005]); }, HEADBOX],
    ['adolescente', 'idade', (o, x, y, z) => { swell(o, x, y, z, TIP, 0.02, 0.1); blob(o, x, y, z, JAWA, 0.03, [-0.002, 0, 0]); }, FACEBOX],
    ['maduro', 'idade', (o, x, y, z) => { blob(o, x, y, z, [0.03, 1.64, 0.1], 0.012, [0, 0, -0.0015]); blob(o, x, y, z, [0.05, 1.64, 0.07], 0.02, [0, -0.002, 0]); blob(o, x, y, z, [EYE[0], 1.716, 0.1], 0.011, [0, -0.0015, 0]); }, FACEBOX],
    // (22a wave 2, D-637: the skin that gives — the jowls and the chin's fold down, the cheeks down and hollow under the bone, the
    // temples in, the brows and the lids down, the bags under the eyes —, read a few steps off)
    ['velho', 'idade', (o, x, y, z) => {
      blob(o, x, y, z, [0.048, 1.58, 0.06], 0.022, [0.0035, -0.006, 0.0015]); const w = g2(x * 0.7, y - MY, z - 0.11, 0.016); o[1] -= (y - MY) * 0.3 * w; o[2] -= 0.002 * w;
      blob(o, x, y, z, [0, 1.545, 0.035], 0.02, [0, -0.002, 0.006]); blob(o, x, y, z, [0.05, 1.63, 0.07], 0.02, [0, -0.005, 0]);
      blob(o, x, y, z, TIP, 0.016, [0, -0.004, 0.003]); swell(o, x, y, z, EAR, 0.028, 0.12); blob(o, x, y, z, TEMPLE, 0.02, [-0.0045, 0, -0.003]);
      blob(o, x, y, z, [0.045, 1.726, 0.08], 0.016, [0, -0.0045, 0]); blob(o, x, y, z, [0.045, 1.64, 0.075], 0.016, [-0.003, 0, -0.0045]); blob(o, x, y, z, [EYE[0], 1.716, 0.1], 0.011, [0, -0.0035, 0]);
      blob(o, x, y, z, [EYE[0], 1.683, 0.085], 0.009, [0, -0.001, 0.0015]); }, HEADBOX],
    ['anciao', 'idade', (o, x, y, z) => {
      blob(o, x, y, z, [0.048, 1.575, 0.06], 0.024, [0.002, -0.006, 0]); blob(o, x, y, z, CHIN, 0.02, [0, 0.002, -0.003]); const w = g2(x * 0.7, y - MY, z - 0.11, 0.016); o[2] -= 0.003 * w;
      blob(o, x, y, z, TIP, 0.016, [0, -0.002, 0.002]); swell(o, x, y, z, EAR, 0.028, 0.08); blob(o, x, y, z, [0.045, 1.64, 0.075], 0.016, [-0.002, 0, -0.002]); }, HEADBOX],
    // the body (the genome's, a little moved by the life: hunger thins, heavy work builds the muscle)
    ['gordo', 'corpo', (o, x, y, z) => {
      trunk(o, x, y, z, 0.026, 0.045);
      for (const sd of [1, -1]) { const a = ARM(sd); limb(o, x, y, z, a[0], a[1], 0.09, t => 0.013 * sm(1.1, 0.5, t)); const l = LEG(sd); limb(o, x, y, z, l[0], l[1], 0.12, t => 0.022 * sm(0.75, 0.25, t) + 0.006); }
      blob(o, x, y, z, [0, 1.55, 0.05], 0.025, [0, -0.005, 0.004]); blob(o, x, y, z, [0.055, 1.6, 0.05], 0.028, [0.006, 0, 0.003]); limb(o, x, y, z, [0, 1.44, -0.01], [0, 1.56, 0], 0.08, () => 0.007); }, BODYBOX],
    ['magro', 'corpo', (o, x, y, z) => {
      trunk(o, x, y, z, -0.016, -0.012);
      for (const sd of [1, -1]) { const a = ARM(sd); limb(o, x, y, z, a[0], a[1], 0.09, t => -0.007 * sm(1.1, 0.5, t)); const l = LEG(sd); limb(o, x, y, z, l[0], l[1], 0.12, t => -0.012 * sm(0.75, 0.25, t)); }
      blob(o, x, y, z, [0.045, 1.635, 0.07], 0.018, [-0.002, 0, -0.003]); blob(o, x, y, z, TEMPLE, 0.018, [-0.002, 0, -0.001]); }, BODYBOX],
    ['musculo', 'corpo', (o, x, y, z) => {
      blob(o, x, y, z, [0.215, 1.43, 0], 0.06, [0.012, 0.004, 0]); blob(o, x, y, z, [0.08, 1.3, 0.1], 0.06, [0.002, 0, 0.011]); blob(o, x, y, z, [0.1, 1.475, -0.02], 0.045, [0.004, 0.006, 0]);
      for (const sd of [1, -1]) { const a = ARM(sd); limb(o, x, y, z, a[0], a[1], 0.09, t => (t < 0.55 ? 0.011 : 0.006)); const l = LEG(sd); limb(o, x, y, z, l[0], l[1], 0.12, t => 0.011 * sm(0.75, 0.3, t) + 0.006 * g2(t - 0.7, 0, 0, 0.12)); } }, BODYBOX],
    ['ombros', 'corpo', (o, x, y, z) => { const ax = Math.abs(x); if (y < 1.0) return; o[0] += Math.sign(x) * 0.018 * sm(0.08, 0.22, ax) * sm(1.2, 1.36, y) * sm(1.6, 1.5, y); }, BODYBOX],
    ['gestante', 'corpo', (o, x, y, z) => { o[2] += 0.15 * g2(x * 0.85, (y - 1.03) * 0.85, 0, 0.13) * sm(-0.03, 0.07, z); o[1] -= 0.02 * g2(x, y - 0.98, 0, 0.12) * sm(0.0, 0.08, z); }, BODYBOX],
    ['cotoBracoE', 'corpo', (o, x, y, z) => { if (x < 0.15) return; const a = ARM(1); stump(o, x, y, z, a[0], a[1], 0.42, 0.045, 0.13); }, BODYBOX],
    ['cotoBracoD', 'corpo', (o, x, y, z) => { if (x > -0.15) return; const a = ARM(-1); stump(o, x, y, z, a[0], a[1], 0.42, 0.045, 0.13); }, BODYBOX],
    ['cotoPernaE', 'corpo', (o, x, y, z) => { if (x < 0.005 || y > 0.9) return; const l = LEG(1); stump(o, x, y, z, l[0], l[1], 0.42, 0.065, 0.24); }, BODYBOX],
    ['cotoPernaD', 'corpo', (o, x, y, z) => { if (x > -0.005 || y > 0.9) return; const l = LEG(-1); stump(o, x, y, z, l[0], l[1], 0.42, 0.065, 0.24); }, BODYBOX],
    // the face's movements (the channels of G.Rosto as the drawing shows them, D-556)
    ['sorrisoE', 'rosto', (o, x, y, z) => { if (x < -0.004) return; const w = g2(x - CORNER[0], y - CORNER[1], z - CORNER[2], 0.013); o[0] += 0.003 * w; o[1] += 0.005 * w; o[2] -= 0.003 * w; const c = g2(x - 0.04, y - 1.645, z - 0.08, 0.018); o[1] += 0.003 * c; o[2] += 0.002 * c; }, FACEBOX],
    ['sorrisoD', 'rosto', (o, x, y, z) => { if (x > 0.004) return; const w = g2(x + CORNER[0], y - CORNER[1], z - CORNER[2], 0.013); o[0] -= 0.003 * w; o[1] += 0.005 * w; o[2] -= 0.003 * w; const c = g2(x + 0.04, y - 1.645, z - 0.08, 0.018); o[1] += 0.003 * c; o[2] += 0.002 * c; }, FACEBOX],
    ['tristeza', 'rosto', (o, x, y, z) => { blob(o, x, y, z, CORNER, 0.012, [0, -0.004, 0]); blob(o, x, y, z, CHIN, 0.016, [0, 0.002, 0.001]); }, FACEBOX],
    ['sobeSobr', 'rosto', (o, x, y, z) => blob(o, x, y, z, BROW, 0.022, [0, 0.005, 0]), FACEBOX],
    ['franze', 'rosto', (o, x, y, z) => blob(o, x, y, z, [0.016, 1.728, 0.096], 0.016, [-0.002, -0.004, 0.001]), FACEBOX],
    ['tristeSobr', 'rosto', (o, x, y, z) => blob(o, x, y, z, [0.016, 1.73, 0.096], 0.014, [0, 0.004, 0]), FACEBOX],
    ['nojo', 'rosto', (o, x, y, z) => blob(o, x, y, z, [0.012, 1.636, 0.112], 0.01, [0, 0.004, 0.001]), FACEBOX],
    ['bico', 'rosto', (o, x, y, z) => { const w = g2(x * 0.8, y - MY, z - 0.11, 0.016); o[0] -= x * 0.25 * w; o[2] += 0.006 * w; }, FACEBOX],
    ['aperta', 'rosto', (o, x, y, z) => { const w = g2(x * 0.7, y - MY, z - 0.11, 0.015); o[1] -= (y - MY) * 0.4 * w; o[2] -= 0.001 * w; }, FACEBOX],
    ['estica', 'rosto', (o, x, y, z) => blob(o, x, y, z, CORNER, 0.012, [0.005, -0.001, -0.002]), FACEBOX],
  ];
  F.ALVOS = Object.freeze(A.map(([name, kind, field, box, eye], i) => Object.freeze({ i, name, kind, field, box, eye: eye || null })));
  F.NT = F.ALVOS.length;
  F.IDX = Object.freeze(Object.fromEntries(F.ALVOS.map(a => [a.name, a.i])));
  // (the drawing reads the targets of a kind in one run of the list: the shadow pass only the body's)
  F.KIND = Object.freeze(Object.fromEntries(['id', 'idade', 'corpo', 'rosto'].map(k => { const l = F.ALVOS.filter(a => a.kind === k); return [k, [l[0].i, l[l.length - 1].i + 1]]; })));
  // a target's displacement at one point of the body as modelled (pure)
  const O3 = [0, 0, 0];
  F.at = function (k, x, y, z) { O3[0] = O3[1] = O3[2] = 0; const a = F.ALVOS[k]; const b = a.box; if (x < b[0][0] || y < b[0][1] || z < b[0][2] || x > b[1][0] || y > b[1][1] || z > b[1][2]) return O3; a.field(O3, x, y, z); return O3; };

  // ------------------------------ a person's shape ------------------------------
  const PH = new Float32Array(G.Genoma ? G.Genoma.NG : 29);
  // a gene as a standard score about the middle of every people (the alleles of a founder spread ±9 about 32: the mean of two, ≈ ±6.4)
  const zs = p => clamp((p - 0.5) / 0.1, -2.5, 2.5);
  // (the amplitude of each gene's target at one spread of the people: what keeps a face a face)
  // (22a wave 2, D-636: more of what reads a few steps off — the nose, the chin, the cheekbones, the jaw's width, the face's length,
  // the skull —, inside the box of the verifier at the edges of a people: a face, never a caricature)
  const AMP = { cranio: 0.45, rostoLongo: 0.42, mandibula: 0.56, queixo: 0.6, macas: 0.6, arcada: 0.45, narizLongo: 0.6, narizLargo: 0.55, narizPonte: 0.56, labios: 0.45, olhosAfast: 0.4, olhoTam: 0.35, palpebra: 0.45, orelhas: 0.35 };
  F.of = function (v) {
    const Ge = G.Genoma; if (!v || !Ge || !Ge.valid(v.genoma)) return null;
    const age = v.age || 0; const lost = v.lost || null, preg = v.preg > 0 ? v.preg : 0;
    // (what the world does to the body, read slowly: the hunger of the days, the work the trade asks of the hands)
    const r1 = x => Math.round(x * 10) / 10; // (the hunger and the health as the save keeps them, to a tenth: a load must not thin anyone, L-1672)
    const hungry = r1(v.hunger || 0) >= 95 && (v.hp === undefined ? 100 : r1(v.hp)) < 80 ? 1 : 0, heavy = HEAVY.has(v.role) ? 1 : 0; // (starving: the hunger at its top and the body paying for it)
    const sig = v.genoma + (v.g === 'f' ? 'f' : 'm') + Math.floor(age * 4) + '|' + (preg ? Math.ceil(preg / 8) : 0) + '|' + (lost ? (lost.armL ? 1 : 0) + (lost.armR ? 2 : 0) + (lost.leg ? 4 : 0) : 0) + '|' + hungry + heavy;
    let o = MEMO.get(v.id); if (o && o.sig === sig) return o;
    const aQ = Math.floor(age * 4) / 4; // (the age by its quarter-years, as the memo keys it: the drawn shape is a function of what it is keyed by)
    const P = Ge.pheno(v.genoma, PH), I = Ge.I;
    o = { sig };
    // (the colours: the skin by the melanin and the undertone, the hair by its colour and its red, the iris)
    o.skin = Ge.skinHex(P[I.melanina], P[I.subtom]);
    o.hair = Ge.hairHex(P[I.cabeloCor], P[I.cabeloRuivo]);
    const ir = Ge.irisRGB(P[I.olhoCor]); o.iris = '#' + ir.map(x => Math.round(clamp(x, 0, 1) * 255).toString(16).padStart(2, '0')).join('');
    // (the height: ±8% at the edges of the people's spread about the height of the age and sex — a child grows into it)
    const grow = clamp(0.4 + aQ / 16 * 0.6, 0.4, 1);
    o.alt = 1 + clamp(0.027 * zs(P[I.altura]), -0.08, 0.08) * grow;
    // (the shape: one weight a target — the face of the genes, firming from a baby's to a grown one's; the years over it)
    const w = o.w = new Float32Array(F.NT), X = F.IDX, idK = clamp(0.4 + aQ / 16 * 0.6, 0.4, 1);
    for (const n in AMP) w[X[n]] = zs(P[I[n]]) * AMP[n] * idK;
    w[X.bocaLarga] = (zs(P[I.labios]) - zs(P[I.mandibula])) * 0.25 * idK; w[X.testa] = (zs(P[I.cranio]) - zs(P[I.arcada])) * 0.32 * idK;
    w[X.narizPonta] = (zs(P[I.narizPonte]) - zs(P[I.narizLongo])) * 0.25 * idK; w[X.olhosFundos] = (zs(P[I.arcada]) - zs(P[I.olhoTam])) * 0.22 * idK;
    w[X.queixoLargo] = (zs(P[I.mandibula]) - zs(P[I.queixo])) * 0.22 * idK; w[X.bochechas] = (zs(P[I.macas]) + zs(P[I.massa])) * 0.2 * idK;
    w[X.infancia] = 1 - sm(0, 14, aQ); w[X.adolescente] = sm(11, 15, aQ) * (1 - sm(17, 22, aQ));
    w[X.maduro] = sm(32, 50, aQ); w[X.velho] = sm(52, 74, aQ); w[X.anciao] = sm(72, 90, aQ);
    // (the body: the genes, and a little of the life — never «the rich are fat»: the house plays no part, D-548)
    const grown = sm(10, 18, aQ); const mass = zs(P[I.massa]) * 0.45 - hungry * 0.45, musc = zs(P[I.musculo]) * 0.4 + heavy * 0.35 * grown - (aQ > 65 ? 0.25 : 0);
    w[X.gordo] = clamp(mass, 0, 1.2) * (0.5 + 0.5 * grown); w[X.magro] = clamp(-mass, 0, 1) * (0.5 + 0.5 * grown);
    w[X.musculo] = clamp(musc, -0.4, 1.1) * grown * (v.g === 'f' ? 0.75 : 1); w[X.ombros] = zs(P[I.ombros]) * 0.4 * grown;
    // (a pregnancy: the belly grows over its half-day — 0.55 of a day, villagers.js)
    w[X.gestante] = preg ? clamp(1 - Math.ceil(preg / 8) * 8 / ((G.DAY_LEN || 200) * 0.55), 0, 1) * 0.85 + 0.15 : 0;
    // (a limb lost: the stump, only where the world has the cause — v.lost; which leg, by the id, as the god's view draws it)
    if (lost) { if (lost.armL) w[X.cotoBracoE] = 1; if (lost.armR) w[X.cotoBracoD] = 1; if (lost.leg) w[(v.id || 0) % 2 ? X.cotoPernaD : X.cotoPernaE] = 1; }
    // (the hair's kind — 0 straight, 1 wavy, 2 curly, 3 tight curls —, how early it goes from the temples, how thick the beard)
    o.paint = [clamp((P[I.sardas] - 0.45) / 0.35, 0, 1), clamp(P[I.sobrancelha], 0, 1)]; // (the freckles, the brows' weight: the paint of the genes)
    const tx = P[I.cabeloTextura]; o.tex = tx < 0.42 ? 0 : tx < 0.52 ? 1 : tx < 0.62 ? 2 : 3; o.calv = zs(P[I.calvicie]); o.barba = zs(P[I.barbaDens]);
    // (the grey of the years, D-635: from the age the gene says — a spread either way is eight years —, salt and pepper and then
    // white over twenty-two years; by whole years, as the look is kept)
    o.cinza = 46 + 8 * zs(P[I.grisalho]); o.greyT = clamp((Math.floor(age) - o.cinza) / 22, 0, 0.92);
    o.girth = 1 + 0.12 * w[X.gordo] - 0.06 * w[X.magro] + 0.05 * Math.max(0, w[X.musculo]) + 0.25 * w[X.gestante]; // (how far a skirt is kept off the body)
    MEMO.set(v.id, o); if (MEMO.size > 4000) MEMO.clear();
    return o;
  };
  // (the trades whose days are heavy work of the arms and the back: the body shows the years of it — the muscle, a little)
  const HEAVY = new Set(['ferreiro', 'construtor', 'mineiro', 'guerreiro', 'lenhador', 'pedreiro', 'carregador', 'estivador', 'lavrador', 'agricultor', 'pescador', 'remador', 'foguista']);
})(window.G);
