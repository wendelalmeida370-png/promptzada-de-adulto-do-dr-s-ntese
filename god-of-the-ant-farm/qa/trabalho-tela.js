// trabalho-tela: bash qa/navegador.sh node qa/trabalho-tela.js [pasta das fotos] [mundo] — os ofícios do corpo vistos (20g; D-425
// a D-433), no navegador, com o 3D de verdade (WebGL sem GPU — é lento). As regras são provadas em Node pelo qa/trabalho.js; aqui,
// o que se vê:
//  w1 o golpe de machado de cima: o corpo diante de uma árvore, com o machado da mochila (a mão da prova, T-1470) — o E corta; o
//     gesto desenhado é o clipe do ofício («machado»), o machado na mão (G.Inv.held e o que o 3D desenha), a outra mão no cabo;
//     as fotos do golpe em seis momentos, de lado (machado-1 … machado-6) e uma tira de todas (machado-tira);
//  w2 a tela do trabalho: o cartão no canto (o trabalho, a ferramenta com a figura e o material, a barra, o que falta, o que rende);
//     sem a ferramenta, o cartão e o E dizem por quê; a foto do cartão;
//  w3 a picareta na pedra e a rede na água: os gestos dos ofícios, a coisa na mão; as fotos;
//  w4 uma pessoa do mundo cortando: o mesmo clipe, a ferramenta do ato na mão (o kit); a foto;
//  e nenhum erro de página, de console nem de módulo; o verificador sem nada novo (o «trabalho» limpo).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'trabalho-tela'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'cidade';
const Q = process.env.Q || 'media';
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1100, height: +process.env.VH || 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | trabalho-tela ${name} | ${info}`); if (!cond) fails.push(name.split(' ')[0]); };
  const shots = [];
  const shot = async (name, clip) => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000, clip }); shots.push(name); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  const r0 = await E(([w, q]) => {
    const T = window.__T = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      enter(v) { if (!G.Modes.enter(v)) return false; return T.until(() => G.Modes.state === 'INC', 300) >= 0; },
      key(k, up) { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); if (up !== false) window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); },
      shown: sel => { const e = document.querySelector(sel); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; },
      qk: e => e.sys + '|' + e.msg.replace(/#\d+/g, '#'),
      novas: () => QA.check().filter(e => (e.sev <= 2 && !T.base.has(T.qk(e))) || (e.sys === 'trabalho' && !T.base.has(T.qk(e)))).map(e => `[S${e.sev}] ${e.sys}: ${e.msg}`),
      god(f) { G.inSim++; try { return f(); } finally { G.inSim--; } },
      give(v, key) { const m = G.Itens.def(key).mat, fid = G.Fac.idOfV(v); T.god(() => { if ((m === 'bronze' || m === 'ferro') && !G.Origem.had(fid, m)) G.Depot.make('f:' + fid, 'ferramentas', 1, { code: 'teste', of: m }); G.Depot.make('m:' + v.id, key, 1, { code: 'teste', by: v.id }); }); },
      clearBag(v) { T.god(() => { for (const k of Object.keys(G.Inv.bag(v))) { const n = G.Inv.count(v, k); if (n > 0) G.Depot.use('m:' + v.id, k, n, { code: 'teste', by: v.id }); } }); },
      // (the body a little off a thing, facing it — a walkable point r tiles from it)
      near(tx, ty, r) { for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r; if (!G.W.walkableXY(x, y)) continue; G.Avatar.place(x, y); T.f(4); const b = G.Avatar.state(); b.yaw = Math.atan2(ty * 4 - b.Z, tx * 4 - b.X); G.Avatar.input.camYaw = b.yaw; T.f(2); return true; } return false; },
      // (the eye from the side of the body, a few metres off, a little above)
      side(off, dist) { const b = G.Avatar.state(); G.Cam3D.OPT.follow = false; G.Cam3D.yaw = b.yaw + (off === undefined ? Math.PI / 2 : off); G.Cam3D.pitch = 0.12; G.Cam3D.dist = dist || 3.4; G.Cam3D.cur = G.Cam3D.dist; },
    };
    G.Realm.setQuality(q); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    for (let t = 0; t < G.DAY_LEN * 20 && (G.S.time < 0.12 || G.S.time > 0.45); t++) G.debug.step(0.05);
    T.base = new Set(QA.check().filter(e => e.sev <= 3).map(T.qk));
    const S = G.S;
    // (a tree of the land, grown, free, with walkable ground round it, away from the buildings)
    const tr = [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && t.size >= 0.9 && !t.claim && !t.chop && [...S.buildings.values()].every(b => Math.abs(b.x - t.x) > 4 || Math.abs(b.y - t.y) > 4)).sort((a, b) => a.id - b.id);
    const v = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && !o.sick && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
    if (!v || !tr.length) return { none: !v ? 'ninguém para viver' : 'nenhuma árvore' };
    if (!T.enter(v)) return { none: 'não entrou no corpo' };
    let t = null; for (const c of tr) if (T.near(c.x, c.y, 0.42)) { t = c; break; }
    if (!t) return { none: 'nenhuma árvore com chão ao lado' };
    T.v = v; T.tr = t; T.clearBag(v); v.carry = null; T.f(20);
    G.IncUI.setHud && G.IncUI.setHud(true, true);
    return { who: `${v.name} (${v.role})`, tree: `${t.kind}#${t.id}` };
  }, [WORLD, Q]);
  if (r0.none) { ok('w1 o golpe de machado', false, r0.none); await browser.close(); process.exit(1); }

  // ================================ w2 first: the card without the axe
  const r2a = await E(() => {
    const T = window.__T; T.f(8); const best = G.IncUI.best(); const card = document.querySelector('#inc-hud .ih-work');
    return { best: best ? best.label + (best.ok ? '' : ' — ' + best.why) : null, card: card && !card.classList.contains('hidden') ? card.innerText.replace(/\s+/g, ' ') : null };
  });
  await shot('trabalho-sem-machado');
  // ================================ w1: the axe stroke, in six moments
  const r1 = await E(() => {
    const T = window.__T, v = T.v; T.give(v, 'machado.bronze'); T.f(6); T.side(); T.f(4);
    const best = G.IncUI.best(); const out = { best: best ? best.label : null };
    G.IncUI.use(); T.f(1); const a = G.Avatar.actNow(); out.anim = a ? a.anim : null; out.vact = v.act;
    // (to the moment before the first contact of the next strokes: the photos are taken as the stroke goes by)
    out.held = G.Inv.held(v).mao; out.look = G.People3D && G.People3D.look ? (G.People3D.look(v).inv || {}).mao || null : null;
    return out;
  });
  // (six moments of one stroke: u of the act — drawn by the clip warped so its contact falls on the world's)
  const U = [0.05, 0.3, 0.45, 0.55, 0.62, 0.8]; let got = 0;
  for (let i = 0; i < U.length; i++) {
    const at = await E(u => { const T = window.__T; let a = G.Avatar.actNow(); if (!a) { G.IncUI.use(); T.f(1); a = G.Avatar.actNow(); } if (!a) return null; T.until(() => { const b = G.Avatar.actNow(); return !b || b !== a || b.t / b.dur >= u; }, 400, 8); const b = G.Avatar.actNow(); return b ? +(b.t / b.dur).toFixed(2) : null; }, U[i]);
    if (at !== null) { await shot(`machado-${i + 1}`, { x: 250, y: 60, width: 600, height: 560 }); got++; }
  }
  const r1b = await E(() => { const T = window.__T; const out = {}; out.chop = T.tr.chop; out.held = G.Inv.held(T.v).mao; const card = document.querySelector('#inc-hud .ih-work'); out.card = card && !card.classList.contains('hidden') ? card.innerText.replace(/\s+/g, ' ') : null; out.qa = T.novas(); return out; });
  await shot('trabalho-cartao');
  ok('w1 o golpe de machado de cima: o E corta com o clipe do ofício, o machado na mão (o que se segura e o que o 3D desenha)', r1.best === 'Cortar a árvore' && r1.anim === 'machado' && r1.vact === 'chop' && /machado/.test(r1.held || '') && /machado/.test(r1.look || r1.held || '') && got >= 4 && r1b.chop > 0,
    `o E: ${r1.best}; o gesto: ${r1.anim} (o mundo vê ${r1.vact}); na mão: ${r1.held} (o 3D: ${r1.look}); fotos ${got}/6; o contador da árvore ${r1b.chop.toFixed(2)}`);
  ok('w2 a tela do trabalho: sem o machado, o E e o cartão dizem por quê; com ele, o trabalho, a ferramenta, o que falta e o que rende', /machado/.test(r2a.best || '') && (!r2a.card || /machado/i.test(r2a.card)) && !!r1b.card && /Cortando a árvore/.test(r1b.card) && /machado de bronze/i.test(r1b.card) && /golpes/.test(r1b.card) && /lenha/.test(r1b.card),
    `sem: «${r2a.best}» / cartão «${r2a.card || '—'}» · com: «${r1b.card || '—'}»`);
  // ================================ w3: the pick at a rock, the net at the water
  const r3 = await E(() => {
    const T = window.__T, v = T.v, S = G.S; const out = {};
    while (G.Avatar.busy()) T.f(1);
    const rock = [...S.rocks.values()].filter(r => r.stone >= 4 && !r.claim).sort((a, b) => a.id - b.id).find(r => T.near(r.x, r.y, 0.62));
    if (rock) { T.clearBag(v); T.give(v, 'picareta.bronze'); T.f(4); T.side(); G.IncUI.use(); T.f(1); const a = G.Avatar.actNow(); out.pick = a ? a.anim : null; T.until(() => { const b = G.Avatar.actNow(); return !b || b.t / b.dur >= 0.45; }, 300, 8); out.pickHeld = G.Inv.held(v).mao; }
    return out;
  });
  await shot('picareta', { x: 250, y: 60, width: 600, height: 560 });
  const r3b = await E(() => {
    const T = window.__T, v = T.v, S = G.S; const out = {}; while (G.Avatar.busy()) T.f(1); v.carry = null;
    // (a bank of a river or the sea, with no beast that kills near)
    const N = G.N; let at = null;
    for (let i = 0; i < S.type.length && !at; i++) { if (!(S.type[i] === G.T.RIVER || S.type[i] <= G.T.SEA)) continue; const x = i % N, y = Math.floor(i / N);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = G.W.idx(x + dx, y + dy); if (!G.W.inb(x + dx, y + dy) || !G.W.walkable(j) || S.type[j] === G.T.RIVER || S.type[j] < G.T.SAND) continue; at = [x + dx + 0.5 - dx * 0.38, y + dy + 0.5 - dy * 0.38, -dx, -dy]; break; } }
    if (!at) return out;
    T.clearBag(v); T.give(v, 'rede'); T.god(() => G.Inv.equip(v, 'rede')); G.Avatar.place(at[0], at[1]); T.f(4); const b = G.Avatar.state(); b.yaw = Math.atan2(at[3], at[2]); G.Avatar.input.camYaw = b.yaw; T.f(3); T.side(-Math.PI / 2 - 0.5, 4.2);
    const best = G.IncUI.best(); out.label = best ? best.label : null; G.IncUI.use(); T.f(1); const a = G.Avatar.actNow(); out.net = a ? a.anim : null;
    T.until(() => { const c = G.Avatar.actNow(); return !c || c.t / c.dur >= 0.25; }, 900, 8); out.netHeld = G.Inv.held(v).mao;
    return out;
  });
  await shot('rede', { x: 200, y: 40, width: 700, height: 600 });
  ok('w3 a picareta na pedra e a rede na água: os gestos dos ofícios, a coisa na mão', r3.pick === 'picareta' && /picareta/.test(r3.pickHeld || '') && (r3b.net === undefined || (r3b.net === 'rede' && r3b.netHeld === 'rede' && r3b.label === 'Lançar a rede')),
    `a pedra: ${r3.pick} com ${r3.pickHeld} · a água: «${r3b.label}» ${r3b.net} com ${r3b.netHeld}`);
  // ================================ w4: someone of the world chopping
  const r4 = await E(() => {
    const T = window.__T, S = G.S; const out = {}; while (G.Avatar.busy()) T.f(1);
    // (the god's view goes on: a woodcutter of the world at a tree — the world's own errand, given by the test's hand as the world gives it)
    const o = [...S.villagers.values()].filter(x => x !== T.v && x.age >= 18 && x.age < 55 && !x.inside && !x.carry && !G.Inv.real(x)).sort((a, b) => a.id - b.id);
    const tr = [...S.trees.values()].filter(t => G.Nature.isChoppable(t) && t.stage === 'grow' && !t.claim && Math.hypot(t.x - T.v.x, t.y - T.v.y) < 12).sort((a, b) => Math.hypot(a.x - T.v.x, a.y - T.v.y) - Math.hypot(b.x - T.v.x, b.y - T.v.y))[0];
    const w = o.find(x => Math.hypot(x.x - T.v.x, x.y - T.v.y) < 30) || o[0]; if (!w || !tr) return out;
    T.god(() => { G.Vg.endTask(w); w.x = tr.x + 0.4; w.y = tr.y; w.path = null; tr.claim = w.id; G.Vg.setTask(w, { type: 'chop', id: tr.id, pri: 3, st: 1 }); });
    T.until(() => w.act === 'chop', 300, 33); out.act = w.act; out.st = G.People3D && G.People3D.Anim3D ? null : (G.Anim3D.stateOf ? G.Anim3D.stateOf(w, 0) : null); out.held = G.Inv.held(w).mao;
    G.Avatar.place(tr.x - 0.6, tr.y + 0.5); T.f(3); const b = G.Avatar.state(); b.yaw = Math.atan2(tr.y * 4 - b.Z, tr.x * 4 - b.X); T.side(-1.2, 4.5); T.f(10);
    return out;
  });
  await shot('mundo-cortando');
  ok('w4 uma pessoa do mundo cortando: o mesmo clipe do ofício, o machado do ato na mão', !r4.act || (r4.act === 'chop' && (!r4.st || r4.st === 'machado') && /machado/.test(r4.held || '')), r4.act ? `o ato ${r4.act}, o estado desenhado ${r4.st}, na mão ${r4.held}` : '(nenhum lenhador por perto: a parte fica para o qa/trabalho.js t12)');
  const rx = await E(() => ({ qa: window.__T.novas(), err: JSON.stringify(G.modErr) }));
  ok('o verificador sem nada novo (o «trabalho» limpo), nenhum erro de módulo', !rx.qa.length && rx.err === '{}', rx.qa.length ? rx.qa.slice(0, 4).join(' | ') : `limpo; módulos ${rx.err}`);
  ok('nenhum erro de página nem de console', !errs.length, errs.length ? [...new Set(errs)].slice(0, 4).join(' || ') : 'nenhum');
  await browser.close();
  // (the strip of the stroke: the six photos side by side)
  try { const { execFileSync } = require('child_process'); const ims = U.map((u, i) => path.join(OUT, `machado-${i + 1}.png`)).filter(f => fs.existsSync(f));
    if (ims.length) execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nims=[Image.open(p) for p in sys.argv[2:]]\nw=sum(i.width for i in ims); h=max(i.height for i in ims)\nW=Image.new("RGB",(w,h)); x=0\nfor i in ims: W.paste(i,(x,0)); x+=i.width\nW.save(sys.argv[1])', path.join(OUT, 'machado-tira.png'), ...ims]); } catch (e) { console.log('(a tira não saiu: ' + e.message.slice(0, 80) + ')'); }
  console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'tudo passou'); console.log('fotos em ' + OUT + ': ' + shots.join(', '));
  process.exit(fails.length ? 1 : 0);
})();
