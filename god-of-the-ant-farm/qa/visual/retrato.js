// retrato: the portrait in the god's panel by the 3D (22a wave 2 — D-645), in the game's own page, on the metropolis made ready,
// in the god's view (the 3D never started: made the first time a portrait is asked for):
//   p1  o retrato     a person selected: the god's drawing first, then the face by the 3D in the panel's portrait
//   p2  a memória     the panel drawn again and again: the picture kept, never made again
//   p3  o rosto muda  the grief, a wound, the years: made again — and back to the face of before, the one kept
//   p4  só se vê      portraits made of many: the world the same to the last number (the save, the chance, the clock); the 3D
//                     still off, the god's view drawn as before
//   p5  o morto       the dead's portrait: the 3D's face in the grey of a memory
//   p6  o corpo       while the 3D draws the body's world (its mark, Realm.on — set by hand: T-1585) no portrait is made; back in
//                     the god's view, it is
//   folha             the sheet: the god's drawing above, the 3D's portrait below — a child, two adults, an old one, the grief,
//                     the dead — saved as folha.png; and each portrait alone
//   bash qa/navegador.sh node qa/visual/retrato.js PASTA [Q=media|alta] [ONLY=p1,p4]
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..'); const OUT = process.argv[2] || '/tmp/retrato'; fs.mkdirSync(OUT, { recursive: true });
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
const fails = []; const log = m => { console.log(m); fs.appendFileSync(path.join(OUT, 'retrato.txt'), m + '\n'); };
const ok = (name, c, info) => { log(`${c ? 'PASSOU' : 'FALHOU'} | retrato ${name} | ${info}`); if (!c) fails.push(name); };
const png = (name, url) => fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL|GPU stall/.test(t)) errs.push(t); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') });
  await page.evaluate(Q => {
    window.__f = n => { for (let k = 0; k < n; k++) G.Main.frameFor(33); };
    try { localStorage.setItem('gotaf-3dq', Q); } catch (e) { } G.Realm.q = Q;
    G.Save.apply(JSON.parse(G.Ready.data.metropole)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
    const all = [...G.S.villagers.values()].filter(v => !v.inside && !v.headless).sort((a, b) => a.id - b.id);
    const pick = q => (all.find(q) || {}).id || null;
    window.__who = { adulto: pick(v => v.g === 'm' && v.age >= 25 && v.age < 40), adulta: pick(v => v.g === 'f' && v.age >= 25 && v.age < 40), crianca: pick(v => v.age >= 5 && v.age < 9),
      velho: pick(v => v.age >= 58), outra: pick(v => v.g === 'f' && v.age >= 40 && v.age < 55) };
    // (the panel's portrait as it is on the screen now, and the 2D drawing alone — the god's view before the 3D's portrait)
    window.__panel = () => { const c = document.querySelector('#inspector .portrait canvas'); return c ? c.toDataURL() : null; };
    window.__sel = id => { G.UI.select(G.S.villagers.get(id) || G.S.dead.get(id)); window.__f(3); };
    // (the world as numbers: the save, the world's chance and clock)
    window.__world = () => { const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }; const o = JSON.parse(G.Save.serialize()); delete o.savedAt; return [h(JSON.stringify(o)), JSON.stringify(G.S.rng), G.S.clock, G.S.day].join('|'); }; // (the save but its own clock of when it was made)
  }, process.env.Q || 'media');
  const RT = () => page.evaluate(() => ({ made: G.Retrato3D.made, hits: G.Retrato3D.hits, ms: G.Retrato3D.ms, first: G.Retrato3D.first, failed: G.Retrato3D.failed, on: !!G.Realm.on, size: G.Retrato3D.size() }));
  // (wait, in the page's own time, for the portraits asked to be made)
  const until = async (fn, ms, arg) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn, arg)) return true; await page.waitForTimeout(150); await page.evaluate(() => window.__f(2)); } return false; };
  const who = await page.evaluate(() => window.__who);
  const w0 = await page.evaluate(() => window.__world());
  if (want('p1') || want('p4') || want('folha')) {
    const first = await page.evaluate(id => { window.__sel(id); return window.__panel(); }, who.adulto); // (in the same turn of the page: before the studio's timer can paint the 3D's face)
    const madeIt = await until(() => G.Retrato3D.made >= 1 || !!G.Retrato3D.failed, 120000); await page.evaluate(() => window.__f(10));
    const r = await RT(), now = await page.evaluate(() => window.__panel());
    if (first) png('p1-antes-deus', first); if (now) png('p1-depois-3d', now);
    ok('p1 o retrato', madeIt && r.made === 1 && !r.failed && now && now !== first, `o desenho do deus primeiro, depois o rosto pelo 3D: ${r.made} feito (o primeiro, com o 3D feito agora: ${r.first.toFixed(0)} ms)${r.failed ? ' — FALHOU: ' + r.failed : ''}`);
  }
  if (want('p2')) {
    const a = await RT(); await page.evaluate(() => window.__f(60)); await page.waitForTimeout(400); await page.evaluate(() => window.__f(30)); const b = await RT();
    ok('p2 a memória', b.made === a.made && b.hits > a.hits + 5, `o painel desenhado de novo ${b.hits - a.hits} vezes: ${b.made - a.made} retrato(s) feito(s) de novo`);
  }
  if (want('p3')) {
    const res = [];
    for (const [nm, hand, back] of [['o luto', v => { v.mourn = 9999; }, v => { v.mourn = 0; }], ['a ferida', v => { v.wound = { sev: 'grave', d: G.S.day }; v.hp = 30; }, v => { v.wound = null; v.hp = 100; }], ['os anos', v => { v.age += 25; }, v => { v.age -= 25; }]]) {
      const a = await RT(); const img0 = await page.evaluate(() => window.__panel());
      await page.evaluate(([id, f]) => { const v = G.S.villagers.get(id); (new Function('v', 'return (' + f + ')(v)'))(v); window.__f(3); }, [who.adulto, hand.toString()]);
      await until(prev => G.Retrato3D.made > prev, 60000, a.made);
      await page.waitForTimeout(200); await page.evaluate(() => window.__f(10)); const b = await RT(); const img1 = await page.evaluate(() => window.__panel()); png('p3-' + nm.replace(/\s/g, '-'), img1);
      await page.evaluate(([id, f]) => { const v = G.S.villagers.get(id); (new Function('v', 'return (' + f + ')(v)'))(v); window.__f(3); }, [who.adulto, back.toString()]);
      await page.waitForTimeout(300); await page.evaluate(() => window.__f(10)); const c = await RT();
      res.push([nm, b.made === a.made + 1, img1 !== img0, c.made === b.made]);
    }
    ok('p3 o rosto muda', res.every(r => r[1] && r[2] && r[3]), res.map(([n, m, d, k]) => `${n}: ${m ? 'feito de novo' : 'NÃO FEITO'}${d ? '' : ' (IGUAL)'}, de volta ${k ? 'o guardado' : 'FEITO OUTRA VEZ'}`).join(' · '));
  }
  if (want('p5')) {
    const dead = await page.evaluate(() => { const r = [...G.S.dead.values()].filter(d => d.genoma && d.age >= 20).sort((a, b) => a.id - b.id)[0]; return r ? r.id : null; });
    if (!dead) ok('p5 o morto', false, 'nenhum morto com genoma no registro');
    else { const a = await RT(); await page.evaluate(id => window.__sel(id), dead); const m = await until(prev => G.Retrato3D.made > prev && !!document.querySelector('#inspector .portrait.dead'), 60000, a.made); await page.waitForTimeout(600); await page.evaluate(() => window.__f(6));
      const b = await RT(); const img = await page.evaluate(() => window.__panel()); if (img) png('p5-morto', img);
      const grey = await page.evaluate(() => { const c = document.querySelector('#inspector .portrait canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += Math.abs(d[i] - d[i + 1]) + Math.abs(d[i + 1] - d[i + 2]); return s / (d.length / 4); });
      ok('p5 o morto', m && b.made === a.made + 1 && grey < 12, `o retrato do morto pelo 3D, no cinza de uma lembrança (a cor média entre os canais ${grey.toFixed(1)})`); }
  }
  if (want('folha')) {
    // (the sheet: for each one, the god's drawing and the 3D's portrait, side by side in two rows)
    const ids = [who.crianca, who.adulto, who.adulta, who.outra, who.velho].filter(Boolean);
    for (const id of ids) { await page.evaluate(id => window.__sel(id), id); await until(id => G.Retrato3D.has(G.S.villagers.get(id)), 60000, id); }
    const url = await page.evaluate(ids => {
      const S = 128, sheet = document.createElement('canvas'); sheet.width = S * ids.length; sheet.height = S * 2; const x = sheet.getContext('2d');
      const into = G.Retrato3D.into; ids.forEach((id, k) => { const v = G.S.villagers.get(id);
        G.Retrato3D.into = () => false; window.__sel(id); const a = document.querySelector('#inspector .portrait canvas'); x.drawImage(a, k * S, 0, S, S);
        G.Retrato3D.into = into; window.__sel(id); const b = document.querySelector('#inspector .portrait canvas'); x.drawImage(b, k * S, S, S, S); });
      return sheet.toDataURL(); }, ids);
    png('folha', url); log('folha: ' + path.join(OUT, 'folha.png') + ' (em cima o desenho do deus, embaixo o retrato pelo 3D: criança, adulto, adulta, uma mulher de 40, um velho)');
  }
  if (want('p4')) {
    const before = await page.evaluate(() => window.__world());
    const ids = await page.evaluate(() => [...G.S.villagers.values()].filter(v => !v.inside && v.age >= 2).sort((a, b) => a.id - b.id).slice(40, 52).map(v => v.id));
    for (const id of ids) { await page.evaluate(id => window.__sel(id), id); await until(id => G.Retrato3D.has(G.S.villagers.get(id)), 30000, id); }
    await page.evaluate(() => G.UI.select(null)); const after = await page.evaluate(() => window.__world()); const r = await RT();
    // (the world before the first portrait of all — p1 — and after a dozen more: the same, the 3D never started)
    ok('p4 só se vê', before === after && (!want('p3') ? w0 === after : true) && !r.on, `${ids.length} retratos feitos: o save, o acaso e o relógio do mundo ${before === after ? 'iguais' : 'MUDARAM'} · o 3D ${r.on ? 'LIGADO' : 'desligado (a vista do deus)'} · na memória ${r.size} (teto ${await page.evaluate(() => G.Retrato3D.CAP)}) · cada um ${r.ms.toFixed(0)} ms`);
  }
  if (want('p6')) {
    // (the 3D drawing the body's world: its mark, Realm.on, set by the proof's hand — a real descent into a body takes the software
    // 3D of this machine more than half an hour in the metropolis, T-1585; the studio asks only this mark)
    const a = await RT();
    const r = await page.evaluate(id => { const v = G.S.villagers.get(id); v.age += 3; const keep = G.Realm.on; G.Realm.on = true;
      const c = document.createElement('canvas'); c.width = c.height = 128; document.body.appendChild(c); const got = G.Retrato3D.into(c, v); window.__c = c; window.__v = id; window.__keep = keep;
      return { on: G.Realm.on, got }; }, who.velho || who.adulta);
    await page.waitForTimeout(1500); const b = await RT();
    await page.evaluate(() => { G.Realm.on = window.__keep; G.Retrato3D.into(window.__c, G.S.villagers.get(window.__v)); });
    const okMade = await until(() => G.Retrato3D.has(G.S.villagers.get(window.__v)), 60000);
    const c = await RT(); await page.evaluate(() => { G.S.villagers.get(window.__v).age -= 3; });
    ok('p6 o corpo', r.on && !r.got && b.made === a.made && okMade && c.made === a.made + 1, `com o 3D desenhando o mundo do corpo: ${b.made - a.made} retrato(s) feito(s), o desenho do deus no lugar · de volta à vista do deus: ${c.made - b.made} feito`);
  }
  const mod = await page.evaluate(() => Object.keys(G.modErr || {}));
  ok('sem erro de página nem de módulo', !errs.length && !mod.length, errs.length || mod.length ? JSON.stringify({ errs: errs.slice(0, 4), mod }) : 'nenhum');
  log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
  await browser.close(); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
