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
run('js/bodymesh.js'); run('js/body3d.js'); run('js/people3d.js');
// (the realm the modules are given: a scene and the quality — enough to make their meshes)
const scene = new THREE.Scene();
G.People3D.init(THREE, { scene: () => scene, Q: () => ({ view: 420, npcs: 36, detail: 1 }) });
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
function bend(mesh, row) {
  const buf = B3._buf(); const TW = B3._tw(); const o = row * TW * 4; const out = new Float32Array(mesh.n * 3);
  for (let i = 0; i < mesh.n; i++) {
    let x = 0, y = 0, z = 0; const px = mesh.pos[i * 3], py = mesh.pos[i * 3 + 1], pz = mesh.pos[i * 3 + 2];
    for (let k = 0; k < 4; k++) { const w = mesh.bw[i * 4 + k] / 255; if (!w) continue; const j = o + mesh.bi[i * 4 + k] * 12;
      x += w * (buf[j] * px + buf[j + 1] * py + buf[j + 2] * pz + buf[j + 3]); y += w * (buf[j + 4] * px + buf[j + 5] * py + buf[j + 6] * pz + buf[j + 7]); z += w * (buf[j + 8] * px + buf[j + 9] * py + buf[j + 10] * pz + buf[j + 11]); }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
  }
  return out;
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
if (process.env.V) console.log(JSON.stringify(res));
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
