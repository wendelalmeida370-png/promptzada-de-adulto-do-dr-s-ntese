'use strict';
// ============================================================
//  Inventário: what a person carries and what they hold (D-336).
//  Three things, one door each:
//   - the bag (v.mochila: { key: n }) is a holder of the G.Depot,
//     'm:<id>', and every thing in or out of it is a move of the
//     Depot, in the ledger;
//   - the equipment (v.equip: { mao, outra, costas, cinto, cabeca,
//     corpo, atalhos, kit }) says where the things of the bag sit
//     on the body — equipping is no move of goods, only a place:
//     what is equipped is always in the bag;
//   - what a person holds right now, for whoever asks (the 3D, the
//     fight, the work): G.Inv.held(v) — their own things when they
//     have any, else the trade's kit (G.Inv.kit), the things a
//     lumberjack, a warrior, an elder carry by their trade and act,
//     derived and pure, as the clothes are (G.Atmos.dress).
//  Only this file writes v.mochila and v.equip (the guard's rule
//  111) and only this file reads them (rule 128): the others ask
//  the doors below. Every door that changes the world works only
//  inside the world's step (G.inSim): the body asks through its
//  hands (G.Possess.apply), the world calls them in its own step.
//  The trade's things are the person's (D-374): the first time the
//  god lives a body, the things of its trade become real things in
//  its bag (the ledger's code 'kit'), once in a life. The contract
//  of the gameplay base: JOGABILIDADE.md (§4.2, the doors).
// ============================================================
(function (G) {
  const Inv = G.Inv = {};
  const It = G.Itens, D = G.Depot, A = G.Act;
  const SLOTS = ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo'];
  Inv.SLOTS = SLOTS;
  const HANDS = ['mao', 'outra'], STOWS = ['costas', 'cinto'];
  const NQUICK = Inv.NQUICK = 5; // (the hotbar: 1 to 5)
  // (the order the bag's things are placed on the body when there are fewer of a thing than places naming it: the hands first)
  const KEEP = ['mao', 'outra', 'cabeca', 'corpo', 'costas', 'cinto'];
  const EPS = 1e-6;
  const fin = x => typeof x === 'number' && isFinite(x);
  const r4 = x => Math.round(x * 1e4) / 1e4;
  const r2 = x => Math.round(x * 100) / 100;
  const isThing = k => It.THINGS.has(k);
  const loaded = v => !!(v.carry && v.carry.n > EPS);

  // ------------------------------ the trade's kit ------------------------------
  // (the tool an act puts in the hand — the same table the 3D had, now the world's: who chops holds an axe, who fights a sword)
  const ACT_TOOL = Inv.ACT_TOOL = { chop: 'machado', cut: 'machado', mine: 'picareta', dig: 'pa', hammer: 'martelo', build: 'martelo', forge: 'martelo', beat: 'martelo', rake: 'enxada', butcher: 'faca', skin: 'faca', stab: 'espada', fight: 'espada', brandish: 'espada', fish: 'vara', reel: 'vara', harvest: 'foice' };
  // (the acts of the fight: whoever already holds a weapon fights with it — the spearman with his spear, the militia with its club)
  const FIGHT = { stab: 1, fight: 1, brandish: 1 };
  // the trade's own thing and where it rides when the hands are free (the act puts it in the hand while it lasts)
  const TRADE = Inv.TRADE = {
    lenhador: ['machado', 'costas'], mineiro: ['picareta', 'costas'], construtor: ['martelo', 'cinto'], ferreiro: ['martelo', 'cinto'],
    agricultor: ['enxada', 'costas'], lavrador: ['enxada', 'costas'], fruticultor: ['foice', 'cinto'], vinhateiro: ['foice', 'cinto'],
    coletor: ['cesto', 'costas'], acougueiro: ['faca', 'cinto'], salgador: ['faca', 'cinto'], curandeiro: ['faca', 'cinto'],
    salineiro: ['pa', 'costas'], foguista: ['pa', 'costas'], marinheiro: ['remo', 'costas'], pastor: ['cajado', 'mao'], pescador: ['vara', 'costas'],
  };
  // the warrior of each people, as the god's view has always drawn them (G.Arch.arms): the weapon and the shield
  const WAR_CIV = { grego: ['lanca', 'escudo'], romano: ['lanca', 'escudo'], nordico: ['machado', 'escudo'], egipcio: ['lanca', 'escudo'], asteca: ['clava', 'escudo'] };
  const WAR_UNIT = { lanceiro: ['lanca', 'escudo'], espadachim: ['espada', 'escudo'], cavalaria: ['lanca', 'escudo'], milicia: ['clava', null] };
  // (the arts of a person's people, for the material of what they carry: what their forge would make — read only)
  const artsOf = v => { const s = G.S && G.S.settlements.get(v.set); const f = s && G.Fac.get(s.fac); return f && f.tech ? f.tech.known : null; };
  Inv.artsOf = artsOf;
  // (and what the people has had of each material — G.Origem.had: 20h, D-442. Nada vem do nada: a thing is drawn and made only in
  // a material the people has — wood, stone and the fibres of the wood always; leather once it had hides; bronze and iron with the
  // art and the metal had. The art alone never gives a material)
  const Or = () => G.Origem;
  const matOK = (fid, m, arts) => (Or() ? Or().matOK(fid, m, arts) : !(It.MATS[m] && It.MATS[m].tech) || !!(arts && arts[It.MATS[m].tech] !== undefined));
  // may this people make a kind at all: its art (the bow), the bronze hook of a rod (a metal of the kind's own, not its material)
  function kindOK(kind, fid, arts) {
    const k = It.KINDS[kind]; if (!k) return false; const t = k.tech; if (!t) return true;
    if (It.METALS[t]) return k.mats.some(m => It.METALS[m]) || (Or() ? Or().forged(fid, t) : !!(arts && arts[t] !== undefined));
    return !!(arts && arts[t] !== undefined);
  }
  Inv.kindOK = kindOK;
  // a kind as the person's people would make it: the best material it has had; null — a kind of metal or leather only (the
  // sword, the helmet) in a people that never had the metal or the hide — is nothing at all
  const made = (kind, fid, arts) => { if (!kind || !kindOK(kind, fid, arts)) return null; const m = It.bestOf(kind, x => matOK(fid, x, arts)); return m ? It.keyOf(kind, m) : null; };
  Inv.made = (kind, v) => (v ? made(kind, G.Fac.idOfV(v), artsOf(v)) : null);
  // the fisher's gear by the way the people fish (G.Pesca.how: the net, the line, the harpoon, the hands)
  const fishGear = v => { const P = G.Pesca; const how = P && P.how ? P.how(G.Fac.idOfV(v)) : 'linha'; return how === 'rede' ? 'rede' : how === 'arpao' ? 'lanca' : how === 'maos' ? null : 'vara'; };
  // what a person carries by trade alone, with the hands free (no act, no load): the things that are theirs by trade — the ones
  // that become real things the first time the god lives them (D-374). Pure: it reads the person and their people's arts,
  // writes nothing, draws no chance — the same answer for the same person in the same state
  Inv.trade = function (v) {
    const out = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: false };
    if (!v || v.age < 2) return out;
    const arts = artsOf(v); const fid = G.Fac.idOfV(v); const mk = kind => made(kind, fid, arts);
    const fighter = v.age >= 14 && !v.captive && (v.role === 'guerreiro' || !!v.unit);
    if (fighter) {
      // (the archer: the bow in the bow hand, a knife at the belt; the levy by its company; the warrior by the people's way)
      if (v.arm === 'arco') { out.outra = mk('arco'); out.cinto = mk('faca'); }
      else {
        const civ = G.Fac.civOfV ? G.Fac.civOfV(v) : v.civ;
        let w = WAR_UNIT[v.unit] || (v.elite === 'berserker' ? ['machado', null] : WAR_CIV[civ]) || ['lanca', 'escudo'];
        if (w[0] && !mk(w[0])) w = ['lanca', w[1]]; // (a sword with no metal had is a spear of stone: 20h)
        out.mao = mk(w[0]); out.outra = mk(w[1]);
      }
      // (the helmet of the warriors and the archers, as the god's view draws it — never the militia's — in what the people had: the
      // bronze, the iron, the leather of its hides; with none of them, no helmet: 20h)
      if (v.unit !== 'milicia') out.cabeca = mk('elmo');
      return out;
    }
    if (v.role === 'arqueiro' && v.age >= 14 && !v.captive) { out.outra = mk('arco'); out.cinto = mk('faca'); out.cabeca = mk('elmo'); return out; }
    if (v.age < 14) return out;
    if ((v.role === 'cacador' || v.role === 'vigia') && !v.captive) { if (v.arm === 'arco') out.outra = mk('arco'); else out.mao = mk('lanca'); if (v.role === 'cacador') out.cinto = mk('faca'); return out; }
    if (v.role === 'anciao' && v.age >= 60) { out.mao = mk('cajado'); return out; }
    const t = TRADE[v.role]; if (!t) return out;
    const kind = v.role === 'pescador' ? fishGear(v) : t[0];
    const key = kind ? mk(kind) : null;
    if (key) { const s = It.fits(key, t[1]) ? t[1] : It.guarda(key) || It.mao(key); if (s) out[s] = key; }
    return out;
  };
  // what a person with no things of their own carries by trade and act: a place for each slot (null: nothing there). Pure, as
  // Inv.trade: the act's tool in the hand while the act lasts (the fight keeps the weapon one holds), a load or a gear in the
  // arms puts what the hands held on the back or the belt
  Inv.kit = function (v) {
    const out = Inv.trade(v);
    if (!v || v.age < 2) return out;
    act(v, out, null);
    if (loaded(v) || v.gear) freeHands(out);
    return out;
  };
  // (the act's tool into the view's hand: one of the person's own of that kind — from the belt, the back, the bag —, else the
  // trade's; for the fish, the people's gear. own: the person's trade's things became real (equip.kit, D-374) — the god's body,
  // and whoever it was: the trade's unseen tool is no more theirs to hold, the hand keeps what it holds — a work done with
  // another tool, or with the bare hands, is drawn as it is done (20g, D-426))
  function act(v, out, bag, own) {
    let t = ACT_TOOL[v.act]; if (!t) return;
    if (FIGHT[v.act] && out.mao && (It.has(out.mao, 'lutar') || It.has(out.mao, 'golpe'))) return;
    if (t === 'vara') { t = fishGear(v); if (!t || v.gear) return; }
    let key = null;
    for (const s of SLOTS) if (out[s] && It.def(out[s]).kind === t) { key = out[s]; if (s !== 'mao') out[s] = null; break; }
    if (!key && bag) for (const k in bag) if (bag[k] >= 1 && isThing(k) && It.def(k).kind === t) { key = k; break; }
    if (!key && !own) key = made(t, G.Fac.idOfV(v), artsOf(v));
    if (!key) return; // (a tool of a material the people never had: the act's hands are empty, 20h)
    out.mao = key;
    // (a thing of two hands empties the other: what it held rides on the back if the back is free)
    if (It.def(key).maos >= 2 && out.outra) { const o = out.outra; out.outra = null; if (!out.costas && It.fits(o, 'costas')) out.costas = o; }
    else if (out.outra && It.def(out.outra).maos >= 2) { const o = out.outra; out.outra = null; if (!out.costas && It.fits(o, 'costas')) out.costas = o; }
  }
  // (a load in the arms: the hands empty — what they held goes where it is put away, the back or the belt, when that is free)
  function freeHands(out) {
    for (const h of HANDS) {
      const k = out[h]; if (!k) continue; out[h] = null;
      const g = It.guarda(k); const s = g && !out[g] && It.fits(k, g) ? g : STOWS.find(x => !out[x] && It.fits(k, x));
      if (s) out[s] = k;
    }
  }

  // ------------------------------ what a person holds ------------------------------
  // the one question of the 3D, the fight and the work (D-336): their own things in their places; for one whose trade's things
  // never became real (D-374) the trade's kit fills the places their own things leave empty; the act's tool in the hand while
  // it lasts; a load in the arms empties the hands. Always a fresh object: the caller may keep it, never write the person
  // through it. real: the person has things of their own
  Inv.held = function (v) {
    if (!v) return { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: false };
    const e = v.equip, bag = v.mochila;
    if (!(bag && typeof bag === 'object' && hasAny(bag)) && !(e && e.kit)) return Inv.kit(v);
    const out = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: true };
    if (e) for (const s of SLOTS) { const k = e[s]; if (typeof k === 'string' && bag && bag[k] >= 1) out[s] = k; }
    if (!(e && e.kit)) {
      const k = Inv.trade(v);
      for (const s of SLOTS) if (!out[s] && k[s] && !(HANDS.includes(s) && (twoIn(out) || It.def(k[s]).maos >= 2 && out[s === 'mao' ? 'outra' : 'mao']))) out[s] = k[s];
    }
    act(v, out, bag, !!(e && e.kit));
    if (loaded(v) || v.gear) freeHands(out);
    return out;
  };
  const hasAny = b => { for (const k in b) if (b[k] > EPS) return true; return false; };
  const twoIn = o => (o.mao && It.def(o.mao).maos >= 2) || (o.outra && It.def(o.outra).maos >= 2);
  // has the person things of their own (a bag with something in it)?
  Inv.real = v => !!(v && v.mochila && typeof v.mochila === 'object' && hasAny(v.mochila));
  // what a person holds, for a drawer that asks every frame (the 3D): the answer of Inv.held kept in the caller's memo `m` while
  // everything it reads of the person is the same — the act, the trade, the company, the bow, the captivity, the load, the gear,
  // the age's band, the places and the bag — and for a day of the world at most, for what it reads of the person's people (its
  // arts, its way of fishing), which changes slowly. The inventory reads its own fields here (rule 128); the caller keeps the memo
  // and never writes it; a fresh answer only when it changes (L-1114)
  const band = a => (a < 2 ? 0 : a < 14 ? 1 : a < 60 ? 2 : 3);
  Inv.heldFor = function (v, m) {
    if (!v || !m) return Inv.held(v);
    const e = v.equip && typeof v.equip === 'object' ? v.equip : null, b = v.mochila && typeof v.mochila === 'object' ? v.mochila : null;
    const c = v.carry && v.carry.n > 0 ? 1 : 0, ag = band(v.age), day = G.S ? G.S.day : 0;
    let same = !!m.out && m.v === v && m.act === v.act && m.role === v.role && m.unit === v.unit && m.arm === v.arm && m.elite === v.elite && m.cap === !!v.captive
      && m.c === c && m.gear === !!v.gear && m.ag === ag && m.day === day && m.e === !!e && m.kit === !!(e && e.kit);
    if (same && e) for (let i = 0; i < SLOTS.length; i++) if (m.es[i] !== (e[SLOTS[i]] || null)) { same = false; break; }
    if (same) { let n = 0; if (b) for (const k in b) if (b[k] > EPS) { if (m.bk[n] !== k || m.bn[n] !== b[k]) { same = false; break; } n++; } if (same && n !== m.bl) same = false; }
    if (same) return m.out;
    m.v = v; m.act = v.act; m.role = v.role; m.unit = v.unit; m.arm = v.arm; m.elite = v.elite; m.cap = !!v.captive; m.c = c; m.gear = !!v.gear; m.ag = ag; m.day = day;
    m.e = !!e; m.kit = !!(e && e.kit); m.es = m.es || new Array(SLOTS.length); for (let i = 0; i < SLOTS.length; i++) m.es[i] = e ? e[SLOTS[i]] || null : null;
    m.bk = m.bk || []; m.bn = m.bn || []; let n = 0; if (b) for (const k in b) if (b[k] > EPS) { m.bk[n] = k; m.bn[n] = b[k]; n++; } m.bl = n;
    m.out = Inv.held(v); return m.out;
  };

  // ============================== the bag: the Depot's holder 'm:<id>' ==============================
  // How much a body carries on itself, in kilos (D-373): the same steps of age as the arms' strength (G.Depot.strength) at 2,5 kg
  // a step — a grown body 25 kg, a child 7,5, the old 15 and 10 —, the «Resistente» more; not the sickness, the tiredness nor a
  // lost arm: the bag rides on the back, and a sick soldier still wears his sword. Nothing ever goes in beyond it; what the
  // years take from the limit stays (nothing of the person's is lost), and nothing more goes in until it is under again
  const KG = Inv.KG = 2.5;
  const stepOf = a => (a < 2 ? 0 : a < 10 ? 3 : a < 14 ? 5 : a < 16 ? 7 : a >= 70 ? 4 : a >= 62 ? 6 : 10);
  const strong = v => (v.traits && v.traits.includes('Resistente') ? 1.15 : 1);
  Inv.cap = v => (v ? r2(stepOf(v.age) * KG * strong(v)) : 0);
  // (the most the limit has ever been in this life: a child's only grows, a grown body's was 25 — what the checker holds a bag to)
  Inv.capPeak = v => (v ? r2((v.age >= 16 ? 10 : stepOf(v.age)) * KG * strong(v)) : 0);
  // kilos in the bag (what is worn and held is in it too)
  Inv.weight = function (v) { const b = v && v.mochila; if (!b || typeof b !== 'object') return 0; let w = 0; for (const k in b) if (b[k] > 0) w += It.peso(k, b[k]); return r4(w); };
  // how many more of a key the bag takes: things whole, goods as they are; never water (no jar) nor coins (the purse, 'p:')
  Inv.room = function (v, k) {
    if (!v || k === 'water' || k === 'moedas') return 0;
    const d = It.def(k); if (!d || !(d.peso > 0)) return 0;
    const free = Inv.cap(v) - Inv.weight(v); if (!(free > EPS)) return 0;
    return d.coisa ? Math.floor((free + EPS) / d.peso) : r4(free / d.peso);
  };
  // a fresh copy of the bag, and how many of a key are in it
  Inv.bag = v => Object.assign({}, (v && v.mochila && typeof v.mochila === 'object') ? v.mochila : {});
  Inv.count = (v, k) => { const b = v && v.mochila; return b && b[k] > 0 ? b[k] : 0; };
  // the first thing of the bag good for a tag (cortar, pescar, lutar…), by the catalog's order of the bag's keys, or null
  Inv.find = function (v, tag) { const b = v && v.mochila; if (!b) return null; for (const k of Object.keys(b).sort()) if (b[k] >= 1 && It.has(k, tag)) return k; return null; };
  // the equipment, read: a fresh copy ({ the six places, atalhos: [5], kit })
  Inv.equipOf = function (v) {
    const e = v && v.equip; const out = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, atalhos: [null, null, null, null, null], kit: 0 };
    if (!e || typeof e !== 'object') return out;
    for (const s of SLOTS) out[s] = typeof e[s] === 'string' ? e[s] : null;
    if (Array.isArray(e.atalhos)) for (let i = 0; i < NQUICK; i++) out.atalhos[i] = typeof e.atalhos[i] === 'string' ? e.atalhos[i] : null;
    out.kit = fin(e.kit) ? e.kit : 0; return out;
  };
  // the things of the bag as the screen lists them: [{ k, n, d (the catalog's), on: [the places it is in] }], in the catalog's
  // order (the things first, by kind and material; then the goods)
  const ORD = (() => { const o = {}; let i = 0; for (const kind in It.KINDS) for (const m of It.KINDS[kind].mats) o[It.keyOf(kind, m)] = i++; return o; })();
  Inv.list = function (v) {
    const b = v && v.mochila; if (!b || typeof b !== 'object') return [];
    const e = Inv.equipOf(v); const out = [];
    for (const k in b) { if (!(b[k] > EPS)) continue; const d = It.def(k); if (!d) continue; out.push({ k, n: b[k], d, on: SLOTS.filter(s => e[s] === k) }); }
    return out.sort((x, y) => (ORD[x.k] !== undefined ? ORD[x.k] : 1e4) - (ORD[y.k] !== undefined ? ORD[y.k] : 1e4) || (x.k < y.k ? -1 : x.k > y.k ? 1 : 0));
  };

  // the index of the people who carry a bag (for the round that keeps the equipment true): made again with every world
  const bags = new Set();
  const index = () => { bags.clear(); if (G.S) for (const v of G.S.villagers.values()) if (v.mochila || v.equip) bags.add(v.id); };
  G.worldHooks.push(() => { bags.clear(); outside = 0; });
  let outside = 0; // (doors asked from outside the world's step: refused, and counted for the checker)
  Inv.outside = () => outside;
  D.addKind('m', {
    obj: id => (G.S && G.S.villagers.get(id)) || null,
    get: (v, k) => { const b = v.mochila; return b && b[k] > 0 ? b[k] : 0; },
    room: (v, k) => Inv.room(v, k),
    take: (v, k, n) => { const b = v.mochila; b[k] = r4((b[k] || 0) - n); if (b[k] <= EPS) delete b[k]; settle(v); },
    put: (v, rec) => { const b = v.mochila && typeof v.mochila === 'object' ? v.mochila : (v.mochila = {}); b[rec.k] = r4((b[rec.k] || 0) + rec.n); bags.add(v.id); },
    list: v => v.mochila || {},
    owner: v => ({ fac: G.Fac.idOfV(v), who: v.id, home: v.home }),
    all: () => { const out = []; if (G.S) for (const v of G.S.villagers.values()) if (v.mochila) out.push(v); return out; },
  });
  // (a bag is its owner's: they take and put; the hands of an operation that holds it, by the depot's own rule)
  const may0 = D.may;
  D.may = function (v, ref, mode, opId) {
    if (typeof ref !== 'string' || ref.charCodeAt(0) !== 109 || ref[1] !== ':') return may0.apply(this, arguments);
    const r = may0.apply(this, arguments); if (r.ok) return r;
    if (!D.exists(ref) || !v) return { ok: false, why: 'não existe' };
    return D.parse(ref)[1] === v.id ? { ok: true } : { ok: false, why: 'É de outra pessoa.' };
  };
  // A thing never enters a people's store as a thing (D-371): put into it — by a hand, by a porter who found it on the ground,
  // by a house emptied into the store — it is counted as what it is worth there, its good (an axe, one of ferramentas): the thing
  // leaves the world ('@uso') and the good comes in ('@mundo'), two lines of the ledger with the same cause; what the store has
  // no room for is not made, as any delivery (G.Depot.store). One door for every way a thing reaches a store
  const move0 = D.move;
  D.move = function (from, to, k, n, c) {
    if (typeof to === 'string' && to.charCodeAt(0) === 102 && to[1] === ':' && isThing(k)) return intoStore(from, to, k, n, c);
    return move0.apply(this, arguments);
  };
  function intoStore(from, to, k, n, c) {
    c = c || {}; const L = It.feitoDe(k);
    if (!D.exists(from)) return { ok: false, n: 0, why: 'a origem não existe mais' };
    if (!D.exists(to)) return { ok: false, n: 0, why: 'o destino não existe mais' };
    const m = Math.floor(Math.min(n, D.get(from, k)) + EPS); if (!(m >= 1)) return { ok: false, n: 0, why: 'não há' };
    if (!c.part && m + EPS < Math.floor(n + EPS)) return { ok: false, n: 0, why: 'não há tanto' };
    const code = c.code || 'coisa', by = c.by || 0;
    const u = D.use(from, k, m, { code, by, mine: true, key: c.key ? c.key + ':u' : undefined });
    if (!u.ok) return u;
    // (what it is made of comes back, each good with its part — the bronze of a bronze axe, the stone and the wood of a stone one: 20h)
    if (L) L.forEach((o, i) => { if (o.n > 0) D.make(to, o.k, r4(o.n * m), { code, by, part: true, of: o.of || undefined, key: c.key ? c.key + ':m' + (i ? i : '') : undefined }); });
    return { ok: true, n: m, e: u.e };
  }
  // (the weight of a thing in the arms — the depot counts loads in units of six kilos —, and its name in every sentence of the
  // economy: «Levando um machado de ferro ao armazém», never its key)
  const weight0 = D.weight;
  D.weight = (k, n) => (isThing(k) ? It.peso(k, n || 0) / 6 : weight0(k, n));
  const E = G.Eco; const name0 = E.name;
  E.name = k => (isThing(k) ? It.nome(k) : name0(k));

  // ============================== the equipment kept true ==============================
  // what the equipment says, made true against the bag and the body — after every change of the bag, in the round of the
  // world, on a load: a place names a thing of the bag that fits it (as many places for a key as the bag has of it, the hands
  // first); a thing of two hands leaves the other hand empty; a load in the arms empties the hands (what they held goes where it
  // is put away — the back, the belt — or into the bag); the hotbar names things of the bag, each once. Writes only the
  // person's own equipment and bag (the guard's rule 111); draws no chance
  function settle(v) {
    if (!v) return;
    if (v.mochila !== undefined && v.mochila !== null) {
      const b = v.mochila; if (typeof b !== 'object' || Array.isArray(b)) v.mochila = undefined;
      else if (!hasAny(b)) v.mochila = undefined;
    } else if (v.mochila === null) v.mochila = undefined;
    const e = v.equip; if (!e) { if (e !== undefined) v.equip = undefined; return; }
    if (typeof e !== 'object' || Array.isArray(e)) { v.equip = undefined; return; }
    const bag = v.mochila || {}; const left = {};
    for (const k in bag) left[k] = Math.floor(bag[k] + EPS);
    for (const s of KEEP) { const k = e[s]; if (typeof k === 'string' && isThing(k) && It.fits(k, s) && left[k] >= 1) left[k]--; else e[s] = null; }
    const two = k => !!k && It.def(k).maos >= 2;
    if (two(e.mao) && e.outra) off(e, 'outra');
    if (two(e.outra) && e.mao) off(e, 'mao');
    if (loaded(v)) { if (e.mao) off(e, 'mao'); if (e.outra) off(e, 'outra'); }
    let q = e.atalhos; if (!Array.isArray(q) || q.length !== NQUICK) { const was = Array.isArray(q) ? q : []; q = e.atalhos = []; for (let i = 0; i < NQUICK; i++) q.push(was[i] === undefined ? null : was[i]); }
    const seen = new Set(); for (let i = 0; i < NQUICK; i++) { const k = q[i]; if (typeof k === 'string' && bag[k] > EPS && !seen.has(k)) seen.add(k); else q[i] = null; }
    if (!fin(e.kit) || e.kit < 0) e.kit = 0;
    for (const x in e) if (!EQ_KEYS.has(x)) delete e[x];
    if (!e.kit && !SLOTS.some(s => e[s]) && !q.some(Boolean)) v.equip = undefined;
  }
  const EQ_KEYS = new Set(SLOTS.concat(['atalhos', 'kit']));
  Inv.settle = v => settle(v);
  // (a place let go: what it held goes where it is put away, if that is free — else into the bag, unplaced)
  function off(e, s) { const k = e[s]; e[s] = null; if (!k) return null; const g = It.guarda(k); const to = g && !e[g] && It.fits(k, g) ? g : STOWS.find(x => !e[x] && It.fits(k, x)) || null; if (to) e[to] = k; return to; }
  // (the equipment of someone who has none yet: an empty one)
  const eqOf = v => { if (!v.equip || typeof v.equip !== 'object') v.equip = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, atalhos: [null, null, null, null, null], kit: 0 }; return v.equip; };
  // a load comes into the arms by the depot: the hands are emptied at once, in the same step (the round below catches the loads
  // the world still puts in the arms by hand)
  D.onMove.push(e => {
    const to = e[4]; if (typeof to !== 'string' || to.charCodeAt(0) !== 118 || to[1] !== ':') return;
    const v = G.S.villagers.get(+to.slice(2)); if (v && v.equip && (v.equip.mao || v.equip.outra) && loaded(v)) settle(v);
  });
  // the round of the world, once a second: the equipment of everyone with a bag kept true (a load put in the arms by a hand of
  // the world's that does not pass by the depot — the wood, the berries, the stone —, the years, a damaged save)
  A.hooks.tick.push(function () {
    if (!bags.size) return;
    for (const id of [...bags]) { const v = G.S.villagers.get(id); if (!v || (!v.mochila && !v.equip)) { bags.delete(id); continue; } settle(v); }
  });

  // ============================== the doors of the world ==============================
  // (every door that changes the world: only in the world's step — the body asks through its hands, G.Possess.apply; one asked
  // from a frame or a panel is refused, and counted: Inv.outside, read by the checker)
  const inStep = () => { if (G.inSim > 0) return true; outside++; return false; };
  const NO_STEP = { ok: false, why: 'Agora não.' };
  const alive = v => !!(v && G.S.villagers.has(v.id));
  const ME = v => 'm:' + v.id;
  const nameOf = k => It.nome(k);
  // the hand a thing goes to (its own: the shield, the bow, the torch in the other), its place on the body when it is worn
  const handOf = k => It.mao(k);
  // put a thing of the bag in a place of the body. slot: where (none: the hand it is held in, or where it is worn). What the
  // place held goes where it is put away (or into the bag); a thing of two hands empties the other hand; the same thing taken
  // from another place (drawn from the back: one of it in the bag, it moves). → { ok, why, slot }
  Inv.equip = function (v, key, slot) {
    if (!inStep()) return NO_STEP;
    if (!alive(v)) return { ok: false, why: 'Ninguém para equipar.' };
    const k = It.canon(key); if (!k || !isThing(k)) return { ok: false, why: 'Isso não se equipa.' };
    const s = slot || handOf(k) || It.veste(k) || It.guarda(k);
    if (!s || !SLOTS.includes(s)) return { ok: false, why: `${G.cap(nameOf(k))} não se equipa.` };
    if (!It.fits(k, s)) return { ok: false, why: `${G.cap(nameOf(k))} não vai ${{ mao: 'na mão', outra: 'na outra mão', costas: 'nas costas', cinto: 'no cinto', cabeca: 'na cabeça', corpo: 'no corpo' }[s]}.` };
    const have = Inv.count(v, k); if (!(have >= 1)) return { ok: false, why: `Você não tem ${nameOf(k)}.` };
    if (HANDS.includes(s) && loaded(v)) return { ok: false, why: 'As mãos estão ocupadas com a carga.' };
    const e = eqOf(v);
    if (e[s] === k) return { ok: true, slot: s, same: true };
    // (the same thing from another place, when the bag has no other one of it)
    const used = SLOTS.filter(x => e[x] === k).length;
    if (used >= Math.floor(have + EPS)) { const from = KEEP.slice().reverse().find(x => x !== s && e[x] === k); if (from) e[from] = null; }
    if (e[s]) { if (HANDS.includes(s)) off(e, s); else e[s] = null; }
    if (HANDS.includes(s)) {
      const other = s === 'mao' ? 'outra' : 'mao';
      if (It.def(k).maos >= 2 && e[other]) off(e, other);
      else if (e[other] && It.def(e[other]).maos >= 2) off(e, other);
    }
    e[s] = k; bags.add(v.id); settle(v);
    return v.equip && v.equip[s] === k ? { ok: true, slot: s } : { ok: false, why: 'Não coube.' };
  };
  // take a thing off a place: it stays in the bag, unplaced
  Inv.unequip = function (v, slot) {
    if (!inStep()) return NO_STEP;
    const e = v && v.equip; if (!alive(v) || !e || !SLOTS.includes(slot) || !e[slot]) return { ok: false, why: 'Não há nada aí.' };
    const k = e[slot]; e[slot] = null; settle(v); return { ok: true, k };
  };
  // put away what a hand holds (sheathe): to the back or the belt, where it rides; with no place free, into the bag
  Inv.stow = function (v, hand) {
    if (!inStep()) return NO_STEP;
    const e = v && v.equip; const hs = hand ? [hand] : HANDS; if (!alive(v) || !e || !hs.some(h => e[h])) return { ok: false, why: 'As mãos estão vazias.' };
    const out = []; for (const h of hs) if (e[h]) { const k = e[h]; out.push([k, off(e, h)]); }
    settle(v); return { ok: true, put: out };
  };
  // take in the hand what rides on the back or the belt (draw): the weapon first, then the tool — and, for a weapon of one hand,
  // the shield from the back into the other hand
  Inv.draw = function (v) {
    if (!inStep()) return NO_STEP;
    const e = v && v.equip; if (!alive(v) || !e) return { ok: false, why: 'Não há nada guardado.' };
    if (loaded(v)) return { ok: false, why: 'As mãos estão ocupadas com a carga.' };
    if (e.mao) return { ok: false, why: 'A mão já está ocupada.' };
    const pick = tag => STOWS.map(s => e[s]).find(k => k && handOf(k) === 'mao' && (!tag || It.has(k, tag)));
    const k = pick('lutar') || pick('golpe') || pick(null); const bow = !k && STOWS.map(s => e[s]).find(x => x && handOf(x) === 'outra' && It.has(x, 'atirar'));
    if (!k && !bow) return { ok: false, why: 'Não há nada para sacar.' };
    const r = Inv.equip(v, k || bow, k ? 'mao' : 'outra'); if (!r.ok) return r;
    const sh = k && It.def(k).maos < 2 && !e.outra ? STOWS.map(s => e[s]).find(x => x && It.has(x, 'bloquear')) : null;
    if (sh) Inv.equip(v, sh, 'outra');
    return { ok: true, k: k || bow };
  };
  // the one key of the fight to come (guardar, wave 2): the hands full → put away; empty → draw
  Inv.toggle = function (v) { if (!inStep()) return NO_STEP; const e = v && v.equip; return e && (e.mao || e.outra) ? Inv.stow(v) : Inv.draw(v); };
  // a quick thing of the hotbar (1 to 5, i from 0): in the hand → put away; in the bag or on the back → in its hand; something
  // worn → on and off. → { ok, why, k, did: 'mao' | 'guardou' | 'vestiu' | 'tirou' }
  Inv.quick = function (v, i) {
    if (!inStep()) return NO_STEP;
    const e = v && v.equip; const k = e && Array.isArray(e.atalhos) ? e.atalhos[i] : null;
    if (!alive(v) || !k) return { ok: false, why: `Atalho ${i + 1} vazio — arraste uma coisa da mochila para ele.` };
    if (!(Inv.count(v, k) >= 1)) return { ok: false, why: `Você não tem mais ${nameOf(k)}.` };
    const h = handOf(k), w = It.veste(k);
    if (h) {
      const held = HANDS.find(x => e[x] === k);
      if (held) { const r = Inv.stow(v, held); return Object.assign(r, { k, did: 'guardou' }); }
      const r = Inv.equip(v, k, h); return Object.assign(r, { k, did: 'mao' });
    }
    if (w) { if (e[w] === k) { const r = Inv.unequip(v, w); return Object.assign(r, { k, did: 'tirou' }); } const r = Inv.equip(v, k, w); return Object.assign(r, { k, did: 'vestiu' }); }
    return { ok: false, why: `Não dá para usar ${nameOf(k)} assim — ainda.`, k };
  };
  // give a place of the hotbar a thing of the bag (null: empty it); a thing is in one place of the hotbar at a time
  Inv.shortcut = function (v, i, key) {
    if (!inStep()) return NO_STEP;
    if (!alive(v) || !(i >= 0 && i < NQUICK)) return { ok: false, why: 'Não há esse atalho.' };
    const k = key === null || key === undefined ? null : It.canon(key);
    if (k !== null && !(Inv.count(v, k) > EPS)) return { ok: false, why: 'Isso não está na mochila.' };
    const e = eqOf(v); const q = e.atalhos;
    if (k !== null) for (let j = 0; j < NQUICK; j++) if (q[j] === k) q[j] = null;
    q[i] = k; bags.add(v.id); settle(v); return { ok: true, i, k };
  };

  // ------------------------------ the bag and the world: every move in the ledger ------------------------------
  // (things move whole; goods as they are)
  const whole = (k, n) => (isThing(k) ? Math.floor((n === undefined ? 1 : n) + EPS) : r4(n === undefined ? 1 : n));
  // (within the hands' reach of a holder: a building's walls or door — or inside it —, a person beside one, the people's store by
  // Inv.storeNear; a holder of another kind — a ship's hold, a quay — is the asker's own rule to reach)
  Inv.HAND_R = 3;
  const nearB = (v, b) => !!b && (v.inside === b.id || Math.hypot(Math.max(b.x - v.x, 0, v.x - (b.x + b.w)), Math.max(b.y - v.y, 0, v.y - (b.y + b.h))) <= Inv.HAND_R);
  Inv.reaches = function (v, ref) {
    const [kind, id] = D.parse(ref); const S = G.S;
    if (kind === 'h' || kind === 'b') return nearB(v, S.buildings.get(id));
    if (kind === 'z') { const z = D.zOf(id); return !!z && nearB(v, S.buildings.get(z.b)); }
    if (kind === 'f') return !!Inv.storeNear(v) && G.Fac.idOfV(v) === id;
    if (kind === 'm') { const o = S.villagers.get(id); return !!o && (o.id === v.id || G.dist(v.x, v.y, o.x, o.y) <= Inv.HAND_R); }
    return true;
  };
  const FAR = { ok: false, why: 'Longe demais: chegue perto primeiro.' };
  // give a thing (or a good) of one's bag to someone else's, beside one: they must have room. → { ok, why, n }
  Inv.give = function (v, o, key, n) {
    if (!inStep()) return NO_STEP;
    if (!alive(v) || !alive(o) || v.id === o.id) return { ok: false, why: 'Não há a quem dar.' };
    if (o.age < 2) return { ok: false, why: 'Um bebê não segura nada.' };
    const k = It.canon(key); const m = whole(k, n); if (!k || !(m > EPS)) return { ok: false, why: 'Nada a dar.' };
    if (Inv.count(v, k) + EPS < m) return { ok: false, why: `Você não tem ${nameOf(k)}.` };
    if (!Inv.reaches(v, ME(o))) return FAR;
    if (Inv.room(o, k) + EPS < m) return { ok: false, why: `${o.name} não aguenta levar mais.` };
    const r = D.move(ME(v), ME(o), k, m, { code: 'dar', by: v.id });
    return r.ok ? { ok: true, n: r.n } : { ok: false, why: r.why };
  };
  // take from a holder into one's bag — the people's store, one's own house, a shelf one may take from, the ground — by the
  // depot's rule of who may (D.may). A thing «taken» from a store is a thing made of its good: Inv.make. → { ok, why, n }
  Inv.take = function (v, ref, key, n) {
    if (!inStep()) return NO_STEP;
    if (!alive(v)) return { ok: false, why: 'Ninguém para pegar.' };
    const k = It.canon(key); if (!k) return { ok: false, why: 'Isso não se leva.' };
    if (typeof ref === 'string' && ref[0] === 'f' && isThing(k)) return Inv.make(v, It.def(k).kind, It.def(k).mat);
    if (typeof ref === 'string' && ref[0] === 'g') return Inv.pick(v, D.parse(ref)[1]);
    const may = D.may(v, ref, 'take'); if (!may.ok) return { ok: false, why: may.why };
    if (!Inv.reaches(v, ref)) return FAR;
    const have = D.free(ref, k); const want = Math.min(whole(k, n === undefined ? have : n), isThing(k) ? Math.floor(have + EPS) : have);
    if (!(want > EPS)) return { ok: false, why: 'Não há isso aí.' };
    const room = Inv.room(v, k); const m = whole(k, Math.min(want, room));
    if (!(m > EPS)) return { ok: false, why: 'A mochila está cheia.' };
    const r = D.move(ref, ME(v), k, m, { code: 'pegar', by: v.id });
    return r.ok ? { ok: true, n: r.n } : { ok: false, why: r.why };
  };
  // put from one's bag into a holder one may put in (the people's store — a thing counts there as its good —, one's house —
  // kept on its floor if the furniture is full: what the family brings home is never lost for room, D-059 —, a shelf, a stall)
  Inv.put = function (v, ref, key, n) {
    if (!inStep()) return NO_STEP;
    if (!alive(v)) return { ok: false, why: 'Ninguém para guardar.' };
    const k = It.canon(key); const m = whole(k, n); if (!k || !(m > EPS)) return { ok: false, why: 'Nada a guardar.' };
    if (Inv.count(v, k) + EPS < m) return { ok: false, why: `Você não tem ${nameOf(k)}.` };
    const may = D.may(v, ref, 'put'); if (!may.ok) return { ok: false, why: may.why };
    if (!Inv.reaches(v, ref)) return ref[0] === 'f' ? { ok: false, why: 'É preciso estar no armazém do seu povo.' } : FAR;
    const r = D.move(ME(v), ref, k, m, { code: ref[0] === 'f' ? 'devolveu' : 'guardou', by: v.id, floor: ref[0] === 'h' });
    return r.ok ? { ok: true, n: r.n } : { ok: false, why: r.why === 'não cabe' ? 'Não cabe aí.' : r.why };
  };
  // (where a body stands that a thing can lie: dry ground, out of doors, not aboard, not under the ground)
  const onGround = v => !v.aboard && !v.inside && !v.ug && !v.air && G.W.inb(v.x, v.y) && G.W.walkableXY(v.x, v.y);
  // let a thing fall on the ground where one stands (a thing that lies there, G.Depot's 'g:', for any hand to pick up — the
  // town's porters do not take what someone set down on purpose: no people's mark). → { ok, why, g: its id }
  Inv.drop = function (v, key, n) {
    if (!inStep()) return NO_STEP;
    if (!alive(v)) return { ok: false, why: 'Ninguém para largar.' };
    const k = It.canon(key); const m = whole(k, n); if (!k || !(m > EPS)) return { ok: false, why: 'Nada a largar.' };
    if (Inv.count(v, k) + EPS < m) return { ok: false, why: `Você não tem ${nameOf(k)}.` };
    if (!onGround(v)) return { ok: false, why: 'Aqui não dá para largar nada no chão.' };
    const r = D.drop(ME(v), k, m, v.x, v.y, { code: 'largou', by: v.id, fac: 0 });
    return r.ok ? { ok: true, n: r.n, g: r.g } : { ok: false, why: r.why };
  };
  // the things lying within reach of someone (the nearest first): [{ g, k, n, d (metres-free distance in tiles) }] — read only
  Inv.REACH = 1.6;
  Inv.near = function (v, r) {
    const L = (G.S && G.S.loose) || []; const R = r === undefined ? Inv.REACH : r; const out = [];
    if (!v) return out;
    for (const o of L) { if (o.op || !(o.n > EPS) || o.k === 'water') continue; const d = G.dist(v.x, v.y, o.x, o.y); if (d <= R) out.push({ g: o.id, k: o.k, n: o.n, d: r2(d) }); }
    return out.sort((a, b) => a.d - b.d || a.g - b.g);
  };
  // pick up what lies on the ground within reach (not an operation's crate: the porters' errand), as much as the bag takes
  Inv.pick = function (v, gid, n) {
    if (!inStep()) return NO_STEP;
    if (!alive(v)) return { ok: false, why: 'Ninguém para pegar.' };
    const o = ((G.S && G.S.loose) || []).find(x => x.id === gid);
    if (!o || !(o.n > EPS)) return { ok: false, why: 'Não está mais aí.' };
    if (o.op) return { ok: false, why: 'É carga de um serviço.' };
    if (o.k === 'water' || o.k === 'moedas' || !It.def(o.k)) return { ok: false, why: 'Isso não vai na mochila.' };
    if (G.dist(v.x, v.y, o.x, o.y) > Inv.REACH + 0.4) return { ok: false, why: 'Longe demais.' };
    const m = whole(o.k, Math.min(n === undefined ? o.n : n, o.n, Inv.room(v, o.k)));
    if (!(m > EPS)) return { ok: false, why: 'A mochila está cheia.' };
    const r = D.move('g:' + o.id, ME(v), o.k, m, { code: 'apanhou', by: v.id });
    return r.ok ? { ok: true, n: r.n, k: o.k } : { ok: false, why: r.why };
  };
  // the store of one's own people within reach (the nearest store building of the person's town — its walls and its door
  // count —, or the one the person is in): the store one takes a tool from, or gives it back to. → the building, or null
  Inv.STORE_R = 3;
  Inv.storeNear = function (v) {
    if (!v || !v.set) return null; const fid = G.Fac.idOfV(v); let best = null, bd = 1e9;
    for (const b of G.Village.dropoffs()) {
      if (G.Village.facOfSet(b.set) !== fid) continue;
      const dx = Math.max(b.x - v.x, 0, v.x - (b.x + b.w)), dy = Math.max(b.y - v.y, 0, v.y - (b.y + b.h)); const d = v.inside === b.id ? 0 : Math.hypot(dx, dy);
      if (d <= Inv.STORE_R && d < bd) { bd = d; best = b; }
    }
    return best;
  };
  // what the people's store would give of a kind now — only read: the door below, the screen, the body's offer. The material:
  // the one asked, or the best the store has what it is made of — a thing of bronze is one of the store's bronze tools or
  // weapons, of stone the stone and the wood (never «the best the people knows»: 20h, D-442), and the metal's art too.
  // → { k: the key, can, need: [{ k, n, of }], why }
  Inv.offer = function (v, kind, mat, n) {
    const K = It.KINDS[kind]; if (!K || !v) return { k: null, can: false, need: [], why: 'Isso não existe.' };
    const fid = G.Fac.idOfV(v); const F = 'f:' + fid; const arts = artsOf(v);
    if (!kindOK(kind, fid, arts)) return { k: null, can: false, need: [], why: `O seu povo não sabe fazer ${K.plural}.` };
    if (mat && !K.mats.includes(mat)) return { k: null, can: false, need: [], why: `Não existe ${K.nome} ${It.MATS[mat] ? It.MATS[mat].nome : mat}.` };
    const cnt = Math.max(1, Math.floor((n === undefined ? (kind === 'flecha' ? 20 : 1) : n) + EPS));
    const have = o => (o.of && Or() ? Or().free(F, o.k, o.of) : D.free(F, o.k));
    const art = m => !It.METALS[m] || !!(arts && arts[m] !== undefined);
    const can = m => { const L = It.feitoDe(It.keyOf(kind, m)); return !!L && art(m) && L.every(o => have(o) + EPS >= r4(o.n * cnt)); };
    const need = key => (It.feitoDe(key) || []).map(o => ({ k: o.k, n: r4(o.n * cnt), of: o.of || null }));
    const m = mat || It.bestOf(kind, can);
    if (m && can(m)) { const key = It.keyOf(kind, m); return { k: key, can: true, need: need(key), n: cnt, why: '' }; }
    // (none: what it would take, in the material asked or the plainest the people may make)
    const m2 = mat || It.bestOf(kind, x => art(x) && matOK(fid, x, arts)) || K.mats[0]; const key = It.keyOf(kind, m2);
    const what = need(key).map(o => G.Eco.name(o.k) + (o.of && Or() && Or().METAL[o.of] ? ' ' + Or().METAL[o.of].nome : '')).join(' e ');
    if (!art(m2)) return { k: key, can: false, need: need(key), n: cnt, why: `O seu povo não sabe fazer ${It.nome(key, 2)}.` };
    return { k: key, can: false, need: need(key), n: cnt, why: `Não há ${what} no armazém para ${It.nome(key, cnt)}.` };
  };
  // a store's good made a thing (D-371, D-442): at a store of one's own people (Inv.storeNear), what Inv.offer says — the goods
  // out of the store ('@uso'), the thing into the bag ('@mundo'), the same cause ('coisa'). Both or neither: the store has them
  // free, the bag takes it. n: how many (the arrows come by the score). → { ok, why, k, n }
  Inv.make = function (v, kind, mat, n) {
    if (!inStep()) return NO_STEP;
    if (!alive(v)) return { ok: false, why: 'Ninguém para pegar.' };
    const K = It.KINDS[kind]; if (!K) return { ok: false, why: 'Isso não existe.' };
    const st = Inv.storeNear(v); if (!st) return { ok: false, why: 'É preciso estar no armazém do seu povo.' };
    const fid = G.Fac.idOfV(v); const F = 'f:' + fid;
    const may = D.may(v, F, 'take'); if (!may.ok) return { ok: false, why: may.why };
    const o = Inv.offer(v, kind, mat, n); if (!o.can) return { ok: false, why: o.why };
    const key = o.k; const cnt = o.n;
    if (Inv.room(v, key) < cnt) return { ok: false, why: 'A mochila está cheia.' };
    const by = v.id; const used = [];
    for (const x of o.need) {
      const u = D.use(F, x.k, x.n, { code: 'coisa', by, of: x.of || undefined });
      if (!u.ok) { for (const y of used) D.make(F, y.k, y.n, { code: 'desfeito', by, part: true, of: y.of || undefined }); return { ok: false, why: u.why }; }
      used.push(x);
    }
    const r = D.make(ME(v), key, cnt, { code: 'coisa', by });
    if (!r.ok) { for (const y of used) D.make(F, y.k, y.n, { code: 'desfeito', by, part: true, of: y.of || undefined }); return { ok: false, why: r.why }; } // (checked a moment ago: never half a deal)
    return { ok: true, k: key, n: cnt };
  };
  // a thing given back to the people's store, counted as its good (the same door any thing reaches a store by: D.move)
  Inv.unmake = function (v, key, n) {
    if (!inStep()) return NO_STEP;
    const st = alive(v) ? Inv.storeNear(v) : null; if (!st) return { ok: false, why: 'É preciso estar no armazém do seu povo.' };
    const k = It.canon(key); if (!k || !isThing(k) || !It.bemOf(k)) return { ok: false, why: 'O armazém não guarda isso.' };
    return Inv.put(v, 'f:' + G.Fac.idOfV(v), k, n);
  };
  // the trade's things made real (D-374): the first time the god lives a body, the things that are the person's by trade
  // (Inv.trade: the lumberjack's axe, the warrior's spear, shield and helmet) become things of their bag, in their places, in the
  // ledger ('kit', born of the world: they were the person's already, unseen) — once in a life, never twice (equip.kit, the day);
  // with nothing of the trade, nothing is made and nothing is marked. What else the body wants comes from the store, the market,
  // the ground. → the keys made
  Inv.realize = function (v) {
    if (!inStep() || !alive(v)) return [];
    if (v.equip && v.equip.kit) return [];
    const t = Inv.trade(v); const out = [];
    for (const s of SLOTS) {
      const k = t[s]; if (!k || !isThing(k)) continue;
      const r = D.make(ME(v), k, 1, { code: 'kit', by: v.id });
      if (!r.ok) continue;
      const e = eqOf(v); if (!e[s] && It.fits(k, s)) e[s] = k;
      out.push(k);
    }
    if (out.length) {
      const e = eqOf(v); e.kit = G.S.day || 1; bags.add(v.id);
      // (the hotbar gets the things made, in the order of their places)
      let i = 0; for (const k of out) { while (i < NQUICK && e.atalhos[i]) i++; if (i >= NQUICK) break; if (!e.atalhos.includes(k)) e.atalhos[i++] = k; }
      settle(v);
    }
    return out;
  };
  // (the god takes a body: its trade's things become real now — in the world's step, the overseer's: G.Act.possessed)
  A.hooks.possess.push((id, on) => { if (on && G.S) Inv.realize(G.S.villagers.get(id)); });

  // ------------------------------ the dead ------------------------------
  // (activity.js calls it from the one door out of the world, G.Village.kill, before the person leaves it) D-375: the things of
  // the dead go where the family is when they die among their own — on their town's ground, or by the house —: to the house
  // they lived in, as the coins of the dead do (on its floor if the furniture is full: nothing of the family's is lost for room,
  // D-059); fallen elsewhere — the field of a battle, the woods, the road —, on the ground where they fell, with their people's
  // mark: the town's hands bring what lies within their walk to the store, counted as its good (L-408, D-371), and any hand may
  // pick it up first. Where nothing lies — the water, a deck, a cave, indoors away from home —: to the house, else the people's
  // store (as its good), else they are lost with the cause in the ledger. The equipment goes with them
  Inv.onDeath = function (v, cause) {
    if (!v || !G.S.villagers.has(v.id)) return;
    const bag = v.mochila;
    if (bag && typeof bag === 'object') {
      const S = G.S; const ref = ME(v); const fid = G.Fac.idOfV(v);
      const home = v.home && S.buildings.get(v.home); const H = home && home.type !== 'ruin' && D.exists('h:' + home.id) ? 'h:' + home.id : null;
      const q = G.Urban && G.Urban.at && G.W.inb(v.x, v.y) ? G.Urban.at(v.x, v.y) : null;
      const near = !!H && ((q && q.set === home.set) || G.dist(v.x, v.y, home.x + home.w / 2, home.y + home.h / 2) <= 12);
      const by = v.id;
      for (const k of Object.keys(bag).sort()) {
        const n = bag[k]; if (!(n > EPS)) continue;
        if (near) { D.move(ref, H, k, n, { code: 'herdado', by, part: true, floor: true }); continue; }
        if (onGround(v)) { D.drop(ref, k, n, v.x, v.y, { code: 'caiu', by, fac: fid }); continue; }
        if (H) D.move(ref, H, k, n, { code: 'herdado', by, part: true, floor: true });
        if (Inv.count(v, k) > EPS && fid && D.exists('f:' + fid)) D.move(ref, 'f:' + fid, k, Inv.count(v, k), { code: 'herdado', by, part: true });
        if (Inv.count(v, k) > EPS) D.use(ref, k, Inv.count(v, k), { code: 'perdido', by, mine: true });
      }
    }
    v.mochila = undefined; v.equip = undefined; bags.delete(v.id);
    void cause;
  };

  // ============================== the save ==============================
  // The bag and the equipment go with their person (the whole person is saved; SHAPE has both). A damaged save is made whole on
  // loading (D-376): a bag is an object of known keys (the catalog's or the economy's), in their canonical spelling, each a finite
  // count above zero — a thing whole —, at most MAXK keys and never beyond the limit the person ever had (what is over is let go,
  // the last of the catalog's order first: a damaged save, not the world, put it there); the equipment has only its own places,
  // each naming a thing of the bag that fits it, a hotbar of five, a mark of the kit that is a day. A save from before has none
  // of this: nobody carries anything, and the trade's kit is what they hold
  const MAXK = 48, MAXN = 9999;
  function repair(v) {
    let b = v.mochila;
    if (b !== undefined) {
      const clean = {};
      if (b && typeof b === 'object' && !Array.isArray(b)) for (const k0 of Object.keys(b)) {
        const k = It.canon(k0); const n = b[k0]; if (!k || k === 'water' || k === 'moedas' || !fin(n) || n <= EPS) continue;
        clean[k] = Math.min(MAXN, r4((clean[k] || 0) + (isThing(k) ? Math.floor(n + EPS) : n)));
        if (!(clean[k] > EPS)) delete clean[k];
      }
      const keys = Object.keys(clean).sort((x, y) => (ORD[x] !== undefined ? ORD[x] : 1e4) - (ORD[y] !== undefined ? ORD[y] : 1e4) || (x < y ? -1 : 1));
      for (const k of keys.slice(MAXK)) delete clean[k];
      v.mochila = clean;
      const peak = Inv.capPeak(v);
      for (let i = Math.min(keys.length, MAXK) - 1; i >= 0 && Inv.weight(v) > peak + EPS; i--) {
        const k = keys[i]; const per = It.peso(k, 1); const over = Inv.weight(v) - peak;
        const cut = isThing(k) ? Math.min(clean[k], Math.ceil((over - EPS) / per)) : Math.min(clean[k], r4(over / per + 1e-4));
        clean[k] = r4(clean[k] - cut); if (clean[k] <= EPS) delete clean[k];
      }
      if (!hasAny(clean)) v.mochila = undefined;
    }
    const e = v.equip;
    if (e !== undefined) {
      if (!e || typeof e !== 'object' || Array.isArray(e)) v.equip = undefined;
      else { for (const s of SLOTS) if (typeof e[s] === 'string') { const c = It.canon(e[s]); e[s] = c; } settle(v); return; }
    }
    settle(v);
  }
  Inv.repair = repair;
  (G.saveHooks = G.saveHooks || []).push({
    save() { },
    load() { if (!G.S) return; for (const v of G.S.villagers.values()) if (v.mochila !== undefined || v.equip !== undefined) repair(v); index(); },
  });
})(window.G);
