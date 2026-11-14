// rngtrace: node rngtrace.js [semente] [tipo] [tamanho] [povos] — who draws from which generator
// the world's generator (G.R & co.) may only be drawn while the world lives (a step, making a world, loading, an act of the god);
// the look's generator (G.VR & co.) only by what shows or sounds. Real frames run: camera, cinema, photo, panels, sound.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, type, size, tribes] = [+(process.argv[2] || 5), process.argv[3] || 'arquipelago', +(process.argv[4] || 96), +(process.argv[5] || 3)];
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(() => {
    const seen = window.__rt = new Map(); let n = 0;
    const where = () => { const st = new Error().stack.split('\n').slice(2); const f = st.find(l => !/util\.js/.test(l) && !/rngWatch|<anonymous>/.test(l)) || st[0] || ''; const m = f.match(/at (?:(\S+) \()?.*\/js\/([\w-]+\.js):(\d+)/); return m ? `${m[2]}:${m[3]} ${m[1] || ''}` : f.trim().slice(0, 80); };
    G.rngWatch = k => { const off = k === 0 ? !G.inSim : !!G.inSim; if (!off) return; n++; if (n > 400000 && n % 50) return; const key = (k === 0 ? 'MUNDO fora do mundo: ' : 'VISUAL dentro do mundo: ') + where() + (k === 0 && window.__act ? ` [${window.__act}]` : ''); seen.set(key, (seen.get(key) || 0) + 1); };
  });
  await page.evaluate(o => { G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; }, { type, size, tribes, seed });
  const act = a => page.evaluate(a => { window.__act = a; }, a);
  // the world lives a while on its own (fixed steps)
  await page.evaluate(() => { document.querySelector('#intro') && document.querySelector('#intro').classList.add('hidden'); QA.run(1.5); });
  // real frames: the game at speed 1 and 4, the camera moving, turning, zooming
  await act('jogo'); await page.evaluate(() => { G.UI.showHUD(true); G.UI.setSpeed(1); });
  for (let k = 0; k < 8; k++) { await page.mouse.move(300 + k * 40, 300 + (k % 3) * 50); await page.mouse.wheel(0, k % 2 ? 120 : -120); await page.waitForTimeout(500); }
  await page.evaluate(() => { G.UI.setSpeed(4); G.Render.spinBy && G.Render.spinBy(1.2); }); await page.waitForTimeout(4000);
  // cinema, photo, panels, the inspector, sound
  await act('cinema'); await page.evaluate(() => { G.UI.setSpeed(1); G.Cinema.start ? G.Cinema.start() : G.Cinema.toggle && G.Cinema.toggle(); }); await page.waitForTimeout(8000);
  await page.evaluate(() => { G.Cinema.stop(); }); await act('foto'); await page.evaluate(() => { G.Photo.start && G.Photo.start(); }); await page.waitForTimeout(2000); await page.evaluate(() => { G.Photo.stop(); });
  await act('painéis'); await page.evaluate(() => { const v = [...G.S.villagers.values()][0]; v && G.UI.select(v); }); await page.waitForTimeout(1500);
  for (const k of ['c', 'r', 'h', 'b', 'Escape', 'e', 'Escape', 'l', 'Escape']) { await page.keyboard.press(k); await page.waitForTimeout(400); }
  await act('som'); await page.evaluate(() => { if (G.Audio) { G.Audio.init && G.Audio.init(); G.Audio.mute = false; G.Audio.sfxOn = true; G.Audio.musicOn = true; } G.UI.setSpeed(2); }); await page.waitForTimeout(6000);
  // the god acts (these may draw from the world's generator: they are acts, not watching)
  await act('poder'); await page.evaluate(() => { const S = G.S; const s = [...S.settlements.values()][0]; if (s && G.Powers.cast) { for (const p of ['rain', 'bless', 'bolt']) try { G.Powers.cast(p, s.cx + 3, s.cy + 3); } catch (e) { } } });
  await page.waitForTimeout(2000);
  // a save loaded, then frames again
  await act('carregar'); await page.evaluate(() => { G.Save.save(true); G.Main.continueGame ? G.Main.continueGame() : G.Save.load(); G.UI.setSpeed(1); }); await page.waitForTimeout(3000);
  const r = await page.evaluate(() => [...window.__rt.entries()].sort((a, b) => b[1] - a[1]));
  for (const [k, n] of r) console.log(String(n).padStart(8), k);
  console.log(`${r.length} lugares; erros: ${errs.length ? [...new Set(errs)].slice(0, 8).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
