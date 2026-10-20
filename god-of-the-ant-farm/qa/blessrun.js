// blessrun: node blessrun.js seed size years evalFile — a blessed world (peace and plenty) lives N years, then the file is evaluated
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const [seed, size, years, file] = [+(process.argv[2] || 41), +(process.argv[3] || 128), +(process.argv[4] || 50), process.argv[5]];
const GAME = process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(GAME); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  const t0 = Date.now();
  await page.evaluate(o => { G.Main.newGame({ type: 'continente', size: o.size, tribes: 4, seed: o.seed, temper: o.temper }); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; }, { size, seed, temper: process.env.TEMPER || 'normal' });
  for (let k = 0; k < Math.ceil(years / 5); k++) await page.evaluate(() => { const S = G.S; const d0 = S.day; let bt = 0; S.blessed = true; while (S.day < d0 + 5) { G.debug.step(0.1); if ((bt -= 0.1) <= 0) { bt = 2; S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN * 0.5); S.weather.fertility = Math.max(S.weather.fertility || 0, G.DAY_LEN * 0.5); } } });
  const code = fs.readFileSync(file, 'utf8');
  const r = await page.evaluate(c => { try { return (0, eval)('(async () => {' + c + '})()'); } catch (e) { return 'ERR ' + e.message; } }, code);
  console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 1));
  console.log(`fim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 8).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
