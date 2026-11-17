// soc-fama: the name a person has in each community and the memory of a town and of a people (SOCIEDADE.md §3.5, D-545). The
// contract's port: neutral answers until 22b fills it (de → null, notavel → []). The readings are pure.
(function (G) {
  'use strict';
  const F = G.Fama = {};
  F.de = (v, comunidade) => null; //  { renome, estima, rotulos } or null
  F.notavel = (x, y, r) => []; //     the people of renown within r of (x, y): [{ id, renome, estima }]
})(window.G);
