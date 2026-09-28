'use strict';
// ============================================================
//  Events: storms, droughts, raids, sickness, discoveries,
//  travellers by boat… used with moderation.
// ============================================================
(function (G) {
  const N = G.N, T = G.T, W = G.W;
  const E = G.Events = {};

  E.update = function (dt) {
    const S = G.S; const w = S.weather;
    w.nextEvent -= dt / G.DAY_LEN;
    if (w.fertility > 0) { w.fertility -= dt; if (w.fertility <= 0) w.fertility = 0; }
    if (S.pendingDiscovery) { S.pendingDiscovery.t -= dt; if (S.pendingDiscovery.t <= 0) discover(null); }
    // an empty island eventually attracts travellers
    if (S.villagers.size === 0) {
      S.emptyT = (S.emptyT || 0) + dt;
      if (S.emptyT > G.DAY_LEN * 1.5 && !S.boats.length) { S.emptyT = 0; immigrants(true); }
    } else S.emptyT = 0;
    updatePrayers(dt);
    if (w.nextEvent <= 0) {
      w.nextEvent = G.rr(2.3, 4.6);
      if (S.day < 4) return;
      trigger();
    }
    updateBoats(dt);
  };

  // ---------------- prayers: the people ask their god for help ----------------
  const PRAYER = {
    rain: { txt: 'chuva', powers: ['rain'], ask: 'Eles rezam por chuva' },
    fire: { txt: 'chuva para apagar o fogo', powers: ['rain'], ask: 'Eles imploram por chuva sobre o fogo' },
    heal: { txt: 'cura', powers: ['heal'], ask: 'Eles rezam pelos doentes' },
    harvest: { txt: 'fartura', powers: ['growth', 'fertility'], ask: 'Eles rezam por comida' },
    protect: { txt: 'proteção contra os lobos', powers: ['lightning', 'meteor'], ask: 'Eles rezam por proteção' },
  };
  E.PRAYER = PRAYER;
  let tPray = 0;
  function hostileNear(set, r) {
    let best = null, bd = r * r;
    for (const a of G.S.animals.values()) if (a.kind === 'wolf' && !a.dead) { const d = G.dist2(a.x, a.y, set.cx, set.cy); if (d < bd) { bd = d; best = a; } }
    return best;
  }
  function updatePrayers(dt) {
    const S = G.S;
    if (S.prayer) {
      const p = S.prayer; p.t -= dt;
      const set = S.settlements.get(p.set);
      // the need went away on its own
      let solved = !set;
      if (set && p.kind === 'protect') solved = !hostileNear(set, 16);
      if (set && p.kind === 'fire') solved = !(G.Vg.alarms.get(set.id) || []).length && G.Nature.fireSet.size === 0;
      if (set && p.kind === 'rain') solved = S.weather.drought <= 0;
      if (set && p.kind === 'heal') { let sick = 0; for (const v of S.villagers.values()) if (v.set === set.id && v.sick > 0) sick++; solved = sick === 0; }
      if (solved && p.age > 5) { S.prayer = null; S.prayerCD = G.DAY_LEN * 0.4; return; }
      p.age = (p.age || 0) + dt;
      if (p.t <= 0) {
        for (const v of S.villagers.values()) if (v.set === p.set) v.devotion = Math.max(0, v.devotion - 5);
        G.Village.log(`As preces de ${set ? set.name : 'um povo'} por ${PRAYER[p.kind].txt} ficaram sem resposta.`, 'eye', p.x, p.y);
        S.prayer = null; S.prayerCD = G.DAY_LEN * 0.6;
      }
      return;
    }
    S.prayerCD = (S.prayerCD || 0) - dt;
    tPray -= dt;
    if (S.prayerCD > 0 || tPray > 0 || S.day < 2) return;
    tPray = 2;
    for (const set of S.settlements.values()) {
      const pop = G.Village.pop(set.id); if (pop < 5) continue;
      let kind = null, x = set.cx, y = set.cy, r = 12;
      const al = G.Vg.alarms.get(set.id);
      const wolf = hostileNear(set, 12);
      let sick = 0; for (const v of S.villagers.values()) if (v.set === set.id && v.sick > 0) sick++;
      if (al && al.length >= 3) { kind = 'fire'; const i = al[0]; x = (i % N) + 0.5; y = ((i / N) | 0) + 0.5; r = 8; }
      else if (wolf) { kind = 'protect'; x = wolf.x; y = wolf.y; r = 14; }
      else if (sick >= 2) kind = 'heal';
      else if (S.weather.drought > G.DAY_LEN * 0.3) kind = 'rain';
      else if (S.stock.food < S.villagers.size * 0.7 && S.villagers.size > 8) kind = 'harvest';
      if (!kind) continue;
      S.prayer = { kind, set: set.id, x, y, r, t: kind === 'fire' ? G.DAY_LEN * 0.5 : G.DAY_LEN * 1.2, max: kind === 'fire' ? G.DAY_LEN * 0.5 : G.DAY_LEN * 1.2, age: 0 };
      G.UI && G.UI.notice(`${PRAYER[kind].ask} em ${set.name}.`, 'eye');
      G.Audio && G.Audio.play('power', 0.6);
      return;
    }
  }
  E.onPower = function (id, x, y) {
    const S = G.S; const p = S.prayer; if (!p) return;
    if (!PRAYER[p.kind].powers.includes(id)) return;
    if (p.kind === 'protect') {
      let hit = false; for (const a of S.animals.values()) if (a.kind === 'wolf' && G.dist(a.x, a.y, x, y) < (id === 'meteor' ? 4 : 2)) hit = true;
      if (!hit) return;
    } else {
      const set = S.settlements.get(p.set);
      const d = Math.min(G.dist(x, y, p.x, p.y), set ? G.dist(x, y, set.cx, set.cy) : 99);
      if (d > p.r) return;
    }
    const set = S.settlements.get(p.set);
    for (const v of S.villagers.values()) {
      v.devotion = Math.min(100, v.devotion + (v.set === p.set ? 16 : 6));
      if (v.set === p.set && !v.inside && !v.sleeping) G.Vg.emote(v, 'awe', 3);
    }
    S.faith = Math.min(999, S.faith + 15);
    G.FX && G.FX.blessing(p.x, p.y);
    G.Audio && G.Audio.play('milestone');
    G.Village.log(`As preces de ${set ? set.name : 'um povo'} por ${PRAYER[p.kind].txt} foram atendidas. Eles cantam o seu nome.`, 'eye', p.x, p.y);
    G.UI && G.UI.toast('Preces atendidas', 'A devoção deles cresce.', 'eye');
    S.prayer = null; S.prayerCD = G.DAY_LEN * 0.8;
  };

  function trigger() {
    const S = G.S; const pop = S.villagers.size; const w = S.weather;
    const opts = [];
    if (w.storm <= 0 && w.drought <= 0) opts.push(['storm', 1]);
    if (w.drought <= 0 && w.storm <= 0 && S.day > 6) opts.push(['drought', 0.6]);
    if (pop >= 12 && S.day >= 8) opts.push(['wolves', 0.8]);
    if (pop >= 15 && S.day >= 6) opts.push(['sickness', 0.5]);
    opts.push(['fertility', 0.45]);
    opts.push(['discovery', 0.7]);
    let free = 0; for (const b of S.buildings.values()) if (b.built && G.BDEF[b.type].housing) free += G.BDEF[b.type].housing; free -= pop;
    if (pop < 70 && (free >= 3 || pop < 14)) opts.push(['immigrants', 0.75]);
    opts.push(['herd', 0.35]);
    let tot = 0; for (const o of opts) tot += o[1];
    let r = G.R() * tot;
    for (const [k, wgt] of opts) { r -= wgt; if (r <= 0) { E[k](); return; } }
  }

  E.storm = function () {
    const S = G.S; S.weather.storm = G.DAY_LEN * G.rr(0.35, 0.6);
    for (let k = 0; k < 3; k++) G.Nature.addCloud(G.rr(10, N - 10), G.rr(10, N - 10), G.rr(6, 9), G.rr(25, 40), 'storm');
    G.Village.log('Uma tempestade se aproxima da ilha.', 'storm');
    G.UI && G.UI.notice('Uma tempestade se aproxima…', 'storm');
    G.Audio && G.Audio.play('thunderFar');
  };
  E.drought = function () {
    const S = G.S; S.weather.drought = G.DAY_LEN * G.rr(2, 3.2);
    S.clouds = S.clouds.filter(c => c.kind === 'divine');
    G.Village.log('Começou uma seca. As plantações sofrem e o fogo se espalha fácil.', 'sun');
    G.UI && G.UI.notice('Seca! Plantações crescem devagar. A chuva ajudaria…', 'sun');
  };
  E.wolves = function () {
    const S = G.S; const sp = G.Animals.wildSpot(16);
    if (!sp) return;
    const n = G.ri(2, 4);
    G.Animals.spawnPack(sp[0], sp[1], n, false);
    G.Village.log(`Uma matilha de ${n} lobos foi avistada na floresta.`, 'wolf', sp[0], sp[1]);
    G.UI && G.UI.notice('Lobos rondam a ilha. Os caçadores estão atentos.', 'wolf');
  };
  E.sickness = function () {
    const S = G.S; const list = [...S.villagers.values()].filter(v => v.age >= 2);
    if (!list.length) return;
    const n = Math.min(list.length, G.ri(2, 3));
    for (let k = 0; k < n; k++) { const v = G.pick(list); v.sick = G.DAY_LEN * G.rr(0.6, 1.1); }
    G.Village.log('Uma febre começou a se espalhar entre os moradores.', 'sick');
    G.UI && G.UI.notice('Uma doença se espalha. O poder de Cura pode ajudar.', 'sick');
  };
  E.fertility = function () {
    const S = G.S; S.weather.fertility = G.DAY_LEN * 1.5;
    G.Village.log('Uma estação de fertilidade: muitos casais esperam filhos.', 'heart');
  };
  E.discovery = function () {
    const S = G.S;
    S.pendingDiscovery = { kind: G.R() < 0.55 ? 'stone' : 'berries', t: G.DAY_LEN * 1.2 };
    // send a curious soul exploring
    const list = [...S.villagers.values()].filter(v => v.age >= 16 && v.age < 60 && (!v.task || v.task.pri < 1));
    const c = list.find(v => v.traits.includes('Curioso')) || G.pick(list);
    if (c) { G.Vg.endTask(c); c.think = 99; const t = { type: 'explore', pri: 0.8, st: 0, age: 0, kind: 'explore' }; c.task = t; const sp = G.Animals.wildSpot(10); if (sp && G.Vg.goto(c, sp[0], sp[1], false)) { t.tx = sp[0]; t.ty = sp[1]; } else c.task = null; c.think = 1; }
  };
  E.onExplore = function (v) {
    const S = G.S; if (!S.pendingDiscovery) return;
    const s = G.Village.nearestSettlement(v.x, v.y);
    if (!s || G.dist(v.x, v.y, s.cx, s.cy) > 7) discover(v);
  };
  function discover(v) {
    const S = G.S; const d = S.pendingDiscovery; S.pendingDiscovery = null;
    if (!d) return;
    let x, y;
    if (v) { x = v.x; y = v.y; } else { const sp = G.Animals.wildSpot(10); if (!sp) return; [x, y] = sp; }
    let placed = 0;
    for (let k = 0; k < 30 && placed < (d.kind === 'stone' ? 4 : 6); k++) {
      const a = G.R() * 6.28, r = G.rr(1, 3.5);
      const tx = Math.floor(x + Math.cos(a) * r), ty = Math.floor(y + Math.sin(a) * r);
      if (!W.inb(tx, ty)) continue; const i = ty * N + tx;
      if (S.type[i] < T.GRASS || S.occ[i] || S.objAt[i] || S.treeAt[i]) continue;
      if (d.kind === 'stone') { if (G.Nature.addRock(tx + 0.5, ty + 0.5, G.ri(24, 38))) placed++; }
      else { const b = G.Nature.addBush(tx + 0.5, ty + 0.5); if (b) { b.berries = b.max; placed++; } }
      G.FX && G.FX.sparkle(tx + 0.5, ty + 0.5);
    }
    if (!placed) return;
    const what = d.kind === 'stone' ? 'um afloramento de pedras' : 'um bosque de frutas silvestres';
    if (v) G.Village.log(`${v.name} descobriu ${what}.`, d.kind === 'stone' ? 'stone' : 'food', x, y);
    else G.Village.log(`Descobriram ${what} num canto distante da ilha.`, d.kind === 'stone' ? 'stone' : 'food', x, y);
    if (v) G.Vg.emote(v, 'happy', 3);
  }
  E.herd = function () {
    const sp = G.Animals.wildSpot(14); if (!sp) return;
    const L = G.Animals.spawn('deer', sp[0], sp[1]);
    for (let k = 0; k < 3; k++) G.Animals.spawn('deer', sp[0] + G.rr(-1, 1), sp[1] + G.rr(-1, 1), { leader: L.id });
    G.Village.log('Uma manada de cervos chegou à ilha.', 'deer', sp[0], sp[1]);
  };

  // ---------------- travellers by boat ----------------
  function beach() {
    const S = G.S; const list = [];
    for (let i = 0; i < N * N; i++) if (S.type[i] === T.SAND && W.walkable(i)) {
      const x = i % N, y = (i / N) | 0;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const nx = x + dx, ny = y + dy; if (W.inb(nx, ny) && S.type[ny * N + nx] <= T.SEA) { list.push([x + 0.5, y + 0.5, dx, dy]); break; } }
    }
    if (!list.length) return null;
    // prefer a beach close to a settlement
    const s = G.Village.mainSettlement();
    if (s) list.sort((a, b) => G.dist(a[0], a[1], s.cx, s.cy) - G.dist(b[0], b[1], s.cx, s.cy));
    return list[Math.min(list.length - 1, Math.floor(G.R() * Math.min(12, list.length)))];
  }
  function immigrants(empty) {
    const S = G.S; const b = beach(); if (!b) return;
    const [lx, ly, dx, dy] = b;
    const sx = lx + dx * 14, sy = ly + dy * 14;
    const people = [];
    const r = G.R();
    let couple = false;
    if (r < 0.6 || empty) {
      couple = true;
      const a = G.ri(22, 34);
      people.push({ g: 'f', age: a }, { g: 'm', age: a + G.ri(-3, 5) });
      const kids = empty ? G.ri(1, 2) : G.ri(0, 2);
      for (let k = 0; k < kids; k++) people.push({ g: G.R() < 0.5 ? 'f' : 'm', age: G.ri(2, 10), kid: true });
      if (empty) people.push({ g: G.R() < 0.5 ? 'f' : 'm', age: G.ri(18, 26) }, { g: G.R() < 0.5 ? 'f' : 'm', age: G.ri(18, 26) });
    } else {
      const n = G.ri(2, 3); for (let k = 0; k < n; k++) people.push({ g: G.R() < 0.5 ? 'f' : 'm', age: G.ri(18, 30) });
    }
    S.boats.push({ x: sx, y: sy, sx, sy, tx: lx + dx * 0.9, ty: ly + dy * 0.9, lx, ly, st: 'arrive', t: 0, people, couple, empty: !!empty });
  }
  E.immigrants = () => immigrants(false);
  function updateBoats(dt) {
    const S = G.S;
    for (let k = S.boats.length - 1; k >= 0; k--) {
      const b = S.boats[k];
      if (b.st === 'arrive' || b.st === 'leave') {
        const tx = b.st === 'arrive' ? b.tx : b.sx, ty = b.st === 'arrive' ? b.ty : b.sy;
        const dx = tx - b.x, dy = ty - b.y; const d = Math.hypot(dx, dy);
        const sp = 1.1 * dt;
        b.face = (dx - dy) > 0 ? 1 : -1;
        if (d < sp) {
          b.x = tx; b.y = ty;
          if (b.st === 'arrive') { b.st = 'unload'; b.t = 0; land(b); }
          else { S.boats.splice(k, 1); continue; }
        } else { b.x += dx / d * sp; b.y += dy / d * sp; }
        if (G.R() < dt * 3) G.FX && G.FX.wake(b.x, b.y);
      } else if (b.st === 'unload') { b.t += dt; if (b.t > 4) b.st = 'leave'; }
    }
  }
  function land(b) {
    const S = G.S;
    let set = G.Village.nearestSettlement(b.lx, b.ly);
    if (!set) {
      set = G.Village.addSettlement(G.SETTLEMENT_NAMES[0], b.lx, b.ly);
      const n = W.nearestLand(b.lx - (b.tx - b.lx) * 6, b.ly - (b.ty - b.ly) * 6, 8) || [b.lx, b.ly];
      set.cx = n[0]; set.cy = n[1];
    } else if (b.empty && G.Village.pop(set.id) === 0) {
      set.fails = 0;
    }
    const made = [];
    let mother = null, father = null;
    for (const p of b.people) {
      const o = { g: p.g, age: p.age + G.R(), x: b.lx + G.rr(-0.3, 0.3), y: b.ly + G.rr(-0.3, 0.3), set: set.id };
      if (p.kid && mother) { o.mother = mother.id; o.father = father ? father.id : 0; }
      const v = G.Vg.create(o);
      if (p.kid && mother) { mother.kids.push(v.id); if (father) father.kids.push(v.id); }
      if (!p.kid && p.g === 'f' && !mother) mother = v; else if (!p.kid && p.g === 'm' && !father) father = v;
      made.push(v);
      v.devotion = G.rr(3, 10);
      G.Vg.emote(v, 'happy', 3);
      v.task = { type: 'migrate', pri: 1.5, st: 0, age: 0 };
    }
    if (b.couple && mother && father) { mother.partner = father.id; father.partner = mother.id; }
    S.stats.immigrants += made.length;
    const names = made.filter(v => v.age >= 16).map(v => v.name);
    const txt = b.empty ? `Viajantes encontraram a ilha deserta e decidiram ficar: ${names.join(', ')}.`
      : (mother && father && made.length > 2) ? `Uma família de viajantes chegou de barco: ${names.join(' e ')}, com ${made.length - names.length} ${made.length - names.length === 1 ? 'criança' : 'crianças'}.`
        : `Viajantes chegaram de barco à ilha: ${names.join(', ')}.`;
    G.Village.log(txt, 'boat', b.lx, b.ly);
    G.UI && G.UI.notice('Um barco chegou à ilha!', 'boat');
  }
})(window.G);
