'use strict';
// ============================================================
//  A vida em casa (o Patch 2, a Parte 3). Quem mora numa casa vive
//  nela: deita na sua hora e levanta na sua — o relógio de cada um:
//  o pequeno cedo, o velho de madrugada, o taverneiro depois de
//  fechar a taverna —, ceia o que a despensa tem, cozinha no fogo
//  da casa, conversa com quem ainda está acordado, nina o bebê,
//  fica de cama quando adoece, espera quem está fora. Tudo no passo
//  do mundo e pelas portas de sempre: a tarefa pelo setTask, a
//  despensa pelo livro-razão (G.Depot), o lugar de cada um pela
//  planta da casa (o repartidor dos interiores pergunta G.Lar.want
//  e G.Lar.beds). Ninguém aparece em casa porque alguém chegou:
//  quem está fora está fora pela causa que o mundo tem — o
//  trabalho, o mar, a guerra, a festa, a cadeia —, lida, nunca
//  inventada (G.Lar.why, G.Lar.roster).
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot; if (!A || !D) return;
  const L = G.Lar = {};
  const AN = A.ANIM;
  // (the gestures of the house, beside the activities' own: cooking the household's supper at the fire, crouched, the whole
  // of its seconds — the god's body at the fire takes as long as anyone of the world, L.COOK —; rocking the baby, seated —
  // their poses are the 3D's, P4's; eating and sitting are the activities' file's)
  L.COOK = 9; // (seconds of the world over the fire for a household's supper)
  // (and the prayer of the faithful, kneeling — before the temple or inside it: five seconds of the world, villagers.js 'pray')
  if (A.addAnim) { A.addAnim('cozinhar', { act: 'cook', dur: L.COOK, contact: L.COOK - 0.2, hands: 2 }); A.addAnim('ninar', { act: 'rock', dur: 0, contact: 0, hands: 2 }); A.addAnim('rezar', { act: 'pray', dur: 5, contact: 4.8, hands: 0 }); }
  const housing = b => !!(b && G.BDEF[b.type] && G.BDEF[b.type].housing);
  // (the house that serves to live in — standing, or being raised further over its family —: G.Village.livable, L-371)
  const livable = b => G.Village.livable(b);
  const homeOf = v => { const h = v && v.home ? G.S.buildings.get(v.home) : null; return livable(h) ? h : null; };
  const isBody = v => !!(G.Possess && G.Possess.is && G.Possess.is(v));
  const food = h => D.get('h:' + h.id, 'food');

  // ------------------------------ the clock of each one (D-071) ------------------------------
  // when one goes to bed and when one gets up, in the world's hours (S.time, a fraction of the day): the person's, not the
  // sky's alone, and never stored — the age (the little ones early, the old early and up before the light), the trade (the
  // tavern keeper goes to bed after the tavern shuts, G.Taverna.horas: 0.88; the fisher, the shepherd and the priest are up
  // before the dawn), the temper (the idle get up later, the hard-working earlier, the sociable stay up longer) and a half
  // hour of one's own (G.hash of the id): the same person, the same hours, day after day
  const fr = x => x - Math.floor(x);
  L.clock = function (v) {
    const a = v.age, h = G.hash(Math.imul(v.id | 0, 7) + 3), q = G.hash(Math.imul(v.id | 0, 13) + 5);
    let bed, wake;
    if (a < 6) { bed = 0.66 + h * 0.03; wake = 0.03 + q * 0.03; }
    else if (a < 12) { bed = 0.69 + h * 0.03; wake = 0.025 + q * 0.04; }
    else if (a < 16) { bed = 0.72 + h * 0.04; wake = 0.02 + q * 0.05; }
    else if (a >= 62) { bed = 0.70 + h * 0.04; wake = 0.97 + q * 0.04; }
    else { bed = 0.74 + h * 0.07; wake = 0.005 + q * 0.05; }
    if (a >= 16) {
      const T = v.traits || [];
      if (T.includes('Preguiçoso')) wake += 0.025;
      if (T.includes('Trabalhador')) wake -= 0.02;
      if (T.includes('Sociável')) bed += 0.02;
      const r = v.role;
      if (r === 'taverneiro') { bed = 0.895 + h * 0.025; wake = 0.06 + q * 0.03; }
      else if (r === 'pescador' || r === 'pastor' || r === 'sacerdote') wake -= 0.03;
    }
    return { bed: fr(bed), wake: fr(wake) };
  };
  const inWin = (t, a, b) => (a <= b ? t >= a && t < b : t >= a || t < b);
  // (the hours this person sleeps: from the bed to the getting up — what the choice of sleeping asks, instead of the night)
  L.sleepy = function (v) { const c = L.clock(v); return inWin(G.S.time, c.bed, c.wake); };

  // ------------------------------ who is in each house, who cooks there, who carries a baby ------------------------------
  // (counted once a second of the world, in its step; asked from outside it — a panel, a frame —, counted afresh and not
  // kept: the world is the same with or without anyone looking)
  // (pf, pp: in a temple, the faithful and the priests at prayer inside it or on their way in — L.prayIn; care: the one of the
  // house minding the little ones at home by day)
  const HOUSE = () => ({ res: [], out: [], awake: [], cook: 0, care: 0, pf: 0, pp: 0 });
  let ix = null, ixS = null, ixT = -1;
  // (who found no way home a moment ago is not sent home again at once: the search that fails is the dearest one)
  let noWay = new Map();
  G.worldHooks.push(() => { ix = null; ixS = null; ixT = -1; noWay = new Map(); });
  const blocked = v => { const t = noWay.get(v.id); return t !== undefined && G.S.clock - t < 15; };
  function index() {
    const S = G.S; const sec = Math.floor(S.clock);
    if (G.inSim && ix && ixS === S && ixT === sec) return ix;
    const o = { house: new Map(), baby: new Map() };
    const at = id => { let e = o.house.get(id); if (!e) o.house.set(id, e = HOUSE()); return e; };
    for (const v of S.villagers.values()) {
      if (v.home && !v.captive) { const e = at(v.home); e.res.push(v); if (v.inside !== v.home && v.age >= 12) e.out.push(v); }
      if (v.inside && !v.sleeping && v.age >= 3) at(v.inside).awake.push(v);
      if (v.age < 2 && v.carrier) o.baby.set(v.carrier, v.id);
      const t = v.task; if (t && t.type === 'lar' && t.what === 'cozinhar') at(t.home).cook = v.id;
      if (t && t.type === 'lar' && t.what === 'cuidar' && t.st === 2 && !at(t.home).care) at(t.home).care = v.id; // (one minds: the first)
      if (t && t.type === 'pray' && t.inT) { const e = at(t.inT); if (t.priest) e.pp++; else e.pf++; }
    }
    if (G.inSim) { ix = o; ixS = S; ixT = sec; }
    return o;
  }
  const entry = h => index().house.get(h.id) || HOUSE();

  // ------------------------------ a meal at home: from the pantry, in the ledger ------------------------------
  // (a supper cooked today fills more than a cold bite from the jars — the cook's work is that difference)
  L.MEAL = 55; L.COOKED = 65;
  L.eat = function (v, h, cooked) {
    if (!v || !livable(h)) return false;
    const r = D.use('h:' + h.id, 'food', 1, { code: cooked ? 'ceia' : 'refeicao', by: v.id });
    if (!r.ok) return false;
    v.hunger = Math.max(0, v.hunger - (cooked ? L.COOKED : L.MEAL) * r.n);
    G.Vg.emote(v, 'food', 1.4);
    return true;
  };
  L.cooked = h => !!h && h.ceia === G.S.day; // (today's supper is cooked)

  // ------------------------------ the evening and the night at home: the task 'lar' ------------------------------
  // what one does at home, awake: the supper (from the pantry, at the table), cooking it (at the house's fire), talking with
  // whoever is awake, resting by the fire, rocking the baby one carries, lying ill in bed, waiting for one of the house who
  // is out, the first hours of grief at home. Only this file gives it (guard), always through setTask; it keeps the person in
  // the house from one thing to the next — the door is for going out (t.stay)
  const WHAT = { ceia: 1, cozinhar: 1, conversar: 1, descansar: 1, ninar: 1, acamado: 1, esperar: 1, luto: 1, cuidar: 1 };
  L.WHAT = WHAT;
  const PRI = { acamado: 1.3, cozinhar: 0.5, ceia: 0.5, luto: 0.95, cuidar: 0.6 };
  const pri = w => PRI[w] || 0.45;
  const SUPPER = t => t > 0.55 && t < 0.85; // (the hours of the supper: the evening and the start of the night)
  // how much this person wants to be at home now (a choice of decide, among the others) — or null: the ill and the badly
  // wounded in bed by day (L-227), the widowed in the first hours of grief, and, after dark and before one's own bed time,
  // the evening at home (L-225: awake is not a night outdoors). The evening's going home is decide's own 'home' (L.task)
  L.urge = function (v, night) {
    if (v.captive || v.jail || v.aboard || v.ug || v.held || v.air || v.age < 3 || isBody(v)) return null;
    if (!homeOf(v) || (v.inside !== v.home && blocked(v))) return null;
    if (L.bedrest(v)) return { u: 1.1 + (v.hp < 60 ? 0.3 : 0), pri: PRI.acamado, why: 'acamado' };
    if (!night && L.grief(v)) return { u: 0.8, pri: PRI.luto, why: 'luto' };
    // (the minding below a working day of one in their fifties, above an old one's: the smith of 58 keeps the forge)
    if (!night && !G.isEvening() && L.minder(v)) return { u: 0.5, pri: PRI.cuidar, why: 'cuidar' };
    if (night && !L.sleepy(v)) return { u: 0.7, pri: 0.45, why: 'noite' };
    return null;
  };
  // (the first days of an illness — its fever —: in bed at home. The later ones up and about, still weak)
  L.fever = v => v.sick > G.DAY_LEN * 0.25 && !L.sleepy(v);
  // (in bed at home, by day: the fever, or a bad wound — under 40 of life, not in a fight: in bed until it is over 60 —;
  // 'febre', 'ferida' or null. The wounded in bed heal as one asleep does: needs, villagers.js)
  L.bedrest = v => (L.fever(v) ? 'febre' : !L.sleepy(v) && !(v.sick > 0) && (v.hp < 40 || (v.hp < 60 && v.task && v.task.type === 'lar' && v.task.what === 'acamado')) && !(v.task && WARLIKE[v.task.type]) ? 'ferida' : null);
  const WARLIKE = { fight: 1, combat: 1, band: 1, army: 1, siege: 1, defend: 1, raid: 1, muster: 1, flee: 1, fire: 1, dragao: 1 };
  // (the widowed, the first half day of grief — the death of the partner: Village.kill's mourn of a day and a half —: at
  // home by day, by the fire; the funeral goes first, 1.1)
  L.grief = v => !!v.widow && v.mourn > G.DAY_LEN && v.age >= 16;
  // (the old of a house with little ones — three to six years old — mind them at home by day while the others are at work:
  // the house is not empty by day — the request's 3.1 and 3.2 —; the little ones stay with them instead of trailing after a
  // mother to the field. One minds — the first at home —, the other old of the house go about their day. The little ones of
  // the house who can come home, or none)
  const little = h => entry(h).res.filter(o => o.age >= 3 && o.age < 7 && !o.captive && !o.aboard && !o.held && !o.ug && !o.air);
  L.WAIT_CARE = 20; // (seconds the little ones wait at home for the one minding them who stepped out: L-235)
  L.minder = v => {
    if (v.age < 55 || v.sick > 0 || v.hp < 50 || !(v.home > 0)) return null;
    const h = homeOf(v); if (!h) return null;
    const c = entry(h).care; if (c && c !== v.id) return null;
    const k = little(h); return k.length ? k : null;
  };
  // the task: what to do at home now, by the house and the hour — or null. why: 'acamado' (ill), 'fome' (hungry, already home:
  // only the supper), 'tarde' (the evening's going home), 'noite' (awake after dark). only: just the supper (or cooking it)
  L.task = function (v, H, why, only) {
    const S = G.S; const h = homeOf(v);
    if (!h || v.captive || v.jail || v.aboard || v.ug || v.held || v.air || v.age < 3 || isBody(v)) return null;
    if (v.inside !== h.id && blocked(v)) return null;
    let what = null;
    if (why === 'acamado') what = 'acamado';
    else if (why === 'luto') what = 'luto';
    else if (why === 'cuidar') what = 'cuidar';
    // (a little one of a house where someone minds the little ones at home: at home, at play by the fire — or nothing)
    else if (why === 'cuidado') { const e = entry(h); if (!e.care || e.care === v.id) return null; what = 'conversar'; }
    else {
      const e = entry(h); const has = food(h) >= 1; const t = S.time;
      if (has && SUPPER(t) && !L.cooked(h) && !e.cook && v.age >= 14) what = 'cozinhar';
      else if (has && v.hunger > 30 && (SUPPER(t) || why === 'fome')) what = 'ceia';
      else if (only) return null;
      else what = idle(v, h, e);
    }
    return give(v, H, h, what);
  };
  // (awake at home with nothing to eat: the baby in one's arms rocked; one of the house out after dark waited for by the
  // fire; whoever else is awake, talked to; or a rest by the fire)
  function idle(v, h, e) {
    if (index().baby.has(v.id)) return 'ninar';
    if (!G.isNight() && !G.isEvening() && L.minder(v)) return 'cuidar'; // (by day, the old with little ones at home mind them)
    if (G.isNight() && v.age >= 16 && waited(v, e)) return 'esperar';
    if (e.awake.some(o => o.id !== v.id && o.age >= 6 && (!o.task || o.task.type === 'lar'))) return 'conversar';
    return 'descansar';
  }
  // (one of the house a grown one waits for: the partner or a grown child out after dark, awake, not on a long road)
  const FAR = { aboard: 1, band: 1, army: 1, combat: 1, siege: 1, expl: 1, migrate: 1, envoy: 1, trade: 1, saga: 1, escort: 1 };
  function waited(v, e) {
    for (const o of e.out) if ((o.id === v.partner || o.mother === v.id || o.father === v.id) && !o.sleeping && !o.aboard && !o.jail && !(o.task && FAR[o.task.type])) return o;
    return null;
  }
  function give(v, H, h, what) {
    const inn = v.inside === h.id;
    const t = H.setTask(v, { type: 'lar', what, home: h.id, pri: pri(what), st: 0, stay: h.id, kind: 'lar' });
    if (!t || v.task !== t) return null;
    if (inn) arrive(v, t, h);
    if (what === 'cozinhar') entry(h).cook = v.id;
    return t;
  }
  // (in: the house's jar, if one came home with it, is already in the house — setTask, by G.Life.jarHome, L-300)
  function arrive(v, t, h) { v.inside = h.id; t.st = 2; v.actT = 0; v.moving = false; v.path = null; }

  // the task's steps: to the door, in, and the evening at home
  L.run = function (v, t, dt, H) { if (t.type === 'lar') { runLar(v, t, dt, H); return true; } return false; };
  function runLar(v, t, dt, H) {
    const S = G.S; const h = S.buildings.get(t.home);
    // (the house gone, a ruin, or no longer one's own — the family moved —: the errand is over)
    if (!livable(h) || v.home !== h.id || !WHAT[t.what]) return H.end(v);
    if (t.st === 0) {
      if (v.inside === h.id) return arrive(v, t, h);
      const [fx, fy] = G.Village.frontTile(h);
      if (!H.goto(v, fx, fy, true)) { noWay.set(v.id, S.clock); return H.end(v); }
      t.st = 1; return;
    }
    // (in only from its door: a way that ended away from it is no way in — the way again, twice, then the errand ends, L-231)
    if (t.st === 1) { if (H.move(v, dt)) { if (!G.Vg.atDoor || G.Vg.atDoor(v, h, G.Vg.IN_R)) arrive(v, t, h); else if ((t.re = (t.re || 0) + 1) <= 2) t.st = 0; else { noWay.set(v.id, S.clock); H.end(v); } } else if (t.age > 60) H.end(v); return; }
    v.moving = false; v.path = null;
    const night = G.isNight();
    switch (t.what) {
      case 'acamado': {
        // (in bed while the fever or the wound lasts — fed from the pantry when hungry, the house's care; well again, up)
        v.act = '';
        if (!L.bedrest(v)) return H.end(v);
        if (v.hunger > 55 && !(t.ate > S.clock - 30) && L.eat(v, h, L.cooked(h))) t.ate = S.clock;
        if (G.R() < dt * 0.05) G.Vg.emote(v, 'sick', 1.5);
        return;
      }
      case 'cozinhar': {
        // (over the fire: the household's supper, cooked by the cook's hands — someone else may have done it meanwhile, or the
        // pantry gone empty)
        v.act = AN.cozinhar ? AN.cozinhar.act : '';
        if (L.cooked(h)) { t.what = 'ceia'; v.actT = 0; return; }
        if (food(h) < 1) { t.what = idle(v, h, entry(h)); v.actT = 0; return; }
        t.w = (t.w || 0) + dt; // (the pot takes its time, whoever stirs it: the body too)
        if (t.w >= L.COOK) { h.ceia = S.day; t.w = 0; t.what = 'ceia'; v.actT = 0; G.Vg.emote(v, 'food', 1.6); }
        return;
      }
      case 'ceia': {
        // (at the table: the pot first, if someone of the house is at the fire — a while —; then the meal, and a while at it)
        if (!t.ate) {
          const e = entry(h);
          if (e.cook && e.cook !== v.id && !L.cooked(h) && v.actT < 20) { v.act = AN.sentar ? AN.sentar.act : ''; return; }
          if (v.hunger > 15 && L.eat(v, h, L.cooked(h))) { t.ate = 1; v.actT = 0; v.act = AN.comer ? AN.comer.act : ''; return; }
          t.what = idle(v, h, e); v.actT = 0; return;
        }
        v.act = AN.comer ? AN.comer.act : '';
        if (v.actT > 2.4) { t.what = idle(v, h, entry(h)); t.ate = 0; v.actT = 0; }
        return;
      }
      case 'cuidar': {
        // (minding the little ones by the fire, by day — the evening or the night come, or no little one at home any more:
        // the house's evening goes on)
        v.act = AN.sentar ? AN.sentar.act : '';
        if (night || G.isEvening() || !L.minder(v)) { t.what = idle(v, h, entry(h)); v.actT = 0; return; }
        if (v.hunger > 45 && food(h) >= 1 && v.actT > 6) { t.what = 'ceia'; t.ate = 0; v.actT = 0; return; }
        if (G.R() < dt * 0.05) G.Vg.emote(v, 'heart', 1.2);
        return;
      }
      case 'luto': {
        // (by the fire, the first hours of grief; the grief eased — or the night come —, the house's evening goes on)
        v.act = AN.sentar ? AN.sentar.act : '';
        if (!L.grief(v) || night) { t.what = idle(v, h, entry(h)); v.actT = 0; return; }
        if (v.hunger > 45 && food(h) >= 1 && v.actT > 6) { t.what = 'ceia'; t.ate = 0; v.actT = 0; return; }
        if (G.R() < dt * 0.06) G.Vg.emote(v, 'sad', 1.6);
        return;
      }
      case 'esperar': {
        // (by the fire until the one waited for is home, asleep or gone a long way — or until one's own bed time: decide)
        v.act = AN.sentar ? AN.sentar.act : '';
        if (!night || !waited(v, entry(h))) { t.what = idle(v, h, entry(h)); v.actT = 0; }
        else if (G.R() < dt * 0.04) G.Vg.emote(v, 'question', 1.2);
        return;
      }
      case 'ninar': {
        v.act = AN.ninar ? AN.ninar.act : '';
        if (!index().baby.has(v.id)) { t.what = idle(v, h, entry(h)); v.actT = 0; return; }
        if (G.R() < dt * 0.05) G.Vg.emote(v, 'heart', 1.3);
        if (!night && !G.isEvening() && v.actT > 20) return H.end(v);
        return;
      }
      default: {
        // conversar, descansar: a while by the fire or at the table; by day the house lets one go (the work calls)
        v.act = AN.sentar ? AN.sentar.act : '';
        if (t.what === 'conversar' && G.R() < dt * 0.25 && (!v.emo || v.emo.t < 0.2)) G.Vg.emote(v, 'chat', 1.2);
        if (v.hunger > 45 && food(h) >= 1 && v.actT > 6) { t.what = 'ceia'; t.ate = 0; v.actT = 0; return; }
        // (a little one minded at home stays; the one minding gone out a moment — a meal at the store, a rest —, the little ones
        // wait for her by the fire a while before they go about their day: they went after their mothers to the fields, and
        // into a cave, the moment Cassandra went to eat, L-235)
        const minded = v.age < 7 && !night && !G.isEvening() && !!entry(h).care;
        if (minded) { t.minded = 1; t.gone = 0; } else if (t.minded) t.gone = (t.gone || 0) + dt;
        if (!night && !G.isEvening() && v.actT > 12 && !minded && !(t.minded && t.gone < L.WAIT_CARE)) return H.end(v);
        // (a look round the house every few seconds: one of the house gone out into the night is waited for, the one to talk
        // to gone to bed leaves a rest by the fire, one come home is talked to — the while at home goes on, the same evening)
        t.look = (t.look || 0) + dt;
        if (t.look > 3) { t.look = 0; const w = idle(v, h, entry(h)); if (w !== t.what) t.what = w; }
      }
    }
  }
  L.taskText = function (v, t) {
    if (t.type !== 'lar') return null;
    const S = G.S;
    if (t.st < 2) return t.what === 'acamado' ? (L.bedrest(v) === 'ferida' ? 'Voltando para casa, ferid' + (v.g === 'f' ? 'a' : 'o') : 'Voltando para casa, doente') : t.what === 'luto' ? 'Voltando para casa, de luto' : 'Voltando para casa';
    const nm = id => { const o = S.villagers.get(id); return o ? o.name : 'alguém'; };
    switch (t.what) {
      case 'acamado': return L.bedrest(v) === 'ferida' ? 'De cama, ferid' + (v.g === 'f' ? 'a' : 'o') : 'De cama, doente';
      case 'cuidar': { const h = S.buildings.get(t.home); const k = h ? little(h).filter(o => o.inside === h.id) : []; return k.length ? `Cuidando de ${k.slice(0, 3).map(o => o.name).join(', ')} em casa` : 'Cuidando das crianças em casa'; }
      case 'luto': { const o = S.dead && S.dead.get(v.widow); return o ? `De luto por ${o.name}, em casa` : 'De luto, em casa'; }
      case 'cozinhar': return 'Cozinhando a ceia da casa';
      case 'ceia': return t.ate ? (L.cooked(S.buildings.get(t.home)) ? 'Ceando em casa' : 'Comendo em casa, da despensa') : 'Esperando a ceia ficar pronta';
      case 'esperar': { const h = S.buildings.get(t.home); const o = h ? waited(v, entry(h)) : null; return o ? `Esperando ${o.name} voltar para casa` : 'Esperando em casa'; }
      case 'ninar': { const id = index().baby.get(v.id); return id ? `Ninando ${nm(id)}` : 'Ninando o bebê'; }
      case 'conversar': return v.age < 12 ? 'Brincando em casa, junto ao fogo' : 'Conversando em casa';
      case 'descansar': return v.age < 12 ? 'Brincando em casa, junto ao fogo' : 'Descansando em casa, junto ao fogo';
    }
    return 'Em casa';
  };

  // ------------------------------ where one is, and why (D-072) ------------------------------
  // (as the world has it: at home — asleep, at supper, at the fire —, or away — at work, at sea, at war, in a cell, a captive,
  // in a cave, at a feast, at the tavern —; with a short code for the proofs. 'nada': out with nothing to do, which the
  // checker watches after dark)
  const AT_HOME = { ceia: 'ceia', cozinhar: 'cozinha', conversar: 'conversa', descansar: 'descansa', ninar: 'nina', acamado: 'acamado', esperar: 'espera', luto: 'luto', cuidar: 'cuida' };
  const WAR = { band: 1, army: 1, combat: 1, muster: 1, siege: 1, defend: 1, raid: 1 };
  const HOMEWARD = { lar: 1, sleep: 1, goHome: 1, shelter: 1, family: 1 };
  L.why = function (v) {
    const S = G.S; const t = v.task; const h = v.home ? S.buildings.get(v.home) : null;
    const at = (code, txt) => ({ home: true, code, txt }), away = (code, txt) => ({ home: false, code, txt });
    const inHome = !!(h && v.inside === h.id);
    if (isBody(v)) return inHome ? at('corpo', 'Em casa, vivido pelo deus') : away('corpo', 'Vivido pelo deus');
    // (a baby is where the arms that hold it are: at home, or out with them — never «with nothing to do»)
    if (v.age < 2) { const c = S.villagers.get(v.carrier); const arms = c ? `no colo de ${c.name}` : ''; return inHome ? at('colo', v.sleeping ? 'Dormindo' + (arms ? ', ' + arms : '') : c ? `No colo de ${c.name}` : 'Em casa') : away('colo', c ? (v.sleeping ? `Dormindo, ${arms}` : `No colo de ${c.name}`) : 'Fora de casa'); }
    if (inHome) {
      if (v.sleeping) return at('dorme', 'Dormindo');
      if (t && t.type === 'lar') return at(AT_HOME[t.what] || 'casa', L.taskText(v, t));
      if (t && t.type === 'shelter') return at('abrigo', 'Abrigado da tempestade');
      return at('casa', t ? G.Vg.taskText(v) : 'Em casa');
    }
    if (v.aboard) return away('mar', 'No mar, a bordo');
    if (v.jail) return away('preso', 'Na cadeia');
    if (v.captive) return away('cativo', 'Cativo');
    if (v.ug) return away('caverna', 'Debaixo da terra, numa caverna');
    if (v.inside) { const b = S.buildings.get(v.inside); return away(t && t.type === 'tavern' ? 'taverna' : 'outro', b ? G.Vg.taskText(v) : 'Fora'); }
    if (v.sleeping) return away('relento', 'Dormindo ao relento');
    if (!t) return away('nada', 'Sem afazer');
    const ty = t.type;
    const code = ty === 'fest' ? 'festa' : ty === 'tavern' ? 'taverna' : WAR[ty] ? 'guerra' : HOMEWARD[ty] ? 'caminho' : ty === 'wander' || ty === 'idle' ? 'nada' : 'afazer';
    return away(code, G.Vg.taskText(v));
  };
  // the people of a house: who lives there and who is in it (a guest), each with where they are and why — for the house's
  // card, the god's panel and the proofs; only reads
  L.roster = function (b) {
    const S = G.S; const out = []; if (!b) return out;
    for (const v of S.villagers.values()) {
      if (v.home !== b.id && v.inside !== b.id) continue;
      const w = L.why(v);
      out.push({ id: v.id, name: v.name, age: Math.floor(v.age), lives: v.home === b.id, in: v.inside === b.id, sleeping: !!v.sleeping, code: w.code, why: w.txt });
    }
    out.sort((a, c) => (c.lives - a.lives) || (c.age >= 16) - (a.age >= 16) || c.age - a.age || a.id - c.id);
    return out;
  };

  // ------------------------------ the place at home: what each one wants of the plan ------------------------------
  // (for the interiors' one share-out of places, In.places: the rule of the houses and of the temple — pure, asked only of
  // those the world has inside the building, in the step and in the frame alike. A use in order of liking, the 3D's state and
  // how pressing it is (pri: the share-out gives the more pressing first — the ill to the bed, the cook to the fire, the one
  // rocking a baby to a seat, the hungry to the table, before who only sits); { with }: a baby in the arms of who carries it,
  // no place of its own; null: the share-out's own default. With no seat left the share-out sits one on the ground)
  const WANT_PRI = { acamado: 5, cozinhar: 4, ninar: 3, ceia: 2, cuidar: 2, luto: 1, esperar: 1, conversar: 1, descansar: 0 };
  L.want = function (v, b) {
    const S = G.S; const t = v.task;
    if (v.age < 2) { const c = S.villagers.get(v.carrier); return c && c.inside === b.id && !v.sleeping ? { with: c.id } : v.sleeping ? { use: ['deitar'], item: null, st: 'sleep', pri: 5 } : null; }
    if (v.sleeping) return { use: ['deitar'], item: null, st: 'sleep', pri: 5 };
    if (t && t.type === 'pray') return t.priest ? { use: ['oficiar', 'rezar', 'sentar'], item: null, st: 'pray', pri: 2 } : { use: ['rezar', 'sentar'], item: null, st: 'pray', pri: 1 };
    if (t && t.type === 'lar') {
      const pri = WANT_PRI[t.what] || 0;
      switch (t.what) {
        // (ill in bed: one's own bed first, the one the household's rule gives)
        case 'acamado': { const In = G.Interiors; const own = In && In.bedOf ? In.bedOf(v) : null; return { use: ['deitar'], item: own && own.item ? own.item.id : null, st: 'sick', pri }; }
        case 'cozinhar': return { use: ['cozinhar', 'assar', 'aquecer'], item: null, st: 'cook', pri };
        case 'ceia': return { use: ['comer', 'sentar', 'aquecer'], item: null, st: t.ate ? 'eat' : 'sit', pri };
        case 'ninar': return { use: ['cuidar', 'sentar', 'aquecer'], item: null, st: 'rock', pri };
        case 'cuidar': return { use: ['sentar', 'aquecer', 'cuidar'], item: null, st: 'sit', pri };
        case 'conversar': return { use: ['sentar', 'comer', 'aquecer'], item: null, st: 'sittalk', pri };
        default: return { use: ['aquecer', 'sentar', 'comer'], item: null, st: 'sit', pri };
      }
    }
    if (t && (t.type === 'shelter' || t.type === 'goHome')) return { use: ['sentar', 'aquecer', 'comer'], item: null, st: 'sit', pri: 0 };
    return null;
  };
  // who sleeps where in a house (the interiors' In.beds shares the beds out by it; people: who lives there, and whoever the
  // world has asleep inside without living there): the order of choosing — the grown first, the eldest first, then the
  // children by age, the babies last —, the couple in one bed, the baby in the cradle if there is one free, else with its
  // mother (or whoever carries it), nobody of the house on the floor by choice — the guest sleeps there, the house's beds are
  // its own people's (L-228: on the floor lying down, the share-out's)
  L.beds = function (b, people) {
    const order = [], pair = new Map(), withM = new Map(), crib = new Set(), floor = new Set();
    const S = G.S; const list = (people || []).slice().sort((x, y) => (y.age >= 16) - (x.age >= 16) || y.age - x.age || x.id - y.id);
    const here = new Set(list.map(v => v.id)); const babies = [];
    const own = v => v.home === b.id;
    for (const v of list) {
      if (v.age < 2) { babies.push(v); continue; }
      order.push(v.id);
      if (!own(v)) { floor.add(v.id); continue; }
      const o = v.partner && here.has(v.partner) ? S.villagers.get(v.partner) : null;
      if (o && own(o) && !pair.has(v.id)) { pair.set(v.id, o.id); pair.set(o.id, v.id); }
    }
    babies.sort((x, y) => own(y) - own(x) || x.id - y.id);
    for (const v of babies) {
      order.push(v.id); if (own(v)) crib.add(v.id);
      const m = [S.villagers.get(v.mother), S.villagers.get(v.carrier), S.villagers.get(v.father)].find(o => o && here.has(o.id) && o.age >= 14);
      if (m) withM.set(v.id, m.id);
    }
    return { order, pair, with: withM, crib, floor };
  };
  if (G.Interiors && G.Interiors.placeRule) { G.Interiors.placeRule('casa', (b, v) => L.want(v, b)); G.Interiors.placeRule('templo', (b, v) => L.want(v, b)); }
  if (G.Interiors && G.Interiors.bedRule) G.Interiors.bedRule((b, people) => L.beds(b, people));

  // ------------------------------ the faithful inside the temple (L-224) ------------------------------
  // (a place free to pray in the temple's plan — the mats and the benches for the faithful, the altar for the priest —, counted
  // against those already praying inside and those on their way in: the faithful go in by the door and kneel before the image;
  // full, or a temple with no place of prayer, they keep to the rows before its door. The plan is pure: made now if it is not,
  // it is the same plan. A yes keeps the place for this one in the step's count — two sent in the same second are two)
  L.prayIn = function (v, b, priest) {
    const In = G.Interiors; if (!In || !In.plan || !b || !b.built || b.type !== 'temple') return false;
    const p = In.plan(b); if (!p || !p.ok) return false;
    const uses = priest ? ['oficiar'] : ['rezar', 'sentar'];
    let n = 0; for (const u of uses) n += In.slots(b, u).length;
    if (!n) return false;
    const o = index(); let e = o.house.get(b.id); if (!e) o.house.set(b.id, e = HOUSE());
    const t = v.task; const mine = t && t.type === 'pray' && t.inT === b.id && !!t.priest === !!priest ? 1 : 0;
    if ((priest ? e.pp : e.pf) - mine >= n) return false;
    if (!mine) { if (priest) e.pp++; else e.pf++; }
    return true;
  };

  // ------------------------------ the god's body at home (the adendo's 4.1) ------------------------------
  // in its own house the body eats at the table what the pantry has (today's supper hot, if it was cooked) and cooks the
  // household's supper at the fire — by the same doors as the people of the world (L.eat, the supper of today), in the world's
  // step, in the same seconds (the gestures 'comer' and 'cozinhar'). Offered where the plan has the piece, on the storey the
  // body is on; offers only read
  const TL = 4; // (the interiors' metres to a tile)
  function pieceAt(b, uses, lv) {
    const In = G.Interiors; if (!In || !In.slots || !In.ready || !In.ready(b)) return null;
    for (const u of uses) for (const q of In.slots(b, u)) if (lv === undefined || lv === null || q.item.lv === lv) return [b.x + q.spot.x / TL, b.y + q.spot.z / TL];
    return null;
  }
  const atHome = v => { const h = homeOf(v); return h && v.inside === h.id ? h : null; };
  // (a baby of the body's house — or its own child — within reach of it, and the arms of the house within reach of the baby)
  const ofHouse = (v, b) => b.mother === v.id || b.father === v.id || (!!v.home && b.home === v.home);
  const freeHands = v => !(v.carry && v.carry.n > 1e-6);
  function babyOffers(v, out) {
    const S = G.S; const Vg = G.Vg; if (!Vg.babyReach || !Vg.handBaby) return;
    for (const b of S.villagers.values()) {
      if (b.age >= 2 || b.captive || !ofHouse(v, b) || !Vg.babyReach(b, v)) continue;
      if (b.carrier !== v.id) { out.push({ id: 'lar.pegarBebe:' + b.id, act: 'pegarBebe', baby: b.id, label: `Pegar ${b.name} no colo`, at: [b.x, b.y], anim: 'levantar', hands: 2, ok: Vg.canHold(v) && freeHands(v), why: !freeHands(v) ? 'Suas mãos estão ocupadas.' : 'Agora você não pode segurar um bebê.' }); continue; }
      let n = 0;
      for (const o of S.villagers.values()) {
        if (n >= 3 || o.id === v.id || o.age < 14 || !(o.id === b.mother || o.id === b.father || (b.home && o.home === b.home)) || !Vg.babyReach(b, o)) continue;
        n++; out.push({ id: 'lar.darBebe:' + b.id + ':' + o.id, act: 'darBebe', baby: b.id, to: o.id, label: `Dar ${b.name} a ${o.name}`, at: [o.x, o.y], anim: 'entregar', hands: 1, ok: Vg.canHold(o), why: `${o.name} não pode segurar o bebê agora.` });
      }
    }
  }
  const babyOf = (v, o) => { const b = o && G.S.villagers.get(o.baby); return b && b.age < 2 && ofHouse(v, b) ? b : null; };
  A.def('lar', {
    name: 'Em casa', conserve: false,
    purpose: 'A vida em casa: comer à mesa o que a despensa tem e cozinhar a ceia da casa no fogo, pelas mesmas portas de quem mora nela; pegar no colo um bebê da casa, ou dá-lo a alguém da casa ali perto.',
    needs: 'estar dentro da própria casa, com comida na despensa; para o bebê, estar perto dele (na mesma casa, ou a poucos passos na rua)',
    offers(v, x, y, r) {
      const out = []; babyOffers(v, out);
      const h = atHome(v); if (!h) return out;
      const lv = G.Possess && G.Possess.level ? G.Possess.level() : undefined;
      const has = food(h) >= 1; const hot = L.cooked(h);
      const table = pieceAt(h, ['comer', 'sentar', 'aquecer'], lv);
      // (a house whose plan has no table, seat nor hearth on any storey — most huts —: the meal where the body stands, on the
      // floor, as the people of the house eat in it (D-085); with the body's gesture of eating — one of eating on the floor is
      // the 3D's to make, P3/P4. L-398)
      const floor = !table && !!(G.Interiors && G.Interiors.ready && G.Interiors.ready(h)) && !pieceAt(h, ['comer', 'sentar', 'aquecer']);
      const at = table && G.dist(x, y, table[0], table[1]) <= r + 0.5 ? table : floor ? [v.x, v.y] : null;
      if (at) out.push({ id: 'lar.comer:' + h.id, act: 'comer', label: hot ? 'Cear em casa (a ceia de hoje)' : 'Comer em casa, da despensa', at, anim: 'comer', hands: 1, ok: has && v.hunger > 15, why: !has ? 'A despensa da casa está vazia.' : 'Você não está com fome.' });
      const fire = pieceAt(h, ['cozinhar', 'assar', 'aquecer'], lv);
      if (fire && G.dist(x, y, fire[0], fire[1]) <= r + 0.5) out.push({ id: 'lar.cozinhar:' + h.id, act: 'cozinhar', label: 'Cozinhar a ceia da casa', at: fire, anim: 'cozinhar', hands: 2, ok: has && !hot, why: hot ? 'A ceia de hoje já está pronta.' : 'A despensa da casa está vazia.' });
      return out;
    },
    acts: {
      comer: {
        deed: 'refeicao',
        can(v) { const h = atHome(v); if (!h) return { ok: false, why: 'Só dentro de casa.' }; if (food(h) < 1) return { ok: false, why: 'A despensa da casa está vazia.' }; if (!(v.hunger > 15)) return { ok: false, why: 'Você não está com fome.' }; return { ok: true }; },
        run(v) { const h = atHome(v); const hot = L.cooked(h); if (!h || !L.eat(v, h, hot)) return { ok: false, why: 'A despensa da casa está vazia.' }; return { ok: true, msg: hot ? 'Você ceia em casa: a ceia de hoje, quente.' : 'Você come em casa, do que a despensa tem.' }; },
      },
      cozinhar: {
        deed: 'cozinha',
        can(v) { const h = atHome(v); if (!h) return { ok: false, why: 'Só dentro de casa.' }; if (L.cooked(h)) return { ok: false, why: 'A ceia de hoje já está pronta.' }; if (food(h) < 1) return { ok: false, why: 'A despensa da casa está vazia.' }; return { ok: true }; },
        run(v) { const h = atHome(v); if (!h || L.cooked(h) || food(h) < 1) return { ok: false, why: 'Agora não dá para cozinhar.' }; h.ceia = G.S.day; return { ok: true, msg: 'A ceia da casa está pronta: quem chegar com fome come quente.' }; },
      },
      // (the baby in the body's arms — or in the arms of one of the house within reach —, by the villagers' one door to a
      // baby's arms, G.Vg.handBaby: D-074)
      pegarBebe: {
        can(v, o) { const b = babyOf(v, o); if (!b) return { ok: false, why: 'O bebê não está mais aqui.' }; if (b.carrier === v.id) return { ok: false, why: 'O bebê já está no seu colo.' }; if (!freeHands(v)) return { ok: false, why: 'Suas mãos estão ocupadas.' }; if (!G.Vg.canHold(v) || !G.Vg.babyReach(b, v)) return { ok: false, why: 'Agora você não pode pegar o bebê.' }; return { ok: true }; },
        run(v, o) { const b = babyOf(v, o); if (!b || !freeHands(v) || !G.Vg.handBaby(b, v)) return { ok: false, why: 'Agora você não pode pegar o bebê.' }; return { ok: true, msg: `Você pega ${b.name} no colo.` }; },
      },
      darBebe: {
        can(v, o) { const b = babyOf(v, o); const c = o && G.S.villagers.get(o.to); if (!b || b.carrier !== v.id) return { ok: false, why: 'Você não está com o bebê.' }; if (!c || !G.Vg.canHold(c) || !G.Vg.babyReach(b, c)) return { ok: false, why: 'Não há quem segure o bebê aqui.' }; return { ok: true }; },
        run(v, o) { const b = babyOf(v, o); const c = o && G.S.villagers.get(o.to); if (!b || b.carrier !== v.id || !c || !G.Vg.handBaby(b, c)) return { ok: false, why: 'Não há quem segure o bebê aqui.' }; return { ok: true, msg: `Você dá ${b.name} a ${c.name}.` }; },
      },
    },
  });

  // ------------------------------ the save: who is at home stays at home (D-073) ------------------------------
  // The save lets everyone out at the door and wakes them (save.js, the same for every building): this hook keeps who was in
  // a house — asleep, at the fire, ill in bed, sheltering — and who slept outdoors, and on loading gives each of them back
  // what they were doing, through setTask, where they were (L-220). The body is the possess.js's own. A save of before keeps
  // no list: everyone at the door, as it always opened
  const r3 = x => Math.round(x * 1000) / 1000;
  (G.saveHooks = G.saveHooks || []).push({
    save(out) {
      const S = G.S; const list = [];
      for (const v of S.villagers.values()) {
        if (isBody(v) || v.age < 2) continue; // (a baby follows whoever carries it: babyUpdate)
        const t = v.task; const b = v.inside ? S.buildings.get(v.inside) : null;
        if (b && housing(b)) {
          const e = [v.id, b.id, r3(v.x), r3(v.y), v.sleeping ? 1 : 0, ''];
          if (t && t.type === 'sleep') e[5] = 'sleep';
          else if (t && t.type === 'lar' && t.st === 2 && WHAT[t.what]) { e[5] = t.what; e.push(t.ate ? 1 : 0, r3(t.w || 0)); }
          else if (t && t.type === 'shelter') e[5] = 'shelter';
          else continue; // (another errand in a house — the end of a day's work —: out at the door, as before)
          list.push(e);
        } else if (b && b.type === 'temple' && t && t.type === 'pray' && t.st === 2 && t.inT === b.id) list.push([v.id, b.id, r3(v.x), r3(v.y), 0, 'pray', t.priest ? 1 : 0, r3(v.actT || 0)]); // (at prayer inside the temple)
        else if (!v.inside && v.sleeping && t && t.type === 'sleep' && t.st >= 2) list.push([v.id, 0, r3(v.x), r3(v.y), 1, 'sleep']);
      }
      out.lar = list;
    },
    load(o) {
      const S = G.S; const list = Array.isArray(o.lar) ? o.lar : [];
      const body = o.avatar && Number.isFinite(o.avatar.id) ? o.avatar.id : 0;
      for (const e of list) {
        if (!Array.isArray(e) || !Number.isFinite(e[0]) || !Number.isFinite(e[2]) || !Number.isFinite(e[3])) continue;
        const v = S.villagers.get(e[0]); if (!v || v.id === body || v.task || v.captive || v.jail || v.aboard || v.ug || v.age < 2) continue;
        const b = e[1] ? S.buildings.get(e[1]) : null; const k = e[5];
        if (k === 'pray') {
          // (at prayer inside the temple: on with it there)
          if (!b || !b.built || b.type !== 'temple') continue;
          const t = { type: 'pray', pri: 0.6, st: 2, b: b.id, inT: b.id, priest: !!e[6], kind: 'pray' };
          G.Vg.setTask(v, t); if (v.task !== t) continue;
          v.x = e[2]; v.y = e[3]; v.path = null; v.moving = false; v.inside = b.id; v.actT = Number.isFinite(e[7]) ? e[7] : 0;
          continue;
        }
        if (e[1] && !livable(b)) continue; // (the house is gone, or a ruin: at the door, as the save left them)
        let t = null;
        if (k === 'sleep') t = { type: 'sleep', pri: 1.5, st: 2, home: b ? b.id : 0, kind: 'sleep' };
        else if (k === 'shelter' && b && b.id === v.home) t = { type: 'shelter', pri: 1.05, st: 2, kind: 'shelter' };
        else if (WHAT[k] && b && b.id === v.home) { t = { type: 'lar', what: k, home: b.id, pri: pri(k), st: 2, stay: b.id, kind: 'lar' }; if (e[6]) t.ate = 1; if (Number.isFinite(e[7]) && e[7] > 0) t.w = e[7]; }
        if (!t) continue;
        G.Vg.setTask(v, t); if (v.task !== t) continue;
        v.x = e[2]; v.y = e[3]; v.path = null; v.moving = false;
        v.inside = b ? b.id : 0; v.sleeping = !!e[4];
      }
      ix = null;
    },
  });
})(window.G);
