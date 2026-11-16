// itens-mundo: the things of the catalog in the game's own world — the material of the things (G.ItemArt.material) compiled and
// drawn by the realm's renderer, with its light, its shadows, its air and its grade, beside a person for scale; one shield with an
// instance colour (the people's paint, D-391) and one without. Nothing here draws them in the game (the drawer is 20a): this proves
// the shapes and the material work in the real pipeline and gives the owner a photo.
//   bash qa/navegador.sh node qa/visual/itens-mundo.js PASTA        env: WORLD (cidade), Q (media), HOUR (10.5, and 17.5 for the second)
// FALHA: a page error, a warning or an error in the console (a shader that does not compile says so there), the material's program not
// made, a thing not drawn
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..'); const OUT = path.resolve(process.argv[2] || '.'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const W = process.env.WORLD || 'cidade';
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', W + '.js') });
  const info = await page.evaluate(env => {
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.W])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, Wd = G.W, N = G.N;
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    // (open level ground near the town: 5 × 5 tiles with nothing built, no water, road or tree)
    const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
    let best = null, bs = 1e9;
    for (let cy = 4; cy < N - 4; cy++) for (let cx = 4; cx < N - 4; cx++) { let ok = true, lo = 1e9, hi = -1e9;
      for (let y = cy - 2; y <= cy + 2 && ok; y++) for (let x = cx - 2; x <= cx + 2 && ok; x++) { const i = y * N + x; if (bad.has(i) || S.type[i] <= G.T.RIVER || !Wd.walkable(i) || (S.treeAt && S.treeAt[i]) || (S.road && S.road[i])) { ok = false; break; } const h = Wd.groundH(x + 0.5, y + 0.5); lo = Math.min(lo, h); hi = Math.max(hi, h); }
      const sc = (hi - lo) * 40 + Math.hypot(cx - s.cx, cy - s.cy) * 0.15; if (ok && sc < bs) { bs = sc; best = [cx + 0.5, cy + 0.5]; } }
    if (!best || !v) return { err: 'sem chão aberto ou sem pessoa' };
    v.x = best[0] - 0.78; v.y = best[1] + 0.05; v.tx = v.x; v.ty = v.y;
    const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); for (let k = 0; k < 6; k++) G.Main.frameFor(33); S.time = env.HOUR / 24;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    G.Cam3D.OPT.follow = false;
    // the display: two rows of things standing on their ends on the ground (what is worn, on its rim), a shield in the people's blue
    const THREE = G.Realm.three ? G.Realm.three() : window.THREE; const scene = G.Realm.scene(); const TL = G.Space.TILE;
    const X0 = best[0] * TL, Z0 = best[1] * TL; const gY = (x, z) => (G.People3D && G.People3D.groundAt ? G.People3D.groundAt(x / TL, z / TL) : Wd.groundH(x / TL, z / TL) * G.Space.HM);
    const mat = G.ItemArt.material(THREE, { key: 'mundo' });
    const ROWS = [['machado.pedra', 'machado.bronze', 'machado.ferro', 'picareta.ferro', 'martelo.ferro', 'foice.bronze', 'faca.ferro', 'espada.bronze', 'espada.ferro', 'lanca.ferro', 'tocha', 'cajado'],
      ['escudo.madeira', 'escudo.madeira', 'escudo.bronze', 'elmo.couro', 'elmo.bronze', 'elmo.ferro', 'couraca.couro', 'couraca.bronze', 'couraca.ferro', 'cesto', 'balde', 'arco', 'rede']];
    const group = new THREE.Group(); let n = 0, shield = 0;
    ROWS.forEach((row, r) => { let x = X0 - 2.2; row.forEach(k => {
      const g = G.ItemArt.geo(k, 0); const bb = g.boundingBox; const kind = k.split('.')[0]; const m = new THREE.InstancedMesh(g, mat, 1); m.castShadow = true; m.receiveShadow = true;
      const q = new THREE.Quaternion(); let lift = -bb.min.y;
      if (kind === 'escudo') { q.setFromEuler(new THREE.Euler(-0.18, 0.25, 0)); lift = 0.43; } else if (kind === 'arco') q.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
      else if (kind === 'cesto' || kind === 'balde') { q.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)); lift = bb.max.z; } else if (kind === 'rede') { q.setFromEuler(new THREE.Euler(Math.PI, 0, 0)); lift = bb.max.y; }
      else if (kind !== 'elmo' && kind !== 'couraca') q.setFromEuler(new THREE.Euler(0, 0.6, 0));
      const w = Math.max(0.22, (bb.max.x - bb.min.x) * (kind === 'escudo' ? 1 : 0.6) + 0.12); x += w / 2; const z = Z0 + 0.45 - r * 1.0; const p = new THREE.Vector3(x, gY(x, z) + lift + (kind === 'escudo' ? 0 : 0.003), z); x += w / 2;
      m.setMatrixAt(0, new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1)));
      if (kind === 'escudo' && shield++ === 1) m.setColorAt(0, new THREE.Color('#3f6fb0')); // (the second wooden shield in the Greeks' blue: the people's paint)
      group.add(m); n++; }); });
    scene.add(group); window.__show = { X0, Z0, Y: gY(X0, Z0), group };
    return { n, spot: best, who: v.id };
  }, { Q: process.env.Q || 'media', W, HOUR: +process.env.HOUR || 10.5 });
  console.log(JSON.stringify(info)); if (info.err) { await browser.close(); console.log('FALHOU: ' + info.err); process.exit(1); }
  const shots = [['frente', 10.5, 0, 4.4, 1.5], ['perto', 10.5, -0.25, 2.6, 1.1], ['tarde', 17.5, 0.5, 4.4, 1.6]];
  let prog = false, drawn = 0;
  for (const [name, hour, side, D, up] of shots) {
    const r = await page.evaluate(o => {
      G.S.time = o.hour / 24; for (let k = 0; k < 3; k++) G.Main.frameFor(33);
      const sh = window.__show; const cam = G.Realm.camera(); cam.position.set(sh.X0 + Math.sin(o.side) * o.D, sh.Y + o.up, sh.Z0 + Math.cos(o.side) * o.D + 0.3); cam.lookAt(sh.X0 + Math.sin(o.side) * 0.3, sh.Y + 0.45, sh.Z0 - 0.15); cam.fov = 45; cam.updateProjectionMatrix();
      const R = G.Realm.renderer(); R.render(G.Realm.scene(), cam); const pr = (R.info.programs || []).map(p => p.cacheKey || p.name || '').join(' ');
      return { calls: R.info.render.calls, tris: R.info.render.triangles, itemProg: /itemarte/.test(pr) };
    }, { hour, side, D, up });
    prog = prog || r.itemProg; drawn = Math.max(drawn, r.tris);
    const f = path.join(OUT, `mundo-${name}.png`); await page.screenshot({ path: f, timeout: 240000 }); console.log(`foto ${f} (${r.calls} chamadas, ${r.tris} triângulos)`);
  }
  await browser.close();
  const bad = errs.slice(); if (!prog) bad.push('o programa do material das coisas (itemarte) não foi feito pelo renderizador');
  console.log(bad.length ? 'FALHOU:\n' + bad.slice(0, 10).join('\n') : `PASSOU | itens-mundo | ${info.n} coisas desenhadas pelo renderizador do jogo com o material delas (o programa compilado, nenhum erro nem aviso)`);
  process.exit(bad.length ? 1 : 0);
})();
