// bichos-estudio: every animal of the land filmed in a studio — one at a time, on open flat ground, beside a person (the
// body of the god, 1.75 m) for scale; a contact sheet of them all, and what they cost to draw.
//   node qa/visual/bichos-estudio.js PASTA_DO_JOGO saida.png
//   env: KINDS (a,b,c — all the land, the amphibious and the birds by default), VIEW=side|front|three|back|top (three; several: side,three,front — each frame from each),
//        MODE=idle|walk|run|fly|sit|graze (idle; sit: those that sit, sitting), N quadros por bicho (1; more: a strip of the stride), K passos entre eles (2),
//        AGE=young (the young), MORPH (albino|melanico), Q (media), VW/VH (each frame, 300×240), COLS (8), HOUR (11),
//        NOPERSON=1 (no person beside), D (the camera's distance, × the beast's size), WORLD (cidade), TOWN (the open ground
//        near this town, by name; the biggest by default), BIOME (only ground of the biome whose name has this: Savana,
//        Tropical — the summer, the jungle)
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
  const env = { Q: process.env.Q || 'media', WORLD: process.env.WORLD || 'cidade', HOUR: +process.env.HOUR || 11, KINDS: process.env.KINDS || '', NOPERSON: !!process.env.NOPERSON, TOWN: process.env.TOWN || '', BIOME: process.env.BIOME || '' };
  const info = await page.evaluate(env => {
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, W = G.W, N = G.N;
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id)).find(t => !env.TOWN || t.name === env.TOWN);
    if (!s) return { err: 'sem a cidade ' + env.TOWN };
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    // (open ground: a square of 7 × 7 tiles of land, nothing built, no water nor road, no tree in the middle — the most level
    // of them, the nearer the town the better)
    const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
    let best = null, bs = 1e9;
    for (let cy = 4; cy < N - 4; cy++) for (let cx = 4; cx < N - 4; cx++) {
      if (env.BIOME && !G.BIOMES[S.biome[cy * N + cx]].name.includes(env.BIOME)) continue;
      let ok = true, lo = 1e9, hi = -1e9;
      const rd = env.BIOME ? 1 : 3; // (a biome's open ground comes in small pieces: 3 × 3 there, and the trees round it)
      for (let y = cy - rd; y <= cy + rd && ok; y++) for (let x = cx - rd; x <= cx + rd && ok; x++) {
        const i = y * N + x;
        if (bad.has(i) || S.type[i] <= G.T.RIVER || !W.walkable(i) || (S.treeAt && S.treeAt[i] && Math.abs(x - cx) < rd && Math.abs(y - cy) < rd) || (S.road && S.road[i])) { ok = false; break; }
        const h = W.groundH(x + 0.5, y + 0.5); lo = Math.min(lo, h); hi = Math.max(hi, h);
      }
      const sc = (hi - lo) * 40 + Math.hypot(cx - s.cx, cy - s.cy) * 0.15;
      if (ok && sc < bs) { bs = sc; best = [cx + 0.5, cy + 0.5]; }
    }
    if (!best) return { err: 'sem chão aberto' };
    v.x = best[0] - 0.55; v.y = best[1]; v.tx = v.x; v.ty = v.y;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(6); S.time = env.HOUR / 24; // (the world's clock is a fraction of the day: the hour 11 written as it was fell off the end of the day, every photo in one dusk light)
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    G.Cam3D.OPT.follow = false;
    if (env.NOPERSON) { const p = G.Possess && G.Possess.body ? G.Possess.body() : v; p.x = best[0] + 0.35; p.y = best[1] + 1.4; p.tx = p.x; p.ty = p.y; } // (no one in the way: the body beside the beast on its right, out of the close frames and behind none of them)
    const DEF = G.Animals.DEF;
    const kinds = env.KINDS ? env.KINDS.split(',') : Object.keys(DEF).filter(k => DEF[k].cls !== 'water');
    window.__spot = best; window.__kinds = kinds;
    return { kinds, spot: best, who: v.id, fauna: G.Fauna3D ? { ready: G.Fauna3D.ready, failed: G.Fauna3D.failed } : 'n/a' };
  }, env);
  console.log(JSON.stringify(info)); if (info.err) { await browser.close(); return; }
  const VIEWS = (process.env.VIEW || 'three').split(','), MODE = process.env.MODE || 'idle', NF = +process.env.N || 1, K = +process.env.K || 2;
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
        window.__t += 0.033; a.x = x + 0.35 + (sp2 ? ((window.__t * sp2) % 2.4) - 1.2 : 0); a.y = y; a.tx = sp2 ? a.x + 1 : a.x; a.ty = a.y; // (held still: no target ahead for the beast to walk to — it walked in place between the holds)
        a.face = 1; a.state = o.mode === 'fly' ? 'fly' : sp.cls === 'air' ? 'perch' : 'idle'; a.t = 1e6; a.moving = !!sp2;
        if (o.mode === 'fly') a.z = 20; else { a.z = 0; a.air = false; a.perch = 0; }
      };
      window.__hold = hold;
      window.__step = n => { for (let k = 0; k < n; k++) { hold(); G.Main.frameFor(33); } hold(); };
      window.__step(12);
      // (sitting, grazing: the view's clock of the beast set where it sits down — the dogs, the cats, the wolf, the foxes, the big
      // cats — or lowers its head to the grass, and held there until it has)
      const bv = G.People3D.beastVis && G.People3D.beastVis(a.id);
      if (bv && (o.mode === 'sit' || o.mode === 'graze')) {
        const T = 2 * Math.PI, w = o.mode === 'sit' ? 0.045 : 0.35, p0 = o.mode === 'sit' ? a.id * 2.3 : a.id; let t = (Math.PI / 2 - p0) / w; while (t < bv.t + 1) t += T / w;
        bv.t = t; window.__step(o.mode === 'sit' ? 70 : 50);
      }
      return { size, name: sp.name };
    }, { kind, young: process.env.AGE === 'young', morph: process.env.MORPH || '', mode: MODE });
    for (let fr = 0; fr < NF; fr++) for (let vi = 0; vi < VIEWS.length; vi++) {
      const r = await page.evaluate(o => {
        if (o.step) window.__step(o.k);
        const a = window.__a; const TL = G.Space.TILE; const X = a.x * TL, Z = a.y * TL; const Y = G.People3D && G.People3D.groundAt ? G.People3D.groundAt(a.x, a.y) : G.W.groundH(a.x, a.y) * G.Space.HM;
        const size = window.__size; const D = Math.max(2.6, size * 2.3) * (o.d || 1);
        const yaw = 0; // (the beast faces +x)
        const ang = o.view === 'side' ? Math.PI / 2 : o.view === 'front' ? 0 : o.view === 'back' ? Math.PI : o.view === 'top' ? 0.6 : 0.75;
        const cam = G.Realm.camera(); const hy = Math.max(0.5, size * 0.42);
        const up = o.view === 'top' ? D * 0.9 : hy * 0.55;
        const fc = o.face ? faceAt(a) : null; // (FACE: the head close, framed by its own length — the eyes, the nostrils, the ears)
        if (fc) { const Df = fc[3] * 3.2 * (o.d || 1); cam.position.set(fc[0] + Math.cos(ang) * Df, fc[1] + (o.view === 'top' ? Df * 0.8 : Df * 0.12), fc[2] - Math.sin(ang) * Df); cam.lookAt(fc[0], fc[1], fc[2]); cam.fov = 40; cam.near = 0.02; cam.updateProjectionMatrix(); }
        else { cam.position.set(X + Math.cos(yaw + ang) * D, Y + hy + up, Z - Math.sin(yaw + ang) * D * (o.view === 'side' ? 1 : 1)); cam.lookAt(X, Y + hy * (o.view === 'top' ? 0.4 : 0.85), Z); cam.fov = 40; cam.updateProjectionMatrix(); }
        G.Realm.renderer().render(G.Realm.scene(), cam);
        const i = G.Realm.renderer().info.render; return { calls: i.calls, tris: i.triangles };
        // (the middle of the head as posed: the poll and the nose of the form carried by the head's frame the pose left; and its length)
        function faceAt(a) {
          const s = G.People3D.beastVis && G.People3D.beastVis(a.id); const F3 = G.Fauna3D; const form = s && s.kf ? s.kf : F3.form(a.kind); if (!s || !s.kb || !form) return null;
          const B = G.FaunaAnim.B, J = form.J, b = B.head, e = s.kb, o = 2 * 16, sc = s.ksc || F3.scaleOf(a.kind); const nz = form.meta.nose, ey = form.meta.eye;
          const at = p => { const x = p[0] - J[b * 3], y = p[1] - J[b * 3 + 1], z = p[2] - J[b * 3 + 2]; return [e[o] * x + e[o + 4] * y + e[o + 8] * z + e[o + 12], e[o + 1] * x + e[o + 5] * y + e[o + 9] * z + e[o + 13], e[o + 2] * x + e[o + 6] * y + e[o + 10] * z + e[o + 14]]; };
          const P = at([J[b * 3], J[b * 3 + 1], J[b * 3 + 2]]), N = at(nz), E = at([0, ey[1], ey[2]]);
          const L = Math.max(0.05, Math.hypot(N[0] - P[0], N[1] - P[1], N[2] - P[2])) * Math.max(0.6, sc);
          return [(P[0] + N[0] + E[0] * 2) / 4, (P[1] + N[1] + E[1] * 2) / 4, (P[2] + N[2] + E[2] * 2) / 4, L];
        }
      }, { k: K, view: VIEWS[vi], d: +process.env.D || 1, step: vi === 0, face: !!process.env.FACE });
      const tag = (NF > 1 ? ' ' + fr : '') + (VIEWS.length > 1 ? ' ' + VIEWS[vi] : '');
      const file = OUT.replace(/\.png$/, '') + '-' + kind + tag.replace(/ /g, '-') + '.png';
      await page.screenshot({ path: file, timeout: 240000 }); cells.push([kind + tag, file]); stats.push(Object.assign({ kind }, r));
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
