'use strict';
// ============================================================
//  A taverna (G.Taverna; o exemplo B). O dia de uma taverna é uma
//  operação do mundo ('taverna'): abre na hora dela, fecha na hora
//  dela, e tem o seu livro — quem foi servido, o que se vendeu, o
//  que entrou, o que custou, o que faltou. O taverneiro é o dono:
//  num povo de moeda compra no armazém do povo o que vai servir,
//  pagando do dinheiro da casa dele, e o que os fregueses pagam vai
//  para a casa dele; sem moeda a taverna é do povo, como a feira —
//  o armazém dá, e se serve de graça (D-077). O freguês vem por
//  vontade dele (a hora, o dinheiro da casa, um lugar que sobre):
//  entra, senta, pede, espera ser servido, paga, come ou bebe,
//  talvez outra rodada, e sai — na hora de deitar, quando a taverna
//  fecha, quando o dinheiro acaba, quando ninguém vem servir.
//  Faltando o que pediu, ouve «acabou». Ninguém nasce para encher
//  mesa: sem gente, a taverna fica vazia. A cerveja e o pulque são
//  fornadas da cuba (G.Oficio), do grão que o taverneiro comprou;
//  o vinho e o hidromel vêm do armazém. As bebidas de cada povo são
//  as do tavern.js; a música e as brigas, as de sempre, agora com
//  a gente sentada lá dentro. O corpo do deus pede, paga, bebe,
//  serve, abre e fecha pelas mesmas portas.
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco, O = G.Oficio; if (!A || !D || !E || !O) return;
  const T = G.Taverna = {};
  const EPS = 1e-6;
  const r2 = x => Math.round(x * 100) / 100;
  const live = A.live;
  const S_ = () => G.S;
  const AN = A.ANIM;
  const say = (v, key, ctx) => G.Falas && v && G.Falas.say(v, key, ctx);
  const Tv = () => G.Tavern; // (the drinks of each people: tavern.js)

  // the price of a meal and of a round, in the people's money; what a round takes of a unit of each drink (an amphora of
  // wine pours ten cups, a jar of beer four); what one pays at the store for the tavern's stock, of the town's price
  T.PRICE = { food: 0.4, drink: 0.3 };
  T.DOSE = { vinho: 0.1, mel: 0.15, cerveja: 0.25, pulque: 0.25 };
  const WHOLE = 0.6;
  T.SEATS = 8; // (the seats of a tavern whose plan does not say: two benches at each of four tables)
  const BREW = { cerveja: 1, pulque: 1 };
  const DRINKS = ['vinho', 'mel', 'cerveja', 'pulque'];

  A.addAnim('servir', { act: 'serve', dur: 2, contact: 1.4, hands: 1 });
  A.addAnim('beber', { act: 'drink', dur: 6, contact: 5.4, hands: 1 });
  A.addAnim('encher', { act: 'fill', dur: 3, contact: 2.6, hands: 2 });

  // ------------------------------ the vat (a trade of the tavern's own, on the engine of the trades) ------------------------------
  // the town's beer or pulque, brewed from the grain on the tavern's shelf — bought by its keeper: nothing is fetched for it
  const vat = (k, name) => ({ k, n: 3, in: 'food', shelf: 1, name, one: k === 'cerveja' ? 'jarra de cerveja' : 'cabaça de pulque', g: 'f', feito: 'Enchemos', st: [
    { id: 'grao', kind: 'busca', n: 2, name: 'esperando o grão' },
    { id: 'macerar', kind: 'mao', anim: 'amassar', use: 'mexer', take: 1, to: 'massa', give: 1.5, name: 'o grão de molho' },
    { id: 'fermentar', kind: 'espera', wait: 100, name: 'fermentando na cuba' },
    { id: 'encher', kind: 'mao', anim: 'encher', use: 'mexer', from: 'massa', take: 1.5, make: 1, brk: 0, name: 'enchendo os jarros' },
  ] });
  O.def('taverna', {
    b: 'taverna', role: 'taverneiro', name: 'Taverna', keep: 1, own: 1,
    rx: { cerveja: vat('cerveja', 'jarras de cerveja'), pulque: vat('pulque', 'cabaças de pulque') },
    // what the vat brews next: the people's drink, when it is brewed here and the shelf runs low, from grain the keeper has
    // beyond the day's meals — and the town not hungry (its granaries half full, or food for everyone)
    pick(b, f) {
      const k = brewOf(f); if (!k) return null;
      if (D.free('b:' + b.id, k) >= 2) return null;
      if (D.free('b:' + b.id, 'food') < 4) return null;
      if ((f.stock.food || 0) <= Math.max(20, Math.min(G.Fac.pop(f.id) * 1.2, G.Village.cap(f.id) * 0.5))) return null;
      return k;
    },
  });
  // the drink a people's tavern brews: its own, or the other one when the store has none of its own (tavern.js)
  function drinkOf(f) { const L = Tv() && Tv().DRINK; return (L && (L[(f && f.civ) || 'classico'] || L.classico)) || { k: 'cerveja' }; }
  function brewOf(f) { const d = drinkOf(f); if (BREW[d.k]) return d.k; if (d.alt && BREW[d.alt] && (f.stock[d.k] || 0) < 2) return d.alt; return null; }

  // ------------------------------ hours, the day, who keeps it ------------------------------
  // (the acord with act-lar.js: a pure function of the building and its town — the keeper goes to bed after the closing)
  // (the tavern is the evening's: the people come when the day's work ends — villagers.js decide —, the keeper works the
  // rest of the day at the store, the vat or whatever else is needed)
  T.horas = function (b) { const set = b && S_().settlements.get(b.set); return set && (set.tier || 0) >= 2 ? { abre: 0.55, fecha: 0.88 } : { abre: 0.58, fecha: 0.84 }; };
  const inHours = b => { const h = T.horas(b); const t = S_().time; return t >= h.abre - EPS && t < h.fecha; };
  T.inHours = inHours;
  // (asked often — the customers, the keeper, the lamp at the door in every frame —: an index of the open days, made again
  // when the operations or the clock change)
  let dIdx = null, dS = null, dN = -1, dT = -1;
  G.worldHooks.push(() => { dIdx = null; dS = null; dN = -1; dT = -1; });
  function days() { const S = S_(); const L = A.all(); if (dIdx && dS === S && dN === L.length && dT === S.clock) return dIdx; dIdx = new Map(); dS = S; dN = L.length; dT = S.clock; for (const op of L) if (op.def === 'taverna' && live(op)) dIdx.set(op.at, op); return dIdx; }
  T.dia = function (b) { const id = b && (b.id || b); const op = days().get(id); return op && live(op) ? op : null; };
  const keeperOf = b => { const S = S_(); for (const v of S.villagers.values()) if (v.job === b.id && v.role === 'taverneiro' && (A.able(v) || A.isBody(v))) return v; return null; };
  T.keeperOf = keeperOf;
  // (the keeper at hand: there, awake, not taken by a feast or a trial — the god's body is at hand when it is there)
  const atHand = k => !!k && (A.isBody(k) || (!k.sleeping && !(k.task && (k.task.pri || 0) >= 1.9 && k.task.type !== 'atender')));
  T.atHand = b => atHand(keeperOf(b));
  // open for the people: its day on, in its hours (the day opens only with its keeper at hand; afterwards, with the keeper
  // away — a feast, a trial, the day's other work —, who comes serves himself at the counter: below)
  T.aberta = b => { const op = T.dia(b); return !!op && op.st === 'on' && inHours(b); };
  // (the keeper called to the counter, when free of the tavern's own errands and of what weighs more — hunger, sleep, a
  // storm, a feast —: the day's other work, a walk, nothing)
  const OWN = { atender: 1, abastecer: 1, oficio: 1, carga: 1 };
  const serving = (b, op) => { const k = keeperOf(b); return !!k && atHand(k) && ((A.isBody(k) && G.dist(k.x, k.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h) + 2.5) || (!!k.task && k.task.type === 'atender' && k.task.op === op.id)); };
  T.serving = b => { const op = T.dia(b); return !!op && serving(b, op); };
  function callKeeper(b, op) {
    const k = keeperOf(b); if (!k || !G.inSim || A.isBody(k) || !atHand(k)) return;
    const t = k.task; if (t && (OWN[t.type] || (t.pri || 0) > 1 || t.type === 'shelter')) return;
    G.Vg.give(k, { type: 'atender', id: b.id, op: op.id, pri: 1.05, st: 0 });
  }
  // where the takings go: the keeper's house (or his purse); a tavern with no keeper, the people's treasury
  const payeeOf = b => { const k = keeperOf(b); const h = k && E.homeOf(k); return h ? 'h:' + h.id : k ? 'p:' + k.id : 'f:' + G.Village.facOfSet(b.set); };
  const coin = b => E.coinage(G.Village.facOfSet(b.set));
  T.withCoin = coin;
  // what is on the shelf to serve: a meal, and a round of a drink (the people's own first)
  function drinkOn(b) { const f = G.Fac.get(G.Village.facOfSet(b.set)); const d = drinkOf(f); for (const k of [d.k, d.alt].concat(DRINKS)) if (k && D.free('b:' + b.id, k) >= T.DOSE[k] - EPS) return k; return null; }
  T.drinkOn = drinkOn;
  T.menu = function (b) {
    const out = []; if (D.free('b:' + b.id, 'food') >= 1 - EPS) out.push({ k: 'food', n: 1, p: T.PRICE.food });
    const k = drinkOn(b); if (k) out.push({ k, n: T.DOSE[k], p: T.PRICE.drink }); return out;
  };
  // what a round or a meal is called, as its people says it ("uma caneca de cerveja", "um prato de comida")
  T.nome = k => (k === 'food' ? 'um prato de comida' : (Tv() && Tv().NAME[k] ? Tv().NAME[k][2] : 'uma bebida'));
  // the seats: the interiors' allotter says whether one more has a place at a table or on a bench, counting who is inside
  // (In.freePlace, P4); a tavern with no plan (In.table null), a count
  function full(b, op) {
    const In = G.Interiors; const n = Object.keys(op.data.mesa).length;
    if (In && In.freePlace && In.table && In.table(b)) return !In.freePlace(b, ['comer', 'sentar']);
    return n >= T.SEATS;
  }
  T.full = full;

  // ------------------------------ the day opens and closes ------------------------------
  // (once a day: at its opening hour, with its keeper at hand and something to serve; a day that could not open — the
  // shelf empty — opens later the same day once the keeper has bought; a day ended is not opened again)
  // (a day cut short — its keeper away, the tavern fallen — may open again the same day; one that closed is closed)
  const openedToday = b => A.all().some(op => op.def === 'taverna' && op.at === b.id && op.data && op.data.day === S_().day && (live(op) || op.st === 'ok'));
  function open(b) {
    const S = S_(); const k = keeperOf(b); if (!k || !atHand(k) || !G.inSim || T.dia(b) || openedToday(b) || !inHours(b)) return null;
    if (!T.menu(b).length) return null;
    const op = A.start('taverna', { at: b.id, set: b.set, fac: G.Village.facOfSet(b.set), to: 'b:' + b.id, why: 'dia', by: k.id, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { day: S.day, servidos: 0, receita: 0, custo: 0, vendas: {}, faltas: 0, recusas: 0, cheia: 0, mesa: {}, fila: [], q: 0 } });
    if (op) A.join(op, k, 'dono');
    return op;
  }
  T.open = b => (G.inSim ? open(b) : null);
  function close(op, st, why) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data;
    // everyone out: what is still in the hands is finished in a hurry, and the last ones leave by the door
    for (const id of Object.keys(d.mesa)) { const v = S.villagers.get(+id); if (!v) continue; finishCup(v, op); if (v.task && v.task.type === 'tavern' && v.task.op === op.id) G.Vg.endTask(v); }
    d.mesa = {}; d.fila = [];
    const k = b && keeperOf(b);
    if (k && st === 'ok' && d.servidos >= 3) A.note(k, 'memory', `Um dia na taverna: ${d.servidos} servidos${coin(b) ? `, ${String(r2(d.receita)).replace('.', ',')} de receita e ${String(r2(d.custo)).replace('.', ',')} de custo` : ''}${d.faltas ? `; faltou o que pediam ${d.faltas} ${d.faltas > 1 ? 'vezes' : 'vez'}` : ''}.`);
    A.end(op, st, why);
  }
  T.close = (op, why) => { if (op && live(op) && G.inSim) close(op, 'ok', why || 'fechada'); };
  // once a second: the taverns that should open, open
  A.hooks.tick.push(function () {
    const S = S_();
    for (const set of S.settlements.values()) for (const b of E.byType(set.id, 'taverna')) if (!T.dia(b) && inHours(b)) open(b);
  });
  // (who is at a table: a person of the world at it by the errand of this day, or the god's body by its door)
  function atTable(v, op) {
    const m = op.data.mesa[v.id]; if (!m) return false;
    if (m.body) { const b = S_().buildings.get(op.at); return A.isBody(v) && !!b && G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h) + 2.5; }
    return !!(v.task && v.task.type === 'tavern' && v.task.op === op.id && v.task.st >= 1);
  }
  function tick(op) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data;
    if (!b || b.type !== 'taverna' || !b.built) return close(op, 'int', 'a taverna caiu');
    if (G.Village.facOfSet(b.set) !== op.fac) return close(op, 'int', 'a taverna mudou de dono');
    if (d.day !== S.day || !inHours(b)) { if (Object.keys(d.mesa).length) say(keeperOf(b), 'fechando', {}); return close(op, 'ok', 'fechou'); }
    // (no keeper of it any more — the trade given to someone else, the keeper gone — for half a minute: the tavern closes,
    // and opens again when it has one)
    const kp = keeperOf(b);
    if (!kp) { if (!d.sem) d.sem = S.clock; else if (S.clock - d.sem > 30) return close(op, 'int', 'sem taverneiro'); } else d.sem = 0;
    // (someone waiting at a table: the keeper back to the counter, if free)
    if (d.fila.length) callKeeper(b, op);
    // whoever left by another door (another errand, taken away, dead) is no longer at the tables
    for (const id of Object.keys(d.mesa)) { const v = S.villagers.get(+id); if (!v || !atTable(v, op)) { if (v) finishCup(v, op); delete d.mesa[id]; } }
    if (d.fila.some(id => !d.mesa[id])) d.fila = d.fila.filter(id => d.mesa[id]);
    // a cup set down where someone fell is spilt
    for (const o of (S.loose || []).slice()) if (o.op === op.id) D.use('g:' + o.id, o.k, o.n, { op: op.id, code: 'derramou' });
  }

  // ------------------------------ a round: served, paid, drunk ------------------------------
  // the server's hand to a customer at a table: what was asked (or the other thing on the shelf), into the customer's hands,
  // the price from the customer's house to the keeper's — both or neither, once (the key of the round). → { ok, k, n | why }
  // (self: the customer at the counter, the keeper away — the same deal, the same book; nobody to say «aqui está»)
  function serve(op, v, c, self) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data; const m = d.mesa[c.id];
    if (!b || !m) return { ok: false, why: 'Não está mais na mesa.' };
    if (c.carry && c.carry.n > EPS) return { ok: false, why: 'Está com as mãos ocupadas.' };
    const menu = T.menu(b); const asked = m.want === 'food' ? menu.find(x => x.k === 'food') : menu.find(x => x.k !== 'food');
    const item = asked || (m.r === 0 ? menu[0] : null); // (on the first round one takes what there is; later, only what one wants)
    if (!item) { d.faltas++; say(v, 'acabou', { bem: m.want === 'food' ? 'a comida' : 'a bebida' }); m.out = 1; return { ok: false, why: 'Acabou.' }; }
    const key = 'tv:' + op.id + ':' + d.q;
    let r;
    if (coin(b)) {
      const from = E.coinRef(c);
      if (D.get(from, 'moedas') + EPS < item.p) { d.recusas++; say(c, 'sem_dinheiro', {}); m.out = 1; return { ok: false, why: 'Sem dinheiro para pagar.' }; }
      r = D.swap(['b:' + b.id, 'v:' + c.id, item.k, item.n], [from, payeeOf(b), 'moedas', item.p], { op: op.id, code: 'taverna', by: v.id, key });
    } else r = D.move('b:' + b.id, 'v:' + c.id, item.k, item.n, { op: op.id, code: 'taverna', by: v.id, key });
    if (!r.ok) return { ok: false, why: r.why || 'Não deu.' };
    d.q++; d.servidos++; d.vendas[item.k] = r2((d.vendas[item.k] || 0) + item.n); if (coin(b)) d.receita = r2(d.receita + item.p);
    m.st = 3; m.k = item.k;
    if (!self) say(v, 'servir_taverna', { bem: T.nome(item.k) });
    if (c.task && c.task.type === 'tavern' && c.task.op === op.id) { c.task.st = 3; c.actT = 0; }
    return { ok: true, k: item.k, n: item.n, p: coin(b) ? item.p : 0 };
  }
  T.serve = (op, v, c) => (G.inSim && op && live(op) ? serve(op, v, c) : { ok: false, why: '' });
  // what was served, eaten or drunk (in the ledger: the meal, the round) — and what it does to one
  function finishCup(v, op) {
    const c = v.carry; if (!c || c.op !== op.id || !(c.n > EPS)) return null;
    const k = c.k; const r = D.use('v:' + v.id, k, c.n, { op: op.id, code: k === 'food' ? 'refeicao' : 'bebida', by: v.id, mine: true });
    if (!r.ok) return null;
    const S = S_();
    if (k === 'food') { v.hunger = Math.max(0, v.hunger - 35); return k; }
    // the second round makes one tipsy, the third drunk for a long while (tavern.js counts the morning after)
    v.drinks = (v.drinks || 0) + 1; v.drinkDay = S.day;
    const b = S.buildings.get(op.at); if (b) b.served = (b.served || 0) + 1;
    const heavy = (v.traits || []).includes('Glutão') || (v.traits || []).includes('Sociável');
    if (v.drinks >= 2 || (heavy && G.R() < 0.35)) v.drunk = Math.max(v.drunk || 0, S.clock + 30 + v.drinks * 22);
    return k;
  }
  // what one asks for: a meal when hungry (and there is one), a round otherwise
  const want = (v, b) => (v.hunger > 40 && D.free('b:' + b.id, 'food') >= 1 - EPS ? 'food' : 'drink');
  // another round? a free evening, a sorrow, merry company — fewer with each one, none past the purse or the shelf
  function again(v, b, m) {
    if (m.r >= 4 || !T.menu(b).some(x => x.k !== 'food')) return false;
    if (coin(b) && E.purse(v) + EPS < T.PRICE.drink) return false;
    const tr = v.traits || [];
    const w = 0.25 + (tr.includes('Sociável') ? 0.25 : 0) + (tr.includes('Glutão') ? 0.2 : 0) + (v.mourn > 0 ? 0.3 : 0) - (tr.includes('Devoto') ? 0.15 : 0) - m.r * 0.12;
    return G.R() < w;
  }
  // (time to go home: the person's own bedtime — the house's clock, act-lar.js, gives it: G.Taverna.sleepy = its rule —; till
  // then, the late night)
  T.sleepy = v => G.S.time > 0.88 || G.S.time < 0.2;
  const sleepy = v => T.sleepy(v);

  // ------------------------------ the customer (the errand 'tavern': st 0 on the way, ≥ 1 inside) ------------------------------
  // a tavern for this person this evening: open, in reach, with a seat, and — in a people of coin — a house that can pay for
  // a round; none of it, no errand (nobody is made up to fill a table)
  T.visitTask = function (v, H) {
    const S = S_(); if (v.captive || v.age < 16 || (v.carry && v.carry.n > EPS)) return null;
    let best = null, bd = 30 * 30;
    for (const b of E.byType(v.set, 'taverna')) {
      const op = T.dia(b); if (!op || !T.aberta(b) || full(b, op)) continue;
      if (coin(b) && E.purse(v) + EPS < T.PRICE.drink) continue;
      const d = G.dist2(v.x, v.y, b.x, b.y); if (d >= bd) continue;
      const dr = G.Vg.door(b); if (!G.W.reaches(v, dr[0], dr[1])) continue;
      best = b; bd = d;
    }
    if (!best) return null;
    callKeeper(best, T.dia(best)); // (one coming: the keeper to the counter)
    // (a little above going home: the evening's choice is not undone on the way, nor at the table — sleep, hunger and the
    // closing still end it)
    return H.setTask(v, { type: 'tavern', id: best.id, op: T.dia(best).id, pri: 0.5, st: 0 });
  };
  function walkB(v, t, b, dt, H) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  // (inside: the world keeps one at the door, L-217; the interiors seat one at a free place of the use, t.use)
  function goIn(v, t, b, use) { const dr = G.Vg.door(b); v.x = dr[0]; v.y = dr[1]; v.inside = b.id; t.use = use; }
  function leave(v, t, op, H) {
    if (op && op.data && op.data.mesa[v.id]) { finishCup(v, op); delete op.data.mesa[v.id]; op.data.fila = op.data.fila.filter(id => id !== v.id); }
    return H.end(v);
  }
  function runFregues(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op)) return leave(v, t, op, H);
    const d = op.data;
    if (t.st === 0) {
      if (!T.aberta(b)) return H.end(v);
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r === 0) return;
      if (full(b, op)) { d.cheia++; G.Vg.emote(v, 'sad', 1); say(keeperOf(b), 'cheia', {}); return H.end(v); }
      goIn(v, t, b, 'sentar');
      const w = want(v, b); d.mesa[v.id] = { t: Math.round(S.clock * 10) / 10, r: 0, want: w, st: 2 }; d.fila.push(v.id);
      say(v, 'pedir_taverna', { bem: w === 'food' ? 'um prato de comida' : T.nome(drinkOn(b) || 'cerveja') });
      t.st = 2; t.wt = 0; v.actT = 0; return;
    }
    const m = d.mesa[v.id]; if (!m) return leave(v, t, op, H);
    if (m.out || sleepy(v) || !inHours(b)) return leave(v, t, op, H);
    if (t.st === 2) { // at the table, waiting to be served
      if (v.carry && v.carry.op === op.id) { t.st = 3; v.actT = 0; m.st = 3; return; }
      v.act = 'sit'; t.wt = (t.wt || 0) + dt;
      // (nobody at the counter for a while — the keeper away —: one serves oneself there, and pays as to the keeper)
      if (t.wt > 12 && !serving(b, op)) { d.fila = d.fila.filter(id => id !== v.id); const r = serve(op, v, v, true); if (!r.ok && !m.out) { d.fila.push(v.id); } t.wt = r.ok ? 0 : t.wt; if (r.ok) return; }
      if (t.wt > 45) { d.recusas++; say(v, 'sem_servico', {}); return leave(v, t, op, H); }
      life(v, t, b, op, dt); return;
    }
    if (t.st === 3) { // eating or drinking what was served
      const c = v.carry; if (!c || c.op !== op.id) { t.st = 2; t.wt = 0; m.st = 2; return; }
      const g = c.k === 'food' ? AN.comer : AN.beber; v.act = g.act; t.use = c.k === 'food' ? 'comer' : 'sentar';
      life(v, t, b, op, dt);
      if (v.actT < g.dur) return;
      finishCup(v, op); m.r++;
      if (again(v, b, m)) { m.want = want(v, b); m.st = 2; d.fila.push(v.id); t.st = 2; t.wt = 0; t.use = 'sentar'; return; }
      return leave(v, t, op, H);
    }
    return leave(v, t, op, H);
  }
  // the evening inside: a song when the room is full at night, and now and then a fight between two who drank too much
  // (court.js had them at the door; here they happen among the people at the tables)
  const brawls = new Map(); G.worldHooks.push(() => brawls.clear());
  T.brawling = v => brawls.has(v.id);
  function life(v, t, b, op, dt) {
    const S = S_(); const night = G.isNight() || G.isEvening();
    if (night && (!b._music || !S.villagers.has(b._music) || !op.data.mesa[b._music])) {
      let n = 0, cand = null; for (const id of Object.keys(op.data.mesa)) { const o = S.villagers.get(+id); if (!o || op.data.mesa[id].body) continue; n++; if (!cand && ((o.traits || []).includes('Sociável') || o.id % 4 === 0)) cand = o; }
      b._music = n >= 3 && cand ? cand.id : 0;
    }
    if (b._music === v.id) {
      v.act = 'play'; G.faceTo(v, 1, 1);
      if (G.R() < dt * 0.8 && G.FX && G.FX.floater) G.FX.floater(v.x + G.rr(-0.2, 0.3), v.y - 0.1, G.pick(['♪', '♫']), '#ffe9a8', 1.6);
      if (!night || v.actT > 15) b._music = 0;
      return;
    }
    const br = brawls.get(v.id);
    if (br) {
      const o = S.villagers.get(br.with);
      if (!o || br.t < S.clock) { brawls.delete(v.id); return; }
      v.act = 'fight'; G.faceTo(v, o.x - v.x, o.y - v.y);
      if (G.R() < dt * 1.5) { if (o.hp > 25) G.Vg.damage(o, 2, 'brawl'); o.stagT = S.clock + 0.3; G.Audio && G.Audio.at(v.x, v.y, 'hit'); }
      return;
    }
    if (v.drunk > S.clock && night && G.R() < dt * 0.006 && v.age >= 18) {
      let o = null; for (const id of Object.keys(op.data.mesa)) { const q = S.villagers.get(+id); if (q && q !== v && q.drunk > S.clock && !brawls.has(q.id) && !op.data.mesa[id].body) { o = q; break; } }
      if (o) {
        const until = S.clock + G.rr(4, 7); brawls.set(v.id, { with: o.id, t: until }); brawls.set(o.id, { with: v.id, t: until });
        G.Vg.emote(v, 'angry', 3); G.Vg.emote(o, 'angry', 3);
        const set = S.settlements.get(b.set);
        if (G.R() < 0.35 || !(set && set._brawl)) { if (set) set._brawl = S.day; G.Village.log(G.pick([`Briga na taverna de ${set ? set.name : ''}: ${v.name} e ${o.name} beberam demais e saíram no braço.`, `${v.name} acusou ${o.name} de roubar no jogo de dados. A taverna de ${set ? set.name : ''} virou ringue.`, `Uma jarra voou na taverna de ${set ? set.name : ''}: ${v.name} e ${o.name}, bêbados, foram separados à força.`]), 'war', b.x, b.y); }
      }
    }
  }

  // ------------------------------ the keeper ------------------------------
  // a customer waiting: serve; the shelf low and nobody waiting: buy at the store; the vat; and the counter, open
  T.task = function (v, b, f, H) {
    const op = T.dia(b); const busy = !!op && op.st === 'on' && inHours(b);
    if (busy && op.data.fila.length) return H.setTask(v, { type: 'atender', id: b.id, op: op.id, pri: 1.05, st: 0 });
    const need = restockPick(b, f, v); if (need) return H.setTask(v, { type: 'abastecer', id: b.id, k: need.k, n: need.n, pri: 1, st: 0 });
    const brew = O.task(v, b, f, H); if (brew) return brew;
    if (busy) return H.setTask(v, { type: 'atender', id: b.id, op: op.id, pri: 1, st: 0, idle: 1 });
    return null;
  };
  // what the shelf lacks that the store has and the keeper can pay for: the day's meals and the grain of the vat; the people's
  // drink where it is not brewed (the wine, the mead)
  function restockPick(b, f, v) {
    if (v.carry && v.carry.n > EPS) return null;
    const ref = 'b:' + b.id; const d = drinkOf(f); const brews = !!brewOf(f);
    const cands = [];
    const food = D.get(ref, 'food'); const want = 6 + (brews ? 4 : 0);
    if (food < want - 1 && (f.stock.food || 0) >= 16) cands.push({ k: 'food', n: want - food });
    for (const k of [d.k, d.alt]) if (k && !BREW[k] && D.get(ref, k) < T.DOSE[k] * 4 && D.free('f:' + f.id, k) >= 1) { cands.push({ k, n: 2 }); break; }
    for (const c of cands) {
      const n = Math.floor(Math.min(c.n, D.free('f:' + f.id, c.k), D.room('v:' + v.id, c.k, { to: ref }), D.room(ref, c.k)) + EPS);
      if (n < 1) continue;
      if (coin(b) && D.get(E.coinRef(v), 'moedas') + EPS < r2((E.PRICE[c.k] || 0.3) * n * WHOLE)) continue;
      return { k: c.k, n };
    }
    return null;
  }
  // the purchase at the store's door: the goods into the arms, marked for the tavern, and the coins from the keeper's house to
  // the treasury — both or neither; a people without coin: the store gives (the people's tavern)
  function buy(v, b, f, k, n) {
    const ref = 'b:' + b.id;
    n = Math.floor(Math.min(n, D.free('f:' + f.id, k), D.room('v:' + v.id, k, { to: ref }), D.room(ref, k)) + EPS);
    if (n < 1) return { ok: false, why: D.free('f:' + f.id, k) < 1 ? 'O armazém não tem.' : 'Não cabe mais.' };
    let r, cost = 0;
    if (coin(b)) {
      cost = r2((E.PRICE[k] || 0.3) * n * WHOLE); const from = E.coinRef(v);
      if (D.get(from, 'moedas') + EPS < cost) return { ok: false, why: 'Falta dinheiro para comprar.' };
      r = D.swap(['f:' + f.id, 'v:' + v.id, k, n], [from, 'f:' + f.id, 'moedas', cost], { code: 'atacado', by: v.id, to: ref });
      if (r.ok) { E.ensure(f); f.eco.sales += cost; }
    } else r = D.move('f:' + f.id, 'v:' + v.id, k, n, { code: 'taverna-povo', by: v.id, to: ref });
    if (!r.ok) return r;
    const op = T.dia(b); if (op && cost) op.data.custo = r2(op.data.custo + cost);
    return { ok: true, n, cost };
  }
  function runAbastecer(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const f = G.Fac.ofV(v);
    if (!b || !b.built || b.type !== 'taverna' || !f) return H.end(v);
    if (t.st === 0) { const s = G.Village.nearestDropoff(v.x, v.y, v.set); if (!s) return H.end(v); const r = walkB(v, t, s, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = AN.examinar.act; if (v.actT < AN.examinar.contact) return;
    const r = buy(v, b, f, t.k, t.n); if (!r.ok) return H.end(v);
    return H.setTask(v, { type: 'carga', to: 'b:' + b.id, pri: 1, st: 0 });
  }
  // at the counter: the first one waiting, served — the time of the gesture, to the table and back
  function runAtender(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op) || !inHours(b)) return H.end(v);
    const d = op.data;
    if (t.st === 0) { const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; t.wt = 0; goIn(v, t, b, 'vender'); } return; }
    v.act = AN.servir.act;
    if (t.st === 1) {
      const id = d.fila[0];
      if (!id) { t.wt = (t.wt || 0) + dt; if (t.wt > (t.idle ? 25 : 8)) return H.end(v); return; }
      const c = S.villagers.get(id); if (!c || !d.mesa[id]) { d.fila.shift(); return; }
      t.st = 2; t.cust = id; v.actT = 0; t.wt = 0; return;
    }
    if (v.actT < AN.servir.dur) return;
    if (d.fila[0] === t.cust) d.fila.shift(); else d.fila = d.fila.filter(id => id !== t.cust);
    const c = S.villagers.get(t.cust); if (c && d.mesa[c.id]) serve(op, v, c);
    t.st = 1; t.n = (t.n || 0) + 1; v.actT = 0;
    if (t.n >= 8) return H.end(v);
  }

  // ------------------------------ the definition, and the god's body at the tavern ------------------------------
  const where = b => G.Village.buildName(b).toLowerCase();
  const money = (b, n) => (G.Falas ? G.Falas.price((G.Fac.get(G.Village.facOfSet(b.set)) || {}).civ || 'classico', n) : String(n));
  A.def('taverna', {
    name: 'Taverna', conserve: false, many: false,
    purpose: 'O dia de uma taverna: abrir na hora, servir quem chega (comida e a bebida do povo), receber, comprar o que falta no armazém, fazer a cerveja na cuba, fechar.',
    needs: 'uma taverna na cidade com o seu taverneiro, e o que servir na prateleira',
    title(op) { const S = S_(); const b = S.buildings.get(op.at); const d = op.data; return `O dia ${b ? 'd' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + where(b) : 'da taverna'}: ${d.servidos} servidos${Object.keys(d.mesa).length ? `, ${Object.keys(d.mesa).length} à mesa agora` : ''}`; },
    avail(c, v, set) {
      for (const b of E.byType(set.id, 'taverna')) { const op = T.dia(b); if (!op) continue; return { ok: T.aberta(b), why: T.aberta(b) ? '' : 'fechada a esta hora', txt: `A taverna de ${set.name} está aberta`, known: G.dist(v.x, v.y, b.x, b.y) < 30 }; }
      return null;
    },
    tick,
    text(v, t, op) {
      const S = S_(); const b = S.buildings.get(t.id);
      if (t.type === 'atender') { const c = t.cust && S.villagers.get(t.cust); return t.st < 1 ? 'Indo para a taverna' : t.st === 2 && c ? `Servindo ${c.name}` : 'No balcão da taverna'; }
      if (t.type === 'tavern') {
        if (b && b._music === v.id) return 'Tocando música na taverna';
        if (brawls.has(v.id)) return 'Brigando na taverna';
        if (t.st === 0) return 'Indo para a taverna';
        if (t.st === 2) return 'Sentado na taverna, esperando ser servido';
        if (t.st === 3) return v.carry && v.carry.k === 'food' ? 'Comendo na taverna' : v.drunk > S.clock ? 'Bebendo além da conta na taverna' : 'Bebendo e conversando na taverna';
      }
      return null;
    },
    offers(v, x, y, r) {
      const S = S_(); const out = [];
      for (const b of S.buildings.values()) {
        if (b.type !== 'taverna' || !b.built) continue;
        const at = G.Vg.door(b); if (G.dist(x, y, at[0], at[1]) > r + 2) continue;
        if (G.Village.facOfSet(b.set) !== G.Fac.idOfV(v)) continue;
        const op = T.dia(b); const mine = v.job === b.id && v.role === 'taverneiro';
        const m = op && op.data.mesa[v.id]; const c = v.carry;
        if (mine) {
          if (!op && inHours(b)) out.push({ id: 'taverna.abrir:' + b.id, act: 'abrir', b: b.id, label: 'Abrir a taverna', at, anim: 'apontar', hands: 0, ok: !openedToday(b) && T.menu(b).length > 0, why: openedToday(b) ? 'Hoje a taverna já abriu e fechou.' : 'Não há o que servir: compre no armazém primeiro.' });
          if (op && live(op)) {
            out.push({ id: 'taverna.fechar:' + op.id, act: 'fechar', op: op.id, label: 'Fechar a taverna por hoje', at, anim: 'apontar', hands: 0 });
            const id = op.data.fila[0]; const w = id && S.villagers.get(id);
            if (w) out.push({ id: 'taverna.servir:' + op.id + ':' + w.id, act: 'servir', op: op.id, cust: w.id, label: `Servir ${w.name} (${op.data.mesa[w.id] && op.data.mesa[w.id].want === 'food' ? 'comida' : 'bebida'})`, at, anim: 'servir', hands: 1 });
          }
          continue;
        }
        if (!op || !T.aberta(b)) continue;
        if (m && c && c.op === op.id) { out.push({ id: 'taverna.consumir:' + op.id, act: 'consumir', op: op.id, label: c.k === 'food' ? 'Comer' : `Beber ${T.nome(c.k)}`, at, anim: c.k === 'food' ? 'comer' : 'beber', hands: 1 }); continue; }
        if (m) { out.push({ id: 'taverna.sair:' + op.id, act: 'sair', op: op.id, label: 'Levantar e sair da taverna', at, anim: 'apontar', hands: 0 }); continue; }
        if (c && c.n > EPS) continue;
        for (const it of T.menu(b)) out.push({ id: 'taverna.pedir:' + op.id + ':' + it.k, act: 'pedir', op: op.id, k: it.k, label: `Sentar e pedir ${T.nome(it.k)}${coin(b) ? ` (${money(b, it.p)})` : ''}`, at, anim: 'apontar', hands: 0, ok: !full(b, op) && (!coin(b) || E.purse(v) + EPS >= it.p), why: full(b, op) ? 'A taverna está cheia.' : 'Falta dinheiro.' });
      }
      return out;
    },
    acts: {
      pedir: {
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'A taverna fechou.' }; const b = S_().buildings.get(op.at); if (!T.aberta(b)) return { ok: false, why: 'A taverna está fechada.' }; if (op.data.mesa[v.id]) return { ok: false, why: 'Você já está à mesa.' }; if (full(b, op)) return { ok: false, why: 'A taverna está cheia.' }; if (coin(b) && E.purse(v) + EPS < T.PRICE[o.k === 'food' ? 'food' : 'drink']) return { ok: false, why: 'Falta dinheiro.' }; return { ok: true }; },
        run(v, o) { const op = A.get(o.op); const S = S_(); op.data.mesa[v.id] = { t: Math.round(S.clock * 10) / 10, r: 0, want: o.k === 'food' ? 'food' : 'drink', st: 2, body: 1 }; op.data.fila.push(v.id); const b = S.buildings.get(op.at); say(v, 'pedir_taverna', { bem: T.nome(o.k) }); return { ok: true, msg: keeperOf(b) && !A.isBody(keeperOf(b)) ? 'Você senta e pede. Agora é esperar ser servido.' : 'Você senta e pede — mas não há ninguém para servir agora.' }; },
      },
      consumir: {
        deed: 'comer',
        can(v, o) { const op = A.get(o.op); return op && v.carry && v.carry.op === op.id ? { ok: true } : { ok: false, why: 'Você não tem nada para beber.' }; },
        run(v, o) { const op = A.get(o.op); const k = finishCup(v, op); const m = op.data.mesa[v.id]; if (m) { m.r++; m.st = 2; } return k ? { ok: true, msg: k === 'food' ? 'Você come.' : 'Você bebe.' } : { ok: false, why: 'Não deu.' }; },
      },
      sair: {
        can(v, o) { const op = A.get(o.op); return op && op.data.mesa[v.id] ? { ok: true } : { ok: false, why: 'Você não está à mesa.' }; },
        run(v, o) { const op = A.get(o.op); finishCup(v, op); delete op.data.mesa[v.id]; op.data.fila = op.data.fila.filter(id => id !== v.id); return { ok: true, msg: 'Você se levanta e sai.' }; },
      },
      servir: {
        deed: 'trabalho',
        can(v, o) { const op = A.get(o.op); if (!op || !live(op)) return { ok: false, why: 'A taverna fechou.' }; const c = S_().villagers.get(o.cust); return c && op.data.mesa[c.id] ? { ok: true } : { ok: false, why: 'Não está mais à mesa.' }; },
        run(v, o) { const op = A.get(o.op); const c = S_().villagers.get(o.cust); op.data.fila = op.data.fila.filter(id => id !== c.id); const r = serve(op, v, c); return r.ok ? { ok: true, n: r.n, msg: `Você serve ${T.nome(r.k)} a ${c.name}${r.p ? ` e recebe ${money(S_().buildings.get(op.at), r.p)}` : ''}.` } : r; },
      },
      abrir: {
        can(v, o) { const b = S_().buildings.get(o.b); if (!b || v.job !== b.id) return { ok: false, why: 'A taverna não é sua.' }; if (!inHours(b)) return { ok: false, why: 'Não é hora de abrir.' }; if (openedToday(b) || T.dia(b)) return { ok: false, why: 'Hoje a taverna já abriu.' }; return T.menu(b).length ? { ok: true } : { ok: false, why: 'Não há o que servir.' }; },
        run(v, o) { const b = S_().buildings.get(o.b); const op = open(b); return op ? { ok: true, msg: 'Você abre a taverna.' } : { ok: false, why: 'Não deu para abrir.' }; },
      },
      fechar: {
        can(v, o) { const op = A.get(o.op); return op && live(op) && v.job === op.at ? { ok: true } : { ok: false, why: 'A taverna não é sua.' }; },
        run(v, o) { const op = A.get(o.op); if (Object.keys(op.data.mesa).length) say(v, 'fechando', {}); close(op, 'ok', 'fechada pelo taverneiro'); return { ok: true, msg: 'Você fecha a taverna por hoje.' }; },
      },
    },
  });
  // (whoever dies or is taken leaves the tables; the keeper gone, the day closes when nobody keeps it — tick)
  A.hooks.gone.push(function (v) { for (const op of A.all()) if (op.def === 'taverna' && live(op) && op.data.mesa[v.id]) { delete op.data.mesa[v.id]; op.data.fila = op.data.fila.filter(id => id !== v.id); } });

  // ------------------------------ the task machines, the keeper's job and the words of this file ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'tavern') { runFregues(v, t, dt, H); return true; }
    if (t.type === 'atender') { runAtender(v, t, dt, H); return true; }
    if (t.type === 'abastecer') { runAbastecer(v, t, dt, H); return true; }
    return oldRun(v, t, dt, H);
  };
  // (the keeper's day is this file's alone: one owner for the tavern — the counter, the stock, the vat)
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role === 'taverneiro') { const S = S_(); const b = v.job && S.buildings.get(v.job); const f = G.Fac.ofV(v); if (!b || !b.built || b.type !== 'taverna' || !f) return null; E.ensure(f); return T.task(v, b, f, H); }
    return oldJob(v, H);
  };
  E.tavernTask = (v, H) => T.visitTask(v, H);
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'abastecer') return t.st < 1 ? `Indo ao armazém comprar ${t.k === 'food' ? 'comida' : Tv() && Tv().NAME[t.k] ? Tv().NAME[t.k][0] : E.name(t.k)} para a taverna` : `Comprando ${t.k === 'food' ? 'comida' : Tv() && Tv().NAME[t.k] ? Tv().NAME[t.k][0] : E.name(t.k)} para a taverna`;
    return oldText(v, t);
  };
  // the tavern's panel: open or shut, the day's book, the tables
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    if (b.type === 'taverna' && b.built) {
      const hr = T.horas(b); const op = T.dia(b); const hh = x => `${Math.floor(x * 24)}h`;
      if (op && live(op)) { const d = op.data; h += `<div class="doing">Aberta (das ${hh(hr.abre)} às ${hh(hr.fecha)}): ${d.servidos} servidos hoje${coin(b) ? `, ${esc(money(b, d.receita))} de receita` : ''}${Object.keys(d.mesa).length ? ` · ${Object.keys(d.mesa).length} à mesa agora` : ''}${d.faltas ? ` · faltou ${d.faltas}×` : ''}</div>`; }
      else h += `<div class="doing">Fechada${inHours(b) ? (T.menu(b).length ? '' : ' — não há o que servir') : ` — abre às ${hh(hr.abre)}`}.</div>`;
    }
    return h;
  };
  A.hooks.canon.push(['taverna', () => A.all().filter(op => op.def === 'taverna' && live(op)).map(op => [op.id, op.at, op.data.day, op.data.servidos, r2(op.data.receita), Object.keys(op.data.mesa).sort().join(','), op.data.fila.join(',')])]);

  // ------------------------------ the save ------------------------------
  // (the errands are not saved: the people at the tables of an open day are seated again, as they were — waiting, or with
  // what was served in their hands —; a day of a tavern is the world's, never ended by a save. L-190's rule)
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() {
      const S = S_();
      for (const op of A.all()) {
        if (op.def !== 'taverna' || !live(op)) continue;
        const d = op.data; d.mesa = d.mesa && typeof d.mesa === 'object' ? d.mesa : {}; d.fila = Array.isArray(d.fila) ? d.fila.filter(id => d.mesa[id]) : [];
        for (const id of Object.keys(d.mesa)) {
          const v = S.villagers.get(+id); const m = d.mesa[id];
          if (!v || m.body || v.captive || v.jail) { delete d.mesa[id]; continue; }
          const st = v.carry && v.carry.op === op.id ? 3 : 2;
          G.Vg.setTask(v, { type: 'tavern', id: op.at, op: op.id, pri: 0.5, st, wt: 0, use: st === 3 && v.carry.k === 'food' ? 'comer' : 'sentar', kind: 'tavern' });
          if (v.task && v.task.type === 'tavern') v.inside = op.at; else delete d.mesa[id];
        }
        d.fila = d.fila.filter(id => d.mesa[id]);
      }
      brawls.clear();
    },
  });
})(window.G);
