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
//  A noite da taverna (os interiores 2.0, P7 — D-760 a D-766): quem
//  vai é quem quer, da hora em que o seu dia de trabalho acaba noite
//  adentro, nas noites que a vontade de cada um diz (a sorte do dia
//  pelo G.hash da pessoa e do dia, nunca o acaso do mundo) — mais
//  quem tem os amigos lá, quem é de sair, quem desceu do navio hoje;
//  menos o velho, o cansado, quem tem bebê de colo, quem mora longe;
//  nunca sem moeda. Entra pela porta e anda até o banquinho que
//  escolheu — à mesa dos amigos, ou a uma mesa vazia —, que é seu
//  enquanto estiver lá (In.hold). O taverneiro enche a caneca no
//  balcão, leva-a à mesa e só ali o freguês paga. A caneca dura: os
//  goles, a conversa, outra rodada se a bolsa deixa. O músico da
//  noite sobe ao estrado na hora dele e toca o instrumento do povo.
//  Na hora de ir para casa, levanta e sai andando pela porta, que a
//  taverna deixa aberta enquanto atende.
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
  // (the song of a full room at night: the lute in the arms, one hand strumming, as the god's view draws it — a gesture of the
  // world's own, with its pose in the 3D; the act stood outside G.Act.ANIM, and the 3D danced it: L-432)
  A.addAnim('tocar', { act: 'play', dur: 4, contact: 3.6, hands: 2 });
  // (the meal at a tavern's table: the plate on the table before one, the hand from it to the mouth, the other on the board — the
  // god's body's mouthful and the guests' meal, D-769; its pose, mesa-clips.js)
  A.addAnim('comerMesa', { act: 'dine', dur: 2.8, contact: 1.3, hands: 1 });

  // ------------------------------ the vat (a trade of the tavern's own, on the engine of the trades) ------------------------------
  // the town's beer or pulque, brewed from what is on the tavern's shelf — bought by its keeper: nothing is fetched for it. The beer
  // of the grain only (the cereal of the fields: G.Origem.CEREAL — a village of fishermen with no field brews none), the pulque of
  // the sap of the maguey (aguamiel, from the agave fields: estates.js) — what each is made of, 20h, D-444
  const OR = () => G.Origem;
  const vat = (k, name) => ({ k, n: 3, in: k === 'pulque' ? 'aguamiel' : 'food', of: k === 'pulque' ? null : (OR() ? OR().CEREAL : null), shelf: 1, name, one: k === 'cerveja' ? 'jarra de cerveja' : 'cabaça de pulque', g: 'f', feito: 'Enchemos', st: [
    { id: 'grao', kind: 'busca', n: 2, name: k === 'pulque' ? 'esperando o aguamiel' : 'esperando o grão' },
    { id: 'macerar', kind: 'mao', anim: 'amassar', use: 'mexer', take: 1, to: 'massa', give: 1.5, name: 'o grão de molho' },
    { id: 'fermentar', kind: 'espera', wait: 100, name: 'fermentando na cuba' },
    { id: 'encher', kind: 'mao', anim: 'encher', use: 'mexer', from: 'massa', take: 1.5, make: 1, brk: 0, name: 'enchendo os jarros' },
  ] });
  O.def('taverna', {
    b: 'taverna', role: 'taverneiro', name: 'Taverna', keep: 1, own: 1,
    rx: (T.VAT = { cerveja: vat('cerveja', 'jarras de cerveja'), pulque: vat('pulque', 'cabaças de pulque') }),
    // what the vat brews next: the people's drink, when it is brewed here and the shelf runs low, from grain the keeper has
    // beyond the day's meals — and the town not hungry (its granaries half full, or food for everyone)
    pick(b, f) {
      const k = brewOf(f, b); if (!k) return null;
      if (D.free('b:' + b.id, k) >= 2) return null;
      if (vatIn(b, k) < 4) return null;
      if ((f.stock.food || 0) <= Math.max(20, Math.min(G.Fac.pop(f.id) * 1.2, G.Village.cap(f.id) * 0.5))) return null;
      return k;
    },
  });
  // the drink a people's tavern brews: its own, or the other one when the store has none of its own (tavern.js)
  function drinkOf(f) { const L = Tv() && Tv().DRINK; return (L && (L[(f && f.civ) || 'classico'] || L.classico)) || { k: 'cerveja' }; }
  // (a people's own drink brewed while there is what it is made of: the pulque with the maguey's sap at hand — on the shelves or in
  // the store —, else the other one; the Aztecs with no agave brew the beer of their maize, 20h)
  function brewOf(f, b) {
    const d = drinkOf(f);
    if (BREW[d.k] && (d.k !== 'pulque' || !d.alt || sapNear(f, b))) return d.k;
    if (d.alt && BREW[d.alt] && (f.stock[d.k] || 0) < 2) return d.alt; return null;
  }
  const sapNear = (f, b) => (f.stock.aguamiel || 0) >= 1 || (!!b && D.get('b:' + b.id, 'aguamiel') >= 1);
  // (what of the vat's own input is on a tavern's shelf, free: the grain of the beer, the sap of the pulque)
  function vatIn(b, k) { const R = k === 'pulque' ? T.VAT.pulque : T.VAT.cerveja; return R.of && OR() ? OR().free('b:' + b.id, R.in, R.of) : D.free('b:' + b.id, R.in); }

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
  // (at the counter: the keeper's errand there, arrived — st 1 —, not his way to it: called from the market across the town, he
  // walked half a minute, the guests waited for him all of it, and none served himself, L-592)
  const serving = (b, op) => { const k = keeperOf(b); return !!k && atHand(k) && ((A.isBody(k) && G.dist(k.x, k.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h) + 2.5) || (!!k.task && k.task.type === 'atender' && k.task.op === op.id && k.task.st >= 1)); };
  T.serving = b => { const op = T.dia(b); return !!op && serving(b, op); };
  function callKeeper(b, op) {
    const k = keeperOf(b); if (!k || !G.inSim || A.isBody(k) || !atHand(k)) return;
    const t = k.task; if (t && (OWN[t.type] || (t.pri || 0) > 1 || t.type === 'shelter')) return;
    // (and his hands free: the call sends a plain load in them to its place first, as the work of his day would — the cup the
    // armless are given passes through the server's hand, D-152 —, and the next look brings him to the counter. Xiuhtonal of
    // Tenochtitlan, called to the counter with the meat of a hunt in his hands, kept it all the evening — no evening choice of
    // a grown one takes a load to the store —, and the guest with no arms was served nothing, L-793)
    if (G.Vg.plainLoad(k) && !(k._noStore > S_().clock)) { if (!t || t.type !== 'deliver') G.Vg.give(k, { type: 'deliver', pri: 1, kind: 'deliver' }); return; }
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
    const out = []; if (D.free('b:' + b.id, 'food') >= 1 - EPS) out.push({ k: 'food', n: 1, p: T.PRICE.food, dish: T.dish(b) });
    const k = drinkOn(b); if (k) out.push({ k, n: T.DOSE[k], p: T.PRICE.drink }); return out;
  };
  // what a round or a meal is called, as its people says it ("uma caneca de cerveja", "um prato de comida")
  // (the dish is what the meal is made of — the next of the shelf's food by the rule, what is eaten: a plate of fish only where
  // fish came to the shelf from the people's catch, 20h)
  const DISH = { peixe: 'um prato de peixe', marisco: 'um prato de mariscos', carne: 'um prato de carne', leite: 'uma tigela de coalhada', ovos: 'um prato de ovos', horta: 'uma sopa de legumes', fruta: 'uma tigela de frutas', trigo: 'pão com caldo', cevada: 'um caldo de cevada', arroz: 'um prato de arroz', milho: 'tortilhas de milho', sorgo: 'um mingau de sorgo' };
  T.DISH = DISH;
  T.dish = b => { const t = b && OR() ? OR().next('b:' + b.id, 'food') : null; return (t && DISH[t]) || 'um prato de comida'; };
  T.nome = (k, b) => (k === 'food' ? T.dish(b) : (Tv() && Tv().NAME[k] ? Tv().NAME[k][2] : 'uma bebida'));
  // the seats (D-762): the free places to sit at the tables, as the interiors' share-out has them after everyone inside — the
  // seats kept for whoever is at the stage too (In.freeCount) — less who is on the way to them (the door turned back who had set
  // out to a tavern its wish had counted with room: L-1926); a tavern with no plan, a count. Counted once a step of the world
  const SEAT_USES = ['sentar', 'comer'];
  let rIdx = null, rS = null, rT = -1;
  G.worldHooks.push(() => { rIdx = null; rS = null; rT = -1; });
  function freeSeats(b, op) {
    const S = S_(); if (G.inSim && rIdx && rS === S && rT === S.clock && rIdx.has(b.id)) return rIdx.get(b.id);
    const In = G.Interiors; const n0 = In && In.freeCount && In.table && In.table(b) ? In.freeCount(b, SEAT_USES) : null;
    const n = n0 === null || n0 === undefined ? T.SEATS - Object.keys(op.data.mesa).length : n0;
    if (G.inSim) { if (!rIdx || rS !== S || rT !== S.clock) { rIdx = new Map(); rS = S; rT = S.clock; } rIdx.set(b.id, n); }
    return n;
  }
  // (full at the door: no seat for one more — the one at the door is not inside yet, nor counted on the way)
  function full(b, op) { return freeSeats(b, op) < 1; }
  T.full = full;
  T.room = b => { const op = T.dia(b); return op ? freeSeats(b, op) - goers(b.id).coming : 0; };
  // (and where a guest sits is a seat — a bench, a stool, a chair at a table —, never the keeper's fire: with no bench free the
  // share-out's last rule gave the hearth and the stove first, a guest sat at the stove, a stool stayed free, and the door let
  // one in more than the tavern's places, L-479. The interiors load after this file: the rule is given at each world)
  // (the seat one sat down on is one's own: In.hold, below; the rule is for whoever has none — a load, the body —; talking with
  // the table, seated with the gesture of the talk, D-761)
  const seatOf = (b, v) => (v.task && v.task.type === 'tavern' ? { use: SEAT_USES, st: v.task.pose || 'sit' } : null);
  G.worldHooks.push(() => {
    if (G.Interiors && G.Interiors.placeRule) G.Interiors.placeRule('taverna', seatOf);
    // (the door of a tavern is open while its day is: the evening comes and goes through it, D-766 — before, the time's rule
    // locked it at the fall of night with the tables full, L-1923)
    if (G.Interiors && G.Interiors.doorRule) G.Interiors.doorRule('taverna', b => (T.aberta(b) ? 'aberta' : null));
  });

  // ------------------------------ the evening's wish (D-760) ------------------------------
  // The tavern is an evening out, chosen among the evening's other choices (villagers.js, decide: 'tavern', beside going home, the
  // plaza and the theatre) — nobody is sent to fill a table. Who: every grown one of a town with a tavern now and then; more who is
  // outgoing (the índole) or sociable, who has friends there tonight (G.Lacos: the ones one is fond of, at its tables or on the way
  // there — the friends go together), who is in mourning, the sailor ashore today; less the old, the tired, who has a baby in the
  // arms at home, who lives far from it, and a tavern with nothing to serve. When: from the end of one's working day (an hour of
  // one's own, G.hash of the id; the old, the nobles and the merchants from the opening) to a while before one's own hour to go
  // home — one's bed time and a little more, a night out (G.Lar.clock), never past the closing. How often: the wish is a share of
  // the nights, and whether tonight is one of them is the day's own lot for each one (G.hash of the person and the day: none of
  // the world's chance, D-760), once a night (v.tavDay, which the tavern writes as one sits down). What stops it: no coin for a
  // round, no seat for one more — who is on the way counts —, too long a walk, hunger to starving, worn out, a load in the hands or
  // the leg of an operation (D-094), the little ones to mind, the bed of the ill, the stoker's furnace; never the god's body
  T.PRI = 0.48;     // (the errand's weight: above the evening at home and the way home, 0,45 — one goes out after the supper —,
                    //  below the supper itself, 0,5, and any work)
  T.GO = 1.05;      // (the wish of tonight's one: above going home and the evening at home)
  T.IN = 1.2;       // (one on the way or at the table: the evening's choices do not take one from it — sleep, hunger, the closing do)
  T.BASE = 0.4;     // (the share of the nights, of anyone …)
  T.EXT = 0.25;     // (… more by how outgoing one is — the índole's ext, 0 to 1 —,)
  T.SOCIAL = 0.15;  // (sociable,)
  T.FRIEND = 0.3;   // (with friends there tonight,)
  T.SHORE = 0.45;   // (ashore from the sea today, D-155,)
  T.MOURN = 0.15;   // (drinking a sorrow;)
  T.DEVOUT = 0.15;  // (less the devout,)
  T.ELDER = 0.6;    // (the old,)
  T.SPENT = 22;     // (and none for one worn out — the bed's own mark, villagers.js: the tired one sits at the table and rests there, Vg.REST —
  T.WALK_E = 0.45;  //  nor for one the walk there would wear out: the energy a tile of the way takes, 100/80 of it a centésimo of the day
                    //  at about three tiles a centésimo. They set out and turned back to bed halfway, L-1928)
  T.BABY = 0.5;     // (a mother or father of a baby,)
  T.DRY = 0.3;      // (a tavern with nothing to drink on its shelf)
  T.NEAR = 12;      // (home within this many tiles of the tavern: the whole wish; beyond, less with each tile — over T.SPAN more —,
  T.SPAN = 40;      //  never under T.FLOOR of it)
  T.FLOOR = 0.3;
  T.REACH = 30;     // (a walk to the door longer than this: not tonight)
  T.MATE_PULL = 8;  // (of two taverns, the one with friends at it counts as this many tiles nearer)
  T.MIN = 0.03;     // (of the day: nobody sets out within this of one's own hour to go home)
  T.FOND = 15;      // (the fondness — G.Lacos afeto — that makes one a friend at the table)
  const ax = (v, k) => (G.Indole ? G.Indole.ax(v, k) : 50) / 99;
  const hasT = (v, k) => (v.traits || []).includes(k);
  T.lot = v => G.hash(Math.imul(v.id | 0, 131) + Math.imul(S_().day | 0, 7919) + 23);
  // (the hour of one's own from which a cup may be: who works, a little before the working day ends — 0,55 to 0,60: on a night
  // of the tavern the day's plain work is put down for it, as for the plaza (T.CUT), and one sits down with the strength the day
  // left, resting there (Vg.REST) into the night: the world's people are worn out by dark, and who went from the work at 0,6 and
  // the walk there was in bed by 0,7, L-1928 —; the old, the nobles and the merchants from the opening)
  T.hourOf = function (v, b) {
    const h = T.horas(b); const q = G.hash(Math.imul(v.id | 0, 37) + 19);
    return v.age >= 62 || v.grp === 'nobreza' || v.grp === 'mercadores' ? h.abre + 0.03 * q : Math.max(h.abre, T.WORK + (T.EVE - T.WORK) * q);
  };
  T.WORK = 0.55; T.EVE = 0.6; // (the hours of who works: from T.WORK, each at one's own, to the working day's end)
  T.CUT = 1.01;     // (the choice's weight before the working day ends: a plain task of the day — 1 — is put down for the tavern)
  // (the day's work one puts down for it: the plaza's own rule — no load in it, no operation, no post, no stone of the great work)
  const PLAIN = { chop: 1, farm: 1, gather: 1, shell: 1, fish: 1, estate: 1, pave: 1, drill: 1, build: 1 };
  const plainWork = (v, t) => !!t && !!PLAIN[t.type] && t.kind === 'work' && (t.pri || 0) <= 1 && !(t.type === 'build' && t.id === (S_().settlements.get(v.set) || {}).gw) && !(v.carry && v.carry.n > EPS);
  T.priOf = (v, cur) => (S_().time < T.EVE && plainWork(v, cur) ? T.CUT : T.PRI);
  // (the hour to go home: one's bed time — the clock of each one, act-lar.js — and a night out of one's own, never past the closing)
  T.leaveOf = function (v, b) {
    const h = T.horas(b); const c = G.Lar ? G.Lar.clock(v) : { bed: 0.8 }; const bed = c.bed < 0.4 ? c.bed + 1 : c.bed;
    return Math.min(h.fecha - 0.004, bed + 0.01 + 0.045 * G.hash(Math.imul(v.id | 0, 53) + 29));
  };
  // (what one feels for another at the tables: the fondness, the partner's more — G.Lacos, pure)
  function fond(v, o) {
    if (!o || o === v) return 0; const L = G.Lacos; const s = L ? L.sente(v, o) : null;
    const f = s ? s.afeto : v.partner === o.id ? 60 : 0; return f >= T.FOND ? f + (v.partner === o.id ? 30 : 0) : 0;
  }
  T.fond = fond;
  // (who is at each tavern's tables tonight and who is on the way there: counted once a step of the world; asked from outside it,
  // counted afresh and not kept)
  let gIdx = null, gS = null, gT = -1;
  G.worldHooks.push(() => { gIdx = null; gS = null; gT = -1; });
  const NOBODY = { at: [], coming: 0, way: [] };
  function goers(bid) {
    const S = S_(); if (!(G.inSim && gIdx && gS === S && gT === S.clock)) {
      const m = new Map(); for (const v of S.villagers.values()) { const t = v.task; if (!t || t.type !== 'tavern') continue; let e = m.get(t.id); if (!e) m.set(t.id, e = { at: [], coming: 0, way: [] }); if (t.st >= 1) e.at.push(v); else { e.coming++; e.way.push(v); } }
      if (!G.inSim) return m.get(bid) || NOBODY;
      gIdx = m; gS = S; gT = S.clock;
    }
    return gIdx.get(bid) || NOBODY;
  }
  // (the friends of this one at a tavern tonight — at its tables or on the way)
  T.mates = function (v, b) { const g = goers(b.id); let n = 0; for (const o of g.at) if (fond(v, o)) n++; for (const o of g.way) if (fond(v, o)) n++; return n; };
  const babyOf = v => (v.kids || []).some(id => { const k = S_().villagers.get(id); return k && k.age < 2; });
  // the share of the nights this person wants a cup at this tavern, as things are now — 0 to 1
  T.wish = function (v, b) {
    let p = T.BASE + T.EXT * ax(v, 'ext');
    if (hasT(v, 'Sociável')) p += T.SOCIAL; if (hasT(v, 'Devoto')) p -= T.DEVOUT;
    if (v.mourn > 0) p += T.MOURN; if (G.Harbor && G.Harbor.shoreLeave && G.Harbor.shoreLeave(v)) p += T.SHORE;
    if (T.mates(v, b)) p += T.FRIEND;
    if (v.age >= 62) p *= T.ELDER; if (babyOf(v)) p *= T.BABY;
    const hm = v.home && S_().buildings.get(v.home); const far = hm ? G.dist(hm.x + hm.w / 2, hm.y + hm.h / 2, b.x + b.w / 2, b.y + b.h / 2) : 0;
    if (far > T.NEAR) p *= Math.max(T.FLOOR, 1 - (far - T.NEAR) / T.SPAN);
    if (!T.menu(b).some(x => x.k !== 'food') && !(v.hunger > 40)) p *= T.DRY; // (nothing to drink: only the hungry, for the plate)
    return Math.max(0, Math.min(1, p));
  };
  // (the keeper of a tavern is no guest of one: his evening is his counter)
  const keeps = v => v.role === 'taverneiro' && !!v.job && !!S_().buildings.get(v.job) && S_().buildings.get(v.job).type === 'taverna';
  // the keeper at his post (D-763): from a little before his tavern opens to its closing, its day not ended — the counter is his
  // evening, before the plaza, the theatre, the way home and the evening at home (decide weighs his work so: villagers.js). Before,
  // his work weighed as anyone's evening work, and the keepers of the ready metropolis were at the theatre, at supper or at home
  // while their guests waited at the tables, and left unserved: L-1929
  T.ONDUTY = 0.02; // (of the day before the opening: to the counter)
  T.onDuty = function (v) {
    if (!keeps(v) || A.isBody(v)) return false; const b = S_().buildings.get(v.job); if (!b.built) return false;
    const h = T.horas(b); const t = S_().time; if (t < h.abre - T.ONDUTY || t >= h.fecha) return false;
    const op = T.dia(b); return !!op || !openedToday(b);
  };
  // the tavern this person would go to now, by the wish — or none: it only reads
  T.pick = function (v) {
    const S = S_(); if (v.captive || v.age < 16 || (v.carry && v.carry.n > EPS)) return null;
    // (the tavern of one's own streets: the way there from where one is, and half the way from it home after — of two in
    // reach, the one by home, not the one by the workplace across the town: the nights of a quarter are its residents',
    // Bairros Vivos, D-157. A sailor ashore today drinks where he landed: the tavern of the port, D-155. The one with friends
    // at it, nearer by T.MATE_PULL)
    const hm = v.home && S.buildings.get(v.home); const hw = hm && !(G.Harbor && G.Harbor.shoreLeave && G.Harbor.shoreLeave(v)) ? T.HOME : 0;
    let best = null, bd = 1e9, lot = -1; const body = A.isBody(v);
    for (const b of E.byType(v.set, 'taverna')) {
      const op = T.dia(b); if (!op || !T.aberta(b)) continue;
      if (coin(b) && E.purse(v) + EPS < T.PRICE.drink) continue;
      const dr = G.Vg.door(b); const d0 = G.dist(v.x, v.y, dr[0], dr[1]); if (d0 >= T.REACH || (!body && v.energy < T.SPENT + 2 + T.WALK_E * d0)) continue;
      // (the evening's own hours and the night's lot, of the people of the world; the god's body goes when the player says)
      if (!body) {
        if (S.time < T.hourOf(v, b) - EPS || S.time > T.leaveOf(v, b) - T.MIN) continue;
        if (lot < 0) lot = T.lot(v);
        if (lot >= T.wish(v, b)) continue;
      }
      if (T.room(b) < 1) continue;
      const d = d0 + (hw ? hw * G.dist(hm.x, hm.y, b.x, b.y) : 0) - (T.mates(v, b) ? T.MATE_PULL : 0); if (d >= bd) continue;
      if (!G.W.reaches(v, dr[0], dr[1])) continue;
      best = b; bd = d;
    }
    return best;
  };
  // how much this grown one wants the tavern now (a choice of decide), or 0 — one on the way or at the table stays (T.IN)
  T.urge = function (v, cur) {
    if (cur && cur.type === 'tavern') return T.IN;
    const S = S_();
    if (cur && (cur.pri || 0) >= T.PRI && !(S.time < T.EVE && plainWork(v, cur))) return 0; // (an errand under way that weighs as much: the cup waits — a plain task of the day before its end is put down)
    if (v.tavDay === S.day || v.age < 16 || v.captive || v.jail || v.aboard || v.ug || v.held || v.air || (v.carry && v.carry.n > EPS)) return 0;
    if (v.energy < T.SPENT || v.hunger > 85 || A.isBody(v) || keeps(v)) return 0;
    if (!E.byType(v.set, 'taverna').length) return 0;
    if (G.Vg.handsBusy(v) || (G.Lar && (G.Lar.bedrest(v) || G.Lar.minder(v)))) return 0;
    return T.pick(v) ? T.GO : 0;
  };
  // (one the tavern keeps: on the way there before one's hour to go home, at the table in its hours — with the strength for it)
  T.stays = function (v, cur) {
    if (!cur || cur.type !== 'tavern' || !(v.energy > 20)) return false;
    const b = S_().buildings.get(cur.id); if (!b) return false;
    return cur.st >= 1 ? inHours(b) : S_().time < T.leaveOf(v, b);
  };
  T.visitTask = function (v, H) {
    const best = T.pick(v); if (!best) return null;
    callKeeper(best, T.dia(best)); // (one coming: the keeper to the counter)
    const t = H.setTask(v, { type: 'tavern', id: best.id, op: T.dia(best).id, pri: 0.5, st: 0 });
    if (t && G.inSim && gIdx && gS === S_() && gT === S_().clock) { let e = gIdx.get(best.id); if (!e) gIdx.set(best.id, e = { at: [], coming: 0, way: [] }); e.coming++; e.way.push(v); }
    return t;
  };

  // ------------------------------ the day opens and closes ------------------------------
  // (once a day: at its opening hour, with its keeper at hand and something to serve; a day that could not open — the
  // shelf empty — opens later the same day once the keeper has bought; a day ended is not opened again)
  // (a day cut short — its keeper away, the tavern fallen — may open again the same day; one that closed is closed)
  const openedToday = b => A.all().some(op => op.def === 'taverna' && op.at === b.id && op.data && op.data.day === S_().day && (live(op) || op.st === 'ok'));
  function open(b) {
    const S = S_(); const k = keeperOf(b); if (!k || !atHand(k) || !G.inSim || T.dia(b) || openedToday(b) || !inHours(b)) return null;
    if (!T.menu(b).length) return null;
    // (the day's book: served, takings, what the keeper paid for the stock — «gasto»: a house's .custo is what it cost its
    // family, L-236, and only act-casa.js and social.js write it —, wants, refusals; and the night's music: the sets played, who
    // played them, the musician of the moment, when the next set may be)
    const op = A.start('taverna', { at: b.id, set: b.set, fac: G.Village.facOfSet(b.set), to: 'b:' + b.id, why: 'dia', by: k.id, x: b.x + b.w / 2, y: b.y + b.h / 2,
      data: { day: S.day, servidos: 0, receita: 0, gasto: 0, vendas: {}, faltas: 0, recusas: 0, cheia: 0, mesa: {}, fila: [], q: 0, sets: 0, musicos: [], mus: 0, musT: 0, mesas: 0 } });
    if (op) A.join(op, k, 'dono');
    return op;
  }
  T.open = b => (G.inSim ? open(b) : null);
  function close(op, st, why) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data;
    // (the ones still at the tables at the closing drank together: a tie between each two — G.Lacos.ato, 22b D-575)
    if (G.Lacos) { const ids = Object.keys(d.mesa); for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { const a = S.villagers.get(+ids[i]), c = S.villagers.get(+ids[j]); if (a && c) G.Lacos.ato(a, c, 'mesa'); } }
    // everyone out: what is still in the hands is finished in a hurry, and the last ones get up and walk out by the door (D-765)
    for (const id of Object.keys(d.mesa)) { const v = S.villagers.get(+id); if (!v) continue; finishCup(v, op); if (v.task && v.task.type === 'tavern' && v.task.op === op.id) G.Vg.endTask(v, { walk: 1 }); }
    d.mesa = {}; d.fila = []; d.mus = 0;
    // (the cups the keeper was carrying go back to the shelf)
    for (const v of S.villagers.values()) if (v.carry && v.carry.op === op.id && v.carry.n > EPS && b) D.move('v:' + v.id, 'b:' + b.id, v.carry.k, v.carry.n, { op: op.id, code: 'taverna-volta', by: v.id, part: true });
    const k = b && keeperOf(b);
    if (k && st === 'ok' && d.servidos >= 3) A.note(k, 'memory', `Um dia na taverna: ${d.servidos} servidos${coin(b) ? `, ${String(r2(d.receita)).replace('.', ',')} de receita e ${String(r2(d.gasto)).replace('.', ',')} de custo` : ''}${d.faltas ? `; faltou o que pediam ${d.faltas} ${d.faltas > 1 ? 'vezes' : 'vez'}` : ''}${d.sets ? `; ${d.sets === 1 ? 'uma música' : d.sets + ' músicas'} no estrado` : ''}.`);
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
    if (m.corpo) return A.isBody(v) && v.inside === op.at; // (the body at a table of its own seat, or at the counter: D-767)
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
    // (the god's body at the tables: its entry, D-767)
    corpoTick(op, b);
    // whoever left by another door (another errand, taken away, dead) is no longer at the tables
    for (const id of Object.keys(d.mesa)) { const v = S.villagers.get(+id); if (!v || !atTable(v, op)) { if (v) finishCup(v, op); delete d.mesa[id]; } }
    if (d.fila.some(id => !d.mesa[id])) d.fila = d.fila.filter(id => d.mesa[id]);
    if (d.mus && !(d.mesa[d.mus] && d.mesa[d.mus].st === 6)) d.mus = 0;
    // (the most at the tables at once, for the day's book)
    const n = Object.keys(d.mesa).length; if (n > (d.mesas || 0)) d.mesas = n;
    // a cup set down where someone fell is spilt
    for (const o of (S.loose || []).slice()) if (o.op === op.id) D.use('g:' + o.id, o.k, o.n, { op: op.id, code: 'derramou' });
  }

  // ------------------------------ a round: served, paid, drunk ------------------------------
  // the hand that gives a customer at a table what was asked (or the other thing on the shelf) — from the shelf (self: the customer
  // at the counter, the keeper away; the god's body that keeps the tavern) or from the server's own hands, the cup he brought to the
  // table (from: 'v:…', D-763) —, the price from the customer's house to the keeper's — both or neither, once (the key of the
  // round). → { ok, k, n | why }
  // (self: nobody to say «aqui está»)
  // (of0, dish0: the god's body's order — the part of the food asked, from the shelf at the counter, and the dish's own name, D-768)
  function serve(op, v, c, self, from0, k0, of0, dish0) {
    const S = S_(); const b = S.buildings.get(op.at); const d = op.data; const m = d.mesa[c.id];
    if (!b || !m) return { ok: false, why: 'Não está mais na mesa.' };
    if (c.carry && c.carry.n > EPS) return { ok: false, why: 'Está com as mãos ocupadas.' };
    const src = from0 || 'b:' + b.id;
    const item = from0 ? brought(b, k0) : pickItem(b, m); if (item && dish0) item.dish = dish0;
    if (!item) { d.faltas++; say(v, 'acabou', { bem: m.want === 'food' ? 'a comida' : 'a bebida' }); m.out = 1; return { ok: false, why: 'Acabou.' }; }
    const key = 'tv:' + op.id + ':' + d.q;
    const from = coin(b) ? E.coinRef(c) : null;
    if (from && D.get(from, 'moedas') + EPS < item.p) { d.recusas++; say(c, 'sem_dinheiro', {}); m.out = 2; return { ok: false, why: 'Sem dinheiro para pagar.' }; }
    // who cannot hold a cup (both arms lost) is given to eat and to drink by the hand that serves (D-152, L-693): the cup goes
    // from the shelf to the server's hand — the same round in the book, paid the same — and from that hand to the mouth, there
    // and then; nobody is served so at a counter with no keeper. Before, the cup never fitted the customer's hands: the customer
    // waited, left unserved, and came back every night
    const fed = D.strength(c) <= 0;
    if (fed && self) return { ok: false, why: 'Não consegue se servir.' };
    let r;
    if (fed && from0) {
      // (the cup already in the server's hand: from it to the mouth — the round in the book as any — and the price)
      r = D.use(src, item.k, item.n, { op: op.id, code: 'taverna', by: c.id, mine: true, key });
      if (r.ok && from) D.move(from, payeeOf(b), 'moedas', item.p, { op: op.id, code: 'taverna', by: v.id, key: key + ':p' });
    } else {
      const to = 'v:' + (fed ? v.id : c.id);
      const of = of0 || undefined;
      r = from ? D.swap([src, to, item.k, item.n], [from, payeeOf(b), 'moedas', item.p], { op: op.id, code: 'taverna', by: v.id, key, of })
        : D.move(src, to, item.k, item.n, { op: op.id, code: 'taverna', by: v.id, key, of });
      if (r.ok && fed) D.use(to, item.k, item.n, { op: op.id, code: item.k === 'food' ? 'refeicao' : 'bebida', by: c.id, mine: true, key: key + ':boca' });
    }
    if (!r.ok) return { ok: false, why: r.why || 'Não deu.' };
    d.q++; d.servidos++; d.vendas[item.k] = r2((d.vendas[item.k] || 0) + item.n); if (from) d.receita = r2(d.receita + item.p);
    if (G.Urban) G.Urban.noteB(b, 'noite', 1); // (the life of the quarter: a round served)
    m.st = fed ? 4 : 3; m.k = item.k; m.cup = r1(S.clock); if (fed) taste(c, item.k, b);
    d.fila = d.fila.filter(id => id !== c.id);
    if (!self) say(v, 'servir_taverna', { bem: item.dish || T.nome(item.k, b) });
    if (c.task && c.task.type === 'tavern' && c.task.op === op.id) { c.task.st = m.st; c.actT = 0; }
    return { ok: true, k: item.k, n: item.n, p: from ? item.p : 0 };
  }
  T.serve = (op, v, c) => (G.inSim && op && live(op) ? serve(op, v, c) : { ok: false, why: '' });
  // (what was asked, of the shelf's — or the other thing on it on the first round)
  function pickItem(b, m) {
    const menu = T.menu(b); const asked = m.want === 'food' ? menu.find(x => x.k === 'food') : menu.find(x => x.k !== 'food');
    return asked || (m.r === 0 ? menu[0] : null); // (on the first round one takes what there is; later, only what one wants)
  }
  // (what the server brought in his hands: a round of it)
  function brought(b, k) { return k === 'food' ? { k: 'food', n: 1, p: T.PRICE.food, dish: T.dish(b) } : k && T.DOSE[k] ? { k, n: T.DOSE[k], p: T.PRICE.drink } : null; }
  const r1 = x => Math.round(x * 10) / 10;
  // what was served, eaten or drunk (in the ledger: the meal, the round) — and what it does to one
  function finishCup(v, op) {
    const c = v.carry; if (!c || c.op !== op.id || !(c.n > EPS)) return null;
    // (not the server's: the cups carried to the tables are the shelf's until they are handed over)
    if (v.task && v.task.type === 'atender' && v.task.op === op.id) return null;
    const k = c.k; const r = D.use('v:' + v.id, k, c.n, { op: op.id, code: k === 'food' ? 'refeicao' : 'bebida', by: v.id, mine: true });
    if (!r.ok) return null;
    taste(v, k, S_().buildings.get(op.at)); return k;
  }
  // what a meal or a round does to one (from one's own cup, or from the server's hand)
  function taste(v, k, b) {
    const S = S_();
    if (k === 'food') { v.hunger = Math.max(0, v.hunger - 35); return; }
    // the second round makes one tipsy, the third drunk for a long while (tavern.js counts the morning after)
    v.drinks = (v.drinks || 0) + 1; v.drinkDay = S.day;
    if (b) b.served = (b.served || 0) + 1;
    const heavy = (v.traits || []).includes('Glutão') || (v.traits || []).includes('Sociável');
    if (v.drinks >= 2 || (heavy && G.R() < 0.35)) v.drunk = Math.max(v.drunk || 0, S.clock + 30 + v.drinks * 22);
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
  // (time to go home: the person's own hour — the bed time and a night out, T.leaveOf —; past the closing, or before the dawn)
  T.sleepy = v => { const t = v.task; const b = t && t.type === 'tavern' ? S_().buildings.get(t.id) : null; const s = S_().time; return s < 0.2 || (b ? s >= T.leaveOf(v, b) : s > 0.88); };
  const sleepy = v => T.sleepy(v);

  // ------------------------------ the customer (the errand 'tavern') ------------------------------
  // st 0 on the way to the door; 1 walking in, from the door to the seat; 2 at the table, waiting to be served (in the queue);
  // 3 with what was served in the hands — the cup lasts, sips and talk —; 4 given to eat or to drink by the server's hand;
  // 5 at the table between rounds, talking; 6 at the stage, playing (the musician of the night)
  T.HOME = 0.5; // (how much the way home weighs in the choice of a tavern)
  T.CUP = 14;   // (seconds of the world a cup lasts, at the least — and up to T.CUPX more, by the person: sips, and the talk between)
  T.CUPX = 8;
  T.MEAL = 8;   // (seconds over a plate)
  T.TALK = 14;  // (seconds at the table between one round and the asking for another, and between two looks at whether to stay)
  T.SELF = 12;  // (nobody at the counter this long: one serves oneself there)
  T.WAIT = 45;  // (waited this long for a round: one leaves unserved)
  const cupOf = v => T.CUP + T.CUPX * G.hash(Math.imul(v.id | 0, 61) + 41);
  // (at the table with someone to talk to: one at the same table — In.groupOf of the seats —, or a friend anywhere in the room)
  function company(v, b, op) {
    const d = op.data; const m = d.mesa[v.id]; if (!m) return false;
    for (const id in d.mesa) { if (+id === v.id) continue; const o = d.mesa[id]; if (o.st < 2) continue; if (m.g && o.g === m.g) return true; if (fond(v, S_().villagers.get(+id))) return true; }
    return false;
  }
  // the seat of one coming in (D-761): of the free ones, at the table where one's friends sit — the more one likes them, the
  // likelier —; else at a table where nobody sits yet (one's company may come); else any. Pure: the interiors give the list
  function seatFor(v, b, op, list) {
    const S = S_(); const d = op.data; const score = new Map(), taken = new Set();
    for (const id in d.mesa) { const m = d.mesa[id]; if (!m.g) continue; const g = m.g; taken.add(g); const f = fond(v, S.villagers.get(+id)); if (f) score.set(g, (score.get(g) || 0) + f); }
    let best = null, bs = -1;
    for (const p of list) { const s = score.get(p.grp) || 0; const k = s > 0 ? 1000 + s : !taken.has(p.grp) ? 10 : 1; if (k > bs) { bs = k; best = p; } }
    return best;
  }
  T.seatFor = (v, b, list) => { const op = T.dia(b); return op ? seatFor(v, b, op, list) : null; };
  function walkB(v, t, b, dt, H) {
    // (to the door itself: one is in only from it — the way that ended across the street is the way again, twice: L-1927)
    const key = 'b' + b.id; const dr = G.Vg.door(b);
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, dr[0], dr[1], false) && !H.goto(v, dr[0], dr[1], true)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; if (G.dist(v.x, v.y, dr[0], dr[1]) < T.AT_DOOR) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  T.AT_DOOR = 0.75; // (tiles from the door's own point: at it — the walk in from there is the interiors', In.walkIn)
  function leave(v, t, op, H) {
    // (whoever leaves the table drank with the ones still at it: a tie with each — G.Lacos.ato, 22b D-575)
    if (op && op.data && op.data.mesa[v.id] && G.Lacos) for (const id of Object.keys(op.data.mesa)) { const o = S_().villagers.get(+id); if (o && o !== v) G.Lacos.ato(v, o, 'mesa'); }
    if (op && op.data && op.data.mesa[v.id]) { finishCup(v, op); delete op.data.mesa[v.id]; op.data.fila = op.data.fila.filter(id => id !== v.id); if (op.data.mus === v.id) op.data.mus = 0; }
    return H.end(v); // (up from the seat and out by the door, walking: D-765)
  }
  function order(v, t, b, op) { const S = S_(); const d = op.data; const m = d.mesa[v.id]; m.want = want(v, b); m.st = 2; if (!d.fila.includes(v.id)) d.fila.push(v.id); t.st = 2; t.wt = 0; v.actT = 0; m.nx = r1(S.clock + T.TALK); callKeeper(b, op); }
  function runFregues(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op)) return leave(v, t, op, H);
    const d = op.data;
    if (t.st === 0) {
      if (!T.aberta(b)) return H.end(v);
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r === 0) return;
      if (full(b, op)) { d.cheia++; G.Vg.emote(v, 'sad', 1); say(keeperOf(b), 'cheia', {}); return H.end(v); }
      // (a seat at the friends' table, kept for one while one is at the tavern — In.hold —; in by the door, and the walk to it)
      const In = G.Interiors; const pl = In && In.hold ? In.hold(v, b, SEAT_USES, L => seatFor(v, b, op, L), 1) : null;
      // (the last seat taken in this same moment by one who came in first: full after all — nobody sits in the air, nor stands)
      if (!pl && In && In.table && In.table(b)) { d.cheia++; G.Vg.emote(v, 'sad', 1); return H.end(v); }
      t.use = pl ? pl.use : 'sentar'; G.Vg.enter(v, b, t); v.tavDay = S.day;
      // (the step's counts know it at once: one seat fewer, one fewer on the way)
      if (rIdx && rS === S && rT === S.clock && rIdx.has(b.id)) rIdx.set(b.id, rIdx.get(b.id) - 1);
      if (gIdx && gS === S && gT === S.clock && gIdx.has(b.id)) { const e = gIdx.get(b.id); e.coming = Math.max(0, e.coming - 1); e.way = e.way.filter(o => o !== v); e.at.push(v); }
      d.mesa[v.id] = { t: r1(S.clock), r: 0, want: want(v, b), st: 1, it: pl ? pl.item : 0, q: pl ? pl.q : -1, g: pl && In.groupOf ? In.groupOf(b, pl.item) : 0, nx: 0, cup: 0 };
      t.st = 1; v.actT = 0; return;
    }
    const m = d.mesa[v.id]; if (!m) return leave(v, t, op, H);
    if (t.st === 1) { // walking from the door to the seat
      if (G.Vg.entering(v)) { v.act = ''; return; }
      say(v, 'pedir_taverna', { bem: m.want === 'food' ? T.dish(b) : T.nome(drinkOn(b) || 'cerveja') });
      return order(v, t, b, op);
    }
    if (sleepy(v) || !inHours(b)) return leave(v, t, op, H);
    if (t.st === 6) return playing(v, t, b, op, dt, H);
    if (t.st === 7 || t.st === 8) return selfServe(v, t, b, op, dt, H);
    const talk = company(v, b, op); const sit = talk ? 'sittalk' : 'sit';
    // (nothing for one — the shelf out of what was asked, no coin for it —: with company at the table one stays for the talk, the
    // round of the others, till one's hour; alone, home)
    if (m.out) { if (!talk || m.out === 2) return leave(v, t, op, H); m.out = 0; d.fila = d.fila.filter(q => q !== v.id); t.st = 5; m.st = 5; m.nx = r1(S.clock + T.TALK); m.dry = 1; }
    if (t.st === 2) { // at the table, waiting to be served
      if (v.carry && v.carry.op === op.id) { t.st = 3; v.actT = 0; m.st = 3; m.cup = r1(S.clock); return; }
      v.act = sit; t.pose = talk ? 'sittalk' : undefined; t.wt = (t.wt || 0) + dt;
      // (nobody at the counter for a while — the keeper away —: one gets up, walks to the counter, serves oneself there and pays
      // as to the keeper, and walks back to one's seat, kept — L-1930; a tavern with no buyer's place at its counter, at the table)
      if (t.wt > T.SELF && !serving(b, op) && !m.vem) {
        const In = G.Interiors; const seat = In && In.placeOf ? In.placeOf(v) : null; m.use = t.use; t.use = 'comprar'; const ctr = seat ? In.placeOf(v) : null;
        if (ctr && ctr.use === 'comprar') { const w = In.walkBetween(b, seat, ctr); t.st = 7; t.ww = r1(S.clock + (Number.isFinite(w) ? w / G.Vg.walkMS(v) : 0)); v.actT = 0; return; }
        t.use = m.use; const r = serve(op, v, v, true); t.wt = r.ok ? 0 : t.wt; if (r.ok) return;
      }
      if (t.wt > T.WAIT) { d.recusas++; say(v, 'sem_servico', {}); return leave(v, t, op, H); }
      life(v, t, b, op, dt); return;
    }
    if (t.st === 3) { // eating or drinking what was served: the cup lasts — the sips, and the talk between them
      const c = v.carry; if (!c || c.op !== op.id) { t.st = 5; m.st = 5; m.nx = r1(S.clock + T.TALK); return; }
      const a = S.clock - (m.cup || S.clock); const food = c.k === 'food'; const dur = food ? T.MEAL : cupOf(v); const sip = AN.beber.dur;
      // (the first draught as the cup comes, one at its middle, the last at its end; the talk of the table between)
      const drinking = food || a < sip || (a >= dur / 2 && a < dur / 2 + sip * 0.5) || a >= dur - sip * 0.5;
      v.act = drinking ? (food ? AN.comerMesa.act : AN.beber.act) : sit; t.pose = food ? 'eat' : talk ? 'sittalk' : undefined; // (the plate on the table, the hand from it to the mouth: D-769)
      life(v, t, b, op, dt);
      if (a < dur) return;
      finishCup(v, op); m.r++;
      if (S.time < T.leaveOf(v, b) - T.MIN && again(v, b, m)) return order(v, t, b, op);
      t.st = 5; m.st = 5; m.nx = r1(S.clock + T.TALK); v.actT = 0; return;
    }
    if (t.st === 4) { // given to eat or to drink by the server's hand (D-152): the same while at the table, nothing in the hands
      v.act = 'sit'; t.pose = m.k === 'food' ? 'eat' : undefined;
      life(v, t, b, op, dt);
      if (S.clock - (m.cup || S.clock) < (m.k === 'food' ? T.MEAL : cupOf(v))) return;
      m.r++;
      if (S.time < T.leaveOf(v, b) - T.MIN && again(v, b, m)) return order(v, t, b, op);
      t.st = 5; m.st = 5; m.nx = r1(S.clock + T.TALK); return;
    }
    if (t.st === 5) { // at the table between rounds: the talk; now and then, another round — or home, with nobody to talk to
      v.act = sit; t.pose = talk ? 'sittalk' : undefined;
      life(v, t, b, op, dt);
      if (S.clock < (m.nx || 0)) return;
      m.nx = r1(S.clock + T.TALK);
      if (S.time < T.leaveOf(v, b) - T.MIN && again(v, b, m)) return order(v, t, b, op);
      if (!talk) return leave(v, t, op, H);
      return;
    }
    return leave(v, t, op, H);
  }
  // the evening inside: a song at the stage at the musician's own hour, and now and then a fight between two who drank too much
  // (court.js had them at the door; here they happen among the people at the tables)
  const brawls = new Map(); G.worldHooks.push(() => brawls.clear());
  T.brawling = v => brawls.has(v.id);
  // the musician of the night (D-764): of who sits at the tables between rounds, the most outgoing and open of those who play —
  // the índole's ext and abe, or the sociable —, at an hour of their own after the room has three, goes up to the stage — the
  // musician's place of the plan, 'tocar' — and plays a set of T.SET seconds on the people's instrument (G.Inv's kit gives it: the
  // lyre, the drum, of what the people had), rests T.REST, plays again while the night lasts. The bard, the trade, is its own patch
  T.SET = 12; T.REST = 14;
  T.MUSE = 1.1; // (ext + abe, of 2: who plays)
  const muse = v => ax(v, 'ext') + ax(v, 'abe') + (hasT(v, 'Sociável') ? 0.25 : 0);
  T.musHour = v => 0.62 + 0.08 * G.hash(Math.imul(v.id | 0, 71) + 47);
  function life(v, t, b, op, dt) {
    const S = S_(); const d = op.data; const night = G.isNight() || G.isEvening();
    if (night && !d.mus && S.clock >= (d.musT || 0) && t.st === 5) {
      // (once a look of the musician's own seat: the room of three or more, and the best of who would play there now)
      let n = 0, best = null, bs = T.MUSE;
      for (const id of Object.keys(d.mesa)) { const m = d.mesa[id]; if (m.body) continue; n++; const o = S.villagers.get(+id); if (!o || m.st !== 5 || !o.task || o.task.type !== 'tavern' || S.time < T.musHour(o)) continue; const s = muse(o); if (s > bs) { bs = s; best = o; } }
      if (n >= 3 && best === v) startSet(v, t, b, op);
      else if (n >= 3 && !best) d.musT = r1(S.clock + T.TALK);
    }
    const br = brawls.get(v.id);
    if (br) {
      const o = S.villagers.get(br.with);
      if (!o || br.t < S.clock) { brawls.delete(v.id); return; }
      // (with the fists, not a weapon: the shove and the blow of two at a table — the kit puts the sword in the hand of «fight», P7)
      v.act = 'shove'; G.faceTo(v, o.x - v.x, o.y - v.y);
      if (G.R() < dt * 1.5) { if (o.hp > 25) G.Vg.damage(o, 2, 'brawl'); o.stagT = S.clock + 0.3; G.Audio && G.Audio.at(v.x, v.y, 'hit'); }
      return;
    }
    // (a fight has a cause: how quarrelsome the drunk one is, and whom of the drunk at the tables he dislikes — G.Convivio, 22b D-581)
    const cv = G.Convivio;
    if (v.drunk > S.clock && night && G.R() < dt * 0.006 * (cv ? cv.briga(v) : 1) && v.age >= 18) {
      let o = null;
      if (cv) o = cv.rival(v, Object.keys(op.data.mesa).filter(id => !brawls.has(+id) && !op.data.mesa[id].body));
      else for (const id of Object.keys(op.data.mesa)) { const q = S.villagers.get(+id); if (q && q !== v && q.drunk > S.clock && !brawls.has(q.id) && !op.data.mesa[id].body) { o = q; break; } }
      if (o) {
        const until = S.clock + G.rr(4, 7); brawls.set(v.id, { with: o.id, t: until }); brawls.set(o.id, { with: v.id, t: until });
        if (cv && cv.brigou(v, o)) { brawls.delete(v.id); brawls.delete(o.id); }
        if (G.Urban) G.Urban.noteB(b, 'crime', 1); // (the life of the quarter: a brawl)
        G.Vg.emote(v, 'angry', 3); G.Vg.emote(o, 'angry', 3);
        const set = S.settlements.get(b.set);
        if (G.R() < 0.35 || !(set && set._brawl)) { if (set) set._brawl = S.day; G.Village.log(G.pick([`Briga na taverna de ${set ? set.name : ''}: ${v.name} e ${o.name} beberam demais e saíram no braço.`, `${v.name} acusou ${o.name} de roubar no jogo de dados. A taverna de ${set ? set.name : ''} virou ringue.`, `Uma jarra voou na taverna de ${set ? set.name : ''}: ${v.name} e ${o.name}, bêbados, foram separados à força.`]), 'war', b.x, b.y); }
      }
    }
  }
  // (at the counter for one's own round, the keeper away: the walk there, the round taken from the shelf and paid, the walk back to
  // the seat — st 7 there, 8 back)
  function selfServe(v, t, b, op, dt, H) {
    const S = S_(); const d = op.data; const m = d.mesa[v.id]; const In = G.Interiors;
    if (S.clock < (t.ww || 0)) { v.act = ''; return; }
    if (t.st === 7) {
      v.act = AN.servir.act; if (v.actT < AN.servir.contact) return;
      const r = serve(op, v, v, true); const ctr = In.placeOf(v); t.use = m.use || 'sentar'; const seat = In.placeOf(v);
      const w = ctr && seat && In.walkBetween ? In.walkBetween(b, ctr, seat) : 0;
      t.st = 8; m.st = r.ok ? 3 : 2; t.wt = 0; t.ww = r1(S.clock + (Number.isFinite(w) ? w / G.Vg.walkMS(v) : 0)); v.actT = 0; return;
    }
    // (back at the seat: with the cup, the round; without, waiting again — or home, the shelf out of it)
    if (v.carry && v.carry.op === op.id) { t.st = 3; m.st = 3; m.cup = r1(S.clock); v.actT = 0; return; }
    t.st = m.st === 5 ? 5 : 2; v.actT = 0; if (t.st === 2 && !d.fila.includes(v.id) && !m.out) d.fila.push(v.id);
  }
  // (up to the stage: the seat kept, the walk there — the musician's place of the plan; with none, the song at the table —, the set)
  function startSet(v, t, b, op) {
    const S = S_(); const d = op.data; const In = G.Interiors;
    const seat = In && In.placeOf ? In.placeOf(v) : null; d.mesa[v.id].use = t.use;
    t.use = (In && In.table && In.table(b) && (In.table(b).byUse.get('tocar') || []).length) ? 'tocar' : 'sentar';
    const stage = t.use === 'tocar' && In.placeOf ? In.placeOf(v) : null;
    const mt = seat && stage && stage.use === 'tocar' && In.walkBetween ? In.walkBetween(b, seat, stage) : 0;
    if (t.use === 'tocar' && !(stage && stage.use === 'tocar')) t.use = d.mesa[v.id].use || 'sentar'; // (the stage taken: at the table)
    t.st = 6; d.mesa[v.id].st = 6; d.mus = v.id; d.sets++; if (!d.musicos.includes(v.id)) d.musicos.push(v.id);
    t.mw = r1(S.clock + (Number.isFinite(mt) ? mt / G.Vg.walkMS(v) : 0)); t.me = r1(t.mw + T.SET); v.actT = 0;
  }
  function playing(v, t, b, op, dt, H) {
    const S = S_(); const d = op.data; const m = d.mesa[v.id];
    if (S.clock < t.mw) { v.act = ''; return; } // (walking to the stage)
    v.act = AN.tocar.act; t.pose = undefined;
    if (G.VR() < dt * 0.8 && G.FX && G.FX.floater) G.FX.floater(v.x + G.vrr(-0.2, 0.3), v.y - 0.1, G.vpick(['♪', '♫']), '#ffe9a8', 1.6);
    if (S.clock < t.me && (G.isNight() || G.isEvening())) return;
    // (the set over: back to one's seat, and a rest before the next)
    t.use = m.use || 'sentar'; t.st = 5; m.st = 5; m.nx = r1(S.clock + T.TALK); d.mus = 0; d.musT = r1(S.clock + T.REST); v.actT = 0;
  }

  // ------------------------------ the keeper ------------------------------
  // a customer waiting: serve; the shelf low and nobody waiting: buy at the store; the vat; and the counter, open
  // (in: the keeper behind the counter already — the counter again is no going out and in, t.stay)
  T.task = function (v, b, f, H, inn) {
    const op = T.dia(b); const busy = !!op && op.st === 'on' && inHours(b); const stay = inn || v.inside === b.id ? b.id : undefined;
    if (busy && (op.data.fila.length || corpoNext(op.data))) return H.setTask(v, { type: 'atender', id: b.id, op: op.id, pri: 1.05, st: 0, stay }); // (and the god's body calling at a table: D-767)
    const need = restockPick(b, f, v); if (need) return H.setTask(v, { type: 'abastecer', id: b.id, k: need.k, n: need.n, of: need.of || undefined, pri: 1, st: 0 });
    const brew = O.task(v, b, f, H); if (brew) return brew;
    if (busy) return H.setTask(v, { type: 'atender', id: b.id, op: op.id, pri: 1, st: 0, idle: 1, stay });
    return null;
  };
  // what the shelf lacks that the store has and the keeper can pay for: the day's meals and the grain of the vat; the people's
  // drink where it is not brewed (the wine, the mead)
  function restockPick(b, f, v) {
    if (v.carry && v.carry.n > EPS) return null;
    const ref = 'b:' + b.id; const d = drinkOf(f); const bw = brewOf(f, b); const brews = bw === 'cerveja';
    const cands = [];
    const food = D.get(ref, 'food'); const want = 6 + (brews ? 4 : 0);
    // (with the vat's beer to brew and too little grain on the shelf, the food bought is grain — what the store has of it, 20h)
    const grain = brews && OR() && OR().amount(ref, 'food', OR().CEREAL) < 4 && OR().free('f:' + f.id, 'food', OR().CEREAL) >= 1 ? OR().CEREAL : null;
    if (food < want - 1 && (f.stock.food || 0) >= 16) cands.push({ k: 'food', n: want - food, of: grain });
    if (bw === 'pulque' && D.get(ref, 'aguamiel') < 4 && D.free('f:' + f.id, 'aguamiel') >= 1) cands.push({ k: 'aguamiel', n: 4 - D.get(ref, 'aguamiel') });
    for (const k of [d.k, d.alt]) if (k && !BREW[k] && D.get(ref, k) < T.DOSE[k] * 4 && D.free('f:' + f.id, k) >= 1) { cands.push({ k, n: 2 }); break; }
    for (const c of cands) {
      const n = Math.floor(Math.min(c.n, c.of ? OR().free('f:' + f.id, c.k, c.of) : D.free('f:' + f.id, c.k), D.room('v:' + v.id, c.k, { to: ref }), D.room(ref, c.k)) + EPS);
      if (n < 1) continue;
      if (coin(b) && D.get(E.coinRef(v), 'moedas') + EPS < r2((E.PRICE[c.k] || 0.3) * n * WHOLE)) continue;
      return { k: c.k, n, of: c.of || null };
    }
    return null;
  }
  // the purchase at the store's door: the goods into the arms, marked for the tavern, and the coins from the keeper's house to
  // the treasury — both or neither; a people without coin: the store gives (the people's tavern)
  function buy(v, b, f, k, n, of) {
    const ref = 'b:' + b.id;
    n = Math.floor(Math.min(n, of && OR() ? OR().free('f:' + f.id, k, of) : D.free('f:' + f.id, k), D.room('v:' + v.id, k, { to: ref }), D.room(ref, k)) + EPS);
    if (n < 1) return { ok: false, why: D.free('f:' + f.id, k) < 1 ? 'O armazém não tem.' : 'Não cabe mais.' };
    let r, cost = 0;
    if (coin(b)) {
      cost = r2((E.PRICE[k] || 0.3) * n * WHOLE); const from = E.coinRef(v);
      if (D.get(from, 'moedas') + EPS < cost) return { ok: false, why: 'Falta dinheiro para comprar.' };
      r = D.swap(['f:' + f.id, 'v:' + v.id, k, n], [from, 'f:' + f.id, 'moedas', cost], { code: 'atacado', by: v.id, to: ref, of: of || undefined });
      if (r.ok) { E.ensure(f); f.eco.sales += cost; }
    } else r = D.move('f:' + f.id, 'v:' + v.id, k, n, { code: 'taverna-povo', by: v.id, to: ref, of: of || undefined });
    if (!r.ok) return r;
    const op = T.dia(b); if (op && cost) op.data.gasto = r2(op.data.gasto + cost);
    return { ok: true, n, cost };
  }
  function runAbastecer(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const f = G.Fac.ofV(v);
    if (!b || !b.built || b.type !== 'taverna' || !f) return H.end(v);
    if (t.st === 0) { const s = G.Village.nearestDropoff(v.x, v.y, v.set); if (!s) return H.end(v); const r = walkStore(v, t, s, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    v.act = AN.examinar.act; if (v.actT < AN.examinar.contact) return;
    const r = buy(v, b, f, t.k, t.n, t.of); if (!r.ok) return H.end(v);
    return H.setTask(v, { type: 'carga', to: 'b:' + b.id, pri: 1, st: 0 });
  }
  // (to a store's front, as the deliveries go)
  function walkStore(v, t, b, dt, H) {
    const key = 's' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  // the keeper at work (D-763): at the counter, the first one waiting — and whoever waits at the same table for the same thing,
  // up to T.TRAY —; the cups filled at the counter from the shelf into his hands (the shelf's still: «taverna-caneca», bound to
  // the shelf), the walk to the table (the plan's walk, In.walkBetween), each one's handed over there and paid there (the round
  // in the book, «taverna»), and the walk back — a cup whose drinker left goes back to the shelf. st 0 to the door, 1 at the
  // counter, 2 filling, 3 on the way to the table, 4 at the table, 5 on the way back
  T.TRAY = 4;
  const counterOf = (b, v) => { const In = G.Interiors; return In && In.placeOf ? In.placeOf(v) : null; };
  function runAtender(v, t, dt, H) {
    const S = S_(); const b = S.buildings.get(t.id); const op = t.op ? A.get(t.op) : null;
    if (!b || !b.built || !op || !live(op) || !inHours(b)) return backToShelf(v, b, op, H, true);
    const d = op.data;
    if (t.st === 0) {
      if (v.inside === b.id) { t.st = 1; v.actT = 0; t.wt = 0; t.use = 'vender'; return; } // (already behind the counter)
      const r = walkB(v, t, b, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; t.wt = 0; t.use = 'vender'; G.Vg.enter(v, b, t); } return;
    }
    if (G.Vg.entering(v) || S.clock < (t.ww || 0)) { v.act = ''; return; } // (walking: from the door, to a table, back)
    if (t.st === 1) {
      v.act = AN.servir.act;
      // (cups or a plate of this day in the hands, for nobody's round — a save in the middle of one —: back to the shelf first. With
      // them the next round's cups did not fit his hands, and every guest after was told «acabou» all night: L-1932)
      if (v.carry && v.carry.op === op.id && v.carry.n > EPS) D.move('v:' + v.id, 'b:' + b.id, v.carry.k, v.carry.n, { op: op.id, code: 'taverna-volta', by: v.id, part: true });
      // (the god's body at a table, calling — or its order nobody is fetching —: to it before the guests of the world, D-767)
      const cb = corpoNext(d);
      if (cb) {
        const m = cb.m; m.srv = v.id; t.corpo = cb.id; t.cust = null;
        if (m.cv === 'pedido') { t.k = m.pedido.k; t.of = m.pedido.of || null; t.n1 = t.k === 'food' ? 1 : T.DOSE[t.k] || 0.25; t.st = 12; v.actT = 0; return; }
        walkTo(v, t, b, cb.id); t.st = 10; return;
      }
      const id = d.fila.find(q => d.mesa[q] && d.mesa[q].st === 2 && !d.mesa[q].body);
      const body = !id && d.fila.find(q => d.mesa[q] && d.mesa[q].body);
      // (nobody waiting a while: the keeper's day goes on — the shelf, the vat, or the counter again, staying in: T.task)
      if (!id && !body) { t.wt = (t.wt || 0) + dt; if (t.wt > (t.idle ? 25 : 8)) { const f = G.Fac.ofV(v); if (!(f && T.task(v, b, f, H, true))) return H.end(v); } return; }
      const c = S.villagers.get(id || body); if (!c) { d.fila = d.fila.filter(q => q !== (id || body)); return; }
      // (the god's body is served at the counter, as it always was: it walks to it itself)
      if (body) { t.st = 7; t.cust = [c.id]; v.actT = 0; return; }
      const m = d.mesa[c.id]; const item = pickItem(b, m);
      if (!item) { d.faltas++; say(v, 'acabou', { bem: m.want === 'food' ? 'a comida' : 'a bebida' }); m.out = 1; d.fila = d.fila.filter(q => q !== c.id); return; }
      // (the others waiting at the same table for the same thing: one walk for all of them)
      const g = m.g || 0; const L = [c.id];
      if (g) for (const q of d.fila) { if (L.length >= T.TRAY || q === c.id) continue; const o = d.mesa[q]; if (o && o.st === 2 && !o.body && o.g === g && (o.want === 'food') === (item.k === 'food') && (!coin(b) || canPay(S.villagers.get(q), item.p))) L.push(q); }
      if (coin(b) && !canPay(c, item.p)) { d.recusas++; say(c, 'sem_dinheiro', {}); m.out = 2; d.fila = d.fila.filter(q => q !== c.id); return; }
      t.st = 2; t.cust = L; t.k = item.k; t.n1 = item.n; v.actT = 0; return;
    }
    if (t.st === 2) { // filling at the counter
      v.act = AN.encher.act; if (v.actT < AN.encher.contact) return;
      const L = t.cust.filter(q => d.mesa[q] && d.mesa[q].st === 2); const n = r2(t.n1 * L.length);
      const r = L.length ? D.move('b:' + b.id, 'v:' + v.id, t.k, n, { op: op.id, code: 'taverna-caneca', by: v.id, to: 'b:' + b.id, key: 'tc:' + op.id + ':' + d.q + ':' + L[0] }) : { ok: false };
      if (!r.ok) { for (const q of L) { d.faltas++; d.mesa[q].out = 1; } if (L.length) say(v, 'acabou', { bem: t.k === 'food' ? 'a comida' : 'a bebida' }); t.st = 1; t.cust = null; return; }
      t.cust = L; for (const q of L) d.mesa[q].vem = 1; // (on its way: the guest waits for it, not for a self-service)
      const from = counterOf(b, v); t.near = L[0]; const to = counterOf(b, v);
      const m = from && to && to.near && G.Interiors.walkBetween ? G.Interiors.walkBetween(b, from, to) : 0;
      t.st = 3; t.ww = r1(S.clock + (Number.isFinite(m) ? m / G.Vg.walkMS(v) : 0)); v.actT = 0; return;
    }
    if (t.st === 3) { t.st = 4; v.actT = 0; return; } // (at the table)
    if (t.st === 4) { // handing over, one by one, each paid
      v.act = AN.entregar.act; if (v.actT < AN.entregar.contact) return;
      for (const q of t.cust) { const c = S.villagers.get(q); const m = d.mesa[q]; if (m) delete m.vem; if (!c || !m || m.st !== 2 || !v.carry || v.carry.k !== t.k) continue; serve(op, v, c, false, 'v:' + v.id, t.k); }
      const from = counterOf(b, v); t.near = null; t.use = 'vender'; const to = counterOf(b, v);
      const m = from && to && G.Interiors.walkBetween ? G.Interiors.walkBetween(b, from, to) : 0;
      t.st = 5; t.ww = r1(S.clock + (Number.isFinite(m) ? m / G.Vg.walkMS(v) : 0)); t.cust = null; v.actT = 0; return;
    }
    if (t.st === 5) { // back at the counter: a cup nobody took, to the shelf
      if (v.carry && v.carry.op === op.id && v.carry.n > EPS) D.move('v:' + v.id, 'b:' + b.id, v.carry.k, v.carry.n, { op: op.id, code: 'taverna-volta', by: v.id, part: true });
      t.st = 1; t.n = (t.n || 0) + 1; v.actT = 0; t.wt = 0;
      return;
    }
    // the god's body at its table (D-767): st 10 come to it, the menu opened with the house's word; 11 waiting there for the order;
    // 12 at the counter, filling what was asked; 13 come back with it; 14 handing it over, paid there — and the walk back, st 5
    if (t.st >= 10 && t.st <= 14) {
      const m = t.corpo ? d.mesa[t.corpo] : null; const c = m ? S.villagers.get(t.corpo) : null;
      const mineM = !!m && !!m.corpo && m.srv === v.id && !!c;
      if (t.st === 10) {
        if (!mineM || m.cv !== 'chama' || !m.seat) return corpoBack(v, t, b);
        v.act = 'listen'; faceTo(v, c);
        const L = cartaOf(b).filter(x => x.ok).slice(0, 2).map(x => x.nome); const bem = L.length > 1 ? L.join(' e ') : L[0] || 'pouca coisa';
        const hi = G.Falas ? G.Falas.hello(v).replace('Bom dia!', S.time >= 0.72 ? 'Boa noite!' : 'Boa tarde!') : ''; // (the evening's greeting)
        m.ola = (m.falta ? say(v, 'carta_falta', { bem: m.falta }) : say(v, 'carta_taverna', { nome: hi, bem })) || '';
        m.cv = 'carta'; m.ct = r1(S.clock); m.ck = (m.ck || 0) + 1; m.st = 1; delete m.falta; t.st = 11; v.actT = 0; return;
      }
      if (t.st === 11) {
        if (mineM && m.cv === 'carta') { v.act = 'listen'; faceTo(v, c); return; }
        if (mineM && m.cv === 'pedido' && m.pedido) { t.k = m.pedido.k; t.of = m.pedido.of || null; t.n1 = t.k === 'food' ? 1 : T.DOSE[t.k] || 0.25; walkTo(v, t, b, null); t.st = 12; return; }
        return corpoBack(v, t, b); // («agora não», the body up, the menu waited out)
      }
      if (t.st === 12) {
        if (!mineM || m.cv !== 'pedido' || !m.pedido) return corpoBack(v, t, b);
        v.act = AN.encher.act; if (v.actT < AN.encher.contact) return;
        // (what is in the hands already: the round asked — a save in the middle of it —, or something else of the day, to the shelf)
        const h = v.carry; const has = !!h && h.op === op.id && h.k === t.k && h.n >= t.n1 - EPS;
        if (h && h.n > EPS && !has && h.op === op.id) D.move('v:' + v.id, 'b:' + b.id, h.k, h.n, { op: op.id, code: 'taverna-volta', by: v.id, part: true });
        const r = has ? { ok: true } : D.move('b:' + b.id, 'v:' + v.id, t.k, t.n1, { op: op.id, code: 'taverna-caneca', by: v.id, to: 'b:' + b.id, key: 'tc:' + op.id + ':' + d.q + ':c' + t.corpo + ':' + r1(S.clock), of: t.of || undefined });
        // (the shelf out of it since the order — the god's hand, another round —: back to the table to say so, the menu again)
        if (!r.ok) { d.faltas++; m.falta = m.pedido.nome; delete m.pedido; m.cv = 'chama'; m.srv = 0; m.cs = r1(S.clock); say(v, 'acabou', { bem: m.falta }); t.corpo = null; t.st = 1; v.actT = 0; return; }
        m.vem = 1; walkTo(v, t, b, t.corpo); t.st = 13; return;
      }
      if (t.st === 13) { if (!mineM || m.cv !== 'pedido') return corpoBack(v, t, b); t.st = 14; v.actT = 0; return; }
      // (st 14: handed over, one's hands free and the coin for it — else it goes back, and the screen says why)
      if (!mineM || m.cv !== 'pedido' || !m.pedido) return corpoBack(v, t, b);
      v.act = AN.entregar.act; faceTo(v, c); if (v.actT < AN.entregar.contact) return;
      delete m.vem; const p = m.pedido;
      if (c.carry && c.carry.n > EPS) { m.cv = 'entre'; m.srv = 0; m.st = 5; m.mao = r1(S.clock); delete m.pedido; return corpoBack(v, t, b); }
      if (coin(b) && !canPay(c, p.k === 'food' ? T.PRICE.food : T.PRICE.drink)) { m.cv = 'entre'; m.srv = 0; m.st = 5; m.sem = r1(S.clock); delete m.pedido; return corpoBack(v, t, b); }
      const r = serve(op, v, c, false, 'v:' + v.id, p.k, null, p.nome);
      if (r.ok) { m.cv = 'servido'; m.prato = p.nome; m.want = p.k === 'food' ? 'food' : p.k; } else { m.cv = 'entre'; m.st = 5; }
      m.srv = 0; delete m.pedido; return corpoBack(v, t, b);
    }
    if (t.st === 7) { // the god's body at the counter: served there, from the shelf
      v.act = AN.servir.act; if (v.actT < AN.servir.dur) return;
      const c = S.villagers.get(t.cust[0]); if (c && d.mesa[c.id]) serve(op, v, c); else d.fila = d.fila.filter(q => q !== t.cust[0]);
      t.st = 1; t.cust = null; v.actT = 0; return;
    }
    return H.end(v);
  }
  const canPay = (c, p) => !!c && D.get(E.coinRef(c), 'moedas') + EPS >= p;
  // (the errand cut — the day over, the tavern gone —: a cup in the hands goes back to the shelf on the way out)
  function backToShelf(v, b, op, H, end) {
    if (b && op && v.carry && v.carry.op === op.id && v.carry.n > EPS) D.move('v:' + v.id, 'b:' + b.id, v.carry.k, v.carry.n, { op: op.id, code: 'taverna-volta', by: v.id, part: true });
    if (op && op.data && v.task && v.task.cust) for (const q of v.task.cust) if (op.data.mesa[q]) delete op.data.mesa[q].vem;
    if (end) return H.end(v);
  }

  // ------------------------------ the god's body at a table (D-767, D-768) ------------------------------
  // The body sits down on a free seat of an open tavern — the plan's own place, taken by its hands (Possess.use, the verb «lugar») —
  // and is a guest at a table like anyone: its entry at the tables is made in the world's step (corpo: 1), and the keeper is
  // called to it. He walks to its table (the plan's walk, In.walkBetween), stands beside it (t.near: the floor by the one served,
  // turned to it) and says the house's word; the menu is open (cv 'carta') while he waits there — the body's screen shows what the
  // house has now (T.carta, only read: the people's drinks, the kitchen's dishes by what they are made of, the price, «não há») and
  // the order goes by the body's hands (Possess.apply → T.order). He goes back to the counter, fills the cup or the plate from the
  // shelf into his hands — of the dish asked, by the food's part (of: the rice, the fish; 20h) —, brings it and hands it over at
  // the table, paid there (serve, as anyone's round). The body drinks it a sip at a time and eats it a mouthful at a time (T.bite:
  // the Depot's use with the origin of what is eaten, the hunger down by what was eaten, the drink's effect at its last sip), seated,
  // with the gestures of the table (mesa-clips.js); the cup it emptied stays on the table (atmos.js reads the entry). The bad cases:
  // up from the seat before it came — undone, nothing paid (the cup in his hands back to the shelf); no keeper to come — the body is
  // told the counter's way and serves itself there (cv 'carta', srv −1), as anyone does; the shelf out of what was asked — «não
  // há», and the keeper back at the table to say so; no coin for it — the screen says why; the keeper gone or taken in the middle —
  // called again, another or the counter; a save in the middle — the entry comes back (the order fetched again, what was served
  // in the hands); the god's hand on the shelf — the menu says what is left. None of it is asked without the body: the world
  // without it is the same
  T.CARTA = 50;   // (seconds of the world the keeper waits at the table with the menu open; then «quando quiser, é só chamar»)
  T.SIPS = 3;     // (the sips of a round,)
  T.BITES = 4;    // (the mouthfuls of a plate)
  T.CALL = 6;     // (seconds of the world seated with nobody to come: the body is told to serve itself at the counter)
  T.COUNTER = 0.4; // (tiles from the buyer's place at the counter — a metre and a half —: at it)
  const CV = T.CV = { chama: 'esperando quem atenda', carta: 'o cardápio aberto', pedido: 'o pedido a caminho', servido: 'servido', entre: 'entre um pedido e outro' };
  const bodyOf = () => { const a = S_().avatar; return a ? S_().villagers.get(a.id) || null : null; };
  // (the body's own place at a seat of this tavern: the plan's place its hands hold — Possess.useOf)
  const bodyUse = b => { const P = G.Possess; const u = P && P.useOf ? P.useOf() : null; return u && u.b === b.id && SEAT_USES.includes(u.use) ? u : null; };
  const holding = (v, op) => !!(v && op && v.carry && v.carry.op === op.id && v.carry.n > EPS);
  const groupOf = (b, it) => (G.Interiors && G.Interiors.groupOf ? G.Interiors.groupOf(b, it) : 0);
  // (where the one who buys stands at the counter, in tiles — In.bizSpot, the plan's selling piece —, and the body at it)
  function counterAt(b) { const In = G.Interiors; const s = In && In.bizSpot ? In.bizSpot(b, 0) : null; return s && s.buyer ? s.buyer : null; }
  const atCounter = (v, b) => { const c = counterAt(b); return !!c && G.dist(v.x, v.y, c[0], c[1]) < T.COUNTER; };
  // the menu of the house (D-768), as its screen says it: each drink of the people — its own first, said «não há» when the shelf is
  // out of it; another one only while the shelf has it —, each dish of the kitchen's food by its part (what it is made of: the rice,
  // the fish of the catch — 20h; the parts said alike are one dish), the plate of the day «não há» when the kitchen has nothing;
  // the house's price; how many rounds of it the shelf has, free. Pure
  const MENU_FOOD = ['peixe', 'marisco', 'carne', 'arroz', 'trigo', 'cevada', 'milho', 'sorgo', 'horta', 'ovos', 'leite', 'fruta', 'mel', 'azeite', 'provisao', '?'];
  const DISH_M = Object.assign({}, DISH, { mel: 'pão com mel', azeite: 'pão com azeite', provisao: 'o prato do dia', '?': 'o prato do dia' });
  T.DISH_M = DISH_M;
  const drinkName = k => (Tv() && Tv().NAME[k] ? Tv().NAME[k][2] : 'uma bebida');
  // (what each thing is, in a line of the menu: the drink by where it comes from — the house's vat, of the grain the shelf has most of;
  // the people's store —, the dish by what it is made of. Only words: what is true of the world, said the tavern's way)
  const DESC_FOOD = { peixe: 'peixe do dia, da pesca do povo', marisco: 'mariscos da praia, cozidos', carne: 'carne assada na brasa', arroz: 'arroz cozido, das lavouras', trigo: 'pão de trigo com caldo quente', cevada: 'caldo grosso de cevada', milho: 'tortilhas de milho, quentes', sorgo: 'mingau de sorgo', horta: 'sopa de legumes da horta', ovos: 'ovos cozidos', leite: 'coalhada fresca', fruta: 'frutas da estação', mel: 'pão com mel', azeite: 'pão com azeite', provisao: 'o que a cozinha tem hoje', '?': 'o que a cozinha tem hoje' };
  function descDrink(b, k, brew) {
    if (k === 'cerveja') { if (brew !== 'cerveja') return 'cerveja do armazém do povo'; const g = OR() ? OR().most('b:' + b.id, 'food', OR().CEREAL) : null; const nm = g && OR().FOOD[g] ? OR().FOOD[g].nome : ''; return nm ? `cerveja de ${nm} da casa` : 'cerveja da casa'; }
    if (k === 'pulque') return brew === 'pulque' ? 'pulque da seiva do agave, da casa' : 'pulque do armazém do povo';
    if (k === 'mel') return 'hidromel de mel, do armazém do povo';
    if (k === 'vinho') return 'vinho das ânforas do armazém';
    return 'do armazém do povo';
  }
  function cartaOf(b) {
    const ref = 'b:' + b.id; const f = G.Fac.get(G.Village.facOfSet(b.set)); const dk = drinkOf(f); const out = [];
    const ks = []; for (const k of [dk.k, dk.alt].concat(DRINKS)) if (k && T.DOSE[k] && !ks.includes(k)) ks.push(k);
    const brew = f ? brewOf(f, b) : null;
    for (const k of ks) {
      const n = Math.floor(D.free(ref, k) / T.DOSE[k] + EPS);
      if (n < 1 && k !== dk.k) continue;
      out.push({ id: k, k, of: null, sort: 'beber', nome: drinkName(k), p: T.PRICE.drink, n, ok: n >= 1, de: brew === k ? 'cuba' : 'armazem', desc: descDrink(b, k, brew) });
    }
    const O1 = OR(); const said = new Set();
    if (O1) for (const t of MENU_FOOD) {
      const nm = DISH_M[t]; if (!nm || said.has(nm)) continue; const parts = MENU_FOOD.filter(x => DISH_M[x] === nm);
      const n = Math.floor(O1.free(ref, 'food', parts) + EPS); if (n < 1) continue; said.add(nm);
      out.push({ id: 'food:' + t, k: 'food', of: parts.length > 1 ? parts : t, sort: 'comer', nome: nm, p: T.PRICE.food, n, ok: true, de: t, desc: DESC_FOOD[t] || '' });
    }
    else { const n = Math.floor(D.free(ref, 'food') + EPS); if (n >= 1) out.push({ id: 'food', k: 'food', of: null, sort: 'comer', nome: T.dish(b), p: T.PRICE.food, n, ok: true, de: null, desc: 'o prato do dia' }); }
    if (!out.some(x => x.sort === 'comer')) out.push({ id: 'food', k: 'food', of: null, sort: 'comer', nome: 'o prato do dia', p: T.PRICE.food, n: 0, ok: false, de: null, desc: 'o que a cozinha tem hoje' });
    return out;
  }
  T.cartaOf = b => (b && b.type === 'taverna' ? cartaOf(b) : []);
  // how the menu of a house looks (D-768, only read): the people of the building (b.style — the people that built it — else the
  // people that keeps it), and its size and means now — the step of the tavern (the taberna, the taverna, the hospedaria: G.Escala),
  // the keeper's house (G.Atmos.rich), the great city it stands in, a shelf of many things —: the small and poor one is the slate on
  // the wall, chalked by hand with what it has today; the large or rich one, the menu with its border and a figure of each thing;
  // between, the board. → { tema, porte, pts, why }
  const THEMES = { romano: 1, grego: 1, egipcio: 1, nordico: 1, asteca: 1, classico: 1 };
  const SIZE = { taberna: 0, taverna: 1, hospedaria: 2 };
  T.look = function (b) {
    if (!b) return { tema: 'classico', porte: 'lousa', pts: 0, why: '' };
    const f = G.Fac.get(G.Village.facOfSet(b.set)); const set = S_().settlements.get(b.set);
    const tema = THEMES[b.style] ? b.style : f && THEMES[f.civ] ? f.civ : 'classico';
    const sz = SIZE[b.esc] || 0, rich = G.Atmos && G.Atmos.rich ? G.Atmos.rich(b) : 0, big = !!(set && (set.tier || 0) >= 4), many = cartaOf(b).filter(x => x.ok).length >= 4;
    const pts = sz + (rich >= 1 ? 1 : 0) + (big ? 1 : 0) + (many ? 1 : 0);
    const why = [sz ? b.esc : '', rich >= 1 ? 'casa de posses' : '', big ? 'cidade grande' : '', many ? 'muita coisa na prateleira' : ''].filter(Boolean).join(', ');
    return { tema, porte: pts >= 2 ? 'carta' : pts >= 1 ? 'quadro' : 'lousa', pts, why };
  };
  // what the body's hands and its screen read of it at a tavern (only read): the day, its entry, the seat its hands hold, the
  // keeper and whether he can come, the counter, what is in its hands of the house
  T.corpo = function (v) {
    if (!v || !A.isBody(v) || !v.inside) return null; const S = S_(); const b = S.buildings.get(v.inside);
    if (!b || b.type !== 'taverna' || !b.built) return null; const op = T.dia(b); if (!op || !live(op)) return null;
    const d = op.data; const m = d.mesa[v.id] && d.mesa[v.id].corpo ? d.mesa[v.id] : null; const u = bodyUse(b);
    const k = keeperOf(b); const can = !!k && k !== v && atHand(k); const c = holding(v, op) ? v.carry : null;
    return { op: op.id, b: b.id, open: T.aberta(b), cv: m ? m.cv : null, ck: m ? m.ck || 0 : 0, srv: m ? m.srv || 0 : 0, seat: !!u, it: u ? u.it : 0,
      pedido: m && m.pedido ? { k: m.pedido.k, of: m.pedido.of, nome: m.pedido.nome } : null, falta: m ? m.falta || '' : '', sem: m ? m.sem || 0 : 0, mao: m ? m.mao || 0 : 0, so: m ? m.so || 0 : 0, ola: m ? m.ola || '' : '',
      hold: c ? { k: c.k, n: c.n, food: c.k === 'food', nome: (m && m.prato) || (c.k === 'food' ? T.dish(b) : drinkName(c.k)), dose: c.k === 'food' ? 1 : T.DOSE[c.k] || c.n } : null,
      keeper: k ? k.id : 0, can, serving: serving(b, op), counter: counterAt(b), atCounter: atCounter(v, b), moeda: !!coin(b), mine: k === v, cup: m ? m.cup || 0 : 0 };
  };
  T.carta = function (v) { const s = T.corpo(v); if (!s) return null; const b = S_().buildings.get(s.b); s.items = cartaOf(b); s.price = n => money(b, n); return s; };
  T.holds = v => { const c = v && v.carry; const op = c && c.op ? A.get(c.op) : null; return !!(op && op.def === 'taverna' && live(op) && c.n > EPS && op.data.mesa[v.id] && op.data.mesa[v.id].corpo); };
  // (a fresh entry of the body at the tables: seated — u, the place its hands hold — or standing at the counter)
  function corpoEntry(op, b, v, u) {
    const S = S_(); const has = holding(v, op);
    return { t: r1(S.clock), r: 0, want: 'drink', st: has ? 3 : 1, body: 1, corpo: 1, cv: has ? 'servido' : 'chama', srv: 0, ck: 0, seat: u ? 1 : 0, it: u ? u.it : 0, q: u ? u.q : -1, g: u ? groupOf(b, u.it) : 0, nx: 0, cup: has ? r1(S.clock) : 0, cs: r1(S.clock) };
  }
  // the body's entry, each second of the world (tick): made when it sits down, its seat followed, let go when it gets up with
  // nothing in its hands or leaves the tavern (what it held of the house left on the table: paid, not eaten — «sobra»); the keeper
  // who had its order still on it, or the order called again; the menu waited out; the keeper called, or the counter said
  function corpoTick(op, b) {
    const S = S_(); const d = op.data; const v = bodyOf();
    for (const id of Object.keys(d.mesa)) {
      const m = d.mesa[id]; if (!m.corpo) continue; const w = S.villagers.get(+id);
      if (w && w === v && v.inside === b.id) continue;
      if (holding(w, op)) D.use('v:' + w.id, w.carry.k, w.carry.n, { op: op.id, code: 'sobra', by: w.id, mine: true });
      delete d.mesa[id];
    }
    if (!v || v.inside !== b.id) return;
    let m = d.mesa[v.id]; if (m && !m.corpo) return; // (the old way, from the door: its own)
    const u = bodyUse(b); const has = holding(v, op);
    if (!m) { if (!u || !T.aberta(b)) return; m = d.mesa[v.id] = corpoEntry(op, b, v, u); }
    if (u) {
      if (!m.seat || m.it !== u.it || m.q !== u.q) { m.seat = 1; m.it = u.it; m.q = u.q; m.g = groupOf(b, u.it); if (m.cv === 'entre' && !has) { m.cv = 'chama'; m.cs = r1(S.clock); m.so = 0; } }
    } else if (m.seat) {
      m.seat = 0; m.it = 0; m.q = -1; m.g = 0;
      // (up from the seat with nothing of the house in the hands — before the order came, or after —: off the tables; the keeper on
      // his way with it goes back, and the cup in his hands to the shelf: nothing paid)
      if (!has && m.srv !== -1) { delete d.mesa[v.id]; return; }
    }
    if (has && m.cv !== 'servido') { m.cv = 'servido'; m.st = 3; m.srv = 0; delete m.pedido; delete m.vem; }
    if (!has && m.cv === 'servido') { m.cv = 'entre'; m.st = 5; }
    // (the keeper who had its order still on it — else called again: another, or the counter)
    if (m.srv > 0) { const k = S.villagers.get(m.srv); const t = k && k.task; if (!k || !A.able(k) || !t || t.type !== 'atender' || t.op !== op.id || t.corpo !== v.id) { m.srv = 0; delete m.vem; if (m.cv === 'carta') m.cv = 'chama'; m.cs = r1(S.clock); } }
    // (the menu waited out at the table: «quando quiser, é só chamar»)
    if (m.cv === 'carta' && m.srv > 0 && S.clock - (m.ct || 0) > T.CARTA) { say(S.villagers.get(m.srv), 'carta_depois', {}); m.cv = 'entre'; m.srv = 0; m.st = 5; }
    // (the menu of the counter walked away from: shut)
    if (m.cv === 'carta' && m.srv === -1 && !atCounter(v, b)) { if (!has && !m.seat) { delete d.mesa[v.id]; return; } m.cv = has ? 'servido' : 'entre'; m.srv = 0; }
    // (calling, or an order nobody is fetching: the keeper to the counter — and nobody to come a while, the counter's way said)
    if (m.seat && (m.cv === 'chama' || (m.cv === 'pedido' && !m.srv))) {
      callKeeper(b, op); const k = keeperOf(b);
      if (k && k !== v && atHand(k)) m.so = 0; else if (!m.so && S.clock - (m.cs || 0) > T.CALL) m.so = r1(S.clock);
    }
  }
  // (the next of the body's to see to, for a keeper at the counter: its call at a table, or its order nobody is fetching)
  function corpoNext(d) { for (const id of Object.keys(d.mesa)) { const m = d.mesa[id]; if (m.corpo && !m.srv && ((m.cv === 'chama' && m.seat) || (m.cv === 'pedido' && m.pedido))) return { id: +id, m }; } return null; }
  // (the keeper's walk between the counter and the body's table: In.walkBetween of the places the share-out gives him before and after)
  function walkTo(v, t, b, near) { const S = S_(); const from = counterOf(b, v); t.near = near || null; if (!near) t.use = 'vender'; const to = counterOf(b, v); const w = from && to && G.Interiors.walkBetween ? G.Interiors.walkBetween(b, from, to) : 0; t.ww = r1(S.clock + (Number.isFinite(w) ? w / G.Vg.walkMS(v) : 0)); v.actT = 0; }
  // (back to the counter, done with the body or let go by it: st 5 puts what is in the hands back on the shelf)
  function corpoBack(v, t, b) { walkTo(v, t, b, null); t.corpo = null; t.cust = null; t.st = 5; }
  const faceTo = (v, o) => { if (o) G.faceTo(v, o.x - v.x, o.y - v.y); };
  // the body's order (its hands, in the world's step: Possess.apply): what the menu has now, the coin for it, the hands free
  T.order = function (v, opId, k, of) {
    if (!G.inSim || !v || !A.isBody(v)) return { ok: false, why: '' };
    const S = S_(); const op = A.get(opId); const b = op && live(op) ? S.buildings.get(op.at) : null; const d = op && op.data; const m = d && d.mesa[v.id];
    if (!b || !T.aberta(b)) return { ok: false, why: 'A taverna está fechada.' };
    if (!m || !m.corpo || m.cv !== 'carta') return { ok: false, why: 'Ninguém está anotando o pedido agora.' };
    const ofKey = x => (Array.isArray(x) ? x.join('+') : x || '');
    const it = cartaOf(b).find(x => x.k === k && ofKey(x.of) === ofKey(of)); if (!it) return { ok: false, why: 'Isso a casa não tem.' };
    if (!it.ok) return { ok: false, why: `Não há ${it.nome.replace(/^(um|uma|o|a) /, '')} agora.` };
    if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos estão ocupadas.' };
    if (coin(b) && !canPay(v, it.p)) return { ok: false, why: `Falta dinheiro: ${it.nome} custa ${money(b, it.p)}.` };
    if (D.strength(v) <= 0) return { ok: false, why: 'Sem os braços, você não consegue segurar a caneca.' };
    delete m.falta; delete m.sem; delete m.mao;
    if (m.srv === -1) { // (at the counter, by one's own hands, from the shelf — paid as to the keeper)
      const r = serve(op, v, v, true, 'b:' + b.id, k, it.of, it.nome); if (!r.ok) return r;
      m.cv = 'servido'; m.srv = 0; m.prato = it.nome; m.want = k === 'food' ? 'food' : k;
      return { ok: true, k, msg: `Você se serve de ${it.nome}${r.p ? ` e deixa ${money(b, r.p)} no balcão` : ''}.` };
    }
    const kp = S.villagers.get(m.srv);
    m.pedido = { k, of: it.of || null, nome: it.nome }; m.cv = 'pedido'; m.st = 2; m.want = k === 'food' ? 'food' : k;
    if (kp) { say(kp, 'pedido_ok', { bem: it.nome }); if (G.Possess.dealt) G.Possess.dealt({ to: kp.id }); } // (face to face: the two have met)
    return { ok: true, k, msg: kp ? `${G.cap(G.Possess.knows.call(v, kp))} vai buscar ${it.nome}.` : 'Pedido feito.' };
  };
  // (the menu shut with nothing asked: «agora não» — the keeper goes back)
  T.dismiss = function (v, opId) {
    if (!G.inSim || !v || !A.isBody(v)) return { ok: false, why: '' };
    const op = A.get(opId); const m = op && live(op) ? op.data.mesa[v.id] : null; if (!m || !m.corpo || m.cv !== 'carta') return { ok: true };
    if (m.srv === -1 && !m.seat && !holding(v, op)) { delete op.data.mesa[v.id]; return { ok: true }; }
    m.cv = holding(v, op) ? 'servido' : 'entre'; m.srv = 0; m.st = holding(v, op) ? 3 : 5; return { ok: true };
  };
  // (seated, between one order and the next: the keeper called to the table again)
  T.call = function (v, opId) {
    if (!G.inSim || !v || !A.isBody(v)) return { ok: false, why: '' };
    const S = S_(); const op = A.get(opId); const b = op && live(op) ? S.buildings.get(op.at) : null; if (!b || !T.aberta(b)) return { ok: false, why: 'A taverna está fechada.' };
    const u = bodyUse(b); if (!u) return { ok: false, why: 'Sente-se a uma mesa primeiro.' };
    let m = op.data.mesa[v.id]; if (m && !m.corpo) return { ok: false, why: '' };
    if (holding(v, op)) return { ok: false, why: 'Termine primeiro o que tem nas mãos.' };
    if (!m) m = op.data.mesa[v.id] = corpoEntry(op, b, v, u);
    if (m.cv === 'chama' || m.cv === 'carta' || m.cv === 'pedido') return { ok: true, msg: '' };
    m.cv = 'chama'; m.srv = 0; m.cs = r1(S.clock); m.so = 0; m.st = 1;
    const k = keeperOf(b); return { ok: true, msg: k && k !== v && atHand(k) ? `Você chama ${G.Possess.knows.call(v, k)}.` : 'Você chama, mas não há quem sirva agora.' };
  };
  // (at the counter with nobody serving there: the menu of the shelf, to serve oneself — as anyone of the world does, L-1930)
  T.counter = function (v, opId) {
    if (!G.inSim || !v || !A.isBody(v)) return { ok: false, why: '' };
    const S = S_(); const op = A.get(opId); const b = op && live(op) ? S.buildings.get(op.at) : null; if (!b || !T.aberta(b)) return { ok: false, why: 'A taverna está fechada.' };
    if (v.inside !== b.id || !atCounter(v, b)) return { ok: false, why: 'Chegue ao balcão.' };
    const k = keeperOf(b); if (k && k !== v && serving(b, op)) return { ok: false, why: `${G.cap(G.Possess.knows.call(v, k))} está no balcão: sente-se, que ele serve à mesa.` };
    if (holding(v, op)) return { ok: false, why: 'Você já tem nas mãos o que pediu.' };
    if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos estão ocupadas.' };
    let m = op.data.mesa[v.id]; if (m && !m.corpo) return { ok: false, why: '' };
    if (!m) m = op.data.mesa[v.id] = corpoEntry(op, b, v, null);
    delete m.pedido; delete m.falta; delete m.sem; m.cv = 'carta'; m.srv = -1; m.ck = (m.ck || 0) + 1; m.ct = r1(S.clock); m.ola = '';
    return { ok: true, msg: '' };
  };
  // a sip of the round, a mouthful of the plate (the body's hands, in the world's step): the Depot's use of the hands, with the origin
  // of what is eaten (20h); the hunger down by what was eaten; the drink's effect at its last sip; the cup or the plate emptied, the
  // entry between one order and the next. A plate only at a table
  T.bite = function (v) {
    if (!G.inSim || !v || !A.isBody(v)) return { ok: false, why: '' };
    const c = v.carry; const op = c && c.op ? A.get(c.op) : null;
    if (!op || op.def !== 'taverna' || !live(op) || !(c.n > EPS)) return { ok: false, why: 'Não há o que beber nem comer.' };
    const m = op.data.mesa[v.id]; if (!m || !m.corpo) return { ok: false, why: '' };
    const k = c.k, food = k === 'food'; const b = S_().buildings.get(op.at);
    if (food && !bodyUse(b)) return { ok: false, why: 'Sente-se a uma mesa para comer.' };
    const one = food ? 1 / T.BITES : (T.DOSE[k] || c.n) / T.SIPS; const n = c.n <= one * 1.5 ? c.n : one;
    const r = D.use('v:' + v.id, k, n, { op: op.id, code: food ? 'refeicao' : 'bebida', by: v.id, mine: true, part: true });
    if (!r.ok) return { ok: false, why: 'Não deu.' };
    if (food) v.hunger = Math.max(0, v.hunger - 35 * r.n);
    const left = holding(v, op) ? v.carry.n : 0; const last = !(left > EPS);
    if (last) {
      if (food) m.pr = (m.pr || 0) + 1; else { taste(v, k, b); m.r++; }
      m.cv = 'entre'; m.st = 5; m.nx = r1(S_().clock + T.TALK); G.Possess.deed(food ? 'refeicao' : 'rodada');
    }
    return { ok: true, k, food, last, left };
  };

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
    // (the keeper with the cups on his way to a table or handing them over: his hands are the round's — a call from outside
    // waits, D-094)
    leg(op, v) { const t = v.task; return t && t.type === 'atender' && t.op === op.id && t.st >= 2 && t.st <= 14 && t.st !== 7 ? 'servir' : null; }, // (and at the god's body's table, with its order: D-767)
    text(v, t, op) {
      const S = S_();
      if (t.type === 'atender' && t.st >= 10 && t.st <= 14) { const c = t.corpo && S.villagers.get(t.corpo); const nm = c ? c.name : 'um freguês'; return t.st <= 11 ? `Atendendo à mesa de ${nm}` : t.st === 12 ? `Enchendo o pedido de ${nm}` : `Levando o pedido à mesa de ${nm}`; }
      if (t.type === 'atender') { const c = t.cust && S.villagers.get(t.cust[0]); return t.st < 1 ? 'Indo para a taverna' : t.st === 2 && c ? `Enchendo ${t.cust.length > 1 ? 'as canecas' : 'a caneca'} de ${c.name}` : (t.st === 3 || t.st === 4) && c ? `Levando ${t.k === 'food' ? 'o prato' : 'a bebida'} à mesa de ${c.name}` : 'No balcão da taverna'; }
      if (t.type === 'tavern') {
        if (t.st === 6) return 'Tocando música na taverna';
        if (brawls.has(v.id)) return 'Brigando na taverna';
        if (t.st === 0) return 'Indo para a taverna';
        if (t.st === 1) return 'Entrando na taverna';
        if (t.st === 2) return 'Sentado na taverna, esperando ser servido';
        if (t.st === 3) return v.carry && v.carry.k === 'food' ? 'Comendo na taverna' : v.drunk > S.clock ? 'Bebendo além da conta na taverna' : 'Bebendo e conversando na taverna';
        if (t.st === 5) return 'Conversando à mesa da taverna';
        if (t.st === 7) return 'Servindo-se no balcão da taverna';
        if (t.st === 8) return 'Voltando à mesa da taverna';
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
        if (m && m.corpo) continue; // (the body at a table, or at the counter: its own hands — the provider of cardapio-ui.js, D-767)
        if (m && c && c.op === op.id) { out.push({ id: 'taverna.consumir:' + op.id, act: 'consumir', op: op.id, label: c.k === 'food' ? 'Comer' : `Beber ${T.nome(c.k)}`, at, anim: c.k === 'food' ? 'comer' : 'beber', hands: 1 }); continue; }
        if (m) { out.push({ id: 'taverna.sair:' + op.id, act: 'sair', op: op.id, label: 'Levantar e sair da taverna', at, anim: 'apontar', hands: 0 }); continue; }
        if (c && c.n > EPS) continue;
        // (a tavern with seats in its plan: the body goes in and sits down, and the keeper comes to its table — D-767; ordering from the
        // door is the way of a tavern with no plan)
        { const tb = G.Interiors && G.Interiors.table ? G.Interiors.table(b) : null; if (tb && tb.byUse && SEAT_USES.some(u => (tb.byUse.get(u) || []).length)) continue; }
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
  A.hooks.gone.push(function (v) {
    for (const op of A.all()) {
      if (op.def !== 'taverna' || !live(op)) continue;
      if (op.data.mesa[v.id]) { delete op.data.mesa[v.id]; op.data.fila = op.data.fila.filter(id => id !== v.id); }
      // (the keeper who had the god's body's order, gone or taken in the middle of it: the order called again at once — another, or
      // the counter — D-767)
      for (const id in op.data.mesa) { const m = op.data.mesa[id]; if (m.corpo && m.srv === v.id) { m.srv = 0; delete m.vem; if (m.cv === 'carta') m.cv = 'chama'; m.cs = r1(S_().clock); } }
    }
  });

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
  // what was served in their hands —; a day of a tavern is the world's, never ended by a save. L-190's rule. Only who was
  // at a table at the save: the tables keep for a second whoever left by another door, and the load sat them down again;
  // the save says who sat there by the errand each one had, and the one who had left is let go at the next look — L-435)
  (G.saveHooks = G.saveHooks || []).push({
    save(out) {
      const S = S_(); const L = [];
      for (const op of A.all()) if (op.def === 'taverna' && live(op)) for (const id in op.data.mesa || {}) { const v = S.villagers.get(+id); if (v && !op.data.mesa[id].body && atTable(v, op)) L.push(op.id + ':' + id); }
      out.taverna = L;
    },
    load(o) {
      const S = S_();
      // (a save of before has no list: everyone at the tables, as it always loaded)
      const keep = o && Array.isArray(o.taverna) ? new Set(o.taverna) : null;
      for (const op of A.all()) {
        if (op.def !== 'taverna') continue;
        // (a day saved before its book said «gasto» has what the keeper paid as «custo» — the word went to what a house cost
        // its family, L-236 —: the old word is taken)
        const d = op.data; if (!(typeof d.gasto === 'number' && isFinite(d.gasto))) { d.gasto = typeof d.custo === 'number' && isFinite(d.custo) ? d.custo : 0; delete d.custo; }
        if (!live(op)) continue;
        d.mesa = d.mesa && typeof d.mesa === 'object' ? d.mesa : {}; d.fila = Array.isArray(d.fila) ? d.fila.filter(id => d.mesa[id]) : [];
        for (const id of Object.keys(d.mesa)) {
          const v = S.villagers.get(+id); const m = d.mesa[id];
          // (the god's body's entry kept as it was — the order to fetch again, what was served in the hands; the menu shut, called
          // again: whoever had it has no errand now — D-767. The step lets it go if the body is not there)
          if (v && m.corpo) { m.srv = 0; delete m.vem; if (!CV[m.cv]) m.cv = 'chama'; if (m.cv === 'carta') m.cv = 'chama'; if (m.cv === 'pedido' && !m.pedido) m.cv = 'chama'; if (m.cv === 'servido' && !holding(v, op)) { m.cv = 'entre'; m.st = 5; } m.cs = r1(S.clock); continue; }
          if (!v || m.body || v.captive || v.jail) { delete d.mesa[id]; continue; }
          if (keep && !keep.has(op.id + ':' + id)) continue;
          // (as they were: with what was served in the hands, given it by the server's hand, between rounds — the musician back at
          // the seat —, or waiting, in the queue; on the seat they had, In.holdAt — D-762)
          const st = v.carry && v.carry.op === op.id ? 3 : m.st === 4 ? 4 : m.st === 5 || m.st === 6 ? 5 : 2;
          delete m.vem; m.st = st;
          G.Vg.setTask(v, { type: 'tavern', id: op.at, op: op.id, pri: 0.5, st, wt: 0, use: m.use || 'sentar', kind: 'tavern' });
          if (v.task && v.task.type === 'tavern') { v.inside = op.at; const b = S.buildings.get(op.at); if (b && m.it && G.Interiors && G.Interiors.holdAt && !G.Interiors.holdAt(v, b, m.it, m.q, 1)) { m.it = 0; m.q = -1; } if (st === 2 && !d.fila.includes(+id)) d.fila.push(+id); }
          else delete d.mesa[id];
        }
        d.fila = d.fila.filter(id => d.mesa[id] && d.mesa[id].st === 2); d.mus = 0;
      }
      brawls.clear();
    },
  });
})(window.G);
