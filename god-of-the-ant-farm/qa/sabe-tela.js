// sabe-tela: [ONLY=k4] node qa/sabe-tela.js [pasta das fotos] [mundo] — a tela do corpo, no navegador, diz o que a porta do que o
// personagem sabe responde (Bairros Vivos, BV-6; D-170 a D-173). As regras da porta (G.Possess.knows) são provadas em Node
// pelo qa/sabe.js; aqui, com o 3D de verdade (WebGL sem GPU — é lento), o que aparece escrito:
//  k1 a linha do lugar (a HUD): num bairro que o corpo não conhece, o que se vê, sem o nome; é a resposta da porta;
//  k2 diante de um estranho: o letreiro sobre a cabeça e o «E — Conversar com…» dizem o que se vê, sem o nome; depois do E
//     (a conversa), a ficha tem o nome e «Você conhece: de conversa», sem as memórias; e o letreiro passa a dizer o nome;
//  k3 a ficha de alguém da família tem as memórias; o cartão da casa de estranhos não tem as moedas nem os nomes, o da
//     própria casa tem;
//  k4 a tela desligada (a tecla H): some quem sou, o lugar, a hora, a bússola, o «E — …», o letreiro e a marca sobre a pessoa;
//     o jogo segue — o mundo anda, o E ainda conversa (a ficha abre), o Esc abre o menu com a caixa desmarcada —; a caixa do
//     menu liga de novo; a escolha fica guardada no navegador; sair e entrar em outro corpo não muda;
//  k5 com o mundo parado (o menu aberto), sessenta quadros da tela não mudam o estado canônico nem o acaso do mundo;
//  e nenhum erro de página, de console nem de módulo; o verificador sem nada novo.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'sabe-tela'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'metropole';
// (k1 to k3 are one walk and always run; ONLY=k4 or ONLY=k5 leaves the other out)
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; const on = k => !ONLY || ONLY.includes(k);
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: __dirname + '/qa.js' }); await page.addScriptTag({ path: __dirname + '/sabe-inv.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | sabe-tela ${name} | ${info}`); if (!cond) fails.push(name.split(' ')[0]); };
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 180000 }); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  await E(w => {
    const T = window.__T = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      enter(v) { if (!G.Modes.enter(v)) return false; return T.until(() => G.Modes.state === 'INC', 300) >= 0; },
      leave() { if (G.Modes.state === 'INC') G.Modes.leave('deus'); return T.until(() => G.Modes.state === 'GOD', 400) >= 0; },
      key(k) { window.dispatchEvent(new KeyboardEvent('keydown', { key: k })); window.dispatchEvent(new KeyboardEvent('keyup', { key: k })); },
      txt: sel => { const e = document.querySelector(sel); return e ? e.textContent : null; },
      shown: sel => { const e = document.querySelector(sel); return !!e && getComputedStyle(e).display !== 'none'; },
      fp() { const s = JSON.stringify(QA.canon()); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + JSON.stringify(G.S.rng); },
      qk: e => e.sys + '|' + e.msg.replace(/#\d+/g, '#'),
      novas: () => QA.check().filter(e => (e.sev <= 2 && !T.base.has(T.qk(e))) || e.sys === 'sabe').map(e => `[S${e.sev}] ${e.sys}: ${e.msg}`),
      // a tile of a quarter where the body can stand
      spotIn(q) { const U = G.Urban, W = G.W, S = G.S; for (const c of q.cells) { const [cx, cy] = U.cellXY(c); for (let dy = 0; dy < U.C; dy++) for (let dx = 0; dx < U.C; dx++) { const x = cx + dx + 0.5, y = cy + dy + 0.5; if (W.inb(x, y) && W.walkableXY(x, y) && !S.occ[W.idx(x, y)] && U.at(x, y) === q) return [x, y]; } } return null; },
    };
    G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    // (the world opens in the night: lived, by its own step, until the morning — people in the streets)
    for (let t = 0; t < G.DAY_LEN * 20 && (G.S.time < 0.1 || G.S.time > 0.5); t++) G.debug.step(0.05);
    for (let t = 0; t < 400; t++) G.debug.step(0.05);
    T.base = new Set(QA.check().filter(e => e.sev <= 3).map(T.qk));
  }, WORLD);

  // ================================ k1 + k2 + k3: what is written
  const r1 = await E(() => {
    const S = G.S, T = window.__T, K = G.Possess.knows, U = G.Urban; const out = {};
    const set = [...S.settlements.values()].filter(s => (s.tier || 0) >= 3 && U.districtsOf(s).length >= 3).sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id) || a.id - b.id)[0];
    if (!set) return { none: 'nenhuma cidade de bairros' };
    const folk = [...S.villagers.values()].filter(o => o.set === set.id).sort((a, b) => a.id - b.id);
    const awake = o => !o.inside && !o.sleeping && o.age >= 16 && !o.aboard && !o.held && !o.air;
    // (a body with a quarter it cannot name, and a stranger to it awake in the street it can walk to)
    let v = null, q = null, st = null;
    for (const o of folk) { if (o.age < 18 || o.age >= 60 || !o.home || o.inside || !G.Possess.can(o).ok) continue; const u = U.districtsOf(set).find(d => !K.district(o, d) && T.spotIn(d)); const s2 = u && folk.find(x => x.id !== o.id && awake(x) && !K.person(o, x) && G.W.reaches(o, x.x, x.y)); if (s2) { v = o; q = u; st = s2; break; } }
    if (!v) return { none: `em ${set.name}, nenhum corpo com um bairro desconhecido e um estranho na rua` };
    out.who = `${v.name} de ${set.name}`; out.entered = T.enter(v);
    // ---- k1
    const p = T.spotIn(q); G.Avatar.place(p[0], p[1]); T.f(12);
    out.k1 = { q: q.name, hud: T.txt('#inc-hud .ih-place'), port: K.where(v).txt, seen: K.where(v).seen, truth: G.Possess.where(v).district };
    T.v = v; T.set = set; T.folk = folk; T.awake = awake;
    return out;
  });
  if (!r1.none) await shot('sabe-bairro-desconhecido');
  const r = r1.none ? r1 : await E(r0 => {
    const S = G.S, T = window.__T, K = G.Possess.knows, I = G.Interact, IU = G.IncUI; const out = r0; const v = T.v, set = T.set, folk = T.folk, awake = T.awake; let st = null;
    // ---- k2: up to the stranger, facing them (they may walk: the nearest stranger in reach is taken, up to four of them)
    const strangers = () => folk.filter(x => S.villagers.has(x.id) && x.id !== v.id && awake(x) && !K.person(v, x) && G.W.reaches(v, x.x, x.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y));
    let b = null;
    for (const o of strangers().slice(0, 4)) {
      const pth = G.W.findPath(v.x, v.y, o.x, o.y, true, 30000); if (!pth) continue; const e = pth.length ? pth[pth.length - 1] : [o.x, o.y];
      let px = e[0], py = e[1]; const d = Math.hypot(e[0] - o.x, e[1] - o.y) || 1; for (const rr of [0.3, 0.4, 0.22, 0.5]) { const qx = o.x + (e[0] - o.x) / d * rr, qy = o.y + (e[1] - o.y) / d * rr; if (G.W.walkableXY(qx, qy)) { px = qx; py = qy; break; } }
      G.Avatar.place(px, py); T.f(6); G.Avatar.state().yaw = Math.atan2(o.y - v.y, o.x - v.x); G.Cam3D.yaw = G.Avatar.state().yaw; T.f(8);
      b = I.best(); if (b && b.id === 'pessoa' && !K.person(v, b.t.o)) { st = b.t.o; break; } b = null;
    }
    if (!b) { out.k2 = { none: 'o corpo não ficou de frente para nenhum estranho' }; return out; }
    out.k2 = { name: st.name, looks: K.looks(st, v), label0: T.txt('#inc-label'), labelShown: T.shown('#inc-label'), prompt0: T.txt('#inc-hud .ih-prompt span'), mark0: G.People3D.highlight === st.id };
    IU.use(); T.f(2);
    const card = document.querySelector('#inc-card'); const rows = card ? [...card.querySelectorAll('.ic-rows tr')].map(tr => tr.textContent) : [];
    Object.assign(out.k2, { cardOpen: !!card && !card.classList.contains('hidden'), h3: card ? (card.querySelector('h3') || {}).textContent : null, why: rows.find(t => /^Você conhece/.test(t)) || null, bio: card ? !!card.querySelector('.ic-bio') : null, said: !!card.querySelector('.ic-said') });
    IU.closeAll(); G.Modes.setPanel(null); T.f(4);
    // (the two have met, by the world's step; the word said — the body's arms busy with it — over, and facing them again:
    // the screen's own choice of what is before the body, and the name it writes over that head)
    // (and up to them again where they went: the word said, the other goes back to their day — Ameyali of Tenochtitlan, in the
    // metrópole of the generation 20, walked off with the body facing where she had been, and the nearest thing before it was the
    // fish in the water, «Pescar com as mãos», T-1068)
    T.until(() => !G.Avatar.busy(), 300);
    if (G.dist(v.x, v.y, st.x, st.y) > 0.6) { const pth = G.W.findPath(v.x, v.y, st.x, st.y, true, 30000); const e = pth && pth.length ? pth[pth.length - 1] : [v.x, v.y]; const d = Math.hypot(e[0] - st.x, e[1] - st.y) || 1;
      for (const rr of [0.3, 0.4, 0.22, 0.5]) { const qx = st.x + (e[0] - st.x) / d * rr, qy = st.y + (e[1] - st.y) / d * rr; if (G.W.walkableXY(qx, qy)) { G.Avatar.place(qx, qy); T.f(6); break; } } }
    G.Avatar.state().yaw = Math.atan2(st.y - v.y, st.x - v.x); G.Cam3D.yaw = G.Avatar.state().yaw; T.f(8);
    const b2 = IU.best(); const hi = G.People3D.highlight;
    Object.assign(out.k2, { knows: K.how(v, st), label1: T.shown('#inc-label') && hi === st.id ? T.txt('#inc-label') : `(o letreiro: ${T.shown('#inc-label') ? 'sobre #' + hi : 'escondido'})`, prompt1: b2 && b2.id === 'pessoa' && b2.t.o.id === st.id ? T.txt('#inc-hud .ih-prompt span') : `(o «E — »: ${b2 ? b2.id + ' ' + (b2.label || '') : 'nada'})` });
    // ---- k3: the cards as the screen writes them
    const kin = folk.find(x => x.id !== v.id && G.Possess.kin(v, x) && G.Life.bioList(x).length);
    const render = c => { IU.card(c); const el = document.querySelector('#inc-card'); const o2 = { h3: (el.querySelector('h3') || {}).textContent, text: el.textContent, bio: !!el.querySelector('.ic-bio') }; IU.closeAll(); G.Modes.setPanel(null); return o2; };
    const home = S.buildings.get(v.home); const other = [...S.buildings.values()].filter(x => x.set === set.id && x.built && G.BDEF[x.type] && G.BDEF[x.type].housing && x.id !== v.home && x.coin !== undefined).sort((a, c) => a.id - c.id).find(x => { const rs = folk.filter(o => o.home === x.id); return rs.length && rs.every(o => !K.person(v, o)); });
    out.k3 = { kin: kin ? Object.assign(render(I.personCard(kin, v)), { name: kin.name }) : null, mine: render(I.buildingCard(home, v)), theirs: other ? Object.assign(render(I.buildingCard(other, v)), { names: folk.filter(o => o.home === other.id).map(o => o.name), coin: Math.round(other.coin) }) : null };
    out.qa = T.novas(); out.err = JSON.stringify(G.modErr);
    return out;
  }, r1);
  if (r.none) { for (const k of ['k1', 'k2', 'k3', 'k4', 'k5']) ok(k, false, r.none); }
  else {
    const k1 = r.k1;
    ok('k1 a linha do lugar: num bairro desconhecido, o que se vê — a resposta da porta', r.entered && !!k1.hud && k1.hud === k1.port && !k1.hud.includes(k1.q) && k1.truth === k1.q && k1.seen.length > 5 && k1.hud.toLowerCase().startsWith(k1.seen.toLowerCase()),
      `${r.who} em ${k1.q}: a tela diz «${k1.hud}» (a porta: «${k1.port}»)`);
    const k2 = r.k2;
    if (k2.none) ok('k2 o estranho', false, k2.none);
    else ok('k2 o estranho: o letreiro e o «E — …» sem o nome; depois da conversa, a ficha e o letreiro com o nome', k2.labelShown && !!k2.label0 && !k2.label0.includes(k2.name) && k2.label0.toLowerCase() === k2.looks.um && k2.prompt0 === `Conversar com ${k2.looks.o}` && k2.mark0
      && k2.cardOpen && k2.h3.startsWith(k2.name) && /de conversa/.test(k2.why || '') && k2.bio === false && k2.knows.n === 1 && (k2.label1 || '').startsWith(k2.name) && k2.prompt1 === `Conversar com ${k2.name}`,
      `diante de ${k2.name}: letreiro «${k2.label0}», «E — ${k2.prompt0}»; depois do E: ficha «${k2.h3}», «${k2.why}», memórias ${k2.bio ? 'SIM' : 'não'}; letreiro «${k2.label1}», «E — ${k2.prompt1}»`);
    const k3 = r.k3;
    ok('k3 as fichas e os cartões escritos: a família inteira; da casa alheia, nem moedas nem nomes', (!k3.kin || (k3.kin.h3.startsWith(k3.kin.name) && k3.kin.bio)) && /Moedas da família/.test(k3.mine.text) && /Em casa agora/.test(k3.mine.text)
      && (!k3.theirs || (!/Moedas da família/.test(k3.theirs.text) && !/Em casa agora/.test(k3.theirs.text) && /não conhece/.test(k3.theirs.text) && k3.theirs.names.every(n => !k3.theirs.text.includes(n)))),
      `${k3.kin ? `a ficha de ${k3.kin.name} (família) com memórias: ${k3.kin.bio}; ` : ''}a própria casa: moedas ${/Moedas da família/.test(k3.mine.text)}; ${k3.theirs ? `a de estranhos (${k3.theirs.names.length} moradores, ${k3.theirs.coin} moedas): «${k3.theirs.text.replace(/\s+/g, ' ').slice(0, 150)}»` : 'sem casa de estranhos com moedas'}`);
    ok('k verificador', !r.qa.length && r.err === '{}', `${r.qa.slice(0, 3).join(' · ') || 'limpo'} · ${r.err}`);

    // ================================ k4: the screen put away
    const h = !on('k4') ? null : await E(() => {
      const S = G.S, T = window.__T, IU = G.IncUI, I = G.Interact; const out = {}; const v = G.Possess.body(); if (!v) return { none: 'sem corpo' };
      const HUD = ['.ih-who', '.ih-clock', '.ih-compass', '.ih-corner', '.ih-reticle']; const vis = () => HUD.filter(s => T.shown('#inc-hud ' + s)).length;
      out.on0 = { vis: vis(), cls: document.querySelector('#inc-root').classList.contains('hud-off'), off: IU.hudOff() };
      T.key('h'); T.f(6);
      out.off = { vis: vis(), cls: document.querySelector('#inc-root').classList.contains('hud-off'), off: IU.hudOff(), store: localStorage.getItem('gotaf-tela'), toast: [...document.querySelectorAll('#inc-hud .ih-toast')].map(e => e.textContent).join(' | '), toasts: T.shown('#inc-hud .ih-toasts') };
      // (the game goes on: the world's clock, the E — facing someone, the card opens —, the menu)
      const c0 = S.clock; T.f(20); out.off.clock = S.clock > c0;
      const o = [...S.villagers.values()].filter(x => x.id !== v.id && !x.inside && !x.sleeping && x.age >= 6 && !x.aboard && G.W.reaches(v, x.x, x.y)).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0];
      if (o) { const pth = G.W.findPath(v.x, v.y, o.x, o.y, true, 30000); const e = pth && pth.length ? pth[pth.length - 1] : [o.x, o.y]; if (G.W.walkableXY(e[0], e[1])) G.Avatar.place(e[0], e[1]); T.f(6); G.Avatar.state().yaw = Math.atan2(o.y - v.y, o.x - v.x); G.Cam3D.yaw = G.Avatar.state().yaw; T.f(8); }
      const b = I.best(); out.off.best = b ? b.id : null; out.off.mark = G.People3D.highlight; out.off.label = T.shown('#inc-label'); out.off.prompt = T.shown('#inc-hud .ih-prompt');
      T.key('e'); T.f(3); const card = document.querySelector('#inc-card'); out.off.card = !!b && !card.classList.contains('hidden'); T.key('e'); T.f(3); out.off.closed = card.classList.contains('hidden');
      T.key('Escape'); T.f(4); const box = document.querySelector('#inc-menu input[data-h=tela]'); out.off.menu = G.Modes.menuOpen(); out.off.box = box ? box.checked : null;
      // (the box of the menu turns it on again)
      if (box) { box.checked = true; box.dispatchEvent(new Event('input', { bubbles: true })); }
      T.key('Escape'); T.f(6);
      out.on1 = { vis: vis(), cls: document.querySelector('#inc-root').classList.contains('hud-off'), store: localStorage.getItem('gotaf-tela'), menu: G.Modes.menuOpen() };
      // (off again, and another body: it stays off)
      T.key('h'); T.f(4); T.leave();
      const w = [...S.villagers.values()].filter(x => x.id !== v.id && x.set === v.set && x.age >= 18 && x.age < 55 && !x.inside && G.Possess.can(x).ok).sort((a, b) => a.id - b.id)[0];
      out.again = w ? { entered: T.enter(w), vis: (T.f(8), vis()), cls: document.querySelector('#inc-root').classList.contains('hud-off'), banner: T.shown('#inc-banner') } : null;
      return out;
    });
    if (h) await shot('sabe-tela-desligada');
    if (!h) console.log('(k4 fora do ONLY)'); else if (h.none) ok('k4 a tela desligada', false, h.none);
    else ok('k4 a tela desligada: some a tela, o jogo segue, o menu liga de novo, outro corpo não muda', h.on0.vis === 5 && !h.on0.cls && h.off.vis === 0 && h.off.cls && h.off.off && h.off.store === 'off' && /Tela desligada/.test(h.off.toast) && h.off.toasts && h.off.clock
      && h.off.mark === 0 && !h.off.label && !h.off.prompt && (!h.off.best || (h.off.card && h.off.closed)) && h.off.menu && h.off.box === false && h.on1.vis === 5 && !h.on1.cls && h.on1.store === 'on' && !h.on1.menu && (!h.again || (h.again.entered && h.again.vis === 0 && h.again.cls && !h.again.banner)),
      `ligada: ${h.on0.vis} painéis; H: ${h.off.vis} painéis, «${h.off.toast}», o relógio anda: ${h.off.clock}, marca ${h.off.mark}, letreiro ${h.off.label}, «E — » ${h.off.prompt}; o E ${h.off.best ? `faz «${h.off.best}» (a ficha abre: ${h.off.card}, fecha: ${h.off.closed})` : '(nada ao alcance)'}; menu com a caixa ${h.off.box ? 'MARCADA' : 'desmarcada'}; a caixa liga: ${h.on1.vis} painéis; outro corpo: ${h.again ? `${h.again.vis} painéis, sem faixa: ${!h.again.banner}` : '-'}`);

    // ================================ k5: the screen's frames with the world still
    const w = !on('k5') ? null : await E(() => {
      const T = window.__T; const v = G.Possess.body(); if (!v) return { none: 'sem corpo' };
      if (G.IncUI.hudOff()) { T.key('h'); T.f(4); } // (the screen on: every panel drawn)
      const o = [...G.S.villagers.values()].filter(x => x.id !== v.id && !x.inside && x.age >= 6).sort((a, b) => G.dist2(a.x, a.y, v.x, v.y) - G.dist2(b.x, b.y, v.x, v.y))[0];
      if (o) { G.Avatar.state().yaw = Math.atan2(o.y - v.y, o.x - v.x); G.Cam3D.yaw = G.Avatar.state().yaw; } T.f(4);
      T.key('Escape'); T.f(2); const f0 = T.fp(), c0 = G.S.clock; T.f(60); const f1 = T.fp();
      G.IncUI.selfCard(); T.f(10); G.IncUI.diary(); T.f(10); G.IncUI.closeAll(); G.Modes.setPanel(null); const f2 = T.fp(); const still = G.S.clock === c0;
      G.Modes.menu(false); T.f(4);
      return { same: f0 === f1 && f1 === f2, still, f0, f1, f2, qa: T.novas(), err: JSON.stringify(G.modErr) };
    });
    if (!w) console.log('(k5 fora do ONLY)'); else if (w.none) ok('k5 os quadros da tela não mudam o mundo', false, w.none);
    else ok('k5 com o mundo parado, os quadros da tela (a HUD, a ficha, o diário) não mudam o mundo', w.same && w.still, `${w.f0.slice(0, 22)}… → ${w.f1.slice(0, 22)}… → ${w.f2.slice(0, 22)}… (o relógio parado: ${w.still})`);
    if (w) ok('k verificador no fim', w.qa && !w.qa.length && w.err === '{}', `${(w.qa || []).slice(0, 3).join(' · ') || 'limpo'} · ${w.err}`);
  }
  ok('nenhum erro de página nem de console', !errs.length, errs.length ? [...new Set(errs)].slice(0, 4).join(' || ') : 'nenhum');
  await browser.close();
  console.log(fails.length ? `FALHARAM: ${[...new Set(fails)].join(', ')}` : 'tudo passou');
  process.exit(fails.length ? 1 : 0);
})();
