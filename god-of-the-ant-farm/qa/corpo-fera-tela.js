// corpo-fera-tela: a parte do navegador do qa/corpo-fera.js (node qa/corpo-fera.js tela PASTA) — o Modo Encarnado com o 3D de
// verdade (o WebGL por software do navegador de testes: lento, os tempos são o piso), no mundo pronto «cidade», a 1280 × 720 (o
// jogo é de computador: D-333). O corpo num campo aberto longe das cidades, e a fera posta pela mão da prova:
//  t1 o leão faminto: a espreita, o salto, a patada e a mordida no corpo — a boca do leão desenhada no corpo (a cabeça dele a
//     menos de um metro e meio do meio do corpo enquanto o gesto o mira), o corpo derrubado, o vermelho nas bordas, a vida caindo;
//     a morte: a queda, o olho que fica baixo e depois sobe para ver o leão e o corpo, a linha «Morto por um leão», o corpo dado ao
//     cadáver onde a queda acaba (um corpo só desenhado), e o deus de volta;
//  t2 o hipopótamo na beira do rio: o corpo anda contra ele e para encostado (desenhado fora dele); o hipopótamo investe, morde
//     com o gesto posto no corpo, e o corpo cai;
//  e o verificador limpo, sem erro de página, aviso no console nem erro de módulo. As fotos vão para a PASTA.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
module.exports = async function (OUT) {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL|WebGL-/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(__dirname, 'qa.js') }); await page.addScriptTag({ path: path.join(__dirname, 'corpo-fera-inv.js') });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
  const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-fera ${name} | ${info}`); if (!c) fails.push(name); };
  const shot = async name => {
    // (the photo's own: the keys' hint and the words of the moment put away — they are the first seconds' — at the medium picture)
    await page.evaluate(() => { for (const q of ['.ih-hint', '#inc-banner', '.ih-news']) { const e = document.querySelector(q); if (e) e.style.visibility = 'hidden'; } G.Realm.setQuality('media'); for (let k = 0; k < 3; k++) G.Main.frameFor(1, true); });
    try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000 }); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); }
    await page.evaluate(() => G.Realm.setQuality('baixa'));
  };
  await page.evaluate(() => {
    const E = window.__F = {
      fresh() { G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data.cidade)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
        E.base = new Set(QA.check().filter(e => e.sev <= 2).map(e => e.sys + '|' + e.msg)); },
      qa: () => QA.check().filter(e => e.sev <= 2 && !E.base.has(e.sys + '|' + e.msg)).map(e => `${e.sys}/S${e.sev}: ${e.msg}`),
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      // (the world and the body's controller without the picture — the software WebGL is slow: only the moments that are looked at
      // are drawn; the world's step at the body's pace, as the game's own frame gives it)
      fast(n) { for (let k = 0; k < n && G.Modes.state === 'INC'; k++) { G.debug.step(0.033 * G.Modes.timeScale(1)); G.Avatar.frame(0.033); } },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      god: f => { G.inSim++; try { return f(); } finally { G.inSim--; } },
      // (an open field far from the towns — as the Node part's, D-330 —; with water: a dry tile on a river's bank)
      field(water) {
        const S = G.S, W = G.W, N = G.N; const far = (x, y) => [...S.settlements.values()].every(s => G.dist(s.cx, s.cy, x, y) > 14);
        const okT = (i, sl) => W.walkable(i) && !S.occ[i] && !S.treeAt[i] && !S.objAt[i] && !S.wall[i] && !S.road[i] && S.type[i] > G.T.RIVER && S.slope[i] <= sl;
        const clear = (x, y, r, sl) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (!W.inb(x + dx, y + dy) || !okT(W.idx(x + dx, y + dy), sl)) return false; } return true; };
        if (water) { for (let y = 12; y < N - 12; y++) for (let x = 12; x < N - 12; x++) { if (!far(x, y) || !clear(x, y, 1, 1.1)) continue;
          for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) { const i = W.idx(x + dx, y + dy); if (S.type[i] !== G.T.RIVER || S.road[i]) continue; let n = 0; for (let qy = -1; qy <= 1; qy++) for (let qx = -1; qx <= 1; qx++) if (S.type[W.idx(x + dx + qx, y + dy + qy)] === G.T.RIVER) n++; if (n >= 6) return { x: x + 0.5, y: y + 0.5, wx: x + dx + 0.5, wy: y + dy + 0.5 }; } } return null; }
        for (const [r, sl] of [[4, 0.8], [3, 1.1], [2, 1.1]]) for (let y = 12; y < N - 12; y += 2) for (let x = 12; x < N - 12; x += 2) if (far(x, y) && clear(x, y, r, sl)) return { x: x + 0.5, y: y + 0.5 };
        return null;
      },
      clear(x, y, r) { for (const a of [...G.S.animals.values()]) { const d = G.Animals.DEF[a.kind]; if (G.dist(a.x, a.y, x, y) < r && !d.dom && !d.town) G.Animals.remove(a); } },
      adult() { return [...G.S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0]; },
      // (the body lived at (x, y), facing yaw: the person put there by the test's hand, then the descent of the game)
      live(x, y, yaw) { const v = E.adult(); if (!v) return null; G.Vg.endTask(v); v.x = x; v.y = y; v.path = null; v.hp = 100; v.hunger = 10; v.energy = 90; v.sleeping = false;
        if (!G.Modes.enter(v)) return null; if (E.until(() => G.Modes.state === 'INC', 120, 100) < 0) return null; G.Cam3D.yaw = yaw; G.Cam3D.pitch = 0.18; G.Cam3D.dist = 5.2; return v; },
      beast(kind, x, y, fx, fy, o) { const sp = G.Animals.DEF[kind]; const a = E.god(() => G.Animals.spawn(kind, x, y, Object.assign({ age: sp.life * 0.45, grown: 1, hunger: 0.1, t: 999, scan: 999 }, o || {}))); G.faceTo(a, fx, fy); return a; },
      // (where the drawn beast's head is, from the frames its pose left in the view's memory — People3D's keyPoint bones)
      headOf(a) { const s = G.People3D.beastVis(a.id); if (!s || !s.kb) return null; const o = 2 * 16; return [s.kb[o + 12], s.kb[o + 13], s.kb[o + 14]]; },
    };
  });

  // ================================ t1: the hungry lion ================================
  const t1 = await page.evaluate(() => {
    const E = __F; E.fresh(); const F = E.field(false); if (!F) return { err: 'nenhum campo' };
    E.clear(F.x, F.y, 30); const v = E.live(F.x, F.y, 0); if (!v) return { err: 'não encarnou' };
    const L = E.beast('lion', F.x + 3.9, F.y + 0.3, -1, 0, { hunger: 0.95 }); E.f(4); // (inside the open field: a lion on the far side of a bank gives up the way to the body)
    L.target = v.id; L.onPerson = true; L.state = 'stalk'; L.t = 18; L.crouch = 0; L.carc = false;
    return { id: v.id, lion: L.id, name: v.name, g: v.g };
  });
  if (t1.err) ok('t1 o leão', false, t1.err);
  else {
    const seen = { stalk: 0, pounce: 0, blow: 0, down: 0, red: 0, aimed: [], hpDrop: 0, gestures: [] };
    const step = n => page.evaluate(([n, id, lid]) => {
      const E = __F; const out = [];
      for (let k = 0; k < n; k++) {
        const L0 = G.S.animals.get(lid); const hot = L0 && L0.gestO === id && (L0.gest === 'bite' || L0.gest === 'swipe' || L0.gest === 'pounce');
        if (hot || k % 8 === 7) E.f(1); else E.fast(1); const L = G.S.animals.get(lid); const v = G.S.villagers.get(id);
        const r = { st: G.Modes.state, ls: L ? L.state : '', lg: L && L.gestO === id ? L.gest : '', down: G.Avatar.hurtNow() ? G.Avatar.hurtNow().loco === 'down' : false, red: G.IncUI.hurtNow().k, hp: v ? v.hp : 0, dead: !v };
        // (the lion's head as drawn, while its blow is at the body: how far from the body's middle)
        if (L && (L.gest === 'bite' || L.gest === 'swipe') && L.gestO === id && G.People3D.avatar) { const h = E.headOf(L); const av = G.People3D.avatar; if (h) r.aim = Math.hypot(h[0] - av.X, h[2] - av.Z); }
        // (the eye toward the lion, as a player would keep it in the picture)
        if (L && G.Modes.state === 'INC' && v) { const want = Math.atan2(L.y - v.y, L.x - v.x) + (L.gestO === id && L.gest !== 'stalk' ? 1.05 : 0.35); let da = want - G.Cam3D.yaw; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; G.Cam3D.yaw += da * 0.08; }
        out.push(r); if (r.dead || G.Modes.state !== 'INC') break;
      }
      return out;
    }, [n, t1.id, t1.lion]);
    const take = rs => { for (const r of rs) { if (r.lg === 'stalk') seen.stalk++; if (r.ls === 'pounce' || r.lg === 'pounce') seen.pounce++; if (r.lg === 'bite' || r.lg === 'swipe') seen.blow++; if (r.down) seen.down++; if (r.red > 0.3) seen.red++; if (r.aim !== undefined) seen.aimed.push(+r.aim.toFixed(2)); if (r.lg && seen.gestures[seen.gestures.length - 1] !== r.lg) seen.gestures.push(r.lg); } return rs[rs.length - 1]; };
    let last = null, phase = 'stalk', shots = 0;
    for (let round = 0; round < 260 && (!last || (!last.dead && last.st === 'INC')); round++) {
      last = take(await step(16));
      if (phase === 'stalk' && seen.stalk > 20) { await shot('t1-1-espreita'); phase = 'pounce'; shots++; }
      else if (phase === 'pounce' && seen.pounce > 0) { await shot('t1-2-salto'); phase = 'blow'; shots++; }
      else if (phase === 'blow' && seen.blow > 3) { await shot('t1-3-golpe-no-corpo'); phase = 'down'; shots++; }
      else if (phase === 'down' && seen.down > 3 && last.red > 0.2) { await shot('t1-4-derrubado'); phase = 'end'; shots++; }
    }
    // the death
    const death = await page.evaluate(id => {
      const E = __F; const out = { states: [], handed: false, kill: '', drawn: [] };
      const st0 = G.Modes.state; out.states.push(st0); const d0 = G.People3D.dead || 0;
      for (let k = 0; k < 260 && G.Modes.state !== 'GOD'; k++) { E.f(1, 50); const d = G.Modes.dying && G.Modes.dying(); if (d && d.handed) out.handed = true; if (out.states[out.states.length - 1] !== G.Modes.state) out.states.push(G.Modes.state);
        // (how many of this person's bodies the 3D draws: the falling one, or its corpse — never both)
        if (G.Modes.state === 'DYING' && k % 4 === 0) { const av = G.People3D.avatar && G.People3D.avatar.id === id ? 1 : 0; out.drawn.push(av + Math.max(0, (G.People3D.dead || 0) - d0)); }
        if (k === 12 || k === 45 || k === 100) out['t' + k] = true; }
      out.kill = G.IncUI.lastDeath ? G.IncUI.lastDeath.kill : ''; out.qa = E.qa(); out.mod = JSON.stringify(G.modErr || {});
      return out;
    }, t1.id).catch(e => ({ err: e.message }));
    ok('t1 o leão faminto: a espreita, o salto e o golpe, cada gesto posto no corpo', seen.stalk > 0 && seen.pounce > 0 && seen.blow > 0, `gestos no corpo: ${seen.gestures.join(' → ')}; fotos ${shots}`);
    const near = seen.aimed.length ? Math.min(...seen.aimed) : Infinity;
    ok('t1 a cabeça do leão desenhada no corpo enquanto o golpe o mira (a menos de 1,5 m do meio do corpo)', seen.aimed.length > 0 && near < 1.5, `${seen.aimed.length} quadros de golpe; o mais perto ${near} m; ${seen.aimed.slice(0, 12).join(' · ')}`);
    ok('t1 o corpo derrubado, o vermelho nas bordas, a vida caindo', seen.down > 0 && seen.red > 0, `no chão ${seen.down} quadros; vermelho forte ${seen.red}; vida no fim ${last ? Math.round(last.hp) : '?'}`);
    ok('t1 a morte: a queda, o cadáver no lugar do corpo, «Morto por um leão», e o deus de volta', !death.err && death.states.includes('DYING') && death.states.includes('GOD') && death.handed && /^Mort[oa] por um leão$/.test(death.kill) && death.drawn.every(n => n === 1) && !death.qa.length && death.mod === '{}',
      death.err ? death.err : `estados ${death.states.join(' → ')}; dado ao cadáver ${death.handed}; corpos desenhados ${death.drawn.join(',')}; «${death.kill}»; verificador ${death.qa.slice(0, 2).join(' · ') || 'limpo'} · ${death.mod}`);
  }
  // the death's frames, again, for the photos (the same lion, a second body)
  const t1b = await page.evaluate(() => {
    const E = __F; E.fresh(); const F = E.field(false); E.clear(F.x, F.y, 30); const v = E.live(F.x, F.y, 0); if (!v) return { err: 'não encarnou' };
    v.hp = 20; const L = E.beast('lion', F.x + 2.2, F.y + 0.2, -1, 0, { hunger: 0.95 }); E.f(4); L.target = v.id; L.onPerson = true; L.state = 'chase'; L.t = 8;
    G.Cam3D.yaw = Math.atan2(L.y - v.y, L.x - v.x) + 0.5;
    for (let k = 0; k < 2400 && G.Modes.state === 'INC'; k++) { const hot = L.gestO === v.id && (L.gest === 'bite' || L.gest === 'swipe'); if (hot) { E.f(1); G.Cam3D.yaw = Math.atan2(L.y - v.y, L.x - v.x) + 0.5; } else E.fast(1); }
    return { id: v.id, ok: G.Modes.state === 'DYING' };
  });
  if (t1b.ok) { for (const [k, n] of [[4, 't1-5-a-queda'], [16, 't1-6-caido'], [30, 't1-7-o-olho-sobe'], [26, 't1-8-morto-por-um-leao']]) { await page.evaluate(n => __F.f(n, 33), k); await shot(n); } }
  else ok('t1 as fotos da morte', false, JSON.stringify(t1b));

  // ================================ t2: the hippo on the bank ================================
  const t2 = await page.evaluate(() => {
    const E = __F; E.fresh(); const F = E.field(true); if (!F) return { err: 'nenhuma beira de rio' };
    E.clear(F.x, F.y, 30); const yaw = Math.atan2(F.wy - F.y, F.wx - F.x); const v = E.live(F.x, F.y, yaw); if (!v) return { err: 'não encarnou' };
    const H = E.beast('hippo', F.x + (F.wx - F.x) * 0.55, F.y + (F.wy - F.y) * 0.55, -(F.wy - F.y), F.wx - F.x); E.f(6);
    // (the body walks straight at its side, a few seconds: against it, never in it)
    const IN = G.Avatar.input; let worst = Infinity; const Co = G.Corpo;
    for (let k = 0; k < 150; k++) { const b = G.Avatar.pos(); IN.camYaw = Math.atan2(H.y * 4 - b.Z, H.x * 4 - b.X); G.Cam3D.yaw = IN.camYaw - 0.6; IN.mz = 1; IN.mx = 0; if (k % 10 === 9) G.Main.frameFor(33, true); else { G.debug.step(0.033 * G.Modes.timeScale(1)); G.Avatar.frame(0.033); } worst = Math.min(worst, Co.gap(H, v.x, v.y, G.Avatar.TUNE.radius / 4) * 4); }
    IN.mz = 0; E.f(2);
    return { id: v.id, hippo: H.id, worst };
  });
  if (t2.err) ok('t2 o hipopótamo', false, t2.err);
  else {
    await shot('t2-1-encostado-no-hipopotamo');
    const r = await page.evaluate(([id, hid]) => {
      const E = __F; const H = G.S.animals.get(hid); const v = G.S.villagers.get(id); const IN = G.Avatar.input; IN.mz = 0;
      // (stepped back, and the hippo angry at the body: the charge)
      const b = G.Avatar.state(); const d = Math.atan2(v.y - H.y, v.x - H.x); v.x += Math.cos(d) * 1.5; v.y += Math.sin(d) * 1.5; E.f(2);
      H.angry = 6; H.target = id; H.state = 'chase'; H.t = 6; H.scan = 0.4; E.god(() => G.Mente.gesto(H, 'charge', 0, id)); void b;
      const out = { bite: 0, down: 0, aim: [], worst: Infinity, shotAt: -1 };
      for (let k = 0; k < 500 && G.Modes.state === 'INC'; k++) { if (H.gest === 'bite' && H.gestO === id) E.f(1); else E.fast(1); out.worst = Math.min(out.worst, G.Corpo.gap(H, v.x, v.y, 0.32 / 4) * 4);
        { let da = Math.atan2(H.y - v.y, H.x - v.x) + 1.0 - G.Cam3D.yaw; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; G.Cam3D.yaw += da * 0.15; G.Cam3D.pitch = 0.12; }
        if (H.gest === 'bite' && H.gestO === id) { out.bite++; const h = E.headOf(H); const av = G.People3D.avatar; if (h && av) out.aim.push(+Math.hypot(h[0] - av.X, h[2] - av.Z).toFixed(2)); if (out.shotAt < 0 && out.bite === 4) { out.shotAt = k; break; } }
        if (G.Avatar.hurtNow() && G.Avatar.hurtNow().loco === 'down') out.down++; }
      return out;
    }, [t2.id, t2.hippo]);
    await shot('t2-2-a-mordida');
    const r2 = await page.evaluate(([id]) => { const E = __F; let down = 0; for (let k = 0; k < 24 && G.Modes.state === 'INC'; k++) { E.f(1); if (G.Avatar.hurtNow() && G.Avatar.hurtNow().loco === 'down') down++; } return { down, qa: E.qa(), err: JSON.stringify(G.modErr || {}) }; }, [t2.id]);
    await shot('t2-3-derrubado-pelo-hipopotamo');
    ok('t2 o corpo anda contra o hipopótamo na beira do rio e para encostado, desenhado fora dele', t2.worst > -0.05, `o mais fundo: ${t2.worst.toFixed(2)} m`);
    ok('t2 o hipopótamo investe e morde com o gesto posto no corpo, o corpo cai', r.bite > 0 && (r.down + r2.down) > 0 && r.worst > -0.08 && r.aim.length > 0 && Math.min(...r.aim) < 2.6, `mordida ${r.bite} quadros, a cabeça a ${r.aim.length ? Math.min(...r.aim) : '?'} m do meio do corpo; no chão ${r.down + r2.down}; o mais perto ${r.worst.toFixed(2)} m`);
    ok('t2 verificador', !r2.qa.length && r2.err === '{}', `${r2.qa.slice(0, 3).join(' · ') || 'limpo'} · ${r2.err}`);
  }
  ok('sem erro de página nem aviso no console', !errs.length, errs.slice(0, 4).join(' | ') || 'nenhum');
  console.log(`(fotos em ${OUT})`);
  console.log(fails.length ? `FALHARAM: ${fails.join(', ')}` : 'tudo passou');
  await browser.close();
  process.exitCode = fails.length ? 1 : 0;
};
