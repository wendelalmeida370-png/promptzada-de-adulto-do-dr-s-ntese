// ensina-fotos: bash qa/navegador.sh node qa/visual/ensina-fotos.js PASTA [mundo] [pc] — os jogos se ensinam (a frente E da onda 4,
// D-945 a D-949) no navegador, com o 3D de verdade (WebGL sem GPU), na tela do dono — o app do Claude no Android, 411 × 724, pelo toque,
// com a letra mínima do WebView (8 px: o Chromium inteiro, com a preferência) — ou, com «pc», na do PC (1280 × 760: o mouse e as teclas).
// O corpo senta a uma mesa de taverna com gente (a mesma montagem da qa/visual/acoes-fotos.js), e tudo pelos toques ou pelas teclas,
// como o dono faria, com uma foto de cada passo do guia:
//  e1 as Tabuletas: «Tabuletas» na barra, o desafio; o guia da primeira partida aparece sozinho e anda com ela — as sete rodadas, a mão
//     (erguer, jogar), as duas que viram, quem leva a glória, os poderes da mão, quem mostra primeiro, dobrar, a manga, quem ganha —; a
//     partida até o fim pelos toques;
//  e2 o copo: «Dados» na barra; o guia — o copo, os seus dados, o palpite de todos, a sua vez (o palpite pelos toques), os copos que
//     sobem, quem leva o pote —, a partida andando pelo passo do mundo;
//  e3 a segunda partida de cada um: o guia não volta; o «?» das Tabuletas abre as regras com figuras e traz o guia de volta; o do copo
//     também o traz;
//  e4 «Jogar de novo», no fim da partida das Tabuletas, mostra a partida nova na hora (L-2204).
// Cada jogo na sua noite: o jogo é aberto de novo antes do copo — quatro partidas não cabem numa noite de taverna (T-2102) —, e o
// navegador lembra o que viu, como o do dono.
// Em cada passo, o verificador do guia (G.JogosEnsina.check: cada alvo visível e na tela, o balão inteiro na tela sem cobrir o alvo nem o
// que fica livre, nenhum texto cortado, o dedo no que se toca); a lembrança no navegador; e nenhum erro de página, de console nem de módulo.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'ensina-fotos'); fs.mkdirSync(OUT, { recursive: true });
const WORLD = process.argv[3] || 'metropole'; const PC = process.argv[4] === 'pc';
const VW = PC ? 1280 : 411, VH = PC ? 760 : 724;
(async () => {
  // (the browser: the whole Chromium with its own profile — the phone's with the WebView's minimum font, as on the owner's phone)
  const ud = path.join(OUT, '.perfil-' + (PC ? 'pc' : 'cel')); fs.rmSync(ud, { recursive: true, force: true }); fs.mkdirSync(path.join(ud, 'Default'), { recursive: true });
  if (!PC) fs.writeFileSync(path.join(ud, 'Default', 'Preferences'), JSON.stringify({ webkit: { webprefs: { minimum_font_size: 8, minimum_logical_font_size: 8 } } }));
  const ctx = await chromium.launchPersistentContext(ud, Object.assign({ channel: 'chromium', viewport: { width: VW, height: VH }, deviceScaleFactor: PC ? 1 : 2, args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] }, PC ? {} : { isMobile: true, hasTouch: true }));
  const page = ctx.pages()[0] || await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver Message|GroupMarkerNotSet|software WebGL|WebGL: INVALID|CONTEXT_LOST/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  // (the first game of each: nothing remembered in the browser — the profile is new —; the page opened again keeps what it remembers,
  // as the owner's)
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | ensina-fotos ${name} | ${info}`); if (!cond) fails.push(name.split(' ')[0]); };
  const shot = async name => { try { await page.screenshot({ path: path.join(OUT, name + '.png'), timeout: 480000 }); console.log('foto: ' + path.join(OUT, name + '.png')); } catch (e) { console.log('(foto ' + name + ' não saiu: ' + e.message.slice(0, 60) + ')'); } };
  const E = (fn, arg) => page.evaluate(fn, arg);
  const wait = ms => page.waitForTimeout(ms);
  // (a tap where the finger would: the middle of an element — the phone's touch; on the PC a click of the mouse there)
  const tap = async sel => { const el = await page.$(sel); if (!el) return false; const b = await el.boundingBox(); if (!b) return false; if (PC) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); return true; };
  const slotOf = id => E(id => { const L = G.AcoesUI.shown().itens; return L.findIndex(q => q.id === id); }, id);
  const semMenu = async () => { if (await E(() => G.CardapioUI.isOpen())) { await tap('#menu-panel .mn-no'); await E(() => window.__T.ui(6)); } };
  // (a slot of the bar: a tap on the phone, its key on the PC — again a few times, the bar just come up: the place, the button, the why)
  const tapSlot = async id => { for (let n = 0; n < 4; n++) { if (n) { await wait(300); await E(() => window.__T.ui(4)); } await semMenu(); const i = await slotOf(id); if (i < 0) { console.log(`(a barra sem «${id}»)`); continue; }
    if (PC) { const k = await E(i => G.AcoesUI.shown().itens[i].key, i); if (!k) continue; await page.keyboard.press(k === 'Espaço' ? ' ' : k.toLowerCase()); return true; }
    if (await tap(`.ac-mesa .ac-b[data-i="${i}"]`)) return true; console.log(`(o lugar ${i} da barra, «${id}», sem o botão na tela)`); } return false; };
  // (the game opened, in an evening of its own — the cup's again, after the Tabuletas: four games do not fit in one tavern night, T-2102 —;
  // the body at a tavern's table with people — the acoes-fotos' own setting: the evening, a table of two or more who could play, a seat
  // taken by the verb «lugar» as the hands do)
  async function abre() {
    console.log('(abrindo o jogo: ' + new Date().toISOString().slice(11, 19) + ')');
    await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900); await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
    await page.addScriptTag({ path: path.join(ROOT, 'qa', 'qa.js') });
    await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
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
      T.pk = pk; T.calm = calm; T.seatsOf = seatsOf; T.taverns = taverns; // (the guide's proof moves to another table when nobody at this one plays the Tabuletas)
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
    if (r0.none) { ok('o retrato', false, r0.none); await ctx.close(); process.exit(1); }
    console.log(r0.who);
    // (the keeper comes with the menu by himself — the house's: P7 —, and the hands say «agora não»)
    await E(() => { const T = window.__T; T.run(() => G.CardapioUI.isOpen() || G.AcoesUI.shown().mesa, 40); T.ui(4); }); await semMenu();
    // (the word of the table's first time — the I front's — is said «Entendi» to: this proof is the guide's)
    if (await E(() => G.AcoesUI.shown().dica)) { await tap('.ac-dica [data-a="ok"]'); await E(() => window.__T.ui(4)); }
    return E(() => G.S.clock);
  }
  const t0 = await abre();

  // ================================ the guide as it goes: each step seen once, its photo, its verifier's word
  // (a frame of the screen first: the tables' animations change the page in real time, between the frames the proof gives — the game gives
  // sixty a second, and the guide follows each one)
  const guia = () => E(() => { window.__T.ui(1); return { a: G.JogosEnsina.ativo(), chk: G.JogosEnsina.check(), btn: !!document.querySelector('.ens:not(.hidden) .ens-go:not(.hidden)'), vis: !!document.querySelector('.ens:not(.hidden)') }; });
  const vistos = { tabuletas: [], copo: [] }; const ruins = [];
  async function olha(g, parte) {
    const s = await guia(); if (!s.a || !s.a.visivel || !s.a.passo || s.a.id !== g) return s;
    if (!vistos[g].some(q => q.id === s.a.passo)) {
      await E(() => window.__T.f(2)); await wait(380); const s2 = await guia(); const n = vistos[g].length + 1;
      vistos[g].push({ id: s.a.passo, chk: s2.chk }); for (const c of s2.chk) ruins.push(`${g}/${c}`);
      await shot(`${parte}-${String(n).padStart(2, '0')}-${s.a.passo}${PC ? '-pc' : ''}`);
      return s2;
    }
    return s;
  }
  const said = g => vistos[g].map(q => q.id + (q.chk.length ? ` (${q.chk.join('; ')})` : '')).join(' → ');

  // ================================ e1: the Tabuletas, guided, to the end of the game
  const c0 = await E(() => { const T = window.__T; T.run(() => G.Cartas.podeCorpo(G.Possess.body()).ok, 15); T.ui(4); return G.Cartas.podeCorpo(G.Possess.body()); }); await semMenu();
  // (the challenge, to each one at the table until one says yes — as the acoes-fotos)
  // (a seco — the stake is not what this proof is about: who refuses for the coins does not refuse —, each one at the table in turn; the
  // why of each «no» is the world's, told to the player: kept for the report)
  const recusas = [];
  async function desafio() {
    const sl = await tapSlot('tv-cartas'); await E(() => window.__T.ui(6)); await wait(500); let jogo = 0;
    // (what the screen showed when the table was asked for: the slot, the panel, the sheet, the words)
    const tela = await E(() => { const P = document.querySelector('#tab-panel'); const ov = P && P.querySelector('.tb-over:not(.hidden)'); const it = (G.AcoesUI.shown().itens || []).find(q => q.id === 'tv-cartas');
      return { painel: !!P && !P.classList.contains('hidden'), folha: ov ? ov.textContent.replace(/\s+/g, ' ').slice(0, 140) : '', lugar: it ? `${it.nome}${it.ok ? '' : ' — ' + it.why}` : 'sem o lugar na barra', mesa: G.AcoesUI.shown().mesa, cardapio: G.CardapioUI.isOpen(), avisos: (window.__T.toasts || []).slice(-3) }; });
    if (!tela.folha) { console.log(`(o convite não abriu: o toque ${sl ? 'foi' : 'NÃO foi'} dado; ${JSON.stringify(tela)})`); await shot(`e1-sem-convite-${Date.now() % 100000}${PC ? '-pc' : ''}`); }
    for (let k = 0; k < 4 && !jogo; k++) {
      const ps = await page.$$('#tab-panel .tb-p'); if (ps[k]) { const b = await ps[k].boundingBox(); if (PC) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await E(() => window.__T.ui(2)); }
      if (await page.$('#tab-panel .tb-over [data-ap="0"]')) { await tap('#tab-panel .tb-over [data-ap="0"]'); await E(() => window.__T.ui(2)); }
      const n0 = await E(() => (window.__T.toasts || []).length);
      await tap('#tab-panel .tb-over [data-a="desafia"]'); await E(() => window.__T.ui(8)); await wait(700);
      jogo = await E(() => { const j = G.Cartas.doCorpo(G.Possess.body()); return j ? j.jogo : 0; });
      if (!jogo) recusas.push(...await E(n0 => (window.__T.toasts || []).slice(n0), n0));
      if (!jogo && !(await page.$('#tab-panel .tb-over:not(.hidden) [data-a="desafia"]'))) break;
    }
    return jogo;
  }
  // (nobody at this table plays the Tabuletas — the world's «no», by each one's índole —: another table of the body's people with people at
  // it, a seat there by the verb «lugar», as the hands do)
  const mudaMesa = () => E(() => { const T = window.__T; const In = G.Interiors; const g0 = In.groupOf(T.pk.b, T.pk.pl.it.id); let best = null;
    for (const b of T.taverns()) { if (G.Village.facOfSet(b.set) !== G.Fac.idOfV(T.pk.v)) continue; const kp = G.Taverna.keeperOf(b); if (!kp || !G.Taverna.atHand(b)) continue; const { at, seats } = T.seatsOf(b, 1);
      for (const q of seats) { const g = In.groupOf(b, q.it.id); if (b === T.pk.b && g === g0) continue; const n = at.get(g) || 0; if (!best || n > best.n) best = { b, kp, pl: q, n }; } }
    if (!best) return 'nenhuma outra mesa com gente';
    if (G.CartasUI.isOpen()) G.CartasUI.close(); Object.assign(T.pk, best); const why = T.seat(); T.run(() => G.Cartas.podeCorpo(G.Possess.body()).ok, 6); T.ui(4);
    return why || `à mesa com ${best.n} na ${G.Village.buildName(best.b)} #${best.b.id}`; });
  // (a tablet of the hand: the middle one, as the guide's finger shows — tapped on the phone, clicked on the PC)
  const tapCard = async () => { const n = await E(() => document.querySelectorAll('#tab-panel .tb-mao .ct-card').length); if (!n) return false; return tap(`#tab-panel .tb-mao .ct-card:nth-child(${Math.floor(n / 2) + 1})`); };
  let jogoT = 0, fimT = null, guiaT = { fim: false, lembrado: '' }, lances = 0;
  if (!c0.ok) { const r = await mudaMesa(); console.log(`(as Tabuletas não dão aqui — ${c0.why} —; outra mesa: ${r})`); Object.assign(c0, await E(() => G.Cartas.podeCorpo(G.Possess.body()))); }
  if (c0.ok && !c0.jogo) {
    jogoT = await desafio();
    for (let m = 0; m < 2 && !jogoT; m++) { const r = await mudaMesa(); console.log(`(ninguém aceitou — ${recusas.join(' | ') || 'sem resposta'} —; outra mesa: ${r})`); await semMenu(); jogoT = await desafio(); }
    if (jogoT) {
      for (let k = 0; k < 260; k++) {
        await wait(280);
        const st = await E(() => { const T = window.__T; T.ui(3); const j = G.Cartas.doCorpo(G.Possess.body()); return { fim: j && j.fim ? j.fim : null, dobra: j ? j.dobra : '', posta: j ? j.posta : false, busy: document.querySelector('#tab-panel').classList.contains('busy'), sel: !!document.querySelector('#tab-panel .tb-mao .ct-card.sel'), open: G.CartasUI.isOpen() }; });
        if (st.fim) { fimT = st.fim; break; }
        if (!st.open) { await E(() => { const j = G.Cartas.doCorpo(G.Possess.body()); if (j) G.CartasUI.abrir(j.jogo); window.__T.ui(3); }); continue; }
        if (st.dobra === 'outro') { await tap('#tab-panel .tb-over [data-a="aceita"]'); await E(() => window.__T.ui(6)); continue; }
        const s = await olha('tabuletas', 'e1');
        if (s.a && s.a.visivel) {
          if (s.btn) { await tap('.ens:not(.hidden) .ens-go'); await E(() => window.__T.ui(3)); continue; }
          if (s.a.passo === 'mao') { await tapCard(); await E(() => window.__T.ui(3)); continue; }
          if (s.a.passo === 'joga') { if (PC) await page.keyboard.press('e'); else await tap('#tab-panel .tb-mao .ct-card.sel'); await E(() => window.__T.ui(6)); lances++; continue; }
          continue; // (a step that goes with the game: the tablets turning)
        }
        if (st.busy || st.posta) continue; // (the tablets fly in the page's own time: the world almost still)
        // (no step of the guide now: the game on — a tablet raised, and played)
        if (!st.sel) { await tapCard(); await E(() => window.__T.ui(3)); continue; }
        await tap('#tab-panel .tb-go'); await E(() => window.__T.ui(6)); lances++;
      }
      await wait(1200); await E(() => { const T = window.__T; T.ui(8); T.f(2); }); await wait(500); await shot(`e1-fim${PC ? '-pc' : ''}`);
      guiaT = await E(() => { let m = ''; try { m = localStorage.getItem('gotaf-guia-tabuletas'); } catch (e) { } return { fim: !G.JogosEnsina.ativo(), lembrado: m, vis: !!document.querySelector('#tab-panel .ens:not(.hidden)') }; });
    }
    const todos = ['ola', 'trilha', 'mao', 'joga', 'vira', 'leva', 'poderes', 'visao', 'dobrar', 'manga', 'fim'];
    const faltam = todos.filter(id => !vistos.tabuletas.some(q => q.id === id)); const maus = vistos.tabuletas.filter(q => q.chk.length);
    ok('e1 as Tabuletas: o guia da primeira partida, passo a passo, sobre a partida de verdade', !!jogoT && !faltam.length && !maus.length && guiaT.fim && !guiaT.vis && guiaT.lembrado === '1' && !!fimT,
      jogoT ? `${said('tabuletas')}${faltam.length ? ` — FALTAM: ${faltam.join(', ')}` : ''}; ${lances} tabuleta(s) jogada(s) pelos ${PC ? 'cliques e teclas' : 'toques'}; o fim da partida: ${fimT ? `${fimT.meu > 0 ? 'vitória' : fimT.meu < 0 ? 'derrota' : 'empate'} (${fimT.por})` : 'NÃO ACABOU'}; o guia ${guiaT.fim && !guiaT.vis ? 'sumiu' : 'FICOU'}, lembrado «${guiaT.lembrado}»` : `ninguém aceitou o desafio${recusas.length ? ': ' + recusas.join(' | ') : ''}`);
  } else ok('e1 as Tabuletas', false, `não deu: «${c0.why || 'já numa partida'}»`);
  // ================================ e3: the second game of each — no guide; the «?» brings it back — right after the first
  // (the Tabuletas again: the guide stays away; the «?» opens the rules with figures and «Ver o guia» brings it back)
  let e3t = 'não houve a segunda partida', e4 = null;
  for (let k = 0; k < 24 && jogoT && !(await page.$('#tab-panel .tb-over:not(.hidden) [data-a="denovo"]')); k++) { await wait(250); await E(() => window.__T.ui(2)); } // (the end sheet, after the last round's animation)
  // («Jogar de novo» on the end sheet, at once, as the player does — the night is short, T-2102 —: the invitation «a seco» and «Desafiar»)
  const denovo = async () => { if (!(await tap('#tab-panel .tb-over:not(.hidden) [data-a="denovo"]'))) return false; await E(() => window.__T.ui(6)); await wait(400);
    if (await page.$('#tab-panel .tb-over:not(.hidden) [data-ap="0"]')) { await tap('#tab-panel .tb-over [data-ap="0"]'); await E(() => window.__T.ui(2)); }
    if (await page.$('#tab-panel .tb-over:not(.hidden) [data-a="desafia"]')) { await tap('#tab-panel .tb-over [data-a="desafia"]'); await E(() => window.__T.ui(8)); await wait(700); }
    return true; };
  // (the game the world has the body in, and the one the screen shows: the end sheet over the table — another sheet, the other's asking
  // to double, is the new game's own —, the hand)
  const naTela = () => E(() => { window.__T.ui(2); const v = G.Possess.body(); const vivo = G.Cartas.vivoDe(v); const tela = G.Cartas.doCorpo(v); const P = document.querySelector('#tab-panel');
    const ov = P && !P.classList.contains('hidden') ? P.querySelector('.tb-over:not(.hidden) .tb-end') : null;
    return { vivo: vivo ? vivo.id : 0, tela: tela ? tela.jogo : 0, folha: ov ? ((ov.querySelector('h3') || ov).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) : '', mao: P ? P.querySelectorAll('.tb-mao .ct-card').length : 0 }; });
  let j2 = 0;
  if (jogoT && await denovo()) {
    const n1 = await naTela(); e4 = { n1, n2: null }; j2 = n1.vivo;
    await E(() => window.__T.f(2)); await wait(300); await shot(`e4-jogar-de-novo${PC ? '-pc' : ''}`);
    // (L-2204: the screen showed the game just ended — its end sheet again — while the new one ran behind it; the player taps «Jogar de
    // novo» again once the end is gone from the table, C.FIM_T seconds of the world later, and the new one opens)
    if (n1.vivo && (n1.tela !== n1.vivo || n1.folha)) {
      await E(() => { const T = window.__T; const v = G.Possess.body(); T.run(() => { const j = G.Cartas.doCorpo(v), w = G.Cartas.vivoDe(v); return !w || (j && j.jogo === w.id); }, 10); T.ui(4); });
      if (await page.$('#tab-panel .tb-over:not(.hidden) [data-a="denovo"]')) { await tap('#tab-panel .tb-over [data-a="denovo"]'); await E(() => window.__T.ui(6)); await wait(400); }
      e4.n2 = await naTela(); j2 = e4.n2.vivo && e4.n2.tela === e4.n2.vivo ? e4.n2.vivo : 0;
    }
  }
  if (e4) ok('e4 «Jogar de novo» mostra a partida nova na hora', !!e4.n1.vivo && e4.n1.tela === e4.n1.vivo && !e4.n1.folha && e4.n1.mao > 0,
    !e4.n1.vivo ? 'nenhuma partida nova começou' : e4.n1.tela === e4.n1.vivo && !e4.n1.folha ? `a partida #${e4.n1.vivo} na tela, ${e4.n1.mao} tabuletas na mão`
      : `a partida nova (#${e4.n1.vivo}) começou — a aposta feita —, e a tela mostrou ${e4.n1.tela !== e4.n1.vivo ? `a de antes (#${e4.n1.tela})` : 'a folha'}${e4.n1.folha ? `, com «${e4.n1.folha}»` : ''} (L-2204: o G.Cartas.de do cartas-mesa.js dá a primeira partida pela ordem, a que acabou, por C.FIM_T s); o segundo «Jogar de novo», depois disso: ${e4.n2 ? (e4.n2.tela === e4.n2.vivo && !e4.n2.folha ? `a partida nova na tela, ${e4.n2.mao} tabuletas na mão` : `AINDA NÃO (a tela na #${e4.n2.tela}${e4.n2.folha ? `, «${e4.n2.folha}»` : ''})`) : 'não houve'}`);
  const c1 = j2 ? { ok: true } : await E(() => { const T = window.__T; if (G.CartasUI.isOpen()) G.CartasUI.close(); T.run(() => G.Cartas.podeCorpo(G.Possess.body()).ok, 12); T.ui(4); return G.Cartas.podeCorpo(G.Possess.body()); }); await semMenu();
  if (c1.ok && (j2 || !c1.jogo)) {
    if (!j2) j2 = await desafio();
    if (j2) {
      // (the other asking to double as the round opens: said yes to — the sheet over the table is the game's, not the guide's)
      if (await page.$('#tab-panel .tb-over:not(.hidden) [data-a="aceita"]')) { await tap('#tab-panel .tb-over [data-a="aceita"]'); await E(() => window.__T.ui(6)); }
      let nunca = true; for (let k = 0; k < 8; k++) { await wait(250); const g = await E(() => { window.__T.ui(3); return { a: G.JogosEnsina.ativo(), vis: !!document.querySelector('#tab-panel .ens:not(.hidden)') }; }); if (g.a || g.vis) nunca = false; }
      await E(() => window.__T.f(2)); await wait(300); await shot(`e3-segunda-sem-guia${PC ? '-pc' : ''}`);
      await tap('#tab-panel .tb-ajuda'); await E(() => window.__T.ui(3)); await wait(450);
      const rg = await E(() => { const f = document.querySelector('#tab-panel .ens-regras:not(.hidden) .ens-folha'); return f ? { poderes: f.querySelectorAll('.ens-poderes li').length, figs: f.querySelectorAll('.ens-fig').length, dentro: (r => r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight)(f.getBoundingClientRect()), lado: document.documentElement.scrollWidth > innerWidth + 1 } : null; });
      await E(() => window.__T.f(2)); await wait(300); await shot(`e3-regras${PC ? '-pc' : ''}`);
      await tap('#tab-panel .ens-regras [data-ens="guia"]'); await wait(300);
      const volta = await E(() => { const T = window.__T; T.ui(4); return { a: G.JogosEnsina.ativo(), chk: G.JogosEnsina.check() }; });
      await E(() => window.__T.f(2)); await wait(300); await shot(`e3-guia-de-volta${PC ? '-pc' : ''}`);
      await tap('.ens:not(.hidden) [data-ens="pula"]'); await E(() => window.__T.ui(3));
      const pulou = await E(() => !G.JogosEnsina.ativo());
      ok('e3 a segunda partida das Tabuletas: o guia não volta; o «?» abre as regras com figuras e traz o guia', nunca && !!rg && rg.poderes >= 10 && rg.figs >= 2 && rg.dentro && !rg.lado && !!volta.a && volta.a.visivel && volta.a.passo === 'ola' && !volta.chk.length && pulou,
        `sem o guia: ${nunca ? 'sim' : 'NÃO — VOLTOU'}; as regras: ${rg ? `${rg.figs} figuras, ${rg.poderes} poderes desta partida, ${rg.dentro ? 'na tela' : 'FORA DA TELA'}${rg.lado ? ', ROLAGEM DE LADO' : ''}` : 'NÃO ABRIRAM'}; «Ver o guia»: ${volta.a ? `o passo «${volta.a.passo}»${volta.chk.length ? ' — ' + volta.chk.join('; ') : ''}` : 'NÃO VOLTOU'}; «Pular o guia»: ${pulou ? 'sumiu' : 'FICOU'}`);
      e3t = '';
      // (leaving the game: the «×» and «Desistir»)
      await tap('#tab-panel .tb-x'); await E(() => window.__T.ui(3)); await tap('#tab-panel .tb-over [data-a="desiste"]'); await E(() => window.__T.ui(8)); await wait(600);
      await E(() => { if (G.CartasUI.isOpen()) G.CartasUI.close(); window.__T.ui(4); });
    }
  }
  if (e3t) ok('e3 a segunda partida das Tabuletas', false, e3t);
  await E(() => { if (G.CartasUI.isOpen()) G.CartasUI.close(); window.__T.ui(4); });
  const tT = await E(() => G.S.clock);
  console.log(`(o mundo andou ${(tT - t0).toFixed(1)} s nas Tabuletas)`);
  // (the cup in an evening of its own: the game opened again — the browser remembers the Tabuletas' guide, as the owner's would)
  const t0c = await abre();

  // ================================ e2: the cup, guided — the game going by the world's step
  async function copo(parte, guiar) {
    const d0 = await E(() => { const T = window.__T; const v = G.Possess.body(); T.run(() => { const x = G.JogoDados.verbo(v); return (x.k === 'chamar' || x.k === 'entrar') && x.ok; }, 20); T.ui(4); return G.JogoDados.verbo(v); }); await semMenu();
    if (!((d0.k === 'chamar' || d0.k === 'entrar') && d0.ok)) { const r = await mudaMesa(); console.log(`(o copo não dá aqui — ${d0.why || d0.k} —; outra mesa: ${r})`);
      Object.assign(d0, await E(() => { const T = window.__T; const v = G.Possess.body(); T.run(() => { const x = G.JogoDados.verbo(v); return (x.k === 'chamar' || x.k === 'entrar') && x.ok; }, 10); T.ui(4); return G.JogoDados.verbo(v); })); await semMenu(); }
    if (!((d0.k === 'chamar' || d0.k === 'entrar') && d0.ok)) return { none: d0.why || d0.k || 'a mesa não pode jogar' };
    await tapSlot('jd-dados'); await E(() => { const T = window.__T; T.run(() => G.JogoDadosUI.isOpen(), 3); T.ui(6); });
    let bids = 0, comecou = false; const out = { bids: 0, fim: '', fases: [] };
    for (let k = 0; k < 400; k++) {
      if (guiar) { const s = await olha('copo', parte);
        if (s.a && s.a.visivel) {
          if (s.btn) { await tap('.ens:not(.hidden) .ens-go'); await E(() => window.__T.ui(3)); continue; }
          if (s.a.passo === 'vez') { if (await page.$('#dados-panel .jd-chip[data-a="pick"]')) { await tap('#dados-panel .jd-chip[data-a="pick"]'); await E(() => window.__T.ui(3)); }
            if (PC) await page.keyboard.press('Enter'); else await tap('#dados-panel [data-a="dizer"]'); await E(() => window.__T.ui(6)); bids++; continue; } } }
      const st = await E(() => { const T = window.__T; const v = G.Possess.body(); const a0 = G.JogosEnsina.ativo(); const k0 = a0 && a0.visivel ? a0.passo : '';
        // (the world on until something changes: the guide's step, the body's turn, the host's start, the end)
        T.run(() => { const a = G.JogosEnsina.ativo(); const s = G.JogoDados.corpo(v); return (a && a.visivel && a.passo !== k0) || !s || s.fase === 'fim' || (s.fase === 'palpite' && s.vez === s.eu && !s.jogadores.find(p => p.eu).palpite) || (s.fase === 'convite' && s.euHost && s.convite.some(x => x.sim)); }, 5);
        T.ui(4); const s = G.JogoDados.corpo(v); return s ? { fase: s.fase, r: s.rodada, minha: s.fase === 'palpite' && s.vez === s.eu, host: s.euHost && s.fase === 'convite', sim: s.convite.some(x => x.sim), open: G.JogoDadosUI.isOpen() } : null; });
      if (!st) break; if (out.fases[out.fases.length - 1] !== st.fase) out.fases.push(st.fase);
      if (st.fase === 'fim') { out.fim = 'fim'; if (guiar) { await wait(300); const s = await olha('copo', parte); if (s.a && s.a.visivel && s.btn) await tap('.ens:not(.hidden) .ens-go'); } break; }
      if (!st.open) await E(() => { G.JogoDadosUI.open(true); window.__T.ui(3); });
      if (st.host && st.sim && !comecou) { comecou = true; await tap('#dados-panel [data-a="comecar"]'); await E(() => window.__T.ui(6)); continue; }
      const g = guiar ? await guia() : null;
      if (st.minha && !(g && g.a && g.a.visivel && g.a.passo === 'vez')) { if (await page.$('#dados-panel .jd-chip[data-a="pick"]')) await tap('#dados-panel .jd-chip[data-a="pick"]'); await E(() => window.__T.ui(2)); await tap('#dados-panel [data-a="dizer"]'); await E(() => window.__T.ui(6)); bids++; }
      if (!guiar && out.fases.includes('palpite') && k > 3) break; // (the second game: started, enough to see the guide does not come back)
      // (the guide done — its last step said «Entendi» —: the game is left, the night is short for four games: T-2102)
      if (guiar && vistos.copo.some(q => q.id === 'fim') && !(await E(() => { const a = G.JogosEnsina.ativo(); return !!a && a.id === 'copo'; }))) { out.fim = 'largou'; await tap('#dados-panel [data-a="sair"]'); await E(() => window.__T.ui(6)); break; }
    }
    out.bids = bids; return out;
  }
  const r2 = await copo('e2', true);
  await E(() => { const T = window.__T; T.ui(8); T.f(2); }); await wait(500); await shot(`e2-depois${PC ? '-pc' : ''}`);
  const guiaD = await E(() => { let m = ''; try { m = localStorage.getItem('gotaf-guia-copo'); } catch (e) { } return { fim: !G.JogosEnsina.ativo() || G.JogosEnsina.ativo().id !== 'copo', lembrado: m }; });
  { const maus = vistos.copo.filter(q => q.chk.length); const essenciais = ['ola', 'vez', 'fim'].filter(id => !vistos.copo.some(q => q.id === id));
    ok('e2 o copo: o guia da primeira partida anda com o jogo e espera a vez do corpo', !r2.none && !maus.length && !essenciais.length && guiaD.fim && guiaD.lembrado === '1',
      r2.none ? `não deu: «${r2.none}»` : `${said('copo')}${essenciais.length ? ` — FALTAM: ${essenciais.join(', ')}` : ''}; ${r2.bids} palpite(s) pelos ${PC ? 'cliques e teclas' : 'toques'}; as fases ${r2.fases.join(' → ')}; o guia ${guiaD.fim ? 'sumiu' : 'FICOU'}, lembrado «${guiaD.lembrado}»`); }
  // (the cup again: the guide stays away; its «?» brings it back)
  const r3 = await copo('e3', false);
  if (!r3.none) {
    const g0 = await E(() => ({ a: G.JogosEnsina.ativo(), open: G.JogoDadosUI.isOpen() }));
    if (!g0.open) await E(() => { G.JogoDadosUI.open(true); window.__T.ui(3); });
    await tap('#dados-panel .jd-ajuda'); await E(() => window.__T.ui(3)); await wait(400);
    await E(() => window.__T.f(2)); await wait(300); await shot(`e3-copo-regras${PC ? '-pc' : ''}`);
    await tap('#dados-panel .jd-regras [data-a="guia"]'); await E(() => window.__T.ui(4)); await wait(300);
    const volta = await E(() => { const T = window.__T; T.ui(3); return { a: G.JogosEnsina.ativo(), chk: G.JogosEnsina.check() }; });
    await E(() => window.__T.f(2)); await wait(300); await shot(`e3-copo-guia-de-volta${PC ? '-pc' : ''}`);
    await tap('.ens:not(.hidden) [data-ens="pula"]'); await E(() => window.__T.ui(3));
    ok('e3 a segunda partida do copo: o guia não volta; o «?» o traz', !g0.a && !!volta.a && volta.a.id === 'copo' && volta.a.visivel && !volta.chk.length, `sem o guia: ${!g0.a ? 'sim' : 'NÃO — VOLTOU'}; «Ver o guia» no «?»: ${volta.a ? `o passo «${volta.a.passo}»${volta.chk.length ? ' — ' + volta.chk.join('; ') : ''}` : 'NÃO VOLTOU'}`);
    await tap('#dados-panel [data-a="sair"]'); await E(() => window.__T.ui(6));
  } else ok('e3 a segunda partida do copo', false, `não deu: «${r3.none}»`);
  await E(() => { if (G.JogoDadosUI.isOpen()) G.JogoDadosUI.close(); window.__T.ui(4); });

  const t1 = await E(() => G.S.clock);
  console.log(`(o mundo andou ${(t1 - t0c).toFixed(1)} s no copo)`);
  const me = await E(() => Object.keys(G.modErr || {}));
  ok('sem erros', !errs.length && !me.length && !ruins.length, errs.concat(me, ruins).join(' | ').slice(0, 500) || 'nenhum');
  await ctx.close(); fs.rmSync(ud, { recursive: true, force: true });
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU'); process.exit(fails.length ? 1 : 0);
})();
