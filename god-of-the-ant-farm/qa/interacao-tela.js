// interacao-tela: bash qa/navegador.sh node qa/interacao-tela.js [pasta das fotos] [mundo] — a interação do corpo com o ambiente
// (20e; D-395 a D-409) no navegador, com o 3D de verdade (WebGL sem GPU — é lento). As regras são provadas em Node pelo
// qa/interacao.js; aqui, o que se vê e o que as mãos do jogador fazem:
//  w1 o destaque firme: diante de duas coisas no chão e de uma pessoa, a marca do 3D (Mira3D) fica numa só, entra suave e não pisca
//     com o corpo parado; girando devagar de uma à outra, troca poucas vezes, nunca indo e voltando;
//  w2 os verbos na dica: o E e o que ele faz; o F e o que ele faz; o E segurado (o anel), presos ao alvo na tela (ou no rodapé);
//  w3 o F: «Examinar» abre o cartão da coisa;
//  w4 o anel do segurar: o E segurado enche o anel e, ao fim, pega e segura na mão; um toque curto do E só pega (na mochila);
//  w5 a troca de alvo: a roda do mouse vai à próxima e volta; com um alvo só, a roda é o zoom; a cruz do controle (← →) troca sem
//     usar o atalho; um toque do dedo no alvo o escolhe;
//  w6 a tela dos guardados no PC: o F no armazém do povo a abre (o mouse solto, o corpo parado), o que está atrás some, o painel é
//     opaco; arrastar do armazém para a mochila faz uma ferramenta do que ele tem; o clique duplo devolve; Esc fecha e o mouse volta;
//  w7 a tela dos guardados no celular: um toque escolhe, outro toque no outro lado faz; e dar a alguém pelo F;
//  w8 a tela não muda o mundo sozinha (com o mundo parado, os quadros dela não mudam o estado canônico nem o acaso); o verificador
//     sem nada novo (as regras «interacao» limpas); nenhum erro de página, de console nem de módulo (nem um clipe recusado).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'interacao-tela'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'cidade';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  console.log('(abrindo o jogo: ' + new Date().toISOString().slice(11, 19) + ')');
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | interacao-tela ${name} | ${info}`); if (!cond) fails.push(name.split(' ')[0]); };
  // (the photo as the game shows it a moment later: a panel's fade-in finished — with the frames driven by hand, the browser starts
  // a CSS animation only at the frame of the photo, and the panel came out at the first frame of its fade, see-through: T-1433)
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000, animations: 'disabled' }); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  const r0 = await E(w => {
    const T = window.__T = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      enter(v) { if (!G.Modes.enter(v)) return false; return T.until(() => G.Modes.state === 'INC', 300) >= 0; },
      key(k, up) { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); if (up !== false) window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); },
      keyUp(k) { window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); },
      shown: sel => { const e = document.querySelector(sel); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'; },
      txt: sel => { const e = document.querySelector(sel); return e ? e.textContent : ''; },
      mid(sel) { const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; },
      fp() { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + JSON.stringify(G.S.rng); },
      qk: e => e.sys + '|' + e.msg.replace(/#\d+/g, '#'),
      novas: () => QA.check().filter(e => (e.sev <= 2 && !T.base.has(T.qk(e))) || e.sys === 'interacao').map(e => `[S${e.sev}] ${e.sys}: ${e.msg}`),
      god(f) { G.inSim++; try { return f(); } finally { G.inSim--; } },
      tap(el) { const [x, y] = T.mid(el); const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0 }; el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); el.dispatchEvent(new MouseEvent('click', o)); },
      // (an open tile of ground about a point, tiles)
      open(x, y, r0) { const W = G.W, S = G.S; for (let d = r0 || 0; d < 14; d++) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const px = Math.floor(x + Math.cos(a) * d) + 0.5, py = Math.floor(y + Math.sin(a) * d) + 0.5; if (W.inb(px, py) && W.walkableXY(px, py) && !S.occ[W.idx(px, py)] && !S.treeAt[W.idx(px, py)] && !S.objAt[W.idx(px, py)]) return [px, py]; } return null; },
      // (the body at a point, tiles, turned to another — the camera behind it)
      at(x, y, fx, fy) { if (!G.Avatar.place(x, y)) return false; T.f(3); const b = G.Avatar.state(); b.yaw = Math.atan2(fy - y, fx - x); G.Cam3D.yaw = b.yaw; T.f(4); return true; },
      gift(k, n) { const v = G.Possess.body(); T.god(() => G.Depot.make('m:' + v.id, k, n || 1, { code: 'teste', by: v.id })); },
      ask(f) { const it = G.Possess.apply(f); T.f(2); return it.res || { ok: false, why: 'sem resposta' }; },
      // (those about a point sent off — those who would be the target instead —, and back after)
      aside: [], clear(x, y, R, keep) { T.god(() => { for (const o of G.S.villagers.values()) if (!keep.includes(o.id) && !o.inside && G.dist(o.x, o.y, x, y) < R) { T.aside.push([o, o.x, o.y]); o.x += 40; o.y += 40; } for (const a of G.S.animals.values()) if (G.dist(a.x, a.y, x, y) < R) { T.aside.push([a, a.x, a.y]); a.x += 40; a.y += 40; } }); },
      back() { T.god(() => { for (const [o, x, y] of T.aside) { o.x = x; o.y = y; } }); T.aside = []; },
      aim: () => G.IncUI.aim(),
    };
    G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    for (let t = 0; t < G.DAY_LEN * 20 && (G.S.time < 0.1 || G.S.time > 0.5); t++) G.debug.step(0.05);
    for (let t = 0; t < 200; t++) G.debug.step(0.05);
    T.base = new Set(QA.check().filter(e => e.sev <= 3).map(T.qk));
    const S = G.S; let v = null, st = null;
    for (const set of [...S.settlements.values()].sort((a, b) => a.id - b.id)) {
      const b = G.Village.dropoffs(set.id).sort((x, y) => x.id - y.id)[0]; if (!b) continue;
      const o = [...S.villagers.values()].filter(x => x.set === set.id && x.age >= 18 && x.age < 55 && !x.inside && G.Possess.can(x).ok).sort((x, y) => x.id - y.id)[0];
      if (o) { v = o; st = b; break; }
    }
    if (!v) return { none: 'ninguém numa cidade com armazém' };
    const entered = T.enter(v); T.f(10); T.v = v; T.st = st; T.fid = G.Fac.idOfV(v);
    return { who: `${v.name} (${v.role})`, entered, store: `${st.type}#${st.id}`, clipErr: (G.Anim3D.clipErr || []).slice() };
  }, WORLD);
  if (r0.none || !r0.entered) { ok('w0 encarnar', false, r0.none || 'não entrou'); await browser.close(); process.exit(1); }
  console.log(`(${r0.who}, armazém ${r0.store})`);

  // ================================ the stage: two things on the ground before the body, someone a little to the side
  const r1 = await E(() => {
    const T = window.__T, S = G.S; const v = G.Possess.body(); const out = {};
    const p = T.open(T.st.x + 5, T.st.y + 5, 2); T.clear(p[0], p[1], 4, [v.id]); T.p = p;
    const k1 = G.Itens.keyOf('machado', 'pedra'), k2 = G.Itens.keyOf('faca', 'pedra'); T.k1 = k1; T.k2 = k2; T.gift(k1); T.gift(k2);
    G.Avatar.place(p[0] + 0.3, p[1] - 0.22); T.f(3); const a = T.ask(w => G.Inv.drop(w, k1, 1));
    G.Avatar.place(p[0] + 0.3, p[1] + 0.22); T.f(3); const b = T.ask(w => G.Inv.drop(w, k2, 1));
    T.g1 = a.g; T.g2 = b.g; T.at(p[0], p[1], p[0] + 1, p[1]); T.f(20);
    // (the mark: one, coming in, firm while the body stands still)
    const keys = []; const ks = []; for (let k = 0; k < 60; k++) { T.f(1); const A = T.aim(); keys.push(A.key); const sl = G.Mira3D.slots(); ks.push(sl.filter(s => s.dir > 0).length); }
    out.keys = [...new Set(keys)]; out.coming = Math.max(...ks); out.slots = G.Mira3D.slots(); out.cands = T.aim().cands.map(c => c.label);
    out.hooked = G.Mira3D.hooked();
    return out;
  });
  await shot('interacao-destaque');
  if (on('w1')) {
    // (turning slowly from the left thing to the right one: how many times the mark changes, and whether it ever goes back)
    const r1b = await E(() => {
      const T = window.__T; const b = G.Avatar.state(); const y0 = b.yaw; const seq = [];
      for (let k = 0; k <= 50; k++) { b.yaw = y0 - 0.9 + 1.8 * k / 50; G.Cam3D.yaw = b.yaw; T.f(2); const A = T.aim(); if (!seq.length || seq[seq.length - 1] !== A.key) seq.push(A.key); }
      b.yaw = y0; G.Cam3D.yaw = y0; T.f(6); return { seq, back: seq.some((k, i) => i > 1 && k === seq[i - 2]) };
    });
    ok('w1 o destaque firme: uma marca só, que entra suave e não pisca parada; girando, troca poucas vezes e nunca volta', r1.hooked && r1.keys.length === 1 && r1.coming === 1 && r1.slots.some(s => s.dir > 0 && s.k > 0.95 && s.parts > 0) && r1b.seq.length <= 4 && !r1b.back,
      `ao alcance: ${r1.cands.join(' · ')}; parado 60 quadros: ${r1.keys.length} alvo(s), marca ${JSON.stringify(r1.slots.map(s => [s.kind, s.k, s.parts]))}; girando: ${r1b.seq.length} trocas ${r1b.back ? '(VOLTOU)' : ''}`);
  }
  // ================================ w2: the verbs on the prompt, by the target
  if (on('w2')) {
    const r2 = await E(() => {
      const T = window.__T; T.f(6); const A = T.aim(); const pr = document.querySelector('#inc-hud .ih-prompt');
      return { e: T.txt('#inc-hud .ih-prompt span'), f: T.shown('#inc-hud .ih-prompt .ih-alt') ? T.txt('#inc-hud .ih-prompt .ih-alt b') : '', h: T.shown('#inc-hud .ih-prompt .ih-hold') ? T.txt('#inc-hud .ih-prompt .ih-hold b') : '', cyc: T.shown('#inc-hud .ih-prompt .ih-cyc') ? T.txt('#inc-hud .ih-prompt .ih-cyc') : '', at: pr.classList.contains('at'), verbs: A.verbs, x: A.x, y: A.y };
    });
    await shot('interacao-dica');
    ok('w2 os verbos na dica: o E, o F e o E segurado, presos ao alvo na tela', /^Pegar /.test(r2.e) && /^Examinar /.test(r2.f) && /^Pegar e segurar /.test(r2.h) && /de 2/.test(r2.cyc),
      `«E ${r2.e}» · «F ${r2.f}» · «segurar ${r2.h}» · «${r2.cyc}»; ${r2.at ? `presa ao alvo em ${Math.round(r2.x)}, ${Math.round(r2.y)}` : 'no rodapé (o alvo fora da tela)'}`);
  }
  // ================================ w3: F
  if (on('w3')) {
    const r3 = await E(() => { const T = window.__T; T.key('f'); T.f(3); const o = { card: T.shown('#inc-card'), h3: T.txt('#inc-card h3') }; T.key('e'); T.f(3); o.closed = !T.shown('#inc-card'); return o; });
    ok('w3 o F: «Examinar» abre o cartão da coisa; o E fecha', r3.card && /machado|faca/i.test(r3.h3) && r3.closed, `cartão «${r3.h3}», fechou ${r3.closed}`);
  }
  // ================================ w4: the ring of E held; a tap
  if (on('w4')) {
    const r4 = await E(() => {
      const T = window.__T; const v = G.Possess.body(); const out = {}; T.at(T.p[0], T.p[1], T.p[0] + 1, T.p[1]); T.f(8);
      const k = T.aim().cands.find(c => c.key === T.aim().key); out.target = k ? k.label : '-'; const key0 = T.aim().key;
      T.key('e', false); T.f(5); const pr = document.querySelector('#inc-hud .ih-prompt'); out.ring1 = +getComputedStyle(pr).getPropertyValue('--hold') || 0; out.holding = pr.classList.contains('holding');
      T.f(12); out.ring2 = G.IncUI.holding(); T.keyUp('e'); T.until(() => !G.Avatar.busy(), 200); T.f(4);
      out.held = G.Inv.held(v).mao; out.key0 = key0;
      // (and a tap of E on the other one: picked into the bag, not held)
      T.at(T.p[0], T.p[1], T.p[0] + 1, T.p[1]); T.f(8); const before = G.Inv.equipOf(v).mao; const gone0 = (G.S.loose || []).length;
      T.key('e'); T.until(() => !G.Avatar.busy(), 200); T.f(4); out.tapHeld = G.Inv.equipOf(v).mao === before; out.tapPicked = (G.S.loose || []).length < gone0;
      out.bag = Object.keys(G.Inv.bag(v));
      return out;
    });
    await shot('interacao-anel');
    ok('w4 o anel do segurar: segurado, o anel enche e, ao fim, pega e segura na mão; um toque curto só pega', r4.holding && r4.ring1 > 0 && r4.ring1 < 1 && !!r4.held && r4.tapHeld && r4.tapPicked,
      `«${r4.target}»: o anel em ${r4.ring1.toFixed(2)} (segurando ${r4.holding}), na mão ${r4.held}; o toque: pegou ${r4.tapPicked}, a mão igual ${r4.tapHeld}; mochila ${r4.bag.join(', ')}`);
  }
  // ================================ w5: switching
  if (on('w5')) {
    const r5 = await E(() => {
      const T = window.__T; const v = G.Possess.body(); const out = {};
      // (two things again before the body)
      for (const k of [T.k1, T.k2]) if (!G.Inv.count(v, k)) T.gift(k);
      if (G.Inv.equipOf(v).mao) T.ask(w => G.Inv.unequip(w, 'mao'));
      G.Avatar.place(T.p[0] + 0.3, T.p[1] - 0.22); T.f(3); T.ask(w => G.Inv.drop(w, T.k1, 1)); G.Avatar.place(T.p[0] + 0.3, T.p[1] + 0.22); T.f(3); T.ask(w => G.Inv.drop(w, T.k2, 1));
      T.at(T.p[0], T.p[1], T.p[0] + 1, T.p[1]); T.f(8);
      const cv = G.Realm.canvas(); const wheel = d => { cv.dispatchEvent(new WheelEvent('wheel', { deltaY: d, bubbles: true, cancelable: true })); T.f(3); };
      const k0 = T.aim().key; wheel(100); const k1 = T.aim().key; wheel(100); const k2 = T.aim().key; wheel(-100); const k3 = T.aim().key;
      out.wheel = [k0, k1, k2, k3]; out.n = T.aim().cands.length;
      // (the controller: → of the cross switches, and the quick thing of 2 is not used)
      const eq0 = JSON.stringify(G.Inv.equipOf(v)); const pad = { id: 'prova', connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      G.Input3D.fakePad(pad); T.f(2); const kp0 = T.aim().key; pad.buttons[15] = { pressed: true, value: 1 }; T.f(2); pad.buttons[15] = { pressed: false, value: 0 }; T.f(3); const kp1 = T.aim().key;
      out.pad = [kp0, kp1]; out.padEq = JSON.stringify(G.Inv.equipOf(v)) === eq0; G.Input3D.fakePad(null); T.f(2); G.Input3D.device = 'kb';
      // (a finger's tap on the other one, where it is drawn)
      const other = G.IncUI.cands().find(c => c.key !== T.aim().key); let tapped = '-';
      if (other) { const P = G.Mira3D.pointOf(other); const q = new THREE.Vector3(P.X, P.Y, P.Z).project(G.Realm.camera()); G.IncUI.tapAt((q.x * 0.5 + 0.5) * innerWidth, (-q.y * 0.5 + 0.5) * innerHeight); T.f(3); tapped = T.aim().key === other.key ? 'escolhido' : 'NÃO'; }
      out.tap = tapped;
      // (one thing only: the wheel is the eye's zoom)
      T.at(T.p[0] - 3, T.p[1] - 3, T.p[0] - 4, T.p[1] - 3); T.f(8); const n1 = T.aim().cands.length; const d0 = G.Cam3D.dist; wheel(100); out.zoom = { n: n1, d0, d1: G.Cam3D.dist };
      return out;
    });
    ok('w5 a troca de alvo: a roda vai e volta; a cruz do controle troca sem usar o atalho; o toque escolhe; sozinha, a roda é o zoom', r5.n >= 2 && r5.wheel[1] !== r5.wheel[0] && r5.wheel[3] === r5.wheel[1] && r5.pad[1] !== r5.pad[0] && r5.padEq && r5.tap === 'escolhido' && (r5.zoom.n >= 2 || r5.zoom.d1 !== r5.zoom.d0),
      `${r5.n} ao alcance; a roda ${r5.wheel.map(k => k.split(':')[1]).join(' → ')}; a cruz ${r5.pad.map(k => k.split(':')[1]).join(' → ')} (o equipamento igual: ${r5.padEq}); o toque: ${r5.tap}; sozinha (${r5.zoom.n} alvo): a distância do olho ${r5.zoom.d0.toFixed(2)} → ${r5.zoom.d1.toFixed(2)}`);
  }
  await E(() => window.__T.back());
  // ================================ w6: the screen of what is kept, on a PC
  const mid = async sel => page.evaluate(s => window.__T.mid(s), sel);
  const drag = async (from, to) => { const a = await mid(from), b = await mid(to); if (!a || !b) return false; await page.mouse.move(a[0], a[1]); await page.mouse.down(); for (let k = 1; k <= 6; k++) await page.mouse.move(a[0] + (b[0] - a[0]) * k / 6, a[1] + (b[1] - a[1]) * k / 6); await page.mouse.up(); await E(() => window.__T.f(4)); return true; };
  let K6 = null;
  if (on('w6') || on('w7')) {
    const r6 = await E(() => {
      const T = window.__T; const v = G.Possess.body(); const out = {}; const st = T.st; const fid = T.fid;
      T.god(() => { const f = G.Fac.get(fid); for (const g of ['stone', 'wood']) if ((f.stock[g] || 0) < 10) G.Depot.make('f:' + fid, g, 10, { code: 'teste', part: true }); });
      const d = G.Vg.door(st); T.at(d[0], d[1], st.x + st.w / 2, st.y + st.h / 2); T.f(10);
      const b = G.IncUI.best(); out.best = b ? b.id + ' ' + b.label : '-'; const o = b ? G.Interact.offer(b) : null; out.f = o ? (o.verbs.find(x => x.k === 'outra') || {}).label : '-';
      T.key('f'); T.f(4);
      out.open = T.shown('#guard-panel') && G.Modes.panelIs('guardados') && G.GuardUI.isOpen(); out.spec = G.GuardUI.spec();
      out.behind = document.querySelector('#inc-root').classList.contains('panel-on') && !T.shown('#inc-hud .ih-prompt') && !T.shown('#inc-hud .ih-news');
      out.bg = getComputedStyle(document.querySelector('#guard-panel')).backgroundColor;
      // (and once its fade-in is over — as a moment later in the game —, the whole panel solid: nothing of the screen behind it through it)
      { const gp = document.querySelector('#guard-panel'); for (const an of gp.getAnimations()) an.finish(); out.op = getComputedStyle(gp).opacity; }
      out.cells = document.querySelectorAll('#guard-panel [data-side="other"]').length;
      out.pick = G.Itens.keyOf('picareta', 'pedra'); out.bag0 = G.Inv.count(v, out.pick);
      return out;
    });
    await shot('interacao-guardados-pc');
    K6 = r6;
    if (on('w6')) {
      const ok1 = await drag(`#guard-panel [data-side="other"][data-k="${r6.pick}"]`, '#guard-panel .gd-side[data-drop="bag"]');
      const r6b = await E(k => ({ bag: G.Inv.count(G.Possess.body(), k) }), r6.pick);
      const pb = await mid(`#guard-panel [data-side="bag"][data-k="${r6.pick}"]`); if (pb) { await page.mouse.dblclick(pb[0], pb[1]); await E(() => window.__T.f(4)); }
      const r6c = await E(k => { const T = window.__T; const o = { bag: G.Inv.count(G.Possess.body(), k) }; T.key('Escape'); T.f(3); o.closed = !T.shown('#guard-panel') && !G.Modes.panel(); o.want = G.Input3D.wantsLock(); return o; }, r6.pick);
      ok('w6 a tela dos guardados no PC: o F no armazém a abre, o que está atrás some, o painel opaco; arrastar faz a ferramenta do que o armazém tem, o clique duplo devolve, Esc fecha', r6.open && r6.behind && /rgb\(15, 13, 19\)/.test(r6.bg) && r6.op === '1' && r6.cells > 3 && ok1 && r6b.bag === r6.bag0 + 1 && r6c.bag === r6.bag0 && r6c.closed,
        `diante de «${r6.best}», F «${r6.f}»: aberta ${r6.open} (${JSON.stringify(r6.spec)}), atrás escondido ${r6.behind}, fundo ${r6.bg} (opacidade ${r6.op}), ${r6.cells} coisas do armazém; arrastada a picareta: ${r6.bag0} → ${r6b.bag}; o clique duplo: → ${r6c.bag}; Esc fechou ${r6c.closed}`);
    }
  }
  // ================================ w7: the screen on a phone; giving by F
  if (on('w7') && K6) {
    await page.setViewportSize({ width: 390, height: 844 });
    const r7 = await E(k => {
      const T = window.__T; const v = G.Possess.body(); const out = {}; G.Input3D.touch = true; G.Input3D.device = 'touch';
      if (!G.GuardUI.isOpen()) { T.key('f'); T.f(4); }
      out.open = G.GuardUI.isOpen(); const c = document.querySelector(`#guard-panel [data-side="other"][data-k="${k}"]`); const b0 = G.Inv.count(v, k);
      if (c) T.tap(c); T.f(2); const side = document.querySelector('#guard-panel .gd-side[data-drop="bag"]'); if (side) T.tap(side); T.f(4); out.moved = G.Inv.count(v, k) === b0 + 1;
      return out;
    }, K6.pick);
    await shot('interacao-guardados-celular');
    // (giving by F: someone beside the body, the screen with them on the other side, a tap and a tap)
    const r7b = await E(k => {
      const T = window.__T; const v = G.Possess.body(); const out = {}; T.key('Escape'); T.f(3);
      const o = [...G.S.villagers.values()].filter(x => x.id !== v.id && x.age >= 18 && !x.inside && !x.sleeping && !x.aboard && !x.held).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0];
      const p = T.open(v.x + 2, v.y + 2, 0); T.clear(p[0], p[1], 3, [v.id, o.id]); T.god(() => { G.Vg.endTask(o); G.Vg.setTask(o, { type: 'idle', wait: 40, pri: 0.3 }); o.x = p[0] + 0.3; o.y = p[1]; o.path = null; });
      T.at(p[0], p[1], o.x, o.y); T.f(8); const b = G.IncUI.best(); out.best = b ? b.label : '-';
      T.key('f'); T.f(4); out.open = G.GuardUI.isOpen() && (G.GuardUI.spec() || {}).kind === 'dar';
      const c = document.querySelector(`#guard-panel [data-side="bag"][data-k="${k}"]`); const o0 = G.Inv.count(o, k);
      if (c) T.tap(c); T.f(2); const side = document.querySelector('#guard-panel .gd-side[data-drop="other"]'); if (side) T.tap(side); T.f(6);
      out.given = G.Inv.count(o, k) === o0 + 1; out.who = o.name; T.key('Escape'); T.f(3); T.back();
      G.Input3D.touch = false; G.Input3D.device = 'kb'; return out;
    }, K6.pick);
    await page.setViewportSize({ width: 1280, height: 760 }); await E(() => window.__T.f(4));
    ok('w7 a tela dos guardados no celular: um toque escolhe, outro toque no outro lado faz; e dar a alguém pelo F', r7.open && r7.moved && r7b.open && r7b.given,
      `aberta ${r7.open}, tocou e pegou: ${r7.moved}; diante de «${r7b.best}»: a tela de dar ${r7b.open}, dado a ${r7b.who}: ${r7b.given}`);
  }
  // ================================ w8: the screen does not change the world; the checker; the errors
  const r8 = await E(() => {
    const T = window.__T; const out = {};
    const d = G.Vg.door(T.st); T.at(d[0], d[1], T.st.x + T.st.w / 2, T.st.y + T.st.h / 2); T.f(6); T.key('f'); T.f(4);
    G.Modes.menu(true); T.f(2); const f0 = T.fp(); const c0 = G.S.clock;
    for (let k = 0; k < 30; k++) { G.GuardUI.frame(1); G.IncUI.frame(0.033); T.f(1); }
    out.same = T.fp() === f0 && G.S.clock === c0; G.Modes.menu(false); T.f(2); T.key('Escape'); T.f(3);
    out.qa = T.novas(); out.err = JSON.stringify(G.modErr); out.clipErr = (G.Anim3D.clipErr || []).slice();
    return out;
  });
  ok('w8 a tela não muda o mundo sozinha', r8.same, `mundo parado: o estado canônico ${r8.same ? 'igual' : 'MUDOU'}`);
  ok('w8 o verificador sem nada novo, nenhum erro de módulo nem clipe recusado', !r8.qa.length && r8.err === '{}' && !r8.clipErr.length, r8.qa.length ? r8.qa.slice(0, 4).join(' | ') : `limpo; módulos ${r8.err}; clipes ${r8.clipErr.join(' · ') || 'sem erro'}`);
  ok('w8 nenhum erro de página nem de console', !errs.length, errs.length ? [...new Set(errs)].slice(0, 4).join(' || ') : 'nenhum');
  await browser.close();
  console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'tudo passou'); console.log('fotos em ' + OUT);
  process.exit(fails.length ? 1 : 0);
})();
