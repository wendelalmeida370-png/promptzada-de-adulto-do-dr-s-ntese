'use strict';
// ============================================================
//  Inventário: what a person carries and what they hold (D-336).
//  Three things, one door each:
//   - the bag (v.mochila: { key: n }) is a holder of the G.Depot,
//     'm:<id>', and every thing in or out of it is a move of the
//     Depot, in the ledger;
//   - the equipment (v.equip: { mao, outra, costas, cinto, cabeca,
//     corpo, atalhos }) says where the things of the bag sit on the
//     body — equipping is no move of goods, only a place: what is
//     equipped is always in the bag;
//   - what a person holds right now, for whoever asks (the 3D, the
//     fight, the work): G.Inv.held(v) — their own things when they
//     have any, else the trade's kit (G.Inv.kit), the things a
//     lumberjack, a warrior, an elder carry by their trade and act,
//     derived and pure, as the clothes are (G.Atmos.dress).
//  Only this file writes v.mochila and v.equip (the guard's rule
//  111). The contract of the gameplay base: JOGABILIDADE.md. This
//  file starts as the contract's skeleton: kit and held answer;
//  the bag, the moves and the screen are the inventory's work
//  (wave 1, part C).
// ============================================================
(function (G) {
  const Inv = G.Inv = {};
  const SLOTS = ['mao', 'outra', 'costas', 'cinto', 'cabeca', 'corpo'];
  Inv.SLOTS = SLOTS;

  // ------------------------------ the trade's kit ------------------------------
  // (the tool an act puts in the hand — the same table the 3D had, now the world's: who chops holds an axe, who fights a sword)
  const ACT_TOOL = Inv.ACT_TOOL = { chop: 'machado', cut: 'machado', mine: 'picareta', dig: 'pa', hammer: 'martelo', build: 'martelo', forge: 'martelo', beat: 'martelo', rake: 'enxada', butcher: 'faca', skin: 'faca', stab: 'espada', fight: 'espada', brandish: 'espada', fish: 'vara', reel: 'vara' };
  // what a person with no things of their own carries by trade and act: a place for each slot (null: nothing there). Pure: it
  // reads the person and nothing else, writes nothing, draws no chance — the same answer for the same person in the same state
  Inv.kit = function (v) {
    const out = { mao: null, outra: null, costas: null, cinto: null, cabeca: null, corpo: null, real: false };
    if (!v || v.age < 2) return out;
    const t = ACT_TOOL[v.act];
    if (t) out.mao = t;
    else if (v.age >= 14 && (v.role === 'guerreiro' || v.role === 'cacador' || v.role === 'vigia')) out.mao = 'lanca';
    else if (v.role === 'anciao' && v.age >= 60) out.mao = 'cajado';
    // (a load in the arms puts the spear on the back, as the god's view always did)
    if (out.mao && !t && v.carry && v.carry.n > 0) { out.costas = out.mao; out.mao = null; }
    return out;
  };

  // ------------------------------ what a person holds ------------------------------
  // their own equipment when they have any, else the kit — always a fresh object: the caller may keep it, never write the person
  // through it
  Inv.held = function (v) {
    const e = v && v.equip;
    if (e && typeof e === 'object' && SLOTS.some(s => e[s])) {
      const out = { real: true }; for (const s of SLOTS) out[s] = e[s] || null; return out;
    }
    return Inv.kit(v);
  };

  // ------------------------------ the dead ------------------------------
  // (activity.js calls it from the one door out of the world, G.Village.kill: the bag of the dead goes where their things go —
  // the inventory's work, part C; with no bag yet, nothing to do)
  Inv.onDeath = function (v, cause) { };
})(window.G);
