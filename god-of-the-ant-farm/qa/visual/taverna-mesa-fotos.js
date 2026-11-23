// taverna-mesa-fotos: bash qa/navegador.sh node qa/visual/taverna-mesa-fotos.js PASTA [mundo] [pc] — o corpo à mesa da taverna
// (P7, D-767 a D-769) no navegador, com o 3D de verdade (WebGL sem GPU — é lento: ≈ 25 min), num celular em pé (390 × 844) ou, com
// «pc», na tela do PC. As fotos: 1 o cardápio aberto numa taverna nórdica pequena e pobre — a lousa na parede, escrita a giz —,
// com o taverneiro ao lado da mesa; 2 o cardápio de uma taverna egípcia, na carta caprichada (o porte da casa de verdade é o que o
// T.look diz; para a foto, a mão da prova pede a carta: G.CardapioUI.force, só a vista); 3 o taverneiro trazendo o prato na mão; 4 o
// corpo comendo à mesa, o prato na mesa. As regras são provadas em Node pelo qa/taverna-corpo.js; aqui, o que se vê: o painel inteiro
// na tela, sem rolagem de lado, os botões de tocar de 44 px ou mais, a escolha e o pedido pelos toques, o prato na mão de quem serve,
// o gesto da mesa — e nenhum erro de página, de console nem de módulo. Para ver todos os povos e portes de uma vez, sem o 3D:
// qa/visual/cardapio-folha.js.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'taverna-mesa'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'metropole'; const PC = process.argv[4] === 'pc';
const ATE = +(process.env.ATE || 4); // (ATE=1: only the first picture — the slate —, and so on)
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage(PC ? { viewport: { width: 1280, height: 760 } } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL|WebGL: INVALID|CONTEXT_LOST/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'qa', 'qa.js') });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | taverna-mesa-fotos ${name} | ${info}`); if (!cond) fails.push(name); };
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 480000 }); console.log('foto: ' + path.join(OUT, name + '.png')); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  const r0 = await E(([w, phone]) => {
    const T = window.__T = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      // (the world on, its seconds, with the body's controller and the screen of the body at each — nothing drawn: fast)
      run(c, sec) { const t0 = G.S.clock; while (!c() && G.S.clock - t0 < sec) { G.debug.step(0.1); G.Avatar.frame(1 / 30); G.IncUI.frame(1 / 30); } return c(); },
      god(f) { G.inSim++; try { return f(); } finally { G.inSim--; } },
    };
    G.Realm.setQuality('media'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const calm = () => { const s = G.S.weather; s.rain = 0; if (s.storm) s.storm = 0; if (!(G.S.divinePeace > G.DAY_LEN * 0.5)) T.god(() => G.Politics.divinePeace()); };
    for (let t = 0; t < G.DAY_LEN * 40 && G.S.time < 0.6; t++) { calm(); G.debug.step(0.1); }
    const Ta = G.Taverna, In = G.Interiors, D = G.Depot; const used = new Set();
    // (a tavern of a people, open, its keeper at the counter, and someone of its people with coin for it — the body —, a seat at a table)
    T.pick = tema => {
      for (const b of [...G.S.buildings.values()].filter(b => b.type === 'taverna' && b.built && In.has(b) && Ta.dia(b) && Ta.aberta(b) && Ta.look(b).tema === tema).sort((a, c) => a.id - c.id)) {
        const kp = Ta.keeperOf(b); if (!kp || !Ta.atHand(b)) continue; const fid = G.Village.facOfSet(b.set);
        const v = [...G.S.villagers.values()].filter(o => o !== kp && !used.has(o.id) && o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && G.Fac.idOfV(o) === fid && G.Possess.can(o).ok && D.get(G.Eco.coinRef(o), 'moedas') >= 2).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
        const p = G.Space.planNow(b); if (!v || !p || !p.entrance) continue;
        const pls = In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 40, ['sentar', 'comer']).filter(q => ({ banquinho: 1, banco: 1, cadeira: 1 })[q.it.kind] && In.walkIn(b, q) < Infinity).sort((a, c) => (a.use === 'comer' ? 0 : 1) - (c.use === 'comer' ? 0 : 1));
        if (pls.length && Ta.cartaOf(b).some(x => x.sort === 'comer' && x.ok)) { used.add(v.id); return { b, v, kp, pl: pls[0] }; }
      }
      return null;
    };
    // (into the room, where one gets onto the seat — the proof's hand, as the Node proof's: taverna-corpo.js —, and sat down by the verb)
    T.seat = pk => {
      const { b, v, pl } = pk; const TL = G.Space.TILE; pl.at = In.standFor(b, pl, pl.x, pl.z);
      T.god(() => { v.inside = b.id; v.x = b.x + pl.at[0] / TL; v.y = b.y + pl.at[1] / TL; }); G.Possess.setLevel(pl.lv); G.Avatar.attach(v, 0); T.f(6);
      const st = G.Avatar.state(); let best = null;
      for (let k = 0; k < 40 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL + pl.z - st.Z, b.x * TL + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = G.Interact.best(); T.f(1); }
      if (!(best && best.id === 'lugar')) return `o E oferece ${best ? best.label : 'nada'}`;
      G.Interact.run(best); T.until(() => G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1, 120);
      // (the eye over the shoulder and a little to the side: the table before the body, and the keeper when he comes)
      G.Avatar.input.camYaw = G.Avatar.state().yaw + 0.55; T.f(6); return '';
    };
    const a = T.pick('nordico'), e = T.pick('egipcio'); if (!a || !e) return { none: `sem taverna ${!a ? 'nórdica' : 'egípcia'} aberta com taverneiro, um assento e um prato` };
    T.a = a; T.e = e;
    T.god(() => { G.Vg.endTask(a.v); a.v.path = null; a.v.inside = a.b.id; });
    if (!G.Modes.enter(a.v)) return { none: 'não encarnou' };
    T.until(() => G.Modes.state === 'INC', 400);
    if (phone) { G.Input3D.touch = true; G.Input3D.device = 'touch'; G.IncUI.touchOn(); }
    const why = T.seat(a); if (why) return { none: why };
    return { who: `${a.v.name} na ${G.Village.buildName(a.b)} #${a.b.id} (${Ta.look(a.b).porte}); ${e.v.name} na #${e.b.id} (${Ta.look(e.b).porte})` };
  }, [WORLD, !PC]);
  if (r0.none) { ok('o retrato', false, r0.none); await browser.close(); process.exit(1); }
  console.log(r0.who);
  // (the menu open: measured — on the screen whole, no scroll to the side, the buttons to tap 44 px or more)
  const measure = () => E(() => {
    const T = window.__T; T.f(2); const el = document.querySelector('#menu-panel'); const r = el && el.getBoundingClientRect(); const L = el && el.querySelector('.mn-list');
    const small = el ? [...el.querySelectorAll('button')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44 && !b.classList.contains('x')).length : -1;
    return { open: G.CardapioUI.isOpen(), look: G.CardapioUI.look(), inside: !!r && r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, side: !!L && L.scrollWidth > L.clientWidth + 1, small,
      rows: el ? [...el.querySelectorAll('.mn-row')].map(x => x.querySelector('.nm b').textContent + ' ' + x.querySelector('.pr').textContent) : [], ola: el ? el.querySelector('.mn-say').textContent : '', seat: G.Avatar.state().loco, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0 };
  });
  // ================================ 1: the slate of a small Norse tavern
  // (the world told the screen in its frames: a few real ones after the keeper opened the menu, and the sheet's own time to unfold)
  const c1 = await E(() => { const T = window.__T; const r = T.run(() => { const s = G.Taverna.corpo(T.a.v); return !!s && s.cv === 'carta'; }, 120); T.f(12); return r; });
  await page.waitForTimeout(1500); const m1 = await measure();
  const flags = m => `aberto ${m.open}, na tela ${m.inside}, de lado ${m.side}, botões pequenos ${m.small}, ${m.seat}`;
  ok('1 a lousa nórdica, o taverneiro à mesa, inteira na tela', c1 && m1.open && m1.look && m1.look.tema === 'nordico' && m1.inside && !m1.side && m1.small === 0 && m1.seat === 'seat', `${m1.look ? m1.look.tema + '/' + m1.look.porte : '-'}; ${flags(m1)}; ${m1.w}×${m1.h}; ${m1.ola} — ${m1.rows.join(' · ')}`);
  await shot('1-lousa-nordica');
  if (ATE < 2) { await browser.close(); console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU'); process.exit(fails.length ? 1 : 0); }
  // ================================ 2: the menu of an Egyptian tavern, as the rich one has it
  const c2 = await E(() => {
    const T = window.__T; G.CardapioUI.close(); T.f(2);
    G.Modes.switchTo(T.e.v); T.until(() => G.S.avatar && G.S.avatar.id === T.e.v.id && G.Modes.state === 'INC', 300); T.f(10);
    const why = T.seat(T.e); if (why) return { why };
    G.CardapioUI.force = { porte: 'carta' }; // (the photo's hand: the menu of the rich house, on this tavern's people and its own menu)
    const came = T.run(() => { const s = G.Taverna.corpo(T.e.v); return !!s && s.cv === 'carta'; }, 120); T.f(12); return { came };
  });
  await page.waitForTimeout(1500); const m2 = await measure();
  ok('2 a carta egípcia, inteira na tela', !c2.why && c2.came && m2.open && m2.look && m2.look.tema === 'egipcio' && m2.look.porte === 'carta' && m2.inside && !m2.side && m2.small === 0, `${c2.why || ''}${m2.look ? m2.look.tema + '/' + m2.look.porte : '-'}; veio ${c2.came}; ${flags(m2)}; ${m2.w}×${m2.h}; ${m2.ola} — ${m2.rows.join(' · ')}`);
  await shot('2-carta-egipcia');
  // ================================ 3: the plate on its way, in the keeper's hand
  const r3 = await E(() => {
    const T = window.__T; const Ta = G.Taverna; const el = document.querySelector('#menu-panel');
    const tap = e => { const r = e.getBoundingClientRect(); const o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 }; e.dispatchEvent(new PointerEvent('pointerdown', o)); e.dispatchEvent(new PointerEvent('pointerup', o)); e.click(); };
    const rows = [...el.querySelectorAll('.mn-row:not(.off)')]; const row = rows.find(x => /prato|caldo|sopa|tigela|pão|tortilhas|mingau/i.test(x.textContent)) || rows[0];
    const name = row.querySelector('.nm b').textContent; tap(row); T.f(2); const go = el.querySelector('.mn-go'); const label = go.textContent; tap(go);
    T.run(() => { const s = Ta.corpo(T.e.v); return !!s && s.cv === 'pedido'; }, 5); T.f(4);
    const shut = !G.CardapioUI.isOpen(); G.CardapioUI.force = null;
    // (half the way back to the table, the plate in his hand; the eye turned toward him: the player looks round)
    const k = T.e.kp; T.run(() => k.task && k.task.type === 'atender' && k.task.st === 13, 90);
    const t = k.task; const mid = t ? (G.S.clock + t.ww) / 2 : G.S.clock; T.run(() => G.S.clock >= mid, 10);
    const st = G.Avatar.state(); G.Avatar.input.camYaw = Math.atan2(k.y * G.Space.TILE - st.Z, k.x * G.Space.TILE - st.X) - 0.35; T.f(6);
    return { name, label, shut, hand: G.Inv.held(k).mao || '', st: k.task ? k.task.st : -1, seat: G.Avatar.state().loco };
  });
  ok('3 o pedido pelos toques e o prato na mão de quem serve', r3.shut && /^prato\./.test(r3.hand) && r3.st === 13 && r3.seat === 'seat', `«${r3.name}» — ${r3.label}; o cardápio ${r3.shut ? 'fechou' : 'aberto'}; na mão: ${r3.hand || 'nada'}; o corpo ${r3.seat}`);
  await shot('3-prato-a-caminho');
  // ================================ 4: eating at the table
  const r4 = await E(() => {
    const T = window.__T; const Ta = G.Taverna;
    const got = T.run(() => { const s = Ta.corpo(T.e.v); return !!s && s.cv === 'servido'; }, 60);
    G.Avatar.input.camYaw = G.Avatar.state().yaw + 0.8; // (the eye round to the side: the plate on the table, the hand to the mouth)
    // (the first mouthful by itself: the screen's own beat, real frames, until the hand is at the mouth)
    T.until(() => G.Avatar.busy() && G.Avatar.actNow() && G.Avatar.actNow().anim === 'mesa-comer' && G.Avatar.actNow().t > 1.0, 160);
    const a = G.Avatar.actNow(); const W = G.Atmos.within(T.e.b); const q = W.mesa.find(x => x.id === T.e.v.id);
    return { got, anim: G.Avatar.state().anim, act: a ? a.anim : '', seat: G.Avatar.state().loco, plate: q ? q.prato : '', hud: (document.querySelector('#inc-hud .ih-carry') || {}).textContent || '' };
  });
  ok('4 comendo à mesa: o gesto da mesa, o prato na mesa', r4.got && r4.anim === 'mesa-comer' && r4.seat === 'seat' && !!r4.plate, `${r4.anim} (${r4.act}), ${r4.seat}; na mesa: ${r4.plate || 'nada'}; a tela: «${r4.hud}»`);
  await shot('4-comendo');
  const me = await E(() => Object.keys(G.modErr || {}));
  ok('sem erros', !errs.length && !me.length, errs.concat(me).join(' | ').slice(0, 400) || 'nenhum');
  await browser.close();
  console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
  process.exit(fails.length ? 1 : 0);
})();
