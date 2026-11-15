'use strict';
// ============================================================
//  The tavern's drinks: each people drinks its own — beer from the
//  town's grain, pulque, mead from the honey of the hives; wine
//  comes from the vineyards. What a round costs, who serves it, the
//  vat where the beer and the pulque are brewed, the tables and the
//  song: act-taverna.js (G.Taverna), the one owner of the tavern's
//  day. Here: the drinks and their names, the keeper every built
//  tavern has, the morning after, the shelf in the panel.
// ============================================================
(function (G) {
  const E = G.Eco; const Tv = G.Tavern = {};
  // what each people drinks when there is no wine: and what it is made of
  Tv.DRINK = {
    grego: { k: 'vinho', alt: 'cerveja' }, romano: { k: 'vinho', alt: 'cerveja' }, egipcio: { k: 'cerveja' },
    nordico: { k: 'mel', alt: 'cerveja' }, asteca: { k: 'pulque' }, classico: { k: 'cerveja' },
  };
  Tv.NAME = { vinho: ['vinho', 'ânforas de vinho', 'uma taça de vinho'], mel: ['hidromel', 'potes de hidromel', 'um corno de hidromel'], cerveja: ['cerveja', 'jarras de cerveja', 'uma caneca de cerveja'], pulque: ['pulque', 'cabaças de pulque', 'uma cuia de pulque'] };
  const drinkOf = f => Tv.DRINK[(f && f.civ) || 'classico'] || Tv.DRINK.classico;
  // what is on the tavern's shelf right now, best first (a round's worth of it: G.Taverna.DOSE)
  Tv.onShelf = function (b) { const I = b.inv || {}; const T = G.Taverna; for (const k of ['vinho', 'mel', 'cerveja', 'pulque']) if ((I[k] || 0) >= (T ? T.DOSE[k] : 0.5) - 1e-6) return k; return null; };

  // ------------------------------ the keeper ------------------------------
  // (a tavern that is built has its keeper, even in a small town where the shares of the work round it down to nothing)
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A);
    if (!(out.taverneiro >= 1) && A >= 6) for (const b of G.S.buildings.values()) if (b.type === 'taverna' && b.built && b.set === set.id) { out.taverneiro = 1; break; }
    return out;
  };

  // the morning after: the drinks of the night are counted, and too many weigh on the day
  Tv.update = function () {
    const S = G.S; if (!S || S.day === G.mod('tavern.day')) return; G.mod('tavern.day', S.day); // (the world's, in the save: no second morning after on a load, L-694)
    for (const v of S.villagers.values()) {
      if (!v.drinks) continue;
      if (v.drinkDay !== S.day) {
        if (v.drinks >= 3) { v.energy = Math.max(8, (v.energy || 50) - 6 * v.drinks); v.hang = S.day; v.heavyN = (v.heavyN || 0) + 1; }
        v.drinks = 0;
      }
    }
  };
  // the tavern's panel: what is on the shelf
  const oldHTML = E.buildingHTML;
  E.buildingHTML = function (b, plink, esc) {
    let h = oldHTML(b, plink, esc);
    if (b.type === 'taverna' && b.built) {
      const I = b.inv || {}; const parts = [];
      for (const k of ['vinho', 'mel', 'cerveja', 'pulque']) if ((I[k] || 0) >= 1) parts.push(`${Math.floor(I[k])} ${Tv.NAME[k][1]}`);
      if ((I.food || 0) >= 1) parts.push(`${Math.floor(I.food)} de comida`);
      const f = G.Fac.ofSet(b.set); const d = drinkOf(f);
      h += `<div class="doing">${parts.length ? 'Na prateleira: ' + parts.join(', ') + '.' : 'A prateleira está vazia.'} Aqui se bebe ${Tv.NAME[d.k][0]}${d.alt ? ` (ou ${Tv.NAME[d.alt][0]}, quando falta)` : ''}.${b.served ? ` Já serviu ${b.served} ${b.served === 1 ? 'dose' : 'doses'}.` : ''}</div>`;
    }
    return h;
  };
})(window.G);
