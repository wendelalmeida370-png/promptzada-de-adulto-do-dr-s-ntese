// monkey: node monkey.js seed secs — random keys, clicks, drags, wheel and buttons on the live game, frames on; every page error is a bug
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, secs] = [+(process.argv[2] || 7), +(process.argv[3] || 120)];
let r0 = seed * 7 + 3; const R = () => ((r0 = (r0 * 16807) % 2147483647) - 1) / 2147483646; const pick = l => l[Math.floor(R() * l.length)];
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: +(process.env.W || 1200), height: +(process.env.H || 800) }, hasTouch: !!process.env.TOUCH });
  const errs = []; let lastActs = []; page.on('pageerror', e => errs.push({ m: e.message + ' ' + (e.stack || '').split('\n').slice(0, 5).join(' | '), acts: lastActs.slice(-6) }));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push({ m: 'console: ' + t.slice(0, 300), acts: lastActs.slice(-6) }); });
  page.on('dialog', d => d.dismiss().catch(() => { }));
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; try { localStorage.clear(); } catch (e) { } }, seed);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.evaluate(() => { G.Main.newGame({ type: 'continente', size: 80, tribes: 3, temper: 'belicoso', clima: 'variado', relevo: 'suave' }); G.Main.mode = 'game'; G.UI.setSpeed(4); if (G.Audio) G.Audio.mute = true; });
  const W = +(process.env.W || 1200), H = +(process.env.H || 800);
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Tab', 'r', 'x', 'o', 'l', 'k', 'm', 'u', 'q', 'e', 'b', ' ', 'Escape', 'Escape', 'f', 'h', 'c', 'g', 'p', 't', '+', '-', 'w', 'a', 's', 'd', 'F2', 'n'];
  const t0 = Date.now(); let n = 0; const viol = new Map(); let modes = {};
  while (Date.now() - t0 < secs * 1000) {
    const r = R(); let act;
    try {
      if (r < 0.3) { const k = R() < 0.02 ? 'j' : pick(KEYS); act = 'key ' + k; await page.keyboard.press(k); }
      else if (r < 0.55) { const x = Math.floor(R() * W), y = Math.floor(R() * H); act = `click ${x},${y}`; await page.mouse.click(x, y, { button: R() < 0.1 ? 'right' : 'left' }); }
      else if (r < 0.65) { const x = R() * W, y = R() * H, x2 = x + (R() - 0.5) * 400, y2 = y + (R() - 0.5) * 300; act = `drag ${x | 0},${y | 0}→${x2 | 0},${y2 | 0}`; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x2, y2, { steps: 4 }); await page.mouse.up(); }
      else if (r < 0.72) { act = 'wheel'; await page.mouse.move(R() * W, R() * H); await page.mouse.wheel(0, (R() - 0.5) * 900); }
      else if (r < 0.97) {
        act = await page.evaluate(k => { const bs = [...document.querySelectorAll('button, .tab, [data-k], [data-m], .chip, .st-card, .ev, li[data-id]')].filter(b => b.offsetParent !== null && !b.disabled); if (!bs.length) return 'nobutton'; const b = bs[Math.floor(k * bs.length)]; const d = (b.id || b.className || b.tagName) + ':' + (b.textContent || '').trim().slice(0, 20); b.click(); return 'button ' + d; }, R());
      } else { act = 'wait'; await page.waitForTimeout(800); }
    } catch (e) { act += ' (falhou: ' + e.message.slice(0, 60) + ')'; }
    lastActs.push(act); if (lastActs.length > 30) lastActs.shift(); n++;
    await page.waitForTimeout(40 + Math.floor(R() * 90));
    if (n % 150 === 0) {
      const st = await page.evaluate(() => { const m = G.Main.mode; let v = []; if (m === 'game' && G.S) try { v = QA.check().filter(q => q.sev <= 2).map(q => `[${q.sev}] ${q.sys} ${q.msg}`); } catch (e) { v = ['check err ' + e.message]; } return { m, v, day: G.S ? G.S.day : -1, skip: !!(G.Skip && G.Skip.on), modal: !!G.Main.modalOpen }; }).catch(e => ({ m: 'eval err ' + e.message, v: [] }));
      modes[st.m] = (modes[st.m] || 0) + 1;
      for (const q of st.v) { const k = q.replace(/#\d+/g, '#').replace(/\d+(\.\d+)?/g, 'N'); if (!viol.has(k)) viol.set(k, q); }
      // (back to a world if the monkey left it, and out of a long time skip)
      await page.evaluate(() => { if (G.Skip && G.Skip.on && Math.random() < 0.5) G.Skip.stop(); if (G.Main.mode === 'menu') { G.Main.newGame({ type: 'ilha', size: 64, tribes: 2, temper: 'normal', clima: 'variado', relevo: 'suave' }); G.Main.mode = 'game'; G.UI.setSpeed(4); } }).catch(() => { });
    }
  }
  console.log(`ações ${n}; modos ${JSON.stringify(modes)}`);
  console.log('violações S0-S2:', viol.size ? [...viol.values()].slice(0, 12).join('\n  ') : 'nenhuma');
  const uniq = new Map(); for (const e of errs) if (!uniq.has(e.m)) uniq.set(e.m, e);
  console.log('erros:', uniq.size ? [...uniq.values()].slice(0, 12).map(e => e.m + '\n     após: ' + e.acts.join(' ; ')).join('\n  ') : 'nenhum');
  await browser.close();
})();
