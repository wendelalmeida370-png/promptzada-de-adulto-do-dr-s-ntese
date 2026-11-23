'use strict';
// ============================================================
//  Movel3D: the furniture modelled outside the game (the interiors
//  2.0, D-650; the front P2 — planos/interiores-2-contrato.md): the
//  pieces of the plan's catalogue (int-moveis.js) as Blender shapes,
//  written by arte/blender/moveis*.py into js/movelmesh.js, for each
//  kind, people and size — read back through G.Mesh3D. Where there
//  is no model, has() says false and the 3D draws the piece as it
//  does today (Build3D's FURN). Only seen: nothing here touches the
//  world, nor draws on any chance; a piece's look is chosen by its
//  kind, its people, its size and its id (G.hash), never by a draw.
// ============================================================
(function (G) {
  const V = G.Movel3D = {};
  // is there a model for this kind of piece, for this people, at this size?
  V.has = (kind, civ, w, d) => false;
  // the model's geometry (its parts by material), at a level of detail — or null
  V.geo = (kind, civ, w, d, lod) => null;
  // where things may rest on the piece, in its own frame: [{ k: 'tampo'|'prateleira'|'gancho'|'nicho', x, y, z, w, d }]
  V.anchors = (kind, civ, w, d) => [];
})(window.G = window.G || {});
