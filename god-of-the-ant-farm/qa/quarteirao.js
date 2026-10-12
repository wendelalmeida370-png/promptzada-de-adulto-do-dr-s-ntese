// quarteirao: node qa/quarteirao.js [mundo] — o quarteirão da metrópole (L-077), provocado de propósito no mundo pronto
// «metrópole» (worlds/metropole.js), onde o coração da cidade já está cheio:
// 1 pedido um quarteirão, ele vai para terra cara o bastante (a de uma ínsula), derrubando só casas baixas, sobrados e
//   hortas e campos da própria cidade — nunca um prédio público, nunca as duas últimas fazendas nem o último campo de
//   um tipo — e trazendo mais camas do que tira;
// 2 quem morava nas casas derrubadas fica sem casa, mas as moedas da família não somem (vão no bolso do mais velho);
// 3 o anel de passagem em volta do quarteirão fica livre (a invariante do verificador);
// 4 um save no meio da obra: a obra e os desalojados voltam iguais;
// 5 um desalojado morre no meio, e o raio do deus cai na obra: o verificador não acha nada;
// 6 os anos passam: o quarteirão fica pronto e tem moradores.
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
  const r = await page.evaluate(key => {
    G.Save.apply(JSON.parse(G.Ready.data[key])); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
    const V = G.Village; let S = G.S; const out = {};
    const bad = () => QA.check().filter(q => q.sev <= 3 && (q.sys === 'city' || q.sys === 'urb' || q.sys === 'map' || q.sys === 'reach')).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
    out.before = bad();
    // the biggest metropolis, with the art of building blocks and the stone for them
    const set = [...S.settlements.values()].filter(s => (s.tier || 0) >= 4).sort((a, b) => V.pop(b.id) - V.pop(a.id))[0];
    if (!set) return { none: true };
    const f = G.Fac.get(set.fac); if (!G.Civ.has(f.id, 'engenharia')) G.Civ.learn(f, 'engenharia', 'teste');
    f.stock.stone += 600; f.stock.wood += 400;
    out.town = `${set.name} (nível ${set.tier}, ${V.pop(set.id)} almas)`;
    const civic = new Set([...S.buildings.values()].filter(b => b.set === set.id && G.BDEF[b.type].civic).map(b => b.id));
    const mine = () => [...S.buildings.values()].filter(b => b.set === set.id);
    const money = () => { let n = 0; for (const b of mine()) n += b.coin || 0; for (const v of S.villagers.values()) if (v.set === set.id) n += v.purse || 0; return Math.round(n * 100) / 100; };
    const LOW = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1, hut: 1, house: 1, sobrado: 1 };
    // ---- 1 + 2 + 3: ask for blocks until one is placed by pulling down houses where families live (or five are placed)
    const fields0 = {}; for (const t of ['farm', 'pomar', 'plantacao', 'vinhedo', 'apiario']) fields0[t] = mine().filter(b => b.type === t).length;
    const tries = []; let renewed = null;
    for (let k = 0; k < 5 && !(renewed && renewed.people.length); k++) {
      const ids0 = new Map(mine().map(b => [b.id, b])); const m0 = money(); const homes0 = new Map([...S.villagers.values()].filter(v => v.set === set.id).map(v => [v.id, v.home]));
      set._noSite = {};
      const b = V.startProject(set, 'quarteirao');
      if (!b) { tries.push('sem lugar'); break; }
      const gone = [...ids0.values()].filter(o => !S.buildings.has(o.id));
      const val = G.Urban.valueAt(set, b.x + 1, b.y + 1);
      const beds = gone.reduce((n, o) => n + (G.BDEF[o.type].housing || 0), 0);
      tries.push(`${b.type} em ${b.x},${b.y} (terra ${val}), derrubou ${gone.map(o => o.type).join(', ') || 'nada'}`);
      out.wrongType = out.wrongType || (b.type !== 'quarteirao' ? b.type : null);
      out.cheap = out.cheap || (b.type === 'quarteirao' && val < G.Urban.DEAR.quarteirao ? val : null);
      for (const o of gone) { if (civic.has(o.id) || !LOW[o.type] || o.set !== set.id) out.wrongGone = `${o.type}#${o.id}`; }
      if (beds > 24) out.tooMany = beds;
      if (Math.abs(money() - m0) > 0.01) out.lost = `${m0} → ${money()}`;
      const wasHome = new Set(gone.map(o => o.id));
      const out1 = [...homes0].filter(([id, h]) => wasHome.has(h)).map(([id]) => S.villagers.get(id)).filter(Boolean);
      if (out1.some(v => v.home)) out.stillHome = out1.find(v => v.home).name;
      if (gone.length && (!renewed || out1.length)) renewed = { b, people: out1.map(v => v.id), gone: gone.length };
    }
    // (and never the town's last two farms, nor the last field of a kind: a city with no farm is a village again)
    const kinds = t => mine().filter(b => b.type === t).length;
    for (const t of ['farm', 'pomar', 'plantacao', 'vinhedo', 'apiario']) { const n = kinds(t), was = fields0[t]; if (was && n < Math.min(was, t === 'farm' ? 2 : 1)) out.lastField = `${t}: ${was} → ${n}`; }
    out.tries = tries; out.renewed = !!renewed; out.after = bad(); out.homeless = renewed ? renewed.people.length : 0;
    if (!renewed) return out;
    // ---- 4: a save in the middle of the work
    const site = renewed.b.id;
    const str = G.Save.serialize(); G.Save.apply(JSON.parse(str)); S = G.S;
    const b2 = S.buildings.get(site);
    out.saved = !!(b2 && b2.type === 'quarteirao' && !b2.built) && renewed.people.every(id => { const v = S.villagers.get(id); return !v || !v.home || v.home !== site; });
    out.afterSave = bad();
    // ---- 5: one of the homeless dies, and the god's lightning strikes the site
    const dying = renewed.people.map(id => S.villagers.get(id)).find(v => v && !v.dead);
    if (dying) V.kill(dying, 'old');
    S.faith = 1e6; let fire = false; try { fire = !!G.Powers.cast('lightning', b2.x + 1, b2.y + 1); } catch (e) { fire = 'erro ' + e.message; }
    out.fire = fire;
    // ---- 6: years go by (under a blessing, so it is the block and not a famine we are looking at)
    G.Skip.on = true; S.blessed = true; const d0 = S.day; const yearly = [];
    try { while (S.day < d0 + 8) { const d = S.day; while (S.day === d) { G.Main.skipStep(1); S.divinePeace = Math.max(S.divinePeace || 0, 100); } yearly.push(...bad().map(x => `ano ${S.day}: ${x}`)); } } finally { G.Skip.on = false; S.blessed = false; }
    out.yearly = yearly.slice(0, 6);
    const blocks = [...S.buildings.values()].filter(b => b.type === 'quarteirao' && b.set === set.id);
    const built = blocks.filter(b => b.built);
    let res = 0; for (const v of S.villagers.values()) if (built.some(b => b.id === v.home)) res++;
    out.blocks = `${blocks.length} quarteirões (${built.length} prontos, ${res} moradores) — nível ${set.tier}`;
    out.builtN = built.length; out.res = res; out.mods = Object.keys(G.modErr || {}).length;
    return out;
  }, key);
  if (r.none) { ok('0 uma metrópole no mundo pronto', false, 'nenhuma cidade de nível 4'); }
  else {
    console.log(`  ${r.town}: ${r.tries.join(' | ')}`);
    ok('1 o quarteirão vai para terra cara, derrubando só o que pode', r.renewed && !r.wrongType && !r.cheap && !r.wrongGone && !r.tooMany && !r.lastField, `${r.renewed ? 'renovou o centro' : 'não renovou'}${r.lastField ? '; o último campo: ' + r.lastField : ''}${r.wrongType ? '; virou ' + r.wrongType : ''}${r.cheap ? '; terra ' + r.cheap : ''}${r.wrongGone ? '; derrubou ' + r.wrongGone : ''}${r.tooMany ? '; tirou ' + r.tooMany + ' camas' : ''}`);
    ok('2 os desalojados sem casa, as moedas da família guardadas', !r.lost && !r.stillHome && r.homeless > 0, `${r.homeless} desalojados; ${r.lost ? 'moedas ' + r.lost : 'moedas iguais'}${r.stillHome ? '; ' + r.stillHome + ' ainda mora na casa derrubada' : ''}`);
    ok('3 o verificador antes e depois (o anel do quarteirão livre)', !r.after.length, `${r.before.length} antes; depois: ${r.after.length ? r.after.slice(0, 3).join(' | ') : 'nada'}`);
    if (r.renewed) {
      ok('4 um save no meio da obra', r.saved && !r.afterSave.length, `${r.saved ? 'a obra voltou igual' : 'a obra não voltou'}${r.afterSave.length ? '; ' + r.afterSave.slice(0, 3).join(' | ') : ''}`);
      ok('5 um desalojado morre, um raio cai na obra', r.fire === true && !r.yearly.length && !r.mods, `raio ${r.fire}${r.yearly.length ? '; ' + r.yearly.join(' | ') : ''}${r.mods ? '; erro de módulo' : ''}`);
      ok('6 os anos passam: o quarteirão pronto e morado', r.builtN >= 1 && r.res >= 1, r.blocks);
    }
  }
  console.log(`erros: ${errs.length ? [...new Set(errs)].slice(0, 8).join('\n  ') : 'nenhum'}`);
  console.log(fails.length || errs.length ? `QUARTEIRAO: ${fails.length + errs.length} falha(s)` : 'QUARTEIRAO: ok');
  await browser.close();
  process.exit(fails.length || errs.length ? 1 : 0);
})();
