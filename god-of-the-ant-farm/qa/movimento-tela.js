// movimento-tela: o movimento do corpo no navegador (20b, D-355 a D-369) — as teclas, o mouse, o controle de jogo, o toque, os
// painéis e a câmera pelo jogo de verdade (o 3D desenhado, a qualidade leve, quadros dirigidos à mão):
//   bash qa/navegador.sh node qa/movimento-tela.js PASTA        (as fotos vão para PASTA; ONLY=t1,t5 roda só essas)
//   t1 as teclas: W trota no mesmo quadro, Shift dispara, Caps Lock anda devagar, C agacha e levanta, Q esquiva
//   t2 a janela perde o foco com W segurado: nenhuma tecla fica presa, o corpo para
//   t3 um painel (a ficha, Tab) com W segurado: o corpo para enquanto ele está aberto e volta a andar quando fecha — sem apertar W de
//      novo; o painel pede o mouse de volta (Input3D.free / regain)
//   t4 os botões do mouse são ações: o do meio trava a mira na pessoa à frente (e solta), o esquerdo com o mouse livre não ataca
//   t5 o controle de jogo (a API Gamepad, um controle de mentira): o bastão esquerdo anda (a meio anda, todo trota), o direito vira
//      a câmera, A pula, B esquiva, Start abre o menu
//   t6 o toque: o bastão (a zona morta, a meio, todo, além do anel), os botões que aparecem conforme o momento (o de travar só com
//      alguém à frente), Esquivar esquiva, Agachar agacha
//   t7 a câmera junto das paredes: andando colado a uma casa e girando a câmera em volta, o olho nunca dentro de nada, e sai de
//      novo devagar (sem saltos para fora); a mira travada marcada na tela
//   t8 o corpo desenhado: o rumo e a altura do corpo que o 3D desenha (People3D.avatar) seguem o corpo sem saltos, a 144 quadros
//   t9 sem erro de página, aviso no console nem erro de módulo
//   t10 no celular (em pé, deitado, pequeno): os botões dos dedos acima da barra e dos cantos, longe do corpo, dentro da tela; só a
//      notícia mais nova (L-1246)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'movimento-tela'); fs.mkdirSync(OUT, { recursive: true });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 }, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  // (the browser's loop off — the frames are the proof's —, and a controller the proof can hold: navigator.getGamepads gives it)
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } window.__pad = null; const g0 = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : null; navigator.getGamepads = () => (window.__pad ? [window.__pad] : g0 ? g0() : []); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | movimento-tela ${name} | ${info}`); if (!cond) fails.push(name); };
  const shot = async name => { await page.evaluate(() => { G.Realm.setQuality('media'); for (let k = 0; k < 8; k++) G.Main.frameFor(33); }); try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000 }); } catch (e) { console.log('(foto ' + name + ' não saiu)'); }
    // (back to the light preset, and drawn in it: the verifier reads the beasts' levels against the edges of the preset of now — a
    // picture left at the photo's would be the wrong level for it, T-1388)
    await page.evaluate(() => { G.Realm.setQuality('baixa'); for (let k = 0; k < 2; k++) G.Main.frameFor(33); }); };
  const E = (fn, arg) => page.evaluate(fn, arg);
  await E(() => {
    const X = window.__X = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      key(k, down, o) { window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', Object.assign({ key: k, bubbles: true }, o || {}))); },
      body: () => G.Possess.body(), st: () => G.Avatar.state(),
      // (a fresh «cidade», by day, the body a grown-up of the biggest town on open ground, the camera toward open ground)
      fresh() { G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data.cidade)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        const S = G.S; const towns = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
        const ad = () => [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 50 && !o.inside && !o.sleeping && G.Possess.can(o).ok && (!o.carry || !o.carry.n));
        for (let t = 0; t < G.DAY_LEN * 20 && !ad().length; t++) G.debug.step(0.05);
        const v = ad().filter(o => o.set === towns[0].id)[0] || ad()[0];
        X.base = new Set(QA.check().filter(e => e.sev <= 3).map(e => e.id + '|' + e.msg));
        if (!G.Modes.enter(v)) return null; X.until(() => G.Modes.state === 'INC', 300); X.f(4);
        G.Cam3D.yaw = X.openYaw(v.x, v.y); X.f(4); return v.id; },
      openYaw(x, y) { const okA = a => { for (let r = 0.25; r <= 1.5; r += 0.25) if (!G.W.walkableXY(x + Math.cos(a) * r, y + Math.sin(a) * r)) return false; return true; }; let best = 0, bl = -1;
        for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; let l = 0; for (let r = 0.25; r <= 3; r += 0.25) { if (!G.W.walkableXY(x + Math.cos(a) * r, y + Math.sin(a) * r)) break; l = r; } if (l > bl) { bl = l; best = a; } } void okA; return best; },
      qa: () => QA.check().filter(e => e.sev <= 2 && !X.base.has(e.id + '|' + e.msg)).map(e => `${e.id}/S${e.sev}: ${e.msg}`),
      // (the stage: the longest straight way of open ground three tiles wide the world has — no tree, stone, building, water or road
      // —; reset puts the body at its start, at rest, the eye along it, the breath whole — as the Node proof's, T-1386)
      corridor() {
        if (X.cor !== undefined) return X.cor; const S = G.S, W = G.W, N = G.N;
        const okT = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return !(!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.type[i] <= G.T.RIVER || S.slope[i] > 1.0 || S.wall[i] || S.road[i]); };
        const wide = (x, y, dx, dy) => okT(x, y) && okT(x - dy, y + dx) && okT(x + dy, y - dx); let best = 0, at = null;
        for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { let n = 0; while (wide(x + dx * n, y + dy * n, dx, dy)) n++; if (n > best && G.W.reaches(X.body(), x + 0.5, y + 0.5)) { best = n; at = { x, y, dx, dy, n }; } }
        return (X.cor = at);
      },
      reset() { G.Input3D.release(); G.Cam3D.unlock(); X.f(4); const c = X.corridor(); if (c) { G.Avatar.place(c.x + 0.5, c.y + 0.5); X.f(20); G.Cam3D.yaw = Math.atan2(c.dy, c.dx); } else { const v = X.body(); X.f(20); G.Cam3D.yaw = X.openYaw(v.x, v.y); } G.Avatar.state().stamina = 100; X.f(4); },
    };
  });
  const id = await E(() => __X.fresh());
  if (!id) { ok('palco', false, 'ninguém para encarnar'); await browser.close(); process.exit(1); }

  // ================================ t1: as teclas ================================
  if (want('t1')) {
    const r = await E(() => {
      const st = __X.st(); __X.reset(); const P = G.Avatar.paces ? null : null; void P;
      // (W: the first frame after the press already moves; then the jog)
      __X.key('w', true); G.Main.frameFor(16.7, true); const first = st.speed; __X.f(30); const jog = st.speed;
      __X.key('Shift', true); __X.f(35); const sprint = st.speed; const gait = st.gait; __X.key('Shift', false); __X.key('w', false); __X.reset();
      // (Caps Lock: the walk kept to, by its light)
      // (every key the browser gives with the lock on says so — the W too: modifierCapsLock)
      __X.key('CapsLock', true, { modifierCapsLock: true }); __X.key('CapsLock', false, { modifierCapsLock: true }); __X.key('w', true, { modifierCapsLock: true }); __X.f(40); const walk = st.speed; const walkOn = G.Input3D.walk;
      __X.key('CapsLock', true, { modifierCapsLock: false }); __X.key('CapsLock', false, { modifierCapsLock: false }); __X.key('w', false); __X.reset();
      // (C: crouched; C again: up)
      __X.key('w', true); __X.key('c', true); __X.key('c', false); __X.f(30); const cr = st.crouch, crSp = st.speed; __X.key('c', true); __X.key('c', false); __X.f(6); const up = !st.crouch;
      // (Q: the dodge)
      __X.key('q', true); __X.key('q', false); let dg = false; for (let k = 0; k < 10; k++) { G.Main.frameFor(16.7, true); if (st.dodge) dg = true; }
      __X.key('w', false); __X.f(30); const P2 = G.Avatar.paces();
      return { first: +first.toFixed(2), jog: +jog.toFixed(2), sprint: +sprint.toFixed(2), gait, walk: +walk.toFixed(2), walkOn, cr, crSp: +crSp.toFixed(2), up, dg, paces: P2 && { walk: +P2.walk.toFixed(2), jog: +P2.jog.toFixed(2), sprint: +P2.sprint.toFixed(2) } };
    });
    ok('t1 W trota já no quadro do aperto, Shift dispara, Caps Lock anda devagar, C agacha e levanta, Q esquiva', r.first > 0.3 && r.jog > r.walk * 1.4 && r.sprint > r.jog * 1.3 && r.walkOn && r.cr && r.crSp < r.walk && r.up && r.dg, JSON.stringify(r));
  }
  // ================================ t2: o foco perdido ================================
  if (want('t2')) {
    const r = await E(() => { const st = __X.st(); __X.reset(); let ups = 0; G.Input3D.onUp('frente', () => { ups++; });
      __X.key('w', true); __X.f(20); const moving = st.speed; window.dispatchEvent(new Event('blur')); __X.f(30);
      return { moving: +moving.toFixed(2), held: !!G.Input3D.down.frente, after: +st.speed.toFixed(3), ups }; });
    ok('t2 a janela perde o foco com W segurado: a tecla é solta (e ouvida), o corpo para', r.moving > 1 && !r.held && r.after < 0.05 && r.ups === 1, JSON.stringify(r));
  }
  // ================================ t3: o painel ================================
  if (want('t3')) {
    const r = await E(() => { const st = __X.st(); __X.reset();
      __X.key('w', true); __X.f(20); const before = st.speed;
      __X.key('Tab', true); __X.key('Tab', false); __X.f(30); const panel = G.Modes.panel(), inPanel = st.speed, held = !!G.Input3D.down.frente;
      __X.key('Tab', true); __X.key('Tab', false); __X.f(30); const after = st.speed, closed = !G.Modes.panel();
      __X.key('w', false); __X.f(20);
      return { before: +before.toFixed(2), panel, inPanel: +inPanel.toFixed(3), held, closed, after: +after.toFixed(2) }; });
    ok('t3 a ficha aberta com W segurado: o corpo para; fechada, volta a andar sem apertar W de novo', r.before > 1 && r.panel && r.inPanel < 0.05 && r.held && r.closed && r.after > 1, JSON.stringify(r));
  }
  // ================================ t4: os botões do mouse ================================
  if (want('t4')) {
    const r = await E(() => { const st = __X.st(); __X.reset(); const v = __X.body(); const S = G.S;
      // (someone of the world four metres ahead of the eye, held still there)
      const o = [...S.villagers.values()].find(q => q !== v && q.age > 16 && !q.inside && !q.aboard && !q.held && G.Possess.can(q).ok);
      const yaw = G.Cam3D.yaw; G.Vg.endTask(o); o.x = v.x + Math.cos(yaw); o.y = v.y + Math.sin(yaw); o.path = null; o.downT = S.clock + 60; __X.f(10);
      const cv = G.Realm.canvas(); let atk = 0; G.Input3D.on('atacar', () => { atk++; });
      const md = (btn, t) => cv.dispatchEvent(new MouseEvent(t, { button: btn, bubbles: true, clientX: 500, clientY: 320 }));
      md(1, 'mousedown'); window.dispatchEvent(new MouseEvent('mouseup', { button: 1, bubbles: true })); __X.f(6); const locked = G.Cam3D.locked(); const on = !!locked; const who = locked && locked.id;
      __X.f(20); const strafe = st.strafe;
      md(1, 'mousedown'); window.dispatchEvent(new MouseEvent('mouseup', { button: 1, bubbles: true })); __X.f(4); const off = !G.Cam3D.locked();
      // (the left button with the mouse free: it asks for the mouse, it is no blow)
      md(0, 'mousedown'); window.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true })); __X.f(2);
      o.downT = 0; return { on, strafe, off, atk, alvo: who, posto: o.id }; });
    ok('t4 o botão do meio trava a mira na pessoa à frente e solta; o esquerdo com o mouse livre não ataca', r.on && r.off && r.atk === 0, JSON.stringify(r));
  }
  // ================================ t5: o controle de jogo ================================
  if (want('t5')) {
    const r = await E(() => { const st = __X.st(); __X.reset();
      const pad = window.__pad = { id: 'controle da prova', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })) };
      __X.f(4); pad.axes[1] = -0.55; __X.f(40); const half = st.speed; pad.axes[1] = -1; __X.f(40); const full = st.speed; pad.axes[1] = 0; __X.f(30);
      const y0 = G.Cam3D.yaw; pad.axes[2] = 1; __X.f(15); const turned = G.Cam3D.yaw - y0; pad.axes[2] = 0; __X.f(4);
      const press = (i, n) => { pad.buttons[i] = { pressed: true, touched: true, value: 1 }; __X.f(n || 1); pad.buttons[i] = { pressed: false, touched: false, value: 0 }; };
      press(0); const jumped = st.loco === 'air' || st.vy > 0; __X.f(40);
      pad.axes[1] = -1; __X.f(10); press(1); let dg = !!st.dodge; for (let k = 0; k < 6 && !dg; k++) { G.Main.frameFor(16.7, true); dg = !!st.dodge; } pad.axes[1] = 0; __X.f(40);
      press(9); __X.f(2); const menu = G.Modes.menuOpen(); press(9); __X.f(2); const shut = !G.Modes.menuOpen();
      const dev = G.Input3D.device, label = G.Input3D.label('interagir'); window.__pad = null; __X.f(4);
      const P = G.Avatar.paces(); return { half: +half.toFixed(2), full: +full.toFixed(2), walk: +P.walk.toFixed(2), jog: +P.jog.toFixed(2), turned: +turned.toFixed(2), jumped, dg, menu, shut, dev, label }; });
    ok('t5 o controle: a meio anda, todo trota, o bastão direito vira a câmera, A pula, B esquiva, Start abre e fecha o menu; a tela diz os botões dele', r.half < r.walk * 1.2 && r.full > r.jog * 0.85 && r.turned > 0.5 && r.jumped && r.dg && r.menu && r.shut && r.dev === 'pad' && r.label === 'X', JSON.stringify(r));
  }
  // ================================ t6: o toque ================================
  if (want('t6')) {
    const r = await E(() => { const st = __X.st(); __X.reset(); const cv = G.Realm.canvas();
      const T = (id, x, y, tg) => new Touch({ identifier: id, target: tg || cv, clientX: x, clientY: y });
      const thumb = (dy, n) => { __X.reset(); cv.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [T(1, 200, 450)], touches: [T(1, 200, 450)], cancelable: true, bubbles: true }));
        cv.dispatchEvent(new TouchEvent('touchmove', { changedTouches: [T(1, 200, 450 - dy)], touches: [T(1, 200, 450 - dy)], cancelable: true, bubbles: true }));
        let m = 0; for (let k = 0; k < n; k++) { G.Main.frameFor(33, true); if (k > n - 15) m = Math.max(m, st.speed); } const run = st.gait;
        cv.dispatchEvent(new TouchEvent('touchend', { changedTouches: [T(1, 200, 450 - dy)], touches: [], cancelable: true, bubbles: true })); __X.f(20); return [+m.toFixed(2), run]; };
      const dead = thumb(5, 30), half = thumb(30, 40), full = thumb(56, 40), past = thumb(85, 60);
      __X.reset(); __X.f(10); const shown = G.IncUI.touchButtons ? G.IncUI.touchButtons() : []; const cand = !!G.Modes.lockCandidate(true);
      const tap = a => { const b = document.querySelector(`#inc-hud .ih-tb button[data-k="${a}"]`); if (!b) return false; b.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [T(2, 900, 500, b)], touches: [T(2, 900, 500, b)], cancelable: true, bubbles: true })); b.dispatchEvent(new TouchEvent('touchend', { changedTouches: [T(2, 900, 500, b)], touches: [], cancelable: true, bubbles: true })); return true; };
      tap('agachar'); __X.f(4); const cr = st.crouch; tap('agachar'); __X.f(4); const up = !st.crouch;
      tap('esquivar'); let dg = false; for (let k = 0; k < 8; k++) { G.Main.frameFor(16.7, true); if (st.dodge) dg = true; } __X.f(30);
      const P = G.Avatar.paces(); const tb = document.querySelector('#inc-hud .ih-touch');
      return { dead, half, full, past, walk: +P.walk.toFixed(2), jog: +P.jog.toFixed(2), shown, cand, cr, up, dg, visible: !!tb && !tb.classList.contains('hidden') }; });
    ok('t6 o bastão do toque: parado na zona morta, a meio anda, todo trota, além do anel dispara', r.dead[0] < 0.1 && r.half[0] < r.walk * 1.1 && r.half[0] > 0.3 && r.full[0] > r.jog * 0.85 && r.past[1] === 'disparada', JSON.stringify({ dead: r.dead, half: r.half, full: r.full, past: r.past, walk: r.walk, jog: r.jog }));
    ok('t6 os botões do toque pelo registro, conforme o momento; Agachar agacha e levanta, Esquivar esquiva', r.visible && ['pular', 'interagir', 'correr', 'esquivar', 'agachar', 'menu'].every(a => r.shown.includes(a)) && r.shown.includes('travar') === r.cand && r.cr && r.up && r.dg, JSON.stringify({ shown: r.shown, alvo: r.cand, cr: r.cr, up: r.up, dg: r.dg }));
    await shot('t6-toque');
  }
  // ================================ t7: a câmera junto das paredes ================================
  if (want('t7')) {
    const r = await E(() => { const st = __X.st(); __X.reset(); const S = G.S, W = G.W;
      // (a house with open street along its west side: the body put there, the eye turned round it while the body walks along it)
      const B = [...S.buildings.values()].filter(b => b.built && !b.ruin && b.type === 'house').find(b => { for (let y = b.y; y < b.y + b.h; y++) if (!W.walkableXY(b.x - 0.5, y + 0.5) || !W.walkableXY(b.x - 1.5, y + 0.5)) return false; return G.W.reaches(__X.body(), b.x - 0.5, b.y + 0.5); });
      if (!B) return null;
      G.Avatar.place(B.x - 0.45, B.y + 0.3); __X.f(10); let camIn = 0, out = 0, inJ = 0, last = null, fr = 0;
      __X.key('s', true); // (walking along the wall, south)
      G.Cam3D.yaw = Math.PI / 2; // (the eye north of the body, looking south along the wall: then turned round to the wall's side)
      for (let k = 0; k < 150; k++) { G.Cam3D.yaw += 0.045; G.Main.frameFor(16.7, true); fr++; const c = G.Realm.camera().position; if (G.Cam3D.solid(c.x, c.y, c.z)) camIn++;
        const d = G.Cam3D.last && G.Cam3D.last.cur; if (last !== null) { const dd = d - last; if (dd > out) out = dd; if (-dd > inJ) inJ = -dd; } last = d; }
      __X.key('s', false); __X.f(10);
      // (a target held: the mark over it on the screen)
      const v = __X.body(); const o = [...S.villagers.values()].find(q => q !== v && q.age > 16 && !q.inside && !q.aboard && !q.held && G.Possess.can(q).ok); o.x = v.x + 1.2; o.y = v.y + 0.2; o.path = null; o.downT = S.clock + 60; __X.f(4);
      G.Cam3D.lockOn(o); __X.f(10); const mark = G.IncUI.lockAt; G.Cam3D.unlock(); o.downT = 0; __X.f(4);
      return { house: B.id, frames: fr, camIn, outMax: +out.toFixed(3), inMax: +inJ.toFixed(3), mark: !!mark }; });
    if (!r) ok('t7 a câmera junto das paredes', true, 'nenhuma casa com rua livre ao lado (nada a provar)');
    else ok('t7 a câmera junto da parede de uma casa: nunca dentro de nada, sai de novo devagar; a mira travada marcada na tela', !r.camIn && r.outMax < 0.06 && r.mark, JSON.stringify(r));
    await shot('t7-parede');
  }
  // ================================ t8: o corpo desenhado ================================
  if (want('t8')) {
    const r = await E(() => { const st = __X.st(); __X.reset(); let worstYaw = 0, worstY = 0, prev = null, n = 0;
      // (at 144 frames a second, walking about with the eye turned now and then: the body the 3D draws, frame to frame)
      __X.key('w', true);
      for (let k = 0; k < 432; k++) { if (k % 70 === 0) G.Cam3D.yaw += 2.4; if (k === 200) __X.key('Shift', true); if (k === 300) __X.key('Shift', false); G.Main.frameFor(1000 / 144, true);
        const a = G.People3D.avatar; if (!a) continue; n++; if (prev && Math.hypot(a.X - prev.X, a.Z - prev.Z) < 0.5) { let dy = a.yaw - prev.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2; worstYaw = Math.max(worstYaw, Math.abs(dy) * 144); worstY = Math.max(worstY, Math.abs(a.Y - prev.Y)); }
        prev = { X: a.X, Z: a.Z, Y: a.Y, yaw: a.yaw }; }
      __X.key('w', false); __X.f(20); return { frames: n, worstYaw: +worstYaw.toFixed(2), worstY: +worstY.toFixed(3) }; });
    ok('t8 o corpo que o 3D desenha gira e sobe sem saltos, a 144 quadros', r.frames > 400 && r.worstYaw < 19 && r.worstY < 0.06, JSON.stringify(r));
    await shot('t8-andando');
  }
  // ================================ t10: o toque num celular (L-1246) ================================
  // (the owner's phone: the fingers' buttons fell over the hotbar and the body, and two news took half the screen — upright, lying
  // and small, the buttons stand above the foot of the screen, clear of the body's middle, inside the screen, none on another; only
  // the newest news shows)
  if (want('t10')) {
    const out = {};
    for (const [nm, w, h] of [['em-pe', 390, 844], ['deitado', 844, 390], ['pequeno', 360, 740]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(300);
      out[nm] = await E(() => {
        for (let k = 0; k < 12; k++) G.Main.frameFor(33, true);
        const R = el => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
        const hit = (a, b) => a[0] < b[2] - 1 && b[0] < a[2] - 1 && a[1] < b[3] - 1 && b[1] < a[3] - 1;
        const W = innerWidth, H = innerHeight;
        const btns = [...document.querySelectorAll('#inc-hud .ih-tb button')].filter(b => !b.classList.contains('hidden') && !b.classList.contains('canto') && b.offsetParent !== null).map(b => [b.dataset.k, R(b)]);
        const feet = ['.ih-hotbar', '.ih-corner'].map(s => document.querySelector('#inc-hud ' + s)).filter(e => e && e.getBoundingClientRect().height > 0).map(R);
        const mid = [W * 0.4, H * 0.3, W * 0.6, H]; // (where the body stands, the camera behind it)
        const bad = [];
        for (const [k, r] of btns) {
          if (feet.some(f => hit(r, f))) bad.push(k + ' sobre a barra'); if (hit(r, mid)) bad.push(k + ' sobre o corpo');
          if (r[0] < 0 || r[1] < 0 || r[2] > W + 0.5 || r[3] > H + 0.5) bad.push(k + ' fora da tela');
          for (const [k2, r2] of btns) if (k2 < k && hit(r, r2)) bad.push(k + ' sobre ' + k2);
        }
        // (two news put in by the proof's hand, only the DOM: the newest shows)
        const box = document.querySelector('#inc-hud .ih-news'); const was = box.innerHTML; box.innerHTML = '<div>a primeira notícia</div><div>a segunda notícia</div>';
        const news = [...box.children].filter(d => getComputedStyle(d).display !== 'none').length; box.innerHTML = was;
        return { n: btns.length, feet: feet.length, news, bad };
      });
      await shot('t10-' + nm);
    }
    await page.setViewportSize({ width: 1000, height: 640 }); await page.waitForTimeout(300); await E(() => { for (let k = 0; k < 4; k++) G.Main.frameFor(33, true); });
    const bad = Object.entries(out).flatMap(([k, r]) => r.bad.map(b => k + ': ' + b));
    ok('t10 no celular (em pé, deitado, pequeno): os botões dos dedos acima da barra e dos cantos, longe do corpo, dentro da tela, nenhum sobre outro; só a notícia mais nova', !bad.length && Object.values(out).every(r => r.n >= 5 && r.feet >= 1 && r.news === 1), JSON.stringify(out));
  }
  // ================================ t9: os erros ================================
  { const q = await E(() => ({ qa: __X.qa(), err: JSON.stringify(G.modErr) }));
    ok('t9 sem erro de página, aviso no console nem erro de módulo; o verificador limpo', !errs.length && q.err === '{}' && !q.qa.length, `${errs.slice(0, 3).join(' | ') || 'sem erros'} · módulos ${q.err} · ${q.qa.slice(0, 2).join(' · ') || 'verificador limpo'}`); }
  await browser.close();
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU (movimento-tela)');
  process.exit(fails.length ? 1 : 0);
})();
