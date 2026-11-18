// rostos-fotos: the people's faces and bodies in the game's own 3D (22a — D-553 to D-556), on the metropolis made ready, each one
// drawn in the body's place (only their look: the drawing reads it) with a studio camera — no world changed, nothing saved:
//   cinco     the sheet of five faces: two peoples and more, young and old, a woman and a man, near (0,85 m) and a few steps off
//   fila      the line-up by age (a baby to an old one), by sex, by people, by body (fat, thin, strong, pregnant, a lost arm)
//   anos      the same person at 5, 15, 25, 45 and 70 — and a measure: the faces of one person over the years nearer each other
//             than the faces of different people of one age (the crops of the face compared, pixel by pixel)
//   familia   a family's portrait: the parents and three children
//   humor     one face in its moods (the face's channels, D-556): calm, joy, grief, anger, fear, speech, a blink
//   custo     what the people cost: the frame with 30, 60 and 90 bodies drawn whole (calls, triangles, milliseconds)
//   vista     what stands between the studio's camera and the person (each thing of the scene hidden in turn)
//   bash qa/navegador.sh node qa/visual/rostos-fotos.js PASTA [Q=media|alta] [ONLY=cinco,custo]
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..'); const OUT = process.argv[2] || '/tmp/rostos'; fs.mkdirSync(OUT, { recursive: true });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
const log = m => { console.log(m); fs.appendFileSync(path.join(OUT, 'rostos.txt'), m + '\n'); };
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL|GPU stall/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 180000 });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
  const t0 = Date.now();
  const who = await page.evaluate(Q => {
    const f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); }; const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
    window.__f = f;
    G.Realm.setQuality(Q); G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
    const S = G.S; const all = [...S.villagers.values()].sort((a, b) => a.id - b.id);
    const body = all.find(o => o.age >= 18 && o.age < 50 && !o.inside && G.Possess.can(o).ok);
    G.Modes.enter(body); until(() => G.Modes.state === 'INC', 300); f(8);
    S.time = 0.42; G.Avatar.state().yaw = 0.3; f(20);
    document.querySelectorAll('#inc-hud, #hud, #inc-label, #inc-root').forEach(e => e.style.visibility = 'hidden');
    // (a studio, L-1676: the body stands in the metropolis's crowd — whoever stood by the camera, and the mark of the body's target
    // (G.Mira3D: the glow round the one its hands would act on), came between the lens and the person as a pale pane: the
    // body's mark off and nobody else drawn; the cost puts the crowd back)
    if (G.Mira3D) G.Mira3D.on = false; G.Realm.setOver('npcs', 0); f(4);
    // (the studio: a person's look drawn in the body's place, the camera before the face; a pose's face from the channels)
    window.__shot = (v, o) => {
      const P3 = G.People3D, av = P3.avatar; const L = P3.look(v); if (o.mood) L.mood = o.mood; av.look = L; av.drive = null;
      for (let k = 0; k < 12; k++) { P3.update(k < 6 ? 0.6 : 0.05, { X: av.X, Z: av.Z }); }
      if (o.face && av.pose) { const fc = G.Rosto.fresh(); for (const k in o.face) fc[G.Rosto.IDX[k]] = o.face[k]; av.pose.face = fc; P3.update(0.001, { X: av.X, Z: av.Z }); }
      const cam = G.Realm.camera(); const a = av.yaw + (o.turn || 0); const h = av.Y + o.hy * L.s;
      cam.position.set(av.X + Math.cos(a) * o.d, h, av.Z + Math.sin(a) * o.d); cam.lookAt(av.X, h, av.Z); cam.fov = o.fov; cam.updateProjectionMatrix();
      const R = G.Realm.renderer(); R.render(G.Realm.scene(), cam);
      if (av.pose) av.pose.face = null;
      const u = L.out || {}; const fe = L.fe;
      return { s: +L.s.toFixed(3), hair: u.hairM, beard: u.beard, hat: u.hatM, skin: L.skin, hairC: L.hair, iris: u.iris, broken: G.Body3D.broken(R), shape: fe ? Object.fromEntries(G.Feicao.ALVOS.filter(T => Math.abs(fe.w[T.i]) > 0.25).map(T => [T.name, +fe.w[T.i].toFixed(2)])) : null };
    };
    return { body: body.name, morph: G.Body3D.MORPH, v: G.BODYMESH.v, n: S.villagers.size };
  }, process.env.Q || 'alta');
  log('mundo: ' + JSON.stringify(who));
  const FACE = { x: 300, y: 70, width: 300, height: 340 }, MID = { x: 330, y: 20, width: 240, height: 560 };
  const shoot = async (name, sel, o, clip) => {
    const info = await page.evaluate(([sel, o]) => { const v = typeof sel === 'number' ? G.S.villagers.get(sel) : window[sel]; return v ? window.__shot(v, o) : null; }, [sel, o]);
    if (!info) { log(name + ': ninguém'); return null; }
    await page.screenshot({ path: path.join(OUT, name + '.png'), clip, timeout: 240000 });
    log(name + ' ' + JSON.stringify(info) + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'); return info;
  };
  const near = { d: 0.85, fov: 26, hy: 1.6 }, mid = { d: 3.4, fov: 40, hy: 0.95 };
  // a person of the metropolis that answers a question (the first by id: always the same)
  const find = q => page.evaluate(q => { const all = [...G.S.villagers.values()].sort((a, b) => a.id - b.id); const fn = new Function('o', 'return ' + q); const v = all.find(o => { try { return fn(o); } catch (e) { return false; } }); return v ? v.id : null; }, q);
  // (what stands between the studio's camera and the person: each thing of the scene hidden in turn, the part of the frame where
  // the person is drawn compared — the thing whose hiding changes it most is in the way, or is the person)
  if (want('vista')) {
    const id = await find("o.civ === 'nordico' && o.g === 'm' && o.age >= 19 && o.age < 30");
    const r = await page.evaluate(([id, o]) => {
      const v = G.S.villagers.get(id); window.__shot(v, o);
      const R = G.Realm.renderer(), sc = G.Realm.scene(), cam = G.Realm.camera(), W = 180, H = 120, rt = new THREE.WebGLRenderTarget(W, H);
      const read = () => { R.setRenderTarget(rt); R.render(sc, cam); const px = new Uint8Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, px); R.setRenderTarget(null); return px; };
      const diff = (a, b) => { let s = 0, n = 0; for (let y = Math.floor(H * 0.1); y < H * 0.9; y++) for (let x = Math.floor(W * 0.5); x < W * 0.64; x++) { const i = (y * W + x) * 4; s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); n++; } return s / n; };
      const base = read(), out = [];
      const walk = (obj, depth, pre) => { for (const ch of obj.children) { if (!ch.visible) continue; ch.visible = false; const d = diff(base, read()); ch.visible = true;
        const m = ch.material, nm = pre + (ch.name || ch.type) + (m ? ' [' + (m.type || '') + (m.transparent ? ' transp' : '') + (m.opacity < 1 ? ' a' + m.opacity.toFixed(2) : '') + ']' : '') + (ch.userData && ch.userData.kind ? ' ' + ch.userData.kind : '');
        out.push([+d.toFixed(1), nm, ch.children.length]); if (d > 3 && depth < 3 && ch.children.length) walk(ch, depth + 1, nm + ' > '); } };
      walk(sc, 0, ''); rt.dispose();
      const P3 = G.People3D, av = P3.avatar; return { cam: [cam.position.x, cam.position.y, cam.position.z].map(x => +x.toFixed(2)), body: [av.X, av.Y, av.Z].map(x => +x.toFixed(2)), top: out.sort((a, b) => b[0] - a[0]).slice(0, 14) };
    }, [id, mid]);
    log('vista ' + JSON.stringify(r));
    const pane = r.top.filter(t => t[0] > 5 && /transp/.test(t[1]));
    log((pane.length ? 'FALHOU' : 'PASSOU') + ' | rostos-fotos vista: nada transparente entre a câmera do estúdio e a pessoa | ' + (pane.length ? pane.map(t => t[1] + ' ' + t[0]).join(' · ') : 'limpo'));
    await shoot('vista-meio', id, mid, MID);
  }
  if (want('cinco')) {
    for (const [n, q] of [['1-nordico-jovem', "o.civ === 'nordico' && o.g === 'm' && o.age >= 19 && o.age < 30"], ['2-egipcia-adulta', "o.civ === 'egipcio' && o.g === 'f' && o.age >= 26 && o.age < 40"],
      ['3-asteca-jovem', "o.civ === 'asteca' && o.g === 'm' && o.age >= 17 && o.age < 24"], ['4-grega-idosa', "o.civ === 'grego' && o.g === 'f' && o.age >= 58"], ['5-romano-idoso', "o.civ === 'romano' && o.g === 'm' && o.age >= 60"]]) {
      const id = await find(q); if (!id) { log(n + ': ninguém'); continue; }
      await shoot('cinco-perto-' + n, id, near, FACE); await shoot('cinco-meio-' + n, id, mid, MID);
    }
  }
  if (want('fila')) {
    for (const [n, q] of [['bebe', 'o.age < 2'], ['crianca', 'o.age >= 5 && o.age < 9'], ['menina', "o.g === 'f' && o.age >= 9 && o.age < 13"], ['adolescente', 'o.age >= 14 && o.age < 17'],
      ['adulto', "o.g === 'm' && o.age >= 25 && o.age < 40"], ['adulta', "o.g === 'f' && o.age >= 25 && o.age < 40"], ['idoso', "o.g === 'm' && o.age >= 66"], ['idosa', "o.g === 'f' && o.age >= 66"],
      ['gravida', 'o.preg > 0'], ['sem-braco', 'o.lost && (o.lost.armL || o.lost.armR)'], ['sem-perna', 'o.lost && o.lost.leg'], ['ferreiro', "o.role === 'ferreiro' && o.age >= 25"], ['crespo', "o.genoma && G.Feicao.of(o) && G.Feicao.of(o).tex === 3 && o.age >= 18"], ['gordo', "o.age >= 20 && G.Feicao.of(o) && G.Feicao.of(o).w[G.Feicao.IDX.gordo] > 0.5"], ['magro', "o.age >= 20 && G.Feicao.of(o) && G.Feicao.of(o).w[G.Feicao.IDX.magro] > 0.4"]]) {
      const id = await find(q); if (!id) { log('fila-' + n + ': ninguém'); continue; } await shoot('fila-' + n, id, mid, MID);
    }
  }
  if (want('anos')) {
    // (one person — their genome — drawn at five ages: the identity stays, the years go over it)
    // (bareheaded, so the grey and the hair that goes are seen; and a few steps off at 25, 45 and 70: the age read from there, D-637)
    const id = await find("o.age >= 25 && o.age < 45 && o.g === 'm' && !o.lost && !G.People3D.outfit(o).hatM");
    for (const a of [5, 15, 25, 45, 70]) { await page.evaluate(([id, a]) => { const v = G.S.villagers.get(id); window.__anos = Object.assign({}, v, { age: a, role: a < 16 ? 'crianca' : v.role }); }, [id, a]); await shoot('anos-' + a, '__anos', near, FACE);
      if (a >= 25) await shoot('anos-meio-' + a, '__anos', mid, MID); }
    // (and four other men of the people at 25 and at 45: what a face of one person over the years is measured against —
    // the crops compared after, by eye and by their correlation)
    const others = await page.evaluate(id => [...G.S.villagers.values()].sort((a, b) => a.id - b.id).filter(o => o.g === 'm' && o.age >= 20 && o.id !== id && !o.lost).slice(0, 4).map(o => o.id), id);
    for (const [k, oid] of others.entries()) for (const a of [25, 45]) { await page.evaluate(([oid, a]) => { const v = G.S.villagers.get(oid); window.__anos = Object.assign({}, v, { age: a }); }, [oid, a]); await shoot(`outro${k}-${a}`, '__anos', near, FACE); }
  }
  if (want('familia')) {
    const fam = await page.evaluate(() => { const S = G.S; for (const v of [...S.villagers.values()].sort((a, b) => a.id - b.id)) { if (v.g !== 'm' || !v.partner) continue; const m = S.villagers.get(v.partner); const kids = v.kids.map(k => S.villagers.get(k)).filter(k => k && k.mother === m.id); if (kids.length >= 3) return [v.id, m.id, ...kids.slice(0, 3).map(k => k.id)]; } return null; });
    if (fam) for (let k = 0; k < fam.length; k++) await shoot('familia-' + k, fam[k], mid, MID); else log('familia: nenhuma com três filhos');
  }
  if (want('humor')) {
    const id = await find("o.civ === 'asteca' && o.g === 'm' && o.age >= 17 && o.age < 26") || await find('o.age >= 18');
    for (const [n, face] of [['calma', { smile: 0.12 }], ['alegria', { smile: 1, squint: 0.6, jaw: 0.4 }], ['tristeza', { smile: -0.7, browSad: 1, gazeY: -0.2 }], ['raiva', { browIn: 1, press: 0.8, squint: 0.3 }], ['medo', { browUp: 1, wide: 1, jaw: 0.45, stretch: 0.6 }], ['fala', { jaw: 0.55, smile: 0.2 }], ['piscar', { blink: 1 }], ['nojo', { sneer: 1, browIn: 0.4 }]])
      await shoot('humor-' + n, id, Object.assign({ face }, near), FACE);
  }
  if (want('custo')) {
    for (const n of [30, 60, 90]) {
      const r = await page.evaluate(n => {
        G.Realm.setOver('npcs', n); G.S.time = 0.42; window.__f(10);
        const R = G.Realm.renderer(), sc = G.Realm.scene(), cam = G.Realm.camera(), P3 = G.People3D, av = P3.avatar, gl = R.getContext(), px = new Uint8Array(4);
        // (the eye over the crowd: up and behind the body, down the street — the ones the quality draws are in view; the frame
        // timed to the end of the drawing, the picture read back)
        const look = () => { cam.position.set(av.X - 16, av.Y + 10, av.Z - 16); cam.lookAt(av.X + 8, av.Y, av.Z + 8); cam.fov = 60; cam.updateProjectionMatrix(); };
        look(); for (let k = 0; k < 4; k++) P3.update(0.05, { X: av.X, Z: av.Z }); look();
        const info = () => ({ calls: R.info.render.calls, tris: R.info.render.triangles });
        const time = () => { R.render(sc, cam); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t = performance.now(); for (let k = 0; k < 5; k++) R.render(sc, cam); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return (performance.now() - t) / 5; };
        const ms = time(); const a = info(); const drawn = P3.count;
        const keep = P3.update; P3.clear(); P3.update = () => { }; const ms0 = time(); const b = info(); P3.update = keep; window.__f(2);
        return { n, drawn, b3calls: G.Body3D.calls, b3tris: G.Body3D.tris, people: { calls: a.calls - b.calls, tris: a.tris - b.tris, ms: +(ms - ms0).toFixed(1) }, frameMs: +ms.toFixed(1) };
      }, n);
      log('custo ' + JSON.stringify(r));
    }
  }
  const mod = await page.evaluate(() => Object.keys(G.modErr || {}));
  log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum') + ' · erros de módulo: ' + (mod.join(', ') || 'nenhum'));
  await browser.close();
  process.exit(errs.length || mod.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
