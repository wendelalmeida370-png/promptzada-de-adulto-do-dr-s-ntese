'use strict';
// ============================================================
//  War at sea, inside the war engine. Not ships each with a mind of their
//  own: FLEETS, with an admiral, a mission, a formation, morale and supplies,
//  that the war council sends — to patrol the home waters, blockade an enemy
//  port, hunt merchantmen, escort a convoy, or carry an army across the sea.
//
//    the crews are people: sailors at the oars, archers and soldiers on the
//      deck, a captain; when a ship goes down they are in the water (rescued
//      by their own, fished out as prisoners, or swimming for a far beach)
//    battles are recorded like the land ones ("a Batalha do Estreito de
//      Svartey"), fought in formation: line, column, crescent, convoy ring
//    damage has parts: the hull (water in the hold), the sail, the mast (a
//      broken mast is half the speed), fire (the crew fights it)
//    boarding is a fight on the decks, man against man, seen from above
//    the amphibious invasion: the army gathers at the port, walks onto the
//      transports, crosses under escort, lands on a beach, forms there — and
//      the land campaign takes over (and comes back to the beach to go home)
// ============================================================
(function (G) {
  const Nv = G.Naval, Wz = G.Wars; if (!Nv || !Wz) return;
  let N = G.N; G.mapHooks.push(n => { N = n; });
  const W = G.W, T = G.T, K = G.Know;
  const Fl = G.Fleets = {};
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const DAY = () => G.DAY_LEN;
  const TAU = Math.PI * 2;
  const P = id => (id && G.S.villagers.get(id)) || null;
  const PD = id => (id ? G.person(id) : null);
  const F = id => G.Fac.get(id);
  const ship = id => G.S.ships.find(o => o.id === id) || null;
  const pick = a => a[Math.floor(G.R() * a.length)];
  const cap1 = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const clamp = G.clamp;
  const fleets = () => G.S.fleets || (G.S.fleets = []);
  Fl.list = fleets;
  Fl.get = id => fleets().find(f => f.id === id) || null;
  Fl.live = fl => fl && fl.st !== 'fim';
  Fl.of = fid => fleets().filter(f => Fl.live(f) && f.fac === fid);
  const ADM = { grego: ['navarco', 'navarca'], romano: ['prefeito da frota', 'prefeita da frota'], egipcio: ['comandante da frota do rei', 'comandante da frota do rei'], asteca: ['senhor das canoas', 'senhora das canoas'], nordico: ['jarl do mar', 'jarl do mar'], classico: ['almirante', 'almirante'] };
  Fl.admTitle = (fl, v) => (ADM[fl.civ] || ADM.classico)[v && v.g === 'f' ? 1 : 0];
  const MISSION = { patrulha: 'patrulhar as águas de casa', bloqueio: 'bloquear o porto inimigo', invasao: 'levar o exército pelo mar', caca: 'caçar os navios do inimigo', escolta: 'escoltar os transportes', socorro: 'levar socorro pelo mar', volta: 'voltar ao porto' };
  Fl.MISSION = MISSION;
  const FORM = { linha: 'linha', coluna: 'coluna', crescente: 'meia-lua', defensiva: 'anel em volta dos transportes', flancos: 'duas alas' };
  Fl.FORM = FORM;

  // ------------------------------ where at sea ------------------------------
  // "o Estreito de Svartey", "as Águas de Argos", "o Mar Aberto"
  Fl.seaPlace = function (x, y) {
    const S = G.S; const near = [];
    if (K) for (const r of K.regions()) { if (!K.big(r)) continue; const d = K.distTo(r, x, y); if (d < 14) near.push([d, r]); }
    near.sort((a, b) => a[0] - b[0]);
    const nm = r => (K.named(r) ? K.name(r) : (() => { const s = [...S.settlements.values()].find(o => K.at(o.cx, o.cy) === r); return s ? s.name : null; })());
    if (near.length >= 2 && near[1][0] < 12) { const a = nm(near[0][1]); if (a) return { of: `do Estreito ${K.de(a).replace(/^de /, 'de ')}`, name: a }; }
    let set = null, sd = 30; for (const s of S.settlements.values()) { const d = G.dist(x, y, s.cx, s.cy); if (d < sd) { sd = d; set = s; } }
    if (set) return { of: `das Águas de ${set.name}`, name: set.name };
    if (near.length) { const a = nm(near[0][1]); if (a) return { of: `do Mar ${K.de(a)}`, name: a }; }
    return { of: 'do Mar Aberto', name: '' };
  };

  // ====================================================================================
  //  THE ADMIRALTY: what each people at war wants from the sea
  // ====================================================================================
  // how many warships a people keeps (Nv.manageFleets asks)
  Fl.wantWarships = function (f, pop, enemies) {
    const naval = G.Civ.t(f.id, 'naval', 1); const aff = G.Expe ? G.Expe.prof(f).aff : 0.4;
    if (!enemies.length) return G.Politics.leaderPe(f).agg > 0.6 && pop > 50 ? 1 : 0;
    // an enemy over the water, or one with ships: the yards work day and night
    const sea = enemies.some(e => !landReach(f, e) || Nv.shipsOf(e.id, 'guerra').length);
    if (!sea) return Math.min(2, Math.floor(pop / 80));
    return clamp(Math.round(1 + pop / 32 * naval * (0.6 + aff)), 1, pop > 400 ? 16 : pop > 200 ? 11 : 7);
  };
  const reachC = new Map();
  function landReach(a, b) {
    const k = a.id + '>' + b.id; const c = reachC.get(k); if (c && c.d === G.S.day) return c.ok;
    const ca = G.Fac.capitalOf(a.id), cb = G.Fac.capitalOf(b.id); let ok = false;
    if (ca && cb) ok = W.sameLand ? W.sameLand(ca.cx, ca.cy, cb.cx, cb.cy) : !!W.findPath(ca.cx, ca.cy, cb.cx, cb.cy, true, N * N);
    reachC.set(k, { d: G.S.day, ok }); return ok;
  }
  Fl.landReach = landReach;
  function crewSize(f) { return clamp(Math.round(G.Fac.pop(f.id) * 0.05), 4, 12); }
  function freeShips(f, kind) { return Nv.shipsOf(f.id, kind).filter(s => !s.fleet && !s.exp && s.st !== 'build' && s.hp > s.maxHp * 0.5 && !Nv.atSea(s)); }
  function council(f) {
    const S = G.S; const ens = G.Fac.enemiesOf(f.id); const mine = Fl.of(f.id);
    if (!ens.length) { for (const fl of mine) if (fl.mission !== 'invasao') recall(fl, 'paz'); return; }
    const docks = Nv.docksOf(f.id).filter(d => Nv.dockInfo(d).moor); if (!docks.length) return;
    const war = Wz.warOf(f.id, ens[0].id);
    const theirs = ens.reduce((n, e) => n + Nv.shipsOf(e.id, 'guerra').filter(s => s.st !== 'build').length, 0);
    const ours = Nv.shipsOf(f.id, 'guerra').filter(s => s.st !== 'build').length;
    const idle = freeShips(f, 'guerra');
    // a home fleet when the enemy has ships
    if (theirs && !mine.some(fl => fl.mission === 'patrulha') && idle.length >= 1) form(f, war, 'patrulha', idle.slice(0, Math.max(1, Math.ceil(idle.length * 0.5))), { dock: docks[0].id });
    // stronger at sea: shut their port (if a land army or a famine can use it)
    const en = ens.find(e => Nv.docksOf(e.id).length && sameSea(f, e));
    if (en && !mine.some(fl => fl.mission === 'bloqueio') && ours > theirs * 1.2 && freeShips(f, 'guerra').length >= 2) {
      const dock = Nv.docksOf(en.id).sort((a, b) => G.Village.pop(b.set) - G.Village.pop(a.set))[0];
      if (dock && G.R() < 0.5 + G.Politics.leaderPe(f).agg * 0.4) form(f, war, 'bloqueio', freeShips(f, 'guerra').slice(0, Math.min(6, Math.max(2, Math.ceil(ours * 0.6)))), { dock: dock.id, fac: en.id });
    }
    // and their fishing boats and merchants are prey
    if (en && !mine.some(fl => fl.mission === 'caca') && freeShips(f, 'guerra').length >= 1 && (f.civ === 'nordico' || G.Civ.t(f.id, 'raid', 1) > 1.2 || ours > theirs * 2) && G.R() < 0.4) form(f, war, 'caca', freeShips(f, 'guerra').slice(0, 2), { fac: en.id });
  }
  function sameSea(a, b) { const da = Nv.docksOf(a.id)[0], db = Nv.docksOf(b.id)[0]; if (!da || !db) return false; const ia = Nv.dockInfo(da), ib = Nv.dockInfo(db); return ia.moor && ib.moor && Nv.compAt(ia.moor[0], ia.moor[1]) === Nv.compAt(ib.moor[0], ib.moor[1]); }
  function nameFleet(f, mission, dock) {
    const set = dock && G.S.settlements.get(dock.set); const civ = f.civ || 'classico';
    const host = { nordico: 'a Frota-Dragão', grego: 'a Esquadra', romano: 'a Classis', egipcio: 'a Frota do Rei', asteca: 'as Canoas de Guerra' }[civ] || 'a Frota';
    if (mission === 'invasao') return `${host} da Invasão`;
    if (mission === 'bloqueio') return `${host} do Bloqueio`;
    if (mission === 'caca') return `os Corsários ${Wz.ofF(f)}`;
    return set ? `${host} de ${set.name}` : `${host} ${Wz.ofF(f)}`;
  }
  // a fleet is born: ships, a commander, the crews called down to the quay
  function form(f, war, mission, ships, o) {
    const S = G.S; o = o || {}; if (!ships.length) return null;
    const d0 = S.buildings.get(o.dock || ships[0].dock);
    const fl = { id: S.nextId++, fac: f.id, civ: f.civ, war: war ? war.id : 0, mission, ships: ships.map(s => s.id), st: 'reunir', t: 0, d: S.day, form: mission === 'invasao' ? 'defensiva' : 'coluna', morale: 70, sunk: 0, taken: 0, lostMen: 0, x: ships[0].x, y: ships[0].y, hd: 0, tgt: o, log: [], battles: [], army: o.army || 0, dock: d0 ? d0.id : ships[0].dock };
    fl.name = nameFleet(f, mission, d0);
    // the admiral: a veteran, a brave one, someone who knows the sea
    const cands = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === f.id && !v.captive && v.age >= 24 && v.age < 62 && v.hp > 60 && !v.aboard && v.id !== f.leader && !(v.task && v.task.pri >= 3.15) && !(G.Expe && G.Expe.memberOf(v.id)));
    const adm = cands.sort((a, b) => ((b.voyages || 0) * 0.6 + (b.vet || 0) * 0.3 + b.courage + (b.role === 'pescador' ? 0.4 : 0)) - ((a.voyages || 0) * 0.6 + (a.vet || 0) * 0.3 + a.courage + (a.role === 'pescador' ? 0.4 : 0)))[0];
    fl.cmd = adm ? adm.id : 0; fl.cmdName = adm ? adm.name : '';
    for (const s of ships) { s.fleet = fl.id; s.mor = 70; }
    fleets().push(fl); if (fleets().length > 60) S.fleets = fleets().filter(x => Fl.live(x) || S.day - (x.end || 0) < 20).slice(-60);
    // the crews: sailors from the quay, archers and soldiers from the levy
    manShips(fl, f, ships, adm);
    if (war) Wz.event(war, `${f.name} reúne ${fl.name.replace(/^(a|o|as|os) /, m => m)}: ${ships.length} ${ships.length > 1 ? 'navios' : 'navio'} sob ${adm ? Fl.admTitle(fl, adm) + ' ' + adm.name : 'um capitão sem nome'}, para ${MISSION[mission]}.`, fl.x, fl.y, 'naval', { quiet: ships.length < 3 && mission !== 'invasao' });
    G.Stories && G.Stories.signal('fleetMobilized', { fleet: fl.id, fac: f.id, war: war ? war.id : 0, mission, n: ships.length, cmd: fl.cmd, x: fl.x, y: fl.y });
    return fl;
  }
  Fl.form = form;
  function manShips(fl, f, ships, adm) {
    const S = G.S; const want = crewSize(f); const taken = new Set();
    // (the levy still gathering in the square can be sent down to the ships instead: at sea, the fleet is the front)
    const levy = v => { const t = v.task; if (!t || t.type !== 'muster') return null; const a = Wz.army(t.army); return a && !a.done && a.phase === 'mobilizar' && a.fac === f.id && a.members.length > 8 ? a : null; };
    const pool = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === f.id && !v.captive && v.age >= 16 && v.age < 56 && v.hp > 55 && !v.aboard && !(v.preg > 0) && v.id !== f.leader && (!(v.task && (v.task.pri >= 3.15 || v.task.type === 'cais')) || levy(v)) && !(G.Expe && G.Expe.memberOf(v.id)));
    pool.sort((a, b) => ((b.role === 'guerreiro') * 3 + (b.role === 'pescador') * 2 + b.courage - (levy(b) ? 1.5 : 0)) - ((a.role === 'guerreiro') * 3 + (a.role === 'pescador') * 2 + a.courage - (levy(a) ? 1.5 : 0)));
    let k = 0;
    for (const s of ships) {
      if (s.kind === 'transporte' && fl.mission === 'invasao') { s.crew = []; continue; }
      const crew = []; if (adm && s === ships[0]) { crew.push(adm); taken.add(adm.id); }
      for (const v of pool) { if (crew.length >= want) break; if (taken.has(v.id)) continue; const d = G.dist(v.x, v.y, s.x, s.y); if (d > 70) continue; const a = levy(v); if (a) { if (a.members.length <= 8) continue; a.members = a.members.filter(id => id !== v.id); } crew.push(v); taken.add(v.id); }
      s.crew = crew.map(v => v.id); s.captain = crew[0] ? crew[0].id : 0;
      const di = Nv._home(s);
      for (const v of crew) { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'embark', ship: s.id, pri: 3.3, kind: 'embark', x: di && di.quay ? di.quay[0] : s.x, y: di && di.quay ? di.quay[1] : s.y, k: k++ }); }
      s.st = 'embark'; s.t = 0;
    }
  }
  // home: the crews step ashore, the ships are laid up
  function recall(fl, why) {
    if (!Fl.live(fl)) return; fl.mission = 'volta'; fl.why = why; fl.st = 'casa'; fl.t = 0;
    const d = G.S.buildings.get(fl.dock); const di = d && Nv.dockInfo(d); const to = di && di.moor ? di.moor : null;
    for (const s of fl.ships.map(ship).filter(Boolean)) { if (to) Nv._sailTo(s, to[0], to[1]); s.post = null; s.grapple = 0; }
  }
  Fl.recall = recall;
  function disband(fl) {
    const S = G.S; fl.st = 'fim'; fl.end = S.day;
    for (const s of fl.ships.map(ship).filter(Boolean)) {
      s.fleet = 0; s.grapple = 0; s.post = null;
      const h = Nv._home(s); const q = h && h.quay ? h.quay : W.nearestLand(s.x, s.y, 6);
      for (const v of Nv.aboardOf(s)) { v.aboard = 0; v.task = null; v.path = null; const p = q ? (W.randomNear(q[0], q[1], 1.2) || q) : W.nearestLand(s.x, s.y, 8); if (p) { v.x = p[0]; v.y = p[1]; } if (v.captive && v.captive.toFac) { /* (prisoners walk off into the town that took them) */ } }
      if (s.kind !== 'transporte' || !s.exp) { s.crew = []; s.st = 'idle'; s.t = 0; }
    }
    const war = Wz.get(fl.war); if (war && (fl.sunk || fl.taken || fl.battles.length)) Wz.event(war, `${cap1(fl.name)} voltou ao porto${fl.sunk ? ` sem ${fl.sunk} ${fl.sunk > 1 ? 'navios' : 'navio'}` : ''}${fl.taken ? `, com ${fl.taken} ${fl.taken > 1 ? 'navios tomados' : 'navio tomado'} do inimigo` : ''}.`, fl.x, fl.y, 'naval', { quiet: true });
  }

  // ====================================================================================
  //  FORMATION: the fleet moves as one (a centre on its course, each ship on its slot)
  // ====================================================================================
  function slotOf(fl, k, n, s) {
    const f = fl.form; const sp = 1.7; let lat = 0, fwd = 0;
    if (f === 'linha') { lat = (k - (n - 1) / 2) * sp; }
    else if (f === 'coluna') { fwd = -k * sp * 1.1; }
    else if (f === 'crescente') { lat = (k - (n - 1) / 2) * sp; fwd = Math.abs(lat) * 0.4; }
    else if (f === 'flancos') { const side = k % 2 ? 1 : -1; lat = side * 2.6; fwd = -Math.floor(k / 2) * sp; }
    else if (f === 'defensiva') { if (s && s.kind === 'transporte') { const j = fl._tr.indexOf(s.id); lat = (j - (fl._tr.length - 1) / 2) * 1.3; fwd = -Math.abs(lat) * 0.2; } else { const j = fl._es.indexOf(s.id); const a = j / Math.max(1, fl._es.length) * TAU + 0.4; lat = Math.cos(a) * 3.2; fwd = Math.sin(a) * 3.2; } }
    const ch = Math.cos(fl.hd), sh = Math.sin(fl.hd);
    return [fl.x + ch * fwd - sh * lat, fl.y + sh * fwd + ch * lat];
  }
  // the centre advances along its course at the pace of the slowest ship
  function steer(fl, ships, dt) {
    const path = fl.path; if (!path || fl.pi >= path.length) return true;
    const p = path[fl.pi]; const dx = p[0] - fl.x, dy = p[1] - fl.y; const d = Math.hypot(dx, dy);
    let sp = 1e9; for (const s of ships) { const m = Nv.SHIP[s.kind].sp * G.Civ.t(s.fac, 'naval', 1) * Nv.spMul(s) * (s.wind || 1); if (m < sp) sp = m; }
    sp = Math.min(sp, 2) * 0.85 * (G.S.weather.storm > 0 ? 0.7 : 1) * dt;
    // (nobody is left behind: the centre waits for stragglers)
    const lag = ships.reduce((m, s) => Math.max(m, G.dist(s.x, s.y, fl.x, fl.y)), 0); if (lag > 7) sp *= 0.25;
    if (d <= sp) { fl.x = p[0]; fl.y = p[1]; fl.pi++; } else { fl.x += dx / d * sp; fl.y += dy / d * sp; fl.hd = Math.atan2(dy, dx); }
    return fl.pi >= path.length;
  }
  function course(fl, x, y) { const p = Nv.seaPath(fl.x, fl.y, x, y); if (!p) return false; fl.path = p; fl.pi = 0; return true; }
  function keepSlots(fl, ships) {
    fl._tr = ships.filter(s => s.kind === 'transporte').map(s => s.id); fl._es = ships.filter(s => s.kind !== 'transporte').map(s => s.id);
    ships.forEach((s, k) => {
      if (s.grapple || s.ram || s.prize) return;
      const q = slotOf(fl, k, ships.length, s); const w = W.inb(q[0], q[1]) && G.S.type[W.idx(q[0], q[1])] <= T.SEA ? q : Nv._nearestWater(q[0], q[1], 2);
      if (!w) return;
      if (G.dist(s.x, s.y, w[0], w[1]) < 0.6) { s.path = null; return; }
      // (straight there if the water is open, around the rocks if not)
      if (losW(s.x, s.y, w[0], w[1])) { s.path = [w]; s.pi = 0; } else if (!s._rt || G.S.clock - s._rt > 2) { s._rt = G.S.clock; Nv._sailTo(s, w[0], w[1]); }
    });
  }
  function losW(ax, ay, bx, by) { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 0.4); for (let k = 1; k <= n; k++) { const f = k / n; const x = ax + (bx - ax) * f, y = ay + (by - ay) * f; if (!W.inb(x, y) || G.S.type[W.idx(x, y)] > T.SEA) return false; } return true; }

  // ====================================================================================
  //  A FLEET, twice a second
  // ====================================================================================
  function tick(fl, dt) {
    const S = G.S; const f = F(fl.fac); fl.t += dt;
    const ships = fl.ships.map(ship).filter(s => s && s.fleet === fl.id); fl.ships = ships.map(s => s.id);
    if (!f || !f.alive || !ships.length) { if (Fl.live(fl)) { fl.st = 'fim'; fl.end = S.day; } return; }
    // the commander: aboard and alive, or the next captain
    if (fl.cmd && (!P(fl.cmd) || !ships.some(s => Nv.aboardOf(s).some(v => v.id === fl.cmd))) && fl.st !== 'reunir') {
      const was = PD(fl.cmd); const nc = ships.map(s => P(s.captain)).find(v => v && v.aboard);
      if (was && !P(fl.cmd)) { fl.morale -= 15; const war = Wz.get(fl.war); if (war) Wz.event(war, `${cap1(Fl.admTitle(fl, was))} ${was.name}, que comandava ${fl.name}, morreu no mar.`, fl.x, fl.y, 'skull'); G.Stories && G.Stories.signal('captainKilled', { fleet: fl.id, v: was.id, fac: fl.fac, x: fl.x, y: fl.y }); }
      fl.cmd = nc ? nc.id : 0; fl.cmdName = nc ? nc.name : '';
    }
    // a hull with nobody left aboard is no longer a warship: it drifts (or rides at anchor at home)
    if (fl.st !== 'reunir' && fl.st !== 'embarque' && fl.st !== 'partir') for (const s of ships) {
      if (s.kind === 'transporte' && fl.mission === 'invasao') continue;
      if (Nv.aboardOf(s).length) continue;
      s.fleet = 0; s.grapple = 0; s.target = 0; s.prize = 0;
      if (Nv.atSea(s) && G.dist(s.x, s.y, ...(Nv._home(s) && Nv._home(s).moor ? Nv._home(s).moor : [s.x, s.y])) > 6) { s.ghost = 1; s.st = 'deriva'; s.driftT = DAY() * G.rr(0.4, 1); s.exp0 = 0; }
      else { s.st = 'idle'; s.crew = []; }
    }
    fl.ships = fl.ships.filter(id => { const q = ship(id); return q && q.fleet === fl.id; });
    if (!fl.ships.length) { fl.st = 'fim'; fl.end = S.day; return; }
    const war = Wz.get(fl.war);
    if (fl.mission !== 'invasao' && fl.mission !== 'volta' && (!war || war.end || !G.Fac.enemiesOf(f.id).length)) recall(fl, 'paz');
    // morale: the losses, the commander, the odds
    const crewN = ships.reduce((n, s) => n + Nv.aboardOf(s).length, 0);
    fl.morale = clamp(fl.morale + dt * (fl.st === 'combate' ? -0.02 : 0.05), 0, 100);
    switch (fl.st) {
      case 'reunir': {
        // the crews come aboard; the convoy waits for its soldiers
        for (const s of ships) if (s.st === 'embark' && s.kind !== 'transporte' && !s.crew.some(id => { const v = P(id); return v && !v.aboard && v.task && v.task.type === 'embark' && v.task.ship === s.id; })) s.st = 'fleet';
        const ready = ships.every(s => s.st !== 'embark' || s.kind === 'transporte');
        if (ready || fl.t > 70) {
          for (const s of ships) { if (s.st === 'embark' && s.kind !== 'transporte') { for (const id of s.crew) { const v = P(id); if (v && v.task && v.task.type === 'embark') G.Vg.endTask(v); } } if (s.kind !== 'transporte') s.st = 'fleet'; }
          // a ship nobody came to sail stays in port
          for (const s of ships) if (s.kind !== 'transporte' && !Nv.aboardOf(s).length) { s.fleet = 0; s.st = 'idle'; s.crew = []; }
          fl.ships = fl.ships.filter(id => { const s = ship(id); return s && s.fleet === fl.id; });
          const left = fl.ships.map(ship).filter(Boolean);
          if (!left.some(q => q.kind !== 'transporte')) { if (fl.mission !== 'invasao' || !left.length) { disband(fl); break; } }
          fl.st = 'partir'; fl.t = 0; const s0 = left[0]; fl.x = s0.x; fl.y = s0.y;
        }
        break;
      }
      case 'partir': {
        if (fl.mission === 'invasao') { invasionTick(fl, f, ships, dt); break; }
        const tg = target(fl); if (!tg) { recall(fl, 'sem alvo'); break; }
        if (!course(fl, tg[0], tg[1])) { recall(fl, 'sem rota'); break; }
        fl.st = 'navegar'; fl.form = fl.mission === 'bloqueio' ? 'linha' : 'coluna'; break;
      }
      case 'navegar': case 'posto': case 'casa': {
        if (fl.mission === 'invasao' && fl.st !== 'casa') { invasionTick(fl, f, ships, dt); break; }
        const arrived = steer(fl, ships, dt);
        keepSlots(fl, ships);
        if (fl.st === 'casa') { if (arrived) disband(fl); break; }
        // on station: the blockade ring, the patrol circuit, the hunt
        if (arrived) onStation(fl, f, ships);
        break;
      }
      case 'combate': battleTick(fl, f, ships, dt); break;
      case 'retirada': { const arrived = steer(fl, ships, dt); keepSlots(fl, ships); if (arrived) disband(fl); break; }
    }
    // the eyes of the fleet: an enemy fleet (or prey) in sight
    if (fl.st === 'navegar' || fl.st === 'posto' || (fl.mission === 'invasao' && (fl.st === 'travessia' || fl.st === 'espera'))) {
      const foe = enemyNear(fl, ships, fl.mission === 'caca' ? 14 : 11);
      if (foe) engage(fl, f, ships, foe);
    }
    if (fl.st === 'embarque' || fl.st === 'travessia' || fl.st === 'desembarque' || fl.st === 'espera' || fl.st === 'reembarque') invasionTick(fl, f, ships, dt);
    void crewN;
  }
  function target(fl) {
    const S = G.S; const o = fl.tgt || {};
    if (fl.mission === 'bloqueio') { const d = S.buildings.get(o.dock); const di = d && Nv.dockInfo(d); return di && di.moor ? di.moor : null; }
    if (fl.mission === 'patrulha') { const d = S.buildings.get(o.dock || fl.dock); const di = d && Nv.dockInfo(d); if (!di || !di.moor) return null; for (let k = 0; k < 10; k++) { const a = G.R() * TAU, r = G.rr(6, 14); const x = di.moor[0] + Math.cos(a) * r, y = di.moor[1] + Math.sin(a) * r; if (W.inb(x, y) && S.type[W.idx(x, y)] <= T.SEA && Nv.compAt(x, y) === Nv.compAt(di.moor[0], di.moor[1])) return [x, y]; } return di.moor; }
    if (fl.mission === 'caca') { const en = F(o.fac); const d = en && Nv.docksOf(en.id)[0]; const di = d && Nv.dockInfo(d); if (!di || !di.moor) return null; const a = G.R() * TAU; const p = Nv._nearestWater(di.moor[0] + Math.cos(a) * 14, di.moor[1] + Math.sin(a) * 14, 4); return p || di.moor; }
    return null;
  }
  function onStation(fl, f, ships) {
    const S = G.S; const o = fl.tgt || {};
    if (fl.mission === 'bloqueio') {
      const d = S.buildings.get(o.dock); if (!d || G.Village.facOfSet(d.set) !== o.fac || !G.Fac.atWar(f.id, o.fac)) { recall(fl, 'fim do bloqueio'); return; }
      d.blockT = S.clock + 6; fl.form = 'linha';
      if (fl.st !== 'posto') {
        fl.st = 'posto'; fl.blockFrom = fl.blockFrom || S.day; const set = S.settlements.get(d.set); const war = Wz.get(fl.war);
        if (war && !fl.blockLog) fl.blockLog = 1, Wz.event(war, `${cap1(fl.name)} bloqueou o porto de ${set ? set.name : '?'}: nenhum barco de pesca ou mercante sai nem entra.`, d.x, d.y, 'naval');
        G.Stories && G.Stories.signal('blockadeStart', { fleet: fl.id, fac: f.id, set: d.set, x: d.x, y: d.y });
      }
      // empty enemy hulls riding at anchor: a boat goes over and takes them
      for (const o of S.ships) { if (o.fac === f.id || !G.Fac.atWar(f.id, o.fac) || o._nAb > 0 || o.st === 'build' || G.dist2(o.x, o.y, fl.x, fl.y) > 100) continue; const s = ships.find(q => !q.prize && !q.grapple && Nv.aboardOf(q).length >= 3); if (s && !ships.some(q => q.prize === o.id)) s.prize = o.id; }
      for (const s of ships) if (s.prize) { const o = ship(s.prize); if (!o || o._nAb > 0 || o.fac === s.fac) { s.prize = 0; continue; } if (G.dist(s.x, s.y, o.x, o.y) < 1.3) { s.prize = 0; capture(s, o, false, true); } else if (!s.path || s.pi >= s.path.length) { const w = Nv._nearestWater(o.x, o.y, 1) || [o.x, o.y]; Nv._sailTo(s, w[0], w[1]); } }
      // a gentle drift across the harbour mouth
      const di = Nv.dockInfo(d); fl.hd += 0.01; if (G.dist(fl.x, fl.y, di.moor[0], di.moor[1]) > 4) course(fl, di.moor[0], di.moor[1]);
      // the blockade starves: no fish, no trade (and the town feels it)
      if (G.R() < 0.02) { const en = F(o.fac); if (en && en.stock.food > 0) en.stock.food = Math.max(0, en.stock.food - G.Fac.pop(en.id) * 0.02); }
      return;
    }
    // a patrol and a hunt keep moving
    fl.st = 'navegar'; const tg = target(fl); if (tg) course(fl, tg[0], tg[1]);
  }
  function enemyNear(fl, ships, R) {
    const S = G.S; let best = null, bd = R * R;
    const pause = (fl.noFight || 0) > S.clock;
    for (const o of S.ships) {
      if (o.fac === fl.fac || !G.Fac.atWar(fl.fac, o.fac) || o.st === 'build' || o.ghost) continue;
      if (!(o._nAb > 0)) continue;
      if (pause && G.dist2(o.x, o.y, fl.x, fl.y) > 16) continue;
      // (a convoy does not stop for a fishing boat: only real warships are worth a fight)
      if (fl.mission === 'invasao' && (o.kind !== 'guerra' || o._nAb < 3)) continue;
      if (fl.mission === 'patrulha' && Nv.small(o)) continue;
      const d = G.dist2(o.x, o.y, fl.x, fl.y); if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  // ====================================================================================
  //  BATTLE AT SEA
  // ====================================================================================
  function engage(fl, f, ships, foe) {
    const S = G.S; if (fl.st === 'combate') return;
    // (soldiers in the water or on the planks: the escorts shoot back from where they are, the fleet does not sail off to a battle)
    if (fl.mission === 'invasao' && (fl.st === 'embarque' || fl.st === 'desembarque' || fl.st === 'espera' || fl.st === 'reembarque')) return;
    // (an escort with transports to protect fights; a hunter strikes only what it can take)
    const foeFl = foe.fleet ? Fl.get(foe.fleet) : null; const theirShips = foeFl ? foeFl.ships.map(ship).filter(Boolean) : [foe];
    const strong = ships.filter(s => s.kind === 'guerra' && s._nAb >= 2).length; const theirStrong = theirShips.filter(s => s.kind === 'guerra' && s._nAb >= 2).length;
    if (!strong) return;
    if (fl.mission === 'invasao' && theirStrong > strong * 1.6 && fl.st === 'travessia') return; // run for the beach instead
    if (fl.mission === 'caca' && theirStrong > strong) return;
    fl.prevSt = fl.st; fl.st = 'combate'; fl.t = 0; fl.foe = foeFl ? foeFl.id : 0; fl.foeShip = foe.id; fl.hitT = S.clock;
    fl.form = ships.length >= 5 ? 'crescente' : 'linha';
    // (a fishing boat run down by a hunter is not a battle; two war fleets are)
    const big = theirStrong >= 1 || ships.length + theirShips.length >= 4;
    const bt = big ? battleOf(fl, foeFl, foe, ships, theirShips) : null;
    const busy = foeFl && foeFl.mission === 'invasao' && (foeFl.st === 'desembarque' || foeFl.st === 'reembarque' || foeFl.st === 'embarque');
    if (foeFl && foeFl.st !== 'combate' && !busy) { foeFl.prevSt = foeFl.st; foeFl.st = 'combate'; foeFl.t = 0; foeFl.foe = fl.id; foeFl.hitT = S.clock; foeFl.form = theirShips.length >= 5 ? 'crescente' : 'linha'; }
    void bt; void f;
  }
  function battleOf(fl, foeFl, foe, ships, theirs) {
    const S = G.S; const st = Wz.state();
    let bt = st.battles.find(b => b.open && b.naval && (b.fleets || []).some(id => id === fl.id || (foeFl && id === foeFl.id)));
    if (bt) { if (!bt.fleets.includes(fl.id)) bt.fleets.push(fl.id); fl.battle = bt.id; return bt; }
    const x = (fl.x + foe.x) / 2, y = (fl.y + foe.y) / 2; const pl = Fl.seaPlace(x, y);
    const w = Wz.warOf(fl.fac, foe.fac);
    const base = `a Batalha ${pl.of}`; const same = w ? w.battles.map(Wz.battle).filter(b => b && b.base === base).length : 0;
    const name = same ? base.replace('a Batalha', `a ${['', 'Primeira', 'Segunda', 'Terceira', 'Quarta'][same + 1] || 'Nova'} Batalha`) : base;
    bt = { id: st.seq++, war: w ? w.id : 0, name, base, x: +x.toFixed(1), y: +y.toFixed(1), d: S.day, t0: S.clock, t1: 0, sides: {}, winner: 0, bands: [], open: true, ids: [], naval: true, kind: 'naval', fleets: [fl.id].concat(foeFl ? [foeFl.id] : []), ships: {} };
    const side = (fac, list) => { const s = bt.sides[fac] || (bt.sides[fac] = { n: 0, ships: 0, gen: 0, genName: '', dead: 0, wounded: 0, captured: 0, fled: 0, sunk: 0, taken: 0, army: '', bands: [] }); for (const sh of list) { if (bt.ships[sh.id] || (!Nv.aboardOf(sh).length && !sh.grapple)) continue; bt.ships[sh.id] = fac; s.ships++; const ab = Nv.aboardOf(sh); s.n += ab.length; for (const v of ab) if (!bt.ids.includes(v.id)) bt.ids.push(v.id); } };
    side(fl.fac, ships); side(foe.fac, theirs);
    bt.sides[fl.fac].gen = fl.cmd; bt.sides[fl.fac].genName = fl.cmdName; bt.sides[fl.fac].army = fl.name;
    if (foeFl) { bt.sides[foe.fac].gen = foeFl.cmd; bt.sides[foe.fac].genName = foeFl.cmdName; bt.sides[foe.fac].army = foeFl.name; foeFl.battle = bt.id; foeFl.battles.push(bt.id); }
    st.battles.push(bt); if (st.battles.length > 80) st.battles.splice(0, st.battles.length - 80);
    fl.battle = bt.id; fl.battles.push(bt.id); if (w) w.battles.push(bt.id);
    bt.a = fl.fac; bt.b = foe.fac;
    return bt;
  }
  // first blood: now it is a battle, and it has a name
  function blood(bt) {
    if (!bt || bt.started || !bt.open) return; bt.started = 1;
    const w = Wz.get(bt.war); const A = F(bt.a), B = F(bt.b); if (!A || !B) return;
    const nA = bt.sides[bt.a].ships, nB = bt.sides[bt.b].ships;
    if (nA + nB >= 3 && w) Wz.event(w, `${cap1(bt.name)} começa: ${nA} ${nA > 1 ? 'navios' : 'navio'} de ${A.name} contra ${nB} de ${B.name}.`, bt.x, bt.y, 'naval');
    G.Stories && G.Stories.signal('navalBattleStart', { battle: bt.id, war: w ? w.id : 0, x: bt.x, y: bt.y, a: bt.a, b: bt.b, n: nA + nB });
    G.UI && (G.UI.viewFac === bt.a || G.UI.viewFac === bt.b) && G.UI.notice(`${cap1(bt.name)}!`, 'naval');
  }
  // each ship picks a foe; the line closes; arrows, rams, grapples, fire
  function battleTick(fl, f, ships, dt) {
    const S = G.S; const bt = fl.battle && Wz.battle(fl.battle);
    const foes = S.ships.filter(o => o.fac !== fl.fac && G.Fac.atWar(fl.fac, o.fac) && !o.ghost && o.st !== 'build' && G.dist2(o.x, o.y, fl.x, fl.y) < 22 * 22);
    if (!foes.filter(o => o._nAb > 0 || o.grapple).length || (bt && !bt.open)) return endFight(fl, f, ships);
    if (!fl.hitT) fl.hitT = S.clock; if (S.clock - fl.hitT > 45) return endFight(fl, f, ships);
    // the centre closes on theirs
    let cx = 0, cy = 0; for (const o of foes) { cx += o.x; cy += o.y; } cx /= foes.length; cy /= foes.length;
    fl.hd = Math.atan2(cy - fl.y, cx - fl.x);
    if (G.dist(fl.x, fl.y, cx, cy) > 3) { const w = Nv._nearestWater(G.lerp(fl.x, cx, 0.15), G.lerp(fl.y, cy, 0.15), 2); if (w) { fl.x = w[0]; fl.y = w[1]; } }
    // the fleet's nerve
    const lostShips = bt ? (bt.sides[fl.fac] ? bt.sides[fl.fac].sunk + bt.sides[fl.fac].taken : 0) : 0; const n0 = bt && bt.sides[fl.fac] ? bt.sides[fl.fac].ships : ships.length;
    if (lostShips / Math.max(1, n0) > 0.4 && !fl.hit40) { fl.hit40 = 1; fl.morale -= 20; }
    const odds = foes.filter(o => o.kind === 'guerra').length / Math.max(1, ships.filter(s => s.kind === 'guerra').length);
    if (odds > 2) fl.morale -= dt * 2;
    if (fl.morale < 25 && fl.st === 'combate') { flee(fl, f, ships, 'moral'); return; }
    // ship by ship
    const used = new Map();
    for (const s of ships) {
      if (s.grapple) { boardTick(s, dt); continue; }
      if (fl.mission === 'invasao' && s.kind === 'transporte') continue; // (the transports keep to the ring)
      let tg = s.target && ship(s.target); if (!tg || !foes.includes(tg) || (S.clock - (s.tgT || 0) > 6)) { tg = null; let bd = 1e9; for (const o of foes) { const d = G.dist2(s.x, s.y, o.x, o.y) * (1 + (used.get(o.id) || 0) * 0.6) * (o.kind === 'transporte' ? 0.6 : 1); if (d < bd) { bd = d; tg = o; } } s.target = tg ? tg.id : 0; s.tgT = S.clock; }
      if (!tg) continue; used.set(tg.id, (used.get(tg.id) || 0) + 1);
      fight(s, tg, fl, bt, dt);
    }
    // the ships still in line keep their slots (the engaged ones fight where they are)
    keepSlots(fl, ships.filter(s => !s.target || G.dist(s.x, s.y, (ship(s.target) || s).x, (ship(s.target) || s).y) > 6));
  }
  function fight(s, tg, fl, bt, dt) {
    const S = G.S; const d = G.dist(s.x, s.y, tg.x, tg.y); s.cd = (s.cd || 0) - dt; s.ramCd = (s.ramCd || 0) - dt;
    const ab = Nv.aboardOf(s); const fighters = ab.length; if (!fighters) return;
    const hull = Nv.HULL[s.civ] || Nv.HULL.classico; const storm = S.weather.storm > 0;
    // close in (or hold off, for the archers)
    if (d > 3.6) { if (!s.path || s.pi >= s.path.length || (s._ft = (s._ft || 0) - dt) <= 0) { s._ft = 1.2; const w = Nv._nearestWater(tg.x, tg.y, 2) || [tg.x, tg.y]; if (losW(s.x, s.y, w[0], w[1])) { s.path = [w]; s.pi = 0; } else Nv._sailTo(s, w[0], w[1]); } return; }
    G.faceTo(s, tg.x - s.x, tg.y - s.y);
    // the ram: rowers at full stroke, straight into the side
    if (hull.ram && s.kind === 'guerra' && s.ramCd <= 0 && d < 2.6 && fighters >= 4 && !Nv.small(tg)) {
      s.ram = 1; const k = Math.min(1, 2.4 * dt / Math.max(0.01, d)); const nx = s.x + (tg.x - s.x) * k, ny = s.y + (tg.y - s.y) * k;
      if (W.inb(nx, ny) && S.type[W.idx(nx, ny)] <= T.SEA) { s.x = nx; s.y = ny; s.moving = true; s.path = null; }
      if (d < 0.95) { s.ramCd = 9; s.ram = 0; blood(bt); Nv._ram(s, tg); tg.flood = Math.max(tg.flood || 0, 25); if (G.R() < 0.25) { tg.mast = 0; shipMorale(tg, -15); } shipMorale(tg, -12); note(bt, 'ram'); }
      return;
    }
    s.path = null; s.moving = false;
    // grapples: when we outnumber them on deck, or they are crippled
    const theirs = Nv.aboardOf(tg).length;
    if (d < 1.4 && s.kind === 'guerra' && fighters >= Math.max(3, theirs * 0.9) && (tg.hp < tg.maxHp * 0.6 || fighters > theirs * 1.3 || tg.kind === 'transporte' || tg.mast === 0) && !tg.grapple) {
      s.grapple = tg.id; tg.grapple = s.id; s.bT = 0; tg.bT = 0;
      const pair = s.id + ':' + tg.id; const fresh = bt && !(bt.pairs || (bt.pairs = [])).includes(pair); if (fresh) { bt.pairs.push(pair); bt.boards = (bt.boards || 0) + 1; }
      const A = F(s.fac), B = F(tg.fac); if (fresh && bt.boards <= 3) log(`Abordagem! Com ${({ romano: 'o corvo, a ponte de abordagem', nordico: 'ganchos e machados', grego: 'os fuzileiros', egipcio: 'ganchos', asteca: 'as mãos nuas e clavas' })[s.civ] || 'ganchos'}, os de ${A.name} saltam para o convés d${Nv.fem(tg) ? 'a' : 'o'} ${Nv.title(tg).replace(/^(a|o) /, '')}.`, 'naval', tg.x, tg.y);
      return;
    }
    // the archers' volleys (and fire arrows): men fall on the other deck
    if (s.cd <= 0 && d < 4.2) {
      s.cd = 1.4 + G.R() * 0.6; s.volley = S.clock;
      const archers = Math.min(8, Math.ceil(fighters * (s.kind === 'transporte' ? 0.4 : 0.6)));
      const acc = (storm ? 0.4 : 1) * (G.Civ.has(s.fac, 'arco') ? 1.25 : 1) * (G.isNight() ? 0.6 : 1);
      let hits = 0; for (let k = 0; k < archers; k++) if (G.R() < 0.12 * acc) hits++;
      const vic = Nv.aboardOf(tg);
      if (hits && fl) fl.hitT = S.clock; const ofl = tg.fleet && Fl.get(tg.fleet); if (hits && ofl) ofl.hitT = S.clock; if (hits) blood(bt);
      for (let k = 0; k < hits && vic.length; k++) { const v = vic[Math.floor(G.R() * vic.length)]; G.Vg.damage(v, G.rr(20, 48), 'arrow'); if (!S.villagers.has(v.id)) { vic.splice(vic.indexOf(v), 1); shipMorale(tg, -6); if (bt && bt.sides[tg.fac]) bt.sides[tg.fac].dead++; if (fl) fl.kills = (fl.kills || 0) + 1; } }
      tg.hp -= archers * 0.25; tg.hurt = 0.25;
      if (G.R() < 0.07 * (s.civ === 'grego' || s.civ === 'romano' ? 1.4 : 1) && !storm) { tg.burn = Math.max(tg.burn || 0, G.rr(6, 12)); shipMorale(tg, -10); note(bt, 'fogo'); }
      if (G.R() < 0.05) { tg.sail = Math.max(0, (tg.sail === undefined ? 100 : tg.sail) - G.rr(15, 35)); }
      G.FX && G.FX.spawn({ x: s.x, y: s.y, h: G.SEA, z: 6, vz: 30, vx: (tg.x - s.x) * 1.1, vy: (tg.y - s.y) * 1.1, g: 60, life: 0.9, s0: 1.2, s1: 1.2, c: '#ffcf6a', k: 4, layer: 1 });
      if (tg.hp <= 0) Nv.sink(tg, s);
    }
  }
  function note(bt, k) { if (bt) bt[k] = (bt[k] || 0) + 1; }
  function shipMorale(s, d) { s.mor = clamp((s.mor === undefined ? 70 : s.mor) + d, 0, 100); }
  // the fight on the decks: one against one, until one side is gone (or strikes its colours)
  function boardTick(s, dt) {
    const S = G.S; const o = ship(s.grapple); if (!o || o.grapple !== s.id || G.dist(s.x, s.y, o.x, o.y) > 2.2) { s.grapple = 0; if (o) o.grapple = 0; return; }
    s.bT = (s.bT || 0) + dt; s.moving = false; s.path = null; if (s.bT < 0.9) return; s.bT = 0;
    const a = Nv.aboardOf(s), b = Nv.aboardOf(o);
    if (!b.length) return capture(s, o);
    if (!a.length) { s.grapple = 0; o.grapple = 0; return; }
    const pw = v => (v.role === 'guerreiro' ? 1.4 : 1) * (v.elite ? 1.4 : 1) * (0.5 + v.courage) * (v.hp / 100) * G.Civ.t(G.Fac.idOfV(v), 'war', 1);
    const x = pick(a), y = pick(b); const win = G.R() < pw(x) / (pw(x) + pw(y));
    const loser = win ? y : x; G.Vg.damage(loser, G.rr(25, 60), 'war');
    for (const q of [s, o]) { const qf = q.fleet && Fl.get(q.fleet); if (qf) qf.hitT = S.clock; }
    blood(battleFor(s) || battleFor(o));
    x.act = 'fight'; y.act = 'fight';
    const bt = battleFor(s); if (!S.villagers.has(loser.id)) { const sd = bt && bt.sides[G.Fac.idOfV(win ? x : y) === s.fac ? o.fac : s.fac]; if (sd) sd.dead++; shipMorale(win ? o : s, -6); }
    s.fightFx = S.clock; o.fightFx = S.clock;
    G.Audio && G.R() < 0.4 && G.Audio.at(o.x, o.y, 'clang', false, 0.3);
    // (outnumbered three to one, the deck strikes its colours)
    const b2 = Nv.aboardOf(o), a2 = Nv.aboardOf(s);
    if (b2.length && a2.length >= b2.length * 3 && (o.mor || 70) < 35) return capture(s, o, true);
  }
  function battleFor(s) { const fl = s.fleet && Fl.get(s.fleet); return fl && fl.battle ? Wz.battle(fl.battle) : null; }
  function capture(s, o, surrender, anchored) {
    const S = G.S; const A = F(s.fac), B = F(o.fac); if (!A || !B) return;
    const bt = battleFor(s) || battleFor(o);
    // the defenders left alive are prisoners; a prize crew crosses over
    const left = Nv.aboardOf(o); const home = G.Fac.capitalOf(A.id);
    for (const v of left) { G.War.enslave(v, B.id, v.set); if (home) v.set = home.id; if (bt && bt.sides[B.id]) bt.sides[B.id].captured++; }
    const ours = Nv.aboardOf(s); const prize = ours.slice(0, Math.max(1, Math.floor(ours.length / 3)));
    for (const v of prize) { v.aboard = o.id; v.task = { type: 'aboard', ship: o.id, pri: 9, st: 0, age: 0 }; s.crew = s.crew.filter(id => id !== v.id); }
    o.crew = left.map(v => v.id).concat(prize.map(v => v.id));
    const ofl = o.fleet && Fl.get(o.fleet); if (ofl) ofl.ships = ofl.ships.filter(id => id !== o.id);
    o.fac = s.fac; o.civ = s.civ; o.dock = s.dock; o.grapple = 0; s.grapple = 0; o.burn = 0; o.target = 0; o.exp = 0; o.mor = 50; o.st = 'fleet'; o.captain = prize[0] ? prize[0].id : 0;
    if (o.kind === 'transporte' && o.army) o.army = 0;
    const fl = s.fleet && Fl.get(s.fleet); if (fl) { o.fleet = fl.id; fl.ships.push(o.id); fl.taken++; }
    if (bt) { if (bt.sides[B.id]) bt.sides[B.id].taken++; bt.ships[o.id] = A.id; }
    if (ofl) shipMorale(o, 0);
    A.st.prizes = (A.st.prizes || 0) + 1;
    log(anchored ? `Os de ${A.name} remaram até ${Nv.title(o)}, ancorad${Nv.fem(o) ? 'a' : 'o'} sem ninguém a bordo, cortaram as amarras e levaram embora.` : `${surrender ? `${cap1(Nv.title(o))} baixou a bandeira` : `Abordagem: os de ${A.name} tomaram ${Nv.title(o)}`}${left.length ? ` — ${left.length} ${left.length > 1 ? 'prisioneiros' : 'prisioneiro'}` : ''}. Agora navega com as cores de ${A.name}.`, 'naval', o.x, o.y);
  }
  // a ship goes down in a fleet: the water is full of men
  Fl.onSink = function (s, by, lost, swimmers) {
    const S = G.S; const fl = s.fleet && Fl.get(s.fleet); const bt = battleFor(s) || (by && battleFor(by));
    if (bt && bt.sides[s.fac]) { bt.sides[s.fac].sunk++; bt.sides[s.fac].dead += lost; }
    if (fl) { fl.sunk++; fl.lostMen += lost; fl.morale -= s.id === fl.ships[0] ? 20 : 10; for (const o of fl.ships.map(ship).filter(Boolean)) shipMorale(o, -6); }
    // friends pull them out; enemies fish them out as prisoners; the rest swim
    for (const v of swimmers) {
      let best = null, bd = 16; for (const o of S.ships) { if (o === s || o.ghost || o.st === 'build') continue; const d = G.dist2(o.x, o.y, v.x, v.y); if (d < bd && Nv.aboardOf(o).length < (G.Expe ? G.Expe.CAP[o.kind] || 10 : 10)) { bd = d; best = o; } }
      if (!best) continue;
      const friend = best.fac === s.fac; if (!friend && !G.Fac.atWar(best.fac, s.fac)) continue;
      if (!friend && G.R() < 0.35) continue;
      G.Vg.endTask(v); v.aboard = best.id; v.task = { type: 'aboard', ship: best.id, pri: 9, st: 0, age: 0 }; best.crew.push(v.id); v.wrecked = null;
      if (!friend) { const cf = F(best.fac); G.War.enslave(v, s.fac, v.set); const home = cf && G.Fac.capitalOf(cf.id); if (home) v.set = home.id; if (bt && bt.sides[s.fac]) bt.sides[s.fac].captured++; }
    }
    if (bt && (bt.sunkLog = (bt.sunkLog || 0) + 1) <= 4 && !Nv.small(s)) G.Stories && G.Stories.signal('shipSunkBattle', { battle: bt.id, ship: s.id, fac: s.fac });
  };
  function flee(fl, f, ships, why) {
    const S = G.S; const war = Wz.get(fl.war); fl.st = 'retirada'; fl.t = 0; fl.form = 'coluna';
    const d = S.buildings.get(fl.dock); const di = d && Nv.dockInfo(d);
    for (const s of ships) { s.grapple = 0; s.target = 0; }
    if (di && di.moor) course(fl, di.moor[0], di.moor[1]);
    for (const s of ships) if (di && di.moor) Nv._sailTo(s, di.moor[0], di.moor[1]);
    if (war) Wz.event(war, `${cap1(fl.name)} rompeu a linha e fugiu${why === 'moral' ? ': ninguém mais acreditava na vitória' : ''}.`, fl.x, fl.y, 'naval');
    const bt = fl.battle && Wz.battle(fl.battle); if (bt && bt.sides[fl.fac]) bt.sides[fl.fac].fled += ships.reduce((n, s) => n + Nv.aboardOf(s).length, 0);
    if (bt) closeBattle(bt);
  }
  function endFight(fl, f, ships) {
    const bt = fl.battle && Wz.battle(fl.battle); if (bt && bt.open) closeBattle(bt);
    fl.noFight = G.S.clock + 25;
    fl.st = fl.prevSt === 'posto' ? 'navegar' : fl.prevSt || 'navegar'; fl.battle = 0; fl.form = fl.mission === 'invasao' ? 'defensiva' : 'coluna';
    for (const s of ships) { s.target = 0; s.grapple = 0; s.ram = 0; }
    if (fl.mission !== 'invasao') { const tg = target(fl); if (tg) course(fl, tg[0], tg[1]); }
    else if (fl.st === 'travessia' && fl.land) course(fl, fl.land.water[0], fl.land.water[1]);
    // battered: home for repairs
    if (ships.filter(s => s.hp < s.maxHp * 0.45 || s.mast === 0).length > ships.length / 2 && fl.mission !== 'invasao') recall(fl, 'reparos');
    void f;
  }
  // the battle's record: who kept the sea
  function closeBattle(bt) {
    const S = G.S; if (!bt.open) return; bt.open = false; bt.t1 = S.clock;
    if (!bt.started) {
      // (two lines looked at each other and nothing happened: no record, no name used up)
      const st = Wz.state(); const k = st.battles.indexOf(bt); if (k >= 0) st.battles.splice(k, 1);
      const w0 = Wz.get(bt.war); if (w0) w0.battles = w0.battles.filter(id => id !== bt.id);
      for (const fid of bt.fleets || []) { const fl = Fl.get(fid); if (fl) { fl.battles = fl.battles.filter(id => id !== bt.id); fl.noFight = S.clock + 70; } }
      return;
    }
    const facs = Object.keys(bt.sides).map(Number);
    const left = {}; for (const id in bt.ships) { const s = ship(+id); if (s && s.fac === bt.ships[id]) left[s.fac] = (left[s.fac] || 0) + 1; }
    const fledF = new Set(); for (const fid of bt.fleets || []) { const fl = Fl.get(fid); if (fl && fl.st === 'retirada') fledF.add(fl.fac); }
    let win = 0, best = -1; for (const k of facs) { const h = (left[k] || 0) * (fledF.has(k) ? 0.3 : 1) - bt.sides[k].sunk * 0.5 - bt.sides[k].taken * 0.7; if (h > best) { best = h; win = k; } }
    bt.winner = win; bt.total = facs.reduce((n, k) => n + bt.sides[k].n, 0);
    const w = Wz.get(bt.war);
    if (w && win) for (const k of facs) { const sd = w.side[k]; if (!sd) continue; if (k === win) sd.won++; else sd.lost++; }
    for (const id of bt.ids) { const v = P(id); if (!v) continue; v.vet = (v.vet || 0) + 1; G.Life && G.Life.bio(v, 'battle', bt.name, G.Fac.idOfV(v) === win ? 1 : 0); }
    const parts = facs.map(k => { const s = bt.sides[k]; const loss = []; if (s.sunk) loss.push(`${s.sunk} ${s.sunk > 1 ? 'afundados' : 'afundado'}`); if (s.taken) loss.push(`${s.taken} ${s.taken > 1 ? 'tomados' : 'tomado'}`); return `${(F(k) || {}).name}: ${s.ships} ${s.ships > 1 ? 'navios' : 'navio'}${loss.length ? ' (' + loss.join(', ') + ')' : ''}`; });
    const dead = facs.reduce((n, k) => n + bt.sides[k].dead, 0), capd = facs.reduce((n, k) => n + bt.sides[k].captured, 0);
    const shipsN = facs.reduce((n, k) => n + bt.sides[k].ships, 0);
    if (shipsN >= 2 && w) {
      const W0 = F(win);
      Wz.event(w, `${cap1(bt.name)} terminou${W0 ? ' — o mar ficou com ' + W0.name : ' sem vencedor'}. ${parts.join(' · ')}. Mortos: ${dead}${capd ? ', prisioneiros: ' + capd : ''}${bt.boards ? `, ${bt.boards} ${bt.boards > 1 ? 'abordagens' : 'abordagem'}` : ''}${bt.fogo ? ', navios em chamas' : ''}.`, bt.x, bt.y, 'naval');
      if (shipsN >= 6 && G.UI) G.UI.toast(cap1(bt.name).replace(/^A /, ''), W0 ? `O mar ficou com ${W0.name}. ${dead} mortos.` : `${dead} mortos.`, 'naval');
      if (dead >= 12 && G.Lore && G.Lore.legend) G.Lore.legend('bt' + bt.id, cap1(bt.name).replace(/^A /, ''), `No dia ${bt.d}, ${parts.join(' · ')}. ${W0 ? W0.name + ' ficou com o mar.' : ''} ${dead} morreram na água.`, { kind: 'war' });
      if (W0 && G.Expe) { G.Expe.mark(W0, 'vitoria'); for (const k of facs) if (k !== win && F(k)) G.Expe.mark(F(k), 'derrota'); }
    }
    G.Stories && G.Stories.signal('navalBattleEnd', { battle: bt.id, war: w ? w.id : 0, winner: win, x: bt.x, y: bt.y, ids: bt.ids.slice(0, 120), dead });
    G.Stories && G.Stories.signal('battleEnd', { battle: bt.id, war: w ? w.id : 0, winner: win, x: bt.x, y: bt.y, ids: bt.ids.slice(0, 120), dead });
  }

  // ====================================================================================
  //  THE AMPHIBIOUS INVASION (an army that crosses the sea)
  // ====================================================================================
  // the war council wants a city over the water: the levy gathers at the port, not on a road
  Fl.amphibious = function (w, f, tgt, o) {
    const S = G.S; o = o || {}; if (!tgt || !G.Civ.has(f.id, 'navegacao')) return null;
    if (fleets().some(fl => Fl.live(fl) && fl.fac === f.id && fl.mission === 'invasao')) return null;
    const docks = Nv.docksOf(f.id).filter(d => Nv.dockInfo(d).moor); if (!docks.length) return null;
    // the beach: near the target, reachable from one of our ports
    let best = null, bd = 1e9;
    for (const d of docks) { const di = Nv.dockInfo(d); const c = Nv.compAt(di.moor[0], di.moor[1]); const l = Nv.landing(tgt, c); if (!l) continue; const dd = G.dist(di.moor[0], di.moor[1], l.water[0], l.water[1]); if (dd < bd) { bd = dd; best = { d, l }; } }
    if (!best) return null;
    const from = S.settlements.get(best.d.set); if (!from) return null;
    const g = w.goals[f.id] || { imp: 2 };
    let n = o.n || Wz.levySize(f, g.imp || 2, Wz.adults(f.id)); if (o.reinforce) n = Math.round(n * 0.6);
    // the ships limit the army: transports to build (or borrow) and escorts to spare
    const trCap = (G.Expe ? G.Expe.CAP.transporte : 22);
    n = Math.min(n, 140);
    const haveTr = freeShips(f, 'transporte').length; const canBuild = Math.floor(f.stock.wood / (Nv.SHIP.transporte.cost + 6));
    const nTr = Math.min(Math.ceil(n / trCap), haveTr + canBuild, 7); n = Math.min(n, nTr * trCap);
    if (n < 8) return null;
    // the levy, by the book of the land war: muster at the quay
    const quay = Nv.dockInfo(best.d).quay || [from.cx, from.cy];
    const a = Wz.mobilizeAt(w, f, tgt, from, quay, n, { reinforce: !!o.reinforce, sea: 1 });
    if (!a) return null;
    // the ships: the idle transports first, the rest on the slip; the warships as escort
    const trs = freeShips(f, 'transporte').slice(0, nTr);
    while (trs.length < nTr) { const s = Nv.spawn('transporte', f, best.d, { build: 1 }); if (!s) break; trs.push(s); }
    const esc = freeShips(f, 'guerra').slice(0, Math.max(1, Math.ceil(trs.length * 0.8)));
    const fl = form(f, w, 'invasao', esc.concat(trs), { dock: best.d.id, army: a.id, set: tgt.id });
    if (!fl) return a;
    fl.land = best.l; fl.target = tgt.id; a.sea = fl.id; fl.army = a.id; fl.st = 'reunir';
    for (const s of trs) { if (s.st !== 'build') s.st = 'embark'; s.army = a.id; s.crew = []; }
    Wz.event(w, `${f.name} vai atravessar o mar: ${n} soldados se juntam no porto de ${from.name}, e ${trs.length} ${trs.length > 1 ? 'transportes' : 'transporte'}${esc.length ? ` com ${esc.length} de escolta` : ''} vão levá-los até ${tgt.name}.`, quay[0], quay[1], 'naval');
    return a;
  };
  // the levy is gathered: from the rally point to the planks
  Fl.embark = function (a) {
    const S = G.S; const fl = Fl.get(a.sea); if (!fl) return false;
    const ms = a.members.map(P).filter(v => v && v.task && v.task.type === 'muster' && v.task.army === a.id);
    const all = fl.ships.map(ship).filter(s => s && s.kind === 'transporte');
    // (the hulls still on the slip: the army waits on the quay)
    if (all.some(s => s.st === 'build')) return 'wait';
    const trs = all; if (!trs.length) return false;
    for (const s of trs) s.st = 'embark';
    let k = 0;
    for (const v of ms) {
      const s = trs[k % trs.length]; k++;
      if (!s.crew.includes(v.id)) s.crew.push(v.id);
      const di = Nv._home(s); G.Vg.endTask(v); G.Vg.setTask(v, { type: 'embark', ship: s.id, pri: 3.3, kind: 'embark', x: di && di.quay ? di.quay[0] : s.x, y: di && di.quay ? di.quay[1] : s.y, army: a.id });
    }
    a.phase = 'embarque'; a.embT = S.clock; fl.st = 'embarque'; fl.t = 0;
    const w = Wz.get(a.war); if (w) Wz.event(w, `${cap1(a.name)} sobe nos transportes: ${ms.length} soldados, de escudo nas costas, pela prancha um a um.`, a.muster[0], a.muster[1], 'naval', { quiet: ms.length < 20 });
    return true;
  };
  function invasionTick(fl, f, ships, dt) {
    const S = G.S; const a = Wz.army(fl.army); const w = Wz.get(fl.war);
    const trs = ships.filter(s => s.kind === 'transporte');
    const tgt = S.settlements.get(fl.target);
    if (!a || a.done) { if (fl.st !== 'casa' && fl.st !== 'espera' && fl.st !== 'reembarque') { recall(fl, 'sem exército'); } }
    switch (fl.st) {
      case 'partir': case 'reunir': break;
      case 'embarque': {
        // the soldiers walk up the planks (the transports wait; the escorts are already manned)
        const aboard = trs.reduce((n, s) => n + Nv.aboardOf(s).length, 0);
        const walking = trs.reduce((n, s) => n + s.crew.filter(id => { const v = P(id); return v && !v.aboard && v.task && v.task.type === 'embark' && v.task.ship === s.id; }).length, 0);
        if ((!walking && aboard) || S.clock - (a ? a.embT : 0) > 70) {
          for (const s of trs) { for (const id of s.crew) { const v = P(id); if (v && !v.aboard && v.task && v.task.type === 'embark') G.Vg.endTask(v); } s.crew = s.crew.filter(id => { const v = P(id); return v && v.aboard === s.id; }); s.st = 'fleet'; }
          if (!aboard) { recall(fl, 'ninguém embarcou'); if (a) { a.done = true; a.phase = 'dispersado'; } break; }
          if (a) { a.phase = 'travessia'; a.members = trs.flatMap(s => s.crew); }
          fl.st = 'travessia'; fl.t = 0; fl.form = 'defensiva'; const s0 = ships[0]; fl.x = s0.x; fl.y = s0.y;
          if (!course(fl, fl.land.water[0], fl.land.water[1])) { recall(fl, 'sem rota'); break; }
          if (w) Wz.event(w, `A frota de invasão de ${f.name} zarpou: ${aboard} soldados em ${trs.length} ${trs.length > 1 ? 'transportes' : 'transporte'}, rumo a ${tgt ? tgt.name : 'terra inimiga'}.`, fl.x, fl.y, 'naval');
          G.Stories && G.Stories.signal('invasionSailed', { fleet: fl.id, army: a ? a.id : 0, fac: f.id, war: w ? w.id : 0, x: fl.x, y: fl.y });
        }
        break;
      }
      case 'travessia': {
        // peace was made while they were at sea: the bow turns for home with everyone aboard (no one is put ashore for nothing)
        if (!w || w.end || !a || a.done) {
          if (w && !fl.peaceTurn) { fl.peaceTurn = 1; Wz.event(w, `A paz chegou antes da praia: ${fl.name} deu meia-volta no meio do mar, com os soldados a bordo.`, fl.x, fl.y, 'naval'); }
          if (a && !a.done) { a.done = true; a.phase = 'retorno'; }
          recall(fl, 'paz'); break;
        }
        const arrived = steer(fl, ships, dt); keepSlots(fl, ships);
        // the soldiers eat from the transports' stores (the army's wagons came aboard)
        if (arrived || G.dist(fl.x, fl.y, fl.land.water[0], fl.land.water[1]) < 2.5) {
          fl.st = 'desembarque'; fl.t = 0; fl.dq = 0;
          for (const s of trs) { const w2 = Nv._nearestWater(fl.land.water[0] + G.rr(-1.5, 1.5), fl.land.water[1] + G.rr(-1.5, 1.5), 2) || fl.land.water; s.path = [w2]; s.pi = 0; }
          if (w) Wz.event(w, `Desembarque! Os transportes de ${f.name} encostam na praia perto de ${tgt ? tgt.name : 'terra inimiga'}, e os soldados pulam na água rasa.`, fl.land.land[0], fl.land.land[1], 'naval');
          G.Stories && G.Stories.signal('amphibiousLanding', { fleet: fl.id, army: a ? a.id : 0, fac: f.id, war: w ? w.id : 0, set: fl.target, x: fl.land.land[0], y: fl.land.land[1] });
          if (tgt) tgt.alarmT = Math.max(tgt.alarmT || 0, 25);
        }
        break;
      }
      case 'desembarque': {
        // two by two off each transport, wading ashore
        fl.dq -= dt; if (fl.dq > 0) break; fl.dq = 0.5;
        let left = 0;
        // (soldiers fished out of the water by the escorts after a transport went down land too; the escorts keep their own crews)
        const mem = new Set(a ? a.members : []);
        for (const s of ships) {
          const ab = s.kind === 'transporte' ? Nv.aboardOf(s) : Nv.aboardOf(s).filter(v => mem.has(v.id) && v.id !== fl.cmd); left += ab.length;
          if (s.kind !== 'transporte') for (const v of ab.slice(0, 2)) { const k = s.crew.indexOf(v.id); if (k >= 0) s.crew.splice(k, 1); }
          for (const v of ab.slice(0, 2)) { v.aboard = 0; v.task = null; v.path = null; const p = W.randomNear(fl.land.land[0], fl.land.land[1], 2) || fl.land.land; v.x = p[0]; v.y = p[1]; G.FX && G.FX.splash(v.x, v.y, 0.3); G.Vg.setTask(v, { type: 'praia', fleet: fl.id, k: (fl.landedN = (fl.landedN || 0) + 1), pri: 3.3, st: 0 }); }
        }
        defend(fl, ships, dt);
        if (left > 0 && fl.t < 60) break;
        // the beachhead: the army forms on the sand and the land war takes over
        if (a && !a.done) {
          // (everyone of the army on the sand, the ones holding the beachhead and the ones who lost their place in it)
          const mem2 = new Set(a.members);
          const ashore = [...S.villagers.values()].filter(v => !v.aboard && !v.captive && ((v.task && v.task.type === 'praia' && v.task.fleet === fl.id) || (mem2.has(v.id) && G.dist(v.x, v.y, fl.land.land[0], fl.land.land[1]) < 14)));
          a.members = ashore.map(v => v.id); a.muster = fl.land.land.slice(); a.beach = fl.land.land.slice(); a.phase = 'mobilizar'; a.called = S.clock - DAY();
          ashore.forEach((v, k) => { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'muster', army: a.id, k, pri: 3.15, kind: 'muster', st: 2 }); });
          Wz.formNow(a); const b = a.band && G.War.bands.get(a.band); if (b) b.fleet = fl.id;
        }
        fl.st = 'espera'; fl.t = 0; fl.form = 'linha';
        break;
      }
      case 'espera': {
        // offshore, guarding the beach: the army may need to come back
        keepSlots(fl, ships); defend(fl, ships, dt);
        const b = a && a.band && G.War.bands.get(a.band);
        if (!a || a.done || !b || b.st === 'retorno') {
          fl.st = 'reembarque'; fl.t = 0; fl.dq = 0;
          // an army that never formed on the sand (the war over while they waded ashore): every one of them is called back down to the boats
          if (!b && a) for (const id of a.members) { const v = P(id); if (v && !v.aboard && !v.captive && G.dist(v.x, v.y, fl.land.land[0], fl.land.land[1]) < 60) { G.Vg.endTask(v); G.Vg.setTask(v, { type: 'reembarque', fleet: fl.id, pri: 3.35, st: 0 }); } }
          break;
        }
        if (fl.t > DAY() * 6) { fl.st = 'reembarque'; fl.t = 0; }
        break;
      }
      case 'reembarque': {
        // whoever reaches the beach climbs back aboard
        keepSlots(fl, ships);
        fl.dq -= dt; if (fl.dq > 0) break; fl.dq = 0.6;
        const nearBeach = [...S.villagers.values()].filter(v => !v.aboard && G.Fac.idOfV(v) === f.id && (v.task && (v.task.type === 'reembarque' || (v.task.type === 'band' && v.task.band && (G.War.bands.get(v.task.band) || {}).fleet === fl.id))) && G.dist(v.x, v.y, fl.land.land[0], fl.land.land[1]) < 3);
        for (const v of nearBeach.slice(0, 4)) { const s = trs.sort((x, y) => Nv.aboardOf(x).length - Nv.aboardOf(y).length)[0] || ships[0]; G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; if (!s.crew.includes(v.id)) s.crew.push(v.id); }
        const coming = [...S.villagers.values()].some(v => !v.aboard && G.Fac.idOfV(v) === f.id && v.task && (v.task.type === 'reembarque' || (v.task.type === 'band' && (G.War.bands.get(v.task.band) || {}).fleet === fl.id)));
        if ((!coming && fl.t > 6) || fl.t > 160) {
          for (const v of S.villagers.values()) if (v.task && v.task.type === 'reembarque' && v.task.fleet === fl.id) G.Vg.endTask(v);
          if (w) Wz.event(w, `A frota de ${f.name} recolheu ${trs.reduce((n, s) => n + Nv.aboardOf(s).length, 0)} soldados da praia e voltou para casa.`, fl.x, fl.y, 'naval', { quiet: true });
          recall(fl, 'fim da campanha');
        }
        break;
      }
    }
  }
  // the escorts shoot back at whoever comes at them while the soldiers are in the water
  function defend(fl, ships, dt) {
    const S = G.S;
    for (const s of ships) {
      if (s.kind !== 'guerra' || s.grapple) continue;
      let tg = null, bd = 25; for (const o of S.ships) { if (o.fac === s.fac || !G.Fac.atWar(s.fac, o.fac) || !(o._nAb > 0)) continue; const d = G.dist2(o.x, o.y, s.x, s.y); if (d < bd) { bd = d; tg = o; } }
      if (tg) { const efl = tg.fleet && Fl.get(tg.fleet); const bt = efl && efl.battle ? Wz.battle(efl.battle) : null; s.path = null; fight(s, tg, fl, bt, dt); }
    }
  }
  // the landed hold the beach in a ring until the last boat is in
  function runPraia(v, t, dt, H) {
    const fl = Fl.get(t.fleet); if (!fl || !fl.land || (fl.st !== 'desembarque' && !(fl.st === 'combate' && fl.prevSt === 'desembarque'))) return H.end(v);
    if (t.st === 0) { const k = t.k || 0; const a = k * 2.39996, r = 0.8 + Math.sqrt(k) * 0.5; const p = W.nearestLand(fl.land.land[0] + Math.cos(a) * r, fl.land.land[1] + Math.sin(a) * r, 2) || fl.land.land; if (!H.goto(v, p[0], p[1], true, 3000)) { t.st = 2; return; } t.st = 1; return; }
    if (t.st === 1) { if (H.move(v, dt, 1.05)) t.st = 2; return; }
    v.moving = false; v.act = t.k % 3 ? 'guard' : 'brandish';
  }
  // soldiers whose campaign is over walk back to the beach (instead of to a home over the sea)
  Fl.bandReturn = function (v, b, t, dt, H) {
    const fl = Fl.get(b.fleet); if (!fl || !fl.land || fl.st === 'casa' || fl.st === 'fim') return false;
    if (fl.st === 'espera') { fl.st = 'reembarque'; fl.t = 0; fl.dq = 0; }
    if (!t.beach) { t.beach = 1; if (!H.goto(v, fl.land.land[0], fl.land.land[1], false, N * N) && !H.goto(v, fl.land.land[0], fl.land.land[1], true, N * N)) return false; }
    H.move(v, dt, 1.1); return true;
  };
  Fl.rout = function (v, b, t, dt, H) {
    const fl = Fl.get(b.fleet); if (!fl || !fl.land) return false;
    if (fl.st === 'espera') { fl.st = 'reembarque'; fl.t = 0; fl.dq = 0; }
    if (!t.beach) { t.beach = 1; H.goto(v, fl.land.land[0], fl.land.land[1], false, N * N); }
    v.act = 'run'; H.move(v, dt, 1.35); return true;
  };
  // a band that came by sea, disbanded on enemy soil: everyone back to the beach
  Fl.onDisband = function (b, v) {
    const fl = Fl.get(b.fleet); if (!fl || !fl.land || !Fl.live(fl) || fl.st === 'casa') return false;
    if (fl.st === 'espera') { fl.st = 'reembarque'; fl.t = 0; fl.dq = 0; }
    G.Vg.endTask(v); G.Vg.setTask(v, { type: 'reembarque', fleet: fl.id, pri: 3.1, st: 0 }); return true;
  };
  function runReembarque(v, t, dt, H) {
    const fl = Fl.get(t.fleet); if (!fl || !fl.land || fl.st === 'casa' || fl.st === 'fim') return H.end(v);
    if (t.st === 0) { if (!H.goto(v, fl.land.land[0], fl.land.land[1], false, N * N) && !H.goto(v, fl.land.land[0], fl.land.land[1], true, N * N)) return H.end(v); t.st = 1; return; }
    if (H.move(v, dt, 1.1)) { v.moving = false; v.act = 'wait'; }
    if (t.age > 200) H.end(v);
  }
  Fl.run = function (v, t, dt, H) { if (t.type === 'reembarque') { runReembarque(v, t, dt, H); return true; } if (t.type === 'praia') { runPraia(v, t, dt, H); return true; } return false; };
  const oldRun = Nv.run; Nv.run = (v, t, dt, H) => Fl.run(v, t, dt, H) || oldRun(v, t, dt, H);
  const oldText = Nv.taskText; Nv.taskText = (v, t) => (t.type === 'reembarque' ? 'Voltando para a praia, para os navios' : t.type === 'praia' ? 'Na cabeça de praia, segurando a areia até todos desembarcarem' : oldText(v, t));
  Fl.aboardText = function (v, s) {
    const fl = s.fleet && Fl.get(s.fleet); if (!fl) return null;
    if (v.captive) return `Prisioneir${v.g === 'f' ? 'a' : 'o'} no porão d${Nv.fem(s) ? 'a' : 'o'} ${Nv.title(s).replace(/^(a|o) /, '')}`;
    if (fl.st === 'combate') return s.grapple ? 'Lutando no convés!' : 'Em batalha no mar!';
    if (fl.mission === 'invasao') return { embarque: 'No transporte, esperando os outros', travessia: 'Atravessando o mar para a guerra', desembarque: 'Pulando na água rasa da praia inimiga', espera: 'De guarda na frota, ao largo da praia', reembarque: 'Recolhendo os soldados da praia' }[fl.st] || 'Na frota de invasão';
    return ({ patrulha: 'Patrulhando as águas de casa', bloqueio: fl.st === 'posto' ? 'No bloqueio do porto inimigo' : 'Navegando para o bloqueio', caca: 'Caçando navios inimigos', volta: 'Voltando ao porto' })[fl.mission] || 'Na frota';
  };

  // ====================================================================================
  //  THE SHIPS OF A FLEET
  // ====================================================================================
  function shipRun(s, dt) {
    const fl = Fl.get(s.fleet);
    if (!fl || !Fl.live(fl)) { s.fleet = 0; s.st = 'idle'; return; }
    s.cd = (s.cd || 0) - dt;
    // the crew fights the fire (the more hands, the sooner)
    if (s.burn > 0) { const n = s._nAb || 0; s.burn -= dt * Math.min(3, n * 0.18); }
    if (s.st === 'embark' || s.st === 'build') return;
    if (s.grapple) { const o = ship(s.grapple); if (o) { s.moving = false; G.faceTo(s, o.x - s.x, o.y - s.y); } return; }
    Nv._move(s, dt);
  }
  const prevWar = Nv.RUN.guerra || Nv.RUN0.guerra;
  Nv.RUN.guerra = (s, dt) => (s.fleet ? shipRun(s, dt) : s.exp ? prevWar(s, dt) : (s.crew && Nv.aboardOf(s).length ? prevWar(s, dt) : null));
  const prevTr = Nv.RUN.transporte || Nv.RUN0.transporte;
  Nv.RUN.transporte = (s, dt) => (s.fleet ? shipRun(s, dt) : prevTr(s, dt));

  // ====================================================================================
  //  UPDATE
  // ====================================================================================
  let tCouncil = 0, tTick = 0, ci = 0;
  Fl.reset = function () { tCouncil = 1; tTick = 0; reachC.clear(); };
  Fl.update = function (dt) {
    tCouncil -= dt; tTick -= dt;
    if (tCouncil <= 0) { tCouncil = 3; const fs = G.Fac.all(); if (fs.length) { for (let k = 0; k < Math.min(2, fs.length); k++) council(fs[ci++ % fs.length]); } }
    if (tTick <= 0) {
      tTick = 0.5; for (const fl of fleets()) if (Fl.live(fl)) { try { tick(fl, 0.5); } catch (e) { console.error('fleet', fl.id, e); fl.st = 'fim'; } }
      // a sea battle nobody is fighting any more (the fleets sank, fled or went home) is closed and counted
      if ((tSweep = (tSweep || 0) - 0.5) <= 0) { tSweep = 5; for (const bt of Wz.state().battles || []) if (bt.naval && bt.open && !fleets().some(fl => Fl.live(fl) && fl.st === 'combate' && fl.battle === bt.id)) closeBattle(bt); }
    }
  };
  let tSweep = 0;

  // ====================================================================================
  //  DRAWN OVER THE SHIPS: planks across, men fighting on the decks, buckets at a fire
  // ====================================================================================
  Fl.drawOver = function (c, s, sx, sy, t, sc, face) {
    const S = G.S;
    if (s.grapple) {
      const o = ship(s.grapple); if (o && s.id < o.id) {
        // the plank (and the grappling lines) between the two hulls
        const q = G.Render.proj(o.x, o.y, W.groundH(o.x, o.y));
        c.strokeStyle = '#8a6438'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(sx, sy - 3); c.lineTo(q[0], q[1] - 3); c.stroke();
        c.strokeStyle = 'rgba(200,184,144,0.8)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(sx - 2, sy - 6); c.lineTo(q[0] + 2, q[1] - 2); c.moveTo(sx + 2, sy - 2); c.lineTo(q[0] - 2, q[1] - 6); c.stroke();
      }
    }
    if (s.fightFx && S.clock - s.fightFx < 1.2) {
      // two figures clashing, blades flashing
      for (let k = 0; k < 2; k++) { const x = sx + (k ? 3 : -3) * sc, y = sy - 6 * sc; c.fillStyle = k ? G.Fac.hex(s.fac) : '#5a3a2a'; c.fillRect(x - 0.9, y, 1.8, 2.8); c.fillStyle = '#c99569'; c.beginPath(); c.arc(x, y - 0.9, 0.9, 0, TAU); c.fill(); }
      if (Math.sin(t * 20 + s.id) > 0.3) { c.strokeStyle = 'rgba(240,240,255,0.9)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(sx - 1, sy - 9 * sc); c.lineTo(sx + 1.5, sy - 6.5 * sc); c.stroke(); }
    }
    if (s.burn > 0 && (s._nAb || 0) > 1) { c.fillStyle = 'rgba(120,170,220,0.8)'; const k = (t * 3 + s.id) % 1; c.beginPath(); c.arc(sx + face * 2, sy - 6 - k * 3, 0.6, 0, TAU); c.fill(); }
    if (s.volley && S.clock - s.volley < 0.4) { c.strokeStyle = 'rgba(80,60,40,0.8)'; c.lineWidth = 0.4; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(sx + k * 3, sy - 8 * sc); c.lineTo(sx + k * 3 + face * 3, sy - 11 * sc); c.stroke(); } }
  };

  // ====================================================================================
  //  SAVE: fleets by ids (their ships and crews are saved with the ships and the people)
  // ====================================================================================
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.fleets = G.S.fleets || []; },
    load(o) {
      const S = G.S; S.fleets = o.fleets || []; Fl.reset();
      for (const fl of S.fleets) {
        if (!Fl.live(fl)) continue;
        // a battle in progress resumes as soon as the lines see each other again
        if (fl.st === 'combate') { const bt = fl.battle && Wz.battle(fl.battle); if (!bt || !bt.open) { fl.st = fl.prevSt || 'navegar'; fl.battle = 0; } }
        for (const s of fl.ships.map(ship).filter(Boolean)) { s.grapple = 0; s.target = 0; s.path = null; }
        if (fl.st === 'navegar' || fl.st === 'casa' || fl.st === 'retirada') { const tg = fl.st === 'navegar' ? target(fl) : (() => { const d = S.buildings.get(fl.dock); const di = d && Nv.dockInfo(d); return di && di.moor; })(); if (tg) course(fl, tg[0], tg[1]); }
        if (fl.st === 'travessia' && fl.land) course(fl, fl.land.water[0], fl.land.water[1]);
        // soldiers waiting on the beach to re-embark keep going there
        if (fl.st === 'reembarque' || fl.st === 'espera') for (const v of S.villagers.values()) if (!v.aboard && G.Fac.idOfV(v) === fl.fac && fl.land && G.dist(v.x, v.y, fl.land.land[0], fl.land.land[1]) < 30 && !v.task) G.Vg.setTask(v, { type: 'reembarque', fleet: fl.id, pri: 3.1, st: 0 });
        if (fl.st === 'embarque') { const a = Wz.army(fl.army); if (a) a.embT = S.clock; }
      }
    },
  });
})(window.G);
