// mao-regra: the god's hand for a people in a ready world, by the game's rule and never a town by its name — the one rule of
// the proofs that found by the hand (M1's handFor of qa/monumental.js, T-505; the temples of visual/monumental.js, T-515):
//   const handFor = require('./mao-regra.js');   handFor(G, style, type, esc, R) → { set, b, steps, gone }
// Only G, and nothing outside itself: a page takes it whole (window.handFor = <its text>), as visual/monumental.js does.
// (in the metrópole of the generation 15 there was no lot of 10 by Tebas nor by Birka, and the one left in the whole world, by
// Roma, served one people of two, T-505; no lot of 8 for a temple by Roma, Mênfis nor Birka, T-515 —: its towns in the order its
// wonder looks for them (V.startProject, D-121), the capitals first and then the most peopled, the first where the hand
// (V.handFound, within R) finds its lot. With none, the place the proof opens with the game's doors: by the first of those towns,
// of the lots within R whose ground the hand takes — dry, the ring too, no wall, no highway nor fire on the lot: V.handFound's
// rule —, the one with the fewest buildings on it and on its ring, the nearest of those (the hand's order: the plain ones first,
// ring by ring from the town's middle), never one with a cemetery (the god's blows never take one, V.damageBuilding); each falls
// as under the god's meteor (V.destroyBuilding) and its ruin is cleared as its own end clears it (V.removeBuilding), the hand
// founds there, and the world takes the blow in (3 s: the prisoners of a jail that fell go free within 2). → { set, b, steps (the
// town's for the type, before it), gone (what fell for it) | null }; set null: the people has no town. keep: the buildings the
// hand never throws down for it — what a proof founded before, a people's temple beside another's (T-515: the Egyptian's place,
// opened by Mênfis, was the Greek's temple of a moment before)
'use strict';
module.exports = function handFor(G, style, type, esc, R, keep) {
  const S = G.S, V = G.Village, N = G.N, T = G.T; R = R || 60; const n = G.Escala.steps(type).find(q => q.id === esc).n, h = Math.floor(n / 2);
  const caps = new Set(G.Fac.all().filter(f => f.alive).map(f => G.Fac.capitalOf(f.id)).filter(Boolean).map(s => s.id));
  const towns = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === style)
    .sort((a, c) => (caps.has(c.id) ? 1 : 0) - (caps.has(a.id) ? 1 : 0) || V.pop(c.id) - V.pop(a.id) || a.id - c.id);
  const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
  const stepsOf = set => G.Escala.choose(set, type).map(q => q.id);
  for (const set of towns) { const steps = stepsOf(set); const b = sim(() => V.handFound(set, type, esc, { built: true, R })); if (b) return { set, b, steps, gone: null }; }
  // (the ground the hand takes, but for what stands on it → the buildings on the lot and on its ring, or null)
  const ground = (x, y) => { const on = new Map();
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
      if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) return null; const i = ty * N + tx;
      if (S.wall[i] || S.type[i] < T.SAND) return null;
      if (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0)) return null;
      const o = S.occ[i] ? S.buildings.get(S.occ[i]) : null; if (o) { if (o.type === 'cemetery' || (keep && keep.has(o.id))) return null; on.set(o.id, o); } }
    return [...on.values()]; };
  const plain = (x, y) => { if (G.W.slope(x, y, n, n) > V.PODIUM) return false;
    for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) if ((ty < y || ty >= y + n || tx < x || tx >= x + n) && S.cliff[ty * N + tx]) return false; return true; };
  for (const set of towns) {
    const ox = Math.floor(set.cx), oy = Math.floor(set.cy); let best = null;
    for (const pass of [plain, null]) for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - h, y = oy + dy - h;
      const on = ground(x, y); if (!on || (best && on.length >= best.on.length) || (pass && !pass(x, y))) continue; best = { x, y, on }; }
    if (!best) continue;
    const steps = stepsOf(set), gone = best.on.map(o => o.type);
    sim(() => { for (const o of best.on) { if (S.buildings.has(o.id) && o.type !== 'ruin') V.destroyBuilding(o, 'meteor'); if (S.buildings.has(o.id)) V.removeBuilding(o); } });
    // (at once, before a town's planner takes the cleared ground; R 0.5: the hand reads a radius of 0 as none given, and would
    // look 40 round the point — T-435)
    const b = sim(() => V.handFound(set, type, esc, { x: best.x + h, y: best.y + h, R: 0.5, built: true }));
    for (let k = 0; k < 30; k++) G.debug.step(0.1); // (3 s of the world: nodemundo's M.viver(3), in a page too)
    return { set, b, steps, gone };
  }
  return { set: towns[0] || null, b: null, steps: towns[0] ? stepsOf(towns[0]) : [], gone: null };
};
