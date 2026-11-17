// vestir-fotos: the worn things seen in the game's own renderer — the warrior lived by the god, with the helmet, the shield and the
// spear of his kit and a cuirass put on from his bag, from the front, the side and three-quarters, and walking; and a woodcutter
// of the world at the tree with his axe (20a, D-349 to D-353).
//   bash qa/navegador.sh node qa/visual/vestir-fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS      (WORLD=cidade, Q=media)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 380, height: 460 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 400)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const WORLD = process.env.WORLD || 'cidade';
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const info = await page.evaluate(([W, Q]) => {
    G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[W])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    const S = G.S; S.time = 0.42;
    // (a warrior if the world has one to live; else a grown man, armed from his bag as one)
    const can = o => o.age >= 18 && o.age < 50 && !o.inside && G.Possess.can(o).ok;
    const v = [...S.villagers.values()].filter(o => o.role === 'guerreiro' && can(o)).sort((a, b) => a.id - b.id)[0] || [...S.villagers.values()].filter(o => o.g === 'm' && can(o)).sort((a, b) => a.id - b.id)[0];
    if (!v) return { err: 'ninguém para viver' };
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(10); S.time = 0.42;
    // (a cuirass of the best the people know, put in his bag and on his trunk — by the world's own doors, in its step)
    const arts = G.Inv.artsOf ? G.Inv.artsOf(v) : null; const best = (k, d) => (arts && G.Itens.best ? G.Itens.best(k, arts) : null) || d;
    const kit = [[best('elmo', 'elmo.couro'), 'cabeca'], [best('couraca', 'couraca.couro'), 'corpo'], [best('escudo', 'escudo.madeira'), 'outra'], [best('lanca', 'lanca.pedra'), 'mao']];
    const put = []; G.Possess.apply(w => { for (const [k, sl] of kit) { const e = G.Inv.equipOf(w); if (e[sl] === k) { put.push(k + ' já'); continue; } G.Depot.make('m:' + w.id, k, 1, { code: 'kit', by: w.id }); const r = G.Inv.equip(w, k, sl); put.push(k + ' ' + (r && r.ok ? 'ok' : (r && r.why))); } return { ok: true }; }); f(4);
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label').forEach(e => e.style.visibility = 'hidden');
    window.__st = G.Avatar.state(); G.Cam3D.OPT.follow = false;
    window.__shot = (view, D, H) => {
      const st = window.__st, p = G.Avatar.pos(); const cam = G.Realm.camera();
      const a = view === 'front' ? st.yaw : view === 'back' ? st.yaw + Math.PI : view === 'three' ? st.yaw + 0.7 : st.yaw + Math.PI / 2;
      cam.position.set(p.X + Math.cos(a) * D, p.Y + H, p.Z + Math.sin(a) * D); cam.lookAt(p.X, p.Y + H - 0.08, p.Z); cam.fov = 40; cam.updateProjectionMatrix();
      G.Realm.renderer().render(G.Realm.scene(), cam); return G.People3D.tools().map(x => x[0] + '×' + x[1]).join(' ');
    };
    return { id: v.id, name: v.name, role: v.role, civ: v.civ, held: JSON.stringify(G.Inv.held(v)), put };
  }, [WORLD, process.env.Q || 'media']);
  console.log(JSON.stringify(info)); if (info.err) { await browser.close(); return; }
  const shot = async (name, js) => { const t = await page.evaluate(js); await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); return t; };
  console.log('frente', await shot('guerreiro-frente', () => window.__shot('front', 2.6, 1.0)));
  console.log('lado', await shot('guerreiro-lado', () => window.__shot('side', 2.6, 1.0)));
  console.log('três quartos', await shot('guerreiro-tres', () => window.__shot('three', 2.4, 1.0)));
  await page.evaluate(() => { G.Input3D.down.frente = true; for (let k = 0; k < 40; k++) G.Main.frameFor(33); });
  for (let k = 0; k < 6; k++) await shot('guerreiro-andando-' + k, () => { for (let q = 0; q < 3; q++) G.Main.frameFor(33); return window.__shot('side', 2.8, 1.0); });
  await page.evaluate(() => { G.Input3D.down.frente = false; G.Input3D.down.correr = true; G.Input3D.down.frente = true; for (let k = 0; k < 30; k++) G.Main.frameFor(33); });
  for (let k = 0; k < 6; k++) await shot('guerreiro-correndo-' + k, () => { for (let q = 0; q < 2; q++) G.Main.frameFor(33); return window.__shot('side', 3.2, 1.0); });
  await page.evaluate(() => { G.Input3D.down.frente = false; G.Input3D.down.correr = false; for (let k = 0; k < 20; k++) G.Main.frameFor(33); });
  // (a woodcutter of the world at work: the first one seen with the axe at a tree — the camera beside him)
  const wc = await page.evaluate(() => {
    G.Modes.leave && G.Modes.leave(); const S = G.S; S.time = 0.4; let v = null;
    for (let k = 0; k < 900 && !v; k++) { G.Main.frameFor(33); v = [...S.villagers.values()].find(o => (o.act === 'chop' || o.act === 'cut') && !o.inside && !o.aboard) || null; }
    if (!v) return { err: 'ninguém cortando lenha' };
    window.__wc = v.id; window.__wshot = () => { const v = G.S.villagers.get(window.__wc); const s = G.People3D.visOf ? G.People3D.visOf(v.id) : null; const X = s ? s.X : v.x * 4, Z = s ? s.Z : v.y * 4, Y = s ? s.Y : 0; const yaw = s ? s.yaw : 0;
      const cam = G.Realm.camera(); const a = yaw + Math.PI / 2 + 0.5; cam.position.set(X + Math.cos(a) * 2.6, Y + 1.0, Z + Math.sin(a) * 2.6); cam.lookAt(X, Y + 0.9, Z); cam.fov = 40; cam.updateProjectionMatrix(); G.Realm.renderer().render(G.Realm.scene(), cam); return v.act + ' ' + JSON.stringify(G.Inv.held(v)); };
    return { id: v.id, name: v.name, role: v.role, act: v.act };
  });
  console.log('lenhador', JSON.stringify(wc));
  if (!wc.err) for (let k = 0; k < 6; k++) console.log('lenhador', k, await shot('lenhador-' + k, () => { for (let q = 0; q < 3; q++) G.Main.frameFor(33); return window.__wshot(); }));
  const chk = await page.evaluate(() => ({ check: G.People3D.check ? G.People3D.check() : null, err: JSON.stringify(G.modErr) }));
  console.log(JSON.stringify(chk)); console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
