// atividades-node: the world's simulation in node, without a browser (seconds instead of minutes, and no screen at all).
// It loads the game's own files in the order of index.html — everything before the 3D, plus possess.js — into this
// process, with a document that answers anything and does nothing (nothing of the simulation reads the screen: the
// render, the sound and the panels only draw). The world is the game's own: G.Main.newGame, G.Save.apply, G.debug.step,
// and the checker of qa/qa.js. For the activities' scenarios (qa/atividades.js, qa/porto.js, qa/negocio.js,
// qa/invariancia.js) while the browser is busy; the browser proofs (ev.js and friends) remain the reference.
//   const W = require('./atividades-node.js')({ game: 'caminho/do/jogo' });
//   W.newGame({ type: 'continente', size: 96, tribes: 3, seed: 7 }) · W.ready('cidade') · W.run(years) · W.step(n) · W.check()
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function (opts) {
  opts = opts || {};
  const ROOT = path.resolve(opts.game || path.join(__dirname, '..'));
  // ------------------------------ a page that answers anything ------------------------------
  // (a callable proxy: every property is another one, every call returns one, as a number it is 0, as text '')
  const NOOP = function () { };
  const any = new Proxy(NOOP, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return h => (h === 'string' ? '' : 0);
      if (k === Symbol.iterator) return function* () { };
      if (k === 'then') return undefined; // (not a promise)
      if (k === 'length' || k === 'width' || k === 'height' || k === 'clientWidth' || k === 'clientHeight' || k === 'offsetWidth' || k === 'offsetHeight' || k === 'devicePixelRatio') return 0;
      if (k === 'style' || k === 'dataset' || k === 'classList') return styleOf();
      if (k === 'children' || k === 'childNodes') return [];
      if (k === 'textContent' || k === 'innerHTML' || k === 'value' || k === 'id' || k === 'className') return '';
      if (k === 'getBoundingClientRect') return () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 });
      if (k === 'getImageData' || k === 'createImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(0, (w | 0) * (h | 0) * 4)), width: w | 0, height: h | 0 });
      if (k === 'measureText') return s => ({ width: String(s).length * 6 });
      if (k === 'querySelectorAll' || k === 'getElementsByTagName' || k === 'getElementsByClassName') return () => [];
      return any;
    },
    set() { return true; },
    apply() { return any; },
    construct() { return any; },
  });
  const styles = []; function styleOf() { const s = new Proxy({}, { get(t, k) { if (k === 'setProperty' || k === 'removeProperty' || k === 'add' || k === 'remove' || k === 'toggle') return NOOP; if (k === 'contains') return () => false; return t[k] === undefined ? '' : t[k]; }, set(t, k, v) { t[k] = v; return true; } }); styles.push(s); return s; }
  const store = new Map();
  const g = global;
  g.window = g; g.self = g;
  g.document = any; g.navigator = { userAgent: 'node', language: 'pt-BR', hardwareConcurrency: 4, maxTouchPoints: 0 }; g.location = { search: '', hash: '', href: 'file://node' };
  g.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), clear: () => store.clear() };
  g.sessionStorage = g.localStorage;
  g.requestAnimationFrame = () => 0; g.cancelAnimationFrame = NOOP;
  g.addEventListener = NOOP; g.removeEventListener = NOOP; g.matchMedia = () => ({ matches: false, addEventListener: NOOP, addListener: NOOP });
  g.getComputedStyle = () => styleOf(); g.innerWidth = 1000; g.innerHeight = 700; g.devicePixelRatio = 1;
  g.Image = function () { return any; }; g.Audio = function () { return any; }; g.AudioContext = function () { return any; }; g.webkitAudioContext = g.AudioContext;
  g.HTMLCanvasElement = function () { }; g.OffscreenCanvas = function () { return any; }; g.ResizeObserver = function () { return { observe: NOOP, disconnect: NOOP }; };
  g.alert = NOOP; g.confirm = () => true; g.prompt = () => null; g.atob = g.atob || (s => Buffer.from(s, 'base64').toString('binary')); g.btoa = g.btoa || (s => Buffer.from(s, 'binary').toString('base64'));
  // (the tests' clock and seeds, as ev.js gives them: a frozen Date and a seeded Math.random — only the worlds' seeds come from it)
  let a = (opts.seed || 1) | 0; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; const t0 = 1700000000000; Date.now = () => t0;
  g.__reseedTo = n => { a = (Math.abs(n) % 2147483645) + 1; };
  // ------------------------------ the game's files ------------------------------
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const all = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]);
  const cut = all.indexOf('js/lib/three.min.js');
  // (before the 3D, everything; of the 3D, only the body's ownership: possess.js writes the world, the rest only draws)
  const files = all.slice(0, cut < 0 ? all.length : cut).concat((opts.extra || []).concat(['js/possess.js']).filter(f => all.includes(f)));
  const errs = [];
  const conErr = console.error, conWarn = console.warn;
  console.error = (...x) => { errs.push('error: ' + x.map(String).join(' ').slice(0, 300)); if (opts.loud) conErr(...x); };
  console.warn = (...x) => { errs.push('warn: ' + x.map(String).join(' ').slice(0, 300)); if (opts.loud) conWarn(...x); };
  for (const f of files) {
    try { vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }); }
    catch (e) { errs.push(`load ${f}: ${e.message}`); }
  }
  // (G.Space comes with the 3D: the body's numbers only — the world's own tile and time)
  if (!G.Space) G.Space = { TILE: 4, TIME: 0.35, surface: () => ({ walk: true, kind: 'ground' }), bedDrop: () => 0 };
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'qa', 'qa.js'), 'utf8'), { filename: 'qa/qa.js' });
  for (const f of opts.qa || []) vm.runInThisContext(fs.readFileSync(path.resolve(ROOT, f), 'utf8'), { filename: f });
  const W = {
    G, errs, files,
    // a new world, as ev.js makes it
    newGame(o) {
      o = Object.assign({ type: 'continente', size: 96, tribes: 3, temper: 'normal', clima: 'variado', relevo: 'suave' }, o || {});
      if (o.seed !== undefined) a = (o.seed | 0) || 1;
      G.Main.newGame(o); G.UI.setSpeed && G.UI.setSpeed(0); G.Main.mode = 'game';
      if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; }
      return G.S;
    },
    // a ready-made world of worlds/ (the game's own save)
    ready(key) {
      const src = fs.readFileSync(path.join(ROOT, 'worlds', key + '.js'), 'utf8');
      vm.runInThisContext(src, { filename: 'worlds/' + key + '.js' });
      const o = JSON.parse(G.Ready.data[key]); delete G.Ready.data[key];
      G.Save.apply(o); G.Main.mode = 'game';
      return G.S;
    },
    save() { return G.Save.serialize(); },
    load(str) { G.Save.apply(typeof str === 'string' ? JSON.parse(str) : str); G.Main.mode = 'game'; return G.S; },
    step(n, dt) { for (let k = 0; k < (n || 1); k++) G.debug.step(dt || 0.1); },
    seconds(s, dt) { const h = dt || 0.1; for (let t = 0; t < s; t += h) G.debug.step(h); },
    // the skip's own step (the aggregated rhythm), with the skip's flags as the skip sets them
    skip(seconds, course) {
      const Sk = G.Skip; const S = G.S; const was = Sk.on;
      Sk.on = true; G.FX.off = true; G.W.pathGreed = 1.3; if (course === 'fartura') S.blessed = true;
      try { for (let t = 0; t < seconds; t += 1) G.Main.skipStep(1); } finally { Sk.on = was; G.FX.off = false; G.W.pathGreed = G.W.PATH_EXACT; if (course === 'fartura') S.blessed = false; }
    },
    run(years) { return QA.run(years); },
    check(o) { return QA.check(o || {}); },
    modErr: () => Object.assign({}, G.modErr),
  };
  return W;
};
// (run alone: a smoke test — a world is made, lives a while, is checked, saved and loaded)
if (require.main === module) {
  const t0 = performance.now();
  const W = module.exports({ seed: +(process.argv[2] || 7), loud: !!process.env.LOUD });
  const tl = performance.now() - t0;
  W.newGame({ type: process.argv[3] || 'continente', size: +(process.argv[4] || 96), tribes: +(process.argv[5] || 3), seed: +(process.argv[2] || 7) });
  const t1 = performance.now();
  const yrs = +(process.argv[6] || 1);
  W.run(yrs);
  const t2 = performance.now();
  const c = W.check();
  const s = W.save(); W.load(s);
  const c2 = W.check();
  console.log(`carregou ${W.files.length} arquivos em ${Math.round(tl)} ms; mundo em ${Math.round(t1 - t0 - tl)} ms; ${yrs} ano(s) em ${Math.round(t2 - t1)} ms; ${G.S.villagers.size} pessoas, dia ${G.S.day}`);
  console.log(`verificador: ${c.length} achados (${c.filter(x => x.sev <= 1).length} S0/S1); depois do save: ${c2.length}`);
  for (const x of c.slice(0, 8)) console.log('  ', x.sys, 'S' + x.sev, x.msg);
  console.log('erros de módulo:', JSON.stringify(W.modErr()));
  console.log('erros/avisos:', W.errs.length ? [...new Set(W.errs)].slice(0, 12).join('\n  ') : 'nenhum');
  process.exit(0); // (the game's own timers — the autosave, the panels — would keep the process alive)
}
