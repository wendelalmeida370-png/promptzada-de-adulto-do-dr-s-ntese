// poderes: node qa/poderes.js [mundo] — os poderes novos (v30), provocados de propósito num mundo pronto
// (worlds/cidade.js; ou outro), cada um com os seus casos ruins:
// Chuva de Ouro
//  o1 as moedas caem, o povo corre e cata; toda moeda que caiu na rua está contada (catada, no chão, achada, perdida)
//  o2 um save no meio da chuva, carregado duas vezes: o mesmo futuro (e a chuva continua de onde parou)
//  o3 quem corria para o ouro morre no meio, o raio cai num monte, o chão de outro afunda no mar: nada se perde nem quebra
//  o4 um povo sem moeda: o ouro vai para o armazém, não para as casas
// Vinho nos Poços
//  v1 os poços dão vinho: o povo bebe, dança e fica bêbado — só nos poços da própria cidade
//  v2 um save no meio da festa, carregado duas vezes: o mesmo futuro
//  v3 quem bebia morre no poço, e o deus derruba o último poço: o vinho acaba, ninguém fica indo beber
//  v4 o dia seguinte: ressaca de quem bebeu demais
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const key = process.argv[2] || 'cidade';
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
  // the helpers every test uses: the ready world, steps of the world, the checker
  await page.evaluate(key => {
    window.__H = {
      fresh() { G.Save.apply(JSON.parse(G.Ready.data[key])); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true; G.S.faith = 999; },
      run(sec, each) { const S = G.S; const n = Math.round(sec / 0.05); for (let k = 0; k < n; k++) { G.debug.step(0.05); if (each) each(k); } return S.clock; },
      qa() { return QA.check().filter(e => e.sev <= 3); },
      town(test) { const V = G.Village; return [...G.S.settlements.values()].filter(s => !test || test(s)).sort((a, b) => V.pop(b.id) - V.pop(a.id))[0]; },
      wells: sid => [...G.S.buildings.values()].filter(b => b.type === 'well' && b.built && b.set === sid),
      tasks: type => [...G.S.villagers.values()].filter(v => v.task && v.task.type === type),
      // the state of the gifts and of the people near them, as a string: two futures that are the same give the same string
      digest(x, y) {
        const S = G.S; const g = S.gifts || {};
        const ppl = [...S.villagers.values()].filter(v => G.dist(v.x, v.y, x, y) < 20).map(v => `${v.id}:${v.x.toFixed(2)},${v.y.toFixed(2)}:${v.task ? v.task.type : '-'}:${(v.drinks || 0)}`).join(';');
        const coin = [...S.buildings.values()].filter(b => G.dist(b.x, b.y, x, y) < 20).map(b => `${b.id}:${(b.coin || 0).toFixed(2)}`).join(';');
        return JSON.stringify([g.piles, g.rains, g.wine]) + '|' + ppl + '|' + coin + '|' + S.rng;
      },
    };
  }, key);

  // ------------------------------ Chuva de Ouro ------------------------------
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); const f = G.Fac.get(set.fac); if (!G.Eco.coinage(f.id)) G.Civ.learn(f, 'moeda', 'teste');
      const ok = G.Powers.cast('goldrain', set.cx, set.cy); const rn = S.gifts && S.gifts.rains[0];
      let runners = 0; const seen = new Set();
      H.run(60, () => { const t = H.tasks('ouro'); runners = Math.max(runners, t.length); for (const v of t) seen.add(v.id); });
      const left = (S.gifts.piles || []).filter(q => q.rain === rn.id).reduce((a, q) => a + q.n, 0);
      const hands = Object.values(rn.got).reduce((a, b) => a + b, 0);
      const bio = Object.keys(rn.got).map(id => S.villagers.get(+id)).filter(v => v && (v.bio || []).some(e => /Chuva de Ouro/.test(e[2] || ''))).length;
      return { ok, set: set.name, street: rn.street, houses: rn.houses, n: rn.n, left, found: rn.found, sunk: rn.sunk, hands, runners, people: seen.size, ended: !S.gifts.rains.includes(rn), bio, qa: H.qa() };
    });
    ok('o1 chuva de ouro: o povo corre e cata', r.ok && r.street > 20 && r.people >= 3 && r.n > 0 && r.houses > 0, `${r.set}: ${r.street} moedas na rua, ${r.houses} nos telhados; ${r.people} pessoas correram (até ${r.runners} juntas), ${r.n} catadas`);
    ok('o1 toda moeda contada', Math.abs(r.street - (r.n + r.left + r.found + r.sunk)) < 0.01 && Math.abs(r.hands - r.n) < 0.01, `rua ${r.street} = catadas ${r.n} + chão ${r.left} + achadas ${r.found} + perdidas ${r.sunk}; mãos ${r.hands}`);
    ok('o1 a corrida termina com crônica e biografia', r.ended && r.bio >= 1, `terminou ${r.ended}, ${r.bio} biografia(s) do mais sortudo`);
    ok('o1 verificador', !r.qa.length, r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'limpo');
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); const f = G.Fac.get(set.fac); if (!G.Eco.coinage(f.id)) G.Civ.learn(f, 'moeda', 'teste');
      G.Powers.cast('goldrain', set.cx, set.cy);
      H.run(3);
      const save = G.Save.serialize(); const mid = S.gifts.piles.length;
      // (the promise of the game: the same save, loaded twice, lives the same future)
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      H.run(30); const a = H.digest(set.cx, set.cy); const mine = G.S.gifts.piles.length + ' no chão, ' + (G.S.history.some(e => /corrida do ouro/.test(e.txt)) ? 'corrida terminada' : 'corrida em curso');
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      H.run(30); const b = H.digest(set.cx, set.cy);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      return { same: a === b, mid, mine, len: a.length, at: k, ctx: a.slice(Math.max(0, k - 60), k + 60) + ' ≠ ' + b.slice(Math.max(0, k - 60), k + 60), qa: H.qa() };
    });
    ok('o2 save no meio da chuva: o mesmo futuro', r.same && /terminada/.test(r.mine) && !r.qa.length, r.same ? `${r.mid} montes no chão na hora do save; depois de carregar: ${r.mine}; futuro idêntico (${r.len} caracteres)` : `diferem no caractere ${r.at}: ${r.ctx}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; const T = G.T, W = G.W;
      const set = H.town(); const f = G.Fac.get(set.fac); if (!G.Eco.coinage(f.id)) G.Civ.learn(f, 'moeda', 'teste');
      G.Powers.cast('goldrain', set.cx, set.cy); const rn = S.gifts.rains[0];
      let died = null, bolt = null, sunk = null; const bad = [];
      H.run(40, k => {
        // the first one running for the gold dies on the way
        if (!died) { const v = H.tasks('ouro').find(o => o.task.st === 1); if (v) { died = v.name; G.Village.kill(v, 'teste', true); } }
        // the god strikes one pile with lightning, and sinks the ground under another into the sea
        if (!bolt && rn.street > 20 && S.gifts.piles.length > 3) { const q = S.gifts.piles[0]; bolt = q.id; G.Powers.lightning(q.x, q.y); }
        if (!sunk && bolt && S.gifts.piles.length > 2) { const q = S.gifts.piles[S.gifts.piles.length - 1]; sunk = q.id; G.Powers.sink(q.x, q.y); }
        if (k % 20 === 0) { const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); }
      });
      const left = S.gifts.piles.filter(q => q.rain === rn.id).reduce((a, q) => a + q.n, 0);
      const onSea = S.gifts.piles.filter(q => S.type[W.idx(q.x, q.y)] < T.SAND).length;
      return { died, bolt, sunk, street: rn.street, n: rn.n, left, found: rn.found, sunk2: rn.sunk, onSea, bad, qa: H.qa() };
    });
    ok('o3 morte, raio e mar no meio da corrida', r.died && r.bolt && r.sunk && !r.onSea && !r.bad.length && !r.qa.length && Math.abs(r.street - (r.n + r.left + r.found + r.sunk2)) < 0.01,
      `morreu ${r.died}; raio no monte ${r.bolt}; chão afundado sob o monte ${r.sunk} (${r.sunk2} moedas perdidas no mar, ${r.onSea} montes na água); rua ${r.street} = ${r.n} + ${r.left} + ${r.found} + ${r.sunk2}; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); const f = G.Fac.get(set.fac);
      // (a people that does not know coins: the god's gold is metal for the store)
      if (G.Eco.coinage(f.id)) delete f.tech.known.moeda;
      const coin0 = [...S.buildings.values()].filter(b => b.set === set.id).reduce((a, b) => a + (b.coin || 0), 0);
      const ouro0 = f.stock.ouro || 0;
      G.Powers.cast('goldrain', set.cx, set.cy); const rn = S.gifts.rains[0];
      H.run(70);
      const coin1 = [...S.buildings.values()].filter(b => b.set === set.id).reduce((a, b) => a + (b.coin || 0), 0);
      return { coinage: G.Eco.coinage(f.id), houses: rn.houses, n: rn.n, ouro0, ouro1: f.stock.ouro || 0, coin0, coin1, qa: H.qa() };
    });
    ok('o4 povo sem moeda: o ouro vai ao armazém', !r.coinage && r.houses === 0 && r.n > 0 && r.ouro1 > r.ouro0 && r.coin1 <= r.coin0 + 0.01 && !r.qa.length, `${r.n} moedas catadas; ouro no armazém ${r.ouro0.toFixed(1)} → ${r.ouro1.toFixed(1)}; moedas nas casas ${r.coin0.toFixed(1)} → ${r.coin1.toFixed(1)}`);
  }

  // ------------------------------ Vinho nos Poços ------------------------------
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(s => H.wells(s.id).length); if (!set) return null;
      const ok = G.Powers.cast('winewell', set.cx, set.cy);
      const again = G.Powers.canCast('winewell', set.cx, set.cy); const why = G.Powers.why;
      let maxDrunk = 0, dancers = 0; const drank = new Set(); const foreign = [];
      H.run(90, () => {
        let d = 0; for (const v of S.villagers.values()) { if (v.drunk > S.clock) d++; const t = v.task; if (t && t.type === 'vinho') { if (t.st === 3) dancers = Math.max(dancers, 1 + dancers * 0); const b = S.buildings.get(t.id); if (b && b.set !== v.set) foreign.push(v.name); if (t.st === 3) drank.add(v.id); } }
        maxDrunk = Math.max(maxDrunk, d);
      });
      return { ok, again, why, set: set.name, wells: H.wells(set.id).length, maxDrunk, drank: drank.size, foreign: foreign.length, qa: H.qa() };
    });
    if (!r) ok('v1 vinho nos poços', false, 'nenhuma cidade com poço neste mundo');
    else {
      ok('v1 vinho nos poços: bebem, dançam, cambaleiam', r.ok && r.drank >= 4 && r.maxDrunk >= 4 && !r.foreign, `${r.set} (${r.wells} poço${r.wells > 1 ? 's' : ''}): ${r.drank} beberam e dançaram, até ${r.maxDrunk} bêbados juntos; ${r.foreign} num poço alheio`);
      ok('v1 um vinho por cidade', !r.again && /já dão vinho/.test(r.why), r.why);
      ok('v1 verificador', !r.qa.length, r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'limpo');
    }
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(s => H.wells(s.id).length); if (!set) return null;
      G.Powers.cast('winewell', set.cx, set.cy);
      H.run(12);
      const save = G.Save.serialize(); const mid = H.tasks('vinho').length;
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      H.run(30); const a = H.digest(set.cx, set.cy);
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      H.run(30); const b = H.digest(set.cx, set.cy);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      return { same: a === b, mid, len: a.length, at: k, ctx: a.slice(Math.max(0, k - 60), k + 60) + ' ≠ ' + b.slice(Math.max(0, k - 60), k + 60), qa: H.qa() };
    });
    if (r) ok('v2 save no meio da festa: o mesmo futuro', r.same && !r.qa.length, r.same ? `${r.mid} indo beber na hora do save; futuro idêntico (${r.len} caracteres)` : `diferem no caractere ${r.at}: ${r.ctx}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(s => H.wells(s.id).length); if (!set) return null;
      G.Powers.cast('winewell', set.cx, set.cy);
      let died = null, fell = 0; const bad = [];
      H.run(40, k => {
        if (!died) { const v = H.tasks('vinho').find(o => o.task.st === 2); if (v) { died = v.name; G.Village.kill(v, 'teste', true); } }
        // the god brings down every well of the town, one after the other
        if (died && !fell) { for (const b of H.wells(set.id)) G.Village.destroyBuilding(b, 'teste'); fell = 1; }
        if (k % 20 === 0) { const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); }
      });
      const going = H.tasks('vinho').filter(v => v.task.st < 3).length;
      return { died, fell, wine: (S.gifts.wine || []).length, going, bad, qa: H.qa() };
    });
    if (r) ok('v3 morte no poço e poços derrubados', r.died && r.fell && !r.wine && !r.going && !r.bad.length && !r.qa.length, `morreu ${r.died}; poços derrubados; vinhos ativos ${r.wine}; ainda indo beber ${r.going}; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(s => H.wells(s.id).length); if (!set) return null;
      const dev0 = [...S.villagers.values()].filter(v => v.set === set.id).reduce((a, v) => a + v.devotion, 0);
      G.Powers.cast('winewell', set.cx, set.cy);
      const day = S.day; H.run(G.DAY_LEN * 0.5 + 5);
      const heavy = [...S.villagers.values()].filter(v => v.set === set.id && v.drinks >= 3 && v.drinkDay === S.day).map(v => v.id);
      const wineOn = (S.gifts.wine || []).length;
      while (S.day === day) H.run(5);
      H.run(2);
      const hung = heavy.map(id => S.villagers.get(id)).filter(v => v && v.hang === S.day).length;
      const dev1 = [...S.villagers.values()].filter(v => v.set === set.id).reduce((a, v) => a + v.devotion, 0);
      return { heavy: heavy.length, hung, wineOn, dev0, dev1, sameDay: day, qa: H.qa() };
    });
    if (r) ok('v4 o dia seguinte: ressaca', !r.wineOn && r.heavy >= 1 && r.hung >= 1 && !r.qa.length, `${r.heavy} beberam demais no dia ${r.sameDay}; ${r.hung} acordaram de ressaca; vinho ainda correndo: ${r.wineOn}`);
  }

  ok('sem erros de página', !errs.length, errs.slice(0, 3).join(' | ') || 'nenhum');
  const modErr = await page.evaluate(() => JSON.stringify(G.modErr || {}));
  ok('sem erros de módulo', modErr === '{}' || modErr === '[]', modErr);
  console.log(fails.length ? `PODERES: ${fails.length} falha(s): ${fails.join(', ')}` : 'PODERES: ok');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
