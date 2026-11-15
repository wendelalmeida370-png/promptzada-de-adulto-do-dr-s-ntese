// the divine hand, adversarial: node hand.js seed type size tribes years throws
// people in delicate states (captive, soldier on the march, actor in a scene, sailor ashore, castaway, guest, leader, envoy, escaping)
// are picked up with the real mouse and dropped where nobody should be (deep sea, another island, a cliff top, a lake, inside a building,
// the enemy's square); after each throw the world must still make sense, and after all of them it must save and load
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, type, size, tribes, years, throws] = [+(process.argv[2] || 7), process.argv[3] || 'arquipelago', +(process.argv[4] || 128), +(process.argv[5] || 5), +(process.argv[6] || 22), +(process.argv[7] || 40)];
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } }, seed);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(1000);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  const w0 = await page.evaluate(([o, y]) => { G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; document.querySelector('#intro').classList.add('hidden'); document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); QA.run(y); return { day: G.S.day, pop: G.S.villagers.size, viol: QA.check().length }; }, [{ type, size, tribes, temper: 'belicoso' }, years]);
  console.log(`mundo: dia ${w0.day}, ${w0.pop} pessoas, ${w0.viol} violações antes da mão`);
  await page.evaluate(() => {
    const S = () => G.S, R = G.Render, W = G.W;
    window.__scr = (x, y, lift) => { const [wx, wy] = R.proj(x, y, W.groundH(x, y)); const [sx, sy] = R.worldPxToScreen(wx, wy); return [sx, sy - (lift || 0) * R.cam.zoom]; };
    const inArmy = () => { const s = new Set(); for (const a of (S().wz && S().wz.armies) || []) if (!a.done) for (const id of a.members || []) s.add(id); return s; };
    const inScene = () => { const s = new Set(); for (const sc of (G.Scene && G.Scene.list) || []) if (sc.st === 'run' || sc.st === 'wait') for (const k in sc.cast || {}) s.add(sc.cast[k]); return s; };
    const inExp = () => { const s = new Set(); for (const e of S().exps || []) if (e.status === 'ativa') for (const id of e.crew || []) s.add(id); return s; };
    const leaders = () => new Set(G.Fac.all().map(f => f.leader));
    const CATS = {
      cativo: v => v.captive, soldado: (v, c) => c.army.has(v.id), ator: (v, c) => c.scene.has(v.id), marujo: (v, c) => c.exp.has(v.id), naufrago: v => !!v.wrecked,
      hospede: v => !!v.guestOf, governante: (v, c) => c.lead.has(v.id), emissario: v => v.task && v.task.type === 'envoy', fugitivo: v => v.task && v.task.type === 'escape', crianca: v => v.age < 10, qualquer: () => true };
    window.__pickVictim = k => {
      const c = { army: inArmy(), scene: inScene(), exp: inExp(), lead: leaders() };
      const cats = Object.keys(CATS); const order = [cats[k % cats.length]].concat(cats);
      for (const cat of order) {
        const vs = [...S().villagers.values()].filter(v => !v.inside && !v.held && !v.aboard && !v.air && v.age >= 2 && !(v.age < 2 && v.carried) && CATS[cat](v, c));
        if (vs.length) { const v = vs[Math.floor(Math.random() * vs.length)]; return { id: v.id, cat, name: v.name, task: v.task ? v.task.type : '-' }; }
      }
      return null;
    };
    const N = () => G.N;
    const TGT = {
      'mar fundo': () => { for (let g = 0; g < 4000; g++) { const x = 2 + Math.random() * (N() - 4), y = 2 + Math.random() * (N() - 4); if (S().type[W.idx(x, y)] === G.T.DEEP) return [x, y]; } return null; },
      'outra ilha': v => { const L = W.landIds ? W.landIds() : null; if (!L) return null; const me = L[W.idx(v.x, v.y)]; for (let g = 0; g < 4000; g++) { const x = 2 + Math.random() * (N() - 4), y = 2 + Math.random() * (N() - 4); const i = W.idx(x, y); if (L[i] && L[i] !== me && W.walkable(i)) return [x, y]; } return null; },
      'penhasco': () => { let best = null, bh = -1; for (let g = 0; g < 3000; g++) { const x = 2 + Math.random() * (N() - 4), y = 2 + Math.random() * (N() - 4); const i = W.idx(x, y); if (W.walkable(i) && S().H[i] > bh) { bh = S().H[i]; best = [x, y]; } } return best; },
      'lago': () => { for (let g = 0; g < 4000; g++) { const x = 2 + Math.random() * (N() - 4), y = 2 + Math.random() * (N() - 4); const t = S().type[W.idx(x, y)]; if (t === G.T.LAKE || t === G.T.RIVER) return [x, y]; } return null; },
      'dentro de um prédio': () => { const bs = [...S().buildings.values()].filter(b => b.built && b.w >= 2); if (!bs.length) return null; const b = bs[Math.floor(Math.random() * bs.length)]; return [b.x + b.w / 2, b.y + b.h / 2]; },
      'praça inimiga': v => { const f = G.Fac.idOfV ? G.Fac.idOfV(v) : 0; const en = f ? G.Fac.enemiesOf(f) : []; const e = en[0] ? (typeof en[0] === 'object' ? en[0] : G.Fac.get(en[0])) : null; const c = e && G.Fac.capitalOf(e.id); return c ? [c.cx + 1, c.cy + 1] : null; },
      'caverna (boca)': () => { const cs = (S().ug && S().ug.caves) || []; if (!cs.length) return null; const c = cs[Math.floor(Math.random() * cs.length)]; const m = c.mouths ? c.mouths[0] : c.mouth; return m ? [m.x + 0.5, m.y + 0.5] : null; },
    };
    window.__TGTS = Object.keys(TGT);
    window.__target = (id, k) => { const v = S().villagers.get(id); if (!v) return null; const names = Object.keys(TGT); for (let j = 0; j < names.length; j++) { const n = names[(k + j) % names.length]; const p = TGT[n](v); if (p) return { n, p }; } return null; };
  });
  const tally = {}; let grabbed = 0, missed = 0, bad = [];
  for (let k = 0; k < throws; k++) {
    const vic = await page.evaluate(k => { const v = window.__pickVictim(k); if (!v) return null; const p = G.S.villagers.get(v.id); G.UI.setPower('hand'); G.Render.centerOn(p.x, p.y, 3); v.at = window.__scr(p.x, p.y, p.age < 16 ? 4 : 6); return v; }, k);
    if (!vic) { console.log('ninguém para pegar'); break; }
    await page.mouse.move(vic.at[0], vic.at[1]); await page.mouse.down();
    const held = await page.evaluate(id => !!(G.Input.held && G.Input.held.e.id === id), vic.id);
    if (!held) { missed++; if (missed <= 3) console.log('  não pegou:', await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return (el ? el.id || el.className || el.tagName : '-') + ' power=' + G.Input.power + ' mode=' + G.Main.mode; }, vic.at)); await page.mouse.up(); continue; }
    grabbed++;
    const tg = await page.evaluate(([id, k]) => { const t = window.__target(id, k); if (!t) return null; G.Render.centerOn(t.p[0], t.p[1]); t.at = window.__scr(t.p[0], t.p[1], 0); return t; }, [vic.id, k * 3 + 1]);
    if (!tg) { await page.mouse.up(); continue; }
    await page.mouse.move(tg.at[0], tg.at[1], { steps: 4 }); await page.mouse.up();
    const r = await page.evaluate(id => {
      QA.run(0.3);
      const v = G.S.villagers.get(id); const d = G.S.dead.get ? G.S.dead.get(id) : null;
      const viol = QA.check().filter(q => q.sev <= 2 && q.msg.includes('#' + id)).map(q => `[S${q.sev}] ${q.msg}`);
      return { fate: v ? `vivo em ${v.x.toFixed(0)},${v.y.toFixed(0)} tarefa ${v.task ? v.task.type : '-'}${v.air ? ' NO AR' : ''}${v.held ? ' SEGURO' : ''}${v.aboard ? ' a bordo' : ''}${v.wrecked ? ' náufrago' : ''}` : d ? `morto (${d.cause || d.how || '?'})` : 'sumiu', viol };
    }, vic.id);
    const key = `${vic.cat} → ${tg.n}`; tally[key] = (tally[key] || 0) + 1;
    console.log(`${k}: ${vic.cat} ${vic.name} (#${vic.id}, ${vic.task}) → ${tg.n}: ${r.fate}${r.viol.length ? '\n     ' + r.viol.join('\n     ') : ''}`);
    if (r.viol.length) bad.push(key);
  }
  const end = await page.evaluate(() => { QA.run(3); const v = QA.check(); let trip; try { trip = QA.roundTrip(); } catch (e) { trip = { err: e.message }; } const v2 = QA.check(); return { day: G.S.day, pop: G.S.villagers.size, v: v.filter(q => q.sev <= 2).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`), trip: trip.err || (trip.diff || []).slice(0, 4).join(' | '), v2: v2.length, mods: G.modErr }; });
  console.log(`\npegos ${grabbed}, escaparam do clique ${missed}; com violação: ${bad.length ? bad.join(', ') : 'nenhum'}`);
  console.log(`3 anos depois: dia ${end.day} pop ${end.pop}; S0–S2: ${end.v.length}${end.v.length ? '\n  ' + end.v.slice(0, 12).join('\n  ') : ''}`);
  console.log(`save/load: ${end.trip || 'igual'}; violações depois do load ${end.v2}; módulos com erro: ${JSON.stringify(end.mods)}`);
  console.log('erros:', errs.length ? [...new Set(errs)].slice(0, 12).join('\n  ') : 'nenhum');
  await browser.close();
})();
