// bichos-estudio: every animal of the land filmed in a studio — one at a time, on open flat ground, beside a person (the
// body of the god, 1.75 m) for scale; a contact sheet of them all, and what they cost to draw.
//   node qa/visual/bichos-estudio.js PASTA_DO_JOGO saida.png
//   env: KINDS (a,b,c — all the land, the amphibious and the birds by default), VIEW=side|front|three|back|top (three),
//        MODE=idle|walk|run|fly (idle), N quadros por bicho (1; more: a strip of the stride), K passos entre eles (2),
//        AGE=young (the young), MORPH (albino|melanico), Q (media), VW/VH (each frame, 300×240), COLS (8), HOUR (11),
//        NOPERSON=1 (no person beside), D (the camera's distance, × the beast's size)
// PASTA_DO_JOGO: this game, or an old worktree for the 'antes'. Each frame is drawn by the game's own renderer.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2] || '.'); const OUT = process.argv[3];
fs.mkdirSync(path.dirname(OUT), { recursive: true });
(async () => {
  const VW = +process.env.VW || 300, VH = +process.env.VH || 240;
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', (process.env.WORLD || 'cidade') + '.js') });
  const env = { Q: process.env.Q || 'media', WORLD: process.env.WORLD || 'cidade', HOUR: +process.env.HOUR || 11, KINDS: process.env.KINDS || '', NOPERSON: !!process.env.NOPERSON };
  const info = await page.evaluate(env => {
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, W = G.W, N = G.N;
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    // (open ground: a square of 7 × 7 tiles of land, nothing built, no water nor road, no tree in the middle — the most level
    // of them, the nearer the town the better)
    const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
    let best = null, bs = 1e9;
    for (let cy = 4; cy < N - 4; cy++) for (let cx = 4; cx < N - 4; cx++) {
      let ok = true, lo = 1e9, hi = -1e9;
      for (let y = cy - 3; y <= cy + 3 && ok; y++) for (let x = cx - 3; x <= cx + 3 && ok; x++) {
        const i = y * N + x;
        if (bad.has(i) || S.type[i] <= G.T.RIVER || !W.walkable(i) || (S.treeAt && S.treeAt[i] && Math.abs(x - cx) < 3 && Math.abs(y - cy) < 3) || (S.road && S.road[i])) { ok = false; break; }
        const h = W.groundH(x + 0.5, y + 0.5); lo = Math.min(lo, h); hi = Math.max(hi, h);
      }
      const sc = (hi - lo) * 40 + Math.hypot(cx - s.cx, cy - s.cy) * 0.15;
      if (ok && sc < bs) { bs = sc; best = [cx + 0.5, cy + 0.5]; }
    }
    if (!best) return { err: 'sem chão aberto' };
    v.x = best[0] - 0.55; v.y = best[1]; v.tx = v.x; v.ty = v.y;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6); S.time = env.HOUR;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    G.Cam3D.OPT.follow = false;
    const DEF = G.Animals.DEF;
    const kinds = env.KINDS ? env.KINDS.split(',') : Object.keys(DEF).filter(k => DEF[k].cls !== 'water');
    window.__spot = best; window.__kinds = kinds;
    return { kinds, spot: best, who: v.id, fauna: G.Fauna3D ? { ready: G.Fauna3D.ready, failed: G.Fauna3D.failed } : 'n/a' };
  }, env);
  console.log(JSON.stringify(info)); if (info.err) { await browser.close(); return; }
  const VIEW = process.env.VIEW || 'three', MODE = process.env.MODE || 'idle', NF = +process.env.N || 1, K = +process.env.K || 2;
  const cells = [], stats = [];
  for (const kind of info.kinds) {
    // a fresh beast of the kind, the others gone; held where it stands (or walked along a line) frame by frame
    const r0 = await page.evaluate(o => {
      const S = G.S, A = G.Animals; for (const a of [...S.animals.values()]) A.remove(a);
      const [x, y] = window.__spot; const sp = A.DEF[o.kind];
      const a = A.spawn(o.kind, x + 0.35, y, { age: o.young ? 0.4 : sp.life * 0.5, grown: o.young ? 0.5 : 1, state: 'idle', t: 1e6, morph: o.morph || null, z: o.mode === 'fly' ? 20 : 0 });
      a.hunger = 0; a.rest = 1e6; window.__a = a; window.__t = 0;
      // (the beast's size, from the 3D's own measure where it has one)
      const size = G.Fauna3D && G.Fauna3D.sizeOf ? G.Fauna3D.sizeOf(o.kind) : 0.5 + (sp.size || 1) * 0.9;
      window.__size = size;
      const hold = () => {
        const a = window.__a; const sp2 = (o.mode === 'walk' ? 1.1 : o.mode === 'run' ? 4.2 : 0) * Math.max(0.6, Math.min(2.2, size)) / 4; // (tiles a second)
        window.__t += 0.033; a.x = x + 0.35 + (sp2 ? ((window.__t * sp2) % 2.4) - 1.2 : 0); a.y = y; a.tx = a.x + 1; a.ty = a.y; a.face = 1; a.state = o.mode === 'fly' ? 'fly' : 'idle'; a.t = 1e6; a.moving = !!sp2;
        if (o.mode === 'fly') a.z = 20; else { a.z = 0; a.air = false; a.perch = 0; }
      };
      window.__hold = hold;
      window.__step = n => { for (let k = 0; k < n; k++) { hold(); G.Main.frameFor(33); } hold(); };
      window.__step(12);
      return { size, name: sp.name };
    }, { kind, young: process.env.AGE === 'young', morph: process.env.MORPH || '', mode: MODE });
    for (let fr = 0; fr < NF; fr++) {
      const r = await page.evaluate(o => {
        window.__step(o.k);
        const a = window.__a; const TL = G.Space.TILE; const X = a.x * TL, Z = a.y * TL; const Y = G.People3D && G.People3D.groundAt ? G.People3D.groundAt(a.x, a.y) : G.W.groundH(a.x, a.y) * G.Space.HM;
        const size = window.__size; const D = Math.max(2.6, size * 2.3) * (o.d || 1);
        const yaw = 0; // (the beast faces +x)
        const ang = o.view === 'side' ? Math.PI / 2 : o.view === 'front' ? 0 : o.view === 'back' ? Math.PI : o.view === 'top' ? 0.6 : 0.75;
        const cam = G.Realm.camera(); const hy = Math.max(0.5, size * 0.42);
        const up = o.view === 'top' ? D * 0.9 : hy * 0.55;
        cam.position.set(X + Math.cos(yaw + ang) * D, Y + hy + up, Z - Math.sin(yaw + ang) * D * (o.view === 'side' ? 1 : 1)); cam.lookAt(X, Y + hy * (o.view === 'top' ? 0.4 : 0.85), Z); cam.fov = 40; cam.updateProjectionMatrix();
        G.Realm.renderer().render(G.Realm.scene(), cam);
        const i = G.Realm.renderer().info.render; return { calls: i.calls, tris: i.triangles };
      }, { k: K, view: VIEW, d: +process.env.D || 1 });
      const file = OUT.replace(/\.png$/, '') + '-' + kind + (NF > 1 ? '-' + fr : '') + '.png';
      await page.screenshot({ path: file, timeout: 240000 }); cells.push([kind + (NF > 1 ? ' ' + fr : ''), file]); stats.push(Object.assign({ kind }, r));
    }
  }
  const chk = await page.evaluate(() => ({ check: G.People3D.check ? G.People3D.check() : [], err: JSON.stringify(G.modErr), beasts: G.People3D.beasts, fauna: G.Fauna3D && G.Fauna3D.check ? G.Fauna3D.check() : null }));
  console.log(JSON.stringify({ chk, stats: stats.slice(0, 4) }));
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
  // (the contact sheet: every frame with its name)
  fs.writeFileSync(OUT + '.json', JSON.stringify(cells));
  try { require('child_process').execFileSync(process.env.PY || 'python3', [path.join(__dirname, 'bichos-folha.py'), OUT, String(+process.env.COLS || 8)], { stdio: 'inherit' }); } catch (e) { console.log('(sem a folha: ' + e.message.slice(0, 80) + ')'); }
})();
