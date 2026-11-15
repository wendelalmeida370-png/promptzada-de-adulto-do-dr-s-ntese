// ev: node ev.js seed type size tribes years exprFile — lives a world then evaluates the file's function body in the page
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const [seed, type, size, tribes, years, file] = [+process.argv[2], process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6], process.argv[7]];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc', '--enable-precise-memory-info'] }); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); else if (m.type() === 'log' && process.env.LOG) console.log('  page:', t.slice(0, 400)); });
  if (process.env.FRAMES) await page.addInitScript(() => { window.__FRAMES0 = 1; window.__FRAMES = 1; });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; const t0 = 1700000000000; let tk = 0; Date.now = () => t0 + tk; window.__reseed = () => { a = s; tk = 0; }; window.__reseedTo = n => { a = (Math.abs(n) % 2147483645) + 1; }; if (!window.__FRAMES0) { window.__raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; } try { localStorage.clear(); } catch (e) { } }, seed);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(o => { window.__reseed(); G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; } if (!window.__FRAMES) window.requestAnimationFrame = () => 0; window.__gen0 = (() => { let x = 0; const t = [...G.S.animals.values()].map(a => a.id + ':' + a.x.toFixed(4) + ',' + a.y.toFixed(4) + ':' + (a.state || '') + ':' + (a.hunger || 0).toFixed(3)).join('|'); for (let i = 0; i < t.length; i++) x = (x * 31 + t.charCodeAt(i)) | 0; return x; })(); }, { type, size, tribes, temper: process.env.TEMPER || 'normal', clima: process.env.CLIMA || 'variado', relevo: process.env.RELEVO || 'suave' }); await page.waitForTimeout(300);
  await page.evaluate(() => { G.Main.mode = 'game'; G.UI.setSpeed(0); });
  const t0 = Date.now();
  if (years > 0) await page.evaluate(([y, k]) => { window.__reseedTo(k); QA.run(y); }, [years, seed * 7919 + 1]);
  const code = fs.readFileSync(file, 'utf8');
  const r = await page.evaluate(c => { window.__reseedTo(424242); try { return (0, eval)('(async () => {' + c + '})()'); } catch (e) { return 'ERR ' + e.message; } }, code);
  console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 1));
  console.log(`fim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 10).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
