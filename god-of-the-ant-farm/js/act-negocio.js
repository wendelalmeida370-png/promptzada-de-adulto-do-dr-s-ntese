'use strict';
// ============================================================
//  A business of one's own: a stall in the market. Each merchant
//  of a market keeps a stall with its own stock (the depot's 'z:'
//  holder), bought wholesale at the people's store and paid for —
//  from the family's coins into the treasury; where the people has
//  no coin, taken on account and paid back in the goods the stall
//  got in exchange. The stall shows what it holds and no more; the
//  price is the merchant's (what it cost, a margin, what is scarce
//  in town). Buyers come for what their houses lack: they ask,
//  haggle, accept, counter or walk away, pay with the coins of
//  their house (or in kind), and carry the thing home — it is the
//  house's on the way. At dusk the stall closes and the day is
//  counted; the merchant moves the margin by what sold and what did
//  not, and stocks more of what sells. The god's body can do all of
//  it by the same steps, and the stall goes on without it.
//  (A fair and a black market stay the people's and the smugglers'
//  shelves, as before: economy.js.)
// ============================================================
(function (G) {
  const A = G.Act, D = G.Depot, E = G.Eco; if (!A || !D || !E) return;
  const B = G.Biz = {};
  const EPS = 1e-6;
  const r2 = x => Math.round(x * 100) / 100;
  const say = (v, key, ctx) => G.Falas && G.Falas.say(v, key, ctx);
  const AN = A.ANIM;
  const WHOLE = 0.6;        // the wholesale price, of the town's price
  const MARGIN0 = 0.25;     // a new stall's margin over the town's price
  const OWE_MAX = 12;       // a people without coin: what the store gives a stall on account before it is paid
  const all = () => G.S.biz || (G.S.biz = []);
  const live = z => !!z && z.st !== 'fim';
  B.all = () => all().filter(live);
  B.get = id => D.zOf(id);
  B.of = v => { const id = v && (v.id || v); for (const z of all()) if (live(z) && z.st === 'on' && z.owner === id) return z; return null; };
  B.at = (b, slot) => { const id = b && (b.id || b); for (const z of all()) if (live(z) && z.b === id && z.slot === slot) return z; return null; };
  B.hasStalls = b => { const id = b && (b.id || b); for (const z of all()) if (z.st === 'on' && z.b === id) return true; return false; };
  // the hours of a market: from the morning to dusk
  B.hours = () => { const t = G.S.time; return t > 0.06 && t < 0.62; };
  const coin = z => E.coinage(z.fac);
  // the people's way of paying, as its people say it
  B.money = function (fid) { const f = G.Fac.get(fid); const civ = f ? f.civ : 'classico'; const M = (G.Falas && G.Falas.MONEY[civ]) || ['moeda', 'moedas']; return { nome: M[0], plural: M[1], troca: !E.coinage(fid) }; };
  const fresh = d => ({ d, rev: 0, cost: 0, sold: {}, ref: {}, cust: 0, refus: 0, hag: 0, n: 0, open: 0 });

  // ------------------------------ where a stall is ------------------------------
  // (the interiors give the counter's place when a market has a plan: G.Biz.spotOf = (b, slot) → { seller, buyer, inside }.
  // A counter inside the building is reached through the plan's door and then by the plan's own walk — not yet: until the
  // world's people walk inside a plan, a place the map of the world cannot stand on is the front of the market, as today)
  B.spotOf = null;
  function spots(z) {
    const b = G.S.buildings.get(z.b); if (!b) return null;
    if (B.spotOf) { const s = B.spotOf(b, z.slot); if (s && s.seller && s.buyer && G.W.walkableXY(s.seller[0], s.seller[1]) && G.W.walkableXY(s.buyer[0], s.buyer[1])) { const dx = s.buyer[0] - s.seller[0], dy = s.buyer[1] - s.seller[1]; return { seller: s.seller, buyer: s.buyer, dx, dy }; } }
    if (!b.blocks && E.stallSpot) { const sl = E.stallSpot(b, z.slot, false), bu = E.stallSpot(b, z.slot, true); return { seller: sl, buyer: bu, dx: bu[0] - sl[0], dy: bu[1] - sl[1] }; }
    // a market hall: the stalls stand along its front, by the door — the middle one at the door, the others to its sides
    const d = G.Vg.door(b); const c = G.Village.center(b);
    let fx = d[0] - c[0], fy = d[1] - c[1]; const fl = Math.hypot(fx, fy) || 1; fx /= fl; fy /= fl;
    const sx = -fy, sy = fx; const off = (z.slot === 1 ? -1 : z.slot === 2 ? 1 : 0) * 0.85;
    let sel = [d[0] + sx * off, d[1] + sy * off]; if (!G.W.walkableXY(sel[0], sel[1])) sel = d;
    let buy = [sel[0] + fx * 0.7, sel[1] + fy * 0.7]; if (!G.W.walkableXY(buy[0], buy[1])) buy = [sel[0] + fx * 0.35, sel[1] + fy * 0.35];
    return { seller: sel, buyer: buy, dx: fx, dy: fy };
  }
  B.spots = spots;
  // someone sells there now: the merchant at the counter (or the god's body standing by it)
  B.manned = function (z) {
    if (!live(z) || !z.open) return false; const v = G.S.villagers.get(z.owner); if (!v) return false;
    if (A.isBody(v)) { const sp = spots(z); return !!sp && G.dist(v.x, v.y, sp.seller[0], sp.seller[1]) < 1.6; }
    return !!(v.task && v.task.type === 'banca' && v.task.biz === z.id && v.task.st >= 1);
  };

  // ------------------------------ prices ------------------------------
  // the price of a good at a stall, in the people's money (or its exchange value): the town's price, the merchant's margin,
  // and what is scarce in town (the people's store holds little of it)
  B.price = function (z, k) {
    const base = E.PRICE[k] || 0.3; const m = z.margin[k] !== undefined ? z.margin[k] : MARGIN0;
    const f = G.Fac.get(z.fac); const st = f ? (f.stock[k] || 0) : 0;
    const scarce = st < 4 ? 0.25 : st < 12 ? 0.1 : 0;
    return r2(Math.max(0.05, base * (1 + m + scarce)));
  };
  // never below what it cost, and a little over
  B.floor = (z, k) => r2(Math.max(0.05, (z.cost[k] || (E.PRICE[k] || 0.3) * WHOLE) * 1.05));
  const qty = (z, k) => Math.min(k === 'food' ? 3 : 1, Math.floor((z.inv[k] || 0) + EPS));
  // what a people without coin pays with: food for goods, and for food the most plentiful good of the house
  function payGood(h, k) {
    if (k !== 'food') return 'food';
    const I = h.inv || {}; let best = null, bn = 0;
    for (const q in I) if (q !== 'food' && q !== 'moedas' && E.PRICE[q] && I[q] * E.PRICE[q] > bn) { bn = I[q] * E.PRICE[q]; best = q; }
    return best;
  }
  // what the buyer's house can give: its coins, or the value of what it pays with
  function means(v, h, z, k) {
    if (coin(z)) return E.purse(v);
    const pg = payGood(h, k); if (!pg) return 0;
    return r2(D.get('h:' + h.id, pg) * (E.PRICE[pg] || 0.3));
  }
  // what a house would give for one more of a good: what it lacks and what it can spend (and the buyer's own nature)
  function wtp(v, h, z, k) {
    const base = E.PRICE[k] || 0.3; const res = h.res || 1; const I = h.inv || {};
    const have = k === 'food' ? (h.pantry || 0) : (I[k] || 0);
    const want = k === 'food' ? res * 2 : Math.max(1, res * ((E.HOUSE_WANTS[k] || 0.05) * 2));
    const lack = G.clamp(1 - have / want, 0, 1);
    const cash = means(v, h, z, k);
    const ease = G.clamp(cash / (base * 6), 0, 2);
    let w = base * (0.9 + lack * 0.45 + ease * 0.12);
    const T = v.traits || [];
    if (T.includes('Glutão') && k === 'food') w *= 1.12;
    if (T.includes('Curioso') && !E.HOUSE_WANTS[k] && k !== 'food') w *= 1.1;
    if (T.includes('Romântico') && (k === 'joias' || k === 'perolas' || k === 'plumas' || k === 'seda')) w *= 1.12;
    if (T.includes('Cético')) w *= 0.93;
    return r2(Math.min(w, cash / Math.max(1, qty(z, k))));
  }
  B.wtp = wtp;
  // the merchant's answer to an offer: take it, meet it half way, or not below what it cost (the same rule for the god's
  // body's stall: its margin is the player's)
  function answer(z, k, price, offer) {
    const fl = B.floor(z, k);
    if (offer >= price * 0.95 - EPS) return { act: 'aceitar', p: r2(offer) };
    if (offer < fl - EPS) return { act: 'recusar_oferta' };
    return { act: 'contrapropor', p: r2(Math.max(fl, (price + offer) / 2)) };
  }
  B.answer = answer;
  // the money of a sum, as the stall's people says it ("2,4 denários", or "3 de comida" in exchange)
  function says(z, h, k, unit) {
    if (coin(z)) return unit;
    const pg = h ? payGood(h, k) : 'food'; const q = r2(unit / (E.PRICE[pg || 'food'] || 0.25));
    return `${String(Math.round(q * 10) / 10).replace('.', ',')} de ${E.name(pg || 'food')}`;
  }

  // ------------------------------ opening and closing ------------------------------
  B.open = function (v, b) {
    const S = G.S; if (!v || !b) return null;
    const n = (G.BDEF[b.type] && G.BDEF[b.type].jobs) || 3;
    let slot = -1; for (let k = 0; k < n; k++) if (!B.at(b, k)) { slot = k; break; }
    if (slot < 0) return null;
    const z = { id: S.nextId++, owner: v.id, home: v.home || 0, set: b.set, fac: G.Village.facOfSet(b.set), b: b.id, slot, kind: 'banca', inv: {}, cost: {}, margin: {}, want: {}, owe: {}, got: {}, open: 0, since: S.day, day: fresh(S.day), prev: null, hist: [], st: 'on' };
    all().push(z); D.zVer++;
    // (a market of an older world kept one shelf for all its merchants: the first stall takes it over, through the depot —
    // what does not fit on its counter goes back to the people's store; nothing is lost)
    const I = b.inv || {};
    for (const k of Object.keys(I)) {
      const q = I[k]; if (!(q > EPS)) continue;
      const r = D.move('b:' + b.id, 'z:' + z.id, k, q, { code: 'prateleira', part: true, by: v.id }); if (r.ok) z.cost[k] = r2((E.PRICE[k] || 0.3) * WHOLE);
      if ((I[k] || 0) > EPS) D.move('b:' + b.id, 'f:' + z.fac, k, I[k], { code: 'prateleira', part: true, by: v.id });
    }
    A.note(v, 'memory', `Abri uma banca n${G.gen(G.Village.buildName(b)) === 'a' ? 'a' : 'o'} ${G.Village.buildName(b).toLowerCase()}.`);
    return z;
  };
  // a business ends: its stock goes to the family's house (or the people's store); the coins were always the family's
  B.close = function (z, why) {
    if (!live(z)) return;
    z.open = 0; if (z.st === 'on') { z.st = 'saindo'; z.why = why || ''; }
    const S = G.S;
    const home = z.home && D.exists('h:' + z.home) ? 'h:' + z.home : null;
    if (!coin(z) && oweTotal(z) > EPS) settle(z, home);
    for (const k of Object.keys(z.inv)) {
      let q = z.inv[k] || 0; if (!(q > EPS)) continue;
      if (home) { const r = D.move('z:' + z.id, home, k, q, { code: 'fechou', part: true, by: z.owner }); if (r.ok) q = r2(q - r.n); }
      if (q > EPS) D.move('z:' + z.id, 'f:' + z.fac, k, q, { code: 'fechou', part: true, by: z.owner });
    }
    // (what is on its way to the stall goes home instead)
    for (const v of S.villagers.values()) if (v.carry && v.carry.to === 'z:' + z.id) v.carry.to = home || 'f:' + z.fac;
    if (!Object.keys(z.inv).some(k => z.inv[k] > EPS)) { z.st = 'fim'; z.end = S.day; D.zVer++; }
  };

  // (a people without coin: a stall that closes owing the store pays first — its stock back, at what it cost, then what it
  // earned in kind that the house still has — and only the rest goes home; what nothing pays is forgiven, and remembered.
  // Without this, what was taken on account became the family's when the merchant changed trade)
  function settle(z, home) {
    const f = 'f:' + z.fac; if (!D.exists(f)) return;
    let owe = oweTotal(z);
    for (const k of Object.keys(z.inv).sort()) {
      if (owe <= EPS) break; const unit = Math.max(0.01, z.cost[k] || r2((E.PRICE[k] || 0.3) * WHOLE));
      const q = Math.min(z.inv[k] || 0, owe / unit); if (!(q > EPS)) continue;
      const r = D.move('z:' + z.id, f, k, q, { code: 'acerto', part: true, by: z.owner }); if (r.ok) owe = r2(owe - r.n * unit);
    }
    if (home) for (const k of Object.keys(z.got).sort()) {
      if (owe <= EPS) break; const val = Math.max(0.01, E.PRICE[k] || 0.3);
      const hb = G.S.buildings.get(+home.slice(2)); const keep = k === 'food' ? ((hb && hb.res) || 1) : 0;
      const q = Math.min(z.got[k] || 0, Math.max(0, D.get(home, k) - keep), owe / val); if (!(q > EPS)) continue;
      const r = D.move(home, f, k, q, { code: 'acerto', part: true, by: z.owner }); if (r.ok) owe = r2(owe - r.n * val);
    }
    z.owe = {}; z.got = {};
    const o = G.S.villagers.get(z.owner);
    if (owe > EPS && o) A.note(o, 'memory', `A banca fechou devendo ${String(owe).replace('.', ',')} ao armazém do povo; ficou perdoado.`);
  }

  // ------------------------------ the merchant's day ------------------------------
  // the stall stocked from the people's store — paid for — and open from the morning to dusk
  B.task = function (v, b, f, H) {
    let z = B.of(v);
    if (z && z.b !== b.id) { B.close(z, 'mudou de mercado'); z = null; }
    if (!z) z = B.open(v, b); if (!z) return null;
    if (!B.hours()) return null; // (the market is shut: another errand, home)
    // (a people without coin: what the stall got in exchange goes to the store, as payment of what it took on account)
    if (!coin(z) && oweTotal(z) > 0) { const k = Object.keys(z.got).sort().find(q => (z.got[q] || 0) >= 2 && spare(z, q) >= 2); if (k) return H.setTask(v, { type: 'devolver', biz: z.id, k, pri: 1, st: 0, id: b.id }); }
    const want = restockPick(z, v, f);
    if (want) return H.setTask(v, { type: 'atacado', biz: z.id, k: want.k, n: want.n, pri: 1, st: 0, id: b.id });
    if (!Object.keys(z.inv).some(k => z.inv[k] >= 1)) return null; // (nothing to sell and nothing to buy: another errand)
    return H.setTask(v, { type: 'banca', biz: z.id, pri: 1, st: 0, dur: G.rr(30, 50), id: b.id });
  };
  const oweTotal = z => { let n = 0; for (const k in z.owe) n += z.owe[k] || 0; return r2(n); };
  // (a people without coin: the payment in kind goes where the coins go in a people with coin — the seller's house, the
  // family's income; with no house, the stall keeps it. What the stall took on account is paid from there)
  const kindTo = z => { const o = G.S.villagers.get(z.owner); return o && E.homeOf(o) ? 'h:' + o.home : 'z:' + z.id; };
  // (what of it can go to the store: the house keeps a day of food for the family)
  function spare(z, k) {
    const ref = kindTo(z); const n = D.get(ref, k);
    if (ref[0] !== 'h' || k !== 'food') return n;
    const h = G.S.buildings.get(+ref.slice(2)); return Math.max(0, n - ((h && h.res) || 1));
  }
  // what the stall lacks most that the store has (and the family can pay for): more of what sold yesterday
  function restockPick(z, v, f) {
    const cash = coin(z) ? D.get(payer(v), 'moedas') : Math.max(0, OWE_MAX - oweTotal(z)); // (on account: up to the limit)
    let best = null, bs = 0;
    for (const k of E.MARKET_GOODS) {
      const sold = (z.prev && z.prev.sold[k]) || 0;
      // (what the town's houses lack: a market hears it — act-compras.js)
      const need = G.Compras ? G.Compras.townNeed(z.set)[k] || 0 : 0;
      const target = (k === 'food' ? 8 : 3) + Math.min(6, Math.round(sold)) + (z.want[k] || 0) + Math.min(6, Math.ceil(need / 3));
      const have = z.inv[k] || 0; if (have >= target) continue;
      const minStore = k === 'food' ? 12 : 2; const inStore = D.free('f:' + f.id, k); if (inStore < minStore) continue;
      const unit = r2((E.PRICE[k] || 0.3) * WHOLE);
      const can = Math.floor((cash + EPS) / Math.max(0.01, unit));
      const n = Math.min(target - have, Math.floor(inStore - minStore / 2), can, k === 'food' ? 8 : 4, Math.floor(D.room('z:' + z.id, k)));
      if (n < 1) continue;
      const sc = ((target - have) / target) * (1 + sold * 0.3 + Math.min(3, need / 4)) * (1 + (E.PRICE[k] || 0.3));
      if (sc > bs + EPS) { bs = sc; best = { k, n }; }
    }
    return best;
  }
  const payer = v => (E.homeOf(v) ? 'h:' + v.home : 'p:' + v.id);
  const payee = z => { const o = G.S.villagers.get(z.owner); if (o && E.homeOf(o)) return 'h:' + o.home; if (o) return 'p:' + o.id; return 'f:' + z.fac; };
  // (a path that ends short — cut by a wall, or a corner it could not round — is walked again from where it ended, a few
  // times; only then is the place out of reach)
  function walkTo(v, t, key, x, y, dt, H) {
    if (t.wk !== key) { t.wk = key; if (!H.goto(v, x, y, false) && !H.goto(v, x, y, true, G.N * G.N)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; if (G.dist(v.x, v.y, x, y) < 1.5) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  function walkB(v, t, b, dt, H) {
    const key = 'b' + b.id;
    if (t.wk !== key) { t.wk = key; if (!G.Vg.gotoB(v, b, 0.2)) { t.wk = null; return -1; } }
    if (H.move(v, dt)) { t.wk = null; const [fx, fy] = G.Village.frontTile(b); if (G.dist(v.x, v.y, fx, fy) < 2.2 || G.dist(v.x, v.y, b.x + b.w / 2, b.y + b.h / 2) < Math.max(b.w, b.h)) { t.rt = 0; return 1; } t.rt = (t.rt || 0) + 1; return t.rt > 3 ? -1 : 0; }
    return 0;
  }
  // the wholesale purchase: at the store's door the goods into the arms and the coins into the treasury, at once (no coin,
  // no goods); then to the stall with them — the load knows where it goes, a save on the way does not lose it
  function runAtacado(v, t, dt, H) {
    const z = B.get(t.biz); if (!z || z.st !== 'on') return H.end(v);
    const f = G.Fac.get(z.fac); if (!f) return H.end(v);
    if (t.st === 0) {
      const d = G.Village.nearestDropoff(v.x, v.y, v.set); if (!d) return H.end(v);
      const r = walkB(v, t, d, dt, H); if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return;
    }
    if (t.st === 1) {
      v.act = AN.examinar.act; if (v.actT < AN.examinar.contact) return;
      const r = wholesale(v, z, t.k, t.n); if (!r.ok) return H.end(v);
      return H.setTask(v, { type: 'carga', to: 'z:' + z.id, pri: 1, st: 0 });
    }
  }
  // the purchase at the store's door (the merchant's and the god's body's): the goods into the arms and the coins into the
  // treasury at once — no coin, no goods; a people without coin takes them on account, and the stall pays in kind later
  function wholesale(v, z, k, want) {
    const f = G.Fac.get(z.fac); if (!f) return { ok: false, why: 'O povo não existe mais.' };
    // (no more than fits on the stall's sales furniture, counting what the hands already take there)
    const onWay = v.carry && v.carry.to === 'z:' + z.id && v.carry.k === k ? v.carry.n : 0;
    const fits = Math.floor(D.room('z:' + z.id, k) - onWay + EPS);
    const n = Math.min(want, Math.floor(D.free('f:' + f.id, k)), Math.floor(D.room('v:' + v.id, k, { to: 'z:' + z.id })), fits);
    if (n < 1) return { ok: false, why: D.free('f:' + f.id, k) < 1 ? 'O armazém não tem.' : fits < 1 ? 'Não cabe mais nada disso na banca.' : 'Suas mãos estão ocupadas.' };
    const cost = r2((E.PRICE[k] || 0.3) * n * WHOLE);
    let r;
    if (coin(z)) {
      const from = payer(v); if (D.get(from, 'moedas') + EPS < cost) return { ok: false, why: 'Falta dinheiro para o atacado.' };
      r = D.swap(['f:' + f.id, 'v:' + v.id, k, n], [from, 'f:' + f.id, 'moedas', cost], { code: 'atacado', by: v.id, to: 'z:' + z.id });
      if (r.ok) { E.ensure(f); f.eco.sales += cost; }
    } else {
      if (oweTotal(z) + cost > OWE_MAX + EPS) return { ok: false, why: 'O armazém não fia mais: primeiro pague o que deve.' };
      r = D.move('f:' + f.id, 'v:' + v.id, k, n, { code: 'fiado', by: v.id, to: 'z:' + z.id });
      if (r.ok) z.owe[k] = r2((z.owe[k] || 0) + cost);
    }
    if (!r.ok) return r;
    const had = z.inv[k] || 0; z.cost[k] = r2(((z.cost[k] || cost / n) * had + cost) / (had + n));
    z.day.cost = r2(z.day.cost + cost);
    return { ok: true, n, cost };
  }
  // a people without coin: the exchange goods the stall earned carried from where they went (the family's house, or the
  // stall itself) to the people's store, paying what it took on account
  function runDevolver(v, t, dt, H) {
    const z = B.get(t.biz); if (!z || z.st !== 'on') return H.end(v);
    const from = kindTo(z); const home = from[0] === 'h' ? G.S.buildings.get(+from.slice(2)) : null;
    if (t.st === 0) {
      let r; if (home) r = walkB(v, t, home, dt, H); else { const sp = spots(z); if (!sp) return H.end(v); r = walkTo(v, t, 'banca', sp.seller[0], sp.seller[1], dt, H); }
      if (r < 0) return H.end(v); if (r > 0) { t.st = 1; v.actT = 0; } return;
    }
    v.act = AN.tirarDaBanca.act; if (v.actT < AN.tirarDaBanca.contact) return;
    const n = Math.min(Math.floor(spare(z, t.k) + EPS), z.got[t.k] || 0, Math.floor(D.room('v:' + v.id, t.k, { to: 'f:' + z.fac })));
    if (n < 1) return H.end(v);
    const r = D.move(from, 'v:' + v.id, t.k, n, { code: 'troca', by: v.id, to: 'f:' + z.fac });
    if (!r.ok) return H.end(v);
    z.got[t.k] = r2((z.got[t.k] || 0) - r.n); if (z.got[t.k] <= EPS) delete z.got[t.k];
    // (the debt goes down by what it is worth, good by good from the oldest)
    let val = r2(r.n * (E.PRICE[t.k] || 0.3)); for (const k of Object.keys(z.owe)) { const m = Math.min(val, z.owe[k]); z.owe[k] = r2(z.owe[k] - m); val = r2(val - m); if (z.owe[k] <= EPS) delete z.owe[k]; if (val <= EPS) break; }
    return H.setTask(v, { type: 'carga', to: 'f:' + z.fac, pri: 1, st: 0 });
  }
  // at the counter: the stall open, the goods out, a call to the street now and then; the buyers do the rest
  function runBanca(v, t, dt, H) {
    const S = G.S; const z = B.get(t.biz); if (!z || z.st !== 'on' || z.owner !== v.id) return H.end(v);
    const sp = spots(z); if (!sp) return H.end(v);
    if (t.st === 0) {
      const r = walkTo(v, t, 'banca', sp.seller[0], sp.seller[1], dt, H); if (r < 0) return H.end(v);
      if (r > 0) { t.st = 1; v.actT = 0; t.pT = 0; if (!z.open && B.hours()) { z.open = 1; z.day.open = 1; say(v, 'abrir', {}); } }
      return;
    }
    if (!B.hours()) return H.end(v);
    if (!z.open) { z.open = 1; z.day.open = 1; }
    v.act = AN.vender.act; G.faceTo(v, sp.dx || 0.7, sp.dy || 0.7);
    const line = G.Life ? G.Life.queueLen('biz:' + z.id) : 0;
    if (!line && v.actT - (t.pT || 0) > 16) { t.pT = v.actT; const ks = Object.keys(z.inv).filter(k => z.inv[k] >= 1).sort(); if (ks.length) say(v, 'pregao', { k: ks[Math.floor(G.hash(v.id + S.day * 7 + Math.floor(v.actT)) * ks.length) % ks.length] }); }
    if (!Object.keys(z.inv).some(k => z.inv[k] >= 1)) return H.end(v); // (sold out: to the store for more)
    if (v.actT > t.dur && !line) return H.end(v);
  }

  // ------------------------------ the buyers ------------------------------
  // what a house goes to the market for: what it lacks of the things a house keeps, what a rich house fancies, food
  function needsOf(h, v) {
    const I = h.inv || {}; const res = h.res || 1;
    const need = Object.keys(E.HOUSE_WANTS).filter(k => (I[k] || 0) < Math.max(1, res * E.HOUSE_WANTS[k] * 2));
    if (E.wishes) for (const k of E.wishes(h, v)) if (!need.includes(k)) need.push(k);
    if ((h.pantry || 0) < res) need.push('food');
    return need;
  }
  // the stall for it: one open, with someone at the counter and the thing on it; the best deal near at hand (want: the
  // house's own list, when the house sends someone for it — act-compras.js)
  B.shop = function (v, H, want) {
    const S = G.S; const h = E.homeOf(v); if (!h || v.captive || v.age < 14 || !B.hours()) return null;
    let any = false; for (const z of all()) if (live(z) && z.set === v.set && z.open) { any = true; break; } if (!any) return null;
    const need = want || needsOf(h, v); if (!need.length) return null;
    let best = null, bs = 0;
    for (const z of all()) {
      if (!live(z) || z.st !== 'on' || z.set !== v.set || !z.open || !B.manned(z)) continue;
      if (z.owner === v.id || (z.home && z.home === h.id)) continue; // (the family's own stall: nothing to buy from oneself)
      const sp = spots(z); if (!sp || !G.W.reaches(v, sp.buyer[0], sp.buyer[1])) continue;
      for (const k of need) {
        if ((z.inv[k] || 0) < 1) continue;
        const p = B.price(z, k), w = wtp(v, h, z, k); if (w < p * 0.6) continue;
        const sc = (1 + Math.min(0.5, (w - p) / p)) / (1 + G.dist(v.x, v.y, sp.buyer[0], sp.buyer[1]) * 0.05);
        if (sc > bs + EPS) { bs = sc; best = [z, k]; }
      }
    }
    if (!best) return null;
    return H.setTask(v, { type: 'compra', biz: best[0].id, k: best[1], pri: 0.35, st: 0 });
  };
  const STEP = 1.3; // (a line said, the other answers: the pace of the talk at the counter)
  function done(v, H) { G.Life && G.Life.leaveQueue(v); return H.end(v); }
  function runCompra(v, t, dt, H) {
    const S = G.S; const z = B.get(t.biz); const h = E.homeOf(v);
    if (!z || z.st !== 'on' || !h) return done(v, H);
    const sp = spots(z); if (!sp) return done(v, H);
    const seller = S.villagers.get(z.owner);
    if (t.st === 0) { const r = walkTo(v, t, 'banca', sp.buyer[0], sp.buyer[1], dt, H); if (r < 0) return done(v, H); if (r > 0) { t.st = 1; v.actT = 0; } return; }
    if (t.st === 1) {
      // (nobody at the counter: a moment, then another time)
      if (!B.manned(z)) { v.act = AN.esperar.act; t.wt = (t.wt || 0) + dt; if (t.wt > 12) { z.day.ref[t.k] = (z.day.ref[t.k] || 0) + 1; return done(v, H); } return; }
      const key = 'biz:' + z.id;
      if (v._q !== key && G.Life && G.Life.queueFull(key)) { G.Vg.emote(v, 'sad', 1); return done(v, H); }
      if (G.Life && !G.Life.inLine(v, t, key, sp.buyer[0], sp.buyer[1], sp.dx, sp.dy, dt, H)) { if (t.waited > 40) return done(v, H); return; }
      t.st = 2; v.actT = 0; t.talk = 0; t.said = -1; return;
    }
    if (t.st === 2) {
      v.act = t.talk >= 5 ? AN.pagar.act : AN.pechinchar.act; G.faceTo(v, -sp.dx, -sp.dy);
      if (!B.manned(z)) return done(v, H);
      const k = t.k; const civ = (G.Fac.get(z.fac) || {}).civ;
      if ((z.inv[k] || 0) < 1) { if (t.said !== 99) { t.said = 99; say(seller, 'nao_tenho', { k }); } if (v.actT > STEP) return done(v, H); return; }
      const price = B.price(z, k);
      // (each line once, then a moment for the answer)
      if (t.talk === 0) { if (t.said !== 0) { t.said = 0; say(v, 'perguntar', { k }); } if (v.actT < STEP) return; t.talk = 1; v.actT = 0; return; }
      if (t.talk === 1) {
        if (t.said !== 1) { t.said = 1; say(seller, coin(z) ? 'preco' : 'troca_preco', { k, preco: says(z, h, k, price) }); }
        if (v.actT < STEP) return;
        const w = wtp(v, h, z, k); t.w = w;
        if (means(v, h, z, k) + EPS < price * qty(z, k) * 0.6) { t.talk = 8; v.actT = 0; return; }
        if (w + EPS >= price) { t.p = price; t.talk = 5; v.actT = 0; return; }
        if (w >= price * 0.72) { t.offer = r2(Math.min(w * 0.95, price * 0.88)); t.talk = 2; v.actT = 0; z.day.hag++; return; }
        t.talk = 9; v.actT = 0; return;
      }
      if (t.talk === 2) {
        if (t.said !== 2) { t.said = 2; say(v, coin(z) ? 'pechinchar' : 'troca_pechinchar', { k, preco: says(z, h, k, price), oferta: says(z, h, k, t.offer) }); }
        if (v.actT < STEP) return;
        const a = answer(z, k, price, t.offer);
        if (a.act === 'aceitar') { t.p = a.p; t.talk = 5; t.sayAcc = 1; v.actT = 0; return; }
        if (a.act === 'recusar_oferta') { t.talk = 7; v.actT = 0; return; }
        t.counter = a.p; t.talk = 3; v.actT = 0; return;
      }
      if (t.talk === 3) {
        if (t.said !== 3) { t.said = 3; say(seller, 'contrapropor', { k, oferta: says(z, h, k, t.offer), contra: says(z, h, k, t.counter) }); }
        if (v.actT < STEP) return;
        if (t.w + EPS >= t.counter) { t.p = t.counter; t.talk = 4; v.actT = 0; return; }
        t.talk = 9; v.actT = 0; return;
      }
      if (t.talk === 4) { if (t.said !== 4) { t.said = 4; say(v, 'aceitar_contra', { contra: says(z, h, k, t.counter) }); } if (v.actT < STEP * 0.7) return; t.talk = 5; v.actT = 0; return; }
      if (t.talk === 5) {
        if (t.sayAcc && t.said !== 5) { t.said = 5; say(seller, 'aceitar', {}); }
        if (v.actT < AN.pagar.contact) return;
        // the deal: the goods into the buyer's arms and the payment to the seller's house, both or neither — as many as the
        // house sent for (t.n), as the stall has and as the purse pays, at the price agreed
        // (and as the two hands carry: a load already in them, or more than they hold, is no deal)
        const arms = Math.floor(D.room('v:' + v.id, k, { to: 'h:' + h.id }) + EPS);
        if (arms < 1) { t.talk = 10; v.actT = 0; return; }
        const n = Math.min(Math.max(t.n || 0, qty(z, k)), k === 'food' ? 6 : 3, Math.floor((z.inv[k] || 0) + EPS), Math.max(1, Math.floor((means(v, h, z, k) + EPS) / Math.max(0.01, t.p))), arms);
        if (n < 1) return done(v, H);
        const total = r2(t.p * n);
        let r;
        if (coin(z)) r = D.swap(['z:' + z.id, 'v:' + v.id, k, n], [payer(v), payee(z), 'moedas', total], { code: 'venda', by: v.id, to: 'h:' + h.id, tag: { bought: 1 } });
        else {
          const pg = payGood(h, k); const q = pg ? r2(total / (E.PRICE[pg] || 0.3)) : 0;
          if (pg && q > EPS && D.room(kindTo(z), pg) + EPS < q) { t.talk = 6; v.actT = 0; return; } // (nowhere to keep the payment)
          r = pg && q > EPS ? D.swap(['z:' + z.id, 'v:' + v.id, k, n], ['h:' + h.id, kindTo(z), pg, q], { code: 'venda', by: v.id, to: 'h:' + h.id, tag: { bought: 1 } }) : { ok: false, why: 'nada com que trocar' }; if (r.ok) z.got[pg] = r2((z.got[pg] || 0) + q);
        }
        if (!r.ok) { t.talk = 8; v.actT = 0; return; }
        const d = z.day; d.rev = r2(d.rev + total); d.sold[k] = (d.sold[k] || 0) + n; d.cust++; d.n++;
        say(seller, 'agradecer', {});
        G.Vg.emote(v, 'happy', 1.2); G.Life && G.Life.leaveQueue(v);
        return H.setTask(v, { type: 'carga', to: 'h:' + h.id, pri: 0.5, st: 0 });
      }
      if (t.talk === 6) { if (t.said !== 6) { t.said = 6; say(seller, 'sem_lugar', {}); } if (v.actT < STEP) return; z.day.ref[k] = (z.day.ref[k] || 0) + 1; z.day.refus++; return done(v, H); }
      if (t.talk === 10) { if (t.said !== 10) { t.said = 10; say(v, 'maos_cheias', {}); } if (v.actT < STEP) return; return done(v, H); }
      if (t.talk === 7) { if (t.said !== 7) { t.said = 7; say(seller, 'recusar_oferta', {}); } if (v.actT < STEP) return; t.talk = 9; v.actT = 0; return; }
      if (t.talk === 8) { if (t.said !== 8) { t.said = 8; say(v, 'sem_dinheiro', {}); } if (v.actT < STEP) return; z.day.ref[k] = (z.day.ref[k] || 0) + 1; z.day.refus++; return done(v, H); }
      if (t.talk === 9) { if (t.said !== 9) { t.said = 9; say(v, 'recusar_caro', { k }); } if (v.actT < STEP) return; z.day.ref[k] = (z.day.ref[k] || 0) + 1; z.day.refus++; return done(v, H); }
    }
  }

  // ------------------------------ the day counted ------------------------------
  // at dusk the stall shuts; at the turn of the day its book is closed and the merchant thinks it over: what sold out goes
  // up, what nobody wanted comes down (never below what it cost), and more of what sells is stocked
  function roll(z) {
    const S = G.S; const d = z.day;
    if (d.open || d.n || d.cust || d.refus) {
      z.hist.push([d.d, d.rev, d.cost, d.cust, d.refus, d.hag]); if (z.hist.length > 10) z.hist.splice(0, z.hist.length - 10);
      const owner = S.villagers.get(z.owner);
      if (owner && !A.isBody(owner)) {
        for (const k of new Set(Object.keys(z.inv).concat(Object.keys(d.sold), Object.keys(d.ref)))) {
          const sold = d.sold[k] || 0, left = z.inv[k] || 0, ref = d.ref[k] || 0;
          let m = z.margin[k] !== undefined ? z.margin[k] : MARGIN0;
          if (sold > 0 && left < 1) m += 0.06; else if (ref > sold) m -= 0.06; else if (!sold && left >= 1) m -= 0.03;
          z.margin[k] = r2(G.clamp(m, -0.1, 0.8));
          z.want[k] = G.clamp(Math.round((z.want[k] || 0) + (sold > 0 && left < 1 ? 1 : !sold && left >= 2 ? -1 : 0)), -2, 4);
        }
        if (d.n >= 3 && d.rev > d.cost) A.note(owner, 'memory', `Um bom dia na banca: ${d.n} vendas, ${r2(d.rev)} ${coin(z) ? B.money(z.fac).plural : 'em troca'}.`);
      }
    }
    z.prev = d; z.day = fresh(S.day);
  }
  B.book = z => (z ? { hoje: z.day, ontem: z.prev, hist: z.hist.slice() } : null);
  // once a second: the businesses look at their owners, their places and the clock
  function tick() {
    const S = G.S; const L = all(); let prune = false;
    for (const z of L) {
      if (z.st === 'fim') { if (S.day - (z.end || 0) > 2) prune = true; continue; }
      const v = S.villagers.get(z.owner); const b = S.buildings.get(z.b);
      if (z.st === 'saindo') { B.close(z); continue; }
      if (!b || !b.built) { B.close(z, 'o mercado acabou'); continue; }
      if (!v) { B.close(z, 'o dono morreu'); continue; }
      if (!A.isBody(v) && (v.role !== 'mercador' || v.job !== z.b)) { B.close(z, 'o dono mudou de ofício'); continue; }
      if ((v.home || 0) !== z.home) z.home = v.home || 0;
      if (z.open && !B.hours()) { z.open = 0; if (v.task && v.task.type === 'banca' && v.task.biz === z.id) say(v, 'fechar', {}); }
      if (z.day.d !== S.day) roll(z);
    }
    if (prune) { S.biz = L.filter(z => z.st !== 'fim' || S.day - (z.end || 0) <= 2); D.zVer++; }
  }
  A.hooks.tick.push(tick);
  // (whoever dies or is taken leaves the business at once: its stock goes home)
  A.hooks.gone.push(function (v, why) { for (const z of all()) if (live(z) && z.owner === v.id && (why === 'morte' || why === 'cativo')) B.close(z, why === 'morte' ? 'o dono morreu' : 'o dono foi levado'); });

  // ------------------------------ what the stall shows ------------------------------
  // (the 3D draws exactly this; nothing on it = an empty stall. A good is shown when there is a whole one to sell: what
  // is less than one stays in the stall's stock, and goes home with it at the close)
  B.display = function (z) {
    if (!live(z)) return []; const civ = (G.Fac.get(z.fac) || {}).civ;
    return Object.keys(z.inv).filter(k => z.inv[k] >= 1 - EPS).sort().map((k, i) => ({ k, n: Math.floor(z.inv[k] + EPS), form: D.form(k, civ), slot: z.slot, pos: i, price: B.price(z, k) }));
  };
  // the stall's account in the people's words, for a panel and the diary
  B.text = function (z) {
    if (!z) return ''; const S = G.S; const o = S.villagers.get(z.owner); const b = S.buildings.get(z.b);
    const goods = B.display(z).map(g => `${g.n} de ${E.name(g.k)}`).join(', ') || 'nada exposto';
    return `Banca de ${o ? o.name : '—'}${b ? ' n' + (G.gen(G.Village.buildName(b)) === 'a' ? 'a ' : 'o ') + G.Village.buildName(b).toLowerCase() : ''}: ${z.open ? 'aberta' : 'fechada'}; ${goods}`;
  };

  // ------------------------------ the checker ------------------------------
  B.audit = function (add, s) {
    const fin = x => typeof x === 'number' && isFinite(x);
    const seen = new Map(); const L = s.biz || [];
    const ledger = s.ledger || []; const covers = ledger.length && ledger[0][1] < s.day;
    for (const z of L) {
      if (z.st === 'fim') continue;
      for (const k in z.inv || {}) if (!fin(z.inv[k]) || z.inv[k] < -EPS) add('act', 1, `banca #${z.id}: ${k} = ${z.inv[k]}`);
      const key = z.b + ':' + z.slot; if (seen.has(key)) add('act', 2, `duas bancas no mesmo lugar do mercado #${z.b} (vaga ${z.slot}): #${seen.get(key)} e #${z.id}`); seen.set(key, z.id);
      if (z.open && !s.villagers.has(z.owner)) add('act', 2, `banca #${z.id} aberta sem dono vivo`);
      // the day's book and the ledger: every sale of the day is in it, with its payment
      if (covers && z.day && z.day.d === s.day) {
        let n = 0, rev = 0;
        for (let i = 0; i < ledger.length - 1; i++) {
          const e = ledger[i]; if (e[1] !== s.day || e[8] !== 'venda' || e[3] !== 'z:' + z.id) continue;
          const p = ledger[i + 1]; if (!p || p[8] !== 'venda' || p[0] !== e[0] + 1) continue;
          n++; rev += p[5] === 'moedas' ? p[6] : p[6] * (E.PRICE[p[5]] || 0.3);
        }
        if (n !== z.day.n) add('act', 2, `banca #${z.id}: o livro do dia diz ${z.day.n} vendas, o livro-razão ${n}`);
        else if (Math.abs(r2(rev) - z.day.rev) > 0.05 * Math.max(1, n)) add('act', 2, `banca #${z.id}: o caixa do dia (${z.day.rev}) não bate com os pagamentos do livro-razão (${r2(rev)})`);
      }
    }
  };

  // ------------------------------ the god's body at a stall (the same steps, the same checks) ------------------------------
  const pend = new Map(); // (a counter-offer waiting for the body's answer: { biz, k, p, t } — gone in a moment, never saved)
  G.worldHooks.push(() => { pend.clear(); });
  A.def('negocio', {
    name: 'Negócio', conserve: false,
    purpose: 'Ter uma banca no mercado: comprar no atacado e pagar, expor, vender, negociar, fechar o dia.',
    needs: 'um mercado na cidade e uma vaga de mercador nele',
    avail(c, v, set) {
      if (!c.comercio || !c.comercio.mercado || !c.comercio.mercado.length) return null;
      const S = G.S; for (const id of c.comercio.mercado) { const b = S.buildings.get(id); if (!b) continue; const n = (G.BDEF[b.type] && G.BDEF[b.type].jobs) || 3; let used = 0; for (let k = 0; k < n; k++) if (B.at(b, k)) used++; if (used < n) return { ok: false, why: 'é preciso ser mercador do mercado (o povo escolhe)', txt: `Há uma banca livre n${G.gen(G.Village.buildName(b)) === 'a' ? 'a' : 'o'} ${G.Village.buildName(b).toLowerCase()} de ${set.name}`, known: G.dist(v.x, v.y, b.x, b.y) < 30 }; }
      return null;
    },
    offers(v, x, y, r) {
      const out = []; const h = E.homeOf(v);
      for (const z of all()) {
        if (!live(z) || z.st !== 'on') continue; const sp = spots(z); if (!sp) continue;
        const mine = z.owner === v.id;
        if (mine && G.dist(x, y, sp.seller[0], sp.seller[1]) < r + 1) {
          out.push(z.open ? { id: 'negocio.fechar:' + z.id, act: 'fechar', biz: z.id, label: 'Fechar a banca', at: sp.seller, anim: 'apontar', hands: 0 } : { id: 'negocio.abrir:' + z.id, act: 'abrir', biz: z.id, label: 'Abrir a banca', at: sp.seller, anim: 'apontar', hands: 0, ok: B.hours(), why: B.hours() ? '' : 'O mercado está fechado a esta hora.' });
          if (v.carry && v.carry.n > EPS && !v.carry.op) out.push({ id: 'negocio.porNaBanca:' + z.id, act: 'porNaBanca', biz: z.id, label: `Pôr ${Math.floor(v.carry.n)} de ${E.name(v.carry.k)} na banca`, at: sp.seller, anim: 'porNaBanca', hands: 2, ok: D.room('z:' + z.id, v.carry.k) >= 1, why: 'Não cabe mais disso na banca.' });
          if (!v.carry || v.carry.n <= EPS) for (const g of B.display(z).slice(0, 4)) out.push({ id: 'negocio.tirar:' + z.id + ':' + g.k, act: 'tirarDaBanca', biz: z.id, k: g.k, label: `Tirar ${E.name(g.k)} da banca`, at: sp.seller, anim: 'tirarDaBanca', hands: 2 });
          for (const g of B.display(z).slice(0, 4)) { out.push({ id: 'negocio.mais:' + z.id + ':' + g.k, act: 'precoMais', biz: z.id, k: g.k, label: `Subir o preço de ${E.name(g.k)} (${g.price})`, at: sp.seller, anim: 'apontar', hands: 0 }); out.push({ id: 'negocio.menos:' + z.id + ':' + g.k, act: 'precoMenos', biz: z.id, k: g.k, label: `Baixar o preço de ${E.name(g.k)} (${g.price})`, at: sp.seller, anim: 'apontar', hands: 0 }); }
          continue;
        }
        if (mine || !h || G.dist(x, y, sp.buyer[0], sp.buyer[1]) > r + 1) continue;
        const open = B.manned(z);
        for (const g of B.display(z).slice(0, 4)) {
          const p = B.price(z, g.k); const n = qty(z, g.k); const total = r2(p * n);
          const m = coin(z) ? `${String(total).replace('.', ',')} ${B.money(z.fac)[total === 1 ? 'nome' : 'plural']}` : says(z, h, g.k, total);
          out.push({ id: 'negocio.comprar:' + z.id + ':' + g.k, act: 'comprar', biz: z.id, k: g.k, p, label: `Comprar ${n} de ${E.name(g.k)} por ${m}`, at: sp.buyer, anim: 'pagar', hands: 1, ok: open, why: open ? '' : 'Não há ninguém na banca.' });
          const o = r2(p * 0.85); out.push({ id: 'negocio.pechinchar:' + z.id + ':' + g.k, act: 'pechinchar', biz: z.id, k: g.k, offer: o, label: `Oferecer ${coin(z) ? String(r2(o * n)).replace('.', ',') + ' ' + B.money(z.fac).plural : says(z, h, g.k, o * n)} por ${n} de ${E.name(g.k)}`, at: sp.buyer, anim: 'pechinchar', hands: 0, ok: open, why: open ? '' : 'Não há ninguém na banca.' });
        }
        const q = pend.get(v.id); if (q && q.biz === z.id && G.S.clock - q.t < 20) out.push({ id: 'negocio.aceitarContra:' + z.id, act: 'aceitarContra', biz: z.id, k: q.k, p: q.p, label: `Aceitar ${coin(z) ? String(r2(q.p * qty(z, q.k))).replace('.', ',') + ' ' + B.money(z.fac).plural : says(z, h, q.k, q.p * qty(z, q.k))}`, at: sp.buyer, anim: 'pagar', hands: 1 });
      }
      // at a store of its people, the owner of a stall buys for it
      const mine = B.of(v);
      if (mine && (!v.carry || v.carry.n <= EPS)) {
        const d = G.Village.nearestDropoff(x, y, v.set);
        if (d && G.Village.facOfSet(d.set) === mine.fac) { const [fx, fy] = G.Village.frontTile(d); if (G.dist(x, y, fx, fy) < r + 1) {
          const f = G.Fac.get(mine.fac);
          const ks = E.MARKET_GOODS.filter(k => D.free('f:' + f.id, k) >= 1).sort((a, b) => (D.free('f:' + f.id, b) - D.free('f:' + f.id, a)) || (a < b ? -1 : 1)).slice(0, 4);
          // (a stall whose furniture is full buys nothing: one offer that says so, not four)
          if (ks.length && ks.every(k => D.room('z:' + mine.id, k) < 1)) out.push({ id: 'negocio.atacado:' + mine.id, act: 'atacado', biz: mine.id, k: ks[0], n: 0, label: 'Comprar no atacado para a banca', at: [fx, fy], ref: 'f:' + f.id, anim: 'examinar', hands: 2, ok: false, why: 'A banca está cheia: venda antes de comprar mais.' });
          else for (const k of ks) { const n = Math.min(k === 'food' ? 8 : 4, Math.floor(D.free('f:' + f.id, k)), Math.floor(D.room('v:' + v.id, k, { to: 'z:' + mine.id })), Math.floor(D.room('z:' + mine.id, k) + EPS)); if (n < 1) continue; const cost = r2((E.PRICE[k] || 0.3) * n * WHOLE); out.push({ id: 'negocio.atacado:' + mine.id + ':' + k, act: 'atacado', biz: mine.id, k, n, label: `Comprar ${n} de ${E.name(k)} no atacado para a banca (${coin(mine) ? String(cost).replace('.', ',') + ' ' + B.money(mine.fac).plural : 'fiado, a pagar em troca'})`, at: [fx, fy], ref: 'f:' + f.id, anim: 'examinar', hands: 2 }); }
        } }
      }
      return out;
    },
    acts: {
      atacado: {
        deed: 'compra',
        can(v, o) { const z = B.get(o.biz); if (!z || z.owner !== v.id) return { ok: false, why: 'A banca não é sua.' }; if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos já estão cheias.' }; return { ok: true }; },
        run(v, o) { const z = B.get(o.biz); const r = wholesale(v, z, o.k, o.n); return r.ok ? { ok: true, n: r.n, msg: `Você compra ${r.n} de ${E.name(o.k)} no atacado${coin(z) ? ' por ' + String(r.cost).replace('.', ',') + ' ' + B.money(z.fac).plural : ', fiado'}. Agora é levar à banca.` } : r; },
      },
      abrir: { can(v, o) { const z = B.get(o.biz); return z && z.owner === v.id ? (B.hours() ? { ok: true } : { ok: false, why: 'O mercado está fechado a esta hora.' }) : { ok: false, why: 'A banca não é sua.' }; }, run(v, o) { const z = B.get(o.biz); z.open = 1; z.day.open = 1; say(v, 'abrir', {}); return { ok: true, msg: 'Você abre a banca.' }; } },
      fechar: { can(v, o) { const z = B.get(o.biz); return z && z.owner === v.id ? { ok: true } : { ok: false, why: 'A banca não é sua.' }; }, run(v, o) { const z = B.get(o.biz); z.open = 0; say(v, 'fechar', {}); return { ok: true, msg: 'Você fecha a banca por hoje.' }; } },
      porNaBanca: {
        deed: 'trabalho',
        can(v, o) { const z = B.get(o.biz); if (!z || z.owner !== v.id) return { ok: false, why: 'A banca não é sua.' }; if (!v.carry || v.carry.n <= EPS || v.carry.op) return { ok: false, why: 'Suas mãos estão vazias.' }; if (D.room('z:' + z.id, v.carry.k) < 1) return { ok: false, why: 'Não cabe mais disso na banca.' }; return { ok: true }; },
        run(v, o) { const z = B.get(o.biz); const k = v.carry.k; const r = D.move('v:' + v.id, 'z:' + z.id, k, v.carry.n, { code: 'expor', by: v.id, part: true }); if (!r.ok) return { ok: false, why: r.why }; if (!z.cost[k]) z.cost[k] = r2((E.PRICE[k] || 0.3) * WHOLE); return { ok: true, n: r.n, msg: `Você arruma ${Math.round(r.n)} de ${E.name(k)} na banca.` }; },
      },
      tirarDaBanca: {
        can(v, o) { const z = B.get(o.biz); if (!z || z.owner !== v.id) return { ok: false, why: 'A banca não é sua.' }; if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos já estão cheias.' }; return (z.inv[o.k] || 0) >= 0.5 ? { ok: true } : { ok: false, why: 'Não há mais disso na banca.' }; },
        run(v, o) { const z = B.get(o.biz); const n = Math.min(z.inv[o.k] || 0, Math.floor(D.room('v:' + v.id, o.k))); const r = D.move('z:' + z.id, 'v:' + v.id, o.k, n, { code: 'recolher', by: v.id }); return r.ok ? { ok: true, n: r.n, msg: `Você recolhe ${Math.round(r.n)} de ${E.name(o.k)}.` } : { ok: false, why: r.why }; },
      },
      precoMais: { can(v, o) { const z = B.get(o.biz); return z && z.owner === v.id ? { ok: true } : { ok: false, why: 'A banca não é sua.' }; }, run(v, o) { const z = B.get(o.biz); z.margin[o.k] = r2(G.clamp((z.margin[o.k] !== undefined ? z.margin[o.k] : MARGIN0) + 0.1, -0.3, 1.5)); return { ok: true, msg: `${G.cap(E.name(o.k))} agora sai por ${B.price(z, o.k)}.` }; } },
      precoMenos: { can(v, o) { const z = B.get(o.biz); return z && z.owner === v.id ? { ok: true } : { ok: false, why: 'A banca não é sua.' }; }, run(v, o) { const z = B.get(o.biz); z.margin[o.k] = r2(G.clamp((z.margin[o.k] !== undefined ? z.margin[o.k] : MARGIN0) - 0.1, -0.3, 1.5)); return { ok: true, msg: `${G.cap(E.name(o.k))} agora sai por ${B.price(z, o.k)}.` }; } },
      comprar: {
        deed: 'compra',
        can(v, o) { return canBuy(v, o); },
        run(v, o) { const z = B.get(o.biz); return sell(z, v, o.k, B.price(z, o.k)); },
      },
      pechinchar: {
        can(v, o) { return canBuy(v, o); },
        run(v, o) {
          const z = B.get(o.biz); const seller = G.S.villagers.get(z.owner); const h = E.homeOf(v); const price = B.price(z, o.k);
          say(v, coin(z) ? 'pechinchar' : 'troca_pechinchar', { k: o.k, preco: says(z, h, o.k, price), oferta: says(z, h, o.k, o.offer) });
          const a = answer(z, o.k, price, o.offer);
          if (a.act === 'aceitar') { say(seller, 'aceitar', {}); return sell(z, v, o.k, a.p); }
          if (a.act === 'recusar_oferta') { const txt = say(seller, 'recusar_oferta', {}); z.day.refus++; return { ok: false, why: txt || 'O vendedor não aceita.' }; }
          pend.set(v.id, { biz: z.id, k: o.k, p: a.p, t: G.S.clock }); z.day.hag++;
          const txt = say(seller, 'contrapropor', { k: o.k, oferta: says(z, h, o.k, o.offer), contra: says(z, h, o.k, a.p) });
          return { ok: true, msg: txt || `O vendedor pede ${a.p}.`, counter: a.p };
        },
      },
      aceitarContra: {
        deed: 'compra',
        can(v, o) { const q = pend.get(v.id); if (!q || q.biz !== o.biz || G.S.clock - q.t >= 20) return { ok: false, why: 'A proposta não vale mais.' }; return canBuy(v, o); },
        run(v, o) { const q = pend.get(v.id); pend.delete(v.id); const z = B.get(o.biz); say(v, 'aceitar_contra', { contra: says(z, E.homeOf(v), o.k, q.p) }); return sell(z, v, o.k, q.p); },
      },
    },
  });
  function canBuy(v, o) {
    const z = B.get(o.biz); if (!z || !B.manned(z)) return { ok: false, why: 'Não há ninguém na banca.' };
    if ((z.inv[o.k] || 0) < 1) return { ok: false, why: 'Acabou.' };
    if (v.carry && v.carry.n > EPS) return { ok: false, why: 'Suas mãos já estão cheias.' };
    const h = E.homeOf(v); if (!h) return { ok: false, why: 'Sem casa para onde levar.' };
    return { ok: true };
  }
  // a sale at a price: the same deal as the people's (the goods into the arms, the payment to the seller's house)
  function sell(z, v, k, p) {
    const h = E.homeOf(v); const n = Math.min(qty(z, k), Math.floor(D.room('v:' + v.id, k, { to: 'h:' + h.id }) + EPS)); if (n < 1) return { ok: false, why: qty(z, k) < 1 ? 'Acabou.' : 'Suas mãos não levam mais nada.' };
    const total = r2(p * n); let r;
    if (coin(z)) r = D.swap(['z:' + z.id, 'v:' + v.id, k, n], [payer(v), payee(z), 'moedas', total], { code: 'venda', by: v.id, to: 'h:' + h.id, tag: { bought: 1 } });
    else {
      const pg = payGood(h, k); const q = pg ? r2(total / (E.PRICE[pg] || 0.3)) : 0;
      if (pg && q > EPS && D.room(kindTo(z), pg) + EPS < q) { const txt = say(G.S.villagers.get(z.owner), 'sem_lugar', {}); return { ok: false, why: txt || 'Não há onde guardar a troca.' }; }
      r = pg && q > EPS ? D.swap(['z:' + z.id, 'v:' + v.id, k, n], ['h:' + h.id, kindTo(z), pg, q], { code: 'venda', by: v.id, to: 'h:' + h.id, tag: { bought: 1 } }) : { ok: false, why: 'Você não tem com que trocar.' }; if (r.ok) z.got[pg] = r2((z.got[pg] || 0) + q);
    }
    if (!r.ok) { const txt = say(v, 'sem_dinheiro', {}); return { ok: false, why: txt || r.why }; }
    const d = z.day; d.rev = r2(d.rev + total); d.sold[k] = (d.sold[k] || 0) + n; d.cust++; d.n++;
    say(G.S.villagers.get(z.owner), 'agradecer', {});
    return { ok: true, n, msg: `Você compra ${n} de ${E.name(k)} por ${coin(z) ? String(total).replace('.', ',') + ' ' + B.money(z.fac).plural : says(z, h, k, total)}.` };
  }

  // ------------------------------ the task machines of this file ------------------------------
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'atacado' && t.biz) { runAtacado(v, t, dt, H); return true; }
    if (t.type === 'banca' && t.biz) { runBanca(v, t, dt, H); return true; }
    if (t.type === 'compra' && t.biz) { runCompra(v, t, dt, H); return true; }
    if (t.type === 'devolver' && t.biz) { runDevolver(v, t, dt, H); return true; }
    return oldRun(v, t, dt, H);
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    const z = t.biz && B.get(t.biz);
    if (t.type === 'atacado') return t.st < 1 ? `Indo ao armazém comprar ${E.name(t.k)} para a banca` : `Comprando ${E.name(t.k)} no atacado`;
    if (t.type === 'banca') return z && z.open ? 'Vendendo na banca' : 'Abrindo a banca';
    if (t.type === 'devolver') return `Levando ${E.name(t.k)} da troca ao armazém do povo`;
    if (t.type === 'compra') { const o = z && G.S.villagers.get(z.owner); return t.st < 2 ? `Indo comprar ${E.name(t.k)}${o ? ' na banca de ' + o.name : ''}` : t.talk >= 2 && t.talk <= 4 ? `Pechinchando ${E.name(t.k)}${o ? ' com ' + o.name : ''}` : `Comprando ${E.name(t.k)}${o ? ' de ' + o.name : ''}`; }
    return oldText(v, t);
  };
  // the diary: the person's own stall, and the day it had
  A.hooks.diary.push(function (v, out) {
    const z = B.of(v); if (!z) return;
    const d = z.prev; out.doing.push({ id: z.id, kind: 'doing', txt: B.text(z), day: z.since, biz: z.id });
    if (d && (d.n || d.refus)) out.memories.push({ id: z.id, kind: 'memory', txt: `Ontem na banca: ${d.n} venda(s), ${d.refus} recusa(s), ${r2(d.rev)} ${coin(z) ? B.money(z.fac).plural : 'em troca'} de receita, ${r2(d.cost)} de custo.`, day: d.d });
  });
  A.hooks.canon.push(['biz', () => all().filter(live).map(z => [z.id, z.owner, z.b, z.slot, z.st, Object.keys(z.inv).sort().map(k => k + '=' + Math.round(z.inv[k] * 100) / 100).join(','), z.day.n])]);

  // ------------------------------ the stall, drawn in the god's view (the 3D draws it from B.display too) ------------------------------
  // (only what the stall holds, as it holds it: an empty stall is an empty counter)
  G.renderHooks = G.renderHooks || { ground: [], ents: [] };
  const stallE = new Map();
  G.worldHooks.push(() => { stallE.clear(); });
  G.renderHooks.ents.push(function (add, view, zoom) {
    const S = G.S; if (!S || zoom < 0.6 || !S.biz || !S.biz.length) return;
    for (const z of S.biz) {
      if (!live(z) || z.st !== 'on') continue; const sp = spots(z); if (!sp) continue;
      let e = stallE.get(z.id); if (!e || e.z !== z) stallE.set(z.id, e = { z, fn: drawStall });
      const x = sp.seller[0] + (sp.dx || 0) * 0.35, y = sp.seller[1] + (sp.dy || 0) * 0.35;
      add(x + y + 0.03, e, x, y);
    }
    if (stallE.size > 300) stallE.clear();
  });
  function drawStall(c, e, sx, sy) {
    const z = e.z; const g = B.display(z);
    c.fillStyle = '#7a5a36'; c.fillRect(sx - 2.6, sy - 1.6, 5.2, 1.6); c.fillStyle = '#5a3e22'; c.fillRect(sx - 2.6, sy - 0.3, 5.2, 0.3);
    if (z.open) { c.fillStyle = 'rgba(214,190,140,0.85)'; c.fillRect(sx - 2.8, sy - 4.4, 5.6, 0.7); }
    for (let i = 0; i < Math.min(4, g.length); i++) {
      const col = (E.GOODS[g[i].k] && E.GOODS[g[i].k].col) || (g[i].k === 'food' ? '#b8a060' : '#c8a878');
      const h = Math.min(1.4, 0.5 + g[i].n * 0.08);
      c.fillStyle = col; c.beginPath(); c.ellipse(sx - 1.9 + i * 1.25, sy - 1.6 - h * 0.5, 0.55, h * 0.5, 0, 0, Math.PI * 2); c.fill();
    }
  }

  // ------------------------------ the save ------------------------------
  const fin = x => typeof x === 'number' && isFinite(x);
  const cleanMap = m => { const o = {}; if (m && typeof m === 'object') for (const k in m) if (fin(m[k])) o[k] = m[k]; return o; };
  (G.saveHooks = G.saveHooks || []).push({
    save(out) { out.biz = all().filter(z => z.st !== 'fim' || G.S.day - (z.end || 0) <= 2); },
    load(o) {
      const S = G.S;
      // (a save from before the businesses has none: the merchants open their stalls as they come to work)
      S.biz = Array.isArray(o.biz) ? o.biz.filter(z => z && Number.isInteger(z.id) && Number.isInteger(z.b)).map(z => Object.assign(z, {
        inv: cleanMap(z.inv), cost: cleanMap(z.cost), margin: cleanMap(z.margin), want: cleanMap(z.want), owe: cleanMap(z.owe), got: cleanMap(z.got),
        open: z.open ? 1 : 0, st: z.st === 'fim' || z.st === 'saindo' ? z.st : 'on', slot: Number.isInteger(z.slot) ? z.slot : 0,
        day: z.day && typeof z.day === 'object' ? Object.assign(fresh(S.day), z.day, { sold: cleanMap(z.day.sold), ref: cleanMap(z.day.ref) }) : fresh(S.day),
        hist: Array.isArray(z.hist) ? z.hist.slice(-10) : [], prev: z.prev && typeof z.prev === 'object' ? z.prev : null,
      })) : [];
      D.zVer++; pend.clear();
    },
  });
})(window.G);
