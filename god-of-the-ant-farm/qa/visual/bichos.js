// bichos: the animals as one skin each (D-265, js/fauna3d.js + js/fauna-anim.js + js/faunamesh.js), provoked on purpose, in
// the browser with real frames: every kind of the land, the water's edge and the air around the body of the god — standing,
// walking, trotting, galloping, the birds afoot and in the air, the young, the rare coats —, a save and a load in the middle,
// and the verifier every few frames.
//   node qa/visual/bichos.js [PASTA_DO_JOGO]       (≈ 1 min)   env: WORLD (cidade), Q (media), FRAMES (90)
// Fails when: Fauna3D does not start (or falls back to the pieces); a kind lacks its mesh, its flight, its coat (F3.dataErr);
// a kind near the body is never drawn as a skin; a matrix or a coat is not a number, a beast's hips are far from where the
// world has it, a row is drawn twice (People3D.check / Fauna3D.check); a page error, a console warning, a module error.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); // (a relative folder — '.' — made a bad file:// URL)
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  const WORLD = process.env.WORLD || 'cidade';
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const r = await page.evaluate(env => {
    const out = { fails: [], notes: [] }; const fail = m => out.fails.push(m);
    G.Realm.setQuality(env.Q); G.Save.apply(JSON.parse(G.Ready.data[env.WORLD])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const S = G.S, A = G.Animals, F3 = G.Fauna3D, P3 = G.People3D;
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
    const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); f(4);
    if (!F3 || !F3.ready) { fail('o Fauna3D não começou: ' + (F3 ? F3.failed : 'sem o módulo')); return out; }
    for (const e of F3.dataErr) fail('dados: ' + e);
    // every kind of the land, the water's edge and the air, in a ring round the body; each held on a circle of its own at its own
    // speed (standing, a walk, a trot, a gallop), the birds of the air half afoot, half flying; a young one and a rare coat too
    for (const a of [...S.animals.values()]) A.remove(a);
    const kinds = Object.keys(A.DEF).filter(k => A.DEF[k].cls !== 'water');
    const B = G.Avatar.state(); const cx = B.X / G.Space.TILE, cy = B.Z / G.Space.TILE; const live = [];
    kinds.forEach((kind, k) => {
      const ang = k / kinds.length * Math.PI * 2, r = 2.2 + (k % 3) * 0.9; let x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      const p = G.W.nearestLand(x, y, 6); if (p) { x = p[0]; y = p[1]; }
      const sp = A.DEF[kind]; const fly = sp.cls === 'air' && k % 2 === 0;
      const a = A.spawn(kind, x, y, { z: fly ? 12 : 0, age: k % 11 === 3 ? 0.4 : sp.life * 0.5, morph: k % 13 === 5 && sp.cls === 'land' ? 'albino' : null });
      live.push({ a, x, y, ang, sp: [0, 0.35, 1.1, 2.6][k % 4], fly });
    });
    const drawn = new Set(); let frames = 0; const t0 = performance.now();
    const hold = dt => { for (const L of live) { const a = L.a; if (!S.animals.has(a.id)) continue; L.ang += dt * L.sp / 1.2; a.x = L.x + Math.cos(L.ang) * (L.sp ? 0.6 : 0); a.y = L.y + Math.sin(L.ang) * (L.sp ? 0.6 : 0); a.tx = a.x; a.ty = a.y; a.state = L.fly ? 'fly' : 'idle'; a.t = 1e6; a.z = L.fly ? 12 : 0; a.hunger = 0; a.target = 0; a.angry = 0; a.flee = 0; } };
    const look = () => {
      for (const m of F3.meshes()) if (m.n > 0) drawn.add(m.name.replace(/_1$/, '').replace(/_voo$/, ''));
      for (const e of P3.check()) fail('verificador: ' + e);
    };
    // (the camera turns round the body, a full turn every 36 frames: every beast of the ring comes into the eye's field)
    const run = n => { for (let k = 0; k < n; k++) { hold(0.033); G.Cam3D.yaw = (G.Cam3D.yaw || 0) + Math.PI * 2 / 36; G.Main.frameFor(33); frames++; if (k % 3 === 0) look(); } };
    run(env.FRAMES);
    // a save and a load in the middle: the beasts come back as they were, and are drawn as one skin again
    const data = G.Save.serialize(); G.UI.select(null); G.Save.apply(JSON.parse(data));
    for (const L of live) { const a = S.animals.get(L.a.id); if (a) L.a = a; }
    if (G.Modes.state !== 'INC') { G.Modes.enter(S.villagers.get(v.id)); until(() => G.Modes.state === 'INC', 300); }
    run(Math.round(env.FRAMES / 2));
    for (const L of live) { const kind = L.a.kind; if (!S.animals.has(L.a.id) || L.a.dead) { out.notes.push(`(${kind} saiu do mundo durante a prova)`); continue; } const mesh = F3.meshOf(kind); if (!drawn.has(mesh)) fail(`bicho ${kind}: nunca desenhado como uma pele perto do corpo`); }
    if (!P3.beastSkins) fail('nenhum bicho desenhado como pele no último quadro');
    if (G.modErr && Object.keys(G.modErr).length) fail('erro de módulo: ' + JSON.stringify(G.modErr));
    out.notes.push(`${kinds.length} espécies, ${frames} quadros (${((performance.now() - t0) / frames).toFixed(0)} ms cada), ${drawn.size} malhas vistas, ${F3.calls} chamadas e ${F3.tris} triângulos de bichos no último`);
    return out;
  }, { Q: process.env.Q || 'media', WORLD, FRAMES: +process.env.FRAMES || 90 });
  await browser.close();
  for (const n of r.notes) console.log(n);
  const fails = r.fails.concat(errs.map(e => 'página: ' + e));
  if (fails.length) { console.log([...new Set(fails)].slice(0, 30).join('\n')); console.log(`FALHOU: ${fails.length}`); process.exit(1); }
  console.log('PASSOU');
})();
