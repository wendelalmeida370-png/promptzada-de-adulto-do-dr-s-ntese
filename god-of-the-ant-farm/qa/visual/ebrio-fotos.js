// ebrio-fotos: o corpo bêbado no celular em pé (a bebedeira, T2 — D-837): o mesmo lugar, a mesma hora, o mesmo olho — o corpo sóbrio,
// o corpo bêbado (o olho que balança e se inclina, a vista turva e dobrada, a palavra da bebida na tela) e o corpo desmaiado (a tela
// escura e a causa). Erro de página, aviso no console ou erro de módulo é falha (o sombreador da vista compila).
//   bash qa/navegador.sh node qa/visual/ebrio-fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS      (Q=media; Q=leve: o desfoque sem o pós)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2] || '.'); const OUT = process.argv[3] || '/tmp/ebrio-fotos'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software|Automatic fallback|WebGL/.test(t)) errs.push(m.type() + ': ' + t); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
  const log = m => { console.log(m); fs.appendFileSync(path.join(OUT, 'ebrio-fotos.txt'), m + '\n'); };
  const who = await page.evaluate(Q => {
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    window.__f = f;
    G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data.cidade)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 20 && o.age < 50 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    S.time = 0.4; G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(20);
    G.Cam3D.OPT.follow = false; f(10);
    return { v: v.name, id: v.id, q: Q, pos: G.Post3D ? G.Post3D.on : false };
  }, process.env.Q || 'media');
  log('corpo: ' + JSON.stringify(who));
  // (the drink by the world's own door — a night's at once, the god's hand of a proof —, the world stood still while the eye eases in)
  const shot = async (name, prep) => {
    const info = await page.evaluate(prep); await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); log(`${name}: ${JSON.stringify(info)}`);
  };
  await shot('ebrio-sobrio', () => { const v = G.Possess.body(); G.inSim++; try { G.Ebrio.prova(v, 0); } finally { G.inSim--; } window.__f(40); return { k: G.EbrioCorpo.k(), hud: document.querySelector('.ih-ebrio') ? document.querySelector('.ih-ebrio').textContent : '' }; });
  await shot('ebrio-bebado', () => { const v = G.Possess.body(); G.inSim++; try { G.Ebrio.prova(v, G.Ebrio.limiar(v, 'tonto') + 0.15); } finally { G.inSim--; } G.Modes.menu(true); for (let k = 0; k < 160; k++) G.Main.frameFor(33); G.Modes.menu(false); window.__f(2); const o = G.EbrioCorpo.olho(0); return { sangue: +v.ebrio.toFixed(2), k: +G.EbrioCorpo.k().toFixed(2), roll: o ? +(o.roll * 57.3).toFixed(1) : 0, vista: G.EbrioCorpo.vista(), hud: document.querySelector('.ih-ebrio') ? document.querySelector('.ih-ebrio').textContent : '' }; });
  await shot('ebrio-desmaio', () => { const v = G.Possess.body(); G.inSim++; try { G.Ebrio.dose(v, 'mel', 1); G.Ebrio.prova(v, G.Ebrio.MAX); } finally { G.inSim--; } window.__f(20); const sl = document.querySelector('.ih-sleep'); return { desmaiado: G.Ebrio.desmaiado(v), dorme: v.sleeping, tela: sl ? sl.textContent : '' }; });
  const modErr = await page.evaluate(() => Object.keys(G.modErr || {}).length ? JSON.stringify(G.modErr) : '');
  log(errs.length || modErr ? 'FALHOU: ' + errs.slice(0, 6).join(' | ') + ' ' + modErr : 'PASSOU: sem erro de página, aviso ou erro de módulo');
  await browser.close(); process.exit(errs.length || modErr ? 1 : 0);
})();
