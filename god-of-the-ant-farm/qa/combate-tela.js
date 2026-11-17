// combate-tela: o combate do corpo no navegador (20f, D-410 a D-424) — as teclas, o mouse, o toque, a tela e o 3D de verdade (a
// qualidade leve, quadros dirigidos à mão; as fotos na média):
//   bash qa/navegador.sh node qa/combate-tela.js PASTA        (as fotos vão para PASTA; ONLY=t1,t5 roda só essas)
//   t1 do clique ao golpe: o clique esquerdo (atacar) começa o gesto no mesmo quadro; o golpe acerta quem está à frente no contato
//      do gesto (o tempo do corpo até lá, medido em quadros a 60 por segundo); o instante de peso no contato (o tempo do corpo
//      quase parado) e o olho que treme
//   t2 o golpe se vê chegar: o corpo desenhado (People3D.avatar) no preparo está longe da pose do contato — o ombro e o tronco —,
//      e o rastro da lâmina aparece em volta do contato; as fotos do preparo, do contato
//   t3 a tela: o anel do fôlego em volta da mira enquanto se luta, o anel da carga cresce segurando o clique, a marca da guarda com
//      o clique direito; a foto
//   t4 o toque: os botões Golpe e Defesa do registro aparecem no corpo; apertar e soltar Golpe golpeia, segurar Defesa guarda
//   t5 o arco: o clique direito mira (a câmera por cima do ombro), o esquerdo puxa e solta; a flecha desenhada no ar; a foto
//   t6 a mira travada e a troca de alvo: o botão do meio trava a pessoa à frente; um empurrão do mouse para o lado troca para a outra
//   t7 o duelo: o F na pessoa desafia; a linha do duelo na tela; a foto
//   t8 sem erro de página, aviso no console nem erro de módulo; o verificador limpo
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'combate-tela'); fs.mkdirSync(OUT, { recursive: true });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 }, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | combate-tela ${name} | ${info}`); if (!cond) fails.push(name); };
  const shot = async name => { await page.evaluate(() => { G.Realm.setQuality('media'); for (let k = 0; k < 4; k++) G.Main.frameFor(16.7, true); }); try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000 }); } catch (e) { console.log('(foto ' + name + ': ' + e.message.slice(0, 80) + ')'); }
    await page.evaluate(() => { G.Realm.setQuality('baixa'); G.Main.frameFor(16.7, true); }); };
  // (a picture at a moment of a gesture: the frames stopped there — the body's own time all but held, the camera on it)
  const E = (fn, arg) => page.evaluate(fn, arg);
  await E(() => {
    const X = window.__X = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 16.7, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 16.7, true); } return c() ? max : -1; },
      key(k, down) { window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: k, bubbles: true })); },
      body: () => G.Possess.body(), st: () => G.Avatar.state(),
      fresh() { G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data.cidade)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        const S = G.S; const towns = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
        const ad = () => [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 50 && !o.inside && !o.sleeping && G.Possess.can(o).ok && (!o.carry || !o.carry.n));
        for (let t = 0; t < G.DAY_LEN * 20 && !ad().length; t++) G.debug.step(0.05);
        const v = ad().filter(o => o.set === towns[0].id)[0] || ad()[0];
        X.base = new Set(QA.check().filter(e => e.sev <= 3).map(e => e.id + '|' + e.msg));
        if (!G.Modes.enter(v)) return null; X.until(() => G.Modes.state === 'INC', 300); X.f(4); return v.id; },
      qa: () => QA.check().filter(e => e.sev <= 2 && !X.base.has(e.id + '|' + e.msg)).map(e => `${e.id}/S${e.sev}: ${e.msg}`),
      // (the stage: open ground three tiles wide the body reaches; the body at its start, the eye along it, the breath whole)
      corridor() {
        if (X.cor !== undefined) return X.cor; const S = G.S, W = G.W, N = G.N;
        const okT = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return !(!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.type[i] <= G.T.RIVER || S.slope[i] > 1.0 || S.wall[i] || S.road[i]); };
        // (five tiles wide where the world has it — the blows sweep, the targets stand to the sides —, else three)
        for (const half of [2, 1]) {
          const wide = (x, y, dx, dy) => { for (let k = -half; k <= half; k++) if (!okT(x - dy * k, y + dx * k)) return false; return true; }; let best = 0, at = null;
          for (let y = 3; y < N - 3; y++) for (let x = 3; x < N - 3; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { let n = 0; while (n < 12 && wide(x + dx * n, y + dy * n, dx, dy)) n++; if (n > best && G.W.reaches(X.body(), x + 0.5, y + 0.5)) { best = n; at = { x, y, dx, dy, n }; } }
          if (at && at.n >= 5) return (X.cor = at);
        }
        return (X.cor = null);
      },
      reset() { G.Input3D.release(); G.Cam3D.unlock(); G.Cam3D.aim(false); X.f(4); const c = X.corridor(); if (c) { G.Avatar.place(c.x + 0.5 + c.dx * 2, c.y + 0.5 + c.dy * 2); X.f(20); G.Cam3D.yaw = Math.atan2(c.dy, c.dx); } else X.f(20); G.Cam3D.pitch = 0.22; G.Avatar.rest(); X.f(10); },
      // (someone of the world put before the body at d metres, side metres to its right, idle, facing it — the proof's hand)
      stand(o, d, side) { const p = G.Avatar.pos(); const L = G.Space.TILE; const y = p.yaw; const x = p.X / L + (Math.cos(y) * d - Math.sin(y) * (side || 0)) / L, z = p.Z / L + (Math.sin(y) * d + Math.cos(y) * (side || 0)) / L;
        G.Vg.endTask(o); o.inside = 0; o.x = x; o.y = z; o.path = null; o.hp = 100; o.downT = 0; o.stagT = 0; o.sleeping = false; G.faceTo(o, p.X / L - x, p.Z / L - z); return o; },
      other(not) { const me = X.body(); return [...G.S.villagers.values()].filter(o => o.id !== me.id && !not.includes(o.id) && o.age >= 18 && o.age < 55 && !o.captive && !o.jail && !o.aboard && o.role !== 'guerreiro' && !o.unit).sort((a, b) => a.id - b.id)[0]; },
      // (the body's own things, by the proof's hand: the bag emptied, these made and worn)
      arm(keys) { const v = X.body(); G.inSim++; try { for (const k of Object.keys(G.Inv.bag(v))) G.Depot.use('m:' + v.id, k, G.Inv.count(v, k), { code: 'prova' }); for (const [k, s, n] of keys) { G.Depot.make('m:' + v.id, k, n || 1, { code: 'prova' }); if (s) G.Inv.equip(v, k, s); } } finally { G.inSim--; } X.f(2); },
      mouse(b, down) { G.Input3D.hit('mouse' + b, down, null, down); },
    };
  });
  const id = await E(() => __X.fresh());
  if (!id) { ok('palco', false, 'ninguém para encarnar'); await browser.close(); process.exit(1); }

  // ================================ t1, t2: do clique ao golpe, o preparo ================================
  if (want('t1') || want('t2')) {
    await E(() => { __X.reset(); __X.arm([['espada.bronze', 'mao']]); const o = __X.other([]); __X.t1 = o.id; __X.stand(o, 1.0, 0); __X.f(2); });
    const r = await E(() => {
      const X = __X; const o = G.S.villagers.get(X.t1); const h0 = o.hp; const mv = G.Combate.move('espada', 0);
      X.mouse(0, true); const a0 = G.Avatar.actNow(); X.mouse(0, false);
      const out = { started: !!(a0 && a0.anim === mv.clip), frames: -1, ms: 0, stop: 0, shake: 0, wind: null, hit: null, trail: 0, uAt: 0 };
      for (let k = 0; k < 90; k++) {
        const a = G.Avatar.actNow(); const u = a ? a.t / a.dur : 1; const av = G.People3D.avatar;
        if (a && !out.wind && u >= mv.hit * 0.5) out.wind = { shRp: av.pose.shRp, twist: av.pose.twist, lean: av.pose.lean, u };
        G.Main.frameFor(16.7, true); out.trail = Math.max(out.trail, G.Combate3D ? G.Combate3D.trail : 0);
        if (o.hp < h0 && out.frames < 0) { out.frames = k + 1; out.ms = Math.round((k + 1) * 16.7); const b = G.Avatar.state(); out.stop = b.stopT || 0; out.shake = G.Cam3D.trauma(); out.uAt = a ? a.t / a.dur : 1; const p = G.People3D.avatar.pose; out.hit = { shRp: p.shRp, twist: p.twist, lean: p.lean }; }
        if (!G.Avatar.actNow() && out.frames >= 0) break;
      }
      out.dmg = Math.round((h0 - o.hp) * 100) / 100; out.contactMs = Math.round(mv.dur * mv.hit * 1000); return out;
    });
    const sw = r.wind && r.hit ? Math.abs(r.wind.shRp - r.hit.shRp) * 57.3 : 0;
    if (want('t1')) ok('t1 do-clique-ao-golpe', r.started && r.frames > 0 && r.dmg > 0 && Math.abs(r.ms - r.contactMs) < 90 && (r.stop > 0 || r.shake > 0), `o gesto ${r.started ? 'começou no mesmo quadro do clique' : 'NÃO começou'}; acertou ${r.dmg} no quadro ${r.frames} (${r.ms} ms; o contato do gesto a ${r.contactMs} ms do corpo); o peso: o tempo do corpo parado ${Math.round(r.stop * 1000)} ms, o olho ${r.shake.toFixed(2)}`);
    if (want('t2')) ok('t2 o-golpe-se-ve-chegar', sw > 45 && r.trail >= 2, `o ombro desenhado no preparo a ${Math.round(sw)}° do contato (o tronco ${r.wind ? Math.round((r.wind.twist - r.hit.twist) * 57.3) : '?'}°); o rastro com ${r.trail} pontos`);
    if (want('t2')) { // the photos: the windup, the contact (a blow held at its moments by the body's time all but stopped)
      await E(() => { __X.reset(); const o = G.S.villagers.get(__X.t1); __X.stand(o, 1.2, 0); __X.mouse(0, true); __X.mouse(0, false); __X.f(7); });
      await shot('t2-preparo');
      await E(() => { __X.f(30); __X.reset(); const o = G.S.villagers.get(__X.t1); __X.stand(o, 1.2, 0); __X.mouse(0, true); __X.mouse(0, false); __X.until(() => { const a = G.Avatar.actNow(); return !a || a.t >= a.contact; }, 60); });
      await shot('t2-contato');
      await E(() => __X.f(40));
    }
  }

  // ================================ t3: a tela ================================
  if (want('t3')) {
    const r = await E(() => {
      const X = __X; X.reset(); X.arm([['espada.bronze', 'mao'], ['escudo.madeira', 'outra']]);
      const H = document.querySelector('.cb-hud'); const out = { el: !!H, inHud: !!(H && H.closest('#inc-hud')) };
      X.mouse(0, true); X.f(30); out.charge = G.CombateUI.state().mode; const ch = document.querySelector('.cb-ch'); out.dash = ch ? ch.style.strokeDasharray : ''; out.on = H && H.classList.contains('on'); X.mouse(0, false); X.f(60);
      X.mouse(2, true); X.f(10); out.guard = G.CombateUI.state().guard; const g = document.querySelector('.cb-guard'); out.mark = g && !g.classList.contains('hidden') ? g.textContent : ''; return out;
    });
    await shot('t3-guarda');
    await E(() => { __X.mouse(2, false); __X.f(10); });
    ok('t3 a-tela', r.el && r.inHud && r.charge === 'carga' && /^\d/.test(r.dash) && r.on && r.guard && r.mark, `o elemento ${r.el ? 'na tela do corpo' : 'NÃO EXISTE'}; segurando o clique: ${r.charge}, o anel da carga «${r.dash}», a tela ${r.on ? 'acesa' : 'apagada'}; o clique direito: a guarda ${r.guard ? 'erguida' : 'NÃO'}, a marca «${r.mark}»`);
  }

  // ================================ t4: o toque ================================
  if (want('t4')) {
    const r = await E(() => {
      const X = __X; X.reset(); X.arm([['espada.bronze', 'mao']]); const o = G.S.villagers.get(X.t1) || X.other([]); X.stand(o, 1.0, 0);
      // (a finger on the screen: the touch layer on, as the first touch of the canvas puts it — the buttons by their moment)
      G.Input3D.touch = true; G.IncUI.touchOn(); X.f(30);
      const shown = G.IncUI.touchButtons ? G.IncUI.touchButtons() : []; const h0 = o.hp;
      const T = (id, x, y, tg) => new Touch({ identifier: id, target: tg, clientX: x, clientY: y });
      const btn = a => document.querySelector(`#inc-hud .ih-tb button[data-k="${a}"]`);
      const touch = (a, down) => { const b = btn(a); if (!b) return false; b.dispatchEvent(new TouchEvent(down ? 'touchstart' : 'touchend', { changedTouches: [T(2, 900, 500, b)], touches: down ? [T(2, 900, 500, b)] : [], cancelable: true, bubbles: true })); return true; };
      const pressed = touch('atacar', true); G.Main.frameFor(16.7, true); touch('atacar', false); X.until(() => o.hp < h0, 60); const hit = Math.round((h0 - o.hp) * 10) / 10; X.f(40);
      touch('defender', true); X.f(6); const g = G.CombateUI.state().guard; touch('defender', false); X.f(6); const g2 = G.CombateUI.state().guard;
      const lab = btn('atacar') ? btn('atacar').textContent : '';
      return { shown, hit, g, g2, pressed, lab };
    });
    await shot('t4-toque');
    ok('t4 o-toque', r.shown.includes('atacar') && r.shown.includes('defender') && r.pressed && r.hit > 0 && r.g && !r.g2, `os botões: ${r.shown.join(', ')} («${r.lab}»); o dedo no Golpe acertou ${r.hit}; Defesa segurada ${r.g ? 'guarda' : 'NÃO guarda'}, solta ${r.g2 ? 'AINDA GUARDA' : 'baixa'}`);
  }

  // ================================ t5: o arco ================================
  if (want('t5')) {
    const r = await E(() => {
      const X = __X; X.reset(); X.arm([['arco', 'outra'], ['flecha.bronze', null, 6]]); X.f(4);
      X.mouse(2, true); X.f(8); const aim = G.Cam3D.aiming(); const n0 = G.Combate.arrows(X.body());
      X.mouse(0, true); X.f(45); const drawn = G.CombateUI.state().drawT; X.mouse(0, false); let seen = 0;
      for (let k = 0; k < 120; k++) { G.Main.frameFor(16.7, true); seen = Math.max(seen, G.Combate3D ? G.Combate3D.arrows : 0); if (k === 3) X.snap = 1; if (!G.Combate.flights().length && k > 5) break; }
      return { aim, drawn, seen, n0, n1: G.Combate.arrows(X.body()) };
    });
    await E(() => { __X.mouse(0, true); __X.f(40); });
    await shot('t5-arco');
    await E(() => { __X.mouse(0, false); __X.f(60); __X.mouse(2, false); __X.f(10); });
    ok('t5 o-arco', r.aim && r.drawn > 0.6 && r.seen >= 1 && r.n1 === r.n0 - 1, `o clique direito ${r.aim ? 'mirou' : 'NÃO mirou'}; puxou ${r.drawn.toFixed(2)} s; a flecha desenhada no ar: ${r.seen}; as flechas ${r.n0} → ${r.n1}`);
  }

  // ================================ t6: a mira travada e a troca ================================
  if (want('t6')) {
    const r = await E(() => {
      const X = __X; X.reset(); X.arm([['espada.bronze', 'mao']]);
      const a = G.S.villagers.get(X.t1) || X.other([]); const b = X.other([a.id]); X.stand(a, 4, -1.2); X.stand(b, 4, 1.2); X.f(60); // (the people's grid is a quarter of a second of the world old: T-1350)
      X.mouse(1, true); X.mouse(1, false); X.f(4); const l0 = G.Cam3D.locked(); const first = l0 && l0.id;
      const side = first === a.id ? 1 : -1; for (let k = 0; k < 8; k++) { G.Cam3D.look(side * 40, 0); G.Main.frameFor(16.7, true); }
      X.f(4); const l1 = G.Cam3D.locked(); const second = l1 && l1.id; G.Cam3D.unlock(); X.f(2);
      return { first, second, a: a.id, b: b.id };
    });
    ok('t6 a-mira-travada-e-a-troca', !!r.first && !!r.second && r.first !== r.second && [r.a, r.b].includes(r.second), `o botão do meio travou #${r.first}; o empurrão do mouse trocou para #${r.second} (os dois: #${r.a}, #${r.b})`);
  }

  // ================================ t7: o duelo ================================
  if (want('t7')) {
    const r = await E(() => {
      const X = __X; X.reset(); X.arm([['espada.bronze', 'mao']]); const S = G.S; const me = X.body(); const F = G.Fac.idOfV(me);
      const w = [...S.villagers.values()].filter(o => o.id !== me.id && o.age >= 20 && o.age < 50 && !o.captive && !o.jail && !o.aboard && !(o.sick > 0) && G.Fac.idOfV(o) === F && !G.Possess.kin(me, o) && !G.Vg.handsBusy(o) && !(o.traits || []).includes('Covarde')).sort((p, q) => (q.role === 'guerreiro') - (p.role === 'guerreiro') || p.id - q.id)[0];
      if (!w) return { none: 1 }; w.courage = 0.98; X.stand(w, 1.6, 0); X.f(8);
      const offer = G.Interact.offer(); const fv = offer && offer.verbs.find(x => x.k === 'outra');
      X.key('f', true); X.key('f', false); X.f(12); const d = G.Combate.duel(); const ev = G.Combate.events().filter(e => e.kind === 'recusa' || e.kind === 'duelo' || e.kind === 'fim').map(e => e.kind).join(','); const why = G.Combate.wouldDuel ? '' : ''; X.f(30);
      const line = document.querySelector('.cb-duel'); const toasts = [...document.querySelectorAll('.ih-toast')].map(e => e.textContent).join(' | ');
      return { target: offer ? offer.id : '', fv: fv ? fv.label : '', duel: !!d, line: line && !line.classList.contains('hidden') ? line.textContent : '', w: w.id, ev, toasts, traits: (w.traits || []).join(','), role: w.role }; void why;
    });
    if (!r.none) await shot('t7-duelo');
    await E(() => { const d = G.Combate.duel(); if (d) { G.inSim++; try { G.Combate.endDuel(0, 'largou'); } finally { G.inSim--; } } __X.f(10); });
    ok('t7 o-duelo', !r.none && /^Desafiar/.test(r.fv) && r.duel && /^Duelo com/.test(r.line), r.none ? 'ninguém para desafiar' : `o alvo do E: ${r.target}; o F: «${r.fv}» (${r.role}, ${r.traits || 'sem traços'}); ${r.duel ? 'o duelo começou' : 'NÃO começou'} (o mundo: ${r.ev || 'nada'}; a tela: ${r.toasts || 'nada'}); a linha: «${r.line}»`);
  }

  // ================================ t8: sem erros ================================
  // (the things the proof's hand gave go back: nothing of a metal the people never had is left in the bag — the origin's verifier)
  { const q = await E(() => { __X.arm([]); return { err: JSON.stringify(G.modErr || {}), qa: __X.qa() }; });
    ok('t8 sem-erros', !errs.length && q.err === '{}' && !q.qa.length, `${errs.slice(0, 3).join(' | ') || 'sem erros de página'} · módulos ${q.err} · ${q.qa.slice(0, 2).join(' · ') || 'verificador limpo'}`); }
  await browser.close();
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('FALHOU | combate-tela erro | ' + e.message); process.exit(1); });
