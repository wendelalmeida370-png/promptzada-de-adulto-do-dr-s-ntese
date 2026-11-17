// soc-indole: who a person is — the temperament and the values (SOCIEDADE.md §3.2, D-542): six axes (ext, ama, con, neu, abe, hon)
// and three values (amb, fe, lea), whole numbers 0–99, from the hash of the id, half from the parents, anchored in today's traits —
// never from the world's chance, never from the look or the people. The contract's port (D-545): neutral answers until 22b fills it
// — de → null, faceta → 0.5, humor → 0, par → 0 —, so the life that is seen can read it from the start (with the traits as its
// fallback). The readings are pure: they never write, never draw a chance.
(function (G) {
  'use strict';
  const I = G.Indole = {};
  I.EIXOS = Object.freeze(['ext', 'ama', 'con', 'neu', 'abe', 'hon', 'amb', 'fe', 'lea']);
  I.de = v => null; //            { ext, ama, … } or null
  I.faceta = (v, nome) => 0.5; //  'agressivo' | 'empatico' | 'generoso' | 'impulsivo' | 'desconfiado' | 'ambicioso' | 'extrovertido' | 'confiante' → 0..1
  I.humor = v => 0; //             −1..1: the mood beneath, read from the needs, the grief, the fear, the drink, the marks
  I.par = (a, b) => 0; //          −1..1: how well two get on
})(window.G);
