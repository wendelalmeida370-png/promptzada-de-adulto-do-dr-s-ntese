// audiorun: node audiorun.js seed secs — a world played in real time with sound, music, ambience, frames, cinema, powers
// MUNDO=metropole: a ready world instead of a new one, the god's eye over its biggest town (people at their gestures to hear).
// The sounds of the place are written down as they ring (G.Audio.gravar: which sound, of whom, how loud, which side, how
// muffled): each tick says the scene the ear has (G.Audio.cena) and what rang; the last lines, every sound of a place by its
// name, how many had a side or a wall — and how many had no living owner (a failure).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, secs] = [+(process.argv[2] || 7), +(process.argv[3] || 90)];
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; try { localStorage.clear(); } catch (e) { }
    const AC = window.AudioContext; window.__src = { made: 0, ended: 0 };
    window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ac = this; } };
    for (const m of ['createOscillator', 'createBufferSource']) { const f = AC.prototype[m]; AC.prototype[m] = function () { const n = f.apply(this, arguments); window.__src.made++; n.addEventListener('ended', () => window.__src.ended++); return n; }; }
  }, seed);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.mouse.click(600, 400); // (a gesture, as a player gives)
  const MUNDO = process.env.MUNDO || '';
  if (MUNDO) { await page.evaluate(() => { window.__w = {}; G.Ready.got = (k, s) => { window.__w[k] = s; }; }); await page.addScriptTag({ path: require('path').resolve(__dirname, '..', 'worlds', MUNDO + '.js') }); }
  await page.evaluate(MUNDO => { if (MUNDO) G.Main.openSave(JSON.parse(window.__w[MUNDO]), ''); else G.Main.newGame({ type: 'continente', size: 96, tribes: 4, temper: 'belicoso', clima: 'variado', relevo: 'montanhoso' }); G.Main.mode = 'game'; G.Audio.init(); G.Audio.mute = false; G.Audio.setSfx(true); G.Audio.setMusic(true); G.Audio.setAmb(true); G.UI.setSpeed(MUNDO ? 2 : 4);
    G.Audio.gravar = true; window.__rung = {}; window.__orf = []; window.__side = 0; window.__wall = 0; window.__far = 0;
    if (MUNDO) { const s = [...G.S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0]; const p = G.Render.proj(s.cx, s.cy, G.W.groundH(s.cx, s.cy)); const cam = G.Render.cam; cam.x = p[0]; cam.y = p[1]; cam.zoom = cam.tz = 2.4; cam.follow = 0; }
    window.__plays = 0; const p0 = G.Audio.play, a0 = G.Audio.at; G.Audio.play = function () { window.__plays++; return p0.apply(this, arguments); }; G.Audio.at = function () { window.__plays++; return a0.apply(this, arguments); };
    window.__frames = 0; const raf = window.requestAnimationFrame; (function f() { window.__frames++; raf(f); })(); }, MUNDO);
  const t0 = Date.now(); const log = [];
  const acts = ['lightning', 'meteor', 'rain', 'quake', 'seastorm', 'wolves', 'volcano', 'plague', 'tsunami', 'heal'];
  for (let k = 0; Date.now() - t0 < secs * 1000; k++) {
    await page.waitForTimeout(5000);
    const r = await page.evaluate(([k, acts]) => {
      const S = G.S; S.faith = 1e6; const out = {};
      const sets = [...S.settlements.values()]; const s = sets[k % Math.max(1, sets.length)];
      if (s && !window.__w) { const id = acts[k % acts.length]; out.cast = id + ':' + G.Powers.cast(id, s.cx + 3, s.cy + 2); }
      // (what the place rang since the last tick, and of whom: an owner no longer in the world is written down)
      const A = G.Audio; const rung = A.tocou.splice(0); out.lugar = rung.length;
      for (const e of rung) { window.__rung[e.s] = (window.__rung[e.s] || 0) + 1; if (Math.abs(e.pan) > 0.05) window.__side++; if (e.muf) window.__wall++; if (e.longe) window.__far++; }
      const c = A.cena; if (c) { const tipos = {}; for (const f of c.fontes) tipos[f.tipo] = (tipos[f.tipo] || 0) + 1; out.cena = { modo: c.ear.modo, r: Math.round(c.ear.r), k: +c.ear.k.toFixed(2), fontes: tipos, gente: c.gente, bairro: c.fundo ? c.fundo.nome : '', fundo: c.fundo ? Object.keys(c.fundo.w).filter(f => c.fundo.w[f] > 0).map(f => f + ' ' + c.fundo.w[f]).join(', ') : '', musica: c.musica.civ + '/' + c.musica.epoca };
        for (const f of c.fontes) { const de = f.de || {}; const ok = (de.v !== undefined && S.villagers.has(de.v)) || (de.b && S.buildings.has(de.b)) || (de.navio !== undefined && S.ships.some(x => x.id === de.navio)) || (de.bicho !== undefined && S.animals.has(de.bicho)); if (!ok && window.__orf.length < 6) window.__orf.push(f.k + ' ' + f.s); } }
      if (k % 4 === 1) { G.Cinema && (G.Cinema.on ? G.Cinema.stop() : G.Cinema.start && G.Cinema.start()); out.cinema = !!(G.Cinema && G.Cinema.on); }
      if (k % 3 === 2 && G.Render.rotate) { G.Render.rotate(1); out.rot = 1; }
      if (k % 5 === 3) { G.UI.setSpeed([1, 2, 4, 8, 16][k % 5]); }
      if (k === 6 || k === 8) { G.Render.setUnder(!G.Render.under); out.under = G.Render.under; }
      if (k === 9) { G.Save.save(true); const o = JSON.parse(localStorage.getItem('gotaf-save-v1') || 'null'); out.saved = !!o; }
      out.ac = window.__ac ? window.__ac.state : 'none'; out.live = window.__src.made - window.__src.ended; out.made = window.__src.made; out.day = S.day; out.frames = window.__frames; out.plays = window.__plays; out.pop = S.villagers.size;
      return out;
    }, [k, acts]);
    log.push(r);
  }
  const lugar = await page.evaluate(() => ({ rung: window.__rung, orf: window.__orf, side: window.__side, wall: window.__wall, far: window.__far }));
  const fin = await page.evaluate(() => ({ viol: QA.check().filter(q => q.sev <= 2).map(q => `[${q.sev}] ${q.msg}`).slice(0, 10), mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0 }));
  console.log(log.map(r => JSON.stringify(r)).join('\n'));
  console.log('final', JSON.stringify(fin));
  { const n = Object.values(lugar.rung).reduce((a, b) => a + b, 0); console.log(`sons de lugar: ${n} tocados (${Object.keys(lugar.rung).sort((a, b) => lugar.rung[b] - lugar.rung[a]).map(s => s + ' ' + lugar.rung[s]).join(', ') || 'nenhum'}); com lado ${lugar.side}, abafados ${lugar.wall}, do fundo do bairro ${lugar.far}; fontes sem dono: ${lugar.orf.length ? lugar.orf.join(', ') : 'nenhuma'}`); }
  console.log('erros:', errs.length ? [...new Set(errs)].slice(0, 15).join('\n  ') : 'nenhum');
  await browser.close();
})();
