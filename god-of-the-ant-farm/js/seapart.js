'use strict';
// ============================================================
//  Abrir o Mar (Mar): the god parts the sea. Between the two
//  nearest shores — two lands, if there are two to join — the
//  water draws back and stands up in two walls, and the sea bed
//  is ground: the people go down to pick up the fish left on the
//  sand, and whoever wants to can walk to the other side, armies
//  too. For most of a day. Then the walls tremble, those still
//  down there run for the shore, and the sea falls back: whoever
//  did not make it is taken by the water.
//  The bed is S.dry (one mark per tile), written only here; every
//  time it changes the maps of where one can walk are told
//  (W.touchWalk, W.invalidateLand) and so is the map of where
//  ships can sail (G.Naval.invalidate). It is not saved as such:
//  the partings are, and the marks come back from their tiles.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const where = (x, y) => G.Village.nearSettlementName(x, y);
  const TAU = Math.PI * 2;

  const PART = { id: 'seapart', tab: 'mar', name: 'Abrir o Mar', cost: 75, r: 1.5, good: true, desc: 'Clique no mar entre duas margens: as águas se afastam e ficam de pé em duas paredes, e o fundo vira caminho de uma margem à outra. O povo desce para catar os peixes que ficaram na areia, e quem quiser atravessa a pé — exércitos também. Quase um dia depois as paredes tremem, quem está lá embaixo corre, e o mar se fecha: quem não saiu a tempo é levado pelas águas.' };
  { let k = -1; G.POWERS.forEach((q, i) => { if (q.tab === 'mar') k = i; }); G.POWERS.splice(k + 1, 0, PART); }
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });

  const OPENING = 3, LAST = () => DAY() * 0.75, WARN = 12, MAXLEN = 64, WIDTH = 1.15;
  // (made only by the world's step: a check or a drawing reads G.S.parts and never creates it)
  function list() { const S = G.S; if (!S.parts) S.parts = []; return S.parts; }
  function dryMap() { const S = G.S; if (!S.dry || S.dry.length !== N * N) S.dry = new Uint8Array(N * N); return S.dry; }
  const isDry = i => !!(G.S.dry && G.S.dry[i]);
  const sea = i => G.S.type[i] <= T.SEA;
  const tellMaps = () => { W.touchWalk(); W.invalidateLand(); G.Naval && G.Naval.invalidate && G.Naval.invalidate(); };
  P.parts = () => (G.S.parts || []);
  // (where the sea would open from a point: for the cursor's preview and the tests — it only looks)
  P.seaWay = (x, y) => wayAt(x, y);

  // ------------------------------ the way ------------------------------
  // from the point clicked, the straight line to the nearest shore on each side; two lands to join come first,
  // a short way before a long one (the same answer every time: no dice are thrown to look)
  function wayAt(x, y) {
    const S = G.S; if (!W.inb(x, y) || !sea(W.idx(x, y))) return null;
    const L = W.reachIds(true); let best = null, bs = -1e9;
    const shore = (dx, dy) => {
      for (let s = 0.5; s <= MAXLEN; s += 0.5) {
        const px = x + dx * s, py = y + dy * s; if (!W.inb(px, py)) return null;
        const i = W.idx(px, py); if (sea(i)) { if (S.occ[i] || isDry(i)) return null; continue; }
        // (the land it reaches must be ground one can stand on: not a cliff, not a wall, not the middle of a lake)
        return W.walkable(i) ? { s, x: (i % N) + 0.5, y: ((i / N) | 0) + 0.5, i } : null;
      }
      return null;
    };
    for (let k = 0; k < 32; k++) {
      const a = k / 32 * Math.PI, dx = Math.cos(a), dy = Math.sin(a);
      const A = shore(dx, dy), B = A && shore(-dx, -dy); if (!A || !B) continue;
      const len = A.s + B.s; if (len > MAXLEN || len < 3) continue;
      const two = L[A.i] >= 0 && L[B.i] >= 0 && L[A.i] !== L[B.i];
      const sc = (two ? 1000 : 0) - len;
      if (sc > bs) { bs = sc; best = { a: A, b: B, len, two, dx, dy }; }
    }
    if (!best) return null;
    // the bed: the sea tiles within a stride and a half of the line, from shore to shore
    const tiles = []; const seen = new Set();
    const ax = best.a.x, ay = best.a.y, bx = best.b.x, by = best.b.y; const L2 = (bx - ax) ** 2 + (by - ay) ** 2;
    const x0 = Math.floor(Math.min(ax, bx) - 2), x1 = Math.ceil(Math.max(ax, bx) + 2), y0 = Math.floor(Math.min(ay, by) - 2), y1 = Math.ceil(Math.max(ay, by) + 2);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (!W.inb(tx, ty)) continue; const i = ty * N + tx; if (seen.has(i) || !sea(i) || S.occ[i] || isDry(i)) continue;
      const cx = tx + 0.5, cy = ty + 0.5; const u = G.clamp(((cx - ax) * (bx - ax) + (cy - ay) * (by - ay)) / L2, 0, 1);
      if (G.dist(cx, cy, ax + (bx - ax) * u, ay + (by - ay) * u) > WIDTH) continue;
      seen.add(i); tiles.push(i);
    }
    return Object.assign(best, { tiles });
  }

  // ------------------------------ checks ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (p.id !== 'seapart') return prevCheck ? prevCheck(p, x, y) : true;
    const S = G.S; const i = W.idx(x, y);
    if (!sea(i)) { P.why = 'Clique no mar, entre duas margens.'; return false; }
    if (isDry(i)) { P.why = 'O mar já está aberto aqui.'; return false; }
    if ((S.parts || []).length >= 2) { P.why = 'Os mares já estão abertos em dois lugares.'; return false; }
    if (!wayAt(x, y)) { P.why = 'Não há duas margens perto o bastante para o mar se abrir entre elas.'; return false; }
    return true;
  };

  // ------------------------------ the parting ------------------------------
  P.seapart = function (x, y) {
    const S = G.S; const w = wayAt(x, y); if (!w) return;
    const p = { id: S.nextId++, x, y, ax: w.a.x, ay: w.a.y, bx: w.b.x, by: w.b.y, two: w.two ? 1 : 0, tiles: w.tiles, t: 0, st: 'abre', fish: Math.max(3, Math.round(w.tiles.length * 0.18)), fished: 0, crossed: 0, drowned: 0, in: {}, tick: 0, wa: where(w.a.x, w.a.y), wb: where(w.b.x, w.b.y) };
    list().push(p);
    G.Audio && G.Audio.play('seapart');
    G.Render && G.Render.shake(0.45);
    P.witness(x, y, 26, 10, 8);
    const names = p.wa && p.wb && p.wa !== p.wb ? ` entre ${p.wa} e ${p.wb}` : p.wa || p.wb ? ` diante de ${p.wa || p.wb}` : '';
    log(`O mar se abriu${names}! As águas se ergueram em duas paredes e o fundo virou caminho${p.two ? ' de uma terra à outra' : ''}.`, 'sea', x, y);
    G.Lore && G.Lore.note('seapart', { where: p.wa || p.wb });
  };
  // the waters stand aside: the bed is ground, no ship is caught in it, the fish of the sea swim out of the way
  // the nearest water still water (not the bed)
  function nearestSea(x, y) { const S = G.S; let best = null, bd = 1e9; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const tx = Math.floor(x) + dx, ty = Math.floor(y) + dy; if (!W.inb(tx, ty)) continue; const j = ty * N + tx; if (!sea(j) || isDry(j)) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [tx + 0.5, ty + 0.5]; } } return best; }
  function openUp(p) {
    const S = G.S; const D = dryMap();
    for (const i of p.tiles) D[i] = 1;
    tellMaps();
    const set = new Set(p.tiles);
    for (const s of [...S.ships]) {
      if (set.has(W.idx(s.x, s.y))) { const q = nearestSea(s.x, s.y); if (!q) { G.Naval.sink(s, null, 'god'); continue; } s.x = q[0]; s.y = q[1]; }
      // (a course across the bed is a course into a wall: plotted again)
      if (s.path && s.path.slice(s.pi).some(q => set.has(W.idx(q[0], q[1])))) { const last = s.path[s.path.length - 1]; const np = G.Naval.seaPath(s.x, s.y, last[0], last[1]); s.path = np || null; s.pi = 0; }
    }
    S.fish = S.fish.filter(f => !set.has(W.idx(f.x, f.y)));
    for (const a of S.animals.values()) {
      if (a.dead || !set.has(W.idx(a.x, a.y))) continue;
      const sp = G.Animals.DEF[a.kind];
      if (sp && sp.cls === 'water') { const q = nearestSea(a.x, a.y); if (q) { a.x = q[0]; a.y = q[1]; a.tx = a.x; a.ty = a.y; } else G.Animals.kill(a, null); }
    }
    for (const v of S.villagers.values()) if (!v.aboard && set.has(W.idx(v.x, v.y)) && v.task && v.task.type === 'swim') G.Vg.endTask(v); // (the swimmer finds sand under his feet)
  }
  // the end: the walls fall; whoever is down there goes under
  function closeDown(p) {
    const S = G.S; const D = dryMap(); const set = new Set(p.tiles);
    for (const i of p.tiles) D[i] = 0;
    tellMaps();
    const lost = [], spat = [];
    for (const v of [...S.villagers.values()]) {
      if (v.aboard || v.inside || v.air || v.held || v.ug || !W.inb(v.x, v.y) || !set.has(W.idx(v.x, v.y))) continue;
      // (the sea falls on them: most go under; now and then it spits one out on the beach, half drowned)
      if (G.R() < 0.75) { G.Vg.damage(v, 999, 'drown', true); lost.push(v); continue; }
      G.Vg.damage(v, Math.min(60, v.hp - 5), 'drown', true); spat.push(v);
      // (thrown up on a beach, half drowned)
      const n = W.nearestLand(v.x, v.y, 10); if (n) { v.x = n[0]; v.y = n[1]; v.path = null; G.Vg.endTask(v); } else G.Vg.H.setTask(v, { type: 'swim', pri: 6 });
      v.energy = Math.max(3, v.energy - 40); G.Vg.emote(v, 'fear', 3);
      G.Life && G.Life.bio(v, 'note', 'Foi apanhado pelo mar quando as águas se fecharam, e saiu vivo', 'O mar se fechou sobre mim e me cuspiu na praia');
    }
    for (const a of [...S.animals.values()]) {
      if (a.dead || !set.has(W.idx(a.x, a.y))) continue;
      const sp = G.Animals.DEF[a.kind]; if (sp && sp.cls === 'water') continue;
      const n = W.nearestLand(a.x, a.y, 4); if (n) { a.x = n[0]; a.y = n[1]; a.tx = a.x; a.ty = a.y; } else G.Animals.kill(a, null);
    }
    p.drowned = lost.length;
    // who went down on one side and came out on the other
    for (const id in p.in) { const v = S.villagers.get(+id); if (!v) continue; const side = G.dist2(v.x, v.y, p.ax, p.ay) < G.dist2(v.x, v.y, p.bx, p.by) ? 'a' : 'b'; if (side !== p.in[id] && !set.has(W.idx(v.x, v.y))) p.crossed++; }
    G.Audio && G.Audio.play('seaclose'); G.Render && G.Render.shake(0.6);
    for (let k = 0; k < p.tiles.length; k += 3) { const i = p.tiles[k]; G.FX && G.FX.splash((i % N) + 0.5, ((i / N) | 0) + 0.5, 1.2); }
    const names = p.wa && p.wb && p.wa !== p.wb ? ` entre ${p.wa} e ${p.wb}` : p.wa || p.wb ? ` diante de ${p.wa || p.wb}` : '';
    const parts = []; if (p.crossed) parts.push(`${p.crossed} ${p.crossed > 1 ? 'pessoas atravessaram' : 'pessoa atravessou'} a pé`); if (p.fished) parts.push(`${p.fished} cestos de peixe foram catados no fundo`);
    log(`O mar se fechou${names}${parts.length ? ': ' + parts.join(', ') : ''}.${lost.length ? ` ${lost.length > 1 ? lost.length + ' pessoas não saíram a tempo' : lost[0].name + ' não saiu a tempo'} e ${lost.length > 1 ? 'foram levadas' : 'foi levad' + (lost[0].g === 'f' ? 'a' : 'o')} pelas águas.` : ''}${spat.length ? ` ${spat.map(v => v.name).join(', ')} ${spat.length > 1 ? 'foram cuspidos' : 'foi cuspid' + (spat[0].g === 'f' ? 'a' : 'o')} na praia, quase ${spat.length > 1 ? 'afogados' : 'afogad' + (spat[0].g === 'f' ? 'a' : 'o')}.` : ''}`, 'sea', p.x, p.y);
    if (p.crossed >= 3 || lost.length) G.Lore && G.Lore.legend('seapart:' + p.id, `O Caminho no Mar${p.wa ? ' de ' + p.wa : ''}`, `No ano ${S.day}, o mar${names} se abriu como uma porta, e o fundo virou estrada. ${p.crossed ? `${p.crossed} ${p.crossed > 1 ? 'pessoas atravessaram' : 'pessoa atravessou'} a pé por onde só os barcos passavam. ` : ''}${lost.length ? `Quando as águas voltaram, levaram ${lost.length > 1 ? lost.length + ' que ainda estavam lá embaixo' : lost[0].name}.` : 'Quando as águas voltaram, não havia mais ninguém lá embaixo.'}`, { kind: 'milagre' });
  }

  // ------------------------------ the people ------------------------------
  const free = v => v.age >= 8 && !v.captive && !v.jail && !v.aboard && !v.ug && !v.wrecked && !v.sleeping && !v.inside && !v.held && !v.air && !(v.task && v.task.pri >= 2);
  // the curious go down to pick up the fish left on the sand (a few at a time, while there are fish)
  function curious(p) {
    const S = G.S; let going = 0; for (const v of S.villagers.values()) if (v.task && v.task.type === 'fundo' && v.task.part === p.id) going++;
    if (going >= 6 || p.fished + going >= p.fish) return;
    const ends = [[p.ax, p.ay], [p.bx, p.by]];
    for (const v of S.villagers.values()) {
      if (going >= 6) break;
      if (!free(v) || !ends.some(e => G.dist2(v.x, v.y, e[0], e[1]) < 14 * 14)) continue;
      // (a spot on the bed of its own: the tiles taken in turns)
      const i = p.tiles[(v.id * 7 + p.fished * 3) % p.tiles.length]; const tx = (i % N) + 0.5, ty = ((i / N) | 0) + 0.5;
      if (!W.reaches(v, tx, ty)) continue;
      if (G.Vg.give(v, { type: 'fundo', part: p.id, x: tx, y: ty, pri: 1.9, st: 0, kind: 'fundo' })) { going++; G.Vg.emote(v, 'awe', 2); }
    }
  }
  function runFundo(v, t, dt, H) {
    const S = G.S; const p = (S.parts || []).find(q => q.id === t.part);
    if (!p || p.st !== 'aberto') return H.end(v);
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false, 4000)) return H.end(v); t.st = 1; return; }
    if (t.st === 1) { if (H.move(v, dt, 1.05)) { t.st = 2; v.actT = 0; } else if (t.age > 70) H.end(v); return; }
    v.act = 'pick'; v.moving = false;
    if (v.actT < 1.6) return;
    if (p.fished >= p.fish) return H.end(v);
    p.fished++;
    G.FX && G.FX.floater(v.x, v.y, '+peixe', '#bfe8ff', 1.4);
    v.carry = { k: 'food', n: 3 };
    H.setTask(v, { type: 'deliver', pri: 1 });
  }
  // the last moments: everyone down there runs for the nearest shore
  function warn(p) {
    const S = G.S; const set = new Set(p.tiles);
    for (const v of S.villagers.values()) {
      if (v.aboard || v.inside || !W.inb(v.x, v.y) || !set.has(W.idx(v.x, v.y)) || (v.task && v.task.type === 'sair')) continue;
      const da = G.dist2(v.x, v.y, p.ax, p.ay), db = G.dist2(v.x, v.y, p.bx, p.by);
      const [ex, ey] = da < db ? [p.ax, p.ay] : [p.bx, p.by];
      G.Vg.H.setTask(v, { type: 'sair', part: p.id, x: ex, y: ey, pri: 5.6, st: 0 }); G.Vg.emote(v, 'fear', 3);
    }
  }
  function runSair(v, t, dt, H) {
    const S = G.S; const p = (S.parts || []).find(q => q.id === t.part);
    if (!p || !isDry(W.idx(v.x, v.y))) return H.end(v); // (out — or the sea is already here)
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false, 4000)) { const n = W.nearestLand(v.x, v.y, 8); if (!n || !H.goto(v, n[0], n[1], false, 4000)) return H.end(v); } t.st = 1; }
    v.act = 'run'; H.move(v, dt, 1.4);
  }

  // ------------------------------ update ------------------------------
  function update(dt) {
    const S = G.S; const L = S.parts;
    for (let k = L.length - 1; k >= 0; k--) {
      const p = L[k]; p.t += dt;
      if (p.st === 'abre') { if (p.t >= OPENING) { p.st = 'aberto'; openUp(p); } continue; }
      // (a tile the god changed under the bed — raised to land — is no longer a sea held back)
      if (p.tiles.some(i => !sea(i))) { const D = dryMap(); p.tiles = p.tiles.filter(i => { if (sea(i)) return true; D[i] = 0; return false; }); tellMaps(); }
      p.tick -= dt;
      if (p.tick <= 0) {
        p.tick = 0.5;
        const set = new Set(p.tiles);
        // (who has been down there, and on which side they went in)
        for (const v of S.villagers.values()) if (!v.aboard && W.inb(v.x, v.y) && set.has(W.idx(v.x, v.y)) && !p.in[v.id] && Object.keys(p.in).length < 300) p.in[v.id] = G.dist2(v.x, v.y, p.ax, p.ay) < G.dist2(v.x, v.y, p.bx, p.by) ? 'a' : 'b';
        // (a creature of the sea that wandered onto the sand flops back to the water — or dies there)
        for (const a of [...S.animals.values()]) { if (a.dead || !set.has(W.idx(a.x, a.y))) continue; const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls !== 'water') continue; const q = nearestSea(a.x, a.y); if (q) { a.x = q[0]; a.y = q[1]; a.tx = a.x; a.ty = a.y; } else G.Animals.kill(a, null); }
        if (p.st === 'aberto') curious(p);
        if (p.st === 'fecha') warn(p);
      }
      if (p.st === 'aberto' && p.t >= LAST() - WARN) {
        p.st = 'fecha'; p.tick = 0;
        G.Audio && G.Audio.play('quake'); G.Render && G.Render.shake(0.3);
        log(`As paredes do mar começaram a tremer${p.wa ? ' perto de ' + p.wa : ''} — quem está lá embaixo corre para a margem!`, 'sea', p.x, p.y);
      }
      if (p.st === 'fecha' && p.t >= LAST()) { closeDown(p); L.splice(k, 1); }
    }
  }
  const E = G.Eco;
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'fundo') return runFundo(v, t, dt, H), true; if (t.type === 'sair') return runSair(v, t, dt, H), true; return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'fundo') return t.st < 2 ? 'Descendo ao fundo do mar aberto para catar peixes' : 'Catando peixes na areia do fundo do mar';
    if (t.type === 'sair') return 'Correndo antes que o mar se feche!';
    return oldText(v, t);
  };
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) { if (prevUpd) prevUpd(dt); if (G.S.parts && G.S.parts.length) update(dt); };
  G.worldHooks.push(() => { const S = G.S; if (S) S.dry = null; }); // (a new world, or a save loaded: the marks come back from the partings)
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.parts && G.S.parts.length) out.parts = G.S.parts; },
    load(o) {
      const S = G.S; const fin = Number.isFinite; const ST = { abre: 1, aberto: 1, fecha: 1 };
      // (a damaged parting is dropped — the sea simply stays closed there); the bed comes back from the open ones
      S.parts = Array.isArray(o.parts) ? o.parts.filter(p => p && ST[p.st] && fin(p.t) && fin(p.ax) && fin(p.ay) && fin(p.bx) && fin(p.by) && Array.isArray(p.tiles)).map(p => Object.assign(p, { tiles: p.tiles.filter(i => Number.isInteger(i) && i >= 0 && i < N * N && S.type[i] <= T.SEA), in: p.in && typeof p.in === 'object' ? p.in : {} })).slice(0, 2) : [];
      S.dry = null; const D = S.parts.some(p => p.st !== 'abre') ? dryMap() : null;
      if (D) for (const p of S.parts) if (p.st !== 'abre') for (const i of p.tiles) D[i] = 1;
      if (D) tellMaps();
    },
  });

  // ------------------------------ drawing ------------------------------
  // the bed between the walls: wet sand, puddles, weed, the fish left flapping; the walls of water stand on its edges
  const quad = (ctx, proj, x, y, h) => {
    const a = proj(x, y, h(x, y)), b = proj(x + 1, y, h(x + 1, y)), c = proj(x + 1, y + 1, h(x + 1, y + 1)), d = proj(x, y + 1, h(x, y + 1));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
  };
  // how far the waters have drawn back (0 .. 1): opening from the middle out, falling in the last seconds
  function open(p, tx, ty) {
    if (p.st === 'abre') { const L = Math.hypot(p.bx - p.ax, p.by - p.ay) || 1; const u = G.dist(tx, ty, p.x, p.y) / (L * 0.6); return G.clamp(p.t / OPENING * 1.3 - u * 0.5, 0, 1); }
    if (p.st === 'fecha') return G.clamp((LAST() - p.t) / 1.6, 0, 1);
    return 1;
  }
  const EDGES = [[0, -1, 0, 0, 1, 0], [1, 0, 1, 0, 1, 1], [0, 1, 1, 1, 0, 1], [-1, 0, 0, 1, 0, 0]]; // neighbour dx, dy and the two corners of the shared side
  // (the walls stand well above the sea around them — that is the miracle; they sway, and tremble at the end)
  function wallTop(t, p, x, y, k, trem) { return G.SEA + 4.4 + Math.sin(t * 2.2 + x * 1.7 + y * 1.3) * 0.35 + (trem ? Math.sin(t * 31 + x * 5) * 0.5 : 0) - (1 - k) * 7; }
  function walls(ctx, proj, t, back) {
    const S = G.S; const R = G.Render; const V = R.tileView;
    for (const p of S.parts || []) {
      const set = new Set(p.tiles); const trem = p.st === 'fecha';
      for (const i of p.tiles) {
        const x = i % N, y = (i / N) | 0; if (V && (x < V[0] - 1 || y < V[1] - 1 || x > V[2] + 1 || y > V[3] + 1)) continue;
        const k = open(p, x + 0.5, y + 0.5); if (k <= 0) continue;
        const dme = R.depth(x + 0.5, y + 0.5);
        for (const [dx, dy, c0x, c0y, c1x, c1y] of EDGES) {
          const nx = x + dx, ny = y + dy; if (!W.inb(nx, ny)) continue; const j = ny * N + nx;
          if (set.has(j) || !sea(j)) continue; // (a wall only where the bed meets the held-back sea)
          const behind = R.depth(nx + 0.5, ny + 0.5) < dme; if (behind !== back) continue;
          const ax = x + c0x, ay = y + c0y, bx = x + c1x, by = y + c1y;
          const fa = Math.min(W.hAt(ax, ay), G.SEA), fb = Math.min(W.hAt(bx, by), G.SEA);
          const ta = wallTop(t, p, ax, ay, k, trem), tb = wallTop(t, p, bx, by, k, trem);
          const pa = proj(ax, ay, fa), pb = proj(bx, by, fb), qa = proj(ax, ay, Math.max(fa, ta)), qb = proj(bx, by, Math.max(fb, tb));
          const g = ctx.createLinearGradient(0, Math.min(qa[1], qb[1]), 0, Math.max(pa[1], pb[1]));
          if (back) { g.addColorStop(0, 'rgba(150,222,236,0.95)'); g.addColorStop(0.35, 'rgba(48,140,168,0.96)'); g.addColorStop(1, 'rgba(14,52,78,0.98)'); }
          else { g.addColorStop(0, 'rgba(170,232,244,0.62)'); g.addColorStop(1, 'rgba(30,96,130,0.5)'); }
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.lineTo(qb[0], qb[1]); ctx.lineTo(qa[0], qa[1]); ctx.closePath(); ctx.fill();
          // (light running up the face, a fish's shadow passing inside it)
          const sh = (t * 0.35 + G.hash(i * 3 + dx * 7 + dy)) % 1;
          ctx.strokeStyle = `rgba(220,248,255,${0.22 * k})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pa[0] + (pb[0] - pa[0]) * 0.5, pa[1] + (pb[1] - pa[1]) * 0.5 - (1 - sh) * (pa[1] - qa[1]) * 0.9); ctx.lineTo(pa[0] + (pb[0] - pa[0]) * 0.55, pa[1] + (pb[1] - pa[1]) * 0.55 - (1 - sh) * (pa[1] - qa[1]) * 0.9 - 5); ctx.stroke();
          if (back && G.hash(i * 11 + dx + dy * 5) < 0.3) { const u = (t * 0.08 + G.hash(i)) % 1; const fx = pa[0] + (pb[0] - pa[0]) * u, fy = pa[1] + (pb[1] - pa[1]) * u - (pa[1] - qa[1]) * 0.45; ctx.fillStyle = 'rgba(8,30,44,0.55)'; ctx.beginPath(); ctx.ellipse(fx, fy, 3, 1.2, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(fx - 3, fy); ctx.lineTo(fx - 5, fy - 1.4); ctx.lineTo(fx - 5, fy + 1.4); ctx.fill(); }
          // the foam on the crest
          ctx.strokeStyle = `rgba(255,255,255,${0.85 * k})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(qa[0], qa[1]); ctx.lineTo(qb[0], qb[1]); ctx.stroke();
          if (G.hash(i * 5 + Math.floor(t * 6) + dx) < 0.18) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(qa[0] + (qb[0] - qa[0]) * 0.5, qa[1] - 3 - G.hash(i + Math.floor(t * 6)) * 4, 1.6, 1.6); }
        }
      }
    }
  }
  const prevDG = P.drawGround;
  P.drawGround = function (ctx, proj, t) {
    if (prevDG) prevDG(ctx, proj, t);
    const S = G.S; const L = S.parts; if (!L || !L.length) return;
    const V = G.Render.tileView;
    const vis = (x, y) => !V || !(x < V[0] || y < V[1] || x > V[2] || y > V[3]);
    for (const p of L) {
      // (the water's own surface over the bed, hidden first, all of it: the hole in the sea — then the bed under it)
      for (const i of p.tiles) {
        const x = i % N, y = (i / N) | 0; if (!vis(x, y)) continue;
        const k = open(p, x + 0.5, y + 0.5); if (k <= 0) continue;
        quad(ctx, proj, x, y, () => G.SEA); ctx.fillStyle = `rgba(16,58,84,${0.9 * k})`; ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke();
      }
      for (const i of p.tiles) {
        const x = i % N, y = (i / N) | 0; if (!vis(x, y)) continue;
        const k = open(p, x + 0.5, y + 0.5); if (k <= 0) continue;
        const fl = (xx, yy) => Math.min(W.hAt(xx, yy), G.SEA) + (1 - k) * (G.SEA - Math.min(W.hAt(xx, yy), G.SEA));
        quad(ctx, proj, x, y, fl);
        const deep = G.clamp((G.SEA - W.hAt(x + 0.5, y + 0.5)) / 6, 0, 1), h = G.hash(i * 13);
        ctx.fillStyle = `rgba(${Math.round(196 - deep * 70 + h * 14)},${Math.round(178 - deep * 62 + h * 10)},${Math.round(132 - deep * 40)},${k})`; ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.1; ctx.stroke(); // (no seams between the tiles of the bed)
        const c = proj(x + 0.5, y + 0.5, fl(x + 0.5, y + 0.5));
        // (a puddle, weed, shells, a fish left behind)
        if (h < 0.22) { ctx.fillStyle = `rgba(90,150,170,${0.55 * k})`; ctx.beginPath(); ctx.ellipse(c[0] + (G.hash(i) - 0.5) * 10, c[1], 6 + h * 12, 2.5 + h * 4, 0, 0, TAU); ctx.fill(); }
        else if (h < 0.4) { ctx.strokeStyle = `rgba(60,110,50,${0.8 * k})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(c[0] - 5, c[1] + 1); ctx.quadraticCurveTo(c[0], c[1] - 4, c[0] + 5, c[1] + 1); ctx.stroke(); }
        else if (h < 0.55) { ctx.fillStyle = `rgba(250,244,230,${0.9 * k})`; ctx.fillRect(c[0] - 3, c[1], 1.5, 1.2); ctx.fillRect(c[0] + 2, c[1] - 2, 1.2, 1.2); }
        if (G.hash(i * 29) < (p.fish - p.fished) / p.tiles.length * 1.6 && p.st !== 'abre') {
          const fl2 = Math.sin(t * 9 + i) > 0.6 ? -2 : 0; ctx.fillStyle = `rgba(200,214,224,${k})`; ctx.beginPath(); ctx.ellipse(c[0] + 4, c[1] - 1 + fl2, 3.2, 1.3, Math.sin(t * 7 + i) * 0.4, 0, TAU); ctx.fill();
        }
      }
    }
    walls(ctx, proj, t, true);
  };
  // the front walls, after the people: translucent, the ones down there seen through the water
  const prevDW = P.drawWorld;
  P.drawWorld = function (ctx, proj, t) {
    if (prevDW) prevDW(ctx, proj, t);
    if (G.S.parts && G.S.parts.length) walls(ctx, proj, t, false);
  };
})(window.G);
