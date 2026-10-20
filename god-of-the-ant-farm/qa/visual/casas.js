// casas: close photos of a town's buildings in the 3D, from several sides, the same every run (before/after):
//   bash qa/navegador.sh node qa/visual/casas.js PASTA_DO_JOGO PASTA_DAS_FOTOS [mundo] [alvos] [vistas]
//   mundo: cidade (default) | metropole · CIV=nordico picks the town of that people (default: the biggest town)
//   alvos: tipo[#n],... — the n-th building of that type in the town, by id (default: hut,hut#1,workshop,storehouse,celeiro)
//          'vila' is the whole town from above
//   vistas: frente,fundos,lado,alto,porta (default: frente,fundos,alto) — frente is the side of the door, three-quarters
// The camera is put by hand (the body stands behind it, so the near pictures are built round it); the warm-up frames
// are drawn small (the software WebGL is slow), the photo at full size. Also prints each building's triangles.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3]; const WORLD = process.argv[4] || 'cidade';
const TARGETS = (process.argv[5] || 'hut,hut#1,workshop,storehouse,celeiro').split(',').filter(Boolean);
const VIEWS = (process.argv[6] || 'frente,fundos,alto').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const VW = +process.env.VW || 1000, VH = +process.env.VH || 620;
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const t00 = Date.now();
  const town = await page.evaluate(([w, civ, Q]) => {
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S; const civOf = s => { const b = [...S.buildings.values()].find(q => q.set === s.id && q.style); return b ? b.style : ''; };
    const all = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
    const s = (civ && all.find(t => civOf(t) === civ)) || all[0]; window.__town = s;
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(4);
    // (the camera put by hand: after the eye's own update, every frame)
    const up = G.Cam3D.update; G.Cam3D.update = function (rdt, body, cam) { up.call(this, rdt, body, cam); const o = window.__cam; if (o) { cam.position.set(o.P[0], o.P[1], o.P[2]); cam.lookAt(o.A[0], o.A[1], o.A[2]); cam.fov = o.fov || 55; cam.updateProjectionMatrix(); } };
    document.querySelectorAll('#inc-hud, #hud, #inc-label, #inc-banner').forEach(e => e.style.visibility = 'hidden');
    const types = {}; for (const b of S.buildings.values()) if (b.set === s.id) types[b.type] = (types[b.type] || 0) + 1;
    // (the drawing's own proof over the whole town, while we are here: Build3D.check, with Props3D's)
    const mine = [...S.buildings.values()].filter(b => b.set === s.id); const t0 = performance.now();
    const check = G.Build3D.check ? G.Build3D.check(mine) : null;
    return { name: s.name, civ: civOf(s), pop: G.Village.pop(s.id), types, check: check && { n: check.length, first: check.slice(0, 12), ms: Math.round(performance.now() - t0) } };
  }, [WORLD, process.env.CIV || (WORLD === 'cidade' ? 'nordico' : ''), process.env.Q || 'media']);
  console.log(`cidade: ${JSON.stringify(town)} (${((Date.now() - t00) / 1000).toFixed(0)} s)`);
  // (a target may carry its own views: hut#1:frente+alto)
  for (const tv of TARGETS) for (const view of (tv === 'vila' ? ['alto'] : tv.includes(':') ? tv.split(':')[1].split('+') : VIEWS)) {
    const tg = tv.split(':')[0];
    const t0 = Date.now();
    const info = await page.evaluate(([tg, view, VW, VH]) => {
      const S = G.S, W = G.W, TL = G.Space.TILE, HM = G.Space.HM; const s = window.__town; const R3 = G.Realm;
      const [type, nth] = tg.split('#'); let C, Hb, R, o = [0, 1], b = null;
      if (type === 'vila') { C = [s.cx * TL, W.groundH(s.cx, s.cy) * HM, s.cy * TL]; Hb = 4; R = 40; }
      else {
        b = [...S.buildings.values()].filter(q => q.type === type && q.set === s.id).sort((p, q) => p.id - q.id)[+nth || 0];
        if (!b) return { skip: 'não há ' + tg };
        C = [(b.x + b.w / 2) * TL, W.maxH(b.x, b.y, b.w, b.h) * HM, (b.y + b.h / 2) * TL]; Hb = G.Build3D.height(b); R = Math.max(b.w, b.h) * TL;
        const sd = G.Build3D.doorSide(b); o = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] }[sd];
      }
      const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
      const V = { frente: [0.55, 1.15, 0.22], fundos: [Math.PI + 0.55, 1.15, 0.22], lado: [Math.PI / 2, 1.2, 0.2], alto: [-0.75, 1.5, 0.75], porta: [0.18, 0.55, 0.12] }[view] || [0.55, 1.15, 0.22];
      const d = rot(o, V[0]); const dist = type === 'vila' ? 70 : R * V[1] + (view === 'porta' ? 2.2 : 5);
      const P = [C[0] + d[0] * dist, 0, C[2] + d[1] * dist];
      const gP = W.inb(P[0] / TL, P[2] / TL) ? W.groundH(P[0] / TL, P[2] / TL) * HM : C[1];
      P[1] = Math.max(gP + 1.6, C[1] + 1.6 + Math.tan(V[2]) * dist * (type === 'vila' ? 0.9 : 0.6));
      const A = [C[0], C[1] + (view === 'porta' ? 1.3 : Math.min(Hb * 0.42, 4)), C[2]];
      // (the body behind the eye, on its feet, so the town round the photo is the near picture)
      const bx = (C[0] + d[0] * (dist + 3)) / TL, by = (C[2] + d[1] * (dist + 3)) / TL; let at = null;
      for (let r = 0; r < 12 && !at; r++) for (let dy = -r; dy <= r && !at; dy++) for (let dx = -r; dx <= r; dx++) { const X = Math.floor(bx) + dx + 0.5, Y = Math.floor(by) + dy + 0.5; if (W.inb(X, Y) && W.walkableXY(X, Y) && !S.treeAt[W.idx(X, Y)]) { at = [X, Y]; break; } }
      if (at) G.Avatar.place(at[0], at[1]); S.time = 0.42;
      window.__cam = { P, A, fov: type === 'vila' ? 50 : 55 };
      const rn = R3.renderer(); const cam = R3.camera();
      rn.setSize(200, 124, false); for (let k = 0; k < 14; k++) G.Main.frameFor(33);
      rn.setSize(VW, VH, false); cam.aspect = VW / VH; cam.updateProjectionMatrix(); S.time = 0.42; G.Main.frameFor(33);
      const inf = rn.info.render;
      const cost = b && G.Build3D.cost ? G.Build3D.cost(b) : null;
      return { b: b ? `${b.type}#${b.id} ${b.w}x${b.h} ${b.style || ''} v${b.v} ${b.built ? '' : 'obra'}` : 'vila', calls: inf.calls, tris: inf.triangles, cost, err: JSON.stringify(G.modErr), check: G.Build3D.check ? G.Build3D.check().slice(0, 3) : [] };
    }, [tg, view, VW, VH]);
    if (info.skip) { console.log(tg + ': ' + info.skip); break; }
    const name = tg.replace('#', '-') + '-' + view;
    await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 });
    console.log(`${name}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
