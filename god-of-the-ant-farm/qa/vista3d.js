// vista3d: node qa/vista3d.js [pasta] [mundo] [qualidade] [cenas] — fotos do mesmo lugar no Modo Deus e no Modo Encarnado,
// lado a lado, para comparar o desenho (o 3D do navegador de testes é por software: as fotos valem, os tempos não).
//   cenas (separadas por vírgula; padrão: todas): cidade, mata, costa, noite, descida, chuva
//   CIV=romano (ou grego, egipcio, asteca, nordico, classico): a maior cidade desse povo, se houver
//   para cada cena: <cena>-deus.png (o olho do deus perto da pessoa), <cena>-corpo.png (atrás das costas),
//   <cena>-olhar.png (o olho girado para o lado, a cidade em volta) e, na descida, os quadros do meio da transição.
// Também diz no fim os quadros por segundo de cada cena e se houve erro de página ou de módulo.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'vista3d'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'cidade', QUAL = process.argv[4] || 'media';
const WANT = (process.argv[5] || 'cidade,mata,costa,noite,descida,chuva').split(',');
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  // (VW, VH: a smaller picture for a quick look — the 3D by software takes its time per pixel)
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1100, height: +process.env.VH || 680 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  await page.evaluate(([w, q, civ]) => {
    G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    G.Realm.setQuality(q);
    const f = (n, ms) => { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33); };
    const until = (c, m, ms) => { for (let k = 0; k < (m || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33); } return -1; };
    const civOf = s => ((G.Fac.ofSet ? G.Fac.ofSet(s.id) : null) || {}).civ;
    const town = () => { const all = [...G.S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id)); return (civ && all.find(s => civOf(s) === civ)) || all[0]; };
    const free = o => o.age >= 18 && o.age < 60 && !o.inside && G.Possess.can(o).ok;
    // the places: the busiest street of the biggest town, the edge of a wood, the shore
    const S = G.S, N = G.N, T = G.T;
    const trees = (x, y) => { let n = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (G.W.inb(x + dx, y + dy) && S.treeAt[(y + dy) * N + x + dx]) n++; return n; };
    const sea = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [0, 2], [-2, 0], [0, -2]].some(([a, b]) => G.W.inb(x + a, y + b) && S.type[(y + b) * N + x + a] <= T.SEA);
    const near = (fn, from) => { let best = null, bd = 1e9; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { const i = y * N + x; if (!G.W.walkable(i) || !fn(x, y, i)) continue; const d = G.dist2(x, y, from.x, from.y); if (d < bd) { bd = d; best = [x + 0.5, y + 0.5]; } } return best; };
    window.__V = {
      f, until, town, free,
      person() { const s = town(); return [...S.villagers.values()].filter(o => o.set === s.id && free(o)).sort((a, b) => G.dist2(a.x, a.y, s.cx, s.cy) - G.dist2(b.x, b.y, s.cx, s.cy))[0]; },
      spot(kind, v) { return kind === 'mata' ? near((x, y) => trees(x, y) >= 10, v) : kind === 'costa' ? near((x, y, i) => sea(x, y) && S.type[i] >= T.SAND, v) : [v.x, v.y]; },
      god(v) { G.UI.select(v); G.Render.cam.follow = v.id; G.Render.cam.tz = G.Render.cam.zoom = 2.6; f(30); },
      enter(v) { G.UI.select(null); if (!G.Modes.enter(v)) return false; return until(() => G.Modes.state === 'INC', 400, 50) >= 0; },
      leave() { if (G.Modes.state === 'INC') G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400, 50); },
      // (each frame waits for the GPU to finish it — one pixel read back — or the time measured is only the CPU's)
      fps() { const gl = G.Realm.renderer().getContext(); const px = new Uint8Array(4); const t0 = performance.now(); for (let k = 0; k < 20; k++) { G.Main.frameFor(16); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return 20000 / (performance.now() - t0); },
    };
  }, [WORLD, QUAL, process.env.CIV || '']);
  console.log('cidade: ' + await page.evaluate(() => { const s = __V.town(); return s.name + ' (' + (((G.Fac.ofSet ? G.Fac.ofSet(s.id) : null) || {}).civ) + ')'; }));
  const fps = {};
  for (const sc of WANT) {
    const ok = await page.evaluate(sc => {
      const V = __V; const v = V.person(); if (!v) return false;
      if (sc === 'noite') G.S.time = 0.86; else if (sc !== 'chuva') G.S.time = 0.32;
      if (sc === 'chuva') { G.S.time = 0.4; G.S.weather.rain = 0.9; }
      const p = V.spot(sc, v); if (p) { v.x = p[0]; v.y = p[1]; v.path = null; v.moving = false; }
      V.god(v); window.__p = v.id; return true;
    }, sc);
    if (!ok) { console.log(`(cena ${sc}: ninguém para encarnar)`); continue; }
    await shot(sc + '-deus');
    if (sc === 'descida') {
      // the middle of the descent: the god's picture and the body's, blending, then the lens opening
      await page.evaluate(() => { const v = G.S.villagers.get(__p); G.UI.select(null); G.Modes.enter(v); __V.until(() => G.Modes.t > 1.25, 200, 33); });
      await shot('descida-1-mistura');
      await page.evaluate(() => __V.until(() => G.Modes.t > 2.0, 200, 33));
      await shot('descida-2-profundidade');
      await page.evaluate(() => __V.until(() => G.Modes.t > 2.9, 200, 33));
      await shot('descida-3-chegando');
      await page.evaluate(() => __V.until(() => G.Modes.state === 'INC', 400, 50));
    } else {
      const e = await page.evaluate(() => __V.enter(G.S.villagers.get(__p)));
      if (!e) { console.log(`(cena ${sc}: não encarnou)`); continue; }
    }
    await page.evaluate(() => { G.Cam3D.pitch = 0.2; __V.f(40, 33); });
    await shot(sc + '-corpo');
    fps[sc] = await page.evaluate(() => +__V.fps().toFixed(1));
    await page.evaluate(() => { G.Cam3D.yaw += 1.4; G.Cam3D.pitch = 0.05; G.Cam3D.dist = 7; __V.f(50, 33); });
    await shot(sc + '-olhar');
    await page.evaluate(() => { G.Cam3D.dist = 4.8; __V.leave(); G.S.weather.rain = 0; });
  }
  const err = await page.evaluate(() => JSON.stringify(G.modErr));
  console.log(`quadros por segundo (${QUAL}, por software): ${JSON.stringify(fps)}`);
  console.log(`erros: ${errs.length ? errs.slice(0, 4).join(' | ') : 'nenhum'} · módulos: ${err}`);
  await browser.close();
})();
