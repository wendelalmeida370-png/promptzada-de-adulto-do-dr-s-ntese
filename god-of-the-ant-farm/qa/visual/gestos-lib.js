// gestos-lib: the beasts' gestures posed in node (no browser): js/faunamesh.js, js/fauna-anim.js, js/fauna3d.js (its unpacker),
// js/fauna-gestos.js and js/fauna-gesto3d.js loaded as the game loads them; each skin bent on the CPU as the shader bends it
// (each point by its four bones, from the bind joints); a small rasterizer for the quick contact sheets (bichos-gestos.js folha).
// (the poses, the meshes, the coats are the game's own: nothing here is a copy of them)
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..', '..');
global.window = global; global.G = { worldHooks: [], mapHooks: [], saveHooks: [], T: {}, W: {}, N: 128, Heap: class { } }; window.G = G;
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
{ const u = fs.readFileSync(path.join(ROOT, 'js/util.js'), 'utf8'); const m = u.match(/G\.hash = \(i\) => \{[\s\S]*?\n {2}\};/); vm.runInThisContext(m[0]); G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v); }
run('js/lib/three.min.js'); global.THREE = THREE;
run('js/fauna-gestos.js'); try { run('js/animals.js'); } catch (e) { /* (only its DEF is wanted: the rest needs the world) */ }
run('js/faunamesh.js'); run('js/fauna-anim.js'); run('js/fauna3d.js'); run('js/fauna-gesto3d.js'); run('js/fauna-receitas.js');
const FA = G.FaunaAnim, FG = FA.Gest, D = G.FAUNAMESH, B = FA.B, NB = FA.BONES.length, Ge = G.Gestos;
FA.ready3(THREE);
const forms = {}, meshes = {};
for (const k in D.forms) forms[k] = { J: new Float32Array(D.forms[k].bind), box: D.forms[k].box, meta: D.forms[k].meta };
const meshOf = name => meshes[name] || (meshes[name] = G.Fauna3D.unpack(D.meshes[name]));
for (const k in forms) if (D.meshes[k]) forms[k].hull = FG.hullOf(meshOf(k));
const famOf = kind => forms[D.species[kind].mesh].meta.fam;
// the bent skin: each point by its bones' frames, moved back from the bind joints
function bend(mesh, J, R) {
  const out = new Float32Array(mesh.n * 3); const e = R.map(r => r.elements);
  for (let i = 0; i < mesh.n; i++) {
    const x = mesh.pos[i * 3], y = mesh.pos[i * 3 + 1], z = mesh.pos[i * 3 + 2]; let X = 0, Y = 0, Z = 0;
    for (let k = 0; k < 4; k++) { const w = mesh.bw[i * 4 + k] / 255; if (!w) continue; const b = mesh.bi[i * 4 + k]; const m = e[b];
      const px = x - J[b * 3], py = y - J[b * 3 + 1], pz = z - J[b * 3 + 2];
      X += w * (m[0] * px + m[4] * py + m[8] * pz + m[12]); Y += w * (m[1] * px + m[5] * py + m[9] * pz + m[13]); Z += w * (m[2] * px + m[6] * py + m[10] * pz + m[14]); }
    out[i * 3] = X; out[i * 3 + 1] = Y; out[i * 3 + 2] = Z;
  }
  return out;
}
// a beast posed: o = { kind, g (gesture), u (seconds into it), d (its length; the vocabulary's by default), gv, v (m/s), ph,
// young, dead (0..1), aim ([x,y,z] in its own frame), mood ([f,g,en,st,sx,rk]), held, fly, x, z, yaw, id, t, crouch, pounce, tree }
const spx = { browse: false, swish: 1 };
function pose(o) {
  const e = D.species[o.kind]; const name = o.fly && e.fly ? e.fly : e.mesh; const form = forms[name]; const fam = form.meta.fam;
  const def = o.g ? Ge.DEF[o.g] : null; const d = o.d !== undefined ? o.d : def ? def.d : 0;
  const gx = o.g ? { gn: o.g, gt: o.u || 0, gk: 1, gd: d, gv: o.gv || 0, pn: null, pk: 0 } : (o.gx || null);
  const st = { v: o.v || 0, ph: o.ph || 0, t: o.t !== undefined ? o.t : (o.u || 0) + 3, graze: o.graze || 0, look: 0, id: o.id || 1, ears: 0, tail: 0, jaw: 0, sit: o.sit || 0, glide: false, pitch: o.pitch || 0, bank: 0,
    young: o.young || 0, kind: o.kind, gx: gx || {}, aim: o.aim || null, mood: o.mood || null, dead: o.dead || 0, held: o.held || null, holdK: o.holdK || 0, dt: 1 / 30, exert: o.exert || 0, crouch: o.crouch || 0, pounce: o.pounce || 0, tree: !!o.tree, fy: o.fy || null, side: o.side || 0,
    ground: !!o.ground, coilR: o.coilR, coilY: o.coilY, rollA: o.rollA, rollWith: o.rollWith || 0, down: o.down || 0 };
  if (!gx) st.gx = { gn: null, gk: 0, pn: null, pk: 0 };
  const m = new THREE.Matrix4().makeRotationY(o.yaw || 0).setPosition(o.x || 0, o.y || 0, o.z || 0);
  const R = FA[fam](THREE, m, form, Object.assign({}, spx, o.sp || {}), st);
  const Rc = R.map(r => r.clone());
  return { R: Rc, form, name, fam, m, st, P: Float32Array.from(FG.P) };
}
// (where a point as modelled on a bone is, in the world, for a pose)
function at(ps, bone, p) { const b = B[bone]; const e = ps.R[b].elements, J = ps.form.J; const x = p[0] - J[b * 3], y = p[1] - J[b * 3 + 1], z = p[2] - J[b * 3 + 2];
  return [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]; }
