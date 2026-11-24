// cartas-folha: bash qa/navegador.sh node qa/visual/cartas-folha.js PASTA [largura] — a folha das Tabuletas (T5, D-862, D-863): as 20
// tabuletas de cada povo (romano, grego, egípcio, nórdico, asteca, clássico) e o verso, desenhadas pelo próprio cartas-arte.js com a
// letra e o tema do jogo (css/style.css), sem o mundo nem o 3D (segundos). Grava PASTA/<povo>.png, uma folha por povo, e PASTA/raras.png
// (as únicas e as lendárias de todos, maiores, com o brilho de folha a meio caminho). O console limpo é parte da prova: um SVG mal
// formado avisa ali. POVOS=asteca,nordico para só alguns.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = process.argv[2] || path.join(require('os').tmpdir(), 'cartas-folha'); fs.mkdirSync(OUT, { recursive: true });
const CW = +(process.argv[3] || 190);
const POVOS = (process.env.POVOS || 'romano,grego,egipcio,nordico,asteca,classico').split(',');
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: CW * 5 + 4 * 16 + 40, height: 900 }, deviceScaleFactor: 1.5 });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 200)); });
  const css = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
  await page.setContent(`<html><head><style>${css}\nhtml,body{height:auto!important;overflow:visible!important;position:static!important}body{background:radial-gradient(ellipse at 50% 0,#2a1e14,#120c08);margin:0;padding:20px;user-select:auto}.row{display:flex;flex-wrap:wrap;gap:16px}h2{color:#f0d488;font:800 26px Cinzel,serif;letter-spacing:.12em;margin:4px 0 14px;text-transform:uppercase}h2 small{font:600 14px Nunito,sans-serif;color:#cdb98a;letter-spacing:0;text-transform:none;margin-left:10px}</style></head><body></body></html>`);
  for (const f of ['js/util.js', 'js/cartas.js', 'js/cartas-arte.js']) await page.addScriptTag({ path: path.join(ROOT, f) });
  const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: path.join(OUT, name), fullPage: true }); };
  for (const p of POVOS) {
    await page.evaluate(([p, CW]) => { document.body.innerHTML = ''; G.CartasArte.pronto(document); const D = G.Cartas.DECKS[p]; const civ = { romano: 'Os romanos', grego: 'Os gregos', egipcio: 'Os egípcios', nordico: 'Os nórdicos', asteca: 'Os astecas', classico: 'Os Titãs (o povo clássico)' }[p];
      const h = document.createElement('div'); h.innerHTML = `<h2>${civ}<small>${G.CartasArte.ESTILO[p].nome} · ${D.length} tabuletas e o verso</small></h2><div class="row">${D.map(c => G.CartasArte.html(c.id).replace('class="ct-card', `style="--cw:${CW}px" class="ct-card`)).join('')}${G.CartasArte.htmlVerso(p).replace('class="ct-card', `style="--cw:${CW}px" class="ct-card`)}</div>`; document.body.appendChild(h);
      // (o brilho a meio caminho: a foto o pega parado)
      for (const el of document.querySelectorAll('.ct-foil')) el.style.animationPlayState = 'paused'; }, [p, CW]);
    await shot(p + '.png');
  }
  await page.evaluate(([CW]) => { document.body.innerHTML = ''; const L = G.Cartas.all().filter(c => c.rar === 'unica' || c.rar === 'lendaria'); const h = document.createElement('div'); h.innerHTML = `<h2>As únicas e as lendárias</h2><div class="row">${L.map(c => G.CartasArte.html(c.id, { cls: 'ct-big' }).replace('class="ct-card', `style="--cw:${Math.round(CW * 1.3)}px" class="ct-card`)).join('')}</div>`; document.body.appendChild(h); for (const el of document.querySelectorAll('.ct-foil')) { el.style.animationDelay = '-1.6s'; el.style.animationPlayState = 'paused'; } }, [CW]);
  await shot('raras.png');
  const bad = await page.evaluate(() => G.CartasArte.check());
  console.log(`${POVOS.length} povos em ${OUT}; as figuras: ${bad.length ? bad.join('; ') : 'todas'}; ${errs.length ? 'ERROS: ' + errs.slice(0, 5).join(' | ') : 'sem erros'}`);
  await browser.close(); process.exit(errs.length || bad.length ? 1 : 0);
})();
