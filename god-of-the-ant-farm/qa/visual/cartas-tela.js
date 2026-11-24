// cartas-tela: bash qa/navegador.sh node qa/visual/cartas-tela.js PASTA [pc] [civA,civB] — a mesa das Tabuletas (T5, D-869), para ver:
// no celular em pé (390 × 844, o toque) ou, com «pc», na tela do PC (1280 × 760) — o painel desenhado pelo próprio cartas-ui.js, numa
// partida de verdade da regra (a asteca contra a nórdica, por padrão: duas rodadas jogadas pelas inteligências), com quem joga e o
// rosto de alguém do mundo pronto. Grava: PASTA/convite.png (com quem e a aposta), PASTA/mesa.png (a mão em leque, uma tabuleta
// erguida), PASTA/rodada.png (a rodada acontecendo: as duas viradas, um poder no meio), PASTA/grande.png (a tabuleta segurada,
// grande) e PASTA/fim.png. O mundo não muda: a mão da foto troca as perguntas da tela (o corpo, o modo, a partida) por um retrato, e
// nada é pedido ao mundo. Mede: o painel dentro da tela, sem rolagem de lado, os botões com 44 px ou mais.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'cartas-tela'); fs.mkdirSync(OUT, { recursive: true });
const PC = process.argv[3] === 'pc'; const W = PC ? 1280 : 390, H = PC ? 760 : 844;
const CIV = (process.argv[PC ? 4 : 3] || 'asteca,nordico').split(',');
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
  const page = await browser.newPage(PC ? { viewport: { width: W, height: H } } : { viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|WebGL|GL Driver/.test(t)) errs.push('console: ' + t.slice(0, 200)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); localStorage.setItem('gotaf-guia-tabuletas', '1'); localStorage.setItem('gotaf-guia-copo', '1'); } catch (e) { } }); // (o guia da primeira partida já visto: o guia tem a sua prova, qa/visual/ensina-fotos.js — D-947)
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(600);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
  const info = await page.evaluate(([pc, CIV]) => {
    G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden');
    G.IncUI.init(); if (!pc) G.Input3D.touch = true;
    const C = G.Cartas; const people = [...G.S.villagers.values()].filter(o => o.age >= 22 && o.age < 60).sort((a, b) => a.id - b.id);
    const v = people[0], o = people.find(q => q.id !== v.id && G.Fac.idOfV(q) === G.Fac.idOfV(v)) || people[1];
    G.Possess.body = () => v; G.Modes.inc = () => true; G.Modes.panel = () => false; G.Modes.setPanel = () => { }; G.Modes.panelIs = p => p === 'cartas'; G.Input3D.free = () => { };
    // (uma partida de verdade da regra: duas rodadas pelas inteligências, a terceira aberta)
    const s = C.nova({ id: 777, seed: 4242, civ: CIV, aposta: 0.2 }); const ind = [{ ousado: 0.6 }, { ousado: 0.4 }];
    for (let r = 0; r < 2; r++) { C.abre(s); for (let k = 0; k < 2; k++) { const i = C.vez(s); C.joga(s, i, C.ia(s, i, ind[i])); } C.resolve(s); }
    C.abre(s);
    const mk = () => ({ jogo: 777, me: 0, ai: 1, o: o.id, fase: s.fim ? 'fim' : 'jogo', r: s.r, of: C.OF.slice(), pote: 0.4 * s.x, aposta: 0.2, x: s.x, mao: s.p[0].mao.slice(), monte: [s.p[0].monte.length, s.p[1].monte.length], maoOutro: s.p[1].mao.length, gl: [s.p[0].gl, s.p[1].gl], potePedras: s.altar, vis: s.vis === 0 ? 'eu' : s.vis === 1 ? 'outro' : '', aberta: s.vis === 0 && s.lance[1] ? s.lance[1] : null, posta: !!s.lance[0], dobra: '', podeDobrar: C.podeDobrar(s, 0), hist: s.hist.slice(-8), fim: s.fim ? Object.assign({}, s.fim, { meu: s.fim.w === 0 ? 1 : s.fim.w === 1 ? -1 : 0 }) : null, civ: s.civ.slice(), bonus: s.p[0].bonus, mal: s.p[0].mal, desc: [s.p[0].desc.length, s.p[1].desc.length], preco: n => G.Falas.price(CIV[0], n), moeda: true, baralho: G.Inv.madeBy('baralho', G.Fac.idOfV(v)) || 'baralho.madeira', trap: null, n: s.hist.length });
    window.__T = { s, mk, v, o, ind }; G.CartasUI.force = () => window.__T.view; window.__T.view = mk();
    // (o convite: o painel da escolha, com as perguntas respondidas pela mão da foto)
    C.podeCorpo = () => ({ ok: true, o: o.id, todos: [o.id, people.find(q => q.id !== v.id && q.id !== o.id).id], apostas: [0, 0.1, 0.2, 0.4], moeda: true, baralho: 'baralho.amate', b: [...G.S.buildings.values()].find(b => b.type === 'taverna').id });
    G.CartasUI.convite(o.id);
    return { v: v.name, o: o.name, mao: s.p[0].mao.length, hist: s.hist.length };
  }, [PC, CIV]);
  console.log(`${info.v} contra ${info.o}: ${info.hist} rodadas jogadas, ${info.mao} na mão`);
  const fit = () => page.evaluate(() => { const r = document.querySelector('#tab-panel .tb-mesa').getBoundingClientRect(); return { in: r.left >= -0.5 && r.right <= innerWidth + .5 && r.top >= -0.5 && r.bottom <= innerHeight + .5, sx: document.documentElement.scrollWidth > innerWidth + 1, small: [...document.querySelectorAll('#tab-panel button')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44 && !b.closest('summary')).map(b => b.className + ':' + Math.round(b.getBoundingClientRect().height)) }; });
  const shot = async (name) => { await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, name) }); const f = await fit(); console.log(`${name}: ${f.in ? 'dentro da tela' : 'FORA DA TELA'}${f.sx ? ', ROLAGEM DE LADO' : ''}${f.small.length ? ', botões pequenos: ' + f.small.join(' ') : ''}`); return f; };
  await shot('convite.png');
  // (a mesa: a partida aberta, uma tabuleta erguida)
  await page.evaluate(() => { document.querySelector('#tab-panel .tb-over').classList.add('hidden'); G.CartasUI.abrir(777); for (const c of document.querySelectorAll('#tab-panel .tb-mao .ct-card')) c.classList.remove('tb-in'); G.CartasUI._test.escolhe(1); });
  await shot('mesa.png');
  // (a rodada acontecendo: a terceira rodada jogada pela regra, mostrada pela tela — a foto no meio de um poder)
  await page.evaluate(() => { const T = window.__T; const s = T.s; const id = s.p[0].mao[1]; const C0 = G.Cartas; C0.joga(s, 0, id); if (!s.lance[1]) C0.joga(s, 1, C0.ia(s, 1, T.ind[1])); const h = C0.resolve(s); T.h = h; G.CartasUI._test.anima(h); });
  await page.waitForTimeout(1900); await shot('rodada.png');
  await page.waitForTimeout(2600);
  // (a tabuleta segurada: grande, com o mito)
  await page.evaluate(() => { const T = window.__T; T.view = T.mk(); G.CartasUI._test.view = T.view; G.CartasUI._test.render(); const c = document.querySelector('#tab-panel .tb-mao .ct-card'); const z = document.querySelector('#tab-panel .tb-zoom'); z.innerHTML = G.CartasArte.html(T.view.mao[0], { cls: 'ct-big' }); z.classList.remove('hidden'); void c; });
  await shot('grande.png');
  // (o fim)
  await page.evaluate(() => { const T = window.__T; const s = T.s; document.querySelector('#tab-panel .tb-zoom').classList.add('hidden'); while (!s.fim) { G.Cartas.abre(s); for (let k = 0; k < 2; k++) { const i = G.Cartas.vez(s); if (i < 0) break; G.Cartas.joga(s, i, G.Cartas.ia(s, i, T.ind[i])); } G.Cartas.resolve(s); } T.view = T.mk(); G.CartasUI._test.view = T.view; G.CartasUI._test.render(); });
  await shot('fim.png');
  console.log(errs.length ? 'ERROS: ' + errs.join(' | ').slice(0, 600) : 'sem erros');
  await browser.close(); process.exit(errs.length ? 1 : 0);
})();
