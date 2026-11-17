// soc-lacos: the ties between people and the memory of who did what (SOCIEDADE.md §3.2, §3.5, D-542, D-545): what each one feels for
// another — affection, trust, respect, attraction, and the feelings the owner named read from them (friendship, love, hatred, rivalry,
// admiration, envy, resentment, indifference). The contract's port: neutral answers until 22b fills it (sente → null, de → []); the
// event door (G.Lacos.ato) and the marks are 22b's. The readings are pure.
(function (G) {
  'use strict';
  const L = G.Lacos = {};
  L.sente = (v, o) => null; //  { afeto, confianca, respeito, atracao, rotulos: [...] } or null
  L.de = (v, rotulo) => []; //  the ids v has that tie with ('amizade', 'amor', 'odio', 'rivalidade', …)
})(window.G);
