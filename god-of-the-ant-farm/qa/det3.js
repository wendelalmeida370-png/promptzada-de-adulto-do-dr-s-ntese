// det3: node det3.js [semente] [tipo] [tamanho] [povos] [anos] — the same seed gives the same world, whoever watches
// nothing here seeds Math.random or freezes the clock: the world's chance must come from the world's seed alone.
//  A: a fresh page, no frames                      → the reference
//  B: another fresh page, frames drawn all along (camera moving and turning, cinema, panels, sound) → the same world as A
//  C: in A's page, the same seed again (a second world in the same page: nothing left over from the first) → the same as A
//  D: a save loaded twice, each living half a year → the same future both times
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, type, size, tribes, years] = [+(process.argv[2] || 77), process.argv[3] || 'arquipelago', +(process.argv[4] || 96), +(process.argv[5] || 3), +(process.argv[6] || 2)];
const GAME = process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
async function open(browser, frames, errs) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  if (!frames) await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(GAME); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(() => {
    // a short fingerprint of the logical world (and the first few differences, to say where two worlds part)
    // (fixed steps counted one by one: the same number of steps in every run, whatever the rounding of the clock)
    window.__steps = n => { for (let k = 0; k < n; k++) G.debug.step(0.1); };
    window.__fp = () => { const c = QA.canon(); const s = JSON.stringify(c); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return { h: (h >>> 0).toString(16), rng: G.S.rng, day: G.S.day, clock: Math.round(G.S.clock * 10) / 10, pop: G.S.villagers.size, c }; };
  });
  return page;
}
const newWorld = (page, o) => page.evaluate(o => { G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; document.querySelector('#intro') && document.querySelector('#intro').classList.add('hidden'); if (G.Audio) { G.Audio.mute = true; } }, o);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errs = []; const o = { type, size, tribes, seed };
  const t0 = Date.now(); const out = []; const fails = [];
  const same = (n, a, b) => { const ok = a.h === b.h && a.rng === b.rng; out.push(`${n}: ${ok ? 'igual' : 'DIFERENTE'} (${a.h}/${b.h}, acaso ${a.rng}/${b.rng}, dia ${a.day}/${b.day}, gente ${a.pop}/${b.pop})`); if (!ok) fails.push(n); return ok; };
  // A
  const pa = await open(browser, false, errs);
  await newWorld(pa, o);
  const g0 = await pa.evaluate(() => window.__fp());
  await pa.evaluate(n => window.__steps(n), years * 2000);
  const A = await pa.evaluate(() => window.__fp());
  // B: frames all along (the world still only lives in fixed steps; the frames only draw, sound and move the camera)
  const pb = await open(browser, true, errs);
  await newWorld(pb, o);
  const g1 = await pb.evaluate(() => window.__fp());
  same('geração com e sem quadros', g0, g1);
  await pb.evaluate(() => { G.UI.showHUD(true); if (G.Audio) { G.Audio.init && G.Audio.init(); G.Audio.mute = false; G.Audio.sfxOn = true; G.Audio.musicOn = true; } });
  const chunks = years * 20;
  for (let k = 0; k < chunks; k++) {
    await pb.evaluate(([k, y]) => { window.__steps(y); const R = G.Render; if (k % 5 === 1 && G.Cinema.start && !G.Cinema.on) G.Cinema.start(); if (k % 5 === 3 && G.Cinema.on) G.Cinema.stop(); if (k % 7 === 2) { const v = [...G.S.villagers.values()][k % Math.max(1, G.S.villagers.size)]; v && G.UI.select(v); } if (k % 4 === 0 && R.spinBy) R.spinBy(0.7); G.UI.setSpeed(0); }, [k, 100]);
    await pb.mouse.move(200 + (k * 37) % 600, 150 + (k * 53) % 400); if (k % 3 === 0) await pb.mouse.wheel(0, k % 2 ? 100 : -100);
    await pb.waitForTimeout(120);
  }
  await pb.evaluate(() => { G.Cinema.on && G.Cinema.stop(); G.UI.select(null); });
  const B = await pb.evaluate(() => window.__fp());
  if (!same('A (sem quadros) × B (com quadros, câmera, cinema, som)', A, B)) out.push('  primeiras diferenças: ' + JSON.stringify(await pa.evaluate(c => QA.diff(window.__fp().c, c).slice(0, 4), B.c)).slice(0, 600));
  if (A.h !== B.h) { const ha = await pa.evaluate(() => G.S.history.map(h => h.d + ': ' + h.txt)), hb = await pb.evaluate(() => G.S.history.map(h => h.d + ': ' + h.txt)); const extra = hb.filter(x => !ha.includes(x)).concat(ha.filter(x => !hb.includes(x)).map(x => '(só sem quadros) ' + x)); if (extra.length) out.push('  na crônica: ' + extra.slice(0, 4).join(' | ').slice(0, 500)); }
  // C: a second world from the same seed in A's page
  await newWorld(pa, o);
  await pa.evaluate(n => window.__steps(n), years * 2000);
  const C = await pa.evaluate(() => window.__fp());
  if (!same('A × C (o mesmo mundo de novo na mesma página)', A, C)) out.push('  primeiras diferenças: ' + JSON.stringify(await pb.evaluate(c => QA.diff(window.__fp().c, c).slice(0, 4), C.c)).slice(0, 600));
  // D: the save loaded twice lives the same half year
  await pa.evaluate(() => G.Save.save(true));
  await pa.evaluate(() => { G.Main.continueGame(); G.UI.setSpeed(0); window.__steps(1000); });
  const D1 = await pa.evaluate(() => window.__fp());
  await pa.evaluate(() => { G.Main.continueGame(); G.UI.setSpeed(0); window.__steps(1000); });
  const D2 = await pa.evaluate(() => window.__fp());
  if (!same('D (o save carregado duas vezes, meio ano cada)', D1, D2)) out.push('  primeiras diferenças: ' + JSON.stringify(await pa.evaluate(([a, b]) => QA.diff(a, b).slice(0, 4), [D1.c, D2.c])).slice(0, 600));
  console.log(`== det3 semente ${seed} ${type} ${size} ${tribes}p ${years} anos`);
  for (const l of out) console.log(l);
  console.log(fails.length ? `FALHOU: ${fails.join('; ')}` : 'PASSOU');
  console.log(`fim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 8).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
