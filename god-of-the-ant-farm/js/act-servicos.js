'use strict';
// ============================================================
//  Os serviços da cidade: as termas (G.Termas; o exemplo A) e a
//  oferenda do templo (G.Templo.ofertar).
//
//  As termas. O dia dos banhos é uma operação do mundo ('termas'):
//  abre na hora dela, fecha na hora dela, e tem o seu livro —
//  quantos entraram, o que pagaram, quanta lenha a fornalha
//  queimou. Quem cuida é o foguista: leva a lenha do armazém do
//  povo para os banhos e alimenta a fornalha; a água fica quente
//  enquanto há fogo (D-079). Sem lenha, ou sem foguista, a água é
//  fria e o banho vale menos. Quem vem, vem por vontade sua (a
//  pausa do dia de cada um — G.Termas.urge, uma escolha entre as
//  outras do dia, D-200 —, ou o passeio de quem está sem trabalho:
//  G.Termas.visit) — ninguém nasce para encher piscina, e ninguém
//  se banha duas vezes no dia: num povo de moeda paga a entrada ao
//  tesouro; tira a roupa nos cabides, entra na água (um lugar na
//  piscina, pelo repartidor dos interiores: o uso 'banhar'), fica,
//  sai e se veste. O banho quente cura um pouco a doença e
//  descansa; o frio, menos. Cheia, ninguém mais entra; na hora de
//  fechar, todos saem. O corpo do deus entra, paga, banha-se e sai
//  — e, sendo o foguista, alimenta a fornalha — pelas mesmas
//  portas.
//
//  A oferenda. O que uma casa dá ao templo sai da despensa ou da
//  arca dela para a prateleira do templo, pelo livro
//  ('oferenda'). Cada manhã os sacerdotes comem do que o povo deu,
//  e a comida que passa do que o templo guarda vai ao armazém do
//  povo; o resto fica como o tesouro do templo, até um tanto.
//
//  Os serviços públicos ('publico'), pelo corpo do deus: treinar
//  com os soldados diante do quartel, escrever os registros da
//  administração (sendo o escriba), cobrar o imposto de uma casa e
//  levar o saco ao tesouro, cunhar moedas (sendo o coletor) — pelas
//  mesmas regras de quem faz isso no mundo.
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco; if (!A || !D || !E || !G.BDEF.banhos) return;
  const Te = G.Termas = {};
  const EPS = 1e-6;
  const r2 = x => Math.round(x * 100) / 100;
  const live = A.live;
  const S_ = () => G.S;
  const AN = A.ANIM;
  const say = (v, key, ctx) => G.Falas && v && G.Falas.say(v, key, ctx);

  Te.FEE = 0.1;     // (the entry, in the people's money: a small coin)
  Te.BURN = 45;     // (the seconds of fire a log gives the furnace: two logs keep the water hot through a day open — D-079)
  Te.CAP = 8;       // (the bathers of baths whose plan does not say)
  const LOW = 20;   // (the stoker feeds the furnace when less than this is left)
  const SPARE = 10; // (the wood the people's store keeps for its works: the baths take only what is beyond it)

  // (the clothes off and on at the pegs: an act of the world's own, which the 3D shows with the hand to the pegs — Anim3D's
  // ACT; 'interact' is a pose of the drawing, not an act: a bather undressing stood idle in it, L-429)
  A.addAnim('despir', { act: 'undress', dur: 2, contact: 1.5, hands: 2 });
  A.addAnim('banhar', { act: 'sit', dur: 8, contact: 7.5, hands: 0 });

  // ------------------------------ the stoker: a trade of the town ------------------------------
  G.BDEF.banhos.jobs = 1; G.BDEF.banhos.role = 'foguista';
  G.ROLE.foguista = ['Foguista', 'Foguista'];
  if (!E.JOB_ROLES.includes('foguista')) E.JOB_ROLES.push('foguista');
  E.JOB_OF.foguista = ['banhos'];
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.foguista = '#6a5040';
  // (one stoker for each baths that stand — not in a hungry town: the trades give way to the fields first)
  const oldDemand = E.demand;
  E.demand = function (set, fac, Ad) {
    const out = oldDemand(set, fac, Ad);
    if (Ad >= 8 && (fac.stock.food || 0) >= G.Village.pop(set.id) * 1.5) { const n = E.byType(set.id, 'banhos').length; if (n) out.foguista = (out.foguista || 0) + n; }
    return out;
  };

  // ------------------------------ hours, the day, the water ------------------------------
  // (the acord with act-lar.js: a pure function of the building — the baths open in the morning and close before dusk)
  Te.horas = b => ({ abre: 0.25, fecha: 0.70 });
  const inHours = b => { const h = Te.horas(b); const t = S_().time; return t >= h.abre - EPS && t < h.fecha; };
  Te.inHours = inHours;
  // (asked often — the bathers, the stoker, the panel —: an index of the open days, made again when the operations or the
  // clock change)
  let dIdx = null, dS = null, dN = -1, dT = -1;
  G.worldHooks.push(() => { dIdx = null; dS = null; dN = -1; dT = -1; });
  function days() { const S = S_(); const L = A.all(); if (dIdx && dS === S && dN === L.length && dT === S.clock) return dIdx; dIdx = new Map(); dS = S; dN = L.length; dT = S.clock; for (const op of L) if (op.def === 'termas' && live(op)) dIdx.set(op.at, op); return dIdx; }
  Te.dia = function (b) { const id = b && (b.id || b); const op = days().get(id); return op && live(op) ? op : null; };
  Te.aberta = b => { const op = Te.dia(b); return !!op && op.st === 'on' && inHours(b); };
  Te.quente = b => { const op = Te.dia(b); return !!op && op.data.calor > EPS; };
  const keeperOf = b => { const S = S_(); for (const v of S.villagers.values()) if (v.job === b.id && v.role === 'foguista' && (A.able(v) || A.isBody(v))) return v; return null; };
  Te.keeperOf = keeperOf;
  const facOf = b => G.Village.facOfSet(b.set);
  const coin = b => E.coinage(facOf(b));
  Te.withCoin = coin;
  // the places in the water: the interiors' allotter says whether one more has one, counting who is inside (In.freePlace,
  // P4); baths with no plan (In.table null), a count
  function full(b, op) {
    const In = G.Interiors; if (In && In.freePlace && In.table && In.table(b)) return !In.freePlace(b, 'banhar');
    return Object.keys(op.data.banho).length >= Te.CAP;
  }
  Te.full = b => { const op = Te.dia(b); return !op || full(b, op); };
  // (a place in the water now: the allotter gives each one inside the place of their use — who is at the pegs holds a peg,
  // not a place in the water —; with no plan, the count at the door already kept it)
  const water = b => { const In = G.Interiors; return !(In && In.freePlace && In.table && In.table(b)) || !!In.freePlace(b, 'banhar'); };
  Te.water = water;
  Te.WAIT = 30; // (how long one undressed waits at the pegs for a place in the water, before dressing again and going)
  // which pool: the emptiest of the baths' now — by the share of its places taken; a tie, the plan's order —, so that baths of
  // several pools have people in them all, not a crowd in the first while the others stand empty (D-184). The allotter gives
  // the place in it (the errand's t.item; with none free there, a place of another pool). Baths of one pool, or with no plan: 0
  function pool(b) {
    const In = G.Interiors; if (!(In && In.slots && In.places && In.table && In.table(b))) return 0;
    const n = new Map(); for (const q of In.slots(b, 'banhar')) { const c = n.get(q.item.id); if (c) c[0]++; else n.set(q.item.id, [1, 0]); }
    if (n.size < 2) return 0;
    for (const pl of In.places(b).by.values()) { const c = pl.use === 'banhar' && n.get(pl.item); if (c) c[1]++; }
    let best = 0, share = Infinity; for (const [id, c] of n) if (c[1] / c[0] < share - EPS) { share = c[1] / c[0]; best = id; }
    return best;
  }
  Te.pool = pool;

  // ------------------------------ the day opens and closes ------------------------------
  // (once a day, at its hour: the baths open with or without their stoker — the water is cold then —; a day ended is not
  // opened again)
  const openedToday = b => A.all().some(op => op.def === 'termas' && op.at === b.id && op.data && op.data.day === S_().day);
  function open(b) {
    const S = S_(); if (!G.inSim || !b || !b.built || Te.dia(b) || openedToday(b) || !inHours(b)) return null;
    const k = keeperOf(b);
    const op = A.start('termas', { at: b.id, set: b.set, fac: facOf(b), to: 'b:' + b.id, why: 'dia', by: k ? k.id : 0, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { day: S.day, entradas: 0, receita: 0, lenha: 0, calor: 0, quentes: 0, frios: 0, voltas: 0, banho: {}, q: 0 } });
    if (op && k) A.join(op, k, 'foguista');
    return op;
  }
  Te.open = b => (G.inSim ? open(b) : null);
  function close(op, st, why) {
    const S = S_(); const d = op.data;
    // everyone out: who was in the water takes what the time in it gave, and goes out by the door
    for (const id of Object.keys(d.banho)) { const v = S.villagers.get(+id); if (!v) continue; out(v, op, 'saiu'); if (v.task && v.task.type === 'termas' && v.task.op === op.id) G.Vg.endTask(v); }
    // (and who is on the way to them: the errand ends with the day, there — as the theatre's with its show, L-595. With the
    // wish there is nearly always someone on the way, and baths enlarged in the middle of their day left one walking to a
    // building site until the next step — L-910)
    for (const v of S.villagers.values()) if (v.task && v.task.type === 'termas' && v.task.op === op.id) G.Vg.endTask(v);
    d.banho = {}; d.calor = 0;
    A.end(op, st, why);
  }
  Te.close = (op, why) => { if (op && live(op) && G.inSim) close(op, 'ok', why || 'fechada'); };
  A.hooks.tick.push(function () {
    const S = S_();
    for (const set of S.settlements.values()) for (const b of E.byType(set.id, 'banhos')) { if (!Te.dia(b) && inHours(b)) open(b); callStoker(b); }
  });
  // the stoker called to his post (D-227): the doors about to open, or open with the fire still to feed to the closing
  // (Te.onDuty), and he on another chore of his day — the axe or the hoe of the morning, the house's jar, a stroll —: the
  // furnace first. His day's work holds itself against the next choice (a chore of the same kind is never put down for
  // another), and the doors opened on a cold furnace while he finished a tree. Not from his bed, a meal (whatever the meal's
  // errand weighs: at the post he only eats starving, and then he must), a danger or a call that weighs more, nor with a
  // load in his hands (it goes where it is going first), nor the god's body
  const POST = { fornalha: 1, lenhaTermas: 1 };
  function callStoker(b) {
    const k = keeperOf(b); if (!k || !Te.onDuty(k) || k.sleeping || A.isBody(k) || (k.carry && k.carry.n > EPS)) return;
    const t = k.task; if (t && (POST[t.type] || t.kind === 'eat' || t.kind === 'sleep' || (t.pri || 0) > 1.05 + EPS)) return;
    const f = G.Fac.ofV(k); if (!f) return;
    const n = Te.task(k, b, f, G.Vg.H); if (n && k.task === n) n.kind = 'work';
  }
  // (who is in the baths: a person of the world in them by the errand of this day, or the god's body by its door)
  function inside(v, op) {
    const m = op.data.banho[v.id]; if (!m) return false;
    if (m.body) { const b = S_().buildings.get(op.at); return A.isBody(v) && !!b && (v.inside === b.id || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h) + 2.5); }
    return !!(v.task && v.task.type === 'termas' && v.task.op === op.id && v.task.st >= 1);
  }
  function tick(op, step) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data;
    if (!b || b.type !== 'banhos' || !b.built) return close(op, 'int', 'os banhos caíram');
    if (facOf(b) !== op.fac) return close(op, 'int', 'os banhos mudaram de dono');
    if (d.day !== S.day || !inHours(b)) return close(op, 'ok', 'fechou');
    // the fire burns down; the water is hot while it lasts (and the bathers count the time they had it)
    const hot = d.calor > EPS; if (hot) d.calor = r2(Math.max(0, d.calor - (step || 1)));
    for (const id of Object.keys(d.banho)) {
      const v = S.villagers.get(+id); const m = d.banho[id];
      if (!v || !inside(v, op)) { if (v) out(v, op, 'saiu'); delete d.banho[id]; continue; }
      if (m.st === 2 && hot) m.hot = r2((m.hot || 0) + (step || 1));
    }
  }

  // ------------------------------ a bath: what it does to one ------------------------------
  // the bath's good, by the share of it taken (the time in the water, of the time a bath lasts) and the share of that in hot
  // water: a hot bath takes away a part of a sickness and rests; a cold one, less. Once a visit
  function bathe(v, op, share) {
    const d = op.data; const m = d.banho[v.id]; if (!m || m.done) return false;
    const k = Math.max(0, Math.min(1, share)); if (k < 0.5 - EPS) return false; // (a dip and out is no bath)
    m.done = 1; const inWater = Math.max(1, m.dur * k); const hot = Math.min(1, (m.hot || 0) / inWater);
    const was = v.sick || 0;
    if (was > 0) { v.sick = Math.max(0, was - (8 + 12 * hot) * k); if (v.sick <= 0) v.immune = Math.max(v.immune || 0, G.DAY_LEN * 3); }
    v.energy = G.clamp((v.energy || 0) + (3 + 5 * hot) * k, 0, 100);
    if (hot >= 0.5) d.quentes++; else d.frios++;
    if (!v.bathDay || v.bathDay !== S_().day) { v.bathDay = S_().day; if (hot >= 0.5 && was > 0) A.note(v, 'memory', 'Um banho quente nas termas: a doença pesou menos.'); }
    return true;
  }
  // out of the water and out of the baths: the bath taken counts for what it was
  function out(v, op, why) {
    const m = op.data.banho[v.id]; if (!m) return;
    if (m.st === 2 && !m.done) { const t = S_().clock - (m.t2 || S_().clock); bathe(v, op, t / Math.max(1, m.dur)); }
    delete op.data.banho[v.id]; void why;
  }

  // ------------------------------ the bather (the errand 'termas': st 0 on the way, ≥ 1 inside) ------------------------------
  // the baths for this person now: open, in reach, with a place in the water, and — in a people of coin — a house that can
  // pay the entry; none of it, no errand
  Te.visit = function (v, b, H) {
    H = H || G.Vg.H; const S = S_();
    if (!v || !b || v.captive || v.jail || v.age < 6 || (v.carry && v.carry.n > EPS) || A.isBody(v)) return null;
    if (b.type !== 'banhos' || !b.built || facOf(b) !== G.Fac.idOfV(v)) return null;
    const op = Te.dia(b); if (!op || op.st !== 'on' || !inHours(b) || full(b, op) || op.data.banho[v.id]) return null;
    if (v.bathDay === S.day) return null; // (one bath a day: the wish and the town's leisure alike — D-200)
    if (coin(b) && E.purse(v) + EPS < Te.FEE) return null;
    const dr = G.Vg.door(b); if (!G.W.reaches(v, dr[0], dr[1])) return null;
    return H.setTask(v, { type: 'termas', id: b.id, op: op.id, pri: Te.PRI, st: 0 });
  };

  // ------------------------------ the wish for a bath (D-200) ------------------------------
  // The bath is a pause of one's day, chosen among the day's other choices (villagers.js, decide: 'banho', beside the tavern
  // and the theatre) — nobody is sent to fill a pool. Who: every grown one of a town with baths now and then; more the
  // people of the thermae (the Roman, the Greek, the classic: the habit), the dirty trades (the mine, the forge, the kiln,
  // the works, the quay, the axe), the well-off (the nobles, the merchants) and the tired; and the ill who are up and about,
  // every day — the bath takes a part of the illness away. Less who lives far from the baths, and half as much to cold water
  // (no fire in the furnace: the bath is worth less). When: in the baths' hours, each one from an hour of one's own — who
  // works, from the early afternoon; the old, the nobles and the ill from the morning —, and only with the time to walk
  // there and bathe before the closing. How often: the wish is a share of the days (Te.wish), and whether today is one of
  // them is the day's own lot for each one (G.hash of the person and the day: none of the world's chance is drawn, and the
  // person has no new field), once a day (v.bathDay, which the bath itself writes). What stops it: no coin for the entry,
  // the baths full — who is on the way there counts —, too long a walk, hunger, a load in the hands or the leg of an
  // operation (D-094), the little ones to mind at home, the furnace to feed (the stoker at his post: Te.onDuty); never the
  // god's body, which bathes when the player says.
  Te.PRI = 0.4;      // (the errand's priority: below any work — a bath never cuts a task under way)
  Te.IN = 1.5;       // (what the bath is worth to one inside, the entry paid: above every other wish of the day)
  Te.BASE = 0.3;     // (the share of the days with a bath, of any people …)
  Te.HABIT = 0.5;    // (… and of a people of the thermae)
  Te.DIRT = 0.25;    // (added for a dirty trade,)
  Te.RICH = 0.15;    // (for a noble's or a merchant's house,)
  Te.TIRE = 0.15;    // (and for one tired — under Te.TIRED of energy)
  Te.TIRED = 50;
  Te.NEAR = 10;      // (home within this many tiles of the baths: the whole wish; beyond, less with each tile — over Te.SPAN
  Te.SPAN = 40;      //  tiles more —, never under Te.FLOOR of it)
  Te.FLOOR = 0.25;
  Te.COLD = 0.5;     // (the wish for cold water, of the wish for hot)
  Te.REACH = 30;     // (a walk to the door longer than this: no bath — the tavern's own reach)
  Te.WALK = 1.5;     // (the seconds a tile takes on the straight line, the streets going round — for the time's rule: half the
                     //  bathers of the ready metropolis took 0,8, nine in ten 1,3 or less, the slowest 1,64; who is late pays for a dip)
  Te.DIP = 16;       // (the seconds in the water that make a bath of the longest one — half of it: bathe)
  Te.SLACK = 0.06;   // (of the day: who is far from the baths may set out this long before it is too late to — see Te.pick)
  Te.HOME = 0.5;     // (of two baths, how much the way home weighs: the baths of one's own streets — the tavern's, D-157)
  Te.HUNGRY = 55;    // (hungrier than this, the meal first: the way there and the bath add a quarter of a day's hunger)
  Te.SPENT = 25;     // (and more worn out than this, the bed)
  const DIRTY = { mineiro: 1, ferreiro: 1, oleiro: 1, construtor: 1, estivador: 1, lenhador: 1 };
  const THERMAE = { romano: 1, grego: 1, classico: 1 };
  const WELL = { nobreza: 1, mercadores: 1 };
  Te.DIRTY = DIRTY;
  const civOf = b => (G.Fac.get(facOf(b)) || {}).civ || 'classico';
  const mid = b => [b.x + b.w / 2, b.y + b.h / 2];
  // (how far one lives from these baths — with no home, where one is)
  const farOf = (v, b) => { const hm = v.home && S_().buildings.get(v.home); const [bx, by] = mid(b); return hm ? G.dist(hm.x + hm.w / 2, hm.y + hm.h / 2, bx, by) : G.dist(v.x, v.y, bx, by); };
  // the share of the days this person wants a bath at these baths, as things are now — 0 to 1
  Te.wish = function (v, b) {
    let p = THERMAE[civOf(b)] ? Te.HABIT : Te.BASE;
    if (v.sick > 0) p = 1;
    else { if (DIRTY[v.role]) p += Te.DIRT; if (WELL[v.grp]) p += Te.RICH; if (v.energy < Te.TIRED) p += Te.TIRE; }
    const far = farOf(v, b); if (far > Te.NEAR) p *= Math.max(Te.FLOOR, 1 - (far - Te.NEAR) / Te.SPAN);
    if (!Te.quente(b)) p *= Te.COLD;
    return Math.min(1, p);
  };
  // (the day's lot of each one, 0 to 1: under the wish, today is a day for a bath — the same all day, another tomorrow)
  Te.lot = v => G.hash(Math.imul(v.id | 0, 131) + Math.imul(S_().day | 0, 7919) + 5);
  // (the hour of one's own, from which the bath may be: the old, the nobles and the ill from the morning; who works, from
  // the early afternoon — the bath is the end of a shorter working day: a walk across the town, the pegs and a bath's worth
  // of water take a quarter of the day, and the baths shut before dusk. With the baths' hours of today, 0,27 to 0,43 and
  // 0,38 to 0,46)
  Te.hourOf = function (v, b) {
    const h = Te.horas(b); const len = h.fecha - h.abre; const q = G.hash(Math.imul(v.id | 0, 31) + 11);
    return v.age >= 62 || v.sick > 0 || v.grp === 'nobreza' ? h.abre + len * (0.04 + 0.36 * q) : h.abre + len * (0.29 + 0.18 * q);
  };
  // (who is on the way to each baths, counted once a step of the world when someone asks; the one just sent, added)
  let cIdx = null, cS = null, cT = -1;
  // (who found no way to the baths is not sent again for the rest of the day: the search that fails is the dearest one, and
  // the wish would ask it again at every look — the house's own rule, act-lar.js)
  let noWay = new Map();
  G.worldHooks.push(() => { cIdx = null; cS = null; cT = -1; noWay = new Map(); });
  const lost = v => { const t = noWay.get(v.id); return t !== undefined && S_().clock - t < G.DAY_LEN * 0.5 && S_().clock >= t; };
  // (kept for the step of the world it was counted in; asked from outside the step — a panel, a proof —, counted afresh and
  // not kept: the world is the same with or without anyone looking)
  function coming(b) {
    const S = S_(); if (G.inSim && cIdx && cS === S && cT === S.clock) return cIdx.get(b.id) || 0;
    const m = new Map(); for (const v of S.villagers.values()) { const t = v.task; if (t && t.type === 'termas' && t.st === 0) m.set(t.id, (m.get(t.id) || 0) + 1); }
    if (G.inSim) { cIdx = m; cS = S; cT = S.clock; }
    return m.get(b.id) || 0;
  }
  // (the places in the water one more could count on: the plan's, less who is inside — at the pegs, in the water, dressing —
  // and who is on the way; with no plan, the count)
  function places(b) { const In = G.Interiors; const t = In && In.freePlace && In.table ? In.table(b) : null; const L = t && t.byUse && t.byUse.get('banhar'); return t ? (L ? L.length : 0) : Te.CAP; }
  Te.places = places;
  const room = (b, op) => places(b) - Object.keys(op.data.banho).length - coming(b);
  Te.room = b => { const op = Te.dia(b); return op ? room(b, op) : 0; };
  // the baths this person would go to now, by the wish — or none: it only reads
  Te.pick = function (v) {
    const S = S_(); const fid = G.Fac.idOfV(v); const hm = v.home && S.buildings.get(v.home); let best = null, bd = 1e9, lot = -1;
    for (const b of E.byType(v.set, 'banhos')) {
      if (!b.built || facOf(b) !== fid) continue;
      const op = Te.dia(b); if (!op || op.st !== 'on' || !inHours(b) || op.data.banho[v.id]) continue;
      if (coin(b) && E.purse(v) + EPS < Te.FEE) continue;
      const dr = G.Vg.door(b); const d0 = G.dist(v.x, v.y, dr[0], dr[1]); if (d0 >= Te.REACH) continue;
      // (the walk, the pegs and a bath's worth of water before the closing: who cannot have it does not set out — and who is
      // far sets out before the hour of one's own, with Te.SLACK of the day to spare before it is too late)
      const last = Te.horas(b).fecha - (d0 * Te.WALK + AN.despir.dur + Te.DIP) / G.DAY_LEN;
      if (S.time > last || S.time < Math.min(Te.hourOf(v, b), last - Te.SLACK) - EPS) continue;
      if (lot < 0) lot = Te.lot(v);
      if (lot >= Te.wish(v, b)) continue;
      if (room(b, op) < 1 || full(b, op)) continue;
      const d = d0 + (hm ? Te.HOME * G.dist(hm.x, hm.y, b.x, b.y) : 0); if (d >= bd) continue;
      if (!G.W.reaches(v, dr[0], dr[1])) continue;
      best = b; bd = d;
    }
    return best;
  };
  // (the time's rule by itself, for the town's stroll — G.City.leisureTask, the door of before —: the walk, the pegs and a
  // bath's worth of water before the closing; who cannot have it does not set out. The stroll sent one at any hour, and
  // the closing took her out of the water with the entry paid and no bath: T-919)
  Te.inTime = function (v, b) { const dr = G.Vg.door(b); return S_().time <= Te.horas(b).fecha - (G.dist(v.x, v.y, dr[0], dr[1]) * Te.WALK + AN.despir.dur + Te.DIP) / G.DAY_LEN; };
  // the stoker at his post (D-204, D-227): the day of his baths open and the fire not enough to last to the closing — and
  // the moments before the doors open (Te.EARLY), the fire still to light. He does not leave the furnace for a bath, a
  // scroll, the theatre, the tavern or the plaza (the wishes of decide ask this), nor for a call from outside — a feast, a
  // celebration, a trial, a farewell at the quay: at the furnace's errand the post is the leg of his operation, as the
  // actor's stage (D-094; the hook below) —, nor for the house's water, which another of the house fetches (life.js), nor for a meal short of
  // starving, which he has before the doors open (Te.mealFirst). The fire fed to the end of the day — two logs give the
  // day —, he is as free as anyone. The water was cold on days full of bathers because the stoker had gone to bathe; and,
  // the wishes held, because he was at a trial, at a feast, seeing a ship off, at the well or at his meal when the doors
  // opened: 17 of 20 days of baths lit in the ready metropolis
  Te.EARLY = 0.05;   // (of the day, before the doors open: the stoker to his furnace, the wood by it — and the walk there
  Te.LEAD = 0.08;    //  from where he is, by Te.WALK, up to this much more: he is at the furnace when the doors open)
  Te.MEAL = 0.2;     // (of the day, before the doors open: from then to his post, the stoker's meal, if he is hungrier than Te.FED)
  Te.FED = 30;
  const stokerOf = v => { if (v.role !== 'foguista' || !v.job) return null; const b = S_().buildings.get(v.job); return b && b.type === 'banhos' && b.built ? b : null; };
  const lead = (v, b) => Te.EARLY + Math.min(Te.LEAD, (v.inside === b.id ? 0 : G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2)) * Te.WALK / G.DAY_LEN);
  Te.onDuty = function (v) {
    const b = stokerOf(v); if (!b) return false;
    const S = S_(); const h = Te.horas(b); const op = Te.dia(b);
    // (about to open — or the hour come and the day opening within the second: no gap for a meal to slip through. Once on
    // his way to the furnace he is on duty till the doors open: the walk's lead shrinks as he nears them, and the duty went
    // with it — he reached the furnace early, was free again, and went for a meal as the doors opened)
    if (!op) return S.time < h.fecha && !openedToday(b) && (S.time >= h.abre - lead(v, b) || (S.time >= h.abre - Te.EARLY - Te.LEAD && !!v.task && v.task.type === 'fornalha' && !!v.task.pre));
    if (op.st !== 'on' || !inHours(b)) return false;
    return op.data.calor < (h.fecha - S.time) * G.DAY_LEN;
  };
  // (the post is a leg, while he is at it — on the furnace's errand, the fire still to feed: a call from outside below 3
  // does not take the stoker from it, Vg.busy, Vg.handsBusy. Not the duty alone: one already at a feast or a trial when the
  // doors are about to open holds no leg — the call keeps him to its end, as it keeps anyone)
  A.hooks.leg.push(v => { const t = v.task; return t && (t.type === 'fornalha' || t.type === 'lenhaTermas') && Te.onDuty(v) ? 'fornalha' : null; });
  // (the stoker's meal fits his day: in the hours before his doors open, hungrier than Te.FED, he eats — decide asks —, and
  // the shift finds him fed: from a meal to the hunger that calls, more than half a day)
  Te.mealFirst = function (v) {
    const b = stokerOf(v); if (!b || !(v.hunger > Te.FED) || Te.dia(b) || openedToday(b)) return false;
    const S = S_(); const h = Te.horas(b); return S.time >= h.abre - Te.MEAL && S.time < h.abre - lead(v, b);
  };
  // how much this grown one wants a bath now (a choice of decide, among the others), or 0; one already on the way stays
  // for the bath — the work, a chat, the way home do not take one from it; hunger and sleep do —, and one inside, who has
  // paid, more so (D-203): no other wish takes one from the pegs or the water (the theatre's own, of a curious one, is worth up to
  // 1,05, a courtship 1,28: a bather left the water for the play with half a bath to go, the entry paid), only starving
  Te.urge = function (v, cur) {
    if (cur && cur.type === 'termas') return cur.st >= 1 ? Te.IN : 1;
    const S = S_();
    if (cur && (cur.pri || 0) >= Te.PRI) return 0; // (an errand under way that weighs as much: the bath waits, and hides no other wish)
    if (v.bathDay === S.day || v.age < 16 || v.captive || v.jail || v.aboard || v.ug || v.held || v.air || (v.carry && v.carry.n > EPS)) return 0;
    if (v.hunger > Te.HUNGRY || v.energy < Te.SPENT || A.isBody(v)) return 0;
    if (!E.byType(v.set, 'banhos').length) return 0;
    if (lost(v) || G.Vg.handsBusy(v) || Te.onDuty(v) || (G.Lar && (G.Lar.bedrest(v) || G.Lar.minder(v)))) return 0;
    return Te.pick(v) ? (v.sick > 0 ? 0.9 : 0.75) : 0;
  };
  Te.go = function (v, H) {
    const b = Te.pick(v); const t = b ? Te.visit(v, b, H) : null;
    if (t && G.inSim && cIdx && cS === S_() && cT === S_().clock) cIdx.set(b.id, (cIdx.get(b.id) || 0) + 1);
    return t;
  };
  function walkB(v, t, b, dt, H) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  // (inside: the world keeps one at the door, L-217; the interiors give one a free place of the use, t.use)
  function goIn(v, t, b, use) { const dr = G.Vg.door(b); v.x = dr[0]; v.y = dr[1]; v.inside = b.id; t.use = use; }
  const faceB = (v, b) => { const [cx, cy] = G.Village.center(b); G.faceTo(v, cx - v.x, cy - v.y); };
  // the entry: in a people of coin, from the bather's house (or purse) to the people's treasury — once (the key of the entry)
  function payEntry(v, op, b) {
    // (the life of the quarter: one more at the baths — paid or, in a people with no coin, let in. By its own key, 'banho':
    // a bath by day is no night out — counted as 'noite', the baths alone made a quarter «boêmio», D-228)
    if (!coin(b)) { if (G.Urban) G.Urban.noteB(b, 'banho', 1); return { ok: true, n: 0 }; }
    const d = op.data; const r = D.move(E.coinRef(v), 'f:' + op.fac, 'moedas', Te.FEE, { op: op.id, code: 'termas', by: v.id, key: 'te:' + op.id + ':' + d.q });
    if (!r.ok) return r;
    if (!r.again && G.Urban) G.Urban.noteB(b, 'banho', 1);
    d.q++; d.receita = r2(d.receita + Te.FEE); E.ensure(G.Fac.get(op.fac)); return { ok: true, n: Te.FEE };
  }
  // the entry back, to one who never got into the water — from the people's treasury, once (the key of the visit)
  function refund(v, op, m) {
    if (!(m.paid > EPS)) return;
    const d = op.data; const r = D.move('f:' + op.fac, E.coinRef(v), 'moedas', m.paid, { op: op.id, code: 'termas-volta', by: v.id, key: 'te:' + op.id + ':volta:' + v.id + ':' + m.t, part: true });
    if (r.ok) { d.receita = r2(d.receita - r.n); m.paid = r2(m.paid - r.n); d.voltas = (d.voltas || 0) + 1; }
  }
  function runBanho(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op)) return leave(v, op, H);
    const d = op.data;
    if (t.st === 0) {
      if (!Te.aberta(b)) return H.end(v);
      const r = walkB(v, t, b, dt, H); if (r < 0) { noWay.set(v.id, S.clock); return H.end(v); } if (r === 0) return;
      if (full(b, op)) { G.Vg.emote(v, 'sad', 1); say(v, 'termas_cheia', {}); return H.end(v); }
      const p = payEntry(v, op, b); if (!p.ok) return H.end(v);
      goIn(v, t, b, 'despir'); d.entradas++;
      d.banho[v.id] = { t: Math.round(S.clock * 10) / 10, st: 1, hot: 0, dur: Math.round(G.rr(18, 32)), paid: p.n };
      t.st = 1; v.actT = 0; return;
    }
    const m = d.banho[v.id]; if (!m) return leave(v, op, H);
    if (!inHours(b)) return leave(v, op, H);
    if (t.st === 1) { // at the pegs: the clothes off — and into the water when there is a place in it
      v.act = AN.despir.act; faceB(v, b); if (v.actT < AN.despir.dur) return;
      if (!water(b)) {
        // (no place in the water: one waits at the pegs; half a minute of it, dressed again, the entry back, and out)
        t.wt = (t.wt || 0) + dt; if (t.wt < Te.WAIT) return;
        refund(v, op, m); say(v, 'termas_cheia', {}); return leave(v, op, H);
      }
      const it = pool(b); // (chosen while still at the pegs: in the water, one would count in a pool already)
      m.st = 2; m.t2 = S.clock; m.it = it; t.st = 2; t.use = 'banhar'; t.item = it; v.actT = 0;
      say(v, d.calor > EPS ? 'banho_quente' : 'banho_frio', {}); return;
    }
    if (t.st === 2) { // in the water
      v.act = AN.banhar.act; if (v.actT < m.dur) return;
      bathe(v, op, 1); m.st = 3; t.st = 3; t.use = 'despir'; t.item = 0; v.actT = 0; return;
    }
    // dressed again, and out by the door
    v.act = AN.despir.act; if (v.actT < AN.despir.dur) return;
    return leave(v, op, H);
  }
  function leave(v, op, H) { if (op && op.data && op.data.banho && op.data.banho[v.id]) out(v, op, 'saiu'); return H.end(v); }

  // ------------------------------ the stoker ------------------------------
  // the fire low on a day open, with wood by the furnace: feed it; the baths' wood short, with the people's store having some
  // to spare: fetch it; and by the furnace on a day open
  Te.task = function (v, b, f, H) {
    const op = Te.dia(b); const isOpen = !!op && op.st === 'on' && inHours(b); const ref = 'b:' + b.id;
    const wood = D.free(ref, 'wood');
    if (isOpen && op.data.calor < LOW && wood >= 1) { A.join(op, v, 'foguista'); return H.setTask(v, { type: 'fornalha', id: b.id, op: op.id, pri: 1.05, st: 0 }); }
    if (wood < 2 && !(v.carry && v.carry.n > EPS)) {
      const n = Math.floor(Math.min(3 - wood, D.free('f:' + f.id, 'wood') - SPARE, D.room('v:' + v.id, 'wood', { to: ref })) + EPS);
      if (n >= 1) {
        // (the wood is his from the step he sets out: held in the people's store by an operation of the world — the works do not
        // take what is held — until it is in his hands; his errand cut, the hold goes, L-400. The fire of the baths is one
        // chore, feeding it and fetching its wood, at the furnace's priority: at 1 the house's water — 1,05 — took the stoker
        // on her way to the store, the hold went, and the works took the wood, L-407)
        const lop = G.inSim ? A.start('lenhaTermas', { at: b.id, set: b.set, fac: f.id, from: 'f:' + f.id, to: ref, by: v.id, why: 'a lenha da fornalha', goods: { wood: n } }) : null;
        if (lop && !D.reserve('f:' + f.id, 'wood', n, lop.id)) { A.end(lop, 'cancel', 'sem lenha'); return null; }
        return H.setTask(v, { type: 'lenhaTermas', id: b.id, n, pri: 1.05, st: 0, hold: lop ? lop.id : 0 });
      }
    }
    if (isOpen) { A.join(op, v, 'foguista'); return H.setTask(v, { type: 'fornalha', id: b.id, op: op.id, pri: 1, st: 0, idle: 1 }); }
    // (the moments before the doors open: at the furnace, waiting for the hour — D-227)
    if (!op && Te.onDuty(v)) return H.setTask(v, { type: 'fornalha', id: b.id, op: 0, pri: 1.05, st: 0, pre: 1 });
    return null;
  };
  // a log into the furnace, from the stoker's hands (wood carried in) or from the wood by it — in the ledger, burnt
  function feed(op, v) {
    const b = S_().buildings.get(op.at); const d = op.data; if (!b) return { ok: false, why: 'Os banhos não estão aqui.' };
    if (d.calor > Te.BURN + EPS) return { ok: false, why: 'A fornalha já está cheia: espere arder.' };
    const c = v.carry; const from = c && c.k === 'wood' && c.n > EPS && !c.op ? 'v:' + v.id : 'b:' + b.id;
    if (D.free(from, 'wood') < 1 - EPS) return { ok: false, why: 'Não há lenha para a fornalha.' };
    const r = D.use(from, 'wood', 1, { op: op.id, code: 'fornalha', by: v.id, key: 'te:' + op.id + ':lenha:' + d.lenha });
    if (!r.ok) return r;
    d.lenha = r2(d.lenha + r.n); d.calor = r2(d.calor + Te.BURN * r.n);
    return { ok: true, n: r.n };
  }
  Te.feed = (op, v) => (G.inSim && op && live(op) ? feed(op, v) : { ok: false, why: '' });
  function runFornalha(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    // (before the doors open: to the furnace, and there until the day opens — the next look feeds it)
    if (t.pre) {
      if (!b || !b.built || Te.dia(b) || !Te.onDuty(v)) return H.end(v);
      if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; goIn(v, t, b, 'alimentar'); } return; }
      faceB(v, b); return;
    }
    if (!b || !b.built || !op || !live(op) || !inHours(b)) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; t.wt = 0; goIn(v, t, b, 'alimentar'); } return; }
    v.act = AN.alimentarFogo.act; faceB(v, b);
    if (v.actT < AN.alimentarFogo.dur) return;
    v.actT = 0;
    if (op.data.calor <= Te.BURN + EPS && D.free('b:' + b.id, 'wood') >= 1 - EPS) { const r = feed(op, v); if (r.ok) { G.FX && G.FX.sparkle && G.FX.sparkle(v.x, v.y); t.n = (t.n || 0) + 1; if (t.n >= 2) return H.end(v); return; } }
    t.wt = (t.wt || 0) + AN.alimentarFogo.dur; if (t.wt > (t.idle ? 16 : 4)) return H.end(v);
  }
  function runLenha(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const f = G.Fac.ofV(v);
    if (!b || !b.built || b.type !== 'banhos' || !f) return H.end(v);
    if (t.st === 0) { const s = G.Village.nearestDropoff(v.x, v.y, v.set); if (!s) return H.end(v); const r = walkB(v, t, s, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = AN.levantar.act; if (v.actT < AN.levantar.contact) return;
    const ref = 'b:' + b.id;
    // (what was held for him is his now: the hold ends, and that much goes into his hands — it was beyond what the store keeps
    // for its works when he set out; with no hold, the wood beyond it, as before)
    const lop = t.hold ? A.get(t.hold) : null; const F = 'f:' + f.id;
    const held = lop && live(lop) ? (lop.rsv || []).reduce((s, r) => s + (r[0] === F && r[1] === 'wood' ? r[2] : 0), 0) : 0;
    if (lop && live(lop)) A.end(lop, 'ok', 'na mão');
    const n = Math.floor(Math.min(t.n, held > EPS ? Math.min(held, D.free(F, 'wood')) : D.free(F, 'wood') - SPARE, D.room('v:' + v.id, 'wood', { to: ref })) + EPS);
    if (n < 1) return H.end(v);
    const r = D.move(F, 'v:' + v.id, 'wood', n, { code: 'termas', by: v.id, to: ref }); if (!r.ok) return H.end(v);
    return H.setTask(v, { type: 'carga', to: ref, pri: 1, st: 0 });
  }
  // the hold of the stoker's wood: an operation of the world with no people of its own — the stoker on his way is its errand
  // (the task's hold) —, ended when the wood is in his hands, or the second his errand is not this one any more (a call, the
  // night, a death, a save: the errands are not saved), and what it held goes back to the store's free wood (L-400)
  A.def('lenhaTermas', {
    name: 'A lenha dos banhos', conserve: false, many: true,
    purpose: 'A lenha da fornalha, do armazém do povo aos banhos: segura para o foguista desde que ele sai para buscá-la.',
    needs: 'o foguista e lenha no armazém além da que ele guarda para as obras',
    tick(op) { const v = S_().villagers.get(op.by); const t = v && v.task; if (!t || t.type !== 'lenhaTermas' || t.hold !== op.id) A.end(op, 'int', 'a ida acabou'); },
  });

  // ------------------------------ the definition, and the god's body at the baths ------------------------------
  const where = b => G.Village.buildName(b).toLowerCase();
  const money = (b, n) => (G.Falas ? G.Falas.price((G.Fac.get(facOf(b)) || {}).civ || 'classico', n) : String(n));
  const de = b => 'd' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + where(b);
  A.def('termas', {
    name: 'Termas', conserve: false, many: false,
    purpose: 'O dia dos banhos: abrir na hora, receber quem vem (a entrada, num povo de moeda), a água quente enquanto a fornalha arde com a lenha do povo, fechar.',
    needs: 'banhos na cidade; para a água quente, o foguista e a lenha do armazém',
    title(op) { const S = S_(); const b = S.buildings.get(op.at); const d = op.data; return `O dia ${b ? de(b) : 'dos banhos'}: ${d.entradas} banhos${Object.keys(d.banho).length ? `, ${Object.keys(d.banho).length} lá dentro agora` : ''}${d.calor > EPS ? ', a água quente' : ', a água fria'}`; },
    avail(c, v, set) {
      for (const b of E.byType(set.id, 'banhos')) { const op = Te.dia(b); if (!op) continue; const ok = Te.aberta(b); return { ok, why: ok ? '' : 'fechados a esta hora', txt: `${G.cap(G.Village.buildName(b))} de ${set.name} ${ok ? 'estão abert' + (G.gen(G.Village.buildName(b)) === 'a' ? 'as' : 'os') : 'fecharam'}${ok && op.data.calor > EPS ? ', com a água quente' : ''}`, known: G.dist(v.x, v.y, b.x, b.y) < 30 }; }
      return null;
    },
    tick,
    text(v, t, op) {
      if (t.type === 'termas') { if (t.st === 0) return 'Indo para os banhos'; if (t.st === 1) return 'Tirando a roupa nos banhos'; if (t.st === 2) return op.data.calor > EPS ? 'Relaxando na água quente dos banhos' : 'Na água fria dos banhos'; return 'Vestindo-se para sair dos banhos'; }
      if (t.type === 'fornalha') return t.st < 1 ? 'Indo para a fornalha dos banhos' : t.pre ? 'Junto à fornalha, à espera da hora de abrir os banhos' : 'Alimentando a fornalha dos banhos';
      return null;
    },
    offers(v, x, y, r) {
      const S = S_(); const outL = [];
      for (const b of S.buildings.values()) {
        if (b.type !== 'banhos' || !b.built) continue;
        const at = G.Vg.door(b); if (v.inside !== b.id && G.dist(x, y, at[0], at[1]) > r + 2) continue;
        if (facOf(b) !== G.Fac.idOfV(v)) continue;
        const op = Te.dia(b); if (!op || !Te.aberta(b)) continue;
        const d = op.data; const m = d.banho[v.id]; const c = v.carry;
        if (v.job === b.id && v.role === 'foguista') {
          const wood = (c && c.k === 'wood' && c.n > EPS && !c.op) || D.free('b:' + b.id, 'wood') >= 1 - EPS;
          outL.push({ id: 'termas.alimentar:' + op.id, act: 'alimentar', op: op.id, label: 'Pôr lenha na fornalha', at, anim: 'alimentarFogo', hands: 2, use: 'alimentar', ok: wood && d.calor <= Te.BURN + EPS, why: !wood ? 'Não há lenha: traga do armazém.' : 'A fornalha já está cheia: espere arder.' });
        }
        if (m) {
          if (!m.done && m.st < 2) outL.push({ id: 'termas.banhar:' + op.id, act: 'banhar', op: op.id, label: d.calor > EPS ? 'Entrar na água quente' : 'Entrar na água (fria hoje)', at, anim: 'banhar', hands: 0, use: 'banhar', ok: water(b), why: 'Não há lugar na água agora: espere vagar.' });
          outL.push({ id: 'termas.sair:' + op.id, act: 'sair', op: op.id, label: 'Vestir-se e sair dos banhos', at, anim: 'despir', hands: 2, use: 'despir' });
          continue;
        }
        if (c && c.n > EPS) continue;
        outL.push({ id: 'termas.entrar:' + op.id, act: 'entrar', op: op.id, label: `Entrar nos banhos${coin(b) ? ` (${money(b, Te.FEE)})` : ''}`, at, anim: 'despir', hands: 2, use: 'despir', ok: !full(b, op) && (!coin(b) || E.purse(v) + EPS >= Te.FEE), why: full(b, op) ? 'Os banhos estão cheios.' : 'Falta dinheiro para a entrada.' });
      }
      return outL;
    },
    acts: {
      entrar: {
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'Os banhos fecharam.' }; const b = S_().buildings.get(op.at); if (!Te.aberta(b)) return { ok: false, why: 'Os banhos estão fechados.' }; if (op.data.banho[v.id]) return { ok: false, why: 'Você já está nos banhos.' }; if (full(b, op)) return { ok: false, why: 'Os banhos estão cheios.' }; if (coin(b) && E.purse(v) + EPS < Te.FEE) return { ok: false, why: 'Falta dinheiro para a entrada.' }; return { ok: true }; },
        run(v, o) { const op = A.get(o.op); const S = S_(); const b = S.buildings.get(op.at); const p = payEntry(v, op, b); if (!p.ok) return { ok: false, why: p.why || 'Não deu para pagar.' }; op.data.entradas++; op.data.banho[v.id] = { t: Math.round(S.clock * 10) / 10, st: 1, hot: 0, dur: 20, body: 1, paid: p.n }; return { ok: true, msg: `Você ${p.n ? `paga ${money(b, p.n)}, ` : ''}deixa a roupa nos cabides${op.data.calor > EPS ? ' — a água está quente' : ' — a água está fria hoje'}.` }; },
      },
      banhar: {
        deed: 'banho',
        can(v, o) { const op = A.get(o.op); const m = op && live(op) && op.data.banho[v.id]; if (!m || m.done) return { ok: false, why: m ? 'Você já se banhou.' : 'Você não entrou nos banhos.' }; const b = S_().buildings.get(op.at); return b && water(b) ? { ok: true } : { ok: false, why: 'Não há lugar na água agora: espere vagar.' }; },
        begin(v, o) { const op = A.get(o.op); const m = op.data.banho[v.id]; m.st = 2; m.t2 = S_().clock; m.dur = AN.banhar.dur; return { ok: true }; },
        run(v, o) { const op = A.get(o.op); const m = op.data.banho[v.id]; if (op.data.calor > EPS) m.hot = m.dur; const hot = op.data.calor > EPS; bathe(v, op, 1); m.st = 3; return { ok: true, msg: hot ? 'A água quente leva o cansaço embora.' : 'A água está fria: um banho rápido.' }; },
        abort(v, o) { const op = A.get(o.op); const m = op && op.data.banho[v.id]; if (m && !m.done) m.st = 1; },
      },
      sair: {
        can(v, o) { const op = A.get(o.op); return op && op.data.banho[v.id] ? { ok: true } : { ok: false, why: 'Você não está nos banhos.' }; },
        run(v, o) { const op = A.get(o.op); out(v, op, 'saiu'); return { ok: true, msg: 'Você se veste e sai dos banhos.' }; },
      },
      alimentar: {
        deed: 'trabalho',
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'Os banhos fecharam.' }; if (v.job !== op.at) return { ok: false, why: 'A fornalha não é sua.' }; if (op.data.calor > Te.BURN + EPS) return { ok: false, why: 'A fornalha já está cheia: espere arder.' }; return { ok: true }; },
        run(v, o) { const op = A.get(o.op); A.join(op, v, 'foguista'); const r = feed(op, v); return r.ok ? { ok: true, n: r.n, msg: 'Você põe lenha na fornalha. A água vai esquentar.' } : r; },
      },
    },
  });
  // (whoever dies or is taken leaves the water)
  A.hooks.gone.push(function (v) { for (const op of A.all()) if (op.def === 'termas' && live(op) && op.data.banho[v.id]) delete op.data.banho[v.id]; });

  // ------------------------------ the task machines, the stoker's job and the words of this file ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'termas') { runBanho(v, t, dt, H); return true; }
    if (t.type === 'fornalha') { runFornalha(v, t, dt, H); return true; }
    if (t.type === 'lenhaTermas') { runLenha(v, t, dt, H); return true; }
    return oldRun(v, t, dt, H);
  };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role === 'foguista') { const S = S_(); const b = v.job && S.buildings.get(v.job); const f = G.Fac.ofV(v); if (!b || !b.built || b.type !== 'banhos' || !f) return null; E.ensure(f); return Te.task(v, b, f, H); }
    return oldJob(v, H);
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'lenhaTermas') return t.st < 1 ? 'Indo ao armazém buscar lenha para os banhos' : 'Pegando lenha para os banhos';
    return oldText(v, t);
  };
  // the baths' panel: open or shut, the water, the day's book
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    if (b.type === 'banhos' && b.built) {
      const hr = Te.horas(b); const op = Te.dia(b); const hh = x => `${Math.floor(x * 24)}h`; const wood = Math.floor(D.free('b:' + b.id, 'wood') + EPS);
      if (op && live(op) && inHours(b)) { const d = op.data; h += `<div class="doing">Abertos (das ${hh(hr.abre)} às ${hh(hr.fecha)}): a água ${d.calor > EPS ? 'quente' : 'fria'}; ${d.entradas} banhos hoje${coin(b) ? `, ${esc(money(b, d.receita))} de entradas para o tesouro` : ''}${Object.keys(d.banho).length ? ` · ${Object.keys(d.banho).length} lá dentro agora` : ''} · ${d.lenha} de lenha queimada${keeperOf(b) ? '' : ' · sem foguista'}${wood ? ` · ${wood} de lenha junto à fornalha` : ''}</div>`; }
      else h += `<div class="doing">Fechados — abrem às ${hh(hr.abre)}${wood ? ` · ${wood} de lenha junto à fornalha` : ''}.</div>`;
    }
    return h;
  };
  A.hooks.canon.push(['termas', () => A.all().filter(op => op.def === 'termas' && live(op)).map(op => [op.id, op.at, op.data.day, op.data.entradas, r2(op.data.receita), r2(op.data.calor), op.data.lenha, Object.keys(op.data.banho).sort().join(',')])]);

  // ------------------------------ the save ------------------------------
  // (the errands are not saved: the bathers of an open day are put back where they were — at the pegs, in the water, dressing
  // — and the day goes on; L-190's rule. Only who was in the baths at the save: the book of the day keeps for a second
  // whoever left by another door, and the load put them back in the water; the save says who was in by the errand each one
  // had, and the one who had left is let go at the next look — L-435)
  (G.saveHooks = G.saveHooks || []).push({
    save(out) {
      const S = S_(); const L = [];
      for (const op of A.all()) if (op.def === 'termas' && live(op)) for (const id in op.data.banho || {}) { const v = S.villagers.get(+id); if (v && !op.data.banho[id].body && inside(v, op)) L.push(op.id + ':' + id); }
      out.termas = L;
    },
    load(o) {
      const S = S_();
      // (a save of before has no list: everyone in the book of the day, as it always loaded)
      const keep = o && Array.isArray(o.termas) ? new Set(o.termas) : null;
      for (const op of A.all()) {
        if (op.def !== 'termas' || !live(op)) continue;
        const d = op.data; d.banho = d.banho && typeof d.banho === 'object' ? d.banho : {};
        for (const id of Object.keys(d.banho)) {
          const v = S.villagers.get(+id); const m = d.banho[id];
          if (!v || m.body || v.captive || v.jail) { delete d.banho[id]; continue; }
          if (keep && !keep.has(op.id + ':' + id)) continue;
          const st = Math.max(1, Math.min(3, m.st || 1));
          // (in the water, in the pool one was in: the day's book keeps it — D-184)
          G.Vg.setTask(v, { type: 'termas', id: op.at, op: op.id, pri: 0.4, st, use: st === 2 ? 'banhar' : 'despir', item: st === 2 && typeof m.it === 'string' ? m.it : 0, kind: 'leisure' });
          if (v.task && v.task.type === 'termas') { v.inside = op.at; if (st === 2) v.actT = Math.max(0, S.clock - (m.t2 || S.clock)); } else delete d.banho[id];
        }
      }
    },
  });

  // ============================== the temple's offering ==============================
  const Tp = G.Templo = G.Templo || {};
  Tp.TYPES = { temple: 1 };
  const KEEP = { food: 6 }; const TREASURE = 12;
  // an offering of a house to a temple: what the one who offers gives, out of the house's pantry or chest (or what is in
  // the hands, a load of nobody's), onto the temple's shelf — in the ledger ('oferenda'). → { ok, n } | { ok: false, why }
  Tp.ofertar = function (v, b, k, n) {
    if (!G.inSim) return { ok: false, why: '' };
    if (!v || !b || !b.built || !Tp.TYPES[b.type]) return { ok: false, why: 'Não é um templo.' };
    if (!(n > EPS) || k === 'moedas' && !E.coinage(facOf(b))) return { ok: false, why: 'Não é oferenda.' };
    const c = v.carry; const h = E.homeOf(v);
    const from = c && c.k === k && c.n > EPS && !c.op && !c.to ? 'v:' + v.id : h ? 'h:' + h.id : null;
    if (!from) return { ok: false, why: 'Não há de onde dar.' };
    const m = Math.min(n, D.free(from, k)); if (!(m > EPS)) return { ok: false, why: 'Não há o que dar.' };
    const r = D.move(from, 'b:' + b.id, k, m, { code: 'oferenda', by: v.id, part: true }); if (!r.ok) return r;
    if (G.Urban) G.Urban.noteB(b, 'fe', 1); // (the life of the quarter: an offering)
    return { ok: true, n: r.n };
  };
  // each morning: the priests of the town eat of what was given (a meal each, who is hungry); the food beyond what the temple
  // keeps goes to the people's store, and the other gifts beyond its treasure too — in the ledger. Once a day for each
  // temple (the day written on it: a save in the middle does not do it twice)
  A.hooks.tick.push(function () {
    const S = S_(); if (!G.inSim) return;
    for (const set of S.settlements.values()) for (const t in Tp.TYPES) for (const b of E.byType(set.id, t)) {
      if (!b.inv || b.offDay === S.day) continue;
      b.offDay = S.day; const ref = 'b:' + b.id; const fid = facOf(b);
      for (const v of S.villagers.values()) {
        if (v.role !== 'sacerdote' || v.set !== b.set || v.captive || !(v.hunger > 25)) continue;
        if (D.free(ref, 'food') < 1 - EPS) break;
        const r = D.use(ref, 'food', 1, { code: 'sustento', by: v.id }); if (r.ok) v.hunger = Math.max(0, v.hunger - 35);
      }
      if (!D.exists('f:' + fid)) continue;
      for (const k of Object.keys(b.inv).sort()) {
        const keep = KEEP[k] !== undefined ? KEEP[k] : TREASURE; const over = D.free(ref, k) - keep;
        if (over >= 1 - EPS) D.store(ref, fid, k, Math.floor(over + EPS), { code: 'oferenda' });
      }
    }
  });

  // ============================== the public trades: the barracks, the scribes' hall, the tax house ==============================
  // (what the god's body can do there, by the same rules as the people who do it: drill with the soldiers before the
  // barracks; the scribe's registers — the order they keep, economy.js loyaltyMod —; the collector's round — a house's tax
  // into the bag, marked for the treasury, the bag to the treasury — and the mint, an ounce of gold into six coins)
  A.addAnim('treinar', { act: 'drill', dur: 4, contact: 3.6, hands: 2 });
  A.addAnim('escrever', { act: 'write', dur: 5, contact: 4.4, hands: 1 });
  A.addAnim('cunhar', { act: 'craft', dur: 6, contact: 5.4, hands: 2 });
  A.addAnim('cobrar', { act: 'knock', dur: 1.8, contact: 1.6, hands: 1 });
  const isHouse = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  const bagOf = (v, f) => { const c = v.carry; return c && c.k === 'moedas' && c.n > EPS && c.to === 'f:' + f.id ? c : null; };
  A.def('publico', {
    name: 'Serviço público', conserve: false, many: true,
    purpose: 'Os serviços da cidade que o corpo do deus pode fazer como quem os faz: treinar com os soldados diante do quartel, escrever os registros da administração, cobrar o imposto de porta em porta e levá-lo ao tesouro, cunhar moedas na coletoria.',
    needs: 'o quartel, a administração ou a coletoria da cidade — e, para escrever, cobrar e cunhar, o ofício de escriba ou de coletor de impostos',
    offers(v, x, y, r) {
      const S = S_(); const out = []; const f = G.Fac.ofV(v); if (!f || v.captive || v.age < 14) return out;
      const c = v.carry; const free = !(c && c.n > EPS); const bag = bagOf(v, f); const rate = E.taxRate(f);
      for (const b of S.buildings.values()) {
        if (!b.built || b.type === 'ruin' || facOf(b) !== f.id) continue;
        const at = G.Vg.door(b); if (v.inside !== b.id && G.dist(x, y, at[0], at[1]) > r + 2) continue;
        if (b.type === 'quartel' && free) out.push({ id: 'publico.treinar:' + b.id, act: 'treinar', b: b.id, label: 'Treinar com os soldados', at, anim: 'treinar', hands: 2, use: 'treinar' });
        if (b.type === 'administracao' && v.role === 'escriba' && v.job === b.id && free) out.push({ id: 'publico.escrever:' + b.id, act: 'escrever', b: b.id, label: 'Escrever os registros', at, anim: 'escrever', hands: 1, use: 'escrever' });
        if (b.type === 'coletoria' && v.role === 'cobrador' && v.job === b.id) {
          if (bag) out.push({ id: 'publico.entregar:' + b.id, act: 'entregar', b: b.id, label: `Entregar o imposto ao tesouro (${money(b, r2(bag.n))})`, at, anim: 'entregar', hands: 1 });
          if (free && E.coinage(f.id)) out.push({ id: 'publico.cunhar:' + b.id, act: 'cunhar', b: b.id, label: 'Cunhar moedas (1 de ouro dá 6 moedas)', at, anim: 'cunhar', hands: 2, use: 'conferir', ok: D.free('f:' + f.id, 'ouro') >= 1 - EPS, why: 'Não há ouro no armazém.' });
        }
        if (isHouse(b) && v.role === 'cobrador' && v.home !== b.id && rate > 0 && (free || bag)) {
          const due = r2((b.coin || 0) * rate);
          if (due > 0.01) out.push({ id: 'publico.cobrar:' + b.id, act: 'cobrar', b: b.id, label: `Cobrar o imposto desta casa (${money(b, due)})`, at, anim: 'cobrar', hands: 1, ok: !(b.taxT > S.clock), why: 'Esta casa já pagou há pouco.' });
        }
      }
      return out;
    },
    acts: {
      treinar: {
        deed: 'treino',
        can(v, o) { const b = S_().buildings.get(o.b); return b && b.built && b.type === 'quartel' ? { ok: true } : { ok: false, why: 'Não há quartel aqui.' }; },
        run(v) { if (v.trainDay !== S_().day) { v.trainDay = S_().day; A.note(v, 'memory', 'Treinei com os soldados diante do quartel.'); } return { ok: true, msg: 'Você treina com os soldados: a lança, o escudo, de novo.' }; },
      },
      escrever: {
        deed: 'escrita',
        can(v, o) { const b = S_().buildings.get(o.b); return b && v.job === b.id && v.role === 'escriba' ? { ok: true } : { ok: false, why: 'Só o escriba daqui escreve os registros.' }; },
        run(v) { const f = G.Fac.ofV(v); if (f) f._scribes = S_().clock; return { ok: true, msg: 'Você anota os grãos, as gentes e os impostos. A cidade fica em ordem.' }; },
      },
      cunhar: {
        deed: 'trabalho',
        can(v, o) { const b = S_().buildings.get(o.b); const f = G.Fac.ofV(v); if (!b || !f || v.job !== b.id || v.role !== 'cobrador') return { ok: false, why: 'Só o coletor daqui cunha moedas.' }; if (!E.coinage(f.id)) return { ok: false, why: 'O povo não conhece a moeda.' }; return D.free('f:' + f.id, 'ouro') >= 1 - EPS ? { ok: true } : { ok: false, why: 'Não há ouro no armazém.' }; },
        run(v, o) {
          const S = S_(); const b = S.buildings.get(o.b); const f = G.Fac.ofV(v); const ref = 'f:' + f.id;
          if (!D.use(ref, 'ouro', 1, { code: 'cunhagem', by: v.id }).ok) return { ok: false, why: 'Não deu.' };
          D.make(ref, 'moedas', 6, { code: 'cunhagem', by: v.id });
          if (!f._minted) { f._minted = S.day; const s = S.settlements.get(b.set); G.Village.log(`${f.name} cunhou suas primeiras moedas${s ? ' em ' + s.name : ''}.`, 'trade', b.x, b.y); }
          return { ok: true, n: 6, msg: 'Você funde o ouro e bate seis moedas com o cunho do povo.' };
        },
      },
      cobrar: {
        deed: 'cobranca',
        can(v, o) { const S = S_(); const h = S.buildings.get(o.b); const f = G.Fac.ofV(v); if (!h || !isHouse(h) || !f || v.role !== 'cobrador') return { ok: false, why: 'Só o coletor de impostos cobra.' }; if (h.taxT > S.clock) return { ok: false, why: 'Esta casa já pagou há pouco.' }; if (v.carry && v.carry.n > EPS && !bagOf(v, f)) return { ok: false, why: 'Suas mãos estão ocupadas.' }; return r2((h.coin || 0) * E.taxRate(f)) > 0.01 ? { ok: true } : { ok: false, why: 'Esta casa não tem o que pagar.' }; },
        run(v, o) {
          const S = S_(); const h = S.buildings.get(o.b); const f = G.Fac.ofV(v); const due = r2((h.coin || 0) * E.taxRate(f));
          const r = D.move('h:' + h.id, 'v:' + v.id, 'moedas', due, { code: 'imposto', by: v.id, to: 'f:' + f.id }); if (!r.ok) return { ok: false, why: r.why || 'Não deu.' };
          h.taxT = S.clock + G.DAY_LEN * 0.6;
          return { ok: true, n: r.n, msg: `A casa paga ${money(h, r.n)} de imposto. Agora é levar ao tesouro.` };
        },
      },
      entregar: {
        deed: 'carga',
        can(v, o) { const f = G.Fac.ofV(v); return f && bagOf(v, f) ? { ok: true } : { ok: false, why: 'Você não está com o imposto.' }; },
        run(v, o) { const f = G.Fac.ofV(v); const c = bagOf(v, f); const r = D.move('v:' + v.id, 'f:' + f.id, 'moedas', c.n, { code: 'imposto', by: v.id, to: 'f:' + f.id, part: true }); if (!r.ok) return { ok: false, why: r.why || 'Não deu.' }; E.ensure(f); f.eco.tax = (f.eco.tax || 0) + r.n; return { ok: true, n: r.n, msg: `Você entrega ${money(S_().buildings.get(o.b), r.n)} ao tesouro.` }; },
      },
    },
  });
})(window.G);
