// memory across world switches: new world after new world (and a load in between), heap after a full gc
const out = []; const types = ['continente', 'arquipelago', 'ilha', 'istmo', 'continente'];
for (let k = 0; k < 15; k++) {
  window.__reseedTo(1000 + k);
  G.Main.newGame({ type: types[k % types.length], size: 96, tribes: 3 + (k % 3), temper: k % 2 ? 'belicoso' : 'normal', clima: 'variado', relevo: k % 3 ? 'suave' : 'montanhoso' }); G.UI.setSpeed(0); G.Main.mode = 'game';
  QA.run(0.4);
  if (k % 3 === 2) { const s = G.Save.serialize(); G.Save.apply(JSON.parse(s)); QA.run(0.1); }
  if (window.gc) { window.gc(); window.gc(); }
  out.push({ k, mem: performance.memory ? +(performance.memory.usedJSHeapSize / 1e6).toFixed(1) : 0, pop: G.S.villagers.size, an: G.S.animals.size, fx: G.FX.list.length, scenes: G.Scene ? G.Scene.list.length : -1, nodes: document.getElementsByTagName('*').length, chron: document.querySelectorAll('#chron-list > *').length });
}
return out;
