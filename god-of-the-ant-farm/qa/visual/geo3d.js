// geo3d: the buildings' 3D geometry looked at without drawing a frame (fast, even with the software WebGL):
//   bash qa/navegador.sh node qa/visual/geo3d.js PASTA_DO_JOGO [mundo] [CIV]
// every building of the world (or of the town of that people) drawn again by Build3D.check (no number that is not a
// number, nothing far out of its lot, nothing floating or deep in the ground) and Props3D's proof; the triangles of each
// kind (Build3D.cost), and the time to build the near pictures of the chunks of the town — at the medium quality
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = process.argv[2]; const WORLD = process.argv[3] || 'cidade'; const CIV = process.argv[4] || '';
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | '))); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  const r = await page.evaluate(([w, civ]) => {
    G.Realm.setQuality('media'); G.Save.apply(JSON.parse(G.Ready.data[w])); G.Main.mode = 'game';
    if (!G.Realm.ready()) return { err: 'sem 3D: ' + G.Realm.failed };
    const S = G.S; const B3 = G.Build3D; const all = [...S.buildings.values()];
    const civOf = b => b.style || ((G.Fac.ofSet ? G.Fac.ofSet(b.set) : null) || {}).civ || 'classico';
    const list = civ ? all.filter(b => civOf(b) === civ) : all;
    const t0 = performance.now(); const check = B3.check ? B3.check(list) : ['sem Build3D.check']; const tCheck = performance.now() - t0;
    // (the triangles of each kind, by people: the mean over the buildings of that kind)
    const cost = {}; if (B3.cost) for (const b of list) { const k = civOf(b) + ' ' + b.type + (b.built ? '' : ' (obra)'); const c = B3.cost(b); const o = cost[k] || (cost[k] = { n: 0, solid: 0, glass: 0, plants: 0 }); o.n++; o.solid += c.solid; o.glass += c.glass; o.plants += c.plants; }
    for (const k in cost) { const o = cost[k]; o.solid = Math.round(o.solid / o.n); o.glass = Math.round(o.glass / o.n); o.plants = Math.round(o.plants / o.n); }
    // (the near pictures of the chunks with buildings of the list: how long they take, how many triangles)
    const C = 16; const keys = new Set(list.map(b => Math.floor(b.x / C) + ',' + Math.floor(b.y / C))); let ms = 0, tris = 0, n = 0;
    for (const k of keys) { const [cx, cy] = k.split(',').map(Number); const t1 = performance.now(); const g = B3.nearGeo(cx * C, cy * C, C); ms += performance.now() - t1; n++;
      for (const m of [g.solid, g.glass, g.plants]) if (m) { tris += m.attributes.position.count / 3; m.dispose(); } if (g.water) g.water.dispose(); }
    return { buildings: list.length, check: check.slice(0, 30), nCheck: check.length, tCheck: Math.round(tCheck), cost, chunks: n, msChunk: +(ms / Math.max(1, n)).toFixed(1), trisChunk: Math.round(tris / Math.max(1, n)), modErr: JSON.stringify(G.modErr) };
  }, [WORLD, CIV]);
  if (r.err) console.log(r.err);
  else {
    console.log(`${WORLD}${CIV ? ' (' + CIV + ')' : ''}: ${r.buildings} prédios · prova em ${r.tCheck} ms · ${r.nCheck} problemas`);
    for (const p of r.check) console.log('  ' + p);
    console.log(`pedaços com prédios: ${r.chunks} · ${r.msChunk} ms e ${r.trisChunk} triângulos por pedaço (prédios, vidros, capim dos telhados)`);
    for (const k of Object.keys(r.cost).sort()) { const o = r.cost[k]; console.log(`  ${k.padEnd(30)} ×${String(o.n).padStart(3)}  sólido ${String(o.solid).padStart(6)}  vidro ${String(o.glass).padStart(4)}  capim ${String(o.plants).padStart(5)}`); }
    console.log('erros de módulo: ' + r.modErr);
  }
  console.log('erros: ' + (errs.slice(0, 5).join(' || ') || 'nenhum'));
  await browser.close();
})();
