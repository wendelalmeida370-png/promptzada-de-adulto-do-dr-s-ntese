'use strict';
// ============================================================
//  Combate3D: what is seen of the fight (20f) — the trail of the
//  blade the body swings, from the point of the very thing in
//  its hand (the rig's own frame of it, the arte's point); the
//  flash and the sparks where a blow lands, is blocked, is
//  turned aside; the arrows in the air where the world has them
//  (G.Combate.flights), each in its own shape (G.ItemArt), along
//  the way it flies. Only seen: it reads the world and the
//  body's drawing, writes nothing of them, and what flickers
//  draws from the view's own chance (G.VR).
// ============================================================
(function (G) {
  const C = G.Combate3D = { arrows: 0, trail: 0, flashes: 0 };
  let THREE = null, scene = null, arrowM = null, trailM = null, trailG = null, ok = false, tried = false;
  const NA = 24, NT = 14; // (arrows drawn at most; points of the trail kept)
  const hist = []; let histA = null;
  G.worldHooks.push(() => { hist.length = 0; histA = null; C.arrows = 0; C.trail = 0; });
  function init() {
    tried = true; THREE = window.THREE; const R3 = G.Realm; if (!THREE || !R3 || !R3.scene || !R3.scene()) return false;
    scene = R3.scene();
    // the arrows: one instanced shape (the bronze arrow of the arte, or a shaft of its own when the arte has none)
    const geo = (G.ItemArt && G.ItemArt.ready && G.ItemArt.geo('flecha.bronze', 1)) || (() => { const g = new THREE.CylinderGeometry(0.008, 0.008, 0.75, 4); g.translate(0, 0.375, 0); return g; })();
    const mat = G.ItemArt && G.ItemArt.ready && G.ItemArt.material ? G.ItemArt.material(THREE, {}) : new THREE.MeshLambertMaterial({ color: 0x9a7448 });
    arrowM = new THREE.InstancedMesh(geo, mat, NA); arrowM.count = 0; arrowM.frustumCulled = false; arrowM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(arrowM);
    // the trail: a strip from the blade's middle to its point, over the last few frames, fading
    trailG = new THREE.BufferGeometry(); trailG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NT * 2 * 3), 3)); trailG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NT * 2 * 4), 4));
    const idx = []; for (let k = 0; k < NT - 1; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } trailG.setIndex(idx);
    trailM = new THREE.Mesh(trailG, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    trailM.frustumCulled = false; trailM.renderOrder = 5; trailM.visible = false; scene.add(trailM);
    ok = true; return true;
  }
  const M4 = () => C._m || (C._m = new THREE.Matrix4()), Q4 = () => C._q || (C._q = new THREE.Quaternion()), V = () => C._v || (C._v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 1, 1)]);
  // the arrows in the air, where the world has them, turned along their way
  function arrows() {
    const L = G.Combate && G.Combate.flights ? G.Combate.flights() : []; let n = 0; const [p, d, up, one] = V(); const m = M4(), q = Q4();
    for (const f of L) { if (n >= NA) break; const s = Math.hypot(f.vx, f.vy, f.vz) || 1; d.set(f.vx / s, f.vy / s, f.vz / s); q.setFromUnitVectors(up, d); p.set(f.X - d.x * 0.7, f.Y - d.y * 0.7, f.Z - d.z * 0.7); m.compose(p, q, one); arrowM.setMatrixAt(n++, m); }
    arrowM.count = n; if (n) arrowM.instanceMatrix.needsUpdate = true; C.arrows = n;
  }
  // the trail of the blow in course: the point of the thing in the hand (or the fist), from the rig of the body as drawn this frame
  const TRAIL_ACTS = /^cb-(faca|espada|machado|lanca|duas|punho)-(\d|p)$/;
  function trail() {
    const av = G.People3D && G.People3D.avatar; const a = G.Avatar && G.Avatar.actNow ? G.Avatar.actNow() : null;
    const on = !!(av && av.pose && av.look && a && TRAIL_ACTS.test(a.anim || '')); const u = on && a.dur > 0 ? a.t / a.dur : 0;
    const c = on && a.contact > 0 && a.dur > 0 ? a.contact / a.dur : 0.45;
    const live = on && u > c - 0.22 && u < c + 0.2;
    if (a !== histA) { hist.length = 0; histA = a; }
    if (live && G.People3D.rig && G.People3D.B) {
      const R = G.People3D.rig(av.X, av.Y, av.Z, av.yaw, av.pose, av.look); const B = G.People3D.B;
      const key = av.look.inv && av.look.inv.mao; const mk = key && G.ItemArt && G.ItemArt.marks ? G.ItemArt.marks(key) : null;
      const [p, q] = V(); const fr = mk ? R[B.tool] : R[B.hdR];
      if (fr) { const tip = mk && mk.ponta ? mk.ponta : [0, 0.08, 0.06]; const mid = mk && mk.centro ? mk.centro : [0, 0.02, 0.02];
        p.set(tip[0], tip[1], tip[2]).applyMatrix4(fr); q.set(mid[0], mid[1], mid[2]).applyMatrix4(fr);
        hist.push([p.x, p.y, p.z, q.x, q.y, q.z]); if (hist.length > NT) hist.shift(); }
    } else if (hist.length) hist.shift();
    const n = hist.length; trailM.visible = n >= 2; C.trail = n; if (n < 2) return;
    const P = trailG.attributes.position.array, Cc = trailG.attributes.color.array;
    for (let k = 0; k < NT; k++) { const h = hist[Math.min(n - 1, k)]; const i = k * 6; P[i] = h[0]; P[i + 1] = h[1]; P[i + 2] = h[2]; P[i + 3] = h[3]; P[i + 4] = h[4]; P[i + 5] = h[5];
      const al = k < n ? Math.pow((k + 1) / n, 1.6) * 0.55 : 0; const j = k * 8; Cc[j] = 0.95; Cc[j + 1] = 0.92; Cc[j + 2] = 0.82; Cc[j + 3] = al; Cc[j + 4] = 0.9; Cc[j + 5] = 0.85; Cc[j + 6] = 0.72; Cc[j + 7] = 0; }
    trailG.attributes.position.needsUpdate = true; trailG.attributes.color.needsUpdate = true; trailG.setDrawRange(0, (Math.min(n, NT) - 1) * 6);
  }
  // the flash where a blow met something: sparks of metal on a guard or a parry, a spray on flesh, the dust of a fist
  C.flash = function (e, kind) {
    if (!G.FX3D || !G.FX3D.spawn || !e || !Number.isFinite(e.x)) return; C.flashes++;
    const TL = (G.Space && G.Space.TILE) || 4; const X = e.x * TL, Z = e.y * TL; const Y = (G.Space ? G.Space.groundY(X, Z) : 0) + 1.25;
    const metal = kind === 'aparo' || kind === 'bloqueio'; const n = kind === 'aparo' ? 16 : metal ? 9 : 7;
    for (let k = 0; k < n; k++) {
      const a = G.vrr(0, Math.PI * 2), s = G.vrr(1.2, metal ? 4.5 : 2.4);
      if (metal) G.FX3D.spawn({ x: X, y: Y, z: Z, vx: Math.cos(a) * s, vy: G.vrr(0.5, 3), vz: Math.sin(a) * s, life: G.vrr(0.12, 0.3), s0: 0.06, s1: 0.01, c: [1, G.vrr(0.8, 0.95), 0.55], a: 1, sh: 0, drag: 2, grav: 6 }, true);
      else G.FX3D.spawn({ x: X, y: Y - 0.1, z: Z, vx: Math.cos(a) * s * 0.6, vy: G.vrr(0.3, 1.6), vz: Math.sin(a) * s * 0.6, life: G.vrr(0.35, 0.6), s0: 0.05, s1: 0.03, c: [0.45, 0.05, 0.06], a: 0.9, sh: 1, drag: 1, grav: 9 }, false);
    }
    if (kind === 'aparo' || kind === 'acerto') G.FX3D.spawn({ x: X, y: Y, z: Z, life: 0.09, s0: kind === 'aparo' ? 0.7 : 0.45, s1: 0.1, c: [1, 0.95, 0.8], a: 0.9, sh: 0 }, true);
  };
  C.frame = function () {
    if (!ok) { if (tried && !(window.THREE && G.Realm && G.Realm.scene && G.Realm.scene())) return; if (!init()) return; }
    if (!(G.Modes && G.Modes.inc && G.Modes.inc())) { arrowM.count = 0; trailM.visible = false; hist.length = 0; return; }
    arrows(); trail();
  };
  if (G.IncUI && G.IncUI.frames) G.IncUI.frames.push(rdt => C.frame(rdt));
})(window.G);
