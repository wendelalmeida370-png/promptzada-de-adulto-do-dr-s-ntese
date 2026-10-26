'use strict';
// ============================================================
//  A day at the port: the unloading as one operation of the world.
//  What a ship brings, or a boat's catch, is set down on the quay
//  in crates that belong to an unloading (G.Act 'descarga'): its
//  manifest is what really came, its team the stevedores of the
//  warehouse, the fishermen of the boat, whoever lends a hand —
//  the god's body too, by the same steps. Each crate is lifted,
//  carried and set down in the warehouse; a heavy one takes two
//  (one load in the ledger, two people under it), or a part of it
//  at a time. Each crate delivered is paid to the one who carried
//  it, from the treasury (where there is coin; a ration where
//  there is not). Night stops the work, a fire on the quay burns
//  what is on it, a full warehouse makes the porter wait at the
//  door and the unloading stop; whoever is called away sets the
//  crate down where they are, for another hand. When nothing of
//  it is left on the quay, in hands or on the ground, the foreman
//  counts it at the warehouse door, and it is over.
//  (The same unloading, one person strong, takes a caravan's pack
//  into the store of a town without a port: trade.js.)
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco; if (!A || !D || !E) return;
  const P = G.Porto = {};
  const EPS = 1e-6;
  const S_ = () => G.S;
  const r2 = x => Math.round(x * 100) / 100;
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const say = (v, key, ctx) => G.Falas && G.Falas.say(v, key, ctx);

  // ------------------------------ where things are ------------------------------
  const crateSpot = b => (G.Fishers && G.Fishers.crateSpot ? G.Fishers.crateSpot(b) : G.Vg.door(b));
  // where the porters of a quay take the crates: the harbour warehouse by it, or the store nearest the quay — one they can
  // walk to from the crates (asked of the map of regions in the world's step; a store across a wall is no store for this quay)
  function storeFor(dock, fid, x, y) {
    const S = S_(); let best = null, bd = 1e9; const cx = dock ? dock.x + 1 : x, cy = dock ? dock.y + 1 : y;
    const p = dock && dock.type === 'doca' && G.inSim ? crateSpot(dock) : null;
    for (const b of S.buildings.values()) {
      if (!b.built || !G.BDEF[b.type].dropoff || G.Village.facOfSet(b.set) !== fid || b.type === 'doca') continue;
      let d = G.dist(b.x + b.w / 2, b.y + b.h / 2, cx, cy) - (b.type === 'armazem' ? 6 : 0);
      if (p && d < bd) { const f = G.Village.frontTile(b); if (!G.W.canWalk(p[0], p[1], f[0], f[1], true)) d += 1e5; }
      if (d < bd) { bd = d; best = b; }
    }
    return best || (dock && G.BDEF[dock.type].dropoff ? dock : null);
  }
  // (the overseer chooses it once a second; between, and for a panel, the choice stands)
  // (a store that burnt is a ruin with the same name and still "built": not a store — another is found at once, not at the
  // foreman's next round, so that no porter walks a crate to the ashes)
  P.destOf = function (op) { const b = op.data && op.data.dest && S_().buildings.get(op.data.dest); return b && b.built && b.type !== 'ruin' && G.BDEF[b.type] && G.BDEF[b.type].dropoff ? b : storeFor(S_().buildings.get(op.at), op.fac, op.x, op.y); };
  // do the crates of this quay have a way to that store on foot
  function access(dock, dest) { if (!dock || !dest || dock.type !== 'doca') return !!dest; const p = crateSpot(dock), f = G.Village.frontTile(dest); return G.W.canWalk(p[0], p[1], f[0], f[1], true); }
  P.access = access;
  const live = op => A.live(op);
  P.opAt = function (dock) { for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && live(op)) return op; return null; };
  const cratesOf = (dock, op) => (dock && dock.crates ? dock.crates.filter(c => c.op === op.id) : []);
  // what of an unloading is still out (on the quay, in hands, on the ground)
  function custody(op) {
    const S = S_(); let n = 0;
    const dock = S.buildings.get(op.at); for (const c of cratesOf(dock, op)) n += c.n;
    for (const v of S.villagers.values()) if (v.carry && v.carry.op === op.id) n += v.carry.n;
    for (const o of S.loose || []) if (o.op === op.id) n += o.n;
    return n;
  }
  P.custody = custody;

  // ------------------------------ the cargo comes ashore ------------------------------
  // crates that nobody marks — a quay of an older world, or of an unloading that ended — are taken in by the one under way
  function adopt(op, dock) {
    if (!dock || !dock.crates) return;
    for (const c of dock.crates) if (!c.op) { c.op = op.id; c.by = 0; op.goods[c.k] = r2((op.goods[c.k] || 0) + c.n); const t = op.taken || (op.taken = {}); t[c.k] = r2((t[c.k] || 0) + c.n); A.log(op, 'adotou', c.id, c.k); }
  }
  // the unloading of this quay (one at a time: a new landing adds to the one under way)
  function opFor(dock, why, extra) {
    let op = P.opAt(dock);
    const fid = G.Village.facOfSet(dock.set);
    if (!op) {
      op = A.start('descarga', { at: dock.id, set: dock.set, fac: fid, from: extra && extra.ship ? 's:' + extra.ship : null, stage: 'q:' + dock.id, to: 'f:' + fid, goods: {}, why, x: dock.x + 1, y: dock.y + 1, data: { kind: 'cais', paid: {}, owed: {}, ships: [], boxes: 0 } });
    }
    if (extra && extra.ship && !op.data.ships.includes(extra.ship)) op.data.ships.push(extra.ship);
    return op;
  }
  // goods from a ship's hold (the ship's crew hands them down): crates on the quay as far as they fit, the rest straight
  // into the store, and what has no room even there stacked on the ground of the quay — nothing goes back to sea unseen
  P.land = function (dock, goods, ship) {
    if (!dock || !goods || !(goods.n > EPS)) return 0;
    const S = S_(); const k = goods.k; let n = goods.n; const n0 = n; // (the hold empties as it lands: n0 is what came)
    const op = opFor(dock, 'navio', { ship: ship ? ship.id : 0 });
    op.goods[k] = r2((op.goods[k] || 0) + n);
    // (the hold it comes out of: the ship's cargo, or what a merchant ship brings back in exchange — naval.js lands its
    // s.ret too: read from s.goods, that was nothing, and the return cargo vanished — L-xxx)
    const from = ship && S.ships.includes(ship) ? (goods === ship.ret ? 'r:' : goods === ship.lux ? 'l:' : 's:') + ship.id : null;
    const c0 = { op: op.id, code: 'desembarque', part: true, by: 0 };
    if (from) {
      // (the cargo is the ship's own until it touches the quay: the operation takes it from the hold; a second ship that
      // comes in while the quay is being unloaded is one more source of the same unloading)
      if (!op.from) op.from = from; else if (op.from !== from && !op.srcs.includes(from)) op.srcs.push(from);
      // (a quay with no way on foot to the store — cut off by a wall with no gate — is no place to set crates down: the crew
      // hands the cargo ashore by the way there is, as it does with what has no room on the quay)
      const way = access(dock, storeFor(dock, op.fac));
      if (!way) A.log(op, 'semacesso', dock.id, k);
      const r1 = way ? D.move(from, 'q:' + dock.id, k, n, c0) : { ok: false }; if (r1.ok) n = r2(n - r1.n);
      if (n > EPS) { const r = D.move(from, 'f:' + op.fac, k, n, c0); if (r.ok) n = r2(n - r.n); }
      if (n > EPS) { const p = crateSpot(dock); const r = D.drop(from, k, n, p[0] + 0.4, p[1] + 0.4, Object.assign({}, c0, { fac: op.fac })); if (r.ok) n = r2(n - r.n); }
    }
    // (the manifest is what came ashore: what found no room anywhere is still the ship's)
    if (n > EPS) op.goods[k] = r2(op.goods[k] - n);
    A.log(op, 'chegou', k, r2(n0 - n));
    op.data.boxes = (op.data.boxes || 0) + Math.ceil((n0 - n) / 4);
    dock.lastCargo = S.day;
    return n;
  };
  // a boat's catch: born of the sea (the shoal already gave it), set down in crates; what has no room on the quay goes
  // straight into the store; what has no room there either stays in the boat for the next landing
  P.landCatch = function (dock, k, n, fish, col, boat) {
    if (!dock || !(n > EPS)) return 0;
    const fid = G.Village.facOfSet(dock.set);
    const way = access(dock, storeFor(dock, fid)); // (a quay cut off from the store: the catch goes up by the way there is)
    if ((!way || D.room('q:' + dock.id, k) < 1) && D.room('f:' + fid, k) < 1) return n; // (no room anywhere yet: it stays aboard)
    const op = opFor(dock, 'pesca', null);
    op.goods[k] = r2((op.goods[k] || 0) + n); op.data.boats = op.data.boats || []; if (boat && !op.data.boats.includes(boat)) op.data.boats.push(boat);
    const c0 = { op: op.id, code: 'pesca', part: true, rec: { fish, fishCol: col, catchOf: boat } };
    let left = n;
    const r1 = way ? D.make('q:' + dock.id, k, left, c0) : { ok: false }; if (r1.ok) left = r2(left - r1.n);
    if (left > EPS) { const r = D.make('f:' + op.fac, k, left, c0); if (r.ok) left = r2(left - r.n); }
    // (the part that came ashore: the manifest is what landed)
    if (left > EPS) op.goods[k] = r2(op.goods[k] - left);
    A.log(op, 'pesca', k, r2(n - left));
    return left;
  };

  // ------------------------------ the team ------------------------------
  // who works an unloading: the stevedores of the town's harbour warehouse, the fishermen of the quay, the god's body
  const isPorter = (v, dock) => (v.role === 'estivador' && v.set === dock.set) || (v.role === 'pescador' && v.job === dock.id);
  // whose a crate is (on the quay, or set down on the ground): the hand acting on it now, or the god's body for a while
  function held(x, S) {
    if (!x.by) return false; const o = S.villagers.get(x.by);
    if (o && o.task && (o.task.cid === x.id || o.task.gid === x.id)) return true;
    return !!(o && A.isBody(o) && S.clock - (x.byT || 0) < 60);
  }
  // a crate for this hand: the first of the operation nobody has — on the quay, or set down on the ground (by the store's
  // door when it was full, where a porter was called away) — and only where the hand can walk to (the map of regions says)
  function claim(op, v) {
    const S = S_(); const dock = S.buildings.get(op.at);
    if (dock && dock.crates && dock.crates.length) {
      const p = crateSpot(dock);
      if (G.W.reaches(v, p[0], p[1])) for (const c of cratesOf(dock, op)) if ((c.by === v.id || !held(c, S)) && D.room(op.to, c.k) >= 1) { c.by = v.id; c.byT = S.clock; return { cid: c.id, gid: 0 }; }
    }
    for (const o of S.loose || []) if (o.op === op.id && (o.by === v.id || !held(o, S)) && D.room(op.to, o.k) >= 1 && G.W.reaches(v, o.x, o.y)) { o.by = v.id; o.byT = S.clock; return { cid: 0, gid: o.id }; }
    return null;
  }
  P.claim = claim;
  // what a porter goes for, where it is and in which holder (the quay's crates, or a crate on the ground)
  function srcOf(op, t) {
    const S = S_();
    if (t.gid) { const o = (S.loose || []).find(x => x.id === t.gid && x.op === op.id); return o ? { ref: 'g:' + o.id, k: o.k, n: o.n, x: o.x, y: o.y, obj: o, cid: o.cid || 0, key: 'g' + o.id } : null; }
    const dock = S.buildings.get(t.dock); const c = dock && dock.crates && dock.crates.find(q => q.id === t.cid && q.op === op.id); if (!c) return null;
    const p = crateSpot(dock); return { ref: 'q:' + dock.id, k: c.k, n: c.n, x: p[0], y: p[1], obj: c, cid: c.id, key: 'q' };
  }
  // the work of a stevedore or a fisherman at a quay with an unloading under way: a step of the operation
  P.work = function (v, dock, H) {
    let op = P.opAt(dock);
    if (!op && dock.type === 'doca' && dock.crates && dock.crates.some(c => !c.op)) { op = opFor(dock, 'cais', null); adopt(op, dock); } // (crates of nobody's: an unloading for them)
    if (!op || op.st === 'wait') return null;
    const c = claim(op, v); if (!c) return null;
    A.join(op, v, v.role === 'pescador' ? 'pescador' : 'estivador');
    return H.setTask(v, { type: 'descarga', dock: dock.id, op: op.id, cid: c.cid, gid: c.gid, pri: 1.1, st: 0, trips: 0, id: dock.id });
  };

  // ------------------------------ the names of the steps ------------------------------
  // (the same step twice does nothing the second time: a lift is named by the crate — and how many times it was set down
  // whole again —, what it held and the hand; a delivery
  // and its pay by the lift the load came from — so two parts of one crate are two lifts, and nothing collides after a
  // reclaimed errand starts its count again)
  const liftKey = (obj, v) => 'pegar:' + obj.id + ':' + (obj.gen || 0) + ':' + Math.round(obj.n * 1000) + ':' + v.id;
  const loadName = (c, v) => (c && c.lift ? 'L' + c.lift : 'v' + v.id + ':' + (c ? c.cid || 0 : 0) + ':' + Math.round(G.S.clock * 10));
  // a load lifted: it is the operation's, and it remembers its lift (the ledger's number of it)
  function lifted(v, op, r) { if (!v.carry) return false; v.carry.op = op.id; if (r.e) v.carry.lift = r.e[0]; return true; }

  // ------------------------------ the pay ------------------------------
  // per crate delivered: a part of what it is worth, from the treasury to the carrier's house (or purse); no coin in the
  // treasury, it is owed and paid when there is; a people without coin gives a ration of the store instead
  P.payOf = (k, n) => Math.max(0.1, r2((E.PRICE[k] || 0.3) * n * 0.12));
  function pay(op, v, k, n, root, share) {
    const S = S_(); const f = G.Fac.get(op.fac); if (!f || !v) return 0;
    const payee = v.home && D.exists('h:' + v.home) ? 'h:' + v.home : 'p:' + v.id;
    const pd = op.data.paid || (op.data.paid = {}), ow = op.data.owed || (op.data.owed = {});
    if (E.coinage(f.id)) {
      const due = r2(P.payOf(k, n) * (share || 1));
      const r = D.move('f:' + f.id, payee, 'moedas', due, { op: op.id, code: 'paga', by: v.id, key: 'paga:' + root + ':' + v.id });
      if (r.ok) { pd[v.id] = r2((pd[v.id] || 0) + due); f.eco.wages = (f.eco.wages || 0) + due; return due; }
      ow[v.id] = r2((ow[v.id] || 0) + due); return 0;
    }
    if (payee[0] === 'h') { const r = D.move('f:' + f.id, payee, 'food', r2(0.5 * (share || 1)), { op: op.id, code: 'paga', by: v.id, key: 'racao:' + root + ':' + v.id, part: true }); if (r.ok) { pd[v.id] = r2((pd[v.id] || 0) + r.n); return r.n; } }
    void S; return 0;
  }
  function settle(op) {
    const f = G.Fac.get(op.fac); if (!f || !E.coinage(f.id)) return;
    const ow = op.data.owed || {}; const S = S_();
    for (const id in ow) {
      if (!(ow[id] > EPS)) { delete ow[id]; continue; }
      const v = S.villagers.get(+id); const payee = v && v.home && D.exists('h:' + v.home) ? 'h:' + v.home : v ? 'p:' + v.id : null; if (!payee) { delete ow[id]; continue; }
      const r = D.move('f:' + f.id, payee, 'moedas', ow[id], { op: op.id, code: 'paga', by: +id, part: true });
      if (r.ok) { ow[id] = r2(ow[id] - r.n); op.data.paid[id] = r2((op.data.paid[id] || 0) + r.n); if (ow[id] <= EPS) delete ow[id]; }
    }
  }
  P.settle = settle;

  // ------------------------------ setting a crate down (called away, or the end of the errand) ------------------------------
  // near the store's door it goes in; near the quay it goes back on it; anywhere else it is set down where the porter stands
  function drop(op, v, why) {
    const c = v.carry; if (!c || c.op !== op.id) return;
    const S = S_(); const dock = S.buildings.get(op.at); const dest = P.destOf(op);
    if (dest) { const [fx, fy] = G.Village.frontTile(dest); if (G.dist(v.x, v.y, fx, fy) < 1.6) { const nmL = loadName(c, v), k = c.k; const r = D.move('v:' + v.id, op.to, c.k, c.n, { op: op.id, code: 'depositar', by: v.id, key: 'dep:' + nmL }); if (r.ok && !v.carry) { pay(op, v, k, r.n, nmL); return; } } }
    if (dock && dock.type === 'doca') { const p = crateSpot(dock); if (G.dist(v.x, v.y, p[0], p[1]) < 2.5) { const r = D.move('v:' + v.id, 'q:' + dock.id, c.k, c.n, { op: op.id, code: 'devolveu', by: v.id }); if (r.ok) return; } }
    D.drop('v:' + v.id, c.k, c.n, v.x, v.y, { op: op.id, code: why === 'morte' ? 'caiu' : 'pousou', by: v.id, fac: op.fac });
    A.log(op, 'pousou', v.id, why || '');
  }
  P.drop = drop;

  // ------------------------------ the overseer, once a second ------------------------------
  const PAUSE = { noite: 'a noite', perigo: 'o perigo', bloqueio: 'o bloqueio do porto', cheio: 'o armazém cheio', fogo: 'o fogo no cais', semarmazem: 'a falta de um armazém', semacesso: 'a falta de caminho do cais ao armazém' };
  function tick(op) {
    const S = S_(); const dock = S.buildings.get(op.at);
    // the quay is gone (burnt, sunk, pulled down): what was on it lies where it was, on the ground, for a hand to take
    if (!dock || dock.type !== 'doca') {
      if (dock && dock.crates && dock.crates.length) for (const c of dock.crates.slice()) if (c.op === op.id) D.drop('q:' + dock.id, c.k, c.n, dock.x + 0.6 + (c.id % 3) * 0.4, dock.y + 1 + ((c.id >> 2) % 2) * 0.4, { op: op.id, cid: c.id, code: 'ruina', fac: op.fac });
      if (!custody(op)) return A.end(op, 'int', 'o cais acabou');
    }
    adopt(op, dock);
    // a fire on the quay burns what is on it; on the ground, what lies in it
    if (dock && dock.crates && dock.crates.length && S.fire[G.W.idx(dock.x + 1, dock.y + 1)] > 0.3) {
      for (const c of dock.crates.slice()) if (c.op === op.id && G.R() < 0.35) { const k = c.k, r = D.use('q:' + dock.id, k, c.n, { op: op.id, code: 'fogo', cid: c.id }); A.log(op, 'queimou', k, r.n); }
    }
    for (const o of (S.loose || []).slice()) if (o.op === op.id && S.fire[G.W.idx(o.x, o.y)] > 0.3 && G.R() < 0.35) { const k = o.k, r = D.use('g:' + o.id, k, o.n, { op: op.id, code: 'fogo' }); A.log(op, 'queimou', k, r.n); }
    // why it would stop: night, danger, a blockade, a full warehouse, no warehouse at all, no way from the quay to it
    const set = S.settlements.get(op.set); const dest = storeFor(dock, op.fac, op.x, op.y); op.data.dest = dest ? dest.id : 0;
    let why = '';
    if (G.isNight()) why = 'noite';
    else if (G.War && G.War.threat && G.War.threat(op.set)) why = 'perigo';
    else if (dock && G.Naval && G.Naval.blockaded && G.Naval.blockaded(dock)) why = 'bloqueio';
    else if (!dest) why = 'semarmazem';
    else if (dock && dock.type === 'doca' && cratesOf(dock, op).length && !access(dock, dest)) why = 'semacesso';
    else if (custody(op) > EPS && !roomFor(op)) why = 'cheio';
    if (why) { if (op.st !== 'wait' || op.wait !== why) { A.pause(op, why); } } else if (op.st === 'wait') A.resume(op);
    // claims nobody is acting on any more (a task lost in a save, an errand changed) are let go
    if (dock && dock.crates) for (const c of dock.crates) if (c.op === op.id && c.by && !held(c, S)) c.by = 0;
    for (const o of S.loose || []) if (o.op === op.id && o.by && !held(o, S)) o.by = 0;
    // two for a heavy crate: a lead waiting for a hand gets one (the nearest free porter)
    pairUp(op, dock);
    // what is owed is paid as soon as the treasury has it
    if (S.clock - (op.data.setT || 0) > 10) { op.data.setT = S.clock; settle(op); }
    // the end: nothing left out — the foreman counts it at the door, and it is over
    if (!custody(op) && Object.keys(op.goods).length) {
      if (op.data.count === 2 || !dest) return finish(op);
      if (!op.data.count) { op.data.count = 1; op.data.countT = S.clock; const chief = foreman(op); if (chief && !A.isBody(chief)) { A.join(op, chief, 'chefe'); A.give(chief, { type: 'conferir', op: op.id, pri: 1.12, st: 0, id: dest.id }); } else op.data.count = 2; }
      else if (S.clock - (op.data.countT || 0) > 40) op.data.count = 2; // (nobody came to count: the store counts itself)
    }
    void set;
  }
  // (a full store is full of a good, not of everything: room for one more of anything this unloading still holds outside)
  function roomFor(op) {
    const S = S_(); if (!D.exists(op.to)) return false; const fits = k => D.room(op.to, k) >= 1;
    const dock = S.buildings.get(op.at); for (const c of cratesOf(dock, op)) if (fits(c.k)) return true;
    for (const o of S.loose || []) if (o.op === op.id && fits(o.k)) return true;
    for (const v of S.villagers.values()) if (v.carry && v.carry.op === op.id && fits(v.carry.k)) return true;
    return false;
  }
  // the eldest stevedore of the warehouse (or of the team) counts what came in
  function foreman(op) {
    const S = S_(); let best = null;
    for (const id in op.roles || {}) { const v = S.villagers.get(+id); if (v && A.able(v) && (!best || v.age > best.age)) best = v; }
    if (!best) for (const v of S.villagers.values()) if (v.set === op.set && v.role === 'estivador' && A.able(v) && (!best || v.age > best.age)) best = v;
    return best;
  }
  function pairUp(op, dock) {
    const S = S_(); if (!dock || op.st !== 'on') return;
    for (const id in op.roles || {}) {
      const v = S.villagers.get(+id); const t = v && v.task; if (!t || t.type !== 'descarga' || !t.pair || t.helper) continue;
      if (S.clock - (t.pairT || S.clock) < 2) continue; // (a moment for the call)
      let best = null, bd = 1e9;
      for (const o of S.villagers.values()) {
        if (o.id === v.id || !A.able(o) || o.carry || !isPorter(o, dock) || A.isBody(o)) continue;
        if (o.task && (o.task.pri >= 1.12 || o.task.type === 'descarga' && o.task.st >= 2)) continue;
        const d = G.dist2(o.x, o.y, v.x, v.y); if (d < bd) { bd = d; best = o; }
      }
      if (best && bd < 30 * 30) { A.join(op, best, 'ajudante'); if (A.give(best, { type: 'ajudar', op: op.id, lead: v.id, cid: t.cid, pri: 1.12, st: 0, id: op.at })) t.helper = best.id; }
    }
  }
  function finish(op) {
    const S = S_(); const set = S.settlements.get(op.set); const f = G.Fac.get(op.fac);
    settle(op);
    const got = Object.keys(op.done || {}).filter(k => op.done[k] > EPS).map(k => `${Math.round(op.done[k])} de ${E.name(k)}`).join(', ');
    const lost = Object.keys(op.lost || {}).filter(k => op.lost[k] > EPS).map(k => `${Math.round(op.lost[k])} de ${E.name(k)}`).join(', ');
    op.data.result = { got, lost };
    A.end(op, 'ok', lost ? 'faltou: ' + lost : 'conferido');
    // (the first ship unloaded by a town's own hands is told; the rest is the town's ordinary life)
    if (set && op.why === 'navio' && got && !(set._unload && set._unload.told)) { (set._unload || (set._unload = {})).told = S.day; log(`Os estivadores de ${set.name} descarregaram o primeiro navio: ${got} no armazém${E.coinage(op.fac) ? ', cada caixa paga a quem a carregou' : ''}.`, 'naval', op.x, op.y); }
    void f;
  }

  // ------------------------------ the steps, by the hands of the world's people ------------------------------
  // (the walk ends when the path does: a path cut on the way — a wall, a house — ends it short of the place, and that is
  // no arrival: one lifts a crate only standing by it, and sets it down in a store only at its door)
  // (a path that ends short — cut by a wall, or a corner it could not round — is walked again from where it ended, a few
  // times; only then is the place out of reach)
  function walkTo(v, t, key, x, y, dt, H) {
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, x, y, false) && !H.goto(v, x, y, true, G.N * G.N)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; if (G.dist(v.x, v.y, x, y) < 1.5) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  function walkB(v, t, b, dt, H) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  const AN = A.ANIM;
  function runDescarga(v, t, dt, H) {
    const S = S_(); const op = A.get(t.op); const dock = S.buildings.get(t.dock);
    if (!op || !live(op)) { if (v.carry && v.carry.op === t.op) v.carry.op = 0; return H.end(v); }
    // (carrying a crate, the porter finishes the trip before sleeping)
    if (v.carry && v.carry.op === op.id) t.pri = Math.max(t.pri, 1.6);
    if (t.st === 0) {
      if (v.carry && v.carry.op === op.id) { t.st = 2; return; }
      if (op.st === 'wait') return H.end(v);
      let s = srcOf(op, t);
      if (!s || (s.obj.by && s.obj.by !== v.id)) { const c = claim(op, v); if (!c) return H.end(v); t.cid = c.cid; t.gid = c.gid; s = srcOf(op, t); if (!s) return H.end(v); }
      s.obj.by = v.id; s.obj.byT = S.clock;
      const r = walkTo(v, t, s.key, s.x, s.y, dt, H);
      if (r < 0) { s.obj.by = 0; return H.end(v); }
      if (r > 0) { t.st = 1; v.actT = 0; t.wt = 0; t.pair = D.hands(s.k, s.n, v) === 2 ? 1 : 0; if (t.pair) { t.pairT = S.clock; say(v, 'pedir_ajuda', { v, k: s.k, op }); } }
      return;
    }
    if (t.st === 1) {
      const s = srcOf(op, t);
      if (!s) { t.st = 0; t.cid = 0; t.gid = 0; return; }
      if (op.st === 'wait') { s.obj.by = 0; return H.end(v); }
      // a heavy crate: wait for the second pair of hands (or take what one body can, after a while)
      if (t.pair) {
        const hp = t.helper && S.villagers.get(t.helper); const near = hp && hp.task && hp.task.type === 'ajudar' && hp.task.lead === v.id && G.dist(hp.x, hp.y, v.x, v.y) < 1.4;
        if (!near) { v.act = AN.esperar.act; t.wt += dt; if (t.wt < 25) return; t.pair = 0; t.helper = 0; say(v, 'sozinho', { v, k: s.k }); }
      }
      v.act = AN.levantar.act;
      if (v.actT < AN.levantar.contact) return;
      const room = D.room('v:' + v.id, s.k, { op: op.id, cid: s.cid, pair: t.pair });
      const r = D.move(s.ref, 'v:' + v.id, s.k, Math.min(s.n, room), { op: op.id, cid: s.cid, code: 'pegar', by: v.id, pair: t.pair, key: liftKey(s.obj, v) });
      if (!r.ok || !lifted(v, op, r)) { s.obj.by = 0; return H.end(v); }
      if (t.pair && t.helper) { const hp = S.villagers.get(t.helper); if (hp && hp.task && hp.task.type === 'ajudar') { hp.task.st = 2; v.carry.pair = hp.id; } }
      const rest = srcOf(op, t); if (rest) rest.obj.by = 0; // (a part of it taken: the rest waits for the next hand)
      t.st = 2; t.wk = null; v.act = ''; return;
    }
    if (t.st === 2) {
      if (!v.carry || v.carry.op !== op.id) { t.st = 0; return; }
      const dest = P.destOf(op); if (!dest) { drop(op, v, 'sem armazém'); return H.end(v); }
      t.dest = dest.id;
      const r = walkB(v, t, dest, dt, H);
      if (r < 0) { drop(op, v, 'sem caminho'); return H.end(v); }
      if (r > 0) { t.st = 3; v.actT = 0; }
      return;
    }
    if (t.st === 3) {
      v.act = AN.pousar.act;
      if (v.actT < AN.pousar.contact) return;
      const c = v.carry; if (!c || c.op !== op.id) { t.st = 0; return; }
      const k = c.k, n = c.n, help = c.pair || 0, nmL = loadName(c, v);
      const r = D.move('v:' + v.id, op.to, k, n, { op: op.id, code: 'depositar', by: v.id, key: 'dep:' + nmL });
      if (!r.ok || v.carry) { t.st = 4; t.wt = 0; if (!t.full) { t.full = 1; say(v, 'armazem_cheio', { v, k }); } return; }
      // the pay, the porter's tally, the town's books
      const hp = help && S.villagers.get(help);
      pay(op, v, k, n, nmL, hp ? 0.5 : 1); if (hp) pay(op, hp, k, n, nmL, 0.5);
      delivered(v, { k, n, fish: c.fish, imp: c.imp }, r.n, op);
      const me = op.roles[v.id]; if (me) me.n = (me.n || 0) + 1;
      if (hp && op.roles[hp.id]) op.roles[hp.id].n = (op.roles[hp.id].n || 0) + 1;
      if (hp && hp.task && hp.task.type === 'ajudar') G.Vg.endTask(hp);
      G.FX && G.FX.deposit(v.x, v.y, k, r.n);
      t.trips++; t.pair = 0; t.helper = 0; t.full = 0;
      if (op.st === 'on' && t.trips < 6 && ((dock && cratesOf(dock, op).some(q => !q.by)) || (S.loose || []).some(o => o.op === op.id && !o.by))) { t.st = 0; t.cid = 0; t.gid = 0; t.wk = null; t.pri = 1.1; return; }
      return H.end(v);
    }
    if (t.st === 4) { // the store is full: wait at the door a while; then set it down by the door and stop the unloading
      v.act = AN.esperar.act; t.wt += dt;
      if (t.wt > 2 && (t.wt | 0) % 2 === 0 && v.carry && D.room(op.to, v.carry.k) >= v.carry.n) { t.st = 3; v.actT = AN.pousar.contact; return; }
      if (t.wt < 20) return;
      drop(op, v, 'cheio'); if (!roomFor(op)) A.pause(op, 'cheio'); return H.end(v);
    }
  }
  // what a delivery means for the porter and the town (the old tally of the quay: what was carried, the fish of each water, the imports)
  function delivered(v, c, add, op) {
    const fa = G.Fac.get(op.fac); if (!fa) return;
    if (c.k !== 'food' && !c.imp) E.made(fa, c.k, add);
    if (c.imp) { E.ensure(fa); fa.eco.imp = (fa.eco.imp || 0) + add; }
    v.st[c.k] = (v.st[c.k] || 0) + add;
    if (c.fish) G.Riches && G.Riches.noteFood(fa.id, 'peixe:' + c.fish, add);
    v.fishXp = (v.fishXp || 0) + 1;
  }
  // the second pair of hands under a heavy crate: to the crate, then beside the one who leads, to the store
  function runAjudar(v, t, dt, H) {
    const S = S_(); const op = A.get(t.op); const lead = S.villagers.get(t.lead);
    if (!op || !live(op) || !lead || !lead.task || lead.task.type !== 'descarga' || lead.task.op !== op.id) return H.end(v);
    if (t.st === 0) { const r = walkTo(v, t, 'lead', lead.x + 0.5, lead.y + 0.3, dt, H); if (r < 0) return H.end(v); if (r > 0) t.st = 1; return; }
    if (t.st === 1) { v.act = AN.esperar.act; G.faceTo(v, lead.x - v.x, lead.y - v.y); if (G.dist(v.x, v.y, lead.x, lead.y) > 1.3) t.st = 0; if (t.age > 60) return H.end(v); return; }
    // carrying together: a step behind the one who leads, the crate between them (one load, his: nothing counted twice)
    if (!lead.carry || lead.carry.pair !== v.id) return H.end(v);
    v.act = AN.carregarDois.act || 'carry2';
    const d = G.dist(v.x, v.y, lead.x, lead.y);
    if (d > 0.7) { const s = Math.min(d - 0.6, (v.speed || 1.35) * 1.05 * dt); v.x += (lead.x - v.x) / d * s; v.y += (lead.y - v.y) / d * s; v.moving = true; v.walkPh += s * 8.5; G.faceTo(v, lead.x - v.x, lead.y - v.y); } else v.moving = false;
    if (d > 3) { const c = lead.carry; if (c) { drop(op, lead, 'sem ajuda'); } return H.end(v); }
  }
  // the count at the door: what came in against what came
  function runConferir(v, t, dt, H) {
    const S = S_(); const op = A.get(t.op); if (!op || !live(op)) return H.end(v);
    const dest = S.buildings.get(t.id) || P.destOf(op); if (!dest) { op.data.count = 2; return H.end(v); }
    if (t.st === 0) { const r = walkB(v, t, dest, dt, H); if (r < 0) { op.data.count = 2; return H.end(v); } if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = AN.contar.act;
    if (v.actT < AN.contar.dur) return;
    op.data.count = 2; op.data.counter = v.id;
    const got = Object.keys(op.done || {}).filter(k => op.done[k] > EPS).map(k => ({ k, n: Math.round(op.done[k]) }));
    const lost = Object.keys(op.lost || {}).filter(k => op.lost[k] > EPS).map(k => ({ k, n: Math.round(op.lost[k]) }));
    say(v, lost.length ? 'faltam' : 'conferido', { v, got, lost, op });
    H.end(v);
  }

  // (what the body is offered first: the crates nobody has taken — then the others, to say why not)
  // (a crate is taken when a hand is acting on it — a claim nobody acts on is no claim: the same rule as the porters')
  const freeFirst = (L, v) => { const S = S_(); const fr = q => q.by === v.id || !held(q, S); return L.filter(fr).concat(L.filter(q => !fr(q))); };
  // ------------------------------ the definition ------------------------------
  const words = op => { const ks = Object.keys(op.goods || {}).filter(k => op.goods[k] > EPS); return ks.length ? ks.map(k => E.name(k)).join(', ') : 'carga'; };
  A.def('descarga', {
    name: 'Descarga', conserve: true, many: false,
    purpose: 'Tirar do cais (ou da caravana) a carga real e levá-la ao armazém do povo, caixa por caixa, com paga a quem carrega.',
    needs: 'um cais com caixas (ou uma caravana que chegou) e um armazém ou ponto de entrega do povo',
    title: (op) => { const S = S_(); const dock = S.buildings.get(op.at); const set = S.settlements.get(op.set); return `Descarga de ${words(op)}${dock ? ' n' + (G.gen(G.Village.buildName(dock)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(dock).toLowerCase() : ''}${set ? ' de ' + set.name : ''}`; },
    avail(c, v, set) {
      if (!c.porto.docas.length) return null; // (no quay: the activity does not exist here)
      const S = S_(); for (const id of c.porto.docas) { const d = S.buildings.get(id); const op = d && P.opAt(d); if (op && cratesOf(d, op).length) return { ok: op.st === 'on', why: op.st === 'wait' ? `parada por ${PAUSE[op.wait] || op.wait}` : '', txt: `Há caixas no cais de ${set.name} esperando braços para o armazém`, known: G.dist(v.x, v.y, d.x, d.y) < 40 }; }
      return null;
    },
    tick,
    resume(op, v, H) { const S = S_(); const dock = S.buildings.get(op.at); if (!dock || v.carry.op !== op.id) return null; return H.setTask(v, { type: 'descarga', dock: dock.id, op: op.id, cid: v.carry.cid || 0, pri: 1.6, st: 2, trips: 0, id: dock.id }); },
    drop,
    text(v, t, op) {
      if (t.type === 'ajudar') { const lead = S_().villagers.get(t.lead); return t.st < 2 ? `Indo ajudar ${lead ? lead.name : 'um estivador'} com uma caixa pesada` : `Carregando uma caixa pesada com ${lead ? lead.name : 'um estivador'}`; }
      if (t.type === 'conferir') return 'Conferindo a carga na porta do armazém';
      const c = v.carry; const nm = c ? E.name(c.k) : '';
      return ['Indo pegar uma caixa no cais', c ? `Levantando uma caixa de ${nm}` : 'Levantando uma caixa', `Levando uma caixa de ${nm} ao armazém`, `Guardando a caixa de ${nm} no armazém`, 'Esperando lugar no armazém, com a caixa nas mãos'][t.st] || `Descarregando ${words(op)}`;
    },
    onEnd(op) { const S = S_(); for (const id in op.roles || {}) { const v = S.villagers.get(+id); if (v && op.roles[id].n >= 3 && op.why === 'navio' && G.Act) A.note(v, 'memory', `Descarreguei ${op.roles[id].n} caixas de ${words(op)} no cais${(op.data.paid || {})[id] ? ` e ganhei ${r2(op.data.paid[id])} ${E.coinage(op.fac) ? 'moedas' : 'de ração'}` : ''}.`); } },
    // ---- what the god's body can do here (the same steps, the same checks, the same pay)
    offers(v, x, y, r) {
      const S = S_(); const out = []; const c = v.carry;
      for (const op of A.all()) {
        if (op.def !== 'descarga' || !live(op)) continue;
        const dock = S.buildings.get(op.at); const dest = P.destOf(op);
        if (c && c.op === op.id) {
          if (dest) { const [fx, fy] = G.Village.frontTile(dest); if (G.dist(x, y, fx, fy) < r + 1) out.push({ id: 'porto.depositar:' + op.id, act: 'depositar', op: op.id, label: `Guardar a caixa de ${E.name(c.k)} n${G.gen(G.Village.buildName(dest)) === 'a' ? 'a' : 'o'} ${G.Village.buildName(dest).toLowerCase()}`, at: [fx, fy], ref: op.to, anim: 'pousar', hands: c.pair ? 2 : 1 }); }
          out.push({ id: 'porto.pousar:' + op.id, act: 'pousar', op: op.id, label: 'Pôr a caixa no chão', at: [v.x, v.y], ref: 'v:' + v.id, anim: 'pousar', hands: 1 });
          continue;
        }
        if (c && c.n > EPS) continue; // (the hands are full)
        if (dock && dock.crates) { const p = crateSpot(dock); if (G.dist(x, y, p[0], p[1]) < r + 1.5) for (const q of freeFirst(cratesOf(dock, op), v).slice(0, 3)) {
          const free = q.by === v.id || !held(q, S); const hd = D.hands(q.k, q.n, v);
          out.push({ id: 'porto.pegar:' + op.id + ':' + q.id, act: 'pegar', op: op.id, cid: q.id, label: hd === 1 ? `Pegar a caixa de ${E.name(q.k)} (${Math.round(q.n)})` : `Pegar o que der da caixa de ${E.name(q.k)} (pesada)`, at: p, ref: 'q:' + dock.id, anim: 'levantar', hands: hd, ok: free && op.st === 'on', why: !free ? 'Outro carregador já pegou esta caixa.' : op.st !== 'on' ? `A descarga está parada (${PAUSE[op.wait] || op.wait}).` : '' });
        } }
        for (const o of S.loose || []) if (o.op === op.id && G.dist(x, y, o.x, o.y) < r + 0.5) out.push({ id: 'porto.pegarChao:' + op.id + ':' + o.id, act: 'pegarChao', op: op.id, gid: o.id, label: `Pegar a caixa de ${E.name(o.k)} do chão`, at: [o.x, o.y], ref: 'g:' + o.id, anim: 'levantar', hands: D.hands(o.k, o.n, v) });
      }
      return out;
    },
    acts: {
      pegar: {
        deed: 'carga',
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'A descarga acabou.' }; if (op.st !== 'on') return { ok: false, why: `A descarga está parada (${PAUSE[op.wait] || op.wait}).` }; const dock = S_().buildings.get(op.at); const q = dock && dock.crates && dock.crates.find(c => c.id === o.cid && c.op === op.id); if (!q) return { ok: false, why: 'A caixa não está mais no cais.' }; if (q.by && q.by !== v.id && held(q, S_())) return { ok: false, why: 'Outro carregador pegou esta caixa.' }; if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos já estão cheias.' }; if (D.room('v:' + v.id, q.k, { op: op.id, cid: q.id }) < 1) return { ok: false, why: 'Pesado demais para você.' }; return { ok: true }; },
        begin(v, o) { const op = A.get(o.op); const dock = S_().buildings.get(op.at); const q = dock.crates.find(c => c.id === o.cid); q.by = v.id; q.byT = S_().clock; A.join(op, v, 'mao'); return { ok: true }; },
        run(v, o) { const op = A.get(o.op); const dock = S_().buildings.get(op.at); const q = dock.crates.find(c => c.id === o.cid); const room = D.room('v:' + v.id, q.k, { op: op.id, cid: q.id }); const r = D.move('q:' + dock.id, 'v:' + v.id, q.k, Math.min(q.n, room), { op: op.id, cid: q.id, code: 'pegar', by: v.id, key: liftKey(q, v) }); const rest = dock.crates.find(c => c.id === o.cid); if (rest) rest.by = 0; if (!r.ok || !lifted(v, op, r)) return { ok: false, why: r.why || 'Não deu.' }; return { ok: true, n: r.n, msg: `Você levanta ${r.n < q.n + r.n - EPS ? 'parte da ' : 'a '}caixa de ${E.name(q.k)}.` }; },
        abort(v, o) { const op = A.get(o.op); const dock = op && S_().buildings.get(op.at); const q = dock && dock.crates && dock.crates.find(c => c.id === o.cid); if (q && q.by === v.id) q.by = 0; },
      },
      pegarChao: {
        deed: 'carga',
        can(v, o) { const op = A.get(o.op); const g = (S_().loose || []).find(x => x.id === o.gid); if (!op || !live(op) || !g) return { ok: false, why: 'Não está mais aí.' }; if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos já estão cheias.' }; return { ok: true }; },
        run(v, o) { const op = A.get(o.op); const g = (S_().loose || []).find(x => x.id === o.gid); A.join(op, v, 'mao'); const room = D.room('v:' + v.id, g.k, { op: op.id }); const r = D.move('g:' + g.id, 'v:' + v.id, g.k, Math.min(g.n, room), { op: op.id, code: 'pegar', by: v.id, key: liftKey(g, v) }); return r.ok && lifted(v, op, r) ? { ok: true, n: r.n, msg: `Você levanta a caixa de ${E.name(g.k)}.` } : { ok: false, why: r.why || 'Não deu.' }; },
      },
      depositar: {
        deed: 'entrega',
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'A descarga acabou.' }; if (!v.carry || v.carry.op !== op.id) return { ok: false, why: 'Você não está com uma caixa desta descarga.' }; if (D.room(op.to, v.carry.k) + EPS < v.carry.n) return { ok: false, why: 'O armazém está cheio.' }; return { ok: true }; },
        run(v, o) { const op = A.get(o.op); const c = v.carry; const k = c.k, n = c.n, nmL = loadName(c, v); const r = D.move('v:' + v.id, op.to, k, n, { op: op.id, code: 'depositar', by: v.id, key: 'dep:' + nmL }); if (!r.ok || v.carry) return { ok: false, why: r.why || 'Não deu.' }; const got = pay(op, v, k, n, nmL, 1); delivered(v, { k, n, fish: c.fish, imp: c.imp }, r.n, op); if (op.roles[v.id]) op.roles[v.id].n = (op.roles[v.id].n || 0) + 1; return { ok: true, n: r.n, paid: got, msg: `Você guarda ${Math.round(r.n)} de ${E.name(k)} no armazém${got ? ` e recebe ${got} ${E.coinage(op.fac) ? 'moedas' : 'de ração'}` : ''}.` }; },
      },
      pousar: {
        can(v, o) { const op = A.get(o.op); return op && v.carry && v.carry.op === op.id ? { ok: true } : { ok: false, why: 'Não há o que pôr no chão.' }; },
        run(v, o) { const op = A.get(o.op); drop(op, v, 'pousou'); return { ok: true, msg: 'Você põe a caixa no chão.' }; },
      },
    },
  });
  A.ANIM.carregarDois.act = 'carry2';

  // ------------------------------ the task machines of this file ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'descarga' && t.op) { runDescarga(v, t, dt, H); return true; }
    if (t.type === 'ajudar' && t.op) { runAjudar(v, t, dt, H); return true; }
    if (t.type === 'conferir' && t.op) { runConferir(v, t, dt, H); return true; }
    return oldRun(v, t, dt, H);
  };
  P.run = runDescarga;
  G.Act.pair = function (v) { const S = S_(); if (!v) return null; if (v.carry && v.carry.pair) return { lead: v.id, help: v.carry.pair, cid: v.carry.cid || 0, side: 'frente' }; if (v.task && v.task.type === 'ajudar' && v.task.st === 2) { const l = S.villagers.get(v.task.lead); if (l && l.carry && l.carry.pair === v.id) return { lead: l.id, help: v.id, cid: l.carry.cid || 0, side: 'tras' }; } return null; };

  // ------------------------------ things on the ground, drawn (the god's view; the 3D draws them from G.Depot.items) ------------------------------
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const looseE = new Map();
  G.worldHooks.push(() => { looseE.clear(); });
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = S_(); if (!S || zoom < 0.5 || !S.loose || !S.loose.length) return;
    for (const o of S.loose) { let e = looseE.get(o.id); if (!e || e.o !== o) looseE.set(o.id, e = { o, fn: drawLoose }); add(o.x + o.y + 0.02, e, o.x, o.y); }
    if (looseE.size > 400) looseE.clear();
  });
  function drawLoose(c, e, sx, sy) {
    const o = e.o; const col = (E.GOODS[o.k] && E.GOODS[o.k].col) || '#b8a060';
    c.fillStyle = '#8a6a44'; c.fillRect(sx - 1.4, sy - 2.3, 2.8, 2.3); c.fillStyle = '#6a4a2c'; c.fillRect(sx - 1.4, sy - 1.4, 2.8, 0.35);
    c.fillStyle = col; c.beginPath(); c.ellipse(sx - 0.3, sy - 2.4, 0.9, 0.35, 0.3, 0, Math.PI * 2); c.fill();
  }
})(window.G);
