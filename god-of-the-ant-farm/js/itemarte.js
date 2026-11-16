'use strict';
// ============================================================
//  ItemArt: how a thing of the catalog (G.Itens) looks — its 3D
//  shape in the thing's own frame and its picture for the screen
//  (D-337). Only seen: no world, no world chance (it is in the
//  guard's LOOK list). The thing's frame, the same for every
//  thing: metres; the origin at the main hand's grip (where the
//  palm closes); +Y along the handle from the grip toward the
//  business end (the axe's head, the sword's point, the rod's
//  tip, the top of a shield); +Z the business end's front (the
//  axe's and the sword's edge, the shield's face, the way an
//  arrow on the bow flies); +X = Y × Z. This file starts as the
//  contract's skeleton (no shape, no picture: the drawer keeps
//  its own, and the screen a sign); the shapes, the grips and
//  the pictures are the item art's work (wave 1, part G).
// ============================================================
(function (G) {
  const IA = G.ItemArt = { ready: false };
  // the shape of a thing, for a level of detail (0 near, 1 mid, 2 far): a THREE.BufferGeometry with its colours, or null
  IA.geo = (key, lod) => null;
  // where the hands take it, in its frame: main (the origin) and, for a thing of two hands, off — the other hand's place
  IA.grip = key => ({ main: [0, 0, 0], off: null });
  // the picture of a thing for the screen: a data: URL, or null
  IA.icon = key => null;
})(window.G);
