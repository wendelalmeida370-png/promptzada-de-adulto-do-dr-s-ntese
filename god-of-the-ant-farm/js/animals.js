'use strict';
// ============================================================
//  Animals: rabbits, deer, boars (prey) and wolves (predators)
// ============================================================
(function (G) {
  const N = G.N, T = G.T, W = G.W;
  const A = G.Animals = {};
  const DEF = {
    rabbit: { hp: 10, sp: 1.1, run: 3.0, meat: 3, fear: 3.5, name: 'Coelho' },
    deer: { hp: 26, sp: 1.0, run: 3.1, meat: 7, fear: 5.2, name: 'Cervo' },
    boar: { hp: 42, sp: 0.85, run: 2.6, meat: 9, fear: 2.2, name: 'Javali' },
    wolf: { hp: 36, sp: 1.25, run: 2.9, meat: 4, fear: 0, name: 'Lobo' },
  };
  A.DEF = DEF;

  A.spawn = function (kind, x, y, extra) {
    const S = G.S; const d = DEF[kind];
    const a = Object.assign({
      id: S.nextId++, kind, x, y, hp: d.hp, maxHp: d.hp, state: 'idle', tx: x, ty: y, sp: d.sp, t: G.R() * 3,
      scan: G.R() * 0.5, face: G.R() < 0.5 ? 1 : -1, walkPh: G.R() * 10, dead: false, meat: d.meat, claim: 0, angry: 0,
      target: 0, air: false, held: false, z: 0, vx: 0, vy: 0, vz: 0, hurt: 0, rot: 0, leader: 0, sated: 0, moving: false,
      leaveT: kind === 'wolf' ? G.DAY_LEN * G.rr(1.2, 1.8) : 0, summoned: false,
    }, extra || {});
    S.animals.set(a.id, a);
    return a;
  };
  A.remove = a => G.S.animals.delete(a.id);

  function landOK(x, y, kind) {
    if (!W.inb(x, y)) return false;
    const i = W.idx(x, y); const t = G.S.type[i];
    if (t <= T.SEA) return false;
    if (W.blocked(i)) return false;
    if (t === T.RIVER && kind === 'rabbit') return false;
    return true;
  }
  function pickNear(a, r) {
    for (let k = 0; k < 8; k++) {
      const ang = G.R() * 6.28, d = G.R() * r;
      const x = a.x + Math.cos(ang) * d, y = a.y + Math.sin(ang) * d;
      if (landOK(x, y, a.kind) && G.S.fire[W.idx(x, y)] <= 0) return [x, y];
    }
    return null;
  }
  function fleeTarget(a, fx, fy, dist) {
    let dx = a.x - fx, dy = a.y - fy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    for (const ang of [0, 0.6, -0.6, 1.2, -1.2, 2, -2]) {
      const c = Math.cos(ang), s = Math.sin(ang);
      const x = a.x + (dx * c - dy * s) * dist, y = a.y + (dx * s + dy * c) * dist;
      if (landOK(x, y, a.kind)) return [x, y];
    }
    return null;
  }
  function moveTo(a, dt, sp) {
    const dx = a.tx - a.x, dy = a.ty - a.y; const d = Math.hypot(dx, dy);
    if (d < 0.05) { a.moving = false; return true; }
    const i = W.idx(a.x, a.y);
    const step = Math.min(d, sp * dt * (G.S.type[i] === T.RIVER ? 0.55 : 1));
    const nx = a.x + dx / d * step, ny = a.y + dy / d * step;
    if (!landOK(nx, ny, a.kind)) {
      // slide along one axis
      if (landOK(nx, a.y, a.kind)) a.x = nx; else if (landOK(a.x, ny, a.kind)) a.y = ny; else { a.tx = a.x; a.ty = a.y; a.moving = false; return true; }
    } else { a.x = nx; a.y = ny; }
    const sdx = dx - dy; if (Math.abs(sdx) > 0.02) a.face = sdx > 0 ? 1 : -1;
    a.walkPh += step * (a.kind === 'rabbit' ? 6 : 8);
    a.moving = true;
    return false;
  }

  A.damage = function (a, dmg, by) {
    if (a.dead) return;
    a.hp -= dmg; a.hurt = 0.3;
    G.FX && G.FX.blood(a.x, a.y);
    if (a.hp <= 0) return A.kill(a, by);
    if (a.kind === 'boar') { a.angry = 14; a.target = by ? by.id : 0; }
    else if (a.kind === 'wolf') { if (by && by.id && G.S.villagers.has(by.id)) a.target = by.id; if (a.hp < a.maxHp * 0.35) a.state = 'leave'; }
    else if (by) { const p = fleeTarget(a, by.x, by.y, 6); if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 3; } }
  };
  A.kill = function (a, by) {
    a.dead = true; a.hp = 0; a.rot = 0; a.moving = false;
    if (a.kind === 'wolf') {
      const S = G.S;
      S.wolvesKilled = (S.wolvesKilled || 0) + 1;
      if (by && by.name) G.Village.log(`${by.name} matou um lobo.`, 'wolf', a.x, a.y);
    }
  };

  function nearestVillager(a, r, filter) {
    let best = null, bd = r * r;
    for (const v of G.S.villagers.values()) {
      if (v.inside || v.held || v.air) continue;
      if (filter && !filter(v)) continue;
      const d = G.dist2(a.x, a.y, v.x, v.y); if (d < bd) { bd = d; best = v; }
    }
    return best;
  }

  function preyAI(a, dt) {
    const S = G.S; const d = DEF[a.kind];
    a.scan -= dt;
    if (a.scan <= 0) {
      a.scan = 0.4 + G.R() * 0.2;
      // threats: people, wolves, fire
      let th = null, td = 1e9;
      const v = nearestVillager(a, d.fear * (a.kind === 'boar' && a.angry <= 0 ? 0.6 : 1));
      if (v && !(a.kind === 'boar' && a.angry > 0)) { th = v; td = G.dist2(a.x, a.y, v.x, v.y); }
      for (const w of S.animals.values()) if (w.kind === 'wolf' && !w.dead) { const dd = G.dist2(a.x, a.y, w.x, w.y); if (dd < (d.fear + 2) ** 2 && dd < td) { th = w; td = dd; } }
      const i = W.idx(a.x, a.y);
      if (S.fire[i] > 0 || S.fire[Math.min(N * N - 1, i + 1)] > 0 || S.fire[Math.max(0, i - 1)] > 0) th = { x: a.x + G.rr(-0.5, 0.5), y: a.y + G.rr(-0.5, 0.5) };
      if (th) {
        const p = fleeTarget(a, th.x, th.y, a.kind === 'rabbit' ? 4 : 6);
        if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'flee'; a.t = 2.5; }
      }
    }
    if (a.kind === 'boar' && a.angry > 0) {
      a.angry -= dt;
      const v = S.villagers.get(a.target);
      if (v && !v.inside && !v.held) {
        a.tx = v.x; a.ty = v.y; a.state = 'charge';
        if (G.dist(a.x, a.y, v.x, v.y) < 0.7) {
          a.cd = (a.cd || 0) - dt;
          if (a.cd <= 0) { a.cd = 1.2; G.Vg.damage(v, 9, 'boar', false); G.FX && G.FX.blood(v.x, v.y); G.Audio && G.Audio.at(v.x, v.y, 'hit'); }
          return;
        }
        moveTo(a, dt, DEF.boar.run); return;
      }
      a.angry = 0;
    }
    a.t -= dt;
    if (a.state === 'flee') { if (moveTo(a, dt, d.run) || a.t <= 0) { a.state = 'idle'; a.t = G.rr(1, 3); } return; }
    if (a.state === 'wander') { if (moveTo(a, dt, d.sp)) { a.state = 'idle'; a.t = G.rr(1.5, 5); } return; }
    if (a.t <= 0) {
      let p = null;
      const L = a.leader && S.animals.get(a.leader);
      if (L && !L.dead && G.R() < 0.7) p = pickNear({ x: L.x, y: L.y, kind: a.kind }, 2.5);
      else p = pickNear(a, a.kind === 'rabbit' ? 3 : 5);
      if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'wander'; } else a.t = 1;
    }
  }

  function wolfAI(a, dt) {
    const S = G.S; const d = DEF.wolf;
    a.leaveT -= dt;
    if (a.sated > 0) a.sated -= dt;
    if ((a.leaveT <= 0 || a.hp < a.maxHp * 0.3) && a.state !== 'leave') { a.state = 'leave'; a.tx = null; }
    if (a.state === 'leave') {
      if (a.tx === null || a.tx === undefined) {
        // run to the nearest shore and swim off
        let best = null, bd = 1e9;
        for (let k = 0; k < 24; k++) {
          const ang = k / 24 * 6.28;
          for (let r = 2; r < 40; r += 2) {
            const x = a.x + Math.cos(ang) * r, y = a.y + Math.sin(ang) * r;
            if (!W.inb(x, y)) break;
            if (G.S.type[W.idx(x, y)] <= T.SEA) { if (r < bd) { bd = r; best = [x, y]; } break; }
          }
        }
        if (!best) { A.remove(a); return; }
        a.tx = best[0]; a.ty = best[1];
      }
      const dx = a.tx - a.x, dy = a.ty - a.y; const dd = Math.hypot(dx, dy);
      if (dd < 0.3) { G.FX && G.FX.splash(a.x, a.y, 0.6); A.remove(a); return; }
      const step = Math.min(dd, d.run * dt);
      a.x += dx / dd * step; a.y += dy / dd * step; a.face = (dx - dy) > 0 ? 1 : -1; a.walkPh += step * 8; a.moving = true;
      return;
    }
    // eating a kill
    if (a.state === 'eat') { a.t -= dt; a.moving = false; if (a.t <= 0) { a.state = 'idle'; a.t = 2; } return; }
    a.scan -= dt;
    if (a.scan <= 0) {
      a.scan = 0.8 + G.R() * 0.4;
      const night = G.isNight();
      const hostile = a.summoned || night || a.raid;
      let tgt = null;
      // an attacker becomes the target
      const cur = a.target && (S.villagers.get(a.target) || S.animals.get(a.target));
      if (cur && !cur.dead && !cur.inside && !cur.held && G.dist(a.x, a.y, cur.x, cur.y) < 14) tgt = cur;
      if (!tgt && a.sated <= 0) {
        let bd = 1e9;
        for (const p of S.animals.values()) {
          if (p.dead || p.kind === 'wolf' || p.held || p.air) continue;
          const dd = G.dist2(a.x, a.y, p.x, p.y); if (dd < 144 && dd < bd) { bd = dd; tgt = p; }
        }
        if (hostile) {
          const v = nearestVillager(a, 11, v => v.age < 62 || true);
          if (v) { const dv = G.dist2(a.x, a.y, v.x, v.y); if (!tgt || dv < bd * 1.3 || a.summoned) tgt = v; }
        }
      }
      if (tgt) { a.target = tgt.id; a.state = 'chase'; }
      else if (a.state === 'chase') { a.state = 'idle'; a.target = 0; }
    }
    if (a.state === 'chase') {
      const tgt = S.villagers.get(a.target) || S.animals.get(a.target);
      if (!tgt || tgt.dead || tgt.inside || tgt.held) { a.state = 'idle'; a.target = 0; a.t = 1; return; }
      a.tx = tgt.x; a.ty = tgt.y;
      const dd = G.dist(a.x, a.y, tgt.x, tgt.y);
      if (dd < 0.65) {
        a.moving = false; a.face = (tgt.x - tgt.y) - (a.x - a.y) > 0 ? 1 : -1;
        a.cd = (a.cd || 0) - dt;
        if (a.cd <= 0) {
          a.cd = 1.1; a.bite = 0.25;
          G.Audio && G.Audio.at(a.x, a.y, 'bite');
          if (tgt.kind) { // animal prey
            A.damage(tgt, 14, a);
            if (tgt.dead) { a.state = 'eat'; a.t = 6; a.sated = 40; tgt.meat = Math.max(0, tgt.meat - 4); if (tgt.meat <= 0) A.remove(tgt); }
          } else {
            G.Vg.damage(tgt, 11, 'wolf', a.summoned);
            G.FX && G.FX.blood(tgt.x, tgt.y);
            if (G.S.villagers.has(tgt.id)) { G.Vg.emote(tgt, 'fear', 2); }
          }
        }
        return;
      }
      moveTo(a, dt, d.run * (a.summoned ? 1 : 0.95));
      return;
    }
    a.t -= dt;
    if (a.state === 'wander') { if (moveTo(a, dt, d.sp)) { a.state = 'idle'; a.t = G.rr(1, 4); } return; }
    if (a.t <= 0) {
      const L = a.leader && S.animals.get(a.leader);
      const p = (L && !L.dead && G.R() < 0.75) ? pickNear({ x: L.x, y: L.y, kind: 'wolf' }, 2.5) : pickNear(a, 6);
      if (p) { a.tx = p[0]; a.ty = p[1]; a.state = 'wander'; } else a.t = 1;
      if (G.isNight() && G.R() < 0.06) { G.Audio && G.Audio.at(a.x, a.y, 'howl', true); a.howl = 2; }
    }
  }

  function landAnimal(a, impact) {
    const S = G.S; const i = W.idx(a.x, a.y);
    if (S.type[i] <= T.SEA) { G.FX && G.FX.splash(a.x, a.y, 1); A.remove(a); return; }
    G.FX && G.FX.dust(a.x, a.y, 5);
    const dmg = Math.max(0, (impact - 220) * 0.3);
    if (dmg > 0) A.damage(a, dmg, null);
    if (!W.walkable(i)) { const n = W.nearestLand(a.x, a.y, 6); if (n) { a.x = n[0]; a.y = n[1]; } }
    a.state = 'idle'; a.t = 1;
  }

  let tBreed = 0;
  A.updateAll = function (dt) {
    const S = G.S;
    for (const a of [...S.animals.values()]) {
      if (a.held) continue;
      if (a.air) { G.airUpdate(a, dt, imp => landAnimal(a, imp)); continue; }
      if (a.hurt > 0) a.hurt -= dt;
      if (a.bite > 0) a.bite -= dt;
      if (a.howl > 0) a.howl -= dt;
      if (a.dead) { a.rot += dt; if (a.rot > G.DAY_LEN * 0.8) A.remove(a); continue; }
      const i = W.idx(a.x, a.y);
      if (S.fire[i] > 0.1) { a.hp -= S.fire[i] * 20 * dt; if (a.hp <= 0) { A.kill(a, null); continue; } }
      if (S.type[i] <= T.SEA && a.state !== 'leave') { const n = W.nearestLand(a.x, a.y, 8); if (n) { a.x = n[0]; a.y = n[1]; } else { A.remove(a); continue; } }
      if (a.kind === 'wolf') wolfAI(a, dt); else preyAI(a, dt);
    }
    tBreed += dt;
    if (tBreed > 12) { breed(tBreed); tBreed = 0; }
  };

  function breed(dt) {
    const S = G.S;
    const count = { rabbit: 0, deer: 0, boar: 0, wolf: 0 };
    const list = { rabbit: [], deer: [], boar: [] };
    for (const a of S.animals.values()) if (!a.dead) { count[a.kind]++; if (list[a.kind]) list[a.kind].push(a); }
    const caps = { rabbit: 18, deer: 11, boar: 5 };
    const rates = { rabbit: 1.6, deer: 0.6, boar: 0.3 };
    for (const k of ['rabbit', 'deer', 'boar']) {
      if (count[k] >= caps[k]) continue;
      if (count[k] >= 2) {
        const p = G.pick(list[k]);
        const mul = G.Nature.zoneMul(p.x, p.y, 'fertility');
        if (G.R() < dt / G.DAY_LEN * rates[k] * count[k] * 0.35 * mul) {
          const q = pickNear(p, 1.5); if (q) A.spawn(k, q[0], q[1], { leader: p.leader || p.id });
        }
      } else if (G.R() < dt / G.DAY_LEN * 0.35) {
        // wanderers come from the wild side of the island
        const sp = A.wildSpot(12); if (sp) { const L = A.spawn(k, sp[0], sp[1]); if (k !== 'boar') { const q = pickNear(L, 1.5); if (q) A.spawn(k, q[0], q[1], { leader: L.id }); } }
      }
    }
  }

  // a land spot far away from people
  A.wildSpot = function (minD) {
    const S = G.S;
    for (let k = 0; k < 60; k++) {
      const x = G.rr(4, N - 4), y = G.rr(4, N - 4); const i = W.idx(x, y);
      if (S.type[i] < T.SAND || S.type[i] === T.RIVER || W.blocked(i)) continue;
      let ok = true;
      for (const s of S.settlements.values()) if (G.dist(x, y, s.cx, s.cy) < minD) { ok = false; break; }
      if (ok) return [x, y];
    }
    return null;
  };
  A.spawnPack = function (x, y, n, summoned) {
    let leader = null;
    for (let k = 0; k < n; k++) {
      const a = G.rr(0, 6.28), r = G.rr(0, 1.2);
      let px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (!landOK(px, py, 'wolf')) { px = x; py = y; }
      const w = A.spawn('wolf', px, py, { summoned: !!summoned, raid: !summoned, leader: leader ? leader.id : 0 });
      if (!leader) leader = w;
    }
    return leader;
  };
  A.populate = function () {
    const S = G.S; const [sx, sy] = S.start;
    const place = (kind, n, herd) => {
      for (let k = 0; k < n; k++) {
        const sp = A.wildSpot(9); if (!sp) continue;
        const L = A.spawn(kind, sp[0], sp[1]);
        for (let h = 1; h < herd; h++) { const q = pickNear(L, 1.5); if (q) A.spawn(kind, q[0], q[1], { leader: L.id }); }
      }
    };
    place('rabbit', 4, 2); place('deer', 2, 3); place('boar', 2, 1);
  };
})(window.G);
