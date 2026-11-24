'use strict';
// ============================================================
//  Atmos: what the air, the walls and the clothes say of what
//  really happens — read from the world, never written. The
//  smoke over a roof has a fire under it (a batch burning in the
//  kiln, the forge hot, the furnace of the baths, the tavern
//  open, someone at the house's fire); a window is lit by someone
//  awake behind it; what lies about a house is what its people
//  and their trades have; a wall is as old as its years, as damp
//  as the water by it, as kept as its quarter. And what a person
//  wears beyond their trade: their standing among their people,
//  what their people can make, the cold, the drink.
//  The god's view and the body's 3D ask the same questions here,
//  so both show the same cause. Pure: no chance of any kind, no
//  writing — the same world, the same answers (D-162 to D-165).
//  What a building shows inside (At.within) is the core and the
//  rules of its use and of the trades that work in it — At.withinRule,
//  At.oficioRule, a wave's in a file of its own —, with the true
//  readings (At.guardado, At.oficio): the interiors 3, F7 (D-1010,
//  D-1011; the manual: planos/interiores-3-decoracao.md).
// ============================================================
(function (G) {
  const W = G.W, T = G.T;
  const At = G.Atmos = {};
  const EPS = 1e-6, NONE = Object.freeze([]), NOINV = Object.freeze({});

  // ------------------------------ who is where, this instant ------------------------------
  // (one pass over the people for every question of the same instant of the world: who is inside each building — awake, at
  // the house's fire, cooking —, who has each house for home and their trades)
  let cen = null, cenS = null, cenK = -1, cenN = -1;
  const drop = () => { cen = null; cenS = null; fir = null; firS = null; arts.clear(); now.clear(); nowS = null; wet.clear(); win.clear(); winS = null; };
  G.worldHooks.push(drop);
  At.flush = drop; // (for the proofs: the world changed by hand within the same instant)
  function census() {
    const S = G.S; if (cen && cenS === S && cenK === S.clock && cenN === S.villagers.size) return cen;
    const ins = new Map(), homes = new Map(), jobs = new Map();
    for (const v of S.villagers.values()) {
      if (v.job > 0) { const j = jobs.get(v.job); if (j) j.push(v); else jobs.set(v.job, [v]); } // (who works in each building: its post, economy.js E.place)
      if (v.inside > 0) {
        let e = ins.get(v.inside); if (!e) ins.set(v.inside, e = { n: 0, awake: 0, cook: 0, hearth: 0 });
        e.n += 1;
        if (!v.sleeping) {
          e.awake += 1; const t = v.task;
          // (the evening at home, act-lar.js: the cook over the fire; the others by it — «junto ao fogo» —, all but the one in bed)
          if (t && t.type === 'lar' && t.st >= 2 && t.home === v.inside) { if (t.what === 'cozinhar') e.cook += 1; else if (t.what !== 'acamado') e.hearth += 1; }
        }
      }
      if (v.home > 0) {
        let hm = homes.get(v.home); if (!hm) homes.set(v.home, hm = { res: 0, roles: [] });
        // (the trade a house shows is the one its people keep: who an emergency called away — the war, the hunger, the great work,
        // village.js — has the trade he goes back to, v.roleBack; the woodcutter's pile does not leave the door with him, D-195)
        const r = v.roleBack || v.role;
        hm.res += 1; if (r && v.age >= 14 && !v.captive && !hm.roles.includes(r)) hm.roles.push(r);
        (hm.vs || (hm.vs = [])).push(v);
      }
    }
    cen = { ins, homes, jobs }; cenS = S; cenK = S.clock; cenN = S.villagers.size;
    return cen;
  }
  // the kilns, forges and crucibles with a fire in them: a batch at its fire with wood burning (the heat the wood gave not yet
  // spent), or at the hand's work that follows the fire straight away — the iron on the anvil — with someone awake at it
  let fir = null, firS = null, firK = -1;
  function fires() {
    const S = G.S; if (fir && firS === S && firK === S.clock) return fir;
    fir = new Map(); firS = S; firK = S.clock;
    const A = G.Act, O = G.Oficio; if (!A || !O) return fir;
    const ins = census().ins;
    for (const op of A.all()) {
      if (op.def !== 'oficio' || !A.live(op)) continue; const s = O.stage(op); if (!s) continue; const d = op.data; let f = null;
      if (s.kind === 'fogo') { if (d.calor > EPS) f = FIRE.fornada; }
      else if (s.kind === 'mao' && s.kiln && op.st === 'on') { const R = O.rx(op); const p = R && R.st[d.s - 1]; const e = ins.get(op.at); if (p && p.kind === 'fogo' && e && e.awake > 0) f = FIRE.forja; }
      if (f && !(fir.get(op.at) && fir.get(op.at).k >= f.k)) fir.set(op.at, f);
    }
    return fir;
  }

  // ------------------------------ the fire under the smoke ------------------------------
  // why: what burns; k: how much smoke it makes (1 a kiln, a furnace, a kitchen at work; less, a hearth one sits by)
  const FIRE = At.FIRE = Object.freeze({
    fogueira: Object.freeze({ why: 'fogueira', k: 1, txt: 'a fogueira da cidade' }),
    fornada: Object.freeze({ why: 'fornada', k: 1, txt: 'lenha ardendo no forno de uma fornada' }),
    forja: Object.freeze({ why: 'forja', k: 0.7, txt: 'a forja quente, o ferro na bigorna' }),
    fornalha: Object.freeze({ why: 'fornalha', k: 1, txt: 'a fornalha dos banhos acesa' }),
    taverna: Object.freeze({ why: 'taverna', k: 1, txt: 'a taverna aberta' }),
    cozinha: Object.freeze({ why: 'cozinha', k: 1, txt: 'alguém cozinhando a ceia' }),
    lareira: Object.freeze({ why: 'lareira', k: 0.5, txt: 'gente acordada junto ao fogo da casa' }),
  });
  const housing = b => !!(G.BDEF[b.type] && G.BDEF[b.type].housing);
  // (where a household lives: a house of the town's, or the seat of who rules — its kitchen and its hearth burn as a house's, T-931)
  const lodges = b => G.Village.bedsOf(b) > 0;
  // (the New Fire: every flame of the town is out until it is lit again — festivals.js)
  const dark = b => !!(G.Fest && G.Fest.darkB && G.Fest.darkB(b));
  // the fire a building has burning now, or null: a building at rest does not smoke
  At.fire = function (b) {
    if (!b || !b.built || b.type === 'ruin' || dark(b)) return null;
    if (b.type === 'campfire') return FIRE.fogueira;
    if (b.type === 'banhos') return G.Termas && G.Termas.quente(b) ? FIRE.fornalha : null;
    if (b.type === 'taverna') return G.Taverna && G.Taverna.aberta(b) ? FIRE.taverna : null;
    const f = fires().get(b.id); if (f) return f;
    if (lodges(b)) { const e = census().ins.get(b.id); if (e) return e.cook ? FIRE.cozinha : e.hearth ? FIRE.lareira : null; }
    return null;
  };
  // ------------------------------ the light behind the window ------------------------------
  // how many are awake inside; a window is lit — by night, the view's own measure of it — only with someone awake behind it
  At.awake = b => { const e = b && census().ins.get(b.id); return e ? e.awake : 0; };
  At.inside = b => { const e = b && census().ins.get(b.id); return e ? e.n : 0; };
  At.lit = b => !!b && !!b.built && b.type !== 'ruin' && At.awake(b) > 0 && !dark(b);

  // ------------------------------ what lies about a building ------------------------------
  // only what its people and their trades have: the woodcutter's wood (a house keeps none of its own in the world, D-163),
  // a cask for each drink or oil the house has, the bench and the washing of a house someone lives in, the things of the
  // trades of who lives there; the pots a pottery has drying, the casks of what a tavern has to pour, the baskets of what a
  // market has on its shelf, the nets of a quay that has fishing boats, the rope of one that works
  const DRINK = ['vinho', 'mel', 'cerveja', 'pulque', 'azeite', 'oleo'];
  const POUR = ['vinho', 'mel', 'cerveja', 'pulque'];
  const TRADES = ['lenhador', 'pescador', 'cacador', 'guerreiro', 'arqueiro', 'tecelao', 'agricultor', 'coletor', 'vinhateiro'];
  const SHOP = { mercado: 1, feira: 1, mercado_negro: 1 };
  At.about = function (b) {
    const o = { res: 0, roles: NONE, wood: false, cask: 0, bench: false, wash: 0, pots: 0, casks: 0, baskets: 0, nets: 0, rope: 0, sig: 0 };
    if (!b || !b.built) return o;
    const I = b.inv || NOINV;
    if (housing(b)) {
      const h = census().homes.get(b.id); if (h) { o.res = h.res; o.roles = h.roles; }
      o.wood = o.roles.includes('lenhador');
      for (const k of DRINK) if ((I[k] || 0) >= 1) o.cask++;
      o.bench = o.res > 0; o.wash = o.res > 0 ? Math.min(4, 1 + (o.res >> 1)) : 0;
      let m = 0; TRADES.forEach((r, k) => { if (o.roles.includes(r)) m |= 1 << k; });
      o.sig = m * 64 + Math.min(3, o.cask) * 16 + o.wash * 2 + (o.bench ? 1 : 0);
    } else if (b.type === 'olaria') {
      const sh = G.Oficio && G.Oficio.show ? G.Oficio.show(b) : null; const cru = sh ? sh.cru : 0;
      o.pots = cru > 0 ? G.clamp(Math.ceil(cru / 2), 1, 6) : 0; o.sig = o.pots;
    } else if (b.type === 'taverna') {
      let n = 0; for (const k of POUR) n += I[k] || 0;
      o.casks = n >= 1 ? G.clamp(Math.ceil(n / 3), 1, 3) : 0; o.sig = o.casks;
    } else if (SHOP[b.type]) {
      let n = 0; for (const k in I) if (I[k] >= 1) n++;
      o.baskets = Math.min(4, n); o.sig = o.baskets;
    } else if (b.type === 'doca') {
      let n = 0, any = 0; for (const s of G.S.ships) if (s.dock === b.id) { any++; if (s.kind === 'pesca') n++; }
      o.nets = Math.min(2, n);
      // (the coils of rope of a quay that works: a ship of its own, or its quarter a busy port or a fishing shore — the life
      // of the quarter, G.Urban; a quay at rest keeps its bare posts)
      const U = G.Urban; const q = U && U.at ? U.at(b.x + b.w / 2, b.y + b.h / 2) : null;
      o.rope = any || (q && (U.is(q, 'porto') || U.is(q, 'pesqueiro'))) ? 1 : 0; o.sig = o.nets + 4 * o.rope;
    }
    return o;
  };
  At.ABOUT = { olaria: 1, taverna: 1, mercado: 1, feira: 1, mercado_negro: 1, doca: 1 }; // (besides the houses)

  // ------------------------------ the wear of a building ------------------------------
  // its years (the world's day is its year), the water by its walls, the care of who lives round it — in a few steps each, so
  // that the picture is made again only when a step is crossed
  const AGE = [2, 8, 20, 45]; // (new · some years · a generation · old · ancient)
  const wet = new Map();
  // (the damp of the ground: 2 with water at the walls that sits barely under the floor — it floods —, 1 with water within
  // two tiles, 0 dry; the ground's own, kept until the land changes)
  function dampOf(b) {
    const S = G.S; const m = wet.get(b.id); if (m && m[0] === S.typeVer && m[1] === b.x && m[2] === b.y) return m[3];
    let d = 0; const N = G.N; const gh = W.groundH(b.x + b.w / 2, b.y + b.h / 2);
    for (let y = b.y - 2; y < b.y + b.h + 2 && d < 2; y++) for (let x = b.x - 2; x < b.x + b.w + 2; x++) {
      if (!W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] > T.RIVER) continue;
      const near = x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h;
      const wl = S.type[i] === T.RIVER ? S.wl[i] : G.SEA;
      if (near && gh - wl < 0.9) { d = 2; break; }
      d = 1;
    }
    wet.set(b.id, [S.typeVer, b.x, b.y, d]); if (wet.size > 6000) wet.clear();
    return d;
  }
  // (the care: 2 a kept house — a rich quarter, a dear patch of land, a house of rank —, 0 a neglected one — a quarter in
  // decline or empty, a poor one, the cheapest land, a house nobody lives in, a shack —, 1 the rest)
  function careOf(b) {
    const U = G.Urban; const cx = b.x + b.w / 2, cy = b.y + b.h / 2; let care = 1;
    const q = U && U.at ? U.at(cx, cy) : null;
    if (q) { if (U.is(q, 'decadencia') || U.is(q, 'vazio') || U.is(q, 'pobre')) care = 0; else if (U.is(q, 'nobre')) care = 2; }
    // (the land's worth, from the day's portrait of the town — derived, never saved: none until a town's first day after a load)
    const sn = care === 1 && U && U.peek ? U.peek(b.set) : null; const c = sn && sn.cells ? sn.cells.get(U.cellOf(cx, cy)) : null;
    if (c) { if (c.value >= 62) care = 2; else if (c.value < 28) care = 0; }
    if (b.elite) care = 2;
    if (b.type === 'barraco') care = 0;
    else if (housing(b)) { const h = census().homes.get(b.id); if (!h || !h.res) care = 0; }
    return care;
  }
  // (a building's years — null where the world does not know its birth: a save of before the births were kept, a building
  // made by a proof's hand)
  At.years = b => (b && Number.isFinite(b.born) ? Math.max(0, G.S.day - b.born) : null);
  // one record a combination of the three, kept (ageLv 0..4, dampLv 0..2, care 0..2; what shows of them, 0 to 1: age — the
  // years, more where nobody cares for the walls, less where someone does —, damp, grime — the dirt of the years, none on a
  // new wall, little on a kept one, most where nobody cares —; lv: the combination's own number). Null for a building
  // whose years the world does not know: it is drawn as it always was, by its id
  const WEAR = [], GRIME = [1, 0.5, 0.25];
  At.wear = function (b) {
    const years = At.years(b); if (years === null) return null; let a = 0; while (a < AGE.length && years >= AGE[a]) a++;
    const d = dampOf(b), c = careOf(b), lv = a + 5 * d + 15 * c;
    return WEAR[lv] || (WEAR[lv] = Object.freeze({ ageLv: a, dampLv: d, care: c, age: G.clamp(a / 4 + (1 - c) * 0.25, 0, 1), damp: d / 2, grime: G.clamp(a / 4 * GRIME[c] + (c === 0 ? 0.25 : 0), 0, 1), lv }));
  };
  // (what of a building the near picture is made of, besides its walls: made again when this changes — noWear: a picture
  // that does not show the wear; noAbout: one drawn without what lies about it)
  At.sig = function (b, noWear, noAbout) {
    if (!b || !b.built) return 0;
    const w = noWear ? null : At.wear(b); let s = w ? w.lv + 1 : 0;
    if (!noAbout && (housing(b) || At.ABOUT[b.type])) s = s * 4096 + At.about(b).sig;
    return s;
  };

  // ------------------------------ what one wears, beyond the trade ------------------------------
  // the cold where one stands: the snow's lands, the god's sudden winter, the night and the rain of a cool land — 0 mild,
  // 1 cold (a cloak), 2 freezing (a hood too)
  At.cold = function (x, y) {
    const S = G.S; if (!S || !W.inb(x, y)) return 0; const i = W.idx(x, y); const tp = S.temp ? S.temp[i] / 255 : 0.5;
    let c = tp < 0.2 ? 2 : tp < 0.32 ? 1 : 0;
    if (c < 2 && S.winters && S.winters.length) for (const q of S.winters) if (q.t > 2 && G.dist(x, y, q.x, q.y) <= q.r) { c = 2; break; }
    if (c < 2 && tp < 0.45) { const w = S.weather || NOINV; if (G.isNight() || w.rain > 0.3 || w.storm > 0) c++; }
    return c;
  };
  // the heat where one stands (22c, D-594), 0 mild … 1 scorching: a hot land's (the map's warmth, S.temp, over 0.55) under a sun
  // that is up — its height at the hour, G.Ceu's —, less in the rain, none at night nor in the god's sudden winter. The cold and
  // the heat are one scale: a land warm enough to be hot is never cold (At.cold gives nothing over 0.45) — nobody shivers in it
  const SUN = {};
  At.heat = function (x, y) {
    const S = G.S; if (!S || !W.inb(x, y)) return 0; const i = W.idx(x, y); const tp = S.temp ? S.temp[i] / 255 : 0.5;
    if (tp <= 0.55 || G.isNight()) return 0;
    if (S.winters && S.winters.length) for (const q of S.winters) if (q.t > 2 && G.dist(x, y, q.x, q.y) <= q.r) return 0;
    const w = S.weather || NOINV; if (w.storm > 0) return 0;
    const sun = G.Ceu && G.Ceu.sun ? G.clamp(G.Ceu.sun(S.time, SUN).s / 0.7, 0, 1) : 1;
    return G.clamp((tp - 0.55) / 0.3, 0, 1) * (0.3 + 0.7 * sun) * G.clamp(1 - (w.rain || 0) * 1.4, 0, 1);
  };
  // what a people can make and has: a loom standing in one of its towns — or cloth in its stores, come by trade —, a house of silk
  // or silk in its stores, as the economy found them when the day turned (G.Eco.veste, kept in f.eco.last.veste: the clothes are
  // the day's, and the same before a save and after the load — the memory of the first look of the day was not, L-1714); a people
  // with no record yet (its first instant, a save of before) as its towns are now. And the bronze and the iron it has learnt and
  // had, as the kit has them (G.Origem.had, 20h: never the art alone, and once had, kept)
  const arts = new Map(), now = new Map(); let nowS = null, nowT = NaN; const ARTS0 = Object.freeze({ weave: true, silk: false, metal: 1 }), NOVESTE = Object.freeze({ tear: 0, bicho: 0, pano: 0, seda: 0 });
  function artsOf(f) {
    const S = G.S; const L = f.eco && f.eco.last; let w = L && L.veste;
    if (!w || typeof w !== 'object') { if (nowS !== S || nowT !== S.clock) { nowS = S; nowT = S.clock; now.clear(); } w = now.get(f.id); if (!w) now.set(f.id, w = G.Eco && G.Eco.veste ? G.Eco.veste(f) : NOVESTE); }
    const K = (f.tech && f.tech.known) || NOINV; const had = m => !!(G.Origem && G.Origem.had(f.id, m));
    const weave = w.tear > 0 || w.pano >= 1, silk = w.bicho > 0 || w.seda >= 1, metal = K.ferro !== undefined && had('ferro') ? 2 : K.bronze !== undefined && had('bronze') ? 1 : 0;
    let a = arts.get(f.id); if (!a || a.weave !== weave || a.silk !== silk || a.metal !== metal) arts.set(f.id, a = { weave, silk, metal });
    return a;
  }
  // the standing of a person among their people (polity.js: v.grp), as the clothes tell it
  const GRP = At.GRP = ['', 'povo', 'artesaos', 'mercadores', 'militares', 'sacerdotes', 'nobreza'];
  const DRESS = [];
  const unpack = c => Object.freeze({ code: c, grp: GRP[c & 7], weave: !!(c & 8), silk: !!(c & 16), fur: !!(c & 32), jewel: !!(c & 64), metal: (c >> 7) & 3, cold: (c >> 9) & 3,
    inside: !!(c & 2048), bed: !!(c & 4096), duty: !!(c & 8192), rich: (c >> 14) & 3 });
  // (who has no world round them — a portrait, a proof's bare person — dresses as before: woven, dyed, bronze)
  const NEUTRAL = At.NEUTRAL = unpack(1 + 8 + (1 << 7));
  // what the clothes of a person read of the world besides their trade, their age and their house's coin: their standing,
  // what their people weave and forge, what their house has to wear (silk, furs, jewels), the cold out of doors; and (P6, D-754,
  // D-755) under a roof or in bed — the hat and the helmet come off there, but the helmet of one at their post —, and how well off
  // the house is now (rich: 0 none or a shack, 1 a hut, 2 a house, 3 a house well off — its coins, a merchant house's flag, the
  // ruler): what the dye and the ornament of the clothes show. One small record a combination, kept: its code goes into the
  // outfit's signature
  const POST = new Set(['guard', 'ronda', 'riotguard', 'patrol', 'drill', 'band', 'combat', 'escort', 'prender', 'levar', 'muster']);
  At.POST = POST;
  At.dress = function (v) {
    const S = G.S; if (!S || !S.villagers || !v || !v.id) return NEUTRAL;
    const f = v.set && G.Fac && G.Fac.ofV ? G.Fac.ofV(v) : null; const a = f ? artsOf(f) : ARTS0;
    const h = v.home ? S.buildings.get(v.home) : null; const I = (h && h.inv) || NOINV;
    let c = v.captive || v.age < 16 ? 0 : Math.max(1, GRP.indexOf(v.grp || 'povo'));
    if (a.weave) c |= 8; // (a house's own cloth is worn out within the year: the people's loom and store say what all wear)
    const rich = !!h && (!!h.elite || (h.coin || 0) > 40) || (!!f && f.leader === v.id);
    if (I.seda >= 1 || (a.silk && rich)) c |= 16;
    if (I.peles >= 1 || I.pele_rara >= 1) c |= 32;
    if (I.joias >= 1 || I.perolas >= 1) c |= 64;
    c |= a.metal << 7;
    if (!v.inside && !v.aboard && Number.isFinite(v.x)) c |= At.cold(v.x, v.y) << 9;
    if (v.inside > 0) c |= 2048;
    if (v.sleeping) c |= 4096;
    if (v.task && POST.has(v.task.type) && !v.sleeping) c |= 8192;
    c |= At.richOf(v, h, f) << 14;
    return DRESS[c] || (DRESS[c] = unpack(c));
  };
  // how well off a person's house is now, as the clothes show it (D-755): the ruler, and a merchant house's flag or forty coins in
  // the house (its coins, h.coin — the house's own, only read) the most; a house with some coins; a house of the plain kind; a hut,
  // a shack or no house the least — the house's coins of today, not the land it stands on
  At.richOf = function (v, h, f) {
    if (v.captive) return 0; if (f && f.leader === v.id) return 3;
    if (!h) return 0; const t = h.type; if (t === 'barraco') return 0;
    const coin = h.coin || 0;
    if (t === 'hut') return coin > 25 ? 2 : 1;
    return h.elite || coin > 40 ? 3 : coin > 8 ? 2 : 1;
  };
  // (the dyes of standing: the deep ones of those who can pay for them, by people — a noble's mantle —, and the bright ones of
  // a merchant's cape; each person's own by their id — the same flips People3D's clothes are made of —, and who dresses
  // out of their station, one in a dozen, always the same ones)
  const hh = (id, k) => G.hash(id * 13 + k * 7919);
  At.DEEP = { nordico: ['#7a2430', '#2a3c6e', '#345a3c'], grego: ['#6a2858', '#8a2a2e', '#2a4a7c'], romano: ['#6a2050', '#8a2424', '#2e3e72'], classico: ['#6a2858', '#8a2a2e', '#2a4a7c'], egipcio: ['#2f8f8a', '#c8a040', '#2a5a8a'], asteca: ['#2f7a8a', '#9a2a3a', '#c8a040'] };
  At.BRIGHT = ['#c8962a', '#a83c2a', '#2a5e90', '#3a7e4a', '#8a4a8a'];
  At.deep = (id, civ) => (At.DEEP[civ] || At.DEEP.classico)[Math.floor(hh(id, 42) * 3)];
  At.bright = id => At.BRIGHT[Math.floor(hh(id, 43) * At.BRIGHT.length)];
  At.odd = id => hh(id, 41) < 0.08;
  // how drunk one is, 0 to 1: the drink in the blood against what one bears — G.Ebrio, one truth (embriaguez.js: the tavern's rounds,
  // the wine of the wells; none below merry, the stagger with the arms out from the staggering mark, the whole of it out: T2, D-830)
  At.drunk = function (v) { return G.Ebrio && v ? G.Ebrio.k(v) : 0; };

  // ------------------------------ what a building shows inside (the interiors 2.0, the front P5: D-740 to D-749) ------------------------------
  // The rule above all (the owner, 23/11/2026; D-651): what is seen inside a building is there because the world has it — the
  // drink is the jars of its book, the food is the parts of its store (G.Origem: the ham where the meat came, the braid where the
  // garden's came, the bread where the grain is a bread's), the cups and the plates of who sits at the tables are what was
  // served them, the cloth is a people's that weaves, the metal of a pot a people's that has it, the lamp lit by someone awake in
  // the dark with something to burn, the rug and the hanging of a house that is rich now, the marks of charcoal on a tavern's wall
  // the rounds of its years, the cobweb of a house old and uncared for. Each thing with its cause, in words (why) — nothing that
  // the people could not have (nada vem do nada, D-440). Pure: it reads the world, writes nothing of it, draws on no chance; the
  // choices between ways that are all true are the drawing's, by the building's id (G.Dentro3D). The same world, the same answer
  // (a record a building and an instant of the world, kept for that instant).
  const POURS = ['vinho', 'mel', 'cerveja', 'pulque']; // (what a tavern pours: tavern.js, its people's first)
  const CEREAL_BREAD = { trigo: 1, cevada: 1, sorgo: 1 }; // (the grains a loaf is baked of; the rice is boiled, the maize made into cakes)
  // (the vessel each drink stands in on a shelf — tavern.js's names: the amphora of wine, the jar of beer, the pot of mead, the
  // gourd of pulque —, the one a unit of it is)
  const VESSEL = { vinho: 'anforeta', cerveja: 'jarra', mel: 'pote', pulque: 'cabaca', azeite: 'anforeta', oleo: 'anforeta' };
  // (the goods of a house that show, and what they show as: its pots, its cloth, its cheese, its dried meat and fish, its oil, wine
  // and honey, its pelts)
  const HOUSE_GOODS = { ceramica: 'potes', tecido: 'pano', queijo: 'queijo', carne_seca: 'presunto', bacalhau: 'peixe-seco', atum: 'peixe-seco', azeite: 'anforeta', vinho: 'anforeta', mel: 'pote', peles: 'pele', pele_rara: 'pele' };
  const FOODS = Object.freeze(['trigo', 'cevada', 'sorgo', 'arroz', 'milho', 'carne', 'peixe', 'marisco', 'horta', 'fruta', 'ovos', 'leite', 'mel', 'azeite']);
  // (the dark in which a lamp is lit: the night, and the end of the evening)
  const darkHour = () => G.isNight() || (G.isEvening() && G.S.time > 0.66);
  // ---- what is served, and how much of it is left (D-748): the world counts what was eaten and drunk — P7's m.comido (0–1) when it
  // keeps one; the god's body by the bites of what it holds (act-taverna.js: a quarter of the plate a bite, a third of the dose a sip);
  // the people's meal and round by their time at the table (T.MEAL, the cup's own: T.cupOf) —, the 3D in quarters (the stage, 0 to 4)
  At.COOL = 6;   // (seconds of the world a plate steams after it comes from the fire: fresh, then cool)
  At.FOAM = 2.5; // (seconds of the world a beer's head stands up over the rim before it settles)
  At.VELA = 0.1; // (the wax a candle is: P7 burns it by the book — T.luz —, the 3D draws what is left)
  At.LENHA = 2;  // (the wood a pile by the fire is: as it burns it goes down by quarters)
  // (the dishes that come hot from the fire: the grilled, the boiled, the broths; the curd, the fruit, the bread with honey or oil, cold)
  const HOT = { peixe: 1, marisco: 1, carne: 1, arroz: 1, trigo: 1, cevada: 1, milho: 1, sorgo: 1, horta: 1, ovos: 1, provisao: 1, '?': 1 };
  const stageOf = e => Math.min(4, Math.max(0, Math.floor(e * 4 + 1e-6)));
  At.stageOf = stageOf;
  function eatenOf(v, m, c, T) {
    if (Number.isFinite(m.comido)) return G.clamp(m.comido, 0, 1);
    const k = c ? c.k : m.k; if (!k) return 0;
    if (m.corpo && c) { const dose = k === 'food' ? 1 : (T.DOSE && T.DOSE[k]) || c.n; return G.clamp(1 - c.n / Math.max(dose, EPS), 0, 1); }
    const dur = k === 'food' ? (T.mealOf ? T.mealOf(v) : T.MEAL || 8) : T.cupOf ? T.cupOf(v) : (T.CUP || 14) + (T.CUPX || 8) * G.hash(Math.imul(v.id | 0, 61) + 41); // (the meal's own: the night that lasts, D-961)
    return G.clamp((G.S.clock - (m.cup || G.S.clock)) / dur, 0, 1);
  }
  // (a fire that cooks in the building now: the plate served from it comes hot)
  const cooking = b => { const f = At.fire(b); return !!f && (f.why === 'cozinha' || f.why === 'taverna'); };
  // what a person holds of a tavern's now — the cup the keeper carries to a table, the cup a guest drinks from, the plate the body
  // holds —, for the drawing of the hands (the front P6: G.Dentro3D.served): { b, k, prato, st, fresco, quente, t0, why }. Pure
  // ------------------------------ the fourth wave: what a tavern shows of it (the front T7, D-880 to D-889) ------------------------------
  At.SECA = 24;       // (seconds of the world a spill on the floor takes to dry)
  At.SECA_ROUPA = 30; // (and a drink thrown on someone's clothes)
  // ---- the feast (D-880, D-881): the day's decorations, each by what it is made of — T1's b.festa = { motivo, causa, dia, ate, prato,
  // enfeites: [{ k, de }] } —: a garland of the wild's flowers or of the garden's greens, bunting and drapes only where the people
  // weaves, the standard of the people's colours (cloth, or the hide of its slaughter), petals of flowers, the feast's candles of the
  // wax it spent; and the feast's platter of the people, its parts the parts of the food the recipe spent (prato: { de: [parts] })
  const FESTA_K = { guirlanda: 'guirlanda', guirlandas: 'guirlanda', flores: 'guirlanda', fita: 'fita', fitas: 'fita', bandeirolas: 'fita', pano: 'pano', panos: 'pano',
    estandarte: 'estandarte', estandartes: 'estandarte', petalas: 'petalas', 'pétalas': 'petalas', vela: 'vela', velas: 'vela' };
  const FESTA_PART = { carne: 'x-carne', ave: 'x-carne', peixe: 'x-peixe', marisco: 'x-peixe', trigo: 'x-pao', cevada: 'x-pao', sorgo: 'x-pao', pao: 'x-pao', fruta: 'x-fruta', horta: 'x-horta', milho: 'x-milho', mel: 'x-pao' };
  const FESTA_CIV = { classico: 1, romano: 1, grego: 1, egipcio: 1, nordico: 1, asteca: 1 };
  const festaNow = (S, fe) => { if (!fe) return false; if (Number.isFinite(fe.dia) && S.day < fe.dia) return false; if (!Number.isFinite(fe.ate)) return true;
    return fe.ate > S.day * 2 + 10 ? S.clock <= fe.ate : S.day <= fe.ate; }; // (ate: a day, or a moment of the world's clock)
  function festaOf(b, civ, weave, couro, why) {
    const S = G.S, fe = b.festa; if (!festaNow(S, fe)) return null; const out = [];
    for (const e of Array.isArray(fe.enfeites) ? fe.enfeites : NONE) {
      const k = e && FESTA_K[e.k]; if (!k) continue; const de = String(e.de || '');
      let modelo = null, w = '';
      if (k === 'guirlanda') { modelo = de === 'horta' ? 'guirlanda-horta' : 'guirlanda-flores'; w = de === 'horta' ? 'as folhas e os bulbos da horta' : 'as flores do mato'; }
      else if (k === 'fita' || k === 'pano') { if (!weave) continue; modelo = k === 'fita' ? 'bandeirolas' : 'pano-festa'; w = 'o pano de um povo que tece'; }
      else if (k === 'estandarte') { if (!weave && !couro) continue; modelo = 'estandarte-' + (FESTA_CIV[civ] ? civ : 'classico'); w = `as cores e o emblema do povo, em ${weave ? 'pano' : 'couro'}`; }
      else if (k === 'petalas') { modelo = 'petalas'; w = de === 'horta' ? 'as flores da horta' : 'as flores do mato'; }
      else if (k === 'vela') { modelo = 'vela'; w = 'a cera que a festa gastou'; }
      out.push(Object.freeze({ k, de, modelo, why: `${w} — a festa: ${fe.motivo || 'comemoração'}` }));
    }
    // (the platter: the people's, its parts those of the food the recipe spent — said by the recipe; all, where it does not say)
    let prato = null; const pr = fe.prato;
    if (pr) { const L = Array.isArray(pr) ? pr : Array.isArray(pr.de) ? pr.de : Array.isArray(pr.of) ? pr.of : null; const de = L ? [...new Set(L.map(x => FESTA_PART[x]).filter(Boolean))].sort() : ['x-carne', 'x-fruta', 'x-horta', 'x-milho', 'x-pao', 'x-peixe'];
      prato = Object.freeze({ civ: FESTA_CIV[civ] ? civ : 'classico', de: Object.freeze(de), why: `o prato da festa${L ? ': ' + L.join(', ') : ''} (a receita da festa)` }); }
    if (out.length || prato) why.festa = `a festa de hoje: ${fe.motivo || ''}${fe.causa ? ' (' + fe.causa + ')' : ''}`;
    // (the feast's candles lit as the house's lamps are: someone awake inside, in the dark)
    return Object.freeze({ motivo: String(fe.motivo || 'festa'), enfeites: Object.freeze(out), prato, acesa: At.lit(b) && darkHour() ? 1 : 0 });
  }
  // ---- the door (D-882): locked (the bar across it, inside) or broken in (its leaf fallen and its splinters, till it is mended) — the
  // world's door state (G.Interiors.doorState: T1's, by the rule of the tavern or what someone made of it), on the plan made only
  function portaOf(b) {
    const In = G.Interiors; const p = G.Space && G.Space.planMade ? G.Space.planMade(b) : null; if (!p || !p.entrance || !In || !In.doorState) return null;
    const st = In.doorState(b, p.entrance.door); const e = st && st.state; if (e !== 'trancada' && e !== 'arrombada') return null;
    return Object.freeze({ id: p.entrance.door, estado: e, why: e === 'trancada' ? `a porta trancada (${st.by === 'pessoa' ? 'o taverneiro passou a tranca' : 'a regra da casa'}): a tranca atravessada por dentro` : 'a porta arrombada: a folha caída e as lascas, até o conserto' });
  }
  // ---- the games at its tables (D-884): the dice and their cup (T4's G.JogoDados.atMesa), the tablets of a game of cards and the deck
  // (T5's G.Cartas.atMesa) — each asked of every table, by its group of seats (the world's own key of a table: In.groupOf)
  const MATS_CARTA = { papiro: 1, amate: 1, madeira: 1, cera: 1, barro: 1 };
  // (the doors of the two games, by the contract's names — planos/taverna-onda4.md: G.JogoDados.atMesa, G.Cartas.atMesa —, looked up by
  // name: their modules are the fronts T4's and T5's, not in this branch yet; the guard's rule 10 sees them once they are, T-2000)
  const JOGO_MOD = Object.freeze({ dados: 'JogoDados', cartas: 'Cartas' });
  function jogosOf(b) {
    const JD = G[JOGO_MOD.dados], CA = G[JOGO_MOD.cartas]; if (!(JD && JD.atMesa) && !(CA && CA.atMesa)) return NONE;
    const p = G.Space && G.Space.planMade ? G.Space.planMade(b) : null; if (!p || !p.items) return NONE; const In = G.Interiors; const out = []; const seen = new Set();
    for (const it of p.items) {
      if (!/^mesa/.test(it.kind)) continue; const g = In && In.groupOf ? In.groupOf(b, it.id) : it.id; if (seen.has(g)) continue; seen.add(g);
      const d = JD && JD.atMesa ? JD.atMesa(b, g) : null, c = CA && CA.atMesa ? CA.atMesa(b, g) : null; if (!d && !c) continue;
      const faces = d ? (Array.isArray(d.dados) ? d.dados : Array.isArray(d.faces) ? d.faces : Array.from({ length: G.clamp(d.n | 0 || 2, 1, 6) }, () => 0)).slice(0, 6).map(x => G.clamp(x | 0, 0, 6)) : null;
      out.push(Object.freeze({ it: it.id, g,
        dados: d ? Object.freeze({ faces: Object.freeze(faces), copo: d.copo ? 1 : 0, mat: d.mat === 'madeira' ? 'madeira' : 'osso' }) : null,
        cartas: c ? Object.freeze({ mesa: G.clamp(c.mesa | 0, 0, 3), maos: G.clamp(c.maos === undefined ? 2 : c.maos | 0, 0, 2), monte: G.clamp(c.monte | 0, 0, 40), mat: MATS_CARTA[c.mat] ? c.mat : 'madeira' }) : null,
        why: `${d ? 'os dados' + (faces.some(x => x) ? ' (' + faces.join(', ') + ')' : '') : ''}${d && c ? ' e ' : ''}${c ? 'as cartas' : ''} na mesa: o jogo do mundo` }));
    }
    return out;
  }
  // ---- who fainted from drink inside it (D-885: T2's desmaio): lying where they fell — the cup fallen from the hand, the drink on the
  // floor round them; the place, the person's own in the world (the lot's metres)
  function caidosOf(b, op, T) {
    const S = G.S; const L = G.Space ? G.Space.TILE : 1; const out = [];
    for (const v of S.villagers.values()) {
      if (v.inside !== b.id && !(v.x >= b.x - 1 && v.x < b.x + b.w + 1 && v.y >= b.y - 1 && v.y < b.y + b.h + 1)) continue;
      if (!(v.act === 'desmaio' || (v.task && v.task.type === 'desmaio'))) continue;
      const c = v.carry && v.carry.n > EPS && POURS.includes(v.carry.k) ? v.carry.k : null;
      out.push(Object.freeze({ id: v.id, x: (v.x - b.x) * L, z: (v.y - b.y) * L, lv: v.lv | 0, bebida: c || 'cerveja', why: `#${v.id} desmaiado de bebida: a caneca caída da mão${c ? ', a ' + c + ' no chão' : ''}` }));
    }
    return out.sort((a, c) => a.id - c.id);
  }
  // how wet a person's clothes are with a drink thrown at them (D-883: T2's molhado — v.molhado: the clock it was thrown at, or
  // { t, k }), drying as the time goes by (At.SECA_ROUPA): { k, n (1 just soaked … 0 dry), why } or null — for the drawing of the
  // body (T6: the cloth darker where it is wet). Pure
  At.molhado = function (v) {
    const S = G.S; const m = v && v.molhado; if (!S || !m) return null; const t = typeof m === 'number' ? m : m.t; if (!Number.isFinite(t)) return null;
    const n = G.clamp(1 - (S.clock - t) / At.SECA_ROUPA, 0, 1); if (n <= 0) return null; const k = typeof m === 'object' && POURS.includes(m.k) ? m.k : 'cerveja';
    return { k, n: Math.round(n * 100) / 100, why: `${k} jogada na roupa há ${(S.clock - t).toFixed(1)} s do mundo, secando` };
  };
  At.serving = function (v) {
    const S = G.S, T = G.Taverna, A = G.Act; const c = v && v.carry; if (!S || !c || !c.op || !(c.n > EPS) || !T || !A) return null;
    const op = A.get(c.op); if (!op || op.def !== 'taverna') return null; const b = S.buildings.get(op.at); if (!b || b.type !== 'taverna') return null;
    const m = op.data && op.data.mesa ? op.data.mesa[v.id] : null; const food = c.k === 'food'; const O = G.Origem;
    const prato = food ? (O ? O.most('v:' + v.id, 'food') : null) || '?' : null;
    const e = m ? eatenOf(v, m, c, T) : 0; const t0 = m ? m.cup || 0 : S.clock; // (in the server's hands: poured just now)
    const quente = food && HOT[prato] && cooking(b) && S.clock - t0 < At.COOL ? 1 : 0; const fresco = !food && S.clock - t0 < At.FOAM ? 1 : 0;
    return { b: b.id, k: c.k, prato, st: stageOf(e), fresco, quente, t0, why: `${food ? prato : c.k} da taverna #${b.id}, ${Math.round(e * 100)}% ${food ? 'comido' : 'bebido'}${m ? '' : ' (nas mãos de quem serve)'}` };
  };
  // ------------------------------ the decoration by use (F7, the interiors 3 — D-1010): the rules ------------------------------
  // What a building shows inside is the core every building is read for (the drink of its book, the food by its parts, the goods of a
  // household, its cups, the pot on the fire that cooks, the wood by the fire, the lamps, the cloth, the cobweb of its years) and what
  // the rules of its use say: its plan's use (G.Interiors.TYPES[type].use — 'taverna', 'casa', 'forja', 'templo'…), else its type.
  // A rule reads what that use has — the tavern's tables, the marks of its years, its door, its feast, its games —, registered by
  // whoever makes the use's decoration, in a file of its own if it likes (the manual: planos/interiores-3-decoracao.md). The
  // vocabulary is one: every within has every field — a rule's new field comes with the empty value every other building says —,
  // so no reader asks whether a field is there.
  //   At.withinRule(uso, fn, o): fn(b, c) → the fields the use says (pure: it reads the world, writes nothing of it, draws on no
  //   chance; c: the core's reading of the building — civ, f, fid, known, rico, home, ref, barro, metal, couro, weave, fire, conta,
  //   why (the reasons, to add one's own), ler (the doors of the true readings) —); o.campos: { field: its empty value } of the
  //   fields the rule brings that the vocabulary has not yet; o.conta(b): the night's count of what the building burns by the book
  //   — { vela, azeite, lenha }: a candle's and a lamp's oil 0..1 of a whole one, the wood by the fire (the tavern's T.luz, D-749)
  //   —, or null; o.dono(b): the house whose wealth the building shows (the tavern's keeper's), null for none, undefined where it
  //   cannot tell. Rules of one use are read in the order they came: the later says over the earlier
  const RULES = new Map();
  // (the vocabulary, in the order every within has it: its fields and their empty values; a rule's new ones after them)
  const VOC = [['civ', 'classico'], ['rico', 1], ['barro', false], ['metal', null], ['couro', false], ['weave', false], ['bebida', NONE], ['comida', NONE], ['bens', NONE], ['louca', null],
    ['mesa', NONE], ['sujo', NONE], ['cozinha', null], ['lenha', null], ['luz', null], ['pano', null], ['rabiscos', 0], ['manchas', 0], ['chao', NONE], ['lousa', null], ['ombro', null],
    ['festa', null], ['porta', null], ['jogos', NONE], ['caidos', NONE], ['teia', null]];
  const VOCK = new Set(VOC.map(q => q[0]).concat(['sig', 'why'])); const EXTRA = [];
  const noWithin = () => { const o = { sig: '' }; for (const [k, d] of VOC) o[k] = d; for (const [k, d] of EXTRA) o[k] = d; o.why = NOINV; return Object.freeze(o); };
  let NOWITHIN = noWithin();
  // (a field a rule says that no rule declared: refused and counted, by use and field — the verifier «dentro» reports it, the proof d16
  // asks it empty — never let in silently)
  At.withinErr = {};
  G.worldHooks.push(() => { for (const k of Object.keys(At.withinErr)) delete At.withinErr[k]; });
  const campo = (k, d) => { if (!VOCK.has(k)) { VOCK.add(k); EXTRA.push([k, d]); } };
  // (→ the door that takes the rule away again: for the proofs that try one)
  At.withinRule = function (uso, fn, o) {
    if (!uso || typeof fn !== 'function') return () => { }; o = o || {};
    for (const k of Object.keys(o.campos || {})) campo(k, o.campos[k]);
    let L = RULES.get(uso); if (!L) RULES.set(uso, L = []); const r = Object.freeze({ fn, conta: o.conta || null, dono: o.dono || null }); L.push(r);
    NOWITHIN = noWithin(); win.clear();
    return () => { const i = L.indexOf(r); if (i >= 0) L.splice(i, 1); win.clear(); };
  };
  // what a trade shows at its post, wherever it works (the scribe at the palace's table and at the storehouse's, the cook in the tavern and
  // in the palace's kitchen): At.oficioRule(oficio, fn), fn(b, q, c) → the fields of q, one who works in the building (v.job) or lives in
  // it keeping that trade (v.roleBack || v.role) — q: { v (the id), oficio, aqui (in it now: 1) } —; the within has them in W.oficios, in
  // the order of the ids. The field enters the vocabulary with the first rule of a trade (→ the door that takes the rule away)
  const OFRULES = new Map();
  At.oficioRule = function (oficio, fn) {
    if (!oficio || typeof fn !== 'function') return () => { };
    campo('oficios', NONE); let L = OFRULES.get(oficio); if (!L) OFRULES.set(oficio, L = []); L.push(fn); NOWITHIN = noWithin(); win.clear();
    return () => { const i = L.indexOf(fn); if (i >= 0) L.splice(i, 1); win.clear(); };
  };
  // (the trades of a building whose rules there are: who works in it, who lives in it, each once — the post first)
  function oficiosOf(b, c) {
    const out = []; if (!OFRULES.size) return out; const cs = census(); const seen = new Set();
    const one = (v, r) => { if (!v || seen.has(v.id) || !r || v.age < 14 || v.captive) return; const L = OFRULES.get(r); if (!L || !L.length) return; seen.add(v.id);
      const q = { v: v.id, oficio: r, aqui: v.inside === b.id ? 1 : 0 }; for (const fn of L) { const x = fn(b, q, c); if (x) for (const k in x) if (k !== 'v' && k !== 'oficio' && k !== 'aqui') q[k] = x[k]; } out.push(Object.freeze(q)); };
    for (const v of cs.jobs.get(b.id) || NONE) one(v, v.role);
    for (const v of (cs.homes.get(b.id) || NOINV).vs || NONE) one(v, v.roleBack || v.role);
    return out.sort((a, c2) => a.v - c2.v);
  }
  // (the use of a building: its plan's, else its type)
  const usoOf = b => { const T = b && G.Interiors && G.Interiors.TYPES ? G.Interiors.TYPES[b.type] : null; return (T && T.use) || (b ? b.type : ''); };
  At.usoOf = usoOf;
  At.rulesOf = b => RULES.get(usoOf(b)) || NONE; // (for the proofs and the guard: the rules a building is read by)
  At.VOC = () => VOC.concat(EXTRA).map(q => q[0]); // (the fields every within has)
  // (the first rule of a building's use that says a thing: its night's count, the house of its wealth)
  const firstOf = (b, k) => { for (const r of RULES.get(usoOf(b)) || NONE) if (r[k]) return r[k]; return null; };
  // how rich a building is now (D-661: the wealth inside is today's, never the land's at its founding): 0 poor, 1 middling, 2
  // rich — a house by its coins and its merchant's flag; a building whose use says whose wealth it shows (the tavern: its keeper's
  // house) by that house; the seat of who rules, rich; any other by the worth of its ground today (G.Urban's portrait of the day).
  // The same thresholds as the furniture's (G.Movel3D.rico)
  const ofHouse = h => (!h ? 1 : h.elite ? 2 : (h.coin || 0) >= 150 ? 2 : (h.coin || 0) >= 40 ? 1 : 0);
  At.rich = function (b) {
    const S = G.S; if (!S || !b) return 1;
    if (housing(b)) return ofHouse(b);
    if (G.Casa && G.Casa.isSeat && G.Casa.isSeat(b)) return 2;
    const dn = firstOf(b, 'dono'); if (dn) { const h = dn(b); if (h !== undefined) return ofHouse(h); }
    const U = G.Urban; const sn = U && U.peek ? U.peek(b.set) : null; const c = sn && sn.cells ? sn.cells.get(U.cellOf(b.x + b.w / 2, b.y + b.h / 2)) : null;
    return c ? (c.value >= 62 ? 2 : c.value >= 28 ? 1 : 0) : 1;
  };
  const win = new Map(); let winK = -1, winS = null;
  At.within = function (b) {
    const S = G.S; if (!S || !b || !b.built || b.type === 'ruin') return NOWITHIN;
    if (winS !== S || winK !== S.clock) { win.clear(); winS = S; winK = S.clock; }
    let o = win.get(b.id); if (o) return o;
    o = withinOf(b); win.set(b.id, o); if (win.size > 400) win.clear();
    return o;
  };
  // the within of a building: the core, then the rules of its use over it, in the vocabulary's order
  function withinOf(b) {
    const S = G.S, D = G.Depot, O = G.Origem; const why = {};
    const f = G.Fac && G.Fac.ofSet ? G.Fac.ofSet(b.set) : null; const fid = f ? f.id : 0; const known = f && f.tech ? f.tech.known : null;
    const civ = b.style || (f && f.civ) || 'classico';
    const ok = m => (O && O.matOK ? !!O.matOK(fid, m, known) : false);
    // what the people has had: the potter's ware (a cup of clay, else of turned wood), its metal (iron, else bronze), its leather;
    // what it weaves (a loom standing, cloth in its stores: the clothes' own reading, artsOf)
    const barro = ok('barro'), metal = ok('ferro') ? 'ferro' : ok('bronze') ? 'bronze' : null, couro = ok('couro');
    const weave = f ? artsOf(f).weave : false; const rico = At.rich(b);
    why.louca = barro ? 'barro: o povo já teve a cerâmica da olaria' : 'madeira torneada: o povo nunca teve cerâmica';
    if (metal) why.metal = `${metal}: o povo tem a arte e já teve o metal`;
    why.pano = weave ? 'o povo tece (um tear de pé, ou pano no armazém)' : 'o povo não tece: couro e pele, nenhum pano';
    why.riqueza = rico === 2 ? 'rica agora (as moedas da casa, a bandeira da casa mercante, a sede)' : rico === 1 ? 'remediada agora' : 'pobre agora';
    const home = G.Village.bedsOf(b) > 0; const ref = (home ? 'h:' : 'b:') + b.id;
    const rules = RULES.get(usoOf(b)) || NONE; const cf = firstOf(b, 'conta');
    // ---- the drink of its book: each whole unit a vessel on the shelf (the amphora pours ten cups, the jar four); a broken one, open
    const bebida = []; const I = b.inv || NOINV;
    for (const k of POURS) { const n = D ? D.get(ref, k) : I[k] || 0; if (!(n > EPS)) continue; const whole = Math.floor(n + EPS);
      bebida.push(Object.freeze({ k, n: Math.min(whole, 12), aberta: n - whole > 0.2 ? 1 : 0, vaso: VESSEL[k], why: `${n.toFixed(2)} de ${k} no livro (${ref})` })); }
    // ---- the food of its store, by its parts (G.Origem: what each came of)
    const comida = []; const food = D ? D.get(ref, 'food') : 0;
    if (food > EPS && O) { const p = O.parts(ref, 'food'); for (const k of FOODS) { const n = p[k] || 0; if (n >= 0.25) comida.push(Object.freeze({ k, n: Math.round(n * 4) / 4, pao: CEREAL_BREAD[k] ? 1 : 0, why: `${n.toFixed(2)} de ${k} na comida do armazém (${ref}, G.Origem)` })); } }
    // ---- the goods of a house that show
    const bens = [];
    if (home) for (const k in HOUSE_GOODS) { const n = D ? D.get(ref, k) : I[k] || 0; if (n >= 1 - EPS) bens.push(Object.freeze({ k, n: Math.min(6, Math.floor(n + EPS)), como: HOUSE_GOODS[k], why: `${Math.floor(n)} de ${k} na casa` })); }
    // ---- the cups and bowls of a house, for who lives in it (a use's own — the tavern's for its guests — its rule's)
    const res = home ? ((census().homes.get(b.id) || NOINV).res || 0) : 0;
    const louca = home && res > 0 ? Object.freeze({ mat: barro ? 'barro' : 'madeira', de: 'casa', n: Math.min(6, res) }) : null;
    // ---- a pot on the fire: the building's fire burning to cook (G.Atmos.fire: the kitchen, the tavern open) with food in it
    const fire = At.fire(b); const cozinha = fire && (fire.why === 'cozinha' || fire.why === 'taverna') && food >= 1 - EPS ? Object.freeze({ mat: metal || (barro ? 'barro' : null), why: `${fire.txt}, com comida no armazém` }) : null;
    // ---- the firewood by the hearth (D-749): what was brought to the fire and is not burnt yet — the building's own count where its use
    // keeps one (the tavern's T.luz: P7's, what it brought from the store and what the fire burnt, by the book), else the wood in the
    // building's own place of the book — the pile in quarters of At.LENHA; where the world keeps none by the fire, the people's wood in
    // store, the pile whole
    const LZ = cf ? cf(b) : null;
    const wood = f && f.stock ? f.stock.wood || 0 : 0; const own = D ? D.get(ref, 'wood') : 0; let lenha = null;
    if (LZ && Number.isFinite(LZ.lenha)) { const q = Math.min(4, Math.ceil(LZ.lenha / (At.LENHA / 4) - EPS)); if (q > 0) lenha = Object.freeze({ q, why: `${LZ.lenha.toFixed(2)} de lenha junto do fogo (o que se trouxe do armazém menos o que o fogo queimou)` }); }
    else if ((b.inv || NOINV).wood !== undefined) { const q = Math.min(4, Math.ceil(own / (At.LENHA / 4) - EPS)); if (q > 0) lenha = Object.freeze({ q, why: `${own.toFixed(2)} de lenha no lugar do prédio no livro (${ref})` }); }
    else if (wood >= 1) lenha = Object.freeze({ q: 4, why: `${Math.floor(wood)} de madeira no armazém do povo` });
    // ---- the lamps: something to burn — the house's oil or wax, else the people's store —, a lamp to burn it in (clay, bronze, the
    // candle's holder), lit only with someone awake inside in the dark (G.Atmos.lit), never in the New Fire's dark (festivals.js)
    let luz = null; const has = k => (home && D ? D.get(ref, k) : 0) >= 1 - EPS || ((f && f.stock ? f.stock[k] || 0 : 0) >= 1 - EPS);
    const comb = ['azeite', 'oleo', 'cera'].filter(has);
    // (the night burns them, D-749: what is left of the candle lit tonight and of the oil in the lamps — the building's own count, its
    // use's (the tavern's T.luz: P7's, the wax and the oil burnt by the book, the new candle of the morning lit only with wax in store) —;
    // whole where the world keeps no count. The candle burnt out and none new: no candle; the oil gone: the lamp out)
    const cntV = !!LZ && Number.isFinite(LZ.vela), cntA = !!LZ && Number.isFinite(LZ.azeite);
    const vela = cntV ? G.clamp(LZ.vela, 0, 1) : 1, azeite = cntA ? G.clamp(LZ.azeite, 0, 1) : 1;
    // (the candle of tonight was the store's when it was lit: it stands while there is some of it; uncounted, while the store has wax)
    const oilK = comb.filter(k => k !== 'cera'); const hasC = cntV ? vela > EPS : comb.includes('cera'); const hasO = cntA ? azeite > EPS : oilK.length > 0;
    if (hasC || hasO) {
      const lit = At.lit(b) && darkHour();
      luz = Object.freeze({ comb: Object.freeze(comb), oleo: hasO ? oilK[0] || 'azeite' : null, cera: hasC, vela, azeite, mat: barro ? 'barro' : metal === 'bronze' || ok('bronze') ? 'bronze' : 'pedra', acesa: lit ? 1 : 0, awake: At.awake(b),
        why: `${comb.join(' e ')} para queimar (${home && comb.some(k => D && D.get(ref, k) >= 1) ? 'na casa' : 'no armazém do povo'})${LZ ? `; esta noite: a vela com ${Math.round(vela * 100)}%, o azeite com ${Math.round(azeite * 100)}% (a conta da taverna)` : ''}${lit ? `; acesa: ${At.awake(b)} acordado(s) dentro, ${G.isNight() ? 'noite' : 'fim da tarde'}` : '; apagada: ' + (!At.lit(b) ? 'ninguém acordado dentro' : 'ainda é dia')}` });
    }
    // ---- the cloth on the walls and the floor: a people that weaves, a house rich now; the dye of who can pay for it (At.deep); the
    // pelt where the house keeps pelts (the rug of the north, woven or not)
    const pelts = home && D ? D.get(ref, 'peles') + D.get(ref, 'pele_rara') : 0;
    const pano = (weave && rico >= 1) || pelts >= 1 ? Object.freeze({ tapete: (weave && rico >= 2) || pelts >= 1 ? 1 : 0, pele: !(weave && rico >= 2) && pelts >= 1 ? 1 : 0, tapecaria: weave && rico >= 1 && (b.type === 'taverna' || rico >= 2) ? 1 : 0,
      cor: rico >= 2 ? At.deep(b.id, civ) : null, why: `${weave ? 'o povo tece' : ''}${weave && rico ? ' e ' : ''}${rico ? why.riqueza : ''}${pelts >= 1 ? (weave || rico ? '; ' : '') + 'peles na casa' : ''}` }) : null;
    // ---- the cobweb: a building old and uncared for (G.Atmos.wear: the years, the care of its quarter, nobody living in it)
    const w = At.wear(b); const teia = w && w.ageLv >= 3 && w.care === 0 ? Object.freeze({ n: w.ageLv >= 4 ? 2 : 1, why: `${At.years(b)} anos, sem cuidado (G.Atmos.wear)` }) : null;
    // ---- the rules of its use (the tavern's tables, the marks of its years, its door, its feast…), over the core
    const F = { civ, rico, barro, metal, couro, weave, bebida: Object.freeze(bebida), comida: Object.freeze(comida), bens: Object.freeze(bens), louca, cozinha, lenha, luz, pano, teia };
    if (rules.length || OFRULES.size) { const c = { b, S, D, O, f, fid, known, civ, ok, rico, home, ref, I, res, barro, metal, couro, weave, fire, food, conta: LZ, wear: w, why, ler: LER };
      const uso = usoOf(b);
      for (const r of rules) { const q = r.fn(b, c); if (q) for (const k in q) { if (VOCK.has(k) && k !== 'sig' && k !== 'why') F[k] = q[k]; else { const e = uso + '.' + k; At.withinErr[e] = (At.withinErr[e] || 0) + 1; } } }
      // (what each trade of the building shows at its post: W.oficios — once a trade has its rule)
      if (OFRULES.size) F.oficios = Object.freeze(oficiosOf(b, c)); }
    const o = { sig: '' }; for (const [k, d] of VOC) o[k] = k in F ? F[k] : d; for (const [k, d] of EXTRA) o[k] = k in F ? F[k] : d;
    o.why = Object.freeze(why); o.sig = sigOf(o);
    return Object.freeze(o);
  }
  // (the signature of what a building shows: made again when the cause changes — the vocabulary's own, then a rule's new fields)
  function sigOf(o) {
    const { civ, rico, barro, metal, weave, bebida, comida, bens, louca, mesa, cozinha, lenha, luz, pano, rabiscos, teia, manchas, sujo, chao, lousa, ombro, festa, porta, jogos, caidos } = o;
    let s = [civ, rico, barro ? 1 : 0, metal || '-', weave ? 1 : 0,
      bebida.map(q => q.k + q.n + (q.aberta ? 'a' : '')).join(','), comida.map(q => q.k + Math.min(6, Math.ceil(q.n))).join(','), bens.map(q => q.k + q.n).join(','),
      louca ? louca.mat + louca.n : '-', mesa.map(q => q.id + (q.cup || '') + q.cs + (q.prato ? ':' + q.prato + q.ps + (q.quente ? 'q' : '') : '') + (q.jogo ? 'j' : '')).join(','), cozinha ? 'c' + (cozinha.mat || '') : '-', lenha ? 'l' + lenha.q : '-',
      luz ? luz.comb.join('') + luz.mat + luz.acesa + (luz.cera ? 'v' + Math.min(3, Math.floor((1 - luz.vela) * 4)) : '') + (luz.oleo ? 'o' + Math.ceil(luz.azeite * 4) : '') : '-', pano ? `${pano.tapete}${pano.pele}${pano.tapecaria}${pano.cor || ''}` : '-', rabiscos, teia ? teia.n : 0,
      manchas, sujo.map(q => `${q.x.toFixed(2)},${q.z.toFixed(2)}${q.prato || q.cup}${q.st}`).join(','), chao.map(q => `${q.k}${q.x.toFixed(2)},${q.z.toFixed(2)}`).join(','),
      lousa ? `${lousa.k}:${lousa.prato ? lousa.prato.de : '-'}:${lousa.bebidas.join('+')}` : '-', ombro ? ombro.id : 0,
      festa ? `${festa.motivo}:${festa.enfeites.map(q => q.modelo).join('+')}:${festa.prato ? festa.prato.de.join('') : '-'}:${festa.acesa}` : '-', porta ? porta.estado : '-',
      jogos.map(q => `${q.g}${q.dados ? 'd' + q.dados.faces.join('') + (q.dados.copo ? 'c' : '') : ''}${q.cartas ? 'k' + q.cartas.mesa + '.' + q.cartas.maos + '.' + q.cartas.monte : ''}`).join(','),
      caidos.map(q => `${q.id}@${q.x.toFixed(1)},${q.z.toFixed(1)}`).join(','), chao.map(q => (q.k === 'poca' ? Math.round(q.n * 4) : '')).join('')].join('|');
    for (const [k, d] of EXTRA) if (o[k] !== d) s += '|' + k + ':' + JSON.stringify(o[k]);
    return s;
  }
  // ------------------------------ the true readings (F7, D-1011): the doors a rule reads by (c.ler) ------------------------------
  // what each keeping piece of a building holds, by the book: [{ it (the piece's id; 0, the pile on the floor), kind, dep, cap, bens:
  // { good: n }, n }] — a household's pieces and a building's shelves by the depot's own split (G.Depot.slots: the one the room is
  // counted by), a business's stall by its place ('z:'), the people's bays, bins and shelves by the share of the people's store the
  // building keeps (G.Depot.share: the pile drawn in it, the same stock), put away in them by the depot's rule — the pieces made for a
  // good first, then those that take any —; the plan's pieces as the interiors keep them (In.depotStores). Pure: a record a building
  // and an instant of the world
  const gua = new Map(); let guaS = null, guaK = -1;
  At.guardado = function (b) {
    const S = G.S, D = G.Depot, In = G.Interiors; if (!S || !b || !b.built || b.type === 'ruin' || !D || !D.slots || !In || !In.depotStores) return NONE;
    if (guaS !== S || guaK !== S.clock) { gua.clear(); guaS = S; guaK = S.clock; }
    let out = gua.get(b.id); if (out) return out;
    const P = In.depotStores(b); const rows = new Map();
    if (P && P.length) {
      for (const m of P) rows.set(m.id, { it: m.id, kind: m.kind, dep: m.dep || '', cap: m.cap || 0, bens: {}, n: 0 });
      const add = (id, k, n) => { let r = rows.get(id); if (!r && id === 0) rows.set(0, r = { it: 0, kind: 'chao', dep: '', cap: 0, bens: {}, n: 0 }); if (!r || !(n > EPS) || k === 'moedas') return; r.bens[k] = Math.round(((r.bens[k] || 0) + n) * 1e4) / 1e4; r.n = Math.round((r.n + n) * 1e4) / 1e4; };
      for (const s of D.slots((G.Village.bedsOf(b) > 0 ? 'h:' : 'b:') + b.id)) add(s.m, s.k, s.n);
      for (const z of S.biz || NONE) if (z && z.b === b.id && z.st !== 'fim') for (const s of D.slots('z:' + z.id)) if (s.m) add(s.m, s.k, s.n);
      const povo = P.filter(m => m.dep === 'povo');
      if (povo.length && D.share) { const sh = D.share(b); const ents = povo.map(m => ({ m, left: m.cap || 0 }));
        for (const k of Object.keys(sh).sort()) { let n = sh[k] || 0; if (!(n > EPS) || k === 'moedas' || k === 'water') continue;
          for (const pass of [0, 1]) for (const e of ents) { if (n <= EPS) break; if (pass === 0 ? !(Array.isArray(e.m.keys) && e.m.keys.includes(k)) : e.m.keys !== '*') continue; const t = Math.min(e.left, n); if (t <= EPS) continue; e.left -= t; n -= t; add(e.m.id, k, t); } } }
    }
    out = Object.freeze([...rows.values()].map(r => Object.freeze(Object.assign(r, { bens: Object.freeze(r.bens) }))));
    gua.set(b.id, out); if (gua.size > 600) gua.clear();
    return out;
  };
  // the trades of a building now: { quem, obra, feito } — who works in it (v.job) and who lives in it keeping a trade (v.roleBack ||
  // v.role), each with the things of the trade by the kit (G.Inv.trade: theirs by trade, in the material the people has — G.Origem's
  // matOK and forged, the inventory's own rule) — [{ k, tipo, mat, onde }] —, whether they are in it now (aqui) and the kind of thing their
  // hands use now (usa: the act's tool, G.Inv.ACT_TOOL); the batches under way at their stage (G.Oficio: [{ op, p, k, mat, etapa, nome,
  // feitos, n, why }]); and what the building's own place of the book keeps of what its trade makes, with the parts of its origin (the
  // iron, the bronze, the stone of a tool: G.Origem.parts) — [{ k, n, partes, why }]. Pure
  const NOOFICIO = Object.freeze({ quem: NONE, obra: NONE, feito: NONE });
  At.oficio = function (b) {
    const S = G.S, D = G.Depot, O = G.Origem, Inv = G.Inv, It = G.Itens, Of = G.Oficio; if (!S || !b || !b.built || b.type === 'ruin') return NOOFICIO;
    const cs = census(); const quem = []; const seen = new Set();
    const one = (v, r) => { if (!v || seen.has(v.id) || !r || v.age < 14 || v.captive) return; seen.add(v.id); const kit = [];
      const t = Inv && Inv.trade ? Inv.trade(v) : null; if (t) for (const s of ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo']) { const k = t[s]; if (!k) continue; const d = It && It.def ? It.def(k) : null; kit.push(Object.freeze({ k, tipo: d ? d.kind : k.split('.')[0], mat: d ? d.mat : k.split('.')[1] || null, onde: s })); }
      const aqui = v.inside === b.id ? 1 : 0; const usa = aqui && Inv && Inv.ACT_TOOL ? Inv.ACT_TOOL[v.act] || null : null;
      quem.push(Object.freeze({ v: v.id, oficio: r, aqui, kit: Object.freeze(kit), usa })); };
    for (const v of cs.jobs.get(b.id) || NONE) one(v, v.role);
    for (const v of (cs.homes.get(b.id) || NOINV).vs || NONE) one(v, v.roleBack || v.role);
    quem.sort((a, c) => a.v - c.v);
    const obra = []; const feito = []; const tr = Of && Of.trade ? Of.trade(b) : null;
    if (tr && Of.batches) for (const op of Of.batches(b)) { const R = Of.rx(op), s = Of.stage(op); if (!R) continue; const d = op.data;
      obra.push(Object.freeze({ op: op.id, p: d.p, k: R.k, mat: R.mat || null, etapa: s ? s.id : null, nome: s ? s.name : '', feitos: d.feitos || 0, n: d.n || 0, why: `a fornada de ${R.name || R.k} (${s ? s.name : 'acabando'}: ${d.feitos || 0} de ${d.n || 0} feitos) — G.Oficio` })); }
    if (tr && D) { const ks = []; for (const p in tr.rx) if (!ks.includes(tr.rx[p].k)) ks.push(tr.rx[p].k); const ref = 'b:' + b.id;
      for (const k of ks.sort()) { const n = D.get(ref, k); if (!(n > EPS)) continue; const partes = O && O.kept && O.kept(k) ? Object.freeze(O.parts(ref, k)) : null;
        feito.push(Object.freeze({ k, n: Math.round(n * 100) / 100, partes, why: `${n.toFixed(2)} de ${k} na prateleira da oficina (${ref})${partes ? ': ' + Object.keys(partes).map(m => `${partes[m]} de ${m}`).join(', ') : ''}` })); } }
    return Object.freeze({ quem: Object.freeze(quem), obra: Object.freeze(obra), feito: Object.freeze(feito) });
  };
  // a thing in the best material the people has had (the key «tipo.material»), or null where it never had a material the kind takes —
  // the inventory's own rule (G.Inv.madeBy: the art permits, the material makes it possible, D-442)
  const coisa = (tipo, fid) => (G.Inv && G.Inv.madeBy && fid ? G.Inv.madeBy(tipo, fid) : null);
  const LER = Object.freeze({ guardado: b => At.guardado(b), oficio: b => At.oficio(b), coisa, anos: b => At.years(b), wear: b => At.wear(b) });
  At.ler = LER;

  // ------------------------------ the tavern's rule (the front P5, D-740 to D-749; the fourth wave, T7, D-880 to D-889) ------------------------------
  // its cups for its guests; who sits at its tables and what was served each; what was left on them; the marks of its years on the
  // walls and the boards; what lies on its floor after a brawl; the words at its door; the keeper's cloth; the feast, the door, the
  // games, who fainted. Its night's count of what it burns (T.luz) and the house its wealth is (the keeper's)
  function tavernWithin(b, c) {
    const S = G.S, O = G.Origem; const { barro, civ, weave, couro, why } = c;
    const louca = Object.freeze({ mat: barro ? 'barro' : 'madeira', de: 'fregueses', n: 0 });
    // ---- who sits at the tables of an open tavern, and what was served each (D-748): the plate of who is eating — the dish its food
    // is made of, as much of it as is eaten (the stage), hot while it is fresh from the fire that cooks —; done, the empty plate or the
    // empty cup of the last round, on the table until the keeper takes it (he serves the next round; P7's b.sujo, what is left once
    // the guest is up). The cup of who is drinking is in his hand: the kit's (G.Inv.held) — its level and its foam, At.serving
    const mesa = []; const T = G.Taverna; const op = T && T.dia ? T.dia(b) : null; const kitchen = cooking(b);
    if (op && op.data && op.data.mesa) for (const id of Object.keys(op.data.mesa).sort((a, c2) => a - c2)) {
      const m = op.data.mesa[id]; const v = S.villagers.get(+id); if (!v || v.inside !== b.id) continue;
      const cc = v.carry && v.carry.op === op.id ? v.carry : null; const eating = (m.st === 3 && cc && cc.k === 'food') || (m.st === 4 && m.k === 'food');
      const drinking = (m.st === 3 && cc && cc.k !== 'food') || (m.st === 4 && m.k && m.k !== 'food');
      let prato = null, ps = 0, cup = null, quente = 0, t0 = 0; const ws = [];
      if (eating) { prato = (O && cc ? O.most('v:' + v.id, 'food') : null) || (O ? O.next('b:' + b.id, 'food') : null) || '?'; const e = eatenOf(v, m, cc, T); ps = stageOf(e); t0 = m.cup || 0;
        quente = HOT[prato] && kitchen && S.clock - t0 < At.COOL ? 1 : 0; ws.push(`comendo ${prato}: ${Math.round(e * 100)}% comido${quente ? `, quente (servido há ${(S.clock - t0).toFixed(1)} s do fogo da cozinha)` : ''}`); }
      else if (!drinking && (m.r || 0) >= 1 && m.k && !Array.isArray(op.data.sujo)) { // (where the world keeps what is left on the tables — P7's d.sujo —, its record says it: the dish too)
        // (the round done: its plate or its cup left empty — what the plate held the world no longer says, the dish of the day's)
        if (m.k === 'food') { prato = '?'; ps = 4; } else { cup = POURS.includes(m.k) ? m.k : 'cerveja'; }
        ws.push(`a ${m.k === 'food' ? 'refeição' : 'rodada'} acabada (${m.r} já), ${m.k === 'food' ? 'o prato' : 'a caneca'} vazio na mesa até o taverneiro recolher`); }
      const jogo = m.jogo || v.act === 'jogo-ossos' ? 1 : 0; if (jogo) ws.push('jogando os ossinhos');
      if (cup || prato || jogo) mesa.push(Object.freeze({ id: v.id, cup, cs: cup ? 4 : 0, prato, ps, quente, t0, jogo, why: `${ws.join('; ')} (o dia da taverna, op ${op.id})` }));
    }
    // (what the guests left on the tables once up, until the keeper's hands take it: P7's record — b.sujo, or the day's — read when it
    // is kept: [{ x, z, lv: where the guest sat (the lot, metres), k: 'food' | a drink, prato: the part of the food, resto: 0–1 uneaten }])
    const sujo = [];
    for (const q of (b.sujo || (op && op.data && op.data.sujo) || NONE)) { if (!q || !Number.isFinite(q.x) || !Number.isFinite(q.z)) continue; const food = q.k === 'food'; const st = stageOf(1 - G.clamp(Number.isFinite(q.resto) ? q.resto : 0, 0, 1));
      sujo.push(Object.freeze({ x: q.x, z: q.z, lv: q.lv | 0, prato: food ? q.prato || '?' : null, cup: food ? null : POURS.includes(q.k) ? q.k : 'cerveja', st, why: `deixado na mesa ${food ? 'o prato' : 'a caneca'}${st < 4 ? ' com resto' : ' vazio'} (o registro da taverna)` })); }
    // ---- the marks of charcoal on a tavern's wall: the rounds of its years (one in every fifteen poured, a dozen at most)
    const rabiscos = Math.min(12, Math.floor((b.served || 0) / 15));
    if (rabiscos) why.rabiscos = `${b.served} doses servidas: os fregueses de anos riscaram a parede com o carvão do fogo`;
    // ---- the rings of beer on its tables and its counter (D-749): the doses of its years, one ring in every twenty poured, ten at most
    const manchas = Math.min(10, Math.floor((b.served || 0) / 20));
    if (manchas) why.manchas = `${b.served} doses servidas: as canecas molhadas deixaram os seus anéis na madeira`;
    // ---- what lies on its floor after a brawl, until someone cleans it (D-749): P7's record — b.chao, or the day's — read when it is
    // kept: [{ k: 'cacos' | 'poca', x, z (the lot, metres), lv, bebida }] — the mug broken (lost by the book), what was spilt. A mug of
    // turned wood does not break: it lies where it rolled
    const chao = [];
    for (const q of (b.chao || (op && op.data && op.data.chao) || NONE)) { if (!q || !Number.isFinite(q.x) || !Number.isFinite(q.z)) continue;
      const k = q.k === 'poca' ? 'poca' : barro ? 'cacos' : 'caneca-caida'; const bb = POURS.includes(q.bebida) ? q.bebida : 'cerveja';
      // (a spill dries as the time since it ran goes by — At.SECA —, smaller and smaller, gone when it has: T7, D-883)
      const dry = k === 'poca' && Number.isFinite(q.t) ? G.clamp(1 - (S.clock - q.t) / At.SECA, 0, 1) : 1; if (dry < 0.22) continue;
      chao.push(Object.freeze({ k, x: q.x, z: q.z, lv: q.lv | 0, bebida: k === 'poca' ? bb : null, n: G.clamp((Number.isFinite(q.n) ? q.n : 1) * (k === 'poca' ? 0.35 + 0.65 * dry : 1), 0.3, 1.6), why: k === 'poca' ? `${bb} derramada no chão (o registro da taverna), até alguém limpar` : k === 'cacos' ? 'uma caneca de barro quebrada na briga (perdida no livro), os cacos no chão até alguém limpar' : 'uma caneca de madeira caída na briga: não quebra' })); }
    // ---- the words at its door (D-749): the dish of the day and what it pours, as the kitchen and the shelf have them now — the menu's
    // own reading (G.Taverna.cartaOf: the same stock) —, on the slate of the small house, the board of the middling one, the painted
    // plaque of the large or rich one (G.Taverna.look: the porte)
    let lousa = null;
    if (T && T.cartaOf && T.look) {
      const L = T.look(b); const items = T.cartaOf(b); const dish = items.find(x => x.sort === 'comer' && x.ok); const drinks = items.filter(x => x.sort === 'beber' && x.ok).map(x => x.id);
      lousa = Object.freeze({ k: L.porte === 'carta' ? 'placa' : L.porte === 'quadro' ? 'quadro' : 'lousa', prato: dish ? Object.freeze({ de: dish.de || '?', nome: dish.nome }) : null, bebidas: Object.freeze(drinks.slice(0, 3)),
        why: `${L.porte === 'carta' ? 'a placa pintada' : L.porte === 'quadro' ? 'o quadro' : 'a lousa'} da porta (${L.why || 'casa pequena'}): ${dish ? dish.nome : 'nada para comer hoje'}${drinks.length ? '; ' + drinks.join(', ') : ''} — o que a cozinha e a prateleira têm (o cardápio)` });
    }
    // ---- the keeper's cloth over his shoulder (for the drawing of the body, P6): a people that weaves, the keeper at his counter now
    const kp = op && T && T.keeperOf ? T.keeperOf(b) : null;
    const ombro = kp && kp.inside === b.id && weave ? Object.freeze({ id: kp.id, why: 'o pano do taverneiro no ombro: o povo tece, a taverna aberta' }) : null;
    // ---- the fourth wave (the front T7, D-880 to D-889: planos/taverna-onda4.md) ----
    const festa = festaOf(b, civ, weave, couro, why);
    const porta = portaOf(b);
    const jogos = jogosOf(b);
    const caidos = caidosOf(b, op, T);
    return { louca, mesa: Object.freeze(mesa), sujo: Object.freeze(sujo), rabiscos, manchas, chao: Object.freeze(chao), lousa, ombro, festa, porta, jogos, caidos };
  }
  At.withinRule('taverna', tavernWithin, {
    conta: b => (G.Taverna && G.Taverna.luz ? G.Taverna.luz(b) : null),
    dono: b => { const T = G.Taverna; if (!T || !T.keeperOf) return undefined; const k = T.keeperOf(b); return k && k.home ? G.S.buildings.get(k.home) || null : null; },
  });

  // ------------------------------ in words (the proofs, the developer's panel) ------------------------------
  At.why = function (b) {
    const f = At.fire(b), w = At.wear(b), a = At.about(b);
    return { fumaca: f ? f.txt : 'nada aceso', janela: At.lit(b) ? `${At.awake(b)} acordado(s) dentro` : 'ninguém acordado dentro', desgaste: w ? `${At.years(b)} ano(s), umidade ${w.dampLv}, cuidado ${w.care}` : 'anos que o mundo não sabe', emVolta: a };
  };
})(window.G);
