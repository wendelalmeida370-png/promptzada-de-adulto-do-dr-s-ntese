'use strict';
// ============================================================
//  Cam3D: the eye behind the body. An orbit around a point at
//  the shoulders: turned by the mouse (left and right, up and
//  down, within limits), pulled in and out by the wheel, eased
//  so it never trembles. It turns only when the player turns it
//  (20b, D-368): no swing behind the back that would make a body
//  walked sideways go round in circles, no pitch pulled back —
//  only, if the player wants it, a gentle swing behind a body
//  walked straight ahead with the mouse left alone.
//  It never goes through what is solid — the ground, a house,
//  a wall: it slides in front of it at once, by the exact
//  distance (a sweep of a few rays, refined, not steps of 20 cm),
//  and drifts back out slowly when the way is clear again. Below
//  the sea it does not go. Under a roof, the walls, ceilings and
//  roof of the body's own building are no wall to it — the fourth
//  wall: what of them stands between is cut, C3.cutBoxes —, and
//  the room can be seen from over its ceiling when the player asks
//  (the «Vista da sala»); the lens is never narrower than 50°
//  across, whatever the screen (the interiors 2.0, D-730 to D-736).
//  Over the right shoulder or the left;
//  wider at a sprint. It holds a target (lock-on: the eye keeps
//  it in front, and the body steps round it — lockOn/unlock) and
//  aims over the shoulder (aim) for the bow of the second wave,
//  and it hands its pose to the transitions, which fly from the
//  god's eye to this one. Only the view: nothing here touches
//  the world.
// ============================================================
(function (G) {
  const W = G.W;
  const TAU = Math.PI * 2;
  const C3 = G.Cam3D = { yaw: 0, pitch: 0.26, dist: 4.8, cur: 4.8, fov: 58, lock: null, inside: false };
  // the player's choices (kept in this browser only)
  // (follow: the gentle swing behind a body walked straight ahead; padSens the stick's look; side the shoulder, 1 the right)
  const OPT = C3.OPT = { sens: 1, invertY: false, follow: true, fov: 58, dist: 4.8, smooth: 1, padSens: 1, touchSens: 1, side: 1 };
  try { const o = JSON.parse(localStorage.getItem('gotaf-cam3d') || 'null'); if (o && typeof o === 'object') for (const k in OPT) if (k in o && typeof o[k] === typeof OPT[k]) OPT[k] = o[k]; } catch (e) { }
  C3.saveOpt = () => { try { localStorage.setItem('gotaf-cam3d', JSON.stringify(OPT)); } catch (e) { } };
  // (out to 16 m: before a monument's front of 20 m and more, and in an arena of 20, the eye stands back to see it — it was 11)
  const PMIN = -1.05, PMAX = 1.2, DMIN = 1.4, DMAX = 16;
  C3.DMAX = DMAX;
  let piv = null, lookT = -1e9, zoomT = -1e9, fovNow = 58, clock = 0, poCap = 2; // (poCap: the orbit's highest tilt under a ceiling, eased)
  // (the target held, the aim, the shoulder as it is now, the time the eye last came in, a turn asked of it — recentre)
  let lockGet = null, lockPt = null, aiming = false, aimK = 0, shNow = 0.32, inT = -1e9, turnAsk = null;
  let talkK = 0, talkPt = null, talkVeto = 0; // (22a wave 2, D-644: the conversation's framing — how far in, the other's face; a talk the player took the eye from)
  G.worldHooks.push(() => { piv = null; C3.lock = null; C3.inside = false; trauma = 0; attend = null; lockGet = null; lockPt = null; aiming = false; aimK = 0; turnAsk = null; talkK = 0; talkPt = null; talkVeto = 0; talkS = { id: 0, s: 1 }; });
  // a blow taken (D-333): the eye shakes — the more the bigger the blow, fading in half a second — and, if what struck is out of
  // the picture and the mouse is left alone, it turns a while to bring it in beside the body. Only the eye: by the view's own
  // clock, no chance drawn (OPT.shake turns the shaking off)
  let trauma = 0, attend = null;
  OPT.shake = OPT.shake === undefined ? 1 : OPT.shake;
  C3.shake = function (k, src) {
    trauma = Math.min(1, Math.max(trauma, 0) + (k || 0.5));
    if (src && Number.isFinite(src.X)) attend = { X: src.X, Z: src.Z, t: 1.1 };
  };
  C3.trauma = () => trauma; // (for the proofs)

  C3.attach = function (pos, yaw) { C3.yaw = yaw; C3.pitch = 0.26; C3.dist = G.clamp(OPT.dist, DMIN, DMAX); C3.cur = C3.dist; piv = { X: pos.X, Y: pos.Y + 1.5, Z: pos.Z }; lookT = -1e9; fovNow = OPT.fov; lockGet = null; lockPt = null; C3.lock = null; aiming = false; aimK = 0; turnAsk = null; shNow = 0.32 * (OPT.side < 0 ? -1 : 1); freshIn(); };
  // the mouse turns it (pixels of movement) — not while a target is held: the eye keeps it in front
  C3.look = function (dx, dy) {
    lookT = clock; if (lockPt) { flick += dx; return; } // (held: the mouse's sideways push is kept for the fight's change of target — 20f, C3.flick)
    const k = 0.0028 * OPT.sens * (aiming ? 0.6 : 1); // (aiming, finer)
    C3.yaw += dx * k; C3.pitch = G.clamp(C3.pitch + dy * k * (OPT.invertY ? -1 : 1), PMIN, PMAX); turnAsk = null;
  };
  // the stick turns it (each axis -1 to 1 after its dead zone and curve; the frame's seconds): radians a second
  C3.lookPad = function (x, y, rdt) {
    if (!x && !y) return; lookT = clock; if (lockPt) { flick += x * 900 * rdt; return; }
    const k = 3.3 * OPT.padSens * (aiming ? 0.55 : 1) * rdt;
    C3.yaw += x * k; C3.pitch = G.clamp(C3.pitch + y * k * 0.62 * (OPT.invertY ? -1 : 1), PMIN, PMAX); turnAsk = null;
  };
  C3.zoom = function (dy) { C3.dist = G.clamp(C3.dist * Math.exp(dy * 0.0012), DMIN, DMAX); OPT.dist = C3.dist; zoomT = clock; };
  // the other shoulder (the eye goes over to it in a moment)
  C3.swap = function () { OPT.side = OPT.side < 0 ? 1 : -1; C3.saveOpt(); return OPT.side; };
  // back behind the body, quickly (the lock-on's key with nothing to hold, as in a game of swords)
  C3.recenter = function (yaw) { if (Number.isFinite(yaw)) turnAsk = yaw; };
  // a target held (lock-on, D-369): a person or a beast of the world (the eye follows it as the world has it; it is let go when
  // it is gone, dead, indoors or too far), a point { X, Y, Z } in metres, or a function giving one (or null: let go). The body
  // strafes round it (the controller is told by Modes: Avatar.input.lock); unlock lets it go
  C3.LOCK_FAR = 26; // (metres: past this from the body, a target held is let go)
  C3.lockOn = function (t) {
    const L = G.Space.TILE; let get = null;
    if (typeof t === 'function') get = t;
    else if (t && Number.isFinite(t.X) && Number.isFinite(t.Z)) { const p = { X: t.X, Y: Number.isFinite(t.Y) ? t.Y : G.Space.groundY(t.X, t.Z) + 1.2, Z: t.Z }; get = () => p; }
    else if (t && t.id && Number.isFinite(t.x)) {
      const id = t.id, beast = !!(G.S.animals && G.S.animals.get(id) === t);
      get = () => { const o = beast ? G.S.animals.get(id) : G.S.villagers.get(id); if (!o || o.dead || o.hp <= 0 || (o.inside && o.inside !== ((G.Possess && G.Possess.body()) || {}).inside) || o.aboard || o.ug || o.held) return null; // (indoors only in the body's own building: a fight in the tavern)
        const s = beast ? 0.7 : (G.People3D && G.People3D.look ? G.People3D.look(o).s : 1) * 1.15; const X = o.x * L, Z = o.y * L;
        return { X, Y: (o.inside && G.Avatar && G.Avatar.floorAt ? G.Avatar.floorAt(X, Z) : G.W.groundH(o.x, o.y) * G.Space.HM) + s, Z, id, beast }; }; // (one indoors over the floor of its storey)
    }
    if (!get) return false;
    const p = get(); if (!p) return false;
    lockGet = get; lockPt = p; C3.lock = () => lockPt; return true;
  };
  C3.unlock = function () { lockGet = null; lockPt = null; C3.lock = null; flick = 0; };
  // (the sideways push of the mouse or the right stick while a target is held, in the mouse's pixels, since the last asking — the
  // fight's change of target, 20f; read, it starts again from nothing)
  let flick = 0; C3.flick = () => { const f = flick; flick = 0; return f; };
  C3.locked = () => lockPt; // (the target held now, as this frame has it: { X, Y, Z, id? }, or null)
  // the aim over the shoulder (the bow of the second wave): closer, over the shoulder, a narrower lens; the body faces where the
  // eye looks. aimRay: the ray through the middle of the picture, where the reticle is
  C3.aim = function (on) { aiming = !!on; return aiming; };
  // the conversation (22a wave 2, D-644; SOCIEDADE §3.9): someone talking with the body, the body standing, the player's hands off
  // the eye — it comes in to the faces, a little over a metre off, the lens narrower, the look between the two; it never turns (the
  // yaw and the tilt stay the player's: the rule of D-368) and gives the eye back as soon as the body moves, the player looks or
  // zooms, or the talk ends. Only seen: it reads who talks with whom in the world, writes nothing of it
  C3.TALK_NEAR = 3.5; // (metres: the other this near the body)
  C3.talking = () => (talkK > 0.05 ? talkPt : null); // (the other's face while the eye is in for a talk, for the tests and the screen)
  // (who talks with the body: a word answered — the line of the hands' «talk», the society's verbs' «resposta» — never the hug's
  // arms nor a dance round it; the height of their face read once a talker, from the 3D's portrait of them)
  let talkS = { id: 0, s: 1 };
  function talkOf(body) {
    const S = G.S, av = S && S.avatar, id = av && (av.id || av.vid); if (!id || !S.villagers) return null; const L = G.Space.TILE;
    let best = null, bd = C3.TALK_NEAR;
    for (const o of S.villagers.values()) { const t = o.task; if (!t || t.kind !== 'talk' || t.id !== id || o.inside || o.aboard) continue;
      const X = o.x * L, Z = o.y * L, d = Math.hypot(X - body.X, Z - body.Z); if (d < bd) { bd = d; best = o; } }
    if (!best) return null; if (talkS.id !== best.id) talkS = { id: best.id, s: G.People3D && G.People3D.look ? G.People3D.look(best).s : 1 };
    return { X: best.x * L, Y: G.W.groundH(best.x, best.y) * G.Space.HM + 1.6 * talkS.s, Z: best.y * L, id: best.id };
  }
  C3.aiming = () => aiming;
  // (where the aim's ray meets what is drawn — the first point of it that is solid and not cut away (a wall the fourth wall takes
  // away is no target: what the reticle shows is past it), or the ground —, within d metres: { X, Y, Z, d } or null)
  C3.aimHit = function (d) {
    const r = C3.aimRay(); if (!r) return null; const L = G.Space.TILE;
    for (let s = 0.15; s <= (d || 80); s += 0.1) { const X = r.from[0] + r.dir[0] * s, Y = r.from[1] + r.dir[1] * s, Z = r.from[2] + r.dir[2] * s;
      if (!W.inb(X / L, Z / L)) return null; if ((solid(X, Y, Z, true) && !C3.inCut(X, Y, Z)) || Y <= G.Space.groundY(X, Z)) return { X, Y, Z, d: s }; }
    return null;
  };
  C3.aimRay = function () { const l = C3.last; if (!l) return null; const d = [l.at[0] - l.pos[0], l.at[1] - l.pos[1], l.at[2] - l.pos[2]]; const n = Math.hypot(d[0], d[1], d[2]) || 1; return { from: l.pos.slice(), dir: [d[0] / n, d[1] / n, d[2] / n] }; };
  // the look direction from yaw and pitch (pitch above 0 looks down)
  const fwd = (yaw, pitch) => [Math.cos(pitch) * Math.cos(yaw), -Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)];
  C3.fwd = () => fwd(C3.yaw, C3.pitch);

  // (the building the body is in. Not while the body is in an outer door's opening or a stride from it, its back to the street: it
  // is coming in or going out, and the building stays a building to the eye — L-179)
  const byOuterDoor = (inn, body) => { const p = inn.p, b = inn.b, L = G.Space.TILE;
    for (const h of p.holes) { const d = h.door >= 0 ? p.doors[h.door] : null; if (!d || !d.outer || h.kind === 'janela') continue; const w = p.walls[h.wall]; if (!w) continue;
      const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const X = b.x * L + w.a[0] + (w.b[0] - w.a[0]) * h.at / len, Z = b.y * L + w.a[1] + (w.b[1] - w.a[1]) * h.at / len;
      if (Math.hypot(body.X - X, body.Z - Z) < Math.max(0.7, h.w / 2 + 0.2)) return true; }
    return false; };
  // ------------------------------ the fourth wall (the interiors 2.0, D-655, D-730) ------------------------------
  // With the body under the roof of a building — its shell, an annex —, the eye keeps to the room's own volume (D-738): under its
  // ceiling — the slab of the storey over it, or the roof's underside where the room goes up to it — by C3.CEIL_GAP, and past its
  // walls by no more than C3.BEYOND (the thickness of the wall between it and the body, and a hand); over its storey's floor. The
  // wall it backs into is not drawn: the cut (C3.cutBoxes — the boxes the town's material, and the inside's, give way in:
  // Build3D.insideTick puts them first in its list), up to a little over the eye — the far walls and the ceiling drawn whole, the
  // outside seen only by the windows and the doors. Out over the roof, the sky, the sea and the hill's town stood over the far wall
  // and the room was a box seen from above (the owner's phone, an Egyptian tavern); shut in the room before the fourth wall, the eye
  // stood a hand from the back wall, the head half the picture (the agent D: a median of 0,88 m from the shoulder in a tavern's hall).
  // The ceiling a little over the body lowers the eye's tilt instead of bringing it in (the orbit's tilt under the ceiling, eased);
  // the player's tilt down is the look's, from where the eye is. The other buildings stop it — their rooms too —, the ground, the water.
  // · the yard is open sky: a body in it has the eye of out of doors, and the building is a building to it (L-1860);
  // · a storey under the ground — a cellar — keeps the room of before: the eye in its rooms, under the earth (its walls are earth);
  // · the building just left stays open to the eye while the eye is still through it (the line from the body to the eye crosses
  //   its lot): the eye comes out with the body, never thrown in to a wall in one frame.
  let room = null, eb = null, kept = null;
  // (the room of before, for a cellar: the building's own body as the feet have it — the shell, an annex, the yard on their storey:
  // Space.inBody, the one rule. The yard left out, the whole yard of a tavern or a pottery was wall to the eye, L-1860)
  function outRoom(X, Z) {
    const b = room.b, L = G.Space.TILE;
    return !G.Space.inBody(room.p.shell, room.lv || 0, X - b.x * L, Z - b.y * L);
  }
  // (a point of the lot under the roof: the shell, or an annex of the storey — not the yard)
  function roofed(p, lv, x, z) {
    const sh = p.shell; if (sh.kind === 'round' ? Math.hypot(x - sh.cx, z - sh.cz) < sh.r : x > sh.r[0] && x < sh.r[2] && z > sh.r[1] && z < sh.r[3]) return true;
    return (sh.annex || []).some(a => (a.lv || 0) === (lv || 0) && x > a.r[0] && x < a.r[2] && z > a.r[1] && z < a.r[3]);
  }
  C3.EYE_FLOOR = 0.3; // (metres: the eye keeps over the floor of the body's storey, all over its building's lot)
  // (the building open to the eye, with what the cut needs of it: its storey's floor and ceiling in the world's metres, the room the
  // body is in — the plan's —, the lot)
  function openTo(inn, body, was) {
    const b = inn.b, p = inn.p, L = G.Space.TILE; const l = p.levels.find(q => q.lv === inn.lv) || p.levels[0] || { y: 0, h: 2.6 };
    const y0 = G.Space.plinth(b).y0; const x = body.X - b.x * L, z = body.Z - b.y * L;
    const rm = p.rooms.find(m => m.lv === inn.lv && !m.open && x >= m.r[0] - 0.05 && x <= m.r[2] + 0.05 && z >= m.r[1] - 0.05 && z <= m.r[3] + 0.05);
    // (the floor: the storey's — or where the feet are, if lower: on the steps up through a podium inside the walls, the body stood
    // over a metre under its storey's floor, and the whole lot was floor over its head — the temple#5087 of the metropole)
    // (the ceiling: the storey's height, or the slab of the storey over it, or — the top one — under the roof's lowest band, as the
    // eye's own solid has it (planSolid: the roof from a hand under its underside): in the paço#7815 the roof hung 0,8 m under the
    // throne room's height, and over the room it was a lid the cut left)
    const up = p.levels.filter(q => q.y > l.y + 0.05).sort((a, c) => a.y - c.y)[0]; let top = l.y + (l.h || 2.6);
    if (up) top = Math.min(top, up.y - (up.slab || 0.2) - 0.02); else if (p.shell.kind !== 'aberta' && p.shell.eave > 0) top = Math.min(top, p.shell.eave - 0.6);
    // (the room's box the eye keeps to — the plan's room the body is in, else inside the shell's walls —, and the ceiling of the slab
    // over the storey, where there is one: as the eye's own solid has it, planSolid)
    const sh = p.shell; const t = sh.t || 0.3; const box = rm ? rm.r : (was && was.b === b && was.rm) ? was.rm : sh.kind === 'round' ? [sh.cx - sh.r + t, sh.cz - sh.r + t, sh.cx + sh.r - t, sh.cz + sh.r - t] : sh.r ? [sh.r[0] + t, sh.r[1] + t, sh.r[2] - t, sh.r[3] - t] : [0, 0, b.w * L, b.h * L];
    // (and over the hatch of that slab — the hole a flight comes up through; an open height keeps the slab's, its gallery round it —, the storey over it: its own slab
    // over, or its height — the body on the flight had its head over the slab, and the eye was inside its own pivot)
    const up2 = up && p.levels.filter(q => q.y > up.y + 0.05).sort((a, c) => a.y - c.y)[0];
    return { b, p, lv: inn.lv, y0, fy: Math.min(y0 + l.y, body.Y), fc: y0 + Math.max(l.y + 1.9, top), ceilUp: up ? y0 + up.y - (up.slab || 0.2) - 0.02 : null, lyMin: y0 + l.y + 1.9,
      upLv: up ? up.lv : null, upTop: up ? (up2 ? y0 + up2.y - (up2.slab || 0.2) - 0.02 : null) : null, upMin: up ? y0 + up.y + 1.9 : null,
      rm: rm ? rm.r : (was && was.b === b ? was.rm : null), box, X0: b.x * L, Z0: b.y * L, X1: (b.x + b.w) * L, Z1: (b.y + b.h) * L };
  }
  // (does the line from the body to the eye cross a building's lot — the eye still through it)
  function through(o, A, P) {
    let t0 = 0, t1 = 1; const d = [P[0] - A.X, P[2] - A.Z]; const lo = [o.X0 - 0.3, o.Z0 - 0.3], hi = [o.X1 + 0.3, o.Z1 + 0.3], a = [A.X, A.Z];
    for (let k = 0; k < 2; k++) { if (Math.abs(d[k]) < 1e-9) { if (a[k] < lo[k] || a[k] > hi[k]) return false; continue; }
      let u = (lo[k] - a[k]) / d[k], v = (hi[k] - a[k]) / d[k]; if (u > v) { const w = u; u = v; v = w; } t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) return false; }
    return true;
  }
  C3.CEIL_GAP = 0.2; C3.BEYOND = 0.65; // (metres: the eye a hand under the ceiling; past the room's walls no further than this)
  // (the ceiling over a point of the open building, world metres: the slab of the storey over it; the top storey's, the roof's
  // underside — the band the eye's solid has under the roof (planSolid) —; out of the shell, the shell's edge's nearest — the eaves:
  // the storey's lowest there dropped the eye backing out past a wall by a metre in a frame)
  function ceilAt(o, X, Z, noHole) {
    const p = o.p, sh = p.shell; let x = X - o.X0, z = Z - o.Z0;
    if (sh.kind === 'round') { const dx = x - sh.cx, dz = z - sh.cz, d = Math.hypot(dx, dz), m = sh.r - 0.01; if (d > m) { x = sh.cx + dx * m / d; z = sh.cz + dz * m / d; } }
    else if (sh.r) { x = G.clamp(x, sh.r[0] + 0.01, sh.r[2] - 0.01); z = G.clamp(z, sh.r[1] + 0.01, sh.r[3] - 0.01); }
    if (o.ceilUp !== null) { const c = G.Space.cellIn(p, o.upLv, x, z), C = G.Interiors.CELL;
      if (noHole || c !== C.HATCH) return Math.max(o.lyMin, o.ceilUp); // (an open height under a gallery: the eye over the gallery's floor had its slab between it and the body, L-1872)
      return Math.max(o.upMin, o.upTop !== null ? o.upTop : o.y0 + roofIn(p, x, z) - 0.3); } // (over the slab's hole)
    return Math.max(o.fc, o.y0 + roofIn(p, x, z) - 0.3);
  }
  // (a point under the shell's roof or its eaves — m past its walls —, not over the yard: the open sky)
  function underRoof(o, X, Z, m) { const sh = o.p.shell, x = X - o.X0, z = Z - o.Z0; return sh.kind === 'round' ? Math.hypot(x - sh.cx, z - sh.cz) < sh.r + m : !!sh.r && x > sh.r[0] - m && x < sh.r[2] + m && z > sh.r[1] - m && z < sh.r[3] + m; }
  // (how far a point stands out of the room's box, along the ground, metres)
  const outOfBox = (o, X, Z) => { const r = o.box, x = X - o.X0, z = Z - o.Z0; return Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3])); };
  // (the room's volume to the eye: over the floor of its storey (all over the lot), under its ceiling, never further out of its walls
  // than C3.BEYOND — the building just left, only under its ceiling: the eye comes out with the body. allowH, allowV: what a body
  // come into a room gives the eye that was out of it, shrinking — it glides in, never thrown in a frame)
  let allowH = 0, allowV = 0, boxKey = '';
  function openSolid(X, Y, Z) {
    const o = eb, S = G.S, L = G.Space.TILE; const x = X / L, y = Z / L; const lot = W.inb(x, y) && S.occ[W.idx(x, y)] === o.b.id;
    if (o !== kept) { if (outOfBox(o, X, Z) > C3.BEYOND + allowH) return true; if (Y > ceilAt(o, X, Z) - C3.CEIL_GAP + allowV) return true; }
    else if (lot && underRoof(o, X, Z, 0.5) && Y > ceilAt(o, X, Z) - C3.CEIL_GAP + allowV) return true; // (the building just left: its ceiling only under its roof — over its yard, the sky: the eye was brought in 0,6 m in a frame there)
    if (!lot) return null;
    return Y < o.fy + C3.EYE_FLOOR;
  }
  // (for the proofs and the verifier: the eye's highest at a point — the ceiling less the gap, and what is left of a glide in —, or
  // null with no building open to it)
  C3.ceilAt = (X, Z) => (eb ? ceilAt(eb, X, Z) - C3.CEIL_GAP + allowV : null);
  C3.roomBox = () => (eb ? { box: eb.box, X0: eb.X0, Z0: eb.Z0, out: (X, Z) => outOfBox(eb, X, Z), allow: allowH, glide: allowV, kept: eb === kept } : null);
  // what stops the eye: the ground (and the water's face), the bodies of buildings, walls — and, with the body indoors, only the
  // floor of its storey there (the fourth wall), or, in a cellar, the outside of its rooms. all: nothing open to the eye — what is
  // drawn before the cut (C3.solidAll: who is seen through a wall, the proofs of the eye)
  function solid(X, Y, Z, all) {
    if (!all && eb) { const r = openSolid(X, Y, Z); if (r !== null) return r; }
    if (room && outRoom(X, Z)) return true;
    const S = G.S; const L = G.Space.TILE, H = G.Space.HM; const x = X / L, y = Z / L;
    if (!W.inb(x, y)) return Y < G.SEA * H + 0.3;
    if (Y < W.hAt(x, y) * H + 0.3) return true;
    if (Y < G.Space.stoneTop(X, Z) + 0.2) return true; // (a boulder)
    const i = W.idx(x, y);
    if ((S.type[i] <= G.T.SEA || S.type[i] === G.T.RIVER) && !(S.dry && S.dry[i]) && Y < W.waterH(x, y) * H + 0.25) return true;
    // (a wall is its own stones, a gate has its passage: the shape the drawing puts there)
    if (S.wall[i] && S.wall[i] !== 3 && G.Build3D) return G.Build3D.wallSolid(X, Y, Z, 0.2);
    // (a building whose plan is made: its walls, floors, roof and shut doors as the plan has them — the eye comes in by an
    // open door and stands in its rooms)
    { const b = S.occ[i] && S.buildings.get(S.occ[i]); const r = b ? planSolid(b, X, Y, Z) : null; if (r !== null) return r; }
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
  C3.solidAll = (X, Y, Z) => solid(X, Y, Z, true);
  // (the building open to the eye now — { b, lv, kept: the one just left, fy, fc: its storey's floor and ceiling } — or null)
  C3.open = () => (eb ? { b: eb.b, lv: eb.lv, kept: eb === kept, fy: eb.fy, fc: eb.fc } : null);
  // a point in a building with a plan made: null (no plan: the old box), else solid or not — in the walls, a piece of
  // furniture, a shut door, a storey's slab, the roof, under a floor (the rows of seats on it too), over the ground inside a
  // cellar, in the stone of its form where the plan has no room; free in its rooms, its open doors, the hall's height where no
  // storey is, the sky over its roof — over an open ground, the sky
  function planSolid(b, X, Y, Z) {
    const Sp = G.Space; const p = Sp.planMade ? Sp.planMade(b) : null; if (!p || !p.ok || !p.grid) return null;
    const L = Sp.TILE, x = X - b.x * L, z = Z - b.y * L, y = Y - Sp.plinth(b).y0; const sh = p.shell;
    // (the stone of a building drawn by its form where the plan has no room — the rows of a cávea, the drum, the substructure:
    // the plan of a monument lays only what is walked in it (D-093), and the eye went through the rows of the Colosseum)
    const stone = () => !!(G.Build3D && G.Build3D.stoneAt && G.Build3D.stoneAt(b, X, Y, Z));
    const inShell = sh.kind === 'round' ? Math.hypot(x - sh.cx, z - sh.cz) < sh.r : x > sh.r[0] && x < sh.r[2] && z > sh.r[1] && z < sh.r[3];
    const annex = !inShell && (sh.annex || []).find(a => x > a.r[0] && x < a.r[2] && z > a.r[1] && z < a.r[3]);
    if (!inShell && !annex) return stone(); // (the yard, the street: open — but for the form's stone there)
    // (another building's rooms, while the body is in one: closed — the eye stops at its walls; only the body's own is open to it)
    if (eb && b !== eb.b) return annex ? y < (annex.h || 2.2) + 0.6 : y < roofIn(p, x, z) + 0.7;
    if (annex) return y > (annex.h || 2.2) - 0.05 && y < (annex.h || 2.2) + 0.6; // (an annex's room under its lean-to)
    const lv = p.levels.slice().sort((a, c) => a.y - c.y); let l = null; for (const q of lv) if (y >= q.y - 0.02) l = q;
    const C = G.Interiors.CELL;
    // (the hole a flight comes up through, in a storey's floor — its hatch, an open height —: where the head of one climbing it
    // passes, and the eye with it — L-180; a flight that goes up from a storey stands on its floor)
    const hole = q => { const hc = Sp.cellIn(p, q.lv, x, z); return hc === C.HATCH || hc === C.VOID; };
    const fy = l ? l.y + (G.Interiors.hAt ? G.Interiors.hAt(p, l.lv, x, z) : 0) : 0; // (on the rows of seats, their top)
    if (!l || (y < fy + 0.06 && !(l !== lv[0] && hole(l)))) return true; // (in a floor, under the lowest)
    // (over a cellar's ground the earth: the eye stays under it)
    if (l.y < 0 && y < 0 && Y > W.hAt(X / L, Z / L) * G.Space.HM - 0.05) return true;
    const up = lv.find(q => q.y > l.y + 0.05);
    const roofed = sh.kind !== 'aberta'; // (an open ground has no roof to keep under: the sky — it had a band of roof at its eave, 0)
    // (over the storey's rooms: a storey above — its slab, but for its hole —, or the roof)
    if (y > l.y + l.h + 0.02) { if (up && y > up.y - (up.slab || 0.2) - 0.02) return !hole(up); if (!up) { if (!roofed) return stone(); const r = roofIn(p, x, z); return y > r - 0.3 && y < r + 0.7; } }
    const c = Sp.cellIn(p, l.lv, x, z);
    if (c === C.WALL) { const t = wallTop(p, l.lv, x, z); return !t || y < l.y + t + 0.1; } // (to its own top: a parapet of 0.9 m is no wall of the storey's height)
    if (c === C.SOLID) return y < l.y + 1.0;
    if (c === C.LOW) return y < l.y + 0.5;
    if (c === C.DOOR) { const e = Sp.planEntry && Sp.planEntry(b.id); const n = p.grid.n, cs = p.grid.cs; const a = e && e.doors && e.doors[l.lv]; const k = a ? a[Math.floor(z / cs) * n + Math.floor(x / cs)] : 0;
      return k > 0 && !(G.Interiors.doorState(b, k - 1) && G.Interiors.doorState(b, k - 1).state === 'aberta') && y < l.y + 2.1; }
    if (!up && roofed) { const r = roofIn(p, x, z); if (y > r - 0.3) return y < r + 0.7; }
    if (c === C.OUT || c === C.VOID) return stone();
    return false;
  }
  // (the top of the walls of a storey on its cells, over its floor — 0 where none of its walls is: the plan's walls laid on its
  // grid, once a plan; a cell a wall marks gets its height, the parapet's 0.9 m, the storey's wall its own)
  const tops = new WeakMap();
  function wallTop(p, lv, x, z) {
    let m = tops.get(p); if (!m) tops.set(p, m = {});
    let g = m[lv]; const n = p.grid.n, cs = p.grid.cs;
    if (!g) { g = m[lv] = new Float32Array(n * n);
      for (const w of p.walls) { if (w.lv !== lv || !(w.h > 0)) continue; const dx = w.b[0] - w.a[0], dz = w.b[1] - w.a[1]; const k1 = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (cs / 2))); const r = (w.t || 0.2) / 2 + cs;
        for (let k = 0; k <= k1; k++) { const px = w.a[0] + dx * k / k1, pz = w.a[1] + dz * k / k1;
          for (let cz = Math.max(0, Math.floor((pz - r) / cs)); cz <= Math.min(n - 1, Math.floor((pz + r) / cs)); cz++) for (let cx = Math.max(0, Math.floor((px - r) / cs)); cx <= Math.min(n - 1, Math.floor((px + r) / cs)); cx++) { const i = cz * n + cx; if (w.h > g[i]) g[i] = w.h; } } } }
    const cx = Math.floor(x / cs), cz = Math.floor(z / cs); return cx < 0 || cz < 0 || cx >= n || cz >= n ? 0 : g[cz * n + cx];
  }
  // (the roof's underside over a point of a plan — Interiors' roofY in the lot's frame, a hand under the outside's slopes)
  function roofIn(p, x, z) {
    const sh = p.shell, R = sh.roof || {}; if (!R.h || R.kind === 'plano') return sh.eave;
    if (sh.kind === 'round') return sh.eave + R.h * Math.max(0, 1 - Math.hypot(x - sh.cx, z - sh.cz) / sh.r) - 0.25;
    const O = sh.r; const az = R.along === 'z'; const um = az ? (O[1] + O[3]) / 2 : (O[0] + O[2]) / 2, vm = az ? (O[0] + O[2]) / 2 : (O[1] + O[3]) / 2, hu = az ? (O[3] - O[1]) / 2 : (O[2] - O[0]) / 2, hv = az ? (O[2] - O[0]) / 2 : (O[3] - O[1]) / 2;
    const u = az ? z : x, v = az ? x : z; const across = Math.abs(v - vm) / hv, end = R.kind === 'quatro-aguas' ? (Math.abs(u - um) - (hu - hv)) / hv : -1;
    return Math.max(sh.eave, sh.eave + R.h * (1 - Math.max(across, end)) - 0.25);
  }
  // how far the eye can go from a point along a direction before something solid: marched in steps of 25 cm and, at the first
  // solid one, refined between it and the last clear one to a few millimetres — the distance is the world's, not a step's (L-1140)
  function cast(X, Y, Z, d, want, ox, oy, oz) {
    const st = 0.25; let s = 0.12, last = 0;
    const hit = q => solid(X + ox - d[0] * q, Y + oy - d[1] * q, Z + oz - d[2] * q);
    for (; ; s += st) {
      const q = Math.min(s, want);
      if (hit(q)) { let lo = last, hi = q; for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2; if (hit(m)) hi = m; else lo = m; } return lo; }
      last = q; if (q >= want) return want;
    }
  }
  // the eye's sweep: the boom and four rays round it, a hand to each side and up and down — a sphere of the eye's size, as the
  // games of a camera behind the shoulder sweep it —, the nearest of them less a margin
  const PROBE = [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.11], [0, -0.11]];
  function reach(p, d, want) {
    const rx = -Math.sin(C3.yaw), rz = Math.cos(C3.yaw); let m = want;
    for (const [a, u] of PROBE) { const r = cast(p.X, p.Y, p.Z, d, m + 0.2, rx * a, u, rz * a); if (r - 0.2 < m) m = r - 0.2; if (m <= 0.35) return 0.35; }
    return Math.max(0.35, Math.min(want, m));
  }
  C3.reach = (p, d, want) => reach(p, d, want); // (for the proofs: the free length along a direction)
  // (the shoulder's own way out from the pivot, sideways: never into a wall beside the head)
  function sideFree(p, s) {
    if (!s) return 0; const rx = -Math.sin(C3.yaw), rz = Math.cos(C3.yaw); const sg = Math.sign(s); const d = [-rx * sg, 0, -rz * sg];
    return sg * Math.max(0, Math.min(Math.abs(s), cast(p.X, p.Y, p.Z, d, Math.abs(s) + 0.15, 0, 0, 0) - 0.15));
  }
  // ------------------------------ the lens, the «Vista da sala», the cut, the weave ------------------------------
  C3.SIDE_FOV = 50; C3.FOV_MAX = 100; C3.IN_FOV = 10; // (degrees: the least across, the most up and down, the more under a roof)
  C3.IN_DIST = 3.4; // (metres: under a roof the eye no farther than this from the shoulder — the player's nearer, kept)
  let inK = 0;
  // the «Vista da sala» (D-655, D-731, D-739): asked by the player — the action 'vista', its key and its button —, the eye goes to a
  // corner of the room, a hand under its ceiling — the free corner that sees the most of the room's floor (the plan's, with what stands
  // on it), the farther from the body of two that see as much —, and looks at the room's middle with the lens as wide as the room's
  // four corners need (up to C3.FOV_MAX); asked again, back to the shoulder. Never over the ceiling, never by itself, only under a roof
  // (out of it, it ends); it writes neither the yaw nor the player's tilt (the rule 124). Over the roof, the room was a box seen from
  // above with the sky, the sea and the town over its far wall
  C3.VISTA = { inset: 0.35, k: 3.5 };
  let vistaOn = false, vistaK = 0, vistaMemo = null;
  C3.vista = function (on) { vistaOn = on === undefined ? !vistaOn : !!on; if (vistaOn && !(eb && eb !== kept)) vistaOn = false;
    if (vistaOn) { vistaMemo = null; const q = C3.last ? C3.last.body : null; if (q && vistaPoseOf(eb, { X: q[0], Z: q[2] }).none) vistaOn = false; } return vistaOn; }; // (a room with no free corner: none)
  C3.vistaOn = () => vistaOn; C3.vistaK = () => vistaK; C3.vistaPose = () => vistaMemo; // (for the proofs: { E, A, fov, seen } of the corner)
  C3.under = () => !!(eb && eb !== kept); // (the body under a roof the eye is open to: the screen by the place, the vista's button)
  let aspNow = 16 / 9; // (the screen's proportion, as the last frame had it)
  // (the corner of the vista, for the room the body is in: of the room's four, a hand in from its walls, a hand under its ceiling, the
  // one whose line to the most of the room's floor — points 0,4 m apart, a hand over it — crosses nothing drawn; the look at the
  // room's middle; the lens up and down as wide as the three far corners of its floor need, across as the screen is)
  const clear = (E, T) => { const d = [T[0] - E[0], T[1] - E[1], T[2] - E[2]]; const n = Math.hypot(d[0], d[1], d[2]); for (let s = 0.15; s < n - 0.25; s += 0.2) if (solid(E[0] + d[0] * s / n, E[1] + d[1] * s / n, E[2] + d[2] * s / n, true)) return false; return true; };
  function vistaPoseOf(o, body) {
    const r = o.box; const key = o.b.id + ':' + o.lv + ':' + r.join(',') + ':' + aspNow.toFixed(2);
    if (vistaMemo && vistaMemo.key === key) return vistaMemo;
    let best = null; const sx = Math.max(0.4, (r[2] - r[0]) / 9), sz = Math.max(0.4, (r[3] - r[1]) / 9);
    // (the doors of the storey, along their openings — a corner by one has its leaf in the picture: the solid of the plan has an open
    // door free, and the leaf swung into the corner of the Egyptian tavern filled half the picture)
    const dp = []; for (const d of o.p.doors) { const w = o.p.walls[d.wall]; if (!w || (w.lv || 0) !== (o.lv || 0)) continue; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
      for (const t of [d.at - d.w / 2, d.at, d.at + d.w / 2, d.at + d.w]) { const u = G.clamp(t, 0, L) / L; dp.push([w.a[0] + (w.b[0] - w.a[0]) * u, w.a[1] + (w.b[1] - w.a[1]) * u]); } }
    for (const [i, j] of [[0, 1], [2, 1], [0, 3], [2, 3]]) for (const IN of [C3.VISTA.inset, 2 * C3.VISTA.inset]) {
      const X = o.X0 + r[i] + (i === 0 ? IN : -IN), Z = o.Z0 + r[j] + (j === 1 ? IN : -IN); const E = [X, ceilAt(o, X, Z, true) - C3.CEIL_GAP - 0.05, Z]; // (under its storey's own ceiling: over an open height, the way there crossed the slab)
      if (solid(E[0], E[1], E[2], true) || E[1] < o.fy + 1.6) continue; // (a corner in a wall, a piece, a flight; a ceiling too low)
      let n = 0, m = 0; for (let x = r[0] + sx / 2; x < r[2]; x += sx) for (let z = r[1] + sz / 2; z < r[3]; z += sz) { m++; if (clear(E, [o.X0 + x, o.fy + 0.15, o.Z0 + z])) n++; }
      const byDoor = dp.some(q => Math.hypot(q[0] - (X - o.X0), q[1] - (Z - o.Z0)) < 1.3);
      const sc = n / Math.max(1, m) + 0.004 * Math.hypot(X - body.X, Z - body.Z) - (byDoor ? 0.6 : 0);
      if (!best || sc > best.sc) best = { sc, E, seen: n / Math.max(1, m) };
      break; // (the nearer the corner the better: the inset twice only where the first is not clear)
    }
    if (!best) { vistaMemo = { key, none: true }; return vistaMemo; }
    const A = [o.X0 + (r[0] + r[2]) / 2, o.fy + 0.7, o.Z0 + (r[1] + r[3]) / 2], E = best.E;
    let f = [A[0] - E[0], A[1] - E[1], A[2] - E[2]]; const fl = Math.hypot(f[0], f[1], f[2]) || 1; f = f.map(q => q / fl);
    let rt = [-f[2], 0, f[0]]; const rl = Math.hypot(rt[0], rt[2]) || 1; rt = rt.map(q => q / rl); const up = [rt[1] * f[2] - rt[2] * f[1], rt[2] * f[0] - rt[0] * f[2], rt[0] * f[1] - rt[1] * f[0]];
    let need = 0; for (const [i, j] of [[0, 1], [2, 1], [0, 3], [2, 3]]) { const d = [o.X0 + r[i] - E[0], o.fy - E[1], o.Z0 + r[j] - E[2]]; if (Math.hypot(d[0], d[2]) < 1.2) continue; const df = Math.max(0.2, d[0] * f[0] + d[1] * f[1] + d[2] * f[2]);
      need = Math.max(need, Math.abs(d[0] * up[0] + d[1] * up[1] + d[2] * up[2]) / df, Math.abs(d[0] * rt[0] + d[2] * rt[2]) / df / aspNow); }
    const fov = G.clamp(2 * Math.atan(need * 1.06) * 180 / Math.PI, 40, C3.FOV_MAX);
    vistaMemo = { key, E, A, fov, seen: best.seen }; return vistaMemo;
  }
  // the cut (D-655, D-730, D-738): the boxes of the open building that give way to the eye — [x0, y0, z0, x1, y1, z1], world metres —,
  // from its storey's floor up to a little over the eye and the head (the wall over them drawn: no sky over the cut), inside its lot
  // (and its eaves): the walls of the body's room and of the shell that the eye stands past, a slab each; what stands on the line
  // from the eye to a little short of the body (C3.CUT_NEAR), as wide as the shoulder and a hand — not in the vista, whose corner is
  // inside the room. Build3D.insideTick puts them first in its list (the town's material and the inside's give way there); the
  // furniture by the body and beyond it is never in them
  C3.CUT_MAX = 6; C3.CUT_NEAR = 0.45; C3.CUT_W = 0.75; C3.CUT_SPAN = 1.3; // (metres: the shell's wall cut so far each way of the eye)
  const NONE = []; let cuts = NONE, keeps = NONE;
  C3.cutBoxes = () => cuts;
  // (the pieces the body sits on and uses — the one it is seated on, and every piece of its storey a stride from it: the stool, the
  // table at it, the bench —, as boxes over their tops by a hand and a little more for what stands on them: the furniture's and the
  // decoration's material is never cut by the eye, and in its boxes these never go into the weave either — L-1872, Build3D's M3FADE)
  C3.KEEP_NEAR = 0.6; C3.keepBoxes = () => keeps;
  function keepFor(o, body) {
    const p = o.p, l = p.levels.find(q => q.lv === o.lv) || { y: 0 }, y = o.y0 + l.y, x = body.X - o.X0, z = body.Z - o.Z0;
    const sn = G.Avatar && G.Avatar.seatNow ? G.Avatar.seatNow() : null; const on = sn && sn.b === o.b.id ? sn.it : null; const out = [];
    for (const it of p.items) { if ((it.lv || 0) !== (o.lv || 0) || !it.r) continue; const r = it.r;
      const d = Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3])); if (it.id !== on && d > C3.KEEP_NEAR) continue;
      out.push({ d: it.id === on ? -1 : d, c: [o.X0 + r[0] - 0.05, y - 0.05, o.Z0 + r[1] - 0.05, o.X0 + r[2] + 0.05, y + (it.h || 1) + 0.35, o.Z0 + r[3] + 0.05] }); }
    return out.sort((a, c) => a.d - c.d).slice(0, 4).map(q => q.c);
  }
  C3.cutBox = () => (cuts.length ? cuts[0] : null); // (the contract's port: the first — the line from the eye to the body —, or null)
  C3.inCut = (X, Y, Z) => cuts.some(c => X > c[0] && Y > c[1] && Z > c[2] && X < c[3] && Y < c[4] && Z < c[5]);
  function cutFor(o, P, body, piv) {
    // (up to a little over the eye and the head, never into the ceiling drawn over them — the slab's underside, the roof's: over the
    // body and where the eye came into the room, the box's nearest point)
    const nb = [G.clamp(P.X, o.X0 + o.box[0], o.X0 + o.box[2]), G.clamp(P.Z, o.Z0 + o.box[1], o.Z0 + o.box[3])]; const dc = (X, Z) => ceilAt(o, X, Z) + (o.ceilUp !== null ? 0.02 : 0.3);
    const out = []; const pad = 0.3; const y0 = o.fy + 0.02, top = Math.min(Math.max(P.Y, piv.Y) + 0.3, Math.min(dc(piv.X, piv.Z), dc(nb[0], nb[1])) - 0.03 + allowV); const lot = [o.X0 - pad, o.Z0 - pad, o.X1 + pad, o.Z1 + pad];
    // (each box in the lot, and under the ceiling drawn over all of it: its corners' and its middle's)
    const push = c => { if (out.length >= C3.CUT_MAX) return; c[0] = Math.max(c[0], lot[0]); c[2] = Math.max(c[2], lot[1]); c[3] = Math.min(c[3], lot[2]); c[5] = Math.min(c[5], lot[3]); c[4] = Math.min(c[4], Math.min(dc(c[0], c[2]), dc(c[3], c[2]), dc(c[0], c[5]), dc(c[3], c[5]), dc((c[0] + c[3]) / 2, (c[2] + c[5]) / 2)) - 0.03 + allowV); if (c[0] < c[3] - 0.01 && c[2] < c[5] - 0.01 && c[1] < c[4]) out.push(c); };
    // (a rectangle's sides that face the eye — the eye past its inner face —: a slab from the wall's outer face — out — to a hair
    // inside the inner one; along the side, only so far each way of the eye (sp: C3.CUT_SPAN) — the shell's wall cut whole
    // along a side the eye grazed showed the street beside a body walked along it)
    const sides = (r, ins, outw, sp) => { const X0 = o.X0 + r[0], Z0 = o.Z0 + r[1], X1 = o.X0 + r[2], Z1 = o.Z0 + r[3]; const m = outw + 0.1;
      const za = Math.max(Z0 - m, P.Z - sp), zb = Math.min(Z1 + m, P.Z + sp), xa = Math.max(X0 - m, P.X - sp), xb = Math.min(X1 + m, P.X + sp);
      if (P.X < X0 + ins) push([X0 - outw, y0, za, X0 + ins + 0.04, top, zb]);
      if (P.X > X1 - ins) push([X1 - ins - 0.04, y0, za, X1 + outw, top, zb]);
      if (P.Z < Z0 + ins) push([xa, y0, Z0 - outw, xb, top, Z0 + ins + 0.04]);
      if (P.Z > Z1 - ins) push([xa, y0, Z1 - ins - 0.04, xb, top, Z1 + outw]); };
    if (o.rm) sides(o.rm, 0, 0.6, C3.CUT_SPAN);
    // (the line from the eye to the body: one box, or two hugging it when it runs aslant — kept inside a wall of the shell that neither
    // the eye nor the body stands past (the one past it is the slab's below, round the eye; the body's, its door's): the box of a line
    // run near a wall cut it metres away from the eye, and the street was seen beside the body)
    const sh = o.p.shell, st = sh.t || 0.3; const inner = sh.kind !== 'round' && sh.r ? [o.X0 + sh.r[0] + st, o.Z0 + sh.r[1] + st, o.X0 + sh.r[2] - st, o.Z0 + sh.r[3] - st] : null;
    const pushIn = c => { if (inner) { const ins = (k, lo) => (lo ? P[k] > inner[k === 'X' ? 0 : 1] && body[k] > inner[k === 'X' ? 0 : 1] : P[k] < inner[k === 'X' ? 2 : 3] && body[k] < inner[k === 'X' ? 2 : 3]);
      if (ins('X', 1)) c[0] = Math.max(c[0], inner[0] - 0.04); if (ins('Z', 1)) c[2] = Math.max(c[2], inner[1] - 0.04); if (ins('X', 0)) c[3] = Math.min(c[3], inner[2] + 0.04); if (ins('Z', 0)) c[5] = Math.min(c[5], inner[3] + 0.04); } push(c); };
    const ex = P.X - body.X, ez = P.Z - body.Z, eh = Math.hypot(ex, ez);
    if (eh > C3.CUT_NEAR + 0.1 && vistaK < 0.5) { const ux = ex / eh, uz = ez / eh, nx = -uz, nz = ux, w = C3.CUT_W;
      const E = [body.X + ux * C3.CUT_NEAR, body.Z + uz * C3.CUT_NEAR], A = [P.X + ux * 0.3, P.Z + uz * 0.3]; const parts = Math.min(ux * ux, uz * uz) > 0.12 ? 2 : 1;
      for (let k = 0; k < parts; k++) { const a = [G.lerp(E[0], A[0], k / parts), G.lerp(E[1], A[1], k / parts)], b = [G.lerp(E[0], A[0], (k + 1) / parts), G.lerp(E[1], A[1], (k + 1) / parts)];
        const xs = [a[0] + nx * w, a[0] - nx * w, b[0] + nx * w, b[0] - nx * w], zs = [a[1] + nz * w, a[1] - nz * w, b[1] + nz * w, b[1] - nz * w];
        pushIn([Math.min(xs[0], xs[1], xs[2], xs[3]), y0, Math.min(zs[0], zs[1], zs[2], zs[3]), Math.max(xs[0], xs[1], xs[2], xs[3]), top, Math.max(zs[0], zs[1], zs[2], zs[3])]); } }
    // (the shell's sides that face the eye; a round one, the part of its ring on the eye's side)
    if (sh.kind === 'round') { const cx = o.X0 + sh.cx, cz = o.Z0 + sh.cz, r = sh.r; if (Math.hypot(P.X - cx, P.Z - cz) > r - (sh.t || 0.3)) { const ax = Math.abs(P.X - cx) >= Math.abs(P.Z - cz);
      const sp = C3.CUT_SPAN; if (ax) { const s = Math.sign(P.X - cx); push([s > 0 ? cx + r * 0.35 : cx - r - 40, y0, Math.max(cz - r - 0.6, P.Z - sp), s > 0 ? cx + r + 40 : cx - r * 0.35, top, Math.min(cz + r + 0.6, P.Z + sp)]); }
      else { const s = Math.sign(P.Z - cz); push([Math.max(cx - r - 0.6, P.X - sp), y0, s > 0 ? cz + r * 0.35 : cz - r - 40, Math.min(cx + r + 0.6, P.X + sp), top, s > 0 ? cz + r + 40 : cz - r * 0.35]); } } }
    else if (sh.r) sides(sh.r, sh.t || 0.3, 40, C3.CUT_SPAN); // (out to the lot's edge, the eaves': what hangs on the cut wall goes with it — a tavern's sign, L-1867)
    return out;
  }
  // the body in a weave of holes when the eye comes this near its head — a stair, a loft, a gap —: 0 whole, 1 the most (the people's
  // drawing reads it: People3D, the body's own line)
  C3.FADE_NEAR = 0.8; C3.FADE_SPAN = 0.45;
  let fade = 0; C3.bodyFade = () => fade;
  // (a body attached, a world made or opened: no building open to the eye from before — the one just left of another body held the
  // eye under its ceiling a frame, then let it fly up 0,55 m a frame)
  // (lastOk: the eye of the frame before is this body's — after another body's, put in a room, the eye glided in from the last
  // building of the other body, metres away, for a minute: the photos of the house#3582)
  function freshIn() { eb = null; kept = null; room = null; vistaOn = false; vistaK = 0; vistaMemo = null; allowH = allowV = 0; boxKey = ''; poCap = 2; lastOk = false; }
  let lastOk = false;
  G.worldHooks.push(() => { freshIn(); inK = 0; fade = 0; cuts = keeps = NONE; });
  // every frame: follow the body, keep clear of the world, place the camera
  C3.update = function (rdt, body, cam) {
    clock += rdt; let inn = G.Avatar && G.Avatar.indoors ? G.Avatar.indoors() : null;
    // (an open shell — a square, a yard — has no walls between the eye and the body: its pieces stop the eye where they stand,
    // the air past its edge does not. Kept as a room, the edge was a wall: a body against the high rim of a square in Mênfis,
    // on the way to the port, had the eye pushed into its own head and still out of the shell, L-449)
    if (inn && inn.p.shell && inn.p.shell.kind === 'aberta') inn = null;
    // (under the roof: the fourth wall; a cellar: the room of before; the yard: out of doors)
    room = null; let open = null;
    if (inn) { const L = G.Space.TILE; const l = inn.p.levels.find(q => q.lv === inn.lv);
      if (!roofed(inn.p, inn.lv, body.X - inn.b.x * L, body.Z - inn.b.y * L)) inn = null; else if (l && l.y < -0.05) room = byOuterDoor(inn, body) ? null : inn; else open = inn; }
    // (the fourth wall opens with the body in the door's opening: shut to the eye while the body crossed it, the boom met the jambs —
    // the walk turning through a door swept it across the front wall — and the eye was thrown in to them, 3,5 to 4,5 m in a frame)
    if (open) { eb = openTo(open, body, eb); kept = null; }
    else if (room) { eb = null; kept = null; }
    else { if (eb && eb !== kept && G.S.buildings.get(eb.b.id) === eb.b) kept = eb;
      if (kept && !(G.S.buildings.get(kept.b.id) === kept.b && C3.last && through(kept, body, C3.last.pos))) kept = null;
      // (its floor follows the feet down — the steps of a podium out of its walls: the eye thrown in to the shoulder, the temple#5087)
      if (kept) kept.fy = Math.min(kept.fy, body.Y);
      eb = kept; }
    // (a new room for the eye — come in, gone from one to another —: what the eye had out of its box glides in)
    { const key = eb ? eb.b.id + ':' + eb.lv + ':' + (eb === kept ? 'k' : eb.box.join(',')) : '';
      if (key !== boxKey) { boxKey = key; allowH = allowV = 0; if (eb && C3.last && lastOk) { const q = C3.last.pos; allowH = Math.max(0, outOfBox(eb, q[0], q[2]) - C3.BEYOND) + 0.4; allowV = Math.max(0, q[1] - (ceilAt(eb, q[0], q[2]) - C3.CEIL_GAP)) + 0.2; } } // (and the eye's sphere round it)
      else { allowH = Math.max(0, allowH - 3 * rdt); allowV = Math.max(0, allowV - 4 * rdt); } }
    // (the «Vista da sala» ends out of the roof it was asked under; the lens opens a little under a roof, slowly)
    if (!open) vistaOn = false;
    vistaK += ((vistaOn ? 1 : 0) - vistaK) * (1 - Math.exp(-C3.VISTA.k * rdt)); if (vistaK < 1e-3) vistaK = 0;
    inK += ((open ? 1 : 0) - inK) * (1 - Math.exp(-1.6 * rdt)); if (inK < 1e-3) inK = 0;
    const pit = C3.pitch; // (the player's tilt)
    const head = body.head !== undefined ? body.head : (body.h || 1.75) * 0.86;
    // (the world moved the body — a building rose where it stood, a scene, a load: the eye goes with it at once;
    // easing after it would fly through the houses on the way, and a pivot inside a house leaves the eye there — L-106)
    if (!piv || Math.hypot(body.X - piv.X, body.Z - piv.Z) > 2.5 || solid(piv.X, piv.Y, piv.Z)) piv = { X: body.X, Y: body.Y + head, Z: body.Z };
    // (the pivot follows quickly on the ground, more softly up and down: a jump does not jerk the view; the step up the body
    // takes is eased already, Avatar's drawn height)
    const kxz = 1 - Math.exp(-16 * rdt / OPT.smooth), ky = 1 - Math.exp(-(body.ground ? 12 : 5) * rdt / OPT.smooth);
    piv.X += (body.X - piv.X) * kxz; piv.Z += (body.Z - piv.Z) * kxz; piv.Y += (body.Y + head - piv.Y) * ky;
    // the target held: let go when it is gone or too far; the eye keeps it in front, looking a little down at it
    if (lockGet) { const t = lockGet(); lockPt = t && Math.hypot(t.X - body.X, t.Z - body.Z) < C3.LOCK_FAR ? t : null; if (!lockPt) { lockGet = null; C3.lock = null; } }
    aimK += ((aiming ? 1 : 0) - aimK) * (1 - Math.exp(-10 * rdt));
    { const t0 = talkOf(body); if (!t0) talkVeto = 0; // (the talk over: the next one may come in again)
      // (the player's hands on the eye or the body during a talk give that talk's eye back for good — it does not come in again)
      if (t0 && (aiming || lockPt || (body.speed || 0) >= 0.3 || clock - lookT < 0.8 || clock - zoomT < 0.8)) talkVeto = t0.id;
      const t = t0 && t0.id !== talkVeto ? t0 : null; if (t) talkPt = t;
      talkK += ((t ? 1 : 0) - talkK) * (1 - Math.exp(-(t ? 2.2 : 6) * rdt)); if (talkK < 0.01) talkPt = null; }
    // (what struck the body, out of the picture: the eye turns to bring it in beside the body — the player's mouse first)
    if (attend && !lockPt) { attend.t -= rdt; const want0 = Math.atan2(attend.Z - piv.Z, attend.X - piv.X); let off = want0 - C3.yaw; while (off > Math.PI) off -= TAU; while (off < -Math.PI) off += TAU;
      if (attend.t <= 0 || clock - lookT < 0.4) attend = null;
      else if (Math.abs(off) > 0.62) { const want = want0 - Math.sign(off) * 0.5; let da = want - C3.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; C3.yaw += da * (1 - Math.exp(-4.5 * rdt)); } }
    if (lockPt) {
      const t = lockPt; const want = Math.atan2(t.Z - piv.Z, t.X - piv.X); let da = want - C3.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; C3.yaw += da * (1 - Math.exp(-7 * rdt));
      const hd = Math.max(1, Math.hypot(t.X - piv.X, t.Z - piv.Z)); const pw = G.clamp(0.16 + Math.atan2(piv.Y - t.Y, hd) * 0.6, -0.15, 0.55); C3.pitch += (pw - C3.pitch) * (1 - Math.exp(-4 * rdt)); turnAsk = null;
    } else if (turnAsk !== null) {
      // (asked back behind the body: a quick turn, then the player's again)
      let da = turnAsk - C3.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; C3.yaw += da * (1 - Math.exp(-12 * rdt)); if (Math.abs(da) < 0.01) turnAsk = null;
    } else if (OPT.follow && !aiming && clock - lookT > 2.2 && body.speed > 0.8 && body.ground && (body.inFwd || 0) > 0.92 && !body.strafe) {
      // left alone, the eye swings gently behind a body walked straight ahead — only then: a body walked sideways or toward the eye
      // keeps the eye where the player put it (it went round in circles, D-368), and the pitch is the player's
      let da = body.yaw - C3.yaw; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      if (Math.abs(da) < 1.6) C3.yaw += da * (1 - Math.exp(-0.9 * rdt * Math.min(1.5, body.speed / 2.5)));
    }
    // (looking up — at a front, a drum, a tower —: the eye goes down its orbit only to a hand over the feet, and from there it
    // tilts up as asked (below); down the orbit it met the ground and came in to a metre behind the head, and the top of a front of
    // 21 m stayed out of the picture 9 m before it)
    let dist = G.lerp(G.lerp(C3.dist, Math.min(C3.dist, 1.9), aimK), Math.min(C3.dist, 1.25), talkK * (1 - aimK));
    dist = G.lerp(dist, Math.min(dist, C3.IN_DIST), inK); // (under a roof, nearer: the room is small to the eye — D-738)
    // (under a ceiling the orbit's tilt goes no higher than the boom's end a hand under it at the distance asked — the eye stays as far,
    // lower, the look less steep —, eased in and out; the player's tilt down is then the look's, below)
    // (the ceiling over the boom — at a third, two thirds, its end and the sweep's margin past it, and a hand to each side of the end
    // as the eye's sphere has them; the building just left, only near its roof: the end alone, swept under the eaves, brought the eye
    // in 0,6 m at once), a little under the eye's highest: its sphere — the probes over the boom, 0,11 m — keeps clear of it
    { let want = PMAX + 0.4; if (eb) { const ch = Math.cos(Math.min(poCap, pit)) * dist, T = G.Space.TILE, cy = Math.cos(C3.yaw), sy = Math.sin(C3.yaw);
        if (eb !== kept) want = Math.asin(G.clamp((ceilAt(eb, piv.X, piv.Z) - C3.CEIL_GAP + allowV - 0.18 - piv.Y) / Math.max(0.6, dist), -0.35, 1));
        for (const [f, sd] of [[0.35, 0], [0.7, 0], [1, 0], [1, 0.2], [1, -0.2], [1.06, 0]]) { const ex = piv.X - cy * ch * f - sy * sd, ez = piv.Z - sy * ch * f + cy * sd;
          if (eb === kept && !(W.inb(ex / T, ez / T) && G.S.occ[W.idx(ex / T, ez / T)] === eb.b.id && underRoof(eb, ex, ez, 0.8))) continue;
          want = Math.min(want, Math.asin(G.clamp((ceilAt(eb, ex, ez) - C3.CEIL_GAP + allowV - 0.18 - piv.Y) / Math.max(0.6, dist * f), -0.35, 1))); } }
      poCap = want < poCap ? want : poCap + (want - poCap) * (1 - Math.exp(-4 * rdt)); } // (down at once — the glide in is the allowance's —, up eased)
    const poAt = dd => Math.min(poCap, Math.max(pit, -Math.asin(Math.min(1, Math.max(0.2, piv.Y - (body.Y + 0.45)) / Math.max(0.5, dd)))));
    // over the shoulder — the right or the left, crossing over in a moment —, closer in, nearer the middle; aiming, farther out
    const shW = (OPT.side < 0 ? -1 : 1) * G.lerp(0.32 * G.clamp(C3.cur / 4, 0.3, 1), 0.58, aimK); shNow += (shW - shNow) * (1 - Math.exp(-7 * rdt));
    const rx = -Math.sin(C3.yaw), rz = Math.cos(C3.yaw); const sh = sideFree(piv, shNow);
    const Q = { X: piv.X + rx * sh, Y: piv.Y + 0.08 * aimK, Z: piv.Z + rz * sh }; // (the shoulder: the boom starts there)
    let po = poAt(dist), d = fwd(C3.yaw, po), free = reach(Q, d, dist);
    // (and with something behind the body before the orbit's end — a house, a market —, down to a hand over the feet at the
    // distance the eye has, not the one asked: held up the orbit of the 11 m asked, 0.95 m over the feet at the 5.8 m a market left
    // it, the look up was the weaker, and the top of the colossal's front, 26 m, stayed out of the picture — L-755)
    if (free < dist - 0.05 && po > Math.min(pit, poCap) + 1e-6) { po = poAt(free); d = fwd(C3.yaw, po); free = reach(Q, d, free); }
    // (in at once to the exact distance when something comes in the way; out again gently, a moment after the last time it came
    // in — no step of 20 cm, no shrinking by a quarter each frame: L-1140)
    if (free < C3.cur) { C3.cur = free; inT = clock; } else if (clock - inT > 0.25) C3.cur += Math.min((free - C3.cur) * (1 - Math.exp(-2.6 * rdt)), 2.4 * rdt); // (at most 2,4 m a second)
    const L = G.Space.TILE, H = G.Space.HM;
    const at = (q) => {
      const P = { X: Q.X - d[0] * q, Y: Q.Y - d[1] * q, Z: Q.Z - d[2] * q };
      // (never under the sea's face, never in the ground)
      const gx = P.X / L, gy = P.Z / L; if (W.inb(gx, gy)) { const g = Math.max(W.hAt(gx, gy) * H, W.waterH(gx, gy) * H) + 0.3; if (P.Y < g) P.Y = g; }
      return P;
    };
    let P = at(C3.cur);
    // (the point itself must be clear too — the ground under it can lift it into an eave —: then in along the boom to where it
    // is, by the same refined search; still inside — a wall a hand behind the head —, the eye goes to the head for this frame)
    if (solid(P.X, P.Y, P.Z)) { let lo = 0.05, hi = C3.cur; for (let k = 0; k < 9; k++) { const m = (lo + hi) / 2; const q = at(m); if (solid(q.X, q.Y, q.Z)) hi = m; else lo = m; } C3.cur = lo; inT = clock; P = at(C3.cur); }
    let shD = sh;
    if (solid(P.X, P.Y, P.Z)) { shD = 0; C3.cur = 0.05; P = { X: piv.X - d[0] * 0.05, Y: piv.Y - d[1] * 0.05, Z: piv.Z - d[2] * 0.05 }; }
    C3.inside = solid(P.X, P.Y, P.Z);
    // the running body: the lens opens a little (a sense of speed); aiming, it narrows
    const spK = body.sprintK !== undefined ? body.sprintK : body.speed > 4.6 ? 1 : 0; // (the sprint's own share — not a dodge's burst)
    // (the lens by the screen, D-732: never narrower than C3.SIDE_FOV degrees across — a phone held upright opens up and down, it was
    // a spyglass of 29° across —, a few degrees more under a roof, coming in slowly; the talk narrows it only out of doors: D-644)
    const asp = aspNow = cam.aspect > 0 ? cam.aspect : 16 / 9; const base = Math.max(OPT.fov, Math.min(C3.FOV_MAX, 2 * Math.atan(Math.tan(C3.SIDE_FOV * Math.PI / 360) / asp) * 180 / Math.PI));
    fovNow += (Math.min(C3.FOV_MAX, base + 7 * spK + C3.IN_FOV * inK) - 12 * aimK - 10 * talkK * (1 - inK) - fovNow) * (1 - Math.exp(-3.5 * rdt));
    // (the far end of the view where the haze of the quality has already hidden everything: nothing past it is drawn)
    cam.fov = fovNow; cam.near = 0.12; cam.far = G.Realm && G.Realm.viewFar ? G.Realm.viewFar() : 1600; cam.updateProjectionMatrix();
    cam.position.set(P.X, P.Y, P.Z);
    // (the tilt up the orbit could not give: the look raised over the head, as far as asked, the head kept in the lower part of the
    // picture — four fifths of the way down from its middle at most —, never past 77° up)
    const aim = [piv.X + rx * shD, piv.Y + 0.08 * aimK, piv.Z + rz * shD];
    // (and the tilt down the orbit could not give under a ceiling: the look lowered from where the eye is, as far as asked, the head
    // kept in the upper part of the picture)
    { const hd = Math.hypot(aim[0] - P.X, aim[2] - P.Z), e0 = Math.atan2(aim[1] - P.Y, hd), want = -pit;
      if (want > e0 + 0.02 && hd > 0.05) aim[1] = P.Y + hd * Math.tan(Math.min(want, e0 + 0.8 * fovNow * Math.PI / 360, 1.35));
      else if (want < e0 - 0.02 && hd > 0.05 && eb) aim[1] = P.Y + hd * Math.tan(Math.max(want, e0 - 0.8 * fovNow * Math.PI / 360, -1.35)); }
    // (a target held: the look between the body and it, so both are in the picture)
    if (lockPt) { const k = 0.35; aim[0] += (lockPt.X - aim[0]) * k * 0.4; aim[2] += (lockPt.Z - aim[2]) * k * 0.4; aim[1] += (lockPt.Y - aim[1]) * k * 0.25; }
    // (a talk: the look between the body's face and the other's, so both are in the picture — the eye does not turn for it)
    if (talkPt && talkK > 0.01) { const k = 0.4 * talkK; aim[0] += (talkPt.X - aim[0]) * k; aim[2] += (talkPt.Z - aim[2]) * k; aim[1] += (talkPt.Y - aim[1]) * k * 0.5; }
    // (aiming: the look runs far out along the eye's own way, so the middle of the picture is where the shot goes)
    if (aimK > 0.01) { const f = fwd(C3.yaw, C3.pitch); for (let i = 0; i < 3; i++) aim[i] = G.lerp(aim[i], [P.X, P.Y, P.Z][i] + f[i] * 30, aimK); }
    // (the shake: the eye and its aim thrown about a little, by the square of the trauma — a small blow a tremor, a big one a jolt)
    if (trauma > 0) { const k = OPT.shake ? trauma * trauma : 0; const t = clock * 31;
      const sx = (Math.sin(t) + Math.sin(t * 2.3 + 1.7) * 0.5) * 0.11 * k, sy = (Math.sin(t * 1.7 + 0.6) + Math.sin(t * 3.1) * 0.4) * 0.09 * k, sz = Math.sin(t * 1.3 + 2.4) * 0.1 * k;
      if (!solid(P.X + sx, P.Y + sy, P.Z + sz)) { P.X += sx; P.Y += sy; P.Z += sz; cam.position.set(P.X, P.Y, P.Z); } // (never into a wall for it)
      aim[0] += sx * 0.5; aim[1] += sy * 0.6; aim[2] += sz * 0.5; trauma = Math.max(0, trauma - rdt * 1.8); }
    // (the «Vista da sala»: to the corner's eye and look and lens, as far as it has come)
    const vp = vistaK > 0 && eb ? vistaPoseOf(eb, body) : null; if (vp && vp.none) vistaOn = false; // (no clear corner: no vista)
    if (vp && !vp.none) { for (let i = 0; i < 3; i++) aim[i] = G.lerp(aim[i], vp.A[i], vistaK);
      P.X = G.lerp(P.X, vp.E[0], vistaK); P.Y = G.lerp(P.Y, vp.E[1], vistaK); P.Z = G.lerp(P.Z, vp.E[2], vistaK); cam.position.set(P.X, P.Y, P.Z); cam.fov = G.lerp(fovNow, vp.fov, vistaK); cam.updateProjectionMatrix(); }
    // (the drink in the body's eyes: the look thrown about and the picture leaning a little — over the player's own eye, which it never
    // turns: G.EbrioCorpo, T2 D-837)
    const dk = G.EbrioCorpo ? G.EbrioCorpo.olho(rdt) : null; if (dk) { aim[0] += dk.x; aim[1] += dk.y; aim[2] += dk.z; }
    cam.lookAt(aim[0], aim[1], aim[2]);
    if (dk && dk.roll) cam.rotateZ(dk.roll);
    // (the cut of the fourth wall, and the body in a weave when the eye is at its head)
    cuts = eb ? cutFor(eb, P, body, piv) : NONE; keeps = eb && eb !== kept ? keepFor(eb, body) : NONE;
    { const dH = Math.hypot(P.X - piv.X, P.Y - piv.Y, P.Z - piv.Z); fade = G.clamp((C3.FADE_NEAR - dH) / C3.FADE_SPAN, 0, 1); }
    C3.last = { pos: [P.X, P.Y, P.Z], at: aim, fov: cam.fov, cur: C3.cur, sh: shD, piv: [piv.X, piv.Y, piv.Z], body: [body.X, body.Y, body.Z] }; lastOk = true;
  };
  // the pose the camera has right now (for the flight back up to the god)
  C3.pose = () => C3.last || null;
})(window.G);
