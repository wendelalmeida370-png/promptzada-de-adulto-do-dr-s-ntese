// quarteirao: node qa/quarteirao.js [mundo] — o quarteirão da metrópole (L-077), provocado de propósito no mundo pronto
// «metrópole» (worlds/metropole.js): a maior metrópole vive anos abençoados com pedra de sobra, e cada quarteirão que o
// planejador põe é fiscalizado na hora:
// 1 vai para terra cara o bastante (a de uma ínsula) e continua quarteirão; derruba só casas baixas, sobrados, hortas e
//   campos da própria cidade — nunca um prédio público, nunca as duas últimas fazendas nem o último campo de um tipo —
//   e traz mais camas do que tira;
// 2 quem morava nas casas derrubadas fica sem casa, mas as moedas da cidade não somem (vão no bolso do mais velho);
// 3 o verificador todo ano (o anel de passagem em volta de cada quarteirão fica livre);
// 4 um save no meio de uma obra: a obra volta igual;
// 5 um desalojado morre no meio, e o raio do deus cai na obra: o verificador não acha nada;
// 6 os anos passam: quarteirões prontos e morados.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const key = process.argv[2] || 'metropole';
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', key + '.js') });
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | ${name} | ${info}`); if (!cond) fails.push(name); };
  // the town, and the watch on every block the planner places
  const town = await page.evaluate(key => {
    G.Save.apply(JSON.parse(G.Ready.data[key])); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
    const S = G.S, V = G.Village;
    const set = [...S.settlements.values()].filter(s => (s.tier || 0) >= 4).sort((a, b) => V.pop(b.id) - V.pop(a.id))[0];
    if (!set) return null;
    const f = G.Fac.get(set.fac); if (!G.Civ.has(f.id, 'engenharia')) G.Civ.learn(f, 'engenharia', 'teste');
    const W = window.__Q = { set: set.id, log: [], bad: [], homeless: 0, people: [], blocks: 0 };
    const LOW = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, hut: 1, house: 1, sobrado: 1 };
    const KEEP = { farm: 2, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 };
    const money = () => { let n = 0; for (const b of G.S.buildings.values()) if (b.set === set.id) n += b.coin || 0; for (const v of G.S.villagers.values()) if (v.set === set.id) n += v.purse || 0; return Math.round(n * 100) / 100; };
    const count = t => { let n = 0; for (const b of G.S.buildings.values()) if (b.set === set.id && b.type === t) n++; return n; };
    const old = V.startProject;
    V.startProject = function (s, type, at) {
      if (type !== 'quarteirao' || s.id !== set.id) return old.apply(this, arguments);
      const S = G.S; const before = new Map([...S.buildings.values()].filter(b => b.set === set.id).map(b => [b.id, b]));
      const civic = new Set([...before.values()].filter(b => G.BDEF[b.type].civic).map(b => b.id));
      const m0 = money(); const fields0 = {}; for (const t in KEEP) fields0[t] = count(t);
      const homes0 = new Map([...S.villagers.values()].filter(v => v.set === set.id && v.home).map(v => [v.id, v.home]));
      const b = old.apply(this, arguments);
      if (!b) return b;
      const gone = [...before.values()].filter(o => !S.buildings.has(o.id));
      if (b.type !== 'quarteirao') { if (gone.length) W.bad.push(`virou ${b.type} e derrubou ${gone.map(o => o.type).join(', ')}`); return b; }
      W.blocks++;
      const val = G.Urban.valueAt(set, b.x + 1, b.y + 1);
      const beds = gone.reduce((n, o) => n + (G.BDEF[o.type].housing || 0), 0);
      W.log.push(`ano ${S.day}: terra ${val}, derrubou ${gone.map(o => o.type).join(', ') || 'nada'}`);
      if (val < G.Urban.DEAR.quarteirao) W.bad.push(`quarteirão em terra ${val}`);
      for (const o of gone) if (civic.has(o.id) || !LOW[o.type] || o.set !== set.id) W.bad.push(`derrubou ${o.type}#${o.id}`);
      if (beds > 24) W.bad.push(`tirou ${beds} camas`);
      for (const t in KEEP) { const n = count(t); if (fields0[t] && n < Math.min(fields0[t], KEEP[t])) W.bad.push(`o último campo: ${t} ${fields0[t]} → ${n}`); }
      if (Math.abs(money() - m0) > 0.01) W.bad.push(`moedas ${m0} → ${money()}`);
      const wasHome = new Set(gone.map(o => o.id));
      const out = [...homes0].filter(([, h]) => wasHome.has(h)).map(([id]) => S.villagers.get(id)).filter(Boolean);
      for (const v of out) if (v.home) W.bad.push(`${v.name} ainda mora na casa derrubada`);
      W.homeless += out.length; W.people.push(...out.map(v => v.id));
      return b;
    };
    return `${set.name} (nível ${set.tier}, ${V.pop(set.id)} almas)`;
  }, key);
  if (!town) { ok('0 uma metrópole no mundo pronto', false, 'nenhuma cidade de nível 4'); }
  else {
    // ---- the bad case on purpose: a family, with its savings, lives where the next block will stand
    const p0 = await page.evaluate(() => {
      const S = G.S, V = G.Village, W = __Q; const set = S.settlements.get(W.set);
      const f = G.Fac.get(set.fac); f.stock.stone = Math.max(f.stock.stone, 200); f.stock.wood = Math.max(f.stock.wood, 120);
      // (a place wholly under a field has no ground for the house: that block goes up as it is, and the next place is taken)
      let pos = null, gone = [], house = null, fam = 0, lived = false;
      for (let k = 0; k < 4 && !house && !lived; k++) {
        set._noSite = {}; pos = V.blockSite(set); if (!pos) return { none: 'nenhum lugar para um quarteirão' };
        gone = pos.demolish || []; lived = gone.some(id => [...S.villagers.values()].some(v => v.home === id));
        if (lived) break;
        for (let ty = pos[1]; ty < pos[1] + 2 && !house; ty++) for (let tx = pos[0]; tx < pos[0] + 2 && !house; tx++) if (!S.occ[ty * G.N + tx]) house = V.addBuilding('house', tx, ty, set.id, true);
        if (!house) V.startProject(set, 'quarteirao', pos);
      }
      if (!house && !lived) return { none: 'nenhum lugar de quarteirão com chão livre para a casa' };
      if (house) {
        const head = [...S.villagers.values()].find(v => v.set === set.id && v.age >= 25 && !v.captive && !v.jail && !v.aboard && v.partner && S.villagers.get(v.partner));
        for (const v of [head, S.villagers.get(head.partner), ...(head.kids || []).map(id => S.villagers.get(id))]) if (v && v.set === set.id && (v === head || v.age < 16 || v.id === head.partner)) { v.home = house.id; fam++; }
        house.coin = 30;
      }
      const b = V.startProject(set, 'quarteirao', house ? Object.assign([pos[0], pos[1]], { demolish: gone.concat([house.id]) }) : pos);
      return { site: b && b.type === 'quarteirao' ? b.id : 0, fam, at: `${pos[0]},${pos[1]}` };
    });
    if (p0.none || !p0.site) ok('0 um quarteirão onde mora uma família', false, p0.none || 'o quarteirão não foi posto');
    else {
      // ---- 4: a save in the middle of the work
      const s = await page.evaluate(id => {
        const S = G.S, V = G.Village, W = __Q; const site = S.buildings.get(id); const need = JSON.stringify(site.need);
        G.Save.apply(JSON.parse(G.Save.serialize()));
        const b2 = G.S.buildings.get(id);
        const bad = QA.check().filter(q => q.sev <= 3 && (q.sys === 'city' || q.sys === 'urb')).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
        // ---- 5: one of the homeless dies, and the god's lightning strikes the site
        const dying = W.people.map(id => G.S.villagers.get(id)).find(v => v && !v.dead);
        if (dying) V.kill(dying, 'old');
        G.S.faith = 1e6; let fire = false; try { fire = !!G.Powers.cast('lightning', b2.x + 1, b2.y + 1); } catch (e) { fire = 'erro ' + e.message; }
        return { back: !!(b2 && b2.type === 'quarteirao' && !b2.built && JSON.stringify(b2.need) === need), bad, fire, died: !!dying };
      }, p0.site);
      ok('4 um save no meio da obra', s.back && !s.bad.length, `${s.back ? 'a obra voltou igual' : 'a obra não voltou'}${s.bad.length ? '; ' + s.bad.slice(0, 3).join(' | ') : ''}`);
      // ---- 1 + 2 + 3 + 5: blessed years with stone to spare, the checker every year, and every block the planner places watched
      const a = await page.evaluate(() => {
        const S = G.S, W = __Q; const set = S.settlements.get(W.set); const viol = [];
        const bad = () => QA.check().filter(q => q.sev <= 3 && (q.sys === 'city' || q.sys === 'urb' || q.sys === 'map' || q.sys === 'reach')).map(q => `ano ${S.day}: S${q.sev} ${q.sys} ${q.msg}`);
        viol.push(...bad());
        G.Skip.on = true; S.blessed = true; const d0 = S.day;
        try {
          while (S.day < d0 + 12) {
            const d = S.day; while (S.day === d) { G.Main.skipStep(1); S.divinePeace = Math.max(S.divinePeace || 0, 100); S.weather.fertility = Math.max(S.weather.fertility || 0, 100); }
            const f = set && G.Fac.get(set.fac); if (f) { f.stock.stone = Math.max(f.stock.stone, 200); f.stock.wood = Math.max(f.stock.wood, 120); }
            viol.push(...bad());
          }
        } finally { G.Skip.on = false; S.blessed = false; }
        return { day: S.day, viol, mods: Object.keys(G.modErr || {}).length, log: W.log, wbad: W.bad, homeless: W.homeless, blocks: W.blocks };
      });
      console.log(`  ${town}: família de ${p0.fam} no lugar ${p0.at}; ${a.blocks} quarteirões até o ano ${a.day}: ${a.log.join(' | ')}`);
      const rule = a.wbad.filter(x => !/moedas|ainda mora/.test(x)), home = a.wbad.filter(x => /moedas|ainda mora/.test(x));
      ok('1 cada quarteirão em terra cara, derrubando só o que pode', a.blocks >= 2 && !rule.length, `${a.blocks} quarteirões${rule.length ? '; ' + rule.slice(0, 4).join(' | ') : ''}`);
      ok('2 os desalojados sem casa, as moedas guardadas', a.homeless > 0 && !home.length, `${a.homeless} desalojados${home.slice(0, 3).map(x => '; ' + x).join('')}`);
      ok('3 o verificador todo ano (o anel dos quarteirões livre)', !a.viol.length && !a.mods, `até o ano ${a.day}${a.viol.length ? '; ' + a.viol.slice(0, 3).join(' | ') : ': nada'}${a.mods ? '; erro de módulo' : ''}`);
      ok('5 um desalojado morre, um raio cai na obra', s.fire === true && s.died && !a.viol.length && !a.mods, `raio ${s.fire}, morte ${s.died}`);
    }
    // ---- 6: blocks built and lived in
    const e = await page.evaluate(() => {
      const S = G.S, W = __Q; const set = S.settlements.get(W.set);
      const blocks = [...S.buildings.values()].filter(b => b.type === 'quarteirao' && b.set === set.id); const built = blocks.filter(b => b.built);
      let res = 0; for (const v of S.villagers.values()) if (built.some(b => b.id === v.home)) res++;
      return { n: blocks.length, built: built.length, res, tier: set.tier };
    });
    ok('6 os anos passam: quarteirões prontos e morados', e.built >= 1 && e.res >= 1, `${e.n} quarteirões (${e.built} prontos, ${e.res} moradores) — nível ${e.tier}`);
  }
  console.log(`erros: ${errs.length ? [...new Set(errs)].slice(0, 8).join('\n  ') : 'nenhum'}`);
  console.log(fails.length || errs.length ? `QUARTEIRAO: ${fails.length + errs.length} falha(s)` : 'QUARTEIRAO: ok');
  await browser.close();
  process.exit(fails.length || errs.length ? 1 : 0);
})();
