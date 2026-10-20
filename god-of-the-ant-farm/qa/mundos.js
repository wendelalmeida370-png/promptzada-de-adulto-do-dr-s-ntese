// mundos: node qa/mundos.js [chave...] — abre cada mundo pronto pelo menu, como a pessoa abriria, e confere:
// o mundo que chega é o que a lista promete (ano, gente, semente, mapa), o verificador não acha nada, ele vive um pouco
// sem erro, salvar e carregar dá o mesmo mundo, e o salvamento automático cabe no navegador.
// O primeiro abre pelo menu principal; os outros pelo menu de dentro do jogo (com a confirmação de trocar de mundo).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LIVE = +(process.env.LIVE || 0.3); // anos vividos depois de abrir
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--expose-gc', '--enable-precise-memory-info'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(1200);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  let fails = 0; const bad = m => { fails++; console.log('  FALHA: ' + m); };
  // the list, as the menu shows it
  await page.click('#btn-ready'); await page.waitForSelector('.ready-modal');
  await page.waitForFunction(() => document.querySelectorAll('.rd-world').length > 0 || /Nenhum mundo/.test(document.querySelector('#modal').textContent), null, { timeout: 15000 });
  const meta = await page.evaluate(() => G.Ready.meta);
  const shown = await page.evaluate(() => [...document.querySelectorAll('.rd-world')].map(b => b.dataset.k));
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : shown;
  console.log(`lista: ${Object.keys(meta).join(', ') || '(vazia)'}; no menu: ${shown.join(', ')}`);
  for (const k of Object.keys(meta)) if (!shown.includes(k)) bad(`${k} está na lista mas não no menu (falta em G.Ready.INFO?)`);
  if (!shown.length) bad('nenhum mundo pronto no menu');
  for (let n = 0; n < keys.length; n++) {
    const k = keys[n]; const m = meta[k]; const t0 = Date.now();
    if (!m) { bad(`${k}: não está na lista`); continue; }
    if (n > 0) {
      // from inside the game: the menu, the list, the confirmation
      await page.evaluate(() => G.UI.closeModal());
      await page.evaluate(() => G.UI.openPause());
      await page.waitForSelector('[data-m="ready"]'); await page.click('[data-m="ready"]');
      await page.waitForSelector(`.rd-world[data-k="${k}"]`); await page.click(`.rd-world[data-k="${k}"]`);
      await page.waitForSelector('[data-m="yes"]'); await page.click('[data-m="yes"]');
    } else { await page.click(`.rd-world[data-k="${k}"]`); }
    await page.waitForFunction(day => G.Main.mode === 'game' && G.S && G.S.day === day && document.querySelector('#modal-bg').classList.contains('hidden'), m.day, { timeout: 120000 });
    await page.waitForFunction(() => !G.Save.pending, null, { timeout: 60000 }); // (a big world is saved compressed, a moment later)
    const r = await page.evaluate(([m, live]) => {
      const S = G.S; const out = { load: [] };
      if (S.villagers.size !== m.pop) out.load.push(`gente ${S.villagers.size} ≠ ${m.pop}`);
      if (S.seed !== m.seed) out.load.push(`semente ${S.seed} ≠ ${m.seed}`);
      if (S.N !== m.N || S.mapType !== m.map) out.load.push(`mapa ${S.N} ${S.mapType} ≠ ${m.N} ${m.map}`);
      const info = G.Save.info(); out.saved = !!(info && info.day === S.day);
      out.v0 = QA.check().filter(q => q.sev <= 2).map(q => `S${q.sev} ${q.sys} ${q.msg}`).slice(0, 8);
      const w0 = performance.now(); G.UI.setSpeed(0); QA.run(live); out.msYear = Math.round((performance.now() - w0) / live);
      out.v1 = QA.check().filter(q => q.sev <= 2).map(q => `S${q.sev} ${q.sys} ${q.msg}`).slice(0, 8);
      let trip; try { trip = QA.roundTrip(); } catch (e) { trip = { diff: ['erro: ' + e.message] }; }
      out.trip = trip.diff.slice(0, 6); out.bytes = trip.bytes; out.mods = G.modErr ? Object.keys(G.modErr).length : 0;
      if (window.gc) window.gc(); out.mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0;
      G.UI.setSpeed(1);
      return out;
    }, [m, LIVE]);
    console.log(`${k}: ano ${m.day}, ${m.pop} almas, aberto em ${Math.round((Date.now() - t0) / 100) / 10} s; ${r.msYear} ms por ano vivido; save ${(r.bytes / 1e6).toFixed(2)} MB; memória ${r.mem} MB`);
    for (const x of r.load) bad(`${k}: ${x}`);
    if (!r.saved) bad(`${k}: o salvamento automático não guardou o mundo aberto`);
    for (const x of r.v0) bad(`${k} ao abrir: ${x}`);
    for (const x of r.v1) bad(`${k} depois de viver: ${x}`);
    for (const x of r.trip) bad(`${k} save/load: ${JSON.stringify(x).slice(0, 200)}`);
    if (r.mods) bad(`${k}: erro de módulo (G.modErr)`);
  }
  // the last one, from the menu's "continue": what the autosave kept comes back (compressed or not)
  if (keys.length) {
    const k = keys[keys.length - 1];
    const w0 = await page.evaluate(() => { G.UI.closeModal(); G.Save.save(true); return { day: G.S.day, pop: G.S.villagers.size, zip: (localStorage.getItem('gotaf-save-v1') || '').startsWith('gz1:') }; });
    await page.waitForFunction(() => !G.Save.pending, null, { timeout: 60000 });
    await page.evaluate(() => G.Main.toMenu()); await page.waitForTimeout(800);
    await page.click('#btn-continue');
    const back = await page.waitForFunction(w => G.Main.mode === 'game' && G.S.day === w.day && G.S.villagers.size === w.pop, w0, { timeout: 60000 }).then(() => true, () => false);
    console.log(`continuar (${k}): ${back ? 'voltou o mesmo mundo' : 'NÃO voltou'} — save ${w0.zip ? 'comprimido' : 'em texto'}`);
    if (!back) bad(`${k}: o "Continuar" não trouxe de volta o mundo salvo`);
  }
  // a world that is not there: a clean message, nothing breaks
  await page.evaluate(() => { G.Ready.INFO.__falta = { name: 'Falta', sub: '' }; G.Ready.load('__falta'); });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ mode: G.Main.mode, modal: !document.querySelector('#modal-bg').classList.contains('hidden') }));
  if (after.modal) bad('um mundo que não veio deixou a janela aberta');
  const errs2 = errs.filter(e => !/worlds\/__falta\.js|ERR_FILE_NOT_FOUND/.test(e));
  console.log(`erros: ${errs2.length ? [...new Set(errs2)].slice(0, 10).join('\n  ') : 'nenhum'}`);
  console.log(fails || errs2.length ? `MUNDOS: ${fails + errs2.length} falha(s)` : 'MUNDOS: ok');
  await browser.close();
  process.exit(fails || errs2.length ? 1 : 0);
})();
