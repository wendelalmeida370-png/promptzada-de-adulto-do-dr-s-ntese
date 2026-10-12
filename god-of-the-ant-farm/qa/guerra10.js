// The ten mandatory war tests. Usage: node guerra10.js <scenario> [seed]   (DET=1: the same world every run)
//  small    — a warlike world of small villages, skipped 30 years: armies stay small; causality (tension before wars)
//  medium   — two kingdoms of ~300/250: dozens per army; long war: economy, supply, exhaustion; defeat; peace
//  big      — two civilizations of ~900/700: hundreds; performance
//  walls    — a walled capital: a real siege
//  save     — save in the middle of a war, load, keep going
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const sc = process.argv[2] || 'small'; const seed = +(process.argv[3] || 7);
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 5).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED/.test(t)) errs.push('console: ' + t); });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; }, seed);
  if (process.env.DET) await page.addInitScript(() => { const t0 = 1700000000000; Date.now = () => t0; window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  const R = {};
  const ok = (k, cond, info) => { R[k] = (cond ? 'PASS' : 'FAIL') + ' — ' + info; console.log(k, R[k]); };
  const summary = () => page.evaluate(() => {
    const wz = G.S.wz || { wars: [], armies: [], battles: [] }; const F = id => (G.Fac.get(id) || { name: '?' }).name;
    return {
      wars: wz.wars.map(w => ({ name: w.name, start: w.start, end: w.end, reason: w.reason, surprise: w.surprise, ten: w.ten, cause: w.cause.txt, treaty: w.treaty, side: Object.fromEntries(Object.entries(w.side).map(([k, s]) => [F(+k), s])), battles: w.battles.length, sieges: w.sieges.map(x => ({ n: x.name, how: x.how, days: x.days, end: x.end })), events: w.events.length })),
      armies: wz.armies.map(a => ({ name: a.name, fac: F(a.fac), role: a.role, n0: a.n0, pop0: a.pop0, dead: a.dead, des: a.deserted, phase: a.phase, relief: a.relief, battles: a.battles.length, food: Math.round(a.food) })),
      battles: wz.battles.map(b => ({ name: b.name, kind: b.kind, total: b.total || b.n0, winner: F(b.winner), sides: Object.fromEntries(Object.entries(b.sides).map(([k, s]) => [F(+k), { n: s.n, dead: s.dead, wd: s.wounded, cap: s.captured, fled: s.fled }])) })),
    };
  });
  const setup = (o) => page.evaluate(o => {
    G.Main.newGame({ type: 'continente', size: o.size, tribes: 2, temper: 'pacifico', relevo: 'suave' });
  }, o);
  const grow = (o) => page.evaluate(o => {
    const S = G.S; const P = G.Politics; const dw = P.declareWar; P.declareWar = () => { };
    let g = 0; while (S.day < 6 && g++ < 200000) G.debug.step(0.1);
    P.declareWar = dw;
    const fs = G.Fac.all().sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)).slice(0, 2);
    const growF = (f, want) => { const sets = G.Fac.settlementsOf(f.id); let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const s = sets[k % sets.length]; const a = G.R() * 6.283, r = G.R() * (s.radius || 6); const p = G.W.nearestLand(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r, 5); if (!p) continue; G.Vg.create({ set: s.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); } f.stock.food = Math.max(f.stock.food, want * (o.food || 7)); f.stock.armas = (f.stock.armas || 0) + Math.round(want * 0.15); };
    growF(fs[0], o.popA); growF(fs[1], o.popB);
    if (o.walls) { const c = G.Fac.capitalOf(fs[1].id); G.Siege.raiseWalls(c, 'pedra', true); const w = G.Siege.wallOf(c.id); if (w) { w.built = w.tiles.length; w.done = true; for (const i of w.tiles) S.wall[i] = 3; } const tA = fs[0].tech; if (tA && tA.known) tA.known.engenharia = 1; }
    G.Fac.updateTerritory();
    window._A = fs[0].id; window._B = fs[1].id;
    return { A: fs[0].name + ' ' + G.Fac.pop(fs[0].id), B: fs[1].name + ' ' + G.Fac.pop(fs[1].id) };
  }, o);
  const run = (days, cb) => page.evaluate(([days]) => { const S = G.S; const t0 = performance.now(); let g = 0, worst = 0; const c0 = S.clock; while (S.clock - c0 < G.DAY_LEN * days && g++ < 400000) { const a = performance.now(); G.debug.step(0.1); worst = Math.max(worst, performance.now() - a); } return { ms: (performance.now() - t0) / Math.max(1, g), worst, day: S.day, pop: S.villagers.size }; }, [days]);

  if (sc === 'small') {
    await page.evaluate(() => G.Main.newGame({ type: 'continente', size: 100, tribes: 4, temper: 'belicoso', relevo: 'suave' }));
    await page.waitForTimeout(300); await page.mouse.click(640, 400); await page.waitForTimeout(300);
    await page.evaluate(() => { G.Skip.GOALS.tst = { years: 30 }; G.Skip.start('tst', 'livre'); });
    for (let k = 0; k < 2400; k++) { const on = await page.evaluate(() => G.Skip.on); if (!on) break; await page.waitForTimeout(500); }
    const s = await summary();
    const camp = s.armies.filter(a => a.role !== 'defesa');
    const worst = camp.reduce((m, a) => Math.max(m, a.n0 / Math.max(1, a.pop0 || 1)), 0);
    ok('1 aldeias pequenas', camp.every(a => a.n0 <= Math.max(14, (a.pop0 || 0) * 0.6)), `${s.wars.length} guerras, ${camp.length} exércitos de campanha (maior: ${Math.max(0, ...camp.map(a => a.n0))}, pior razão soldados/pop ${worst.toFixed(2)}), incursões ${s.wars.reduce((n, w) => n + Object.values(w.side).reduce((m, q) => m + (q.raids || 0), 0), 0)}`);
    const caus = s.wars.filter(w => !['alianca', 'traicao', 'mundial', 'divina', 'rota', 'presságio'].includes(w.reason));
    const ripe = caus.filter(w => w.surprise || (w.ten && w.ten.stage >= 1) || w.reason === 'secessao' || w.reason === 'vassalo');
    ok('10 causalidade', caus.length === 0 || ripe.length === caus.length, `${ripe.length}/${caus.length} guerras declaradas depois de tensão (ou surpresa); causas: ${[...new Set(s.wars.map(w => w.reason))].join(', ')}`);
    console.log(JSON.stringify(s.wars.map(w => [w.name, w.reason, w.ten, w.surprise, w.cause]), null, 0).slice(0, 3000));
  } else {
    const o = { medium: { size: 170, popA: 320, popB: 260, days: 10 }, big: { size: 200, popA: 950, popB: 750, days: 5 }, walls: { size: 170, popA: 420, popB: 260, days: 9, walls: 1 }, save: { size: 170, popA: 300, popB: 250, days: 2 } }[sc];
    await setup(o); await page.waitForTimeout(300); await page.mouse.click(640, 400); await page.waitForTimeout(300);
    console.log('setup', JSON.stringify(await grow(o)));
    await page.evaluate(() => G.Politics.declareWar(G.Fac.get(window._A), G.Fac.get(window._B), 'ambicao'));
    if (sc === 'save') {
      // into the war: armies in the field
      for (let k = 0; k < 30; k++) { await run(0.1); const n = await page.evaluate(() => G.Wars.state().armies.filter(a => !a.done && a.band).length); if (n >= 1) break; }
      const before = await page.evaluate(() => ({ wars: G.Wars.state().wars.length, live: G.Wars.state().armies.filter(a => !a.done).map(a => a.name + ':' + a.phase + ':' + a.members.length), bands: G.War.bands.size }));
      await page.evaluate(() => G.Save.save(true));
      await page.evaluate(() => G.Main.continueGame()); await page.waitForTimeout(500);
      const after = await page.evaluate(() => ({ wars: G.Wars.state().wars.length, live: G.Wars.state().armies.filter(a => !a.done).map(a => a.name + ':' + a.phase + ':' + a.members.length), bands: G.War.bands.size, atWar: G.Fac.atWar(window._A, window._B) }));
      const r = await run(1.2);
      const later = await page.evaluate(() => ({ live: G.Wars.state().armies.filter(a => !a.done).map(a => a.name + ':' + a.phase + ':' + a.members.length), battles: G.Wars.state().battles.length }));
      ok('8 save/load', after.wars === before.wars && after.atWar && (after.live.length >= 1) && later.live.length >= 0, `antes ${JSON.stringify(before)} · depois ${JSON.stringify(after)} · 1,2 dia depois ${JSON.stringify(later)} · ${r.ms.toFixed(1)} ms/passo`);
    } else {
      let perf = { ms: 0, worst: 0, n: 0 }; const snaps = [];
      for (let d = 0; d < o.days * 4; d++) {
        const r = await run(0.25); perf.ms += r.ms; perf.n++; perf.worst = Math.max(perf.worst, r.worst);
        const st = await page.evaluate(() => { const w = G.Wars.state().wars.slice(-1)[0]; const fa = G.Fac.get(window._A), fb = G.Fac.get(window._B); return { day: G.S.day, end: w && w.end, exhA: w && w.side[window._A] ? w.side[window._A].exh : 0, exhB: w && w.side[window._B] ? w.side[window._B].exh : 0, foodA: Math.round(fa ? fa.stock.food : 0), foodB: Math.round(fb ? fb.stock.food : 0), live: G.Wars.state().armies.filter(a => !a.done).map(a => `${a.name}:${a.phase}:${a.members.length}:${G.Wars.supplyDays(a).toFixed(1)}d`).join(' | ') }; });
        snaps.push(st);
        if (d % 2 === 0) console.log(`d${st.day} exh ${st.exhA}/${st.exhB} food ${st.foodA}/${st.foodB} ${st.live} · ${r.ms.toFixed(1)}ms worst ${r.worst.toFixed(0)}`);
        if (st.end && G_endWait(snaps)) break;
      }
      function G_endWait(sn) { const e = sn.filter(x => x.end).length; return e >= 4; }
      const s = await summary();
      const camp = s.armies.filter(a => a.role !== 'defesa'); const maxN = Math.max(0, ...s.armies.map(a => a.n0));
      if (sc === 'medium') {
        ok('2 reinos médios: dezenas', camp.length && camp[0].n0 >= 20 && camp[0].n0 <= 200 && camp.every(a => a.n0 <= (a.pop0 || 999) * 0.6), `exércitos: ${s.armies.map(a => a.name + ' ' + a.n0 + '/' + a.pop0).join(', ')}`);
        const w = s.wars[0]; const sA = Object.values(w.side)[0];
        ok('5 guerra longa: economia, suprimento, desgaste', snaps.some(x => x.exhA > 30 || x.exhB > 30) && snaps[snaps.length - 1].foodA < snaps[0].foodA + 1 && s.armies.some(a => a.des > 0 || a.food < a.n0 * 2 * 3), `desgaste final ${snaps[snaps.length - 1].exhA}/${snaps[snaps.length - 1].exhB}, comida ${snaps[0].foodA}→${snaps[snaps.length - 1].foodA} / ${snaps[0].foodB}→${snaps[snaps.length - 1].foodB}, desertores ${s.armies.reduce((n, a) => n + a.des, 0)}`);
        const bts = s.battles.filter(b => b.kind === 'batalha' || b.kind === 'escaramuca');
        const routs = bts.filter(b => Object.values(b.sides).some(q => q.fled > 0 || q.cap > 0)); const massacre = bts.filter(b => !/Assalto/.test(b.name) && Object.values(b.sides).some(q => q.n >= 10 && q.dead >= q.n * 0.9));
        ok('6 derrota: retirada/fuga/rendição', routs.length > 0 && massacre.length === 0 || s.armies.some(a => a.phase === 'retirada'), `${bts.length} batalhas, ${routs.length} com fuga ou captura, ${massacre.length} até o último homem; ${bts.slice(0, 6).map(b => b.name + ' ' + JSON.stringify(b.sides)).join(' ; ')}`);
        ok('7 paz: volta dos soldados e consequências', !!w.end && !!w.treaty, `fim ${w.end || '-'}; ${w.treaty ? w.treaty.name + ': ' + (w.treaty.terms || []).join('; ') : 'sem tratado'}`);
      }
      if (sc === 'big') {
        ok('3 grandes civilizações: centenas', maxN >= 150, `exércitos: ${s.armies.map(a => a.name + ' ' + a.n0 + '/' + a.pop0).join(', ')}`);
        ok('9 desempenho', perf.ms / perf.n < 60, `média ${(perf.ms / perf.n).toFixed(1)} ms por passo de 0,1 s de jogo (pior ${perf.worst.toFixed(0)} ms) com ${(await page.evaluate(() => G.S.villagers.size))} pessoas`);
      }
      if (sc === 'walls') {
        const sg = s.wars.flatMap(w => w.sieges);
        ok('4 cidade murada: cerco', sg.length > 0, `cercos: ${sg.map(x => x.n + ' ' + (x.how || 'em curso') + ' ' + (x.days || '')).join('; ')}`);
      }
      console.log(JSON.stringify(s.wars.map(w => ({ name: w.name, end: w.end, treaty: w.treaty, sieges: w.sieges, side: w.side })), null, 0).slice(0, 2500));
    }
  }
  if (process.env.PROBE) console.log('PROBE ' + JSON.stringify(await page.evaluate(c => (0, eval)('(() => {' + c + '})()'), require('fs').readFileSync(process.env.PROBE, 'utf8'))));
  console.log('RESULT', JSON.stringify(R));
  console.log('errs', errs.slice(0, 12).join('\n'));
  await browser.close();
})();
