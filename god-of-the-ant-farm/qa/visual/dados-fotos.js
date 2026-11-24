// dados-fotos: bash qa/navegador.sh node qa/visual/dados-fotos.js PASTA [pc] — as fotos da tela do jogo de copo (a quarta onda, T4,
// D-850 a D-859), para ver e julgar: dois povos bem diferentes (o romano no mármore, o asteca no petate; TEMAS=a,b para outros), cada um
// em quatro momentos — os dados do corpo rolando depois da sacudida do copo, a vez do corpo (o palpite, a régua, os balões dos outros),
// a revelação (os copos de pé, a soma, quem cravou) e o fim (o pote que voa para o vencedor) —, no celular em pé (390 × 844) ou, com
// «pc», na tela do PC. Só o painel, desenhado pelo próprio jogo-dados-ui.js com os rostos de gente de verdade da metrópole pronta; sem o
// 3D (segundos). O mundo não muda: a mão das fotos só troca as perguntas da tela (o corpo, o modo, a leitura do jogo) por respostas de
// mentira — a leitura do jogo é uma vista feita aqui, no formato do G.JogoDados.corpo —, e nada é pedido ao mundo. Grava cada uma
// (PASTA/tema-momento.png) e a folha (PASTA/folha.png); diz se algo saiu da tela, se há rolagem de lado e os botões de menos de 44 px.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'dados-fotos'); fs.mkdirSync(OUT, { recursive: true });
const PC = process.argv[3] === 'pc'; const W = PC ? 1280 : 390, H = PC ? 760 : 844;
const TEMAS = (process.env.TEMAS || 'romano,asteca').split(','), MOM = (process.env.MOM || 'rolando,palpite,revela,fim').split(',');
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
  const page = await browser.newPage(PC ? { viewport: { width: W, height: H } } : { viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|WebGL|GL Driver/.test(t)) errs.push('console: ' + t.slice(0, 200)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); localStorage.setItem('gotaf-guia-tabuletas', '1'); localStorage.setItem('gotaf-guia-copo', '1'); } catch (e) { } }); // (o guia da primeira partida já visto: o guia tem a sua prova, qa/visual/ensina-fotos.js — D-947)
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(600);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
  // «mundo» (o 4.º argumento): a tela sobre uma partida de verdade — a metrópole à noite, o corpo tomado num freguês sentado à mesa
  // com outros dois que podem jogar (como a j7 da prova), a mesa chamada e a partida começada pelas mãos (G.Possess.apply), o mundo
  // vivendo pelo próprio passo; a tela lê o G.JogoDados.corpo real. Só a pergunta do modo é trocada (não há 3D): fotos da sacudida, da
  // vez do corpo e dos copos de pé
  if (process.argv[4] === 'mundo') {
    const r = await page.evaluate(pc => {
      G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden');
      // (the night of the qa/jogo-dados.js j7: no rain, no war, no alarm, no feast — the tavern full as the proof has it)
      const calm = () => { const w = G.S.weather; w.rain = 0; if (w.storm) w.storm = 0; G.inSim++; try { if (!(G.S.divinePeace > G.DAY_LEN * 0.5)) G.Politics.divinePeace(); } finally { G.inSim--; } for (const s of G.S.settlements.values()) { if (s.alarmT > 0) s.alarmT = 0; s.festPlan = { day: G.S.day, key: null, done: 1 }; } };
      for (let t = 0; t < 400 && G.S.time < 0.6; t++) { calm(); G.debug.step(0.5); }
      G.IncUI.init(); if (!pc) G.Input3D.touch = true;
      G.Modes.inc = () => true; G.Modes.panel = () => false; G.Modes.setPanel = () => { }; G.Modes.panelIs = p => p === 'dados'; G.Input3D.free = () => { };
      const Po = G.Possess, JD = G.JogoDados, T = G.Taverna, S = G.S; const step = s => { for (let k = 0; k < s / 0.05; k++) G.debug.step(0.05); };
      const seen = { open: 0, best: 0 }; for (let tries = 0; tries < 600; tries++) { calm(); step(0.25);
        for (const op of G.Act.all().filter(o => o.def === 'taverna' && G.Act.live(o))) { const b = S.buildings.get(op.at); if (!T.aberta(b)) continue; const by = {};
          for (const id of Object.keys(op.data.mesa)) { const m = op.data.mesa[id]; const v = S.villagers.get(+id); if (!v || !m.g || m.zz || m.st < 2 || m.st > 5 || !v.task || v.task.type !== 'tavern' || v.energy < 37 || (G.Ebrio && G.Ebrio.grau(v) >= 2) || JD.gameOf(v) || (op.data.jogo && op.data.jogo[m.g])) continue; (by[m.g] = by[m.g] || []).push(v); }
          seen.open++; for (const g in by) seen.best = Math.max(seen.best, by[g].length);
          for (const g in by) if (by[g].length >= 3) { const v = by[g].sort((a, c) => G.Depot.get(G.Eco.coinRef(c), 'moedas') - G.Depot.get(G.Eco.coinRef(a), 'moedas'))[0]; if (!Po.can(v).ok) continue;
            const pl = G.Interiors.placeOf(v); G.inSim++; try { Po.take(v); Po.use(v, b, pl); } finally { G.inSim--; } step(3);
            const x = JD.verbo(v); if (!(x.k === 'chamar' && x.ok)) { G.inSim++; try { Po.release('deus'); } finally { G.inSim--; } continue; }
            const ask = fn => { const a = Po.apply(fn); for (let k = 0; k < 10 && !a.res; k++) step(0.05); return a.res || {}; };
            const c1 = ask(w => JD.chamar(w, x.apostas[0])); const s1 = JD.corpo(v); if (!c1.ok || !s1 || !s1.convite.some(q => q.sim)) { G.inSim++; try { Po.release('deus'); } finally { G.inSim--; } continue; }
            const c2 = ask(w => JD.comecar(w, s1.op)); if (!c2.ok) continue;
            window.__ME = v; return { ok: true, b: b.id, me: v.name, quem: JD.corpo(v).jogadores.map(p => p.nome) }; } } }
      return { ok: false, seen };
    }, PC);
    console.log(r.ok ? `a partida de verdade na taverna #${r.b}: ${r.quem.join(', ')}` : `nenhuma mesa para a partida de verdade (${r.seen ? `${r.seen.open} olhadas a tavernas abertas, no máximo ${r.seen.best} à mesma mesa` : ''})`);
    if (r.ok) for (const [nm, until] of [['mundo-sacode', 'sacode'], ['mundo-vez', 'vez'], ['mundo-copos', 'revela']]) {
      const got = await page.evaluate(([until]) => { const v = window.__ME, JD = G.JogoDados; G.JogoDadosUI.open(true);
        for (let k = 0; k < 900; k++) { const s = JD.corpo(v); if (!s) break; const at = until === 'vez' ? s.fase === 'palpite' && s.vez === s.eu : s.fase === until; if (at) break;
          G.debug.step(1 / 30 * G.Space.TIME); G.JogoDadosUI.render(JD.corpo(v), 1 / 30);
          // (the body's turn: a bid of its own, the nearest free to what it expects — its hands, by the world's step)
          if (until !== 'vez' && s.fase === 'palpite' && s.vez === s.eu && !window.__said) { window.__said = 1; const n = s.livres.slice().sort((a, b) => Math.abs(a - s.espero) - Math.abs(b - s.espero))[0]; G.Possess.apply(w => JD.palpite(w, s.op, n)); } }
        const s = JD.corpo(v); if (until === 'vez') window.__said = 0; return s ? `${s.fase} r${s.rodada}` : 'sem partida'; }, [until]);
      await page.waitForTimeout(until === 'revela' ? 2400 : 700); await page.evaluate(() => { for (let k = 0; k < 30; k++) { G.debug.step(1 / 30 * G.Space.TIME); G.JogoDadosUI.render(G.JogoDados.corpo(window.__ME), 1 / 30); } });
      await page.waitForTimeout(450); // (what just popped in settles before the photo — a photo in the middle of the pop shows it half transparent)
      await page.screenshot({ path: path.join(OUT, nm + '.png') }); console.log(`${nm}: ${got}`);
    }
    console.log(errs.length ? 'ERROS: ' + errs.join(' | ').slice(0, 600) : 'sem erros'); await browser.close(); return;
  }
  const r0 = await page.evaluate(pc => {
    G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden');
    for (let t = 0; t < 400 && G.S.time < 0.6; t++) G.debug.step(0.5);
    G.IncUI.init(); if (!pc) G.Input3D.touch = true;
    // (four grown people of one people: the body and three at its table — their faces the game's own)
    const L = [...G.S.villagers.values()].filter(v => v.age >= 20 && v.age < 60).sort((a, c) => a.id - c.id); const fid = G.Fac.idOfV(L[0]);
    const P = L.filter(v => G.Fac.idOfV(v) === fid).slice(0, 4); const me = P[0];
    G.Possess.body = () => me; G.Modes.inc = () => true; G.Modes.panel = () => false; G.Modes.setPanel = () => { }; G.Modes.panelIs = p => p === 'dados'; G.Input3D.free = () => { };
    G.JogoDados.verbo = () => ({ k: 'chamar', ok: true, apostas: [0.1, 0.2, 0.3, 0.5, 1] });
    window.__P = P; return { n: P.length, names: P.map(v => v.name) };
  }, PC);
  console.log(`a mesa: ${r0.names.join(', ')}`);
  const shots = [];
  for (const tema of TEMAS) for (const mom of MOM) {
    const fit = await page.evaluate(([tema, mom]) => {
      const P = window.__P; const me = P[0]; const F = { [P[0].id]: [5, 3], [P[1].id]: [6, 4], [P[2].id]: [2, 6], [P[3].id]: [1] };
      const nm = ['Você', P[1].name, P[2].name, P[3].name]; const n = [2, 2, 2, 1];
      const up = mom === 'revela' || mom === 'fim'; const bids = mom === 'rolando' ? [null, null, null, null] : mom === 'palpite' ? [null, 21, 26, null] : [19, 21, 26, 23];
      const total = 27; const now = G.S.clock;
      const s = { op: 1 + tema.length * 7 + tema.charCodeAt(0), b: 0, /* (a game of its own for each people: the pot that flew to the winner at the end of one is not on the next one's table) */ g: 'x', fase: mom === 'rolando' ? 'sacode' : mom === 'palpite' ? 'palpite' : mom, t: now, ate: now + 1, now, rodada: 2, host: P[1].id, euHost: false, eu: me.id, jogo: 1,
        jogadores: P.map((v, i) => ({ id: v.id, nome: nm[i], eu: i === 0, n: n[i], fora: '', palpite: bids[i], faces: i === 0 || up ? F[v.id] : null, olho: i === 2 ? 'bêbado' : 'atento', convite: '' })),
        ordem: [P[1].id, P[2].id, me.id, P[3].id], vez: mom === 'palpite' ? me.id : 0, livres: [], faixa: [7, 42], espero: 8 + 3.5 * 5, aposta: 0.3, moeda: true, pote: 1.2, apostas: [0.1, 0.2, 0.3, 0.5, 1], convite: [],
        res: up ? { total, cravou: 0, queimou: [], dist: Object.fromEntries(P.map((v, i) => [v.id, Math.abs((bids[i] || 0) - total)])), trap: null } : null,
        armado: false, trapacaOk: false, olhos: 3, risco: 0.48, venc: mom === 'fim' ? me.id : 0, fim: mom === 'fim' ? 'sobrou' : '', ganho: mom === 'fim' ? 1.2 : 0,
        set: { k: tema === 'asteca' ? 'dados.madeira' : 'dados.osso', mat: tema === 'asteca' ? 'madeira' : 'osso', meus: false }, torneio: null, tema, copo: tema === 'asteca' ? 'barro' : 'couro',
        price: x => G.Falas.price(tema, x), hist: mom === 'rolando' ? [{ r: 1, total: 24, cravou: '', queimou: [P[3].name] }] : [{ r: 1, total: 24, cravou: '', queimou: [P[3].name] }] };
      for (let k = 7; k <= 42; k++) if (!bids.includes(k)) s.livres.push(k);
      // (the reveal: a cravada — the third one hit it, the others lose a die; the end: the body took the pot)
      if (mom === 'revela') { const fc = [[5, 3], [4, 2], [6, 6], [3]]; const bd = [19, 21, 29, 23]; s.jogadores.forEach((p, i) => { p.faces = fc[i]; p.palpite = bd[i]; }); const tot = 29;
        s.res = { total: tot, cravou: P[2].id, queimou: [me.id, P[1].id, P[3].id], dist: Object.fromEntries(P.map((v, i) => [v.id, Math.abs(bd[i] - tot)])), trap: null }; s.livres = s.livres.filter(k => !bd.includes(k)); }
      if (mom === 'fim') { s.jogadores.forEach((p, i) => { if (i) { p.fora = 'queimou'; p.n = 0; } }); s.res = { total: 9, cravou: me.id, queimou: [P[1].id], dist: {}, trap: null }; s.jogadores[0].palpite = 9; s.jogadores[1].palpite = 7; s.jogadores[0].faces = [6, 3]; s.jogadores[1].faces = null; s.pote = 1.2; }
      window.__S = s; G.JogoDados.corpo = () => window.__S; G.JogoDadosUI.close(); G.JogoDadosUI.force = { tema }; G.JogoDadosUI.open(true); G.JogoDadosUI.render(s, 0);
      const r = document.querySelector('#dados-panel').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) };
    }, [tema, mom]);
    // (the moment: the dice in the air; the cups up one by one; the coins on their way)
    if (mom === 'rolando') { await page.waitForTimeout(560); await page.evaluate(() => { for (let k = 0; k < 9; k++) G.JogoDadosUI.render(window.__S, 1 / 30); }); }
    else if (mom === 'revela') { await page.waitForTimeout(2600); await page.evaluate(() => { for (let k = 0; k < 3; k++) G.JogoDadosUI.render(window.__S, 1 / 30); }); }
    else if (mom === 'fim') { await page.waitForTimeout(420); await page.evaluate(() => G.JogoDadosUI.render(window.__S, 1 / 30)); }
    else { await page.waitForTimeout(500); await page.evaluate(() => { for (let k = 0; k < 150; k++) G.JogoDadosUI.render(window.__S, 1 / 30); /* (the body's dice come to rest, as five seconds of frames would) */ }); }
    await page.waitForTimeout(450);
    const f = path.join(OUT, `${tema}-${mom}.png`); await page.screenshot({ path: f }); shots.push([tema, mom, f]);
    const chk = await page.evaluate(() => { const r = document.querySelector('#dados-panel .jd-card').getBoundingClientRect();
      const small = [...document.querySelectorAll('#dados-panel button')].filter(b => { const q = b.getBoundingClientRect(); return q.width > 0 && (q.height < 43.5 || q.width < 43.5); }).map(b => (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 14));
      return { in: r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5, sx: document.documentElement.scrollWidth > innerWidth + 1, small }; });
    console.log(`${tema} ${mom}: ${fit.w}×${fit.h}${chk.in ? '' : ' FORA DA TELA'}${chk.sx ? ' ROLAGEM DE LADO' : ''}${chk.small.length ? ` botões de menos de 44 px: ${chk.small.join(', ')}` : ''}`);
  }
  const cols = MOM.length; const cw = PC ? 460 : 250, chh = Math.round(cw * H / W);
  const html = `<html><body style="margin:0;background:#151210;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:6px;padding:6px;font:12px sans-serif;color:#ccc">${shots.map(([t, m, f]) => `<div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${cw}px;height:${chh}px;display:block"><div>${t} · ${m}</div></div>`).join('')}</body></html>`;
  const sheet = await browser.newPage({ viewport: { width: cols * (cw + 6) + 6, height: 100 } }); await sheet.setContent(html); await sheet.waitForTimeout(500);
  await sheet.screenshot({ path: path.join(OUT, 'folha.png'), fullPage: true });
  console.log('folha: ' + path.join(OUT, 'folha.png'));
  console.log(errs.length ? 'ERROS: ' + errs.join(' | ').slice(0, 600) : 'sem erros');
  await browser.close();
})();
