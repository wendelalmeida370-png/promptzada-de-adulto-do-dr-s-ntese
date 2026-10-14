// fotos: fixed comparison photos of the 3D (same world, place, camera, hour, quality), for before/after:
//   bash qa/navegador.sh node qa/visual/fotos.js PASTA_DO_JOGO PASTA_DAS_FOTOS [nome,nome...]   (Q=media|alta|baixa, VW/VH)
// PASTA_DO_JOGO is the game folder (this one, or an old worktree for the 'antes'); the views are found from the world's
// own data, so the same every run
// each view: a world, where the body stands (found from the world's own data, so the same every time), the eye, the hour
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3]; const ONLY = (process.argv[4] || '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
const VIEWS = [
  // name, world, place, yaw (camera), pitch, dist, hour, quality
  ['hedeby-praca', 'cidade', 'praca', 0.55, 0.22, 5.2, 0.42],
  ['hedeby-casa', 'cidade', 'hut', 2.6, 0.16, 4.2, 0.42],
  ['hedeby-casa-fundos', 'cidade', 'hut', 5.74, 0.16, 4.2, 0.42],
  ['hedeby-rua-alto', 'cidade', 'praca', 3.9, 0.48, 9, 0.42],
  ['hedeby-tarde', 'cidade', 'praca', 0.55, 0.22, 5.2, 0.66],
  ['hedeby-manha', 'cidade', 'praca', 3.9, 0.3, 6, 0.27],
  ['hedeby-noite', 'cidade', 'praca', 0.55, 0.22, 5.2, 0.86],
  ['hedeby-mata', 'cidade', 'forest', 3.6, 0.18, 4.8, 0.42],
  ['hedeby-praia', 'cidade', 'beach', 1.2, 0.2, 5.2, 0.42],
  ['corpo-frente', 'cidade', 'praca', null, 0.06, 2.6, 0.42],
  ['corpo-lado', 'cidade', 'praca', 'side', 0.06, 2.8, 0.42],
  ['metropole-rua', 'metropole', 'house', 0.8, 0.24, 5.5, 0.42],
  ['metropole-alto', 'metropole', 'house', 2.2, 0.5, 11, 0.42],
];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1000, height: +process.env.VH || 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  for (const w of ['cidade', 'metropole']) await page.addScriptTag({ path: path.join(ROOT, 'worlds', w + '.js') });
  let world = null; const log = [];
  for (const [name, w, place, yaw, pitch, dist, hour] of VIEWS) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const t0 = Date.now();
    const info = await page.evaluate(([w, place, yaw, pitch, dist, hour, fresh, Q]) => {
      const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
      if (fresh) {
        if (G.Modes.state !== 'GOD') { G.Modes.leave('deus'); until(() => G.Modes.state === 'GOD', 400); }
        G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        const S = G.S; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
        const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
        G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6);
      }
      const S = G.S, N = G.N, T = G.T; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
      const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const X = x + dx, Y = y + dy; if (G.W.inb(X, Y) && G.W.walkableXY(X, Y) && !S.treeAt[G.W.idx(X, Y)]) return [X, Y]; } return [x, y]; };
      let at = null;
      const bl = t => [...S.buildings.values()].filter(b => b.type === t && b.built && b.set === s.id).sort((a, b) => a.id - b.id)[0];
      if (place === 'praca') { const b = bl('praca') || bl('campfire'); at = near(b.x - 1.2, b.y + b.h / 2); }
      else if (place === 'hut' || place === 'house') { const b = bl(place) || bl('hut') || bl('house'); at = near(b.x + b.w + 1.4, b.y + b.h + 1.4); }
      else if (place === 'forest' || place === 'beach') {
        let best = null, bs = -1;
        for (let y = 4; y < N - 4; y++) for (let x = 4; x < N - 4; x++) { const i = y * N + x; if (!G.W.walkable(i) || S.treeAt[i] || S.occ[i]) continue; let sc = 0;
          if (place === 'forest') { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (S.treeAt[(y + dy) * N + x + dx]) sc++; }
          else { if (S.type[i] !== T.SAND) continue; for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) if (S.type[(y + dy) * N + x + dx] <= T.SEA) sc++; if (sc > 70) sc = 0; }
          if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; } }
        at = best;
      }
      G.Avatar.place(at[0], at[1]); S.time = hour; f(30);
      document.querySelectorAll('#inc-hud, #hud, #inc-label').forEach(e => e.style.visibility = 'hidden');
      const st = G.Avatar.state(); st.yaw = 0.3;
      const cy = yaw === null ? st.yaw + Math.PI : yaw === 'side' ? st.yaw + Math.PI / 2 : yaw;
      G.Cam3D.OPT.follow = false; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.dist = dist; G.Cam3D.cur = dist; f(40); st.yaw = 0.3; G.Cam3D.yaw = cy; G.Cam3D.pitch = pitch; G.Cam3D.cur = dist; G.Main.frameFor(1);
      return { at: at.map(q => +q.toFixed(2)), err: JSON.stringify(G.modErr), fps: G.Realm.stats && G.Realm.stats.ms };
    }, [w, place, yaw, pitch, dist, hour, world !== w, process.env.Q || 'media']);
    world = w;
    await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 });
    log.push(`${name}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`); console.log(log[log.length - 1]);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
