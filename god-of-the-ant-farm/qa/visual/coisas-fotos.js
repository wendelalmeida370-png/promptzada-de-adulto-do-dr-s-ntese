// coisas-fotos: as coisas dos gestos e a criança de pernas curtas no mundo do jogo, pelo desenho do próprio jogo (22c, D-612 a D-614)
// — para o dono ver, antes e depois. No Modo Encarnado, com o mundo parado (G.Modes.menu: os atos e os relógios dos gestos ficam onde
// a prova os põe), num chão aberto da maior cidade: quem bebe (a caneca no gole), quem é levado amarrado (os grilhões), a criança
// que brinca com a bola, quem perdeu a perna (a muleta), uma criança pequena ao lado de um grande, e duas pessoas com as mãos na
// cintura e de braços cruzados. A mão da prova só põe a cena (o lugar, o ato, a perna perdida) numa cópia do mundo que não se salva.
//   bash qa/navegador.sh node qa/visual/coisas-fotos.js PASTA [PASTA_DO_JOGO]     env: WORLD (cidade), Q (media), HOUR (10.5)
// FALHA: um erro de página, um aviso ou um erro no console, um erro de módulo
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const OUT = path.resolve(process.argv[2] || '.'); fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve(process.argv[3] || path.join(__dirname, '..', '..'));
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
    const byId = (a, b) => a.id - b.id;
    const pool = [...S.villagers.values()].filter(o => o.set === s.id && !o.aboard && !o.jail && !o.captive && !o.ug && !o.held && !(o.carry && o.carry.n > 0)).sort(byId); // (inside too: the proof brings them out; never one with a load in the arms — the hands are the load's)
    const grown = pool.filter(o => o.age >= 18 && o.age < 55);
    const body = grown.find(o => G.Possess.can(o).ok);
    // (open level ground near the town: 7 × 7 tiles with nothing built, no water, road or tree)
    const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
    let best = null, bs = 1e9;
    for (let cy = 5; cy < N - 5; cy++) for (let cx = 5; cx < N - 5; cx++) { let ok = true, lo = 1e9, hi = -1e9;
      for (let y = cy - 3; y <= cy + 3 && ok; y++) for (let x = cx - 3; x <= cx + 3 && ok; x++) { const i = y * N + x; if (bad.has(i) || S.type[i] <= G.T.RIVER || !Wd.walkable(i) || (S.treeAt && S.treeAt[i]) || (S.road && S.road[i])) { ok = false; break; } const h = Wd.groundH(x + 0.5, y + 0.5); lo = Math.min(lo, h); hi = Math.max(hi, h); }
      const sc = (hi - lo) * 40 + Math.hypot(cx - s.cx, cy - s.cy) * 0.15; if (ok && sc < bs) { bs = sc; best = [cx + 0.5, cy + 0.5]; } }
    if (!best || !body) return { err: 'sem chão aberto ou sem corpo' };
    const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    body.x = best[0]; body.y = best[1] + 3; body.tx = body.x; body.ty = body.y;
    G.Modes.enter(body); until(() => G.Modes.state === 'INC', 300); for (let k = 0; k < 6; k++) G.Main.frameFor(33); S.time = env.HOUR / 24;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    G.Cam3D.OPT.follow = false;
    // the cast: each one put at a spot of the row, facing the eye (south, +y), in the act of the case
    const used = new Set([body.id]); const pick = f => { const o = pool.find(x => !used.has(x.id) && f(x)); if (o) used.add(o.id); return o; };
    const kids = pool.filter(o => o.age >= 3 && o.age < 13);
    const ballKid = pick(o => o.age >= 5 && o.age < 12 && G.hash(((o.home || o.id) | 0) * 13 + 5) < 0.5) || pick(o => o.age >= 5 && o.age < 12);
    const small = pick(o => o.age >= 2 && o.age < 5) || pick(o => o.age < 8);
    const cast = [
      ['bebe', pick(o => o.age >= 20 && o.age < 50), o => { o.act = 'drink'; o.actT = 0.95; }],
      ['amarrado', pick(o => o.age >= 20 && o.age < 50), o => { o.act = 'bound'; o.actT = 0; }],
      ['bola', ballKid, o => { G.Vg.setTask(o, { type: 'play', st: 1, pri: 0.1, kind: 'play' }); o.act = ''; o.moving = false; o.path = null; }],
      ['muleta', pick(o => o.age >= 25 && o.age < 55 && !(o.lost && (o.lost.armL || o.lost.armR))), o => { o.lost = { leg: 1 }; o.act = ''; }],
      ['crianca', small, o => { o.act = ''; }],
      ['grande', pick(o => o.age >= 25 && o.age < 50 && o.g === 'm'), o => { o.act = ''; }],
    ];
    G.inSim++; try {
      cast.forEach(([n, o, f], i) => { if (!o) return; G.Vg.endTask(o); o.sleeping = false; o.inside = 0; o.held = false; o.hunger = 5; o.energy = 100; o.x = best[0] - 2.5 + i * 1.0; o.y = best[1]; o.tx = o.x; o.ty = o.y; o.path = null; o.moving = false; o.fx = 0.25; o.fy = 1; f(o); }); // (facing the eye: south, a little to the side)
    } finally { G.inSim--; }
    G.Modes.menu(true); // (the world stopped: the acts and the gestures' clocks stay where the proof put them; the drawing goes on)
    for (let k = 0; k < 40; k++) G.Main.frameFor(33);
    const TL = G.Space.TILE; window.__show = { X0: best[0] * TL, Z0: best[1] * TL, Y: Wd.groundH(best[0], best[1]) * G.Space.HM };
    return { spot: best, cast: cast.map(([n, o]) => o ? `${n}: ${o.name}#${o.id} (${Math.floor(o.age)} anos)${G.Inv ? ' ' + JSON.stringify(Object.fromEntries(Object.entries(G.Inv.held(o)).filter(([k, x]) => typeof x === 'string'))) : ''}` : `${n}: ninguém`) };
  }, { Q: process.env.Q || 'media', W, HOUR: +process.env.HOUR || 10.5 });
  console.log(JSON.stringify(info)); if (info.err) { await browser.close(); console.log('FALHOU: ' + info.err); process.exit(1); }
  const shots = [['frente', 0, 5.2, 1.4, 0], ['perto-esq', -0.15, 2.6, 1.1, -1.5], ['perto-dir', 0.15, 2.6, 1.1, 1.2]];
  for (const [name, side, D, up, dx] of shots) {
    await page.evaluate(o => {
      for (let k = 0; k < 4; k++) G.Main.frameFor(33);
      const sh = window.__show; const TL = G.Space.TILE; const cx = sh.X0 + o.dx * TL; const cam = G.Realm.camera(); cam.position.set(cx + Math.sin(o.side) * o.D, sh.Y + o.up, sh.Z0 + Math.cos(o.side) * o.D); cam.lookAt(cx, sh.Y + 0.8, sh.Z0); cam.fov = 45; cam.updateProjectionMatrix();
      G.Realm.renderer().render(G.Realm.scene(), cam);
    }, { side, D, up, dx });
    const f = path.join(OUT, `coisas-${name}.png`); await page.screenshot({ path: f, timeout: 240000 }); console.log(`foto ${f}`);
  }
  const me = await page.evaluate(() => JSON.stringify(G.modErr || {}));
  await browser.close();
  const bad = errs.slice(); if (me !== '{}') bad.push('erros de módulo: ' + me);
  console.log(bad.length ? 'FALHOU:\n' + bad.slice(0, 10).join('\n') : 'PASSOU | coisas-fotos | as fotos tiradas, nenhum erro nem aviso');
  process.exit(bad.length ? 1 : 0);
})();
