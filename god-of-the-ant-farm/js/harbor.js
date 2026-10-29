'use strict';
// ============================================================
//  The harbour: what the merchant ships bring comes ashore in
//  crates on the quay, and the stevedores carry it, crate by
//  crate, into the warehouse by the docks — only then is it in
//  the town's store. What the town sends away goes the same way.
//  A port town grows a warehouse by each dock, and the quay is
//  busy with hands, crates and carts.
// ============================================================
(function (G) {
  let N = G.N; const W = G.W; G.mapHooks.push(n => { N = n; });
  const E = G.Eco; const Hb = G.Harbor = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // ------------------------------ the warehouse and its hands ------------------------------
  Object.assign(G.BDEF, { armazem: { name: 'Armazém do Porto', w: 2, h: 2, cost: { wood: 30, stone: 10 }, work: 30, blocks: true, dropoff: true, storage: 70, hp: 170, jobs: 3, role: 'estivador' } });
  G.BDESC.armazem = 'Onde fica o que os navios trazem e o que a cidade manda para fora. Os estivadores carregam as caixas do cais para dentro.';
  G.ROLE.estivador = ['Estivador', 'Estivadora'];
  if (!E.JOB_ROLES.includes('estivador')) E.JOB_ROLES.push('estivador');
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.estivador = '#7a5a3a';
  if (G.City) G.City.IDEAL.armazem = 9;
  const docksOf = sid => { const out = []; for (const b of G.S.buildings.values()) if (b.type === 'doca' && b.built && b.set === sid) out.push(b); return out; };
  const housesOf = (sid, t) => { const out = []; for (const b of G.S.buildings.values()) if (b.type === t && b.set === sid) out.push(b); return out; };
  // every dock of a real port wants a warehouse at hand
  Hb.plan = function (set, fac, c, want, pop) {
    if ((set.tier || 0) < 2 || pop < 24 || c.siteTypes.armazem) return;
    const docks = docksOf(set.id); if (!docks.length) return;
    const ws = housesOf(set.id, 'armazem');
    if (ws.length >= Math.min(2, docks.length)) return;
    if (docks.some(d => !ws.some(w => G.dist(w.x + 1, w.y + 1, d.x + 1, d.y + 1) < 10))) want.push('armazem');
  };
  // the stevedores: as many as there are crates waiting on the quays (at least one per warehouse)
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A);
    const ws = housesOf(set.id, 'armazem').filter(b => b.built); if (!ws.length) return out;
    let crates = 0; for (const d of docksOf(set.id)) crates += (d.crates || []).length;
    out.estivador = (out.estivador || 0) + Math.min(ws.length * 3, Math.max(ws.length, Math.ceil(crates / 3)));
    return out;
  };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role !== 'estivador') return oldJob(v, H);
    const S = G.S; const w = v.job && S.buildings.get(v.job); if (!w || !w.built || w.type !== 'armazem') return null;
    // the crates on the nearest quay first (the fishermen unload their own catch; the stevedores, everything)
    let best = null, bd = 1e9;
    for (const d of docksOf(v.set)) if ((d.crates && d.crates.length) || G.Porto.opAt(d)) { const dd = G.dist2(w.x, w.y, d.x, d.y); if (dd < bd) { bd = dd; best = d; } }
    if (best && !G.isNight()) { const t = G.Porto.work(v, best, H); if (t) return t; }
    if (G.isNight()) return null;
    return H.setTask(v, { type: 'arrumar', id: w.id, pri: 0.8, st: 0, dur: G.rr(8, 14) });
  };
  // nothing on the quay: stacking and counting what is inside
  function runArrumar(v, t, dt, H) {
    const S = G.S; const w = S.buildings.get(t.id); if (!w || !w.built) return H.end(v);
    if (t.st === 0) { const d = G.Vg.door(w); if (!H.goto(v, d[0] + G.rr(-0.3, 0.3), d[1] + G.rr(-0.2, 0.3), false, 3000)) return H.end(v); t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt)) { t.st = 2; v.actT = 0; } else if (t.walk > 50) H.end(v); return; }
    const [cx, cy] = G.Village.center(w); G.faceTo(v, cx - v.x, cy - v.y);
    v.act = v.actT % 5 < 2.5 ? 'lift' : 'haul';
    if (v.actT > t.dur) H.end(v);
  }
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'arrumar') { runArrumar(v, t, dt, H); return true; } return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'arrumar') return 'Empilhando caixas no armazém do porto';
    return oldText(v, t);
  };

  // the warehouse: a long hall of the town's own style, its wide door open, crates and barrels outside
  if (G.Arch && G.Arch.kit) {
    const { P, box, hall, barrel, jar } = G.Arch.kit();
    G.Arch.EXT.armazem = { maxz: 48, draw(c, m, p, st) {
      const z = hall(c, m, p, st, { x0: -0.92, y0: -0.75, x1: 0.92, y1: 0.62, H: 15, big: true });
      for (const [x, y, s] of [[0.55, 0.86, 1], [0.78, 0.92, 0.8], [0.66, 0.74, 0.7], [-0.75, 0.88, 0.9]]) box(c, x - 0.1 * s, y - 0.1 * s, x + 0.1 * s, y + 0.1 * s, 0, 3.4 * s, '#8a6a44', '#6a4a2c', '#a07a50');
      for (let k = 0; k < 2; k++) { const q = P(-0.42 + k * 0.22, 0.9, 0); if (st === 'asteca' || st === 'egipcio' || st === 'grego') jar(c, q[0], q[1], 1.1, '#b8683a'); else barrel(c, q[0], q[1], 1); }
      return z;
    } };
  }

  // ------------------------------ what the ships bring ------------------------------
  // the cargo comes ashore as the work of an unloading (act-porto.js: crates on the quay, the rest into the store, nothing lost)
  Hb.land = function (dock, goods, ship) { return G.Porto.land(dock, goods, ship); };
})(window.G);
