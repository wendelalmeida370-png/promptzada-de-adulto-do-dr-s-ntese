'use strict';
// ============================================================
//  Flora: the trees that bear fruit and the bees.
//  Apples and olives and mulberries in the temperate woods,
//  bananas, cacao, coffee, pepper and açaí in the jungle,
//  dates and frankincense where the desert meets water.
//  Fruit ripens on the branch (and is seen there), monkeys,
//  birds and bears eat it, people climb up and fill baskets.
//  Wild bees hang their combs in old trees near the flowers:
//  their honey is taken with smoke — and a bear will take it too.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Fl = G.Flora = {};
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);

  // what each fruit tree gives (food for the pot, or a good worth trading), and how fast it bears
  Fl.KIND = {
    apple: { name: 'macieira', g: 'f', fruit: 'maçãs', good: null, rate: 1.6, food: 3, col: '#d8302a' },
    mulberry: { name: 'amoreira', g: 'f', fruit: 'amoras', good: null, rate: 1.8, food: 2, col: '#4a1a3a' },
    olive: { name: 'oliveira', g: 'f', fruit: 'azeitonas', good: null, rate: 1.1, food: 2, col: '#5a5a3a' },
    banana: { name: 'bananeira', g: 'f', fruit: 'bananas', good: null, rate: 1.4, food: 4, col: '#e8d03a' },
    cacao: { name: 'cacaueiro', g: 'm', fruit: 'cacau', good: 'cacau', rate: 1, food: 0, col: '#e8a030' },
    coffee: { name: 'cafeeiro', g: 'm', fruit: 'café', good: 'cafe', rate: 1.2, food: 0, col: '#c8202a' },
    pepper: { name: 'pimenteira', g: 'f', fruit: 'pimenta', good: 'especiarias', rate: 0.9, food: 0, col: '#c83a2a' },
    acai: { name: 'açaizeiro', g: 'm', fruit: 'açaí', good: null, rate: 1.4, food: 3, col: '#3a1a4a' },
    date: { name: 'tamareira', g: 'f', fruit: 'tâmaras', good: 'tamaras', rate: 1, food: 2, col: '#c8702a' },
    incense: { name: 'olíbano', g: 'm', fruit: 'resina de incenso', good: 'incenso', rate: 0.6, food: 0, col: '#f2e2a8' },
  };
  Fl.isFruit = k => !!Fl.KIND[k];
  const WOODS = { apple: 4, olive: 4, mulberry: 4, banana: 2, cacao: 3, coffee: 1, pepper: 3, acai: 2, date: 3, incense: 2 };
  // (the wood a felled fruit tree gives: lighter than an oak)
  const oldWood = G.Nature.treeWood;
  G.Nature.treeWood = t => (WOODS[t.kind] ? Math.max(1, Math.round(WOODS[t.kind] * t.size)) : oldWood(t));

  // ------------------------------ ripening ------------------------------
  let cur = null, curIt = null, tSlow = 0;
  function eachSlice(n, fn) {
    const S = G.S;
    if (!curIt || cur !== S) { cur = S; curIt = S.trees.values(); }
    for (let k = 0; k < n; k++) { let r = curIt.next(); if (r.done) { curIt = S.trees.values(); r = curIt.next(); if (r.done) return; } fn(r.value); }
  }
  Fl.update = function (dt) {
    const S = G.S; if (!S) return;
    tSlow += dt; if (tSlow < 0.5) return;
    const step = tSlow; tSlow = 0;
    // a slice of the trees every half second: the whole wood is visited every few seconds
    const n = Math.max(40, Math.ceil(S.trees.size / 10));
    const drought = S.weather.drought > 0, rain = S.weather.rain > 0.2;
    eachSlice(n, t => {
      const K = Fl.KIND[t.kind]; if (!K) return;
      if (t.stage !== 'grow' || t.size < 0.55) { t.fruit = 0; return; }
      if (t.fruit === undefined) t.fruit = 0;
      const bees = hiveNear(t.x, t.y, 7) ? 1.35 : 1;
      t.fruit = Math.min(3, t.fruit + step * 10 / DAY() * K.rate * 0.35 * bees * (drought ? 0.25 : rain ? 1.2 : 1) * t.size);
    });
    hives(step);
  };

  // ------------------------------ the wild bees ------------------------------
  const HIVE_TREES = { oak: 1, jungle: 1, baobab: 1, acacia: 1, willow: 1, birch: 1, apple: 1, mulberry: 1, pepper: 1 };
  function hiveNear(x, y, r) { const S = G.S; if (!S.hives) return null; for (const h of S.hives) if (G.dist2(h.x, h.y, x, y) < r * r) return h; return null; }
  Fl.hiveNear = hiveNear;
  function flowersNear(x, y) { const S = G.S; let n = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = Math.floor(x) + dx, yy = Math.floor(y) + dy; if (!W.inb(xx, yy)) continue; const i = yy * N + xx; if (S.type[i] === T.MEADOW || (S.bloom && S.bloom[i] > 0)) n++; } return n; }
  function newHive(t) { const S = G.S; S.hives = S.hives || []; const h = { id: S.nextId++, tree: t.id, x: t.x, y: t.y, honey: G.rr(1, 3), claim: 0, sting: 0 }; S.hives.push(h); return h; }
  Fl.seedHives = function () {
    const S = G.S; S.hives = [];
    const want = Math.max(4, Math.round(S.trees.size / 220));
    const trees = [...S.trees.values()].filter(t => HIVE_TREES[t.kind] && t.size >= 0.8 && t.stage === 'grow');
    for (let k = 0; k < want * 6 && S.hives.length < want && trees.length; k++) {
      const t = trees[Math.floor(G.R() * trees.length)];
      if (hiveNear(t.x, t.y, 9)) continue;
      if (flowersNear(t.x, t.y) < 3 && G.R() < 0.7) continue;
      newHive(t);
    }
  };
  function hives(dt) {
    const S = G.S; if (!S.hives) return;
    for (let k = S.hives.length - 1; k >= 0; k--) {
      const h = S.hives[k]; const t = S.trees.get(h.tree);
      if (!t || t.stage !== 'grow' || S.fire[W.idx(h.x, h.y)] > 0.2) { S.hives.splice(k, 1); continue; } // the tree fell or burned: the swarm leaves
      h.honey = Math.min(4, h.honey + dt / DAY() * (S.weather.drought > 0 ? 0.6 : 2.2));
      if (h.sting > 0) h.sting -= dt;
    }
    // a swarm now and then finds a new tree near the flowers
    if (S.hives.length < Math.max(4, S.trees.size / 160) && G.R() < dt / DAY() * 2) {
      const h0 = S.hives.length ? S.hives[Math.floor(G.R() * S.hives.length)] : null;
      const t = h0 ? G.Animals.treeNear(h0.x + G.rr(-10, 10), h0.y + G.rr(-10, 10), 4, q => HIVE_TREES[q.kind] && q.size >= 0.8 && !hiveNear(q.x, q.y, 6)) : null;
      if (t) newHive(t);
    }
  }
  // a bear (or a person) at the hive: the bees come out in a cloud
  Fl.raidHive = function (h, by) { const n = Math.min(h.honey, 2.5); h.honey -= n; h.sting = 8; G.Audio && G.Audio.at(h.x, h.y, 'bees'); return n; };

  // ------------------------------ people at the trees ------------------------------
  // the nearest tree with ripe fruit (or a hive with honey), for someone out gathering
  Fl.nearestFruit = function (v, r) {
    const S = G.S; let best = null, bd = r * r;
    const x0 = Math.max(0, Math.floor(v.x - r)), x1 = Math.min(N - 1, Math.ceil(v.x + r)), y0 = Math.max(0, Math.floor(v.y - r)), y1 = Math.min(N - 1, Math.ceil(v.y + r));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const id = S.treeAt[y * N + x]; if (!id) continue; const t = S.trees.get(id);
      if (!t || !Fl.KIND[t.kind] || !(t.fruit >= 1) || (t.claim && t.claim !== v.id && S.villagers.has(t.claim)) || S.fire[y * N + x] > 0) continue;
      const d = G.dist2(v.x, v.y, t.x, t.y) - (Fl.KIND[t.kind].good ? 30 : 0); if (d < bd) { bd = d; best = t; }
    }
    return best;
  };
  Fl.nearestHive = function (v, r) { const S = G.S; let best = null, bd = r * r; for (const h of S.hives || []) { if (h.honey < 1.5 || h.sting > 0 || (h.claim && h.claim !== v.id && S.villagers.has(h.claim))) continue; const d = G.dist2(v.x, v.y, h.x, h.y); if (d < bd) { bd = d; best = h; } } return best; };
  Fl.pickTask = function (v, H) {
    const t = Fl.nearestFruit(v, 16); if (!t) return null;
    t.claim = v.id; return H.setTask(v, { type: 'pick', id: t.id, pri: 1, st: 0 });
  };
  Fl.honeyTask = function (v, H) {
    const h = Fl.nearestHive(v, 18); if (!h) return null;
    h.claim = v.id; return H.setTask(v, { type: 'honey', id: h.id, pri: 1, st: 0 });
  };
  Fl.run = function (v, t, dt, H) {
    const S = G.S;
    if (t.type === 'pick') {
      const tr = S.trees.get(t.id); const K = tr && Fl.KIND[tr.kind];
      if (!tr || !K || tr.stage !== 'grow' || !(tr.fruit >= 0.5)) { if (tr) tr.claim = 0; return H.end(v), true; }
      if (t.st === 0) { if (!H.goto(v, tr.x + 0.35, tr.y + 0.35, true)) { tr.claim = 0; return H.end(v), true; } t.st = 1; return true; }
      if (t.st === 1) { if (H.move(v, dt)) { t.st = 2; v.actT = 0; } return true; }
      // reaching up into the branches (the tall palms are climbed)
      v.act = tr.kind === 'date' || tr.kind === 'acai' ? 'climb' : 'pick'; G.faceTo(v, tr.x - v.x, tr.y - v.y);
      if (v.actT < 3.2 / G.Vg.workMul(v)) return true;
      const n = Math.min(tr.fruit, 2); tr.fruit -= n; tr.claim = 0;
      if (K.good) v.carry = { k: K.good, n: Math.max(1, Math.round(n)), basket: K.col };
      else v.carry = { k: 'food', n: Math.max(1, Math.round(n * K.food)), basket: K.col };
      G.Vg.emote(v, 'food', 1.2);
      if (K.good && !S.firstFruit) S.firstFruit = {};
      if (K.good && !S.firstFruit[K.good]) { S.firstFruit[K.good] = S.day; const set = S.settlements.get(v.set); log(`${v.name} colheu ${K.fruit} de ${K.g === 'f' ? 'uma' : 'um'} ${K.name} silvestre${set ? ' perto de ' + set.name : ''}. É a primeira vez que ${set ? 'a gente de ' + set.name : 'alguém'} ${K.good === 'incenso' ? 'sente esse perfume' : 'prova disso'}.`, 'food', tr.x, tr.y); }
      H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1 });
      return true;
    }
    if (t.type === 'honey') {
      const h = (S.hives || []).find(q => q.id === t.id);
      if (!h || h.honey < 1) { if (h) h.claim = 0; return H.end(v), true; }
      if (t.st === 0) { if (!H.goto(v, h.x + 0.4, h.y + 0.4, true)) { h.claim = 0; return H.end(v), true; } t.st = 1; return true; }
      if (t.st === 1) { if (H.move(v, dt)) { t.st = 2; v.actT = 0; } return true; }
      // the smoke first, then the comb — and a few stings anyway
      v.act = 'smoke'; G.faceTo(v, h.x - v.x, h.y - v.y); h.sting = Math.max(h.sting, 2);
      if (G.FX && G.R() < dt * 6) G.FX.spawn({ x: v.x + G.rr(-0.2, 0.2), y: v.y + G.rr(-0.2, 0.2), z: 9, vz: G.rr(6, 12), vx: G.rr(-0.3, 0.3), life: G.rr(1.2, 2), s0: 1.5, s1: 5, c: 'rgba(220,220,220,0.5)', k: 2 });
      if (v.actT < 5 / G.Vg.workMul(v)) return true;
      const n = Fl.raidHive(h, v); h.claim = 0;
      if (G.R() < 0.35) { G.Vg.emote(v, 'angry', 1.4); G.Vg.damage(v, 3, 'beast'); }
      v.carry = { k: 'mel', n: Math.max(1, Math.round(n)), jar: false, honey: 1 };
      v._wax = (v._wax || 0) + (G.R() < 0.6 ? 1 : 0);
      H.end(v); G.Vg.setTask(v, { type: 'deliver', pri: 1 });
      return true;
    }
    return false;
  };
  Fl.taskText = function (v, t) {
    if (t.type === 'pick') { const tr = G.S.trees.get(t.id); const K = tr && Fl.KIND[tr.kind]; return K ? (t.st < 2 ? `Indo colher ${K.fruit}` : `Colhendo ${K.fruit} ${K.g === 'f' ? 'numa' : 'num'} ${K.name}`) : 'Colhendo frutas'; }
    if (t.type === 'honey') return t.st < 2 ? 'Indo tirar mel de uma colmeia' : 'Defumando a colmeia para tirar o mel';
    return null;
  };

  // ------------------------------ the animals at the trees ------------------------------
  // (monkeys, toucans and parrots eat fruit where they sit; a bear goes for the honey)
  Fl.animalEat = function (a, tr) { if (tr && tr.fruit > 0) { tr.fruit = Math.max(0, tr.fruit - 0.3); return true; } return false; };

  // ------------------------------ drawing: the hives and their bees ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const hiveEnt = new WeakMap();
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S || !S.hives || zoom < 0.9) return;
    for (const h of S.hives) { const t = S.trees.get(h.tree); if (!t) continue; let e = hiveEnt.get(h); if (!e) hiveEnt.set(h, e = { h, fn: drawHive }); add(t.x + t.y + 0.06, e, t.x, t.y); }
  });
  function drawHive(c, e, sx, sy, t) {
    const h = e.h; const tr = G.S.trees.get(h.tree); if (!tr) return;
    const s = tr.size; const hx = sx + 2.6 * s, hy = sy - (tr.kind === 'jungle' ? 14 : 11) * s;
    // the comb hanging under a branch, golden when full
    c.fillStyle = '#6a4a2a'; c.fillRect(hx - 0.3, hy - 2.6, 0.6, 1.2);
    c.fillStyle = h.honey > 2 ? '#d8a02a' : '#b8862a'; c.beginPath(); c.ellipse(hx, hy, 1.7, 2.3, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(90,60,20,0.6)'; c.lineWidth = 0.25; for (let k = -1; k <= 1; k++) { c.beginPath(); c.ellipse(hx, hy + k * 0.7, 1.6 - Math.abs(k) * 0.4, 0.3, 0, 0, Math.PI * 2); c.stroke(); }
    // the bees: a few dots wandering round, a cloud when they are angry
    const n = h.sting > 0 ? 18 : 5; c.fillStyle = '#2a2010';
    for (let k = 0; k < n; k++) { const a = t * (1.5 + (k % 5) * 0.4) + k * 2.1, r = (h.sting > 0 ? 3.4 : 2.2) + Math.sin(t * 2.3 + k) * 0.8; c.fillRect(hx + Math.cos(a) * r, hy + Math.sin(a * 1.3) * r * 0.7, 0.45, 0.45); }
  }

  // ------------------------------ the new world, saving ------------------------------
  Fl.onWorld = function () {
    const S = G.S;
    // the date palm only where there is water under the sand; elsewhere the desert keeps its cactus
    for (const t of S.trees.values()) {
      if (t.kind === 'date' && !G.Biome.canGrow('date', W.idx(t.x, t.y))) t.kind = S.biome[W.idx(t.x, t.y)] === 6 ? 'cactus' : 'acacia';
      if (Fl.KIND[t.kind]) t.fruit = G.R() * 2;
    }
    Fl.seedHives();
  };
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { const S = G.S; out.hives = (S.hives || []).map(h => [h.id, h.tree, +h.x.toFixed(2), +h.y.toFixed(2), +h.honey.toFixed(1)]); out.fruit = [...S.trees.values()].filter(t => t.fruit > 0.05).map(t => [t.id, +t.fruit.toFixed(1)]); out.firstFruit = S.firstFruit || null; },
    load(o) {
      const S = G.S; S.hives = (o.hives || []).map(a => ({ id: a[0], tree: a[1], x: a[2], y: a[3], honey: a[4], claim: 0, sting: 0 }));
      for (const [id, f] of o.fruit || []) { const t = S.trees.get(id); if (t) t.fruit = f; }
      S.firstFruit = o.firstFruit || null;
      if (!o.hives) Fl.seedHives(); // (an older world: the bees arrive now)
    },
  });
})(window.G);
