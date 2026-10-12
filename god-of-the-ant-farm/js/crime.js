'use strict';
// ============================================================
//  Theft and the watch. A thief is someone with a reason: hunger
//  with an empty purse, a night in the street, or the habit of a
//  first theft that went well. At night he slips to the door of a
//  house with coin and takes some — the coin really leaves that
//  house and goes into his purse. Whoever is awake nearby sees it,
//  and knows only what they saw. The household finds the purse
//  lighter in the morning. A witness who crosses a guard tells
//  him; the guard does not know where the thief is — he looks for
//  him at home and in the street, and if he sees him he goes for
//  him; a thief who sees the guard coming may run. Taken, the
//  thief walks bound to the town jail, which has its cells and its
//  jailer, and stays as long as the law of his people says; the
//  coin goes back to the house it was taken from. A jail without
//  its jailer at night can lose a prisoner.
// ============================================================
(function (G) {
  let N = G.N; const W = G.W; G.mapHooks.push(n => { N = n; });
  const E = G.Eco; const Cr = G.Crime = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');
  const crimes = () => G.S.crimes || (G.S.crimes = []);
  const bio = (v, third, first) => G.Life && G.Life.bio(v, 'note', third, first);
  G.saveHooks.push({
    save(out) { if (G.S.crimes && G.S.crimes.length) out.crimes = G.S.crimes; },
    load(o) {
      G.S.crimes = Array.isArray(o.crimes) ? o.crimes : [];
      // (a save forgets everyone's errand: the prisoners go back to their cells, the ones on the way there too)
      for (const v of G.S.villagers.values()) {
        if (!v.jail) continue;
        const b = G.S.buildings.get(v.jail);
        if (!b || b.type !== 'cadeia') { v.jail = 0; v.jailUntil = 0; continue; }
        // (a task as setTask makes it, with its clock: without one the cell's clock read NaN — L-084)
        const [dx, dy] = G.Vg.door(b); v.x = dx; v.y = dy; v.inside = b.id; v.task = { type: 'cela', id: b.id, pri: 5.3, kind: 'cela', age: 0, st: 0 };
      }
    },
  });

  // ------------------------------ the jail ------------------------------
  Object.assign(G.BDEF, { cadeia: { name: 'Cadeia', w: 2, h: 2, cost: { wood: 18, stone: 30 }, work: 36, blocks: true, hp: 260, jobs: 1, role: 'carcereiro', cells: 4 } });
  G.BDESC.cadeia = 'Celas de pedra com grades. Quem a guarda de noite é o carcereiro; sem ele, as grades ficam mais fracas.';
  G.ROLE.carcereiro = ['Carcereiro', 'Carcereira'];
  if (!E.JOB_ROLES.includes('carcereiro')) E.JOB_ROLES.push('carcereiro');
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.carcereiro = '#5a5a6a';
  // the watchman: a trade of the town, not a soldier — he walks the streets at night with a torch, hears the witnesses,
  // looks for the thief and takes him to the cells (soldiers and the jailer answer a theft too, when they see one)
  G.ROLE.vigia = ['Vigia', 'Vigia'];
  if (!E.JOB_ROLES.includes('vigia')) E.JOB_ROLES.push('vigia');
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.vigia = '#4a5a7a';
  const LAW = { guerreiro: 1, vigia: 1, carcereiro: 1 }; const WATCH = { guerreiro: 1, vigia: 1 };
  Cr.law = v => !!(v && LAW[v.role]);
  if (G.City) G.City.IDEAL.cadeia = 5;
  if (G.Urban) { G.Urban.addWeight('cadeia', { militar: 4 }); G.Urban.addNear && G.Urban.addNear('cadeia', ['armas', 'poder', 'praca'], 4); }
  const jailsOf = sid => { const out = []; for (const b of G.S.buildings.values()) if (b.type === 'cadeia' && b.set === sid) out.push(b); return out; };
  const inmates = b => { let n = 0; for (const v of G.S.villagers.values()) if (v.jail === b.id) n++; return n; };
  Cr.inmates = inmates;
  const recent = (sid, days) => crimes().filter(c => c.set === sid && G.S.day - c.day <= days).length;
  // a city that has had thefts, or is big enough to fear them, builds a jail
  const oldPlan = E.plan;
  E.plan = function (set, fac, c, want, pop) {
    oldPlan(set, fac, c, want, pop);
    if ((set.tier || 0) >= 3 && !c.cadeia && !c.siteTypes.cadeia && (recent(set.id, 12) >= 2 || pop >= 70) && (fac.stock.stone || 0) >= 30) want.push('cadeia');
  };
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A); const jail = jailsOf(set.id).some(b => b.built);
    if (jail) out.carcereiro = (out.carcereiro || 0) + 1;
    // a city keeps its watch once it has cells to fill, thefts to answer for (two in twelve years), or many streets
    if ((set.tier || 0) >= 2 && A >= 10) { const n = Math.min((jail ? 1 : 0) + (recent(set.id, 12) >= 2 ? 1 : 0) + Math.floor(A / 40), Math.max(1, Math.floor(A * 0.08))); if (n > 0) out.vigia = (out.vigia || 0) + n; }
    return out;
  };
  // ------------------------------ the law of each people ------------------------------
  // how many days in the cells a theft costs, and whether the thief also pays: the harsher the rule, the longer
  Cr.sentence = function (f) {
    const g = f && f.gov;
    if (!g || g === 'tribo') return { days: 0, fine: 1, how: 'os anciãos mandaram devolver o que foi levado' };
    if (G.Politics && G.Politics.tyr(f)) return { days: 3, fine: 1, how: 'três anos de cela, por ordem de quem manda' };
    if (g === 'democracia' || g === 'republica' || g === 'conselho' || g === 'comuna') return { days: 1, fine: 1, how: 'um ano de cela e a devolução, decididos diante de todos' };
    if (g === 'teocracia') return { days: 2, fine: 1, how: 'dois anos de cela e penitência no templo' };
    return { days: 2, fine: 1, how: 'dois anos de cela, pela lei do reino' };
  };

  // ------------------------------ who steals, and from whom ------------------------------
  const purse = v => E.purse(v);
  // the coin an ordinary house of a town keeps (counted once a day)
  const wealthDay = new Map();
  G.worldHooks.push(() => wealthDay.clear());
  Cr.wealth = function (sid) {
    const S = G.S; const w = wealthDay.get(sid); if (w && w.day === S.day) return w.v;
    let c = 0, n = 0; for (const b of S.buildings.values()) if (b.set === sid && b.built && G.BDEF[b.type].housing) { c += b.coin || 0; n++; }
    const v = n ? c / n : 0; wealthDay.set(sid, { day: S.day, v }); return v;
  };
  function desperate(v) {
    const tr = v.traits || [];
    if (v.age < 16 || v.age > 64 || v.captive || v.jail || LAW[v.role] || v.role === 'sacerdote' || v.officer) return 0;
    let w = 0; const f = G.Fac.ofV(v); const pop = f ? G.Fac.pop(f.id) : 1;
    // (the town's store feeds the hungry for nothing: hunger leads to theft only when the store is empty)
    if (v.hunger > 62 && purse(v) < 1 && f && f.stock.food < pop * 0.4) w += 0.5;
    if (v.rua && G.S.day - v.rua >= 2) w += 0.35;
    if ((v.thefts || 0) > 0 && !(v.caught && G.S.day - v.caught < 4)) w += 0.25;
    // poverty among the well-off: an empty purse in a town whose houses keep coin
    if (purse(v) < 1 && f && E.coinage(f.id) && (Cr.wealth(v.set) >= 10)) w += 0.2;
    if (!w) return 0;
    if (tr.includes('Corajoso')) w += 0.1; if (tr.includes('Medroso')) w -= 0.2; if (tr.includes('Devoto')) w -= 0.25;
    return Math.max(0, w);
  }
  function victimFor(v) {
    const S = G.S; let best = null, bs = -1e9;
    for (const h of S.buildings.values()) {
      if (h.set !== v.set || !h.built || !G.BDEF[h.type].housing || h.id === v.home || (h.coin || 0) < 6) continue;
      if (h.robbed && S.day - h.robbed < 2) continue;
      // the fatter purse, not too far, and a house where no one in the family of the thief lives
      const d = G.dist(v.x, v.y, h.x, h.y);
      const sc = Math.min(40, h.coin) * 0.1 - d * 0.08 + G.R();
      if (sc > bs) { bs = sc; best = h; }
    }
    return best;
  }

  // ------------------------------ the night of the theft ------------------------------
  function runFurto(v, t, dt, H) {
    const S = G.S; const h = S.buildings.get(t.house);
    if (!h || !h.built) return H.end(v);
    const [dx, dy] = G.Vg.door(h);
    if (t.st === 0) { if (!H.goto(v, dx, dy, false, 4000)) return H.end(v); t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { v.act = 'sneak'; t.walk += dt; if (H.move(v, dt, 0.8)) { t.st = 2; v.actT = 0; } else if (t.walk > 80) H.end(v); return; }
    if (t.st === 2) {
      v.act = v.actT < 1.5 ? 'sneak' : 'reach'; G.faceTo(v, h.x + 0.5 - v.x, h.y + 0.5 - v.y);
      if (v.actT < 3) return;
      const n = Math.min(6, Math.round((h.coin || 0) * 0.35 * 100) / 100);
      if (n <= 0) return H.end(v);
      h.coin -= n; v.purse = (v.purse || 0) + n; h.robbed = S.day;
      v.thefts = (v.thefts || 0) + 1;
      // who saw it: anyone awake out of doors close by (and they know only what they saw)
      const seen = [];
      for (const o of S.villagers.values()) {
        if (o === v || o.sleeping || o.inside || o.age < 8 || o.captive || o.aboard || o.ug) continue;
        if (G.dist2(o.x, o.y, v.x, v.y) > 25) continue;
        seen.push(o.id); o.saw = { crime: 0, day: S.day }; G.Vg.emote(o, LAW[o.role] ? 'angry' : 'fear', 1.6);
      }
      const c = { id: S.nextId++, kind: 'furto', day: S.day, set: v.set, thief: v.id, house: h.id, n, x: Math.round(h.x * 10) / 10, y: Math.round(h.y * 10) / 10, seen, told: 0, found: 0, st: 'aberto' };
      for (const id of seen) { const o = S.villagers.get(id); if (!o) continue; o.saw.crime = c.id; if (LAW[o.role] && !o.hunt) { o.hunt = c.id; c.told = S.day; c.flag = 1; o.saw = null; if (!(o.task && o.task.pri >= 1.65)) G.Vg.setTask(o, { type: 'prender', crime: c.id, id: v.id, pri: 1.65, st: 0, look: 0, kind: 'prender' }); } } // (one on the march, in a battle or at a weightier errand goes on with it: he knows, and hunts after)
      crimes().push(c); if (crimes().length > 60) crimes().shift();
      t.st = 3; t.crime = c.id; return;
    }
    // away from the door, back into the dark (home, or the street)
    v.act = 'sneak';
    if (!t.away) { t.away = 1; const hb = v.home && S.buildings.get(v.home); const p = hb ? G.Vg.door(hb) : [v.x + G.rr(-6, 6), v.y + G.rr(-6, 6)]; if (!H.goto(v, p[0], p[1], false, 4000)) return H.end(v); }
    if (H.move(v, dt, 0.9) || t.age > 60) H.end(v);
  }

  // ------------------------------ the watch: rounds, witnesses, the hunt, the arrest ------------------------------
  // soldiers walk the streets at night with a torch, from crossing to crossing
  const oldGuard = E.guardTask;
  E.guardTask = function (v, H) {
    const S = G.S; const set = S.settlements.get(v.set);
    // a guard who knows of a theft goes after the thief
    const c = v.hunt && crimes().find(q => q.id === v.hunt && q.st === 'aberto');
    if (c) { const th = S.villagers.get(c.thief); if (th && th.set === v.set && !th.jail) return H.setTask(v, { type: 'prender', crime: c.id, id: th.id, pri: 1.6, st: 0, look: 0 }); v.hunt = 0; }
    return oldGuard(v, H);
  };
  function rondaPoints(set) {
    const out = [];
    for (const d of (G.Urban && G.Urban.districtsOf(set)) || []) if (d.k !== 'agrario') out.push([d.x, d.y]);
    if (out.length < 3) { const r = Math.max(4, (set.radius || 8) * 0.55); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + set.id; out.push([set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r]); } }
    // (a round is a few of them, starting from the one the hash of the night picks)
    const k0 = Math.floor(G.hash(set.id * 13 + G.S.day) * out.length);
    return out.slice(k0).concat(out.slice(0, k0)).slice(0, 4).map(p => { const q = W.nearestLand(p[0], p[1], 3) || p; return [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10]; });
  }
  function runRonda(v, t, dt, H) {
    const S = G.S;
    // (the round goes on, crossing to crossing, until the sky lightens)
    if (t.k >= t.pts.length) { const set = S.settlements.get(v.set); if (!t.loop || !set || !(G.isNight() || G.isEvening())) return H.end(v); t.pts = rondaPoints(set); t.k = 0; t.st = 0; return; }
    if (t.loop && !(G.isNight() || G.isEvening())) return H.end(v);
    if (G.isNight()) v.torch = true;
    if (t.st === 0) { const [x, y] = t.pts[t.k]; if (!H.goto(v, x, y, false, 4000)) { t.k++; return; } t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt, 0.85)) { t.st = 2; v.actT = 0; } else if (t.walk > 60) { t.k++; t.st = 0; } return; }
    v.act = 'guard'; v.moving = false;
    if (v.actT > 4) { t.k++; t.st = 0; }
  }
  // the hunt: the guard looks where the thief should be (his house, then around), never where he cannot know
  function runPrender(v, t, dt, H) {
    const S = G.S; const th = S.villagers.get(t.id); const c = crimes().find(q => q.id === t.crime);
    if (!th || !c || c.st !== 'aberto' || th.jail || th.set !== v.set || th.aboard || th.ug) { v.hunt = 0; return H.end(v); }
    const seeing = G.dist2(v.x, v.y, th.x, th.y) < 64 && !th.inside;
    if (seeing) {
      t.lastSeen = [th.x, th.y]; t.lost = 0;
      // the thief sees him coming, and may run
      if (G.dist2(v.x, v.y, th.x, th.y) > 4 && !(th.task && th.task.type === 'fugir') && (th.traits || []).includes('Corajoso') !== (G.hash(th.id + S.day) < 0.5)) G.Vg.setTask(th, { type: 'fugir', from: v.id, pri: 2.2, kind: 'fugir' });
      if (G.dist2(v.x, v.y, th.x, th.y) < 0.8) return arrest(v, th, c, H);
      t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.5; H.goto(v, th.x, th.y, false, 3000); }
      v.act = 'run'; H.move(v, dt, 1.25); return;
    }
    // not in sight: to his house; then around where he was last seen; then the guard gives up for today
    if (!t.goal) {
      const hb = th.home && S.buildings.get(th.home);
      t.goal = t.lastSeen && !t.homeSeen ? t.lastSeen : hb ? G.Vg.door(hb) : null; t.homeSeen = !t.lastSeen;
      if (!t.goal || !H.goto(v, t.goal[0], t.goal[1], false, 4000)) { t.look++; t.goal = null; if (t.look > 3) { v.hunt = 0; return H.end(v); } return; }
    }
    if (H.move(v, dt)) {
      // at the door: if he is inside, he is called out
      const hb = th.home && S.buildings.get(th.home);
      if (th.inside && hb && th.inside === hb.id && G.dist2(v.x, v.y, ...G.Vg.door(hb)) < 2) { th.inside = 0; th.sleeping = false; G.Vg.endTask(th); th.x = v.x + 0.3; th.y = v.y + 0.2; return arrest(v, th, c, H); }
      t.goal = null; t.look++; t.lastSeen = null;
      if (t.look > 3) { v.hunt = 0; return H.end(v); }
      const a = G.R() * 6.28; const p = W.randomNear(v.x + Math.cos(a) * 5, v.y + Math.sin(a) * 5, 2); if (p) { t.goal = p; H.goto(v, p[0], p[1], false, 3000); }
    }
    if (t.age > 90) { v.hunt = 0; H.end(v); }
  }
  function runFugir(v, t, dt, H) {
    const S = G.S; const g = S.villagers.get(t.from);
    if (!g || !g.task || g.task.type !== 'prender' || v.jail) return H.end(v);
    v.act = 'run';
    if (!t.to || H.arrived(v)) { const a = Math.atan2(v.y - g.y, v.x - g.x) + G.rr(-0.6, 0.6); const p = W.randomNear(v.x + Math.cos(a) * 7, v.y + Math.sin(a) * 7, 2); if (!p || !H.goto(v, p[0], p[1], false, 3000)) return H.end(v); t.to = p; }
    H.move(v, dt, 1.2);
    if (G.dist2(v.x, v.y, g.x, g.y) > 200 || t.age > 25) { H.end(v); }
  }
  function arrest(g, th, c, H) {
    const S = G.S; const set = S.settlements.get(th.set); const f = G.Fac.ofV(th);
    const law = Cr.sentence(f);
    // the coin goes back to the house it was taken from (what is left of it)
    const back = Math.min(c.n, th.purse || 0); if (back > 0) { th.purse -= back; const h = S.buildings.get(c.house); if (h) h.coin = (h.coin || 0) + back; }
    c.st = 'preso'; c.by = g.id; c.dayArrest = S.day; th.caught = S.day; g.hunt = 0;
    const jail = jailsOf(th.set).find(b => b.built && inmates(b) < G.BDEF.cadeia.cells);
    if (!law.days || !jail) {
      c.st = 'devolvido'; c.how = jail ? law.how : law.days ? 'não havia cela livre: só a devolução' : law.how;
      bio(th, `Foi peg${oa(th)} por roubar moedas em ${set ? set.name : 'sua cidade'} e teve de devolvê-las.`, null);
      G.Vg.endTask(th); G.Vg.emote(th, 'sad', 2);
      if (set && (set.tier || 0) >= 2 && newsOK(set)) log(`${g.name} pegou ${th.name}, que tinha roubado ${fmt(c.n)} moedas de uma casa de ${set.name}: ${c.how}.`, 'theft', th.x, th.y);
      return H.end(g);
    }
    th.jail = jail.id; th.jailUntil = S.day + law.days; c.how = law.how; c.jail = jail.id;
    bio(th, `Foi pres${oa(th)} por roubar moedas de uma casa de ${set ? set.name : 'sua cidade'}: ${law.how}.`, `Roubei uma vez, e paguei na cela de ${set ? set.name : 'minha cidade'}`);
    bio(g, `Prendeu ${th.name}, que tinha roubado uma casa de ${set ? set.name : 'sua cidade'}.`, `Peguei um ladrão com as moedas ainda no bolso`);
    G.Vg.setTask(th, { type: 'levado', by: g.id, pri: 5.4, kind: 'levado' });
    G.Vg.setTask(g, { type: 'levar', id: th.id, jail: jail.id, pri: 3.2, kind: 'levar', st: 0 });
    if (set && newsOK(set)) log(`${g.name} prendeu ${th.name}, que roubou ${fmt(c.n)} moedas de uma casa de ${set.name}. Vai para a cadeia: ${law.how}.`, 'theft', th.x, th.y);
    G.Stories && G.Stories.signal && G.Stories.signal('arrest', { fac: f ? f.id : 0, id: th.id, by: g.id, set: th.set, x: th.x, y: th.y });
  }
  const fmt = n => (Math.round(n * 10) / 10).toString().replace('.', ',');
  function newsOK(set) { const u = set.urb || (set.urb = { d: [], names: [] }); if (G.S.day - (u.lawNews === undefined ? -99 : u.lawNews) < 2) return false; u.lawNews = G.S.day; return true; }
  // the walk to the jail: the guard ahead, the thief bound behind him
  function runLevar(v, t, dt, H) {
    const S = G.S; const th = S.villagers.get(t.id); const b = S.buildings.get(t.jail);
    if (!th || !b || !b.built || th.jail !== b.id) return H.end(v);
    const [dx, dy] = G.Vg.door(b);
    if (t.st === 0) { if (!H.goto(v, dx, dy, false, 5000)) { jailIn(th, b); return H.end(v); } t.st = 1; return; }
    if (H.move(v, dt, 0.8) || t.age > 80) { jailIn(th, b); H.end(v); }
  }
  function runLevado(v, t, dt, H) {
    const S = G.S; const g = S.villagers.get(t.by);
    if (!v.jail) return H.end(v);
    if (!g || !g.task || g.task.type !== 'levar') { const b = S.buildings.get(v.jail); if (b) jailIn(v, b); return H.end(v); }
    v.act = 'bound';
    const d = G.dist(v.x, v.y, g.x, g.y);
    if (d > 1.1) { t.rt = (t.rt || 0) - dt; if (t.rt <= 0 || H.arrived(v)) { t.rt = 0.6; H.goto(v, g.x + G.rr(-0.4, 0.4), g.y + G.rr(-0.4, 0.4), false, 2000); } H.move(v, dt, 1.05); }
    if (d > 20) { v.x = g.x + G.rr(-0.4, 0.4); v.y = g.y + G.rr(-0.4, 0.4); }
  }
  function jailIn(v, b) { const [dx, dy] = G.Vg.door(b); v.x = dx; v.y = dy; G.Vg.setTask(v, { type: 'cela', id: b.id, pri: 5.3, kind: 'cela' }); v.inside = b.id; }
  // in the cell: the days pass; at night a jail without its jailer may lose a bold prisoner
  function runCela(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.id);
    if (!b || !b.built || v.jail !== b.id) { v.jail = 0; v.jailUntil = 0; v.inside = 0; return H.end(v); }
    v.inside = b.id; v.moving = false;
    const night = G.isNight(); v.sleeping = night; v.act = night ? 'sleep' : 'sit';
    // the bread of the jail comes from the town's store
    if (v.hunger > 60) { const f = G.Fac.ofSet(b.set); if (f && f.stock.food >= 1) { f.stock.food -= 1; v.hunger = Math.max(0, v.hunger - 45); } }
    if (S.day >= (v.jailUntil || 0)) return release(v, b, 'cumpriu', H);
  }
  function release(v, b, how, H) {
    const S = G.S; const [dx, dy] = G.Vg.door(b);
    v.jail = 0; v.jailUntil = 0; v.inside = 0; v.sleeping = false; v.x = dx; v.y = dy;
    const c = crimes().slice().reverse().find(q => q.thief === v.id && q.st === 'preso'); if (c) c.st = how === 'fugiu' ? 'fugiu' : 'cumprido';
    if (how === 'fugiu') bio(v, `Fugiu da cadeia numa noite sem carcereiro.`, `Fugi da cadeia numa noite em que ninguém guardava a porta`);
    if (how === 'fugiu') { const set = S.settlements.get(v.set); if (set && newsOK(set)) log(`${v.name} fugiu da cadeia de ${set.name} durante a noite: não havia carcereiro de guarda.`, 'theft', dx, dy); }
    G.Vg.emote(v, how === 'fugiu' ? 'happy' : 'sad', 2);
    return H.end(v);
  }

  // ------------------------------ the economy's hands: jailer, thief, guard ------------------------------
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role !== 'carcereiro' && v.role !== 'vigia') return oldJob(v, H);
    const S = G.S; const set = S.settlements.get(v.set);
    // whoever of the law knows of an open theft goes after the thief
    const c = v.hunt && crimes().find(q => q.id === v.hunt && q.st === 'aberto');
    if (c) { const th = S.villagers.get(c.thief); if (th && th.set === v.set && !th.jail) return H.setTask(v, { type: 'prender', crime: c.id, id: th.id, pri: 1.6, st: 0, look: 0 }); v.hunt = 0; }
    if (v.role === 'carcereiro') {
      const b = v.job && S.buildings.get(v.job); if (!b || !b.built || b.type !== 'cadeia') return null;
      return H.setTask(v, { type: 'guard', id: b.id, pri: 1, dur: G.rr(30, 50), jailer: 1 });
    }
    // the watchman: by day a short walk past the squares and the market, a rest in the shade; the night round is given at dusk
    if (!set) return null;
    const pts = rondaPoints(set); if (pts.length < 2) return null;
    return H.setTask(v, { type: 'ronda', pts: pts.slice(0, 2), k: 0, pri: 1, st: 0, kind: 'work' });
  };
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    switch (t.type) {
      case 'furto': return runFurto(v, t, dt, H), true;
      case 'ronda': return runRonda(v, t, dt, H), true;
      case 'prender': return runPrender(v, t, dt, H), true;
      case 'fugir': return runFugir(v, t, dt, H), true;
      case 'levar': return runLevar(v, t, dt, H), true;
      case 'levado': return runLevado(v, t, dt, H), true;
      case 'cela': return runCela(v, t, dt, H), true;
    }
    return oldRun(v, t, dt, H);
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    switch (t.type) {
      case 'furto': return t.st < 2 ? 'Andando nas sombras' : t.st === 2 ? 'Mexendo na porta de uma casa' : 'Sumindo na escuridão';
      case 'ronda': return t.torch ? 'Fazendo a ronda da noite com uma tocha' : 'Fazendo a ronda pelas ruas';
      case 'prender': return 'Procurando um ladrão';
      case 'fugir': return 'Fugindo da guarda';
      case 'levar': return 'Levando um preso para a cadeia';
      case 'levado': return 'Preso, levado para a cadeia';
      case 'cela': return `Na cadeia, por mais ${Math.max(0, (v.jailUntil || 0) - G.S.day)} ${Math.max(0, (v.jailUntil || 0) - G.S.day) === 1 ? 'ano' : 'anos'}`;
    }
    return oldText(v, t);
  };
  // (a prisoner is held: no other errand takes him out of the cell or off the guard's rope)
  const HELD = { cela: 1, levado: 1 };
  Cr.held = v => !!(v.task && HELD[v.task.type]);
  // (an errand of the town — a petition, an assembly, a feast, a farewell at the quay, the call to work — does not open
  // the cell: whoever asks for a prisoner gets the prisoner in his cell. Only an upheaval does — fire, panic, a raid,
  // a sacrifice, a task of priority 5 or more —, and that one frees him, below. Every task passes here: villagers.js asks.)
  Cr.keeps = function (v, t) {
    if (!v.jail || !t || HELD[t.type] || (t.pri || 0) >= 5) return null;
    const b = G.S.buildings.get(v.jail); if (!b || b.type !== 'cadeia' || !b.built) return null;
    if (v.task && HELD[v.task.type]) return v.task;
    jailIn(v, b); return v.task;
  };

  // ------------------------------ the days and nights of the town ------------------------------
  let tA = 0, lastNight = -1;
  G.worldHooks.push(() => { tA = 0; lastNight = -1; }); // (a new world, or a save loaded: it starts over)
  Cr.update = function (dt) {
    const S = G.S; if (!S) return;
    tA += dt; if (tA < 2) return; tA = 0;
    const night = G.isNight();
    // the witnesses tell the first guard they cross
    for (const o of S.villagers.values()) {
      if (!o.saw || !o.saw.crime) continue;
      if (S.day - o.saw.day > 6) { o.saw = null; continue; }
      const c = crimes().find(q => q.id === o.saw.crime); if (!c || c.st !== 'aberto') { o.saw = null; continue; }
      if (o.sleeping || o.inside) continue;
      for (const g of S.villagers.values()) {
        if (g === o || g.set !== o.set || !WATCH[g.role] || g.captive || g.sleeping || g.inside || g.hunt) continue;
        if (G.dist2(g.x, g.y, o.x, o.y) > 36) continue;
        g.hunt = c.id; c.told = c.told || S.day; o.saw = null;
        G.Vg.emote(o, 'chat', 1.5); G.Vg.emote(g, 'angry', 1.5);
        if (!(g.task && g.task.pri >= 1.65)) G.Vg.setTask(g, { type: 'prender', crime: c.id, id: c.thief, pri: 1.65, st: 0, look: 0, kind: 'prender' });
        break;
      }
    }
    // at dusk, the watchman of each town (or, without one, a soldier) takes the night round (a real watch: he stays awake for it)
    if (G.isEvening()) for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
      if ((set.tier || 0) < 2 || (set.watchDay === S.day)) continue;
      let best = null, bs = -1e9;
      for (const g of S.villagers.values()) {
        if (g.set !== set.id || !WATCH[g.role] || g.captive || g.sleeping || g.inside || g.aboard || g.ug || (g.task && g.task.pri >= 1.6)) continue;
        const sc = (g.energy || 50) + (g.hunt ? 30 : 0) + (g.role === 'vigia' ? 200 : 0) + G.R() * 10; if (sc > bs) { bs = sc; best = g; }
      }
      if (!best) continue;
      const pts = rondaPoints(set); if (pts.length < 2) continue;
      set.watchDay = S.day;
      G.Vg.setTask(best, { type: 'ronda', pts, k: 0, pri: 1.6, st: 0, loop: 1, kind: 'ronda' });
    }
    // the household wakes to a lighter purse
    if (!night) for (const c of crimes()) if (c.st === 'aberto' && !c.found && S.day > c.day - 1 && S.time > 0.05) c.found = S.day;
    // the night: one theft at most in each town, by whoever has a reason (and the courage)
    const eve = G.isEvening(); const nk = S.day * 2 + (night ? 1 : 0);
    if ((night || eve) && nk !== lastNight) {
      lastNight = nk;
      for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
        if ((set.tier || 0) < 1) continue;
        let best = null, bw = 0;
        for (const v of S.villagers.values()) { if (v.set !== set.id || v.sleeping || v.inside || (v.task && v.task.pri >= 1.6)) continue; const w = desperate(v); if (w > bw) { bw = w; best = v; } }
        if (!best || G.R() > bw * 0.6) continue;
        const h = victimFor(best); if (!h) continue;
        G.Vg.give(best, { type: 'furto', house: h.id, pri: 2.05, st: 0, kind: 'furto' }); // (a theft once begun is not dropped for a passing errand)
      }
    }
    // (a prisoner pulled out of the cell by some upheaval — a fire, a panic, a raid, a ship — is free: the cell is not waiting
    // for him; one whose routine was merely ended — an errand that let go of him — is still behind the bars)
    for (const v of S.villagers.values()) {
      if (!v.jail || (v.task && HELD[v.task.type])) continue;
      const b = S.buildings.get(v.jail);
      if (b && b.type === 'cadeia' && b.built && !v.aboard && !(v.task && v.task.pri >= 5)) { jailIn(v, b); continue; }
      v.jail = 0; v.jailUntil = 0; v.inside = 0;
      const c = crimes().slice().reverse().find(q => q.thief === v.id && q.st === 'preso'); if (c) c.st = 'fugiu';
    }
    // prisoners: a jail with no jailer at its door at night may lose a bold one
    if (night) for (const v of S.villagers.values()) {
      if (!v.jail || !(v.task && v.task.type === 'cela')) continue;
      const b = S.buildings.get(v.jail); if (!b) continue;
      let watch = false; for (const g of S.villagers.values()) if (g.job === b.id && g.task && g.task.type === 'guard' && g.task.id === b.id && !g.sleeping) { watch = true; break; }
      if (!watch && (v.traits || []).includes('Corajoso') && G.R() < 0.008) release(v, b, 'fugiu', G.Vg.H);
    }
  };
})(window.G);
