// mar-estudio: the beasts of the sea filmed in a studio of open water (D-267) — one at a time, a little off a shore of the
// biggest town, the body of the god standing on the beach for scale (1.75 m); a contact sheet of them all.
//   node qa/visual/mar-estudio.js PASTA_DO_JOGO saida.png
//   env: KINDS (a,b,c — the five of the sea by default), VIEW=three|side|front|back|top|under (three; several: side,under),
//        MODE=idle|swim|leap|blow|bite (idle: lying at the surface; swim: swimming along the shore; leap: the world's leap —
//        a.leap —, blow: the whale's blow — a.spout —, bite: the chase, the jaw open), N quadros por bicho (1), K passos entre
//        eles (3), Q (media), VW/VH (360×260), COLS (5), HOUR (11), D (the camera's distance, × the beast's length), WORLD,
//        NOWATER=1 (the water's face not drawn: the whole beast seen, as in a dry aquarium), FAR=1 (the far meshes; the near
//        ones by default, wherever the game's camera is)
// PASTA_DO_JOGO: this game, or an old worktree for the 'antes'. Each frame is drawn by the game's own renderer.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const OUT = path.resolve(process.argv[3] || 'mar.png');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const SIZE = { dolphin: 2.4, orca: 6.5, whale: 14, shark: 3.6, turtle: 1.2 };
(async () => {
  const VW = +process.env.VW || 360, VH = +process.env.VH || 260;
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', (process.env.WORLD || 'cidade') + '.js') });
  const env = { Q: process.env.Q || 'media', WORLD: process.env.WORLD || 'cidade', HOUR: +process.env.HOUR || 11, KINDS: process.env.KINDS || '', FAR: !!process.env.FAR };
  const info = await page.evaluate(env => {
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, W = G.W, N = G.N, T = G.T;
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    // (the studio: a tile of beach — land a body walks, no building — with open water before it: in one of the four ways, the
    // tiles 2 to 14 out and 4 to each side all sea; the nearer the town the better)
    const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
    const sea = (x, y) => W.inb(x, y) && S.type[W.idx(x, y)] <= T.SEA;
    let best = null, bs = 1e9;
    for (let cy = 12; cy < N - 12; cy++) for (let cx = 12; cx < N - 12; cx++) {
      const i = cy * N + cx; if (bad.has(i) || S.type[i] <= T.RIVER || !W.walkable(i)) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let ok = true; for (let k = 2; k <= 14 && ok; k++) for (let l = -4; l <= 4 && ok; l++) if (!sea(cx + dx * k - dy * l, cy + dy * k + dx * l)) ok = false;
        if (!ok || !sea(cx + dx, cy + dy)) continue;
        const sc = Math.hypot(cx - s.cx, cy - s.cy); if (sc < bs) { bs = sc; best = { x: cx + 0.5, y: cy + 0.5, dx, dy }; }
      }
    }
    if (!best) return { err: 'sem praia com mar aberto' };
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    v.x = best.x; v.y = best.y; v.tx = v.x; v.ty = v.y;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6); S.time = env.HOUR;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    G.Cam3D.OPT.follow = false;
    const kinds = env.KINDS ? env.KINDS.split(',') : Object.keys(G.Animals.DEF).filter(k => G.Animals.DEF[k].cls === 'water');
    window.__spot = best; if (G.Fauna3D) G.Fauna3D.lod = !!env.FAR;
    return { kinds, spot: best, who: v.id, fauna: G.Fauna3D ? { ready: G.Fauna3D.ready, failed: G.Fauna3D.failed } : 'n/a' };
  }, env);
  console.log(JSON.stringify(info)); if (info.err) { await browser.close(); process.exit(1); }
  const VIEW = process.env.VIEW || 'three', MODE = process.env.MODE || 'idle', NF = +process.env.N || 1, K = +process.env.K || 3;
  const cells = [], stats = [];
  for (const kind of info.kinds) {
    // a fresh beast of the kind, the others gone; held off the beach (or swum along it) frame by frame
    await page.evaluate(o => {
      const S = G.S, A = G.Animals; for (const a of [...S.animals.values()]) A.remove(a);
      // (tiles out from the beach: past its own length, and where the sea is deep enough for its body — the whale's 5 m)
      const P = window.__spot; const L = o.size / G.Space.TILE; const need = o.size > 8 ? 5 : o.size > 3 ? 2.5 : 1.4; let out = 3.2 + L * 0.45;
      while (out < 13.5 && (G.SEA - G.W.hAt(P.x + P.dx * out, P.y + P.dy * out)) * G.Space.HM < need) out += 0.5;
      const x0 = P.x + P.dx * out, y0 = P.y + P.dy * out; const sx = -P.dy, sy = P.dx; // (along the shore)
      const sp = A.DEF[o.kind];
      const a = A.spawn(o.kind, x0, y0, { age: sp.life * 0.5, state: 'idle', t: 1e6 }); a.hunger = 0; window.__a = a; window.__t = 0;
      // (bite: a turtle held just before its jaws, the prey of the chase — a little too far for the world to bite)
      window.__prey = o.mode === 'bite' ? A.spawn(o.kind === 'turtle' ? 'dolphin' : 'turtle', x0, y0, { age: 10, state: 'idle', t: 1e6 }) : null;
      window.__hold = () => {
        const a = window.__a; const go = o.mode === 'swim' || o.mode === 'leap' || o.mode === 'bite'; const v = go ? Math.max(0.8, o.size * 0.45) / G.Space.TILE : 0; // (tiles a second)
        window.__t += 0.033; const u = go ? ((window.__t * v) % (L * 3 + 2)) - (L * 1.5 + 1) : 0;
        a.x = x0 + sx * u; a.y = y0 + sy * u; a.tx = a.x + sx; a.ty = a.y + sy; a.t = 1e6; a.moving = go; a.hunger = 0; a.target = 0;
        a.state = o.mode === 'bite' ? 'chase' : 'idle';
        const pr = window.__prey; if (pr) { pr.x = a.x + sx * 0.95; pr.y = a.y + sy * 0.95; pr.tx = pr.x; pr.ty = pr.y; pr.state = 'idle'; pr.t = 1e6; pr.hp = 1e6; a.target = pr.id; a.t = 1e6; }
        if (o.mode !== 'leap') { a.leap = 0; a.z = 0; }
        if (o.mode !== 'blow') a.spout = 0;
      };
      window.__step = n => { for (let k = 0; k < n; k++) { window.__hold(); G.Main.frameFor(33); } window.__hold(); };
      window.__step(20);
      if (o.mode === 'leap') { window.__a.leap = 1; window.__step(1); }
      if (o.mode === 'blow') { window.__a.spout = 1.6; window.__step(1); }
    }, { kind, mode: MODE, size: SIZE[kind] || 3 });
    for (let fr = 0; fr < NF; fr++) for (const [vi, view] of VIEW.split(',').entries()) {
      const r = await page.evaluate(o => {
        if (o.first) window.__step(o.k);
        const a = window.__a; const TL = G.Space.TILE; const X = a.x * TL, Z = a.y * TL; const Y = (G.W.inb(a.x, a.y) ? G.W.waterH(a.x, a.y) : G.SEA) * G.Space.HM;
        const P = window.__spot; const yaw = Math.atan2(P.dx, -P.dy); // (the way it swims along the shore)
        if (o.nowater) G.Realm.scene().traverse(q => { if (q.isMesh && q.material && q.material.transparent && q.material.vertexColors && q.material.depthWrite === false) q.visible = false; });
        const D = Math.max(3.2, o.size * 1.25) * (o.d || 1);
        const ang = { side: Math.PI / 2, front: 0, back: Math.PI, top: 0.6, three: 0.8, under: Math.PI / 2 }[o.view];
        const cam = G.Realm.camera(); const up = o.view === 'top' ? D * 1.1 : o.view === 'under' ? -o.size * 0.12 : o.view === 'side' ? o.size * 0.08 + 0.3 : D * 0.42;
        const cx = X + Math.cos(yaw + ang) * D, cz = Z + Math.sin(yaw + ang) * D;
        cam.position.set(cx, Y + up, cz); cam.lookAt(X, Y + (o.view === 'under' ? -o.size * 0.08 : o.size * 0.02), Z); cam.fov = 40; cam.updateProjectionMatrix();
        G.Realm.renderer().render(G.Realm.scene(), cam);
        const i = G.Realm.renderer().info.render; return { calls: i.calls, tris: i.triangles };
      }, { k: K, view, first: vi === 0, d: +process.env.D || 1, size: SIZE[kind] || 3, nowater: !!process.env.NOWATER });
      const file = OUT.replace(/\.png$/, '') + '-' + kind + '-' + fr + '-' + view + '.png';
      await page.screenshot({ path: file, timeout: 240000 }); cells.push([kind + (NF > 1 ? ' ' + fr : '') + ' ' + view + ' (' + MODE + ')', file]); stats.push(Object.assign({ kind }, r));
    }
  }
  const chk = await page.evaluate(() => ({ check: G.People3D.check ? G.People3D.check() : [], things: G.Things3D && G.Things3D.check ? G.Things3D.check() : [], err: JSON.stringify(G.modErr), skins: G.Fauna3D ? G.Fauna3D.rows : 0, sea: G.Things3D ? G.Things3D.n.sea : 0 }));
  console.log(JSON.stringify({ chk, stats: stats.slice(0, 5) }));
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
  fs.writeFileSync(OUT + '.json', JSON.stringify(cells));
  try { require('child_process').execFileSync(process.env.PY || 'python3', [path.join(__dirname, 'bichos-folha.py'), OUT, String(+process.env.COLS || 5)], { stdio: 'inherit' }); } catch (e) { console.log('(sem a folha: ' + e.message.slice(0, 80) + ')'); }
})();
