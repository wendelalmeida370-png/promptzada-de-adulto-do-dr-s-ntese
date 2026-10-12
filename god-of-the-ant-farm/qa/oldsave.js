// old-save compatibility: node oldsave.js oldDir newDir seed type size tribes yearsOld yearsNew
// a world lives in the old build, is saved, and is loaded in the new one; then the new one runs it with the checker
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const [oldDir, newDir, seed, type, size, tribes, y1, y2] = [process.argv[2], process.argv[3], +(process.argv[4] || 7), process.argv[5] || 'continente', +(process.argv[6] || 112), +(process.argv[7] || 3), +(process.argv[8] || 20), +(process.argv[9] || 10)];
const init = s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; const t0 = 1700000000000; Date.now = () => t0; window.__reseedTo = n => { a = (Math.abs(n) % 2147483645) + 1; }; window.requestAnimationFrame = () => 0; };
async function open(browser, dir, errs) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(init, seed); await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + dir + '/index.html'); await page.waitForTimeout(900);
  return page;
}
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
  const errA = [], errB = [];
  const A = await open(browser, oldDir, errA);
  const str = await A.evaluate(([o, years]) => { G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) { G.Audio.mute = true; } const S = G.S; const c0 = S.clock; while (S.clock - c0 < G.DAY_LEN * years) G.debug.step(0.1); return G.Save.serialize(); }, [{ type, size, tribes, temper: 'belicoso' }, y1]);
  fs.writeFileSync(__dirname + `/oldsave_${seed}.json`, str);
  console.log(`velho: ${y1} anos, save ${(str.length / 1e6).toFixed(2)} MB; erros no velho: ${errA.length ? [...new Set(errA)].slice(0, 5).join(' || ') : 'nenhum'}`);
  await A.close();
  const B = await open(browser, newDir, errB);
  await B.addScriptTag({ path: __dirname + '/qa.js' });
  const r0 = await B.evaluate(s => { G.Save.apply(JSON.parse(s)); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; const v = QA.check(); return { day: G.S.day, pop: G.S.villagers.size, viol: v.map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`) }; }, str);
  console.log(`novo carregou: dia ${r0.day} pop ${r0.pop}; violações logo após carregar: ${r0.viol.length}`); for (const m of r0.viol.slice(0, 25)) console.log('  ' + m);
  const seen = new Map();
  for (let y = 0; y < y2; y += 5) {
    const r = await B.evaluate(([k]) => { window.__reseedTo(k); QA.run(5); const v = QA.check(); let trip; try { trip = QA.roundTrip(); } catch (e) { trip = { err: e.message }; } return { day: G.S.day, pop: G.S.villagers.size, viol: v.map(q => [q.sev, `${q.sys}: ${q.msg}`]), trip }; }, [seed * 31 + y]);
    for (const [sv, m] of r.viol) { const k = m.replace(/#\d+/g, '#').replace(/\d+(\.\d+)?/g, 'N'); if (!seen.has(k)) seen.set(k, [sv, m, 0]); seen.get(k)[2]++; }
    console.log(`  +${y + 5} anos: dia ${r.day} pop ${r.pop} violações ${r.viol.length}${r.trip.err ? ' ROUNDTRIP ERRO ' + r.trip.err : r.trip.diff && r.trip.diff.length ? ' DIFF ' + r.trip.diff.slice(0, 4).join(' | ') : ''}`);
  }
  for (const [k, [sv, m, n]] of [...seen.entries()].sort((a, b) => a[1][0] - b[1][0])) console.log(`  S${sv} ×${n}: ${m}`);
  console.log('erros no novo:', errB.length ? [...new Set(errB)].slice(0, 12).join('\n  ') : 'nenhum');
  await browser.close();
})();
