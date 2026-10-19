// nodemundo: o jogo (a simulação, sem o 3D) em Node, sem navegador — segundos em vez de minutos, e a máquina livre.
// Os arquivos são os do jogo, na ordem do index.html, até o three.js (o Modo Encarnado fica de fora); a interface recebe um
// DOM de mentira, que aceita tudo o que lhe pedem (toda chamada devolve outro de mentira). O Math.random semeado e o relógio
// parado são os das provas do navegador (ev.js): a mesma semente, o mesmo mundo. Erro de módulo (G.modErr) e console.error
// ou console.warn do jogo contam como falha, como lá.
//   const M = require('./nodemundo.js'); const G = M.load({ qa: true, extra: ['qa/meu-teste.js'] });
//   M.novo({ seed: 7, type: 'ilha', size: 64, tribes: 2 })   um mundo novo, pelo G.Main.newGame
//   M.pronto('cidade')                                       um mundo pronto de worlds/, pelo menu (G.Main.openSave)
//   M.viver(seg)    o passo normal (passos de 0,1 s, como o QA.run)
//   M.saltar(anos)  o salto no tempo (G.Skip.on + G.Main.skipStep(1), como o timeskip.js)
//   M.salvarCarregar()  serializa e carrega de volta (devolve o tamanho do save)
//   M.erros()       { mod: G.modErr, console: [...] }   ·   M.reseed(k)  o Math.random de novo a partir de k
//   node qa/nodemundo.js [cidade|metropole|…|<semente>] [anos]   a prova de fumaça: abre, vive, salta, salva, carrega e
//                                                                 confere (QA.check); PASSOU ou FALHOU
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const M = module.exports = {};
let G = null; const logs = [];

// (a thing that accepts anything: any property is another one, any call gives another one, it is 0 as a number and "" as text)
function fake() {
  const f = function () { };
  return new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return h => (h === 'number' ? 0 : '');
      if (k === 'then') return undefined; // (not a promise)
      if (k === 'length') return 0;
      if (k === 'querySelectorAll' || k === 'getElementsByTagName' || k === 'getElementsByClassName') return () => [];
      if (k === 'contains') return () => false;
      if (k === 'toString' || k === 'valueOf') return () => '';
      return fake();
    },
    apply() { return fake(); }, construct() { return fake(); }, set() { return true; }, has() { return true; },
  });
}

