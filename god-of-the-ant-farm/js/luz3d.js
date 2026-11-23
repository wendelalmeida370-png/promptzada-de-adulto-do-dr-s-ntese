'use strict';
// ============================================================
//  Luz3D: the light inside a building, baked from its plan (the
//  interiors 2.0, D-650; the front P1 — planos/interiores-2-contrato.md).
//  For each open inside, a volume of light: the sky that comes in
//  through its openings, the fire and the lamps — each with its
//  cause (G.Atmos.fire / lit, G.Dentro3D.fontes) —, the walls in
//  between; read where the sky's light is read, so the walls, the
//  furniture, the people and what they hold take the same light.
//  Only seen: pure — the same plan and the same sources, the same
//  volume —; nothing here touches the world, nor draws on any chance.
//  The contract leaves it answering nothing: the 3D lights the
//  inside as it does today until the front P1 fills it.
// ============================================================
(function (G) {
  const L = G.Luz3D = {};
  // the baked volume of an open inside (its 3D texture and the lot's frame), or null
  L.of = b => null;
  // the light at a point of the world, for the eye that gets used to the dark: { ceu, fogo }, or null
  L.at = (x, y, z) => null;
})(window.G = window.G || {});
