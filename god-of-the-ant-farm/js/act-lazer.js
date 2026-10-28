'use strict';
// ============================================================
//  O lazer da cidade (o adendo 4.3): o teatro (G.Teatro), a
//  biblioteca (G.Biblioteca) e a praça (G.Praca).
//
//  O teatro. O espetáculo do dia é uma operação do mundo
//  ('espetaculo'): as portas abrem na hora dele, os atores do teatro
//  sobem ao palco (o uso 'atuar' da planta; o romano luta de mentira
//  na arena, 'lutar'), a peça começa com eles lá, dura o que dura e
//  acaba com os aplausos. O público vem por vontade sua (a vida da
//  cidade, as rotinas da casa: G.Teatro.visit) — num povo de moeda
//  paga a entrada ao tesouro —, senta nas fileiras ('assistir'; no
//  salão nórdico, os bancos: 'sentar'), assiste, aplaude e sai. Sem
//  ator, não há peça: quem pagou recebe de volta. Os atores recebem
//  do tesouro por peça (num povo de moeda). O corpo do deus assiste,
//  ou, sendo ator, atua — pelas mesmas portas.
//
//  A biblioteca. Quem vem ler senta numa mesa de leitura ('ler') e lê
//  um rolo; cada leitura soma à pesquisa do povo um tanto — e não mais
//  que um tanto por dia em cada biblioteca —; o copista, o ofício
//  dela, copia rolos na mesa do escriba ('escrever'), que também
//  somam. O corpo lê, e sendo o copista, copia.
//
//  A praça. A conversa de quem passa é a vida da cidade (city.js); o
//  corpo do deus pode falar ao povo de cima da pedra ('falar'): quem
//  está na praça ouve, e a cidade fica um pouco mais leal — uma vez
//  por dia.
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco; if (!A || !D || !E || !G.BDEF.teatro || !G.BDEF.biblioteca) return;
  const EPS = 1e-6;
  const r2 = x => Math.round(x * 100) / 100;
  const live = A.live;
  const S_ = () => G.S;
  const say = (v, key, ctx) => G.Falas && v && G.Falas.say(v, key, ctx);
  const facOf = b => G.Village.facOfSet(b.set);
  const coin = b => E.coinage(facOf(b));
  const money = (b, n) => (G.Falas ? G.Falas.price((G.Fac.get(facOf(b)) || {}).civ || 'classico', n) : String(n));
  const where = b => G.Village.buildName(b).toLowerCase();
  const de = b => 'd' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + where(b);
  const n_ = b => 'n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + where(b);
  const near = (v, b) => v.inside === b.id || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h) + 2.5;
  // (inside: the world keeps one at the door, L-217; the interiors give one a free place of the use, t.use)
  function goIn(v, t, b, use) { const dr = G.Vg.door(b); v.x = dr[0]; v.y = dr[1]; v.inside = b.id; t.use = use; }
  function walkB(v, t, b, dt, H) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  // (a place of one of these uses in the plan — the interiors' allotter, counting who is inside: In.freePlace, P4 —; a
  // building with no plan, the count of today)
  const In = () => G.Interiors;
  const planned = b => { const I = In(); return !!(I && I.freePlace && I.table && I.table(b)); };
  const hasUse = (b, use) => { const I = In(); return !!(I && I.slots && planned(b) && I.slots(b, use).length); };

  // ============================== the theatre ==============================
  const Tt = G.Teatro = {};
  Tt.FEE = 0.1;    // (the entry, in the people's money: a small coin)
  Tt.WAGE = 0.3;   // (what the treasury pays each actor for a show)
  Tt.PLAY = 40;    // (the seconds of the play, of the world)
  Tt.CAP = 24;     // (the seats of a theatre whose plan does not say)
  Tt.LATE = 10;    // (one may still come in this long after the play began)
  A.addAnim('assistir', { act: 'sit', dur: 2, contact: 1.2, hands: 0 });
  A.addAnim('atuar', { act: 'talk', dur: 6, contact: 5.4, hands: 2 });
  A.addAnim('lutarJogo', { act: 'fight', dur: 4, contact: 3.6, hands: 2 });
  // ---- the actor: a trade of the town (two for each theatre standing, in a town of twelve grown hands or more; under the
  // ceiling of the trades, D-090)
  G.BDEF.teatro.jobs = 2; G.BDEF.teatro.role = 'ator';
  G.ROLE.ator = ['Ator', 'Atriz'];
  if (!E.JOB_ROLES.includes('ator')) E.JOB_ROLES.push('ator');
  E.JOB_OF.ator = ['teatro'];
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.ator = '#8a3a5a';
  // ---- hours, the show of the day, who acts
  Tt.horas = b => ({ abre: 0.48, peca: 0.56, fecha: 0.74 });
  Tt.WAITS = 0.08; // (the play begins at its hour with an actor on the stage; this long after it with none, there is no play)
  const inHours = b => { const h = Tt.horas(b); const t = S_().time; return t >= h.abre - EPS && t < h.fecha; };
  Tt.inHours = inHours;
  let dIdx = null, dS = null, dN = -1, dT = -1;
  G.worldHooks.push(() => { dIdx = null; dS = null; dN = -1; dT = -1; });
  function days() { const S = S_(); const L = A.all(); if (dIdx && dS === S && dN === L.length && dT === S.clock) return dIdx; dIdx = new Map(); dS = S; dN = L.length; dT = S.clock; for (const op of L) if (op.def === 'espetaculo' && live(op)) dIdx.set(op.at, op); return dIdx; }
  Tt.dia = function (b) { const id = b && (b.id || b); const op = days().get(id); return op && live(op) ? op : null; };
  const actorsOf = b => { const out = []; for (const v of S_().villagers.values()) if (v.job === b.id && v.role === 'ator' && (A.able(v) || A.isBody(v))) out.push(v); return out; };
  Tt.actorsOf = actorsOf;
  // (the stage: the actors' place in the plan — the Roman arena's floor is for the games, 'lutar' —; the seats: the rows,
  // or the benches of a northern hall)
  const stageUse = b => (hasUse(b, 'atuar') || !hasUse(b, 'lutar') ? 'atuar' : 'lutar');
  const seatUse = b => (hasUse(b, 'assistir') || !hasUse(b, 'sentar') ? 'assistir' : 'sentar');
  Tt.stageUse = stageUse; Tt.seatUse = seatUse;
  function full(b, op) {
    const I = In(); if (planned(b)) return !I.freePlace(b, [seatUse(b), 'sentar']);
    return Object.keys(op.data.plateia).length >= Tt.CAP;
  }
  Tt.full = b => { const op = Tt.dia(b); return !op || full(b, op); };
  // (open to the public: the doors open, the play not too far gone)
  const aberto = (b, op) => !!op && op.st === 'on' && inHours(b) && (op.data.fase === 'portas' || (op.data.fase === 'peca' && S_().clock - op.data.t0 < Tt.LATE));
  Tt.aberto = b => aberto(b, Tt.dia(b));
  // (who is in the audience: a person of the world in a seat by the errand of this show, or the god's body by its door)
  function seated(v, op, b) {
    const m = op.data.plateia[v.id]; if (!m) return false;
    if (m.body) return A.isBody(v) && near(v, b);
    return !!(v.task && v.task.type === 'teatro' && v.task.op === op.id && v.task.st >= 1);
  }
  function onStage(v, op, b) {
    const m = op.data.atores[v.id]; if (!m) return false;
    if (m.body) return A.isBody(v) && near(v, b);
    return !!(v.task && v.task.type === 'atuar' && v.task.op === op.id && v.task.st >= 1);
  }
  // ---- the show opens, plays, ends
  const openedToday = b => A.all().some(op => op.def === 'espetaculo' && op.at === b.id && op.data && op.data.day === S_().day);
  function open(b) {
    const S = S_(); if (!G.inSim || !b || !b.built || Tt.dia(b) || openedToday(b) || !inHours(b)) return null;
    if (!actorsOf(b).length) return null; // (no actors, no show today)
    return A.start('espetaculo', { at: b.id, set: b.set, fac: facOf(b), to: 'b:' + b.id, why: 'dia', by: 0, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { day: S.day, fase: 'portas', t0: 0, tf: 0, entradas: 0, receita: 0, voltas: 0, pagos: 0, vistos: 0, atores: {}, plateia: {}, q: 0 } });
  }
  Tt.open = b => (G.inSim ? open(b) : null);
  // the entry: in a people of coin, from the spectator's house (or purse) to the people's treasury — once (the key of it)
  function payEntry(v, op, b) {
    if (!coin(b)) return { ok: true, n: 0 };
    const d = op.data; const r = D.move(E.coinRef(v), 'f:' + op.fac, 'moedas', Tt.FEE, { op: op.id, code: 'teatro', by: v.id, key: 'tt:' + op.id + ':' + d.q });
    if (!r.ok) return r;
    d.q++; d.receita = r2(d.receita + Tt.FEE); return { ok: true, n: Tt.FEE };
  }
  // the entry back, to one who saw no play — from the people's treasury, once
  function refund(v, op, m) {
    if (!(m.paid > EPS)) return;
    const d = op.data; const r = D.move('f:' + op.fac, E.coinRef(v), 'moedas', m.paid, { op: op.id, code: 'teatro-volta', by: v.id, key: 'tt:' + op.id + ':volta:' + v.id + ':' + m.t, part: true });
    if (r.ok) { d.receita = r2(d.receita - r.n); m.paid = r2(m.paid - r.n); d.voltas++; }
  }
  // the actors' pay for a show: from the treasury to each one's house (or purse), in a people of coin that has it
  function wage(op, b, v) {
    if (!coin(b)) return 0; const f = G.Fac.get(op.fac); if (!f || D.free('f:' + f.id, 'moedas') + EPS < Tt.WAGE) { v.unpaid = (v.unpaid || 0) + 1; return 0; }
    const r = D.move('f:' + f.id, E.coinRef(v), 'moedas', Tt.WAGE, { op: op.id, code: 'salario', by: v.id, key: 'tt:' + op.id + ':cache:' + v.id });
    if (!r.ok) return 0; v.unpaid = 0; E.ensure(f); f.eco.wages = r2((f.eco.wages || 0) + r.n); op.data.pagos = r2(op.data.pagos + r.n); return r.n;
  }
  function close(op, st, why) {
    const S = S_(); const d = op.data;
    for (const id of Object.keys(d.plateia)) { const v = S.villagers.get(+id); if (v && v.task && v.task.type === 'teatro' && v.task.op === op.id) G.Vg.endTask(v); }
    for (const id of Object.keys(d.atores)) { const v = S.villagers.get(+id); if (v && v.task && v.task.type === 'atuar' && v.task.op === op.id) G.Vg.endTask(v); }
    d.plateia = {}; d.atores = {};
    A.end(op, st, why);
  }
  Tt.close = (op, why) => { if (op && live(op) && G.inSim) close(op, 'ok', why || 'fechado'); };
  // (no play: who paid gets it back, and goes home)
  function cancel(op, b, why) {
    const S = S_(); const d = op.data;
    for (const id of Object.keys(d.plateia)) { const v = S.villagers.get(+id); if (v) refund(v, op, d.plateia[id]); }
    if (Object.keys(d.plateia).length) { const v = S.villagers.get(+Object.keys(d.plateia)[0]); say(v, 'teatro_sem_peca', {}); }
    close(op, 'int', why);
  }
  // (the doors open: the actors called to the stage, when free of what weighs more — hunger, sleep, a storm, a feast, a
  // trial — and of an errand of their own)
  function callActors(b, op) {
    if (!G.inSim) return;
    for (const v of actorsOf(b)) {
      if (op.data.atores[v.id] || A.isBody(v) || v.sleeping) continue;
      const t = v.task; if (t && (t.type === 'atuar' || (t.pri || 0) > 1 || t.type === 'shelter' || t.type === 'carga')) continue;
      G.Vg.give(v, { type: 'atuar', id: b.id, op: op.id, pri: 1.05, st: 0 });
    }
  }
  // the applause: who watched the play, glad of it (a little more devout, a sorrow lighter, the town a little more loyal); the
  // actors, paid
  function applause(op, b) {
    const S = S_(); const d = op.data; const set = S.settlements.get(b.set); let n = 0;
    for (const id of Object.keys(d.plateia)) {
      const v = S.villagers.get(+id); const m = d.plateia[id]; if (!v || m.st !== 2) continue;
      n++; m.done = 1; v.devotion = Math.min(100, (v.devotion || 0) + 0.5); G.Vg.emote(v, 'happy', 3);
      if (v.mourn > 0) v.mourn = Math.max(0, v.mourn - G.DAY_LEN * 0.1);
      if (v.showDay !== S.day) { v.showDay = S.day; A.note(v, 'memory', `Vimos um espetáculo ${n_(b)}.`); }
    }
    d.vistos = n;
    if (set && n) set.loyalty = Math.min(100, (set.loyalty ?? 60) + Math.min(2, 0.2 * n));
    for (const id of Object.keys(d.atores)) {
      const v = S.villagers.get(+id); if (!v) continue; wage(op, b, v); G.Vg.emote(v, 'happy', 3);
      if (v.showDay !== S.day) { v.showDay = S.day; A.note(v, 'memory', `Atuamos ${n_(b)}${n ? ` para ${n} ${n > 1 ? 'pessoas' : 'pessoa'}` : ', para as fileiras vazias'}.`); }
    }
    const first = S.villagers.get(+Object.keys(d.plateia)[0]); if (first) say(first, 'teatro_aplausos', {});
  }
  function tick(op) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data;
    if (!b || b.type !== 'teatro' || !b.built) return close(op, 'int', 'o teatro caiu');
    if (facOf(b) !== op.fac) return close(op, 'int', 'o teatro mudou de dono');
    // who left by another door is no longer in the audience, or on the stage
    for (const id of Object.keys(d.plateia)) { const v = S.villagers.get(+id); if (!v || !seated(v, op, b)) delete d.plateia[id]; }
    for (const id of Object.keys(d.atores)) { const v = S.villagers.get(+id); if (!v || !onStage(v, op, b)) delete d.atores[id]; }
    const h = Tt.horas(b); const actors = Object.keys(d.atores).length;
    if (d.fase === 'portas') {
      if (d.day !== S.day || S.time >= h.fecha) return cancel(op, b, 'fechou');
      callActors(b, op);
      if (S.time >= h.peca - EPS && actors) {
        d.fase = 'peca'; d.t0 = S.clock; A.log(op, 'peca', actors, Object.keys(d.plateia).length);
        for (const id of Object.keys(d.plateia)) d.plateia[id].st = 2;
        say(S.villagers.get(+Object.keys(d.atores)[0]), 'teatro_comeca', {});
        return;
      }
      if (S.time >= h.peca + Tt.WAITS) return cancel(op, b, 'sem atores');
      return;
    }
    if (d.fase === 'peca') {
      // (the actors gone from the stage half a minute: the play stopped there — no applause, no refund: it was seen in part)
      if (!actors) { if (!d.sem) d.sem = S.clock; else if (S.clock - d.sem > 30) return close(op, 'int', 'a peça parou'); } else d.sem = 0;
      if (S.clock - d.t0 >= Tt.PLAY) { applause(op, b); d.fase = 'fim'; d.tf = S.clock; A.log(op, 'fim', d.vistos); }
      return;
    }
    if (d.fase === 'fim' && S.clock - d.tf >= 4) return close(op, 'ok', 'acabou');
  }
  A.hooks.tick.push(function () {
    const S = S_();
    for (const set of S.settlements.values()) for (const b of E.byType(set.id, 'teatro')) if (!Tt.dia(b) && inHours(b)) open(b);
  });
  // ---- the spectator (the errand 'teatro': st 0 on the way, 1 seated waiting, 2 watching)
  // the theatre for this person now: its show open, in reach, a seat free, and — in a people of coin — a house that can pay
  // the entry; none of it, no errand (nobody is made up to fill a row)
  Tt.visit = function (v, b, H) {
    H = H || G.Vg.H;
    if (!v || !b || v.captive || v.jail || v.age < 6 || (v.carry && v.carry.n > EPS) || A.isBody(v)) return null;
    if (b.type !== 'teatro' || !b.built || facOf(b) !== G.Fac.idOfV(v)) return null;
    const op = Tt.dia(b); if (!aberto(b, op) || full(b, op) || op.data.plateia[v.id] || op.data.atores[v.id]) return null;
    if (coin(b) && E.purse(v) + EPS < Tt.FEE) return null;
    const dr = G.Vg.door(b); if (!G.W.reaches(v, dr[0], dr[1])) return null;
    return H.setTask(v, { type: 'teatro', id: b.id, op: op.id, pri: 0.45, st: 0 });
  };
  function leave(v, op, H) { if (op && op.data && op.data.plateia && op.data.plateia[v.id]) delete op.data.plateia[v.id]; return H.end(v); }
  function runPlateia(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op)) return leave(v, op, H);
    const d = op.data;
    if (t.st === 0) {
      if (!aberto(b, op)) return H.end(v);
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r === 0) return;
      if (full(b, op)) { G.Vg.emote(v, 'sad', 1); say(v, 'teatro_cheio', {}); return H.end(v); }
      const p = payEntry(v, op, b); if (!p.ok) return H.end(v);
      goIn(v, t, b, seatUse(b)); d.entradas++;
      d.plateia[v.id] = { t: Math.round(S.clock * 10) / 10, st: d.fase === 'peca' ? 2 : 1, paid: p.n };
      t.st = 1; v.actT = 0; return;
    }
    const m = d.plateia[v.id]; if (!m) return leave(v, op, H);
    v.act = 'sit'; t.st = m.st === 2 ? 2 : 1;
    if (d.fase === 'fim' && m.done) { G.Vg.emote(v, 'happy', 1.5); }
  }
  // ---- the actor (the errand 'atuar': st 0 on the way, 1 on the stage)
  // the show of the actor's theatre, before its end: to the stage
  Tt.task = function (v, b, f, H) {
    const op = Tt.dia(b); if (!op || op.st !== 'on' || op.data.fase === 'fim' || !inHours(b)) return null;
    return H.setTask(v, { type: 'atuar', id: b.id, op: op.id, pri: 1.05, st: 0 });
  };
  function runAtor(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op) || op.data.fase === 'fim') { if (op && op.data && op.data.atores) delete op.data.atores[v.id]; return H.end(v); }
    const d = op.data;
    if (t.st === 0) {
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r === 0) return;
      goIn(v, t, b, stageUse(b)); d.atores[v.id] = { t: Math.round(S.clock * 10) / 10 }; A.join(op, v, 'ator');
      t.st = 1; v.actT = 0; return;
    }
    if (!d.atores[v.id]) return H.end(v);
    v.act = d.fase === 'peca' ? (stageUse(b) === 'lutar' ? AN_.lutarJogo.act : AN_.atuar.act) : 'wait';
  }
  const AN_ = A.ANIM;

  // ============================== the library ==============================
  const Bi = G.Biblioteca = {};
  Bi.READ = 0.25;  // (the research a reading adds to its people's)
  Bi.COPY = 0.4;   // (and a scroll copied)
  Bi.MAX = 8;      // (readings a library counts in a day — and copies: MAX - 2)
  Bi.CAP = 8;      // (the readers of a library whose plan does not say)
  A.addAnim('ler', { act: 'read', dur: 4, contact: 3, hands: 1 });
  A.addAnim('copiar', { act: 'write', dur: 6, contact: 5.4, hands: 1 });
  G.BDEF.biblioteca.jobs = 1; G.BDEF.biblioteca.role = 'copista';
  G.ROLE.copista = ['Copista', 'Copista'];
  if (!E.JOB_ROLES.includes('copista')) E.JOB_ROLES.push('copista');
  E.JOB_OF.copista = ['biblioteca'];
  if (G.Art && G.Art.CLOTH) G.Art.CLOTH.copista = '#5a5a7a';
  Bi.horas = b => ({ abre: 0.28, fecha: 0.72 });
  const libOpen = b => { const h = Bi.horas(b); const t = S_().time; return t >= h.abre - EPS && t < h.fecha; };
  Bi.aberta = b => !!b && b.built && b.type === 'biblioteca' && libOpen(b);
  // the library's book of the day (on the building, in the save): who reads now, how many readings and copies counted today
  function book(b) {
    const S = S_(); const k = b.livros && typeof b.livros === 'object' ? b.livros : (b.livros = { day: S.day, lidos: 0, copias: 0, pts: 0, quem: {} });
    if (k.day !== S.day) { k.day = S.day; k.lidos = 0; k.copias = 0; k.pts = 0; }
    if (!k.quem || typeof k.quem !== 'object') k.quem = {};
    return k;
  }
  Bi.book = book;
  function readersFull(b) {
    const I = In(); if (planned(b)) return !I.freePlace(b, 'ler');
    return Object.keys(book(b).quem).length >= Bi.CAP;
  }
  // what a reading or a copy adds to the people's research: a little, and no more than the day of each library allows
  function learn(b, pts, kind) {
    const f = G.Fac.get(facOf(b)); const k = book(b);
    if (kind === 'ler' ? k.lidos >= Bi.MAX : k.copias >= Bi.MAX - 2) return 0;
    if (kind === 'ler') k.lidos++; else k.copias++;
    if (!f || !f.tech) return 0;
    if (!f.tech.cur && G.Civ && G.Civ.nextTech) f.tech.cur = G.Civ.nextTech(f);
    if (!f.tech.cur) return 0;
    f.tech.pts = r2((f.tech.pts || 0) + pts); k.pts = r2(k.pts + pts); return pts;
  }
  Bi.learn = (b, pts, kind) => (G.inSim ? learn(b, pts, kind) : 0);
  // ---- the reader (the errand 'ler': st 0 on the way, 1 reading)
  Bi.visit = function (v, b, H) {
    H = H || G.Vg.H;
    if (!v || !b || v.captive || v.jail || v.age < 10 || (v.carry && v.carry.n > EPS) || A.isBody(v)) return null;
    if (b.type !== 'biblioteca' || !b.built || facOf(b) !== G.Fac.idOfV(v) || !libOpen(b) || readersFull(b)) return null;
    const f = G.Fac.get(facOf(b)); if (!f || !f.tech || !f.tech.known || !f.tech.known.escrita) return null; // (reading is the writing's)
    const dr = G.Vg.door(b); if (!G.W.reaches(v, dr[0], dr[1])) return null;
    return H.setTask(v, { type: 'ler', id: b.id, pri: 0.35, st: 0 });
  };
  function runLeitor(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id);
    const out = () => { if (b && b.livros && b.livros.quem) delete b.livros.quem[v.id]; return H.end(v); };
    if (!b || !b.built || b.type !== 'biblioteca') return out();
    if (t.st === 0) {
      if (!libOpen(b)) return H.end(v);
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r === 0) return;
      if (readersFull(b)) { G.Vg.emote(v, 'sad', 1); return H.end(v); }
      goIn(v, t, b, 'ler'); const k = book(b); k.quem[v.id] = { t: Math.round(S.clock * 10) / 10, dur: Math.round(G.rr(20, 34)) };
      t.st = 1; v.actT = 0; return;
    }
    const m = book(b).quem[v.id]; if (!m) return H.end(v);
    if (!libOpen(b)) return out();
    v.act = AN_.ler.act; if (v.actT < m.dur) return;
    learn(b, Bi.READ, 'ler');
    if (v.readDay !== S.day) { v.readDay = S.day; A.note(v, 'memory', `Li um rolo ${n_(b)}.`); }
    return out();
  }
  // ---- the copyist (the errand 'copiar' at the scribe's desk, 'escrever')
  Bi.task = function (v, b, f, H) {
    if (!libOpen(b) || book(b).copias >= Bi.MAX - 2) return null;
    return H.setTask(v, { type: 'copiar', id: b.id, pri: 1, st: 0, dur: Math.round(G.rr(24, 36)) });
  };
  function runCopista(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id);
    if (!b || !b.built || b.type !== 'biblioteca' || !libOpen(b)) return H.end(v);
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { goIn(v, t, b, 'escrever'); t.st = 1; v.actT = 0; } return; }
    v.act = AN_.copiar.act; if (v.actT < t.dur) return;
    learn(b, Bi.COPY, 'copiar'); void S;
    return H.end(v);
  }

  // ============================== the plaza ==============================
  const Pr = G.Praca = {};
  Pr.RADIUS = 6; // (who hears: within this of the plaza's middle)
  A.addAnim('falar', { act: 'talk', dur: 8, contact: 7.2, hands: 2 });
  // the ones at the plaza now — standing there in the city's life, talking, passing by
  Pr.ouvintes = function (b, but) {
    const S = S_(); const [cx, cy] = G.Village.center(b); const out = [];
    for (const v of S.villagers.values()) if (v !== but && v.set === b.set && !v.captive && !v.sleeping && !v.inside && v.age >= 6 && G.dist(v.x, v.y, cx, cy) <= Pr.RADIUS) out.push(v);
    return out;
  };

  // ============================== the definitions, and the god's body ==============================
  A.def('espetaculo', {
    name: 'Espetáculo', conserve: false, many: false,
    purpose: 'O espetáculo do dia de um teatro: as portas abrem, os atores sobem ao palco, o público paga a entrada (num povo de moeda), senta, assiste e aplaude; os atores recebem do tesouro.',
    needs: 'um teatro com os seus atores',
    title(op) { const S = S_(); const b = S.buildings.get(op.at); const d = op.data; return `O espetáculo ${b ? de(b) : 'do teatro'}: ${d.fase === 'portas' ? 'as portas abertas' : d.fase === 'peca' ? 'a peça em cena' : 'os aplausos'}, ${Object.keys(d.plateia).length} na plateia`; },
    avail(c, v, set) {
      for (const b of E.byType(set.id, 'teatro')) { const op = Tt.dia(b); if (!op) continue; const ok = aberto(b, op); return { ok, why: ok ? '' : 'a peça já vai longe', txt: `Há espetáculo ${n_(b)} de ${set.name} hoje`, known: G.dist(v.x, v.y, b.x, b.y) < 30 }; }
      return null;
    },
    tick,
    text(v, t, op) {
      const S = S_(); const b = S.buildings.get(t.id);
      if (t.type === 'teatro') { if (t.st === 0) return 'Indo ao teatro'; return op.data.fase === 'peca' ? `Assistindo à peça ${n_(b)}` : op.data.fase === 'fim' ? 'Aplaudindo' : 'Esperando a peça começar'; }
      if (t.type === 'atuar') { if (t.st === 0) return 'Indo para o palco'; return op.data.fase === 'peca' ? (b && stageUse(b) === 'lutar' ? 'Lutando na arena, de mentira, para o público' : 'Atuando no palco') : 'No palco, esperando a hora'; }
      return null;
    },
    offers(v, x, y, r) {
      const S = S_(); const out = [];
      for (const b of S.buildings.values()) {
        if (b.type !== 'teatro' || !b.built) continue;
        const at = G.Vg.door(b); if (v.inside !== b.id && G.dist(x, y, at[0], at[1]) > r + 2) continue;
        if (facOf(b) !== G.Fac.idOfV(v)) continue;
        const op = Tt.dia(b); if (!op) continue; const d = op.data;
        if (d.plateia[v.id] || d.atores[v.id]) { out.push({ id: 'espetaculo.sair:' + op.id, act: 'sair', op: op.id, label: d.atores[v.id] ? 'Descer do palco' : 'Sair do teatro', at, anim: 'apontar', hands: 0 }); continue; }
        if (v.job === b.id && v.role === 'ator' && d.fase !== 'fim') out.push({ id: 'espetaculo.atuar:' + op.id, act: 'atuar', op: op.id, label: d.fase === 'peca' ? 'Voltar ao palco' : 'Subir ao palco', at, anim: 'atuar', hands: 2, use: stageUse(b) });
        else if (!(v.carry && v.carry.n > EPS)) out.push({ id: 'espetaculo.assistir:' + op.id, act: 'assistir', op: op.id, label: `Assistir ao espetáculo${coin(b) ? ` (${money(b, Tt.FEE)})` : ''}`, at, anim: 'assistir', hands: 0, use: seatUse(b), ok: aberto(b, op) && !full(b, op) && (!coin(b) || E.purse(v) + EPS >= Tt.FEE), why: !aberto(b, op) ? 'A peça já vai longe.' : full(b, op) ? 'O teatro está cheio.' : 'Falta dinheiro para a entrada.' });
      }
      return out;
    },
    acts: {
      assistir: {
        deed: 'espetaculo',
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'Não há espetáculo.' }; const b = S_().buildings.get(op.at); if (!b || !aberto(b, op)) return { ok: false, why: 'A peça já vai longe.' }; if (op.data.plateia[v.id]) return { ok: false, why: 'Você já está na plateia.' }; if (full(b, op)) return { ok: false, why: 'O teatro está cheio.' }; if (coin(b) && E.purse(v) + EPS < Tt.FEE) return { ok: false, why: 'Falta dinheiro para a entrada.' }; return { ok: true }; },
        run(v, o) { const S = S_(); const op = A.get(o.op); const b = S.buildings.get(op.at); const p = payEntry(v, op, b); if (!p.ok) return { ok: false, why: p.why || 'Não deu para pagar.' }; op.data.entradas++; op.data.plateia[v.id] = { t: Math.round(S.clock * 10) / 10, st: op.data.fase === 'peca' ? 2 : 1, paid: p.n, body: 1 }; return { ok: true, msg: `Você ${p.n ? `paga ${money(b, p.n)} e ` : ''}senta nas fileiras${op.data.fase === 'peca' ? ': a peça já começou' : ': a peça começa logo'}.` }; },
      },
      atuar: {
        deed: 'trabalho',
        can(v, o) { const op = A.get(o.op); if (!op || !live(op) || op.data.fase === 'fim') return { ok: false, why: 'Não há peça agora.' }; if (v.job !== op.at || v.role !== 'ator') return { ok: false, why: 'Só os atores daqui sobem ao palco.' }; return { ok: true }; },
        run(v, o) { const S = S_(); const op = A.get(o.op); op.data.atores[v.id] = { t: Math.round(S.clock * 10) / 10, body: 1 }; A.join(op, v, 'ator'); return { ok: true, msg: op.data.fase === 'peca' ? 'Você volta à cena.' : 'Você sobe ao palco: quando der a hora, a peça começa.' }; },
      },
      sair: {
        can(v, o) { const op = A.get(o.op); return op && live(op) && (op.data.plateia[v.id] || op.data.atores[v.id]) ? { ok: true } : { ok: false, why: 'Você não está no teatro.' }; },
        run(v, o) { const op = A.get(o.op); delete op.data.plateia[v.id]; delete op.data.atores[v.id]; return { ok: true, msg: 'Você sai do teatro.' }; },
      },
    },
  });
  A.def('leitura', {
    name: 'Leitura', conserve: false, many: true,
    purpose: 'Ler um rolo na biblioteca (a pesquisa do povo avança um pouco) e, sendo o copista, copiar rolos na mesa do escriba; e, na praça, falar ao povo de cima da pedra.',
    needs: 'uma biblioteca de um povo que conhece a escrita; para falar, a praça da cidade',
    offers(v, x, y, r) {
      const S = S_(); const out = []; const f = G.Fac.ofV(v); if (!f || v.captive || v.age < 10) return out;
      const free = !(v.carry && v.carry.n > EPS);
      for (const b of S.buildings.values()) {
        if (!b.built || facOf(b) !== f.id || (b.type !== 'biblioteca' && b.type !== 'praca')) continue;
        const at = G.Vg.door(b); if (v.inside !== b.id && G.dist(x, y, at[0], at[1]) > r + 2) continue;
        if (b.type === 'biblioteca' && free) {
          const lit = !!(f.tech && f.tech.known && f.tech.known.escrita);
          out.push({ id: 'leitura.ler:' + b.id, act: 'ler', b: b.id, label: 'Ler um rolo', at, anim: 'ler', hands: 1, use: 'ler', ok: lit && libOpen(b), why: !lit ? 'O povo ainda não conhece a escrita.' : 'A biblioteca está fechada a esta hora.' });
          if (v.job === b.id && v.role === 'copista') out.push({ id: 'leitura.copiar:' + b.id, act: 'copiar', b: b.id, label: 'Copiar um rolo', at, anim: 'copiar', hands: 1, use: 'escrever', ok: libOpen(b), why: 'A biblioteca está fechada a esta hora.' });
        }
        if (b.type === 'praca' && v.age >= 16) out.push({ id: 'leitura.falar:' + b.id, act: 'falar', b: b.id, label: 'Falar ao povo', at, anim: 'falar', hands: 2, use: 'falar', ok: v.speakDay !== S.day, why: 'Você já falou ao povo hoje.' });
      }
      return out;
    },
    acts: {
      ler: {
        deed: 'leitura',
        can(v, o) { const b = S_().buildings.get(o.b); const f = G.Fac.ofV(v); if (!b || b.type !== 'biblioteca' || !libOpen(b)) return { ok: false, why: 'A biblioteca está fechada.' }; return f && f.tech && f.tech.known && f.tech.known.escrita ? { ok: true } : { ok: false, why: 'O povo ainda não conhece a escrita.' }; },
        run(v, o) { const S = S_(); const b = S.buildings.get(o.b); const n = learn(b, Bi.READ, 'ler'); if (v.readDay !== S.day) { v.readDay = S.day; A.note(v, 'memory', `Li um rolo ${n_(b)}.`); } return { ok: true, msg: n ? 'Você lê um rolo inteiro. O que se sabe na cidade vai um pouco mais longe.' : 'Você lê um rolo. Hoje a biblioteca já ensinou o que tinha para ensinar.' }; },
      },
      copiar: {
        deed: 'trabalho',
        can(v, o) { const b = S_().buildings.get(o.b); if (!b || v.job !== b.id || v.role !== 'copista') return { ok: false, why: 'Só o copista daqui copia os rolos.' }; return libOpen(b) ? { ok: true } : { ok: false, why: 'A biblioteca está fechada.' }; },
        run(v, o) { const b = S_().buildings.get(o.b); const n = learn(b, Bi.COPY, 'copiar'); return { ok: true, msg: n ? 'Você copia um rolo, letra por letra. Mais um que não se perde.' : 'Você copia um rolo; os de hoje já estão contados.' }; },
      },
      falar: {
        deed: 'fala',
        can(v, o) { const b = S_().buildings.get(o.b); if (!b || b.type !== 'praca') return { ok: false, why: 'Não há praça aqui.' }; return v.speakDay !== S_().day ? { ok: true } : { ok: false, why: 'Você já falou ao povo hoje.' }; },
        run(v, o) {
          const S = S_(); const b = S.buildings.get(o.b); const set = S.settlements.get(b.set); const who = Pr.ouvintes(b, v);
          v.speakDay = S.day;
          for (const q of who) G.Vg.emote(q, 'chat', 2);
          if (set && who.length) set.loyalty = Math.min(100, (set.loyalty ?? 60) + Math.min(3, 0.3 * who.length));
          A.note(v, 'memory', who.length ? `Falei ao povo na praça de ${set ? set.name : ''}: ${who.length} ouviram.` : 'Falei na praça vazia.');
          return { ok: true, n: who.length, msg: who.length ? `${who.length} ${who.length > 1 ? 'pessoas param' : 'pessoa para'} para ouvir. A cidade gosta de ser ouvida.` : 'Ninguém na praça para ouvir.' };
        },
      },
    },
  });
  // (whoever dies or is taken leaves the rows, the stage, the reading table)
  A.hooks.gone.push(function (v) {
    for (const op of A.all()) if (op.def === 'espetaculo' && live(op)) { delete op.data.plateia[v.id]; delete op.data.atores[v.id]; }
    for (const b of S_().buildings.values()) if (b.livros && b.livros.quem && b.livros.quem[v.id]) delete b.livros.quem[v.id];
  });

  // ============================== the task machines, the trades' jobs, the words of this file ==============================
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'teatro') { runPlateia(v, t, dt, H); return true; }
    if (t.type === 'atuar') { runAtor(v, t, dt, H); return true; }
    if (t.type === 'ler') { runLeitor(v, t, dt, H); return true; }
    if (t.type === 'copiar') { runCopista(v, t, dt, H); return true; }
    return oldRun(v, t, dt, H);
  };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    const S = S_();
    if (v.role === 'ator') { const b = v.job && S.buildings.get(v.job); const f = G.Fac.ofV(v); if (!b || !b.built || b.type !== 'teatro' || !f) return null; return Tt.task(v, b, f, H); }
    if (v.role === 'copista') { const b = v.job && S.buildings.get(v.job); const f = G.Fac.ofV(v); if (!b || !b.built || b.type !== 'biblioteca' || !f) return null; return Bi.task(v, b, f, H); }
    return oldJob(v, H);
  };
  // (the trades of these buildings: two actors for each theatre, a copyist for each library — under the ceiling, D-090)
  const oldDemand = E.demand;
  E.demand = function (set, fac, Ad) {
    const out = oldDemand(set, fac, Ad);
    if (Ad >= 12) { const n = E.byType(set.id, 'teatro').length; if (n) out.ator = (out.ator || 0) + 2 * n; }
    if (Ad >= 10 && fac.tech && fac.tech.known && fac.tech.known.escrita) { const n = E.byType(set.id, 'biblioteca').length; if (n) out.copista = (out.copista || 0) + n; }
    return out;
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'ler') return t.st < 1 ? 'Indo à biblioteca' : 'Lendo um rolo na biblioteca';
    if (t.type === 'copiar') return t.st < 1 ? 'Indo à biblioteca' : 'Copiando um rolo na biblioteca';
    return oldText(v, t);
  };
  // the panels: the show of the day; the library's day
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    const hh = x => `${Math.floor(x * 24)}h`;
    if (b.type === 'teatro' && b.built) {
      const hr = Tt.horas(b); const op = Tt.dia(b); const n = actorsOf(b).length;
      if (op && live(op)) { const d = op.data; h += `<div class="doing">${d.fase === 'portas' ? `Portas abertas: a peça começa às ${hh(hr.peca)}` : d.fase === 'peca' ? 'A peça em cena' : 'Os aplausos'} · ${Object.keys(d.plateia).length} na plateia · ${Object.keys(d.atores).length} no palco${coin(b) ? ` · ${esc(money(b, d.receita))} de entradas` : ''}</div>`; }
      else h += `<div class="doing">${n ? `Espetáculo às ${hh(hr.peca)}` : 'Sem atores: sem espetáculo'}.</div>`;
    }
    if (b.type === 'biblioteca' && b.built) {
      const k = b.livros && b.livros.day === S_().day ? b.livros : null;
      h += `<div class="doing">${libOpen(b) ? 'Aberta' : 'Fechada'} — hoje ${k ? k.lidos : 0} leituras e ${k ? k.copias : 0} cópias${k && k.pts ? ` (a pesquisa do povo +${k.pts})` : ''}.</div>`;
    }
    return h;
  };
  A.hooks.canon.push(['espetaculo', () => A.all().filter(op => op.def === 'espetaculo' && live(op)).map(op => [op.id, op.at, op.data.day, op.data.fase, op.data.entradas, r2(op.data.receita), Object.keys(op.data.plateia).sort().join(','), Object.keys(op.data.atores).sort().join(',')])]);

  // ============================== the save ==============================
  // (the errands are not saved: the audience and the actors of a show under way are put back where they were, the readers at
  // their tables — and the show and the reading go on; L-190's rule)
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() {
      const S = S_();
      for (const op of A.all()) {
        if (op.def !== 'espetaculo' || !live(op)) continue;
        const d = op.data; d.plateia = d.plateia && typeof d.plateia === 'object' ? d.plateia : {}; d.atores = d.atores && typeof d.atores === 'object' ? d.atores : {};
        for (const [id, m] of Object.entries(d.plateia)) {
          const v = S.villagers.get(+id); if (!v || m.body || v.captive || v.jail) { delete d.plateia[id]; continue; }
          G.Vg.setTask(v, { type: 'teatro', id: op.at, op: op.id, pri: 0.45, st: m.st === 2 ? 2 : 1, use: 'assistir', kind: 'leisure' });
          if (v.task && v.task.type === 'teatro') v.inside = op.at; else delete d.plateia[id];
        }
        for (const [id, m] of Object.entries(d.atores)) {
          const v = S.villagers.get(+id); if (!v || m.body || v.captive || v.jail) { delete d.atores[id]; continue; }
          G.Vg.setTask(v, { type: 'atuar', id: op.at, op: op.id, pri: 1.05, st: 1, use: 'atuar', kind: 'work' });
          if (v.task && v.task.type === 'atuar') v.inside = op.at; else delete d.atores[id];
        }
      }
      for (const b of S.buildings.values()) {
        if (b.type !== 'biblioteca' || !b.livros || !b.livros.quem) continue;
        for (const [id, m] of Object.entries(b.livros.quem)) {
          const v = S.villagers.get(+id); if (!v || v.captive || v.jail) { delete b.livros.quem[id]; continue; }
          G.Vg.setTask(v, { type: 'ler', id: b.id, pri: 0.35, st: 1, use: 'ler', kind: 'leisure' });
          if (v.task && v.task.type === 'ler') { v.inside = b.id; v.actT = Math.max(0, S.clock - (m.t || S.clock)); } else delete b.livros.quem[id];
        }
      }
    },
  });
})(window.G);
