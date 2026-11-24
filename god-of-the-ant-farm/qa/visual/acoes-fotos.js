// acoes-fotos: bash qa/navegador.sh node qa/visual/acoes-fotos.js PASTA [mundo] [pc] — a interação clara (a quarta onda da taverna, I —
// D-915 a D-929) no navegador, com o 3D de verdade (WebGL sem GPU: é lento, ≈ 30–40 min), num celular em pé (390 × 844) ou, com «pc», na
// tela do PC (1280 × 760). O corpo senta a uma mesa de taverna com gente, e tudo pelos toques (ou pelas teclas, no PC), como o dono faria:
//  1 a barra da mesa com a dica da primeira vez — e, depois de «Entendi», a barra sozinha (a dica não volta: o corpo levanta e senta de
//    novo, e ela não aparece);
//  2 a lista de ações (o botão «Ações» do toque, a tecla Y do PC): a da mesa, e a de uma pessoa da mesa escolhida pelo nome;
//  3 os dados de ponta a ponta: «Dados» na barra abre a mesa do copo — o convite, o começo, os palpites pelos toques, o fim;
//  4 as Tabuletas de ponta a ponta: «Tabuletas» na barra abre o convite (com quem, a aposta), «Desafiar», as sete rodadas pelos toques,
//    o fim da partida pela regra (não pelo fechamento da taverna).
// Mede: a barra e a lista inteiras na tela, sem rolagem de lado, os botões de tocar de 44 px ou mais (no PC, de 24: o mouse), o apagado com o porquê escrito; e
// nenhum erro de página, de console nem de módulo. As regras são provadas em Node pelo qa/acoes.js; aqui, o que se vê e as mãos.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'acoes-fotos'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'metropole'; const PC = process.argv[4] === 'pc';
const ATE = +(process.env.ATE || 4); // (ATE=1: só a barra; 2: e a lista; 3: e os dados; 4: e as Tabuletas)
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage(PC ? { viewport: { width: 1280, height: 760 } } : { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL|WebGL: INVALID|CONTEXT_LOST/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { const r0 = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => (cb && (cb.name === 'loop' || cb.name === 'frame') ? 0 : r0(cb)); try { localStorage.clear(); localStorage.setItem('gotaf-guia-tabuletas', '1'); localStorage.setItem('gotaf-guia-copo', '1'); } catch (e) { } }); // (o guia da primeira partida já visto: o guia tem a sua prova, qa/visual/ensina-fotos.js — D-947; só o laço do jogo parado, nunca o requestAnimationFrame inteiro: a festa das mesas conta pelos quadros da página, T-2103)
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  console.log('(abrindo o jogo: ' + new Date().toISOString().slice(11, 19) + ')');
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
  await page.addScriptTag({ path: path.join(ROOT, 'qa', 'qa.js') });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | acoes-fotos ${name} | ${info}`); if (!cond) fails.push(name.split(' ')[0]); };
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 480000 }); console.log('foto: ' + path.join(OUT, name + '.png')); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  const wait = ms => page.waitForTimeout(ms);
  // (a tap where the finger would: the middle of an element of the page — the phone's touch; on the PC a click of the mouse there)
  const tap = async sel => { const el = await page.$(sel); if (!el) return false; const b = await el.boundingBox(); if (!b) return false; if (PC) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); return true; };
  const slotOf = id => E(id => { const L = G.AcoesUI.shown().itens; return L.findIndex(q => q.id === id); }, id);
  // (the keeper comes with the menu by himself now and then — the house's way, P7 —: a player says «agora não» to it, and the bar is
  // there again)
  const semMenu = async () => { if (await E(() => G.CardapioUI.isOpen())) { await tap('#menu-panel .mn-no'); await E(() => window.__T.ui(6)); } };
  // (a slot of the bar: a tap on the phone; on the PC its key — the number shown on the button)
  const tapSlot = async id => { await semMenu(); const i = await slotOf(id); if (i < 0) return false;
    if (PC) { const k = await E(i => G.AcoesUI.shown().itens[i].key, i); if (!k) return false; await page.keyboard.press(k === 'Espaço' ? ' ' : k.toLowerCase()); return true; }
    return tap(`.ac-mesa .ac-b[data-i="${i}"]`); };
  const r0 = await E(([w, phone]) => {
    const T = window.__T = {
      f(n, ms) { for (let k = 0; k < n; k++) G.Main.frameFor(ms || 33, true); },
      until(c, max, ms) { for (let k = 0; k < (max || 400); k++) { if (c()) return k; G.Main.frameFor(ms || 33, true); } return c() ? max : -1; },
      // (the world on, its seconds, with the body's controller and the screen of the body at each — nothing drawn: fast)
      run(c, sec) { const t0 = G.S.clock; while (!c() && G.S.clock - t0 < sec) { G.debug.step(0.1); G.Avatar.frame(1 / 30); G.IncUI.frame(1 / 30); } return c(); },
      // (the screen's own beats, the world almost still: the panels drawn, the answers told)
      ui(n) { for (let k = 0; k < (n || 6); k++) { G.debug.step(0.02); G.Avatar.frame(1 / 30); G.IncUI.frame(1 / 30); } },
      god(f) { G.inSim++; try { return f(); } finally { G.inSim--; } },
    };
    { const t0 = G.IncUI.toast; G.IncUI.toast = function (t) { (T.toasts = T.toasts || []).push(String(t || '')); return t0.apply(this, arguments); }; } // (the words told to the player, kept: L-2183)
    G.Realm.setQuality('baixa'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
    const calm = () => { const s = G.S.weather; s.rain = 0; if (s.storm) s.storm = 0; if (!(G.S.divinePeace > G.DAY_LEN * 0.5)) T.god(() => G.Politics.divinePeace()); };
    for (let t = 0; t < G.DAY_LEN * 40 && G.S.time < 0.65; t++) { calm(); G.debug.step(0.1); } // (the taverns open at 0,55 and close at 0,88: two whole games in the evening)
    const Ta = G.Taverna, In = G.Interiors, D = G.Depot; const SEATK = { banquinho: 1, banco: 1, cadeira: 1 };
    // (a table of an open tavern with two or more at it and a free seat there; someone of its people with coin for it — the body)
    let pk = null;
    // (the free seats of a tavern at a table with min — two — or more of its customers — with play, those who could play: awake, not worn
    // out nor reeling with drink, the dice's own will (G.JogoDados' free) with a few points of strength for the game to come —, the
    // nearest the door first)
    let play = true;
    const seatsOf = (b, min) => { const d = Ta.dia(b) && Ta.dia(b).data; const p = G.Space.planNow(b); if (!d || !p || !p.entrance) return { at: new Map(), seats: [] };
      const at = new Map(); for (const id of Object.keys(d.mesa)) { const m = d.mesa[id]; const o = G.S.villagers.get(+id); if (!m.g || m.body || !o || o.age < 16 || m.st < 2 || m.st === 6 || m.st === 9) continue;
        if (play && (m.zz || o.energy < (Ta.SONO || 26) + 9 || (G.Ebrio && G.Ebrio.grau(o) >= 3))) continue; at.set(m.g, (at.get(m.g) || 0) + 1); }
      return { at, seats: In.freeNear(b, p.entryLv || 0, p.entrance.x, p.entrance.z, 60, ['sentar', 'comer']).filter(q => SEATK[q.it.kind] && In.walkIn(b, q) < Infinity && (at.get(In.groupOf(b, q.it.id)) || 0) >= (min || 2)) }; };
    const taverns = () => [...G.S.buildings.values()].filter(b => b.type === 'taverna' && b.built && In.has(b) && Ta.dia(b) && Ta.aberta(b)).sort((a, c) => a.id - c.id);
    // (another free seat at a table with people, when the one chosen was taken: in the body's tavern or another open one of its people —
    // the most at the table first, the body's tavern before another at the same)
    const another = () => { const fid = G.Fac.idOfV(T.pk.v); let best = null;
      for (const b2 of taverns()) { if (G.Village.facOfSet(b2.set) !== fid) continue; const kp = Ta.keeperOf(b2); if (!kp || !Ta.atHand(b2)) continue; const { at, seats } = seatsOf(b2, 1);
        for (const q of seats) { const n = at.get(In.groupOf(b2, q.it.id)) || 0; const sc = n + (b2 === T.pk.b ? 0.5 : 0); if (!best || sc > best.sc) best = { b: b2, kp, pl: q, n, sc }; } }
      return best; };
    for (const pass of [true, false]) { if (pk) break; play = pass; // (no table of two who could play: one of two all the same — the bar and the list)
    for (const b of taverns()) {
      const kp = Ta.keeperOf(b); if (!kp || !Ta.atHand(b)) continue; const p = G.Space.planNow(b); if (!p || !p.entrance) continue;
      const { at, seats } = seatsOf(b);
      if (!seats.length) continue; const fid = G.Village.facOfSet(b.set);
      const v = [...G.S.villagers.values()].filter(o => o !== kp && o.age >= 18 && o.age < 55 && !o.sleeping && !o.inside && G.Fac.idOfV(o) === fid && G.Possess.can(o).ok && D.get(G.Eco.coinRef(o), 'moedas') >= 3).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
      // (a town's tavern first — it shuts at 0,88, the village's at 0,84 —, then the most at the table)
      const n = at.get(In.groupOf(b, seats[0].it.id)); const tier = (G.S.settlements.get(b.set) || {}).tier >= 2 ? 1 : 0; if (v && (!pk || tier > pk.tier || (tier === pk.tier && n > pk.n))) pk = { b, kp, v, pl: seats[0], n, tier, play };
    } }
    if (!pk) return { none: 'nenhuma taverna aberta com uma mesa de dois ou mais e um lugar livre' };
    T.pk = pk; T.calm = calm;
    // (into the room, where one gets onto the seat — the proof's hand, as the Node proof's —, and sat down by the verb, as the hands do)
    T.seat = () => {
      let { b } = T.pk; const { v } = T.pk; let pl = In.freeFor(b, T.pk.pl.it.id, T.pk.pl.q, T.pk.pl.x, T.pk.pl.z);
      // (the seat taken meanwhile — someone sat down in it while the body came into the world: T-2075 —: another free one at a table with people)
      if (!pl) { const q = another(); if (!q) return 'nenhum lugar livre a uma mesa com gente'; T.retook = `o lugar ${T.pk.pl.it.id} foi tomado; outro: ${q.pl.it.id}${q.b !== b ? ` na taverna #${q.b.id}` : ''}, à mesa com ${q.n}`; Object.assign(T.pk, { b: q.b, kp: q.kp, pl: q.pl, n: q.n }); b = q.b; pl = q.pl; }
      const TL = G.Space.TILE; pl.at = In.standFor(b, pl, pl.x, pl.z);
      if (G.Avatar.seatNow()) { G.Avatar.input.mz = 1; T.ui(2); G.Avatar.input.mz = 0; T.ui(20); }
      G.Avatar.detach(); T.god(() => { v.inside = b.id; v.x = b.x + pl.at[0] / TL; v.y = b.y + pl.at[1] / TL; }); G.Possess.setLevel(pl.lv); G.Avatar.attach(v, 0); T.ui(6);
      const st = G.Avatar.state(); let best = null;
      for (let k = 0; k < 40 && !(best && best.id === 'lugar'); k++) { const ya = Math.atan2(b.y * TL + pl.z - st.Z, b.x * TL + pl.x - st.X); G.Avatar.input.camYaw = ya; st.yaw = ya; best = G.Interact.best(); T.ui(1); }
      if (!(best && best.id === 'lugar')) return `o E oferece ${best ? best.label : 'nada'} (o lugar ${pl.it.id}, a ${Math.hypot(b.x * TL + pl.x - st.X, b.y * TL + pl.z - st.Z).toFixed(2)} m)`;
      G.Interact.run(best); T.run(() => G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1, 4);
      // (the tavern's book has the body at its table — its second of the world —; the eye a little to the side: the table and the bar)
      T.run(() => { const m = Ta.dia(b) && Ta.dia(b).data.mesa[v.id]; return !!m && !!m.corpo && !!m.seat; }, 6);
      G.Avatar.input.camYaw = G.Avatar.state().yaw + 0.5; return '';
    };
    T.god(() => { G.Vg.endTask(pk.v); pk.v.path = null; });
    if (!G.Modes.enter(pk.v)) return { none: 'não encarnou' };
    T.until(() => G.Modes.state === 'INC', 400);
    if (phone) { G.Input3D.touch = true; G.Input3D.device = 'touch'; G.IncUI.touchOn(); }
    const why = T.seat(); if (why) return { none: why };
    return { who: `${pk.v.name} na ${G.Village.buildName(T.pk.b)} #${T.pk.b.id} (${Ta.look(T.pk.b).tema}), à mesa com ${T.pk.n}${T.retook ? ` (${T.retook})` : ''}` };
  }, [WORLD, !PC]);
  if (r0.none) { ok('o retrato', false, r0.none); await browser.close(); process.exit(1); }
  console.log(r0.who);
  // (what the screen shows: the bar, the word of the first time, the list — measured: whole on the screen, no scroll to the side, the
  // buttons to tap 44 px or more, the greyed ones with their why written)
  // (the buttons to tap: 44 px or more on the phone — the finger —; on the PC, 24 — the mouse)
  const measure = () => E(pc => {
    const T = window.__T; T.ui(3); const A = G.AcoesUI.shown(); const MIN = pc ? 24 : 44;
    const box = el => { if (!el || el.classList.contains('hidden') || !el.offsetParent) return null; const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: Math.round(r.width), h: Math.round(r.height) }; };
    const inside = b => !!b && b.l >= -0.5 && b.t >= -0.5 && b.r <= innerWidth + 0.5 && b.b <= innerHeight + 0.5;
    const bar = document.querySelector('.ac-mesa'), dica = document.querySelector('.ac-dica'), sheet = document.querySelector('#acoes-panel');
    const small = root => (root ? [...root.querySelectorAll('button')].filter(b => b.offsetParent && !b.classList.contains('x') && (b.getBoundingClientRect().height < MIN - 0.5 || b.getBoundingClientRect().width < MIN - 0.5)).map(b => b.textContent.trim().slice(0, 20)) : []);
    const offWhy = root => (root ? [...root.querySelectorAll('.ac-b.off, .ac-r.off')].filter(b => !((b.querySelector('small, em') || {}).textContent || '').trim()).length : 0);
    return { A, bar: box(bar), dica: box(dica), sheet: box(sheet), inBar: inside(box(bar)), inDica: !box(dica) || inside(box(dica)), inSheet: !box(sheet) || inside(box(sheet)), side: document.documentElement.scrollWidth > innerWidth + 1,
      small: small(bar).concat(small(sheet), small(dica)), offWhy: offWhy(bar) + offWhy(sheet), items: A.itens.map(q => `${q.nome}${q.ok ? '' : ' — ' + q.why}`), rows: A.rows.map(q => `${q.label}${q.ok ? '' : ' — ' + q.why}`), touchBtns: G.IncUI.touchButtons() };
  }, PC);
  const flags = m => `barra ${m.inBar ? 'na tela' : 'FORA'}${m.side ? ', ROLAGEM DE LADO' : ''}${m.small.length ? `, botões pequenos: ${m.small.join(', ')}` : ''}${m.offWhy ? `, ${m.offWhy} apagado(s) sem porquê` : ''}`;
  // ================================ 1: the bar of the table, and the word of the first time
  // (the keeper comes with the menu by himself — the house's: P7 —, and the hands say «agora não»; then the bar is there, with the word)
  const c1 = await E(() => { const T = window.__T; T.run(() => G.CardapioUI.isOpen() || G.AcoesUI.shown().mesa, 40); T.ui(4); return { menu: G.CardapioUI.isOpen() }; });
  if (c1.menu) { await tap('#menu-panel .mn-no'); await E(() => window.__T.ui(6)); }
  await E(() => { const T = window.__T; T.run(() => G.AcoesUI.shown().mesa && G.AcoesUI.shown().dica, 6); T.f(3); });
  await wait(900); const m1 = await measure();
  ok('1 sentado à mesa: a barra da mesa e a dica da primeira vez, inteiras na tela', m1.A.mesa && m1.A.dica && m1.inBar && m1.inDica && !m1.side && !m1.small.length && !m1.offWhy && (PC || m1.touchBtns.includes('acoes')), `${flags(m1)}; ${m1.items.join(' · ')}; os botões do toque: ${m1.touchBtns.join(', ')}`);
  await shot(`1-mesa-dica${PC ? '-pc' : ''}`);
  // («Entendi»: the word goes, and never comes back — up and sat down again, no word)
  await tap('.ac-dica [data-a="ok"]'); await E(() => window.__T.ui(4));
  const c2 = await E(() => { const T = window.__T; const gone = !G.AcoesUI.shown().dica; let kept = ''; try { kept = localStorage.getItem('gotaf-dica-mesa'); } catch (e) { } const why = T.seat(); T.run(() => G.AcoesUI.shown().mesa, 8); T.ui(6); return { gone, kept, why, again: G.AcoesUI.shown().dica, mesa: G.AcoesUI.shown().mesa }; });
  await E(() => { const T = window.__T; if (G.CardapioUI.isOpen()) G.CardapioUI.close(); T.ui(6); T.f(3); }); await wait(700); const m2 = await measure();
  ok('1 «Entendi»: a dica some e não volta (levantou e sentou de novo)', c2.gone && c2.kept === '1' && !c2.why && c2.mesa && !c2.again, `sumiu ${c2.gone}; guardada «${c2.kept}»; de novo à mesa: a barra ${c2.mesa}, a dica ${c2.again ? 'VOLTOU' : 'não voltou'}`);
  // (the games on the bar say where they come from — the house's, lent, and the rent; one's own — or that they wait for one free: the doors
  // of the games, G.JogoDados.verbo and G.Cartas.podeCorpo, the J's)
  const src = await E(() => { const v = G.Possess.body(); const x = G.JogoDados.verbo(v), c = G.Cartas.podeCorpo(v); const it = G.AcoesUI.shown().itens; const d = it.find(q => q.id === 'jd-dados'), t = it.find(q => q.id === 'tv-cartas');
    return { x: { k: x.k, ok: x.ok, de: x.de || '', espera: x.espera }, c: { ok: c.ok, de: c.de || '', espera: c.espera, jogo: c.jogo }, d: d && { ok: d.ok, sub: d.sub, est: d.est }, t: t && { ok: t.ok, sub: t.sub, est: t.est } }; });
  const said = (g, q) => (!q ? 'sem o lugar' : g.espera ? `«${q.est}»` : `«${q.sub}»`);
  const fine = (g, q) => (!q ? !g.k && !g.ok && !g.espera : g.espera ? /livre/.test(q.est || '') : g.ok && g.de ? (q.sub || '').includes(g.de.replace(/\s*\([^()]+\)\s*$/, '')) : true);
  ok('1 os jogos da barra dizem de onde vêm — os da casa, emprestados, e o aluguel; o seu — ou que esperam um livre', fine(src.x, src.d) && (!!src.c.jogo || fine(src.c, src.t)), `Dados ${said(src.x, src.d)}; Tabuletas ${said(src.c, src.t)}`);
  await shot(`2-mesa${PC ? '-pc' : ''}`);
  if (ATE < 2) { await fim(); return; }
  // ================================ 2: the list of actions — the table's, then someone's of the table by name
  await semMenu();
  if (PC) { await page.keyboard.press('y'); } else { const t = await page.$('.ih-tb .ih-tbtn[data-k="acoes"]'); const b = t && await t.boundingBox(); if (b) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); }
  await E(() => window.__T.ui(6)); await wait(600); const m3 = await measure();
  ok('2 «Ações»: a lista da mesa, inteira na tela, cada ação com o porquê quando não dá', m3.A.lista && m3.inSheet && !m3.side && !m3.small.length && !m3.offWhy && m3.rows.length >= 6, `${m3.rows.join(' | ')}${m3.small.length ? '; pequenos: ' + m3.small.join(', ') : ''}`);
  await E(() => window.__T.f(2)); await shot(`3-lista-mesa${PC ? '-pc' : ''}`);
  const who = await E(() => { const tabs = [...document.querySelectorAll('#acoes-panel .ac-tab')]; const t = tabs.find(x => !x.querySelector('i')); return t ? t.textContent : ''; });
  if (who) { await tap('#acoes-panel .ac-tab:not(:has(i))'); await E(() => window.__T.ui(6)); }
  await wait(600); const m4 = await measure();
  const rowsOf = m4.rows.join(' | ');
  ok('2 a lista de uma pessoa da mesa, escolhida pelo nome: falar, os verbos sociais, dar, a bebida, as tabuletas, os dados; o duelo apagado com o porquê', !!who && m4.A.lista && m4.inSheet && !m4.small.length && !m4.offWhy && /Conversar/.test(rowsOf) && /Cumprimentar/.test(rowsOf) && /bebida|beber/.test(rowsOf) && /tabuletas/i.test(rowsOf) && /duelo/.test(rowsOf), `«${who}»: ${rowsOf}`);
  await E(() => window.__T.f(2)); await shot(`4-lista-pessoa${PC ? '-pc' : ''}`);
  await tap('#acoes-panel [data-a="close"]'); await E(() => window.__T.ui(4));
  if (ATE < 3) { await fim(); return; }
  // ================================ 3: the dice, from the bar to the end of a game
  // (the dice's slot as the table has it now: call the table, join the game called, or wait out the one under way and call)
  const d0 = await E(() => { const T = window.__T; const v = G.Possess.body(); T.run(() => { const x = G.JogoDados.verbo(v); return x.k === 'chamar' && x.ok || x.k === 'entrar' && x.ok; }, 120); T.ui(4); return G.JogoDados.verbo(v); });
  let dados = { start: false, turns: 0, end: false, said: [] };
  // (a game called at the body's table by another: the word says how to enter — the bar's own slot, never the F, which at the table is the
  // round, and which the phone has not: L-2183)
  if (d0.k === 'entrar') { const said = await E(() => (window.__T.toasts || []).filter(t => /^Chamam a sua mesa/.test(t)));
    ok('3 chamam a mesa para os dados: o aviso diz como entrar pela barra (não «F»)', said.length > 0 && said.every(t => /Para entrar: /.test(t) && /Dados/.test(t) && !/\bF: /.test(t)), said.join(' | ') || 'nenhum aviso'); }
  if (d0.k === 'chamar' || d0.k === 'entrar') {
    await tapSlot('jd-dados'); await E(() => { const T = window.__T; T.run(() => G.JogoDadosUI.isOpen(), 3); T.ui(8); });
    // (the lobby: the host's stake and «Começar» once someone answered yes — or, joined, the host's own start)
    await E(() => { const T = window.__T; T.run(() => { const s = G.JogoDados.corpo(G.Possess.body()); return !!s && (s.fase !== 'convite' || s.convite.some(x => x.sim)); }, 20); T.ui(6); T.f(2); });
    await wait(500); await shot(`5-dados-convite${PC ? '-pc' : ''}`);
    const host = await E(() => { const s = G.JogoDados.corpo(G.Possess.body()); return !!s && s.euHost && s.fase === 'convite'; });
    if (host) { await tap('#dados-panel [data-a="comecar"]'); await E(() => window.__T.ui(6)); }
    // (the rounds: the body's bid by the taps when it is its turn — a chip, «Dizer» —, the world's time between)
    for (let k = 0; k < 80; k++) {
      const s = await E(() => { const T = window.__T; T.run(() => { const s = G.JogoDados.corpo(G.Possess.body()); return !s || s.fase === 'fim' || (s.fase === 'palpite' && s.vez === s.eu); }, 30); T.ui(4); const s = G.JogoDados.corpo(G.Possess.body()); return s ? { fase: s.fase, minha: s.fase === 'palpite' && s.vez === s.eu, open: G.JogoDadosUI.isOpen() } : null; });
      if (!s) break; if (s.fase === 'fim') { dados.end = true; break; }
      if (s.minha) { dados.start = true; if (!s.open) await E(() => { G.JogoDadosUI.open(true); window.__T.ui(3); });
        const ch = await page.$('#dados-panel .jd-chip[data-a="pick"]'); if (ch) { await tap('#dados-panel .jd-chip[data-a="pick"]'); await E(() => window.__T.ui(3)); }
        if (dados.turns === 0) { await E(() => window.__T.f(2)); await wait(400); await shot(`6-dados-palpite${PC ? '-pc' : ''}`); }
        const said = await E(() => { const b = document.querySelector('#dados-panel [data-a="dizer"]'); return b ? b.textContent : ''; }); dados.said.push(said);
        await tap('#dados-panel [data-a="dizer"]'); await E(() => window.__T.ui(6)); dados.turns++; }
    }
    await E(() => { const T = window.__T; T.ui(8); T.f(2); }); await wait(900); await shot(`7-dados-fim${PC ? '-pc' : ''}`);
    const fimD = await E(() => { const s = G.JogoDados.corpo(G.Possess.body()); return s ? { fase: s.fase, venc: s.venc, eu: s.eu } : null; });
    ok('3 os dados pela barra, de ponta a ponta: o convite, os palpites pelos toques, o fim', dados.end && dados.turns >= 1, `${d0.k}; ${dados.turns} palpite(s) do corpo (${dados.said.join(' · ')}); o fim: ${fimD ? `${fimD.fase}, ${fimD.venc === fimD.eu ? 'o corpo venceu' : 'venceu outro'}` : 'o jogo acabou'}`);
    await tap('#dados-panel [data-a="close"]'); await E(() => window.__T.ui(4));
  } else ok('3 os dados', true, `a mesa não pode jogar agora: «${d0.why || d0.k}» — a parte não se aplica`);
  if (ATE < 4) { await fim(); return; }
  // ================================ 4: the Tabuletas, from the bar to the end of a game
  const c0 = await E(() => { const T = window.__T; T.run(() => G.Cartas.podeCorpo(G.Possess.body()).ok, 40); T.ui(4); return G.Cartas.podeCorpo(G.Possess.body()); }); await semMenu();
  if (c0.ok && !c0.jogo) {
    await tapSlot('tv-cartas'); await E(() => window.__T.ui(6)); await wait(600);
    const inv = await E(() => { const el = document.querySelector('#tab-panel .tb-over'); return { on: !!el && !el.classList.contains('hidden'), ppl: [...document.querySelectorAll('#tab-panel .tb-p')].map(x => x.textContent), txt: el ? el.textContent.slice(0, 160) : '' }; });
    await E(() => window.__T.f(2)); await shot(`8-tabuletas-convite${PC ? '-pc' : ''}`);
    ok('4 «Tabuletas» na barra: o convite — com quem (pelos nomes) e a aposta', inv.on, `${inv.ppl.join(', ') || inv.txt}`);
    // (the challenge, to each one at the table until one says yes)
    let jogo = 0; for (let k = 0; k < 4 && !jogo; k++) {
      const ps = await page.$$('#tab-panel .tb-p'); if (ps[k]) { const b = await ps[k].boundingBox(); if (PC) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await E(() => window.__T.ui(2)); }
      await tap('#tab-panel .tb-over [data-a="desafia"]'); await E(() => window.__T.ui(8)); await wait(800);
      jogo = await E(() => { const v = G.Possess.body(); const j = G.Cartas.doCorpo(v); return j ? j.jogo : 0; });
      if (!jogo && !(await page.$('#tab-panel .tb-over:not(.hidden) [data-a="desafia"]'))) break;
    }
    let rodadas = 0, fimC = null;
    if (jogo) {
      for (let k = 0; k < 40; k++) {
        await wait(1400); const st = await E(() => { const T = window.__T; T.ui(6); const j = G.Cartas.doCorpo(G.Possess.body()); const ov = document.querySelector('#tab-panel .tb-over:not(.hidden)'); return { fim: j && j.fim ? j.fim : null, n: j ? j.n : 0, posta: j ? j.posta : false, dobra: j ? j.dobra : '', ov: ov ? ov.textContent.slice(0, 60) : '', busy: document.querySelector('#tab-panel').classList.contains('busy') }; });
        if (st.fim) { fimC = st.fim; break; }
        if (st.dobra === 'outro') { await tap('#tab-panel .tb-over [data-a="aceita"]'); await E(() => window.__T.ui(6)); continue; }
        if (st.busy || st.posta) { await E(() => window.__T.ui(6)); continue; } // (the tablets fly in the page's own time: the world almost still)
        // (a tablet raised by a tap, and played by another tap: «Jogar»)
        await tap('#tab-panel .tb-mao .ct-card'); await E(() => window.__T.ui(3)); if (rodadas === 2) { await E(() => window.__T.f(2)); await shot(`9-tabuletas-mesa${PC ? '-pc' : ''}`); }
        await tap('#tab-panel .tb-go'); await E(() => window.__T.ui(6)); rodadas++;
      }
      await wait(1500); await E(() => { const T = window.__T; T.ui(8); T.f(2); }); await wait(600); await shot(`10-tabuletas-fim${PC ? '-pc' : ''}`);
    }
    ok('4 as Tabuletas pela barra, de ponta a ponta: o desafio, as rodadas pelos toques, o fim da partida pela regra', !!jogo && !!fimC && fimC.por !== 'fechou' && rodadas >= 3, jogo ? `${rodadas} tabuleta(s) jogada(s) pelos toques; o fim: ${fimC ? `${fimC.meu > 0 ? 'vitória' : fimC.meu < 0 ? 'derrota' : 'empate'} (${fimC.por || 'pela glória'})` : 'NÃO ACABOU'}` : 'ninguém aceitou o desafio');
  } else ok('4 as Tabuletas', true, `não dá agora: «${c0.why || 'já numa partida'}» — a parte não se aplica`);
  await fim();
  async function fim() {
    const me = await E(() => Object.keys(G.modErr || {}));
    ok('sem erros', !errs.length && !me.length, errs.concat(me).join(' | ').slice(0, 400) || 'nenhum');
    await browser.close(); console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU'); process.exit(fails.length ? 1 : 0);
  }
})();
