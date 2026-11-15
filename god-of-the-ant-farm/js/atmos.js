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
// ============================================================
(function (G) {
  const W = G.W, T = G.T;
  const At = G.Atmos = {};
  const EPS = 1e-6, NONE = Object.freeze([]), NOINV = Object.freeze({});

  // ------------------------------ who is where, this instant ------------------------------
  // (one pass over the people for every question of the same instant of the world: who is inside each building — awake, at
  // the house's fire, cooking —, who has each house for home and their trades)
  let cen = null, cenS = null, cenK = -1, cenN = -1;
  const drop = () => { cen = null; cenS = null; fir = null; firS = null; arts.clear(); wet.clear(); };
  G.worldHooks.push(drop);
  At.flush = drop; // (for the proofs: the world changed by hand within the same instant)
  function census() {
    const S = G.S; if (cen && cenS === S && cenK === S.clock && cenN === S.villagers.size) return cen;
    const ins = new Map(), homes = new Map();
    for (const v of S.villagers.values()) {
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
      }
    }
    cen = { ins, homes }; cenS = S; cenK = S.clock; cenN = S.villagers.size;
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
  // what a people can make and has (kept for the day): a loom standing in one of its towns — or cloth in its stores, come by
  // trade —, a house of silk or silk in its stores, the bronze and the iron it has learnt
  const arts = new Map(); const ARTS0 = Object.freeze({ weave: true, silk: false, metal: 1 });
  function artsOf(f) {
    const S = G.S; let a = arts.get(f.id); if (a && a.day === S.day && a.nb === S.buildings.size) return a;
    let loom = false, worms = false;
    for (const b of S.buildings.values()) { if (!b.built || (b.type !== 'tecelagem' && b.type !== 'sericultura')) continue; const s = S.settlements.get(b.set); if (!s || s.fac !== f.id) continue; if (b.type === 'tecelagem') loom = true; else worms = true; }
    const K = (f.tech && f.tech.known) || NOINV;
    a = { day: S.day, nb: S.buildings.size, weave: loom || !!(f.stock && f.stock.tecido >= 1), silk: worms || !!(f.stock && f.stock.seda >= 1), metal: K.ferro !== undefined ? 2 : K.bronze !== undefined ? 1 : 0 };
    arts.set(f.id, a); return a;
  }
  // the standing of a person among their people (polity.js: v.grp), as the clothes tell it
  const GRP = At.GRP = ['', 'povo', 'artesaos', 'mercadores', 'militares', 'sacerdotes', 'nobreza'];
  const DRESS = [];
  const unpack = c => Object.freeze({ code: c, grp: GRP[c & 7], weave: !!(c & 8), silk: !!(c & 16), fur: !!(c & 32), jewel: !!(c & 64), metal: (c >> 7) & 3, cold: (c >> 9) & 3 });
  // (who has no world round them — a portrait, a proof's bare person — dresses as before: woven, dyed, bronze)
  const NEUTRAL = At.NEUTRAL = unpack(1 + 8 + (1 << 7));
  // what the clothes of a person read of the world besides their trade, their age and their house's coin: their standing,
  // what their people weave and forge, what their house has to wear (silk, furs, jewels), the cold out of doors.
  // One small record a combination, kept: its code goes into the outfit's signature
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
    return DRESS[c] || (DRESS[c] = unpack(c));
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
  // how drunk one is, 0 to 1: the tavern's rounds and the wine of the wells leave v.drunk, the instant it wears off
  At.drunk = function (v) { const S = G.S; if (!S || !v || !(v.drunk > S.clock)) return 0; return G.clamp(0.45 + (v.drunk - S.clock) / 120, 0.45, 1); };

  // ------------------------------ in words (the proofs, the developer's panel) ------------------------------
  At.why = function (b) {
    const f = At.fire(b), w = At.wear(b), a = At.about(b);
    return { fumaca: f ? f.txt : 'nada aceso', janela: At.lit(b) ? `${At.awake(b)} acordado(s) dentro` : 'ninguém acordado dentro', desgaste: w ? `${At.years(b)} ano(s), umidade ${w.dampLv}, cuidado ${w.care}` : 'anos que o mundo não sabe', emVolta: a };
  };
})(window.G);
