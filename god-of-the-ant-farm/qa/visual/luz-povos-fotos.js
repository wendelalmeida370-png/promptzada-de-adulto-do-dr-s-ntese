// luz-povos-fotos: a luz de cada povo, de noite, dentro de uma casa de cada povo (os interiores 3, a frente L — D-1012, D-1013), pelo
// desenho do próprio jogo, para o dono ver o antes e o depois: a lucerna de barro do romano, o lychnos do grego, a lamparina de barro
// com sal do egípcio, a tocha de ocote do asteca (sem lamparina), a lamparina de pedra-sabão do nórdico — e, com o mundo novo das
// tribos sem nome (CLASSICO=1, a semente SEED, 4242), a lamparina de pedra de pé alto da aurora das cidades. No Modo Encarnado, com o mundo parado
// (G.Modes.menu), o corpo de alguém do povo dentro da casa (alguém acordado no escuro: a luz acesa), o olho num canto do cômodo da mesa
// olhando a mesa. A mão da prova só põe a cena (o corpo, a hora) numa cópia do mundo que não se salva. Com CASA=parede, a casa sem mesa de
// cada povo onde a luz fica na parede (o banco de comer do romano, do grego, do nórdico; a cabana redonda, na face do anel: L-2254), o olho
// no ponto do cômodo mais longe dela, olhando a luz.
//   bash qa/navegador.sh node qa/visual/luz-povos-fotos.js PASTA [PASTA_DO_JOGO]     env: WORLD (metropole), Q (media), HOUR (21.5), TAG, CASA,
//   CASOS (a linha «CASOS …» que outra rodada imprimiu: as mesmas casas e o mesmo olho — o «antes» de uma luz que não havia)
// A pasta do jogo dá o «antes» (uma cópia do jogo de antes: as mesmas casas, a luz de antes). FALHA: um erro de página, um aviso ou um
// erro no console, um erro de módulo
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const OUT = path.resolve(process.argv[2] || '.'); fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve(process.argv[3] || path.join(__dirname, '..', '..'));
const TAG = process.env.TAG || (/^(base|antes)$/.test(path.basename(path.dirname(ROOT))) ? 'antes' : 'depois');
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  // (the packs of the models of the insides all in before the world opens — the photo of an inside taken in the turn the world opens
  // sees the boxes, T-2164; a copy of the game of before has no packs: nothing to wait for)
  await page.waitForFunction(() => !(window.G && G.Movel3D && G.Movel3D.wantAll) || G.Movel3D.wantAll(), null, { polling: 200, timeout: 120000 });
  const W = process.env.WORLD || 'metropole'; const CL = !!process.env.CLASSICO;
  if (!CL) await page.addScriptTag({ path: path.join(ROOT, 'worlds', W + '.js') });
  const info = await page.evaluate(env => {
    G.Realm.setQuality(env.Q);
    if (env.CL) G.Main.newGame({ type: 'ilha', size: 64, tribes: 2, temper: 'normal', clima: 'variado', classic: 1, seed: env.SEED }); else G.Save.apply(JSON.parse(G.Ready.data[env.W]));
    G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    if (env.CL) for (let k = 0; k < 900; k++) G.debug.step(0.1); // (the new world's first houses up)
    const S = G.S, In = G.Interiors, Sp = G.Space, TL = Sp.TILE; const CORE = ['mesa-casa', 'mesa', 'mesa-baixa', 'esteira-comer', 'mesa-terreiro', 'bancada'];
    const civOf = b => b.style || ((G.Fac.ofSet(b.set) || {}).civ) || 'classico';
    // (a household of each people: a plan with a table the family eats at; one body for all — someone awake inside: the light lit —, taken
    // from house to house)
    const cases = []; const want = env.CL ? ['classico'] : ['romano', 'grego', 'egipcio', 'asteca', 'nordico'];
    // (the light on a wall of a house with no table: where the decoration puts it, whatever the hour — lit or not, the same place)
    const LIGHT = ['suporte', 'lamparina', 'lamparina-pires', 'lamparina-pedra', 'lamparina-pe', 'vela', 'ocote', 'lanterna'];
    const onWall = (b, p) => { if (p.items.some(it => CORE.includes(it.kind)) || !G.Dentro3D) return null; const t = G.Dentro3D.plan(b, p, true).list.find(q => q.on === 'parede' && LIGHT.includes(q.k) && q.k !== 'suporte' && q.k !== 'lanterna'); return t || null; };
    const body = [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.aboard && !o.jail && !o.captive && !o.inside && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0];
    // (the cases of another run — CASOS, the line that run prints —: the same houses and the same eye, the «before» of a light that had none)
    if (env.CASOS) for (const c of JSON.parse(env.CASOS)) { const b = S.buildings.get(c.id); const p = b && Sp.planNow(b); if (!p || !p.ok) continue; const t = c.luz || p.items.find(it => it.id === c.t); if (t) cases.push({ civ: c.civ, b, p, t }); }
    if (!env.CASOS) for (const civ of want) {
      const hs = [...S.buildings.values()].filter(b => b.built && G.BDEF[b.type] && G.BDEF[b.type].housing && In.has(b) && civOf(b) === civ).sort((a, c) => a.id - c.id);
      for (const b of hs) { const p = Sp.planNow(b); if (!p || !p.ok) continue;
        if (env.CASA === 'parede') { const w = onWall(b, p); if (!w) continue; cases.push({ civ, b, p, t: { id: 'luz', lv: w.lv, x: w.x, z: w.z, y: w.y, kind: w.k, round: p.shell && p.shell.kind === 'round' } }); break; }
        const t = p.items.find(it => CORE.includes(it.kind) && it.lv === (p.entryLv || 0)); if (!t) continue; cases.push({ civ, b, p, t }); break; }
    }
    if (!body) return { err: 'ninguém para o corpo' };
    G.Modes.enter(body); for (let k = 0; k < 300 && G.Modes.state !== 'INC'; k++) G.Main.frameFor(33); G.Modes.menu(true); G.Cam3D.OPT.follow = false;
    document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
    window.__body = body.id;
    window.__cases = cases.map(c => ({ civ: c.civ, id: c.b.id, t: c.t.id, luz: c.t.id === 'luz' ? c.t : null }));
    return { body: body.id, cases: cases.map(c => `${c.civ}: ${c.b.type}#${c.b.id} (${c.t.id === 'luz' ? `a luz na parede: ${c.t.kind}${c.t.round ? ', a cabana redonda' : ''}` : 'a mesa ' + c.t.kind})`) };
  }, { Q: process.env.Q || 'media', W, CL, SEED: +process.env.SEED || 4242, CASA: process.env.CASA || 'mesa', CASOS: process.env.CASOS || '' });
  console.log(JSON.stringify(info));
  console.log('CASOS ' + JSON.stringify(await page.evaluate(() => window.__cases))); // (for the «before»: CASOS='…' the same houses and eye)
  const cases = await page.evaluate(() => window.__cases);
  for (const c of cases) {
    const r = await page.evaluate(o => {
      const S = G.S, In = G.Interiors, Sp = G.Space, TL = Sp.TILE; const b = S.buildings.get(o.id); const p = Sp.planNow(b); const t = o.luz || p.items.find(it => it.id === o.t); const body = S.villagers.get(window.__body);
      // (the body in the room of the table, in its corner farthest from the table: the eye there; the hour of the night — for the light on a
      // wall, the point of its room's floor farthest from it, the eye looking at the light)
      const room = (o.luz ? p.rooms.find(m => m.lv === t.lv && t.x > m.r[0] - 0.3 && t.x < m.r[2] + 0.3 && t.z > m.r[1] - 0.3 && t.z < m.r[3] + 0.3) : p.rooms.find(m => m.id === t.room)) || p.rooms[0]; const r0 = room.r; const lv = t.lv; const l = p.levels.find(q => q.lv === lv);
      const corners = [[r0[0] + 0.45, r0[1] + 0.45], [r0[2] - 0.45, r0[1] + 0.45], [r0[2] - 0.45, r0[3] - 0.45], [r0[0] + 0.45, r0[3] - 0.45]].sort((a, c) => Math.hypot(c[0] - t.x, c[1] - t.z) - Math.hypot(a[0] - t.x, a[1] - t.z));
      const C = In.CELL; let eye = corners.find(q => In.cell(b, lv, q[0], q[1]) === C.FLOOR) || corners[0];
      if (o.luz) { let bd = -1; for (let z = r0[1] + 0.3; z <= r0[3] - 0.3; z += 0.25) for (let x = r0[0] + 0.3; x <= r0[2] - 0.3; x += 0.25) { if (In.cell(b, lv, x, z) !== C.FLOOR) continue; const d = Math.hypot(x - t.x, z - t.z); if (d > bd) { bd = d; eye = [x, z]; } } }
      G.inSim++; try { body.sleeping = false; body.inside = b.id; body.x = b.x + eye[0] / TL; body.y = b.y + eye[1] / TL; body.tx = body.x; body.ty = body.y; body.path = null; body.moving = false; } finally { G.inSim--; }
      G.Avatar.attach(body, 0); G.Cam3D.attach(G.Avatar.pos(), 0); S.time = o.hour / 24; if (G.Atmos.flush) G.Atmos.flush();
      for (let k = 0; k < 160; k++) G.Main.frameFor(33); // (the inside opened, its things drawn, its light baked a piece at a time)
      const X0 = b.x * TL, Z0 = b.y * TL, Y0 = Sp.plinth(b).y0 + (l ? l.y : 0); const cam = G.Realm.camera();
      cam.position.set(X0 + eye[0], Y0 + 1.55, Z0 + eye[1]); cam.lookAt(X0 + t.x, o.luz ? Sp.plinth(b).y0 + t.y + 0.1 : Y0 + 0.7, Z0 + t.z); cam.fov = 62; cam.updateProjectionMatrix();
      G.Realm.renderer().render(G.Realm.scene(), cam);
      const W2 = G.Atmos.within(b); const D3 = G.Dentro3D ? G.Dentro3D.plan(b, p, true) : null;
      return { civ: o.civ, luz: W2.luz ? (W2.luz.why || '').slice(0, 160) : 'nenhuma', coisas: D3 ? D3.list.filter(q => /lamp|vela|ocote|brase|lantern|suporte/.test(q.k)).map(q => q.k + (q.lit ? '*' : '')).join(' ') : '', fontes: D3 ? D3.fontes.length : 0 };
    }, Object.assign({ hour: +process.env.HOUR || 21.5 }, c));
    console.log(JSON.stringify(r));
    const f = path.join(OUT, `luz-${c.civ}${process.env.CASA === 'parede' ? '-parede' : ''}-${TAG}.png`); await page.screenshot({ path: f, timeout: 480000 }); console.log(`foto ${f}`);
  }
  const me = await page.evaluate(() => JSON.stringify(G.modErr || {}));
  await browser.close();
  const bad = errs.slice(); if (me !== '{}') bad.push('erros de módulo: ' + me);
  console.log(bad.length ? 'FALHOU:\n' + bad.slice(0, 10).join('\n') : 'PASSOU | luz-povos-fotos | as fotos tiradas, nenhum erro nem aviso');
  process.exit(bad.length ? 1 : 0);
})();