M.load = function (o) {
  o = o || {};
  const root = o.root ? path.resolve(o.root) : ROOT;
  global.window = global; global.G = {}; G = global.G;
  window.addEventListener = () => { }; window.removeEventListener = () => { };
  global.location = { search: '', hash: '', href: 'file:///nodemundo' };
  global.document = fake(); global.navigator = { userAgent: 'nodemundo', hardwareConcurrency: 4, language: 'pt-BR' };
  global.innerWidth = 1280; global.innerHeight = 800; global.devicePixelRatio = 1;
  const store = {}; global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; } };
  global.requestAnimationFrame = () => 0; global.cancelAnimationFrame = () => { };
  // (the game's timers are the interface's — the world keeps its own clock): never run, never keep the process alive
  global.setTimeout = () => 0; global.clearTimeout = () => { }; global.setInterval = () => 0; global.clearInterval = () => { };
  global.MessageChannel = function () { return { port1: {}, port2: { postMessage() { } } }; };
  global.Image = function () { return fake(); }; global.AudioContext = undefined; global.webkitAudioContext = undefined;
  // the browser tests' chance and clock (ev.js): Math.random seeded, Date.now standing still
  M.reseed(o.seed === undefined ? 424242 : o.seed);
  // (what the game says in its console: an error or a warning is a failure)
  const err0 = console.error, warn0 = console.warn;
  console.error = (...a) => { logs.push('error: ' + a.map(String).join(' ').slice(0, 300)); if (process.env.LOG) err0(...a); };
  console.warn = (...a) => { logs.push('warn: ' + a.map(String).join(' ').slice(0, 300)); if (process.env.LOG) warn0(...a); };
  M.root = root;
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
  const stop = files.indexOf('js/lib/three.min.js');
  for (const f of files.slice(0, stop < 0 ? files.length : stop)) {
    if (f === 'js/devmode.js' && !o.dev) continue; // (the developer's panel: the page's address and keys)
    M.run(f);
  }
  if (o.qa) M.run('qa/qa.js');
  for (const f of o.extra || []) M.run(f);
  G.Main.mode = 'game';
  return G;
};
M.run = function (f) { const file = path.join(M.root, f); vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file }); };
M.reseed = function (s) { let a = s | 0 || 1; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; const t0 = 1700000000000; Date.now = () => t0; };
function quiet() { G.Main.mode = 'game'; if (G.UI && G.UI.setSpeed) G.UI.setSpeed(0); if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; } }
M.novo = function (o) { M.reseed(o.seed === undefined ? 424242 : o.seed); G.Main.newGame(Object.assign({ type: 'ilha', size: 64, tribes: 2, temper: 'normal', clima: 'variado' }, o)); quiet(); return G.S; };
M.pronto = function (key) {
  const data = {}; const got = G.Ready.got; G.Ready.got = (k, s) => { data[k] = s; };
  try { M.run('worlds/' + key + '.js'); } finally { G.Ready.got = got; }
  if (!data[key]) throw new Error('mundo pronto não encontrado: ' + key);
  G.Main.openSave(JSON.parse(data[key]), ''); quiet();
  return G.S;
};
M.viver = function (seg) { const c0 = G.S.clock; while (G.S.clock - c0 < seg) G.debug.step(0.1); };
M.saltar = function (anos) {
  const S = G.S; const d0 = S.day; const W = G.W;
  G.Skip.on = true; G.FX.off = true; W.pathGreed = 1.3;
  try { while (G.S.day - d0 < anos) G.Main.skipStep(1); } finally { G.Skip.on = false; G.FX.off = false; W.pathGreed = W.PATH_EXACT; }
};
M.salvarCarregar = function () { const s = G.Save.serialize(); G.Save.apply(JSON.parse(s)); quiet(); return s.length; };
M.erros = function () { return { mod: Object.assign({}, G.modErr), console: logs.slice() }; };
M.limpo = function () { const e = M.erros(); return !Object.keys(e.mod).length && !e.console.length; };

// ------------------------------ the smoke test ------------------------------
if (require.main === module) {
  const arg = process.argv[2] || 'cidade', anos = +(process.argv[3] || 1);
  const t0 = Date.now ? process.hrtime.bigint() : 0n; const ms = () => Number((process.hrtime.bigint() - t0) / 1000000n);
  M.load({ qa: true });
  const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | nodemundo ${name} | ${info}`); if (!c) fails.push(name); };
  const seed = +arg;
  if (Number.isFinite(seed)) M.novo({ seed, size: 64, tribes: 2 }); else M.pronto(arg);
  const S = G.S; ok('abrir', !!S && S.villagers.size > 0, `${arg}: dia ${S.day}, ${S.villagers.size} pessoas, ${S.buildings.size} prédios (${ms()} ms)`);
  M.viver(30); ok('viver', M.limpo(), `30 s de passo normal, dia ${S.day} (${ms()} ms)`);
  const p0 = G.S.villagers.size; M.saltar(anos); ok('saltar', M.limpo() && G.S.day >= S.day, `${anos} ano(s) de salto: dia ${G.S.day}, ${p0} → ${G.S.villagers.size} pessoas (${ms()} ms)`);
  const rt = G.QA ? null : null; void rt;
  const n = M.salvarCarregar(); ok('salvar e carregar', M.limpo(), `${n} caracteres (${ms()} ms)`);
  const bad = QA.check().filter(q => q.sev <= 2); ok('verificador', !bad.length, bad.length ? bad.slice(0, 4).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'limpo');
  const e = M.erros(); if (!M.limpo()) console.log('  erros:', JSON.stringify(e.mod), e.console.slice(0, 5).join(' | '));
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : `PASSOU (${ms()} ms)`);
  process.exit(fails.length ? 1 : 0);
}
