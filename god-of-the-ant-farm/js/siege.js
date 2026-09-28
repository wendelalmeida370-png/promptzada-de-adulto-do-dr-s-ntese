'use strict';
// ============================================================
//  Siege & the art of war: archers, elite units of each culture
//  (phalanx, legion, berserkers, chariots, eagle warriors),
//  city walls with gates that shut under attack, sieges with
//  battering rams and catapults, and Aztec sacrifices.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Sg = G.Siege = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const TAU = Math.PI * 2;
  const fid = v => G.Fac.idOfV(v);

  // ------------------------------ soldiers ------------------------------
  const ELITE = { grego: 'falange', romano: 'legiao', nordico: 'berserker', egipcio: 'carro', asteca: 'aguia' };
  const ELITE_TECH = { falange: 'bronze', legiao: 'bronze', berserker: null, carro: 'roda', aguia: null };
  const ARCH_SHARE = { egipcio: 0.4, asteca: 0.35, nordico: 0.2, grego: 0.2, romano: 0.25 };
  Sg.ELITE_NAME = { falange: ['Hoplita da Falange', 'Hoplita da Falange'], legiao: ['Legionário Veterano', 'Legionária Veterana'], berserker: ['Berserker', 'Berserker'], carro: ['Auriga de Carro', 'Auriga de Carro'], aguia: ['Guerreiro-Águia', 'Guerreira-Águia'] };
  const ELITE_INTRO = {
    falange: f => `Os hoplitas de ${f.name} aprenderam a lutar em falange: escudo com escudo, lança com lança.`,
    legiao: f => `${f.name} forma suas primeiras legiões: disciplina, armadura e o escudo retangular.`,
    berserker: f => `No salão dos guerreiros de ${f.name}, os primeiros berserkers vestem peles de urso e uivam para a batalha.`,
    carro: f => `${f.name} atrelou cavalos aos primeiros carros de guerra. A infantaria inimiga treme.`,
    aguia: f => `Os guerreiros mais bravos de ${f.name} foram aceitos na ordem dos Guerreiros-Águia.`,
  };
  function equip() {
    const S = G.S;
    const byFac = new Map();
    for (const v of S.villagers.values()) { if (v.role !== 'guerreiro' || v.captive || v.age < 16) { if (v.arm || v.elite) { v.arm = null; v.elite = null; } continue; } const f = fid(v); if (!byFac.has(f)) byFac.set(f, []); byFac.get(f).push(v); }
    for (const [fId, ws] of byFac) {
      const f = G.Fac.get(fId); if (!f) continue;
      const arco = G.Civ.has(fId, 'arco');
      const el = ELITE[f.civ]; const elOK = !!el && G.War.armory.has(fId) && (!ELITE_TECH[el] || G.Civ.has(fId, ELITE_TECH[el]));
      for (const v of ws) { if (!arco && v.arm) v.arm = null; if (!elOK && v.elite) v.elite = null; if (v.arm && v.elite) v.elite = null; }
      const n = ws.length;
      const tA = arco ? Math.round(n * (ARCH_SHARE[f.civ] || 0.25)) : 0;
      const tE = elOK ? Math.round(n * 0.3) : 0;
      let a = ws.filter(v => v.arm === 'arco').length, e = ws.filter(v => v.elite).length;
      const free = ws.filter(v => !v.arm && !v.elite);
      free.sort((x, y) => x.courage - y.courage);
      while (a < tA && free.length) { free.shift().arm = 'arco'; a++; }
      free.sort((x, y) => (y.kills || 0) * 0.3 + y.courage - ((x.kills || 0) * 0.3 + x.courage));
      let fresh = false;
      while (e < tE && free.length) { free.shift().elite = el; e++; fresh = true; }
      if (fresh && !(f._elites || {})[el]) { (f._elites = f._elites || {})[el] = G.S.day; const cap = G.Fac.capitalOf(fId); log(ELITE_INTRO[el](f), 'war', cap ? cap.cx : undefined, cap ? cap.cy : undefined); G.Lore && G.Lore.note('elite', { fac: fId, kind: el }); }
    }
  }
  Sg.unitName = function (v) {
    if (v.role !== 'guerreiro') return null;
    const k = v.g === 'f' ? 1 : 0; const c = G.CIVS[G.Civ.idOfFac(fid(v))];
    if (v.arm === 'arco') return c ? c.units.arqueiro[k] : ['Arqueiro', 'Arqueira'][k];
    if (v.elite) return Sg.ELITE_NAME[v.elite][k];
    return c ? c.units.guerreiro[k] : null;
  };
  // an arrow loosed at a foe
  Sg.shoot = function (v, o, t, b) {
    const S = G.S;
    G.FX && G.FX.arrow(v.x, v.y, o.x, o.y);
    G.Audio && G.Audio.at(v.x, v.y, 'swish');
    let hit = 0.55 + (G.Civ.has(fid(v), 'bronze') ? 0.05 : 0);
    if (o.elite === 'falange' || o.elite === 'legiao') hit -= 0.2;
    if (G.R() > hit) return;
    let dmg = 9 * G.Civ.t(fid(v), 'war') * (G.Civ.has(fid(v), 'ferro') ? 1.15 : 1) * G.rr(0.8, 1.2);
    o.hurt = 0.3;
    G.Vg.damage(o, dmg, 'arrow', false, v.id);
    if (!S.villagers.has(o.id)) {
      v.kills = (v.kills || 0) + 1; if (b) b.kills++;
      const f = G.Fac.get(fid(v)); if (f) f.st.kills++;
      if (t) t.foe = 0;
      return;
    }
    G.War.react(o, v);
  };

  // ------------------------------ walls ------------------------------
  const WALLHP = { madeira: [70, 90], pedra: [170, 220] };
  Sg.wallOf = sid => G.S.walls.find(w => w.set === sid) || null;
  function perimeter(x0, y0, x1, y1) {
    const out = [];
    for (let x = x0; x <= x1; x++) out.push([x, y0]);
    for (let y = y0 + 1; y <= y1; y++) out.push([x1, y]);
    for (let x = x1 - 1; x >= x0; x--) out.push([x, y1]);
    for (let y = y1 - 1; y > y0; y--) out.push([x0, y]);
    return out;
  }
  function planWall(s, f) {
    const S = G.S;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0;
    for (const b of S.buildings.values()) {
      if (b.set !== s.id || b.type === 'farm' || b.type === 'cemetery' || b.type === 'doca' || b.type === 'ruin' || b.type === 'cercado') continue;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w - 1); y1 = Math.max(y1, b.y + b.h - 1); n++;
    }
    if (n < 5) return null;
    x0 -= 2; y0 -= 2; x1 += 2; y1 += 2;
    if (x0 < 2 || y0 < 2 || x1 > N - 3 || y1 > N - 3) { x0 = Math.max(2, x0); y0 = Math.max(2, y0); x1 = Math.min(N - 3, x1); y1 = Math.min(N - 3, y1); }
    if (x1 - x0 > 30 || y1 - y0 > 30 || x1 - x0 < 5 || y1 - y0 < 5) return null;
    const tiles = [], gates = [];
    const per = perimeter(x0, y0, x1, y1);
    for (const [x, y] of per) {
      const i = y * N + x;
      if (S.type[i] < T.SAND || S.wall[i] === 3) continue;
      if (S.occ[i]) { const b = S.buildings.get(S.occ[i]); if (b && (b.blocks || b.type === 'praca')) continue; }
      tiles.push(i);
      if (S.road[i] || S.wear[i] > 22) gates.push(i);
    }
    if (tiles.length < 12) return null;
    // at least one gate on each side, where the people already walk
    const sides = [[x0, null], [x1, null], [null, y0], [null, y1]];
    for (const [sx, sy] of sides) {
      const on = tiles.filter(i => (sx !== null ? i % N === sx : ((i / N) | 0) === sy));
      if (!on.length || on.some(i => gates.includes(i))) continue;
      let best = on[0], bs = -1; for (const i of on) if (S.wear[i] > bs) { bs = S.wear[i]; best = i; }
      if (bs < 3) best = on[Math.floor(on.length / 2)];
      gates.push(best);
    }
    // gates are never side by side
    gates.sort((a, b) => S.wear[b] + (S.road[b] ? 40 : 0) - (S.wear[a] + (S.road[a] ? 40 : 0)));
    const g2 = []; for (const i of gates) if (g2.length < 4 && !g2.some(j => Math.abs((j % N) - (i % N)) + Math.abs(((j / N) | 0) - ((i / N) | 0)) < 4)) g2.push(i);
    return { id: S.nextId++, set: s.id, fac: f.id, mat: G.Civ.has(f.id, 'alvenaria') ? 'pedra' : 'madeira', tiles, gates: g2, built: 0, done: false, style: f.civ || 'classico', box: [x0, y0, x1, y1] };
  }
  // walls raised at once (used by the gods, and by tests)
  Sg.raiseWalls = function (s, mat, instant) {
    const S = G.S; const f = G.Fac.get(s.fac); if (!f) return null;
    if (Sg.wallOf(s.id)) return Sg.wallOf(s.id);
    const w = planWall(s, f); if (!w) return null;
    if (mat) w.mat = mat;
    S.walls.push(w);
    if (instant) for (const i of w.tiles) { if (S.wall[i] || (S.occ[i] && (S.buildings.get(S.occ[i]) || {}).blocks)) continue; const gate = w.gates.includes(i); S.wall[i] = gate ? 2 : 1; S.wallFac[i] = f.id; S.wallHp[i] = WALLHP[w.mat][gate ? 1 : 0]; }
    if (instant) { w.built = w.tiles.length; w.done = true; }
    return w;
  };
  function considerWalls() {
    const S = G.S;
    for (const s of S.settlements.values()) {
      if (Sg.wallOf(s.id)) continue;
      const f = G.Fac.get(s.fac); if (!f) continue;
      const tier = s.tier || 0; if (tier < 2) continue;
      const war = G.Fac.enemiesOf(f.id).length > 0;
      const threatened = (s.attacked || 0) > 0 || (war && tier >= 2);
      const proud = tier >= 3 && (f.civ === 'romano' || f.civ === 'grego' || G.Politics.leaderPe(f).agg > 0.6);
      if (!threatened && !proud) continue;
      const stone = G.Civ.has(f.id, 'alvenaria');
      if ((stone ? f.stock.stone : f.stock.wood) < 50) continue;
      if (G.R() > 0.3) continue;
      const w = planWall(s, f); if (!w) { s.attacked = 0; continue; }
      S.walls.push(w);
      log(`${s.name} começou a erguer ${w.mat === 'pedra' ? 'muralhas de pedra' : 'uma paliçada de troncos'} ao redor da cidade.`, 'wall', s.cx, s.cy);
      return;
    }
  }
  function buildWalls(dt) {
    const S = G.S;
    for (const w of S.walls) {
      if (w.done) continue;
      const s = S.settlements.get(w.set), f = G.Fac.get(w.fac);
      if (!s || !f || s.fac !== w.fac) { w.done = true; continue; }
      const k = w.mat === 'pedra' ? 'stone' : 'wood';
      if (f.stock[k] < 3 || G.R() > 0.35) continue;
      const i = w.tiles[w.built++];
      if (i !== undefined && !S.wall[i] && !(S.occ[i] && (S.buildings.get(S.occ[i]) || {}).blocks)) {
        f.stock[k] -= 2;
        const gate = w.gates.includes(i);
        S.wall[i] = gate ? 2 : 1; S.wallFac[i] = f.id; S.wallHp[i] = WALLHP[w.mat][gate ? 1 : 0];
        const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
        G.FX && G.FX.dust(x, y, 2);
        // nobody stays buried inside the new wall
        for (const v of S.villagers.values()) if (W.idx(v.x, v.y) === i && !v.aboard) { const p = W.nearestLand(v.x, v.y, 3); if (p) { v.x = p[0]; v.y = p[1]; v.path = null; } }
      }
      if (w.built >= w.tiles.length) {
        w.done = true;
        log(`${G.cap(w.mat === 'pedra' ? 'as muralhas' : 'a paliçada')} de ${s.name} ${w.mat === 'pedra' ? 'estão prontas' : 'está pronta'}: ${w.gates.length} ${w.gates.length > 1 ? 'portões' : 'portão'} guardam a cidade.`, 'wall', s.cx, s.cy);
        G.Village.milestone('firstWall', 'Muralhas', `${s.name} está cercada de ${w.mat === 'pedra' ? 'pedra' : 'madeira'}.`, 'wall');
        G.Lore && G.Lore.note('wall', { set: s.id, fac: f.id, mat: w.mat });
      }
    }
  }
  function gatesTick() {
    const S = G.S;
    for (const w of S.walls) {
      const s = S.settlements.get(w.set);
      const shut = !!s && (s.alarmT || 0) > 0 && s.fac === w.fac;
      for (const i of w.gates) {
        if (S.wall[i] !== 2 && S.wall[i] !== 4) continue;
        const want = shut ? 4 : 2;
        if (S.wall[i] !== want) S.wall[i] = want;
      }
      w.shut = shut;
    }
  }
  // gates and wall towers have archers once the bow is known
  function wallArchers(dt) {
    const S = G.S;
    for (const w of S.walls) {
      if (!w.shut || !G.Civ.has(w.fac, 'arco')) continue;
      w.cd = (w.cd || 0) - dt; if (w.cd > 0) continue;
      w.cd = 2.2;
      for (const i of w.gates) {
        if (S.wall[i] !== 4) continue;
        const tx = (i % N) + 0.5, ty = ((i / N) | 0) + 0.5;
        let e = null, bd = 42;
        for (const o of G.War.fighters) { if (o.captive || o.inside || !G.Fac.atWar(w.fac, fid(o))) continue; const d = G.dist2(tx, ty, o.x, o.y); if (d < bd) { bd = d; e = o; } }
        if (!e) continue;
        G.FX && G.FX.arrow(tx, ty, e.x, e.y);
        if (G.R() < 0.5) { e.hurt = 0.3; G.Vg.damage(e, 10, 'arrow', false, 0); if (!S.villagers.has(e.id)) { const f = G.Fac.get(w.fac); if (f) f.st.kills++; } }
      }
    }
  }
  Sg.damageWall = function (i, dmg, by) {
    const S = G.S; if (!S.wall[i] || S.wall[i] === 3) return false;
    S.wallHp[i] = (S.wallHp[i] || 50) - dmg;
    const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
    if (G.R() < 0.4) G.FX && G.FX.chips(x, y, '#a8a090');
    if (S.wallHp[i] > 0) return false;
    const gate = S.wall[i] === 2 || S.wall[i] === 4;
    S.wall[i] = 0; delete S.wallHp[i];
    G.FX && G.FX.collapse(x, y, { w: 1, h: 1, type: 'ruin' });
    G.Audio && G.Audio.at(x, y, 'collapse', true);
    const w = S.walls.find(q => q.tiles.includes(i)); const s = w && S.settlements.get(w.set);
    if (s && (!w.breachDay || S.day - w.breachDay > 1)) { w.breachDay = S.day; log(gate ? `O portão de ${s.name} foi arrombado!` : `Os muros de ${s.name} cederam: há uma brecha!`, 'siege', x, y); if (G.UI && (G.UI.viewFac === s.fac || (by && G.UI.viewFac === by))) G.UI.notice(gate ? `Portão de ${s.name} arrombado!` : `Brecha nos muros de ${s.name}!`, 'siege'); }
    return true;
  };

  // ------------------------------ sieges ------------------------------
  function nearestWallTile(w, x, y) {
    const S = G.S; let best = -1, bd = 1e9;
    for (const i of w.tiles) { if (!S.wall[i] || S.wall[i] === 3) continue; const d = G.dist(x, y, (i % N) + 0.5, ((i / N) | 0) + 0.5) - (w.gates.includes(i) ? 2.5 : 0); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  // called every half second for a band attacking a settlement
  Sg.bandSiege = function (b, set, dt) {
    const S = G.S; const w = Sg.wallOf(set.id);
    if (!w || w.fac !== set.fac) { b.siege = null; return; }
    b.sgT = (b.sgT || 0) - dt;
    if (b.sgT > 0) return;
    b.sgT = 3;
    // can the band walk into the town?
    const lead = b.members.map(id => S.villagers.get(id)).find(Boolean); if (!lead) return;
    const open = W.findPath(lead.x, lead.y, set.cx, set.cy, true, N * N);
    if (open && (!b.siege || !S.wall[b.siege.i])) { if (b.siege) { b.siege = null; } return; }
    if (b.siege && S.wall[b.siege.i]) return;
    const i = nearestWallTile(w, lead.x, lead.y); if (i < 0) { b.siege = null; return; }
    const first = !b.siege;
    b.siege = { i, x: (i % N) + 0.5, y: ((i / N) | 0) + 0.5 };
    if (first) {
      const f = G.Fac.get(b.fac);
      log(`${f.name} cercou ${set.name}. Os portões estão fechados.`, 'siege', set.cx, set.cy);
      // engineers build siege engines
      if (f && G.Civ.has(f.id, 'engenharia') && !b.engines) {
        b.engines = [];
        if (f.stock.wood >= 25) { f.stock.wood -= 20; b.engines.push({ id: S.nextId++, kind: 'ariete', x: lead.x, y: lead.y, cd: 2, hp: 90, band: b.id, fac: f.id, civ: f.civ }); }
        if (f.stock.wood >= 30 && f.stock.stone >= 10 && f.civ !== 'nordico' && f.civ !== 'asteca') { f.stock.wood -= 25; f.stock.stone -= 10; b.engines.push({ id: S.nextId++, kind: 'catapulta', x: lead.x, y: lead.y, cd: 4, hp: 70, band: b.id, fac: f.id, civ: f.civ }); }
        if (b.engines.length) log(`${f.name} ergueu ${b.engines.map(e => e.kind === 'ariete' ? 'um aríete' : 'uma catapulta').join(' e ')} diante de ${set.name}.`, 'siege', lead.x, lead.y);
      }
    }
  };
  // a soldier's part in the siege: hack at the gate
  Sg.siegeActions = function (v, t, b, dt, H) {
    const sg = b.siege; if (!sg) return false;
    const S = G.S;
    if (!S.wall[sg.i]) { b.siege = null; return false; }
    if (v.arm === 'arco') return false; // archers keep shooting at whoever shows up
    const d = G.dist(v.x, v.y, sg.x, sg.y);
    if (d > 1.25) {
      t.sgr = (t.sgr || 0) - dt;
      if (t.sgr <= 0 || H.arrived(v)) { t.sgr = 1.2; if (!H.goto(v, sg.x + G.rr(-0.4, 0.4), sg.y + G.rr(-0.4, 0.4), true, N * N)) return false; }
      H.move(v, dt, 1); v.act = '';
      return true;
    }
    v.path = null; v.moving = false; v.act = 'fight';
    v.face = (sg.x - sg.y) - (v.x - v.y) > 0 ? 1 : -1;
    t.cd = (t.cd || 0) - dt; if (t.cd > 0) return true;
    t.cd = 1.1;
    G.Audio && G.Audio.at(sg.x, sg.y, 'hit');
    if (Sg.damageWall(sg.i, (v.elite ? 8 : 5) * G.Civ.t(b.fac, 'war'), b.fac)) b.siege = null;
    return true;
  };
  function enginesTick(dt) {
    const S = G.S;
    for (const b of G.War.bands.values()) {
      if (!b.engines || !b.engines.length) continue;
      const set = S.settlements.get(b.set);
      for (const e of b.engines) {
        e.cd -= dt;
        const tgt = b.siege;
        if (e.kind === 'ariete') {
          if (!tgt) continue;
          const d = G.dist(e.x, e.y, tgt.x, tgt.y);
          if (d > 1.1) { const sp = 0.7 * dt; e.x += (tgt.x - e.x) / d * sp; e.y += (tgt.y - e.y) / d * sp; e.face = (tgt.x - tgt.y) - (e.x - e.y) > 0 ? 1 : -1; e.moving = true; }
          else if (e.cd <= 0) { e.cd = 2.2; e.moving = false; e.hit = 0.4; G.Audio && G.Audio.at(e.x, e.y, 'collapse'); G.Render && G.Render.shake(0.02); if (Sg.damageWall(tgt.i, 34, b.fac)) b.siege = null; }
        } else {
          // catapults stand back and hurl stones over the walls
          const aim = tgt ? [tgt.x, tgt.y] : set ? [set.cx, set.cy] : null; if (!aim) continue;
          const d = G.dist(e.x, e.y, aim[0], aim[1]);
          if (d > 7.5) { const sp = 0.5 * dt; e.x += (aim[0] - e.x) / d * sp; e.y += (aim[1] - e.y) / d * sp; e.face = (aim[0] - aim[1]) - (e.x - e.y) > 0 ? 1 : -1; continue; }
          if (e.cd > 0) continue;
          e.cd = 4.5; e.fire = 0.5;
          let tx = aim[0], ty = aim[1], hitB = null;
          if (!tgt && set) { const bs = [...S.buildings.values()].filter(o => o.set === set.id && o.built && o.type !== 'ruin' && o.type !== 'farm'); if (bs.length) { hitB = G.pick(bs); tx = hitB.x + hitB.w / 2; ty = hitB.y + hitB.h / 2; } }
          S.missiles.push({ x0: e.x, y0: e.y, x1: tx + G.rr(-0.6, 0.6), y1: ty + G.rr(-0.6, 0.6), t: 0, dur: 1.4, wall: tgt ? tgt.i : -1, b: hitB ? hitB.id : 0, fac: b.fac });
        }
      }
    }
  }
  function missilesTick(dt) {
    const S = G.S;
    for (let k = S.missiles.length - 1; k >= 0; k--) {
      const m = S.missiles[k]; m.t += dt;
      if (m.t < m.dur) continue;
      S.missiles.splice(k, 1);
      G.FX && G.FX.dust(m.x1, m.y1, 6); G.Audio && G.Audio.at(m.x1, m.y1, 'meteor');
      if (m.wall >= 0 && S.wall[m.wall]) Sg.damageWall(m.wall, 40, m.fac);
      const bd = m.b && S.buildings.get(m.b); if (bd) G.Village.damageBuilding(bd, 28, 'siege');
      for (const v of S.villagers.values()) if (G.dist2(v.x, v.y, m.x1, m.y1) < 0.8 && !v.inside) G.Vg.damage(v, 30, 'war', false, 0);
    }
  }

  // ------------------------------ sacrifices ------------------------------
  function considerSacrifice() {
    const S = G.S;
    for (const f of G.Fac.all()) {
      if (!G.Civ.t(f.id, 'sacrifice', 0) || f.sac || f.law === 'paz') continue;
      let temple = null; for (const b of S.buildings.values()) if ((b.type === 'temple' || b.type === 'maravilha') && b.built && G.Village.facOfSet(b.set) === f.id) { temple = b; if (b.type === 'maravilha') break; }
      if (!temple) continue;
      const caps = [...S.villagers.values()].filter(v => v.captive && v.age >= 14 && fid(v) === f.id && (!v.task || (v.task.type !== 'escorted' && v.task.type !== 'escape' && v.task.type !== 'aboard')));
      if (!caps.length) continue;
      const pe = G.Politics.leaderPe(f);
      if (G.R() > 0.18 + pe.pie * 0.25 + (G.Fac.enemiesOf(f.id).length ? 0.1 : 0)) continue;
      const v = G.pick(caps);
      const [fx, fy] = G.Village.frontTile(temple);
      G.Vg.endTask(v);
      G.Vg.setTask(v, { type: 'condemned', x: fx, y: fy, pri: 6, kind: 'condemned' });
      f.sac = { id: v.id, b: temple.id, t: 0 };
      return;
    }
  }
  function sacrificeTick(dt) {
    const S = G.S;
    for (const f of G.Fac.all()) {
      const sc = f.sac; if (!sc) continue;
      const v = S.villagers.get(sc.id), tb = S.buildings.get(sc.b);
      if (!v || !tb || !v.captive || fid(v) !== f.id) { f.sac = null; continue; }
      sc.t += dt;
      if (v.task && v.task.type === 'condemned' && v.task.st === 2 && sc.t > 5) {
        const [cx, cy] = G.Village.center(tb);
        const from = G.Fac.get(v.captive.from);
        const gain = 8 + Math.round(v.age / 8);
        G.FX && G.FX.ring(cx, cy, 0.2, 2.5, 1.4, 'rgba(220,40,30,0.9)', 2, true);
        for (let k = 0; k < 14; k++) G.FX && G.FX.spawn({ x: cx + G.rr(-0.3, 0.3), y: cy + G.rr(-0.3, 0.3), z: 30, vz: G.rr(20, 50), vx: G.rr(-0.4, 0.4), vy: G.rr(-0.4, 0.4), g: -8, life: G.rr(0.8, 1.6), s0: 1.2, s1: 0.2, c: '#ff7040', k: 4, layer: 1 });
        const name = v.name, age = Math.floor(v.age);
        G.Village.kill(v, 'sacrifice', false);
        S.faith = Math.min(999, S.faith + gain);
        for (const o of S.villagers.values()) if (fid(o) === f.id && !o.captive) { o.devotion = Math.min(100, o.devotion + 2); o.fear = Math.min(100, o.fear + 1); }
        for (const o of G.Fac.all()) { if (o.id === f.id) continue; const r = G.Fac.rel(f.id, o.id); if (r && r.met && o.civ !== 'asteca') { r.op -= o.id === (from && from.id) ? 12 : 4; if (o.id === (from && from.id)) r.grudge = Math.min(100, r.grudge + 12); } }
        f.st.sacrifices = (f.st.sacrifices || 0) + 1;
        const tn = G.Village.buildName(tb);
        log(`No alto d${G.gen(tn)} ${tn}, ${name}${from ? ', cativ' + (v.g === 'f' ? 'a' : 'o') + ' de ' + from.name + ',' : ''} foi oferecid${v.g === 'f' ? 'a' : 'o'} em sacrifício aos deuses. (+${gain} de fé)`, 'sacrifice', cx, cy);
        if (!S.milestones.sacrifice) G.Village.milestone('sacrifice', 'Sacrifício', `${f.name} oferece sangue aos deuses — e a você.`, 'sacrifice');
        G.Lore && G.Lore.note('sacrifice', { fac: f.id, name, age });
        f.sac = null;
      } else if (sc.t > 90) { if (v.task && v.task.type === 'condemned') G.Vg.endTask(v); f.sac = null; }
    }
  }

  // ------------------------------ update ------------------------------
  let tEq = 0, tWall = 0, tGate = 0, tSac = 0;
  Sg.reset = function () { tEq = 1; tWall = 5; tGate = 0; tSac = 10; };
  Sg.update = function (dt) {
    tEq -= dt; tWall -= dt; tGate -= dt; tSac -= dt;
    if (tEq <= 0) { tEq = 4; equip(); }
    if (tWall <= 0) { tWall = 20; considerWalls(); }
    if (tGate <= 0) { const d = 0.5 - tGate; tGate = 0.5; gatesTick(); wallArchers(d); }
    buildWalls(dt);
    enginesTick(dt); missilesTick(dt);
    if (tSac <= 0) { tSac = 25; considerSacrifice(); }
    sacrificeTick(dt);
  };
  // the engines leave with their band
  Sg.onDisband = function (b) { b.engines = null; };

  // ------------------------------ drawing ------------------------------
  const P = (dx, dy, z) => [(dx - dy) * 16, (dx + dy) * 8 - (z || 0)];
  function poly(c, pts, fill) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.fillStyle = fill; c.fill(); }
  function box(c, x0, y0, x1, y1, z0, z1, cl, cr, ct) {
    poly(c, [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], cl);
    poly(c, [P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1)], cr);
    poly(c, [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], ct);
  }
  const STONE = { classico: ['#c4bdae', '#9e978a', '#d6d0c2'], grego: ['#ece6d8', '#c8c0ac', '#f6f2e8'], romano: ['#d2bf9c', '#aa987a', '#e0d0b0'], egipcio: ['#e4cd9e', '#c0a878', '#eedcb4'], asteca: ['#e4dac4', '#c2b69c', '#f0e8d6'], nordico: ['#a09a90', '#7e786e', '#b4aea4'] };
  const WOOD = ['#8a6a44', '#6a4e30', '#9a7a52'];
  Sg.wallSprite = function (d, st, mat, gate, shut, dmg) {
    const key = 'wall-' + d + st + mat + (gate ? (shut ? 'G' : 'g') : '') + (dmg ? 'd' : '');
    return G.Art.sprite(key, 48, 56, 24, 42, (c) => {
      const col = mat === 'madeira' ? WOOD : (STONE[st] || STONE.classico);
      const cl = dmg ? G.rgb(G.hex2rgb(col[0]).map(v => v * 0.8)) : col[0], cr = dmg ? G.rgb(G.hex2rgb(col[1]).map(v => v * 0.8)) : col[1];
      const H = mat === 'madeira' ? 11 : 13;
      if (mat === 'madeira' && !gate) {
        // palisade of sharpened logs
        const stakes = d === 'c' ? [[0, 0]] : Array.from({ length: 6 }, (_, k) => d === 'x' ? [-0.5 + (k + 0.5) / 6, 0] : [0, -0.5 + (k + 0.5) / 6]);
        for (const [x, y] of stakes) {
          box(c, x - 0.07, y - 0.07, x + 0.07, y + 0.07, 0, H + (d === 'c' ? 4 : 0), cl, cr, col[2]);
          const tp = P(x, y, H + 3 + (d === 'c' ? 4 : 0)); poly(c, [P(x - 0.07, y + 0.07, H + (d === 'c' ? 4 : 0)), P(x + 0.07, y + 0.07, H + (d === 'c' ? 4 : 0)), tp], cl); poly(c, [P(x + 0.07, y + 0.07, H + (d === 'c' ? 4 : 0)), P(x + 0.07, y - 0.07, H + (d === 'c' ? 4 : 0)), tp], cr);
        }
        return;
      }
      if (d === 'c' && !gate) {
        box(c, -0.3, -0.3, 0.3, 0.3, 0, H + 7, cl, cr, col[2]);
        for (const [x, y] of [[-0.3, 0.3], [0, 0.3], [0.3, 0.3], [0.3, 0], [0.3, -0.3]]) box(c, x - 0.06, y - 0.06, x + 0.06, y + 0.06, H + 7, H + 9.5, cl, cr, col[2]);
        if (st === 'asteca') box(c, -0.3, -0.3, 0.3, 0.3, H + 4, H + 5.5, '#b33a2a', '#8a2a20', '#b33a2a');
        return;
      }
      const X = d === 'x';
      const seg = (a0, a1, z0, z1) => X ? box(c, a0, -0.14, a1, 0.14, z0, z1, cl, cr, col[2]) : box(c, -0.14, a0, 0.14, a1, z0, z1, cl, cr, col[2]);
      if (gate) {
        seg(-0.5, -0.26, 0, H + 5); seg(0.26, 0.5, 0, H + 5);
        seg(-0.26, 0.26, 9, H + 3);
        const door = shut ? (mat === 'madeira' ? '#6a4526' : '#7a5230') : 'rgba(30,22,16,0.85)';
        if (X) poly(c, [P(-0.26, 0.15, 0), P(0.26, 0.15, 0), P(0.26, 0.15, 9), P(-0.26, 0.15, 9)], door);
        else poly(c, [P(0.15, -0.26, 0), P(0.15, 0.26, 0), P(0.15, 0.26, 9), P(0.15, -0.26, 9)], door);
        if (shut) { c.strokeStyle = 'rgba(40,25,10,0.6)'; c.lineWidth = 0.5; for (let k = 1; k < 4; k++) { const a = -0.26 + 0.52 * k / 4; const p0 = X ? P(a, 0.15, 0) : P(0.15, a, 0), p1 = X ? P(a, 0.15, 9) : P(0.15, a, 9); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); } }
        for (const a of [-0.38, 0.38]) { const q = X ? [a, 0] : [0, a]; box(c, q[0] - 0.08, q[1] - 0.08, q[0] + 0.08, q[1] + 0.08, H + 5, H + 7, cl, cr, col[2]); }
        return;
      }
      seg(-0.5, 0.5, 0, H);
      for (let k = 0; k < 4; k++) { const a = -0.5 + k * 0.27; seg(a, a + 0.13, H, H + 2.4); }
      if (st === 'asteca' && mat === 'pedra') { if (X) box(c, -0.5, 0.14, 0.5, 0.15, H - 3, H - 1.8, '#b33a2a', '#8a2a20', '#b33a2a'); else box(c, 0.14, -0.5, 0.15, 0.5, H - 3, H - 1.8, '#8a2a20', '#8a2a20', '#b33a2a'); }
      c.strokeStyle = 'rgba(0,0,0,0.1)'; c.lineWidth = 0.35;
      for (let z = 3; z < H; z += 3) { const p0 = X ? P(-0.5, 0.14, z) : P(0.14, -0.5, z), p1 = X ? P(0.5, 0.14, z) : P(0.14, 0.5, z); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); }
    });
  };
  Sg.drawEngine = function (ctx, e, sx, sy, t) {
    ctx.save(); ctx.translate(sx, sy); ctx.scale(e.face || 1, 1);
    ctx.fillStyle = 'rgba(20,30,20,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, TAU); ctx.fill();
    if (e.kind === 'ariete') {
      const push = e.hit > 0 ? Math.sin((0.4 - e.hit) / 0.4 * Math.PI) * 3 : 0;
      ctx.fillStyle = '#4a3020'; for (const x of [-5, 4]) { ctx.beginPath(); ctx.arc(x, -2, 2.2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6e4a2c'; ctx.fillRect(-8, -9, 15, 6);
      ctx.fillStyle = '#8a6a44'; ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(0, -15); ctx.lineTo(8, -9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(-6 + push, -6.5, 17, 2.2); ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.arc(11 + push, -5.4, 1.8, 0, TAU); ctx.fill();
    } else {
      const arm = e.fire > 0 ? -1.3 + (0.5 - e.fire) * 4 : -0.3;
      ctx.fillStyle = '#4a3020'; for (const x of [-5, 5]) { ctx.beginPath(); ctx.arc(x, -1.8, 2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6e4a2c'; ctx.fillRect(-7, -5, 14, 3); ctx.fillRect(-1, -11, 2, 7);
      ctx.save(); ctx.translate(0, -10); ctx.rotate(arm); ctx.fillStyle = '#8a6a44'; ctx.fillRect(-10, -0.8, 12, 1.6); ctx.fillStyle = '#9a958c'; ctx.beginPath(); ctx.arc(-10, -1.5, 1.5, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  };
  // flying stones
  Sg.drawMissiles = function (ctx, proj) {
    const S = G.S; if (!S.missiles || !S.missiles.length) return;
    for (const m of S.missiles) {
      const f = m.t / m.dur; const x = m.x0 + (m.x1 - m.x0) * f, y = m.y0 + (m.y1 - m.y0) * f;
      const p = proj(x, y, W.groundH(x, y)); const z = Math.sin(f * Math.PI) * 60;
      ctx.fillStyle = '#6a645a'; ctx.beginPath(); ctx.arc(p[0], p[1] - z - 4, 2.2, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(20,20,20,0.2)'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 2.5, 1, 0, 0, TAU); ctx.fill();
    }
  };
  Sg.wallDir = function (i) {
    const S = G.S; const x = i % N, y = (i / N) | 0;
    const isW = j => { const w = S.wall[j]; return w === 1 || w === 2 || w === 4; };
    const h = (x > 0 && isW(i - 1)) || (x < N - 1 && isW(i + 1));
    const v = (y > 0 && isW(i - N)) || (y < N - 1 && isW(i + N));
    return h && v ? 'c' : h ? 'x' : v ? 'y' : 'c';
  };

  // ------------------------------ save ------------------------------
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { const S = G.S; out.walls = S.walls; out.wallHp = S.wallHp; out.sacr = G.Fac.all().filter(f => f.sac).length; },
    load(o) { const S = G.S; S.walls = o.walls || []; S.wallHp = o.wallHp || {}; S.missiles = []; for (const f of S.factions.values()) f.sac = null; Sg.reset(); },
  });
})(window.G);
