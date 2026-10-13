'use strict';
// ============================================================
//  FX3D: what moves in the world around the body and is not a
//  person or a beast — the fires that burn (S.fire: a house on
//  fire in the world is on fire here too), the rain and the snow
//  of the weather the world is having (S.weather), and the real
//  ships of S.ships on the water, each with its people's colour
//  on the sail. Only seen: nothing here touches the world, and
//  what flickers or falls draws from the view's own chance (G.VR).
// ============================================================
(function (G) {
  const W = G.W;
  const F3 = G.FX3D = { fires: 0, ships: 0, drops: 0 };
  let THREE = null, R3 = null, scene = null, flame = null, glow = null, rain = null, rainP = null, hull = null, mast = null, sail = null, deck = null, light = null;
  const MAXF = 140, MAXS = 40, NR = 1600;
  const TAU = Math.PI * 2;
  const svis = new Map(); G.worldHooks.push(() => svis.clear());
  F3.init = function (three, realm) {
    THREE = three; R3 = realm; scene = realm.scene();
    const cone = new THREE.ConeGeometry(0.5, 1, 6); cone.translate(0, 0.5, 0);
    flame = new THREE.InstancedMesh(cone, new THREE.MeshBasicMaterial({ color: 0xff9a2a, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }), MAXF);
    glow = new THREE.InstancedMesh(cone, new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }), MAXF);
    for (const m of [flame, glow]) { m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); }
    light = new THREE.PointLight(0xff8a3a, 0, 26, 1.6); scene.add(light);
    // rain: short streaks falling round the eye
    rainP = new Float32Array(NR * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(rainP, 3));
    rain = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xc8d8e8, size: 0.09, transparent: true, opacity: 0, depthWrite: false })); rain.frustumCulled = false; scene.add(rain);
    for (let k = 0; k < NR; k++) { rainP[k * 3] = (G.VR() - 0.5) * 60; rainP[k * 3 + 1] = G.VR() * 30; rainP[k * 3 + 2] = (G.VR() - 0.5) * 60; }
    // ships: a hull, a deck house, a mast and a sail each (instanced, coloured by their people)
    const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
    const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 6); cyl.translate(0, 0.5, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    hull = new THREE.InstancedMesh(box, mat, MAXS); deck = new THREE.InstancedMesh(box, mat, MAXS); mast = new THREE.InstancedMesh(cyl, mat, MAXS); sail = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), MAXS);
    for (const m of [hull, deck, mast, sail]) { m.count = 0; m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); }
  };
  const M = {}; const mats = () => { if (M.a) return; M.a = new THREE.Matrix4(); M.b = new THREE.Matrix4(); M.c = new THREE.Color(); M.z = new THREE.Matrix4().makeScale(0, 0, 0); };
  // (ship sizes, metres: [length, beam, mast])
  const SHIP = { pesca: [5, 1.8, 4], canoa: [4, 1.1, 0], jangada: [3.5, 2.4, 2], explorador: [11, 3.2, 9], mercante: [13, 3.8, 10], guerra: [15, 4, 12], transporte: [13, 4, 10] };
  F3.update = function (rdt, focus) {
    if (!flame || !focus) return; mats();
    const S = G.S; const L = G.Space.TILE, H = G.Space.HM; const t = performance.now() / 1000;
    // ---- fire: the burning tiles near the eye
    let n = 0, best = 0, bx = 0, by = 0, bz = 0;
    const x0 = Math.floor(focus.X / L), y0 = Math.floor(focus.Z / L), R = 16;
    if (G.Nature && G.Nature.fireSet && G.Nature.fireSet.size) {
      for (const i of G.Nature.fireSet) {
        const f = S.fire[i]; if (f < 0.08) continue; const x = i % G.N, y = (i / G.N) | 0; if (Math.abs(x - x0) > R || Math.abs(y - y0) > R) continue;
        const top = G.Build3D ? G.Build3D.heightAt(i) : 0; const gY = W.maxH(x, y, 1, 1) * H + (top ? top * 0.75 : 0);
        for (let k = 0; k < 3 && n < MAXF; k++) {
          const px = (x + 0.25 + G.hash(i * 3 + k) * 0.5) * L, pz = (y + 0.25 + G.hash(i * 5 + k) * 0.5) * L; const fl = 0.75 + Math.sin(t * (7 + k) + i) * 0.18 + G.VR() * 0.12;
          const hgt = (1.2 + f * 2.6) * fl, wd = 0.7 + f * 1.2;
          M.a.makeScale(wd, hgt, wd); M.a.setPosition(px, gY, pz); flame.setMatrixAt(n, M.a);
          M.a.makeScale(wd * 0.5, hgt * 0.6, wd * 0.5); M.a.setPosition(px, gY, pz); glow.setMatrixAt(n, M.a); n++;
        }
        if (f > best) { best = f; bx = (x + 0.5) * L; by = gY + 2; bz = (y + 0.5) * L; }
      }
    }
    flame.count = glow.count = n; flame.instanceMatrix.needsUpdate = glow.instanceMatrix.needsUpdate = true; F3.fires = n;
    light.intensity = best > 0 ? 18 * best * (0.85 + G.VR() * 0.3) : 0; light.position.set(bx, by, bz);
    // ---- rain (or snow on the cold lands): round the eye, as much as the world's weather pours
    const cam = R3.camera(); const wr = S.weather ? S.weather.rain || 0 : 0;
    const cold = G.Biomes && G.Biomes.cold ? G.Biomes.cold(W.idx(G.clamp(focus.X / L, 0, G.N - 1), G.clamp(focus.Z / L, 0, G.N - 1))) : false;
    rain.material.opacity = G.clamp(wr * 1.4, 0, 0.75); rain.material.size = cold ? 0.16 : 0.08; rain.material.color.set(cold ? 0xf4f8ff : 0xc8d8e8);
    if (wr > 0.05) {
      const sp = cold ? 2.2 : 16; const cnt = Math.floor(NR * G.clamp(wr * 1.5, 0.1, 1));
      for (let k = 0; k < NR; k++) {
        let y = rainP[k * 3 + 1] - sp * rdt; if (cold) rainP[k * 3] += Math.sin(t + k) * rdt * 0.4;
        if (y < -2 || k >= cnt) { y = 26 + G.VR() * 6; rainP[k * 3] = (G.VR() - 0.5) * 60; rainP[k * 3 + 2] = (G.VR() - 0.5) * 60; if (k >= cnt) y = -50; }
        rainP[k * 3 + 1] = y;
      }
      rain.position.set(cam.position.x, cam.position.y - 12, cam.position.z); rain.geometry.attributes.position.needsUpdate = true;
      F3.drops = cnt;
    } else F3.drops = 0;
    // ---- ships: where the world has them, heading the way they move, rocking on the water
    let m = 0; const seen = new Set();
    for (const s of S.ships) {
      if (m >= MAXS) break; const X = s.x * L, Z = s.y * L; if (Math.abs(X - focus.X) > 260 || Math.abs(Z - focus.Z) > 260) continue;
      const D = SHIP[s.kind] || SHIP.pesca; seen.add(s.id);
      let v = svis.get(s.id); if (!v) { v = { X, Z, yaw: s.face > 0 ? 0 : Math.PI }; svis.set(s.id, v); }
      const dx = X - v.X, dz = Z - v.Z; if (Math.hypot(dx, dz) > 0.01 && Math.hypot(dx, dz) < 8) { const want = Math.atan2(dz, dx); let da = want - v.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; v.yaw += da * (1 - Math.exp(-2 * rdt)); }
      v.X = X; v.Z = Z;
      const wy = (s.st === 'build' ? W.hAt(s.x, s.y) : G.SEA) * H; const rock = Math.sin(t * 1.3 + s.id) * 0.05, bob = Math.sin(t * 0.9 + s.id) * 0.12;
      const sink = s.sink ? -2.5 : 0; const hp = s.maxHp ? G.clamp(s.hp / s.maxHp, 0, 1) : 1;
      const col = G.Fac.hex(s.fac); const wood = s.kind === 'guerra' ? '#5a3a24' : '#7a5232';
      // (the ship's frame: at its place, turned to its heading — the length along its own X — rolling on the swell)
      const put = (im, ox, oy, oz, sx, sy, sz, c) => { M.a.makeTranslation(X, wy - 0.4 + bob + sink, Z); M.b.makeRotationY(-v.yaw); M.a.multiply(M.b); M.b.makeRotationX(rock); M.a.multiply(M.b); M.b.makeTranslation(ox, oy, oz); M.a.multiply(M.b); M.b.makeScale(sx, sy, sz); M.a.multiply(M.b); im.setMatrixAt(m, M.a); im.setColorAt(m, M.c.set(c)); };
      put(hull, 0, 0, 0, D[0], 1.1, D[1], wood);
      put(deck, -D[0] * 0.25, 1.1, 0, D[0] * 0.25, D[0] > 6 ? 1.3 : 0.01, D[1] * 0.7, '#8a6a44');
      if (D[2] && s.mast !== 0) { put(mast, 0, 1.1, 0, 0.25, D[2], 0.25, '#4a3424'); put(sail, 0.1, 1.1 + D[2] * 0.3, 0, 0.08, D[2] * 0.6 * G.clamp((s.sail || 100) / 100, 0.2, 1), D[1] * 1.3, hp < 0.4 ? '#8a8478' : col); }
      else { mast.setMatrixAt(m, M.z); sail.setMatrixAt(m, M.z); }
      m++;
    }
    for (const id of svis.keys()) if (!seen.has(id)) svis.delete(id);
    for (const im of [hull, deck, mast, sail]) { im.count = m; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
    F3.ships = m;
  };
})(window.G);
