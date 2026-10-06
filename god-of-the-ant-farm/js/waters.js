'use strict';
// ============================================================
//  Waters: what lives in each water, and what it is worth.
//  Cod and herring only in the cold seas, sardines in the mild
//  ones, tuna out in the warm deep water, groupers over the
//  reefs, lobsters and octopus among the rocks, shrimp in the
//  muddy mouths and mangroves. Salmon and trout in the cold
//  rivers, carp and eels in the lakes, tilapia and catfish in
//  the warm rivers, the giant pirarucu (and piranhas) in the
//  jungle's. A catch of cod or tuna is a good worth trading;
//  a people that lands a lot of it lives by it. Where the sea
//  is warm and grows coral, divers go down for oysters — and
//  now and then come up with a pearl.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Wa = G.Waters = {};
  const E = G.Eco;
  const TAU = Math.PI * 2;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // where: sea (open), deep, reef, rock (rocky coast and kelp), mud (river mouths, mangroves), river, lake
  // t: the water temperature it lives in (0 frozen .. 1 tropical) · n: food per fish · good: a trade good instead of food
  Wa.FISH = {
    bacalhau: { name: 'bacalhau', col: '#a8a890', where: ['sea', 'deep', 'rock'], t: [0, 0.38], n: 2, good: 'bacalhau', w: 3, first: 'dos mares gelados' },
    arenque: { name: 'arenque', col: '#a8c0d0', where: ['sea', 'deep'], t: [0, 0.5], n: 2, w: 3 },
    sardinha: { name: 'sardinha', col: '#c0d4e2', where: ['sea', 'reef', 'rock'], t: [0.35, 0.78], n: 2, w: 3 },
    atum: { name: 'atum', col: '#3a5a8a', where: ['deep', 'sea'], t: [0.5, 1], n: 3, good: 'atum', w: 2, big: 1, first: 'das águas quentes e fundas' },
    garoupa: { name: 'garoupa', col: '#c87a4a', where: ['reef'], t: [0.55, 1], n: 4, w: 2, big: 1 },
    lagosta: { name: 'lagosta', col: '#c84a2a', where: ['rock'], t: [0.15, 0.65], n: 3, w: 1, shell: 1 },
    polvo: { name: 'polvo', col: '#c87a8a', where: ['rock', 'reef'], t: [0.45, 1], n: 3, w: 1 },
    camarao: { name: 'camarão', col: '#f08a6a', where: ['mud'], t: [0.45, 1], n: 2, good: 'camarao', w: 4, first: 'dos mangues' },
    salmao: { name: 'salmão', col: '#e88a6a', where: ['river'], t: [0, 0.48], n: 3, w: 3, big: 1 },
    truta: { name: 'truta', col: '#8aa86a', where: ['river', 'lake'], t: [0, 0.55], n: 2, w: 3 },
    carpa: { name: 'carpa', col: '#c8a04a', where: ['lake', 'river'], t: [0.3, 0.72], n: 3, w: 3 },
    enguia: { name: 'enguia', col: '#5a5a3a', where: ['lake', 'river', 'mud'], t: [0.25, 0.7], n: 2, w: 1 },
    tilapia: { name: 'tilápia', col: '#9aa0a8', where: ['river', 'lake', 'mud'], t: [0.55, 1], n: 2, w: 3 },
    bagre: { name: 'bagre', col: '#7a6a5a', where: ['river', 'mud'], t: [0.5, 1], n: 3, w: 2 },
    pirarucu: { name: 'pirarucu', col: '#8a3a2a', where: ['river', 'lake'], t: [0.66, 1], n: 7, w: 0.5, big: 1, jungle: 1 },
    piranha: { name: 'piranha', col: '#c84a3a', where: ['river'], t: [0.66, 1], n: 1, w: 1.2, jungle: 1 },
    esturjao: { name: 'esturjão', col: '#6a7a8a', where: ['river', 'lake'], t: [0, 0.5], n: 6, w: 0.35, big: 1 },
  };
  const FISH = Wa.FISH;
  // what kind of water a tile is
  Wa.kind = function (x, y) {
    const S = G.S; if (!W.inb(x, y)) return 'sea'; const i = W.idx(x, y); const t = S.type[i];
    if (t === T.DEEP) return 'deep';
    if (t === T.RIVER) { let n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy; if (W.inb(xx, yy) && S.type[yy * N + xx] === T.RIVER) n++; } return n >= 13 ? 'lake' : 'river'; }
    const fl = G.Sea && G.Sea.floor ? G.Sea.floor[i] : 0; const F = G.Sea ? G.Sea.F : {};
    if (fl === F.REEF) return 'reef'; if (fl === F.KELP || fl === F.ROCK) return 'rock'; if (fl === F.MUD) return 'mud';
    // swamp coasts are mangroves
    if (S.biome) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy; if (W.inb(xx, yy) && S.type[yy * N + xx] >= T.SAND && S.biome[yy * N + xx] === 3) return 'mud'; }
    return 'sea';
  };
  const tempAt = (x, y) => { const S = G.S; if (!S.temp) return 0.5; const i = W.idx(G.clamp(x, 0, N - 1), G.clamp(y, 0, N - 1)); return S.temp[i] / 255; };
  function jungleNear(x, y) { const S = G.S; if (!S.biome) return false; for (let dy = -4; dy <= 4; dy += 2) for (let dx = -4; dx <= 4; dx += 2) { const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy; if (W.inb(xx, yy) && S.type[yy * N + xx] >= T.SAND && (S.biome[yy * N + xx] === 4 || S.biome[yy * N + xx] === 3)) return true; } return false; }
  // the fish that bites here
  Wa.fishAt = function (x, y, boat) {
    let kind = Wa.kind(x, y); if (boat && kind === 'sea' && G.R() < 0.4) kind = 'deep';
    const tp = tempAt(x, y); const jg = jungleNear(x, y);
    const opts = []; let tot = 0;
    for (const k in FISH) { const f = FISH[k]; if (!f.where.includes(kind) || tp < f.t[0] - 0.04 || tp > f.t[1] + 0.04) continue; if (f.jungle && !jg) continue; const w = f.w * (boat && f.big ? 1.6 : 1); opts.push([k, w]); tot += w; }
    if (!opts.length) return kind === 'river' || kind === 'lake' ? 'carpa' : 'sardinha';
    let r = G.R() * tot; for (const [k, w] of opts) { r -= w; if (r <= 0) return k; } return opts[0][0];
  };
  // what a person on the shore pulls out
  Wa.catchCarry = function (v, x, y, n) {
    const k = Wa.fishAt(x, y); const f = FISH[k];
    noteCatch(v, k, x, y);
    if (k === 'piranha' && G.R() < 0.25) { G.Vg.damage(v, 4, 'beast'); G.Vg.emote(v, 'angry', 1.6); }
    if (f.good) return { k: f.good, n: Math.max(1, Math.round(n * 0.6)), fish: k };
    return { k: 'food', n: Math.max(1, Math.round(n * f.n / 2)), fish: k };
  };
  // a boat home with its hold full
  Wa.landBoat = function (s) {
    const k = s.catchKind || 'sardinha'; const f = FISH[k] || FISH.sardinha;
    let food = s.cargo, good = 0;
    if (f.good) { good = Math.max(1, Math.round(s.cargo * 0.45)); food = s.cargo - good; G.Village.addStock(f.good, good, s.fac); const fa = G.Fac.get(s.fac); if (fa) E.made(fa, f.good, good); }
    else food = Math.round(food * f.n / 2.2);
    if (food > 0) G.Village.addStock('food', food, s.fac);
    G.Riches && G.Riches.noteFood(s.fac, 'peixe:' + k, s.cargo);
    G.FX && G.FX.floater(s.x, s.y, `+${s.cargo} ${f.name}`, '#b8e070', 1.6);
    noteCatch({ fac: s.fac }, k, s.x, s.y, s.cargo);
  };
  // the first of each, and the people who live by one
  function noteCatch(v, k, x, y, n) {
    const fid = v.fac || G.Fac.idOfV(v); const fa = G.Fac.get(fid); if (!fa) return;
    const c = fa.catch || (fa.catch = {}); const S = G.S;
    if (!c[k]) {
      c[k] = 0;
      const f = FISH[k]; const near = G.Stories && G.Stories.where ? G.Stories.where(x, y).at : '';
      if (f.good || f.big || k === 'piranha') {
        const who = v.name ? v.name : `Os pescadores de ${fa.name}`;
        const txt = k === 'piranha' ? `${who} puxou do rio um peixe de dentes de navalha: uma piranha${near}. Ninguém mais põe o pé na água ali.`
          : k === 'pirarucu' ? `${who} tirou do rio um pirarucu do tamanho de um homem${near}. Comeram três famílias.`
          : k === 'esturjao' ? `${who} pescou um esturjão antigo, de couraça de placas${near}.`
          : `${who} ${v.name ? 'pescou' : 'pescaram'} o primeiro ${f.name}${f.first ? ' ' + f.first : ''}${near}.`;
        log(txt, 'fish', x, y);
      }
    }
    c[k] += n || 1;
    // a people that lands a lot of one good lives by it
    const f = FISH[k];
    if (f.good && c[k] >= 120 && !(fa.livesBy && fa.livesBy[k])) {
      (fa.livesBy || (fa.livesBy = {}))[k] = S.day;
      const cap = G.Fac.capitalOf(fa.id);
      const TXT = { bacalhau: `${fa.name} vive do bacalhau: as varas de secar cobrem a praia e o cheiro chega antes dos barcos.`, atum: `${fa.name} vive do atum: os barcos voltam pesados, e o atum salgado vai longe.`, camarao: `${fa.name} vive do camarão dos mangues: cestos cheios todo dia.` };
      log(TXT[k] || `${fa.name} vive da pesca de ${f.name}.`, 'fish', cap ? cap.cx : x, cap ? cap.cy : y);
    }
  }

  // ------------------------------ pearl divers ------------------------------
  G.BDEF.perolaria = { name: 'Casa dos Mergulhadores', w: 1, h: 1, cost: { wood: 14 }, work: 14, blocks: true, hp: 80, jobs: 2, role: 'mergulhador' };
  G.BDESC.perolaria = 'À beira dos recifes quentes, mergulhadores descem de fôlego preso atrás de ostras. Quase sempre voltam com comida; às vezes, com uma pérola.';
  G.ROLE.mergulhador = ['Mergulhador', 'Mergulhadora'];
  if (!E.JOB_ROLES.includes('mergulhador')) E.JOB_ROLES.push('mergulhador');
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.mergulhador = '#2a8a9a';
  if (G.City) G.City.IDEAL.perolaria = 8;
  // a reef near the town, warm and shallow
  function reefSpot(x0, y0, R) {
    const S = G.S; if (!G.Sea || !G.Sea.floor) return null; let best = null, bd = 1e9;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = Math.floor(x0) + dx, y = Math.floor(y0) + dy; if (!W.inb(x, y)) continue; const i = y * N + x;
      if (G.Sea.floor[i] !== G.Sea.F.REEF || S.type[i] !== T.SEA) continue;
      // a dry shore tile beside it
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const sx = x + ax, sy = y + ay; if (!W.inb(sx, sy)) continue; const j = sy * N + sx; if (S.type[j] >= T.SAND && S.type[j] !== T.RIVER && W.walkable(j)) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { rx: x + 0.5, ry: y + 0.5, sx: sx + 0.5, sy: sy + 0.5 }; } } }
    }
    return best;
  }
  const oldPlan = E.plan;
  E.plan = function (set, fac, c, want, pop) {
    oldPlan(set, fac, c, want, pop);
    if ((set.tier || 0) >= 1 && pop >= 16 && !(c.perolaria || 0) && !c.siteTypes.perolaria && !(G.City.saving(set, fac) && fac.stock.wood < 40)) {
      if (set._reefDay !== G.S.day) { set._reefDay = G.S.day; set._reef = !!reefSpot(set.cx, set.cy, 14); }
      if (set._reef) want.push('perolaria');
    }
  };
  const oldSite = E.findSite;
  E.findSite = function (set, type) {
    if (type !== 'perolaria') return oldSite(set, type);
    const r = reefSpot(set.cx, set.cy, 14); if (!r) return null; const S = G.S;
    // the hut on the dry ground nearest to that shore
    let best = null, bd = 1e9;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = Math.floor(r.sx) + dx, y = Math.floor(r.sy) + dy; if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] < T.SAND || S.type[i] === T.RIVER || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.road[i] || !W.walkable(i)) continue; let ring = true; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (y + ay) * N + x + ax; if (W.inb(x + ax, y + ay) && S.occ[j]) ring = false; } if (!ring) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [x, y]; } }
    return best;
  };
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A);
    if (E.byType(set.id, 'perolaria').length) out.mergulhador = (out.mergulhador || 0) + Math.min(2, Math.max(1, Math.floor(A * 0.06)));
    return out;
  };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role !== 'mergulhador') return oldJob(v, H);
    const b = v.job && G.S.buildings.get(v.job); if (!b || !b.built) return null;
    const r = reefSpot(b.x + 0.5, b.y + 0.5, 10); if (!r) return null;
    return H.setTask(v, { type: 'dive', id: b.id, rx: r.rx, ry: r.ry, sx: r.sx, sy: r.sy, pri: 1 });
  };
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type !== 'dive') return oldRun(v, t, dt, H);
    if (!t.st) { if (!t.go) { t.go = 1; if (!H.goto(v, t.sx, t.sy, false)) return H.end(v), true; } if (H.move(v, dt)) { t.st = 1; v.actT = 0; t.n = 0; } return true; }
    // into the water, under, up again (two or three dives), then back with the basket
    if (t.st === 1) { v.x = G.lerp(t.sx, t.rx, Math.min(1, v.actT / 1.2)); v.y = G.lerp(t.sy, t.ry, Math.min(1, v.actT / 1.2)); v.act = 'swim'; if (v.actT > 1.2) { t.st = 2; v.actT = 0; G.FX && G.FX.splash(v.x, v.y, 0.5); } return true; }
    if (t.st === 2) { v.act = 'dive'; if (G.R() < dt * 3) G.FX && G.FX.splash(v.x + G.rr(-0.15, 0.15), v.y + G.rr(-0.15, 0.15), 0.12); if (v.actT > 4.5 / (G.Vg.workMul ? G.Vg.workMul(v) : 1)) { t.n++; v.actT = 0; t.st = t.n >= 3 ? 3 : 4; G.FX && G.FX.splash(v.x, v.y, 0.4); } return true; }
    if (t.st === 4) { v.act = 'swim'; if (v.actT > 1.4) { t.st = 2; v.actT = 0; } return true; }
    if (t.st === 3) {
      v.act = 'swim'; v.x = G.lerp(t.rx, t.sx, Math.min(1, v.actT / 1.2)); v.y = G.lerp(t.ry, t.sy, Math.min(1, v.actT / 1.2));
      if (v.actT < 1.2) return true;
      v.x = t.sx; v.y = t.sy; v.act = '';
      // oysters to eat — and maybe a pearl, a branch of coral
      const f = G.Fac.ofV(v); const extra = {};
      const luck = G.R(); const tp = tempAt(t.rx, t.ry);
      if (luck < 0.14 + (tp - 0.6) * 0.2) extra.perolas = 1;
      else if (luck < 0.24) extra.coral = 1;
      v.carry = { k: 'food', n: 3, shell: 1, extra: Object.keys(extra).length ? extra : undefined };
      if (f) E.made(f, 'food', 3);
      if (extra.perolas && f) {
        const c = f.catch || (f.catch = {}); c.perola = (c.perola || 0) + 1;
        const near = G.Stories && G.Stories.where ? G.Stories.where(t.rx, t.ry).at : '';
        if (c.perola === 1) log(`${v.name} subiu do recife${near} com uma ostra na mão e, dentro dela, uma pérola. ${f.name} nunca tinha visto uma.`, 'star', t.rx, t.ry);
        else if (G.R() < 0.06) { extra.perolas = 4; log(`${v.name} achou no recife uma pérola negra, grande como um olho de peixe. Vale um navio.`, 'star', t.rx, t.ry); G.Stories && G.Stories.signal('blackpearl', { who: v.id, fac: f.id, x: t.rx, y: t.ry }); }
      }
      G.Vg.emote(v, extra.perolas ? 'star' : 'food', 1.4);
      H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1, kind: 'work' });
      return true;
    }
    return true;
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) { if (t.type === 'dive') return t.st === 2 ? 'Mergulhando atrás de ostras' : t.st ? 'Nadando sobre o recife' : 'Indo mergulhar no recife'; return oldText(v, t); };
  // the divers' hut: a palm-thatched shed, baskets of shells, a dugout on the sand
  if (G.Arch && G.Arch.EXT) {
    const K = G.Arch.kit(); const { P, box, walls, roof, poly, ln } = K;
    G.Arch.EXT.perolaria = {
      maxz: 30, draw(c, m, p, st) {
        box(c, -0.42, -0.42, 0.2, 0.2, 0, 1, p.base[0], p.base[1], p.base[2]);
        walls(c, -0.38, -0.38, 0.16, 0.16, 1, 8, '#b8905a', '#98703a');
        roof(c, m, p, -0.45, -0.45, 0.24, 0.24, 8, { kind: 'gable', rh: 7, colors: ['#c8a860', '#a8884a', '#8a6a3a'] });
        // a dugout canoe and baskets of shells
        poly(c, [P(0.25, 0.28, 0.4), P(0.48, 0.05, 0.4), P(0.5, 0.1, 1.4), P(0.28, 0.34, 1.4)], '#6a4a2a', 'rgba(0,0,0,0.3)', 0.3);
        for (const [x, y] of [[-0.3, 0.38], [-0.08, 0.42]]) { const q = P(x, y, 0); c.fillStyle = '#a07040'; c.beginPath(); c.ellipse(q[0], q[1] - 1, 1.8, 1.1, 0, 0, TAU); c.fill(); c.fillStyle = '#e8d8c0'; c.beginPath(); c.arc(q[0] - 0.5, q[1] - 1.8, 0.5, 0, TAU); c.arc(q[0] + 0.5, q[1] - 1.9, 0.5, 0, TAU); c.fill(); }
        ln(c, P(0.3, -0.3, 0), P(0.3, -0.3, 9), '#6a4a2c', 0.5); ln(c, P(0.3, -0.3, 8.6), P(0.48, -0.1, 8.2), 'rgba(80,60,40,0.6)', 0.3);
        void st; return 16;
      },
    };
  }
})(window.G);
