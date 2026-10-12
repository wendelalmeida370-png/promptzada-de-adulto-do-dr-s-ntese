'use strict';
// ============================================================
//  The port is people. The boat does not fish — the fisherman fishes
//  using the boat. A day of Caio's:
//    he leaves home at first light · goes by the shed for the net ·
//    walks down to the quay · steps aboard · the boat casts off · rows
//    out to the spot his crew knows · the net goes over the side and
//    comes up heavy · they row home · tie up · step onto the quay ·
//    the catch is set down in crates · he carries a crate up to the
//    storehouse — and only then is it food.
//  Also here: the shipyard (a hull goes up on the slip, rib by rib,
//  plank by plank, with the shipwrights hammering), the boats' crews
//  (rosters of real fishermen), the spots each port learns (and fishes
//  out), and the quay's life (crates, nets drying on poles).
// ============================================================
(function (G) {
  const Nv = G.Naval, E = G.Eco; if (!Nv || !E) return;
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const W = G.W, T = G.T;
  const Fi = G.Fishers = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;
  const TAU = Math.PI * 2;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const ship = id => G.S.ships.find(o => o.id === id) || null;

  // ------------------------------ the trade ------------------------------
  G.ROLE.pescador = ['Pescador', 'Pescadora'];
  if (!E.JOB_ROLES.includes('pescador')) E.JOB_ROLES.push('pescador');
  G.BDEF.doca.jobs = 12; G.BDEF.doca.role = 'pescador';
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.pescador = '#3f6f8f';
  // the kinds of fishing boat: a dugout for two, the common boat, the big one with its crew of five
  Fi.CLS = {
    canoa: { crew: 2, hold: 0.65, sp: 0.85, noun: 'canoa' },
    barco: { crew: 3, hold: 1, sp: 1, noun: 'barco' },
    traineira: { crew: 5, hold: 1.8, sp: 0.95, noun: 'barco grande' },
  };
  Fi.cls = s => Fi.CLS[s.cls] || Fi.CLS.barco;
  function pickCls(s) {
    const f = G.Fac.get(s.fac); const pop = f ? G.Fac.pop(f.id) : 0;
    if (s.civ === 'asteca' || (s.civ === 'egipcio' && G.R() < 0.4)) return pop > 150 && G.R() < 0.3 ? 'barco' : 'canoa';
    const big = Nv.shipsOf(s.fac, 'pesca').filter(o => o.cls === 'traineira').length;
    if (pop > 110 && big < 2 && G.R() < 0.35) return 'traineira';
    return pop < 18 && G.R() < 0.5 ? 'canoa' : 'barco';
  }
  const FISHERS = { barco: 1, descarga: 1, redes: 1, estaleiro: 1 };
  Fi.TASKS = FISHERS;
  const docksOfSet = sid => { const out = []; for (const b of G.S.buildings.values()) if (b.type === 'doca' && b.built && b.set === sid) out.push(b); return out; };
  const boatsOf = b => G.S.ships.filter(o => o.dock === b.id && o.kind === 'pesca');
  // the jobs on the quay: as many hands as the boats need
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A);
    let n = 0; for (const d of docksOfSet(set.id)) for (const s of boatsOf(d)) if (s.st !== 'build') n += Fi.cls(s).crew;
    if (n) out.pescador = (out.pescador || 0) + Math.min(n, Math.max(1, Math.floor(A * 0.3)));
    return out;
  };

  // ------------------------------ the crews ------------------------------
  // every boat has a roster of fishermen of its own port (who stays with it)
  function rosters() {
    const S = G.S; const byJob = new Map();
    for (const v of S.villagers.values()) {
      if (v.role === 'pescador' && v.job && !v.captive) { let l = byJob.get(v.job); if (!l) byJob.set(v.job, l = []); l.push(v); }
      // the gear goes back on the hook when the work is interrupted
      if (v.gear && !v.aboard && !(v.task && (FISHERS[v.task.type] || (v.task.type === 'scene')))) v.gear = null;
    }
    for (const b of S.buildings.values()) {
      if (b.type !== 'doca' || !b.built) continue;
      const fs = byJob.get(b.id) || []; b._fishers = fs.length;
      const boats = boatsOf(b).filter(s => s.st !== 'build');
      const taken = new Set();
      for (const s of boats) {
        // keep whoever is still a fisherman here (and anyone aboard right now)
        s.crew = (s.crew || []).filter(id => { const v = P(id); return v && (v.aboard === s.id || (!v.aboard && v.role === 'pescador' && v.job === b.id && !taken.has(id))); });
        for (const id of s.crew) taken.add(id);
      }
      for (const s of boats) {
        const want = Fi.cls(s).crew;
        for (const v of fs) { if (s.crew.length >= want) break; if (taken.has(v.id) || v.aboard) continue; s.crew.push(v.id); taken.add(v.id); v.boat = s.id; }
        for (const id of s.crew) { const v = P(id); if (v) v.boat = s.id; }
      }
      for (const v of fs) if (!taken.has(v.id)) v.boat = 0;
    }
  }

  // ------------------------------ the work ashore ------------------------------
  const goodDay = () => { const t = G.S.time; return t > 0.04 && t < 0.58 && !(G.S.weather.storm > 0); };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role !== 'pescador') return oldJob(v, H);
    const S = G.S; const b = v.job && S.buildings.get(v.job); if (!b || !b.built || b.type !== 'doca') return null;
    if (b.crates && b.crates.length) return H.setTask(v, { type: 'descarga', dock: b.id, pri: 1.1, st: 0, trips: 0 });
    const s = v.boat && ship(v.boat);
    if (s && (s.st === 'idle' || s.st === 'board') && goodDay() && !Nv.blockaded(b) && s.hp > s.maxHp * 0.35) return H.setTask(v, { type: 'barco', ship: s.id, dock: b.id, pri: 1.05, st: 0 });
    // a hull on the slip, or a boat to caulk: every free hand to the shipwrights
    const slip = S.ships.find(o => o.dock === b.id && (o.st === 'build' || (o.st === 'idle' && o.hp < o.maxHp * 0.8)));
    if (slip && G.R() < 0.8) return H.setTask(v, { type: 'estaleiro', ship: slip.id, dock: b.id, pri: 1, st: 0 });
    if (G.isNight() && G.R() < 0.6) return null;
    return H.setTask(v, { type: 'redes', dock: b.id, pri: 0.8, st: 0, dur: G.rr(10, 18) });
  };
  function walk(v, t, key, x, y, dt, H, adj) {
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, x, y, adj !== false) && !H.goto(v, x, y, true, N * N)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; return 1; }
    return 0;
  }
  // where things stand on a quay: the crates by the water, the net rack behind
  Fi.quaySpot = function (b, k) {
    const di = Nv.dockInfo(b); const q = di.quay || G.Vg.door(b); const wd = b.wd || [1, 0];
    const side = [-wd[1], wd[0]]; const off = (k % 5 - 2) * 0.45;
    const p = [q[0] + side[0] * off - wd[0] * (0.3 + Math.floor(k / 5) * 0.4), q[1] + side[1] * off - wd[1] * (0.3 + Math.floor(k / 5) * 0.4)];
    return W.walkableXY(p[0], p[1]) ? p : q;
  };
  function crateSpot(b) { const di = Nv.dockInfo(b); const q = di.quay || G.Vg.door(b); const wd = b.wd || [1, 0]; const p = [q[0] - wd[0] * 0.9 + wd[1] * 0.8, q[1] - wd[1] * 0.9 - wd[0] * 0.8]; return W.walkableXY(p[0], p[1]) ? p : q; }
  Fi.crateSpot = crateSpot;
  function runBarco(v, t, dt, H) {
    const S = G.S; const s = ship(t.ship); const b = S.buildings.get(t.dock);
    if (!s || !b || (s.st !== 'idle' && s.st !== 'board') || v.aboard) return H.end(v);
    const di = Nv.dockInfo(b); if (!di.moor) return H.end(v);
    // 1. the shed: the net, the oar
    if (t.st === 0) { const d = G.Vg.door(b); const r = walk(v, t, 'shed', d[0], d[1], dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    if (t.st === 1) { v.act = 'lift'; if (v.actT > 1.1) { v.act = ''; v.gear = (s.crew.indexOf(v.id) % 2 === 0) ? 'rede' : 'remo'; t.st = 2; } return; }
    // 2. down to the quay
    if (t.st === 2) { const k = Math.max(0, s.crew.indexOf(v.id)); const q = t.alt ? G.Vg.door(b) : Fi.quaySpot(b, k); const r = walk(v, t, t.alt ? 'quay2' : 'quay', q[0], q[1], dt, H); if (r < 0) { if (!t.alt) { t.alt = 1; return; } return H.end(v); } if (r > 0) { t.st = 3; v.actT = 0; } return; }
    // 3. a step down into the boat (when it is at the quay)
    if (t.st === 3) {
      if (G.dist(s.x, s.y, di.moor[0], di.moor[1]) > 2) { v.act = 'wait'; if (t.age > 90) H.end(v); return; }
      if (!goodDay() && s.st === 'idle') return H.end(v);
      v.act = ''; t.st = 4; t.bx = v.x; t.by = v.y; v.actT = 0; return;
    }
    if (t.st === 4) {
      const k = Math.min(1, v.actT / 0.6); v.x = G.lerp(t.bx, s.x, k); v.y = G.lerp(t.by, s.y, k); v.z = Math.sin(k * Math.PI) * 0.4;
      if (k >= 1) { v.z = 0; Nv.board(v, s); if (s.st === 'idle') { s.st = 'board'; s.t = 0; } G.FX && G.FX.splash(s.x, s.y, 0.25); }
    }
  }
  // the catch, crate by crate, up to the storehouse
  function runDescarga(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.dock); if (!b) return H.end(v);
    if (t.st === 0) {
      if (!b.crates || !b.crates.length) return H.end(v);
      const p = t.alt ? G.Vg.door(b) : crateSpot(b); const r = walk(v, t, t.alt ? 'crates2' : 'crates', p[0], p[1], dt, H); if (r < 0) { if (!t.alt) { t.alt = 1; return; } return H.end(v); } if (r > 0) { t.st = 1; v.actT = 0; } return;
    }
    if (t.st === 1) {
      v.act = 'lift'; if (v.actT < 1) return;
      v.act = ''; const c = b.crates && b.crates.shift(); if (!c) return H.end(v);
      v.carry = { k: c.k, n: c.n, crate: 1, fish: c.fish, fishCol: c.col, catchOf: c.boat };
      t.st = 2; return;
    }
    if (t.st === 2) {
      const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) { if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, G.Fac.idOfV(v)); v.carry = null; } return H.end(v); }
      const ft = G.Village.frontTile(d); const r = walk(v, t, 'store' + d.id, ft[0], ft[1], dt, H); if (r < 0) { if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, G.Fac.idOfV(v)); v.carry = null; } return H.end(v); }
      if (r > 0) {
        if (v.carry) delivered(v, v.carry);
        v.carry = null; t.trips++;
        if (b.crates && b.crates.length && t.trips < 4) { t.st = 0; t.wk = null; } else H.end(v);
      }
    }
  }
  function delivered(v, c) {
    const fid = G.Fac.idOfV(v); const fa = G.Fac.get(fid); if (!fa) return;
    const add = G.Village.addStock(c.k, c.n, fid);
    if (c.k !== 'food') E.made(fa, c.k, c.n);
    G.FX && G.FX.deposit(v.x, v.y, c.k, add || c.n);
    v.st[c.k] = (v.st[c.k] || 0) + c.n;
    if (c.fish) { G.Riches && G.Riches.noteFood(fid, 'peixe:' + c.fish, c.n); }
    v.fishXp = (v.fishXp || 0) + 1;
  }
  // mending the nets on the quay (and keeping an eye on the sea)
  function runRedes(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.dock); if (!b) return H.end(v);
    if (t.st === 0) { const k = 6 + (v.id % 6); const p = Fi.quaySpot(b, k); const r = walk(v, t, 'mend', p[0], p[1], dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; v.gear = 'rede'; const di = Nv.dockInfo(b); if (di.moor) G.faceTo(v, di.moor[0] - v.x, di.moor[1] - v.y); } return; }
    v.act = 'mend'; v.moving = false;
    if (v.actT > t.dur) { v.act = ''; v.gear = null; H.end(v); }
  }
  // the shipwrights: hammer and caulk on the slip
  function runEstaleiro(v, t, dt, H) {
    const S = G.S; const s = ship(t.ship); const b = S.buildings.get(t.dock);
    if (!s || !b || (s.st !== 'build' && !(s.st === 'idle' && s.hp < s.maxHp))) { v.act = ''; return H.end(v); }
    if (t.st === 0) { const k = 10 + (v.id % 4); const p = Fi.quaySpot(b, k); const r = walk(v, t, 'slip', p[0], p[1], dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = 'build'; v.moving = false; G.faceTo(v, s.x - v.x, s.y - v.y);
    if (G.R() < dt * 1.2) { G.FX && G.FX.chips && G.FX.chips(G.lerp(v.x, s.x, 0.6), G.lerp(v.y, s.y, 0.6), '#c8a070'); G.Audio && G.Audio.at(s.x, s.y, 'chop', false, 0.25); }
    if (s.st === 'build') s.work = (s.work || 0) + dt * G.clamp((v.fishXp || 0) / 40 + 0.8, 0.8, 1.4);
    else { s.hp = Math.min(s.maxHp, s.hp + dt * 2.2); s.sail = Math.min(100, (s.sail || 100) + dt * 3); if (s.hp >= s.maxHp) { s.mast = 1; s.flood = 0; } }
    if (t.age > 45) { v.act = ''; H.end(v); }
  }
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'barco': runBarco(v, t, dt, H); return true;
      case 'descarga': runDescarga(v, t, dt, H); return true;
      case 'redes': runRedes(v, t, dt, H); return true;
      case 'estaleiro': runEstaleiro(v, t, dt, H); return true;
    }
    return oldRun(v, t, dt, H);
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    switch (t.type) {
      case 'barco': return ['Buscando a rede no galpão', 'Pegando a rede', 'Descendo para o cais', 'Esperando o barco no cais', 'Embarcando'][t.st] || 'Indo pescar';
      case 'descarga': return v.carry ? 'Levando uma caixa de peixe ao armazém' : 'Descarregando o barco';
      case 'redes': return t.st ? 'Remendando redes no cais' : 'Indo remendar as redes';
      case 'estaleiro': { const s = ship(t.ship); return s && s.st === 'build' ? `Construindo ${Nv.title(s)} no estaleiro` : 'Calafetando o casco de um barco'; }
    }
    return oldText(v, t);
  };

  // ------------------------------ the boat ------------------------------
  function pickSpot(s, b) {
    const S = G.S;
    // the spots this port knows, worth less where they have been fished too hard
    const sp = (b.spots || []).filter(o => W.inb(o.x, o.y) && S.type[W.idx(o.x, o.y)] <= T.SEA && Nv.compAt(o.x, o.y) === Nv.compAt(s.x, s.y));
    const val = o => o.q / (1 + Math.max(0, (o.p || 0) - 2) * 0.3);
    if (sp.length && G.R() < 0.7) { sp.sort((a, c) => val(c) - val(a)); const o = sp[G.R() < 0.75 ? 0 : Math.min(sp.length - 1, 1)]; return [o.x + G.rr(-0.6, 0.6), o.y + G.rr(-0.6, 0.6), null, o]; }
    const p = Nv._fishingSpot(s); return p;
  }
  function learnSpot(b, x, y, q) {
    const L = b.spots || (b.spots = []);
    let o = L.find(z => G.dist(z.x, z.y, x, y) < 2.5);
    if (!o) { o = { x: +x.toFixed(1), y: +y.toFixed(1), q, p: 0, d: G.S.day }; L.push(o); if (L.length > 6) { L.sort((a, c) => c.q - a.q); L.length = 6; } }
    o.q = o.q * 0.6 + q * 0.4; o.p = (o.p || 0) + 1; o.d = G.S.day;
  }
  function catchOf(s, crew, b) {
    const S = G.S; const cl = Fi.cls(s);
    const sh = S.fish.find(f => f.id === s.shoal && G.dist(f.x, f.y, s.x, s.y) < 3) || S.fish.find(f => G.dist(f.x, f.y, s.x, s.y) < 2.2);
    const skill = crew.length ? crew.reduce((n, v) => n + Math.min(1.35, 0.85 + (v.fishXp || 0) / 120), 0) / crew.length : 1;
    const spot = s.spot && s.spot[3]; const over = spot ? 1 / (1 + Math.max(0, (spot.p || 0) - 2) * 0.3) : 1;
    let n = G.rr(4, 8) * G.Civ.t(s.fac, 'fish') * (sh ? 1.8 : 1) * Math.pow(crew.length / cl.crew, 0.7) * cl.hold * skill * over;
    if (sh) { sh.n -= n; if (sh.n <= 0) S.fish.splice(S.fish.indexOf(sh), 1); }
    n = Math.max(1, Math.round(n));
    learnSpot(b, s.x, s.y, n / Math.max(1, 6 * cl.hold));
    return n;
  }
  // the hold, in crates on the quay
  function crates(b, s) {
    const F = G.Waters ? G.Waters.FISH : null; const k = s.catchKind || 'sardinha'; const f = (F && F[k]) || { n: 2, name: 'peixe' };
    let food = s.cargo, good = 0; const out = [];
    if (f.good) { good = Math.max(1, Math.round(s.cargo * 0.45)); food = s.cargo - good; }
    else food = Math.max(1, Math.round(food * f.n / 2.2));
    const L = b.crates || (b.crates = []);
    const put = (kk, n) => { while (n > 0 && L.length < 10) { const m = Math.min(4, n); L.push({ k: kk, n: m, fish: k, col: f.col, boat: s.id }); n -= m; } if (n > 0 && L.length) L[L.length - 1].n += n; };
    if (good) put(f.good, good); if (food > 0) put('food', food);
    G.Waters && G.Waters.noteCatch({ fac: s.fac }, k, s.x, s.y, s.cargo);
    G.FX && G.FX.floater(s.x, s.y, `+${s.cargo} ${f.name}`, '#b8e070', 1.6);
    return out;
  }
  // a fisherman steps off onto the quay (and goes for the crates)
  function ashore(v, s, b, k) {
    const q = Fi.quaySpot(b, k); Nv.unboard(v); v.x = q[0]; v.y = q[1]; v.path = null; v.gear = null;
    G.Vg.setTask(v, b.crates && b.crates.length ? { type: 'descarga', dock: b.id, pri: 1.1, st: 0, trips: 0 } : { type: 'redes', dock: b.id, pri: 0.8, st: 0, dur: G.rr(6, 12) });
  }
  function drift(s) {
    const S = G.S; const wa = S.weather.windA || G.R() * TAU; const c = Nv.compAt(s.x, s.y);
    for (let k = 0; k < 14; k++) {
      const d = G.rr(16, 36), a = wa + G.rr(-0.5, 0.5); const x = s.x + Math.cos(a) * d, y = s.y + Math.sin(a) * d;
      if (!W.inb(x, y) || S.type[W.idx(x, y)] > T.SEA || Nv.compAt(x, y) !== c) continue;
      if (Nv._sailTo(s, Math.floor(x) + 0.5, Math.floor(y) + 0.5)) return true;
    }
    return false;
  }
  function runBoat(s, dt) {
    const S = G.S; const b = S.buildings.get(s.dock); const h = Nv._home(s); if (!h || !b) return Nv._remove(s);
    if (!s.cls) s.cls = pickCls(s);
    s.t += dt;
    const crew = Nv.aboardOf(s);
    // at sea with nobody aboard: a boat adrift (the crew went over the side)
    if (Nv.atSea(s) && !crew.length && s.st !== 'back') { s.st = 'back'; if (!Nv._sailTo(s, h.moor[0], h.moor[1])) return Nv._remove(s); s.ghost = 1; }
    if ((s.st === 'out' || s.st === 'fish' || s.st === 'adrift') && Nv._threat(s, 6)) { if (Nv._sailTo(s, h.moor[0], h.moor[1])) { s.st = 'back'; s.fled = S.day; } }
    // a storm comes up: run for home — or be carried off by it
    if ((s.st === 'out' || s.st === 'fish') && S.weather.storm > 0 && !s.stormed) {
      s.stormed = 1;
      if (G.R() < 0.3 && drift(s)) { s.st = 'adrift'; s.t = 0; s.drifted = S.day; s.lookout = 1.3; }
      else if (Nv._sailTo(s, h.moor[0], h.moor[1])) s.st = 'back';
    }
    switch (s.st) {
      case 'idle': if (crew.length) { s.st = 'board'; s.t = 0; } s.ghost = 0; break;
      case 'board': {
        if (!crew.length) { s.st = 'idle'; break; }
        const coming = (s.crew || []).filter(id => { const v = P(id); return v && !v.aboard && v.task && v.task.type === 'barco' && v.task.ship === s.id; }).length;
        if (!goodDay() || Nv.blockaded(b)) { let k = 0; for (const v of crew) ashore(v, s, b, k++); s.st = 'idle'; break; }
        if ((!coming && s.t > 2) || s.t > 30) {
          const sp = pickSpot(s, b);
          if (sp && Nv._sailTo(s, sp[0], sp[1])) { s.st = 'out'; s.t = 0; s.spot = sp; s.shoal = sp[2] ? sp[2].id : 0; s.stormed = 0; s.trip = (s.trip || 0) + 1; G.Audio && G.Audio.at(s.x, s.y, 'splash', false, 0.3); }
          else { let k = 0; for (const v of crew) ashore(v, s, b, k++); s.st = 'idle'; s.t = -20; }
        }
        break;
      }
      case 'out': if (Nv._move(s, dt)) { s.st = 'fish'; s.t = 0; s.dur = G.rr(18, 30); } break;
      case 'fish': {
        if (G.R() < dt * 0.6) G.FX && G.FX.splash(s.x + G.rr(-0.5, 0.5), s.y + G.rr(-0.5, 0.5), 0.3);
        if (s.t > s.dur || S.time > 0.64) {
          s.cargo = catchOf(s, crew, b); s.catchKind = G.Waters ? G.Waters.fishAt(s.x, s.y, true) : null;
          if (Nv._sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; else Nv._remove(s);
        }
        break;
      }
      case 'adrift': if (Nv._move(s, dt) || s.t > 40) { s.lookout = 1; if (Nv._sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; else { s.st = 'adrift'; if (!drift(s)) Nv._remove(s); } } break;
      case 'back': if (Nv._move(s, dt)) { s.st = 'unload'; s.t = 0; s.uq = 0.4; Fi.landNews(s, crew); Nv.arrived(s); if (s.cargo) crates(b, s); s.cargo = 0; } break;
      case 'unload': {
        s.uq -= dt; if (s.uq > 0) break;
        if (crew.length) { const v = crew[0]; ashore(v, s, b, (s.crew.indexOf(v.id) + 1) % 5); s.uq = 0.75; break; }
        s.st = 'idle'; s.t = 0; s.ghost = 0;
        if (s.hp < s.maxHp) s.hp = Math.min(s.maxHp, s.hp + 8);
        break;
      }
    }
  }
  Nv.RUN.pesca = runBoat;
  // what the fishermen saw: a strange coast becomes a tale, told at the quay
  const CLAIMS = {
    ouro: ['pedras que brilham como ouro na beira d’água', 'uma praia de areia dourada que faísca ao sol'],
    ferro: ['rochas escuras e pesadas, que mancham a mão de ferrugem', 'penhascos de pedra preta'],
    pirita: ['pedras que brilham como ouro na beira d’água'],
    mata: ['mata fechada até a beira d’água', 'árvores enormes, mais altas que qualquer uma daqui'],
    bicho: ['focas aos montes nas pedras', 'pássaros aos milhares sobre os rochedos'],
    gelo: ['gelo boiando em volta e uma costa branca'],
    terra: ['uma costa comprida que ninguém daqui conhece', 'fumaça subindo atrás das dunas'],
  };
  Fi.landNews = function (s, crew) {
    const S = G.S; if (!G.Know || !s.news || !s.news.length) return;
    const who = crew[0]; const b = S.buildings.get(s.dock); const set = b && S.settlements.get(b.set);
    const keep = [];
    for (const it of s.news) {
      if (it.k !== 'r') { keep.push(it); continue; }
      const r = G.Know.reg(it.id); if (!r) continue;
      const ores = r.ores.map(id => (S.ores || []).find(o => o.id === id)).filter(Boolean);
      let kind = 'terra', claim, truth = { ok: true };
      const gold = ores.find(o => o.kind === 'ouro'), iron = ores.find(o => o.kind === 'ferro');
      if (gold) { kind = 'ouro'; claim = G.pick(CLAIMS.ouro); truth = { ok: true, what: 'ouro', ore: gold.id }; }
      else if (iron) { if (G.R() < 0.45) { kind = 'ouro'; claim = G.pick(CLAIMS.pirita); truth = { ok: false, what: 'ferro', ore: iron.id }; } else { kind = 'ferro'; claim = G.pick(CLAIMS.ferro); truth = { ok: true, what: 'ferro', ore: iron.id }; } }
      else if (r.rocky > r.n * 0.2 && G.R() < 0.25) { kind = 'ouro'; claim = G.pick(CLAIMS.pirita); truth = { ok: false, what: 'pirita' }; }
      else if (r.temp < 0.2) claim = G.pick(CLAIMS.gelo);
      else if (r.trees > r.n * 0.25) claim = G.pick(CLAIMS.mata);
      else claim = G.pick(CLAIMS.terra.concat(CLAIMS.bicho));
      const dir = set ? G.Know.dir(r.cx - set.cx, r.cy - set.cy) : '';
      const storm = s.drifted && S.day - s.drifted < 2;
      const nm = who ? who.name : 'Um pescador';
      const rm = G.Know.rumor({ kind, key: r.key, x: r.cx, y: r.cy, conf: storm ? G.rr(0.35, 0.55) : G.rr(0.5, 0.7), claim: `uma terra a ${dir}: ${claim}`, truth, origin: { who: who ? who.id : 0, what: storm ? 'tempestade' : 'pescador', set: set ? set.id : 0, fac: s.fac, dir }, first: s.fac,
        text: storm ? `${nm}, pescador${who && who.g === 'f' ? 'a' : ''} de ${set ? set.name : 'longe'}, voltou da tempestade jurando ter visto terra a ${dir}: ${claim}. Muitos riem. Alguns escutam.`
          : `Os pescadores de ${set ? set.name : 'um porto'} contam de uma terra a ${dir}, além de onde costumam lançar as redes: ${claim}.`, lx: s.x, ly: s.y });
      if (rm && who) G.Life && G.Life.bio(who, 'sawLand', dir, set ? set.name : '');
    }
    s.news = keep;
  };

  // ------------------------------ the shipyard ------------------------------
  Fi.slip = function (s, dt) {
    const S = G.S; const b = S.buildings.get(s.dock);
    if (!b || b.type !== 'doca') { Nv._remove(s); return; }
    if (!s.cls && s.kind === 'pesca') s.cls = pickCls(s);
    const need = (s.need || 0.3) * DAY();
    // (an army waiting on the quay lends its hands: the transports go up fast)
    const army = s.army && G.Wars && G.Wars.army(s.army); const levy = army && !army.done && army.phase === 'mobilizar' ? Math.min(4, army.members.length / 10) : 0;
    s.prog = Math.min(1, (s.prog || 0) + (dt * (0.6 + levy) + (s.work || 0) * 1.1) / need);
    s.work = 0; s.hp = Math.max(4, s.maxHp * s.prog);
    if (s.prog >= 1) {
      s.st = 'idle'; s.t = 0; s.hp = s.maxHp; s.prog = 1;
      G.FX && G.FX.splash(s.x, s.y, Nv.small(s) ? 0.6 : 1.3);
      const set = S.settlements.get(b.set);
      if (!Nv.small(s)) { log(`Em ${set ? set.name : 'um porto'}, os carpinteiros lançaram ao mar ${Nv.title(s)}${s.kind === 'guerra' ? ': mais um navio para a guerra' : s.kind === 'explorador' ? ', feito para ir longe' : ''}.`, 'naval', s.x, s.y); G.Audio && G.Audio.at(s.x, s.y, 'horn', false, 0.4); }
      G.Stories && G.Stories.signal('shipLaunched', { ship: s.id, fac: s.fac, kind: s.kind, x: s.x, y: s.y });
    }
  };

  // ------------------------------ update ------------------------------
  let tRoster = 0, tShoal = 0;
  let tGear = 0;
  Fi.update = function (dt) {
    tRoster -= dt; tShoal -= dt; tGear -= dt;
    if (tRoster <= 0) { tRoster = 4; rosters(); }
    // (the net goes back on its hook as soon as the work at sea is interrupted, not a while later)
    if (tGear <= 0) { tGear = 0.6; for (const v of G.S.villagers.values()) if (v.gear && !v.aboard && !(v.task && (FISHERS[v.task.type] || v.task.type === 'scene'))) v.gear = null; }
    // the shoals wander with the currents (and the spots that held fish go quiet)
    if (tShoal <= 0) {
      tShoal = 3; const S = G.S;
      for (const f of S.fish) { f.a = (f.a === undefined ? G.R() * TAU : f.a) + G.rr(-0.4, 0.4); const nx = f.x + Math.cos(f.a) * 0.25, ny = f.y + Math.sin(f.a) * 0.25; if (W.inb(nx, ny) && S.type[W.idx(nx, ny)] <= T.SEA) { f.x = nx; f.y = ny; } else f.a += Math.PI; }
      for (const b of S.buildings.values()) if (b.spots) for (const o of b.spots) o.p = Math.max(0, (o.p || 0) - 3 / DAY() * 1.2);
    }
  };

  // ------------------------------ the quay, drawn ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const crateE = new Map(), rackE = new Map();
  G.renderHooks.ents.push(function (add, view, zoom) {
    if (zoom < 0.5) return;
    for (const b of G.S.buildings.values()) {
      if (b.type !== 'doca' || !b.built) continue;
      if (b.crates && b.crates.length) { const p = crateSpot(b); let e = crateE.get(b.id); if (!e || e.b !== b) crateE.set(b.id, e = { b, fn: drawCrates }); add(p[0] + p[1] + 0.05, e, p[0], p[1]); }
      if (b._fishers) { const p = Fi.quaySpot(b, 14); let e = rackE.get(b.id); if (!e || e.b !== b) rackE.set(b.id, e = { b, fn: drawRack }); add(p[0] + p[1] - 0.2, e, p[0] - 0.4, p[1] - 0.3); }
    }
    if (crateE.size > 300) crateE.clear(); if (rackE.size > 300) rackE.clear();
  });
  function drawCrates(c, e, sx, sy) {
    const n = Math.min(10, e.b.crates.length);
    for (let k = 0; k < n; k++) {
      const col = k % 4, row = Math.floor(k / 4); const x = sx - 4 + col * 2.8 - row * 1.2, y = sy - row * 2.6 + (col % 2) * 0.6;
      c.fillStyle = '#8a6a44'; c.fillRect(x - 1.3, y - 2.2, 2.6, 2.2); c.fillStyle = '#6a4a2c'; c.fillRect(x - 1.3, y - 1.3, 2.6, 0.35);
      const cr = e.b.crates[k]; c.fillStyle = (cr && cr.col) || '#a8c0d0'; c.beginPath(); c.ellipse(x - 0.4, y - 2.3, 0.9, 0.35, 0.3, 0, TAU); c.fill();
    }
  }
  // two poles and a net hung to dry, a basket underneath
  function drawRack(c, e, sx, sy, t) {
    c.strokeStyle = '#6a4a2c'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(sx - 5, sy); c.lineTo(sx - 5, sy - 9); c.moveTo(sx + 5, sy + 1.5); c.lineTo(sx + 5, sy - 7.5); c.moveTo(sx - 5, sy - 8.6); c.lineTo(sx + 5, sy - 7.1); c.stroke();
    const sw = Math.sin(t * 1.4 + e.b.id) * 0.4;
    c.fillStyle = 'rgba(214,200,160,0.55)'; c.beginPath(); c.moveTo(sx - 4.8, sy - 8.4); c.lineTo(sx + 4.8, sy - 6.9); c.lineTo(sx + 4.2 + sw, sy - 2.6); c.quadraticCurveTo(sx, sy - 1 + sw, sx - 4.4 + sw, sy - 3.4); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,100,70,0.5)'; c.lineWidth = 0.25; for (let k = -4; k <= 4; k += 1.6) { c.beginPath(); c.moveTo(sx + k, sy - 8 + (k + 5) * 0.15); c.lineTo(sx + k + sw * 0.5, sy - 2.6); c.stroke(); }
    c.fillStyle = '#c8683a'; for (const k of [-3, 0, 3]) { c.beginPath(); c.arc(sx + k, sy - 2.8 + Math.abs(k) * 0.1, 0.5, 0, TAU); c.fill(); }
    c.fillStyle = '#a07040'; c.beginPath(); c.ellipse(sx + 6.5, sy + 1, 1.8, 1, 0, 0, TAU); c.fill();
  }

  // ------------------------------ save ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() {
      // boats that were out at the moment of the save head home (their crews are still aboard)
      for (const s of G.S.ships) {
        if (s.kind !== 'pesca') continue;
        if (s.st === 'out' || s.st === 'fish' || s.st === 'adrift') { const h = Nv._home(s); if (h && h.moor && Nv._sailTo(s, h.moor[0], h.moor[1])) s.st = 'back'; }
        if (s.st === 'back' && (!s.path || !s.path.length)) { const h = Nv._home(s); if (h && h.moor) Nv._sailTo(s, h.moor[0], h.moor[1]); }
      }
    },
  });
})(window.G);
