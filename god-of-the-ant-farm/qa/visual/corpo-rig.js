// corpo-rig: the people's skin tested without a browser (a second, no WebGL): the rig of js/people3d.js and the meshes of
// js/bodymesh.js loaded in node, and the skin bent on the CPU exactly as the shader of js/body3d.js bends it.
//   node qa/visual/corpo-rig.js                 → the proofs: the bind agrees with the meshes; every animation state, over
//                                                  its cycle, gives numbers (no NaN), feet on the ground when standing and
//                                                  walking, the hands at the ends of the arms, nothing stretched
//   node qa/visual/corpo-rig.js dump STATE T SP OUT.bin [mesh]  → the bent mesh (positions, triangles) for a picture
// (G.People3D.rig and G.Body3D's matrices are the game's own: nothing here is a copy of them)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
global.window = global; global.G = {}; window.G = G;
global.localStorage = { getItem: () => null, setItem() { }, removeItem() { } };
global.atob = s => Buffer.from(s, 'base64').toString('binary');
global.performance = global.performance || { now: () => Date.now() };
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
run('js/lib/three.min.js'); global.THREE = THREE;
run('js/util.js');
G.worldHooks = G.worldHooks || []; G.mapHooks = G.mapHooks || [];
G.W = G.W || {}; G.Render = { nightness: () => 0 }; G.Art = { CLOTH: {}, icon: () => null }; G.Fac = { ofV: () => null, hex: () => '#884422' };
// (the trades' own colours, read from js/art.js as the game has them)
{ const m = fs.readFileSync(path.join(ROOT, 'js/art.js'), 'utf8').match(/const CLOTH = (\{[\s\S]*?\});/); if (m) G.Art.CLOTH = vm.runInThisContext('(' + m[1] + ')'); }
try { run('js/civs.js'); } catch (e) { } // (the peoples' colours, for the clothes)
run('js/bodymesh.js'); run('js/body3d.js'); run('js/people3d.js');
// (the realm the modules are given: a scene and the quality — enough to make their meshes)
const scene = new THREE.Scene();
const realm = { scene: () => scene, Q: () => ({ view: 420, npcs: 36, detail: 1 }) };
G.People3D.init(THREE, realm);
const P3 = G.People3D, B3 = G.Body3D, A = G.Anim3D;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-rig ${name} | ${info}`); if (!c) fails.push(name); };

// ------------------------------ the skin on the CPU (the shader's b3skin) ------------------------------
function decode(m) {
  const b = s => new Uint8Array(Buffer.from(s, 'base64'));
  const q = new Uint16Array(b(m.pos).buffer.slice(0)); const pos = new Float32Array(m.n * 3);
  for (let i = 0; i < m.n; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = m.lo[k] + q[i * 3 + k] * m.sc[k];
  const ib = b(m.idx); const idx = m.i32 ? new Uint32Array(ib.buffer.slice(0)) : new Uint16Array(ib.buffer.slice(0));
  return { n: m.n, pos, bi: b(m.bi), bw: b(m.bw), zone: b(m.zone), idx };
}
const MESH = {}; for (const k in G.BODYMESH.meshes) MESH[k] = decode(G.BODYMESH.meshes[k]);
function bend(mesh, row, clock) {
  const buf = B3._buf(); const TW = B3._tw(); const o = row * TW * 4; const out = new Float32Array(mesh.n * 3);
  for (let i = 0; i < mesh.n; i++) {
    let x = 0, y = 0, z = 0; const px = mesh.pos[i * 3], py = mesh.pos[i * 3 + 1], pz = mesh.pos[i * 3 + 2]; const U = [0, 0, 0];
    for (let k = 0; k < 4; k++) { const w = mesh.bw[i * 4 + k] / 255; if (!w) continue; const j = o + mesh.bi[i * 4 + k] * 12;
      x += w * (buf[j] * px + buf[j + 1] * py + buf[j + 2] * pz + buf[j + 3]); y += w * (buf[j + 4] * px + buf[j + 5] * py + buf[j + 6] * pz + buf[j + 7]); z += w * (buf[j + 8] * px + buf[j + 9] * py + buf[j + 10] * pz + buf[j + 11]);
      U[0] += w * buf[j + 1]; U[1] += w * buf[j + 5]; U[2] += w * buf[j + 9]; }
    const zn = mesh.zone[i]; if ((zn === 5 || zn === 6 || zn === 7 || zn === 15 || zn === 21) && !process.env.SEMPANO) [x, y, z] = cloth([x, y, z], [px, py, pz], zn, buf, o + G.BODYMESH.bones.length * 12, clock || { t: 0, wind: [0, 0, 0] }, U);
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  }
  return out;
}
// (the shader's b3cloth, line by line: the cloth's own motion, then kept off the trunk, the arms, the legs, the ground)
function cloth(P, p, zn, buf, pb, clock, U) {
  const V = k => [buf[pb + k * 4], buf[pb + k * 4 + 1], buf[pb + k * 4 + 2], buf[pb + k * 4 + 3]];
  const add = (a, b, f) => [a[0] + b[0] * f, a[1] + b[1] * f, a[2] + b[2] * f], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = a => Math.hypot(a[0], a[1], a[2]);
  const cl = (v, a, b) => Math.min(b, Math.max(a, v)), ss = (a, b, x) => { const t = cl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const off = (P, a, b, r) => { const ab = sub(b, a); const t = cl(dot(sub(P, a), ab) / Math.max(dot(ab, ab), 1e-8), 0, 1); const d = sub(P, add(a, ab, t)); const l = len(d); return l < r && l > 1e-5 ? add(P, d, (r - l) / l) : P; };
  const out = (P, a, b, r, u) => { const ab = sub(b, a); const t = cl(dot(sub(P, a), ab) / Math.max(dot(ab, ab), 1e-8), 0, 1); const d = sub(P, add(a, ab, t)); const l2 = dot(d, d); if (l2 >= r * r) return P; const du = dot(d, u); return add(P, u, -du + Math.sqrt(Math.max(du * du - l2 + r * r, 0))); };
  const cape = zn === 7 || zn === 15 || zn === 21; const m = V(20), gs = V(21), s = gs[1];
  const pel = V(22), nk = V(23), ex = V(24), ez = V(25); const L = len(sub(nk, pel)), up = sub(nk, pel).map(q => q / L);
  // (the skirt: a point blended between two panels keeps its distance from the hips' line)
  if (!cape) { const ob = pb - G.BODYMESH.bones.length * 12; const q0 = buf.slice(ob, ob + 4), q1 = buf.slice(ob + 4, ob + 8), q2 = buf.slice(ob + 8, ob + 12);
    const hc = [q0[1] * 0.88 + q0[3], q1[1] * 0.88 + q1[3], q2[1] * 0.88 + q2[3]], hx0 = [q0[0], q1[0], q2[0]], hx = hx0.map(q => q / (len(hx0) || 1));
    const hr = sub(P, hc), hp = dot(hr, hx), hq = add(hr, hx, -hp), hl = len(hq), hw = Math.hypot(p[1] - 0.88, p[2]) * s;
    if (hl > 1e-4 && hl < hw) P = add(add(hc, hx, hp), hq, hw / hl); }
  let w = zn === 7 ? cl((1.40 - p[1]) / 0.85, 0, 1) : cl((0.98 - p[1]) / 0.85, 0, 1); w = w * w * (3 - 2 * w);
  const t = clock.t + m[2], sp = Math.min(m[1], 6), W = clock.wind;
  let rd = sub(sub(P, pel), up.map(q => q * cl(dot(sub(P, pel), up), 0, L))); rd = len(rd) > 1e-4 ? rd.map(q => q / len(rd)) : ez.map(q => -q);
  P = add(P, up, m[0] * w * (cape ? 1 : 0.5));
  P = add(P, rd, Math.sin(t * (4.2 + sp * 1.6) - p[1] * 11 + p[0] * 7) * (0.004 + 0.005 * sp) * w * (cape ? 1 : 0.35) * s);
  P = add(P, [W[0], 0, W[1]], ((cape ? 0.022 : 0.008) + 0.012 * W[2]) * w * (0.75 + 0.25 * Math.sin(t * (1.3 + W[2] * 0.8) + p[1] * 4 + p[0] * 5)) * s);
  P = add(P, rd, Math.sin(t * (5 + W[2] * 2) + p[0] * 17 - p[1] * 11) * 0.006 * W[2] * w * (cape ? 1 : 0.4) * s);
  if (cape) {
    const sL = V(26), eL = V(27), wL = V(28), sR = V(29), eR = V(30), wR = V(31);
    if (zn !== 21) { P = off(P, V(38), V(38), 0.078 * s); P = off(P, V(39), V(39), 0.078 * s); }
    P = off(P, add(sL, sub(eL, sL), 0.15), eL, 0.072 * s); P = off(P, eL, wL, 0.056 * s); P = off(P, wL, add(wL, sub(wL, eL), 0.62), 0.052 * s);
    P = off(P, add(sR, sub(eR, sR), 0.15), eR, 0.072 * s); P = off(P, eR, wR, 0.056 * s); P = off(P, wR, add(wR, sub(wR, eR), 0.62), 0.052 * s);
    const h = dot(sub(P, pel), up); const q = sub(sub(P, pel), up.map(v => v * cl(h, 0, L))); const qx = dot(q, ex), qz = dot(q, ez);
    const u = cl(h / L, 0, 1); const rx = (0.17 + 0.03 * u) * s, rz = (0.135 - 0.013 * u) * s; const k = Math.cbrt(Math.abs(qx / rx) ** 3 + Math.abs(qz / rz) ** 3);
    const kk = cl((1.40 - p[1]) / 0.1, 0, 1); if (k < 1 && k > 1e-4 && zn !== 21) P = add(add(P, ex, qx * (1 / k - 1) * kk), ez, qz * (1 / k - 1) * kk);
  }
  if (cape) { const lr = (zn === 15 || zn === 21 ? 1 : ss(0.97, 0.82, p[1])) * s;
    P = off(P, V(32), V(33), 0.092 * lr); P = out(P, V(33), V(34), 0.07 * lr, rd); P = off(P, V(35), V(36), 0.092 * lr); P = out(P, V(36), V(37), 0.07 * lr, rd); }
  else { const h0 = dot(sub(P, pel), up); if (p[1] > 0.45 && h0 > -0.25 * s) { const h = h0; const q = sub(sub(P, pel), up.map(v => v * cl(h, 0, L))); const qx = dot(q, ex), qz = dot(q, ez);
      const fw = V(19)[3], g = ss(0.05, 0.3, h / s); const k = Math.hypot(qx / ((0.155 + 0.017 * fw + 0.02 * g) * s), qz / ((0.112 + 0.012 * fw + 0.025 * g) * s)); if (k < 1 && k > 1e-4) P = add(add(P, ex, qx * (1 / k - 1)), ez, qz * (1 / k - 1)); }
    { const hk = Math.max(0, 0.38 - p[1]); if (hk > 0) { const ul = len(U); P = add(P, [U[0], U[1] - ul, U[2]], hk * (1 - ss(0.55, 0.85, U[1] / Math.max(ul, 1e-5))) * ss(0.45, 0.75, up[1])); } }
    const fm = V(19)[3], nl = a => a.map(q => q / (len(a) || 1)); const uL = ss(-0.8, -0.3, dot(nl(sub(V(33), V(32))), up)), uR = ss(-0.8, -0.3, dot(nl(sub(V(36), V(35))), up));
    const hL = add(V(32), sub(V(33), V(32)), 0.1 - 0.1 * uL), hR = add(V(35), sub(V(36), V(35)), 0.1 - 0.1 * uR);
    const r0 = 0.1 + 0.004 * fm, r1 = 0.105 + 0.012 * fm;
    P = off(P, hL, V(33), (r0 + (r1 - r0) * uL) * s); P = out(P, V(33), V(34), 0.068 * s, rd); P = off(P, hR, V(36), (r0 + (r1 - r0) * uR) * s); P = out(P, V(36), V(37), 0.068 * s, rd);
    P = off(P, V(41), V(41), (0.075 + 0.016 * fm) * s); P = off(P, V(42), V(42), (0.075 + 0.016 * fm) * s);
    P = off(P, V(27), V(28), 0.05 * s); P = off(P, V(28), add(V(28), sub(V(28), V(27)), 0.62), 0.048 * s); P = off(P, V(30), V(31), 0.05 * s); P = off(P, V(31), add(V(31), sub(V(31), V(30)), 0.62), 0.048 * s); }
  if (gs[2] > 0.5) P[1] = Math.max(P[1], gs[0] + 0.012 * s);
  return P;
}
const LOOK = { s: 1, skin: '#d8a888', hair: '#3a2a1a', cloth: '#8a6a4a', pants: '#5a4a3a', feet: '#3a2a1e', belt: '#2a1a10', fem: false };
// a body in a pose at the origin facing +Z (yaw π/2), its skin bent
function pose(st, t, sp, look) {
  const L = Object.assign({}, LOOK, look || {}); const p = A.POSE0();
  // (the state's pose, blended in for a while from rest — as the game does)
  for (let k = 0; k < 40; k++) A.blend(p, A.pose(st, t - (40 - k) * 0.01, sp), 0.05, 12);
  if (!/swim|tread|drown|jump|fall|climb/.test(st)) L.ground = 0;
  B3.begin(); P3.body(0, 0, 0, 0, Math.PI / 2, p, L, null); B3.end();
  return { p, L };
}

// (as a module: the lab itself, for other scripts — require('./corpo-rig.js'))
if (require.main !== module) { module.exports = { G, THREE, P3, B3, A, pose, bend, MESH, LOOK }; return; }
if (process.argv[2] === 'dump') {
  const [, , , st, t, sp, out, mname] = process.argv;
  const { L } = pose(st, +t, +sp, process.env.FEM ? { fem: true } : null);
  const m = MESH[mname || (L.fem ? 'corpoF' : 'corpoM')]; const P = bend(m, 0);
  const hdr = Buffer.alloc(8); hdr.writeUInt32LE(m.n, 0); hdr.writeUInt32LE(m.idx.length / 3, 4);
  fs.writeFileSync(out, Buffer.concat([hdr, Buffer.from(P.buffer), Buffer.from(new Uint32Array(m.idx).buffer), Buffer.from(m.zone.buffer, m.zone.byteOffset, m.n)]));
  console.log('ok', m.n, m.idx.length / 3);
  process.exit(0);
}

// ------------------------------ the proofs ------------------------------
ok('o corpo contínuo começou', B3.ready && P3.skin(), JSON.stringify({ ready: B3.ready, failed: B3.failed, bindErr: B3.bindErr }));
// (in the bind pose every bone's matrix is the identity: the mesh is drawn exactly as modelled)
{ const p = A.POSE0(); Object.assign(p, { elL: 0, elR: 0, knL: 0, knR: 0, shLr: G.BODYMESH.roll - 0.05, shRr: -(G.BODYMESH.roll - 0.05) });
  B3.begin(); P3.body(0, 0, 0, 0, Math.PI / 2, p, LOOK, null); B3.end(); const P = bend(MESH.corpoM, 0); let e = 0;
  for (let i = 0; i < P.length; i++) e = Math.max(e, Math.abs(P[i] - MESH.corpoM.pos[i]));
  ok('na pose de modelagem a pele é a malha', e < 1e-4, `desvio máximo ${e.toExponential(2)} m`); }
// every state, over its cycle: numbers; the lowest point of the feet at the ground for those that stand or walk; no part
// flung away from the body (the longest edge of the bent mesh against the modelled one)
const M0 = MESH.corpoM; let edge0 = 0; const E = [];
for (let i = 0; i < M0.idx.length; i += 3) for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) { const u = M0.idx[i + a], v = M0.idx[i + b]; E.push([u, v]); const d = Math.hypot(M0.pos[u * 3] - M0.pos[v * 3], M0.pos[u * 3 + 1] - M0.pos[v * 3 + 1], M0.pos[u * 3 + 2] - M0.pos[v * 3 + 2]); edge0 = Math.max(edge0, d); }
const FOOT = new Set(['ftL', 'ftR', 'toeL', 'toeR'].map(b => G.BODYMESH.bones.indexOf(b)));
const footV = []; for (let i = 0; i < M0.n; i++) if (FOOT.has(M0.bi[i * 4]) && M0.bw[i * 4] > 128) footV.push(i);
const res = {}; const chk = new Set();
for (const st of A.STATES) {
  let nan = 0, stretch = 0, minY = 1e9, maxY = -1e9;
  for (let k = 0; k < 8; k++) {
    const t = k / 8 * Math.PI * 2; pose(st, t, st === 'run' ? 4.5 : 1.4); const P = bend(M0, 0); for (const e of B3.check()) chk.add(st + ': ' + e);
    for (let i = 0; i < P.length; i++) if (!Number.isFinite(P[i])) nan++;
    for (const [u, v] of E) { const d = Math.hypot(P[u * 3] - P[v * 3], P[u * 3 + 1] - P[v * 3 + 1], P[u * 3 + 2] - P[v * 3 + 2]); stretch = Math.max(stretch, d / edge0); }
    let lo = 1e9; for (const i of footV) lo = Math.min(lo, P[i * 3 + 1]); minY = Math.min(minY, lo); maxY = Math.max(maxY, lo);
  }
  res[st] = { nan, stretch: +stretch.toFixed(2), feet: [+minY.toFixed(3), +maxY.toFixed(3)] };
}
ok('o verificador do desenho (Body3D.check) limpo em todas as poses', !chk.size, [...chk].slice(0, 3).join(' · ') || 'limpo');
const bad = Object.entries(res).filter(([, r]) => r.nan || r.stretch > 2.6);
ok('todas as animações: números, nada esticado', !bad.length, bad.length ? JSON.stringify(Object.fromEntries(bad)) : `${A.STATES.length} estados, 8 momentos cada; maior aresta ${Math.max(...Object.values(res).map(r => r.stretch))}× a da malha`);
const stand = ['idle', 'walk', 'talk', 'carry', 'wave', 'interact', 'turn'];
const sunk = stand.filter(s => res[s] && (res[s].feet[0] < -0.045 || res[s].feet[0] > 0.03));
ok('de pé e andando, os pés no chão (nem afundados nem no ar)', !sunk.length, stand.map(s => `${s} ${res[s].feet.join('..')}`).join(' · '));
// the stride in step with the ground: the body moving forward at a speed, its gait's phase at Anim.rate — the foot that
// stands on the ground stays put (its slip, per metre walked, small)
{ const slips = []; const BN = G.BODYMESH.bones;
  for (const [st, sp] of [['walk', 0.6], ['walk', 1.4], ['walk', 2.2], ['run', 3.2], ['run', 4.5], ['run', 6]]) {
    const rate = A.rate(st, sp, 1); const dt = 1 / 120; let slip = 0, went = 0, prev = null; const p = A.POSE0(); const feet = [{ on: 0 }, { on: 0 }];
    for (let k = 0; k < 360; k++) {
      const t = k * dt, z0 = sp * t; A.blend(p, A.pose(st, rate * sp * t, sp), dt, 12);
      const R = P3.rig(0, 0, z0, Math.PI / 2, p, { s: 1, ground: 0, plant: feet });
      // (each foot on the ground: the point it stands on — the heel alone, the ball alone, or the whole sole flat (then its
      // middle) — and how far that point moved since the last frame, if it stood on the same point then; a foot rolling
      // from the heel to the ball does not slide)
      const pts = []; let on = false;
      for (let q = 0; q < 2; q++) { const e = R[BN.indexOf(q ? 'ftR' : 'ftL')].elements; const P = [[-0.044, -0.062], [-0.044, 0.122]].map(([y0, zz]) => [e[5] * y0 + e[9] * zz + e[13], e[6] * y0 + e[10] * zz + e[14]]);
        const h = P[0][0] < 0.006, b = P[1][0] < 0.006; pts.push(h && b ? ['f', (P[0][1] + P[1][1]) / 2] : h ? ['h', P[0][1]] : b ? ['b', P[1][1]] : null); }
      if (prev) for (let q = 0; q < 2; q++) if (pts[q] && prev[q] && pts[q][0] === prev[q][0]) { slip += Math.abs(pts[q][1] - prev[q][1]); on = true; }
      if (on) went += sp * dt;
      prev = pts;
    }
    slips.push(`${st} ${sp} m/s: ${(slip / Math.max(went, 1e-6) * 100).toFixed(0)}%`);
    if (slip / Math.max(went, 1e-6) > 0.15) fails.push('passada ' + st + ' ' + sp);
  }
  ok('o pé de apoio não desliza (o quanto ele escorrega, por metro andado com ele no chão)', !fails.some(f => f.startsWith('passada')), slips.join(' · ')); }
// the cloth over the body: in every state, over its cycle, how much of a cape, a short skirt and a long one is inside the
// skin (its nearest point of the skin, and that point's normal: deeper than 8 mm under it)
const inside = (cm, bm) => {
  const C = bend(cm, 0), Bp = bend(bm, 0); const nb = bm.n; const N = new Float32Array(nb * 3);
  for (let i = 0; i < bm.idx.length; i += 3) { const a = bm.idx[i], b = bm.idx[i + 1], c = bm.idx[i + 2];
    const ux = Bp[b * 3] - Bp[a * 3], uy = Bp[b * 3 + 1] - Bp[a * 3 + 1], uz = Bp[b * 3 + 2] - Bp[a * 3 + 2], vx = Bp[c * 3] - Bp[a * 3], vy = Bp[c * 3 + 1] - Bp[a * 3 + 1], vz = Bp[c * 3 + 2] - Bp[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; for (const q of [a, b, c]) { N[q * 3] += nx; N[q * 3 + 1] += ny; N[q * 3 + 2] += nz; } }
  const H = new Map(), cs = 0.05, key = (x, y, z) => Math.floor(x / cs) + ',' + Math.floor(y / cs) + ',' + Math.floor(z / cs);
  for (let i = 0; i < nb; i++) { if (bm.zone[i] !== 0) continue; const k = key(Bp[i * 3], Bp[i * 3 + 1], Bp[i * 3 + 2]); if (!H.has(k)) H.set(k, []); H.get(k).push(i); }
  let bad = 0, worst = 0;
  for (let i = 0; i < cm.n; i++) {
    const x = C[i * 3], y = C[i * 3 + 1], z = C[i * 3 + 2]; let best = -1, bd = 1e9;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { const l = H.get(key(x + dx * cs, y + dy * cs, z + dz * cs)); if (l) for (const j of l) { const d = (Bp[j * 3] - x) ** 2 + (Bp[j * 3 + 1] - y) ** 2 + (Bp[j * 3 + 2] - z) ** 2; if (d < bd) { bd = d; best = j; } } }
    if (best < 0) continue; const nl = Math.hypot(N[best * 3], N[best * 3 + 1], N[best * 3 + 2]) || 1;
    const dep = -((x - Bp[best * 3]) * N[best * 3] + (y - Bp[best * 3 + 1]) * N[best * 3 + 1] + (z - Bp[best * 3 + 2]) * N[best * 3 + 2]) / nl;
    if (dep > 0.008 && Math.sqrt(bd) < 0.06) { bad++; worst = Math.max(worst, dep); }
  }
  return { frac: bad / cm.n, worst };
};
// (a cape: in every state. A skirt: in every state but the deep seats — sitting, on the ground, crouching, lying —, where a
// skin bent by bones cannot lay a skirt over thighs raised to the belly: there at most 6% of it, never deeper than 3 cm, and
// the numbers said every run — the limit of this test, not of the look: wave 1 had 12% there)
{ const out = []; let fail = 0; const SEAT = new Set(['sit', 'rest', 'sneak', 'sleep', 'low']); // (low: bent double, gathering from the ground)
  for (const nm of ['capa', 'toga', 'bata', 'saiaC', 'saiaL']) { if (!MESH[nm]) continue; const row = [];
    for (const st of A.STATES) { let fr = 0, wo = 0;
      for (let k = 0; k < 6; k++) for (const bd of nm === 'bata' ? ['corpoF'] : nm === 'capa' || nm === 'toga' ? ['corpoM'] : ['corpoM', 'corpoF']) { pose(st, k / 6 * Math.PI * 2, st === 'run' ? 4.5 : 1.4, bd === 'corpoF' ? { fem: true } : null); const r = inside(MESH[nm], MESH[bd]); fr = Math.max(fr, r.frac); wo = Math.max(wo, r.worst); } // (a skirt on both bodies: the woman's hips and thighs are her own)
      const seat = nm !== 'capa' && nm !== 'toga' && SEAT.has(st), bad = seat ? fr > 0.06 || wo > 0.03 : fr > 0.01;
      if (bad || (seat && fr > 0.01)) row.push(`${st} ${(fr * 100).toFixed(1)}% (${(wo * 100).toFixed(1)} cm)${bad ? ' FALHA' : ''}`); if (bad) fail++; }
    out.push(`${nm}: ${row.length ? row.join(', ') : 'limpa'}`); }
  ok('a capa, a toga, a blusa e as saias não atravessam o corpo (capa e toga: em todos os estados ≤1% do pano a mais de 8 mm dentro da pele; blusa e saias: ≤1%, sentadas ≤6% e ≤3 cm)', !fail, out.join(' · ')); }
// the body out through a skirt — what A6's hunt saw at the door of Hedeby (the thighs through the long skirt), counted with
// the cloth as the shader lays it: from each point of the hips and the legs, the segment from its bone's axis (inside the
// pelvis, the thigh, the shin) out to it; if the skirt's outer surface crosses it more than 3 mm short of the point, the
// point is out through the cloth (a leg out under the hem crosses nothing: it is not through). Where the body is painted as
// the skirt — from the belt down to a little above the hem, body3d's b3paint — a point through shows as the cloth; below,
// as skin or trousers: that never, in any state on land. And walking, standing and working nothing at all comes through
// (the seats, the water and lying down: their numbers said, every run)
const HEM = G.BODYMESH.hem || { saiaC: 0.5, saiaL: 0.12 };
const AXB = new Int8Array(G.BODYMESH.bones.length).fill(-1);
for (const [n, k] of [['pel', 0], ['spine', 0], ['thL', 1], ['hpHL', 1], ['knHL', 1], ['thR', 2], ['hpHR', 2], ['knHR', 2], ['snL', 3], ['snR', 4]]) { const i = G.BODYMESH.bones.indexOf(n); if (i >= 0) AXB[i] = k; }
const through = (cm, bm, hem) => {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const C = bend(cm, 0), Bp = bend(bm, 0); const buf = B3._buf(), pb = G.BODYMESH.bones.length * 12; const V = k => [buf[pb + k * 4], buf[pb + k * 4 + 1], buf[pb + k * 4 + 2]];
  const pel = V(22), nk = V(23); const ul = Math.hypot(nk[0] - pel[0], nk[1] - pel[1], nk[2] - pel[2]); const up = [0, 1, 2].map(k => (nk[k] - pel[k]) / ul);
  const SEG = [[pel, pel.map((v, k) => v + up[k] * 0.12)], [V(32), V(33)], [V(35), V(36)], [V(33), V(34)], [V(36), V(37)]];
  const cs = 0.04, H = new Map(), key = (i, j, k) => i + ',' + j + ',' + k, T = cm.idx;
  for (let t = 0; t < T.length; t += 3) { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let q = 0; q < 3; q++) for (let k = 0; k < 3; k++) { const v = C[T[t + q] * 3 + k]; lo[k] = Math.min(lo[k], v); hi[k] = Math.max(hi[k], v); }
    for (let i = Math.floor(lo[0] / cs); i <= Math.floor(hi[0] / cs); i++) for (let j = Math.floor(lo[1] / cs); j <= Math.floor(hi[1] / cs); j++) for (let k = Math.floor(lo[2] / cs); k <= Math.floor(hi[2] / cs); k++) { const kk = key(i, j, k); if (!H.has(kk)) H.set(kk, []); H.get(kk).push(t); } }
  let out = 0, shown = 0, worst = 0; const seen = new Set();
  for (let i = 0; i < bm.n; i++) {
    let hw = -1, hb = 0; for (let q = 0; q < 4; q++) if (bm.bw[i * 4 + q] > hw) { hw = bm.bw[i * 4 + q]; hb = bm.bi[i * 4 + q]; }
    const ax = AXB[hb]; if (ax < 0) continue; const [s0, s1] = SEG[ax]; const b = [Bp[i * 3], Bp[i * 3 + 1], Bp[i * 3 + 2]];
    const d = sub(s1, s0), u = Math.max(0, Math.min(1, dot(sub(b, s0), d) / dot(d, d))); const a = [s0[0] + d[0] * u, s0[1] + d[1] * u, s0[2] + d[2] * u];
    const r = sub(b, a), rl = Math.hypot(r[0], r[1], r[2]); if (rl < 1e-4) continue; seen.clear(); let far = -1;
    for (let I = Math.floor(Math.min(a[0], b[0]) / cs); I <= Math.floor(Math.max(a[0], b[0]) / cs); I++) for (let J = Math.floor(Math.min(a[1], b[1]) / cs); J <= Math.floor(Math.max(a[1], b[1]) / cs); J++) for (let K = Math.floor(Math.min(a[2], b[2]) / cs); K <= Math.floor(Math.max(a[2], b[2]) / cs); K++) {
      const l = H.get(key(I, J, K)); if (!l) continue;
      for (const t of l) { if (seen.has(t)) continue; seen.add(t); const p0 = T[t] * 3, p1 = T[t + 1] * 3, p2 = T[t + 2] * 3;
        const e1 = [C[p1] - C[p0], C[p1 + 1] - C[p0 + 1], C[p1 + 2] - C[p0 + 2]], e2 = [C[p2] - C[p0], C[p2 + 1] - C[p0 + 1], C[p2 + 2] - C[p0 + 2]];
        const pv = [r[1] * e2[2] - r[2] * e2[1], r[2] * e2[0] - r[0] * e2[2], r[0] * e2[1] - r[1] * e2[0]], det = dot(e1, pv); if (Math.abs(det) < 1e-12) continue;
        const tv = [a[0] - C[p0], a[1] - C[p0 + 1], a[2] - C[p0 + 2]], uu = dot(tv, pv) / det; if (uu < 0 || uu > 1) continue;
        const qv = [tv[1] * e1[2] - tv[2] * e1[1], tv[2] * e1[0] - tv[0] * e1[2], tv[0] * e1[1] - tv[1] * e1[0]], vv = dot(r, qv) / det; if (vv < 0 || uu + vv > 1) continue;
        const s = dot(e2, qv) / det; if (s > 0 && s < 1 && s > far) far = s; } }
    const dep = far > 0 ? (1 - far) * rl : 0;
    if (dep > 0.003) { out++; worst = Math.max(worst, dep); if (bm.pos[i * 3 + 1] <= hem + 0.03) shown++; }
  }
  return { out, shown, worst };
};
{ const rows = []; let fail = 0; const WET = /swim|tread|drown|sleep/, SEAT = new Set(['sit', 'rest', 'sneak', 'sleep', 'low']);
  for (const nm of ['saiaC', 'saiaL']) for (const bd of ['corpoM', 'corpoF']) { const row = [];
    for (const st of A.STATES) { let o = 0, sh = 0, wo = 0;
      for (let k = 0; k < 6; k++) { pose(st, k / 6 * Math.PI * 2, st === 'run' ? 4.5 : 1.4, bd === 'corpoF' ? { fem: true } : null); const r = through(MESH[nm], MESH[bd], HEM[nm]); o = Math.max(o, r.out); sh = Math.max(sh, r.shown); wo = Math.max(wo, r.worst); }
      const bad = !WET.test(st) && (sh > 0 || (!SEAT.has(st) && o > 0));
      if (o) row.push(`${st} ${o}${sh ? ' (' + sh + ' à mostra)' : ''} até ${(wo * 100).toFixed(1)} cm${bad ? ' FALHA' : ''}`); if (bad) fail++; }
    rows.push(`${nm} em ${bd}: ${row.join(', ') || 'nada'}`); }
  ok('o corpo não sai pela saia (andando, parado e trabalhando nada passa do pano; sentado, o que passa tem a cor do pano: nada à mostra em terra)', !fail, rows.join(' · ')); }

// nobody naked: every sex, age, trade, people, class, the captive, the ruler, the rich, swimming and asleep — drawn, and
// the verifier (Body3D.check) says nothing; and an outfit made bare on purpose, which it must catch
{ const ROLES = [null, 'lenhador', 'coletor', 'agricultor', 'construtor', 'mineiro', 'cacador', 'sacerdote', 'anciao', 'pastor', 'cavalarico', 'acougueiro', 'tecelao', 'ferreiro', 'ourives', 'oleiro', 'mercador', 'feirante', 'taverneiro', 'escriba', 'cobrador', 'contrabandista', 'guerreiro', 'pescador', 'vigia', 'explorador', 'estivador', 'curandeiro', 'carcereiro', 'vinhateiro', 'lavrador'];
  const CIV = ['nordico', 'romano', 'grego', 'egipcio', 'asteca', 'classico'];
  const keepFac = G.Fac.ofV, keepEco = G.Eco; G.Fac.ofV = v => v._fac || null; G.Eco = { homeOf: v => v._home || null };
  const bad = [], nofab = []; let n = 0, row = 0; const st = ['idle', 'swim', 'sleep', 'walk'];
  const flush = () => { B3.end(); for (const e of B3.check()) if (/sem roupa/.test(e)) bad.push(e); B3.begin(); row = 0; };
  B3.begin();
  for (const civ of CIV) for (const g of ['m', 'f']) for (const age of [1, 5, 11, 15, 30, 75]) for (const role of ROLES) for (const k of [0, 1, 2, 3]) {
    const id = 1000 + n; const skins = (G.CIVS && G.CIVS[civ] && G.CIVS[civ].skin) || ['#d8a888'];
    const v = { id, g, age, role: age < 13 ? null : role, civ, skin: skins[n % skins.length], hair: '#3a2a1a', kidCloth: '#4fa0d8', captive: k === 1 ? { from: 2 } : null, home: k >= 2 ? 1 : 0 };
    if (k === 2) v._home = { type: 'sobrado', coin: 100 };
    if (k === 3) v._fac = { id: 1, civ, leader: id };
    const L = P3.look(v); const p = A.POSE0(); Object.assign(p, A.pose(st[n % 4], 0.5, 0));
    const u = L.out || {}; if (!(u.fab >= 1 && u.fab <= 3 && u.fabO >= 1 && u.fabO <= 3)) nofab.push(`${civ} ${g}${age} ${v.role || ''}`); // (the cloth of the stack: wool, linen, leather)
    P3.body(row++, 0, 0, 0, 0, p, Object.assign(L, { ground: st[n % 4] === 'swim' ? undefined : 0 }), null); n++;
    if (row >= B3.MAXR - 1) flush();
  }
  flush(); B3.end(); G.Fac.ofV = keepFac; G.Eco = keepEco;
  // (an outfit stripped on purpose: no tunic, no skirt, no trousers — and one whose only cloth is the skin's colour)
  const o = Object.assign({}, P3.outfit({ id: 7, g: 'm', age: 30, role: 'lenhador', civ: 'egipcio', skin: '#a8744c' })); o.torso = 1; o.skirt = null; o.legs = 0;
  const o2 = Object.assign({}, o, { torso: 0, lin: Object.assign({}, o.lin, { cloth: [0.39, 0.18, 0.073] }) });
  const caught = !!B3.bare(o, '#a8744c'), caught2 = !!B3.bare(o2, '#a8744c');
  ok('ninguém desenhado nu e toda roupa com um tecido da pilha (os seis povos, sexo, criança a velho, ofício, cativo, governante, rico, nadando, dormindo); o verificador acusa quem está nu', !bad.length && !nofab.length && caught && caught2, `${n} pessoas desenhadas, ${bad.length} sem roupa${bad.length ? ': ' + bad.slice(0, 2).join(' · ') : ''}, ${nofab.length} sem tecido${nofab.length ? ': ' + nofab.slice(0, 2).join(' · ') : ''}; o despido de propósito: ${caught ? 'acusado' : 'NÃO acusado'}; o pano da cor da pele: ${caught2 ? 'acusado' : 'NÃO acusado'}`); }
// the frame (People3D.update) in a world of its own: a flat meadow, people and beasts in rings round the body, the eye at
// the body looking one way. It runs; the verifier says nothing; each one's level follows their distance from the eye; who is
// behind the eye (and whose shadow is too) is left out, nobody in its field is — and with the field off, nobody is
{ const N = 96, TL = G.Space ? G.Space.TILE : 4; let err = null; const info = [];
  G.T = G.T || { DEEP: 0, SEA: 1, RIVER: 2, SAND: 3, GRASS: 4, MEADOW: 5, ROCKY: 6 };
  G.Space = Object.assign(G.Space || {}, { TILE: 4, HM: 1.5, stoneTop: () => -Infinity, bedAt: () => 0.3 });
  Object.assign(G.W, { idx: (x, y) => (y | 0) * N + (x | 0), hAt: () => 1, groundH: () => 1, waterH: () => 0.5, inb: (x, y) => x >= 0 && y >= 0 && x < N && y < N });
  G.Animals = G.Animals || { DEF: {} }; G.Animals.DEF.cervo = G.Animals.DEF.cervo || { cls: 'land', size: 1, diet: 'herb', art: 'quad' };
  const S = G.S = { clock: 0, villagers: new Map(), animals: new Map(), type: new Uint8Array(N * N).fill(4), road: new Uint8Array(N * N), ice: null };
  const fx = 48, fy = 48; let id = 1;
  for (const d of [1.5, 2.5, 4, 8, 11, 14, 18, 24, 30, 40]) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + d; // (rings of people, metres off)
    S.villagers.set(id, { id, x: fx + Math.cos(a) * d / 4, y: fy + Math.sin(a) * d / 4, age: 30, g: k % 2 ? 'f' : 'm', role: null, civ: 'nordico', skin: '#d8a888', hair: '#3a2a1a', face: 1 }); id++; }
  for (const d of [6, 15, 30]) for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.3; S.animals.set(id, { id, kind: 'cervo', x: fx + Math.cos(a) * d / 4, y: fy + Math.sin(a) * d / 4 }); id++; }
  const cam = new THREE.PerspectiveCamera(55, 1000 / 620, 0.1, 1600); const focus = { X: fx * 4, Y: 1.5, Z: fy * 4 };
  realm.camera = () => cam; realm.Q = () => ({ view: 420, npcs: 96, detail: 1, shadows: 1024 }); realm.GX = { gxSunW: { value: new THREE.Vector4(0.4, 0.8, 0.2, 0) } };
  const look = yaw => { cam.position.set(focus.X - Math.cos(yaw) * 0.5, 1.5 + 1.7, focus.Z - Math.sin(yaw) * 0.5); cam.lookAt(focus.X + Math.cos(yaw) * 10, 1.5 + 1.2, focus.Z + Math.sin(yaw) * 10); cam.updateMatrixWorld(); };
  const frame = (yaw, cull) => { look(yaw); P3.cull = cull; for (let k = 0; k < 3; k++) P3.update(k ? 0.03 : 0, focus); return { count: P3.count, culled: P3.culled, beasts: P3.beasts, bculled: P3.bculled, check: P3.check() }; };
  let a, b, c, lv = 'none';
  try {
    a = frame(0, true); b = frame(Math.PI, true); c = frame(0, false);
    // (each row's level against its distance from the eye)
    const bad = []; for (let r = 0; r < B3.rows; r++) { const q = B3.at(r); if (!q) continue; const d = Math.hypot(q[0] - cam.position.x, q[2] - cam.position.z); const want = d < 11 ? 0 : d > 13 && d < 25 ? 1 : d > 27 ? 2 : q[7]; if (q[7] !== want) bad.push(`${d.toFixed(1)} m: ${q[7]}`); }
    lv = bad.length ? bad.slice(0, 4).join(', ') : 'certos';
  } catch (e) { err = String(e && e.stack || e).split('\n').slice(0, 3).join(' | '); }
  P3.cull = true;
  const okF = !err && !a.check.length && !b.check.length && !c.check.length && a.culled > 0 && b.culled > 0 && c.culled === 0 && c.count > a.count && a.bculled > 0 && lv === 'certos';
  ok('o quadro das pessoas roda: os níveis pela distância do olho, quem está atrás do olho fica de fora, ninguém à vista', okF,
    err ? 'ERRO ' + err : `olhando +X: ${a.count} desenhadas, ${a.culled} fora, bichos ${a.beasts}/${a.bculled} fora · olhando −X: ${b.count}/${b.culled} · sem recorte: ${c.count}/${c.culled} · níveis ${lv} · verificador ${[...a.check, ...b.check, ...c.check].slice(0, 2).join('; ') || 'limpo'}`); }
if (process.env.V) console.log(JSON.stringify(res));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
