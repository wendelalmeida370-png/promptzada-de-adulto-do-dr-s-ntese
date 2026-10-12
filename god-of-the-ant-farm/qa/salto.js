// salto: node qa/salto.js [semente] — o avanço no tempo em dois ritmos (D-010) provocado de propósito:
// 1. um mundo salta 15 anos com o verificador a cada ano (nada S0–S2, nenhum erro de módulo);
// 2. o mesmo mundo (mesma semente) salta de novo, na mesma página: tem que dar o mesmo mundo;
// 3. um save no meio, carregado duas vezes, salta o mesmo futuro;
// 4. parar no meio (como o Esc) e continuar: nada fica pendurado;
// 5. o chão muda antes do salto (um terremoto do deus) e o salto segue;
// 6. bichos fora do lugar no salto não passam do que se vê na tela (D-010: passos grossos andam em pedaços).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const seed = +(process.argv[2] || 41);
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | ${name} | ${info}`); if (!cond) fails.push(name); };
  // (the helpers live in the page: a world from the seed, years of the skip step, the checker, a hash of the world)
  await page.evaluate(() => {
    window.T = {
      world: s => { G.Main.newGame({ type: 'continente', size: 128, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'suave', seed: s }); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true; },
      skip: (years, each) => { const S = G.S; const d0 = S.day; const bad = []; G.Skip.on = true; try { while (S.day < d0 + years) { const d = S.day; while (S.day === d) G.Main.skipStep(1); if (each) for (const q of QA.check()) if (q.sev <= 2) bad.push(`ano ${S.day}: S${q.sev} ${q.sys} ${q.msg}`); } } finally { G.Skip.on = false; } return bad; },
      hash: () => { const c = JSON.stringify(QA.canon()) + '|' + G.S.rng; let h = 0; for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) | 0; return h; },
      odd: () => { let n = 0; for (const a of G.S.animals.values()) { const sp = G.Animals.DEF[a.kind]; if (!sp || sp.cls === 'air' || a.air || a.held || a.dead || a.z > 0.5 || sp.town) continue; if (!G.Animals.walkOK(a, a.x, a.y)) n++; } return n; },
    };
  });
  // 1 + 2: fifteen years, twice from the same seed
  const a = await page.evaluate(s => { const t0 = performance.now(); T.world(s); const bad = T.skip(15, true); return { bad, h: T.hash(), pop: G.S.villagers.size, tier: Math.max(0, ...[...G.S.settlements.values()].map(x => x.tier || 0)), sy: ((performance.now() - t0) / 15000).toFixed(2), mods: Object.keys(G.modErr || {}).length }; }, seed);
  ok('1 quinze anos com o verificador todo ano', !a.bad.length && !a.mods, `${a.pop} almas, nível ${a.tier}, ${a.sy} s por ano${a.bad.length ? '; ' + a.bad.slice(0, 3).join(' | ') : ''}${a.mods ? '; erro de módulo' : ''}`);
  const b = await page.evaluate(s => { T.world(s); T.skip(15, false); return { h: T.hash(), pop: G.S.villagers.size }; }, seed);
  ok('2 a mesma semente, o mesmo mundo', a.h === b.h, `${a.h} / ${b.h} (${a.pop} e ${b.pop} almas)`);
  // 3: a save in the middle, loaded twice, lives the same future
  const c = await page.evaluate(() => {
    const str = G.Save.serialize(); const out = [];
    for (let k = 0; k < 2; k++) { G.Save.apply(JSON.parse(str)); T.skip(4, false); out.push(T.hash()); }
    return out;
  });
  ok('3 um save carregado duas vezes salta o mesmo futuro', c[0] === c[1], `${c[0]} / ${c[1]}`);
  // 4: stop half way (as Esc does) and go on
  const d = await page.evaluate(() => new Promise(res => {
    G.Skip.GOALS.__t = { years: 6, hidden: true }; const d0 = G.S.day; G.Skip.start('__t', 'fartura');
    // (stopped once a year has gone by, however long the machine takes for it — not after a fixed wait: T-025)
    let n = 0; const mid0 = () => (G.S.day > d0 || ++n > 3000) ? stop() : setTimeout(mid0, 100);
    const stop = () => { const mid = G.S.day; G.Skip.finish('parado'); G.UI.closeModal(); const stopped = !G.Skip.on && !G.S.blessed;
      const bad = QA.check().filter(q => q.sev <= 2).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
      G.Skip.start('__t', 'livre'); const tick = () => { if (G.Skip.on) return setTimeout(tick, 200); G.UI.closeModal(); res({ d0, mid, end: G.S.day, stopped, bad: bad.concat(QA.check().filter(q => q.sev <= 2).map(q => `S${q.sev} ${q.sys} ${q.msg}`)) }); }; tick(); };
    setTimeout(mid0, 100);
  }));
  ok('4 parar no meio e continuar', d.stopped && d.mid > d.d0 && d.end >= d.mid + 6 && !d.bad.length, `parou no ano ${d.mid} (começou no ${d.d0}), seguiu até o ${d.end}${d.bad.length ? '; ' + d.bad.slice(0, 3).join(' | ') : ''}`);
  // 5: the ground changes before the skip (an earthquake under the biggest town)
  const e = await page.evaluate(() => {
    const S = G.S; const big = [...S.settlements.values()].sort((x, y) => G.Village.pop(y.id) - G.Village.pop(x.id))[0];
    const before = S.buildings.size; let cast = false;
    try { G.S.faith = 1e6; cast = !!G.Powers.cast('quake', big.cx, big.cy); } catch (err) { cast = 'erro ' + err.message; }
    const bad = T.skip(3, true);
    return { cast, before, after: S.buildings.size, bad, mods: Object.keys(G.modErr || {}).length };
  });
  ok('5 um terremoto e depois o salto', e.cast === true && !e.bad.length && !e.mods, `terremoto ${e.cast}; prédios ${e.before} → ${e.after}${e.bad.length ? '; ' + e.bad.slice(0, 3).join(' | ') : ''}`);
  // 6: beasts out of place in the skip, against the screen's steps
  const f = await page.evaluate(() => {
    const str = G.Save.serialize(); let skipW = 0, liveW = 0;
    G.Save.apply(JSON.parse(str)); G.Skip.on = true; for (let k = 0; k < 400; k++) { G.Main.skipStep(1); if (k % 20 === 0) skipW = Math.max(skipW, T.odd()); } G.Skip.on = false;
    G.Save.apply(JSON.parse(str)); for (let k = 0; k < 4000; k++) { G.debug.step(0.1); if (k % 200 === 0) liveW = Math.max(liveW, T.odd()); }
    return { skipW, liveW, animals: G.S.animals.size };
  });
  ok('6 bichos fora do lugar: o salto como a tela', f.skipW <= Math.max(6, f.liveW * 2), `no pior momento: ${f.skipW} no salto, ${f.liveW} na tela (de ${f.animals} bichos)`);
  console.log(`erros: ${errs.length ? [...new Set(errs)].slice(0, 8).join('\n  ') : 'nenhum'}`);
  console.log(fails.length || errs.length ? `SALTO: ${fails.length + errs.length} falha(s)` : 'SALTO: ok');
  await browser.close();
  process.exit(fails.length || errs.length ? 1 : 0);
})();
