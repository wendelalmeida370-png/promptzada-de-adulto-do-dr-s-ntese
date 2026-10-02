'use strict';
// ============================================================
//  Carnage: war that weighs. Blows that throw a body back,
//  blood that sprays and pools, arms that come off, people who
//  fall and stay fallen. The dead lie where they died: they
//  swell, the crows come, they dry, they become bones — unless
//  someone drags them to the cemetery or to the enemies' pyre.
//  Left there, they bring sickness to whoever lives nearby.
// ============================================================
(function (G) {
  const C = G.Carnage = {};
  let N = G.N; const W = G.W;
  G.mapHooks.push(n => { N = n; });
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (...a) => G.Village.log(...a);
  const oa = v => (v.g === 'f' ? 'a' : 'o');

  // deaths that leave a body in the field
  const BODY = { war: 1, arrow: 1, massacre: 1, execution: 1, coup: 1, sacrifice: 1, beast: 1, wolf: 1, boar: 1, fall: 1, lightning: 1 };
  // stages, in days: fresh, swollen, dry, bones, gone
  const ROT = 0.45, DRY = 1.6, BONES = 3.2, GONE = 18;
  let corpses = [], pyres = [], nextId = 1;
  const decals = [], bits = [], gush = [];
  C.list = () => corpses;
  C.pyres = () => pyres;
  C.stage = c => { const d = c.t / DAY(); return d < ROT ? 'fresh' : d < DRY ? 'rot' : d < BONES ? 'dry' : 'bones'; };
  C.STAGE = { fresh: 'morto há pouco', rot: 'apodrecendo', dry: 'ressecado', bones: 'só ossos' };

  // ------------------------------ blood on the ground ------------------------------
  function decal(x, y, r, k) {
    if (!W.inb(x, y)) return;
    decals.push({ x, y, r, k, t: 0, a: G.rr(0, TAU), s: G.rr(0.7, 1.3) });
    if (decals.length > 900) decals.splice(0, decals.length - 900);
  }
  const DECAL_LIFE = { pool: 2.6, splat: 1.4, trail: 1, ash: 4, bone: 6 };
  function spray(x, y, ux, uy, n) {
    if (!G.FX) return;
    for (let k = 0; k < n; k++) {
      const s = G.rr(0.6, 2.2);
      G.FX.spawn({ x, y, z: G.rr(5, 9), vx: ux * s + G.rr(-0.5, 0.5), vy: uy * s + G.rr(-0.5, 0.5), vz: G.rr(18, 60), g: 240, life: G.rr(0.35, 0.7), s0: G.rr(0.8, 1.5), s1: 0.6, c: k % 3 ? '#a8222c' : '#7a1218', k: 0 });
    }
  }

  // ------------------------------ blows ------------------------------
  C.onHit = function (by, o, dmg, lethal) {
    const S = G.S;
    const dx = o.x - by.x, dy = o.y - by.y; const d = Math.hypot(dx, dy) || 1; const ux = dx / d, uy = dy / d;
    spray(o.x, o.y, ux, uy, lethal ? 16 : 7);
    decal(o.x + ux * G.rr(0.1, 0.5), o.y + uy * G.rr(0.1, 0.5), G.rr(0.08, 0.16), 'splat');
    // the body is thrown back
    o.stagT = S.clock + 0.3;
    const nx = o.x + ux * 0.14, ny = o.y + uy * 0.14; if (W.walkableXY(nx, ny)) { o.x = nx; o.y = ny; }
    const heavy = !!by.elite || by.unit === 'espadachim' || by.hero || by.chosen || dmg > 16;
    if (lethal) {
      const r = G.R();
      if (o.age >= 12 && r < (heavy ? 0.1 : 0.035)) { o._decap = { ux, uy }; G.Audio && G.Audio.at(o.x, o.y, 'gore', true); shakeAt(o.x, o.y, 0.07); }
      else if (o.age >= 12 && r < (heavy ? 0.3 : 0.12)) sever(o, ux, uy, false);
    } else if (dmg > 11 && o.age >= 14 && G.R() < (heavy ? 0.07 : 0.03)) sever(o, ux, uy, true);
    if (lethal && G.R() < 0.35) G.Audio && G.Audio.at(o.x, o.y, 'scream');
  };
  // a parried blow: sparks and the ring of metal
  C.onParry = function (by, o) {
    if (!(o.role === 'guerreiro' || o.unit) || !G.FX) return;
    const mx = (by.x + o.x) / 2, my = (by.y + o.y) / 2;
    for (let k = 0; k < 5; k++) G.FX.spawn({ x: mx, y: my, z: G.rr(6, 9), vx: G.rr(-1.2, 1.2), vy: G.rr(-1.2, 1.2), vz: G.rr(20, 50), g: 160, life: G.rr(0.15, 0.3), s0: 0.9, s1: 0.2, c: '#fff2b0', k: 4, layer: 1 });
    G.Audio && G.Audio.at(mx, my, 'clang');
  };
  function shakeAt(x, y, a) {
    const R = G.Render; if (!R || R.cam.zoom < 1.1) return;
    const [sx, sy] = R.proj(x, y, W.groundH(x, y)); const [px, py] = R.worldPxToScreen(sx, sy);
    if (px > 0 && py > 0 && px < R.VW && py < R.VH) R.shake(a);
  }
  function sever(o, ux, uy, survives) {
    const S = G.S;
    const side = o.lost && o.lost.armR ? (o.lost.armL ? null : 'armL') : o.lost && o.lost.armL ? 'armR' : (G.R() < 0.5 ? 'armL' : 'armR');
    if (!side) return;
    o.lost = Object.assign({}, o.lost || {}, { [side]: true }); o.lostT = S.clock;
    bits.push({ kind: 'arm', x: o.x, y: o.y, z: 8, vx: ux * G.rr(1, 2.4) + G.rr(-0.6, 0.6), vy: uy * G.rr(1, 2.4) + G.rr(-0.6, 0.6), vz: G.rr(35, 70), rot: G.rr(0, TAU), vr: G.rr(-14, 14), skin: o.skin, cloth: G.Art.clothOf(o), t: 0, owner: o.id });
    gush.push({ id: o.id, x: o.x, y: o.y, t: 1.1 });
    G.Audio && G.Audio.at(o.x, o.y, 'gore', true);
    shakeAt(o.x, o.y, 0.05);
    if (survives) {
      const place = G.Village.nearSettlementName(o.x, o.y);
      G.Life && G.Life.bio(o, 'limb', side, place || '');
      G.Vg.emote(o, 'fear', 3);
      if (G.UI && G.UI.selected === o) G.UI.notice(`${o.name} perdeu ${side === 'armL' ? 'o braço esquerdo' : 'o braço direito'}!`, 'skull');
      S.stats.maimed = (S.stats.maimed || 0) + 1;
    }
  }
  C.onArrow = function (o) { o.arrows = Math.min(4, (o.arrowT && G.S.clock - o.arrowT < 30 ? o.arrows || 0 : 0) + 1); o.arrowT = G.S.clock; };

  // ------------------------------ the fallen ------------------------------
  // returns true when the body stays on the ground (no burial yet)
  C.onKill = function (v, cause) {
    const S = G.S;
    if (!BODY[cause] || v.age < 12 || v.aboard || v.inside) return false;
    if (!W.inb(v.x, v.y) || S.type[W.idx(v.x, v.y)] <= G.T.SEA) return false;
    const fac = G.Fac.idOfV(v);
    const levy = !!(v.unit && v.task && v.task.type === 'band');
    const look = {
      id: v.id, g: v.g, age: v.age, skin: v.skin, hair: v.hair, kidCloth: v.kidCloth, role: v.role, captive: v.captive ? { from: v.captive.from } : null,
      unit: v.unit, elite: v.elite, arm: v.arm, _armed: v._armed, _fc: v.captive ? null : G.Fac.hex(fac), _civ: v.captive ? v.civ : ((G.Fac.get(fac) || {}).civ || v.civ || null),
      task: levy ? { type: 'band' } : null, act: '', actT: 0, walkPh: 0, moving: false, face: v.face, hurt: 0, emo: null, carry: null, lost: v.lost || null, z: 0,
    };
    let dir = v.face > 0 ? -1 : 1; if (v.lastBy) { const k = S.villagers.get(v.lastBy); if (k) dir = (v.x - v.y) - (k.x - k.y) > 0 ? 1 : -1; }
    const c = {
      id: nextId++, vid: v.id, name: v.name, x: +v.x.toFixed(2), y: +v.y.toFixed(2), t: 0, dir, look, cause, fac, set: v.set, day: S.day,
      arrows: v.arrowT && S.clock - v.arrowT < 30 ? v.arrows || 0 : 0, headless: !!v._decap, claim: 0,
    };
    corpses.push(c);
    if (v._decap) {
      const u = v._decap;
      bits.push({ kind: 'head', x: v.x, y: v.y, z: 11, vx: u.ux * G.rr(1.2, 2.6) + G.rr(-0.5, 0.5), vy: u.uy * G.rr(1.2, 2.6) + G.rr(-0.5, 0.5), vz: G.rr(40, 75), rot: 0, vr: G.rr(-10, 10), skin: v.skin, hair: v.age >= 62 ? '#dcdcdc' : v.hair, t: 0, owner: v.id, corpse: c.id });
      gush.push({ id: v.id, x: v.x, y: v.y, t: 1.2, neck: true });
    }
    for (const b of bits) if (b.owner === v.id) b.corpse = c.id;
    // the blood pool spreads under the body
    decal(c.x + dir * 0.25, c.y - dir * 0.25, cause === 'lightning' ? 0.1 : G.rr(0.28, 0.42), cause === 'lightning' ? 'ash' : 'pool');
    if (corpses.length > 520) { const k = corpses.findIndex(q => C.stage(q) === 'bones' && !q.claim); corpses.splice(k >= 0 ? k : 0, 1); }
    return true;
  };

  // ------------------------------ who cleans up ------------------------------
  function quiet(x, y, fac) {
    for (const o of G.War.fighters) { if (G.dist2(o.x, o.y, x, y) < 144 && G.Fac.atWar(fac, G.Fac.idOfV(o))) return false; }
    for (const b of G.War.battles) if (G.War.clock - b.last < 10 && G.dist2(b.x, b.y, x, y) < 196) return false;
    return true;
  }
  function pyreOf(set) {
    let p = pyres.find(q => q.set === set.id);
    if (p) return p;
    const S = G.S; const cem = S.buildings.get(set.cemetery);
    const [bx, by] = cem ? G.Village.center(cem) : [set.cx, set.cy];
    const r0 = cem ? 3 : (set.radius || 8) * 0.8;
    for (let k = 0; k < 24; k++) {
      const a = k / 24 * TAU + G.hash(set.id) * TAU; const x = bx + Math.cos(a) * (r0 + (k % 3)), y = by + Math.sin(a) * (r0 + (k % 3));
      if (!W.inb(x, y) || !W.walkableXY(x, y) || S.occ[W.idx(x, y)]) continue;
      p = { id: nextId++, set: set.id, x: +x.toFixed(2), y: +y.toFixed(2), heap: 0, bodies: 0, burn: 0, ash: 0 };
      pyres.push(p); return p;
    }
    return null;
  }
  function assign() {
    const S = G.S;
    const busy = new Map(); for (const v of S.villagers.values()) if (v.task && v.task.type === 'corpse') busy.set(v.set, (busy.get(v.set) || 0) + 1);
    for (const c of corpses) {
      if (c.claim || c.t < 8) continue;
      if (c.claim === 0 && c.skip && S.clock < c.skip) continue;
      const set = G.Village.nearestSettlement(c.x, c.y);
      if (!set || G.dist(c.x, c.y, set.cx, set.cy) > (set.radius || 8) + 14) continue;
      const cap = 2 + Math.floor(G.Village.pop(set.id) / 40);
      if ((busy.get(set.id) || 0) >= cap) continue;
      if (!quiet(c.x, c.y, set.fac)) { c.skip = S.clock + 6; continue; }
      // family first, then the captives, then whoever is not busy
      let best = null, bs = -1e9;
      for (const v of S.villagers.values()) {
        if (v.set !== set.id || v.age < 15 || v.age >= 66 || v.inside || v.sleeping || v.aboard || v.held || v.hp < 40) continue;
        if (v.task && (v.task.pri > 1 || v.task.type === 'corpse')) continue;
        const d = G.dist(v.x, v.y, c.x, c.y); if (d > 34) continue;
        const kin = v.id === (S.dead.get(c.vid) || {}).partner || v.mother === c.vid || v.father === c.vid || (S.dead.get(c.vid) || {}).mother === v.id || (S.dead.get(c.vid) || {}).father === v.id;
        const s = -d * 0.15 + (kin ? 6 : 0) + (v.captive ? 3 : 0) + (v.role === 'construtor' || v.role === 'coletor' || v.role === 'lenhador' ? 1 : 0) - (v.role === 'guerreiro' ? 2 : 0) + G.R();
        if (s > bs) { bs = s; best = v; }
      }
      if (!best) { c.skip = S.clock + 8; continue; }
      c.claim = best.id; busy.set(set.id, (busy.get(set.id) || 0) + 1);
      G.Vg.setTask(best, { type: 'corpse', id: c.id, set: set.id, pri: 1.02, st: 0, kind: 'corpse' });
    }
  }
  C.run = function (v, t, dt, H) {
    if (t.type !== 'corpse') return false;
    const S = G.S; const c = corpses.find(q => q.id === t.id); const set = S.settlements.get(t.set);
    if (!c || !set || (c.claim && c.claim !== v.id)) { if (c && c.claim === v.id) c.claim = 0; H.end(v); return true; }
    if (t.st === 0) { if (!H.goto(v, c.x, c.y, true)) { c.claim = 0; c.skip = S.clock + 10; H.end(v); return true; } t.st = 1; return true; }
    if (t.st === 1) {
      if (!H.move(v, dt)) return true;
      t.st = 2; v.actT = 0;
      const own = c.fac === G.Fac.idOfV(v) && !v.captive;
      t.own = own;
      G.Vg.emote(v, own ? 'sad' : 'sick', 2);
      return true;
    }
    if (t.st === 2) { // a moment over the body
      v.act = t.own ? 'mourn' : 'look'; G.faceTo(v, c.x - v.x, c.y - v.y);
      if (v.actT < (t.own ? 2.2 : 1)) return true;
      // where to: our dead to the cemetery, the others to the pyre
      let dest = null;
      if (t.own) {
        let cem = S.buildings.get(set.cemetery);
        if (!cem || cem.type !== 'cemetery' || (cem.graves || []).length >= 12) { cem = G.Village.startProject(set, 'cemetery'); if (cem) set.cemetery = cem.id; }
        if (cem) { t.cem = cem.id; const [fx, fy] = G.Village.frontTile(cem); dest = [fx, fy, true]; }
      }
      if (!dest) { const p = pyreOf(set); if (!p) { c.claim = 0; H.end(v); return true; } t.pyre = p.id; dest = [p.x + 0.5, p.y + 0.4, false]; }
      if (!H.goto(v, dest[0], dest[1], dest[2])) { c.claim = 0; c.skip = S.clock + 12; H.end(v); return true; }
      t.st = 3; c.drag = v.id; return true;
    }
    if (t.st === 3) { // dragging
      v.act = 'drag';
      const done = H.move(v, dt, 0.5);
      // the body follows on the ground, a little behind
      const d = G.dist(c.x, c.y, v.x, v.y);
      if (d > 0.55) { const k = (d - 0.55) / d; const ox = c.x, oy = c.y; c.x += (v.x - c.x) * k; c.y += (v.y - c.y) * k; if (C.stage(c) === 'fresh' && G.dist(ox, oy, t.lx || ox, t.ly || oy) > 0.5) { decal(c.x, c.y, 0.07, 'trail'); t.lx = c.x; t.ly = c.y; } c.dragA = Math.atan2(v.y - c.y, v.x - c.x); }
      if (!done) return true;
      // laid to rest
      corpses.splice(corpses.indexOf(c), 1);
      for (const b of bits) if (b.corpse === c.id) b.t = 1e9;
      const rec = S.dead.get(c.vid);
      if (t.cem) {
        const cem = S.buildings.get(t.cem);
        if (cem) { (cem.graves = cem.graves || []).push(c.vid); if (rec) { rec.grave = cem.id; rec.buried = 'cem'; } }
        for (const o of S.villagers.values()) {
          if (!rec) break;
          const kin = o.id === rec.partner || o.mother === c.vid || o.father === c.vid || rec.mother === o.id || rec.father === o.id;
          if (kin && o.set === v.set && cem && G.dist(o.x, o.y, cem.x, cem.y) < 28) G.Vg.give(o, { type: 'funeral', id: cem.id, pri: 1.1, kind: 'funeral' });
        }
        S.stats.buried = (S.stats.buried || 0) + 1;
      } else {
        const p = pyres.find(q => q.id === t.pyre);
        if (p) { p.heap++; p.bodies++; if (p.burn <= 0) p.fuse = 3; }
        if (rec) rec.buried = 'pyre';
        S.stats.burned = (S.stats.burned || 0) + 1;
      }
      H.end(v); return true;
    }
    return true;
  };
  C.taskText = function (v, t) {
    if (t.type !== 'corpse') return null;
    const c = corpses.find(q => q.id === t.id);
    const who = c ? c.name : 'um morto';
    if (t.st < 2) return `Indo recolher o corpo de ${who}`;
    if (t.st === 2) return t.own ? `Chorando sobre o corpo de ${who}` : `Examinando o corpo de ${who}`;
    return t.cem ? `Arrastando o corpo de ${who} até o cemitério` : `Arrastando o corpo de ${who} para a pira`;
  };
  C.onEndTask = function (v) { const t = v.task; if (t && t.type === 'corpse') { const c = corpses.find(q => q.id === t.id); if (c && c.claim === v.id) { c.claim = 0; c.drag = 0; } } };

  // ------------------------------ time does its work ------------------------------
  let tSlow = 0; const sickNear = new Map();
  C.update = function (dt) {
    const S = G.S; if (!S) return;
    for (const c of corpses) c.t += dt * (c.crows ? 1.3 : 1) * (S.weather.drought > 0 ? 1.2 : 1);
    for (const d of decals) d.t += dt * (S.wet && S.wet[W.idx(d.x, d.y)] > 0.3 && d.k !== 'ash' ? 2.5 : 1);
    for (let k = decals.length - 1; k >= 0; k--) if (decals[k].t > DECAL_LIFE[decals[k].k] * DAY()) decals.splice(k, 1);
    // limbs in flight
    for (const b of bits) {
      b.t += dt;
      if (b.z > 0 || b.vz > 0) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz -= 190 * dt; b.rot += b.vr * dt;
        if (b.z <= 0) { b.z = 0; if (Math.abs(b.vz) > 25) { b.vz = -b.vz * 0.25; b.vx *= 0.4; b.vy *= 0.4; b.vr *= 0.4; } else { b.vz = 0; b.vx = 0; b.vy = 0; b.vr = 0; decal(b.x, b.y, 0.07, 'splat'); } }
        if (!W.inb(b.x, b.y)) b.t = 1e9;
      }
    }
    for (let k = bits.length - 1; k >= 0; k--) if (bits[k].t > DAY() * (bits[k].corpse ? GONE : 4)) bits.splice(k, 1);
    // blood from a fresh wound
    for (let k = gush.length - 1; k >= 0; k--) {
      const g = gush[k]; g.t -= dt; if (g.t <= 0) { gush.splice(k, 1); continue; }
      const o = S.villagers.get(g.id); if (o) { g.x = o.x; g.y = o.y; }
      if (G.FX && G.R() < dt * 30) G.FX.spawn({ x: g.x, y: g.y, z: g.neck ? 3 : 7, vx: G.rr(-0.7, 0.7), vy: G.rr(-0.7, 0.7), vz: G.rr(15, 45), g: 200, life: G.rr(0.3, 0.6), s0: 1.1, s1: 0.5, c: '#9a1a22', k: 0 });
    }
    // pyres
    for (const p of pyres) {
      if (p.fuse > 0) { p.fuse -= dt; if (p.fuse <= 0) { p.burn = 26 + p.heap * 5; G.Audio && G.Audio.at(p.x, p.y, 'fire', true); } }
      if (p.burn > 0) {
        p.burn -= dt;
        if (G.FX) {
          if (G.R() < dt * 9) G.FX.spawn({ x: p.x + G.rr(-0.3, 0.3), y: p.y + G.rr(-0.3, 0.3), z: G.rr(3, 8), vz: G.rr(20, 40), life: G.rr(0.5, 1), s0: 1.8, s1: 0.2, c: G.pick(['#ffb040', '#ff7a1a', '#ffd070']), k: 4, layer: 1 });
          if (G.R() < dt * 2.5) G.FX.spawn({ x: p.x, y: p.y, z: 10, vz: G.rr(14, 24), vx: Math.cos(S.weather.windA) * 0.4, vy: Math.sin(S.weather.windA) * 0.4, life: G.rr(3, 5), s0: 4, s1: 14, c: 'rgba(60,56,54,0.4)', k: 2 });
        }
        if (p.burn <= 0) { decal(p.x, p.y, 0.45, 'ash'); p.heap = 0; p.burn = 0; }
      }
    }
    tSlow -= dt; if (tSlow > 0) return;
    tSlow = 1;
    assign();
    // who is near the dead: the crows keep away from people, the stink does not
    const grid = new Map();
    for (const v of S.villagers.values()) { if (v.inside || v.aboard) continue; const k = ((v.x >> 2) << 12) | (v.y >> 2); let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(v); }
    const newSick = new Map();
    for (const c of corpses) {
      const st = C.stage(c);
      if (c.t > GONE * DAY()) { c.gone = true; continue; }
      let near = 0; const cx = c.x >> 2, cy = c.y >> 2;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const l = grid.get(((cx + dx) << 12) | (cy + dy)); if (!l) continue;
        for (const v of l) {
          const d2 = G.dist2(v.x, v.y, c.x, c.y);
          if (d2 < 6.25) near++;
          // the stink of the swollen dead makes the living sick
          if (st === 'rot' && d2 < 6.25 && !(v.sick > 0) && !(v.immune > 0) && !(v.task && v.task.type === 'band') && G.R() < 0.006 * (v.traits.includes('Resistente') ? 0.4 : 1)) {
            v.sick = DAY() * G.rr(0.4, 0.8);
            const sn = G.Village.nearSettlementName(c.x, c.y) || '';
            G.Life && G.Life.bio(v, 'plague', sn);
            newSick.set(v.set, (newSick.get(v.set) || 0) + 1);
          }
        }
      }
      c.crows = (st === 'rot' || st === 'dry') && !near && !c.drag && G.hash(c.id) < 0.7 ? 1 + ((G.hash(c.id * 3) * 3) | 0) : 0;
      if (c.crows && G.R() < 0.04) G.Audio && G.Audio.at(c.x, c.y, 'caw');
    }
    if (corpses.some(c => c.gone)) corpses = corpses.filter(c => !c.gone);
    for (const [sid, n] of newSick) {
      const set = S.settlements.get(sid); if (!set) continue;
      sickNear.set(sid, (sickNear.get(sid) || 0) + n);
      if (sickNear.get(sid) >= 3 && (set.stinkDay || -99) < S.day - 3) {
        set.stinkDay = S.day; const rot = corpses.filter(c => C.stage(c) === 'rot' && G.dist(c.x, c.y, set.cx, set.cy) < (set.radius || 8) + 14).length;
        log(`O fedor dos mortos ${rot ? `(${rot} ${rot === 1 ? 'corpo' : 'corpos'} sem enterrar)` : ''} trouxe a doença a ${set.name}: ${sickNear.get(sid)} pessoas adoeceram.`, 'plague', set.cx, set.cy);
        sickNear.set(sid, 0);
      }
    }
  };
  C.near = function (x, y, r) { let n = 0; for (const c of corpses) if (G.dist2(c.x, c.y, x, y) < r * r) n++; return n; };

  // ------------------------------ drawing ------------------------------
  const hex = h => G.hex2rgb(h && h[0] === '#' ? h : '#888888');
  const mix = (a, b, t) => G.rgb(G.lerpColor(hex(a), hex(b), G.clamp(t, 0, 1)));
  function drawBones(ctx, c, t) {
    const b = '#e8e0cc';
    ctx.strokeStyle = b; ctx.lineWidth = 0.7;
    const L = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
    // rags of what they wore
    ctx.fillStyle = mix(G.Art.clothOf(c.look), '#6a6258', 0.6); ctx.globalAlpha *= 0.75; ctx.fillRect(-1.8, -8, 3.4, 3.8); ctx.globalAlpha /= 0.75;
    L(0, -8.8, 0, -3.8);
    for (const y of [-8, -7, -6]) L(-1.4, y, 1.4, y + 0.2);
    ctx.fillStyle = b; ctx.beginPath(); ctx.ellipse(0, -3.6, 1.3, 0.6, 0, 0, TAU); ctx.fill();
    if (!(c.look.lost && c.look.lost.leg)) L(-0.5, -3.4, -0.9, 0); L(0.5, -3.4, 0.9, 0);
    L(0.3, -8, 1.4, -4.6); if (!(c.look.lost && (c.look.lost.armL || c.look.lost.armR))) L(-0.3, -8, -1.4, -4.8);
    if (!c.headless) { ctx.beginPath(); ctx.arc(0, -10.5, 1.9, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a3028'; ctx.fillRect(0.3, -11, 0.7, 0.7); ctx.fillRect(1.2, -11, 0.6, 0.7); ctx.fillRect(0.6, -9.6, 1, 0.35); }
  }
  function drawCorpse(ctx, o, sx, sy, t, nightF) {
    const c = o.c; const S = G.S;
    const st = C.stage(c); const days = c.t / DAY();
    ctx.save(); ctx.translate(sx, sy);
    if (days > GONE - 4) ctx.globalAlpha = G.clamp((GONE - days) / 4, 0, 1);
    // the fall: a sway, a drop, a small bounce
    const f = G.clamp(c.t / 0.5, 0, 1);
    const fall = f < 0.75 ? Math.pow(f / 0.75, 2) : 1 - Math.sin((f - 0.75) / 0.25 * Math.PI) * 0.06;
    const rv = G.Render.rot(); const cd = rv === 0 ? c.dir : rv === 2 ? -c.dir : G.Render.sdir(c.dir, c.dir * (rv === 1 ? -1 : 1));
    let ang = cd * (Math.PI / 2) * fall;
    if (c.drag) ang = cd * Math.PI / 2 + Math.sin(t * 9) * 0.03;
    ctx.rotate(ang);
    if (fall >= 0.99) ctx.scale(1, 0.9);
    if (st === 'bones') drawBones(ctx, c, t);
    else {
      const L = c.look;
      const rot = st === 'fresh' ? 0 : st === 'rot' ? (days - ROT) / (DRY - ROT) : 1;
      L.skin0 = L.skin0 || L.skin; L.hair0 = L.hair0 || L.hair;
      L.skin = st === 'fresh' ? L.skin0 : st === 'rot' ? mix(L.skin0, '#8a9a72', rot * 0.8) : mix('#8a9a72', '#7a6650', (days - DRY) / (BONES - DRY));
      L._cloth = st === 'fresh' ? null : mix(G.Art.clothOf(L), '#5a544c', st === 'rot' ? rot * 0.35 : 0.55);
      L.headless = c.headless;
      if (c.cause === 'lightning') { L.skin = '#3a3430'; L._cloth = '#2a2624'; }
      G.Art.villager(ctx, L, 0, 0, t, false);
      // arrows standing out of the body
      ctx.strokeStyle = '#6e4a2c'; ctx.lineWidth = 0.45;
      for (let k = 0; k < c.arrows; k++) { const y = -8 + k * 1.3, x = (k % 2 ? 1 : -1) * 0.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 3.2, y - 1.4 - k * 0.3); ctx.stroke(); ctx.fillStyle = '#e8e0c8'; ctx.fillRect(x + 2.7, y - 1.6 - k * 0.3, 0.8, 0.5); }
    }
    ctx.restore();
    // flies over the swollen dead
    if (st === 'rot' || (st === 'dry' && days < DRY + 0.4)) {
      ctx.fillStyle = 'rgba(20,20,20,0.85)';
      for (let k = 0; k < 5; k++) { const a = t * (3 + k) + k * 1.7 + c.id; ctx.fillRect(sx + Math.cos(a) * (2 + k * 0.6), sy - 4 + Math.sin(a * 1.3) * 1.8 - k * 0.4, 0.6, 0.6); }
    }
    // crows at work
    for (let k = 0; k < (c.crows || 0); k++) {
      const hop = Math.abs(Math.sin(t * 2.5 + k * 2 + c.id)) * 1.2, peck = Math.sin(t * 7 + k) > 0.6 ? 1 : 0;
      const x = sx + (k - 1) * 4 + c.dir * 2, y = sy + 1.5 - hop - (k % 2) * 1.2;
      ctx.fillStyle = '#16161c';
      ctx.beginPath(); ctx.ellipse(x, y - 1.6, 1.6, 1, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 1.4, y - 2.4 + peck * 1.2, 0.75, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5a5048'; ctx.beginPath(); ctx.moveTo(x + 2, y - 2.4 + peck * 1.2); ctx.lineTo(x + 2.9, y - 2 + peck * 1.6); ctx.lineTo(x + 2, y - 2.1 + peck * 1.2); ctx.fill();
      ctx.fillStyle = '#16161c'; ctx.beginPath(); ctx.moveTo(x - 1.4, y - 1.8); ctx.lineTo(x - 2.8, y - 1.2); ctx.lineTo(x - 1.2, y - 1.2); ctx.fill();
    }
  }
  function drawBit(ctx, o, sx, sy, t) {
    const b = o.b; const days = b.t / DAY();
    ctx.save(); ctx.translate(sx, sy - b.z); ctx.rotate(b.rot);
    const skin = days < 0.5 ? b.skin : days < 2.5 ? mix(b.skin, '#7a7a60', (days - 0.5) / 2) : '#e8e0cc';
    if (b.kind === 'arm') {
      ctx.strokeStyle = skin; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1.8, 0); ctx.lineTo(1.8, 0); ctx.stroke();
      if (days < 2.5) { ctx.fillStyle = b.cloth; ctx.fillRect(-2.2, -0.6, 1.2, 1.2); ctx.fillStyle = '#8a1a1e'; ctx.fillRect(-2.5, -0.4, 0.5, 0.8); }
    } else {
      ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, 0, 1.9, 0, TAU); ctx.fill();
      if (days < 2.5) { ctx.fillStyle = b.hair; ctx.beginPath(); ctx.arc(-0.2, -0.5, 2, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); ctx.fillStyle = '#8a1a1e'; ctx.fillRect(-0.8, 1.5, 1.6, 0.6); }
      else { ctx.fillStyle = '#3a3028'; ctx.fillRect(0.4, -0.5, 0.6, 0.6); ctx.fillRect(1.2, -0.5, 0.5, 0.6); }
    }
    ctx.restore();
  }
  function drawPyre(ctx, o, sx, sy, t, nightF, FXA) {
    const p = o.p;
    if (!p.heap && p.burn <= 0) return;
    ctx.save(); ctx.translate(sx, sy);
    // logs criss-crossed, bodies wrapped on top
    ctx.fillStyle = '#6a4a2c';
    for (let k = 0; k < 4; k++) { ctx.save(); ctx.rotate(k % 2 ? 0.45 : -0.45); ctx.fillRect(-6, -1.4 - k * 1.3, 12, 1.3); ctx.restore(); }
    for (let k = 0; k < Math.min(5, p.heap); k++) { ctx.fillStyle = k % 2 ? '#d8d0c0' : '#c8bca8'; ctx.beginPath(); ctx.ellipse((k - 2) * 1.6, -6.2 - (k % 2) * 1.2, 3.6, 1.2, 0.1, 0, TAU); ctx.fill(); }
    if (p.burn > 0) {
      const f = Math.min(1, p.burn / 10);
      for (let k = 0; k < 7; k++) {
        const x = (k - 3) * 1.5 + Math.sin(t * 9 + k) * 0.5, h = 6 + Math.abs(Math.sin(t * 7 + k * 1.3)) * 9 * f;
        ctx.fillStyle = k % 2 ? 'rgba(255,190,70,0.9)' : 'rgba(255,110,30,0.85)';
        ctx.beginPath(); ctx.moveTo(x - 1.6, -5); ctx.quadraticCurveTo(x, -5 - h * 1.2, x + 1.6, -5); ctx.fill();
      }
      FXA && FXA.fire(sx, sy - 8, 1.2 * f + 0.4);
      FXA && FXA.light(sx, sy - 6, 70 + 30 * f, '255,150,60', 0.9);
    }
    ctx.restore();
  }
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  G.renderHooks.ground.push(function (ctx, proj, view) {
    if (!decals.length) return;
    const D = DAY();
    for (const d of decals) {
      const p = proj(d.x, d.y, W.groundH(d.x, d.y));
      if (p[0] < view[0] - 20 || p[0] > view[2] + 20 || p[1] < view[1] - 20 || p[1] > view[3] + 20) continue;
      const life = DECAL_LIFE[d.k] * D; const age = d.t / life;
      const grow = d.k === 'pool' ? G.clamp(d.t / 3, 0.25, 1) : 1;
      const a = (d.k === 'ash' ? 0.55 : d.k === 'trail' ? 0.5 : 0.72) * (1 - age * age);
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = d.k === 'ash' ? '#3a3634' : age < 0.15 ? '#8a1218' : age < 0.5 ? '#5e1a1a' : '#4a3226';
      const rx = d.r * 16 * grow * d.s, ry = d.r * 8 * grow;
      ctx.beginPath(); ctx.ellipse(p[0], p[1], rx, ry, 0, 0, TAU); ctx.fill();
      if (d.k === 'pool' && rx > 3) { ctx.beginPath(); ctx.ellipse(p[0] + Math.cos(d.a) * rx * 0.8, p[1] + Math.sin(d.a) * ry * 0.8, rx * 0.35, ry * 0.35, 0, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  });
  G.renderHooks.ents.push(function (add) {
    for (const c of corpses) add(c.x + c.y - 0.05, c._e || (c._e = { t: 13, c, fn: drawCorpse }), c.x, c.y);
    for (const b of bits) add(b.x + b.y - 0.02, b._e || (b._e = { t: 13, b, fn: drawBit }), b.x, b.y);
    for (const p of pyres) if (p.heap || p.burn > 0) add(p.x + p.y, p._e || (p._e = { t: 13, p, fn: drawPyre }), p.x, p.y);
  });

  // ------------------------------ saving ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save(out) {
      out.carnage = {
        corpses: corpses.map(c => { const o = Object.assign({}, c); delete o._e; o.look = Object.assign({}, c.look); delete o.look.skin0; delete o.look.hair0; delete o.look._cloth; if (o.look.skin0 === undefined && c.look.skin0) o.look.skin = c.look.skin0; o.claim = 0; o.drag = 0; return o; }),
        pyres: pyres.map(p => ({ id: p.id, set: p.set, x: p.x, y: p.y, heap: p.heap, bodies: p.bodies, burn: 0, ash: 0 })), next: nextId,
      };
    },
    load(o) {
      const k = o.carnage || {};
      corpses = (k.corpses || []).map(c => Object.assign(c, { claim: 0, drag: 0 }));
      pyres = k.pyres || []; nextId = k.next || 1;
      decals.length = 0; bits.length = 0; gush.length = 0;
    },
  });
  C.reset = function () { corpses = []; pyres = []; decals.length = 0; bits.length = 0; gush.length = 0; nextId = 1; };
})(window.G);