const joint = (ps, bone) => { const e = ps.R[B[bone]].elements; return [e[12], e[13], e[14]]; };
function skin(ps) { const mesh = meshOf(ps.name); return { mesh, P: bend(mesh, ps.form.J, ps.R) }; }
const minY = P => { let y = 1e9; for (let i = 1; i < P.length; i += 3) y = Math.min(y, P[i]); return y; };

// ------------------------------ a small rasterizer ------------------------------
const ZC = { 1: [20, 18, 16], 2: [20, 18, 16], 3: [210, 200, 175], 4: [50, 42, 36], 5: [60, 48, 40], 6: [90, 60, 35], 7: [230, 222, 200], 8: [215, 170, 60], 9: [200, 50, 40], 10: [200, 180, 150], 11: [110, 100, 90], 12: [110, 100, 90], 13: [120, 110, 70], 14: [40, 36, 30] };
function coatRGB(kind) { try { const C = FA.coat(THREE, { kind, coat: 0, morph: null, age: 5 }); return [C[0], C[1]].map(c => c.slice(0, 3).map(v => Math.round(255 * Math.pow(Math.max(0, v), 1 / 2.2)))); } catch (e) { return [[150, 120, 90], [190, 170, 140]]; } }
function render(items, cam, W, H) {
  // items: [{ P, mesh, col: [fur, belly], tint }]; cam: { eye, look, fov }
  const img = new Uint8Array(W * H * 3), zb = new Float32Array(W * H).fill(1e9);
  for (let i = 0; i < W * H; i++) { const y = i / W | 0; const s = 1 - y / H * 0.35; img[i * 3] = 170 * s; img[i * 3 + 1] = 190 * s; img[i * 3 + 2] = 210 * s; }
  const ey = cam.eye, lk = cam.look; let fz = [lk[0] - ey[0], lk[1] - ey[1], lk[2] - ey[2]]; const fl = Math.hypot(...fz); fz = fz.map(v => v / fl);
  let rx = [fz[2], 0, -fz[0]]; const rl = Math.hypot(...rx) || 1; rx = rx.map(v => v / rl); const up = [fz[1] * rx[2] - fz[2] * rx[1], fz[2] * rx[0] - fz[0] * rx[2], fz[0] * rx[1] - fz[1] * rx[0]];
  const f = 1 / Math.tan((cam.fov || 40) * Math.PI / 360) * H / 2;
  const proj = (x, y, z) => { const dx = x - ey[0], dy = y - ey[1], dz = z - ey[2]; const cz = dx * fz[0] + dy * fz[1] + dz * fz[2]; const cx = dx * rx[0] + dy * rx[1] + dz * rx[2], cy = dx * up[0] + dy * up[1] + dz * up[2]; return [W / 2 - cx / cz * f, H / 2 - cy / cz * f, cz]; };
  const L = [0.4, 0.8, 0.45]; const ll = Math.hypot(...L);
  const tri = (a, b, c, col) => {
    const A = proj(...a), Bq = proj(...b), Cq = proj(...c); if (A[2] < 0.05 || Bq[2] < 0.05 || Cq[2] < 0.05) return;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    const vd = (a[0] - ey[0]) * nx + (a[1] - ey[1]) * ny + (a[2] - ey[2]) * nz; if (vd > 0) { nx = -nx; ny = -ny; nz = -nz; }
    const sh = 0.45 + 0.55 * Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / ll);
    const x0 = Math.max(0, Math.floor(Math.min(A[0], Bq[0], Cq[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(A[0], Bq[0], Cq[0])));
    const y0 = Math.max(0, Math.floor(Math.min(A[1], Bq[1], Cq[1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(A[1], Bq[1], Cq[1])));
    const den = (Bq[1] - Cq[1]) * (A[0] - Cq[0]) + (Cq[0] - Bq[0]) * (A[1] - Cq[1]); if (Math.abs(den) < 1e-9) return;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x + 0.5, py = y + 0.5; const w0 = ((Bq[1] - Cq[1]) * (px - Cq[0]) + (Cq[0] - Bq[0]) * (py - Cq[1])) / den, w1 = ((Cq[1] - A[1]) * (px - Cq[0]) + (A[0] - Cq[0]) * (py - Cq[1])) / den, w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue; const z = 1 / (w0 / A[2] + w1 / Bq[2] + w2 / Cq[2]); const o = y * W + x; if (z >= zb[o]) continue; zb[o] = z;
      img[o * 3] = Math.min(255, col[0] * sh); img[o * 3 + 1] = Math.min(255, col[1] * sh); img[o * 3 + 2] = Math.min(255, col[2] * sh);
    }
  };
  // (the ground: a checker of tiles round the look point)
  const gs = cam.tile || 0.25, gc = cam.look; for (let j = -14; j < 14; j++) for (let i = -14; i < 14; i++) { const x0 = Math.floor(gc[0] / gs) * gs + i * gs, z0 = Math.floor(gc[2] / gs) * gs + j * gs; const c = ((i + j) & 1) ? [150, 165, 120] : [135, 150, 108];
    tri([x0, 0, z0], [x0 + gs, 0, z0], [x0 + gs, 0, z0 + gs], c); tri([x0, 0, z0], [x0 + gs, 0, z0 + gs], [x0, 0, z0 + gs], c); }
  for (const it of items) { const { P, mesh } = it; const idx = mesh.idx; const col = it.col || [[150, 120, 90]];
    for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; const z = mesh.zone[a]; const cc = z === 0 ? (it.tint ? it.tint : col[0]) : ZC[z] || col[0];
      tri([P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], [P[c * 3], P[c * 3 + 1], P[c * 3 + 2]], cc); } }
  for (const it of items) if (it.dots) for (const d of it.dots) { const q = proj(...d.p); if (q[2] <= 0) continue; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) { const X = Math.round(q[0]) + x, Y = Math.round(q[1]) + y; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const o = Y * W + X; img[o * 3] = d.c[0]; img[o * 3 + 1] = d.c[1]; img[o * 3 + 2] = d.c[2]; } }
  return img;
}
function png(file, W, H, img) {
  const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(img.buffer, img.byteOffset + y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2; ih[10] = 0; ih[11] = 0; ih[12] = 0;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
// (a camera round a point: the view from the side, three quarters, the front, above)
function camAt(c, size, view, dist) {
  const ang = view === 'side' ? Math.PI / 2 : view === 'front' ? 0 : view === 'back' ? Math.PI : view === 'top' ? 0.6 : view === 'other' ? -0.75 : 0.75;
  const D0 = Math.max(0.5, size * 2.9) * (dist || 1), hy = Math.max(0.08, size * 0.3), up = view === 'top' ? D0 * 0.9 : hy * 0.7;
  return { eye: [c[0] + Math.sin(ang) * D0, c[1] + hy + up, c[2] + Math.cos(ang) * D0], look: [c[0], c[1] + hy * 0.75, c[2]], fov: 40, tile: Math.max(0.05, size / 6) };
}
module.exports = { ROOT, G, FA, FG, D, B, NB, Ge, THREE, forms, meshOf, famOf, pose, at, joint, skin, bend, minY, render, png, camAt, coatRGB };
