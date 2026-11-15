// tres-node: the 3D of the game in Node, without a graphics card — only its geometry. The world of qa/nodemundo.js, with
// three.js and the 3D's own files after it (in index.html's order), the shapes made (Realm.shapes) and the builders started
// (Build3D; People3D with a scene of its own, as qa/visual/corpo-rig.js gives it): what is drawn is computed as the game
// computes it, and looked at by numbers.
//   const T = require('./tres-node.js'); const { G, M, scene } = T.load({ extra: [...] });   then M.pronto('cidade') …
const fs = require('fs'), path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
exports.load = function (o) {
  o = o || {};
  const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
  const all = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
  const three = all.slice(all.indexOf('js/lib/three.min.js'));
  global.atob = global.atob || (s => Buffer.from(s, 'base64').toString('binary'));
  global.performance = global.performance || { now: () => Date.now() };
  const G = M.load({ qa: o.qa !== false, extra: three.concat(o.extra || []) });
  global.THREE = window.THREE;
  G.Realm.shapes(); G.Build3D.init(THREE, G.Realm);
  // (the people's meshes in a scene of their own: no renderer, nothing drawn — the instances counted)
  const scene = new THREE.Scene(); const realm = Object.assign(Object.create(G.Realm), { scene: () => scene, renderer: () => null, camera: () => null });
  G.People3D.init(THREE, realm);
  return { G, M, scene, THREE };
};
