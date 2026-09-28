'use strict';
// ============================================================
//  Divine powers & how the people perceive them
// ============================================================
(function (G) {
  const N = G.N, T = G.T, W = G.W;
  const P = G.Powers = {};
  G.POWERS = [
    { id: 'rain', name: 'Chuva', key: '1', cost: 10, r: 4.5, good: true, desc: 'Uma nuvem carregada sobre a área. Rega plantações, apaga incêndios e alivia secas.' },
    { id: 'growth', name: 'Crescimento', key: '2', cost: 14, r: 3.5, good: true, desc: 'A vegetação brota e cresce em segundos: árvores, arbustos e plantações.' },
    { id: 'heal', name: 'Cura', key: '3', cost: 12, r: 3, good: true, desc: 'Cura ferimentos e doenças de todos na área. Quem é curado nunca esquece.' },
    { id: 'fertility', name: 'Fertilidade', key: '4', cost: 30, r: 6, good: true, desc: 'Por dois dias a terra floresce: colheitas rápidas, frutos abundantes, mais nascimentos.' },
    { id: 'lightning', name: 'Raio', key: '5', cost: 18, r: 1.2, good: false, desc: 'Um raio atinge o ponto escolhido. Mata, fere e pode iniciar incêndios.' },
    { id: 'meteor', name: 'Meteoro', key: '6', cost: 70, r: 3.4, good: false, desc: 'Após alguns segundos, uma rocha em chamas cai do céu. Devastação total — e pedra de presente.' },
    { id: 'wolves', name: 'Matilha', key: '7', cost: 22, r: 1.5, good: false, desc: 'Invoca uma matilha de lobos famintos no local.' },
    { id: 'hand', name: 'Mão Divina', key: '8', cost: 0, r: 0.8, good: null, desc: 'Agarre um habitante ou animal e solte — ou arremesse — onde quiser. Grátis, mas assusta.' },
  ];
  P.byId = id => G.POWERS.find(p => p.id === id);

  // ---------------- perception ----------------
  P.witness = function (x, y, radius, dev, fear, why) {
    const S = G.S; let n = 0;
    for (const v of S.villagers.values()) {
      if (v.age < 4) continue;
      const d = G.dist(v.x, v.y, x, y); if (d > radius) continue;
      const f = 1 - (d / radius) * 0.5;
      const mul = v.traits.includes('Devoto') ? 1.5 : v.traits.includes('Cético') ? 0.5 : 1;
      if (dev) v.devotion = G.clamp(v.devotion + dev * f * (dev > 0 ? mul : 1), 0, 100);
      if (fear) v.fear = G.clamp(v.fear + fear * f, 0, 100);
      if (!v.inside && !v.sleeping) {
        if (dev > 0 && !fear) G.Vg.emote(v, 'awe', 2.6);
        else if (fear > 0) G.Vg.emote(v, 'fear', 2.6);
      }
      n++;
    }
    if (n > 0 && !S.awareness) {
      S.awareness = 1;
      G.Village.log('Pela primeira vez, os habitantes sentiram a presença de algo maior.', 'eye');
      G.Village.milestone('aware', 'Eles perceberam você', 'Agora sabem que não estão sozinhos.', 'eye');
    }
    return n;
  };

  // ---------------- casting ----------------
  P.canCast = (id, x, y) => {
    const p = P.byId(id); if (!p) return false;
    if (G.S.faith < p.cost) return false;
    if (!W.inb(x, y)) return false;
    if (id === 'wolves') { const i = W.idx(x, y); return G.S.type[i] >= T.SAND && G.S.type[i] !== T.RIVER && !W.blocked(i); }
    return true;
  };
  P.cast = function (id, x, y) {
    const S = G.S; const p = P.byId(id);
    if (!P.canCast(id, x, y)) { G.Audio && G.Audio.play('deny'); return false; }
    S.faith -= p.cost; S.stats.faithSpent += p.cost;
    S.stats.powers[id] = (S.stats.powers[id] || 0) + 1;
    P[id](x, y);
    return true;
  };

  P.rain = function (x, y) {
    const S = G.S;
    G.Nature.addCloud(x, y, 4.5, 20, 'divine');
    G.Audio && G.Audio.play('rainStart');
    let bonus = 0;
    if (S.weather.drought > 0) {
      S.weather.drought = Math.max(0, S.weather.drought - G.DAY_LEN * 0.9); bonus = 10;
      if (S.weather.drought <= 0) G.Village.log('A chuva divina pôs fim à seca. Eles choram de alegria.', 'rain', x, y);
    }
    let fires = 0; for (const i of G.Nature.fireSet) { const fx = (i % N) + 0.5, fy = ((i / N) | 0) + 0.5; if (G.dist2(fx, fy, x, y) < 40) fires++; }
    if (fires > 2) bonus += 8;
    P.witness(x, y, 13, 5 + bonus, 0);
  };

  P.growth = function (x, y) {
    const S = G.S; const r = 3.5;
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue;
      const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r) continue;
      const i = ty * N + tx; const t = S.type[i];
      if (t < T.SAND || t === T.RIVER) continue;
      S.bloom[i] = Math.max(S.bloom[i], G.DAY_LEN * 1.2); G.Nature.markDirty(i);
      if (S.burnt[i] > 0) { S.burnt[i] = 0; }
      const tid = S.treeAt[i];
      if (tid) { const tr = S.trees.get(tid); if (tr) { if (tr.stage === 'grow') tr.size = tr.maxSize; else if (tr.stage === 'stump' || tr.stage === 'burnt') { tr.stage = 'grow'; tr.size = 0.6; tr.chop = 0; } } }
      else if (!S.occ[i] && !S.objAt[i] && S.wear[i] < 20 && (t === T.GRASS || t === T.MEADOW || t === T.ROCKY) && G.R() < 0.32) {
        const tr = G.Nature.addTree(tx + 0.5 + G.rr(-0.2, 0.2), ty + 0.5 + G.rr(-0.2, 0.2), G.R() < 0.65 ? 'oak' : 'pine', 0.15); if (tr) tr.grow = 1;
        if (tr) tr.size = 0.55 + G.R() * 0.3;
      } else if (!S.occ[i] && !S.objAt[i] && !S.treeAt[i] && t === T.SAND && G.dOcean && G.dOcean[i] <= 2 && G.R() < 0.2) {
        const tr = G.Nature.addTree(tx + 0.5, ty + 0.5, 'palm', 0.8);
      } else if (!S.occ[i] && !S.objAt[i] && !S.treeAt[i] && t >= T.GRASS && G.R() < 0.06) G.Nature.addBush(tx + 0.5, ty + 0.5);
      const oid = S.objAt[i]; if (oid) { const b = S.bushes.get(oid); if (b) { b.berries = b.max; b.burnt = 0; } }
      const bid = S.occ[i]; if (bid) { const b = S.buildings.get(bid); if (b && b.crops) { const k = G.Village.farmTileIndex(b, tx, ty); if (k >= 0 && b.crops[k].s > 0) { b.crops[k].g = Math.min(1, b.crops[k].g + 0.6); b.crops[k].s = b.crops[k].g < 0.3 ? 1 : b.crops[k].g < 1 ? 2 : 3; } } }
    }
    S.zones.push({ kind: 'growth', x, y, r, t: G.DAY_LEN * 0.5, power: 1.5 });
    G.FX && G.FX.growth(x, y, r);
    G.Audio && G.Audio.play('magic');
    P.witness(x, y, 12, 7, 0);
  };

  P.heal = function (x, y) {
    const S = G.S; const r = 3; let healed = 0;
    for (const v of S.villagers.values()) {
      if (G.dist(v.x, v.y, x, y) > r) continue;
      const needed = v.hp < 95 || v.sick > 0 || v.hunger > 70;
      v.hp = 100; v.sick = 0; v.hunger = Math.min(v.hunger, 30); v.energy = Math.max(v.energy, 70);
      if (needed) { v.devotion = Math.min(100, v.devotion + 14); healed++; }
      G.FX && G.FX.healOne(v.x, v.y);
    }
    for (const a of S.animals.values()) if (!a.dead && G.dist(a.x, a.y, x, y) < r) a.hp = a.maxHp;
    G.FX && G.FX.heal(x, y, r);
    G.Audio && G.Audio.play('heal');
    P.witness(x, y, 10, 5 + (healed ? 6 : 0), 0);
    if (healed >= 3) G.Village.log(`${healed} pessoas foram curadas por um milagre.`, 'heal', x, y);
  };

  P.fertility = function (x, y) {
    const S = G.S; const r = 6;
    S.zones.push({ kind: 'fertility', x, y, r, t: G.DAY_LEN * 2, power: 1.6 });
    for (let ty = Math.floor(y - r); ty <= y + r; ty++) for (let tx = Math.floor(x - r); tx <= x + r; tx++) {
      if (!W.inb(tx, ty)) continue; if (G.dist(tx + 0.5, ty + 0.5, x, y) > r) continue;
      const i = ty * N + tx; if (S.type[i] >= T.GRASS) { S.bloom[i] = Math.max(S.bloom[i], G.DAY_LEN * 2); G.Nature.markDirty(i); }
    }
    G.FX && G.FX.fertility(x, y, r);
    G.Audio && G.Audio.play('fertility');
    P.witness(x, y, 14, 9, 0);
    G.Village.log('Um milagre de fertilidade abençoou a terra.', 'flower', x, y);
  };

  // ---------------- destructive ----------------
  P.strike = function (x, y, divine) {
    const S = G.S;
    G.FX && G.FX.lightning(x, y);
    G.Audio && G.Audio.at(x, y, 'lightning', true, divine ? 1 : 0.8);
    G.Render && G.Render.shake(divine ? 0.45 : 0.25);
    const i = W.idx(x, y);
    let killed = 0;
    for (const v of [...S.villagers.values()]) {
      if (v.inside) continue;
      const d = G.dist(v.x, v.y, x, y);
      if (d < 0.9) { G.Vg.damage(v, 250, 'lightning', divine); killed++; }
      else if (d < 2.2) { G.Vg.damage(v, 28 * (1 - d / 2.2) + 8, 'lightning', divine); if (S.villagers.has(v.id)) { v.fear = Math.min(100, v.fear + 15); } }
    }
    for (const a of [...S.animals.values()]) { if (!a.dead && G.dist(a.x, a.y, x, y) < 1) G.Animals.damage(a, 100, null); }
    if (W.inb(x, y) && W.isLand(i)) {
      if (S.type[i] !== T.RIVER) { S.burnt[i] = Math.max(S.burnt[i], G.DAY_LEN * 1.2); G.Nature.markDirty(i); }
      const tid = S.treeAt[i];
      if (tid) G.Nature.ignite(i, 0.95);
      else if (G.R() < (S.weather.drought > 0 ? 0.9 : 0.55)) G.Nature.ignite(i, 0.6);
      const bid = S.occ[i]; if (bid) { const b = S.buildings.get(bid); if (b) { G.Village.damageBuilding(b, 40, 'lightning'); if (b.hp > 0 && G.R() < 0.7) G.Nature.ignite(i, 0.8); } }
      if (divine) S.fireGod = true;
    } else G.FX && G.FX.splash(x, y, 1.4);
    (S.panic = S.panic || []).push({ x, y, r: 4.5, t: 2.5, why: 'panic' });
    return killed;
  };
  P.lightning = function (x, y) {
    const killed = P.strike(x, y, true);
    P.witness(x, y, 14, killed ? -6 : -1, killed ? 22 : 12);
    if (killed) G.Village.log(`Um raio divino caiu do céu claro${killed > 1 ? ' e matou ' + killed + ' pessoas' : ''}.`, 'bolt', x, y);
  };
  P.naturalLightning = function (x, y) {
    // nature is cruel, but rarely aims at people
    let near = true;
    for (let k = 0; k < 8 && near; k++) {
      near = false;
      for (const v of G.S.villagers.values()) if (!v.inside && G.dist2(v.x, v.y, x, y) < 7) { near = true; break; }
      if (near) { x += G.rr(-5, 5); y += G.rr(-5, 5); }
    }
    if (near) { G.Audio && G.Audio.play('thunderFar'); return; }
    x = G.clamp(x, 1, N - 1); y = G.clamp(y, 1, N - 1);
    P.strike(x, y, false);
    const S = G.S; const i = W.idx(x, y);
    if (S.fire[i] > 0 && !S._stormFireLogged) { S._stormFireLogged = S.day; G.Village.log('Um raio da tempestade iniciou um incêndio.', 'fire', x, y); }
  };

  P.meteor = function (x, y) {
    const S = G.S;
    S.meteors.push({ x, y, r: 3.4, t: 0, delay: 4.2 });
    G.Audio && G.Audio.meteorFall(4.2);
  };
  P.meteorImpact = function (m) {
    const S = G.S; const { x, y, r } = m;
    const ci = W.idx(x, y);
    const water = W.inb(x, y) && S.type[ci] <= T.RIVER;
    G.Render && G.Render.shake(1.4);
    G.FX && G.FX.meteorImpact(x, y, r, water);
    G.Audio && G.Audio.play('boom');
    let killed = 0, destroyed = 0;
    // people & animals
    for (const v of [...S.villagers.values()]) {
      const d = G.dist(v.x, v.y, x, y);
      if (d < r * 0.85) { if (v.inside) G.Vg.endTask(v); G.Vg.damage(v, 500, 'meteor', true); killed++; }
      else if (d < r + 2.8 && !v.inside) {
        G.Vg.damage(v, 45 * (1 - (d - r * 0.85) / 3.8), 'meteor', true);
        if (S.villagers.has(v.id) && !v.held) {
          G.Vg.endTask(v);
          const dx = (v.x - x) / (d || 1), dy = (v.y - y) / (d || 1);
          v.air = true; v.z = 1; v.vz = 190 + G.R() * 60; v.vx = dx * 2.6; v.vy = dy * 2.6;
          v.fear = Math.min(100, v.fear + 30);
        }
      }
    }
    for (const a of [...S.animals.values()]) {
      const d = G.dist(a.x, a.y, x, y);
      if (d < r) G.Animals.kill(a, null);
      else if (d < r + 2.5 && !a.dead) { const dx = (a.x - x) / d, dy = (a.y - y) / d; a.air = true; a.z = 1; a.vz = 170; a.vx = dx * 2.4; a.vy = dy * 2.4; }
    }
    // terrain, vegetation, buildings
    const R = Math.ceil(r + 3);
    const V = N + 1;
    if (!water) {
      for (let vy = Math.floor(y - R); vy <= y + R; vy++) for (let vx = Math.floor(x - R); vx <= x + R; vx++) {
        if (vx < 1 || vy < 1 || vx >= N || vy >= N) continue;
        const d = G.dist(vx, vy, x, y);
        const k = vy * V + vx; let h = S.H[k];
        if (h <= G.SEA + 0.01) continue; // shoreline vertices stay put
        if (d < r) h -= 1.5 * Math.pow(1 - d / r, 1.3);
        else if (d < r + 1.3) h += 0.45 * Math.sin((d - r) / 1.3 * Math.PI);
        S.H[k] = Math.max(G.SEA + 0.08, h);
      }
    }
    for (let ty = Math.floor(y - R); ty <= y + R; ty++) for (let tx = Math.floor(x - R); tx <= x + R; tx++) {
      if (!W.inb(tx, ty)) continue;
      const d = G.dist(tx + 0.5, ty + 0.5, x, y); if (d > r + 2.5) continue;
      const i = ty * N + tx;
      G.Nature.markDirty(i);
      if (W.isLand(i) && S.type[i] !== T.RIVER) {
        if (d < r) S.scar[i] = G.DAY_LEN * 7;
        else S.burnt[i] = Math.max(S.burnt[i], G.DAY_LEN * 2.5);
      }
      const tid = S.treeAt[i];
      if (tid) { const t = S.trees.get(tid); if (t) { if (d < r) G.Nature.removeTree(t); else if (t.stage === 'grow' && t.size > 0.3) { if (G.R() < 0.6) { G.Nature.fellTree(t, (tx + ty) - (x + y) > 0 ? 1 : -1); } else G.Nature.ignite(i, 0.9); } } }
      const oid = S.objAt[i];
      if (oid && d < r) { const b = S.bushes.get(oid); if (b) G.Nature.removeBush(b); const rk = S.rocks.get(oid); if (rk) G.Nature.removeRock(rk); }
      const bid = S.occ[i];
      if (bid) { const b = S.buildings.get(bid); if (b && b.hp > 0) { if (d < r) { G.Village.damageBuilding(b, 9999, 'meteor'); destroyed++; } else { G.Village.damageBuilding(b, 70, 'meteor'); if (b.hp > 0 && G.R() < 0.6) G.Nature.ignite(i, 0.8); } } }
      if (d >= r * 0.7 && d < r + 2 && G.R() < 0.5) G.Nature.ignite(i, 0.7);
    }
    if (!water) {
      // meteorite fragments: a gift of stone
      for (let k = 0; k < 3; k++) {
        const a = G.R() * 6.28, dd = G.R() * r * 0.6;
        const rx = Math.floor(x + Math.cos(a) * dd) + 0.5, ry = Math.floor(y + Math.sin(a) * dd) + 0.5;
        const rk = G.Nature.addRock(rx, ry, 40); if (rk) rk.meteor = true;
      }
    }
    S.fireGod = true;
    (S.panic = S.panic || []).push({ x, y, r: 13, t: 5, why: 'meteor' });
    P.witness(x, y, 18, killed ? -12 : -4, 38);
    G.Render && G.Render.invalidateTerrain(x, y, R + 1);
    const where = G.Village.nearSettlementName(x, y);
    const parts = [];
    if (killed) parts.push('matando ' + killed + (killed > 1 ? ' pessoas' : ' pessoa'));
    if (destroyed) parts.push('destruindo ' + destroyed + (destroyed > 1 ? ' construções' : ' construção'));
    G.Village.log(`Um meteoro caiu${where ? ' perto de ' + where : ''}${parts.length ? ', ' + parts.join(' e ') : ''}.`, 'meteor', x, y);
  };

  P.wolves = function (x, y) {
    G.Animals.spawnPack(x, y, 3, true);
    G.FX && G.FX.summon(x, y);
    G.Audio && G.Audio.at(x, y, 'howl', true, 1.2);
    P.witness(x, y, 12, -3, 18);
    G.Village.log('Uma matilha surgiu do nada, uivando para o céu.', 'wolf', x, y);
  };

  P.update = function (dt) {
    const S = G.S;
    for (let k = S.meteors.length - 1; k >= 0; k--) {
      const m = S.meteors[k]; m.t += dt;
      if (m.t >= m.delay) { S.meteors.splice(k, 1); P.meteorImpact(m); }
    }
    if (S.panic) for (let k = S.panic.length - 1; k >= 0; k--) { S.panic[k].t -= dt; if (S.panic[k].t <= 0) S.panic.splice(k, 1); }
    if (S.fireGod && G.Nature.fireSet.size === 0) S.fireGod = false;
  };
})(window.G);
