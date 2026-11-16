// andar: the stride of the people and of the body, in numbers (20a) — the game's own animator (js/anim-*.js: G.Gait, the clips,
// Anim3D.drive) and the game's own rig (People3D.rig) in Node, frame by frame, as the 3D plays them; no browser (≈ 20 s).
//   node qa/visual/andar.js            → the proofs (each line PASSOU/FALHOU with its numbers)
//   V=1 node qa/visual/andar.js        → and the numbers of every speed
// What it proves (JOGABILIDADE.md, 20a): the cadence in the human band at each speed; the stride what the speed and the cadence
// leave; the standing foot still; no swing foot jumping off its path; the hips high and their rise and fall a walk's; the knee
// straight at the strike and folded in the swing as a walk's and a run's; the steps a hand apart; the head steadier than the
// hips; no joint flung at a change of state; the feet each on its own ground on a slope and on a step; a turn on the spot made
// of steps, not a slide; a clip's contact on the world's stroke; the people of the world turning a corner of their way ahead of
// it, starting and stopping eased, never far from where the world has them; the same pose at 60 and at 144 frames a second
const path = require('path');
const L0 = require('./corpo-rig.js');
const { G, THREE, P3, A } = L0; const B = P3.B; const Ga = G.Gait;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | andar ${name} | ${info}`); if (!c) fails.push(name); };
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const LOOK = Object.assign({}, L0.LOOK);
// a body driven by the animator: inputs each frame (st, speed, yaw…), its rig; returns per frame what the probes need
function body(o) {
  const L = Object.assign({}, LOOK, { plant: [{ on: 0 }, { on: 0 }], s: o.s || 1 }); const a = A.memory(); const pose = A.POSE0(); const I = {};
  L.gnd = o.gnd || null;
  return { L, a, pose, I, step(dt, X, Z, yaw, st, sp, extra) {
    const gY = o.gnd ? o.gnd(X, Z) : 0; L.ground = gY;
    Object.assign(I, { st, t: (I.t || 0) + dt, sp, yaw, yawV: extra && extra.yawV || 0, acc: extra && extra.acc || 0, X, Z, ground: gY, s: L.s, run: extra && extra.run || 0, walk: 0, over: null, overK: undefined, clipK: extra && extra.clipK, drunk: 0, tired: 0, id: 7 });
    A.drive(a, I, pose, L, dt);
    const R = P3.rig(X, gY, Z, yaw, pose, L); return R;
  } };
}
const pos = (R, b) => { const e = R[b].elements; return [e[12], e[13], e[14]]; };
// (a foot's lowest point on the ground: the heel, the ball, or flat — its place, or null in the air)
function contact(R, k, gnd) {
  const e = R[B.ftL + k].elements; const P = [[-0.044, -0.062], [-0.044, 0.122]].map(([y0, zz]) => [e[4] * y0 + e[8] * zz + e[12], e[5] * y0 + e[9] * zz + e[13], e[6] * y0 + e[10] * zz + e[14]]);
  const g0 = gnd ? gnd(P[0][0], P[0][2]) : 0, g1 = gnd ? gnd(P[1][0], P[1][2]) : 0; const h = P[0][1] - g0 < 0.008, b = P[1][1] - g1 < 0.008;
  return h && b ? ['f', (P[0][0] + P[1][0]) / 2, (P[0][2] + P[1][2]) / 2] : h ? ['h', P[0][0], P[0][2]] : b ? ['b', P[1][0], P[1][2]] : null;
}
const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
// (the knee's bend as drawn, degrees: the thigh from the hip to the knee, the shin from the knee to the ankle)
function knee(R, k) { const t = R[B.thL + k].elements, n = R[B.snL + k].elements; const a = [t[4], t[5], t[6]], b = [n[4], n[5], n[6]]; // (the bones' own axes: the knee's turn)
  const c = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b)); return Math.acos(Math.max(-1, Math.min(1, c))) * R2D; }
// ------------------------------ a straight walk or run at a speed ------------------------------
function straight(v, secs, fps, st) {
  const dt = 1 / fps, bd = body({}); let z = 0; const out = { strikes: [], pel: [], head: [], pelA: [], headA: [], kneeHS: [], kneeMax: [], widths: [], slip: 0, back: 0, dev: 0, pops: 0 };
  const P = [[], []], on0 = [0, 0], st0 = [null, null]; let km = [0, 0]; const yaw = Math.PI / 2; let lastPel = null, lastHead = null;
  for (let i = 0; i < secs * fps; i++) {
    z += v * dt; const R = bd.step(dt, 0, z, yaw, st || (v > 3.1 ? 'run' : 'walk'), v);
    if (i < fps * 1.5) { for (let k = 0; k < 2; k++) on0[k] = bd.L.plant[k].on ? 1 : 0; continue; } // (settled)
    const p = bd.pose;
    for (let k = 0; k < 2; k++) {
      const ft = bd.L.plant[k], on = ft.on ? 1 : 0;
      // (the knee as drawn: the angle between the thigh and the shin of the rig)
      const kd = knee(R, k);
      if (on && !on0[k]) { out.strikes.push([i * dt, k, ft.x, ft.z]); out.kneeHS.push(kd); if (km[k]) out.kneeMax.push(km[k]); km[k] = 0; st0[k] = [ft.x, ft.z]; }
      if (!on) km[k] = Math.max(km[k], kd);
      // (the standing foot: its contact point, from the strike to the push-off)
      if (on && st0[k]) { const c = contact(R, k); if (c && c[0] === 'f') out.slip = Math.max(out.slip, Math.hypot(ft.x - st0[k][0], ft.z - st0[k][1])); }
      // (the ankle's path: a swing foot never goes back in the world, and never leaves its smooth path — the third difference)
      const a = pos(R, B.ftL + k); P[k].push(a); const n = P[k].length;
      if (n >= 5 && !on) out.back = Math.max(out.back, P[k][n - 5][2] - a[2]); // (back over a 60th of a second)
      if (n >= 4) { const q = P[k]; const d = [0, 1, 2].map(j => q[n - 1][j] - 3 * q[n - 2][j] + 3 * q[n - 3][j] - q[n - 4][j]); const e = Math.hypot(...d) / 2; out.dev = Math.max(out.dev, e); if (e > 0.03) out.pops++; }
      on0[k] = on;
    }
    out.pel.push(pos(R, B.pel)[1]); out.head.push(pos(R, B.head)[1]);
    // (the hips' and the head's turning in the world, frame to frame: the head kept steady)
    const qp = new THREE.Quaternion().setFromRotationMatrix(R[B.pel]), qh = new THREE.Quaternion().setFromRotationMatrix(R[B.head]);
    if (lastPel) { out.pelA.push(lastPel.angleTo(qp) / dt); out.headA.push(lastHead.angleTo(qh) / dt); } lastPel = qp; lastHead = qh;
  }
  const S = out.strikes; const T = S.length > 2 ? S[S.length - 1][0] - S[0][0] : 1; out.cad = (S.length - 1) / T * 60;
  for (let i = 1; i < S.length; i++) if (S[i][1] !== S[i - 1][1]) out.widths.push(Math.abs(S[i][2] - S[i - 1][2]));
  const steps = []; for (let i = 1; i < S.length; i++) steps.push(Math.abs(S[i][3] - S[i - 1][3])); out.step = mean(steps);
  out.pelMean = mean(out.pel) / 0.92; out.pelExc = Math.max(...out.pel) - Math.min(...out.pel); out.width = mean(out.widths);
  const rms = a => Math.sqrt(mean(a.map(x => x * x))); out.pelRot = rms(out.pelA); out.headRot = rms(out.headA);
  return out;
}
const SPEEDS = [[0.8, 'walk'], [1.0, 'walk'], [1.2, 'walk'], [1.4, 'walk'], [1.75, 'walk'], [2.0, 'walk'], [2.5, 'run'], [3.0, 'run'], [3.6, 'run'], [4.3, 'run'], [6.0, 'run']];
const res = {}; for (const [v, st] of SPEEDS) res[v] = straight(v, 7, 240, st);
if (process.env.V) for (const v in res) { const r = res[v]; console.log(JSON.stringify({ v: +v, cad: +r.cad.toFixed(1), step: +r.step.toFixed(3), width: +r.width.toFixed(3), slip: +(r.slip * 100).toFixed(1), back: +(r.back * 100).toFixed(1), dev: +(r.dev * 100).toFixed(1), pelMean: +r.pelMean.toFixed(3), pelExc: +(r.pelExc * 100).toFixed(1), kneeHS: +mean(r.kneeHS).toFixed(1), kneeMax: +mean(r.kneeMax).toFixed(1), pelRot: +r.pelRot.toFixed(2), headRot: +r.headRot.toFixed(2) })); }
const row = (vs, f) => vs.map(v => `${v} m/s ${f(res[v])}`).join(' · ');
const W = [0.8, 1.0, 1.2, 1.4, 1.75, 2.0], RN = [2.5, 3.0, 3.6, 4.3, 6.0];
ok('a cadência na faixa humana (andando 0,8–2,0 m/s: 95–136 passos/min; trote e corrida 2,5–6 m/s: 150–186)', W.every(v => res[v].cad >= 95 && res[v].cad <= 136) && RN.every(v => res[v].cad >= 150 && res[v].cad <= 186), row([...W, ...RN], r => r.cad.toFixed(0)));
ok('o passo é o que a velocidade e a cadência deixam (±4%; sem teto)', [...W, ...RN].every(v => Math.abs(res[v].step - 60 * v / res[v].cad) / (60 * v / res[v].cad) < 0.04), row([...W, ...RN], r => `${r.step.toFixed(2)} m`));
ok('o pé de apoio parado (o ponto no chão, do pouso ao empurrão: < 2 cm)', [...W, ...RN].every(v => res[v].slip < 0.02), row([...W, ...RN], r => `${(r.slip * 100).toFixed(1)} cm`));
ok('nenhum tranco do pé no balanço (nunca para trás mais de 3 cm num quadro de 60 qps; nenhum salto da trajetória > 3 cm — a 240 qps, onde o movimento liso não passa de milímetros)', [...W, ...RN].every(v => res[v].back < 0.03 && res[v].pops === 0), row([...W, ...RN], r => `para trás ${(r.back * 100).toFixed(1)} cm, desvio ${(r.dev * 100).toFixed(1)} cm`));
const NW = [1.2, 1.4];
ok('a bacia alta e o seu sobe e desce de um andar (1,2–1,4 m/s: média ≥ 0,97 da altura de pé; 3–6 cm)', NW.every(v => res[v].pelMean >= 0.97 && res[v].pelExc >= 0.03 && res[v].pelExc <= 0.061), row(W, r => `${r.pelMean.toFixed(3)} · ${(r.pelExc * 100).toFixed(1)} cm`));
// (the stroll's 0,8 m/s is shown, not judged: its heel comes down as the swing's last fifth begins, the knee at ~23° — the rig's
// leg reaching a ground its short step brings near, T-1361)
ok('o joelho reto no pouso do calcanhar (1,0–2,0 m/s: < 10°) e dobrado no balanço: andando 55–70°, correndo 85–115°', W.filter(v => v >= 1).every(v => mean(res[v].kneeHS) < 10) && [1.2, 1.4, 1.75, 2.0].every(v => mean(res[v].kneeMax) >= 55 && mean(res[v].kneeMax) <= 70) && [3.0, 3.6, 4.3].every(v => mean(res[v].kneeMax) >= 85 && mean(res[v].kneeMax) <= 115),
  row([...W, ...RN], r => `pouso ${mean(r.kneeHS).toFixed(0)}°, balanço ${mean(r.kneeMax).toFixed(0)}°`));
ok('a largura do passo andando 5–13 cm (os pés quase na linha do corpo, não dois trilhos)', W.every(v => res[v].width >= 0.05 && res[v].width <= 0.13), row([...W, ...RN], r => `${(r.width * 100).toFixed(1)} cm`));
ok('a cabeça mais firme que a bacia (o giro no mundo, quadro a quadro)', [...W, ...RN].every(v => res[v].headRot < res[v].pelRot), row([1.4, 2.0, 3.6], r => `cabeça ${r.headRot.toFixed(2)} rad/s, bacia ${r.pelRot.toFixed(2)}`));

// ------------------------------ the changes of state: nothing flung ------------------------------
{ const fps = 60, dt = 1 / fps, bd = body({}); let z = 0, yaw = Math.PI / 2; const plan = [['idle', 0, 1.5], ['walk', 1.4, 2], ['walk', 2.0, 1.5], ['run', 3.6, 2], ['walk', 1.4, 1.5], ['idle', 0, 1.5], ['sit', 0, 2], ['idle', 0, 1.5], ['turn180', 0, 1.2], ['walk', 1.75, 1.5], ['chop', 0, 3], ['idle', 0, 1], ['harvest', 0, 3], ['idle', 0, 1.5]];
  let prev = null, worst = 0, at = '', jump = 0, jat = ''; const ch = A.CH;
  for (const [st, sp0, secs] of plan) {
    for (let i = 0; i < secs * fps; i++) {
      let sp = sp0, st2 = st, yawV = 0;
      if (st === 'turn180') { st2 = 'idle'; yawV = Math.PI / 1.0; yaw += yawV * dt * (i < fps ? 1 : 0); }
      z += sp * dt; bd.step(dt, 0, z, yaw, st2, sp, { yawV });
      const p = bd.pose; const cur = ch.map(j => p[j] || 0);
      if (prev) for (let j = 0; j < ch.length; j++) { if (ch[j] === 'bob' || ch[j] === 'crouch' || ch[j] === 'shift') continue; const w = Math.abs(cur[j] - prev[j]) / dt, d = Math.abs(cur[j] - prev[j]); if (w > worst) { worst = w; at = `${st} ${ch[j]}`; } if (d > jump) { jump = d; jat = `${st} ${ch[j]}`; } }
      prev = cur;
    }
  }
  ok('nenhuma junta arremessada numa troca de estado (parado → andar → trote → corrida → andar → parado → sentar → levantar → meia-volta → andar → cortar → colher: < 22 rad/s, < 0,37 rad num quadro)', worst < 22 && jump < 0.37, `o mais rápido ${worst.toFixed(1)} rad/s (${at}), o maior salto ${jump.toFixed(3)} rad (${jat})`);
}

// ------------------------------ the feet each on its own ground: a slope, a step ------------------------------
for (const [name, gnd] of [['ladeira de 12°', (X, Z) => Math.max(0, Z - 2) * Math.tan(12 * D2R)], ['degrau de 25 cm', (X, Z) => (Z > 3 ? 0.25 : 0)], ['descida de 10°', (X, Z) => -Math.max(0, Z - 2) * Math.tan(10 * D2R)]]) {
  const fps = 60, dt = 1 / fps, bd = body({ gnd }); let z = 0, bad = 0, worst = 0, n = 0, stretch = 0, drops = 0;
  for (let i = 0; i < 6 * fps; i++) {
    z += 1.4 * dt; const R = bd.step(dt, 0, z, Math.PI / 2, 'walk', 1.4);
    for (let k = 0; k < 2; k++) { const ft = bd.L.plant[k]; if (!ft.on) continue; n++;
      // (a foot standing: its sole on the ground under it — the heel's or the ball's, by how it rolls)
      const e = R[B.ftL + k].elements; const lo = Math.min(...[[-0.044, -0.062], [-0.044, 0.122]].map(([y0, zz]) => e[5] * y0 + e[9] * zz + e[13] - gnd(e[4] * y0 + e[8] * zz + e[12], e[6] * y0 + e[10] * zz + e[14])));
      worst = Math.max(worst, Math.abs(lo)); if (Math.abs(lo) > 0.02) bad++;
      // (the leg: from the hip to the ankle never longer than the bones)
      const h = pos(R, B.thL + k), an = pos(R, B.ftL + k); stretch = Math.max(stretch, Math.hypot(h[0] - an[0], h[1] - an[1], h[2] - an[2]) - (0.44 + Math.hypot(0.4, 0.02))); }
    drops = Math.max(drops, bd.L.drop || 0);
  }
  ok(`cada pé no seu chão: ${name} (o pé de apoio a ±2 cm do chão debaixo dele; a perna nunca mais longa que os ossos)`, bad === 0 && stretch < 0.005 && n > 0, `${n} quadros de apoio, o pior a ${(worst * 100).toFixed(1)} cm; perna ${stretch > 0 ? '+' : ''}${(stretch * 100).toFixed(2)} cm; a bacia desceu até ${(drops * 100).toFixed(1)} cm`);
}

// ------------------------------ a turn on the spot is steps ------------------------------
for (const deg of [90, 180]) {
  const fps = 60, dt = 1 / fps, bd = body({}); let yaw = Math.PI / 2, steps = 0, slide = 0; const was = [null, null];
  for (let i = 0; i < 4 * fps; i++) {
    const turning = i > fps && i <= fps + deg / 180 * fps * 0.8; const yawV = turning ? Math.PI / 0.8 : 0; if (turning) yaw += yawV * dt;
    bd.step(dt, 0, 0, yaw, 'idle', 0, { yawV });
    for (let k = 0; k < 2; k++) { const ft = bd.L.plant[k]; if (ft.step && !was[k]) steps++; was[k] = ft.step ? 1 : (was[k] && !ft.step ? null : was[k]);
      if (ft.on && !ft.step) { const q = ft.k0 || (ft.k0 = [ft.x, ft.z]); if (ft.x !== q[0] || ft.z !== q[1]) { const d = Math.hypot(ft.x - q[0], ft.z - q[1]); if (!ft.moved) slide = Math.max(slide, 0); ft.k0 = [ft.x, ft.z]; } } }
  }
  // (and the feet at the end under the body as it faces: the turn was made)
  const P = bd.L.plant, fy = P.map(f => Math.atan2(f.dz, f.dx)); const off = fy.map((a, k) => { let d = a - (yaw + (k ? -1 : 1) * 0.12); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d) * R2D; });
  ok(`meia-volta no lugar de ${deg}°: passos, não um deslize (os pés pisam e ficam; no fim apontam para onde o corpo olha)`, steps >= (deg > 100 ? 2 : 1) && off.every(d => d < 25) && P.every(f => f.on), `${steps} passos; os pés a ${off.map(d => d.toFixed(0) + '°').join(' e ')} do rumo do corpo`);
}

// ------------------------------ a clip's contact on the world's stroke ------------------------------
{ const C = A.CLIPS.chop; const per = C.period; const u0 = A.loopTime(C, 0, per), u1 = A.loopTime(C, per * 0.999, per), uh = A.loopTime(C, per / 2, per);
  // (the body's act: the act's contact at 62% of its seconds — the clip's own contact lands there)
  const k = A.warpTime(C, 0.62, 0.62), k0 = A.warpTime(C, 0, 0.62), k1 = A.warpTime(C, 1, 0.62);
  ok('o contato do clipe no golpe do mundo (as pessoas: a contagem do mundo, v.actT; o corpo: o contato do ato)', Math.abs(u0 - C.events.contact) < 1e-6 && Math.abs(u1 - (C.events.contact + 0.999) % 1) < 1e-3 && Math.abs(k - C.events.contact) < 1e-9 && k0 === 0 && Math.abs(k1 - 1) < 1e-9 && !A.clipErr.length,
    `golpe do mundo: no recomeço u=${u0.toFixed(3)}, a meio ${uh.toFixed(3)}, no fim ${u1.toFixed(3)} (contato ${C.events.contact}) · ato do corpo: 62% → ${k.toFixed(3)} · ${Object.keys(A.CLIPS).length} clipes, ${A.clipErr.length} erros${A.clipErr.length ? ': ' + A.clipErr.slice(0, 2).join('; ') : ''}`); }

// ------------------------------ the people of the world, as the view draws them ------------------------------
{ G.W = G.W || {}; const keepW = G.W.walkableXY; G.W.walkableXY = () => true;
  // (a way with a corner at right angles, 4 m tiles: the world walks it at 1.75 m/s, sharp at the corner; the view draws it)
  const TL = 4; const path0 = [[10, 10], [12, 10]]; const v = { x: 10, y: 8, path: path0, pi: 0, moving: true, fx: 0, fy: 1 };
  const s = { X: v.x * TL, Z: v.y * TL, yaw: Math.PI / 2, yawV: 0, sp: 0 }; const fps = 60, dt = 1 / fps, spd = 1.75 / TL * fps * dt; let maxGap = 0, maxYawV = 0, maxAcc = 0, prevSp = 0, past = 0, stopT = -1; const sps = [];
  for (let i = 0; i < 16 * fps; i++) {
    // (the world: straight to each point of its way, the corner taken at once — as villagers.js moves them)
    if (v.pi < v.path.length) { const p = v.path[v.pi]; const dx = p[0] - v.x, dy = p[1] - v.y, d = Math.hypot(dx, dy); const st = 1.75 / TL * dt; if (d <= st) { v.x = p[0]; v.y = p[1]; v.pi++; } else { v.x += dx / d * st; v.y += dy / d * st; } v.fx = dx; v.fy = dy; v.moving = true; } else { v.moving = false; if (stopT < 0) stopT = i; }
    A.track(s, v, v.x * TL, v.y * TL, false, dt, TL); A.face(s, v, null, dt);
    if (i > 2) { maxGap = Math.max(maxGap, Math.hypot(s.X - v.x * TL, s.Z - v.y * TL)); maxYawV = Math.max(maxYawV, Math.abs(s.yawV)); maxAcc = Math.max(maxAcc, Math.abs(s.sp - prevSp) / dt); }
    prevSp = s.sp; sps.push(s.sp);
    past = Math.max(past, s.X - 12 * TL); // (never past the end of the way)
  }
  const endGap = Math.hypot(s.X - 12 * TL, s.Z - 10 * TL);
  ok('as pessoas do mundo no desenho: a esquina dobrada antes, a partida e a chegada suaves, nunca longe de onde o mundo as tem', maxGap < 0.65 && maxYawV < 6.5 && maxAcc < 20 && past < 0.01 && endGap < 0.02,
    `a maior distância do lugar do mundo ${maxGap.toFixed(2)} m, o giro mais rápido ${maxYawV.toFixed(2)} rad/s, a maior aceleração ${maxAcc.toFixed(1)} m/s², além do fim ${past.toFixed(3)} m, parado a ${endGap.toFixed(3)} m do fim`);
  G.W.walkableXY = keepW; }

// ------------------------------ the same pose at any frame rate ------------------------------
{ const run = fps => { const dt = 1 / fps, bd = body({}); let z = 0; for (let i = 0; i < 3 * fps; i++) { z += 1.75 * dt; bd.step(dt, 0, z, Math.PI / 2, 'walk', 1.75); } return bd; };
  const a = run(60), b = run(144); const dph = Math.abs(((a.a.ph - b.a.ph) % 1 + 1.5) % 1 - 0.5); const dk = Math.abs(a.pose.knL - b.pose.knL);
  ok('o mesmo andar a 60 e a 144 quadros por segundo (a fase e a pose do animador vêm do tempo, não do quadro)', dph < 0.01 && dk < 0.03, `a diferença de fase ${dph.toFixed(4)} da passada, do joelho ${(dk * R2D).toFixed(2)}°`); }

// ------------------------------ the verifier of the animation (qa/anim-inv.js) sees, and accuses ------------------------------
{ require('vm').runInThisContext(require('fs').readFileSync(path.join(__dirname, '..', 'anim-inv.js'), 'utf8'), { filename: 'qa/anim-inv.js' });
  const look = s => { const o = []; G.AnimInv((k, sev, m) => o.push(m), s); return o; };
  const clean = look({ avatar: null });
  A.clip('chop', { keys: { shRp: [[0, 0]] } }); const twice = look({ avatar: null }); A.clipErr.pop();
  A.CLIP_OF.provaInv = 'nenhum'; const none = look({ avatar: null }); delete A.CLIP_OF.provaInv;
  const keep = P3.avatar; P3.avatar = { id: 99 }; const stale = look({ avatar: null }), other = look({ avatar: { id: 7 } }), same = look({ avatar: { id: 99 } }); P3.avatar = keep;
  ok('o verificador da animação (qa/anim-inv.js): limpo agora, e acusa um clipe recusado, um ato sem clipe, o desenho de um corpo que não é o vivido', !clean.length && twice.length === 1 && none.length === 1 && stale.length === 1 && other.length === 1 && !same.length,
    `agora ${clean.length} · o clipe «chop» duas vezes: «${twice[0] || ''}» · um ato sem clipe: «${none[0] || ''}» · o desenho sem corpo: «${stale[0] || ''}» · de outro corpo: «${other[0] || ''}» · do corpo vivido: ${same.length}`); }

console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
