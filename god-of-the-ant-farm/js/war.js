'use strict';
// ============================================================
//  War: warriors, war bands, battles, raids, conquest,
//  massacres, watchtowers, captives & forced labour, escapes,
//  revolts — plus the task machines of envoys and caravans
// ============================================================
(function (G) {
  let N = G.N; const T = G.T, W = G.W;
  G.mapHooks.push(n => { N = n; });
  const Wr = G.War = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  Wr.bands = new Map();
  Wr.battles = [];
  Wr.clock = 0;
  Wr.warFacs = new Set();
  Wr.fighters = []; Wr.escapers = [];
  Wr.armory = new Set();
  Wr.smith = new Set();
  let nextBand = 1;
  const reach = new Map();

  // is there fighting at a town, or an army about to reach it? festivals, fairs and games wait for it to pass
  Wr.threat = function (setId) { return !!Wr.threatWhy(setId); };
  Wr.threatWhy = function (setId) {
    const S = G.S; const set = S.settlements.get(setId); if (!set) return '';
    if (set.alarmT > 0) return 'alarm'; if (set.larder) return 'siege';
    const R0 = (set.radius || 8) + 6;
    for (const b of Wr.bands.values()) {
      if (b.set !== setId || b.st === 'retorno' || b.members.length < 3) continue;
      if (b.goal === 'defesa') { if (b.army && b.army.phase === 'batalha') return 'battle'; continue; }
      if (b.st === 'ataque') return 'attack';
      if (b.st === 'marcha') { const lead = S.villagers.get(b.army ? b.army.gen : b.members[0]); if (lead && G.dist(lead.x, lead.y, set.cx, set.cy) < R0 + 10) return 'march'; }
    }
    // a real fight at its doors (not a lone skirmish, not a ship sinking off the coast)
    for (const bt of Wr.battles) { if (Wr.clock - bt.last > 20) continue; let n = 0; for (const k in bt.dead) n += bt.dead[k]; if (n >= 3 && G.dist(bt.x, bt.y, set.cx, set.cy) < R0 && S.type[W.idx(bt.x, bt.y)] > T.RIVER) return 'fight'; }
    return '';
  };
  Wr.reset = function () { Wr.bands.clear(); Wr.battles.length = 0; reach.clear(); Wr.warFacs.clear(); Wr.fighters.length = 0; Wr.escapers.length = 0; };
  Wr.GOAL = { saque: 'para saquear', captura: 'para fazer cativos', conquista: 'para conquistar', massacre: 'sem intenção de deixar sobreviventes' };

  // ------------------------------ helpers ------------------------------
  const fid = v => G.Fac.idOfV(v);
  const hostile = (a, b) => G.Fac.atWar(a, b);
  const busyDiplomat = o => o.task && (o.task.type === 'envoy' || o.task.type === 'trade');
  const fighting = o => o.task && (o.task.type === 'combat' || o.task.type === 'band');
  function reachable(a, b) {
    const k = a.id + '>' + b.id; const c = reach.get(k);
    if (c && c.day === G.S.day) return c.ok;
    const ok = !!W.findPath(a.cx, a.cy, b.cx, b.cy, true, N * N);
    reach.set(k, { day: G.S.day, ok });
    return ok;
  }
  function spotNear(x, y, r) { const p = W.randomNear(x, y, r); return p || W.nearestLand(x, y, r + 3); }
  Wr.penOf = function (setId) { for (const b of G.S.buildings.values()) if (b.type === 'cercado' && b.built && b.set === setId) return b; return null; };
  Wr.captivesOf = function (f) { let n = 0; for (const v of G.S.villagers.values()) if (v.captive && fid(v) === f) n++; return n; };
  Wr.captivesBetween = function (a, b) { let n = 0; for (const v of G.S.villagers.values()) if (v.captive && ((v.captive.from === a && fid(v) === b) || (v.captive.from === b && fid(v) === a))) n++; return n; };
  Wr.warriorsOf = function (f) { let n = 0; for (const v of G.S.villagers.values()) if (v.role === 'guerreiro' && !v.captive && fid(v) === f) n++; return n; };
  function adultFree(o) { return !o.captive && o.age >= 16 && o.age < 62; }

  // ------------------------------ warriors wanted per village ------------------------------
  Wr.warriorWant = function (set, fac, A) {
    if (A < 5) return 0;
    const metAny = G.Fac.all().some(o => o.id !== fac.id && G.Fac.rel(fac.id, o.id) && G.Fac.rel(fac.id, o.id).met);
    if (!metAny && fac.gov !== 'tirania') return 0;
    const pe = G.Politics.leaderPe(fac);
    const atWar = G.Fac.enemiesOf(fac.id).length > 0;
    let share = atWar ? 0.22 + pe.agg * 0.18 : 0.03 + pe.agg * 0.07;
    if (fac.gov === 'tirania') share += 0.06;
    if (G.Fac.has(fac.id, 'quartel')) share += 0.04;
    if (fac.weariness > 60) share *= 0.7;
    // an army marches on its stomach: hungry peoples send soldiers back to the fields
    const pop = G.Fac.pop(fac.id);
    if (fac.stock.food < pop * 1.2) share *= fac.stock.food < pop * 0.5 ? 0.3 : 0.6;
    return Math.min(Math.floor(A * 0.45), Math.round(A * share));
  };

  // ------------------------------ bands ------------------------------
  Wr.chooseGoal = function (f, enemy, set, n) {
    const pe = G.Politics.leaderPe(f); const r = G.Fac.rel(f.id, enemy.id);
    let defenders = 0; for (const v of G.S.villagers.values()) if (v.set === set.id && adultFree(v)) defenders++;
    if (f.law !== 'paz' && pe.cru > 0.72 && ((r && r.grudge > 35) || f.gov === 'tirania') && G.R() < 0.6) return 'massacre';
    // each culture has its way of war
    if (G.Civ.t(f.id, 'capture') > 1.5 && G.R() < 0.55) return 'captura';
    if (G.Civ.t(f.id, 'raid') > 1.2 && G.R() < 0.45) return 'saque';
    if (G.Civ.t(f.id, 'assimilate') > 1.5 && n >= defenders * 1.1 && G.Fac.settlementsOf(f.id).length < 7 && G.R() < 0.55) return 'conquista';
    if (n >= defenders * 1.3 && pe.amb > 0.45 && G.Fac.settlementsOf(f.id).length < 5 && G.R() < 0.7) return 'conquista';
    if (pe.cru > 0.45 && f.gov !== 'conselho' && f.gov !== 'livre' && G.R() < 0.55) return 'captura';
    if (f.stock.food < G.Fac.pop(f.id) * 0.8) return 'saque';
    const strong = n >= defenders * 0.9;
    return G.pick(f.gov === 'conselho' || f.gov === 'livre' ? (strong ? ['saque', 'conquista'] : ['saque']) : (strong ? ['saque', 'captura', 'conquista'] : ['saque', 'saque', 'captura']));
  };
  Wr.launch = function (f, enemy, opts) {
    const S = G.S; opts = opts || {};
    // the sacred truce of the Games: no Greek marches while they are held
    if (f.truce > S.clock || (enemy.truce > S.clock && f.civ === 'grego')) return null;
    let best = null, bd = 1e9, from = null;
    for (const s of G.Fac.settlementsOf(enemy.id)) for (const o of G.Fac.settlementsOf(f.id)) { const d = G.dist(s.cx, s.cy, o.cx, o.cy); if (d < bd) { bd = d; best = s; from = o; } }
    // across the water (or by choice, for sea raiders) the war goes by ship
    const byLand = best && from && reachable(from, best);
    // (a long march along the coast is often shorter by sea)
    const seaWay = byLand && bd > 30 && G.City && G.City.coastal(best) && G.City.coastal(from) && G.R() < 0.3;
    if (G.Naval && (!byLand || seaWay || (G.Civ.t(f.id, 'raid') > 1.2 && G.R() < 0.35)) && G.Naval.canSail(f)) { const sh = G.Naval.launchRaid(f, enemy, opts); if (sh || !byLand) return sh ? { id: 0, ship: sh.id, naval: true } : null; }
    if (!best || !from || !byLand) return null;
    const cands = [];
    for (const v of S.villagers.values()) {
      if (v.captive || v.age < 16 || v.age >= 58 || v.hp < 55 || v.preg > 0 || v.held || v.air) continue;
      if (fid(v) !== f.id || v.id === f.leader && !opts.all) continue;
      if (v.task && (v.task.type === 'band' || v.task.type === 'combat' || busyDiplomat(v) || v.task.pri >= 4)) continue;
      if (G.dist(v.x, v.y, from.cx, from.cy) > (G.Army ? 60 : 32)) continue; // a host is levied from the whole region
      const w = v.role === 'guerreiro' ? 3 : (v.role === 'cacador' ? 1.5 : 0) + v.courage + (v.fury > 0 ? 3 : 0);
      cands.push([w, v]);
    }
    cands.sort((a, b) => b[0] - a[0]);
    const pe = G.Politics.leaderPe(f);
    const warriors = cands.filter(c => c[1].role === 'guerreiro').length;
    let defenders = 0; for (const v of S.villagers.values()) if (v.set === best.id && adultFree(v)) defenders++;
    let size;
    if (G.Army) size = G.Army.size(f, cands, best, opts, pe, defenders);
    else { size = Math.max(warriors, Math.round(cands.length * (0.22 + pe.agg * 0.25)), Math.min(4, cands.length)); if (opts.size) size = opts.size; size = Math.min(size, 18, cands.length); }
    if (size < 3) return null;
    // only fools attack a much larger village (unless a god is pushing them)
    if (!opts.fury && size < defenders * (0.55 - pe.agg * 0.2)) return null;
    const members = cands.slice(0, size).map(c => c[1]);
    if (opts.target) { const tg = S.settlements.get(opts.target); if (tg && tg.fac === enemy.id) best = tg; }
    const goal = opts.goal || Wr.chooseGoal(f, enemy, best, members.length);
    const ang = Math.atan2(best.cy - from.cy, best.cx - from.cx);
    const rally = spotNear(from.cx + Math.cos(ang) * 3, from.cy + Math.sin(ang) * 3, 2) || [from.cx, from.cy];
    const rad = (best.radius || 8) * 0.8;
    const stage = spotNear(best.cx - Math.cos(ang) * rad, best.cy - Math.sin(ang) * rad, 2) || [best.cx, best.cy];
    const b = {
      id: nextBand++, fac: f.id, enemy: enemy.id, set: best.id, from: from.id, goal, st: 'reunir', t: 0, life: 0,
      members: members.map(v => v.id), start: members.length, kills: 0, lost: 0, captives: 0, loot: { food: 0, wood: 0, stone: 0 }, burned: 0, quiet: 0,
      rx: rally[0], ry: rally[1], tx: stage[0], ty: stage[1], fury: !!opts.fury,
    };
    Wr.bands.set(b.id, b);
    members.forEach((v, k) => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'band', band: b.id, pri: 3.2, kind: 'band', flag: k === 0 }); G.Life && G.Life.bio(v, 'war', enemy.name, best.name); });
    f.attackCD = G.rr(120, 200) * (1.2 - pe.agg * 0.5);
    // a real host: companies, officers, formations and a plan
    if (G.Army && members.length >= 8) G.Army.organize(b, members, f, enemy, best, from, opts);
    return b;
  };
  Wr.makeBand = function (f, enemy, set, members, goal, o) {
    o = o || {};
    const b = {
      id: nextBand++, fac: f.id, enemy: enemy.id, set: set.id, from: o.from || set.id, goal, st: o.landed ? 'ataque' : 'reunir', t: 0, life: 0,
      members: members.map(v => v.id), start: members.length, kills: 0, lost: 0, captives: 0, loot: { food: 0, wood: 0, stone: 0 }, burned: 0, quiet: 0,
      rx: set.cx, ry: set.cy, tx: set.cx, ty: set.cy, fury: !!o.fury, ship: o.ship || 0, reached: !!o.landed,
    };
    Wr.bands.set(b.id, b);
    members.forEach((v, k) => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'band', band: b.id, pri: 3.2, kind: 'band', flag: k === 0 }); if (G.Life) { if (goal === 'defesa') G.Life.bio(v, 'defend', set.name, enemy.name); else G.Life.bio(v, 'war', enemy.name, set.name); } });
    return b;
  };
  Wr.disband = function (b, silent) {
    const S = G.S; if (!Wr.bands.has(b.id)) return;
    Wr.bands.delete(b.id);
    G.Siege && G.Siege.onDisband(b);
    G.Army && G.Army.onDisband(b);
    const ship = b.ship && G.Naval && G.Naval.aboard(b.ship);
    for (const id of b.members) {
      const v = S.villagers.get(id);
      if (v && v.task && v.task.type === 'band' && v.task.band === b.id) {
        // raiders who came by sea walk back to their ship
        if (ship && ship.st === 'wait') { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'boardBack', ship: ship.id, pri: 3.1, kind: 'boardBack' }); continue; }
        if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, fid(v)); v.carry = null; } G.Vg.endTask(v);
      }
    }
    const f = G.Fac.get(b.fac), en = G.Fac.get(b.enemy), set = S.settlements.get(b.set);
    if (f) f.attackCD = Math.max(f.attackCD || 0, G.rr(110, 190));
    if (silent || !b.reached || !f) return;
    const loot = b.loot.food + b.loot.wood + b.loot.stone;
    const bits = [];
    if (b.kills) bits.push(`${b.kills} ${b.kills > 1 ? 'inimigos mortos' : 'inimigo morto'}`);
    if (b.captives) bits.push(`${b.captives} ${b.captives > 1 ? 'cativos' : 'cativo'}`);
    if (loot) bits.push(`${loot} em saque`);
    if (b.lost) bits.push(`${b.lost} ${b.lost > 1 ? 'guerreiros perdidos' : 'guerreiro perdido'}`);
    log(`${b.retreat ? 'Derrotado, o' : 'O'} ataque de ${f.name}${set ? ' a ' + set.name : en ? ' contra ' + en.name : ''} terminou${bits.length ? ': ' + bits.join(', ') : ''}.`, 'war', set ? set.cx : undefined, set ? set.cy : undefined);
  };
  Wr.disbandAll = function () { for (const b of [...Wr.bands.values()]) Wr.disband(b, true); };
  Wr.onWar = function (a, b) { Wr.warFacs.add(a.id); Wr.warFacs.add(b.id); };
  Wr.onPeace = function (a, b) {
    for (const band of [...Wr.bands.values()]) if ((band.fac === a.id && band.enemy === b.id) || (band.fac === b.id && band.enemy === a.id)) { band.st = 'retorno'; band.t = 0; }
  };
  Wr.onExtinct = function (f) { for (const band of [...Wr.bands.values()]) if (band.fac === f.id) Wr.disband(band, true); else if (band.enemy === f.id) { band.st = 'retorno'; band.t = 0; } };

  function bandUpdate(b, dt) {
    const S = G.S;
    b.t += dt; b.life += dt;
    const before = b.members.length;
    b.members = b.members.filter(id => { const v = S.villagers.get(id); return v && v.task && v.task.type === 'band' && v.task.band === b.id && fid(v) === b.fac; });
    for (let k = b.members.length; k < before; k++) { /* casualties counted in noteDeath */ }
    const f = G.Fac.get(b.fac), en = G.Fac.get(b.enemy), set = S.settlements.get(b.set);
    const alive = b.members.length;
    if (!f || !f.alive || !alive) { Wr.disband(b); return; }
    // hosts follow their general's plan; the old ways take over for plunder and the road home
    if (b.army && b.life < 420 && G.Army.bandTick(b, dt, set, f, en)) return;
    if (b.goal === 'defesa') { if (b.life > 300 || !set || set.fac !== b.fac) Wr.disband(b, true); return; }
    if (b.st !== 'retorno' && (!en || !en.alive || !hostile(b.fac, b.enemy) || !set || set.fac !== b.enemy)) { b.st = 'retorno'; b.t = 0; }
    if (b.life > 260) { Wr.disband(b); return; }
    const lead = S.villagers.get(b.members[0]);
    switch (b.st) {
      case 'reunir': {
        let near = 0; for (const id of b.members) { const v = S.villagers.get(id); if (G.dist(v.x, v.y, b.rx, b.ry) < 3.5) near++; }
        if (near >= alive * 0.75 || b.t > 28) {
          b.st = 'marcha'; b.t = 0;
          log(`${f.name} marcha contra ${set.name} com ${alive} guerreiros, ${Wr.GOAL[b.goal]}.`, 'war', b.rx, b.ry);
          G.UI && G.UI.notice(`${f.name} marcha contra ${set.name}!`, 'war');
          G.Audio && G.Audio.at(b.rx, b.ry, 'horn', true);
        }
        break;
      }
      case 'marcha': {
        let arrived = false;
        for (const id of b.members) { const v = S.villagers.get(id); if (G.dist(v.x, v.y, set.cx, set.cy) < (set.radius || 8) * 0.95 + 1) { arrived = true; break; } }
        if (arrived || b.t > 150) {
          b.st = 'ataque'; b.t = 0; b.reached = true;
          set.alarmT = 30; set.attacked = (set.attacked || 0) + 1;
          const vf = G.UI && G.UI.viewFac;
          if (vf === b.enemy || vf === b.fac) G.UI.notice(`${set.name} está sendo atacada por ${f.name}!`, 'war');
          G.Audio && G.Audio.at(set.cx, set.cy, 'horn', true);
        }
        break;
      }
      case 'ataque': {
        let defenders = 0;
        const R2 = Math.pow((set.radius || 8) + 3, 2);
        for (const o of S.villagers.values()) {
          if (fid(o) !== b.enemy || o.captive || o.age < 16 || o.age >= 62 || o.hp < 25) continue;
          if (G.dist2(o.x, o.y, set.cx, set.cy) > R2) continue;
          if (o.task && (o.task.type === 'flee' || o.task.type === 'hide')) continue;
          if (o.inside) continue;
          defenders++;
        }
        let fightingUs = false; for (const id of b.members) { const v = S.villagers.get(id); if (v.task.foe) { fightingUs = true; break; } }
        G.Siege && G.Siege.bandSiege(b, set, dt);
        if (defenders <= Math.floor(alive / 6) && !fightingUs && !b.siege) b.quiet += dt; else b.quiet = Math.max(0, b.quiet - dt * 2);
        set.alarmT = Math.max(set.alarmT || 0, 5);
        if (alive < b.start * 0.4 || (defenders > alive * 2.2 && b.t > (b.siege ? 60 : 10))) {
          b.st = 'retorno'; b.t = 0; b.retreat = true;
          log(`${f.name} recuou de ${set.name}.`, 'war', set.cx, set.cy);
          en.st.battles++;
          break;
        }
        if (b.goal === 'conquista' && b.quiet > 6 && alive >= 3) { Wr.conquer(set, b); return; }
        if (b.goal === 'massacre') {
          let left = 0; for (const o of S.villagers.values()) if (o.set === set.id && !o.captive && o.age >= 2) left++;
          if ((left === 0 && b.t > 10) || b.t > 120 || (b.quiet > 25 && b.burned >= 2)) { Wr.finishMassacre(b, set, left); b.st = 'retorno'; b.t = 0; }
          break;
        }
        let done = true; for (const id of b.members) { const v = S.villagers.get(id); if (!v.carry && !v.task.gotCaptive) { done = false; break; } }
        const stock = en.stock.food + en.stock.wood + en.stock.stone;
        if ((b.quiet > 5 && (done || stock < 3)) || b.t > (b.siege ? 170 : 95) || (b.goal === 'conquista' && b.t > (b.siege ? 180 : 100))) { b.st = 'retorno'; b.t = 0; }
        break;
      }
      case 'retorno':
        if (b.t > 100) Wr.disband(b);
        break;
    }
    if (lead && b.st === 'marcha' && G.R() < dt * 0.3) G.FX && G.FX.dust(lead.x, lead.y, 1);
  }
  Wr.finishMassacre = function (b, set, left) {
    const S = G.S; const f = G.Fac.get(b.fac), en = G.Fac.get(b.enemy);
    const ruler = G.Politics.ruler(f);
    f.st.massacres++; S.stats.massacres = (S.stats.massacres || 0) + 1;
    log(`Massacre em ${set.name}: ${b.kills} mortos pelas mãos de ${f.name}${ruler ? ', sob ' + G.Politics.styled(f, ruler) : ''}.${left ? '' : ' Não restou ninguém.'}`, 'massacre', set.cx, set.cy);
    G.UI && G.UI.toast('Massacre', `${f.name} devastou ${set.name}.`, 'massacre');
    if (ruler) { G.Politics.earn(f, ruler, f.st.massacres >= 2 ? 'sanguinario' : 'cruel'); G.Politics.bump(ruler, 'cru', 0.08); }
    for (const o of G.Fac.all()) {
      if (o.id === f.id) continue;
      const r = G.Fac.rel(f.id, o.id); if (!r || !r.met) continue;
      if (o.id === b.enemy) { r.grudge = Math.min(100, r.grudge + 60); r.op -= 40; } else { r.op -= 20; r.grudge = Math.min(100, r.grudge + 10); }
    }
    for (const v of S.villagers.values()) if (fid(v) === b.enemy && !v.captive) { v.fear = Math.min(100, v.fear + 30); v.devotion = Math.min(100, v.devotion + 4); }
  };

  // ------------------------------ conquest ------------------------------
  Wr.conquer = function (set, b) {
    const S = G.S; const f = G.Fac.get(b.fac), old = G.Fac.get(set.fac);
    if (!f || !old || set.fac === f.id) return;
    const pe = G.Politics.leaderPe(f);
    const wasCapital = G.Fac.capitalOf(old.id) === set;
    const share = Math.min(0.8, G.Village.pop(set.id) / Math.max(1, G.Fac.pop(old.id)));
    for (const k of ['food', 'wood', 'stone']) { const n = Math.floor(old.stock[k] * share); old.stock[k] -= n; G.Village.addStock(k, n, f.id); b.loot[k] += n; }
    set.fac = f.id; set.origFac = old.id; set.conq = S.day; set.loyalty = 30; set.lowT = 0;
    let enslaved = 0, killed = 0, freed = 0;
    const killer = S.villagers.get(b.members[0]);
    for (const v of [...S.villagers.values()]) {
      if (v.set !== set.id) continue;
      if (v.captive) { if (v.captive.from === f.id) { v.captive = null; v.role = null; freed++; } continue; }
      if (pe.cru > 0.8 && v.age >= 16 && v.g === 'm' && G.R() < 0.6) { G.FX && G.FX.blood(v.x, v.y); G.Vg.damage(v, 999, 'massacre', false, killer ? killer.id : 0); killed++; continue; }
      // Romans make citizens of the vanquished; others make slaves
      const assim = G.Civ.t(f.id, 'assimilate') > 1.5;
      if ((pe.cru > (assim ? 0.75 : 0.5) || f.gov === 'tirania') && !(assim && G.R() < 0.6)) { Wr.enslave(v, old.id, set.id); enslaved++; }
    }
    const garrison = b.members.slice(0, Math.ceil(b.members.length * 0.4));
    for (const id of garrison) { const v = S.villagers.get(id); if (v) { v.set = set.id; v.home = 0; } }
    old.st.lost++; f.st.conquests++; old.weariness = Math.min(100, old.weariness + 30);
    S.stats.conquests = (S.stats.conquests || 0) + 1;
    const extra = [enslaved ? `${enslaved} foram feitos cativos` : '', killed ? `${killed} foram passados a fio de espada` : '', freed ? `${freed} cativos de ${f.name} foram libertados` : ''].filter(Boolean);
    log(`${set.name} caiu! Agora pertence a ${f.name}.${extra.length ? ' ' + G.cap(extra.join('; ')) + '.' : ''}`, 'war', set.cx, set.cy);
    G.UI && G.UI.toast('Conquista', `${f.name} tomou ${set.name}.`, 'war');
    G.Politics.earn(f, G.Politics.ruler(f), 'conquistador');
    Wr.disband(b, true);
    G.Fac.updateTerritory();
    if (!G.Fac.settlementsOf(old.id).length) G.Politics.extinct(old, f);
    else if (wasCapital) { old.capital = 0; const c = G.Fac.capitalOf(old.id); if (c) log(`${old.name} perdeu sua capital e se reagrupou em ${c.name}.`, 'war', c.cx, c.cy); }
  };

  // ------------------------------ captives ------------------------------
  Wr.enslave = function (v, fromFac, homeSet) {
    v.captive = { from: fromFac, home: homeSet, day: G.S.day };
    v.role = 'cativo'; v.home = 0; v.coup = 0; v.rebel = 0;
    const f = G.Fac.get(fromFac);
    if (f && f.leader === v.id) { /* handled by ensureLeader */ }
  };
  Wr.capture = function (o, captor, b) {
    const S = G.S; const from = fid(o);
    G.Vg.endTask(o);
    Wr.enslave(o, from, o.set);
    o.set = captor.set;
    G.Life && G.Life.bio(o, 'captive', (G.Fac.get(fid(captor)) || {}).name || '?');
    G.Vg.setTask(o, { type: 'escorted', by: captor.id, pri: 5.5, kind: 'escorted' });
    G.Vg.emote(o, 'fear', 3);
    G.FX && G.FX.poof(o.x, o.y, '#8a7a5a');
    const f = G.Fac.get(fid(captor)); if (f) f.st.captives++;
    if (b) b.captives++;
    S.stats.captives = (S.stats.captives || 0) + 1;
    const r = G.Fac.rel(from, fid(captor)); if (r) r.grudge = Math.min(100, r.grudge + 6);
    if (!S.milestones.firstCaptive) G.Village.milestone('firstCaptive', 'Correntes', `${f ? f.name : 'Um povo'} fez seus primeiros cativos.`, 'chain');
  };
  Wr.freeCaptive = function (v, dest, how) {
    const S = G.S; if (!v.captive) return;
    const captor = G.Fac.ofV(v);
    v.captive = null; v.role = null; v.home = 0;
    G.Life && G.Life.bio(v, 'freed');
    if (dest) { v.set = dest.id; G.Vg.endTask(v); G.Vg.setTask(v, { type: 'migrate', pri: 1.6, kind: 'migrate' }); }
    if (how === 'fuga') {
      S.stats.escapes = (S.stats.escapes || 0) + 1;
      log(`${v.name} escapou do cativeiro${captor ? ' de ' + captor.name : ''} e voltou para ${dest ? dest.name : 'casa'}.`, 'free', v.x, v.y);
    }
  };
  function destFor(v) {
    const S = G.S; const c = v.captive; if (!c) return null;
    const from = G.Fac.get(c.from);
    if (from && from.alive) { const h = S.settlements.get(c.home); if (h && h.fac === from.id) return h; return G.Fac.capitalOf(from.id); }
    return null;
  }
  Wr.startEscape = function (v) {
    const dest = destFor(v); if (!dest) return false;
    G.Vg.endTask(v);
    G.Vg.setTask(v, { type: 'escape', to: dest.id, pri: 4.6, kind: 'escape' });
    return true;
  };
  Wr.recapture = function (o, guard) {
    G.Vg.endTask(o);
    G.Vg.setTask(o, { type: 'escorted', by: guard.id, pri: 5.5, kind: 'escorted' });
    G.Vg.setTask(guard, { type: 'escort', id: o.id, pri: 3.3, kind: 'escort' });
    G.Vg.emote(o, 'sad', 3);
    const f = G.Fac.ofV(guard); const ruler = G.Politics.ruler(f);
    if (f && ruler && G.Politics.persona(ruler).cru > 0.6 && G.R() < 0.5) setTimeoutGame(() => G.Politics.execute(f, o, 'por tentar fugir'), 12);
  };
  const pending = [];
  function setTimeoutGame(fn, t) { pending.push({ fn, t }); }
  Wr.liberate = function (list, how, captor) {
    const S = G.S; const groups = new Map();
    for (const v of list) { if (!S.villagers.has(v.id) || !v.captive) continue; const k = v.captive.from; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(v); }
    let total = 0;
    for (const [fromId, vs] of groups) {
      const from = G.Fac.get(fromId);
      const dest = from && from.alive ? destFor(vs[0]) : null;
      if (dest) {
        for (const v of vs) { Wr.freeCaptive(v, dest, how); G.Vg.emote(v, 'happy', 3); }
        from.st.freed = (from.st.freed || 0) + vs.length;
        log(`${vs.length} ${vs.length > 1 ? 'cativos foram libertados' : 'cativo foi libertado'}${how === 'divina' ? ' por você' : how === 'revolta' ? ' pela revolta' : ''} e ${vs.length > 1 ? 'voltam' : 'volta'} para ${from.name}.`, 'free', vs[0].x, vs[0].y);
      } else if (vs.length >= 4) {
        Wr.foundFree(vs, captor, how);
      } else for (const v of vs) { v.captive = null; v.role = null; G.Vg.endTask(v); }
      total += vs.length;
    }
    S.stats.freed = (S.stats.freed || 0) + total;
    return total;
  };
  Wr.foundFree = function (vs, captor, how, leader) {
    const S = G.S;
    const site = Wr.freeSite(vs[0].x, vs[0].y);
    if (!site) { for (const v of vs) { v.captive = null; v.role = null; } return null; }
    const orig = G.Fac.get(vs[0].captive ? vs[0].captive.from : 0) || G.Fac.ofV(vs[0]);
    const nf = G.Fac.create({ freed: true, civ: orig ? orig.civ : null, stock: { food: Math.max(40, vs.length * 10), wood: 16, stone: 0 } });
    G.Politics.setupFaction(nf);
    nf.name = G.Politics.nameFor(null, 'livre');
    const set = G.Village.addSettlement(G.Village.newSettlementName(nf.id), site[0], site[1], nf.id);
    nf.capital = set.id; nf.gov = 'livre';
    for (const v of vs) { v.captive = null; v.role = null; v.home = 0; v.set = set.id; G.Vg.endTask(v); G.Vg.setTask(v, { type: 'migrate', pri: 1.6, kind: 'migrate' }); v.devotion = Math.min(100, v.devotion + (how === 'divina' || how === 'ungido' ? 35 : 10)); }
    const lead = leader && vs.includes(leader) ? leader : vs.slice().sort((a, b) => b.courage - a.courage)[0];
    G.Politics.crown(nf, lead, 'secessao', true);
    G.Politics.earn(nf, lead, 'libertador', true);
    if (captor) { const r = G.Fac.rel(nf.id, captor.id); if (r) { r.met = S.day; r.op = -60; r.grudge = 80; } }
    for (const o of G.Fac.all()) if (o.id !== nf.id && (!captor || o.id !== captor.id)) { const r = G.Fac.rel(nf.id, o.id); if (r) { r.met = S.day; r.op = 10; } }
    log(`${vs.length} ex-cativos, liderados por ${lead.name}, partiram para fundar ${set.name}. Nasce ${nf.name}.`, 'free', site[0], site[1]);
    G.UI && G.UI.toast(nf.name, 'Ex-cativos fundaram um povo livre.', 'free');
    G.Fac.updateTerritory();
    return nf;
  };
  Wr.freeSite = function (x, y) {
    const S = G.S; let best = null, bs = -1e9;
    for (let ty = 5; ty < N - 5; ty += 2) for (let tx = 5; tx < N - 5; tx += 2) {
      const i = ty * N + tx; const t = S.type[i];
      if (t !== T.GRASS && t !== T.MEADOW) continue;
      if (S.occ[i] || S.objAt[i]) continue;
      let md = 1e9; for (const o of S.settlements.values()) md = Math.min(md, G.dist(tx, ty, o.cx, o.cy));
      if (md < 12) continue;
      if (W.slope(tx - 1, ty - 1, 3, 3) > 1.6) continue;
      const d = G.dist(tx, ty, x, y);
      const sc = Math.min(md, 26) * 0.5 - Math.abs(d - 22) * 0.15 + S.fert[i] * 2 + G.R();
      if (sc > bs) { bs = sc; best = [tx + 0.5, ty + 0.5]; }
    }
    if (best && !W.findPath(x, y, best[0], best[1], true)) return null;
    return best;
  };
  Wr.freeAllOf = function (f, how) {
    const list = [...G.S.villagers.values()].filter(v => v.captive && fid(v) === f.id);
    if (!list.length) return 0;
    if (how === 'abolicao') log(`${f.name} aboliu o cativeiro. ${list.length} ${list.length > 1 ? 'cativos estão livres' : 'cativo está livre'}.`, 'free');
    return Wr.liberate(list, how, f);
  };
  Wr.liberateAround = function (x, y, r, how, leader) {
    const S = G.S; const list = []; let condemned = 0;
    for (const v of S.villagers.values()) {
      if (G.dist(v.x, v.y, x, y) > r) continue;
      if (v.task && v.task.type === 'condemned') { G.Vg.endTask(v); G.Vg.fleeFrom(v, x, y, 8, 'panic'); condemned++; v.devotion = Math.min(100, v.devotion + 40); }
      if (v.captive) { list.push(v); G.FX && G.FX.chainsBreak(v.x, v.y); }
    }
    if (!list.length) return condemned;
    const captor = G.Fac.ofV(list[0]);
    for (const v of list) v.devotion = Math.min(100, v.devotion + 35);
    if (leader && list.length >= 3) { const ex = list.filter(v => v !== leader); Wr.foundFree([leader, ...ex], captor, how, leader); }
    else Wr.liberate(list, how, captor);
    return list.length + condemned;
  };

  function captivesTick(dt) {
    const S = G.S;
    for (const v of S.villagers.values()) {
      if (!v.captive || v.age < 10) continue;
      if (v.task && (v.task.type === 'escorted' || v.task.type === 'escape' || v.task.type === 'condemned' || v.task.type === 'combat')) continue;
      const f = G.Fac.ofV(v); if (!f) continue;
      const pe = G.Politics.leaderPe(f);
      const days = S.day - v.captive.day;
      const assim = G.Civ.t(f.id, 'assimilate');
      if (days >= 5 / assim && pe.cru < 0.55 + (assim > 1.5 ? 0.15 : 0) && f.gov !== 'tirania' && G.R() < 0.035 * assim * dt / 5) {
        v.captive = null; v.role = null;
        if (G.R() < 0.4 || G.UI.selected === v) log(`Depois de ${Math.round(days)} anos de cativeiro, ${v.name} foi aceit${oa(v)} como parte de ${f.name}.`, 'free', v.x, v.y);
        continue;
      }
      const from = G.Fac.get(v.captive.from);
      let p = 0.0006 * (G.isNight() ? 3 : 1) * (from && from.alive ? 1.5 : 0.4) * (v.courage + 0.4) * (Wr.penOf(v.set) ? 0.45 : 1) * (f.gov === 'tirania' ? 0.7 : 1) * (v.fury > 0 ? 4 : 1);
      if (G.R() < p * dt) Wr.startEscape(v);
    }
    for (const f of G.Fac.all()) {
      if (f.revolt) continue;
      const caps = []; let free = 0;
      for (const v of S.villagers.values()) { if (fid(v) !== f.id || v.age < 16 || v.age >= 62) continue; if (v.captive) { if (v.hp > 40 && (!v.task || v.task.type !== 'escorted')) caps.push(v); } else free++; }
      if (caps.length < 5) continue;
      const ratio = caps.length / Math.max(1, free);
      if (ratio < 0.3) continue;
      if (G.R() < (0.02 + ratio * 0.04) * dt / 5) Wr.startRevolt(f, caps);
    }
  }
  Wr.startRevolt = function (f, caps) {
    const S = G.S;
    let cx = 0, cy = 0; for (const v of caps) { cx += v.x; cy += v.y; } cx /= caps.length; cy /= caps.length;
    f.revolt = { t: 0, rebels: caps.map(v => v.id), x: cx, y: cy };
    for (const v of caps) { v.revolt = f.id; giveRevoltTarget(v, f); }
    log(`Revolta dos cativos em ${f.name}! ${caps.length} se levantam contra seus senhores.`, 'chain', cx, cy);
    G.UI && G.UI.toast('Revolta!', `Os cativos de ${f.name} quebraram as correntes.`, 'chain');
    G.Audio && G.Audio.play('horn');
  };
  function giveRevoltTarget(v, f) {
    const S = G.S; let e = null, bd = 18 * 18;
    for (const o of S.villagers.values()) { if (o.captive || fid(o) !== f.id || o.age < 16) continue; const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; e = o; } }
    if (e) G.Vg.setTask(v, { type: 'combat', id: e.id, pri: 4.8, any: true, rebelCaptive: true, kind: 'combat' });
    return e;
  }
  function revoltTick(f, dt) {
    const R = f.revolt; if (!R) return;
    const S = G.S; R.t += dt;
    const rebels = R.rebels.map(id => S.villagers.get(id)).filter(v => v && v.captive && fid(v) === f.id);
    let fighters = 0; for (const o of S.villagers.values()) if (!o.captive && fid(o) === f.id && o.age >= 16 && o.age < 62 && o.hp > 25 && G.dist(o.x, o.y, R.x, R.y) < 18) fighters++;
    if (R.t > 20 && rebels.length && (fighters === 0 || rebels.length >= fighters * 1.2)) {
      f.revolt = null; for (const v of rebels) { v.revolt = 0; G.Vg.endTask(v); }
      log(`A revolta venceu em ${f.name}! ${rebels.length} cativos estão livres.`, 'free', R.x, R.y);
      Wr.liberate(rebels, 'revolta', f);
      return;
    }
    if (!rebels.length || R.t > 60) {
      f.revolt = null;
      for (const v of rebels) { v.revolt = 0; if (v.task && v.task.type === 'combat') G.Vg.endTask(v); }
      log(`A revolta dos cativos foi esmagada em ${f.name}.`, 'chain', R.x, R.y);
      const ruler = G.Politics.ruler(f);
      if (rebels.length && ruler && G.Politics.persona(ruler).cru > 0.5) G.Politics.execute(f, G.pick(rebels), 'por liderar a revolta');
      return;
    }
    for (const v of rebels) if (!v.task || v.task.type !== 'combat') giveRevoltTarget(v, f);
  }

  // ------------------------------ combat ------------------------------
  Wr.damage = function (v, o) {
    let d = v.role === 'guerreiro' ? 15 : v.role === 'cacador' ? 12 : v.age < 16 ? 4 : v.age >= 62 ? 5 : 9;
    d *= 0.85 + v.courage * 0.3;
    const fv = fid(v), fo = fid(o);
    if (Wr.armory.has(fv) && !v.captive) d *= 1.2;
    if (Wr.smith.has(fv) && !v.captive) d *= 1.1;
    if (v.fury > 0) d *= 1.7;
    if (v.hero) d *= 1.25;
    if (v.chosen) d *= 1.8;
    if (o.chosen) d *= 0.45;
    if (o.role === 'guerreiro' && Wr.armory.has(fo)) d *= 0.8;
    if (v.captive) d *= 0.85;
    else {
      // culture and metallurgy: Norse fury, Roman discipline, bronze and iron
      d *= G.Civ.t(fv, 'war');
      if (G.Civ.has(fv, 'bronze')) d *= 1.1;
      if (G.Civ.has(fv, 'ferro')) d *= 1.1;
    }
    if (v.elite) d *= v.elite === 'berserker' ? 1.6 : v.elite === 'carro' ? 1.4 : 1.3;
    if (v.arm === 'arco') d *= 0.65;
    if (o.elite === 'berserker') d *= 1.15;
    if (o.role === 'guerreiro' && !o.captive) { d *= G.Civ.t(fo, 'armor'); if (o.elite === 'falange' || o.elite === 'legiao') d *= 0.75; }
    // levies with a weapon from the forge hit harder than with a club
    if (v._armed && v.role !== 'guerreiro') d *= 1.35;
    if (G.Army) d *= G.Army.dmgMul(v, o, false);
    if (v.lost && (v.lost.armL || v.lost.armR)) d *= 0.6; // one arm left
    return d * G.rr(0.8, 1.2);
  };
  Wr.hitChance = (v, o) => 0.72 + (v.role === 'guerreiro' ? 0.08 : 0) - (o.role === 'guerreiro' ? 0.08 : 0) + (v.fury > 0 ? 0.1 : 0);
  Wr.hero = function (v) {
    v.hero = true;
    const f = G.Fac.ofV(v);
    G.Life && G.Life.bio(v, 'hero', v.kills);
    if (v.id === (f && f.leader)) { G.Politics.earn(f, v, 'bravo'); return; }
    if (!v.ep) v.ep = 'bravo';
    log(`${v.name}, de ${f ? f.name : 'lugar nenhum'}, já derrubou ${v.kills} inimigos. Chamam-n${oa(v)} de ${v.name}, ${G.Politics.epithet(v)}.`, 'war', v.x, v.y);
  };
  Wr.strike = function (v, o, t, b) {
    const S = G.S;
    // flower war: Aztec warriors wound to take prisoners rather than kill
    const flower = b && b.goal !== 'massacre' && G.Civ.t(b.fac, 'capture') > 1.5;
    const capMode = !o.captive && ((b && (b.goal === 'captura' || flower) && (o.age < 16 || o.hp < (flower ? 60 : 50))) || t.capMode);
    if (G.R() > Wr.hitChance(v, o)) { G.Audio && G.Audio.at(o.x, o.y, 'swish'); if (G.Carnage && G.R() < 0.45) G.Carnage.onParry(v, o); return; }
    const dmg = Wr.damage(v, o);
    if (capMode && b && o.hp - dmg < 28) { Wr.capture(o, v, b); t.foe = 0; t.gotCaptive = o.id; return; }
    o.hurt = 0.3;
    G.FX && G.FX.blood(o.x, o.y);
    G.Audio && G.Audio.at(o.x, o.y, 'hit');
    G.Carnage && G.Carnage.onHit(v, o, dmg, o.hp - dmg <= 0);
    const cause = t.cause || (b && b.goal === 'massacre' ? 'massacre' : 'war');
    G.Vg.damage(o, dmg, cause, false, v.id);
    if (!S.villagers.has(o.id)) {
      v.kills = (v.kills || 0) + 1; if (b) b.kills++;
      if (v.kills === 1 && G.Life) G.Life.bio(v, 'kill', o.name);
      const f = G.Fac.get(fid(v)); if (f) f.st.kills++;
      if (v.kills === 5 && !v.hero) Wr.hero(v);
      t.foe = 0;
      return;
    }
    Wr.react(o, v);
  };
  Wr.react = function (o, by) {
    const t = o.task;
    if (t && (t.type === 'combat' || t.type === 'condemned' || t.type === 'escorted')) return;
    if (t && t.type === 'band') { t.foe = by.id; t.scan = 0.6; return; }
    if (o.captive && !by.captive) { G.Vg.fleeFrom(o, by.x, by.y, 6, 'war'); return; }
    const canFight = o.age >= 15 && o.age < 62 && o.hp > 30;
    const special = by.captive || by.coup || by.rebel || (t && t.skirmish);
    if (canFight && (o.courage > 0.3 || o.role === 'guerreiro' || G.R() < 0.4)) G.Vg.setTask(o, { type: 'combat', id: by.id, pri: 4.2, def: true, any: !!special, kind: 'combat' });
    else G.Vg.fleeFrom(o, by.x, by.y, 7, 'war');
  };
  function fightStep(v, t, o, dt, H, b) {
    if (o.inside) {
      const bd = G.S.buildings.get(o.inside);
      if (!bd) { t.foe = 0; return; }
      const door = G.Vg.door(bd);
      if (G.dist(v.x, v.y, door[0], door[1]) > 0.8) {
        t.rt = (t.rt || 0) - dt;
        if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.6; if (!H.goto(v, door[0], door[1], true)) { t.foe = 0; return; } }
        H.move(v, dt, 1.2); v.act = '';
        return;
      }
      G.Vg.endTask(o); G.Vg.emote(o, 'fear', 2.5);
      return;
    }
    const d = G.dist(v.x, v.y, o.x, o.y);
    // archers keep their distance and loose arrows
    if (v.arm === 'arco' && !v.captive && d > 1.1 && d < 5.2) {
      v.path = null; v.moving = false; v.act = 'shoot';
      G.faceTo(v, o.x - v.x, o.y - v.y);
      t.cd = (t.cd === undefined ? G.rr(0, 0.5) : t.cd) - dt;
      if (t.cd > 0) return;
      t.cd = G.rr(1.3, 1.7); v.actT = 0;
      G.Siege.shoot(v, o, t, b);
      return;
    }
    if (d > 0.85 && d < 5 && W.losClear(v.x, v.y, o.x, o.y)) {
      // close and in the open: no need to plan a path
      const sp = v.speed * 1.2 * dt; const k = Math.min(1, sp / d);
      v.x += (o.x - v.x) * k; v.y += (o.y - v.y) * k; v.path = null; v.moving = true; v.walkPh += sp * 8.5; v.act = '';
      G.faceTo(v, o.x - v.x, o.y - v.y);
      return;
    }
    if (d > 0.85) {
      t.rt = (t.rt || 0) - dt;
      if (t.rt <= 0 || H.arrived(v)) {
        t.rt = d > 6 ? 0.9 : 0.45;
        if (!H.goto(v, o.x, o.y, false, 1200)) { (t.bad = t.bad || {})[o.id] = Wr.clock + 6; t.foe = 0; t.fail = (t.fail || 0) + 1; return; }
      }
      H.move(v, dt, 1.2); v.act = '';
      return;
    }
    v.path = null; v.act = 'fight'; v.moving = false;
    G.faceTo(v, o.x - v.x, o.y - v.y);
    t.cd = (t.cd === undefined ? G.rr(0, 0.4) : t.cd) - dt;
    if (t.cd > 0) return;
    t.cd = G.rr(0.8, 1.1); v.actT = 0;
    Wr.strike(v, o, t, b);
  }
  Wr.fightStep = fightStep;
  const badFoe = (t, o) => t.bad && t.bad[o.id] > Wr.clock;
  const unreachableSpot = o => (o.task && o.task.type === 'swim') || !W.walkableXY(o.x, o.y);
  function pickFoe(v, b) {
    const S = G.S; const R = b.st === 'ataque' ? 10 : b.st === 'retorno' ? 4 : 6; let best = null, bd = R * R;
    const massacre = b.goal === 'massacre' && b.st === 'ataque';
    const t = v.task;
    for (const o of S.villagers.values()) {
      if (o.captive || o.held || o.air || badFoe(t, o) || (!o.inside && unreachableSpot(o))) continue;
      const fo = fid(o); if (fo === b.fac || !hostile(b.fac, fo)) continue;
      if (busyDiplomat(o)) continue;
      if (massacre) { if (o.age < 2) continue; }
      else {
        if (o.age < 15 || o.inside) continue;
        if (o.age >= 62 && !fighting(o)) continue;
        if (o.task && (o.task.type === 'flee' || o.task.type === 'hide') && !fighting(o)) continue;
        if (b.goal === 'captura' && !fighting(o) && o.role !== 'guerreiro') continue;
      }
      const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; best = o; }
    }
    return best ? best.id : 0;
  }

  // ------------------------------ threat response ------------------------------
  Wr.emergency = function (v, H) {
    const S = G.S;
    if (!Wr.warFacs.size) return false;
    const t = v.task;
    if (t && (t.type === 'combat' || t.type === 'band' || t.type === 'condemned' || t.type === 'escorted' || t.type === 'escape' || t.type === 'escort' || busyDiplomat(v))) return false;
    if (t && t.type === 'hide' && t.age < 15) return false;
    if (v.captive) return false;
    const fv = fid(v); if (!Wr.warFacs.has(fv)) return false;
    const guard = v.role === 'guerreiro';
    let e = null, bd = guard ? 256 : 64;
    let esc = null, be = 100;
    if (guard) for (const o of Wr.escapers) {
      if (!o.captive || !o.task || o.task.type !== 'escape' || fid(o) !== fv) continue;
      const d = G.dist2(v.x, v.y, o.x, o.y); if (d < be) { be = d; esc = o; }
    }
    for (const o of Wr.fighters) {
      if (o.inside || o.held || o.air || o.captive || !S.villagers.has(o.id)) continue;
      if (unreachableSpot(o)) continue;
      if (!fighting(o)) continue;
      const fo = fid(o); if (fo === fv || !hostile(fv, fo)) continue;
      const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; e = o; }
    }
    if (esc && !e) { H.setTask(v, { type: 'combat', id: esc.id, pri: 4.1, recapture: true, any: true, kind: 'combat' }); return true; }
    if (!e) return false;
    const canFight = v.age >= 16 && v.age < 62 && v.hp > 35 && !(v.preg > 0);
    const brave = guard || v.role === 'cacador' || v.courage > 0.52 || v.fury > 0;
    if (canFight && brave) { H.setTask(v, { type: 'combat', id: e.id, pri: 4.2, def: true, kind: 'combat' }); G.Vg.emote(v, 'angry', 2); return true; }
    const h = S.buildings.get(v.home);
    if (h && h.built && h.type !== 'ruin' && G.dist(v.x, v.y, h.x, h.y) < 14 && bd > 9) { H.setTask(v, { type: 'hide', pri: 4.4, kind: 'hide' }); G.Vg.emote(v, 'fear', 2.5); return true; }
    H.flee(v, e.x, e.y, 8, 'war'); G.Vg.emote(v, 'fear', 2.5); return true;
  };

  // ------------------------------ task machines ------------------------------
  function goPoint(v, t, x, y, jit, dt, H, sp) {
    if (!t.dest || t.dest[2] !== x + y) {
      if ((t.wait || 0) > 0) { t.wait -= dt; return false; }
      const p = spotNear(x, y, jit) || [x, y];
      t.dest = [p[0], p[1], x + y];
      if (!H.goto(v, p[0], p[1], false, N * N) && !H.goto(v, x, y, true, N * N)) { t.dest = null; t.fail = (t.fail || 0) + 1; t.wait = 1.5; return false; }
    }
    if (H.move(v, dt, sp || 1)) { v.act = ''; return G.dist(v.x, v.y, x, y) < jit + 2.5; }
    return false;
  }
  function goFront(v, t, b, dt, H) {
    const [fx, fy] = G.Village.frontTile(b);
    if (!t.dest || t.dest[2] !== -b.id) { t.dest = [fx, fy, -b.id]; if (!H.goto(v, fx, fy, true)) { t.dest = null; return false; } }
    return H.move(v, dt, 1.1);
  }
  function runBand(v, t, dt, H) {
    const S = G.S; const b = Wr.bands.get(t.band);
    if (!b) return H.end(v);
    if (b.army && G.Army.runSoldier(v, t, b, dt, H)) return;
    if (b.goal === 'defesa') { t.foe = pickFoe(v, b); const fo = t.foe && S.villagers.get(t.foe); if (fo) return fightStep(v, t, fo, dt, H, b); return; }
    t.scan = (t.scan || 0) - dt;
    if (t.scan <= 0) { t.scan = 0.35 + G.R() * 0.2; if (b.st !== 'reunir') t.foe = pickFoe(v, b); }
    let foe = t.foe ? S.villagers.get(t.foe) : null;
    if (foe && (foe.captive || foe.held || foe.air || !hostile(b.fac, fid(foe)))) { foe = null; t.foe = 0; }
    if (foe && G.dist(v.x, v.y, foe.x, foe.y) > 14) { foe = null; t.foe = 0; }
    if (foe) { t.dest = null; return fightStep(v, t, foe, dt, H, b); }
    const set = S.settlements.get(b.set);
    switch (b.st) {
      case 'reunir': if (goPoint(v, t, b.rx, b.ry, 2.2, dt, H, 1)) v.act = ''; break;
      case 'marcha': goPoint(v, t, b.tx, b.ty, 2.5, dt, H, 1.05); break;
      case 'ataque': if (set) attackActions(v, t, b, set, dt, H); break;
      case 'retorno': {
        if (b.ship && G.Naval && G.Naval.bandReturn(v, b, t, dt, H)) break;
        let home = S.settlements.get(v.set);
        if (!home || home.fac !== b.fac) home = G.Fac.capitalOf(b.fac);
        if (!home) return H.end(v);
        if (goPoint(v, t, home.cx, home.cy, 2.5, dt, H, 1)) {
          if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, b.fac); G.FX && G.FX.deposit(v.x, v.y, v.carry.k, v.carry.n); v.carry = null; }
          H.end(v);
        } else if (t.fail > 4) H.end(v);
        break;
      }
    }
  }
  function attackActions(v, t, b, set, dt, H) {
    const S = G.S; const en = G.Fac.get(b.enemy);
    // walls first: batter the gate until it gives
    if (b.siege && G.Siege && G.Siege.siegeActions(v, t, b, dt, H)) return;
    // take captives
    if (b.goal === 'captura' && !t.gotCaptive) {
      let prey = null, bd = 1e9;
      const R2 = Math.pow((set.radius || 8) + 4, 2);
      for (const o of S.villagers.values()) {
        if (o.captive || o.age < 4 || o.inside || o.held || o.air || fid(o) !== b.enemy || busyDiplomat(o)) continue;
        if (G.dist2(o.x, o.y, set.cx, set.cy) > R2) continue;
        const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; prey = o; }
      }
      if (prey) {
        if (bd < 0.9 * 0.9) {
          if (prey.age < 15 || prey.age >= 62 || prey.hp < 50 || !(prey.task && prey.task.type === 'combat')) { Wr.capture(prey, v, b); t.gotCaptive = prey.id; t.dest = null; }
          else { t.foe = prey.id; t.capMode = true; }
        } else {
          t.rt = (t.rt || 0) - dt;
          if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.5; H.goto(v, prey.x, prey.y, false); }
          H.move(v, dt, 1.25); v.act = '';
        }
        return;
      }
    }
    // massacre & cruelty: set the village on fire
    const burner = b.goal === 'massacre' || (b.goal !== 'conquista' && G.Politics.leaderPe(G.Fac.get(b.fac)).cru > 0.6);
    if (burner && !v.carry && (t.burnT === undefined || t.burnT < 0) && b.burned < 4 + b.start / 3) {
      if (!t.burnB) {
        let best = null, bd = 1e9;
        for (const o of S.buildings.values()) {
          if (o.set !== set.id || !o.built || o.type === 'ruin' || o.type === 'cemetery' || o.type === 'well' || o.type === 'monument') continue;
          if (S.fire[W.idx(o.x, o.y)] > 0) continue;
          const d = G.dist2(v.x, v.y, o.x, o.y); if (d < bd) { bd = d; best = o; }
        }
        if (best && G.R() < 0.5) t.burnB = best.id; else t.burnT = 6;
      }
      const bb = t.burnB && S.buildings.get(t.burnB);
      if (bb) {
        if (goFront(v, t, bb, dt, H)) {
          v.act = 'throw'; t.bt = (t.bt || 0) + dt;
          if (t.bt > 1.2) { G.Nature.ignite(W.idx(bb.x, bb.y), 0.9); G.Audio && G.Audio.at(bb.x, bb.y, 'fire'); b.burned++; t.burnB = 0; t.bt = 0; t.burnT = 8; t.dest = null; }
        }
        return;
      }
    }
    if (t.burnT !== undefined) t.burnT -= dt;
    // loot the stores
    if ((b.goal === 'saque' || b.goal === 'captura' || b.goal === 'massacre') && !v.carry && en && en.stock.food + en.stock.wood + en.stock.stone >= 1) {
      const drop = G.Village.nearestDropoff(set.cx, set.cy, set.id);
      if (drop && drop.set === set.id) {
        if (goFront(v, t, drop, dt, H)) {
          const k = en.stock.food >= 3 ? 'food' : en.stock.stone >= 3 ? 'stone' : 'wood';
          const n = Math.min(Math.floor(en.stock[k]), 6);
          if (n > 0) { en.stock[k] -= n; v.carry = { k, n }; b.loot[k] += n; G.Vg.emote(v, 'happy', 1.5); }
          t.dest = null;
        }
        return;
      }
    }
    goPoint(v, t, set.cx, set.cy, 3, dt, H, 0.8);
  }
  function runCombat(v, t, dt, H) {
    const S = G.S; const o = S.villagers.get(t.id);
    if (!o || o.held || o.air || t.age > 50 || (t.fail || 0) > 6) return H.end(v);
    if (o.captive && !t.recapture && !t.any) return H.end(v);
    if (!t.any && !hostile(fid(v), fid(o))) return H.end(v);
    if (t.recapture && (!o.captive || !o.task || o.task.type !== 'escape')) return H.end(v);
    if (!t.any && v.elite !== 'berserker' && !v.chosen && v.hp < (v.role === 'guerreiro' ? 18 : 30)) { H.flee(v, o.x, o.y, 8, 'war'); return; }
    if (t.skirmish && (v.hp < 55 || o.hp < 55)) return H.end(v);
    if (t.recapture) {
      if (G.dist(v.x, v.y, o.x, o.y) < 0.9) { Wr.recapture(o, v); return; }
      t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.5; H.goto(v, o.x, o.y, false); }
      H.move(v, dt, 1.3); v.act = 'run';
      return;
    }
    fightStep(v, t, o, dt, H, null);
  }
  function runHide(v, t, dt, H) {
    const S = G.S; const h = S.buildings.get(v.home);
    if (!h || !h.built || h.type === 'ruin') return H.end(v);
    if (t.st === 0) { const [fx, fy] = G.Village.frontTile(h); if (!H.goto(v, fx, fy, true)) return H.end(v); t.st = 1; }
    else if (t.st === 1) { v.act = 'run'; if (H.move(v, dt, 1.4)) { t.st = 2; v.inside = h.id; v.act = ''; } }
    else {
      t.chk = (t.chk || 0) - dt;
      if (t.chk <= 0) {
        t.chk = 2;
        let danger = false; const fv = fid(v);
        for (const o of S.villagers.values()) if (!o.captive && fighting(o) && hostile(fv, fid(o)) && G.dist2(o.x, o.y, v.x, v.y) < 144) { danger = true; break; }
        if (!danger || t.age > 60) H.end(v);
      }
    }
  }
  function runEscorted(v, t, dt, H) {
    const S = G.S; const c = S.villagers.get(t.by);
    // the captor boards a ship: the captive goes aboard too
    if (c && c.aboard) { const sh = G.Naval && G.Naval.aboard(c.aboard); if (sh && G.dist(v.x, v.y, c.x, c.y) < 5) { G.Vg.endTask(v); v.aboard = sh.id; v.task = { type: 'aboard', ship: sh.id, pri: 9, st: 0, age: 0 }; sh.crew.push(v.id); } else H.end(v); return; }
    if (!c) { const dest = destFor(v); if (dest) { log(`Com a morte de seu captor, ${v.name} conseguiu fugir.`, 'free', v.x, v.y); Wr.freeCaptive(v, dest); } else H.end(v); return; }
    if (!c.task || !(c.task.type === 'band' || c.task.type === 'combat' || c.task.type === 'escort')) return H.end(v);
    v.act = 'bound';
    const d = G.dist(v.x, v.y, c.x, c.y);
    if (d > 1.1) {
      t.rt = (t.rt || 0) - dt;
      if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.6; const a = G.R() * 6.28; H.goto(v, c.x + Math.cos(a) * 0.6, c.y + Math.sin(a) * 0.6, false); }
      H.move(v, dt, 1.05);
    } else { v.moving = false; v.path = null; }
    if (d > 20) { v.x = c.x + G.rr(-0.4, 0.4); v.y = c.y + G.rr(-0.4, 0.4); }
  }
  function runEscort(v, t, dt, H) {
    const S = G.S; const o = S.villagers.get(t.id);
    if (!o || !o.captive) return H.end(v);
    let home = S.settlements.get(v.set); if (!home) return H.end(v);
    if (goPoint(v, t, home.cx, home.cy, 2.5, dt, H, 0.9) || t.age > 60) H.end(v);
  }
  function runEscape(v, t, dt, H) {
    const S = G.S; const dest = S.settlements.get(t.to);
    if (!v.captive) return H.end(v);
    if (!dest || !v.captive || dest.fac !== v.captive.from) { const d2 = destFor(v); if (!d2) return H.end(v); t.to = d2.id; t.dest = null; return; }
    v.act = 'run';
    if (goPoint(v, t, dest.cx, dest.cy, 3, dt, H, 1.3) || (G.Fac.ownerAt(v.x | 0, v.y | 0) === dest.fac && G.dist(v.x, v.y, dest.cx, dest.cy) < (dest.radius || 8))) { Wr.freeCaptive(v, dest, 'fuga'); return; }
    if ((t.fail || 0) > 5 || t.age > 150) H.end(v);
  }
  function runCondemned(v, t, dt, H) {
    if (t.st === 0) { if (!H.goto(v, t.x, t.y, false) && !H.goto(v, t.x, t.y, true)) { t.st = 2; return; } t.st = 1; }
    else if (t.st === 1) { v.act = 'bound'; if (H.move(v, dt, 0.7)) { t.st = 2; v.actT = 0; } }
    else { v.act = 'mourn'; G.faceTo(v, t.x - 1.2 - v.x, t.y - 0.7 - v.y); if (!v.emo || v.emo.t < 0.2) G.Vg.emote(v, 'sad', 2); }
  }
  function runAssembly(v, t, dt, H) {
    if (t.st === 0) {
      const a = G.R() * 6.28, r = G.rr(2.2, 3.6);
      const p = spotNear(t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, 0.8);
      if (!p || !H.goto(v, p[0], p[1], false)) return H.end(v);
      t.st = 1;
    } else if (t.st === 1) { if (H.move(v, dt)) { t.st = 2; v.actT = 0; } if (t.age > 25) H.end(v); }
    else { v.act = ''; G.faceTo(v, t.x - v.x, t.y - v.y); if (t.age > 30) H.end(v); }
  }
  function runEnvoy(v, t, dt, H) {
    const S = G.S; const to = G.Fac.get(t.to), from = G.Fac.get(t.from);
    if (!to || !from || !to.alive || !from.alive) return H.end(v);
    if (t.st === 0 || t.st === 1) {
      const dest = G.Fac.capitalOf(to.id); if (!dest) return H.end(v);
      const cf = S.buildings.get(dest.campfire);
      const tx = cf ? cf.x + 1.3 : dest.cx, ty = cf ? cf.y + 0.5 : dest.cy;
      if (goPoint(v, t, tx, ty, 1.2, dt, H, 1)) { t.st = 2; v.actT = 0; }
      else if ((t.fail || 0) > 4) { G.Politics.deliver(from, to, t.msg, null); return H.end(v); }
      if (t.age > 160) { G.Politics.deliver(from, to, t.msg, null); return H.end(v); }
    } else if (t.st === 2) {
      v.act = 'talk'; if (!v.emo || v.emo.t < 0.2) G.Vg.emote(v, 'chat', 1.4);
      if (v.actT > 3.5) {
        G.Politics.deliver(from, to, t.msg, v);
        if (!S.villagers.has(v.id)) return;
        t.st = 3; t.dest = null;
      }
    } else {
      const home = S.settlements.get(v.set); if (!home) return H.end(v);
      if (goPoint(v, t, home.cx, home.cy, 2.5, dt, H, 1) || (t.fail || 0) > 4 || t.age > 320) H.end(v);
    }
  }
  function runTrade(v, t, dt, H) {
    const S = G.S; const to = G.Fac.get(t.to), from = G.Fac.get(t.from);
    if (!to || !from || !to.alive || !from.alive || hostile(t.to, t.from)) { if (v.carry && from) { G.Village.addStock(v.carry.k, v.carry.n, from.id); v.carry = null; } return H.end(v); }
    if (t.st === 0) {
      const dest = G.Fac.capitalOf(to.id); if (!dest) return H.end(v);
      const drop = G.Village.nearestDropoff(dest.cx, dest.cy, dest.id) || S.buildings.get(dest.campfire);
      if (!drop) return H.end(v);
      if (goFront(v, t, drop, dt, H)) {
        const r = G.Politics.tradeArrive(v, t);
        if (r === 'stay') return H.end(v);
        t.st = 1; t.dest = null;
      } else if (!t.dest || t.age > 180) { if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, from.id); v.carry = null; } return H.end(v); }
    } else {
      const home = G.Fac.capitalOf(from.id); if (!home) return H.end(v);
      const drop = G.Village.nearestDropoff(home.cx, home.cy, home.id) || S.buildings.get(home.campfire);
      if (!drop) return H.end(v);
      if (goFront(v, t, drop, dt, H) || t.age > 360) { if (v.carry) { G.Village.addStock(v.carry.k, v.carry.n, from.id); G.FX && G.FX.deposit(v.x, v.y, v.carry.k, v.carry.n); v.carry = null; } H.end(v); }
    }
  }
  function runDrill(v, t, dt, H) {
    const S = G.S;
    if (t.st === 0) {
      const set = S.settlements.get(v.set); if (!set) return H.end(v);
      let q = null; for (const b of S.buildings.values()) if (b.type === 'quartel' && b.built && b.set === v.set) { q = b; break; }
      const c = q ? G.Village.frontTile(q) : [set.cx + 2, set.cy + 1];
      const rank = q && G.Life && G.Life.rowSpot(q, v, 4, 0.7, 1.2);
      if (rank) { t.row = q.id; t.face = rank[3] - rank[4] > 0 ? 1 : -1; t.fx = rank[3]; t.fy = rank[4]; if (!H.goto(v, rank[0], rank[1], false)) { G.Life.rowRelease(v); t.row = 0; return H.end(v); } }
      else { const p = spotNear(c[0] + G.rr(-1.5, 1.5), c[1] + G.rr(-1.5, 1.5), 1); if (!p || !H.goto(v, p[0], p[1], false)) return H.end(v); }
      t.st = 1;
    } else if (t.st === 1) { if (H.move(v, dt)) { t.st = 2; v.actT = 0; t.dur = G.rr(8, 13); if (G.R() < 0.5) G.faceAs(v, v, true); } }
    else if (t.row) { v.act = 'drill'; G.faceAs(v, t); v.actT = G.S.clock % 2.4; t.dur -= dt; if (t.dur <= 0) H.end(v); }
    else { v.act = 'fight'; if (v.actT > 2.5) v.actT = 0; t.dur -= dt; if (t.dur <= 0) H.end(v); }
  }
  // dispatch for the new task types; returns false for unknown ones
  Wr.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'band': runBand(v, t, dt, H); return true;
      case 'combat': runCombat(v, t, dt, H); return true;
      case 'hide': runHide(v, t, dt, H); return true;
      case 'escorted': runEscorted(v, t, dt, H); return true;
      case 'escort': runEscort(v, t, dt, H); return true;
      case 'escape': runEscape(v, t, dt, H); return true;
      case 'condemned': runCondemned(v, t, dt, H); return true;
      case 'assembly': runAssembly(v, t, dt, H); return true;
      case 'envoy': runEnvoy(v, t, dt, H); return true;
      case 'trade': runTrade(v, t, dt, H); return true;
      case 'drill': runDrill(v, t, dt, H); return true;
    }
    return false;
  };
  const MAT = { wood: 'madeira', food: 'comida', stone: 'pedra' };
  Wr.taskText = function (v, t) {
    const S = G.S; const pn = id => { const o = S.villagers.get(id); return o ? o.name : 'alguém'; };
    switch (t.type) {
      case 'band': {
        const b = Wr.bands.get(t.band); if (!b) return 'Voltando da guerra';
        const set = S.settlements.get(b.set); const en = set ? set.name : 'o inimigo';
        if (t.foe) return `Lutando contra ${pn(t.foe)}!`;
        if (b.st === 'reunir') return `Reunindo-se para atacar ${en}`;
        if (b.st === 'marcha') return `Marchando contra ${en}`;
        if (b.st === 'ataque') return v.carry ? `Saqueando ${MAT[v.carry.k]} de ${en}` : t.gotCaptive ? `Levando ${pn(t.gotCaptive)} como cativ${oa(S.villagers.get(t.gotCaptive))}` : b.goal === 'massacre' ? `Massacrando ${en}` : `Atacando ${en}`;
        return v.carry ? `Voltando com o saque (${v.carry.n} de ${MAT[v.carry.k]})` : 'Voltando da guerra';
      }
      case 'combat': return t.coup ? `Tentando matar ${pn(t.id)} para tomar o trono!` : t.rebel ? `Rebelando-se contra ${pn(t.id)}!` : t.rebelCaptive ? `Lutando pela liberdade contra ${pn(t.id)}!` : t.recapture ? `Perseguindo ${pn(t.id)}, que fugiu` : t.guard ? `Defendendo o trono de ${pn(t.id)}` : t.skirmish ? `Brigando com ${pn(t.id)} na fronteira` : `Lutando contra ${pn(t.id)}!`;
      case 'hide': return v.inside ? 'Escondid' + oa(v) + ' em casa, com medo' : 'Correndo para se esconder!';
      case 'escorted': return `Levad${oa(v)} como cativ${oa(v)} por ${pn(t.by)}`;
      case 'escort': return `Levando ${pn(t.id)} de volta ao cativeiro`;
      case 'escape': { const s = S.settlements.get(t.to); return `Fugindo do cativeiro para ${s ? s.name : 'casa'}!`; }
      case 'condemned': return 'Condenad' + oa(v) + ', esperando a execução';
      case 'assembly': return 'Assistindo a uma execução';
      case 'envoy': { const f = G.Fac.get(t.to); const m = { paz: 'uma proposta de paz', alianca: 'uma proposta de aliança', contato: 'presentes' }[t.msg] || 'uma mensagem'; return t.st >= 3 ? 'Voltando da missão diplomática' : `Levando ${m} para ${f ? f.name : 'outro povo'}`; }
      case 'trade': { const f = G.Fac.get(t.st ? t.from : t.to); return t.st ? `Voltando da caravana${v.carry ? ' com ' + v.carry.n + ' de ' + MAT[v.carry.k] : ''}` : `Levando ${t.n} de ${MAT[t.give]} para ${f ? f.name : 'outro povo'}`; }
      case 'drill': return 'Treinando para a guerra';
    }
    return null;
  };

  // ------------------------------ captives' daily life ------------------------------
  Wr.captiveDecide = function (v, H) {
    const cur = v.task;
    if (cur && cur.pri >= 3) return;
    if (v.age < 16) return H.childDecide(v);
    const night = G.isNight();
    if (night) { if (!cur || cur.type !== 'sleep') H.setTask(v, { type: 'sleep', pri: 1.5, kind: 'sleep' }); return; }
    if (v.hunger > 70 && (!cur || cur.kind !== 'eat')) { const t = H.eatTask(v); if (t) { t.kind = 'eat'; return; } }
    if (v.energy < 15) { H.setTask(v, { type: 'sleep', pri: 1.2, kind: 'sleep' }); return; }
    if (cur && (cur.kind === 'work' || cur.kind === 'eat')) return;
    if (G.R() < 0.07) { H.setTask(v, { type: 'pray', pri: 0.6, kind: 'pray' }); return; }
    const t = H.workTask(v); if (t) t.kind = 'work';
  };

  // ------------------------------ battle reports ------------------------------
  Wr.noteDeath = function (v, cause) {
    const S = G.S; const f0 = fid(v);
    const f = G.Fac.get(f0); if (f) { f.st.deaths = (f.st.deaths || 0) + 1; f.weariness = Math.min(100, f.weariness + 3); }
    const killer = v.lastBy ? S.villagers.get(v.lastBy) : null; const kf = killer ? fid(killer) : 0;
    if (kf && kf !== f0) { const r = G.Fac.rel(kf, f0); if (r) r.grudge = Math.min(100, r.grudge + 2); }
    for (const b of Wr.bands.values()) if (b.fac === f0 && b.members.includes(v.id)) b.lost++;
    G.Army && G.Army.onDeath(v, killer);
    if (cause === 'execution' || cause === 'coup') return;
    let bt = Wr.battles.find(x => G.dist(x.x, x.y, v.x, v.y) < 14 && Wr.clock - x.last < 25);
    if (!bt) { bt = { x: v.x, y: v.y, last: 0, dead: {}, names: [] }; Wr.battles.push(bt); }
    bt.last = Wr.clock; bt.dead[f0] = (bt.dead[f0] || 0) + 1; if (bt.names.length < 3) bt.names.push(v.name);
    if (v.hero || G.Fac.all().some(f => f.leader === v.id)) bt.notable = (bt.notable || 0) + 1;
    S.stats.warDeaths = (S.stats.warDeaths || 0) + 1;
  };
  function flushBattles() {
    const S = G.S;
    for (const b of Wr.battles) {
      if (Wr.clock - b.last <= 18) continue;
      const entries = Object.entries(b.dead); const tot = entries.reduce((a, [, n]) => a + n, 0);
      const place = G.Village.nearSettlementName(b.x, b.y);
      if (tot === 1) { if (!b.notable) log(`${b.names[0]} morreu em combate${place ? ' perto de ' + place : ''}.`, 'war', b.x, b.y); }
      else {
        const parts = entries.map(([id, n]) => { const f = G.Fac.get(+id); return `${n} de ${f ? f.name : '?'}`; });
        log(`Batalha ${place ? 'em ' + place : 'nos ermos'}: ${tot} mortos — ${parts.join(', ')}.`, 'war', b.x, b.y);
        if (tot >= 8) G.UI && G.UI.toast('Batalha sangrenta', `${tot} mortos ${place ? 'em ' + place : 'nos ermos'}.`, 'war');
        S.stats.battles = (S.stats.battles || 0) + 1;
        for (const [id] of entries) { const f = G.Fac.get(+id); if (f) f.st.battles++; }
      }
    }
    Wr.battles = Wr.battles.filter(b => Wr.clock - b.last <= 18);
  }

  // ------------------------------ watchtowers ------------------------------
  function towers(dt) {
    const S = G.S;
    for (const b of S.buildings.values()) {
      if (b.type !== 'torre' || !b.built) continue;
      b.cd = (b.cd || 0) - dt; if (b.cd > 0) continue;
      const f0 = G.Village.facOfSet(b.set); if (!Wr.warFacs.has(f0)) continue;
      const tx = b.x + 0.5, ty = b.y + 0.5;
      let e = null, bd = 49;
      for (const o of S.villagers.values()) { if (o.captive || o.inside || o.age < 14 || !fighting(o)) continue; if (!hostile(f0, fid(o))) continue; const d = G.dist2(tx, ty, o.x, o.y); if (d < bd) { bd = d; e = o; } }
      if (!e) continue;
      b.cd = 1.6;
      G.FX && G.FX.arrow(tx, ty, e.x, e.y);
      G.Audio && G.Audio.at(tx, ty, 'swish');
      if (G.R() < 0.65) { e.hurt = 0.3; G.Vg.damage(e, 12, 'arrow', false, 0); if (!S.villagers.has(e.id)) { const f = G.Fac.get(f0); if (f) f.st.kills++; } }
    }
  }

  // ------------------------------ strategy ------------------------------
  function strategy() {
    const S = G.S;
    for (const f of G.Fac.all()) {
      const enemies = G.Fac.enemiesOf(f.id); if (!enemies.length) continue;
      if (S.divinePeace > 0) continue;
      let busy = false; for (const b of Wr.bands.values()) if (b.fac === f.id && b.goal !== 'defesa') { busy = true; break; }
      if (busy || f.attackCD > 0) continue;
      if (f.weariness > 85 && G.R() < 0.7) continue;
      const en = enemies.sort((a, b) => { const ca = G.Fac.capitalOf(a.id), cb = G.Fac.capitalOf(b.id), cf = G.Fac.capitalOf(f.id); return (ca && cf ? G.dist(ca.cx, ca.cy, cf.cx, cf.cy) : 999) - (cb && cf ? G.dist(cb.cx, cb.cy, cf.cx, cf.cy) : 999); })[0];
      if (!Wr.launch(f, en)) f.attackCD = G.rr(30, 60);
    }
  }
  Wr.launchNow = function (f, opts) {
    const enemies = G.Fac.enemiesOf(f.id); if (!enemies.length) return null;
    for (const b of Wr.bands.values()) if (b.fac === f.id) return b;
    f.attackCD = 0;
    return Wr.launch(f, enemies[0], opts);
  };

  // ------------------------------ update ------------------------------
  let tick = 0, tCap = 0, tFlush = 0;
  Wr.update = function (dt) {
    const S = G.S; if (!S) return;
    Wr.clock += dt;
    for (let i = pending.length - 1; i >= 0; i--) { pending[i].t -= dt; if (pending[i].t <= 0) { const p = pending.splice(i, 1)[0]; try { p.fn(); } catch (e) { console.warn(e); } } }
    for (const v of S.villagers.values()) if (v.fury > 0) v.fury -= dt;
    tick += dt; tCap += dt; tFlush += dt;
    if (tick >= 0.5) {
      const d = tick; tick = 0;
      Wr.warFacs.clear(); Wr.armory.clear(); Wr.smith.clear();
      for (const f of G.Fac.all()) {
        if (G.Fac.enemiesOf(f.id).length) Wr.warFacs.add(f.id);
        if (f.revolt || f.coup || f.rev) Wr.warFacs.add(f.id);
        if (f.attackCD > 0) f.attackCD -= d;
      }
      Wr.fighters.length = 0; Wr.escapers.length = 0;
      if (Wr.warFacs.size) for (const v of S.villagers.values()) { if (v.captive) { if (v.task && v.task.type === 'escape') Wr.escapers.push(v); } else if (v.age >= 14 && fighting(v)) Wr.fighters.push(v); }
      for (const b of S.buildings.values()) if (b.built) { if (b.type === 'quartel') Wr.armory.add(G.Village.facOfSet(b.set)); else if (b.type === 'workshop') Wr.smith.add(G.Village.facOfSet(b.set)); }
      for (const b of [...Wr.bands.values()]) bandUpdate(b, d);
      for (const s of S.settlements.values()) if (s.alarmT > 0) s.alarmT -= d;
      towers(d);
      for (const f of G.Fac.all()) revoltTick(f, d);
      strategy();
    }
    if (tCap >= 5) { const d = tCap; tCap = 0; captivesTick(d); }
    if (tFlush >= 2) { tFlush = 0; flushBattles(); }
  };
})(window.G);
