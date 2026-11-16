'use strict';
// ============================================================
//  Mente: the brain of the beasts (D-276). What a beast does when
//  nothing has it — no fear, no prey in its jaws, no fight — is
//  the best of the options the modules register here, by their
//  scores: the brain's own (sleep, the herd, the rank, the mate,
//  the young, the territory), the world's around (G.Meio: the
//  water, the shade, the mud, the shelter, the people), the hunt
//  and the fight's (G.Luta). An option:
//    G.Mente.option(nome, {
//      who(a, sp)        — may this beast have it at all? (cheap)
//      score(a, sp, S)   — 0..1: how much it wants it now (1 urgent)
//      start(a, sp, S)   — takes it up: sets a.state = nome (and its
//                          targets, a.t); false: it could not
//      step(a, dt, sp, S)— the state, each step while it lasts
//                          (true while in it); with busy / hunting
//                          / up as in G.Animals.behave
//    })
//  None above Mente.FLOOR: the old ways of animals.js (graze,
//  wander, follow the leader). Asked only when a beast's idle time
//  runs out — never each step. World module: chance only from
//  G.R, the same seed the same life.
// ============================================================
(function (G) {
  const Me = G.Mente = {};
  const A = G.Animals;
  Me.FLOOR = 0.25;
  Me.list = []; Me.OPT = {};
  Me.option = function (name, def) {
    def.name = name;
    if (Me.OPT[name]) Me.list.splice(Me.list.indexOf(Me.OPT[name]), 1);
    Me.OPT[name] = def; Me.list.push(def);
    if (def.step) A.behave(name, def.step, def);
  };
  // the old ways' meal weighs in (L-1032): a hungry grazer's own meal — the grazing of animals.js, below the brain — is one of
  // the choices, at the score its belly gives it; an option has to want the beast more than its hunger does. Unweighed, any
  // option above the floor (a look-out, a bath, the way to the water) took a hungry gnu from the grass every time: the herds lived
  // above the belly the births wait on (0,45), and the land emptied (the cubs of a 60-year continent: 32 wolves for 141, 5
  // fennecs for 74). The same test as the old ways (hungry above 0,3; the omnivore to 0,6)
  Me.eatScore = function (a, sp) {
    if (!(a.hunger > 0.3) || !(sp.diet === 'herb' || sp.diet === 'browse' || (sp.diet === 'omni' && a.hunger < 0.6))) return 0;
    return Me.FLOOR + (a.hunger - 0.3) * 1.5;
  };
  // the best option now, taken up — or none (false: the old ways)
  Me.decide = function (a, dt, sp, S) {
    let best = null, bs = Math.max(Me.FLOOR, Me.eatScore(a, sp));
    for (let i = 0; i < Me.list.length; i++) { const o = Me.list[i]; if (o.who && !o.who(a, sp)) continue; const s = o.score(a, sp, S); if (s > bs) { bs = s; best = o; } }
    if (!best) return false;
    return best.start(a, sp, S) !== false;
  };
})(window.G);
