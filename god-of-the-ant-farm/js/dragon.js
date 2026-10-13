'use strict';
// ============================================================
//  O Dragão (Ira): the god wakes a dragon. It comes down out of
//  the sky, makes the highest ground around its lair and hunts
//  from there: it flies over a town, dives and breathes fire
//  along the streets, snatches the coins of the richest houses
//  and goes back to sleep on its hoard. The towns fight back —
//  archers, hunters and towers shoot when it flies low — and
//  while it sleeps the bravest climb to the lair to kill it.
//  Slain, it falls: its bones stay where it died and its gold
//  spills out for the people to pick up, and whoever struck the
//  last blow is called the dragon-slayer for ever. Unslain, a
//  few days later it flies away, and the treasure goes with it.
//  S.dragons and S.dragonBones are saved. Every coin it takes is
//  in d.hoard (coin-equivalents: a people without coins loses
//  gold, six coins to the unit): spilt where it dies, or gone.
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const P = G.Powers;
  const DAY = () => G.DAY_LEN;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const where = (x, y) => G.Village.nearSettlementName(x, y);
  const TAU = Math.PI * 2;

  const DRAGON = { id: 'dragon', tab: 'ira', name: 'Dragão', cost: 120, r: 2, good: false, desc: 'Um dragão desperta e desce do céu. Faz do lugar mais alto da região o seu covil e de lá caça: queima as ruas em rasantes, leva o ouro das casas mais ricas e volta a dormir sobre o tesouro. Arqueiros e torres atiram quando ele voa baixo; enquanto dorme, os mais bravos sobem ao covil para matá-lo — e quem conseguir vira lenda. Se ninguém o matar, um dia ele parte levando tudo.' };
  { let k = -1; G.POWERS.forEach((q, i) => { if (q.tab === 'ira') k = i; }); G.POWERS.splice(k + 1, 0, DRAGON); }
  G.POWERS.forEach(p => { p.key = String(G.POWERS.filter(q => q.tab === p.tab).indexOf(p) + 1); });

  // ------------------------------ the beast ------------------------------
  // colours by the land it wakes in (the white one, of the cold lands, breathes frost instead of fire)
  const HUES = [
    { n: 'Rubro', body: '#b3352b', dark: '#4e110d', wing: '#82231b', belly: '#e9b26a', eye: '#ffd54a', breath: 'fogo' },
    { n: 'Verde', body: '#3f7a39', dark: '#16301a', wing: '#2b5a2a', belly: '#cfd27a', eye: '#fff07a', breath: 'fogo' },
    { n: 'Negro', body: '#3d3746', dark: '#0e0c12', wing: '#29242f', belly: '#8a6a5a', eye: '#ff7a2a', breath: 'fogo' },
    { n: 'Branco', body: '#e6ebf0', dark: '#4c5a6a', wing: '#a9b6c4', belly: '#ffffff', eye: '#4fc4ff', breath: 'gelo' },
    { n: 'Dourado', body: '#cf9f3e', dark: '#5a3c0e', wing: '#9a7228', belly: '#f6e2a0', eye: '#ff4a2a', breath: 'fogo' },
  ];
  const TITLES = [['o Rubro', 'a Serpente Vermelha', 'o Senhor das Cinzas'], ['o Verde', 'o Terror dos Bosques', 'a Serpente dos Pântanos'], ['o Negro', 'a Sombra Alada', 'o Devorador de Cidades'], ['o Branco', 'a Asa do Inverno', 'o Hálito de Gelo'], ['o Dourado', 'o Rei do Deserto', 'a Asa do Sol']];
  const hueOf = i => { const b = G.Biome ? G.Biome.of(i) : 0; const ID = G.Biome ? G.Biome.ID : {}; return b === ID.NEVE || b === ID.TAIGA ? 3 : b === ID.DESERTO || b === ID.SAVANA ? 4 : b === ID.SELVA || b === ID.PANTANO ? 1 : G.S.type[i] === T.ROCKY ? 2 : 0; };
  const MAX = 2, HP = 520, CRUISE = 13, LOW = 3.6, SPEED = 4.6, PASS_SPEED = 6.2, PASSES = 3, SORTIES = 3;
  // (who shoots at a dragon flying low: the armed, and the towers)
  const ARMED = { guerreiro: 1, cacador: 1, vigia: 1, arqueiro: 1, guarda: 1, carcereiro: 1 };
  const list = () => { const S = G.S; if (!S.dragons) S.dragons = []; return S.dragons; };
  const bones = () => { const S = G.S; if (!S.dragonBones) S.dragonBones = []; return S.dragonBones; };
  const alive = d => d.st !== 'morre';
  const landed = d => d.st === 'dorme' || d.st === 'luta';
  P.dragons = () => (G.S.dragons || []);
  // (for the body's eyes, the 3D: the colours of each one, and the arrows and the fires in the air — read only)
  P.dragonLook = d => HUES[d.hue] || HUES[0];
  P.dragonShots = () => shots;

  // ------------------------------ checks ------------------------------
  const prevCheck = P.check;
  P.check = function (p, x, y) {
    if (p.id !== 'dragon') return prevCheck ? prevCheck(p, x, y) : true;
    const L = G.S.dragons || [];
    if (L.filter(alive).length >= MAX) { P.why = 'Já há dragões demais no céu.'; return false; }
    if (!lairNear(x, y)) { P.why = 'Não há terra firme por perto para o covil de um dragão.'; return false; }
    return true;
  };
  // the lair: high, dry, open ground, away from the towns (and, if it can be had, where they can walk to)
  function lairNear(x, y, avoid) {
    const S = G.S; let best = null, bs = -1e9;
    const sets = [...S.settlements.values()];
    for (let k = 0; k < 900; k++) {
      // (a spiral of samples: the same ones each time, the world's dice are not needed to look)
      const a = k * 2.39996, r = Math.sqrt(k) * 1.25; const tx = Math.floor(x + Math.cos(a) * r), ty = Math.floor(y + Math.sin(a) * r);
      if (!W.inb(tx, ty) || tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) continue;
      const i = ty * N + tx; if (S.type[i] < T.SAND || S.type[i] === T.RIVER || !W.walkable(i) || S.occ[i] || S.treeAt[i]) continue;
      if (avoid && G.dist(tx, ty, avoid[0], avoid[1]) < 3) continue;
      let near = 1e9, reach = 0; for (const s of sets) { const d = G.dist(tx, ty, s.cx, s.cy); if (d < near) near = d; if (d < 45 && W.townReaches(s, tx + 0.5, ty + 0.5)) reach = 1; }
      if (near < 9) continue;
      const sc = W.tileH(i) * 1.6 + (S.type[i] === T.ROCKY ? 4 : 0) + reach * 9 - Math.abs(Math.min(near, 40) - 18) * 0.25 - r * 0.12;
      if (sc > bs) { bs = sc; best = [tx + 0.5, ty + 0.5]; }
    }
    return best;
  }

  // ------------------------------ the waking ------------------------------
  P.dragon = function (x, y) {
    const S = G.S; const lair = lairNear(x, y); if (!lair) return;
    const hue = hueOf(W.idx(lair[0], lair[1]));
    const name = G.mythName();
    const title = G.pick(TITLES[hue]);
    const d = {
      id: S.nextId++, name, title, hue, x, y, h: W.groundH(x, y) + 60, alt: 60, hd: G.R() * TAU, st: 'chega', t: 0,
      lx: lair[0], ly: lair[1], hp: HP, maxHp: HP, hoard: 0, took: 0, burned: 0, killed: 0, sorties: 0, passes: 0,
      set: 0, first: (P.setAt(x, y, 30) || {}).id || 0, pass: null, wake: 0, called: 0, born: S.day, hurt: {}, by: {}, last: 0, bt: 0, rt: 0, ct: 0, at: 0, tx: x, ty: y, fall: 0,
    };
    list().push(d);
    G.Audio && G.Audio.play('roar');
    G.Render && G.Render.shake(0.5);
    P.witness(x, y, 26, -4, 30);
    const w = where(x, y);
    log(`Um rugido rasgou o céu${w ? ' sobre ' + w : ''}: ${name}, ${title}, desceu das nuvens — um dragão. Ele fez seu covil ${G.Village.nearSettlementName(lair[0], lair[1]) ? 'nas alturas perto de ' + G.Village.nearSettlementName(lair[0], lair[1]) : 'nas alturas'}.`, 'fire', x, y);
    G.Lore && G.Lore.note('dragon', { name, title, where: w });
    G.Lore && G.Lore.legend('dragon:' + d.id, `${name}, ${title}`, `No ano ${S.day}, ${name} desceu das nuvens${w ? ' sobre ' + w : ''}: um dragão ${HUES[hue].n.toLowerCase()}, de asas maiores que as casas, e fez seu covil nas alturas.`, { kind: 'monstro' });
  };

  // ------------------------------ flight ------------------------------
  // steer towards a point at a height above the ground: a turning circle, not a teleport
  function fly(d, dt, tx, ty, alt, sp, turn) {
    const want = Math.atan2(ty - d.y, tx - d.x);
    let da = want - d.hd; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    const tr = (turn || 1.7) * dt; d.hd += G.clamp(da, -tr, tr);
    d.x += Math.cos(d.hd) * sp * dt; d.y += Math.sin(d.hd) * sp * dt;
    const g = W.inb(d.x, d.y) ? W.groundH(d.x, d.y) : G.SEA;
    const goal = g + alt; d.h += G.clamp(goal - d.h, -7 * dt, 7 * dt);
    if (d.h < g + 1.4) d.h = g + 1.4;
    d.alt = d.h - g;
    return G.dist(d.x, d.y, tx, ty);
  }
  // the town it hunts: the one nearest the lair that it has not left in ashes, and rich ones first
  function chooseTown(d) {
    const S = G.S; let best = null, bs = -1e9;
    for (const s of S.settlements.values()) {
      if (!G.Village.pop(s.id)) continue;
      const dd = G.dist(s.cx, s.cy, d.lx, d.ly); if (dd > 60) continue;
      const sc = -dd + G.Village.pop(s.id) * 0.15 + (s.id === d.set ? -6 : 0) + G.R() * 6;
      if (sc > bs) { bs = sc; best = s; }
    }
    return best;
  }
  // a run over the town: in from outside, straight across the centre, out the other side
  function plan(d, s) {
    const a = G.R() * TAU; const L = 9;
    d.pass = { x0: s.cx + Math.cos(a) * L, y0: s.cy + Math.sin(a) * L, x1: s.cx - Math.cos(a) * L, y1: s.cy - Math.sin(a) * L, k: 0 };
  }
  // the breath: a line of fire on the ground ahead of the head
  function breathe(d, dt) {
    const S = G.S;
    d.bt += dt; if (d.bt < 0.12) return; d.bt = 0;
    const bx = d.x + Math.cos(d.hd) * 1.6, by = d.y + Math.sin(d.hd) * 1.6; if (!W.inb(bx, by)) return;
    const i = W.idx(bx, by);
    const ice = HUES[d.hue].breath === 'gelo';
    if (!ice) { if (G.Nature.ignite(i, 0.95)) d.burned++; for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (G.R() < 0.35 && W.inb(bx + ox, by + oy)) { if (G.Nature.ignite(W.idx(bx + ox, by + oy), 0.7)) d.burned++; } }
    else {
      // (the frost: what grows in the field dies black, the fire goes out, the bushes are stripped)
      if (S.fire[i] > 0) G.Nature.extinguish(i, 1);
      const f = S.occ[i] && S.buildings.get(S.occ[i]);
      if (f && f.type === 'farm' && f.crops) { const kk = G.Village.farmTileIndex(f, Math.floor(bx), Math.floor(by)); const c = kk >= 0 && f.crops[kk]; if (c && c.s > 0) { c.s = 0; c.g = 0; c.c = 0; d.burned++; } }
      const bu = S.objAt[i] && S.bushes.get(S.objAt[i]); if (bu && bu.berries > 0) { bu.berries = 0; d.burned++; }
    }
    const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && b.hp > 0) G.Village.damageBuilding(b, ice ? 9 : 5, ice ? 'quake' : 'fire');
    for (const v of [...S.villagers.values()]) {
      if (v.inside || v.aboard || v.ug || v.air || G.dist2(v.x, v.y, bx, by) > 1.3 * 1.3) continue;
      G.Vg.damage(v, ice ? 26 : 30, 'dragon', true);
      if (!S.villagers.has(v.id)) d.killed++;
    }
    for (const s of [...S.ships]) if (G.dist2(s.x, s.y, bx, by) < 1.5 * 1.5) { s.hp -= ice ? 10 : 14; if (s.hp <= 0) G.Naval.sink(s, null, 'god'); }
    for (const a of [...S.animals.values()]) if (!a.dead && G.dist2(a.x, a.y, bx, by) < 1.2) G.Animals.damage(a, 40, null);
    if (G.R() < 0.4) (S.panic = S.panic || []).push({ x: bx, y: by, r: 5, t: 1.8, why: 'dragon' });
    shots.push({ k: 'breath', x: bx, y: by, t: 0 });
  }
  // the town shoots back while it flies low (or lies at its lair): the armed and the towers
  function shoot(d, dt) {
    const S = G.S; d.at += dt; if (d.at < 1) return; d.at = 0;
    const low = landed(d) || d.alt < 6.5; if (!low) return;
    let n = 0;
    for (const v of S.villagers.values()) {
      if (n >= 14 || v.inside || v.aboard || v.ug || v.captive || v.age < 15 || (!ARMED[v.role] && !v.hero) || (v.task && v.task.type === 'dragao')) continue;
      if (G.dist2(v.x, v.y, d.x, d.y) > 7.5 * 7.5) continue;
      n++;
      if (G.R() < 0.45) hit(d, v, G.rr(3, 6) * (v.hero ? 3 : 1) * (v.chosen ? 2 : 1), 'arrow');
      shots.push({ k: 'arrow', x0: v.x, y0: v.y, h0: W.groundH(v.x, v.y) + 1.5, x1: d.x, y1: d.y, h1: d.h, t: 0 });
      if (G.R() < 0.3) G.Vg.emote(v, 'angry', 1.2);
    }
    for (const b of S.buildings.values()) {
      if (b.type !== 'torre' || !b.built || b.hp <= 0 || G.dist2(b.x + 0.5, b.y + 0.5, d.x, d.y) > 8 * 8) continue;
      const f = G.Fac.ofSet(b.set); if (G.R() < 0.6) hit(d, null, G.rr(6, 11), 'tower', f ? f.id : 0);
      shots.push({ k: 'arrow', x0: b.x + 0.5, y0: b.y + 0.5, h0: W.groundH(b.x + 0.5, b.y + 0.5) + 5, x1: d.x, y1: d.y, h1: d.h, t: 0 });
    }
    if (n) G.Audio && G.Audio.at(d.x, d.y, 'arrow');
  }
  function hit(d, v, n, how, fid) {
    if (!alive(d)) return;
    d.hp -= n; const f = v ? G.Fac.idOfV(v) : (fid || 0);
    if (f) d.by[f] = (d.by[f] || 0) + n;
    if (v) d.last = v.id;
    else if (how === 'god') d.last = -1;
  }
  // the gold: a third of the richest purses of the town, and of its treasury
  function rob(d, s) {
    const S = G.S; const f = G.Fac.get(s.fac); if (!f) return 0;
    let n = 0;
    if (G.Eco.coinage(f.id)) {
      const houses = [...S.buildings.values()].filter(b => b.set === s.id && b.built && G.BDEF[b.type].housing && (b.coin || 0) > 0).sort((a, b) => b.coin - a.coin || a.id - b.id).slice(0, 8);
      for (const h of houses) { const k = Math.round(h.coin * 0.35 * 100) / 100; h.coin = Math.round((h.coin - k) * 100) / 100; n += k; }
      const k = Math.round((f.stock.moedas || 0) * 0.25 * 100) / 100; f.stock.moedas -= k; n += k;
    } else {
      const k = Math.round((f.stock.ouro || 0) * 0.3 * 100) / 100; f.stock.ouro = (f.stock.ouro || 0) - k; n += k * 6;
    }
    n = Math.round(n * 100) / 100;
    d.hoard = Math.round((d.hoard + n) * 100) / 100; d.took = Math.round((d.took + n) * 100) / 100;
    d.hurt[f.id] = (d.hurt[f.id] || 0) + 1;
    return n;
  }

  // ------------------------------ the hunters ------------------------------
  // while it sleeps, every people it burned or robbed sends its bravest up to the lair
  function call(d) {
    const S = G.S; d.called = S.clock;
    const facs = Object.keys(d.hurt).map(Number).filter(fid => G.Fac.get(fid) && G.Fac.get(fid).alive !== false).sort((a, b) => d.hurt[b] - d.hurt[a] || a - b);
    let sent = 0;
    for (const fid of facs) {
      const brave = [];
      for (const v of S.villagers.values()) {
        if (v.captive || v.jail || v.aboard || v.ug || v.age < 16 || v.age > 60 || v.hp < 55 || G.Fac.idOfV(v) !== fid) continue;
        if (!ARMED[v.role] && !v.hero && !v.chosen && (v.courage || 0) < 0.85) continue;
        if (v.task && v.task.pri >= 4.5) continue;
        if (G.dist2(v.x, v.y, d.lx, d.ly) > 70 * 70 || !W.reaches(v, d.lx, d.ly)) continue;
        brave.push(v);
      }
      brave.sort((a, b) => ((b.hero ? 50 : 0) + (b.chosen ? 80 : 0) + (b.kills || 0) * 3 + b.hp * 0.2) - ((a.hero ? 50 : 0) + (a.chosen ? 80 : 0) + (a.kills || 0) * 3 + a.hp * 0.2) || a.id - b.id);
      for (const v of brave.slice(0, Math.min(8, 12 - (d.sent || 0) - sent))) if (G.Vg.give(v, { type: 'dragao', id: d.id, pri: 4.5, st: 0, rt: 0, kind: 'dragao' })) { sent++; G.Vg.emote(v, 'angry', 2); }
    }
    d.sent = (d.sent || 0) + sent;
    if (sent) { const f = G.Fac.get(facs[0]); log(`${sent} ${sent > 1 ? 'bravos' : 'bravo'}${f ? ' de ' + f.name : ''} ${sent > 1 ? 'partiram' : 'partiu'} para o covil de ${d.name} enquanto o dragão dorme.`, 'war', d.lx, d.ly); }
  }
  const hunting = (v, d) => v.task && v.task.type === 'dragao' && v.task.id === d.id;
  function runDragao(v, t, dt, H) {
    const S = G.S; const d = (S.dragons || []).find(q => q.id === t.id);
    if (!d || !alive(d) || !landed(d)) return H.end(v); // (it flew off — or it is dead: home)
    if (v.hp < 28) { G.Vg.emote(v, 'fear', 2); return H.end(v); } // (the badly hurt give up)
    const dd = G.dist(v.x, v.y, d.x, d.y);
    if (t.st === 3) {
      // (gathered below the lair: they go in together, when enough of them are here — or when waiting is worse)
      v.act = ''; v.moving = false; G.faceTo(v, d.x - v.x, d.y - v.y); t.w = (t.w || 0) + dt;
      const party = [...S.villagers.values()].filter(o => hunting(o, d));
      const here = party.filter(o => G.dist2(o.x, o.y, d.x, d.y) < 7 * 7).length;
      if (here >= Math.min(3, party.length) || t.w > 25 || party.some(o => o.task.go)) { t.go = 1; t.st = 1; t.rt = 0; G.Vg.emote(v, 'angry', 2); }
      return;
    }
    if (t.st < 2) {
      if (dd < 1.9) { t.st = 2; v.actT = 0; return; }
      if (!t.go && dd < 6) { t.st = 3; t.w = 0; v.path = null; return; }
      t.rt -= dt;
      if (t.rt <= 0 || H.arrived(v)) {
        t.rt = 2;
        // (a spot beside the beast, each hunter on his own side)
        const a = (v.id % 7) / 7 * TAU; let ok = false;
        for (let k = 0; k < 7 && !ok; k++) { const aa = a + k * 0.9; ok = H.goto(v, d.x + Math.cos(aa) * 1.4, d.y + Math.sin(aa) * 1.4, false, 5000); }
        if (!ok) return H.end(v);
        t.st = 1;
      }
      v.act = 'run'; H.move(v, dt, t.go ? 1.2 : 1.05);
      if (t.age > 150) return H.end(v);
      return;
    }
    if (dd > 2.6) { t.st = 1; t.rt = 0; return; }
    v.act = 'fight'; v.moving = false; G.faceTo(v, d.x - v.x, d.y - v.y);
    t.ht = (t.ht || 0) + dt;
    if (t.ht >= 1) {
      t.ht = 0;
      let n = G.rr(6, 11) * (v.hero ? 2.5 : 1) * (v.chosen ? 3 : 1) * (v.elite ? 1.4 : 1);
      if (d.st === 'dorme') { n *= 3; d.st = 'luta'; d.t = 0; d.ct = 0; G.Audio && G.Audio.at(d.x, d.y, 'roar', true); log(`${v.name} cravou a lâmina em ${d.name} adormecido — o dragão acordou furioso!`, 'war', d.x, d.y); }
      hit(d, v, n, 'blade');
      G.Audio && G.Audio.at(v.x, v.y, 'clang');
      G.FX && G.FX.blood(d.x, d.y);
    }
  }

  // ------------------------------ the update ------------------------------
  function update(dt) {
    const S = G.S; const L = S.dragons;
    for (let k = L.length - 1; k >= 0; k--) {
      const d = L[k]; d.t += dt;
      if (d.st === 'morre') { die(d, dt); if (d.done) L.splice(k, 1); continue; }
      if (d.hp <= 0) { d.st = 'morre'; d.t = 0; d.fall = 0; continue; }
      shoot(d, dt);
      switch (d.st) {
        case 'chega': {
          // (down out of the clouds, roaring)
          d.hd += dt * 0.6; d.h = Math.max(W.groundH(d.x, d.y) + CRUISE, d.h - dt * 14); d.alt = d.h - W.groundH(d.x, d.y);
          if (d.t > 4) { d.st = 'caca'; d.t = 0; }
          break;
        }
        case 'caca': {
          const s = S.settlements.get(d.set);
          if (!s || !G.Village.pop(s.id) || d.t < 0.1) {
            // (the first town it goes for is the one the god pointed at)
            const f0 = d.first && S.settlements.get(d.first); d.first = 0;
            const n = f0 && G.Village.pop(f0.id) ? f0 : chooseTown(d);
            if (!n) { d.st = 'volta'; d.t = 0; break; }
            d.set = n.id; plan(d, n); d.passes = 0;
          }
          const p = d.pass; if (!p) { plan(d, S.settlements.get(d.set)); break; }
          if (fly(d, dt, p.x0, p.y0, CRUISE, SPEED) < 2.5) { d.st = 'passe'; d.t = 0; G.Audio && G.Audio.at(d.x, d.y, 'roar', true); }
          if (d.t > 60) { d.st = 'volta'; d.t = 0; }
          break;
        }
        case 'passe': {
          const p = d.pass; const s = S.settlements.get(d.set);
          const left = fly(d, dt, p.x1, p.y1, LOW, PASS_SPEED, 0.9);
          // (fire from the edge of the town to the other edge)
          if (s && G.dist(d.x, d.y, s.cx, s.cy) < 7.5 && d.alt < LOW + 3) { breathe(d, dt); d.breath = 1; } else d.breath = 0;
          if (left < 2 || d.t > 9) {
            d.breath = 0; d.passes++;
            if (s && s.fac) d.hurt[s.fac] = (d.hurt[s.fac] || 0) + 1;
            if (!s || d.passes >= PASSES) { d.st = 'rouba'; d.t = 0; }
            else { d.st = 'curva'; d.t = 0; }
          }
          break;
        }
        case 'curva': {
          // (up and round, for the next run from another side)
          const s = S.settlements.get(d.set); if (!s) { d.st = 'volta'; d.t = 0; break; }
          fly(d, dt, s.cx + Math.cos(d.t * 0.8 + d.id) * 14, s.cy + Math.sin(d.t * 0.8 + d.id) * 14, CRUISE * 0.8, SPEED);
          if (d.t > 3.5) { plan(d, s); d.st = 'caca'; d.t = 0.2; }
          break;
        }
        case 'rouba': {
          // (down on the treasury: the claws come up full)
          const s = S.settlements.get(d.set); if (!s) { d.st = 'volta'; d.t = 0; break; }
          const dd = fly(d, dt, s.cx, s.cy, 2.2, SPEED * 0.8, 2.4);
          if (dd < 1.5 || d.t > 12) {
            const n = rob(d, s);
            G.Render && G.Render.shake(0.25);
            log(n > 0 ? `${d.name} mergulhou sobre ${s.name} e levou ${n >= 2 ? Math.round(n) + ' moedas' : 'o pouco ouro que havia'} nas garras.` : `${d.name} revirou ${s.name} atrás de ouro e não achou nada — o povo ri, de longe.`, 'gold', s.cx, s.cy);
            d.st = 'volta'; d.t = 0;
          }
          break;
        }
        case 'volta': {
          if (fly(d, dt, d.lx, d.ly, CRUISE, SPEED) < 0.8 || d.t > 45) {
            d.x = d.lx; d.y = d.ly; d.h = W.groundH(d.x, d.y); d.alt = 0; d.st = 'dorme'; d.t = 0; d.sorties++; d.called = 0; d.sent = 0;
            d.wake = S.clock + DAY() * 0.55; d.breath = 0;
            G.Render && G.Render.shake(0.3);
          }
          break;
        }
        case 'dorme': case 'luta': {
          d.h = W.groundH(d.x, d.y); d.alt = 0;
          // (the god changed the ground under it — the sea took the lair: it finds another)
          const li = W.idx(d.lx, d.ly);
          if (S.type[li] < T.SAND || S.type[li] === T.RIVER) { const nl = lairNear(d.lx, d.ly, [d.lx, d.ly]); if (nl) { d.lx = nl[0]; d.ly = nl[1]; } d.st = 'volta'; d.t = 0; break; }
          if (d.st === 'dorme') {
            d.hp = Math.min(d.maxHp, d.hp + dt * d.maxHp * 0.06 / (DAY() * 0.55));
            // (the brave go up by day: at night they are asleep like everyone else, and they set out at dawn)
            if (d.t > 4 && !G.isNight() && (!d.called || (S.clock - d.called > 20 && (d.sent || 0) < 12 && ![...S.villagers.values()].some(v => hunting(v, d))))) call(d);
            if (S.clock >= d.wake) { if (d.sorties >= SORTIES || S.day - d.born >= 4) { d.st = 'parte'; d.t = 0; leaving(d); } else { d.st = 'caca'; d.t = 0; d.set = 0; G.Audio && G.Audio.at(d.x, d.y, 'roar', true); } }
          } else fight(d, dt);
          break;
        }
        case 'parte': {
          // (out to the nearest edge of the world, and beyond)
          const ex = d.lx < N / 2 ? -14 : N + 14, ey = d.ly < N / 2 ? -14 : N + 14;
          const tx = Math.abs(d.lx - N / 2) > Math.abs(d.ly - N / 2) ? ex : d.lx, ty = Math.abs(d.lx - N / 2) > Math.abs(d.ly - N / 2) ? d.ly : ey;
          fly(d, dt, tx, ty, CRUISE * 1.6, SPEED * 1.2);
          if (d.x < -10 || d.y < -10 || d.x > N + 10 || d.y > N + 10 || d.t > 60) { gone(d); L.splice(k, 1); }
          break;
        }
      }
    }
    for (const q of shots) q.t += dt;
    for (let k = shots.length - 1; k >= 0; k--) if (shots[k].t > (shots[k].k === 'breath' ? 1.1 : 0.6)) shots.splice(k, 1);
  }
  // on the ground at the lair, the hunters around it: bite, tail, fire — and if it is losing, it flies
  function fight(d, dt) {
    const S = G.S;
    const near = [...S.villagers.values()].filter(v => hunting(v, d) && G.dist2(v.x, v.y, d.x, d.y) < 3.2 * 3.2);
    if (!near.length) { if (d.t > 6) { d.st = 'dorme'; d.t = 4.1; } return; }
    d.t = Math.min(d.t, 1);
    if (d.hp < d.maxHp * 0.18 && !d.fled) { d.fled = 1; if (G.R() < 0.5) { d.st = 'parte'; d.t = 0; log(`${d.name}, sangrando, abriu as asas e fugiu do covil!`, 'war', d.x, d.y); leaving(d); return; } }
    d.ct += dt; if (d.ct < 1.6) return; d.ct = 0;
    const tg = near.sort((a, b) => G.dist2(a.x, a.y, d.x, d.y) - G.dist2(b.x, b.y, d.x, d.y) || a.id - b.id)[0];
    G.faceTo(d, tg.x - d.x, tg.y - d.y); d.hd = Math.atan2(tg.y - d.y, tg.x - d.x);
    const r = G.R();
    if (r < 0.45) { G.Vg.damage(tg, G.rr(26, 40), 'dragon', true); G.Audio && G.Audio.at(d.x, d.y, 'bite'); }
    else if (r < 0.75) { for (const v of near) if (G.dist2(v.x, v.y, d.x, d.y) < 2.6 * 2.6) { G.Vg.damage(v, G.rr(8, 14), 'dragon', true); if (S.villagers.has(v.id)) v.downT = S.clock + 1.2; } G.Audio && G.Audio.at(d.x, d.y, 'thud'); }
    else { for (const v of near) G.Vg.damage(v, G.rr(14, 22), 'dragon', true); shots.push({ k: 'breath', x: tg.x, y: tg.y, t: 0 }); G.Audio && G.Audio.at(d.x, d.y, 'flame'); }
    for (const v of near) if (!S.villagers.has(v.id)) d.killed++;
    if (r >= 0.75) d.ft = S.clock;
  }
  // the god's own hand: a lightning bolt or a meteor that finds it
  const prevStrike = P.strike;
  P.strike = function (x, y, divine) {
    const r = prevStrike.apply(this, arguments);
    for (const d of G.S.dragons || []) if (alive(d) && G.dist(d.x, d.y, x, y) < 2.2) { hit(d, null, divine ? 220 : 90, 'god'); G.Audio && G.Audio.at(d.x, d.y, 'roar', true); }
    return r;
  };
  const prevImpact = P.meteorImpact;
  P.meteorImpact = function (m) {
    const r = prevImpact.apply(this, arguments);
    for (const d of G.S.dragons || []) if (alive(d) && G.dist(d.x, d.y, m.x, m.y) < m.r + 1) hit(d, null, 600, 'god'); // (a rock out of the sky goes through every height)
    return r;
  };
  // the fall: it drops out of the sky (or slumps at its lair), the ground shakes, the gold spills
  function die(d, dt) {
    const S = G.S;
    if (!d.fallen) {
      d.fall += dt * 9; d.h -= d.fall * dt * 3; d.x += Math.cos(d.hd) * dt * 2; d.y += Math.sin(d.hd) * dt * 2;
      d.x = G.clamp(d.x, 1, N - 1); d.y = G.clamp(d.y, 1, N - 1);
      const g = W.groundH(d.x, d.y); d.alt = Math.max(0, d.h - g);
      if (d.h > g + 0.2 && d.t < 6) return;
      d.h = g; d.alt = 0; d.fallen = 1; d.t = 0;
      slain(d);
    }
    if (d.t > 1.5) d.done = 1;
  }
  function slain(d) {
    const S = G.S;
    G.Render && G.Render.shake(0.7); G.Audio && G.Audio.play('collapse');
    // (where it falls, it crushes)
    for (const v of [...S.villagers.values()]) if (!v.inside && !v.aboard && G.dist2(v.x, v.y, d.x, d.y) < 1.4 * 1.4 && !hunting(v, d)) G.Vg.damage(v, 80, 'dragon', true);
    const i = W.idx(d.x, d.y); const b = S.occ[i] && S.buildings.get(S.occ[i]); if (b && b.hp > 0) G.Village.damageBuilding(b, 160, 'meteor');
    const killer = d.last > 0 ? S.villagers.get(d.last) : null;
    const byGod = d.last === -1;
    const f = killer ? G.Fac.ofV(killer) : null;
    const water = W.inb(d.x, d.y) && (S.type[i] < T.SAND || S.type[i] === T.RIVER);
    if (!water) { const L = bones(); L.push({ id: S.nextId++, x: d.x, y: d.y, hd: d.hd, name: d.name, hue: d.hue, day: S.day }); if (L.length > 6) L.shift(); }
    const w = where(d.x, d.y);
    let txt = `${d.name}, ${d.title}, está morto!`;
    if (killer) {
      txt = `${killer.name} matou ${d.name}, ${d.title}! ${f ? 'O povo de ' + f.name : 'O povo'} canta o seu nome.`;
      killer.kills = (killer.kills || 0) + 1;
      if (f) G.Politics.earn(f, killer, 'matadragao', true);
      G.Life && G.Life.bio(killer, 'note', `Matou ${d.name}, ${d.title}, o dragão que queimava as cidades`, `Matei o dragão`);
      for (const v of S.villagers.values()) if (hunting(v, d) && v !== killer) G.Life && G.Life.bio(v, 'note', `Lutou contra o dragão ${d.name} no covil, ao lado de ${killer.name}`);
      G.Lore && G.Lore.note('dragonSlain', { name: d.name, by: killer.name, fac: f ? f.id : 0 });
    } else if (byGod) { txt = `O céu matou ${d.name}, ${d.title}: o dragão despencou${w ? ' perto de ' + w : ''}.`; G.Lore && G.Lore.note('dragonSlain', { name: d.name, god: 1 }); }
    else { const fb = Object.keys(d.by).map(Number).sort((a, b) => d.by[b] - d.by[a])[0]; const ff = G.Fac.get(fb); txt = `${d.name}, ${d.title}, caiu crivado de flechas${ff ? ' pelos arqueiros de ' + ff.name : ''}!`; G.Lore && G.Lore.note('dragonSlain', { name: d.name, fac: ff ? ff.id : 0 }); }
    G.Lore && G.Lore.legend('dragon:' + d.id, `${d.name}, ${d.title}`, `No ano ${d.born}, ${d.name} desceu das nuvens.`, { kind: 'monstro' });
    G.Lore && G.Lore.append && G.Lore.append('dragon:' + d.id, killer ? `No ano ${S.day}, ${killer.name}${f ? ', de ' + f.name : ''}, matou o dragão ${landed(d) ? 'no próprio covil' : 'em pleno voo'}. Desde então ${killer.g === 'f' ? 'a chamam de Matadora' : 'o chamam de Matador'} de Dragões.` : `No ano ${S.day}, o dragão caiu do céu${w ? ' perto de ' + w : ''}${byGod ? ', fulminado pelos deuses' : ''}.`);
    if (d.hoard > 0) {
      txt += water ? ` Seu tesouro — ${Math.round(d.hoard)} moedas — afundou com ele.` : ` Seu tesouro — ${Math.round(d.hoard)} moedas — se esparramou pelo chão!`;
      if (!water && P.spillGold) P.spillGold(d.x, d.y, d.hoard, f ? f.id : (G.Fac.ownerAt(d.x, d.y) || 0), d.name);
      d.spilt = d.hoard; d.hoard = 0;
    }
    log(txt, 'war', d.x, d.y);
    P.witness(d.x, d.y, 22, 6, 0);
    for (const v of S.villagers.values()) if (hunting(v, d)) { G.Vg.emote(v, 'happy', 3); G.Vg.endTask(v); }
  }
  function leaving(d) { G.Audio && G.Audio.at(d.x, d.y, 'roar', true); }
  function gone(d) {
    const S = G.S;
    log(`${d.name}, ${d.title}, voou para além do horizonte${d.hoard >= 1 ? ` levando ${Math.round(d.hoard)} moedas` : ''}. Ninguém sabe se voltará.`, 'fire', G.clamp(d.x, 1, N - 1), G.clamp(d.y, 1, N - 1));
    G.Lore && G.Lore.note('dragonGone', { name: d.name, hoard: d.hoard });
    G.Lore && G.Lore.append && G.Lore.append('dragon:' + d.id, `Queimou ${d.burned} ${d.burned === 1 ? 'lugar' : 'lugares'}${d.killed ? ', matou ' + d.killed + (d.killed > 1 ? ' pessoas' : ' pessoa') : ''} e partiu no ano ${S.day}${d.hoard >= 1 ? ', levando ' + Math.round(d.hoard) + ' moedas de ouro' : ''}. Os velhos ainda olham para o céu antes de dormir.`);
    d.left = d.hoard; d.hoard = 0;
    for (const v of S.villagers.values()) if (hunting(v, d)) G.Vg.endTask(v);
  }

  // ------------------------------ tasks, update, save ------------------------------
  const E = G.Eco;
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'dragao') return runDragao(v, t, dt, H), true; return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'dragao') { const d = (G.S.dragons || []).find(q => q.id === t.id); return t.st === 3 ? `Esperando os outros bravos perto do covil de ${d ? d.name : 'um dragão'}` : t.st < 2 ? `Subindo ao covil de ${d ? d.name : 'um dragão'} para matá-lo` : `Lutando contra o dragão ${d ? d.name : ''}!`; }
    return oldText(v, t);
  };
  const prevUpd = P.updateMiracles;
  P.updateMiracles = function (dt) { if (prevUpd) prevUpd(dt); if (G.S.dragons && G.S.dragons.length) update(dt); else if (shots.length) shots.length = 0; };
  // (what is only seen: the arrows in the air, the breath on the ground — not saved, gone with a new world)
  const shots = [];
  G.worldHooks.push(() => { shots.length = 0; });
  G.saveHooks = G.saveHooks || [];
  G.saveHooks.push({
    save(out) { if (G.S.dragons && G.S.dragons.length) out.dragons = G.S.dragons; if (G.S.dragonBones && G.S.dragonBones.length) out.dragonBones = G.S.dragonBones; },
    load(o) {
      const S = G.S; const fin = Number.isFinite; const ST = { chega: 1, caca: 1, passe: 1, curva: 1, rouba: 1, volta: 1, dorme: 1, luta: 1, parte: 1, morre: 1 };
      // (a damaged dragon is lost, not the world; a fight does not survive a save: it wakes or sleeps on)
      S.dragons = Array.isArray(o.dragons) ? o.dragons.filter(d => d && fin(d.x) && fin(d.y) && fin(d.h) && fin(d.hp) && fin(d.lx) && fin(d.ly) && ST[d.st] && W.inb(d.lx, d.ly)).map(d => Object.assign(d, { hoard: fin(d.hoard) && d.hoard > 0 ? d.hoard : 0, hurt: d.hurt && typeof d.hurt === 'object' ? d.hurt : {}, by: d.by && typeof d.by === 'object' ? d.by : {}, hue: HUES[d.hue] ? d.hue : 0 })).slice(0, MAX + 1) : [];
      S.dragonBones = Array.isArray(o.dragonBones) ? o.dragonBones.filter(b => b && fin(b.x) && fin(b.y) && W.inb(b.x, b.y)).slice(-6) : [];
    },
  });

  // ------------------------------ drawing ------------------------------
  // the dragon is drawn as a body in the world: each point (forward, right, up), in tiles, around its centre
  function frame(proj, d, x, y, h, hd) {
    const cx = Math.cos(hd), sx = Math.sin(hd);
    return (f, r, u) => proj(x + cx * f - sx * r, y + sx * f + cx * r, h + u * 4);
  }
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]); ctx.closePath(); }
  function drawBody(ctx, proj, d, x, y, h, hd, t, mode, sc) {
    const C = HUES[d.hue] || HUES[0]; const K = sc || 1;
    const Pt = frame(proj, d, x, y, h, hd);
    // (on the ground: its own shadow under it, so it sits on the land and does not float over it)
    if (mode !== 'fly') { const c = Pt(-0.3 * K, 0, 0); ctx.fillStyle = 'rgba(10,10,20,0.28)'; ctx.beginPath(); ctx.ellipse(c[0], c[1], 34 * K, 13 * K, 0, 0, TAU); ctx.fill(); }
    const sleeping = mode === 'sleep', fallen = mode === 'dead';
    // the wings: up and down in a slow, heavy beat; folded along the back on the ground
    const beat = mode === 'fly' ? Math.sin(t * (d.st === 'passe' ? 3 : 4.6) + d.id) : 0;
    const glide = d.st === 'passe' ? 0.35 : 1;
    for (const side of [-1, 1]) {
      let W8;
      if (mode === 'fly' || mode === 'fight') {
        const up = (mode === 'fight' ? 0.9 + Math.sin(t * 6) * 0.3 : beat * glide) * K;
        W8 = [[0.35, 0.15, 0], [0.25, 1.0, up * 0.45], [0.15, 1.75, up * 0.95], [-0.5, 2.25, up * 1.15], [-0.7, 1.65, up * 0.9], [-0.62, 1.0, up * 0.5], [-0.25, 0.16, 0]];
      } else W8 = [[0.35, 0.16, 0.1], [0.05, 0.5, 0.28], [-0.5, 0.56, 0.2], [-0.88, 0.24, 0.08], [-0.3, 0.12, 0.1]];
      const pts = W8.map(q => Pt(q[0] * K, q[1] * side * K, q[2] * K + (mode === 'fly' ? 0 : 0.18 * K)));
      // (a bat's wing: a straight bone in front, and between the fingers the membrane sags in scallops)
      const open = mode === 'fly' || mode === 'fight';
      const wing = () => {
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let j = 1; j < pts.length; j++) {
          const a = pts[j - 1], b = pts[j];
          if (open && j >= 4) { const c = Pt(((W8[j - 1][0] + W8[j][0]) / 2 + 0.16) * K, (W8[j - 1][1] + W8[j][1]) / 2 * 0.86 * side * K, (W8[j - 1][2] + W8[j][2]) / 2 * K); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]); }
          else ctx.lineTo(b[0], b[1]);
          void a;
        }
        ctx.closePath();
      };
      ctx.fillStyle = C.wing; ctx.globalAlpha = fallen ? 0.6 : 0.95; wing(); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.dark; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; wing(); ctx.stroke();
      if (mode === 'fly' || mode === 'fight') {
        // (the membrane between the fingers catches the light, a little lighter near the bone)
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; poly(ctx, [pts[1], pts[2], pts[3], pts[4]]); ctx.fill();
        ctx.strokeStyle = C.dark; ctx.lineWidth = 1.7; ctx.beginPath(); for (const j of [3, 4, 5]) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[j][0], pts[j][1]); } ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.stroke();
      }
    }
    // the body: a spine from the tail to the snout, swaying; thick at the chest
    const sway = (s) => (sleeping || fallen ? Math.sin(s * 2.2 + 1) * 0.55 * (s < 0 ? -s : 0) : Math.sin(t * 2.2 + s * 2.4 + d.id) * 0.16 * (1 - s));
    const width = s => s < -1.5 ? 0.02 : s < 0 ? 0.04 + (s + 1.5) / 1.5 * 0.3 : s < 0.55 ? 0.34 - s * 0.32 : s < 1.05 ? 0.15 : 0.15 + (s - 1.05) * 0.2;
    const lift = s => (mode === 'fly' ? 0 : 0.25 + (s > 0.6 && !sleeping && !fallen ? (s - 0.6) * 1.3 : 0) + (sleeping && s > 0.6 ? -0.15 : 0)) * K;
    const L = [], R = [];
    for (let s = -2.1; s <= 1.36; s += 0.12) { const r = sway(s), w = width(s); L.push(Pt(s * K, (r - w) * K, lift(s))); R.push(Pt(s * K, (r + w) * K, lift(s))); }
    const outline = L.concat(R.reverse());
    ctx.fillStyle = C.body; poly(ctx, outline); ctx.fill();
    ctx.strokeStyle = C.dark; ctx.lineWidth = 1.2; poly(ctx, outline); ctx.stroke();
    // (the belly and the back: lighter scales down the middle, a dark ridge of spines)
    ctx.strokeStyle = C.belly; ctx.globalAlpha = 0.75; ctx.lineWidth = 2.2 * K; ctx.beginPath();
    for (let s = -1.2; s <= 1.0; s += 0.12) { const p = Pt(s * K, sway(s) * K, lift(s) + 0.05 * K); if (s === -1.2) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = C.dark;
    for (let s = -1.6; s <= 0.9; s += 0.22) { const a = Pt(s * K, sway(s) * K, lift(s) + 0.08 * K), b = Pt((s - 0.12) * K, sway(s) * K, lift(s) + 0.3 * K), c = Pt((s - 0.2) * K, sway(s) * K, lift(s) + 0.08 * K); poly(ctx, [a, b, c]); ctx.fill(); }
    // the head: horns, an eye that burns (shut in sleep), the jaw open when it breathes
    const hs = 1.36, hr = sway(hs);
    const open = d.breath ? 0.12 : 0;
    const head = [Pt(hs * K, (hr - 0.15) * K, lift(hs)), Pt((hs + 0.42) * K, (hr - 0.05 - open) * K, lift(hs) - 0.05 * K), Pt((hs + 0.48) * K, hr * K, lift(hs)), Pt((hs + 0.42) * K, (hr + 0.05 + open) * K, lift(hs) - 0.05 * K), Pt(hs * K, (hr + 0.15) * K, lift(hs))];
    ctx.fillStyle = C.body; poly(ctx, head); ctx.fill(); ctx.strokeStyle = C.dark; ctx.lineWidth = 1.1; poly(ctx, head); ctx.stroke();
    ctx.fillStyle = C.belly;
    for (const side of [-1, 1]) { const a = Pt((hs + 0.05) * K, (hr + side * 0.1) * K, lift(hs) + 0.1 * K), b = Pt((hs - 0.35) * K, (hr + side * 0.2) * K, lift(hs) + 0.42 * K), c = Pt((hs - 0.05) * K, (hr + side * 0.05) * K, lift(hs) + 0.12 * K); poly(ctx, [a, b, c]); ctx.fill(); }
    const eye = Pt((hs + 0.18) * K, hr * K, lift(hs) + 0.12 * K);
    if (fallen) { ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(eye[0] - 2, eye[1] - 1); ctx.lineTo(eye[0] + 2, eye[1] + 1); ctx.moveTo(eye[0] + 2, eye[1] - 1); ctx.lineTo(eye[0] - 2, eye[1] + 1); ctx.stroke(); }
    else if (sleeping) { ctx.strokeStyle = C.dark; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(eye[0] - 2.4, eye[1]); ctx.lineTo(eye[0] + 2.4, eye[1]); ctx.stroke(); }
    else { ctx.fillStyle = C.eye; ctx.beginPath(); ctx.arc(eye[0], eye[1], 1.7 * K, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(eye[0] - 0.4, eye[1] - 1.2 * K, 0.8, 2.4 * K); }
    // (legs on the ground: four short claws under it)
    if (mode !== 'fly') { ctx.fillStyle = C.dark; for (const [f, r] of [[0.45, -0.36], [0.45, 0.36], [-0.45, -0.32], [-0.45, 0.32]]) { const a = Pt(f * K, (sway(f) + r) * K, 0), b = Pt((f + 0.15) * K, (sway(f) + r * 0.6) * K, 0.3 * K), c = Pt((f - 0.15) * K, (sway(f) + r * 0.6) * K, 0.3 * K); poly(ctx, [a, b, c]); ctx.fill(); } }
    return Pt((hs + 0.5) * K, hr * K, lift(hs));
  }
  // the breath: from the jaws down to the burning line, white near the mouth, red and smoke at the end
  function drawFire(ctx, mouth, to, t, ice, k) {
    const n = 26;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < n; j++) {
      const u = ((j / n) + t * 2.6) % 1; const fl = G.hash(j * 31 + Math.floor(t * 18));
      const x = mouth[0] + (to[0] - mouth[0]) * u + (fl - 0.5) * 10 * u, y = mouth[1] + (to[1] - mouth[1]) * u + (G.hash(j * 17 + Math.floor(t * 18)) - 0.5) * 8 * u;
      const r = (3 + u * 15) * (0.7 + fl * 0.6) * (k || 1);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      if (ice) { g.addColorStop(0, `rgba(240,252,255,${0.9 - u * 0.5})`); g.addColorStop(0.5, `rgba(140,210,255,${0.6 - u * 0.4})`); g.addColorStop(1, 'rgba(80,140,220,0)'); }
      else { g.addColorStop(0, `rgba(255,250,210,${0.95 - u * 0.5})`); g.addColorStop(0.4, `rgba(255,170,40,${0.75 - u * 0.4})`); g.addColorStop(1, 'rgba(200,40,10,0)'); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  // the shadow on the ground: the shape of the wings, fainter the higher it flies
  const prevDG = P.drawGround;
  P.drawGround = function (ctx, proj, t) {
    if (prevDG) prevDG(ctx, proj, t);
    const L = G.S.dragons; if (!L || !L.length) return;
    for (const d of L) {
      if (landed(d) || (d.st === 'morre' && d.fallen)) continue;
      const g = W.inb(d.x, d.y) ? W.groundH(d.x, d.y) : G.SEA;
      const a = G.clamp(0.42 - d.alt * 0.008, 0.08, 0.42), s = 1 + Math.min(d.alt, 40) * 0.012;
      const Pt = frame(proj, d, d.x + d.alt * 0.18, d.y + d.alt * 0.18, g, d.hd);
      ctx.fillStyle = `rgba(10,12,20,${a})`;
      poly(ctx, [Pt(1.8 * s, 0, 0), Pt(0.3 * s, 2.2 * s, 0), Pt(-0.6 * s, 1.6 * s, 0), Pt(-2.2 * s, 0, 0), Pt(-0.6 * s, -1.6 * s, 0), Pt(0.3 * s, -2.2 * s, 0)]); ctx.fill();
    }
  };
  // in the air, above everything: the dragons flying, the arrows, the fire
  const prevDW = P.drawWorld;
  P.drawWorld = function (ctx, proj, t) {
    if (prevDW) prevDW(ctx, proj, t);
    const L = G.S.dragons; if (!L || !L.length) return;
    for (const q of shots) {
      if (q.k !== 'arrow') continue;
      const u = q.t / 0.6; const a = proj(q.x0 + (q.x1 - q.x0) * u, q.y0 + (q.y1 - q.y0) * u, q.h0 + (q.h1 - q.h0) * u), b = proj(q.x0 + (q.x1 - q.x0) * (u + 0.08), q.y0 + (q.y1 - q.y0) * (u + 0.08), q.h0 + (q.h1 - q.h0) * (u + 0.08));
      ctx.strokeStyle = 'rgba(60,40,20,0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (const d of L) {
      if (landed(d) || (d.st === 'morre' && d.fallen)) continue;
      const mouth = drawBody(ctx, proj, d, d.x, d.y, d.h, d.hd, t, 'fly', 1.55);
      if (d.breath) { const g = W.inb(d.x, d.y) ? W.groundH(d.x + Math.cos(d.hd) * 1.6, d.y + Math.sin(d.hd) * 1.6) : G.SEA; drawFire(ctx, mouth, proj(d.x + Math.cos(d.hd) * 1.8, d.y + Math.sin(d.hd) * 1.8, g), t, HUES[d.hue].breath === 'gelo'); }
    }
    for (const q of shots) {
      if (q.k !== 'breath') continue;
      // (the ground where the breath fell keeps burning a moment)
      const p = proj(q.x, q.y, W.groundH(q.x, q.y)); const k = 1 - q.t / 1.1;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 14 * k + 4); g.addColorStop(0, `rgba(255,200,90,${0.55 * k})`); g.addColorStop(1, 'rgba(255,80,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p[0], p[1], 16 * k + 4, 8 * k + 2, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  };
  // on the ground (asleep at the lair, fighting, fallen; the bones): in the painter's order, among the trees and houses
  const draws = new Map(); G.worldHooks.push(() => draws.clear());
  const wrap = (o, fn) => { let e = draws.get(o); if (!e) { e = { t: 13, o, fn }; draws.set(o, e); } return e; };
  function drawLanded(ctx, e, sx, sy, t) {
    const d = e.o; const proj = G.Render.proj;
    // (the hoard under it glitters)
    if (d.hoard > 0) { const n = Math.min(40, 6 + d.hoard / 4); for (let j = 0; j < n; j++) { const a = G.hash(j * 7 + d.id) * TAU, r = Math.sqrt(G.hash(j * 13 + d.id)) * 1.3; const p = proj(d.x + Math.cos(a) * r, d.y + Math.sin(a) * r, W.groundH(d.x, d.y)); ctx.fillStyle = G.hash(j + Math.floor(t * 3)) < 0.15 ? '#fff6c0' : '#d9a826'; ctx.fillRect(p[0] - 1.2, p[1] - 1, 2.4, 1.8); } }
    const mode = d.st === 'morre' ? 'dead' : d.st === 'luta' ? 'fight' : 'sleep';
    const mouth = drawBody(ctx, proj, d, d.x, d.y, W.groundH(d.x, d.y), d.hd, t, mode, 1.35);
    if (mode === 'fight' && G.S.clock - (d.ft || -9) < 0.8) drawFire(ctx, mouth, proj(d.x + Math.cos(d.hd) * 2.4, d.y + Math.sin(d.hd) * 2.4, W.groundH(d.x, d.y)), t, HUES[d.hue].breath === 'gelo', 0.7);
    if (mode === 'sleep') { const k = (t * 0.6 + d.id) % 1; ctx.fillStyle = `rgba(120,120,120,${0.5 * (1 - k)})`; ctx.beginPath(); ctx.arc(mouth[0] + k * 6, mouth[1] - 4 - k * 14, 2 + k * 4, 0, TAU); ctx.fill(); }
  }
  function drawBones(ctx, e, sx, sy, t) {
    const b = e.o; const proj = G.Render.proj; const Pt = frame(proj, b, b.x, b.y, W.groundH(b.x, b.y), b.hd);
    ctx.strokeStyle = '#e8e0cc'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let s = -2; s <= 1.2; s += 0.15) { const p = Pt(s, Math.sin(s * 2) * 0.3, 0.05); if (s === -2) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    ctx.stroke();
    // (the ribs, an arch over the spine)
    ctx.lineWidth = 1.2;
    for (let s = -0.6; s <= 0.6; s += 0.2) for (const side of [-1, 1]) { const a = Pt(s, Math.sin(s * 2) * 0.3, 0.05), m = Pt(s - 0.05, Math.sin(s * 2) * 0.3 + side * 0.32, 0.38), c = Pt(s - 0.1, Math.sin(s * 2) * 0.3 + side * 0.42, 0.02); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(m[0], m[1], c[0], c[1]); ctx.stroke(); }
    // (the wing bones, long fingers on the ground)
    for (const side of [-1, 1]) { const a = Pt(0.25, side * 0.2, 0.05); for (const [f, r] of [[0.1, 1.8], [-0.5, 2.1], [-0.7, 1.4]]) { const c = Pt(f, side * r, 0.02); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); } }
    const sk = Pt(1.4, Math.sin(2.8) * 0.3, 0.1); ctx.fillStyle = '#ece4d0'; ctx.beginPath(); ctx.ellipse(sk[0], sk[1], 5, 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.arc(sk[0] + 1, sk[1] - 0.5, 1, 0, TAU); ctx.fill();
  }
  G.renderHooks.ents.push(function (add) {
    const S = G.S;
    for (const d of S.dragons || []) if (landed(d) || (d.st === 'morre' && d.fallen)) add(d.x + d.y + 0.6, wrap(d, drawLanded), d.x, d.y);
    for (const b of S.dragonBones || []) add(b.x + b.y + 0.3, wrap(b, drawBones), b.x, b.y);
  });
  // at night the fire lights the dark, and the eyes shine
  const prevGlow = P.drawGlow;
  P.drawGlow = function (ctx, proj, t, nightF) {
    if (prevGlow) prevGlow(ctx, proj, t, nightF);
    const L = G.S.dragons; if (!L || !L.length || nightF < 0.1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const d of L) {
      if (!d.breath && !(landed(d) && G.S.clock - (d.ft || -9) < 0.8)) continue;
      const p = proj(d.x + Math.cos(d.hd) * 1.6, d.y + Math.sin(d.hd) * 1.6, landed(d) ? W.groundH(d.x, d.y) : (d.h + W.groundH(d.x, d.y)) / 2);
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 90); g.addColorStop(0, `rgba(255,160,60,${0.45 * nightF})`); g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], 90, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };
})(window.G);
