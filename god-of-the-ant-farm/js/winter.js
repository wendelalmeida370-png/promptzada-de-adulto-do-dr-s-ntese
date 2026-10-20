'use strict';
// ============================================================
//  Inverno Súbito (Natureza): a day of winter falls on a land
//  out of season. Snow covers the fields — what was growing
//  dies, the grass is buried, those caught outside shiver —
//  and the deep rivers and the lakes freeze hard enough to walk
//  on: the people, and the armies, cross where they never could.
//  Then the thaw: the ice breaks, and whoever is still on it
//  goes into the black water.
//  The ice is S.ice (one mark per tile), written only here, and
//  every time it changes the maps of where one can walk are told
//  (W.touchWalk, W.invalidateLand). It is not saved as such: the
//  winters are, and the marks come back from their tiles.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const where = (x, y) => G.Village.nearSettlementName(x, y);

  const WINTER = { id: 'winter', tab: 'natureza', name: 'Inverno Súbito', cost: 45, r: 8, good: false, desc: 'Um dia de inverno cai fora de hora: a neve mata as plantações e enterra o capim, quem está na rua treme — e rios fundos e lagos congelam, virando caminho para gente e exércitos. No degelo, quem estiver no gelo cai na água.' };
  { let k = -1; G.POWERS.forEach((q, i) => { if (q.tab === 'natureza') k = i; }); G.POWERS.splice(k + 1, 0, WINTER); }
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });

  const R = 8, LAST = () => DAY(), MELT = 6;
  // (made only by the world's step: a check or a drawing reads G.S.winters and never creates it)
  function list() { const S = G.S; if (!S.winters) S.winters = []; return S.winters; }
  function ice() { const S = G.S; if (!S.ice || S.ice.length !== N * N) S.ice = new Uint8Array(N * N); return S.ice; }
  const frozen = i => !!(G.S.ice && G.S.ice[i]);
  const shipNear = (x, y) => G.S.ships.some(s => G.dist2(s.x, s.y, x, y) < 2.5 * 2.5);

  // ------------------------------ checks ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (p.id !== 'winter') return prevCheck ? prevCheck(p, x, y) : true;
    const S = G.S; const i = W.idx(x, y);
    if (S.type[i] <= T.SEA) { P.why = 'O inverno cai sobre a terra (o mar não congela).'; return false; }
    if ((S.winters || []).some(w => G.dist(w.x, w.y, x, y) < R * 2)) { P.why = 'Já é inverno aqui.'; return false; }
    if ((S.winters || []).length >= 3) { P.why = 'O mundo já tem invernos demais fora de hora.'; return false; }
    return true;
  };

  // ------------------------------ the cold ------------------------------
  P.winter = function (x, y) {
    const S = G.S; const I = ice();
    const w = { id: S.nextId++, x, y, r: R, t: 0, tiles: [], crops: 0, fell: 0, crossed: 0 };
    for (let ty = Math.floor(y - R); ty <= y + R; ty++) for (let tx = Math.floor(x - R); tx <= x + R; tx++) {
      if (!W.inb(tx, ty) || G.dist(tx + 0.5, ty + 0.5, x, y) > R) continue;
      const i = ty * N + tx;
      // the deep water freezes (not where a boat lies: it is locked in the ice, not under it)
      if (S.type[i] === T.RIVER && S.deep[i] && !S.road[i] && !I[i] && !shipNear(tx + 0.5, ty + 0.5)) { I[i] = 1; w.tiles.push(i); }
      // the snow buries the grass, strips the bushes and kills what grows in the fields
      if (S.veg) S.veg[i] *= 0.25;
      const bu = S.objAt[i] && S.bushes.get(S.objAt[i]); if (bu && bu.berries > 0) bu.berries = 0;
      const b = S.occ[i] && S.buildings.get(S.occ[i]);
      if (b && b.type === 'farm' && b.crops) { const k = G.Village.farmTileIndex(b, tx, ty); const c = k >= 0 && b.crops[k]; if (c && c.s > 0 && G.R() < 0.75) { c.s = 0; c.g = 0; c.c = 0; w.crops++; } }
    }
    if (w.tiles.length) { W.touchWalk(); W.invalidateLand(); }
    list().push(w);
    // whoever is caught outside shivers, and the cold takes its toll
    for (const v of S.villagers.values()) {
      if (v.inside || v.aboard || v.ug || G.dist2(v.x, v.y, x, y) > R * R) continue;
      v.energy = Math.max(5, v.energy - 15); v.fear = Math.min(100, v.fear + 6); G.Vg.emote(v, 'fear', 2);
    }
    G.Audio && G.Audio.play('thunderFar');
    G.FX && G.FX.ring(x, y, 0.5, R + 1, 1.8, 'rgba(225,240,255,0.9)', 2.6, true);
    P.witness(x, y, R + 8, 0, 9);
    const wn = where(x, y);
    log(`Um inverno súbito caiu${wn ? ' sobre ' + wn : ''}: a neve cobriu tudo${w.crops ? `, ${w.crops} ${w.crops > 1 ? 'canteiros morreram' : 'canteiro morreu'}` : ''}${w.tiles.length ? ' e as águas fundas congelaram — agora dá para andar sobre elas' : ''}.`, 'storm', x, y);
    G.Lore && G.Lore.note('winter', { where: wn });
  };
  // the thaw: the ice goes, and the maps hear of it; who stood on it is in the water
  function thaw(w) {
    const S = G.S; const I = ice(); const set = new Set(w.tiles);
    for (const i of w.tiles) I[i] = 0;
    if (w.tiles.length) { W.touchWalk(); W.invalidateLand(); }
    const fell = [];
    for (const v of S.villagers.values()) {
      if (v.aboard || v.inside || v.air || v.held || !W.inb(v.x, v.y) || !set.has(W.idx(v.x, v.y))) continue;
      // (into the black water: the cold bites, and they claw their way to the nearest shore)
      Vg().damage(v, 18, 'drown', true);
      if (!S.villagers.has(v.id)) continue;
      v.energy = Math.max(3, v.energy - 30); G.Vg.emote(v, 'fear', 3);
      const n = W.nearestLand(v.x, v.y, 8); if (n) { v.x = n[0]; v.y = n[1]; v.path = null; G.Vg.endTask(v); }
      G.FX && G.FX.splash(v.x, v.y, 0.4);
      fell.push(v);
    }
    for (const a of S.animals.values()) {
      if (a.dead || !W.inb(a.x, a.y) || !set.has(W.idx(a.x, a.y))) continue;
      const n = W.nearestLand(a.x, a.y, 8); if (n) { a.x = n[0]; a.y = n[1]; }
    }
    w.fell = fell.length;
    const wn = where(w.x, w.y);
    log(`O degelo chegou${wn ? ' a ' + wn : ''}: o gelo rachou e a neve virou lama.${fell.length ? ` ${fell.length > 1 ? fell.length + ' pessoas caíram' : fell[0].name + ' caiu'} na água gelada.` : ''}`, 'storm', w.x, w.y);
    for (const v of fell) G.Life && G.Life.bio(v, 'note', 'Caiu na água gelada quando o gelo do inverno súbito rachou', 'O gelo rachou debaixo dos meus pés');
  }
  const Vg = () => G.Vg;
  function update(dt) {
    const S = G.S; const L = S.winters;
    for (let k = L.length - 1; k >= 0; k--) {
      const w = L[k]; w.t += dt;
      // (a tile the god changed under the ice — raised, sunk — is no longer frozen water)
      if (w.tiles.some(i => S.type[i] !== T.RIVER || !S.deep[i])) { const I = ice(); w.tiles = w.tiles.filter(i => { const ok = S.type[i] === T.RIVER && S.deep[i]; if (!ok) I[i] = 0; return ok; }); W.touchWalk(); W.invalidateLand(); }
      if (w.t >= LAST()) { thaw(w); L.splice(k, 1); }
    }
  }
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) { if (prevUpd) prevUpd(dt); if (G.S.winters && G.S.winters.length) update(dt); };
  G.worldHooks.push(() => { const S = G.S; if (S) S.ice = null; }); // (a new world, or a save loaded: the marks come back from the winters)

  // ------------------------------ drawing ------------------------------
  function quad(ctx, proj, x, y) {
    const a = proj(x, y, W.vh(x, y)), b = proj(x + 1, y, W.vh(x + 1, y)), c = proj(x + 1, y + 1, W.vh(x + 1, y + 1)), d = proj(x, y + 1, W.vh(x, y + 1));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
  }
  const prevDG = P.drawGround;
  P.drawGround = function (ctx, proj, t) {
    if (prevDG) prevDG(ctx, proj, t);
    const S = G.S; const L = S.winters; if (!L || !L.length) return;
    const V = G.Render.tileView;
    for (const w of L) {
      // (the snow comes in over a few seconds and goes in the last ones, as mud)
      const k = G.clamp(w.t / 3, 0, 1) * G.clamp((LAST() - w.t) / MELT, 0, 1);
      if (k <= 0) continue;
      for (let ty = Math.floor(w.y - w.r); ty <= w.y + w.r; ty++) for (let tx = Math.floor(w.x - w.r); tx <= w.x + w.r; tx++) {
        if (!W.inb(tx, ty) || (V && (tx < V[0] || ty < V[1] || tx > V[2] || ty > V[3]))) continue;
        const d = G.dist(tx + 0.5, ty + 0.5, w.x, w.y); if (d > w.r) continue;
        const i = ty * N + tx; const edge = G.clamp((w.r - d) / 2, 0, 1);
        if (frozen(i)) { quad(ctx, proj, tx, ty); ctx.fillStyle = `rgba(214,236,250,${0.92 * k})`; ctx.fill(); if (G.hash(i) < 0.35) { const p = proj(tx + 0.5, ty + 0.5, W.groundH(tx + 0.5, ty + 0.5)); ctx.strokeStyle = `rgba(140,180,210,${0.8 * k})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(p[0] - 6, p[1] - 1); ctx.lineTo(p[0] + 1, p[1] + 1); ctx.lineTo(p[0] + 7, p[1] - 2); ctx.stroke(); } }
        else if (S.type[i] >= T.SAND || (S.type[i] === T.RIVER && !S.deep[i])) { quad(ctx, proj, tx, ty); ctx.fillStyle = `rgba(246,250,255,${(0.55 + 0.25 * G.hash(i * 3)) * k * edge})`; ctx.fill(); }
      }
    }
  };
  const prevDW = P.drawWorld;
  P.drawWorld = function (ctx, proj, t) {
    if (prevDW) prevDW(ctx, proj, t);
    const L = G.S.winters; if (!L || !L.length) return;
    ctx.fillStyle = '#ffffff';
    for (const w of L) {
      const k = G.clamp(w.t / 2, 0, 1) * G.clamp((LAST() * 0.6 - w.t) / 10, 0, 1); if (k <= 0) continue;
      for (let j = 0; j < 160; j++) {
        const h1 = G.hash(j * 7 + w.id), h2 = G.hash(j * 13 + w.id * 3), h3 = G.hash(j * 29 + 1);
        const a = h2 * 6.283, d = Math.sqrt(h1) * w.r; const x = w.x + Math.cos(a) * d, y = w.y + Math.sin(a) * d; if (!W.inb(x, y)) continue;
        const ph = (t * (0.18 + h3 * 0.12) + h1) % 1; const p = proj(x, y, W.groundH(x, y));
        ctx.globalAlpha = k * 0.85 * G.clamp(ph * 5, 0, 1);
        ctx.fillRect(p[0] + Math.sin(t * 1.5 + j) * 4, p[1] - (1 - ph) * 110, 1.6, 1.6);
      }
    }
    ctx.globalAlpha = 1;
  };

  // ------------------------------ save ------------------------------
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.winters && G.S.winters.length) out.winters = G.S.winters; },
    load(o) {
      const S = G.S; const fin = Number.isFinite;
      const L = Array.isArray(o.winters) ? o.winters.filter(w => w && fin(w.x) && fin(w.y) && fin(w.t) && Array.isArray(w.tiles)) : [];
      // (the ice comes back from the winters, on tiles that are still deep water)
      S.ice = null; const I = L.length ? ice() : null;
      for (const w of L) { w.tiles = w.tiles.filter(i => Number.isInteger(i) && i >= 0 && i < N * N && S.type[i] === T.RIVER && S.deep[i]); for (const i of w.tiles) I[i] = 1; }
      S.winters = L.length ? L : null;
      if (L.length) { W.touchWalk(); W.invalidateLand(); }
    },
  });
})(window.G);
