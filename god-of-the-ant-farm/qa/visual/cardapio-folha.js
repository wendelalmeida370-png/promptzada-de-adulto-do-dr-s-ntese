// cardapio-folha: bash qa/navegador.sh node qa/visual/cardapio-folha.js PASTA [pc] — a folha dos cardápios da taverna (P7, D-768),
// para ver: cada povo (romano, grego, egípcio, nórdico, asteca, clássico) em cada porte da casa (a lousa, o quadro, a carta), no
// celular em pé (390 × 844) ou, com «pc», na tela do PC — só o painel, desenhado pelo próprio cardapio-ui.js com o cardápio de uma
// taverna do mundo pronto (as bebidas e os pratos dela, com um «acabou» para ver o risco à mão) e um item escolhido; sem o 3D (é
// rápida: segundos). Grava cada um (PASTA/tema-porte.png) e a folha inteira (PASTA/folha.png). O mundo não muda: a mão da folha só
// troca as perguntas da tela (o corpo, a taverna, o modo) por respostas de mentira, e nada é pedido ao mundo.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'cardapio-folha'); fs.mkdirSync(OUT, { recursive: true });
const PC = process.argv[3] === 'pc'; const W = PC ? 1280 : 390, H = PC ? 760 : 844;
const TEMAS = (process.env.TEMAS || 'romano,grego,egipcio,nordico,asteca,classico').split(','), PORTES = (process.env.PORTES || 'lousa,quadro,carta').split(',');
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
  const page = await browser.newPage(PC ? { viewport: { width: W, height: H } } : { viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|WebGL|GL Driver/.test(t)) errs.push('console: ' + t.slice(0, 200)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(600);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
  const r0 = await page.evaluate(([pc]) => {
    G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden');
    for (let t = 0; t < 400 && G.S.time < 0.6; t++) G.debug.step(0.5);
    G.IncUI.init(); if (!pc) G.Input3D.touch = true;
    // (a tavern of the world, its keeper and someone of its people: the menu's own facts)
    const Ta = G.Taverna; const b = [...G.S.buildings.values()].filter(q => q.type === 'taverna' && q.built && Ta.keeperOf(q)).sort((a, c) => Ta.cartaOf(c).length - Ta.cartaOf(a).length || a.id - c.id)[0];
    const kp = Ta.keeperOf(b); const v = [...G.S.villagers.values()].find(o => o !== kp && o.age >= 20 && G.Fac.idOfV(o) === G.Fac.idOfV(kp));
    // (the sheet's hand: the screen's questions answered — the body, the mode, the panel — and the tavern's menu as it is, with one
    // thing of it run out to show the stroke of the pen)
    G.Possess.body = () => v; G.Modes.inc = () => true; G.Modes.panel = () => false; G.Modes.setPanel = () => { }; G.Modes.panelIs = p => p === 'cardapio'; G.Input3D.free = () => { };
    const items = Ta.cartaOf(b).map(x => Object.assign({}, x)); const out = items.find(x => x.sort === 'beber' && items.filter(y => y.sort === 'beber').length > 1) || null; if (out) { out.ok = false; out.n = 0; }
    window.__F = { b, kp, v, items, ck: 1 };
    const fake = tema => ({ op: 1, b: b.id, open: true, cv: 'carta', ck: ++window.__F.ck, srv: kp.id, ola: G.Falas.line('carta_taverna', { v: kp, civ: tema, nome: (G.Falas.HELLO[tema] || G.Falas.HELLO.classico)[1], bem: items.filter(x => x.ok).slice(0, 2).map(x => x.nome).join(' e ') }), moeda: true, seat: true, price: n => G.Falas.price(tema, n), items: window.__F.items.map(x => Object.assign({}, x)) });
    window.__F.fake = fake;
    return { b: `${G.Village.buildName(b)} #${b.id}`, kp: kp.name, n: items.length };
  }, [PC]);
  console.log(`a taverna ${r0.b}, ${r0.kp}, ${r0.n} coisas no cardápio`);
  const shots = [];
  for (const porte of PORTES) for (const tema of TEMAS) {
    await page.evaluate(([tema, porte]) => {
      const F = window.__F; const s = F.fake(tema); G.Taverna.carta = () => s; G.Taverna.corpo = () => s;
      G.CardapioUI.close(); G.CardapioUI.force = { tema, porte }; G.CardapioUI.open(true);
      // (a thing chosen: the second one that can be had)
      const rows = [...document.querySelectorAll('#menu-panel .mn-row:not(.off)')]; const r = rows[1] || rows[0]; if (r) r.click();
    }, [tema, porte]);
    await page.waitForTimeout(900);
    const f = path.join(OUT, `${tema}-${porte}.png`); await page.screenshot({ path: f }); shots.push([tema, porte, f]);
    const fit = await page.evaluate(() => { const r = document.querySelector('#menu-panel').getBoundingClientRect(); const L = document.querySelector('#menu-panel .mn-list'); return { in: r.left >= 0 && r.right <= innerWidth + .5 && r.top >= 0 && r.bottom <= innerHeight + .5, w: Math.round(r.width), h: Math.round(r.height), sx: L ? L.scrollWidth > L.clientWidth + 1 : false, small: [...document.querySelectorAll('#menu-panel button')].filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44 && !b.classList.contains('x'))).length }; });
    console.log(`${tema} ${porte}: ${fit.w}×${fit.h}${fit.in ? '' : ' FORA DA TELA'}${fit.sx ? ' ROLAGEM DE LADO' : ''}${fit.small ? ` ${fit.small} botões com menos de 44 px` : ''}`);
  }
  // (the whole sheet: the shots side by side, small)
  const cols = TEMAS.length; const cw = PC ? 420 : 260, chh = Math.round(cw * H / W);
  const html = `<html><body style="margin:0;background:#151210;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:6px;padding:6px;font:12px sans-serif;color:#ccc">${shots.map(([t, p, f]) => `<div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${cw}px;height:${chh}px;object-fit:cover;object-position:${PC ? 'right' : 'bottom'}"><div>${t} · ${p}</div></div>`).join('')}</body></html>`;
  const sheet = await browser.newPage({ viewport: { width: cols * (cw + 6) + 6, height: 100 } }); await sheet.setContent(html); await sheet.waitForTimeout(500);
  await sheet.screenshot({ path: path.join(OUT, 'folha.png'), fullPage: true });
  console.log('folha: ' + path.join(OUT, 'folha.png'));
  console.log(errs.length ? 'ERROS: ' + errs.join(' | ').slice(0, 400) : 'sem erros');
  await browser.close();
})();
