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
//  vida da cidade, ou a casa: G.Termas.visit) — ninguém nasce
//  para encher piscina: num povo de moeda paga a entrada ao
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

  A.addAnim('despir', { act: 'interact', dur: 2, contact: 1.5, hands: 2 });
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
  // the places in the water: the interiors' allotter says whether one more has one (In.freePlace); with no plan, a count
  function full(b, op) {
    const In = G.Interiors; if (In && In.freePlace && b.ip && !In.freePlace(b, 'banhar')) return true;
    return Object.keys(op.data.banho).length >= Te.CAP;
  }
  Te.full = b => { const op = Te.dia(b); return !op || full(b, op); };

  // ------------------------------ the day opens and closes ------------------------------
  // (once a day, at its hour: the baths open with or without their stoker — the water is cold then —; a day ended is not
  // opened again)
  const openedToday = b => A.all().some(op => op.def === 'termas' && op.at === b.id && op.data && op.data.day === S_().day);
  function open(b) {
    const S = S_(); if (!G.inSim || !b || !b.built || Te.dia(b) || openedToday(b) || !inHours(b)) return null;
    const k = keeperOf(b);
    const op = A.start('termas', { at: b.id, set: b.set, fac: facOf(b), to: 'b:' + b.id, why: 'dia', by: k ? k.id : 0, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { day: S.day, entradas: 0, receita: 0, lenha: 0, calor: 0, quentes: 0, frios: 0, banho: {}, q: 0 } });
    if (op && k) A.join(op, k, 'foguista');
    return op;
  }
  Te.open = b => (G.inSim ? open(b) : null);
  function close(op, st, why) {
    const S = S_(); const d = op.data;
    // everyone out: who was in the water takes what the time in it gave, and goes out by the door
    for (const id of Object.keys(d.banho)) { const v = S.villagers.get(+id); if (!v) continue; out(v, op, 'saiu'); if (v.task && v.task.type === 'termas' && v.task.op === op.id) G.Vg.endTask(v); }
    d.banho = {}; d.calor = 0;
    A.end(op, st, why);
  }
  Te.close = (op, why) => { if (op && live(op) && G.inSim) close(op, 'ok', why || 'fechada'); };
  A.hooks.tick.push(function () {
    const S = S_();
    for (const set of S.settlements.values()) for (const b of E.byType(set.id, 'banhos')) if (!Te.dia(b) && inHours(b)) open(b);
  });
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
    if (coin(b) && E.purse(v) + EPS < Te.FEE) return null;
    const dr = G.Vg.door(b); if (!G.W.reaches(v, dr[0], dr[1])) return null;
    void S; return H.setTask(v, { type: 'termas', id: b.id, op: op.id, pri: 0.4, st: 0 });
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
    if (!coin(b)) return { ok: true, n: 0 };
    const d = op.data; const r = D.move(E.coinRef(v), 'f:' + op.fac, 'moedas', Te.FEE, { op: op.id, code: 'termas', by: v.id, key: 'te:' + op.id + ':' + d.q });
    if (!r.ok) return r;
    d.q++; d.receita = r2(d.receita + Te.FEE); E.ensure(G.Fac.get(op.fac)); return { ok: true, n: Te.FEE };
  }
  function runBanho(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op)) return leave(v, op, H);
    const d = op.data;
    if (t.st === 0) {
      if (!Te.aberta(b)) return H.end(v);
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r === 0) return;
      if (full(b, op)) { G.Vg.emote(v, 'sad', 1); say(v, 'termas_cheia', {}); return H.end(v); }
      const p = payEntry(v, op, b); if (!p.ok) return H.end(v);
      goIn(v, t, b, 'despir'); d.entradas++;
      d.banho[v.id] = { t: Math.round(S.clock * 10) / 10, st: 1, hot: 0, dur: Math.round(G.rr(18, 32)) };
      t.st = 1; v.actT = 0; return;
    }
    const m = d.banho[v.id]; if (!m) return leave(v, op, H);
    if (!inHours(b)) return leave(v, op, H);
    if (t.st === 1) { // at the pegs: the clothes off
      v.act = AN.despir.act; faceB(v, b); if (v.actT < AN.despir.dur) return;
      m.st = 2; m.t2 = S.clock; t.st = 2; t.use = 'banhar'; v.actT = 0;
      say(v, d.calor > EPS ? 'banho_quente' : 'banho_frio', {}); return;
    }
    if (t.st === 2) { // in the water
      v.act = AN.banhar.act; if (v.actT < m.dur) return;
      bathe(v, op, 1); m.st = 3; t.st = 3; t.use = 'despir'; v.actT = 0; return;
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
      if (n >= 1) return H.setTask(v, { type: 'lenhaTermas', id: b.id, n, pri: 1, st: 0 });
    }
    if (isOpen) { A.join(op, v, 'foguista'); return H.setTask(v, { type: 'fornalha', id: b.id, op: op.id, pri: 1, st: 0, idle: 1 }); }
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
    const n = Math.floor(Math.min(t.n, D.free('f:' + f.id, 'wood') - SPARE, D.room('v:' + v.id, 'wood', { to: ref })) + EPS);
    if (n < 1) return H.end(v);
    const r = D.move('f:' + f.id, 'v:' + v.id, 'wood', n, { code: 'termas', by: v.id, to: ref }); if (!r.ok) return H.end(v);
    return H.setTask(v, { type: 'carga', to: ref, pri: 1, st: 0 });
  }

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
      if (t.type === 'fornalha') return t.st < 1 ? 'Indo para a fornalha dos banhos' : 'Alimentando a fornalha dos banhos';
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
          if (!m.done && m.st < 2) outL.push({ id: 'termas.banhar:' + op.id, act: 'banhar', op: op.id, label: d.calor > EPS ? 'Entrar na água quente' : 'Entrar na água (fria hoje)', at, anim: 'banhar', hands: 0, use: 'banhar' });
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
        run(v, o) { const op = A.get(o.op); const S = S_(); const b = S.buildings.get(op.at); const p = payEntry(v, op, b); if (!p.ok) return { ok: false, why: p.why || 'Não deu para pagar.' }; op.data.entradas++; op.data.banho[v.id] = { t: Math.round(S.clock * 10) / 10, st: 1, hot: 0, dur: 20, body: 1 }; return { ok: true, msg: `Você ${p.n ? `paga ${money(b, p.n)}, ` : ''}deixa a roupa nos cabides${op.data.calor > EPS ? ' — a água está quente' : ' — a água está fria hoje'}.` }; },
      },
      banhar: {
        deed: 'banho',
        can(v, o) { const op = A.get(o.op); const m = op && live(op) && op.data.banho[v.id]; return m && !m.done ? { ok: true } : { ok: false, why: m ? 'Você já se banhou.' : 'Você não entrou nos banhos.' }; },
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
  // — and the day goes on; L-190's rule)
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() {
      const S = S_();
      for (const op of A.all()) {
        if (op.def !== 'termas' || !live(op)) continue;
        const d = op.data; d.banho = d.banho && typeof d.banho === 'object' ? d.banho : {};
        for (const id of Object.keys(d.banho)) {
          const v = S.villagers.get(+id); const m = d.banho[id];
          if (!v || m.body || v.captive || v.jail) { delete d.banho[id]; continue; }
          const st = Math.max(1, Math.min(3, m.st || 1));
          G.Vg.setTask(v, { type: 'termas', id: op.at, op: op.id, pri: 0.4, st, use: st === 2 ? 'banhar' : 'despir', kind: 'leisure' });
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
})(window.G);
