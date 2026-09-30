'use strict';
// ============================================================
//  FX: pooled particles, floating texts, lightning bolts, flash
// ============================================================
(function (G) {
  const FX = G.FX = {};
  const MAX = 3200;
  const pool = [];
  FX.list = [];
  FX.floaters = [];
  FX.bolts = [];
  FX.rings = [];
  FX.flash = 0;
  FX.flashColor = '255,255,255';
  FX.glows = [];

  // kinds: 0 dot, 1 glow, 2 smoke, 3 rain, 4 spark, 5 leaf, 6 debris, 7 heart, 8 star, 9 petal
  FX.spawn = function (o) {
    if (FX.list.length >= MAX) return null;
    const p = pool.pop() || {};
    p.x = o.x; p.y = o.y; p.h = o.h !== undefined ? o.h : G.W.groundH(o.x, o.y);
    p.z = o.z || 0; p.vx = o.vx || 0; p.vy = o.vy || 0; p.vz = o.vz || 0;
    p.g = o.g || 0; p.drag = o.drag || 0; p.life = o.life || 1; p.max = p.life;
    p.s0 = o.s0 !== undefined ? o.s0 : 1; p.s1 = o.s1 !== undefined ? o.s1 : p.s0;
    p.c = o.c || '#fff'; p.a = o.a !== undefined ? o.a : 1; p.k = o.k || 0; p.layer = o.layer || 0;
    p.rot = o.rot || 0; p.vr = o.vr || 0; p.bounce = o.bounce || 0; p.fadeIn = o.fadeIn || 0;
    FX.list.push(p);
    return p;
  };
  FX.update = function (dt, rdt) {
    if (rdt === undefined) rdt = dt;
    const L = FX.list;
    let w = 0;
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      p.life -= dt;
      if (p.life <= 0) { pool.push(p); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= p.g * dt;
      if (p.drag) { const f = Math.max(0, 1 - p.drag * dt); p.vx *= f; p.vy *= f; p.vz *= f; }
      if (p.z < 0) { if (p.bounce) { p.z = 0; p.vz = -p.vz * p.bounce; p.vx *= 0.6; p.vy *= 0.6; if (Math.abs(p.vz) < 20) { p.vz = 0; p.g = 0; p.bounce = 0; } } else if (p.k === 3) { p.life = 0; pool.push(p); if (G.Render && G.Render.cam.zoom > 1.3 && Math.random() < 0.25) FX.spawn({ x: p.x, y: p.y, h: p.h, k: 0, life: 0.25, s0: 0.8, s1: 0.2, c: 'rgba(210,230,255,0.8)' }); continue; } else p.z = 0; }
      p.rot += p.vr * dt;
      L[w++] = p;
    }
    L.length = w;
    // feedback effects always animate in real time (even while paused)
    for (let i = FX.floaters.length - 1; i >= 0; i--) { const f = FX.floaters[i]; f.life -= rdt; f.z += rdt * 14; if (f.life <= 0) FX.floaters.splice(i, 1); }
    for (let i = FX.bolts.length - 1; i >= 0; i--) { FX.bolts[i].life -= rdt; if (FX.bolts[i].life <= 0) FX.bolts.splice(i, 1); }
    for (let i = FX.rings.length - 1; i >= 0; i--) { const r = FX.rings[i]; r.life -= rdt; if (r.life <= 0) FX.rings.splice(i, 1); }
    for (let i = FX.glows.length - 1; i >= 0; i--) { const g = FX.glows[i]; g.life -= rdt; if (g.life <= 0) FX.glows.splice(i, 1); }
    if (FX.flash > 0) FX.flash = Math.max(0, FX.flash - rdt * 2.2);
  };
  FX.floater = function (x, y, text, color, life) {
    if (FX.floaters.length > 40) FX.floaters.shift();
    FX.floaters.push({ x, y, h: G.W.groundH(x, y), z: 16, text, c: color || '#fff', life: life || 1.6, max: life || 1.6 });
  };
  FX.ring = function (x, y, r0, r1, life, color, width, glow) {
    FX.rings.push({ x, y, h: G.W.groundH(x, y), r0, r1, life, max: life, c: color, w: width || 2, glow: !!glow });
  };
  const R = G.rr;

  // ---------------- small feedback ----------------
  FX.chips = function (x, y, c) {
    for (let k = 0; k < 4; k++) FX.spawn({ x: x + R(-0.15, 0.15), y: y + R(-0.15, 0.15), z: R(4, 10), vx: R(-0.8, 0.8), vy: R(-0.8, 0.8), vz: R(40, 90), g: 300, life: R(0.4, 0.7), s0: 1.2, s1: 0.8, c, k: 6, bounce: 0.3, vr: R(-8, 8) });
  };
  FX.poof = function (x, y, c) {
    for (let k = 0; k < 8; k++) FX.spawn({ x: x + R(-0.3, 0.3), y: y + R(-0.3, 0.3), z: R(4, 16), vx: R(-0.6, 0.6), vy: R(-0.6, 0.6), vz: R(10, 50), g: 60, life: R(0.8, 1.4), s0: 2, s1: 1.2, c, k: 5, vr: R(-4, 4), drag: 1 });
  };
  FX.dust = function (x, y, n) {
    n = n || 2;
    for (let k = 0; k < n; k++) FX.spawn({ x: x + R(-0.3, 0.3), y: y + R(-0.3, 0.3), z: R(0, 4), vx: R(-0.4, 0.4), vy: R(-0.4, 0.4), vz: R(6, 20), life: R(0.6, 1.2), s0: 3, s1: 7, c: 'rgba(180,160,130,0.45)', k: 2, drag: 1.5 });
  };
  FX.smokePuff = function (x, y) {
    FX.spawn({ x: x + R(-0.2, 0.2), y: y + R(-0.2, 0.2), z: R(2, 8), vz: R(10, 25), life: R(0.8, 1.4), s0: 4, s1: 9, c: 'rgba(90,90,90,0.4)', k: 2, drag: 0.5 });
  };
  FX.deposit = function (x, y, k, n) {
    if (!G.Render || G.Render.cam.zoom < 1.6) return;
    const col = { wood: '#e8b77a', stone: '#d4d4d4', food: '#ff9f7a' }[k] || '#fff';
    FX.floater(x, y, '+' + (n % 1 ? (n < 10 ? n.toFixed(1) : Math.round(n)) : n), col, 1.2);
  };
  FX.blood = function (x, y) {
    for (let k = 0; k < 4; k++) FX.spawn({ x, y, z: R(4, 8), vx: R(-0.6, 0.6), vy: R(-0.6, 0.6), vz: R(20, 60), g: 260, life: 0.5, s0: 1, c: '#a8323a', k: 0 });
  };
  FX.splash = function (x, y, s) {
    s = s || 1;
    const n = Math.round(6 * s + 2);
    for (let k = 0; k < n; k++) FX.spawn({ x: x + R(-0.2, 0.2) * s, y: y + R(-0.2, 0.2) * s, z: 1, vx: R(-0.7, 0.7) * s, vy: R(-0.7, 0.7) * s, vz: R(40, 110) * Math.sqrt(s), g: 320, life: R(0.4, 0.8), s0: 1.3, s1: 0.8, c: 'rgba(200,235,255,0.9)', k: 0 });
    FX.ring(x, y, 0.1, 0.5 * s + 0.3, 0.7, 'rgba(220,245,255,0.8)', 1.2);
  };
  FX.wake = function (x, y) {
    FX.spawn({ x: x + R(-0.2, 0.2), y: y + R(-0.2, 0.2), z: 0, life: 1.2, s0: 1.5, s1: 3, c: 'rgba(255,255,255,0.5)', k: 0 });
  };
  FX.hearts = function (x, y) {
    for (let k = 0; k < 6; k++) FX.spawn({ x: x + R(-0.3, 0.3), y: y + R(-0.3, 0.3), z: R(10, 18), vz: R(12, 26), vx: R(-0.2, 0.2), vy: R(-0.2, 0.2), life: R(1.2, 2), s0: 2.4, s1: 1.4, c: '#ff6b8a', k: 7, layer: 1 });
  };
  FX.prayer = function (x, y) {
    FX.spawn({ x: x + R(-0.2, 0.2), y: y + R(-0.2, 0.2), z: 14, vz: R(10, 20), life: R(1, 1.6), s0: 2, s1: 0.5, c: '#ffe39a', k: 8, layer: 1 });
  };
  FX.faithText = function (x, y, g) {
    if (!G.Render || G.Render.cam.zoom < 1.2) return;
    FX.floater(x, y, '+' + (g < 1 ? g.toFixed(1) : Math.round(g)) + ' fé', '#ffd978', 1.8);
  };
  FX.sparkle = function (x, y) {
    for (let k = 0; k < 6; k++) FX.spawn({ x: x + R(-0.4, 0.4), y: y + R(-0.4, 0.4), z: R(2, 14), vz: R(8, 20), life: R(0.8, 1.6), s0: 2.2, s1: 0.4, c: '#fff4c2', k: 8, layer: 1 });
  };
  FX.death = function (x, y) {
    FX.spawn({ x, y, z: 8, vz: 14, life: 2.6, s0: 5, s1: 2, c: 'rgba(220,235,255,0.55)', k: 1, layer: 1 });
    for (let k = 0; k < 5; k++) FX.spawn({ x: x + R(-0.2, 0.2), y: y + R(-0.2, 0.2), z: R(4, 10), vz: R(10, 22), life: R(1.2, 2), s0: 1.5, s1: 0.3, c: '#dfe9ff', k: 8, layer: 1 });
  };
  FX.complete = function (x, y, b) {
    const size = Math.max(b.w, b.h);
    for (let k = 0; k < 18 * size; k++) {
      const a = R(0, 6.28), sp = R(0.5, 1.6) * size;
      FX.spawn({ x, y, z: R(8, 20), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: R(20, 70), g: 60, drag: 1.5, life: R(0.8, 1.6), s0: 2.2, s1: 0.4, c: G.pick(['#ffe08a', '#fff3c8', '#ffd05a']), k: 8, layer: 1 });
    }
    FX.ring(x, y, 0.2, size * 1.4, 0.9, 'rgba(255,230,150,0.9)', 2, true);
    if (G.Render && G.Render.cam.zoom > 1.1) FX.floater(x, y, G.Village.buildName(b) + '!', '#fff1c4', 2.2);
    FX.dust(x, y, 8);
  };
  FX.blessing = function (x, y) {
    for (let k = 0; k < 50; k++) {
      const a = R(0, 6.28), sp = R(0.4, 2.2);
      FX.spawn({ x, y, z: R(10, 40), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: R(10, 60), g: 30, drag: 1.2, life: R(1.2, 2.4), s0: R(2, 3.2), s1: 0.4, c: G.pick(['#ffe08a', '#fff3c8', '#ffd05a', '#ffffff']), k: 8, layer: 1 });
    }
    FX.ring(x, y, 0.3, 4, 1.4, 'rgba(255,230,150,0.9)', 2.4, true);
    FX.pillar = { x, y, t: 1.6, max: 1.6, c: '255,225,140' };
    FX.floater(x, y, 'Preces atendidas!', '#ffe7a0', 2.6);
  };
  FX.collapse = function (x, y, b) {
    const size = Math.max(b.w, b.h);
    for (let k = 0; k < 14 * size; k++) FX.spawn({ x: x + R(-0.5, 0.5) * size, y: y + R(-0.5, 0.5) * size, z: R(2, 14), vx: R(-1, 1), vy: R(-1, 1), vz: R(30, 90), g: 280, bounce: 0.25, life: R(1, 2), s0: 1.6, c: G.pick(['#6e5a48', '#4a3a2e', '#8a8a86']), k: 6, vr: R(-6, 6) });
    for (let k = 0; k < 10 * size; k++) FX.spawn({ x: x + R(-0.5, 0.5) * size, y: y + R(-0.5, 0.5) * size, z: R(0, 10), vx: R(-0.5, 0.5), vy: R(-0.5, 0.5), vz: R(8, 30), life: R(1.5, 3), s0: 5, s1: 13, c: 'rgba(120,105,90,0.5)', k: 2, drag: 1 });
  };

  // ---------------- miracles ----------------
  FX.growth = function (x, y, r) {
    for (let k = 0; k < 90; k++) {
      const a = R(0, 6.28), d = Math.sqrt(Math.random()) * r;
      FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(0, 6), vz: R(15, 45), vx: R(-0.1, 0.1), vy: R(-0.1, 0.1), life: R(1, 2.2), s0: R(1.6, 2.6), s1: 0.3, c: G.pick(['#b8ff8a', '#7de06a', '#e8ffb0']), k: 8, layer: 1, fadeIn: 0.2 });
    }
    for (let k = 0; k < 30; k++) {
      const a = R(0, 6.28), d = Math.sqrt(Math.random()) * r;
      FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(0, 4), vz: R(30, 60), g: 30, drag: 0.8, life: R(1.5, 2.5), s0: 2.2, c: G.pick(['#5fae3e', '#86c95a']), k: 5, vr: R(-5, 5) });
    }
    FX.ring(x, y, 0.3, r, 1.1, 'rgba(170,255,140,0.9)', 2.4, true);
  };
  FX.heal = function (x, y, r) {
    for (let k = 0; k < 60; k++) {
      const a = R(0, 6.28), d = Math.sqrt(Math.random()) * r;
      FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(0, 10), vz: R(15, 40), life: R(1, 2), s0: R(1.8, 3), s1: 0.3, c: G.pick(['#fff2a8', '#b8ffd0', '#ffffff']), k: 8, layer: 1 });
    }
    FX.ring(x, y, r * 0.2, r, 1, 'rgba(255,245,180,0.95)', 2.5, true);
    FX.ring(x, y, r, r * 0.2, 1.2, 'rgba(190,255,210,0.7)', 1.5, true);
    FX.pillar = { x, y, t: 1.2, max: 1.2, c: '255,240,170' };
  };
  FX.healOne = function (x, y) {
    for (let k = 0; k < 8; k++) FX.spawn({ x: x + R(-0.2, 0.2), y: y + R(-0.2, 0.2), z: R(2, 14), vz: R(18, 36), life: R(0.8, 1.4), s0: 2, s1: 0.4, c: '#fff8c0', k: 8, layer: 1 });
  };
  FX.fertility = function (x, y, r) {
    for (let k = 0; k < 110; k++) {
      const a = R(0, 6.28), d = Math.sqrt(Math.random()) * r;
      FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(40, 90), vz: R(-22, -10), vx: R(-0.3, 0.3), vy: R(-0.3, 0.3), life: R(2.5, 4.5), s0: 2, s1: 1.4, c: G.pick(['#ffb3cf', '#ffd6e6', '#fff0a8', '#ff9ac0']), k: 9, vr: R(-3, 3) });
    }
    for (let k = 0; k < 14; k++) FX.hearts(x + R(-r, r) * 0.6, y + R(-r, r) * 0.6);
    FX.ring(x, y, 0.5, r, 1.4, 'rgba(255,180,210,0.9)', 2.5, true);
  };
  FX.summon = function (x, y) {
    for (let k = 0; k < 26; k++) FX.spawn({ x: x + R(-0.8, 0.8), y: y + R(-0.8, 0.8), z: R(0, 8), vz: R(8, 26), vx: R(-0.4, 0.4), vy: R(-0.4, 0.4), drag: 0.8, life: R(1.2, 2.4), s0: 5, s1: 12, c: 'rgba(40,20,55,0.55)', k: 2 });
    FX.ring(x, y, 0.2, 2.2, 0.8, 'rgba(170,80,255,0.8)', 2, true);
  };

  // ---------------- lightning ----------------
  FX.lightning = function (x, y) {
    const h = G.W.groundH(x, y);
    const segs = [];
    let px = 0, pz = 420;
    segs.push([px, pz]);
    while (pz > 0) { pz -= R(18, 38); px += R(-14, 14); segs.push([px, Math.max(0, pz)]); }
    segs[segs.length - 1][0] = 0;
    const branches = [];
    for (let b = 0; b < 3; b++) {
      const k = 2 + Math.floor(Math.random() * (segs.length - 3)); let [bx, bz] = segs[k]; const br = [[bx, bz]];
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (let s = 0; s < 4; s++) { bx += dir * R(6, 16); bz -= R(10, 22); br.push([bx, bz]); }
      branches.push(br);
    }
    FX.bolts.push({ x, y, h, segs, branches, life: 0.35, max: 0.35 });
    FX.flash = Math.max(FX.flash, 0.85); FX.flashColor = '235,240,255';
    for (let k = 0; k < 24; k++) FX.spawn({ x, y, z: R(0, 6), vx: R(-2, 2), vy: R(-2, 2), vz: R(40, 140), g: 300, life: R(0.3, 0.8), s0: 1.6, s1: 0.2, c: G.pick(['#fff9d0', '#bcd6ff', '#ffffff']), k: 4, layer: 1 });
    for (let k = 0; k < 6; k++) FX.spawn({ x: x + R(-0.3, 0.3), y: y + R(-0.3, 0.3), z: R(0, 6), vz: R(10, 30), life: R(1.5, 2.5), s0: 4, s1: 11, c: 'rgba(70,70,75,0.5)', k: 2, drag: 0.6 });
    FX.ring(x, y, 0.1, 2, 0.5, 'rgba(210,225,255,0.9)', 2, true);
    FX.glowAt(x, y, 1.2, 'cool', 90);
  };
  // transient lights (drawn into the light map by the renderer)
  FX.glowAt = function (x, y, life, color, r) { FX.glows.push({ x, y, h: G.W.groundH(x, y), life, max: life, c: color, r }); };

  // ---------------- war & destiny ----------------
  FX.arrow = function (x0, y0, x1, y1) {
    const d = G.dist(x0, y0, x1, y1); const T = G.clamp(d / 12, 0.25, 0.8);
    const h0 = G.W.groundH(x0, y0), h1 = G.W.groundH(x1, y1); const h = (h0 + h1) / 2;
    const HS = 4, gr = 240, z0 = 34 + (h0 - h) * HS, z1 = 6 + (h1 - h) * HS;
    const vz = (z1 - z0 + gr * T * T / 2) / T;
    FX.spawn({ x: x0, y: y0, h, z: z0, vx: (x1 - x0) / T, vy: (y1 - y0) / T, vz, g: gr, life: T, s0: 1, c: '#4a3420', k: 12 });
  };
  FX.chainsBreak = function (x, y) {
    for (let k = 0; k < 10; k++) FX.spawn({ x: x + R(-0.15, 0.15), y: y + R(-0.15, 0.15), z: R(4, 9), vx: R(-1, 1), vy: R(-1, 1), vz: R(40, 110), g: 300, bounce: 0.3, life: R(0.7, 1.2), s0: 1.3, c: G.pick(['#8e8e96', '#b4b4bc', '#6c6c74']), k: 6, vr: R(-10, 10) });
    for (let k = 0; k < 8; k++) FX.spawn({ x: x + R(-0.3, 0.3), y: y + R(-0.3, 0.3), z: R(6, 16), vz: R(10, 30), life: R(0.8, 1.6), s0: 2.2, s1: 0.3, c: '#fff1b8', k: 8, layer: 1 });
    FX.ring(x, y, 0.1, 0.9, 0.6, 'rgba(255,235,170,0.9)', 1.5, true);
  };
  FX.plague = function (x, y, r) {
    for (let k = 0; k < 60; k++) { const a = R(0, 6.28), d = Math.sqrt(Math.random()) * r; FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(0, 10), vz: R(4, 16), vx: R(-0.3, 0.3), vy: R(-0.3, 0.3), drag: 0.5, life: R(2, 4), s0: R(4, 7), s1: R(10, 16), c: G.pick(['rgba(120,150,60,0.45)', 'rgba(90,120,50,0.4)', 'rgba(150,160,80,0.35)']), k: 2 }); }
    FX.ring(x, y, 0.3, r, 1.3, 'rgba(160,210,80,0.8)', 2, true);
  };
  FX.anoint = function (x, y) {
    for (let k = 0; k < 40; k++) FX.spawn({ x: x + R(-0.4, 0.4), y: y + R(-0.4, 0.4), z: R(10, 60), vz: R(-30, -8), life: R(1, 2), s0: R(1.8, 2.8), s1: 0.4, c: G.pick(['#ffe08a', '#fff3c8', '#ffd05a']), k: 8, layer: 1 });
    FX.ring(x, y, 0.2, 2.2, 1.2, 'rgba(255,220,120,0.95)', 2.4, true);
    FX.pillar = { x, y, t: 1.8, max: 1.8, c: '255,215,110' };
  };
  FX.fury = function (x, y, r) {
    for (let k = 0; k < 70; k++) { const a = R(0, 6.28), d = Math.sqrt(Math.random()) * r; FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(0, 8), vz: R(20, 60), life: R(0.8, 1.8), s0: R(1.6, 2.6), s1: 0.3, c: G.pick(['#ff5a3a', '#ff8a4a', '#ffcf6a']), k: 4, layer: 1 }); }
    FX.ring(x, y, 0.3, r, 0.9, 'rgba(255,80,50,0.9)', 3, true);
    FX.glowAt(x, y, 1.6, 'red', 140);
  };
  FX.discord = function (x, y) {
    for (let k = 0; k < 40; k++) { const a = R(0, 6.28), d = Math.sqrt(Math.random()) * 5; FX.spawn({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: R(0, 12), vz: R(5, 20), drag: 0.5, life: R(2, 3.5), s0: R(5, 8), s1: R(12, 18), c: G.pick(['rgba(90,40,120,0.45)', 'rgba(60,30,80,0.5)']), k: 2 }); }
    FX.ring(x, y, 5, 0.3, 1.4, 'rgba(170,90,230,0.85)', 2, true);
  };
  FX.doves = function (x, y) {
    for (let k = 0; k < 7; k++) FX.spawn({ x: x + R(-1, 1), y: y + R(-1, 1), z: R(6, 16), vx: R(-1.2, 1.2), vy: R(-1.2, 1.2), vz: R(22, 40), life: R(3, 4.5), s0: 2.4, c: '#ffffff', k: 13, layer: 1 });
    FX.ring(x, y, 0.3, 3, 1.4, 'rgba(255,255,240,0.8)', 2, true);
  };

  // ---------------- meteor ----------------
  FX.meteorImpact = function (x, y, r, water) {
    FX.flash = 1; FX.flashColor = '255,236,200';
    FX.glowAt(x, y, 2.5, 'fire', 260);
    FX.ring(x, y, 0.3, r * 3.2, 0.9, 'rgba(255,240,210,0.95)', 5, true);
    FX.ring(x, y, 0.3, r * 2.2, 1.3, 'rgba(255,170,90,0.8)', 3, true);
    FX.ring(x, y, 0.2, r * 4.5, 1.8, 'rgba(255,255,255,0.35)', 2);
    if (water) {
      for (let k = 0; k < 140; k++) FX.spawn({ x: x + R(-0.5, 0.5), y: y + R(-0.5, 0.5), z: R(0, 10), vx: R(-3, 3), vy: R(-3, 3), vz: R(80, 320), g: 330, life: R(1, 2.2), s0: R(1.5, 2.6), s1: 1, c: G.pick(['rgba(210,240,255,0.95)', 'rgba(160,215,240,0.9)', '#ffffff']), k: 0 });
      for (let k = 0; k < 30; k++) FX.spawn({ x: x + R(-1, 1), y: y + R(-1, 1), z: R(0, 20), vz: R(20, 50), life: R(2, 4), s0: 8, s1: 20, c: 'rgba(235,245,255,0.45)', k: 2, drag: 0.4 });
      return;
    }
    for (let k = 0; k < 70; k++) {
      const a = R(0, 6.28), sp = R(1, 4.2);
      FX.spawn({ x: x + R(-0.4, 0.4), y: y + R(-0.4, 0.4), z: R(2, 12), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: R(90, 300), g: 330, bounce: 0.25, life: R(1.6, 3), s0: R(1.4, 3), c: G.pick(['#5a4636', '#3d2f25', '#7a6450', '#2e2622']), k: 6, vr: R(-10, 10) });
    }
    for (let k = 0; k < 50; k++) {
      const a = R(0, 6.28), sp = R(0.5, 3);
      FX.spawn({ x, y, z: R(4, 20), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: R(60, 260), g: 200, life: R(0.8, 2.2), s0: R(1.5, 2.5), s1: 0.3, c: G.pick(['#ffdd88', '#ff9944', '#ff6622', '#fff3c0']), k: 4, layer: 1 });
    }
    for (let k = 0; k < 40; k++) FX.spawn({ x: x + R(-1.5, 1.5), y: y + R(-1.5, 1.5), z: R(0, 30), vx: R(-0.5, 0.5), vy: R(-0.5, 0.5), vz: R(15, 60), drag: 0.3, life: R(3, 6), s0: R(8, 12), s1: R(22, 34), c: G.pick(['rgba(60,52,48,0.55)', 'rgba(90,80,72,0.5)', 'rgba(40,34,30,0.6)']), k: 2 });
    for (let k = 0; k < 26; k++) FX.spawn({ x: x + R(-r, r), y: y + R(-r, r), z: R(0, 5), vz: R(5, 15), life: R(2, 4), s0: 3, s1: 1, c: G.pick(['#ff7a2a', '#ffb347']), k: 1, layer: 1 });
  };
})(window.G);
