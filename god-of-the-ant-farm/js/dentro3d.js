'use strict';
// ============================================================
//  Dentro3D: what a building shows inside, only seen (the interiors
//  2.0, D-651; the front P5 — planos/interiores-2-contrato.md). The
//  rule above all (the owner, 23/11/2026): every thing shown has its
//  cause, never a draw — the amphorae a tavern keeps are the drink in
//  its book, the food on a table is what was served, the tools on a
//  wall are its owner's trade, the fine rug is a rich family's of a
//  people that weaves and dyes, the lamp is lit by someone awake
//  (G.Atmos.within). Each thing rests on its piece (G.Movel3D's
//  anchors), on a wall or under the beams — never in anyone's way.
//  The id (G.hash) only says where and which; nothing here touches the
//  world, nor draws on any chance. The contract leaves it showing
//  nothing until the front P5 fills it.
// ============================================================
(function (G) {
  const D = G.Dentro3D = {};
  // the lights the decoration puts in a building (its lamps and candles, each with its cause), in the lot's frame, in metres:
  // [{ x, y, z, cor: [r, g, b], forca, raio, tremor }] — the front P1 bakes them into the light of the inside
  D.fontes = b => [];
  // draw what the building shows (nothing yet)
  D.draw = () => {};
})(window.G = window.G || {});
