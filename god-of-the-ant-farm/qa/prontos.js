// prontos: node qa/prontos.js tipo [semente] — vive um mundo pronto pelo salto do próprio jogo e o guarda em worlds/
// tipos: cidade, metropole, mega (cada um até a meta, sob a bênção), mundial (impérios sob a bênção, depois os anos livres
// até a guerra mundial começar) e anos (1000 anos livres, guardando os anos 100, 500 e 1000). O mundo é o que o jogo
// faria: o mesmo salto, as mesmas regras. Em cada mundo guardado: o verificador, a ida e volta pelo save e o peso de cada
// parte do save. (Uma semente que não chega à meta não é guardada: tente outra.)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.OUT || path.join(ROOT, 'worlds');
// a leg: { goal, course } a goal of the skip; { years } free years; { ww: max } free years until the world war begins —
// or until only three big peoples are left (pop 12 or more: the fewest the game's own start of a world war takes); with
// the builders free (L-322) one empire swallowed the others in the 80 years, seeds 3510 and 3511 of 28/10, D-091 — (if it
// has not begun by itself, the game's own start of a world war is called: the world chooses the reason and the sides,
// only the moment is ours); { after: seconds } a little more, so the armies are on the move; { snap } keep it
// (as sementes são as do navegador das provas: com outro motor de JavaScript o mesmo número faz outro mundo, e uma semente
// que chegava à meta pode não chegar — T-123; no Chrome 153 a megalópole 3303 parou no nível 4 e a 3305 chegou)
const KINDS = {
  cidade: { seed: 3101, opts: { type: 'continente', size: 128, tribes: 4 }, legs: [{ goal: 'cidade', course: 'fartura' }, { snap: 'cidade' }] },
  metropole: { seed: 3202, opts: { type: 'continente', size: 160, tribes: 5 }, legs: [{ goal: 'metropole', course: 'fartura' }, { snap: 'metropole' }] },
  mega: { seed: 3305, opts: { type: 'continente', size: 160, tribes: 4 }, legs: [{ goal: 'mega', course: 'fartura' }, { snap: 'mega' }] },
  mundial: { seed: 3505, opts: { type: 'continente', size: 160, tribes: 6 }, legs: [{ goal: 'metropole', course: 'fartura' }, { ww: 80 }, { after: 60 }, { snap: 'mundial' }] },
  anos: { seed: 3404, opts: { type: 'continente', size: 128, tribes: 5 }, legs: [{ years: 100 }, { snap: 'anos100' }, { years: 400 }, { snap: 'anos500' }, { years: 500 }, { snap: 'anos1000' }] },
};
const kind = process.argv[2]; const K = KINDS[kind];
if (!K) { console.log('tipos: ' + Object.keys(KINDS).join(', ')); process.exit(1); }
const seed = +(process.argv[3] || K.seed);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc --max-old-space-size=8192', '--enable-precise-memory-info'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  // (nothing is drawn: the skip lives in its own slices, the screen's frames are not needed)
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(o => { G.Main.newGame(o); G.Main.mode = 'game'; G.UI.setSpeed(1); if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; } },
    Object.assign({ temper: 'normal', clima: 'variado', relevo: 'suave', seed }, K.opts));
  const t0 = Date.now(); let failed = null;
  const snap = async key => {
    const r = await page.evaluate(key => {
      G.UI.closeModal();
      const S = G.S; const str = G.Save.serialize(); const o = JSON.parse(str);
      const parts = Object.entries(o).map(([k, v]) => [k, JSON.stringify(v).length]).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${k} ${(n / 1e6).toFixed(2)}M`);
      const viol = QA.check().filter(q => q.sev <= 2).map(q => `S${q.sev} ${q.sys} ${q.msg}`).slice(0, 12);
      let trip = null; try { trip = QA.roundTrip(); } catch (e) { trip = { err: e.message }; }
      let best = null; for (const s of S.settlements.values()) if (!best || (s.tier || 0) * 1000 + G.Village.pop(s.id) > (best.tier || 0) * 1000 + G.Village.pop(best.id)) best = s;
      const ww = G.WorldWar.active();
      const meta = { day: S.day, pop: S.villagers.size, peoples: G.Fac.all().length, towns: S.settlements.size, N: S.N, map: S.mapType, seed: S.seed,
        city: best ? { name: best.name, tier: best.tier || 0, pop: G.Village.pop(best.id) } : null,
        wars: (S.wz && S.wz.wars || []).filter(w => !w.end).length, ww: ww ? G.WorldWar.REASONS[ww.reason].name : null, world: (S.lore && S.lore.world) || null, bytes: str.length };
      return { str, meta, parts, viol, trip: trip && (trip.err || (trip.diff && trip.diff.length ? trip.diff.slice(0, 6) : 'ok')), dead: S.dead.size, hist: S.history.length, b: S.buildings.size, cem: [...S.buildings.values()].filter(b => b.type === 'cemetery').length, mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0 };
    }, key);
    const head = `'use strict';\n// Mundo pronto «${key}» — vivido pelo salto do próprio jogo (qa/prontos.js ${kind} ${seed}); ano ${r.meta.day}, ${r.meta.pop} habitantes.\n`;
    fs.writeFileSync(path.join(OUT, key + '.js'), head + `G.Ready.got(${JSON.stringify(key)}, ${JSON.stringify(r.str)});\n`);
    // the list the menu reads (each world's numbers, without its weight)
    const lf = path.join(OUT, 'lista.js'); let list = {};
    try { const t = fs.readFileSync(lf, 'utf8'); const m = t.match(/G\.Ready\.list\(([\s\S]*)\);\s*$/); if (m) list = JSON.parse(m[1]); } catch (e) { }
    list[key] = r.meta;
    fs.writeFileSync(lf, `'use strict';\n// os mundos prontos que vêm com o jogo: o que cada um é, sem o seu peso (escrito por qa/prontos.js — não editar à mão)\nG.Ready.list(${JSON.stringify(list, null, 1)});\n`);
    console.log(`\n== ${key}: ano ${r.meta.day}, ${r.meta.pop} almas, ${r.meta.peoples} povos, ${r.meta.towns} povoados; maior ${r.meta.city && r.meta.city.name} (nível ${r.meta.city && r.meta.city.tier}, ${r.meta.city && r.meta.city.pop}); guerras ${r.meta.wars}${r.meta.ww ? ', ' + r.meta.ww : ''}`);
    console.log(`   save ${(r.meta.bytes / 1e6).toFixed(2)} MB: ${r.parts.join(' · ')}`);
    console.log(`   mortos guardados ${r.dead}, cemitérios ${r.cem}, crônica ${r.hist}, prédios ${r.b}, memória ${r.mem} MB, ${Math.round((Date.now() - t0) / 1000)} s`);
    console.log(`   verificador (S0–S2): ${r.viol.length ? '\n     ' + r.viol.join('\n     ') : 'nada'}; ida e volta: ${JSON.stringify(r.trip)}`);
  };
  // one stretch of the skip, as the god would ask for it
  const run = async (goal, course, years, until) => {
    await page.evaluate(([goal, course, years, until]) => {
      let key = goal;
      if (!goal) { key = '__gen'; G.Skip.GOALS.__gen = { label: 'gerador', years: years || 0, max: years || 400, hidden: true, until: until ? (0, eval)('(' + until + ')') : null }; }
      G.Skip.start(key, course || 'livre');
    }, [goal, course, years, until]);
    let last = 0;
    while (await page.evaluate(() => G.Skip.on)) {
      await sleep(2000);
      if (Date.now() - last > 60000) { last = Date.now(); const s = await page.evaluate(() => { const S = G.S; let t = 0; for (const x of S.settlements.values()) t = Math.max(t, x.tier || 0); return `ano ${S.day}: ${S.villagers.size} almas, nível ${t}, ${G.Fac.all().length} povos, ${S.dead.size} mortos guardados`; }); console.log(`  [${Math.round((Date.now() - t0) / 1000)} s] ${s}`); }
    }
    return page.evaluate(() => ({ day: G.S.day, pop: G.S.villagers.size, tier: Math.max(0, ...[...G.S.settlements.values()].map(s => s.tier || 0)), ww: !!G.WorldWar.active() }));
  };
  const TIER = { cidade: 3, metropole: 4, mega: 5 };
  for (const leg of K.legs) {
    if (failed) break;
    if (leg.goal) {
      const r = await run(leg.goal, leg.course);
      if (TIER[leg.goal] && r.tier < TIER[leg.goal]) failed = `a meta (${leg.goal}) não chegou: ano ${r.day}, nível ${r.tier}`;
    } else if (leg.years) {
      const d0 = await page.evaluate(() => G.S.day); let left = leg.years;
      while (left > 0 && !failed) { const r = await run(null, 'livre', left); left = leg.years - (r.day - d0); if (!r.pop) failed = 'o mundo ficou vazio'; }
    } else if (leg.ww) {
      const r = await run(null, 'livre', leg.ww, '() => !!G.WorldWar.active() || G.Fac.all().filter(f => G.Fac.pop(f.id) >= 12).length <= 3');
      if (!r.ww) {
        const w = await page.evaluate(() => { const w = G.WorldWar.start() || G.WorldWar.start(true); return w ? w.name : null; });
        const big = await page.evaluate(() => G.Fac.all().filter(f => G.Fac.pop(f.id) >= 12).length);
        console.log(`  a guerra mundial não veio sozinha (ano ${r.day}, ${big} povos grandes): o jogo a começou agora (${w || 'sem povos grandes o bastante'})`);
        if (!w) failed = 'não há povos grandes o bastante para uma guerra mundial';
      } else console.log(`  a guerra mundial começou sozinha no ano ${r.day}`);
    } else if (leg.after) {
      await run(null, 'livre', 0, `(() => { const T = G.S.clock + ${leg.after}; return () => G.S.clock >= T; })()`);
    } else if (leg.snap) await snap(leg.snap);
  }
  if (failed) console.log(`\nNÃO GUARDADO: ${failed}`);
  console.log(`\nfim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 10).join('\n  ') : 'nenhum'}`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
