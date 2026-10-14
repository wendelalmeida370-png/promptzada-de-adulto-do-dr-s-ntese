'use strict';
// ============================================================
//  Cam3D: the eye behind the body. An orbit around a point at
//  the shoulders: turned by the mouse (left and right, up and
//  down, within limits), pulled in and out by the wheel, eased
//  so it never trembles, and gently swinging back behind the
//  body when it walks and the player leaves the mouse alone.
//  It never goes through what is solid — the ground, a house,
//  a wall: it slides in front of it at once, and drifts back
//  out slowly when the way is clear again. Below the sea it
//  does not go. It can be told to look at something (lock-on,
//  later: a duel, a conversation) and it can hand its pose to
//  the transitions, which fly from the god's eye to this one.
//  Only the view: nothing here touches the world.
// ============================================================
(function (G) {
  const W = G.W;
  const TAU = Math.PI * 2;
  const C3 = G.Cam3D = { yaw: 0, pitch: 0.26, dist: 4.8, cur: 4.8, fov: 58, lock: null, inside: false };
  // the player's choices (kept in this browser only)
  const OPT = C3.OPT = { sens: 1, invertY: false, follow: true, fov: 58, dist: 4.8, smooth: 1 };
  try { const o = JSON.parse(localStorage.getItem('gotaf-cam3d') || 'null'); if (o && typeof o === 'object') for (const k in OPT) if (k in o && typeof o[k] === typeof OPT[k]) OPT[k] = o[k]; } catch (e) { }
  C3.saveOpt = () => { try { localStorage.setItem('gotaf-cam3d', JSON.stringify(OPT)); } catch (e) { } };
  const PMIN = -1.05, PMAX = 1.2, DMIN = 1.4, DMAX = 11;
  let piv = null, lookT = -1e9, fovNow = 58, clock = 0;
  G.worldHooks.push(() => { piv = null; C3.lock = null; C3.inside = false; });

  C3.attach = function (pos, yaw) { C3.yaw = yaw; C3.pitch = 0.26; C3.dist = G.clamp(OPT.dist, DMIN, DMAX); C3.cur = C3.dist; piv = { X: pos.X, Y: pos.Y + 1.5, Z: pos.Z }; lookT = -1e9; fovNow = OPT.fov; };
  // the mouse turns it (pixels of movement)
  C3.look = function (dx, dy) {
    const k = 0.0028 * OPT.sens;
    C3.yaw += dx * k; C3.pitch = G.clamp(C3.pitch + dy * k * (OPT.invertY ? -1 : 1), PMIN, PMAX);
    lookT = clock;
  };
  C3.zoom = function (dy) { C3.dist = G.clamp(C3.dist * Math.exp(dy * 0.0012), DMIN, DMAX); OPT.dist = C3.dist; };
  // the look direction from yaw and pitch (pitch above 0 looks down)
  const fwd = (yaw, pitch) => [Math.cos(pitch) * Math.cos(yaw), -Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)];
  C3.fwd = () => fwd(C3.yaw, C3.pitch);

  // what stops the eye: the ground (and the water's face), the bodies of buildings, walls
  function solid(X, Y, Z) {
    const S = G.S; const L = G.Space.TILE, H = G.Space.HM; const x = X / L, y = Z / L;
    if (!W.inb(x, y)) return Y < G.SEA * H + 0.3;
    if (Y < W.hAt(x, y) * H + 0.3) return true;
    if (Y < G.Space.stoneTop(X, Z) + 0.2) return true; // (a boulder)
    const i = W.idx(x, y);
    if ((S.type[i] <= G.T.SEA || S.type[i] === G.T.RIVER) && !(S.dry && S.dry[i]) && Y < W.waterH(x, y) * H + 0.25) return true;
    // (a wall is its own stones, a gate has its passage: the shape the drawing puts there)
    if (S.wall[i] && S.wall[i] !== 3 && G.Build3D) return G.Build3D.wallSolid(X, Y, Z, 0.2);
    const top = G.Build3D ? G.Build3D.heightAt(i) : 0;
    if (top > 0 && Y < W.maxH(Math.floor(x), Math.floor(y), 1, 1) * H + top + 0.6) {
      const b = S.occ[i] && S.buildings.get(S.occ[i]);
      // (a house is a box a little inside its tile: the eye may stand in the street right next to it)
      if (b) { const m = 0.08; const lx = x - b.x, ly = y - b.y; if (lx < m || ly < m || lx > b.w - m || ly > b.h - m) return false; } // (the walls stand 0.35 m inside the lot)
      return true;
    }
    return false;
  }
  C3.solid = solid;
  // how far the eye can go from the pivot along a direction before something solid
  function reach(p, d, want) {
    const stepL = 0.2; let s = 0.3;
    for (; s <= want; s += stepL) if (solid(p.X - d[0] * s, p.Y - d[1] * s, p.Z - d[2] * s)) return Math.max(0.35, s - 0.3);
    return want;
  }
  // every frame: follow the body, keep clear of the world, place the camera
  C3.update = function (rdt, body, cam) {
    clock += rdt;
    const head = body.head !== undefined ? body.head : (body.h || 1.75) * 0.86;
    // (the world moved the body — a building rose where it stood, a scene, a load: the eye goes with it at once;
    // easing after it would fly through the houses on the way, and a pivot inside a house leaves the eye there — L-106)
    if (!piv || Math.hypot(body.X - piv.X, body.Z - piv.Z) > 2.5 || solid(piv.X, piv.Y, piv.Z)) piv = { X: body.X, Y: body.Y + head, Z: body.Z };
    // (the pivot follows quickly on the ground, more softly up and down: a jump does not jerk the view)
    const kxz = 1 - Math.exp(-16 * rdt / OPT.smooth), ky = 1 - Math.exp(-(body.ground ? 12 : 5) * rdt / OPT.smooth);
    piv.X += (body.X - piv.X) * kxz; piv.Z += (body.Z - piv.Z) * kxz; piv.Y += (body.Y + head - piv.Y) * ky;
    // a target held (lock-on, later): the eye turns to keep it in front
    if (C3.lock) { const t = C3.lock(); if (t) { const want = Math.atan2(t.Z - piv.Z, t.X - piv.X); let da = want - C3.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; C3.yaw += da * (1 - Math.exp(-5 * rdt)); } }
    // left alone, the eye swings back behind a body on the move (not when it walks toward the camera: that is the player's choice)
    else if (OPT.follow && clock - lookT > 1.8 && body.speed > 0.6) {
      let da = body.yaw - C3.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      if (Math.abs(da) < 2.3) C3.yaw += da * (1 - Math.exp(-0.9 * rdt * Math.min(1.5, body.speed / 2)));
      C3.pitch += (0.22 - C3.pitch) * (1 - Math.exp(-0.5 * rdt));
    }
    const d = fwd(C3.yaw, C3.pitch);
    const free = reach(piv, d, C3.dist);
    // (in at once when something is in the way; out again gently)
    C3.cur = free < C3.cur ? free : C3.cur + (free - C3.cur) * (1 - Math.exp(-2.6 * rdt));
    // over the right shoulder, a little (less when close)
    const rx = -Math.sin(C3.yaw), rz = Math.cos(C3.yaw); let sh = 0.32 * G.clamp(C3.cur / 4, 0.3, 1);
    const L = G.Space.TILE, H = G.Space.HM;
    const at = (dist, s) => {
      const P = { X: piv.X - d[0] * dist + rx * s, Y: piv.Y - d[1] * dist, Z: piv.Z - d[2] * dist + rz * s };
      // (never under the sea's face, never in the ground)
      const gx = P.X / L, gy = P.Z / L; if (W.inb(gx, gy)) { const g = Math.max(W.hAt(gx, gy) * H, W.waterH(gx, gy) * H) + 0.3; if (P.Y < g) P.Y = g; }
      return P;
    };
    let P = at(C3.cur, sh);
    // (the point itself must be clear too: the shoulder can lean into a wall the ray along the back did not meet,
    // and the ground under it can lift it into an eave — then closer, and straight behind)
    for (let k = 0; k < 8 && solid(P.X, P.Y, P.Z); k++) { sh *= 0.4; C3.cur = Math.max(0.25, C3.cur * 0.75); P = at(C3.cur, sh); }
    // (still inside — a wall a hand behind the head: the eye goes to the head itself for this frame; the pivot is always clear)
    if (solid(P.X, P.Y, P.Z)) { sh = 0; C3.cur = 0.05; P = at(C3.cur, 0); }
    C3.inside = solid(P.X, P.Y, P.Z);
    // the running body: the lens opens a little (a sense of speed)
    fovNow += (OPT.fov + (body.speed > 4 ? 5 : 0) - fovNow) * (1 - Math.exp(-3 * rdt));
    cam.fov = fovNow; cam.near = 0.12; cam.far = 1600; cam.updateProjectionMatrix();
    cam.position.set(P.X, P.Y, P.Z);
    cam.lookAt(piv.X + rx * sh, piv.Y, piv.Z + rz * sh);
    C3.last = { pos: [P.X, P.Y, P.Z], at: [piv.X + rx * sh, piv.Y, piv.Z + rz * sh], fov: fovNow };
  };
  // the pose the camera has right now (for the flight back up to the god)
  C3.pose = () => C3.last || null;
})(window.G);
