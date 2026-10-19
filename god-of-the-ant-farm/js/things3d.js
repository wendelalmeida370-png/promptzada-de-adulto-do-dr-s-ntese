'use strict';
// ============================================================
//  Things3D: everything else of the world the god sees, seen
//  from the body — the carts on the roads with the ox that
//  pulls them, the boats of those who arrive by sea, the beasts
//  of the sea (dolphins leaping, a whale blowing, a shark's fin,
//  turtles), the siege engines and the stones they throw, the
//  tents of an army in camp with its fires, the blood on the
//  ground and the pyres of the dead, the mouths of the caves,
//  the gold of the god's rain and the wine of the wells, the
//  ghosts of the night, the banners of the rich houses and the
//  lamp at the tavern door, the scaffolds of the executions, the
//  hives on the trees and the nests. Each is where the world
//  says it is (the same records the god's picture reads).
//  Only seen: nothing here is saved, nothing touches the world;
//  what flickers draws from the view's own chance (G.VR).
// ============================================================
(function (G) {
  const W = G.W; const TAU = Math.PI * 2;
  const T3 = G.Things3D = { flames: [], n: {} };
  let THREE = null, R3 = null, scene = null, M = null;
  const I = {}; // the instanced meshes, by name
  const vis = new Map(); // a moving thing → the view's memory of it (its heading, its wheels' turn)
  G.worldHooks.push(() => { vis.clear(); T3.flames.length = 0; });
  // [name, geometry, max, material, cast shadows]
  const LIST = [
    ['bed', 'box', 32], ['wheel', 'wheel', 64], ['shaft', 'box', 64], ['load', 'box', 32], ['ox', 'ball', 32], ['oxHead', 'ball', 32], ['oxLeg', 'limb', 128], ['horn', 'cone', 64],
    ['sea', 'ball', 40], ['fin', 'fin', 120],
    ['hull', 'hull', 12], ['rower', 'ball', 60],
    ['engine', 'box', 60], ['beam', 'box', 60], ['stone', 'ball', 40],
    ['tent', 'tent', 80], ['log', 'cyl', 80],
    ['decal', 'disc', 300, 'decal', false], ['pyre', 'cyl', 60],
    ['mouth', 'arch', 24, 'dark', false], ['rock', 'rock', 160],
    ['coin', 'coin', 260, 'gold'], ['ghost', 'ghost', 24, 'ghost', false], ['ghostEye', 'ball', 48, 'eye', false],
    ['pole', 'cyl', 60], ['flag', 'flag', 30, 'flag'], ['lamp', 'box', 40, 'glow', false],
    ['plank', 'box', 120], ['rope', 'cyl', 20],
    ['hive', 'ball', 40], ['nest', 'nest', 60],
  ];
  T3.init = function (three, realm) {
    THREE = three; R3 = realm; scene = realm.scene();
    M = { a: new THREE.Matrix4(), b: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), v: new THREE.Vector3(), s: new THREE.Vector3(), w: new THREE.Vector3(), c: new THREE.Color(), up: new THREE.Vector3(0, 1, 0) };
    const G3 = {};
    G3.box = new THREE.BoxGeometry(1, 1, 1); G3.box.translate(0, 0.5, 0);
    G3.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 8); G3.cyl.translate(0, 0.5, 0);
    G3.cone = new THREE.ConeGeometry(0.5, 1, 7); G3.cone.translate(0, 0.5, 0);
    G3.ball = new THREE.SphereGeometry(0.5, 12, 9);
    G3.limb = new THREE.CapsuleGeometry(0.5, 1, 2, 6); G3.limb.translate(0, -0.5, 0); // (hanging from its joint)
    G3.wheel = new THREE.CylinderGeometry(0.5, 0.5, 1, 14); G3.wheel.rotateX(Math.PI / 2); // (its axle along z)
    G3.fin = new THREE.ConeGeometry(0.5, 1, 4); G3.fin.translate(0, 0.5, 0); G3.fin.scale(1, 1, 0.25);
    G3.tent = new THREE.ConeGeometry(0.71, 1, 4); G3.tent.rotateY(Math.PI / 4); G3.tent.translate(0, 0.5, 0);
    G3.disc = new THREE.CircleGeometry(0.5, 14); G3.disc.rotateX(-Math.PI / 2);
    G3.coin = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 10);
    G3.rock = new THREE.DodecahedronGeometry(0.5, 0);
    G3.nest = new THREE.TorusGeometry(0.4, 0.16, 5, 10); G3.nest.rotateX(Math.PI / 2);
    // (a boat: a hull drawn to a point at both ends)
    G3.hull = new THREE.SphereGeometry(0.5, 12, 6, 0, TAU, Math.PI / 2, Math.PI / 2); G3.hull.scale(1, 0.9, 0.36); G3.hull.translate(0, 0.45, 0);
    // (the mouth of a cave: the dark of an arch in the slope)
    G3.arch = new THREE.CircleGeometry(0.5, 16, 0, Math.PI);
    // (a ghost: a wisp narrowing to nothing below, its head a little apart above)
    G3.ghost = new THREE.LatheGeometry([[0, 0], [0.3, 0.25], [0.36, 0.7], [0.32, 1.05], [0.2, 1.25], [0, 1.32]].map(([r, y]) => new THREE.Vector2(r, y)), 12);
    // (a flag on its staff: a sheet, waving in its shader)
    G3.flag = new THREE.PlaneGeometry(1, 0.62, 8, 2); G3.flag.translate(0.5, 0, 0);
    const lam = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const MATS = {
      lam,
      decal: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
      dark: new THREE.MeshBasicMaterial({ color: 0x07080a, side: THREE.DoubleSide }),
      gold: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xfff0b0, shininess: 90, emissive: 0x2a1a00 }),
      ghost: new THREE.MeshBasicMaterial({ color: 0xdfeaff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
      eye: new THREE.MeshBasicMaterial({ color: 0x1e2850 }),
      glow: new THREE.MeshBasicMaterial({ color: 0xffd38a }),
      flag: new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    };
    MATS.flag.onBeforeCompile = sh => { sh.uniforms.uT = { value: 0 }; MATS.flag.userData.sh = sh; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.z += sin(transformed.x * 5.0 - uT * 4.0 + instanceMatrix[3].x) * 0.12 * transformed.x;'); };
    MATS.decal.vertexColors = false;
    for (const [name, geo, max, mat, cast] of LIST) {
      const m = new THREE.InstancedMesh(G3[geo], MATS[mat || 'lam'], max); m.name = 'things:' + name; // (named: the tests say which thing, not which material)
      m.count = 0; m.frustumCulled = false; m.castShadow = cast !== false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.setColorAt(0, new THREE.Color(1, 1, 1)); m.userData.max = max; m.userData.n = 0; scene.add(m); I[name] = m;
    }
    I.decal.renderOrder = 1; I.ghost.renderOrder = 3;
    T3.mats = MATS;
  };

  // ------------------------------ placing a part ------------------------------
  // (in the world, at (x, y, z), turned by yaw about the vertical (0 = east), then by pitch and roll, sized)
  function put(name, x, y, z, yaw, sx, sy, sz, hex, pitch, roll) {
    const m = I[name]; const k = m.userData.n; if (k >= m.userData.max) return;
    M.e.set(roll || 0, -yaw, pitch || 0, 'YZX'); M.q.setFromEuler(M.e);
    M.a.compose(M.v.set(x, y, z), M.q, M.s.set(sx, sy, sz)); m.setMatrixAt(k, M.a); m.setColorAt(k, M.c.set(hex)); m.userData.n = k + 1;
  }
  // (a part in a frame: the local offset (f forward, u up, r right) of a thing at (X, Y, Z) facing yaw)
  function at(X, Y, Z, yaw, f, u, r) { const c = Math.cos(yaw), s = Math.sin(yaw); return [X + c * f - s * r, Y + u, Z + s * f + c * r]; }
  // (a limb from a joint to a point, in the world)
  function limb(name, A, B, rad, hex) {
    const m = I[name]; const k = m.userData.n; if (k >= m.userData.max) return;
    M.v.set(A[0] - B[0], A[1] - B[1], A[2] - B[2]); const len = M.v.length(); if (len < 1e-4) return; M.v.divideScalar(len); M.q.setFromUnitVectors(M.up, M.v);
    M.a.compose(M.s.set(A[0], A[1], A[2]), M.q, M.w.set(rad, len, rad)); m.setMatrixAt(k, M.a); m.setColorAt(k, M.c.set(hex)); m.userData.n = k + 1;
  }
  const near2 = (X, Z, f, R) => (X - f.X) ** 2 + (Z - f.Z) ** 2 < R * R;
  const gY = (x, y) => (W.inb(x, y) ? W.groundH(x, y) : G.SEA) * G.Space.HM;
  // (a flat thing laid on the ground — a stain, the dark of a pit — tilted to the slope there (level on water), its own turn
  // yaw on it: a disc kept level through its middle went under the ground uphill and stood in the air downhill)
  function lay(name, X, Y, Z, yaw, sx, sz, hex) {
    const x = X / TL(), z = Z / TL(), e = 0.35, d = 2 * e * TL(); // (the slope over 2.8 m, in metres a metre)
    const gx = (gY(x + e, z) - gY(x - e, z)) / d, gz = (gY(x, z + e) - gY(x, z - e)) / d; const c = Math.cos(yaw), s = Math.sin(yaw);
    put(name, X, Y, Z, yaw, sx, 1, sz, hex, Math.atan(gx * c + gz * s), -Math.atan(gz * c - gx * s));
  }
  const flame = (x, y, z, s) => { if (T3.flames.length < 60) T3.flames.push([x, y, z, s]); };
  function memo(key, X, Z, dt, yaw0) {
    let s = vis.get(key); if (!s) { s = { X, Z, yaw: yaw0 || 0, roll: 0, ph: 0, sp: 0 }; vis.set(key, s); }
    const dx = X - s.X, dz = Z - s.Z; const d = Math.hypot(dx, dz);
    if (d > 0.003 && d < 8) { const want = Math.atan2(dz, dx); let da = want - s.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; s.yaw += da * (1 - Math.exp(-6 * dt)); s.roll += d; }
    s.sp += ((dt > 0 && d < 8 ? d / dt : 0) - s.sp) * (1 - Math.exp(-6 * dt)); s.X = X; s.Z = Z; s.seen = 1; return s;
  }

  // ------------------------------ the frame ------------------------------
  T3.update = function (dt, focus) {
    if (!scene || !focus) return;
    const S = G.S; const t = R3.time ? R3.time() : 0;
    for (const k in I) I[k].userData.n = 0;
    T3.flames.length = 0; for (const s of vis.values()) s.seen = 0;
    const night = G.clamp(G.Render.nightness(), 0, 1);
    const R = R3.Q().view * 0.45;
    carts(S, focus, dt, t, night, R); seaBeasts(S, focus, dt, t, R); boats(S, focus, dt, t, R); war(S, focus, dt, t, night, R); carnage(S, focus, dt, t, R);
    caves(S, focus, R); gifts(S, focus, dt, t, R); ghosts(S, focus, t); town(S, focus, t, night, R); wild(S, focus, t, R);
    for (const [k, s] of vis) if (!s.seen) vis.delete(k);
    for (const k in I) { const m = I[k]; m.count = m.userData.n; m.visible = m.count > 0; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; T3.n[k] = m.count; }
    if (T3.mats.flag.userData.sh) T3.mats.flag.userData.sh.uniforms.uT.value = t;
  };

  // ---- carts on the roads, and the ox that pulls each (a lantern at night)
  const OX = { nordico: '#6a5040', egipcio: '#8a8a86', asteca: '#7a6a52' };
  function carts(S, f, dt, t, night, R) {
    const E = G.Eco;
    for (const c of S.carts || []) {
      const X = c.x * TL(), Z = c.y * TL(); if (!near2(X, Z, f, R)) continue;
      const s = memo('c' + c.id, X, Z, dt, 0); const yaw = s.yaw; const Y = gY(c.x, c.y);
      const g = c.back ? c.ret : c.goods; const gc = (g && E && E.GOODS && E.GOODS[g.k] && E.GOODS[g.k].col) || '#9a7a4a';
      // the cart: its bed, two wheels turning with the road, the shafts forward to the ox, what it carries
      const B = at(X, Y, Z, yaw, -1.2, 0.62, 0); put('bed', B[0], B[1], B[2], yaw, 2.2, 0.42, 1.3, '#7a5a3a');
      for (const sd of [-1, 1]) { const w = at(X, Y, Z, yaw, -1.2, 0.55, sd * 0.76); put('wheel', w[0], w[1], w[2], yaw, 1.1, 1.1, 0.12, '#5a4028', 0, 0); const wm = I.wheel; const k = wm.userData.n - 1; M.e.set(0, -yaw, -s.roll / 0.55, 'YXZ'); M.q.setFromEuler(M.e); M.a.compose(M.v.set(w[0], w[1], w[2]), M.q, M.s.set(1.1, 1.1, 0.12)); wm.setMatrixAt(k, M.a); }
      for (const sd of [-1, 1]) { const a = at(X, Y, Z, yaw, -0.2, 0.75, sd * 0.42); put('shaft', a[0], a[1], a[2], yaw, 1.9, 0.07, 0.07, '#6a4a2a'); }
      if (g) { const L = at(X, Y, Z, yaw, -1.2, 1.04, 0); put('load', L[0], L[1], L[2], yaw + 0.05, 1.8, 0.62, 1.05, gc); }
      // the ox: its body, head low before it, horns, four legs stepping with the road
      const col = OX[c.civ] || '#8a6a4a'; const ph = s.roll * 2.2; const walk = G.clamp(s.sp, 0, 1.5);
      const O = at(X, Y, Z, yaw, 1.05, 1.15, 0); put('ox', O[0], O[1], O[2], yaw, 1.9, 0.95, 0.85, col);
      const H = at(X, Y, Z, yaw, 2.05, 1.05 + Math.sin(ph) * 0.03, 0); put('oxHead', H[0], H[1], H[2], yaw, 0.62, 0.5, 0.46, col, -0.3);
      for (const sd of [-1, 1]) { const h = at(X, Y, Z, yaw, 2.1, 1.35, sd * 0.2); put('horn', h[0], h[1], h[2], yaw, 0.08, 0.32, 0.08, '#e8e0cc', 0, sd * 0.9); }
      for (let k = 0; k < 4; k++) { const front = k < 2, sd = k % 2 ? 1 : -1; const sw = Math.sin(ph + (front ? 0 : Math.PI) + (sd > 0 ? Math.PI : 0)) * 0.45 * walk; const A = at(X, Y, Z, yaw, front ? 1.6 : 0.45, 0.95, sd * 0.28); const Bp = at(X, Y, Z, yaw, (front ? 1.6 : 0.45) + Math.sin(sw) * 0.5, 0.02, sd * 0.3); limb('oxLeg', A, Bp, 0.17, front ? col : '#4a3a2a'); }
      if (night > 0.45) { const l = at(X, Y, Z, yaw, 0.0, 1.5, 0.5); put('lamp', l[0], l[1], l[2], yaw, 0.14, 0.2, 0.14, '#ffd38a'); flame(l[0], l[1] + 0.22, l[2], 0.6); }
    }
  }
  const TL = () => G.Space.TILE;

  // ---- the beasts of the sea: where the world has them, at the water's face or just under it
  const SEA = { dolphin: { L: 2.4, col: '#7a8a9a', bel: '#dfe4e8', leap: 1 }, orca: { L: 6.5, col: '#18181c', bel: '#f0f0f0', leap: 0.6 }, whale: { L: 14, col: '#4a5866', bel: '#9aa4ac', blow: 1 }, shark: { L: 3.8, col: '#6a7480', bel: '#d8dce0', fin: 1 }, turtle: { L: 1.1, col: '#5a6a3a', bel: '#c8b88a', shell: 1 } };
  function seaBeasts(S, f, dt, t, R) {
    const TLm = TL(), HM = G.Space.HM;
    for (const a of S.animals.values()) {
      const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls !== 'water' || a.dead) continue;
      const X = a.x * TLm, Z = a.y * TLm; if (!near2(X, Z, f, R)) continue;
      const D = SEA[a.kind]; if (!D) continue; const s = memo('a' + a.id, X, Z, dt, 0); const yaw = s.yaw;
      const sea = W.inb(a.x, a.y) ? W.waterH(a.x, a.y) * HM : G.SEA * HM; const L = D.L * (a.big || 1);
      // (a dolphin leaps and dives in arcs; a whale lies along the surface, its back rising now and then; a shark is a fin)
      let y = sea - L * 0.12, pitch = 0;
      if (D.leap) { const ph = (t * 0.45 + a.id * 0.37) % 1; if (ph < 0.3) { const u = ph / 0.3; y = sea - 0.4 + Math.sin(u * Math.PI) * L * 0.55; pitch = Math.cos(u * Math.PI) * 0.9; if (u > 0.9 && G.VR() < 0.4) splash(X, sea, Z); } else y = sea - L * 0.3; }
      if (D.blow) { const ph = (t * 0.07 + a.id * 0.13) % 1; y = sea - L * 0.12 + (ph < 0.25 ? Math.sin(ph / 0.25 * Math.PI) * L * 0.07 : 0); if (ph > 0.05 && ph < 0.09 && G.FX3D) { const b = at(X, sea, Z, yaw, L * 0.3, 0, 0); for (let k = 0; k < 3; k++) G.FX3D.spawn({ x: b[0], y: sea + 0.3, z: b[2], vx: G.vrr(-0.5, 0.5), vy: G.vrr(5, 7), vz: G.vrr(-0.5, 0.5), life: 1.4, s0: 0.5, s1: 2.4, c: [0.9, 0.94, 0.97], a: 0.5, grav: 4, drag: 0.4, fade: 1 }); } }
      if (D.fin) y = sea - 0.45;
      if (D.shell) y = sea - 0.12;
      const B = at(X, y, Z, yaw, 0, 0, 0);
      put('sea', B[0], B[1], B[2], yaw, L, L * (D.shell ? 0.3 : 0.26), L * (D.shell ? 0.8 : 0.28), D.shell ? '#6a5a3a' : D.col, pitch);
      if (D.bel && !D.shell) { const b = at(X, y - L * 0.06, Z, yaw, L * 0.05, 0, 0); put('sea', b[0], b[1], b[2], yaw, L * 0.82, L * 0.16, L * 0.22, D.bel, pitch); }
      // (the dorsal fin, the flukes of the tail, the flippers)
      const fin = at(X, y + L * 0.1, Z, yaw, -L * 0.05, 0, 0); if (!D.shell) put('fin', fin[0], fin[1], fin[2], yaw, L * (D.fin ? 0.22 : 0.13), L * (D.fin ? 0.3 : 0.14), L * 0.13, D.col, pitch * 0.5);
      const tl = at(X, y, Z, yaw, -L * 0.5, 0, 0); const fl = Math.sin(t * 3 + a.id) * 0.3;
      if (!D.shell) put('fin', tl[0], tl[1], tl[2], yaw, L * 0.3, L * 0.06, L * 0.22, D.col, Math.PI / 2 + pitch + fl, 0);
      for (const sd of [-1, 1]) { const p = at(X, y - L * 0.04, Z, yaw, L * (D.shell ? 0.2 : 0.18), 0, sd * L * (D.shell ? 0.35 : 0.14)); put('fin', p[0], p[1], p[2], yaw + sd * 0.6, L * 0.14, L * (D.shell ? 0.2 : 0.12), L * 0.05, D.shell ? D.col : D.col, 0, sd * (1.2 + Math.sin(t * 2 + a.id) * 0.3)); }
    }
  }
  function splash(X, Y, Z) { if (!G.FX3D) return; for (let k = 0; k < 4; k++) G.FX3D.spawn({ x: X + G.vrr(-0.5, 0.5), y: Y, z: Z + G.vrr(-0.5, 0.5), vx: G.vrr(-1, 1), vy: G.vrr(2, 3.5), vz: G.vrr(-1, 1), life: 0.8, s0: 0.15, s1: 0.06, c: [0.86, 0.93, 0.97], a: 0.8, sh: 1, grav: 9 }); }

  // ---- the boats of those who come by sea (and of those who leave)
  function boats(S, f, dt, t, R) {
    for (const b of S.boats || []) {
      const X = b.x * TL(), Z = b.y * TL(); if (!near2(X, Z, f, R)) continue;
      const s = memo('b' + (b.sx + b.sy * 1e4), X, Z, dt, Math.atan2(b.ty - b.y, b.tx - b.x)); const yaw = s.yaw;
      const Y = (W.inb(b.x, b.y) ? W.waterH(b.x, b.y) : G.SEA) * G.Space.HM - 0.25 + Math.sin(t * 1.4 + b.sx) * 0.05;
      put('hull', X, Y, Z, yaw, 4.2, 0.8, 1.5, '#7a5a3a', 0, Math.sin(t * 1.1 + b.sy) * 0.04);
      const n = Math.min(6, (b.people || []).length || (b.empty ? 0 : 2));
      for (let k = 0; k < n; k++) { const p = at(X, Y, Z, yaw, -1.2 + k * 0.5, 0.8, (k % 2 ? 0.3 : -0.3)); put('rower', p[0], p[1], p[2], yaw, 0.36, 0.6, 0.36, ['#c9763a', '#4f7a9a', '#8a5a7a', '#6a8a4a'][k % 4]); put('rower', p[0], p[1] + 0.48, p[2], yaw, 0.24, 0.26, 0.24, '#d8a888'); }
    }
  }

  // ---- war: the engines of a siege and their stones, an army's camp
  function war(S, f, dt, t, night, R) {
    const HM = G.Space.HM;
    if (G.War && G.War.bands) for (const b of G.War.bands.values()) {
      const hex = G.Fac.hex(b.fac) || '#8a3a2a';
      for (const e of b.engines || []) {
        const X = e.x * TL(), Z = e.y * TL(); if (!near2(X, Z, f, R)) continue;
        const s = memo('e' + e.id, X, Z, dt, 0); const yaw = s.yaw; const Y = gY(e.x, e.y);
        if (e.kind === 'ariete') {
          // (a roofed frame on wheels; the log swinging under it)
          const sw = Math.sin(t * 2.2 + e.id) * 0.3;
          put('engine', ...at(X, Y, Z, yaw, 0, 0.5, 0), yaw, 3.2, 0.5, 1.8, '#6a4a2a'); put('engine', ...at(X, Y, Z, yaw, 0, 1.0, 0), yaw, 3.4, 0.2, 2.0, hex, 0, 0);
          put('beam', ...at(X, Y, Z, yaw, 0.6 + sw, 0.75, 0), yaw, 3.6, 0.32, 0.32, '#5a3c22');
          for (const sd of [-1, 1]) for (const fw of [-1, 1]) put('wheel', ...at(X, Y, Z, yaw, fw * 1.1, 0.4, sd * 0.95), yaw, 0.8, 0.8, 0.14, '#4a3420');
        } else if (e.kind === 'catapulta') {
          // (a frame, and the arm that throws: back when cocked, forward when it has thrown)
          const cd = G.clamp(e.cd || 0, 0, 2); const arm = -0.3 - (1 - cd / 2) * 1.0;
          put('engine', ...at(X, Y, Z, yaw, 0, 0.3, 0), yaw, 2.6, 0.3, 1.6, '#6a4a2a');
          for (const sd of [-1, 1]) put('beam', ...at(X, Y, Z, yaw, 0, 0.6, sd * 0.6), yaw, 0.3, 1.4, 0.2, '#5a3c22');
          put('beam', ...at(X, Y, Z, yaw, 0, 1.9, 0), yaw, 3.0, 0.18, 0.2, '#5a3c22', arm);
          for (const sd of [-1, 1]) for (const fw of [-1, 1]) put('wheel', ...at(X, Y, Z, yaw, fw * 0.9, 0.35, sd * 0.85), yaw, 0.7, 0.7, 0.12, '#4a3420');
        } else {
          // (a siege tower: tall, hides covering it, a platform on top)
          put('engine', ...at(X, Y, Z, yaw, 0, 0, 0), yaw, 3, 9, 3, '#6a4a2a'); put('engine', ...at(X, Y, Z, yaw, 0, 7.5, 0), yaw, 3.2, 1.6, 3.2, hex);
          for (const sd of [-1, 1]) for (const fw of [-1, 1]) put('wheel', ...at(X, Y, Z, yaw, fw * 1.1, 0.5, sd * 1.55), yaw, 1, 1, 0.16, '#4a3420');
        }
      }
      // the camp: tents round each company's fire
      const A = b.army; if (!A || !(A.phase === 'cerco' || A.phase === 'acampar')) continue;
      for (const co of A.cos || []) {
        if (!co.camp) continue; const cx = co.camp[0], cy = co.camp[1]; const X = cx * TL(), Z = cy * TL(); if (!near2(X, Z, f, R)) continue;
        const n = 4 + (co.id || 0) % 3;
        for (let k = 0; k < n; k++) { const a = k / n * TAU + (co.id || 0); const x = cx + Math.cos(a) * 1.4, y = cy + Math.sin(a) * 1.4; if (!W.inb(x, y)) continue; put('tent', x * TL(), gY(x, y), y * TL(), a + Math.PI / 4, 2.6, 2.1, 2.6, k % 2 ? hex : '#d8cfb8'); }
        const fy = gY(cx, cy); for (let k = 0; k < 3; k++) put('log', X, fy + 0.12, Z, k * 1.05, 0.14, 1.1, 0.14, '#4a3420', Math.PI / 2);
        flame(X, fy + 0.25, Z, 1.6);
        if (G.FX3D && G.VR() < dt * 1.2) G.FX3D.spawn({ x: X, y: fy + 1.4, z: Z, vy: G.vrr(0.9, 1.4), life: G.vrr(3, 5), s0: 0.4, s1: 2.6, c: [0.6, 0.6, 0.6], a: 0.3, drag: 0.4, fade: 1 });
      }
    }
    // (the stones thrown, on their arc from the engine to where they fall)
    for (const q of S.missiles || []) {
      const u = G.clamp(q.t / (q.dur || 1.4), 0, 1); const x = q.x0 + (q.x1 - q.x0) * u, y = q.y0 + (q.y1 - q.y0) * u; const X = x * TL(), Z = y * TL(); if (!near2(X, Z, f, R)) continue;
      const Y = gY(q.x0, q.y0) * (1 - u) + gY(q.x1, q.y1) * u + Math.sin(u * Math.PI) * 14 + 1;
      put('stone', X, Y, Z, 0, q.corpse ? 0.8 : 0.6, q.corpse ? 0.45 : 0.6, q.corpse ? 0.45 : 0.6, q.corpse ? '#6a4a3a' : '#8a8478');
    }
    void HM;
  }

  // ---- what war and death leave: blood and ash on the ground, the pyres of the dead, the pieces flung
  const DECAL = { pool: ['#5a0c0c', 2.6], splat: ['#6a1010', 1.4], trail: ['#5a1010', 1], ash: ['#2e2a28', 4], bone: ['#d8d0bc', 6] };
  function carnage(S, f, dt, t, R) {
    const C = G.Carnage && G.Carnage.view ? G.Carnage.view() : null; if (!C) return;
    const DAY = G.DAY_LEN || 1;
    for (const d of C.decals) {
      const X = d.x * TL(), Z = d.y * TL(); if (!near2(X, Z, f, Math.min(R, 90))) continue;
      const D = DECAL[d.k] || DECAL.pool; const life = D[1] * DAY; if (d.t > life) continue;
      const r = Math.max(0.2, (d.r || 0.3) * TL() * 0.5);
      lay('decal', X, gY(d.x, d.y) + 0.04, Z, d.a || 0, r * 2 * (d.s || 1), r * 2 / (d.s || 1), D[0]);
    }
    for (const p of C.pyres) {
      if (!(p.heap || p.burn > 0)) continue; const X = p.x * TL(), Z = p.y * TL(); if (!near2(X, Z, f, R)) continue; const Y = gY(p.x, p.y);
      const n = Math.min(8, 3 + (p.heap || 0)); for (let k = 0; k < n; k++) put('pyre', X + Math.cos(k * 2.4) * 0.3, Y + 0.12 + (k % 3) * 0.24, Z + Math.sin(k * 2.4) * 0.3, k * 0.8, 0.22, 2.2, 0.22, k % 2 ? '#5a3c22' : '#6a4a2a', Math.PI / 2);
      if (p.burn > 0) { flame(X, Y + 0.6, Z, 3.2); if (G.FX3D && G.VR() < dt * 3) G.FX3D.spawn({ x: X, y: Y + 2.5, z: Z, vy: G.vrr(1.2, 2), life: G.vrr(4, 6), s0: 0.8, s1: 3.6, c: [0.32, 0.3, 0.3], a: 0.4, drag: 0.3, fade: 1 }); }
    }
  }

  // ---- the mouths of the caves: the dark of the opening in the slope, rocks round its lip
  function caves(S, f, R) {
    if (!G.Caves || !S.ug) return; const HM = G.Space.HM;
    for (const cv of G.Caves.all()) for (const m of cv.mouths) {
      if (m.kind === 'mina') continue; const X = (m.x + 0.5) * TL(), Z = (m.y + 0.5) * TL(); if (!near2(X, Z, f, Math.min(R, 150))) continue;
      const kind = G.Caves.mouthKind ? G.Caves.mouthKind(m, cv) : m.kind; const Y = W.hAt(m.x + 0.5, m.y + 0.5) * HM;
      const pit = kind === 'poco' || kind === 'poço' || kind === 'dolina';
      // (the way into the slope: toward where the land rises)
      const hx = W.hAt(m.x + 1.5, m.y + 0.5) - W.hAt(m.x - 0.5, m.y + 0.5), hz = W.hAt(m.x + 0.5, m.y + 1.5) - W.hAt(m.x + 0.5, m.y - 0.5);
      const yaw = m.fx || m.fy ? Math.atan2(-m.fy, -m.fx) : Math.atan2(hz, hx);
      // (each stone sits on the ground where it is, not at the height of the mouth's middle: round a pit on a hillside, or at
      // the foot of an arch cut into a slope, the ground there is higher or lower: the visual hunt found them buried)
      const floor = (x, z) => W.hAt(x / TL(), z / TL()) * HM;
      // (a stone's seat: the lowest ground under it, so its downhill edge does not stand in the air — sunk into the slope above,
      // and never with its top under the ground of its middle)
      const seat = (x, z, r) => Math.max(Math.min(floor(x, z), floor(x - r, z), floor(x + r, z), floor(x, z - r), floor(x, z + r)) + 0.1, floor(x, z) - 0.2);
      if (pit) {
        lay('decal', X, Y + 0.05, Z, 0, 3.4, 3.4, '#07080a'); // (the dark of the pit on the slope round it)
        for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; const x = X + Math.cos(a) * 1.9, z = Z + Math.sin(a) * 1.9; const s = 0.9 + G.hash(k + m.x) * 0.5; put('rock', x, seat(x, z, 0.4 * s), z, a, s, 0.6, 0.8, '#7a746a'); }
        continue;
      }
      const w = kind === 'fenda' ? 1.4 : kind === 'abrigo' ? 4.2 : 2.8, h = kind === 'fenda' ? 3.4 : kind === 'abrigo' ? 2 : 2.6;
      // (the dark half-disc faces out of the slope, a little inside it)
      const P = at(X, Y, Z, yaw, 0.6, 0.02, 0); const im = I.mouth; const k = im.userData.n;
      if (k < im.userData.max) { M.e.set(0, -yaw - Math.PI / 2, 0, 'YXZ'); M.q.setFromEuler(M.e); M.a.compose(M.v.set(P[0], P[1], P[2]), M.q, M.s.set(w, h * 2, 1)); im.setMatrixAt(k, M.a); im.setColorAt(k, M.c.set('#07080a')); im.userData.n = k + 1; }
      // (the stones round its lip: the two at its feet on their own ground, the ones up the arch never under it)
      for (let j = 0; j < 7; j++) { const a = j / 6 * Math.PI; const r = at(X, Y, Z, yaw, 0.4, Math.sin(a) * h * 0.95, Math.cos(a) * w * 0.55); const g = floor(r[0], r[2]); const s = 0.8 + G.hash(j * 3 + m.y) * 0.6;
        put('rock', r[0], j === 0 || j === 6 ? seat(r[0], r[2], 0.35 * s) : Math.max(r[1], g + 0.05), r[2], a + m.x, s, 0.7, 0.7, '#8a8478'); }
    }
  }

  // ---- the god's gifts to a town: heaps of gold, gold falling from the sky, wine leaping from the wells
  function gifts(S, f, dt, t, R) {
    const B = S.gifts; if (!B) return;
    for (const q of B.piles) {
      const X = q.x * TL(), Z = q.y * TL(); if (!near2(X, Z, f, R)) continue; const Y = gY(q.x, q.y); const n = Math.min(14, 4 + q.n * 2);
      for (let k = 0; k < n; k++) { const a = G.hash(k * 7 + q.id) * TAU, r = Math.sqrt(G.hash(k * 13 + q.id)) * 0.7; const cx = X + Math.cos(a) * r, cz = Z + Math.sin(a) * r; // (each coin on the ground where it fell)
        put('coin', cx, gY(cx / TL(), cz / TL()) + 0.03 + (1 - r / 0.7) * 0.25 * G.hash(k), cz, a, 0.22, 0.22, 0.22, '#f2c14e', (G.hash(k * 3) - 0.5) * 0.6, (G.hash(k * 5) - 0.5) * 0.6); }
      if (G.FX3D && G.VR() < dt * 0.8) G.FX3D.spawn({ x: X + G.vrr(-0.4, 0.4), y: Y + 0.3, z: Z + G.vrr(-0.4, 0.4), vy: 0.1, life: 0.5, s0: 0.3, s1: 0.05, c: [1, 0.95, 0.7], a: 1, fade: 1 }, true);
    }
    for (const rn of B.rains) {
      if (rn.t > 8.5) continue; const fade = G.clamp((8.5 - rn.t) / 1.5, 0, 1); if (fade <= 0) continue;
      for (let j = 0; j < 90; j++) {
        const h1 = G.hash(j * 7 + rn.id), h2 = G.hash(j * 13 + rn.id * 3), h3 = G.hash(j * 31 + 5);
        const ph = (rn.t * (0.55 + h3 * 0.3) + h1) % 1; const a = h2 * TAU, d = Math.sqrt(h1) * rn.r;
        const x = rn.x + Math.cos(a) * d, y = rn.y + Math.sin(a) * d; if (!W.inb(x, y)) continue; const X = x * TL(), Z = y * TL(); if (!near2(X, Z, f, R)) continue;
        put('coin', X, gY(x, y) + (1 - ph) * 38 + 0.1, Z, t * 9 + j, 0.24, 0.24, 0.24, '#ffd84a', t * 7 + j, 0.4);
      }
    }
    for (const w of B.wine) for (const b of S.buildings.values()) {
      if (b.type !== 'well' || !b.built || b.set !== w.set) continue; const [cx, cy] = G.Village.center(b); const X = cx * TL(), Z = cy * TL(); if (!near2(X, Z, f, R)) continue; const Y = gY(cx, cy);
      lay('decal', X, Y + 0.05, Z, 0, 5.5, 5.5, '#5a0a30');
      if (G.FX3D) for (let k = 0; k < Math.ceil(dt * 30); k++) { const a = G.VR() * TAU; G.FX3D.spawn({ x: X, y: Y + 1.4, z: Z, vx: Math.cos(a) * G.vrr(0.6, 1.4), vy: G.vrr(3.5, 5), vz: Math.sin(a) * G.vrr(0.6, 1.4), life: 1.1, s0: 0.14, s1: 0.1, c: G.VR() < 0.3 ? [0.82, 0.27, 0.5] : [0.55, 0.06, 0.3], a: 0.9, sh: 1, grav: 9 }); }
    }
  }

  // ---- the ghosts of the haunted towns: seen only in the dark, a pale light of their own
  function ghosts(S, f, t) {
    const B = S.beyond; if (!B || !B.haunts || !B.haunts.length) return;
    const tm = S.time; const a = tm > 0.62 ? G.clamp((tm - 0.62) / 0.1, 0, 1) : tm < 0.06 ? G.clamp((0.06 - tm) / 0.04, 0, 1) : 0;
    T3.mats.ghost.opacity = 0.55 * a * (0.85 + Math.sin(t * 3) * 0.15); if (a <= 0) return;
    for (const h of B.haunts) for (const g of h.ghosts) {
      if (!W.inb(g.x, g.y)) continue; const X = g.x * TL(), Z = g.y * TL(); if (!near2(X, Z, f, 120)) continue;
      const s = memo('g' + g.id, X, Z, 0.033, 0); const Y = gY(g.x, g.y) + 0.35 + Math.sin(t * 2 + g.id) * 0.18;
      put('ghost', X, Y, Z, s.yaw, 1.2, 1.4, 1.2, '#dfeaff', 0, Math.sin(t * 1.3 + g.id) * 0.06);
      for (const sd of [-1, 1]) { const e = at(X, Y + 1.62, Z, s.yaw, 0.3, 0, sd * 0.1); put('ghostEye', e[0], e[1], e[2], s.yaw, 0.06, 0.1, 0.06, '#1e2850'); }
    }
  }

  // ---- the town's own signs: the banners of the rich houses, the lamp at the tavern door, the scaffold
  function town(S, f, t, night, R) {
    const E = G.Eco;
    for (const h of S.buildings.values()) {
      if (!h.built) continue;
      if (h.elite) { const x = h.x + h.w - 0.1, y = h.y + h.h - 0.1; const X = x * TL(), Z = y * TL(); if (!near2(X, Z, f, R * 0.7)) continue; const Y = gY(x, y); const col = (E && E.GOODS && E.GOODS[h.elite.k] && E.GOODS[h.elite.k].col) || '#c83a2a'; put('pole', X, Y, Z, 0, 0.08, 5.2, 0.08, '#5a3c22'); const w = (G.S.weather && G.S.weather.windA) || 0; put('flag', X, Y + 4.6, Z, w, 1.3, 1.3, 1.3, col); }
      if (h.type === 'taverna' && night > 0.3) { const [dx, dy] = G.Vg.door(h); const X = dx * TL(), Z = dy * TL(); if (!near2(X, Z, f, R * 0.7)) continue; const Y = gY(dx, dy); put('lamp', X, Y + 2.3, Z, 0, 0.22, 0.3, 0.22, '#ffd38a'); flame(X, Y + 2.5, Z, 0.7); }
    }
    for (const s of S.scaffolds || []) {
      const X = s.x * TL(), Z = s.y * TL(); if (!near2(X, Z, f, R)) continue; const Y = gY(s.x, s.y);
      // (a platform on posts, steps up to it, and the beam of the gallows over it)
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('plank', X + a * 1.3, Y, Z + b * 1.3, 0, 0.2, 1.2, 0.2, '#5a3c22');
      put('plank', X, Y + 1.2, Z, 0, 3, 0.15, 3, '#7a5a3a');
      put('plank', X + 1.1, Y + 1.35, Z, 0, 0.18, 2.8, 0.18, '#5a3c22'); put('plank', X + 0.4, Y + 4.1, Z, 0, 1.6, 0.18, 0.18, '#5a3c22');
      put('rope', X - 0.2, Y + 3.1, Z, 0, 0.03, 1.0, 0.03, '#b8a888');
    }
  }

  // ---- the wild's small homes: hives hanging in the trees, nests in the trees, on the roofs, on the ground
  function wild(S, f, t, R) {
    for (const h of S.hives || []) {
      const tr = S.trees.get(h.tree); if (!tr) continue; const X = tr.x * TL(), Z = tr.y * TL(); if (!near2(X, Z, f, Math.min(R, 70))) continue;
      const Y = gY(tr.x, tr.y) + 2.6 + tr.size * 2.2; put('hive', X + 0.6, Y, Z + 0.3, 0, 0.5, 0.65, 0.5, '#c8962a');
      if (G.FX3D && G.VR() < 0.12) G.FX3D.spawn({ x: X + 0.6 + G.vrr(-0.4, 0.4), y: Y + G.vrr(-0.3, 0.3), z: Z + 0.3 + G.vrr(-0.4, 0.4), vx: G.vrr(-0.5, 0.5), vz: G.vrr(-0.5, 0.5), life: 1.2, s0: 0.05, s1: 0.05, c: [0.15, 0.12, 0.05], a: 1, wob: 2 });
    }
    for (const n of S.nests || []) {
      let x = n.x, y = n.y, up = 0.15;
      if (n.type === 'tree') { const tr = S.trees.get(n.host); if (!tr) continue; x = tr.x; y = tr.y; up = 3 + tr.size * 3.2; }
      else if (n.type === 'roof') { const b = S.buildings.get(n.host); if (!b) continue; x = b.x + b.w / 2; y = b.y + b.h / 2; up = (G.Build3D ? G.Build3D.heightAt(W.idx(x, y)) : 4) + 0.2; }
      if (x === undefined || !W.inb(x, y)) continue; const X = x * TL(), Z = y * TL(); if (!near2(X, Z, f, Math.min(R, 70))) continue;
      put('nest', X, gY(x, y) + up, Z, 0, 1, 1, 1, '#7a5a3a');
    }
  }

  // (for the checker: every thing drawn this frame is made of numbers)
  T3.check = function () {
    const out = []; for (const k in I) { const m = I[k]; const a = m.instanceMatrix.array; for (let j = 0; j < m.count * 16; j += 5) if (!Number.isFinite(a[j])) { out.push(`as coisas do 3D (${k}): matriz inválida`); break; } }
    // (no stone of a cave's mouth under the ground it should sit on: each on the ground of its own point — the stones are
    // only turned about the vertical, so their top is the middle plus half their height)
    const r = I.rock; if (r && W && G.S) { const a = r.instanceMatrix.array, HM = G.Space.HM; let bad = 0, worst = 0, at = null;
      for (let j = 0; j < r.count; j++) { const e = j * 16; const X = a[e + 12], Z = a[e + 14]; const top = a[e + 13] + 0.5 * Math.abs(a[e + 5]); const fl = W.hAt(X / TL(), Z / TL()) * HM;
        if (top < fl - 0.05) { bad++; if (fl - top > worst) { worst = fl - top; at = [+(X / TL()).toFixed(1), +(Z / TL()).toFixed(1)]; } } }
      if (bad) out.push(`as coisas do 3D (rock): ${bad} pedra(s) enterrada(s), a pior ${worst.toFixed(2)} m abaixo do chão em ${at}`); }
    return out;
  };
  T3.clear = function () { for (const k in I) I[k].count = 0; T3.flames.length = 0; };
})(window.G);
