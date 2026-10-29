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
    if (G.Army) dmg *= G.Army.dmgMul(v, o, true);
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
  // (the ground inside another town's walls is walled already — an older wall, standing or still going up —: a wall of the
  // town next door run inside it shuts a pocket between the two with no gate of either — Corinto's east wall inside Argos's,
  // in the metropole of 28/10: three houses of Argos in a strip of 4 by 10, their people with no way home, L-342)
  Sg.walledIn = function (i, w) {
    const S = G.S; const x = i % N, y = (i / N) | 0;
    for (const o of S.walls) {
      if (o === w || o.set === w.set || o.id > w.id) continue;
      const [x0, y0, x1, y1] = o.box; if (x <= x0 || x >= x1 || y <= y0 || y >= y1) continue;
      if (!o.done || o.tiles.some(j => S.wall[j] && S.wall[j] !== 3)) return true;
    }
    return false;
  };
  // (no building of the town shut off by its own wall: a forge on a strip between the water and the wall line, its only way
  // into the town through what the wall closes — Hedeby's in the mega of 28/10, its smith in failed searches all day, four
  // gates and none there —: where the wall would shut one off, a gate, beyond the four (w.ways), L-344. The wall as planned:
  // its tiles shut, its gates open, whether raised yet or not. dry: only the tiles it would open)
  Sg.openWays = function (s, w, dry) {
    const S = G.S, n = N * N; const R = W.townRegion(s); if (R < 0) return [];
    const L = W.reachIds(true); const plan = new Set(w.tiles); const gates = new Set(w.gates); const out = [];
    const pass = i => W.ground(i) && (plan.has(i) ? gates.has(i) : W.wallOpen(S.wall[i]));
    let seed = -1; for (let r = 0; r <= 10 && seed < 0; r++) for (let dy = -r; dy <= r && seed < 0; dy++) for (let dx = -r; dx <= r && seed < 0; dx++) { const x = Math.floor(s.cx) + dx, y = Math.floor(s.cy) + dy; if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (L[i] === R && pass(i)) seed = i; }
    if (seed < 0) return [];
    const mark = new Uint8Array(n); const st = new Int32Array(n);
    const flood = (from, m) => { let sp = 0; st[sp++] = from; mark[from] = m; while (sp) { const a = st[--sp]; const x = a % N; const nb = [x > 0 ? a - 1 : -1, x < N - 1 ? a + 1 : -1, a - N, a + N]; for (const b of nb) { if (b < 0 || b >= n || mark[b] === m || !pass(b)) continue; mark[b] = m; st[sp++] = b; } } };
    // (each building of the town by the ground round it — the tiles beside its footprint one could stand on —: reached when one
    // of them is; a function of the map alone, as the plan and the load must see it alike)
    const ring = b => { const o = []; for (let x = b.x; x < b.x + b.w; x++) o.push([x, b.y - 1], [x, b.y + b.h]); for (let y = b.y; y < b.y + b.h; y++) o.push([b.x - 1, y], [b.x + b.w, y]); return o.filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < N).map(([x, y]) => y * N + x).filter(W.ground); };
    const left = [...S.buildings.values()].filter(b => b.set === s.id && b.built && b.type !== 'ruin').sort((a, b) => a.id - b.id).map(b => [b, ring(b)]).filter(q => q[1].length);
    const near = (i, m) => { const x = i % N; return (x > 0 && mark[i - 1] === m) || (x < N - 1 && mark[i + 1] === m) || (i >= N && mark[i - N] === m) || (i + N < n && mark[i + N] === m); };
    let dirty = true; const later = []; // (one with no tile to open yet: a gate opened for another may give it one)
    while (out.length < 8 && left.length) {
      if (dirty) { mark.fill(0); flood(seed, 1); dirty = false; }
      const j = left.findIndex(q => !q[1].some(i => mark[i] === 1)); if (j < 0) break;
      const [b, around] = left[j]; left.splice(j, 1); for (const i of around) if (!mark[i] && pass(i)) flood(i, 2);
      // (the tile of the wall between the town and that pocket — or the wall's own tile beside the building, where the wall
      // line runs along it — nearest the building)
      const bx = b.x + b.w / 2, by = b.y + b.h / 2; let best = -1, bd = 1e18;
      for (const i of w.tiles) { if (gates.has(i) || !W.ground(i) || !near(i, 1) || !(near(i, 2) || around.includes(i))) continue; const dd = G.dist2((i % N) + 0.5, ((i / N) | 0) + 0.5, bx, by); if (dd < bd) { bd = dd; best = i; } }
      if (best < 0) { later.push([b, around]); continue; } // (shut off by something else — water, another wall —: not this wall's to open, unless a gate opened for another reaches it)
      gates.add(best); out.push(best); dirty = true; left.push(...later.splice(0));
    }
    if (!dry && out.length) { for (const i of out) w.gates.push(i); w.ways = (w.ways || []).concat(out); }
    return out;
  };
  // (and every wall keeps that promise while the town changes behind it: a block of Hedeby, raised on the strip between the rock
  // and the wall that led to its cemetery, shut the cemetery off for good — the wall's gates judged at its plan and at a load
  // only —: where a wall stands, the gate is cut at once, L-382. Asked by the village when a building comes or is finished,
  // before anything else of the world walks, and by the walls' own step when the ground changed otherwise — a river thawed,
  // the land raised or sunk, a wall going up. setId: only the walls of that town, the ground the same)
  let judged = '';
  const groundKey = () => { const S = G.S; return (S.walkVer || 0) + ':' + (S.typeVer || 0); };
  Sg.keepWays = function (setId) {
    const S = G.S; let cut = 0;
    for (const w of S.walls || []) { if (setId && w.set !== setId) continue; const s = S.settlements.get(w.set); if (!s) continue; for (const i of Sg.openWays(s, w)) if (S.wall[i] === 1) { S.wall[i] = 2; S.wallHp[i] = WALLHP[w.mat][1]; cut++; } }
    if (cut) G.W.touchWalk();
    if (!setId) judged = groundKey();
    return cut;
  };
  // a building put on the map (after its tiles are taken and the ground told): the walls judged again — unless it plainly shuts
  // nothing, with the walls judged up to it: it touches no other building and no wall, and the open ground beside it stays one
  // piece round it, close by. Then every way round it is still there, every building's ground round it the same, and no wall's
  // ways change (most of a town's buildings: judged each time, the walls cost the time skip of the mega 3%)
  Sg.placed = function (b) {
    const S = G.S; const before = ((S.walkVer || 0) - 1) + ':' + (S.typeVer || 0);
    if (!(S.walls || []).length) { judged = groundKey(); return; } // (no wall anywhere: nothing to keep)
    if (judged === before && (!b.blocks || apart(b))) judged = groundKey();
    else if (b.blocks) return Sg.keepWays();
    if (b.built) Sg.keepWays(b.set); // (one that stands at once: a building of its town now, to be reached)
  };
  const apart = Sg.apart = function (b) {
    const S = G.S; const inF = (x, y) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
    const plan = new Set(); for (const w of S.walls || []) for (const i of w.tiles) plan.add(i);
    const ring = []; for (let x = b.x; x < b.x + b.w; x++) ring.push([x, b.y - 1], [x, b.y + b.h]); for (let y = b.y; y < b.y + b.h; y++) ring.push([b.x - 1, y], [b.x + b.w, y]);
    const open = [];
    for (const [x, y] of ring) { if (!W.inb(x, y)) return false; const i = y * N + x; if (S.occ[i] || S.wall[i] || plan.has(i)) return false; if (W.ground(i)) open.push(i); }
    if (open.length < 2) return true;
    // (one piece without it: from one open tile beside it to all the others, on open ground with no wall, within four tiles of it)
    const x0 = b.x - 4, y0 = b.y - 4, x1 = b.x + b.w + 3, y1 = b.y + b.h + 3;
    const free = i => { const x = i % N, y = (i / N) | 0; return x >= x0 && y >= y0 && x <= x1 && y <= y1 && !inF(x, y) && W.ground(i) && !S.wall[i] && !plan.has(i); };
    const seen = new Set([open[0]]); const st = [open[0]];
    while (st.length) { const a = st.pop(); const x = a % N; for (const c of [x > 0 ? a - 1 : -1, x < N - 1 ? a + 1 : -1, a - N, a + N]) { if (c < 0 || c >= N * N || seen.has(c) || !free(c)) continue; seen.add(c); st.push(c); } }
    return open.every(i => seen.has(i));
  };
  function planWall(s, f, core) {
    const S = G.S;
    // (a town whose heart is inside another town's walls is walled already: what it would raise is a strip outside the other
    // wall that shuts nothing of its own — Corinto inside Delfos, in the old mega, L-342)
    if (Sg.walledIn(W.idx(s.cx, s.cy), { set: s.id, id: Infinity })) return null;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0;
    for (const b of S.buildings.values()) {
      if (b.set !== s.id || b.type === 'farm' || b.type === 'cemetery' || b.type === 'doca' || b.type === 'ruin' || b.type === 'cercado') continue;
      if (core && G.dist(b.x + b.w / 2, b.y + b.h / 2, s.cx, s.cy) > core) continue;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w - 1); y1 = Math.max(y1, b.y + b.h - 1); n++;
    }
    if (n < 5) return null;
    // a city too wide for one wall raises it around its old town (the new quarters stay outside)
    if (!core && (x1 - x0 > 26 || y1 - y0 > 26) && (s.tier || 0) >= 3) { const w = planWall(s, f, 12); if (w) { w.old = 1; return w; } }
    x0 -= 2; y0 -= 2; x1 += 2; y1 += 2;
    if (x0 < 2 || y0 < 2 || x1 > N - 3 || y1 > N - 3) { x0 = Math.max(2, x0); y0 = Math.max(2, y0); x1 = Math.min(N - 3, x1); y1 = Math.min(N - 3, y1); }
    if (x1 - x0 > 30 || y1 - y0 > 30 || x1 - x0 < 5 || y1 - y0 < 5) return null;
    const tiles = [], gates = [];
    const per = perimeter(x0, y0, x1, y1);
    for (const [x, y] of per) {
      const i = y * N + x;
      if (S.type[i] < T.SAND || S.wall[i] === 3 || Sg.walledIn(i, { set: s.id, id: Infinity })) continue;
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
    // gates are never side by side; each side keeps one — its busiest, the busiest side first —, then the busiest of the rest,
    // four in all (the four busiest alone left a side without a way out: Jelling's west, over Mênfis's quay street — L-140)
    const rank = i => S.wear[i] + (S.road[i] ? 40 : 0);
    const near = (i, j) => Math.abs((j % N) - (i % N)) + Math.abs(((j / N) | 0) - ((i / N) | 0)) < 4;
    const onSide = ([sx, sy], i) => (sx !== null ? i % N === sx : ((i / N) | 0) === sy);
    gates.sort((a, b) => rank(b) - rank(a));
    const g2 = []; const top = sd => { const i = gates.find(q => onSide(sd, q)); return i === undefined ? -1 : rank(i); };
    for (const sd of sides.slice().sort((a, b) => top(b) - top(a))) {
      if (g2.some(j => onSide(sd, j))) continue; // (a gate at its corner is its own)
      const cand = gates.filter(q => onSide(sd, q)), free = cand.filter(q => !g2.some(j => near(q, j)));
      if (free.length) { g2.push(free[0]); continue; }
      if (cand.length) continue; // (where its people walk out, a gate of the next side is a step away)
      const alt = tiles.filter(q => onSide(sd, q) && !g2.some(j => near(q, j))).sort((a, b) => rank(b) - rank(a))[0];
      if (alt !== undefined) g2.push(alt);
    }
    for (const i of gates) if (g2.length < 4 && !g2.includes(i) && !g2.some(j => near(i, j))) g2.push(i);
    const w = { id: S.nextId++, set: s.id, fac: f.id, mat: G.Civ.has(f.id, 'alvenaria') ? 'pedra' : 'madeira', tiles, gates: g2, built: 0, done: false, style: f.civ || 'classico', box: [x0, y0, x1, y1] };
    Sg.openWays(s, w);
    return w;
  }
  // walls raised at once (used by the gods, and by tests)
  Sg.raiseWalls = function (s, mat, instant) {
    const S = G.S; const f = G.Fac.get(s.fac); if (!f) return null;
    if (Sg.wallOf(s.id)) return Sg.wallOf(s.id);
    const w = planWall(s, f); if (!w) return null;
    if (mat) w.mat = mat;
    S.walls.push(w);
    if (instant) for (const i of w.tiles) { const gate = w.gates.includes(i); if ((S.wall[i] && !(gate && S.wall[i] === 1)) || (S.occ[i] && (S.buildings.get(S.occ[i]) || {}).blocks) || Sg.walledIn(i, w)) continue; S.wall[i] = gate ? 2 : 1; S.wallFac[i] = f.id; S.wallHp[i] = WALLHP[w.mat][gate ? 1 : 0]; }
    if (instant) { w.built = w.tiles.length; w.done = true; G.W.touchWalk(); }
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
      log(`${s.name} começou a erguer ${w.mat === 'pedra' ? 'muralhas de pedra' : 'uma paliçada de troncos'} ${w.old ? 'em volta da cidade velha — os bairros novos vão ficar do lado de fora' : 'ao redor da cidade'}.`, 'wall', s.cx, s.cy);
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
      // (a gate of the plan where a wall already stands — a neighbour's wall planned over the same tile and raised first, or an
      // old one —: the gate is cut in it; the town's builders skipped any tile already walled, and the street the gate was for
      // stayed shut, L-340)
      const gate = w.gates.includes(i);
      // (and never inside another town's walls: a plan saved before L-342 still has those tiles)
      if (i !== undefined && !Sg.walledIn(i, w) && (gate && S.wall[i] === 1 || !S.wall[i] && !(S.occ[i] && (S.buildings.get(S.occ[i]) || {}).blocks))) {
        f.stock[k] -= 2;
        S.wall[i] = gate ? 2 : 1; S.wallFac[i] = f.id; S.wallHp[i] = WALLHP[w.mat][gate ? 1 : 0]; G.W.touchWalk();
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
      const shut = !!s && (s.alarmT || 0) > 0 && s.fac === w.fac && !(w.forced > S.clock);
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
    S.wall[i] = 0; delete S.wallHp[i]; G.W.touchWalk();
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
        // a great host settling for a long siege raises a siege tower too
        if (b.army && b.army.strat === 'cerco' && f.stock.wood >= 40 && (f.civ === 'romano' || f.civ === 'grego' || f.civ === 'egipcio' || f.civ === 'classico')) { f.stock.wood -= 35; b.engines.push({ id: S.nextId++, kind: 'torre', x: lead.x, y: lead.y, cd: 3, hp: 140, band: b.id, fac: f.id, civ: f.civ }); }
        if (b.engines.length) log(`${f.name} ergueu ${b.engines.map(e => e.kind === 'ariete' ? 'um aríete' : e.kind === 'torre' ? 'uma torre de cerco' : 'uma catapulta').join(', ')} diante de ${set.name}.`, 'siege', lead.x, lead.y);
      }
    }
  };
  // a soldier's part in the siege: hack at the gate
  // the wall tile next to a gate or siege point where a ladder can go
  function ladderTile(w, sg) {
    const S = G.S; let best = -1, bd = 1e9;
    for (const i of w.tiles) { if (S.wall[i] !== 1) continue; const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const d = G.dist(x, y, sg.x, sg.y); if (d > 1.5 && d < 5 && d < bd) { bd = d; best = i; } }
    return best;
  }
  // both sides of a wall tile: where to stand outside, where to land inside
  function sides(i, set) {
    const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
    let out = null, inn = null, bo = -1e9, bi = 1e9;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const px = x + dx, py = y + dy; if (!W.walkableXY(px, py)) continue; const d = G.dist(px, py, set.cx, set.cy); if (d > bo) { bo = d; out = [px, py]; } if (d < bi) { bi = d; inn = [px, py]; } }
    return out && inn && out !== inn ? [out, inn] : null;
  }
  Sg.siegeActions = function (v, t, b, dt, H) {
    const sg = b.siege; if (!sg) return false;
    const S = G.S;
    if (!S.wall[sg.i]) { b.siege = null; return false; }
    if (v.arm === 'arco') return false; // archers keep shooting at whoever shows up
    const set = S.settlements.get(b.set);
    const w = set && Sg.wallOf(set.id);
    // one in four carries a ladder to the wall beside the gate
    if (w && b.army && v.id % 4 === 0 && !t.overWall) {
      if (t.ladder === undefined) { const i = ladderTile(w, sg); const sd = i >= 0 && sides(i, set); t.ladder = sd ? { i, out: sd[0], inn: sd[1], t: 0 } : null; }
      const L = t.ladder;
      if (L && S.wall[L.i] === 1) {
        if (G.dist(v.x, v.y, L.out[0], L.out[1]) > 0.35) { if (!t.lp || H.arrived(v)) { t.lp = true; if (!H.goto(v, L.out[0], L.out[1], false, 4000)) { t.ladder = null; return false; } } H.move(v, dt, 1); v.act = ''; return true; }
        v.path = null; v.moving = false; v.act = 'climb'; L.t += dt; v.z = Math.min(12, L.t * 2.2);
        G.faceTo(v, L.inn[0] - v.x, L.inn[1] - v.y);
        // defenders push the ladders off the wall
        if (G.R() < dt * 0.12) { v.z = 0; L.t = 0; G.Vg.damage(v, G.rr(18, 34), 'fall', false, 0); G.Vg.emote(v, 'fear', 1.5); G.FX && G.FX.dust(v.x, v.y, 2); return true; }
        if (L.t > 6) { v.x = L.inn[0]; v.y = L.inn[1]; v.z = 0; t.overWall = true; t.dest = null; v.path = null; if (!b.laddered) { b.laddered = true; log(`Com escadas, soldados de ${G.Fac.get(b.fac).name} escalaram os muros de ${set.name}!`, 'siege', v.x, v.y); } }
        return true;
      }
    }
    // inside the walls: open the gate for the others
    if (t.overWall && w) {
      let gate = -1, gd = 1e9; for (const i of w.gates) if (S.wall[i] === 4) { const d = G.dist(v.x, v.y, (i % N) + 0.5, ((i / N) | 0) + 0.5); if (d < gd) { gd = d; gate = i; } }
      if (gate >= 0) {
        const gx = (gate % N) + 0.5, gy = ((gate / N) | 0) + 0.5; const sd = sides(gate, set); const inn = sd ? sd[1] : [gx, gy];
        if (G.dist(v.x, v.y, inn[0], inn[1]) > 0.5) { if (!t.gp || H.arrived(v)) { t.gp = true; if (!H.goto(v, inn[0], inn[1], false, 3000)) { t.overWall = false; return false; } } H.move(v, dt, 1.2); v.act = 'run'; return true; }
        v.act = 'build'; t.gateT = (t.gateT || 0) + dt;
        if (t.gateT > 3) { S.wall[gate] = 2; w.forced = S.clock + 60; log(`Soldados de ${G.Fac.get(b.fac).name} abriram por dentro o portão de ${set.name}!`, 'siege', gx, gy); b.siege = null; }
        return true;
      }
      return false;
    }
    const d = G.dist(v.x, v.y, sg.x, sg.y);
    if (d > 1.25) {
      t.sgr = (t.sgr || 0) - dt;
      if (t.sgr <= 0 || H.arrived(v)) { t.sgr = 1.2; if (!H.goto(v, sg.x + G.rr(-0.4, 0.4), sg.y + G.rr(-0.4, 0.4), true, N * N)) return false; }
      H.move(v, dt, 1); v.act = '';
      return true;
    }
    v.path = null; v.moving = false; v.act = 'fight';
    G.faceTo(v, sg.x - v.x, sg.y - v.y);
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
        if (e.kind === 'torre') {
          // the siege tower rolls to a stretch of wall; when its bridge drops, the wall is theirs
          const w = set && Sg.wallOf(set.id); if (!w) continue;
          if (e.wi === undefined || S.wall[e.wi] !== 1) { e.wi = -1; let bd = 1e9; for (const i of w.tiles) { if (S.wall[i] !== 1) continue; const d = G.dist(e.x, e.y, (i % N) + 0.5, ((i / N) | 0) + 0.5); if (d < bd) { bd = d; e.wi = i; } } e.dock = 0; }
          if (e.wi < 0) continue;
          const wx = (e.wi % N) + 0.5, wy = ((e.wi / N) | 0) + 0.5; const d = G.dist(e.x, e.y, wx, wy);
          if (d > 1.05) { const sp = 0.35 * dt; e.x += (wx - e.x) / d * sp; e.y += (wy - e.y) / d * sp; G.faceTo(e, wx - e.x, wy - e.y); e.moving = true; }
          else { e.moving = false; e.dock = (e.dock || 0) + dt; e.bridge = Math.min(1, e.dock / 3); if (e.dock > 7) { if (Sg.damageWall(e.wi, 999, b.fac) && !b.towerLog) { b.towerLog = true; log(`A torre de cerco de ${G.Fac.get(b.fac).name} baixou a ponte sobre os muros de ${set.name}: os soldados passam por cima!`, 'siege', wx, wy); } e.wi = undefined; } }
          continue;
        }
        if (e.kind === 'ariete') {
          if (!tgt) continue;
          const d = G.dist(e.x, e.y, tgt.x, tgt.y);
          if (d > 1.1) { const sp = 0.7 * dt; e.x += (tgt.x - e.x) / d * sp; e.y += (tgt.y - e.y) / d * sp; G.faceTo(e, tgt.x - e.x, tgt.y - e.y); e.moving = true; }
          else if (e.cd <= 0) { e.cd = 2.2; e.moving = false; e.hit = 0.4; G.Audio && G.Audio.at(e.x, e.y, 'collapse'); G.Render && G.Render.shake(0.02); if (Sg.damageWall(tgt.i, 34, b.fac)) b.siege = null; }
        } else {
          // catapults stand back and hurl stones over the walls
          const aim = tgt ? [tgt.x, tgt.y] : set ? [set.cx, set.cy] : null; if (!aim) continue;
          const d = G.dist(e.x, e.y, aim[0], aim[1]);
          if (d > 7.5) { const sp = 0.5 * dt; e.x += (aim[0] - e.x) / d * sp; e.y += (aim[1] - e.y) / d * sp; G.faceTo(e, aim[0] - e.x, aim[1] - e.y); continue; }
          if (e.cd > 0) continue;
          e.cd = 4.5; e.fire = 0.5;
          let tx = aim[0], ty = aim[1], hitB = null;
          if (!tgt && set) { const bs = [...S.buildings.values()].filter(o => o.set === set.id && o.built && o.type !== 'ruin' && o.type !== 'farm'); if (bs.length) { hitB = G.pick(bs); tx = hitB.x + hitB.w / 2; ty = hitB.y + hitB.h / 2; } }
          S.missiles.push({ x0: e.x, y0: e.y, x1: tx + G.rr(-0.6, 0.6), y1: ty + G.rr(-0.6, 0.6), t: 0, dur: 1.4, wall: tgt ? tgt.i : -1, b: hitB ? hitB.id : 0, fac: b.fac });
        }
      }
    }
  }
  // boiling oil poured from the gates on whoever is hacking at them
  function oilTick(dt) {
    const S = G.S;
    for (const w of S.walls) {
      if (!w.shut) continue;
      const f = G.Fac.get(w.fac); if (!f || f.stock.food < 2) continue;
      w.oilCd = (w.oilCd || 0) - dt; if (w.oilCd > 0) continue; w.oilCd = 3.2;
      for (const i of w.gates) {
        if (S.wall[i] !== 4) continue;
        const gx = (i % N) + 0.5, gy = ((i / N) | 0) + 0.5;
        let hit = 0;
        for (const o of G.War.fighters) { if (o.captive || !G.Fac.atWar(w.fac, fid(o)) || G.dist2(o.x, o.y, gx, gy) > 2.3) continue; hit++; o.hurt = 0.4; G.Vg.damage(o, G.rr(14, 24), 'oil', false, 0); G.Vg.emote(o, 'fire', 1.2); }
        if (G.War.bands) for (const b of G.War.bands.values()) if (b.engines) for (const e of b.engines.slice()) if (e.kind === 'ariete' && G.dist(e.x, e.y, gx, gy) < 1.6) { e.hp -= 12; hit++; if (e.hp <= 0) { b.engines.splice(b.engines.indexOf(e), 1); log(`O aríete diante de ${(S.settlements.get(w.set) || {}).name} pegou fogo com o óleo e desabou.`, 'siege', gx, gy); break; } }
        if (!hit) continue;
        f.stock.food -= 1;
        for (let q = 0; q < 14; q++) G.FX && G.FX.spawn({ x: gx + G.rr(-0.4, 0.4), y: gy + G.rr(-0.4, 0.4), z: 22, vz: G.rr(-20, -6), vx: G.rr(-0.5, 0.5), vy: G.rr(-0.5, 0.5), g: 30, life: G.rr(0.5, 0.9), s0: 1.4, s1: 0.4, c: q % 3 ? '#e8a23a' : '#c86a1a', k: 4, layer: 1 });
        G.FX && G.FX.smokePuff && G.FX.smokePuff(gx, gy);
        if (!w.oilDay || S.day - w.oilDay > 0.5) { w.oilDay = S.day; const s = S.settlements.get(w.set); log(`Do alto do portão de ${s ? s.name : 'a cidade'}, os defensores despejam óleo fervente sobre os sitiantes!`, 'siege', gx, gy); }
      }
    }
  }
  // sappers dig under a long siege until a stretch of wall falls in
  function sappersTick(dt) {
    const S = G.S;
    for (const b of G.War.bands.values()) {
      if (!b.army || !b.army.siege || b.army.phase !== 'cerco') continue;
      const sg = b.army.siege; sg.dig = (sg.dig || 0) + dt;
      if (sg.dig < 70 || sg.mined) continue;
      const set = S.settlements.get(b.set); const w = set && Sg.wallOf(set.id); if (!w) continue;
      const cands = w.tiles.filter(i => S.wall[i] === 1); if (!cands.length) continue;
      sg.mined = true;
      const i = G.pick(cands); Sg.damageWall(i, 999, b.fac);
      const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5;
      G.FX && G.FX.dust(x, y, 10); G.Render && G.Render.shake(0.05);
      log(`Os sapadores de ${G.Fac.get(b.fac).name} cavaram um túnel sob os muros de ${set.name} e atearam fogo às escoras: um trecho da muralha desabou!`, 'siege', x, y);
    }
  }
  function missilesTick(dt) {
    const S = G.S;
    for (let k = S.missiles.length - 1; k >= 0; k--) {
      const m = S.missiles[k]; m.t += dt;
      if (m.t < m.dur) continue;
      S.missiles.splice(k, 1);
      if (m.corpse) {
        // a corpse over the walls: the plague begins where it lands
        let n = 0;
        for (const v of S.villagers.values()) if (G.dist2(v.x, v.y, m.x1, m.y1) < 9 && !(v.sick > 0) && !(v.immune > 0)) { v.sick = G.DAY_LEN * G.rr(0.5, 0.9); n++; }
        for (let q = 0; q < 16; q++) G.FX && G.FX.spawn({ x: m.x1 + G.rr(-1, 1), y: m.y1 + G.rr(-1, 1), z: 4, vz: G.rr(3, 9), vx: G.rr(-0.3, 0.3), vy: G.rr(-0.3, 0.3), life: G.rr(2, 3.5), s0: 2, s1: 7, c: 'rgba(120,150,70,0.35)', k: 2 });
        const s = G.Village.nearSettlementName(m.x1, m.y1);
        if (n) log(`${n} ${n > 1 ? 'pessoas adoeceram' : 'pessoa adoeceu'} perto de onde o cadáver caiu${s ? ' em ' + s : ''}.`, 'plague', m.x1, m.y1);
        continue;
      }
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
      // (the sacrifice is a ceremony on top of the temple, with the whole town below)
      if (G.Justice && G.Justice.sacrifice(f, v)) return;
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
  G.worldHooks.push(() => { Sg.reset(); }); // (a new world, or a save loaded: it starts over)
  Sg.reset = function () { tEq = 1; tWall = 5; tGate = 0; tSac = 10; judged = ''; };
  Sg.update = function (dt) {
    tEq -= dt; tWall -= dt; tGate -= dt; tSac -= dt;
    if (tEq <= 0) { tEq = 4; equip(); }
    if (tWall <= 0) { tWall = 20; considerWalls(); }
    if (tGate <= 0) { const d = 0.5 - tGate; tGate = 0.5; gatesTick(); wallArchers(d); }
    buildWalls(dt);
    enginesTick(dt); missilesTick(dt); oilTick(dt); sappersTick(dt);
    if (tSac <= 0) { tSac = 25; considerSacrifice(); }
    sacrificeTick(dt);
    if (groundKey() !== judged) Sg.keepWays();
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
    ctx.save(); ctx.translate(sx, sy); ctx.scale(G.Render.sface(e), 1);
    ctx.fillStyle = 'rgba(20,30,20,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, TAU); ctx.fill();
    if (e.kind === 'ariete') {
      const push = e.hit > 0 ? Math.sin((0.4 - e.hit) / 0.4 * Math.PI) * 3 : 0;
      ctx.fillStyle = '#4a3020'; for (const x of [-5, 4]) { ctx.beginPath(); ctx.arc(x, -2, 2.2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6e4a2c'; ctx.fillRect(-8, -9, 15, 6);
      ctx.fillStyle = '#8a6a44'; ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(0, -15); ctx.lineTo(8, -9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(-6 + push, -6.5, 17, 2.2); ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.arc(11 + push, -5.4, 1.8, 0, TAU); ctx.fill();
    } else if (e.kind === 'torre') {
      ctx.fillStyle = '#4a3020'; for (const x of [-6, 6]) { ctx.beginPath(); ctx.arc(x, -2, 2.4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6e4a2c'; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(8, -3); ctx.lineTo(6, -36); ctx.lineTo(-6, -36); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.moveTo(1, -3); ctx.lineTo(8, -3); ctx.lineTo(6, -36); ctx.lineTo(1, -36); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3a2616'; ctx.lineWidth = 0.6; for (let y = -8; y > -36; y -= 5) { ctx.beginPath(); ctx.moveTo(-7.4 + (-y) * 0.05, y); ctx.lineTo(7.4 - (-y) * 0.05, y); ctx.stroke(); }
      ctx.fillStyle = '#8a6a44'; ctx.fillRect(-6.5, -39, 13, 3);
      ctx.fillStyle = '#9a8a6a'; for (const x of [-5, -1, 3]) ctx.fillRect(x, -42, 2, 3);
      const br = e.bridge || 0; ctx.save(); ctx.translate(6, -34); ctx.rotate(-1.5 + br * 1.5); ctx.fillStyle = '#7a5a3a'; ctx.fillRect(0, -1, 9, 2); ctx.restore();
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
      if (m.corpse) { ctx.save(); ctx.translate(p[0], p[1] - z - 4); ctx.rotate(m.t * 6); ctx.fillStyle = '#8a7a6a'; ctx.fillRect(-3, -1, 6, 2); ctx.fillStyle = '#6a5a4a'; ctx.beginPath(); ctx.arc(3.4, 0, 1.3, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6a5a4a'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-3, -0.5); ctx.lineTo(-5, -2); ctx.moveTo(-3, 0.5); ctx.lineTo(-5, 2); ctx.stroke(); ctx.restore(); }
      else { ctx.fillStyle = '#6a645a'; ctx.beginPath(); ctx.arc(p[0], p[1] - z - 4, 2.2, 0, TAU); ctx.fill(); }
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
    load(o) {
      const S = G.S; S.walls = o.walls || []; S.wallHp = o.wallHp || {}; S.missiles = []; for (const f of S.factions.values()) f.sac = null; Sg.reset();
      // (a save from before L-342: what was raised inside another town's walls comes down — the pocket opens; the tile map is
      // back already, city.js loads before)
      let down = 0;
      for (const w of S.walls) for (const i of w.tiles) {
        if (!S.wall[i] || S.wall[i] === 3 || !Sg.walledIn(i, w)) continue;
        if (S.walls.some(q => q !== w && q.tiles.includes(i) && !Sg.walledIn(i, q))) continue; // (a tile of a wall that may stand there)
        S.wall[i] = 0; S.wallFac[i] = 0; delete S.wallHp[i]; down++;
      }
      // (and a building of the town its own wall shuts off gets its gate — cut at once where the wall already stands, L-344)
      if (down) G.W.touchWalk();
      Sg.keepWays();
    },
  });
})(window.G);
