// agua-deus: fotos da água na vista do deus (21c, D-512) — a maior cachoeira de um mundo montanhoso e o rio da planície de um mundo
// suave, de dia e na chuva (o mesmo mundo, o mesmo lugar, o mesmo zoom em toda rodada: antes e depois)
//   bash qa/navegador.sh node qa/visual/agua-deus.js PASTA_DO_JOGO PASTA_DAS_FOTOS
// (o rio turvo e as poças só com a terra molhada: a vista «-chuva» molha o chão em volta pela mão da prova — só para a foto)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(process.argv[2]); const OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const VIEWS = [['deus-queda', 'montanhoso', 'fall', 0], ['deus-queda-chuva', 'montanhoso', 'fall', 0.8], ['deus-rio', 'plano', 'river', 0], ['deus-rio-chuva', 'plano', 'river', 0.8]];
(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  const log = []; let world = '';
  for (const [name, relevo, place, rain] of VIEWS) {
    const info = await page.evaluate(([relevo, place, rain, fresh]) => {
      if (fresh) { G.Main.newGame({ seed: 4242, type: 'continente', size: 192, tribes: 4, temper: 'normal', clima: 'variado', relevo }); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
        document.querySelector('#menu') && document.querySelector('#menu').classList.add('hidden'); document.querySelector('#intro') && document.querySelector('#intro').classList.add('hidden'); }
      const S = G.S, N = G.N, T = G.T; let at = null;
      if (place === 'fall') { const f = S.relief.falls.filter(q => !q.sub).sort((a, b) => (b.tot || b.drop) - (a.tot || a.drop) || a.y - b.y)[0]; at = [f.x + 0.5, f.y + 0.5]; }
      else { let best = -1; for (let y = 8; y < N - 8; y++) for (let x = 8; x < N - 8; x++) { const i = y * N + x; if (S.type[i] !== T.RIVER || G.Waters.kind(x, y) !== 'river') continue; let n = 0, land = 0; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) { const t = S.type[(y + dy) * N + x + dx]; if (t === T.RIVER) n++; else if (t >= T.SAND) land++; } if (n < 18 || n > 48) continue; const sc = land * 0.2 + n * 0.5 - Math.abs(S.wl[i] - G.SEA) * 4; if (sc > best) { best = sc; at = [x + 0.5, y + 0.5]; } } }
      S.weather.rain = rain; S.weather.storm = 0; if (rain) for (let dy = -30; dy <= 30; dy++) for (let dx = -30; dx <= 30; dx++) { const x = Math.floor(at[0]) + dx, y = Math.floor(at[1]) + dy; if (G.W.inb(x, y)) S.wet[y * N + x] = 0.85; }
      S.time = 0.42; G.Render.centerOn(at[0], at[1], place === 'fall' ? 2.2 : 2.8);
      for (let k = 0; k < 8; k++) G.Main.frameFor(50);
      return { at, err: JSON.stringify(G.modErr) };
    }, [relevo, place, rain, world !== relevo]);
    world = relevo;
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    log.push(`${name}: ${JSON.stringify(info)}`); console.log(log[log.length - 1]);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  fs.writeFileSync(path.join(OUT, 'agua-deus.txt'), log.join('\n') + '\nerros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum') + '\n');
  await browser.close();
})();
