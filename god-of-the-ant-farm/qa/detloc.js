// detloc: node detloc.js modo [semente] [tipo] [tamanho] [povos] [passos] — where two runs that should be the same part ways
//  modo again:  a fresh world × the same seed made again in the same page
//  modo frames: a page without frames × a page drawing frames (camera, cinema) between the steps
//  modo load:   a save loaded × the same save loaded again
// it finds the first step after which the world's chance differs, and lists who drew in that step, in each run
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [mode, seed, type, size, tribes, steps] = [process.argv[2] || 'again', +(process.argv[3] || 77), process.argv[4] || 'arquipelago', +(process.argv[5] || 96), +(process.argv[6] || 3), +(process.argv[7] || 2000)];
const GAME = process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
async function open(browser, frames, url) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  page.on('pageerror', e => console.log('pageerror', e.message));
  if (!frames) await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(url || GAME); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(() => {
    window.__run = n => { const r = []; for (let k = 0; k < n; k++) { G.debug.step(0.1); r.push(G.S.rng); } return r; };
    window.__trace = () => { const L = []; G.rngWatch = k => { if (k) return; const st = new Error().stack.split('\n').slice(2, 7).filter(l => !/util\.js|rngWatch/.test(l)).map(l => { const m = l.match(/at (?:(\S+) \()?.*\/js\/([\w-]+\.js):(\d+)/); return m ? `${m[2]}:${m[3]}${m[1] ? ' ' + m[1] : ''}` : ''; }).filter(Boolean).slice(0, 3).join(' < '); L.push(st); }; G.debug.step(0.1); G.rngWatch = null; return L; };
  });
  return page;
}
const newWorld = (page, o) => page.evaluate(o => { window.__nocine = !!o.nocine; G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; }, o);
let fk = 0; const ACT = (process.env.ACT || 'cine').split(',');
const frameStuff = async page => {
  fk++;
  await page.evaluate(([k, act]) => {
    const R = G.Render;
    if (act.includes('cine')) { if (k % 5 === 1 && G.Cinema.start && !G.Cinema.on) G.Cinema.start(); if (k % 5 === 3 && G.Cinema.on) G.Cinema.stop(); }
    if (act.includes('sel') && k % 7 === 2) { const v = [...G.S.villagers.values()][k % Math.max(1, G.S.villagers.size)]; v && G.UI.select(v); }
    if (act.includes('spin') && k % 4 === 0 && R.spinBy) R.spinBy(0.7);
    if (act.includes('som') && k === 1 && G.Audio) { G.Audio.init && G.Audio.init(); G.Audio.mute = false; G.Audio.sfxOn = true; G.Audio.musicOn = true; }
    if (act.includes('hud') && k === 1) G.UI.showHUD(true);
    G.UI.setSpeed(0);
  }, [fk, ACT]);
  if (ACT.includes('mouse')) { await page.mouse.move(200 + (fk * 37) % 600, 150 + (fk * 53) % 400); if (fk % 3 === 0) await page.mouse.wheel(0, fk % 2 ? 100 : -100); }
  await page.waitForTimeout(120);
};
(async () => {
  const browser = await chromium.launch(); const o = { type, size, tribes, seed, nocine: !!process.env.NOCINE };
  // two runs, A and B, each prepared by its own recipe, stepped `steps` times recording the chance after each step
  // (each recipe opens its own page, so a run is never contaminated by the one before it)
  let pa, pb, prepA, prepB; const live = n => page => page.evaluate(n => { for (let k = 0; k < n; k++) G.debug.step(0.1); }, n);
  if (mode === 'again') { prepA = async () => { pa = await open(browser, false); await newWorld(pa, o); }; prepB = async () => { pb = await open(browser, false); await newWorld(pb, process.env.FIRSTO ? JSON.parse(process.env.FIRSTO) : o); await live(+(process.env.FIRST || 600))(pb); await newWorld(pb, o); }; }
  else if (mode === 'frames') { prepA = async () => { pa = await open(browser, false); await newWorld(pa, o); }; prepB = async () => { pb = await open(browser, true); await newWorld(pb, o); }; }
  else if (mode === 'builds') { prepA = async () => { pa = await open(browser, false, process.env.GAME_A); await newWorld(pa, o); }; prepB = async () => { pb = await open(browser, false, process.env.GAME_B); await newWorld(pb, o); }; }
  else {
    const base = await open(browser, false); await newWorld(base, o); await live(1500)(base); const save = await base.evaluate(() => { G.Save.save(true); return localStorage.getItem(G.Save.KEY || 'gotaf-save') || Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]); });
    const keys = await base.evaluate(() => Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
    const loaded = async twice => { const p = await open(browser, false); await p.evaluate(kv => { for (const [k, v] of kv) localStorage.setItem(k, v); }, keys); await p.evaluate(t => { G.Main.continueGame(); G.UI.setSpeed(0); if (t) { for (let k = 0; k < 300; k++) G.debug.step(0.1); G.Main.continueGame(); G.UI.setSpeed(0); } }, twice); return p; };
    prepA = async () => { pa = await loaded(false); }; prepB = async () => { pb = await loaded(true); };
  }
  const runSteps = async (page, n, frames) => { if (!frames) return page.evaluate(n => window.__run(n), n); let r = []; for (let k = 0; k < n; k += 25) { r = r.concat(await page.evaluate(n => window.__run(n), Math.min(25, n - k))); await frameStuff(page); } return r; };
  await prepA(); const ra0 = await pa.evaluate(() => G.S.rng); const RA = await runSteps(pa, steps, false);
  await prepB(); const rb0 = await pb.evaluate(() => G.S.rng); const RB = await runSteps(pb, steps, mode === 'frames');
  console.log(`acaso no começo: ${ra0} × ${rb0}`);
  let k = 0; while (k < steps && RA[k] === RB[k]) k++;
  if (k >= steps) { console.log(`${mode}: iguais por ${steps} passos`); await browser.close(); return; }
  console.log(`${mode}: separam-se no passo ${k + 1} (acaso ${RA[k]} × ${RB[k]})`);
  // again, up to the step before, then the step itself traced
  await prepA(); if (k) await runSteps(pa, k, false); const TA = await pa.evaluate(() => window.__trace());
  await prepB(); if (k) await runSteps(pb, k, mode === 'frames'); const TB = await pb.evaluate(() => window.__trace());
  if (mode === 'builds') { for (const T of [TA, TB]) for (let i = 0; i < T.length; i++) T[i] = T[i].replace(/:\d+/g, ''); }
  let j = 0; while (j < TA.length && j < TB.length && TA[j] === TB[j]) j++;
  console.log(`no passo: ${TA.length} × ${TB.length} sorteios; o primeiro diferente é o nº ${j + 1}`);
  console.log('  antes:   ' + TA.slice(Math.max(0, j - 3), j).join('\n           '));
  console.log('  A segue: ' + TA.slice(j, j + 6).join('\n           '));
  console.log('  B segue: ' + TB.slice(j, j + 6).join('\n           '));
  await browser.close();
})();
