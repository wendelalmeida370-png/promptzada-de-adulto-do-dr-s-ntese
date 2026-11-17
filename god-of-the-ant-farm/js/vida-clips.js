'use strict';
// ============================================================
//  The gestures of daily life (22c, D-590 to D-604): clips of the
//  body's one animator (G.ANIM_CLIPS, JOGABILIDADE.md §4.6) for
//  what the people of the world do as they live — the prisoner
//  led with the hands bound behind. Only seen: nothing here reads
//  or writes the world (rule 113); what a gesture holds is the
//  inventory's (G.Inv.held: without the thing, the hands empty).
// ============================================================
(function (G) {
  const K = (id, def) => (G.ANIM_CLIPS = G.ANIM_CLIPS || []).push([id, def]);
  const ARMS = ['shLp', 'shLr', 'shLy', 'elL', 'gripL', 'wristL', 'shRp', 'shRr', 'shRy', 'elR', 'grip', 'wrist'];
  // (bound, walking: the hands held together before the belly, as tied — the head bowed — over the stride; the legs walk under
  // it, led — the act the world gives the prisoner taken to the cell: crime.js, 'bound'. No shackles drawn: the world has none
  // yet, D-548 — the hands are only joined)
  K('bound-andar', { dur: 2, mask: ARMS.concat(['neck']), in: 0.3, out: 0.35, events: { contact: 0.5 },
    keys: { shLp: [[0, -22], [1, -22]], shRp: [[0, -22], [1, -22]], shLr: [[0, -6], [1, -6]], shRr: [[0, 6], [1, 6]], elL: [[0, 64], [1, 64]], elR: [[0, 64], [1, 64]],
      grip: [[0, 0.6], [1, 0.6]], gripL: [[0, 0.6], [1, 0.6]], neck: [[0, 14], [0.5, 17], [1, 14]] } });
})(window.G);
