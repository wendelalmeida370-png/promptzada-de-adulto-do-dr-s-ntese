// urb1: node urb1.js [semente] [tamanho] [anos máx.] — the space of the city (UR-A)
// a blessed world grows until its first metropolis (or the years run out), then:
//  1 the quarters are born from the town: each one's vocation is in its buildings
//  2 every quarter has a name of its own in its town, and keeps it (ids, names and history survive a save)
//  3 the land of the noble quarters is worth more than the land of the popular ones
//  4 the town grows from many cores, not only around its fire
//  5 avenues join the hearth to the cores, and they are paved before the side streets
//  6 a city spreads out: the edge of town sleeps fewer people per patch than its heart
//  7 the checker finds nothing wrong with the quarters, before and after the save
// and the life of the towns, never provoked: what the years did on their own
//  8 the yards of the edge houses were tended and picked, and fed their families
//  9 the taverns poured: drink brewed in the house or brought from the stores, and served
// 10 the ships' cargo came ashore in crates and went into the stores through the warehouses
// 11 the thefts were answered: the thief caught (the cell, or the coin given back), not only left open
// 12 the well-off live on dearer land than the plain families (they buy the good houses)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const [seed, size, maxYears] = [+(process.argv[2] || 41), +(process.argv[3] || 128), +(process.argv[4] || 90)];
const GAME = process.env.GAME || 'file://' + require('path').resolve(__dirname, '..', 'index.html');
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(GAME); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  const t0 = Date.now(); const res = []; const ok = (n, c, d) => { res.push(`${c ? 'PASSOU' : 'FALHOU'} | ${n} | ${d}`); };
  await page.evaluate(o => { G.Main.newGame({ type: 'continente', size: o.size, tribes: 4, seed: o.seed, temper: 'pacifico' }); G.UI.setSpeed(0); G.Main.mode = 'game'; if (G.Audio) G.Audio.mute = true; }, { size, seed });
  // the years pass under a blessing (peace and plenty), a decade per call
  for (let k = 0; k < Math.ceil(maxYears / 5); k++) {
    const st = await page.evaluate(() => {
      const S = G.S; const d0 = S.day; let blessT = 0;
      S.blessed = true;
      while (S.day < d0 + 5) { G.debug.step(0.1); if ((blessT -= 0.1) <= 0) { blessT = 2; S.divinePeace = Math.max(S.divinePeace || 0, G.DAY_LEN * 0.5); S.weather.fertility = Math.max(S.weather.fertility || 0, G.DAY_LEN * 0.5); } }
      let t = 0; for (const s of S.settlements.values()) t = Math.max(t, s.tier || 0);
      return { day: S.day, t, pop: S.villagers.size };
    });
    if (st.t >= 4 && st.day >= 40) break;
  }
  // a few more years after the first metropolis, for its quarters to settle
  await page.evaluate(() => { const S = G.S; const d0 = S.day; while (S.day < d0 + 6) G.debug.step(0.1); });
  const look = () => page.evaluate(() => {
    const S = G.S; const U = G.Urban; const out = { day: S.day, towns: [] };
    for (const s of S.settlements.values()) {
      if ((s.tier || 0) < 3) continue;
      const sn = U.peek(s.id); if (!sn) continue;
      const bs = [...S.buildings.values()].filter(b => b.set === s.id && b.type !== 'ruin');
      const ds = U.districtsOf(s).map(d => {
        const types = {}; for (const c of d.cells) { const o = sn.cells.get(c); if (o) for (const t in o.types) types[t] = (types[t] || 0) + o.types[t]; }
        return { id: d.id, k: d.k, name: d.name, born: d.born, cells: d.cells.length, hist: (d.hist || []).length, types, st: d._st || null };
      });
      // density by distance: beds (the roofs people sleep under) per patch of town, in the inner and the outer half
      // (fields, pens and orchards at the edge are its air, not its density)
      let inn = 0, innA = 0, out2 = 0, outA = 0; const R = Math.max(6, s.radius || 8);
      for (const o of sn.cells.values()) { if (!o.n) continue; const share = o.beds || 0; if (o.dc < R * 0.5) { inn += share; innA++; } else { out2 += share; outA++; } }
      let av = 0, avPaved = 0, side = 0, sidePaved = 0;
      const p = s._plan; if (p && p.tiles) for (const i of p.tiles) { const pv = S.road[i] >= 2; if (p.av && p.av.has(i)) { av++; if (pv) avPaved++; } else { side++; if (pv) sidePaved++; } }
      const coreHomes = sn.cores.filter(c => c.k !== 'lar' && c.homes >= 3).map(c => c.k + ':' + c.homes);
      out.towns.push({ id: s.id, name: s.name, tier: s.tier, civ: sn.civ, pop: G.Village.pop(s.id), builds: bs.length, ds, inner: innA ? inn / innA : 0, outer: outA ? out2 / outA : 0, av, avPaved, side, sidePaved, cores: sn.cores.map(c => c.k), coreHomes });
    }
    out.check = QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg);
    return out;
  });
  const A = await look();
  const towns = A.towns.filter(t => t.ds.length);
  const all = towns.flatMap(t => t.ds.map(d => Object.assign({ town: t.name }, d)));
  console.log(`== urb1 semente ${seed} ${size} — ano ${A.day}, ${A.towns.length} cidades`);
  for (const t of A.towns) console.log(`  ${t.name} (${t.civ}, degrau ${t.tier}, ${t.pop} pessoas, ${t.builds} prédios): ${t.ds.map(d => `${d.name} [${d.k}, ${d.cells}c, ${d.st ? d.st.res : 0}p, terra ${d.st ? Math.round(d.st.value) : '?'}]`).join(' · ')}`);
  // 1 vocation from the buildings
  const VOC = { porto: ['doca', 'salga', 'armazem'], informal: ['barraco'], mercantil: ['mercado', 'feira', 'taverna', 'coletoria', 'mercado_negro', 'ourives'], artesao: ['workshop', 'forja', 'tecelagem', 'olaria', 'acougue', 'ourives', 'mina'], templo: ['temple', 'maravilha', 'monument', 'estatua', 'cemetery'], militar: ['quartel', 'estabulo', 'torre', 'cercado', 'cadeia'], agrario: ['farm', 'curral', 'pomar', 'plantacao', 'vinhedo', 'apiario', 'salina', 'sericultura'] };
  const HOMES = ['hut', 'house', 'sobrado', 'insula', 'quarteirao'];
  // (a merchants' quarter may be where the merchants live, a harbour quarter where the fishermen live: their houses count)
  const bad = all.filter(d => VOC[d.k] ? !VOC[d.k].some(t => d.types[t]) && !((d.k === 'mercantil' || d.k === 'porto') && HOMES.some(t => d.types[t])) : (d.k === 'popular' || d.k === 'nobre') ? !HOMES.some(t => d.types[t]) && !['palacio', 'paco', 'grande_palacio', 'palacio_colossal', 'administracao'].some(t => d.types[t]) : false);
  const kinds = [...new Set(all.map(d => d.k))];
  ok('1 bairros nascem do que a cidade tem', towns.length > 0 && all.length >= 3 && kinds.length >= 3 && !bad.length, `${all.length} bairros em ${towns.length} cidades, vocações: ${kinds.join(', ')}${bad.length ? ' · sem o que os define: ' + bad.map(d => d.name + ':' + d.k).join(', ') : ''}`);
  // 2 names unique in each town, kept by the save
  const dup = towns.filter(t => new Set(t.ds.map(d => d.name.toLowerCase())).size !== t.ds.length);
  await page.evaluate(() => G.Save.save(true));
  await page.evaluate(() => { G.Main.continueGame(); G.UI.setSpeed(0); });
  const after = await page.evaluate(() => [...G.S.settlements.values()].flatMap(s => G.Urban.districtsOf(s).map(d => [d.id, d.name, d.k, d.born, d.cells.length, (d.hist || []).length])));
  const before = all.map(d => [d.id, d.name, d.k, d.born, d.cells, d.hist]);
  const lost = before.filter(b => !after.some(a => JSON.stringify(a) === JSON.stringify(b)));
  ok('2 nomes únicos e guardados no save', !dup.length && !lost.length && all.length > 0, `${all.length} bairros; repetidos: ${dup.map(t => t.name).join(', ') || 'nenhum'}; mudaram no save: ${lost.map(b => b[1]).join(', ') || 'nenhum'}`);
  // 3 the noble quarters' land is dearer
  const val = k => { const l = all.filter(d => d.k === k && d.st); return l.length ? l.reduce((n, d) => n + d.st.value, 0) / l.length : null; };
  const vn = val('nobre'), vp = val('popular'), vc = val('centro');
  ok('3 a terra vale mais no bairro nobre', vn === null || vp === null ? (vc !== null && vp !== null ? vc > vp : true) : vn > vp, `nobre ${vn === null ? '—' : Math.round(vn)}, centro ${vc === null ? '—' : Math.round(vc)}, popular ${vp === null ? '—' : Math.round(vp)}${vn === null ? ' (sem bairro nobre ainda)' : ''}`);
  // 4 more than one core gathers homes
  const big = A.towns.slice().sort((a, b) => b.pop - a.pop)[0];
  ok('4 a cidade cresce de vários núcleos', !!big && big.coreHomes.length >= 1, big ? `${big.name}: núcleos ${big.cores.join(', ')}; com casas em volta (além do fogo): ${big.coreHomes.join(', ') || 'nenhum'}` : 'nenhuma cidade');
  // 5 avenues, paved first
  const avT = A.towns.filter(t => t.av > 0);
  const avShare = avT.reduce((n, t) => n + t.avPaved, 0) / Math.max(1, avT.reduce((n, t) => n + t.av, 0)), sideShare = avT.reduce((n, t) => n + t.sidePaved, 0) / Math.max(1, avT.reduce((n, t) => n + t.side, 0));
  ok('5 avenidas ligam os núcleos e são calçadas primeiro', avT.length > 0 && avShare >= sideShare, `${avT.length} cidades com avenidas; calçadas: avenidas ${Math.round(avShare * 100)}%, ruas ${Math.round(sideShare * 100)}%`);
  // 6 dense heart, airy edge
  ok('6 o centro é denso, a borda tem espaço', !!big && big.inner > big.outer, big ? `${big.name}: ${big.inner.toFixed(1)} camas por quadra no centro, ${big.outer.toFixed(1)} na borda` : '—');
  // 7 the checker
  const B = await page.evaluate(() => QA.check().filter(x => x.sys === 'urb' && x.sev <= 3).map(x => x.sev + ' ' + x.msg));
  ok('7 o verificador não vê nada errado nos bairros', !A.check.length && !B.length, `antes: ${A.check.slice(0, 3).join('; ') || 'nada'} · depois do save: ${B.slice(0, 3).join('; ') || 'nada'}`);
  // the life of the towns, as the years left it (the counters are kept on the buildings and the peoples)
  const L = await page.evaluate(() => {
    for (let k = 0; k < 40; k++) G.debug.step(0.1); // (a save forgets the quarters' snapshot of the day: a few steps read the towns again)
    const S = G.S; const B = [...S.buildings.values()];
    const gar = B.filter(b => b.type === 'horta'); const tav = B.filter(b => b.type === 'taverna' && b.built);
    const cr = S.crimes || []; const st = {}; for (const c of cr) st[c.st] = (st[c.st] || 0) + 1;
    let imp = 0; for (const f of G.Fac.all()) imp += (f.eco && f.eco.imp) || 0;
    const docks = B.filter(b => b.type === 'doca' && b.built);
    // where the rich and the plain families sleep: the land value of their houses' patch, in every city
    let rv = 0, rn = 0, pv = 0, pn = 0, moves = 0;
    for (const v of S.villagers.values()) for (const m of v.moves || []) if (/comprou uma casa/.test(m[1])) moves++;
    for (const st of S.settlements.values()) {
      if ((st.tier || 0) < 3) continue; const sn = G.Urban.peek(st.id); if (!sn) continue;
      const who = new Map(); for (const v of S.villagers.values()) if (v.home && v.set === st.id) who.set(v.home, (who.get(v.home) || []).concat(v));
      for (const b of B) {
        if (b.set !== st.id || !b.built || !G.BDEF[b.type].housing || b.type === 'barraco' || !who.has(b.id)) continue;
        const [cx, cy] = G.Village.center(b); const o = sn.cells.get(G.Urban.cellOf(cx, cy)); if (!o) continue;
        const rich = b.elite || (b.coin || 0) >= 30 || who.get(b.id).some(v => v.grp === 'nobreza'); const plain = !rich && (b.coin || 0) < 10;
        if (rich) { rv += o.value; rn++; } else if (plain) { pv += o.value; pn++; }
      }
    }
    return { rich: rn ? rv / rn : null, rn, plain: pn ? pv / pn : null, pn, moves, gardens: gar.length, picked: gar.reduce((n, b) => n + (b.picked || 0), 0), food: gar.reduce((n, b) => n + (b.yield || 0), 0), taverns: tav.length, brewed: tav.reduce((n, b) => n + (b.brewed || 0), 0), served: tav.reduce((n, b) => n + (b.served || 0), 0), heavy: [...S.villagers.values()].filter(v => v.heavyN).length, imp, docks: docks.length, ware: B.filter(b => b.type === 'armazem' && b.built).length, crates: docks.reduce((n, b) => n + (b.crates || []).length, 0), crimes: cr.length, st };
  });
  ok('8 as hortas da borda foram cuidadas e colhidas', L.gardens === 0 || L.picked > 0, `${L.gardens} hortas; ${L.picked} colheitas, ${Math.round(L.food)} medidas de comida nas despensas`);
  ok('9 as tavernas serviram bebida', L.taverns === 0 || L.served > 0, `${L.taverns} tavernas; ${Math.round(L.brewed)} medidas feitas na casa, ${L.served} doses servidas; ${L.heavy} pessoas já beberam demais numa noite`);
  ok('10 a carga dos navios entrou pelo armazém', L.ware === 0 || L.imp > 0, `${L.docks} docas, ${L.ware} armazéns; ${Math.round(L.imp)} medidas importadas entraram no estoque; ${L.crates} caixas esperando nos cais agora`);
  const solved = L.crimes - (L.st.aberto || 0);
  ok('11 os roubos tiveram resposta', L.crimes < 3 || solved > 0, `${L.crimes} roubos guardados: ${Object.entries(L.st).map(([k, n]) => n + ' ' + k).join(', ') || 'nenhum'}`);
  ok('12 os ricos moram em terra mais cara', L.rich === null || L.plain === null || L.rich > L.plain, `casas ricas: ${L.rn} (terra ${L.rich === null ? '—' : Math.round(L.rich)}); simples: ${L.pn} (terra ${L.plain === null ? '—' : Math.round(L.plain)}); ${L.moves} famílias compraram uma casa em terra mais cara`);
  const news = await page.evaluate(() => G.S.history.filter(h => h.ic === 'city').slice(-8).map(h => h.d + ': ' + h.txt));
  console.log('  crônica: ' + news.join(' | ').slice(0, 900));
  for (const l of res) console.log(l);
  console.log(`fim em ${Math.round((Date.now() - t0) / 1000)} s; erros: ${errs.length ? [...new Set(errs)].slice(0, 6).join('\n  ') : 'nenhum'}`);
  await browser.close();
})();
