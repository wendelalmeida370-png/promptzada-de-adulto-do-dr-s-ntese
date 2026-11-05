// soak: node soak.js seed type size tribes temper years every [rt=1] [clima] [relevo]
// a world lives for years; every few years the invariants are checked and a save→load round trip compared
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, type, size, tribes, temper, years, every, rt, clima, relevo] = [+(process.argv[2] || 7), process.argv[3] || 'continente', +(process.argv[4] || 128), +(process.argv[5] || 3), process.argv[6] || 'normal', +(process.argv[7] || 20), +(process.argv[8] || 5), process.argv[9] !== '0', process.argv[10] || 'variado', process.argv[11] || 'suave'];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc', '--enable-precise-memory-info'] }); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; const t0 = 1700000000000; let tk = 0; Date.now = () => t0 + tk; window.__reseed = () => { a = s; tk = 0; }; window.__reseedTo = n => { a = (Math.abs(n) % 2147483645) + 1; }; if (!window.__FRAMES0) { window.__raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; } try { localStorage.clear(); } catch (e) { } }, seed);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(o => { window.__reseed(); G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; } if (!window.__FRAMES) window.requestAnimationFrame = () => 0; }, { type, size, tribes, temper, clima, relevo }); await page.waitForTimeout(300);
  await page.evaluate(() => { G.Main.mode = 'game'; G.UI.setSpeed(0); });
  const t0 = Date.now(); const firstSeen = new Map(); const log = [];
  const tag = `seed ${seed} ${type} ${size} ${tribes}p ${temper}`;
  for (let y = 0; y < years; y += every) {
    const r = await page.evaluate(([every, rt, k, dumpRx, dumpFn]) => {
      window.__reseedTo(k); const S = G.S; const t = performance.now(); const d0 = S.day;
      QA.run(every);
      const ms = performance.now() - t;
      const viol = QA.check();
      let dump = null; if (dumpRx) { const re = new RegExp(dumpRx); const hit = viol.filter(q => re.test(q.msg)); if (hit.length) { try { dump = (0, eval)('(' + dumpFn + ')')(hit.map(q => q.msg)); } catch (e) { dump = 'dump err ' + e.message; } } }
      let trip = null; if (rt) { try { trip = QA.roundTrip(); } catch (e) { trip = { err: e.message + ' ' + (e.stack || '').split('\n')[1] }; } }
      const viol2 = rt ? QA.check() : [];
      if (window.gc) window.gc(); const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0;
      const c = { mem, day: S.day, pop: S.villagers.size, dead: S.dead.size, facs: G.Fac.all().length, sets: S.settlements.size, bld: S.buildings.size, an: S.animals.size, ships: S.ships.length, hist: S.history.length, stories: S.saga ? S.saga.stories.length : 0, active: S.saga ? S.saga.stories.filter(s => s.st === 'ativa').length : 0, wars: S.wz ? S.wz.wars.filter(w => !w.end).length : 0, armies: S.wz ? S.wz.armies.filter(a => !a.done).length : 0, bands: G.War.bands.size, exps: (S.exps || []).length, fleets: (S.fleets || []).length, ww: !!(S.worldWar && !S.worldWar.end), msYear: Math.round(ms / Math.max(1, S.day - d0)) };
      return { dump, c, viol, viol2: viol2.filter(q => !viol.some(p => p.msg === q.msg)), trip };
    }, [every, rt, seed * 7919 + y, process.env.DUMPRX || '', process.env.DUMPFN ? require('fs').readFileSync(process.env.DUMPFN, 'utf8') : '']);
    for (const q of r.viol) { const k = q.sys + ' ' + q.msg.replace(/#\d+/g, '#').replace(/\d+(\.\d+)?/g, 'N'); if (!firstSeen.has(k)) firstSeen.set(k, { sev: q.sev, day: q.day, ex: q.msg, n: 0 }); firstSeen.get(k).n++; }
    log.push(r.c);
    console.log(`[${tag}] ano ${r.c.day}: pop ${r.c.pop} mortos ${r.c.dead} povos ${r.c.facs} povoados ${r.c.sets} prédios ${r.c.bld} bichos ${r.c.an} navios ${r.c.ships} crônica ${r.c.hist} hist ${r.c.active}/${r.c.stories} guerras ${r.c.wars} exércitos ${r.c.armies} bandos ${r.c.bands}${r.c.ww ? ' GM' : ''} · ${r.c.msYear} ms/ano · heap ${r.c.mem} MB · violações ${r.viol.length}${r.trip ? ` · save ${(r.trip.bytes / 1e6).toFixed(2)} MB` : ''}`);
    if (r.trip && r.trip.err) console.log('  ROUNDTRIP ERRO', r.trip.err);
    if (r.trip && r.trip.diff && r.trip.diff.length) console.log('  SAVE/LOAD DIFF: ' + r.trip.diff.join('\n                  '));
    if (r.dump) console.log('  DUMP: ' + JSON.stringify(r.dump, null, 1).slice(0, 6000));
    if (r.viol2.length) console.log('  NOVAS VIOLAÇÕES APÓS LOAD: ' + r.viol2.slice(0, 8).map(q => `[${q.sev}] ${q.msg}`).join(' | '));
  }
  if (process.env.TEXTLINT) { const code = require('fs').readFileSync(__dirname + '/textlint.js', 'utf8'); const t = await page.evaluate(c => (0, eval)('(() => {' + c + '})()'), code); console.log(`texto: ${t.n} textos ${JSON.stringify(t.bySrc)}`); for (const [k, n] of Object.entries(t.hits).sort((a, b) => b[1] - a[1])) console.log(`  ${n}× ${k}: ${t.ex[k][0].slice(0, 200)}`); }
  const audit = await page.evaluate(() => QA.saveAudit());
  console.log(`\n== ${tag}: ${years} anos em ${Math.round((Date.now() - t0) / 1000)} s`);
  console.log('violações (tipo, sev, 1ª vez, vezes):');
  for (const [k, q] of [...firstSeen.entries()].sort((a, b) => a[1].sev - b[1].sev)) console.log(`  S${q.sev} ano ${q.day} ×${q.n}: ${q.ex}`);
  console.log(`save: ${(audit.bytes / 1e6).toFixed(2)} MB; maiores: ${audit.top.map(([k, n]) => k + ' ' + (n / 1e3).toFixed(0) + 'k').join(', ')}`);
  if (audit.bad.length) console.log('save com valores que o JSON corrompe: ' + audit.bad.slice(0, 20).join(' | '));
  console.log('erros:', errs.length ? [...new Set(errs)].slice(0, 15).join('\n  ') : 'nenhum');
  await browser.close();
})();
