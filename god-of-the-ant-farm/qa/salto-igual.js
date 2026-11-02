// salto-igual: node qa/salto-igual.js [anos] [semente] — a mesma semente faz o mesmo mundo em qualquer estado do motor (L-437)
// O V8 ordena uma lista com um comparador incoerente de um jeito no interpretador e de outro no código otimizado: o
// sort(() => G.R() - 0.5) dos migrantes de uma vila nova (village.js) chamava o comparador 2 vezes numa rodada e 5 noutra,
// e a mesma semente fazia dois mundos, conforme a máquina tinha ou não otimizado a linha — o mundial dos mundos prontos
// chegava à metrópole no ano 62 numa geração e no 49 noutra. Provocado de propósito, sem depender da sorte do momento:
//  1. dois navegadores com o motor em dois estados fixos — só o TurboFan (o otimizador, compilando na hora) e só o Maglev
//     (sem o TurboFan) — vivem o salto do mundial (semente 3510, anos de bênção): as impressões de cada dia iguais — o acaso,
//     a gente, os prédios, os bichos, os povoados (antes do conserto se separavam no dia 43, na virada);
//  2. o G.shuffle, em Node: a mesma sorte dá a mesma ordem e sempre n − 1 sorteios, frio e quente (depois de otimizado);
//  e, como informação, o sort do motor com um comparador aleatório, frio e quente (o que mostra que ele não é embaralhamento).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const YEARS = +(process.argv[2] || 45), SEED = +(process.argv[3] || 3510);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | salto-igual ${name} | ${info}`); if (!c) fails.push(name); };
const ENGINES = { turbofan: '--no-concurrent-recompilation --no-concurrent-osr --no-maglev', maglev: '--no-concurrent-recompilation --no-concurrent-osr --no-turbofan' };
// one browser, one engine state: the skip of the world war's world, a fingerprint of the world at each new day
async function live(flags) {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192 ' + flags] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 160)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: path.join(__dirname, 'qa.js') });
  await page.evaluate(o => { G.Main.newGame(o); G.Main.mode = 'game'; G.UI.setSpeed(1); if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; } },
    { type: 'continente', size: 160, tribes: 6, temper: 'normal', clima: 'variado', relevo: 'suave', seed: SEED });
  await page.evaluate(Y => {
    const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
    const fp = () => { const S = G.S; const vs = [], bs = [], as = [], ss = [];
      for (const v of S.villagers.values()) vs.push(v.id + ':' + (v.partner || 0) + ':' + (v.home || 0) + ':' + v.set + ':' + (v.role || '') + ':' + (v.task ? v.task.type : '') + ':' + v.x.toFixed(3) + ',' + v.y.toFixed(3) + ':' + v.age.toFixed(6));
      for (const b of S.buildings.values()) bs.push(b.id + ':' + b.type + ':' + (b.built ? 1 : 0) + ':' + (b.progress || 0).toFixed(3));
      for (const a of S.animals.values()) as.push(a.id + ':' + a.x.toFixed(2) + ',' + a.y.toFixed(2));
      // (the head count by hand: Village.pop keeps a count for the part of a step in the skip, and asked here first it would
      // hand the world a count from before a birth in the same part)
      const n = new Map(); for (const v of S.villagers.values()) n.set(v.set, (n.get(v.set) || 0) + 1);
      for (const t of S.settlements.values()) ss.push(t.id + ':' + (t.tier || 0) + ':' + (n.get(t.id) || 0));
      return [S.day, S.rng, S.villagers.size, S.buildings.size, S.clock.toFixed(1), h(vs.join('|')), h(bs.join('|')), h(as.join('|')), h(ss.join('|'))]; };
    window.__dias = []; const f = G.Village.onNewDay; G.Village.onNewDay = function () { window.__dias.push(fp()); return f.apply(this, arguments); };
    G.Skip.GOALS.__igual = { years: Y, max: Y, hidden: true }; G.Skip.start('__igual', 'fartura');
  }, YEARS);
  while (await page.evaluate(() => G.Skip.on)) await new Promise(r => setTimeout(r, 1500));
  const d = await page.evaluate(() => window.__dias);
  await browser.close();
  return { d, errs };
}
(async () => {
  // 1. the two engine states, side by side
  const t0 = Date.now();
  const [A, B] = await Promise.all([live(ENGINES.turbofan), live(ENGINES.maglev)]);
  let k = 0; while (k < A.d.length && k < B.d.length && JSON.stringify(A.d[k]) === JSON.stringify(B.d[k])) k++;
  const same = A.d.length === B.d.length && k === A.d.length;
  ok('1 o mesmo salto com o motor em dois estados (só TurboFan × só Maglev): o mesmo mundo, dia a dia', same && A.d.length >= YEARS - 1,
    same ? `${A.d.length} dias iguais (semente ${SEED}, ${YEARS} anos de bênção): no último, ${A.d[A.d.length - 1][2]} almas, ${A.d[A.d.length - 1][3]} prédios; ${Math.round((Date.now() - t0) / 1000)} s`
      : `iguais até o dia ${k ? A.d[k - 1][0] : '-'}; depois, TurboFan ${JSON.stringify(A.d[k] || null)} × Maglev ${JSON.stringify(B.d[k] || null)}`);
  ok('1 sem erro de página nem aviso no console', !A.errs.length && !B.errs.length, (A.errs.concat(B.errs)).slice(0, 3).join(' · ') || 'nenhum');
  // 2. the world's shuffle, in Node: the same chance, the same order and n - 1 draws, cold and hot
  {
    const M = require('./nodemundo.js'); const G = M.load({}); G.S = { rng: 0 };
    let draws = 0; const w0 = G.rngWatch; G.rngWatch = k2 => { if (!k2) draws++; };
    const run = (seed, n) => { G.S.rng = seed; draws = 0; const arr = []; for (let i = 0; i < n; i++) arr.push({ id: i }); G.shuffle(arr); return draws + ':' + arr.map(o => o.id).join(','); };
    const seeds = []; for (let q = 0; q < 40; q++) seeds.push((q * 2654435761) | 0);
    const cold = seeds.map((s, i) => run(s, 3 + (i % 9)));
    for (let q = 0; q < 200000; q++) run(q, 6);
    const hot = seeds.map((s, i) => run(s, 3 + (i % 9)));
    const bad = seeds.filter((s, i) => cold[i] !== hot[i] || +cold[i].split(':')[0] !== 2 + (i % 9));
    ok('2 o G.shuffle: a mesma sorte, a mesma ordem e n − 1 sorteios, frio e quente', !bad.length, `${seeds.length} sementes, listas de 3 a 11${bad.length ? '; diferentes: ' + bad.slice(0, 3).join(', ') : ''}`);
    // (and what the engine's sort with a drawing comparator does — information, not a rule of the game)
    const R = G.R; const srt = (seed, n) => { G.S.rng = seed; let c = 0; const arr = []; for (let i = 0; i < n; i++) arr.push(i); arr.sort(() => { c++; return R() - 0.5; }); return c + ':' + arr.join(''); };
    const c2 = seeds.map(s => srt(s, 6)); for (let q = 0; q < 200000; q++) srt(q, 6); const h2 = seeds.map(s => srt(s, 6));
    console.log(`INFO | salto-igual o sort do motor com um comparador que sorteia (não é embaralhamento) | frio × quente: ${seeds.filter((s, i) => c2[i] !== h2[i]).length} de ${seeds.length} sementes diferentes (Node ${process.versions.v8})`);
    G.rngWatch = w0;
  }
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
  process.exit(fails.length ? 1 : 0);
})();
