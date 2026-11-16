// manada: what a big herd in view costs to draw (D-322) — a herd of mixed kinds spread before the body of the god in the
// Encarnado view, from a few metres to the edge of the sight, and the frames timed: the beasts' triangles and draw calls
// (Fauna3D), how many are drawn at each level, the whole frame's triangles and calls, and the ms of a frame (relative only:
// the 3D here is drawn by software — compare a tree with another on the same machine, never with a real graphics card).
//   bash qa/navegador.sh node qa/visual/manada.js PASTA_DO_JOGO [SAIDA.json]
//   env: N (64 — the beasts), KINDS (zebra,gnu,gazelle,buffalo,elephant,lion,deer,cavalo), FRAMES (20), Q (media), VW/VH (1000×620),
//        FOTO (a picture of the view, beside the SAIDA)
// PASTA_DO_JOGO: this game, or an old worktree for the 'antes'.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs'); const os = require('os');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const OUT = process.argv[3];
(async () => {
  const VW = +process.env.VW || 1000, VH = +process.env.VH || 620;
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 400)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const WORLD = process.env.WORLD || 'cidade';
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const env = { FOTO: !!process.env.FOTO, Q: process.env.Q || 'media', WORLD, N: +process.env.N || 64, FRAMES: +process.env.FRAMES || 20,
    KINDS: (process.env.KINDS || 'zebra,gnu,gazelle,buffalo,elephant,lion,deer,cavalo').split(',') };
  const r = await page.evaluate(env => {
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, A = G.Animals, F3 = G.Fauna3D, P3 = G.People3D, N = G.N;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    // (open land: the widest stretch of walkable ground without buildings, a body at its edge looking across it)
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
    let best = null, bs = -1;
    for (let cy = 4; cy < N - 4; cy += 2) for (let cx = 7; cx < N - 26; cx += 2) {
      let ok = 0; for (let x = cx - 3; x < cx + 24; x++) for (let y = cy - 3; y <= cy + 3; y++) { const i = y * N + x; if (x >= 0 && y >= 0 && y < N && !bad.has(i) && S.type[i] > G.T.RIVER && G.W.walkable(i) && !(S.treeAt && S.treeAt[i])) ok++; } // (no tree in the strip nor behind the body, where the camera is)
      if (ok > bs) { bs = ok; best = [cx + 0.5, cy + 0.5]; }
    }
    v.x = best[0]; v.y = best[1]; v.tx = v.x; v.ty = v.y;
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6); S.time = 11 / 24;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    for (const a of [...S.animals.values()]) A.remove(a);
    // (the herd: in rows across the view, from 4 m to ~90 m before the body — a tile is 4 m — held where they stand)
    const herd = []; const TL = G.Space.TILE;
    for (let k = 0; k < env.N; k++) {
      const kind = env.KINDS[k % env.KINDS.length]; const row = Math.floor(k / 8), col = k % 8;
      const dx = 1 + row * 2.6 + (col % 2) * 0.6, dy = (col - 3.5) * (0.5 + row * 0.18);
      const a = A.spawn(kind, v.x + dx, v.y + dy, { age: A.DEF[kind].life * 0.5, grown: 1, state: 'idle', t: 1e6 }); if (!a) continue;
      a.hunger = 0; a.rest = 1e6; herd.push([a, a.x, a.y]);
    }
    const hold = () => { for (const [a, x, y] of herd) { a.x = x; a.y = y; a.tx = x; a.ty = y; a.state = 'idle'; a.t = 1e6; a.moving = false; } };
    // (the Encarnado's own camera, behind the body, looking down the herd — +X — a little down: the field it gives is who is drawn)
    G.Cam3D.OPT.follow = false; const cam = G.Realm.camera(); const aim = () => { G.Cam3D.yaw = 0; G.Cam3D.pitch = 0.12; };
    for (let k = 0; k < 30; k++) { hold(); aim(); G.Main.frameFor(33); }
    const R = G.Realm.renderer(); const times = []; let info = null; const lv = [0, 0, 0];
    for (let k = 0; k < env.FRAMES; k++) {
      hold(); aim(); G.Main.frameFor(33);
      const t0 = performance.now(); R.render(G.Realm.scene(), cam); R.getContext().finish(); times.push(performance.now() - t0);
      if (k === env.FRAMES - 1) { info = { calls: R.info.render.calls, tris: R.info.render.triangles }; if (env.FOTO) info.png = R.domElement.toDataURL('image/png'); // (read at once, before the frame is composited: a page screenshot under load timed out)
        for (const m of F3.meshes()) if (m.n) lv[/_2$/.test(m.name) ? 2 : /_1$/.test(m.name) ? 1 : 0] += m.n; }
    }
    times.sort((a, b) => a - b);
    return { herd: herd.length, drawn: P3.beastSkins, F3: { calls: F3.calls, tris: F3.tris }, levels: lv, frame: info,
      ms: { median: +times[times.length >> 1].toFixed(1), min: +times[0].toFixed(1), max: +times[times.length - 1].toFixed(1) },
      check: (P3.check ? P3.check() : []).slice(0, 4), modErr: JSON.stringify(G.modErr) };
  }, env);
  const png = r.frame && r.frame.png; if (r.frame) delete r.frame.png;
  r.machine = { cores: os.cpus().length, load: +os.loadavg()[0].toFixed(1) }; r.root = ROOT; r.errs = errs.slice(0, 4);
  console.log(JSON.stringify(r));
  if (OUT) { fs.writeFileSync(OUT, JSON.stringify(r, null, 1)); if (png) fs.writeFileSync(OUT.replace(/\.json$/, '') + '.png', Buffer.from(png.split(',')[1], 'base64')); }
  await browser.close();
  if (errs.length || r.modErr !== '{}' || r.check.length) process.exitCode = 1;
})();
