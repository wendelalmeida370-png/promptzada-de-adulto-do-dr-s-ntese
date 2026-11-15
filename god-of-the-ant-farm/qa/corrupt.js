// damaged saves: node corrupt.js [seed] — a world is saved, then the save is broken in many ways and loaded through the menu's
// "continue"; each load must either refuse cleanly (the menu stays usable) or give a world that runs a year without errors
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const seed = +(process.argv[2] || 7);
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  let errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 260)); });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; try { localStorage.clear(); } catch (e) { } }, seed);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(1200);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  const good = await page.evaluate(() => { G.Main.newGame({ type: 'continente', size: 96, tribes: 3, temper: 'belicoso' }); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; QA.run(8); return G.Save.serialize(); });
  const top = Object.keys(JSON.parse(good));
  console.log(`save bom: ${(good.length / 1e6).toFixed(2)} MB, ${top.length} seções: ${top.join(' ')}`);
  const cases = [['metade', s => s.slice(0, s.length >> 1)], ['menos 10 chars', s => s.slice(0, -10)], ['vazio', () => ''], ['null', () => 'null'], ['{}', () => '{}'], ['[]', () => '[]'], ['lixo', () => 'gotaf\u0000\u0001xx'],
    ['sem gente', s => { const o = JSON.parse(s); o.villagers = []; return JSON.stringify(o); }],
    ['refs penduradas', s => { const o = JSON.parse(s); for (const v of o.villagers.slice(0, 20)) { v.mother = 9e8; v.father = 9e8 + 1; v.home = 9e8 + 2; v.spouse = 9e8 + 3; v.set = 9e8 + 4; v.job = 9e8 + 5; } return JSON.stringify(o); }],
    ['prédio de tipo desconhecido', s => { const o = JSON.parse(s); const b = o.buildings[0]; if (Array.isArray(b)) b[1] = 'disco_voador'; else b.type = 'disco_voador'; return JSON.stringify(o); }],
    ['números viram null', s => { const o = JSON.parse(s); for (const v of o.villagers.slice(0, 15)) { v.hunger = null; v.hp = null; v.age = null; } for (const f of o.factions || []) if (f.stock) for (const k in f.stock) f.stock[k] = null; return JSON.stringify(o); }],
    ['campos de gente apagados', s => { const o = JSON.parse(s); let k = 0; for (const v of o.villagers) { const ks = Object.keys(v).filter(x => x !== 'id'); delete v[ks[(k++ * 7) % ks.length]]; } return JSON.stringify(o); }],
    ['dia no futuro distante', s => { const o = JSON.parse(s); o.day = 9999; return JSON.stringify(o); }],
    // (a big world is saved compressed, L-076: the good one must load, the broken ones be refused)
    ['comprimido bom', s => 'gz1:' + require('zlib').gzipSync(s).toString('base64')],
    ['comprimido cortado', s => { const z = require('zlib').gzipSync(s).toString('base64'); return 'gz1:' + z.slice(0, z.length >> 1); }],
    ['comprimido com lixo', () => 'gz1:@@não é base64@@'],
    ['comprimido de lixo', () => 'gz1:' + require('zlib').gzipSync('{"day": 3, "villagers": [1, 2').toString('base64')],
    ...top.map(k => ['sem a seção ' + k, s => { const o = JSON.parse(s); delete o[k]; return JSON.stringify(o); }])];
  const res = { recusou: 0, rodou: 0, quebrado: [] };
  for (const [name, fn] of cases.filter(c => !process.env.CASE || new RegExp(process.env.CASE).test(c[0]))) {
    errs = [];
    let bad; try { bad = fn(good); } catch (e) { console.log(`  ${name}: (não deu para montar o caso: ${e.message})`); continue; }
    const r = await page.evaluate(async bad => {
      G.Main.toMenu(); try { localStorage.setItem('gotaf-save-v1', bad); } catch (e) { return { st: 'quota' }; }
      let threw = null; try { G.Main.continueGame(); } catch (e) { threw = e.message; }
      if (bad.startsWith('gz1:')) await new Promise(r => setTimeout(r, 2500)); // (a compressed save opens a moment later)
      const loaded = G.Main.mode === 'game';
      let ran = 0, stepErr = null;
      const t = performance.now();
      if (loaded) { G.UI.setSpeed(0); try { QA.run(1); ran = 1; } catch (e) { stepErr = e.message; } }
      // the menu's world must still breathe (a failed load must not leave a broken world behind it)
      let menuOk = true; if (!loaded) { try { for (let k = 0; k < 50; k++) G.debug.step(0.1); G.Render.frame(0.016); } catch (e) { menuOk = e.message; } }
      await new Promise(r => setTimeout(r, 50));
      const mods = Object.assign({}, G.modErr); for (const k in G.modErr) delete G.modErr[k];
      return { st: loaded ? 'carregou' : 'recusou', threw, ran, stepErr, menuOk, mods, ms: Math.round(performance.now() - t), viol: loaded ? QA.check().filter(q => q.sev <= 1).slice(0, 3).map(q => q.msg) : [] };
    }, bad);
    const e = [...new Set(errs)].filter(t => !/save: prédio de tipo desconhecido|load failed|corrupt save/.test(t));
    const broke = r.threw || r.stepErr || r.menuOk !== true || Object.keys(r.mods).length || (r.st === 'carregou' && e.length);
    if (r.st === 'recusou') res.recusou++; else res.rodou++;
    if (broke) res.quebrado.push(name);
    console.log(`${broke ? 'FALHA' : 'ok   '} ${name}: ${r.st}${r.threw ? ' EXCEÇÃO ' + r.threw : ''}${r.stepErr ? ' PASSO ' + r.stepErr : ''}${r.menuOk !== true ? ' MENU QUEBRADO ' + r.menuOk : ''}${Object.keys(r.mods).length ? ' módulos ' + JSON.stringify(r.mods) : ''}${r.viol.length ? ' S0/S1: ' + r.viol.join(' | ') : ''}${e.length ? '\n      ' + e.slice(0, 4).join('\n      ') : ''}`);
  }
  console.log(`\n${cases.length} casos: ${res.recusou} recusados, ${res.rodou} carregaram; falhas: ${res.quebrado.length ? res.quebrado.join(', ') : 'nenhuma'}`);
  await browser.close();
})();
