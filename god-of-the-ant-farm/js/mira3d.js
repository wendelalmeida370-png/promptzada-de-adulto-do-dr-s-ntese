'use strict';
// ============================================================
//  Mira3D: the mark round what the body's hands would act on now
//  (20e, D-398) — the thing the screen shows the prompt for
//  (IncUI's firm target: a person, a beast, a door, a piece of
//  furniture, a tree, a rock, a thing on the ground, the water at
//  the feet). A light of the edge, as a game for a PC marks what
//  is meant: the edges of a door, a chest, a bed or a crate glow
//  where they are seen, a soft rim round a crown, a body, a beast
//  — never through a wall: the world's own depth hides it —, and
//  a quiet ring on the ground under it. Firm: it fades in and
//  out over a tenth of a second, the old one out as the new one
//  comes, and never blinks; it breathes very slowly. Placed in
//  the frame drawn, just before the picture is made (the scene's
//  onBeforeRender): where the 3D draws the target now, so it
//  follows who walks without lagging a frame behind. Only seen:
//  it reads the world and the 3D's memory of where things are
//  drawn (People3D.visOf, beastVis, lying), writes nothing of the
//  world and draws no chance. Also: the point by the target the
//  prompt is set beside (anchor), and a candidate's middle for a
//  finger's tap (pointOf).
// ============================================================
(function (G) {
  const M = G.Mira3D = { on: true };
  let THREE = null, scene = null, hooked = false, want = null, anchorP = null, lastT = -1, geo = null;
  const V = {}; // (the vectors a picture reuses)
  const slots = []; // ({ key, k (0..1), dir (+1 coming, -1 going), parts: [mesh…], mats: [material…], kind, info })
  M.FADE_IN = 0.12; M.FADE_OUT = 0.14; // (seconds)
  M.COL = [1.0, 0.82, 0.42]; M.COL_NO = [0.78, 0.8, 0.86]; // (the warm gold of what can be done now; a pale grey of what cannot)
  const TAU = Math.PI * 2;
  G.worldHooks.push(() => { for (const s of slots) drop(s); slots.length = 0; want = null; anchorP = null; lastT = -1; });
  // (what the screen shows now: { key, id, t, ok } or null — read at the next picture)
  M.set = function (sel) { want = sel || null; if (!hooked) hook(); };
  M.anchor = () => anchorP;
  M.slots = () => slots.map(s => ({ key: s.key, k: +s.k.toFixed(3), dir: s.dir, kind: s.kind, parts: s.parts.length, info: s.info })); // (for the proofs)

  // ------------------------------ the materials ------------------------------
  // (an edge of a box glows: on each face the distance to its nearest edge, in metres of the box itself — the faces seen, the
  // depth of the world in front of them hiding them)
  const EDGE_VS = `varying vec3 vP; varying vec3 vN; uniform vec3 uSize;
void main() { vP = position * uSize; vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const EDGE_FS = `varying vec3 vP; varying vec3 vN; uniform vec3 uSize; uniform vec3 uCol; uniform float uK; uniform float uW;
void main() {
  vec3 h = uSize * 0.5 - abs(vP); vec3 n = abs(vN);
  float e = 1e3; if (n.x < 0.5) e = min(e, h.x); if (n.y < 0.5) e = min(e, h.y); if (n.z < 0.5) e = min(e, h.z);
  float a = (1.0 - smoothstep(0.0, uW, e)) + 0.10 * (1.0 - smoothstep(uW, uW * 5.0, e));
  gl_FragColor = vec4(uCol * a * uK, 1.0);
}`;
  // (a rim: the surface seen edge-on glows, seen face-on is clear — round a crown, a body, a beast, a rock)
  const RIM_VS = `varying vec3 vN; varying vec3 vV;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }`;
  const RIM_FS = `varying vec3 vN; varying vec3 vV; uniform vec3 uCol; uniform float uK; uniform float uP;
void main() { float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = pow(clamp(f, 0.0, 1.0), uP); gl_FragColor = vec4(uCol * a * uK, 1.0); }`;
  // (a ring on the ground: a soft band, brightest at its middle, fading to nothing at both sides)
  const RING_VS = `varying vec2 vQ; void main() { vQ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const RING_FS = `varying vec2 vQ; uniform vec3 uCol; uniform float uK;
void main() { float r = length(vQ); float a = smoothstep(0.72, 0.86, r) * (1.0 - smoothstep(0.9, 1.0, r)); gl_FragColor = vec4(uCol * a * uK, 1.0); }`;
  function mat(vs, fs, extra) {
    const u = Object.assign({ uCol: { value: new THREE.Vector3(1, 0.82, 0.42) }, uK: { value: 0 } }, extra || {});
    return new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6, toneMapped: false, fog: false });
  }
  function geos() {
    if (geo) return geo;
    const ring = new THREE.RingGeometry(0.7, 1, 56, 1); // (in the XY plane, laid flat by the mesh)
    geo = { box: new THREE.BoxGeometry(1, 1, 1), ball: new THREE.SphereGeometry(1, 28, 18), ring };
    return geo;
  }
  function mesh(g, m) { const o = new THREE.Mesh(g, m); o.renderOrder = 990; o.castShadow = false; o.receiveShadow = false; o.matrixAutoUpdate = true; scene.add(o); return o; }

  // ------------------------------ the shape of a target ------------------------------
  // (where the 3D draws the target now and how big it is: { kind, X, Y (its foot), Z, parts: [{ g: 'box'|'ball', c: [x, y, z]
  // middle, s: [x, y, z] size (box) or radii (ball), yaw }], ring: [X, Y, Z, r] or null, h (its height) } — metres; or null)
  const TL = () => G.Space.TILE, HM = () => G.Space.HM;
  const gy = (X, Z) => (G.Avatar && G.Avatar.floorAt ? G.Avatar.floorAt(X, Z) : G.W.groundH(X / TL(), Z / TL()) * HM());
  // (the floor of a storey of a building's plan, metres — as the body's controller puts it)
  const floorOf = (B, lv) => { const e = B && G.Space.planEntry ? G.Space.planEntry(B.id) : null; if (!e || !e.p) return null; return e.y0 + (e.p.levels.find(q => q.lv === lv) || { y: 0 }).y + G.Space.FLOOR_UP; };
  const isPerson = t => !!(t.o && G.S.villagers.get(t.o.id) === t.o);
  function shapeOf(sel, memo) {
    const t = sel && sel.t; if (!t) return null; const S = G.S, P3 = G.People3D;
    if (isPerson(t)) {
      const o = t.o; const s = P3 && P3.visOf ? P3.visOf(o.id) : null; const X = s ? s.X : o.x * TL(), Z = s ? s.Z : o.y * TL(); const Y = s && Number.isFinite(s.Y) ? s.Y : gy(X, Z);
      const k = memo.k || (memo.k = P3 && P3.look ? P3.look(o).s || 1 : 1);
      return { kind: 'pessoa', X, Y, Z, h: 1.78 * k, parts: [{ g: 'ball', c: [X, Y + 0.92 * k, Z], s: [0.36 * k, 1.0 * k, 0.36 * k], yaw: 0 }], ring: [X, Y, Z, 0.55 * k] };
    }
    if (t.a) {
      const a = t.a; const s = P3 && P3.beastVis ? P3.beastVis(a.id) : null; const X = s && Number.isFinite(s.X) ? s.X : a.x * TL(), Z = s && Number.isFinite(s.Z) ? s.Z : a.y * TL();
      const Y = s && Number.isFinite(s.Y) ? s.Y : gy(X, Z); const C = G.Corpo; const d = C && C.DIM ? C.DIM[a.kind] : null; const k = C && C.scaleOf ? C.scaleOf(a) : 1;
      const z0 = (d ? d[0] : -0.4) * k, z1 = (d ? d[1] : 0.6) * k, hw = (d ? d[2] : 0.2) * k, h = Math.max(0.2, (d ? d[3] : 0.8) * k);
      const fl = Math.hypot(a.fx || 0, a.fy || 0); const ha = fl > 1e-6 ? Math.atan2(a.fy, a.fx) : 0; const mid = (z0 + z1) / 2;
      const cx = X + Math.cos(ha) * mid, cz = Z + Math.sin(ha) * mid;
      return { kind: 'bicho', X: cx, Y, Z: cz, h, parts: [{ g: 'ball', c: [cx, Y + h * 0.52, cz], s: [Math.max(0.15, (z1 - z0) / 2 + 0.06), h * 0.56, hw + 0.1], yaw: ha }], ring: [cx, Y, cz, Math.max(0.35, (z1 - z0) / 2 + 0.25)] };
    }
    // (a door of a plan: its leaf, in its wall, on its storey)
    if (t.d && t.b && t.p) {
      const w = t.p.walls[t.d.wall]; if (!w) return null; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const ha = Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]);
      const Y0 = floorOf(t.b, t.lv); const Y = (Y0 === null ? gy(t.X, t.Z) : Y0) + (t.d.sill || 0); const h = Math.max(1.6, t.d.h || 2.1); void L;
      return { kind: 'porta', X: t.X, Y, Z: t.Z, h, parts: [{ g: 'box', c: [t.X, Y + h / 2, t.Z], s: [Math.max(0.6, t.d.w || 1), h, (w.t || 0.3) + 0.08], yaw: ha }], ring: null };
    }
    // (a piece of a plan's furniture — a bed, a seat's piece, a chest —: its footprint and its height, where it is mounted)
    const it = t.it || (t.pl && t.pl.it) || null;
    if (it && t.b && it.r) {
      const B = t.b; const D = (G.Interiors.ITEMS || {})[it.kind] || {}; const Y0 = floorOf(B, it.lv); const base = (Y0 === null ? gy(t.X, t.Z) : Y0) + (it.y || D.y || 0);
      const cx = B.x * TL() + (it.r[0] + it.r[2]) / 2, cz = B.y * TL() + (it.r[1] + it.r[3]) / 2; const h = Math.max(0.12, it.h || D.h || 0.5);
      return { kind: 'movel', X: cx, Y: base, Z: cz, h, parts: [{ g: 'box', c: [cx, base + h / 2, cz], s: [it.r[2] - it.r[0] + 0.05, h + 0.04, it.r[3] - it.r[1] + 0.05], yaw: 0 }], ring: null };
    }
    // (a thing lying on the ground: the form the 3D lays it in, turned as it lies — People3D.lying, the same thing by its name)
    if (t.g) {
      const e = P3 && P3.lying ? P3.lying.find(q => q[4] === t.g && q[5] === 0) : null; const F = e && P3.FORM ? P3.FORM[e[3]] : null;
      const sz = F && F.sz ? F.sz : [0.4, 0.3, 0.4]; const a = G.hash ? G.hash(t.g * 7 + 3) * TAU : 0; const flat = !!(e && F && e[1] - gy(e[0], e[2]) < sz[1] / 2 - 0.02);
      const X = e ? e[0] : t.X, Z = e ? e[2] : t.Z; const Yc = e ? e[1] : gy(X, Z) + sz[1] / 2; const s = flat ? [sz[0], sz[2], sz[1]] : sz;
      return { kind: 'coisa', X, Y: Yc - s[1] / 2, Z, h: s[1], parts: [{ g: 'box', c: [X, Yc, Z], s: [s[0] + 0.05, s[1] + 0.05, s[2] + 0.05], yaw: a }], ring: [X, Yc - s[1] / 2, Z, Math.max(0.35, Math.max(s[0], s[2]) * 0.75)] };
    }
    if (t.tr) {
      const tr = t.tr; const X = tr.x * TL(), Z = tr.y * TL(), Y = gy(X, Z); const c = G.Realm && G.Realm.crownOf ? G.Realm.crownOf(tr) : null; const sz = Math.max(0.3, tr.size || 1);
      if (tr.stage === 'log') return { kind: 'arvore', X, Y, Z, h: 0.6, parts: [], ring: [X, Y, Z, 1.2] };
      if (c) return { kind: 'arvore', X, Y, Z, h: c[1] + c[3] - Y, parts: [{ g: 'ball', c: [c[0], c[1], c[2]], s: [c[3] * 1.04, c[3] * 0.96, c[3] * 1.04], yaw: 0 }, { g: 'ball', c: [X, Y + (c[1] - Y) / 2, Z], s: [0.22 * sz + 0.08, (c[1] - Y) / 2 + 0.1, 0.22 * sz + 0.08], yaw: 0 }], ring: [X, Y, Z, 0.7] };
      const h = 1.2 + 3.6 * sz; return { kind: 'arvore', X, Y, Z, h, parts: [{ g: 'ball', c: [X, Y + h / 2, Z], s: [0.5 + 0.7 * sz, h / 2, 0.5 + 0.7 * sz], yaw: 0 }], ring: [X, Y, Z, 0.7] };
    }
    if (t.bu) { const X = t.bu.x * TL(), Z = t.bu.y * TL(), Y = gy(X, Z); return { kind: 'arbusto', X, Y, Z, h: 1, parts: [{ g: 'ball', c: [X, Y + 0.45, Z], s: [0.62, 0.52, 0.62], yaw: 0 }], ring: [X, Y, Z, 0.75] }; }
    if (t.r && t.r.x !== undefined) { const r = t.r; const X = r.x * TL(), Z = r.y * TL(), Y = gy(X, Z); const k = 0.45 + 0.4 * Math.sqrt(Math.max(0, Math.min(1, (r.stone || 1) / (r.max || 1)))); return { kind: 'pedra', X, Y, Z, h: k, parts: [{ g: 'ball', c: [X, Y + k * 0.42, Z], s: [k * 1.1, k * 0.72, k * 1.1], yaw: 0 }], ring: [X, Y, Z, k + 0.35] }; }
    // (an offer of the world at a crate the 3D draws: the crate; at its spot otherwise — a ring; the water at the feet: a ring on it)
    if (t.hand) { const X = t.hand[0], Z = t.hand[2], Yc = t.hand[1]; return { kind: 'caixa', X, Y: Yc - 0.25, Z, h: 0.5, parts: [{ g: 'box', c: [X, Yc, Z], s: [0.6, 0.5, 0.6], yaw: 0 }], ring: [X, Yc - 0.25, Z, 0.5] }; }
    if (sel.id === 'obra' && t.b) { const b = t.b; const X = (b.x + b.w / 2) * TL(), Z = (b.y + b.h / 2) * TL(), Y = gy(X, Z); return { kind: 'obra', X: t.X, Y: gy(t.X, t.Z), Z: t.Z, h: 1.2, parts: [{ g: 'box', c: [X, Y + 0.05, Z], s: [b.w * TL() + 0.2, 0.1, b.h * TL() + 0.2], yaw: 0 }], ring: null }; }
    const X = t.X, Z = t.Z; let Y = gy(X, Z);
    if ((t.here || (sel.p && sel.p.here)) && G.Avatar.waterAt) { const wY = G.Avatar.waterAt(X, Z); if (Number.isFinite(wY) && wY > Y) Y = wY; }
    const ind = G.Avatar.indoors && G.Avatar.indoors(); if (ind && (t.s || sel.id === 'escada')) { const p = G.Avatar.pos(); if (p) Y = p.Y; }
    return { kind: 'ponto', X, Y, Z, h: 1, parts: [], ring: [X, Y, Z, 0.55] };
  }
  // (a candidate's middle, for a finger's tap on the picture: the middle of its shape)
  M.pointOf = function (c) { if (!c || !c.t) return null; const s = shapeOf(c, {}); return s ? { X: s.X, Y: s.Y + s.h / 2, Z: s.Z } : { X: c.t.X, Y: gy(c.t.X, c.t.Z) + 0.8, Z: c.t.Z }; };

  // ------------------------------ the slots: the one coming, the ones going ------------------------------
  function build(sel) {
    const g = geos(); const sh = shapeOf(sel, {}); const s = { key: sel.key, k: 0, dir: 1, parts: [], mats: [], memo: {}, kind: sh ? sh.kind : 'nada', info: null, sel };
    if (!sh) return s;
    for (const p of sh.parts) {
      const m = p.g === 'box' ? mat(EDGE_VS, EDGE_FS, { uSize: { value: new THREE.Vector3(1, 1, 1) }, uW: { value: 0.03 } }) : mat(RIM_VS, RIM_FS, { uP: { value: sh.kind === 'arvore' ? 2.6 : 2.2 } });
      s.parts.push({ o: mesh(p.g === 'box' ? g.box : g.ball, m), g: p.g, m }); s.mats.push(m);
    }
    if (sh.ring) { const m = mat(RING_VS, RING_FS); s.ring = mesh(g.ring, m); s.mats.push(m); }
    return s;
  }
  function drop(s) { for (const p of s.parts) { scene && scene.remove(p.o); p.m.dispose(); } if (s.ring) { scene && scene.remove(s.ring); s.ring.material.dispose(); } s.parts = []; s.ring = null; }
  // (each picture: the slots made to agree with what the screen shows, faded, and put where the target is drawn now)
  function update() {
    const now = G.Realm && G.Realm.time ? G.Realm.time() : 0; if (now === lastT) return; const dt = lastT < 0 ? 0 : Math.max(0, Math.min(0.1, now - lastT)); lastT = now;
    const sel = M.on && G.Modes && G.Modes.inc && G.Modes.inc() ? want : null;
    let cur = slots.find(s => s.dir > 0) || null;
    if (cur && (!sel || sel.key !== cur.key)) { cur.dir = -1; cur = null; }
    if (sel && !cur) { const back = slots.find(s => s.key === sel.key); if (back) { back.dir = 1; cur = back; } else { cur = build(sel); slots.push(cur); } }
    if (cur && sel) cur.sel = sel;
    anchorP = null;
    for (let i = slots.length - 1; i >= 0; i--) {
      const s = slots[i]; s.k = G.clamp(s.k + (s.dir > 0 ? dt / M.FADE_IN : -dt / M.FADE_OUT), 0, 1);
      if (s.dir < 0 && s.k <= 0) { drop(s); slots.splice(i, 1); continue; }
      place(s, now);
    }
  }
  function place(s, now) {
    const sh = shapeOf(s.sel, s.memo); if (!sh) { for (const p of s.parts) p.o.visible = false; if (s.ring) s.ring.visible = false; return; }
    const cam = G.Realm.camera ? G.Realm.camera() : null; const col = s.sel.ok === false ? M.COL_NO : M.COL;
    // (a slow breath, ±5 %: never a blink)
    const k = G.smooth ? G.smooth(0, 1, s.k) : s.k; const breath = 0.95 + 0.05 * Math.sin(now * TAU / 1.8);
    const dCam = cam ? Math.hypot(cam.position.x - sh.X, cam.position.y - (sh.Y + sh.h / 2), cam.position.z - sh.Z) : 5;
    for (let i = 0; i < s.parts.length; i++) {
      const p = s.parts[i], d = sh.parts[i]; if (!d) { p.o.visible = false; continue; }
      p.o.visible = true; p.o.position.set(d.c[0], d.c[1], d.c[2]); p.o.rotation.set(0, -d.yaw, 0);
      p.o.scale.set(d.s[0], d.s[1], d.s[2]); p.o.updateMatrixWorld(true); const u = p.m.uniforms; u.uCol.value.set(col[0], col[1], col[2]);
      if (p.g === 'box') { u.uSize.value.set(d.s[0], d.s[1], d.s[2]); u.uW.value = G.clamp(0.018 + dCam * 0.006, 0.02, 0.09); u.uK.value = 1.15 * k * breath; }
      else u.uK.value = (sh.kind === 'arvore' ? 0.75 : 0.62) * k * breath;
    }
    if (s.ring && sh.ring) {
      const [X, Y, Z, r] = sh.ring; s.ring.visible = true;
      // (laid on the ground as it slopes there: its normal from the ground round it)
      const e = Math.max(0.3, r * 0.8); const hx = gy(X + e, Z) - gy(X - e, Z), hz = gy(X, Z + e) - gy(X, Z - e);
      const n = (V.n || (V.n = new THREE.Vector3())).set(-hx / (2 * e), 1, -hz / (2 * e)).normalize(); s.ring.quaternion.setFromUnitVectors(V.z || (V.z = new THREE.Vector3(0, 0, 1)), n);
      s.ring.position.set(X, Y + 0.035, Z); s.ring.scale.set(r, r, 1); s.ring.updateMatrixWorld(true); const u = s.ring.material.uniforms; u.uCol.value.set(col[0], col[1], col[2]); u.uK.value = 0.85 * k * breath;
    } else if (s.ring) s.ring.visible = false;
    if (s.dir > 0) anchorP = { key: s.key, X: sh.X, Y: sh.Y + sh.h * 0.58, Z: sh.Z, kind: sh.kind };
    s.info = { X: +sh.X.toFixed(2), Y: +sh.Y.toFixed(2), Z: +sh.Z.toFixed(2), h: +sh.h.toFixed(2) };
  }
  // (once the 3D has its scene: every picture made of it — straight to the screen or through the post's — asks here first)
  function hook() {
    if (hooked || !G.Realm || !G.Realm.scene || !G.Realm.scene() || !window.THREE) return;
    THREE = window.THREE; scene = G.Realm.scene(); hooked = true;
    const prev = scene.onBeforeRender;
    scene.onBeforeRender = function () { if (typeof prev === 'function') prev.apply(this, arguments); update(); };
  }
  M.hooked = () => hooked;
})(window.G);
