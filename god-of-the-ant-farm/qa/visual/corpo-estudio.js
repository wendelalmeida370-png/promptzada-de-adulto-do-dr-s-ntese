// corpo-estudio: the body filmed by a fixed camera, as in a studio — standing, walking or running, from the front, the
// side or the back; a strip of frames (the stride, the blink), and what the people cost to draw.
//   bash qa/navegador.sh node qa/visual/corpo-estudio.js PASTA_DO_JOGO saida.png
//   env: MODE=idle|walk|run (walk), VIEW=front|side|back|three (side), D (metros, 3.2), N quadros (6), K passos entre eles (3),
//        SEX=m|f, ID (a person's id), WORLD (cidade), Q (media), VW/VH (tamanho de cada quadro), H (altura do olho, 0.95)
// PASTA_DO_JOGO: this game, or an old worktree for the 'antes'. Each frame is drawn by the game's own renderer.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = process.argv[2]; const OUT = process.argv[3];
fs.mkdirSync(path.dirname(OUT), { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 260, height: +process.env.VH || 340 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', (process.env.WORLD || 'cidade') + '.js') });
  const env = { MODE: process.env.MODE || 'walk', VIEW: process.env.VIEW || 'side', D: +process.env.D || 3.2, SEX: process.env.SEX || '', ID: +process.env.ID || 0, H: +process.env.H || 0.95, Q: process.env.Q || 'media', WORLD: process.env.WORLD || 'cidade', HOUR: +process.env.HOUR || 0.42 };
  const info = await page.evaluate(env => {
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    const S = G.S; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = env.ID ? S.villagers.get(env.ID) : [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok && (env.SEX ? o.g === env.SEX : true)).sort((a, b) => a.id - b.id)[0];
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(10); S.time = env.HOUR;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label').forEach(e => e.style.visibility = 'hidden');
    window.__st = G.Avatar.state(); G.Cam3D.yaw = 0; G.Cam3D.OPT.follow = false;
    G.Input3D.down.frente = env.MODE !== 'idle'; G.Input3D.down.correr = env.MODE === 'run'; f(45);
    window.__shot = () => {
      const st = window.__st, p = G.Avatar.pos(); const cam = G.Realm.camera(); const D = env.D;
      const a = env.VIEW === 'front' ? st.yaw : env.VIEW === 'back' ? st.yaw + Math.PI : env.VIEW === 'three' ? st.yaw + 0.7 : st.yaw + Math.PI / 2;
      cam.position.set(p.X + Math.cos(a) * D, p.Y + env.H, p.Z + Math.sin(a) * D); cam.lookAt(p.X, p.Y + env.H - 0.05, p.Z); cam.fov = 40; cam.updateProjectionMatrix();
      G.Realm.renderer().render(G.Realm.scene(), cam);
      const i = G.Realm.renderer().info.render; return { calls: i.calls, tris: i.triangles };
    };
    return { id: v.id, name: v.name, g: v.g, age: Math.floor(v.age), role: v.role, civ: v.civ, skin: G.People3D.skin ? G.People3D.skin() : 'n/a', b3: G.Body3D ? { ready: G.Body3D.ready, failed: G.Body3D.failed, bindErr: G.Body3D.bindErr } : null };
  }, env);
  console.log(JSON.stringify(info));
  const N = +process.env.N || 6, K = +process.env.K || 3; const shots = [];
  for (let k = 0; k < N; k++) {
    const r = await page.evaluate(n => { for (let q = 0; q < n; q++) G.Main.frameFor(33); return window.__shot(); }, K);
    shots.push(r); await page.screenshot({ path: OUT.replace(/\.png$/, '-' + k + '.png'), timeout: 240000 });
  }
  const chk = await page.evaluate(() => ({ check: G.People3D.check(), err: JSON.stringify(G.modErr), people: G.People3D.count, meshes: G.Body3D && G.Body3D.meshes ? G.Body3D.meshes().filter(m => m.n) : null }));
  console.log(JSON.stringify({ shots: shots[0], chk }));
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
  // (the frames side by side)
  try { require('child_process').execFileSync(process.env.PY || 'python3', [path.join(__dirname, 'corpo-tira.py'), OUT, String(N)]); } catch (e) { console.log('(sem a tira: ' + e.message.slice(0, 80) + ')'); }
})();
