// menu-graficos: o menu Gráficos do Modo Encarnado provado com cliques de verdade (escrita pelo A1 na onda 2, adotada pelo
// A6 em qa/visual): os botões de qualidade vêm de G.Realm.QNAMES (com a Ultra), cada clique troca o preset e a luz do sol
// segue; a caixa "Sombras" desligada apaga a sombra, ligada volta ao tamanho do preset (4096 na Ultra, 2048 na Alta, 1024
// na Média e na Leve, que não tem); a distância de visão alcança a da Ultra; o letreiro de chegada recua as notícias.
// Erro de página, aviso no console ou G.modErr é falha. Tira uma foto do menu em cada preset:
//   bash qa/navegador.sh node qa/visual/menu-graficos.js PASTA_DO_JOGO SAIDA
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2]); const OUT = path.resolve(process.argv[3] || 'menu-graficos'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | menu ${name} | ${info}`); if (!cond) fails.push(name); };
  // (the world, a grown-up in Hedeby, and into the body — as qa/encarna.js does)
  const entered = await page.evaluate(() => {
    G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data.cidade)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const s = [...G.S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...G.S.villagers.values()].find(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok);
    if (!v || !G.Modes.enter(v)) return false;
    for (let k = 0; k < 300 && G.Modes.state !== 'INC'; k++) G.Main.frameFor(33);
    for (let k = 0; k < 6; k++) G.Main.frameFor(33);
    return G.Modes.state === 'INC';
  });
  ok('entra no corpo', entered, String(entered));
  // (the arrival banner: while it speaks the news step back, and come back when it is gone)
  const ban = await page.evaluate(() => {
    const root = document.getElementById('inc-root'); G.IncUI.banner('Teste · do letreiro', 0.5); const on = root.classList.contains('ib-on');
    for (let k = 0; k < 30; k++) G.Main.frameFor(33);
    return { on, off: !root.classList.contains('ib-on'), hidden: document.getElementById('inc-banner').classList.contains('hidden') };
  });
  ok('o letreiro de chegada recua as notícias e devolve depois', ban.on && ban.off && ban.hidden, JSON.stringify(ban));
  // (the menu by its key, the Gráficos tab by a click)
  await page.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); G.Main.frameFor(33); });
  await page.click('#inc-menu [data-m="tab"][data-t="grafico"]');
  const look = () => page.evaluate(() => {
    const sun = []; G.Realm.scene().traverse(o => { if (o.isDirectionalLight) sun.push(o); });
    const s = sun.find(o => o.castShadow) || sun[0];
    const r = G.Realm.renderer(); const q = id => document.querySelector(id);
    const view = q('#inc-menu input[data-g="view"]'), npcs = q('#inc-menu input[data-g="npcs"]'), sh = q('#inc-menu input[data-g="shadows"]');
    return {
      q: G.Realm.q, Q: G.Realm.Q(), names: G.Realm.QNAMES, qual: G.Realm.QUAL,
      buttons: [...document.querySelectorAll('#inc-menu .im-seg button')].map(b => [b.dataset.q, b.textContent, b.classList.contains('on')]),
      view: view && { v: +view.value, max: +view.max }, npcs: npcs && { v: +npcs.value, max: +npcs.max }, shBox: sh && sh.checked,
      shadow: { on: r.shadowMap.enabled, cast: !!(s && s.castShadow), size: s ? s.shadow.mapSize.x : null, max: r.capabilities.maxTextureSize || 4096 },
      menuOpen: G.Modes.menuOpen(), modErr: JSON.stringify(G.modErr),
    };
  });
  let L = await look();
  ok('os botões são os de G.Realm.QNAMES, na ordem, com a Ultra', JSON.stringify(L.buttons.map(b => [b[0], b[1]])) === JSON.stringify(L.names) && L.names.some(n => n[0] === 'ultra'), JSON.stringify(L.buttons));
  for (const [k, t] of L.names) {
    await page.click(`#inc-menu .im-seg button[data-q="${k}"]`);
    await page.evaluate(() => { for (let n = 0; n < 3; n++) G.Main.frameFor(33); });
    L = await look(); const P = L.qual[k];
    const lit = P.shadows ? L.shadow.on && L.shadow.cast && L.shadow.size === Math.min(P.shadows, L.shadow.max) : !L.shadow.on;
    ok(`${t}: o clique troca o preset, o botão acende e a luz segue`, L.q === k && L.buttons.find(b => b[0] === k)[2] && L.buttons.filter(b => b[2]).length === 1 && lit && L.shBox === !!P.shadows,
      JSON.stringify({ q: L.q, shadow: L.shadow, box: L.shBox, want: P.shadows }));
    ok(`${t}: a distância de visão e as pessoas cabem no controle`, L.view.v === P.view && L.view.max >= P.view && L.npcs.v === P.npcs && L.npcs.max >= P.npcs, JSON.stringify({ view: L.view, npcs: L.npcs, want: [P.view, P.npcs] }));
    try { await page.screenshot({ path: path.join(OUT, `menu-${k}.png`), timeout: 180000 }); } catch (e) { console.log('(foto não saiu: ' + e.message.slice(0, 60) + ')'); }
    // (the box: off puts the shadows out, on brings back the preset's own size)
    const box = '#inc-menu input[data-g="shadows"]';
    if (L.shBox) { await page.click(box); await page.evaluate(() => { for (let n = 0; n < 2; n++) G.Main.frameFor(33); }); }
    const off = await look();
    await page.click(box); await page.evaluate(() => { for (let n = 0; n < 2; n++) G.Main.frameFor(33); });
    const on = await look(); const want = Math.min(P.shadows || 1024, on.shadow.max);
    ok(`${t}: Sombras desligada apaga, ligada volta a ${want}`, off.Q.shadows === 0 && !off.shadow.on && !off.shBox && on.Q.shadows === want && on.shadow.on && on.shadow.size === want && on.shBox,
      JSON.stringify({ off: [off.Q.shadows, off.shadow], on: [on.Q.shadows, on.shadow] }));
    // (the menu drawn again by the box keeps the preset lit — the box is an override, not another preset)
    ok(`${t}: o preset continua aceso depois da caixa`, on.q === k && on.buttons.find(b => b[0] === k)[2], JSON.stringify(on.buttons));
  }
  // (a slider: the view distance of the Ultra is reached and kept)
  await page.click('#inc-menu .im-seg button[data-q="ultra"]');
  await page.evaluate(() => { const r = document.querySelector('#inc-menu input[data-g="view"]'); r.value = r.max; r.dispatchEvent(new Event('input', { bubbles: true })); for (let n = 0; n < 2; n++) G.Main.frameFor(33); });
  L = await look();
  ok('a distância de visão vai até a da Ultra', L.Q.view >= L.qual.ultra.view, JSON.stringify({ view: L.Q.view, max: L.view.max }));
  await page.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); G.Main.frameFor(33); });
  L = await look();
  ok('Esc fecha o menu', !L.menuOpen, String(L.menuOpen));
  ok('sem G.modErr', L.modErr === '{}', L.modErr);
  ok('sem erro de página nem aviso no console', errs.length === 0, errs.slice(0, 5).join(' || '));
  console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU');
  await browser.close(); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
