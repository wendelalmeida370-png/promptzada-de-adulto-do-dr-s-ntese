'use strict';
// ============================================================
//  Nests and dams: the homes the animals build, which people
//  stop to look at. Parrots, ravens, herons, toucans and owls in
//  the big trees; storks on the roofs of the houses (and the
//  house with a stork on it, people say, will have a child);
//  eagles and gulls on the cliffs; geese and penguins on the
//  ground. Sticks first, then eggs, a parent sitting on them,
//  chicks with their beaks open — and one day the young fly.
//  Beavers gnaw down the trees by a stream and dam it, and
//  build their lodge in the still water behind.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Ne = G.Nests = {};
  const A = G.Animals; const SP = A.DEF;
  const TAU = Math.PI * 2;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const nests = () => G.S.nests || (G.S.nests = []);
  const dams = () => G.S.dams || (G.S.dams = []);

  // ------------------------------ where each kind nests ------------------------------
  const ROOFS = { hut: 15, house: 19, sobrado: 28, insula: 38, quarteirao: 40, temple: 32, torre: 44, storehouse: 22, workshop: 24, palacio: 40, quartel: 24, celeiro: 22, biblioteca: 24 };
  const EGG = { goose: '#f2ecd8', penguin: '#f6f6f2', gull: '#c8c0a0', eagle: '#ece4d0', raven: '#7aa8a0', parrot: '#f6f2e8', heron: '#a8c8c0', stork: '#f6f2ea', toucan: '#f6f2ea', owl: '#f6f6f2' };
  function onTree(t) { for (const n of nests()) if (n.type === 'tree' && n.host === t.id) return true; return false; }
  function onRoof(b) { for (const n of nests()) if (n.type === 'roof' && n.host === b.id) return true; return false; }
  Ne.storkOn = bid => nests().some(n => n.type === 'roof' && n.host === bid && n.st !== 'empty');
  function site(a, type) {
    const S = G.S;
    if (type === 'tree') { const t = A.treeNear(a.x, a.y, 7, q => q.stage === 'grow' && q.size > 0.75 && !onTree(q) && q.kind !== 'cactus'); return t ? { host: t.id, x: t.x, y: t.y } : null; }
    if (type === 'roof') {
      let best = null, bd = 16 * 16;
      for (const b of S.buildings.values()) { if (!b.built || !ROOFS[b.type] || onRoof(b)) continue; const d = G.dist2(b.x + b.w / 2, b.y + b.h / 2, a.x, a.y); if (d < bd) { bd = d; best = b; } }
      return best ? { host: best.id, x: best.x + best.w / 2, y: best.y + best.h / 2 } : null;
    }
    for (let k = 0; k < 40; k++) {
      const x = Math.floor(a.x + G.rr(-8, 8)), y = Math.floor(a.y + G.rr(-8, 8)); if (!W.inb(x, y)) continue; const i = y * N + x;
      if (S.type[i] < T.SAND || S.type[i] === T.RIVER || S.occ[i] || S.treeAt[i] || S.objAt[i]) continue;
      if (type === 'cliff') { if (!(S.cliff && S.cliff[i]) && S.type[i] !== T.ROCKY) continue; }
      else if (type === 'ground') { let wet = false; for (let dy = -3; dy <= 3 && !wet; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (W.inb(xx, yy) && S.type[yy * N + xx] <= T.RIVER) { wet = true; break; } } if (!wet) continue; }
      if ([...S.settlements.values()].some(s => G.dist(s.cx, s.cy, x, y) < (s.radius || 6))) continue;
      return { host: 0, x: x + 0.5, y: y + 0.5 };
    }
    return null;
  }
  function tryNest(kind) {
    const S = G.S; const sp = SP[kind]; const type = sp.nests;
    const birds = []; for (const a of S.animals.values()) if (a.kind === kind && !a.dead && !a.held && !a.tamed && (a.grown === undefined || a.grown >= 1) && !a.nest) birds.push(a);
    if (birds.length < 2) return;
    const have = nests().filter(n => n.kind === kind).length; if (have >= Math.min(6, Math.floor(birds.length / 2) + 1)) return;
    const a = birds[Math.floor(G.R() * birds.length)];
    const s = site(a, type); if (!s) return;
    const n = { id: S.nextId++, kind, type, host: s.host, x: s.x, y: s.y, st: 'build', t: 0, eggs: 0, chicks: 0, parent: a.id };
    nests().push(n); a.nest = n.id; a.hx = s.x; a.hy = s.y;
    if (type === 'roof' && G.R() < 0.6) { const b = S.buildings.get(s.host); const set = b && S.settlements.get(b.set); const f = set && G.Fac.get(set.fac); if (set && !(f && f._storkLog)) { if (f) f._storkLog = S.day; log(`Um casal de cegonhas fez ninho no telhado ${b.type === 'temple' ? 'do templo' : b.type === 'torre' ? 'da torre' : 'de uma casa'} de ${set.name}. Dizem que cegonha no telhado traz filho para a casa.`, 'bird', s.x, s.y); } }
  }
  // the year of a nest
  function nestTick(dt) {
    const S = G.S; const list = nests();
    for (let k = list.length - 1; k >= 0; k--) {
      const n = list[k]; n.t += dt;
      // the tree fell, the house burned: the nest is gone
      const host = n.type === 'tree' ? S.trees.get(n.host) : n.type === 'roof' ? S.buildings.get(n.host) : 1;
      if (!host || (n.type === 'tree' && host.stage !== 'grow') || (n.type === 'roof' && !host.built) || S.fire[W.idx(n.x, n.y)] > 0.3) { dropParent(n); list.splice(k, 1); continue; }
      const sp = SP[n.kind];
      if (n.st === 'build' && n.t > DAY() * 0.12) { n.st = 'eggs'; n.t = 0; n.eggs = n.kind === 'penguin' ? 1 : n.kind === 'eagle' ? 2 : 2 + Math.floor(G.R() * 3); }
      else if (n.st === 'eggs' && n.t > DAY() * 0.22) { n.st = 'chicks'; n.t = 0; n.chicks = n.eggs; n.eggs = 0; }
      else if (n.st === 'chicks' && n.t > DAY() * 0.28) {
        // the young fly
        for (let q = 0; q < n.chicks; q++) A.spawn(n.kind, n.x + G.rr(-0.6, 0.6), n.y + G.rr(-0.6, 0.6), { grown: 0.45, age: 0 });
        n.st = 'empty'; n.t = 0; n.chicks = 0; dropParent(n);
        if (!S.firstFledge) { S.firstFledge = S.day; log(`Os filhotes ${sp.g === 'f' ? 'da' : 'do'} ${sp.name.toLowerCase()} deixaram o ninho${G.Stories ? G.Stories.where(n.x, n.y).at : ''} e voaram pela primeira vez.`, 'bird', n.x, n.y); }
      } else if (n.st === 'empty' && n.t > DAY()) { list.splice(k, 1); continue; }
      // a parent that died leaves the eggs cold
      if ((n.st === 'eggs' || n.st === 'chicks') && !S.animals.has(n.parent) && n.t > DAY() * 0.05) { n.st = 'empty'; n.t = 0; n.eggs = 0; n.chicks = 0; }
      // ravens and foxes rob the ground nests
      if (n.type === 'ground' && n.st === 'eggs' && G.R() < dt * 0.004) { let thief = null; A.near(n.x, n.y, 5, o => { if (!o.dead && (o.kind === 'raven' || o.kind === 'fox' || o.kind === 'arcticfox' || o.kind === 'gull')) thief = o; }); if (thief && n.eggs > 0) { n.eggs--; thief.hunger = Math.max(0, thief.hunger - 0.3); } }
    }
  }
  function dropParent(n) { const a = G.S.animals.get(n.parent); if (a && a.nest === n.id) a.nest = 0; }

  // ------------------------------ people stop to look ------------------------------
  Ne.watchTask = function (v, H) {
    const S = G.S; let best = null, bd = 18 * 18;
    for (const n of nests()) { if (n.st === 'empty' || n.st === 'build' && G.R() < 0.5) continue; const d = G.dist2(n.x, n.y, v.x, v.y); if (d < bd && W.sameLand(v.x, v.y, n.x, n.y)) { bd = d; best = n; } }
    if (!best) return null;
    const p = W.randomNear(best.x + G.rr(-2.2, 2.2), best.y + G.rr(-2.2, 2.2), 1.5); if (!p) return null;
    return H.setTask(v, { type: 'nestwatch', id: best.id, x: p[0], y: p[1], pri: 0.35 });
  };
  Ne.run = function (v, t, dt, H) {
    if (t.type !== 'nestwatch') return false;
    const n = nests().find(q => q.id === t.id); if (!n) { H.end(v); return true; }
    if (!t.st) { if (!t.go) { t.go = 1; if (!H.goto(v, t.x, t.y, false)) { H.end(v); return true; } } if (H.move(v, dt, 0.8)) { t.st = 1; v.actT = 0; t.dur = G.rr(8, 14); } return true; }
    v.act = 'look'; G.faceTo(v, n.x - v.x, n.y - v.y);
    if (G.R() < dt * 0.1) G.Vg.emote(v, v.age < 12 ? 'awe' : G.pick(['heart', 'awe', 'happy']), 1.4);
    if (!t.noted && v.actT > 3) {
      t.noted = 1; const S = G.S; const set = S.settlements.get(v.set); const seen = S.nestSeen || (S.nestSeen = {}); const key = (set ? set.id : 0) + n.kind;
      if (!seen[key] && set) {
        seen[key] = S.day; const sp = SP[n.kind];
        const what = n.st === 'chicks' ? `os filhotes ${sp.g === 'f' ? 'da' : 'do'} ${sp.name.toLowerCase()} abrindo o bico à espera de comida` : `${sp.g === 'f' ? 'a' : 'o'} ${sp.name.toLowerCase()} chocando os ovos`;
        log(`${v.age < 14 ? 'As crianças' : 'A gente'} de ${set.name} ${v.age < 14 ? 'passam' : 'passa'} a tarde olhando o ninho ${n.type === 'roof' ? 'no telhado' : n.type === 'cliff' ? 'no penhasco' : n.type === 'tree' ? 'na árvore' : 'no chão'}: ${what}.`, 'bird', n.x, n.y);
      }
    }
    if (v.actT > t.dur) H.end(v);
    return true;
  };
  Ne.taskText = (v, t) => (t.type === 'nestwatch' ? 'Olhando um ninho' : null);

  // ------------------------------ beavers ------------------------------
  function narrowRiver(x0, y0, r) {
    const S = G.S; let best = null, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = Math.floor(x0) + dx, y = Math.floor(y0) + dy; if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] !== T.RIVER) continue;
      let w = 0; for (let k = -2; k <= 2; k++) for (let q = -2; q <= 2; q++) { const xx = x + q, yy = y + k; if (W.inb(xx, yy) && S.type[yy * N + xx] === T.RIVER) w++; }
      if (w > 9) continue; // a stream, not a lake
      if (!A.treeNear(x + 0.5, y + 0.5, 5, t => t.stage === 'grow')) continue;
      if (dams().some(d => G.dist(d.x, d.y, x, y) < 10)) continue;
      const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [x + 0.5, y + 0.5]; }
    }
    return best;
  }
  function beaverTick(dt) {
    const S = G.S; if (!SP.beaver) return;
    for (const a of S.animals.values()) {
      if (a.kind !== 'beaver' || a.dead || a.held) continue;
      let d = a.dam && dams().find(q => q.id === a.dam);
      if (!d) { d = dams().find(q => G.dist(q.x, q.y, a.x, a.y) < 10); if (!d && G.R() < dt * 0.02) { const p = narrowRiver(a.x, a.y, 8); if (p) { d = { id: S.nextId++, x: p[0], y: p[1], prog: 0, trees: 0 }; dams().push(d); } } if (d) a.dam = d.id; else continue; }
      // gnawing a tree down by the stream
      if (!a.gnawTree) { if (G.R() < dt * 0.04) { const t = A.treeNear(d.x, d.y, 5, q => q.stage === 'grow' && q.size > 0.4 && !q.gnaw); if (t) { a.gnawTree = t.id; t.gnaw = a.id; a.hx = t.x + 0.3; a.hy = t.y + 0.3; a.mig = true; } } continue; }
      const t = S.trees.get(a.gnawTree); if (!t || t.stage !== 'grow') { a.gnawTree = 0; continue; }
      const dd = G.dist(a.x, a.y, t.x + 0.4, t.y + 0.3);
      if (dd > 3) continue;
      if (dd > 0.5) { const f = Math.min(1, dt * 1.2 / dd); a.x += (t.x + 0.4 - a.x) * f; a.y += (t.y + 0.3 - a.y) * f; a.moving = true; G.faceTo(a, t.x - a.x, t.y - a.y); continue; }
      a.moving = false; a.state = 'idle'; a.t = Math.max(a.t || 0, 0.6); G.faceTo(a, t.x - a.x, t.y - a.y);
      a.gnawT = (a.gnawT || 0) + dt; if (G.R() < dt * 3) G.FX && G.FX.chips(t.x, t.y, '#c9a26b');
      if (a.gnawT > 16) {
        a.gnawT = 0; a.gnawTree = 0; t.gnaw = 0; G.Nature.fellTree(t, a.face || 1);
        d.prog = Math.min(1, d.prog + 0.22); d.trees++;
        if (d.prog >= 0.44 && !d.lodge) { d.lodge = 1; }
        if (!S.damSeen) { S.damSeen = S.day; log(`Os castores derrubaram as árvores da margem e represaram o riacho${G.Stories ? G.Stories.where(d.x, d.y).at : ''}. Atrás da represa, a água parou e virou um lago pequeno com a toca deles no meio.`, 'deer', d.x, d.y); }
      }
    }
  }

  // ------------------------------ update ------------------------------
  let tN = 0, tT = 0;
  Ne.update = function (dt) {
    const S = G.S; if (!S) return;
    tN += dt; tT += dt; beaverTick(dt);
    if (tN >= 3) { nestTick(tN); tN = 0; }
    if (tT >= 12) { tT = 0; for (const k in SP) if (SP[k].nests && G.R() < 0.5) tryNest(k); }
  };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.nests = G.S.nests || []; out.dams = G.S.dams || []; },
    load(o) { G.S.nests = o.nests || []; G.S.dams = o.dams || []; },
  });

  // ------------------------------ drawing ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const ent = new WeakMap();
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S || zoom < 0.8) return;
    for (const n of S.nests || []) {
      let e = ent.get(n); if (!e) ent.set(n, e = { n, fn: drawNest });
      if (n.type === 'tree') { const t = S.trees.get(n.host); if (t) add(t.x + t.y + 0.07, e, t.x, t.y); }
      else if (n.type === 'roof') { const b = S.buildings.get(n.host); if (b) add(b.x + b.y + b.w + b.h - 0.9, e, b.x + b.w / 2, b.y + b.h / 2); }
      else add(n.x + n.y + 0.05, e, n.x, n.y);
    }
    for (const d of S.dams || []) { let e = ent.get(d); if (!e) ent.set(d, e = { d, fn: drawDam }); add(d.x + d.y + 0.2, e, d.x, d.y); }
  });
  function nestZ(n) {
    const S = G.S;
    if (n.type === 'tree') { const t = S.trees.get(n.host); return t ? A.canopyZ(t) + 2 : 14; }
    if (n.type === 'roof') { const b = S.buildings.get(n.host); return b ? (ROOFS[b.type] || 26) + 1 : 26; }
    if (n.type === 'cliff') return 1.5;
    return 0.4;
  }
  function drawNest(c, e, sx, sy, t) {
    const n = e.n; const sp = SP[n.kind]; if (!sp) return;
    const y = sy - nestZ(n); const x = sx + (n.type === 'tree' ? 1.5 : n.type === 'roof' ? -4 : 0);
    const big = n.kind === 'stork' || n.kind === 'eagle' ? 1.5 : n.kind === 'penguin' || n.kind === 'goose' ? 1.1 : 0.9;
    // the bowl of sticks (a scrape of pebbles on the ground)
    if (n.type === 'ground') { c.fillStyle = n.kind === 'penguin' ? '#8a8478' : '#b8a070'; c.beginPath(); c.ellipse(x, y, 3 * big, 1.4 * big, 0, 0, TAU); c.fill(); }
    else {
      c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(x, y, 3.2 * big, 1.6 * big, 0, 0, TAU); c.fill();
      c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.45; for (let k = 0; k < 7; k++) { const a = k * 0.9 + n.id; c.beginPath(); c.moveTo(x + Math.cos(a) * 3.4 * big, y + Math.sin(a) * 1.6 * big); c.lineTo(x - Math.cos(a) * 2.6 * big, y - Math.sin(a + 1) * 1.2 * big); c.stroke(); }
      c.fillStyle = '#4a3220'; c.beginPath(); c.ellipse(x, y - 0.5, 2.2 * big, 0.9 * big, 0, 0, TAU); c.fill();
    }
    if (n.st === 'build') { // a parent bringing a twig
      if (G.S.animals.has(n.parent) && Math.sin(t * 0.7 + n.id) > 0) bird(c, sp, x + 0.6, y - 1.2, big, false, t, true);
      return;
    }
    const parentHere = G.S.animals.has(n.parent) && Math.sin(t * 0.25 + n.id) > -0.4;
    if (n.st === 'eggs') {
      if (parentHere) { bird(c, sp, x, y - 1.6 * big, big, true, t); return; }
      c.fillStyle = EGG[n.kind] || '#f2ecd8'; for (let k = 0; k < n.eggs; k++) { c.beginPath(); c.ellipse(x - 1.2 * big + k * 0.9 * big, y - 0.8, 0.55 * big, 0.75 * big, 0.2, 0, TAU); c.fill(); }
      return;
    }
    if (n.st === 'chicks') {
      for (let k = 0; k < n.chicks; k++) { const cx = x - 1.3 * big + k * 1 * big, cy = y - 1.2 - Math.abs(Math.sin(t * 6 + k)) * 0.6; c.fillStyle = n.kind === 'penguin' ? '#8a8a8e' : n.kind === 'goose' ? '#d8c860' : '#c8c0b0'; c.beginPath(); c.arc(cx, cy, 0.8 * big, 0, TAU); c.fill(); if (Math.sin(t * 5 + k * 2) > 0) { c.fillStyle = '#e8a030'; c.beginPath(); c.moveTo(cx - 0.3, cy - 0.6); c.lineTo(cx, cy - 1.6); c.lineTo(cx + 0.3, cy - 0.6); c.fill(); } }
      if (parentHere && Math.sin(t * 0.9 + n.id) > 0.2) bird(c, sp, x + 1.8 * big, y - 2.2 * big, big, false, t, false, true);
    }
  }
  // a simple bird, sitting or standing at the rim (in the species' colours)
  function bird(c, sp, x, y, s, sitting, t, twig, feeding) {
    const b = sp.b || { col: '#6a6a6a', wing: '#4a4a4a', beak: '#e8c83a' };
    c.fillStyle = b.col; c.beginPath(); c.ellipse(x, y, 2.1 * s, sitting ? 1.2 * s : 1.4 * s, 0, 0, TAU); c.fill();
    c.fillStyle = b.wing || b.col; c.beginPath(); c.ellipse(x - 0.4 * s, y - 0.2 * s, 1.5 * s, 0.8 * s, -0.2, 0, TAU); c.fill();
    const hx = x + 1.6 * s, hy = y - (sitting ? 1.2 : 1.8) * s - (feeding ? Math.abs(Math.sin(t * 4)) * 0.8 : 0);
    c.fillStyle = b.col; c.beginPath(); c.arc(hx, hy, 0.85 * s, 0, TAU); c.fill();
    c.fillStyle = b.beak || '#e8c83a'; c.beginPath(); c.moveTo(hx + 0.6 * s, hy - 0.2); c.lineTo(hx + (sp.wader ? 2.6 : 1.6) * s, hy + (feeding ? 0.8 : 0.2)); c.lineTo(hx + 0.6 * s, hy + 0.3); c.fill();
    c.fillStyle = '#1a1a1a'; c.fillRect(hx + 0.1, hy - 0.4, 0.35, 0.35);
    if (twig) { c.strokeStyle = '#7a5a3a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(hx + 0.8 * s, hy); c.lineTo(hx + 3 * s, hy + 1); c.stroke(); }
  }
  // the dam across the stream, the still pond behind, the lodge
  function drawDam(c, e, sx, sy, t) {
    const d = e.d; const p = Math.max(0.2, d.prog);
    if (d.prog >= 0.3) { c.fillStyle = 'rgba(110,170,190,0.45)'; c.beginPath(); c.ellipse(sx - 6, sy - 3, 10 * p, 4.6 * p, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.4; c.beginPath(); c.ellipse(sx - 6, sy - 3, 6 * p + Math.sin(t) * 0.5, 2.6 * p, 0, 0, TAU); c.stroke(); }
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 0.9;
    const n = Math.round(4 + p * 10); for (let k = 0; k < n; k++) { const f = k / n - 0.5; c.beginPath(); c.moveTo(sx + f * 14 - 2, sy + f * 7 - 1.2 + (k % 2)); c.lineTo(sx + f * 14 + 2, sy + f * 7 - 2.4 - (k % 3) * 0.4); c.stroke(); }
    c.fillStyle = '#5a3a20'; c.beginPath(); c.ellipse(sx, sy - 1.2, 7.6 * p, 1.6 * p, 0.46, 0, TAU); c.fill();
    if (d.lodge) { const lx = sx - 7, ly = sy - 4; c.fillStyle = '#6a4a2a'; c.beginPath(); c.moveTo(lx - 4.4, ly); c.quadraticCurveTo(lx, ly - 6, lx + 4.4, ly); c.closePath(); c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.5; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(lx - 3.6 + k * 1.4, ly - 0.2); c.lineTo(lx - 1.6 + k * 0.7, ly - 4.6); c.stroke(); } }
  }
})(window.G);
