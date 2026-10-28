// the 17 mandatory sea tests: node mar17.js <case> [seed]   (DET=1: a frozen clock, the same world every run)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const CASE = process.argv[2] || 'rich'; const seed = +(process.argv[3] || 7);
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(s => { let a = s; Math.random = () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; }, seed);
  // (DET=1: a frozen clock and no frames before the game — the same seed is the same world, run after run)
  if (process.env.DET) await page.addInitScript(() => { const t0 = 1700000000000; Date.now = () => t0; window.__raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html')); await page.waitForTimeout(900);
  const ok = (name, pass, detail) => console.log(`${pass ? 'PASSOU' : 'FALHOU'} | ${name} | ${detail}`);
  const newGame = async (o) => { await page.evaluate(o => G.Main.newGame(Object.assign({ type: 'mar', size: 128, tribes: 3, temper: 'pacifico', relevo: 'suave' }, o)), o || {}); await page.waitForTimeout(300); await page.mouse.click(640, 400); await page.waitForTimeout(300); await page.evaluate(helpers); };
  // helpers living in the page
  function helpers() {
    window.T = {
      run(days, each) { const S = G.S; const c0 = S.clock; let g = 0, ms = 0, worst = 0, n = 0; while (S.clock - c0 < G.DAY_LEN * days && g++ < 2000000) { const t = performance.now(); G.debug.step(0.1); const d = performance.now() - t; ms += d; n++; if (d > worst) worst = d; if (each && each()) break; } return { ms: ms / Math.max(1, n), worst }; },
      until(fn, days) { return T.run(days, fn); },
      families(set, n) { for (let k = 0; k < n; k++) { const p0 = G.W.nearestLand(set.cx + G.rr(-6, 6), set.cy + G.rr(-6, 6), 5); if (!p0) continue; const a = G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 20 + G.R() * 18, g: 'm' }); const b = G.Vg.create({ set: set.id, x: p0[0] + 0.5, y: p0[1], age: 20 + G.R() * 18, g: 'f' }); a.partner = b.id; b.partner = a.id; if (G.R() < 0.7) { const c = G.Vg.create({ set: set.id, x: p0[0], y: p0[1] + 0.5, age: 5 + G.R() * 7, mother: b.id, father: a.id }); a.kids.push(c.id); b.kids.push(c.id); } } },
      dock(set) { let site = null; const r0 = set.radius; for (const R of [8, 14, 20, 28, 36]) { set.radius = R; site = G.City.dockSite(set); if (site) break; } set.radius = r0; return site ? G.Village.addBuilding('doca', site[0], site[1], set.id, true) : null; },
      prep(f, o) { o = o || {}; for (const t of ['navegacao'].concat(o.tech || [])) f.tech.known[t] = 1; const set = G.Fac.capitalOf(f.id); if (o.fam) T.families(set, o.fam); f.stock.wood += o.wood || 300; f.stock.food += o.food || 400; f.stock.stone += 60; return T.dock(set); },
      day() { return G.S.day + G.S.time; },
      exps(fid) { return (G.S.exps || []).filter(e => !fid || e.fac === fid); },
    };
    const S = G.S; let g = 0; while (S.day < 1 && g++ < 100000) G.debug.step(0.1);
    G.Know.init();
  }
  const R = (fn, arg) => page.evaluate(fn, arg);

  if (CASE === 'rich' || CASE === 'iron') {
    // 1. a resource-rich island people does not colonize everything / 2. an iron-starved one finds a way by sea
    await newGame({ tribes: 3 });
    const r = await R(c => {
      const S = G.S; const fs = G.Fac.all(); const out = {};
      const f = fs[0]; T.prep(f, { tech: ['bronze', 'ferro'], fam: 10, food: c === 'rich' ? 3000 : 600 });
      for (const o of fs.slice(1)) T.prep(o, { tech: ['bronze'] });
      const own = G.Expe.ownRegions(f.id);
      if (c === 'rich') {
        // iron at home, known; plenty of wood and food; a cautious ruler
        let ore = (S.ores || []).find(o => o.kind === 'ferro' && own.has(G.Know.at(o.x, o.y)));
        if (!ore) { const cap = G.Fac.capitalOf(f.id); const p = G.W.nearestLand(cap.cx + 6, cap.cy + 4, 8); ore = { id: S.nextId++, kind: 'ferro', x: p[0], y: p[1], amt: 400, max: 400 }; (S.ores = S.ores || []).push(ore); }
        G.Know.learnOre(f.id, ore, 'ferro'); f.stock.minerio = 60; f.stock.wood += 1500;
        // (the cautious ruler, given — it was only said, and the case judged whoever the world crowned: with the browser of
        // 28/10 a ruler of ambition 0.98, who sails for glory on day 2, T-124 —; whoever comes to rule after is cautious too)
        window._cauto = () => { const ru = G.Politics.ruler(f); if (ru && ru.id !== window._ruId) { window._ruId = ru.id; ru.pe = Object.assign({}, G.Politics.persona(ru), { amb: 0.2, agg: 0.3 }); } return false; };
        window._cauto();
      } else {
        // no iron anywhere at home (and a war on the horizon)
        for (const o of S.ores || []) if (o.kind === 'ferro' && own.has(G.Know.at(o.x, o.y))) o.amt = 0;
        f.stock.minerio = 0;
        if (!(S.ores || []).some(o => o.kind === 'ferro' && o.amt > 0 && !own.has(G.Know.at(o.x, o.y)))) { const r = G.Know.regions().filter(q => G.Know.big(q) && !own.has(q))[0]; if (r) { const i = r.coast[0]; (S.ores = S.ores || []).push({ id: S.nextId++, kind: 'ferro', x: i % G.N + 0.5, y: Math.floor(i / G.N) + 0.5, amt: 300, max: 300 }); } }
      }
      out.p0 = G.Expe.pressure(f); out.prof = Object.assign({}, G.Expe.prof(f)); delete out.prof.lostDirs;
      window._F = f.id; return out;
    }, CASE);
    const t = await R(c => { const f = G.Fac.get(window._F); const own = G.Expe.ownRegions(f.id); return T.run(12, c === 'iron' ? () => { if ((f.stock.minerio || 0) > 2 && !(G.S.ores || []).some(o => o.kind === 'ferro' && o.amt > 0 && G.Know.knowsOre(f.id, o.id) && !own.has(G.Know.at(o.x, o.y)))) f.stock.minerio = 2; return false; } : window._cauto); }, CASE);
    const res = await R(() => {
      const S = G.S; const f = G.Fac.get(window._F); const ex = T.exps(f.id);
      const own = G.Expe.ownRegions(f.id);
      const ironKnownAbroad = (S.ores || []).filter(o => o.kind === 'ferro' && G.Know.knowsOre(f.id, o.id) && !own.has(G.Know.at(o.x, o.y))).length;
      return { n: ex.length, why: ex.map(e => (e.kind === 'colonia' ? 'colônia' : e.obj && e.obj.why) + ':' + e.status).join(', '), colonies: (S.colonies || []).filter(c => c.fac === f.id).map(c => c.name + ':' + c.st), sets: G.Fac.settlementsOf(f.id).length, p: G.Expe.pressure(f), ironAbroad: ironKnownAbroad, minerio: f.stock.minerio || 0, routes: (S.routes || []).filter(r => r.a === f.id || r.b === f.id || r.fac === f.id).length };
    });
    if (CASE === 'rich') ok('1 ilha rica não coloniza tudo', res.colonies.length <= 1 && res.n <= 10, `12 anos: ${res.n} expedições (${res.why || 'nenhuma'}); colônias: ${res.colonies.join(', ') || 'nenhuma'}; pressão inicial terra ${R2(res.p.terra)} ferro ${R2(res.p.ferro)}; ${t.ms.toFixed(1)} ms/passo`);
    else ok('2 ilha sem ferro busca solução no mar', /ferro/.test(res.why) || res.ironAbroad > 0, `12 anos: ${res.n} expedições (${res.why || 'nenhuma'}); ferro conhecido além-mar: ${res.ironAbroad}; colônias: ${res.colonies.join(', ') || 'nenhuma'}; minério no estoque ${Math.round(res.minerio)}`);
  }

  if (CASE === 'temper') {
    // 3. an adventurous culture explores more / 4. a non-maritime one less — the same sea world, the cultures as they are
    await newGame({ tribes: 5, size: 160 });
    const t0 = Date.now();
    await page.evaluate(() => { G.Skip.GOALS.tst = { years: 25 }; G.Skip.start('tst', 'livre'); });
    for (let k = 0; k < 6000; k++) { const on = await page.evaluate(() => G.Skip.on); if (!on) break; await page.waitForTimeout(500); }
    const r = await R(() => {
      const out = []; for (const f of G.Fac.all()) { const c = G.CIVS[f.civ]; out.push({ n: f.name, civ: f.civ, naval: c && c.traits.naval || 1, aff: +G.Expe.prof(f).aff.toFixed(2), exps: T.exps(f.id).length, boats: G.S.ships.filter(s => s.fac === f.id && s.kind === 'pesca').length }); }
      return out.sort((a, b) => b.naval - a.naval);
    });
    const sea = r.filter(x => x.naval >= 1.2), land = r.filter(x => x.naval <= 0.8);
    const a = sea.length ? Math.max(...sea.map(x => x.exps)) : 0, b = land.length ? Math.min(...land.map(x => x.exps)) : 99;
    const line = r.map(x => `${x.civ} (tradição naval ${x.naval}, afinidade ${x.aff}): ${x.exps} expedições, ${x.boats} barcos de pesca`).join(' · ');
    ok('3 cultura aventureira explora mais', sea.length && land.length && a >= b * 1.5 && a >= 4, `25 anos num mundo de ilhas (${((Date.now() - t0) / 1000).toFixed(0)} s): ${line}`);
    ok('4 cultura não marítima explora menos', land.length && land.every(x => x.exps < a) && land.every(x => x.boats >= 1), `as de pouca tradição naval exploram menos que as do mar — mas, vivendo em ilhas, todas pescam e se lançam ao mar (${land.map(x => x.civ + ': ' + x.exps).join(', ')})`);
  }

  if (CASE === 'fisher') {
    // 5. the fisherman's routine (shed, gear, quay, boarding, out, fish, back, unload, carry, store, mend)
    await newGame({ type: 'ilha', size: 96, tribes: 1 });
    for (let k = 0; k < 6; k++) { const m = await R(() => { const f = G.Fac.all()[0]; const d = T.prep(f, { fam: 8 }); return { dock: d ? d.id : null, pop: G.Fac.pop(f.id) }; }); if (m.dock) break; await newGame({ type: 'ilha', size: 96, tribes: 1 }); }
    const r = await R(() => {
      const S = G.S; const seen = new Set(); let watch = 0; const steps = [];
      T.run(3, () => {
        const s = S.ships.find(o => o.kind === 'pesca' && (o.crew || []).length); if (s) { seen.add('boat:' + s.st); if (!watch) watch = s.crew[0]; }
        const v = watch && S.villagers.get(watch); if (v) { const k = v.aboard ? 'a bordo' : v.task ? v.task.type + (v.task.st !== undefined ? ':' + v.task.st : '') : '-'; const g = v.gear ? '+' + v.gear : ''; const kk = k + g + (v.carry ? '+carga' : ''); if (steps[steps.length - 1] !== kk) steps.push(kk); }
        return false;
      });
      const d = [...S.buildings.values()].find(b => b.type === 'doca');
      return { seen: [...seen], steps: steps.slice(0, 60), fishers: [...S.villagers.values()].filter(v => v.role === 'pescador').length, delivered: S.stats && S.stats.fishDelivered || 0, mend: steps.some(x => /redes/.test(x)) };
    });
    if (process.env.PROBE) console.log('PROBE ' + JSON.stringify(await page.evaluate(c => (0, eval)('(() => {' + c + '})()'), require('fs').readFileSync(process.env.PROBE, 'utf8')), null, 1));
    const need = ['boat:board', 'boat:out', 'boat:fish', 'boat:back', 'boat:unload'];
    const hasCarry = r.steps.some(x => /descarga/.test(x) || /carga/.test(x));
    ok('5 rotina do pescador', need.every(k => r.seen.includes(k)) && r.steps.some(x => /barco/.test(x)) && hasCarry, `barco: ${r.seen.join(' → ')}; um pescador: ${r.steps.slice(0, 22).join(' → ')}${r.mend ? ' (consertou as redes)' : ''}; ${r.fishers} pescadores`);
  }

  if (CASE === 'solo' || CASE === 'grand') {
    // 6. an individual expedition / 7. a grand state expedition
    await newGame({ tribes: 3 });
    await R(() => { const f = G.Fac.all()[0]; T.prep(f, { tech: ['bronze'], fam: 14, food: 900, wood: 500 }); window._F = f.id; });
    const r = await R(sc => {
      const S = G.S; const f = G.Fac.get(window._F); let e = null; let g = 0;
      while (!e && g++ < 60) { e = G.Expe.consider(f, { scale: sc }); if (!e) T.run(0.02); }
      if (!e) return { err: 'nenhuma' };
      const sts = []; const crew0 = e.crew.length; const ships0 = e.ships.length; const roles = Object.assign({}, e.roles);
      T.run(9, () => { if (sts[sts.length - 1] !== e.st) sts.push(e.st); return e.st === 'fim'; });
      return { name: e.name, scale: e.scale, crew0, ships0, roles: Object.keys(roles).filter(k => roles[k] && (!Array.isArray(roles[k]) || roles[k].length)), sts, status: e.status, log: e.log.map(c => c.h), disc: (e.disc || []).length, lost: e.lost.length, back: G.Expe.alive(e).length };
    }, CASE === 'solo' ? 'so' : 'grande');
    if (CASE === 'solo') ok('6 expedição individual', !r.err && r.scale === 'so' && r.sts.includes('partida') && r.sts.includes('viagem') && r.sts.includes('fim'), r.err || `${r.name}: ${r.crew0} pessoa(s), ${r.ships0} barco · ${r.sts.join(' → ')} · ${r.status} · livro: ${r.log.join(' / ')}`);
    else ok('7 grande expedição do Estado', !r.err && r.scale === 'grande' && r.ships0 >= 2 && r.crew0 >= 12 && r.sts.includes('exploracao'), r.err || `${r.name}: ${r.crew0} pessoas, ${r.ships0} navios, papéis ${r.roles.join('/')} · ${r.sts.join(' → ')} · ${r.status}, ${r.disc} descobertas, ${r.lost} mortos · livro: ${r.log.slice(0, 14).join(' / ')}`);
  }

  if (CASE === 'know' || CASE === 'dead') {
    // 8. an island is known only to whoever learned of it / 9. an expedition lost with all hands tells no one
    await newGame({ tribes: 3 });
    await R(() => { const fs = G.Fac.all(); const f = fs[0]; T.prep(f, { tech: ['bronze'], fam: 14, food: 900, wood: 500 }); window._F = f.id; window._O = fs.slice(1).map(o => o.id); });
    const r = await R(c => {
      const S = G.S; const K = G.Know; const f = G.Fac.get(window._F); let e = null; let g = 0;
      while (!e && g++ < 60) { e = G.Expe.consider(f, { scale: 'grande' }); if (!e) T.run(0.02); }
      if (!e) return { err: 'nenhuma' };
      // (one voyage at sea for this people while we watch: a second one that sails to the same island and comes back
      // would bring home, honestly, what this one saw — and the proof could not tell it from telepathy: T-024)
      if (c === 'dead') { const oc = G.Expe.consider, op = G.Expe.colonyPlan; G.Expe.consider = function (ff) { return ff && ff.id === f.id ? null : oc.apply(this, arguments); }; G.Expe.colonyPlan = function (ff) { return ff && ff.id === f.id ? null : op.apply(this, arguments); }; }
      const snap = () => K.regions().filter(K.big).map(q => K.state(f.id, q));
      const before = snap(); const others0 = window._O.map(id => K.regions().filter(K.big).map(q => K.state(id, q)));
      const out = { name: e.name };
      // at sea, after landing and exploring: what does home know?
      T.run(8, () => e.st === 'reembarque' || e.st === 'volta' || e.st === 'fim');
      out.disc = (e.disc || []).map(d => d.txt);
      out.atSea = snap(); out.st = e.st;
      if (c === 'dead') {
        // the sea takes them all on the way home
        T.run(0.6, () => e.st === 'volta');
        for (const s of e.ships.map(id => S.ships.find(o => o.id === id)).filter(Boolean)) { for (const v of G.Naval.aboardOf(s)) G.Village.kill(v, 'drown'); G.Naval.sink(s, null, 'god'); }
        for (const id of e.crew) { const v = S.villagers.get(id); if (v) G.Village.kill(v, 'drown'); }
        T.run(0.3);
        out.status = e.status; out.after = snap(); out.presumed0 = e.presumed || 0; out.due = e.due;
        // (the day counter is whole days: home gives them up on the first morning after the date they were due)
        T.run(Math.max(0.5, (e.due || S.day) - S.day + 1.6), () => !!e.presumed);
        out.presumed = e.presumed || 0; out.later = snap();
        out.hist = S.history.filter(h => h.txt.includes(e.name)).map(h => h.d + ': ' + h.txt).slice(-4);
      } else {
        T.run(6, () => e.st === 'fim');
        out.status = e.status; out.after = snap();
      }
      out.turned = e.turned || '';
      out.before = before; out.others0 = others0; out.others = window._O.map(id => K.regions().filter(K.big).map(q => K.state(id, q)));
      out.names = K.regions().filter(K.big).map(q => (K.named(q) ? K.name(q) : q.kind));
      const keys = K.regions().filter(K.big).map(q => q.key); out.vis = (e.visited || []).map(k => keys.indexOf(k)).filter(i => i >= 0); out.EXP = K.EXP;
      return out;
    }, CASE);
    const raised = (a, b) => a.reduce((n, x, i) => n + (b[i] > x ? 1 : 0), 0);
    if (r.err) ok(CASE === 'know' ? '8 conhecimento por civilização' : '9 expedição toda morta não informa', false, r.err);
    else if (CASE === 'know') {
      // (what the voyage walked on: not known at home while they are away, known once they are back, never by the others)
      const learnedAtSea = r.vis.filter(i => r.atSea[i] >= r.EXP && r.before[i] < r.EXP).length, learned = r.vis.filter(i => r.after[i] >= r.EXP).length, othersLearned = r.vis.filter(i => r.others.some((o, k) => o[i] >= r.EXP && r.others0[k][i] < r.EXP)).length;
      ok('8 ilha conhecida só por quem soube', r.vis.length >= 1 && learned >= 1 && learnedAtSea === 0 && othersLearned === 0, `${r.name} (${r.status}${r.turned ? ', voltou por ' + r.turned : ''}) descobriu ${r.disc.join(', ') || '—'}; regiões que a terra natal passou a conhecer: no mar ${learnedAtSea}, depois da volta ${learned}; outros povos que souberam: ${othersLearned} · estados ${r.names.map((n, i) => n + ':' + r.before[i] + '→' + r.after[i]).join(' ')}`);
    } else {
      const leaked = r.vis.filter(i => r.later[i] >= r.EXP && r.before[i] < r.EXP).length;
      ok('9 expedição toda morta → sem telepatia', r.vis.length >= 1 && leaked === 0 && /perdida|naufragada/.test(r.status) && !r.presumed0 && !!r.presumed, `${r.name}: descobriu ${r.disc.join(', ') || '—'} e afundou com todos (${r.status}); regiões que vazaram para casa: ${leaked}; dada como perdida só no dia ${r.presumed} (prevista ${r.due}); crônica: ${r.hist.join(' | ')}`);
    }
  }

  if (CASE === 'colony') {
    // 10. a colony founded for a reason, and whether it lives
    await newGame({ tribes: 3, size: 140 });
    const pre = await R(() => {
      const S = G.S; const f = G.Fac.all()[0]; T.prep(f, { tech: ['bronze'], fam: 40, food: 1600, wood: 900 }); window._F = f.id;
      return { p: G.Expe.pressure(f), pop: G.Fac.pop(f.id) };
    });
    const r = await R(() => {
      const S = G.S; const f = G.Fac.get(window._F); let e = null; let g = 0;
      // first the land over the water has to be known (a voyage that comes back)
      let x0 = null; while (!x0 && g++ < 60) { x0 = G.Expe.consider(f, { scale: 'grande' }); if (!x0) T.run(0.02); }
      if (x0) T.run(9, () => x0.st === 'fim');
      // then the people grows too big for the island: someone proposes the other shore
      g = 0; while (!e && g++ < 200) { e = G.Expe.colonyPlan(f, true); if (!e) T.run(0.05); }
      if (!e) return { err: 'sem plano (exploração: ' + (x0 ? x0.status + ' ' + (x0.disc || []).length + ' descobertas' : 'nenhuma') + ')', p: G.Expe.pressure(f) };
      const sts = []; T.run(10, () => { if (sts[sts.length - 1] !== e.st) sts.push(e.st); return e.st === 'fim'; });
      const col = (S.colonies || []).find(c => c.exp === e.id) || (S.colonies || []).slice(-1)[0];
      const set0 = col && S.settlements.get(col.set);
      const pop0 = set0 ? G.Village.pop(set0.id) : 0;
      T.run(6);
      const set1 = col && S.settlements.get(col.set);
      return { name: e.name, sts, status: e.status, why: e.obj && e.obj.why, col: col ? { name: col.name, st: col.st, d: col.d } : null, pop0, pop1: set1 ? G.Village.pop(set1.id) : 0, alive: !!set1, log: e.log.map(c => c.h).slice(-6), hist: S.history.filter(h => col && h.txt.includes(col.name)).map(h => h.d + ': ' + h.txt).slice(-4) };
    });
    ok('10 colônia: fundação e sobrevivência', !r.err && !!r.col && r.status === 'colonia', r.err ? r.err + ' ' + JSON.stringify(r.p) : `${r.name}: ${r.sts.join(' → ')}; colônia ${r.col ? r.col.name + ' (' + r.col.st + ')' : '—'}, ${r.pop0} pessoas na fundação, ${r.pop1} seis anos depois${r.alive ? '' : ' — morreu'}; pressão inicial terra ${R2(pre.p.terra)}; crônica: ${r.hist.join(' | ')}`);
  }

  if (CASE === 'sink') {
    // 13. the consequences of a ship that goes down with its crew
    await newGame({ type: 'ilha', size: 96, tribes: 1 });
    for (let k = 0; k < 6; k++) { const m = await R(() => { const f = G.Fac.all()[0]; const d = T.prep(f, { fam: 12 }); window._F = f.id; return !!d; }); if (m) break; await newGame({ type: 'ilha', size: 96, tribes: 1 }); }
    const r = await R(() => {
      const S = G.S; let s = null;
      T.run(5, () => { s = S.ships.find(o => o.kind === 'pesca' && G.Naval.aboardOf(o).length >= 1 && G.Naval.atSea(o) && (o.st === 'fish' || o.st === 'out' || o.st === 'back')); return !!s; });
      if (!s) return { err: 'sem barco no mar' };
      const crew = G.Naval.aboardOf(s); const ids = crew.map(v => v.id); const kin = new Set(); for (const v of crew) for (const k of G.Stories.kin(v)) if (!ids.includes(k.id)) kin.add(k.id);
      const nm = G.Naval.title(s); const wrecks0 = (S.wrecks || []).length;
      G.Naval.sink(s, null, 'storm');
      T.run(1.2);
      const dead = ids.filter(id => !S.villagers.has(id)); const alive = ids.filter(id => S.villagers.has(id));
      const mourn = [...kin].map(id => S.villagers.get(id)).filter(Boolean).filter(k => (k.mourn || 0) > 0 || k.widow).length;
      const stories = (S.saga ? S.saga.stories : []).filter(x => [...kin].includes(x.protag) || ids.includes(x.protag)).map(x => x.type + ':' + x.title);
      return { small: G.Naval.small(s), nm, n: ids.length, dead: dead.length, alive: alive.map(id => { const v = S.villagers.get(id); return v.name + (v.wrecked ? ' (náufrago)' : '') + (v.task ? ' ' + v.task.type : ''); }), causes: dead.map(id => (S.dead.get(id) || {}).cause), kin: kin.size, mourn, wrecks: (S.wrecks || []).length - wrecks0, stories, hist: S.history.filter(h => h.txt.includes(nm.replace(/^(o|a) /, '')) || /afog|naufrág|afund|virou/.test(h.txt)).map(h => h.txt).slice(-4) };
    });
    ok('13 navio afundado: consequências para a tripulação', !r.err && (r.wrecks >= 1 || (r.small && r.dead === 0)) && (r.dead === 0 || r.causes.every(c => c === 'drown')) && (r.dead === 0 || r.mourn > 0 || r.kin === 0), r.err || `${r.nm}: ${r.n} a bordo, ${r.dead} afogados, sobreviventes: ${r.alive.join(', ') || '—'}; ${r.mourn}/${r.kin} parentes de luto; destroço registrado: ${r.wrecks}; histórias: ${r.stories.join(', ') || '—'}; crônica: ${r.hist.join(' | ')}`);
  }

  if (CASE === 'saveexp') {
    // 14. save and load in the middle of a voyage
    await newGame({ tribes: 3 });
    await R(() => { const f = G.Fac.all()[0]; T.prep(f, { tech: ['bronze'], fam: 14, food: 900, wood: 500 }); window._F = f.id; });
    const b = await R(() => {
      const S = G.S; const f = G.Fac.get(window._F); let e = null; let g = 0;
      while (!e && g++ < 60) { e = G.Expe.consider(f, { scale: 'grande' }); if (!e) T.run(0.02); }
      if (!e) return { err: 'nenhuma' };
      T.run(6, () => e.st === 'exploracao' || e.st === 'viagem' && S.clock % 50 < 0.2);
      window._E = e.id;
      const hz = (S.saga.stories || []).find(x => x.type === 'horizonte' && x.data.exp === e.id);
      return { st: e.st, aboard: G.Expe.alive(e).filter(v => v.aboard).length, ashore: G.Expe.alive(e).filter(v => !v.aboard).length, crew: e.crew.length, prov: Math.round(e.prov), log: e.log.length, story: hz ? hz.title + ':' + hz.phase : '—', ships: e.ships.length };
    });
    await page.evaluate(() => G.Save.save(true)); await page.evaluate(() => G.Main.continueGame()); await page.waitForTimeout(400); await page.evaluate(() => { const S = G.S; window.T.run = window.T.run; });
    await page.evaluate(helpersAgain);
    const a = await R(() => { const e = G.Expe.get(window._E); const S = G.S; const hz = (S.saga.stories || []).find(x => x.type === 'horizonte' && x.data.exp === e.id); return { st: e.st, aboard: G.Expe.alive(e).filter(v => v.aboard).length, ashore: G.Expe.alive(e).filter(v => !v.aboard).length, crew: e.crew.length, prov: Math.round(e.prov), log: e.log.length, story: hz ? hz.title + ':' + hz.phase : '—', ships: e.ships.length }; });
    const dbg = await R(() => { const e = G.Expe.get(window._E); const S = G.S; const out = []; let n0 = e.log.length; T.run(3, () => { while (n0 < e.log.length) { const c = e.log[n0++]; out.push(c.h + ': ' + c.txt); } if (!window._st || window._st !== e.st) { window._st = e.st; const fl = S.ships.find(o => o.id === e.flag); out.push('st=' + e.st + ' ships=' + e.ships.map(id => { const s = S.ships.find(o => o.id === id); return s ? s.kind + ':' + s.st + ':hp' + Math.round(s.hp) + ':exp' + s.exp + ':ab' + G.Naval.aboardOf(s).length + (s.path ? ':path' + s.pi + '/' + s.path.length : ':nopath') : 'X'; }).join(',') + ' alive=' + G.Expe.alive(e).length + ' aboard=' + G.Expe.alive(e).filter(v => v.aboard).length + ' prov=' + Math.round(e.prov)); } return e.st === 'fim'; }); return out; });
    console.log(dbg.join('\n'));
    const l = await R(() => { const e = G.Expe.get(window._E); const sts = []; T.run(8, () => { if (sts[sts.length - 1] !== e.st) sts.push(e.st); return e.st === 'fim'; }); const hz = (G.S.saga.stories || []).find(x => x.type === 'horizonte' && x.data.exp === e.id); return { sts, status: e.status, story: hz ? hz.title + ':' + (hz.end ? hz.end.k : hz.phase) : '—' }; });
    ok('14 salvar/carregar durante uma expedição', !b.err && a.st === b.st && a.crew === b.crew && a.aboard === b.aboard && a.ships === b.ships && /voltou|naufragada|perdida|colonia/.test(l.status), b.err || `antes ${JSON.stringify(b)} · depois ${JSON.stringify(a)} · e então ${l.sts.join(' → ')} = ${l.status}; história ${l.story}`);
  }

  if (CASE === 'savewar' || CASE === 'bigbattle' || CASE === 'invasion' || CASE === 'trace') {
    // 11. island war: fleet + transports + landing / 12. a big naval battle / 15. save and load during a naval battle
    const big = CASE === 'bigbattle';
    await newGame({ tribes: 2, size: 150 });
    // (an island war needs two islands: a new world until the two capitals are on different land)
    for (let k = 0; k < 8; k++) { const same = await R(() => { const fs = G.Fac.all(); const a = G.Fac.capitalOf(fs[0].id), b = G.Fac.capitalOf(fs[1].id); return !a || !b || G.Know.at(a.cx, a.cy) === G.Know.at(b.cx, b.cy); }); if (!same) break; await newGame({ tribes: 2, size: 150 }); }
    await R(([big]) => {
      const S = G.S; const P = G.Politics; const fs = G.Fac.all().slice(0, 2);
      fs.forEach((f, i) => {
        const set = G.Fac.capitalOf(f.id); const want = big ? 240 : i ? 140 : 170;
        let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const a = G.R() * 6.283, r = G.R() * (set.radius || 6); const p = G.W.nearestLand(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 5); if (p) G.Vg.create({ set: set.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); }
        for (const t of ['navegacao', 'bronze', 'arco', 'ferro']) f.tech.known[t] = 1;
        f.stock.wood += 1200; f.stock.food += want * 8; f.stock.stone += 100; f.stock.armas = (f.stock.armas || 0) + Math.round(want * 0.25);
        const d = T.dock(set); for (let q = 0; q < (big ? 8 : 4); q++) G.Naval.spawn('guerra', f, d);
      });
      G.Fac.updateTerritory(); G.Know.init(); P.meet(fs[0], fs[1], { quiet: true });
      window._A = fs[0].id; window._B = fs[1].id; P.declareWar(fs[0], fs[1], 'ambicao');
    }, [big]);
    if (CASE === 'trace') {
      const r = await R(() => {
        const S = G.S; const out = []; let army = null; let last = ''; let landedT = 0;
        const fn0 = G.Wars.formNow; G.Wars.formNow = function (a) { const ms = a.members.map(id => S.villagers.get(id)).filter(Boolean); const t = {}; for (const v of ms) { const k = v.task ? v.task.type + ':' + v.task.st + (v.task.army === a.id ? '' : '!army') : '-'; t[k] = (t[k] || 0) + 1; } out.push('formNow phase=' + a.phase + ' members=' + a.members.length + ' ' + JSON.stringify(t) + ' praia=' + [...S.villagers.values()].filter(v => v.task && v.task.type === 'praia').length); const r = fn0(a); out.push(' -> phase=' + a.phase + ' done=' + a.done + ' band=' + a.band); window._sold = a.members.slice(); return r; };
        T.run(8, () => {
          if (!army) { army = (S.wz.armies || []).find(a => a.sea); if (!army) return false; }
          const b = army.band && G.War.bands.get(army.band); const ms = army.members.map(id => S.villagers.get(id)).filter(Boolean);
          const tasks = {}; for (const v of ms) { const k = v.aboard ? 'aboard' : v.task ? v.task.type + (v.task.st !== undefined ? ':' + v.task.st : '') : '-'; tasks[k] = (tasks[k] || 0) + 1; }
          const fl = (S.fleets || []).find(f => f.army === army.id);
          const key = `${army.phase} band=${b ? b.st : '-'} fleet=${fl ? fl.st : '-'}`;
          const k = `${army.phase} n=${army.members.length} alive=${ms.length} band=${b ? b.st + '/' + b.members.length : '-'} fleet=${fl ? fl.st : '-'} ${JSON.stringify(tasks)}`;
          if (fl && fl.st === 'desembarque' && (window._dn = (window._dn || 0) + 1) < 40 && window._dn % 2 === 0) { const pr = [...S.villagers.values()].filter(v => v.task && v.task.type === 'praia'); out.push(`  .. t=${fl.t.toFixed(1)} dq=${(fl.dq || 0).toFixed(2)} praia=${pr.length} (${pr.slice(0, 3).map(v => v.task.fleet === fl.id ? 'ok' : 'outra').join(',')}) aboard=${ms.filter(v => v.aboard).length} tasks=${JSON.stringify(tasks)}`); }
          if (fl && fl.st === 'desembarque' && !window._dd) { window._dd = 1; const byShip = {}; for (const v of ms) if (v.aboard) { const sh = S.ships.find(o => o.id === v.aboard); const k = (sh ? sh.kind + (fl.ships.includes(sh.id) ? '' : '(fora da frota)') : 'nenhum') + '#' + v.aboard; byShip[k] = (byShip[k] || 0) + 1; } out.push('DESEMBARQUE frota=' + fl.ships.map(id => { const sh = S.ships.find(o => o.id === id); return sh ? sh.kind + '#' + id + ':' + G.Naval.aboardOf(sh).length : 'X#' + id; }).join(',') + ' soldados por navio=' + JSON.stringify(byShip) + ' fl.t=' + fl.t); }
          if (window._sold && army.phase !== 'reunir' && (window._st2 = (window._st2 || 0) + 1) % 25 === 0 && window._st2 < 900) { const t2 = {}; for (const id of window._sold) { const v = S.villagers.get(id); const k = !v ? (S.dead.has(id) ? 'morto:' + S.dead.get(id).cause : 'sumiu') : v.captive ? 'cativo' : v.aboard ? 'aboard' : v.task ? v.task.type + (v.task.type === 'band' ? ':' + ((G.War.bands.get(v.task.band) || {}).st || 'semband') + (G.War.bands.get(v.task.band) && G.War.bands.get(v.task.band).fleet ? '' : ':semfrota') : '') : '-'; t2[k] = (t2[k] || 0) + 1; } out.push('   soldados: ' + JSON.stringify(t2) + ' fleet=' + (fl ? fl.st + ' t=' + fl.t.toFixed(0) : '-')); }
          if (key !== last || (S.clock - (window._tk || 0) > 12 && army.phase !== 'mobilizar')) { last = key; window._tk = S.clock; out.push('d' + S.day + ' t' + S.time.toFixed(2) + ' ' + k); }
          if (army.phase !== 'travessia' && army.phase !== 'embarque' && army.phase !== 'mobilizar' && !landedT) landedT = S.clock;
          if (army.done && S.clock - landedT > 30) return true;
          return out.length > 120;
        });
        const dead = [...S.dead.values()].filter(v => army && (army.n0 ? true : true) && v.d >= S.day - 3).slice(-12).map(v => v.name + ':' + v.cause);
        out.push('mortos recentes: ' + dead.join(', '));
        out.push('army: ' + JSON.stringify(army && { phase: army.phase, done: army.done, why: army.why, n0: army.n0, dead: army.dead, des: army.des, members: army.members.length }));
        return out;
      });
      console.log(r.join('\n'));
    } else if (CASE === 'savewar') {
      const b = await R(() => { const S = G.S; let bt = null; T.run(8, () => { bt = (S.wz.battles || []).find(x => x.naval && x.open && x.started); return !!bt; }); if (!bt) return { err: 'sem batalha naval' }; window._BT = bt.id; return { name: bt.name, ships: G.S.ships.filter(s => s.kind === 'guerra' && !s.sunk).length, fleets: (S.fleets || []).filter(f => G.Fleets.live(f)).map(f => f.name + ':' + f.st), aboard: S.ships.reduce((n, s) => n + G.Naval.aboardOf(s).length, 0) }; });
      if (b.err) { ok('15 salvar/carregar durante batalha naval', false, b.err); }
      else {
        await page.evaluate(() => G.Save.save(true)); await page.evaluate(() => G.Main.continueGame()); await page.waitForTimeout(400); await page.evaluate(helpersAgain);
        const a = await R(() => { const S = G.S; const bt = (S.wz.battles || []).find(x => x.id === window._BT); return { open: bt && bt.open, ships: S.ships.filter(s => s.kind === 'guerra' && !s.sunk).length, fleets: (S.fleets || []).filter(f => G.Fleets.live(f)).map(f => f.name + ':' + f.st), aboard: S.ships.reduce((n, s) => n + G.Naval.aboardOf(s).length, 0) }; });
        const l = await R(() => { const S = G.S; T.run(1.5, () => { const bt = (S.wz.battles || []).find(x => x.id === window._BT); return bt && !bt.open; }); const bt = (S.wz.battles || []).find(x => x.id === window._BT); return { open: bt && bt.open, winner: bt && bt.winner ? G.Fac.get(bt.winner).name : '—', sides: bt ? Object.values(bt.sides).map(s => `${s.ships}n/${s.dead}m/${s.sunk}af/${s.taken}tom`).join(' × ') : '' }; });
        ok('15 salvar/carregar durante batalha naval', a.ships === b.ships && a.fleets.length === b.fleets.length && Math.abs(a.aboard - b.aboard) <= 2, `antes ${JSON.stringify(b)} · depois ${JSON.stringify(a)} · depois de mais 1,5 dia: ${l.open ? 'ainda aberta' : 'terminou, venceu ' + l.winner} (${l.sides})`);
      }
    } else {
      const r = await R(([big]) => {
        const S = G.S; const out = { phases: [], fleet: [] };
        T.run(big ? 5 : 8, () => {
          for (const fl of S.fleets || []) { const k = fl.name + ':' + fl.mission + ':' + fl.st; if (!out.fleet.includes(k)) out.fleet.push(k); }
          for (const a of S.wz.armies || []) { if (a.sea) (window._sea = window._sea || new Set()).add(a.id); if (!(window._sea && window._sea.has(a.id))) continue; const k = a.name + ':' + a.phase + (a.phase === 'dispersado' ? '(' + (a.why || a.endWhy || '') + ',' + a.members.length + ')' : ''); if (out.phases[out.phases.length - 1] !== k) out.phases.push(k); }
          out.tmax = Math.max(out.tmax || 0, S.ships.filter(s => s.kind === 'transporte').length);
          return false;
        });
        const nb = (S.wz.battles || []).filter(b => b.naval && b.started);
        const biggest = nb.sort((a, b) => Object.values(b.sides).reduce((n, s) => n + s.ships, 0) - Object.values(a.sides).reduce((n, s) => n + s.ships, 0))[0];
        out.naval = nb.length; out.big = biggest ? { name: biggest.name, ships: Object.values(biggest.sides).reduce((n, s) => n + s.ships, 0), men: Object.values(biggest.sides).reduce((n, s) => n + s.n, 0), dead: Object.values(biggest.sides).reduce((n, s) => n + s.dead, 0), sunk: Object.values(biggest.sides).reduce((n, s) => n + s.sunk, 0), taken: Object.values(biggest.sides).reduce((n, s) => n + s.taken, 0), boards: biggest.boards || 0, winner: biggest.winner ? G.Fac.get(biggest.winner).name : '—', open: biggest.open } : null;
        out.landing = S.history.filter(h => /Desembarque|desembarc|praia/.test(h.txt)).map(h => h.txt).slice(-3);
        out.land = (S.wz.battles || []).filter(b => !b.naval).map(b => b.name).slice(-3);
        out.transports = out.tmax || 0; out.wzlog = (S.wz.wars || []).flatMap(w => (w.log || w.events || []).slice(-12).map(e => e.txt || e)).slice(-12);
        return out;
      }, [big]);
      if (big) ok('12 grande batalha naval', !!r.big && r.big.ships >= 8 && (r.big.sunk + r.big.taken) >= 1, r.big ? `${r.big.name}: ${r.big.ships} navios, ${r.big.men} homens, ${r.big.dead} mortos, ${r.big.sunk} afundados, ${r.big.taken} tomados, ${r.big.boards} abordagens; ${r.big.open ? 'ainda aberta' : 'venceu ' + r.big.winner} · ${r.naval} batalhas navais` : 'nenhuma batalha naval');
      else ok('11 guerra entre ilhas: frota + transporte + desembarque', r.transports >= 1 && r.phases.some(p => /travessia/.test(p)) && (r.landing.length > 0 || r.phases.some(p => /praia|desembarque|marcha|cerco|batalha/.test(p))), `frotas: ${r.fleet.slice(0, 8).join(', ')}; exército pelo mar: ${r.phases.slice(0, 10).join(' → ')}; ${r.transports} transportes; desembarque: ${r.landing.join(' | ') || '—'}; em terra: ${r.land.join(', ') || '—'} · guerra: ${(r.wzlog || []).join(' | ')}`);
    }
  }

  if (CASE === 'skip') {
    // 16. a timeskip across the sea: nothing left hanging
    await newGame({ tribes: 4, size: 140 });
    await R(() => { for (const f of G.Fac.all()) T.prep(f, { tech: ['bronze'], fam: 6 }); });
    const t0 = Date.now();
    await page.evaluate(() => { G.Skip.GOALS.tst = { years: 15 }; G.Skip.start('tst', 'livre'); });
    for (let k = 0; k < 4000; k++) { const on = await page.evaluate(() => G.Skip.on); if (!on) break; await page.waitForTimeout(500); }
    const r = await R(() => {
      const S = G.S; const ex = S.exps || []; const live = ex.filter(e => G.Expe.live(e));
      const stuck = live.filter(e => S.day - e.day0 > 14);
      const fl = (S.fleets || []).filter(f => G.Fleets.live(f)); const flStuck = fl.filter(f => S.day - (f.d || f.day0 || S.day) > 12);
      const aboardNoShip = [...S.villagers.values()].filter(v => v.aboard && !S.ships.some(s => s.id === v.aboard)).length;
      const st = {}; for (const e of ex) st[e.status] = (st[e.status] || 0) + 1;
      return { day: S.day, exps: ex.length, st, live: live.length, stuck: stuck.map(e => e.name + ':' + e.st), fleets: (S.fleets || []).length, flLive: fl.length, flStuck: flStuck.length, ships: S.ships.length, aboardNoShip, colonies: (S.colonies || []).map(c => c.name + ':' + c.st), castaways: (S.castaways || []).filter(c => !c.done).length, sea: (S.saga ? S.saga.stories : []).filter(x => x.type === 'horizonte' || x.type === 'naufrago').length };
    });
    ok('16 avanço no tempo', r.stuck.length === 0 && r.aboardNoShip === 0 && r.flStuck === 0, `${((Date.now() - t0) / 1000).toFixed(0)} s para 15 anos (dia ${r.day}); ${r.exps} expedições ${JSON.stringify(r.st)}, ${r.live} no mar agora, presas: ${r.stuck.join(', ') || 'nenhuma'}; frotas ${r.fleets} (${r.flLive} ativas); ${r.ships} barcos; gente 'a bordo' de barco que não existe: ${r.aboardNoShip}; colônias: ${r.colonies.join(', ') || '—'}; náufragos ${r.castaways}; histórias do mar ${r.sea}`);
  }

  if (CASE === 'perf') {
    // 17. many boats at once
    await newGame({ tribes: 4, size: 160 });
    await R(() => { for (const f of G.Fac.all()) T.prep(f, { tech: ['bronze'], fam: 10 }); });
    const base = await R(() => T.run(0.3));
    const n = await R(() => {
      const S = G.S; let n = 0; window._perf = [];
      // every harbour sends out boats with real people aboard, sailing back and forth
      for (const f of G.Fac.all()) {
        const d = G.Naval.docksOf(f.id)[0]; if (!d) continue; const di = G.Naval.dockInfo(d);
        const crewPool = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === f.id && v.age > 16 && !v.captive && !v.aboard);
        for (let k = 0; k < 18; k++) {
          const kind = ['pesca', 'guerra', 'transporte', 'mercante', 'pesca', 'guerra'][k % 6];
          const s = G.Naval.spawn(kind, f, d); if (!s) continue; n++;
          for (let q = 0; q < 3 && crewPool.length; q++) { const v = crewPool.pop(); if (G.Naval.board) G.Naval.board(v, s); else { G.Vg.endTask(v); v.aboard = s.id; v.task = { type: 'aboard', ship: s.id, pri: 9, st: 0, age: 0 }; s.crew.push(v.id); } }
          s.st = 'patrol'; s.perf = 1; window._perf.push(s.id);
          const a = G.R() * 6.283; const w = G.Naval._nearestWater(di.moor[0] + Math.cos(a) * 26, di.moor[1] + Math.sin(a) * 26, 6); if (w) G.Naval._sailTo(s, w[0], w[1]);
        }
      }
      return n;
    });
    // (the test boats keep sailing: a new heading whenever they arrive)
    await R(() => { const S = G.S; window._perfTick = () => { for (const id of window._perf) { const s = S.ships.find(o => o.id === id); if (s && s.st === 'idle') { s.st = 'patrol'; const a = G.R() * 6.283; const w = G.Naval._nearestWater(s.x + Math.cos(a) * 20, s.y + Math.sin(a) * 20, 6); if (w) G.Naval._sailTo(s, w[0], w[1]); } } }; });
    const loaded = await R(() => { let k = 0; return T.run(0.6, () => { if (++k % 20 === 0) window._perfTick(); return false; }); });
    const at = await R(() => ({ ships: G.S.ships.length, atSea: G.S.ships.filter(s => G.Naval.atSea(s)).length, aboard: G.S.ships.reduce((n, s) => n + G.Naval.aboardOf(s).length, 0), pop: G.S.villagers.size }));
    // and drawing them: frames over the busiest harbour
    const fps = await page.evaluate(async () => { const d = G.Naval.docksOf(G.Fac.all()[0].id)[0]; if (d) { G.Render.panTo(d.x, d.y); G.Render.cam.zoom = G.Render.cam.tz = 2; } const t0 = performance.now(); let fr = 0; const raf = window.__raf || requestAnimationFrame; const own = !!window.__raf; await new Promise(res => { function f() { fr++; if (own) { G.Render.update(1 / 60, 0); G.Render.frame(1 / 60); } if (performance.now() - t0 < 3000) raf(f); else res(); } raf(f); }); return fr / 3; }); // (with the frames stubbed — DET — each frame is drawn here)
    ok('17 desempenho com muitos barcos', loaded.ms < Math.max(12, base.ms * 2.5) && loaded.worst < 250, `${n} barcos a mais (${at.ships} no total, ${at.atSea} no mar, ${at.aboard} pessoas a bordo, ${at.pop} pessoas): passo ${base.ms.toFixed(2)} → ${loaded.ms.toFixed(2)} ms (pior ${loaded.worst.toFixed(0)} ms); ${fps.toFixed(0)} quadros/s na tela do porto (navegador sem GPU)`);
  }

  console.log('erros', errs.length ? errs.slice(0, 6).join(' || ') : 'nenhum');
  await browser.close();
  function R2(x) { return (+x || 0).toFixed(2); }
})();
function helpersAgain() {
  window.T = window.T || {};
  window.T.run = function (days, each) { const S = G.S; const c0 = S.clock; let g = 0, ms = 0, worst = 0, n = 0; while (S.clock - c0 < G.DAY_LEN * days && g++ < 2000000) { const t = performance.now(); G.debug.step(0.1); const d = performance.now() - t; ms += d; n++; if (d > worst) worst = d; if (each && each()) break; } return { ms: ms / Math.max(1, n), worst }; };
}
