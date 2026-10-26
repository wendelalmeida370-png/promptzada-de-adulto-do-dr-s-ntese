'use strict';
// ============================================================
//  The house's shopping. What a family lacks of the things a
//  house uses up — cloth, pots, leather, a jewel, and food for
//  the pantry — is counted from the house itself, and one of the
//  family goes to buy it: at a merchant's stall first, then at
//  the fair or the market's shelf, paying from the house's coins
//  (or in kind, where a people has no coin). One errand at a
//  time for a house, and not more often than it needs; nobody is
//  sent when the house has nothing to pay with. It is the
//  person's own choice of what to do next (decide, in
//  villagers.js), weighed against work and rest, so it is the
//  same in the step and in the skip, with or without anyone
//  looking.
// ============================================================
(function (G) {
  const C = G.Compras = {};
  const E = G.Eco, A = G.Act;
  const EPS = 1e-6;
  const DAYS = 3;    // (what a house keeps of each thing it uses: three days of it)
  const GAP = 0.5;   // (half a day between two errands of the same house)
  const LUXURY = { joias: 1 };

  // what the house lacks, the most lacking first: [{ k, n (how many to buy), lack (0..1) }] — counted from the house,
  // nothing drawn by chance (a rich house's fancies are added when the errand is chosen)
  C.list = function (h) {
    const out = []; if (!h || !G.BDEF[h.type] || !G.BDEF[h.type].housing) return out;
    const res = h.res || 0; if (!res) return out;
    const I = h.inv || {};
    // (a house that saves for a roof of its own — act-casa.js — buys no luxury meanwhile)
    const saving = G.Casa && G.Casa.saving(h);
    for (const k in E.HOUSE_WANTS) {
      if (saving && LUXURY[k]) continue;
      const target = Math.max(1, res * E.HOUSE_WANTS[k] * DAYS);
      const have = I[k] || 0; if (have >= target - EPS) continue;
      out.push({ k, n: Math.ceil(target - have - EPS), lack: Math.min(1, 1 - have / target), use: res * E.HOUSE_WANTS[k] });
    }
    // (food for suppers at home: a day and a half for each — the common store feeds the rest)
    const food = res * 1.5, pan = h.pantry || 0;
    if (pan < food - EPS) out.push({ k: 'food', n: Math.ceil(food - pan - EPS), lack: Math.min(1, 1 - pan / food) * 0.6, use: 0 });
    // (the most lacking first; of two as lacking, the one the house goes through faster)
    out.sort((a, b) => b.lack - a.lack || b.use - a.use || (a.k < b.k ? -1 : 1));
    return out;
  };
  // what the house can pay with: its coins where its people has coin; something to give in exchange where it has not
  C.canPay = function (h) {
    if (!h) return false;
    if (E.coinage(G.Village.facOfSet(h.set))) return (h.coin || 0) >= 0.3;
    if ((h.pantry || 0) >= 1) return true;
    const I = h.inv || {}; for (const k in I) if (k !== 'moedas' && (I[k] || 0) >= 1) return true;
    return false;
  };
  // the one of the house out shopping for it: the errand, or the purchase in the arms on its way home (a mark that went
  // stale — the errand lost in a save, the shopper gone — is let go, in the world's step only)
  C.outOf = function (h) {
    const id = h && h.shopOut; if (!id) return null;
    const v = G.S.villagers.get(id);
    if (v && v.home === h.id && ((v.task && v.task.casa === h.id) || (v.carry && v.carry.bought && v.carry.to === 'h:' + h.id))) return v;
    if (G.inSim) h.shopOut = 0;
    return null;
  };
  // how much this person wants to go shopping for the house now (0: not at all) — a choice among the others of decide():
  // in the market's hours, the house lacking something, able to pay, nobody of it already out, not too soon after the last
  // (the one already out for it keeps the same wish, so that the errand is not dropped for the next chore)
  C.urge = function (v) {
    const S = G.S;
    if (v.age < 14 || v.captive || v.jail || v.aboard || v.held || v.ug || A.isBody(v)) return 0;
    const h = E.homeOf(v); if (!h || !h.res) return 0;
    const out = C.outOf(h); if (out && out.id !== v.id) return 0;
    const L = C.list(h); if (!L.length) return 0;
    if (!out) {
      if (v.carry && v.carry.n > EPS) return 0; // (hands full of something else: one with free hands goes)
      if (!((G.Biz && G.Biz.hours()) || E.fairOpen())) return 0;
      if (S.clock - (h.shopT === undefined ? -1e9 : h.shopT) < GAP * G.DAY_LEN) return 0;
      if (!C.canPay(h)) return 0;
    }
    const well = h.well === undefined ? 0.5 : h.well;
    // (whoever is freest goes: one with a workplace leaves it only when the work weighs little — an old one, a mourner)
    const busy = v.job || (E.isJobRole && E.isJobRole(v.role)) ? 0.55 : 0.85;
    return (0.2 + 0.45 * L[0].lack + (well < 0.45 ? 0.1 : 0)) * busy;
  };
  // what the houses of a town lack, good by good — what a market hears of its town, for the sellers' stock (counted once
  // in an eighth of a day in the world's step; from outside it, counted afresh and not kept)
  let needC = new Map(), needT = -1;
  G.worldHooks.push(() => { needC = new Map(); needT = -1; });
  C.townNeed = function (setId) {
    const S = G.S; const t = Math.floor(S.day * 8 + S.time * 8);
    if (G.inSim && t !== needT) { needC = new Map(); needT = t; }
    let o = G.inSim ? needC.get(setId) : null; if (o) return o;
    o = {}; for (const b of S.buildings.values()) { if (b.set !== setId || !b.built || !b.res) continue; for (const q of C.list(b)) o[q.k] = (o[q.k] || 0) + q.n; }
    if (G.inSim) needC.set(setId, o);
    return o;
  };
  // the errand: the house's list (and a rich house's fancy), to the best stall that has something of it, or to the fair
  // or the market's shelf — marked with the house; tried or not, the house waits a while before the next one
  C.task = function (v, H) {
    const S = G.S; const h = E.homeOf(v); if (!h) return null;
    h.shopT = S.clock;
    const L = C.list(h); if (!L.length || !C.canPay(h)) return null;
    const need = L.map(q => q.k);
    if (E.wishes) for (const k of E.wishes(h, v)) if (!need.includes(k)) need.push(k);
    const t = E.shopTask(v, H, need);
    if (!t) return null;
    // (how much of it: what the house lacks of that thing — the seller and the purse may say less)
    const it = L.find(q => q.k === t.k);
    // (once on the way, the errand is the house's: the day's work does not call the person back from it — hunger, sleep, a
    // storm or anything urgent still do)
    t.casa = h.id; t.n = it ? it.n : 1; t.pri = Math.max(t.pri || 0, 1.02); h.shopOut = v.id;
    return t;
  };

  // the house's list in the diary of its people (what they know: their own house) — a goal of the family, not a duty
  A.hooks.diary.push(function (v, out) {
    const h = E.homeOf(v); if (!h || !out || !out.goals) return;
    const L = C.list(h); if (!L.length) return;
    const who = C.outOf(h);
    out.goals.push({ id: h.id, kind: 'goal', src: 'casa', txt: `A casa precisa de ${L.slice(0, 3).map(q => E.name(q.k)).join(', ')}${who ? ` — ${who.id === v.id ? 'você foi' : who.name + ' foi'} comprar` : C.canPay(h) ? '' : ' (e não tem com que pagar)'}.`, day: G.S.day });
  });
})(window.G);
