// gestos-vida: the gestures of the people, proven on the body (22c, D-590 to D-604; in the mould of qa/visual/bichos-gestos.js).
// In Node (seconds, no WebGL): the game's rig (People3D.rig) and animator (Anim3D.drive), the meshes of js/bodymesh.js — the lab
// of qa/visual/corpo-rig.js. Every clip registered (the gestures of the anim-clips, the interaction, the trades, the fight and the
// life that is seen), driven by the animator from standing as the world plays it, on the two bodies (a man, a woman) and three
// ages (a child of 8, a grown one of 30, an elder of 75):
//   g1  numbers (no NaN) in every bone, every frame;
//   g2  the bones keep their lengths (the upper arm, the forearm, the thigh, the shin: within 1% of the body's own);
//   g3  no joint thrown between two frames (each angle of the pose under 22 rad/s, as qa/visual/andar.js measures it);
//   g4  nothing under the ground at three moments (the soles, the palms) — the gestures that kneel, sit or lie down on purpose
//       resting on it, within their tolerance;
//   g5  nothing through the body at three moments: the palms out of the trunk and the head (their volumes, a tolerance of 3 cm);
//   g6  the planted feet still (a foot down keeps its place under 2 cm, while the gesture keeps it down);
//   g7  the contact on the world's clock: a clip with the world's stroke (period) lands its contact where the world counts the
//       stroke (Anim3D.loopTime at t = period, 2·period…);
//   g8  the mirror: a gesture's left-handed twin (`id~m`) is the same gesture on the other side — the left palm where the right
//       one was, mirrored, within 1 cm;
//   g9  the porte walks by the stride: the elder's, the cold's, the pregnant one's, the frightened one's, the limping one's walk —
//       the cadence the porte asks, the standing foot still under 2 cm (the legs never added on top, D-595).
//   node qa/visual/gestos-vida.js            ONLY=g1,g9 for some parts; V=1 lists every clip's numbers
//   GRUPO=22c                                only the clips of the life that is seen (vida-clips.js, social-clips.js)
const fs = require('fs'), path = require('path'), vm = require('vm');
const L0 = require('./corpo-rig.js');
const { G, THREE, P3, A, LOOK } = L0; const B = P3.B;
const ROOT = path.resolve(__dirname, '..', '..');
// (the clips of the other files the page runs — the interaction, the trades, the fight —, queued to the one registry as they are)
for (const f of ['js/interacao-clips.js', 'js/trabalho-clips.js', 'js/combate-clips.js']) try { vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }); } catch (e) { console.log('(sem ' + f + ': ' + e.message + ')'); }
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null; const on = k => !ONLY || ONLY.has(k);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | gestos-vida ${name} | ${info}`); if (!c) fails.push(name); };
const OURS = new Set(); for (const f of ['js/vida-clips.js', 'js/social-clips.js']) { const p = path.join(ROOT, f); if (fs.existsSync(p)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bK\('([\w-]+)'/g)) { OURS.add(m[1]); OURS.add(m[1] + '~m'); } }
const ids = Object.keys(A.CLIPS).filter(id => process.env.GRUPO !== '22c' || OURS.has(id)).sort();
const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
// the bodies: a man and a woman at three ages — the size of the age (People3D's lookFill: a child of 8 is 1.2 m, an elder of 75 1.68 m)
const BODIES = [['homem 30', { s: 1, fem: false }], ['mulher 30', { s: 0.95, fem: true }], ['menino 8', { s: (0.75 + 0.5 * 0.9) / 1.75, fem: false, headK: 1.18 }], ['menina 8', { s: (0.75 + 0.5 * 0.9) / 1.75, fem: true, headK: 1.18 }], ['velho 75', { s: 1.68 / 1.75, fem: false }], ['velha 75', { s: 1.68 / 1.75 * 0.95, fem: true }]];
const pos = (R, b) => { const e = R[b].elements; return [e[12], e[13], e[14]]; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const loc = (R, b, x, y, z) => { const e = R[b].elements; return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]; };
// (a point in a bone's own frame, unscaled: the inverse of its rotation — the rig's frames carry the body's size)
function inFrame(R, b, p, s) { const e = R[b].elements; const d = [p[0] - e[12], p[1] - e[13], p[2] - e[14]]; return [(e[0] * d[0] + e[1] * d[1] + e[2] * d[2]) / (s * s), (e[4] * d[0] + e[5] * d[1] + e[6] * d[2]) / (s * s), (e[8] * d[0] + e[9] * d[1] + e[10] * d[2]) / (s * s)]; }
// the gestures that rest on the ground on purpose: kneeling, sitting, lying, crouched low (their feet free, or their hips low)
const ANG = A.CH.filter(j => !['bob', 'crouch', 'shift', 'breath', 'grip', 'gripL', 'talk', 'holdW', 'lie', 'offW'].includes(j));
const DOWN = c => c.feet === 'free' || /sit|rest|eatg|rockg|pray|cook|sleep|sick/.test(c.base) || (c.keys.crouch && Math.max(...c.keys.crouch.map(k => k[1])) > 0.25);
// a body driven through a clip as the world plays it: from standing, the clip for its time (and the in), 60 frames a second
function run(id, body, mirror) {
  const C = A.CLIPS[id]; const L = Object.assign({}, LOOK, body, { plant: [{ on: 0 }, { on: 0 }], ground: 0, gnd: null, held: null, carry: false, reach: null, pair: null, lod: 0 });
  const a = A.memory(), pose = A.POSE0(), I = {}; const dt = 1 / 60; const T0 = 0.6, dur = Math.max(C.dur, 0.5), N = Math.round((T0 + dur * 1.2) / dt);
  const out = { nan: 0, len: 0, spin: 0, under: 0, through: 0, slip: 0, at: [], frames: 0 }; let prevQ = null; const plant0 = [null, null];
  const REST = {}; // (the body's own lengths, from its first frame standing)
  for (let i = 0; i < N; i++) {
    const t = i * dt, inClip = t >= T0; const u = inClip ? (t - T0) / C.dur : 0;
    Object.assign(I, { st: inClip ? id : 'idle', t, sp: 0, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: 0, ground: 0, s: L.s, run: 0, walk: 0, over: null, overK: undefined, clipK: inClip ? (C.loop ? u - Math.floor(u) : Math.min(1, u)) : undefined, drunk: 0, tired: 0, id: 7, porte: null, clock: t, lefty: false });
    A.drive(a, I, pose, L, dt); const R = P3.rig(0, 0, 0, Math.PI / 2, pose, L); out.frames++;
    for (let b = 0; b < R.length; b++) { const e = R[b].elements; for (let k = 0; k < 16; k++) if (!Number.isFinite(e[k])) { out.nan++; break; } }
    // (the bones' lengths: the shoulder to the elbow, the elbow to the wrist, the hip to the knee, the knee to the ankle)
    const Ls = [dist(pos(R, B.shL), pos(R, B.faL)), dist(pos(R, B.shR), pos(R, B.faR)), dist(pos(R, B.faL), pos(R, B.hdL)), dist(pos(R, B.faR), pos(R, B.hdR)), dist(pos(R, B.thL), pos(R, B.snL)), dist(pos(R, B.thR), pos(R, B.snR)), dist(pos(R, B.snL), pos(R, B.ftL)), dist(pos(R, B.snR), pos(R, B.ftR))];
    if (i === 0) Ls.forEach((x, k) => { REST[k] = x; }); else Ls.forEach((x, k) => { out.len = Math.max(out.len, Math.abs(x - REST[k]) / REST[k]); });
    // (no joint thrown: each angle of the pose from the last frame — the joints the animator eases, as qa/visual/andar.js measures
    // them; the weights and the heights are not angles)
    const Q = ANG.map(j => pose[j] || 0); if (prevQ) for (let k = 0; k < ANG.length; k++) { const w = Math.abs(Q[k] - prevQ[k]) / dt; if (w > out.spin) { out.spin = w; out.spinB = ANG[k]; out.spinT = r2(t); } } prevQ = Q;
    // (the planted feet: from the clip's own stance on, a foot down keeps its place)
    if (inClip && t > T0 + Math.max(0.45, C.bin + 0.25)) for (let k = 0; k < 2; k++) { const ft = L.plant[k]; if (ft.on && ft.mode === 'plant') { const h = loc(R, B.ftL + k, 0, -0.044, 0.03); if (!plant0[k] || plant0[k].x !== ft.x || plant0[k].z !== ft.z) plant0[k] = { x: ft.x, z: ft.z, h }; else out.slip = Math.max(out.slip, Math.hypot(h[0] - plant0[k].h[0], h[2] - plant0[k].h[2])); } else plant0[k] = null; }
    // (three moments: the ground and the body's own volume)
    for (const m of [0.15, 0.5, 0.85]) if (inClip && Math.abs(u - m) < dt / C.dur / 2 + 1e-9) {
      const s = L.s; const soles = [0, 1].flatMap(k => [loc(R, B.ftL + k, 0, -0.044, -0.062), loc(R, B.ftL + k, 0, -0.044, 0.122)]); const palms = P3.palms(R).map(v => [v.x, v.y, v.z]);
      const low = Math.min(...soles.map(p => p[1]), ...palms.map(p => p[1])); const tol = DOWN(C) ? 0.045 * s : 0.015 * s; out.under = Math.max(out.under, -low - tol);
      // (the trunk an ellipse in the chest's frame — 15 cm to each side, 10 forward and back, from the hips to the shoulders —, the
      // head a ball; how far a palm is inside either)
      for (const p of palms) { const c = inFrame(R, B.chest, p, s); if (c[1] > -0.12 && c[1] < 0.5) { const k = Math.hypot(c[0] / 0.15, c[2] / 0.105); if (k < 1) out.through = Math.max(out.through, (1 - k) * 0.105 * s); }
        const hd = loc(R, B.head, 0, 0.1, 0.02); const d = dist(p, hd); if (d < 0.095 * s) out.through = Math.max(out.through, 0.095 * s - d); }
      if (mirror) out.at.push({ m, L: inFrame(R, B.pel, palms[0], s), R: inFrame(R, B.pel, palms[1], s) });
    }
  }
  return out;
}
const T = {}; const pick = list => list;
if (['g1', 'g2', 'g3', 'g4', 'g5', 'g6'].some(on)) {
  const bad = { g1: [], g2: [], g3: [], g4: [], g5: [], g6: [] }, worst = { g2: 0, g3: 0, g4: 0, g5: 0, g6: 0 }, rows = [];
  for (const id of ids) for (const [bn, body] of BODIES) {
    const r = run(id, body); const C = A.CLIPS[id]; const tag = `${id} (${bn})`;
    if (r.nan) bad.g1.push(tag); if (r.len > 0.01) bad.g2.push(`${tag} ${r1(r.len * 100)}%`); if (r.spin > 22) bad.g3.push(`${tag} ${r1(r.spin)} rad/s no ${r.spinB} aos ${r.spinT} s`);
    if (r.under > 0) bad.g4.push(`${tag} ${r1(r.under * 100)} cm`); if (r.through > 0.03) bad.g5.push(`${tag} ${r1(r.through * 100)} cm`);
    if (C.feet === 'plant' && r.slip > 0.02) bad.g6.push(`${tag} ${r1(r.slip * 100)} cm`);
    worst.g2 = Math.max(worst.g2, r.len); worst.g3 = Math.max(worst.g3, r.spin); worst.g4 = Math.max(worst.g4, r.under); worst.g5 = Math.max(worst.g5, r.through); if (C.feet === 'plant') worst.g6 = Math.max(worst.g6, r.slip);
    if (process.env.V) rows.push(`${tag}: len ${r1(r.len * 100)}% spin ${r1(r.spin)} under ${r1(r.under * 100)} through ${r1(r.through * 100)} slip ${r1(r.slip * 100)}`);
  }
  if (process.env.V) console.log(rows.join('\n'));
  // (the clips of another part that fail a measure the life that is seen added: said, not failed — their parts answer for them;
  // the clips of the life that is seen fail)
  const split = (list) => { const ours = list.filter(x => OURS.has(x.split(' ')[0])), theirs = list.filter(x => !OURS.has(x.split(' ')[0])); return { ours, theirs }; };
  const N = ids.length * BODIES.length;
  // (the numbers and the lengths fail for every clip; the speed fails for every clip but the blows of the fight — quick by their
  // own design, 20f: the bow let go in a fiftieth of a second —, listed)
  const say = (k, what, w) => { const { ours, theirs } = split(bad[k]); const hard = k === 'g1' || k === 'g2' ? theirs : k === 'g3' ? theirs.filter(x => !/^cb-/.test(x)) : [];
    ok(`${k} ${what}`, !ours.length && !hard.length, `${ids.length} clipes × ${BODIES.length} corpos (${N}); o pior: ${w}${ours.length ? ' · DA VIDA QUE SE VÊ: ' + ours.slice(0, 8).join(', ') : ''}${hard.length ? ' · DE OUTRAS PARTES: ' + hard.slice(0, 6).join(', ') : ''}${theirs.length > hard.length ? ` · de outras partes (${theirs.length - hard.length}, listados, não falham${k === 'g3' ? ': os golpes da luta' : ''}): ` + theirs.filter(x => !hard.includes(x)).slice(0, 4).join(', ') : ''}`); };
  if (on('g1')) say('g1', 'números em todo osso, todo quadro', bad.g1.length ? 'NaN' : 'nenhum NaN');
  if (on('g2')) say('g2', 'os ossos guardam o comprimento (≤ 1%)', `${r2(worst.g2 * 100)}%`);
  if (on('g3')) say('g3', 'nenhum osso arremessado entre dois quadros (< 22 rad/s)', `${r1(worst.g3)} rad/s`);
  if (on('g4')) say('g4', 'nada debaixo do chão (as solas, as palmas; quem ajoelha, senta ou deita assentado nele)', `${r1(worst.g4 * 100)} cm além da tolerância`);
  if (on('g5')) say('g5', 'nada atravessa o corpo (as palmas fora do tronco e da cabeça, 3 cm de tolerância)', `${r1(worst.g5 * 100)} cm dentro`);
  if (on('g6')) say('g6', 'o pé plantado parado (< 2 cm)', `${r1(worst.g6 * 100)} cm`);
}
if (on('g7')) {
  // the contact on the world's clock: at t = period · n the clip is at its contact
  const per = ids.filter(id => A.CLIPS[id].period > 0); let worst = 0, badc = [];
  for (const id of per) { const C = A.CLIPS[id]; for (const n of [1, 2, 7]) { const u = A.loopTime(C, C.period * n, C.period); const e = Math.abs(((u - C.events.contact) % 1 + 1.5) % 1 - 0.5); worst = Math.max(worst, e); if (e > 1e-6) badc.push(id); } }
  ok('g7 o contato na hora do mundo (os clipes com o golpe do mundo)', !badc.length, `${per.length} clipes com o período do mundo; o maior desvio do contato ${worst.toExponential(1)}${badc.length ? ' · FORA: ' + [...new Set(badc)].join(', ') : ''}`);
}
if (on('g8')) {
  // the mirror: the twin of a clip, on the other side — its left palm the right one's mirrored, its right the left's
  const twins = ids.filter(id => /~m$/.test(id) && A.CLIPS[id.slice(0, -2)]); let worst = 0; const badm = [];
  // (each on the same still body — the rest pose, the same both sides —: the clip alone at three moments, its palms in the hips' frame)
  const palmsAt = (C, u) => { const p = A.POSE0(); A.playClip(p, C, u, 1); const L = Object.assign({}, LOOK, { plant: null, ground: undefined, held: null, carry: false, reach: null, pair: null, lod: 0 }); const R = P3.rig(0, 0, 0, Math.PI / 2, p, L); const pm = P3.palms(R).map(v => [v.x, v.y, v.z]); return { L: inFrame(R, B.pel, pm[0], 1), R: inFrame(R, B.pel, pm[1], 1) }; };
  for (const id of twins) for (const u of [0.15, 0.5, 0.85]) { const a = palmsAt(A.CLIPS[id.slice(0, -2)], u), b = palmsAt(A.CLIPS[id], u);
    const mL = [-a.R[0], a.R[1], a.R[2]], mR = [-a.L[0], a.L[1], a.L[2]]; const e = Math.max(dist(b.L, mL), dist(b.R, mR)); worst = Math.max(worst, e); if (e > 0.01) badm.push(`${id} ${r1(e * 100)} cm`); }
  ok('g8 o espelho: o gesto do canhoto é o mesmo do outro lado', twins.length > 0 && !badm.length, `${twins.length} gêmeos; o maior desvio ${r1(worst * 100)} cm${badm.length ? ' · ' + badm.slice(0, 6).join(', ') : ''}`);
}
if (on('g9')) {
  // the porte walks by the stride: the cadence it asks, the standing foot still
  const P = k => Object.assign(Object.fromEntries(A.PORTE.map(q => [q, 0])), k);
  const CASES = [['nada', P({})], ['velho', P({ velho: 1 })], ['frio', P({ frio: 1 })], ['grávida', P({ gravida: 1 })], ['medo', P({ medo: 1 })], ['manca', P({ manca: 1 })], ['cansado e velho', P({ cansado: 1, velho: 1 })], ['calor', P({ calor: 1 })], ['nobre', P({ nobre: 1 })]];
  const walk = (porte, v) => { const L = Object.assign({}, LOOK, { plant: [{ on: 0 }, { on: 0 }], ground: 0, gnd: null, held: null, carry: false, reach: null, pair: null, lod: 0 }); const a = A.memory(), pose = A.POSE0(), I = {};
    const dt = 1 / 240; let z = 0, slip = 0; const ts = [], st0 = [null, null], on0 = [0, 0];
    for (let i = 0; i < 240 * 7; i++) { z += v * dt; Object.assign(I, { st: 'walk', t: i * dt, sp: v, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: 0, s: 1, run: 0, walk: 1, over: null, overK: undefined, clipK: undefined, drunk: 0, tired: porte.cansado, id: 7, porte, clock: i * dt, lefty: false });
      A.drive(a, I, pose, L, dt); const R = P3.rig(0, 0, z, Math.PI / 2, pose, L); if (i < 240 * 1.5) { for (let k = 0; k < 2; k++) on0[k] = L.plant[k].on ? 1 : 0; continue; }
      for (let k = 0; k < 2; k++) { const ft = L.plant[k], onk = ft.on ? 1 : 0; if (onk && !on0[k]) { st0[k] = { h: null, b: null }; ts.push(i * dt); }
        // (the point of the foot on the ground, the heel then the ball, against where it first touched in this stance)
        if (onk && st0[k]) { const h = loc(R, B.ftL + k, 0, -0.044, -0.062), b = loc(R, B.ftL + k, 0, -0.044, 0.122);
          if (h[1] < 0.008) { if (!st0[k].h) st0[k].h = h; else slip = Math.max(slip, Math.hypot(h[0] - st0[k].h[0], h[2] - st0[k].h[2])); }
          if (b[1] < 0.008) { if (!st0[k].b) st0[k].b = b; else slip = Math.max(slip, Math.hypot(b[0] - st0[k].b[0], b[2] - st0[k].b[2])); } }
        if (!onk) st0[k] = null; on0[k] = onk; } }
    const cad = ts.length > 2 ? (ts.length - 1) / (ts[ts.length - 1] - ts[0]) * 60 : 0;
    return { slip, cad, go: A.gaitOpts ? Object.assign({}, A.gaitOpts({ pz: porte }, I) || {}) : {} }; };
  const out = [], badw = []; const base = {};
  for (const v of [1.0, 1.4]) base[v] = walk(P({}), v).cad;
  for (const [n, p] of CASES) for (const v of [1.0, 1.4]) { const r = walk(p, v); const want = base[v] * (r.go.cad || 1); const okc = Math.abs(r.cad - want) / want < 0.05; out.push(`${n} ${v} m/s: ${r1(r.cad)} passos/min (quer ${r1(want)}), o pé ${r1(r.slip * 100)} cm`); if (!(r.slip < 0.02) || !okc) badw.push(n + ' ' + v); }
  ok('g9 o porte anda pela passada: a cadência que pede, o pé de apoio parado (< 2 cm)', !badw.length, (badw.length ? 'FORA: ' + badw.join(', ') + ' · ' : '') + out.join(' · '));
}
if (on('g10')) {
  // the porte's own hands: the sick one's on the chest, the frightened one's at it, the cold one's across the belly, the noble's
  // behind the back — on the body, never in it; standing, seated and walking, each cause alone and the worst together
  const P = k => Object.assign(Object.fromEntries(A.PORTE.map(q => [q, 0])), k); const one = A.PORTE.filter(q => q !== 'confia' && q !== 'manca' && q !== 'expans');
  const CASES = one.map(q => [q, P({ [q]: 1 })]).concat([['frio, medo e luto', P({ frio: 1, medo: 1, luto: 1 })], ['velho doente e ferido', P({ velho: 1, doente: 1, ferido: 1 })], ['grávida com frio', P({ gravida: 1, frio: 1 })]]);
  let worst = 0, low = 0; const badp = [];
  for (const [n, porte] of CASES) for (const st of ['idle', 'sit', 'walk']) for (const [bn, body] of [BODIES[0], BODIES[1], BODIES[4]]) for (const lefty of [false, true]) {
    const L = Object.assign({}, LOOK, body, { plant: [{ on: 0 }, { on: 0 }], ground: 0, gnd: null, held: null, carry: false, reach: null, pair: null, lod: 0 }); const a = A.memory(), pose = A.POSE0(), I = {}; let z = 0; const sp = st === 'walk' ? 1.3 : 0;
    for (let i = 0; i < 100; i++) { z += sp / 60; Object.assign(I, { st, t: i / 60, sp, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: z, ground: 0, s: L.s, run: 0, walk: sp ? 1 : 0, over: null, overK: undefined, clipK: undefined, drunk: 0, tired: porte.cansado || 0, id: 7, porte, clock: i / 60, lefty }); A.drive(a, I, pose, L, 1 / 60);
      if (i < 70 || i % 6) continue; const R = P3.rig(0, 0, z, Math.PI / 2, pose, L); const s = L.s; const palms = P3.palms(R).map(v => [v.x, v.y, v.z]);
      for (const p of palms) { const c = inFrame(R, B.chest, p, s); let d = 0; if (c[1] > -0.12 && c[1] < 0.5) { const k = Math.hypot(c[0] / 0.15, c[2] / 0.105); if (k < 1) d = (1 - k) * 0.105 * s; } const hd = loc(R, B.head, 0, 0.1, 0.02), e = dist(p, hd); if (e < 0.095 * s) d = Math.max(d, 0.095 * s - e);
        if (d > worst) worst = d; if (d > 0.03) badp.push(`${n} ${st} ${bn}${lefty ? ' canhoto' : ''} ${r1(d * 100)} cm`); low = Math.min(low, p[1]); } }
  }
  ok('g10 as mãos do porte no corpo, nunca dentro dele (3 cm de tolerância), nem no chão', !badp.length && low > -0.01, `${CASES.length} portes × parado, sentado, andando × 3 corpos × as duas mãos; o mais fundo ${r1(worst * 100)} cm; a palma mais baixa ${r1(low * 100)} cm${badp.length ? ' · ' + [...new Set(badp)].slice(0, 8).join(', ') : ''}`);
}
console.log(fails.length ? `GESTOS-VIDA: ${fails.length} falha(s)` : 'GESTOS-VIDA: TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
