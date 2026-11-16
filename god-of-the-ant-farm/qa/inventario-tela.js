// inventario-tela: bash qa/navegador.sh node qa/inventario-tela.js [pasta das fotos] [mundo] — a tela da mochila e do equipamento
// e a barra de atalhos (a base do corpo, 20c; D-336, D-377), no navegador, com o 3D de verdade (WebGL sem GPU — é lento). As
// regras do inventário são provadas em Node pelo qa/inventario.js; aqui, o que se vê e o que as mãos do jogador fazem nela:
//  t1 a tecla I abre o painel (a marca do painel «mochila», o corpo parado, o mundo andando), a barra de atalhos no lugar dela
//     (cinco atalhos e a mochila); no armazém do povo, as coisas que ele pode dar; I fecha, Esc fecha, E fecha;
//  t2 no PC, arrastando com o mouse: a espada da mochila para a mão, o escudo para a outra mão; um clique duplo no machado o
//     põe na mão (a espada vai para o cinto); arrastado de volta para a mochila, sai da mão; para o chão, cai no chão; e de lá
//     o botão «pegar» o traz de volta;
//  t3 no celular, tocando: um toque escolhe a coisa (os lugares onde ela cabe acendem), outro toque num lugar a põe lá;
//  t4 a barra de atalhos: uma coisa arrastada para o atalho 2 fica nele; o mouse sobre uma coisa e a tecla 3 a põem no 3;
//     fechada a mochila, a tecla 2 põe a coisa na mão e a tecla 2 de novo a guarda; o toque no botão do atalho faz o mesmo; o
//     botão da mochila na barra a abre;
//  t5 a tela não muda o mundo sozinha: com o mundo parado (o menu aberto), quadros da tela aberta e redesenhada não mudam o
//     estado canônico nem o acaso; o painel fecha quando o diário abre por cima;
//  e as fotos (o painel no PC e no celular, a barra), nenhum erro de página, de console nem de módulo; o verificador sem nada
//  novo (as regras «inventario» limpas).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'inventario-tela'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'cidade';
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | inventario-tela ${name} | ${info}`); if (!cond) fails.push(name.split(' ')[0]); };
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000 }); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  const r0 = await E(w => {
    const T = window.__T = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      enter(v) { if (!G.Modes.enter(v)) return false; return T.until(() => G.Modes.state === 'INC', 300) >= 0; },
      key(k, up) { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); if (up !== false) window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); },
      shown: sel => { const e = document.querySelector(sel); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; },
      mid(sel) { const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; },
      fp() { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + JSON.stringify(G.S.rng); },
      qk: e => e.sys + '|' + e.msg.replace(/#\d+/g, '#'),
      novas: () => QA.check().filter(e => (e.sev <= 2 && !T.base.has(T.qk(e))) || e.sys === 'inventario').map(e => `[S${e.sev}] ${e.sys}: ${e.msg}`),
      god(f) { G.inSim++; try { return f(); } finally { G.inSim--; } },
      // (a finger's tap on an element: the pointer events and the click a phone's browser sends)
      tap(el) { const [x, y] = T.mid(el); const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 }; el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y })); },
      keyOf: kind => Object.keys(G.Inv.bag(G.Possess.body())).find(k => G.Itens.parse(k)[0] === kind) || null,
      cell: k => document.querySelector(`#inv-panel .iv-cell .ic[data-k="${k}"]`),
      // (a tile of open ground beside a building, where the body stands at its walls)
      by(b) { const W = G.W, S = G.S; for (let d = 1; d <= 3; d++) for (let y = b.y - d; y < b.y + b.h + d; y++) for (let x = b.x - d; x < b.x + b.w + d; x++) { if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) continue; if (W.inb(x + 0.5, y + 0.5) && W.walkableXY(x + 0.5, y + 0.5) && !S.occ[W.idx(x + 0.5, y + 0.5)]) return [x + 0.5, y + 0.5]; } return null; },
    };
    G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    for (let t = 0; t < G.DAY_LEN * 20 && (G.S.time < 0.1 || G.S.time > 0.5); t++) G.debug.step(0.05);
    for (let t = 0; t < 200; t++) G.debug.step(0.05);
    T.base = new Set(QA.check().filter(e => e.sev <= 3).map(T.qk));
    // (someone of a town with a store, whose trade carries nothing — the bag starts empty —, at the store's door, with tools,
    // weapons and the bronze there: the test's hand sets the scene)
    const S = G.S; let v = null, st = null;
    for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
      const b = G.Village.dropoffs(set.id).sort((x, y) => x.id - y.id)[0]; if (!b) continue;
      const o = [...S.villagers.values()].filter(x => x.set === set.id && x.age >= 18 && x.age < 55 && !x.inside && G.Possess.can(x).ok && !Object.values(G.Inv.trade(x)).some(q => typeof q === 'string')).sort((x, y) => x.id - y.id)[0];
      if (o) { v = o; st = b; break; }
    }
    if (!v) return { none: 'ninguém numa cidade com armazém' };
    const fid = G.Fac.idOfV(v);
    T.god(() => { const f = G.Fac.get(fid); if (!f.tech.known.bronze) G.Civ.learn(f, 'bronze', 'divina'); G.Depot.make('f:' + fid, 'ferramentas', 4, { code: 'teste', part: true }); G.Depot.make('f:' + fid, 'armas', 4, { code: 'teste', part: true }); });
    const entered = T.enter(v); const p = T.by(st); const placed = !!p && G.Avatar.place(p[0], p[1]); T.f(10);
    T.v = v; T.st = st;
    return { who: `${v.name} (${v.role})`, entered, placed, near: !!G.Inv.storeNear(v), store: `${st.type}#${st.id}` };
  }, WORLD);
  if (r0.none) { ok('t1 abrir', false, r0.none); await browser.close(); process.exit(1); }
  // ================================ t1: open, the bar, the store, close
  const r1 = await E(() => {
    const T = window.__T, S = G.S; const out = {};
    out.bar = document.querySelectorAll('#inc-hud .ih-hotbar .iv-q').length;
    T.key('i'); T.f(4);
    out.open = T.shown('#inv-panel') && G.Modes.panelIs('mochila') && G.InvUI.isOpen();
    out.store = document.querySelectorAll('#inv-panel .iv-store [data-a="make"]').length;
    // (the body held still, the world going on: W held down does not walk it)
    const p0 = G.Avatar.pos(); const c0 = S.clock; T.key('w', false); T.f(15); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' })); const p1 = G.Avatar.pos();
    out.still = Math.hypot(p1.X - p0.X, p1.Z - p0.Z) < 0.05; out.world = S.clock > c0;
    // (from the store: a sword, a shield, an axe, a helmet — the store's buttons, clicked)
    for (const kd of ['espada', 'escudo', 'machado', 'elmo']) { const b = document.querySelector(`#inv-panel [data-a="make"][data-kind="${kd}"]`); if (b && !b.disabled) b.click(); T.f(4); }
    out.bag = Object.keys(G.Inv.bag(T.v));
    out.cells = document.querySelectorAll('#inv-panel .iv-cell .ic[data-k]').length;
    return out;
  });
  await shot('inventario-pc-aberto');
  const r1b = await E(() => {
    const T = window.__T; const out = {};
    T.key('i'); T.f(3); out.closedI = !T.shown('#inv-panel') && !G.Modes.panelIs('mochila');
    T.key('i'); T.f(3); T.key('Escape'); T.f(3); out.closedEsc = !T.shown('#inv-panel') && !G.Modes.panel() && !G.Modes.menuOpen();
    T.key('i'); T.f(3); T.key('e'); T.f(3); out.closedE = !T.shown('#inv-panel');
    return out;
  });
  ok('t1 a tecla I abre a mochila: o corpo parado, o mundo andando; a barra; o armazém; I, Esc e E fecham', r1.bar === 6 && r1.open && r1.store > 4 && r1.still && r1.world && r1.bag.length === 4 && r1.cells === 4 && r1b.closedI && r1b.closedEsc && r1b.closedE,
    `${r0.who} no ${r0.store} (posto ${r0.placed}, ao alcance ${r0.near}): barra ${r1.bar} botões; aberta ${r1.open}; ${r1.store} coisas do armazém; parado ${r1.still}, o mundo andou ${r1.world}; a mochila ${r1.bag.join(', ')} (${r1.cells} na grade); fecha com I ${r1b.closedI}, Esc ${r1b.closedEsc}, E ${r1b.closedE}`);

  // ================================ t2: the mouse drags
  const mid = async sel => page.evaluate(s => window.__T.mid(s), sel);
  const drag = async (from, to) => { const a = await mid(from), b = await mid(to); if (!a || !b) return false; await page.mouse.move(a[0], a[1]); await page.mouse.down(); for (let k = 1; k <= 6; k++) await page.mouse.move(a[0] + (b[0] - a[0]) * k / 6, a[1] + (b[1] - a[1]) * k / 6); await page.mouse.up(); await E(() => window.__T.f(4)); return true; };
  await E(() => { window.__T.key('i'); window.__T.f(4); });
  const K = await E(() => ({ sw: window.__T.keyOf('espada'), sh: window.__T.keyOf('escudo'), ax: window.__T.keyOf('machado'), hm: window.__T.keyOf('elmo') }));
  const eq = () => E(() => G.Inv.equipOf(G.Possess.body()));
  await drag(`#inv-panel .iv-cell .ic[data-k="${K.sw}"]`, '#inv-panel .iv-slot[data-drop="slot:mao"]'); const e1 = await eq();
  await drag(`#inv-panel .iv-cell .ic[data-k="${K.sh}"]`, '#inv-panel .iv-slot[data-drop="slot:outra"]'); const e2 = await eq();
  await drag(`#inv-panel .iv-cell .ic[data-k="${K.hm}"]`, '#inv-panel .iv-slot[data-drop="slot:cabeca"]'); const e2b = await eq();
  await shot('inventario-pc-equipado');
  const ax = await mid(`#inv-panel .iv-cell .ic[data-k="${K.ax}"]`); if (ax) { await page.mouse.dblclick(ax[0], ax[1]); await E(() => window.__T.f(4)); } const e3 = await eq();
  await drag(`#inv-panel .iv-slot[data-drop="slot:mao"] .ic`, '#inv-panel .iv-grid'); const e4 = await eq();
  await drag(`#inv-panel .iv-cell .ic[data-k="${K.ax}"]`, '#inv-panel .iv-zone[data-drop="chao"]'); const g1 = await E(k => ({ ground: (G.S.loose || []).filter(o => o.k === k).length, bag: G.Inv.count(G.Possess.body(), k), btn: document.querySelectorAll('#inv-panel [data-a="pick"]').length }), K.ax);
  await E(() => { const b = document.querySelector('#inv-panel [data-a="pick"]'); if (b) b.click(); window.__T.f(4); }); const g2 = await E(k => G.Inv.count(G.Possess.body(), k), K.ax);
  ok('t2 no PC, arrastando: a espada na mão, o escudo na outra, o elmo na cabeça; o clique duplo; de volta à mochila; ao chão e de volta', e1.mao === K.sw && e2.outra === K.sh && e2b.cabeca === K.hm && e3.mao === K.ax && e3.cinto === K.sw && !e4.mao && g1.ground === 1 && g1.bag === 0 && g1.btn >= 1 && g2 === 1,
    `mão ${e1.mao}; outra ${e2.outra}; cabeça ${e2b.cabeca}; o clique duplo no machado: mão ${e3.mao}, cinto ${e3.cinto}; de volta à mochila: mão ${e4.mao}; no chão ${g1.ground} (mochila ${g1.bag}, botão ${g1.btn}); pegado de volta ${g2}`);

  // ================================ t3: the fingers tap
  await page.setViewportSize({ width: 390, height: 844 }); await E(() => window.__T.f(4));
  const r3 = await E(k => {
    const T = window.__T; const out = {}; G.Input3D.touch = true; T.f(6);
    // (the sword back to the bag first, by the card's button: the place empty)
    if (G.Inv.equipOf(G.Possess.body()).cinto === k.sw) { const s = document.querySelector('#inv-panel .iv-slot[data-drop="slot:cinto"] .ic'); if (s) T.tap(s); T.f(2); const g = document.querySelector('#inv-panel .iv-grid'); T.tap(g); T.f(4); }
    out.before = G.Inv.equipOf(G.Possess.body()).mao;
    const c = T.cell(k.sw); if (c) T.tap(c); T.f(3);
    out.lit = [...document.querySelectorAll('#inv-panel .iv-slot.can')].map(e => e.dataset.drop.slice(5));
    const s = document.querySelector('#inv-panel .iv-slot[data-drop="slot:mao"]'); if (s) T.tap(s); T.f(4);
    out.after = G.Inv.equipOf(G.Possess.body()).mao;
    return out;
  }, K);
  await shot('inventario-celular');
  await page.setViewportSize({ width: 1280, height: 760 }); await E(() => { G.Input3D.touch = false; window.__T.f(4); });
  ok('t3 no celular, tocando: um toque escolhe (os lugares acendem), outro toque põe no lugar', r3.after === K.sw && r3.lit.includes('mao') && r3.lit.includes('cinto') && !r3.lit.includes('cabeca'),
    `antes ${r3.before}; escolhida a espada, acendem ${r3.lit.join(', ')}; depois do toque na mão: ${r3.after}`);

  // ================================ t4: the bar of quick things
  await drag(`#inv-panel .iv-cell .ic[data-k="${K.ax}"]`, '#inc-hud .ih-hotbar [data-q="1"]');
  const q1 = await E(() => G.Inv.equipOf(G.Possess.body()).atalhos);
  const hm = await mid(`#inv-panel .iv-cell .ic[data-k="${K.hm}"], #inv-panel .iv-slot .ic[data-k="${K.hm}"]`); if (hm) await page.mouse.move(hm[0], hm[1]);
  await E(() => { window.__T.key('3'); window.__T.f(4); }); const q2 = await E(() => G.Inv.equipOf(G.Possess.body()).atalhos);
  const r4 = await E(k => {
    const T = window.__T; const out = {}; T.key('i'); T.f(3); out.closed = !G.InvUI.isOpen();
    // (the keys' hint of the first seconds of a life sits where the bar does: the bar waits for it, then comes in)
    const bar = document.querySelector('#inc-hud .ih-hotbar'), hint = document.querySelector('#inc-hud .ih-hint');
    out.waited = !hint || hint.classList.contains('hidden') || bar.classList.contains('later');
    T.until(() => !hint || hint.classList.contains('hidden'), 220, 100); T.f(6); out.came = !bar.classList.contains('later') && getComputedStyle(bar).display !== 'none';
    T.key('2'); T.f(4); out.a = G.Inv.equipOf(G.Possess.body()).mao;
    T.key('2'); T.f(4); out.b = G.Inv.equipOf(G.Possess.body()).mao;
    const b = document.querySelector('#inc-hud .ih-hotbar [data-q="1"]'); if (b) b.click(); T.f(4); out.c = G.Inv.equipOf(G.Possess.body()).mao;
    out.on = !!document.querySelector('#inc-hud .ih-hotbar [data-q="1"].on');
    const bag = document.querySelector('#inc-hud .ih-hotbar [data-a="bag"]'); if (bag) bag.click(); T.f(3); out.bagOpens = G.InvUI.isOpen(); T.key('i'); T.f(3);
    return out;
  }, K);
  await shot('inventario-barra');
  ok('t4 a barra de atalhos: arrastar para o atalho, o mouse e a tecla, a tecla na mão e guardada, o botão do atalho, o botão da mochila; a barra espera a dica das teclas', q1[1] === K.ax && q2[2] === K.hm && r4.closed && r4.a === K.ax && r4.b !== K.ax && r4.c === K.ax && r4.on && r4.bagOpens && r4.waited && r4.came,
    `atalhos ${JSON.stringify(q1)} → ${JSON.stringify(q2)}; a tecla 2: ${r4.a}, de novo ${r4.b}; o botão do atalho: ${r4.c} (aceso ${r4.on}); o botão da mochila abre ${r4.bagOpens}; com a dica das teclas a barra esperou ${r4.waited}, depois veio ${r4.came}`);

  // ================================ t5: the screen does not change the world; another panel over it
  const r5 = await E(() => {
    const T = window.__T; const out = {};
    T.key('i'); T.f(3); G.Modes.menu(true); T.f(2); const f0 = T.fp(); const c0 = G.S.clock;
    for (let k = 0; k < 30; k++) { G.InvUI.frame(1); T.f(1); }
    const f1 = T.fp(); out.same = f0 === f1 && G.S.clock === c0; G.Modes.menu(false); T.f(2);
    if (!G.InvUI.isOpen()) { T.key('i'); T.f(3); }
    T.key('j'); T.f(4); out.diary = G.Modes.panelIs('diario') && !G.InvUI.isOpen() && !T.shown('#inv-panel');
    G.IncUI.closeAll(); G.Modes.setPanel(null); T.f(3);
    out.qa = T.novas(); out.err = JSON.stringify(G.modErr);
    return out;
  });
  ok('t5 a tela não muda o mundo sozinha; o diário por cima fecha a mochila', r5.same && r5.diary, `mundo parado: o estado canônico ${r5.same ? 'igual' : 'MUDOU'}; o diário por cima: ${r5.diary}`);
  ok('o verificador sem nada novo, nenhum erro de módulo', !r5.qa.length && r5.err === '{}', r5.qa.length ? r5.qa.slice(0, 4).join(' | ') : `limpo; módulos ${r5.err}`);
  ok('nenhum erro de página nem de console', !errs.length, errs.length ? [...new Set(errs)].slice(0, 4).join(' || ') : 'nenhum');
  await browser.close();
  console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'tudo passou'); console.log('fotos em ' + OUT);
  process.exit(fails.length ? 1 : 0);
})();
