'use strict';
// ============================================================
//  The tavern, deeper: each people drinks its own drink, and
//  most of it is made right there — beer from the town's grain,
//  pulque, mead from the honey of the hives; wine comes from the
//  vineyards. A round costs coin from the drinker's house, a
//  sorrow or a free evening means more rounds, too many mean a
//  bad morning. The tavern keeper brews, serves and closes.
//  (court.js already has the music, the swaying walk home and
//  the brawls; this only gives them their drink and its price.)
// ============================================================
(function (G) {
  const E = G.Eco; const Tv = G.Tavern = {};
  // what each people drinks when there is no wine: and what it is made of
  Tv.DRINK = {
    grego: { k: 'vinho', alt: 'cerveja' }, romano: { k: 'vinho', alt: 'cerveja' }, egipcio: { k: 'cerveja' },
    nordico: { k: 'mel', alt: 'cerveja' }, asteca: { k: 'pulque' }, classico: { k: 'cerveja' },
  };
  Tv.NAME = { vinho: ['vinho', 'ânforas de vinho', 'uma taça de vinho'], mel: ['hidromel', 'potes de hidromel', 'um corno de hidromel'], cerveja: ['cerveja', 'jarras de cerveja', 'uma caneca de cerveja'], pulque: ['pulque', 'cabaças de pulque', 'uma cuia de pulque'] };
  const BREW = { cerveja: 1, pulque: 1 }; // (brewed in the tavern from grain; wine and mead come from the stores)
  const drinkOf = f => Tv.DRINK[(f && f.civ) || 'classico'] || Tv.DRINK.classico;
  // what is on the tavern's shelf right now, best first
  Tv.onShelf = function (b) { const I = b.inv || {}; for (const k of ['vinho', 'mel', 'cerveja', 'pulque']) if ((I[k] || 0) >= 0.5) return k; return null; };

  // ------------------------------ the keeper brews ------------------------------
  // (a tavern that is built has its keeper, even in a small town where the shares of the work round it down to nothing)
  const oldDemand = E.demand;
  E.demand = function (set, fac, A) {
    const out = oldDemand(set, fac, A);
    if (!(out.taverneiro >= 1) && A >= 6) for (const b of G.S.buildings.values()) if (b.type === 'taverna' && b.built && b.set === set.id) { out.taverneiro = 1; break; }
    return out;
  };
  const oldJob = E.jobTask;
  E.jobTask = function (v, H) {
    if (v.role === 'taverneiro') {
      const S = G.S; const b = v.job && S.buildings.get(v.job); const f = G.Fac.ofV(v);
      if (b && b.built && b.type === 'taverna' && f) {
        const I = b.inv || (b.inv = {}); const d = drinkOf(f);
        const brew = BREW[d.k] ? d.k : d.alt && BREW[d.alt] && (f.stock[d.k] || 0) < 2 && (I[d.k] || 0) < 1 ? d.alt : null;
        // the grain goes into the vat when the shelf runs low — first thing, when it is empty — (and the town is not hungry: its granaries half full, or food for everyone)
        if (brew && (I[brew] || 0) < 4 && (I.food || 0) >= 2 && f.stock.food > Math.max(20, Math.min(G.Fac.pop(f.id) * 1.2, G.Village.cap(f.id) * 0.5)) && ((I[brew] || 0) < 1 || G.R() < 0.6)) return H.setTask(v, { type: 'brew', id: b.id, k: brew, pri: 1, st: 0 });
      }
    }
    return oldJob(v, H);
  };
  function runBrew(v, t, dt, H) {
    const S = G.S; const b = S.buildings.get(t.id); if (!b || !b.built) return H.end(v);
    if (t.st === 0) { const d = G.Vg.door(b); if (!H.goto(v, d[0] + 0.3, d[1] + 0.2, false, 3000)) return H.end(v); t.st = 1; t.walk = 0; return; }
    if (t.st === 1) { t.walk += dt; if (H.move(v, dt)) { t.st = 2; v.actT = 0; } else if (t.walk > 50) H.end(v); return; }
    const [cx, cy] = G.Village.center(b); G.faceTo(v, cx - v.x, cy - v.y);
    v.act = v.actT % 4 < 2 ? 'press' : 'fill';
    if (v.actT > 9) {
      const I = b.inv || (b.inv = {});
      if ((I.food || 0) >= 2) { I.food -= 2; I[t.k] = (I[t.k] || 0) + 3; b.brewed = (b.brewed || 0) + 3; }
      H.end(v);
    }
  }
  const oldRun = E.run;
  E.run = function (v, t, dt, H) {
    if (t.type === 'brew') return runBrew(v, t, dt, H), true;
    const r = oldRun(v, t, dt, H);
    if (t.type === 'tavern' && v.task === t && t.st === 1) rounds(v, t);
    return r;
  };
  const oldText = E.taskText;
  E.taskText = function (v, t) {
    if (t.type === 'brew') return `Fazendo ${Tv.NAME[t.k] ? Tv.NAME[t.k][0] : 'bebida'} na taverna`;
    return oldText(v, t);
  };

  // ------------------------------ one more round ------------------------------
  // (each round: half a measure off the shelf, coin from the drinker's house to the keeper's)
  function rounds(v, t) {
    const S = G.S; const b = S.buildings.get(t.id); if (!b || !t.paid) return;
    // (the first cup came with the meal: it counts)
    if (t.rk === undefined) { t.rk = 0; t.next = v.actT + 5; t.dur = Math.max(t.dur || 16, v.actT + 8); if (t.drank) { v.drinks = (v.drinks || 0) + 1; v.drinkDay = S.day; b.served = (b.served || 0) + 1; } }
    if (v.actT < t.next || t.rk >= 4) return;
    t.next = v.actT + 7;
    const k = Tv.onShelf(b); if (!k) return;
    const tr = v.traits || [];
    // a free evening, a sorrow, a merry company: what makes one stay for another
    const want = 0.25 + (tr.includes('Sociável') ? 0.25 : 0) + (tr.includes('Glutão') ? 0.2 : 0) + (v.mourn > 0 ? 0.3 : 0) - (tr.includes('Devoto') ? 0.15 : 0) - (G.isNight() && S.time > 0.92 ? 0.3 : 0) - t.rk * 0.12;
    if (G.R() > want) return;
    const f = G.Fac.ofV(v); const price = 0.3;
    if (f && E.coinage(f.id) && !E.spend(v, price)) return; // (no coin, no round)
    if (f && E.coinage(f.id)) b.takings = (b.takings || 0) + price;
    const I = b.inv; I[k] -= 0.5; t.rk++; v.drinks = (v.drinks || 0) + 1; v.drinkDay = S.day; b.served = (b.served || 0) + 1;
    if (f && E.coinage(f.id)) { const keeper = [...S.villagers.values()].find(o => o.job === b.id); const kh = keeper && E.homeOf(keeper); if (kh) kh.coin = (kh.coin || 0) + price; else { f.stock.moedas += price; E.ensure(f); f.eco.sales += price; } }
    // the second round makes one tipsy, the third drunk for a long while
    if (v.drinks >= 2) v.drunk = Math.max(v.drunk || 0, S.clock + 30 + v.drinks * 22);
    t.dur = (t.dur || 16) + 7;
    G.Vg.emote(v, v.drinks >= 3 ? 'happy' : 'chat', 1.2);
  }
  // the morning after: the drinks of the night are counted, and too many weigh on the day
  let lastDay = -1;
  G.worldHooks.push(() => { lastDay = -1; }); // (a new world, or a save loaded: it starts over)
  Tv.update = function () {
    const S = G.S; if (!S || S.day === lastDay) return; lastDay = S.day;
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
      const f = G.Fac.ofSet(b.set); const d = drinkOf(f);
      h += `<div class="doing">${parts.length ? 'Na prateleira: ' + parts.join(', ') + '.' : 'A prateleira está vazia.'} Aqui se bebe ${Tv.NAME[d.k][0]}${d.alt ? ` (ou ${Tv.NAME[d.alt][0]}, quando falta)` : ''}.${b.brewed ? ` Já se fizeram ${Math.floor(b.brewed)} medidas na casa.` : ''}${b.served ? ` Já serviu ${b.served} ${b.served === 1 ? 'dose' : 'doses'}${b.takings >= 1 ? `, por ${Math.floor(b.takings)} moedas` : ''}.` : ''}</div>`;
    }
    return h;
  };
})(window.G);
