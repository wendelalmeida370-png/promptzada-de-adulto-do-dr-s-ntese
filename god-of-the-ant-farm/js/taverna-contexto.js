'use strict';
// ============================================================
//  The tavern in the world that happens (T1 of the fourth wave of
//  the tavern: D-668 «o contexto manda», D-812 to D-817). What
//  happens round a tavern rules it, each thing with its cause in
//  the world, and the índole of who decides weighs:
//   · the war at its door — the enemy fighting in the town or by
//     it, the alarm, the dead of a fight close by —: nobody drinks
//     there — the day shuts —, and its keeper, if he is at it, bars
//     the door (trancar) or opens the house to who is in the street
//     (abrigar), by his courage, his kindness and who is inside;
//     who shelters crouches in the corners, still (esconder). The
//     raider who loots or hunts may force the barred door (arrombar)
//     against its wood and its bar; the armed inside go out to him,
//     by the world's fight; the danger over, the house opens again —
//     and a door broken in stays broken till the keeper mends it,
//     with the wood by the ledger;
//   · the ruler's death: the mourning — no music, the talk low, a
//     toast to the memory (act-taverna.js asks TC.calado);
//   · the storm: more come in out of it; the sickness of the town:
//     few, and the sick none; the fire close by: everyone out; the
//     hunger of the people: no plate, the drink of the shelf; the
//     town's feast: the tavern full.
//  The readings (TC.of and the doors that ask it) are pure; what
//  this file writes — the bar, the door broken in, the shelter of
//  the moment (b.tranca, b.porta, b.portaHp, b.abrigo) — is its own
//  (guard rule 344), in the world's step. The war's side is a door
//  of the war (G.War.shelters, D-813): the hiding, the barred door
//  that holds the raider at it, the raider who forces it.
// ============================================================
(function (G) {
  const T = G.Taverna, A = G.Act, D = G.Depot, E = G.Eco; if (!T || !A || !D || !E) return;
  const TC = G.TavernaContexto = {};
  const S_ = () => G.S;
  const EPS = 1e-6;
  const r1 = x => Math.round(x * 10) / 10;
  const fidOf = b => G.Village.facOfSet(b.set);
  const say = (v, key, ctx) => G.Falas && v && G.Falas.say(v, key, ctx);
  const log = (t, ic, x, y) => G.Village.log(t, ic, x, y);
  const oa = v => (v && v.g === 'f' ? 'a' : 'o');

  // ------------------------------ the numbers ------------------------------
  TC.PERTO = 14;      // tiles from the tavern: an enemy fighting there is at its door
  TC.MORTOS = 2;      // and this many dead of a fight within them, the war's last TC.RECENTE seconds
  TC.RECENTE = 25;
  TC.FOGO_R = 5;      // tiles round its lot: a fire there is close by
  TC.LUTO = 2;        // days of mourning for a ruler who died (the day of the death and the next)
  TC.DOENCA = 0.06;   // the share of the town sick from which the sickness is the town's
  TC.FOME_DIAS = 1;   // under a day of the people's eating in its store: the hunger (the share-out's own mark)
  TC.ABRIGO = 0.5;    // the keeper's courage and kindness past this: the house opened to who is in the street
  TC.DONO = 18;       // tiles from the door the keeper comes back to his tavern from
  TC.CHAMA = 14;      // tiles from the door one is called in from
  TC.CHAMA_T = 45;    // seconds the keeper calls at the most before he bars the door
  TC.PORTA = 7;       // an enemy this near the door: barred now
  TC.TRANCA_T = 2.2;  // the bar put across the door: the act's seconds
  TC.CALMA = 20;      // seconds with no danger at the door: the all clear
  TC.HP_MADEIRA = 30; // the door's strength: its wood, and its bar — of iron where the people had iron, else of wood
  TC.HP_TRANCA = { ferro: 22, madeira: 12 };
  TC.GOLPE = 1.3;     // seconds between two blows at a door, from its doorstep (tiles from the door's own point)
  TC.AT_DOOR = 0.8;
  TC.ARROMBA_R = 18;  // tiles a raider looks for a barred door within; at most TC.ARROMBA_N of a band at one door
  TC.ARROMBA_N = 3;
  TC.ARROMBA_P = 0.55; // the share of the raiders who go at it (the hash of the soldier, the door and the moment)
  TC.CONSERTO = 2;    // the wood a door broken in takes to mend, and the hands' seconds at it
  TC.CONSERTO_T = 9;
  TC.TEMPORAL = 0.3;  // the storm: the wish of the nights higher, and who is caught out by the door goes in out of it
  TC.TEMPORAL_GO = 1.15;
  TC.FESTA = 0.35;    // the town's feast: the tavern full
  TC.LUTO_W = 0.7;    // the mourning: fewer go

  // ------------------------------ the readings (pure) ------------------------------
  // (who is inside each building now: once a moment)
  let inS = null, inT = -1, inP = -1; const INS = new Map();
  G.worldHooks.push(() => { inS = null; inT = -1; INS.clear(); memo.clear(); mS = null; mT = -1; });
  function insideOf(b) {
    const S = S_(); if (inS !== S || inT !== S.clock || inP !== S.villagers.size) { inS = S; inT = S.clock; inP = S.villagers.size; INS.clear(); for (const v of S.villagers.values()) if (v.inside > 0) { let L = INS.get(v.inside); if (!L) INS.set(v.inside, L = []); L.push(v); } }
    return INS.get(b.id) || [];
  }
  TC.insideOf = b => insideOf(b).slice();
  // (who hides in it: in it, by a hiding of this shelter)
  const hiding = (v, b) => !!(v.task && v.task.type === 'hide' && v.task.sh === 'taverna' && v.task.b === b.id);
  TC.hiders = b => insideOf(b).filter(v => hiding(v, b));
  // (the places of its plan — the seats, the beds — and a few on the floor: how many it shelters)
  TC.cabe = function (b) { const In = G.Interiors; const t = In && In.table ? In.table(b) : null; if (!t || !t.byUse) return T.SEATS + 4; let n = 4; for (const u of ['sentar', 'comer', 'deitar']) n += (t.byUse.get(u) || []).length; return n; };
  TC.room = b => TC.cabe(b) - insideOf(b).length;
  const broken = b => !!(b.porta && b.porta.k === 'arrombada');
  const barred = b => !!b.tranca && !broken(b);
  TC.arrombada = broken; TC.trancada = barred;
  // (an enemy fighting within r tiles of it, of a people at war with its own)
  function hostileAt(b, r) {
    const W = G.War; if (!W || !W.fightersNear || !W.warFacs || !W.warFacs.size) return null;
    const fid = fidOf(b); const S = S_(); const x = b.x + b.w / 2, y = b.y + b.h / 2;
    for (const o of W.fightersNear(x, y, r)) { if (!o || o.captive || o.held || o.inside || !S.villagers.has(o.id)) continue; const fo = G.Fac.idOfV(o); if (fo !== fid && G.Fac.atWar(fid, fo) && G.dist(o.x, o.y, x, y) < r) return o; }
    return null;
  }
  TC.inimigoPerto = (b, r) => hostileAt(b, r || TC.PERTO);
  function deadNear(b) {
    const W = G.War; if (!W || !W.battles) return 0; const x = b.x + b.w / 2, y = b.y + b.h / 2;
    for (const bt of W.battles) { if (W.clock - bt.last > TC.RECENTE) continue; let n = 0; for (const k in bt.dead) n += bt.dead[k]; if (n >= TC.MORTOS && G.dist(bt.x, bt.y, x, y) < TC.PERTO) return n; }
    return 0;
  }
  // the danger at its door: the town's alarm of a people at war, an enemy fighting by it, the dead of a fight close by — or none
  function perigo(b) {
    const S = S_(); const set = S.settlements.get(b.set); const W = G.War;
    if (set && set.alarmT > 0 && W && W.warFacs && W.warFacs.has(fidOf(b))) return { why: 'alarme' };
    const o = hostileAt(b, TC.PERTO); if (o) return { why: 'inimigo', o: o.id };
    const n = deadNear(b); if (n) return { why: 'mortes', n };
    return null;
  }
  // (a fire on its lot or within TC.FOGO_R tiles of it)
  function fireNear(b) {
    const S = S_(); const W = G.W; if (!S.fire) return false; const R = TC.FOGO_R;
    for (let y = b.y - R; y < b.y + b.h + R; y++) for (let x = b.x - R; x < b.x + b.w + R; x++) if (W.inb(x, y) && S.fire[W.idx(x, y)] > 0.2) return true;
    return false;
  }
  // the mourning of a people: its last reign ended by the ruler's death — of age, of a sickness, in battle — within TC.LUTO days
  const DIED = { morte: 1, batalha: 1 };
  function mourning(f) {
    if (!f || !f.rulers) return null; const S = S_();
    for (let i = f.rulers.length - 1; i >= 0; i--) { const r = f.rulers[i]; if (r.to === undefined) continue; if (DIED[r.end] && S.day - r.to < TC.LUTO) return { quem: r.name, id: r.id, dia: r.to, ord: r.ord || 0, title: r.title || '' }; return null; }
    return null;
  }
  TC.luto = fid => mourning(G.Fac.get(fid));
  // (the share of a town sick now)
  function sickShare(set) {
    if (!set) return 0; const k = 's' + set.id; fresh(); if (memo.has(k)) return memo.get(k);
    let n = 0, s = 0; for (const v of S_().villagers.values()) if (v.set === set.id && !v.captive) { n++; if (v.sick > 0) s++; }
    const r = n ? s / n : 0; memo.set(k, r); return r;
  }
  // (the hunger of a people: under a day of its eating in its store)
  TC.fomeDe = function (fid) { const f = G.Fac.get(fid); if (!f) return false; return (f.stock.food || 0) < G.Fac.pop(fid) * 2.5 * TC.FOME_DIAS; };
  // (the town's feast today: a festival of its calendar, or the feast of a victory still going on)
  function townFeast(set) { const S = S_(); if (!set) return false; const p = set.festPlan; return !!(p && p.day === S.day && p.key && !p.cancel) || set.feast > 0; }
  const memo = new Map(); let mS = null, mT = -1;
  function fresh() { const S = S_(); if (mS !== S || mT !== S.clock) { memo.clear(); mS = S; mT = S.clock; } }
  // the context of a tavern now — what rules it (k: the fire close by, the war, the mourning, the sickness, the hunger, the storm, the
  // town's feast) and each thing that is so — pure, once a moment
  TC.of = function (b) {
    fresh(); let c = memo.get(b.id); if (c) return c;
    const S = S_(); const set = S.settlements.get(b.set); const fid = fidOf(b);
    const fogo = fireNear(b); const per = perigo(b);
    const thr = G.War && G.War.threatWhy ? G.War.threatWhy(b.set) : '';
    const guerra = per ? per.why : thr;
    const luto = mourning(G.Fac.get(fid)); const doenca = sickShare(set); const fome = TC.fomeDe(fid);
    const tempestade = !!(S.weather && S.weather.storm > 0 && S.weather.rain > 0.3);
    const festa = townFeast(set);
    const k = fogo ? 'fogo' : guerra ? 'guerra' : luto ? 'luto' : doenca >= TC.DOENCA ? 'doenca' : fome ? 'fome' : tempestade ? 'tempestade' : festa ? 'festa' : '';
    c = Object.freeze({ k, fogo, guerra, perigo: per, luto, doenca: Math.round(doenca * 1000) / 1000, fome, tempestade, festa });
    memo.set(b.id, c); return c;
  };
  // (why the tavern does not open, or shuts: the fire close by, the war at its door — or '' — D-668)
  TC.shut = function (b) { const c = TC.of(b); return c.fogo ? 'o fogo perto' : c.guerra ? 'a guerra à porta' : ''; };
  // (no feast where the world does not let one be: the war, the fire, the mourning, the sickness, the hunger — D-668)
  TC.semFesta = function (b) { const c = TC.of(b); return c.fogo ? 'o fogo perto' : c.guerra ? 'a guerra' : c.luto ? 'o luto' : c.doenca >= TC.DOENCA ? 'a doença na cidade' : c.fome ? 'a fome' : ''; };
  // (the mourning that quiets it: no music, no game, no dance, the talk low, a toast to the memory)
  TC.calado = b => TC.of(b).luto;
  // (the hunger: no plate served nor bought, no grain in the vat — the drink of the shelf)
  TC.fome = b => TC.of(b).fome;
  // how the context weighs one's wish for the night here: { mul, add } — the sick none; the mourning fewer; the sickness of the town
  // fewer by how much of it there is; the storm and the town's feast more
  TC.vontade = function (v, b) {
    if (v.sick > 0) return { mul: 0, add: 0 };
    const c = TC.of(b); let mul = 1, add = 0;
    if (c.luto) mul *= TC.LUTO_W;
    if (c.doenca > 0) mul *= Math.max(0.2, 1 - 4 * c.doenca);
    if (c.tempestade) add += TC.TEMPORAL;
    if (c.festa) add += TC.FESTA;
    return { mul, add };
  };
  // (the storm: one caught out in it, the tavern's door nearer than home's — or no home —: in out of it, whatever the night's lot)
  TC.abriga = function (v, b) {
    const c = TC.of(b); if (!c.tempestade || v.inside) return false;
    const dr = G.Vg.door(b); const h = v.home && S_().buildings.get(v.home); if (!h || !G.Village.livable(h)) return true;
    const hd = G.Vg.door(h); return G.dist(v.x, v.y, dr[0], dr[1]) < G.dist(v.x, v.y, hd[0], hd[1]);
  };
  // the keeper's choice at the danger: the house opened to the street (abrigar) — the brave and the kind — or barred now (trancar) —
  // the house full, his little ones inside, the fearful —, and the cause of it. Pure
  TC.escolha = function (k, b) {
    if (TC.room(b) < 1) return { k: 'trancar', why: 'a casa cheia' };
    const cor = Math.max(0, Math.min(1, k.courage || 0)); const bond = G.Indole ? G.Indole.faceta(k, 'empatico') : 0.5;
    const kids = insideOf(b).filter(o => o.age < 12 && (o.mother === k.id || o.father === k.id)).length;
    const s = 0.45 * cor + 0.55 * bond - (kids ? 0.2 : 0);
    return s >= TC.ABRIGO ? { k: 'abrigar', why: 'a coragem e a bondade', s: Math.round(s * 100) / 100 } : { k: 'trancar', why: kids ? 'os filhos lá dentro' : 'o medo', s: Math.round(s * 100) / 100 };
  };
  // (the door's strength: its wood and its bar — of iron where the people had iron)
  TC.hpOf = b => TC.HP_MADEIRA + (G.Origem && G.Origem.had && G.Origem.had(fidOf(b), 'ferro') ? TC.HP_TRANCA.ferro : TC.HP_TRANCA.madeira);
  // (a blow at a door: by the arm in the hands and the soldier's trade)
  const blowOf = v => 2 + (v.arm === 'machado' ? 2 : v.arm ? 1 : 0) + (v.role === 'guerreiro' ? 0.5 : 0);
  // (the house still shelters who is in it: not broken in since one went in)
  const holds = (b, t) => !!b && b.built && !(broken(b) && b.porta.t >= (t.t0 || 0));
  // (the all clear: no danger at the door for TC.CALMA seconds, and no attack on the town)
  const LOUD = { attack: 1, battle: 1, fight: 1, alarm: 1 };
  function allClear(b, t) {
    const S = S_(); if (TC.of(b).perigo) { t.calma = r1(S.clock); return false; }
    if (S.clock - (t.calma || t.t0 || 0) <= TC.CALMA) return false;
    return !LOUD[G.War && G.War.threatWhy ? G.War.threatWhy(b.set) : ''];
  }
  // (the house opened to the street: the keeper at it, calling — the door not yet barred, not broken)
  const calling = b => !!(b.abrigo && b.abrigo.k === 'abrigar' && !b.tranca && !broken(b)) && (() => { const k = T.keeperOf(b); const t = k && k.task; return !!(t && t.type === 'hide' && t.b === b.id && t.dono && t.ks === 'chama'); })();
  TC.chamando = calling;

  // ------------------------------ the door, as the world holds it (D-812) ------------------------------
  // (broken in: the door forced, open to all till it is mended; barred: the keeper's bar — In.doorHold, interiors.js)
  function hold(b, id) { if (broken(b) && (b.porta.door === id || !(b.porta.door >= 0))) return 'arrombada'; return b.tranca ? 'trancada' : null; }
  // (the bar is on the inside, D-910: whoever is within lifts it — the god's body too, In.useDoor from inside, In.doorLift —; lifted, the house
  // is barred no more: who hides in it stays, and the raider who comes finds the door unbarred. The keeper hiding there bars it again once the
  // one who lifted it is out, the danger still at the door — keeper, below)
  function unbar(b, id, v) {
    if (!G.inSim) return { ok: false, why: 'fora do passo do mundo' };
    if (!barred(b)) return { ok: true };
    const S = S_(); const n = TC.hiders(b).length; delete b.tranca; delete b.portaHp;
    const set = S.settlements.get(b.set);
    if (v && n && TC.of(b).perigo) log(`${v.name} tirou a tranca da porta da taverna de ${set ? set.name : ''}, com ${n > 1 ? n + ' pessoas escondidas' : 'uma pessoa escondida'} lá dentro e a guerra à porta.`, 'war', b.x, b.y);
    return { ok: true, n };
  }
  // (and what lifting it means, said to the hands before and after: who hides there, the war at the door. Pure)
  function barSays(b) {
    const n = TC.hiders(b).length; const war = !!TC.of(b).perigo;
    const who = n > 1 ? `${n} pessoas escondidas` : n ? 'uma pessoa escondida' : '';
    return { label: who ? `Tirar a tranca (${who} aqui)` : 'Tirar a tranca e abrir a porta',
      msg: `Você tira a tranca e abre a porta${war ? ': lá fora, a guerra' : ''}${who ? `; aqui dentro, ${who}, sem a tranca entre ${n > 1 ? 'elas' : 'ela'} e a rua` : ''}.` };
  }
  G.worldHooks.push(() => { if (G.Interiors && G.Interiors.doorHold) G.Interiors.doorHold('taverna', hold); if (G.Interiors && G.Interiors.doorLift) G.Interiors.doorLift('taverna', { lift: unbar, says: barSays }); });

  // ------------------------------ the hiding (G.War.shelters, D-813) ------------------------------
  const hideTask = (b, v, dono) => ({ type: 'hide', pri: dono ? 4.6 : 4.4, kind: 'hide', b: b.id, sh: 'taverna', dono: dono ? 1 : undefined, st: v.inside === b.id ? 2 : 0, stay: v.inside === b.id ? b.id : undefined, t0: r1(S_().clock), calma: r1(S_().clock), chk: 2 });
  TC.hideTask = hideTask;
  const SH = { id: 'taverna' };
  // (who would hide from the war: in the tavern one is in — the shelter not broken —, or in one opened to the street of one's own people,
  // its door nearer than home's and not past the enemy, reached by the map — W.reaches —, with room)
  SH.take = function (v, e) {
    if (A.isBody(v) || v.captive || v.jail || v.aboard) return 0;
    const S = S_(); const fv = G.Fac.idOfV(v);
    if (v.inside) { const b = S.buildings.get(v.inside); if (b && b.type === 'taverna' && b.built && !broken(b) && fidOf(b) === fv && (b.abrigo || TC.of(b).perigo)) return b.id; }
    let best = 0, bd = TC.CHAMA;
    const h = v.home && S.buildings.get(v.home); const hd = h && G.Village.livable(h) ? G.Vg.door(h) : null;
    for (const b of E.byType(v.set, 'taverna')) {
      if (!b.built || !calling(b) || fidOf(b) !== fv || TC.room(b) < 1) continue;
      const dr = G.Vg.door(b); const d = G.dist(v.x, v.y, dr[0], dr[1]); if (d >= bd) continue;
      if (hd && G.dist(v.x, v.y, hd[0], hd[1]) <= d) continue;
      if (e && G.dist(e.x, e.y, dr[0], dr[1]) < d) continue;
      if (!G.W.reaches(v, dr[0], dr[1])) continue;
      best = b.id; bd = d;
    }
    return best;
  };
  SH.keeps = (v, t) => holds(S_().buildings.get(t.b), t);
  SH.text = function (v, t) {
    if (t.dono) return t.ks === 'chama' ? 'Chamando o povo para dentro da taverna' : t.ks === 'tranca' ? 'Passando a tranca na porta da taverna' : v.inside ? 'Escondido com o povo na taverna trancada' : 'Correndo para a sua taverna!';
    return v.inside ? `Escondid${oa(v)} na taverna, com medo` : 'Correndo para se esconder na taverna!';
  };
  // the hiding's own errand: st 0 to the door, 1 the run to it, 2 inside — crouched in a corner, still; the keeper calls, bars, hides
  SH.run = function (v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.b);
    if (!b || !b.built || b.type !== 'taverna') { H.end(v); return; }
    // (broken in since one went in: no shelter any more — the war's fear takes it from here)
    if (!holds(b, t)) { G.Vg.endTask(v); G.Vg.emote(v, 'fear', 2.5); return; }
    if (t.st === 0) {
      if (v.inside === b.id) { t.st = 2; return; }
      const dr = G.Vg.door(b); if (!H.goto(v, dr[0], dr[1], true)) { H.end(v); return; } t.st = 1; return;
    }
    if (t.st === 1) {
      v.act = 'run'; if (!H.move(v, dt, 1.35)) return;
      // (the door barred before one got there: no way in — but the keeper's own, who has the key)
      if (barred(b) && !t.dono) { H.end(v); return; }
      t.st = 2; v.act = ''; G.Vg.enter(v, b, t); t.stay = b.id; return;
    }
    if (G.Vg.entering(v)) { v.act = ''; return; }
    if (t.dono) { keeper(v, t, b, dt, H); return; }
    v.act = 'esconder'; v.moving = false;
    t.chk = (t.chk || 0) - dt; if (t.chk <= 0) { t.chk = 2; if (allClear(b, t)) H.end(v); }
  };
  // (the god's body in the house — the world's record of it, v.inside —: the bar it lifted is put back only once it is out)
  const bodyIn = b => { const w = G.Possess && G.Possess.body ? G.Possess.body() : null; return !!w && w.inside === b.id; };
  // the keeper in his house at the danger: the choice once (b.abrigo), the call at the door while it is open, the bar, the hiding
  function keeper(v, t, b, dt, H) {
    const S = S_();
    if (!b.abrigo) {
      const c = TC.escolha(v, b); b.abrigo = { k: c.k, why: c.why, s: c.s, por: v.id, t: r1(S.clock), calma: r1(S.clock), n: 0 };
      const set = S.settlements.get(b.set);
      if (c.k === 'abrigar') log(`Com a guerra à porta, ${v.name} abriu a taverna de ${set ? set.name : ''} ao povo da rua: lá dentro, quem não tem onde se esconder fica a salvo.`, 'war', b.x, b.y);
    }
    const ab = b.abrigo;
    if (t.ks === undefined) t.ks = barred(b) ? 'esconde' : ab.k === 'abrigar' ? 'chama' : 'tranca';
    if (TC.of(b).perigo) ab.calma = r1(S.clock);
    if (t.ks === 'chama') {
      v.act = 'abrigar'; if (!t.said) { t.said = 1; say(v, 'abrigar_chama', {}); }
      if (hostileAt(b, TC.PORTA) || TC.room(b) < 1 || S.clock - ab.t > TC.CHAMA_T) { t.ks = 'tranca'; v.actT = 0; }
      return;
    }
    if (t.ks === 'tranca') {
      v.act = 'trancar'; if (v.actT < TC.TRANCA_T) return;
      if (!b.tranca && !broken(b)) { b.tranca = { t: r1(S.clock), por: v.id, g: 0 }; b.portaHp = TC.hpOf(b); say(v, 'abrigar_tranca', {}); }
      t.ks = 'esconde'; v.actT = 0; return;
    }
    // (the bar lifted from inside — the god's body went out by the door, D-910 — and the danger still at it: barred again, once the body is out
    // of the house — never over it: the bar is its to lift)
    if (!b.tranca && !broken(b) && TC.of(b).perigo && !bodyIn(b)) { t.ks = 'tranca'; v.actT = 0; return; }
    v.act = 'esconder'; v.moving = false;
    t.chk = (t.chk || 0) - dt; if (t.chk <= 0) { t.chk = 2; if (allClear(b, t)) { lift(b); H.end(v); } }
  }
  // (the danger over: the bar lifted, the shelter of the moment let go — the door broken in stays so)
  function lift(b) { delete b.tranca; delete b.abrigo; if (!broken(b)) delete b.portaHp; }
  // the raider at a barred door (the war's step, D-814): a blow each TC.GOLPE seconds against its strength; the first blow brings the
  // armed of the inside out to him (the world's fight); at none left, it gives — broken in
  function strike(v, b, dt) {
    const S = S_(); const t = v.task;
    G.faceTo(v, b.x + b.w / 2 - v.x, b.y + b.h / 2 - v.y); v.act = 'arrombar'; v.moving = false; v.path = null;
    t.gT = (t.gT === undefined ? TC.GOLPE * G.hash(Math.imul(v.id | 0, 17) + 3) : t.gT) - dt; if (t.gT > 0) return;
    t.gT = TC.GOLPE; if (!Number.isFinite(b.portaHp)) b.portaHp = TC.hpOf(b);
    if (!b.tranca.f) { b.tranca.f = r1(S.clock); defend(b, v); }
    b.tranca.g = (b.tranca.g || 0) + 1; b.portaHp = r1(b.portaHp - blowOf(v));
    if (b.portaHp <= 0) breakIn(b, v);
  }
  TC.strikeOf = blowOf;
  // (the armed of the inside — the world's own measure of who stands against a threat, G.Vg.armedFor — go out to who forces the door)
  function defend(b, by) {
    let n = 0;
    for (const o of TC.hiders(b)) { if (A.isBody(o) || !(G.Vg.armedFor ? G.Vg.armedFor(o) : o.role === 'guerreiro')) continue; G.Vg.setTask(o, { type: 'combat', id: by.id, pri: 4.2, def: true, kind: 'combat' }); if (o.task && o.task.type === 'combat') n++; }
    b.tranca.def = n;
  }
  function breakIn(b, v) {
    const S = S_(); const In = G.Interiors; const p = In && In.plan ? In.plan(b) : null; const door = p && p.entrance ? p.entrance.door : -1;
    const g = b.tranca ? b.tranca.g || 0 : 0; const def = b.tranca ? b.tranca.def || 0 : 0;
    b.porta = { k: 'arrombada', d: S.day, t: r1(S.clock), por: G.Fac.idOfV(v), quem: v.id, door, golpes: g, def };
    delete b.tranca; b.portaHp = 0; if (b.abrigo) b.abrigo.arrombada = r1(S.clock);
    let n = 0; for (const o of TC.hiders(b)) { G.Vg.endTask(o); G.Vg.emote(o, 'fear', 2.5); n++; }
    const set = S.settlements.get(b.set); const f = G.Fac.ofV(v);
    log(`Os soldados de ${f ? f.name : 'o inimigo'} arrombaram a porta da taverna de ${set ? set.name : ''}${n ? `, atrás ${n > 1 ? `dos ${n}` : 'de quem'} que se escondia${n > 1 ? 'm' : ''} lá dentro` : ''}.`, 'war', b.x, b.y);
  }
  // (what the raider who broke in takes from the shelf: the plates' food or a drink, by the ledger — «saque» —, into his hands)
  function lootShelf(v, b, band) {
    if (v.carry && v.carry.n > EPS) return; const ref = 'b:' + b.id;
    for (const k of ['food', 'cerveja', 'vinho', 'mel', 'pulque']) {
      const n = Math.floor(Math.min(6, D.free(ref, k)) + EPS); if (n < 1) continue;
      const r = D.move(ref, 'v:' + v.id, k, n, { code: 'saque', by: v.id }); if (r.ok) { band.loot[k] = (band.loot[k] || 0) + n; G.Vg.emote(v, 'happy', 1.5); }
      return;
    }
  }
  // (a band's raiders at it now)
  const forcers = (band, bid) => { let n = 0; for (const id of band.members) { const o = S_().villagers.get(id); if (o && o.task && o.task.arr === bid) n++; } return n; };
  // the raider of a band that loots or hunts (the war's attack, D-814): a barred tavern with people in it within TC.ARROMBA_R tiles — the
  // way to its door by the map —, a few of the band at it at the most, each by the hash of him, the door and the moment; the walk to it,
  // the blows; broken in, the looter takes from the shelf, and the hunt goes on by the war's own ways
  const RAID = { saque: 1, captura: 1, massacre: 1 };
  SH.force = function (v, t, band, set, dt, H) {
    if (!RAID[band.goal] || (v.carry && v.carry.n > EPS) || t.foe) { t.arr = 0; t.arrAt = 0; return false; }
    const S = S_(); let b = t.arr ? S.buildings.get(t.arr) : null;
    if (b && broken(b) && b.porta.quem === v.id && S.clock - b.porta.t < 2) { if (band.goal !== 'massacre') lootShelf(v, b, band); t.arr = 0; t.dest = null; return false; }
    if (b && !(barred(b) && TC.hiders(b).length)) { t.arr = 0; b = null; }
    if (!b) {
      if (S.clock < (t.arrT || 0)) return false; t.arrT = r1(S.clock + 3);
      let bd = TC.ARROMBA_R;
      for (const q of E.byType(set.id, 'taverna')) {
        if (!q.built || !barred(q) || !TC.hiders(q).length) continue;
        const dr = G.Vg.door(q); const d = G.dist(v.x, v.y, dr[0], dr[1]); if (d >= bd) continue;
        if (forcers(band, q.id) >= TC.ARROMBA_N) continue;
        if (G.hash(Math.imul(v.id | 0, 131) + Math.imul(q.id | 0, 31) + Math.floor(S.clock / 10)) >= TC.ARROMBA_P) continue;
        if (!G.W.reaches(v, dr[0], dr[1])) continue;
        b = q; bd = d;
      }
      if (!b) return false; t.arr = b.id; t.arrGo = 0; t.arrN = 0; t.arrAt = 0; t.dest = null; t.gT = undefined;
    }
    // (the walk to its doorstep — the way the world walks to a door, L-1927 —; there, the blows)
    const dr = G.Vg.door(b); if (t.arrAt === b.id && G.dist(v.x, v.y, dr[0], dr[1]) > TC.AT_DOOR * 3) t.arrAt = 0; // (pushed off it)
    if (t.arrAt !== b.id && G.dist(v.x, v.y, dr[0], dr[1]) > TC.AT_DOOR) {
      if (!t.arrGo) { if (!H.goto(v, dr[0], dr[1], false) && !H.goto(v, dr[0], dr[1], true)) { t.arr = 0; t.arrT = r1(S.clock + 10); return false; } t.arrGo = 1; }
      if (H.move(v, dt, 1.15)) { t.arrGo = 0; if (G.dist(v.x, v.y, dr[0], dr[1]) < TC.AT_DOOR * 1.6) t.arrAt = b.id; else if (++t.arrN > 3) { t.arr = 0; t.arrT = r1(S.clock + 10); return false; } }
      v.act = ''; return true;
    }
    t.arrAt = b.id; strike(v, b, dt); return true;
  };
  // (whoever comes at someone inside a barred tavern — the war's fight at its door, a massacre —: the door holds him till it gives)
  SH.door = function (v, t, bd, dt, H) { if (!bd || bd.type !== 'taverna' || !barred(bd)) return false; strike(v, bd, dt); return true; };
  if (G.War && G.War.shelters) G.War.shelters.push(SH);

  // ------------------------------ the tavern's side, each second of the world ------------------------------
  // (the keeper can come back to his house at the danger: himself, free of the war's own errands, near it — and the house open, or
  // someone in it, or he at its counter: a tavern shut and empty at night is no business of his, his family's house is)
  function canKeep(k, b, wasOpen) {
    if (!k || A.isBody(k) || k.captive || k.jail || k.aboard || k.held || k.air || !(k.hp > 0)) return false;
    const t = k.task; if (t && (t.type === 'combat' || t.type === 'band' || t.type === 'escorted' || t.type === 'condemned')) return false;
    if (t && t.type === 'hide' && t.sh === 'taverna' && t.b === b.id && t.dono) return false; // (hiding there as anyone: his house's errand instead)
    if (!(wasOpen || insideOf(b).length || k.inside === b.id || (T.onDuty && T.onDuty(k)))) return false;
    const dr = G.Vg.door(b); return k.inside === b.id || G.dist(k.x, k.y, dr[0], dr[1]) < TC.DONO;
  }
  // (the day shut by the context: the fire close by — everyone out —; the war — with the danger at the door, who is at the tables
  // crouches where he is, the keeper bars or opens it; before it reaches the door, the cups are finished and each goes home)
  TC.fecha = function (op, b) {
    const S = S_(); const c = TC.of(b); const why = c.fogo ? 'o fogo perto' : 'a guerra à porta';
    if (!c.fogo && c.perigo) for (const id of Object.keys(op.data.mesa)) {
      const v = S.villagers.get(+id); const m = op.data.mesa[id]; if (!v || m.corpo || m.body || A.isBody(v)) continue;
      if (v.task && v.task.type === 'tavern' && v.task.op === op.id && v.inside === b.id) G.Vg.setTask(v, hideTask(b, v));
    }
    T.cut(op, why);
  };
  // (who is in the street by the house opened to it, called in by the keeper: of its people, nearer to it than to home, by the map, while
  // it has room — the nearest first)
  function callIn(b, k) {
    const S = S_(); let room = TC.room(b); if (room < 1) return; const fid = fidOf(b); const dr = G.Vg.door(b); const L = [];
    for (const o of S.villagers.values()) {
      if (o.inside || o === k || A.isBody(o) || o.captive || o.jail || o.aboard || o.held || o.air || o.carried || o.age < 2 || G.Fac.idOfV(o) !== fid) continue;
      const t = o.task; if (t && (t.type === 'combat' || t.type === 'band' || t.type === 'hide' || t.type === 'escorted' || t.type === 'escape' || t.type === 'condemned')) continue;
      const d = G.dist(o.x, o.y, dr[0], dr[1]); if (d > TC.CHAMA) continue;
      const h = o.home && S.buildings.get(o.home); if (h && h !== b && G.Village.livable(h)) { const hd = G.Vg.door(h); if (G.dist(o.x, o.y, hd[0], hd[1]) < d) continue; }
      L.push([d, o]);
    }
    L.sort((a, c) => a[0] - c[0] || a[1].id - c[1].id);
    for (const [, o] of L) { if (room < 1) break; if (!G.W.reaches(o, dr[0], dr[1])) continue; G.Vg.setTask(o, hideTask(b, o)); if (hiding(o, b) || (o.task && o.task.type === 'hide' && o.task.b === b.id)) { room--; b.abrigo.n = (b.abrigo.n || 0) + 1; } }
  }
  function look(b) {
    const S = S_(); const c = TC.of(b); const op = T.dia(b); const wasOpen = !!op;
    if (op && (c.fogo || c.guerra)) TC.fecha(op, b);
    if (c.perigo && !broken(b)) {
      if (b.abrigo) b.abrigo.calma = r1(S.clock);
      const k = T.keeperOf(b); if (canKeep(k, b, wasOpen)) G.Vg.setTask(k, hideTask(b, k, true));
      if (calling(b)) callIn(b, T.keeperOf(b));
    } else if (b.abrigo || b.tranca) {
      // (the all clear with nobody keeping the house — the keeper gone, taken, dead —: the bar lifted here)
      const k = T.keeperOf(b); const kt = k && k.task;
      if (!(kt && kt.type === 'hide' && kt.sh === 'taverna' && kt.b === b.id) && S.clock - ((b.abrigo && b.abrigo.calma) || (b.tranca && b.tranca.t) || 0) > TC.CALMA && !c.perigo && !LOUD[c.guerra]) lift(b);
    }
  }
  A.hooks.tick.push(function () { const S = S_(); for (const set of S.settlements.values()) for (const b of E.byType(set.id, 'taverna')) if (b.built) look(b); });

  // ------------------------------ the door mended (D-815) ------------------------------
  // (a door broken in, the danger past: the keeper mends it with the wood TC.CONSERTO — the house's own, the fire's, or the people's
  // store's spare, bought where coin goes —, at the door, by the ledger: «porta-madeira» into his hands, «porta-conserto» used)
  TC.consertoDue = function (b) {
    if (!broken(b)) return false; const c = TC.of(b); if (c.guerra || c.fogo) return false;
    const fid = fidOf(b); const set = S_().settlements.get(b.set);
    return D.free('b:' + b.id, 'wood') >= TC.CONSERTO - EPS || (!!set && (G.Casa && G.Casa.spare ? G.Casa.spare(set, 'wood') : D.free('f:' + fid, 'wood')) >= TC.CONSERTO + 2);
  };
  // (the keeper's day asks it first, with nobody waiting at the tables: G.Taverna.task)
  TC.consertoTask = (v, b, H) => (TC.consertoDue(b) && !A.isBody(v) ? H.setTask(v, { type: 'consertar', id: b.id, pri: 1, st: 0 }) : null);
  const oldRun = E.run;
  E.run = function (v, t, dt, H) { if (t.type === 'consertar') { runConserto(v, t, dt, H); return true; } return oldRun(v, t, dt, H); };
  const oldText = E.taskText;
  E.taskText = function (v, t) { if (t.type === 'consertar') return t.st < 2 ? 'Indo buscar madeira para a porta da taverna' : 'Consertando a porta arrombada da taverna'; return oldText(v, t); };
  function runConserto(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const f = G.Fac.ofV(v);
    if (!b || !b.built || b.type !== 'taverna' || !f || !broken(b)) return H.end(v);
    const n = TC.CONSERTO; const mine = v.carry && v.carry.k === 'wood' && v.carry.n >= n - EPS;
    if (t.st === 0) {
      // (the house's wood taken into the hands at once — bound to its shelf: the fire would burn it meanwhile —; in the house already, the
      // door mended from inside it, else from its doorstep)
      if (!mine && D.free('b:' + b.id, 'wood') >= n - EPS && !(v.carry && v.carry.n > EPS)) { const r = D.move('b:' + b.id, 'v:' + v.id, 'wood', n, { code: 'porta-madeira', by: v.id, to: 'b:' + b.id }); if (!r.ok) return H.end(v); }
      if (v.carry && v.carry.k === 'wood' && v.carry.n >= n - EPS) { if (v.inside === b.id) { t.st = 4; v.actT = 0; } else t.st = 2; return; }
      const s = G.Village.nearestDropoff(v.x, v.y, v.set); if (!s) return H.end(v);
      if (t.wk !== s.id) { t.wk = s.id; if (!G.Vg.gotoB(v, s, 0.2)) return H.end(v); }
      if (!H.move(v, dt)) return; t.st = 1; v.actT = 0; return;
    }
    if (t.st === 1) {
      v.act = 'lift'; if (v.actT < 0.8) return;
      const cost = E.coinage && E.coinage(f.id) ? Math.round((E.PRICE.wood || 0.3) * n * 0.6 * 100) / 100 : 0; const from = cost ? E.coinRef(v) : null;
      if (from && D.get(from, 'moedas') + EPS < cost) return H.end(v);
      // (bound to the house: a cut errand takes it to the shelf, and the next one mends with it)
      const r = from ? D.swap(['f:' + f.id, 'v:' + v.id, 'wood', n], [from, 'f:' + f.id, 'moedas', cost], { code: 'porta-madeira', by: v.id, to: 'b:' + b.id }) : D.move('f:' + f.id, 'v:' + v.id, 'wood', n, { code: 'porta-madeira', by: v.id, to: 'b:' + b.id });
      if (!r.ok) return H.end(v); t.st = 2; return;
    }
    if (t.st === 2) { const dr = G.Vg.door(b); if (!H.goto(v, dr[0], dr[1], false) && !H.goto(v, dr[0], dr[1], true)) return H.end(v); t.st = 3; return; }
    if (t.st === 3) { if (!H.move(v, dt)) return; const dr = G.Vg.door(b); if (G.dist(v.x, v.y, dr[0], dr[1]) < TC.AT_DOOR * 1.6) { t.st = 4; v.actT = 0; } else if ((t.rt = (t.rt || 0) + 1) > 3) return H.end(v); else t.st = 2; return; }
    // (at the door, the wood in the hands: the hands at it, the wood used)
    if (!(v.carry && v.carry.k === 'wood' && v.carry.n >= n - EPS)) return H.end(v);
    G.faceTo(v, b.x + b.w / 2 - v.x, b.y + b.h / 2 - v.y); v.act = 'build'; if (v.actT < TC.CONSERTO_T) return;
    const u = D.use('v:' + v.id, 'wood', n, { code: 'porta-conserto', by: v.id, mine: true }); if (!u.ok) return H.end(v);
    const was = b.porta; delete b.porta; delete b.portaHp;
    b.consertos = (b.consertos || 0) + 1;
    if (was && S.day - was.d <= 3) log(`${v.name} consertou a porta da taverna, arrombada na guerra.`, 'city', b.x, b.y);
    H.end(v);
  }

  // ------------------------------ the save ------------------------------
  // (the hidings are errands — not saved —: who hid in a tavern hides again where they were at the load, the keeper as he was; a damaged
  // bar, door or shelter let go, never trusted)
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { const L = []; for (const v of S_().villagers.values()) { const t = v.task; if (t && t.type === 'hide' && t.sh === 'taverna' && v.inside === t.b) L.push([t.b, v.id, t.dono ? 1 : 0, t.ks || '']); } out.tvAbrigo = L; },
    load(o) {
      const S = S_();
      for (const b of S.buildings.values()) {
        if (b.type !== 'taverna') { continue; }
        if (b.tranca !== undefined && !(b.tranca && typeof b.tranca === 'object' && Number.isFinite(b.tranca.t))) delete b.tranca;
        if (b.porta !== undefined && !(b.porta && b.porta.k === 'arrombada' && Number.isFinite(b.porta.t) && Number.isFinite(b.porta.d))) delete b.porta;
        if (b.abrigo !== undefined && !(b.abrigo && (b.abrigo.k === 'abrigar' || b.abrigo.k === 'trancar') && Number.isFinite(b.abrigo.t))) delete b.abrigo;
        if (b.portaHp !== undefined && !Number.isFinite(b.portaHp)) delete b.portaHp;
      }
      const L = o && Array.isArray(o.tvAbrigo) ? o.tvAbrigo : [];
      for (const e of L) {
        if (!Array.isArray(e)) continue; const b = S.buildings.get(e[0]); const v = S.villagers.get(e[1]);
        if (!b || b.type !== 'taverna' || !b.built || !v || v.captive || v.jail || broken(b)) continue;
        v.inside = b.id; G.Vg.setTask(v, Object.assign(hideTask(b, v, !!e[2]), e[2] && typeof e[3] === 'string' && e[3] ? { ks: e[3] } : {}));
        if (!(v.task && v.task.type === 'hide')) v.inside = 0;
      }
    },
  });
})(window.G);
