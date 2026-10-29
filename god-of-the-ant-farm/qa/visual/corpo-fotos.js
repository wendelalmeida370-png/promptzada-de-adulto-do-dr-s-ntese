// corpo-fotos: one browser session for the people's before/after — the fixed views of qa/visual/fotos.js that show the
// body (corpo-frente, corpo-lado: same world, place, camera and hour), the body walking and running seen from the side
// (strips of frames), a close look at the face, and what a crowd costs to draw (36 and 96 people: calls and triangles
// with the people and without them).
//   bash qa/navegador.sh node qa/visual/corpo-fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS   (Q=media)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  for (const w of ['cidade', 'metropole']) await page.addScriptTag({ path: path.join(ROOT, 'worlds', w + '.js') });
  const log = m => { console.log(m); fs.appendFileSync(path.join(OUT, 'corpo-fotos.txt'), m + '\n'); };
  // the world and the body, as fotos.js chooses them (the town's first adult, by id; beside the square)
  await page.evaluate(Q => {
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    window.__f = f; window.__until = until;
    window.__load = (w) => {
      if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
      G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
      const S = G.S; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
      const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
      G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6);
      const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (G.W.inb(X, Y) && G.W.walkableXY(X, Y) && !S.treeAt[G.W.idx(X, Y)]) return [X, Y]; } return [x, y]; };
      const bl = t => [...S.buildings.values()].filter(b => b.type === t && b.built && b.set === s.id).sort((a, b) => a.id - b.id)[0];
      const b = bl('praca') || bl('campfire'); window.__at = near(b.x - 1.2, b.y + b.h / 2);
      document.querySelectorAll('#inc-hud, #hud, #inc-label, #inc-root').forEach(e => e.style.visibility = 'hidden');
      return { v: v.name, id: v.id };
    };
  }, process.env.Q || 'media');
  const t0 = Date.now();
  const who = await page.evaluate(() => window.__load('cidade')); log('corpo: ' + JSON.stringify(who));
  // 1. the fixed views (as fotos.js: the body at the square, its yaw 0.3, the camera behind/beside it)
  for (const [name, yaw, pitch, dist] of [['corpo-frente', null, 0.06, 2.6], ['corpo-lado', 'side', 0.06, 2.8]]) {
    await page.evaluate(([yaw, pitch, dist]) => {
      const S = G.S, at = window.__at; G.Avatar.place(at[0], at[1]); S.time = 0.42; window.__f(30);
      const st = G.Avatar.state(); st.yaw = 0.3; const cy = yaw === null ? st.yaw + Math.PI : yaw === 'side' ? st.yaw + Math.PI / 2 : yaw;
      G.Cam3D.OPT.follow = false; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; window.__f(40); st.yaw = 0.3; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1);
    }, [yaw, pitch, dist]);
    await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); log(name + ' ok (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  }
  // 2. the face, close (a studio camera in front of the head)
  await page.evaluate(() => { const p = G.Avatar.pos(), st = G.Avatar.state(); const cam = G.Realm.camera(); const a = st.yaw; cam.position.set(p.X + Math.cos(a) * 0.9, p.Y + 1.62 * (p.h || 1.75) / 1.75, p.Z + Math.sin(a) * 0.9); cam.lookAt(p.X, p.Y + 1.6 * (p.h || 1.75) / 1.75, p.Z); cam.fov = 30; cam.updateProjectionMatrix(); G.Realm.renderer().render(G.Realm.scene(), cam); });
  await page.screenshot({ path: path.join(OUT, 'corpo-rosto.png'), clip: { x: 300, y: 80, width: 400, height: 460 }, timeout: 240000 }); log('corpo-rosto ok');
  // 3. walking and running, seen from the side by a studio camera (6 frames of each, every 3 steps)
  for (const run of [false, true]) {
    await page.evaluate(run => { const at = window.__at; G.Avatar.place(at[0], at[1]); window.__f(4); G.Cam3D.yaw = 0; G.Cam3D.OPT.follow = false; G.Input3D.down.frente = true; G.Input3D.down.correr = run; window.__f(45); }, run);
    for (let k = 0; k < 6; k++) {
      await page.evaluate(() => { for (let q = 0; q < 3; q++) G.Main.frameFor(33); const st = G.Avatar.state(), p = G.Avatar.pos(); const cam = G.Realm.camera(); const a = st.yaw + Math.PI / 2; cam.position.set(p.X + Math.cos(a) * 3.4, p.Y + 0.95, p.Z + Math.sin(a) * 3.4); cam.lookAt(p.X, p.Y + 0.9, p.Z); cam.fov = 40; cam.updateProjectionMatrix(); G.Realm.renderer().render(G.Realm.scene(), cam); });
      await page.screenshot({ path: path.join(OUT, (run ? 'corrida' : 'andando') + '-' + k + '.png'), clip: { x: 370, y: 140, width: 260, height: 340 }, timeout: 240000 });
    }
    await page.evaluate(() => { G.Input3D.down.frente = false; G.Input3D.down.correr = false; window.__f(10); });
    log((run ? 'corrida' : 'andando') + ' ok (' + Math.round((Date.now() - t0) / 1000) + ' s)');
  }
  // 4. what a crowd costs: the metropolis, the people drawn whole set to 36 and to 96; one frame drawn with them, one without
  await page.evaluate(() => window.__load('metropole'));
  for (const n of [36, 96]) {
    const r = await page.evaluate(n => {
      G.Realm.setOver('npcs', n); G.S.time = 0.42; window.__f(12); const R = G.Realm.renderer(), sc = G.Realm.scene(), cam = G.Realm.camera();
      const P3 = G.People3D; const info = () => ({ calls: R.info.render.calls, tris: R.info.render.triangles });
      R.render(sc, cam); const a = info(); const drawn = P3.count, crowd = P3.crowd, beasts = P3.beasts;
      const keep = P3.update; P3.clear(); P3.update = () => { }; R.render(sc, cam); const b = info(); P3.update = keep; window.__f(2);
      const t = []; for (let k = 0; k < 12; k++) { const t0 = performance.now(); G.Main.frameFor(16); t.push(performance.now() - t0); } t.sort((x, y) => x - y);
      return { n, drawn, crowd, beasts, withPeople: a, without: b, people: { calls: a.calls - b.calls, tris: a.tris - b.tris }, frameMs: +t[6].toFixed(1), skin: P3.skin ? P3.skin() : 'peças' };
    }, n);
    log('custo ' + JSON.stringify(r));
  }
  log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
  // (the strips)
  const py = process.env.PY || 'python3';
  for (const nm of ['andando', 'corrida']) try { require('child_process').execFileSync(py, [path.join(__dirname, 'corpo-tira.py'), path.join(OUT, nm + '.png'), '6']); } catch (e) { log('(sem tira ' + nm + ')'); }
})();
